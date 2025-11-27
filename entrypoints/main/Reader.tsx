import {
    useState, useEffect, useEffectEvent, createContext, useContext,
    memo, useMemo, useRef, useCallback,
    createElement
} from 'react';
import { LocalStorageContext } from '@/contexts';

const DEFAULTS = {};
DEFAULTS.DELAY = 3000;

const svgChevronUp = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
</svg>)
const svgChevronDown = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
</svg>)
const svgChevronRight = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
</svg>)
const svgChevronLeft = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
</svg>)
const svgChevronRight2 = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
</svg>)
const svgMagnifyingGlass = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
</svg>)
const svgArrowTurnDownLeft = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m7.49 12-3.75 3.75m0 0 3.75 3.75m-3.75-3.75h16.5V4.499" />
</svg>)
const svgPlay = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
</svg>)
const svgPause = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
</svg>)
const svgCog6Tooth = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>)



const SetLocationContext = createContext(null)
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

const SearchContainer = ({structuredWork, paragraphUrl, setIsOpenSearchContainer}) => {
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

const LocationForm = ({structuredWork, paragraphUrl, sIdx, pIdx, cIdx, togglePaused}) => {
    const { setLocation } = useContext(SetLocationContext)
    const prevParagraphUrl = useRef(null)
    const [prevSIdx, setPrevSIdx] = useState(null)
    const [prevPIdx, setPrevPIdx] = useState(null)
    const [prevCIdx, setPrevCIdx] = useState(null)
    const [_sIdx, set_sIdx] = useState(0)
    const [_pIdx, set_pIdx] = useState(0)
    const [_cIdx, set_cIdx] = useState(0)

    let partLength, paragraphLength, charLength;
    const handleLocationChange = e => {
        e.stopPropagation();
        togglePaused(true);
        console.log(e.target)
        const inputVal = Number.parseInt(e.target.value)
        if (!inputVal) return null
        switch(e.target.name) {
            case 'partIndexInput': {
                const newVal = (((inputVal<partLength) && (inputVal>=0))
                    ? inputVal : 0)
                set_sIdx(newVal)
                set_pIdx(0)
                set_cIdx(0)
                break
            }
            case 'paragraphIndexInput': {
                const newVal = (((inputVal<paragraphLength) && (inputVal>=0))
                    ? inputVal : 0)
                set_pIdx(newVal)
                set_cIdx(0)
                break
            }
            case 'charIndexInput': {
                const newVal = (((inputVal<charLength) && (inputVal>=0))
                    ? inputVal : 0)
                set_cIdx(newVal)
                break
            }
            default:
                break
        }
    }

    const handleSubmitSettings = e => {
        e.preventDefault();
        e.stopPropagation();
        const form = e.target;
        const formData = new FormData(form);
        console.log(formData);
        const formJson = Object.fromEntries(formData)
        const s = Number(formJson.partIndexInput)
        const p = Number(formJson.paragraphIndexInput)
        const c = Number(formJson.charIndexInput)
        setLocation(s,p,c)
    }

    if (paragraphUrl !== prevParagraphUrl.current) {
        console.log('url change')
        prevParagraphUrl.current = paragraphUrl
        set_sIdx(0)
        set_pIdx(0)
        set_cIdx(0)
        partLength = structuredWork.parts.length
        paragraphLength = structuredWork.parts[0].paragraphs.length
        charLength = structuredWork.parts[0].paragraphs[0].length
    } else if (paragraphUrl) {
        console.log('same url')
        if (prevSIdx !== sIdx) {
            setPrevSIdx(sIdx)
            set_sIdx(sIdx)
        }
        if (prevPIdx !== pIdx) {
            setPrevPIdx(pIdx)
            set_pIdx(pIdx)
        }
        if (prevCIdx !== cIdx) {
            setPrevCIdx(cIdx)
            set_cIdx(cIdx)
        }
        partLength = structuredWork.parts.length
        paragraphLength =  structuredWork.parts[_sIdx].paragraphs.length
        charLength = structuredWork.parts[_sIdx].paragraphs[_pIdx].length
    }
    const locationMatches = ((_cIdx === cIdx) && (_pIdx === pIdx) && (_sIdx === sIdx))

    return (<div className='order-5 sm:order-4 w-full md:w-3/10 flex flex-col flex-grow-0 flex-shrink align-center justify-center'>
        <form method="post" onSubmit={handleSubmitSettings}
        className='flex-shrink flex-grow-0 flex gap-x-4 flex-row text-center sm:text-end justify-between sm:justify-center'>
        <div className='contents'>
            <label for='part'><span className='text-blue-300 font-semibold'>S:</span>
                <input type='number' name='partIndexInput'
                    className=''
                    min='0' max={partLength-1}
                    value={_sIdx}
                    onChange={e=>handleLocationChange(e)} />

            <span className='mr-2'>{ `/${partLength-1}` }</span>
            </label>
        </div>
        <div className='contents'>
            <label for='paragraph'><span className='text-green-300 font-semibold'>¶:</span>
                <input type='number' name='paragraphIndexInput'
                    className=''
                    min='0' max={paragraphLength-1}
                    value={_pIdx}
                    onChange={e=>handleLocationChange(e)} />

            <span className='mr-2'>{ `/${paragraphLength-1}` }</span>
            </label>
        </div>
        <div className='contents'>
            <label for='paragraph'><span className='text-red-300 font-semibold'>C:</span>
                <input type='number' name='charIndexInput'
                    className=''
                    min='0' max={charLength-1}
                    value={_cIdx}
                    onChange={e=>handleLocationChange(e)} />

                <span className='mr-2'>{ `/${charLength-1}` }</span>
            </label>
        </div>
        <button disabled={locationMatches} type="submit"
           className={locationMatches ? 'bg-zinc-500' : 'bg-indigo-500 hover bg-fuchsia-500'}>
           {svgArrowTurnDownLeft}</button>
    </form></div>)
}

export default function Reader({paragraphUrl, structuredWork, localStorage,
    handleClickMinimize, isMinimized, setIsMinimized, isPaused, togglePaused,
    addToast}) {
    const { setLocalStorage } = useContext(LocalStorageContext)
    console.log('================= Reader ===================')
    const [partIndex, setPartIndex] = useState(0);
    const [paragraphIndex, setParagraphIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [charInterval, setCharInterval] = useState(200);
    const defaultFontSize = (window.innerWidth < 641) ? 1 : 1.5;
    const [fontSize, setFontSize] = useState(defaultFontSize);

    const [delay, setDelay] = useState(DEFAULTS.DELAY);

    /* ========== SEARCH STATE & LOCATION CONTEXT ========== */
    const [isOpenSearchContainer, setIsOpenSearchContainer] = useState(false)
    const setLocation = useCallback((s=null, p=null, c=null) => {
        if ((s===null) && (p===null) && (c===null)) return null
        setPartIndex(s)
        setParagraphIndex(p)
        setCharIndex(c)
    }, [setPartIndex, setParagraphIndex, setCharIndex])

    /* ========== RESET LOCATION ON PROPS CHANGE ========== */
    const prevParagraphUrl = useRef(null)
    let partLength;
    let currentPart;
    let paragraphLength;
    let currentParagraph;
    let charLength;
    let heading;
    let mainText;
    let isCursorAtEnd;
    const paragraphChanged = paragraphUrl !== prevParagraphUrl.current;
    const prevNodeIndex = useRef(null)
    if (paragraphChanged) {
        console.log('READER: resetting location')
        prevParagraphUrl.current = paragraphUrl;
        setLocation(0,0,0)
        setIsMinimized(false);
        setIsOpenSearchContainer(false);
        isCursorAtEnd = false;
    } else {
        console.log('READER same url', paragraphUrl, prevParagraphUrl.current)//, structuredWork)
        partLength = structuredWork.parts.length
        currentPart = structuredWork.parts[partIndex]
        paragraphLength = currentPart.paragraphs.length
        currentParagraph = currentPart.paragraphs[paragraphIndex]
        charLength = currentParagraph.charLength
        heading = currentPart.heading
        /* TODO: implement isCursorAtEnd? */
        isCursorAtEnd = false;

        /* IF: currentParagraph is all text */
        if (typeof currentParagraph === 'string') {
            mainText = currentParagraph.slice(charIndex, charIndex+charInterval)
            charLength = currentParagraph.length
        /* ELSE: currentParagraph is a mix of node and elements */
        } else {
            mainText = []
            let charOffsetStart, charOffsetEnd;
            const {nodes} =currentParagraph
            /* TODO set nodeIndex to state or ref? */
            let nodeIndexStart, nodeIndexEnd;
            // IF we are at start of paragraph,
            if (charIndex === 0) {
                // THEN sync nodeIndex w charIndex
                nodeIndexStart = 0;

            // ELSE we need to find nodeIndexStart
            // loop until we hit charIndex or end of paragraph nodes
            } else {
                let charTotal = 0;
                let i = 0;
                do {
                    // we dont want to increment charTotal directly yet
                    const _charTotal = charTotal + nodes[i].charLength;
                    if (_charTotal < charIndex) {
                        // we're still behind index, keep seeking
                        charTotal = _charTotal;
                        i = i + 1;
                    } else {
                        // this node is at least long enough to reach index
                        // break early to keep the index
                        break;
                    }
                } while ((charTotal < charIndex) && (i<nodes.length-1))

                nodeIndexStart = i;
            }
            // continue seek method from nodeIndexStart
            // to find nodeIndexEnd
            // however this time stop before exceeding charInterval
            let charTotal = 0;
            let i = nodeIndexStart;
            do {
                const _charTotal = charTotal + nodes[i].charLength;
                if (_charTotal < charInterval) {
                    charTotal = _charTotal;
                    i = i + 1;
                } else {
                    if (prevNodeIndex.current === nodeIndexStart) {
                        charOffsetStart = charInterval - charTotal;
                    }
                    break;
                }
            } while ((charTotal < charInterval) && (i<nodes.length-1))
            nodeIndexEnd = i;

            if (prevNodeIndex.current === nodeIndexStart) {
                charOffsetStart = charIndex + charOffsetStart;
            } else {
                charOffsetStart = 0;
            }

            prevNodeIndex.current = nodeIndexEnd;

            console.log(charIndex, nodeIndexStart, nodeIndexEnd, charOffsetStart)
            const nodeSlice = nodes.slice(nodeIndexStart, nodeIndexEnd + 1)
            for (let node of nodeSlice) {
                if (node.type === '#text'){
                    mainText.push(node.children.slice(charOffsetStart, charInterval))
                } else {
                    const el = createElement(
                        node.type,
                        node.props,
                        node.children
                    )
                    mainText.push(el)
                }
            }
        }

        console.log(mainText)
    }

    /* ========== SEEKING ========== */
    /* TODO structuredWork class
     * make seeking into instance methods returning location for set state */
    const getPrevMainText = () => {
        const prevCharIndex = charIndex - charInterval;
        const prevParagraphIndex = paragraphIndex - 1;
        const prevPartIndex = partIndex - 1;
        let prevCharLength;
        let prevParagraphLength;
        console.log('getPrevMainText', charIndex, prevCharIndex, prevParagraphIndex, prevPartIndex)
        if (prevCharIndex < 0) { // we MAY need to go back a paragraph
            if (prevParagraphIndex < 0) { // we need to go back a part
                if (prevPartIndex < 0) { // we are at the beginnning
                    return null
                } else { // we will go back a whole part
                    setPartIndex(prevPartIndex);
                    prevParagraphLength = structuredWork.parts[prevPartIndex]
                        .paragraphs.length
                    prevCharLength = structuredWork.parts[prevPartIndex]
                        .paragraphs[prevParagraphLength - 1].length
                    // set paragraphIndex to last paragraph of previous part
                    setParagraphIndex(prevParagraphLength - 1);
                    // set charIndex to last chars of previous paragraph
                    const cIdx = Math.max(0, prevCharLength - charInterval)
                    setCharIndex(cIdx);
                }
            } else if (charIndex>0) { // we need to go to beginning of paragraph
                setCharIndex(0);
            } else{ // we DO need to go back a paragraph
                console.log('go back a paragraph')
                setParagraphIndex(prevParagraphIndex)
                prevCharLength = structuredWork.parts[partIndex]
                    .paragraphs[prevParagraphIndex].length
                // set charIndex to last chars of previous paragraph
                // set to in 0 in case prevCharIndex negative
                const prevCharIndex = prevCharLength - charInterval
                console.log(prevCharLength, prevCharIndex)
                setCharIndex((prevCharIndex > 0) ? prevCharIndex : 0);
            }
        } else { // we just need to back by charInterval
            setCharIndex(prevCharIndex)
        }
    }

    const getNextMainText = () => {
        console.log('getNextMainText')//structuredWork, partIndex, paragraphIndex)
        const nextcharIndex = charIndex + charInterval
        const nextParagraphIndex = paragraphIndex + 1
        const nextPartIndex = partIndex + 1

        if ( nextcharIndex > charLength - 1) { // we are at end of a paragraph
            if (nextParagraphIndex > paragraphLength - 1) { // we are part end
                if (nextPartIndex > partLength - 1) { // we are at end of work
                    isCursorAtEnd = true;
                    return null;
                } else { // move to next part
                    setPartIndex(nextPartIndex);
                    setParagraphIndex(0);
                    setCharIndex(0);
                }
            } else { // move to next paragraph
                setParagraphIndex(nextParagraphIndex)
                setCharIndex(0);
            }
        } else { // move to next charIndex
            setCharIndex(nextcharIndex)
        }
    }

    /* ========== TOOLBAR BOTTOM CONTROLS========== */
    {/* ---------- charInterval ---------- */}
    const handleCharIntervalChange = e => {
        console.log('handleCharIntervalChange', e, charInterval)
        e.preventDefault();
        e.stopPropagation();
        if (!isPaused) togglePaused(isPaused => true);
        const inputVal = Number.parseInt(e.target.value)
        let newVal = inputVal ? inputVal : 200
        newVal = (newVal>=1) && (newVal<=1000) ? newVal : 200
        setCharInterval(charInterval => newVal)
    }

    {/* ---------- fontSize ---------- */}
    const handleFontSizeChange = e => {
        if (!isPaused) togglePaused(isPaused => true)
        e.preventDefault()
        e.stopPropagation()
        const size = e.target.value
        let _fontSize;
        if (size < 0.75) { _fontSize = 0.75; }
        else if (size > 8) { _fontSize = 8; }
        else { _fontSize = size; }
        setFontSize(_fontSize);
    }

    {/* ----------autoPlay ---------- */}
    const intervalID = useRef(null)

    const onTick = useEffectEvent(()=>{
        console.log('=====tick=======')
        if (isPaused) clearInterval(intervalID.current)
        if (isCursorAtEnd && !isPaused) {
            clearInterval(intervalID.current)
            intervalID.current = null
            togglePaused(true)
        }
        if (!isPaused) getNextMainText();
    })

    console.log('Reader pre effect interval:', isCursorAtEnd, intervalID, isPaused)
    const createInterval = () => {
        if (!isPaused && !isCursorAtEnd && !intervalID.current) {
            intervalID.current = setInterval(()=>{
                console.log('tick')
                onTick()
            }, delay);
        }
    }

    useEffect(()=>{
        createInterval()
    },[isPaused, delay, isCursorAtEnd, getNextMainText])

    const handleClickPause = () => {
        console.log('handleClickPause')
        if ( isPaused ) {
            createInterval()
            togglePaused(isPaused => false)
        } else {
            clearInterval(intervalID.current)
            intervalID.current = null
            togglePaused(isPaused => true)
        }
    }

    /* ========== KEYBINDINGS ========== */
    const handleKey = (e) => {
        e.preventDefault();
        console.log('handleKey', e.type, e.key, e.keyCode, e.charCode)
        switch (e.keyCode) {
            case 27: // esc
                handleClickMinimize();
                break
            case 32: // space
                handleClickPause();
                break;
            case 37: // ArrowLeft
                getPrevMainText();
                break;
            case 39: // ArrowRight
                getNextMainText();
                break;
            default:
                break;
        }
    }

    /* ========== INPUT FORM HANDLING ========== */
    const [_delay, set_delay] = useState(3000)
    const handleDelayChange = e => {
        e.stopPropagation();
        if (!isPaused) togglePaused(true);
        const inputVal = Number.parseInt(e.target.value)
        set_delay(inputVal||3000);
    }
    const handleDelayBlur = e => {
        // console.log(e.target.value);
        const inputVal = Number.parseInt(e.target.value)
        let newVal = inputVal ? inputVal : 3000
        newVal = (newVal >= 200) ? newVal : 3000
        newVal = (newVal <= 60000) ? newVal : 3000
        set_delay(newVal);
        setDelay(newVal);
    }

    /* ========== STORAGE FUNCS =========== */
    const setStorageBookmarkLatest = async () => {
        console.log('setStorageBookmarkLatest');
        const mark = { sIdx: partIndex, pIdx: paragraphIndex, cIdx: charIndex }
        //browser.storage.local.set({ [paragraphUrl]: {...mark} })
        await setLocalStorage(paragraphUrl, {...mark})
        console.log(localStorage)
        console.log('setStorageMarkOK');
        addToast(`set progress ${partIndex}.${paragraphIndex}.${charIndex}`)
    }

    const handleClickSetBookmarkLatest = async (e) => {
        e.preventDefault();
        return setStorageBookmarkLatest();
    }

    const handleClickGetBookmarkLatest = (e) => {
        e.preventDefault();
        if (!isPaused) togglePaused(true);
        const res = localStorage;
        console.log('handleClickGetBookmarkLatest', res);
        if (res && (res.sIdx !== partIndex)) {
            setPartIndex(res.sIdx);
        }
        if (res && (res.pIdx !== paragraphIndex)) {
            setParagraphIndex(res.pIdx);
        }
        if (res && (res.cIdx !== charIndex)) {
            setCharIndex(res.cIdx);
        }
    }

    const handleClickClearBookmarks = async (e) => {
        e.preventDefault()
        /* TODO add confirm dialog */
        await setLocalStorage({
            [paragraphUrl]: { sIdx: 0, pIdx: 0, cIdx: 0 }
        })
        let {author, title} = structuredWork;
        author = author || ''
        title = title || ''
        addToast(`cleared progress ${author} - ${title}`)
    }


    const handleClickOpenSearchContainer = e => {
        e.preventDefault()
        if (!isPaused) togglePaused(true);
        setIsOpenSearchContainer(isOpen => !isOpen);
    }

    /* ========== TOOLBAR BOTTOM RESPONSIVE MINIMIZE/MAXIMIZE ========== */
    /* TODO USE CSS CLASS FOR BREAKPOINT INSTEAD OF window.innerWidth */
    const toolbarBottomRef = useRef(null)
    const defaultToolbarBottomState = window.innerWidth < 641;
    const [toolbarBottomIsMinimized, setToolbarBottomIsMinimized] = useState(defaultToolbarBottomState)

    const minimizeToolbarBottom = () => {
        toolbarBottomRef.current.style= ''
        setToolbarBottomIsMinimized(true)
    }
    const handleClickExpandToolbarBottom = () => {
        //let { classList } = toolbarBottomRef.current
        //toolbarBottomRef.current.classList = [...classList, 'h-full', 'z-100']
        if (!isPaused) togglePaused(true);
        if (toolbarBottomIsMinimized) {
            toolbarBottomRef.current.style=(`
                position:fixed;
                top:40vh;
                height:60vh;
                width:100vw;
            `);
            setToolbarBottomIsMinimized(false)
        } else {
            minimizeToolbarBottom()
        }
    }

    /* ========== MAIN TEXT STYLE ========= */
    const classesMainText = [
        `font-serif indent-0 text-left md:px-20 text-zinc-200`,
        'text-balanced whitespace-normal break-normal place-self-center',
        /*`before:content-[${charIndex===0 ? "'P"+paragraphIndex+"'" : ''}]`*/
        ].join(' ')

    window.strucuredWork = structuredWork;
    console.log('Reader prerender:')//, heading, structuredWork.parts[partIndex])
    return (
        <>
        {/* ========== READER MODAL BACKGROUND ========== */}
        <div className={['fixed z-0 left-0',
            'grid',
            isMinimized ? 'bottom-0' : 'top-0',
            isMinimized ? 'bg-transparent' :'bg-zinc-950/80',
            isMinimized ? 'w-xs' : 'w-screen',
            isMinimized ? 'h-20' : 'h-screen',
            !paragraphUrl ? 'hidden' : ''
            ].join(' ')
            }>
        {/* ========== READER MODAL ROOT ========== */}
        <div id='reader-modal-root' className={ ['z-50 flex flex-col',
            `font-sans text-lg text-zinc-300
            sm:border-2 border-gray-300/50
            rounded-sm bg-zinc-900 relative align-start justify-center`,
            isMinimized ? 'w-fit' : 'w-screen lg:w-[90vw]',
            isMinimized ? 'h-full' : 'h-screen lg:h-[90vh] ',
            isMinimized ? 'place-self-start' : 'place-self-center'
            ].join(' ') }>


            {/* ========== TOOLBAR TOP ========== */}
            <div className={`w-screen md:w-full p-2 lg:p-4 flex flex-row justify-center justify-between`}>

                {/* ---------- OPEN SEARCH CONTAINER ---------- */}
                <div className='flex-row flex-shrink justify-center'>
                    {!isMinimized && <button className='border-1 p-1 rounded-sm border-gray-300/0 hover:border-gray-300/50'
                        onClick={handleClickOpenSearchContainer}>
                        { !isOpenSearchContainer ? svgMagnifyingGlass : 'Back' }
                    </button>}
                </div>

                {/* ---------- WINDOW TITLE ----------
                <div className='grow flex flex-row justify-center'>
                    <h1>Reader</h1></div>
                */}
                {/* ========== WORK AUTHOR TITLE BAR ==========*/}
                <div className={`grow flex flex-row w-full items-center justify-around text-sm sm:text-md`}>
                    {!structuredWork.author ? null : <h1 className='font-bold'>{structuredWork.author}</h1>}
                    {!structuredWork.title ? null : <h1 className='italic'>{structuredWork.title }</h1>}
                    {structuredWork.title || structuredWork.author ? null : <h1 className='font-sans'>{paragraphUrl}</h1>}
                </div>
                {/* ---------- MIN/MAX READER WINDOW ---------- */}
                <div className='flex-shrink flex flex-row justify-center'>
                    {/*<div className=''>{!isMinimized && <button className=''>settings</button>}</div>*/}
                    <div className=''>
                        {paragraphUrl &&
                        <button className='border-1 p-1 rounded-sm border-gray-300/0 hover:border-gray-300/50'
                            onClick={ () => (paragraphUrl.length
                                        && handleClickMinimize()) }>
                            {!isMinimized ? svgChevronDown : svgChevronUp}
                        </button>}
                    </div>
                </div>
            </div>

            {/* ========== SEARCH RESULTS ==========*/}
            <div className={ (isOpenSearchContainer && !isMinimized)
                ? 'grow flex flex-col align-center overflow-scroll relative'
                : 'hidden' }
                >
                <SetLocationContext value={{setLocation}}>
                    { (!paragraphUrl || !structuredWork)
                        ? null
                        : ( <SearchContainer
                            paragraphUrl={paragraphUrl}
                            structuredWork={structuredWork}
                            setIsOpenSearchContainer={setIsOpenSearchContainer}
                            /> ) }
                </SetLocationContext>
            </div>

            <div className={!isOpenSearchContainer ? 'contents h-full' : 'hidden'}>




                {/* ========== BOOKMARK TOOLBAR ==========*/}
                <div className={`${isMinimized ? 'hidden' :''}
                    border border-gray-300/50 divide-solid divide-x-6
                    divide-gray-400 mb-2 sm:mb-4 w-full flex flex-row text-xs`}>
                    <button className='grow basis-md p-1 hover:bg-yellow-500/50'
                        onClick={handleClickClearBookmarks} >
                        Clear Progress</button>
                    <button className='grow basis-md p-1 hover:bg-green-500/50'
                        onClick={handleClickGetBookmarkLatest} >
                        Go Latest</button>

                    <button className='grow basis-md p-1 hover:bg-fuchsia-500/50'
                        onClick={handleClickSetBookmarkLatest} >
                        Set Progress</button>
                </div>




                {/* ========= MAIN TEXT ========== */}
                <div id="graze-main-text"
                    className={`relative flex flex-row h-7/10
                    shrink-0 grow-0 bg-zinc-800 ${isMinimized ? 'hidden' : ''}
                    w-screen md:w-full
                    justify-between align-center`}
                    onKeyDown={e=>handleKey(e)} tabIndex="0">

                    {/* SEEK LEFT BUTTON */}
                    <button className='flex-shrink bg-zinc-700/50 self-start self-stretch flex flex-col justify-around align-center'
                        onClick={getPrevMainText}>
                        {svgChevronLeft}</button>

                    {/* MAIN TEXT */}
                    <div className={`resize-x flex flex-col h-full w-full grow-0 lg:w-4/10 bg-zinc-800
                        overflow-scroll place-self-center border-7 border-gray-300/80  p-5`}>
                        <h3 className='mb-8'>{ heading }</h3>
                        <p style={{ fontSize: `${fontSize}rem`}} className={classesMainText}>
                            { mainText }
                        </p>
                    </div>

                    {/* PROGRESS BARS (FLOATING) */}
                    <div className='absolute bottom-0 right-10 h-2/10 w-2/10 md:h-1/10 md:w-1/10 sm:h-2/10 sm:w-2/10'>
                        <div className='h-full grow flex flex-col-reverse justify-center '>
                            <div role='progressbar' className='basis-xs w-full flex flex-row static bg-zinc-700/50'>
                                <div className='bg-red-500/50'
                                    style={{width: `${charIndex/(charLength-1)*100}%`}}></div>
                                <span className='text-xs text-black fixed text-zinc-300'>
                                    {`${charIndex}/${charLength-1}`}</span>
                            </div>
                            <div role='progressbar' className='basis-xs w-full flex flex-row static bg-zinc-700/50'>
                                <div className='bg-green-500/50'
                                    style={{width: `${paragraphIndex/(paragraphLength-1)*100}%`}}></div>
                                <span className='text-xs text-black fixed text-zinc-300'>
                                    {`${paragraphIndex}/${paragraphLength-1}`}</span>
                            </div>
                            <div role='progressbar' className='basis-xs w-full flex flex-row static bg-zinc-700/50'>
                                <div className='bg-blue-500/50'
                                    style={{width: `${partIndex/(partLength-1)*100}%`}}></div>
                                <span className='text-xs text-black fixed text-zinc-300'>
                                    {`${partIndex}/${partLength-1}`}</span>
                            </div>
                        </div>
                    </div>

                    {/* SEEK RIGHT BUTTON */}
                    <button className='flex-shrink bg-zinc-700/50 flex flex-col justify-around align-center'
                        onClick={getNextMainText}>
                        {svgChevronRight}</button>

                </div>


                {/* ========== TOOLBAR BOTTOM ========== */}
                <div className={`grow flex pl-4 pr-4 pt-2 sm:py-4 bg-black
                    justify-around sm:justify-between sm:items-center sm:mt-4
                    text-xs
                    ${!toolbarBottomIsMinimized ? 'flex-col sm:flex-row' : 'flex-row'}
                    ${isMinimized ? 'hidden' : ''}`}
                    ref={toolbarBottomRef}>
                    <div className={`flex pt-2 order-1 sm:order-last sm:hidden`}>
                        <button
                            onClick={handleClickExpandToolbarBottom}
                            >{toolbarBottomIsMinimized?svgCog6Tooth:svgChevronDown}</button>
                    </div>
                    {/* WordInterval Controls */}
                    <div className={`${toolbarBottomIsMinimized?'hidden':''} order-3 sm:order-1 text-center flex-shrink flex flex-col justify-center`}>
                        <label for='charInterval'># chars:
                            <input style={{width: '5rem'}}
                                name='charIntervalInput' type='number'
                                min='10' max='1000'
                                value={charInterval}
                                onChange={e => handleCharIntervalChange(e)} />
                        </label>
                    </div>
                    {/* fontSize Controls */}
                    <div className={`${toolbarBottomIsMinimized?'hidden':''} order-4 sm:order-2 text-center flex-shrink flex flex-col justify-center`}>
                        <label for='fontSize'>font size:
                            <input style={{width: '4rem'}} name='fontSizeInput'
                                type='number' min='0.75' max='8' step='any'
                                value={fontSize}
                                onChange={e => handleFontSizeChange(e)} />
                        </label>
                    </div>

                    {/* Auto Controls */}
                    <div className="order-2 space-x-4 sm:order-4  sm:basis-md flex flex-row justify-between align-center">
                        <div className='basis-sm flex flex-col text-center justify-center'>
                            <label className='' for='delay'>⏳(ms):
                                <input type='number' name='delayInput'
                                    value={_delay} min="200" max="60000"
                                    onChange={e=>handleDelayChange(e)}
                                    onBlur={e=>handleDelayBlur(e)} />
                            </label>
                        </div>
                        <button className={`place-self-center max-h-[2.2rem] basis-sm flex items-center justify-center outline-1 outline-offset-1
                            outline-slate-800/70 border border-gray-300 px-4
                            py-2 text-sm font-semibold text-gray-800
                            dark:border-transparent dark:bg-gray-700
                            dark:text-gray-200
                            ${!toolbarBottomIsMinimized && defaultToolbarBottomState ? 'hidden' : ''}
                            `}
                            onClick={handleClickPause}> {/* TODO */}
                            {isPaused ? svgPlay : svgPause }</button>
                    </div>

                    <div className={`${toolbarBottomIsMinimized?'hidden':''} contents`}>
                        {/* Location Form */}
                        {/* TODO Update Location Context w these props */}
                        <SetLocationContext value={{setLocation}}>
                            <LocationForm
                                structuredWork={structuredWork}
                                paragraphUrl={paragraphUrl}
                                sIdx={partIndex}
                                pIdx={paragraphIndex}
                                cIdx={charIndex}
                                togglePaused={togglePaused}
                            />
                        </SetLocationContext>
                    </div>


                </div>
            </div>
        </div>
        </div>
    </>
    )
}
