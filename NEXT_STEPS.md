# Next Steps - CRM v2 Implementation

## ⏳ Currently Running Processes

### 1. Database Migration
- **Status:** Pushing to Supabase
- **Migrations:**
  - `000_create_base_tables.sql` - Creates core tables
  - `001_add_solar_fields_v2.sql` - Adds solar-specific fields
- **What it does:**
  - Creates `leads`, `projects`, `candidates`, `email_campaigns` tables
  - Adds solar fields: `system_size_kw`, `revenue_type`, `milestone_payments`
  - Creates analytics views: `mv_revenue_analytics`, `mv_pipeline_analytics`
  - Adds cash flow forecast function

### 2. Node Modules Reinstall
- **Status:** Reinstalling packages
- **Reason:** Fixed corrupted package from previous install
- **Packages:** All dependencies including `@tremor/react`, `recharts`, `@tanstack/react-table`

---

## ✅ Once Complete, Do This:

### Step 1: Start the Dev Server
```bash
npm run dev
```

### Step 2: Navigate to CRM v2
Open your browser and go to:
```
http://localhost:3000/crmv2
```

### Step 3: Sign In
- Use your existing Clerk authentication
- Same credentials as `/crm`

### Step 4: Verify Dashboard Works
You should see:
- **KPI Cards**: Total Leads, Active Projects, Conversion Rate, Monthly Revenue
- **Real Metrics**: Numbers pulled from your database (or zeros if no data yet)
- **Modern UI**: Dark theme with Quantum Solar red accents
- **Sidebar Navigation**: Links to Leads, Projects, Candidates, Campaigns

### Step 5: Compare with v1
Toggle between:
- **v1**: `/crm` (existing CRM)
- **v2**: `/crmv2` (new modern CRM)

Notice the differences in:
- Loading speed (Server Components are faster)
- UI design (modern vs card-based)
- Dashboard (executive analytics vs tabs)

---

## 🔍 Verifying the Migration

### Check Database Tables
Run this in Supabase SQL Editor:
```sql
-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should see: leads, projects, candidates, email_campaigns, etc.
```

### Check New Columns
```sql
-- Check leads table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'leads'
ORDER BY column_name;

-- Should include: system_size_kw, utility_company, credit_score, etc.
```

### Test Cash Flow Function
```sql
-- Test the cash flow forecast function
SELECT * FROM calculate_cash_flow_forecast(CURRENT_DATE, 4);

-- Should return 4 weeks of forecast data
```

---

## 📊 Adding Test Data (Optional)

If you want to see the dashboard with real data, add some test records:

```sql
-- Add test leads
INSERT INTO leads (first_name, last_name, email, phone, status, system_size_kw, utility_company, average_monthly_bill)
VALUES
  ('John', 'Doe', 'john@example.com', '555-0100', 'new', 8.5, 'Ameren', 150.00),
  ('Jane', 'Smith', 'jane@example.com', '555-0101', 'contacted', 10.0, 'ComEd', 200.00),
  ('Mike', 'Johnson', 'mike@example.com', '555-0102', 'qualified', 12.0, 'Ameren', 250.00);

-- Add test projects
INSERT INTO projects (customer_name, address, current_stage, system_size_kw, revenue_type, estimated_revenue)
VALUES
  ('John Doe', '123 Main St, Springfield, IL', 5, 8.5, 'self_gen', 12495.00),
  ('Jane Smith', '456 Oak Ave, Chicago, IL', 8, 10.0, 'goodpwr', 6000.00);
```

---

## 🎯 What Works Now:

### ✅ Fully Functional
- `/crmv2` route with authentication
- Executive dashboard with KPI metrics
- Modern sidebar navigation
- Loading skeletons
- Server-side data fetching
- Dark theme UI

### ⏳ Placeholder (To Be Built)
- Chart components (revenue, pipeline, cash flow)
- Data tables for leads/projects
- Detail pages with editing
- Search and filtering

---

## 🚧 Development Roadmap

### Week 2: Charts & Analytics (Next)
- [ ] Revenue chart (Tremor BarChart)
- [ ] Pipeline funnel (Recharts Funnel)
- [ ] Cash flow forecast chart (Recharts LineChart)
- [ ] Chart interactions and filtering

### Week 3: Data Tables
- [ ] TanStack Table integration
- [ ] Enhanced leads table with solar fields
- [ ] Enhanced projects table with revenue tracking
- [ ] Search, sort, filter functionality
- [ ] Pagination and row selection
- [ ] Export to CSV

### Week 4: Detail Pages & Forms
- [ ] Lead detail page with inline editing
- [ ] Project detail page with milestone tracker
- [ ] Form validation with Zod
- [ ] Server Actions for mutations
- [ ] Photo upload for projects
- [ ] Document attachments

### Week 5: Polish & Launch
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Mobile optimizations
- [ ] Performance optimization
- [ ] User testing
- [ ] Production deployment

---

## 📝 Files Reference

### Key Files You'll Work With:

**Dashboard:**
- `/src/app/crmv2/page.tsx` - Main dashboard page
- `/src/app/crmv2/actions.ts` - Server actions for data
- `/src/components/crmv2/executive-dashboard/MetricsCards.tsx` - KPI cards

**Layout:**
- `/src/app/crmv2/layout.tsx` - Sidebar and navigation
- `/src/components/crmv2/LoadingSkeletons.tsx` - Loading states

**Types:**
- `/src/types/crmv2.ts` - All TypeScript definitions

**Database:**
- `/supabase/migrations/000_create_base_tables.sql` - Base tables
- `/supabase/migrations/001_add_solar_fields_v2.sql` - Solar extensions

**Documentation:**
- `/CRMv2_README.md` - Comprehensive guide
- `/QUICKSTART_CRMv2.md` - Quick start instructions
- `/test-migration.sql` - Migration verification queries

---

## 🐛 Troubleshooting

### Dev Server Won't Start
```bash
# Clean and reinstall (already done)
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Migration Errors
- Tables already exist: Use Supabase SQL Editor instead
- Column conflicts: Comment out duplicate ALTER TABLE statements
- Function errors: Drop and recreate functions manually

### Dashboard Shows Zeros
- Need data in database: Add test records (see above)
- Supabase connection: Check `.env` variables
- Clerk auth: Make sure you're signed in

### TypeScript Errors
```bash
# Run type check
npx tsc --noEmit

# Check for errors
npm run lint
```

---

## 🎉 Success Indicators

You'll know everything works when:
- ✅ `npm run dev` starts without errors
- ✅ `/crmv2` loads in browser
- ✅ Dashboard shows metrics (numbers, not dashes)
- ✅ Sidebar navigation works
- ✅ Can toggle between `/crm` and `/crmv2`
- ✅ Loading skeletons appear briefly
- ✅ No console errors
- ✅ Mobile menu works

---

## 💡 Tips

1. **Keep v1 Running:** Don't delete `/crm` - use both for comparison
2. **Test Responsively:** Check mobile, tablet, and desktop views
3. **Watch the Console:** Browser console shows helpful debug info
4. **Use Supabase UI:** The dashboard is great for viewing data
5. **Commit Often:** Git commit after each working feature

---

## 🆘 Need Help?

- **CRM v2 Guide:** `CRMv2_README.md`
- **Quick Start:** `QUICKSTART_CRMv2.md`
- **Project Guidelines:** `CLAUDE.md`
- **Test Migration:** `test-migration.sql`

---

**Ready to test!** Once both processes complete, run `npm run dev` and navigate to `/crmv2`! 🚀
