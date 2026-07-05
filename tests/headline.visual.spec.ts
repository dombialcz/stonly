import { config } from '../src/config/config';
import { HeadlineApiMock } from '../src/api/headline-api-mock';
import { expect, test as base } from '../src/fixtures/test';
import type { UserSettingsPage } from '../src/ui/pages/user-settings.page';
import { headlineApiFixtures } from './fixtures/headline-api-fixtures';

const test = base.extend<{
  headlineApiMock: HeadlineApiMock;
  userSettingsPage: UserSettingsPage;
}>({
  headlineApiMock: async ({ page }, use) => {
    const headlineApiMock = new HeadlineApiMock(page, headlineApiFixtures);
    await headlineApiMock.install();
    await use(headlineApiMock);
  },

  userSettingsPage: async ({ ui, headlineApiMock: _headlineApiMock }, use) => {
    const userSettingsPage = ui.userSettingsPage;

    await userSettingsPage.navigate();
    await use(userSettingsPage);
  },
});

test.describe('headline visual regression', () => {
  test('matches the mocked profile card @visual', async ({ userSettingsPage }) => {
    const headline = userSettingsPage.profileForm.headline;

    await test.step('verify visual baseline state', async () => {
      await expect(userSettingsPage.profileHeading).toBeVisible();
      await expect(headline.value).toHaveText(config.headlineBaseline);
    });

    await test.step('compare profile card snapshot', async () => {
      await expect(userSettingsPage.profileForm.root).toHaveScreenshot('profile-card.png', {
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: 0.03,
        threshold: 0.2,
      });
    });
  });
});
