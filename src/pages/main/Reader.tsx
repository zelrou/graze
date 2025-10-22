import {
    useState, useEffect, useEffectEvent, useSyncExternalStore
} from 'react';

const DEFAULTS = {};
DEFAULTS.DELAY = 3000;

const getParagraphs = () => {
    let _paragraphs = Array.from(document.getElementsByTagName('p'))
    if (_paragraphs.length > 0) {
        _paragraphs = _paragraphs.map((el)=>{
            return el.innerText
        });
    } else {
        _paragraphs = [[]]
    }
    return _paragraphs
}

function splitWords(p) {
    if (!p || !p.length) return 0;
    return p.split(' ')
};


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

export default function Reader({paragraphUrl, _paragraphs}) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);
    const [paragraphIndex, setParagraphIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [charInterval, setCharInterval] = useState(200);

    const [isPaused, togglePaused] = useState(true);
    const [clock, setClock] = useState(0);
    const [delay, setDelay] = useState(DEFAULTS.DELAY);

    const [markLatestPIdx, setMarkLatestPIdx] = useState(0)
    const [markLatestCIdx, setMarkLatestCIdx] = useState(0)
    let paragraphsLength;
    let paragraphLength;

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

    const handleClickClose = () => {
        console.log('handleClickClose', isClosed)
        setIsClosed(true);
    }

    const handleClickMinimize = () => {
        console.log('handleClickMinimize', isMinimized)
        if (!isMinimized) { setIsMinimized(true); }
        else { setIsMinimized(false); }
    };

    const getNextMainText = () => {
        let currWordIndex = wordIndex;
        let charCount = 0;
        while ((charCount < charInterval) && (currWordIndex < paragraphLength)) {
            const currWord = _paragraphs[paragraphIndex][currWordIndex]
            charCount = charCount + currWord.length + 1;
            console.log('charCount', charCount, charInterval, currWordIndex, paragraphLength)
            currWordIndex = currWordIndex + 1
        }
        const mainText = _paragraphs[paragraphIndex].slice(wordIndex,currWordIndex).join(' ')
        return [mainText, currWordIndex]
    }

    const getPrevMainText = (pIdx, wIdx, cInterval,pLength) => {
        let _endWordIndex = wIdx;
        let currWordIndex = wIdx;
        let mainText = [];
        let charCount = 0;
        while ((charCount < cInterval) && (currWordIndex > 0 )) {
            const currWord = _paragraphs[pIdx][currWordIndex]
            mainText.push(currWord);
            charCount = charCount + currWord.length + 1;
            console.log('charCount', charCount, cInterval, currWordIndex, pLength)
            currWordIndex = currWordIndex - 1
        }
        return [mainText.join(' ').reverse(), currWordIndex]
    }

    const handleCharIntervalChange = e => {
        console.log('handleCharIntervalChange', e, charInterval)
        e.preventDefault();
        e.stopPropagation();
        if (!isPaused) togglePaused(isPaused => true);
        setCharInterval(charInterval => Number(e.target.value))
    }

    const handleClickPrev = e => {
        console.log('handleClickPrev', e, charIndex, paragraphIndex);
        if (paragraphIndex === 0 && charIndex === 0) {
            return null;
        }
        const prevParagraphIndex = paragraphIndex - 1;
        let prevParagraphLength;
        if (paragraphIndex > 0) {
            prevParagraphLength = _paragraphs[paragraphIndex-1].length;
        }

        const prevCharIndex = charIndex - charInterval;
        console.log('prevClickMid', charIndex, prevCharIndex, paragraphIndex, prevParagraphIndex, prevParagraphLength)
        if (prevCharIndex < 0) {
            setParagraphIndex(paragraphIndex => prevParagraphIndex);
            let prevParagraphCharIndex = prevParagraphLength - charInterval;
            if (prevParagraphCharIndex < 0) { prevParagraphCharIndex = 0 }
            setCharIndex(charIndex => prevParagraphCharIndex);
        } else {
            setCharIndex(charIndex => prevCharIndex);
        }
    }

    const handleClickNext = e => {
        const charToWordEnd = (pIdx, cIdx) => {
            // use length - 0 because we look one char after interval end
            if (cIdx + charInterval >= _paragraphs[pIdx].length) {
                return cIdx
            }
            let correctedIdx = cIdx;
            let correctedEndIdx = cIdx + charInterval;
            while(_paragraphs[pIdx][correctedEndIdx+1] !== ' ') {
                correctedIdx = correctedIdx - 1;
                correctedEndIdx = correctedEndIdx - 1;
            }
            return correctedIdx;
        }
        const nextCharIndex = charIndex + charInterval;
        const nextParagraphIndex = paragraphIndex + 1;
        console.log('handleClickNext', e, paragraphIndex, charIndex, paragraphLength, nextCharIndex,nextParagraphIndex);
        if (paragraphLength === 0) return setParagraphIndex(nextParagraphIndex);
        if (nextCharIndex > paragraphLength - 1) {
            if (nextParagraphIndex > paragraphsLength - 1) {
                return null
            }
            console.log('nextChar > paragraphLen', nextParagraphIndex)
            setParagraphIndex(nextParagraphIndex);
            setCharIndex(0);
        } else {
            setCharIndex(nextCharIndex);
            // setCharIndex(charToWordEnd(paragraphIndex, nextCharIndex));
        }
        console.log('handleClickNextEnd', e, charIndex, paragraphIndex);
    }

    const onTick = useEffectEvent(()=>{
        handleClickNext();
    });

    /* TODO isPaused, delay dependency can be removed? */
    useEffect(()=>{
        console.log('useEffectRuns')
        let intervalID;
        if (!isPaused){
            intervalID = setInterval(()=>{
                setClock(clock=>clock+1)
                console.log('interval tick',clock,'wordIdx: ' + wordIndex)
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
            case 32: // space
                handleClickPause();
                break;
            case 37: // ArrowLeft
                handleClickPrev();
                break;
            case 39: // ArrowRight
                handleClickNext();
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
    //const storageChange = useSyncExternalStore(subscribeStorage, syncStorageState);
    const locationHref = window.location.href;

    const setStorageBookmarkLatest = async () => {
        console.log('setStorageBookmarkLatest');
        const res = await browser.storage.local.set({
            [paragraphUrl]: { pIdx: paragraphIndex, cIdx: charIndex }
        })
        console.log('setStorageMarkOK', res)
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
        if (res && (res.pIdx !== paragraphIndex)) {
            setParagraphIndex(res.pIdx);
        }
        if (res && (res.cIdx !== charIndex)) {
            setCharIndex(res.cIdx);
        }
    }

    const handleClickClearBookmarks = async (e) => {
        e.preventDefault()
        browser.storage.local.set({[paragraphUrl]: {pIdx: 0, cIdx: 0}})
    }

    /* ========== initializeStorage ========== */
    const [isStorageInitialized, setIsStorageInitialized] = useState(false);
    const initializeStorage = async () => {
        if (!isStorageInitialized) {
            const storageKeys = await browser.storage.local.getKeys();
            if (!storageKeys.includes(paragraphUrl)) {
                browser.storage.local.set({[paragraphUrl]: {pIdx: 0, cIdx: 0}});
            }
            setIsStorageInitialized(true);
        }
    }
    initializeStorage();

    /* ========== RESET LOCATION ON PROPS CHANGE ========== */
    let mainText;
    const [prevParagraphUrl, setPrevParagraphUrl] = useState('')
    if (paragraphUrl !== prevParagraphUrl) {
        setPrevParagraphUrl(paragraphUrl);
        setParagraphIndex(0);
        setCharIndex(0);
        paragraphsLength = _paragraphs.length;
        paragraphLength = _paragraphs[0].length;
        mainText = _paragraphs[0].slice(charIndex, charIndex + charInterval);
        setIsMinimized(false);
    } else {
        paragraphsLength = _paragraphs.length;
        paragraphLength = _paragraphs[paragraphIndex].length;
        mainText = _paragraphs[paragraphIndex].slice(charIndex, charIndex + charInterval);
     }

    /* ========== MAIN TEXT ========= */
    const classesMainText = [
        'font-[Georgia] text-2xl indent-0 text-left md:px-20',
        'text-balanced whitespace-normal break-normal'
        ].join(' ')

    // bg-zinc-700
    return (
        <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* ========== READER MODAL BACKGROUND ========== */}
        <div className={['fixed z-0 left-0',
            'grid',
            isClosed ? 'hidden' : '',
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
                        <div className=''>{!isMinimized && <button className=''>settings</button>}</div>
                        <div className=''>
                            <button className='' onClick={()=>handleClickMinimize()}>
                                {!isMinimized ? '-' : 'O'}
                            </button>
                        </div>
                        <div className=''>
                            <button className='' onClick={()=>handleClickClose()}>
                                X
                            </button>
                        </div>
                    </div>
                </div>

                <div className={'w-full flex flex-row text-sm'}>
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
                    <div className='grow w-full bg-zinc-800 md:w-4/10 overflow-scroll place-self-center border p-5'>
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


                    {/* Location Controls */}
                    <form method="post" onSubmit={handleSubmitSettings}
                        className="w-full flex flex-row justify-center " >
                        <div className='basis-xs flex flex-row justify-center'>
                            <label for='paragraph'>¶:
                                <input type='number' name='paragraphIndexInput'
                                    min='0' max={_paragraphs.length}
                                    onChange={e=>handleLocationChange(e)} />
                            </label>
                            <span>{ `/${paragraphsLength}` }</span>
                        </div>
                        <div className='basis-xs flex flex-row justify-center'>
                            <label for='word'>c:
                                <input type='number' name='charIndexInput'
                                    min='0' max={_paragraphs.map(p=>p.length).reduce((acc, cur)=>acc>cur?acc:cur)}
                                    onChange={e=>handleLocationChange(e)} />
                            </label>
                            <span> { `/${paragraphLength}` } </span>
                        </div>
                        <button type="submit"
                           className='basis-xs bg-indigo-500 hover:bg-fuchsia-500'>
                           go </button>
                    </form>


                    {/* Seek Controls */}
                    <div className='flex flex-row'>
                        <button className='w-1/10 border' onClick={handleClickPrev}>back</button>
                        <div className='w-8/10 flex flex-col'>
                            <div className='w-full flex flex-row justify-center static'>
                                <progress className='grow' value={charIndex/paragraphLength} />
                                <span className='text-sm text-black fixed'>{`${charIndex}/${paragraphLength}`}</span>
                            </div>
                            <div className='w-full flex flex-row justify-center static'>
                                <progress className='grow' value={paragraphIndex/paragraphsLength} />
                                <span className='text-sm text-black fixed'>{`${paragraphIndex}/${paragraphsLength}`}</span>
                            </div>
                        </div>
                        <button className='w-1/10 border' onClick={handleClickNext}>fwrd</button>
                    </div>


                </div>
            </div>
        </div>
        </div>
    </>
    )
}
