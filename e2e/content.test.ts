import { isStringObject } from "util/types";
import { test, expect } from "./fixtures";

import { openExternal } from "./pages/external"
import { openMain } from "./pages/main"


const baseUrl = `http://localhost:8080/`
// const baseUrl = `https://wikipedia.com/wiki/`

const externalURL1 = `${baseUrl}TypeScript%20-%20Wikipedia.html`
const externalURL2 = `${baseUrl}ECMAScript%20-%20Wikipedia.html`

test.describe('content script and dependent features', () => {

  let externalPage, externalPage2, mainPage;
  test.beforeEach(async ({ page, extensionId, context }) => {
    // open external pages for content script
    externalPage = await context.newPage()
    await externalPage.goto(externalURL1)
    externalPage2 = await context.newPage()
    await externalPage2.goto(externalURL2)
    // open main page
    const blankMain = await context.newPage()
    mainPage = await openMain(blankMain, extensionId)
    await mainPage.clickDismissButton()
  })

  // TODO we are checking by proxy maybe chech external console or mach
  test("Content script appears in open tabs list", async ({ page, extensionId, context }) => {
    const externalTitle = await externalPage.title()
    const openTable = await mainPage.getOpenTabsTable()
    const openTabsText = await openTable.textContent()
    expect(openTabsText.includes(externalTitle)).toBe(true)
  });

  test("reader contains string from content script", async ({ page, extensionId, context }) => {
    const matchCase1 = 'TypeScript'
    const externalTitle = await externalPage.title()
    await mainPage.clickReaderButton(externalTitle)

    const mainTextDiv = await mainPage.getReaderMainTextDiv()
    let mainText = await mainTextDiv.textContent()
    expect(mainText.length).toBeGreaterThan(100)
    expect(mainText).toContain(matchCase1)
    /*
    // TODO check against article 
    const externalBody = await externalPage.locator('body').innerText()
    for (const word of mainText) {
      console.log(word)
      expect(externalBody.includes(word)).toBeTruthy
    }
    */
  });

  test("reader nav controls location", async ({ page, extensionId, context }) => {
    const externalTitle = await externalPage.title()
    await mainPage.clickReaderButton(externalTitle)

    const mainTextDiv = await mainPage.getReaderMainTextDiv()
    const mainText1 = await mainTextDiv.textContent()

    await mainPage.clickReaderNavNextButton()

    const mainText2 = await mainTextDiv.textContent()

    expect(mainText1 === mainText2).toBeFalsy()

    await mainPage.clickReaderNavPrevButton()
    const mainText3 = await mainTextDiv.textContent()

    expect(mainText3 === mainText1).toBeTruthy()
  });

  test("reader changes location by charIndex", async ({ page, extensionId, context }) => {
    const cIdx = 20;
    const externalTitle = await externalPage.title()
    await mainPage.clickReaderButton(externalTitle)

    const mainTextDiv = await mainPage.getReaderMainTextDiv()
    const mainText1 = await mainTextDiv.textContent()

    await mainPage.fillReaderCharIndexInput(cIdx)
    await mainPage.clickSubmitLocation()

    const mainText2 = await mainTextDiv.textContent()
    expect(mainText1 === mainText2).toBeFalsy()

    const progressBar = await mainPage.getReaderProgressBar()
    const progressText = await progressBar.textContent()
    expect(progressText).toContain(`${cIdx}`)
  });
})

