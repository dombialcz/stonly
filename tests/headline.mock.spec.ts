import { config } from '../src/config/config';
import { createMockTest, expect } from '../src/fixtures/test';

const capturedAuthStatusResponse = {
  result: true,
  content: {
    logged: true,
    user: {
      id: 'b10f2141-a8e4-4007-94b9-820edda8021a',
      logUserId: 'c5cef888-eafc-457a-906d-d37239de6735',
      email: 'dombialcz+stonly+test@gmail.com',
      firstName: 'Tester',
      lastName: 'Testownik',
      creationDate: 1783174647553,
      picture: null,
      headline: config.headlineBaseline,
      defaultLanguage: 'pl',
      package: 'business_new_14d',
      trackingEnabled: 1,
      currentTeamSeatsProduct: null,
      currentGuideViewsProduct: null,
      currency: null,
      creditsAmount: null,
      trial: 1,
      features: [],
      subscriptionEnd: 1784384247553,
      countryCode: 'US',
      homeFolderId: 539857,
      loginType: 'local',
      keyId: null,
      backofficeAllowed: 0,
      teams: [
        {
          teamId: 48967,
          homeFolderId: 539858,
          rights: 'admin',
          name: 'dombialczstonlytest',
          ownerId: 221204,
          permissions: [],
          addons: [],
          rootFoldersIds: [539859],
          owner: true,
          isTeamRestricted: false,
        },
      ],
      groups: [],
      userType: 'client',
      scope: [],
      sessionId: 'mock-session',
      isInInvisibleMode: false,
      guideCounter: 0,
      guideViewsCounter: 0,
      isBusinessEmail: false,
    },
    csrfToken: 'mock-csrf-token',
  },
};

const capturedUserUpdateResponse = {
  result: true,
  content: {
    result: 1,
  },
};

const test = createMockTest({
  authStatusResponse: capturedAuthStatusResponse,
  userUpdateResponse: capturedUserUpdateResponse,
});

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
