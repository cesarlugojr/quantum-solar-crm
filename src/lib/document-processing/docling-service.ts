/**
 * Docling Service
 *
 * Provides document extraction using IBM's Docling library.
 * Supports multiple deployment modes:
 * 1. Local Python subprocess (development)
 * 2. Docling API server (production)
 * 3. Docker container (production alternative)
 *
 * Installation requirements for local mode:
 * pip install docling
 *
 * For Docker mode, see docker-compose.docling.yml
 */

import { spawn } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

export interface DoclingExtractionResult {
  success: boolean;
  markdown: string;
  tables: ExtractedTable[];
  images: ExtractedImage[];
  metadata: DocumentMetadata;
  pageCount: number;
  extractionQuality: 'high' | 'medium' | 'low';
  processingTimeMs: number;
  error?: string;
}

export interface ExtractedTable {
  id: string;
  headers: string[];
  rows: string[][];
  pageNumber: number;
  confidence: number;
}

export interface ExtractedImage {
  id: string;
  pageNumber: number;
  description?: string;
  base64?: string; // Only if extractImages is enabled
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  creationDate?: string;
  pageSize?: { width: number; height: number };
  isScanned: boolean;
  hasOCRText: boolean;
  language?: string;
}

export interface DoclingConfig {
  mode: 'local' | 'api' | 'docker';
  apiEndpoint?: string;
  pythonPath?: string;
  dockerImage?: string;
  timeout: number; // ms
  extractTables: boolean;
  extractImages: boolean;
  ocrEnabled: boolean;
  maxPages?: number;
}

const DEFAULT_CONFIG: DoclingConfig = {
  mode: (process.env.DOCLING_MODE as 'local' | 'api' | 'docker') || 'local',
  apiEndpoint: process.env.DOCLING_API_ENDPOINT || 'http://localhost:8080',
  // Use Xcode Python where docling is installed, fallback to python3
  pythonPath: process.env.PYTHON_PATH || '/Applications/Xcode.app/Contents/Developer/usr/bin/python3',
  dockerImage: process.env.DOCLING_DOCKER_IMAGE || 'ds4sd/docling:latest',
  timeout: 120000, // 2 minutes
  extractTables: true,
  extractImages: false, // Disabled by default to save memory
  ocrEnabled: true,
  maxPages: 50,
};

// ============================================================================
// DOCLING SERVICE CLASS
// ============================================================================

export class DoclingService {
  private config: DoclingConfig;
  private isAvailable: boolean | null = null;

  constructor(config: Partial<DoclingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if Docling is available in the current environment
   */
  async checkAvailability(): Promise<boolean> {
    if (this.isAvailable !== null) {
      return this.isAvailable;
    }

    try {
      switch (this.config.mode) {
        case 'api':
          this.isAvailable = await this.checkApiAvailability();
          break;
        case 'docker':
          this.isAvailable = await this.checkDockerAvailability();
          break;
        case 'local':
        default:
          this.isAvailable = await this.checkLocalAvailability();
          break;
      }
    } catch {
      this.isAvailable = false;
    }

    console.log(`[DoclingService] Availability check: ${this.isAvailable ? 'Available' : 'Not available'} (mode: ${this.config.mode})`);
    return this.isAvailable;
  }

  /**
   * Extract content from a document
   */
  async extract(
    fileBuffer: Buffer,
    mimeType: string = 'application/pdf',
    filename?: string
  ): Promise<DoclingExtractionResult> {
    const startTime = Date.now();

    // Check availability
    const available = await this.checkAvailability();
    if (!available) {
      return {
        success: false,
        markdown: '',
        tables: [],
        images: [],
        metadata: { isScanned: false, hasOCRText: false },
        pageCount: 0,
        extractionQuality: 'low',
        processingTimeMs: Date.now() - startTime,
        error: `Docling not available in ${this.config.mode} mode`,
      };
    }

    try {
      let result: DoclingExtractionResult;

      switch (this.config.mode) {
        case 'api':
          result = await this.extractViaApi(fileBuffer, mimeType, filename);
          break;
        case 'docker':
          result = await this.extractViaDocker(fileBuffer, mimeType, filename);
          break;
        case 'local':
        default:
          result = await this.extractViaLocal(fileBuffer, mimeType, filename);
          break;
      }

      result.processingTimeMs = Date.now() - startTime;
      return result;
    } catch (error) {
      console.error('[DoclingService] Extraction failed:', error);
      return {
        success: false,
        markdown: '',
        tables: [],
        images: [],
        metadata: { isScanned: false, hasOCRText: false },
        pageCount: 0,
        extractionQuality: 'low',
        processingTimeMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown extraction error',
      };
    }
  }

  // ==========================================================================
  // LOCAL PYTHON MODE
  // ==========================================================================

  private async checkLocalAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
      const proc = spawn(this.config.pythonPath!, ['-c', 'import docling; print("ok")']);

      let output = '';
      proc.stdout.on('data', (data) => {
        output += data.toString();
      });

      proc.on('close', (code) => {
        resolve(code === 0 && output.includes('ok'));
      });

      proc.on('error', () => {
        resolve(false);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        proc.kill();
        resolve(false);
      }, 10000);
    });
  }

  private async extractViaLocal(
    fileBuffer: Buffer,
    mimeType: string,
    filename?: string
  ): Promise<DoclingExtractionResult> {
    // Create temp directory and files
    const tempDir = join(tmpdir(), `docling-${randomUUID()}`);
    await mkdir(tempDir, { recursive: true });

    const inputFile = join(tempDir, filename || 'input.pdf');
    const outputFile = join(tempDir, 'output.json');

    await writeFile(inputFile, fileBuffer);

    const pythonScript = `
import json
import sys
from pathlib import Path

try:
    from docling.document_converter import DocumentConverter
    from docling.datamodel.pipeline_options import PdfPipelineOptions

    # Configure pipeline
    pipeline_options = PdfPipelineOptions()
    pipeline_options.do_ocr = ${this.config.ocrEnabled ? 'True' : 'False'}
    pipeline_options.do_table_structure = ${this.config.extractTables ? 'True' : 'False'}

    # Use RapidOCR for best extraction on CAD drawings (faster than EasyOCR, better than ocrmac)
    try:
        from docling.datamodel.pipeline_options import RapidOcrOptions
        pipeline_options.ocr_options = RapidOcrOptions(
            lang=["en"],
            force_full_page_ocr=True  # Full page OCR for CAD drawings
        )
    except ImportError:
        # Fall back to EasyOCR if RapidOCR not available
        try:
            from docling.datamodel.pipeline_options import EasyOcrOptions
            pipeline_options.ocr_options = EasyOcrOptions(
                lang=["en"],
                force_full_page_ocr=False,
                use_gpu=False
            )
        except ImportError:
            pass  # Fall back to default OCR (ocrmac)

    # Convert document
    converter = DocumentConverter()
    result = converter.convert("${inputFile.replace(/\\/g, '/')}")

    # Export to markdown
    markdown = result.document.export_to_markdown()

    # Extract tables
    tables = []
    if hasattr(result.document, 'tables'):
        for i, table in enumerate(result.document.tables):
            table_data = {
                'id': f'table_{i}',
                'headers': [],
                'rows': [],
                'pageNumber': getattr(table, 'prov', [{}])[0].get('page_no', 1) if hasattr(table, 'prov') else 1,
                'confidence': 0.9
            }

            # Extract table content
            if hasattr(table, 'data') and hasattr(table.data, 'grid'):
                grid = table.data.grid
                if len(grid) > 0:
                    table_data['headers'] = [str(cell.text) if hasattr(cell, 'text') else str(cell) for cell in grid[0]]
                    for row in grid[1:]:
                        table_data['rows'].append([str(cell.text) if hasattr(cell, 'text') else str(cell) for cell in row])

            tables.append(table_data)

    # Extract images (metadata only by default)
    images = []
    if hasattr(result.document, 'pictures'):
        for i, pic in enumerate(result.document.pictures):
            images.append({
                'id': f'image_{i}',
                'pageNumber': getattr(pic, 'prov', [{}])[0].get('page_no', 1) if hasattr(pic, 'prov') else 1,
                'description': getattr(pic, 'caption', None)
            })

    # Get metadata
    metadata = {
        'title': getattr(result.document, 'name', None),
        'author': None,
        'creationDate': None,
        'isScanned': False,
        'hasOCRText': ${this.config.ocrEnabled ? 'True' : 'False'},
        'language': 'en'
    }

    # Get page count
    page_count = len(result.document.pages) if hasattr(result.document, 'pages') else 1

    # Assess quality
    quality = 'high' if len(markdown) > 1000 else 'medium' if len(markdown) > 200 else 'low'

    output = {
        'success': True,
        'markdown': markdown,
        'tables': tables,
        'images': images,
        'metadata': metadata,
        'pageCount': page_count,
        'extractionQuality': quality
    }

    # Write output
    with open("${outputFile.replace(/\\/g, '/')}", 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False)

    print('SUCCESS')

except Exception as e:
    import traceback
    error_output = {
        'success': False,
        'error': str(e),
        'traceback': traceback.format_exc(),
        'markdown': '',
        'tables': [],
        'images': [],
        'metadata': {'isScanned': False, 'hasOCRText': False},
        'pageCount': 0,
        'extractionQuality': 'low'
    }
    with open("${outputFile.replace(/\\/g, '/')}", 'w', encoding='utf-8') as f:
        json.dump(error_output, f, ensure_ascii=False)
    print('ERROR: ' + str(e), file=sys.stderr)
    sys.exit(1)
`;

    return new Promise((resolve, reject) => {
      const proc = spawn(this.config.pythonPath!, ['-c', pythonScript]);

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timeout = setTimeout(() => {
        proc.kill();
        reject(new Error('Docling processing timeout'));
      }, this.config.timeout);

      proc.on('close', async (code) => {
        clearTimeout(timeout);

        // Cleanup
        try {
          await unlink(inputFile);
        } catch {}

        try {
          // Read output file
          const { readFile } = await import('fs/promises');
          const outputData = await readFile(outputFile, 'utf-8');
          await unlink(outputFile);

          const result = JSON.parse(outputData);
          resolve(result);
        } catch (readError) {
          reject(new Error(`Failed to read Docling output: ${stderr || readError}`));
        }

        // Cleanup temp dir
        try {
          const { rmdir } = await import('fs/promises');
          await rmdir(tempDir);
        } catch {}
      });

      proc.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  // ==========================================================================
  // API SERVER MODE
  // ==========================================================================

  private async checkApiAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async extractViaApi(
    fileBuffer: Buffer,
    mimeType: string,
    filename?: string
  ): Promise<DoclingExtractionResult> {
    const formData = new FormData();
    // Convert Buffer to Uint8Array for Blob compatibility
    const uint8Array = new Uint8Array(fileBuffer);
    formData.append('file', new Blob([uint8Array], { type: mimeType }), filename || 'document.pdf');
    formData.append('extract_tables', String(this.config.extractTables));
    formData.append('extract_images', String(this.config.extractImages));
    formData.append('ocr_enabled', String(this.config.ocrEnabled));
    if (this.config.maxPages) {
      formData.append('max_pages', String(this.config.maxPages));
    }

    const response = await fetch(`${this.config.apiEndpoint}/convert`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Docling API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return this.normalizeApiResponse(result);
  }

  private normalizeApiResponse(response: Record<string, unknown>): DoclingExtractionResult {
    return {
      success: true,
      markdown: (response.markdown as string) || '',
      tables: (response.tables as ExtractedTable[]) || [],
      images: (response.images as ExtractedImage[]) || [],
      metadata: (response.metadata as DocumentMetadata) || { isScanned: false, hasOCRText: false },
      pageCount: (response.page_count as number) || (response.pageCount as number) || 1,
      extractionQuality: this.assessQuality(response),
      processingTimeMs: 0,
    };
  }

  // ==========================================================================
  // DOCKER MODE
  // ==========================================================================

  private async checkDockerAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
      const proc = spawn('docker', ['ps']);

      proc.on('close', (code) => {
        resolve(code === 0);
      });

      proc.on('error', () => {
        resolve(false);
      });
    });
  }

  private async extractViaDocker(
    fileBuffer: Buffer,
    mimeType: string,
    filename?: string
  ): Promise<DoclingExtractionResult> {
    // Create temp files
    const tempDir = join(tmpdir(), `docling-docker-${randomUUID()}`);
    await mkdir(tempDir, { recursive: true });

    const inputFile = join(tempDir, filename || 'input.pdf');
    const outputFile = join(tempDir, 'output.json');

    await writeFile(inputFile, fileBuffer);

    return new Promise((resolve, reject) => {
      const args = [
        'run',
        '--rm',
        '-v', `${tempDir}:/data`,
        this.config.dockerImage!,
        'docling',
        '/data/input.pdf',
        '--output', '/data/output.json',
        '--format', 'json',
      ];

      if (this.config.ocrEnabled) {
        args.push('--ocr');
      }

      const proc = spawn('docker', args);

      let stderr = '';
      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timeout = setTimeout(() => {
        proc.kill();
        reject(new Error('Docker processing timeout'));
      }, this.config.timeout);

      proc.on('close', async (code) => {
        clearTimeout(timeout);

        if (code !== 0) {
          reject(new Error(`Docker exited with code ${code}: ${stderr}`));
          return;
        }

        try {
          const { readFile } = await import('fs/promises');
          const outputData = await readFile(outputFile, 'utf-8');
          const result = JSON.parse(outputData);

          resolve(this.normalizeApiResponse(result));
        } catch (readError) {
          reject(new Error(`Failed to read Docker output: ${readError}`));
        }

        // Cleanup
        try {
          await unlink(inputFile);
          await unlink(outputFile);
          const { rmdir } = await import('fs/promises');
          await rmdir(tempDir);
        } catch {}
      });

      proc.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  private assessQuality(response: Record<string, unknown>): 'high' | 'medium' | 'low' {
    const markdown = (response.markdown as string) || '';
    const tables = (response.tables as unknown[]) || [];

    if (markdown.length > 1500 && tables.length > 0) {
      return 'high';
    }
    if (markdown.length > 500 || tables.length > 0) {
      return 'medium';
    }
    return 'low';
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default DoclingService;

// Singleton instance
let doclingInstance: DoclingService | null = null;

export function getDoclingService(config?: Partial<DoclingConfig>): DoclingService {
  if (!doclingInstance || config) {
    doclingInstance = new DoclingService(config);
  }
  return doclingInstance;
}
