import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  createShowingTimeClient,
  createMockShowingTimeClient,
  TimeSlot,
} from "@/lib/services/showingtime";
import {
  createGoogleCalendarClient,
  formatShowingEvent,
} from "@/lib/services/google-calendar";

// Buffer time in minutes between showings (agent travel time)
const SHOWING_BUFFER_MINUTES = 30;

interface AgentShowing {
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
}

/**
 * Check if a time slot conflicts with existing agent showings
 * Takes into account buffer time for travel between showings
 */
function isSlotAvailableForAgent(
  slot: TimeSlot,
  agentShowings: AgentShowing[],
  bufferMinutes: number = SHOWING_BUFFER_MINUTES
): boolean {
  const slotStart = new Date(`${slot.date}T${slot.time}`);
  const slotEnd = new Date(slotStart.getTime() + slot.duration * 60 * 1000);

  for (const showing of agentShowings) {
    // Skip cancelled showings
    if (showing.status === "cancelled") continue;

    const showingStart = new Date(`${showing.scheduled_date}T${showing.scheduled_time}`);
    const showingEnd = new Date(
      showingStart.getTime() + (showing.duration_minutes || 30) * 60 * 1000
    );

    // Add buffer time before and after the existing showing
    const bufferMs = bufferMinutes * 60 * 1000;
    const blockedStart = new Date(showingStart.getTime() - bufferMs);
    const blockedEnd = new Date(showingEnd.getTime() + bufferMs);

    // Check if there's any overlap
    if (slotStart < blockedEnd && slotEnd > blockedStart) {
      return false; // Conflict found
    }
  }

  return true; // No conflicts
}

/**
 * GET /api/showings/schedule?propertyId=xxx&startDate=xxx&endDate=xxx&agentId=xxx
 * Get available time slots for a property, filtered by agent availability
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const propertyId = request.nextUrl.searchParams.get("propertyId");
    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");
    const agentId = request.nextUrl.searchParams.get("agentId");

    if (!propertyId) {
      return NextResponse.json(
        { error: "propertyId is required" },
        { status: 400 }
      );
    }

    // Default to next 7 days if not specified
    const start = startDate || new Date().toISOString().split("T")[0];
    const end =
      endDate ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Get property details (including agent_id)
    const { data: property } = await supabase
      .from("properties")
      .select("mls_id, address, agent_id")
      .eq("id", propertyId)
      .single();

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Use the property's agent or the provided agentId
    const effectiveAgentId = agentId || property.agent_id;

    // Get ShowingTime availability (listing availability)
    const showingTime = createShowingTimeClient() || createMockShowingTimeClient();
    const showingTimeSlots = await showingTime.getAvailability(
      property.mls_id || propertyId,
      start,
      end
    );

    // Get agent's existing showings in the date range
    const { data: agentShowings } = await supabase
      .from("showings")
      .select("scheduled_date, scheduled_time, duration_minutes, status")
      .eq("agent_id", effectiveAgentId)
      .gte("scheduled_date", start)
      .lte("scheduled_date", end)
      .neq("status", "cancelled");

    // Filter slots to only include those where:
    // 1. ShowingTime says the property is available
    // 2. Agent doesn't have a conflicting showing (with buffer time)
    const availableSlots = showingTimeSlots.filter((slot) => {
      // Skip if ShowingTime says unavailable
      if (!slot.available) return false;

      // Check if agent is available (with buffer time for travel)
      return isSlotAvailableForAgent(
        slot,
        agentShowings || [],
        SHOWING_BUFFER_MINUTES
      );
    });

    // Also return unavailable slots marked as such for UI purposes
    const allSlots = showingTimeSlots.map((slot) => {
      const showingTimeAvailable = slot.available;
      const agentAvailable = isSlotAvailableForAgent(
        slot,
        agentShowings || [],
        SHOWING_BUFFER_MINUTES
      );

      return {
        ...slot,
        available: showingTimeAvailable && agentAvailable,
        // Include reason for unavailability (helpful for debugging/UI)
        unavailableReason: !showingTimeAvailable
          ? "listing_unavailable"
          : !agentAvailable
          ? "agent_conflict"
          : undefined,
      };
    });

    return NextResponse.json({
      propertyId,
      propertyAddress: property.address,
      startDate: start,
      endDate: end,
      slots: allSlots,
      bufferMinutes: SHOWING_BUFFER_MINUTES,
      agentShowingsCount: agentShowings?.length || 0,
    });
  } catch (error) {
    console.error("Get availability error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get availability" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/showings/schedule
 * Request a new showing appointment
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId, clientId, date, time, notes } = body;

    if (!propertyId || !clientId || !date || !time) {
      return NextResponse.json(
        { error: "propertyId, clientId, date, and time are required" },
        { status: 400 }
      );
    }

    // Get property and client details
    const [propertyResult, clientResult, agentResult] = await Promise.all([
      supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .eq("agent_id", user.id)
        .single(),
      supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .eq("agent_id", user.id)
        .single(),
      supabase.from("agents").select("*").eq("id", user.id).single(),
    ]);

    if (!propertyResult.data) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    if (!clientResult.data) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const property = propertyResult.data;
    const client = clientResult.data;
    const agent = agentResult.data;

    // Check agent availability before booking
    const showingDuration = 30; // Default showing duration in minutes
    const { data: conflictingShowings } = await supabase
      .from("showings")
      .select("scheduled_date, scheduled_time, duration_minutes, status")
      .eq("agent_id", user.id)
      .eq("scheduled_date", date)
      .neq("status", "cancelled");

    // Create a slot object to check availability
    const requestedSlot: TimeSlot = {
      date,
      time,
      available: true,
      duration: showingDuration,
    };

    if (!isSlotAvailableForAgent(requestedSlot, conflictingShowings || [], SHOWING_BUFFER_MINUTES)) {
      return NextResponse.json(
        {
          error: "Time slot unavailable",
          details: `You have another showing within ${SHOWING_BUFFER_MINUTES} minutes of this time. Please select a different time to allow for travel between showings.`,
        },
        { status: 409 }
      );
    }

    // Request showing via ShowingTime (mock for now)
    const showingTime = createShowingTimeClient() || createMockShowingTimeClient();
    const appointment = await showingTime.requestShowing({
      listingId: property.mls_id || propertyId,
      listingKey: property.mls_id || propertyId,
      requestedDate: date,
      requestedTime: time,
      buyerAgentId: user.id,
      buyerAgentName: agent?.full_name || "Agent",
      buyerAgentPhone: agent?.phone || "",
      buyerAgentEmail: agent?.email || user.email || "",
      buyerName: `${client.first_name} ${client.last_name}`,
      buyerPhone: client.phone || undefined,
      notes,
    });

    // Create showing record in our database
    // Database uses separate scheduled_date and scheduled_time fields
    const showingDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(showingDateTime.getTime() + 30 * 60 * 1000); // 30 min default

    const { data: showing, error: showingError } = await supabase
      .from("showings")
      .insert({
        agent_id: user.id,
        property_id: propertyId,
        client_id: clientId,
        scheduled_date: date,
        scheduled_time: time,
        duration_minutes: 30,
        status: "pending",
        notes,
        showingtime_id: appointment.appointmentId,
      })
      .select()
      .single();

    if (showingError) {
      throw showingError;
    }

    // Link showing to client_properties if not already linked
    // Status options: suggested, viewed, interested, rejected, toured
    const { data: existingLink } = await supabase
      .from("client_properties")
      .select("id")
      .eq("client_id", clientId)
      .eq("property_id", propertyId)
      .single();

    if (!existingLink) {
      await supabase.from("client_properties").insert({
        client_id: clientId,
        property_id: propertyId,
        status: "interested", // They're scheduling a showing, so they're interested
      });
    }

    // Create Google Calendar event and send invites
    let calendarEvent = null;
    const googleCalendar = createGoogleCalendarClient();

    if (googleCalendar && client.email) {
      try {
        const eventData = formatShowingEvent({
          property: {
            address: property.address,
            city: property.city,
            state: property.state,
            zip: property.zip,
            price: property.price,
            beds: property.beds,
            baths: property.baths,
          },
          client: {
            firstName: client.first_name,
            lastName: client.last_name,
            email: client.email,
            phone: client.phone,
          },
          agent: {
            name: agent?.full_name || "Agent",
            email: agent?.email || user.email || "",
            phone: agent?.phone,
          },
          scheduledAt: showingDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          notes,
        });

        calendarEvent = await googleCalendar.createShowingEvent(eventData);

        // Update showing with calendar event ID
        await supabase
          .from("showings")
          .update({ calendar_event_id: calendarEvent.eventId })
          .eq("id", showing.id);
      } catch (calendarError) {
        console.error("Failed to create calendar event:", calendarError);
        // Don't fail the whole request if calendar fails
      }
    }

    return NextResponse.json({
      message: "Showing scheduled successfully",
      showing,
      showingTimeAppointment: appointment,
      calendarEvent,
    });
  } catch (error) {
    console.error("Schedule showing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to schedule showing" },
      { status: 500 }
    );
  }
}
