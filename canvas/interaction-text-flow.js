// =========================================================================
// OpenPublisher Text Flow & Linked Text Box Engine (v5.21.0)
// Supports continuous story reflow across resize, typing, paste, margins,
// undo/redo, deletion, and rich HTML formatting preservation.
// =========================================================================

(function() {
    if (typeof window === 'undefined') return;

    const PLACEHOLDER_TEXT = 'Click to edit text';
    const FLOW_CONT_ATTR = 'data-flow-cont';
    const FLOW_SENTINEL_ATTR = 'data-flow-sentinel';

    window._isFlowingText = false;
    window._flowTimers = window._flowTimers || new Map();

    function generateFlowBoxId() {
        return 'pub-txt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
    }

    function ensureBoxId(box) {
        if (!box) return '';
        if (!box.id) {
            box.id = generateFlowBoxId();
        }
        return box.id;
    }

    function getEditableTextContent(box) {
        if (!box) return null;
        if (box.querySelector('table') || box.querySelector('.wa-text') || box.getAttribute('data-type') === 'chart' || box.getAttribute('data-type') === 'progress-bar') {
            return null;
        }
        return box.querySelector('.text-content') ||
               box.querySelector('[contenteditable="true"]:not(.wa-text)') ||
               box.querySelector('[contenteditable]:not(.wa-text):not([contenteditable="false"])');
    }
    window.getEditableTextContent = getEditableTextContent;

    function isValidFlowTextBox(box) {
        if (!box || !box.classList || !box.classList.contains('pub-element')) return false;
        if (box.classList.contains('master-page-element')) return false;
        return !!getEditableTextContent(box);
    }
    window.isValidFlowTextBox = isValidFlowTextBox;

    function getPlainTextNormalized(el) {
        if (!el) return '';
        return (el.innerText || el.textContent || '').replace(/[\u200B\u00A0]/g, ' ').trim();
    }

    function isEditableEmptyOrPlaceholder(contentEl) {
        if (!contentEl) return true;
        if (contentEl.querySelector('img, svg, table, canvas')) return false;
        const txt = getPlainTextNormalized(contentEl);
        return txt === '' || txt === PLACEHOLDER_TEXT;
    }

    function getTextFlowHead(box) {
        if (!box) return null;
        const visited = new Set([box]);
        let curr = box;
        while (true) {
            const prevId = curr.getAttribute('data-prev-box');
            if (!prevId) break;
            const prev = document.getElementById(prevId);
            if (!prev || visited.has(prev) || !isValidFlowTextBox(prev)) {
                curr.removeAttribute('data-prev-box');
                break;
            }
            if (curr.id && prev.getAttribute('data-next-box') !== curr.id) {
                curr.removeAttribute('data-prev-box');
                break;
            }
            visited.add(prev);
            curr = prev;
        }
        return curr;
    }
    window.getTextFlowHead = getTextFlowHead;

    function getTextFlowChain(headBox) {
        if (!headBox) return [];
        const chain = [];
        const visited = new Set();
        let curr = headBox;
        while (curr && !visited.has(curr)) {
            visited.add(curr);
            const content = getEditableTextContent(curr);
            if (!content) {
                curr.removeAttribute('data-next-box');
                break;
            }
            chain.push({ box: curr, content: content });
            const nextId = curr.getAttribute('data-next-box');
            if (!nextId) break;
            const next = document.getElementById(nextId);
            if (!next || visited.has(next) || !isValidFlowTextBox(next)) {
                curr.removeAttribute('data-next-box');
                break;
            }
            ensureBoxId(curr);
            if (next.getAttribute('data-prev-box') !== curr.id) {
                next.setAttribute('data-prev-box', curr.id);
            }
            curr = next;
        }
        return chain;
    }
    window.getTextFlowChain = getTextFlowChain;

    // --- Story Caret Unit Counter (Characters + Non-Continuation Block/BR Boundaries) ---
    function isBlockTag(node) {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
        const tag = node.tagName;
        return tag === 'DIV' || tag === 'P' || tag === 'H1' || tag === 'H2' || tag === 'H3' ||
               tag === 'H4' || tag === 'H5' || tag === 'H6' || tag === 'LI' || tag === 'BLOCKQUOTE' || tag === 'PRE';
    }

    function countStoryUnitsInRoot(root, stopContainer, stopOffset) {
        let units = 0;
        let stopped = false;

        function walk(node, isTopBoxContent) {
            if (stopped) return;

            if (node === stopContainer) {
                if (node.nodeType === Node.TEXT_NODE) {
                    units += Math.min(stopOffset || 0, node.nodeValue.length);
                    stopped = true;
                    return;
                }
                const children = node.childNodes;
                const limit = Math.min(stopOffset || 0, children.length);
                for (let i = 0; i < limit; i++) {
                    walk(children[i], false);
                    if (stopped) return;
                }
                stopped = true;
                return;
            }

            if (node.nodeType === Node.TEXT_NODE) {
                units += node.nodeValue.length;
                return;
            }

            if (node.nodeType !== Node.ELEMENT_NODE) return;
            if (node.hasAttribute(FLOW_SENTINEL_ATTR)) return;

            if (node.tagName === 'BR') {
                units += 1;
                return;
            }

            // Count non-continuation block element transitions (other than the first sibling when box is flat)
            if (!isTopBoxContent && isBlockTag(node) && node.getAttribute(FLOW_CONT_ATTR) !== 'true') {
                const prev = node.previousSibling;
                if (prev !== null) {
                    units += 1;
                }
            }

            const children = node.childNodes;
            for (let i = 0; i < children.length; i++) {
                walk(children[i], false);
                if (stopped) return;
            }
        }

        walk(root, true);
        return units;
    }

    function resolveStoryUnitInRoot(root, targetUnits) {
        let units = 0;
        let lastValidPos = null;

        function recordPos(node, offset) {
            lastValidPos = { node: node, offset: offset };
        }

        function walk(node, isTopBoxContent) {
            if (node.nodeType === Node.TEXT_NODE) {
                const len = node.nodeValue.length;
                if (units + len >= targetUnits) {
                    return { node: node, offset: Math.max(0, Math.min(len, targetUnits - units)) };
                }
                units += len;
                recordPos(node, len);
                return null;
            }

            if (node.nodeType !== Node.ELEMENT_NODE) return null;
            if (node.hasAttribute(FLOW_SENTINEL_ATTR)) return null;

            if (node.tagName === 'BR') {
                if (units + 1 >= targetUnits) {
                    const parent = node.parentNode;
                    const idx = Array.prototype.indexOf.call(parent.childNodes, node);
                    return { node: parent, offset: idx + 1 };
                }
                units += 1;
                const parent = node.parentNode;
                const idx = Array.prototype.indexOf.call(parent.childNodes, node);
                recordPos(parent, idx + 1);
                return null;
            }

            if (!isTopBoxContent && isBlockTag(node) && node.getAttribute(FLOW_CONT_ATTR) !== 'true') {
                const prev = node.previousSibling;
                if (prev !== null) {
                    if (units + 1 >= targetUnits) {
                        // Target sits right at start of this block
                        if (node.firstChild && node.firstChild.nodeType === Node.TEXT_NODE) {
                            return { node: node.firstChild, offset: 0 };
                        }
                        return { node: node, offset: 0 };
                    }
                    units += 1;
                }
            }

            if (node.childNodes.length === 0 && units >= targetUnits) {
                return { node: node, offset: 0 };
            }

            for (let i = 0; i < node.childNodes.length; i++) {
                const found = walk(node.childNodes[i], false);
                if (found) return found;
            }
            return null;
        }

        const res = walk(root, true);
        if (res) return { found: true, pos: res, consumed: units };
        return { found: false, pos: lastValidPos || { node: root, offset: root.childNodes.length }, consumed: units };
    }

    // --- Story Gathering & Continuation Merging ---
    function removeFlowArtifacts(node) {
        if (!node) return;
        if (node.querySelectorAll) {
            node.querySelectorAll(`[${FLOW_SENTINEL_ATTR}]`).forEach(el => el.remove());
        }
    }

    function mergeContinuationNodes(storyDiv, nextFragment) {
        const nodes = Array.from(nextFragment.childNodes);
        while (nodes.length > 0) {
            const first = nodes[0];
            if (first.nodeType === Node.ELEMENT_NODE && first.getAttribute(FLOW_CONT_ATTR) === 'true') {
                // Find the last element child of storyDiv to merge into
                let target = storyDiv.lastChild;
                // Ignore trailing zero-length text nodes if any
                while (target && target.nodeType === Node.TEXT_NODE && target.nodeValue === '') {
                    const toRemove = target;
                    target = target.previousSibling;
                    toRemove.remove();
                }
                if (target && target.nodeType === Node.ELEMENT_NODE && target.tagName === first.tagName) {
                    first.removeAttribute(FLOW_CONT_ATTR);
                    const innerFrag = document.createDocumentFragment();
                    while (first.firstChild) innerFrag.appendChild(first.firstChild);
                    mergeContinuationNodes(target, innerFrag);
                    nodes.shift();
                    continue;
                }
                // Strip attribute even if no matching previous sibling exists
                first.removeAttribute(FLOW_CONT_ATTR);
            }
            break;
        }
        nodes.forEach(n => {
            if (n.nodeType === Node.ELEMENT_NODE) {
                n.removeAttribute(FLOW_CONT_ATTR);
                if (n.querySelectorAll) {
                    n.querySelectorAll(`[${FLOW_CONT_ATTR}]`).forEach(c => c.removeAttribute(FLOW_CONT_ATTR));
                }
            }
            storyDiv.appendChild(n);
        });
    }

    function gatherStory(chain) {
        const storyDiv = document.createElement('div');
        for (let i = 0; i < chain.length; i++) {
            const contentEl = chain[i].content;
            // Clear untouched placeholder text on non-head boxes
            if (i > 0 && isEditableEmptyOrPlaceholder(contentEl)) {
                const txt = getPlainTextNormalized(contentEl);
                if (txt === PLACEHOLDER_TEXT) continue;
            }
            const frag = document.createDocumentFragment();
            Array.from(contentEl.childNodes).forEach(child => {
                frag.appendChild(child.cloneNode(true));
            });
            removeFlowArtifacts(frag);
            if (storyDiv.childNodes.length === 0) {
                storyDiv.appendChild(frag);
            } else {
                mergeContinuationNodes(storyDiv, frag);
            }
        }
        storyDiv.normalize();
        return storyDiv;
    }

    // --- Accurate Off-Screen Measurement Setup ---
    function getUsableDimensions(box, content) {
        const elContent = box.querySelector('.element-content') || box;
        const ecComp = window.getComputedStyle(elContent);
        const cComp = window.getComputedStyle(content);

        const boxW = parseFloat(box.style.width) || box.clientWidth || 200;
        const boxH = parseFloat(box.style.height) || box.clientHeight || 100;

        const ecBorderX = (parseFloat(ecComp.borderLeftWidth) || 0) + (parseFloat(ecComp.borderRightWidth) || 0);
        const ecBorderY = (parseFloat(ecComp.borderTopWidth) || 0) + (parseFloat(ecComp.borderBottomWidth) || 0);
        const ecPadX = (elContent !== content) ? ((parseFloat(ecComp.paddingLeft) || 0) + (parseFloat(ecComp.paddingRight) || 0)) : 0;
        const ecPadY = (elContent !== content) ? ((parseFloat(ecComp.paddingTop) || 0) + (parseFloat(ecComp.paddingBottom) || 0)) : 0;

        const cPadX = (parseFloat(cComp.paddingLeft) || 0) + (parseFloat(cComp.paddingRight) || 0);
        const cPadY = (parseFloat(cComp.paddingTop) || 0) + (parseFloat(cComp.paddingBottom) || 0);
        const cBorderX = (parseFloat(cComp.borderLeftWidth) || 0) + (parseFloat(cComp.borderRightWidth) || 0);
        const cBorderY = (parseFloat(cComp.borderTopWidth) || 0) + (parseFloat(cComp.borderBottomWidth) || 0);

        const usableW = Math.max(8, boxW - ecBorderX - ecPadX - cPadX - cBorderX);
        const usableH = Math.max(2, boxH - ecBorderY - ecPadY - cPadY - cBorderY);

        return { usableW, usableH, elContent, ecComp, cComp, boxW, boxH };
    }

    const TYPO_PROPS = [
        'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant',
        'lineHeight', 'letterSpacing', 'wordSpacing', 'textAlign', 'textTransform',
        'textIndent', 'wordWrap', 'overflowWrap', 'wordBreak', 'whiteSpace',
        'hyphens', 'direction', 'columnCount', 'columnGap', 'columnFill', 'color'
    ];

    function createMeasureProbe(boxObj) {
        const dims = getUsableDimensions(boxObj.box, boxObj.content);

        const outerEl = document.createElement('div');
        outerEl.className = 'pub-element';
        outerEl.style.cssText = `position:fixed; left:-99999px; top:-99999px; visibility:hidden; pointer-events:none; margin:0; padding:0; transform:none; width:${dims.boxW}px; height:${dims.boxH}px;`;

        const outerContent = document.createElement('div');
        outerContent.className = 'element-content';
        outerContent.style.cssText = 'position:relative; width:100%; height:100%; margin:0; padding:0; overflow:hidden;';

        const clone = document.createElement('div');
        if (boxObj.content.className) clone.className = boxObj.content.className;

        TYPO_PROPS.forEach(prop => {
            const val = dims.cComp[prop];
            if (val !== undefined && val !== '') {
                clone.style[prop] = val;
            }
        });

        // Support columns placed on .element-content by ContextRibbonActions.setColumns
        if ((!clone.style.columnCount || clone.style.columnCount === 'auto') && dims.ecComp.columnCount && dims.ecComp.columnCount !== 'auto') {
            clone.style.columnCount = dims.ecComp.columnCount;
            clone.style.columnGap = dims.ecComp.columnGap;
        }

        // Fixed inner measurement viewport with 0 padding avoids Chrome vs Gecko scrollHeight+paddingBottom quirks
        clone.style.display = 'block';
        clone.style.boxSizing = 'content-box';
        clone.style.width = dims.usableW + 'px';
        clone.style.height = dims.usableH + 'px';
        clone.style.padding = '0px';
        clone.style.border = 'none';
        clone.style.margin = '0px';
        clone.style.overflow = 'hidden';

        outerContent.appendChild(clone);
        outerEl.appendChild(outerContent);

        return { outerEl, clone, dims };
    }

    function doesCloneFit(clone) {
        return (clone.scrollHeight <= clone.clientHeight + 0.5) &&
               (clone.scrollWidth <= clone.clientWidth + 0.5);
    }

    // --- Collect Break Candidates Across Rich DOM ---
    function collectBreakCandidates(root) {
        const candidates = [];
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false);
        let node;
        while ((node = walker.nextNode())) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.nodeValue;
                if (!text || text.length === 0) continue;
                const regex = /\S+\s*|\s+/g;
                let match;
                while ((match = regex.exec(text)) !== null) {
                    const tokenEnd = match.index + match[0].length;
                    const trimmedWordEnd = match.index + match[0].replace(/\s+$/, '').length;
                    if (trimmedWordEnd > match.index && trimmedWordEnd < tokenEnd) {
                        candidates.push({ node: node, offset: trimmedWordEnd, charCount: trimmedWordEnd });
                    }
                    candidates.push({ node: node, offset: tokenEnd, charCount: tokenEnd });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'BR' || node.tagName === 'IMG' || node.tagName === 'HR' ||
                    (isBlockTag(node) && node.textContent === '' && !node.querySelector('img, svg'))) {
                    const parent = node.parentNode;
                    if (parent) {
                        const idx = Array.prototype.indexOf.call(parent.childNodes, node);
                        candidates.push({ node: parent, offset: idx + 1 });
                    }
                }
            }
        }
        return candidates;
    }

    function isNodeVisuallyEmpty(node) {
        if (!node) return true;
        if (node.nodeType === Node.TEXT_NODE) return node.nodeValue.length === 0;
        if (node.nodeType !== Node.ELEMENT_NODE) return true;
        if (node.tagName === 'BR' || node.tagName === 'IMG' || node.tagName === 'SVG' || node.tagName === 'HR') return false;
        if (node.querySelector && node.querySelector('img, svg, hr, br')) return false;
        return node.textContent.length === 0;
    }

    function markTailContinuationAncestors(cloneRoot, splitNode, tailFrag) {
        // Compute ancestor path from cloneRoot down to splitNode
        const tagChain = [];
        let curr = splitNode.nodeType === Node.TEXT_NODE ? splitNode.parentNode : splitNode;
        while (curr && curr !== cloneRoot) {
            tagChain.unshift(curr.tagName);
            curr = curr.parentNode;
        }
        // Apply data-flow-cont="true" down the leading edge of tailFrag matching the split ancestors
        let tailPtr = tailFrag.firstChild;
        for (let i = 0; i < tagChain.length; i++) {
            while (tailPtr && tailPtr.nodeType === Node.TEXT_NODE && tailPtr.nodeValue === '') {
                const rm = tailPtr;
                tailPtr = tailPtr.nextSibling;
                rm.remove();
            }
            if (tailPtr && tailPtr.nodeType === Node.ELEMENT_NODE && tailPtr.tagName === tagChain[i]) {
                tailPtr.setAttribute(FLOW_CONT_ATTR, 'true');
                tailPtr = tailPtr.firstChild;
            } else {
                break;
            }
        }

        // Remove empty leading continuation shells created if split fell right at end of a block
        let guard = 0;
        while (tailFrag.firstChild && guard++ < 10) {
            const fc = tailFrag.firstChild;
            if (fc.nodeType === Node.ELEMENT_NODE && fc.getAttribute(FLOW_CONT_ATTR) === 'true' && isNodeVisuallyEmpty(fc)) {
                fc.remove();
            } else {
                break;
            }
        }
    }

    function splitFragmentForBox(storyFrag, boxObj, measureHost) {
        const probe = createMeasureProbe(boxObj);
        const testProbe = createMeasureProbe(boxObj);
        measureHost.appendChild(probe.outerEl);
        measureHost.appendChild(testProbe.outerEl);

        const clone = probe.clone;
        const testClone = testProbe.clone;

        // Place full remaining story into probe
        Array.from(storyFrag.childNodes).forEach(n => clone.appendChild(n.cloneNode(true)));

        if (doesCloneFit(clone)) {
            probe.outerEl.remove();
            testProbe.outerEl.remove();
            return {
                headFrag: storyFrag,
                tailFrag: document.createDocumentFragment(),
                overflowed: false
            };
        }

        const candidates = collectBreakCandidates(clone);
        let splitPoint = null;

        if (candidates.length > 0) {
            let low = 0;
            let high = candidates.length - 1;
            let bestIdx = -1;

            while (low <= high) {
                const mid = (low + high) >> 1;
                const cand = candidates[mid];
                const r = document.createRange();
                r.setStart(clone, 0);
                r.setEnd(cand.node, cand.offset);
                testClone.innerHTML = '';
                testClone.appendChild(r.cloneContents());

                if (doesCloneFit(testClone)) {
                    bestIdx = mid;
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            }

            if (bestIdx >= 0) {
                splitPoint = candidates[bestIdx];
            } else if (candidates[0].node.nodeType === Node.TEXT_NODE && candidates[0].offset > 1) {
                // First token was a single long word/URL that wrapped/overflowed: binary search character offsets within it
                const firstNode = candidates[0].node;
                let cLow = 1;
                let cHigh = candidates[0].offset;
                let bestChar = 0;
                while (cLow <= cHigh) {
                    const cMid = (cLow + cHigh) >> 1;
                    const r = document.createRange();
                    r.setStart(clone, 0);
                    r.setEnd(firstNode, cMid);
                    testClone.innerHTML = '';
                    testClone.appendChild(r.cloneContents());
                    if (doesCloneFit(testClone)) {
                        bestChar = cMid;
                        cLow = cMid + 1;
                    } else {
                        cHigh = cMid - 1;
                    }
                }
                if (bestChar > 0) {
                    splitPoint = { node: firstNode, offset: bestChar };
                }
            }
        }

        if (!splitPoint) {
            // Even 1 line/char does not fit in this frame (e.g., shrunk tiny): spill ALL content to next box!
            probe.outerEl.remove();
            testProbe.outerEl.remove();
            return {
                headFrag: document.createDocumentFragment(),
                tailFrag: storyFrag,
                overflowed: true
            };
        }

        const headRange = document.createRange();
        headRange.setStart(clone, 0);
        headRange.setEnd(splitPoint.node, splitPoint.offset);
        const headFrag = headRange.cloneContents();

        const tailRange = document.createRange();
        tailRange.setStart(splitPoint.node, splitPoint.offset);
        tailRange.setEnd(clone, clone.childNodes.length);
        const tailFrag = tailRange.cloneContents();

        markTailContinuationAncestors(clone, splitPoint.node, tailFrag);

        // Clean empty trailing block artifact on headFrag if range ended at empty wrapper edge
        while (headFrag.lastChild && headFrag.lastChild.nodeType === Node.ELEMENT_NODE && isNodeVisuallyEmpty(headFrag.lastChild)) {
            const origTag = headFrag.lastChild;
            if (origTag.tagName !== 'BR' && !origTag.querySelector('br')) {
                origTag.remove();
            } else {
                break;
            }
        }

        probe.outerEl.remove();
        testProbe.outerEl.remove();

        return {
            headFrag: headFrag,
            tailFrag: tailFrag,
            overflowed: true
        };
    }

    function applyLinkedBoxStyles(boxObj) {
        const content = boxObj.content;
        if (content.style.boxSizing !== 'border-box') content.style.boxSizing = 'border-box';
        if (content.style.height !== '100%') content.style.height = '100%';
        if (content.style.overflow !== 'hidden') content.style.overflow = 'hidden';
    }

    // --- Main Story Reflow Engine ---
    window.flowTextBoxes = function(headBox) {
        if (!headBox || window._isFlowingText) return;
        const resolvedHead = getTextFlowHead(headBox);
        if (!resolvedHead) return;

        const chain = getTextFlowChain(resolvedHead);
        if (chain.length < 2) {
            if (chain.length === 1) {
                chain[0].box.removeAttribute('data-text-overflow');
            }
            return;
        }

        window._isFlowingText = true;
        try {
            // 1. Capture global selection offsets if user is currently focused/selecting inside this chain
            let globalStartUnits = -1;
            let globalEndUnits = -1;
            let hadChainFocus = false;
            const activeEl = document.activeElement;
            for (let i = 0; i < chain.length; i++) {
                if (activeEl && (chain[i].content === activeEl || chain[i].content.contains(activeEl))) {
                    hadChainFocus = true;
                    break;
                }
            }
            const sel = window.getSelection ? window.getSelection() : null;
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                let accStart = 0;
                for (let i = 0; i < chain.length; i++) {
                    const contentEl = chain[i].content;
                    if (contentEl.contains(range.startContainer)) {
                        globalStartUnits = accStart + countStoryUnitsInRoot(contentEl, range.startContainer, range.startOffset);
                        break;
                    }
                    if (i === 0 || !isEditableEmptyOrPlaceholder(contentEl) || getPlainTextNormalized(contentEl) !== PLACEHOLDER_TEXT) {
                        accStart += countStoryUnitsInRoot(contentEl, null, 0);
                    }
                }
                if (range.collapsed) {
                    globalEndUnits = globalStartUnits;
                } else {
                    let accEnd = 0;
                    for (let i = 0; i < chain.length; i++) {
                        const contentEl = chain[i].content;
                        if (contentEl.contains(range.endContainer)) {
                            globalEndUnits = accEnd + countStoryUnitsInRoot(contentEl, range.endContainer, range.endOffset);
                            break;
                        }
                        if (i === 0 || !isEditableEmptyOrPlaceholder(contentEl) || getPlainTextNormalized(contentEl) !== PLACEHOLDER_TEXT) {
                            accEnd += countStoryUnitsInRoot(contentEl, null, 0);
                        }
                    }
                }
            }

            // 2. Gather entire chain into one continuous Story DOM
            const storyDiv = gatherStory(chain);
            let remainderFrag = document.createDocumentFragment();
            while (storyDiv.firstChild) remainderFrag.appendChild(storyDiv.firstChild);

            // 3. Create off-screen measure host
            const measureHost = document.createElement('div');
            measureHost.style.cssText = 'position:fixed; left:-99999px; top:-99999px; width:0; height:0; visibility:hidden; pointer-events:none; overflow:visible;';
            document.body.appendChild(measureHost);

            try {
                for (let i = 0; i < chain.length; i++) {
                    const boxObj = chain[i];
                    applyLinkedBoxStyles(boxObj);

                    if (i === chain.length - 1) {
                        // Last box keeps ALL remaining story text
                        boxObj.content.innerHTML = '';
                        boxObj.content.appendChild(remainderFrag);
                        boxObj.content.normalize();

                        // Check if final box still overflows (to show overflow indicator badge)
                        const probe = createMeasureProbe(boxObj);
                        measureHost.appendChild(probe.outerEl);
                        Array.from(boxObj.content.childNodes).forEach(n => probe.clone.appendChild(n.cloneNode(true)));
                        const stillOverflows = !doesCloneFit(probe.clone);
                        probe.outerEl.remove();

                        if (stillOverflows) {
                            boxObj.box.setAttribute('data-text-overflow', 'true');
                        } else {
                            boxObj.box.removeAttribute('data-text-overflow');
                        }
                        break;
                    }

                    boxObj.box.removeAttribute('data-text-overflow');
                    if (remainderFrag.childNodes.length === 0) {
                        boxObj.content.innerHTML = '';
                        continue;
                    }

                    const res = splitFragmentForBox(remainderFrag, boxObj, measureHost);
                    boxObj.content.innerHTML = '';
                    boxObj.content.appendChild(res.headFrag);
                    boxObj.content.normalize();
                    remainderFrag = res.tailFrag;
                }
            } finally {
                if (measureHost.parentNode) measureHost.parentNode.removeChild(measureHost);
            }

            // 4. Restore caret or text selection across the chain if editing/selecting was active
            if (hadChainFocus && globalStartUnits !== -1 && sel) {
                const resolveInChain = (targetUnits) => {
                    let rem = Math.max(0, targetUnits);
                    let resContent = null;
                    let resPos = null;
                    for (let i = 0; i < chain.length; i++) {
                        const c = chain[i].content;
                        const resolved = resolveStoryUnitInRoot(c, rem);
                        resContent = c;
                        resPos = resolved.pos;
                        if (resolved.found) break;
                        rem -= resolved.consumed;
                    }
                    return (resContent && resPos) ? { content: resContent, pos: resPos } : null;
                };

                const startLoc = resolveInChain(globalStartUnits);
                const endLoc = (globalEndUnits > globalStartUnits) ? resolveInChain(globalEndUnits) : startLoc;

                if (startLoc && endLoc) {
                    try {
                        const newRange = document.createRange();
                        newRange.setStart(startLoc.pos.node, startLoc.pos.offset);
                        if (globalEndUnits > globalStartUnits) {
                            if (endLoc.content === startLoc.content) {
                                newRange.setEnd(endLoc.pos.node, endLoc.pos.offset);
                            } else {
                                newRange.setEnd(startLoc.content, startLoc.content.childNodes.length);
                            }
                        } else {
                            newRange.collapse(true);
                        }
                        sel.removeAllRanges();
                        sel.addRange(newRange);
                        if (document.activeElement !== startLoc.content) {
                            startLoc.content.focus({ preventScroll: true });
                        }
                        if (typeof state !== 'undefined') {
                            state.lastRange = newRange.cloneRange();
                        }
                    } catch (err) {}
                }
            }

            if (typeof window.renderSelectionOverlays === 'function') {
                window.renderSelectionOverlays();
            }
        } finally {
            // Drain all DOM/style mutations caused by flowTextBoxes so textFlowMutationObserver does not self-trigger in a loop
            if (textFlowMutationObserver) {
                try { textFlowMutationObserver.takeRecords(); } catch (e) {}
            }
            window._isFlowingText = false;
        }

        // Immediately repaint app spellcheck highlights after Text nodes are re-packed, plus schedule full proofing pass
        if (window.SpellCheckEngine) {
            if (typeof window.SpellCheckEngine.paintHighlights === 'function') {
                window.SpellCheckEngine.paintHighlights();
            }
            if (typeof window.SpellCheckEngine.trigger === 'function') {
                window.SpellCheckEngine.trigger(250);
            }
        }
    };

    // --- Scheduled Coalesced Reflow (by chain head) ---
    window.scheduleTextFlow = function(boxOrEl, delayMs) {
        if (!boxOrEl || window._isFlowingText) return;
        const box = boxOrEl.classList && boxOrEl.classList.contains('pub-element')
            ? boxOrEl
            : (boxOrEl.closest ? boxOrEl.closest('.pub-element') : null);
        if (!box) return;
        if (!box.getAttribute('data-next-box') && !box.getAttribute('data-prev-box')) return;

        const headBox = getTextFlowHead(box);
        if (!headBox) return;
        const key = headBox.id || 'default';

        const prevTimer = window._flowTimers.get(key);
        if (prevTimer) {
            if (prevTimer.type === 'raf') cancelAnimationFrame(prevTimer.id);
            else clearTimeout(prevTimer.id);
        }

        if (!delayMs) {
            const rafId = requestAnimationFrame(() => {
                window._flowTimers.delete(key);
                if (document.contains(headBox)) {
                    window.flowTextBoxes(headBox);
                }
            });
            window._flowTimers.set(key, { type: 'raf', id: rafId });
        } else {
            const tId = setTimeout(() => {
                window._flowTimers.delete(key);
                if (document.contains(headBox)) {
                    window.flowTextBoxes(headBox);
                }
            }, delayMs);
            window._flowTimers.set(key, { type: 'timeout', id: tId });
        }
    };

    // --- Live Resize & Style/Content Observers ---
    const observedBoxes = new WeakSet();
    const lastObservedSizes = new WeakMap();
    const textFlowResizeObserver = (typeof ResizeObserver !== 'undefined') ? new ResizeObserver(entries => {
        if (window._isFlowingText) return;
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const target = entry.target;
            if (!target || (!target.getAttribute('data-next-box') && !target.getAttribute('data-prev-box'))) continue;
            const cr = entry.contentRect;
            const w = Math.round((cr ? cr.width : target.offsetWidth) * 10) / 10;
            const h = Math.round((cr ? cr.height : target.offsetHeight) * 10) / 10;
            const prev = lastObservedSizes.get(target);
            lastObservedSizes.set(target, { w: w, h: h });
            if (!prev || (prev.w === w && prev.h === h)) continue;
            window.scheduleTextFlow(target, 0);
        }
    }) : null;

    const textFlowMutationObserver = (typeof MutationObserver !== 'undefined') ? new MutationObserver(mutations => {
        if (window._isFlowingText) return;
        const touchedBoxes = new Set();
        for (let i = 0; i < mutations.length; i++) {
            const m = mutations[i];
            const el = m.target.nodeType === 1 ? m.target : m.target.parentElement;
            const box = el && el.closest ? el.closest('.pub-element') : null;
            if (box && (box.getAttribute('data-next-box') || box.getAttribute('data-prev-box'))) {
                touchedBoxes.add(box);
            }
        }
        touchedBoxes.forEach(box => window.scheduleTextFlow(box, 20));
    }) : null;

    function observeLinkedTextBox(box) {
        if (!box || observedBoxes.has(box)) return;
        observedBoxes.add(box);
        if (textFlowResizeObserver) {
            textFlowResizeObserver.observe(box);
        }
        const elContent = box.querySelector('.element-content') || box;
        if (textFlowMutationObserver && elContent) {
            textFlowMutationObserver.observe(elContent, {
                attributes: true,
                attributeFilter: ['style', 'class'],
                childList: true,
                characterData: true,
                subtree: true
            });
        }
    }
    window.observeLinkedTextBox = observeLinkedTextBox;

    window.initTextFlowLinks = function(root) {
        const scope = root || document.getElementById('paper') || document;
        const linked = scope.querySelectorAll('.pub-element[data-next-box], .pub-element[data-prev-box]');
        const heads = new Set();
        linked.forEach(box => {
            observeLinkedTextBox(box);
            const h = getTextFlowHead(box);
            if (h) heads.add(h);
        });
        // Ensure visual flow and overflow flags match current container dimensions after load/render
        requestAnimationFrame(() => {
            heads.forEach(h => {
                if (document.contains(h)) window.flowTextBoxes(h);
            });
        });
    };

    // --- Link / Unlink / Cancel / Deletion Management ---
    window.cancelTextBoxLinking = function() {
        window.isLinkingTextBox = false;
        window.linkingSourceBox = null;
        document.body.classList.remove('linking-mode');
        document.body.style.cursor = 'default';
        const paper = document.getElementById('paper');
        if (paper) paper.style.cursor = 'default';
        const status = document.getElementById('status-msg');
        if (status && status.innerText.includes('link')) {
            status.innerText = 'Ready';
        }
    };

    function wouldCreateCycle(sourceBox, targetBox) {
        const visited = new Set([targetBox]);
        let curr = sourceBox;
        while (curr) {
            if (visited.has(curr)) return true;
            visited.add(curr);
            const prevId = curr.getAttribute('data-prev-box');
            curr = prevId ? document.getElementById(prevId) : null;
        }
        return false;
    }

    window.linkTextBoxes = function(sourceBox, targetBox) {
        window.cancelTextBoxLinking();

        if (!sourceBox || !targetBox || !document.contains(sourceBox) || !document.contains(targetBox)) {
            return false;
        }

        if (!isValidFlowTextBox(targetBox)) {
            if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Invalid Selection', 'Please select a text box to link to.');
            return false;
        }

        if (sourceBox === targetBox || wouldCreateCycle(sourceBox, targetBox)) {
            if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Link Text Box', 'Cannot create a circular link back to an earlier or same text box.');
            return false;
        }

        const targetContent = getEditableTextContent(targetBox);
        if (!isEditableEmptyOrPlaceholder(targetContent)) {
            if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Link Text Box', 'You need to select an empty text box to pour the text into.');
            return false;
        }

        // Clear placeholder text cleanly before pouring story into targetBox
        if (targetContent && getPlainTextNormalized(targetContent) === PLACEHOLDER_TEXT) {
            targetContent.innerHTML = '';
        }

        ensureBoxId(sourceBox);
        ensureBoxId(targetBox);

        // Detach targetBox from any previous incoming link if it had one
        const targetOldPrevId = targetBox.getAttribute('data-prev-box');
        if (targetOldPrevId) {
            const oldPrev = document.getElementById(targetOldPrevId);
            if (oldPrev && oldPrev.getAttribute('data-next-box') === targetBox.id) {
                oldPrev.removeAttribute('data-next-box');
            }
            targetBox.removeAttribute('data-prev-box');
        }

        // Support splicing if sourceBox already had a next box (unless targetBox is already its next)
        const sourceOldNextId = sourceBox.getAttribute('data-next-box');
        if (sourceOldNextId && sourceOldNextId !== targetBox.id) {
            const oldNext = document.getElementById(sourceOldNextId);
            if (oldNext) {
                // Find tail of targetBox (or targetBox itself)
                let tail = targetBox;
                const seen = new Set([tail]);
                while (tail.getAttribute('data-next-box')) {
                    const nxt = document.getElementById(tail.getAttribute('data-next-box'));
                    if (!nxt || seen.has(nxt)) break;
                    seen.add(nxt);
                    tail = nxt;
                }
                if (tail !== oldNext && !seen.has(oldNext)) {
                    ensureBoxId(tail);
                    tail.setAttribute('data-next-box', oldNext.id);
                    oldNext.setAttribute('data-prev-box', tail.id);
                } else {
                    oldNext.removeAttribute('data-prev-box');
                }
            }
        }

        sourceBox.setAttribute('data-next-box', targetBox.id);
        targetBox.setAttribute('data-prev-box', sourceBox.id);

        // Disable mutually exclusive grow-fit on linked frames so fixed bounds govern flow
        [sourceBox, targetBox].forEach(b => {
            if (b.getAttribute('data-grow-fit') === 'true') {
                b.removeAttribute('data-grow-fit');
                if (window.shrinkObserver && b.getAttribute('data-shrink-overflow') !== 'true') {
                    window.shrinkObserver.unobserve(b);
                }
            }
            observeLinkedTextBox(b);
        });

        const headBox = getTextFlowHead(sourceBox);
        window.flowTextBoxes(headBox);

        if (typeof window.updateTextFlowRibbonUI === 'function') {
            window.updateTextFlowRibbonUI(targetBox);
        }
        if (typeof window.pushHistory === 'function') {
            window.pushHistory();
        }
        return true;
    };

    function cleanLeadingContinuationMarker(box) {
        const content = getEditableTextContent(box);
        if (!content || !content.firstElementChild) return;
        let ptr = content.firstElementChild;
        while (ptr) {
            ptr.removeAttribute(FLOW_CONT_ATTR);
            ptr = ptr.firstElementChild;
        }
    }

    window.unlinkTextBox = function(box) {
        if (!box) return false;
        const nextId = box.getAttribute('data-next-box');
        const prevId = box.getAttribute('data-prev-box');

        if (!nextId && !prevId) return false;

        let upstreamHead = null;
        let downstreamHead = null;

        if (nextId) {
            const nextBox = document.getElementById(nextId);
            box.removeAttribute('data-next-box');
            if (nextBox) {
                nextBox.removeAttribute('data-prev-box');
                cleanLeadingContinuationMarker(nextBox);
                downstreamHead = nextBox;
            }
            upstreamHead = getTextFlowHead(box);
        } else if (prevId) {
            const prevBox = document.getElementById(prevId);
            box.removeAttribute('data-prev-box');
            cleanLeadingContinuationMarker(box);
            if (prevBox) {
                prevBox.removeAttribute('data-next-box');
                upstreamHead = getTextFlowHead(prevBox);
            }
            downstreamHead = box;
        }

        if (upstreamHead) window.flowTextBoxes(upstreamHead);
        if (downstreamHead) window.flowTextBoxes(downstreamHead);

        [box, upstreamHead, downstreamHead].forEach(b => {
            if (!b) return;
            if (!b.getAttribute('data-next-box') && !b.getAttribute('data-prev-box')) {
                b.removeAttribute('data-text-overflow');
            }
        });

        if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
        if (typeof window.updateTextFlowRibbonUI === 'function') window.updateTextFlowRibbonUI(box);
        if (typeof window.pushHistory === 'function') window.pushHistory();
        return true;
    };

    window.handleLinkedBoxesRemoved = function(removedEls) {
        if (!removedEls || removedEls.length === 0) return;
        const removedSet = new Set(removedEls);
        const headsToReflow = new Set();

        removedEls.forEach(box => {
            if (!box || !box.getAttribute) return;
            const prevId = box.getAttribute('data-prev-box');
            const nextId = box.getAttribute('data-next-box');
            if (!prevId && !nextId) return;

            // Find nearest surviving prev
            let prev = prevId ? document.getElementById(prevId) : null;
            const seenPrev = new Set();
            while (prev && removedSet.has(prev) && !seenPrev.has(prev)) {
                seenPrev.add(prev);
                const pId = prev.getAttribute('data-prev-box');
                prev = pId ? document.getElementById(pId) : null;
            }

            // Find nearest surviving next
            let next = nextId ? document.getElementById(nextId) : null;
            const seenNext = new Set();
            while (next && removedSet.has(next) && !seenNext.has(next)) {
                seenNext.add(next);
                const nId = next.getAttribute('data-next-box');
                next = nId ? document.getElementById(nId) : null;
            }

            // Re-collect content from removed middle/tail box so story text isn't dropped if chain survives
            const boxContent = getEditableTextContent(box);
            if (prev && next) {
                ensureBoxId(prev);
                ensureBoxId(next);
                prev.setAttribute('data-next-box', next.id);
                next.setAttribute('data-prev-box', prev.id);
                if (boxContent && boxContent.childNodes.length > 0) {
                    const prevContent = getEditableTextContent(prev);
                    if (prevContent) {
                        const tmp = document.createElement('div');
                        Array.from(boxContent.childNodes).forEach(n => tmp.appendChild(n.cloneNode(true)));
                        mergeContinuationNodes(prevContent, tmp);
                        prevContent.normalize();
                    }
                }
                headsToReflow.add(getTextFlowHead(prev));
            } else if (prev) {
                prev.removeAttribute('data-next-box');
                if (boxContent && boxContent.childNodes.length > 0) {
                    const prevContent = getEditableTextContent(prev);
                    if (prevContent) {
                        const tmp = document.createElement('div');
                        Array.from(boxContent.childNodes).forEach(n => tmp.appendChild(n.cloneNode(true)));
                        mergeContinuationNodes(prevContent, tmp);
                        prevContent.normalize();
                    }
                }
                const h = getTextFlowHead(prev);
                if (h) headsToReflow.add(h);
            } else if (next) {
                next.removeAttribute('data-prev-box');
                cleanLeadingContinuationMarker(next);
                if (boxContent && boxContent.childNodes.length > 0) {
                    const nextContent = getEditableTextContent(next);
                    if (nextContent) {
                        const prep = document.createElement('div');
                        Array.from(boxContent.childNodes).forEach(n => prep.appendChild(n.cloneNode(true)));
                        const nextFrag = document.createDocumentFragment();
                        while (nextContent.firstChild) nextFrag.appendChild(nextContent.firstChild);
                        mergeContinuationNodes(prep, nextFrag);
                        nextContent.innerHTML = '';
                        while (prep.firstChild) nextContent.appendChild(prep.firstChild);
                        nextContent.normalize();
                    }
                }
                headsToReflow.add(next);
            }

            box.removeAttribute('data-prev-box');
            box.removeAttribute('data-next-box');
            box.removeAttribute('data-text-overflow');
        });

        headsToReflow.forEach(h => {
            if (h && !removedSet.has(h) && document.contains(h)) {
                window.flowTextBoxes(h);
            }
        });
    };

    // --- Ribbon Sync Helper ---
    window.updateTextFlowRibbonUI = function(el) {
        const unlinkBtn = document.getElementById('btn-unlink-textbox');
        const linkBtn = document.getElementById('btn-link-textbox');
        const target = el || (typeof state !== 'undefined' ? state.selectedEl : null);
        const isLinked = !!(target && (target.getAttribute('data-next-box') || target.getAttribute('data-prev-box')));
        const hasForward = !!(target && target.getAttribute('data-next-box'));

        if (linkBtn) {
            linkBtn.classList.toggle('active', hasForward);
        }
        if (unlinkBtn) {
            unlinkBtn.style.opacity = isLinked ? '1' : '0.45';
            unlinkBtn.style.pointerEvents = isLinked ? 'auto' : 'none';
            unlinkBtn.title = hasForward ? 'Break Forward Text Flow Link' : (isLinked ? 'Break Text Flow Link' : 'Break Text Flow Link (Not Linked)');
        }
    };

    // --- Visual Chain Overlay Connectors & Overflow Badges ---
    window.renderTextFlowOverlays = function(overlayContainer) {
        if (!overlayContainer) return;
        const paper = document.getElementById('paper');
        if (!paper) return;

        overlayContainer.querySelectorAll('.op-textflow-overlay').forEach(n => n.remove());

        let activeEl = (typeof state !== 'undefined') ? state.selectedEl : null;
        if (!activeEl && typeof state !== 'undefined' && state.multiSelected && state.multiSelected.length === 1) {
            activeEl = state.multiSelected[0];
        }
        if (!activeEl || !document.contains(activeEl)) return;
        if (!activeEl.getAttribute('data-next-box') && !activeEl.getAttribute('data-prev-box')) return;

        const headBox = getTextFlowHead(activeEl);
        const chain = getTextFlowChain(headBox);
        if (chain.length < 2) return;

        const svgNS = 'http://www.w3.org/2000/svg';
        const layer = document.createElement('div');
        layer.className = 'op-textflow-overlay';
        layer.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:999998;';

        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', paper.style.width || String(paper.clientWidth));
        svg.setAttribute('height', paper.style.height || String(paper.clientHeight));
        svg.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; overflow:visible; pointer-events:none;';

        const defs = document.createElementNS(svgNS, 'defs');
        const marker = document.createElementNS(svgNS, 'marker');
        marker.setAttribute('id', 'op-flow-arrowhead');
        marker.setAttribute('viewBox', '0 0 10 10');
        marker.setAttribute('refX', '8');
        marker.setAttribute('refY', '5');
        marker.setAttribute('markerWidth', '7');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('orient', 'auto-start-reverse');
        const mPath = document.createElementNS(svgNS, 'path');
        mPath.setAttribute('d', 'M 0 1 L 9 5 L 0 9 z');
        mPath.setAttribute('fill', '#007670');
        marker.appendChild(mPath);
        defs.appendChild(marker);
        svg.appendChild(defs);

        for (let i = 0; i < chain.length - 1; i++) {
            const b1 = chain[i].box;
            const b2 = chain[i + 1].box;

            const x1 = (parseFloat(b1.style.left) || b1.offsetLeft) + (parseFloat(b1.style.width) || b1.offsetWidth);
            const y1 = (parseFloat(b1.style.top) || b1.offsetTop) + (parseFloat(b1.style.height) || b1.offsetHeight) - 14;
            const x2 = (parseFloat(b2.style.left) || b2.offsetLeft);
            const y2 = (parseFloat(b2.style.top) || b2.offsetTop) + 14;

            const cxOffset = Math.max(40, Math.abs(x2 - x1) * 0.45);
            const path = document.createElementNS(svgNS, 'path');
            path.setAttribute('d', `M ${x1} ${y1} C ${x1 + cxOffset} ${y1}, ${x2 - cxOffset} ${y2}, ${x2} ${y2}`);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#007670');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-dasharray', '6 4');
            path.setAttribute('opacity', '0.85');
            path.setAttribute('marker-end', 'url(#op-flow-arrowhead)');
            svg.appendChild(path);
        }

        layer.appendChild(svg);

        // Outline every linked frame in chain subtly and add step index chips (1, 2, 3...)
        chain.forEach((item, idx) => {
            const b = item.box;
            const l = parseFloat(b.style.left) || b.offsetLeft;
            const t = parseFloat(b.style.top) || b.offsetTop;
            const w = parseFloat(b.style.width) || b.offsetWidth;
            const h = parseFloat(b.style.height) || b.offsetHeight;

            if (b !== activeEl) {
                const outline = document.createElement('div');
                outline.style.cssText = `position:absolute; left:${l}px; top:${t}px; width:${w}px; height:${h}px; transform:${b.style.transform || 'none'}; border:1.5px dashed rgba(0,118,112,0.75); box-sizing:border-box; pointer-events:none;`;
                layer.appendChild(outline);
            }

            const chip = document.createElement('div');
            chip.title = `Linked Story Box #${idx + 1}`;
            chip.style.cssText = `position:absolute; left:${l + w - 20}px; top:${t + h - 18}px; min-width:18px; height:16px; padding:0 4px; border-radius:8px; background:${b.getAttribute('data-text-overflow') === 'true' ? '#dc2626' : '#007670'}; color:#fff; font:700 10px/16px 'Segoe UI',sans-serif; text-align:center; pointer-events:auto; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.25);`;
            chip.textContent = (b.getAttribute('data-text-overflow') === 'true') ? `${idx + 1}+` : `${idx + 1}`;
            chip.addEventListener('mousedown', (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                if (typeof window.selectElement === 'function') {
                    window.selectElement(b);
                }
            });
            layer.appendChild(chip);
        });

        overlayContainer.appendChild(layer);
    };

    // --- Unified Event Listeners ---
    if (!window._textFlowListenersInstalled) {
        window._textFlowListenersInstalled = true;

        window.addEventListener('input', function(e) {
            if (window._isFlowingText) return;
            if (e.target && e.target.isContentEditable) {
                const box = e.target.closest ? e.target.closest('.pub-element') : null;
                if (box && (box.getAttribute('data-next-box') || box.getAttribute('data-prev-box'))) {
                    window.scheduleTextFlow(box, 16);
                }
            }
        });

        window.addEventListener('paste', function(e) {
            if (window._isFlowingText) return;
            if (e.target && e.target.isContentEditable) {
                const box = e.target.closest ? e.target.closest('.pub-element') : null;
                if (box && (box.getAttribute('data-next-box') || box.getAttribute('data-prev-box'))) {
                    window.scheduleTextFlow(box, 20);
                }
            }
        });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => window.initTextFlowLinks());
        } else {
            window.initTextFlowLinks();
        }
    }
})();
