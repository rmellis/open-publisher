/**
 * OpenPublisher References Engine (v5.23.0)
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
        _getThemeHex: function(varName, fallback) {
            try {
                const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
                if (raw && /^#[0-9a-f]{3,8}$/i.test(raw)) {
                    if (raw.length === 4) return '#' + raw[1]+raw[1] + raw[2]+raw[2] + raw[3]+raw[3];
                    return raw.slice(0, 7).toLowerCase();
                }
                const rgb = raw && raw.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
                if (rgb) {
                    return '#' + [1,2,3].map(i => Math.min(255, Math.max(0, parseInt(rgb[i],10))).toString(16).padStart(2,'0')).join('');
                }
            } catch (e) {}
            return fallback || '#007670';
        },

        _toHexColor: function(val, fallback) {
            if (!val) return fallback;
            if (window.TemplateCSSColorEngine && typeof window.TemplateCSSColorEngine.toHex === 'function') {
                const h = window.TemplateCSSColorEngine.toHex(val);
                if (h) return h;
            }
            const s = String(val).trim();
            if (/^#[0-9a-f]{6}$/i.test(s)) return s.toLowerCase();
            if (/^#[0-9a-f]{3}$/i.test(s)) return '#' + s[1]+s[1] + s[2]+s[2] + s[3]+s[3];
            const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
            if (m) return '#' + [1,2,3].map(i => Math.min(255, Math.max(0, parseInt(m[i],10))).toString(16).padStart(2,'0')).join('');
            return fallback;
        },

        _findNonOverlappingPosition: function(paper, excludeEl, w, h, prefLeft, prefTop, preferUpward) {
            if (!paper) return { left: prefLeft, top: prefTop };
            const paperW = parseFloat(paper.style.width) || paper.clientWidth || 794;
            const paperH = parseFloat(paper.style.height) || paper.clientHeight || 1123;
            const boxes = Array.from(paper.querySelectorAll('.pub-element')).filter(el => {
                if (!el || el === excludeEl) return false;
                if (el.getAttribute('data-is-theme') === 'true' || el.getAttribute('data-is-border') === 'true') return false;
                return true;
            }).map(el => ({
                left: parseFloat(el.style.left) || 0,
                top: parseFloat(el.style.top) || 0,
                width: parseFloat(el.style.width) || el.offsetWidth || 200,
                height: parseFloat(el.style.height) || el.offsetHeight || 80
            }));

            const gap = 14;
            const overlapsAny = (x, y) => boxes.some(b =>
                x < (b.left + b.width + gap) &&
                (x + w + gap) > b.left &&
                y < (b.top + b.height + gap) &&
                (y + h + gap) > b.top
            );

            let candX = Math.max(20, Math.min(Math.max(20, paperW - w - 20), prefLeft));
            let candY = Math.max(20, Math.min(Math.max(20, paperH - h - 20), prefTop));
            if (!overlapsAny(candX, candY)) {
                return { left: Math.round(candX), top: Math.round(candY) };
            }

            if (preferUpward) {
                for (let y = candY; y >= 40; y -= 24) {
                    if (!overlapsAny(candX, y)) return { left: Math.round(candX), top: Math.round(y) };
                }
            }

            const yCandidates = [candY];
            boxes.forEach(b => {
                if (preferUpward) {
                    const above = b.top - h - gap;
                    if (above >= 40) yCandidates.push(above);
                } else {
                    const below = b.top + b.height + gap;
                    if (below + h <= paperH - 20) yCandidates.push(below);
                }
            });
            for (let y = 50; y <= Math.max(50, paperH - h - 30); y += 36) {
                yCandidates.push(y);
            }

            for (let i = 0; i < yCandidates.length; i++) {
                const y = yCandidates[i];
                if (!overlapsAny(candX, y)) return { left: Math.round(candX), top: Math.round(y) };
                for (let x = 50; x <= Math.max(50, paperW - w - 30); x += 40) {
                    if (!overlapsAny(x, y)) return { left: Math.round(x), top: Math.round(y) };
                }
            }

            const offset = ((boxes.length) % 6) * 28;
            return {
                left: Math.round(Math.min(Math.max(20, paperW - w - 20), candX + offset)),
                top: Math.round(Math.min(Math.max(20, paperH - h - 20), Math.max(40, preferUpward ? candY - offset : candY + offset)))
            };
        },

        _readBoxOutlineStyles: function(boxEl, baseDefaults) {
            const out = Object.assign({
                outlineStyle: 'guide',
                outlineColor: '#94a3b8',
                outlineWidth: 1,
                guideColor: ''
            }, baseDefaults || {});
            if (!boxEl) return out;
            const editable = boxEl.querySelector('[contenteditable="true"]');
            const savedGuideCol = boxEl.getAttribute('data-ref-guide-color') || (boxEl.style ? boxEl.style.getPropertyValue('--op-ref-guide-color').trim() : '');
            if (savedGuideCol) {
                out.guideColor = this._toHexColor(savedGuideCol, out.outlineColor);
                out.outlineColor = out.guideColor;
            }
            const refAttr = boxEl.getAttribute('data-ref-outline');
            if (editable && editable.style.borderStyle && editable.style.borderStyle !== 'none') {
                out.outlineStyle = editable.style.borderStyle;
                out.outlineWidth = parseInt(editable.style.borderWidth, 10) || 1;
                out.outlineColor = this._toHexColor(editable.style.borderColor, out.outlineColor);
            } else if (refAttr === 'none') {
                out.outlineStyle = 'none';
            }
            return out;
        },

        _applyBoxOutlineStyles: function(boxEl, outlineStyle, outlineColor, outlineWidth, prevGuideColor) {
            if (!boxEl) return;
            const editable = boxEl.querySelector('[contenteditable="true"]');
            if (!editable) return;
            boxEl.style.borderStyle = '';
            boxEl.style.borderWidth = '';
            boxEl.style.borderColor = '';
            if (outlineStyle === 'guide') {
                boxEl.removeAttribute('data-ref-outline');
                editable.style.borderStyle = 'none';
                editable.style.borderWidth = '0px';
                const guideColToApply = outlineColor || prevGuideColor;
                if (guideColToApply) {
                    boxEl.setAttribute('data-ref-guide-color', guideColToApply);
                    boxEl.style.setProperty('--op-ref-guide-color', guideColToApply);
                } else {
                    boxEl.removeAttribute('data-ref-guide-color');
                    boxEl.style.removeProperty('--op-ref-guide-color');
                }
            } else if (outlineStyle === 'none') {
                boxEl.setAttribute('data-ref-outline', 'none');
                editable.style.borderStyle = 'none';
                editable.style.borderWidth = '0px';
                boxEl.removeAttribute('data-ref-guide-color');
                boxEl.style.removeProperty('--op-ref-guide-color');
            } else {
                boxEl.setAttribute('data-ref-outline', 'custom');
                editable.style.borderStyle = outlineStyle;
                editable.style.borderWidth = Math.max(1, parseInt(outlineWidth, 10) || 1) + 'px';
                editable.style.borderColor = outlineColor || '#94a3b8';
                boxEl.removeAttribute('data-ref-guide-color');
                boxEl.style.removeProperty('--op-ref-guide-color');
            }
        },

        _readTOCStylesFromBox: function(tocBox) {
            const themeAccent = this._getThemeHex('--ui-theme-color', '#007670');
            const themeDark = this._getThemeHex('--ui-theme-dark', '#007670');
            const defaults = {
                title: 'Table of Contents',
                dividerColor: themeAccent,
                dividerStyle: 'solid',
                dividerWidth: 2,
                titleColor: themeDark,
                badgeBg: themeAccent,
                badgeColor: '#ffffff',
                pageNumColor: themeDark,
                leaderColor: '#718096',
                leaderStyle: 'dots',
                entryL1Color: '#0f172a',
                entrySubColor: '#334155',
                emptyMsgColor: '#718096',
                containerBg: '',
                outlineStyle: 'guide',
                outlineColor: '#94a3b8',
                outlineWidth: 1,
                guideColor: ''
            };
            if (!tocBox) return defaults;
            const editable = tocBox.querySelector('[contenteditable="true"]');
            const containerEl = tocBox.querySelector('.op-toc-container');
            const hdr = tocBox.querySelector('.op-toc-header');
            const titleEl = tocBox.querySelector('.op-toc-title');
            const badgeEl = tocBox.querySelector('.op-toc-update-badge');
            const pageNumEl = tocBox.querySelector('.op-toc-page-num');
            const leaderEl = tocBox.querySelector('.op-toc-leader');
            const emptyEl = tocBox.querySelector('.op-toc-empty');
            const row1 = tocBox.querySelector('.op-toc-row[data-toc-level="1"] .op-toc-entry-text') || tocBox.querySelector('.op-toc-row[data-toc-level="1"]');
            const rowSub = tocBox.querySelector('.op-toc-row[data-toc-level="2"] .op-toc-entry-text, .op-toc-row[data-toc-level="3"] .op-toc-entry-text') || tocBox.querySelector('.op-toc-row[data-toc-level="2"], .op-toc-row[data-toc-level="3"]');

            if (containerEl) {
                const bg = containerEl.style.backgroundImage && containerEl.style.backgroundImage.includes('gradient')
                    ? containerEl.style.backgroundImage
                    : (containerEl.style.backgroundColor || containerEl.style.background || '');
                if (bg && bg !== 'none' && bg !== 'transparent') defaults.containerBg = bg;
            }
            if (titleEl) {
                defaults.title = (titleEl.textContent || '').trim() || defaults.title;
                if (titleEl.style.color) defaults.titleColor = this._toHexColor(titleEl.style.color, defaults.titleColor);
            }
            if (hdr) {
                if (hdr.style.borderBottomStyle) defaults.dividerStyle = hdr.style.borderBottomStyle || 'solid';
                if (hdr.style.borderBottomWidth) defaults.dividerWidth = parseInt(hdr.style.borderBottomWidth, 10) || (defaults.dividerStyle === 'none' ? 0 : 2);
                if (hdr.style.borderBottomColor) defaults.dividerColor = this._toHexColor(hdr.style.borderBottomColor, defaults.dividerColor);
            }
            if (badgeEl) {
                if (badgeEl.style.backgroundColor || badgeEl.style.background) {
                    defaults.badgeBg = this._toHexColor(badgeEl.style.backgroundColor || badgeEl.style.background, defaults.badgeBg);
                }
                if (badgeEl.style.color) defaults.badgeColor = this._toHexColor(badgeEl.style.color, defaults.badgeColor);
            }
            if (pageNumEl && pageNumEl.style.color) {
                defaults.pageNumColor = this._toHexColor(pageNumEl.style.color, defaults.pageNumColor);
            }
            if (leaderEl) {
                if (leaderEl.style.borderBottomStyle === 'dashed') defaults.leaderStyle = 'dashes';
                else if (leaderEl.style.borderBottomStyle === 'none') defaults.leaderStyle = 'none';
                else if (leaderEl.style.borderBottomStyle === 'dotted') defaults.leaderStyle = 'dots';
                if (leaderEl.style.borderBottomColor) defaults.leaderColor = this._toHexColor(leaderEl.style.borderBottomColor, defaults.leaderColor);
            }
            if (emptyEl && emptyEl.style.color) {
                defaults.emptyMsgColor = this._toHexColor(emptyEl.style.color, defaults.emptyMsgColor);
            }
            if (row1 && row1.style.color) defaults.entryL1Color = this._toHexColor(row1.style.color, defaults.entryL1Color);
            if (rowSub && rowSub.style.color) defaults.entrySubColor = this._toHexColor(rowSub.style.color, defaults.entrySubColor);

            return this._readBoxOutlineStyles(tocBox, defaults);
        },

        insertOrUpdateTOC: function(options) {
            options = options || {};
            const paper = document.getElementById('paper');
            if (!paper) return;

            // Search for existing TOC box on current page
            let tocBox = paper.querySelector('.pub-element[data-toc-box="true"]');
            const prevStyles = this._readTOCStylesFromBox(tocBox);

            const title = options.title || prevStyles.title || 'Table of Contents';
            const leaderStyle = options.leaderStyle || prevStyles.leaderStyle || 'dots'; // 'dots', 'dashes', 'none'
            const dividerColor = options.dividerColor || prevStyles.dividerColor;
            const dividerStyle = options.dividerStyle || prevStyles.dividerStyle || 'solid';
            const dividerWidth = (options.dividerWidth !== undefined) ? parseInt(options.dividerWidth, 10) : prevStyles.dividerWidth;
            const outlineStyle = options.outlineStyle || prevStyles.outlineStyle || 'guide';
            const outlineColor = options.outlineColor || prevStyles.outlineColor || '#94a3b8';
            const outlineWidth = (options.outlineWidth !== undefined) ? parseInt(options.outlineWidth, 10) : (prevStyles.outlineWidth || 1);

            const headings = this.scanHeadings(options);

            if (!tocBox) {
                if (typeof window.addTextBox === 'function') {
                    tocBox = window.addTextBox();
                }
                if (!tocBox) return;

                tocBox.setAttribute('data-toc-box', 'true');
                const tocPos = this._findNonOverlappingPosition(paper, tocBox, 520, 340, 60, 70, false);
                tocBox.style.left = tocPos.left + 'px';
                tocBox.style.top = tocPos.top + 'px';
                tocBox.style.width = '520px';
                tocBox.style.height = '340px';
            }

            const editable = tocBox.querySelector('[contenteditable="true"]');
            if (!editable) return;

            // Apply box outline preference cleanly
            this._applyBoxOutlineStyles(tocBox, outlineStyle, options.outlineColor, outlineWidth, prevStyles.guideColor);

            let borderStyle = `border-bottom-width: 1px; border-bottom-style: dotted; border-bottom-color: ${prevStyles.leaderColor};`;
            if (leaderStyle === 'dashes') {
                borderStyle = `border-bottom-width: 1px; border-bottom-style: dashed; border-bottom-color: ${prevStyles.leaderColor};`;
            } else if (leaderStyle === 'none') {
                borderStyle = 'border-bottom: none;';
            }

            const headerDividerCss = dividerStyle === 'none'
                ? 'border-bottom: none;'
                : `border-bottom-width: ${Math.max(1, dividerWidth)}px; border-bottom-style: ${dividerStyle}; border-bottom-color: ${dividerColor};`;

            const containerBgCss = prevStyles.containerBg ? ` background: ${prevStyles.containerBg};` : '';

            let rowsHtml = '';
            if (headings.length === 0) {
                rowsHtml = `
                    <div class="op-toc-empty" style="padding: 18px 0; color: ${prevStyles.emptyMsgColor}; font-style: italic; font-size: 11pt; text-align: center;">
                        No headings found in publication. Mark headings using H1 / H2 / H3 in the ribbon or context menu, then click Update TOC.
                    </div>
                `;
            } else {
                headings.forEach(item => {
                    const indentPx = (item.level - 1) * 22;
                    const fontSize = item.level === 1 ? '11.5pt' : (item.level === 2 ? '10.5pt' : '10pt');
                    const fontWeight = item.level === 1 ? 'bold' : 'normal';
                    const color = item.level === 1 ? prevStyles.entryL1Color : prevStyles.entrySubColor;

                    rowsHtml += `
                        <div class="op-toc-row" data-toc-level="${item.level}" style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 7px; padding-left: ${indentPx}px; font-size: ${fontSize}; font-weight: ${fontWeight}; color: ${color};">
                            <span class="op-toc-entry-text" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 78%; cursor: pointer; color: ${color};" title="Go to Page ${item.pageNumber}">${escapeHtml(item.text)}</span>
                            <span class="op-toc-leader" style="flex: 1; margin: 0 8px; transform: translateY(-4px); ${borderStyle}"></span>
                            <span class="op-toc-page-num" style="min-width: 22px; text-align: right; font-weight: bold; color: ${prevStyles.pageNumColor};">${item.pageNumber}</span>
                        </div>
                    `;
                });
            }

            editable.innerHTML = `
                <div class="op-toc-container" style="font-family: inherit; width: 100%; height: 100%; box-sizing: border-box; outline: none;${containerBgCss}">
                    <div class="op-toc-header" style="display: flex; align-items: center; justify-content: space-between; ${headerDividerCss} padding-bottom: 6px; margin-bottom: 14px;">
                        <span class="op-toc-title" style="font-size: 18pt; font-weight: 700; color: ${prevStyles.titleColor};">${escapeHtml(title)}</span>
                        <span class="op-toc-update-badge no-print" data-html2canvas-ignore="true" onclick="window.insertOrUpdateTOC(); event.stopPropagation();" title="Click to refresh Table of Contents" style="font-size: 10px; font-weight: 600; background-color: ${prevStyles.badgeBg}; color: ${prevStyles.badgeColor}; padding: 3px 8px; border-radius: 4px; cursor: pointer; user-select: none;">Update TOC</span>
                    </div>
                    <div class="op-toc-entries">
                        ${rowsHtml}
                    </div>
                </div>
            `;

            if (window.TemplateCSSColorEngine && typeof window.TemplateCSSColorEngine.refreshRibbonPanel === 'function') {
                window.TemplateCSSColorEngine.refreshRibbonPanel(tocBox);
            }
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

            const paper = document.getElementById('paper');
            const existingTocBox = paper ? paper.querySelector('.pub-element[data-toc-box="true"]') : null;
            const curStyles = this._readTOCStylesFromBox(existingTocBox);

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
                <div class="op-ref-modal-backdrop" id="op-toc-modal-backdrop"></div>
                <div class="op-ref-modal-window" id="op-toc-modal-window" style="width: 580px;" role="dialog" aria-modal="true" aria-labelledby="op-toc-modal-title">
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
                                <label class="op-ref-label" for="op-toc-input-title">TOC Title</label>
                                <input type="text" id="op-toc-input-title" class="op-ref-input" value="${escapeAttr(curStyles.title)}">
                            </div>
                            <div>
                                <label class="op-ref-label" for="op-toc-input-leader">Tab Leader Style</label>
                                <select id="op-toc-input-leader" class="op-ref-select">
                                    <option value="dots" ${curStyles.leaderStyle === 'dots' ? 'selected' : ''}>Dots ( . . . . . . . . . . . )</option>
                                    <option value="dashes" ${curStyles.leaderStyle === 'dashes' ? 'selected' : ''}>Dashes ( - - - - - - - - )</option>
                                    <option value="none" ${curStyles.leaderStyle === 'none' ? 'selected' : ''}>None</option>
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
                            <div class="op-ref-card-title">Divider Line &amp; Box Outline Styling</div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:6px;">
                                <div>
                                    <label class="op-ref-label" for="op-toc-divider-style" style="font-size:10px;">Header Divider Line</label>
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <input type="hidden" id="op-toc-divider-color" value="${escapeAttr(curStyles.dividerColor)}">
                                        <button type="button" id="op-toc-divider-color-btn" class="op-ref-color-btn" title="Choose Divider Line Color" style="background:${escapeAttr(curStyles.dividerColor)};" onclick="event.stopPropagation(); window.ReferencesEngine._openCustomColorPicker('op-toc-divider-color', 'op-toc-divider-color-btn', this);"></button>
                                        <select id="op-toc-divider-style" class="op-ref-select" style="width:140px; flex:1;">
                                            <option value="solid" ${curStyles.dividerStyle === 'solid' ? 'selected' : ''}>Solid Line</option>
                                            <option value="dashed" ${curStyles.dividerStyle === 'dashed' ? 'selected' : ''}>Dashed Line</option>
                                            <option value="dotted" ${curStyles.dividerStyle === 'dotted' ? 'selected' : ''}>Dotted Line</option>
                                            <option value="none" ${curStyles.dividerStyle === 'none' ? 'selected' : ''}>None</option>
                                        </select>
                                        <select id="op-toc-divider-width" class="op-ref-select" style="width:68px;" title="Divider Thickness">
                                            <option value="1" ${curStyles.dividerWidth === 1 ? 'selected' : ''}>1px</option>
                                            <option value="2" ${curStyles.dividerWidth === 2 ? 'selected' : ''}>2px</option>
                                            <option value="3" ${curStyles.dividerWidth === 3 ? 'selected' : ''}>3px</option>
                                            <option value="4" ${curStyles.dividerWidth === 4 ? 'selected' : ''}>4px</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label class="op-ref-label" for="op-toc-outline-style" style="font-size:10px;">Box Outline</label>
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <input type="hidden" id="op-toc-outline-color" value="${escapeAttr(curStyles.outlineColor)}">
                                        <button type="button" id="op-toc-outline-color-btn" class="op-ref-color-btn" title="Choose Box Outline Color" style="background:${escapeAttr(curStyles.outlineColor)};" onclick="event.stopPropagation(); window.ReferencesEngine._openCustomColorPicker('op-toc-outline-color', 'op-toc-outline-color-btn', this);"></button>
                                        <select id="op-toc-outline-style" class="op-ref-select" style="width:140px; flex:1;">
                                            <option value="guide" ${curStyles.outlineStyle === 'guide' ? 'selected' : ''}>Editor Guide</option>
                                            <option value="none" ${curStyles.outlineStyle === 'none' ? 'selected' : ''}>None (Borderless)</option>
                                            <option value="dashed" ${curStyles.outlineStyle === 'dashed' ? 'selected' : ''}>Dashed Border</option>
                                            <option value="solid" ${curStyles.outlineStyle === 'solid' ? 'selected' : ''}>Solid Border</option>
                                            <option value="dotted" ${curStyles.outlineStyle === 'dotted' ? 'selected' : ''}>Dotted Border</option>
                                        </select>
                                        <select id="op-toc-outline-width" class="op-ref-select" style="width:68px;" title="Outline Thickness">
                                            <option value="1" ${curStyles.outlineWidth === 1 ? 'selected' : ''}>1px</option>
                                            <option value="2" ${curStyles.outlineWidth === 2 ? 'selected' : ''}>2px</option>
                                            <option value="3" ${curStyles.outlineWidth === 3 ? 'selected' : ''}>3px</option>
                                            <option value="4" ${curStyles.outlineWidth === 4 ? 'selected' : ''}>4px</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="op-ref-section-card" style="margin-top:10px;">
                            <div class="op-ref-card-title" style="display:flex; justify-content:space-between; align-items:center;">
                                <span>Detected Headings Across All Pages (${headings.length})</span>
                                <span style="font-size:10px; font-weight:normal; text-transform:none; color:#64748b;">Visual reading order</span>
                            </div>
                            <div style="max-height:110px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:6px; margin-top:6px; background:#fff;">
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
            this._wireModalInputGuards(modalWin);

            setTimeout(() => {
                const titleInput = document.getElementById('op-toc-input-title');
                const root = document.getElementById('op-references-modal-root');
                if (titleInput && root && !root.contains(document.activeElement)) titleInput.focus();
            }, 50);
        },

        _commitTOCFromModal: function() {
            const titleInput = document.getElementById('op-toc-input-title');
            const leaderInput = document.getElementById('op-toc-input-leader');
            const dividerColorInput = document.getElementById('op-toc-divider-color');
            const dividerStyleInput = document.getElementById('op-toc-divider-style');
            const dividerWidthInput = document.getElementById('op-toc-divider-width');
            const outlineColorInput = document.getElementById('op-toc-outline-color');
            const outlineStyleInput = document.getElementById('op-toc-outline-style');
            const outlineWidthInput = document.getElementById('op-toc-outline-width');
            const h1Check = document.getElementById('op-toc-check-h1');
            const h2Check = document.getElementById('op-toc-check-h2');
            const h3Check = document.getElementById('op-toc-check-h3');
            const autoCheck = document.getElementById('op-toc-check-autodetect');

            const options = {
                title: titleInput ? titleInput.value.trim() : 'Table of Contents',
                leaderStyle: leaderInput ? leaderInput.value : 'dots',
                dividerColor: dividerColorInput ? dividerColorInput.value : undefined,
                dividerStyle: dividerStyleInput ? dividerStyleInput.value : undefined,
                dividerWidth: dividerWidthInput ? parseInt(dividerWidthInput.value, 10) : undefined,
                outlineColor: outlineColorInput ? outlineColorInput.value : undefined,
                outlineStyle: outlineStyleInput ? outlineStyleInput.value : undefined,
                outlineWidth: outlineWidthInput ? parseInt(outlineWidthInput.value, 10) : undefined,
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
        _readNoteBoxStyles: function(noteType) {
            const isEndnote = noteType === 'endnote';
            const themeAccent = this._getThemeHex('--ui-theme-color', '#007670');
            const themeDark = this._getThemeHex('--ui-theme-dark', '#007670');
            const defaults = {
                dividerColor: isEndnote ? themeAccent : '#94a3b8',
                dividerStyle: 'solid',
                dividerWidth: isEndnote ? 2 : 1,
                headerColor: themeDark,
                supColor: isEndnote ? themeDark : themeAccent,
                lineColor: isEndnote ? '#1e293b' : '#334155',
                containerBg: '',
                outlineStyle: 'guide',
                outlineColor: '#94a3b8',
                outlineWidth: 1,
                guideColor: ''
            };
            const paper = document.getElementById('paper');
            if (!paper) return defaults;
            const selector = isEndnote ? '.pub-element[data-endnote-box="true"]' : '.pub-element[data-footnote-box="true"]';
            const box = paper.querySelector(selector);
            if (!box) return defaults;

            const container = box.querySelector(isEndnote ? '.op-endnote-container' : '.op-footnote-container');
            if (container) {
                const bg = container.style.backgroundImage && container.style.backgroundImage.includes('gradient')
                    ? container.style.backgroundImage
                    : (container.style.backgroundColor || container.style.background || '');
                if (bg && bg !== 'none' && bg !== 'transparent') defaults.containerBg = bg;
            }
            if (isEndnote) {
                const hdr = box.querySelector('.op-endnote-header');
                if (hdr) {
                    if (hdr.style.color) defaults.headerColor = this._toHexColor(hdr.style.color, defaults.headerColor);
                    if (hdr.style.borderBottomStyle) defaults.dividerStyle = hdr.style.borderBottomStyle || 'solid';
                    if (hdr.style.borderBottomWidth) defaults.dividerWidth = parseInt(hdr.style.borderBottomWidth, 10) || (defaults.dividerStyle === 'none' ? 0 : 2);
                    if (hdr.style.borderBottomColor) defaults.dividerColor = this._toHexColor(hdr.style.borderBottomColor, defaults.dividerColor);
                }
            } else {
                const div = box.querySelector('.op-footnote-divider');
                if (div) {
                    if (div.style.borderTopStyle) defaults.dividerStyle = div.style.borderTopStyle || 'solid';
                    if (div.style.borderTopWidth) defaults.dividerWidth = parseInt(div.style.borderTopWidth, 10) || (defaults.dividerStyle === 'none' ? 0 : 1);
                    if (div.style.borderTopColor) defaults.dividerColor = this._toHexColor(div.style.borderTopColor, defaults.dividerColor);
                }
            }
            const sup = box.querySelector((isEndnote ? '.op-endnote-line' : '.op-footnote-line') + ' sup');
            if (sup && sup.style.color) defaults.supColor = this._toHexColor(sup.style.color, defaults.supColor);
            const line = box.querySelector(isEndnote ? '.op-endnote-line' : '.op-footnote-line');
            if (line && line.style.color) defaults.lineColor = this._toHexColor(line.style.color, defaults.lineColor);

            return this._readBoxOutlineStyles(box, defaults);
        },

        _syncNoteModalStyles: function(noteType) {
            const st = this._readNoteBoxStyles(noteType);
            const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
            setVal('op-note-divider-color', st.dividerColor);
            const dBtn = document.getElementById('op-note-divider-color-btn');
            if (dBtn) dBtn.style.background = st.dividerColor;
            setVal('op-note-divider-style', st.dividerStyle);
            setVal('op-note-divider-width', String(st.dividerWidth || 1));
            setVal('op-note-outline-color', st.outlineColor);
            const oBtn = document.getElementById('op-note-outline-color-btn');
            if (oBtn) oBtn.style.background = st.outlineColor;
            setVal('op-note-outline-style', st.outlineStyle);
            setVal('op-note-outline-width', String(st.outlineWidth || 1));

            const modalWin = document.getElementById('op-note-modal-window');
            if (modalWin) {
                modalWin.querySelectorAll('select').forEach(sel => {
                    const customWrap = sel.nextElementSibling;
                    if (customWrap && customWrap.classList.contains('custom-dom-select')) {
                        const span = customWrap.querySelector('span');
                        if (span && sel.selectedIndex >= 0) span.innerText = sel.options[sel.selectedIndex].text;
                    }
                });
            }
        },

        showInsertNoteModal: function(defaultType, editNoteId) {
            this.saveCurrentSelection();
            this._removeModalOverlay();

            const isEndnote = defaultType === 'endnote';
            const allNotes = this.getAllNotes();
            const curStyles = this._readNoteBoxStyles(isEndnote ? 'endnote' : 'footnote');

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
                <div class="op-ref-modal-backdrop" id="op-note-modal-backdrop"></div>
                <div class="op-ref-modal-window" id="op-note-modal-window" style="width: 580px;" role="dialog" aria-modal="true" aria-labelledby="op-note-modal-title">
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
                        
                        <div style="margin-bottom:10px;">
                            <label class="op-ref-label">Reference Location</label>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                                <label class="op-ref-radio-card ${!isEndnote ? 'active' : ''}" id="op-note-card-fn">
                                    <input type="radio" name="op-note-type-radio" value="footnote" ${!isEndnote ? 'checked' : ''} onchange="document.getElementById('op-note-card-fn').classList.add('active'); document.getElementById('op-note-card-en').classList.remove('active'); window.ReferencesEngine._syncNoteModalStyles('footnote');">
                                    <div>
                                        <div style="font-weight:700; font-size:12px; color:#00796b;">Footnote</div>
                                        <div style="font-size:10.5px; color:#64748b;">Bottom of current page</div>
                                    </div>
                                </label>
                                <label class="op-ref-radio-card ${isEndnote ? 'active' : ''}" id="op-note-card-en">
                                    <input type="radio" name="op-note-type-radio" value="endnote" ${isEndnote ? 'checked' : ''} onchange="document.getElementById('op-note-card-en').classList.add('active'); document.getElementById('op-note-card-fn').classList.remove('active'); window.ReferencesEngine._syncNoteModalStyles('endnote');">
                                    <div>
                                        <div style="font-weight:700; font-size:12px; color:var(--ui-theme-dark,#007670);">Endnote</div>
                                        <div style="font-size:10.5px; color:#64748b;">End of publication</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div style="margin-bottom:10px;">
                            <label class="op-ref-label" for="op-note-text-input">Note Text / Citation</label>
                            <textarea id="op-note-text-input" class="op-ref-textarea" style="min-height:66px;" placeholder="Type source citation, explanatory note, or reference...">${escapeHtml(initialText)}</textarea>
                            <div style="font-size:10.5px; color:#64748b; margin-top:3px;">
                                Drops a superscript marker at the cursor and anchors a formatted note box automatically.
                            </div>
                        </div>

                        <div class="op-ref-section-card" style="margin-bottom:10px;">
                            <div class="op-ref-card-title">Divider Line &amp; Box Outline Styling</div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:6px;">
                                <div>
                                    <label class="op-ref-label" for="op-note-divider-style" style="font-size:10px;">Separator / Header Line</label>
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <input type="hidden" id="op-note-divider-color" value="${escapeAttr(curStyles.dividerColor)}">
                                        <button type="button" id="op-note-divider-color-btn" class="op-ref-color-btn" title="Choose Divider Line Color" style="background:${escapeAttr(curStyles.dividerColor)};" onclick="event.stopPropagation(); window.ReferencesEngine._openCustomColorPicker('op-note-divider-color', 'op-note-divider-color-btn', this);"></button>
                                        <select id="op-note-divider-style" class="op-ref-select" style="width:140px; flex:1;">
                                            <option value="solid" ${curStyles.dividerStyle === 'solid' ? 'selected' : ''}>Solid Line</option>
                                            <option value="dashed" ${curStyles.dividerStyle === 'dashed' ? 'selected' : ''}>Dashed Line</option>
                                            <option value="dotted" ${curStyles.dividerStyle === 'dotted' ? 'selected' : ''}>Dotted Line</option>
                                            <option value="none" ${curStyles.dividerStyle === 'none' ? 'selected' : ''}>None</option>
                                        </select>
                                        <select id="op-note-divider-width" class="op-ref-select" style="width:68px;" title="Divider Thickness">
                                            <option value="1" ${curStyles.dividerWidth === 1 ? 'selected' : ''}>1px</option>
                                            <option value="2" ${curStyles.dividerWidth === 2 ? 'selected' : ''}>2px</option>
                                            <option value="3" ${curStyles.dividerWidth === 3 ? 'selected' : ''}>3px</option>
                                            <option value="4" ${curStyles.dividerWidth === 4 ? 'selected' : ''}>4px</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label class="op-ref-label" for="op-note-outline-style" style="font-size:10px;">Box Outline</label>
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <input type="hidden" id="op-note-outline-color" value="${escapeAttr(curStyles.outlineColor)}">
                                        <button type="button" id="op-note-outline-color-btn" class="op-ref-color-btn" title="Choose Box Outline Color" style="background:${escapeAttr(curStyles.outlineColor)};" onclick="event.stopPropagation(); window.ReferencesEngine._openCustomColorPicker('op-note-outline-color', 'op-note-outline-color-btn', this);"></button>
                                        <select id="op-note-outline-style" class="op-ref-select" style="width:140px; flex:1;">
                                            <option value="guide" ${curStyles.outlineStyle === 'guide' ? 'selected' : ''}>Editor Guide</option>
                                            <option value="none" ${curStyles.outlineStyle === 'none' ? 'selected' : ''}>None (Borderless)</option>
                                            <option value="dashed" ${curStyles.outlineStyle === 'dashed' ? 'selected' : ''}>Dashed Border</option>
                                            <option value="solid" ${curStyles.outlineStyle === 'solid' ? 'selected' : ''}>Solid Border</option>
                                            <option value="dotted" ${curStyles.outlineStyle === 'dotted' ? 'selected' : ''}>Dotted Border</option>
                                        </select>
                                        <select id="op-note-outline-width" class="op-ref-select" style="width:68px;" title="Outline Thickness">
                                            <option value="1" ${curStyles.outlineWidth === 1 ? 'selected' : ''}>1px</option>
                                            <option value="2" ${curStyles.outlineWidth === 2 ? 'selected' : ''}>2px</option>
                                            <option value="3" ${curStyles.outlineWidth === 3 ? 'selected' : ''}>3px</option>
                                            <option value="4" ${curStyles.outlineWidth === 4 ? 'selected' : ''}>4px</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="op-ref-section-card">
                            <div class="op-ref-card-title" style="display:flex; justify-content:space-between; align-items:center;">
                                <span>Document Notes (${allNotes.length})</span>
                                <button type="button" class="op-ref-link-btn" onclick="window.ReferencesEngine.updateAllReferences(); window.ReferencesEngine.showInsertNoteModal('${defaultType}')">Update All</button>
                            </div>
                            <div style="max-height:92px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:5px; margin-top:6px; background:#fff;">
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
            if (typeof DialogSystem !== 'undefined' && typeof DialogSystem.convertNativeSelects === 'function') {
                DialogSystem.convertNativeSelects(modalWin);
            }
            this._makeDraggable(modalWin, modalHdr);
            this._wireModalInputGuards(modalWin);

            setTimeout(() => {
                const ta = document.getElementById('op-note-text-input');
                const root = document.getElementById('op-references-modal-root');
                if (ta && root && !root.contains(document.activeElement)) ta.focus();
            }, 50);
        },

        _commitNoteFromModal: function() {
            const ta = document.getElementById('op-note-text-input');
            const noteText = ta ? ta.value.trim() : '';
            if (!noteText) {
                this._showNoticeModal('Note Text Required', 'Please enter note text or citation before inserting this reference.', () => {
                    const inp = document.getElementById('op-note-text-input');
                    if (inp) inp.focus();
                });
                return;
            }

            const editIdInput = document.getElementById('op-note-edit-id');
            const editId = editIdInput ? editIdInput.value : null;

            const typeRadio = document.querySelector('input[name="op-note-type-radio"]:checked');
            const noteType = typeRadio ? typeRadio.value : 'footnote';
            const styleOptions = {
                dividerColor: (document.getElementById('op-note-divider-color') || {}).value,
                dividerStyle: (document.getElementById('op-note-divider-style') || {}).value,
                dividerWidth: parseInt((document.getElementById('op-note-divider-width') || {}).value, 10) || undefined,
                outlineColor: (document.getElementById('op-note-outline-color') || {}).value,
                outlineStyle: (document.getElementById('op-note-outline-style') || {}).value,
                outlineWidth: parseInt((document.getElementById('op-note-outline-width') || {}).value, 10) || undefined
            };

            this._removeModalOverlay();

            if (editId) {
                this.updateNoteText(editId, noteText);
                if (noteType === 'endnote') {
                    this.resyncEndnotes(styleOptions);
                } else {
                    this.resyncFootnotes(typeof state !== 'undefined' ? state.currentPageIndex : 0, styleOptions);
                }
                if (typeof window.pushHistory === 'function') window.pushHistory();
            } else {
                if (noteType === 'endnote') {
                    this.insertEndnote(noteText, styleOptions);
                } else {
                    this.insertFootnote(noteText, styleOptions);
                }
            }
        },

        insertFootnote: function(text, styleOptions) {
            text = (text || '').trim();
            if (!text) return;

            const noteId = 'fn-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            this._insertNoteMarker('footnote', noteId, text);
            this.resyncFootnotes(typeof state !== 'undefined' ? state.currentPageIndex : 0, styleOptions);

            if (typeof window.pushHistory === 'function') {
                window.pushHistory();
            }
        },

        insertEndnote: function(text, styleOptions) {
            text = (text || '').trim();
            if (!text) return;

            const noteId = 'en-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            this._insertNoteMarker('endnote', noteId, text);
            this.resyncEndnotes(styleOptions);

            if (typeof window.pushHistory === 'function') {
                window.pushHistory();
            }
        },

        _insertNoteMarker: function(type, noteId, text) {
            const isFootnote = type === 'footnote';
            const markerColor = isFootnote ? this._getThemeHex('--ui-theme-color', '#007670') : this._getThemeHex('--ui-theme-dark', '#004d49');

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

            // Attempt caret insertion using saved range or active selection (skip generated TOC/note frames)
            const isInsideSpecialFrame = (node) => !!(node && node.closest && node.closest('[data-toc-box="true"], [data-footnote-box="true"], [data-endnote-box="true"]'));
            let inserted = false;
            let targetEditable = (this._lastSavedEditable && !isInsideSpecialFrame(this._lastSavedEditable)) ? this._lastSavedEditable : null;

            if (this._lastSavedRange && targetEditable && targetEditable.contains(this._lastSavedRange.startContainer)) {
                try {
                    if ((targetEditable.innerText || '').trim() === 'Click to edit text') {
                        targetEditable.innerHTML = '';
                        const lead = document.createTextNode('');
                        targetEditable.appendChild(lead);
                        targetEditable.appendChild(sup);
                        const sel = window.getSelection();
                        if (sel) {
                            sel.removeAllRanges();
                            const newR = document.createRange();
                            newR.setStart(lead, 0);
                            newR.collapse(true);
                            sel.addRange(newR);
                        }
                    } else {
                        this._lastSavedRange.deleteContents();
                        this._lastSavedRange.insertNode(sup);
                        const sel = window.getSelection();
                        if (sel) {
                            sel.removeAllRanges();
                            const newR = document.createRange();
                            newR.setStartAfter(sup);
                            newR.collapse(true);
                            sel.addRange(newR);
                        }
                    }
                    inserted = true;
                } catch (e) {
                    inserted = false;
                }
            }

            if (!inserted) {
                if (!targetEditable && typeof state !== 'undefined' && state.selectedEl && !isInsideSpecialFrame(state.selectedEl)) {
                    targetEditable = state.selectedEl.querySelector('[contenteditable="true"]');
                }
                let createdFallbackBox = false;
                if (!targetEditable) {
                    // Create new text box if none active, placed in an empty area of the page
                    if (typeof window.addTextBox === 'function') {
                        const newBox = window.addTextBox();
                        if (newBox) {
                            const paper = document.getElementById('paper');
                            const bw = parseFloat(newBox.style.width) || 240;
                            const bh = parseFloat(newBox.style.height) || 80;
                            const pos = this._findNonOverlappingPosition(paper, newBox, bw, bh, 60, 60, false);
                            newBox.style.left = pos.left + 'px';
                            newBox.style.top = pos.top + 'px';
                            if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
                            targetEditable = newBox.querySelector('[contenteditable="true"]');
                            createdFallbackBox = true;
                        }
                    }
                }

                if (targetEditable) {
                    const rawText = (targetEditable.innerText || '').trim();
                    if (createdFallbackBox || rawText === 'Click to edit text') {
                        targetEditable.innerHTML = '';
                        const lead = document.createTextNode('');
                        targetEditable.appendChild(lead);
                        targetEditable.appendChild(sup);
                        try {
                            targetEditable.focus();
                            const sel = window.getSelection();
                            if (sel) {
                                sel.removeAllRanges();
                                const r = document.createRange();
                                r.setStart(lead, 0);
                                r.collapse(true);
                                sel.addRange(r);
                            }
                        } catch (err) {}
                    } else {
                        targetEditable.appendChild(sup);
                    }
                    inserted = true;
                }
            }

            this._lastSavedRange = null;
            this._lastSavedEditable = null;
        },

        /* =========================================================================
         * 6. RESYNC FOOTNOTES (Current Page)
         * ========================================================================= */
        resyncFootnotes: function(pageIndex, styleOptions) {
            styleOptions = styleOptions || {};
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

            const prevStyles = this._readNoteBoxStyles('footnote');

            if (!fnBox) {
                if (typeof window.addTextBox === 'function') {
                    fnBox = window.addTextBox();
                }
                if (!fnBox) return;

                fnBox.setAttribute('data-footnote-box', 'true');
                const paperH = parseFloat(paper.style.height) || 1123;
                const paperW = parseFloat(paper.style.width) || 794;
                const fnW = Math.max(200, paperW - 120);
                const fnH = 120;
                const fnPos = this._findNonOverlappingPosition(paper, fnBox, fnW, fnH, 60, Math.max(80, paperH - 180), true);

                fnBox.style.left = fnPos.left + 'px';
                fnBox.style.top = fnPos.top + 'px';
                fnBox.style.width = fnW + 'px';
                fnBox.style.height = fnH + 'px';
            }

            const editable = fnBox.querySelector('[contenteditable="true"]');
            if (!editable) return;

            const divColor = styleOptions.dividerColor || prevStyles.dividerColor;
            const divStyle = styleOptions.dividerStyle || prevStyles.dividerStyle;
            const divWidth = (styleOptions.dividerWidth !== undefined) ? styleOptions.dividerWidth : prevStyles.dividerWidth;
            const outlineStyle = styleOptions.outlineStyle || prevStyles.outlineStyle;
            const outlineColor = styleOptions.outlineColor || prevStyles.outlineColor;
            const outlineWidth = (styleOptions.outlineWidth !== undefined) ? styleOptions.outlineWidth : prevStyles.outlineWidth;
            this._applyBoxOutlineStyles(fnBox, outlineStyle, styleOptions.outlineColor || (outlineStyle === 'guide' ? prevStyles.guideColor : outlineColor), outlineWidth, prevStyles.guideColor);

            const divCss = divStyle === 'none'
                ? 'border-top: none;'
                : `border-top-width: ${Math.max(1, parseInt(divWidth, 10) || 1)}px; border-top-style: ${divStyle}; border-top-color: ${divColor};`;
            const containerBgCss = prevStyles.containerBg ? ` background: ${prevStyles.containerBg};` : '';

            let notesHtml = '';
            markers.forEach((sup, idx) => {
                const num = idx + 1;
                const noteId = sup.getAttribute('data-note-id') || '';
                const noteText = sup.getAttribute('data-note-text') || '';

                notesHtml += `
                    <div class="op-footnote-line" data-note-id="${escapeAttr(noteId)}" style="margin-bottom: 4px; font-size: 9.5pt; line-height: 1.4; color: ${prevStyles.lineColor}; display: flex; align-items: baseline;">
                        <sup style="font-weight: bold; color: ${prevStyles.supColor}; margin-right: 5px; font-size: 8.5pt;">[${num}]</sup>
                        <span class="op-note-text-span" style="flex: 1;">${escapeHtml(noteText)}</span>
                    </div>
                `;
            });

            editable.innerHTML = `
                <div class="op-footnote-container" style="font-family: inherit; width: 100%; height: 100%; outline: none;${containerBgCss}">
                    <div class="op-footnote-divider" style="width: 100px; ${divCss} margin-bottom: 8px;"></div>
                    ${notesHtml}
                </div>
            `;
            if (window.TemplateCSSColorEngine && typeof window.TemplateCSSColorEngine.refreshRibbonPanel === 'function' && typeof state !== 'undefined' && state.selectedEl === fnBox) {
                window.TemplateCSSColorEngine.refreshRibbonPanel(fnBox);
            }
        },

        /* =========================================================================
         * 7. RESYNC ENDNOTES (End of Document)
         * ========================================================================= */
        resyncEndnotes: function(styleOptions) {
            styleOptions = styleOptions || {};
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

                const prevStyles = this._readNoteBoxStyles('endnote');

                if (!enBox) {
                    if (typeof window.addTextBox === 'function') {
                        enBox = window.addTextBox();
                    }
                    if (!enBox) return;

                    enBox.setAttribute('data-endnote-box', 'true');
                    const paperH = parseFloat(paper.style.height) || 1123;
                    const paperW = parseFloat(paper.style.width) || 794;
                    const enW = Math.max(200, paperW - 120);
                    const enH = 180;
                    const enPos = this._findNonOverlappingPosition(paper, enBox, enW, enH, 60, Math.max(100, paperH - 260), true);

                    enBox.style.left = enPos.left + 'px';
                    enBox.style.top = enPos.top + 'px';
                    enBox.style.width = enW + 'px';
                    enBox.style.height = enH + 'px';
                }

                const editable = enBox.querySelector('[contenteditable="true"]');
                if (!editable) return;

                const divColor = styleOptions.dividerColor || prevStyles.dividerColor;
                const divStyle = styleOptions.dividerStyle || prevStyles.dividerStyle;
                const divWidth = (styleOptions.dividerWidth !== undefined) ? styleOptions.dividerWidth : prevStyles.dividerWidth;
                const outlineStyle = styleOptions.outlineStyle || prevStyles.outlineStyle;
                const outlineColor = styleOptions.outlineColor || prevStyles.outlineColor;
                const outlineWidth = (styleOptions.outlineWidth !== undefined) ? styleOptions.outlineWidth : prevStyles.outlineWidth;
                this._applyBoxOutlineStyles(enBox, outlineStyle, styleOptions.outlineColor || (outlineStyle === 'guide' ? prevStyles.guideColor : outlineColor), outlineWidth, prevStyles.guideColor);

                const divCss = divStyle === 'none'
                    ? 'border-bottom: none;'
                    : `border-bottom-width: ${Math.max(1, parseInt(divWidth, 10) || 2)}px; border-bottom-style: ${divStyle}; border-bottom-color: ${divColor};`;
                const containerBgCss = prevStyles.containerBg ? ` background: ${prevStyles.containerBg};` : '';

                let linesHtml = '';
                endnotes.forEach((n, idx) => {
                    const roman = toRoman(idx + 1);
                    linesHtml += `
                        <div class="op-endnote-line" data-note-id="${escapeAttr(n.id)}" style="margin-bottom: 5px; font-size: 10pt; line-height: 1.4; color: ${prevStyles.lineColor}; display: flex; align-items: baseline;">
                            <sup style="font-weight: bold; color: ${prevStyles.supColor}; margin-right: 5px; font-size: 9pt;">[${roman}]</sup>
                            <span class="op-note-text-span" style="flex: 1;">${escapeHtml(n.text)}</span>
                        </div>
                    `;
                });

                editable.innerHTML = `
                    <div class="op-endnote-container" style="font-family: inherit; width: 100%; height: 100%; outline: none;${containerBgCss}">
                        <div class="op-endnote-header" style="font-size: 14pt; font-weight: bold; color: ${prevStyles.headerColor}; margin-bottom: 8px; ${divCss} padding-bottom: 4px;">Endnotes</div>
                        ${linesHtml}
                    </div>
                `;
                if (window.TemplateCSSColorEngine && typeof window.TemplateCSSColorEngine.refreshRibbonPanel === 'function' && typeof state !== 'undefined' && state.selectedEl === enBox) {
                    window.TemplateCSSColorEngine.refreshRibbonPanel(enBox);
                }
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

        _openCustomColorPicker: function(hiddenInputId, btnId, anchorEl) {
            const hidden = document.getElementById(hiddenInputId);
            const btn = document.getElementById(btnId) || anchorEl;
            const current = (hidden && hidden.value) ? hidden.value : '#007670';
            if (window.CustomColorPicker && typeof window.CustomColorPicker.open === 'function') {
                window.CustomColorPicker.open(btn, current, (newColor) => {
                    if (!newColor || newColor === 'transparent') return;
                    const hex = this._toHexColor(newColor, current);
                    if (hidden) hidden.value = hex;
                    if (btn) btn.style.background = hex;
                });
            }
        },

        _wireModalInputGuards: function(modalWin) {
            if (!modalWin) return;
            modalWin.addEventListener('focusout', function(e) {
                e.stopPropagation();
            });
            ['mousedown', 'mouseup'].forEach(evt => {
                modalWin.addEventListener(evt, function(e) {
                    if (e.target && e.target.closest && e.target.closest('input, textarea')) {
                        e.stopPropagation();
                    }
                });
            });
            ['keydown', 'keyup'].forEach(evt => {
                modalWin.addEventListener(evt, function(e) {
                    if (e.target && e.target.closest && e.target.closest('input, textarea')) {
                        if (e.key === 'Escape') {
                            e.stopPropagation();
                            window.ReferencesEngine._removeModalOverlay();
                            return;
                        }
                        e.stopPropagation();
                    }
                });
            });
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
                    body: '<p>The <strong>Table of Contents Builder</strong> scans every page in your publication for headings and generates a formatted contents box with automatic page numbers.</p><ul><li><strong>Custom Title &amp; Preview:</strong> Enter a <strong>TOC Title</strong> and review all detected headings across pages before inserting.</li><li><strong>Zero Manual Typing:</strong> Page numbers and tab leaders are calculated automatically in visual reading order.</li><li><strong>Live Updates:</strong> Click <strong>Update TOC</strong> inside the box anytime after adding pages or editing headings.</li></ul>'
                },
                {
                    id: 'headings',
                    title: 'Marking Headings (H1-H3)',
                    body: '<p>Mark any paragraph or text box as a heading before generating or updating your TOC:</p><ul><li><strong>Text Box Tools Ribbon:</strong> Select text or a text box and click <strong>H1</strong>, <strong>H2</strong>, <strong>H3</strong>, or <strong>Body</strong> under <em>Headings &amp; Notes</em>.</li><li><strong>Right-Click Menu:</strong> Right-click a text box and choose <strong>Heading Level</strong>.</li><li><strong>Auto-Detect:</strong> Leave <em>Auto-detect bold or large title text (&gt;= 18pt)</em> checked to automatically include bold or large titles in existing documents.</li></ul>'
                },
                {
                    id: 'styling',
                    title: 'Divider Line & Box Outline',
                    body: '<p>Customize the appearance of your Table of Contents box directly inside <strong>Table of Contents Builder</strong>:</p><ul><li><strong>Tab Leader Style:</strong> Choose <code>Dots (...)</code>, <code>Dashes (---)</code>, or <code>None</code> between heading titles and page numbers.</li><li><strong>Header Divider Line:</strong> Click the color swatch to open our <em>Custom Color Picker</em>, then set the line style (<code>Solid</code>, <code>Dashed</code>, <code>Dotted</code>, or <code>None</code>) and thickness (<code>1px</code>-<code>4px</code>).</li><li><strong>Box Outline:</strong> Choose <strong>Editor Guide</strong> (screen-only dashed guide hidden when printing), <strong>None (Borderless)</strong>, or a printable <code>Dashed</code>, <code>Solid</code>, or <code>Dotted</code> border with your chosen color and thickness.</li></ul>'
                },
                {
                    id: 'recoloring',
                    title: 'Element Colors & Updating',
                    body: '<p>Fine-tune individual TOC colors anytime using the ribbon styling tools:</p><ul><li><strong>Element Colors &amp; CSS Studio:</strong> Select the TOC box and use <strong>Element Colors</strong> or <strong>CSS Colors &amp; Style</strong> in <em>Text Box Tools</em> to recolor the <strong>TOC Title</strong>, <strong>TOC Header Divider</strong>, <strong>Update TOC Button</strong>, entry text, page numbers, or adjust <strong>Outline Style</strong> &amp; <strong>Outline Width</strong>.</li><li><strong>Preserved on Update:</strong> Clicking <strong>Update TOC</strong> (or re-running <strong>Insert / Update TOC</strong>) refreshes headings and page numbers while keeping your custom colors and outline styling intact.</li></ul>'
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
                },
                {
                    id: 'styling',
                    title: 'Divider Line & Box Outline',
                    body: '<p>Customize Footnote and Endnote frame styling directly inside the <strong>Insert Footnote or Endnote</strong> dialog:</p><ul><li><strong>Separator / Header Line:</strong> Click the swatch to pick a color with our <em>Custom Color Picker</em>, then choose line style (<code>Solid</code>, <code>Dashed</code>, <code>Dotted</code>, or <code>None</code>) and thickness (<code>1px</code>-<code>4px</code>).</li><li><strong>Box Outline:</strong> Choose <strong>Editor Guide</strong> (screen-only dashed guide hidden when printing), <strong>None (Borderless)</strong>, or a printable <code>Dashed</code>, <code>Solid</code>, or <code>Dotted</code> border with custom color and width.</li><li><strong>Element Colors:</strong> Further customize markers, headers, and fills in <em>Text Box Tools -&gt; Element Colors</em>; customizations are preserved when notes resync.</li></ul>'
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

        _showNoticeModal: function(title, message, onClose) {
            const existing = document.getElementById('op-ref-notice-overlay');
            if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
            const wrap = document.createElement('div');
            wrap.id = 'op-ref-notice-overlay';
            wrap.innerHTML = `
                <div style="position:fixed;inset:0;background:rgba(0,0,0,0.12);z-index:1000044;" id="op-ref-notice-backdrop"></div>
                <div class="op-ref-modal-window" id="op-ref-notice-window" style="width:410px;z-index:1000045;" role="alertdialog" aria-modal="true">
                    <div class="op-ref-modal-header" id="op-ref-notice-header">
                        <span style="display:flex;align-items:center;gap:8px;">
                            <i class="fas fa-exclamation-triangle"></i> ${escapeHtml(title || 'Notice')}
                        </span>
                        <span role="button" tabindex="0" class="custom-dialog-close" id="op-ref-notice-close-x" title="Close" aria-label="Close"><i class="fas fa-times"></i></span>
                    </div>
                    <div class="op-ref-modal-body" style="padding:18px 20px;font-size:13.5px;line-height:1.5;display:flex;align-items:center;gap:14px;">
                        <img src="ui/icons/alert.png?v=5.24.0" alt="Warning" style="width:42px;height:42px;object-fit:contain;flex-shrink:0;">
                        <div style="flex:1;">${escapeHtml(message)}</div>
                    </div>
                    <div class="op-ref-modal-footer">
                        <button type="button" class="op-ref-btn-primary" id="op-ref-notice-ok-btn">OK</button>
                    </div>
                </div>
            `;
            document.body.appendChild(wrap);
            const win = document.getElementById('op-ref-notice-window');
            const hdr = document.getElementById('op-ref-notice-header');
            this._makeDraggable(win, hdr);
            const dismiss = () => {
                if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
                if (typeof onClose === 'function') onClose();
            };
            document.getElementById('op-ref-notice-close-x').addEventListener('click', dismiss);
            document.getElementById('op-ref-notice-ok-btn').addEventListener('click', dismiss);
            const okBtn = document.getElementById('op-ref-notice-ok-btn');
            if (okBtn) okBtn.focus();
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
                    padding: 14px 18px; overflow-y: auto; flex: 1;
                }
                #op-toc-modal-window.allow-overflow .op-ref-modal-body,
                #op-note-modal-window.allow-overflow .op-ref-modal-body {
                    overflow: visible;
                }
                .op-ref-modal-footer {
                    padding: 10px 18px; border-top: 1px solid var(--ui-border, #e2e8f0);
                    display: flex; justify-content: flex-end; gap: 8px;
                    background: var(--ui-surface-bg, #f8fafc);
                    border-bottom-left-radius: 11px; border-bottom-right-radius: 11px;
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
                    user-select: text !important; -webkit-user-select: text !important; -moz-user-select: text !important;
                    pointer-events: auto !important; cursor: text;
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
                .op-ref-color-btn {
                    width: 30px; height: 28px; border-radius: 6px; padding: 0;
                    border: 1.5px solid rgba(0, 0, 0, 0.25);
                    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
                    cursor: pointer; flex-shrink: 0; transition: transform 0.12s, border-color 0.15s;
                }
                .op-ref-color-btn:hover { transform: scale(1.06); border-color: var(--ui-theme-color, #007670); }
                body.dark-mode .op-ref-color-btn { border-color: rgba(255, 255, 255, 0.35); }
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
    window.insertFootnote = function(text, styleOptions) { ReferencesEngine.insertFootnote(text, styleOptions); };
    window.insertEndnote = function(text, styleOptions) { ReferencesEngine.insertEndnote(text, styleOptions); };
    window.applyHeadingLevel = function(level) { ReferencesEngine.applyHeadingLevel(level); };
    window.updateAllReferences = function() { ReferencesEngine.updateAllReferences(); };

})(window);
