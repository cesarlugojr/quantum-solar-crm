-- Migration: Create Installation Equipment Table
-- Purpose: Track equipment used in solar installations
-- Date: 2025-01-19

-- Create installation_equipment table
CREATE TABLE IF NOT EXISTS installation_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custom_id TEXT DEFAULT generate_installation_id(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Equipment classification
    equipment_type TEXT NOT NULL CHECK (equipment_type IN (
        'solar_panel', 'inverter', 'battery', 'mounting_system', 
        'monitoring', 'electrical', 'safety', 'conduit', 'disconnect'
    )),
    equipment_category TEXT CHECK (equipment_category IN (
        'primary', 'secondary', 'accessory', 'safety', 'monitoring'
    )),
    
    -- Equipment details
    manufacturer TEXT NOT NULL,
    model TEXT NOT NULL,
    serial_number TEXT,
    part_number TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    
    -- Technical specifications
    wattage DECIMAL(8,2),
    voltage DECIMAL(8,2),
    amperage DECIMAL(8,2),
    efficiency_rating DECIMAL(5,3),
    temperature_coefficient DECIMAL(6,4),
    
    -- Warranty and compliance
    warranty_years INTEGER,
    warranty_start_date DATE,
    warranty_end_date DATE,
    certification_standards TEXT[], -- Array for multiple certifications
    
    -- Installation details
    installed_date TIMESTAMP WITH TIME ZONE,
    installer_id UUID, -- Will reference profiles table when created
    installation_location TEXT,
    installation_notes TEXT,
    
    -- Status and condition
    status TEXT DEFAULT 'ordered' CHECK (status IN (
        'ordered', 'received', 'inspected', 'installed', 
        'commissioned', 'failed', 'replaced', 'removed'
    )),
    condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 5),
    condition_notes TEXT,
    
    -- Cost tracking
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    supplier TEXT,
    purchase_order_number TEXT,
    invoice_number TEXT,
    
    -- Performance data
    performance_data JSONB,
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_by UUID,
    updated_by UUID
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_installation_equipment_updated_at 
    BEFORE UPDATE ON installation_equipment 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_installation_equipment_project_id ON installation_equipment(project_id);
CREATE INDEX IF NOT EXISTS idx_installation_equipment_type ON installation_equipment(equipment_type);
CREATE INDEX IF NOT EXISTS idx_installation_equipment_manufacturer ON installation_equipment(manufacturer);
CREATE INDEX IF NOT EXISTS idx_installation_equipment_status ON installation_equipment(status);
CREATE INDEX IF NOT EXISTS idx_installation_equipment_installed_date ON installation_equipment(installed_date);

-- Add comments for documentation
COMMENT ON TABLE installation_equipment IS 'Equipment inventory and tracking for solar installations';
COMMENT ON COLUMN installation_equipment.custom_id IS 'Human-readable ID format: QSIID000001';
COMMENT ON COLUMN installation_equipment.equipment_type IS 'Primary equipment classification';
COMMENT ON COLUMN installation_equipment.certification_standards IS 'Array of certification standards (UL, IEC, etc.)';
COMMENT ON COLUMN installation_equipment.performance_data IS 'JSON data for equipment performance metrics';
COMMENT ON COLUMN installation_equipment.condition_rating IS 'Equipment condition: 1=Poor, 5=Excellent';