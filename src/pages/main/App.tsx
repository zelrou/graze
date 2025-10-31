
import Reader from '@pages/main/Reader';
import {
    useState, useEffect
} from 'react';

import logo from '@assets/img/logo.svg';

const svgArrowRightCircle = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>)
const svgClipboard = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
</svg>)


const blacklistProtocol = ['about:', 'moz-extension:']
const defaultStorageValue = {sIdx:0, pIdx: 0, cIdx: 0}
const isInBlacklist = (s) => {
    const { protocol } = URL.parse(s);
    return blacklistProtocol.includes(protocol)
}

/* ========== TABS ========== */
const getTabs = async (queryInfo={}) => {
    let tabs = await browser.tabs.query(queryInfo)
    if (tabs.length) {
        tabs = tabs.sort((t1, t2) => (t1.id < t2.id))
    }
    return tabs.filter(t=>!isInBlacklist(t.url))
}

const useTabStore = () => {
    const [tabs, setTabs] = useState([])
    const tabsIds = () => (tabs.length > 0) ? tabs.map(t=>t.id).sort() : []
    const tabsUrls = () => (tabs.length > 0) ? tabs.map(t=>t.url).sort() : []
    console.log('useTabStore loads')//, tabs);

    const handleUpdated = async (tabId, changeInfo, tabInfo) => {
        console.log('handleUpdated', tabs, tabId, changeInfo, tabInfo);
        if ( tabInfo.status === "complete" ) {
            const ts = await getTabs()
            setTabs(ts);
        }
        /* TODO avoid getting all tabs in handleUpdated e.g.
        if (!tabsIds().includes(tabId)
           || !tabsUrls().includes(tabInfo.url) ) {
            console.log('handleUpdated adding', tabs, tabId, changeInfo, tabInfo);
            setTabs(tabs => tabs.concat(tabInfo))
        }
        */
    }

    const handleRemoved = (tabId, {windowId, isWindowClosing}) => {
        console.log('handleRemoved', tabId, windowId, isWindowClosing)
        setTabs(tabs=>tabs.filter(t=>t.id !== tabId))
    }

    useEffect(async () => {
        console.log('useEffect runs')
        /* TODO blacklistProtocol on tabs here */
        let tabs = await getTabs();
        setTabs(tabs);

        const updateFilters = {properties: ["status"]}

        browser.tabs.onUpdated.addListener(handleUpdated, updateFilters)
        browser.tabs.onRemoved.addListener(handleRemoved)
        return () => {
            browser.tabs.onUpdated.removeListener(handleUpdated, updateFilters)
            browser.tabs.onRemoved.removeListener(handleRemoved)
        }
    }, []);


    console.log('useTabStore ends')//, tabs);
    return tabs
}

const useLocalStorage = () => {
    const [stateLocalStorage, setStateLocalStorage] = useState({});
    const [isStorageInitialized, setIsStorageInitialized] = useState(false)

    const normalizeStorage = async keys => {
        for (let k of keys) {
            if (!k || isInBlacklist(k)) continue;
            const res = await browser.storage.local.get(k)
            const v = res[k]
            console.log('normalize', keys,k,v)
            if (!v.hasOwnProperty('sIdx') || !v.hasOwnProperty('pIdx') || !v.hasOwnProperty('cIdx')) {
                await browser.storage.local.set({ [k]: defaultStorageValue })
            }
        }
    }

    const initializeStorage = async () => {
        const keys = await browser.storage.local.getKeys();
        return normalizeStorage(keys)
    }

    useEffect(async () => {
        if (!isStorageInitialized) await initializeStorage()
        const res = await browser.storage.local.get()

        setStateLocalStorage(res);

        const storeListener = async (c,n) => {
            console.log('storeListener:', c, n);
            const res = await browser.storage.local.get();
            setStateLocalStorage(res);
        }

        setIsStorageInitialized(true);
        browser.storage.local.onChanged.addListener(storeListener)
        return () => { browser.storage.local.onChanged.removeListener(storeListener) }
    }, []);
    const setLocalStorage = async (x,v=null) => {
        console.log('setLocalStorage', x, v);
        if (v) { await browser.storage.local.set({[x]:v}) }
        else { await browser.storage.local.set(stateLocalStorage.concat(x)) }
        const res = await browser.storage.local.get()
        setStateLocalStorage(res);
    }


    console.log('end:useLocalStorage')//, stateLocalStorage);
    return [stateLocalStorage, setLocalStorage];
}

/* ========== OPEN TAB LIST ========== */
const defaultStructuredWork = {
    author: '',
    title: '',
    parts: [{ heading:'', paragraphs:[''] }]
}
let structuredWork = defaultStructuredWork;
const UrlList = ({tabs, setReaderUrl, latestMarks}) => {
    const sendMessageToTab = async tabId => {
        const tabResponse = await browser.tabs.sendMessage(tabId,
            { greeting: "Hi from background script" })
        console.log("Message from the content script:");
        console.log(tabResponse);
        //_paragraphs = tabResponse._paragraphs;
        structuredWork = tabResponse.structuredWork
        const targetTab = tabs.filter(t => t.id === tabId)[0]
        setReaderUrl(targetTab.url)
    }
    //console.log('urlList latestMarks:', latestMarks)
    return !tabs.length ? null : tabs.map(t => {
        const sIdx = (latestMarks.hasOwnProperty(t.url)
            && latestMarks[t.url].hasOwnProperty('sIdx'))
            ? latestMarks[t.url].sIdx
            : 0
        const pIdx = (latestMarks.hasOwnProperty(t.url)
            && latestMarks[t.url].hasOwnProperty('pIdx'))
            ? latestMarks[t.url].pIdx
            : 0
        const cIdx = (latestMarks.hasOwnProperty(t.url)
            && latestMarks[t.url].hasOwnProperty('cIdx'))
            ? latestMarks[t.url].cIdx
            : 0
        return (
            <tr key={t.id}>
                <td className='border-b p-2 border-gray-300 font-sans'>{t.title}</td>
                <td className='border-b p-2 border-gray-300 font-sans'>{t.url}</td>
                <td className='border-b p-2 border-gray-300 text-right font-mono'>{sIdx}.{pIdx}.{cIdx}</td>
                <td className='border-b p-2 border-gray-300'><button className=''
                    onClick={() => sendMessageToTab(t.id)}>
                    {svgArrowRightCircle}</button></td>
            </tr>) })
}

/* ========== PREV TAB LIST ========== */
const PrevUrlList = ({tabs, latestMarks}) => {
    const tabUrlList = tabs.map(t=>t.url)
    console.log('PrevUrlList') //,'latestMarks', latestMarks)
    const prevTabs = []
    if (Object.keys(latestMarks).length) {
        for (let [url, urlData] of Object.entries(latestMarks)) {
            if (!tabUrlList.includes(url)) {
                if ((urlData.hasOwnProperty('pIdx') && urlData.pIdx > 0)
                    || (urlData.hasOwnProperty('cIdx') && urlData.cIdx > 0) ) {
                        prevTabs.push({url, ...urlData})
                }
            }
        }
    }
    return !prevTabs.length ? null : prevTabs.map(pt => {
        return Object.keys(latestMarks).length && (
            <tr key={pt.url}>
                <td className='border-b p-2 border-gray-300 font-sans'>{pt.url}</td>
                <td className='border-b p-2 border-gray-300 text-right font-mono'>{pt.sIdx}{pt.pIdx}.{pt.cIdx}</td>
                <td className='border-b p-2 border-gray-300'><button className='border'
                    onClick={() => browser.tabs.create({url:pt.url})}>
                    read</button></td>
            </tr>) })
}


async function setClipboard(text="yooo") {
  const type = "text/plain";
  const clipboardItemData = {
    [type]: text,
  };
  const clipboardItem = new ClipboardItem(clipboardItemData);
  await navigator.clipboard.write([clipboardItem]);
}

export default function App () {
    console.log('App didMount')
    const tabs = useTabStore();
    console.log('App prelocalStorage')
    const [localStorage, setLocalStorage] = useLocalStorage();
    //const [tabsUrls, setTabsUrls] = useState([])
    console.log('App preReaderUrl')
    const [readerUrl, setReaderUrl] = useState('');
    /*
    useEffect(()=>{
        for (let tab of tabs) {
            const { href } = URL.parse(tab.url);
            const res = localStorage;
            //console.log('useLocalStorageEffect tab loop', href, res);
            if ( !isInBlacklist(tab.url)
                && ( !res.hasOwnProperty(href)
                || !res[href].hasOwnProperty('pIdx')
                || !res[href].hasOwnProperty('cIdx') )) {
                console.log('defaulting storageValue w params', tab, href, localStorage)
                setLocalStorage(href, defaultStorageValue)
            }
        }
    }, [tabs, localStorage, setLocalStorage])
    */

    console.log('App preRender:', localStorage)//, 'tabs', tabs,'readerUrl',readerUrl,'setReaderUrl', setReaderUrl,'stateLocalStorage', localStorage)

    return (<div className='w-screen h-screen flex flex-col space-y-4 items-center bg-zinc-950 text-zinc-200'>
        <div className='flex flex-col w-screen bg-zinc-800'>
            <div className='grid grid-rows-1 grid-cols-3 border-gray-300/50 border-b-4 px-4'>
                <img className='col-span-1 h-10 m-1' src={logo} alt='logo' />
                {/*<h1 className='col-span-1 col-start-2 text-center text-xl text-bold'></h1>*/}
                <div className='col-start-3 col-span-1 justify-self-end flex flex-row space-x-4 justify-between text-center text-sm'>
                    <button
                        className='basis-xs border-gray-300 text-mono'
                        onClick={()=>setClipboard(JSON.stringify(localStorage))}>
                        {svgClipboard}export</button>
                    <a className='basis-xs self-center' href='github.com'>github</a>
                </div>
            </div>
        </div>
        <h2 className='text-lg text-semibold'>Open Tabs</h2>
        <table className='table-auto md:w-7/10 bg-zinc-800 border-gray-300/50 border-4'>
            <thead className='text-left text-sans text-xs border-b-2 border-gray-300'><tr>
                <th className='p-2'>TITLE</th>
                <th className='p-2'>URL</th>
                <th className='p-2 text-right'>LOCATION</th>
                <th></th>
            </tr></thead>
            <tbody className='text-left'>
                <UrlList
                    tabs={ tabs }
                    setReaderUrl={ setReaderUrl }
                    latestMarks={ localStorage } />
            </tbody>
        </table>
        <h2 className='text-lg text-semibold'>Previous Tabs</h2>
        <table className='table-auto md:w-7/10'>
            <thead><tr>
                <th>Url</th>
                <th>Location</th>
                <th></th>
            </tr></thead>
            <tbody>
                <PrevUrlList tabs={ tabs } latestMarks={ localStorage } />
            </tbody>
        </table>
        <Reader
            paragraphUrl={ readerUrl }
            structuredWork={ structuredWork || defaultStructuredWork }
            setLocalStorage={ setLocalStorage } />
    </div>)
}


