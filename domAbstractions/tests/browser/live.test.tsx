import { assert, expect, test, beforeAll, expectTypeOf, describe } from 'vitest'
import { render } from 'vitest-browser-react'
import { faker } from '@faker-js/faker'
import { server } from 'vitest/browser'
import {parseDomToElement, getnIdx, makeNodeEnds, Element, PGraph} from '../../src/nodes.ts'
import {
    _cleanNode as cleanNode,
    evalXPath,
    parseXPathRes,
    getParagraphsWithHeadings,
    phXPath
} from '../../src/xpathUtils.tsx'
import { Depth1Children5, Depth2Heading, SliceTest } from './NestedComponents.tsx'

describe.skip('clean and xpath eval', ()=>{
    const { readFile, writeFile, removeFile } = server.commands
    const file = './tests/browser/flashrom.html'
    let content;
    let clean;
    let nsr;
    beforeAll(async ()=>{
        content = await readFile(file)
        const c = cleanNode(content)
        clean = c[0];
        nsr = c[1];
    })

    test('cleanNode', async () => {
        expectTypeOf(clean).toBeObject()
        expect(clean.nodeName).toEqual('BODY')
    })

    test('evalXPath', () => {
        const res = evalXPath('//h2',clean, nsr)
        const h2 = res.iterateNext()
        const text = h2.innerText
        expect(text).toEqual('Contents')
    })
})

describe('Element', ()=>{
    const fragments = []
    beforeAll(async ()=>{
        /*
        const res = evalXPath('//h2',clean, nsr)
        const h2 = res.iterateNext()
        */
        const screen = await render(
            <h2>
                <em>hello</em>
                world
            </h2>
        )
        const df = screen.asFragment()
        fragments.push(df.children[0])

        const screen2 = await render(<Depth1Children5 />)
        const df2 = screen2.asFragment()
        fragments.push(df2.children[0])

        const screen3 = await render(<Depth2Heading />)
        const df3 = screen3.asFragment()
        fragments.push(df3.children[0])

        const screen4 = await render(<SliceTest />)
        const df4 = screen4.asFragment()
        fragments.push(df4.children[0])

    })

    test('parse returns Element',async ()=>{
        const frag = fragments[0]
        const elem = Element.parse(frag)
        assert.instanceOf(elem, Element)
    })

    test('charLen correctly returns total for all nested children', () => {
        const frag = fragments[0]
        const elem = Element.parse(frag)
        assert.strictEqual(elem.charLen, 10)
    })

    test('charEnds returns [path, charEnd]', ()=>{
        const frag = fragments[0]
        const elem = Element.parse(frag)
        const ends = elem.charEnds
        assert.sameMembers(ends[0][0], [0,0])
        assert.strictEqual(ends[0][1], 5)
        assert.sameMembers(ends[1][0], [1])
        assert.strictEqual(ends[1][1], 10)
    })

    test('clone returns new element', ()=>{
        const frag = fragments[0]
        const elem = Element.parse(frag)
        const clone = elem.clone()
        assert.instanceOf(clone, Element)
        assert.isFalse(Object.is(clone, elem))
    })

    test('shallow slice returns new element with child slice', ()=>{
        const frag = fragments[1]
        const elem = Element.parse(frag)
        const elemSlice = elem.slice([1],[4])
        const lastChild = elemSlice.children.at(-1)
        assert.instanceOf(lastChild, Element)
        assert.deepEqual(lastChild.children[0].children, "more emphasized text")
    })

    test('leaves returns path to leaves', ()=>{
        const frag = fragments[2]
        const elem = Element.parse(frag)
        //console.log(frag)
        //console.log(elem.leaves())
        const leaves = elem.leaves()
        const res = [[0,0],[1],[2,0],[2,1,0], [2,2]]
        assert.deepStrictEqual(leaves, res)
        assert.isTrue(elem.child(0).child(0).isLeaf)
    })

    test('height returns length of longest leaf path', ()=>{
        const frag = fragments[2]
        const elem = Element.parse(frag)
        assert.strictEqual(elem.height, 3)
    })

    test('child accepts param:pathArray and returns nested children', ()=>{
        const frag = fragments[2]
        const elem = Element.parse(frag)
        const leaves = elem.leaves()
        assert.strictEqual(elem.child(leaves[3]).children,"bold emphasized")
    })

    test('innerText', ()=>{
        const frag = fragments[2]
        const elem = Element.parse(frag)
        console.log(elem.innerText)
    })

    test('getWithCharIdx',()=>{
        const frag = fragments[2]
        const elem = Element.parse(frag)
        const idx = elem.getWithCharIdx(11)
        assert.sameMembers(idx[0], [1])
        assert.strictEqual(idx[1], 6)
    })

    test('deep slice returns nested slice', ()=>{
        const frag = fragments[3]
        const elem = Element.parse(frag)
        const elemSlice = elem.slice([4,1,0,2])
        assert.strictEqual(elemSlice.innerText, 's5regs5b')
    })

    test('deep slice ends at correct location', ()=>{
        const frag = fragments[3]
        const elem = Element.parse(frag)
        const elemSlice = elem.slice([2], [3])
        assert.strictEqual(elemSlice.innerText, 'regs3 bolds3 ems3')
        assert.isTrue(elemSlice.children.length ===1)
        assert.isTrue(elemSlice.children[0].children.length ===3)
     })

    test.todo('walker correctly walks nested elements', () => {
        const frag = fragments[0]
        const elem = Element.parse(frag)
        const walker = elem.walker()
        console.log(walker.next())

    })

    test.todo('sliceChars', ()=>{
        const frag = fragments[2]
        const elem = Element.parse(frag)
        elem.sliceChars(11)
    })



});
