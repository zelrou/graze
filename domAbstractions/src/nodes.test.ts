import { assert, expect, test } from 'vitest'
import { faker } from '@faker-js/faker'
import {getnIdx, makeNodeEnds, Element, PGraph} from './nodes.js'

const {log} = console;
faker.seed(1763337753)
log('===========================================================')

const fakeParagraphs = faker.lorem.paragraphs(5)
const fakeParagraphArr = fakeParagraphs.split('\n')
const elems = fakeParagraphArr
    .map(p=>new Element(p, '#text', {}))

const paras = new PGraph(elems)

test('makeNodeEnds', () => {
    const test1 = [1,1,1,1,1]
    const res1 = makeNodeEnds(test1)
    assert.sameMembers(res1, [1,2,3,4,5])
})


test('getnIdx', () => {
    const charLenArr = fakeParagraphArr.map(s=>s.length)
    const nodeEnds = makeNodeEnds(charLenArr)
    const res = getnIdx(200, nodeEnds)
    assert.sameMembers(res,[1,31])
})


test('PGraph charLen', () => {
    expect(paras.charLen).toBe(729)
})
test('PGraph charEnds'), ()=>{
    assert.sameMembers(paras.charEnds, [169, 330, 491, 582, 729])
}

test('PGraph getWithCharIdx', ()=>{
    const idx = paras.getWithCharIdx(400)
    assert.sameMembers(idx, [2,70])
})
test('PGraph sliceChars',()=>{
    const slice = paras.sliceChars(0,50)
    expect(slice.children).toHaveLength(1)
    expect(slice.children[0]).toBeInstanceOf(Element)
    expect(slice.children[0].children).toBeTypeOf('string')
    expect(slice.children[0].children).toHaveLength(50)
})
//log(paras.sliceChars(20,200))



/*
log(nodeEnds)
*/

test('Element walker on leaves', ()=>{
    const para0Walker = paras.children[0].walker(20)
    const res = [...para0Walker]
//    log(res)
    expect(res.length).toBe(9)
})

test('Element isLeaf', ()=>{
    expect(elems[0].isLeaf).toBe(true)
})

let boldElem;
test('Element not isLeaf', ()=>{
    boldElem = new Element(elems[0], 'b', {class:'font-heavy'})
    expect(boldElem.isLeaf).toBe(false)
})
