import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Validate that a license number is available (not used by another account)
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

    const body = await request.json();
    const { licenseNumber, userId } = body as {
      licenseNumber: string;
      userId?: string;
    };

    if (!licenseNumber || licenseNumber.trim() === "") {
      return NextResponse.json({ available: true });
    }

    // Check if license number is already in use by another user
    let query = supabase
      .from("profiles")
      .select("id, full_name")
      .eq("license_number", licenseNumber.trim());

    // If userId is provided, exclude that user (for profile updates)
    if (userId) {
      query = query.neq("id", userId);
    }

    const { data: existingProfiles, error } = await query;

    if (error) {
      throw error;
    }

    const isAvailable = !existingProfiles || existingProfiles.length === 0;

    return NextResponse.json({
      available: isAvailable,
      message: isAvailable
        ? "License number is available"
        : "This license number is already registered to another account",
    });
  } catch (error) {
    console.error("License validation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Validation failed" },
      { status: 500 }
    );
  }
}
