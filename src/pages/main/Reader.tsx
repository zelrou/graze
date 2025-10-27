import {
    useState, useEffect, useEffectEvent
} from 'react';

const DEFAULTS = {};
DEFAULTS.DELAY = 3000;


const subscribeStorage = callback => {
    if (browser.storage ) {
        // console.log(browser.storage)
        browser.storage.local.onChanged.addListener(callback)
    }
    return () => {
        browser.storage.local.onChanged.removeListener(callback)
    }
}

const syncStorageState = (changes, other) => {
    //const { pIdx, cIdx } = storageChange;
    console.log('storageChanges:', changes, other)
    //setMarkLatestPIdx(pIdx)
    //setMarkLatestCIdx(cIdx)
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
    let paragraphsLength;
    console.log(structuredWork);

    /* ========== BACKGROUND PAGE MESSAGING ========== */
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
    useEffect(()=>{
        browser.runtime.onMessage.addListener(bgReceiver);
        return () => browser.runtime.onMessage.removeListener(bgReceiver);
    })

    const handleClickMinimize = () => {
        console.log('handleClickMinimize', isMinimized)
        if (!isMinimized) { setIsMinimized(true); }
        else { setIsMinimized(false); }
    };

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
        charLength = structuredWork.parts[partIndex].paragraphs[paragraphIndex].length;
        paragraphLength = structuredWork.parts[partIndex].paragraphs.length;
        partLength = structuredWork.parts.length;

        if ( nextcharIndex > charLength - 1) {
            // we are at end of a paragraph
            if (nextParagraphIndex > paragraphLength - 1) {
                // we are at end of part
                if (nextPartIndex > partLength - 1) {
                    // we are at end of work
                    return null;
                } else {
                    // move to next part
                    setPartIndex(nextPartIndex);
                    setParagraphIndex(0);
                    setCharIndex(0);
                }
            } else {
                // move to next paragraph
                setParagraphIndex(nextParagraphIndex)
                setCharIndex(0);
            }
        } else {
            // move to next charIndex
            setCharIndex(nextcharIndex)
        }
    }

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
        browser.storage.local.set({[paragraphUrl]: {
            sIdx: 0, pIdx: 0, cIdx: 0
        }})
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
        mainText = structuredWork && structuredWork.parts[partIndex].paragraphs[paragraphIndex].slice(charIndex, charIndex + charInterval)

        console.log('Reader prerender:', heading, structuredWork.parts[partIndex])
     }

    /* ========== MAIN TEXT ========= */
    const classesMainText = [
        'font-[Georgia] text-2xl indent-0 text-left md:px-20',
        'text-balanced whitespace-normal break-normal',
        /*`before:content-[${charIndex===0 ? "'P"+paragraphIndex+"'" : ''}]`*/
        ].join(' ')

    // bg-zinc-700
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
        <div id='reader-modal-root' className={ ['z-50 grid',
            'md:p-4 text-lg border bg-zinc-700',
            isMinimized ? 'w-fit' : 'sm:w-screen md:w-7/10',
            isMinimized ? 'h-full' : 'h-full md:h-7/10',
            isMinimized ? 'place-self-start' : 'place-self-center'
            ].join(' ') }>

            <div className='flex flex-col h-full'>


                {/* ========== TOOLBAR TOP ========== */}
                <div className='flex-none align-self-start justify-self-center place-items-center grid grid-cols-5'>
                    <div className='md:col-start-2 col-span-3 place-items-center'>Reader</div>
                    <div className='col-span-1 gap-4 place-items-end grid grid-cols-3 divide-x-3 divide-dashed divide-indigo-500 text-sm'>
                        {/*<div className=''>{!isMinimized && <button className=''>settings</button>}</div>*/}
                        <div className=''>
                            <button className='border p-1'
                                onClick={ () => (paragraphUrl.length
                                            && handleClickMinimize()) }>
                                {!isMinimized ? '-' : 'O'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className='flex flex-row w-full justify-around'>
                    <h1 className='font-bold'>{structuredWork.author || '' }</h1>
                    <h1 className='italic'>{structuredWork.title || paragraphUrl}</h1>
                </div>

                <div className={`${isMinimized && 'hidden'} w-full flex flex-row text-sm`}>
                    <button className='grow border p-1 hover:bg-yellow-500'
                        onClick={handleClickClearBookmarks} >
                        Clear Latest</button>

                    <button className='grow border p-1 hover:bg-fuchsia-500'
                        onClick={handleClickGetBookmarkLatest} >
                        Go Latest</button>


                    <button className='grow border p-1 hover:bg-yellow-500'
                        onClick={handleClickSetBookmarkLatest} >
                        Mark Latest</button>
                </div>


                {/* ========= MAIN TEXT ========== */}
                <div className={['flex flex-col grow',
                    isMinimized ? 'hidden' : ''].join(' ')}
                    onKeyDown={e=>handleKey(e)} tabIndex="0">
                    <div className={`grow w-full bg-zinc-800 md:w-4/10
                        overflow-scroll place-self-center border p-5`}>
                        <h2>{ heading }</h2>
                        <p className={classesMainText}>
                            { mainText }
                        </p>
                    </div>
                </div>


                {/* ========== TOOLBAR BOTTOM ========== */}
                <div className={['grid grid-rows-3 gap-4',
                    'text-sm', isMinimized ? 'hidden' : ''].join(' ') }>


                    {/* WordInterval Controls */}
                    <div className='grid grid-cols-1 justify-self-start place-items-center'>
                        <label for='charInterval'># chars:
                            <input name='charIntervalInput' type='number'
                                min='10' max='1000' value={charInterval}
                                onChange={e => handleCharIntervalChange(e)} />
                        </label>
                    </div>


                    {/* Auto Controls */}
                    <div className="w-full flex flex-row justify-center">
                        <div className='basis-xs'>
                            <label for='delay'>time(ms):
                                <input type='number' name='delayInput'
                                    value={delay} min="200" max="60000"
                                    onChange={e=>handleDelayChange(e)} />
                            </label>
                        </div>
                        <button className={`basis-xs outline-2 outline-offset-2
                            outline-blue-500 border border-gray-300 px-4
                            py-2 text-sm font-semibold text-gray-700
                            dark:border-transparent dark:bg-gray-700
                            dark:text-gray-200`}
                            onClick={handleClickPause}> {/* TODO */}
                            {isPaused ? 'play' : 'pause'}</button>
                    </div>


                    {/* TODO Location Controls */}
                    <form method="post" onSubmit={handleSubmitSettings}
                        className="w-full flex flex-row justify-center " >
                        <div className='basis-xs flex flex-row justify-center'>
                            <label for='paragraph'>¶:
                                <input type='number' name='paragraphIndexInput'
                                    min='0' max={paragraphLength}
                                    onChange={e=>handleLocationChange(e)} />
                            </label>
                            <span>{ `/${paragraphLength}` }</span>
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


                    {/* Seek Controls */}
                    <div className='flex flex-row'>
                        <button className='w-1/10 border' onClick={getPrevMainText}>back</button>
                        <div className='w-8/10 flex flex-col'>
                            <div className='w-full flex flex-row justify-center static'>
                                <progress className='grow' value={charIndex/charLength} />
                                <span className='text-sm text-black fixed'>{`${charIndex}/${charLength-1}`}</span>
                            </div>
                            <div className='w-full flex flex-row justify-center static'>
                                <progress className='grow' value={paragraphIndex/paragraphLength} />
                                <span className='text-sm text-black fixed'>{`${paragraphIndex}/${paragraphLength-1}`}</span>
                            </div>
                            <div className='w-full flex flex-row justify-center static'>
                                <progress className='grow' value={partIndex/partLength} />
                                <span className='text-sm text-black fixed'>{`${partIndex}/${partLength-1}`}</span>
                            </div>
                        </div>
                        <button className='w-1/10 border' onClick={getNextMainText}>fwrd</button>
                    </div>


                </div>
            </div>
        </div>
        </div>
    </>
    )
}
