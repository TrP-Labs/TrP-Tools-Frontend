export interface Config {
  apiBaseUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
  appUrl: string;
}

function getNodeEnv(): Config['nodeEnv'] {
  const env = process.env.NODE_ENV ?? 'development';
  if (env === 'development' || env === 'production' || env === 'test') {
    return env;
  }
  return 'development';
}

function getAppUrl(nodeEnv: Config['nodeEnv']): string {
  return process.env.NEXT_PUBLIC_APP_URL
    || process.env.APP_URL
    || (nodeEnv === 'production' ? 'https://trptools.com' : 'http://localhost:3000');
}

function getApiBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL;

  if (!base) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL (or API_BASE_URL) must be defined.');
  }

  return base.endsWith('/') ? base.slice(0, -1) : base;
}

function buildConfig(): Config {
  const nodeEnv = getNodeEnv();
  return {
    apiBaseUrl: getApiBaseUrl(),
    nodeEnv,
    appUrl: getAppUrl(nodeEnv),
  };
}

export const config = buildConfig();

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test';
