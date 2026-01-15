import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createGoogleCalendarClient, formatShowingEvent } from "@/lib/services/google-calendar";
import { createShowingTimeClient, createMockShowingTimeClient, TimeSlot } from "@/lib/services/showingtime";

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
 */
function isSlotAvailableForAgent(
  slot: TimeSlot,
  agentShowings: AgentShowing[],
  bufferMinutes: number = SHOWING_BUFFER_MINUTES
): boolean {
  const slotStart = new Date(`${slot.date}T${slot.time}`);
  const slotEnd = new Date(slotStart.getTime() + slot.duration * 60 * 1000);

  for (const showing of agentShowings) {
    if (showing.status === "cancelled") continue;

    const showingStart = new Date(`${showing.scheduled_date}T${showing.scheduled_time}`);
    const showingEnd = new Date(
      showingStart.getTime() + (showing.duration_minutes || 30) * 60 * 1000
    );

    // Add buffer time before and after the existing showing
    const bufferMs = bufferMinutes * 60 * 1000;
    const blockedStart = new Date(showingStart.getTime() - bufferMs);
    const blockedEnd = new Date(showingEnd.getTime() + bufferMs);

    if (slotStart < blockedEnd && slotEnd > blockedStart) {
      return false;
    }
  }

  return true;
}

/**
 * GET /api/client-portal/[token]/schedule?propertyId=xxx&date=xxx
 * Get available time slots for a specific date, filtered by agent availability
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const supabase = await createClient();
  const { token } = await params;
  const clientId = token;

  try {
    const propertyId = request.nextUrl.searchParams.get("propertyId");
    const date = request.nextUrl.searchParams.get("date");

    if (!propertyId) {
      return NextResponse.json(
        { error: "propertyId is required" },
        { status: 400 }
      );
    }

    // Verify client exists
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("agent_id")
      .eq("id", clientId)
      .eq("status", "active")
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Invalid client" },
        { status: 404 }
      );
    }

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("mls_id, address")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Default to selected date or next 7 days
    const startDate = date || new Date().toISOString().split("T")[0];
    const endDate = date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Get ShowingTime availability
    const showingTime = createShowingTimeClient() || createMockShowingTimeClient();
    const showingTimeSlots = await showingTime.getAvailability(
      property.mls_id || propertyId,
      startDate,
      endDate
    );

    // Get agent's existing showings
    const { data: agentShowings } = await supabase
      .from("showings")
      .select("scheduled_date, scheduled_time, duration_minutes, status")
      .eq("agent_id", client.agent_id)
      .gte("scheduled_date", startDate)
      .lte("scheduled_date", endDate)
      .neq("status", "cancelled");

    // Filter and mark slots based on availability
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
        unavailableReason: !showingTimeAvailable
          ? "listing_unavailable"
          : !agentAvailable
          ? "agent_busy"
          : undefined,
      };
    });

    return NextResponse.json({
      propertyId,
      propertyAddress: property.address,
      startDate,
      endDate,
      slots: allSlots,
      bufferMinutes: SHOWING_BUFFER_MINUTES,
    });
  } catch (error) {
    console.error("Get availability error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get availability" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const supabase = await createClient();
  const { token } = await params;
  const clientId = token;

  try {
    const { propertyId, date, time } = await request.json();

    if (!propertyId || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify client exists and is active
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*, agent:profiles!clients_agent_id_fkey(*)")
      .eq("id", clientId)
      .eq("status", "active")
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Invalid client" },
        { status: 404 }
      );
    }

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Check agent availability - prevent double-booking with buffer time
    const showingDuration = 30;
    const { data: conflictingShowings } = await supabase
      .from("showings")
      .select("scheduled_date, scheduled_time, duration_minutes, status")
      .eq("agent_id", client.agent_id)
      .eq("scheduled_date", date)
      .neq("status", "cancelled");

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
          details: `Your agent has another showing within ${SHOWING_BUFFER_MINUTES} minutes of this time. Please select a different time.`,
        },
        { status: 409 }
      );
    }

    // Request showing via ShowingTime (mock if no credentials)
    const agent = client.agent as { full_name: string; email: string; phone: string | null } | null;
    const showingTime = createShowingTimeClient() || createMockShowingTimeClient();
    const appointment = await showingTime.requestShowing({
      listingId: property.mls_id || property.id,
      listingKey: property.mls_id || property.id,
      requestedDate: date,
      requestedTime: time,
      buyerAgentId: client.agent_id,
      buyerAgentName: agent?.full_name || "Agent",
      buyerAgentPhone: agent?.phone || "",
      buyerAgentEmail: agent?.email || "",
      buyerName: client.full_name,
      buyerPhone: client.phone || undefined,
      notes: "Requested via client portal",
    });

    // Create showing record
    const { data: showing, error: showingError } = await supabase
      .from("showings")
      .insert({
        agent_id: client.agent_id,
        property_id: propertyId,
        client_id: clientId,
        scheduled_date: date,
        scheduled_time: time,
        duration_minutes: 30,
        status: "pending",
        showingtime_id: appointment.appointmentId,
        notes: "Scheduled by client via portal",
      })
      .select()
      .single();

    if (showingError) {
      throw showingError;
    }

    // Update client_properties status
    await supabase
      .from("client_properties")
      .update({ status: "interested" })
      .eq("client_id", clientId)
      .eq("property_id", propertyId);

    // Create Google Calendar event
    const googleCalendar = createGoogleCalendarClient();

    if (googleCalendar && client.email) {
      try {
        const showingDateTime = new Date(`${date}T${time}`);
        const endDateTime = new Date(showingDateTime.getTime() + 30 * 60 * 1000);

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
            firstName: client.full_name.split(" ")[0],
            lastName: client.full_name.split(" ").slice(1).join(" "),
            email: client.email,
            phone: client.phone,
          },
          agent: {
            name: agent?.full_name || "Agent",
            email: agent?.email || "",
            phone: agent?.phone || undefined,
          },
          scheduledAt: showingDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          notes: "Scheduled by client via portal",
        });

        const calendarEvent = await googleCalendar.createShowingEvent(eventData);

        await supabase
          .from("showings")
          .update({ calendar_event_id: calendarEvent.eventId })
          .eq("id", showing.id);
      } catch (calendarError) {
        console.error("Failed to create calendar event:", calendarError);
      }
    }

    return NextResponse.json({
      message: "Showing requested successfully",
      showing,
    });
  } catch (error) {
    console.error("Schedule showing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to schedule showing" },
      { status: 500 }
    );
  }
}
