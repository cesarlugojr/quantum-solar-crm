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

### 7. Navigation Link ✅
**File:** `src/app/crm/layout.tsx`

- [x] Added "Invoices" link with FileText icon to sidebar navigation

---

## In Progress Tasks

### 8. Invoice Detail Page 🔄
**File:** `src/app/crm/invoices/[id]/page.tsx`
- [ ] Display full invoice details
- [ ] Show line items table
- [ ] Action buttons (Edit, Send, Record Payment, Void)
- [ ] Payment history

---

## Pending Tasks

### 9. PDF Generation
- [ ] Create PDF template matching existing invoice format
- [ ] Quantum Solar branding/logo
- [ ] Line item table with quantities and rates
- [ ] Total/payment/balance sections
- [ ] Download endpoint: `GET /api/crm/invoices/[id]/pdf`

### 10. QuickBooks OAuth Integration
- [ ] OAuth flow for QBO connection
- [ ] Token storage and refresh
- [ ] Settings page for QBO configuration

### 11. QuickBooks Sync
- [ ] Create invoice in QBO
- [ ] Sync payment status
- [ ] Handle errors and retries

### 12. Planset AI Extraction (Bonus Feature)
- [ ] PDF upload endpoint
- [ ] AI extraction of:
  - Customer name
  - Address
  - System size (kW)
  - Module count
  - Adders (MPU, ground mount, trench, etc.)
- [ ] Auto-populate invoice form from planset

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
└── 20251205000001_create_invoice_system.sql  [NEW]

src/types/
└── crm.ts  [MODIFIED - added invoice types]

src/app/api/crm/
├── invoices/
│   └── route.ts  [NEW]
└── clients/
    └── route.ts  [NEW]

src/app/crm/
├── invoices/
│   ├── page.tsx  [NEW] ✅
│   ├── new/
│   │   └── page.tsx  [NEW] ✅
│   └── [id]/
│       └── page.tsx  [PENDING]
└── layout.tsx  [MODIFIED - added nav link] ✅
```

---

## Next Steps

1. ~~Create invoice list page (`/crm/invoices`)~~ ✅
2. ~~Create invoice creation page (`/crm/invoices/new`)~~ ✅
3. ~~Add sidebar navigation link~~ ✅
4. Create invoice detail page (`/crm/invoices/[id]`)
5. Test full flow with GoodPWR sample data
6. Implement PDF generation
7. Add QuickBooks integration
