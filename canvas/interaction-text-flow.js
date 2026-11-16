// =========================================================================
// OpenPublisher Text Flow & Linked Text Box Engine (v5.21.2)
// Supports continuous story reflow across resize, typing, paste, margins,
// cross-page chains, undo/redo, deletion, and rich HTML formatting.
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
        if (typeof box === 'object' && box.kind) return ensureFlowRefId(box);
        if (!box.id) {
            box.id = generateFlowBoxId();
        }
        return box.id;
    }
    window.ensureFlowBoxId = ensureBoxId;

    function getCurrentPageIdxSafe() {
        return (typeof state !== 'undefined' && typeof state.currentPageIndex === 'number') ? state.currentPageIndex : 0;
    }

    function ensureTextBoxTypeAndEditable(box) {
        if (!box || !box.getAttribute) return null;
        if (box.querySelector('table') || box.querySelector('.wa-text')) return null;
        const dtype = box.getAttribute('data-type');
        if (dtype === 'chart' || dtype === 'progress-bar' || dtype === 'shape' || dtype === 'image' || dtype === 'table') return null;

        let content = box.querySelector('.text-content') ||
                      box.querySelector('[contenteditable="true"]:not(.wa-text)') ||
                      box.querySelector('[contenteditable]:not(.wa-text):not([contenteditable="false"])');

        if (!content) {
            const isMarkedTextOrLinked = (dtype === 'text' || box.getAttribute('data-scheme-text') !== null || !!box.getAttribute('data-next-box') || !!box.getAttribute('data-prev-box'));
            if (isMarkedTextOrLinked && !box.querySelector('img, svg, canvas')) {
                const elContent = box.querySelector('.element-content') || box;
                const fallbackDiv = Array.from(elContent.children).find(ch => ch.tagName === 'DIV');
                if (fallbackDiv) {
                    fallbackDiv.setAttribute('contenteditable', 'true');
                    content = fallbackDiv;
                }
            }
        }
        return content || null;
    }

    function getEditableTextContent(box) {
        return ensureTextBoxTypeAndEditable(box);
    }
    window.getEditableTextContent = getEditableTextContent;

    function isValidFlowTextBox(box) {
        if (!box || !box.classList || !box.classList.contains('pub-element')) return false;
        if (box.classList.contains('master-page-element')) return false;
        return !!getEditableTextContent(box);
    }
    window.isValidFlowTextBox = isValidFlowTextBox;

    function hydrateSerializedFlowBox(data) {
        if (!data || data._isMaster || data.isMasterElement || data.imgSrc) return null;
        if (data.type === 'shape' || data.type === 'chart' || data.type === 'progress-bar' || data.type === 'image' || data.type === 'table') return null;

        const el = document.createElement('div');
        el.className = 'pub-element';
        if (data.id) el.id = data.id;
        el.style.position = 'absolute';
        el.style.left = data.left || '0px';
        el.style.top = data.top || '0px';
        el.style.width = data.width || '200px';
        el.style.height = data.height || '100px';
        el.style.transform = data.transform || 'none';
        if (data.overflow) el.style.overflow = data.overflow;
        if (data.type) el.setAttribute('data-type', data.type);
        if (data.textboxStyle) el.setAttribute('data-textbox-style', data.textboxStyle);
        if (data.filterAttributes) {
            Object.entries(data.filterAttributes).forEach(([k, v]) => {
                if (k && v !== undefined && v !== null) el.setAttribute(k, v);
            });
        }

        const ec = document.createElement('div');
        ec.className = 'element-content';
        ec.style.cssText = 'position:relative; width:100%; height:100%;';
        if (data.contentCssText) ec.style.cssText = data.contentCssText;
        ec.innerHTML = data.innerHTML || '';
        el.appendChild(ec);
        return el;
    }

    function isValidFlowData(data) {
        const tempEl = hydrateSerializedFlowBox(data);
        if (!tempEl) return false;
        return isValidFlowTextBox(tempEl);
    }

    function isLivePaperFlowEl(node) {
        if (!node || node.nodeType !== 1 || !node.classList || !node.classList.contains('pub-element')) return false;
        if (node.closest && node.closest('#op-textflow-measure-host')) return false;
        const paperEl = document.getElementById('paper');
        return !!(paperEl ? paperEl.contains(node) : document.contains(node));
    }

    function locateFlowBox(idOrEl) {
        if (!idOrEl) return null;
        if (typeof idOrEl === 'object' && idOrEl.kind) return idOrEl;

        const currPageIdx = getCurrentPageIdxSafe();
        if (typeof idOrEl === 'object' && idOrEl.nodeType === 1) {
            if (isLivePaperFlowEl(idOrEl)) {
                return { kind: 'dom', box: idOrEl, id: idOrEl.id || '', pageIndex: currPageIdx };
            }
            if (!idOrEl.id) return null;
            idOrEl = idOrEl.id;
        }

        const id = (typeof idOrEl === 'string') ? idOrEl : (idOrEl && idOrEl.id);
        if (!id) return null;

        const paperEl = document.getElementById('paper');
        if (paperEl) {
            const paperEls = paperEl.querySelectorAll('.pub-element');
            for (let i = 0; i < paperEls.length; i++) {
                if (paperEls[i].id === id) {
                    return { kind: 'dom', box: paperEls[i], id: id, pageIndex: currPageIdx };
                }
            }
        } else {
            const domEl = document.getElementById(id);
            if (isLivePaperFlowEl(domEl)) {
                return { kind: 'dom', box: domEl, id: id, pageIndex: currPageIdx };
            }
        }

        if (typeof state !== 'undefined' && Array.isArray(state.pages)) {
            for (let pIdx = 0; pIdx < state.pages.length; pIdx++) {
                if (pIdx === currPageIdx) continue;
                const page = state.pages[pIdx];
                if (!page || !Array.isArray(page.elements)) continue;
                for (let j = 0; j < page.elements.length; j++) {
                    const elData = page.elements[j];
                    if (elData && elData.id === id) {
                        return { kind: 'data', data: elData, id: id, pageIndex: pIdx };
                    }
                }
            }
        }
        return null;
    }

    function getFlowAttr(ref, attr) {
        if (!ref) return null;
        if (ref.kind === 'dom') return ref.box.getAttribute(attr);
        return (ref.data && ref.data.filterAttributes && ref.data.filterAttributes[attr]) || null;
    }

    function setFlowAttr(ref, attr, val) {
        if (!ref) return;
        if (ref.kind === 'dom') {
            ref.box.setAttribute(attr, val);
        } else if (ref.data) {
            if (!ref.data.filterAttributes) ref.data.filterAttributes = {};
            ref.data.filterAttributes[attr] = String(val);
        }
    }

    function removeFlowAttr(ref, attr) {
        if (!ref) return;
        if (ref.kind === 'dom') {
            ref.box.removeAttribute(attr);
        } else if (ref.data && ref.data.filterAttributes) {
            delete ref.data.filterAttributes[attr];
        }
    }

    function markFlowRefAsText(ref) {
        if (!ref) return;
        if (ref.kind === 'dom') {
            const dt = ref.box.getAttribute('data-type');
            if (!dt || dt === 'box') ref.box.setAttribute('data-type', 'text');
        } else if (ref.data) {
            if (!ref.data.type || ref.data.type === 'box') ref.data.type = 'text';
        }
    }

    function ensureFlowRefId(ref) {
        if (!ref) return '';
        if (ref.kind === 'dom') {
            ref.id = ensureBoxId(ref.box);
            return ref.id;
        }
        if (ref.data) {
            if (!ref.data.id) ref.data.id = generateFlowBoxId();
            ref.id = ref.data.id;
            return ref.id;
        }
        return '';
    }

    function isValidFlowRef(ref) {
        if (!ref) return false;
        if (ref.kind === 'dom') return isValidFlowTextBox(ref.box);
        return isValidFlowData(ref.data);
    }

    function sameFlowRef(a, b) {
        if (!a || !b) return false;
        if (a.kind === 'dom' && b.kind === 'dom') return a.box === b.box;
        if (a.kind === 'data' && b.kind === 'data') return a.data === b.data;
        if (a.id && b.id) return a.id === b.id;
        return false;
    }

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

    function getTextFlowHeadRef(boxOrId) {
        const startRef = locateFlowBox(boxOrId);
        if (!startRef) return null;
        const visited = new Set([startRef.id || startRef.box || startRef.data]);
        let curr = startRef;
        while (true) {
            const prevId = getFlowAttr(curr, 'data-prev-box');
            if (!prevId) break;
            const prev = locateFlowBox(prevId);
            const prevKey = prev ? (prev.id || prev.box || prev.data) : null;
            if (!prev || visited.has(prevKey) || !isValidFlowRef(prev)) {
                removeFlowAttr(curr, 'data-prev-box');
                break;
            }
            const currId = curr.id || (curr.kind === 'dom' ? curr.box.id : (curr.data && curr.data.id));
            if (currId && getFlowAttr(prev, 'data-next-box') !== currId) {
                removeFlowAttr(curr, 'data-prev-box');
                break;
            }
            visited.add(prevKey);
            curr = prev;
        }
        return curr;
    }

    function getTextFlowHead(box) {
        const ref = getTextFlowHeadRef(box);
        if (!ref) return null;
        return ref.kind === 'dom' ? ref.box : null;
    }
    window.getTextFlowHead = getTextFlowHead;

    function getTextFlowChainRefs(headRefOrBox) {
        const headRef = locateFlowBox(headRefOrBox);
        if (!headRef) return [];
        const chain = [];
        const visited = new Set();
        let curr = headRef;
        while (curr) {
            const key = curr.id || curr.box || curr.data;
            if (visited.has(key)) break;
            visited.add(key);

            if (!isValidFlowRef(curr)) {
                removeFlowAttr(curr, 'data-next-box');
                break;
            }

            chain.push(curr);
            const nextId = getFlowAttr(curr, 'data-next-box');
            if (!nextId) break;
            const next = locateFlowBox(nextId);
            const nextKey = next ? (next.id || next.box || next.data) : null;
            if (!next || visited.has(nextKey) || !isValidFlowRef(next)) {
                removeFlowAttr(curr, 'data-next-box');
                break;
            }
            const currId = ensureFlowRefId(curr);
            if (getFlowAttr(next, 'data-prev-box') !== currId) {
                setFlowAttr(next, 'data-prev-box', currId);
            }
            curr = next;
        }
        return chain;
    }

    function getTextFlowChain(headBox) {
        const refs = getTextFlowChainRefs(headBox);
        const chain = [];
        for (let i = 0; i < refs.length; i++) {
            const r = refs[i];
            if (r.kind === 'dom') {
                const c = getEditableTextContent(r.box);
                if (c) chain.push({ box: r.box, content: c, ref: r, pageIndex: r.pageIndex });
            }
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

    // --- Main Story Reflow Engine (supports single-page & cross-page chains) ---
    window.flowTextBoxes = function(headBox) {
        if (!headBox || window._isFlowingText) return;
        const resolvedHeadRef = getTextFlowHeadRef(headBox);
        if (!resolvedHeadRef) return;

        const chainRefs = getTextFlowChainRefs(resolvedHeadRef);
        if (chainRefs.length < 2) {
            if (chainRefs.length === 1) {
                removeFlowAttr(chainRefs[0], 'data-text-overflow');
            }
            return;
        }

        window._isFlowingText = true;
        let modifiedOffPage = false;

        // 1. Create off-screen measure host (also hosts hydrated off-page boxes so computed styles & overflow match)
        const measureHost = document.createElement('div');
        measureHost.id = 'op-textflow-measure-host';
        measureHost.setAttribute('data-textflow-measure', 'true');
        measureHost.style.cssText = 'position:fixed; left:-99999px; top:-99999px; width:0; height:0; visibility:hidden; pointer-events:none; overflow:visible;';
        document.body.appendChild(measureHost);

        try {
            const chain = [];
            for (let i = 0; i < chainRefs.length; i++) {
                const ref = chainRefs[i];
                if (ref.kind === 'dom') {
                    const content = getEditableTextContent(ref.box);
                    if (content) {
                        chain.push({ box: ref.box, content: content, ref: ref, pageIndex: ref.pageIndex });
                    }
                } else {
                    const hydrated = hydrateSerializedFlowBox(ref.data);
                    if (hydrated) {
                        measureHost.appendChild(hydrated);
                        const content = getEditableTextContent(hydrated);
                        if (content) {
                            chain.push({ box: hydrated, content: content, ref: ref, pageIndex: ref.pageIndex, isHydrated: true });
                        }
                    }
                }
            }

            if (chain.length < 2) {
                if (chainRefs.length >= 1) removeFlowAttr(chainRefs[0], 'data-text-overflow');
                return;
            }

            // 2. Capture global selection offsets if user is currently focused/selecting inside an active on-page box
            let globalStartUnits = -1;
            let globalEndUnits = -1;
            let hadChainFocus = false;
            const activeEl = document.activeElement;
            for (let i = 0; i < chain.length; i++) {
                if (!chain[i].isHydrated && activeEl && (chain[i].content === activeEl || chain[i].content.contains(activeEl))) {
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
                    if (!chain[i].isHydrated && contentEl.contains(range.startContainer)) {
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
                        if (!chain[i].isHydrated && contentEl.contains(range.endContainer)) {
                            globalEndUnits = accEnd + countStoryUnitsInRoot(contentEl, range.endContainer, range.endOffset);
                            break;
                        }
                        if (i === 0 || !isEditableEmptyOrPlaceholder(contentEl) || getPlainTextNormalized(contentEl) !== PLACEHOLDER_TEXT) {
                            accEnd += countStoryUnitsInRoot(contentEl, null, 0);
                        }
                    }
                }
            }

            // 3. Gather entire chain into one continuous Story DOM
            const storyDiv = gatherStory(chain);
            let remainderFrag = document.createDocumentFragment();
            while (storyDiv.firstChild) remainderFrag.appendChild(storyDiv.firstChild);

            // 4. Pack story fragments frame-by-frame across all pages in the chain
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
                        setFlowAttr(boxObj.ref, 'data-text-overflow', 'true');
                    } else {
                        boxObj.box.removeAttribute('data-text-overflow');
                        removeFlowAttr(boxObj.ref, 'data-text-overflow');
                    }
                    break;
                }

                boxObj.box.removeAttribute('data-text-overflow');
                removeFlowAttr(boxObj.ref, 'data-text-overflow');
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

            // 5. Commit hydrated off-page frames back into state.pages[pageIndex].elements
            for (let i = 0; i < chain.length; i++) {
                const boxObj = chain[i];
                if (boxObj.isHydrated && boxObj.ref && boxObj.ref.data) {
                    const ec = boxObj.box.querySelector('.element-content');
                    boxObj.ref.data.innerHTML = ec ? ec.innerHTML : boxObj.content.innerHTML;
                    if (ec) boxObj.ref.data.contentCssText = ec.style.cssText;
                    markFlowRefAsText(boxObj.ref);
                    modifiedOffPage = true;
                } else {
                    markFlowRefAsText(boxObj.ref);
                }
            }

            // 6. Restore caret or text selection across on-page boxes if editing/selecting was active
            if (hadChainFocus && globalStartUnits !== -1 && sel) {
                const resolveInChain = (targetUnits) => {
                    let rem = Math.max(0, targetUnits);
                    let resContent = null;
                    let resPos = null;
                    let resIsHydrated = false;
                    for (let i = 0; i < chain.length; i++) {
                        const c = chain[i].content;
                        const resolved = resolveStoryUnitInRoot(c, rem);
                        resContent = c;
                        resPos = resolved.pos;
                        resIsHydrated = !!chain[i].isHydrated;
                        if (resolved.found) break;
                        rem -= resolved.consumed;
                    }
                    return (!resIsHydrated && resContent && resPos) ? { content: resContent, pos: resPos } : null;
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

        } finally {
            if (measureHost.parentNode) measureHost.parentNode.removeChild(measureHost);
            // Drain all DOM/style mutations caused by flowTextBoxes so textFlowMutationObserver does not self-trigger in a loop
            if (textFlowMutationObserver) {
                try { textFlowMutationObserver.takeRecords(); } catch (e) {}
            }
            window._isFlowingText = false;
        }

        if (typeof window.renderSelectionOverlays === 'function') {
            window.renderSelectionOverlays();
        }

        if (modifiedOffPage && typeof window.updateSidebar === 'function') {
            clearTimeout(window._crossPageThumbTimer);
            window._crossPageThumbTimer = setTimeout(() => {
                if (typeof window.updateSidebar === 'function') window.updateSidebar();
            }, 150);
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

        const headRef = getTextFlowHeadRef(box);
        if (!headRef) return;
        const key = headRef.id || box.id || 'default';

        const prevTimer = window._flowTimers.get(key);
        if (prevTimer) {
            if (prevTimer.type === 'raf') cancelAnimationFrame(prevTimer.id);
            else clearTimeout(prevTimer.id);
        }

        if (!delayMs) {
            const rafId = requestAnimationFrame(() => {
                window._flowTimers.delete(key);
                if (document.contains(box)) {
                    window.flowTextBoxes(box);
                }
            });
            window._flowTimers.set(key, { type: 'raf', id: rafId });
        } else {
            const tId = setTimeout(() => {
                window._flowTimers.delete(key);
                if (document.contains(box)) {
                    window.flowTextBoxes(box);
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
        const headsMap = new Map();
        linked.forEach(box => {
            observeLinkedTextBox(box);
            ensureTextBoxTypeAndEditable(box);
            const hRef = getTextFlowHeadRef(box);
            if (hRef) {
                const hKey = ensureFlowRefId(hRef) || hRef.id;
                if (hKey && !headsMap.has(hKey)) headsMap.set(hKey, hRef);
            }
        });
        // Ensure visual flow and overflow flags match current container dimensions after load/render
        requestAnimationFrame(() => {
            headsMap.forEach(hRef => {
                if (hRef.kind === 'dom' && !document.contains(hRef.box)) return;
                window.flowTextBoxes(hRef);
            });
        });
    };

    // --- Link / Unlink / Cancel / Deletion Management ---
    const CHAIN_CURSOR = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>') 12 12, crosshair`;

    window.syncTextBoxLinkingUI = function() {
        if (!window.isLinkingTextBox) return;
        document.body.classList.add('linking-mode');
        document.body.style.cursor = CHAIN_CURSOR;
        const paper = document.getElementById('paper');
        if (paper) paper.style.cursor = CHAIN_CURSOR;
        const status = document.getElementById('status-msg');
        if (status) {
            const currPage = getCurrentPageIdxSafe();
            const srcPage = (typeof window.linkingSourcePageIndex === 'number') ? window.linkingSourcePageIndex : currPage;
            status.innerText = (currPage !== srcPage)
                ? `Linking from Page ${srcPage + 1}: select an empty text box on this page (Esc to cancel)...`
                : 'Select an empty text box to link to, or switch pages (Esc to cancel)...';
        }
    };

    window.startTextBoxLinking = function(sourceBox) {
        if (!sourceBox) return false;
        if (!isValidFlowTextBox(sourceBox)) {
            if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Link Text Box', 'Only text boxes can be linked for text flow.');
            return false;
        }
        markFlowRefAsText({ kind: 'dom', box: sourceBox, id: ensureBoxId(sourceBox), pageIndex: getCurrentPageIdxSafe() });
        window.isLinkingTextBox = true;
        window.linkingSourceBox = sourceBox;
        window.linkingSourceId = ensureBoxId(sourceBox);
        window.linkingSourcePageIndex = getCurrentPageIdxSafe();
        window.syncTextBoxLinkingUI();
        return true;
    };

    window.cancelTextBoxLinking = function() {
        window.isLinkingTextBox = false;
        window.linkingSourceBox = null;
        window.linkingSourceId = null;
        window.linkingSourcePageIndex = null;
        document.body.classList.remove('linking-mode');
        document.body.style.cursor = 'default';
        const paper = document.getElementById('paper');
        if (paper) paper.style.cursor = 'default';
        const status = document.getElementById('status-msg');
        if (status && (status.innerText.includes('link') || status.innerText.includes('Linking'))) {
            status.innerText = 'Ready';
        }
    };

    function wouldCreateCycleRefs(sourceRef, targetRef) {
        const visited = new Set([targetRef.id || targetRef.box || targetRef.data]);
        let curr = sourceRef;
        while (curr) {
            const key = curr.id || curr.box || curr.data;
            if (visited.has(key)) return true;
            visited.add(key);
            const prevId = getFlowAttr(curr, 'data-prev-box');
            curr = prevId ? locateFlowBox(prevId) : null;
        }
        return false;
    }

    window.linkTextBoxes = function(sourceBoxOrId, targetBox) {
        const sourceRef = locateFlowBox(sourceBoxOrId || window.linkingSourceBox || window.linkingSourceId);
        const targetRef = locateFlowBox(targetBox);
        window.cancelTextBoxLinking();

        if (!sourceRef || !targetRef || targetRef.kind !== 'dom' || !document.contains(targetRef.box)) {
            return false;
        }

        if (!isValidFlowRef(targetRef)) {
            if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Invalid Selection', 'Please select a text box to link to.');
            return false;
        }

        if (!isValidFlowRef(sourceRef)) {
            if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Link Text Box', 'Source text box is no longer available.');
            return false;
        }

        if (sameFlowRef(sourceRef, targetRef) || wouldCreateCycleRefs(sourceRef, targetRef)) {
            if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Link Text Box', 'Cannot create a circular link back to an earlier or same text box.');
            return false;
        }

        const targetContent = getEditableTextContent(targetRef.box);
        if (!isEditableEmptyOrPlaceholder(targetContent)) {
            if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Link Text Box', 'You need to select an empty text box to pour the text into.');
            return false;
        }

        // Clear placeholder text cleanly before pouring story into targetBox
        if (targetContent && getPlainTextNormalized(targetContent) === PLACEHOLDER_TEXT) {
            targetContent.innerHTML = '';
        }

        const srcId = ensureFlowRefId(sourceRef);
        const tgtId = ensureFlowRefId(targetRef);
        markFlowRefAsText(sourceRef);
        markFlowRefAsText(targetRef);

        // Detach targetBox from any previous incoming link if it had one (same page or cross-page)
        const targetOldPrevId = getFlowAttr(targetRef, 'data-prev-box');
        if (targetOldPrevId) {
            const oldPrevRef = locateFlowBox(targetOldPrevId);
            if (oldPrevRef && getFlowAttr(oldPrevRef, 'data-next-box') === tgtId) {
                removeFlowAttr(oldPrevRef, 'data-next-box');
            }
            removeFlowAttr(targetRef, 'data-prev-box');
        }

        // Support splicing if sourceBox already had a next box (unless targetBox is already its next)
        const sourceOldNextId = getFlowAttr(sourceRef, 'data-next-box');
        if (sourceOldNextId && sourceOldNextId !== tgtId) {
            const oldNextRef = locateFlowBox(sourceOldNextId);
            if (oldNextRef) {
                let tailRef = targetRef;
                const seen = new Set([tailRef.id || tailRef.box || tailRef.data]);
                while (getFlowAttr(tailRef, 'data-next-box')) {
                    const nxtRef = locateFlowBox(getFlowAttr(tailRef, 'data-next-box'));
                    const nxtKey = nxtRef ? (nxtRef.id || nxtRef.box || nxtRef.data) : null;
                    if (!nxtRef || seen.has(nxtKey)) break;
                    seen.add(nxtKey);
                    tailRef = nxtRef;
                }
                const oldNextKey = oldNextRef.id || oldNextRef.box || oldNextRef.data;
                if (!sameFlowRef(tailRef, oldNextRef) && !seen.has(oldNextKey)) {
                    const tailId = ensureFlowRefId(tailRef);
                    const oldNextIdResolved = ensureFlowRefId(oldNextRef);
                    setFlowAttr(tailRef, 'data-next-box', oldNextIdResolved);
                    setFlowAttr(oldNextRef, 'data-prev-box', tailId);
                } else {
                    removeFlowAttr(oldNextRef, 'data-prev-box');
                }
            }
        }

        setFlowAttr(sourceRef, 'data-next-box', tgtId);
        setFlowAttr(targetRef, 'data-prev-box', srcId);

        // Disable mutually exclusive grow-fit on linked frames so fixed bounds govern flow
        [sourceRef, targetRef].forEach(ref => {
            if (getFlowAttr(ref, 'data-grow-fit') === 'true') {
                removeFlowAttr(ref, 'data-grow-fit');
                if (ref.kind === 'dom' && window.shrinkObserver && ref.box.getAttribute('data-shrink-overflow') !== 'true') {
                    window.shrinkObserver.unobserve(ref.box);
                }
            }
            if (ref.kind === 'dom') {
                observeLinkedTextBox(ref.box);
            }
        });

        const headRef = getTextFlowHeadRef(sourceRef);
        window.flowTextBoxes(headRef);

        if (sourceRef.pageIndex !== targetRef.pageIndex && typeof window.updateSidebar === 'function') {
            window.updateSidebar();
        }
        if (typeof window.updateTextFlowRibbonUI === 'function') {
            window.updateTextFlowRibbonUI(targetRef.box);
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

    function cleanLeadingContinuationMarkerOnRef(ref) {
        if (!ref) return;
        if (ref.kind === 'dom') {
            cleanLeadingContinuationMarker(ref.box);
        } else if (ref.data) {
            const hydrated = hydrateSerializedFlowBox(ref.data);
            if (hydrated) {
                cleanLeadingContinuationMarker(hydrated);
                const ec = hydrated.querySelector('.element-content');
                if (ec) ref.data.innerHTML = ec.innerHTML;
            }
        }
    }

    function mergeSerializedHtmlIntoRef(targetRef, fragmentNodes, prepend) {
        if (!targetRef || !fragmentNodes || fragmentNodes.length === 0) return;
        if (targetRef.kind === 'dom') {
            const content = getEditableTextContent(targetRef.box);
            if (!content) return;
            const tmp = document.createElement('div');
            fragmentNodes.forEach(n => tmp.appendChild(n.cloneNode(true)));
            if (prepend) {
                const nextFrag = document.createDocumentFragment();
                while (content.firstChild) nextFrag.appendChild(content.firstChild);
                mergeContinuationNodes(tmp, nextFrag);
                content.innerHTML = '';
                while (tmp.firstChild) content.appendChild(tmp.firstChild);
            } else {
                mergeContinuationNodes(content, tmp);
            }
            content.normalize();
        } else if (targetRef.data) {
            const hydrated = hydrateSerializedFlowBox(targetRef.data);
            if (!hydrated) return;
            const content = getEditableTextContent(hydrated);
            if (!content) return;
            const tmp = document.createElement('div');
            fragmentNodes.forEach(n => tmp.appendChild(n.cloneNode(true)));
            if (prepend) {
                const nextFrag = document.createDocumentFragment();
                while (content.firstChild) nextFrag.appendChild(content.firstChild);
                mergeContinuationNodes(tmp, nextFrag);
                content.innerHTML = '';
                while (tmp.firstChild) content.appendChild(tmp.firstChild);
            } else {
                mergeContinuationNodes(content, tmp);
            }
            content.normalize();
            const ec = hydrated.querySelector('.element-content');
            if (ec) targetRef.data.innerHTML = ec.innerHTML;
        }
    }

    window.unlinkTextBox = function(box) {
        const boxRef = locateFlowBox(box);
        if (!boxRef) return false;
        const nextId = getFlowAttr(boxRef, 'data-next-box');
        const prevId = getFlowAttr(boxRef, 'data-prev-box');

        if (!nextId && !prevId) return false;

        let upstreamHeadRef = null;
        let downstreamHeadRef = null;
        let touchedOffPage = (boxRef.kind === 'data');

        if (nextId) {
            const nextRef = locateFlowBox(nextId);
            removeFlowAttr(boxRef, 'data-next-box');
            if (nextRef) {
                if (nextRef.kind === 'data') touchedOffPage = true;
                removeFlowAttr(nextRef, 'data-prev-box');
                cleanLeadingContinuationMarkerOnRef(nextRef);
                downstreamHeadRef = nextRef;
            }
            upstreamHeadRef = getTextFlowHeadRef(boxRef);
        } else if (prevId) {
            const prevRef = locateFlowBox(prevId);
            removeFlowAttr(boxRef, 'data-prev-box');
            cleanLeadingContinuationMarkerOnRef(boxRef);
            if (prevRef) {
                if (prevRef.kind === 'data') touchedOffPage = true;
                removeFlowAttr(prevRef, 'data-next-box');
                upstreamHeadRef = getTextFlowHeadRef(prevRef);
            }
            downstreamHeadRef = boxRef;
        }

        if (upstreamHeadRef) window.flowTextBoxes(upstreamHeadRef);
        if (downstreamHeadRef) window.flowTextBoxes(downstreamHeadRef);

        [boxRef, upstreamHeadRef, downstreamHeadRef].forEach(r => {
            if (!r) return;
            if (!getFlowAttr(r, 'data-next-box') && !getFlowAttr(r, 'data-prev-box')) {
                removeFlowAttr(r, 'data-text-overflow');
            }
        });

        if (touchedOffPage && typeof window.updateSidebar === 'function') window.updateSidebar();
        if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
        if (typeof window.updateTextFlowRibbonUI === 'function' && boxRef.kind === 'dom') window.updateTextFlowRibbonUI(boxRef.box);
        if (typeof window.pushHistory === 'function') window.pushHistory();
        return true;
    };

    window.handleLinkedBoxesRemoved = function(removedEls) {
        if (!removedEls || removedEls.length === 0) return;
        const removedSet = new Set(removedEls);
        const removedIds = new Set(removedEls.map(b => b && b.id).filter(Boolean));
        const headsToReflow = new Map();
        let touchedOffPage = false;

        const isRemovedRef = (r) => {
            if (!r) return false;
            if (r.kind === 'dom') return removedSet.has(r.box) || (r.id && removedIds.has(r.id));
            return r.id ? removedIds.has(r.id) : false;
        };

        removedEls.forEach(box => {
            if (!box || !box.getAttribute) return;
            const prevId = box.getAttribute('data-prev-box');
            const nextId = box.getAttribute('data-next-box');
            if (!prevId && !nextId) return;

            // Find nearest surviving prev (same page or cross-page)
            let prevRef = prevId ? locateFlowBox(prevId) : null;
            const seenPrev = new Set();
            while (prevRef && isRemovedRef(prevRef) && !seenPrev.has(prevRef.id || prevRef.box)) {
                seenPrev.add(prevRef.id || prevRef.box);
                const pId = getFlowAttr(prevRef, 'data-prev-box');
                prevRef = pId ? locateFlowBox(pId) : null;
            }

            // Find nearest surviving next (same page or cross-page)
            let nextRef = nextId ? locateFlowBox(nextId) : null;
            const seenNext = new Set();
            while (nextRef && isRemovedRef(nextRef) && !seenNext.has(nextRef.id || nextRef.box)) {
                seenNext.add(nextRef.id || nextRef.box);
                const nId = getFlowAttr(nextRef, 'data-next-box');
                nextRef = nId ? locateFlowBox(nId) : null;
            }

            const boxContent = getEditableTextContent(box);
            const childNodesArr = boxContent ? Array.from(boxContent.childNodes) : [];

            if (prevRef && nextRef) {
                const prevIdRes = ensureFlowRefId(prevRef);
                const nextIdRes = ensureFlowRefId(nextRef);
                setFlowAttr(prevRef, 'data-next-box', nextIdRes);
                setFlowAttr(nextRef, 'data-prev-box', prevIdRes);
                if (prevRef.kind === 'data' || nextRef.kind === 'data') touchedOffPage = true;
                if (childNodesArr.length > 0) {
                    mergeSerializedHtmlIntoRef(prevRef, childNodesArr, false);
                }
                const hRef = getTextFlowHeadRef(prevRef);
                if (hRef) headsToReflow.set(ensureFlowRefId(hRef) || hRef.id, hRef);
            } else if (prevRef) {
                removeFlowAttr(prevRef, 'data-next-box');
                if (prevRef.kind === 'data') touchedOffPage = true;
                if (childNodesArr.length > 0) {
                    mergeSerializedHtmlIntoRef(prevRef, childNodesArr, false);
                }
                const hRef = getTextFlowHeadRef(prevRef);
                if (hRef) headsToReflow.set(ensureFlowRefId(hRef) || hRef.id, hRef);
            } else if (nextRef) {
                removeFlowAttr(nextRef, 'data-prev-box');
                cleanLeadingContinuationMarkerOnRef(nextRef);
                if (nextRef.kind === 'data') touchedOffPage = true;
                if (childNodesArr.length > 0) {
                    mergeSerializedHtmlIntoRef(nextRef, childNodesArr, true);
                }
                headsToReflow.set(ensureFlowRefId(nextRef) || nextRef.id, nextRef);
            }

            box.removeAttribute('data-prev-box');
            box.removeAttribute('data-next-box');
            box.removeAttribute('data-text-overflow');
        });

        headsToReflow.forEach(hRef => {
            if (!isRemovedRef(hRef)) {
                window.flowTextBoxes(hRef);
            }
        });
        if (touchedOffPage && typeof window.updateSidebar === 'function') {
            window.updateSidebar();
        }
    };

    function collectLinkedChainRefsForElements(els) {
        const list = Array.isArray(els) ? els : (els ? [els] : []);
        const seenKeys = new Set();
        const refs = [];
        const pageSet = new Set();
        let linkedTriggerCount = 0;

        list.forEach(el => {
            if (!el || !el.getAttribute) return;
            if (!el.getAttribute('data-next-box') && !el.getAttribute('data-prev-box')) return;
            linkedTriggerCount++;
            const headRef = getTextFlowHeadRef(el);
            const chainRefs = getTextFlowChainRefs(headRef);
            chainRefs.forEach(r => {
                const key = r.id || (r.kind === 'dom' ? r.box : r.data);
                if (key && !seenKeys.has(key)) {
                    seenKeys.add(key);
                    refs.push(r);
                    if (typeof r.pageIndex === 'number') pageSet.add(r.pageIndex + 1);
                }
            });
        });

        return {
            hasLinked: refs.length > 0 && linkedTriggerCount > 0,
            chainRefs: refs,
            totalLinkedCount: refs.length,
            pageNumbers: Array.from(pageSet).sort((a, b) => a - b)
        };
    }

    window.getLinkedChainInfoForElements = function(els) {
        return collectLinkedChainRefsForElements(els);
    };

    window.deleteAllLinkedTextBoxes = function(els) {
        const list = Array.isArray(els) ? els : (els ? [els] : []);
        const info = collectLinkedChainRefsForElements(list);
        const currPageIdx = getCurrentPageIdxSafe();
        const offPageIdsByPage = new Map();
        const domToRemove = new Set();

        info.chainRefs.forEach(r => {
            if (r.kind === 'dom' && r.box) {
                domToRemove.add(r.box);
            } else if (r.kind === 'data' && r.id && typeof r.pageIndex === 'number') {
                if (!offPageIdsByPage.has(r.pageIndex)) offPageIdsByPage.set(r.pageIndex, new Set());
                offPageIdsByPage.get(r.pageIndex).add(r.id);
            }
        });

        list.forEach(el => {
            if (el && el.nodeType === 1) domToRemove.add(el);
        });

        domToRemove.forEach(el => {
            if (el && el.remove) el.remove();
        });

        let touchedOffPage = false;
        if (typeof state !== 'undefined' && Array.isArray(state.pages)) {
            offPageIdsByPage.forEach((idSet, pIdx) => {
                if (pIdx === currPageIdx) return;
                const page = state.pages[pIdx];
                if (page && Array.isArray(page.elements)) {
                    const beforeLen = page.elements.length;
                    page.elements = page.elements.filter(item => !item || !idSet.has(item.id));
                    if (page.elements.length !== beforeLen) touchedOffPage = true;
                }
            });
        }

        if (typeof state !== 'undefined') {
            state.selectedEl = null;
            state.multiSelected = [];
        }
        const ft = (typeof floatToolbar !== 'undefined' ? floatToolbar : null) || document.getElementById('float-toolbar');
        if (ft) ft.style.display = 'none';
        const waFt = document.getElementById('wa-float-toolbar');
        if (waFt) waFt.style.display = 'none';
        if (window.ProgressBarEngine && typeof window.ProgressBarEngine.hideToolbar === 'function') {
            window.ProgressBarEngine.hideToolbar();
        }
        const status = document.getElementById('status-msg');
        if (status) status.innerText = 'Ready';

        if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
        if (touchedOffPage && typeof window.updateSidebar === 'function') window.updateSidebar();
        if (typeof window.pushHistory === 'function') window.pushHistory();
        if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
        return true;
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

    function navigateToLinkedBox(targetRef) {
        if (!targetRef) return;
        if (targetRef.kind === 'dom' && document.contains(targetRef.box)) {
            if (typeof window.selectElement === 'function') window.selectElement(targetRef.box);
            return;
        }
        if (typeof targetRef.pageIndex === 'number' && typeof window.switchPage === 'function') {
            window.switchPage(targetRef.pageIndex);
            requestAnimationFrame(() => {
                const switchedEl = targetRef.id ? document.getElementById(targetRef.id) : null;
                if (switchedEl && typeof window.selectElement === 'function') {
                    window.selectElement(switchedEl);
                }
            });
        }
    }

    // --- Visual Chain Overlay Connectors, Cross-Page Badges & Overflow Indicators ---
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

        const headRef = getTextFlowHeadRef(activeEl);
        const chainRefs = getTextFlowChainRefs(headRef);
        if (chainRefs.length < 2) return;

        const currPageIdx = getCurrentPageIdxSafe();
        const svgNS = 'http://www.w3.org/2000/svg';
        const layer = document.createElement('div');
        layer.className = 'op-textflow-overlay';
        // Layer above .selected-overlay (999999) so cross-page navigation badges are never blocked by selection border drag bars
        layer.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:1000020;';

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

        for (let i = 0; i < chainRefs.length - 1; i++) {
            const r1 = chainRefs[i];
            const r2 = chainRefs[i + 1];
            if (r1.kind !== 'dom' || r2.kind !== 'dom') continue;
            if (r1.pageIndex !== currPageIdx || r2.pageIndex !== currPageIdx) continue;
            if (!isLivePaperFlowEl(r1.box) || !isLivePaperFlowEl(r2.box)) continue;

            const b1 = r1.box;
            const b2 = r2.box;

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

        const bindPillNavigation = (pillEl, targetRef) => {
            let lastHandledTs = 0;
            pillEl.className = 'op-textflow-pill';
            pillEl.addEventListener('pointerdown', (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
            });
            pillEl.addEventListener('mousedown', (ev) => {
                if (ev.button !== 0) return;
                ev.stopPropagation();
                ev.preventDefault();
                lastHandledTs = Date.now();
                navigateToLinkedBox(targetRef);
            });
            pillEl.addEventListener('click', (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                if (Date.now() - lastHandledTs > 250) {
                    navigateToLinkedBox(targetRef);
                }
            });
        };

        // Outline on-page linked frames, add step chips (1, 2, 3...), and cross-page navigation pills
        chainRefs.forEach((itemRef, idx) => {
            if (itemRef.kind !== 'dom' || itemRef.pageIndex !== currPageIdx || !isLivePaperFlowEl(itemRef.box)) return;
            const b = itemRef.box;
            const l = parseFloat(b.style.left) || b.offsetLeft;
            const t = parseFloat(b.style.top) || b.offsetTop;
            const w = parseFloat(b.style.width) || b.offsetWidth;
            const h = parseFloat(b.style.height) || b.offsetHeight;

            if (b !== activeEl) {
                const outline = document.createElement('div');
                outline.style.cssText = `position:absolute; left:${l}px; top:${t}px; width:${w}px; height:${h}px; transform:${b.style.transform || 'none'}; border:1.5px dashed rgba(0,118,112,0.75); box-sizing:border-box; pointer-events:none;`;
                layer.appendChild(outline);
            }

            const prevRef = idx > 0 ? chainRefs[idx - 1] : null;
            if (prevRef && prevRef.pageIndex !== currPageIdx) {
                const prevPill = document.createElement('div');
                prevPill.title = `Flows from Page ${prevRef.pageIndex + 1} (click to jump)`;
                prevPill.style.cssText = `position:absolute; left:${l + 10}px; top:${t + 6}px; height:18px; padding:0 7px; border-radius:9px; background:#0f766e; color:#fff; font:700 10px/18px 'Segoe UI',sans-serif; pointer-events:auto; cursor:pointer; z-index:1000021; box-shadow:0 1px 4px rgba(0,0,0,0.28); user-select:none;`;
                prevPill.textContent = `\u2190 P${prevRef.pageIndex + 1}`;
                bindPillNavigation(prevPill, prevRef);
                layer.appendChild(prevPill);
            }

            const nextRef = idx < chainRefs.length - 1 ? chainRefs[idx + 1] : null;
            if (nextRef && nextRef.pageIndex !== currPageIdx) {
                const nextPill = document.createElement('div');
                nextPill.title = `Continues on Page ${nextRef.pageIndex + 1} (click to jump)`;
                nextPill.style.cssText = `position:absolute; left:${Math.max(l + 8, l + w - 70)}px; top:${t + h - 22}px; height:18px; padding:0 7px; border-radius:9px; background:#0f766e; color:#fff; font:700 10px/18px 'Segoe UI',sans-serif; pointer-events:auto; cursor:pointer; z-index:1000021; box-shadow:0 1px 4px rgba(0,0,0,0.28); user-select:none;`;
                nextPill.textContent = `#${idx + 1} \u2192 P${nextRef.pageIndex + 1}`;
                bindPillNavigation(nextPill, nextRef);
                layer.appendChild(nextPill);
            } else {
                const chip = document.createElement('div');
                chip.title = `Linked Story Box #${idx + 1}`;
                chip.style.cssText = `position:absolute; left:${l + w - 24}px; top:${t + h - 22}px; min-width:18px; height:18px; padding:0 5px; border-radius:9px; background:${b.getAttribute('data-text-overflow') === 'true' ? '#dc2626' : '#007670'}; color:#fff; font:700 10px/18px 'Segoe UI',sans-serif; text-align:center; pointer-events:auto; cursor:pointer; z-index:1000021; box-shadow:0 1px 4px rgba(0,0,0,0.28); user-select:none;`;
                chip.textContent = (b.getAttribute('data-text-overflow') === 'true') ? `${idx + 1}+` : `${idx + 1}`;
                bindPillNavigation(chip, itemRef);
                layer.appendChild(chip);
            }
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
