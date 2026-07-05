import type { MockedRequest } from '../../src/api/headline-api-mock';
import { expect } from '../../src/fixtures/test';
import {
  authStatusEndpoint,
  emptyHeadlineRequest,
  userUpdateEndpoint,
} from '../data/headline-api.data';

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
