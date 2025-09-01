/**
 * Bill Upload Component
 * 
 * Allows users to upload their electric bills for system pre-building.
 * Features drag-and-drop, file validation, and progress tracking.
 * 
 * Features:
 * - Drag and drop interface
 * - File validation (PDF, JPG, PNG)
 * - Upload progress tracking
 * - Error handling
 * - Success confirmation
 */

"use client";

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { trackLeadEvent } from '@/lib/fbPixel';
import { trackFileUpload, trackLead } from '@/lib/gtm';

interface UploadState {
  isUploading: boolean;
  uploadProgress: number;
  uploadSuccess: boolean;
  error: string | null;
}

export function BillUploadComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    uploadProgress: 0,
    uploadSuccess: false,
    error: null
  });
  const [isDragOver, setIsDragOver] = useState(false);

  // Validate file type and size
  const validateFile = (file: File): string | null => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PDF, JPG, or PNG file';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    
    if (validationError) {
      setUploadState(prev => ({
        ...prev,
        error: validationError,
        uploadSuccess: false
      }));
      return;
    }

    setFile(selectedFile);
    setUploadState(prev => ({
      ...prev,
      error: null,
      uploadSuccess: false
    }));
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) return;

    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      uploadProgress: 0,
      error: null
    }));

    try {
      const formData = new FormData();
      formData.append('bill', file);
      formData.append('source', 'ameren_illinois_splash');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          uploadProgress: Math.min(prev.uploadProgress + 10, 90)
        }));
      }, 200);

      const response = await fetch('/api/bill-upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (response.ok) {
        // Track Facebook pixel event for bill upload
        trackLeadEvent('Bill Upload');
        
        // Track GTM events
        trackFileUpload(file.name, file.type, file.size);
        trackLead('bill_upload');

        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          uploadProgress: 100,
          uploadSuccess: true,
          error: null
        }));
      } else {
        throw new Error('Upload failed');
      }
    } catch {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        uploadProgress: 0,
        uploadSuccess: false,
        error: 'Upload failed. Please try again or email your bill to info@quantumsolar.us'
      }));
    }
  };

  // Reset upload state
  const resetUpload = () => {
    setFile(null);
    setUploadState({
      isUploading: false,
      uploadProgress: 0,
      uploadSuccess: false,
      error: null
    });
  };

  if (uploadState.uploadSuccess) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <p className="text-green-400 font-medium mb-2">Bill uploaded successfully!</p>
        <p className="text-white/60 text-sm mb-4">
          We&apos;ll use this information to pre-build your solar system design.
        </p>
        <Button
          onClick={resetUpload}
          variant="outline"
          size="sm"
          className="border-white/20 text-white hover:bg-white/10"
        >
          Upload Another Bill
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-all duration-300 cursor-pointer
          ${isDragOver 
            ? 'border-[#ff0000] bg-[#ff0000]/5' 
            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
          }
          ${uploadState.error ? 'border-red-400/50 bg-red-400/5' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('bill-upload')?.click()}
      >
        <input
          id="bill-upload"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploadState.isUploading}
        />

        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          
          {file ? (
            <div>
              <p className="text-white font-medium mb-1">{file.name}</p>
              <p className="text-white/60 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <p className="text-white font-medium mb-2">
                Drop your electric bill here or click to browse
              </p>
              <p className="text-white/60 text-sm">
                PDF, JPG, or PNG files up to 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {uploadState.error && (
        <div className="mt-3 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
          <p className="text-red-400 text-sm">{uploadState.error}</p>
        </div>
      )}

      {/* Upload Progress */}
      {uploadState.isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Uploading...</span>
            <span>{uploadState.uploadProgress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-[#ff0000] h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadState.uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      {file && !uploadState.isUploading && !uploadState.uploadSuccess && (
        <div className="mt-4 flex gap-3">
          <Button
            onClick={handleUpload}
            className="flex-1 bg-[#ff0000] hover:bg-[#ff0000]/90 text-white"
          >
            Upload Bill
          </Button>
          <Button
            onClick={resetUpload}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}
