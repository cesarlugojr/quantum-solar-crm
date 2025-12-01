/**
 * CRM AHJ (Authority Having Jurisdiction) API Route
 *
 * Manages AHJ records for tracking permitting authorities and their requirements.
 * Used for project permitting and inspection tracking across different jurisdictions.
 *
 * Features:
 * - CRUD operations for AHJ records
 * - State and county filtering
 * - Active/inactive status management
 * - Requirement tracking (tech on-site, inspections, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
);

// Validation schema for AHJ data
const AHJSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  state: z.string().length(2, 'State must be 2-letter code'),
  county: z.string().optional(),
  city: z.string().optional(),

  // Contact Information
  building_department_number: z.string().optional(),
  building_department_phone: z.string().optional(),
  building_department_email: z.string().email().optional().or(z.literal('')),
  building_department_website: z.string().url().optional().or(z.literal('')),

  // Inspector Information
  inspector_name: z.string().optional(),
  inspector_number: z.string().optional(),
  inspector_phone: z.string().optional(),
  inspector_email: z.string().email().optional().or(z.literal('')),

  // Requirements
  requires_tech_on_site: z.boolean().default(false),
  requires_rough_inspection: z.boolean().default(false),
  requires_final_inspection: z.boolean().default(true),
  requires_electrical_inspection: z.boolean().default(true),

  // Permitting Details
  typical_permit_turnaround_days: z.number().int().positive().optional(),
  typical_inspection_turnaround_days: z.number().int().positive().optional(),
  permit_application_url: z.string().url().optional().or(z.literal('')),
  online_permitting_available: z.boolean().default(false),

  // Notes
  special_requirements: z.string().optional(),
  notes: z.string().optional(),

  // Status
  active: z.boolean().default(true),
});

const AHJUpdateSchema = AHJSchema.partial().extend({
  id: z.string().uuid(),
});

/**
 * GET - Fetch all AHJs or a single AHJ by ID
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ahjId = searchParams.get('id');
    const state = searchParams.get('state');
    const county = searchParams.get('county');
    const activeOnly = searchParams.get('active') === 'true';

    if (ahjId) {
      // Get single AHJ
      const { data: ahj, error } = await supabase
        .from('ahj')
        .select('*')
        .eq('id', ahjId)
        .single();

      if (error) {
        console.error('Error fetching AHJ:', error);
        return NextResponse.json({ error: 'AHJ not found' }, { status: 404 });
      }

      return NextResponse.json({ ahj });
    } else {
      // Get all AHJs with optional filters
      let query = supabase
        .from('ahj')
        .select('*')
        .order('state', { ascending: true })
        .order('name', { ascending: true });

      if (state) {
        query = query.eq('state', state.toUpperCase());
      }

      if (county) {
        query = query.eq('county', county);
      }

      if (activeOnly) {
        query = query.eq('active', true);
      }

      const { data: ahjs, error } = await query;

      if (error) {
        console.error('Error fetching AHJs:', error);
        return NextResponse.json({ error: 'Failed to fetch AHJs' }, { status: 500 });
      }

      return NextResponse.json({ data: ahjs || [] });
    }
  } catch (error) {
    console.error('Error in CRM AHJ GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new AHJ
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request data
    const validatedData = AHJSchema.parse(body);

    // Create AHJ
    const { data: ahj, error } = await supabase
      .from('ahj')
      .insert({
        ...validatedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating AHJ:', error);
      return NextResponse.json(
        { error: 'Failed to create AHJ' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ahj,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in CRM AHJ POST API:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update an existing AHJ
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request data
    const validatedData = AHJUpdateSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Update AHJ
    const { data: ahj, error } = await supabase
      .from('ahj')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating AHJ:', error);
      return NextResponse.json(
        { error: 'Failed to update AHJ' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ahj,
    });
  } catch (error) {
    console.error('Error in CRM AHJ PUT API:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete an AHJ (soft delete by setting active = false)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ahjId = searchParams.get('id');
    const hardDelete = searchParams.get('hard') === 'true';

    if (!ahjId) {
      return NextResponse.json(
        { error: 'AHJ ID is required' },
        { status: 400 }
      );
    }

    // Check if AHJ is in use by any projects
    const { count } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('ahj_id', ahjId);

    if (count && count > 0 && hardDelete) {
      return NextResponse.json(
        {
          error: 'Cannot delete AHJ',
          message: `This AHJ is currently used by ${count} project(s). Consider deactivating instead.`,
        },
        { status: 400 }
      );
    }

    if (hardDelete && (!count || count === 0)) {
      // Hard delete if not in use
      const { error } = await supabase
        .from('ahj')
        .delete()
        .eq('id', ahjId);

      if (error) {
        console.error('Error deleting AHJ:', error);
        return NextResponse.json(
          { error: 'Failed to delete AHJ' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'AHJ deleted successfully',
      });
    } else {
      // Soft delete (deactivate)
      const { error } = await supabase
        .from('ahj')
        .update({
          active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ahjId);

      if (error) {
        console.error('Error deactivating AHJ:', error);
        return NextResponse.json(
          { error: 'Failed to deactivate AHJ' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'AHJ deactivated successfully',
      });
    }
  } catch (error) {
    console.error('Error in CRM AHJ DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
