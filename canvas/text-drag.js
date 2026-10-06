/**
 * Open Publisher - Canvas Text Drag & Drop Module (v5.4.5)
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

    /**
     * Checks if a target insertion range falls strictly inside the source selection range.
     */
    function isTargetInsideSource(targetRange, sourceRange) {
        if (!targetRange || !sourceRange) return false;
        try {
            const startCmp = targetRange.compareBoundaryPoints(Range.START_TO_START, sourceRange);
            const endCmp = targetRange.compareBoundaryPoints(Range.START_TO_END, sourceRange);
            return startCmp >= 0 && endCmp <= 0;
        } catch (e) {
            return false;
        }
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
            isHtml5Drag: false,
            startX: e.clientX,
            startY: e.clientY,
            sourceRange: sourceRange,
            sourceText: sourceText,
            sourceEditable: editable,
            sourceElement: pubElement,
            isCopy: e.ctrlKey || e.metaKey
        };

        // Suppress element dragging
        if (typeof state !== 'undefined' && state.dragMode === 'drag') {
            state.dragMode = null;
        }

        e.stopPropagation();
        return true;
    }

    /**
     * HTML5 DragStart handler: commits snapshot before drag mutation and sets drag payload.
     */
    function onDragStart(e) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
        const str = sel.toString();
        if (!str || str.length === 0) return;

        const targetNode = e.target.nodeType === 3 ? e.target.parentNode : e.target;
        const editable = targetNode ? targetNode.closest('[contenteditable="true"]') : null;
        if (!editable) return;

        // Snapshot pre-drag document state so Undo cleanly reverts
        if (typeof pushHistory === 'function') pushHistory(true);

        const sourceRange = sel.getRangeAt(0).cloneRange();
        session = {
            active: true,
            isDragging: true,
            isHtml5Drag: true,
            startX: e.clientX,
            startY: e.clientY,
            sourceRange: sourceRange,
            sourceText: str,
            sourceEditable: editable,
            sourceElement: editable.closest('.pub-element'),
            isCopy: e.ctrlKey || e.metaKey
        };

        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'copyMove';
            try {
                e.dataTransfer.setData('text/plain', str);
            } catch (err) {}
        }
    }

    /**
     * HTML5 DragOver handler: updates drop caret, badge, and copy modifier.
     */
    function onDragOver(e) {
        if (!session || !session.active) return;

        const targetRange = getCaretRangeFromPoint(e.clientX, e.clientY);
        const caret = getCaretElement();
        const isCopy = e.ctrlKey || e.metaKey;
        session.isCopy = isCopy;

        if (targetRange) {
            const startNode = targetRange.startContainer;
            const targetEditable = startNode.nodeType === 1
                ? startNode.closest('[contenteditable="true"]')
                : (startNode.parentElement ? startNode.parentElement.closest('[contenteditable="true"]') : null);

            if (targetEditable) {
                e.preventDefault();
                if (e.dataTransfer) {
                    e.dataTransfer.dropEffect = isCopy ? 'copy' : 'move';
                }

                const rects = targetRange.getClientRects();
                const r = rects.length > 0 ? rects[0] : targetRange.getBoundingClientRect();

                caret.style.display = 'block';
                caret.style.left = Math.round(r.left) + 'px';
                caret.style.top = Math.round(r.top) + 'px';
                caret.style.height = Math.max(16, Math.round(r.height || 18)) + 'px';

                const badge = getBadgeElement();
                const iconClass = isCopy ? 'fas fa-copy' : 'fas fa-arrows-alt';
                const displayLabel = session.sourceText.length > 20
                    ? session.sourceText.slice(0, 18).trim() + '...'
                    : session.sourceText.trim();
                badge.innerHTML = `<i class="${iconClass}" style="font-size:10px; margin-right:4px;"></i><span>${escapeHtml(displayLabel)}</span>`;
                badge.style.display = 'flex';
                badge.style.left = e.clientX + 'px';
                badge.style.top = e.clientY + 'px';
                return;
            }
        }

        caret.style.display = 'none';
        if (badgeEl) badgeEl.style.display = 'none';
    }

    /**
     * HTML5 Drop handler: intercepts drop on editable text and executes managed mutation.
     */
    function onDrop(e) {
        if (!session || !session.active) return;

        const targetRange = getCaretRangeFromPoint(e.clientX, e.clientY);
        if (!targetRange) return;

        const startNode = targetRange.startContainer;
        const targetEditable = startNode.nodeType === 1
            ? startNode.closest('[contenteditable="true"]')
            : (startNode.parentElement ? startNode.parentElement.closest('[contenteditable="true"]') : null);

        if (!targetEditable) return;

        e.preventDefault();
        e.stopPropagation();

        executeDrop(targetRange, targetEditable, e);
    }

    /**
     * HTML5 DragEnd handler: cleans up caret and badges.
     */
    function onDragEnd() {
        if (caretEl) caretEl.style.display = 'none';
        if (badgeEl) badgeEl.style.display = 'none';
        document.body.style.userSelect = '';
        session = null;
    }

    /**
     * Core execution engine for placing dropped text, updating selection, history, and status.
     */
    function executeDrop(targetRange, targetEditable, e) {
        const currentSession = session;
        session = null;

        if (caretEl) caretEl.style.display = 'none';
        if (badgeEl) badgeEl.style.display = 'none';
        document.body.style.userSelect = '';

        // If target is inside the source selection itself, ignore (dropped on itself)
        if (isTargetInsideSource(targetRange, currentSession.sourceRange)) {
            return;
        }

        const isCopy = e.ctrlKey || e.metaKey || currentSession.isCopy;

        try {
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

            const statusMsg = document.getElementById('status-msg');
            if (statusMsg) {
                statusMsg.innerText = isCopy ? 'Text Copied' : 'Text Moved';
            }
        } catch (err) {
            console.error('Error during text drag and drop execution:', err);
        }
    }

    /**
     * MouseMove fallback for non-native drag gestures.
     */
    function onMouseMove(e) {
        if (!session || !session.active || session.isHtml5Drag) {
            return;
        }

        const dist = Math.hypot(e.clientX - session.startX, e.clientY - session.startY);
        if (dist > 4 && !session.isDragging) {
            session.isDragging = true;
            document.body.style.userSelect = 'none';
            if (typeof pushHistory === 'function') pushHistory(true);
        }

        if (!session.isDragging) return;

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
        const targetRange = getCaretRangeFromPoint(e.clientX, e.clientY);

        if (targetRange) {
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
        }

        caret.style.display = 'none';
    }

    /**
     * MouseUp handler: handles click-to-collapse or fallback drag completion.
     */
    function onMouseUp(e) {
        if (!session || !session.active) return;
        if (session.isHtml5Drag) return;

        // Case A: User clicked on selected text without dragging -> collapse caret to click
        if (!session.isDragging) {
            const clickRange = getCaretRangeFromPoint(e.clientX, e.clientY);
            session = null;
            if (caretEl) caretEl.style.display = 'none';
            if (badgeEl) badgeEl.style.display = 'none';
            if (clickRange) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(clickRange);
                if (typeof state !== 'undefined') {
                    state.lastRange = clickRange.cloneRange();
                }
            }
            return;
        }

        // Case B: Fallback mouse drag drop
        const targetRange = getCaretRangeFromPoint(e.clientX, e.clientY);
        if (targetRange) {
            const startNode = targetRange.startContainer;
            const targetEditable = startNode.nodeType === 1
                ? startNode.closest('[contenteditable="true"]')
                : (startNode.parentElement ? startNode.parentElement.closest('[contenteditable="true"]') : null);

            if (targetEditable) {
                executeDrop(targetRange, targetEditable, e);
                return;
            }
        }

        session = null;
        if (caretEl) caretEl.style.display = 'none';
        if (badgeEl) badgeEl.style.display = 'none';
        document.body.style.userSelect = '';
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
        // HTML5 drag listeners
        window.addEventListener('dragstart', onDragStart, true);
        window.addEventListener('dragover', onDragOver, true);
        window.addEventListener('drop', onDrop, true);
        window.addEventListener('dragend', onDragEnd, true);

        // Pointer/mouse listeners
        window.addEventListener('mousemove', onMouseMove, { passive: false });
        window.addEventListener('mouseup', onMouseUp, { passive: false });
        window.addEventListener('keydown', onKeyDown);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        isPointInSelection,
        startDrag,
        onMouseMove,
        onMouseUp,
        getCaretElement,
        getBadgeElement
    };
})();
