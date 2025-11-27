import ClosedTabList from './ClosedTabList'

export default function ClosedTabsTable({tabs, localStorage}) {
    return (<div className='w-screen md:w-7/10 overflow-auto'>
        <table className='table-fixed md:table-auto w-full'>
            <thead><tr>
                <th className='p-2 w-3/10'>Url</th>
                <th className='p-2 w-1/10 text-right'>Location</th>
                <th className='w-1/10'></th>
            </tr></thead>
            <tbody>
                <ClosedTabList tabs={ tabs } latestMarks={ localStorage } />
            </tbody>
        </table>
    </div>)
}
