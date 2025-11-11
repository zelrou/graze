import OpenTabList from "./OpenTabList"

export default function OpenTabsTable({structuredWork, tabs, readerUrl, setReaderUrl, localStorage, setIsMinimized}) {
    return (<div className='w-screen md:w-7/10 overflow-auto'>
        <table className='table-fixed md:table-auto w-full bg-zinc-800 border-gray-300/50 border-4'>
            <thead className='text-left text-sans text-xs border-b-2 border-gray-300'><tr>
                <th className='p-2 w-3/10'>TITLE</th>
                {/*<th className='p-2'>URL</th>*/}
                <th className='p-2 w-1/10 text-right'>LOCATION</th>
                <th className='w-1/10'></th>
            </tr></thead>
            <tbody className='text-left'>
                <OpenTabList
                    structuredWork={structuredWork}
                    tabs={ tabs }
                    readerUrl={ readerUrl }
                    setReaderUrl={ setReaderUrl }
                    localStorage={ localStorage }
                    setIsMinimized={setIsMinimized} />
            </tbody>
        </table>
    </div>)
}
