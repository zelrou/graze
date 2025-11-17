import { expect, test, beforeAll, expectTypeOf } from 'vitest'
import { render } from 'vitest-browser-react'
import { faker } from '@faker-js/faker'
import { server } from 'vitest/browser'
import {getnIdx, makeNodeEnds, Element, PGraph} from '../../src/nodes.ts'
import {
    _cleanNode as cleanNode,
    evalXPath,
    parseXPathRes,
    getParagraphsWithHeadings,
    phXPath
} from '../../src/xpathUtils.tsx'

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

