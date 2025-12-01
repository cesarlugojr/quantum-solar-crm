-- Quantum Solar CRM - AHJ (Authority Having Jurisdiction) System
-- This migration creates the AHJ management system for tracking
-- permitting authorities and their requirements

-- ============================================
-- CREATE AHJ TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ahj (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Basic AHJ Information
    name VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    county VARCHAR(100),
    city VARCHAR(100),

    -- Contact Information
    building_department_number VARCHAR(50),
    building_department_phone VARCHAR(20),
    building_department_email VARCHAR(255),
    building_department_website TEXT,

    -- Inspector Information
    inspector_name VARCHAR(255),
    inspector_number VARCHAR(50),
    inspector_phone VARCHAR(20),
    inspector_email VARCHAR(255),

    -- Requirements & Policies
    requires_tech_on_site BOOLEAN DEFAULT false,
    requires_rough_inspection BOOLEAN DEFAULT false,
    requires_final_inspection BOOLEAN DEFAULT true,
    requires_electrical_inspection BOOLEAN DEFAULT true,

    -- Permitting Details
    typical_permit_turnaround_days INTEGER,
    typical_inspection_turnaround_days INTEGER,
    permit_application_url TEXT,
    online_permitting_available BOOLEAN DEFAULT false,

    -- Special Requirements & Notes
    special_requirements TEXT,
    notes TEXT,

    -- Metadata
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ahj_state ON ahj(state);
CREATE INDEX IF NOT EXISTS idx_ahj_county ON ahj(county);
CREATE INDEX IF NOT EXISTS idx_ahj_name ON ahj(name);
CREATE INDEX IF NOT EXISTS idx_ahj_active ON ahj(active);

-- Create composite index for state + county searches
CREATE INDEX IF NOT EXISTS idx_ahj_state_county ON ahj(state, county);

-- ============================================
-- UPDATE PROJECTS TABLE
-- ============================================

-- Add foreign key column for AHJ
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ahj_id UUID REFERENCES ahj(id);

-- Keep the old ahj_jurisdiction field for backward compatibility
-- (it's already in the projects table, so we don't need to add it)

-- Create index for the foreign key
CREATE INDEX IF NOT EXISTS idx_projects_ahj_id ON projects(ahj_id);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Disable RLS for development (consistent with existing setup)
ALTER TABLE ahj DISABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT ALL ON ahj TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- SEED SAMPLE DATA (Optional - Illinois Counties)
-- ============================================

-- Insert some common Illinois AHJs as examples
INSERT INTO ahj (name, state, county, requires_tech_on_site, requires_rough_inspection, typical_permit_turnaround_days, notes) VALUES
('St. Clair County', 'IL', 'St. Clair', false, true, 14, 'Requires rough inspection for all solar installations'),
('Cook County', 'IL', 'Cook', true, true, 21, 'Tech must be on-site for all inspections'),
('DuPage County', 'IL', 'DuPage', false, true, 10, 'Fast permitting process'),
('Lake County', 'IL', 'Lake', false, true, 14, 'Standard permitting requirements'),
('Will County', 'IL', 'Will', false, false, 14, 'Final inspection only'),
('Kane County', 'IL', 'Kane', false, true, 14, 'Standard requirements'),
('Madison County', 'IL', 'Madison', false, true, 14, 'Standard requirements')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- UPDATE FUNCTION FOR AHJ TIMESTAMPS
-- ============================================

-- Create trigger function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_ahj_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS ahj_updated_at_trigger ON ahj;
CREATE TRIGGER ahj_updated_at_trigger
    BEFORE UPDATE ON ahj
    FOR EACH ROW
    EXECUTE FUNCTION update_ahj_updated_at();

-- ============================================
-- HELPER VIEW (Optional)
-- ============================================

-- Create a view for projects with AHJ details
CREATE OR REPLACE VIEW vw_projects_with_ahj AS
SELECT
    p.*,
    a.name as ahj_name,
    a.state as ahj_state,
    a.county as ahj_county,
    a.requires_tech_on_site as ahj_requires_tech_on_site,
    a.requires_rough_inspection as ahj_requires_rough_inspection,
    a.inspector_name as ahj_inspector_name,
    a.inspector_phone as ahj_inspector_phone,
    a.building_department_phone as ahj_building_dept_phone
FROM projects p
LEFT JOIN ahj a ON p.ahj_id = a.id;

-- Grant access to the view
GRANT SELECT ON vw_projects_with_ahj TO authenticated;
