#!/bin/bash

# Database testing script using Supabase local instance
set -e

echo "🗄️  Starting Supabase local database tests..."

# Check if Supabase is running locally
if ! curl -s "http://localhost:54321/health" > /dev/null 2>&1; then
    echo "❌ Supabase local instance not running. Starting it..."
    supabase start --db-port 54322
    echo "✅ Supabase local instance started"
fi

# Install pgTAP if not already installed
echo "📦 Ensuring pgTAP extension is available..."
supabase db reset

# Run database tests
echo "🧪 Running database tests..."

# Custom ID tests
echo "Testing custom ID generation..."
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f tests/database/custom-ids.test.sql

# Schema validation tests
echo "Testing schema validation..."
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f tests/database/schema-validation.test.sql

# RLS policy tests
echo "Testing RLS policies..."
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f tests/database/rls-policies.test.sql

echo "✅ All database tests completed successfully!"