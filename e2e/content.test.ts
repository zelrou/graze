import { isStringObject } from "util/types";
import { test, expect } from "./fixtures";

import { openExternal } from "./pages/external"
import { openMain } from "./pages/main"

const externalURL = `https://en.wikipedia.org/wiki/Special:Random`
const externalStaticURL = `https://en.wikipedia.org/wiki/ECMAScript`
test("Content script loads", async ({ page, extensionId, context }) => {
  // open external page for content script
  const externalPage = await context.newPage()
  await externalPage.goto(externalURL)
  // console.log('num pages after open 1', context.pages().map(p=>p.title))

  // open main page
  const blankPageMain = await context.newPage()
  const mainPage = await openMain(blankPageMain, extensionId)

  await expect(mainPage.page).toHaveTitle(/Graze/);

  // expect external title to be in tab list
  const externalTitle = await externalPage.title()
  await mainPage.clickDismissButton()
  const openTable = await mainPage.getOpenTabsTable()
  const openTabsText = await openTable.textContent()
  // await page.pause();
  expect(openTabsText.includes(externalTitle)).toBe(true)
});

test("reader contains text from content script", async ({ page, extensionId, context }) => {
  // //TODO:DONE? DRY below copied from above
  // open external page for content script
  const externalPage = await context.newPage()
  await externalPage.goto(externalURL)

  // open main page
  const blankPageMain = await context.newPage()
  const mainPage = await openMain(blankPageMain, extensionId)

  const externalTitle = await externalPage.title()
  await mainPage.clickDismissButton()
  // now we open the page in reader
  // const tabRow = await mainPage.getOpenTabRowByText(externalTitle)

  await mainPage.clickReaderButton(externalTitle)

  // await page.pause();
  // locate main text
  // const mainTextDiv = await mainPage.locator('#mainTextContainer')
  const mainTextDiv = await mainPage.getReaderMainTextDiv()
  const mainText = await mainTextDiv.textContent()
  // await page.pause()
  console.log('maintextlen:', mainText.length)
  expect(typeof mainText ).toStrictEqual('string')
});

test("reader nav controls location", async ({ page, extensionId, context }) => {
  // open external page for content script
  const externalPage = await context.newPage()
  await externalPage.goto(externalStaticURL)

  // open main page
  const blankPageMain = await context.newPage()
  const mainPage = await openMain(blankPageMain, extensionId)

  const externalTitle = await externalPage.title()
  await mainPage.clickDismissButton()

  // now we open the page in reader
  await mainPage.clickReaderButton(externalTitle)

  const  mainTextDiv = await mainPage.getReaderMainTextDiv()
  const mainText1 = await mainTextDiv.textContent()

  await mainPage.clickReaderNavNextButton()

  const mainText2 = await mainTextDiv.textContent()

  expect(mainText1 === mainText2).toBeFalsy()
});
