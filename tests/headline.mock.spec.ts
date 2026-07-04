import { config } from '../src/config/config';
import { createMockTest, expect } from '../src/fixtures/test';
import {
  expectHeadlineToBeEmpty,
  expectHeadlineToHaveValue,
  expectMockedHeadlineClear,
  expectMockedHeadlineUpdate,
  expectMockedProfileRead,
} from './assertions/headline.assertions';
import { headlineApiFixtures } from './fixtures/headline-api-fixtures';

const test = createMockTest(headlineApiFixtures);

test.describe('headline hybrid mock contract', () => {
  test('uses the mocked profile read response', async ({ mockedHeadlineProfile }) => {
    await expect(mockedHeadlineProfile.page.profileHeading).toBeVisible();
    await expectHeadlineToHaveValue(mockedHeadlineProfile.headline, config.headlineBaseline);

    expectMockedProfileRead(mockedHeadlineProfile.apiMock.authStatusRequests);
  });

  test('captures the mocked headline update contract', async ({ mockedHeadlineProfile }) => {
    const headline = 'QA Mock Headline';
    const updateRequest = mockedHeadlineProfile.apiMock.waitForUserUpdate();

    await mockedHeadlineProfile.headline.setValue(headline);

    const update = await updateRequest;
    await expectHeadlineToHaveValue(mockedHeadlineProfile.headline, headline);
    expectMockedHeadlineUpdate(update, headline);
  });

  test('captures the mocked headline delete contract', async ({ mockedHeadlineProfile }) => {
    const updateRequest = mockedHeadlineProfile.apiMock.waitForUserUpdate();

    await mockedHeadlineProfile.headline.deleteValue();

    const update = await updateRequest;
    await expectHeadlineToBeEmpty(mockedHeadlineProfile.headline);
    expectMockedHeadlineClear(update);
  });
});
