
export const getnIdx = (cIdx, nodeEnds) => {
    let i = 0;
    let pad = 0;
    while (true) {
        if (nodeEnds[i]>cIdx) {
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

export class Element {
    get charLen(){
        return this.children.length
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
