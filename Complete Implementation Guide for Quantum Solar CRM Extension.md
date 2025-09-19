# Complete Implementation Guide for Quantum Solar CRM Extension

## Executive Overview

This comprehensive guide provides detailed implementation strategies for extending your existing Quantum Solar CRM built with Next.js 15, TypeScript, Supabase, and Clerk. The recommendations build upon your current foundation to add solar industry-specific features, mobile capabilities, and enterprise-grade integrations while maintaining optimal performance.

## Part 1: Database Architecture Extensions

### 1.1 Custom ID System Implementation

Your unique identifier system (QSLID, QSOID, QSPID, QSIID) requires PostgreSQL-level implementation for consistency across all clients:

```sql
-- Create sequences for each entity type
CREATE SEQUENCE IF NOT EXISTS leads_seq START 1;
CREATE SEQUENCE IF NOT EXISTS opportunities_seq START 1;
CREATE SEQUENCE IF NOT EXISTS projects_seq START 1;
CREATE SEQUENCE IF NOT EXISTS installations_seq START 1;

-- ID generation functions
CREATE OR REPLACE FUNCTION generate_lead_id() 
RETURNS TEXT AS $$
BEGIN
    RETURN 'QSLID' || LPAD(nextval('leads_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_opportunity_id() 
RETURNS TEXT AS $$
BEGIN
    RETURN 'QSOID' || LPAD(nextval('opportunities_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_project_id() 
RETURNS TEXT AS $$
BEGIN
    RETURN 'QSPID' || LPAD(nextval('projects_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_installation_id() 
RETURNS TEXT AS $$
BEGIN
    RETURN 'QSIID' || LPAD(nextval('installations_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;
```

### 1.2 Enhanced CRM Schema

Extend your existing schema with solar-specific requirements:

```sql
-- Enhanced leads table with solar industry fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS custom_id TEXT UNIQUE DEFAULT generate_lead_id();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utility_company TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS monthly_electric_bill DECIMAL(10,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS roof_type TEXT CHECK (roof_type IN ('asphalt_shingle', 'tile', 'metal', 'flat', 'other'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS roof_age INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS roof_shading_percentage INTEGER CHECK (roof_shading_percentage >= 0 AND roof_shading_percentage <= 100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS home_ownership TEXT CHECK (home_ownership IN ('own', 'rent'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS credit_score_range TEXT CHECK (credit_score_range IN ('excellent', 'good', 'fair', 'poor'));

-- TCPA compliance fields (mandatory for 2025)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tcpa_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tcpa_consent_timestamp TIMESTAMP WITH TIME ZONE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tcpa_consent_ip_address INET;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tcpa_consent_method TEXT CHECK (tcpa_consent_method IN ('website', 'phone', 'email', 'in_person'));

-- Create opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custom_id TEXT UNIQUE DEFAULT generate_opportunity_id(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Solar system details
    estimated_system_size DECIMAL(8,2),
    estimated_annual_savings DECIMAL(10,2),
    estimated_cost DECIMAL(12,2),
    financing_type TEXT CHECK (financing_type IN ('cash', 'loan', 'lease', 'ppa')),
    
    -- Appointment scheduling
    site_survey_scheduled TIMESTAMP WITH TIME ZONE,
    site_survey_completed TIMESTAMP WITH TIME ZONE,
    proposal_sent_date TIMESTAMP WITH TIME ZONE,
    contract_signed_date TIMESTAMP WITH TIME ZONE,
    
    status TEXT DEFAULT 'initial_contact',
    assigned_to UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enhanced projects table with complete lifecycle tracking
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custom_id TEXT UNIQUE DEFAULT generate_project_id(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    
    -- 11-stage pipeline tracking
    site_survey_date TIMESTAMP WITH TIME ZONE,
    design_completed_date TIMESTAMP WITH TIME ZONE,
    permits_submitted_date TIMESTAMP WITH TIME ZONE,
    permits_approved_date TIMESTAMP WITH TIME ZONE,
    installation_scheduled_date TIMESTAMP WITH TIME ZONE,
    installation_completed_date TIMESTAMP WITH TIME ZONE,
    inspection_scheduled_date TIMESTAMP WITH TIME ZONE,
    inspection_completed_date TIMESTAMP WITH TIME ZONE,
    pto_submitted_date TIMESTAMP WITH TIME ZONE,
    pto_approved_date TIMESTAMP WITH TIME ZONE,
    system_activated_date TIMESTAMP WITH TIME ZONE,
    
    -- System specifications
    system_size_kw DECIMAL(8,2),
    panel_count INTEGER,
    panel_model TEXT,
    inverter_type TEXT,
    inverter_model TEXT,
    battery_included BOOLEAN DEFAULT FALSE,
    battery_model TEXT,
    
    current_stage TEXT DEFAULT 'site_survey',
    project_manager_id UUID REFERENCES profiles(id),
    installer_crew_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Installation equipment tracking
CREATE TABLE IF NOT EXISTS installation_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installation_id TEXT REFERENCES installations(custom_id),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    equipment_type TEXT CHECK (equipment_type IN ('solar_panel', 'inverter', 'battery', 'mounting_system', 'monitoring', 'electrical')),
    
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    quantity INTEGER,
    wattage DECIMAL(8,2),
    warranty_years INTEGER,
    
    installed_date TIMESTAMP WITH TIME ZONE,
    installer_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### 1.3 Row Level Security (RLS) Configuration

Implement comprehensive security policies:

```sql
-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_equipment ENABLE ROW LEVEL SECURITY;

-- Sales rep policies
CREATE POLICY "Sales reps manage assigned leads"
    ON leads FOR ALL
    TO authenticated
    USING (
        assigned_to IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('manager', 'admin')
    );

-- Installer policies
CREATE POLICY "Installers access assigned projects"
    ON projects FOR SELECT
    TO authenticated
    USING (
        installer_crew_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR project_manager_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('manager', 'admin')
    );
```

### 1.4 Performance Indexes

Create optimized indexes for common queries:

```sql
-- Lead management indexes
CREATE INDEX idx_leads_status_created ON leads(status, created_at DESC);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_utility_company ON leads(utility_company);
CREATE INDEX idx_leads_tcpa_consent ON leads(tcpa_consent) WHERE tcpa_consent = true;

-- Project tracking indexes
CREATE INDEX idx_projects_current_stage ON projects(current_stage);
CREATE INDEX idx_projects_installer_crew ON projects(installer_crew_id);
CREATE INDEX idx_projects_active ON projects(updated_at DESC) 
    WHERE current_stage NOT IN ('complete', 'cancelled');

-- Full-text search
CREATE INDEX idx_leads_search ON leads USING gin(
    to_tsvector('english', COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' || COALESCE(address, ''))
);
```

## Part 2: React Native Mobile Application

### 2.1 Monorepo Structure Setup

Create a unified codebase for web and mobile:

```bash
quantum-solar-crm/
├── apps/
│   ├── web/              # Next.js 15 application
│   │   ├── app/
│   │   ├── components/
│   │   └── package.json
│   └── mobile/           # React Native application
│       ├── src/
│       ├── ios/
│       ├── android/
│       └── package.json
├── packages/
│   ├── types/           # Shared TypeScript types
│   ├── api/             # Shared API client
│   ├── utils/           # Shared utilities
│   └── ui-native/       # Native UI components
├── turbo.json
└── package.json
```

**Root package.json:**
```json
{
  "name": "quantum-solar-crm",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "mobile": "turbo run mobile"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "typescript": "^5.3.0"
  }
}
```

### 2.2 Offline-First Implementation with PowerSync

Configure PowerSync for robust offline capabilities:

```typescript
// apps/mobile/src/services/database.ts
import { PowerSyncDatabase } from '@powersync/react-native';
import { SyncRules } from '@powersync/common';

const schema = {
  projects: {
    id: 'TEXT PRIMARY KEY',
    custom_id: 'TEXT',
    current_stage: 'TEXT',
    system_size_kw: 'REAL',
    installer_crew_id: 'TEXT',
    updated_at: 'TEXT'
  },
  installation_photos: {
    id: 'TEXT PRIMARY KEY',
    project_id: 'TEXT',
    category: 'TEXT',
    uri: 'TEXT',
    latitude: 'REAL',
    longitude: 'REAL',
    uploaded: 'INTEGER',
    created_at: 'TEXT'
  }
};

export const db = new PowerSyncDatabase({
  schema,
  dbFilename: 'quantum-solar.sqlite'
});

export const connectDatabase = async (supabaseToken: string) => {
  await db.connect({
    powerSyncUrl: process.env.POWERSYNC_URL,
    token: supabaseToken,
    retryInterval: 5000
  });
};

// Sync configuration
export const syncRules = new SyncRules([
  {
    bucket: 'installer_projects',
    table: 'projects',
    filter: 'installer_crew_id = token_parameters.user_id'
  },
  {
    bucket: 'project_photos',
    table: 'installation_photos',
    filter: 'project_id IN (SELECT id FROM projects WHERE installer_crew_id = token_parameters.user_id)'
  }
]);
```

### 2.3 Photo Capture System

Implement comprehensive photo management with categorization:

```typescript
// apps/mobile/src/components/PhotoCapture.tsx
import React, { useRef } from 'react';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { Image } from 'react-native-compressor';
import Geolocation from '@react-native-community/geolocation';

const PHOTO_CATEGORIES = {
  ROOF_OVERVIEW: 'roof_overview',
  ROOF_DETAIL: 'roof_detail',
  ELECTRICAL_PANEL: 'electrical_panel',
  MAIN_BREAKER: 'main_breaker',
  METER: 'meter',
  GROUND_MOUNT: 'ground_mount',
  SHADING_OBSTRUCTION: 'shading_obstruction',
  COMPLETED_INSTALL: 'completed_install'
};

export const PhotoCaptureSystem = ({ projectId, onPhotoCapture }) => {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');

  const capturePhoto = async (category: string) => {
    if (!camera.current) return;

    // Capture photo with location
    const photo = await camera.current.takePhoto({
      enableLocation: true,
      quality: 'balanced'
    });

    // Get current location
    const location = await new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        (error) => resolve(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });

    // Compress image
    const compressed = await Image.compress(photo.path, {
      compressionMethod: 'auto',
      maxWidth: 1920,
      quality: 0.8
    });

    // Generate thumbnail
    const thumbnail = await Image.compress(photo.path, {
      maxWidth: 300,
      quality: 0.6
    });

    const photoData = {
      id: generateUUID(),
      project_id: projectId,
      category,
      original_uri: compressed,
      thumbnail_uri: thumbnail,
      latitude: location?.latitude,
      longitude: location?.longitude,
      timestamp: new Date().toISOString(),
      uploaded: false
    };

    // Save to local database
    await db.execute(
      'INSERT INTO installation_photos (id, project_id, category, uri, latitude, longitude, uploaded, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
      [photoData.id, projectId, category, compressed, location?.latitude, location?.longitude, photoData.timestamp]
    );

    // Queue for upload
    await queuePhotoUpload(photoData);

    onPhotoCapture(photoData);
  };

  return (
    <Camera
      ref={camera}
      device={device}
      isActive={true}
      photo={true}
      enableLocation={true}
      style={StyleSheet.absoluteFill}
    />
  );
};
```

### 2.4 Background Location Tracking

Implement battery-efficient location tracking:

```typescript
// apps/mobile/src/services/locationTracking.ts
import BackgroundGeolocation from 'react-native-background-geolocation';

export const configureLocationTracking = async (userId: string) => {
  await BackgroundGeolocation.configure({
    // Basic configuration
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    distanceFilter: 10,
    stationaryRadius: 25,
    
    // Activity recognition
    stopDetectionDelay: 5,
    stopOnTerminate: false,
    startOnBoot: true,
    
    // HTTP configuration
    url: `${API_URL}/api/locations`,
    batchSync: true,
    maxBatchSize: 20,
    autoSync: true,
    
    // Battery optimization
    pausesLocationUpdatesAutomatically: true,
    locationAuthorizationRequest: 'WhenInUse',
    
    // Geofencing
    geofenceProximityRadius: 100,
    geofenceInitialTriggerEntry: true,
    
    // Headers for authentication
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'X-User-Id': userId
    }
  });

  // Start tracking
  await BackgroundGeolocation.start();
};

// Add geofence for job site
export const addJobSiteGeofence = async (project: Project) => {
  await BackgroundGeolocation.addGeofences([{
    identifier: `project-${project.custom_id}`,
    latitude: project.site_latitude,
    longitude: project.site_longitude,
    radius: 100,
    notifyOnEntry: true,
    notifyOnExit: true,
    extras: {
      project_id: project.id,
      project_name: project.customer_name
    }
  }]);
};
```

## Part 3: Integration Architecture

### 3.1 Google Drive Integration

Implement automated folder creation and document management:

```typescript
// app/api/drive/folders/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { projectId, customerName } = await request.json();
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Get stored refresh token for service account
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  try {
    // Create project folder with naming convention
    const folderMetadata = {
      name: `${projectId} | ${customerName}`,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID]
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id,name,webViewLink'
    });

    // Create subfolders
    const subfolders = [
      'Site Survey',
      'Design Documents',
      'Permits',
      'Installation Photos',
      'Inspection Reports',
      'Customer Documents'
    ];

    for (const subfolder of subfolders) {
      await drive.files.create({
        requestBody: {
          name: subfolder,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [folder.data.id!]
        }
      });
    }

    // Set permissions for team access
    await drive.permissions.create({
      fileId: folder.data.id!,
      requestBody: {
        role: 'writer',
        type: 'domain',
        domain: 'quantumsolar.com'
      }
    });

    // Update project with folder ID
    await supabase
      .from('projects')
      .update({ google_drive_folder_id: folder.data.id })
      .eq('custom_id', projectId);

    return NextResponse.json({ 
      success: true, 
      folderId: folder.data.id,
      folderUrl: folder.data.webViewLink 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 3.2 Calendar Integration

Implement two-way calendar synchronization:

```typescript
// app/api/calendar/appointments/route.ts
export async function POST(request: NextRequest) {
  const appointment = await request.json();
  
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary: `Solar Consultation - ${appointment.customerName}`,
    description: `
      Project ID: ${appointment.projectId}
      Phone: ${appointment.phone}
      Address: ${appointment.address}
      System Size: ${appointment.systemSize}kW
      Notes: ${appointment.notes}
    `,
    start: {
      dateTime: appointment.startTime,
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: appointment.endTime,
      timeZone: 'America/Los_Angeles',
    },
    attendees: [
      { email: appointment.customerEmail },
      { email: appointment.salesRepEmail }
    ],
    location: appointment.meetingType === 'in-person' 
      ? appointment.address 
      : 'Virtual Meeting',
    conferenceData: appointment.meetingType === 'virtual' ? {
      createRequest: {
        requestId: `${appointment.projectId}-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    } : undefined,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 60 },
      ],
    },
    extendedProperties: {
      private: {
        projectId: appointment.projectId,
        appointmentType: appointment.type
      }
    }
  };

  const createdEvent = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    conferenceDataVersion: appointment.meetingType === 'virtual' ? 1 : 0
  });

  // Store event mapping
  await supabase
    .from('calendar_events')
    .insert({
      project_id: appointment.projectId,
      google_event_id: createdEvent.data.id,
      event_type: appointment.type,
      scheduled_time: appointment.startTime
    });

  return NextResponse.json({ 
    success: true, 
    eventId: createdEvent.data.id,
    meetingLink: createdEvent.data.hangoutLink
  });
}
```

### 3.3 SMS/Email Automation

Implement TCPA-compliant communication system:

```typescript
// app/api/communications/sms/route.ts
import twilio from 'twilio';
import { Resend } from 'resend';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { type, recipient, data } = await request.json();

  // Verify TCPA consent
  const consent = await supabase
    .from('leads')
    .select('tcpa_consent, tcpa_consent_timestamp')
    .eq('phone', recipient)
    .single();

  if (!consent.data?.tcpa_consent) {
    return NextResponse.json({ 
      error: 'No valid TCPA consent on file' 
    }, { status: 403 });
  }

  // Check time restrictions (8 AM - 9 PM local time)
  const recipientTimezone = await getRecipientTimezone(recipient);
  const localHour = new Date().toLocaleString('en-US', { 
    hour: 'numeric', 
    hour12: false,
    timeZone: recipientTimezone 
  });

  if (parseInt(localHour) < 8 || parseInt(localHour) >= 21) {
    // Queue for later delivery
    await queueMessage(recipient, data, '08:00');
    return NextResponse.json({ 
      success: true, 
      queued: true 
    });
  }

  // Send message
  const message = await twilioClient.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to: recipient,
    body: generateMessage(type, data),
    statusCallback: `${process.env.API_URL}/api/webhooks/twilio/status`
  });

  // Log communication
  await supabase
    .from('communication_log')
    .insert({
      type: 'sms',
      recipient,
      message_id: message.sid,
      template: type,
      data: data,
      consent_timestamp: consent.data.tcpa_consent_timestamp,
      sent_at: new Date().toISOString()
    });

  return NextResponse.json({ 
    success: true, 
    messageId: message.sid 
  });
}

function generateMessage(type: string, data: any): string {
  const templates = {
    appointment_reminder: `Quantum Solar reminder: Your consultation is ${data.date} at ${data.time}. ${data.address}. Reply STOP to opt out.`,
    installation_scheduled: `Your solar installation is scheduled for ${data.date}. Our crew will arrive between ${data.window}. Reply STOP to opt out.`,
    inspection_complete: `Great news! Your solar system passed inspection. PTO application submitted. Reply STOP to opt out.`
  };

  return templates[type] || 'Quantum Solar update. Reply STOP to opt out.';
}
```

### 3.4 Partner API Integration

Create a unified gateway for partner integrations:

```typescript
// services/partnerGateway.ts
export class PartnerAPIGateway {
  private partners: Map<string, PartnerAdapter>;

  constructor() {
    this.partners = new Map([
      ['goodpwr', new GoodPWRAdapter()],
      ['nsis', new NSISAdapter()],
      ['lgcy', new LGCYAdapter()]
    ]);
  }

  async syncProject(partnerId: string, project: Project) {
    const adapter = this.partners.get(partnerId);
    if (!adapter) throw new Error(`Unknown partner: ${partnerId}`);

    return await this.withRetry(async () => {
      const transformedData = adapter.transformProject(project);
      return await adapter.syncProject(transformedData);
    });
  }

  async getEquipmentPricing(partnerId: string, equipment: EquipmentRequest) {
    const adapter = this.partners.get(partnerId);
    return await adapter.getEquipmentPricing(equipment);
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    backoff = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        await new Promise(resolve => 
          setTimeout(resolve, backoff * Math.pow(2, i))
        );
      }
    }
    
    throw lastError!;
  }
}

// Partner adapter example
class GoodPWRAdapter implements PartnerAdapter {
  private apiUrl = process.env.GOODPWR_API_URL;
  private apiKey = process.env.GOODPWR_API_KEY;

  async syncProject(project: any) {
    const response = await fetch(`${this.apiUrl}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(project)
    });

    if (!response.ok) {
      throw new Error(`GoodPWR sync failed: ${response.statusText}`);
    }

    return response.json();
  }

  transformProject(project: Project) {
    return {
      external_id: project.custom_id,
      customer_name: project.customer_name,
      system_size: project.system_size_kw,
      panel_count: project.panel_count,
      panel_model: project.panel_model,
      inverter_model: project.inverter_model,
      installation_date: project.installation_scheduled_date
    };
  }
}
```

## Part 4: Real-time Features

### 4.1 Supabase Real-time Configuration

Implement comprehensive real-time subscriptions:

```typescript
// hooks/useRealtimeUpdates.ts
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export function useRealtimeUpdates() {
  const [supabase] = useState(() => 
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, 
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  );

  useEffect(() => {
    // Lead updates channel
    const leadChannel = supabase
      .channel('lead-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          console.log('Lead update:', payload);
          handleLeadUpdate(payload);
        }
      );

    // Project progress channel
    const projectChannel = supabase
      .channel('project-progress')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'projects',
          filter: 'current_stage=neq.complete'
        },
        (payload) => {
          console.log('Project progress:', payload);
          handleProjectProgress(payload.new);
        }
      );

    // Crew location channel with presence
    const crewChannel = supabase
      .channel('crew-locations')
      .on('presence', { event: 'sync' }, () => {
        const state = crewChannel.presenceState();
        updateCrewLocations(Object.values(state).flat());
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Crew member online:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Crew member offline:', leftPresences);
      });

    // Subscribe to channels
    leadChannel.subscribe();
    projectChannel.subscribe();
    crewChannel.subscribe();

    // Track crew member presence
    crewChannel.track({
      user_id: currentUser.id,
      online_at: new Date().toISOString(),
      location: currentLocation
    });

    return () => {
      supabase.removeAllChannels();
    };
  }, []);
}
```

### 4.2 Live Dashboard Updates

Create real-time dashboard components:

```typescript
// components/RealtimeDashboard.tsx
'use client';

import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useQuery } from '@tanstack/react-query';

export function RealtimeDashboard() {
  const { leadUpdates, projectUpdates, crewLocations } = useRealtimeUpdates();
  
  // Initial data fetch with React Query
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Active Leads"
        value={stats?.activeLeads || 0}
        change={leadUpdates?.length || 0}
        icon={<UsersIcon />}
      />
      
      <StatCard
        title="Projects in Progress"
        value={stats?.activeProjects || 0}
        change={projectUpdates?.length || 0}
        icon={<BriefcaseIcon />}
      />
      
      <StatCard
        title="Crews Active"
        value={crewLocations?.length || 0}
        change={0}
        icon={<TruckIcon />}
      />
      
      <StatCard
        title="Installations Today"
        value={stats?.installationsToday || 0}
        change={0}
        icon={<WrenchIcon />}
      />
      
      <LiveMap crews={crewLocations} projects={stats?.todaysProjects} />
    </div>
  );
}
```

## Part 5: Performance Optimization

### 5.1 Next.js 15 Optimizations

Leverage the latest Next.js features:

```typescript
// app/dashboard/projects/page.tsx
import { Suspense } from 'react';

// Enable Partial Prerendering
export const experimental_ppr = true;

// Configure caching
export const revalidate = 60; // Revalidate every minute
export const dynamic = 'force-static';

export default async function ProjectsPage() {
  // Server Component - fetch data at request time
  const projects = await getProjects();
  
  return (
    <>
      <ProjectsHeader count={projects.length} />
      
      <Suspense fallback={<ProjectsListSkeleton />}>
        <ProjectsList projects={projects} />
      </Suspense>
      
      <Suspense fallback={<MetricsSkeleton />}>
        <ProjectMetrics />
      </Suspense>
    </>
  );
}

// Server Action for mutations
async function updateProjectStatus(projectId: string, newStatus: string) {
  'use server';
  
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('projects')
    .update({ 
      current_stage: newStatus,
      [`${newStatus}_date`]: new Date().toISOString()
    })
    .eq('custom_id', projectId)
    .select()
    .single();
  
  if (error) throw error;
  
  revalidatePath('/dashboard/projects');
  return data;
}
```

### 5.2 Database Query Optimization

Implement efficient data fetching patterns:

```typescript
// lib/database/queries.ts
export async function getProjectsWithDetails(filters: ProjectFilters) {
  const supabase = createClient();
  
  let query = supabase
    .from('projects')
    .select(`
      *,
      opportunities!inner(
        id,
        lead_id,
        estimated_system_size,
        financing_type
      ),
      leads!opportunities(
        first_name,
        last_name,
        address,
        phone,
        email
      ),
      installation_equipment(
        equipment_type,
        manufacturer,
        model,
        quantity
      )
    `);

  // Apply filters efficiently
  if (filters.stage) {
    query = query.eq('current_stage', filters.stage);
  }
  
  if (filters.assignedTo) {
    query = query.eq('installer_crew_id', filters.assignedTo);
  }
  
  // Use cursor-based pagination
  if (filters.cursor) {
    query = query.lt('created_at', filters.cursor);
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(filters.limit || 20);
  
  return { data, error, nextCursor: data?.[data.length - 1]?.created_at };
}
```

### 5.3 Caching Strategy

Implement multi-layer caching with React Query:

```typescript
// hooks/useProjects.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export function useProjects(filters: ProjectFilters) {
  const supabase = useSupabaseClient();
  
  return useInfiniteQuery({
    queryKey: ['projects', filters],
    queryFn: async ({ pageParam }) => {
      const { data, error, nextCursor } = await getProjectsWithDetails({
        ...filters,
        cursor: pageParam
      });
      
      if (error) throw error;
      return { data, nextCursor };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 60000 // Background refetch every minute
  });
}
```

### 5.4 Image Optimization

Configure Next.js Image component for Supabase storage:

```typescript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    minimumCacheTTL: 31536000, // 1 year
    formats: ['image/webp', 'image/avif'],
  },
};

// components/ProjectPhoto.tsx
import Image from 'next/image';

export function ProjectPhoto({ photo }) {
  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${photo.path}`;
  
  return (
    <Image
      src={imageUrl}
      alt={photo.category}
      width={400}
      height={300}
      loading="lazy"
      quality={85}
      placeholder="blur"
      blurDataURL={photo.thumbnail_url}
      className="rounded-lg shadow-md"
    />
  );
}
```

## Part 6: Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- **Database Migration**: Execute schema updates, create custom ID functions
- **RLS Configuration**: Implement security policies
- **Basic CRUD Operations**: Update existing forms to use new fields
- **TCPA Compliance**: Add consent tracking to lead forms

### Phase 2: Mobile Foundation (Weeks 3-4)
- **Monorepo Setup**: Configure Turborepo structure
- **React Native Project**: Initialize with Expo
- **PowerSync Integration**: Configure offline database
- **Basic UI Components**: Create shared component library

### Phase 3: Core Mobile Features (Weeks 5-6)
- **Photo Capture**: Implement camera with categorization
- **Location Tracking**: Configure background geolocation
- **Offline Sync**: Complete PowerSync configuration
- **Digital Signatures**: Add signature capture

### Phase 4: Integrations (Weeks 7-8)
- **Google Drive**: Implement folder creation and file upload
- **Google Calendar**: Add appointment scheduling
- **SMS/Email**: Configure Twilio and Resend
- **Partner APIs**: Create adapter pattern

### Phase 5: Real-time & Performance (Week 9)
- **Real-time Subscriptions**: Configure Supabase channels
- **Dashboard Updates**: Implement live data updates
- **Query Optimization**: Add indexes and optimize queries
- **Caching Layer**: Configure React Query

### Phase 6: Testing & Deployment (Week 10)
- **End-to-end Testing**: Complete user flow tests
- **Performance Testing**: Load test with expected data volumes
- **Mobile App Deployment**: Submit to app stores
- **Production Migration**: Deploy with zero downtime

## Key Success Metrics

### Performance Targets
- **Page Load**: < 2 seconds for dashboard
- **Real-time Updates**: < 500ms latency
- **Mobile Sync**: < 5 seconds for full sync
- **API Response**: < 200ms p95

### Business Metrics
- **Lead Conversion**: 20% improvement
- **Project Cycle Time**: 30% reduction
- **Field Efficiency**: 40% improvement
- **Data Accuracy**: 99.9% reliability

## Conclusion

This comprehensive implementation guide provides everything needed to transform your existing Quantum Solar CRM into an industry-leading platform. The architecture leverages your current Next.js 15, TypeScript, Supabase, and Clerk foundation while adding enterprise-grade features specific to solar industry requirements.

The modular approach allows for incremental implementation, reducing risk while delivering value at each phase. The combination of offline-first mobile capabilities, real-time updates, and comprehensive integrations will position Quantum Solar as a technology leader in the solar installation industry.

By following this guide, you'll create a system that not only meets current needs but scales effectively as your business grows from hundreds to thousands of projects annually.