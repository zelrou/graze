import { test, expect } from "./fixtures";

import { openMain } from "./pages/main"


test("Content script loads", async ({ page, extensionId, context }) => {
  // open external page for content script
  const externalPage = await context.newPage()
  const externalURL = `https://en.wikipedia.org/wiki/Special:Random`
  await externalPage.goto(externalURL)

  // open main page
  let mainPage = await context.newPage()
  mainPage = await openMain(mainPage, extensionId)

  // expect sanity
  const allPages = context.pages()
  expect(allPages.length).toBe(4)
  expect(mainPage).toBeTruthy()
  expect(externalPage).toBeTruthy()
  await expect(mainPage).toHaveTitle(/Graze/);

  // expect external title to be in tab list
  const externalTitle = await externalPage.title()
  await mainPage.getByRole('button', { name: 'dismiss' }).click();
  const openTable = await mainPage.locator('table').nth(0)
  const openTabsText = await openTable.textContent()
  // await page.pause();
  expect(openTabsText.includes(externalTitle)).toBe(true)
});

test("reader contains text from content script", async ({ page, extensionId, context }) => {
  // TODO DRY below copied from above
  // open external page for content script
  const externalPage = await context.newPage()
  const externalURL = `https://en.wikipedia.org/wiki/Special:Random`
  await externalPage.goto(externalURL)

  // open main page
  let mainPage = await context.newPage()
  mainPage = await openMain(mainPage, extensionId)

  // expect sanity
  const allPages = context.pages()
  expect(allPages.length).toBe(4)
  expect(mainPage).toBeTruthy()
  expect(externalPage).toBeTruthy()
  await expect(mainPage).toHaveTitle(/Graze/);

  // expect external title to be in tab list
  const externalTitle = await externalPage.title()
  await mainPage.getByRole('button', { name: 'dismiss' }).click();
  const openTable = await mainPage.locator('table').nth(0)
  const openTabsText = await openTable.textContent()
  expect(openTabsText.includes(externalTitle)).toBe(true)

  // now we open the page in reader
  const openTableFirstRow = await openTable.locator('tr').nth(1)
  await openTableFirstRow.locator('button.btn-readero').click()
  // await page.pause();

  // locate main text
  const mainTextDiv = await mainPage.locator('#mainTextContainer')
  const mainText = await mainTextDiv.textContent()
  expect(mainText).toBeTruthy()
});
