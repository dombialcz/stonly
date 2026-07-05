import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../core/base-component';

export class HeadlineEditorComponent extends BaseComponent {
  constructor(page: Page) {
    super(page, page.getByTestId('headlineDialog'));
  }

  get input(): Locator {
    return this.root.getByLabel(/^headline$/i);
  }

  get saveAction(): Locator {
    return this.root.getByRole('button', { name: /^save$/i });
  }

  get cancelAction(): Locator {
    return this.root.getByRole('button', { name: /^cancel$/i });
  }
}
