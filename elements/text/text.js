// Open Publisher Text Engine (v5.11.6)
// --- FONT DROPDOWN KEYBOARD NAVIGATION ---
let fontNavState = {
    lastSearchedChar: null,
    matchIndex: 0,
    highlightedItem: null
};

window.resetFontNavState = function() {
    fontNavState.lastSearchedChar = null;
    fontNavState.matchIndex = 0;
    if (fontNavState.highlightedItem) {
        fontNavState.highlightedItem.classList.remove('highlighted');
        fontNavState.highlightedItem = null;
    }
    document.querySelectorAll('.font-item.highlighted').forEach(el => el.classList.remove('highlighted'));
};

function getActiveFontDropdown() {
    const ribbonMenu = document.getElementById('ribbon-font-list');
    if (ribbonMenu && ribbonMenu.style.display === 'block') return ribbonMenu;
    const floatMenu = document.getElementById('float-font-list');
    if (floatMenu && floatMenu.style.display === 'block') return floatMenu;
    return null;
}

window.highlightFontItem = function(activeMenu, item, scroll = true) {
    if (!item || !activeMenu) return;
    if (fontNavState.highlightedItem) {
        fontNavState.highlightedItem.classList.remove('highlighted');
    }
    activeMenu.querySelectorAll('.font-item.highlighted').forEach(el => el.classList.remove('highlighted'));
    item.classList.add('highlighted');
    fontNavState.highlightedItem = item;
    if (scroll) {
        item.scrollIntoView({ block: 'nearest' });
    }
};

function handleFontDropdownKeyDown(e) {
    const activeMenu = getActiveFontDropdown();
    if (!activeMenu) return;

    // 1. Escape: Close dropdown
    if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        activeMenu.style.display = 'none';
        window.resetFontNavState();
        return;
    }

    // 2. Enter: Commit selection
    if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (fontNavState.highlightedItem) {
            fontNavState.highlightedItem.click();
        } else {
            activeMenu.style.display = 'none';
        }
        window.resetFontNavState();
        return;
    }

    const allItems = Array.from(activeMenu.querySelectorAll('.font-item'));
    if (allItems.length === 0) return;

    // 3. Arrow Down: Next item
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        let currentIndex = fontNavState.highlightedItem ? allItems.indexOf(fontNavState.highlightedItem) : -1;
        let nextIndex = (currentIndex + 1) % allItems.length;
        window.highlightFontItem(activeMenu, allItems[nextIndex]);
        fontNavState.lastSearchedChar = null;
        return;
    }

    // 4. Arrow Up: Previous item
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        let currentIndex = fontNavState.highlightedItem ? allItems.indexOf(fontNavState.highlightedItem) : 0;
        let prevIndex = (currentIndex - 1 + allItems.length) % allItems.length;
        window.highlightFontItem(activeMenu, allItems[prevIndex]);
        fontNavState.lastSearchedChar = null;
        return;
    }

    // 5. Letter key: Jump and cycle through fonts starting with that letter
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        const char = e.key.toUpperCase();
        const matchingItems = allItems.filter(item => item.innerText.trim().toUpperCase().startsWith(char));
        if (matchingItems.length === 0) return;

        if (char === fontNavState.lastSearchedChar && matchingItems.includes(fontNavState.highlightedItem)) {
            // Cycle to the next font starting with the same letter
            fontNavState.matchIndex = (matchingItems.indexOf(fontNavState.highlightedItem) + 1) % matchingItems.length;
        } else {
            // New letter or first press of this letter
            fontNavState.lastSearchedChar = char;
            fontNavState.matchIndex = 0;
        }

        const targetItem = matchingItems[fontNavState.matchIndex];
        window.highlightFontItem(activeMenu, targetItem);
    }
}

let fontKeyNavInitialized = false;
function initFontDropdownKeyNav() {
    if (fontKeyNavInitialized) return;
    window.addEventListener('keydown', handleFontDropdownKeyDown, true);
    fontKeyNavInitialized = true;
}

function initFontPickers() {
    const ribbonList = document.getElementById('ribbon-font-list');
    const floatList = document.getElementById('float-font-list');
    const preloader = document.getElementById('font-preloader');
    
    // Sort Alphabetically
    fontList.sort();

    fontList.forEach(font => {
        // Ribbon Item
        const item1 = document.createElement('div');
        item1.className = 'font-item';
        item1.innerText = font;
        item1.style.fontFamily = font;
        item1.onclick = () => { selectFont(font); };
        item1.onmouseenter = () => { window.highlightFontItem(ribbonList, item1, false); };
        ribbonList.appendChild(item1);

        // Float Item
        const item2 = document.createElement('div');
        item2.className = 'font-item';
        item2.innerText = font;
        item2.style.fontFamily = font;
        item2.onclick = () => { selectFont(font); };
        item2.onmouseenter = () => { window.highlightFontItem(floatList, item2, false); };
        floatList.appendChild(item2);

        // Preload font by creating an element
        const span = document.createElement('span');
        span.style.fontFamily = font;
        span.innerText = "A";
        preloader.appendChild(span);
    });

    initFontDropdownKeyNav();
}


function selectFont(fontName) {
    // FIXED: Immediately update UI Labels visually
    document.getElementById('ribbon-font-label').innerText = fontName;
    document.getElementById('float-font-label').innerText = fontName;
    
    // Execute
    if (state.selectedEl) {
        // If text selected, specific execute
        execCmd('fontName', fontName);
        
        // FIXED: Force immediate repaint to show font change
        forceRepaint();
    } else {
        // Set float font updates global execution state
        setFloatFont(fontName);
    }
    
    // Hide Menus & reset navigation state
    document.querySelectorAll('.custom-dropdown').forEach(d => d.style.display = 'none');
    window.resetFontNavState();
}


function setTrueFontSize(val) {
    if (state.selectedEl) {
        const waText = state.selectedEl.querySelector('.wa-text');
        
        if (waText) {
            // NEW WORDART LOGIC: Change font size, then expand the container box to match!
            waText.style.fontSize = val;
            waText.style.transform = 'none'; 
            
            // Add 8px to account for the 4px padding on each side
            state.selectedEl.style.width = (waText.offsetWidth + 8) + 'px';
            state.selectedEl.style.height = (waText.offsetHeight + 8) + 'px';
            
            syncWordArt(state.selectedEl); 
            
        } else {
            // STANDARD TEXT LOGIC
            if (state.lastRange) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(state.lastRange);
            }
            
            // Trigger the browser's native resize
            document.execCommand("fontSize", false, "7"); 
            
            // Catch both standard <font> tags and browser-generated <span> tags
            const fontTags = state.selectedEl.querySelectorAll('font[size="7"], span[style*="xxx-large"], span[style*="48px"]');
            fontTags.forEach(f => {
                f.removeAttribute("size");
                f.style.fontSize = val;
            });
            
            // Fallback for collapsed selections
            const sel = window.getSelection();
            if(sel.isCollapsed) {
                 const content = state.selectedEl.querySelector('.element-content > div') || state.selectedEl.querySelector('.element-content');
                 if(content) content.style.fontSize = val;
            }
        }
        
        // Push exact number to both UI elements
        const numVal = parseInt(val);
        const floatSelect = document.getElementById('float-size');
        
        document.getElementById('font-size').value = numVal;
        
        // Ensure the dropdown has the option before setting it
        if (floatSelect) {
            let optionExists = Array.from(floatSelect.options).some(opt => parseInt(opt.value) === numVal);
            if(!optionExists) {
                const newOpt = document.createElement('option');
                newOpt.value = numVal;
                newOpt.innerText = numVal;
                floatSelect.appendChild(newOpt);
            }
            floatSelect.value = numVal;
        }
        
        // Immediately capture the new selection range so rapid consecutive font changes (or shortcuts) don't fail
        const currentSel = window.getSelection();
        if (currentSel.rangeCount > 0) {
            state.lastRange = currentSel.getRangeAt(0).cloneRange();
        }
        
        pushHistory();
    }
}


function addTextBox() { 
    const autoHyphenate = localStorage.getItem('opub_autoHyphenate') === 'true';
    const hyphenStyle = autoHyphenate ? ' hyphens:auto; -webkit-hyphens:auto;' : '';
    const userLang = navigator.language || 'en';
    const spellAttrs = ` spellcheck="false" lang="${userLang}"`;
    state.lastRange = null;
    
    const el = createWrapper(`<div style="padding:10px; height:100%; word-wrap:break-word; outline:none; font-family: 'Segoe UI', sans-serif;${hyphenStyle}" contenteditable="true"${spellAttrs}>Click to edit text</div>`); 
    el.setAttribute('data-scheme-text', '0');
    applySingleElementScheme(el, state.currentScheme);
    updateFloatToolbarValues();
    return el;
}


function stripCssBackgroundProps(el, isRootEditable) {
    if (!el || el.nodeType !== 1) return;
    el.removeAttribute('bgcolor');
    if (el.style) {
        el.style.removeProperty('background');
        el.style.removeProperty('background-color');
        el.style.removeProperty('background-image');
        el.style.removeProperty('background-clip');
        el.style.removeProperty('-webkit-background-clip');
        if (!isRootEditable) {
            el.style.removeProperty('box-shadow');
        }
        const styleAttr = el.getAttribute('style');
        if (styleAttr !== null && !styleAttr.trim()) {
            el.removeAttribute('style');
        }
    }
}

function isElementTextFullyInRange(el, range) {
    if (!el || !range || !range.intersectsNode(el)) return false;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    let firstText = null;
    let lastText = null;
    let node;
    while ((node = walker.nextNode())) {
        if (node.nodeValue && node.nodeValue.length > 0) {
            if (!firstText) firstText = node;
            lastText = node;
        }
    }
    if (!firstText || !lastText) return true;
    try {
        return range.isPointInRange(firstText, 0) && range.isPointInRange(lastText, lastText.nodeValue.length);
    } catch (e) {
        return false;
    }
}

function applySeamlessHighlight(editableRoot, val) {
    if (!editableRoot) return;

    // 1. Remove any pasted <style> tags inside the editable container that could enforce background rules
    editableRoot.querySelectorAll('style').forEach(s => s.remove());

    // 2. Strip pasted CSS backgrounds merged onto the editable root itself (preserve table cells and .element-content)
    const rootTag = editableRoot.tagName ? editableRoot.tagName.toUpperCase() : '';
    if (rootTag !== 'TD' && rootTag !== 'TH' && !editableRoot.classList.contains('element-content')) {
        stripCssBackgroundProps(editableRoot, true);
    }

    // 3. Ensure focus and a valid non-collapsed selection inside editableRoot
    const sel = window.getSelection();
    let range = (sel && sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;
    const hasValidRange = range && editableRoot.contains(range.commonAncestorContainer) && !range.collapsed;

    try { editableRoot.focus({ preventScroll: true }); } catch (e) { editableRoot.focus(); }

    if (!hasValidRange) {
        range = document.createRange();
        range.selectNodeContents(editableRoot);
    }
    sel.removeAllRanges();
    sel.addRange(range);

    // 4. Strip conflicting pasted CSS backgrounds from block elements, non-highlight pasted elements,
    // and any existing highlight spans whose text is fully covered by the active selection.
    const blockTags = new Set([
        'DIV', 'P', 'PRE', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
        'UL', 'OL', 'LI', 'DL', 'DT', 'DD', 'SECTION', 'ARTICLE', 'HEADER',
        'FOOTER', 'MAIN', 'ASIDE', 'FIGURE', 'FIGCAPTION'
    ]);
    const tableStructuralTags = new Set(['TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TD', 'TH']);

    editableRoot.querySelectorAll('*').forEach(el => {
        const tag = el.tagName ? el.tagName.toUpperCase() : '';
        if (tableStructuralTags.has(tag)) return;

        const isPastedOrBlock = blockTags.has(tag) || !el.hasAttribute('data-opub-hilite');
        const isFullySelected = isElementTextFullyInRange(el, range);

        if (isPastedOrBlock || isFullySelected) {
            stripCssBackgroundProps(el, false);
            if (isFullySelected) {
                el.removeAttribute('data-opub-hilite');
            }
        }

        // Prevent user-agent default yellow background on pasted <mark> elements
        if (tag === 'MARK' && !el.style.backgroundColor) {
            el.style.backgroundColor = 'transparent';
        }
    });

    // Re-assert the selection range prior to execCommand
    sel.removeAllRanges();
    sel.addRange(range);

    // 5. Apply the highlight color via execCommand
    let applied = false;
    try {
        applied = document.execCommand('hiliteColor', false, val);
    } catch (e) {}
    if (!applied) {
        try {
            document.execCommand('backColor', false, val);
        } catch (e) {}
    }

    if (rootTag !== 'TD' && rootTag !== 'TH' && !editableRoot.classList.contains('element-content')) {
        stripCssBackgroundProps(editableRoot, true);
    }

    // 6. Post-pass: verify all selected text nodes have the highlight color and tag highlight spans
    const postRange = (sel && sel.rangeCount > 0) ? sel.getRangeAt(0) : range;

    editableRoot.querySelectorAll('*').forEach(el => {
        const tag = el.tagName ? el.tagName.toUpperCase() : '';
        if (tableStructuralTags.has(tag) || blockTags.has(tag)) {
            if (blockTags.has(tag)) {
                stripCssBackgroundProps(el, false);
            }
            return;
        }
        if (el.style && el.style.backgroundColor && el.style.backgroundColor !== 'transparent' && el.style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            try {
                if (postRange && postRange.intersectsNode(el)) {
                    el.setAttribute('data-opub-hilite', 'true');
                }
            } catch (e) {
                el.setAttribute('data-opub-hilite', 'true');
            }
        }
    });

    // Ensure any selected text nodes missed by execCommand (e.g. inside <pre>/<code> or display:inline-block) receive the highlight
    if (postRange && val && val !== 'transparent' && val !== 'none') {
        const textNodesToFix = [];
        const walker = document.createTreeWalker(editableRoot, NodeFilter.SHOW_TEXT, null, false);
        let tNode;
        while ((tNode = walker.nextNode())) {
            if (!tNode.nodeValue || !tNode.nodeValue.trim()) continue;
            let intersects = false;
            try { intersects = postRange.intersectsNode(tNode); } catch (e) {}
            if (!intersects) continue;

            let curr = tNode.parentElement;
            let hasHiliteAncestor = false;
            while (curr && curr !== editableRoot && editableRoot.contains(curr)) {
                const cTag = curr.tagName ? curr.tagName.toUpperCase() : '';
                if (!blockTags.has(cTag) && !tableStructuralTags.has(cTag)) {
                    if (curr.style && curr.style.backgroundColor && curr.style.backgroundColor !== 'transparent' && curr.style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                        if (isElementTextFullyInRange(curr, postRange)) {
                            curr.style.backgroundColor = val;
                            curr.setAttribute('data-opub-hilite', 'true');
                            hasHiliteAncestor = true;
                            break;
                        }
                    }
                }
                curr = curr.parentElement;
            }
            if (!hasHiliteAncestor) {
                const start = (tNode === postRange.startContainer) ? postRange.startOffset : 0;
                const end = (tNode === postRange.endContainer) ? postRange.endOffset : tNode.nodeValue.length;
                if (start < end) {
                    textNodesToFix.push({ tNode, start, end });
                }
            }
        }

        if (textNodesToFix.length > 0) {
            let firstSpan = null;
            let lastSpan = null;
            textNodesToFix.forEach(({ tNode, start, end }) => {
                if (start >= end || !tNode.nodeValue) return;
                let targetText = tNode;
                if (end < targetText.nodeValue.length) {
                    targetText.splitText(end);
                }
                if (start > 0) {
                    targetText = targetText.splitText(start);
                }

                const parent = targetText.parentElement;
                const pTag = parent && parent.tagName ? parent.tagName.toUpperCase() : '';
                if (parent && parent !== editableRoot && !blockTags.has(pTag) && !tableStructuralTags.has(pTag) && parent.childNodes.length === 1) {
                    parent.style.backgroundColor = val;
                    parent.setAttribute('data-opub-hilite', 'true');
                    if (!firstSpan) firstSpan = parent;
                    lastSpan = parent;
                } else if (targetText.parentNode) {
                    const span = document.createElement('span');
                    span.style.backgroundColor = val;
                    span.setAttribute('data-opub-hilite', 'true');
                    targetText.parentNode.insertBefore(span, targetText);
                    span.appendChild(targetText);
                    if (!firstSpan) firstSpan = span;
                    lastSpan = span;
                }
            });

            if (firstSpan && lastSpan) {
                const newRange = document.createRange();
                newRange.setStartBefore(firstSpan);
                newRange.setEndAfter(lastSpan);
                sel.removeAllRanges();
                sel.addRange(newRange);
            }
        }
    }
}

document.addEventListener('paste', (e) => {
    const target = e.target && e.target.closest ? e.target.closest('[contenteditable="true"]') : null;
    if (!target) return;
    const existingHilites = new Set(target.querySelectorAll('[data-opub-hilite="true"]'));
    setTimeout(() => {
        target.querySelectorAll('[data-opub-hilite]').forEach(el => {
            if (!existingHilites.has(el)) {
                el.removeAttribute('data-opub-hilite');
            }
        });
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && target.contains(sel.getRangeAt(0).commonAncestorContainer) && typeof state !== 'undefined') {
            state.lastRange = sel.getRangeAt(0).cloneRange();
        }
    }, 0);
}, true);


function execCmd(cmd, val) { 
    if(cmd === 'foreColor' && state.selectedEl && state.selectedEl.getAttribute('data-type') === 'shape') {
        const shapeDiv = state.selectedEl.querySelector('.element-content div');
        if(shapeDiv) shapeDiv.style.background = val;
        const svgShape = state.selectedEl.querySelector('svg *');
        if(svgShape) svgShape.style.stroke = val;
        updateThumbnails();
        pushHistory();
        return;
    }
    
    // --- NEW: Multi-Cell Table Formatting ---
    // If the user has multiple table cells selected (e.g. via the green cross), apply the formatting to all of them.
    if (window._tableSelectedCells && window._tableSelectedCells.length > 1) {
        try { document.execCommand('styleWithCSS', false, true); } catch(e) {}
        const sel = window.getSelection();
        
        window._tableSelectedCells.forEach(cell => {
            const editable = cell.querySelector('[contenteditable="true"]') || cell;
            editable.focus();
            sel.selectAllChildren(editable);
            
            if (cmd === 'hiliteColor' || cmd === 'backColor') {
                applySeamlessHighlight(editable, val);
            } else {
                document.execCommand(cmd, false, val);
            }
        });
        
        try { document.execCommand('styleWithCSS', false, false); } catch(e) {}
        
        // Restore focus to the first cell so the user doesn't lose their cursor
        const firstEditable = window._tableSelectedCells[0].querySelector('[contenteditable="true"]') || window._tableSelectedCells[0];
        firstEditable.focus();
        sel.selectAllChildren(firstEditable);
        if(sel.rangeCount > 0) state.lastRange = sel.getRangeAt(0).cloneRange();
        
        if(!state.isProgrammaticUpdate) updateFloatToolbarValues();
        return;
    }

    // Crucial fix: The native OS color picker (<input type="color">) steals focus when opened.
    // If we don't restore the selection before executing the command, it fails because
    // the text box is no longer the active selection.
    if (state.lastRange && state.lastRange.commonAncestorContainer && state.lastRange.commonAncestorContainer.isConnected) {
        if (!state.selectedEl || state.selectedEl.contains(state.lastRange.commonAncestorContainer)) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(state.lastRange);
        }
    }
    
    // Enable styleWithCSS to force the browser to use <span style="..."> instead of legacy <font> tags.
    // Legacy <font> tags notoriously fail to apply when the selection includes <br> tags or spans across complex nodes.
    try { document.execCommand('styleWithCSS', false, true); } catch(e) {}
    
    if (cmd === 'hiliteColor' || cmd === 'backColor') {
        const sel = window.getSelection();
        let editableRoot = null;
        if (sel && sel.rangeCount > 0 && sel.anchorNode) {
            const anchorEl = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
            if (anchorEl && anchorEl.closest) {
                editableRoot = anchorEl.closest('[contenteditable="true"]');
            }
        }
        if (!editableRoot && state.selectedEl) {
            editableRoot = state.selectedEl.querySelector('[contenteditable="true"]') ||
                           (state.selectedEl.getAttribute('contenteditable') === 'true' ? state.selectedEl : null);
        }
        if (editableRoot) {
            applySeamlessHighlight(editableRoot, val);
        } else {
            document.execCommand('hiliteColor', false, val);
            document.execCommand('backColor', false, val);
        }
    } else if (cmd === 'fontName' && state.selectedEl) {
        const waText = state.selectedEl.querySelector('.wa-text');
        if (waText) {
            waText.style.fontFamily = val;
            if (typeof syncWordArt === 'function') syncWordArt(state.selectedEl);
        } else {
            const editableRoot = state.selectedEl.querySelector('[contenteditable="true"]') ||
                                 state.selectedEl.querySelector('.element-content > div') ||
                                 state.selectedEl.querySelector('.element-content');
            const sel = window.getSelection();
            const hasActiveHighlight = sel && sel.rangeCount > 0 && !sel.isCollapsed && state.selectedEl.contains(sel.getRangeAt(0).commonAncestorContainer);

            if (hasActiveHighlight) {
                document.execCommand('fontName', false, val);
                state.selectedEl.querySelectorAll('font[face]').forEach(f => {
                    f.style.fontFamily = val;
                    f.removeAttribute('face');
                });
            } else if (editableRoot) {
                editableRoot.style.fontFamily = val;
                editableRoot.querySelectorAll('[style*="font-family"], font[face]').forEach(child => {
                    child.style.fontFamily = val;
                    if (child.hasAttribute('face')) child.removeAttribute('face');
                });
            } else {
                document.execCommand('fontName', false, val);
            }
        }
        if (typeof pushHistory === 'function') pushHistory();
    } else {
        document.execCommand(cmd, false, val); 
    }
    
    try { document.execCommand('styleWithCSS', false, false); } catch(e) {}
    
    // Ensure focus is explicitly maintained on the target text box so typing can resume
    if (state.selectedEl) {
        const textEditBox = state.selectedEl.querySelector('[contenteditable="true"]');
        if (textEditBox && document.activeElement !== textEditBox) {
            textEditBox.focus();
        }
    } 
    
    const sel = window.getSelection();
    if (sel.rangeCount > 0 && (!state.selectedEl || state.selectedEl.contains(sel.getRangeAt(0).commonAncestorContainer))) {
        state.lastRange = sel.getRangeAt(0).cloneRange();
    }
    
    if(!state.isProgrammaticUpdate) updateFloatToolbarValues();
    if (typeof updateThumbnails === 'function') updateThumbnails();
}


function execFloatCmd(cmd, val) {
    state.isProgrammaticUpdate = true;
    if (state.lastRange && state.lastRange.commonAncestorContainer && state.lastRange.commonAncestorContainer.isConnected) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(state.lastRange);
    }
    execCmd(cmd, val);
    setTimeout(() => { state.isProgrammaticUpdate = false; }, 100);
}


function toggleSpellCheck() {
    state.spellCheck = !state.spellCheck;
    try { localStorage.setItem('opub_spellcheck', state.spellCheck ? 'true' : 'false'); } catch(e) {}
    document.body.setAttribute('spellcheck', 'false');
    const userLang = navigator.language || 'en';
    
    document.querySelectorAll('.pub-element [contenteditable="true"], [contenteditable="true"]').forEach(el => {
        if (el.classList.contains('wa-text')) return;
        el.setAttribute('spellcheck', 'false');
        if (state.spellCheck) {
            el.setAttribute('lang', userLang);
        }
    });

    if (window.SpellCheckEngine) {
        window.SpellCheckEngine.run();
    }
    
    const status = state.spellCheck ? "ON" : "OFF";
    DialogSystem.alert('Spell Check', "Spell check toggled " + status);
}

function openThesaurus() { 
    if (window.ThesaurusTool) {
        window.ThesaurusTool.toggleSidebar();
    } else {
        window.open('https://www.thesaurus.com/', '_blank'); 
    }
}


function updateFloatToolbarValues() {
    const activeId = document.activeElement ? document.activeElement.id : null;
    if(['float-font', 'float-size', 'font-size', 'ribbon-font-btn'].includes(activeId)) return;

    let node = null;
    const rangeIsInsideSelected = state.lastRange &&
        state.lastRange.startContainer &&
        state.lastRange.startContainer.isConnected &&
        (!state.selectedEl || state.selectedEl.contains(state.lastRange.startContainer));

    if (rangeIsInsideSelected) {
        // Pinpoint the exact text node the cursor is touching
        node = state.lastRange.startContainer;
        if (node.nodeType === 3) {
            node = node.parentNode;
        } else {
            // If the browser targets a wrapper, dig down to the exact child element
            const offset = state.lastRange.startOffset;
            if (node.childNodes.length > offset) {
                let child = node.childNodes[offset];
                if (child.nodeType === 3) child = child.parentNode;
                if (child && child.nodeType === 1) node = child;
            }
        }
    } else if (state.selectedEl && state.selectedEl.nodeType === 1) {
        const editable = state.selectedEl.querySelector('[contenteditable="true"], .wa-text') ||
                         state.selectedEl.querySelector('.element-content > div') ||
                         state.selectedEl;
        const styledChild = editable ? editable.querySelector('[style*="font-family"], font[face]') : null;
        node = styledChild || editable;
    }

    if (node && node.nodeType === 1) {
        const computed = window.getComputedStyle(node);
        const fam = computed.fontFamily.replace(/['"]/g, '').split(',')[0].trim() || 'Segoe UI';
        
        // Update Font Family Labels
        const ribbonLbl = document.getElementById('ribbon-font-label');
        const floatLbl = document.getElementById('float-font-label');
        const ctxTextLbl = document.getElementById('ctx-font-label-text');
        const ctxWaLbl = document.getElementById('ctx-font-label-wa');
        if (ribbonLbl) ribbonLbl.innerText = fam;
        if (floatLbl) floatLbl.innerText = fam;
        if (ctxTextLbl) ctxTextLbl.innerText = fam;
        if (ctxWaLbl) ctxWaLbl.innerText = fam;

        const fSize = parseInt(computed.fontSize);
        
        const floatSelect = document.getElementById('float-size');
        const ribbonInput = document.getElementById('font-size');

        // Force the float dropdown to accept custom numbers
        if (floatSelect && !isNaN(fSize)) {
            let optionExists = Array.from(floatSelect.options).some(opt => parseInt(opt.value) === fSize);
            if(!optionExists) {
                const newOpt = document.createElement('option');
                newOpt.value = fSize;
                newOpt.innerText = fSize;
                floatSelect.appendChild(newOpt);
                
                // Sort options so the new number fits in naturally
                const opts = Array.from(floatSelect.options);
                opts.sort((a,b) => parseInt(a.value) - parseInt(b.value));
                floatSelect.innerHTML = '';
                opts.forEach(o => floatSelect.appendChild(o));
            }
            floatSelect.value = fSize;
        }
        
        // Update the Ribbon Input
        if (ribbonInput && !isNaN(fSize)) {
            ribbonInput.value = fSize;
        }
    }
}


function showFloatToolbar() {
    if (document.body.classList.contains('dashboard-open')) return;
    const dash = document.getElementById('dashboard-overlay');
    if (dash && dash.style.display !== 'none' && dash.style.display !== '') return;
    if(!state.selectedEl) return;
    
    const el = state.selectedEl;
    const contentImg = window.getElementContentImage ? window.getElementContentImage(el) : Array.from(el.querySelectorAll('img')).find(img => !img.closest('.element-border-art, .border-art-wrapper, #native-border-art-border'));
    const isImage = !!contentImg;
    const isBetaWordArt = el.querySelector('.beta-wa-img');
    const isSvg = el.querySelector('svg');
    const isShape = el.getAttribute('data-type') === 'shape';
    const isWordArt = el.querySelector('.wa-text');
    const isTable = el.querySelector('table');
    
    const waToolbar = document.getElementById('wa-float-toolbar');
    
    // Always reset both
    { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
    if (waToolbar) waToolbar.style.display = 'none';
    
    let activeToolbar = null;
    
    if (isBetaWordArt) {
        activeToolbar = waToolbar;
    } else {
        // Standard negative logic for the text toolbar
        if(isImage || (isShape && !isWordArt && !isTable)) return;
        if(isSvg && !isWordArt && !isShape) return;
        activeToolbar = floatToolbar;
    }

    if (!activeToolbar) return;

    const rect = state.selectedEl.getBoundingClientRect();
    activeToolbar.style.display = 'flex';
    
    if (activeToolbar === floatToolbar) {
        if (window._globalFloatPos) {
            activeToolbar.style.bottom = 'auto';
            activeToolbar.style.transform = 'none';
            activeToolbar.style.top = window._globalFloatPos.top + 'px';
            activeToolbar.style.left = window._globalFloatPos.left + 'px';
        } else {
            // Dock the text toolbar at the bottom center by default
            activeToolbar.style.top = 'auto';
            activeToolbar.style.bottom = '30px';
            activeToolbar.style.left = '50%';
            activeToolbar.style.transform = 'translateX(-50%)';
        }
        updateFloatToolbarValues();
    } else {
        // Position the WordArt toolbar near the object
        let top = rect.top - 80; 
        let left = rect.left;
        if (activeToolbar === waToolbar) top -= 20;
        if(top < 10) top = rect.bottom + 20; 
        if(left < 10) left = 10;
        
        activeToolbar.style.bottom = 'auto';
        activeToolbar.style.transform = 'none';
        activeToolbar.style.top = top + 'px';
        activeToolbar.style.left = left + 'px';
    }
}

function setFloatSize(val) {
    state.isProgrammaticUpdate = true;
    setTrueFontSize(val + 'px');
    setTimeout(() => { state.isProgrammaticUpdate = false; }, 100);
}

function setFloatFont(val) {
    state.isProgrammaticUpdate = true;
    if (state.lastRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(state.lastRange);
    }
    document.execCommand('fontName', false, val);
    setTimeout(() => { state.isProgrammaticUpdate = false; }, 100);
}


function isTextEditing() {
     const ae = document.activeElement;
     return !!(ae && (ae.isContentEditable || ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || (ae.closest && ae.closest('[contenteditable="true"]'))));
}
window.isTextEditing = isTextEditing;

// --- MIGRATED FONT LIST ---
const fontList = [
    "Arial", "Segoe UI", "Times New Roman", "Courier New", "Verdana", "Georgia", "Comic Sans MS", "Impact", "Trebuchet MS",
    "Abril Fatface", "Acme", "Anton", "Architects Daughter", "Archivo Black", "Arvo", "Bangers", "Barlow", "Bebas Neue", "Bitter",
    "Bree Serif", "Cabin", "Cairo", "Caveat", "Cinzel", "Comfortaa", "Comic Neue", "Concert One", "Cookie", "Courgette", "Creepster",
    "Crimson Text", "Dancing Script", "DM Sans", "Dosis", "EB Garamond", "Exo 2", "Fira Sans", "Fjalla One", "Fredoka One",
    "Gloria Hallelujah", "Great Vibes", "Heebo", "Hind", "IBM Plex Sans", "Inconsolata", "Indie Flower", "Josefin Sans", "Kanit",
    "Karla", "Lato", "Libre Baskerville", "Lobster", "Lora", "Manrope", "Maven Pro", "Merriweather", "Monoton", "Montserrat", "Mukta",
    "Nanum Gothic", "Noto Sans", "Nunito", "Old Standard TT", "Open Sans", "Orbitron", "Oswald", "Oxygen", "Pacifico", "Passion One",
    "Patrick Hand", "Permanent Marker", "Playfair Display", "Poppins", "Press Start 2P", "Prompt", "PT Sans", "PT Serif", "Quicksand",
    "Rajdhani", "Raleway", "Righteous", "Roboto", "Roboto Condensed", "Roboto Mono", "Roboto Slab", "Rubik", "Sacramento", "Satisfy",
    "Shadows Into Light", "Signika", "Slabo 27px", "Source Code Pro", "Source Sans Pro", "Space Mono", "Teko", "Titillium Web",
    "Ubuntu", "Varela Round", "Vollkorn", "Work Sans", "Yanone Kaffeesatz", "Zilla Slab"
];

/* =========================================================================
   STYLED TEXT BOX SYSTEM (v5.11.6)
   Dual-Mode Architecture: Creation Templates + Contextual Ribbon Styling
   ========================================================================= */

window.TextBoxStylesSystem = {
    presets: [
        {
            id: 'quote-teal',
            name: 'Pull Quote (Teal)',
            cat: 'quotes',
            desc: 'Editorial pull quote with teal left accent stripe',
            defaultWidth: 280,
            defaultHeight: 100,
            containerStyle: {
                background: 'rgba(0, 118, 112, 0.05)',
                border: 'none',
                borderLeft: '4px solid var(--ui-theme-color, #007670)',
                borderRadius: '0 8px 8px 0',
                boxShadow: 'none',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#1e293b',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: '15px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:rgba(0,118,112,0.08); border-left:3px solid #007670; border-radius:0 4px 4px 0;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'quote-gold',
            name: 'Quote (Warm Amber)',
            cat: 'quotes',
            desc: 'Warm amber quote with elegant gold border',
            defaultWidth: 280,
            defaultHeight: 100,
            containerStyle: {
                background: '#fffbeb',
                border: 'none',
                borderLeft: '4px solid #f59e0b',
                borderRadius: '4px',
                boxShadow: 'none',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#78350f',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#fffbeb; border-left:3px solid #f59e0b; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'callout-soft',
            name: 'Soft Notice Box',
            cat: 'quotes',
            desc: 'Gentle pastel fill with rounded border',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                padding: '12px 14px'
            },
            textStyle: {
                color: '#0f172a',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#f0f9ff; border:1px solid #bae6fd; border-radius:4px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'callout-tip',
            name: 'Pro Tip Callout',
            cat: 'quotes',
            desc: 'Amber tip box with subtle accent',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                padding: '12px 14px'
            },
            textStyle: {
                color: '#78350f',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#fffbeb; border:1px solid #fde68a; border-radius:4px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-dark',
            name: 'Modern Dark Card',
            cat: 'cards',
            desc: 'Deep slate card with high contrast light typography',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                border: '1px solid #334155',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#f8fafc',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:linear-gradient(145deg, #1e293b, #0f172a); border:1px solid #334155; border-radius:5px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-elevated',
            name: 'Elevated Soft Card',
            cat: 'cards',
            desc: 'Crisp white card with gentle elevation drop shadow',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#0f172a',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border:1px solid #e2e8f0; border-radius:5px; box-shadow:0 2px 6px rgba(0,0,0,0.1);',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-frosted',
            name: 'Frosted Glass Panel',
            cat: 'cards',
            desc: 'Translucent glassmorphic panel with soft blurred background',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                borderRadius: '10px',
                boxShadow: '0 6px 20px 0 rgba(31, 38, 135, 0.12)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#1e293b',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.9); border-radius:5px; box-shadow:0 2px 6px rgba(0,0,0,0.08);',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-header',
            name: 'Accent Header Card',
            cat: 'cards',
            desc: 'Structured card featuring a top colored theme banner border',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: '#ffffff',
                border: '1px solid #ccfbf1',
                borderTop: '5px solid var(--ui-theme-color, #007670)',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(0, 118, 112, 0.08)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#334155',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border:1px solid #ccfbf1; border-top:5px solid #007670; border-radius:4px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'stat-highlight',
            name: 'Metric / KPI Counter',
            cat: 'metrics',
            desc: 'Bold numeric stat callout box',
            defaultWidth: 220,
            defaultHeight: 90,
            containerStyle: {
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderTop: '4px solid var(--ui-theme-color, #007670)',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                padding: '14px 16px'
            },
            textStyle: {
                color: 'var(--ui-theme-color, #007670)',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '18px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#f8fafc; border:1px solid #e2e8f0; border-top:3px solid #007670; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'pill-vibrant',
            name: 'Vibrant Ribbon Pill',
            cat: 'metrics',
            desc: 'Smooth theme-colored pill banner for prominent alerts',
            defaultWidth: 240,
            defaultHeight: 50,
            containerStyle: {
                background: 'linear-gradient(135deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #004d40))',
                border: 'none',
                borderRadius: '999px',
                boxShadow: '0 4px 12px rgba(0, 118, 112, 0.3)',
                padding: '10px 20px'
            },
            textStyle: {
                color: '#ffffff',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:linear-gradient(135deg, #007670, #004d40); border-radius:12px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'pill-dark',
            name: 'Dark Badge Pill',
            cat: 'metrics',
            desc: 'Compact dark pill with vibrant cyan badge text',
            defaultWidth: 240,
            defaultHeight: 50,
            containerStyle: {
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '999px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                padding: '10px 18px'
            },
            textStyle: {
                color: '#38bdf8',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#0f172a; border:1px solid #334155; border-radius:12px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'ticket-coupon',
            name: 'Dashed Voucher / Ticket',
            cat: 'borders',
            desc: 'Dashed coupon card with promo styling',
            defaultWidth: 240,
            defaultHeight: 90,
            containerStyle: {
                background: '#fefce8',
                border: '2px dashed #ca8a04',
                borderRadius: '8px',
                boxShadow: 'none',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#854d0e',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#fefce8; border:2px dashed #ca8a04; border-radius:4px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'frame-classic',
            name: 'Classic Editorial Frame',
            cat: 'borders',
            desc: 'Vintage double frame with classic serif typography',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#faf8f5',
                border: '1px solid #78350f',
                outline: '1px solid #78350f',
                outlineOffset: '-4px',
                borderRadius: '0px',
                boxShadow: 'none',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#451a03',
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                fontStyle: 'italic',
                textAlign: 'center'
            },
            previewCSS: 'background:#faf8f5; border:1px solid #78350f; outline:1px solid #78350f; outline-offset:-2px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'accent-top',
            name: 'Minimal Top-Accent',
            cat: 'borders',
            desc: 'Modern card with prominent top color line',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderTop: '4px solid var(--ui-theme-color, #007670)',
                borderRadius: '0 0 6px 6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                padding: '12px 14px'
            },
            textStyle: {
                color: '#0f172a',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border:1px solid #e2e8f0; border-top:3px solid #007670; border-radius:0 0 3px 3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'solid-theme',
            name: 'Solid Theme Callout',
            cat: 'cards',
            desc: 'Full theme fill with white text matching UI color',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: 'var(--ui-theme-color, #007670)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#ffffff',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#007670; border-radius:4px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'quote-modern',
            name: 'Modern Indigo Quote',
            cat: 'quotes',
            desc: 'Contemporary blockquote with bold indigo border and slate tint',
            defaultWidth: 280,
            defaultHeight: 100,
            containerStyle: {
                background: '#f8fafc',
                border: 'none',
                borderLeft: '4px solid #6366f1',
                borderRadius: '0 6px 6px 0',
                boxShadow: 'none',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#334155',
                fontFamily: "'Segoe UI', sans-serif",
                fontStyle: 'italic',
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#f8fafc; border-left:3px solid #6366f1; border-radius:0 4px 4px 0;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'callout-warning',
            name: 'Caution / Warning Box',
            cat: 'quotes',
            desc: 'High-visibility amber alert box for notices and caveats',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#fffbeb',
                border: '1px solid #fcd34d',
                borderLeft: '5px solid #d97706',
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#92400e',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#fffbeb; border:1px solid #fcd34d; border-left:4px solid #d97706; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'callout-success',
            name: 'Success / Tip Box',
            cat: 'quotes',
            desc: 'Gentle mint green callout for key takeaways and approvals',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderLeft: '5px solid #16a34a',
                borderRadius: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#166534',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#f0fdf4; border:1px solid #bbf7d0; border-left:4px solid #16a34a; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-sunset',
            name: 'Sunset Gradient Card',
            cat: 'cards',
            desc: 'Warm sunset orange-rose gradient with radiant white text',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: 'linear-gradient(135deg, #f97316, #e11d48)',
                border: 'none',
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#ffffff',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:linear-gradient(135deg, #f97316, #e11d48); border-radius:5px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-ocean',
            name: 'Deep Ocean Gradient Card',
            cat: 'cards',
            desc: 'Rich oceanic teal-to-blue gradient panel with crisp white text',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: 'linear-gradient(135deg, #0ea5e9, #1e40af)',
                border: 'none',
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#ffffff',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:linear-gradient(135deg, #0ea5e9, #1e40af); border-radius:5px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-neon-cyber',
            name: 'Cyber Neon Card',
            cat: 'cards',
            desc: 'Dark tech container with luminous cyan glowing border',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: '#090d16',
                border: '1px solid #06b6d4',
                borderRadius: '8px',
                boxShadow: '0 0 12px rgba(6, 182, 212, 0.35)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#e0f2fe',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#090d16; border:1px solid #06b6d4; border-radius:4px; box-shadow:0 0 6px rgba(6,182,212,0.4);',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'pill-gold',
            name: 'Gold Foil Pill',
            cat: 'metrics',
            desc: 'Warm amber gold metallic pill badge with dark contrast lettering',
            defaultWidth: 240,
            defaultHeight: 50,
            containerStyle: {
                background: 'linear-gradient(135deg, #fef08a, #d97706)',
                border: '1px solid #b45309',
                borderRadius: '999px',
                boxShadow: '0 3px 10px rgba(217, 119, 6, 0.25)',
                padding: '10px 20px'
            },
            textStyle: {
                color: '#451a03',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:linear-gradient(135deg, #fef08a, #d97706); border:1px solid #b45309; border-radius:12px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'stat-glass',
            name: 'Glassmorphic Metric Card',
            cat: 'metrics',
            desc: 'Translucent frosted stat counter box with dark accent text',
            defaultWidth: 220,
            defaultHeight: 90,
            containerStyle: {
                background: 'rgba(255, 255, 255, 0.82)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '12px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.06)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#0f172a',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '18px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:rgba(255,255,255,0.85); border:1px solid #cbd5e1; border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.06);',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'ticket-retro',
            name: 'Antique / Perforated Ticket',
            cat: 'borders',
            desc: 'Classic vintage coupon with dotted outline and aged sepia tone',
            defaultWidth: 250,
            defaultHeight: 90,
            containerStyle: {
                background: '#fffbeb',
                border: '2px dotted #92400e',
                borderRadius: '4px',
                boxShadow: 'none',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#78350f',
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#fffbeb; border:2px dotted #92400e; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'frame-certificate',
            name: 'Formal Certificate Border',
            cat: 'borders',
            desc: 'Double gold line formal diploma / award certificate style frame',
            defaultWidth: 270,
            defaultHeight: 110,
            containerStyle: {
                background: '#ffffff',
                border: '3px double #d97706',
                borderRadius: '0px',
                boxShadow: 'none',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#78350f',
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                textAlign: 'center',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border:3px double #d97706;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'accent-left-bold',
            name: 'Editorial Lead Deck',
            cat: 'borders',
            desc: 'Clean white panel with heavy dark slate left band',
            defaultWidth: 270,
            defaultHeight: 100,
            containerStyle: {
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderLeft: '6px solid #1e293b',
                borderRadius: '0 6px 6px 0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#0f172a',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#f8fafc; border:1px solid #e2e8f0; border-left:4px solid #1e293b; border-radius:0 3px 3px 0;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'quote-crimson',
            name: 'Crimson Editorial Quote',
            cat: 'quotes',
            desc: 'Rich crimson left border with delicate blush tint and serif typography',
            defaultWidth: 280,
            defaultHeight: 100,
            containerStyle: {
                background: '#fff1f2',
                border: 'none',
                borderLeft: '4px solid #be123c',
                borderRadius: '0 6px 6px 0',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#881337',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#fff1f2; border-left:3px solid #be123c; border-radius:0 3px 3px 0;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'quote-slate-minimal',
            name: 'Minimal Slate Blockquote',
            cat: 'quotes',
            desc: 'Subtle slate border line on clean white background',
            defaultWidth: 280,
            defaultHeight: 100,
            containerStyle: {
                background: '#ffffff',
                border: 'none',
                borderLeft: '3px solid #94a3b8',
                borderRadius: '0',
                padding: '12px 18px'
            },
            textStyle: {
                color: '#475569',
                fontFamily: "'Segoe UI', sans-serif",
                fontStyle: 'italic',
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border-left:3px solid #94a3b8;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'quote-emerald',
            name: 'Emerald Forest Quote',
            cat: 'quotes',
            desc: 'Forest green left accent with soft mint background',
            defaultWidth: 280,
            defaultHeight: 100,
            containerStyle: {
                background: '#ecfdf5',
                border: 'none',
                borderLeft: '4px solid #047857',
                borderRadius: '0 6px 6px 0',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#064e3b',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ecfdf5; border-left:3px solid #047857; border-radius:0 3px 3px 0;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'quote-purple-royal',
            name: 'Royal Purple Quote',
            cat: 'quotes',
            desc: 'Stately violet accent border with soft lavender fill',
            defaultWidth: 280,
            defaultHeight: 100,
            containerStyle: {
                background: '#f5f3ff',
                border: 'none',
                borderLeft: '4px solid #7c3aed',
                borderRadius: '0 6px 6px 0',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#4c1d95',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#f5f3ff; border-left:3px solid #7c3aed; border-radius:0 3px 3px 0;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'quote-navy-academic',
            name: 'Academic Navy Quote',
            cat: 'quotes',
            desc: 'Scholarly navy border line with crisp light slate paper tint',
            defaultWidth: 280,
            defaultHeight: 100,
            containerStyle: {
                background: '#f8fafc',
                border: 'none',
                borderLeft: '5px double #1e3a8a',
                borderRadius: '0 4px 4px 0',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#172554',
                fontFamily: "'Times New Roman', serif",
                fontStyle: 'italic',
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#f8fafc; border-left:4px double #1e3a8a;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'quote-charcoal-bold',
            name: 'Bold Charcoal Pullquote',
            cat: 'quotes',
            desc: 'Heavy dark slate left band with contemporary sans-serif copy',
            defaultWidth: 280,
            defaultHeight: 100,
            containerStyle: {
                background: '#f4f4f5',
                border: 'none',
                borderLeft: '6px solid #18181b',
                borderRadius: '0 4px 4px 0',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#09090b',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                fontWeight: '600',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#f4f4f5; border-left:4px solid #18181b;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'quote-coral',
            name: 'Warm Coral Quote',
            cat: 'quotes',
            desc: 'Vibrant coral accent border with gentle warm glow',
            defaultWidth: 280,
            defaultHeight: 100,
            containerStyle: {
                background: '#fff1f2',
                border: 'none',
                borderLeft: '4px solid #f43f5e',
                borderRadius: '0 8px 8px 0',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#9f1239',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#fff1f2; border-left:3px solid #f43f5e; border-radius:0 4px 4px 0;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'quote-coffee',
            name: 'Vintage Sepia Quote',
            cat: 'quotes',
            desc: 'Warm coffee brown accent with vintage parchment tint',
            defaultWidth: 280,
            defaultHeight: 100,
            containerStyle: {
                background: '#fefce8',
                border: 'none',
                borderLeft: '4px solid #78350f',
                borderRadius: '0 4px 4px 0',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#451a03',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#fefce8; border-left:3px solid #78350f;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'callout-danger',
            name: 'Critical Alert Box',
            cat: 'quotes',
            desc: 'High-contrast red alert callout for warnings and errors',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderLeft: '5px solid #dc2626',
                borderRadius: '6px',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#991b1b',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#fef2f2; border:1px solid #fecaca; border-left:4px solid #dc2626; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'callout-info',
            name: 'Cyan Information Notice',
            cat: 'quotes',
            desc: 'Crisp informational notice box with cyan highlight bar',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderLeft: '5px solid #0284c7',
                borderRadius: '6px',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#075985',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#f0f9ff; border:1px solid #bae6fd; border-left:4px solid #0284c7; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'callout-note',
            name: 'Neutral Note Callout',
            cat: 'quotes',
            desc: 'Gentle neutral card with subtle grey border for side notes',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#334155',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#f8fafc; border:1px solid #cbd5e1; border-radius:4px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'callout-insight',
            name: 'Deep Insight Callout',
            cat: 'quotes',
            desc: 'Deep indigo accent box for key takeaways and highlights',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#eef2ff',
                border: '1px solid #c7d2fe',
                borderLeft: '5px solid #4338ca',
                borderRadius: '6px',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#312e81',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#eef2ff; border:1px solid #c7d2fe; border-left:4px solid #4338ca; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'callout-quote-centered',
            name: 'Centered Editorial Quote',
            cat: 'quotes',
            desc: 'Elegant top and bottom dividing lines with centered quote copy',
            defaultWidth: 280,
            defaultHeight: 100,
            containerStyle: {
                background: '#ffffff',
                border: 'none',
                borderTop: '2px solid #cbd5e1',
                borderBottom: '2px solid #cbd5e1',
                borderRadius: '0',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#1e293b',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: '14px',
                textAlign: 'center',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border-top:2px solid #cbd5e1; border-bottom:2px solid #cbd5e1;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'callout-dark-quote',
            name: 'Midnight Dark Quote',
            cat: 'quotes',
            desc: 'Deep slate container with luminous teal left stripe',
            defaultWidth: 280,
            defaultHeight: 100,
            containerStyle: {
                background: '#0f172a',
                border: 'none',
                borderLeft: '4px solid #14b8a6',
                borderRadius: '0 6px 6px 0',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#f1f5f9',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#0f172a; border-left:3px solid #14b8a6; border-radius:0 3px 3px 0;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'callout-gradient-bar',
            name: 'Prism Accent Quote',
            cat: 'quotes',
            desc: 'Multi-color vibrant gradient left bar on crisp white card',
            defaultWidth: 280,
            defaultHeight: 100,
            containerStyle: {
                background: '#ffffff',
                border: '1px solid #f1f5f9',
                borderLeft: '5px solid #ec4899',
                borderRadius: '0 8px 8px 0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#1e293b',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border:1px solid #f1f5f9; border-left:4px solid #ec4899; border-radius:0 4px 4px 0;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'callout-question',
            name: 'Reflection / Question Box',
            cat: 'quotes',
            desc: 'Amber dashed container for thought-provoking discussion points',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#fffbeb',
                border: '2px dashed #f59e0b',
                borderRadius: '8px',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#92400e',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#fffbeb; border:2px dashed #f59e0b; border-radius:4px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'callout-announcement',
            name: 'Notice Announcement',
            cat: 'quotes',
            desc: 'Royal blue card with top color line for prominent announcements',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderTop: '4px solid #2563eb',
                borderRadius: '0 0 6px 6px',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#1e40af',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                fontWeight: '600',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#eff6ff; border:1px solid #bfdbfe; border-top:3px solid #2563eb; border-radius:0 0 3px 3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'callout-checklist',
            name: 'Action Item Callout',
            cat: 'quotes',
            desc: 'Light mint box with green accent for tasks and requirements',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderLeft: '5px solid #10b981',
                borderRadius: '6px',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#065f46',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#f0fdf4; border:1px solid #bbf7d0; border-left:4px solid #10b981; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-emerald-gradient',
            name: 'Emerald Isle Card',
            cat: 'cards',
            desc: 'Rich emerald-to-teal gradient panel with bright white text',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: 'linear-gradient(135deg, #059669, #0d9488)',
                border: 'none',
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#ffffff',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:linear-gradient(135deg, #059669, #0d9488); border-radius:5px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-royal-violet',
            name: 'Royal Violet Card',
            cat: 'cards',
            desc: 'Deep violet to indigo gradient with radiant white copy',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: 'linear-gradient(135deg, #7c3aed, #4338ca)',
                border: 'none',
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#ffffff',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:linear-gradient(135deg, #7c3aed, #4338ca); border-radius:5px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-midnight-gold',
            name: 'Midnight Gold Card',
            cat: 'cards',
            desc: 'Obsidian dark card with metallic gold border and champagne text',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: '#09090b',
                border: '1px solid #eab308',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#fef08a',
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#09090b; border:1px solid #eab308; border-radius:4px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-peachy-glow',
            name: 'Peach Glow Pastel',
            cat: 'cards',
            desc: 'Gentle warm pastel peach card with terracotta lettering',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: 'linear-gradient(135deg, #ffedd5, #fee2e2)',
                border: '1px solid #fed7aa',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(254, 215, 170, 0.4)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#9a3412',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:linear-gradient(135deg, #ffedd5, #fee2e2); border:1px solid #fed7aa; border-radius:5px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-lavender-mist',
            name: 'Lavender Mist Card',
            cat: 'cards',
            desc: 'Soft pastel lilac panel with deep purple text',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: 'linear-gradient(135deg, #ede9fe, #fbcfe8)',
                border: '1px solid #ddd6fe',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(221, 214, 254, 0.4)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#5b21b6',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:linear-gradient(135deg, #ede9fe, #fbcfe8); border:1px solid #ddd6fe; border-radius:5px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-minty-fresh',
            name: 'Mint Breeze Card',
            cat: 'cards',
            desc: 'Refreshing pastel mint gradient card with deep teal text',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: 'linear-gradient(135deg, #d1fae5, #cffafe)',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(167, 243, 208, 0.4)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#065f46',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:linear-gradient(135deg, #d1fae5, #cffafe); border:1px solid #a7f3d0; border-radius:5px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-slate-glass',
            name: 'Smoky Glass Panel',
            cat: 'cards',
            desc: 'Translucent dark glassmorphic panel with soft backdrop blur',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#f8fafc',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:rgba(15,23,42,0.8); border:1px solid rgba(255,255,255,0.25); border-radius:5px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-rose-gold',
            name: 'Rose Gold Luxury Card',
            cat: 'cards',
            desc: 'Delicate metallic rose gold gradient with rich wine copy',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: 'linear-gradient(135deg, #fecdd3, #fbcfe8)',
                border: '1px solid #f43f5e',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(244, 63, 94, 0.2)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#881337',
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:linear-gradient(135deg, #fecdd3, #fbcfe8); border:1px solid #f43f5e; border-radius:4px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-aurora',
            name: 'Northern Lights Card',
            cat: 'cards',
            desc: 'Luminous cyan to purple aurora borealis gradient card',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                border: 'none',
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#ffffff',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:linear-gradient(135deg, #06b6d4, #8b5cf6); border-radius:5px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-fire-ember',
            name: 'Fire Ember Card',
            cat: 'cards',
            desc: 'Fiery red-to-orange gradient container with bold white text',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: 'linear-gradient(135deg, #dc2626, #ea580c)',
                border: 'none',
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#ffffff',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:linear-gradient(135deg, #dc2626, #ea580c); border-radius:5px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-charcoal-matte',
            name: 'Matte Obsidian Panel',
            cat: 'cards',
            desc: 'Ultra-clean matte dark card with subtle boundary styling',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#f4f4f5',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#18181b; border:1px solid #27272a; border-radius:4px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-minimal-ghost',
            name: 'Ghost Floating Card',
            cat: 'cards',
            desc: 'Borderless white card elevated by soft multi-tier drop shadow',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)',
                padding: '16px 18px'
            },
            textStyle: {
                color: '#0f172a',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border-radius:6px; box-shadow:0 3px 8px rgba(0,0,0,0.12);',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-header-crimson',
            name: 'Crimson Banner Card',
            cat: 'cards',
            desc: 'Structured card featuring a top crimson banner accent',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderTop: '5px solid #9f1239',
                borderRadius: '0 0 8px 8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#1e293b',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border:1px solid #e2e8f0; border-top:4px solid #9f1239; border-radius:0 0 4px 4px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-header-navy',
            name: 'Navy Executive Card',
            cat: 'cards',
            desc: 'White executive card with top midnight navy bar',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderTop: '5px solid #0f172a',
                borderRadius: '0 0 8px 8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#334155',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border:1px solid #e2e8f0; border-top:4px solid #0f172a; border-radius:0 0 4px 4px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-header-gold',
            name: 'Gold Premium Card',
            cat: 'cards',
            desc: 'Warm ivory container with elegant top gold accent line',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderTop: '5px solid #d97706',
                borderRadius: '0 0 8px 8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#78350f',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#fffbeb; border:1px solid #fde68a; border-top:4px solid #d97706; border-radius:0 0 4px 4px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-blueprint',
            name: 'Architect Blueprint Card',
            cat: 'cards',
            desc: 'Technical blue card inspired by architectural drafting sheets',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: '#1e3a8a',
                border: '1px solid #3b82f6',
                borderRadius: '4px',
                boxShadow: 'none',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#eff6ff',
                fontFamily: "'Courier New', monospace",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#1e3a8a; border:1px solid #3b82f6; border-radius:2px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'card-retro-clay',
            name: 'Terracotta Clay Card',
            cat: 'cards',
            desc: 'Warm earthy terracotta clay gradient with ivory text',
            defaultWidth: 260,
            defaultHeight: 110,
            containerStyle: {
                background: 'linear-gradient(135deg, #c2410c, #9a3412)',
                border: 'none',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(194, 65, 12, 0.3)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#fff7ed',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:linear-gradient(135deg, #c2410c, #9a3412); border-radius:5px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'stat-navy',
            name: 'Executive Stat Box',
            cat: 'metrics',
            desc: 'Deep navy box with bright amber gold metric typography',
            defaultWidth: 220,
            defaultHeight: 90,
            containerStyle: {
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(15,23,42,0.3)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#fbbf24',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '18px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#0f172a; border:1px solid #1e293b; border-radius:4px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'stat-emerald',
            name: 'Growth Metric Card',
            cat: 'metrics',
            desc: 'White card with vibrant green top border and metric text',
            defaultWidth: 220,
            defaultHeight: 90,
            containerStyle: {
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderTop: '4px solid #10b981',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#047857',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '18px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#ffffff; border:1px solid #e2e8f0; border-top:3px solid #10b981; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'stat-rose',
            name: 'KPI Target Callout',
            cat: 'metrics',
            desc: 'Soft blush card with bold ruby red metric numbering',
            defaultWidth: 220,
            defaultHeight: 90,
            containerStyle: {
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderTop: '4px solid #f43f5e',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(244,63,94,0.1)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#e11d48',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '18px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#fff1f2; border:1px solid #fecdd3; border-top:3px solid #f43f5e; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'stat-minimal-split',
            name: 'Clean Metric Counter',
            cat: 'metrics',
            desc: 'Clean white container with 2px bottom accent line',
            defaultWidth: 220,
            defaultHeight: 90,
            containerStyle: {
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderBottom: '3px solid #64748b',
                borderRadius: '4px',
                boxShadow: 'none',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#0f172a',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '18px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#ffffff; border:1px solid #cbd5e1; border-bottom:2px solid #64748b; border-radius:2px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'stat-dark-neon',
            name: 'Cyber Metric Display',
            cat: 'metrics',
            desc: 'Dark tech display with luminous neon green text',
            defaultWidth: 220,
            defaultHeight: 90,
            containerStyle: {
                background: '#022c22',
                border: '1px solid #10b981',
                borderRadius: '6px',
                boxShadow: '0 0 10px rgba(16,185,129,0.3)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#34d399',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '18px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#022c22; border:1px solid #10b981; border-radius:3px; box-shadow:0 0 6px rgba(16,185,129,0.4);',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'pill-emerald',
            name: 'Emerald Success Pill',
            cat: 'metrics',
            desc: 'Vibrant green gradient pill for confirmed statuses',
            defaultWidth: 240,
            defaultHeight: 50,
            containerStyle: {
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '999px',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                padding: '10px 20px'
            },
            textStyle: {
                color: '#ffffff',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:linear-gradient(135deg, #10b981, #059669); border-radius:12px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'pill-rose',
            name: 'Ruby Promo Pill',
            cat: 'metrics',
            desc: 'Bright rose-red gradient pill for discounts and highlights',
            defaultWidth: 240,
            defaultHeight: 50,
            containerStyle: {
                background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                border: 'none',
                borderRadius: '999px',
                boxShadow: '0 4px 12px rgba(244,63,94,0.3)',
                padding: '10px 20px'
            },
            textStyle: {
                color: '#ffffff',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:linear-gradient(135deg, #f43f5e, #be123c); border-radius:12px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'pill-purple',
            name: 'Ultra Violet Pill',
            cat: 'metrics',
            desc: 'Vibrant violet-to-purple gradient pill banner',
            defaultWidth: 240,
            defaultHeight: 50,
            containerStyle: {
                background: 'linear-gradient(135deg, #a855f7, #6b21a8)',
                border: 'none',
                borderRadius: '999px',
                boxShadow: '0 4px 12px rgba(168,85,247,0.3)',
                padding: '10px 20px'
            },
            textStyle: {
                color: '#ffffff',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:linear-gradient(135deg, #a855f7, #6b21a8); border-radius:12px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'pill-sky',
            name: 'Sky Blue Pill',
            cat: 'metrics',
            desc: 'Crisp light cyan-to-blue gradient pill',
            defaultWidth: 240,
            defaultHeight: 50,
            containerStyle: {
                background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                border: 'none',
                borderRadius: '999px',
                boxShadow: '0 4px 12px rgba(56,189,248,0.3)',
                padding: '10px 20px'
            },
            textStyle: {
                color: '#ffffff',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:linear-gradient(135deg, #38bdf8, #0284c7); border-radius:12px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'pill-sunset',
            name: 'Tangerine Sunset Pill',
            cat: 'metrics',
            desc: 'Warm bright orange gradient pill badge',
            defaultWidth: 240,
            defaultHeight: 50,
            containerStyle: {
                background: 'linear-gradient(135deg, #fb923c, #ea580c)',
                border: 'none',
                borderRadius: '999px',
                boxShadow: '0 4px 12px rgba(251,146,60,0.3)',
                padding: '10px 20px'
            },
            textStyle: {
                color: '#ffffff',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:linear-gradient(135deg, #fb923c, #ea580c); border-radius:12px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'pill-silver',
            name: 'Silver Metallic Pill',
            cat: 'metrics',
            desc: 'Refined brushed platinum pill with dark contrast text',
            defaultWidth: 240,
            defaultHeight: 50,
            containerStyle: {
                background: 'linear-gradient(135deg, #f8fafc, #cbd5e1)',
                border: '1px solid #94a3b8',
                borderRadius: '999px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                padding: '10px 20px'
            },
            textStyle: {
                color: '#1e293b',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:linear-gradient(135deg, #f8fafc, #cbd5e1); border:1px solid #94a3b8; border-radius:12px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'pill-outline-theme',
            name: 'Theme Outline Pill',
            cat: 'metrics',
            desc: 'White pill with crisp 2px theme color border',
            defaultWidth: 240,
            defaultHeight: 50,
            containerStyle: {
                background: '#ffffff',
                border: '2px solid var(--ui-theme-color, #007670)',
                borderRadius: '999px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                padding: '10px 20px'
            },
            textStyle: {
                color: 'var(--ui-theme-color, #007670)',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#ffffff; border:2px solid #007670; border-radius:12px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'pill-outline-dark',
            name: 'Dark Outline Pill',
            cat: 'metrics',
            desc: 'Transparent pill with bold 2px black border',
            defaultWidth: 240,
            defaultHeight: 50,
            containerStyle: {
                background: 'transparent',
                border: '2px solid #0f172a',
                borderRadius: '999px',
                padding: '10px 20px'
            },
            textStyle: {
                color: '#0f172a',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:transparent; border:2px solid #0f172a; border-radius:12px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'badge-ribbon-tag',
            name: 'Price Tag / Ribbon',
            cat: 'metrics',
            desc: 'Warm amber badge tag for special pricing and offers',
            defaultWidth: 240,
            defaultHeight: 54,
            containerStyle: {
                background: '#f59e0b',
                border: 'none',
                borderRadius: '4px',
                boxShadow: '0 3px 8px rgba(245,158,11,0.3)',
                padding: '10px 16px'
            },
            textStyle: {
                color: '#451a03',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#f59e0b; border-radius:2px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'badge-sale-flash',
            name: 'Flash Sale Badge',
            cat: 'metrics',
            desc: 'Bold crimson badge with slight glow for high priority notices',
            defaultWidth: 240,
            defaultHeight: 54,
            containerStyle: {
                background: '#e11d48',
                border: 'none',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(225,29,72,0.35)',
                padding: '10px 16px'
            },
            textStyle: {
                color: '#ffffff',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#e11d48; border-radius:3px; box-shadow:0 0 6px rgba(225,29,72,0.4);',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'badge-verified',
            name: 'Verified Trust Badge',
            cat: 'metrics',
            desc: 'Soft blue pill with royal blue border for trust signals',
            defaultWidth: 240,
            defaultHeight: 50,
            containerStyle: {
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '999px',
                padding: '10px 20px'
            },
            textStyle: {
                color: '#1d4ed8',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'badge-beta-pill',
            name: 'Feature Flag / Beta Pill',
            cat: 'metrics',
            desc: 'Soft purple badge for labels, versions, and tags',
            defaultWidth: 240,
            defaultHeight: 50,
            containerStyle: {
                background: '#faf5ff',
                border: '1px solid #e9d5ff',
                borderRadius: '999px',
                padding: '10px 20px'
            },
            textStyle: {
                color: '#7e22ce',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#faf5ff; border:1px solid #e9d5ff; border-radius:12px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'badge-limited',
            name: 'Limited Edition Pill',
            cat: 'metrics',
            desc: 'Deep bronze gradient badge with metallic gold text',
            defaultWidth: 240,
            defaultHeight: 50,
            containerStyle: {
                background: 'linear-gradient(135deg, #451a03, #78350f)',
                border: '1px solid #b45309',
                borderRadius: '999px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                padding: '10px 20px'
            },
            textStyle: {
                color: '#fef08a',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:linear-gradient(135deg, #451a03, #78350f); border:1px solid #b45309; border-radius:12px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'stat-modern-circle',
            name: 'Compact Stat Capsule',
            cat: 'metrics',
            desc: 'Dual-toned compact pill capsule with bold metric font',
            defaultWidth: 220,
            defaultHeight: 60,
            containerStyle: {
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '999px',
                padding: '8px 18px'
            },
            textStyle: {
                color: '#0f172a',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '16px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'stat-floating-shadow',
            name: 'Elevated Metric Pill',
            cat: 'metrics',
            desc: 'White pill elevated by a soft, modern floating shadow',
            defaultWidth: 240,
            defaultHeight: 54,
            containerStyle: {
                background: '#ffffff',
                border: 'none',
                borderRadius: '999px',
                boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                padding: '10px 20px'
            },
            textStyle: {
                color: '#0f172a',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#ffffff; border-radius:12px; box-shadow:0 3px 8px rgba(0,0,0,0.15);',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'ticket-cinema',
            name: 'Vintage Cinema Pass',
            cat: 'borders',
            desc: 'Dark charcoal vintage pass with dashed gold border',
            defaultWidth: 250,
            defaultHeight: 90,
            containerStyle: {
                background: '#27272a',
                border: '2px dashed #eab308',
                borderRadius: '6px',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#fef08a',
                fontFamily: "'Courier New', monospace",
                fontSize: '14px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#27272a; border:2px dashed #eab308; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'ticket-vip',
            name: 'VIP Admission Pass',
            cat: 'borders',
            desc: 'Royal deep purple ticket with elegant gold dashed frame',
            defaultWidth: 250,
            defaultHeight: 90,
            containerStyle: {
                background: '#1e1b4b',
                border: '2px dashed #ca8a04',
                borderRadius: '6px',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#fde047',
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#1e1b4b; border:2px dashed #ca8a04; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'ticket-neon',
            name: 'Nightclub Event Ticket',
            cat: 'borders',
            desc: 'Black event stub with hot pink dashed outline',
            defaultWidth: 250,
            defaultHeight: 90,
            containerStyle: {
                background: '#09090b',
                border: '2px dashed #f43f5e',
                borderRadius: '6px',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#fda4af',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#09090b; border:2px dashed #f43f5e; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'ticket-clean-minimal',
            name: 'Modern Clean Coupon',
            cat: 'borders',
            desc: 'Minimalist white coupon card with clean grey dashed border',
            defaultWidth: 250,
            defaultHeight: 90,
            containerStyle: {
                background: '#ffffff',
                border: '2px dashed #94a3b8',
                borderRadius: '6px',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#334155',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center'
            },
            previewCSS: 'background:#ffffff; border:2px dashed #94a3b8; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'ticket-craft',
            name: 'Kraft Paper Stub',
            cat: 'borders',
            desc: 'Natural warm kraft paper stub with coffee brown dashed line',
            defaultWidth: 250,
            defaultHeight: 90,
            containerStyle: {
                background: '#f5ebe0',
                border: '2px dashed #78350f',
                borderRadius: '4px',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#451a03',
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                fontWeight: '700',
                textAlign: 'center'
            },
            previewCSS: 'background:#f5ebe0; border:2px dashed #78350f; border-radius:2px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'frame-diploma',
            name: 'Collegiate Diploma Frame',
            cat: 'borders',
            desc: 'Stately double navy border on ivory parchment background',
            defaultWidth: 270,
            defaultHeight: 110,
            containerStyle: {
                background: '#f8fafc',
                border: '3px double #1e3a8a',
                borderRadius: '0px',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#172554',
                fontFamily: "'Times New Roman', serif",
                fontSize: '14px',
                textAlign: 'center',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#f8fafc; border:3px double #1e3a8a;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'frame-ornate-gold',
            name: 'Ornate Gold Box',
            cat: 'borders',
            desc: 'Nested gold borders for luxury product framing and certificates',
            defaultWidth: 270,
            defaultHeight: 110,
            containerStyle: {
                background: '#fafaf9',
                border: '1px solid #d97706',
                outline: '1px solid #d97706',
                outlineOffset: '-5px',
                borderRadius: '0px',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#78350f',
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                textAlign: 'center',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#fafaf9; border:1px solid #d97706; outline:1px solid #d97706; outline-offset:-2px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'frame-modern-double',
            name: 'Contemporary Double Frame',
            cat: 'borders',
            desc: 'Deep slate modern double border on pure white card',
            defaultWidth: 270,
            defaultHeight: 110,
            containerStyle: {
                background: '#ffffff',
                border: '3px double #0f172a',
                borderRadius: '0px',
                padding: '14px 18px'
            },
            textStyle: {
                color: '#0f172a',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                textAlign: 'center',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border:3px double #0f172a;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'frame-dashed-gold',
            name: 'Golden Dashed Frame',
            cat: 'borders',
            desc: 'Ivory card framed by a warm golden dashed line',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#fffbeb',
                border: '2px dashed #b45309',
                borderRadius: '6px',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#78350f',
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                textAlign: 'center',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#fffbeb; border:2px dashed #b45309; border-radius:3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'frame-stamp-edge',
            name: 'Postage Stamp Card',
            cat: 'borders',
            desc: 'Vintage postal card with delicate dotted boundary',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#faf8f5',
                border: '2px dotted #78350f',
                borderRadius: '0px',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#451a03',
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                textAlign: 'center',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#faf8f5; border:2px dotted #78350f;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'accent-bottom-bold',
            name: 'Bottom Accent Bar',
            cat: 'borders',
            desc: 'Clean white panel with prominent 5px bottom theme line',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderBottom: '5px solid var(--ui-theme-color, #007670)',
                borderRadius: '6px 6px 0 0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                padding: '12px 14px'
            },
            textStyle: {
                color: '#0f172a',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border:1px solid #e2e8f0; border-bottom:4px solid #007670; border-radius:3px 3px 0 0;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'accent-right-bold',
            name: 'Right Accent Lead',
            cat: 'borders',
            desc: 'Contemporary card with heavy right accent boundary stripe',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRight: '6px solid var(--ui-theme-color, #007670)',
                borderRadius: '6px 0 0 6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#0f172a',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#f8fafc; border:1px solid #e2e8f0; border-right:4px solid #007670; border-radius:3px 0 0 3px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'accent-bracket',
            name: 'Editorial Bracket Box',
            cat: 'borders',
            desc: 'Top and bottom bracket border lines framing centered serif text',
            defaultWidth: 270,
            defaultHeight: 100,
            containerStyle: {
                background: '#ffffff',
                border: 'none',
                borderTop: '2px solid #0f172a',
                borderBottom: '2px solid #0f172a',
                borderRadius: '0',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#0f172a',
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                textAlign: 'center',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border-top:2px solid #0f172a; border-bottom:2px solid #0f172a;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'accent-dual-corners',
            name: 'Opposing Corners Accent',
            cat: 'borders',
            desc: 'Stylized top-left and bottom-right corner borders',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#f8fafc',
                borderTop: '3px solid var(--ui-theme-color, #007670)',
                borderLeft: '3px solid var(--ui-theme-color, #007670)',
                borderBottom: '3px solid #64748b',
                borderRight: '3px solid #64748b',
                borderRadius: '4px',
                padding: '12px 16px'
            },
            textStyle: {
                color: '#1e293b',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#f8fafc; border-top:2px solid #007670; border-left:2px solid #007670; border-bottom:2px solid #64748b; border-right:2px solid #64748b; border-radius:2px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'border-cross-hatch',
            name: 'Cross-Border Frame',
            cat: 'borders',
            desc: 'Dual-tone outer outline with nested offset frame',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#ffffff',
                border: '1px solid #334155',
                outline: '1px dashed #94a3b8',
                outlineOffset: '-4px',
                borderRadius: '0',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#1e293b',
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                textAlign: 'center',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border:1px solid #334155; outline:1px dashed #94a3b8; outline-offset:-2px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'border-dotted-round',
            name: 'Dotted Round Notice',
            cat: 'borders',
            desc: 'Soft pastel rounded card with playful dotted blue boundary',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#f0f9ff',
                border: '2px dotted #0284c7',
                borderRadius: '12px',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#0369a1',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#f0f9ff; border:2px dotted #0284c7; border-radius:6px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'border-gradient-line',
            name: 'Prism Border Frame',
            cat: 'borders',
            desc: 'Clean white card framed by a vibrant violet gradient border',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#ffffff',
                border: '2px solid #8b5cf6',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#4c1d95',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '13px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border:2px solid #8b5cf6; border-radius:4px;',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'border-neon-glow',
            name: 'Cyan Neon Glow Frame',
            cat: 'borders',
            desc: 'Dark container surrounded by an electric cyan glow line',
            defaultWidth: 260,
            defaultHeight: 100,
            containerStyle: {
                background: '#090d16',
                border: '1px solid #06b6d4',
                borderRadius: '6px',
                boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)',
                padding: '14px 16px'
            },
            textStyle: {
                color: '#a5f3fc',
                fontFamily: "'Segoe UI', sans-serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#090d16; border:1px solid #06b6d4; border-radius:3px; box-shadow:0 0 6px rgba(6,182,212,0.5);',
            starterHTML: 'Click to edit text'
        },
        {
            id: 'border-vintage-newspaper',
            name: 'Newspaper Editorial Column',
            cat: 'borders',
            desc: 'Classic newspaper column with top and bottom heavy rules',
            defaultWidth: 270,
            defaultHeight: 100,
            containerStyle: {
                background: '#ffffff',
                border: 'none',
                borderTop: '3px solid #000000',
                borderBottom: '1px solid #000000',
                borderRadius: '0',
                padding: '12px 14px'
            },
            textStyle: {
                color: '#000000',
                fontFamily: "'Times New Roman', serif",
                fontSize: '14px',
                lineHeight: '1.4'
            },
            previewCSS: 'background:#ffffff; border-top:3px solid #000000; border-bottom:1px solid #000000;',
            starterHTML: 'Click to edit text'
        }
    ],

    // 4 quick styles shown directly in the ribbon gallery strip
    quickStyleIds: ['quote-teal', 'callout-soft', 'card-dark', 'stat-highlight'],

    // Solid & Gradient Palettes for Quick Fill Picker
    fillSolidPalette: [
        '#ffffff', '#000000', 'var(--ui-theme-color, #007670)', '#0284c7', '#2563eb', '#7c3aed', '#db2777', '#dc2626',
        '#ea580c', '#d97706', '#ca8a04', '#16a34a', '#059669', '#0d9488', '#0891b2', '#475569',
        '#f8fafc', '#f1f5f9', '#e2e8f0', '#f0fdf4', '#f0f9ff', '#fefce8', '#fff1f2', '#faf5ff',
        '#0f172a', '#1e293b', '#334155', '#14532d', '#0c4a6e', '#713f12', '#881337', '#3b0764'
    ],

    fillGradientPresets: [
        { name: 'Theme Gradient', val: 'linear-gradient(135deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #004d40))' },
        { name: 'Dark Slate', val: 'linear-gradient(145deg, #1e293b, #0f172a)' },
        { name: 'Sunset Glow', val: 'linear-gradient(135deg, #f97316, #ef4444)' },
        { name: 'Ocean Blue', val: 'linear-gradient(135deg, #06b6d4, #0284c7)' },
        { name: 'Emerald Mint', val: 'linear-gradient(135deg, #10b981, #047857)' },
        { name: 'Purple Dusk', val: 'linear-gradient(135deg, #8b5cf6, #6366f1)' },
        { name: 'Golden Amber', val: 'linear-gradient(135deg, #fbbf24, #d97706)' },
        { name: 'Rose Wine', val: 'linear-gradient(135deg, #f43f5e, #9f1239)' }
    ],

    borderPalette: [
        '#000000', '#ffffff', 'var(--ui-theme-color, #007670)', '#0284c7', '#2563eb', '#7c3aed', '#db2777', '#dc2626',
        '#ea580c', '#d97706', '#ca8a04', '#16a34a', '#059669', '#334155', '#64748b', '#cbd5e1'
    ],

    getPreset: function(id) {
        return this.presets.find(p => p.id === id);
    },

    applyStyle: function(el, styleId) {
        if (!el && typeof state !== 'undefined') el = state.selectedEl;
        if (!el) return;
        const content = el.querySelector('.element-content');
        if (!content) return;
        const editable = el.querySelector('[contenteditable="true"]');

        const preset = this.getPreset(styleId);
        if (!preset) return;

        // Reset previous container styling
        this.clearContainerStyles(content);

        // Apply new container styling
        const s = preset.containerStyle;
        if (s.background) content.style.background = s.background;
        if (s.border) content.style.border = s.border;
        if (s.borderLeft) content.style.borderLeft = s.borderLeft;
        if (s.borderTop) content.style.borderTop = s.borderTop;
        if (s.borderRight) content.style.borderRight = s.borderRight;
        if (s.borderBottom) content.style.borderBottom = s.borderBottom;
        if (s.borderRadius) content.style.borderRadius = s.borderRadius;
        if (s.boxShadow) content.style.boxShadow = s.boxShadow;
        if (s.outline) content.style.outline = s.outline;
        if (s.outlineOffset) content.style.outlineOffset = s.outlineOffset;
        if (s.backdropFilter) {
            content.style.backdropFilter = s.backdropFilter;
            content.style.webkitBackdropFilter = s.backdropFilter;
        }
        content.style.boxSizing = 'border-box';

        // Apply padding to editable
        if (editable && s.padding) {
            editable.style.padding = s.padding;
        }

        // Apply textStyle if text needs contrast adjustment or preset mandates it
        if (editable && preset.textStyle) {
            if (preset.textStyle.color) {
                if (['card-dark', 'pill-dark', 'solid-theme', 'pill-vibrant'].includes(preset.id) || !editable.style.color || editable.style.color === 'rgb(0, 0, 0)' || editable.style.color === '#000000') {
                    editable.style.color = preset.textStyle.color;
                }
            }
            if (preset.textStyle.fontFamily && (!editable.style.fontFamily || editable.style.fontFamily === 'Arial, sans-serif')) {
                editable.style.fontFamily = preset.textStyle.fontFamily;
            }
            if (preset.textStyle.textAlign) {
                editable.style.textAlign = preset.textStyle.textAlign;
            }
        }

        el.setAttribute('data-textbox-style', preset.id);

        this.updateRibbonIndicators(el);

        if (typeof pushHistory === 'function') pushHistory();
        if (typeof updateThumbnails === 'function') updateThumbnails();
    },

    applyPlain: function(el) {
        if (!el && typeof state !== 'undefined') el = state.selectedEl;
        if (!el) return;
        const content = el.querySelector('.element-content');
        if (!content) return;
        const editable = el.querySelector('[contenteditable="true"]');

        this.clearContainerStyles(content);
        if (editable) {
            editable.style.padding = '10px';
            editable.style.color = '#000000';
        }
        el.removeAttribute('data-textbox-style');

        this.updateRibbonIndicators(el);

        const menu = document.getElementById('styled-textbox-dropdown');
        if (menu) menu.style.display = 'none';

        if (typeof pushHistory === 'function') pushHistory();
        if (typeof updateThumbnails === 'function') updateThumbnails();
    },

    clearContainerStyles: function(content) {
        if (!content) return;
        content.style.background = '';
        content.style.backgroundColor = '';
        content.style.backgroundImage = '';
        content.style.border = 'none';
        content.style.borderLeft = '';
        content.style.borderTop = '';
        content.style.borderRight = '';
        content.style.borderBottom = '';
        content.style.borderRadius = '';
        content.style.boxShadow = '';
        content.style.outline = '';
        content.style.outlineOffset = '';
        content.style.backdropFilter = '';
        content.style.webkitBackdropFilter = '';
    },

    insertStyled: function(styleId) {
        const preset = this.getPreset(styleId);
        if (!preset) return;

        const autoHyphenate = localStorage.getItem('opub_autoHyphenate') === 'true';
        const hyphenStyle = autoHyphenate ? ' hyphens:auto; -webkit-hyphens:auto;' : '';
        const userLang = navigator.language || 'en';
        const spellAttrs = ` spellcheck="false" lang="${userLang}"`;
        const pad = (preset.containerStyle && preset.containerStyle.padding) ? preset.containerStyle.padding : '12px';

        // Clean typography styles applied directly to the contenteditable root
        let textStyleStr = '';
        if (preset.textStyle) {
            if (preset.textStyle.color) textStyleStr += `color:${preset.textStyle.color}; `;
            if (preset.textStyle.fontFamily) textStyleStr += `font-family:${preset.textStyle.fontFamily}; `;
            if (preset.textStyle.fontSize) textStyleStr += `font-size:${preset.textStyle.fontSize}; `;
            if (preset.textStyle.fontStyle) textStyleStr += `font-style:${preset.textStyle.fontStyle}; `;
            if (preset.textStyle.fontWeight) textStyleStr += `font-weight:${preset.textStyle.fontWeight}; `;
            if (preset.textStyle.textAlign) textStyleStr += `text-align:${preset.textStyle.textAlign}; `;
            if (preset.textStyle.lineHeight) textStyleStr += `line-height:${preset.textStyle.lineHeight}; `;
        }

        const html = `<div style="padding:${pad}; height:100%; word-wrap:break-word; outline:none;${hyphenStyle} ${textStyleStr}" contenteditable="true"${spellAttrs}>Click to edit text</div>`;

        if (typeof createWrapper !== 'function') return;
        const el = createWrapper(html);
        if (!el) return;

        // Size appropriately
        const w = preset.defaultWidth || 260;
        const h = preset.defaultHeight || 100;
        el.style.width = w + 'px';
        el.style.height = h + 'px';

        // Position neatly on the current paper page
        const paperEl = document.getElementById('paper');
        if (paperEl) {
            const pw = parseInt(paperEl.style.width || 794);
            const ph = parseInt(paperEl.style.height || 1123);
            el.style.left = Math.max(40, Math.round((pw - w) / 2)) + 'px';
            el.style.top = Math.max(60, Math.round((ph - h) / 3)) + 'px';
        }

        // Apply container styles
        const content = el.querySelector('.element-content');
        if (content) {
            const s = preset.containerStyle;
            if (s.background) content.style.background = s.background;
            if (s.border) content.style.border = s.border;
            if (s.borderLeft) content.style.borderLeft = s.borderLeft;
            if (s.borderTop) content.style.borderTop = s.borderTop;
            if (s.borderRight) content.style.borderRight = s.borderRight;
            if (s.borderBottom) content.style.borderBottom = s.borderBottom;
            if (s.borderRadius) content.style.borderRadius = s.borderRadius;
            if (s.boxShadow) content.style.boxShadow = s.boxShadow;
            if (s.outline) content.style.outline = s.outline;
            if (s.outlineOffset) content.style.outlineOffset = s.outlineOffset;
            if (s.backdropFilter) {
                content.style.backdropFilter = s.backdropFilter;
                content.style.webkitBackdropFilter = s.backdropFilter;
            }
            content.style.boxSizing = 'border-box';
        }

        el.setAttribute('data-textbox-style', preset.id);

        // Close dropdown
        const menu = document.getElementById('styled-textbox-dropdown');
        if (menu) menu.style.display = 'none';

        if (typeof selectElement === 'function') selectElement(el);
        if (typeof switchTab === 'function') switchTab('format-text');
        this.updateRibbonIndicators(el);

        if (typeof pushHistory === 'function') pushHistory();
        if (typeof updateThumbnails === 'function') updateThumbnails();

        return el;
    },

    // --- COLOR ADJUSTMENT & CONTROL METHODS ---

    applyFill: function(fillVal) {
        let el = (typeof state !== 'undefined') ? state.selectedEl : null;
        if (!el) return;
        let content = el.querySelector('.element-content');
        if (!content) return;
        let editable = el.querySelector('[contenteditable="true"]');

        if (fillVal === 'transparent' || fillVal === 'none') {
            content.style.background = 'transparent';
            content.style.backgroundImage = 'none';
            content.style.backgroundColor = 'transparent';
            if (editable && (editable.style.color === 'rgb(255, 255, 255)' || editable.style.color === '#ffffff')) {
                editable.style.color = '#000000';
            }
        } else {
            content.style.background = fillVal;
            // Contrast check for solid dark fills
            if (editable && fillVal.startsWith('#')) {
                const isDark = this.isDarkHex(fillVal);
                if (isDark && (!editable.style.color || editable.style.color === '#000000' || editable.style.color === 'rgb(0, 0, 0)')) {
                    editable.style.color = '#ffffff';
                } else if (!isDark && (editable.style.color === '#ffffff' || editable.style.color === 'rgb(255, 255, 255)')) {
                    editable.style.color = '#0f172a';
                }
            } else if (editable && fillVal.includes('gradient')) {
                // Ensure text readability on dark gradients
                if (fillVal.includes('#1e293b') || fillVal.includes('#0f172a') || fillVal.includes('#1a0533') || fillVal.includes('#004d40') || fillVal.includes('#9f1239')) {
                    if (!editable.style.color || editable.style.color === '#000000' || editable.style.color === 'rgb(0, 0, 0)') {
                        editable.style.color = '#ffffff';
                    }
                }
            }
        }

        this.updateRibbonIndicators(el);
        if (typeof pushHistory === 'function') pushHistory();
        if (typeof updateThumbnails === 'function') updateThumbnails();
    },

    isDarkHex: function(hex) {
        if (!hex || !hex.startsWith('#')) return false;
        let c = hex.substring(1);
        if (c.length === 3) c = c.split('').map(x => x + x).join('');
        const num = parseInt(c, 16);
        if (isNaN(num)) return false;
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        return luma < 128;
    },

    applyBorderColor: function(color) {
        let el = (typeof state !== 'undefined') ? state.selectedEl : null;
        if (!el) return;
        let content = el.querySelector('.element-content');
        if (!content) return;

        let currentW = parseInt(content.style.borderWidth || content.style.borderTopWidth || content.style.borderLeftWidth) || 0;
        if (currentW <= 0) currentW = 1;
        let currentS = content.style.borderStyle || 'solid';
        content.style.border = `${currentW}px ${currentS} ${color}`;

        this.updateRibbonIndicators(el);
        if (typeof pushHistory === 'function') pushHistory();
        if (typeof updateThumbnails === 'function') updateThumbnails();
    },

    applyBorderWidth: function(px) {
        let el = (typeof state !== 'undefined') ? state.selectedEl : null;
        if (!el) return;
        let content = el.querySelector('.element-content');
        if (!content) return;

        if (px <= 0) {
            content.style.border = 'none';
        } else {
            let currentC = content.style.borderColor || content.style.borderTopColor || '#000000';
            let currentS = content.style.borderStyle || 'solid';
            content.style.border = `${px}px ${currentS} ${currentC}`;
        }

        this.updateRibbonIndicators(el);
        if (typeof pushHistory === 'function') pushHistory();
        if (typeof updateThumbnails === 'function') updateThumbnails();
    },

    applyBorderStyle: function(style) {
        let el = (typeof state !== 'undefined') ? state.selectedEl : null;
        if (!el) return;
        let content = el.querySelector('.element-content');
        if (!content) return;

        let currentW = parseInt(content.style.borderWidth || content.style.borderTopWidth || content.style.borderLeftWidth) || 0;
        if (currentW <= 0) currentW = 1;
        let currentC = content.style.borderColor || content.style.borderTopColor || '#000000';
        content.style.border = `${currentW}px ${style} ${currentC}`;

        this.updateRibbonIndicators(el);
        if (typeof pushHistory === 'function') pushHistory();
        if (typeof updateThumbnails === 'function') updateThumbnails();
    },

    applyBorderRadius: function(px) {
        let el = (typeof state !== 'undefined') ? state.selectedEl : null;
        if (!el) return;
        let content = el.querySelector('.element-content');
        if (!content) return;

        content.style.borderRadius = px > 0 ? (px >= 900 ? '999px' : `${px}px`) : '0px';

        if (typeof pushHistory === 'function') pushHistory();
        if (typeof updateThumbnails === 'function') updateThumbnails();
    },

    openFormatDialog: function() {
        const fillMenu = document.getElementById('textbox-fill-dropdown');
        if (fillMenu) fillMenu.style.display = 'none';
        const borderMenu = document.getElementById('textbox-border-dropdown');
        if (borderMenu) borderMenu.style.display = 'none';
        const styleMenu = document.getElementById('styled-textbox-dropdown');
        if (styleMenu) styleMenu.style.display = 'none';

        if (typeof ContextMenuActions !== 'undefined' && typeof ContextMenuActions.formatTextBox === 'function') {
            ContextMenuActions.formatTextBox();
        }
    },

    pickCustomSolidFill: function(btn) {
        let el = (typeof state !== 'undefined') ? state.selectedEl : null;
        if (!el || !window.CustomColorPicker) return;
        let content = el.querySelector('.element-content');
        let initialHex = '#007670';
        if (content && content.style.backgroundColor && content.style.backgroundColor.startsWith('#')) {
            initialHex = content.style.backgroundColor;
        }

        const fillMenu = document.getElementById('textbox-fill-dropdown');
        const isFromDropdown = btn && fillMenu && fillMenu.contains(btn);
        if (fillMenu) fillMenu.style.display = 'none';

        const ribbonBtn = document.getElementById('btn-textbox-fill');
        const anchor = (isFromDropdown && ribbonBtn) ? ribbonBtn : (btn || ribbonBtn);

        window.CustomColorPicker.open(anchor, initialHex, (chosen) => {
            TextBoxStylesSystem.applyFill(chosen);
        });
    },

    pickCustomBorderColor: function(btn) {
        let el = (typeof state !== 'undefined') ? state.selectedEl : null;
        if (!el || !window.CustomColorPicker) return;
        let content = el.querySelector('.element-content');
        let initialHex = '#000000';
        if (content && content.style.borderColor && content.style.borderColor.startsWith('#')) {
            initialHex = content.style.borderColor;
        }

        const borderMenu = document.getElementById('textbox-border-dropdown');
        const isFromDropdown = btn && borderMenu && borderMenu.contains(btn);
        if (borderMenu) borderMenu.style.display = 'none';

        const ribbonBtn = document.getElementById('btn-textbox-border');
        const anchor = (isFromDropdown && ribbonBtn) ? ribbonBtn : (btn || ribbonBtn);

        window.CustomColorPicker.open(anchor, initialHex, (chosen) => {
            TextBoxStylesSystem.applyBorderColor(chosen);
        });
    },

    updateRibbonIndicators: function(el) {
        if (!el && typeof state !== 'undefined') el = state.selectedEl;
        const fillBar = document.getElementById('ribbon-box-fill-indicator');
        const borderBar = document.getElementById('ribbon-box-border-indicator');
        if (!el) return;

        const content = el.querySelector('.element-content');
        if (!content) return;

        if (fillBar) {
            const bg = content.style.background || content.style.backgroundColor;
            if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
                fillBar.style.background = bg;
            } else {
                fillBar.style.background = 'var(--ui-theme-color, #007670)';
            }
        }

        if (borderBar) {
            const bc = content.style.borderColor || content.style.borderTopColor || content.style.borderLeftColor;
            const bw = parseInt(content.style.borderWidth || content.style.borderTopWidth || content.style.borderLeftWidth) || 0;
            if (bw > 0 && bc && bc !== 'transparent') {
                borderBar.style.background = bc;
            } else {
                borderBar.style.background = '#334155';
            }
        }
    },

    toggleFillMenu: function(btn) {
        this.initColorDropdowns();
        const menu = document.getElementById('textbox-fill-dropdown');
        if (!menu) return;

        const isCurrentlyOpen = menu.style.display === 'block';
        document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');

        if (!isCurrentlyOpen) {
            menu.style.display = 'block';
            if (btn) {
                const r = btn.getBoundingClientRect();
                let left = r.left;
                if (left + menu.offsetWidth > window.innerWidth) {
                    left = Math.max(10, r.right - menu.offsetWidth);
                }
                menu.style.left = left + 'px';
                menu.style.top = (r.bottom + 4) + 'px';
            }
        }
    },

    toggleBorderMenu: function(btn) {
        this.initColorDropdowns();
        const menu = document.getElementById('textbox-border-dropdown');
        if (!menu) return;

        const isCurrentlyOpen = menu.style.display === 'block';
        document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');

        if (!isCurrentlyOpen) {
            menu.style.display = 'block';
            if (btn) {
                const r = btn.getBoundingClientRect();
                let left = r.left;
                if (left + menu.offsetWidth > window.innerWidth) {
                    left = Math.max(10, r.right - menu.offsetWidth);
                }
                menu.style.left = left + 'px';
                menu.style.top = (r.bottom + 4) + 'px';
            }
        }
    },

    initColorDropdowns: function() {
        if (!document.getElementById('textbox-fill-dropdown')) {
            const fillMenu = document.createElement('div');
            fillMenu.id = 'textbox-fill-dropdown';
            fillMenu.className = 'dropdown-menu styled-textbox-menu';
            fillMenu.style.cssText = 'display:none; width:300px; padding:12px; z-index:100000; box-sizing:border-box;';

            fillMenu.innerHTML = `
                <div class="styled-dropdown-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding-bottom:6px;">
                    <div style="font-weight:700; font-size:12px; display:flex; align-items:center; gap:6px; color:var(--ui-text);">
                        <i class="fas fa-fill-drip" style="color:var(--ui-theme-color);"></i> Box Fill
                    </div>
                    <button type="button" class="styled-opt-chip" onclick="TextBoxStylesSystem.applyFill('transparent'); document.getElementById('textbox-fill-dropdown').style.display='none'; event.stopPropagation();" title="Remove Fill">
                        <i class="fas fa-ban" style="color:#ef4444; margin-right:4px;"></i> No Fill
                    </button>
                </div>

                <div class="styled-section-label">Theme & Solid Colors</div>
                <div class="fill-palette-grid">
                    ${this.fillSolidPalette.map(c => `
                        <div class="fill-color-chip" style="background:${c};" onclick="TextBoxStylesSystem.applyFill('${c}'); document.getElementById('textbox-fill-dropdown').style.display='none'; event.stopPropagation();" title="${c}"></div>
                    `).join('')}
                </div>

                <div class="styled-section-label">Gradient Presets</div>
                <div class="fill-gradient-grid">
                    ${this.fillGradientPresets.map(g => `
                        <div class="fill-gradient-chip" style="background:${g.val};" onclick="TextBoxStylesSystem.applyFill('${g.val}'); document.getElementById('textbox-fill-dropdown').style.display='none'; event.stopPropagation();" title="${g.name}">
                            <span class="fill-grad-name">${g.name}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="styled-dropdown-footer" style="display:flex; flex-direction:column; gap:6px; padding-top:8px;">
                    <button type="button" class="styled-dropdown-footer-btn" onclick="TextBoxStylesSystem.pickCustomSolidFill(this); event.stopPropagation();">
                        <i class="fas fa-eye-dropper" style="color:var(--ui-theme-color); margin-right:6px;"></i> More Fill Colors... (Color Picker)
                    </button>
                    <button type="button" class="styled-dropdown-footer-btn" onclick="TextBoxStylesSystem.openFormatDialog(); event.stopPropagation();">
                        <i class="fas fa-sliders-h" style="color:var(--ui-theme-color); margin-right:6px;"></i> Advanced Fill & Gradients (Format Box)...
                    </button>
                </div>
            `;
            document.body.appendChild(fillMenu);
        }

        if (!document.getElementById('textbox-border-dropdown')) {
            const borderMenu = document.createElement('div');
            borderMenu.id = 'textbox-border-dropdown';
            borderMenu.className = 'dropdown-menu styled-textbox-menu';
            borderMenu.style.cssText = 'display:none; width:290px; padding:12px; z-index:100000; box-sizing:border-box;';

            borderMenu.innerHTML = `
                <div class="styled-dropdown-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding-bottom:6px;">
                    <div style="font-weight:700; font-size:12px; display:flex; align-items:center; gap:6px; color:var(--ui-text);">
                        <i class="fas fa-border-style" style="color:var(--ui-theme-color);"></i> Box Outline
                    </div>
                    <button type="button" class="styled-opt-chip" onclick="TextBoxStylesSystem.applyBorderWidth(0); document.getElementById('textbox-border-dropdown').style.display='none'; event.stopPropagation();" title="Remove Border">
                        <i class="fas fa-ban" style="color:#ef4444; margin-right:4px;"></i> No Outline
                    </button>
                </div>

                <div class="styled-section-label">Outline Color</div>
                <div class="fill-palette-grid">
                    ${this.borderPalette.map(c => `
                        <div class="fill-color-chip" style="background:${c};" onclick="TextBoxStylesSystem.applyBorderColor('${c}'); document.getElementById('textbox-border-dropdown').style.display='none'; event.stopPropagation();" title="${c}"></div>
                    `).join('')}
                </div>

                <div class="styled-section-label">Border Weight</div>
                <div class="border-opt-grid">
                    <button type="button" class="border-opt-btn" onclick="TextBoxStylesSystem.applyBorderWidth(1); document.getElementById('textbox-border-dropdown').style.display='none'; event.stopPropagation();">1px</button>
                    <button type="button" class="border-opt-btn" onclick="TextBoxStylesSystem.applyBorderWidth(2); document.getElementById('textbox-border-dropdown').style.display='none'; event.stopPropagation();">2px</button>
                    <button type="button" class="border-opt-btn" onclick="TextBoxStylesSystem.applyBorderWidth(3); document.getElementById('textbox-border-dropdown').style.display='none'; event.stopPropagation();">3px</button>
                    <button type="button" class="border-opt-btn" onclick="TextBoxStylesSystem.applyBorderWidth(5); document.getElementById('textbox-border-dropdown').style.display='none'; event.stopPropagation();">5px</button>
                </div>

                <div class="styled-section-label">Border Style</div>
                <div class="border-opt-grid">
                    <button type="button" class="border-opt-btn" onclick="TextBoxStylesSystem.applyBorderStyle('solid'); document.getElementById('textbox-border-dropdown').style.display='none'; event.stopPropagation();">Solid</button>
                    <button type="button" class="border-opt-btn" onclick="TextBoxStylesSystem.applyBorderStyle('dashed'); document.getElementById('textbox-border-dropdown').style.display='none'; event.stopPropagation();">Dashed</button>
                    <button type="button" class="border-opt-btn" onclick="TextBoxStylesSystem.applyBorderStyle('dotted'); document.getElementById('textbox-border-dropdown').style.display='none'; event.stopPropagation();">Dotted</button>
                    <button type="button" class="border-opt-btn" onclick="TextBoxStylesSystem.applyBorderStyle('double'); document.getElementById('textbox-border-dropdown').style.display='none'; event.stopPropagation();">Double</button>
                </div>

                <div class="styled-section-label">Corner Radius</div>
                <div class="border-opt-grid">
                    <button type="button" class="border-opt-btn" onclick="TextBoxStylesSystem.applyBorderRadius(0); document.getElementById('textbox-border-dropdown').style.display='none'; event.stopPropagation();">Square (0)</button>
                    <button type="button" class="border-opt-btn" onclick="TextBoxStylesSystem.applyBorderRadius(6); document.getElementById('textbox-border-dropdown').style.display='none'; event.stopPropagation();">Rounded (6px)</button>
                    <button type="button" class="border-opt-btn" onclick="TextBoxStylesSystem.applyBorderRadius(12); document.getElementById('textbox-border-dropdown').style.display='none'; event.stopPropagation();">Card (12px)</button>
                    <button type="button" class="border-opt-btn" onclick="TextBoxStylesSystem.applyBorderRadius(999); document.getElementById('textbox-border-dropdown').style.display='none'; event.stopPropagation();">Pill</button>
                </div>

                <div class="styled-dropdown-footer" style="display:flex; flex-direction:column; gap:6px; padding-top:8px;">
                    <button type="button" class="styled-dropdown-footer-btn" onclick="TextBoxStylesSystem.pickCustomBorderColor(this); event.stopPropagation();">
                        <i class="fas fa-eye-dropper" style="color:var(--ui-theme-color); margin-right:6px;"></i> More Outline Colors... (Color Picker)
                    </button>
                    <button type="button" class="styled-dropdown-footer-btn" onclick="TextBoxStylesSystem.openFormatDialog(); event.stopPropagation();">
                        <i class="fas fa-sliders-h" style="color:var(--ui-theme-color); margin-right:6px;"></i> Advanced Borders & Corners (Format Box)...
                    </button>
                </div>
            `;
            document.body.appendChild(borderMenu);
        }
    },

    renderRibbonStrip: function() {
        const strip = document.getElementById('textbox-quick-styles-strip');
        if (!strip) return;
        strip.innerHTML = '';

        this.quickStyleIds.forEach(id => {
            const p = this.getPreset(id);
            if (!p) return;
            const btn = document.createElement('div');
            btn.className = 'styled-textbox-quick-swatch';
            btn.title = `Apply Style: ${p.name}`;
            btn.onclick = (e) => {
                e.stopPropagation();
                if (typeof state !== 'undefined' && state.selectedEl) {
                    this.applyStyle(state.selectedEl, p.id);
                }
            };

            // Mini visual representation
            btn.innerHTML = `
                <div class="swatch-mini-preview" style="${p.previewCSS || ''}">
                    <div style="width:70%; height:2px; background:currentColor; opacity:0.5; margin:1px 0;"></div>
                    <div style="width:90%; height:2px; background:currentColor; opacity:0.3; margin:1px 0;"></div>
                </div>
            `;
            strip.appendChild(btn);
        });
    },

    toggleMenu: function(btn, mode) {
        const menu = document.getElementById('styled-textbox-dropdown');
        if (!menu) return;

        const isCurrentlyOpen = menu.style.display === 'block' && menu.getAttribute('data-mode') === mode;
        document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');

        if (!isCurrentlyOpen) {
            menu.setAttribute('data-mode', mode);
            this.renderMenu(mode, 'all');
            menu.style.display = 'block';

            if (btn) {
                const r = btn.getBoundingClientRect();
                let left = r.left;
                if (left + menu.offsetWidth > window.innerWidth) {
                    left = Math.max(10, r.right - menu.offsetWidth);
                }
                menu.style.left = left + 'px';
                menu.style.top = (r.bottom + 4) + 'px';
            }
        }
    },

    currentSearchTerm: '',

    onSearchInput: function(val, mode, filterCat) {
        this.currentSearchTerm = val;
        this.renderMenu(mode, filterCat);
        const input = document.getElementById('styled-textbox-search');
        if (input) {
            input.focus();
            input.setSelectionRange(val.length, val.length);
        }
    },

    renderMenu: function(mode, filterCat = 'all') {
        const menu = document.getElementById('styled-textbox-dropdown');
        if (!menu) return;

        const isInsert = mode === 'insert';
        const titleText = isInsert ? 'Insert Styled Text Box' : 'Apply Text Box Style';
        const subText = isInsert ? 'Choose from 100 pre-styled templates to insert' : 'Select a style to apply to the selected text box';

        const categories = [
            { id: 'all', label: `All (${this.presets.length})` },
            { id: 'quotes', label: `Quotes (${this.presets.filter(p => p.cat === 'quotes').length})` },
            { id: 'cards', label: `Cards (${this.presets.filter(p => p.cat === 'cards').length})` },
            { id: 'metrics', label: `Badges & Stats (${this.presets.filter(p => p.cat === 'metrics').length})` },
            { id: 'borders', label: `Borders (${this.presets.filter(p => p.cat === 'borders').length})` }
        ];

        let filtered = filterCat === 'all' ? this.presets : this.presets.filter(p => p.cat === filterCat);
        const searchVal = (this.currentSearchTerm || '').trim().toLowerCase();
        if (searchVal) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchVal) || p.desc.toLowerCase().includes(searchVal) || p.id.toLowerCase().includes(searchVal));
        }

        let html = `
            <div class="styled-dropdown-header">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-swatchbook" style="color:var(--ui-theme-color); font-size:16px;"></i>
                        <div>
                            <div style="font-weight:700; font-size:13px; color:var(--ui-text);">${titleText}</div>
                            <div style="font-size:11px; color:var(--ui-text-muted, #64748b);">${subText}</div>
                        </div>
                    </div>
                    <span style="font-size:10px; font-weight:700; background:var(--ui-hover-bg, #f1f5f9); border:1px solid var(--ui-border, #e2e8f0); border-radius:10px; padding:2px 7px; color:var(--ui-theme-color);">100 Presets</span>
                </div>
                <div style="margin-top:6px;">
                    <input type="text" id="styled-textbox-search" placeholder="Search 100 styles (e.g. quote, dark, neon, gold, card)..." value="${this.currentSearchTerm || ''}" oninput="TextBoxStylesSystem.onSearchInput(this.value, '${mode}', '${filterCat}')" onclick="event.stopPropagation();" style="width:100%; box-sizing:border-box; padding:5px 8px; font-size:12px; border:1px solid var(--ui-border, #cbd5e1); border-radius:4px; background:var(--ui-panel-bg, #ffffff); color:var(--ui-text); outline:none;">
                </div>
            </div>

            <div class="styled-cat-pills">
                ${categories.map(c => `
                    <div class="styled-cat-pill ${c.id === filterCat ? 'active' : ''}" onclick="TextBoxStylesSystem.renderMenu('${mode}', '${c.id}'); event.stopPropagation();">
                        ${c.label}
                    </div>
                `).join('')}
            </div>

            <div class="styled-box-grid">
                ${filtered.length > 0 ? filtered.map(p => `
                    <div class="styled-box-card" onclick="TextBoxStylesSystem.${isInsert ? 'insertStyled' : 'applyStyle'}(${isInsert ? `'${p.id}'` : `state.selectedEl, '${p.id}'`}); if(!${isInsert}) document.getElementById('styled-textbox-dropdown').style.display='none'; event.stopPropagation();" title="${p.desc}">
                        <div class="styled-box-preview-box" style="${p.previewCSS || ''}">
                            <div style="width:100%; display:flex; flex-direction:column; align-items:center; gap:2px;">
                                <div style="width:65%; height:3px; background:currentColor; opacity:0.6; border-radius:1px;"></div>
                                <div style="width:85%; height:2px; background:currentColor; opacity:0.35; border-radius:1px;"></div>
                            </div>
                        </div>
                        <div class="styled-box-card-meta">
                            <span class="styled-box-name">${p.name}</span>
                        </div>
                    </div>
                `).join('') : `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 24px 10px; color: var(--ui-text-muted, #64748b); font-size: 13px;">
                        <i class="fas fa-search" style="margin-bottom:6px; font-size:16px; opacity:0.5; display:block;"></i>
                        No styles matching "<b>${searchVal}</b>"
                    </div>
                `}
            </div>

            <div class="styled-dropdown-footer">
                ${!isInsert ? `
                    <button type="button" class="styled-dropdown-footer-btn" style="margin-bottom:6px;" onclick="TextBoxStylesSystem.openFormatDialog(); document.getElementById('styled-textbox-dropdown').style.display='none'; event.stopPropagation();">
                        <i class="fas fa-palette" style="color:var(--ui-theme-color); margin-right:6px;"></i> Customize Box Colors & Borders (Format Box...)
                    </button>
                    <button type="button" class="styled-dropdown-footer-btn" onclick="TextBoxStylesSystem.applyPlain(state.selectedEl); event.stopPropagation();">
                        <i class="fas fa-ban" style="color:#ef4444; margin-right:6px;"></i> Clear Box Styling (Revert to Plain)
                    </button>
                ` : `
                    <button type="button" class="styled-dropdown-footer-btn" onclick="addTextBox(); document.getElementById('styled-textbox-dropdown').style.display='none'; event.stopPropagation();">
                        <i class="fas fa-font" style="color:var(--ui-theme-color); margin-right:6px;"></i> Insert Standard Blank Text Box
                    </button>
                `}
            </div>
        `;

        menu.innerHTML = html;
    }
};

// Ensure dropdowns close when clicking outside
document.addEventListener('click', (e) => {
    const fillMenu = document.getElementById('textbox-fill-dropdown');
    if (fillMenu && fillMenu.style.display === 'block') {
        if (!fillMenu.contains(e.target) && !e.target.closest('#btn-textbox-fill')) {
            fillMenu.style.display = 'none';
        }
    }
    const borderMenu = document.getElementById('textbox-border-dropdown');
    if (borderMenu && borderMenu.style.display === 'block') {
        if (!borderMenu.contains(e.target) && !e.target.closest('#btn-textbox-border')) {
            borderMenu.style.display = 'none';
        }
    }
    const styleMenu = document.getElementById('styled-textbox-dropdown');
    if (styleMenu && styleMenu.style.display === 'block') {
        if (!styleMenu.contains(e.target) && !e.target.closest('#btn-styled-textbox') && !e.target.closest('[onclick*="TextBoxStylesSystem.toggleMenu"]')) {
            styleMenu.style.display = 'none';
        }
    }
});


