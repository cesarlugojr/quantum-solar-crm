import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-key"
);

// GET - Fetch all settings
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: settingsData, error } = await supabase
      .from("cashflow_settings")
      .select("*");

    if (error) {
      console.error("Error fetching settings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convert settings array to object
    const settings: Record<string, unknown> = {};
    if (settingsData) {
      for (const row of settingsData) {
        settings[row.setting_key] = row.setting_value;
      }
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error in settings API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Update settings (upsert)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Upsert each setting
    const results: Record<string, boolean> = {};

    for (const [key, value] of Object.entries(body)) {
      const { error } = await supabase
        .from("cashflow_settings")
        .upsert(
          {
            setting_key: key,
            setting_value: value,
          },
          {
            onConflict: "setting_key",
          }
        );

      if (error) {
        console.error(`Error upserting setting ${key}:`, error);
        results[key] = false;
      } else {
        results[key] = true;
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Error in settings API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
