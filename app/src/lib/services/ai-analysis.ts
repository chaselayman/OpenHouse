/**
 * AI Property Analysis Service
 * Uses Claude API to analyze property listings for red flags,
 * highlights, and overall investment/purchase suitability
 */

import Anthropic from "@anthropic-ai/sdk";

// Analysis result structure
export interface PropertyAnalysis {
  score: number; // 0-100 overall score
  redFlags: string[]; // Issues/concerns
  highlights: string[]; // Positive features
  analysis: {
    summary: string;
    priceAnalysis: string;
    locationNotes: string;
    conditionAssessment: string;
    investmentPotential: string;
    recommendations: string[];
  };
}

// Property data for analysis
export interface PropertyForAnalysis {
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number | null;
  lot_size: number | null;
  year_built: number | null;
  property_type: string;
  description: string | null;
  features: string[] | null;
  listing_agent_name: string | null;
}

// Red flags categories we look for
const RED_FLAG_CATEGORIES = [
  "Foundation/structural issues",
  "Water damage/flooding risk",
  "Roof problems",
  "Outdated electrical/plumbing",
  "Environmental hazards (mold, asbestos, radon)",
  "HOA issues or high fees",
  "Zoning restrictions",
  "Title/legal issues",
  "Overpriced for market",
  "Deferred maintenance",
  "Unusual listing language (motivated seller, as-is, etc.)",
  "Short time on market with price drops",
  "Property flipping concerns",
];

/**
 * Create an Anthropic client
 */
function createAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY not configured. Add it to your environment variables."
    );
  }

  return new Anthropic({ apiKey });
}

/**
 * Build the analysis prompt for Claude
 */
function buildAnalysisPrompt(property: PropertyForAnalysis): string {
  const currentYear = new Date().getFullYear();
  const propertyAge = property.year_built
    ? currentYear - property.year_built
    : "unknown";

  const pricePerSqft = property.sqft && property.sqft > 0
    ? Math.round(property.price / property.sqft)
    : null;

  return `You are an expert real estate analyst helping a buyer's agent evaluate a property listing. Analyze this property for potential red flags, positive highlights, and provide an overall assessment.

## Property Details

**Address:** ${property.address}, ${property.city}, ${property.state} ${property.zip}
**Asking Price:** $${property.price.toLocaleString()}
**Property Type:** ${property.property_type}
**Bedrooms:** ${property.beds}
**Bathrooms:** ${property.baths}
**Square Footage:** ${property.sqft ? property.sqft.toLocaleString() + " sq ft" : "Not listed"}
**Lot Size:** ${property.lot_size ? property.lot_size + " acres" : "Not listed"}
**Year Built:** ${property.year_built || "Not listed"} (${propertyAge} years old)
**Price per Sq Ft:** ${pricePerSqft ? "$" + pricePerSqft : "Cannot calculate"}
**Listing Agent:** ${property.listing_agent_name || "Not listed"}

**Description:**
${property.description || "No description provided"}

**Listed Features:**
${property.features?.length ? property.features.map(f => `- ${f}`).join("\n") : "No features listed"}

## Analysis Instructions

Please analyze this listing and provide:

1. **Red Flags** - Any concerns or issues you identify. Look for:
${RED_FLAG_CATEGORIES.map(c => `   - ${c}`).join("\n")}
   - Be specific about what in the listing triggered each concern

2. **Highlights** - Positive aspects of the property that would appeal to buyers

3. **Overall Score** - Rate this property from 0-100 where:
   - 90-100: Excellent opportunity, minimal concerns
   - 70-89: Good property, minor concerns
   - 50-69: Average, some notable concerns
   - 30-49: Below average, significant concerns
   - 0-29: Problematic, major red flags

4. **Detailed Analysis** including:
   - Brief summary (2-3 sentences)
   - Price analysis (is it fairly priced for the area/features?)
   - Location notes (any insights about the area)
   - Condition assessment (based on age and description)
   - Investment potential
   - Specific recommendations for the buyer's agent

Respond in the following JSON format:
{
  "score": <number 0-100>,
  "redFlags": ["<specific red flag 1>", "<specific red flag 2>", ...],
  "highlights": ["<highlight 1>", "<highlight 2>", ...],
  "analysis": {
    "summary": "<2-3 sentence summary>",
    "priceAnalysis": "<price assessment>",
    "locationNotes": "<location insights>",
    "conditionAssessment": "<condition assessment>",
    "investmentPotential": "<investment analysis>",
    "recommendations": ["<recommendation 1>", "<recommendation 2>", ...]
  }
}

Be thorough but concise. Focus on actionable insights that would help a real estate agent advise their client.`;
}

/**
 * Parse Claude's response into structured analysis
 */
function parseAnalysisResponse(content: string): PropertyAnalysis {
  // Extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("Failed to parse analysis response - no JSON found");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and normalize the response
    return {
      score: Math.max(0, Math.min(100, Number(parsed.score) || 50)),
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      analysis: {
        summary: parsed.analysis?.summary || "Analysis not available",
        priceAnalysis: parsed.analysis?.priceAnalysis || "Price analysis not available",
        locationNotes: parsed.analysis?.locationNotes || "Location notes not available",
        conditionAssessment: parsed.analysis?.conditionAssessment || "Condition assessment not available",
        investmentPotential: parsed.analysis?.investmentPotential || "Investment potential not assessed",
        recommendations: Array.isArray(parsed.analysis?.recommendations)
          ? parsed.analysis.recommendations
          : [],
      },
    };
  } catch (error) {
    console.error("JSON parse error:", error);
    throw new Error("Failed to parse analysis response - invalid JSON");
  }
}

/**
 * Analyze a property using Claude AI
 */
export async function analyzeProperty(
  property: PropertyForAnalysis
): Promise<PropertyAnalysis> {
  const client = createAnthropicClient();
  const prompt = buildAnalysisPrompt(property);

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Extract text content from response
  const textContent = message.content.find(block => block.type === "text");

  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return parseAnalysisResponse(textContent.text);
}

/**
 * Batch analyze multiple properties
 * Returns results in same order as input
 */
export async function analyzeProperties(
  properties: PropertyForAnalysis[]
): Promise<(PropertyAnalysis | { error: string })[]> {
  const results = await Promise.allSettled(
    properties.map(property => analyzeProperty(property))
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      console.error(
        `Failed to analyze property ${properties[index].address}:`,
        result.reason
      );
      return { error: result.reason?.message || "Analysis failed" };
    }
  });
}

/**
 * Quick check if a property needs analysis
 * Properties should be re-analyzed if:
 * - Never analyzed
 * - Analysis is older than 7 days
 * - Property data has been updated since last analysis
 */
export function needsAnalysis(
  analyzedAt: string | null,
  updatedAt: string | null
): boolean {
  if (!analyzedAt) return true;

  const analyzed = new Date(analyzedAt);
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Re-analyze if older than 7 days
  if (analyzed < sevenDaysAgo) return true;

  // Re-analyze if property was updated after analysis
  if (updatedAt) {
    const updated = new Date(updatedAt);
    if (updated > analyzed) return true;
  }

  return false;
}
