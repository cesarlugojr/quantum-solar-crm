import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get time range parameter
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Calculate date ranges based on timeRange
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Query projects for stats
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id,
        project_value,
        current_stage,
        current_stage_varchar,
        overall_status,
        created_at,
        actual_completion_date
      `);

    if (projectsError) {
      console.error('Failed to fetch projects for stats:', projectsError);
      return NextResponse.json({ error: 'Failed to fetch project stats' }, { status: 500 });
    }

    // Calculate statistics
    const totalProjects = projects?.length || 0;
    const activeProjects = projects?.filter(p => p.overall_status === 'active').length || 0;
    const completedProjects = projects?.filter(p => p.overall_status === 'complete').length || 0;

    // Calculate total value (sum of all project costs)
    const totalValue = projects?.reduce((sum, project) => {
      return sum + (project.project_value || 0);
    }, 0) || 0;

    // Calculate monthly revenue (projects completed this month)
    const monthlyRevenue = projects?.filter(project => {
      if (!project.actual_completion_date) return false;
      const completionDate = new Date(project.actual_completion_date);
      return completionDate >= startOfMonth && completionDate <= endOfMonth;
    }).reduce((sum, project) => {
      return sum + (project.project_value || 0);
    }, 0) || 0;

    // Additional metrics
    const pipelineValue = projects?.filter(p =>
      p.overall_status === 'active' &&
      !['pto_granted'].includes(p.current_stage_varchar)
    ).reduce((sum, project) => {
      return sum + (project.project_value || 0);
    }, 0) || 0;

    // Stage distribution
    const stageDistribution = projects?.reduce((acc, project) => {
      const stage = project.current_stage_varchar || 'unknown';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Calculate conversion rates
    const leadStageProjects = projects?.filter(p => p.current_stage_varchar === 'lead').length || 0;
    const contractSignedProjects = projects?.filter(p =>
      ['contract_signed', 'permits_submitted', 'permits_approved', 'installation_scheduled',
       'installation_complete', 'inspection_passed', 'pto_granted'].includes(p.current_stage_varchar)
    ).length || 0;

    const conversionRate = totalProjects > 0 ? (contractSignedProjects / totalProjects) * 100 : 0;

    // Average project value
    const averageProjectValue = totalProjects > 0 ? totalValue / totalProjects : 0;

    const stats = {
      total_projects: totalProjects,
      active_projects: activeProjects,
      completed_projects: completedProjects,
      total_value: totalValue,
      monthly_revenue: monthlyRevenue,
      pipeline_value: pipelineValue,
      average_project_value: averageProjectValue,
      conversion_rate: conversionRate,
      stage_distribution: stageDistribution,
      metrics: {
        lead_count: leadStageProjects,
        contract_signed_count: contractSignedProjects,
        completion_rate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0
      }
    };

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('CRM stats API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}