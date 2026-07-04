import { expect, test } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';
import { config } from '../src/config/config';
import { Ui } from '../src/ui/ui';

test('authenticate review user', async ({ page }) => {
  const ui = new Ui(page);

  await ui.loginPage.navigate();
  await page.waitForLoadState('networkidle');
  await ui.loginPage.fillCredentials();
  await expect(ui.loginPage.emailInput).toHaveValue(config.email);
  await expect(ui.loginPage.passwordInput).toHaveValue(config.password);
  await ui.loginPage.submit();
  await expect(page).not.toHaveURL(/\/authentication/i, { timeout: 30_000 });

  await fs.mkdir(path.dirname(config.authStatePath), { recursive: true });
  await page.context().storageState({ path: config.authStatePath });
});
