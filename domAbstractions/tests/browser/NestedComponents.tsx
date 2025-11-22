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

export const SliceTest = () => {
    return(<div>
        <span id="s1">regs1a<b> bolds1 </b>regs1b</span>
        <span id="s2">regs2a<em> ems2 </em>regs2b</span>
        <span id="s3">regs3<b> bolds3 </b><em>ems3</em></span>
        <span id="s4">regs4</span>
        <span id="s5">regs5a<em>ems5</em>regs5b</span>
    </div>)
}
