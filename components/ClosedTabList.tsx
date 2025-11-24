const svgArrowTopRightOnSquare = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
</svg>)
const svgXMark = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>)

export default function ClosedTabList ({tabs, latestMarks}) {
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
                if ((urlData.hasOwnProperty('sIdx') && urlData.sIdx >= 0)
                    || (urlData.hasOwnProperty('pIdx') && urlData.pIdx >= 0)
                    || (urlData.hasOwnProperty('cIdx') && urlData.cIdx >= 0) ) {
                        prevTabs.push({url, ...urlData})
                }
            }
        }
    }
    console.log('PREVTABS========', prevTabs)
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
