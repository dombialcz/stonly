import { expect, test } from '../src/fixtures/test';

test('can read user settings profile controls', async ({ userSettingsPage }) => {
  await expect(userSettingsPage.profileHeading).toBeVisible();
  await expect(userSettingsPage.profileForm.root).toBeVisible();
  await expect(userSettingsPage.profileForm.headline.root).toBeVisible();

  const headline = await userSettingsPage.profileForm.headline.read();

  expect(typeof headline).toBe('string');
});
