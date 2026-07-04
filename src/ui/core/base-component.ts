import type { Locator, Page } from '@playwright/test';

export abstract class BaseComponent {
  protected constructor(
    protected readonly page: Page,
    public readonly root: Locator,
  ) {}
}
