# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with the Quantum Solar CRM codebase. Follow these instructions exactly as written to ensure consistent, high-quality development that aligns with project standards and business requirements.

## 🏢 Project Overview

**Quantum Solar CRM** is a comprehensive Next.js 15 application that serves as the internal customer relationship management system for Quantum Solar Enterprises LLC, an Illinois-based solar installation company focused on restoring faith in the residential solar industry through transparency and exceptional service.

### Business Context

- **Company**: Quantum Solar Enterprises LLC (DBA Quantum Solar)
- **Industry**: Residential solar installation and energy solutions
- **Mission**: Restore faith in residential solar industry through transparency
- **Service Areas**:
  - Primary: Illinois (Ameren utility territory promotions)
  - Secondary: Florida (full-service installations)
  - Tertiary: Nationwide facilitation and consulting
- **Core Values**: Transparency, customer-first approach, industry innovation

### Application Purpose

The CRM platform serves as the **internal operations hub** for Quantum Solar's team members:

1. **Lead Management**: Track and manage solar leads from initial contact to conversion
2. **Project Pipeline**: Monitor solar installation projects through 11-stage pipeline
3. **Email Drip Campaigns**: Automated email nurture sequences for lead conversion
4. **HR Candidate Management**: Track job applications and candidate pipeline
5. **Team Operations**: Dashboard for sales, installation, and management teams
6. **Data Import/Export**: Bulk project data import from Excel
7. **Photo Submissions**: Field team photo uploads for site surveys and installations
8. **Analytics & Reporting**: Performance tracking and conversion metrics

**IMPORTANT**: The CRM is a **separate application** from the main marketing website:
- **This Repository** (`quantum-solar-crm`): Internal CRM at crm.quantumsolar.us
  - Lead management dashboard
  - Project pipeline tracking
  - Email drip campaigns
  - HR candidate management
  - Team operations tools

- **Separate Repository** (`quantum-solar`): Main marketing website at quantumsolar.us
  - Lead capture forms
  - Solar calculator
  - Content pages
  - Provides API endpoints that this CRM consumes for lead data sync

## 💻 Tech Stack & Architecture

### Core Technologies

- **Framework**: Next.js 15.x with App Router and Turbopack
- **Runtime**: React 18.x
- **Language**: TypeScript 5.0 (strict mode enabled)
- **Styling**: Tailwind CSS 3.4.1 + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk 6.31.4 (all routes protected except sign-in/sign-up)
- **Form Handling**: React Hook Form 7.53.2 with Zod 3.23.8 validation
- **State Management**: React useState + Supabase real-time subscriptions
- **Email Service**: Resend 4.0.1 for email drip campaigns and notifications
- **Analytics**: Google Analytics 4, Google Tag Manager, Facebook Pixel
- **Deployment**: Vercel with automatic Git deployments
- **Data Processing**: xlsx 0.18.5 for Excel project imports
- **Monitoring**: Vercel Analytics + Vercel Speed Insights

### Key Dependencies

- **UI Components**:
  - `lucide-react ^0.460.0` - Icon library
  - `@radix-ui/*` - Accessible component primitives (shadcn/ui foundation)
  - `class-variance-authority ^0.7.0` - Component variant management
  - `tailwind-merge ^2.5.4` - Tailwind class merging utility
  - `tailwindcss-animate ^1.0.7` - Animation utilities

- **Forms & Validation**:
  - `react-hook-form ^7.53.2` - Form state management
  - `@hookform/resolvers ^3.9.1` - Zod integration for forms
  - `zod ^3.23.8` - Schema validation

- **Business Operations**:
  - `resend ^4.0.1` - Email drip campaigns and transactional emails
  - `xlsx ^0.18.5` - Excel file processing for project imports
  - `googleapis ^156.0.0` - Google Solar API (planned integration)

### Development Tools

- **Build Tool**: Turbopack (development) / Webpack (production)
- **Package Manager**: npm with package-lock.json
- **Code Quality**: ESLint + TypeScript strict mode
- **Type Checking**: TypeScript with strict configuration

## 🗂️ Project Structure & Organization

### Multi-Repository Architecture

**CRITICAL**: Quantum Solar uses a **multi-repository architecture**:

- **This Repository** (`quantum-solar-crm`): Internal CRM application at crm.quantumsolar.us
  - Customer relationship management
  - Project pipeline tracking
  - Email drip campaigns
  - Lead management dashboard
  - HR candidate management
  - Team operations and analytics

- **Separate Repository** (`quantum-solar`): Main website at quantumsolar.us
  - Lead capture forms
  - Solar calculator
  - Marketing pages
  - Provides API endpoints for CRM integration

### Directory Architecture (This Repository)

```
src/
├── 📁 app/                                    # Next.js App Router
│   ├── 📁 api/                                # Backend API routes
│   │   ├── 📁 crm/ ⭐                          # CRM management endpoints
│   │   │   ├── leads/                         # Lead CRUD operations
│   │   │   ├── projects/                      # Project management APIs
│   │   │   ├── candidates/                    # HR candidate management
│   │   │   ├── campaigns/ ⭐                   # Email drip campaigns (NEW)
│   │   │   ├── templates/                     # Email template management
│   │   │   ├── photo-submission/              # Photo upload endpoints
│   │   │   └── import-projects/               # Bulk project import (Excel)
│   │   ├── 📁 integrations/                   # Third-party API integrations
│   │   │   ├── google-solar/                  # Google Solar API
│   │   │   ├── enphase/                       # System monitoring (planned)
│   │   │   └── twilio/                        # SMS communications (planned)
│   │   ├── 📁 setup/                          # Database setup endpoints
│   │   │   └── seed-campaigns/                # Seed default email campaigns
│   │   ├── send/                              # Resend email service
│   │   ├── appointment-notification/          # Appointment scheduling
│   │   ├── bill-upload/                       # Utility bill processing
│   │   ├── disqualified-leads/                # Rejected lead tracking
│   │   └── env/                               # Environment testing
│   ├── 📁 crm/ ⭐                              # Protected CRM dashboard pages
│   │   ├── page.tsx                           # Main dashboard
│   │   ├── leads/                             # Lead management
│   │   │   ├── page.tsx                       # Leads list view
│   │   │   └── [id]/page.tsx                  # Individual lead details
│   │   ├── projects/                          # Project pipeline
│   │   │   ├── page.tsx                       # Projects list view
│   │   │   └── [id]/page.tsx                  # Individual project details
│   │   ├── candidates/                        # HR recruitment
│   │   │   ├── page.tsx                       # Candidates list view
│   │   │   └── [id]/page.tsx                  # Individual candidate details
│   │   ├── campaigns/ ⭐                       # Email drip campaigns (NEW)
│   │   │   ├── page.tsx                       # Campaigns list view
│   │   │   ├── [id]/page.tsx                  # Campaign builder/editor
│   │   │   └── [id]/analytics/page.tsx        # Campaign analytics (planned)
│   │   └── new/                               # Create new campaign (planned)
│   ├── sign-in/                               # Clerk authentication page
│   ├── sign-up/[[...sign-up]]/                # Clerk registration page
│   ├── page.tsx                               # Public homepage (redirects to CRM if authenticated)
│   ├── layout.tsx                             # Root layout (GA4, GTM, FB Pixel)
│   └── globals.css                            # Global Tailwind styles
├── 📁 components/                             # React components
│   ├── 📁 ui/                                 # shadcn/ui base components
│   │   ├── button.tsx, input.tsx, dialog.tsx, etc.
│   │   ├── table.tsx                          # Data table components
│   │   ├── tabs.tsx                           # Tab navigation
│   │   ├── switch.tsx                         # Toggle switches
│   │   └── badge.tsx                          # Status badges
│   ├── ConditionalClerkProvider.tsx           # Clerk provider wrapper
│   ├── ConditionalNavigation.tsx              # Conditional nav visibility
│   ├── PhotoSubmissionForm.tsx                # Photo upload for projects
│   ├── ProjectImporter.tsx                    # Excel project import UI
│   ├── ProjectImporterIsolated.tsx            # Standalone importer
│   ├── BillUploadComponent.tsx                # Utility bill upload
│   ├── SplashForm.tsx                         # Lead capture form (legacy)
│   ├── SplashFormCompetitor.tsx               # Alternative form (legacy)
│   ├── FacebookConversionsDemo.tsx            # FB conversion testing
│   ├── JobSkillTest.tsx                       # Candidate assessment
│   ├── FooterSection.tsx                      # Footer component
│   ├── RevealOnScroll.tsx                     # Scroll animations
│   └── ScrollProgress.tsx                     # Progress indicators
├── 📁 lib/                                    # Utilities and configurations
│   ├── supabase.ts                            # Supabase client config
│   ├── projectParser.ts                       # Excel project parser
│   ├── fbPixel.ts                             # Facebook Pixel utilities
│   ├── gtm.ts                                 # Google Tag Manager
│   └── utils.ts                               # General utilities (cn, etc.)
└── middleware.ts                              # Clerk authentication middleware
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `LeadCard.tsx`, `ProjectImporter.tsx`)
- **Pages**: kebab-case for directories, `page.tsx` for page files
- **Utilities**: camelCase (e.g., `utils.ts`, `supabase.ts`)
- **Types/Interfaces**: PascalCase with descriptive names
- **Constants**: UPPER_SNAKE_CASE for exported constants

## 🛠️ Development Commands & Workflow

### Essential Commands

```bash
# Development (AVAILABLE)
npm run dev                  # Start development server with Turbopack
npm run build               # Build for production
npm run start               # Start production server
npm run lint                # Run ESLint (MUST pass before committing)

# Testing (⚠️ NOT CONFIGURED - Scripts need to be added to package.json)
# To add testing, update package.json with these scripts:
# "test": "jest",
# "test:watch": "jest --watch",
# "test:coverage": "jest --coverage",
# "test:e2e": "playwright test",
```

### Pre-Commit Requirements

**CRITICAL**: Before any commit, you MUST run and ensure these pass:

1. `npm run lint` - Zero ESLint errors allowed
2. TypeScript compilation must succeed (`npm run build` or `npx tsc --noEmit`)
3. No console.error or console.warn in production code (except in error handlers)
4. Test CRM functionality manually (automated tests to be added)

### Git Workflow Standards

```bash
# Branch naming conventions
feature/feature-name        # New features (e.g., feature/email-drip-campaigns)
fix/bug-description         # Bug fixes
refactor/component-name     # Code refactoring
test/component-name         # Adding tests
docs/section-name           # Documentation updates

# Commit message format (Conventional Commits)
feat: add email drip campaign system
fix: resolve lead status update issue
docs: update CRM API documentation
style: format code with prettier
refactor: restructure campaign management
test: add unit tests for campaign triggers
chore: update dependencies to latest versions
```

## 🎯 Core Business Logic & Patterns

### Email Drip Campaign System (NEW FEATURE)

The CRM's primary new feature is an automated email drip campaign system for lead nurturing and conversion.

#### Campaign Architecture

```typescript
// Campaign Structure
interface Campaign {
  id: string;
  name: string;
  description: string;
  trigger_type: 'lead_created' | 'status_change' | 'manual' | 'time_based';
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Email Sequence
interface EmailSequence {
  id: string;
  campaign_id: string;
  sequence_number: number;  // Order in the campaign (1, 2, 3...)
  delay_days: number;       // Days to wait after previous email (or trigger)
  subject: string;
  body: string;            // HTML email content
  template_id?: string;    // Optional: Reference to email template
}

// Campaign Enrollment
interface CampaignEnrollment {
  id: string;
  campaign_id: string;
  lead_id: string;
  status: 'active' | 'paused' | 'completed' | 'unsubscribed';
  current_sequence: number;
  next_send_date: string;
  enrolled_at: string;
}
```

#### Campaign Management Pattern

```typescript
// /app/crm/campaigns/page.tsx - Campaign List View
const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Fetch all campaigns
  const fetchCampaigns = async () => {
    const response = await fetch('/api/crm/campaigns');
    const data = await response.json();
    setCampaigns(data.campaigns || []);
  };

  // Toggle campaign active/inactive
  const toggleCampaignActive = async (campaignId: string, currentActive: boolean) => {
    await fetch('/api/crm/campaigns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: campaignId,
        active: !currentActive
      })
    });
  };

  // Display campaigns with status, enrollments, and actions
  return (
    <Table>
      {campaigns.map((campaign) => (
        <TableRow key={campaign.id}>
          <TableCell>{campaign.name}</TableCell>
          <TableCell>{campaign.trigger_type}</TableCell>
          <TableCell>{campaign.sequences?.length || 0} emails</TableCell>
          <TableCell>
            <Switch
              checked={campaign.active}
              onCheckedChange={() => toggleCampaignActive(campaign.id, campaign.active)}
            />
          </TableCell>
          <TableCell>
            <Link href={`/crm/campaigns/${campaign.id}`}>Edit</Link>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};
```

#### Campaign API Endpoints

```typescript
// GET /api/crm/campaigns - List all campaigns
// POST /api/crm/campaigns - Create new campaign
// PATCH /api/crm/campaigns - Update campaign (toggle active, edit details)
// DELETE /api/crm/campaigns - Delete campaign

// Campaign API Pattern (Protected with Clerk)
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 1. Authentication check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Fetch campaigns from Supabase
  const { data: campaigns, error } = await supabase
    .from('email_campaigns')
    .select(`
      *,
      sequences:email_sequences(count),
      enrollments:campaign_enrollments(
        count,
        status
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 3. Calculate stats for each campaign
  const campaignsWithStats = campaigns.map(campaign => ({
    ...campaign,
    stats: {
      totalEnrollments: campaign.enrollments?.length || 0,
      activeEnrollments: campaign.enrollments?.filter(e => e.status === 'active').length || 0,
    }
  }));

  return NextResponse.json({ campaigns: campaignsWithStats });
}
```

#### Email Template System

```typescript
// Email templates stored in database
interface EmailTemplate {
  id: string;
  name: string;
  subject_template: string;  // Supports variables: {{firstName}}, {{companyName}}
  body_template: string;     // HTML with variable support
  category: 'nurture' | 'welcome' | 'follow_up' | 'promotion';
  variables: string[];       // ['firstName', 'lastName', 'utilityCompany']
}

// Template rendering with variable substitution
const renderEmailTemplate = (
  template: EmailTemplate,
  leadData: Lead
): { subject: string; body: string } => {
  let subject = template.subject_template;
  let body = template.body_template;

  // Replace variables with actual lead data
  template.variables.forEach(variable => {
    const value = leadData[variable as keyof Lead] || '';
    subject = subject.replace(new RegExp(`{{${variable}}}`, 'g'), String(value));
    body = body.replace(new RegExp(`{{${variable}}}`, 'g'), String(value));
  });

  return { subject, body };
};
```

### Lead Management System

```typescript
// Lead Status Pipeline
type LeadStatus =
  | 'new'           // Initial lead received
  | 'contacted'     // First contact made
  | 'qualified'     // Lead qualified for solar
  | 'proposal_sent' // Solar proposal delivered
  | 'negotiation'   // In negotiation phase
  | 'won'          // Converted to project
  | 'lost'         // Lost opportunity
  | 'disqualified'; // Not eligible for solar

// Lead interface
interface Lead {
  id: string;
  session_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  utility_company?: string;
  homeowner_status?: string;
  credit_score?: string;
  average_monthly_bill?: number;
  status: LeadStatus;
  source_campaign?: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;  // User ID of assigned team member
}

// Lead management operations
const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
  const { data, error } = await supabase
    .from('leads')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId)
    .select()
    .single();

  // Trigger campaign enrollment based on status change
  if (newStatus === 'qualified') {
    await enrollInCampaign(leadId, 'welcome-qualified-leads');
  }

  return data;
};
```

### Project Pipeline System

The CRM tracks solar installation projects through an 11-stage pipeline:

```typescript
// Project Status Pipeline (11 Stages)
type ProjectStatus =
  | 'lead'                     // Initial lead received
  | 'contacted'                // First contact made
  | 'qualified'                // Lead qualified for solar
  | 'proposal_sent'            // Solar proposal delivered
  | 'contract_signed'          // Customer signed contract
  | 'permits_submitted'        // Permits submitted to AHJ
  | 'permits_approved'         // Permits approved by AHJ
  | 'installation_scheduled'   // Installation date set
  | 'installation_complete'    // Solar system installed
  | 'inspection_passed'        // System passed inspection
  | 'pto_granted';             // Permission to Operate granted

interface Project {
  id: string;
  lead_id: string;
  customer_name: string;
  address: string;
  system_size: number;        // kW
  estimated_cost: number;
  status: ProjectStatus;
  assigned_installer?: string;
  installation_date?: string;
  pto_date?: string;
  created_at: string;
  updated_at: string;
}

// Project status transitions must follow sequence
const validateStatusTransition = (
  currentStatus: ProjectStatus,
  newStatus: ProjectStatus
): boolean => {
  const statusOrder = [
    'lead',
    'contacted',
    'qualified',
    'proposal_sent',
    'contract_signed',
    'permits_submitted',
    'permits_approved',
    'installation_scheduled',
    'installation_complete',
    'inspection_passed',
    'pto_granted',
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);
  const newIndex = statusOrder.indexOf(newStatus);

  // Allow moving forward or staying in same status
  return newIndex >= currentIndex;
};
```

### HR Candidate Management

```typescript
interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position_applied: string;
  resume_url?: string;
  cover_letter?: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  applied_at: string;
  notes?: string;
}

// Candidate pipeline management
const updateCandidateStatus = async (
  candidateId: string,
  newStatus: Candidate['status']
) => {
  const { data, error } = await supabase
    .from('candidates')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', candidateId)
    .select()
    .single();

  return data;
};
```

### Database Integration Patterns

```typescript
// Supabase client initialization (/lib/supabase.ts)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Standard CRUD operations
const createLead = async (leadData: Partial<Lead>): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      ...leadData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Real-time subscriptions (for dashboard updates)
const subscribeToLeadUpdates = (callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('leads_channel')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'leads'
    }, callback)
    .subscribe();

  return () => subscription.unsubscribe();
};
```

## 🎨 Code Style & Standards

### TypeScript Requirements (STRICT ENFORCEMENT)

```typescript
// ✅ CORRECT: Proper interface definition
interface LeadCardProps {
  lead: Lead;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onEdit?: () => void;
  className?: string;
}

// ✅ CORRECT: Type-safe component
const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onStatusChange,
  onEdit,
  className
}) => {
  const handleStatusChange = useCallback((newStatus: LeadStatus) => {
    onStatusChange(lead.id, newStatus);
  }, [lead.id, onStatusChange]);

  return (
    <div className={cn("bg-white rounded-lg shadow-md p-6", className)}>
      {/* Component content */}
    </div>
  );
};

// ❌ INCORRECT: Missing types, no proper interfaces
const LeadCard = ({ lead, onStatusChange, ...props }) => {
  return <div {...props}>{/* content */}</div>;
};
```

### Form Handling Standards

**IMPORTANT**: The CRM uses React Hook Form with Zod validation for all forms.

```typescript
// ✅ CORRECT: React Hook Form with Zod validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const campaignSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  trigger_type: z.enum(['lead_created', 'status_change', 'manual', 'time_based']),
  active: z.boolean().default(true),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const CampaignForm = () => {
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      description: '',
      trigger_type: 'lead_created',
      active: true,
    },
  });

  const onSubmit = async (data: CampaignFormData) => {
    const response = await fetch('/api/crm/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      form.setError('root', { message: error.error });
      return;
    }

    // Success handling
    router.push('/crm/campaigns');
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      {form.formState.errors.name && (
        <p className="text-red-500">{form.formState.errors.name.message}</p>
      )}
      {/* Other form fields */}
      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Creating...' : 'Create Campaign'}
      </button>
    </form>
  );
};
```

### Component Standards & Patterns

```typescript
// ✅ CORRECT: Comprehensive component with all required patterns
interface ComponentProps {
  data: ComponentData;
  onAction?: (id: string) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

const Component: React.FC<ComponentProps> = ({
  data,
  onAction,
  loading = false,
  error = null,
  className,
}) => {
  // Handle loading states
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Handle error states
  if (error) {
    return (
      <div className={cn("bg-red-50 border border-red-200 rounded-lg p-4", className)}>
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  // Handle empty states
  if (!data || data.length === 0) {
    return (
      <div className={cn("bg-gray-50 border border-gray-200 rounded-lg p-12 text-center", className)}>
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  // Event handlers with proper naming
  const handleActionClick = useCallback((id: string) => {
    onAction?.(id);
  }, [onAction]);

  return (
    <div
      className={cn("component-base-styles", className)}
      role="main"
      aria-label="Component description"
    >
      {/* Component content */}
    </div>
  );
};

Component.displayName = 'Component';
export default Component;
```

### API Route Patterns (SECURITY CRITICAL)

**IMPORTANT**: All CRM API routes require Clerk authentication.

```typescript
// ✅ CORRECT: Protected CRM endpoint with Clerk authentication
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const LeadUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost', 'disqualified']),
  notes: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    // 1. Authentication check (REQUIRED for all CRM endpoints)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Request validation with Zod
    const body = await request.json();
    const validatedData = LeadUpdateSchema.parse(body);

    // 3. Database operation
    const { data: lead, error } = await supabase
      .from('leads')
      .update({
        status: validatedData.status,
        notes: validatedData.notes,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', validatedData.id)
      .select()
      .single();

    if (error) throw error;

    // 4. Business logic - trigger campaign enrollment
    if (validatedData.status === 'qualified') {
      await enrollInCampaign(lead.id, 'welcome-qualified-leads');
    }

    // 5. Success response
    return NextResponse.json({
      success: true,
      lead,
    });
  } catch (error) {
    console.error("API Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## 🌐 Environment & Configuration

### Required Environment Variables

```bash
# Core Database & Authentication (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://crm.quantumsolar.us
NODE_ENV=production

# Analytics & Tracking (for CRM usage tracking)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=XXXXXXXXXXXXX

# Email Service (REQUIRED for drip campaigns)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
NOTIFICATION_EMAIL=cesar@quantumsolar.us

# Google Services (for Solar API integration)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_SOLAR_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Third-Party APIs (Planned)
ENPHASE_API_KEY=your_enphase_api_key
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

### Environment Validation Pattern

```typescript
// Always validate critical environment variables
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "RESEND_API_KEY",
] as const;

const validateEnvironment = () => {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

// Call in app initialization or API routes
validateEnvironment();
```

## 🧪 Testing Requirements & Standards

### Testing Strategy (TO BE IMPLEMENTED)

1. **Unit Tests**: All components and utility functions
2. **Integration Tests**: API routes and database operations
3. **E2E Tests**: Critical user workflows (lead management, campaign creation)
4. **Performance Tests**: Dashboard load times and query optimization

### Planned Testing Setup

```bash
# Add to package.json scripts:
# "test": "jest",
# "test:watch": "jest --watch",
# "test:coverage": "jest --coverage",
# "test:e2e": "playwright test",

# Manual testing checklist (until automated tests are configured):
# 1. Test lead CRUD operations
# 2. Test campaign creation and activation
# 3. Test project status updates
# 4. Test candidate management
# 5. Test Excel project import
# 6. Test photo submissions
```

## 🔒 Security & Compliance Requirements

### Authentication & Authorization

```typescript
// All CRM routes protected by Clerk middleware
// See /src/middleware.ts

import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

// Matcher ensures all routes except static files and Next.js internals are protected
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### Data Privacy & Security

```typescript
// Sensitive data handling
interface SecureLeadData {
  // Mark sensitive fields clearly
  firstName: string;      // PII
  lastName: string;       // PII
  email: string;          // PII
  phone: string;          // PII
  address?: string;       // PII

  // Non-PII business data
  utilityCompany?: string;
  homeownerStatus: string;
  status: LeadStatus;
}

// Data sanitization for logging (TO BE IMPLEMENTED)
const sanitizeForLogging = (data: SecureLeadData) => ({
  ...data,
  firstName: data.firstName ? "[REDACTED]" : undefined,
  lastName: data.lastName ? "[REDACTED]" : undefined,
  email: data.email ? "[REDACTED]" : undefined,
  phone: data.phone ? "[REDACTED]" : undefined,
  address: data.address ? "[REDACTED]" : undefined,
});
```

## 🚀 Performance & Optimization

### Performance Requirements

- **Dashboard Load Time**: < 2 seconds for initial load
- **Table Rendering**: < 500ms for up to 1000 records
- **API Response Time**: < 300ms for CRUD operations
- **Real-time Updates**: < 1 second latency for Supabase subscriptions

### Optimization Patterns

```typescript
// Lazy loading for heavy components
import dynamic from 'next/dynamic';

const ProjectImporter = dynamic(() => import('@/components/ProjectImporter'), {
  loading: () => <p className="text-gray-500">Loading importer...</p>,
  ssr: false, // Don't server-render heavy components
});

// Pagination for large datasets
const fetchLeads = async (page: number = 1, pageSize: number = 50) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .range(start, end)
    .order('created_at', { ascending: false });

  return { data, count, error };
};
```

## 🔄 Common Development Tasks

### Adding Email Drip Campaigns

1. **Create Campaign in UI**: Use `/crm/campaigns/new` (to be built)
2. **Define Email Sequences**: Create sequence of emails with delays
3. **Set Trigger**: Choose when campaign enrolls leads (lead_created, status_change, etc.)
4. **Design Email Templates**: Use template editor with variable support
5. **Test Campaign**: Test with sample lead data
6. **Activate Campaign**: Toggle active switch to start enrolling leads

### Adding New CRM Features

1. **Define TypeScript Interfaces**: Create types for new data models
2. **Create Database Tables**: Design Supabase schema
3. **Build API Endpoints**: Create CRUD operations under `/api/crm/`
4. **Create UI Components**: Build dashboard views with shadcn/ui
5. **Add Navigation**: Update navigation in layout
6. **Implement Real-time Updates**: Use Supabase subscriptions
7. **Add Analytics**: Track feature usage with Google Analytics
8. **Write Tests**: Add unit and E2E tests (when configured)

### Importing Project Data

```typescript
// Excel import pattern (/lib/projectParser.ts)
import * as XLSX from 'xlsx';

const parseProjectExcel = (file: File): Promise<Project[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const projects = XLSX.utils.sheet_to_json(sheet);

      // Transform and validate project data
      const validatedProjects = projects.map(validateProject);
      resolve(validatedProjects);
    };

    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};
```

## 📝 Integration with Main Website

### API Integration Pattern

The CRM consumes lead data from the main website's API endpoints:

```typescript
// Sync leads from main website
const syncLeadsFromMainWebsite = async () => {
  // Main website provides API at quantumsolar.us/api/crm/leads
  const response = await fetch('https://quantumsolar.us/api/crm/leads', {
    headers: {
      'Authorization': `Bearer ${process.env.MAIN_WEBSITE_API_KEY}`,
    },
  });

  const leads = await response.json();

  // Import leads into CRM database
  for (const lead of leads) {
    await supabase.from('leads').upsert(lead, {
      onConflict: 'session_id',
    });
  }
};
```

### Data Synchronization

- **Lead Sync**: Automatic sync of new leads from main website to CRM
- **Project Sync**: Manual project creation from qualified leads
- **Photo Sync**: Field team photos synced to project records
- **Campaign Attribution**: Track which campaigns generated which leads

## 🎯 Business Priorities & Critical Reminders

**CRITICAL REMINDERS:**

1. **ALWAYS** run `npm run lint` before committing - zero errors allowed
2. **ALWAYS** use Clerk authentication for all CRM routes
3. **ALWAYS** use TypeScript strict mode - no `any` types
4. **ALWAYS** implement proper error boundaries and loading states
5. **ALWAYS** use React Hook Form + Zod for form validation
6. **ALWAYS** follow the established component and API patterns
7. **ALWAYS** protect sensitive customer data (PII sanitization)
8. **ALWAYS** test campaign triggers before activating

**BUSINESS PRIORITIES:**

1. Email drip campaign reliability (primary lead nurture tool)
2. Lead management accuracy and real-time updates
3. Project pipeline visibility for team coordination
4. Data integrity across lead/project lifecycle
5. Team productivity (fast load times, intuitive UI)
6. Analytics and reporting for business intelligence

**PERFORMANCE TARGETS:**

- Dashboard load time: < 2 seconds
- API response time: < 300ms
- Real-time updates: < 1 second latency
- Table rendering: < 500ms for 1000 records

**SECURITY REQUIREMENTS:**

- All routes protected with Clerk authentication
- PII data sanitization in logs
- Secure API endpoints with authentication checks
- Input validation with Zod schemas
- HTTPS-only in production

Follow these guidelines exactly to ensure consistent, high-quality development that serves Quantum Solar's CRM operations and maintains code quality standards.
