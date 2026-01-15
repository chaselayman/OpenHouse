import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Validate that the current session is still active
 * Returns kicked=true if another session has taken over
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
    const { sessionId } = body as { sessionId: string };

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get user's profile to check last_session_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("last_session_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    const isCurrentSession = profile?.last_session_id === sessionId;

    if (!isCurrentSession && profile?.last_session_id) {
      // This session has been kicked by a newer login
      return NextResponse.json({
        valid: false,
        kicked: true,
        message: "Your session was ended because you logged in from another device or browser.",
      });
    }

    // Update session activity
    await supabase
      .from("user_sessions")
      .update({ last_active_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("session_id", sessionId);

    return NextResponse.json({
      valid: true,
      kicked: false,
    });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Validation failed" },
      { status: 500 }
    );
  }
}
