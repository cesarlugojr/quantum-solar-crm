-- Migration: Create Custom ID System for Quantum Solar CRM
-- Purpose: Implement QSLID, QSOID, QSPID, QSIID custom identifier system
-- Date: 2025-01-19

-- Create sequences for each entity type
CREATE SEQUENCE IF NOT EXISTS leads_seq START 1;
CREATE SEQUENCE IF NOT EXISTS opportunities_seq START 1;
CREATE SEQUENCE IF NOT EXISTS projects_seq START 1;
CREATE SEQUENCE IF NOT EXISTS installations_seq START 1;

-- ID generation functions
CREATE OR REPLACE FUNCTION generate_lead_id() 
RETURNS TEXT AS $$
BEGIN
    RETURN 'QSLID' || LPAD(nextval('leads_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_opportunity_id() 
RETURNS TEXT AS $$
BEGIN
    RETURN 'QSOID' || LPAD(nextval('opportunities_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_project_id() 
RETURNS TEXT AS $$
BEGIN
    RETURN 'QSPID' || LPAD(nextval('projects_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_installation_id() 
RETURNS TEXT AS $$
BEGIN
    RETURN 'QSIID' || LPAD(nextval('installations_seq')::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Test the functions
SELECT generate_lead_id() as sample_lead_id;
SELECT generate_opportunity_id() as sample_opportunity_id;
SELECT generate_project_id() as sample_project_id;
SELECT generate_installation_id() as sample_installation_id;