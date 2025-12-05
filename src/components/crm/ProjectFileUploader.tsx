'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2, Cloud, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Document types that can be uploaded
export type DocumentType =
  | 'utility_bill'
  | 'design'
  | 'permit'
  | 'inspection_report'
  | 'pto_approval'
  | 'contract'
  | 'site_survey'
  | 'other';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  utility_bill: 'Utility Bill',
  design: 'Design/Planset',
  permit: 'Permit',
  inspection_report: 'Inspection Report',
  pto_approval: 'PTO Approval',
  contract: 'Contract',
  site_survey: 'Site Survey',
  other: 'Other',
};

// Project file interface
export interface ProjectFile {
  id: string;
  project_id: string;
  document_type: DocumentType;
  filename: string;
  drive_file_id: string;
  drive_url: string;
  notes?: string;
  uploaded_at: string;
  uploaded_by?: string;
}

interface ProjectFileUploaderProps {
  projectId: string;
  existingFiles?: ProjectFile[];
  onFileUploaded?: (file: ProjectFile) => void;
  onFileDeleted?: (fileId: string) => void;
  className?: string;
}

export function ProjectFileUploader({
  projectId,
  existingFiles = [],
  onFileUploaded,
  onFileDeleted,
  className = '',
}: ProjectFileUploaderProps) {
  const [documentType, setDocumentType] = useState<DocumentType>('design');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>(existingFiles);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (max 25MB)
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError('File size must be less than 25MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (documentType === 'other' && !notes.trim()) {
      setError('Please add a description for "Other" document type');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      formData.append('documentType', documentType);
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      const response = await fetch('/api/crm/projects/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const result = await response.json();

      if (result.success && result.file) {
        setFiles(prev => [result.file, ...prev]);
        onFileUploaded?.(result.file);

        // Reset form
        setFile(null);
        setNotes('');
        // Reset file input
        const fileInput = document.getElementById('project-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMsg);
    } finally {
      setUploading(false);
    }
  }, [file, projectId, documentType, notes, onFileUploaded]);

  const handleDelete = useCallback(async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    setDeletingId(fileId);
    try {
      const response = await fetch(`/api/crm/projects/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setFiles(prev => prev.filter(f => f.id !== fileId));
      onFileDeleted?.(fileId);
    } catch (err) {
      setError('Failed to delete file');
    } finally {
      setDeletingId(null);
    }
  }, [onFileDeleted]);

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
    const fileInput = document.getElementById('project-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Form */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Upload Document</h4>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Document Type */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Document Type</Label>
            <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-white hover:bg-gray-700">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Input */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="project-file-input"
                type="file"
                onChange={handleFileSelect}
                className="bg-gray-800 border-gray-600 text-white h-9 text-xs file:bg-gray-700 file:text-white file:border-0 file:mr-2"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                disabled={uploading}
              />
              {file && (
                <button onClick={clearFile} className="text-gray-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notes (required for "other") */}
        {(documentType === 'other' || notes) && (
          <div className="mb-3">
            <Label className="text-xs text-gray-400">
              {documentType === 'other' ? 'Description (required)' : 'Notes (optional)'}
            </Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={documentType === 'other' ? 'Describe this document...' : 'Add notes...'}
              className="bg-gray-800 border-gray-600 text-white h-9 mt-1"
            />
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading to Google Drive...
            </>
          ) : (
            <>
              <Cloud className="h-4 w-4 mr-2" />
              Upload to Project Folder
            </>
          )}
        </Button>

        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Uploaded Files ({files.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-gray-700"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{f.filename}</p>
                    <p className="text-xs text-gray-400">
                      {DOCUMENT_TYPE_LABELS[f.document_type]}
                      {f.notes && ` - ${f.notes}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={f.drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                    title="Open in Google Drive"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(f.id)}
                    disabled={deletingId === f.id}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete file"
                  >
                    {deletingId === f.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
