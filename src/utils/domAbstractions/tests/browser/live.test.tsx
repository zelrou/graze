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

    describe('charEnds', ()=> {
        test('shallow returns [path, charEnd]', ()=>{
            const frag = fragments[0]
            const elem = Element.parse(frag)
            const ends = elem.charEnds
            assert.sameMembers(ends[0][0], [0,0])
            assert.strictEqual(ends[0][1], 5)
            assert.sameMembers(ends[1][0], [1])
            assert.strictEqual(ends[1][1], 10)
        })
    })

    test('clone returns new element', ()=>{
        const frag = fragments[0]
        const elem = Element.parse(frag)
        const clone = elem.clone()
        assert.instanceOf(clone, Element)
        assert.isFalse(Object.is(clone, elem))
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
        const text = elem.innerText
        assert.strictEqual(text.length, elem.charLen)
    })

    describe('getWithCharIdx', () => {
        test('retrievies correct path', ()=>{
            const frag = fragments[0]
            const elem = Element.parse(frag)
            const charIdx = elem.charLen - 1
            const idx = elem.getWithCharIdx(charIdx)
            const slice = elem.slice(idx.flat())
            const child = elem.child(idx.flat())
            assert.strictEqual(slice.innerText, 'd')
            assert.strictEqual(child, 'd')
        })
        test('shallow', () => {
            const frag = fragments[2]
            const elem = Element.parse(frag)
            const idx = elem.getWithCharIdx(11)
            assert.sameMembers(idx[0], [1])
            assert.strictEqual(idx[1], 6)
        })
        test('deep', ()=>{
            const frag = fragments[3]
            const elem = Element.parse(frag)
            const idx = elem.getWithCharIdx(11)
            assert.sameMembers(idx[0], [0,1,0])
            assert.strictEqual(idx[1], 5)
        })
        test('past end returns undefined',()=>{
            const frag = fragments[3]
            const elem = Element.parse(frag)
            const idx = elem.getWithCharIdx(elem.charLen)
            assert.isUndefined(idx)
        })
    })

    describe('slice', ()=>{
        test('deep slice returns nested slice', ()=>{
            const frag = fragments[3]
            const elem = Element.parse(frag)
            const elemSlice = elem.slice([4,1,0,2])
            assert.strictEqual(elemSlice.innerText, 's5regs5b')
            assert.strictEqual(elemSlice.height, 3)
        })

        test('deep slice ends at correct location', ()=>{
            const frag = fragments[3]
            const elem = Element.parse(frag)
            const elemSlice = elem.slice([2], [3])
            assert.strictEqual(elemSlice.innerText, 'regs3 bolds3 ems3')
            assert.isTrue(elemSlice.children.length ===1)
            assert.isTrue(elemSlice.children[0].children.length ===3)
         })

         test('from beginning and end, and across levels', ()=>{
             const frag = fragments[0]
             const elem = Element.parse(frag)
             const elemSlice = elem.slice([0,0,4],[1,3])
             assert.strictEqual('oworl', elemSlice.innerText)
         })
     })

    describe('walker', ()=>{
        test('returns correct step length', () => {
            const frag = fragments[0]
            const elem = Element.parse(frag)
            const walker = elem.walker(4)
            const expected = [4, 4, 2]
            const res = []
            expect(walker.next().value[0].innerText.length).toBe(4)
            expect(walker.next().value[0].innerText.length).toBe(4)
            expect(walker.next().value[0].innerText.length).toBe(2)
            /*
            for (let [slice, status] of walker) {
                res.push(slice.innerText.length)
            }
            assert.sameDeepOrderedMembers(expected, res)
            */
        })
    })



});
