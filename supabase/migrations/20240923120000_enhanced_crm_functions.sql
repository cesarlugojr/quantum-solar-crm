-- Enhanced CRM Functions & Triggers Migration
-- This migration implements the advanced CRM functionality from the implementation guide

-- Function to get lead conversion stats
CREATE OR REPLACE FUNCTION get_lead_stats(user_filter TEXT DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_leads', COUNT(*),
    'new_leads', COUNT(*) FILTER (WHERE status = 'new'),
    'qualified_leads', COUNT(*) FILTER (WHERE status = 'qualified'),
    'converted_leads', COUNT(*) FILTER (WHERE status IN ('contract_signed', 'installation_complete', 'pto_granted')),
    'conversion_rate',
      CASE
        WHEN COUNT(*) > 0 THEN
          ROUND((COUNT(*) FILTER (WHERE status IN ('contract_signed', 'installation_complete', 'pto_granted'))::NUMERIC / COUNT(*) * 100), 2)
        ELSE 0
      END,
    'avg_lead_value', COALESCE(AVG(estimated_system_value), 0),
    'total_pipeline_value', COALESCE(SUM(estimated_system_value), 0),
    'leads_by_status', (
      SELECT json_object_agg(status, count)
      FROM (
        SELECT status, COUNT(*) as count
        FROM contact_submissions
        WHERE (user_filter IS NULL OR assigned_to = user_filter)
          AND created_at >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY status
      ) status_counts
    )
  ) INTO result
  FROM contact_submissions
  WHERE (user_filter IS NULL OR assigned_to = user_filter)
    AND created_at >= CURRENT_DATE - INTERVAL '90 days';

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-assign leads based on workload
CREATE OR REPLACE FUNCTION auto_assign_lead(lead_id UUID)
RETURNS UUID AS $$
DECLARE
  assigned_user UUID;
  min_leads INTEGER := 999999;
  user_rec RECORD;
BEGIN
  -- Find user with least assigned leads in last 30 days
  FOR user_rec IN
    SELECT u.id, COUNT(cs.id) as lead_count
    FROM auth.users u
    LEFT JOIN contact_submissions cs ON cs.assigned_to = u.id
      AND cs.created_at >= CURRENT_DATE - INTERVAL '30 days'
    WHERE u.raw_user_meta_data->>'role' = 'sales'
      AND u.banned_until IS NULL
    GROUP BY u.id
    ORDER BY lead_count ASC
    LIMIT 1
  LOOP
    assigned_user := user_rec.id;
    EXIT;
  END LOOP;

  -- If no sales users found, leave unassigned
  IF assigned_user IS NULL THEN
    RETURN NULL;
  END IF;

  -- Update the lead with assignment
  UPDATE contact_submissions
  SET assigned_to = assigned_user,
      status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END,
      updated_at = NOW()
  WHERE id = lead_id;

  -- Log the assignment
  INSERT INTO activity_log (user_id, entity_type, entity_id, action, details)
  VALUES (assigned_user, 'lead', lead_id, 'auto_assigned',
    json_build_object('assigned_at', NOW(), 'method', 'auto_assignment'));

  RETURN assigned_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate lead scoring
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
  lead_rec RECORD;
  score INTEGER := 0;
BEGIN
  SELECT * INTO lead_rec FROM contact_submissions WHERE id = lead_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Base score
  score := 50;

  -- Income scoring
  CASE lead_rec.monthly_income_range
    WHEN '10000+' THEN score := score + 30;
    WHEN '7500-10000' THEN score := score + 25;
    WHEN '5000-7500' THEN score := score + 20;
    WHEN '3000-5000' THEN score := score + 10;
    ELSE score := score - 10;
  END CASE;

  -- Credit score scoring
  CASE lead_rec.credit_score_range
    WHEN '750+' THEN score := score + 25;
    WHEN '700-749' THEN score := score + 20;
    WHEN '650-699' THEN score := score + 15;
    WHEN '600-649' THEN score := score + 5;
    ELSE score := score - 15;
  END CASE;

  -- Utility bill scoring (higher bills = better prospects)
  IF lead_rec.average_monthly_bill IS NOT NULL AND lead_rec.average_monthly_bill ~ '^[0-9]+$' THEN
    IF lead_rec.average_monthly_bill::INTEGER >= 200 THEN
      score := score + 20;
    ELSIF lead_rec.average_monthly_bill::INTEGER >= 150 THEN
      score := score + 15;
    ELSIF lead_rec.average_monthly_bill::INTEGER >= 100 THEN
      score := score + 10;
    ELSE
      score := score - 5;
    END IF;
  END IF;

  -- Home condition scoring
  CASE lead_rec.roof_condition
    WHEN 'excellent' THEN score := score + 15;
    WHEN 'good' THEN score := score + 10;
    WHEN 'fair' THEN score := score + 5;
    ELSE score := score - 10;
  END CASE;

  -- TCPA consent bonus
  IF lead_rec.consent_tcpa = true THEN
    score := score + 10;
  END IF;

  -- Ensure score is within bounds
  score := GREATEST(0, LEAST(100, score));

  -- Update the lead with calculated score
  UPDATE contact_submissions
  SET lead_score = score
  WHERE id = lead_id;

  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process new leads (auto-assign and score)
CREATE OR REPLACE FUNCTION process_new_lead()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign the lead if not already assigned
  IF NEW.assigned_to IS NULL THEN
    NEW.assigned_to := auto_assign_lead(NEW.id);
  END IF;

  -- Calculate lead score
  NEW.lead_score := calculate_lead_score(NEW.id);

  -- Set initial status if not provided
  IF NEW.status IS NULL THEN
    NEW.status := 'new';
  END IF;

  -- Set created_at and updated_at timestamps
  NEW.created_at := COALESCE(NEW.created_at, NOW());
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new lead processing
DROP TRIGGER IF EXISTS trigger_process_new_lead ON contact_submissions;
CREATE TRIGGER trigger_process_new_lead
  BEFORE INSERT ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION process_new_lead();

-- Function to update lead scores (can be called manually or via cron)
CREATE OR REPLACE FUNCTION update_all_lead_scores()
RETURNS INTEGER AS $$
DECLARE
  lead_count INTEGER := 0;
  lead_rec RECORD;
BEGIN
  FOR lead_rec IN
    SELECT id FROM contact_submissions
    WHERE lead_score IS NULL OR updated_at < NOW() - INTERVAL '7 days'
  LOOP
    PERFORM calculate_lead_score(lead_rec.id);
    lead_count := lead_count + 1;
  END LOOP;

  RETURN lead_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get comprehensive project analytics
CREATE OR REPLACE FUNCTION get_project_analytics(time_range TEXT DEFAULT '30d')
RETURNS JSON AS $$
DECLARE
  result JSON;
  days_back INTEGER;
  start_date DATE;
BEGIN
  -- Parse time range
  CASE time_range
    WHEN '7d' THEN days_back := 7;
    WHEN '30d' THEN days_back := 30;
    WHEN '90d' THEN days_back := 90;
    WHEN '12m' THEN days_back := 365;
    ELSE days_back := 30;
  END CASE;

  start_date := CURRENT_DATE - INTERVAL (days_back || ' days');

  SELECT json_build_object(
    'total_projects', COUNT(*),
    'active_projects', COUNT(*) FILTER (WHERE overall_status = 'active'),
    'completed_projects', COUNT(*) FILTER (WHERE overall_status = 'completed'),
    'total_revenue', COALESCE(SUM(project_value) FILTER (WHERE overall_status = 'completed'), 0),
    'pipeline_value', COALESCE(SUM(project_value) FILTER (WHERE overall_status = 'active'), 0),
    'avg_project_value', COALESCE(AVG(project_value), 0),
    'stage_distribution', (
      SELECT json_object_agg(current_stage_varchar, count)
      FROM (
        SELECT
          COALESCE(current_stage_varchar, 'unknown') as current_stage_varchar,
          COUNT(*) as count
        FROM projects
        WHERE created_at >= start_date
        GROUP BY current_stage_varchar
      ) stage_counts
    ),
    'monthly_trend', (
      SELECT json_agg(json_build_object(
        'month', month_year,
        'projects', project_count,
        'revenue', revenue
      ))
      FROM (
        SELECT
          TO_CHAR(created_at, 'YYYY-MM') as month_year,
          COUNT(*) as project_count,
          COALESCE(SUM(project_value), 0) as revenue
        FROM projects
        WHERE created_at >= start_date
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month_year
      ) monthly_data
    )
  ) INTO result
  FROM projects
  WHERE created_at >= start_date;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_lead_stats TO authenticated;
GRANT EXECUTE ON FUNCTION auto_assign_lead TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_lead_score TO authenticated;
GRANT EXECUTE ON FUNCTION update_all_lead_scores TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_analytics TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_assigned_to ON contact_submissions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_lead_score ON contact_submissions(lead_score);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(current_stage_varchar);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(overall_status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

COMMENT ON FUNCTION get_lead_stats IS 'Get comprehensive lead conversion statistics and metrics';
COMMENT ON FUNCTION auto_assign_lead IS 'Automatically assign leads to sales team members based on current workload';
COMMENT ON FUNCTION calculate_lead_score IS 'Calculate lead quality score based on demographic and qualification data';
COMMENT ON FUNCTION get_project_analytics IS 'Get comprehensive project analytics including trends and stage distribution';