import {
  useState, useEffect, useRef, useReducer, createContext, useContext,
  useEffectEvent, useSyncExternalStore, useCallback
} from 'react';

import { useTabStore } from '@/hooks/useTabStore';
import { toastStore } from './ToastStore';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { LocalStorageContext, ReaderContext, ShadowContext, UseReaderContext } from '@/contexts';
import ToolbarTop from '@/components/ToolbarTop';
import Reader from './Reader';
import ClosedTabsTable from '@/components/ClosedTabsTable';
import OpenTabsTable from '@/components/OpenTabsTable';
import { readerReducer } from '@/reducers';

const defaultStructuredWork = {
  author: '',
  title: '',
  parts: [{ heading: '', paragraphs: [''] }]
}
const defaultCursor = { sIdx: 0, pIdx: 0, cIdx: 0 }


/* ========== APP ========== */
function App() {
  const structuredWork = useRef(defaultStructuredWork);
  console.log('=================== App didMount ===================')
  console.log(import.meta.env)
  /* HOOKS */
  console.log('App preTabStore')
  const tabs = useTabStore();
  console.log('App prelocalStorage')
  const [localStorage, setLocalStorage] = useLocalStorage()
  /* STATE */
  let setMinimized, setReaderUrl;
  const {readerState }= useContext(ReaderContext)
  const { paragraphUrl, isMinimized }  = readerState

  const [isPaused, togglePaused] = useState(true)
console.log('APPPP readerState', readerState)
  /* ========== TOASTS ========== */
  /* TODO create custom hook */
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot)

  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (msg) {
      toastStore.addToast(msg)
    }
  }, [msg, toasts])

  /* ========== WINDOW MINIMIZE/MAXIMIZE ========== */
  const handleClickMinimize = () => {
    console.log('handleClickMinimize', isMinimized)
    if (!isPaused) togglePaused(isPaused => true)
    if (!isMinimized) {
      setMinimized(true);
    } else {
      setMinimized(false);
    }
  };

  /* ========== CONTEXTS SETUP ========== */
  // Shadow Context refs
  const range = useRef(null)
  const shadow = useRef(null)
  const leavesRef = useRef(null);
  const leafLengthsRef = useRef(null);
  const leafEndsRef = useRef(null);


  const tabStatus = tabs.map(tab => ({ url: tab.url, status: tab.status }))
  // console.log(tabStatus)
  /* ========== RENDER ========== */
  console.log('App preRender:', localStorage)//, 'tabs', tabs,'readerUrl',readerUrl,'setReaderUrl', setReaderUrl,'stateLocalStorage', localStorage)
  return (<div className={`relative w-screen min-h-screen h-full flex
        flex-col space-y-4 items-center pb-20 bg-zinc-950 text-zinc-200`}>
    <LocalStorageContext value={{ localStorage, setLocalStorage }}>
      <ShadowContext value={{ range, shadow, leavesRef, leafLengthsRef, leafEndsRef }}>
          <ToolbarTop setMsg={setMsg} localStorage={localStorage} setLocalStorage={setLocalStorage} />

          <h2 className='text-lg text-semibold'>Open Tabs</h2>
          {tabs.every(tab => tab.status === 'complete') ? <OpenTabsTable
            tabs={tabs}
            readerUrl={paragraphUrl}
            />
            : null}

          <h2 className='text-lg text-semibold'>Previous Tabs</h2>
          <ClosedTabsTable tabs={tabs} localStorage={localStorage} />

          {(!(paragraphUrl&& structuredWork) ? null : (
            <Reader
              localStorage={localStorage[paragraphUrl] || defaultCursor}
              structuredWork={structuredWork.current}
              isPaused={isPaused} togglePaused={togglePaused}
              handleClickMinimize={handleClickMinimize}
              addToast={toastStore.addToast}
            />))}
      </ShadowContext>
    </LocalStorageContext>
  </div>)
}

export default  ({}) =>(<UseReaderContext ><App /> </UseReaderContext>)
