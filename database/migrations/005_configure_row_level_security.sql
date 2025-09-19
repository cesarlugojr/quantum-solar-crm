-- Migration: Configure Row Level Security (RLS)
-- Purpose: Implement comprehensive security policies for all tables
-- Date: 2025-01-19

-- First, we need to create a profiles table to reference users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'sales_rep', 'installer', 'user')),
    department TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on all tables
ALTER TABLE splash_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies (users can read all profiles but only update their own)
CREATE POLICY "Users can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
    ON profiles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- Leads policies
CREATE POLICY "Sales reps manage assigned leads"
    ON splash_leads FOR ALL
    TO authenticated
    USING (
        assigned_to IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('manager', 'admin')
        OR assigned_to IS NULL -- Unassigned leads can be viewed by all sales staff
    );

CREATE POLICY "All authenticated users can view leads"
    ON splash_leads FOR SELECT
    TO authenticated
    USING (true);

-- Opportunities policies
CREATE POLICY "Sales reps manage assigned opportunities"
    ON opportunities FOR ALL
    TO authenticated
    USING (
        assigned_to IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('manager', 'admin')
    );

CREATE POLICY "All authenticated users can view opportunities"
    ON opportunities FOR SELECT
    TO authenticated
    USING (true);

-- Projects policies
CREATE POLICY "Project team access"
    ON projects FOR SELECT
    TO authenticated
    USING (
        assigned_project_manager IN (SELECT full_name FROM profiles WHERE user_id = auth.uid())
        OR assigned_installer IN (SELECT full_name FROM profiles WHERE user_id = auth.uid())
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('manager', 'admin')
    );

CREATE POLICY "Project managers can update projects"
    ON projects FOR UPDATE
    TO authenticated
    USING (
        assigned_project_manager IN (SELECT full_name FROM profiles WHERE user_id = auth.uid())
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('manager', 'admin')
    );

CREATE POLICY "Admins and managers can create projects"
    ON projects FOR INSERT
    TO authenticated
    WITH CHECK (
        (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('manager', 'admin')
    );

-- Installation equipment policies
CREATE POLICY "Installers access assigned project equipment"
    ON installation_equipment FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE assigned_installer IN (SELECT full_name FROM profiles WHERE user_id = auth.uid())
            OR assigned_project_manager IN (SELECT full_name FROM profiles WHERE user_id = auth.uid())
        )
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('manager', 'admin')
    );

CREATE POLICY "Installers can update equipment they install"
    ON installation_equipment FOR UPDATE
    TO authenticated
    USING (
        installer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR project_id IN (
            SELECT id FROM projects 
            WHERE assigned_installer IN (SELECT full_name FROM profiles WHERE user_id = auth.uid())
        )
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('manager', 'admin')
    );

-- Photo submissions policies (already enabled, add specific policies)
CREATE POLICY "Project team can manage photo submissions"
    ON photo_submissions FOR ALL
    TO authenticated
    USING (
        project_id IN (
            SELECT custom_id FROM projects 
            WHERE assigned_installer IN (SELECT full_name FROM profiles WHERE user_id = auth.uid())
            OR assigned_project_manager IN (SELECT full_name FROM profiles WHERE user_id = auth.uid())
        )
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('manager', 'admin')
    );

-- Photo records policies (already enabled, add specific policies)
CREATE POLICY "Project team can manage photo records"
    ON photo_records FOR ALL
    TO authenticated
    USING (
        project_id IN (
            SELECT custom_id FROM projects 
            WHERE assigned_installer IN (SELECT full_name FROM profiles WHERE user_id = auth.uid())
            OR assigned_project_manager IN (SELECT full_name FROM profiles WHERE user_id = auth.uid())
        )
        OR (SELECT role FROM profiles WHERE user_id = auth.uid()) IN ('manager', 'admin')
    );

-- Create indexes to support RLS queries efficiently
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_splash_leads_assigned_to ON splash_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned_to ON opportunities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_projects_manager_installer ON projects(assigned_project_manager, assigned_installer);

-- Add comments
COMMENT ON TABLE profiles IS 'User profiles with role-based access control';
COMMENT ON COLUMN profiles.role IS 'User role for RLS: admin, manager, sales_rep, installer, user';