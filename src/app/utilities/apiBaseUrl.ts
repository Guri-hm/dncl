export const apiBaseUrl = (() => {
  if (process.env.NEXT_PUBLIC_USE_PROD_API === 'true') {
    return 'https://solopg.com/next/dncl';
  }
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_BASE_PATH || '';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://solopg.com/next/dncl';
})();
