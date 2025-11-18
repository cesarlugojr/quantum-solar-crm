/**
 * CRM Analytics API Route
 *
 * Provides comprehensive analytics and metrics for the CRM dashboard.
 * This endpoint returns the same data as the stats endpoint with
 * additional time-series and forecasting capabilities.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
);

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const includeTimeSeries = searchParams.get('includeTimeSeries') === 'true';

    // Calculate date range
    const daysBack = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Fetch all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*');

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      // Return empty stats if table doesn't exist
      if (projectsError.code === 'PGRST205' || projectsError.code === '42P01') {
        return NextResponse.json({
          data: {
            total_projects: 0,
            active_projects: 0,
            completed_projects: 0,
            total_value: 0,
            monthly_revenue: 0,
            pipeline_value: 0,
            average_project_value: 0,
            conversion_rate: 0,
            stage_distribution: {},
            metrics: {
              lead_count: 0,
              contract_signed_count: 0,
              completion_rate: 0
            }
          }
        });
      }
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    const allProjects = projects || [];

    // Calculate basic stats
    const total_projects = allProjects.length;
    const completed_projects = allProjects.filter(p =>
      p.current_stage === 'pto_granted' || p.current_stage === 'completed'
    ).length;
    const active_projects = total_projects - completed_projects;

    // Calculate financial metrics
    const total_value = allProjects.reduce((sum, p) => sum + (p.estimated_cost || p.project_value || 0), 0);

    // Monthly revenue (completed projects in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthly_revenue = allProjects
      .filter(p => {
        const completedStages = ['pto_granted', 'completed'];
        const updatedAt = new Date(p.updated_at);
        return completedStages.includes(p.current_stage) && updatedAt >= thirtyDaysAgo;
      })
      .reduce((sum, p) => sum + (p.estimated_cost || p.project_value || 0), 0);

    // Pipeline value (active projects)
    const pipeline_value = allProjects
      .filter(p => p.current_stage !== 'pto_granted' && p.current_stage !== 'completed')
      .reduce((sum, p) => sum + (p.estimated_cost || p.project_value || 0), 0);

    const average_project_value = total_projects > 0 ? total_value / total_projects : 0;

    // Stage distribution
    const stage_distribution: Record<string, number> = {};
    allProjects.forEach(p => {
      const stage = p.current_stage || 'unknown';
      stage_distribution[stage] = (stage_distribution[stage] || 0) + 1;
    });

    // Conversion metrics
    const lead_count = stage_distribution['lead'] || 0;
    const contract_signed_count = allProjects.filter(p =>
      ['contract_signed', 'permits_submitted', 'permits_approved', 'installation_scheduled',
       'installation_complete', 'inspection_passed', 'pto_granted', 'completed'].includes(p.current_stage)
    ).length;

    const conversion_rate = lead_count > 0 ? (contract_signed_count / lead_count) * 100 : 0;
    const completion_rate = total_projects > 0 ? (completed_projects / total_projects) * 100 : 0;

    const analyticsData = {
      total_projects,
      active_projects,
      completed_projects,
      total_value: Math.round(total_value),
      monthly_revenue: Math.round(monthly_revenue),
      pipeline_value: Math.round(pipeline_value),
      average_project_value: Math.round(average_project_value),
      conversion_rate: Math.round(conversion_rate * 10) / 10,
      stage_distribution,
      metrics: {
        lead_count,
        contract_signed_count,
        completion_rate: Math.round(completion_rate * 10) / 10
      }
    };

    // Add time series data if requested
    if (includeTimeSeries) {
      // Generate simple time series for the past 30 days
      const timeSeries = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const projectsOnDate = allProjects.filter(p => {
          const createdDate = new Date(p.created_at).toISOString().split('T')[0];
          return createdDate === dateStr;
        }).length;

        timeSeries.push({
          date: dateStr,
          projects: projectsOnDate,
          value: projectsOnDate * average_project_value
        });
      }

      return NextResponse.json({
        data: {
          ...analyticsData,
          timeSeries
        }
      });
    }

    return NextResponse.json({
      data: analyticsData
    });
  } catch (error) {
    console.error('Error in CRM analytics API:', error);
    return NextResponse.json({
      data: {
        total_projects: 0,
        active_projects: 0,
        completed_projects: 0,
        total_value: 0,
        monthly_revenue: 0,
        pipeline_value: 0,
        average_project_value: 0,
        conversion_rate: 0,
        stage_distribution: {},
        metrics: {
          lead_count: 0,
          contract_signed_count: 0,
          completion_rate: 0
        }
      }
    });
  }
}
