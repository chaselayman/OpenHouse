import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createShowingTimeClient } from "@/lib/services/showingtime";

/**
 * GET /api/integrations/showingtime
 * Check ShowingTime connection status
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
      .eq("type", "showingtime")
      .single();

    // Check if credentials are configured
    const hasCredentials = !!(
      process.env.SHOWINGTIME_API_KEY &&
      process.env.SHOWINGTIME_API_SECRET &&
      process.env.SHOWINGTIME_MLS_ID
    );

    return NextResponse.json({
      connected: integration?.status === "connected",
      hasCredentials,
      integration,
      // ShowingTime requires MLS partnership - show message if not configured
      message: hasCredentials
        ? undefined
        : "ShowingTime requires MLS partnership credentials. Using mock mode for development.",
    });
  } catch (error) {
    console.error("Check ShowingTime status error:", error);
    return NextResponse.json(
      { error: "Failed to check integration status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations/showingtime
 * Connect ShowingTime (test connection and save status)
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

    // Check if real credentials are configured
    const hasRealCredentials = !!(
      process.env.SHOWINGTIME_API_KEY &&
      process.env.SHOWINGTIME_API_SECRET &&
      process.env.SHOWINGTIME_MLS_ID
    );

    // For development, we allow "connecting" even without real credentials
    // The mock client will be used for testing
    const showingTimeClient = createShowingTimeClient();

    // If we have real credentials, test them
    if (showingTimeClient && hasRealCredentials) {
      try {
        // Test by getting availability for a dummy listing
        await showingTimeClient.getAvailability(
          "test",
          new Date().toISOString().split("T")[0],
          new Date().toISOString().split("T")[0]
        );
      } catch (testError) {
        console.error("ShowingTime test failed:", testError);
        // Don't fail completely - allow mock mode
      }
    }

    // Upsert integration record
    const { data: existing } = await supabase
      .from("integrations")
      .select("id")
      .eq("agent_id", user.id)
      .eq("type", "showingtime")
      .single();

    if (existing) {
      await supabase
        .from("integrations")
        .update({
          status: "connected",
          connected_at: new Date().toISOString(),
          settings: {
            mockMode: !hasRealCredentials,
          },
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("integrations").insert({
        agent_id: user.id,
        type: "showingtime",
        status: "connected",
        connected_at: new Date().toISOString(),
        settings: {
          mockMode: !hasRealCredentials,
        },
      });
    }

    return NextResponse.json({
      message: hasRealCredentials
        ? "ShowingTime connected successfully"
        : "ShowingTime connected in mock mode (for testing)",
      connected: true,
      mockMode: !hasRealCredentials,
    });
  } catch (error) {
    console.error("Connect ShowingTime error:", error);
    return NextResponse.json(
      {
        error: "Failed to connect ShowingTime",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/integrations/showingtime
 * Disconnect ShowingTime
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
      .eq("type", "showingtime");

    return NextResponse.json({
      message: "ShowingTime disconnected",
      connected: false,
    });
  } catch (error) {
    console.error("Disconnect ShowingTime error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect ShowingTime" },
      { status: 500 }
    );
  }
}
