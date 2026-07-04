import type { Page, Route } from '@playwright/test';

export type HeadlineApiFixtures = {
  authStatusResponse: unknown;
  userUpdateResponse: unknown;
};

export type MockedRequest = {
  method: string;
  url: string;
  body: unknown;
};

type RequestPredicate = (request: MockedRequest) => boolean;

export class HeadlineApiMock {
  readonly authStatusRequests: MockedRequest[] = [];
  readonly userUpdateRequests: MockedRequest[] = [];
  private readonly pending: Array<{
    predicate: RequestPredicate;
    resolve: (request: MockedRequest) => void;
  }> = [];

  constructor(
    private readonly page: Page,
    private readonly fixtures: HeadlineApiFixtures,
  ) {}

  async install(): Promise<void> {
    await this.page.route('**/api/v1/auth/status', async (route) => {
      const request = this.toMockedRequest(route);
      this.authStatusRequests.push(request);
      this.resolvePending(request);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(this.fixtures.authStatusResponse),
      });
    });

    await this.page.route('**/api/v1/user', async (route) => {
      if (route.request().method() !== 'PUT') {
        await route.continue();
        return;
      }

      const request = this.toMockedRequest(route);
      this.userUpdateRequests.push(request);
      this.resolvePending(request);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(this.fixtures.userUpdateResponse),
      });
    });
  }

  waitForUserUpdate(): Promise<MockedRequest> {
    return this.waitFor((request) => request.method === 'PUT' && request.url.includes('/api/v1/user'));
  }

  private waitFor(predicate: RequestPredicate): Promise<MockedRequest> {
    const existing = [...this.authStatusRequests, ...this.userUpdateRequests].find(predicate);

    if (existing) {
      return Promise.resolve(existing);
    }

    return new Promise((resolve) => {
      this.pending.push({ predicate, resolve });
    });
  }

  private resolvePending(request: MockedRequest): void {
    for (const pending of [...this.pending]) {
      if (!pending.predicate(request)) {
        continue;
      }

      this.pending.splice(this.pending.indexOf(pending), 1);
      pending.resolve(request);
    }
  }

  private toMockedRequest(route: Route): MockedRequest {
    const request = route.request();

    return {
      method: request.method(),
      url: request.url(),
      body: parseJson(request.postData()),
    };
  }
}

const parseJson = (value: string | null): unknown => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
