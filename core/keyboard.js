// ==========================================
// KEYBOARD SHORTCUTS ENGINE
// ==========================================

document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && document.activeElement && document.activeElement.isContentEditable) {
            e.preventDefault();
            if (window.handleTabKey) window.handleTabKey(e);
            return;
        }

        // Key Shortcuts
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
            if (window.isDrawingModeActive && window.isDrawingModeActive()) return;
            e.preventDefault();
            undo();
            return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
            if (window.isDrawingModeActive && window.isDrawingModeActive()) return;
            e.preventDefault();
            redo();
            return;
        }
        // Toggle Boundaries
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'o' || e.key === 'O')) {
            e.preventDefault();
            const paper = document.getElementById('paper');
            if (paper) paper.classList.toggle('show-boundaries');
            return;
        }
        // Quick Zoom
        if (e.key === 'F9') {
            e.preventDefault();
            if (state.zoom !== 1.0) {
                state._lastZoomLevel = state.zoom;
                setZoom(1.0);
            } else if (state._lastZoomLevel && state._lastZoomLevel !== 1.0) {
                setZoom(state._lastZoomLevel);
            }
            return;
        }
        // Whole Page View
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'l' || e.key === 'L')) {
            e.preventDefault();
            if (typeof fitToPage === 'function') fitToPage();
            return;
        }
        // Copy
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
            if (state.selectedEl && !isTextEditing()) {
                 e.preventDefault();
                 copyEl();
            }
        }
        // Paste
        if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
            let textEditing = isTextEditing();
            
            // If they are not actively editing, but have a text element selected and want to paste text into it
            if (e.shiftKey && !textEditing && typeof state !== 'undefined' && state.selectedEl) {
                const innerText = state.selectedEl.querySelector('[contenteditable="true"]') || state.selectedEl.querySelector('.text-content');
                if (innerText) {
                    innerText.focus();
                    textEditing = true;
                }
            }

            if (e.shiftKey && textEditing) {
                // Set a flag to intercept the native paste event that will follow
                window._isShiftPasting = true;
                setTimeout(() => window._isShiftPasting = false, 100);
                // Do NOT preventDefault, allow the native paste event to trigger!
            } else if (!e.shiftKey && !textEditing) {
                // Native paste event in legacy-fixes.js now cleanly handles Ctrl+V for both internal vector elements and external images.
            }
        }
        
        // Bold (Ctrl+B), Italic (Ctrl+I), Underline (Ctrl+U)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B') && isTextEditing()) {
            e.preventDefault();
            document.execCommand('bold');
            pushHistory();
            return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I') && isTextEditing()) {
            e.preventDefault();
            document.execCommand('italic');
            pushHistory();
            return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U') && isTextEditing()) {
            e.preventDefault();
            document.execCommand('underline');
            pushHistory();
            return;
        }

        // Small Caps (Ctrl+Shift+K)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'k' || e.key === 'K') && isTextEditing()) {
            e.preventDefault();
            const selection = window.getSelection();
            if (selection.rangeCount > 0 && !selection.isCollapsed) {
                const range = selection.getRangeAt(0);
                let parent = selection.anchorNode;
                if (parent.nodeType === 3) parent = parent.parentNode;
                
                const div = document.createElement('div');
                div.appendChild(range.cloneContents());
                let html = div.innerHTML;
                
                if (window.getComputedStyle(parent).fontVariant === 'small-caps') {
                    document.execCommand('insertHTML', false, '<span style="font-variant: normal;">' + html + '</span>');
                } else {
                    document.execCommand('insertHTML', false, '<span style="font-variant: small-caps;">' + html + '</span>');
                }
                pushHistory();
            }
            return;
        }

        // Superscript (Ctrl+Shift++)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === '+' || e.key === '=')) {
            if (isTextEditing()) {
                e.preventDefault();
                document.execCommand('superscript');
                pushHistory();
            }
            return;
        }

        // Subscript (Ctrl+=)
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === '=') {
            if (isTextEditing()) {
                e.preventDefault();
                document.execCommand('subscript');
                pushHistory();
            }
            return;
        }
        
        // Change Case (Shift+F3)
        if (!e.ctrlKey && !e.metaKey && e.shiftKey && e.key === 'F3') {
            if (isTextEditing()) {
                e.preventDefault();
                if(typeof ContextMenuActions !== 'undefined' && ContextMenuActions.changeCase) {
                    ContextMenuActions.changeCase();
                }
            }
            return;
        }

        // Font Size Nudge (Ctrl+Shift+> to increase, Ctrl+Shift+< to decrease)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === '>' || e.key === '.' || e.key === '<' || e.key === ',')) {
            if (isTextEditing()) {
                e.preventDefault();
                const increase = (e.key === '>' || e.key === '.');
                let currentSize = 12;
                if (state.lastRange) {
                    let node = state.lastRange.startContainer;
                    if (node.nodeType === 3) {
                        node = node.parentNode;
                    } else {
                        const offset = state.lastRange.startOffset;
                        if (node.childNodes.length > offset) {
                            let child = node.childNodes[offset];
                            if (child.nodeType === 3) child = child.parentNode;
                            if (child && child.nodeType === 1) node = child;
                        }
                    }
                    if (node && node.nodeType === 1) {
                        currentSize = parseInt(window.getComputedStyle(node).fontSize) || 12;
                    }
                }
                const newSize = increase ? currentSize + 1 : Math.max(1, currentSize - 1);
                setTrueFontSize(newSize + 'px');
                
                const floatLabel = document.getElementById('float-size-label');
                if (floatLabel) floatLabel.innerText = newSize;
            }
            return;
        }

        // Clear Formatting (Ctrl+Space)
        if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
            if (isTextEditing()) {
                e.preventDefault();
                document.execCommand('removeFormat');
                // Reset to default font and size
                document.execCommand('fontName', false, 'Segoe UI');
                document.execCommand('fontSize', false, '3'); // size 3 = ~12px
                pushHistory();
            }
            return;
        }
        
        // Lock Guides (Ctrl+Alt+;)
        if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === ';') {
            e.preventDefault();
            toggleLockGuides();
            return;
        }

        // Only delete if not editing text
        if(e.key === 'Delete' && !isTextEditing()) {
            deleteSelected();
        }
        if(e.key === 'Escape') deselect(); 
    });


// ==========================================
// TAB INDENTATION OVERRIDE
// ==========================================

window.handleTabKey = function(e) {
    if (!window._activeIndentBlock) {
        document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
        return;
    }
    const block = window._activeIndentBlock;
    
    const rawTabs = block.getAttribute('data-tabs');
    let tabs = rawTabs ? JSON.parse(rawTabs) : [];
    if (tabs.length === 0) {
        document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
        return;
    }
    
    if (!block.classList.contains('op-tab-container')) {
        const html = block.innerHTML;
        block.innerHTML = '';
        block.classList.add('op-tab-container');
        const span = document.createElement('span');
        span.className = 'op-tab-block op-tab-block-left';
        if (!html || html.trim() === '') span.innerHTML = '&#8203;'; else span.innerHTML = html;
        block.appendChild(span);
        
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(span);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    
    const sel = window.getSelection();
    if (sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    
    let currentSpan = range.commonAncestorContainer;
    while (currentSpan && currentSpan.nodeType !== 1) currentSpan = currentSpan.parentNode;
    while (currentSpan && !currentSpan.classList?.contains('op-tab-block')) {
        if (currentSpan === block || !currentSpan.parentNode) break;
        currentSpan = currentSpan.parentNode;
    }
    
    if (!currentSpan || !currentSpan.classList?.contains('op-tab-block')) {
        currentSpan = block.querySelector('.op-tab-block') || block.lastElementChild;
    }
    
    if (!currentSpan) return;
    
    const existingSpacers = block.querySelectorAll('.op-tab-spacer').length;
    const tabDef = tabs[Math.min(existingSpacers, tabs.length - 1)];
    
    const spacer = document.createElement('span');
    spacer.className = 'op-tab-spacer';
    spacer.contentEditable = 'false';
    if (tabDef.leader !== 'none') spacer.classList.add(`op-tab-leader-${tabDef.leader}`);
    
    const newTextSpan = document.createElement('span');
    newTextSpan.className = `op-tab-block op-tab-block-${tabDef.align === 'decimal' ? 'right' : tabDef.align}`;

    try {
        const extractRange = document.createRange();
        extractRange.setStart(range.endContainer, range.endOffset);
        extractRange.setEndAfter(currentSpan.lastChild || currentSpan);
        const extractedContent = extractRange.extractContents();
        if (extractedContent.textContent.length > 0) {
            newTextSpan.appendChild(extractedContent);
        } else {
            newTextSpan.innerHTML = '&#8203;';
        }
    } catch (err) {
        newTextSpan.innerHTML = '&#8203;';
    }
    
    block.insertBefore(spacer, currentSpan.nextSibling);
    block.insertBefore(newTextSpan, spacer.nextSibling);
    
    const newRange = document.createRange();
    newRange.selectNodeContents(newTextSpan);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    
    pushHistory();
};