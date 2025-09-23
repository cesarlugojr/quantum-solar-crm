/**
 * Facebook Pixel Tracking Utilities with Conversions API Support
 * 
 * Provides hybrid client/server-side tracking with enhanced customer matching,
 * event deduplication, and Dataset Quality API support.
 * 
 * Features:
 * - Hybrid client + server-side event tracking
 * - Enhanced customer information matching
 * - Event deduplication between client and server
 * - SHA-256 hashing for privacy compliance
 * - Dataset Quality API integration
 */

declare global {
  interface Window {
    fbq?: (action: string, event: string, parameters?: Record<string, string | number | boolean>) => void;
  }
}

// Customer information interface for enhanced matching
export interface CustomerInfo {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// Enhanced event parameters interface
export interface EnhancedEventParams {
  contentName?: string;
  contentCategory?: string;
  value?: number;
  currency?: string;
  customerInfo?: CustomerInfo;
  sourceUrl?: string;
}

/**
 * Generate unique event ID for deduplication
 * Uses timestamp + random string for uniqueness
 */
function generateEventId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `evt_${timestamp}_${random}`;
}

/**
 * Get Facebook browser cookies for enhanced matching
 */
function getFacebookCookies(): { fbc?: string; fbp?: string } {
  if (typeof window === 'undefined') return {};
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return {
    fbc: cookies._fbc,
    fbp: cookies._fbp
  };
}

/**
 * Send event to server-side Conversions API
 */
async function sendServerSideEvent(
  eventName: string,
  params: EnhancedEventParams,
  eventId: string
): Promise<void> {
  try {
    const { fbc, fbp } = getFacebookCookies();
    
    const payload = {
      eventName,
      customerInfo: params.customerInfo || {},
      customData: {
        contentName: params.contentName,
        contentCategory: params.contentCategory,
        value: params.value,
        currency: params.currency
      },
      eventId,
      sourceUrl: params.sourceUrl || window.location.href,
      fbc,
      fbp
    };

    const response = await fetch('/api/facebook-conversions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Server-side tracking failed: ${error.details || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('Facebook Conversions API: Server-side event sent successfully', {
      eventId,
      eventsReceived: result.eventsReceived,
      fbtrace_id: result.fbtrace_id
    });
  } catch (error) {
    console.error('Facebook Conversions API: Server-side tracking error', error);
    // Don't throw - allow client-side tracking to continue
  }
}

/**
 * Track a Facebook pixel event with hybrid client/server approach
 * @param event - The event name to track
 * @param parameters - Event parameters including customer info
 */
export const trackFBPixelEvent = (
  event: string, 
  parameters?: Record<string, string | number | boolean>
): void => {
  try {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', event, parameters);
      console.log(`Facebook Pixel: Client-side tracked ${event}`, parameters);
    } else {
      console.warn('Facebook Pixel: fbq not available');
    }
  } catch (error) {
    console.error('Facebook Pixel: Client-side error tracking event', error);
  }
};

/**
 * Enhanced lead tracking with hybrid client/server approach
 * @param contentName - Description of what generated the lead
 * @param customerInfo - Customer information for enhanced matching
 * @param value - Optional value for the conversion
 * @param contentCategory - Category classification
 */
export const trackLeadEvent = async (
  contentName: string,
  customerInfo?: CustomerInfo,
  value: number = 1,
  contentCategory: string = 'solar_lead'
): Promise<void> => {
  const eventId = generateEventId();
  
  const clientParams = {
    content_name: contentName,
    value,
    currency: 'USD',
    event_id: eventId // For deduplication
  };

  const serverParams: EnhancedEventParams = {
    contentName,
    contentCategory,
    value,
    currency: 'USD',
    customerInfo
  };

  // Send client-side event first (immediate)
  trackFBPixelEvent('Lead', clientParams);

  // Send server-side event (enhanced with customer data)
  if (customerInfo && Object.keys(customerInfo).length > 0) {
    await sendServerSideEvent('Lead', serverParams, eventId);
  }
};

/**
 * Enhanced conversion tracking for qualified leads
 * @param source - Lead source identifier
 * @param customerInfo - Customer information for enhanced matching
 * @param qualificationData - Additional qualification parameters
 */
// Interface for qualification data
export interface QualificationData {
  creditScore?: number;
  shading?: string;
  homeowner?: boolean;
  utilityCompany?: string;
  averageMonthlyBill?: string;
  [key: string]: string | number | boolean | undefined;
}

export const trackQualifiedLead = async (
  source: string,
  customerInfo?: CustomerInfo,
  qualificationData?: QualificationData
): Promise<void> => {
  await trackLeadEvent(
    `${source} - Qualified Lead Conversion`,
    customerInfo,
    1,
    'qualified_lead'
  );

  // Track additional conversion event for higher-value qualified leads
  if (qualificationData?.creditScore && qualificationData.creditScore >= 650) {
    await trackLeadEvent(
      `${source} - High Quality Lead`,
      customerInfo,
      5, // Higher value for better credit scores
      'high_quality_lead'
    );
  }
};

/**
 * Track a page view event
 */
export const trackPageView = (): void => {
  trackFBPixelEvent('PageView');
};

/**
 * Track a custom event with optional server-side enhancement
 * @param eventName - Custom event name
 * @param parameters - Event parameters
 * @param customerInfo - Optional customer info for server-side enhancement
 */
export const trackCustomEvent = async (
  eventName: string, 
  parameters?: Record<string, string | number | boolean>,
  customerInfo?: CustomerInfo
): Promise<void> => {
  const eventId = generateEventId();
  
  // Client-side tracking
  trackFBPixelEvent(eventName, { ...parameters, event_id: eventId });
  
  // Server-side enhancement if customer info provided
  if (customerInfo && Object.keys(customerInfo).length > 0) {
    const serverParams: EnhancedEventParams = {
      contentName: parameters?.content_name as string,
      value: parameters?.value as number,
      currency: parameters?.currency as string || 'USD',
      customerInfo
    };
    
    await sendServerSideEvent(eventName, serverParams, eventId);
  }
};
