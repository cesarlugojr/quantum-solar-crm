-- Test Row Level Security policies
BEGIN;
SELECT plan(3);

-- Test that RLS is enabled on critical tables
SELECT has_row_level_security('leads', 'RLS enabled on leads table');
SELECT has_row_level_security('projects', 'RLS enabled on projects table');
SELECT has_row_level_security('opportunities', 'RLS enabled on opportunities table');

-- Note: More specific RLS tests would require setting up test users
-- which is beyond the scope of basic database testing

SELECT finish();
ROLLBACK;