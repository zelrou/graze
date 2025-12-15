type NumberOrNull = number|null
type Path = Array<number>|[]
type PathOrNum = Path|number
type PathOrNumOrNull = PathOrNum|null
type ElementOrNull = Element|null
type Children = Array<Element>|string
type Child = Element|string

type WalkerState = [step:number,start:number,stop:number,i:number]
type WalkerResult = [WalkerState,Element]
interface ElementInterface {
    children:Children,
    type:string
    props:object,
    charEnds:Array<number>,
    charLen:number,
    height:number,
    innerText:string,
    isLeaf:boolean
    addChild(el:Child):void,
    child(path:PathOrNumOrNull):ElementOrNull,
    walker(step:number,start:number,stop?:number):Iterator<WalkerResult[]>,
    slice(start:PathOrNumOrNull, end:PathOrNumOrNull):Element,
    clone():Element,
    leaves():Array<Path>,
    getWithCharIdx():Element
}

interface LeafElementInterface extends ElementInterface {
    children:string
}

export const getnIdx = (cIdx: number, nodeEnds: number[]): [number, number] => {
    let pad = 0;
    let i = 0;
    if (nodeEnds.length === 0) return [-1,-1]
    while(true){
        if (( i < nodeEnds.length ) && ( nodeEnds[i] > cIdx )) {
            const prevNode = nodeEnds[i-1] ?? 0;
            pad = cIdx - prevNode;
            break;
        }
       i = i + 1;
    }
    return [i, pad];
}

export const makeNodeEnds = (nodes: number[]): number[] => {
    const nodeEnds = new Array()
    let prev = 0;
    for (let i=0; i<nodes.length; i++) {
        const curr = nodes[i]
        const total = prev + curr;
        nodeEnds.push(total)
        prev = total;
    }
    return nodeEnds
}

export const sumCharLens = (acc, curr) => {
    return acc + curr.charLen
}

export class Element implements ElementInterface{
    children:Array<Element>|string;
    type:string;
    props:object;

    /*
    static isLeaf(el:Element):el is LeafElementInterface{
        return ((typeof el.children) === 'string')
    }
    */
    get isLeaf(){
        return ((typeof this.children) === 'string')
    }

    get charLen(){
        let len;
        if (this.isLeaf) {
            len = this.children.length
        } else {
            return this.children.reduce(sumCharLens ,0)
        }
        return len;
    }

    constructor(children='', type='', props={}){
        this.children = children
        this.type = type
        this.props = props
    }

    addChild(child:Child){
        this.children = this.children.concat(child)
    }

    child( nIdx:PathOrNumOrNull ): string|Element|undefined {
        // returns itself if no argument provided
        if ( (nIdx == null)
            || (Array.isArray(nIdx) && nIdx.length === 0) )
            return this;
        // return child at idx if argument is number
        if ( !Array.isArray(nIdx) )
            return this.children.at(nIdx);
        // the argument is a path
        // make each child the new parent to arrive at target
        let parent = this;
        for (let level of nIdx) {
            parent = parent.child(level)
        }
        return parent;
    }

    clone():Element{
        const propsCopy = JSON.parse(JSON.stringify(this.props))
        if (this.isLeaf) return new Element(this.children, this.type, propsCopy)
        const clone = new Element(new Array(), this.type, propsCopy)
        for (let child of this.children){
            clone.addChild(child.clone())
        }
        return clone;
    }

    slice(nIdxA=[0], nIdxB=[]):Element{
        // if not arrays, wrap the arguments in arrays
        const startIdx = (!Array.isArray(nIdxA) ? [nIdxA] : nIdxA)
        // if no end argument, set to children.length
        const endIdx = nIdxB.length===0 ? [this.children.length] : nIdxB
        // always returns a clone
        const clone = this.clone()

        // shallow slice
        if (this.isLeaf || (startIdx.length === 1 && endIdx.length === 1)) {
            clone.children = clone.children.slice(nIdxA[0], nIdxB[0])
            return clone
        }

        // deep slice
        // iterate through each level but the last and replace children
        // with array starting at that levels corresponding index
        const startLevels = startIdx.length;
        for (let i=0; i<startLevels; i++) {
            const start = startIdx.at(i);
            const parent = clone.child((new Array(i)).fill(0))
            const origLevelLen = parent.children.length;
            parent.children = parent.children.slice(start)
            const lenDiff = Math.abs(parent.children.length - origLevelLen);
            // adjust the end indices as we contracted the array
            const end = endIdx.at(i)
            if (end !== undefined) {
                endIdx[i] = end - lenDiff;
            }
        }
        // same as above, to slice off end accordingly
        for (let i=0; i<endIdx.length; i++) {
            const end = endIdx.at(i) + 1
            const parent = clone.child(endIdx.slice(0,i))
            parent.children = parent.children.slice(0, end)
        }

        return clone
    }

    leaves(path=[], found=[]):Array<Path>|[]{
        if (this.isLeaf) return []
        for(let i=0;i<this.children.length;i++) {
            const child = this.children.at(i)
            if (!child.charLen) {
                // TODO: NOTE we could also reasonably call these leaves
                continue;
            }
            if (child.isLeaf) {
                found.push([...path, i])
            } else {
                child.leaves([...path,i], found)
            }
        }
        return found
    }

    get height(){
        const paths = this.leaves()
        const pathHeights = paths.map(path=>path.length)
        return Math.max.apply(null, pathHeights)
    }

    static parse(dom){
        return parseDomToElement(dom)
    }

    get charEnds(){
        const leaves = this.leaves()
        const charLens = leaves.map(path=>this.child(path).charLen)
        const charEndList = makeNodeEnds(charLens)
        const zipped = leaves.map((path,i)=>[path, charEndList[i]])
        return zipped
    }

    getWithCharIdx(cIdx){
        if (cIdx >= this.charLen) return undefined
        const charEnds = this.charEnds
        const totals = charEnds.map(([path, total])=>total)
        const [i, pad] = getnIdx(cIdx, totals)
        const res = [charEnds[i][0], pad]
        return res
    }

    get innerText(){
        const leaves = this.leaves()
        const res = new Array()
        for (let path of leaves) {
            res.push(this.child(path).children)
        }
        return res.join('')
    }

    *walker (step:number, start:number=0, end:NumberOrNull=null) {
        let i = start;
        // ensure stop doesnt exceed charLen
        const maxCharLen = this.charLen - 1 + step
        let stop = end ?? maxCharLen;
        stop = Math.min(stop, maxCharLen)
        while ((i < stop)) {
            const status = [step, start, stop, i]
            const sliceEndCharIdx = Math.min(i + step -1, this.charLen -1);

            // find the path to the char indexes
            const [startParent, startPad] = this.getWithCharIdx(i)
            const [endParent, endPad] = this.getWithCharIdx(sliceEndCharIdx)

            // declare mutable references
            let startPath = startParent;
            let endPath = endParent;

            // add the leaf padding to end of path
            startPath = startPath.concat(startPad)
            endPath = endPath.concat(endPad)

            const slice = this.slice(startPath, endPath)
            const res = [slice, status]
            yield res
            i = sliceEndCharIdx+1;

        }
    }
}

export class PGraph {
    constructor(elements=[]){
        this.children = [...elements]
    }

    get charLen(){
        return this.children.reduce((acc,curr) => {
            return acc + curr.charLen
        }, 0)
    }

    get charEnds(){
        const nodes = this.children.map(c=>c.charLen)
        return makeNodeEnds(nodes)
    }


    getWithCharIdx(cIdx){
        return getnIdx(cIdx, this.charEnds)
    }
    addChild(child){
        this.children = this.children.concat(child)
    }
    getSliceNodes(cIdxA, cIdxB){
        const idxA = this.getWithCharIdx(cIdxA)
        const idxB = this.getWithCharIdx(cIdxB)
        return [idxA, idxB]
    }
    sliceChars(cIdxA, cIdxB){
        const [idxA, idxB] = this.getSliceNodes(cIdxA, cIdxB)
        const [nodeIdxA, charIdxA] = idxA;
        const [nodeIdxB, charIdxB] = idxB;
        let i = nodeIdxA;
        const edge = [];
        if (i === nodeIdxB) {
            edge.push(new Element(
                this.children[i].children.slice(charIdxA, charIdxB)))
            return new PGraph(edge)
        }
        while (true) {
            if (i===nodeIdxA) {
                edge.push(new Element(
                    this.children[i].children.slice(charIdxA)))
            } else if (i !== nodeIdxB) {
                edge.push(this.children[i])
            } else {
                edge.push(new Element(
                    this.children[i].children.slice(0,charIdxB)))
                return new PGraph(edge)
            }
            i = i+1
        }
    }
}

export class Part {
    constructor(pgraphs=[], heading=''){
        this.children= [...pgraphs]
        this.heading = heading
    }
}

export const parseDomToElement = (domElem) => {
    const {nodeName, childNodes} = domElem;
    if(nodeName === '#text'){
        return new Element(domElem.data, '#text', {})
    }
    const elem = new Element([], domElem.nodeName, {})
    for (let child of Array.from(domElem.childNodes)){
        if(child.nodeName === '#text'){
            elem.addChild(new Element(child.data, '#text', {}))
        } else {
            elem.addChild(parseDomToElement(child))
            //res.push(new Element(child.children, child.nodeName))
            //console.log(child)
            //continue;
        }
    }
    return elem
}

/* export const renderRangeToDOM =(r:Range)=>{
    let currentNode = r.startContainer.cloneNode()
    let parentNode = currentNode.parentElement
    do{
        const parentClone = parentElement.cloneNode()
        parentClone.replaceChildren(currentNode)
        
    }
    while (!!parentNode)
        
} */

