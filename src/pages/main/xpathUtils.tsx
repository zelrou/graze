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

const phXPath = '//title|//meta[@name="AUTHOR"]|//p|//h1|//h2|//h3|//h4|//h5|//h6'
export function getParagraphsWithHeadings(node, expr=phXPath) {
    const xpe = new XPathEvaluator();
    const nsResolver =
        node.ownerDocument === null
          ? node.documentElement
          : node.ownerDocument.documentElement;
    const result = xpe.evaluate(expr, node, nsResolver,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    //console.log(result);
    const found = {author: null, title: null, parts:[]};
    let res;
    while ((res = result.iterateNext())) {
        //console.log(res)
        if (res.tagName === "TITLE") { found.title = res.innerText }
        else if (res.tagName === "META") { found.author = res.content }
        else if (res.tagName.at(0) === "H") {
            found.parts.push({heading: res.innerText, paragraphs:[res.innerText]})
        } else if (res.tagName === "P") {
            //console.log('entered P', res, found)
            if (found.parts.length && found.parts.at(-1).hasOwnProperty('paragraphs')) {
                found.parts.at(-1)['paragraphs'].push(res.innerText)
            } else {
                found.parts.push({
                    'heading': found.title,
                    'paragraphs': [res.innerText]
                })
            }
        }
    }
    return found;
}
