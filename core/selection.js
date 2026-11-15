// ==========================================
// CORE SELECTION MANAGEMENT
// ==========================================

function deselect() {
    if (!window._preservingTextLinkOnPageSwitch && window.isLinkingTextBox && typeof window.cancelTextBoxLinking === 'function') {
        window.cancelTextBoxLinking();
    }
    if (document.activeElement && document.activeElement !== document.body) {
        const isEditable = document.activeElement.isContentEditable || 
                           document.activeElement.tagName === 'INPUT' || 
                           document.activeElement.tagName === 'TEXTAREA' ||
                           (document.activeElement.closest && document.activeElement.closest('[contenteditable="true"]'));
        if (isEditable) {
            try { document.activeElement.blur(); } catch(err) {}
            if (window.getSelection) {
                try { window.getSelection().removeAllRanges(); } catch(err) {}
            }
        }
    }

    if(state.cropMode && typeof toggleCrop === 'function') toggleCrop(); 
    if(state.shapeEditMode && typeof window.exitShapeEditMode === 'function') window.exitShapeEditMode();
    if(state.multiSelected) { state.multiSelected.forEach(el => el.classList.remove('selected')); state.multiSelected = []; }
    if(state.selectedEl) {
        state.selectedEl.classList.remove('selected');
        const wa = state.selectedEl.querySelector('.wa-text');
        if(wa) { wa.classList.remove('editing'); wa.setAttribute('contenteditable', 'false'); if(typeof syncWordArt === 'function') syncWordArt(state.selectedEl); }
    }
    state.selectedEl = null;
    if (typeof window.syncFormatButtonHighlights === 'function') window.syncFormatButtonHighlights(null);
    if (window._isTransitioningSelection) return;
    document.getElementById('status-msg').innerText = "Ready";
    { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
    if (window.ProgressBarEngine && typeof window.ProgressBarEngine.hideToolbar === 'function') window.ProgressBarEngine.hideToolbar();
    if (window.updateIndentMarkersPosition) window.updateIndentMarkersPosition();
    if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
}

function executeDeleteElements(elsToRemove) {
    if (!elsToRemove || elsToRemove.length === 0) return;
    if (typeof window.handleLinkedBoxesRemoved === 'function') {
        window.handleLinkedBoxesRemoved(elsToRemove);
    }
    elsToRemove.forEach(el => {
        if (el && el.remove) el.remove();
    });
    if (state.multiSelected && state.multiSelected.length > 0) {
        state.multiSelected = [];
    }
    if (state.selectedEl && elsToRemove.includes(state.selectedEl)) {
        state.selectedEl = null;
    }
    if (typeof updateThumbnails === 'function') updateThumbnails();
    if (typeof pushHistory === 'function') pushHistory();
    {
        const ft = (typeof floatToolbar !== 'undefined' ? floatToolbar : null) || document.getElementById('float-toolbar');
        if (ft) ft.style.display = 'none';
        const _wa = document.getElementById('wa-float-toolbar');
        if (_wa) _wa.style.display = 'none';
    }
    const status = document.getElementById('status-msg');
    if (status) status.innerText = 'Ready';
    if (window.ProgressBarEngine && typeof window.ProgressBarEngine.hideToolbar === 'function') window.ProgressBarEngine.hideToolbar();
    if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
}

function showLinkedTextBoxDeleteModal(elsToRemove, chainInfo) {
    const count = (chainInfo && chainInfo.totalLinkedCount) || 2;
    const pages = (chainInfo && chainInfo.pageNumbers) || [];
    const spansMultiplePages = pages.length > 1;
    const pageListText = spansMultiplePages ? ` across Pages ${pages.join(', ')}` : '';
    const isMulti = elsToRemove.length > 1;
    const singleLabel = isMulti ? 'Delete Selected Boxes' : 'Delete Selected Text Box';
    const allLabel = `Delete All Linked (${count})`;

    const bodyHtml = `
        <div style="display:flex; flex-direction:column; gap:12px; min-width:340px; max-width:440px;">
            <div style="display:flex; align-items:flex-start; gap:12px; padding:12px; border-radius:8px; background: #f8fafc; border: 1px solid #e2e8f0;">
                <div style="width:36px; height:36px; border-radius:8px; background:var(--ui-theme-color, #007670); color:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:16px;">
                    <i class="fas fa-link"></i>
                </div>
                <div style="font-size:13px; line-height:1.45; color: #1e293b;">
                    <div style="font-weight:700; margin-bottom:4px;">This text box is part of a linked text flow chain.</div>
                    <div style="color: #64748b;">
                        This chain currently links <strong>${count} text boxes</strong>${pageListText}. Choose whether to remove only the selected box or the entire linked chain:
                    </div>
                </div>
            </div>
            <ul style="margin:0; padding-left:18px; font-size:12.5px; line-height:1.55; color: #334155;">
                <li><strong>${singleLabel}:</strong> Removes only the selection and reflows its story into the remaining linked boxes.</li>
                <li><strong>${allLabel}:</strong> Deletes all ${count} connected text boxes in this chain${spansMultiplePages ? ' (including linked boxes on other pages)' : ''}.</li>
                <li><strong>Leave Them Alone:</strong> Keeps all text boxes and links unchanged.</li>
            </ul>
        </div>
    `;

    DialogSystem.show('Delete Linked Text Box', bodyHtml, null, true);

    const dialogBox = document.getElementById('custom-dialog-box');
    const footer = dialogBox ? dialogBox.querySelector('.custom-dialog-footer') : null;
    if (!footer) return;

    footer.style.display = 'flex';
    footer.style.flexWrap = 'wrap';
    footer.style.justifyContent = 'flex-end';
    footer.style.gap = '8px';
    footer.innerHTML = `
        <button type="button" class="btn-secondary" id="btn-linked-del-cancel">Leave Them Alone</button>
        <button type="button" class="btn-primary" id="btn-linked-del-single">${singleLabel}</button>
        <button type="button" class="btn-primary" id="btn-linked-del-all" style="background:#dc2626; border-color:#dc2626; color:#ffffff;">${allLabel}</button>
    `;

    const cancelBtn = document.getElementById('btn-linked-del-cancel');
    const singleBtn = document.getElementById('btn-linked-del-single');
    const allBtn = document.getElementById('btn-linked-del-all');

    if (cancelBtn) {
        cancelBtn.onclick = () => DialogSystem.close();
    }
    if (singleBtn) {
        singleBtn.onclick = () => {
            DialogSystem.close();
            executeDeleteElements(elsToRemove);
        };
    }
    if (allBtn) {
        allBtn.onmouseenter = () => { allBtn.style.background = '#b91c1c'; allBtn.style.borderColor = '#b91c1c'; };
        allBtn.onmouseleave = () => { allBtn.style.background = '#dc2626'; allBtn.style.borderColor = '#dc2626'; };
        allBtn.onclick = () => {
            DialogSystem.close();
            if (typeof window.deleteAllLinkedTextBoxes === 'function') {
                window.deleteAllLinkedTextBoxes(elsToRemove);
            } else {
                executeDeleteElements(elsToRemove);
            }
        };
    }
}

function deleteSelected() {
    let elsToRemove = [];
    if (state.multiSelected && state.multiSelected.length > 0) {
        elsToRemove = state.multiSelected.slice();
    } else if (state.selectedEl) {
        elsToRemove = [state.selectedEl];
    }
    if (elsToRemove.length === 0) return;

    const hasLinkedAttr = elsToRemove.some(el => el && el.getAttribute && (el.getAttribute('data-next-box') || el.getAttribute('data-prev-box')));
    if (hasLinkedAttr && typeof DialogSystem !== 'undefined') {
        const chainInfo = (typeof window.getLinkedChainInfoForElements === 'function')
            ? window.getLinkedChainInfoForElements(elsToRemove)
            : null;
        if (!chainInfo || chainInfo.totalLinkedCount >= 2) {
            showLinkedTextBoxDeleteModal(elsToRemove, chainInfo);
            return;
        }
    }

    executeDeleteElements(elsToRemove);
}

function rotateSelectedImage() {
    if(state.selectedEl) {
        const currentTransform = state.selectedEl.style.transform || 'none';
        // Parse rotation
        let angle = 0;
        if(currentTransform.includes('rotate')) {
            const match = currentTransform.match(/rotate\(([-\d.]+)deg\)/);
            if(match) angle = parseFloat(match[1]);
        }
        angle += 90;
        state.selectedEl.style.transform = `rotate(${angle}deg)`;
        updateThumbnails();
        pushHistory();
    } else {
        DialogSystem.alert('Notice', "Please select an object to rotate.");
    }
}

function duplicateSelected() {
    // 1. Defocus any active text editing so changes are committed
    if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
    }

    const paper = document.getElementById('paper');
    if (!paper) return;

    // 2. Multi-selection duplication support
    if (state.multiSelected && state.multiSelected.length > 1) {
        const newSelection = [];
        state.multiSelected.forEach(el => {
            if (el.getAttribute('data-is-theme') === 'true' || el.getAttribute('data-is-border') === 'true') return;
            const clone = el.cloneNode(true);
            clone.id = 'pub-el-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
            clone.style.left = (parseFloat(clone.style.left || 0) + 20) + 'px';
            clone.style.top = (parseFloat(clone.style.top || 0) + 20) + 'px';
            clone.classList.remove('selected', 'cropping', 'editing-shape');
            
            // Clean unneeded child overlays if any
            clone.querySelectorAll('.element-quick-actions').forEach(qa => qa.remove());
            
            // Disconnect linked text boxes if any
            clone.removeAttribute('data-next-box');
            clone.removeAttribute('data-prev-box');
            const inner = clone.querySelector('[contenteditable="true"], .text-content');
            if (inner) {
                inner.removeAttribute('data-next-box');
                inner.removeAttribute('data-prev-box');
                inner.setAttribute('contenteditable', 'true');
            }
            
            paper.appendChild(clone);
            newSelection.push(clone);
        });

        if (newSelection.length > 0) {
            if (typeof window.deselect === 'function') window.deselect();
            state.multiSelected = newSelection;
            newSelection.forEach(el => el.classList.add('selected'));
            if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
            if (typeof updateThumbnails === 'function') updateThumbnails();
            if (typeof pushHistory === 'function') pushHistory();
        }
        return;
    }

    // 3. Single selected element duplication
    let target = state.selectedEl;
    if (!target && state.multiSelected && state.multiSelected.length === 1) {
        target = state.multiSelected[0];
    }
    if (!target) return;
    if (target.getAttribute('data-is-theme') === 'true' || target.getAttribute('data-is-border') === 'true') return;

    const clone = target.cloneNode(true);
    clone.id = 'pub-el-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    
    // Offset +20px right and down
    const curLeft = parseFloat(target.style.left) || target.offsetLeft || 0;
    const curTop = parseFloat(target.style.top) || target.offsetTop || 0;
    clone.style.left = (curLeft + 20) + 'px';
    clone.style.top = (curTop + 20) + 'px';

    // Remove any leftover quick actions or selection classes
    clone.classList.remove('selected', 'cropping', 'editing-shape');
    clone.querySelectorAll('.element-quick-actions').forEach(qa => qa.remove());

    // Disconnect linked text boxes so the clone is fully independent
    clone.removeAttribute('data-next-box');
    clone.removeAttribute('data-prev-box');
    const innerText = clone.querySelector('[contenteditable="true"], .text-content');
    if (innerText) {
        innerText.removeAttribute('data-next-box');
        innerText.removeAttribute('data-prev-box');
        innerText.setAttribute('contenteditable', 'true');
    }

    // Append to canvas
    paper.appendChild(clone);

    // Select the new clone
    if (typeof selectElement === 'function') {
        selectElement(clone);
    } else if (typeof window.selectElement === 'function') {
        window.selectElement(clone);
    }

    // Refresh UI & history
    if (typeof updateThumbnails === 'function') updateThumbnails();
    if (typeof pushHistory === 'function') pushHistory();
}

window.deselect = deselect;
window.deleteSelected = deleteSelected;
window.rotateSelectedImage = rotateSelectedImage;
window.duplicateSelected = duplicateSelected;
