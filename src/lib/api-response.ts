import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Success response helpers
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string
): NextResponse<PaginatedApiResponse<T>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    pagination: {
      ...pagination,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1
    }
  });
}

// Error response helpers
export function errorResponse(
  message: string,
  status: number = 500,
  code?: string
): NextResponse<ApiResponse> {
  console.error(`API Error [${status}${code ? ` - ${code}` : ''}]: ${message}`);

  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

export function validationErrorResponse(error: ZodError): NextResponse<ApiResponse> {
  const message = error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join(', ');

  return errorResponse(`Validation failed: ${message}`, 400, 'VALIDATION_ERROR');
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
  return errorResponse(message, 401, 'UNAUTHORIZED');
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiResponse> {
  return errorResponse(message, 403, 'FORBIDDEN');
}

export function notFoundResponse(resource: string = 'Resource'): NextResponse<ApiResponse> {
  return errorResponse(`${resource} not found`, 404, 'NOT_FOUND');
}

export function conflictResponse(message: string): NextResponse<ApiResponse> {
  return errorResponse(message, 409, 'CONFLICT');
}

export function rateLimitResponse(): NextResponse<ApiResponse> {
  return errorResponse('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
}

export function internalServerErrorResponse(message: string = 'Internal server error'): NextResponse<ApiResponse> {
  return errorResponse(message, 500, 'INTERNAL_SERVER_ERROR');
}

// Database error handler
export function handleDatabaseError(error: { code?: string; message?: string }): NextResponse<ApiResponse> {
  console.error('Database error:', error);

  // PostgreSQL error codes
  switch (error.code) {
    case '23505': // unique_violation
      return conflictResponse('A record with this data already exists');
    case '23503': // foreign_key_violation
      return errorResponse('Referenced record does not exist', 400, 'FOREIGN_KEY_VIOLATION');
    case '23502': // not_null_violation
      return errorResponse('Required field is missing', 400, 'REQUIRED_FIELD_MISSING');
    case '42P01': // undefined_table
      return errorResponse('Database table not found', 500, 'TABLE_NOT_FOUND');
    case 'PGRST116': // Supabase: no rows returned
      return notFoundResponse();
    case 'PGRST301': // Supabase: RLS policy violation
      return forbiddenResponse('Access denied due to security policy');
    default:
      if (error.message?.includes('JWT')) {
        return unauthorizedResponse('Invalid or expired authentication token');
      }
      if (error.message?.includes('RLS')) {
        return forbiddenResponse('Access denied by security policy');
      }
      return internalServerErrorResponse('Database operation failed');
  }
}

// Generic error handler for API routes
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode, error.code);
  }

  if (error instanceof ZodError) {
    return validationErrorResponse(error);
  }

  // Handle Supabase/PostgreSQL errors
  if (error && typeof error === 'object' && 'code' in error) {
    return handleDatabaseError(error);
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    return internalServerErrorResponse(error.message);
  }

  return internalServerErrorResponse('An unexpected error occurred');
}

// Authentication middleware helper
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function requireAuth(request: Request): Promise<{ userId: string } | NextResponse> {
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();

    if (!userId) {
      return unauthorizedResponse('Authentication required');
    }

    return { userId };
  } catch (error) {
    console.error('Authentication error:', error);
    return unauthorizedResponse('Authentication failed');
  }
}

// Rate limiting helper (basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// Request logging helper
export function logApiRequest(
  method: string,
  url: string,
  userId?: string,
  duration?: number
): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${method} ${url}${userId ? ` (User: ${userId})` : ''}${duration ? ` - ${duration}ms` : ''}`;
  console.log(logMessage);
}

// Health check response
export function healthCheckResponse(): NextResponse<ApiResponse<{ status: string; timestamp: string }>> {
  return successResponse({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}

// CORS headers helper
export function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Content Security Policy helper
export function setSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}