import { useCallback, useEffect, useRef } from "react";
import { ShadowContext, ReaderContext } from "@/contexts";

import {
  OpenTabTableCell,
  TitleOrURLSpan,
  LocationSpanOrStoreUrlButton,
  ReadButton
} from "./openTabTableCells";

/*
* range first iteration
  TODO: parse head 
  TODO: better whitespace trim?
*/

const parser = new DOMParser()

export default function OpenTabList({
  tabs,
  readerUrl,
  articleHostRef,
}) {

  const { shadow } = useContext(ShadowContext)
  const { readerState, setReaderUrl, setMinimized } = useContext(ReaderContext)

  const sendMessageToTab = useCallback(async tabId => {
    const tabResponse = await browser.tabs.sendMessage(tabId, {
      greeting: "Hi from background script",
    })
    console.log("Message from the content script:", tabResponse);
    const { article } = tabResponse;
    const articleDOM = parser.parseFromString(article.content, "text/html");
    const targetTab = tabs.filter(t => t.id === tabId)[0];
    if (articleDOM.childNodes.length === 0) {
      console.debug('empty article', articleDOM)
      void (0);

      // initialize shadow dom
    } else if (shadow.current !== null) {
      // && shadow.current.childNodes.length === 0) {
      shadow.current = articleHostRef.current.shadowRoot
      shadow.current.replaceChildren(articleDOM.getElementById('readability-page-1')
        .cloneNode(true));
    }
    setReaderUrl(targetTab.url)
    setMinimized(false);

  }, [tabs, setReaderUrl])
    console.log(readerState, setReaderUrl)

  /*
   * useEffect opens Reader to tabId from Popup's search param
   * useRef 'navigated' so that its called once, only on page load
   */
  const navigated = useRef(false)
  useEffect(() => {
    if (navigated.current) return () => null
    const paramsString = window.location.search
    const searchParams = new URLSearchParams(paramsString)
    const hasSearchParam = searchParams.has('tabId')
    if (hasSearchParam && tabs.length) {
      const tabId = Number.parseInt(searchParams.get('tabId'))
      if (tabs.filter(t => t.id === tabId).length) {
        navigated.current = true
        sendMessageToTab(tabId)
      }
    } else if (!hasSearchParam && tabs.length) {
      /* component is tab aware and no search params found
       * setting navigated ensures this effect
       * is skipped in future as tabs change */
      navigated.current = true;
    }
  }, [tabs])

  const renderCondition = (tabs.length > 0)
  return (!renderCondition
    ? null
    : tabs.map(t => (
      <tr key={t.id} className={[
        ((readerUrl === t.url) ? 'bg-emerald-300/40' : ''),
        (t.discarded ? 'opacity-30' : ''),
        'hover:bg-zinc-700'
      ].join(' ')}>
        <OpenTabTableCell className='font-sans'>
          <TitleOrURLSpan tab={t} />
        </OpenTabTableCell>

        <OpenTabTableCell className='text-right font-mono'>
          <LocationSpanOrStoreUrlButton tabUrl={t.url} />
        </OpenTabTableCell>

        <OpenTabTableCell className='text-center'>
          <ReadButton
            readerUrl={readerUrl}
            sendMessageToTab={sendMessageToTab}
            setIsMinimized={setMinimized}
            tab={t} />
        </OpenTabTableCell>
      </tr>
    )
    ))
}


