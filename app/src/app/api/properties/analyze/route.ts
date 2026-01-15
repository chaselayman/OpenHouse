import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  analyzeProperty,
  PropertyForAnalysis,
  needsAnalysis,
} from "@/lib/services/ai-analysis";

/**
 * POST /api/properties/analyze
 * Analyze a single property or batch of properties
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
    const { propertyIds, force = false } = body as {
      propertyIds: string[];
      force?: boolean;
    };

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return NextResponse.json(
        { error: "propertyIds array is required" },
        { status: 400 }
      );
    }

    if (propertyIds.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 properties can be analyzed at once" },
        { status: 400 }
      );
    }

    // Fetch properties that belong to this user
    const { data: properties, error: fetchError } = await supabase
      .from("properties")
      .select("*")
      .eq("agent_id", user.id)
      .in("id", propertyIds);

    if (fetchError) {
      throw fetchError;
    }

    if (!properties || properties.length === 0) {
      return NextResponse.json(
        { error: "No properties found" },
        { status: 404 }
      );
    }

    const results: {
      propertyId: string;
      success: boolean;
      score?: number;
      error?: string;
    }[] = [];

    // Analyze each property
    for (const property of properties) {
      // Skip if recently analyzed (unless force=true)
      if (!force && !needsAnalysis(property.analyzed_at, property.updated_at)) {
        results.push({
          propertyId: property.id,
          success: true,
          score: property.ai_score,
        });
        continue;
      }

      try {
        const propertyData: PropertyForAnalysis = {
          address: property.address,
          city: property.city,
          state: property.state,
          zip: property.zip,
          price: property.price,
          beds: property.beds,
          baths: property.baths,
          sqft: property.sqft,
          lot_size: property.lot_size,
          year_built: property.year_built,
          property_type: property.property_type,
          description: property.description,
          features: property.features,
          listing_agent_name: property.listing_agent_name,
        };

        const analysis = await analyzeProperty(propertyData);

        // Update property with analysis results
        const { error: updateError } = await supabase
          .from("properties")
          .update({
            ai_score: analysis.score,
            ai_analysis: analysis.analysis,
            red_flags: analysis.redFlags,
            highlights: analysis.highlights,
            analyzed_at: new Date().toISOString(),
          })
          .eq("id", property.id);

        if (updateError) {
          throw updateError;
        }

        results.push({
          propertyId: property.id,
          success: true,
          score: analysis.score,
        });
      } catch (error) {
        console.error(`Failed to analyze property ${property.id}:`, error);
        results.push({
          propertyId: property.id,
          success: false,
          error: error instanceof Error ? error.message : "Analysis failed",
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      message: `Analyzed ${successCount} of ${properties.length} properties`,
      results,
    });
  } catch (error) {
    console.error("Property analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/properties/analyze?id=xxx
 * Get analysis for a specific property
 */
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

    const propertyId = request.nextUrl.searchParams.get("id");

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    const { data: property, error } = await supabase
      .from("properties")
      .select("id, ai_score, ai_analysis, red_flags, highlights, analyzed_at")
      .eq("agent_id", user.id)
      .eq("id", propertyId)
      .single();

    if (error || !property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      propertyId: property.id,
      score: property.ai_score,
      analysis: property.ai_analysis,
      redFlags: property.red_flags,
      highlights: property.highlights,
      analyzedAt: property.analyzed_at,
    });
  } catch (error) {
    console.error("Get analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get analysis" },
      { status: 500 }
    );
  }
}
