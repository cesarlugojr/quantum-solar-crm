# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with the Quantum Solar CRM codebase. Follow these instructions exactly as written to ensure consistent, high-quality development that aligns with project standards and business requirements.

## 🏢 Project Overview

**Quantum Solar CRM** is a comprehensive Next.js 15 application for Quantum Solar Enterprises LLC, a Florida-based solar installation company focused on restoring faith in the residential solar industry through transparency and exceptional service.

### Business Context
- **Company**: Quantum Solar Enterprises LLC (DBA Quantum Solar)
- **Industry**: Residential solar installation and energy solutions
- **Mission**: Restore faith in residential solar industry through transparency
- **Service Areas**:
  - Primary: Florida (full-service installations)
  - Secondary: Illinois (Ameren utility territory promotions)
  - Tertiary: Nationwide facilitation and consulting
- **Core Values**: Transparency, customer-first approach, industry innovation

### Application Purpose
The platform serves multiple business functions:
1. **Lead Generation**: Multi-step forms with TCPA compliance for solar lead capture
2. **CRM Operations**: Comprehensive customer relationship management system
3. **Project Management**: 11-stage solar installation pipeline tracking
4. **HR Management**: Job candidate application and tracking system
5. **Analytics**: Performance tracking and conversion optimization
6. **Integration Hub**: Third-party solar industry API integrations

**Key Enhancement**: The project follows the **Enhanced Complete Implementation Guide** which leverages 150+ open source solar industry projects including pvlib-python (NREL calculations), WatermelonDB (offline-first mobile), TimescaleDB (time-series optimization), and enterprise integrations.

## 💻 Development Commands & Workflow

### Essential Commands
```bash
# Development
npm run dev                  # Start development server with Turbopack
npm run build               # Build for production
npm run start               # Start production server
npm run lint                # Run ESLint (MUST pass before committing)

# Testing
npm run test                # Run unit tests
npm run test:coverage       # Run tests with coverage report
npm run test:e2e            # Run end-to-end tests with Playwright
npm run test:all            # Run complete test suite (lint + tests + e2e)

# Quality Assurance
npm run storybook           # Launch Storybook for component development
npm run chromatic           # Run visual regression tests
```

### Pre-Commit Requirements (CRITICAL)
**Before any commit, you MUST run and ensure these pass:**
1. `npm run lint` - Zero ESLint errors allowed
2. `npm run test` - All unit tests must pass
3. TypeScript compilation must succeed
4. No console.error or console.warn in production code

### Environment Configuration
Create a `.env.local` file with these required variables:

#### Core Platform (Required)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### Analytics & Communication (Recommended)
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1234567890123456
NOTIFICATION_EMAIL=cesar@quantumsolar.us
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Solar Industry APIs (Planned)
```env
GOOGLE_SOLAR_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ENPHASE_API_KEY=your_enphase_api_key
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🏗️ Tech Stack & Architecture

### Core Technologies
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Authentication**: Clerk with Next.js middleware integration
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Context + Session Storage
- **Analytics**: Google Analytics 4, Google Tag Manager, Facebook Pixel
- **Email Service**: Resend for transactional emails
- **Deployment**: Vercel with automatic Git deployments

### Enhanced Solar Industry Features (Planned)
- **Solar Calculations**: pvlib-python microservice + NREL's SAM for financial modeling
- **Time-Series Data**: TimescaleDB extension for 353x faster solar production queries
- **Mobile Operations**: React Native + Expo with WatermelonDB for offline-first architecture
- **Real-time Monitoring**: OpenEMS integration + Sunalyzer vendor-independent dashboards
- **API Gateway**: Kong for enterprise partner integrations
- **Automation**: ActivePieces for no-code workflow automation

### Project Structure
```
src/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # Backend API routes
│   │   ├── 📁 crm/                  # CRM management endpoints
│   │   │   ├── leads/               # Lead CRUD operations
│   │   │   ├── projects/            # Project management APIs
│   │   │   └── candidates/          # HR candidate management
│   │   ├── 📁 integrations/         # Third-party API integrations
│   │   ├── contact/                 # Contact form submission APIs
│   │   ├── upload/                  # File upload handling
│   │   └── webhooks/                # External service webhooks
│   ├── 📁 crm/                      # Protected CRM dashboard
│   │   ├── page.tsx                 # Main CRM dashboard
│   │   ├── leads/[id]/              # Individual lead management
│   │   ├── projects/[id]/           # Project detail pages
│   │   ├── candidates/[id]/         # Candidate profiles
│   │   └── layout.tsx               # CRM layout with navigation
│   ├── 📁 state-promotions/         # Geographic targeting campaigns
│   │   └── 📁 illinois/             # Illinois-specific campaigns
│   │       └── 📁 ameren-il/        # Ameren utility promotion
│   │           ├── 📁 homeowner/    # Initial qualification steps
│   │           ├── 📁 first-name/   # Progressive data collection
│   │           ├── 📁 consent/      # TCPA compliance handling
│   │           ├── 📁 thank-you/    # Conversion confirmation
│   │           └── 📁 disqualified/ # Non-qualified lead routing
│   ├── 📁 splash/                   # Alternative form flows
│   ├── 📁 sign-up/                  # User registration pages
│   ├── layout.tsx                   # Root application layout
│   ├── page.tsx                     # Homepage
│   └── globals.css                  # Global styles and Tailwind imports
├── 📁 components/                   # Reusable React components
│   ├── 📁 ui/                       # shadcn/ui base components
│   ├── 📁 forms/                    # Business form components
│   ├── 📁 crm/                      # CRM-specific components
│   ├── 📁 layout/                   # Layout components
│   └── 📁 analytics/                # Tracking components
└── 📁 lib/                          # Utility functions and configurations
    ├── supabase.ts                  # Supabase client configuration
    ├── clerk.ts                     # Clerk authentication setup
    ├── utils.ts                     # General utility functions
    ├── validations.ts               # Zod schema definitions
    └── constants.ts                 # Application constants
```

### Database Architecture
- **Primary Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Real-time Subscriptions**: Supabase channels for live project updates
- **Type Safety**: Auto-generated TypeScript types from database schema
- **Core Tables**:
  - `contact_submissions` - Lead capture and contact forms
  - `projects` - CRM project management with 11-stage pipeline
  - `candidates` - Job applicant and contractor management
  - `file_uploads` - Document and photo storage
  - `activity_log` - User action tracking and audit trail

### Authentication & Security
- **Clerk Integration**: Modern authentication with social login support
- **Protected Routes**: Middleware-based route protection for CRM areas
- **Environment Variables**: Sensitive data stored securely
- **Input Validation**: Zod schema validation for all form inputs
- **TCPA Compliance**: Legal consent mechanisms for communications

## 📋 Core Business Logic & Patterns

### Lead Capture Form Architecture
The application's primary business function is solar lead capture through sophisticated multi-step forms:

#### Form Flow Pattern (CRITICAL - Follow Exactly)
```typescript
// 1. Session ID Generation
const sessionId = `QSLID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 2. Progressive Data Collection with Real-time Validation
const formSteps = [
  'homeowner-qualification',
  'personal-info-collection',
  'contact-details',
  'tcpa-consent',           // CRITICAL: Step 4 for legal compliance
  'utility-information',
  'property-details',
  'financial-qualification',
  'final-submission'
];

// 3. Session Storage Backup (After Each Step)
const saveFormProgress = (stepData: Partial<FormData>) => {
  try {
    const existingData = JSON.parse(sessionStorage.getItem(sessionId) || '{}');
    const updatedData = { ...existingData, ...stepData };
    sessionStorage.setItem(sessionId, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Failed to save form progress:', error);
  }
};

// 4. TCPA/SMS Consent Handling (Step 4 - LEGALLY REQUIRED)
const handleTCPAConsent = (consentData: TCPAConsentData) => {
  // Must collect explicit consent for SMS/phone communication
  const consentRecord = {
    consent_tcpa: consentData.tcpaConsent,
    consent_sms: consentData.smsConsent,
    consent_timestamp: new Date().toISOString(),
    ip_address: getClientIP(),
    user_agent: navigator.userAgent,
  };

  saveFormProgress({ ...consentData, ...consentRecord });
};

// 5. Final Submission to Supabase + Email Notifications
const submitLead = async (formData: CompleteFormData) => {
  try {
    const { data: leadRecord } = await supabase
      .from('contact_submissions')
      .insert(formData)
      .select()
      .single();

    await sendLeadNotificationEmail(leadRecord);
    trackConversionEvent('lead_submitted', leadRecord);

    return leadRecord;
  } catch (error) {
    console.error('Lead submission failed:', error);
    throw error;
  }
};
```

#### Key Form Components
- **SplashForm**: 13-step Illinois Ameren promotion form with TCPA compliance
- **SplashFormCompetitor**: Alternative competitor-focused form structure
- **ContactForm**: General contact form for inquiries
- **Session Persistence**: Automatic form data backup to prevent loss
- **Conditional Logic**: Smart routing based on qualification criteria

### CRM System Architecture
The CRM system manages the complete solar installation lifecycle:

#### Project Status Pipeline (11 Stages)
```typescript
type ProjectStatus =
  | 'lead'                    // Initial lead received
  | 'contacted'               // First contact made
  | 'qualified'               // Lead qualified for solar
  | 'proposal_sent'           // Solar proposal delivered
  | 'contract_signed'         // Customer signed contract
  | 'permits_submitted'       // Permits submitted to AHJ
  | 'permits_approved'        // Permits approved by AHJ
  | 'installation_scheduled'  // Installation date set
  | 'installation_complete'   // Solar system installed
  | 'inspection_passed'       // System passed inspection
  | 'pto_granted';           // Permission to Operate granted

// Project status transitions must follow this sequence
const validateStatusTransition = (currentStatus: ProjectStatus, newStatus: ProjectStatus): boolean => {
  const statusOrder = [
    'lead', 'contacted', 'qualified', 'proposal_sent', 'contract_signed',
    'permits_submitted', 'permits_approved', 'installation_scheduled',
    'installation_complete', 'inspection_passed', 'pto_granted'
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);
  const newIndex = statusOrder.indexOf(newStatus);

  return newIndex >= currentIndex;
};
```

#### CRM Features
- **Lead Management**: Comprehensive lead tracking with status progression
- **Project Pipeline**: 11-stage project milestone tracking system
- **Candidate Management**: Job applicant and contractor management
- **Photo Submission**: Site survey and installation documentation
- **Bulk Import**: Excel-based project data import functionality
- **Real-time Dashboard**: Live metrics and KPI tracking

### Component Patterns
- All components use TypeScript with proper interfaces
- shadcn/ui components for consistent design system
- Responsive design with mobile-first approach
- Accessibility compliance with ARIA labels and keyboard navigation
- Error boundaries and loading states throughout

### Enhanced API Architecture
- **RESTful Endpoints**: Organized under `/api/` with consistent patterns
- **Solar Calculations**: `/api/solar/` endpoints integrating pvlib-python microservice
- **Real-time Monitoring**: `/api/monitoring/` for OpenEMS and Sunalyzer data ingestion
- **CRM Operations**: Enhanced `/api/crm/` with solar-specific project lifecycle
- **Partner Integrations**: Kong API gateway managing third-party solar industry APIs
- **Time-Series Data**: Optimized endpoints for TimescaleDB solar production queries
- **Mobile Sync**: PowerSync endpoints for offline-first mobile synchronization
- **Workflow Automation**: ActivePieces webhook endpoints for automated processes
- **TCPA Compliance**: Automated communication endpoints with legal compliance
- **Error Handling**: Comprehensive error tracking with solar industry context

## Code Style Guidelines (from .cursorrules)

### Core Principles
- Use early returns for readability
- Always use Tailwind classes for styling (avoid raw CSS)
- Prefer `const` over `function` declarations
- Use descriptive variable/function names
- Event handlers should have `handle` prefix (e.g., `handleClick`)
- Implement accessibility features (tabindex, aria-label, keyboard events)

### TypeScript Usage
- Strict TypeScript configuration
- Define proper interfaces for all data structures
- Use type-safe database operations
- Import path aliases configured (`@/*` maps to `./src/*`)

### Component Standards
- Functional components with hooks
- Proper error handling and loading states
- Mobile-responsive design patterns
- Comment business logic, not obvious code
- Focus on "why" and "how" in comments, not just "what"

### Business Context
- Company: Quantum Solar Enterprises LLC (DBA Quantum Solar)
- Industry: Residential solar installation
- Service areas: Florida (headquarters), Illinois, nationwide facilitation
- Mission: Restore faith in residential solar industry through transparency

## Development Workflow

### Git Practices
- Feature branches for new functionality
- Clear, descriptive commit messages
- Small, focused commits
- Regular merging from main branch

### Enhanced Testing Requirements (90% Coverage Minimum)
- **Unit Tests**: Run `npm run test` with Vitest (5-10x faster than Jest)
- **Integration Tests**: `npm run test:integration` with local Supabase instance
- **E2E Tests**: `npm run test:e2e` with Playwright cross-browser testing
- **Database Tests**: `npm run test:db` with pgTAP for PostgreSQL validation
- **Visual Regression**: `npm run chromatic` for UI consistency
- **Performance Tests**: Load testing with k6 for solar calculation endpoints
- **Mobile Tests**: Detox testing for React Native offline functionality (planned)
- **Solar Accuracy**: Validation against NREL data for calculation precision
- **Coverage Gates**: 90% minimum coverage across all test types
- **ESLint**: Zero errors before committing (automated in CI/CD)

### Common Tasks

#### Adding New Lead Capture Forms
1. Create form component following SplashForm pattern
2. Implement session storage for data persistence  
3. Add TCPA consent handling
4. Create API endpoint for submission
5. Set up email notifications
6. Add analytics tracking

#### Enhanced CRM Feature Development
1. Define TypeScript interfaces following solar industry standards
2. Create TimescaleDB schemas for time-series data (if applicable)
3. Implement Supabase RLS policies for role-based access
4. Build UI components with Tremor analytics (for dashboards)
5. Add real-time subscriptions for live updates
6. Create corresponding mobile components for field operations
7. Write comprehensive tests (unit, integration, E2E)
8. Validate against NREL standards (for solar calculations)

#### Solar Integration Development
1. Create microservice endpoints under `/services/`
2. Implement Kong API gateway routing and security
3. Add pvlib-python calculation endpoints with caching
4. Create ActivePieces workflows for automation
5. Build real-time monitoring dashboards with OpenEMS/Sunalyzer
6. Add TimescaleDB queries for performance analytics
7. Implement mobile sync with WatermelonDB/PowerSync
8. Add comprehensive error handling and monitoring

## Key Integrations

### Current Integrations (Foundation)
- **Supabase**: PostgreSQL database with TimescaleDB extension for time-series
- **Clerk**: User authentication, session management, and role-based access control
- **Analytics**: Google Analytics, Google Tag Manager, Facebook Pixel
- **Email**: Resend for TCPA-compliant transactional emails
- **Testing Framework**: Vitest + Playwright + Chromatic for comprehensive QA
- **UI Components**: shadcn/ui + Tremor for analytics dashboards

### Solar Industry Integrations (Enhanced)
- **pvlib-python**: NREL-standard solar production calculations (microservice)
- **SAM (System Advisor Model)**: NREL financial modeling for bankable reports
- **TimescaleDB**: 353x faster time-series queries for production monitoring
- **OpenEMS**: Enterprise energy management for commercial solar projects
- **Sunalyzer**: Vendor-independent solar monitoring dashboards
- **Kong API Gateway**: Enterprise-grade partner integration management

### Mobile & Automation (Planned Implementation)
- **WatermelonDB**: Offline-first mobile database with PowerSync synchronization
- **React Native Camera**: Photo capture with geolocation for field operations
- **ActivePieces**: No-code workflow automation for business processes
- **Twilio**: TCPA-compliant SMS notifications and two-way messaging
- **Google Solar API**: Roof analysis and solar potential calculations
- **Enphase API**: Real-time solar system performance monitoring
- **Google Workspace**: Calendar, Drive, and Gmail integration for project management

## Performance Considerations

- Uses Next.js 15 with Turbopack for fast development builds
- Local font optimization (Geist variable fonts)
- Image optimization through Next.js built-in features
- Session storage for form persistence (client-side performance)
- Supabase connection pooling for database efficiency

## Security Notes

- Environment variables properly configured with fallbacks
- CORS and security headers should be configured
- File upload validation and sanitization required
- Role-based access control implementation pending
- API rate limiting should be implemented for production
- Never commit secrets or API keys to the repository

---

## 🎯 Summary & Quick Reference

**CRITICAL REMINDERS:**
1. **ALWAYS** run `npm run lint` before committing - zero errors allowed
2. **ALWAYS** collect TCPA consent in step 4 of lead forms
3. **ALWAYS** use TypeScript strict mode - no `any` types
4. **ALWAYS** implement proper error boundaries and loading states
5. **ALWAYS** save form progress to session storage
6. **ALWAYS** validate environment variables on app start
7. **ALWAYS** follow the established component and API patterns

**BUSINESS PRIORITIES:**
1. Lead capture form optimization and conversion
2. CRM system functionality and user experience
3. Mobile-responsive design and performance
4. Analytics tracking and conversion attribution
5. TCPA compliance and legal requirements

**PERFORMANCE TARGETS:**
- Lighthouse Performance: 90+
- Form load time: < 1 second per step
- Bundle size: < 400KB total JavaScript
- Test coverage: > 80% for critical business logic

Follow these guidelines exactly to ensure consistent, high-quality development that serves Quantum Solar's business objectives and maintains code quality standards.