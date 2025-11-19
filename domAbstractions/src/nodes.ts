
export const getnIdx = (cIdx, nodeEnds) => {
    let i = 0;
    let pad = 0;
    while (true) {
        if ((nodeEnds[i]>cIdx) && (i<nodeEnds.length)) {
            const prevNode = nodeEnds[i-1] ?? 0;
            pad = cIdx - prevNode;
            break;
        }
        i++;
    }
    return [i, pad];
}

export const makeNodeEnds = (nodes) => {
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

export class Element {
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
    *walker(step, start=0, end=null) {
        let i=start;
        const stop = end ?? this.charLen;
        while((i<stop)&&(i<this.charLen)) {
           yield [[step, start, stop, i],this.children.slice(i,i+step)]
            i = i + step;
        }
    }
    addChild(child){
        this.children = this.children.concat(child)
    }

    child(nIdx){
        if (!Array.isArray(nIdx)) return this.children.at(nIdx)
        let parent = this;
        for (let level of nIdx) {
            parent = parent.child(level)
        }
        return parent;
    }

    clone(){
        const propsCopy = JSON.parse(JSON.stringify(this.props))
        if (this.isLeaf) return new Element(this.children, this.type, propsCopy)
        const clone = new Element(new Array(), this.type, propsCopy)
        for (let child of this.children){
            clone.addChild(child.clone())
        }
        return clone;
    }

    slice(nIdxA=0, nIdxB=-1){
        const clone = this.clone()
        clone.children = clone.children.slice(nIdxA, nIdxB)
        return clone
    }

    leaves(path=[], found=[]){
        if (this.isLeaf) return 0
        for(let i=0;i<this.children.length;i++) {
            const child = this.children[i]
            if (!child.charLen) {
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

    sliceChars(cIdxA=0, cIdxB=-1){
        if (this.isLeaf) return this.slice(cIdxA, cIdxB)
        const a = this.getWithCharIdx(cIdxA)
        const b = this.getWithCharIdx(cIdxB)
        const nodeSlice = this.slice(a[0], b[0])
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
        return getnIdx(cIdx, this.charEnds)
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
