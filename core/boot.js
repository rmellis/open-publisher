// ==========================================
// APPLICATION BOOTSTRAPPER (v5.14.2)
// ==========================================

window.onload = function() {
    DialogSystem.init(); // Initialize the Modal System
    initRulers();
    initColorSchemes();
    initThemes();
    initShapes();
    if (typeof initArrows === 'function') initArrows();
    initRibbonResponsiveness();
    //initClipart(); //disabled to provent lag, LazyLoad method used somewhere below
    initWordArt();
    initAds();
    initTemplates();
    initTablePicker();
    initFontPickers(); 
    if (window.TextBoxStylesSystem && typeof window.TextBoxStylesSystem.renderRibbonStrip === 'function') window.TextBoxStylesSystem.renderRibbonStrip();
    if(window.CustomColorPicker) window.CustomColorPicker.init();
    setupZoomControls();
    
    // Set Default Zoom to 60%
    setZoom(0.6);
    
    // Create initial page
    addNewPage();
    
    // Show Dashboard on startup if enabled
    if (window.DashboardSystem && localStorage.getItem('opub_show_start_screen') !== 'false') {
        DashboardSystem.show();
    }
    
    // Events
    paper.addEventListener('mousedown', e => (window.handleMouseDown || handleMouseDown)(e));
    window.addEventListener('mousemove', e => (window.handleMouseMove || handleMouseMove)(e));
    window.addEventListener('mouseup', e => (window.handleMouseUp || handleMouseUp)(e));
    document.addEventListener('keyup', handleKeyUp);

    // Keep the margin guide overlay aligned on scroll and resize
    const vpEl = document.getElementById('viewport');
    if (vpEl) {
        vpEl.addEventListener('scroll', function() {
            if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
        });
    }
    window.addEventListener('resize', function() {
        if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
    });
    
    // Track selection changes to update Float Bar state
let selectionTimer = null;
document.addEventListener('selectionchange', () => {
    if(state.isProgrammaticUpdate) return; 

    const selNow = window.getSelection();
    if(selNow && selNow.rangeCount > 0) {
        const rangeNow = selNow.getRangeAt(0);
        if(paper.contains(rangeNow.commonAncestorContainer)) {
            state.lastRange = rangeNow.cloneRange();
        }
    }

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
            if (typeof window.resetFontNavState === 'function') window.resetFontNavState();
        }
        if(e.target.id === 'viewport' || e.target.classList.contains('viewport')) deselect();
    });

    // Initialize Extended Modules
    setTimeout(() => {
        document.querySelectorAll('.wa-text').forEach(el => el.setAttribute('spellcheck', 'false'));
        if (typeof state !== 'undefined') {
            const savedSpell = localStorage.getItem('opub_spellcheck');
            if (savedSpell !== null) {
                state.spellCheck = savedSpell !== 'false';
            } else {
                state.spellCheck = true;
                try { localStorage.setItem('opub_spellcheck', 'true'); } catch(e) {}
            }
            document.body.setAttribute('spellcheck', 'false');
            // Load saved proofing language
            const savedProofLang = localStorage.getItem('opub_proofing_lang');
            const proofLang = savedProofLang || (navigator.language || 'en');
            document.querySelectorAll('.pub-element [contenteditable="true"], [contenteditable="true"]').forEach(el => {
                if (!el.classList.contains('wa-text')) {
                    el.setAttribute('spellcheck', 'false');
                    if (state.spellCheck) el.setAttribute('lang', proofLang);
                }
            });

            // Load saved ruler unit preference
            const savedRulerUnit = localStorage.getItem('opub_ruler_unit');
            if (savedRulerUnit && typeof setRulerUnit === 'function') {
                setRulerUnit(savedRulerUnit);
            } else if (savedRulerUnit && typeof state !== 'undefined') {
                state.rulerUnit = savedRulerUnit;
                state._userExplicitRulerUnit = true;
            }

            // Apply customized ribbon tab visibility and custom layout order
            if (typeof window.applyRibbonTabVisibility === 'function') {
                window.applyRibbonTabVisibility();
            }
            if (typeof window.applyRibbonCustomOrder === 'function') {
                window.applyRibbonCustomOrder();
            }

            // Start AutoRecover background loop
            if (typeof window.scheduleAutoRecover === 'function') {
                window.scheduleAutoRecover();
            }
        }
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
