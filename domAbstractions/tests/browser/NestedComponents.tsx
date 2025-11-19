export const Depth1 = ()=>{
    return (<span><b>bold in span</b></span>)
}

export const Depth1Children5= ()=>{
    return (<span>
        <b>bold in span</b>
        regular text
        <em>emphasized text</em>
        <em>more emphasized text</em>
        <span>nested span</span>
    </span>)
}

export const Depth2Heading = ()=>{
    return (<h2>
        <b>bold0</b>
        regular
        <b>bold1<em>bold emphasized</em>bold2</b>
    </h2>)
}
