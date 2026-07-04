import type { Page } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { config } from '../../config/config';
import { BasePage } from '../core/base-page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page, config.loginUrl);
  }

  get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: /^email$/i });
  }

  get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: /^password$/i });
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: /^login$/i });
  }

  async fillCredentials(): Promise<void> {
    await this.emailInput.fill(config.email);
    await this.passwordInput.fill(config.password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
