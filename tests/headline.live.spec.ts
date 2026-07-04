import { config } from '../src/config/config';
import { expect, test } from '../src/fixtures/test';

test.describe('headline live e2e', () => {
  test('reads the baseline headline', async ({ headlineProfile }) => {
    await expect(headlineProfile.page.profileHeading).toBeVisible();
    await expect(headlineProfile.headline.value).toHaveText(config.headlineBaseline);

    expect(await headlineProfile.headline.read()).toBe(config.headlineBaseline);
  });

  test('writes a new headline', async ({ headlineProfile }) => {
    const headline = `QA Live Headline ${Date.now()}`;
    const updateRequest = headlineProfile.apiRecorder.waitForUserUpdate();

    await headlineProfile.headline.setValue(headline);

    const update = await updateRequest;
    await expect(headlineProfile.headline.value).toHaveText(headline);
    expect(update.requestBody).toMatchObject({ headline });
    expect(update.responseBody).toEqual({ result: true, content: { result: 1 } });
  });

  test('deletes the headline by saving an empty value', async ({ headlineProfile }) => {
    const updateRequest = headlineProfile.apiRecorder.waitForUserUpdate();

    await headlineProfile.headline.deleteValue();

    const update = await updateRequest;
    await expect(headlineProfile.headline.value).toHaveText('No headline added');
    await expect(headlineProfile.headline.addAction).toHaveText('Add');
    expect(update.requestBody).toMatchObject({ headline: '' });
    expect(update.responseBody).toEqual({ result: true, content: { result: 1 } });
  });
});
