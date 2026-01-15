import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const supabase = await createClient();
  const { token } = await params;

  // Token is the client ID for now (can be enhanced with JWT/signed tokens later)
  const clientId = token;

  // Get client data
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select(`
      id,
      full_name,
      email,
      phone,
      agent:profiles!clients_agent_id_fkey(full_name, phone, email)
    `)
    .eq("id", clientId)
    .eq("status", "active")
    .single();

  if (clientError || !client) {
    return NextResponse.json(
      { error: "Invalid or expired link" },
      { status: 404 }
    );
  }

  // Get properties assigned to this client (only clean ones - no red flags)
  const { data: clientProperties } = await supabase
    .from("client_properties")
    .select(`
      id,
      property_id,
      status,
      property:properties(
        id,
        address,
        city,
        state,
        zip,
        price,
        beds,
        baths,
        sqft,
        photos,
        description,
        highlights,
        red_flags,
        analyzed_at
      )
    `)
    .eq("client_id", clientId)
    .neq("status", "rejected")
    .order("created_at", { ascending: false });

  // Filter out properties with red flags
  interface ClientPropertyWithDetails {
    id: string;
    property_id: string;
    status: string;
    property: {
      id: string;
      address: string;
      city: string | null;
      state: string | null;
      zip: string | null;
      price: number | null;
      beds: number | null;
      baths: number | null;
      sqft: number | null;
      photos: string[] | null;
      description: string | null;
      highlights: string[] | null;
      red_flags: string[] | null;
      analyzed_at: string | null;
    };
  }

  const cleanProperties = (clientProperties as ClientPropertyWithDetails[] || []).filter((cp) => {
    const property = cp.property;
    if (property?.analyzed_at && property?.red_flags && property.red_flags.length > 0) {
      return false;
    }
    return true;
  });

  // Get showings for this client
  const { data: showings } = await supabase
    .from("showings")
    .select(`
      id,
      scheduled_date,
      scheduled_time,
      status,
      property:properties(id, address, city, state)
    `)
    .eq("client_id", clientId)
    .gte("scheduled_date", new Date().toISOString().split("T")[0])
    .order("scheduled_date", { ascending: true });

  const agent = client.agent as { full_name: string; phone: string | null; email: string } | null;

  return NextResponse.json({
    client: {
      id: client.id,
      full_name: client.full_name,
      agent_name: agent?.full_name || "Your Agent",
      agent_phone: agent?.phone,
    },
    properties: cleanProperties,
    showings: showings || [],
  });
}
