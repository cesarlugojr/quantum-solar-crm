/**
 * CRM Projects API Route
 * 
 * Manages solar installation projects with comprehensive 12-stage lifecycle tracking.
 * Provides project tracking, status updates, milestone management, and automation.
 * 
 * Features:
 * - 12-stage project lifecycle management
 * - Automated stage progression
 * - SMS notifications with Twilio integration
 * - Photo and document management
 * - Role-based access control
 * - Project timeline tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// import { auth } from '@clerk/nextjs/server';
import {
  projectSchema,
  projectUpdateSchema,
  validateRequestBody,
  validateSearchParams,
  projectFiltersSchema
} from '@/lib/validations';
import {
  successResponse,
  paginatedResponse,
  errorResponse,
  handleApiError,
  handleDatabaseError,
  requireAuth,
  logApiRequest
} from '@/lib/api-response';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
);

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    // Log request
    logApiRequest('GET', '/api/crm/projects', userId, Date.now() - startTime);

    if (projectId) {
      // Get single project - simplified for when tables don't exist yet
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) {
        return handleDatabaseError(projectError);
      }

      if (!project) {
        return errorResponse('Project not found', 404, 'PROJECT_NOT_FOUND');
      }

      // Try to get stage history, but don't fail if tables don't exist
      let stageHistory = [];
      try {
        const { data } = await supabase
          .from('project_stage_history')
          .select('*')
          .eq('project_id', projectId)
          .order('entered_at', { ascending: true });
        stageHistory = data || [];
      } catch {
        console.log('Stage history table not available yet');
      }

      return successResponse({
        project,
        stageHistory
      });
    } else {
      // Validate query parameters
      const filters = validateSearchParams(projectFiltersSchema, searchParams);

      // Get all projects with enhanced data for dashboard
      let query = supabase
        .from('projects')
        .select(`
          id,
          customer_name,
          customer_email,
          customer_phone,
          address,
          system_size_kw,
          estimated_annual_production_kwh,
          project_value,
          current_stage,
          current_stage_varchar,
          overall_status,
          assigned_project_manager,
          assigned_installer,
          created_at,
          updated_at,
          notice_to_proceed_date,
          estimated_completion_date,
          actual_completion_date
        `, { count: 'exact' });

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('overall_status', filters.status);
      }

      if (filters.stage) {
        query = query.eq('current_stage_varchar', filters.stage);
      }

      if (filters.assigned_to) {
        query = query.eq('assigned_project_manager', filters.assigned_to);
      }

      if (filters.search) {
        query = query.or(`customer_name.ilike.%${filters.search}%,custom_id.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const offset = (filters.page - 1) * filters.limit;
      query = query
        .range(offset, offset + filters.limit - 1)
        .order('created_at', { ascending: false });

      const { data: projects, error, count } = await query;

      if (error) {
        return handleDatabaseError(error);
      }

      // Transform data to match ProjectDashboard interface
      const transformedProjects = (projects || []).map(project => ({
        id: project.id,
        custom_id: `QS-P-${new Date(project.created_at).getFullYear()}-${project.id.slice(-6)}`,
        customer_name: project.customer_name,
        customer_email: project.customer_email,
        current_stage: project.current_stage_varchar || 'lead',
        system_size_kw: project.system_size_kw || 0,
        estimated_cost: project.project_value || 0,
        assigned_to: project.assigned_project_manager || 'Unassigned',
        created_at: project.created_at,
        updated_at: project.updated_at
      }));

      return paginatedResponse(transformedProjects, {
        page: filters.page,
        limit: filters.limit,
        total: count || 0
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    // Validate request body
    const body = await request.json();
    const validation = validateRequestBody(projectSchema)(body);

    if (!validation.success) {
      return errorResponse(`Validation failed: ${validation.error}`, 400, 'VALIDATION_ERROR');
    }

    const projectData = validation.data;

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        notice_to_proceed_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (projectError) {
      return handleDatabaseError(projectError);
    }

    // Initialize stage history with stage 1
    const { error } = await supabase
      .from('project_stage_history')
      .insert({
        project_id: project.id,
        stage_id: 1,
        completed_by: userId
      });

    if (error) {
      console.error('Error creating stage history:', error);
    }

    // Send initial SMS notification
    if (projectData.customer_phone) {
      try {
        await fetch(`${request.nextUrl.origin}/api/integrations/twilio`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: projectData.customer_phone,
            message: `Welcome to Quantum Solar, ${projectData.customer_name}! Your solar project has officially started. We'll keep you updated throughout the process. - Quantum Solar`,
            type: 'project_started'
          })
        });
      } catch (smsError) {
        console.error('Error sending welcome SMS:', smsError);
      }
    }

    logApiRequest('POST', '/api/crm/projects', userId, Date.now() - startTime);
    return successResponse(project, 'Project created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    // Validate request body
    const body = await request.json();
    const validation = validateRequestBody(projectUpdateSchema)(body);

    if (!validation.success) {
      return errorResponse(`Validation failed: ${validation.error}`, 400, 'VALIDATION_ERROR');
    }

    const { id, action, ...updateData } = validation.data;

    if (action === 'advance_stage') {
      const { new_stage, notes } = updateData;
      
      if (!new_stage) {
        return errorResponse('New stage is required for stage advancement', 400, 'MISSING_STAGE');
      }

      // Use the database function to advance the stage
      const { error } = await supabase
        .rpc('advance_project_stage', {
          project_uuid: id,
          new_stage_id: new_stage,
          notes_text: notes,
          advanced_by: userId
        });

      if (error) {
        return handleDatabaseError(error);
      }

      // Send SMS notification for stage advancement
      const { data: project } = await supabase
        .from('projects')
        .select('customer_phone, customer_name, current_stage')
        .eq('id', id)
        .single();

      if (project?.customer_phone) {
        try {
          const stageMessages = {
            2: `Hi ${project.customer_name}! Our team will be conducting your site survey and system design. We'll contact you to schedule a convenient time.`,
            3: `Great news ${project.customer_name}! We're submitting your solar permits to the local authorities. This typically takes 2-3 weeks.`,
            4: `Excellent! ${project.customer_name}, your permits have been approved. We're now ordering your solar equipment.`,
            5: `Hi ${project.customer_name}! Your solar equipment has arrived. We're now scheduling your installation.`,
            6: `Exciting news ${project.customer_name}! Your solar installation has been scheduled. We'll call you to confirm the date.`,
            7: `Installation day is here! ${project.customer_name}, our crew is on their way to begin your solar installation.`,
            8: `Fantastic! ${project.customer_name}, your solar system installation is complete. Next step: electrical inspection.`,
            9: `Great news ${project.customer_name}! Your system passed inspection. We're now submitting interconnection paperwork to your utility.`,
            10: `Hi ${project.customer_name}! Your utility interconnection is in process. Almost ready to start saving with solar!`,
            11: `Exciting! ${project.customer_name}, your solar system is being commissioned and tested. Final step coming up!`,
            12: `🎉 Congratulations ${project.customer_name}! Your solar system is now officially online and generating clean energy savings!`
          };

          const message = stageMessages[new_stage as keyof typeof stageMessages];
          if (message) {
            await fetch(`${request.nextUrl.origin}/api/integrations/twilio`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: project.customer_phone,
                message: message,
                type: 'stage_update'
              })
            });
          }
        } catch (smsError) {
          console.error('Error sending stage update SMS:', smsError);
        }
      }

      logApiRequest('PUT', '/api/crm/projects', userId, Date.now() - startTime);
      return successResponse({ stage: new_stage }, 'Project stage advanced successfully');
    } else {
      // Regular project update
      const { error } = await supabase
        .from('projects')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        return handleDatabaseError(error);
      }

      logApiRequest('PUT', '/api/crm/projects', userId, Date.now() - startTime);
      return successResponse({}, 'Project updated successfully');
    }
  } catch (error) {
    return handleApiError(error);
  }
}

// Run project automation - can be called by cron job or manually
export async function PATCH(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId } = authResult;

    // Run the automation function
    const { error } = await supabase
      .rpc('process_project_automation');

    if (error) {
      return handleDatabaseError(error);
    }

    logApiRequest('PATCH', '/api/crm/projects', userId, Date.now() - startTime);
    return successResponse({}, 'Project automation completed successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
