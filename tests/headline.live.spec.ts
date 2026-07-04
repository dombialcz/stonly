import { config } from '../src/config/config';
import { expect, test } from '../src/fixtures/test';
import {
  expectHeadlineToBeEmpty,
  expectHeadlineToHaveValue,
  expectLiveHeadlineClear,
  expectLiveHeadlineUpdate,
} from './assertions/headline.assertions';

test.describe('headline live e2e', () => {
  test('reads the baseline headline', async ({ headlineProfile }) => {
    await expect(headlineProfile.page.profileHeading).toBeVisible();
    await expectHeadlineToHaveValue(headlineProfile.headline, config.headlineBaseline);

    expect(await headlineProfile.headline.read()).toBe(config.headlineBaseline);
  });

  test('writes a new headline', async ({ headlineProfile }) => {
    const headline = `QA Live Headline ${Date.now()}`;
    const updateRequest = headlineProfile.apiRecorder.waitForUserUpdate();

    await headlineProfile.headline.setValue(headline);

    const update = await updateRequest;
    await expectHeadlineToHaveValue(headlineProfile.headline, headline);
    expectLiveHeadlineUpdate(update, headline);
  });

  test('deletes the headline by saving an empty value', async ({ headlineProfile }) => {
    const updateRequest = headlineProfile.apiRecorder.waitForUserUpdate();

    await headlineProfile.headline.deleteValue();

    const update = await updateRequest;
    await expectHeadlineToBeEmpty(headlineProfile.headline);
    expectLiveHeadlineClear(update);
  });
});
