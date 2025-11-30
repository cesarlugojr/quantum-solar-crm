'use server';

import { createClient } from '@supabase/supabase-js';
import type {
  DashboardMetrics,
  RevenueData,
  PipelineData,
  CashFlowForecast,
  LeadV2,
  ProjectV2,
  CandidateV2,
  Campaign,
  OpportunityV2,
} from '@/types/crmv2';

// Initialize Supabase client with service role key for server actions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

// ============================================
// DASHBOARD METRICS
// ============================================

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    // Fetch total leads from splash_leads (the actual leads table with data)
    const { count: totalLeads } = await supabase
      .from('splash_leads')
      .select('*', { count: 'exact', head: true });

    // Fetch total projects
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    // Fetch active projects (stages 5-11: Contract Signed to Inspection Passed)
    const { count: activeProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .gte('current_stage', 5)
      .lte('current_stage', 11);

    // Calculate conversion rate (projects / leads)
    const conversionRate = totalLeads && totalLeads > 0
      ? ((totalProjects || 0) / totalLeads) * 100
      : 0;

    // Fetch total revenue from projects
    const { data: revenueData } = await supabase
      .from('projects')
      .select('estimated_revenue, actual_revenue')
      .not('estimated_revenue', 'is', null);

    const totalRevenue = revenueData?.reduce(
      (sum, project) => sum + (project.actual_revenue || project.estimated_revenue || 0),
      0
    ) || 0;

    // Fetch current month revenue
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const { data: monthlyRevenueData } = await supabase
      .from('projects')
      .select('estimated_revenue, actual_revenue, created_at')
      .gte('created_at', currentMonth.toISOString());

    const monthlyRevenue = monthlyRevenueData?.reduce(
      (sum, project) => sum + (project.actual_revenue || project.estimated_revenue || 0),
      0
    ) || 0;

    // Calculate average system size
    const { data: systemData } = await supabase
      .from('projects')
      .select('system_size_kw')
      .not('system_size_kw', 'is', null);

    const averageSystemSize = systemData && systemData.length > 0
      ? systemData.reduce((sum, p) => sum + (p.system_size_kw || 0), 0) / systemData.length
      : 0;

    // Calculate average deal size
    const averageDealSize = (totalProjects || 0) > 0
      ? totalRevenue / (totalProjects || 1)
      : 0;

    return {
      totalLeads: totalLeads || 0,
      totalProjects: totalProjects || 0,
      activeProjects: activeProjects || 0,
      conversionRate: Math.round(conversionRate * 10) / 10,
      totalRevenue,
      monthlyRevenue,
      averageSystemSize: Math.round(averageSystemSize * 10) / 10,
      averageDealSize: Math.round(averageDealSize),
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return {
      totalLeads: 0,
      totalProjects: 0,
      activeProjects: 0,
      conversionRate: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      averageSystemSize: 0,
      averageDealSize: 0,
    };
  }
}

// ============================================
// REVENUE ANALYTICS
// ============================================

export async function getRevenueData(months: number = 12): Promise<RevenueData[]> {
  try {
    // Try to fetch from materialized view first
    const { data, error } = await supabase
      .from('mv_revenue_analytics')
      .select('*')
      .order('month', { ascending: false })
      .limit(months);

    if (!error && data) {
      return data.map((row: any) => ({
        month: row.month,
        revenue_type: row.revenue_type,
        project_count: row.project_count,
        total_kw: row.total_kw,
        total_revenue: row.total_estimated_revenue || 0,
        avg_system_size: row.avg_system_size || 0,
      }));
    }

    // Fallback: Calculate from projects table directly
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - months);

    const { data: projects } = await supabase
      .from('projects')
      .select('revenue_type, system_size_kw, estimated_revenue, created_at')
      .gte('created_at', monthsAgo.toISOString())
      .not('revenue_type', 'is', null);

    if (!projects) return [];

    // Group by month and revenue type
    const grouped = projects.reduce((acc: any, project: any) => {
      const month = project.created_at.substring(0, 7); // YYYY-MM
      const key = `${month}-${project.revenue_type}`;

      if (!acc[key]) {
        acc[key] = {
          month,
          revenue_type: project.revenue_type,
          project_count: 0,
          total_kw: 0,
          total_revenue: 0,
          count: 0,
        };
      }

      acc[key].project_count++;
      acc[key].total_kw += project.system_size_kw || 0;
      acc[key].total_revenue += project.estimated_revenue || 0;
      acc[key].count++;

      return acc;
    }, {});

    return Object.values(grouped).map((item: any) => ({
      month: item.month,
      revenue_type: item.revenue_type,
      project_count: item.project_count,
      total_kw: item.total_kw,
      total_revenue: item.total_revenue,
      avg_system_size: item.count > 0 ? item.total_kw / item.count : 0,
    }));
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return [];
  }
}

// ============================================
// PIPELINE ANALYTICS
// ============================================

export async function getPipelineData(): Promise<PipelineData[]> {
  try {
    const { data, error } = await supabase
      .from('mv_pipeline_analytics')
      .select('*')
      .order('current_stage');

    if (!error && data) {
      return data.map((row: any) => ({
        stage: row.current_stage,
        stage_label: getStageLabel(row.current_stage),
        project_count: row.project_count,
        total_revenue: row.total_revenue || 0,
        avg_days_in_stage: row.avg_days_in_pipeline || 0,
      }));
    }

    // Fallback: Calculate from projects table
    const { data: projects } = await supabase
      .from('projects')
      .select('current_stage, estimated_revenue, created_at');

    if (!projects) return [];

    const grouped = projects.reduce((acc: any, project: any) => {
      const stage = project.current_stage;
      if (!acc[stage]) {
        acc[stage] = {
          stage,
          stage_label: getStageLabel(stage),
          project_count: 0,
          total_revenue: 0,
          total_days: 0,
        };
      }

      acc[stage].project_count++;
      acc[stage].total_revenue += project.estimated_revenue || 0;

      const createdDate = new Date(project.created_at);
      const daysInPipeline = Math.floor(
        (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      acc[stage].total_days += daysInPipeline;

      return acc;
    }, {});

    return Object.values(grouped).map((item: any) => ({
      stage: item.stage,
      stage_label: item.stage_label,
      project_count: item.project_count,
      total_revenue: item.total_revenue,
      avg_days_in_stage: item.project_count > 0 ? item.total_days / item.project_count : 0,
    }));
  } catch (error) {
    console.error('Error fetching pipeline data:', error);
    return [];
  }
}

// ============================================
// CASH FLOW FORECAST
// ============================================

export async function getCashFlowForecast(weeks: number = 13): Promise<CashFlowForecast[]> {
  try {
    // Try to call the PostgreSQL function (may not exist)
    const { data, error } = await supabase
      .rpc('calculate_cash_flow_forecast', {
        start_date: new Date().toISOString().split('T')[0],
        weeks,
      });

    // If function doesn't exist or errors, return empty forecast
    if (error) {
      // Function may not exist - return empty forecast silently
      const forecast: CashFlowForecast[] = [];
      const startDate = new Date();

      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + i * 7);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        forecast.push({
          week_number: i + 1,
          week_start_date: weekStart.toISOString().split('T')[0],
          week_end_date: weekEnd.toISOString().split('T')[0],
          expected_inflows: 0,
          expected_outflows: 0,
          net_cash_flow: 0,
          cumulative_cash_flow: 0,
        });
      }

      return forecast;
    }

    // Calculate cumulative cash flow
    let cumulative = 0;
    return (data || []).map((week: any) => {
      cumulative += week.net_cash_flow;
      return {
        week_number: week.week_number,
        week_start_date: week.week_start_date,
        week_end_date: week.week_end_date,
        expected_inflows: week.expected_inflows,
        expected_outflows: week.expected_outflows,
        net_cash_flow: week.net_cash_flow,
        cumulative_cash_flow: cumulative,
      };
    });
  } catch (error) {
    console.error('Error fetching cash flow forecast:', error);

    // Return empty forecast data
    const forecast: CashFlowForecast[] = [];
    const startDate = new Date();

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + i * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      forecast.push({
        week_number: i + 1,
        week_start_date: weekStart.toISOString().split('T')[0],
        week_end_date: weekEnd.toISOString().split('T')[0],
        expected_inflows: 0,
        expected_outflows: 0,
        net_cash_flow: 0,
        cumulative_cash_flow: 0,
      });
    }

    return forecast;
  }
}

// ============================================
// LEADS DATA
// ============================================

export async function getLeads(limit: number = 50, offset: number = 0): Promise<LeadV2[]> {
  try {
    // Query splash_leads (the actual leads table with data)
    const { data, error } = await supabase
      .from('splash_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (data || []).map((lead: any) => ({
      ...lead,
      name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.name,
      location: lead.address
        ? `${lead.city || ''}, ${lead.state || ''} ${lead.zip_code || ''}`.trim()
        : lead.location,
      status: lead.status || 'new',
    }));
  } catch (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
}

// ============================================
// PROJECTS DATA
// ============================================

export async function getProjects(limit: number = 50, offset: number = 0): Promise<ProjectV2[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// ============================================
// CANDIDATES DATA
// ============================================

export async function getCandidates(limit: number = 50, offset: number = 0): Promise<CandidateV2[]> {
  try {
    // Query job_applications (the actual candidates table with data)
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (data || []).map((candidate: any) => ({
      ...candidate,
      name: `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || candidate.name || candidate.full_name,
      position: candidate.position || candidate.desired_position || 'Not specified',
      status: candidate.status || 'applied',
      created_at: candidate.submitted_at || candidate.created_at,
    }));
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
}

// ============================================
// CAMPAIGNS DATA
// ============================================

export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select(`
        *,
        sequences:email_sequences(
          *,
          email_templates(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

// ============================================
// OPPORTUNITIES DATA
// ============================================

export async function getOpportunities(limit: number = 50, offset: number = 0): Promise<OpportunityV2[]> {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return [];
  }
}

export async function getOpportunityById(id: string): Promise<OpportunityV2 | null> {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return null;
  }
}

export async function getOpportunityStats(): Promise<{
  scheduled: number;
  followupNeeded: number;
  followupBooked: number;
  sales: number;
  lost: number;
  total: number;
}> {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('status');

    if (error) throw error;

    const stats = {
      scheduled: 0,
      followupNeeded: 0,
      followupBooked: 0,
      sales: 0,
      lost: 0,
      total: data?.length || 0,
    };

    data?.forEach((opp) => {
      switch (opp.status) {
        case 'appointment_scheduled':
          stats.scheduled++;
          break;
        case 'followup_needed':
          stats.followupNeeded++;
          break;
        case 'followup_booked':
          stats.followupBooked++;
          break;
        case 'sale':
          stats.sales++;
          break;
        case 'opportunity_lost':
          stats.lost++;
          break;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching opportunity stats:', error);
    return {
      scheduled: 0,
      followupNeeded: 0,
      followupBooked: 0,
      sales: 0,
      lost: 0,
      total: 0,
    };
  }
}

// ============================================
// REPORTS DATA
// ============================================

export async function getReportData(reportType: 'adders' | 'average-days' | 'monthly-kw'): Promise<any> {
  try {
    switch (reportType) {
      case 'adders': {
        // Try materialized view first
        const { data: mvData, error: mvError } = await supabase
          .from('mv_adders_breakdown')
          .select('*')
          .single();

        if (!mvError && mvData) {
          return mvData;
        }

        // Fallback: Calculate from projects table
        const { data: projects } = await supabase
          .from('projects')
          .select('has_mpu, has_battery, has_trench');

        if (!projects) return null;

        const stats = {
          mpu_only: 0,
          battery_only: 0,
          trench_only: 0,
          mpu_battery: 0,
          mpu_trench: 0,
          battery_trench: 0,
          mpu_battery_trench: 0,
          no_adders: 0,
          total_projects: projects.length,
        };

        projects.forEach((p) => {
          const hasMpu = p.has_mpu || false;
          const hasBattery = p.has_battery || false;
          const hasTrench = p.has_trench || false;

          if (hasMpu && hasBattery && hasTrench) {
            stats.mpu_battery_trench++;
          } else if (hasMpu && hasBattery) {
            stats.mpu_battery++;
          } else if (hasMpu && hasTrench) {
            stats.mpu_trench++;
          } else if (hasBattery && hasTrench) {
            stats.battery_trench++;
          } else if (hasMpu) {
            stats.mpu_only++;
          } else if (hasBattery) {
            stats.battery_only++;
          } else if (hasTrench) {
            stats.trench_only++;
          } else {
            stats.no_adders++;
          }
        });

        return stats;
      }

      case 'average-days': {
        // Try materialized view first
        const { data: mvData, error: mvError } = await supabase
          .from('mv_average_days_metrics')
          .select('*')
          .order('month', { ascending: false })
          .limit(12);

        if (!mvError && mvData && mvData.length > 0) {
          return mvData;
        }

        // Fallback: Calculate from projects table
        const { data: projects } = await supabase
          .from('projects')
          .select(`
            permitting_approved_date,
            installation_scheduled_date,
            installation_complete_date,
            inspection_scheduled_date,
            inspection_complete_date
          `)
          .not('permitting_approved_date', 'is', null);

        if (!projects || projects.length === 0) return [];

        // Group by month and calculate averages
        const monthlyData: Record<string, any> = {};

        projects.forEach((p) => {
          if (!p.permitting_approved_date) return;

          const month = p.permitting_approved_date.substring(0, 7) + '-01';

          if (!monthlyData[month]) {
            monthlyData[month] = {
              month,
              permit_to_install: [],
              install_to_complete: [],
              install_to_inspection: [],
              inspection_time: [],
              project_count: 0,
            };
          }

          monthlyData[month].project_count++;

          if (p.installation_scheduled_date && p.permitting_approved_date) {
            const days = Math.abs(
              new Date(p.installation_scheduled_date).getTime() -
              new Date(p.permitting_approved_date).getTime()
            ) / (1000 * 60 * 60 * 24);
            monthlyData[month].permit_to_install.push(days);
          }

          if (p.installation_complete_date && p.installation_scheduled_date) {
            const days = Math.abs(
              new Date(p.installation_complete_date).getTime() -
              new Date(p.installation_scheduled_date).getTime()
            ) / (1000 * 60 * 60 * 24);
            monthlyData[month].install_to_complete.push(days);
          }

          if (p.inspection_scheduled_date && p.installation_complete_date) {
            const days = Math.abs(
              new Date(p.inspection_scheduled_date).getTime() -
              new Date(p.installation_complete_date).getTime()
            ) / (1000 * 60 * 60 * 24);
            monthlyData[month].install_to_inspection.push(days);
          }

          if (p.inspection_complete_date && p.inspection_scheduled_date) {
            const days = Math.abs(
              new Date(p.inspection_complete_date).getTime() -
              new Date(p.inspection_scheduled_date).getTime()
            ) / (1000 * 60 * 60 * 24);
            monthlyData[month].inspection_time.push(days);
          }
        });

        const result = Object.values(monthlyData).map((m: any) => ({
          month: m.month,
          avg_days_permit_to_install_scheduled:
            m.permit_to_install.length > 0
              ? m.permit_to_install.reduce((a: number, b: number) => a + b, 0) / m.permit_to_install.length
              : null,
          avg_days_install_scheduled_to_complete:
            m.install_to_complete.length > 0
              ? m.install_to_complete.reduce((a: number, b: number) => a + b, 0) / m.install_to_complete.length
              : null,
          avg_days_install_to_inspection:
            m.install_to_inspection.length > 0
              ? m.install_to_inspection.reduce((a: number, b: number) => a + b, 0) / m.install_to_inspection.length
              : null,
          avg_days_inspection_scheduled_to_complete:
            m.inspection_time.length > 0
              ? m.inspection_time.reduce((a: number, b: number) => a + b, 0) / m.inspection_time.length
              : null,
          project_count: m.project_count,
        }));

        return result.sort((a, b) => b.month.localeCompare(a.month));
      }

      case 'monthly-kw': {
        // Try materialized view first
        const { data: mvData, error: mvError } = await supabase
          .from('mv_monthly_kw_permitted')
          .select('*')
          .order('month', { ascending: false })
          .limit(12);

        if (!mvError && mvData && mvData.length > 0) {
          return mvData;
        }

        // Fallback: Calculate from projects table
        const { data: projects } = await supabase
          .from('projects')
          .select('permitting_approved_date, system_size_kw')
          .not('permitting_approved_date', 'is', null)
          .not('system_size_kw', 'is', null);

        if (!projects || projects.length === 0) return [];

        // Group by month
        const monthlyData: Record<string, { total_kw: number; count: number }> = {};

        projects.forEach((p) => {
          if (!p.permitting_approved_date || !p.system_size_kw) return;

          const month = p.permitting_approved_date.substring(0, 7) + '-01';

          if (!monthlyData[month]) {
            monthlyData[month] = { total_kw: 0, count: 0 };
          }

          monthlyData[month].total_kw += p.system_size_kw;
          monthlyData[month].count++;
        });

        const result = Object.entries(monthlyData).map(([month, data]) => ({
          month,
          total_kw: data.total_kw,
          project_count: data.count,
          avg_kw_per_project: data.count > 0 ? data.total_kw / data.count : 0,
        }));

        return result.sort((a, b) => b.month.localeCompare(a.month));
      }

      default:
        return null;
    }
  } catch (error) {
    console.error('Error fetching report data:', error);
    return null;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getStageLabel(stage: number): string {
  const labels: Record<number, string> = {
    1: 'Lead',
    2: 'Contacted',
    3: 'Site Survey',
    4: 'Proposal Sent',
    5: 'Contract Signed',
    6: 'Permits Submitted',
    7: 'Permits Approved',
    8: 'Installation Scheduled',
    9: 'Installation In Progress',
    10: 'Installation Complete',
    11: 'Inspection Passed',
    12: 'PTO Granted',
  };
  return labels[stage] || `Stage ${stage}`;
}
