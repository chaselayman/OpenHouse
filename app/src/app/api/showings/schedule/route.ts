import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  createShowingTimeClient,
  createMockShowingTimeClient,
} from "@/lib/services/showingtime";
import {
  createGoogleCalendarClient,
  formatShowingEvent,
} from "@/lib/services/google-calendar";

/**
 * GET /api/showings/schedule?propertyId=xxx&startDate=xxx&endDate=xxx
 * Get available time slots for a property
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const propertyId = request.nextUrl.searchParams.get("propertyId");
    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");

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

    // Get property details
    const { data: property } = await supabase
      .from("properties")
      .select("mls_id, address")
      .eq("id", propertyId)
      .single();

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Use ShowingTime client (mock for now until credentials available)
    const showingTime = createShowingTimeClient() || createMockShowingTimeClient();
    const slots = await showingTime.getAvailability(
      property.mls_id || propertyId,
      start,
      end
    );

    return NextResponse.json({
      propertyId,
      propertyAddress: property.address,
      startDate: start,
      endDate: end,
      slots,
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
