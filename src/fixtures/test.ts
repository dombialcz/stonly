import { test as base, expect, type Page, type TestType } from '@playwright/test';
import { Ui } from '../ui/ui';
import type { UserSettingsPage } from '../ui/pages/user-settings.page';

type InternalFixtures = {
  _ui: Ui;
  userSettingsPage: UserSettingsPage;
};

type PublicFixtures = {
  userSettingsPage: UserSettingsPage;
};

const internalTest = base.extend<InternalFixtures>({
  _ui: async ({ page }: { page: Page }, use) => {
    await use(new Ui(page));
  },

  userSettingsPage: async ({ _ui }, use) => {
    await _ui.userSettingsPage.navigate();
    await use(_ui.userSettingsPage);
  },
});

const publicTest = internalTest as unknown as TestType<PublicFixtures, Record<string, never>>;

export { expect, publicTest as test };
