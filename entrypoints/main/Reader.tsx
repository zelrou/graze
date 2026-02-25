import {
    useState, useEffect, useEffectEvent, createContext, useContext,
    memo, useMemo, useRef, useCallback,
    createElement
} from 'react';
import { LocalStorageContext, SetLocationContext, ShadowContext, ReaderContext } from '@/contexts';
import { SearchContainer } from '@/features/search';

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
const svgMagnifyingGlass = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
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

function RenderMain({charIndex, charInterval, paragraphUrl}){
    const { range } = useContext(ShadowContext)
    const mainTextRef = useRef(null)

    useEffect(()=>{
        if (mainTextRef.current && range.current){
            mainTextRef.current.replaceChildren(
                surroundRange(range.current))
        }
    }, [charIndex, charInterval, paragraphUrl])

    return(<div id='mainTextContainer' ref={mainTextRef}></div>)
}

export default function Reader({
    structuredWork,
    localStorage,
    handleClickMinimize,
    isPaused, togglePaused,
    addToast
}) {
    const {
        range,
        shadow,
        leavesRef,
        leafLengthsRef,
        leafEndsRef
    } = useContext(ShadowContext)

    const {
        setLocalStorage
    } = useContext(LocalStorageContext)

    const {readerState, setMinimized, setReaderUrl, setCharIndex} = useContext(ReaderContext)
    const {paragraphUrl, isMinimized, charIndex} = readerState
    
    console.log(readerState, setMinimized)
    console.log('================= Reader ===================')
    const [partIndex, setPartIndex] = useState(0);
    const [paragraphIndex, setParagraphIndex] = useState(0);
    const [charInterval, setCharInterval] = useState(200);
    const defaultFontSize = (window.innerWidth < 641) ? 1 : 1.5;
    const [fontSize, setFontSize] = useState(defaultFontSize);

    const [delay, setDelay] = useState(DEFAULTS.DELAY);

    /* ========== SEARCH STATE & LOCATION CONTEXT ========== */
    const [isOpenSearchContainer, setIsOpenSearchContainer] = useState(false)
    const setLocation = useCallback((c=null) => {
        if (c===null) return null
        // setPartIndex(s)
        // setParagraphIndex(p)
        setCharIndex(c)
    }, [setCharIndex])

    /* ========== RESET LOCATION ON PROPS CHANGE ========== */
    const prevParagraphUrl = useRef(null)
    const paragraphChanged = paragraphUrl !== prevParagraphUrl.current;
    // let partLength; let currentPart; let paragraphLength; let currentParagraph; let charLength;
    let heading;
    let mainText;
    let isCursorAtEnd;
    const computedShadow = {
        totalLength: leafEndsRef.current?.at(-1)
    }
    const {totalLength} = computedShadow
    /* leaf stuff */
    if (paragraphChanged) {
        if (shadow.current !== null) {
            // grab the content from shadow dom
            leavesRef.current = getLeaves(shadow.current.firstChild)
            // make cummulative length array
            leafLengthsRef.current = leavesRef.current.map(n=>n.textContent.length)
            leafEndsRef.current = makeNodeEnds(leafLengthsRef.current)
            // initialize the range
            // const [endIdx, endOffset] = getnIdx(charInterval, leafEndsRef.current)
            const leafRange = new Range();
            // leafRange.setStart(leavesRef.current[0], 0)
            // leafRange.setEnd(leavesRef.current[endIdx], endOffset)
            range.current = leafRange
            console.log(range)
            setCharIndex(0)
        }
        console.log('READER: resetting location')
        prevParagraphUrl.current = paragraphUrl;
        setLocation(0)
        /* setMinimized(false);
         * here causes a render loop, this combination with click handler just
         * works
        */
        setIsOpenSearchContainer(false);

    } else {
        console.log('READER same url', paragraphUrl, prevParagraphUrl.current)//, structuredWork)
        // partLength = structuredWork.parts.length
        // currentPart = structuredWork.parts[partIndex]
        // paragraphLength = currentPart.paragraphs.length
        // currentParagraph = currentPart.paragraphs[paragraphIndex]
        // charLength = currentParagraph.charLength
        // heading = currentPart.heading

        // const totalLength = leafEndsRef.current.at(-1)

        // shouldn't happen, but in case, set the index in bounds (rerender).
        if (charIndex > totalLength) {
            setCharIndex(totalLength - charInterval)
        } else {
            let endCharIndex = charIndex + charInterval
            if (endCharIndex > totalLength) endCharIndex = totalLength-1; 

            const [startIdx, startOffset] = getnIdx(
                charIndex, leafEndsRef.current)
            const [endIdx, endOffset] = getnIdx(
                endCharIndex, leafEndsRef.current)

            range.current.setStart(leavesRef.current[startIdx], startOffset)
            range.current.setEnd(leavesRef.current[endIdx], endOffset)
        }
    }

    /* ========== SEEKING ========== */
    const getPrevMainText = () => {
        console.log('getPrevMainText', charIndex)
        let startCharIndex = charIndex - charInterval;
        let endCharIndex = startCharIndex + charInterval;
        const totalLength = leafEndsRef.current.at(-1)

        if (startCharIndex < 0) startCharIndex = 0;
        if (endCharIndex > totalLength) endCharIndex = totalLength - 1;

        setCharIndex(startCharIndex);
    }

    const getNextMainText = () => {
        console.log('getNextMainText')
        const nextcharIndex = charIndex + charInterval
        let endCharIndex = nextcharIndex + charInterval;
        const totalLength = leafEndsRef.current.at(-1)

        // charIndex is past totalLength, do nothing
        if (nextcharIndex > totalLength) return null;
        // endCharIndex is past totalLength, set former to latter
        if (endCharIndex > totalLength) endCharIndex = totalLength-1; 

        setCharIndex(nextcharIndex);
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
                            name="minimizeReader"
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
                            charInterval={charInterval}
                            paragraphUrl={paragraphUrl}
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
                        name="clearMarks"
                        onClick={handleClickClearBookmarks} >
                        Clear Progress</button>
                    <button className='grow basis-md p-1 hover:bg-green-500/50'
                        name="jumpLatestMark"
                        onClick={handleClickGetBookmarkLatest} >
                        Go Latest</button>
                    <button className='grow basis-md p-1 hover:bg-fuchsia-500/50'
                        name="setProgressMark"
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
                        role='button'
                        name='nav-prev'
                        onClick={getPrevMainText}>
                        {svgChevronLeft}</button>

                    {/* MAIN TEXT */}
                    <div className={`resize-x flex flex-col h-full w-full grow-0 lg:w-4/10 bg-zinc-800
                        overflow-scroll place-self-center border-7 border-gray-300/80  p-5`}>
                        <h3 className='mb-8'>{ heading }</h3>
                        <div style={{ fontSize: `${fontSize}rem`}} className={classesMainText}>
                            <RenderMain
                                paragraphUrl={paragraphUrl}
                                charInterval={charInterval}
                                charIndex={charIndex} />
                        </div>
                    </div>

                    {/* PROGRESS BARS (FLOATING) */}
                    <div className='absolute bottom-0 right-10 h-2/10 w-2/10 md:h-1/10 md:w-1/10 sm:h-2/10 sm:w-2/10'>
                        <div className='h-full grow flex flex-col-reverse justify-center '>
                            <div role='progressbar' className='basis-xs w-full flex flex-row static bg-zinc-700/50'>
                                <div className='bg-red-500/50'
                                    style={{width: `${charIndex/(totalLength-1)*100}%`}}></div>
                                <span className='progress-text text-xs text-black fixed text-zinc-300'>
                                    {`${charIndex}/${totalLength-1}`}</span>
                            </div>
                        </div>
                    </div>

                    {/* SEEK RIGHT BUTTON */}
                    <button className='flex-shrink bg-zinc-700/50 flex flex-col justify-around align-center'
                        role='button'
                        name='nav-next'
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
                            name='autoseekToggle'
                            onClick={handleClickPause}>
                            {isPaused ? svgPlay : svgPause }</button>
                    </div>

                    <div className={`${toolbarBottomIsMinimized?'hidden':''} contents`}>
                        {/* Location Form */}
                        <SetLocationContext value={{setLocation}}>
                            <LocationForm
                                totalCharLength={totalLength}
                                paragraphUrl={paragraphUrl}
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
