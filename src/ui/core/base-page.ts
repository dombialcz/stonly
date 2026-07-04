import type { Locator, Page } from '@playwright/test';
import { appUrl } from '../../config/config';

export abstract class BasePage {
  protected constructor(
    protected readonly page: Page,
    protected readonly path: string,
  ) {}

  async navigate(): Promise<void> {
    await this.page.goto(appUrl(this.path), { waitUntil: 'domcontentloaded' });
  }

  protected byRole(
    role: Parameters<Page['getByRole']>[0],
    options?: Parameters<Page['getByRole']>[1],
  ): Locator {
    return this.page.getByRole(role, options);
  }
}
