import { getParagraphsWithHeadings } from "@/utils/xpathUtils.tsx"



/*
let paragraphNodes = document.getElementsByTagName('p')
let _paragraphs = Array.from(paragraphNodes).map((el)=>{
    return el.innerText
});
*/




export default defineContentScript({
  matches: ['<all_urls>'],
  registration: 'manifest',
  main: function () {
    try {
      console.log('content script loaded');
    } catch (e) {
      console.error(e);
    }
    browser.runtime.onMessage.addListener((request) => {
        console.log("Message from the background script:");
        console.log(request.greeting);
        const structuredWork = getParagraphsWithHeadings(window)
        return Promise.resolve({
            response: "Hi from content script",
            structuredWork
        });
    });
  },
});
