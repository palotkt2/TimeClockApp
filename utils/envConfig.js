// Environment configuration utility

// URLs for different environments
export const PUBLIC_URL =
  process.env.NEXT_PUBLIC_PUBLIC_URL || '192.168.20.245';
export const LOCAL_URL = process.env.NEXT_PUBLIC_LOCAL_URL || 'localhost';

// Port configuration
export const PORT = process.env.NEXT_PUBLIC_PORT || 3000;

// Helper function to get the full URL with protocol
export const getPublicAppUrl = () => `https://${PUBLIC_URL}:${PORT}`;
export const getLocalAppUrl = () => `https://${LOCAL_URL}:${PORT}`; // Changed to HTTPS

// Determine if we're running in a local environment
export const isLocalEnvironment = () =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

// Get the appropriate URL based on environment
export const getAppUrl = () =>
  isLocalEnvironment() ? getLocalAppUrl() : getPublicAppUrl();
