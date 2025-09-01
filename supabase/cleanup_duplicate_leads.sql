-- Cleanup Existing Duplicate Leads Migration
-- This script identifies and consolidates duplicate splash leads that were created
-- before the session-based system was implemented
--
-- IMPORTANT: Review the identified duplicates before running the cleanup!

-- First, let's analyze the current duplicate situation
-- This query identifies potential duplicate leads based on phone + email combination
CREATE OR REPLACE VIEW duplicate_leads_analysis AS
SELECT 
    phone,
    email,
    COUNT(*) as duplicate_count,
    MIN(created_at) as first_submission,
    MAX(created_at) as last_submission,
    ARRAY_AGG(id ORDER BY created_at) as lead_ids,
    ARRAY_AGG(is_partial ORDER BY created_at) as partial_status,
    ARRAY_AGG(current_step ORDER BY created_at) as step_progress,
    -- Get the most complete record info
    MAX(CASE WHEN NOT is_partial THEN id END) as completed_lead_id,
    MAX(current_step) as highest_step_reached
FROM splash_leads 
WHERE phone IS NOT NULL 
   OR email IS NOT NULL
GROUP BY phone, email
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, first_submission DESC;

-- Alternative view: duplicates based on phone only (for cases where email might differ)
CREATE OR REPLACE VIEW duplicate_leads_by_phone AS
SELECT 
    phone,
    COUNT(*) as duplicate_count,
    MIN(created_at) as first_submission,
    MAX(created_at) as last_submission,
    ARRAY_AGG(id ORDER BY created_at) as lead_ids,
    ARRAY_AGG(DISTINCT email) as emails_used,
    ARRAY_AGG(is_partial ORDER BY created_at) as partial_status,
    MAX(CASE WHEN NOT is_partial THEN id END) as completed_lead_id,
    MAX(current_step) as highest_step_reached
FROM splash_leads 
WHERE phone IS NOT NULL 
GROUP BY phone
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, first_submission DESC;

-- Function to merge duplicate leads intelligently
CREATE OR REPLACE FUNCTION merge_duplicate_leads(
    p_primary_lead_id UUID,
    p_duplicate_lead_ids UUID[]
) RETURNS TABLE(
    merged_lead_id UUID,
    deleted_count INTEGER,
    merged_fields TEXT[]
) 
LANGUAGE plpgsql
AS $$
DECLARE
    primary_lead RECORD;
    dup_lead RECORD;
    dup_id UUID;
    deleted_count INTEGER := 0;
    merged_fields TEXT[] := ARRAY[]::TEXT[];
    field_name TEXT;
    field_updated BOOLEAN;
BEGIN
    -- Get primary lead record
    SELECT * INTO primary_lead FROM splash_leads WHERE id = p_primary_lead_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Primary lead ID % not found', p_primary_lead_id;
    END IF;
    
    -- Loop through duplicate leads and merge data
    FOREACH dup_id IN ARRAY p_duplicate_lead_ids LOOP
        SELECT * INTO dup_lead FROM splash_leads WHERE id = dup_id;
        
        IF FOUND AND dup_id != p_primary_lead_id THEN
            field_updated := FALSE;
            
            -- Merge fields where primary lead has null values
            UPDATE splash_leads 
            SET 
                first_name = COALESCE(first_name, dup_lead.first_name),
                last_name = COALESCE(last_name, dup_lead.last_name),
                phone = COALESCE(phone, dup_lead.phone),
                email = COALESCE(email, dup_lead.email),
                street_address = COALESCE(street_address, dup_lead.street_address),
                city = COALESCE(city, dup_lead.city),
                state = COALESCE(state, dup_lead.state),
                zip_code = COALESCE(zip_code, dup_lead.zip_code),
                utility_company = COALESCE(utility_company, dup_lead.utility_company),
                homeowner_status = COALESCE(homeowner_status, dup_lead.homeowner_status),
                credit_score = COALESCE(credit_score, dup_lead.credit_score),
                shading = COALESCE(shading, dup_lead.shading),
                -- Keep the most complete status (completed over partial)
                is_partial = CASE 
                    WHEN is_partial = TRUE AND dup_lead.is_partial = FALSE THEN FALSE
                    ELSE is_partial 
                END,
                -- Keep the highest step reached
                current_step = GREATEST(COALESCE(current_step, 0), COALESCE(dup_lead.current_step, 0)),
                -- Update completed_at if duplicate was completed
                completed_at = COALESCE(completed_at, dup_lead.completed_at),
                -- Preserve consent information
                tcpa_consent = COALESCE(tcpa_consent, dup_lead.tcpa_consent),
                sms_consent = COALESCE(sms_consent, dup_lead.sms_consent),
                consent_timestamp = COALESCE(consent_timestamp, dup_lead.consent_timestamp),
                -- Keep earliest creation timestamp
                created_at = LEAST(created_at, dup_lead.created_at),
                -- Add notes about the merge
                notes = COALESCE(notes || E'\n', '') || 
                       'MERGED: Consolidated duplicate lead ' || dup_id || 
                       ' (created: ' || dup_lead.created_at || ')'
            WHERE id = p_primary_lead_id;
            
            -- Track which fields were merged
            IF dup_lead.first_name IS NOT NULL AND primary_lead.first_name IS NULL THEN
                merged_fields := array_append(merged_fields, 'first_name');
            END IF;
            IF dup_lead.last_name IS NOT NULL AND primary_lead.last_name IS NULL THEN
                merged_fields := array_append(merged_fields, 'last_name');
            END IF;
            IF dup_lead.email IS NOT NULL AND primary_lead.email IS NULL THEN
                merged_fields := array_append(merged_fields, 'email');
            END IF;
            -- Add more field tracking as needed...
            
            -- Delete the duplicate record
            DELETE FROM splash_leads WHERE id = dup_id;
            deleted_count := deleted_count + 1;
        END IF;
    END LOOP;
    
    -- Return results
    RETURN QUERY SELECT p_primary_lead_id, deleted_count, merged_fields;
END;
$$;

-- Safe batch cleanup function (processes duplicates in groups)
CREATE OR REPLACE FUNCTION cleanup_duplicate_leads_batch(
    p_batch_size INTEGER DEFAULT 10
) RETURNS TABLE(
    processed_phone VARCHAR(20),
    primary_lead_id UUID,
    duplicates_merged INTEGER,
    total_leads_before INTEGER,
    leads_after_merge INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    dup_record RECORD;
    processed_count INTEGER := 0;
BEGIN
    -- Process duplicates batch by batch
    FOR dup_record IN 
        SELECT * FROM duplicate_leads_by_phone 
        WHERE duplicate_count > 1 
        ORDER BY duplicate_count DESC
        LIMIT p_batch_size
    LOOP
        DECLARE
            primary_id UUID;
            duplicate_ids UUID[];
            result RECORD;
        BEGIN
            -- Choose primary lead (prefer completed lead, otherwise the first one)
            primary_id := COALESCE(dup_record.completed_lead_id, dup_record.lead_ids[1]);
            
            -- Get array of duplicate IDs (excluding primary)
            duplicate_ids := ARRAY(
                SELECT unnest(dup_record.lead_ids) 
                WHERE unnest(dup_record.lead_ids) != primary_id
            );
            
            -- Merge the duplicates
            SELECT * INTO result 
            FROM merge_duplicate_leads(primary_id, duplicate_ids);
            
            -- Return result for this batch
            RETURN QUERY SELECT 
                dup_record.phone,
                result.merged_lead_id,
                result.deleted_count,
                dup_record.duplicate_count,
                1::INTEGER; -- leads after merge (always 1)
                
            processed_count := processed_count + 1;
        END;
    END LOOP;
    
    RETURN;
END;
$$;

-- Create a backup table before cleanup (SAFETY MEASURE)
CREATE OR REPLACE FUNCTION create_leads_backup() 
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    backup_table_name TEXT;
    record_count INTEGER;
BEGIN
    backup_table_name := 'splash_leads_backup_' || TO_CHAR(NOW(), 'YYYY_MM_DD_HH24_MI_SS');
    
    EXECUTE FORMAT('CREATE TABLE %I AS SELECT * FROM splash_leads', backup_table_name);
    
    EXECUTE FORMAT('SELECT COUNT(*) FROM %I', backup_table_name) INTO record_count;
    
    RETURN FORMAT('Backup created: %s with %s records', backup_table_name, record_count);
END;
$$;

-- Grant permissions
GRANT SELECT ON duplicate_leads_analysis TO authenticated;
GRANT SELECT ON duplicate_leads_by_phone TO authenticated;
GRANT EXECUTE ON FUNCTION merge_duplicate_leads TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_duplicate_leads_batch TO service_role;
GRANT EXECUTE ON FUNCTION create_leads_backup TO service_role;

-- Add helpful comments
COMMENT ON VIEW duplicate_leads_analysis IS 'Identifies potential duplicate leads based on phone + email combination';
COMMENT ON VIEW duplicate_leads_by_phone IS 'Identifies potential duplicate leads based on phone number only';
COMMENT ON FUNCTION merge_duplicate_leads IS 'Intelligently merges duplicate leads, keeping the most complete data';
COMMENT ON FUNCTION cleanup_duplicate_leads_batch IS 'Safely processes duplicate cleanup in batches';
COMMENT ON FUNCTION create_leads_backup IS 'Creates a timestamped backup of splash_leads table';
