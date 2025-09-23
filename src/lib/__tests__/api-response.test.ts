import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { ZodError, z } from 'zod';
import {
  successResponse,
  paginatedResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  rateLimitResponse,
  internalServerErrorResponse,
  handleDatabaseError,
  handleApiError,
  requireAuth,
  checkRateLimit,
  logApiRequest,
  healthCheckResponse,
  ApiError,
} from '../api-response';

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      json: data,
      status: options?.status || 200,
      headers: new Map(),
    })),
  },
}));

// Mock console to test logging
const mockConsole = {
  error: vi.fn(),
  log: vi.fn(),
};
global.console = mockConsole as any;

describe('API Response Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Responses', () => {
    it('should create a success response', () => {
      const data = { id: 1, name: 'Test' };
      const response = successResponse(data, 'Success message');

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data,
          message: 'Success message',
          timestamp: expect.any(String),
        }),
        { status: 200 }
      );
    });

    it('should create a success response with custom status', () => {
      const data = { id: 1 };
      successResponse(data, 'Created', 201);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data,
          message: 'Created',
        }),
        { status: 201 }
      );
    });

    it('should create a paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = { page: 1, limit: 10, total: 25 };

      paginatedResponse(data, pagination);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data,
          pagination: expect.objectContaining({
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3,
            hasNextPage: true,
            hasPreviousPage: false,
          }),
        })
      );
    });
  });

  describe('Error Responses', () => {
    it('should create a basic error response', () => {
      errorResponse('Test error', 400, 'TEST_ERROR');

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Test error',
          code: 'TEST_ERROR',
          timestamp: expect.any(String),
        }),
        { status: 400 }
      );

      expect(mockConsole.error).toHaveBeenCalledWith(
        'API Error [400 - TEST_ERROR]: Test error'
      );
    });

    it('should create an unauthorized response', () => {
      unauthorizedResponse('Custom unauthorized message');

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Custom unauthorized message',
          code: 'UNAUTHORIZED',
        }),
        { status: 401 }
      );
    });

    it('should create a forbidden response', () => {
      forbiddenResponse('Access denied');

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Access denied',
          code: 'FORBIDDEN',
        }),
        { status: 403 }
      );
    });

    it('should create a not found response', () => {
      notFoundResponse('Project');

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Project not found',
          code: 'NOT_FOUND',
        }),
        { status: 404 }
      );
    });

    it('should create a conflict response', () => {
      conflictResponse('Duplicate entry');

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Duplicate entry',
          code: 'CONFLICT',
        }),
        { status: 409 }
      );
    });

    it('should create a rate limit response', () => {
      rateLimitResponse();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
        }),
        { status: 429 }
      );
    });

    it('should create an internal server error response', () => {
      internalServerErrorResponse('Custom server error');

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Custom server error',
          code: 'INTERNAL_SERVER_ERROR',
        }),
        { status: 500 }
      );
    });
  });

  describe('Validation Error Response', () => {
    it('should handle Zod validation errors', () => {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
      });

      try {
        schema.parse({ name: 'A', email: 'invalid' });
      } catch (error) {
        if (error instanceof ZodError) {
          validationErrorResponse(error);

          expect(NextResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
              success: false,
              error: expect.stringContaining('Validation failed'),
              code: 'VALIDATION_ERROR',
            }),
            { status: 400 }
          );
        }
      }
    });
  });

  describe('Database Error Handler', () => {
    it('should handle unique violation error', () => {
      const error = { code: '23505', message: 'duplicate key value' };
      handleDatabaseError(error);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'A record with this data already exists',
          code: 'CONFLICT',
        }),
        { status: 409 }
      );
    });

    it('should handle foreign key violation', () => {
      const error = { code: '23503', message: 'foreign key constraint' };
      handleDatabaseError(error);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Referenced record does not exist',
          code: 'FOREIGN_KEY_VIOLATION',
        }),
        { status: 400 }
      );
    });

    it('should handle not null violation', () => {
      const error = { code: '23502', message: 'null value' };
      handleDatabaseError(error);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Required field is missing',
          code: 'REQUIRED_FIELD_MISSING',
        }),
        { status: 400 }
      );
    });

    it('should handle Supabase RLS policy violation', () => {
      const error = { code: 'PGRST301', message: 'RLS policy' };
      handleDatabaseError(error);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Access denied due to security policy',
          code: 'FORBIDDEN',
        }),
        { status: 403 }
      );
    });

    it('should handle JWT errors', () => {
      const error = { message: 'JWT token expired' };
      handleDatabaseError(error);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid or expired authentication token',
          code: 'UNAUTHORIZED',
        }),
        { status: 401 }
      );
    });

    it('should handle unknown database errors', () => {
      const error = { code: 'UNKNOWN', message: 'Unknown error' };
      handleDatabaseError(error);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Database operation failed',
          code: 'INTERNAL_SERVER_ERROR',
        }),
        { status: 500 }
      );
    });
  });

  describe('Generic API Error Handler', () => {
    it('should handle ApiError instances', () => {
      const error = new ApiError('Custom API error', 422, 'CUSTOM_ERROR');
      handleApiError(error);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Custom API error',
          code: 'CUSTOM_ERROR',
        }),
        { status: 422 }
      );
    });

    it('should handle ZodError instances', () => {
      const schema = z.string().min(5);
      try {
        schema.parse('123');
      } catch (error) {
        handleApiError(error);

        expect(NextResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.stringContaining('Validation failed'),
            code: 'VALIDATION_ERROR',
          }),
          { status: 400 }
        );
      }
    });

    it('should handle standard JavaScript errors', () => {
      const error = new Error('Standard error');
      handleApiError(error);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Standard error',
          code: 'INTERNAL_SERVER_ERROR',
        }),
        { status: 500 }
      );
    });

    it('should handle unknown errors', () => {
      const error = 'string error';
      handleApiError(error);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'An unexpected error occurred',
          code: 'INTERNAL_SERVER_ERROR',
        }),
        { status: 500 }
      );
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const result = checkRateLimit('test-ip', 5, 60000);
      expect(result).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      const identifier = 'test-ip-blocked';

      // Make requests up to the limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit(identifier, 5, 60000);
      }

      // This should be blocked
      const result = checkRateLimit(identifier, 5, 60000);
      expect(result).toBe(false);
    });

    it('should reset after time window', () => {
      const identifier = 'test-ip-reset';

      // Make requests up to limit with very short window
      for (let i = 0; i < 3; i++) {
        checkRateLimit(identifier, 3, 1); // 1ms window
      }

      // Wait for window to expire
      setTimeout(() => {
        const result = checkRateLimit(identifier, 3, 1);
        expect(result).toBe(true);
      }, 10);
    });
  });

  describe('Request Logging', () => {
    it('should log API requests', () => {
      logApiRequest('GET', '/api/test', 'user-123', 150);

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] GET \/api\/test \(User: user-123\) - 150ms/)
      );
    });

    it('should log requests without user ID', () => {
      logApiRequest('POST', '/api/public');

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] POST \/api\/public/)
      );
    });

    it('should log requests without duration', () => {
      logApiRequest('DELETE', '/api/resource', 'user-456');

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] DELETE \/api\/resource \(User: user-456\)/)
      );
    });
  });

  describe('Health Check', () => {
    it('should return health check response', () => {
      healthCheckResponse();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            status: 'healthy',
            timestamp: expect.any(String),
          }),
        }),
        { status: 200 }
      );
    });
  });

  describe('ApiError Class', () => {
    it('should create ApiError with default status', () => {
      const error = new ApiError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('ApiError');
    });

    it('should create ApiError with custom status and code', () => {
      const error = new ApiError('Custom error', 422, 'CUSTOM_CODE');
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('CUSTOM_CODE');
    });
  });
});