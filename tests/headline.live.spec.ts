import { config } from '../src/config/config';
import { expect, test as base } from '../src/fixtures/test';
import type { HeadlineComponent } from '../src/ui/components/headline.component';
import type { UserSettingsPage } from '../src/ui/pages/user-settings.page';

const emptyHeadlineText = 'No headline added';
const addHeadlineActionText = 'Add';

const test = base.extend<{ userSettingsPage: UserSettingsPage }>({
  userSettingsPage: async ({ ui }, use) => {
    const userSettingsPage = ui.userSettingsPage;

    await userSettingsPage.navigate();
    await saveHeadlineAndWait(userSettingsPage.profileForm.headline, config.headlineBaseline);

    try {
      await use(userSettingsPage);
    } finally {
      await userSettingsPage.navigate();
      await saveHeadlineAndWait(userSettingsPage.profileForm.headline, config.headlineBaseline);
    }
  },
});

test.describe('headline live e2e', () => {
  test.describe.configure({ mode: 'serial' });

  test('reads the baseline headline @happypath', async ({ userSettingsPage }) => {
    const headline = userSettingsPage.profileForm.headline;

    await test.step('verify Profile shows the baseline Headline row', async () => {
      await expect(userSettingsPage.profileHeading).toBeVisible();
      await expect(headline.value).toHaveText(config.headlineBaseline);
    });

    await test.step('verify Headline row text can be read by the component', async () => {
      expect(await headline.read()).toBe(config.headlineBaseline);
    });
  });

  test('writes a new headline @happypath', async ({ userSettingsPage }) => {
    const headline = userSettingsPage.profileForm.headline;
    const headlineValue = `QA Live Headline ${Date.now()}`;

    await test.step('save a unique Headline through the UI', async () => {
      await headline.setValue(headlineValue);
    });

    await test.step('verify the Headline row shows the saved value', async () => {
      await expect(headline.value).toHaveText(headlineValue);
    });
  });

  test('clears the headline by saving an empty value @happypath', async ({ userSettingsPage }) => {
    const headline = userSettingsPage.profileForm.headline;

    await headline.clearValue();

    await test.step('verify the Headline row returns to the empty state', async () => {
      await expect(headline.value).toHaveText(emptyHeadlineText);
      await expect(headline.addAction).toHaveText(addHeadlineActionText);
    });
  });
});

const saveHeadlineAndWait = async (
  headline: HeadlineComponent,
  value: string,
): Promise<void> => {
  if ((await headline.read()) === value) {
    return;
  }

  await headline.setValue(value);
  await expect(headline.value).toHaveText(value);
};
