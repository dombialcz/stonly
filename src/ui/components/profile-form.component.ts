import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../core/base-component';
import { lazy } from '../core/lazy';
import { TextFieldComponent } from './text-field.component';

export class ProfileFormComponent extends BaseComponent {
  private readonly headlineFactory = lazy(
    () => new TextFieldComponent(this.page, this.fieldRoot(/headline/i), /headline/i),
  );

  constructor(page: Page, root: Locator) {
    super(page, root);
  }

  get headline(): TextFieldComponent {
    return this.headlineFactory();
  }

  private fieldRoot(label: RegExp): Locator {
    return this.root
      .locator('div, label, section, fieldset, form')
      .filter({ hasText: label })
      .first();
  }
}
