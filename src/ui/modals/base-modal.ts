import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../core/base-component';

export class BaseModal extends BaseComponent {
  constructor(page: Page, root: Locator = page.getByRole('dialog')) {
    super(page, root);
  }
}
