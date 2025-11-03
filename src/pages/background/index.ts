console.log('background script loaded');
browser.runtime.onInstalled.addListener(() => {
    browser.storage.local.set({graze: {setup:true}})
})

browser.runtime.onMessage.addListener((message) => {
    console.log(message);
//  browser.notifications.create({
//    type: "basic",
//    title: "Message from the page",
//    message: message.content,
//  });
});

const messageTab = (tabs) => {
  browser.tabs.sendMessage(tabs[0].id, {
    data: {
        action: 'open_contentScript'
    }
  });
}

const onExecuted = (result) => {
  let querying = browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  querying.then(messageTab);
}


const openTabIndex = () => {
    browser.tabs.create({"url": "/src/pages/main/index.html"});
}

// browser.action.onClicked.addListener((t) => {
//     console.log(t);
//     onExecuted();
// })




//  "content_scripts": [
//    {
//      "matches": [
//        "http://*/*",
//        "https://*/*",
//        "<all_urls>"
//      ],
//      "js": [
//        "src/pages/content/index.tsx"
//      ],
//      "css": [
//        "contentStyle.css"
//      ]
//    }
//  ],

const registerScripts = async (tab) => {
    const getRegisteredScripts = async () => {
        let scripts = await browser.scripting.getRegisteredContentScripts();
        console.log(scripts.map((script) => script.id)); // ["script-1", "script-2"]
    }
    console.log(tab)
    const script = {
      id: "reader",
      js: ["dist_firefox/src/pages/content/index.jsx"],
      matches: [tab.url],
    };

    try {
      await browser.scripting.registerContentScripts([script]);
    } catch (err) {
      console.error(`failed to register content scripts: ${err}`);
    }
    try {
      await browser.scripting.updateContentScripts([
        {
          id: "reader",
          allFrames: true,
        }])
    } catch (err) {
        console.log('failed to update scripts', err)
    }
    getRegisteredScripts();
};

//browser.action.onClicked.addListener(registerScripts);



