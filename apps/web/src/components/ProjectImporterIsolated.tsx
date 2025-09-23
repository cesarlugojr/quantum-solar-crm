/**
 * ProjectImporter Component - Completely Isolated Version
 * 
 * This version prevents all form submission behaviors and page refreshes
 * by using multiple layers of event prevention and isolation.
 */

"use client";

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ImportResult {
  success: boolean;
  message: string;
  details?: {
    total: number;
    successful: number;
    failed: number;
    errors: string[];
  };
}

export function ProjectImporterIsolated() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent all form submission behaviors
  const preventFormSubmission = useCallback((e: Event | React.SyntheticEvent | null) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      // Only call stopImmediatePropagation if it exists (only on native Events)
      if ('stopImmediatePropagation' in e && typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
    }
    console.log('🚫 Form submission prevented');
    return false;
  }, []);

  // Handle file selection with complete isolation
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 File input change triggered');
    
    // Use setTimeout to defer processing and prevent any immediate reactions
    setTimeout(() => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        console.log('📁 File selected:', {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type
        });
        
        // Validate file type
        const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                           'application/vnd.ms-excel'];
        if (!validTypes.includes(selectedFile.type) && 
            !selectedFile.name.endsWith('.xlsx') && 
            !selectedFile.name.endsWith('.xls')) {
          console.error('❌ Invalid file type:', selectedFile.type);
          alert('Please select a valid Excel file (.xlsx or .xls)');
          if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear the input
          }
          return;
        }
        
        console.log('✅ File validation passed');
        setFile(selectedFile);
        setResult(null); // Clear previous results
      }
    }, 0);
  }, []);

  // Handle import with complete event prevention
  const handleImport = useCallback(async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      preventFormSubmission(event);
    }
    
    console.log('🚀 Starting import process');
    
    if (!file) {
      console.error('❌ No file selected');
      alert('Please select a file first');
      return;
    }

    console.log('📊 Import details:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('📤 Sending request to /api/crm/import-projects');

      const response = await fetch('/api/crm/import-projects', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const data = await response.json();
      console.log('📋 Response data:', data);
      
      if (response.ok) {
        console.log('✅ Import successful:', data);
        setResult({
          success: true,
          message: data.message,
          details: data.details
        });
      } else {
        console.error('❌ Import failed:', data);
        setResult({
          success: false,
          message: data.error || 'Import failed',
          details: data.details
        });
      }
    } catch (error) {
      console.error('💥 Import error:', error);
      setResult({
        success: false,
        message: `Network error occurred during import: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setImporting(false);
      console.log('🏁 Import process completed');
    }
  }, [file, preventFormSubmission]);

  // Reset importer
  const resetImporter = useCallback((event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      preventFormSubmission(event);
    }
    
    console.log('🔄 Resetting importer');
    setFile(null);
    setResult(null);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [preventFormSubmission]);

  // Trigger file input click
  const triggerFileInput = useCallback((event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      preventFormSubmission(event);
    }
    
    console.log('🔔 Triggering file input click');
    fileInputRef.current?.click();
  }, [preventFormSubmission]);

  return (
    <div style={{ isolation: 'isolate' }}>
      <Card className="p-6 bg-white/5 border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4">Import Projects from Excel</h3>
        
        {!result && (
          <div className="space-y-4">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={importing}
            />

            {/* Custom file selection button */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Select Excel File (.xlsx or .xls)
              </label>
              <Button
                type="button"
                onClick={triggerFileInput}
                className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 w-full justify-start"
                disabled={importing}
              >
                {file ? `📁 ${file.name}` : '📎 Choose Excel File'}
              </Button>
            </div>

            {file && (
              <div className="p-3 bg-white/10 rounded-lg">
                <p className="text-sm text-white/80">
                  <strong>Selected file:</strong> {file.name}
                </p>
                <p className="text-sm text-white/60">
                  Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleImport}
                disabled={!file || importing}
                className="bg-[#ff0000] hover:bg-[#ff0000]/90 text-white"
              >
                {importing ? '⏳ Importing...' : '🚀 Import Projects'}
              </Button>
              
              {file && (
                <Button
                  type="button"
                  onClick={resetImporter}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  disabled={importing}
                >
                  🗑️ Clear
                </Button>
              )}
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                result.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {result.success ? '✅ Import Completed' : '❌ Import Failed'}
              </h4>
              <p className="text-white/80">{result.message}</p>
              
              {result.details && (
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="font-semibold text-white">{result.details.total}</div>
                      <div className="text-white/60">Total</div>
                    </div>
                    <div className="text-center p-2 bg-green-500/10 rounded">
                      <div className="font-semibold text-green-400">{result.details.successful}</div>
                      <div className="text-white/60">Successful</div>
                    </div>
                    <div className="text-center p-2 bg-red-500/10 rounded">
                      <div className="font-semibold text-red-400">{result.details.failed}</div>
                      <div className="text-white/60">Failed</div>
                    </div>
                  </div>
                  
                  {result.details.errors.length > 0 && (
                    <div className="mt-3">
                      <details className="cursor-pointer">
                        <summary className="text-sm text-white/80 hover:text-white">
                          View Errors ({result.details.errors.length})
                        </summary>
                        <div className="mt-2 p-3 bg-white/5 rounded text-xs text-white/70 max-h-32 overflow-y-auto">
                          {result.details.errors.map((error, index) => (
                            <div key={index} className="py-1">{error}</div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={resetImporter}
                className="bg-[#ff0000] hover:bg-[#ff0000]/90 text-white"
              >
                🔄 Import Another File
              </Button>
              
              <Button
                type="button"
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                🔃 Refresh Page
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-white/5 rounded-lg">
          <h4 className="font-semibold text-white mb-2">Import Instructions:</h4>
          <ul className="text-sm text-white/70 space-y-1">
            <li>• Upload Excel files containing project data (.xlsx or .xls)</li>
            <li>• Ensure your Excel file has the standard GoodPWR format</li>
            <li>• Required columns: First Name, Last Name, Address, City, State</li>
            <li>• The system will automatically map your data to the CRM schema</li>
            <li>• Projects will be assigned appropriate stages based on completion status</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
