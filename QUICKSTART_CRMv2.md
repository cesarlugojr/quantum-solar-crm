# 🚀 CRM v2 Quick Start Guide

Get your new CRM v2 up and running in 5 minutes!

## Step 1: Run the Database Migration ⚡

### Using Supabase SQL Editor (Recommended)

1. **Copy the migration SQL:**
   ```bash
   cat supabase/migrations/001_add_solar_fields_v2.sql
   ```

2. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your Quantum Solar CRM project
   - Click **"SQL Editor"** in the left sidebar

3. **Run the migration:**
   - Click **"New Query"**
   - Paste the entire migration SQL
   - Click **"Run"** (or Cmd/Ctrl + Enter)
   - Wait for "Success" message

4. **Verify it worked:**
   - Open a new query
   - Copy contents of `test-migration.sql`
   - Paste and run
   - You should see column names, view names, and function names returned

---

## Step 2: Test CRM v2 🎨

1. **Make sure your dev server is running:**
   ```bash
   npm run dev
   ```

2. **Navigate to CRM v2:**
   - Open your browser
   - Go to: `http://localhost:3000/crmv2`
   - You should see the new executive dashboard!

3. **Sign in with Clerk:**
   - Same authentication as `/crm`
   - Your existing account works

---

## Step 3: Explore the Features 🔍

### Executive Dashboard (`/crmv2`)
- **KPI Cards:** Total Leads, Active Projects, Conversion Rate, Monthly Revenue
- **Real-time Metrics:** Pulled directly from your database
- **Modern UI:** Dark theme with Quantum Solar red branding

### Navigation
- **Sidebar:** Click any item to navigate
- **Mobile:** Tap hamburger menu (☰) to open sidebar
- **Toggle:** Click "Switch to v1" in footer to compare

### Available Routes
- `/crmv2` - Dashboard
- `/crmv2/leads` - Leads table (placeholder)
- `/crmv2/projects` - Projects table (placeholder)
- `/crmv2/candidates` - Candidates table (placeholder)
- `/crmv2/campaigns` - Campaigns table (placeholder)
- `/crmv2/settings` - Settings (placeholder)

---

## Step 4: Compare with v1 📊

### Side-by-Side Testing

1. **Open v1 CRM:** Navigate to `/crm`
2. **Open v2 CRM:** Navigate to `/crmv2` (in new tab)
3. **Compare:**
   - UI design (cards vs modern layout)
   - Loading speed (client-side vs server components)
   - Dashboard features (tabs vs executive dashboard)

### Key Differences

| Feature | v1 (/crm) | v2 (/crmv2) |
|---------|-----------|-------------|
| **Architecture** | Client Components | Server Components |
| **Data Fetching** | useEffect + fetch | Server Actions |
| **Layout** | Tabbed dashboard | Executive dashboard with KPIs |
| **Performance** | Heavy JS bundle | Lighter, progressive loading |
| **Loading States** | Simple spinners | Skeleton screens |
| **Solar Fields** | Basic tracking | Revenue types, milestones, forecasting |

---

## Step 5: Understanding the New Features 💡

### Solar-Specific Tracking

**Revenue Types:**
- **GoodPWR:** $0.60/W commission model
- **Self-Gen:** $1.47/W full installation

**Milestone Payments:**
- 5-stage payment tracking
- Contract → Permits → Installation → Inspection → PTO
- JSONB format in database for flexibility

**Cash Flow Forecasting:**
- 13-week rolling forecast
- Tracks expected inflows/outflows
- Prevents cash flow surprises

**Geographic Analytics:**
- County-level performance tracking
- Optimize for high-conversion areas (e.g., St. Clair County)
- Utility company breakdowns

---

## Troubleshooting 🔧

### Migration Issues

**Problem:** "Column already exists" error
- **Solution:** Some columns may already exist. Comment out duplicate ALTER TABLE statements.

**Problem:** "Function already exists" error
- **Solution:** Run `DROP FUNCTION calculate_cash_flow_forecast CASCADE;` first, then re-run.

**Problem:** Materialized views won't refresh
- **Solution:** Run `REFRESH MATERIALIZED VIEW mv_revenue_analytics;` manually in SQL Editor.

### CRM v2 Issues

**Problem:** `/crmv2` shows "Not authenticated"
- **Solution:** Make sure you're signed in via Clerk. Try signing out and back in.

**Problem:** Metrics show all zeros
- **Solution:** You need existing leads/projects in the database. The dashboard pulls real data.

**Problem:** Charts show "Loading..."
- **Solution:** Chart components are placeholders for now. Week 2 will add Tremor/Recharts charts.

**Problem:** Sidebar doesn't close on mobile
- **Solution:** Click the X button or tap outside the sidebar overlay.

---

## Next Steps 📅

### Week 2: Add Charts (Coming Soon)
- Revenue chart (Tremor BarChart)
- Pipeline funnel (Recharts Funnel)
- Cash flow forecast (Recharts LineChart)

### Week 3: Data Tables (Coming Soon)
- Enhanced leads table with TanStack Table
- Projects table with solar-specific columns
- Search, sort, filter functionality
- Pagination and bulk actions

### Week 4: Detail Pages (Coming Soon)
- Lead editing with Server Actions
- Project milestone tracking
- Form validation with Zod
- Photo gallery for projects

---

## Need Help? 🆘

1. **Check the docs:**
   - `CRMv2_README.md` - Comprehensive documentation
   - `CLAUDE.md` - Project guidelines
   - `test-migration.sql` - Migration verification queries

2. **Common files:**
   - Migration: `/supabase/migrations/001_add_solar_fields_v2.sql`
   - Types: `/src/types/crmv2.ts`
   - Actions: `/src/app/crmv2/actions.ts`
   - Layout: `/src/app/crmv2/layout.tsx`

3. **Development commands:**
   ```bash
   npm run dev        # Start dev server
   npm run build      # Build for production
   npm run lint       # Check code quality
   ```

---

## Success Checklist ✅

- [ ] Database migration ran successfully
- [ ] Test queries return expected results
- [ ] `/crmv2` loads in browser
- [ ] Dashboard shows real metrics (not zeros/dashes)
- [ ] Sidebar navigation works
- [ ] Mobile menu works
- [ ] Can toggle between v1 and v2
- [ ] Authentication works (same as v1)
- [ ] Loading skeletons appear during data fetch
- [ ] No console errors in browser

If all boxes are checked, you're ready to go! 🎉

---

## What's Different? 🆕

### Architecture
- **Next.js 15 Server Components** - Renders on server, sends HTML
- **Server Actions** - Type-safe mutations without API routes
- **Suspense** - Progressive page loading with streaming
- **Modern TypeScript** - Full type safety throughout

### User Experience
- **Faster initial load** - Less JavaScript sent to browser
- **Smooth loading states** - Skeleton screens instead of spinners
- **Better performance** - Server-side rendering and caching
- **Professional UI** - Modern design patterns from Compass artifact

### Business Features
- **Revenue tracking** - GoodPWR vs Self-Gen models
- **Cash flow forecasting** - 13-week rolling forecast
- **Milestone payments** - Track project payment stages
- **Geographic analytics** - County-level performance
- **System sizing** - Track kW capacity, panel count, inverters

---

**You're all set!** Start exploring `/crmv2` and compare it with `/crm` to see the improvements! 🚀
