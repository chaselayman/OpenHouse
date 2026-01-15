import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createGoogleCalendarClient, formatShowingEvent } from "@/lib/services/google-calendar";
import { createShowingTimeClient, createMockShowingTimeClient } from "@/lib/services/showingtime";

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
