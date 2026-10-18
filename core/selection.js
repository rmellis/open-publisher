// ==========================================
// CORE SELECTION MANAGEMENT
// ==========================================

function deselect() {
    if(state.cropMode && typeof toggleCrop === 'function') toggleCrop(); 
    if(state.shapeEditMode && typeof window.exitShapeEditMode === 'function') window.exitShapeEditMode();
    if(state.multiSelected) { state.multiSelected.forEach(el => el.classList.remove('selected')); state.multiSelected = []; }
    if(state.selectedEl) {
        state.selectedEl.classList.remove('selected');
        const wa = state.selectedEl.querySelector('.wa-text');
        if(wa) { wa.classList.remove('editing'); wa.setAttribute('contenteditable', 'false'); if(typeof syncWordArt === 'function') syncWordArt(state.selectedEl); }
    }
    state.selectedEl = null;
    document.getElementById('status-msg').innerText = "Ready";
    { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
    if (window.updateIndentMarkersPosition) window.updateIndentMarkersPosition();
    if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
}

function deleteSelected() { 
    if(state.multiSelected && state.multiSelected.length > 0) {
        state.multiSelected.forEach(el => el.remove());
        state.multiSelected = [];
        updateThumbnails();
        pushHistory();
        { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
        if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
    } else if(state.selectedEl) { 
        state.selectedEl.remove(); 
        state.selectedEl=null; 
        updateThumbnails();
        pushHistory();
        { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
        if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
    } 
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
