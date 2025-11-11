import {
    useState, useEffect, useRef, useReducer, createContext, useContext,
    useEffectEvent, useSyncExternalStore, useCallback
} from 'react';

import { isInDenylist, useTabStore } from './hooks/useTabStore';
import { toastStore } from './ToastStore';
import { useLocalStorage } from './hooks/useLocalStorage';
import ToolbarTop from './components/ToolbarTop';
import Reader from '@pages/main/Reader';

const svgArrowRightCircle = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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

/* ========== OPEN TAB LIST ========== */
const defaultStructuredWork = {
    author: '',
    title: '',
    parts: [{ heading:'', paragraphs:[''] }]
}
let structuredWork = defaultStructuredWork;
const UrlList = ({tabs, readerUrl, setReaderUrl, localStorage, setIsMinimized}) => {
    const sendMessageToTab = useCallback(async tabId => {
        const tabResponse = await browser.tabs.sendMessage(tabId,
            { greeting: "Hi from background script" })
        console.log("Message from the content script:");
        console.log(tabResponse);
        //_paragraphs = tabResponse._paragraphs;
        structuredWork = tabResponse.structuredWork
        const targetTab = tabs.filter(t => t.id === tabId)[0]
        setReaderUrl(targetTab.url)
    },[tabs, setReaderUrl])
    //console.log('urlList latestMarks:', latestMarks)
    return !tabs.length ? null : tabs.map(t => {
        const sIdx = (localStorage.hasOwnProperty(t.url)
            && localStorage[t.url].hasOwnProperty('sIdx'))
            ? localStorage[t.url].sIdx
            : 0
        const pIdx = (localStorage.hasOwnProperty(t.url)
            && localStorage[t.url].hasOwnProperty('pIdx'))
            ? localStorage[t.url].pIdx
            : 0
        const cIdx = (localStorage.hasOwnProperty(t.url)
            && localStorage[t.url].hasOwnProperty('cIdx'))
            ? localStorage[t.url].cIdx
            : 0
        return (
            <tr key={t.id}
                className={[
                    ((readerUrl === t.url) ? 'bg-emerald-300/40' : ''),
                    (t.discarded ? 'opacity-30' : '')
                    ].join(' ')}>
                <td className='border-b p-2 border-gray-300 font-sans'>
                    <div className='flex flex-row items-center'>
                        { !t.favIconUrl ? null : <img
                            className='w-[16px] h-[16px] mr-1'
                            src={t.favIconUrl}/> }
                        <span>{ t.title ? t.title : t.url}</span>
                    </div></td>
                {/*<td className='border-b p-2 border-gray-300 font-sans'>{t.url}</td>*/}
                <td className='border-b p-2 border-gray-300 text-right font-mono'>{sIdx}.{pIdx}.{cIdx}</td>
                <td className='border-b p-2 border-gray-300 text-center'>
                    <button disabled={t.discarded ? true : false } className='hover:bg-emerald-500/50 p-1'
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

/* ========== APP ========== */
export default function App() {
    console.log('=================== App didMount ===================')
    /* HOOKS */
    console.log('App preTabStore')
    const tabs = useTabStore();
    console.log('App prelocalStorage')
    const [localStorage, setLocalStorage] = useLocalStorage()
    /* STATE */
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

    /* ========== WINDOW MINIMIZE/MAXIMIZE ========== */
    const handleClickMinimize = () => {
        console.log('handleClickMinimize', isMinimized)
        if (!isPaused) togglePaused(isPaused => true)
        if (!isMinimized) { setIsMinimized(true);
        } else {
            setIsMinimized(false);
        }
    };

    /* ========== RENDER ========== */
    console.log('App preRender:', localStorage)//, 'tabs', tabs,'readerUrl',readerUrl,'setReaderUrl', setReaderUrl,'stateLocalStorage', localStorage)

    return (<div className={`relative w-screen min-h-screen h-full flex
        flex-col space-y-4 items-center pb-20 bg-zinc-950 text-zinc-200`}>

        <ToolbarTop setMsg={setMsg} localStorage={localStorage} setLocalStorage={setLocalStorage}/>

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
                        localStorage={ localStorage }
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
        {(!(readerUrl && structuredWork) ? null : (
        <Reader
            localStorage={localStorage[readerUrl] || {sIdx:0, pIdx:0,cIdx:0}}
            paragraphUrl={ readerUrl }
            structuredWork={ structuredWork || defaultStructuredWork }
            setLocalStorage={ setLocalStorage }
            isPaused={isPaused} togglePaused={togglePaused}
            handleClickMinimize={handleClickMinimize}
            isMinimized={isMinimized}
            setIsMinimized={setIsMinimized}
            addToast={toastStore.addToast}
        />))}
    </div>)
}



