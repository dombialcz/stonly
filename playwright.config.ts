import { defineConfig, devices } from '@playwright/test';
import { config } from './src/config/config';

const isCI = !!process.env.CI;
const numberFromEnv = (name: string): number | undefined => {
  const value = process.env[name];

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`${name} must be a number, received: ${value}`);
  }

  return parsed;
};

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: numberFromEnv('PW_RETRIES') ?? (isCI ? 1 : 0),
  workers: numberFromEnv('PW_WORKERS') ?? (isCI ? 1 : undefined),
  expect: {
    timeout: 10_000,
  },
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: config.baseUrl,
    testIdAttribute: 'data-cy',
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: config.authStatePath,
      },
    },
  ],
});
