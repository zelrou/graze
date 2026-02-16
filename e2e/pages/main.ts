// https://github.com/wxt-dev/examples/blob/main/examples/playwright-e2e-testing/e2e/pages/popup.ts

import { Page } from "@playwright/test";

export async function openMain(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/main.html`);
  const mainPage = {
      page,
      getOpenTabsTable: async () => page.getByRole('table').nth(0),
      getOpenTabsTableRows: async () => {
        const openTabsTable = await mainPage.getOpenTabsTable()
        return openTabsTable.getByRole('row')
      },
      clickDismissButton: async () => page.getByRole(
        'button', { name: 'dismiss' }).click(),
      getOpenTabRowByText: async (txt) => {
        const openTabsTableRows = await mainPage.getOpenTabsTableRows()
        return openTabsTableRows.getByText(txt)
      }, 
      clickReaderButton: async (externalTitle) => {
        // const openTabsTable = await mainPage.getOpenTabsTable()
        // await openTabsTable.getByRole('row').filter({hasText: externalTitle})
        page.locator('button.btn-readero').click()
      },
      getReaderMainTextDiv: async () => page.locator('#mainTextContainer')
  }
  return mainPage
}

