import { SetLocationContext } from "@/contexts"
const svgArrowTurnDownLeft = (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m7.49 12-3.75 3.75m0 0 3.75 3.75m-3.75-3.75h16.5V4.499" />
</svg>)

export const LocationForm = ({totalCharLength, paragraphUrl, cIdx, togglePaused}) => {
    const { setLocation } = useContext(SetLocationContext)
    const prevParagraphUrl = useRef(null)
    const [prevCIdx, setPrevCIdx] = useState(null)
    const [_cIdx, set_cIdx] = useState(0)

    const handleLocationChange = e => {
        e.stopPropagation();
        togglePaused(true);
        console.log(e.target)
        const inputVal = Number.parseInt(e.target.value)
        if (!inputVal) return null
        const newVal = (
            ( (inputVal<totalCharLength) && (inputVal>=0) )
            ? inputVal : 0)
        set_cIdx(newVal)
    }

    const handleSubmitSettings = e => {
        e.preventDefault();
        e.stopPropagation();
        const form = e.target;
        const formData = new FormData(form);
        console.log(formData);
        const formJson = Object.fromEntries(formData)
        const c = Number(formJson.charIndexInput)
        setLocation(c)
    }

    if (paragraphUrl !== prevParagraphUrl.current) {
        console.log('url change')
        prevParagraphUrl.current = paragraphUrl
        set_cIdx(0)
        // charLength = structuredWork.parts[0].paragraphs[0].length
    } else if (paragraphUrl) {
        console.log('same url')
        if (prevCIdx !== cIdx) {
            setPrevCIdx(cIdx)
            set_cIdx(cIdx)
        }
        // charLength = structuredWork.parts[_sIdx].paragraphs[_pIdx].length
    }
    const locationMatches = ((_cIdx === cIdx))

    return (<div className='order-5 sm:order-4 w-full md:w-3/10 flex flex-col flex-grow-0 flex-shrink align-center justify-center'>
        <form method="post" onSubmit={handleSubmitSettings}
        className='flex-shrink flex-grow-0 flex gap-x-4 flex-row text-center sm:text-end justify-between sm:justify-center'>
        <div className='contents'>
            <label for='charIndexInput'><span className='text-red-300 font-semibold'>C:</span>
                <input type='number' name='charIndexInput'
                    className=''
                    min='0' max={totalCharLength-1}
                    value={_cIdx}
                    onChange={e=>handleLocationChange(e)} />

                <span className='mr-2'>{ `/${totalCharLength-1}` }</span>
            </label>
        </div>
        <button disabled={locationMatches} type="submit"
            name='submitLocation'
           className={locationMatches ? 'bg-zinc-500' : 'bg-indigo-500 hover bg-fuchsia-500'}>
           {svgArrowTurnDownLeft}</button>
    </form></div>)
}
