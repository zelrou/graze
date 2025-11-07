import { useState, useEffect } from "react";

import { isInDenylist } from "./useTabStore";

const defaultStorageValue = {sIdx:0, pIdx: 0, cIdx: 0}

export const useLocalStorage = () => {
    const [stateLocalStorage, setStateLocalStorage] = useState({});
    const [isStorageInitialized, setIsStorageInitialized] = useState(false)

    const normalizeStorage = async keys => {
        for (let k of keys) {
            if (!k || isInDenylist(k)) continue;
            const res = await browser.storage.local.get(k)
            const v = res[k]
            console.log('normalize', keys,k,v)
            if (   !v.hasOwnProperty('sIdx')
                || !v.hasOwnProperty('pIdx')
                || !v.hasOwnProperty('cIdx') ) {
                await browser.storage.local.set({ [k]: defaultStorageValue })
            }
        }
    }

    const initializeStorage = async () => {
        const keys = await browser.storage.local.getKeys();
        return normalizeStorage(keys)
    }

    useEffect(async () => {
        if (!isStorageInitialized) await initializeStorage()
        const res = await browser.storage.local.get()

        setStateLocalStorage(res);

        const storeListener = async (c,n) => {
            console.log('storeListener:', c, n);
            const res = await browser.storage.local.get();
            setStateLocalStorage(res);
        }

        setIsStorageInitialized(true);
        browser.storage.local.onChanged.addListener(storeListener)
        return () => { browser.storage.local.onChanged.removeListener(storeListener) }
    }, []);
    const setLocalStorage = async (x,v=null) => {
        console.log('setLocalStorage', x, v);
        if (v) { await browser.storage.local.set({[x]:v}) }
        else { await browser.storage.local.set(x) }
        const res = await browser.storage.local.get()
        setStateLocalStorage(res);
    }


    console.log('end:useLocalStorage')//, stateLocalStorage);
    return [stateLocalStorage, setLocalStorage];
}
