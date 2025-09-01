-- Check if table exists and show its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns 
WHERE 
    table_name = 'contact_submissions'
ORDER BY 
    ordinal_position;

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies 
WHERE 
    tablename = 'contact_submissions';

-- Check table permissions
SELECT 
    grantee, 
    privilege_type 
FROM 
    information_schema.role_table_grants 
WHERE 
    table_name = 'contact_submissions';
