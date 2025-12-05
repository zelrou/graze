import { useState, useEffect, useCallback, useRef, useReducer } from "react";
import { isInDenylist } from "./useTabStore";
import { localStorageReducer } from "@/reducers";

const defaultStorageValue = {sIdx:0, pIdx: 0, cIdx: 0}

export function useLocalStorage () {

    const [localStorage, localStorageDispatch] = useReducer(localStorageReducer, {})
    /* TODO
     * useRef for stateLocalStore
     * and sorted stringified array for actual state? */
    const [isStorageInitialized, setIsStorageInitialized] = useState(false)
    console.log('LOAD LOCAL STORAGE')
    useEffect(()=>{
        console.log('======STORAGE:::resetting listener')
        const handleStorageChange = (changes, area) => {
            console.log(`Change in storage area: ${area}`);
            const changedItems = Object.keys(changes);
            for (const item of changedItems) {
                const {oldValue, newValue} = changes[item]
                console.log(`${item} has changed:`);
                console.log("Old, New  ", oldValue, newValue);
                if (newValue) {
                    localStorageDispatch({type:'set', key: item, value: newValue})
                } else {
                    localStorageDispatch({type: 'remove', key: item})
                }
            }
        }

        browser.storage.onChanged.addListener(handleStorageChange);

        return () => {
            console.log("========STORAGE::: removing listener")
            browser.storage.onChanged.removeListener(handleStorageChange)
        }
    }, [])

    const setLocalStorage = useCallback( async (x, v=null) => {
        console.log('setLocalStorage', x, v, localStorage);
        let res;
        if (v) {
            let shouldPersist = false
            if (localStorage.hasOwnProperty(x)) {
                const stateV = localStorage[x]
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
            console.log('shouldPersist', shouldPersist)
            if (shouldPersist) {
                res = await browser.storage.local.set({ [x]: v })
                console.log('STORAGE RES:', res)
                //setStateLocalStorage(s=>({...s, [x]:v}))
            } else {
                console.log('no changes to persist')
                res = Promise.resolve(true)
            }
        }
        else {
            res = await browser.storage.local.set(x)
            console.log('STORAGE RES2:', res)
            //setStateLocalStorage(s=>({ ...s, ...x}))
        }

        return res
    },[localStorage])


    useEffect(() => {
            browser.storage.local.get().then(res=>{
                localStorageDispatch({type:'set_all', payload: res});
            });
    }, [])



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
    useEffect(() => {
        if (!isStorageInitialized) {
            browser.storage.local.getKeys().then(keys=>{
                const res = normalizeStorage(keys)
                console.log(res)
                setIsStorageInitialized(true);
            })
        }
    },[normalizeStorage, setIsStorageInitialized])



    console.log('end:useLocalStorage', localStorage);
    return [localStorage, setLocalStorage];
}
