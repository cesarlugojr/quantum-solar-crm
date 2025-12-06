import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-key"
);

// POST - Save spreadsheet data
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { spreadsheetData, lineItemNames, startingBalance, skippedCells } = body;

    // Save spreadsheet data as a single JSON blob
    const { error: dataError } = await supabase
      .from("cashflow_settings")
      .upsert(
        {
          setting_key: "spreadsheet_data",
          setting_value: {
            spreadsheetData,
            lineItemNames,
            skippedCells,
            updatedAt: new Date().toISOString(),
          },
        },
        { onConflict: "setting_key" }
      );

    if (dataError) {
      console.error("Error saving spreadsheet data:", dataError);
    }

    // Save starting balance
    const { error: balanceError } = await supabase
      .from("cashflow_settings")
      .upsert(
        {
          setting_key: "starting_balance",
          setting_value: {
            amount: startingBalance,
            as_of_date: new Date().toISOString().split("T")[0],
          },
        },
        { onConflict: "setting_key" }
      );

    if (balanceError) {
      console.error("Error saving starting balance:", balanceError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in spreadsheet API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Load spreadsheet data
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch spreadsheet data
    const { data: spreadsheetRow } = await supabase
      .from("cashflow_settings")
      .select("setting_value")
      .eq("setting_key", "spreadsheet_data")
      .single();

    // Fetch starting balance
    const { data: balanceRow } = await supabase
      .from("cashflow_settings")
      .select("setting_value")
      .eq("setting_key", "starting_balance")
      .single();

    return NextResponse.json({
      spreadsheetData: spreadsheetRow?.setting_value?.spreadsheetData || null,
      lineItemNames: spreadsheetRow?.setting_value?.lineItemNames || null,
      skippedCells: spreadsheetRow?.setting_value?.skippedCells || null,
      startingBalance: balanceRow?.setting_value?.amount || 10867.86,
    });
  } catch (error) {
    console.error("Error in spreadsheet API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
