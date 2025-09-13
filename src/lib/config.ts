// Environment configuration with validation
export interface Config {
  // Database
  databaseUrl: string;
  
  // OAuth
  robloxClientId: string;
  robloxClientSecret: string;
  oauthCallbackUrl: string;
  
  // App
  nodeEnv: 'development' | 'production' | 'test';
  appUrl: string;
}

function validateConfig(): Config {
  const requiredEnvVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    ROBLOX_CLIENT_ID: process.env.ROBLOX_CLIENT_ID,
    ROBLOX_CLIENT_SECRET: process.env.ROBLOX_CLIENT_SECRET,
  };

  // Check for missing environment variables
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  const nodeEnv = process.env.NODE_ENV as 'development' | 'production' | 'test';
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error(`Invalid NODE_ENV: ${nodeEnv}`);
  }

  const appUrl = process.env.APP_URL || 
    (nodeEnv === 'production' ? 'https://trptools.com' : 'http://localhost:3000');

  const oauthCallbackUrl = process.env.OAUTH_CALLBACK_URL || 
    `${appUrl}/login/callback`;

  return {
    databaseUrl: requiredEnvVars.DATABASE_URL!,
    robloxClientId: requiredEnvVars.ROBLOX_CLIENT_ID!,
    robloxClientSecret: requiredEnvVars.ROBLOX_CLIENT_SECRET!,
    nodeEnv,
    appUrl,
    oauthCallbackUrl,
  };
}

// Export validated config
export const config = validateConfig();

// Helper functions
export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test'; 