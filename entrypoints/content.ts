import { sanitzeAndReaderize } from "@/utils/xpathUtils.tsx"

import { browser } from 'wxt/browser';
import { type Browser } from 'wxt/browser';

export default defineContentScript({
  matches: ['<all_urls>'],
  registration: 'manifest',
  main: function () {
    try {
      console.log('content script loaded');
    } catch (e) {
      console.error(e);
    }
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log("Message from the background script:", request.greeting);
        let article;
        try {
          article = sanitzeAndReaderize(globalThis.document)
        } catch(e){
          console.err(e)
          throw(e)
        }
        console.log('safeArticle', article)
        sendResponse({
            response: "Hi from content script",
            article
        });
        return true
    });
  },
});
