JT_BOX_SPAN = "jt_box_span";
JT_GLUE_SPAN = "jt_glue_span";
JT_PENALTY_SPAN_HYPHEN = "jt_pen_hyph";
HYPHENATE = true;

/** Convenience function to create a new span element.
 * 
 * @param {string} txtContent 
 * @param {string} className 
 * @param {string} idName 
 */
function newSpan(txtContent, className = null, idName = null) {
    let newSpan = document.createElement("span");
    if (className) {newSpan.className = className;}
    if (idName) {newSpan.id = idName;}
    newSpan.textContent = txtContent;
    return newSpan;
}

/**
 * Find all legal break opportunities. It uses the Hypher library for hyphenation, and the linebreaker
 * library which implements the Unicode line breaking algorithm.
 * 
 * The function will find all legal breakpoints for the entire document.
 */
function justifyText() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var currTxtNode;
    var prevTxtNode = null;
    var LineBreaker = window.liblinebreak;
    var h = new Hypher(hypher_en_us);
    
    /** Turn a string into a series of box, glue and penalty spans.
     * 
     * Returns an array of spans.
     * 
     * @param {string} text 
     */
    function spanifyText(text) {
        var trailSpaceRegexp = /^([^\s]+?)(\s)$/;
        var leadSpaceRegexp = /^(\s)([^\s]+?)$/;
        var leadTrailSpaceRegexp = /^(\s)([^\s]+?)(\s)$/;
        var trailSoftHyphRegexp = /^([^\s]+?)(\u00AD)$/;
        let txt;
        if (HYPHENATE) {txt = h.hyphenateText(text)}
        else {txt = text}
        let breaker = new LineBreaker(txt);
            
        let last = 0;
        let bk;
        //let spans = [];
        let fragment = document.createDocumentFragment();

        while (bk = breaker.nextBreak()) {
            // get the string between the last break and this one
            let word = txt.slice(last, bk.position);
            
            if (bk.required) {
                console.log('breakReq');
            }
            if (trailSpaceRegexp.test(word)) {
                let match = word.match(trailSpaceRegexp);
                let boxSpan = newSpan(match[1], JT_BOX_SPAN);
                //let glueSpan = newSpan(match[2], JT_GLUE_SPAN)
                let glueSpan = document.createTextNode(" ");
                fragment.appendChild(boxSpan);
                fragment.appendChild(glueSpan);
            } else if (leadSpaceRegexp.test(word)) {
                let match = word.match(leadSpaceRegexp);
                let boxSpan = newSpan(match[2], JT_BOX_SPAN);
                //let glueSpan = newSpan(match[1], JT_GLUE_SPAN)
                let glueSpan = document.createTextNode(" ");
                fragment.appendChild(glueSpan);
                fragment.appendChild(boxSpan);
            } else if (leadTrailSpaceRegexp.test(word)) {
                let match = word.match(leadTrailSpaceRegexp);
                //let leadGlueSpan = newSpan(match[1], JT_GLUE_SPAN);
                let leadGlueSpan = document.createTextNode(" ");
                let boxSpan = newSpan(match[2], JT_BOX_SPAN);
                //let trailGlueSpan = newSpan(match[3], JT_GLUE_SPAN);
                let trailGlueSpan = document.createTextNode(" ");
                fragment.appendChild(leadGlueSpan);
                fragment.appendChild(boxSpan);
                fragment.appendChild(trailGlueSpan);
            } else if (trailSoftHyphRegexp.test(word)) {
                let match = word.match(trailSoftHyphRegexp);
                let boxSpan = newSpan(match[1], JT_BOX_SPAN);
                let penSpan = newSpan(match[2], JT_PENALTY_SPAN_HYPHEN);
                fragment.appendChild(boxSpan);
                fragment.appendChild(penSpan);
            } else {
                let boxSpan = newSpan(word, JT_BOX_SPAN);
                fragment.appendChild(boxSpan);
            }
            
            last = bk.position;
        }
        return fragment;
    }

    while(currTxtNode = walker.nextNode()) {
        if (prevTxtNode) {
            let text = prevTxtNode.textContent;
            let fragment = spanifyText(text);
            let parent = prevTxtNode.parentElement;
            if (fragment) {
                parent.insertBefore(fragment, prevTxtNode);
                parent.removeChild(prevTxtNode);
            }
            prevTxtNode = null;
        }
        if (/^\s+$/.test(currTxtNode.textContent) != true) {
            if (currTxtNode.parentElement.tagName !== "SCRIPT" &&
                currTxtNode.parentElement.tagName !== "PRE") {
                prevTxtNode = currTxtNode;
            }
        }
    }
}