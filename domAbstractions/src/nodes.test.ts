import { expect, test } from 'vitest'
import { faker } from '@faker-js/faker'
import {getnIdx, makeNodeEnds, Element, PGraph} from './nodes.js'

const {log} = console;
faker.seed(1763337753)
log('===========================================================')


const elems = faker.lorem.paragraphs(5)
    .split('\n')
    .map(p=>new Element(p, '#text', {}))

const paras = new PGraph(elems)

log(elems[0])

//log(paras)
//log(paras.charLen)
//log(paras.charEnds)

//log(paras.getWithCharIdx(400))
//log(paras.sliceChars(0,50))
//log(paras.sliceChars(20,200))



/*
log(nodeEnds)
const check = Array.from([0,1,2,3,4,5,6], x => {
    return [
        200*x,
        getnIdx(200*x)
    ]
});

log(check)
*/
test('string walker', ()=>{
    const para0Walker = paras.children[0].walker(20)
    const res = [...para0Walker]
    log(res)
    expect(res.length).toBe(9)
})

