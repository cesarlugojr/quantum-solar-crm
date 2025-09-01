-- Fix RLS Policy for Splash Leads Table
-- This script adds the necessary RLS policy to allow anonymous users to insert leads

-- Add policy to allow anonymous users to insert splash leads
CREATE POLICY "Anonymous users can insert splash_leads" 
ON splash_leads FOR INSERT 
TO anon 
WITH CHECK (true);

-- Also allow anonymous users to insert using public role
CREATE POLICY "Public can insert splash_leads" 
ON splash_leads FOR INSERT 
TO public 
WITH CHECK (true);

-- Grant INSERT permission to anon role
GRANT INSERT ON splash_leads TO anon;

-- Verify the policies exist
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'splash_leads';
