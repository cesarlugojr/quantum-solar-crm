-- Migration: Add Design Extraction Fields
-- Date: 2025-12-05
-- Description: Adds fields extracted by Claude Vision from solar design/planset PDFs

-- ============================================
-- PROJECTS TABLE EXTENSIONS
-- ============================================

-- Module/Panel details
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS module_wattage INTEGER,
ADD COLUMN IF NOT EXISTS module_model VARCHAR(255),
ADD COLUMN IF NOT EXISTS array_count INTEGER;

-- Roof characteristics
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS roof_type VARCHAR(50);

-- Additional adders
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS has_ground_mount BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trench_length_ft INTEGER,
ADD COLUMN IF NOT EXISTS battery_count INTEGER,
ADD COLUMN IF NOT EXISTS has_ev_charger BOOLEAN DEFAULT false;

-- Roof-specific adders
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS has_steep_pitch BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_flat_roof BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_tile_roof BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_metal_roof BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_three_story BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN projects.module_wattage IS 'Wattage per solar panel (e.g., 400, 450)';
COMMENT ON COLUMN projects.module_model IS 'Solar panel model name/number';
COMMENT ON COLUMN projects.array_count IS 'Number of separate arrays/roof planes';
COMMENT ON COLUMN projects.roof_type IS 'Type of roof: composition, tile, metal, flat, shingle, other';
COMMENT ON COLUMN projects.has_ground_mount IS 'Is this a ground mount installation vs roof mount';
COMMENT ON COLUMN projects.trench_length_ft IS 'Length of trenching required in feet';
COMMENT ON COLUMN projects.battery_count IS 'Number of battery units';
COMMENT ON COLUMN projects.has_ev_charger IS 'Includes EV charger installation';
COMMENT ON COLUMN projects.has_steep_pitch IS 'Roof pitch greater than 7:12';
COMMENT ON COLUMN projects.has_flat_roof IS 'Flat or low-slope roof requiring special mounting';
COMMENT ON COLUMN projects.has_tile_roof IS 'Tile roof requiring special mounting hardware';
COMMENT ON COLUMN projects.has_metal_roof IS 'Metal roof requiring special mounting hardware';
COMMENT ON COLUMN projects.has_three_story IS 'Three-story building requiring special equipment';

-- Create index for adder queries
CREATE INDEX IF NOT EXISTS idx_projects_has_ground_mount ON projects(has_ground_mount);
CREATE INDEX IF NOT EXISTS idx_projects_roof_type ON projects(roof_type);

-- Migration complete
