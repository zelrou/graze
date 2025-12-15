import { readerReducer } from '@/reducers'
import { createContext, useReducer } from 'react'

export const SetLocationContext = createContext(null)
export const LocationContext = createContext(null)
export const LocalStorageContext = createContext(null)
export const ShadowContext = createContext(null)
export const ReaderContext = createContext(null)

export const UseReaderContext = ({...props}) => {
  const [readerState, dispatchReader]= useReducer(readerReducer, {
    paragraphUrl: '',
    charIndex: null,
    isMinimized: true
  })

  const setCharIndex = (charIndex) => dispatchReader({
    type: 'set_charIndex',
    payload: charIndex
  })
  const setMinimized = (isMinimized) => dispatchReader({
    type: 'set_minimized',
    payload: isMinimized
  })

  const setReaderUrl = (readerUrl) => dispatchReader({
    type: 'set_readerUrl',
    payload: readerUrl
  })

  return (
    <ReaderContext value={{
      setCharIndex,
      setReaderUrl,
      setMinimized,
      readerState,
      dispatchReader
    }}>
      {...props.children}
    </ ReaderContext>
  )
}
