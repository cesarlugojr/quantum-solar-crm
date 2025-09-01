/**
 * PhotoSubmissionForm Component
 * 
 * Comprehensive photo submission system for different project stages:
 * - Site surveys before installation
 * - Installation progress and completion photos  
 * - Inspection documentation
 * 
 * Features:
 * - Multiple photo upload with preview
 * - Project stage categorization
 * - GPS location capture
 * - Photo compression and optimization
 * - Cloud storage integration
 * - Mobile-optimized interface
 */

"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Camera, 
  X, 
  MapPin, 
  FileImage,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface PhotoFile {
  id: string;
  file: File;
  preview: string;
  uploaded: boolean;
  error?: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

interface PhotoSubmissionFormProps {
  projectId?: string;
  submissionType: 'site_survey' | 'installation' | 'inspection';
  onSubmissionComplete?: (data: {
    submissionId: string;
    photoCount: number;
    submissionType: string;
    projectId?: string;
  }) => void;
  onCancel?: () => void;
}

const submissionTypeConfig = {
  site_survey: {
    title: 'Site Survey Photos',
    description: 'Document site conditions, roof structure, electrical panel, and access points',
    requiredPhotos: [
      'Overall roof view',
      'Electrical panel/meter',
      'Roof access point', 
      'Surrounding obstacles/shading',
      'Property overview'
    ],
    minPhotos: 5,
    maxPhotos: 20
  },
  installation: {
    title: 'Installation Photos',
    description: 'Document installation progress, component placement, and workmanship',
    requiredPhotos: [
      'Before installation roof view',
      'Panel installation progress',
      'Inverter installation',
      'Electrical connections',
      'Completed installation',
      'System nameplate/labels'
    ],
    minPhotos: 6,
    maxPhotos: 30
  },
  inspection: {
    title: 'Inspection Photos',
    description: 'Document final inspection, testing results, and system commissioning',
    requiredPhotos: [
      'Completed system overview',
      'System monitoring display',
      'Safety disconnects',
      'Grounding connections',
      'Labeling compliance',
      'Testing documentation'
    ],
    minPhotos: 6,
    maxPhotos: 15
  }
};

export function PhotoSubmissionForm({ 
  projectId, 
  submissionType, 
  onSubmissionComplete,
  onCancel 
}: PhotoSubmissionFormProps) {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [formData, setFormData] = useState({
    technician: '',
    notes: '',
    weatherConditions: '',
    completionPercentage: submissionType === 'installation' ? '0' : '100'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const config = submissionTypeConfig[submissionType];

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto: PhotoFile = {
          id: Date.now() + Math.random().toString(36),
          file,
          preview: e.target?.result as string,
          uploaded: false
        };

        setPhotos(prev => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove photo
  const removePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (photos.length < config.minPhotos) {
      alert(`Please upload at least ${config.minPhotos} photos`);
      return;
    }

    if (!formData.technician.trim()) {
      alert('Please enter technician name');
      return;
    }

    setUploading(true);

    try {
      // Get location if not already captured
      if (!location) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: Date.now(),
                accuracy: position.coords.accuracy
              });
              resolve();
            },
            () => resolve(), // Continue without location if denied
            { timeout: 5000 }
          );
        });
      }

      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('projectId', projectId || '');
      uploadData.append('submissionType', submissionType);
      uploadData.append('technician', formData.technician);
      uploadData.append('notes', formData.notes);
      uploadData.append('weatherConditions', formData.weatherConditions);
      uploadData.append('completionPercentage', formData.completionPercentage);
      uploadData.append('timestamp', new Date().toISOString());
      
      if (location) {
        uploadData.append('location', JSON.stringify(location));
      }

      // Add all photos
      photos.forEach((photo, index) => {
        uploadData.append(`photos`, photo.file);
        uploadData.append(`photoMetadata_${index}`, JSON.stringify({
          originalName: photo.file.name,
          size: photo.file.size,
          type: photo.file.type,
          id: photo.id
        }));
      });

      const response = await fetch('/api/crm/photo-submission', {
        method: 'POST',
        body: uploadData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      setSubmitted(true);
      
      // Call completion callback
      if (onSubmissionComplete) {
        onSubmissionComplete({
          submissionId: result.id,
          photoCount: photos.length,
          submissionType,
          projectId
        });
      }

    } catch (error) {
      console.error('Photo submission error:', error);
      alert(`Failed to submit photos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Photos Submitted Successfully!</h2>
          <p className="text-gray-300 mb-6">
            {photos.length} photos have been uploaded and will be processed shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => {
                setSubmitted(false);
                setPhotos([]);
                setFormData({
                  technician: '',
                  notes: '',
                  weatherConditions: '',
                  completionPercentage: submissionType === 'installation' ? '0' : '100'
                });
              }}
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              Submit More Photos
            </Button>
            {onCancel && (
              <Button onClick={onCancel} className="bg-blue-600 hover:bg-blue-700">
                Back to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Camera className="h-6 w-6 text-[#ff0000]" />
                {config.title}
              </CardTitle>
              <p className="text-gray-300 mt-2">{config.description}</p>
            </div>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel} className="text-gray-400">
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          {/* Requirements */}
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-blue-400 font-medium mb-2">Required Photos:</h4>
            <div className="flex flex-wrap gap-2">
              {config.requiredPhotos.map((req, index) => (
                <Badge key={index} variant="outline" className="border-blue-400/50 text-blue-300">
                  {req}
                </Badge>
              ))}
            </div>
            <p className="text-blue-300 text-sm mt-2">
              Minimum: {config.minPhotos} photos • Maximum: {config.maxPhotos} photos
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Technician Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="technician" className="text-white">Technician Name *</Label>
              <Input
                id="technician"
                value={formData.technician}
                onChange={(e) => setFormData(prev => ({ ...prev, technician: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter technician name"
              />
            </div>
            <div>
              <Label htmlFor="weather" className="text-white">Weather Conditions</Label>
              <Input
                id="weather"
                value={formData.weatherConditions}
                onChange={(e) => setFormData(prev => ({ ...prev, weatherConditions: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., Sunny, 75°F"
              />
            </div>
          </div>

          {submissionType === 'installation' && (
            <div>
              <Label htmlFor="completion" className="text-white">Completion Percentage</Label>
              <Input
                id="completion"
                type="number"
                min="0"
                max="100"
                value={formData.completionPercentage}
                onChange={(e) => setFormData(prev => ({ ...prev, completionPercentage: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="0-100"
              />
            </div>
          )}

          {/* Location */}
          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="text-white">
                {location ? 'Location captured' : 'Location not captured'}
              </span>
            </div>
            <Button 
              onClick={getCurrentLocation} 
              variant="outline" 
              size="sm"
              className="border-gray-600 text-gray-300"
            >
              Get Location
            </Button>
          </div>

          {/* Photo Upload */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-white text-lg">Photos ({photos.length}/{config.maxPhotos})</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300"
                  disabled={photos.length >= config.maxPhotos}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300"
                  disabled={photos.length >= config.maxPhotos}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Camera
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            {/* Photo Grid */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-slate-600">
                      <img
                        src={photo.preview}
                        alt="Upload preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      onClick={() => removePhoto(photo.id)}
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
                <FileImage className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No photos uploaded yet</p>
                <p className="text-gray-500 text-sm">Click Upload or Camera to add photos</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-white">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
              placeholder="Any additional observations, issues, or comments..."
            />
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className={`flex items-center gap-2 ${photos.length >= config.minPhotos ? 'text-green-400' : 'text-yellow-400'}`}>
              {photos.length >= config.minPhotos ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              Photo Requirements ({photos.length}/{config.minPhotos} minimum)
            </div>
            <div className={`flex items-center gap-2 ${formData.technician ? 'text-green-400' : 'text-yellow-400'}`}>
              {formData.technician ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              Technician Info
            </div>
            <div className={`flex items-center gap-2 ${location ? 'text-green-400' : 'text-gray-400'}`}>
              <MapPin className="h-4 w-4" />
              Location {location ? 'Captured' : 'Optional'}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-between pt-6 border-t border-slate-600">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
            )}
            
            <Button
              onClick={handleSubmit}
              disabled={uploading || photos.length < config.minPhotos || !formData.technician}
              className="bg-[#ff0000] hover:bg-[#cc0000] ml-auto"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                `Submit ${photos.length} Photos`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
