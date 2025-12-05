/**
 * QuickBooks Online API Integration
 *
 * Handles OAuth flow, token management, and API calls to QuickBooks Online.
 */

import { supabase } from './supabase';

// QuickBooks OAuth URLs
const QBO_SANDBOX_BASE_URL = 'https://sandbox-quickbooks.api.intuit.com';
const QBO_PRODUCTION_BASE_URL = 'https://quickbooks.api.intuit.com';
const QBO_AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const QBO_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

// Get environment configuration
const getQBOConfig = () => {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI || 'https://crm.quantumsolar.us/api/quickbooks/callback';
  const environment = process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox';

  if (!clientId || !clientSecret) {
    throw new Error('QuickBooks API credentials not configured');
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    environment,
    baseUrl: environment === 'production' ? QBO_PRODUCTION_BASE_URL : QBO_SANDBOX_BASE_URL,
  };
};

// Token types
export interface QBOTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
  realm_id: string;
  access_token_expires_at?: string;
  refresh_token_expires_at?: string;
}

// Generate OAuth authorization URL
export const getAuthorizationUrl = (): string => {
  const config = getQBOConfig();

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting',
    redirect_uri: config.redirectUri,
    state: generateState(),
  });

  return `${QBO_AUTH_URL}?${params.toString()}`;
};

// Generate random state for CSRF protection
const generateState = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

// Exchange authorization code for tokens
export const exchangeCodeForTokens = async (
  code: string,
  realmId: string
): Promise<QBOTokens> => {
  const config = getQBOConfig();

  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  const response = await fetch(QBO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Token exchange error:', error);
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  const tokens = await response.json();

  // Calculate expiration times
  const now = new Date();
  const accessTokenExpiresAt = new Date(now.getTime() + tokens.expires_in * 1000);
  const refreshTokenExpiresAt = new Date(now.getTime() + tokens.x_refresh_token_expires_in * 1000);

  return {
    ...tokens,
    realm_id: realmId,
    access_token_expires_at: accessTokenExpiresAt.toISOString(),
    refresh_token_expires_at: refreshTokenExpiresAt.toISOString(),
  };
};

// Refresh access token
export const refreshAccessToken = async (refreshToken: string): Promise<QBOTokens> => {
  const config = getQBOConfig();

  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  const response = await fetch(QBO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Token refresh error:', error);
    throw new Error(`Failed to refresh token: ${error}`);
  }

  const tokens = await response.json();

  // Calculate expiration times
  const now = new Date();
  const accessTokenExpiresAt = new Date(now.getTime() + tokens.expires_in * 1000);
  const refreshTokenExpiresAt = new Date(now.getTime() + tokens.x_refresh_token_expires_in * 1000);

  return {
    ...tokens,
    access_token_expires_at: accessTokenExpiresAt.toISOString(),
    refresh_token_expires_at: refreshTokenExpiresAt.toISOString(),
  };
};

// Store tokens in database
export const storeTokens = async (tokens: QBOTokens): Promise<void> => {
  // Upsert tokens - we only have one QBO connection per app
  const { error } = await supabase
    .from('quickbooks_tokens')
    .upsert(
      {
        id: 'default',
        realm_id: tokens.realm_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        access_token_expires_at: tokens.access_token_expires_at,
        refresh_token_expires_at: tokens.refresh_token_expires_at,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Error storing tokens:', error);
    throw new Error(`Failed to store tokens: ${error.message}`);
  }
};

// Get stored tokens
export const getStoredTokens = async (): Promise<QBOTokens | null> => {
  const { data, error } = await supabase
    .from('quickbooks_tokens')
    .select('*')
    .eq('id', 'default')
    .single();

  if (error || !data) {
    return null;
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    realm_id: data.realm_id,
    token_type: 'bearer',
    expires_in: 0,
    x_refresh_token_expires_in: 0,
    access_token_expires_at: data.access_token_expires_at,
    refresh_token_expires_at: data.refresh_token_expires_at,
  };
};

// Get valid access token (refreshing if needed)
export const getValidAccessToken = async (): Promise<{
  accessToken: string;
  realmId: string;
} | null> => {
  const tokens = await getStoredTokens();

  if (!tokens) {
    return null;
  }

  // Check if access token is expired
  const now = new Date();
  const expiresAt = new Date(tokens.access_token_expires_at || 0);

  // Refresh if token expires within 5 minutes
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    try {
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      newTokens.realm_id = tokens.realm_id;
      await storeTokens(newTokens);

      return {
        accessToken: newTokens.access_token,
        realmId: tokens.realm_id,
      };
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }

  return {
    accessToken: tokens.access_token,
    realmId: tokens.realm_id,
  };
};

// Check if QBO is connected
export const isQBOConnected = async (): Promise<boolean> => {
  const tokens = await getStoredTokens();

  if (!tokens) {
    return false;
  }

  // Check if refresh token is not expired
  const now = new Date();
  const refreshExpiresAt = new Date(tokens.refresh_token_expires_at || 0);

  return refreshExpiresAt.getTime() > now.getTime();
};

// Disconnect QBO
export const disconnectQBO = async (): Promise<void> => {
  const { error } = await supabase
    .from('quickbooks_tokens')
    .delete()
    .eq('id', 'default');

  if (error) {
    console.error('Error disconnecting QBO:', error);
    throw new Error(`Failed to disconnect QBO: ${error.message}`);
  }
};

// Make API request to QBO
export const qboApiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const auth = await getValidAccessToken();

  if (!auth) {
    throw new Error('QuickBooks not connected');
  }

  const config = getQBOConfig();
  const url = `${config.baseUrl}/v3/company/${auth.realmId}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${auth.accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('QBO API error:', error);
    throw new Error(`QBO API error: ${response.status} - ${error}`);
  }

  return response.json();
};

// Create invoice in QBO
export interface QBOInvoiceData {
  CustomerRef: {
    value: string; // Customer ID in QBO
  };
  Line: Array<{
    DetailType: 'SalesItemLineDetail';
    Amount: number;
    Description?: string;
    SalesItemLineDetail: {
      ItemRef?: { value: string };
      UnitPrice: number;
      Qty: number;
    };
  }>;
  DocNumber?: string;
  TxnDate?: string;
  DueDate?: string;
  CustomerMemo?: { value: string };
}

export const createQBOInvoice = async (invoiceData: QBOInvoiceData) => {
  return qboApiRequest<{ Invoice: Record<string, unknown> }>('/invoice', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  });
};

// Get customer from QBO
export const getQBOCustomer = async (customerId: string) => {
  return qboApiRequest<{ Customer: QBOCustomer }>(`/customer/${customerId}`);
};

// Search for customer by name
export const searchQBOCustomer = async (name: string) => {
  const query = `SELECT * FROM Customer WHERE DisplayName LIKE '%${name}%'`;
  return qboApiRequest<{ QueryResponse: { Customer?: QBOCustomer[] } }>(
    `/query?query=${encodeURIComponent(query)}`
  );
};

// QBO Customer interface
export interface QBOCustomer {
  Id: string;
  DisplayName: string;
  CompanyName?: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: {
    Line1?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
  };
}

// Create customer in QBO
export interface QBOCustomerCreateData {
  DisplayName: string;
  CompanyName?: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: {
    Line1?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
  };
}

export const createQBOCustomer = async (customerData: QBOCustomerCreateData) => {
  return qboApiRequest<{ Customer: QBOCustomer }>('/customer', {
    method: 'POST',
    body: JSON.stringify(customerData),
  });
};

// Find or create customer by display name
export const findOrCreateQBOCustomer = async (
  displayName: string,
  customerData?: Partial<QBOCustomerCreateData>
): Promise<QBOCustomer> => {
  // First, try to find existing customer
  const searchResult = await searchQBOCustomer(displayName);

  if (searchResult.QueryResponse?.Customer && searchResult.QueryResponse.Customer.length > 0) {
    // Find exact match
    const exactMatch = searchResult.QueryResponse.Customer.find(
      c => c.DisplayName.toLowerCase() === displayName.toLowerCase()
    );
    if (exactMatch) {
      return exactMatch;
    }
    // Return first partial match
    return searchResult.QueryResponse.Customer[0];
  }

  // Create new customer if not found
  const newCustomer = await createQBOCustomer({
    DisplayName: displayName,
    ...customerData,
  });

  return newCustomer.Customer;
};

// Get invoice from QBO
export const getQBOInvoice = async (invoiceId: string) => {
  return qboApiRequest<{ Invoice: QBOInvoiceResponse }>(`/invoice/${invoiceId}`);
};

// QBO Invoice Response interface
export interface QBOInvoiceResponse {
  Id: string;
  DocNumber?: string;
  TxnDate?: string;
  DueDate?: string;
  TotalAmt: number;
  Balance: number;
  CustomerRef: { value: string; name: string };
  Line: Array<{
    DetailType: string;
    Amount: number;
    Description?: string;
    SalesItemLineDetail?: {
      UnitPrice: number;
      Qty: number;
    };
  }>;
}

// Log sync to database
export const logQBOSync = async (
  invoiceId: string,
  action: 'create' | 'update' | 'payment',
  status: 'success' | 'error',
  qboInvoiceId?: string,
  errorMessage?: string
): Promise<void> => {
  const { error } = await supabase.from('quickbooks_sync_log').insert({
    invoice_id: invoiceId,
    action,
    status,
    qbo_invoice_id: qboInvoiceId,
    error_message: errorMessage,
    synced_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error logging QBO sync:', error);
  }
};
