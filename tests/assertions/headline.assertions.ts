import type { ApiCapture } from '../../src/api/api-recorder';
import type { MockedRequest } from '../../src/api/headline-api-mock';
import type { HeadlineComponent } from '../../src/ui/components/headline.component';
import { expect } from '../../src/fixtures/test';
import {
  addHeadlineActionText,
  authStatusEndpoint,
  emptyHeadlineRequest,
  emptyHeadlineText,
  successfulUserUpdateResponse,
  userUpdateEndpoint,
} from '../data/headline-api.data';

export async function expectHeadlineToHaveValue(headline: HeadlineComponent, value: string): Promise<void> {
  await expect(headline.value).toHaveText(value);
}

export async function expectHeadlineToBeEmpty(headline: HeadlineComponent): Promise<void> {
  await expect(headline.value).toHaveText(emptyHeadlineText);
  await expect(headline.addAction).toHaveText(addHeadlineActionText);
}

export function expectLiveHeadlineUpdate(update: ApiCapture, headline: string): void {
  expect(update.requestBody).toMatchObject({ headline });
  expect(update.responseBody).toEqual(successfulUserUpdateResponse);
}

export function expectLiveHeadlineClear(update: ApiCapture): void {
  expect(update.requestBody).toMatchObject(emptyHeadlineRequest);
  expect(update.responseBody).toEqual(successfulUserUpdateResponse);
}

export function expectMockedProfileRead(requests: MockedRequest[]): void {
  expect(requests.length).toBeGreaterThan(0);
  expect(requests[0]).toMatchObject({
    method: 'GET',
  });
  expect(requests[0].url).toContain(authStatusEndpoint);
}

export function expectMockedHeadlineUpdate(update: MockedRequest, headline: string): void {
  expect(update).toMatchObject({
    method: 'PUT',
    body: {
      headline,
    },
  });
  expect(update.url).toContain(userUpdateEndpoint);
}

export function expectMockedHeadlineClear(update: MockedRequest): void {
  expect(update).toMatchObject({
    method: 'PUT',
    body: emptyHeadlineRequest,
  });
  expect(update.url).toContain(userUpdateEndpoint);
}
