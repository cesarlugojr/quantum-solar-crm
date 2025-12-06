import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-key"
);

// GET - Fetch all line items, manual entries, and settings
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch line items
    const { data: lineItems, error: lineItemsError } = await supabase
      .from("cashflow_line_items")
      .select("*")
      .order("created_at", { ascending: true });

    if (lineItemsError) {
      console.error("Error fetching line items:", lineItemsError);
    }

    // Fetch manual entries
    const { data: manualEntries, error: manualEntriesError } = await supabase
      .from("cashflow_manual_entries")
      .select("*")
      .order("date", { ascending: true });

    if (manualEntriesError) {
      console.error("Error fetching manual entries:", manualEntriesError);
    }

    // Fetch settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("cashflow_settings")
      .select("*");

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
    }

    // Convert settings array to object
    const settings: Record<string, unknown> = {};
    if (settingsData) {
      for (const row of settingsData) {
        settings[row.setting_key] = row.setting_value;
      }
    }

    return NextResponse.json({
      lineItems: lineItems || [],
      manualEntries: manualEntries || [],
      settings,
    });
  } catch (error) {
    console.error("Error in cashflow API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new line item
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data: lineItem, error } = await supabase
      .from("cashflow_line_items")
      .insert({
        name: body.name,
        amount: body.amount,
        frequency: body.frequency,
        category: body.category,
        anchor_day: body.anchor_day,
        anchor_date: body.anchor_date,
        second_day: body.second_day,
        active: body.active ?? true,
        notes: body.notes,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating line item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lineItem });
  } catch (error) {
    console.error("Error in cashflow API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update a line item
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { data: lineItem, error } = await supabase
      .from("cashflow_line_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating line item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lineItem });
  } catch (error) {
    console.error("Error in cashflow API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a line item
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("cashflow_line_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting line item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in cashflow API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
