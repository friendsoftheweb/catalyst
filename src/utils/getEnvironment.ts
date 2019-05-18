import fs from 'fs';
import path from 'path';
import getDirectories from './getDirectories';

interface Environment {
  isProduction: boolean;
  isTest: boolean;
  isDevelopment: boolean;
  typeScriptConfigExists: boolean;
  flowConfigExists: boolean;
  devServerHost: string;
  devServerPort: number;
}

export default function getEnvironment(): Environment {
  const directories = getDirectories();
  const env = process.env.NODE_ENV;

  const devServerHost = process.env.DEV_SERVER_HOST || 'localhost';
  const devServerPort = process.env.DEV_SERVER_PORT
    ? parseInt(process.env.DEV_SERVER_PORT)
    : 8080;

  const typeScriptConfigExists = fs.existsSync(
    path.join(directories.project, 'tsconfig.json')
  );

  const flowConfigExists = fs.existsSync(
    path.join(directories.project, '.flowconfig')
  );

  return {
    isProduction: env === 'production',
    isTest: env === 'test',
    isDevelopment: env !== 'production' && env !== 'test',
    typeScriptConfigExists,
    flowConfigExists,
    devServerHost,
    devServerPort
  };
}
