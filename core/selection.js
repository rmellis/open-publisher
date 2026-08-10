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
}

function deleteSelected() { 
    if(state.multiSelected && state.multiSelected.length > 0) {
        state.multiSelected.forEach(el => el.remove());
        state.multiSelected = [];
        updateThumbnails();
        pushHistory();
        { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
    } else if(state.selectedEl) { 
        state.selectedEl.remove(); 
        state.selectedEl=null; 
        updateThumbnails();
        pushHistory();
        { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
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

window.deselect = deselect;
window.deleteSelected = deleteSelected;
window.rotateSelectedImage = rotateSelectedImage;
