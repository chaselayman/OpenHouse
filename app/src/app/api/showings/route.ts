import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let query = supabase
    .from("showings")
    .select(`
      *,
      client:clients(id, full_name, email, phone),
      property:properties(id, address, city, state, zip, price, beds, baths)
    `)
    .eq("agent_id", user.id)
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true });

  if (startDate) {
    query = query.gte("scheduled_date", startDate);
  }
  if (endDate) {
    query = query.lte("scheduled_date", endDate);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("showings")
    .insert({
      ...body,
      agent_id: user.id,
    })
    .select(`
      *,
      client:clients(id, full_name, email, phone),
      property:properties(id, address, city, state, zip, price, beds, baths)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
