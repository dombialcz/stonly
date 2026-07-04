import fs from 'node:fs';
import path from 'node:path';

type RawConfig = {
  name: string;
  app: {
    baseUrl: string;
    loginUrl: string;
    userSettingsPath: string;
  };
  auth: {
    email?: string;
    emailBase64?: string;
    password?: string;
    passwordBase64?: string;
    storageState: string;
  };
  testData?: Record<string, string>;
};

const selectedConfig = process.env.STONLY_CONFIG ?? 'review';
const configPath = path.resolve(process.cwd(), 'config', `${selectedConfig}.json`);

const readConfig = (): RawConfig => {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  return JSON.parse(fs.readFileSync(configPath, 'utf8')) as RawConfig;
};

const decodeBase64 = (value: string): string => Buffer.from(value, 'base64').toString('utf8');

const credential = (plainValue: string | undefined, encodedValue: string | undefined, name: string): string => {
  if (plainValue) {
    return plainValue;
  }

  if (encodedValue) {
    return decodeBase64(encodedValue);
  }

  throw new Error(`Missing ${name} or ${name}Base64 in ${configPath}`);
};

const normalizeBaseUrl = (value: string): string => value.replace(/\/$/, '');

const rawConfig = readConfig();

export const config = {
  name: rawConfig.name,
  baseUrl: normalizeBaseUrl(rawConfig.app.baseUrl),
  loginUrl: rawConfig.app.loginUrl,
  userSettingsPath: rawConfig.app.userSettingsPath,
  email: credential(rawConfig.auth.email, rawConfig.auth.emailBase64, 'email'),
  password: credential(rawConfig.auth.password, rawConfig.auth.passwordBase64, 'password'),
  authStatePath: rawConfig.auth.storageState,
  testData: rawConfig.testData ?? {},
};

export const appUrl = (pathOrUrl: string): string => {
  if (/^https?:\/\//.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl, `${config.baseUrl}/`).toString();
};
