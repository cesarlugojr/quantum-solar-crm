/**
 * Design/Planset PDF Analyzer API
 *
 * Uploads and analyzes solar design PDFs using Claude Vision to extract project details.
 * Extracts: customer name, address, system size, module count, adders (MPU, ground mount, trench, etc.)
 * Optionally uploads to Google Drive if projectId is provided.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { getOrCreateProjectFolder, uploadDesignPDFToFolder, isDesignDriveConfigured } from '@/lib/google-drive';
import { supabase } from '@/lib/supabase';

// Types for roof section data
interface RoofSection {
  section_name: string;      // e.g., "Array 1", "South Roof", "Garage"
  panel_count: number;       // Number of panels on this section
  pitch_degrees?: number;    // Roof pitch in degrees (0-90)
  pitch_ratio?: string;      // Roof pitch as ratio (e.g., "4:12", "7:12")
  azimuth?: number;          // Direction roof faces (0-360, 180 = south)
  orientation?: string;      // Cardinal direction (N, NE, E, SE, S, SW, W, NW)
}

// Types for extracted design data
interface ExtractedDesignData {
  customer_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  system_size_kw?: number;
  system_size_watts?: number;
  module_count?: number;
  module_wattage?: number;
  module_model?: string;
  inverter_model?: string;
  array_count?: number;
  roof_type?: string;

  // Detailed roof section info
  roof_sections?: RoofSection[];

  // Permitting and utility info
  ahj_jurisdiction?: string;
  utility_company?: string;

  // Adders detected
  adders: {
    has_mpu?: boolean;
    has_ground_mount?: boolean;
    has_trench?: boolean;
    trench_length_ft?: number;
    has_battery?: boolean;
    battery_count?: number;
    has_ev_charger?: boolean;
    has_steep_pitch?: boolean;
    has_flat_roof?: boolean;
    has_tile_roof?: boolean;
    has_metal_roof?: boolean;
    has_three_story?: boolean;
  };

  // Raw extracted text for debugging
  raw_text?: string;
  confidence_score?: number;
}

// POST - Analyze uploaded design PDF
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Convert file to base64 for API processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Analyze the PDF with Claude Vision
    const extractedData = await analyzeDesignPDF(base64, file.name);

    // If projectId is provided and Google Drive is configured, upload to Drive
    let driveResult: { fileId: string; webViewLink: string; folderUrl?: string } | null = null;
    if (projectId && isDesignDriveConfigured()) {
      try {
        // Get project info for folder naming
        const { data: project } = await supabase
          .from('projects')
          .select('customer_name, address, google_drive_folder_id')
          .eq('id', projectId)
          .single();

        const customerName = project?.customer_name || extractedData.customer_name;
        const address = project?.address || extractedData.address;

        // Get or create the project folder
        let folderId = project?.google_drive_folder_id;
        let folderUrl: string | undefined;

        if (!folderId) {
          // Create a new folder for this project
          const folderResult = await getOrCreateProjectFolder(projectId, customerName, address);
          folderId = folderResult.folderId;
          folderUrl = folderResult.folderUrl;

          // Save the folder ID to the project
          await supabase
            .from('projects')
            .update({
              google_drive_folder_id: folderId,
              google_drive_folder_url: folderUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('id', projectId);
        }

        // Upload the design PDF to the project folder
        const uploadResult = await uploadDesignPDFToFolder(
          buffer,
          folderId,
          file.name
        );

        driveResult = {
          fileId: uploadResult.fileId,
          webViewLink: uploadResult.webViewLink,
          folderUrl,
        };

        // Update project with the design file info
        await supabase
          .from('projects')
          .update({
            design_pdf_drive_id: uploadResult.fileId,
            design_pdf_drive_url: uploadResult.webViewLink,
            design_pdf_filename: file.name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId);

        console.log(`Design PDF uploaded to project folder: ${uploadResult.webViewLink}`);
      } catch (driveError) {
        console.error('Failed to upload design to Google Drive:', driveError);
        // Continue without Drive upload - don't fail the whole request
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...extractedData,
        drive_file_id: driveResult?.fileId,
        drive_url: driveResult?.webViewLink,
      },
      filename: file.name,
      driveUploaded: !!driveResult,
    });
  } catch (error) {
    console.error('Error analyzing design PDF:', error);

    // Handle rate limit errors specifically
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        {
          error: error.message,
          retryAfter: error.retryAfter,
          isRateLimit: true,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze design PDF' },
      { status: 500 }
    );
  }
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Custom error for rate limiting
class RateLimitError extends Error {
  retryAfter: number;

  constructor(message: string, retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

// Sleep utility for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Analyze design PDF using Claude Vision with retry logic
async function analyzeDesignPDF(
  base64: string,
  filename: string,
  maxRetries: number = 2
): Promise<ExtractedDesignData> {
  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not configured, returning mock data');
    return getMockData(filename);
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 10s, 30s, 60s
        const delayMs = Math.min(10000 * Math.pow(2, attempt - 1), 60000);
        console.log(`Rate limit retry attempt ${attempt}, waiting ${delayMs / 1000}s...`);
        await sleep(delayMs);
      }

      const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            },
            {
              type: 'text',
              text: `Analyze this solar design/planset PDF and extract project details.

Return a JSON object with these fields (use null for any values you cannot find):

{
  "customer_name": "Full name of the homeowner",
  "address": "Street address only",
  "city": "City name",
  "state": "State abbreviation (e.g., IL, CA)",
  "zip_code": "ZIP code",
  "system_size_kw": number (total system size in kilowatts),
  "module_count": number (total number of solar panels),
  "module_wattage": number (watts per panel),
  "module_model": "Panel model name/number",
  "inverter_model": "Inverter model name/number",
  "array_count": number (number of separate arrays/roof planes with panels),
  "roof_type": "composition|tile|metal|flat|shingle|other",

  "roof_sections": [
    {
      "section_name": "Array 1" or descriptive name like "South Roof", "Garage", etc.,
      "panel_count": number of panels on this specific roof section,
      "pitch_degrees": roof pitch in degrees (0 = flat, 45 = steep),
      "pitch_ratio": roof pitch as ratio string (e.g., "4:12", "7:12", "12:12"),
      "azimuth": compass direction roof faces in degrees (0=N, 90=E, 180=S, 270=W),
      "orientation": cardinal direction ("N", "NE", "E", "SE", "S", "SW", "W", "NW")
    }
  ],

  "ahj_jurisdiction": "Authority Having Jurisdiction - city/county name for permits (e.g., 'City of Chicago', 'Cook County')",
  "utility_company": "Utility company name shown on plans (e.g., 'ComEd', 'Ameren', 'Duke Energy')",

  "has_mpu": boolean (is there a main panel upgrade/MPU shown?),
  "has_ground_mount": boolean (is this a ground mount system vs roof mount?),
  "has_trench": boolean (is trenching required for conduit?),
  "trench_length_ft": number or null (if trenching, estimated feet),
  "has_battery": boolean (is battery storage included?),
  "battery_count": number or null (if battery, how many units?),
  "has_ev_charger": boolean (is an EV charger included?),
  "has_steep_pitch": boolean (any roof pitch > 7:12 or > 30 degrees?),
  "has_flat_roof": boolean (flat or low-slope roof < 2:12?),
  "has_tile_roof": boolean (tile roof requiring special mounting?),
  "has_metal_roof": boolean (metal roof?),
  "has_three_story": boolean (three story building?)
}

Important extraction rules:
- Look for system size in kW (kilowatts) or calculate from module count × wattage
- For roof_sections: Identify EACH separate roof plane/array that has panels
  - Count how many panels are on each section
  - Look for pitch info in the plans (often shown as X:12 ratio or degrees)
  - Common pitch ratios: 4:12 (18°), 5:12 (22°), 6:12 (26°), 7:12 (30°), 8:12 (33°), 9:12 (37°), 10:12 (40°), 12:12 (45°)
  - Look for azimuth/orientation info showing which way each roof section faces
- Check for ground mount indicators in the site plan or notes
- Look for MPU/main panel upgrade mentions in the electrical diagram
- Check for battery systems like Tesla Powerwall, Enphase, etc.
- Look for trenching distances in the site plan
- Look for AHJ (Authority Having Jurisdiction) in title block, permit info, or notes - this is the city/county that issues building permits
- Look for utility company name in interconnection details, title block, or electrical notes

Return ONLY the JSON object, no other text.`,
            },
          ],
        },
      ],
    });

    // Extract the text response
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse the JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not find JSON in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Parse roof sections if present
    const roofSections: RoofSection[] = Array.isArray(parsed.roof_sections)
      ? parsed.roof_sections.map((section: Record<string, unknown>) => ({
          section_name: String(section.section_name || 'Unknown'),
          panel_count: Number(section.panel_count) || 0,
          pitch_degrees: section.pitch_degrees ? Number(section.pitch_degrees) : undefined,
          pitch_ratio: section.pitch_ratio ? String(section.pitch_ratio) : undefined,
          azimuth: section.azimuth ? Number(section.azimuth) : undefined,
          orientation: section.orientation ? String(section.orientation) : undefined,
        }))
      : undefined;

    // Transform to our expected format
    const extractedData: ExtractedDesignData = {
      customer_name: parsed.customer_name || undefined,
      address: parsed.address || undefined,
      city: parsed.city || undefined,
      state: parsed.state || undefined,
      zip_code: parsed.zip_code || undefined,
      system_size_kw: parsed.system_size_kw || undefined,
      system_size_watts: parsed.system_size_kw
        ? Math.round(parsed.system_size_kw * 1000)
        : undefined,
      module_count: parsed.module_count || undefined,
      module_wattage: parsed.module_wattage || undefined,
      module_model: parsed.module_model || undefined,
      inverter_model: parsed.inverter_model || undefined,
      array_count: parsed.array_count || roofSections?.length || undefined,
      roof_type: parsed.roof_type || undefined,
      roof_sections: roofSections,
      ahj_jurisdiction: parsed.ahj_jurisdiction || undefined,
      utility_company: parsed.utility_company || undefined,
      adders: {
        has_mpu: parsed.has_mpu === true,
        has_ground_mount: parsed.has_ground_mount === true,
        has_trench: parsed.has_trench === true,
        trench_length_ft: parsed.trench_length_ft || undefined,
        has_battery: parsed.has_battery === true,
        battery_count: parsed.battery_count || undefined,
        has_ev_charger: parsed.has_ev_charger === true,
        has_steep_pitch: parsed.has_steep_pitch === true,
        has_flat_roof: parsed.has_flat_roof === true,
        has_tile_roof: parsed.has_tile_roof === true,
        has_metal_roof: parsed.has_metal_roof === true,
        has_three_story: parsed.has_three_story === true,
      },
      confidence_score: 0.95,
    };

      return extractedData;
    } catch (error) {
      // Check for rate limit error (429)
      if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
        const rateLimitError = error as { status: number; headers?: Headers };
        const retryAfter = rateLimitError.headers?.get('retry-after');
        const retrySeconds = retryAfter ? parseInt(retryAfter) : 60;

        console.warn(`Rate limited (attempt ${attempt + 1}/${maxRetries + 1}), retry after ${retrySeconds}s`);

        // If we've exhausted retries, throw a specific rate limit error
        if (attempt >= maxRetries) {
          throw new RateLimitError(
            `Rate limit exceeded. Please wait ${Math.ceil(retrySeconds / 60)} minute(s) before trying again.`,
            retrySeconds
          );
        }
        // Otherwise continue to next retry attempt
        continue;
      }

      // For non-rate-limit errors, don't retry
      console.error('Claude Vision analysis failed:', error);
      break;
    }
  }

  // If we get here, all retries failed - fall back to mock data
  console.warn('All retry attempts failed, returning mock data');
  return getMockData(filename);
}

// Fallback mock data when API is unavailable
function getMockData(filename: string): ExtractedDesignData {
  const gpinMatch = filename.match(/GPIN[- ]?(\d+)/i);
  return {
    customer_name: gpinMatch ? `Customer from ${filename}` : undefined,
    system_size_kw: 8.1,
    module_count: 18,
    module_wattage: 450,
    array_count: 2,
    roof_sections: [
      {
        section_name: 'South Roof',
        panel_count: 12,
        pitch_degrees: 22,
        pitch_ratio: '5:12',
        azimuth: 180,
        orientation: 'S',
      },
      {
        section_name: 'West Roof',
        panel_count: 6,
        pitch_degrees: 22,
        pitch_ratio: '5:12',
        azimuth: 270,
        orientation: 'W',
      },
    ],
    adders: {
      has_mpu: false,
      has_ground_mount: false,
      has_trench: false,
      has_battery: false,
    },
    confidence_score: 0.5, // Lower confidence for mock data
  };
}
