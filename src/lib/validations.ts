import { z } from 'zod';

// Common validation schemas for the CRM system

export const projectSchema = z.object({
  customer_name: z.string().min(2, 'Customer name must be at least 2 characters').max(100, 'Customer name too long'),
  customer_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  customer_phone: z.string().optional().or(z.literal('')),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500, 'Address too long'),
  system_size_kw: z.number().min(0.1, 'System size must be positive').max(1000, 'System size too large').optional(),
  estimated_annual_production_kwh: z.number().min(0, 'Production must be positive').optional(),
  project_value: z.number().min(0, 'Project value must be positive').optional(),
  assigned_project_manager: z.string().optional().or(z.literal('')),
  assigned_installer: z.string().optional().or(z.literal('')),
  notes: z.string().max(2000, 'Notes too long').optional().or(z.literal(''))
});

export const projectUpdateSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
  action: z.enum(['advance_stage', 'update']).optional(),
  new_stage: z.number().min(1, 'Invalid stage').max(12, 'Invalid stage').optional(),
  notes: z.string().max(2000, 'Notes too long').optional().or(z.literal(''))
}).merge(projectSchema.partial());

export const contactSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number too long').optional().or(z.literal('')),
  message: z.string().max(2000, 'Message too long').optional().or(z.literal('')),
  source_campaign: z.string().max(100, 'Campaign name too long').optional().or(z.literal('')),
  session_id: z.string().optional().or(z.literal('')),
  tcpa_consent: z.boolean().optional(),
  utm_source: z.string().max(100, 'UTM source too long').optional().or(z.literal('')),
  utm_medium: z.string().max(100, 'UTM medium too long').optional().or(z.literal('')),
  utm_campaign: z.string().max(100, 'UTM campaign too long').optional().or(z.literal(''))
});

export const stageAdvancementSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  new_stage: z.number().min(1, 'Stage must be between 1-12').max(12, 'Stage must be between 1-12'),
  notes: z.string().max(2000, 'Notes too long').optional().or(z.literal('')),
  completed_by: z.string().uuid('Invalid user ID')
});

export const teamPerformanceSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  period_start: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  period_end: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
  leads_assigned: z.number().min(0, 'Leads assigned must be positive').optional(),
  leads_converted: z.number().min(0, 'Leads converted must be positive').optional(),
  projects_completed: z.number().min(0, 'Projects completed must be positive').optional(),
  revenue_generated: z.number().min(0, 'Revenue must be positive').optional()
});

export const analyticsEventSchema = z.object({
  event_name: z.string().min(1, 'Event name is required').max(100, 'Event name too long'),
  user_id: z.string().uuid('Invalid user ID').optional(),
  session_id: z.string().optional().or(z.literal('')),
  event_data: z.record(z.any()).optional(),
  page_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  referrer_url: z.string().url('Invalid referrer URL').optional().or(z.literal(''))
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be positive').default(1),
  limit: z.coerce.number().min(1, 'Limit must be positive').max(100, 'Limit too large').default(20)
});

export const timeRangeSchema = z.object({
  timeRange: z.enum(['7d', '30d', '90d', '1y']).default('30d')
});

export const projectFiltersSchema = z.object({
  status: z.enum(['all', 'active', 'completed', 'on_hold', 'cancelled']).default('all'),
  stage: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  search: z.string().optional()
}).merge(paginationSchema);

// Validation middleware helper
export function validateRequestBody<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): { success: true; data: T } | { success: false; error: string } => {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map(err => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        return { success: false, error: errorMessage };
      }
      return { success: false, error: 'Validation failed' };
    }
  };
}

// Query parameters validation helper
export function validateSearchParams<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): T {
  const params: Record<string, string | string[]> = {};

  for (const [key, value] of searchParams.entries()) {
    if (params[key]) {
      // Multiple values for the same key
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  }

  return schema.parse(params);
}

// Custom validation functions
export const isValidUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Check if it's 10 or 11 digits (US format)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

export const sanitizeString = (str: string): string => {
  // Basic XSS prevention - remove potentially dangerous characters
  return str
    .replace(/[<>'"]/g, '')
    .trim()
    .slice(0, 1000); // Limit length
};

export const normalizePhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters and add US country code if needed
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return phone; // Return original if format is unclear
};

// Solar industry specific validations
export const solarSystemSizeSchema = z.object({
  system_size_kw: z.number()
    .min(0.1, 'System size too small')
    .max(1000, 'System size too large')
    .refine(val => val % 0.1 === 0, 'System size must be in 0.1kW increments')
});

export const solarProductionSchema = z.object({
  estimated_annual_production_kwh: z.number()
    .min(100, 'Production estimate too low')
    .max(2000000, 'Production estimate too high')
    .refine(val => Number.isInteger(val), 'Production must be a whole number')
});

export const projectValueSchema = z.object({
  project_value: z.number()
    .min(1000, 'Project value too low for solar installation')
    .max(500000, 'Project value exceeds typical residential solar range')
    .refine(val => val % 100 === 0, 'Project value should be rounded to nearest $100')
});

// Stage validation for solar project lifecycle
export const solarStageSchema = z.enum([
  'lead',
  'contacted',
  'qualified',
  'proposal_sent',
  'contract_signed',
  'permits_submitted',
  'permits_approved',
  'installation_scheduled',
  'installation_complete',
  'inspection_passed',
  'pto_granted'
] as const);

export type SolarStage = z.infer<typeof solarStageSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
export type ContactSubmissionData = z.infer<typeof contactSubmissionSchema>;
export type ProjectUpdateData = z.infer<typeof projectUpdateSchema>;
export type AnalyticsEventData = z.infer<typeof analyticsEventSchema>;