import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../core/base-component';

export class TextFieldComponent extends BaseComponent {
  constructor(
    page: Page,
    root: Locator,
    private readonly labelPattern: RegExp,
  ) {
    super(page, root);
  }

  get control(): Locator {
    return this.root
      .getByRole('textbox', { name: this.labelPattern })
      .or(this.page.getByLabel(this.labelPattern))
      .first();
  }

  async read(): Promise<string> {
    if ((await this.control.count()) === 0) {
      return (await this.root.textContent())?.trim() ?? '';
    }

    const tagName = await this.control.evaluate((node) => node.tagName.toLowerCase());

    if (tagName === 'input' || tagName === 'textarea') {
      return this.control.inputValue();
    }

    return (await this.control.textContent())?.trim() ?? '';
  }
}
