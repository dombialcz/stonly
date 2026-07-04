import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../core/base-component';
import { lazy } from '../core/lazy';
import { HeadlineComponent } from './headline.component';

export class ProfileFormComponent extends BaseComponent {
  private readonly headlineFactory = lazy(() => new HeadlineComponent(this.page));

  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  get headline(): HeadlineComponent {
    return this.headlineFactory();
  }
}
