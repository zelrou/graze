
import Reader from '@pages/main/Reader';
import {
    useState, useEffect
} from 'react';


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

const getTabs = async (queryInfo={}) => {
    let tabs = await browser.tabs.query(queryInfo)
    if (tabs.length) {
        tabs = tabs.sort((t1, t2) => (t1.id < t2.id))
    }
    return tabs
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
        /*
        if ( tabInfo.status === "complete" ) {
            if (!tabsIds().includes(tabId)
               || !tabsUrls().includes(tabInfo.url) ) {
                console.log('handleUpdated adding', tabs, tabId, changeInfo, tabInfo);
                setTabs(tabs => tabs.concat(tabInfo))
            }
        }
        */
    }

    const handleRemoved = (tabId, {windowId, isWindowClosing}) => {
        console.log('handleRemoved', tabId, windowId, isWindowClosing)
        setTabs(tabs=>tabs.filter(t=>t.id !== tabId))
    }

    useEffect(async () => {
        console.log('useEffect runs')
        const tabs = await getTabs();
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

/* ========== STORAGE FUNCS =========== */
//const storageChange = useSyncExternalStore(subscribeStorage, syncStorageState);
const defaultStorageValue = {pIdx: 0, cIdx: 0}

const setStorageBookmarkLatest = async () => {
    console.log('setStorageBookmarkLatest');
    const res = await browser.storage.local.set({
        [paragraphUrl]: { pIdx: paragraphIndex, cIdx: charIndex }
    })
    console.log('setStorageMarkOK', res)
}

const handleClickSetBookmarkLatest = async (e) => {
    e.preventDefault();
    return setStorageBookmarkLatest();
}

const handleClickGetBookmarkLatest = async (e) => {
    e.preventDefault();
    if (!isPaused) togglePaused(true);
    let res = await browser.storage.local.get(paragraphUrl)
    if (res) { res = res[paragraphUrl]; }
    console.log('handleClickGetBookmarkLatest', res);
    if (res && (res.pIdx !== paragraphIndex)) {
        setParagraphIndex(res.pIdx);
    }
    if (res && (res.cIdx !== charIndex)) {
        setCharIndex(res.cIdx);
    }
}

const handleClickClearBookmarks = async (e) => {
    e.preventDefault()
    browser.storage.local.set({[paragraphUrl]: {pIdx: 0, cIdx: 0}})
}

/*
const [isStorageInitialized, setIsStorageInitialized] = useState(false);
const initializeStorage = async () => {
    if (!isStorageInitialized) {
        const storageKeys = await browser.storage.local.getKeys();
        if (!storageKeys.includes(paragraphUrl)) {
            browser.storage.local.set({[paragraphUrl]: defaultStorageValue});
        }
        setIsStorageInitialized(true);
    }
}
*/

const blacklistProtocol = ['about:', 'moz-extension:']
const useLocalStorage = () => {
    const [stateLocalStorage, setStateLocalStorage] = useState({});
    useEffect(async () => {
        const res = await browser.storage.local.get()

        setStateLocalStorage(res);

        const storeListener = async (c,n) => {
            console.log('storeListener:', c, n);
            const res = await browser.storage.local.get();
            setStateLocalStorage(res);
        }
        browser.storage.local.onChanged.addListener(storeListener)
        return () => { browser.storage.local.onChanged.removeListener(storeListener) }
    }, []);
    const setLocalStorage = async (x,v=null) => {
        console.log('setLocalStorage', x, v);
        if (v) { return browser.storage.local.set({[x]:v}) }
        else { return browser.storage.local.set(stateLocalStorage.concat(x)) }
    }

    console.log('end:useLocalStorage')//, stateLocalStorage);
    return [stateLocalStorage, setLocalStorage];
}

/* ========== OPEN TAB LIST ========== */
let _paragraphs = [[]];

const UrlList = ({tabs, setReaderUrl, latestMarks}) => {
    const sendMessageToTab = async tabId => {
        const tabResponse = await browser.tabs.sendMessage(tabId,
            { greeting: "Hi from background script" })
        console.log("Message from the content script:");
        console.log(tabResponse);
        _paragraphs = tabResponse._paragraphs;
        const targetTab = tabs.filter(t => t.id === tabId)[0]
        setReaderUrl(targetTab.url)
    }
    //console.log('urlList latestMarks:', latestMarks)
    return tabs.length && tabs.map(t => {
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
                <td>{t.url}</td>
                <td>{pIdx}, {cIdx}</td>
                <td><button className='border'
                    onClick={() => sendMessageToTab(t.id)}>
                    read</button></td>
            </tr>) })
}

export default function App () {
    console.log('App didMount')
    const tabs = useTabStore();
    console.log('App prelocalStorage')
    const [localStorage, setLocalStorage] = useLocalStorage();
    //const [tabsUrls, setTabsUrls] = useState([])
    console.log('App preReaderUrl')
    const [readerUrl, setReaderUrl] = useState('');
    useEffect(()=>{
        if (Object.keys(localStorage).length){
            for (let tab of tabs) {
                const { protocol, href } = URL.parse(tab.url);
                const res = localStorage;
                //console.log('useLocalStorageEffect tab loop', href, res);
                if ( (!blacklistProtocol.includes(protocol))
                    && ( !res.hasOwnProperty(href)
                    || !res[href].hasOwnProperty('pIdx')
                    || !res[href].hasOwnProperty('cIdx') )) {
                    console.log('defaulting storageValue w params', tab, href, localStorage)
                    setLocalStorage(href, defaultStorageValue)
                }
            }
        }
    }, [tabs, localStorage, setLocalStorage])


    console.log('App preRender:')//, 'tabs', tabs,'readerUrl',readerUrl,'setReaderUrl', setReaderUrl,'stateLocalStorage', localStorage)

    return (<div className='w-screen h-screen flex flex-col items-center bg-black text-white'>
        <h1>Graze</h1>
        <h2>Open Tabs</h2>
        <table className='table-auto md:w-5/10'>
            <thead><tr>
                <th>Url</th>
                <th>Location</th>
                <th>Read</th>
            </tr></thead>
            <tbody>
                <UrlList tabs={ tabs } setReaderUrl={ setReaderUrl } latestMarks={ localStorage } />
            </tbody>
        </table>
        <Reader paragraphUrl={ readerUrl } _paragraphs={ _paragraphs } />
    </div>)
}


