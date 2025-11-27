import { createContext, useContext, useEffect, useState, useRef } from "react"
import { encodeUnicode, decodeUnicode } from '@/utils/encodeUtils';
import logo from '@/assets/img/logo.svg';
import ButtonWithPopover from '@/components/ButtonWithPopover';

const svgClipboard = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
</svg>)
const svgTrash = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>)
const svgQuestionMarkCircle = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
</svg>)
const svgDocumentArrowDown = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
</svg>)
const svgGithub = (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/>
</svg>)


async function setClipboard(text="<3") {
  const type = "text/plain";
  const clipboardItemData = {
    [type]: text,
  };
  const clipboardItem = new ClipboardItem(clipboardItemData);
  await navigator.clipboard.write([clipboardItem]);
}

const ModalContainer = ({...props}) => {
    /* TODO pass all props to dialog and props.modalContext to ModalContext? */
    const {children, modalRef, onClose, className} = props;
    const defaultClass = `backdrop:bg-black/60 place-self-center bg-zinc-100 text-black sm:border-salmon-500 sm:border-4`
    const classStr = `${defaultClass} ${className}`
    return (
            <dialog
                className={classStr}
                ref={modalRef}
                onClose={onClose}>
                {children}
            </dialog>
    )
}


export const WelcomeModal = ({modalRef, showHelp, setLocalStorage, setShowHelp}) => {
    const onCloseWelcomeModal=()=> {
        if (showHelp) setShowHelp(false)
    }
    return (
        <ModalContainer modalRef={modalRef} onClose={onCloseWelcomeModal}>
        <div className={`p-4 space-y-4 flex flex-col items-center `}>
        <h2 className='text-center text-lg'>Welcome!</h2>
        <div className='text-md'>
            <p className='my-3'>
                In another tab, open a page you want to read (e.g. a&nbsp;
                <a className='underline' target="_blank" href="https://en.wikipedia.org/wiki/Special:Random">random wikipedia article</a>).
                <br />
                You'll see the page in your Open Tabs list.
                <br />
                Click the arrow to the right of the corresponding tab to enter the Reader Mode.
            </p>
            <p className='my-3'>From there you can ...</p>
            <ul className='ml-5 mt-2 list-disc'>
                <li>Click the arrows on the left and right to seek forward and back in the text</li>
                <li>Use the arrow keys to seek</li>
                <li>Click the play button at the bottom to auto-seek</li>
            </ul>
            <p className='my-3'>As you seek, you'll see your progress and location update</p>
            <p className='my-3'>Click Mark Progress so you can come back to that position</p>
        </div>
        <div className='flex flex-row space-x-4 text-sm'>
            <button
                onClick={ async() => {
                    await setLocalStorage('graze', {'setup': false})
                    setShowHelp(false)
                    modalRef.current.close()
                }}
                className='border-1 border-gray-300 p-1'>dont show this again</button>
            <button autoFocus
                onClick={()=>{
                    setShowHelp(false)
                    modalRef.current.close()
                }}
                className='border-1 border-gray-300 p-1'>dismiss</button>
        </div>
    </div></ModalContainer>)
}

export default function ToolbarTop ({localStorage, setLocalStorage, setMsg}) {
    /* ========== WELCOME / HELP MODAL REF ========== */
    const welcomeModalRef = useRef(null)
    const isSetup = (localStorage.hasOwnProperty('graze')
        && localStorage['graze'].setup)
    const [showHelp, setShowHelp] = useState(false)
    const handleClickHelp = () => {
        setShowHelp(true)
    };
    console.log('WELCOME setup,help', isSetup,showHelp)
    useEffect(()=>{
        if (isSetup) setShowHelp(true);
    }, [isSetup, setShowHelp])
    if (welcomeModalRef.current && ((isSetup&&showHelp) || (showHelp&&!isSetup))) {
        welcomeModalRef.current.showModal();
    }

    /* ========== CLEAR STORAGE ==========  */
    const clearAllStorageRef = useRef(null)

    const handleClickClearAllStorage = async (e) => {
        e.preventDefault()
        console.log('handleClickClearAllStorage')
        for (const key of Object.keys(localStorage)) {
            browser.storage.local.remove(key)
        }
        if (clearAllStorageRef.current) {
            clearAllStorageRef.current.hidePopover()
        }
        setMsg('Storage cleared!')
        return null
    }


    /* ========== EXPORT STORAGE ==========  */
    const handleClickExport = (e) => {
        e.preventDefault()
        const uniStr = JSON.stringify(localStorage)
        const encoded = encodeUnicode(uniStr)
        console.log(encoded)
        setClipboard(encoded)
        setMsg('Copied data to clipboard.')
    }


    /* ========== IMPORT STORAGE ==========*/
    const importModalRef = useRef(null)
    const inputTextAreaImportModalRef = useRef(null)
    const handleClickOpenImportModal = (e) => {
        e.preventDefault()
        importModalRef.current.showModal()
    }
    const handleClickSubmitImportModal = (e) => {
        e.preventDefault()
        const res = inputTextAreaImportModalRef.current.value;
        importModalRef.current.close(res)
    }
    /* https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog#handling_the_return_value_from_the_dialog */
    const onCloseImportModal = async (e) => {
        inputTextAreaImportModalRef.current.value = ''
        const { returnValue } = importModalRef.current

        if ((!returnValue) || (returnValue.length < 4)) {
            setMsg(`Import Canceled`)
            return null
        }

        let decodedStr;
        try {
            decodedStr = decodeUnicode(returnValue)
        } catch(e) {
            console.log(e)
            decodedStr = null
        }

        if (!decodedStr) {
            setMsg(`Import failure: invalid import string.`)
            return null
        }

        let decoded;
        try {
            decoded = JSON.parse(decodedStr)
        } catch(e){
            console.log(e)
            setMsg(`Import failure: failed to parse import string.`)
            return null
        }

        let result = null
        try {
            console.log(decoded)
            await setLocalStorage(decoded)
            result = 'success'
        } catch(e) {
            console.log(e)
            result = 'failure'
        }

        switch(result) {
            case 'failure': {
                setMsg(`Import failure: error storing data.`)
                return null
             }
            case 'success': {
                setMsg(`Successfully imported data!`)
                console.log('success imported', decoded)
                return null
            }
            default: {
                setMsg('Import failure: unexpected error.')
                return null
            }
        }
    }

    return (<>
        {/* ========== MODALS ========== */}
        <WelcomeModal
            modalRef={welcomeModalRef}
            showHelp={showHelp}
            setShowHelp={setShowHelp}
            setLocalStorage={setLocalStorage} />
        <ModalContainer modalRef={importModalRef} onClose={onCloseImportModal}>
           <form method='dialog' className='min-w-[25vw] min-h-[20vw] p-4 flex flex-col space-y-4 justify-between items-center'>
                <h4 className=''>Import</h4>
                <label className='grow flex flex-col w-8/10' for='importStorageInput'>
                    Paste exported settings here:
                    <textarea
                        className='border-gray-300 border mx-1 w-full grow'
                        required
                        minLength={4}
                        ref={inputTextAreaImportModalRef}
                        name='importStorageInput'></textarea>
                </label>
                <div className='flex flex-row space-x-4'>
                    <button type='submit' className='border-1 border-gray-300 p-1'
                        onClick={handleClickSubmitImportModal}>
                        confirm</button>
                    <button type='button' className='border-1 border-gray-300 p-1'
                        onClick={()=>importModalRef.current.close()}
                        autoFocus>
                        cancel</button>
                </div>
            </form>
        </ModalContainer>

        <div className='flex flex-col w-screen bg-zinc-800'>
            {/* ========== TOP TOOLBAR ========== */}
            <div id='app-toolbar-top' className='grid grid-rows-1 grid-cols-3 border-gray-300/50 border-b-4 px-4'>
                {/* LEFT (col-1/3 */}
                <img className='col-span-1 h-10 m-1' src={logo} alt='logo' />
                {/* RIGHT (col-start-3/3) */}
                <div className={`relative col-start-3 col-span-1 justify-self-end
                    flex flex-row space-x-4 justify-between text-center text-sm`}>

                    <ButtonWithPopover
                        buttonProps={{onClick:handleClickHelp}}
                        buttonChildren={svgQuestionMarkCircle}
                        popoverChildren={`Help`} />

                    <ButtonWithPopover
                        buttonProps={{popoverTarget:'confirmClearAllStorage'}}
                        buttonChildren={svgTrash}
                        popoverChildren={`Clear All Storage`} />
                    <div popover="auto" id='confirmClearAllStorage'
                        ref={clearAllStorageRef}
                        className={`open:absolute open:grid opacity-0 open:opacity-90`}>
                        <div className='place-self-center'>
                            <h3 className='text-lg'>Clear All Storage?</h3>
                            <button className='border p-3 mx-2'
                                onClick={(e)=>handleClickClearAllStorage(e)}>
                                confirm</button>
                            <button className='border p-3 mx-2'
                                popoverTarget='confirmClearAllStorage'>
                                cancel</button>
                        </div>
                    </div>

                    <ButtonWithPopover
                        buttonProps={{onClick:handleClickExport}}
                        buttonChildren={svgClipboard}
                        popoverChildren={`Export Storage & Settings to Clipboard`} />

                    <ButtonWithPopover
                        buttonProps={{onClick:handleClickOpenImportModal}}
                        buttonChildren={svgDocumentArrowDown}
                        popoverChildren={`Import Storage & Settings`} />

                    <a className='basis-xs self-center' target='_blank'
                        href='https://github.com/zelrou/graze'>
                        {svgGithub}
                    </a>
                </div>
            </div>
        </div>
    </>)
}
