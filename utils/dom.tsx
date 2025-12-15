

export const getLeaves = (el: Node): Node[] => {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  let current;
  const leaves: Node[] = [];
  do {
    current = walker.nextNode()
    if (current !== null) leaves.push(current);

  } while (current !== null)
  return leaves;
}

export const surroundRange = (range: Range) => {
  const charLen = range.toString().length;
  if (charLen === 0) return document.createElement('div');
  let ancestor = range.commonAncestorContainer
  if (ancestor.nodeType === Node.TEXT_NODE) {
    ancestor = ancestor.parentElement
  }
  if (!ancestor) return range.cloneContents()

  let ancestorClone = ancestor.cloneNode(false)
  ancestorClone.appendChild(range.cloneContents())

  const root = ancestor.getRootNode({composed: false});
  while (ancestor !== root) {
    const parentAncestor = ancestor.parentElement
    const parentAncestorClone = parentAncestor?.cloneNode(false);
    if (!parentAncestor) break;
    parentAncestorClone.appendChild(ancestorClone);
    ancestorClone = parentAncestorClone;
    ancestor = parentAncestor
  }

  return ancestorClone
}

