import { config } from '../src/config/config';
import { expect, test } from '../src/fixtures/test';
import {
  expectHeadlineToBeEmpty,
  expectHeadlineToHaveValue,
} from './assertions/headline.assertions';

test.describe('headline live e2e', () => {
  test.describe.configure({ mode: 'serial' });

  test('reads the baseline headline @happypath', async ({ headlineProfile }) => {
    await test.step('verify baseline headline is visible', async () => {
      await expect(headlineProfile.page.profileHeading).toBeVisible();
      await expectHeadlineToHaveValue(headlineProfile.headline, config.headlineBaseline);
    });

    await test.step('verify readable headline value', async () => {
      expect(await headlineProfile.headline.read()).toBe(config.headlineBaseline);
    });
  });

  test('writes a new headline @happypath', async ({ headlineProfile }) => {
    const headline = `QA Live Headline ${Date.now()}`;

    await test.step('update headline through the UI', async () => {
      await headlineProfile.headline.setValue(headline);
    });

    await test.step('verify updated headline row', async () => {
      await expectHeadlineToHaveValue(headlineProfile.headline, headline);
    });
  });

  test('clears the headline by saving an empty value @happypath', async ({ headlineProfile }) => {
    await test.step('clear headline through the UI', async () => {
      await headlineProfile.headline.clearValue();
    });

    await test.step('verify empty headline row', async () => {
      await expectHeadlineToBeEmpty(headlineProfile.headline);
    });
  });
});
