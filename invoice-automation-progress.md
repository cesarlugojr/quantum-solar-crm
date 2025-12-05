# Invoice Automation System - Implementation Progress

## Overview
Building an automated invoice generation system for Quantum Solar CRM with GoodPWR integration and QuickBooks sync.

## Branch: `feature/invoice-automation`

---

## Completed Tasks

### 1. Database Schema ✅
**File:** `supabase/migrations/20251205000001_create_invoice_system.sql`

Created tables:
- `clients` - Billing entities (GoodPWR, LLC seeded)
- `rate_sheets` - Client-specific pricing with all GoodPWR adders
- `invoices` - Main invoice records with QuickBooks fields
- `invoice_line_items` - Individual line items
- `invoice_payments` - Payment tracking
- `quickbooks_sync_log` - Sync audit trail

Features:
- Auto-incrementing invoice numbers (starting at 1266)
- Trigger-based total calculation
- GoodPWR rate sheet with all adders pre-configured

### 2. TypeScript Types ✅
**File:** `src/types/crm.ts`

Added types:
- `InvoiceStatus` - draft, sent, viewed, partial, paid, overdue, void
- `InvoiceMilestone` - M1, M2, FULL
- `Client`, `RateSheet`, `Invoice`, `InvoiceLineItem`, `InvoicePayment`
- `RateSheetAdders` - All 30+ GoodPWR adder configurations
- Helper functions: `calculateLaborAmount()`, `calculateAdderAmount()`

### 3. Invoice API Endpoints ✅
**File:** `src/app/api/crm/invoices/route.ts`

Endpoints:
- `GET /api/crm/invoices` - List invoices with filters
- `GET /api/crm/invoices?id=xxx` - Get single invoice with line items
- `POST /api/crm/invoices` - Create new invoice
- `PATCH /api/crm/invoices` - Update invoice (mark_sent, mark_paid, void)
- `DELETE /api/crm/invoices` - Delete draft invoices

### 4. Clients API ✅
**File:** `src/app/api/crm/clients/route.ts`

Endpoints:
- `GET /api/crm/clients` - List active clients
- `GET /api/crm/clients?id=xxx&include_rate_sheets=true` - Get client with rate sheets
- `POST /api/crm/clients` - Create new client

### 5. Invoice List Page ✅
**File:** `src/app/crm/invoices/page.tsx`

Features:
- [x] Stats cards (Total, Draft, Paid, Outstanding)
- [x] Search by invoice number, GPIN, customer
- [x] Status filter dropdown
- [x] Table with status badges and colors
- [x] Action dropdown (View, Download PDF, Mark Sent, Record Payment, Void, Delete)

### 6. Invoice Creation Page ✅
**File:** `src/app/crm/invoices/new/page.tsx`

Features:
- [x] Client selector (auto-selects GoodPWR)
- [x] Project/GPIN input
- [x] System size input (kW with auto-convert to watts)
- [x] Invoice date, terms, payment method
- [x] Base rate option selector (Option A/B)
- [x] Milestone selector (M1/M2/FULL)
- [x] Bonus toggles (Early Schedule, Inspection)
- [x] Adder buttons with auto-pricing from rate sheet
- [x] Dynamic line item quantities
- [x] Live invoice preview with calculated totals
- [x] Notes field
- [x] Form submission creates invoice
- [x] URL params support for pre-filling from project
- [x] **Design/Planset PDF upload with AI extraction**

### 7. Navigation Link ✅
**File:** `src/app/crm/layout.tsx`

- [x] Added "Invoices" link with FileText icon to sidebar navigation

### 8. Invoice Detail Page ✅
**File:** `src/app/crm/invoices/[id]/page.tsx`

Features:
- [x] Display full invoice details
- [x] Show line items table with totals
- [x] Client billing info section
- [x] Dates section (invoice date, due date, sent/paid dates)
- [x] Payment terms section
- [x] Activity timeline
- [x] Action buttons (Mark as Sent, Record Payment, Void)
- [x] Payment dialog with amount input

### 9. Project Invoices Section ✅
**File:** `src/components/crm/ProjectInvoicesSection.tsx`

Features:
- [x] Client component for project details page
- [x] Shows invoices related to project
- [x] Summary stats (Invoiced, Paid, Outstanding)
- [x] Create invoice button with pre-filled project data
- [x] List of invoices with status badges and view links

### 10. Project Details Integration ✅
**File:** `src/app/crm/projects/[id]/page.tsx`

- [x] Added ProjectInvoicesSection to project detail page
- [x] Passes project data for pre-filling invoices

### 11. Design/Planset PDF Upload ✅
**Files:**
- `src/components/crm/DesignUploader.tsx` - Reusable upload component
- `src/app/api/crm/design-analyzer/route.ts` - PDF analysis API endpoint

Features:
- [x] Drag-and-drop PDF upload
- [x] Compact and full modes
- [x] File validation (PDF only, max 20MB)
- [x] Loading/success/error states
- [x] Extracted data display
- [x] Detected adders badges

### 12. Project Creation Page ✅
**File:** `src/app/crm/projects/new/page.tsx`

Features:
- [x] Full project creation form
- [x] **Design/Planset PDF upload with AI extraction**
- [x] Customer, address, system details sections
- [x] Project adders (MPU, Battery, Trench) toggles
- [x] Revenue & financials configuration
- [x] Pipeline status selection
- [x] Permitting & compliance fields
- [x] Assignment & dates
- [x] Auto-calculation of estimated revenue

### 13. Project Edit Dialog Integration ✅
**File:** `src/components/crm/EditProjectDialog.tsx`

- [x] Added DesignUploader component
- [x] Auto-populate form fields from extracted PDF data
- [x] Supports customer, address, system size, panel count, adders

---

## In Progress Tasks

### 14. Database Migration 🔄
- [ ] Run migration via Supabase Dashboard SQL Editor (CLI has issues with existing triggers)

**Issue:** Earlier migrations have trigger creation statements that fail if triggers already exist.
**Solution:** Run the invoice migration SQL directly via Supabase Dashboard:
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20251205000001_create_invoice_system.sql`
3. Execute the SQL

### 15. PDF Generation ✅
**Files:**
- `src/components/crm/InvoicePDFTemplate.tsx` - PDF template component
- `src/app/api/crm/invoices/[id]/pdf/route.ts` - PDF generation endpoint

Features:
- [x] PDF template with Quantum Solar branding
- [x] Company info and invoice header
- [x] Bill To / Project Details sections
- [x] Line items table with quantities and rates
- [x] Totals section (subtotal, discounts, tax, total, paid, balance)
- [x] Payment information section
- [x] Notes section
- [x] Download endpoint: `GET /api/crm/invoices/[id]/pdf`
- [x] Download and Print buttons on invoice detail page

### 16. QuickBooks OAuth Integration ✅
**Files:**
- `src/lib/quickbooks.ts` - QuickBooks API utility library
- `src/app/api/quickbooks/authorize/route.ts` - OAuth authorization endpoint
- `src/app/api/quickbooks/callback/route.ts` - OAuth callback handler
- `src/app/api/quickbooks/status/route.ts` - Connection status endpoint
- `src/app/api/quickbooks/disconnect/route.ts` - Disconnect endpoint
- `src/app/crm/settings/page.tsx` - Settings page with QBO integration
- `supabase/migrations/20251205000002_create_quickbooks_tokens.sql` - Token storage

Features:
- [x] OAuth authorization flow
- [x] Token exchange and storage
- [x] Automatic token refresh
- [x] Connection status checking
- [x] Disconnect functionality
- [x] Settings page UI for QuickBooks management

**API Credentials (already in .env.local):**
```
QUICKBOOKS_CLIENT_ID=ABeRTMIZTwDh295WD9GdDWOnVmx9OnIKMaBp2fLXlpFXGDRsUf
QUICKBOOKS_CLIENT_SECRET=ljLQMqTPjpVvB4PK30AlHBD3GMPetcemQAPFnq9k
```

### 17. QuickBooks Invoice Sync ✅
**Files:**
- `src/lib/quickbooks.ts` - Enhanced with customer management and sync logging
- `src/app/api/crm/invoices/[id]/sync-qbo/route.ts` - Invoice sync endpoint
- `src/app/crm/invoices/[id]/page.tsx` - Updated with sync button and status

Features:
- [x] Create invoice in QBO from CRM invoice
- [x] Find or create customer in QBO
- [x] Handle errors and retries
- [x] Add "Sync to QuickBooks" button on invoice detail page
- [x] QuickBooks sync status section in sidebar
- [x] Sync logging to database

---

## Pending Tasks

### 18. Payment Sync (Future Enhancement)
- [ ] Sync payment status bidirectionally
- [ ] Webhook for QBO payment updates

---

## GoodPWR Pricing Summary

### Base Rates
| Option | Rate | Includes |
|--------|------|----------|
| Option A | $0.53/W | Installation + Site Survey |
| Option B | $0.50/W | Installation only |

### Milestone Split
| Milestone | Percentage | Trigger |
|-----------|------------|---------|
| M1 | 65% | Install Complete, Photos Verified |
| M2 | 35% | AHJ Passed Final Inspection |

### Bonuses
| Bonus | Rate | Condition |
|-------|------|-----------|
| Scheduled Early | $0.05/W | Installed within 7 days of approval |
| Inspection | $0.02/W | Passes inspection within 5 days |

### Key Adders
| Adder | Rate | Unit |
|-------|------|------|
| Ground Mount >8kW | $0.25 | per watt |
| Ground Mount <8kW | $3,500 | flat |
| Trench (Softscape) | $20 | per foot |
| Trench (Concrete) | $60 | per foot |
| MPU (Base) | $2,500 | flat |
| MPU (Stucco/NorCal) | $3,000 | flat |
| Whole Home Battery | $2,500 first, $1,500 each add'l | flat |

---

## Sample Invoice Calculation

**Project:** Alicia Coartney (from Invoice 1265)
- System Size: 23.09 kW = 23,090 W
- Base Rate: $0.53/W (Option A)

**Line Items:**
1. Labor Only Install (M1): 23,090W × $0.53 × 65% = **$7,954.51**
2. Scheduled Early Bonus: 23,090W × $0.05 = **$1,154.50**
3. Labor Only Install (M2): 23,090W × $0.53 × 35% = **$4,283.20**
4. Inspection Bonus: 23,090W × $0.02 = **$461.80**
5. Ground Mount: 23,090W × $0.25 = **$5,772.50**
6. Trench: 188 ft × $20 = **$3,760.00**

**Total: $23,386.51**

---

## Files Changed

```
supabase/migrations/
├── 20251205000001_create_invoice_system.sql  [NEW] ✅
└── 20251205000002_create_quickbooks_tokens.sql  [NEW] ✅

src/types/
└── crm.ts  [MODIFIED - added invoice types] ✅

src/lib/
└── quickbooks.ts  [NEW - QBO API integration] ✅

src/app/api/crm/
├── invoices/
│   ├── route.ts  [NEW] ✅
│   └── [id]/
│       ├── pdf/route.ts  [NEW] ✅
│       └── sync-qbo/route.ts  [NEW] ✅
├── clients/
│   └── route.ts  [NEW] ✅
└── design-analyzer/
    └── route.ts  [NEW] ✅

src/app/api/quickbooks/
├── authorize/route.ts  [NEW] ✅
├── callback/route.ts  [NEW] ✅
├── status/route.ts  [NEW] ✅
└── disconnect/route.ts  [NEW] ✅

src/app/crm/
├── invoices/
│   ├── page.tsx  [NEW] ✅
│   ├── new/
│   │   └── page.tsx  [NEW - with design upload] ✅
│   └── [id]/
│       └── page.tsx  [NEW - with QBO sync] ✅
├── settings/
│   └── page.tsx  [MODIFIED - added QBO connection UI] ✅
├── projects/
│   ├── new/
│   │   └── page.tsx  [NEW - with design upload] ✅
│   └── [id]/
│       └── page.tsx  [MODIFIED - added invoices section] ✅
└── layout.tsx  [MODIFIED - added nav link] ✅

src/components/crm/
├── ProjectInvoicesSection.tsx  [NEW] ✅
├── DesignUploader.tsx  [NEW] ✅
├── InvoicePDFTemplate.tsx  [NEW] ✅
└── EditProjectDialog.tsx  [MODIFIED - added design upload] ✅

src/app/crm/
└── actions.ts  [MODIFIED - added createProject function] ✅

package.json
└── Added @react-pdf/renderer for PDF generation ✅
```

---

## Next Steps

1. ~~Create invoice list page (`/crm/invoices`)~~ ✅
2. ~~Create invoice creation page (`/crm/invoices/new`)~~ ✅
3. ~~Add sidebar navigation link~~ ✅
4. ~~Create invoice detail page (`/crm/invoices/[id]`)~~ ✅
5. ~~Add invoice section to project details page~~ ✅
6. ~~Add design/planset PDF upload feature~~ ✅
7. ~~Create project creation page with design upload~~ ✅
8. ~~Implement PDF generation~~ ✅
9. Run database migration (via Supabase Dashboard SQL Editor)
10. Test full flow with GoodPWR sample data
11. ~~Add QuickBooks OAuth integration~~ ✅
12. ~~Add invoice sync to QuickBooks~~ ✅
13. Deploy to Vercel and test OAuth flow in production
