import type { HeadlineApiFixtures } from '../../src/api/headline-api-mock';
import { config } from '../../src/config/config';
import { successfulUserUpdateResponse } from '../data/headline-api.data';

export const headlineApiFixtures: HeadlineApiFixtures = {
  authStatusResponse: {
    result: true,
    content: {
      logged: true,
      user: {
        id: 'b10f2141-a8e4-4007-94b9-820edda8021a',
        logUserId: 'c5cef888-eafc-457a-906d-d37239de6735',
        email: config.email,
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
  },
  userUpdateResponse: {
    body: successfulUserUpdateResponse,
  },
};
