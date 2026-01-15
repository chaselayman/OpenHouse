import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Register a new session for the authenticated user
 * This deactivates any existing sessions (single session per user)
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
    const { sessionId, deviceInfo } = body as {
      sessionId: string;
      deviceInfo?: string;
    };

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get client IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown";

    // Insert new session (trigger will deactivate old ones)
    const { error: insertError } = await supabase.from("user_sessions").insert({
      user_id: user.id,
      session_id: sessionId,
      device_info: deviceInfo || "unknown",
      ip_address: ip,
      is_active: true,
    });

    if (insertError) {
      // Check if it's a table doesn't exist error (migration not run yet)
      if (insertError.code === "42P01") {
        // Table doesn't exist yet, just update profile
        await supabase
          .from("profiles")
          .update({
            last_session_id: sessionId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        return NextResponse.json({
          success: true,
          sessionId,
          message: "Session registered (legacy mode)",
        });
      }
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      sessionId,
      message: "Session registered successfully",
    });
  } catch (error) {
    console.error("Session registration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to register session" },
      { status: 500 }
    );
  }
}
