import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  createBridgeClient,
  createDemoBridgeClient,
  BridgeListing,
  convertBridgeListingToProperty,
} from "@/lib/services/bridge";
import { analyzeProperty, PropertyForAnalysis } from "@/lib/services/ai-analysis";

/**
 * Import listings by ListingKey
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
    const { listingKeys } = body as { listingKeys: string[] };

    if (!listingKeys || !Array.isArray(listingKeys) || listingKeys.length === 0) {
      return NextResponse.json(
        { error: "listingKeys array is required" },
        { status: 400 }
      );
    }

    if (listingKeys.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 listings can be imported at once" },
        { status: 400 }
      );
    }

    // Use demo client if no credentials configured
    let client;
    try {
      client = createBridgeClient();
    } catch {
      client = createDemoBridgeClient();
    }

    // Fetch listings from Bridge API
    const listings: BridgeListing[] = [];
    const errors: { listingKey: string; error: string }[] = [];

    for (const listingKey of listingKeys) {
      try {
        const listing = await client.getProperty(listingKey);
        listings.push(listing);
      } catch (error) {
        errors.push({
          listingKey,
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
    const mlsIdsToCheck = listings.map((l) => l.ListingId || l.ListingKey);
    const { data: existingProperties } = await supabase
      .from("properties")
      .select("mls_id")
      .eq("agent_id", user.id)
      .in("mls_id", mlsIdsToCheck);

    const existingMlsIds = new Set(existingProperties?.map((p) => p.mls_id) || []);

    // Filter out already imported listings
    const newListings = listings.filter(
      (l) => !existingMlsIds.has(l.ListingId || l.ListingKey)
    );

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
      convertBridgeListingToProperty(listing, user.id)
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
      // Run analysis in background without awaiting
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
              features: prop.features,
              listing_agent_name: prop.listing_agent_name,
            };

            const analysis = await analyzeProperty(propertyData);

            // Update property with analysis
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
 * Bulk import from search results (import directly from listing data)
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
    const { listings } = body as { listings: BridgeListing[] };

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
    const mlsIdsToCheck = listings.map((l) => l.ListingId || l.ListingKey);
    const { data: existingProperties } = await supabase
      .from("properties")
      .select("mls_id")
      .eq("agent_id", user.id)
      .in("mls_id", mlsIdsToCheck);

    const existingMlsIds = new Set(existingProperties?.map((p) => p.mls_id) || []);

    // Filter out already imported listings
    const newListings = listings.filter(
      (l) => !existingMlsIds.has(l.ListingId || l.ListingKey)
    );

    if (newListings.length === 0) {
      return NextResponse.json({
        message: "All listings have already been imported",
        imported: 0,
        skipped: listings.length,
      });
    }

    // Convert and insert properties
    const properties = newListings.map((listing) =>
      convertBridgeListingToProperty(listing, user.id)
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
              features: prop.features,
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
