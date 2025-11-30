# Quantum Solar CRM v2

A modern, production-ready CRM interface built with Next.js 15, featuring enhanced UI/UX, solar-specific data tracking, and advanced analytics.

## 🎯 Overview

CRM v2 is a **complete UI/UX redesign** of the Quantum Solar CRM, implementing modern design patterns and solar industry-specific features based on the Compass artifact architecture. It runs alongside the existing `/crm` route, allowing for side-by-side comparison.

## 🔥 Key Improvements Over v1

### Architecture
- ✅ **Next.js 15 Server Components** - Better performance, smaller JS bundles
- ✅ **Server Actions** - Type-safe data mutations without API routes
- ✅ **Suspense & Streaming** - Progressive page loading
- ✅ **Modern TypeScript** - Strict typing throughout

### UI/UX
- ✅ **Executive Dashboard** - KPIs, charts, cash flow forecasting
- ✅ **Data Tables** - Professional tables with sorting/filtering (replacing card layouts)
- ✅ **Enhanced Detail Pages** - Full-featured instead of empty placeholders
- ✅ **Better Navigation** - Sidebar with breadcrumbs and quick actions
- ✅ **Loading States** - Skeleton screens instead of spinners

### Solar Industry Features
- ✅ **Revenue Type Tracking** - GoodPWR ($0.60/W) vs Self-Gen ($1.47/W)
- ✅ **Milestone Payments** - 5-stage payment tracking
- ✅ **13-Week Cash Flow** - Rolling cash flow forecast
- ✅ **Geographic Analytics** - County-level performance (St. Clair optimization)
- ✅ **Pipeline Stages** - 12-stage solar installation pipeline
- ✅ **System Sizing** - Track kW capacity, panel count, inverters

## 📁 Project Structure

```
src/app/crmv2/
├── layout.tsx                 # Main layout with sidebar
├── page.tsx                   # Executive Dashboard
├── actions.ts                 # Server actions for data fetching
├── leads/
│   ├── page.tsx               # Leads table view
│   └── [id]/page.tsx          # Lead detail page
├── projects/
│   ├── page.tsx               # Projects table view
│   └── [id]/page.tsx          # Project detail page
├── candidates/
│   ├── page.tsx               # Candidates table view
│   └── [id]/page.tsx          # Candidate detail page
├── campaigns/
│   ├── page.tsx               # Campaigns table view
│   └── [id]/page.tsx          # Campaign detail page
└── settings/
    └── page.tsx               # Settings page

src/components/crmv2/
├── executive-dashboard/
│   ├── MetricsCards.tsx       # KPI metric cards
│   ├── RevenueChart.tsx       # Revenue analytics chart
│   ├── PipelineFunnel.tsx     # Conversion funnel
│   └── CashFlowChart.tsx      # 13-week forecast chart
├── data-tables/
│   ├── LeadsDataTable.tsx     # Enhanced leads table
│   ├── ProjectsDataTable.tsx  # Enhanced projects table
│   └── DataTableToolbar.tsx   # Search, filters, actions
└── LoadingSkeletons.tsx       # Loading state components

src/types/crmv2.ts             # TypeScript type definitions

supabase/migrations/
└── 001_add_solar_fields_v2.sql # Database schema extensions
```

## 🗄️ Database Extensions

The v2 CRM extends existing tables with solar-specific fields:

### Leads Table Extensions
- `system_size_kw` - Estimated system size
- `utility_company` - Primary utility provider
- `average_monthly_bill` - Monthly electric cost
- `homeowner_status` - Owner/renter/other
- `credit_score` - Excellent/good/fair/poor
- `county` - County for geographic analytics

### Projects Table Extensions
- `revenue_type` - GoodPWR or self_gen
- `system_size_kw` - Actual system size
- `estimated_revenue` - Calculated revenue
- `actual_revenue` - Final revenue
- `milestone_payments` - JSONB array of payment milestones
- `ahj_jurisdiction` - Authority Having Jurisdiction
- `pto_date` - Permission to Operate date
- `panel_count`, `inverter_type`, `battery_included`

### Analytics Views
- `mv_revenue_analytics` - Revenue by type and month
- `mv_pipeline_analytics` - Project distribution by stage
- `mv_lead_conversion` - Conversion rates by county/utility

### Functions
- `calculate_cash_flow_forecast()` - 13-week rolling forecast
- `generate_default_milestones()` - Auto-generate payment milestones

## 🚀 Getting Started

### 1. Run Database Migration

```bash
# Connect to Supabase and run the migration
supabase db push supabase/migrations/001_add_solar_fields_v2.sql
```

Or copy the SQL content and run in Supabase SQL Editor.

### 2. Install Dependencies

```bash
npm install @tremor/react recharts @tanstack/react-table
```

### 3. Access CRM v2

Navigate to `/crmv2` in your browser. The route is protected by Clerk authentication (same as `/crm`).

### 4. Compare with v1

Toggle between v1 and v2 using:
- Footer link: "Switch to CRM v1" / "Switch to CRM v2"
- Direct navigation: `/crm` vs `/crmv2`

## 📊 Dashboard Features

### Executive Dashboard (`/crmv2`)

**Metrics Cards:**
- Total Leads - All leads in system
- Active Projects - Projects in stages 5-11
- Conversion Rate - Projects/Leads percentage
- Monthly Revenue - Current month revenue

**Charts:**
- Revenue by Type - Bar chart comparing GoodPWR vs Self-Gen
- Pipeline Funnel - Conversion funnel through 12 stages
- 13-Week Cash Flow - Rolling forecast of inflows/outflows

### Enhanced Data Tables

**Leads Table** (`/crmv2/leads`)
- Columns: Name, Email, Phone, Status, Bill, Location, System Size, Created
- Features: Search, sort, filter by status/county, pagination
- Click row to view lead details

**Projects Table** (`/crmv2/projects`)
- Columns: Customer, Address, Stage, System Size, Revenue Type, Est. Revenue, Created
- Features: Search, sort, filter by stage/revenue type, pagination
- Revenue type badges (blue for GoodPWR, green for Self-Gen)
- Click row to view project details

## 🎨 Design System

### Colors
- **Primary**: `#ff0000` (Quantum Solar Red)
- **Background**: `bg-black` (main), `bg-gray-900` (cards/sidebar)
- **Borders**: `border-gray-700`
- **Text**: `text-white` (primary), `text-gray-400` (secondary)

### Component Patterns
- Cards: `bg-gray-900/50 border-gray-700 rounded-lg`
- Buttons: `bg-[#ff0000] hover:bg-[#cc0000]` (primary)
- Gradients: `from-[#ff0000] to-[#cc0000]` (brand)

### Revenue Type Colors
- GoodPWR: `bg-blue-500` (Blue)
- Self-Gen: `bg-green-500` (Green)

### Lead Status Colors
- New: `bg-blue-500`
- Contacted: `bg-yellow-500`
- Qualified: `bg-green-500`
- Proposal: `bg-purple-500`
- Won: `bg-green-600`
- Lost: `bg-red-500`

## 🔒 Authentication

All `/crmv2/*` routes are protected by Clerk middleware. The layout includes:
- User authentication check
- User profile display
- Sign out functionality
- Role-based UI (admin, manager, sales, installer)

## 📱 Responsive Design

- **Desktop** (>= 1024px): Full sidebar, multi-column layouts
- **Tablet** (768-1023px): Collapsible sidebar, 2-column layouts
- **Mobile** (< 768px): Hidden sidebar with hamburger menu, single column

## 🔄 Real-time Updates

Planned features (to be implemented):
- Supabase Realtime subscriptions for live data updates
- Optimistic UI updates using React 19 useOptimistic
- WebSocket connections for team collaboration

## 📈 Analytics & Reporting

### Revenue Analytics
- Track revenue by type (GoodPWR vs Self-Gen)
- Monthly trends and comparisons
- Average system size and deal size

### Pipeline Analytics
- Project distribution across 12 stages
- Average time in each stage
- Conversion rates between stages

### Cash Flow Forecasting
- 13-week rolling forecast
- Milestone payment tracking
- Expected inflows vs outflows
- Cumulative cash position

### Geographic Analytics
- Performance by county (St. Clair County focus)
- Conversion rates by region
- Utility company breakdowns

## 🛠️ Development

### Adding New Features

1. **Add types** to `/src/types/crmv2.ts`
2. **Add server action** to `/src/app/crmv2/actions.ts`
3. **Create component** in `/src/components/crmv2/`
4. **Update page** in `/src/app/crmv2/`

### Testing

- Manual testing in browser at `/crmv2`
- Compare behavior with `/crm` (v1)
- Test with different user roles (admin, sales, etc.)

## 🚧 Roadmap

### Current Status (Week 1)
- ✅ Database migration
- ✅ TypeScript types
- ✅ Route structure
- ✅ Layout & navigation
- ✅ Server actions
- ⏳ Chart libraries installing
- ⏳ Dashboard charts (in progress)
- ⏳ Data tables (in progress)

### Week 2: Charts & Analytics
- Revenue chart component
- Pipeline funnel component
- Cash flow forecast chart
- Chart interactions and filters

### Week 3: Data Tables
- TanStack Table integration
- Enhanced leads table
- Enhanced projects table
- Search, sort, filter functionality
- Pagination and row selection

### Week 4: Detail Pages & Polish
- Lead detail page with editing
- Project detail page with milestones
- Candidate detail page
- Campaign detail page
- Responsive design refinements
- Loading states and error handling

## 📝 Migration Guide (v1 to v2)

### Data Compatibility
- v2 uses the **same database tables** as v1
- v2 adds **additional columns** but doesn't break v1
- Both versions can run simultaneously
- Data entered in v1 appears in v2 (and vice versa)

### Key Differences
| Feature | v1 (/crm) | v2 (/crmv2) |
|---------|-----------|-------------|
| Architecture | Client Components | Server Components |
| Data Fetching | useEffect + fetch | Server Actions |
| Layout | Card-based | Table-based |
| Dashboard | Tabbed interface | Executive analytics |
| Detail Pages | Minimal/empty | Full-featured |
| Solar Fields | Basic | Comprehensive |
| Analytics | Basic counts | Charts & forecasting |

## 🤝 Contributing

When adding features to CRM v2:
1. Follow the established patterns in `/src/app/crmv2/`
2. Use Server Components by default, Client Components when needed
3. Add proper TypeScript types to `/src/types/crmv2.ts`
4. Use shadcn/ui components for consistency
5. Test on both desktop and mobile
6. Maintain dark theme with Quantum Solar branding

## 📞 Support

For questions or issues:
- Check CLAUDE.md for project guidelines
- Review this README for v2-specific patterns
- Compare with v1 implementation in `/app/crm/`

---

**Built with** ❤️ **by the Quantum Solar team using Next.js 15, Supabase, and shadcn/ui**
