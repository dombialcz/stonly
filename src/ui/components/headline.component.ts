import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../core/base-component';
import { lazy } from '../core/lazy';
import { HeadlineEditorComponent } from './headline-editor.component';

export class HeadlineComponent extends BaseComponent {
  private readonly editorFactory = lazy(() => new HeadlineEditorComponent(this.page));

  constructor(page: Page) {
    super(
      page,
      page.getByTestId('settingsCanvas').filter({
        has: page.getByTestId('userHeadline'),
      }),
    );
  }

  get content(): Locator {
    return this.root.getByTestId('userHeadline');
  }

  get value(): Locator {
    return this.content.locator('[type="edit"]');
  }

  get addAction(): Locator {
    return this.root.getByTestId('editButton').filter({ hasText: /^Add$/i });
  }

  get editAction(): Locator {
    return this.root.getByTestId('editButton').filter({ hasText: /^Edit$/i });
  }

  get openEditorAction(): Locator {
    return this.root.getByTestId('editButton').filter({ hasText: /^(Add|Edit)$/i });
  }

  get editor(): HeadlineEditorComponent {
    return this.editorFactory();
  }

  get input(): Locator {
    return this.editor.input;
  }

  get saveAction(): Locator {
    return this.editor.saveAction;
  }

  async read(): Promise<string> {
    return (await this.value.textContent())?.trim() ?? '';
  }

  async setValue(value: string): Promise<void> {
    await this.openEditor();
    await this.input.fill(value);
    await this.saveAction.click();
  }

  async clearValue(): Promise<void> {
    await this.openEditor();
    await this.input.fill('');
    await this.saveAction.click();
  }

  private async openEditor(): Promise<void> {
    await this.openEditorAction.click();
  }
}
