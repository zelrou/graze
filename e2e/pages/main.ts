// https://github.com/wxt-dev/examples/blob/main/examples/playwright-e2e-testing/e2e/pages/popup.ts

import { Page } from "@playwright/test";

export async function openMain(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/main.html`);

  const mainPage = {
      page,
      getOpenTabsTable: async () => page
        .getByRole('table').nth(0),

      getOpenTabsTableRows: async () => {
        const openTabsTable = await mainPage.getOpenTabsTable()
        return openTabsTable.getByRole('row')
      },
      clickDismissButton: async () => page
        .getByRole( 'button', { name: 'dismiss' }).click(),

      getOpenTabRowByText: async (txt) => {
        const openTabsTableRows = await mainPage.getOpenTabsTableRows()
        return openTabsTableRows.getByText(txt)
      },

      clickReaderButton: async (externalTitle) => {
        const openTabsTable = await mainPage.getOpenTabsTable()
        return openTabsTable.getByRole('row')
          .filter({hasText: externalTitle})
          .getByRole('button', {name: 'read'})
          .click()
      },

      getMainTextWithUI: async () => page
        .locator('#graze-main-text'),

      getReaderMainTextDiv: async () => page
        .locator('#mainTextContainer'),

      getReaderRoot: async () => page
        .locator('#reader-modal-root'),

      getReaderNavNextButton: async () => page
        .locator('button[name="nav-next"]'),
        // .getByRole ('button',{name:'nav-next'}),

      getReaderNavPrevButton: async () => page
        .locator('button[name="nav-prev"]'),
        // .locator('#graze-main-text')
        // .getByRole ('button',{name:'nav-prev'}),
      // getReaderNavPrevButton: async () => mainPage.page
      //   .locator('button[name="nav-prev"]'),

      clickReaderNavNextButton: async () => {
        const nextButton = await mainPage.getReaderNavNextButton()
        await nextButton.click()
      },

      clickReaderNavPrevButton: async () => {
        const prevButton = await mainPage.getReaderNavPrevButton()
        await prevButton.click()
      },

      fillReaderCharIndexInput: async (cIdx) => {
        // const readerRoot = await page.locator('#reader-modal-root')
        // const charIndexInput = await readerRoot.getByLabel('charIndexInput')
        const charIndexInput = page.locator('input[name="charIndexInput"]')
        await charIndexInput.fill(`${cIdx}`)
      },

      clickSubmitLocation: async () => {
        await page.locator('button[name="submitLocation"]').click()
      },

      getReaderProgressBar: async () => {
        const mainUI = await mainPage.getMainTextWithUI()
        return mainUI.getByRole('progressbar')
      }
  }
  return mainPage
}

