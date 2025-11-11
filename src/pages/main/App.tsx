import {
    useState, useEffect, useRef, useReducer, createContext, useContext,
    useEffectEvent, useSyncExternalStore, useCallback
} from 'react';

import { useTabStore } from './hooks/useTabStore';
import { toastStore } from './ToastStore';
import { useLocalStorage } from './hooks/useLocalStorage';
import ToolbarTop from './components/ToolbarTop';
import Reader from '@pages/main/Reader';
import ClosedTabsTable from './components/ClosedTabsTable';
import OpenTabsTable from './components/OpenTabsTable';

const defaultStructuredWork = {
    author: '',
    title: '',
    parts: [{ heading:'', paragraphs:[''] }]
}
const defaultCursor = {sIdx:0, pIdx:0,cIdx:0}

/* ========== APP ========== */
export default function App() {
    const structuredWork = useRef(defaultStructuredWork);
    console.log('=================== App didMount ===================')
    /* HOOKS */
    console.log('App preTabStore')
    const tabs = useTabStore();
    console.log('App prelocalStorage')
    const [localStorage, setLocalStorage] = useLocalStorage()
    /* STATE */
    const [readerUrl, setReaderUrl] = useState('');
    const [isMinimized, setIsMinimized] = useState(true);
    const [isPaused, togglePaused] = useState(true)

    /* ========== TOASTS ========== */
    /* TODO create custom hook */
    const toasts = useSyncExternalStore(
        toastStore.subscribe,
        toastStore.getSnapshot)

    const [msg, setMsg] = useState('');
    useEffect(()=>{
        if (msg) {
            toastStore.addToast(msg)
        }
    }, [msg, toasts])

    /* ========== WINDOW MINIMIZE/MAXIMIZE ========== */
    const handleClickMinimize = () => {
        console.log('handleClickMinimize', isMinimized)
        if (!isPaused) togglePaused(isPaused => true)
        if (!isMinimized) { setIsMinimized(true);
        } else {
            setIsMinimized(false);
        }
    };

    /* ========== RENDER ========== */
    console.log('App preRender:', localStorage)//, 'tabs', tabs,'readerUrl',readerUrl,'setReaderUrl', setReaderUrl,'stateLocalStorage', localStorage)
    return (<div className={`relative w-screen min-h-screen h-full flex
        flex-col space-y-4 items-center pb-20 bg-zinc-950 text-zinc-200`}>

        <ToolbarTop setMsg={setMsg} localStorage={localStorage} setLocalStorage={setLocalStorage}/>

        <h2 className='text-lg text-semibold'>Open Tabs</h2>
        <OpenTabsTable
            structuredWork={structuredWork}
            tabs={tabs}
            readerUrl={readerUrl}
            setReaderUrl={setReaderUrl}
            localStorage={localStorage}
            setIsMinimized={setIsMinimized} />

        <h2 className='text-lg text-semibold'>Previous Tabs</h2>
        <ClosedTabsTable tabs={tabs} localStorage={localStorage} />

        { (!(readerUrl && structuredWork) ? null : (
        <Reader
            localStorage={localStorage[readerUrl] || defaultCursor}
            paragraphUrl={ readerUrl }
            structuredWork={ structuredWork.current }
            setLocalStorage={ setLocalStorage }
            isPaused={isPaused} togglePaused={togglePaused}
            handleClickMinimize={handleClickMinimize}
            isMinimized={isMinimized}
            setIsMinimized={setIsMinimized}
            addToast={toastStore.addToast}
        />)) }
    </div>)
}



