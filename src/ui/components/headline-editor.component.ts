import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../core/base-component';

const headlinePlaceholder = 'eg. UX designer at Brakadabar & Sketch expert';

export class HeadlineEditorComponent extends BaseComponent {
  constructor(page: Page) {
    super(page, page.locator('body').filter({ has: page.locator(`input[placeholder="${headlinePlaceholder}"]`) }).first());
  }

  get input(): Locator {
    return this.page.locator(`input[placeholder="${headlinePlaceholder}"]`);
  }

  get saveAction(): Locator {
    return this.page.getByRole('button', { name: /^save$/i });
  }

  get cancelAction(): Locator {
    return this.page.getByRole('button', { name: /^cancel$/i });
  }
}
