-- First, disable RLS to ensure we can modify the table and policies
ALTER TABLE IF EXISTS contact_submissions DISABLE ROW LEVEL SECURITY;

-- Drop existing table if it exists
DROP TABLE IF EXISTS contact_submissions;

-- Create the contact_submissions table
CREATE TABLE contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    message TEXT,
    homeowner BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'new',
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable insert for everyone" ON contact_submissions;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON contact_submissions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON contact_submissions;

-- Create a policy that allows public inserts without restrictions
CREATE POLICY "Enable public inserts"
    ON contact_submissions
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Create a policy that allows authenticated users to read data
CREATE POLICY "Enable read access for authenticated users"
    ON contact_submissions
    FOR SELECT
    TO authenticated
    USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO public;
GRANT INSERT ON contact_submissions TO public;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO public;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Verify the policies are set correctly
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
