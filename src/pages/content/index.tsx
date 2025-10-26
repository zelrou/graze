import { getParagraphsWithHeadings } from "../main/xpathUtils";

try {
  console.log('content script loaded');
} catch (e) {
  console.error(e);
}

const structuredWork = getParagraphsWithHeadings(document)
//console.log(structuredWork)

let paragraphNodes = document.getElementsByTagName('p')
let _paragraphs = Array.from(paragraphNodes).map((el)=>{
    return el.innerText
});


browser.runtime.onMessage.addListener((request) => {
  console.log("Message from the background script:");
  console.log(request.greeting);
  return Promise.resolve({
        response: "Hi from content script",
        _paragraphs,
        structuredWork
    });
});

