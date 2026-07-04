import { config } from '../src/config/config';
import { createMockTest, expect } from '../src/fixtures/test';
import { headlineApiFixtures } from './fixtures/headline-api-fixtures';

const test = createMockTest(headlineApiFixtures);

test.describe('headline hybrid mock contract', () => {
  test('uses the mocked profile read response', async ({ mockedHeadlineProfile }) => {
    await expect(mockedHeadlineProfile.page.profileHeading).toBeVisible();
    await expect(mockedHeadlineProfile.headline.value).toHaveText(config.headlineBaseline);

    expect(mockedHeadlineProfile.apiMock.authStatusRequests.length).toBeGreaterThan(0);
    expect(mockedHeadlineProfile.apiMock.authStatusRequests[0]).toMatchObject({
      method: 'GET',
    });
    expect(mockedHeadlineProfile.apiMock.authStatusRequests[0].url).toContain('/api/v1/auth/status');
  });

  test('captures the mocked headline update contract', async ({ mockedHeadlineProfile }) => {
    const headline = 'QA Mock Headline';
    const updateRequest = mockedHeadlineProfile.apiMock.waitForUserUpdate();

    await mockedHeadlineProfile.headline.setValue(headline);

    const update = await updateRequest;
    await expect(mockedHeadlineProfile.headline.value).toHaveText(headline);
    expect(update).toMatchObject({
      method: 'PUT',
      body: {
        headline,
      },
    });
    expect(update.url).toContain('/api/v1/user');
  });

  test('captures the mocked headline delete contract', async ({ mockedHeadlineProfile }) => {
    const updateRequest = mockedHeadlineProfile.apiMock.waitForUserUpdate();

    await mockedHeadlineProfile.headline.deleteValue();

    const update = await updateRequest;
    await expect(mockedHeadlineProfile.headline.value).toHaveText('No headline added');
    expect(update).toMatchObject({
      method: 'PUT',
      body: {
        headline: '',
      },
    });
    expect(update.url).toContain('/api/v1/user');
  });
});
