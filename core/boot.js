// ==========================================
// APPLICATION BOOTSTRAPPER
// ==========================================

window.onload = function() {
    DialogSystem.init(); // Initialize the Modal System
    initRulers();
    initColorSchemes();
    initThemes();
    initShapes();
    initRibbonResponsiveness();
    //initClipart(); //disabled to provent lag, LazyLoad method used somewhere below
    initWordArt();
    initAds();
    initTemplates();
    initTablePicker();
    initFontPickers(); 
    if(window.CustomColorPicker) window.CustomColorPicker.init();
    setupZoomControls();
    
    // Set Default Zoom to 60%
    setZoom(0.6);
    
    // Show Dashboard on startup
    if (window.DashboardSystem) {
        DashboardSystem.show();
    } else {
        addNewPage();
    }
    
    // Events
    paper.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp); 
    
    // Track selection changes to update Float Bar state
let selectionTimer = null;
document.addEventListener('selectionchange', () => {
    if(state.isProgrammaticUpdate) return; 

    // Clear the timer if the user is still actively highlighting
    if (selectionTimer) clearTimeout(selectionTimer);
    
    // Wait 150ms after they stop dragging before updating the UI
    selectionTimer = setTimeout(() => {
        const sel = window.getSelection();
        if(sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            if(paper.contains(range.commonAncestorContainer)) {
                state.lastRange = range.cloneRange();
                if(state.selectedEl) {
                    updateFloatToolbarValues();
                    if(window.updateIndentMarkersPosition) window.updateIndentMarkersPosition();
                }
            }
        }
    }, 150); 
});

    
    window.addEventListener('click', (e) => {
        // Hide Dropdowns on outside click
        if(!e.target.closest('.dropdown-menu') && 
           !e.target.closest('.tool-btn') && 
           !e.target.closest('#float-toolbar') && 
           !e.target.closest('.custom-color-picker') &&
           !e.target.closest('.font-picker-container')) {
            document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
            document.querySelectorAll('.custom-dropdown').forEach(d => d.style.display = 'none');
        }
        if(e.target.id === 'viewport' || e.target.classList.contains('viewport')) deselect();
    });

    // Initialize Extended Modules
    setTimeout(() => {
        document.querySelectorAll('.wa-text').forEach(el => el.setAttribute('spellcheck', 'false'));
        if(window.ContextRibbonSystem) window.ContextRibbonSystem.init();

        // Sync drawing size sliders to fill properly if browser restored previous values
        document.querySelectorAll('.drawing-size-slider').forEach(slider => {
            if (typeof updateDrawingSize === 'function') {
                updateDrawingSize(slider.value);
            }
        });
    }, 500);
}

// --- MINIMAP CONTEXT MENU ---
document.addEventListener('click', () => {
    const menu = document.getElementById('minimap-context-menu');
    if (menu) menu.style.display = 'none';
});
