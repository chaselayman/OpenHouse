import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  createSimplyRetsClient,
  createDemoSimplyRetsClient,
  NormalizedProperty,
} from "@/lib/services/simplyrets";
import { analyzeProperty, PropertyForAnalysis } from "@/lib/services/ai-analysis";

/**
 * Convert SimplyRETS normalized property to database format
 */
function convertToDbProperty(listing: NormalizedProperty, agentId: string) {
  return {
    agent_id: agentId,
    mls_id: listing.mls_id,
    address: listing.address,
    city: listing.city,
    state: listing.state,
    zip: listing.zip,
    price: listing.price,
    beds: listing.beds,
    baths: listing.baths,
    sqft: listing.sqft,
    lot_size: listing.lot_size,
    year_built: listing.year_built,
    property_type: listing.property_type,
    status: "active",
    description: listing.description,
    photos: listing.photos,
    highlights: listing.highlights,
    listing_url: listing.listing_url,
    listing_agent_name: listing.listing_agent,
    listing_office_name: listing.listing_office,
    latitude: listing.latitude,
    longitude: listing.longitude,
    virtual_tour_url: listing.virtual_tour_url,
    days_on_market: listing.days_on_market,
  };
}

/**
 * Import listings by MLS ID
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { mlsIds } = body as { mlsIds: string[] };

    if (!mlsIds || !Array.isArray(mlsIds) || mlsIds.length === 0) {
      return NextResponse.json(
        { error: "mlsIds array is required" },
        { status: 400 }
      );
    }

    if (mlsIds.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 listings can be imported at once" },
        { status: 400 }
      );
    }

    // Use real client if credentials configured, otherwise demo
    const client = createSimplyRetsClient() || createDemoSimplyRetsClient();

    // Fetch listings from SimplyRETS
    const listings: NormalizedProperty[] = [];
    const errors: { mlsId: string; error: string }[] = [];

    for (const mlsId of mlsIds) {
      try {
        const rawListing = await client.getListing(mlsId);
        const normalized = client.normalizeListing(rawListing);
        listings.push(normalized);
      } catch (error) {
        errors.push({
          mlsId,
          error: error instanceof Error ? error.message : "Failed to fetch listing",
        });
      }
    }

    if (listings.length === 0) {
      return NextResponse.json(
        { error: "No listings could be fetched", details: errors },
        { status: 400 }
      );
    }

    // Check for existing properties with same MLS IDs
    const mlsIdsToCheck = listings.map((l) => l.mls_id);
    const { data: existingProperties } = await supabase
      .from("properties")
      .select("mls_id")
      .eq("agent_id", user.id)
      .in("mls_id", mlsIdsToCheck);

    const existingMlsIds = new Set(existingProperties?.map((p) => p.mls_id) || []);

    // Filter out already imported listings
    const newListings = listings.filter((l) => !existingMlsIds.has(l.mls_id));

    if (newListings.length === 0) {
      return NextResponse.json({
        message: "All listings have already been imported",
        imported: 0,
        skipped: listings.length,
        errors,
      });
    }

    // Convert and insert properties
    const properties = newListings.map((listing) =>
      convertToDbProperty(listing, user.id)
    );

    const { data: insertedProperties, error: insertError } = await supabase
      .from("properties")
      .insert(properties)
      .select();

    if (insertError) {
      throw insertError;
    }

    // Trigger background AI analysis for imported properties (non-blocking)
    if (insertedProperties && insertedProperties.length > 0) {
      Promise.all(
        insertedProperties.map(async (prop) => {
          try {
            const propertyData: PropertyForAnalysis = {
              address: prop.address,
              city: prop.city,
              state: prop.state,
              zip: prop.zip,
              price: prop.price,
              beds: prop.beds,
              baths: prop.baths,
              sqft: prop.sqft,
              lot_size: prop.lot_size,
              year_built: prop.year_built,
              property_type: prop.property_type,
              description: prop.description,
              features: prop.highlights,
              listing_agent_name: prop.listing_agent_name,
            };

            const analysis = await analyzeProperty(propertyData);

            await supabase
              .from("properties")
              .update({
                ai_score: analysis.score,
                ai_analysis: analysis.analysis,
                red_flags: analysis.redFlags,
                highlights: analysis.highlights,
                analyzed_at: new Date().toISOString(),
              })
              .eq("id", prop.id);
          } catch (error) {
            console.error(`Auto-analysis failed for property ${prop.id}:`, error);
          }
        })
      ).catch((err) => console.error("Background analysis error:", err));
    }

    return NextResponse.json({
      message: `Successfully imported ${insertedProperties?.length || 0} properties`,
      imported: insertedProperties?.length || 0,
      skipped: listings.length - newListings.length,
      errors,
      properties: insertedProperties,
      analysisQueued: insertedProperties?.length || 0,
    });
  } catch (error) {
    console.error("MLS import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import listings" },
      { status: 500 }
    );
  }
}

/**
 * Bulk import from search results (import directly from normalized listing data)
 */
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { listings } = body as { listings: NormalizedProperty[] };

    if (!listings || !Array.isArray(listings) || listings.length === 0) {
      return NextResponse.json(
        { error: "listings array is required" },
        { status: 400 }
      );
    }

    if (listings.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 listings can be imported at once" },
        { status: 400 }
      );
    }

    // Check for existing properties with same MLS IDs
    const mlsIdsToCheck = listings.map((l) => l.mls_id);
    const { data: existingProperties } = await supabase
      .from("properties")
      .select("mls_id")
      .eq("agent_id", user.id)
      .in("mls_id", mlsIdsToCheck);

    const existingMlsIds = new Set(existingProperties?.map((p) => p.mls_id) || []);

    // Filter out already imported listings
    const newListings = listings.filter((l) => !existingMlsIds.has(l.mls_id));

    if (newListings.length === 0) {
      return NextResponse.json({
        message: "All listings have already been imported",
        imported: 0,
        skipped: listings.length,
      });
    }

    // Convert and insert properties
    const properties = newListings.map((listing) =>
      convertToDbProperty(listing, user.id)
    );

    const { data: insertedProperties, error: insertError } = await supabase
      .from("properties")
      .insert(properties)
      .select();

    if (insertError) {
      throw insertError;
    }

    // Trigger background AI analysis for imported properties (non-blocking)
    if (insertedProperties && insertedProperties.length > 0) {
      Promise.all(
        insertedProperties.map(async (prop) => {
          try {
            const propertyData: PropertyForAnalysis = {
              address: prop.address,
              city: prop.city,
              state: prop.state,
              zip: prop.zip,
              price: prop.price,
              beds: prop.beds,
              baths: prop.baths,
              sqft: prop.sqft,
              lot_size: prop.lot_size,
              year_built: prop.year_built,
              property_type: prop.property_type,
              description: prop.description,
              features: prop.highlights,
              listing_agent_name: prop.listing_agent_name,
            };

            const analysis = await analyzeProperty(propertyData);

            await supabase
              .from("properties")
              .update({
                ai_score: analysis.score,
                ai_analysis: analysis.analysis,
                red_flags: analysis.redFlags,
                highlights: analysis.highlights,
                analyzed_at: new Date().toISOString(),
              })
              .eq("id", prop.id);
          } catch (error) {
            console.error(`Auto-analysis failed for property ${prop.id}:`, error);
          }
        })
      ).catch((err) => console.error("Background analysis error:", err));
    }

    return NextResponse.json({
      message: `Successfully imported ${insertedProperties?.length || 0} properties`,
      imported: insertedProperties?.length || 0,
      skipped: listings.length - newListings.length,
      properties: insertedProperties,
      analysisQueued: insertedProperties?.length || 0,
    });
  } catch (error) {
    console.error("MLS bulk import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import listings" },
      { status: 500 }
    );
  }
}
