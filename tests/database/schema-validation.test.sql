-- Test database schema validation
BEGIN;
SELECT plan(10);

-- Test that required tables exist
SELECT has_table('leads', 'Leads table exists');
SELECT has_table('projects', 'Projects table exists');
SELECT has_table('opportunities', 'Opportunities table exists');
SELECT has_table('contact_submissions', 'Contact submissions table exists');

-- Test that required columns exist on leads table
SELECT has_column('leads', 'custom_id', 'Leads table has custom_id column');
SELECT has_column('leads', 'tcpa_consent', 'Leads table has TCPA consent column');
SELECT has_column('leads', 'utility_company', 'Leads table has utility_company column');

-- Test that custom_id columns have unique constraints
SELECT col_is_unique('leads', 'custom_id', 'Lead custom_id is unique');
SELECT col_is_unique('projects', 'custom_id', 'Project custom_id is unique');

-- Test that required functions exist
SELECT has_function('generate_lead_id', 'Lead ID generation function exists');

SELECT finish();
ROLLBACK;