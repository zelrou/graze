import { useContext} from 'react';
import Location from "@/utils/Location";
import { LocalStorageContext } from "../contexts";
import ButtonWithPopover from "@/components/ButtonWithPopover";

const svgPlusCircle = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>)
const svgArrowRightCircle = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>)
const svgWindow = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V8.25m-18 0V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6ZM7.5 6h.008v.008H7.5V6Zm2.25 0h.008v.008H9.75V6Z" />
</svg>)


export const LocationSpan = ({ storageItem }) => {
    try {
        const { sIdx, pIdx, cIdx } = new Location(storageItem)
        return (<span>{`${sIdx}.${pIdx}.${cIdx}`}</span>)
    } catch (e) {
        console.log(e)
        return null
    }
}

export const StoreUrlButton = ({tabUrl, ...props}) => {
    const { setLocalStorage } = useContext(LocalStorageContext)

    const handleClickStoreUrl = async () => setLocalStorage(
        tabUrl,
        {sIdx:0, pIdx:0, cIdx:0}
    )

    const buttonProps = {
        onClick: handleClickStoreUrl,
        ...props
    }

    return (
        <ButtonWithPopover
            buttonProps={buttonProps}
            buttonChildren={ svgPlusCircle }
            popoverChildren={ `remember?` }
        />
    )
}

export const LocationSpanOrStoreUrlButton = ({ tabUrl }) => {
    const {localStorage} = useContext(LocalStorageContext)
    let item;
    if ( Reflect.has(localStorage,tabUrl) ) item = localStorage[tabUrl]
    if (item && Location.hasEveryCoordKey(item)) {
        return ( <LocationSpan storageItem={item}/> )
    }
    return ( <StoreUrlButton className='opacity-50 hover:opacity-100 float-start' tabUrl={tabUrl} /> )
}

export const ReadButton = ({
    readerUrl,
    sendMessageToTab,
    setIsMinimized,
    tab
    }) => {

    const defaultClassName = [
        `btn-readero`,
        `w-full p-1 flex flex-row`,
        `outline-2 outline-zinc-300/50`,
        `text-center justify-center`,
        `opacity-25 hover:opacity-100`,
        `hover:bg-emerald-500/50`
    ].join(' ')

    const handleClickRead = async () => {
        return (readerUrl === tab.url
            ? setIsMinimized(false)
            : sendMessageToTab(tab.id))
    }

    return (
        <button
            type='button'
            name='read'
            aria-label='read'
            className={ defaultClassName }
            disabled={ tab.discarded }
            onClick={ handleClickRead }>
            { (readerUrl !== tab.url)
                ? svgArrowRightCircle
                : svgWindow }
        </button>
    )
}

export const TitleOrURLSpan = ({ tab }) => {
    const {favIconUrl, title, url} = tab;
    return (
        <div className='grow flex flex-row items-center'>
            {( !favIconUrl
                ? null
                : (<img className='w-[16px] h-[16px] mr-1' src={favIconUrl}/>)
            )}
            <span className='grow'>{ title ?? url }</span>
        </div>)
}

export const OpenTabTableCell = ({children, className, ...props}) => {
    const defaultClassName = `p-2 `
    const newClassName = defaultClassName.concat(' ', className)
    return (
        <td className={newClassName} {...props}>
            {children}
        </td>
    )
}
