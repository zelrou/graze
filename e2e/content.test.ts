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

  test.describe('main extension page', ()=>{
    // TODO we are checking by proxy maybe chech external console or mach
    test("Content script appears in open tabs list", async ({ page, extensionId, context }) => {
      const externalTitle = await externalPage.title()
      const openTable = await mainPage.getOpenTabsTable()
      const openTabsText = await openTable.textContent()
      expect(openTabsText.includes(externalTitle)).toBe(true)
    });
  })

  test.describe('graze-main-text (midsection)', () => {
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
  });
  
  test.describe("reader toolbar bottom adjusts...", ()=> {
    test("reader location by charIndex", async ({ page, extensionId, context }) => {
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

    test('mainText charlength', async ({}) => {
      const defaultCharInterval = 200;
      const newCharInterval = 50;
      const externalTitle = await externalPage.title()
      await mainPage.clickReaderButton(externalTitle)

      const mainTextDiv = await mainPage.getReaderMainTextDiv()
      const mainText1 = await mainTextDiv.textContent()
      const mainTextLen1 = mainText1.length
      expect(mainTextLen1).toStrictEqual(defaultCharInterval)

      await mainPage.fillCharIntervalInput(newCharInterval)

      const mainText2 = await mainTextDiv.textContent()
      const mainTextLen2 = mainText2.length

      expect(mainText1).toContain(mainText2)
      expect(mainTextLen2).toStrictEqual(newCharInterval)
    });

    test('mainText fontSize', async ({})=>{
      const newFontSize = 3;
      const matchTextSlice = 'From Wikipedia, the free'
      const externalTitle = await externalPage.title()
      await mainPage.clickReaderButton(externalTitle)

      const textSlice = await mainPage.getMainTextSlice(matchTextSlice)
      const fontSizeA = await mainPage.getFontSize(textSlice)

      await mainPage.fillFontSizeInput(newFontSize)

      const fontSizeB = await mainPage.getFontSize(textSlice)
      expect(fontSizeA).toBeLessThan(fontSizeB)
    });
  });


  test.describe('autoseek', () => {
    test('delayInput changes timeout and toggle advances mainText', async ({}) => {
      const externalTitle = await externalPage.title()
      await mainPage.clickReaderButton(externalTitle)

      const mainTextDiv = await mainPage.getReaderMainTextDiv()
      const mainText1 = await mainTextDiv.textContent()

      const delayInput = await mainPage.getDelayInput()
      const newDelay = 200
      await delayInput.fill(`${newDelay}`)
      // const delayInterval = await mainPage.getDelayInterval()

      await mainPage.clickAutoseekToggle()
      // await mainPage.page.clock.fastForward(delayInterval + 1000);
    
      const mainText2 = await mainTextDiv.textContent()
      expect(mainText1 === mainText2).toBeFalsy()
    })
    test('autoseek stops at end of article', ({}) => {})

  })

  test.describe('toolbar top', () => {
    test.describe('bookmarks', ()=>{
      test('location saved after article switch', async ({}) => {
        const charInterval = 200
        const pageNum = 30
        const nextCharIdx = charInterval * pageNum
        const externalTitle = await externalPage.title()
        await mainPage.clickReaderButton(externalTitle)
        await mainPage.fillReaderCharIndexInput(nextCharIdx)
        await mainPage.clickSubmitLocation()
        await mainPage.clickSetProgressMark()
        await mainPage.clickMinimizeReader()

        const externalTitle2 = await externalPage2.title()
        await mainPage.clickReaderButton(externalTitle2)
        await mainPage.clickMinimizeReader()

        await mainPage.clickReaderButton(externalTitle)
        const [loc, totLoc] = await mainPage.getLocation()
        expect(loc).toStrictEqual(0)

        await mainPage.clickJumpLatestMark()
        const [loc2, totloc2] = await mainPage.getLocation()
        expect(loc2).toStrictEqual(nextCharIdx)
      })

      test('clear progress wipes location', async ({}) => {
        const charInterval = 200
        const pageNum = 30
        const nextCharIdx = charInterval * pageNum
        const externalTitle = await externalPage.title()
        await mainPage.clickReaderButton(externalTitle)
        await mainPage.fillReaderCharIndexInput(nextCharIdx)
        await mainPage.clickSubmitLocation()
        await mainPage.clickSetProgressMark()

        await mainPage.clickReaderNavPrevButton()
        const [loc1, totLoc1] = await mainPage.getLocation()
        expect(loc1).toStrictEqual(nextCharIdx - charInterval)

        await mainPage.clickJumpLatestMark()
        const [loc2, totLoc2] = await mainPage.getLocation()
        expect(loc2).toStrictEqual(nextCharIdx)

        await mainPage.clickClearMarks()
        await mainPage.clickJumpLatestMark()
        const [loc3, totLoc3] = await mainPage.getLocation()
        expect(loc3).toStrictEqual(0)

      })
    })
    test.describe('search', () => {})
  })
})

