-- Migration: Create cash flow projection tables
-- Date: 2025-12-06
-- Description: Tables for storing recurring line items and manual entries for cash flow projections

-- Create cash flow frequency enum
CREATE TYPE cashflow_frequency AS ENUM (
  'daily',
  'weekday_only',
  'weekly',
  'biweekly',
  'monthly',
  'semi_monthly',
  'one_time',
  'manual'
);

-- Create cash flow category enum
CREATE TYPE cashflow_category AS ENUM (
  'income',
  'payroll',
  'operations',
  'vehicles',
  'software',
  'financing',
  'materials',
  'marketing',
  'utilities',
  'rent',
  'other'
);

-- Create cashflow_line_items table for recurring transactions
CREATE TABLE IF NOT EXISTS cashflow_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,  -- Negative = expense, Positive = income
  frequency cashflow_frequency NOT NULL,
  category cashflow_category NOT NULL DEFAULT 'other',
  anchor_day INTEGER CHECK (anchor_day >= 1 AND anchor_day <= 31),  -- Day of month for monthly items
  anchor_date DATE,  -- Reference date for weekly/biweekly
  second_day INTEGER CHECK (second_day >= 1 AND second_day <= 31),  -- For semi-monthly items
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create cashflow_manual_entries table for one-time transactions
CREATE TABLE IF NOT EXISTS cashflow_manual_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category cashflow_category NOT NULL DEFAULT 'other',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create cashflow_settings table for projection settings
CREATE TABLE IF NOT EXISTS cashflow_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default starting balance setting
INSERT INTO cashflow_settings (setting_key, setting_value)
VALUES ('starting_balance', '{"amount": 10867.86, "as_of_date": "2025-10-17"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_cashflow_line_items_active ON cashflow_line_items(active);
CREATE INDEX IF NOT EXISTS idx_cashflow_line_items_category ON cashflow_line_items(category);
CREATE INDEX IF NOT EXISTS idx_cashflow_line_items_frequency ON cashflow_line_items(frequency);
CREATE INDEX IF NOT EXISTS idx_cashflow_manual_entries_date ON cashflow_manual_entries(date);
CREATE INDEX IF NOT EXISTS idx_cashflow_manual_entries_category ON cashflow_manual_entries(category);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to cashflow_line_items
DROP TRIGGER IF EXISTS update_cashflow_line_items_updated_at ON cashflow_line_items;
CREATE TRIGGER update_cashflow_line_items_updated_at
  BEFORE UPDATE ON cashflow_line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger to cashflow_settings
DROP TRIGGER IF EXISTS update_cashflow_settings_updated_at ON cashflow_settings;
CREATE TRIGGER update_cashflow_settings_updated_at
  BEFORE UPDATE ON cashflow_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE cashflow_line_items IS 'Recurring transactions for cash flow projections (expenses and income)';
COMMENT ON TABLE cashflow_manual_entries IS 'One-time manual entries for cash flow projections';
COMMENT ON TABLE cashflow_settings IS 'Settings for cash flow projection (starting balance, defaults, etc.)';

COMMENT ON COLUMN cashflow_line_items.amount IS 'Transaction amount. Negative = expense, Positive = income';
COMMENT ON COLUMN cashflow_line_items.anchor_day IS 'Day of month (1-31) for monthly frequency items';
COMMENT ON COLUMN cashflow_line_items.anchor_date IS 'Reference date for weekly/biweekly frequency calculations';
COMMENT ON COLUMN cashflow_line_items.second_day IS 'Second day of month for semi-monthly frequency items';

-- Migration complete
