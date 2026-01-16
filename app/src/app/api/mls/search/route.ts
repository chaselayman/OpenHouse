import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  createSimplyRetsClient,
  createDemoSimplyRetsClient,
  SimplyRetsSearchParams,
} from "@/lib/services/simplyrets";

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

    const params: SimplyRetsSearchParams = {
      limit: Math.min(parseInt(searchParams.get("limit") || "50"), 100),
    };

    // Text search (address, city, etc.)
    if (searchParams.get("q")) {
      params.q = searchParams.get("q")!;
    }

    // Status filter - default to Active
    const status = searchParams.get("status");
    if (status) {
      params.status = status as SimplyRetsSearchParams["status"];
    } else {
      params.status = "Active";
    }

    // Property type filter
    const type = searchParams.get("type");
    if (type) {
      params.type = type as SimplyRetsSearchParams["type"];
    }

    // Price range
    if (searchParams.get("minprice")) {
      params.minprice = parseInt(searchParams.get("minprice")!);
    }
    if (searchParams.get("maxprice")) {
      params.maxprice = parseInt(searchParams.get("maxprice")!);
    }

    // Beds/Baths
    if (searchParams.get("minbeds")) {
      params.minbeds = parseInt(searchParams.get("minbeds")!);
    }
    if (searchParams.get("maxbeds")) {
      params.maxbeds = parseInt(searchParams.get("maxbeds")!);
    }
    if (searchParams.get("minbaths")) {
      params.minbaths = parseInt(searchParams.get("minbaths")!);
    }

    // Area (sqft)
    if (searchParams.get("minarea")) {
      params.minarea = parseInt(searchParams.get("minarea")!);
    }
    if (searchParams.get("maxarea")) {
      params.maxarea = parseInt(searchParams.get("maxarea")!);
    }

    // Year built
    if (searchParams.get("minyear")) {
      params.minyear = parseInt(searchParams.get("minyear")!);
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
    const counties = searchParams.getAll("counties");
    if (counties.length > 0) {
      params.counties = counties;
    }

    // Pagination
    if (searchParams.get("offset")) {
      params.offset = parseInt(searchParams.get("offset")!);
    }

    // Sorting (e.g., "-listprice" for descending, "listprice" for ascending)
    if (searchParams.get("sort")) {
      params.sort = searchParams.get("sort")!;
    }

    // Use real client if credentials configured, otherwise demo
    const client = createSimplyRetsClient() || createDemoSimplyRetsClient();

    // Search and normalize results
    const listings = await client.search(params);

    return NextResponse.json({
      listings,
      count: listings.length,
      params: {
        ...params,
        usingDemo: !createSimplyRetsClient(),
      },
    });
  } catch (error) {
    console.error("MLS search error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to search MLS" },
      { status: 500 }
    );
  }
}
