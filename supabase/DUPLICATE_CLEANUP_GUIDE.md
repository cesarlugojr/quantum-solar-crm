# Duplicate Leads Cleanup Guide

## Overview

The session-based system prevents **NEW** duplicates going forward, but **existing duplicates** in your database need to be cleaned up separately. This guide provides a safe, step-by-step process to consolidate existing duplicate leads.

## ⚠️ IMPORTANT: Safety First

**ALWAYS create a backup before running cleanup operations!**

## Step-by-Step Cleanup Process

### Step 1: Apply the Base Migration (If Not Done Already)

```sql
-- Run this first: supabase/session_based_leads.sql
-- This adds session_id column and TCPA consent tracking
```

### Step 2: Apply the Cleanup Migration

```sql
-- Run this second: supabase/cleanup_duplicate_leads.sql
-- This creates analysis views and cleanup functions
```

### Step 3: Analyze Current Duplicates

Run these queries to see what duplicates exist:

```sql
-- See duplicates by phone + email combination
SELECT * FROM duplicate_leads_analysis LIMIT 10;

-- See duplicates by phone only (more common)
SELECT * FROM duplicate_leads_by_phone LIMIT 10;

-- Get summary statistics
SELECT 
    COUNT(*) as duplicate_groups,
    SUM(duplicate_count) as total_duplicate_records,
    SUM(duplicate_count - 1) as records_that_can_be_cleaned,
    AVG(duplicate_count) as avg_duplicates_per_group
FROM duplicate_leads_by_phone;
```

### Step 4: Create Backup (CRITICAL!)

```sql
-- Create timestamped backup of all leads
SELECT create_leads_backup();
-- This will return something like: "Backup created: splash_leads_backup_2025_01_26_18_33_45 with 1234 records"
```

### Step 5: Test Cleanup on Small Batch

```sql
-- Process just 5 duplicate groups as a test
SELECT * FROM cleanup_duplicate_leads_batch(5);
```

Review the results to ensure the cleanup worked as expected.

### Step 6: Run Full Cleanup (If Test Looks Good)

```sql
-- Process all duplicates in batches of 25
-- You can run this multiple times until no more duplicates remain
SELECT * FROM cleanup_duplicate_leads_batch(25);

-- Check remaining duplicates
SELECT COUNT(*) FROM duplicate_leads_by_phone;

-- If there are still duplicates, run again
SELECT * FROM cleanup_duplicate_leads_batch(25);
```

### Step 7: Verify Cleanup Results

```sql
-- Compare before and after counts
SELECT 
    (SELECT COUNT(*) FROM splash_leads_backup_YYYY_MM_DD_HH24_MI_SS) as original_count,
    (SELECT COUNT(*) FROM splash_leads) as current_count,
    (SELECT COUNT(*) FROM splash_leads_backup_YYYY_MM_DD_HH24_MI_SS) - 
    (SELECT COUNT(*) FROM splash_leads) as duplicates_removed;

-- Check that no critical data was lost
SELECT 
    COUNT(*) as completed_leads,
    COUNT(*) FILTER (WHERE tcpa_consent = true) as consented_leads,
    COUNT(DISTINCT phone) as unique_phone_numbers,
    COUNT(DISTINCT email) as unique_emails
FROM splash_leads;
```

## How the Cleanup Works

### Intelligent Merging Logic

The cleanup system:

1. **Identifies duplicates** by phone number (most reliable identifier)
2. **Chooses a primary lead**:
   - Prefers completed leads over partial ones
   - Falls back to the earliest submission if all are partial
3. **Merges data intelligently**:
   - Fills missing fields from duplicates
   - Keeps the most complete status (completed > partial)
   - Preserves the highest step reached
   - Maintains earliest creation timestamp
   - Combines TCPA consent information
4. **Adds merge notes** for audit trail
5. **Deletes duplicate records** after merging

### What Gets Preserved

- **All contact information** (phone, email, address)
- **Completion status** (completed leads stay completed)
- **TCPA consent data** (critical for compliance)
- **Progress information** (highest step reached)
- **Creation timestamps** (earliest date preserved)
- **Complete lead data** (no information loss)

## Recovery Process (If Something Goes Wrong)

If you need to restore from backup:

```sql
-- Drop current table and restore from backup
DROP TABLE splash_leads;
ALTER TABLE splash_leads_backup_YYYY_MM_DD_HH24_MI_SS RENAME TO splash_leads;

-- Recreate indexes and views
-- (Run the original splash_leads.sql migration again)
```

## Expected Results

After cleanup, you should see:

- **Reduced total lead count** (duplicates consolidated)
- **Same number of unique phone numbers**
- **No loss of completed leads**
- **Preserved TCPA consent information**
- **Clean, deduplicated database**

## Example Before/After

**Before Cleanup:**
- 5 records for phone: (555) 123-4567
- 2 partial, 1 completed, 2 abandoned at different steps

**After Cleanup:**
- 1 record for phone: (555) 123-4567
- Status: completed
- All fields filled from the various submissions
- Notes indicating merge history

## Ongoing Prevention

Once cleanup is complete and the session-based system is active:
- **New submissions** will use session IDs
- **No more duplicates** will be created
- **Abandoned form tracking** continues to work
- **Single lead per session** maintained automatically
