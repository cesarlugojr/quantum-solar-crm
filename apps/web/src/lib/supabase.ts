/**
 * Supabase Integration Module
 * 
 * Provides Supabase client configuration and contact form submission functionality.
 */

import { createClient } from '@supabase/supabase-js';

// Environment variable validation with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Debug log environment variables (without exposing sensitive data)
console.log('Supabase URL configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key configured:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const isConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!isConfigured) {
  console.warn('Supabase environment variables are missing. Using fallback values for build.');
}

// Database types
export interface ContactSubmission {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  message?: string;
  homeowner: boolean;
  status: 'new' | 'processed' | 'contacted';
  processed_at?: string;
}

// Form data interface
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  message?: string;
  homeowner: boolean;
}

// Response interface
export interface SubmissionResponse {
  success: boolean;
  data?: ContactSubmission;
  error?: string;
}

// Initialize Supabase client with fallback configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Submits contact form data to Supabase
 */
export const submitContactForm = async (formData: ContactFormData): Promise<SubmissionResponse> => {
  console.log('Starting form submission process...');

  try {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      console.log('Validation failed: Missing required fields');
      return {
        success: false,
        error: 'All required fields must be filled out.'
      };
    }

    // Prepare data for insertion
    const submissionData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      message: formData.message?.trim() || null,
      homeowner: formData.homeowner,
      status: 'new'
    };

    console.log('Attempting database insertion...');

    // Attempt to insert the data
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert(submissionData);

    // Log the full response for debugging
    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Database error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });

      return {
        success: false,
        error: 'Failed to submit form. Please try again.'
      };
    }

    console.log('Form submission successful');
    return {
      success: true
    };

  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again later.'
    };
  }
};
