import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createGoogleCalendarClient } from "@/lib/services/google-calendar";

/**
 * GET /api/integrations/google-calendar
 * Check Google Calendar connection status
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if integration exists in database
    const { data: integration } = await supabase
      .from("integrations")
      .select("*")
      .eq("agent_id", user.id)
      .eq("type", "google_calendar")
      .single();

    // Check if credentials are configured
    const hasCredentials = !!(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      process.env.GOOGLE_CALENDAR_ID
    );

    return NextResponse.json({
      connected: integration?.status === "connected",
      hasCredentials,
      integration,
    });
  } catch (error) {
    console.error("Check Google Calendar status error:", error);
    return NextResponse.json(
      { error: "Failed to check integration status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations/google-calendar
 * Connect Google Calendar (test connection and save status)
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if credentials are configured
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!clientEmail || !privateKey || !calendarId) {
      return NextResponse.json(
        {
          error: "Google Calendar credentials not configured",
          details:
            "Please configure GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, and GOOGLE_CALENDAR_ID in your environment variables.",
        },
        { status: 400 }
      );
    }

    // Test the connection by creating a calendar client
    const calendarClient = createGoogleCalendarClient();

    if (!calendarClient) {
      return NextResponse.json(
        { error: "Failed to create Google Calendar client" },
        { status: 500 }
      );
    }

    // Test by fetching upcoming events (will throw if credentials are invalid)
    try {
      await calendarClient.getUpcomingEvents(1);
    } catch (testError) {
      console.error("Google Calendar test failed:", testError);
      return NextResponse.json(
        {
          error: "Failed to connect to Google Calendar",
          details:
            testError instanceof Error
              ? testError.message
              : "Invalid credentials or calendar access denied",
        },
        { status: 400 }
      );
    }

    // Upsert integration record
    const { data: integration, error } = await supabase
      .from("integrations")
      .upsert(
        {
          agent_id: user.id,
          type: "google_calendar",
          status: "connected",
          connected_at: new Date().toISOString(),
          settings: {
            calendarId,
            serviceAccountEmail: clientEmail,
          },
        },
        {
          onConflict: "agent_id,type",
        }
      )
      .select()
      .single();

    if (error) {
      // If upsert fails due to missing constraint, try insert/update
      const { data: existing } = await supabase
        .from("integrations")
        .select("id")
        .eq("agent_id", user.id)
        .eq("type", "google_calendar")
        .single();

      if (existing) {
        // Update existing
        await supabase
          .from("integrations")
          .update({
            status: "connected",
            connected_at: new Date().toISOString(),
            settings: {
              calendarId,
              serviceAccountEmail: clientEmail,
            },
          })
          .eq("id", existing.id);
      } else {
        // Insert new
        await supabase.from("integrations").insert({
          agent_id: user.id,
          type: "google_calendar",
          status: "connected",
          connected_at: new Date().toISOString(),
          settings: {
            calendarId,
            serviceAccountEmail: clientEmail,
          },
        });
      }
    }

    return NextResponse.json({
      message: "Google Calendar connected successfully",
      connected: true,
    });
  } catch (error) {
    console.error("Connect Google Calendar error:", error);
    return NextResponse.json(
      {
        error: "Failed to connect Google Calendar",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/integrations/google-calendar
 * Disconnect Google Calendar
 */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await supabase
      .from("integrations")
      .update({
        status: "disconnected",
        connected_at: null,
      })
      .eq("agent_id", user.id)
      .eq("type", "google_calendar");

    return NextResponse.json({
      message: "Google Calendar disconnected",
      connected: false,
    });
  } catch (error) {
    console.error("Disconnect Google Calendar error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Google Calendar" },
      { status: 500 }
    );
  }
}
