# Quantum Solar CRM

Internal Customer Relationship Management system for Quantum Solar Enterprises LLC.

## Overview

This CRM application is built with Next.js 15 and provides comprehensive management tools for:
- Lead tracking and management
- Project management and milestones
- Team member and candidate management
- Customer communications
- Business analytics

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase
- **Authentication**: Clerk
- **Deployment**: Vercel

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see `.env.example`)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to `/crm`

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint

## Deployment

Deployed to Vercel at `crm.quantumsolar.us` subdomain.

For detailed development guidance, see `CLAUDE.md`.
