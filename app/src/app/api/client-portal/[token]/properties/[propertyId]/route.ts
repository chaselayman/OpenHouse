import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string; propertyId: string }> }
) {
  const supabase = await createClient();
  const { token, propertyId } = await params;
  const clientId = token;

  try {
    const { status, rejection_reasons, client_notes } = await request.json();

    if (!status || !["interested", "rejected", "viewed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Verify client exists
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .eq("status", "active")
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: "Invalid client" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      status,
      viewed_at: new Date().toISOString(),
    };

    // Store rejection feedback in client_notes as JSON
    if (status === "rejected" && (rejection_reasons?.length || client_notes)) {
      const feedback = {
        reasons: rejection_reasons || [],
        notes: client_notes || "",
        rejected_at: new Date().toISOString(),
      };
      updateData.client_notes = JSON.stringify(feedback);
    }

    // Update client_property status
    const { data, error } = await supabase
      .from("client_properties")
      .update(updateData)
      .eq("client_id", clientId)
      .eq("property_id", propertyId)
      .select()
      .single();

    if (error) {
      // If no record exists, create one
      if (error.code === "PGRST116") {
        const insertData: Record<string, unknown> = {
          client_id: clientId,
          property_id: propertyId,
          status,
        };

        if (status === "rejected" && (rejection_reasons?.length || client_notes)) {
          const feedback = {
            reasons: rejection_reasons || [],
            notes: client_notes || "",
            rejected_at: new Date().toISOString(),
          };
          insertData.client_notes = JSON.stringify(feedback);
        }

        const { data: newRecord, error: insertError } = await supabase
          .from("client_properties")
          .insert(insertData)
          .select()
          .single();

        if (insertError) throw insertError;
        return NextResponse.json(newRecord);
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update property status error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update" },
      { status: 500 }
    );
  }
}
