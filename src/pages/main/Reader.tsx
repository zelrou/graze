import {
    useState, useEffect, useEffectEvent, createContext, useContext,
    memo, useMemo, useRef
} from 'react';

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


const SetLocationContext = createContext(null)
const SearchResultTableRow = ({match}) => {
    const { setLocation } = useContext(SetLocationContext)
    const sIdx = match.at(0)
    const pIdx = match.at(1)
    const cIdx = match.at(2)
    const locString = `${sIdx}.${pIdx}.${cIdx}`
    return (<tr>
        <td className='border-b p-2 pl-8 border-gray-300'>{match[3]}</td>
        <td className='border-b p-2 pl-8 border-gray-300 text-right'>{locString}</td>
        <td className='border-b p-2 pl-8 border-gray-300'><button
            onClick={()=>setLocation(sIdx, pIdx, cIdx)}>
            {svgChevronRight2}</button></td>
        </tr>)
}

const SearchResultTable = memo(({searchResults, paragraphUrl}) => {
    const tableRows = searchResults.map(searchResult=>(
        <SearchResultTableRow match={searchResult} />))
    return (<table className='border-separate'>
        <thead><td>match</td><td>location</td><td>Go</td></thead>
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

const SearchContainer = ({structuredWork, paragraphUrl}) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [prevParagraphUrl, setPrevParagraphUrl] = useState()
    const searchInputRef = useRef(null)
    if (paragraphUrl !== prevParagraphUrl) {
        setPrevParagraphUrl(paragraphUrl)
        setSearchQuery('')
        if (searchInputRef.current) searchInputRef.current.value = ''
    }
    const contextLen = 40;
    let prevQ = ''
    const searchResults = useMemo(() => {
        const q = searchQuery
        if (prevQ == q) return [];
        const rQ = new RegExp(q, 'gid')
        const res = []
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
        <form method='post' onSubmit={handleSubmitSearch}>
            <input name='query' type='text' minLength={4} maxLength={20}
                className='bg-[#4f7777fc] focus:outline-2'
                onChange={handleQueryChange} ref={searchInputRef} autoFocus />
            <button className='border bg-sky-500 hover:bg-sky-700'> Search</button>
        </form>
        <SearchResultTable searchResults={searchResults} paragraphUrl={paragraphUrl}/>
    </>)
}

export default function Reader({paragraphUrl, structuredWork, setLocalStorage }) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isStorageInitialized, setIsStorageInitialized] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);
    const [paragraphIndex, setParagraphIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [charInterval, setCharInterval] = useState(200);
    const [partIndex, setPartIndex] = useState(0);

    const [isPaused, togglePaused] = useState(true);
    const [clock, setClock] = useState(0);
    const [delay, setDelay] = useState(DEFAULTS.DELAY);

    const [markLatestPIdx, setMarkLatestPIdx] = useState(0)
    const [markLatestCIdx, setMarkLatestCIdx] = useState(0)

    /* ========== SEARCH STATE & LOCATION CONTEXT ========== */
    const [isOpenSearchContainer, setIsOpenSearchContainer] = useState(false)
    const setLocation = (s, p, c) => {
        setPartIndex(s)
        setParagraphIndex(p)
        setCharIndex(c)
    }

    /* ========== RESET LOCATION ON PROPS CHANGE ========== */
    let partLength;
    let paragraphLength;
    let charLength;
    let heading;
    let mainText;
    const [prevParagraphUrl, setPrevParagraphUrl] = useState('')
    if (paragraphUrl !== prevParagraphUrl) {
        setPrevParagraphUrl(paragraphUrl);
        setPartIndex(0);
        setParagraphIndex(0);
        setCharIndex(0);
        partLength = structuredWork.parts.length
        paragraphLength = structuredWork.parts[0].paragraphs.length
        charLength = structuredWork.parts[0].paragraphs[0].length
        heading = structuredWork.parts[0].heading
        mainText = structuredWork.parts[0].paragraphs[0].slice(0, charInterval)
        setIsMinimized(false);
    } else {
        partLength = structuredWork.parts.length
        paragraphLength = structuredWork.parts[partIndex].paragraphs.length
        charLength = structuredWork.parts[partIndex].paragraphs[paragraphIndex].length
        heading = structuredWork.parts[partIndex].heading
        mainText = structuredWork.parts[partIndex].paragraphs[paragraphIndex].slice(charIndex, charIndex + charInterval)
     }

    /* ========== BACKGROUND PAGE MESSAGING ========== */
    useEffect(()=>{
        const bgSender = (message) => {
            return browser.runtime.sendMessage({ content: `Function call: ${message}` });
        }
        const bgReceiver = (request, sender, sendResponse) => {
            console.log(request, sender, sendResponse)
            if (request.data.action === "open_contentScript") {
                setIsClosed(false);
            }
            const msg = 'msg from content'
            sendResponse(msg);
            bgSender(msg);
        };
        browser.runtime.onMessage.addListener(bgReceiver);
        return () => browser.runtime.onMessage.removeListener(bgReceiver);
    })

    /* ========== WINDOW MINIMIZE/MAXIMIZE ========== */
    const handleClickMinimize = () => {
        console.log('handleClickMinimize', isMinimized)
        if (!isMinimized) { setIsMinimized(true); }
        else { setIsMinimized(false); }
    };

    /* ========== SEEKING ========== */
    /* TODO structuredWork class
     * make seeking into instance methods returning location for set state */
    const getPrevMainText = () => {
        const prevCharIndex = charIndex - charInterval;
        const prevParagraphIndex = paragraphIndex - 1;
        const prevPartIndex = partIndex - 1;
        let prevCharLength;
        let prevParagraphLength;
        console.log('getPrevMainText', prevCharIndex, prevParagraphIndex, prevPartIndex)
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
                    setCharIndex(prevCharLength - charInterval);
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

    /* ========== AUTO SEEKING ========== */
    const handleCharIntervalChange = e => {
        console.log('handleCharIntervalChange', e, charInterval)
        e.preventDefault();
        e.stopPropagation();
        if (!isPaused) togglePaused(isPaused => true);
        setCharInterval(charInterval => Number(e.target.value))
    }

    const onTick = useEffectEvent(()=>{
        getNextMainText();
    });

    /* TODO isPaused, delay dependency can be removed? */
    useEffect(()=>{
        console.log('useEffectRuns')
        let intervalID;
        if (!isPaused){
            intervalID = setInterval(()=>{
                setClock(clock=>clock+1)
                /*console.log('interval tick',clock,'wordIdx: ' + charIndex)*/
                if (!isPaused) onTick();
            }, delay);
        }
        return () => clearInterval(intervalID)
    },[isPaused, delay])

    // console.log('external tick',clock,'wordIdx: ' + wordIndex)

    const handleClickPause = () => {
        console.log('handleClickPause')
        if ( isPaused ) {
            togglePaused(isPaused => false)
        } else {
            togglePaused(isPaused => true) }
    }

    /* ========== KEYBINDINGS ========== */
    const handleKey = (e) => {
        e.preventDefault();
        console.log(e.type, e.key, e.keyCode, e.charCode)
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

        if (e.keyCode === 32) handleClickPause();
    }

    /* ========== INPUT FORM HANDLING ========== */
    const handleDelayChange = e => {
        e.stopPropagation();
        if (!isPaused) togglePaused(true);
        console.log(e.target.value);
        setDelay(e.target.value);
    }

    const handleLocationChange = e => {
        e.stopPropagation();
        if (!isPaused) togglePaused(true);
    }

    const handleSubmitSettings = e => {
        e.preventDefault();
        e.stopPropagation();
        const form = e.target;
        const formData = new FormData(form);
        console.log(formData);
        const formJson = Object.fromEntries(formData)
        setParagraphIndex(Number(formJson.paragraphIndexInput || paragraphIndex))
        setCharIndex(Number(formJson.charIndexInput || 0));
    }

    /* ========== STORAGE FUNCS =========== */
    const setStorageBookmarkLatest = async () => {
        console.log('setStorageBookmarkLatest');
        const mark = { sIdx: partIndex, pIdx: paragraphIndex, cIdx: charIndex }
        await setLocalStorage(paragraphUrl, {...mark})
        console.log('setStorageMarkOK');
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
        return browser.storage.local.set({
            [paragraphUrl]: { sIdx: 0, pIdx: 0, cIdx: 0 }
        })
    }


    const handleClickOpenSearchContainer = e => {
        e.preventDefault()
        if (!isPaused) togglePaused(true);
        setIsOpenSearchContainer(isOpen => !isOpen);
    }

    /* ========== MAIN TEXT STYLE ========= */
    const classesMainText = [
        'font-serif text-2xl indent-0 text-left md:px-20 text-zinc-200',
        'text-balanced whitespace-normal break-normal place-self-center',
        /*`before:content-[${charIndex===0 ? "'P"+paragraphIndex+"'" : ''}]`*/
        ].join(' ')

    console.log('Reader prerender:')//, heading, structuredWork.parts[partIndex])
    return (
        <>
        {/* ========== READER MODAL BACKGROUND ========== */}
        <div className={['fixed z-0 left-0',
            'grid',
            isMinimized ? 'bottom-0' : 'top-0',
            isMinimized ? 'bg-transparent' :'bg-[#22222266]',
            isMinimized ? 'w-xs' : 'w-screen',
            isMinimized ? 'h-20' : 'h-screen'
            ].join(' ')
            }>
        {/* ========== READER MODAL ROOT ========== */}
        <div id='reader-modal-root' className={ ['z-50 flex flex-col',
            `md:pt-4 font-sans text-lg text-zinc-300
            border-2 border-gray-300/50
            rounded-sm bg-zinc-900 relative align-start justify-start`,
            isMinimized ? 'w-fit' : 'sm:w-screen lg:w-7/10',
            isMinimized ? 'h-full' : 'lg:h-7/10 h-full',
            isMinimized ? 'place-self-start' : 'place-self-center'
            ].join(' ') }>


            {/* ========== TOOLBAR TOP ========== */}
            <div className={`pl-4 pr-4 flex flex-row justify-center justify-between`}>

                {/* ---------- OPEN SEARCH CONTAINER ---------- */}
                <div className='flex-shrink flex flex-row flex-shrink justify-center'>
                    <button className='border-1 p-2 rounded-xl border-gray-300/50'
                        onClick={handleClickOpenSearchContainer}>
                        { !isOpenSearchContainer ? svgMagnifyingGlass : 'Back' }
                    </button>
                </div>

                {/* ---------- WINDOW TITLE ---------- */}
                <div className='grow flex flex-row justify-center'>
                    <h1>Reader</h1></div>

                {/* ---------- MIN/MAX READER WINDOW ---------- */}
                <div className='flex-shrink flex flex-row justify-center'>
                    {/*<div className=''>{!isMinimized && <button className=''>settings</button>}</div>*/}
                    <div className=''>
                        <button className='border-1 p-2 rounded-xl border-gray-300/50'
                            onClick={ () => (paragraphUrl.length
                                        && handleClickMinimize()) }>
                            {!isMinimized ? svgChevronDown : svgChevronUp}
                        </button>
                    </div>
                </div>
            </div>

            {/* ========== SEARCH RESULTS ==========*/}
            <div className={isOpenSearchContainer ? 'flex flex-col flex-shrink align-center overflow-scroll relative' : 'hidden'}>
                <SetLocationContext value={{setLocation}}>
                    <SearchContainer paragraphUrl={paragraphUrl} structuredWork={structuredWork}/>
                </SetLocationContext>
            </div>

            <div className={!isOpenSearchContainer ? 'grow flex flex-col' : 'hidden'}>
                {/* ========== WORK AUTHOR TITLE BAR ==========*/}
                <div className='flex flex-row w-full justify-around'>
                    <h1 className='font-bold'>{structuredWork.author || '' }</h1>
                    <h1 className='italic'>{structuredWork.title || paragraphUrl}</h1>
                </div>



                {/* ========== BOOKMARK TOOLBAR ==========*/}
                <div className={`${isMinimized ? 'hidden' :''}
                    border border-gray-300/50 divide-solid divide-x-6
                    divide-gray-400 mb-4 w-full flex flex-row text-sm`}>
                    <button className='basis-md p-1 hover:bg-yellow-500/50'
                        onClick={handleClickClearBookmarks} >
                        Clear Latest</button>
                    <button className='basis-md p-1 hover:bg-fuchsia-500/50'
                        onClick={handleClickGetBookmarkLatest} >
                        Go Latest</button>

                    <button className='basis-md p-1 hover:bg-yellow-500/50'
                        onClick={handleClickSetBookmarkLatest} >
                        Mark Latest</button>
                </div>




                {/* ========= MAIN TEXT ========== */}
                <div className={['flex flex-col grow',
                    isMinimized ? 'hidden' : ''].join(' ')}
                    onKeyDown={e=>handleKey(e)} tabIndex="0">
                    <div id="graze-main-text" className='relative flex flex-row h-full bg-zinc-800 justify-between align-center'>
                         <button className='flex-shrink bg-zinc-700/50 self-start self-stretch flex flex-col justify-around align-center'
                            onClick={getPrevMainText}>
                            {svgChevronLeft}</button>

                        <div className={`h-full w-full lg:w-4/10 bg-zinc-800
                            overflow-scroll place-self-center border-7 border-gray-300/80  p-5`}>
                            <h3 className='mb-8'>{ heading }</h3>
                            <p className={classesMainText}>
                                { mainText }
                            </p>
                        </div>
                  {/* PROGRESS BARS */}
                    <div className='absolute bottom-0 right-10'>
                        <div className='grow flex flex-col-reverse justify-center '>
                            <div className='w-full flex flex-row justify-center static'>
                                <progress className='grow bg-zinc-700/50'
                                    value={charIndex/charLength} />
                                <span className='text-xs text-black fixed text-zinc-300'>
                                    {`${charIndex}/${charLength-1}`}</span>
                            </div>
                            <div className='w-full flex flex-row justify-center static'>
                                <progress className='grow bg-zinc-700/50'
                                    value={paragraphIndex/paragraphLength} />
                                <span className='text-xs text-black fixed text-zinc-300'>
                                    {`${paragraphIndex}/${paragraphLength-1}`}</span>
                            </div>
                            <div className='w-full flex flex-row justify-center static'>
                                <progress className='grow bg-zinc-700/50'
                                    value={partIndex/partLength} />
                                <span className='text-xs text-black fixed text-zinc-300'>
                                    {`${partIndex}/${partLength-1}`}</span>
                            </div>
                        </div>
                    </div>
                        <button className='flex-shrink bg-zinc-700/50 flex flex-col justify-around align-center'
                            onClick={getNextMainText}>
                            {svgChevronRight}</button>

                    </div>
                </div>


                {/* ========== TOOLBAR BOTTOM ========== */}
                <div className={['pl-4 pr-4 pb-4 pt-2 bg-black flex flex-row justify-between align-center mt-4',
                    'text-sm', isMinimized ? 'hidden' : ''].join(' ') }>


                    {/* WordInterval Controls */}
                    <div className='basis-sm flex flex-col justify-center'>
                        <label for='charInterval'># chars:
                            <input name='charIntervalInput' type='number'
                                min='10' max='1000' value={charInterval}
                                onChange={e => handleCharIntervalChange(e)} />
                        </label>
                    </div>


                    {/* Auto Controls */}
                    <div className="basis-md flex flex-row justify-between align-center">
                        <div className='basis-sm flex flex-col text-center justify-center'>
                            <label className='' for='delay'>time(ms):
                                <input type='number' name='delayInput'
                                    value={delay} min="200" max="60000"
                                    onChange={e=>handleDelayChange(e)} />
                            </label>
                        </div>
                        <button className={`basis-md outline-1 outline-offset-1
                            outline-slate-800/70 border border-gray-300 px-4
                            py-2 text-sm font-semibold text-gray-800
                            dark:border-transparent dark:bg-gray-700
                            dark:text-gray-200`}
                            onClick={handleClickPause}> {/* TODO */}
                            {isPaused ? 'play' : 'pause'}</button>
                    </div>


                    {/* TODO Location Controls */}
                    <form method="post" onSubmit={handleSubmitSettings}
                        className="basis-md flex flex-col text-end justify-center" >
                        <div className='contents'>
                            <label for='paragraph'>¶:
                                <input type='number' name='paragraphIndexInput'
                                    min='0' max={paragraphLength}
                                    onChange={e=>handleLocationChange(e)} />

                            <span>{ `/${paragraphLength}` }</span>
                            </label>
                        </div>
                        {/* TODO set max after selecting part and paragraph */}
                        {/*
                        <div className='basis-xs flex flex-row justify-center'>
                            <label for='word'>c:
                                <input type='number' name='charIndexInput'
                                    min='0' max={100}
                                    onChange={e=>handleLocationChange(e)} />
                            </label>
                            <span> { `/${charLength}` } </span>
                        </div>
                        <button type="submit"
                           className='basis-xs bg-indigo-500 hover:bg-fuchsia-500'>
                           go </button>
                       */}
                    </form>




                </div>
            </div>
        </div>
        </div>
    </>
    )
}
