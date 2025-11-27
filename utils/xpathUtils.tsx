
import type { Config } from "dompurify";
import createDOMPurify from "dompurify";
import { Readability } from "@mozilla/readability";
import { isProbablyReaderable } from "@mozilla/readability";
import {Element, PGraph, Part} from './nodes'

const purifyOpts:Config = {
    RETURN_DOM: true
}
// Evaluate an XPath expression `expr` against a given DOM node
// or Document object `node`, returning the results as an array
// thanks wanderingstan at morethanwarm dot mail dot com for the
// initial work.
export function evaluateXPath(node, expr) {
  const xpe = new XPathEvaluator();
  const nsResolver =
    node.ownerDocument === null
      ? node.documentElement
      : node.ownerDocument.documentElement;
  const result = xpe.evaluate(expr, node, nsResolver, 0, null);
  const found = [];
  let res;
  while ((res = result.iterateNext())) found.push(res);
  return found;
}


// Example usage:
// const els = docEvaluateArray('//a');
// console.log(els[0].nodeName); // gives 'A' in HTML document with at least one link
export function docEvaluateArray(
  expr,
  context,
  doc = context ? context.ownerDocument : document,
  resolver = null,
) {
  let i;
  const a = [];
  context ||= doc;

  const result = doc.evaluate(
    expr,
    context,
    resolver,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null,
  );
  for (let i = 0; i < result.snapshotLength; i++) {
    a.push(result.snapshotItem(i));
  }
  return a;
}

export function getXPathForElement(el, xml) {
  let xpath = "";
  let pos, tempItem2;

  while (el !== xml.documentElement) {
    pos = 0;
    tempItem2 = el;
    while (tempItem2) {
      if (tempItem2.nodeType === 1 && tempItem2.nodeName === el.nodeName) {
        // If it is ELEMENT_NODE of the same name
        pos += 1;
      }
      tempItem2 = tempItem2.previousSibling;
    }

    xpath = `*[name()='${el.nodeName}' and namespace-uri()='${
      el.namespaceURI ?? ""
    }'][${pos}]/${xpath}`;

    el = el.parentNode;
  }
  xpath = `/*[name()='${xml.documentElement.nodeName}' and namespace-uri()='${
    el.namespaceURI ?? ""
  }']/${xpath}`;
  xpath = xpath.replace(/\/$/, "");
  return xpath;
}

interface parsedNode {
    type:string,
    props?:object|null,
    children:string|Array<string|parsedNode>
}

class ParsedNode {
    type;
    props;
    children;
    charLength;
    constructor(
        type:string,
        props?:object|null=null,
        children:string|Array<string|parsedNode>,
        charLength:number|null=null
    ){
        this.type = type;
        this.props = props ?? null;
        this.children = children;
        this.charLength = charLength ?? null;
        return this;
    }
}

class ParsedContent {
    charLength:number;
    nodes:parsedNode[];
    constructor( charLength:number, nodes?:ParsedNode[] ){
        this.charLength = charLength;
        this.nodes = nodes ?? new Array()
        return this
    }
}

const textContentElements = [
    "BLOCKQUOTE",
    "DL",
    "FIGURE",
    "OL",
    "UL"
]

const inlineStyleElements = [
    "ABBR",
    "B",
    "BDI",
    "BDO",
    "CITE",
    "CODE",
    "DATA",
    "DFN",
    "EM",
    "I",
    "KBD",
    "MARK",
    "Q",
    "RP",
    "RT",
    "RUBY",
    "S",
    "SAMP",
    "SMALL",
    "SPAN",
    "STRONG",
    "SUP",
    "TIME",
    "U",
    "VAR",
    "WBR"
]

export const parseXPathRes = (res, found) => {
    const { nodeName } = res;
    switch( nodeName ) {
        case "TITLE": {
            found.title = res.innerText
            break;
        }

        case "META": {
            found.author = res.content
            break;
        }

        case "H1":
        case "H2":
        case "H3":
        case "H4":
        case "H5":
        case "H6": {
            const content = {
                heading: res.innerText,
                paragraphs: [res.innerText]
            }
            found.parts.push(content)
            const elem = new Element(res.innerText, nodeName)
            const pgraph = new PGraph([elem])
            const part = new Part([pgraph], res.innerText)
            console.log(part)
            found.newParts.push(part)
            break;
        }

        case "P":
        case "PRE": {
            // IN CASE NO PARTS YET
            if (!found.parts.length)
                found.parts.push(new Array())
            if (!found.newParts.length)
                found.newParts.push(new Part())

            const latestPart = found.parts.at(-1)
            const latestNewPart = found.newParts.at(-1)
            const {
                innerText,
                childNodes,
                childElementCount
            } = res;

            const normalizedText = innerText.normalize()
            if (!normalizedText.length)
                break;

            if ( !latestPart.paragraphs )
                latestPart.paragraphs = new Array();

            const charLength = normalizedText.length
            if (!charLength)
                break;

            const content= new ParsedContent(charLength)

            if ( childElementCount === 0 ) {
                const textNode = new ParsedNode(
                    '#text',
                    null,
                    normalizedText,
                    normalizedText.length
                )
                content.nodes.push(textNode)
                latestPart.paragraphs.push(content)
                break;
            }

            for(let child of childNodes) {
                const { nodeName } = child;
                let parsedChildNode;
                if (nodeName==='#text') {
                    parsedChildNode = new ParsedNode(
                        '#text',
                        null,
                        child.data,
                        child.data.length
                    )
                    content.nodes.push(parsedChildNode)
                    continue;
                } else if (nodeName=== 'A') {
                    const anchorProps = {
                        href: child.href,
                        title: child.title
                    }
                    parsedChildNode = new ParsedNode(
                        'a',
                        anchorProps,
                        child.innerText,
                        child.innerText.length
                    )
                    content.nodes.push(parsedChildNode)
                    continue;
                } else if (inlineStyleElements.includes(nodeName)) {
                    const parsedInlineNode = new ParsedNode(
                        nodeName,
                        {},
                        child.innerText,
                        child.innerText.length
                    )
                    content.nodes.push(parsedInlineNode)
                }
            }

            latestPart.paragraphs.push(content)
            break;

        }

        default: {
            found.parts.push({
                'heading': found.title,
                'paragraphs': [res.innerText]
            })
        }
    }
}

export const _cleanNode = (str) => {
    const clean = createDOMPurify.sanitize(str, purifyOpts)
    const nsResolver =
        clean.ownerDocument === null
          ? clean.documentElement
          : clean.ownerDocument.documentElement;
    return [clean, nsResolver]
}
export const cleanNode = (node) => {
    const DOMPurify = createDOMPurify(node);
    const clean = DOMPurify.sanitize(node.document.documentElement, purifyOpts)
    const nsResolver =
        clean.ownerDocument === null
          ? clean.documentElement
          : clean.ownerDocument.documentElement;
    return [clean, nsResolver]
}

export const phXPath = [`//title`,`//meta[@name="AUTHOR"]`,`//p`,`//h1`,`//h2`,`//h3`,
`//h4`,`//h5`,`//h6`, `//pre`, `//blockquote`, `//code`].join(`|`)

export const evalXPath = (expr=phXPath, clean, nsResolver) => {
    const xpe = new XPathEvaluator();
    const result = xpe.evaluate(expr, clean, nsResolver,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    return result;
}

export function getParagraphsWithHeadings(node, expr=phXPath) {
    const [clean, nsResolver] = cleanNode(node);
    if (isProbablyReaderable(document)){
        const documentClone = document.cloneNode(clean);
        const article = new Readability(documentClone, {serializer:(el)=>el}).parse();
        console.log(article.content)
    }
    const result = evalXPath(phXPath, clean, nsResolver)
    const found = {author: null, title: null, parts:[], newParts:[]};
    let res;
    while ((res = result.iterateNext())) {
        //console.log(res, found)
        parseXPathRes(res, found)
    }
    return found;
}
