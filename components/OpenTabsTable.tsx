import OpenTabList from "./OpenTabList"

export default function OpenTabsTable({structuredWork, tabs, readerUrl, setReaderUrl, setIsMinimized}) {
    return (<div className='w-screen md:w-7/10 overflow-auto'>
        <table className='table-fixed md:table-auto w-full' >
            <thead className='text-left text-sans text-xs'><tr>
                <th className='p-2 w-3/10'></th>
                <th className='p-2 w-1/10 text-right'></th>
                <th className='w-1/10'></th>
            </tr></thead>
            <tbody className='text-left'>
                <OpenTabList
                    structuredWork={structuredWork}
                    tabs={ tabs }
                    readerUrl={ readerUrl }
                    setReaderUrl={ setReaderUrl }
                    setIsMinimized={setIsMinimized} />
            </tbody>
        </table>
    </div>)
}
