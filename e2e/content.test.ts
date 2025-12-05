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
  const openTableList = await mainPage.locator('table').nth(0)
  const openTabsText = await openTableList.textContent()

  expect(openTabsText.includes(externalTitle)).toBe(true)
});
