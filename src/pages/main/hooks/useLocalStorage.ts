import { useState, useEffect, useCallback } from "react";
import { isInDenylist } from "./useTabStore";

const defaultStorageValue = {sIdx:0, pIdx: 0, cIdx: 0}

export const useLocalStorage = () => {
    /* TODO
     * useRef for stateLocalStore
     * and sorted stringified array for actual state? */
    const [stateLocalStorage, setStateLocalStorage] = useState({});
    const [isStorageInitialized, setIsStorageInitialized] = useState(false)

    const setLocalStorage =  useCallback(async (x, v=null) => {
        console.log('setLocalStorage', x, v);
        let res;
        if (v) {
            let shouldPersist = false
            if (stateLocalStorage.hasOwnProperty(x)) {
                const stateV = stateLocalStorage[x]
                for (let [argKey, argVal] of Object.entries(v)) {
                    if (stateV.hasOwnProperty(argKey)) {
                        if (argVal !== stateV[argKey]) { // persist bc val
                            shouldPersist = true;
                        }
                    } else { // persist bc key
                        shouldPersist = true;
                    }
                }
            } else { //persist bc top level key does not exit
                shouldPersist = true
            }
            if (shouldPersist) {
                res = await browser.storage.local.set({ [x]: v })
            } else {
                console.log('no changes to persist')
                res = Promise.resolve(true)
            }
        }
        else {
            res = await browser.storage.local.set(x)
        }
        return res
    }, [stateLocalStorage])


    useEffect(async () => {
        const res = await browser.storage.local.get()
        setStateLocalStorage(res);
    }, [setStateLocalStorage])

    useEffect(()=>{
        const handleStorageChange = (changes, area) => {
            console.log(`Change in storage area: ${area}`);
            const changedItems = Object.keys(changes);
            for (const item of changedItems) {
                const {oldValue, newValue} = changes[item]
                console.log(`${item} has changed:`);
                console.log("Old, New  ", oldValue, newValue);
                if (newValue) {
                    setStateLocalStorage(state => ({
                        ...state,
                        [item]: newValue
                    }))
                } else {
                    setStateLocalStorage(state => {
                        const oldEntries = Object.entries(state)
                        return Object.fromEntries(oldEntries
                            .filter(([k,_]) => (k !== item)))
                    })
                }
            }
        }

        browser.storage.onChanged.addListener(handleStorageChange);
        return () => {
            browser.storage.onChanged.removeListener(handleStorageChange)
        }
    }, [setStateLocalStorage])

    const normalizeStorage = useCallback(async (keys=[]) => {
        const normalized = []
        if (!keys || !keys.length) return Promise.resolve(normalized)
        console.log('normalize storage', keys)
        for (let k of keys.filter(key=>!isInDenylist(key))) {
            if (!k) continue;
            const res = await browser.storage.local.get(k)
            const v = res[k]
            console.log('normalizeStorage', keys,k,v)
            let changed = false;
            if ( !v.hasOwnProperty('sIdx') ) { v.sIdx = 0; changed = true; }
            if ( !v.hasOwnProperty('pIdx') ) { v.pIdx = 0; changed = true; }
            if ( !v.hasOwnProperty('cIdx') ) { v.cIdx = 0; changed = true; }
            if (changed) {
                const storageResponse = await browser.storage.local.set({ [k]: v })
                normalized.push([k, storageResponse])
            }
        }
        return normalized
    }, [])

    /* TODO declaring isStorageInitialized dependencies throws error? */
    useEffect(async () => {
        if (!isStorageInitialized) {
            const keys = await browser.storage.local.getKeys();
            const res = normalizeStorage(keys)
            console.log(res)
            setIsStorageInitialized(true);
        }
    },[normalizeStorage, setIsStorageInitialized])



    console.log('end:useLocalStorage')//, stateLocalStorage);
    return [stateLocalStorage, setLocalStorage];
}
