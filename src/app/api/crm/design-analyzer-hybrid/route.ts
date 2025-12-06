/**
 * Hybrid Design/Planset PDF Analyzer API
 *
 * Token-optimized document analysis using Docling + Claude Vision hybrid approach.
 * Reduces Claude API token usage by 70-85% compared to vision-only approach.
 *
 * This endpoint ONLY extracts data from PDFs to auto-fill project fields.
 * It does NOT upload files to Google Drive - use the Project Documents section for that.
 *
 * Processing Tiers:
 * 1. Docling extraction (free/local)
 * 2. Pattern matching (free/local)
 * 3. Claude text fallback (~80% token savings)
 * 4. Claude vision fallback (last resort)
 *
 * POST /api/crm/design-analyzer-hybrid
 * - file: PDF file (multipart/form-data)
 * - forceVision?: boolean (skip Docling, use Claude Vision directly)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createHybridProcessor, type ProcessingConfig } from '@/lib/document-processing';

// Increase max duration for OCR processing (can take 2-3 minutes)
export const maxDuration = 300; // 5 minutes

// Rate limit tracking for user feedback
interface ProcessingStats {
  method: string;
  tokensUsed: number;
  tokensSaved: number;
  processingTimeMs: number;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const forceVision = formData.get('forceVision') === 'true';

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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Configure hybrid processor
    const processorConfig: Partial<ProcessingConfig> = {
      confidenceThreshold: 0.75,
      enableDocling: !forceVision,
      enablePatternMatching: !forceVision,
      enableClaudeTextFallback: !forceVision,
      enableClaudeVisionFallback: true,
      maxClaudeTokens: 2048,
    };

    // Process document using hybrid approach
    const processor = createHybridProcessor(processorConfig);
    const result = await processor.processDocument(buffer, file.name, file.type);

    // Calculate estimated token savings
    const estimatedVisionTokens = Math.round(buffer.length * 0.5); // Rough estimate
    const tokensSaved = Math.max(0, estimatedVisionTokens - result.tokensUsed);
    const savingsPercentage = estimatedVisionTokens > 0
      ? Math.round((tokensSaved / estimatedVisionTokens) * 100)
      : 0;

    const stats: ProcessingStats = {
      method: result.processingMethod,
      tokensUsed: result.tokensUsed,
      tokensSaved,
      processingTimeMs: result.processingTimeMs,
      confidence: result.confidence,
    };

    console.log(`[HybridAnalyzer] Processed ${file.name}:`, {
      method: stats.method,
      tokensUsed: stats.tokensUsed,
      tokensSaved: stats.tokensSaved,
      savingsPercentage: `${savingsPercentage}%`,
      confidence: `${(stats.confidence * 100).toFixed(1)}%`,
      timeMs: stats.processingTimeMs,
    });

    // Return extracted data and processing stats (no Drive upload - that's handled by Project Documents)
    return NextResponse.json({
      success: result.success,
      data: result.data,
      filename: file.name,

      // Processing stats for monitoring/debugging
      processing: {
        method: stats.method,
        confidence: Math.round(stats.confidence * 100),
        tokensUsed: stats.tokensUsed,
        tokensSaved: stats.tokensSaved,
        savingsPercentage,
        processingTimeMs: stats.processingTimeMs,
        fallbackReason: result.fallbackReason,
      },
    });
  } catch (error) {
    console.error('[HybridAnalyzer] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to analyze design PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/crm/design-analyzer-hybrid
 *
 * Returns information about the hybrid processor capabilities
 * and current configuration.
 */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check Docling availability
  const { getDoclingService } = await import('@/lib/document-processing');
  const docling = getDoclingService();
  const doclingAvailable = await docling.checkAvailability();

  return NextResponse.json({
    endpoint: '/api/crm/design-analyzer-hybrid',
    version: '1.0.0',
    description: 'Extracts data from design PDFs to auto-fill project fields. Does NOT upload to Drive.',
    capabilities: {
      docling: {
        available: doclingAvailable,
        mode: process.env.DOCLING_MODE || 'local',
        endpoint: process.env.DOCLING_API_ENDPOINT || null,
      },
      claudeVision: {
        available: !!process.env.ANTHROPIC_API_KEY,
        model: 'claude-sonnet-4-20250514',
      },
    },
    processingTiers: [
      { tier: 1, name: 'Docling Extraction', cost: 'Free', available: doclingAvailable },
      { tier: 2, name: 'Pattern Matching', cost: 'Free', available: true },
      { tier: 3, name: 'Claude Text Fallback', cost: '~80% savings', available: !!process.env.ANTHROPIC_API_KEY },
      { tier: 4, name: 'Claude Vision Fallback', cost: 'Full cost', available: !!process.env.ANTHROPIC_API_KEY },
    ],
    estimatedSavings: doclingAvailable ? '70-85%' : '0% (Docling not available)',
  });
}
