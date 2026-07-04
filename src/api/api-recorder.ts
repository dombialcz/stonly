import type { Page, Response } from '@playwright/test';

export type ApiCapture = {
  method: string;
  url: string;
  status: number;
  requestBody: unknown;
  responseBody: unknown;
};

type CapturePredicate = (capture: ApiCapture) => boolean;

export class ApiRecorder {
  private readonly capturesList: ApiCapture[] = [];
  private readonly pending: Array<{
    predicate: CapturePredicate;
    resolve: (capture: ApiCapture) => void;
  }> = [];
  private isStarted = false;

  constructor(private readonly page: Page) {}

  start(): void {
    if (this.isStarted) {
      return;
    }

    this.page.on('response', this.captureResponse);
    this.isStarted = true;
  }

  clear(): void {
    this.capturesList.length = 0;
  }

  captures(): ApiCapture[] {
    return [...this.capturesList];
  }

  waitForUserUpdate(): Promise<ApiCapture> {
    return this.waitFor((capture) => capture.method === 'PUT' && capture.url.includes('/api/v1/user'));
  }

  private waitFor(predicate: CapturePredicate): Promise<ApiCapture> {
    const existing = this.capturesList.find(predicate);

    if (existing) {
      return Promise.resolve(existing);
    }

    return new Promise((resolve) => {
      this.pending.push({ predicate, resolve });
    });
  }

  private readonly captureResponse = async (response: Response): Promise<void> => {
    const request = response.request();

    if (!['xhr', 'fetch'].includes(request.resourceType())) {
      return;
    }

    if (!response.url().includes('/api/v1/auth/status') && !response.url().includes('/api/v1/user')) {
      return;
    }

    const capture: ApiCapture = {
      method: request.method(),
      url: response.url(),
      status: response.status(),
      requestBody: parseJson(request.postData()),
      responseBody: await responseJson(response),
    };

    this.capturesList.push(capture);
    this.resolvePending(capture);
  };

  private resolvePending(capture: ApiCapture): void {
    for (const pending of [...this.pending]) {
      if (!pending.predicate(capture)) {
        continue;
      }

      this.pending.splice(this.pending.indexOf(pending), 1);
      pending.resolve(capture);
    }
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

const responseJson = async (response: Response): Promise<unknown> => {
  const contentType = response.headers()['content-type'] ?? '';

  if (!contentType.includes('json')) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};
