import { test as base, expect } from '@playwright/test';
import { Ui } from '../ui/ui';

type Fixtures = {
  ui: Ui;
};

export const test = base.extend<Fixtures>({
  ui: async ({ page }, use) => {
    await use(new Ui(page));
  },
});

export { expect };
