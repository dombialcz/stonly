import { config } from '../src/config/config';
import { createMockTest, expect } from '../src/fixtures/test';
import {
  expectHeadlineNotToHaveValue,
  expectHeadlineToBeEmpty,
  expectHeadlineToHaveValue,
  expectMockedHeadlineClear,
  expectMockedHeadlineUpdate,
  expectMockedProfileRead,
} from './assertions/headline.assertions';
import { failedUserUpdateResponse } from './data/headline-api.data';
import { headlineApiFixtures } from './fixtures/headline-api-fixtures';

const test = createMockTest(headlineApiFixtures);

test.describe('headline hybrid mock contract', () => {
  test('uses the mocked profile read response @happypath', async ({ mockedHeadlineProfile }) => {
    await test.step('verify mocked profile state is rendered', async () => {
      await expect(mockedHeadlineProfile.page.profileHeading).toBeVisible();
      await expectHeadlineToHaveValue(mockedHeadlineProfile.headline, config.headlineBaseline);
    });

    await test.step('verify profile read contract', async () => {
      expectMockedProfileRead(mockedHeadlineProfile.apiMock.authStatusRequests);
    });
  });

  test('captures the mocked headline update contract @happypath', async ({ mockedHeadlineProfile }) => {
    const headline = 'QA Mock Headline';

    const update = await test.step('update headline through the UI', async () => {
      const updateRequest = mockedHeadlineProfile.apiMock.waitForUserUpdate();
      await mockedHeadlineProfile.headline.setValue(headline);
      return updateRequest;
    });

    await test.step('verify update request contract', async () => {
      expectMockedHeadlineUpdate(update, headline);
    });

    await test.step('verify updated headline row', async () => {
      await expectHeadlineToHaveValue(mockedHeadlineProfile.headline, headline);
    });
  });

  test('captures the mocked headline clear contract @happypath', async ({ mockedHeadlineProfile }) => {
    const update = await test.step('clear headline through the UI', async () => {
      const updateRequest = mockedHeadlineProfile.apiMock.waitForUserUpdate();
      await mockedHeadlineProfile.headline.clearValue();
      return updateRequest;
    });

    await test.step('verify clear request contract', async () => {
      expectMockedHeadlineClear(update);
    });

    await test.step('verify empty headline row', async () => {
      await expectHeadlineToBeEmpty(mockedHeadlineProfile.headline);
    });
  });
});

const failedUpdateTest = createMockTest({
  ...headlineApiFixtures,
  userUpdateResponse: {
    status: 500,
    body: failedUserUpdateResponse,
  },
});

failedUpdateTest.describe('headline hybrid mock failure contract', () => {
  failedUpdateTest('does not show the attempted headline as saved when update fails @negative', async ({ mockedHeadlineProfile }) => {
    const headline = 'QA Failed Mock Headline';

    await failedUpdateTest.step('verify baseline headline before failed update', async () => {
      await expectHeadlineToHaveValue(mockedHeadlineProfile.headline, config.headlineBaseline);
    });

    const update = await failedUpdateTest.step('attempt headline update through the UI', async () => {
      const updateRequest = mockedHeadlineProfile.apiMock.waitForUserUpdate();
      await mockedHeadlineProfile.headline.setValue(headline);
      return updateRequest;
    });

    await failedUpdateTest.step('verify failed update request contract', async () => {
      expectMockedHeadlineUpdate(update, headline);
    });

    await failedUpdateTest.step('verify attempted headline is not saved', async () => {
      await expectHeadlineToHaveValue(mockedHeadlineProfile.headline, config.headlineBaseline);
      await expectHeadlineNotToHaveValue(mockedHeadlineProfile.headline, headline);
    });
  });
});
