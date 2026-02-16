
// https://github.com/wxt-dev/examples/blob/main/examples/playwright-e2e-testing/e2e/pages/popup.ts

import { Page } from "@playwright/test";

export async function openExternal(page: Page, externalUrl: string) {
  await page.goto(externalUrl);
  return ({
    externalPage: {
      page,
      getTitle: async () => page.title(),
      getOpenTabsTable: async () => page.locator('table').nth(0)
  });
}

