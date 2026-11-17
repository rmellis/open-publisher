/**
 * OpenPublisher References Engine (v5.22.8)
 * Modular architecture providing Table of Contents (TOC) based on headings,
 * Footnotes anchored to current page, and Endnotes collected at document end.
 *
 * Implements GitHub Issue #13.
 */

(function(window) {
    'use strict';

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttr(str) {
        return String(str == null ? '' : str)
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function toRoman(num) {
        const val = parseInt(num, 10) || 1;
        const lookup = { m: 1000, cm: 900, d: 500, cd: 400, c: 100, xc: 90, l: 50, xl: 40, x: 10, ix: 9, v: 5, iv: 4, i: 1 };
        let roman = '';
        let n = val;
        for (let k in lookup) {
            while (n >= lookup[k]) {
                roman += k;
                n -= lookup[k];
            }
        }
        return roman || String(val);
    }

    const ReferencesEngine = {
        _lastSavedRange: null,
        _lastSavedEditable: null,

        saveCurrentSelection: function() {
            try {
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                    const range = sel.getRangeAt(0);
                    const container = range.commonAncestorContainer.nodeType === 1
                        ? range.commonAncestorContainer
                        : range.commonAncestorContainer.parentElement;
                    const editable = container ? container.closest('[contenteditable="true"]') : null;
                    if (editable) {
                        this._lastSavedRange = range.cloneRange();
                        this._lastSavedEditable = editable;
                        return;
                    }
                }
            } catch (err) {
                // Ignore selection capture error
            }
            if (typeof state !== 'undefined' && state.selectedEl) {
                const ed = state.selectedEl.querySelector('[contenteditable="true"]');
                if (ed) {
                    this._lastSavedEditable = ed;
                }
            }
        },

        /* =========================================================================
         * 1. HEADING LEVELS (H1, H2, H3, Body)
         * ========================================================================= */
        applyHeadingLevel: function(level) {
            const numLevel = parseInt(level, 10) || 0;
            const paper = document.getElementById('paper');
            if (!paper) return;

            let targetEditable = null;
            let currentSel = null;
            try {
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                    const container = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement);
                    if (container && container.closest('#paper [contenteditable="true"]')) {
                        targetEditable = container.closest('#paper [contenteditable="true"]');
                        currentSel = sel;
                    }
                }
            } catch (e) {}

            if (!targetEditable && typeof state !== 'undefined' && state.selectedEl) {
                targetEditable = state.selectedEl.querySelector('[contenteditable="true"]');
            }

            if (!targetEditable) {
                // If no text box selected, offer to create one with the chosen heading
                if (typeof window.addTextBox === 'function') {
                    const newEl = window.addTextBox();
                    if (newEl) {
                        targetEditable = newEl.querySelector('[contenteditable="true"]');
                    }
                }
            }

            if (!targetEditable) return;

            const boxEl = targetEditable.closest('.pub-element');

            if (numLevel === 0) {
                // Normal Body Text
                if (boxEl) {
                    boxEl.removeAttribute('data-heading-level');
                }
                const block = this._getActiveBlock(targetEditable);
                if (block && block !== targetEditable) {
                    const p = document.createElement('p');
                    p.innerHTML = block.innerHTML;
                    p.style.fontSize = '12pt';
                    p.style.fontWeight = 'normal';
                    p.style.margin = '0 0 4px 0';
                    p.style.lineHeight = '1.4';
                    block.parentNode.replaceChild(p, block);
                } else {
                    targetEditable.style.fontSize = '12pt';
                    targetEditable.style.fontWeight = 'normal';
                }
            } else {
                // Heading 1, 2, or 3
                const tag = 'h' + numLevel;
                const size = numLevel === 1 ? '24pt' : (numLevel === 2 ? '18pt' : '14pt');
                const margin = numLevel === 1 ? '0 0 8px 0' : (numLevel === 2 ? '0 0 6px 0' : '0 0 4px 0');

                if (boxEl) {
                    boxEl.setAttribute('data-heading-level', String(numLevel));
                }

                const block = this._getActiveBlock(targetEditable);
                if (block && block !== targetEditable) {
                    const heading = document.createElement(tag);
                    heading.setAttribute('data-heading-level', String(numLevel));
                    heading.innerHTML = block.innerHTML;
                    heading.style.fontSize = size;
                    heading.style.fontWeight = 'bold';
                    heading.style.margin = margin;
                    heading.style.lineHeight = '1.25';
                    block.parentNode.replaceChild(heading, block);
                } else {
                    const rawHtml = targetEditable.innerHTML.trim();
                    const heading = document.createElement(tag);
                    heading.setAttribute('data-heading-level', String(numLevel));
                    heading.innerHTML = rawHtml || ('Heading ' + numLevel);
                    heading.style.fontSize = size;
                    heading.style.fontWeight = 'bold';
                    heading.style.margin = margin;
                    heading.style.lineHeight = '1.25';
                    targetEditable.innerHTML = '';
                    targetEditable.appendChild(heading);
                }
            }

            if (typeof window.pushHistory === 'function') {
                window.pushHistory();
            }
        },

        _getActiveBlock: function(editable) {
            try {
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                    let node = sel.anchorNode;
                    while (node && node !== editable) {
                        if (node.nodeType === 1 && /^(p|div|h1|h2|h3|h4|h5|h6|li|blockquote)$/i.test(node.tagName)) {
                            return node;
                        }
                        node = node.parentNode;
                    }
                }
            } catch (e) {}
            // Fallback: first block child or editable itself
            const firstChild = editable.firstElementChild;
            if (firstChild && /^(p|div|h1|h2|h3|h4|h5|h6)$/i.test(firstChild.tagName)) {
                return firstChild;
            }
            return editable;
        },

        /* =========================================================================
         * 2. SCANNING HEADINGS ACROSS ALL PAGES
         * ========================================================================= */
        scanHeadings: function(options) {
            options = options || {};
            const autoDetect = options.autoDetectLargeText !== false;
            const incH1 = options.h1 !== false;
            const incH2 = options.h2 !== false;
            const incH3 = options.h3 !== false;

            const headings = [];

            // 1. Sync live paper to state.pages
            if (typeof window.serializeCurrentPage === 'function' && typeof state !== 'undefined' && state.pages) {
                state.pages[state.currentPageIndex] = window.serializeCurrentPage();
            }

            const totalPages = (typeof state !== 'undefined' && state.pages && state.pages.length) ? state.pages.length : 1;

            for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
                const pageNum = pageIdx + 1;

                if (typeof state !== 'undefined' && pageIdx === state.currentPageIndex) {
                    // Scan live #paper for active page
                    const paper = document.getElementById('paper');
                    if (paper) {
                        const boxes = Array.from(paper.querySelectorAll('.pub-element')).filter(el => {
                            if (el.getAttribute('data-toc-box') === 'true') return false;
                            if (el.getAttribute('data-footnote-box') === 'true') return false;
                            if (el.getAttribute('data-endnote-box') === 'true') return false;
                            return el.querySelector('[contenteditable="true"]') !== null;
                        });

                        boxes.sort((a, b) => {
                            const topA = parseFloat(a.style.top) || a.offsetTop || 0;
                            const topB = parseFloat(b.style.top) || b.offsetTop || 0;
                            if (Math.abs(topA - topB) > 10) return topA - topB;
                            const leftA = parseFloat(a.style.left) || a.offsetLeft || 0;
                            const leftB = parseFloat(b.style.left) || b.offsetLeft || 0;
                            return leftA - leftB;
                        });

                        boxes.forEach(box => {
                            const found = this._extractHeadingsFromElement(box, autoDetect);
                            found.forEach(h => {
                                if ((h.level === 1 && incH1) || (h.level === 2 && incH2) || (h.level === 3 && incH3)) {
                                    headings.push({
                                        level: h.level,
                                        text: h.text,
                                        pageNumber: pageNum,
                                        pageIndex: pageIdx
                                    });
                                }
                            });
                        });
                    }
                } else if (typeof state !== 'undefined' && state.pages && state.pages[pageIdx]) {
                    // Scan stored page elements
                    const pData = state.pages[pageIdx];
                    const elements = pData.elements || [];

                    const sortedElements = elements.slice().sort((a, b) => {
                        const topA = parseFloat(a.top) || 0;
                        const topB = parseFloat(b.top) || 0;
                        if (Math.abs(topA - topB) > 10) return topA - topB;
                        const leftA = parseFloat(a.left) || 0;
                        const leftB = parseFloat(b.left) || 0;
                        return leftA - leftB;
                    });

                    sortedElements.forEach(data => {
                        const fa = data.filterAttributes || {};
                        if (fa['data-toc-box'] === 'true' || fa['data-footnote-box'] === 'true' || fa['data-endnote-box'] === 'true') {
                            return;
                        }

                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = data.innerHTML || '';
                        const explicitLevel = fa['data-heading-level'] ? parseInt(fa['data-heading-level'], 10) : 0;

                        const found = this._extractHeadingsFromHtml(tempDiv, explicitLevel, autoDetect);
                        found.forEach(h => {
                            if ((h.level === 1 && incH1) || (h.level === 2 && incH2) || (h.level === 3 && incH3)) {
                                headings.push({
                                    level: h.level,
                                    text: h.text,
                                    pageNumber: pageNum,
                                    pageIndex: pageIdx
                                });
                            }
                        });
                    });
                }
            }

            return headings;
        },

        _extractHeadingsFromElement: function(boxEl, autoDetect) {
            const results = [];
            const explicitAttr = boxEl.getAttribute('data-heading-level');
            const explicitLevel = explicitAttr ? parseInt(explicitAttr, 10) : 0;

            const editable = boxEl.querySelector('[contenteditable="true"]');
            if (!editable) return results;

            // Check tags inside editable
            const headingNodes = editable.querySelectorAll('h1, h2, h3, [data-heading-level]');
            if (headingNodes.length > 0) {
                headingNodes.forEach(node => {
                    let lvl = 1;
                    if (node.hasAttribute('data-heading-level')) {
                        lvl = parseInt(node.getAttribute('data-heading-level'), 10) || 1;
                    } else if (node.tagName.toLowerCase() === 'h1') lvl = 1;
                    else if (node.tagName.toLowerCase() === 'h2') lvl = 2;
                    else if (node.tagName.toLowerCase() === 'h3') lvl = 3;

                    const cleanText = (node.innerText || node.textContent || '').trim();
                    if (cleanText.length > 0) {
                        results.push({ level: Math.min(3, Math.max(1, lvl)), text: cleanText });
                    }
                });
                return results;
            }

            if (explicitLevel >= 1 && explicitLevel <= 3) {
                const cleanText = (editable.innerText || editable.textContent || '').trim();
                if (cleanText.length > 0) {
                    results.push({ level: explicitLevel, text: cleanText });
                    return results;
                }
            }

            // Auto-detect large or bold text if enabled
            if (autoDetect) {
                const textNodes = editable.querySelectorAll('p, div, span, b, strong');
                let foundLarge = false;
                textNodes.forEach(node => {
                    if (foundLarge) return;
                    const fs = parseFloat(window.getComputedStyle(node).fontSize) || 0;
                    const fw = window.getComputedStyle(node).fontWeight;
                    const isBold = fw === 'bold' || parseInt(fw, 10) >= 700;
                    const text = (node.innerText || node.textContent || '').trim();
                    if (text.length > 0 && text.length < 120) {
                        if (fs >= 28 || (fs >= 22 && isBold)) {
                            results.push({ level: 1, text: text });
                            foundLarge = true;
                        } else if (fs >= 20 || (fs >= 17 && isBold)) {
                            results.push({ level: 2, text: text });
                            foundLarge = true;
                        }
                    }
                });

                if (!foundLarge) {
                    const directFs = parseFloat(window.getComputedStyle(editable).fontSize) || 0;
                    const directFw = window.getComputedStyle(editable).fontWeight;
                    const isDirectBold = directFw === 'bold' || parseInt(directFw, 10) >= 700;
                    const directText = (editable.innerText || editable.textContent || '').trim();
                    if (directText.length > 0 && directText.length < 120) {
                        if (directFs >= 28 || (directFs >= 22 && isDirectBold)) {
                            results.push({ level: 1, text: directText });
                        } else if (directFs >= 20 || (directFs >= 17 && isDirectBold)) {
                            results.push({ level: 2, text: directText });
                        }
                    }
                }
            }

            return results;
        },

        _extractHeadingsFromHtml: function(container, explicitLevel, autoDetect) {
            const results = [];
            const headingNodes = container.querySelectorAll('h1, h2, h3, [data-heading-level]');
            if (headingNodes.length > 0) {
                headingNodes.forEach(node => {
                    let lvl = 1;
                    if (node.hasAttribute('data-heading-level')) {
                        lvl = parseInt(node.getAttribute('data-heading-level'), 10) || 1;
                    } else if (node.tagName.toLowerCase() === 'h1') lvl = 1;
                    else if (node.tagName.toLowerCase() === 'h2') lvl = 2;
                    else if (node.tagName.toLowerCase() === 'h3') lvl = 3;

                    const cleanText = (node.innerText || node.textContent || '').trim();
                    if (cleanText.length > 0) {
                        results.push({ level: Math.min(3, Math.max(1, lvl)), text: cleanText });
                    }
                });
                return results;
            }

            if (explicitLevel >= 1 && explicitLevel <= 3) {
                const cleanText = (container.innerText || container.textContent || '').trim();
                if (cleanText.length > 0) {
                    results.push({ level: explicitLevel, text: cleanText });
                    return results;
                }
            }

            if (autoDetect) {
                const allElements = container.querySelectorAll('*');
                allElements.forEach(el => {
                    const style = el.getAttribute('style') || '';
                    const sizeMatch = style.match(/font-size:\s*(\d+(?:\.\d+)?)(px|pt)/i);
                    const isBold = /font-weight:\s*(?:bold|[7-9]00)/i.test(style) || el.tagName.toLowerCase() === 'b' || el.tagName.toLowerCase() === 'strong';
                    if (sizeMatch) {
                        let px = parseFloat(sizeMatch[1]);
                        if (sizeMatch[2].toLowerCase() === 'pt') px = px * 1.333;
                        const text = (el.innerText || el.textContent || '').trim();
                        if (text.length > 0 && text.length < 120) {
                            if (px >= 28 || (px >= 22 && isBold)) {
                                results.push({ level: 1, text: text });
                            } else if (px >= 20 || (px >= 17 && isBold)) {
                                results.push({ level: 2, text: text });
                            }
                        }
                    }
                });
            }

            return results;
        },

        /* =========================================================================
         * 3. INSERT OR UPDATE TABLE OF CONTENTS (TOC)
         * ========================================================================= */
        insertOrUpdateTOC: function(options) {
            options = options || {};
            const title = options.title || 'Table of Contents';
            const leaderStyle = options.leaderStyle || 'dots'; // 'dots', 'dashes', 'none'
            const headings = this.scanHeadings(options);

            const paper = document.getElementById('paper');
            if (!paper) return;

            // Search for existing TOC box on current page
            let tocBox = paper.querySelector('.pub-element[data-toc-box="true"]');

            if (!tocBox) {
                if (typeof window.addTextBox === 'function') {
                    tocBox = window.addTextBox();
                }
                if (!tocBox) return;

                tocBox.setAttribute('data-toc-box', 'true');
                tocBox.style.left = '60px';
                tocBox.style.top = '70px';
                tocBox.style.width = '520px';
                tocBox.style.height = '340px';
            }

            const editable = tocBox.querySelector('[contenteditable="true"]');
            if (!editable) return;

            let borderStyle = 'border-bottom: 1px dotted #718096;';
            if (leaderStyle === 'dashes') {
                borderStyle = 'border-bottom: 1px dashed #718096;';
            } else if (leaderStyle === 'none') {
                borderStyle = 'border-bottom: none;';
            }

            let rowsHtml = '';
            if (headings.length === 0) {
                rowsHtml = `
                    <div style="padding: 18px 0; color: #718096; font-style: italic; font-size: 11pt; text-align: center;">
                        No headings found in publication. Mark headings using H1 / H2 / H3 in the ribbon or context menu, then click Update TOC.
                    </div>
                `;
            } else {
                headings.forEach(item => {
                    const indentPx = (item.level - 1) * 22;
                    const fontSize = item.level === 1 ? '11.5pt' : (item.level === 2 ? '10.5pt' : '10pt');
                    const fontWeight = item.level === 1 ? 'bold' : 'normal';
                    const color = item.level === 1 ? '#0f172a' : '#334155';

                    rowsHtml += `
                        <div class="op-toc-row" data-toc-level="${item.level}" style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 7px; padding-left: ${indentPx}px; font-size: ${fontSize}; font-weight: ${fontWeight}; color: ${color};">
                            <span class="op-toc-entry-text" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 78%; cursor: pointer;" title="Go to Page ${item.pageNumber}">${escapeHtml(item.text)}</span>
                            <span class="op-toc-leader" style="flex: 1; margin: 0 8px; transform: translateY(-4px); ${borderStyle}"></span>
                            <span class="op-toc-page-num" style="min-width: 22px; text-align: right; font-weight: bold; color: var(--ui-theme-dark, #007670);">${item.pageNumber}</span>
                        </div>
                    `;
                });
            }

            editable.innerHTML = `
                <div class="op-toc-container" style="font-family: inherit; width: 100%; height: 100%; box-sizing: border-box; outline: none;">
                    <div class="op-toc-header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid var(--ui-theme-color, #007670); padding-bottom: 6px; margin-bottom: 14px;">
                        <span class="op-toc-title" style="font-size: 18pt; font-weight: 700; color: var(--ui-theme-dark, #007670);">${escapeHtml(title)}</span>
                        <span class="op-toc-update-badge" onclick="window.insertOrUpdateTOC(); event.stopPropagation();" title="Click to refresh Table of Contents" style="font-size: 10px; font-weight: 600; background: var(--ui-theme-color, #007670); color: #fff; padding: 3px 8px; border-radius: 4px; cursor: pointer; user-select: none;">Update TOC</span>
                    </div>
                    <div class="op-toc-entries">
                        ${rowsHtml}
                    </div>
                </div>
            `;

            if (typeof window.selectElement === 'function') {
                window.selectElement(tocBox);
            }
            if (typeof window.pushHistory === 'function') {
                window.pushHistory();
            }
        },

        /* =========================================================================
         * 4. TOC MODAL DIALOG
         * ========================================================================= */
        showTOCModal: function() {
            this._removeModalOverlay();

            const headings = this.scanHeadings({ h1: true, h2: true, h3: true, autoDetectLargeText: true });

            let previewItemsHtml = '';
            if (headings.length === 0) {
                previewItemsHtml = '<div style="color: #64748b; font-style: italic; padding: 12px; font-size: 12px; text-align: center;">No headings detected yet. Mark text with H1 / H2 / H3 or use bold text >= 18pt.</div>';
            } else {
                headings.forEach(h => {
                    const tagBadge = `<span style="display:inline-block; font-size:9px; font-weight:bold; background:rgba(0,118,112,0.12); color:#007670; padding:1px 5px; border-radius:3px; margin-right:6px;">H${h.level}</span>`;
                    previewItemsHtml += `
                        <div style="display:flex; align-items:center; justify-content:space-between; padding:5px 8px; font-size:12px; border-bottom:1px solid #f1f5f9;">
                            <div style="display:flex; align-items:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:82%;">
                                ${tagBadge}
                                <span>${escapeHtml(h.text)}</span>
                            </div>
                            <span style="font-weight:bold; color:#007670; font-size:11px;">Page ${h.pageNumber}</span>
                        </div>
                    `;
                });
            }

            const modalHtml = `
                <div class="op-ref-modal-backdrop" id="op-toc-modal-backdrop" onclick="window.ReferencesEngine._removeModalOverlay()"></div>
                <div class="op-ref-modal-window" id="op-toc-modal-window" role="dialog" aria-modal="true" aria-labelledby="op-toc-modal-title">
                    <div class="op-ref-modal-header">
                        <div style="display:flex; align-items:center; gap:8px; font-weight:700; font-size:15px;">
                            <i class="fas fa-list-ol"></i>
                            <span id="op-toc-modal-title">Table of Contents Builder</span>
                        </div>
                        <div class="op-ref-header-actions">
                            <span role="button" tabindex="0" class="custom-dialog-close op-ref-help-icon-btn" onclick="window.ReferencesEngine.showHelpModal('toc')" title="Table of Contents Help" aria-label="Help"><i class="fas fa-question"></i></span>
                            <span role="button" tabindex="0" class="custom-dialog-close" onclick="window.ReferencesEngine._removeModalOverlay()" title="Close" aria-label="Close"><i class="fas fa-times"></i></span>
                        </div>
                    </div>
                    <div class="op-ref-modal-body">
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; margin-bottom:14px;">
                            <div>
                                <label class="op-ref-label">TOC Title</label>
                                <input type="text" id="op-toc-input-title" class="op-ref-input" value="Table of Contents">
                            </div>
                            <div>
                                <label class="op-ref-label" for="op-toc-input-leader">Tab Leader Style</label>
                                <select id="op-toc-input-leader" class="op-ref-select">
                                    <option value="dots" selected>Dots ( . . . . . . . . . . . )</option>
                                    <option value="dashes">Dashes ( - - - - - - - - )</option>
                                    <option value="none">None</option>
                                </select>
                            </div>
                        </div>

                        <div class="op-ref-section-card">
                            <div class="op-ref-card-title">Included Heading Levels</div>
                            <div style="display:flex; gap:16px; margin-top:6px;">
                                <label style="display:flex; align-items:center; gap:6px; font-size:12px; cursor:pointer;">
                                    <input type="checkbox" id="op-toc-check-h1" checked style="accent-color:var(--ui-theme-color,#007670);">
                                    <span>Heading 1 (H1)</span>
                                </label>
                                <label style="display:flex; align-items:center; gap:6px; font-size:12px; cursor:pointer;">
                                    <input type="checkbox" id="op-toc-check-h2" checked style="accent-color:var(--ui-theme-color,#007670);">
                                    <span>Heading 2 (H2)</span>
                                </label>
                                <label style="display:flex; align-items:center; gap:6px; font-size:12px; cursor:pointer;">
                                    <input type="checkbox" id="op-toc-check-h3" checked style="accent-color:var(--ui-theme-color,#007670);">
                                    <span>Heading 3 (H3)</span>
                                </label>
                            </div>
                            <label style="display:flex; align-items:center; gap:6px; font-size:11.5px; cursor:pointer; margin-top:8px; color:#475569;">
                                <input type="checkbox" id="op-toc-check-autodetect" checked style="accent-color:var(--ui-theme-color,#007670);">
                                <span>Auto-detect bold or large title text (&gt;= 18pt) as headings</span>
                            </label>
                        </div>

                        <div class="op-ref-section-card" style="margin-top:12px;">
                            <div class="op-ref-card-title" style="display:flex; justify-content:space-between; align-items:center;">
                                <span>Detected Headings Across All Pages (${headings.length})</span>
                                <span style="font-size:10px; font-weight:normal; text-transform:none; color:#64748b;">Visual reading order</span>
                            </div>
                            <div style="max-height:160px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:6px; margin-top:6px; background:#fff;">
                                ${previewItemsHtml}
                            </div>
                        </div>
                    </div>
                    <div class="op-ref-modal-footer">
                        <button type="button" class="op-ref-btn-secondary" onclick="window.ReferencesEngine._removeModalOverlay()">Cancel</button>
                        <button type="button" class="op-ref-btn-primary" onclick="window.ReferencesEngine._commitTOCFromModal()">Insert / Update TOC</button>
                    </div>
                </div>
            `;

            const wrap = document.createElement('div');
            wrap.id = 'op-references-modal-root';
            wrap.innerHTML = modalHtml;
            document.body.appendChild(wrap);

            const modalWin = document.getElementById('op-toc-modal-window');
            const modalHdr = modalWin ? modalWin.querySelector('.op-ref-modal-header') : null;
            if (typeof DialogSystem !== 'undefined' && typeof DialogSystem.convertNativeSelects === 'function') {
                DialogSystem.convertNativeSelects(modalWin);
            }
            this._makeDraggable(modalWin, modalHdr);

            setTimeout(() => {
                const titleInput = document.getElementById('op-toc-input-title');
                if (titleInput) titleInput.focus();
            }, 50);
        },

        _commitTOCFromModal: function() {
            const titleInput = document.getElementById('op-toc-input-title');
            const leaderInput = document.getElementById('op-toc-input-leader');
            const h1Check = document.getElementById('op-toc-check-h1');
            const h2Check = document.getElementById('op-toc-check-h2');
            const h3Check = document.getElementById('op-toc-check-h3');
            const autoCheck = document.getElementById('op-toc-check-autodetect');

            const options = {
                title: titleInput ? titleInput.value.trim() : 'Table of Contents',
                leaderStyle: leaderInput ? leaderInput.value : 'dots',
                h1: h1Check ? h1Check.checked : true,
                h2: h2Check ? h2Check.checked : true,
                h3: h3Check ? h3Check.checked : true,
                autoDetectLargeText: autoCheck ? autoCheck.checked : true
            };

            this._removeModalOverlay();
            this.insertOrUpdateTOC(options);
        },

        /* =========================================================================
         * 5. FOOTNOTES & ENDNOTES
         * ========================================================================= */
        showInsertNoteModal: function(defaultType, editNoteId) {
            this.saveCurrentSelection();
            this._removeModalOverlay();

            const isEndnote = defaultType === 'endnote';
            const allNotes = this.getAllNotes();

            let initialText = '';
            if (editNoteId) {
                const target = allNotes.find(n => n.id === editNoteId);
                if (target) {
                    initialText = target.text;
                }
            }

            let existingNotesListHtml = '';
            if (allNotes.length === 0) {
                existingNotesListHtml = '<div style="color: #64748b; font-style: italic; padding: 8px; font-size: 11.5px; text-align: center;">No notes in document yet.</div>';
            } else {
                allNotes.forEach(n => {
                    const typeBadge = n.type === 'footnote'
                        ? '<span style="background:rgba(0,118,112,0.14); color:var(--ui-theme-color,#007670); font-size:9.5px; font-weight:bold; padding:1px 5px; border-radius:3px;">Footnote</span>'
                        : '<span style="background:rgba(0,118,112,0.14); color:var(--ui-theme-dark,#004d49); font-size:9.5px; font-weight:bold; padding:1px 5px; border-radius:3px;">Endnote</span>';

                    existingNotesListHtml += `
                        <div style="display:flex; align-items:center; justify-content:space-between; padding:4px 8px; font-size:11.5px; border-bottom:1px solid #f1f5f9;">
                            <div style="display:flex; align-items:center; gap:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:75%;">
                                ${typeBadge}
                                <span style="font-weight:bold;">${escapeHtml(n.markerText)}</span>
                                <span style="color:#475569;">${escapeHtml(n.text)}</span>
                            </div>
                            <div style="display:flex; gap:4px;">
                                <button type="button" class="op-ref-mini-btn" onclick="window.ReferencesEngine.showInsertNoteModal('${n.type}', '${n.id}')" title="Edit Note"><i class="fas fa-edit"></i></button>
                                <button type="button" class="op-ref-mini-btn op-ref-mini-btn-del" onclick="window.ReferencesEngine.deleteNote('${n.id}')" title="Delete Note"><i class="fas fa-trash-alt"></i></button>
                            </div>
                        </div>
                    `;
                });
            }

            const modalHtml = `
                <div class="op-ref-modal-backdrop" id="op-note-modal-backdrop" onclick="window.ReferencesEngine._removeModalOverlay()"></div>
                <div class="op-ref-modal-window" id="op-note-modal-window" style="width: 480px;" role="dialog" aria-modal="true" aria-labelledby="op-note-modal-title">
                    <div class="op-ref-modal-header">
                        <div style="display:flex; align-items:center; gap:8px; font-weight:700; font-size:15px;">
                            <i class="fas ${isEndnote ? 'fa-book' : 'fa-file-alt'}"></i>
                            <span id="op-note-modal-title">${editNoteId ? 'Edit Reference Note' : 'Insert Footnote or Endnote'}</span>
                        </div>
                        <div class="op-ref-header-actions">
                            <span role="button" tabindex="0" class="custom-dialog-close op-ref-help-icon-btn" onclick="window.ReferencesEngine.showHelpModal('notes')" title="Footnotes and Endnotes Help" aria-label="Help"><i class="fas fa-question"></i></span>
                            <span role="button" tabindex="0" class="custom-dialog-close" onclick="window.ReferencesEngine._removeModalOverlay()" title="Close" aria-label="Close"><i class="fas fa-times"></i></span>
                        </div>
                    </div>
                    <div class="op-ref-modal-body">
                        ${editNoteId ? `<input type="hidden" id="op-note-edit-id" value="${escapeAttr(editNoteId)}">` : ''}
                        
                        <div style="margin-bottom:12px;">
                            <label class="op-ref-label">Reference Location</label>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                                <label class="op-ref-radio-card ${!isEndnote ? 'active' : ''}" id="op-note-card-fn">
                                    <input type="radio" name="op-note-type-radio" value="footnote" ${!isEndnote ? 'checked' : ''} onchange="document.getElementById('op-note-card-fn').classList.add('active'); document.getElementById('op-note-card-en').classList.remove('active');">
                                    <div>
                                        <div style="font-weight:700; font-size:12px; color:#00796b;">Footnote</div>
                                        <div style="font-size:10.5px; color:#64748b;">Bottom of current page</div>
                                    </div>
                                </label>
                                <label class="op-ref-radio-card ${isEndnote ? 'active' : ''}" id="op-note-card-en">
                                    <input type="radio" name="op-note-type-radio" value="endnote" ${isEndnote ? 'checked' : ''} onchange="document.getElementById('op-note-card-en').classList.add('active'); document.getElementById('op-note-card-fn').classList.remove('active');">
                                    <div>
                                        <div style="font-weight:700; font-size:12px; color:var(--ui-theme-dark,#007670);">Endnote</div>
                                        <div style="font-size:10.5px; color:#64748b;">End of publication</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div style="margin-bottom:14px;">
                            <label class="op-ref-label" for="op-note-text-input">Note Text / Citation</label>
                            <textarea id="op-note-text-input" class="op-ref-textarea" placeholder="Type source citation, explanatory note, or reference...">${escapeHtml(initialText)}</textarea>
                            <div style="font-size:10.5px; color:#64748b; margin-top:4px;">
                                Drops a superscript marker at the cursor and anchors a formatted note box automatically.
                            </div>
                        </div>

                        <div class="op-ref-section-card">
                            <div class="op-ref-card-title" style="display:flex; justify-content:space-between; align-items:center;">
                                <span>Document Notes (${allNotes.length})</span>
                                <button type="button" class="op-ref-link-btn" onclick="window.ReferencesEngine.updateAllReferences(); window.ReferencesEngine.showInsertNoteModal('${defaultType}')">Update All</button>
                            </div>
                            <div style="max-height:110px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:5px; margin-top:6px; background:#fff;">
                                ${existingNotesListHtml}
                            </div>
                        </div>
                    </div>
                    <div class="op-ref-modal-footer">
                        <button type="button" class="op-ref-btn-secondary" onclick="window.ReferencesEngine._removeModalOverlay()">Cancel</button>
                        <button type="button" class="op-ref-btn-primary" onclick="window.ReferencesEngine._commitNoteFromModal()">${editNoteId ? 'Save Note' : 'Insert Reference'}</button>
                    </div>
                </div>
            `;

            const wrap = document.createElement('div');
            wrap.id = 'op-references-modal-root';
            wrap.innerHTML = modalHtml;
            document.body.appendChild(wrap);

            const modalWin = document.getElementById('op-note-modal-window');
            const modalHdr = modalWin ? modalWin.querySelector('.op-ref-modal-header') : null;
            this._makeDraggable(modalWin, modalHdr);

            setTimeout(() => {
                const ta = document.getElementById('op-note-text-input');
                if (ta) ta.focus();
            }, 50);
        },

        _commitNoteFromModal: function() {
            const ta = document.getElementById('op-note-text-input');
            const noteText = ta ? ta.value.trim() : '';
            if (!noteText) {
                alert('Please enter note text or citation.');
                return;
            }

            const editIdInput = document.getElementById('op-note-edit-id');
            const editId = editIdInput ? editIdInput.value : null;

            const typeRadio = document.querySelector('input[name="op-note-type-radio"]:checked');
            const noteType = typeRadio ? typeRadio.value : 'footnote';

            this._removeModalOverlay();

            if (editId) {
                this.updateNoteText(editId, noteText);
            } else {
                if (noteType === 'endnote') {
                    this.insertEndnote(noteText);
                } else {
                    this.insertFootnote(noteText);
                }
            }
        },

        insertFootnote: function(text) {
            text = (text || '').trim();
            if (!text) return;

            const noteId = 'fn-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            this._insertNoteMarker('footnote', noteId, text);
            this.resyncFootnotes(typeof state !== 'undefined' ? state.currentPageIndex : 0);

            if (typeof window.pushHistory === 'function') {
                window.pushHistory();
            }
        },

        insertEndnote: function(text) {
            text = (text || '').trim();
            if (!text) return;

            const noteId = 'en-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            this._insertNoteMarker('endnote', noteId, text);
            this.resyncEndnotes();

            if (typeof window.pushHistory === 'function') {
                window.pushHistory();
            }
        },

        _insertNoteMarker: function(type, noteId, text) {
            const isFootnote = type === 'footnote';
            const markerColor = isFootnote ? 'var(--ui-theme-color, #007670)' : 'var(--ui-theme-dark, #004d49)';

            const sup = document.createElement('sup');
            sup.className = `op-note-ref ${isFootnote ? 'op-footnote-ref' : 'op-endnote-ref'}`;
            sup.setAttribute('data-note-type', type);
            sup.setAttribute('data-note-id', noteId);
            sup.setAttribute('data-note-text', text);
            sup.style.fontSize = '0.75em';
            sup.style.verticalAlign = 'super';
            sup.style.color = markerColor;
            sup.style.fontWeight = 'bold';
            sup.style.cursor = 'pointer';
            sup.style.padding = '0 2px';
            sup.title = `${isFootnote ? 'Footnote' : 'Endnote'}: ${text}`;
            sup.innerText = isFootnote ? '[1]' : '[i]';

            sup.onclick = function(e) {
                e.stopPropagation();
                window.ReferencesEngine.showInsertNoteModal(type, noteId);
            };

            // Attempt caret insertion using saved range or active selection
            let inserted = false;
            let targetEditable = this._lastSavedEditable;

            if (this._lastSavedRange) {
                try {
                    this._lastSavedRange.deleteContents();
                    this._lastSavedRange.insertNode(sup);
                    // Move caret after sup
                    const sel = window.getSelection();
                    if (sel) {
                        sel.removeAllRanges();
                        const newR = document.createRange();
                        newR.setStartAfter(sup);
                        newR.collapse(true);
                        sel.addRange(newR);
                    }
                    inserted = true;
                } catch (e) {
                    inserted = false;
                }
            }

            if (!inserted) {
                if (!targetEditable && typeof state !== 'undefined' && state.selectedEl) {
                    targetEditable = state.selectedEl.querySelector('[contenteditable="true"]');
                }
                if (!targetEditable) {
                    // Create new text box if none active
                    if (typeof window.addTextBox === 'function') {
                        const newBox = window.addTextBox();
                        if (newBox) {
                            targetEditable = newBox.querySelector('[contenteditable="true"]');
                        }
                    }
                }

                if (targetEditable) {
                    targetEditable.appendChild(sup);
                    inserted = true;
                }
            }

            this._lastSavedRange = null;
            this._lastSavedEditable = null;
        },

        /* =========================================================================
         * 6. RESYNC FOOTNOTES (Current Page)
         * ========================================================================= */
        resyncFootnotes: function(pageIndex) {
            const paper = document.getElementById('paper');
            if (!paper) return;

            // Collect all footnote markers in visual reading order
            const markers = Array.from(paper.querySelectorAll('.op-footnote-ref'));
            markers.sort((a, b) => {
                const boxA = a.closest('.pub-element');
                const boxB = b.closest('.pub-element');
                const topA = boxA ? (parseFloat(boxA.style.top) || 0) : 0;
                const topB = boxB ? (parseFloat(boxB.style.top) || 0) : 0;
                if (Math.abs(topA - topB) > 10) return topA - topB;
                const leftA = boxA ? (parseFloat(boxA.style.left) || 0) : 0;
                const leftB = boxB ? (parseFloat(boxB.style.left) || 0) : 0;
                return leftA - leftB;
            });

            // Renumber markers
            markers.forEach((sup, idx) => {
                const num = idx + 1;
                sup.innerText = `[${num}]`;
            });

            // Locate or create footnote frame on current page
            let fnBox = paper.querySelector('.pub-element[data-footnote-box="true"]');

            if (markers.length === 0) {
                if (fnBox && fnBox.parentNode) {
                    // Empty footnote container
                    const editable = fnBox.querySelector('[contenteditable="true"]');
                    if (editable) editable.innerHTML = '';
                }
                return;
            }

            if (!fnBox) {
                if (typeof window.addTextBox === 'function') {
                    fnBox = window.addTextBox();
                }
                if (!fnBox) return;

                fnBox.setAttribute('data-footnote-box', 'true');
                const paperH = parseFloat(paper.style.height) || 1123;
                const paperW = parseFloat(paper.style.width) || 794;

                fnBox.style.left = '60px';
                fnBox.style.top = Math.max(80, paperH - 180) + 'px';
                fnBox.style.width = Math.max(200, paperW - 120) + 'px';
                fnBox.style.height = '120px';
            }

            const editable = fnBox.querySelector('[contenteditable="true"]');
            if (!editable) return;

            let notesHtml = '';
            markers.forEach((sup, idx) => {
                const num = idx + 1;
                const noteId = sup.getAttribute('data-note-id') || '';
                const noteText = sup.getAttribute('data-note-text') || '';

                notesHtml += `
                    <div class="op-footnote-line" data-note-id="${escapeAttr(noteId)}" style="margin-bottom: 4px; font-size: 9.5pt; line-height: 1.4; color: #334155; display: flex; align-items: baseline;">
                        <sup style="font-weight: bold; color: #00796b; margin-right: 5px; font-size: 8.5pt;">[${num}]</sup>
                        <span class="op-note-text-span" style="flex: 1;">${escapeHtml(noteText)}</span>
                    </div>
                `;
            });

            editable.innerHTML = `
                <div class="op-footnote-container" style="font-family: inherit; width: 100%; height: 100%; outline: none;">
                    <div style="width: 100px; border-top: 1px solid #94a3b8; margin-bottom: 8px;"></div>
                    ${notesHtml}
                </div>
            `;
        },

        /* =========================================================================
         * 7. RESYNC ENDNOTES (End of Document)
         * ========================================================================= */
        resyncEndnotes: function() {
            // First flush current page
            if (typeof window.serializeCurrentPage === 'function' && typeof state !== 'undefined' && state.pages) {
                state.pages[state.currentPageIndex] = window.serializeCurrentPage();
            }

            const totalPages = (typeof state !== 'undefined' && state.pages && state.pages.length) ? state.pages.length : 1;
            const endnotes = [];

            // Scan all pages for endnote markers
            for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
                if (typeof state !== 'undefined' && pageIdx === state.currentPageIndex) {
                    const paper = document.getElementById('paper');
                    if (paper) {
                        const pageEndnotes = Array.from(paper.querySelectorAll('.op-endnote-ref'));
                        pageEndnotes.forEach(sup => {
                            endnotes.push({
                                element: sup,
                                id: sup.getAttribute('data-note-id') || '',
                                text: sup.getAttribute('data-note-text') || '',
                                pageIndex: pageIdx
                            });
                        });
                    }
                } else if (typeof state !== 'undefined' && state.pages && state.pages[pageIdx]) {
                    const pData = state.pages[pageIdx];
                    (pData.elements || []).forEach(elData => {
                        const div = document.createElement('div');
                        div.innerHTML = elData.innerHTML || '';
                        const pageEndnotes = div.querySelectorAll('.op-endnote-ref');
                        pageEndnotes.forEach(sup => {
                            endnotes.push({
                                element: null,
                                id: sup.getAttribute('data-note-id') || '',
                                text: sup.getAttribute('data-note-text') || '',
                                pageIndex: pageIdx
                            });
                        });
                    });
                }
            }

            // Renumber all endnotes with Roman numerals
            endnotes.forEach((item, idx) => {
                const roman = toRoman(idx + 1);
                if (item.element) {
                    item.element.innerText = `[${roman}]`;
                }
            });

            // Target the last page of publication
            const lastPageIdx = totalPages - 1;
            const isCurrentlyOnLastPage = (typeof state !== 'undefined' && state.currentPageIndex === lastPageIdx);

            if (isCurrentlyOnLastPage) {
                const paper = document.getElementById('paper');
                if (!paper) return;

                let enBox = paper.querySelector('.pub-element[data-endnote-box="true"]');
                if (endnotes.length === 0) {
                    if (enBox) {
                        const editable = enBox.querySelector('[contenteditable="true"]');
                        if (editable) editable.innerHTML = '';
                    }
                    return;
                }

                if (!enBox) {
                    if (typeof window.addTextBox === 'function') {
                        enBox = window.addTextBox();
                    }
                    if (!enBox) return;

                    enBox.setAttribute('data-endnote-box', 'true');
                    const paperH = parseFloat(paper.style.height) || 1123;
                    const paperW = parseFloat(paper.style.width) || 794;

                    enBox.style.left = '60px';
                    enBox.style.top = Math.max(100, paperH - 260) + 'px';
                    enBox.style.width = Math.max(200, paperW - 120) + 'px';
                    enBox.style.height = '180px';
                }

                const editable = enBox.querySelector('[contenteditable="true"]');
                if (!editable) return;

                let linesHtml = '';
                endnotes.forEach((n, idx) => {
                    const roman = toRoman(idx + 1);
                    linesHtml += `
                        <div class="op-endnote-line" data-note-id="${escapeAttr(n.id)}" style="margin-bottom: 5px; font-size: 10pt; line-height: 1.4; color: #1e293b; display: flex; align-items: baseline;">
                            <sup style="font-weight: bold; color: var(--ui-theme-dark, #004d49); margin-right: 5px; font-size: 9pt;">[${roman}]</sup>
                            <span class="op-note-text-span" style="flex: 1;">${escapeHtml(n.text)}</span>
                        </div>
                    `;
                });

                editable.innerHTML = `
                    <div class="op-endnote-container" style="font-family: inherit; width: 100%; height: 100%; outline: none;">
                        <div style="font-size: 14pt; font-weight: bold; color: var(--ui-theme-dark, #007670); margin-bottom: 8px; border-bottom: 1.5px solid var(--ui-theme-color, #007670); padding-bottom: 4px;">Endnotes</div>
                        ${linesHtml}
                    </div>
                `;
            }
        },

        /* =========================================================================
         * 8. QUERY, EDIT & DELETE NOTES
         * ========================================================================= */
        getAllNotes: function() {
            const list = [];
            const paper = document.getElementById('paper');
            if (paper) {
                paper.querySelectorAll('.op-note-ref').forEach(sup => {
                    list.push({
                        id: sup.getAttribute('data-note-id') || '',
                        type: sup.getAttribute('data-note-type') || 'footnote',
                        text: sup.getAttribute('data-note-text') || '',
                        markerText: sup.innerText || ''
                    });
                });
            }
            return list;
        },

        updateNoteText: function(noteId, newText) {
            newText = (newText || '').trim();
            const paper = document.getElementById('paper');
            if (paper) {
                const sup = paper.querySelector(`.op-note-ref[data-note-id="${noteId}"]`);
                if (sup) {
                    sup.setAttribute('data-note-text', newText);
                    sup.title = `${sup.getAttribute('data-note-type') === 'endnote' ? 'Endnote' : 'Footnote'}: ${newText}`;
                }
            }

            this.resyncFootnotes(typeof state !== 'undefined' ? state.currentPageIndex : 0);
            this.resyncEndnotes();

            if (typeof window.pushHistory === 'function') {
                window.pushHistory();
            }
        },

        deleteNote: function(noteId) {
            const paper = document.getElementById('paper');
            if (paper) {
                const sup = paper.querySelector(`.op-note-ref[data-note-id="${noteId}"]`);
                if (sup && sup.parentNode) {
                    sup.parentNode.removeChild(sup);
                }
            }

            this.resyncFootnotes(typeof state !== 'undefined' ? state.currentPageIndex : 0);
            this.resyncEndnotes();
            this._removeModalOverlay();

            if (typeof window.pushHistory === 'function') {
                window.pushHistory();
            }
        },

        updateAllReferences: function() {
            this.insertOrUpdateTOC();
            this.resyncFootnotes(typeof state !== 'undefined' ? state.currentPageIndex : 0);
            this.resyncEndnotes();

            if (typeof window.pushHistory === 'function') {
                window.pushHistory();
            }
        },

        _makeDraggable: function(boxEl, handleEl) {
            if (!boxEl || !handleEl) return;
            handleEl.style.cursor = 'grab';
            handleEl.addEventListener('mousedown', function(e) {
                if (e.target.closest('button')) return;
                const rect = boxEl.getBoundingClientRect();
                boxEl.style.transform = 'none';
                boxEl.style.left = rect.left + 'px';
                boxEl.style.top = rect.top + 'px';
                const startX = e.clientX;
                const startY = e.clientY;
                const origLeft = rect.left;
                const origTop = rect.top;
                handleEl.style.cursor = 'grabbing';
                e.preventDefault();

                function onMouseMove(ev) {
                    const dx = ev.clientX - startX;
                    const dy = ev.clientY - startY;
                    const maxLeft = Math.max(0, window.innerWidth - 120);
                    const maxTop = Math.max(0, window.innerHeight - 60);
                    boxEl.style.left = Math.max(0, Math.min(maxLeft, origLeft + dx)) + 'px';
                    boxEl.style.top = Math.max(0, Math.min(maxTop, origTop + dy)) + 'px';
                }

                function onMouseUp() {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                    handleEl.style.cursor = 'grab';
                }

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        },

        showHelpModal: function(type) {
            const existing = document.getElementById('op-ref-help-overlay');
            if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
            const isTOC = (type === 'toc');
            const title = isTOC ? 'Table of Contents Help' : 'Footnotes & Endnotes Help';
            const topics = isTOC ? [
                {
                    id: 'overview',
                    title: 'Overview & Quick Start',
                    body: '<p>The <strong>Table of Contents Builder</strong> scans every page in your publication for headings and generates a formatted contents box with automatic page numbers.</p><ul><li><strong>Zero Manual Typing:</strong> Page numbers and tab leaders are calculated automatically across all pages.</li><li><strong>Live Updates:</strong> Click <strong>Update TOC</strong> anytime after adding pages or editing headings.</li></ul>'
                },
                {
                    id: 'headings',
                    title: 'Marking Headings (H1-H3)',
                    body: '<p>Mark any paragraph or text box as a heading before generating your TOC:</p><ul><li><strong>Format Tab:</strong> Select text or a text box and click <strong>H1</strong>, <strong>H2</strong>, <strong>H3</strong>, or <strong>Body</strong> under <em>Headings &amp; Notes</em>.</li><li><strong>Right-Click Menu:</strong> Right-click a text box and choose <strong>Heading Level</strong>.</li><li><strong>Auto-Detect:</strong> Leave <em>Auto-detect large/bold headings</em> checked to automatically include bold or large titles (18pt+) in existing documents.</li></ul>'
                },
                {
                    id: 'leaders',
                    title: 'Leaders & Updating',
                    body: '<p>Customize how entries appear inside the TOC box:</p><ul><li><strong>Tab Leader Style:</strong> Choose <code>Dots (...)</code>, <code>Dashes (---)</code>, or <code>None</code> between heading titles and page numbers.</li><li><strong>Non-Destructive Refresh:</strong> Re-running <strong>Insert / Update TOC</strong> updates your existing TOC box in place.</li></ul>'
                }
            ] : [
                {
                    id: 'overview',
                    title: 'Overview & Quick Start',
                    body: '<p>Insert numbered <strong>Footnotes</strong> at the bottom of the current page or <strong>Endnotes</strong> collected together on the final page.</p><ul><li><strong>Inline Markers:</strong> Drops a superscript marker (e.g. <code>[1]</code> or <code>[i]</code>) right at your cursor inside any text box.</li><li><strong>Auto-Anchored Frames:</strong> Creates or updates the note frame automatically.</li></ul>'
                },
                {
                    id: 'footnotes',
                    title: 'Footnotes (Page Bottom)',
                    body: '<p><strong>Footnotes</strong> use sequential Arabic numerals (<code>1, 2, 3...</code>) anchored to the bottom margin of the current page.</p><ul><li>Place your cursor inside a text box and click <strong>Insert Footnote</strong> from the <em>References</em> ribbon group or context menu.</li><li>All footnotes on the page are automatically renumbered in reading order.</li></ul>'
                },
                {
                    id: 'endnotes',
                    title: 'Endnotes & Resyncing',
                    body: '<p><strong>Endnotes</strong> use lowercase Roman numerals (<code>i, ii, iii...</code>) collected on the final page under an <em>Endnotes</em> heading.</p><ul><li><strong>Edit or Delete:</strong> Reopen this dialog to edit existing note text or delete notes cleanly.</li><li><strong>Update All:</strong> Click <strong>Update All</strong> to renumber all footnotes and endnotes across every page.</li></ul>'
                }
            ];

            const wrap = document.createElement('div');
            wrap.id = 'op-ref-help-overlay';
            wrap.innerHTML = `
                <style>
                    #op-ref-help-overlay {
                        position: fixed; inset: 0; background: rgba(0, 0, 0, 0.08);
                        z-index: 1000040; display: flex; align-items: center; justify-content: center;
                        padding: 16px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    }
                    .op-ref-help-box {
                        width: 660px; max-width: 94vw; height: 460px; max-height: 86vh;
                        background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #1e293b);
                        border: 1px solid var(--ui-border, #94a3b8); border-radius: 8px;
                        box-shadow: 0 12px 34px rgba(0, 0, 0, 0.28);
                        display: flex; flex-direction: column; overflow: hidden;
                    }
                    body.dark-mode .op-ref-help-box { background: #1e293b; color: #f8fafc; border-color: #334155; }
                    .op-ref-help-header {
                        padding: 6px 6px 6px 18px;
                        background: var(--ui-theme-color, #007670);
                        color: #ffffff; display: flex; align-items: center; justify-content: space-between;
                        user-select: none; font-weight: 700; font-size: 16px;
                        border-top-left-radius: 7px; border-top-right-radius: 7px; cursor: grab;
                    }
                    .op-ref-help-header .custom-dialog-close { flex-shrink: 0; }
                    .op-ref-help-toolbar {
                        display: flex; align-items: center; justify-content: space-between; gap: 8px;
                        padding: 6px 12px; background: var(--ui-surface-bg, #f1f4f6);
                        border-bottom: 1px solid var(--ui-border, #cbd5e1); font-size: 12px;
                    }
                    body.dark-mode .op-ref-help-toolbar { background: #0f172a; border-color: #334155; }
                    .op-ref-help-nav-btns { display: flex; align-items: center; gap: 4px; }
                    .op-ref-xp-tool-btn {
                        display: inline-flex; align-items: center; gap: 5px;
                        padding: 4px 10px; font-size: 11.5px; font-weight: 600;
                        background: var(--ui-panel-bg, #ffffff); color: var(--ui-theme-dark, #004a46);
                        border: 1px solid var(--ui-border, #cbd5e1); border-radius: 4px; cursor: pointer;
                    }
                    body.dark-mode .op-ref-xp-tool-btn { background: #1e293b; color: #e2e8f0; border-color: #475569; }
                    .op-ref-xp-tool-btn:hover:not(:disabled) { border-color: var(--ui-theme-color, #007670); background: rgba(0, 118, 112, 0.08); }
                    .op-ref-xp-tool-btn:disabled { opacity: 0.45; cursor: default; }
                    .op-ref-help-split { flex: 1; display: grid; grid-template-columns: 210px 1fr; min-height: 0; }
                    .op-ref-help-toc {
                        background: var(--ui-surface-bg, #f8fafc); border-right: 1px solid var(--ui-border, #cbd5e1);
                        padding: 10px 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 3px;
                    }
                    body.dark-mode .op-ref-help-toc { background: #0f172a; border-right-color: #334155; }
                    .op-ref-help-toc-head {
                        font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
                        color: var(--ui-theme-color, #007670); padding: 2px 6px 6px;
                    }
                    .op-ref-help-topic-btn {
                        width: 100%; text-align: left; border: 1px solid transparent; background: transparent;
                        color: var(--ui-text, #1e293b); padding: 7px 9px; border-radius: 4px;
                        font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 7px;
                    }
                    body.dark-mode .op-ref-help-topic-btn { color: #e2e8f0; }
                    .op-ref-help-topic-btn i { color: var(--ui-theme-color, #007670); font-size: 11px; flex-shrink: 0; }
                    .op-ref-help-topic-btn:hover { background: rgba(0, 118, 112, 0.08); }
                    .op-ref-help-topic-btn.active { background: var(--ui-theme-color, #007670); color: #ffffff; font-weight: 700; }
                    .op-ref-help-topic-btn.active i { color: #ffffff; }
                    .op-ref-help-pane { padding: 16px 20px; overflow-y: auto; font-size: 13px; line-height: 1.55; }
                    .op-ref-help-pane h4 {
                        margin: 0 0 10px; font-size: 16px; color: var(--ui-theme-color, #007670);
                        border-bottom: 1px solid var(--ui-border, #e2e8f0); padding-bottom: 6px;
                    }
                    .op-ref-help-pane ul { margin: 8px 0 0; padding-left: 18px; }
                    .op-ref-help-pane li { margin-bottom: 7px; }
                    .op-ref-help-pane code {
                        padding: 1px 5px; border-radius: 3px; font-size: 11.5px;
                        background: rgba(0, 118, 112, 0.1); color: var(--ui-theme-dark, #004a46);
                    }
                    body.dark-mode .op-ref-help-pane code { background: rgba(45, 212, 191, 0.15); color: #5eead4; }
                    .op-ref-help-footer {
                        padding: 9px 14px; border-top: 1px solid var(--ui-border, #cbd5e1);
                        background: var(--ui-surface-bg, #f8fafc); display: flex; justify-content: flex-end;
                    }
                    body.dark-mode .op-ref-help-footer { background: #1e293b; border-top-color: #334155; }
                    .op-ref-help-ok {
                        padding: 6px 18px; border-radius: 5px; border: none; font-weight: 700; font-size: 12.5px;
                        background: var(--ui-theme-color, #007670); color: #ffffff; cursor: pointer;
                    }
                    .op-ref-help-ok:hover { background: var(--ui-theme-dark, #004a46); }
                </style>
                <div class="op-ref-help-box" id="op-ref-help-box" role="dialog" aria-modal="true">
                    <div class="op-ref-help-header" id="op-ref-help-header">
                        <span style="display:flex; align-items:center; gap:8px; font-weight:700; font-size:13.5px;">
                            <i class="fas fa-book-open"></i> ${title}
                        </span>
                        <span role="button" tabindex="0" class="custom-dialog-close" id="op-ref-help-close-x" aria-label="Close Help"><i class="fas fa-times"></i></span>
                    </div>
                    <div class="op-ref-help-toolbar">
                        <div class="op-ref-help-nav-btns">
                            <button type="button" class="op-ref-xp-tool-btn" id="op-ref-help-back-btn" disabled><i class="fas fa-arrow-left"></i> Back</button>
                            <button type="button" class="op-ref-xp-tool-btn" id="op-ref-help-fwd-btn" disabled>Forward <i class="fas fa-arrow-right"></i></button>
                        </div>
                        <span id="op-ref-help-breadcrumb" style="font-weight:600; opacity:0.8;">${topics[0].title}</span>
                    </div>
                    <div class="op-ref-help-split">
                        <div class="op-ref-help-toc">
                            <div class="op-ref-help-toc-head">Contents</div>
                            ${topics.map((t, i) => `<button type="button" class="op-ref-help-topic-btn${i === 0 ? ' active' : ''}" data-topic-id="${t.id}"><i class="fas fa-file-alt"></i><span>${t.title}</span></button>`).join('')}
                        </div>
                        <div class="op-ref-help-pane" id="op-ref-help-content"></div>
                    </div>
                    <div class="op-ref-help-footer">
                        <button type="button" class="op-ref-help-ok" id="op-ref-help-ok-btn">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(wrap);
            const helpBox = document.getElementById('op-ref-help-box');
            const helpHdr = document.getElementById('op-ref-help-header');
            helpBox.style.position = 'fixed';
            this._makeDraggable(helpBox, helpHdr);

            const hist = [topics[0].id];
            let histIdx = 0;
            const renderTopic = (topicId, pushHist) => {
                const topic = topics.find(t => t.id === topicId) || topics[0];
                if (pushHist && hist[histIdx] !== topic.id) {
                    hist.splice(histIdx + 1);
                    hist.push(topic.id);
                    histIdx = hist.length - 1;
                }
                wrap.querySelectorAll('.op-ref-help-topic-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.topicId === topic.id));
                wrap.querySelector('#op-ref-help-breadcrumb').textContent = topic.title;
                wrap.querySelector('#op-ref-help-content').innerHTML = `<h4>${topic.title}</h4>${topic.body}`;
                wrap.querySelector('#op-ref-help-back-btn').disabled = histIdx <= 0;
                wrap.querySelector('#op-ref-help-fwd-btn').disabled = histIdx >= hist.length - 1;
            };
            renderTopic(topics[0].id, false);

            wrap.querySelectorAll('.op-ref-help-topic-btn').forEach(btn => btn.addEventListener('click', () => renderTopic(btn.dataset.topicId, true)));
            wrap.querySelector('#op-ref-help-back-btn').addEventListener('click', () => { if (histIdx > 0) { histIdx--; renderTopic(hist[histIdx], false); } });
            wrap.querySelector('#op-ref-help-fwd-btn').addEventListener('click', () => { if (histIdx < hist.length - 1) { histIdx++; renderTopic(hist[histIdx], false); } });
            const closeHelp = () => wrap.remove();
            wrap.querySelector('#op-ref-help-close-x').addEventListener('click', closeHelp);
            wrap.querySelector('#op-ref-help-ok-btn').addEventListener('click', closeHelp);
        },

        _removeModalOverlay: function() {
            const existing = document.getElementById('op-references-modal-root');
            if (existing && existing.parentNode) {
                existing.parentNode.removeChild(existing);
            }
        },

        _injectStyles: function() {
            if (document.getElementById('op-references-engine-styles')) return;
            const style = document.createElement('style');
            style.id = 'op-references-engine-styles';
            style.textContent = `
                .op-ref-modal-backdrop {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.14);
                    z-index: 1000030;
                }
                .op-ref-modal-window {
                    position: fixed; top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    width: 540px; max-width: 92vw; max-height: 88vh;
                    background: #ffffff;
                    border: 1px solid var(--ui-border, #cbd5e1);
                    border-radius: 12px;
                    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
                    display: flex; flex-direction: column; overflow: hidden;
                    z-index: 1000031;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                    color: #0f172a;
                }
                body.dark-mode .op-ref-modal-window {
                    background: #1e293b;
                    border-color: #334155;
                    color: #f8fafc;
                }
                .op-ref-modal-header {
                    padding: 6px 6px 6px 18px;
                    background: var(--ui-theme-color, #007670);
                    color: #ffffff; display: flex; align-items: center; justify-content: space-between;
                    font-weight: 700; font-size: 16px;
                    border-top-left-radius: 11px; border-top-right-radius: 11px;
                    user-select: none;
                }
                .op-ref-modal-close {
                    background: transparent; border: none; color: #ffffff;
                    width: 32px; height: 32px; border-radius: 6px;
                    font-size: 16px; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: background 0.15s;
                }
                .op-ref-modal-close:hover {
                    background: rgba(255, 255, 255, 0.22);
                }
                .op-ref-modal-body {
                    padding: 16px 20px; overflow-y: auto; flex: 1;
                }
                .op-ref-modal-footer {
                    padding: 10px 18px; border-top: 1px solid var(--ui-border, #e2e8f0);
                    display: flex; justify-content: flex-end; gap: 8px;
                    background: var(--ui-surface-bg, #f8fafc);
                }
                body.dark-mode .op-ref-modal-footer {
                    background: #0f172a; border-top-color: #334155;
                }
                .op-ref-label {
                    display: block; font-size: 11px; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 0.5px;
                    color: var(--ui-theme-dark, #007670); margin-bottom: 4px;
                }
                body.dark-mode .op-ref-label { color: #5eead4; }
                .op-ref-input, .op-ref-select, .op-ref-textarea {
                    width: 100%; box-sizing: border-box; padding: 7px 10px;
                    border: 1px solid var(--ui-border, #cbd5e1); border-radius: 6px;
                    background: #ffffff; color: #0f172a; font-family: inherit; font-size: 12.5px;
                    outline: none; transition: border-color 0.15s;
                }
                body.dark-mode .op-ref-input, body.dark-mode .op-ref-select, body.dark-mode .op-ref-textarea {
                    background: #0f172a; color: #f8fafc; border-color: #475569;
                }
                .op-ref-input:focus, .op-ref-select:focus, .op-ref-textarea:focus {
                    border-color: var(--ui-theme-color, #007670);
                    box-shadow: 0 0 0 2px rgba(0, 118, 112, 0.16);
                }
                .op-ref-textarea {
                    min-height: 80px; resize: vertical; line-height: 1.4;
                }
                .op-ref-section-card {
                    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;
                }
                body.dark-mode .op-ref-section-card {
                    background: #0f172a; border-color: #334155;
                }
                .op-ref-card-title {
                    font-size: 11px; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 0.5px; color: #475569; margin-bottom: 4px;
                }
                body.dark-mode .op-ref-card-title { color: #94a3b8; }
                .op-ref-btn-primary {
                    background: var(--ui-theme-color, #007670); color: #ffffff;
                    border: none; border-radius: 6px; padding: 7px 16px;
                    font-size: 12.5px; font-weight: 600; cursor: pointer;
                    transition: opacity 0.15s;
                }
                .op-ref-btn-primary:hover { opacity: 0.9; }
                .op-ref-btn-secondary {
                    background: transparent; color: #475569; border: 1px solid #cbd5e1;
                    border-radius: 6px; padding: 7px 14px; font-size: 12.5px;
                    cursor: pointer; transition: background 0.15s;
                }
                body.dark-mode .op-ref-btn-secondary { color: #cbd5e1; border-color: #475569; }
                .op-ref-btn-secondary:hover { background: rgba(0,0,0,0.05); }
                .op-ref-radio-card {
                    border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 12px;
                    display: flex; align-items: center; gap: 10px; cursor: pointer;
                    background: #ffffff; transition: border-color 0.15s;
                }
                body.dark-mode .op-ref-radio-card { background: #0f172a; border-color: #475569; }
                .op-ref-radio-card.active {
                    border-color: var(--ui-theme-color, #007670);
                    box-shadow: 0 0 0 1px var(--ui-theme-color, #007670);
                }
                .op-ref-mini-btn {
                    background: transparent; border: 1px solid #cbd5e1; border-radius: 4px;
                    padding: 3px 6px; font-size: 10px; color: #475569; cursor: pointer;
                }
                .op-ref-mini-btn:hover { background: #e2e8f0; color: #0f172a; }
                .op-ref-mini-btn-del:hover { background: #fee2e2; border-color: #fca5a5; color: #b91c1c; }
                .op-ref-link-btn {
                    background: none; border: none; color: var(--ui-theme-color, #007670);
                    font-size: 11px; font-weight: 600; cursor: pointer; text-decoration: underline; padding: 0;
                }
                .op-ref-header-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
                .op-ref-modal-header .custom-dialog-close {
                    width: 36px; height: 36px; font-size: 22px; border-radius: 10px;
                    padding: 0; border: none;
                }
                .op-ref-help-icon-btn:hover,
                body.dark-mode .op-ref-help-icon-btn:hover {
                    background: rgba(255, 255, 255, 0.25) !important;
                    color: #ffffff !important;
                }
                .op-ref-select-wrap {
                    position: relative; display: flex; align-items: center;
                    border: 1px solid var(--ui-border, #cbd5e1); border-radius: 6px;
                    background: #ffffff; height: 32px; overflow: hidden; cursor: pointer;
                    transition: border-color 0.15s;
                }
                .op-ref-select-wrap:hover, .op-ref-select-wrap:focus-within {
                    border-color: var(--ui-theme-color, #007670);
                }
                .op-ref-select-text {
                    flex: 1; padding: 0 10px; font-size: 12.5px; font-weight: 500;
                    color: var(--ui-theme-dark, #007670); white-space: nowrap; overflow: hidden;
                    text-overflow: ellipsis; pointer-events: none;
                }
                .op-ref-select-arrow {
                    width: 28px; height: 100%; background: var(--ui-theme-dark, #007670);
                    color: #ffffff; display: flex; align-items: center; justify-content: center;
                    font-size: 11px; flex-shrink: 0; pointer-events: none;
                }
                .op-ref-select-wrap select {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    opacity: 0; cursor: pointer; font-size: 12.5px;
                }
                body.dark-mode .op-ref-select-wrap { background: #0f172a; border-color: #475569; }
                body.dark-mode .op-ref-select-text { color: #f8fafc; }
                body.dark-mode .op-ref-select-arrow { background: var(--ui-theme-color, #007670); }
            `;
            document.head.appendChild(style);
        }
    };

    // Auto-inject styles
    ReferencesEngine._injectStyles();

    // Export globally
    window.ReferencesEngine = ReferencesEngine;
    window.showTOCModal = function() { ReferencesEngine.showTOCModal(); };
    window.insertOrUpdateTOC = function(options) { ReferencesEngine.insertOrUpdateTOC(options); };
    window.showInsertNoteModal = function(defaultType, editId) { ReferencesEngine.showInsertNoteModal(defaultType, editId); };
    window.insertFootnote = function(text) { ReferencesEngine.insertFootnote(text); };
    window.insertEndnote = function(text) { ReferencesEngine.insertEndnote(text); };
    window.applyHeadingLevel = function(level) { ReferencesEngine.applyHeadingLevel(level); };
    window.updateAllReferences = function() { ReferencesEngine.updateAllReferences(); };

})(window);
