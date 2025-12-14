import { beforeAll, describe, expect, it } from "vitest";
import { populateJSDOM } from './setup.ts'
import { getLeaves, surroundRange } from '../dom'
import { _sanitizeAndReaderize } from '../xpathUtils.tsx';
import { makeNodeEnds, getnIdx } from "../nodes.ts";
const jsdomDevtoolsFormatter = require('jsdom-devtools-formatter');
jsdomDevtoolsFormatter.install();

describe("dom", () => {
  let clean, cleanArticle;
  beforeAll(async () => {
    /* TODO move to setup and properly populateGlobal */
    const dom = await populateJSDOM()
    global.window = dom.window;
    global.document = dom.window.document
    global.NodeFilter = dom.window.NodeFilter
    cleanArticle = _sanitizeAndReaderize(document)
  }, 30000)

  it.skip("getLeaves contains all text", () => {
    const articleNode = cleanArticle.content
    const leaves = getLeaves(articleNode)
    const { textContent } = cleanArticle
    const leavesText = leaves.map(n => n.textContent).join('')
    expect(leavesText.length / textContent.length).toBeGreaterThan(0.55)
  },30000);

  it('surroundRange fully contextualizes range', ()=> {
    const articleNode = cleanArticle.content
    const leaves = getLeaves(articleNode)
    const charLength = 200;
    const leafLengths = leaves.map(n=>n.textContent.length)
    const leafEnds = makeNodeEnds(leafLengths)
    const [endIdx, endOffset] = getnIdx(200, leafEnds)
    const leafRange = new window.Range();
    leafRange.setStart(leaves[0], 0)
    leafRange.setEnd(leaves[endIdx], endOffset)
    const res = surroundRange(leafRange)
    expect(res.textContent.length).toStrictEqual(charLength)
    debugger
    // const leafClone = leafRange.cloneContents()
    // const container = document.createElement('div')
    // container.append(leafClone)
    // expect(container.textContent.length).toStrictEqual(charLength)
  })
});
