// API Configuration and utilities
// In production, frontend and backend are served from the same domain
const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

export const API_ENDPOINTS = {
  // Auth endpoints (no /api prefix)
  GOOGLE_AUTH: `${API_BASE_URL}/auth/google`,
  GOOGLE_CALLBACK: `${API_BASE_URL}/auth/google/oauth/callback`,
  FACEBOOK_AUTH: `${API_BASE_URL}/auth/facebook`,
  FACEBOOK_CALLBACK: `${API_BASE_URL}/auth/facebook/oauth/callback`,
  CONNECTIONS: (email: string) => `${API_BASE_URL}/auth/connections/${encodeURIComponent(email)}`,
  DISCONNECT: (email: string, platform: string) =>
    `${API_BASE_URL}/auth/disconnect/${encodeURIComponent(email)}/${platform}`,
  FORCE_FRESH_CONSENT: (email: string) =>
    `${API_BASE_URL}/auth/force-fresh-consent/${encodeURIComponent(email)}`,

  // Business profile endpoints (no /api prefix - these are auth routes)
  BUSINESS_ACCOUNTS: (email: string) =>
    `${API_BASE_URL}/auth/business-accounts/${encodeURIComponent(email)}`,
  BUSINESS_PROFILE: (email: string, accountName: string) =>
    `${API_BASE_URL}/auth/business-profile/${encodeURIComponent(email)}/${encodeURIComponent(accountName)}`,

  // Facebook endpoints (no /api prefix - these are auth routes)
  FACEBOOK_PAGES: (email: string) =>
    `${API_BASE_URL}/auth/facebook/pages/${encodeURIComponent(email)}`,

  // Debug endpoints (no /api prefix - these are auth routes)
  DEBUG_GOOGLE: `${API_BASE_URL}/auth/debug-google`,
  DEBUG_FACEBOOK: `${API_BASE_URL}/auth/debug/facebook`,
  DEBUG_FACEBOOK_PAGES: (email: string) =>
    `${API_BASE_URL}/auth/debug/facebook-pages/${encodeURIComponent(email)}`,
  TEST_TOKEN_REFRESH: `${API_BASE_URL}/auth/test-token-refresh`,
  VALIDATE_ENVIRONMENT: `${API_BASE_URL}/auth/validate-environment`,
  OAUTH_URL: `${API_BASE_URL}/auth/oauth-url`,
  DEBUG_TOKENS_ENHANCED: (email: string) =>
    `${API_BASE_URL}/auth/debug-tokens-enhanced/${encodeURIComponent(email)}`,
};

// Enhanced fetch wrapper with error handling
export async function apiFetch(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return response;
  } catch (error) {
    console.error(`API Request Failed: ${url}`, error);
    throw error;
  }
}

// JSON fetch wrapper
export async function apiFetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await apiFetch(url, options);
  return response.json();
}

// Health check utility
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export default API_ENDPOINTS;
