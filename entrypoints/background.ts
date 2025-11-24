export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  browser.runtime.onInstalled.addListener(() => {
      browser.storage.local.set({graze: {setup:true}})
  })

});
