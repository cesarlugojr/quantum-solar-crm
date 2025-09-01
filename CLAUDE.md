# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quantum Solar CRM is a Next.js 15 application focused exclusively on customer relationship management for a Florida-based solar installation company. The project uses TypeScript, Tailwind CSS, shadcn/ui components, Supabase for database, and Clerk for authentication. This is the internal CRM system separated from the customer-facing website, designed for managing leads, projects, and team operations.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (ensure no errors before committing)

### Environment Requirements
- Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Clerk authentication keys
- Google Analytics and Facebook Pixel tracking codes
- Various API keys for integrations (Twilio, Enphase, Google Solar API)

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk (with middleware protection)
- **Analytics**: Google Analytics, Google Tag Manager, Facebook Pixel
- **Form Handling**: React Hook Form with Zod validation
- **Deployment**: Vercel

### Key Directory Structure
```
src/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── crm/                  # CRM-related endpoints
│   │   ├── integrations/         # Third-party API integrations
│   │   └── [other-endpoints]/
│   ├── crm/                      # CRM dashboard pages (protected)
│   ├── state-promotions/         # Location-specific landing pages
│   │   └── illinois/ameren-il/   # Multi-step lead capture flow
│   └── [other-pages]/
├── components/                   # Reusable React components
│   ├── ui/                      # shadcn/ui base components
│   └── [business-components]/
└── lib/                         # Utility functions and configurations
```

### Authentication & Authorization
- Protected routes use Clerk middleware (see `src/middleware.ts`)
- CRM routes (`/crm/*`) require authentication
- Role-based access control planned but currently all authenticated users have full access
- Session storage used extensively for multi-step forms to prevent data loss

### Database Integration
- Supabase client configured in `src/lib/supabase.ts`
- Type-safe database interfaces defined for leads, projects, candidates
- Contact submissions stored in `contact_submissions` table
- Handles graceful fallbacks when environment variables are missing

### Form Architecture
The application features sophisticated multi-step forms with several patterns:

#### Lead Capture Forms
- **SplashForm**: 13-step Illinois Ameren promotion form with TCPA compliance
- **SplashFormCompetitor**: Alternative competitor-focused form structure  
- Session storage persistence across all steps to prevent data loss
- Early TCPA consent collection (step 4) for abandoned lead follow-up
- Conditional disqualification logic based on responses
- Real-time validation with Zod schemas

#### Form Flow Pattern
1. Session ID generation (`QSLID-` prefix for lead IDs)
2. Progressive data collection with validation
3. Session storage backup after each step
4. TCPA/SMS consent handling
5. Conditional routing based on responses
6. Final submission to Supabase + email notifications

### CRM System
- Comprehensive dashboard with role-based views
- Lead management with status tracking
- Project milestone tracking (11-stage pipeline planned)
- Job candidate management system
- Photo submission system for site surveys/installations
- Import functionality for bulk project data

### Component Patterns
- All components use TypeScript with proper interfaces
- shadcn/ui components for consistent design system
- Responsive design with mobile-first approach
- Accessibility compliance with ARIA labels and keyboard navigation
- Error boundaries and loading states throughout

### API Architecture
- RESTful endpoints under `/api/`
- CRM endpoints for leads, projects, candidates management
- Integration endpoints for Twilio, Enphase, Google Solar API
- Consistent error handling and response formats
- Environment validation in API routes

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

### Testing Requirements
- Run `npm run lint` before committing (no ESLint errors allowed)
- Test responsive design across devices
- Validate form flows end-to-end
- Check API integrations in development

### Common Tasks

#### Adding New Lead Capture Forms
1. Create form component following SplashForm pattern
2. Implement session storage for data persistence  
3. Add TCPA consent handling
4. Create API endpoint for submission
5. Set up email notifications
6. Add analytics tracking

#### CRM Feature Development
1. Define TypeScript interfaces for new data types
2. Create Supabase table schema and API endpoints
3. Build UI components with proper role-based access
4. Implement real-time data updates
5. Add mobile responsiveness

#### Integration Development
1. Create API routes under `/api/integrations/`
2. Handle authentication and rate limiting
3. Implement error handling and logging
4. Add TypeScript types for external API responses
5. Create corresponding UI components

## Key Integrations

### Current Integrations
- **Supabase**: Database, authentication, file storage
- **Clerk**: User authentication and session management
- **Analytics**: Google Analytics, Google Tag Manager, Facebook Pixel
- **Email**: Resend for transactional emails
- **Excel Processing**: xlsx for project import functionality

### Planned Integrations
- **Twilio**: SMS notifications and two-way messaging
- **Google Solar API**: Solar potential calculations and roof analysis
- **Enphase API**: Solar system monitoring and performance data
- **Calendar Systems**: Appointment scheduling integration

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

## Mobile Considerations

- Mobile-first responsive design approach
- Touch-friendly interface elements
- Photo capture functionality for field operations
- Offline capability planned for mobile app
- Progressive Web App (PWA) features configured