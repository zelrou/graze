type Tab = browser.tabs.Tab
type UpdateFilter = browser.tabs.UpdateFilter

import { useState, useEffect } from "react";

export const denylistProtocol = [
    'graze',
    'about:',
    'moz-extension:'
]

export const isInDenylist = (s:string) => {
    if (!s.length) return true
    if (s === 'graze') return true

    let _protocol;
    try {
        _protocol = URL.parse(s)?.protocol
    } catch (e) {
        console.error(e)
    }
    const protocol = _protocol ? _protocol : s
    const res = denylistProtocol.includes(protocol)
    console.log('isInDenylist', s,  res)
    return res
}


const tabFilter = (t:Tab): boolean => {
    return !isInDenylist(t.url)
}

const tabSorter = (t1:Tab, t2:Tab): number => {
    return (t1.discarded && !t2.discarded) ? 1
        : (t2.discarded && !t1.discarded) ? -1
        : (t2.lastAccessed - t1.lastAccessed)
}

const getTabs = async (queryInfo={}) => {
    /* TODO move tab sorting to UI for user */
    let tabs = await browser.tabs.query(queryInfo)
    return (tabs.length
        ? tabs.filter(tabFilter).sort(tabSorter)
        : tabs)
}

export const useTabStore = () => {
    /* TODO add ignoreTab feature */
    console.log('useTabStore loads')
    const [tabs, setTabs] = useState([])

    const handleUpdated = async (tabId, changeInfo, tabInfo) => {
        /* TODO avoid getting all tabs every update */
        console.log('handleUpdated', tabs, tabId, changeInfo, tabInfo);
        if ( tabInfo.status === "complete" ) {
            const ts = await getTabs()
            setTabs(ts);
        }
    }

    const handleRemoved = (tabId, {windowId, isWindowClosing}) => {
        console.log('handleRemoved', tabId, windowId, isWindowClosing)
        setTabs(tabs=>tabs.filter(t=>t.id !== tabId))
    }

    useEffect(async () => {
        console.log('tabStore useEffect runs')
        /* TODO denylistProtocol on tabs here */
        let tabs = await getTabs();
        setTabs(tabs);

        const updateFilters:UpdateFilter = { properties: [
            'status',
            'discarded'
        ]}

        browser.tabs.onUpdated.addListener(handleUpdated, updateFilters)
        browser.tabs.onRemoved.addListener(handleRemoved)
        return () => {
            browser.tabs.onUpdated.removeListener(handleUpdated)
            browser.tabs.onRemoved.removeListener(handleRemoved)
        }
    }, []);


    console.log('useTabStore ends')//, tabs);
    return tabs
}
