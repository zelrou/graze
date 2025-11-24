import { useEffect,  useRef } from 'react';
import "@/assets/tailwind.css";
import logo from '@/assets/img/logo.svg';
import { isInDenylist } from '@/hooks/useTabStore';

const relativeURL = '/main.html'
const extensionURL = browser.runtime.getURL(relativeURL)

export default function App() {
    const targetTab = useRef(null)
    const bypassTab = useRef(null)

    /*
 import "~/assets/tailwind.css";    * Gets the tab underlying the popup
     * */
    const getCurrentTabArray = async () => {
        const queryInfo = { active: true, currentWindow: true }
        return await browser.tabs.query(queryInfo)
    }
    useEffect(()=>{
        const getCurrentTab = async () => {
            console.log('========== Popup Effect getCurentTab ==========')
            const currentTabArray = await getCurrentTabArray()
            if (currentTabArray.length) {
                targetTab.current = currentTabArray[0]
                if ((!targetTab.current.url)
                    || (isInDenylist(targetTab.current.url))) {
                    bypassTab.current = true;
                } else {
                    bypassTab.current = false;
                }
            }
        }
        getCurrentTab()
        return () => {}
    })

    const getExtensionHomeWindows = () => {
        const fetchProperties = { type: 'tab' }
        if (targetTab.current && targetTab.current.windowId) {
            fetchProperties.windowId = targetTab.current.windowId
        }
        const extensionWindows = browser.extension.getViews(fetchProperties)
        const homeWindowArray = extensionWindows
                    .filter(w => w.location.href.includes(extensionURL))
        return homeWindowArray
    }

    const setExtensionTabActive = async () => {
        const queryInfo = { url: [extensionURL, `${extensionURL}?*`] }
        const extensionTabs = await browser.tabs.query(queryInfo)
        if (extensionTabs.length) {
            const extensionTabId = extensionTabs[0].id
            return browser.tabs.update(extensionTabId, {active: true})
        }
    }

    const handleClickReadTab = async () => {
        try {
            if ( (!targetTab.current)
                || (targetTab.current.status !== 'complete')) {
                return null
            }

            const homeWindowArray = getExtensionHomeWindows()
            if (homeWindowArray.length){
                const homeWindow = homeWindowArray[0]
                if ((!bypassTab.current)
                    && (homeWindow.hasOwnProperty('sendMessageToTab'))) {
                    homeWindow.sendMessageToTab(targetTab.current.id)
                }
                return setExtensionTabActive()
            } else {
                const newUrl = `${relativeURL}?tabId=${targetTab.current.id}`
                const createProperties  = {
                    url: (bypassTab.current ? extensionURL : newUrl),
                    active: true
                }
                const extensionTab = await browser.tabs
                    .create(createProperties);
                return extensionTab
            }
        } catch (e) {
            console.log(e)
            return null
        }
    }

    const handleClickHome = async () => {
        try {
            const homeWindowArray = getExtensionHomeWindows()
            if (!homeWindowArray.length) {
                return browser.tabs.create({url: relativeURL})
            } else {
                return setExtensionTabActive()
            }
        } catch (e) {
            console.log(e)
            return null
        }
    }

    return (
        <div className={`w-full absolute top-0 left-0 right-0 bottom-0 text-center
            h-full p-3 bg-zinc-800 grid`}>
            <header className={`place-self-center flex flex-col gap-y-3
                items-center justify-center text-white`}>

                <img className="size-16 pointer-events-none" alt="logo"
                    src={logo} />

                <button
                    className='w-24 opacity-70 hover:opacity-100 font-semibold border-2 border-zinc-700 px-3 py-1 hover:bg-emerald-500/50'
                    onClick={handleClickReadTab}>
                    Read</button>

                <button
                    className='w-24 opacity-70 hover:opacity-100 font-semibold border-2 border-zinc-700 px-3 py-1 hover:bg-salmon-500'
                    onClick={handleClickHome}>
                    Home</button>

            </header>
        </div>);
}
