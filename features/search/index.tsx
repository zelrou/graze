import { SetLocationContext } from "@/contexts"

const svgChevronRight2 = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
</svg>)

const SearchResultTableRow = ({match, setIsOpenSearchContainer}) => {
    const { setLocation } = useContext(SetLocationContext)
    const sIdx = match.at(0)
    const pIdx = match.at(1)
    const cIdx = match.at(2)
    const locString = `${sIdx}.${pIdx}.${cIdx}`
    return (<tr>
        <td className='border-b p-2 pl-8 border-gray-300'>{match[3]}</td>
        <td className='border-b p-2 pl-8 border-gray-300 text-right'>{locString}</td>
        <td className='border-b border-gray-300'>
            <button className='w-full h-full hover:bg-emerald-500/50'
                onClick={()=>{
                    setLocation(sIdx, pIdx, cIdx)
                    setIsOpenSearchContainer(false)
                }}>
                {svgChevronRight2}</button></td>
        </tr>)
}

const SearchResultTable = memo(({searchResults, paragraphUrl, setIsOpenSearchContainer}) => {
    const tableRows = searchResults.map(searchResult=>(
        <SearchResultTableRow match={searchResult} setIsOpenSearchContainer={setIsOpenSearchContainer} />))
    return (<table className='border-separate'>
        <thead><td></td><td></td><td></td></thead>
        <tbody className={'text-sm'}>{tableRows}</tbody>
    </table>)
})

function* genParts(sw) {
    yield* sw.parts.entries()
}

function* genParagraphs(sw) {
    for (let [sIdx, part] of genParts(sw)) {
        for (let [pIdx, paragraph] of part.paragraphs.entries()){
            yield [sIdx,pIdx,paragraph,part.heading]
        }
    }
}

export const SearchContainer = ({structuredWork, paragraphUrl, setIsOpenSearchContainer}) => {
    const [searchQuery, setSearchQuery] = useState('')
    const prevParagraphUrl = useRef(null)
    const searchInputRef = useRef(null)
    if (paragraphUrl !== prevParagraphUrl.current) {
        prevParagraphUrl.current = paragraphUrl
        setSearchQuery('')
        if (searchInputRef.current) searchInputRef.current.value = ''
    }
    const contextLen = 40;
    const searchResults = useMemo(() => {
        const q = searchQuery
        const res = []

        if (!q) return [];
        let rQ;
        try {
            rQ = new RegExp(q, 'gid')
        } catch (e) {
            console.error(e);
            return res;
        }
        console.log('starting search', paragraphUrl, rQ);
        for (let paragraph of genParagraphs(structuredWork)) {
            //console.log(paragraph)
            const target = paragraph[2]
            // console.log('searching target,query', target, rQ)
            const matches = target.matchAll(rQ)
            for (const match of matches) {
                const startMatch = match.index
                const endMatch = match.indices[0][1]
                const ctxStart = Math.max(0,startMatch-contextLen)
                const ctxEnd = endMatch + contextLen
                const contextMatch = match.input.slice(ctxStart, ctxEnd)
                // console.log(target, paragraph)
                const m = [paragraph[0],paragraph[1],startMatch,contextMatch]
                res.push(m)
            }
        }
        return res;
    }, [searchQuery])

    const handleQueryChange = e => e.stopPropagation();

    const handleSubmitSearch = e => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const {query} = Object.fromEntries(formData)
        console.log('search submit data', query);
        setSearchQuery(query);
    }

    console.log(searchResults)
    return(<>
        <form className='ml-4 p-1 flex flex-row space-x-2' method='post' onSubmit={handleSubmitSearch}>
            <input name='query' type='text' minLength={4} maxLength={20}
                className='bg-zinc-700 pl-1 font-sans focus:outline-2'
                onChange={handleQueryChange} ref={searchInputRef} autoFocus />
            <button className='border-2 border-zinc-700 px-3 py-1 hover:border-zinc-400'> Search</button>
        </form>
        <SearchResultTable searchResults={searchResults} paragraphUrl={paragraphUrl} setIsOpenSearchContainer={setIsOpenSearchContainer}/>
    </>)
}
