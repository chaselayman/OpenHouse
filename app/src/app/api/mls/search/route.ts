import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  createBridgeClient,
  createDemoBridgeClient,
  BridgeSearchParams,
} from "@/lib/services/bridge";

export async function GET(request: NextRequest) {
  try {
    // Auth check
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

    // Parse search params from URL
    const searchParams = request.nextUrl.searchParams;

    const params: BridgeSearchParams = {
      top: Math.min(parseInt(searchParams.get("limit") || "50"), 100),
    };

    // Text search
    if (searchParams.get("q")) {
      params.q = searchParams.get("q")!;
    }

    // Status filter - default to Active
    const status = searchParams.getAll("status");
    if (status.length > 0) {
      params.status = status as BridgeSearchParams["status"];
    } else {
      params.status = ["Active"];
    }

    // Property type filter
    const type = searchParams.getAll("type");
    if (type.length > 0) {
      params.propertyType = type as BridgeSearchParams["propertyType"];
    }

    // Price range
    if (searchParams.get("minprice")) {
      params.minPrice = parseInt(searchParams.get("minprice")!);
    }
    if (searchParams.get("maxprice")) {
      params.maxPrice = parseInt(searchParams.get("maxprice")!);
    }

    // Beds/Baths
    if (searchParams.get("minbeds")) {
      params.minBeds = parseInt(searchParams.get("minbeds")!);
    }
    if (searchParams.get("maxbeds")) {
      params.maxBeds = parseInt(searchParams.get("maxbeds")!);
    }
    if (searchParams.get("minbaths")) {
      params.minBaths = parseInt(searchParams.get("minbaths")!);
    }

    // Area
    if (searchParams.get("minarea")) {
      params.minArea = parseInt(searchParams.get("minarea")!);
    }
    if (searchParams.get("maxarea")) {
      params.maxArea = parseInt(searchParams.get("maxarea")!);
    }

    // Location filters
    const cities = searchParams.getAll("cities");
    if (cities.length > 0) {
      params.cities = cities;
    }
    const postalCodes = searchParams.getAll("postalCodes");
    if (postalCodes.length > 0) {
      params.postalCodes = postalCodes;
    }
    if (searchParams.get("state")) {
      params.stateOrProvince = searchParams.get("state")!;
    }

    // Pagination
    if (searchParams.get("skip")) {
      params.skip = parseInt(searchParams.get("skip")!);
    }

    // Sorting
    if (searchParams.get("sort")) {
      params.orderBy = searchParams.get("sort")!;
    }

    // Use demo client if no credentials configured, otherwise use real credentials
    let client;
    try {
      client = createBridgeClient();
    } catch {
      // Fall back to demo client for development
      client = createDemoBridgeClient();
    }

    const result = await client.searchProperties(params);

    return NextResponse.json({
      listings: result.listings,
      totalCount: result.totalCount,
    });
  } catch (error) {
    console.error("MLS search error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to search MLS" },
      { status: 500 }
    );
  }
}
