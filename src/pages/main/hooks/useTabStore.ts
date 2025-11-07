import { useState, useEffect } from "react";

export const denylistProtocol = ['about:', 'moz-extension:', 'graze']

export const isInDenylist = (s) => {
    if (s === 'graze') return true
    const { protocol } = URL.parse(s);
    return denylistProtocol.includes(protocol)
}

const getTabs = async (queryInfo={}) => {
    let tabs = await browser.tabs.query(queryInfo)
    if (tabs.length) {
        tabs = tabs.sort((t1, t2) => (t2.lastAccessed - t1.lastAccessed))
    }


    return tabs.filter(t=>!isInDenylist(t.url))
}

export const useTabStore = () => {
    const [tabs, setTabs] = useState([])
    const tabsIds = () => (tabs.length > 0) ? tabs.map(t=>t.id).sort() : []
    const tabsUrls = () => (tabs.length > 0) ? tabs.map(t=>t.url).sort() : []
    console.log('useTabStore loads')//, tabs);

    const handleUpdated = async (tabId, changeInfo, tabInfo) => {
        console.log('handleUpdated', tabs, tabId, changeInfo, tabInfo);
        if ( tabInfo.status === "complete" ) {
            const ts = await getTabs()
            setTabs(ts);
        }
        /* TODO avoid getting all tabs in handleUpdated e.g.
        if (!tabsIds().includes(tabId)
           || !tabsUrls().includes(tabInfo.url) ) {
            console.log('handleUpdated adding', tabs, tabId, changeInfo, tabInfo);
            setTabs(tabs => tabs.concat(tabInfo))
        }
        */
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

        const updateFilters = {properties: ["status"]}

        browser.tabs.onUpdated.addListener(handleUpdated, updateFilters)
        browser.tabs.onRemoved.addListener(handleRemoved)
        return () => {
            browser.tabs.onUpdated.removeListener(handleUpdated, updateFilters)
            browser.tabs.onRemoved.removeListener(handleRemoved)
        }
    }, []);


    console.log('useTabStore ends')//, tabs);
    return tabs
}
