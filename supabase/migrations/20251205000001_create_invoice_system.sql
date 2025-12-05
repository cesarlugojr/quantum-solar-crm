-- Invoice Automation System Migration
-- Creates tables for invoice generation, client management, and rate sheets
-- Supports GoodPWR billing with configurable rates and QuickBooks integration

-- ============================================
-- CLIENTS TABLE
-- ============================================
-- Stores billing clients (e.g., GoodPWR, LLC)

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Billing address
  billing_street VARCHAR(255),
  billing_city VARCHAR(100),
  billing_state VARCHAR(50),
  billing_zip VARCHAR(20),
  billing_country VARCHAR(100) DEFAULT 'USA',

  -- Shipping address (often same as billing)
  shipping_street VARCHAR(255),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(50),
  shipping_zip VARCHAR(20),
  shipping_country VARCHAR(100) DEFAULT 'USA',

  -- Payment terms
  default_terms VARCHAR(50) DEFAULT 'Net 10',
  default_payment_method VARCHAR(50) DEFAULT 'Bank Transfer',

  -- QuickBooks integration
  quickbooks_customer_id VARCHAR(100),
  quickbooks_sync_enabled BOOLEAN DEFAULT false,

  -- Status
  active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RATE SHEETS TABLE
-- ============================================
-- Stores pricing configurations per client

CREATE TABLE IF NOT EXISTS rate_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Base labor rates (per watt)
  base_rate_option_a DECIMAL(10,4) DEFAULT 0.53,  -- With site survey
  base_rate_option_b DECIMAL(10,4) DEFAULT 0.50,  -- Without site survey

  -- Milestone split percentages
  m1_percentage DECIMAL(5,2) DEFAULT 65.00,  -- Install Complete
  m2_percentage DECIMAL(5,2) DEFAULT 35.00,  -- Inspection Passed

  -- Bonus rates (per watt)
  early_schedule_bonus DECIMAL(10,4) DEFAULT 0.05,  -- Within 7 days
  inspection_bonus DECIMAL(10,4) DEFAULT 0.02,      -- Within 5 days

  -- Adder rates stored as JSONB for flexibility
  adders JSONB DEFAULT '{
    "ground_mount_over_8kw": {"rate": 0.25, "unit": "watt", "description": ">8kW Ground Mount"},
    "ground_mount_under_8kw": {"rate": 3500.00, "unit": "flat", "description": "<8kW Ground Mount"},
    "trench_softscape": {"rate": 20.00, "unit": "foot", "description": "Trench (Softscape)"},
    "trench_concrete": {"rate": 60.00, "unit": "foot", "description": "Trench (Concrete)"},
    "pest_control": {"rate": 0.15, "unit": "watt", "description": "Pest Control/Critter Guard"},
    "metal_roof": {"rate": 0.05, "unit": "watt", "description": "Metal Roof"},
    "flat_roof": {"rate": 0.07, "unit": "watt", "description": "Flat Roof"},
    "tile_roof": {"rate": 0.07, "unit": "watt", "description": "Tile Roof"},
    "steep_pitch": {"rate": 0.07, "unit": "watt", "description": "Roof Pitch >34°"},
    "three_story": {"rate": 500.00, "unit": "flat", "description": "3 Story & <"},
    "home_surge_protector": {"rate": 300.00, "unit": "flat", "description": "Home Surge Protector"},
    "production_meter": {"rate": 250.00, "unit": "flat", "description": "Production Meter"},
    "derate_breaker": {"rate": 400.00, "unit": "flat", "description": "Derate Breaker"},
    "main_breaker_addition": {"rate": 400.00, "unit": "flat", "description": "Main Breaker Addition"},
    "new_subpanel": {"rate": 500.00, "unit": "flat", "description": "New Subpanel"},
    "main_panel_upgrade": {"rate": 2500.00, "unit": "flat", "description": "Main Panel Upgrade"},
    "main_panel_upgrade_stucco": {"rate": 3000.00, "unit": "flat", "description": "Main Panel Upgrade (Stucco)"},
    "main_panel_upgrade_norcal": {"rate": 3000.00, "unit": "flat", "description": "Main Panel Upgrade (NorCal)"},
    "meter_swap": {"rate": 750.00, "unit": "flat", "description": "Meter Swap"},
    "rma_meter_collar": {"rate": 250.00, "unit": "flat", "description": "RMA Meter Collar"},
    "span_smart_panel": {"rate": 2000.00, "unit": "flat", "description": "Span Smart Panel"},
    "ev_charger": {"rate": 650.00, "unit": "flat", "description": "EV Charger"},
    "whole_home_battery_first": {"rate": 2500.00, "unit": "flat", "description": "Whole Home Battery (First)"},
    "whole_home_battery_additional": {"rate": 1500.00, "unit": "flat", "description": "Whole Home Battery (Additional)"},
    "backup_battery_first": {"rate": 1500.00, "unit": "flat", "description": "Backup Battery (First)"},
    "backup_battery_additional": {"rate": 1500.00, "unit": "flat", "description": "Backup Battery (Additional)"},
    "smart_thermostat": {"rate": 200.00, "unit": "flat", "description": "Smart Thermostat"},
    "small_system_under_4kw": {"rate": 650.00, "unit": "flat", "description": "Small System <4kW"},
    "over_4_arrays": {"rate": 400.00, "unit": "flat", "description": ">4 Arrays"},
    "remove_reinstall": {"rate": 200.00, "unit": "module", "description": "Remove & Re-Install"},
    "remove_discard": {"rate": 100.00, "unit": "module", "description": "Remove & Discard"},
    "onsite_cancellation": {"rate": 500.00, "unit": "flat", "description": "Onsite Cancellation"},
    "pre_design_cancellation": {"rate": 250.00, "unit": "flat", "description": "At Survey/Pre-Design Cancellation"},
    "post_design_cancellation": {"rate": 500.00, "unit": "flat", "description": "Post Design Cancellation"}
  }'::jsonb,

  -- Effective dates
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,

  -- Status
  active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVOICES TABLE
-- ============================================
-- Main invoice records

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Invoice identification
  invoice_number INTEGER NOT NULL,

  -- Client reference
  client_id UUID REFERENCES clients(id),

  -- Project reference (optional - for linking to CRM projects)
  project_id UUID REFERENCES projects(id),
  gpin VARCHAR(50),  -- GoodPWR Project ID Number

  -- Project details (denormalized for invoice record)
  project_name VARCHAR(255),
  project_address TEXT,
  system_size_watts INTEGER,

  -- Dates
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,

  -- Payment terms
  terms VARCHAR(50) DEFAULT 'Net 10',
  payment_method VARCHAR(50) DEFAULT 'Bank Transfer',

  -- Milestone
  milestone VARCHAR(10),  -- 'M1', 'M2', 'FULL'

  -- Totals (calculated from line items but stored for quick access)
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,

  -- Payment tracking
  amount_paid DECIMAL(12,2) DEFAULT 0,
  balance_due DECIMAL(12,2) DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'draft',  -- draft, sent, viewed, partial, paid, overdue, void

  -- QuickBooks integration
  quickbooks_invoice_id VARCHAR(100),
  quickbooks_sync_status VARCHAR(50),  -- pending, synced, error
  quickbooks_synced_at TIMESTAMPTZ,
  quickbooks_error TEXT,

  -- Notes
  notes TEXT,
  internal_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,

  -- Created by
  created_by VARCHAR(255)
);

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1266;

-- ============================================
-- INVOICE LINE ITEMS TABLE
-- ============================================
-- Individual line items on invoices

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,

  -- Line item order
  line_number INTEGER NOT NULL,

  -- Item details
  item_type VARCHAR(100) NOT NULL,  -- 'labor_install', 'early_bonus', 'inspection_bonus', 'ground_mount', 'trench', etc.
  description TEXT NOT NULL,

  -- Quantity and pricing
  quantity DECIMAL(12,4) NOT NULL DEFAULT 1,
  unit VARCHAR(50),  -- 'watts', 'feet', 'each', 'modules'
  unit_rate DECIMAL(12,4) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,

  -- Optional: linked to rate sheet adder
  adder_key VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVOICE PAYMENTS TABLE
-- ============================================
-- Track payments against invoices

CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,

  -- Payment details
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),

  -- QuickBooks integration
  quickbooks_payment_id VARCHAR(100),

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- ============================================
-- QUICKBOOKS SYNC LOG TABLE
-- ============================================
-- Track sync operations with QuickBooks

CREATE TABLE IF NOT EXISTS quickbooks_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What was synced
  entity_type VARCHAR(50) NOT NULL,  -- 'invoice', 'client', 'payment'
  entity_id UUID NOT NULL,

  -- Sync details
  operation VARCHAR(50) NOT NULL,  -- 'create', 'update', 'delete'
  status VARCHAR(50) NOT NULL,     -- 'success', 'error'

  -- Request/response data
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_quickbooks_id ON clients(quickbooks_customer_id);

CREATE INDEX IF NOT EXISTS idx_rate_sheets_client ON rate_sheets(client_id);
CREATE INDEX IF NOT EXISTS idx_rate_sheets_active ON rate_sheets(active, effective_from);

CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_gpin ON invoices(gpin);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_quickbooks ON invoices(quickbooks_invoice_id);

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_type ON invoice_line_items(item_type);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(invoice_id);

CREATE INDEX IF NOT EXISTS idx_quickbooks_sync_log_entity ON quickbooks_sync_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_quickbooks_sync_log_status ON quickbooks_sync_log(status);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get next invoice number
CREATE OR REPLACE FUNCTION get_next_invoice_number()
RETURNS INTEGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(invoice_number), 1265) + 1 INTO next_num FROM invoices;
  RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate invoice totals from line items
CREATE OR REPLACE FUNCTION calculate_invoice_totals(p_invoice_id UUID)
RETURNS void AS $$
DECLARE
  v_subtotal DECIMAL(12,2);
  v_total DECIMAL(12,2);
  v_paid DECIMAL(12,2);
BEGIN
  -- Calculate subtotal from line items
  SELECT COALESCE(SUM(amount), 0) INTO v_subtotal
  FROM invoice_line_items
  WHERE invoice_id = p_invoice_id;

  -- Get total paid
  SELECT COALESCE(SUM(amount), 0) INTO v_paid
  FROM invoice_payments
  WHERE invoice_id = p_invoice_id;

  -- Calculate total (subtotal - discount + tax)
  SELECT v_subtotal - COALESCE(discount_amount, 0) + COALESCE(tax_amount, 0)
  INTO v_total
  FROM invoices
  WHERE id = p_invoice_id;

  -- Update invoice
  UPDATE invoices
  SET
    subtotal = v_subtotal,
    total_amount = v_total,
    amount_paid = v_paid,
    balance_due = v_total - v_paid,
    updated_at = NOW()
  WHERE id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate totals when line items change
CREATE OR REPLACE FUNCTION trigger_recalc_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_invoice_totals(OLD.invoice_id);
    RETURN OLD;
  ELSE
    PERFORM calculate_invoice_totals(NEW.invoice_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_invoice_line_items_totals
AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items
FOR EACH ROW EXECUTE FUNCTION trigger_recalc_invoice_totals();

-- Trigger to recalculate totals when payments change
CREATE OR REPLACE FUNCTION trigger_recalc_invoice_totals_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_invoice_totals(OLD.invoice_id);
    RETURN OLD;
  ELSE
    PERFORM calculate_invoice_totals(NEW.invoice_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_invoice_payments_totals
AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
FOR EACH ROW EXECUTE FUNCTION trigger_recalc_invoice_totals_payment();

-- ============================================
-- SEED DATA - GoodPWR Client
-- ============================================

INSERT INTO clients (
  name,
  company_name,
  billing_street,
  billing_city,
  billing_state,
  billing_zip,
  shipping_street,
  shipping_city,
  shipping_state,
  shipping_zip,
  default_terms,
  default_payment_method,
  active
) VALUES (
  'GoodPWR, LLC',
  'GoodPWR, LLC',
  '390 Interlocken Cres Ste 350',
  'Broomfield',
  'CO',
  '80021',
  '390 Interlocken Cres Ste 350',
  'Broomfield',
  'CO',
  '80021',
  'Net 10',
  'Bank Transfer',
  true
) ON CONFLICT DO NOTHING;

-- Insert GoodPWR rate sheet
INSERT INTO rate_sheets (
  client_id,
  name,
  description,
  base_rate_option_a,
  base_rate_option_b,
  m1_percentage,
  m2_percentage,
  early_schedule_bonus,
  inspection_bonus,
  active
)
SELECT
  id,
  'GoodPWR Standard Rates 2024',
  'Standard pricing from GoodPWR Build Partner agreement',
  0.53,
  0.50,
  65.00,
  35.00,
  0.05,
  0.02,
  true
FROM clients
WHERE company_name = 'GoodPWR, LLC'
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quickbooks_sync_log ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (via service role key from API)
CREATE POLICY "Allow all for service role" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON rate_sheets FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON invoice_line_items FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON invoice_payments FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON quickbooks_sync_log FOR ALL USING (true);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE clients IS 'Billing clients for invoice generation (e.g., GoodPWR)';
COMMENT ON TABLE rate_sheets IS 'Client-specific pricing configurations with adder rates';
COMMENT ON TABLE invoices IS 'Invoice records with QuickBooks integration support';
COMMENT ON TABLE invoice_line_items IS 'Individual line items on invoices';
COMMENT ON TABLE invoice_payments IS 'Payment records against invoices';
COMMENT ON TABLE quickbooks_sync_log IS 'Audit log for QuickBooks synchronization operations';
