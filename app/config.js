// Determine if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development';

// Get base URL from environment variable
const baseApiUrl =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

// Helper function to determine if code is running on server or client
const isClient = typeof window !== 'undefined';

export const API_URL = (() => {
  // For local development and testing, allow both localhost and IP access
  if (isDevelopment && isClient) {
    // Check if accessing from localhost
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    // If accessing from localhost, use localhost for API too
    if (isLocalhost) {
      return 'http://localhost:1337/api';
    }
  }

  // Otherwise use the configured API URL
  return `${baseApiUrl}/api`;
})();
