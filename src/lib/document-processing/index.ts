/**
 * Document Processing Module
 *
 * Hybrid document processing using Docling + Claude Vision
 * for token-efficient extraction from PDFs and images.
 *
 * Usage:
 * ```typescript
 * import { createHybridProcessor, getDoclingService } from '@/lib/document-processing';
 *
 * // Use hybrid processor (recommended)
 * const processor = createHybridProcessor();
 * const result = await processor.processDocument(buffer, 'document.pdf', 'application/pdf');
 *
 * // Use Docling directly
 * const docling = getDoclingService();
 * const extraction = await docling.extract(buffer, 'application/pdf');
 * ```
 */

export {
  HybridDocumentProcessor,
  createHybridProcessor,
  type DocumentProcessingResult,
  type ExtractedDesignData,
  type RoofSection,
  type AdderFlags,
  type ProcessingConfig,
  type DoclingResult,
  type DoclingTable,
} from './hybrid-processor';

export {
  DoclingService,
  getDoclingService,
  type DoclingExtractionResult,
  type ExtractedTable,
  type ExtractedImage,
  type DocumentMetadata,
  type DoclingConfig,
} from './docling-service';
