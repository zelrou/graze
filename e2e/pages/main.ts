import { Page } from "@playwright/test";

export async function openMain(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/main.html`);
  return page;
}
