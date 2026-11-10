// ==========================================
// APPLICATION BOOTSTRAPPER (v5.17.0)
// ==========================================

let _opBooted = false;
function bootOpenPublisher() {
    if (_opBooted) return;
    _opBooted = true;
    window._opBootSelectionChangeActive = true;
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
    
    // Check if an associated document was passed via NW.js startup arguments
    if (typeof window.checkNwStartupArgv === 'function') {
        window.checkNwStartupArgv();
    }

    // Process any deferred document loaded before DOM ready
    if (window._pendingStartupPublication && typeof window.handlePublisherFileLoad === 'function') {
        const pending = window._pendingStartupPublication;
        window._pendingStartupPublication = null;
        window.handlePublisherFileLoad(pending);
    }

    // Create initial page only if no document is already loaded or loading
    const hasLoadedDoc = (window._documentLoadingActive || window._hasLoadedInitialDocument) ||
        (state.pages && state.pages.length > 0 && state.pages.some(p => p.elements && p.elements.length > 0));

    if (!hasLoadedDoc) {
        addNewPage();
        
        // Show Dashboard on startup if enabled
        if (window.DashboardSystem && localStorage.getItem('opub_show_start_screen') !== 'false') {
            DashboardSystem.show();
        }
    } else {
        // Document already loaded or loading: ensure dashboard is closed
        if (window.DashboardSystem && typeof DashboardSystem.close === 'function') {
            DashboardSystem.close();
        }
    }

    // Classic MS Publisher Cursor Settings
    window.useClassicCursors = (localStorage.getItem('opub_classic_cursors') !== 'false');
    if (document.body) {
        document.body.classList.toggle('classic-cursors-enabled', window.useClassicCursors);
    }
    const classicBtn = document.getElementById('ribbon-classic-cursors-btn');
    if (classicBtn) {
        classicBtn.classList.toggle('active-tool', window.useClassicCursors);
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

    const activePre = document.activeElement;
    if (activePre && (activePre.tagName === 'INPUT' || activePre.tagName === 'TEXTAREA' || activePre.tagName === 'SELECT')) return;
    const selNow = window.getSelection();
    if(selNow && selNow.rangeCount > 0) {
        const rangeNow = selNow.getRangeAt(0);
        if(paper.contains(rangeNow.commonAncestorContainer)) {
            state.lastRange = rangeNow.cloneRange();
        }
    }

    if(state.selectedEl && typeof window.syncFormatButtonHighlights === 'function') {
        window.syncFormatButtonHighlights();
    }

    // Clear the timer if the user is still actively highlighting
    if (selectionTimer) clearTimeout(selectionTimer);
    
    // Wait 150ms after they stop dragging before updating the UI
    selectionTimer = setTimeout(() => {
        const activeDelayed = document.activeElement;
        if (activeDelayed && (activeDelayed.tagName === 'INPUT' || activeDelayed.tagName === 'TEXTAREA' || activeDelayed.tagName === 'SELECT')) return;
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootOpenPublisher);
} else {
    bootOpenPublisher();
}
window.addEventListener('load', bootOpenPublisher);

// --- MINIMAP CONTEXT MENU ---
document.addEventListener('click', () => {
    const menu = document.getElementById('minimap-context-menu');
    if (menu) menu.style.display = 'none';
});
