import { config } from '../src/config/config';
import { HeadlineApiMock, type HeadlineApiFixtures } from '../src/api/headline-api-mock';
import { expect, test as base } from '../src/fixtures/test';
import type { UserSettingsPage } from '../src/ui/pages/user-settings.page';
import {
  expectMockedHeadlineClear,
  expectMockedHeadlineUpdate,
  expectMockedProfileRead,
} from './assertions/headline.api.assertions';
import {
  failedUserUpdateResponse,
} from './data/headline-api.data';
import {
  addHeadlineActionText,
  emptyHeadlineText,
} from './data/headline-ui.data';
import { headlineApiFixtures } from './fixtures/headline-api-fixtures';

type HeadlineMockFixtures = {
  headlineApiMock: HeadlineApiMock;
  userSettingsPage: UserSettingsPage;
};

const createHeadlineMockTest = (fixtures: HeadlineApiFixtures) => base.extend<HeadlineMockFixtures>({
  headlineApiMock: async ({ page }, use) => {
    const headlineApiMock = new HeadlineApiMock(page, fixtures);
    await headlineApiMock.install();
    await use(headlineApiMock);
  },

  userSettingsPage: async ({ ui, headlineApiMock: _headlineApiMock }, use) => {
    const userSettingsPage = ui.userSettingsPage;

    await userSettingsPage.navigate();
    await use(userSettingsPage);
  },
});

const test = createHeadlineMockTest(headlineApiFixtures);

test.describe('headline hybrid mock contract', () => {
  test('uses the mocked profile read response @happypath', async ({ userSettingsPage, headlineApiMock }) => {
    const headline = userSettingsPage.profileForm.headline;

    await test.step('verify mocked baseline Headline state is rendered', async () => {
      await expect(userSettingsPage.profileHeading).toBeVisible();
      await expect(headline.value).toHaveText(config.headlineBaseline);
    });

    await test.step('verify auth status read contract was consumed', async () => {
      expectMockedProfileRead(headlineApiMock.authStatusRequests);
    });
  });

  test('captures the mocked headline update contract @happypath', async ({ userSettingsPage, headlineApiMock }) => {
    const headline = userSettingsPage.profileForm.headline;
    const headlineValue = 'QA Mock Headline';

    const update = await test.step('save a mocked Headline through the UI', async () => {
      const updateRequest = headlineApiMock.waitForUserUpdate();
      await headline.setValue(headlineValue);
      return updateRequest;
    });

    await test.step('verify update request contains the requested Headline', async () => {
      expectMockedHeadlineUpdate(update, headlineValue);
    });

    await test.step('verify the Headline row shows the mocked saved value', async () => {
      await expect(headline.value).toHaveText(headlineValue);
    });
  });

  test('captures the mocked headline clear contract @happypath', async ({ userSettingsPage, headlineApiMock }) => {
    const headline = userSettingsPage.profileForm.headline;

    const update = await test.step('save an empty Headline through the UI', async () => {
      const updateRequest = headlineApiMock.waitForUserUpdate();
      await headline.clearValue();
      return updateRequest;
    });

    await test.step('verify clear request sends an empty Headline', async () => {
      expectMockedHeadlineClear(update);
    });

    await test.step('verify the Headline row returns to the empty state', async () => {
      await expect(headline.value).toHaveText(emptyHeadlineText);
      await expect(headline.addAction).toHaveText(addHeadlineActionText);
    });
  });
});

const failedUpdateTest = createHeadlineMockTest({
  ...headlineApiFixtures,
  userUpdateResponse: {
    status: 500,
    body: failedUserUpdateResponse,
  },
});

failedUpdateTest.describe('headline hybrid mock failure contract', () => {
  failedUpdateTest('does not show the attempted headline as saved when update fails @negative', async ({ userSettingsPage, headlineApiMock }) => {
    const headline = userSettingsPage.profileForm.headline;
    const headlineValue = 'QA Failed Mock Headline';

    await failedUpdateTest.step('verify baseline Headline before the failed save', async () => {
      await expect(headline.value).toHaveText(config.headlineBaseline);
    });

    const update = await failedUpdateTest.step('attempt to save a Headline while the update API fails', async () => {
      const updateRequest = headlineApiMock.waitForUserUpdate();
      await headline.setValue(headlineValue);
      return updateRequest;
    });

    await failedUpdateTest.step('verify failed update request still carries the attempted Headline', async () => {
      expectMockedHeadlineUpdate(update, headlineValue);
    });

    await failedUpdateTest.step('verify the Headline row keeps the previous saved value', async () => {
      await expect(headline.value).toHaveText(config.headlineBaseline);
      await expect(headline.value).not.toHaveText(headlineValue);
    });
  });
});
