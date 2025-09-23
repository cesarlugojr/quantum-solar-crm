import { describe, it, expect } from 'vitest';
import {
  projectSchema,
  projectUpdateSchema,
  contactSubmissionSchema,
  validateRequestBody,
  validateSearchParams,
  projectFiltersSchema,
  timeRangeSchema,
  solarSystemSizeSchema,
  solarProductionSchema,
  projectValueSchema,
  solarStageSchema,
  isValidUUID,
  isValidEmail,
  isValidPhoneNumber,
  sanitizeString,
  normalizePhoneNumber,
} from '../validations';

describe('Project Schema Validation', () => {
  it('should validate a valid project', () => {
    const validProject = {
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      customer_phone: '555-123-4567',
      address: '123 Main St, Anytown, ST 12345',
      system_size_kw: 10.5,
      estimated_annual_production_kwh: 12000,
      project_value: 25000,
      assigned_project_manager: 'Jane Smith',
      assigned_installer: 'Bob Wilson',
      notes: 'Customer wants installation in spring'
    };

    const result = projectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it('should reject project with invalid customer name', () => {
    const invalidProject = {
      customer_name: 'A', // Too short
      address: '123 Main St'
    };

    const result = projectSchema.safeParse(invalidProject);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at least 2 characters');
    }
  });

  it('should reject project with invalid email', () => {
    const invalidProject = {
      customer_name: 'John Doe',
      customer_email: 'invalid-email',
      address: '123 Main St'
    };

    const result = projectSchema.safeParse(invalidProject);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Invalid email');
    }
  });

  it('should accept empty optional fields', () => {
    const minimalProject = {
      customer_name: 'John Doe',
      address: '123 Main St',
      customer_email: '',
      customer_phone: '',
      notes: ''
    };

    const result = projectSchema.safeParse(minimalProject);
    expect(result.success).toBe(true);
  });
});

describe('Project Update Schema Validation', () => {
  it('should validate a valid project update', () => {
    const validUpdate = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      action: 'update' as const,
      customer_name: 'John Doe Updated',
      notes: 'Updated notes'
    };

    const result = projectUpdateSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it('should validate stage advancement', () => {
    const stageUpdate = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      action: 'advance_stage' as const,
      new_stage: 5,
      notes: 'Moving to installation phase'
    };

    const result = projectUpdateSchema.safeParse(stageUpdate);
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const invalidUpdate = {
      id: 'not-a-uuid',
      action: 'update' as const
    };

    const result = projectUpdateSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });

  it('should reject invalid stage number', () => {
    const invalidStage = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      action: 'advance_stage' as const,
      new_stage: 15 // Invalid - max is 12
    };

    const result = projectUpdateSchema.safeParse(invalidStage);
    expect(result.success).toBe(false);
  });
});

describe('Contact Submission Schema Validation', () => {
  it('should validate a complete contact submission', () => {
    const validSubmission = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '555-987-6543',
      message: 'Interested in solar installation',
      source_campaign: 'google-ads',
      session_id: 'session-123',
      tcpa_consent: true,
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'solar-leads'
    };

    const result = contactSubmissionSchema.safeParse(validSubmission);
    expect(result.success).toBe(true);
  });

  it('should require name and email', () => {
    const incompleteSubmission = {
      phone: '555-123-4567'
    };

    const result = contactSubmissionSchema.safeParse(incompleteSubmission);
    expect(result.success).toBe(false);
  });

  it('should validate with minimal required fields', () => {
    const minimalSubmission = {
      name: 'John Smith',
      email: 'john@example.com'
    };

    const result = contactSubmissionSchema.safeParse(minimalSubmission);
    expect(result.success).toBe(true);
  });
});

describe('Solar Industry Specific Validations', () => {
  describe('Solar System Size', () => {
    it('should validate reasonable system sizes', () => {
      expect(solarSystemSizeSchema.safeParse({ system_size_kw: 5.5 }).success).toBe(true);
      expect(solarSystemSizeSchema.safeParse({ system_size_kw: 10.0 }).success).toBe(true);
      expect(solarSystemSizeSchema.safeParse({ system_size_kw: 25.5 }).success).toBe(true);
    });

    it('should reject invalid system sizes', () => {
      expect(solarSystemSizeSchema.safeParse({ system_size_kw: 0 }).success).toBe(false);
      expect(solarSystemSizeSchema.safeParse({ system_size_kw: -5 }).success).toBe(false);
      expect(solarSystemSizeSchema.safeParse({ system_size_kw: 1500 }).success).toBe(false);
    });
  });

  describe('Solar Production', () => {
    it('should validate reasonable production estimates', () => {
      expect(solarProductionSchema.safeParse({ estimated_annual_production_kwh: 12000 }).success).toBe(true);
      expect(solarProductionSchema.safeParse({ estimated_annual_production_kwh: 25000 }).success).toBe(true);
    });

    it('should reject invalid production estimates', () => {
      expect(solarProductionSchema.safeParse({ estimated_annual_production_kwh: 50 }).success).toBe(false);
      expect(solarProductionSchema.safeParse({ estimated_annual_production_kwh: 3000000 }).success).toBe(false);
      expect(solarProductionSchema.safeParse({ estimated_annual_production_kwh: 12000.5 }).success).toBe(false);
    });
  });

  describe('Project Value', () => {
    it('should validate reasonable project values', () => {
      expect(projectValueSchema.safeParse({ project_value: 15000 }).success).toBe(true);
      expect(projectValueSchema.safeParse({ project_value: 35000 }).success).toBe(true);
    });

    it('should reject invalid project values', () => {
      expect(projectValueSchema.safeParse({ project_value: 500 }).success).toBe(false);
      expect(projectValueSchema.safeParse({ project_value: 600000 }).success).toBe(false);
      expect(projectValueSchema.safeParse({ project_value: 15050 }).success).toBe(false); // Not rounded to $100
    });
  });

  describe('Solar Stages', () => {
    it('should validate all valid solar stages', () => {
      const validStages = [
        'lead', 'contacted', 'qualified', 'proposal_sent', 'contract_signed',
        'permits_submitted', 'permits_approved', 'installation_scheduled',
        'installation_complete', 'inspection_passed', 'pto_granted'
      ];

      validStages.forEach(stage => {
        expect(solarStageSchema.safeParse(stage).success).toBe(true);
      });
    });

    it('should reject invalid solar stages', () => {
      expect(solarStageSchema.safeParse('invalid_stage').success).toBe(false);
      expect(solarStageSchema.safeParse('completed').success).toBe(false);
    });
  });
});

describe('Query Parameter Validation', () => {
  it('should validate project filters', () => {
    const searchParams = new URLSearchParams({
      status: 'active',
      page: '2',
      limit: '10',
      search: 'Solar'
    });

    const result = validateSearchParams(projectFiltersSchema, searchParams);
    expect(result.status).toBe('active');
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.search).toBe('Solar');
  });

  it('should apply default values', () => {
    const searchParams = new URLSearchParams();
    const result = validateSearchParams(projectFiltersSchema, searchParams);

    expect(result.status).toBe('all');
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it('should validate time range parameters', () => {
    const searchParams = new URLSearchParams({ timeRange: '90d' });
    const result = validateSearchParams(timeRangeSchema, searchParams);

    expect(result.timeRange).toBe('90d');
  });
});

describe('Validation Helper Functions', () => {
  describe('validateRequestBody', () => {
    it('should return success for valid data', () => {
      const schema = projectSchema;
      const validData = {
        customer_name: 'John Doe',
        address: '123 Main St'
      };

      const result = validateRequestBody(schema)(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.customer_name).toBe('John Doe');
      }
    });

    it('should return error for invalid data', () => {
      const schema = projectSchema;
      const invalidData = {
        customer_name: 'A', // Too short
        address: '123 Main St'
      };

      const result = validateRequestBody(schema)(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('at least 2 characters');
      }
    });
  });
});

describe('Utility Functions', () => {
  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should validate US phone numbers', () => {
      expect(isValidPhoneNumber('555-123-4567')).toBe(true);
      expect(isValidPhoneNumber('(555) 123-4567')).toBe(true);
      expect(isValidPhoneNumber('15551234567')).toBe(true);
      expect(isValidPhoneNumber('5551234567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhoneNumber('123')).toBe(false);
      expect(isValidPhoneNumber('555-123-456')).toBe(false);
      expect(isValidPhoneNumber('not-a-phone')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script');
      expect(sanitizeString('Hello "World"')).toBe('Hello World');
      expect(sanitizeString("It's a test")).toBe('Its a test');
    });

    it('should trim and limit length', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
      const longString = 'a'.repeat(1500);
      expect(sanitizeString(longString).length).toBe(1000);
    });
  });

  describe('normalizePhoneNumber', () => {
    it('should add country code to 10-digit numbers', () => {
      expect(normalizePhoneNumber('5551234567')).toBe('+15551234567');
      expect(normalizePhoneNumber('555-123-4567')).toBe('+15551234567');
      expect(normalizePhoneNumber('(555) 123-4567')).toBe('+15551234567');
    });

    it('should handle 11-digit numbers starting with 1', () => {
      expect(normalizePhoneNumber('15551234567')).toBe('+15551234567');
      expect(normalizePhoneNumber('1-555-123-4567')).toBe('+15551234567');
    });

    it('should return original for unclear formats', () => {
      expect(normalizePhoneNumber('123')).toBe('123');
      expect(normalizePhoneNumber('+44 20 1234 5678')).toBe('+44 20 1234 5678');
    });
  });
});