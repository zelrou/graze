
import Reader from '@pages/main/Reader';
import {
    useState, useEffect, useEffectEvent, useSyncExternalStore
} from 'react';

const DEFAULTS = {};
DEFAULTS.DELAY = 3000;

const getParagraphs = () => {
    let _paragraphs = Array.from(document.getElementsByTagName('p'))
    if (_paragraphs.length > 0) {
        _paragraphs = _paragraphs.map((el)=>{
            return el.innerText
        });
    } else {
        _paragraphs = [[]]
    }
    return _paragraphs
}

function splitWords(p) {
    if (!p || !p.length) return 0;
    return p.split(' ')
};


const subscribeStorage = callback => {
    if (browser.storage ) {
        // console.log(browser.storage)
        browser.storage.local.onChanged.addListener(callback)
    }
    return () => {
        browser.storage.local.onChanged.removeListener(callback)
    }
}

const syncStorageState = (changes, other) => {
    //const { pIdx, cIdx } = storageChange;
    console.log('storageChanges:', changes, other)
    //setMarkLatestPIdx(pIdx)
    //setMarkLatestCIdx(cIdx)
}

const getTabs = async () => {
    const tabs = await browser.tabs.query({})
    return tabs
}

const getUrlText = (u) => {
    //const tab = await browser.tabs.query({url:u})
    console.log(u)
    console.log(browser);
    console.log(window)
    const res = window.getTabText(u);
    console.log(res)
}

const getTabByUrl = async (url) => {
    const tab = await browser.tabs.query({url})
    return tab[0]
}

let _paragraphs = [[]];



export default function App () {
    const [tabsUrls, setTabsUrls] = useState([])
    const [paragraphUrl, setTabUrl] = useState('')

    const sendMessageToTab = async (url) => {
        const tab = await getTabByUrl(url);
        console.log(tab)
        browser.tabs
          .sendMessage(tab.id, { greeting: "Hi from background script" })
          .then((response) => {
            console.log("Message from the content script:");
            console.log(response);
            _paragraphs = response._paragraphs;
            setTabUrl(url)
          })
          .catch(onError);
    }

    const tabs = getTabs();
    tabs.then(tabs=>setTabsUrls(tabs.map(t=>t.url)))

    const urlList = tabsUrls.map(u=>{
        return (<li key={u}>
            {u}<button className='border' onClick={()=>sendMessageToTab(u)}>read</button>
        </li>)
    })


    return (<div className='flex flex-col text-white w-screen h-screen bg-black'>
        <h1>Graze</h1>
        <div><ol>{urlList}</ol></div>
        <Reader paragraphUrl={paragraphUrl} _paragraphs={_paragraphs} />
    </div>)
}
