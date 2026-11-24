describe('apiBaseUrl', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  async function loadApiBaseUrl(env: NodeJS.ProcessEnv) {
    process.env = { ...originalEnv, ...env };
    jest.resetModules();
    return (await import('./apiBaseUrl')).apiBaseUrl;
  }

  test('uses the configured API in production', async () => {
    expect(await loadApiBaseUrl({
      NODE_ENV: 'production',
      NEXT_PUBLIC_USE_PROD_API: '',
      NEXT_PUBLIC_API_BASE_URL: 'https://example.com/next/dncl',
    })).toBe('https://example.com/next/dncl');
  });

  test('uses the local base path in development', async () => {
    expect(await loadApiBaseUrl({
      NODE_ENV: 'development',
      NEXT_PUBLIC_USE_PROD_API: '',
      NEXT_PUBLIC_BASE_PATH: '/local',
    })).toBe('/local');
  });

  test('allows development to use the production API', async () => {
    expect(await loadApiBaseUrl({
      NODE_ENV: 'development',
      NEXT_PUBLIC_USE_PROD_API: 'true',
    })).toBe('https://solopg.com/next/dncl');
  });
});
