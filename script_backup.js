

// --- CUSTOM DRAGGABLE MODAL SYSTEM ---

// --- INITIALIZATION ---
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
    setupZoomControls();
    
    // Set Default Zoom to 60%
    setZoom(0.6);
    
    // Create first page
    addNewPage();
    
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
                e.preventDefault();
                pasteEl();
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
};

/* --- CUSTOM FONT PICKER LOGIC --- */
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
// FIXED: Helper to force browser to repaint the selected element
// --- ZOOM CONTROLS ---
window.switchOptionsTab = function(activeId) {
    document.querySelectorAll('.opt-tab').forEach(el => {
        el.style.background = 'transparent';
        el.style.borderLeftColor = 'transparent';
        el.style.fontWeight = 'normal';
    });
    document.querySelectorAll('.opt-content').forEach(el => el.style.display = 'none');
    
    const activeTab = document.getElementById('opt-tab-' + activeId);
    if (activeTab) {
        activeTab.style.background = '#f0f0f0';
        activeTab.style.borderLeftColor = 'var(--ui-theme-color)';
        activeTab.style.fontWeight = 'bold';
    }
    const activeContent = document.getElementById('opt-content-' + activeId);
    if (activeContent) activeContent.style.display = 'block';
};


window.saveGlobalOptions = function(closeDialog = true) {
    const cbHyphen = document.getElementById('opt-autohyphenate');
    if (cbHyphen) {
        localStorage.setItem('opub_autoHyphenate', cbHyphen.checked ? 'true' : 'false');
    }
    
    const cbSpell = document.getElementById('opt-spellcheck');
    if (cbSpell) {
        localStorage.setItem('opub_spellcheck', cbSpell.checked ? 'true' : 'false');
    }
    
    const txtUser = document.getElementById('opt-username');
    if (txtUser) {
        localStorage.setItem('opub_username', txtUser.value);
    }
    
    if (closeDialog) {
        DialogSystem.close();
    } else {
        const applyBtn = document.getElementById('custom-dialog-apply');
        if (applyBtn) {
            const originalText = applyBtn.innerText;
            applyBtn.innerText = 'Applied!';
            setTimeout(() => {
                if (applyBtn) applyBtn.innerText = originalText;
            }, 1000);
        }
    }
};


// FIXED: insertTable now uses "Separate but Locked" strategy to prevent disappearing lines on zoom






// --- CROP FEATURE ---

// --- SHAPE EDIT MODE LOGIC ---
window.toggleShapeEditPoints = function(el) {
    el = el || state.selectedEl;
    if(!el) return;
    if(state.shapeEditMode) {
        window.exitShapeEditMode();
        return;
    }
    
    // Check if it's a shape
    const dataType = el.getAttribute('data-type');
    let type = null;
    let contentDiv = el.querySelector('.element-content > div:not(.shape-text)') || el.querySelector('.element-content');
    let svgPolygon = el.querySelector('svg polygon');
    let points = [];
    
    if(dataType === 'shape' && contentDiv && contentDiv.style.clipPath && contentDiv.style.clipPath.includes('polygon')) {
        type = 'clip-path';
        // Parse clip-path polygon(x% y%, x% y%, ...)
        const match = contentDiv.style.clipPath.match(/polygon\(([^)]+)\)/);
        if(match) {
            const pts = match[1].split(',').map(s => s.trim());
            pts.forEach(p => {
                const parts = p.split(' ');
                if(parts.length >= 2) {
                    points.push({
                        x: parseFloat(parts[0]),
                        y: parseFloat(parts[1])
                    });
                }
            });
        }
    } else if(dataType === 'shape' && contentDiv && (!contentDiv.style.clipPath || contentDiv.style.clipPath.includes('inset'))) {
        type = 'clip-path';
        contentDiv.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
        points = [
            {x: 0, y: 0},
            {x: 100, y: 0},
            {x: 100, y: 100},
            {x: 0, y: 100}
        ];
    } else if(svgPolygon) {
        type = 'svg-polygon';
        // Parse points="x,y x,y"
        const ptsAttr = svgPolygon.getAttribute('points');
        if(ptsAttr) {
            const pts = ptsAttr.trim().split(/[\s,]+/);
            for(let i=0; i<pts.length; i+=2) {
                if(i+1 < pts.length) {
                    points.push({
                        x: parseFloat(pts[i]),
                        y: parseFloat(pts[i+1])
                    });
                }
            }
        }
    } else {
        return; // Not a supported shape
    }
    
    if(points.length === 0) return;
    
    state.shapeEditMode = true;
    el.classList.add('editing-shape');
    document.getElementById('status-msg').innerText = "Shape Edit Mode: Drag points to modify shape.";
    
    window._shapeEditContext = { el, type, points, contentDiv, svgPolygon };
    window.renderShapeEditHandles();
};

window.renderShapeEditHandles = function() {
    if(!state.shapeEditMode || !window._shapeEditContext) return;
    const { el, points, type } = window._shapeEditContext;
    
    // Remove existing handles
    el.querySelectorAll('.shape-edit-handle').forEach(h => h.remove());
    
    points.forEach((pt, index) => {
        const handle = document.createElement('div');
        handle.className = 'shape-edit-handle';
        handle.dataset.index = index;
        
        if(type === 'clip-path') {
            handle.style.left = pt.x + '%';
            handle.style.top = pt.y + '%';
        } else if(type === 'svg-polygon') {
            handle.style.left = pt.x + '%';
            handle.style.top = pt.y + '%';
        }
        el.appendChild(handle);
    });
};

// --- INTERACTION LOGIC ---
// Double Click Edit
document.addEventListener('dblclick', (e) => {
    const el = e.target.closest('.pub-element');

    // --- Master Page Quick Toggle (Headers/Footers) ---
    if (!el && e.target.closest('#paper')) {
        const paper = document.getElementById('paper');
        if (paper) {
            const rect = paper.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                const relativeY = e.clientY - rect.top;
                const unscaledY = relativeY / (state.zoom || 1);
                const paperHeight = parseFloat(paper.style.height) || 1123;
                
                // If clicked within top 100px or bottom 100px
                if (unscaledY <= 100 || unscaledY >= paperHeight - 100) {
                    // Check if an action is required to edit headers
                    if (!state.hasMasterPage || state.currentPageIndex !== 0 || !state.headersVisible) {
                        if (typeof DialogSystem !== 'undefined') {
                            DialogSystem.show(
                                'Edit Header/Footer', 
                                '<p>You double-clicked the header/footer area. Would you like to jump to the Master Page to edit the template for all pages?</p>', 
                                () => {
                                    if (!state.hasMasterPage) {
                                        if (typeof addMasterPage === 'function') addMasterPage();
                                    } else if (state.currentPageIndex !== 0) {
                                        if (typeof switchPage === 'function') switchPage(0);
                                    }
                                    
                                    if (!state.headersVisible && typeof toggleHeaderFooter === 'function') {
                                        toggleHeaderFooter(true);
                                    }
                                    
                                    setTimeout(() => {
                                        const currentPaper = document.getElementById('paper');
                                        if (!currentPaper) return;
                                        const targetClass = unscaledY <= 100 ? '.page-header' : '.page-footer';
                                        const elToFocus = currentPaper.querySelector(targetClass);
                                        if (elToFocus) {
                                            elToFocus.focus();
                                            // Place cursor at end
                                            if (typeof window.getSelection !== 'undefined' && typeof document.createRange !== 'undefined') {
                                                const range = document.createRange();
                                                range.selectNodeContents(elToFocus);
                                                range.collapse(false);
                                                const sel = window.getSelection();
                                                sel.removeAllRanges();
                                                sel.addRange(range);
                                            }
                                        }
                                    }, 50);
                                }
                            );
                        }
                    }
                    // If we were already on the master page and headers were visible,
                    // do not interfere so native double-click text selection works natively.
                    return; // Prevent other double click handlers
                }
            }
        }
    }
    // ------------------------------------------------

    if(el) {
        const betaWa = el.querySelector('.beta-wa-img');
        if(betaWa) {
            if (typeof window.showBetaWordArtModal === 'function') {
                window.showBetaWordArtModal(el);
            }
            return;
        }

        const wa = el.querySelector('.wa-text');
        if(wa) {
            wa.classList.add('editing');
            wa.setAttribute('contenteditable', 'true');
            wa.style.transform = 'none'; // NEW: Snap back to natural size for typing
            wa.focus();
            return;
        }

        const isShape = el.getAttribute('data-type') === 'shape';
        
        // UN-FLATTEN 3D IMAGES
        if (el.hasAttribute('data-original-state')) {
            try {
                const s = JSON.parse(decodeURIComponent(el.getAttribute('data-original-state')));
                
                // BACKUP THE PNG STATE FOR CANCEL
                const pngContentHTML = el.querySelector('.element-content').outerHTML;
                const pngWidth = el.style.width;
                const pngHeight = el.style.height;
                const pngLeft = el.style.left;
                const pngTop = el.style.top;
                const pngType = el.getAttribute('data-type');
                const pngOriginalState = el.getAttribute('data-original-state');
                
                const content = el.querySelector('.element-content');
                if (content) {
                    content.outerHTML = s.html;
                }
                el.style.width = s.w;
                el.style.height = s.h;
                el.style.left = s.l;
                el.style.top = s.t;
                el.setAttribute('data-type', s.type);
                el.removeAttribute('data-original-state');
                
                selectElement(el);
                
                if (typeof ContextMenuActions !== 'undefined' && typeof ContextMenuActions.formatTextBox === 'function') {
                    ContextMenuActions.formatTextBox();
                    
                    // Attach our own cancel hook wrapper to restore the PNG instantly!
                    if (window._dialogCancelHook) {
                        const originalHook = window._dialogCancelHook;
                        window._dialogCancelHook = () => {
                            originalHook(); 
                            const curContent = el.querySelector('.element-content');
                            if(curContent) curContent.outerHTML = pngContentHTML;
                            el.style.width = pngWidth;
                            el.style.height = pngHeight;
                            el.style.left = pngLeft;
                            el.style.top = pngTop;
                            el.setAttribute('data-type', pngType);
                            el.setAttribute('data-original-state', pngOriginalState);
                            selectElement(el);
                        };
                    }
                }
                return;
            } catch(err) {
                console.error("Failed to unflatten state", err);
            }
        }
        
        if (isShape && typeof ContextMenuActions !== 'undefined' && typeof ContextMenuActions.formatTextBox === 'function') {
            ContextMenuActions.formatTextBox();
            return;
        }
        
        const content = el.querySelector('.element-content div, .element-content table');
        if(content) { 
            content.setAttribute('contenteditable', 'true');
            content.focus();
        }
    }
});
// --- WA TOOLBAR DRAG LOGIC ---
let waToolbarDrag = { active: false, startX: 0, startY: 0, initLeft: 0, initTop: 0 };
function startDragWaToolbar(e) {
    e.preventDefault();
    e.stopPropagation();
    const tb = document.getElementById('wa-float-toolbar');
    waToolbarDrag.active = true;
    waToolbarDrag.startX = e.clientX;
    waToolbarDrag.startY = e.clientY;
    waToolbarDrag.initLeft = parseInt(tb.style.left || 0, 10);
    waToolbarDrag.initTop = parseInt(tb.style.top || 0, 10);
    
    document.addEventListener('mousemove', doDragWaToolbar);
    document.addEventListener('mouseup', stopDragWaToolbar);
}
function doDragWaToolbar(e) {
    if(!waToolbarDrag.active) return;
    const dx = e.clientX - waToolbarDrag.startX;
    const dy = e.clientY - waToolbarDrag.startY;
    const tb = document.getElementById('wa-float-toolbar');
    tb.style.left = (waToolbarDrag.initLeft + dx) + 'px';
    tb.style.top = (waToolbarDrag.initTop + dy) + 'px';
}
function stopDragWaToolbar() {
    waToolbarDrag.active = false;
    document.removeEventListener('mousemove', doDragWaToolbar);
    document.removeEventListener('mouseup', stopDragWaToolbar);
}

// --- MENU ACTIONS ---
window.lastStandardTab = 'home';



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
// --- TABS DIALOG ---

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





// --- STANDARD FILE OPEN MENU ---
document.getElementById('file-open').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;

    const fileName = file.name.toLowerCase();

    // 1. Handle Publisher Files
    if (fileName.endsWith('.pub') || fileName.endsWith('.pubx')) {
        if (typeof uploadAndConvertPub === 'function') uploadAndConvertPub(file);
        e.target.value = ''; 
        return;
    }

    // 2. Handle Word Documents
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        if (typeof uploadAndConvertDoc === 'function') uploadAndConvertDoc(file);
        e.target.value = ''; 
        return;
    }

    // 3. Handle OpenPublisher Native Files (.json or .opub)
    if (fileName.endsWith('.json') || fileName.endsWith('.opub')) {
        const reader = new FileReader();
        reader.onload = window.handlePublisherFileLoad;
        reader.readAsText(file);
        e.target.value = ''; 
    }
});

// --- INSERT FILE (TEXT) MENU ---
document.getElementById('insert-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;

    if (!state.selectedEl) {
        if(typeof DialogSystem !== 'undefined') {
            DialogSystem.show('Insert File', 'Please select a text box first to insert the file contents into.');
        } else {
            alert('Please select a text box first to insert the file contents into.');
        }
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const data = JSON.parse(evt.target.result);
            let combinedText = '';
            if (data.pages && Array.isArray(data.pages)) {
                data.pages.forEach(page => {
                    if (page.elements && Array.isArray(page.elements)) {
                        page.elements.forEach(el => {
                            // Strictly only process generic boxes (which text boxes are)
                            if (el.type !== 'box' && el.type !== 'text' && el.type !== undefined) return;
                            if (el.isImage || el.isImageFallback) return;
                            if (!el.innerHTML) return;

                            const temp = document.createElement('div');
                            temp.innerHTML = el.innerHTML;
                            
                            // Text boxes are characterized by having a contenteditable region
                            const editableNode = temp.querySelector('[contenteditable="true"]');
                            if (!editableNode) return; // If it's not editable, it's not a text box (e.g. a grouped shape)

                            // WordArt sometimes sneaks in if it was editable, filter it out
                            if (temp.querySelector('.wa-text') || temp.querySelector('svg')) return;

                            // Scrape ONLY the pure text/html content, leaving behind the layout wrappers
                            let cleanHTML = editableNode.innerHTML.trim();
                            if (cleanHTML && cleanHTML !== 'Click to edit text' && cleanHTML !== '<br>') {
                                // Add a paragraph break between distinct text boxes
                                combinedText += cleanHTML + '<br><br>';
                            }
                        });
                    }
                });
            }
            
            if (combinedText) {
                const contentNode = state.selectedEl.querySelector('.element-content');
                // The target element's editable area is inside element-content > div
                const targetEditableNode = contentNode ? (contentNode.querySelector('[contenteditable="true"]') || contentNode) : null;
                
                if (targetEditableNode) {
                    targetEditableNode.innerHTML += combinedText;
                    if(typeof saveState === 'function') saveState();
                    if(typeof pushHistory === 'function') pushHistory();
                    if(typeof DialogSystem !== 'undefined') {
                        DialogSystem.show('Insert File', 'Text successfully imported from the document and poured into your selected box.');
                    }
                } else {
                    if(typeof DialogSystem !== 'undefined') {
                        DialogSystem.show('Insert File', 'Could not insert text into the selected element.');
                    }
                }
            } else {
                if(typeof DialogSystem !== 'undefined') {
                    DialogSystem.show('Insert File', 'No text found in the selected document to import.');
                }
            }
        } catch(err) {
            console.error(err);
            if(typeof DialogSystem !== 'undefined') {
                DialogSystem.show('Error', 'Failed to read or parse the file. Ensure it is a valid OpenPublisher document.');
            }
        }
        e.target.value = '';
    };
    reader.readAsText(file);
});


// --- NEW WORDART SYNC FUNCTION ---
window.toggleSnapOption = function(option, btn) {
    const isTurningOn = !state.snap[option];
    state.snap[option] = isTurningOn;
    if (btn) btn.querySelector('.check').style.opacity = isTurningOn ? '1' : '0';
    
    if (option === 'grid' && isTurningOn) {
        if (typeof DialogSystem !== 'undefined') {
            DialogSystem.show('Show Grid?', '<p>You enabled Snap to Grid. Would you like to make the grid background visually visible on the canvas as well?</p>', () => {
                const paperEl = document.getElementById('paper');
                if (paperEl && !paperEl.classList.contains('theme-grid')) {
                    paperEl.classList.add('theme-grid');
                }
            });
            setTimeout(() => {
                const footer = document.querySelector('#custom-dialog-box .custom-dialog-footer');
                if (footer) {
                    const btns = footer.querySelectorAll('button');
                    if (btns.length >= 2) {
                        btns[0].innerText = 'No, Keep Hidden';
                        btns[1].innerText = 'Yes, Show Grid';
                    }
                }
            }, 10);
        }
    } else if (option === 'grid' && !isTurningOn) {
        const paperEl = document.getElementById('paper');
        if (paperEl && paperEl.classList.contains('theme-grid') && typeof DialogSystem !== 'undefined') {
            DialogSystem.show('Hide Grid?', '<p>You disabled Snap to Grid. Would you like to hide the grid background as well?</p>', () => {
                paperEl.classList.remove('theme-grid');
            });
            setTimeout(() => {
                const footer = document.querySelector('#custom-dialog-box .custom-dialog-footer');
                if (footer) {
                    const btns = footer.querySelectorAll('button');
                    if (btns.length >= 2) {
                        btns[0].innerText = 'No, Keep Visible';
                        btns[1].innerText = 'Yes, Hide Grid';
                    }
                }
            }, 10);
        }

        setTimeout(() => {
            const input = document.getElementById('doc-protect-pw');
            if (input) input.focus();
        }, 100);
    }
};

window.setProofMode = function(filterStr) {
    const paperEl = document.getElementById('paper');
    const banner = document.getElementById('color-blind-banner');
    if (paperEl) paperEl.style.filter = filterStr;
    if (banner) {
        banner.style.display = filterStr === 'none' ? 'none' : 'block';
    }
};



// 1. Ensure state can hold multiple items
state.multiSelected = state.multiSelected || [];

// 2. Override Mouse Down

// 3. Override Mouse Move (with Page Clamping)

// 4. Override Mouse Up

// 5. Override Deselect
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

// 6. Override Delete
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





// --- RIBBON RESPONSIVENESS ---







// --- 3. MOUSE INTERACTION OVERRIDES (MARQUEE & PROPORTIONAL CROP) ---

























// 1. Global registry to remember which pages we've already auto-fixed.
// This ensures we NEVER fight the user if they manually click the Orient button later!
window._orientedPagesRegistry = window._orientedPagesRegistry || new Set();

// --- MAIN CANVAS ENGINE ---
setInterval(() => {
    if (!state.pages || state.pages.length === 0) return;

    const currentPage = state.pages[state.currentPageIndex];
    if (!currentPage || !currentPage.id) return;
    
    // 2. If we haven't checked this specific page yet, check it!
    if (!window._orientedPagesRegistry.has(currentPage.id)) {
        window._orientedPagesRegistry.add(currentPage.id); // Lock it permanently for this session
        
        const bgEl = currentPage.elements.find(e => e.imgSrc && e.imgSrc.startsWith('data:image'));
        
        if (bgEl) {
            const img = new Image();
            img.onload = function() {
                let needsFix = false;
                
                if (img.width > img.height) { 
                    if (currentPage.width !== "1123px") {
                        currentPage.width = "1123px";
                        currentPage.height = "794px";
                        needsFix = true;
                    }
                } else { 
                    if (currentPage.width !== "794px") {
                        currentPage.width = "794px";
                        currentPage.height = "1123px";
                        needsFix = true;
                    }
                }

                if (needsFix) {
                    const paperEl = document.getElementById('paper');
                    if (paperEl) {
                        paperEl.style.width = currentPage.width;
                        paperEl.style.height = currentPage.height;
                    }
                    if (typeof window.renderPage === 'function') window.renderPage(currentPage);
                    if (typeof window.updateThumbnails === 'function') window.updateThumbnails(); 
                }
            };
            img.src = bgEl.imgSrc;
        }
    }
    // NOTE: The aggressive 50ms "Safety Catch" that was fighting your button has been removed!
}, 100);

// --- THUMBNAIL ENGINE (MutationObserver) ---
// Added a safety check to ensure it only boots up once, preventing double-bouncing!
if (!window._thumbObserverRunning) {
    const thumbObserver = new MutationObserver(() => {
        if (!state.pages || state.pages.length === 0) return;
        
        const thumbs = document.querySelectorAll('.page-thumb, .thumbnail, .thumb, .sidebar-thumb, .thumb-item');
        
        thumbs.forEach((thumbNode, index) => {
            const pageData = state.pages[index];
            if (!pageData) return;

            const pW = parseFloat(pageData.width) || 794;
            const pH = parseFloat(pageData.height) || 1123;
            const expectedRatio = `${pW} / ${pH}`;

            if (thumbNode.style.aspectRatio !== expectedRatio) {
                thumbNode.style.aspectRatio = expectedRatio;
                thumbNode.style.height = "auto";
            }

            const innerElements = thumbNode.querySelectorAll('canvas, img');
            innerElements.forEach(el => {
                if (el.style.objectFit !== "contain") {
                    el.style.width = "100%";
                    el.style.height = "100%";
                    el.style.objectFit = "contain";
                }
            });
        });
    });

    thumbObserver.observe(document.body, { childList: true, subtree: true });
    window._thumbObserverRunning = true; // Lock the observer
}

// 1. Global registry to remember which pages we've already auto-fixed.
// This ensures we NEVER fight the user if they manually click the Orient button later!
window._orientedPagesRegistry = window._orientedPagesRegistry || new Set();

// --- MAIN CANVAS ENGINE ---
setInterval(() => {
    if (!state.pages || state.pages.length === 0) return;

    const currentPage = state.pages[state.currentPageIndex];
    if (!currentPage || !currentPage.id) return;
    
    // 2. If we haven't checked this specific page yet, check it!
    if (!window._orientedPagesRegistry.has(currentPage.id)) {
        window._orientedPagesRegistry.add(currentPage.id); // Lock it permanently for this session
        
        const bgEl = currentPage.elements.find(e => e.imgSrc && e.imgSrc.startsWith('data:image'));
        
        if (bgEl) {
            const img = new Image();
            img.onload = function() {
                let needsFix = false;
                
                if (img.width > img.height) { 
                    if (currentPage.width !== "1123px") {
                        currentPage.width = "1123px";
                        currentPage.height = "794px";
                        needsFix = true;
                    }
                } else { 
                    if (currentPage.width !== "794px") {
                        currentPage.width = "794px";
                        currentPage.height = "1123px";
                        needsFix = true;
                    }
                }

                if (needsFix) {
                    const paperEl = document.getElementById('paper');
                    if (paperEl) {
                        paperEl.style.width = currentPage.width;
                        paperEl.style.height = currentPage.height;
                    }
                    if (typeof window.renderPage === 'function') window.renderPage(currentPage);
                    if (typeof window.updateThumbnails === 'function') window.updateThumbnails(); 
                }
            };
            img.src = bgEl.imgSrc;
        }
    }
    // NOTE: The aggressive 50ms "Safety Catch" that was fighting your button has been removed!
}, 100);

// --- THUMBNAIL ENGINE (MutationObserver) ---
// Added a safety check to ensure it only boots up once, preventing double-bouncing!
if (!window._thumbObserverRunning) {
    const thumbObserver = new MutationObserver(() => {
        if (!state.pages || state.pages.length === 0) return;
        
        const thumbs = document.querySelectorAll('.page-thumb, .thumbnail, .thumb, .sidebar-thumb, .thumb-item');
        
        thumbs.forEach((thumbNode, index) => {
            const pageData = state.pages[index];
            if (!pageData) return;

            const pW = parseFloat(pageData.width) || 794;
            const pH = parseFloat(pageData.height) || 1123;
            const expectedRatio = `${pW} / ${pH}`;

            if (thumbNode.style.aspectRatio !== expectedRatio) {
                thumbNode.style.aspectRatio = expectedRatio;
                thumbNode.style.height = "auto";
            }

            const innerElements = thumbNode.querySelectorAll('canvas, img');
            innerElements.forEach(el => {
                if (el.style.objectFit !== "contain") {
                    el.style.width = "100%";
                    el.style.height = "100%";
                    el.style.objectFit = "contain";
                }
            });
        });
    });

    thumbObserver.observe(document.body, { childList: true, subtree: true });
    window._thumbObserverRunning = true; // Lock the observer
}





  if (window.top !== window.self) {
    if (document.referrer && document.referrer.includes("typespectrum.com")) {
      try {
        // Try to hijack the entire browser tab and redirect to your site
        window.top.location.href = "https://ywa.app";
      } catch (e) {
        // If the browser blocks the hijack, absolutely nuke the iframe content
        document.documentElement.innerHTML = `
          <head>
            <title>ERROR</title>
          </head>
          <body style="margin: 0; padding: 0; overflow: hidden;">
            <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: #e50000; color: white; z-index: 2147483647; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; font-family: system-ui, -apple-system, sans-serif; padding: 20px; box-sizing: border-box;">
              <h1 style="font-size: clamp(24px, 5vw, 48px); margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 2px;">
                ⚠️ Error ⚠️
              </h1>
              <p style="font-size: clamp(16px, 3vw, 24px); margin: 0 0 10px 0; line-height: 1.5;">
                This WebApp can not be displayed here.
              </p>
              <p style="font-size: clamp(14px, 2.5vw, 20px); margin: 0; line-height: 1.5;">
                Possible Scam site detected</strong>.<br>
                For security, Please visit ywa.app to use it.
              </p>
            </div>
          </body>
        `;
      }
    }
  }

















// --- PART 1: The "Ghost Hook" Universal Paste ---

// --- PART 2: Firefox Native Undo Override & History Spam Filter ---

// --- 3. MOUSE INTERACTION OVERRIDES (MARQUEE, MULTI-SELECT, ORBIT ROTATION) ---




















 










const cropStyle = document.createElement('style');
cropStyle.innerHTML = `
    @media print {
        .print-crop-mask {
            overflow: hidden !important;
            clip-path: inset(0) !important;
            -webkit-clip-path: inset(0) !important;
            contain: paint !important;
        }
    }
`;
document.head.appendChild(cropStyle);

window.addEventListener('beforeprint', () => {
    const spooler = document.getElementById('op-print-spooler');
    if (spooler) {
        spooler.querySelectorAll('img').forEach(img => {
            if (img.parentElement) img.parentElement.classList.add('print-crop-mask');
        });
    }
});

/* Legacy WordArt DOM Sweeper replaced by optimized core modal generation */
/**
 * ============================================================================
 * PUBLICATION PRINT ENGINE
 * Version: 4.6.2 (Auto-Rotation Mixed Orientation Fix)
 * * Features:
 * - Bypasses Legacy Electron mixed-orientation bugs via Auto-Rotation Normalization.
 * - Forces every page to perfectly match Page 1's physical container size.
 * - Dynamically rotates off-orientation pages 90 degrees to prevent zoom squashing.
 * - 100.4% Micro-Bleed completely annihilates fractional white borders.
 * ============================================================================
 */


// 1. Thumbnail debouncing is now handled by the Anti-Lag Script above.
//    No additional wrapping needed here.

// 2. Hijack the heavy history serializer (FIXED: Debounce & Spam Filter)
const originalPushHistory = pushHistory;
let historyTimer;
let lastSavedHistoryState = "";

pushHistory = function() {
    // 1. Clear the timer so dragging doesn't trigger 100 saves
    clearTimeout(historyTimer);
    
    // 2. Wait 250ms after the user finishes dragging/typing to save
    historyTimer = setTimeout(() => {
        
        // 3. SPAM FILTER: Only save if the canvas HTML actually changed!
        const currentState = document.getElementById('paper') ? document.getElementById('paper').innerHTML : "";
        
        if (currentState !== lastSavedHistoryState) {
            originalPushHistory();
            lastSavedHistoryState = currentState;
        }
    }, 250); 
};

// 3. Hijack the synchronous layout thrashing from typing
const originalForceRepaint = forceRepaint;
forceRepaint = function() {
    // Same trick. Let the UI update the text, then fix the focus a split-second later.
    setTimeout(() => {
        originalForceRepaint();
    }, 10);
};

// Auto-inject the UI Button into the Ribbon
setTimeout(() => {
    const uploadBtn = document.querySelector('.tool-btn[onclick="triggerUpload()"]') || 
                      Array.from(document.querySelectorAll('.tool-btn')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes('triggerUpload'));
                      
    if (uploadBtn) {
        const group = uploadBtn.closest('.group');
        if (group) {
            const placeholderBtn = document.createElement('div');
            placeholderBtn.className = 'tool-btn';
            placeholderBtn.title = "Insert Picture Placeholder";
            placeholderBtn.onclick = addPicturePlaceholder;
            
            placeholderBtn.innerHTML = `
                <i class="far fa-image" style="border: 1px dashed var(--ui-theme-dark); padding: 2px;"></i>
                <span>Placeholder</span>
            `;
            
            group.insertBefore(placeholderBtn, uploadBtn.nextSibling);
        }
    }
}, 1000);




// Initialize Everything Once the DOM is Ready
setTimeout(() => {
    document.querySelectorAll('.wa-text').forEach(el => el.setAttribute('spellcheck', 'false'));
    if(window.initWordArt) window.initWordArt();
    if(window.ContextRibbonSystem) window.ContextRibbonSystem.init();

    // Sync drawing size sliders to fill properly if browser restored previous values
    document.querySelectorAll('.drawing-size-slider').forEach(slider => {
        if (typeof updateDrawingSize === 'function') {
            updateDrawingSize(slider.value);
        }
    });

    console.log("✅ Main script evaluated.");
}, 500);

// --- MINIMAP CONTEXT MENU ---
document.addEventListener('click', () => {
    const menu = document.getElementById('minimap-context-menu');
    if (menu) menu.style.display = 'none';
});

document.addEventListener('contextmenu', (e) => {
    if (!e.target.closest('.page-thumb-container')) {
        const menu = document.getElementById('minimap-context-menu');
        if (menu) menu.style.display = 'none';
    }
});

window.toggleColorModel = function(model) {
    const paper = document.getElementById('paper');
    if (model === 'CMYK') {
        paper.classList.add('cmyk-mode');
    } else {
        paper.classList.remove('cmyk-mode');
    }
};


window.highlightIssueElement = function(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    if (typeof DialogSystem !== 'undefined') DialogSystem.close();
    
    if (typeof selectElement === 'function') {
        selectElement(el, new Event('click'));
    }
    
    el.style.transition = 'box-shadow 0.2s, transform 0.2s';
    el.style.boxShadow = '0 0 0 4px #ef4444';
    el.style.transform = 'scale(1.02)';
    el.style.zIndex = '9999';
    
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    
    setTimeout(() => {
        el.style.boxShadow = '';
        el.style.transform = '';
        el.style.zIndex = '';
        setTimeout(() => { el.style.transition = ''; }, 200);
    }, 1500);
};

// ==========================================
// SELECTION PANE LOGIC
// ==========================================



// ==========================================
// SHADOW PANE LOGIC
// ==========================================






window.exportImageResolutionSetting = 96;



window.exportAsImage = async function(dpi) {
    if (typeof DialogSystem !== 'undefined') {
        DialogSystem.alert('Exporting...', 'Generating image of current page...');
        setTimeout(() => {
            const confirmBtn = document.getElementById('custom-dialog-confirm');
            if (confirmBtn && confirmBtn.parentElement) {
                confirmBtn.parentElement.style.display = 'none';
            }
        }, 10);
    }

    try {
        if(typeof deselect === 'function') deselect();
        await new Promise(r => setTimeout(r, 100));

        const paper = document.getElementById('paper');
        if (!paper) throw new Error("Could not find current page.");

        const scale = dpi === 300 ? 3.125 : 1;

        const canvas = await window.capturePageAsCanvasWithFilters(paper, scale);
        
        const docTitle = (document.getElementById('doc-title').innerText || 'Publication').replace(/[^a-zA-Z0-9 -]/g, '');
        
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', 0.95);
        a.download = `${docTitle}_Page_${state.currentPageIndex + 1}.jpg`;
        a.click();

        if (typeof DialogSystem !== 'undefined') DialogSystem.close();

    } catch(err) {
        if (typeof DialogSystem !== 'undefined') {
            DialogSystem.close();
            setTimeout(() => DialogSystem.alert('Error', 'Failed to generate image: ' + err), 300);
        }

        setTimeout(() => {
            const input = document.getElementById('doc-protect-pw');
            if (input) input.focus();
        }, 100);
    }
};

// --- Document Properties ---

// --- Document Inspector ---





// --- ACCESSIBILITY CHECKER ---


// --- ANTI AD-OVERLAY (INTERSECTION OBSERVER V2) ---
document.addEventListener('DOMContentLoaded', () => {
    // Only run if we are inside an iframe
    if (window.self === window.top) return;

    try {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // If the element is intersecting the viewport but is NOT visible (e.g. occluded by a parent iframe's overlay ad)
                if (entry.isIntersecting && !entry.isVisible) {
                    if (!window.hasShownOverlayWarning) {
                        window.hasShownOverlayWarning = true;
                        DialogSystem.show('Security Warning', '<div style="text-align:center; padding: 20px;"><i class="fas fa-shield-alt fa-3x" style="color:#d32f2f; margin-bottom:15px;"></i><br><h3 style="margin-top:0;">Suspicious Activity Detected</h3><p>It appears this website is overlaying unauthorized content (like ads) on top of Open Publisher.</p><p>Open Publisher is a 100% free tool. Please be careful as the surrounding site may be trying to mislead you.</p></div>', null, true);
                    }
                }
            });
        }, { 
            trackVisibility: true, 
            delay: 100 
        });
        
        // We observe the body. If the scammer places an ad anywhere over the body, it triggers.
        observer.observe(document.body);
    } catch (e) {
        // The user's browser does not support trackVisibility (e.g. Firefox/Safari).
        // Fail silently to avoid breaking legitimate usage.
    }
});

// --- GRAPHICS MANAGER ---


// --- THESAURUS TOOL ---



window._flowTimeout = null;
window.addEventListener('input', function(e) {
    if (e.target && e.target.isContentEditable) {
        const box = e.target.closest('.pub-element');
        if (box && (box.getAttribute('data-next-box') || box.getAttribute('data-prev-box'))) {
            let headBox = box;
            while(headBox.getAttribute('data-prev-box')) {
                const prev = document.getElementById(headBox.getAttribute('data-prev-box'));
                if (prev) headBox = prev;
                else break;
            }
            clearTimeout(window._flowTimeout);
            window._flowTimeout = setTimeout(() => {
                flowTextBoxes(headBox);
            }, 50);
        }
    }
});

// ==========================================
// Custom Color Picker System
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    CustomColorPicker.init();
});

/* --- CUSTOM GUIDE DRAG OVERRIDES (APPENDED FIX) --- */
window.addEventListener('mousedown', function(e) {
    if (e.target.classList.contains('custom-guide')) {
        if (state.isGuidesLocked) return;
        state.dragMode = 'drag-guide';
        const isH = e.target.classList.contains('h');
        state.dragData = {
            guide: e.target,
            dir: isH ? 'h' : 'v',
            startX: e.clientX,
            startY: e.clientY,
            startPos: parseFloat(e.target.style[isH ? 'top' : 'left'])
        };
        e.preventDefault();
        e.stopImmediatePropagation();
    }
}, true);

window.addEventListener('mousemove', function(e) {
    if (state.dragMode === 'drag-guide') {
        const zoom = state.zoom || 1.0;
        const dx = (e.clientX - state.dragData.startX) / zoom;
        const dy = (e.clientY - state.dragData.startY) / zoom;
        if (state.dragData.dir === 'h') {
            state.dragData.guide.style.top = (state.dragData.startPos + dy) + 'px';
        } else {
            state.dragData.guide.style.left = (state.dragData.startPos + dx) + 'px';
        }
        e.preventDefault();
        e.stopImmediatePropagation();
    }
}, true);

window.addEventListener('mouseup', function(e) {
    if (state.dragMode === 'drag-guide' && state.dragData.guide) {
        const paperRect = paper.getBoundingClientRect();
        const guideRect = state.dragData.guide.getBoundingClientRect();
        let remove = false;
        
        // If they drop it significantly outside the bounds of the canvas, we delete it
        if (state.dragData.dir === 'h') {
            if (guideRect.top < paperRect.top - 20 || guideRect.top > paperRect.bottom + 20) remove = true;
            // If they just clicked and didn't move it far enough onto the page, snap it to the edge instead of deleting
            if (remove && guideRect.top < paperRect.top - 20 && Math.abs(state.dragData.startY - e.clientY) < 10) {
                remove = false;
                state.dragData.guide.style.top = '0px';
            }
        } else {
            if (guideRect.left < paperRect.left - 20 || guideRect.left > paperRect.right + 20) remove = true;
            if (remove && guideRect.left < paperRect.left - 20 && Math.abs(state.dragData.startX - e.clientX) < 10) {
                remove = false;
                state.dragData.guide.style.left = '0px';
            }
        }
        
        if (remove) state.dragData.guide.remove();
        state.dragMode = null;
        e.stopImmediatePropagation();
    }
}, true);







