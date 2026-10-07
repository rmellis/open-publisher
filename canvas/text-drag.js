/**
 * Open Publisher - Canvas Text Drag & Drop Module (v5.4.8)
 * Allows users to highlight a chunk of text and drag it into another area
 * within the text box (or across text boxes), with visual drop caret indicator,
 * ghost drag badge, Ctrl-to-copy support, and full Undo/Redo integration.
 */

window.TextDragSystem = (function() {
    'use strict';

    let session = null;
    let caretEl = null;
    let badgeEl = null;

    /**
     * Tests if mouse coordinates fall within the currently active text selection.
     */
    function isPointInSelection(clientX, clientY) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
        const str = sel.toString();
        if (!str || str.length === 0) return false;

        const range = sel.getRangeAt(0);
        const rects = range.getClientRects();
        for (let i = 0; i < rects.length; i++) {
            const r = rects[i];
            // Include a 2px hit margin for comfortable drag initiation
            if (clientX >= r.left - 2 && clientX <= r.right + 2 &&
                clientY >= r.top - 2 && clientY <= r.bottom + 2) {
                return true;
            }
        }
        return false;
    }

    /**
     * Lazily creates or returns the visual caret indicator element.
     */
    function getCaretElement() {
        if (!caretEl) {
            caretEl = document.createElement('div');
            caretEl.id = 'op-text-drag-caret';
            caretEl.style.cssText = [
                'position: fixed',
                'display: none',
                'width: 2px',
                'background-color: var(--ui-theme-color, #007670)',
                'box-shadow: 0 0 4px rgba(0, 118, 112, 0.8)',
                'pointer-events: none',
                'z-index: 1000000',
                'border-radius: 1px',
                'transition: none'
            ].join(';');
            document.body.appendChild(caretEl);
        }
        return caretEl;
    }

    /**
     * Lazily creates or returns the floating text ghost badge.
     */
    function getBadgeElement() {
        if (!badgeEl) {
            badgeEl = document.createElement('div');
            badgeEl.id = 'op-text-drag-badge';
            badgeEl.style.cssText = [
                'position: fixed',
                'display: none',
                'pointer-events: none',
                'z-index: 1000001',
                'background: rgba(0, 118, 112, 0.95)',
                'color: #ffffff',
                'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                'font-size: 11px',
                'font-weight: 600',
                'padding: 3px 8px',
                'border-radius: 4px',
                'box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3)',
                'max-width: 180px',
                'white-space: nowrap',
                'overflow: hidden',
                'text-overflow: ellipsis',
                'align-items: center',
                'gap: 6px',
                'transform: translate(12px, 14px)'
            ].join(';');
            document.body.appendChild(badgeEl);
        }
        return badgeEl;
    }

    /**
     * Resolves the caret Range at the specified viewport coordinates.
     */
    function getCaretRangeFromPoint(x, y) {
        if (document.caretRangeFromPoint) {
            return document.caretRangeFromPoint(x, y);
        } else if (document.caretPositionFromPoint) {
            const pos = document.caretPositionFromPoint(x, y);
            if (pos) {
                const range = document.createRange();
                range.setStart(pos.offsetNode, pos.offset);
                range.collapse(true);
                return range;
            }
        }
        return null;
    }

    const MIN_DRAG_DISTANCE = 10; // Minimum distance (px) required to initiate an intentional text drag

    /**
     * Checks if a target insertion range falls strictly inside the source selection range.
     */
    function isTargetInsideSource(targetRange, sourceRange) {
        if (!targetRange || !sourceRange) return false;
        try {
            if (typeof sourceRange.comparePoint === 'function') {
                const pt = sourceRange.comparePoint(targetRange.startContainer, targetRange.startOffset);
                if (pt === 0) return true;
            }
            const startCmp = targetRange.compareBoundaryPoints(Range.START_TO_START, sourceRange);
            const endCmp = targetRange.compareBoundaryPoints(Range.END_TO_START, sourceRange);
            if (startCmp >= 0 && endCmp <= 0) return true;
        } catch (e) {}

        // Fallback: check offsets if within the same text container
        try {
            if (targetRange.startContainer === sourceRange.startContainer) {
                const o = targetRange.startOffset;
                return o >= sourceRange.startOffset && o <= sourceRange.endOffset;
            }
        } catch (e) {}

        return false;
    }

    /**
     * Starts a text drag session from mousedown.
     */
    function startDrag(e) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;

        const sourceRange = sel.getRangeAt(0).cloneRange();
        const sourceText = sel.toString();
        if (!sourceText || sourceText.length === 0) return false;

        const targetNode = e.target.nodeType === 3 ? e.target.parentNode : e.target;
        const editable = targetNode ? targetNode.closest('[contenteditable="true"]') : null;
        const pubElement = editable ? editable.closest('.pub-element') : null;

        session = {
            active: true,
            isDragging: false,
            startX: e.clientX,
            startY: e.clientY,
            sourceRange: sourceRange,
            sourceText: sourceText,
            sourceEditable: editable,
            sourceElement: pubElement,
            isCopy: e.ctrlKey || e.metaKey
        };

        // Suppress canvas element dragging
        if (typeof state !== 'undefined' && state.dragMode === 'drag') {
            state.dragMode = null;
        }

        e.stopPropagation();
        return true;
    }

    /**
     * Blocks native HTML5 dragstart on contenteditable text selections so Chromium
     * never initiates a conflicting native text drag or shows unwanted drag ghosts on click.
     */
    function onDragStart(e) {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed) {
            const targetNode = e.target.nodeType === 3 ? e.target.parentNode : e.target;
            if (targetNode && (targetNode.closest('[contenteditable="true"]') || isPointInSelection(e.clientX, e.clientY))) {
                e.preventDefault();
                return;
            }
        }
    }

    /**
     * Core execution engine for placing dropped text, updating selection, history, and status.
     */
    function executeDrop(targetRange, targetEditable, e, currentSession) {
        if (caretEl) caretEl.style.display = 'none';
        if (badgeEl) badgeEl.style.display = 'none';
        document.body.style.userSelect = '';

        if (!currentSession || !currentSession.sourceRange) return;

        // If target is inside the source selection itself, ignore (dropped on itself)
        if (isTargetInsideSource(targetRange, currentSession.sourceRange)) {
            if (currentSession.sourceEditable) currentSession.sourceEditable.focus();
            return;
        }

        const isCopy = e.ctrlKey || e.metaKey || currentSession.isCopy;

        try {
            // Snapshot pre-drag document state so Undo cleanly reverts
            if (typeof pushHistory === 'function') pushHistory(true);

            // Anchor markers around insertion position before extracting source
            const mStart = document.createElement('span');
            mStart.setAttribute('data-drag-marker', 'start');
            mStart.style.display = 'none';

            const mEnd = document.createElement('span');
            mEnd.setAttribute('data-drag-marker', 'end');
            mEnd.style.display = 'none';

            targetRange.collapse(true);
            targetRange.insertNode(mEnd);
            targetRange.insertNode(mStart);

            // Extract or clone source contents
            const fragment = isCopy
                ? currentSession.sourceRange.cloneContents()
                : currentSession.sourceRange.extractContents();

            // Insert fragment between boundary markers
            mStart.parentNode.insertBefore(fragment, mEnd);

            // Create highlight range for newly placed text
            const newRange = document.createRange();
            newRange.setStartAfter(mStart);
            newRange.setEndBefore(mEnd);

            mStart.remove();
            mEnd.remove();

            // Focus and apply selection to newly placed text
            targetEditable.focus();
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(newRange);

            if (typeof state !== 'undefined') {
                state.lastRange = newRange.cloneRange();
            }

            // Normalize text nodes
            targetEditable.normalize();
            if (currentSession.sourceEditable && currentSession.sourceEditable !== targetEditable) {
                currentSession.sourceEditable.normalize();
            }

            // Dispatch input events
            targetEditable.dispatchEvent(new Event('input', { bubbles: true }));
            if (currentSession.sourceEditable && currentSession.sourceEditable !== targetEditable) {
                currentSession.sourceEditable.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // Clear local typing keystroke histories so Ctrl+Z triggers global app undo
            if (typeof window.clearTextHistory === 'function') {
                window.clearTextHistory(targetEditable);
                if (currentSession.sourceEditable && currentSession.sourceEditable !== targetEditable) {
                    window.clearTextHistory(currentSession.sourceEditable);
                }
            }

            // Commit post-drag snapshot immediately
            if (typeof pushHistory === 'function') pushHistory(true);
            if (typeof updateThumbnails === 'function') updateThumbnails();

            window._justFinishedTextDrag = true;

            const statusMsg = document.getElementById('status-msg');
            if (statusMsg) {
                statusMsg.innerText = isCopy ? 'Text Copied' : 'Text Moved';
                if (window._textDragStatusTimer) {
                    clearTimeout(window._textDragStatusTimer);
                }
                window._textDragStatusTimer = setTimeout(() => {
                    const curStatus = document.getElementById('status-msg');
                    if (curStatus && (curStatus.innerText === 'Text Moved' || curStatus.innerText === 'Text Copied')) {
                        if (typeof state !== 'undefined' && state.multiSelected && state.multiSelected.length > 1) {
                            curStatus.innerText = state.multiSelected.length + ' Elements Selected';
                        } else if (typeof state !== 'undefined' && state.selectedEl) {
                            curStatus.innerText = 'Element Selected';
                        } else {
                            curStatus.innerText = 'Ready';
                        }
                    }
                    window._textDragStatusTimer = null;
                }, 2500);
            }
        } catch (err) {
            console.error('Error during text drag and drop execution:', err);
        }
    }

    /**
     * MouseMove handler for pointer-based text drag gestures.
     */
    function onMouseMove(e) {
        if (!session || !session.active) return;

        const dist = Math.hypot(e.clientX - session.startX, e.clientY - session.startY);
        if (dist >= MIN_DRAG_DISTANCE && !session.isDragging) {
            session.isDragging = true;
            document.body.style.userSelect = 'none';
        }

        if (!session.isDragging) return;

        const targetRange = getCaretRangeFromPoint(e.clientX, e.clientY);
        const isInside = isTargetInsideSource(targetRange, session.sourceRange);

        // Suppress caret/badge if hovering over the source selection itself or outside canvas
        if (isInside || !targetRange) {
            if (caretEl) caretEl.style.display = 'none';
            if (badgeEl) badgeEl.style.display = 'none';
            return;
        }

        session.isCopy = e.ctrlKey || e.metaKey;

        const badge = getBadgeElement();
        const iconClass = session.isCopy ? 'fas fa-copy' : 'fas fa-arrows-alt';
        const displayLabel = session.sourceText.length > 20
            ? session.sourceText.slice(0, 18).trim() + '...'
            : session.sourceText.trim();
        badge.innerHTML = `<i class="${iconClass}" style="font-size:10px; margin-right:4px;"></i><span>${escapeHtml(displayLabel)}</span>`;
        badge.style.display = 'flex';
        badge.style.left = e.clientX + 'px';
        badge.style.top = e.clientY + 'px';

        const caret = getCaretElement();
        const startNode = targetRange.startContainer;
        const targetEditable = startNode.nodeType === 1
            ? startNode.closest('[contenteditable="true"]')
            : (startNode.parentElement ? startNode.parentElement.closest('[contenteditable="true"]') : null);

        if (targetEditable) {
            const rects = targetRange.getClientRects();
            const r = rects.length > 0 ? rects[0] : targetRange.getBoundingClientRect();

            caret.style.display = 'block';
            caret.style.left = Math.round(r.left) + 'px';
            caret.style.top = Math.round(r.top) + 'px';
            caret.style.height = Math.max(16, Math.round(r.height || 18)) + 'px';
            return;
        }

        caret.style.display = 'none';
    }

    /**
     * MouseUp handler: guarantees that a click simply collapses caret to the click point,
     * while an intentional drag-and-drop executes the text relocation.
     */
    function onMouseUp(e) {
        if (!session || !session.active) return;

        const currentSession = session;
        session = null;

        if (caretEl) caretEl.style.display = 'none';
        if (badgeEl) badgeEl.style.display = 'none';
        document.body.style.userSelect = '';

        const dist = Math.hypot(e.clientX - currentSession.startX, e.clientY - currentSession.startY);
        const wasDragging = currentSession.isDragging && dist >= MIN_DRAG_DISTANCE;

        // CASE A: User clicked on highlighted text without dragging -> collapse caret to click position, do NOT move text!
        if (!wasDragging) {
            const clickRange = getCaretRangeFromPoint(e.clientX, e.clientY);
            if (clickRange) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(clickRange);
                if (typeof state !== 'undefined') {
                    state.lastRange = clickRange.cloneRange();
                }
            }
            if (currentSession.sourceEditable) {
                currentSession.sourceEditable.focus();
            }
            return;
        }

        const targetRange = getCaretRangeFromPoint(e.clientX, e.clientY);

        // CASE B: Deliberate drag drop to another area
        if (!targetRange || isTargetInsideSource(targetRange, currentSession.sourceRange)) {
            // Dropped on itself or outside valid drop target -> abort cleanly
            if (currentSession.sourceEditable) {
                currentSession.sourceEditable.focus();
            }
            return;
        }

        const startNode = targetRange.startContainer;
        const targetEditable = startNode.nodeType === 1
            ? startNode.closest('[contenteditable="true"]')
            : (startNode.parentElement ? startNode.parentElement.closest('[contenteditable="true"]') : null);

        if (targetEditable) {
            executeDrop(targetRange, targetEditable, e, currentSession);
            return;
        }

        if (currentSession.sourceEditable) {
            currentSession.sourceEditable.focus();
        }
    }

    /**
     * Cancels active drag on Escape key.
     */
    function onKeyDown(e) {
        if (e.key === 'Escape' && session && session.active) {
            session = null;
            document.body.style.userSelect = '';
            if (caretEl) caretEl.style.display = 'none';
            if (badgeEl) badgeEl.style.display = 'none';
        }
    }

    function escapeHtml(str) {
        return (str || '').replace(/[&<>"']/g, function(m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
        });
    }

    /**
     * Initializes global event bindings for text drag & drop.
     */
    function init() {
        // Prevent native HTML5 drag on editable selections
        window.addEventListener('dragstart', onDragStart, true);

        // Suppress click right after an intentional drag so it doesn't trigger element selection
        window.addEventListener('click', function(e) {
            if (window._justFinishedTextDrag) {
                window._justFinishedTextDrag = false;
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        // Pointer/mouse listeners (capture phase to ensure events are never swallowed)
        window.addEventListener('mousemove', onMouseMove, true);
        window.addEventListener('mouseup', onMouseUp, true);
        window.addEventListener('keydown', onKeyDown);

        // Auto-revert status message immediately if user starts typing
        document.addEventListener('input', function() {
            if (window._textDragStatusTimer) {
                clearTimeout(window._textDragStatusTimer);
                window._textDragStatusTimer = null;
                const curStatus = document.getElementById('status-msg');
                if (curStatus && (curStatus.innerText === 'Text Moved' || curStatus.innerText === 'Text Copied')) {
                    if (typeof state !== 'undefined' && state.selectedEl) {
                        curStatus.innerText = 'Element Selected';
                    } else {
                        curStatus.innerText = 'Ready';
                    }
                }
            }
        }, true);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function isDragging() {
        return !!(session && session.active);
    }

    return {
        isPointInSelection,
        startDrag,
        onMouseMove,
        onMouseUp,
        isDragging,
        getCaretElement,
        getBadgeElement
    };
})();
