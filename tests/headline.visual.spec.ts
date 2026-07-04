import { config } from '../src/config/config';
import { createMockTest, expect } from '../src/fixtures/test';
import { headlineApiFixtures } from './fixtures/headline-api-fixtures';

const test = createMockTest(headlineApiFixtures);

test.describe('headline visual regression', () => {
  test('matches the mocked profile card @visual', async ({ mockedHeadlineProfile }) => {
    await test.step('verify visual baseline state', async () => {
      await expect(mockedHeadlineProfile.page.profileHeading).toBeVisible();
      await expect(mockedHeadlineProfile.headline.value).toHaveText(config.headlineBaseline);
    });

    await test.step('compare profile card snapshot', async () => {
      await expect(mockedHeadlineProfile.page.profileForm.root).toHaveScreenshot('profile-card.png', {
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: 0.03,
        threshold: 0.2,
      });
    });
  });
});
