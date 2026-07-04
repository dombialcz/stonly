import type { Locator, Page } from '@playwright/test';
import { config } from '../../config/config';
import { BasePage } from '../core/base-page';
import { lazy } from '../core/lazy';
import { ProfileFormComponent } from '../components/profile-form.component';

export class UserSettingsPage extends BasePage {
  private readonly profileFormFactory = lazy(
    () => new ProfileFormComponent(this.page, this.profileRoot()),
  );

  constructor(page: Page) {
    super(page, config.userSettingsPath);
  }

  get profileForm(): ProfileFormComponent {
    return this.profileFormFactory();
  }

  get profileHeading(): Locator {
    return this.page.getByRole('heading', { name: /^profile$/i });
  }

  private profileRoot(): Locator {
    return this.page
      .getByRole('main')
      .or(this.page.locator('body'))
      .filter({
        hasText: /account|profile|headline/i,
      })
      .first();
  }
}
