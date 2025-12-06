/**
 * Hybrid Document Processor
 *
 * A token-efficient document processing pipeline that uses Docling for initial
 * extraction and only falls back to Claude Vision when necessary.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                         DOCUMENT INPUT                                  │
 * │                      (PDF, Image, etc.)                                 │
 * └─────────────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                    TIER 1: DOCLING EXTRACTION                           │
 * │                         (Free/Local)                                    │
 * │  • PDF to Markdown/JSON conversion                                      │
 * │  • Table extraction                                                     │
 * │  • Text block identification                                            │
 * │  • Document structure analysis                                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                  TIER 2: PATTERN EXTRACTION                             │
 * │                      (Free/Local)                                       │
 * │  • Regex patterns for solar design fields                               │
 * │  • Address/name parsing                                                 │
 * │  • System specifications extraction                                     │
 * │  • Adders detection from keywords                                       │
 * └─────────────────────────────────────────────────────────────────────────┘
 *                                    │
 *                    ┌───────────────┴───────────────┐
 *                    │    CONFIDENCE CHECK           │
 *                    │    confidence >= threshold?   │
 *                    └───────────────┬───────────────┘
 *                           │                │
 *                    YES    │                │   NO
 *                           ▼                ▼
 *              ┌────────────────┐  ┌─────────────────────────────────────────┐
 *              │ RETURN RESULT  │  │       TIER 3: CLAUDE VISION             │
 *              │ (No API Cost)  │  │          (Token-Optimized)              │
 *              └────────────────┘  │  Option A: Send extracted text only     │
 *                                  │  Option B: Send specific pages only     │
 *                                  │  Option C: Send full PDF (last resort)  │
 *                                  └─────────────────────────────────────────┘
 *
 * Token Savings Estimate:
 * - Docling-only success (60-70% of docs): 100% token savings
 * - Text-only Claude fallback (20-25%): ~80% token savings
 * - Full Vision fallback (5-15%): 0% savings, same as current
 *
 * Overall expected savings: 70-85% reduction in Claude API tokens
 */

import Anthropic from '@anthropic-ai/sdk';

// Python path for Docling - use Xcode Python where docling is installed
const PYTHON_PATH = process.env.PYTHON_PATH || '/Applications/Xcode.app/Contents/Developer/usr/bin/python3';

// ============================================================================
// TYPES
// ============================================================================

export interface DocumentProcessingResult {
  success: boolean;
  data: ExtractedDesignData;
  processingMethod: 'docling' | 'docling+patterns' | 'claude-text' | 'claude-vision';
  confidence: number;
  tokensUsed: number;
  processingTimeMs: number;
  fallbackReason?: string;
}

export interface ExtractedDesignData {
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
  roof_sections?: RoofSection[];
  ahj_jurisdiction?: string;
  utility_company?: string;
  main_panel_brand?: string;
  main_breaker_amps?: number;
  adders: AdderFlags;
  raw_text?: string;
  confidence_score?: number;
}

export interface RoofSection {
  section_name: string;
  panel_count: number;
  pitch_degrees?: number;
  pitch_ratio?: string;
  azimuth?: number;
  orientation?: string;
}

export interface AdderFlags {
  has_mpu?: boolean;
  has_ground_mount?: boolean;
  has_trench?: boolean;
  trench_length_ft?: number;
  has_battery?: boolean;
  battery_count?: number;
  battery_model?: string;
  has_backup_panel?: boolean;
  has_backup_gateway?: boolean;
  has_ev_charger?: boolean;
  has_steep_pitch?: boolean;
  has_flat_roof?: boolean;
  has_tile_roof?: boolean;
  has_metal_roof?: boolean;
  has_comp_shingle?: boolean;
  has_three_story?: boolean;
  has_two_story?: boolean;
  has_one_story?: boolean;
  has_attic_run?: boolean;
  has_derate?: boolean;
}

export interface DoclingResult {
  markdown: string;
  tables: DoclingTable[];
  metadata: Record<string, unknown>;
  pageCount: number;
  extractionQuality: 'high' | 'medium' | 'low';
}

export interface DoclingTable {
  headers: string[];
  rows: string[][];
  pageNumber: number;
}

export interface ProcessingConfig {
  confidenceThreshold: number;       // 0.0-1.0, default 0.75
  enableDocling: boolean;            // Enable Docling extraction
  enablePatternMatching: boolean;    // Enable regex patterns
  enableClaudeTextFallback: boolean; // Send extracted text to Claude
  enableClaudeVisionFallback: boolean; // Send full PDF to Claude
  maxClaudeTokens: number;           // Max tokens for Claude responses
  doclingEndpoint?: string;          // Docling API endpoint (if using server)
}

const DEFAULT_CONFIG: ProcessingConfig = {
  confidenceThreshold: 0.75,
  enableDocling: true,
  enablePatternMatching: true,
  enableClaudeTextFallback: true,
  enableClaudeVisionFallback: true,
  maxClaudeTokens: 2048, // Reduced from 4096 for cost savings
  doclingEndpoint: process.env.DOCLING_API_ENDPOINT,
};

// ============================================================================
// MAIN HYBRID PROCESSOR CLASS
// ============================================================================

export class HybridDocumentProcessor {
  private config: ProcessingConfig;
  private anthropic: Anthropic | null = null;

  constructor(config: Partial<ProcessingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  /**
   * Process a document using the hybrid pipeline
   */
  async processDocument(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string = 'application/pdf'
  ): Promise<DocumentProcessingResult> {
    const startTime = Date.now();
    let tokensUsed = 0;

    // Track extraction progress for confidence calculation
    const extractionResults: {
      docling?: DoclingResult;
      patternData?: Partial<ExtractedDesignData>;
      claudeData?: ExtractedDesignData;
    } = {};

    // ========================================================================
    // TIER 1: Docling Extraction
    // ========================================================================
    if (this.config.enableDocling) {
      try {
        console.log('[HybridProcessor] Starting Docling extraction...');
        extractionResults.docling = await this.extractWithDocling(fileBuffer, mimeType);
        console.log(`[HybridProcessor] Docling extraction complete. Quality: ${extractionResults.docling.extractionQuality}`);
      } catch (error) {
        console.warn('[HybridProcessor] Docling extraction failed:', error);
      }
    }

    // ========================================================================
    // TIER 2: Pattern Extraction
    // ========================================================================
    if (this.config.enablePatternMatching && extractionResults.docling) {
      try {
        console.log('[HybridProcessor] Starting pattern extraction...');
        extractionResults.patternData = this.extractWithPatterns(extractionResults.docling);
        console.log('[HybridProcessor] Pattern extraction complete');
      } catch (error) {
        console.warn('[HybridProcessor] Pattern extraction failed:', error);
      }
    }

    // Calculate confidence from Tier 1+2
    const tier12Confidence = this.calculateConfidence(extractionResults.patternData);
    console.log(`[HybridProcessor] Tier 1+2 confidence: ${(tier12Confidence * 100).toFixed(1)}%`);

    // If confidence is good enough, return without Claude
    if (tier12Confidence >= this.config.confidenceThreshold) {
      return {
        success: true,
        data: this.normalizeExtractedData(extractionResults.patternData || {}),
        processingMethod: extractionResults.docling ? 'docling+patterns' : 'docling',
        confidence: tier12Confidence,
        tokensUsed: 0,
        processingTimeMs: Date.now() - startTime,
      };
    }

    // ========================================================================
    // TIER 3: Claude Fallback (Token-Optimized)
    // ========================================================================
    if (!this.anthropic) {
      console.warn('[HybridProcessor] No Anthropic API key, returning partial results');
      return {
        success: tier12Confidence > 0.3,
        data: this.normalizeExtractedData(extractionResults.patternData || {}),
        processingMethod: 'docling+patterns',
        confidence: tier12Confidence,
        tokensUsed: 0,
        processingTimeMs: Date.now() - startTime,
        fallbackReason: 'No Claude API key configured',
      };
    }

    // Determine which Claude fallback to use
    const missingFields = this.getMissingCriticalFields(extractionResults.patternData);

    // OPTION A: Text-only fallback (80% token savings)
    if (
      this.config.enableClaudeTextFallback &&
      extractionResults.docling &&
      extractionResults.docling.extractionQuality !== 'low'
    ) {
      try {
        console.log('[HybridProcessor] Using Claude text-only fallback...');
        const textResult = await this.extractWithClaudeText(
          extractionResults.docling.markdown,
          extractionResults.patternData,
          missingFields
        );
        tokensUsed = textResult.tokensUsed;

        // Merge with pattern data
        const mergedData = this.mergeExtractionResults(
          extractionResults.patternData || {},
          textResult.data
        );

        const finalConfidence = this.calculateConfidence(mergedData);

        if (finalConfidence >= this.config.confidenceThreshold) {
          return {
            success: true,
            data: this.normalizeExtractedData(mergedData),
            processingMethod: 'claude-text',
            confidence: finalConfidence,
            tokensUsed,
            processingTimeMs: Date.now() - startTime,
          };
        }
      } catch (error) {
        console.warn('[HybridProcessor] Claude text fallback failed:', error);
      }
    }

    // OPTION B: Full Vision fallback (last resort)
    if (this.config.enableClaudeVisionFallback) {
      try {
        console.log('[HybridProcessor] Using Claude Vision fallback (full PDF)...');
        const visionResult = await this.extractWithClaudeVision(fileBuffer, filename);
        tokensUsed += visionResult.tokensUsed;

        return {
          success: true,
          data: visionResult.data,
          processingMethod: 'claude-vision',
          confidence: visionResult.data.confidence_score || 0.9,
          tokensUsed,
          processingTimeMs: Date.now() - startTime,
          fallbackReason: 'Low confidence from text extraction',
        };
      } catch (error) {
        console.error('[HybridProcessor] Claude Vision fallback failed:', error);
      }
    }

    // All fallbacks failed, return best effort
    return {
      success: false,
      data: this.normalizeExtractedData(extractionResults.patternData || {}),
      processingMethod: 'docling+patterns',
      confidence: tier12Confidence,
      tokensUsed,
      processingTimeMs: Date.now() - startTime,
      fallbackReason: 'All extraction methods failed or produced low confidence',
    };
  }

  // ==========================================================================
  // TIER 1: DOCLING EXTRACTION
  // ==========================================================================

  private async extractWithDocling(
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<DoclingResult> {
    // Option 1: Use Docling API server (recommended for production)
    if (this.config.doclingEndpoint) {
      return this.callDoclingAPI(fileBuffer, mimeType);
    }

    // Option 2: Use local Docling via Python subprocess
    // This requires docling to be installed: pip install docling
    return this.callDoclingLocal(fileBuffer, mimeType);
  }

  private async callDoclingAPI(
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<DoclingResult> {
    const formData = new FormData();
    // Convert Buffer to Uint8Array for Blob compatibility
    const uint8Array = new Uint8Array(fileBuffer);
    formData.append('file', new Blob([uint8Array], { type: mimeType }));
    formData.append('output_format', 'markdown');
    formData.append('extract_tables', 'true');

    const response = await fetch(`${this.config.doclingEndpoint}/convert`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Docling API error: ${response.status}`);
    }

    const result = await response.json();
    return this.parseDoclingResponse(result);
  }

  private async callDoclingLocal(
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<DoclingResult> {
    // For local execution, we'll use a simplified approach
    // In production, you'd spawn a Python process or use a local API

    const { spawn } = await import('child_process');
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');

    // Write buffer to temp file
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `docling-input-${Date.now()}.pdf`);
    const outputFile = path.join(tempDir, `docling-output-${Date.now()}.md`);

    await fs.writeFile(tempFile, fileBuffer);

    return new Promise((resolve, reject) => {
      // Call docling CLI with configured Python path
      const proc = spawn(PYTHON_PATH, [
        '-c',
        `
from docling.document_converter import DocumentConverter
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
import json
import sys

try:
    converter = DocumentConverter()
    result = converter.convert("${tempFile}")

    # Export to markdown
    markdown = result.document.export_to_markdown()

    # Get tables
    tables = []
    for table in result.document.tables:
        tables.append({
            'headers': [cell.text for cell in table.columns] if hasattr(table, 'columns') else [],
            'rows': [[cell.text for cell in row.cells] for row in table.rows] if hasattr(table, 'rows') else [],
            'pageNumber': getattr(table, 'page_number', 1)
        })

    output = {
        'markdown': markdown,
        'tables': tables,
        'pageCount': len(result.document.pages) if hasattr(result.document, 'pages') else 1,
        'extractionQuality': 'high' if len(markdown) > 500 else 'medium' if len(markdown) > 100 else 'low'
    }

    print(json.dumps(output))
except Exception as e:
    print(json.dumps({'error': str(e)}), file=sys.stderr)
    sys.exit(1)
        `,
      ]);

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', async (code) => {
        // Cleanup temp files
        try {
          await fs.unlink(tempFile);
        } catch {}

        if (code !== 0) {
          reject(new Error(`Docling failed: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          if (result.error) {
            reject(new Error(result.error));
            return;
          }
          resolve({
            markdown: result.markdown,
            tables: result.tables || [],
            metadata: {},
            pageCount: result.pageCount || 1,
            extractionQuality: result.extractionQuality || 'medium',
          });
        } catch (e) {
          reject(new Error(`Failed to parse Docling output: ${e}`));
        }
      });
    });
  }

  private parseDoclingResponse(response: Record<string, unknown>): DoclingResult {
    return {
      markdown: (response.markdown as string) || '',
      tables: (response.tables as DoclingTable[]) || [],
      metadata: (response.metadata as Record<string, unknown>) || {},
      pageCount: (response.page_count as number) || 1,
      extractionQuality: this.assessExtractionQuality(response),
    };
  }

  private assessExtractionQuality(
    response: Record<string, unknown>
  ): 'high' | 'medium' | 'low' {
    const markdown = (response.markdown as string) || '';
    const tables = (response.tables as unknown[]) || [];

    // High quality: lots of text and tables extracted
    if (markdown.length > 1000 && tables.length > 0) {
      return 'high';
    }
    // Medium: some text extracted
    if (markdown.length > 200) {
      return 'medium';
    }
    // Low: minimal extraction
    return 'low';
  }

  // ==========================================================================
  // TIER 2: PATTERN EXTRACTION
  // ==========================================================================

  private extractWithPatterns(docling: DoclingResult): Partial<ExtractedDesignData> {
    const text = docling.markdown;
    const data: Partial<ExtractedDesignData> = {
      adders: {},
    };

    // Customer Name patterns - ordered by specificity
    const namePatterns = [
      // GoodPWR CAD format: "GLENN RESIDENCE 300 HARPER CT" - extract before "RESIDENCE"
      /([A-Z][A-Z]+)\s+RESIDENCE\s+\d+/i,
      // PROJECT NAME followed by full name (may be concatenated)
      /PROJECT\s*NAME\s*\n?\s*([A-Z][A-Z\s]+?)(?:\s*\d|\s*APN|\s*AHJ|\n)/im,
      // Standard formats
      /(?:Customer|Homeowner|Owner|Client)[\s:]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
      /(?:Name|Prepared for)[\s:]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
      // Title block with name after address: "NORMAL, IL 61761 GLENN"
      /IL\s+\d{5}\s+([A-Z]{3,})\b/i,
      // RapidOCR title block format: "UTILITY: AMEREN R PAULAMAJOR"
      /UTILITY:\s*\w+\s+R\s+([A-Z]+[A-Z\s]+?)(?:\s+\d|\s+APN)/i,
    ];
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        let name = match[1].trim();
        // Handle concatenated names (MARYLOUISEDABROWSKI -> Mary Louise Dabrowski)
        if (name.match(/^[A-Z]+$/) && name.length > 8) {
          // Try to insert spaces using common name patterns
          name = name
            // Common first names that are followed by middle/last names
            .replace(/^(MARY|JOHN|JAMES|ROBERT|MICHAEL|WILLIAM|DAVID|RICHARD|JOSEPH|THOMAS|CHARLES|CHRISTOPHER|DANIEL|MATTHEW|ANTHONY|MARK|DONALD|STEVEN|PAUL|ANDREW|JOSHUA|KENNETH|KEVIN|BRIAN|GEORGE|EDWARD|RONALD|TIMOTHY|JASON|JEFFREY|RYAN|JACOB|GARY|NICHOLAS|ERIC|JONATHAN|STEPHEN|LARRY|JUSTIN|SCOTT|BRANDON|BENJAMIN|SAMUEL|GREGORY|FRANK|ALEXANDER|RAYMOND|PATRICK|JACK|DENNIS|JERRY|TYLER|AARON|JOSE|ADAM|HENRY|NATHAN|DOUGLAS|ZACHARY|PETER|KYLE|NOAH|ETHAN|JEREMY|WALTER|CHRISTIAN|KEITH|ROGER|TERRY|HARRY|RALPH|SEAN|JESSE|ROY|LOUIS|BILLY|BRUCE|EUGENE|ALBERT|WILLIE|RUSSELL|GABRIEL|RANDY|JOHNNY|WAYNE|PHILIP|PHILIP|EMMA|OLIVIA|AVA|ISABELLA|SOPHIA|MIA|CHARLOTTE|AMELIA|HARPER|EVELYN|ABIGAIL|EMILY|ELIZABETH|MILA|ELLA|AVERY|SOFIA|CAMILA|ARIA|SCARLETT|VICTORIA|MADISON|LUNA|GRACE|CHLOE|PENELOPE|LAYLA|RILEY|ZOEY|NORA|LILY|ELEANOR|HANNAH|LILLIAN|ADDISON|AUBREY|ELLIE|STELLA|NATALIE|ZOE|LEAH|HAZEL|VIOLET|AURORA|SAVANNAH|AUDREY|BROOKLYN|BELLA|CLAIRE|SKYLAR|LUCY|PAISLEY|EVERLY|ANNA|CAROLINE|NOVA|GENESIS|EMILIA|KENNEDY|SAMANTHA|MAYA|WILLOW|KINSLEY|NAOMI|AALIYAH|ELENA|SARAH|ARIANA|ALLISON|GABRIELLA|ALICE|MADELYN|CORA|RUBY|EVA|SERENITY|AUTUMN|ADELINE|HAILEY|GIANNA|VALENTINA|ISLA|ELIANA|QUINN|NEVAEH|IVY|SADIE|PIPER|LYDIA|ALEXA|JOSEPHINE|EMERY|JULIA|DELILAH|ARIANNA|VIVIAN|KAYLEE|SOPHIE|BRIELLE|MADELINE|PEYTON|RYLEE|CLARA|HADLEY|MELANIE|MACKENZIE|REAGAN|ADALYNN|LILIANA|AUBREE|JADE|KATHERINE|ISABELLE|NATALIA|RAELYNN|MARIA|ATHENA|LAUREN|ALEXANDRA|BRIANNA|BAILEY|KHLOE|ANDREA|MELODY|ALICE|MARGARET|RUTH|HELEN|DOROTHY|BETTY|NANCY|KAREN|LISA|SANDRA|DONNA|CAROL|PATRICIA|BARBARA|JENNIFER|LINDA|MARIA|SUSAN|JESSICA|SARAH|MARTHA|SHIRLEY|ANNA|DIANE|MARIE|CATHERINE|FRANCES|ANN|JOYCE|JANET|GLORIA|JEAN|CHERYL|TERESA|JOAN|ASHLEY|THERESA|JUDY|ROSE|JANICE|JULIA|MARIA|GRACE|JUDY|MEGAN|ANDREA|ALICE|BONNIE|PHYLLIS|NORMA|PAULA|DIANA|MARILYN|BRENDA|RUBY|BEVERLY|IRENE|DENISE|TAMMY|LOUISE)([A-Z])/i,
            '$1 $2')
            // Common middle names
            .replace(/(LOUISE|MARIE|ANN|LEE|ROSE|JEAN|MAE|RAE|LYNN|JO|SUE|BELLE|BETH|GRACE|FAITH|HOPE|JOY|MAY|PEARL|JUNE|DAWN|FAYE|GAIL|KAY|NELL|JANE|CLAIRE|ELIZABETH)([A-Z])/i, '$1 $2');
        }
        // Title case the name
        data.customer_name = name.split(/\s+/)
          .filter(w => w.length > 0)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        break;
      }
    }

    // Address patterns - handle both spaced and concatenated formats
    const addressPatterns = [
      // Standard format with spaces: "300 HARPER CT, NORMAL, IL 61761"
      /(\d+\s+[A-Za-z0-9\s]+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane|Blvd|Boulevard|Way|Ct|Court|Pl|Place)[,.\s]+[A-Za-z\s]+,?\s*[A-Z]{2}\s*\d{5})/i,
      // Concatenated format: "108SCOTTAGEGROVEAVE,URBANAIL61802"
      /(\d+)S?([A-Z]+(?:GROVE|VIEW|WOOD|PARK|HILL|LAKE|CREEK|RIDGE|FIELD|SPRING|VALLEY|DALE|BROOK|MEADOW)?(?:AVE|AVENUE|ST|STREET|RD|ROAD|DR|DRIVE|LN|LANE|CT|COURT|BLVD|WAY|PL|PLACE)),?\s*([A-Z]+)\s*(?:IL|FL)\s*(\d{5})/i,
      // GoodPWR title block: "108S COTTAGE GROVE AVE, URBANA IL 61802"
      /(\d+\s*S?\s+[A-Z\s]+(?:AVE|ST|RD|DR|LN|CT|BLVD|WAY|PL)),?\s*([A-Z]+)\s+(?:IL|FL)\s+(\d{5})/i,
    ];

    for (const pattern of addressPatterns) {
      const addressMatch = text.match(pattern);
      if (addressMatch) {
        if (addressMatch.length === 5) {
          // Concatenated format - reconstruct
          const streetNum = addressMatch[1];
          const streetName = addressMatch[2].replace(/([a-z])([A-Z])/g, '$1 $2');
          const city = addressMatch[3];
          const zip = addressMatch[4];
          data.address = `${streetNum} ${streetName}`;
          data.city = city.charAt(0) + city.slice(1).toLowerCase();
          data.state = 'IL';
          data.zip_code = zip;
        } else if (addressMatch.length === 4) {
          // GoodPWR title block format
          data.address = addressMatch[1].trim();
          data.city = addressMatch[2].charAt(0) + addressMatch[2].slice(1).toLowerCase();
          data.state = 'IL';
          data.zip_code = addressMatch[3];
        } else {
          // Standard format
          const fullAddress = addressMatch[1];
          data.address = fullAddress.split(',')[0].trim();
          const cityStateZip = fullAddress.match(/([A-Za-z\s]+),?\s*([A-Z]{2})\s*(\d{5})/);
          if (cityStateZip) {
            data.city = cityStateZip[1].trim();
            data.state = cityStateZip[2];
            data.zip_code = cityStateZip[3];
          }
        }
        break;
      }
    }

    // System size patterns - look for DC system size first
    const systemSizePatterns = [
      // GoodPWR format: "11.745kW DC" or "SYSTEMSIZE:11.745KWDC"
      /(\d+\.?\d*)\s*kW\s*DC/i,
      /SYSTEMSIZE[\s:]*(\d+\.?\d*)\s*KW\s*DC/i,
      /DC\s*SYSTEM\s*SIZE[\s:]*(\d+\.?\d*)\s*kW/i,
      /STC\s*DC[\s:]+.*?(\d+\.?\d*)\s*kW/i,
      // Generic patterns
      /(\d+\.?\d*)\s*kW(?:p|ac|dc)?/i,
      /System\s*Size[\s:]+(\d+\.?\d*)/i,
      /Total[\s:]+(\d+\.?\d*)\s*kW/i,
    ];
    for (const pattern of systemSizePatterns) {
      const match = text.match(pattern);
      if (match) {
        const size = parseFloat(match[1]);
        // Validate reasonable system size (1kW to 100kW for residential)
        if (size >= 1 && size <= 100) {
          data.system_size_kw = size;
          data.system_size_watts = Math.round(size * 1000);
          break;
        }
      }
    }

    // Module count patterns
    const modulePatterns = [
      // GoodPWR format: "29 MODULES ROOF MOUNTED" or "49 MODULES-GROUND MOUNTED"
      /(\d+)\s*MODULES[-\s]*(?:ROOF|GROUND)/i,
      /\((\d+)\)\s*(?:LONGI|Q[\-\s]?CELLS|REC|JINKO|CANADIAN|TRINA|HANWHA)/i,
      // Ground mount format: "(N) 49 - HANWHA Q-CELLS"
      /\(N\)\s*(\d+)\s*[-–]\s*(?:LONGI|HANWHA|Q[\-\s]?CELLS)/i,
      /MODULE[\s:]+\(?(\d+)\)?\s*\(?N\)?/i,
      /(\d+)\s*(?:modules?|panels?)/i,
      /Module\s*(?:Count|Qty)[\s:]+(\d+)/i,
      /Quantity[\s:]+(\d+)\s*(?:x|×)/i,
    ];
    for (const pattern of modulePatterns) {
      const match = text.match(pattern);
      if (match) {
        const count = parseInt(match[1]);
        // Validate reasonable module count (1 to 100 for residential)
        if (count >= 1 && count <= 100) {
          data.module_count = count;
          break;
        }
      }
    }

    // Module wattage patterns
    const wattagePatterns = [
      // GoodPWR format: "LONGI LR5-54HPB-405M" - wattage in model name
      /LONGI[\w-]+?(\d{3})M/i,
      /QCELLS[\w-]+?(\d{3})/i,
      // Standard patterns
      /(\d{3,4})\s*W(?:att)?(?:s)?(?:\s*(?:module|panel))?/i,
      /Module[\s:]+.*?(\d{3,4})W/i,
    ];
    for (const pattern of wattagePatterns) {
      const match = text.match(pattern);
      if (match) {
        const wattage = parseInt(match[1]);
        if (wattage >= 200 && wattage <= 700) {
          data.module_wattage = wattage;
          break;
        }
      }
    }

    // Module model patterns
    const modelPatterns = [
      // GoodPWR format: "MODULE: 29 (N) LONGILR5-54HPB-405M"
      /MODULE[\s:]+\d+\s*\(N\)\s*(LONGI[\w-]+)/i,
      // GoodPWR format: "(29) LONGI LR5-54HPB-405M" or "(N)15-LONGISOLARLR5-54HPB-405M"
      /\(N?\)?\s*\d+[-\s]*(LONGI\s*(?:SOLAR\s*)?[\w-]+)/i,
      /\(\d+\)\s*(LONGI\s*[\w-]+)/i,
      /MODULE[\s:]+\(?[\dN]+\)?\s*(LONGI\s*[\w-]+)/i,
      // Q-Cells/HANWHA: "(N) 49 - HANWHA Q-CELLS Q.PEAK DUO BLK ML-G10+ (410W)"
      /\(N\)\s*\d+\s*[-–]\s*(HANWHA\s*Q[\-\s]?CELLS[\s\w\.\+\-]+?)(?:\s*MODULES|\s*\()/i,
      /(Q[\-\s]?CELLS\s*Q\.?PEAK[\s\w\.\+\-]+)/i,
      /(HANWHA[\s\w\.\+\-]+?(?:\d{3}W|\(\d{3}W\)))/i,
      // Other manufacturers
      /(LONGI\s*(?:SOLAR\s*)?LR[\w-]+)/i,
      /(QCELLS?\s*Q\.?PEAK[\w-]+)/i,
      /(REC[\w-]+\d+)/i,
      /(JINKO[\w-]+)/i,
      /(CANADIAN[\w-]+)/i,
      /(TRINA[\w-]+)/i,
      /(?:Module|Panel)[\s:]+([A-Z]{2,}[\w-]+\d+)/i,
    ];
    for (const pattern of modelPatterns) {
      const match = text.match(pattern);
      if (match) {
        let model = match[1].trim();
        // Clean up concatenated text: "LONGISOLARLR5" -> "LONGI SOLAR LR5"
        model = model
          .replace(/LONGI\s*SOLAR/i, 'LONGI ')
          .replace(/LONGI([A-Z])/i, 'LONGI $1')
          .replace(/\s+/g, ' ')
          .trim();
        data.module_model = model;
        break;
      }
    }

    // Inverter model patterns
    const inverterPatterns = [
      // GoodPWR format: "INVERTER:29(N)ENPHASEIQ8PLUS-72-M-US"
      /INVERTER[\s:]*\d+\s*\(N\)\s*(ENPHASE[\w-]+)/i,
      // GoodPWR format: "(29) ENPHASE IQ8PLUS-72-M-US" or "(N)15-ENPHASEENERGYINC.IQ8PLUS"
      /\(N?\)?\s*\d+[-\s]*(ENPHASE[\w\s.-]*IQ[\w-]+)/i,
      /\(\d+\)\s*(ENPHASE\s*IQ[\w-]+)/i,
      /INVERTER[\s:]+\(?[\dN]+\)?\s*(ENPHASE[\w\s.-]*IQ[\w-]+)/i,
      // Tesla inverters: "(N) 15 - TESLA MCI-2/RSD"
      /\(N\)\s*\d+\s*[-–]\s*(TESLA\s*[\w-\/]+)/i,
      // Enphase patterns
      /(ENPHASE\s*(?:ENERGY\s*INC\.?\s*)?IQ[\w-]+)/i,
      /(IQ\s*8?\s*PLUS[\w-]*)/i,
      // SolarEdge patterns
      /(SOLAREDGE[\w\s-]+)/i,
      /(SE\d+[\w-]*)/i,
      // Generic
      /(?:Inverter)[\s:]+([A-Za-z0-9\s-]+)/i,
    ];
    for (const pattern of inverterPatterns) {
      const match = text.match(pattern);
      if (match) {
        let inverter = match[1].trim();
        // Clean up: "ENPHASEENERGYINC.IQ8PLUS-72-M-USMICRO-INVERTERS" -> "ENPHASE IQ8PLUS-72-M-US"
        inverter = inverter
          .replace(/ENPHASE\s*ENERGY\s*INC\.?\s*/i, 'ENPHASE ')
          .replace(/MICRO[-\s]*INVERTERS?/i, '')
          .replace(/\[[\dPW,]+\]/g, '')  // Remove [1P,3W] etc
          .replace(/\s+/g, ' ')
          .trim();
        data.inverter_model = inverter;
        break;
      }
    }

    // AHJ/Jurisdiction patterns - GoodPWR CADs list this in GOVERNING CODES section
    const ahjPatterns = [
      // GoodPWR format: Listed in governing codes section like "NORMAL TOWN" or "VILLAGE OF X"
      /ANY\s*OTHER\s*REQUIREMENTS\s*OF[\s:]*\n?[-·•]?\s*([A-Z][A-Z\s]+(?:TOWN|CITY|VILLAGE|COUNTY))/im,
      /REQUIREMENTS\s*OF[\s:]*([A-Z]+\s*(?:TOWN|CITY|VILLAGE))/i,
      // Direct mention
      /([A-Z]+)\s+TOWN\b/,
      /VILLAGE\s+OF\s+([A-Z]+)/i,
      /CITY\s+OF\s+([A-Z]+)/i,
      // Standard AHJ patterns
      /(?:AHJ|Jurisdiction|Permit.*?Authority)[\s:]+([A-Za-z\s]+(?:City|County|Township|Village|Town))/i,
      /AHJ[\s:]+(?:VILLAGE|CITY|COUNTY|TOWN)(?:\s*OF)?\s*\(?([A-Za-z\s]+)/i,
    ];
    for (const pattern of ahjPatterns) {
      const match = text.match(pattern);
      if (match) {
        let ahj = match[1].trim();
        // Clean up OCR artifacts
        ahj = ahj.replace(/[(\[\]{}·•-]/g, '').trim();
        // Skip if it's a common false positive
        if (ahj.length < 3 || /^(THE|AND|FOR|WITH)$/i.test(ahj)) continue;
        // Title case
        data.ahj_jurisdiction = ahj.split(/\s+/)
          .filter(w => w.length > 0)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        break;
      }
    }

    // Utility company patterns - GoodPWR lists in GOVERNING CODES section
    const utilityPatterns = [
      // GoodPWR format: "AMEREN (IL)" in governing codes
      /[-·•]\s*(AMEREN|COMED|DUKE|FPL)\s*\(?[A-Z]{2}\)?/i,
      /(AMEREN|COMED)\s*\([A-Z]{2}\)/i,
      // Standard utility names
      /(ComEd|Ameren|Duke\s*Energy|FPL|Florida\s*Power|PG&E|SCE|SDG&E|PSEG|Con\s*Edison|National\s*Grid)/i,
      /(?:Utility|Electric\s*Company)[\s:]+([A-Za-z\s&]+)/i,
      /UTILITY[\s:]+([A-Za-z]+)/i,
    ];
    for (const pattern of utilityPatterns) {
      const match = text.match(pattern);
      if (match) {
        let utility = match[1].trim();
        // Normalize common utility names
        if (/ameren/i.test(utility)) utility = 'Ameren';
        if (/comed/i.test(utility)) utility = 'ComEd';
        data.utility_company = utility;
        break;
      }
    }

    // Main panel info - GoodPWR format: "SERVICEPANELBRAND:SQUARED(QO)"
    const panelPatterns = [
      /SERVICE\s*PANEL\s*BRAND[\s:]+([A-Z]+(?:\s*\([A-Z0-9]+\))?)/i,
      /MAIN\s*PANEL[\s:]+([A-Z]+)/i,
      /PANEL\s*(?:TYPE|BRAND)[\s:]+([A-Z]+)/i,
    ];
    for (const pattern of panelPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.main_panel_brand = match[1].trim();
        break;
      }
    }

    // Main breaker amperage - GoodPWR format: "(N)200AMETERWITHLEVERBYPASS"
    const amperagePatterns = [
      /\(N\)\s*(\d+)\s*A\s*METER/i,
      /(\d+)\s*A(?:MP)?\s*(?:MAIN|METER|SERVICE)/i,
      /MAIN\s*BREAKER[\s:]+(\d+)\s*A/i,
    ];
    for (const pattern of amperagePatterns) {
      const match = text.match(pattern);
      if (match) {
        const amps = parseInt(match[1]);
        if (amps >= 100 && amps <= 400) {
          data.main_breaker_amps = amps;
          break;
        }
      }
    }

    // Adders detection - improved for GoodPWR CAD format
    // MPU patterns: explicit MPU, new load center, new panel, or new meter with lever bypass (meter/main combo)
    const mpuPattern = /(?:MPU|Main Panel Upgrade|Panel Upgrade|\(N\)\s*\d+A\s*LOAD\s*CENTER|NEW\s*\d+A\s*PANEL|\(N\)\s*\d+A\s*METER\s*(?:WITH|W\/?)\s*LEVER\s*BYPASS)/i;
    const mpuMatches = text.match(new RegExp(mpuPattern.source, 'gi')) || [];
    console.log('[HybridProcessor] MPU pattern matches:', mpuMatches);

    data.adders = {
      // MPU: Look for new load center, panel upgrade, or 200A upgrade
      has_mpu: mpuMatches.length > 0,
      has_ground_mount: /(?:Ground Mount|Ground-Mount|Pole Mount|GROUND\s*MOUNTED)/i.test(text),
      has_trench: /(?:Trench|Trenching|Underground Conduit|UNDERGROUND\s*RUN)/i.test(text),
      has_battery: /(?:Battery|Powerwall|Energy Storage|ESS|Encharge|IQ\s*BATTERY)/i.test(text),
      has_backup_panel: /(?:BACKUP\s*(?:LOAD\s*)?PANEL|CRITICAL\s*LOAD\s*PANEL|PROTECTED\s*LOAD)/i.test(text),
      has_backup_gateway: /(?:BACKUP\s*GATEWAY|TESLA\s*(?:BACKUP\s*)?GATEWAY)/i.test(text),
      has_ev_charger: /(?:EV Charger|Electric Vehicle|EVSE|Level 2|ChargePoint|EV\s*READY)/i.test(text),
      // Steep pitch: 35°+ or 8:12+ roof pitch
      has_steep_pitch: /(?:Steep|[89]:\d{2}|1[012]:\d{2}|TILT\s*[-:]?\s*(?:3[5-9]|4[0-9]|5[0-9])°?)/i.test(text),
      // Flat roof: 0-10° or 0:12-2:12 pitch
      has_flat_roof: /(?:Flat Roof|Low Slope|[012]:\d{2}|Ballasted|TILT\s*[-:]?\s*[0-9]°)/i.test(text),
      has_tile_roof: /(?:Tile Roof|Clay Tile|Concrete Tile|S-Tile|SPANISH\s*TILE)/i.test(text),
      has_metal_roof: /(?:Metal Roof|Standing Seam|METAL\s*PANEL)/i.test(text),
      has_comp_shingle: /(?:COMP|ASPHALT|COMPOSITION)\s*SHINGLE/i.test(text),
      has_three_story: /(?:Three Story|3 Story|3-Story|Third Floor|THREE[-\s]*STORY)/i.test(text),
      has_two_story: /(?:Two Story|2 Story|2-Story|Second Floor|TWO[-\s]*STORY)/i.test(text),
      has_one_story: /(?:One Story|1 Story|1-Story|Single Story|ONE[-\s]*STORY)/i.test(text),
      has_attic_run: /(?:ATTIC\s*RUN|RUN\s*(?:IN|THROUGH)\s*ATTIC)/i.test(text),
      has_derate: /(?:DERATE|DE-RATE|BUSBAR\s*RATING)/i.test(text),
    };

    // Trench length extraction - handle "TRENCH~25'-0"" format, sum multiple trenches
    const trenchPattern = /TRENCH[\s~:]*(\d+)['\-\s]*(?:\d*["\s]?)?(?:ft|feet)?/gi;
    let totalTrenchLength = 0;
    let trenchMatch;
    while ((trenchMatch = trenchPattern.exec(text)) !== null) {
      totalTrenchLength += parseInt(trenchMatch[1]);
    }
    if (totalTrenchLength > 0) {
      data.adders!.trench_length_ft = totalTrenchLength;
      data.adders!.has_trench = true;
    }

    // Battery count extraction - handle "POWERWALL 3" and "(N) 01-TESLA POWERWALL"
    const batteryMatch = text.match(/\(N\)\s*0?(\d+)[-\s]*(?:TESLA\s*)?POWERWALL/i) ||
                         text.match(/(\d+)\s*(?:x\s*)?(?:Powerwall|Battery|Encharge)/i);
    if (batteryMatch) {
      data.adders!.battery_count = parseInt(batteryMatch[1]);
    }

    // Battery model extraction
    const batteryModelMatch = text.match(/(POWERWALL\s*\d+|ENCHARGE\s*\d+|IQ\s*BATTERY\s*\d+)/i);
    if (batteryModelMatch) {
      data.adders!.battery_model = batteryModelMatch[1].trim();
    }

    // Roof sections from tables
    if (docling.tables.length > 0) {
      data.roof_sections = this.extractRoofSectionsFromTables(docling.tables);
      if (data.roof_sections && data.roof_sections.length > 0) {
        data.array_count = data.roof_sections.length;
      }
    }

    return data;
  }

  private extractRoofSectionsFromTables(tables: DoclingTable[]): RoofSection[] {
    const sections: RoofSection[] = [];

    for (const table of tables) {
      // Look for array/roof section tables
      const headerText = table.headers.join(' ').toLowerCase();
      if (
        headerText.includes('array') ||
        headerText.includes('roof') ||
        headerText.includes('panel') ||
        headerText.includes('module')
      ) {
        for (const row of table.rows) {
          const section: RoofSection = {
            section_name: row[0] || 'Unknown',
            panel_count: 0,
          };

          // Find panel count column
          for (let i = 0; i < row.length; i++) {
            const cell = row[i];
            const header = table.headers[i]?.toLowerCase() || '';

            if (header.includes('count') || header.includes('qty') || header.includes('panel')) {
              const num = parseInt(cell);
              if (!isNaN(num) && num > 0 && num < 100) {
                section.panel_count = num;
              }
            }

            if (header.includes('pitch') || header.includes('tilt')) {
              const pitchMatch = cell.match(/(\d+):(\d+)|(\d+)°/);
              if (pitchMatch) {
                if (pitchMatch[1] && pitchMatch[2]) {
                  section.pitch_ratio = `${pitchMatch[1]}:${pitchMatch[2]}`;
                  section.pitch_degrees = Math.round(
                    Math.atan(parseInt(pitchMatch[1]) / parseInt(pitchMatch[2])) * 180 / Math.PI
                  );
                } else if (pitchMatch[3]) {
                  section.pitch_degrees = parseInt(pitchMatch[3]);
                }
              }
            }

            if (header.includes('azimuth') || header.includes('orientation')) {
              const azMatch = cell.match(/(\d+)°?/);
              if (azMatch) {
                section.azimuth = parseInt(azMatch[1]);
              }
              const dirMatch = cell.match(/\b(N|NE|E|SE|S|SW|W|NW|North|South|East|West)\b/i);
              if (dirMatch) {
                section.orientation = dirMatch[1].toUpperCase().charAt(0) +
                  (dirMatch[1].length > 1 ? dirMatch[1].toUpperCase().charAt(1) : '');
              }
            }
          }

          if (section.panel_count > 0) {
            sections.push(section);
          }
        }
      }
    }

    return sections;
  }

  // ==========================================================================
  // TIER 3A: CLAUDE TEXT FALLBACK (Token Optimized)
  // ==========================================================================

  private async extractWithClaudeText(
    extractedText: string,
    existingData: Partial<ExtractedDesignData> | undefined,
    missingFields: string[]
  ): Promise<{ data: Partial<ExtractedDesignData>; tokensUsed: number }> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized');
    }

    // Truncate text to reduce tokens (first 8000 chars usually contains key info)
    const truncatedText = extractedText.slice(0, 8000);

    // Build a focused prompt for missing fields only
    const prompt = `Extract the following missing information from this solar design document text.

MISSING FIELDS TO FIND:
${missingFields.map(f => `- ${f}`).join('\n')}

DOCUMENT TEXT:
${truncatedText}

${existingData ? `
ALREADY EXTRACTED (verify if needed):
${JSON.stringify(existingData, null, 2)}
` : ''}

Return ONLY a JSON object with the missing fields. Use null for values you cannot find.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: this.config.maxClaudeTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Calculate tokens used
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    // Parse response
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not find JSON in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return { data: parsed, tokensUsed };
  }

  // ==========================================================================
  // TIER 3B: CLAUDE VISION FALLBACK (Last Resort)
  // ==========================================================================

  private async extractWithClaudeVision(
    fileBuffer: Buffer,
    filename: string
  ): Promise<{ data: ExtractedDesignData; tokensUsed: number }> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized');
    }

    const base64 = fileBuffer.toString('base64');

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: this.config.maxClaudeTokens,
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
              text: CLAUDE_VISION_PROMPT,
            },
          ],
        },
      ],
    });

    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not find JSON in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      data: this.normalizeExtractedData(parsed),
      tokensUsed,
    };
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  private calculateConfidence(data: Partial<ExtractedDesignData> | undefined): number {
    if (!data) return 0;

    const criticalFields = [
      'customer_name',
      'address',
      'system_size_kw',
      'module_count',
    ];
    const importantFields = [
      'city',
      'state',
      'module_wattage',
      'module_model',
      'inverter_model',
    ];
    const optionalFields = [
      'roof_type',
      'array_count',
      'ahj_jurisdiction',
      'utility_company',
    ];

    let score = 0;
    let maxScore = 0;

    // Critical fields: 25 points each
    for (const field of criticalFields) {
      maxScore += 25;
      if (data[field as keyof ExtractedDesignData]) {
        score += 25;
      }
    }

    // Important fields: 10 points each
    for (const field of importantFields) {
      maxScore += 10;
      if (data[field as keyof ExtractedDesignData]) {
        score += 10;
      }
    }

    // Optional fields: 5 points each
    for (const field of optionalFields) {
      maxScore += 5;
      if (data[field as keyof ExtractedDesignData]) {
        score += 5;
      }
    }

    // Adders: 2 points for any adder detected
    if (data.adders && Object.values(data.adders).some(Boolean)) {
      score += 2;
      maxScore += 2;
    }

    return score / maxScore;
  }

  private getMissingCriticalFields(data: Partial<ExtractedDesignData> | undefined): string[] {
    const criticalFields = [
      'customer_name',
      'address',
      'system_size_kw',
      'module_count',
      'module_wattage',
      'module_model',
    ];

    if (!data) return criticalFields;

    return criticalFields.filter(field => !data[field as keyof ExtractedDesignData]);
  }

  private mergeExtractionResults(
    existing: Partial<ExtractedDesignData>,
    newData: Partial<ExtractedDesignData>
  ): Partial<ExtractedDesignData> {
    const merged = { ...existing };

    for (const [key, value] of Object.entries(newData)) {
      if (value !== null && value !== undefined) {
        if (key === 'adders' && typeof value === 'object') {
          merged.adders = { ...merged.adders, ...(value as AdderFlags) };
        } else if (!(key in merged) || merged[key as keyof ExtractedDesignData] === undefined) {
          (merged as Record<string, unknown>)[key] = value;
        }
      }
    }

    return merged;
  }

  private normalizeExtractedData(data: Partial<ExtractedDesignData>): ExtractedDesignData {
    console.log('[HybridProcessor] Normalizing data, input has_mpu:', data.adders?.has_mpu);

    const normalized = {
      customer_name: data.customer_name,
      address: data.address,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code,
      system_size_kw: data.system_size_kw,
      system_size_watts: data.system_size_watts || (data.system_size_kw ? Math.round(data.system_size_kw * 1000) : undefined),
      module_count: data.module_count,
      module_wattage: data.module_wattage,
      module_model: data.module_model,
      inverter_model: data.inverter_model,
      array_count: data.array_count,
      roof_type: data.roof_type,
      roof_sections: data.roof_sections,
      ahj_jurisdiction: data.ahj_jurisdiction,
      utility_company: data.utility_company,
      adders: {
        has_mpu: data.adders?.has_mpu || false,
        has_ground_mount: data.adders?.has_ground_mount || false,
        has_trench: data.adders?.has_trench || false,
        trench_length_ft: data.adders?.trench_length_ft,
        has_battery: data.adders?.has_battery || false,
        battery_count: data.adders?.battery_count,
        battery_model: data.adders?.battery_model,
        has_backup_panel: data.adders?.has_backup_panel || false,
        has_backup_gateway: data.adders?.has_backup_gateway || false,
        has_ev_charger: data.adders?.has_ev_charger || false,
        has_steep_pitch: data.adders?.has_steep_pitch || false,
        has_flat_roof: data.adders?.has_flat_roof || false,
        has_tile_roof: data.adders?.has_tile_roof || false,
        has_metal_roof: data.adders?.has_metal_roof || false,
        has_comp_shingle: data.adders?.has_comp_shingle || false,
        has_three_story: data.adders?.has_three_story || false,
        has_two_story: data.adders?.has_two_story || false,
        has_one_story: data.adders?.has_one_story || false,
        has_attic_run: data.adders?.has_attic_run || false,
        has_derate: data.adders?.has_derate || false,
      },
      raw_text: data.raw_text,
      confidence_score: data.confidence_score,
    };

    console.log('[HybridProcessor] Normalized data, output has_mpu:', normalized.adders.has_mpu);
    return normalized;
  }
}

// ==========================================================================
// CLAUDE VISION PROMPT (Used only for full fallback)
// ==========================================================================

const CLAUDE_VISION_PROMPT = `Analyze this solar design/planset PDF and extract project details.

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
      "section_name": "Array 1 or descriptive name",
      "panel_count": number of panels on this section,
      "pitch_degrees": roof pitch in degrees,
      "pitch_ratio": "X:12",
      "azimuth": compass direction (0-360),
      "orientation": "N|NE|E|SE|S|SW|W|NW"
    }
  ],
  "ahj_jurisdiction": "Authority Having Jurisdiction name",
  "utility_company": "Utility company name",
  "has_mpu": boolean (true if Main Panel Upgrade - look for: "(N) XXXA METER WITH LEVER BYPASS", "(N) XXXA LOAD CENTER", "NEW PANEL", "MPU", "Main Panel Upgrade", or any NEW meter/panel being installed),
  "has_ground_mount": boolean (true if ground-mounted system, not roof-mounted),
  "has_trench": boolean (true if trenching work is required),
  "trench_length_ft": number or null (total trench length in feet),
  "has_battery": boolean (true if battery storage like Powerwall, Encharge),
  "battery_count": number or null,
  "battery_model": "string or null (e.g., POWERWALL 3, ENCHARGE 10)",
  "has_ev_charger": boolean,
  "has_steep_pitch": boolean (true if any roof section is 35°+ or 8:12+ pitch),
  "has_flat_roof": boolean,
  "has_tile_roof": boolean,
  "has_metal_roof": boolean,
  "has_three_story": boolean,
  "has_backup_panel": boolean (true if backup/critical load panel),
  "has_attic_run": boolean (true if conduit runs through attic)
}

Return ONLY the JSON object, no other text.`;

// ==========================================================================
// EXPORTS
// ==========================================================================

export default HybridDocumentProcessor;

// Factory function for easy instantiation
export function createHybridProcessor(config?: Partial<ProcessingConfig>) {
  return new HybridDocumentProcessor(config);
}
