import {
    useState, useEffect, useRef, useReducer, createContext, useContext,
    useEffectEvent, useSyncExternalStore
} from 'react';

import { encodeUnicode, decodeUnicode } from './encodeUtils';
import Reader from '@pages/main/Reader';
import { toastStore } from './ToastStore';
import logo from '@assets/img/logo.svg';

const svgArrowRightCircle = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>)
const svgClipboard = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
</svg>)
const svgWindow = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V8.25m-18 0V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6ZM7.5 6h.008v.008H7.5V6Zm2.25 0h.008v.008H9.75V6Z" />
</svg>)
const svgArrowTopRightOnSquare = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
</svg>)
const svgXMark = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>)
const svgTrash = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>)
const svgQuestionMarkCircle = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
</svg>)



const denylistProtocol = ['about:', 'moz-extension:', 'graze']
const defaultStorageValue = {sIdx:0, pIdx: 0, cIdx: 0}
const isInDenylist = (s) => {
    if (s === 'graze') return true
    const { protocol } = URL.parse(s);
    return denylistProtocol.includes(protocol)
}

/* ========== TABS ========== */
const getTabs = async (queryInfo={}) => {
    let tabs = await browser.tabs.query(queryInfo)
    if (tabs.length) {
        tabs = tabs.sort((t1, t2) => (t1.id < t2.id))
    }


    return tabs.filter(t=>!isInDenylist(t.url))
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
        /* TODO denylistProtocol on tabs here */
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
            if (!k || isInDenylist(k)) continue;
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
        else { await browser.storage.local.set(x) }
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
const UrlList = ({tabs, readerUrl, setReaderUrl, latestMarks, setIsMinimized}) => {
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
            <tr key={t.id} className={readerUrl === t.url ? 'bg-emerald-300/40' : ''}>
                <td className='border-b p-2 border-gray-300 font-sans'>{t.title}</td>
                {/*<td className='border-b p-2 border-gray-300 font-sans'>{t.url}</td>*/}
                <td className='border-b p-2 border-gray-300 text-right font-mono'>{sIdx}.{pIdx}.{cIdx}</td>
                <td className='border-b p-2 border-gray-300 text-center'>
                    <button className='hover:bg-emerald-500/50 p-1'
                        onClick={() => readerUrl === t.url ? setIsMinimized(false) : sendMessageToTab(t.id)}>
                        {(readerUrl !== t.url) ? svgArrowRightCircle : svgWindow }</button></td>
            </tr>) })
}

/* ========== PREV TAB LIST ========== */
const PrevUrlList = ({tabs, latestMarks}) => {
    const handleClickRemovePreviousTab = async (e, url) => {
        e.preventDefault()
        return browser.storage.local.remove(url)
    }
    const tabUrlList = tabs.map(t=>t.url)
    console.log('PrevUrlList') //,'latestMarks', latestMarks)
    const prevTabs = []
    if (Object.keys(latestMarks).length) {
        for (let [url, urlData] of Object.entries(latestMarks)) {
            if (!tabUrlList.includes(url)) {
                if ((urlData.hasOwnProperty('sIdx') && urlData.sIdx > 0)
                    || (urlData.hasOwnProperty('pIdx') && urlData.pIdx > 0)
                    || (urlData.hasOwnProperty('cIdx') && urlData.cIdx > 0) ) {
                        prevTabs.push({url, ...urlData})
                }
            }
        }
    }
    return !prevTabs.length ? null : prevTabs.map(pt => {
        return Object.keys(latestMarks).length && (
            <tr key={pt.url}>
                <td className='border-b p-2 border-gray-300 font-sans'>
                    <div className='flex gap-1'>
                        <button className='p-1 hover:bg-rose-500/50'
                            onClick={(e) => handleClickRemovePreviousTab(e, pt.url)}>
                            {svgXMark}</button>
                        <span className='text-sm p-1'>{pt.url}</span></div></td>
                <td className='border-b p-2 border-gray-300 text-sm text-right font-mono'>{pt.sIdx}.{pt.pIdx}.{pt.cIdx}</td>
                <td className='border-b p-2 border-gray-300 text-center'>
                    <button className='hover:bg-yellow-500/50 p-1'
                    onClick={() => browser.tabs.create({url:pt.url})}>
                    {svgArrowTopRightOnSquare}</button>
                </td>
            </tr>) })
}


async function setClipboard(text="<3") {
  const type = "text/plain";
  const clipboardItemData = {
    [type]: text,
  };
  const clipboardItem = new ClipboardItem(clipboardItemData);
  await navigator.clipboard.write([clipboardItem]);
}

const ModalContext = createContext(null)
const ModalContainer = ({...props}) => {
    /* TODO pass all props to dialog and props.modalContext to ModalContext? */
    const {children, modalRef, onClose, className} = props;
    const defaultClass = 'backdrop:bg-black/60 place-self-center'
    const classStr = `${defaultClass} ${className}`
    return (
        <ModalContext value={modalRef}>
            <dialog
                className={classStr}
                ref={modalRef}
                onClose={onClose}>
                {children}
            </dialog>
        </ModalContext>
    )
}

const WelcomeModal = ({setLocalStorage, setShowHelp}) => {
    const modalRef = useContext(ModalContext)
    return (<div className='p-4 space-y-4 flex flex-col items-center'>
        <h2 className='text-center text-lg'>Welcome!</h2>
        <div className=''>
            <p>
                In another tab, open a page you want to read (e.g. a <a target="_blank" href="https://en.wikipedia.org/wiki/Special:Random">random wikipedia article</a>).
                <br />
                You'll see the page in your Open Tabs list.
                <br />
                Click the arrow to the right of the corresponding tab to enter the Reader Mode.
            </p>
            <p>From there you can ...</p>
            <ul>
                <li>+ Click the arrows on the left and right to seek forward and back in the text</li>
                <li>+ Use the arrow keys to seek</li>
                <li>+ Click the play button at the bottom to auto-seek</li>
            </ul>
            <p>As you seek, you'll see your progress and location update</p>
            <p>Click Mark Progress so you can come back to that position</p>
        </div>
        <div className='flex flex-row space-x-4'>
            <button
                onClick={ async() => {
                    await setLocalStorage('graze', {'setup': false})
                    setShowHelp(false)
                    modalRef.current.close()
                }}
                className='border-1 border-gray-300 p-1'>dont show this again</button>
            <button autoFocus
                onClick={()=>{
                    setShowHelp(false)
                    modalRef.current.close()
                }}
                className='border-1 border-gray-300 p-1'>dismiss</button>
        </div>
    </div>)
}


/* ========== APP ========== */
export default function App ({}) {
    console.log('App didMount')
    const tabs = useTabStore();
    console.log('App prelocalStorage')
    const [localStorage, setLocalStorage] = useLocalStorage();
    console.log('App preReaderUrl')
    const [readerUrl, setReaderUrl] = useState('');
    const [isMinimized, setIsMinimized] = useState(true);
    const [isPaused, togglePaused] = useState(true)

    /* ========== TOASTS ========== */
    /* TODO create custom hook */
    const toasts = useSyncExternalStore(
        toastStore.subscribe,
        toastStore.getSnapshot)

    const [msg, setMsg] = useState('');
    useEffect(()=>{
        if (msg) {
            toastStore.addToast(msg)
        }
    }, [msg, toasts])

    /* ========== WELCOME / HELP MODAL REF ========== */
    const modalRef = useRef(null)
    const isSetup = (localStorage.hasOwnProperty('graze')
        && localStorage['graze'].setup)
    const [showHelp, setShowHelp] = useState(false)
    const handleClickHelp = () => {
        setShowHelp(true)
    };
    console.log('WELCOME setup,help', isSetup,showHelp)
    useEffect(()=>{
        if (isSetup) setShowHelp(true);
    }, [isSetup, setShowHelp])
    if (modalRef.current && ((isSetup&&showHelp) || (showHelp&&!isSetup))) {
        modalRef.current.showModal();
    }

    /* ========== WINDOW MINIMIZE/MAXIMIZE ========== */
    const handleClickMinimize = () => {
        console.log('handleClickMinimize', isMinimized)
        if (!isPaused) togglePaused(isPaused => true)
        if (!isMinimized) { setIsMinimized(true);
        } else {
            setIsMinimized(false);
        }
    };

    /* ========== TOOLBAR: CLEAR STORAGE ==========  */
    const clearAllStorageRef = useRef(null)
    const clearAllStorageTooltipRef = useRef(null)

    const handleClickClearAllStorage = async (e) => {
        e.preventDefault()
        console.log('handleClickClearAllStorage')
        for (const key of Object.keys(localStorage)) {
            browser.storage.local.remove(key)
        }
        if (clearAllStorageRef.current) {
            clearAllStorageRef.current.hidePopover()
        }
        setMsg('Storage cleared!')
        return null
    }


    /* ========== TOOLBAR: EXPORT STORAGE ==========  */
    const exportStorageTooltipRef = useRef(null)
    const handleClickExport = (e) => {
        e.preventDefault()
        const uniStr = JSON.stringify(localStorage)
        const encoded = encodeUnicode(uniStr)
        console.log(encoded)
        setClipboard(encoded)
        setMsg('Copied data to clipboard.')
    }


    /* ========== TOOLBAR: IMPORT STORAGE ==========*/
    const importModalRef = useRef(null)
    const inputTextAreaImportModalRef = useRef(null)
    const handleClickOpenImportModal = (e) => {
        e.preventDefault()
        importModalRef.current.showModal()
    }
    const handleClickSubmitImportModal = (e) => {
        e.preventDefault()
        const res = inputTextAreaImportModalRef.current.value;
        importModalRef.current.close(res)
    }
    /* https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog#handling_the_return_value_from_the_dialog */
    const onCloseImportModal = async (e) => {
        inputTextAreaImportModalRef.current.value = ''
        const { returnValue } = importModalRef.current

        let decodedStr;
        try {
            decodedStr = decodeUnicode(returnValue)
        } catch(e) {
            console.log(e)
            decodedStr = null
        }

        if (!decodedStr) {
            setMsg(`Import failure: invalid import string.`)
            return null
        }

        let decoded;
        try {
            decoded = JSON.parse(decodedStr)
        } catch(e){
            console.log(e)
            setMsg(`Import failure: failed to parse import string.`)
            return null
        }

        let result = null
        try {
            console.log(decoded)
            await setLocalStorage(decoded)
            result = 'success'
        } catch(e) {
            console.log(e)
            result = 'failure'
        }

        switch(result) {
            case 'failure': {
                setMsg(`Import failure: error storing data.`)
                return null
             }
            case 'success': {
                setMsg(`Successfully imported data!`)
                console.log('success imported', decoded)
                return null
            }
            default: {
                setMsg('Import failure: unexpected error.')
                return null
            }
        }
    }


    /* ========== RENDER ========== */
    console.log('App preRender:', localStorage)//, 'tabs', tabs,'readerUrl',readerUrl,'setReaderUrl', setReaderUrl,'stateLocalStorage', localStorage)

    return (<div className={`relative w-screen min-h-screen h-full flex
        flex-col space-y-4 items-center pb-20 bg-zinc-950 text-zinc-200`}>
        <ModalContainer modalRef={modalRef}>
            <WelcomeModal setShowHelp={setShowHelp} setLocalStorage={setLocalStorage} />
        </ModalContainer>
        <ModalContainer modalRef={importModalRef} onClose={onCloseImportModal}>
           <form method='dialog' className='flex flex-col'>
                <label className='flex flex-col' for='importStorageInput'>
                    <p>paste exported settings here:</p>
                    <textarea
                        ref={inputTextAreaImportModalRef}
                        name='importStorageInput'></textarea>
                </label>
                <div className='flex flex-row'>
                    <button
                        onClick={handleClickSubmitImportModal}>
                        confirm</button>
                    <button autoFocus>cancel</button>
                </div>
            </form>
        </ModalContainer>
        <div className='flex flex-col w-screen bg-zinc-800'>
            {/* ========== TOP TOOLBAR ========== */}
            <div id='app-toolbar-top' className='grid grid-rows-1 grid-cols-3 border-gray-300/50 border-b-4 px-4'>
                {/* LEFT (col-1/3 */}
                <img className='col-span-1 h-10 m-1' src={logo} alt='logo' />
                {/* RIGHT (col-start-3/3) */}
                <div className={`relative col-start-3 col-span-1 justify-self-end
                    flex flex-row space-x-4 justify-between text-center text-sm`}>
                    <button onClick={handleClickHelp}>
                        {svgQuestionMarkCircle}</button>
                    <button popoverTarget='confirmClearAllStorage'
                        className='basis-xs text-mono'
                        onMouseOver={(e)=>clearAllStorageTooltipRef.current.showPopover()}
                        onMouseOut={(e)=>clearAllStorageTooltipRef.current.hidePopover()}
                        onFocus={(e)=>clearAllStorageTooltipRef.current.showPopover()}
                        onBlur={(e)=>clearAllStorageTooltipRef.current.hidePopover()}>
                        {svgTrash}
                        <div ref={clearAllStorageTooltipRef} id="tooltip-app-cas"
                            className="tooltip" popover="hint">Clear All Storage</div>
                    </button>
                    <div popover="auto" id='confirmClearAllStorage'
                        ref={clearAllStorageRef}
                        className={`open:absolute open:grid opacity-0 open:opacity-90`}>
                        <div className='place-self-center'>
                            <h3 className='text-lg'>Clear All Storage?</h3>
                            <button className='border p-3 mx-2'
                                onClick={(e)=>handleClickClearAllStorage(e)}>
                                confirm</button>
                            <button className='border p-3 mx-2'
                                popoverTarget='confirmClearAllStorage'>
                                cancel</button>
                        </div>
                    </div>
                    <button className='basis-xs text-mono'
                        onClick={handleClickExport}
                        onMouseOver={(e)=>exportStorageTooltipRef.current.showPopover()}
                        onMouseOut={(e)=>exportStorageTooltipRef.current.hidePopover()}
                        onFocus={(e)=>exportStorageTooltipRef.current.showPopover()}
                        onBlur={(e)=>exportStorageTooltipRef.current.hidePopover()}>
                        {svgClipboard}
                        <div popover='hint' className='tooltip' ref={exportStorageTooltipRef}>
                            Export Storage to Clipboard</div>
                    </button>
                    <button className='basis-xs text-mono'
                        onClick={handleClickOpenImportModal}>
                        import
                    </button>
                    <a className='basis-xs self-center' href='github.com'>github</a>
                </div>
            </div>
        </div>

        <h2 className='text-lg text-semibold'>Open Tabs</h2>
        <div className='w-screen md:w-7/10 overflow-auto'>
            <table className='table-fixed md:table-auto w-full bg-zinc-800 border-gray-300/50 border-4'>
                <thead className='text-left text-sans text-xs border-b-2 border-gray-300'><tr>
                    <th className='p-2 w-3/10'>TITLE</th>
                    {/*<th className='p-2'>URL</th>*/}
                    <th className='p-2 w-1/10 text-right'>LOCATION</th>
                    <th className='w-1/10'></th>
                </tr></thead>
                <tbody className='text-left'>
                    <UrlList
                        tabs={ tabs }
                        readerUrl={ readerUrl }
                        setReaderUrl={ setReaderUrl }
                        latestMarks={ localStorage }
                        setIsMinimized={setIsMinimized} />
                </tbody>
            </table>
        </div>
        <h2 className='text-lg text-semibold'>Previous Tabs</h2>
        <div className='w-screen md:w-7/10 overflow-auto'>
            <table className='table-fixed md:table-auto w-full'>
                <thead><tr>
                    <th className='p-2 w-3/10'>Url</th>
                    <th className='p-2 w-1/10 text-right'>Location</th>
                    <th className='w-1/10'></th>
                </tr></thead>
                <tbody>
                    <PrevUrlList tabs={ tabs } latestMarks={ localStorage } />
                </tbody>
            </table>
        </div>
        <Reader
            paragraphUrl={ readerUrl }
            structuredWork={ structuredWork || defaultStructuredWork }
            setLocalStorage={ setLocalStorage }
            isPaused={isPaused} togglePaused={togglePaused}
            handleClickMinimize={handleClickMinimize}
            isMinimized={isMinimized}
            setIsMinimized={setIsMinimized}
            addToast={toastStore.addToast}
        />
    </div>)
}


