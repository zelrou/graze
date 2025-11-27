import { useRef } from "react"

export default function ButtonWithPopover ({...props}) {
    const buttonRef = useRef(null)
    return (<button
        onMouseOver={(e)=>buttonRef.current.showPopover()}
        onMouseOut={(e)=>buttonRef.current.hidePopover()}
        onFocus={(e)=>buttonRef.current.showPopover()}
        onBlur={(e)=>buttonRef.current.hidePopover()}
        {...props.buttonProps} >
        {props.buttonChildren}
        <div {...props.popoverProps} popover='hint' className='tooltip' ref={buttonRef}>
            {props.popoverChildren}</div>
    </button>)
}
