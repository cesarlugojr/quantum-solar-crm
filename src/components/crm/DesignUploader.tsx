'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle, Cloud, Zap, Clock, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types for roof section data
export interface RoofSectionData {
  section_name: string;
  panel_count: number;
  pitch_degrees?: number;
  pitch_ratio?: string;
  azimuth?: number;
  orientation?: string;
}

// Types for extracted design data
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

  // Detailed roof section info
  roof_sections?: RoofSectionData[];

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

  // Metadata
  raw_text?: string;
  confidence_score?: number;

  // Google Drive upload info (if uploaded)
  drive_file_id?: string;
  drive_url?: string;
}

// Processing stats from hybrid analyzer
export interface ProcessingStats {
  method: 'docling' | 'docling+patterns' | 'claude-text' | 'claude-vision';
  confidence: number;
  tokensUsed: number;
  tokensSaved: number;
  savingsPercentage: number;
  processingTimeMs: number;
  fallbackReason?: string;
}

interface DesignUploaderProps {
  onDataExtracted: (data: ExtractedDesignData) => void;
  onError?: (error: string) => void;
  className?: string;
  compact?: boolean;
  projectId?: string; // If provided, PDF will be uploaded to Google Drive
  useHybridProcessor?: boolean; // Use Docling + Claude hybrid for token savings
}

export function DesignUploader({
  onDataExtracted,
  onError,
  className = '',
  compact = false,
  projectId,
  useHybridProcessor = true, // Default to hybrid for token savings
}: DesignUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedDesignData | null>(null);
  const [processingStats, setProcessingStats] = useState<ProcessingStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    // Validate file type
    if (!selectedFile.type.includes('pdf')) {
      const errorMsg = 'Only PDF files are supported';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Validate file size (max 20MB)
    if (selectedFile.size > 20 * 1024 * 1024) {
      const errorMsg = 'File size must be less than 20MB';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setProcessingStats(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Use hybrid endpoint for Docling + Claude (token savings) or original endpoint
      // Note: Hybrid endpoint only extracts data - it does NOT upload to Drive
      // Use Project Documents section for Drive uploads
      const endpoint = useHybridProcessor
        ? '/api/crm/design-analyzer-hybrid'
        : '/api/crm/design-analyzer';

      // Only pass projectId to original endpoint (hybrid doesn't use it)
      if (!useHybridProcessor && projectId) {
        formData.append('projectId', projectId);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Check for rate limit error and provide helpful message
        if (response.status === 429 || errorData.isRateLimit) {
          const minutes = errorData.retryAfter ? Math.ceil(errorData.retryAfter / 60) : 1;
          throw new Error(`Rate limit reached. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before uploading another PDF.`);
        }
        throw new Error(errorData.error || 'Failed to analyze design PDF');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setExtractedData(result.data);
        onDataExtracted(result.data);

        // Capture processing stats from hybrid endpoint
        if (result.processing) {
          setProcessingStats(result.processing);
        }
      } else {
        throw new Error('Invalid response from analyzer');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process file';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setUploading(false);
    }
  }, [onDataExtracted, onError, projectId, useHybridProcessor]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const clearFile = useCallback(() => {
    setFile(null);
    setExtractedData(null);
    setProcessingStats(null);
    setError(null);
  }, []);

  // Helper to format processing method for display
  const formatMethod = (method: string) => {
    switch (method) {
      case 'docling':
        return 'Docling Only';
      case 'docling+patterns':
        return 'Docling + Patterns';
      case 'claude-text':
        return 'Claude Text';
      case 'claude-vision':
        return 'Claude Vision';
      default:
        return method;
    }
  };

  // Compact version for inline use
  if (compact) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleInputChange}
              className="hidden"
              disabled={uploading}
            />
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 transition-colors">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span className="text-sm">
                {uploading ? 'Analyzing...' : 'Upload Design PDF'}
              </span>
            </div>
          </label>

          {file && !uploading && (
            <div className="flex items-center gap-2 text-sm">
              {extractedData ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : error ? (
                <AlertCircle className="h-4 w-4 text-red-400" />
              ) : null}
              <span className="text-gray-300 truncate max-w-[200px]">{file.name}</span>
              <button
                onClick={clearFile}
                className="text-gray-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}
      </div>
    );
  }

  // Full version with drag-and-drop
  return (
    <div className={`${className}`}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragOver ? 'border-[#ff0000] bg-red-500/10' : 'border-gray-600 hover:border-gray-500'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <>
              <Loader2 className="h-12 w-12 text-[#ff0000] animate-spin" />
              <p className="text-white font-medium">Analyzing design PDF...</p>
              <p className="text-gray-400 text-sm">
                Extracting project details with AI
              </p>
            </>
          ) : file ? (
            <>
              <FileText className="h-12 w-12 text-green-400" />
              <p className="text-white font-medium">{file.name}</p>
              {extractedData && (
                <div className="text-sm text-gray-400">
                  <p>Confidence: {Math.round((extractedData.confidence_score || 0) * 100)}%</p>
                  {extractedData.system_size_kw && (
                    <p>System Size: {extractedData.system_size_kw} kW</p>
                  )}
                  {extractedData.module_count && (
                    <p>Modules: {extractedData.module_count}</p>
                  )}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  clearFile();
                }}
                className="mt-2"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-500" />
              <p className="text-white font-medium">
                Drop design/planset PDF here
              </p>
              <p className="text-gray-400 text-sm">
                or click to browse (max 20MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        </div>
      )}

      {extractedData && !error && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <p className="text-green-400 font-medium">Data Extracted Successfully</p>
            </div>
            {extractedData.drive_url && (
              <a
                href={extractedData.drive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
              >
                <Cloud className="h-4 w-4" />
                View in Drive
              </a>
            )}
          </div>

          {/* Processing Stats from Hybrid Analyzer */}
          {processingStats && (
            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300 font-medium">Processing Stats</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  <span className="text-gray-400">Method:</span>
                  <span className="text-white">{formatMethod(processingStats.method)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-400" />
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white">{(processingStats.processingTimeMs / 1000).toFixed(1)}s</span>
                </div>
                {processingStats.savingsPercentage > 0 && (
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-green-400" />
                    <span className="text-gray-400">Savings:</span>
                    <span className="text-green-400 font-medium">{processingStats.savingsPercentage}%</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">Confidence:</span>
                  <span className={`font-medium ${processingStats.confidence >= 75 ? 'text-green-400' : processingStats.confidence >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {processingStats.confidence}%
                  </span>
                </div>
              </div>
              {processingStats.tokensUsed === 0 && (
                <p className="text-xs text-green-400 mt-2">
                  No Claude API tokens used - extracted with local OCR
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            {extractedData.customer_name && (
              <div>
                <p className="text-gray-400">Customer</p>
                <p className="text-white">{extractedData.customer_name}</p>
              </div>
            )}
            {extractedData.address && (
              <div>
                <p className="text-gray-400">Address</p>
                <p className="text-white">{extractedData.address}</p>
              </div>
            )}
            {extractedData.system_size_kw && (
              <div>
                <p className="text-gray-400">System Size</p>
                <p className="text-white">{extractedData.system_size_kw} kW</p>
              </div>
            )}
            {extractedData.module_count && (
              <div>
                <p className="text-gray-400">Module Count</p>
                <p className="text-white">{extractedData.module_count} panels</p>
              </div>
            )}
            {extractedData.module_wattage && (
              <div>
                <p className="text-gray-400">Module Wattage</p>
                <p className="text-white">{extractedData.module_wattage}W</p>
              </div>
            )}
            {extractedData.array_count && (
              <div>
                <p className="text-gray-400">Arrays</p>
                <p className="text-white">{extractedData.array_count}</p>
              </div>
            )}
            {extractedData.ahj_jurisdiction && (
              <div>
                <p className="text-gray-400">AHJ</p>
                <p className="text-white">{extractedData.ahj_jurisdiction}</p>
              </div>
            )}
            {extractedData.utility_company && (
              <div>
                <p className="text-gray-400">Utility</p>
                <p className="text-white">{extractedData.utility_company}</p>
              </div>
            )}
            {extractedData.inverter_model && (
              <div>
                <p className="text-gray-400">Inverter</p>
                <p className="text-white">{extractedData.inverter_model}</p>
              </div>
            )}
            {extractedData.module_model && (
              <div>
                <p className="text-gray-400">Module</p>
                <p className="text-white">{extractedData.module_model}</p>
              </div>
            )}
          </div>

          {/* Roof Sections */}
          {extractedData.roof_sections && extractedData.roof_sections.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-2">Roof Sections ({extractedData.roof_sections.length}):</p>
              <div className="space-y-2">
                {extractedData.roof_sections.map((section, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm bg-gray-800/50 p-2 rounded">
                    <span className="text-white font-medium">{section.section_name}</span>
                    <span className="text-gray-400">{section.panel_count} panels</span>
                    {section.pitch_ratio && (
                      <span className="text-blue-300">{section.pitch_ratio}</span>
                    )}
                    {section.pitch_degrees && (
                      <span className="text-blue-300">({section.pitch_degrees}°)</span>
                    )}
                    {section.orientation && (
                      <span className="text-yellow-300">{section.orientation}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detected Adders */}
          {Object.values(extractedData.adders).some(Boolean) && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-2">Detected Adders:</p>
              <div className="flex flex-wrap gap-2">
                {extractedData.adders.has_mpu && (
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded">
                    MPU
                  </span>
                )}
                {extractedData.adders.has_ground_mount && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">
                    Ground Mount
                  </span>
                )}
                {extractedData.adders.has_trench && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                    Trench {extractedData.adders.trench_length_ft && `(${extractedData.adders.trench_length_ft} ft)`}
                  </span>
                )}
                {extractedData.adders.has_battery && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                    Battery {extractedData.adders.battery_count && `(x${extractedData.adders.battery_count})`}
                  </span>
                )}
                {extractedData.adders.has_ev_charger && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                    EV Charger
                  </span>
                )}
                {extractedData.adders.has_steep_pitch && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded">
                    Steep Pitch
                  </span>
                )}
                {extractedData.adders.has_tile_roof && (
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded">
                    Tile Roof
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
