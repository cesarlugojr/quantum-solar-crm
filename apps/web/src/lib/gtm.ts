/**
 * Google Tag Manager Tracking Utilities
 * 
 * Provides helper functions for tracking GTM events with proper type safety.
 * Works alongside the existing Facebook Pixel and Google Analytics tracking.
 */

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

/**
 * Push an event to Google Tag Manager's dataLayer
 * @param event - The event name
 * @param parameters - Additional event parameters
 */
export const trackGTMEvent = (
  event: string,
  parameters?: Record<string, string | number | boolean>
): void => {
  try {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event,
        ...parameters
      });
      console.log(`GTM: Tracked ${event}`, parameters);
    } else {
      console.warn('GTM: dataLayer not available');
    }
  } catch (error) {
    console.error('GTM: Error tracking event', error);
  }
};

/**
 * Track a form submission event
 * @param formName - Name/type of the form submitted
 * @param formData - Optional form data to include
 */
export const trackFormSubmission = (
  formName: string,
  formData?: Record<string, string | number | boolean>
): void => {
  trackGTMEvent('form_submit', {
    form_name: formName,
    ...formData
  });
};

/**
 * Track a lead generation event
 * @param leadSource - Source of the lead (contact_form, splash_form, etc.)
 * @param leadValue - Optional value for the lead
 */
export const trackLead = (
  leadSource: string,
  leadValue?: number
): void => {
  trackGTMEvent('generate_lead', {
    lead_source: leadSource,
    value: leadValue || 1,
    currency: 'USD'
  });
};

/**
 * Track a page view event (if needed beyond automatic tracking)
 * @param pagePath - The page path
 * @param pageTitle - The page title
 */
export const trackPageView = (
  pagePath?: string,
  pageTitle?: string
): void => {
  trackGTMEvent('page_view', {
    page_path: pagePath || window.location.pathname,
    page_title: pageTitle || document.title
  });
};

/**
 * Track file upload events
 * @param fileName - Name of the uploaded file
 * @param fileType - Type of file uploaded
 * @param fileSize - Size of the file in bytes
 */
export const trackFileUpload = (
  fileName: string,
  fileType: string,
  fileSize: number
): void => {
  trackGTMEvent('file_upload', {
    file_name: fileName,
    file_type: fileType,
    file_size: fileSize
  });
};

/**
 * Track conversion events for specific campaigns
 * @param campaignName - Name of the campaign
 * @param conversionType - Type of conversion (lead, signup, etc.)
 */
export const trackConversion = (
  campaignName: string,
  conversionType: string
): void => {
  trackGTMEvent('conversion', {
    campaign_name: campaignName,
    conversion_type: conversionType
  });
};
