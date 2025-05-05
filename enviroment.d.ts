declare global {
    namespace NodeJS {
      interface ProcessEnv {
        ROBLOX_CLIENT_ID: string;
        ROBLOX_CLIENT_SECRET: string;
        NODE_ENV: 'development' | 'production';
        DATABABASE_URL: string;
      }
    }
  }
  
  // If this file has no import/export statements (i.e. is a script)
  // convert it into a module by adding an empty export statement.
  export {}