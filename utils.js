/**
 * Wrap all text nodes in the body with span tags
 */
function wrapSpanAllText() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var currTxtNode;
    var oldTxtNode = null;

    while(currTxtNode = walker.nextNode()) {
        if (oldTxtNode) {
            oldTxtNode.parentElement.removeChild(oldTxtNode);
            oldTxtNode = null;
        }
        if (/^\s+$/.test(currTxtNode.textContent) != true) {
            if (currTxtNode.parentElement.tagName !== "SCRIPT") {
                wrapSpan(currTxtNode, "jt-spantext", null, false);
                oldTxtNode = currTxtNode;
            }
        }
    }
}

/** Wrap span around a text node. 
 * 
 * @param {node} node - Required: the text node to wrap span around
 * @param {string} spanClass Optional: Provide a class name for the span
 * @param {string} spanID Optional: Provide an ID for the span
 * @param {bool} removeOrigNode Optional: Choose whether to remove the text node from the DOM
 */
function wrapSpan(node, spanClass=null, spanID=null, removeOrigNode=true) {
    var parent = node.parentNode;
    var newSpan = document.createElement('span');
    if (spanClass) {newSpan.className = spanClass}
    if (spanID) {newSpan.id = spanID}
    var txt = node.textContent;
    newSpan.textContent = txt;
    parent.insertBefore(newSpan, node);
    if (removeOrigNode) {parent.removeChild(node)}
}