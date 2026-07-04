import { test as base, expect, type Page, type TestType } from '@playwright/test';
import { HeadlineApiMock, type HeadlineApiFixtures } from '../api/headline-api-mock';
import { config } from '../config/config';
import type { HeadlineComponent } from '../ui/components/headline.component';
import { Ui } from '../ui/ui';
import type { UserSettingsPage } from '../ui/pages/user-settings.page';

type HeadlineProfile = {
  page: UserSettingsPage;
  headline: HeadlineComponent;
};

type MockedHeadlineProfile = {
  page: UserSettingsPage;
  headline: HeadlineComponent;
  apiMock: HeadlineApiMock;
};

type InternalFixtures = {
  _ui: Ui;
  userSettingsPage: UserSettingsPage;
  headlineProfile: HeadlineProfile;
};

type PublicFixtures = {
  userSettingsPage: UserSettingsPage;
  headlineProfile: HeadlineProfile;
};

const internalTest = base.extend<InternalFixtures>({
  _ui: async ({ page }: { page: Page }, use) => {
    await use(new Ui(page));
  },

  userSettingsPage: async ({ _ui }, use) => {
    await _ui.userSettingsPage.navigate();
    await use(_ui.userSettingsPage);
  },

  headlineProfile: async ({ _ui }, use) => {
    await _ui.userSettingsPage.navigate();
    await saveHeadlineAndWait(_ui.userSettingsPage.profileForm.headline, config.headlineBaseline);

    try {
      await use({
        page: _ui.userSettingsPage,
        headline: _ui.userSettingsPage.profileForm.headline,
      });
    } finally {
      await _ui.userSettingsPage.navigate();
      await saveHeadlineAndWait(_ui.userSettingsPage.profileForm.headline, config.headlineBaseline);
    }
  },
});

const publicTest = internalTest as unknown as TestType<PublicFixtures, Record<string, never>>;

export { expect, publicTest as test };

export const createMockTest = (
  headlineApiFixtures: HeadlineApiFixtures,
): TestType<{ mockedHeadlineProfile: MockedHeadlineProfile }, Record<string, never>> => {
  const mockTest = internalTest.extend<{ mockedHeadlineProfile: MockedHeadlineProfile }>({
    mockedHeadlineProfile: async ({ page, _ui }, use) => {
      const apiMock = new HeadlineApiMock(page, headlineApiFixtures);
      await apiMock.install();

      await _ui.userSettingsPage.navigate();

      await use({
        page: _ui.userSettingsPage,
        headline: _ui.userSettingsPage.profileForm.headline,
        apiMock,
      });
    },
  });

  return mockTest as unknown as TestType<{ mockedHeadlineProfile: MockedHeadlineProfile }, Record<string, never>>;
};

const saveHeadlineAndWait = async (
  headline: HeadlineComponent,
  value: string,
): Promise<void> => {
  if ((await headline.read()) === value) {
    return;
  }

  await headline.setValue(value);
  await expect(headline.value).toHaveText(value);
};
