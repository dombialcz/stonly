import type { Page } from '@playwright/test';
import { lazy } from './core/lazy';
import { LoginPage } from './pages/login.page';
import { UserSettingsPage } from './pages/user-settings.page';

export class Ui {
  private readonly loginPageFactory = lazy(() => new LoginPage(this.page));
  private readonly userSettingsPageFactory = lazy(() => new UserSettingsPage(this.page));

  constructor(private readonly page: Page) {}

  get loginPage(): LoginPage {
    return this.loginPageFactory();
  }

  get userSettingsPage(): UserSettingsPage {
    return this.userSettingsPageFactory();
  }
}
