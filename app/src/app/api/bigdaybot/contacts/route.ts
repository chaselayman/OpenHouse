import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getContacts, deleteContact, updateContact, getUpcomingEvents } from "@/lib/services/bigdaybot";

// GET - Fetch all contacts for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeUpcoming = searchParams.get("upcoming") === "true";
    const upcomingDays = parseInt(searchParams.get("days") || "30");

    const contacts = await getContacts(user.id);

    let upcomingEvents = null;
    if (includeUpcoming) {
      upcomingEvents = await getUpcomingEvents(user.id, upcomingDays);
    }

    return NextResponse.json({
      contacts,
      upcomingEvents,
      total: contacts.length,
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a contact
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("id");

    if (!contactId) {
      return NextResponse.json(
        { error: "Contact ID required" },
        { status: 400 }
      );
    }

    const success = await deleteContact(contactId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete contact" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete contact error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete contact" },
      { status: 500 }
    );
  }
}

// PATCH - Update a contact
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Contact ID required" },
        { status: 400 }
      );
    }

    const success = await updateContact(id, updates);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update contact" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update contact error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update contact" },
      { status: 500 }
    );
  }
}
