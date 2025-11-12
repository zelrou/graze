import { useCallback, useEffect, useRef } from "react";

const svgArrowRightCircle = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>)
const svgWindow = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V8.25m-18 0V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6ZM7.5 6h.008v.008H7.5V6Zm2.25 0h.008v.008H9.75V6Z" />
</svg>)

export default function OpenTabList({
        structuredWork,
        tabs,
        readerUrl, setReaderUrl,
        localStorage, setIsMinimized
    }) {

    const sendMessageToTab = useCallback(async tabId => {
        const tabResponse = await browser.tabs.sendMessage(tabId,
            { greeting: "Hi from background script" })
        console.log("Message from the content script:");
        console.log(tabResponse);
        structuredWork.current = tabResponse.structuredWork
        const targetTab = tabs.filter(t => t.id === tabId)[0]
        setReaderUrl(targetTab.url)
    },[tabs, setReaderUrl])

    window.sendMessageToTab = sendMessageToTab;

    /*
     * useEffect opens Reader to tabId from Popup's search param
     * useRef 'navigated' so that its called once, only on page load
     */
    const navigated = useRef(false)
    useEffect(() => {
        if (navigated.current) return null
        const paramsString = window.location.search
        const searchParams = new URLSearchParams(paramsString)
        const hasSearchParam = searchParams.has('tabId')
        if (hasSearchParam && tabs.length) {
            const tabId = Number.parseInt(searchParams.get('tabId'))
            if ( tabs.filter(t=>t.id===tabId).length ) {
                navigated.current = true
                sendMessageToTab(tabId)
            }
        } else if (!hasSearchParam && tabs.length) {
            /* component is tab aware and no search params found
             * setting navigated ensures this effect
             * is skipped in future as tabs change */
            navigated.current = true;
        }
    },[tabs])


    return (!tabs.length ? null : tabs.map(t => {
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

                <td className='border-b p-2 border-gray-300 text-right font-mono'>
                    {sIdx}.{pIdx}.{cIdx}</td>

                <td className='border-b p-2 border-gray-300 text-center'>
                    <button disabled={t.discarded ? true : false } className='hover:bg-emerald-500/50 p-1'
                        onClick={() => readerUrl === t.url ? setIsMinimized(false) : sendMessageToTab(t.id)}>
                        {(readerUrl !== t.url) ? svgArrowRightCircle : svgWindow }</button></td>
            </tr>)
    }))
}


