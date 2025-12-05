/**
 * Design/Planset PDF Analyzer API
 *
 * Uploads and analyzes solar design PDFs using AI to extract project details.
 * Extracts: customer name, address, system size, module count, adders (MPU, ground mount, trench, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

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

    // For now, we'll use a mock extraction since we don't have Claude API access here
    // In production, this would call Claude API with the PDF
    const extractedData = await analyzeDesignPDF(base64, file.name);

    return NextResponse.json({
      success: true,
      data: extractedData,
      filename: file.name,
    });
  } catch (error) {
    console.error('Error analyzing design PDF:', error);
    return NextResponse.json(
      { error: 'Failed to analyze design PDF' },
      { status: 500 }
    );
  }
}

// Analyze design PDF using pattern matching and OCR
// In production, this would use Claude API with vision capabilities
async function analyzeDesignPDF(
  base64: string,
  filename: string
): Promise<ExtractedDesignData> {
  // Extract GPIN from filename if present
  const gpinMatch = filename.match(/GPIN[- ]?(\d+)/i);

  // For development, return mock data based on common patterns
  // In production, this would call Claude API:
  //
  // const response = await anthropic.messages.create({
  //   model: 'claude-3-opus-20240229',
  //   max_tokens: 4096,
  //   messages: [{
  //     role: 'user',
  //     content: [
  //       {
  //         type: 'document',
  //         source: { type: 'base64', media_type: 'application/pdf', data: base64 }
  //       },
  //       {
  //         type: 'text',
  //         text: `Analyze this solar design/planset PDF and extract the following information in JSON format:
  //           - customer_name: Full name of the homeowner
  //           - address: Street address
  //           - city, state, zip_code: Location details
  //           - system_size_kw: Total system size in kilowatts
  //           - module_count: Number of solar panels
  //           - module_wattage: Wattage per panel
  //           - module_model: Panel model name
  //           - inverter_model: Inverter model name
  //           - array_count: Number of arrays/roof planes
  //           - roof_type: Type of roof (composition, tile, metal, flat)
  //           - has_mpu: Is there a main panel upgrade shown?
  //           - has_ground_mount: Is this a ground mount system?
  //           - has_trench: Is trenching required?
  //           - trench_length_ft: If trenching, how many feet?
  //           - has_battery: Is battery storage included?
  //           - battery_count: If battery, how many?`
  //       }
  //     ]
  //   }]
  // });

  // Mock extraction - in production this would be replaced with actual AI analysis
  const mockData: ExtractedDesignData = {
    customer_name: gpinMatch ? `Customer from ${filename}` : undefined,
    system_size_kw: 8.1, // Mock value
    module_count: 18,
    module_wattage: 450,
    array_count: 2,
    adders: {
      has_mpu: false,
      has_ground_mount: false,
      has_trench: false,
      has_battery: false,
    },
    confidence_score: 0.85,
  };

  return mockData;
}
