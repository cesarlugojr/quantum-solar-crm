# Quantum Solar CRM

[![Next.js](https://img.shields.io/badge/Next.js-15.0.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?logo=clerk)](https://clerk.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com/)

## Overview

Quantum Solar CRM is a comprehensive Customer Relationship Management system designed specifically for **Quantum Solar Enterprises LLC**, an Illinois-based solar installation company. This internal CRM platform streamlines lead management, project tracking, team operations, and customer communications to restore faith in the residential solar industry through transparency and exceptional service.

### 🌟 Key Features

- **Lead Management**: Multi-step lead capture forms with TCPA compliance and session persistence
- **Project Tracking**: 11-stage pipeline management for solar installations
- **Team Operations**: Candidate management and role-based access control
- **Customer Communications**: Integrated messaging and notification systems
- **Analytics Integration**: Google Analytics, Tag Manager, and Facebook Pixel tracking
- **Mobile-First Design**: Responsive interface optimized for field operations
- **Data Import/Export**: Excel-based project import and data management tools

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Supabase account and project
- Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/quantum-solar-crm.git
   cd quantum-solar-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**

   Copy `.env.example` to `.env.local` and configure the following variables:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Analytics & Tracking
   NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
   NEXT_PUBLIC_GTM_ID=your_gtm_id
   NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id

   # API Integrations (Optional)
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   GOOGLE_SOLAR_API_KEY=your_google_solar_key
   ENPHASE_API_KEY=your_enphase_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to `/crm`

## 🏗️ Architecture

### Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 15 | Full-stack React framework with App Router |
| **Language** | TypeScript | Type-safe development with strict mode |
| **Styling** | Tailwind CSS + shadcn/ui | Responsive design system |
| **Database** | Supabase (PostgreSQL) | Real-time database with authentication |
| **Auth** | Clerk | User authentication and session management |
| **Forms** | React Hook Form + Zod | Type-safe form validation |
| **Analytics** | Google Analytics, GTM, FB Pixel | Comprehensive tracking |
| **Deployment** | Vercel | Production hosting and CI/CD |

### Project Structure

```
quantum-solar-crm/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── crm/                  # CRM endpoints (leads, projects, candidates)
│   │   │   ├── integrations/         # Third-party API integrations
│   │   │   └── send/                 # Email notifications
│   │   ├── crm/                      # Protected CRM dashboard
│   │   │   ├── leads/               # Lead management pages
│   │   │   ├── projects/            # Project tracking pages
│   │   │   └── candidates/          # Team management pages
│   │   ├── state-promotions/        # Location-specific landing pages
│   │   │   └── illinois/ameren-il/  # Multi-step lead capture
│   │   ├── sign-in/                 # Authentication pages
│   │   └── sign-up/
│   ├── components/                   # React Components
│   │   ├── ui/                      # shadcn/ui base components
│   │   ├── SplashForm.tsx           # Main lead capture form
│   │   ├── ProjectImporter.tsx      # Excel import functionality
│   │   └── PhotoSubmissionForm.tsx  # Field operations
│   ├── lib/                         # Utilities & Configuration
│   │   ├── supabase.ts             # Database client
│   │   ├── utils.ts                # Helper functions
│   │   └── validations.ts          # Zod schemas
│   └── middleware.ts                # Clerk auth middleware
├── public/                          # Static assets
├── CLAUDE.md                        # Development guidelines
└── package.json                     # Dependencies & scripts
```

## 📊 Core Features

### Lead Management System

The CRM features sophisticated multi-step lead capture forms with:

- **Session Persistence**: Data saved automatically to prevent loss
- **TCPA Compliance**: Early consent collection for legal compliance
- **Conditional Logic**: Smart routing based on responses
- **Real-time Validation**: Zod-powered form validation
- **Analytics Tracking**: Comprehensive conversion tracking

**Main Lead Capture Forms:**
- `SplashForm`: 13-step Illinois Ameren promotion form
- `SplashFormCompetitor`: Alternative competitor-focused flow

### Project Management

Comprehensive project tracking with:

- **11-Stage Pipeline**: From lead to installation completion
- **Milestone Tracking**: Detailed progress monitoring
- **Excel Import**: Bulk project data import via `ProjectImporter`
- **Photo Submissions**: Field documentation via `PhotoSubmissionForm`
- **Real-time Updates**: Live status synchronization

### Team Operations

- **Candidate Management**: Full recruitment workflow
- **Role-based Access**: Secure permission system (planned)
- **Performance Tracking**: Team metrics and analytics
- **Mobile Optimization**: Field-friendly interface

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint (must pass before commits)
```

### Code Style Guidelines

- **Early Returns**: Use early returns for improved readability
- **Tailwind Only**: No raw CSS, use Tailwind classes exclusively
- **TypeScript Strict**: Proper interfaces and type safety
- **Descriptive Naming**: Clear variable and function names
- **Event Handlers**: Prefix with `handle` (e.g., `handleSubmit`)
- **Accessibility**: Include ARIA labels and keyboard navigation

### Database Schema

Key tables in Supabase:

```sql
-- Lead submissions from forms
contact_submissions (
  id, name, email, phone, address,
  tcpa_consent, session_id, created_at
)

-- CRM project tracking
projects (
  id, name, status, customer_info,
  installation_date, system_size, created_at
)

-- Team candidate management
candidates (
  id, name, email, phone, position,
  status, skills, created_at
)
```

## 🔌 Integrations

### Current Integrations

- **Supabase**: Database, authentication, real-time subscriptions
- **Clerk**: User authentication and session management
- **Resend**: Transactional email delivery
- **Google Analytics**: Website and conversion tracking
- **Facebook Pixel**: Social media advertising analytics

### Planned Integrations

- **Twilio**: SMS notifications and two-way messaging
- **Google Solar API**: Solar potential calculations
- **Enphase API**: System monitoring and performance data
- **Calendar Systems**: Appointment scheduling

## 🚀 Deployment

### Production Environment

- **URL**: `crm.quantumsolar.us`
- **Platform**: Vercel with automatic deployments
- **Database**: Supabase production instance
- **CDN**: Vercel Edge Network for global performance

### Environment Variables

Ensure all required environment variables are configured in your deployment platform:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | ✅ |
| `CLERK_SECRET_KEY` | Clerk secret key | ✅ |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID | ⚪ |
| `RESEND_API_KEY` | Email service key | ⚪ |

## 🔒 Security

- **Authentication**: Clerk-based user authentication
- **Route Protection**: Middleware-based access control
- **Environment Variables**: Secure credential management
- **CORS Headers**: Proper cross-origin request handling
- **Input Validation**: Zod schema validation for all forms
- **File Upload Security**: Sanitization and validation (planned)

## 📱 Mobile Considerations

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Touch Interface**: Optimized for field operations
- **Photo Capture**: Native camera integration
- **Offline Support**: Progressive Web App features (planned)
- **Performance**: Optimized for mobile networks

## 🧪 Testing

Before committing changes:

1. **Lint Check**: `npm run lint` (must pass)
2. **Type Check**: Verify TypeScript compilation
3. **Manual Testing**: Test responsive design across devices
4. **Form Validation**: End-to-end form flow testing
5. **API Integration**: Verify all endpoints function correctly

## 📈 Performance

- **Next.js 15**: Latest framework with Turbopack for fast builds
- **Font Optimization**: Local Geist variable fonts
- **Image Optimization**: Next.js built-in image optimization
- **Session Storage**: Client-side form persistence
- **Database Pooling**: Supabase connection optimization

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow code style guidelines
4. **Run tests**: Ensure `npm run lint` passes
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**: Detailed description of changes

### Development Workflow

- **Feature Branches**: Use descriptive branch names
- **Small Commits**: Focus on single features or fixes
- **Clear Messages**: Descriptive commit messages
- **Regular Merging**: Keep up to date with main branch

## 📞 Support

For development guidance and detailed instructions, see [`CLAUDE.md`](./CLAUDE.md).

### Company Information

- **Company**: Quantum Solar Enterprises LLC (DBA Quantum Solar)
- **Industry**: Residential Solar Installation
- **Service Areas**: Florida (HQ), Illinois, Nationwide Facilitation
- **Mission**: Restore faith in residential solar through transparency

---

**Built with ❤️ by the Quantum Solar team to revolutionize the solar industry through technology and transparency.**