

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
                const innerText = state.selectedEl.querySelector('div[contenteditable]') || state.selectedEl.querySelector('.text-content');
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
window.toggleLockGuides = function() {
    state.isGuidesLocked = !state.isGuidesLocked;
    if (state.isGuidesLocked) {
        document.body.classList.add('guides-locked');
    } else {
        document.body.classList.remove('guides-locked');
    }
};

window.clearAllGuides = function() {
    if (state.isGuidesLocked) {
        DialogSystem.show('Guides Locked', 'Guides are currently locked. Please unlock guides before clearing them.', null, true);
        return;
    }
    const guides = document.querySelectorAll('.custom-guide');
    if (guides.length === 0) return;
    
    // Check if we should prompt
    DialogSystem.show('Clear All Guides', 'Are you sure you want to remove all custom guides from the canvas?', function() {
        guides.forEach(g => g.remove());
        pushHistory();
    }, false, 'Clear');
};

window.createNewGuide = function(dir, e) {
    if (state.isGuidesLocked) return;
    
    const paperRect = paper.getBoundingClientRect();
    const zoom = state.zoom || 1.0;
    
    const guide = document.createElement('div');
    guide.className = `custom-guide ${dir}`;
    
    if (dir === 'h') {
        const y = (e.clientY - paperRect.top) / zoom;
        guide.style.top = y + 'px';
    } else {
        const x = (e.clientX - paperRect.left) / zoom;
        guide.style.left = x + 'px';
    }
    
    paper.appendChild(guide);
    
    // Immediately start dragging it
    state.dragMode = 'drag-guide';
    state.dragData = {
        guide: guide,
        dir: dir,
        startX: e.clientX,
        startY: e.clientY,
        startPos: parseFloat(guide.style[dir === 'h' ? 'top' : 'left'])
    };
    e.preventDefault();
};
window.showLineSpacingModal = function() {
    if (!state.selectedEl) {
        DialogSystem.alert('Notice', 'Please select a text box first.');
        return;
    }
    
    // Attempt to parse current exact spacing
    const content = state.selectedEl.querySelector('.element-content');
    let currentVal = '';
    if (content && content.style.lineHeight && content.style.lineHeight.includes('pt')) {
        currentVal = parseInt(content.style.lineHeight);
    }
    
    const html = `
        <div style="padding: 10px;">
            <p style="margin-top:0;">Set the absolute line height (Exact point size). Leave blank to revert to normal spacing.</p>
            <div style="display:flex; align-items:center; gap:10px; margin-top:15px;">
                <label>Exact Spacing (pt):</label>
                <input type="number" id="exact-line-spacing-input" class="modern-input" placeholder="e.g. 14" value="${currentVal}" style="width:100px;">
            </div>
        </div>
    `;

    DialogSystem.show('<i class="fas fa-arrows-alt-v" style="margin-right:8px;"></i>Line Spacing Options', html, () => {
        const val = document.getElementById('exact-line-spacing-input').value;
        window.applyExactLineSpacing(val ? val + 'pt' : 'normal');
    });
};

window.applyExactLineSpacing = function(val) {
    if(state.selectedEl) {
        const content = state.selectedEl.querySelector('.element-content');
        if(content) {
            content.style.lineHeight = val;
            pushHistory();
            forceRepaint();
        }

        setTimeout(() => {
            const input = document.getElementById('doc-protect-pw');
            if (input) input.focus();
        }, 100);
    }
};
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
window.showRotationModal = function() {
    if (!state.selectedEl) return;
    let currentRot = 0;
    if (state.selectedEl.style.transform && state.selectedEl.style.transform.includes('rotate')) {
        const match = state.selectedEl.style.transform.match(/rotate\(([-\d.]+)deg\)/);
        if (match) currentRot = parseFloat(match[1]);
    }
    const form = `<div class="input-group"><label>Rotation (Degrees):</label><input type="number" id="exact-rotation-input" value="${currentRot}"></div>`;
    DialogSystem.show('Exact Rotation', form, () => {
        const deg = parseFloat(document.getElementById('exact-rotation-input').value) || 0;
        let trans = state.selectedEl.style.transform || '';
        if (trans.includes('rotate')) {
            trans = trans.replace(/rotate\([-\d.]+deg\)/, `rotate(${deg}deg)`);
        } else {
            trans += ` rotate(${deg}deg)`;
        }
        state.selectedEl.style.transform = trans;
        pushHistory();
    });
};

window.toggleRotateMenu = function(btn) {
    let m = document.getElementById('rotate-dropdown');
    if (!m) {
        m = document.createElement('div');
        m.id = 'rotate-dropdown';
        m.className = 'dropdown-menu';
        m.style.cssText = 'min-width: 150px;';
        
        const createItem = (icon, text, onclick) => {
            const d = document.createElement('div');
            d.className = 'dropdown-item';
            d.innerHTML = `<i class="fas ${icon}" style="width: 26px; text-align: center;"></i> <span>${text}</span>`;
            d.onclick = () => { m.style.display = 'none'; onclick(); };
            return d;
        };

        m.appendChild(createItem('fa-redo', 'Rotate Right 90°', () => { if(window.ContextRibbonActions) ContextRibbonActions.rotateRelative(90); }));
        m.appendChild(createItem('fa-undo', 'Rotate Left 90°', () => { if(window.ContextRibbonActions) ContextRibbonActions.rotateRelative(-90); }));
        m.appendChild(createItem('fa-arrows-alt-v', 'Flip Vertical', () => { if(window.ContextRibbonActions) ContextRibbonActions.flipScale('Y'); }));
        m.appendChild(createItem('fa-arrows-alt-h', 'Flip Horizontal', () => { if(window.ContextRibbonActions) ContextRibbonActions.flipScale('X'); }));
        
        const sep = document.createElement('div');
        sep.style.cssText = 'height: 1px; background: #e2e8f0; margin: 5px 0;';
        m.appendChild(sep);
        
        m.appendChild(createItem('fa-sync-alt', 'More Rotation Options...', () => { window.showRotationModal(); }));
        
        document.body.appendChild(m);
    }
    
    const isBlock = m.style.display === 'block';
    document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
    if (!isBlock) {
        const r = btn.getBoundingClientRect();
        m.style.left = r.left + 'px'; m.style.top = (r.bottom + 5) + 'px';
        m.style.display = 'block';
    }
};


function showExportHTMLModal() {
    const html = `
        <style>
            .html-export-row {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                cursor: pointer;
                padding: 10px;
                border: 1px solid transparent;
                border-radius: 6px;
                margin-bottom: 6px;
                transition: all 0.2s;
            }
            .html-export-row:has(input:checked) {
                background-color: #e0f2f1;
                border-color: #b2dfdb;
            }
            .html-export-row:not(:has(input:checked)) {
                background-color: transparent;
                border-color: transparent;
            }
            .html-export-row:hover:not(:has(input:checked)) {
                background-color: rgba(0,0,0,0.02);
            }
            .html-export-row input[type="checkbox"] {
                appearance: none;
                -webkit-appearance: none;
                min-width: 20px;
                width: 20px;
                height: 20px;
                border: 2px solid var(--ui-theme-color);
                border-radius: 4px;
                outline: none;
                cursor: pointer;
                position: relative;
                margin-top: 2px;
                background: white;
                transition: all 0.2s;
            }
            .html-export-row input[type="checkbox"]:checked {
                background-color: var(--ui-theme-color);
            }
            .html-export-row input[type="checkbox"]:checked::after {
                content: '';
                position: absolute;
                left: 6px;
                top: 2px;
                width: 4px;
                height: 9px;
                border: solid white;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
            }
            .html-export-title {
                font-size: 16px;
                font-weight: bold;
                color: var(--ui-theme-color);
                margin-bottom: 6px;
                margin-top: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
        </style>
        <div style="margin: -20px; padding: 10px 20px 0 20px; max-height: 85vh; overflow-y: auto; overflow-x: hidden;">
            <p style="margin-bottom: 0px; font-size: 14px; color: #555;">Advanced export options for generating self-contained, highly compatible HTML files.</p>
            
            <h4 class="html-export-title"><i class="fas fa-columns" style="width: 20px; text-align: center;"></i> Layout & Compatibility</h4>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-seamless" checked>
                <div><strong style="display: block; font-size: 14px; color: #111;">Seamless Newsletter Layout</strong><span style="font-size: 12px; color: #444; display: block;">Removes gaps, shadows, and margins between pages for continuous scrolling.</span></div>
            </label>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-email">
                <div><strong style="display: block; font-size: 14px; color: #111;">Optimize for Email Clients (Image Fallback)</strong><span style="font-size: 12px; color: #444; display: block;">Renders the entire document as a single image wrapped in a legacy table structure. Perfect for Mailchimp, Gmail, and Outlook. Disables text copying.</span></div>
            </label>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-base64" checked>
                <div><strong style="display: block; font-size: 14px; color: #111;">Embed External Images (Single-File Export)</strong><span style="font-size: 12px; color: #444; display: block;">Attempts to convert external Clipart URLs into Base64 Data URIs so the HTML file works completely offline.</span></div>
            </label>

            <h4 class="html-export-title"><i class="fas fa-desktop" style="width: 20px; text-align: center;"></i> Responsiveness & Viewing Experience</h4>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-autoscale" checked>
                <div><strong style="display: block; font-size: 14px; color: #111;">Auto-Scale to Fit Screen (Mobile Friendly)</strong><span style="font-size: 12px; color: #444; display: block;">Injects a viewport meta tag and CSS scale to make the fixed-width flyer shrink to fit mobile screens.</span></div>
            </label>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-selectable" checked>
                <div><strong style="display: block; font-size: 14px; color: #111;">Enable Text Selection / Copying</strong><span style="font-size: 12px; color: #444; display: block;">Allows viewers to highlight and copy text. (Ignored if Email Optimization is checked).</span></div>
            </label>

            <h4 class="html-export-title"><i class="fas fa-tags" style="width: 20px; text-align: center;"></i> SEO & Metadata</h4>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-seo" checked>
                <div><strong style="display: block; font-size: 14px; color: #111;">Inject SEO & Social Meta Tags</strong><span style="font-size: 12px; color: #444; display: block;">Uses the Analysis Suite to extract keywords and summary text for Twitter/Facebook preview cards.</span></div>
            </label>

            <h4 class="html-export-title"><i class="fas fa-code" style="width: 20px; text-align: center;"></i> Code Output & Polish</h4>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-minify">
                <div><strong style="display: block; font-size: 14px; color: #111;">Minify Output</strong><span style="font-size: 12px; color: #444; display: block;">Strips unnecessary whitespace and line breaks to minimize file size.</span></div>
            </label>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-fonts" checked>
                <div><strong style="display: block; font-size: 14px; color: #111;">Include Web Fonts</strong><span style="font-size: 12px; color: #444; display: block;">Injects Google Fonts links to ensure typography renders accurately.</span></div>
            </label>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px; position: sticky; bottom: 0; background: white; padding: 15px 20px 20px 20px; margin-left: -20px; margin-right: -20px; border-top: 1px solid #eee; z-index: 10;">
                <button class="op-btn op-btn-cancel" onclick="DialogSystem.close()">Cancel</button>
                <button class="op-btn" style="background: var(--ui-theme-color); color: white;" onclick="
                    const opts = {
                        seamless: document.getElementById('html-opt-seamless').checked,
                        email: document.getElementById('html-opt-email').checked,
                        base64: document.getElementById('html-opt-base64').checked,
                        autoscale: document.getElementById('html-opt-autoscale').checked,
                        selectable: document.getElementById('html-opt-selectable').checked,
                        seo: document.getElementById('html-opt-seo').checked,
                        minify: document.getElementById('html-opt-minify').checked,
                        fonts: document.getElementById('html-opt-fonts').checked
                    };
                    DialogSystem.close();
                    if(typeof exportAsHTML === 'function') exportAsHTML(opts);
                ">
                    <i class="fas fa-file-code" style="margin-right: 8px;"></i> Generate HTML File
                </button>
            </div>
        </div>
    `;
    
    if (typeof DialogSystem !== 'undefined') {
        DialogSystem.show('Advanced HTML Export', html, null, true);
        setTimeout(() => {
            const confirmBtn = document.getElementById('custom-dialog-confirm');
            if (confirmBtn && confirmBtn.parentElement) {
                confirmBtn.parentElement.style.display = 'none';
            }
        }, 10);
    }
}


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
function handleMouseDown(e) {
    if(e.target === paper || e.target.classList.contains('margin-guides') || e.target.id === 'viewport' || e.target.classList.contains('viewport')) {
        deselect();
        state.dragMode = 'marquee';
        state.dragData = { startX: e.clientX, startY: e.clientY };
        
        if(!document.getElementById('marquee-box')) {
            const box = document.createElement('div');
            box.id = 'marquee-box';
            box.style.position = 'fixed';
            box.style.border = '1px solid rgba(0, 118, 112, 0.8)';
            box.style.background = 'rgba(0, 118, 112, 0.2)';
            box.style.zIndex = '9999';
            box.style.pointerEvents = 'none';
            document.body.appendChild(box);
        }
        return;
    }

    if(state.cropMode && state.selectedEl) {
        if(e.target.classList.contains('resize-handle')) {
            state.dragMode = 'resize'; 
            state.dragData = {
                dir: e.target.dataset.dir, startX: e.clientX, startY: e.clientY,
                w: parseFloat(state.selectedEl.style.width), h: parseFloat(state.selectedEl.style.height),
                l: parseFloat(state.selectedEl.style.left), t: parseFloat(state.selectedEl.style.top)
            };
            e.preventDefault(); return;
        }
        const targetImg = e.target.tagName === 'IMG' ? e.target : e.target.querySelector('img');
        if(targetImg && e.target.closest('.pub-element') === state.selectedEl && !e.target.classList.contains('resize-handle')) {
            state.dragMode = 'pan-image';
            state.dragData = { startX: e.clientX, startY: e.clientY, l: parseFloat(targetImg.style.left) || 0, t: parseFloat(targetImg.style.top) || 0 };
            e.preventDefault(); return;
        }
        if(!e.target.closest('.pub-element.cropping')) toggleCrop();
    }

    if(state.shapeEditMode && state.selectedEl) {
        if(e.target.classList.contains('shape-edit-handle')) {
            state.dragMode = 'shape-point';
            const handle = e.target;
            const index = parseInt(handle.dataset.index);
            state.dragData = {
                index: index,
                startX: e.clientX, startY: e.clientY,
                startPtX: window._shapeEditContext.points[index].x,
                startPtY: window._shapeEditContext.points[index].y,
                rect: state.selectedEl.getBoundingClientRect()
            };
            e.preventDefault(); return;
        }
    }

    if(e.target.classList.contains('rotate-handle') || e.target.classList.contains('resize-handle')) {
        if(e.target.classList.contains('rotate-handle')) {
            state.dragMode = 'rotate';
            const rect = state.selectedEl.getBoundingClientRect();
            state.dragData = { cx: rect.left + rect.width/2, cy: rect.top + rect.height/2 };
        } else {
            state.dragMode = 'resize';
            const curSX = parseFloat(state.selectedEl.getAttribute('data-scaleX')) || 1;
            const curSY = parseFloat(state.selectedEl.getAttribute('data-scaleY')) || 1;
            state.dragData = {
                dir: e.target.dataset.dir, startX: e.clientX, startY: e.clientY,
                w: parseFloat(state.selectedEl.style.width), h: parseFloat(state.selectedEl.style.height),
                l: parseFloat(state.selectedEl.style.left), t: parseFloat(state.selectedEl.style.top),
                scaleX: curSX, scaleY: curSY
            };
        }
        e.preventDefault(); return;
    }

    const el = e.target.closest('.pub-element');
    if(el) {
        const isMulti = state.multiSelected && state.multiSelected.includes(el);
        if (!isMulti) {
            const isSelected = (state.selectedEl === el);
            if(!isSelected) selectElement(el);
            if(state.multiSelected && state.multiSelected.length > 0) {
                state.multiSelected.forEach(m => m.classList.remove('selected'));
                state.multiSelected = [];
            }
        }
        
        const isClipart = el.querySelector('svg');
        const isImage = el.querySelector('img');
        const isShape = el.getAttribute('data-type') === 'shape';
        
        if(isClipart || isImage || isShape) {
             state.dragMode = 'drag';
             state.dragData = { startX: e.clientX, startY: e.clientY, l: parseFloat(el.style.left), t: parseFloat(el.style.top) };
             if(isMulti) state.dragData.multi = state.multiSelected.map(m => ({ el: m, l: parseFloat(m.style.left), t: parseFloat(m.style.top) }));
             e.preventDefault(); return;
        }

        const rect = el.getBoundingClientRect();
        const edgeSize = 15; 
        const nearEdge = (e.clientX < rect.left + edgeSize) || (e.clientX > rect.right - edgeSize) || 
                         (e.clientY < rect.top + edgeSize) || (e.clientY > rect.bottom - edgeSize);
        const activeEl = document.activeElement;
        const isEditingText = activeEl && el.contains(activeEl) && (activeEl.isContentEditable);
        
        if (nearEdge || !isEditingText) {
            state.dragMode = 'drag';
            state.dragData = { startX: e.clientX, startY: e.clientY, l: parseFloat(el.style.left), t: parseFloat(el.style.top) };
            if(isMulti) state.dragData.multi = state.multiSelected.map(m => ({ el: m, l: parseFloat(m.style.left), t: parseFloat(m.style.top) }));
            if(!isEditingText) e.preventDefault(); 
        }
    }
}

// 3. Override Mouse Move (with Page Clamping)
function handleMouseMove(e) {
    const coordDisplay = document.getElementById('coord-display');
    if(coordDisplay) coordDisplay.innerText = `X: ${e.clientX} | Y: ${e.clientY}`;
    
    if(!state.dragMode && !state.cropMode) {
        const el = e.target.closest('.pub-element');
        if(el) {
            const isShape = el.querySelector('img') || el.querySelector('svg') || el.getAttribute('data-type') === 'shape';
            const rect = el.getBoundingClientRect();
            if (isShape) { el.style.cursor = 'move'; } 
            else {
                const edgeSize = 15;
                const nearEdge = (e.clientX < rect.left + edgeSize) || (e.clientX > rect.right - edgeSize) || (e.clientY < rect.top + edgeSize) || (e.clientY > rect.bottom - edgeSize);
                el.style.cursor = nearEdge ? 'move' : 'text';
            }
        }
    }

    if(!state.dragMode) return;
    
    if(state.dragMode === 'marquee') {
        const box = document.getElementById('marquee-box');
        if(box) {
            // CLAMP TO PAPER EDGES
            const paperRect = paper.getBoundingClientRect();
            const clampedX = Math.max(paperRect.left, Math.min(e.clientX, paperRect.right));
            const clampedY = Math.max(paperRect.top, Math.min(e.clientY, paperRect.bottom));
            const startX = Math.max(paperRect.left, Math.min(state.dragData.startX, paperRect.right));
            const startY = Math.max(paperRect.top, Math.min(state.dragData.startY, paperRect.bottom));

            const x = Math.min(clampedX, startX);
            const y = Math.min(clampedY, startY);
            const w = Math.abs(clampedX - startX);
            const h = Math.abs(clampedY - startY);
            
            box.style.left = x + 'px'; box.style.top = y + 'px'; box.style.width = w + 'px'; box.style.height = h + 'px';
        }
        return;
    }

    if(!state.selectedEl && (!state.multiSelected || state.multiSelected.length === 0)) return;

    const zoom = state.zoom;
    
    if(state.dragMode === 'drag') {
        const dx = (e.clientX - state.dragData.startX) / zoom;
        const dy = (e.clientY - state.dragData.startY) / zoom;
        


        if(state.dragData.multi && state.dragData.multi.length > 0) {
            state.dragData.multi.forEach(item => { 
                const s = applySnapping(item.l + dx, item.t + dy, item.el.offsetWidth, item.el.offsetHeight, item.el);
                item.el.style.left = s.x + 'px'; item.el.style.top = s.y + 'px'; 
            });
        } else {
            const s = applySnapping(state.dragData.l + dx, state.dragData.t + dy, state.selectedEl.offsetWidth, state.selectedEl.offsetHeight, state.selectedEl);
            state.selectedEl.style.left = s.x + 'px';
            state.selectedEl.style.top = s.y + 'px';
        }
        { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
    }
    else if(state.dragMode === 'shape-point') {
        const dx = (e.clientX - state.dragData.startX) / zoom;
        const dy = (e.clientY - state.dragData.startY) / zoom;
        const el = state.selectedEl;
        
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        
        const ptIndex = state.dragData.index;
        const pt = window._shapeEditContext.points[ptIndex];
        
        if (window._shapeEditContext.type === 'clip-path') {
            const pX = (dx / w) * 100;
            const pY = (dy / h) * 100;
            pt.x = Math.max(0, Math.min(100, state.dragData.startPtX + pX));
            pt.y = Math.max(0, Math.min(100, state.dragData.startPtY + pY));
            
            const newPoints = window._shapeEditContext.points.map(p => `${p.x}% ${p.y}%`).join(', ');
            window._shapeEditContext.contentDiv.style.clipPath = `polygon(${newPoints})`;
        } else if (window._shapeEditContext.type === 'svg-polygon') {
            const pX = (dx / w) * 100;
            const pY = (dy / h) * 100;
            pt.x = state.dragData.startPtX + pX;
            pt.y = state.dragData.startPtY + pY;
            
            const newPoints = window._shapeEditContext.points.map(p => `${p.x},${p.y}`).join(' ');
            window._shapeEditContext.svgPolygon.setAttribute('points', newPoints);
        }
        
        const handle = document.querySelector(`.shape-edit-handle[data-index="${ptIndex}"]`);
        if (handle) {
            handle.style.left = pt.x + '%';
            handle.style.top = pt.y + '%';
        }
    }
    else if(state.dragMode === 'pan-image') {
        const dx = (e.clientX - state.dragData.startX) / zoom; const dy = (e.clientY - state.dragData.startY) / zoom;
        const img = state.selectedEl.querySelector('img');
        img.style.left = (state.dragData.l + dx) + 'px'; img.style.top = (state.dragData.t + dy) + 'px';
    }
    else if(state.dragMode === 'rotate') {
        const angle = Math.atan2(e.clientY - state.dragData.cy, e.clientX - state.dragData.cx) * (180/Math.PI);
        state.selectedEl.style.transform = `rotate(${angle + 90}deg)`;
    }
    else if(state.dragMode === 'resize') {
        const dx = (e.clientX - state.dragData.startX) / zoom; const dy = (e.clientY - state.dragData.startY) / zoom;
        const d = state.dragData;
        let rawW = d.w, rawH = d.h, newL = d.l, newT = d.t;
        const isCrop = state.cropMode;
        let imgDx = 0, imgDy = 0;

        if (d.dir.includes('e')) rawW = d.w + dx;
        else if (d.dir.includes('w')) { rawW = d.w - dx; newL = d.l + dx; if(isCrop) imgDx = -dx; }
        
        if (d.dir.includes('s')) rawH = d.h + dy;
        else if (d.dir.includes('n')) { rawH = d.h - dy; newT = d.t + dy; if(isCrop) imgDy = -dy; }

        if (isCrop) {
            const img = state.selectedEl.querySelector('img');
            if (imgDx !== 0) img.style.left = ((parseFloat(img.style.left) || 0) + imgDx) + 'px';
            if (imgDy !== 0) img.style.top = ((parseFloat(img.style.top) || 0) + imgDy) + 'px';
            if(rawW > 10) { state.selectedEl.style.width = rawW + 'px'; state.selectedEl.style.left = newL + 'px'; }
            if(rawH > 10) { state.selectedEl.style.height = rawH + 'px'; state.selectedEl.style.top = newT + 'px'; }
        } else {
            let finalScaleX = d.scaleX, finalScaleY = d.scaleY;
            if (rawW < 0) { rawW = Math.abs(rawW); if (d.dir.includes('e')) newL = d.l - rawW; finalScaleX = -1 * d.scaleX; } 
            if (rawH < 0) { rawH = Math.abs(rawH); if (d.dir.includes('s')) newT = d.t - rawH; finalScaleY = -1 * d.scaleY; }
            state.selectedEl.style.width = rawW + 'px'; state.selectedEl.style.height = rawH + 'px';
            state.selectedEl.style.left = newL + 'px'; state.selectedEl.style.top = newT + 'px';
            
            const content = state.selectedEl.querySelector('.element-content');
            content.style.transform = `scale(${finalScaleX}, ${finalScaleY})`;
            state.selectedEl.setAttribute('data-scaleX', finalScaleX); state.selectedEl.setAttribute('data-scaleY', finalScaleY);
            
            if(typeof syncWordArt === 'function' && state.selectedEl.querySelector('.wa-text')) syncWordArt(state.selectedEl);
        }
        { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
    } else if (state.dragMode === 'shape-point') {
        const dx = (e.clientX - state.dragData.startX) / zoom;
        const dy = (e.clientY - state.dragData.startY) / zoom;
        
        const w = state.dragData.rect.width / zoom;
        const h = state.dragData.rect.height / zoom;
        
        const percentDx = (dx / w) * 100;
        const percentDy = (dy / h) * 100;

        let pt = window._shapeEditContext.points[state.dragData.index];
        pt.x = state.dragData.startPtX + percentDx;
        pt.y = state.dragData.startPtY + percentDy;

        if (window._shapeEditContext.type === 'clip-path') {
            const polygonStr = window._shapeEditContext.points.map(p => `${p.x}% ${p.y}%`).join(', ');
            window._shapeEditContext.contentDiv.style.clipPath = `polygon(${polygonStr})`;
        } else if (window._shapeEditContext.type === 'svg-polygon') {
            const polygonStr = window._shapeEditContext.points.map(p => `${p.x},${p.y}`).join(' ');
            window._shapeEditContext.svgPolygon.setAttribute('points', polygonStr);
        }

        window.renderShapeEditHandles();
        return;
    }
}

// 4. Override Mouse Up
function handleMouseUp() {
    if(state.dragMode === 'marquee') {
        const box = document.getElementById('marquee-box');
        if(box) {
            const rect = box.getBoundingClientRect();
            box.remove();
            
            state.multiSelected = [];
            paper.querySelectorAll('.pub-element').forEach(el => {
                if (el.classList.contains('ignore-selection') || el.style.pointerEvents === 'none') return;
                const elRect = el.getBoundingClientRect();
                if (!(rect.right < elRect.left || rect.left > elRect.right || rect.bottom < elRect.top || rect.top > elRect.bottom)) {
                    state.multiSelected.push(el); el.classList.add('selected');
                }
            });
            
            if(state.multiSelected.length === 1) { selectElement(state.multiSelected[0]); state.multiSelected = []; } 
            else if(state.multiSelected.length > 1) {
                document.getElementById('status-msg').innerText = state.multiSelected.length + " Elements Selected";
                { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
            }
        }
    } else if(state.dragMode) {
        setTimeout(() => updateThumbnails(), 50); pushHistory(); 
        if(state.selectedEl && (!state.multiSelected || state.multiSelected.length === 0)) showFloatToolbar();
    }
    state.dragMode = null;
}

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
window.handleMouseDown = function(e) {
    if(e.target === paper || e.target.classList.contains('margin-guides') || e.target.id === 'viewport' || e.target.classList.contains('viewport')) {
        if(typeof window.deselect === 'function') window.deselect();
        state.dragMode = 'marquee';
        state.dragData = { startX: e.clientX, startY: e.clientY };
        if(!document.getElementById('marquee-box')) {
            const box = document.createElement('div');
            box.id = 'marquee-box';
            box.style.cssText = 'position:fixed; border:1px solid rgba(0,118,112,0.8); background:rgba(0,118,112,0.2); z-index:9999; pointer-events:none;';
            document.body.appendChild(box);
        }
        return;
    }

    if(state.cropMode && state.selectedEl) {
        if(e.target.classList.contains('resize-handle')) {
            state.dragMode = 'resize';
            state.dragData = {
                dir: e.target.dataset.dir, startX: e.clientX, startY: e.clientY,
                w: parseFloat(state.selectedEl.style.width), h: parseFloat(state.selectedEl.style.height),
                l: parseFloat(state.selectedEl.style.left), t: parseFloat(state.selectedEl.style.top)
            };
            e.preventDefault();
            return;
        }
        if(e.target.tagName === 'IMG' && e.target.closest('.pub-element') === state.selectedEl) {
            state.dragMode = 'pan-image';
            state.dragData = { startX: e.clientX, startY: e.clientY, l: parseFloat(e.target.style.left) || 0, t: parseFloat(e.target.style.top) || 0 };
            e.preventDefault();
            return;
        }
        if(!e.target.closest('.pub-element.cropping')) if(typeof toggleCrop === 'function') toggleCrop();
    }

    if(e.target.classList.contains('rotate-handle') || e.target.classList.contains('resize-handle')) {
        if(e.target.classList.contains('rotate-handle')) {
            state.dragMode = 'rotate';
            
            // --- NATIVE GROUP ROTATION ENGINE ---
            if (state.multiSelected && state.multiSelected.length > 1) {
                let minL = Infinity, maxR = -Infinity, minT = Infinity, maxB = -Infinity;
                let minSx = Infinity, maxSx = -Infinity, minSy = Infinity, maxSy = -Infinity;
                
                state.multiSelected.forEach(el => {
                    const l = parseFloat(el.style.left) || el.offsetLeft;
                    const t = parseFloat(el.style.top) || el.offsetTop;
                    const w = el.offsetWidth, h = el.offsetHeight;
                    if(l < minL) minL = l; if(l + w > maxR) maxR = l + w;
                    if(t < minT) minT = t; if(t + h > maxB) maxB = t + h;
                    
                    const r = el.getBoundingClientRect();
                    if(r.left < minSx) minSx = r.left; if(r.right > maxSx) maxSx = r.right;
                    if(r.top < minSy) minSy = r.top; if(r.bottom > maxSy) maxSy = r.bottom;
                });
                
                const cx = minL + (maxR - minL) / 2;
                const cy = minT + (maxB - minT) / 2;
                const screenCx = minSx + (maxSx - minSx) / 2;
                const screenCy = minSy + (maxSy - minSy) / 2;
                const hr = e.target.getBoundingClientRect();
                
                state.dragData = { 
                    cx: cx, cy: cy, screenCx: screenCx, screenCy: screenCy,
                    startAngle: Math.atan2(hr.top + hr.height/2 - screenCy, hr.left + hr.width/2 - screenCx),
                    items: state.multiSelected.map(el => {
                        const style = window.getComputedStyle(el);
                        const rot = style.transform !== 'none' ? Math.atan2(style.transform.split('(')[1].split(')')[0].split(',')[1], style.transform.split('(')[1].split(')')[0].split(',')[0]) * (180/Math.PI) : 0;
                        const itemCx = (parseFloat(el.style.left) || el.offsetLeft) + el.offsetWidth/2;
                        const itemCy = (parseFloat(el.style.top) || el.offsetTop) + el.offsetHeight/2;
                        return { el: el, w: el.offsetWidth, h: el.offsetHeight, dx: itemCx - cx, dy: itemCy - cy, origRot: rot };
                    })
                };
            } else if (state.selectedEl) {
                const rect = state.selectedEl.getBoundingClientRect();
                state.dragData = { cx: rect.left + rect.width/2, cy: rect.top + rect.height/2 };
            }
        } else {
            state.dragMode = 'resize';
            state.dragData = {
                dir: e.target.dataset.dir, startX: e.clientX, startY: e.clientY,
                w: parseFloat(state.selectedEl.style.width), h: parseFloat(state.selectedEl.style.height),
                l: parseFloat(state.selectedEl.style.left), t: parseFloat(state.selectedEl.style.top),
                scaleX: parseFloat(state.selectedEl.getAttribute('data-scaleX')) || 1,
                scaleY: parseFloat(state.selectedEl.getAttribute('data-scaleY')) || 1
            };
            const img = state.selectedEl.querySelector('img');
            if(img && state.cropMode) {
                 state.dragData.imgW = parseFloat(img.style.width) || img.offsetWidth;
                 state.dragData.imgH = parseFloat(img.style.height) || img.offsetHeight;
                 state.dragData.imgL = parseFloat(img.style.left) || 0;
                 state.dragData.imgT = parseFloat(img.style.top) || 0;
            }
        }
        e.preventDefault();
        return;
    }

    const el = e.target.closest('.pub-element');
    if(el) {
        // --- FIXED: NATIVE CTRL+CLICK MULTI-SELECT ---
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            e.stopImmediatePropagation(); // Stop native clicks from breaking the array
            
            state.multiSelected = state.multiSelected || [];
            
            // 1. Safely migrate the first item without deleting its highlight class!
            if (state.selectedEl && state.multiSelected.length === 0) {
                state.multiSelected.push(state.selectedEl);
                state.selectedEl = null; // Clear the single-item memory, but LEAVE the class!
            }
            
            // 2. Toggle the item you just clicked
            if (state.multiSelected.includes(el)) {
                state.multiSelected = state.multiSelected.filter(m => m !== el);
                el.classList.remove('selected');
            } else {
                state.multiSelected.push(el);
                el.classList.add('selected');
            }
            
            // 3. Resolve the app UI
            if (state.multiSelected.length === 0) {
                 if(typeof window.deselect === 'function') window.deselect();
            } else if (state.multiSelected.length === 1) {
                 if(typeof window.selectElement === 'function') window.selectElement(state.multiSelected[0]);
                 state.multiSelected = [];
            } else {
                 if(document.getElementById('status-msg')) document.getElementById('status-msg').innerText = state.multiSelected.length + " Elements Selected";
                 if(typeof floatToolbar !== 'undefined' && floatToolbar) { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
                 // Fire app render loops to draw the bounding box
                 if(typeof forceRepaint === 'function') forceRepaint();
                 if(typeof drawSelectionUI === 'function') drawSelectionUI();
            }
            return;
        }

        // Standard Single Click
        const isMulti = state.multiSelected && state.multiSelected.includes(el);
        if (!isMulti) {
            if(state.selectedEl !== el && typeof window.selectElement === 'function') window.selectElement(el);
            if(state.multiSelected && state.multiSelected.length > 0) {
                state.multiSelected.forEach(m => m.classList.remove('selected'));
                state.multiSelected = [];
            }
        }

        if(el.querySelector('svg') || el.querySelector('img') || el.getAttribute('data-type') === 'shape') {
            state.dragMode = 'drag';
            state.dragData = { startX: e.clientX, startY: e.clientY, l: parseFloat(el.style.left), t: parseFloat(el.style.top) };
            if(isMulti) state.dragData.multi = state.multiSelected.map(m => ({ el: m, l: parseFloat(m.style.left), t: parseFloat(m.style.top) }));
            e.preventDefault();
            return;
        }

        const rect = el.getBoundingClientRect(), edgeSize = 15;
        const nearEdge = (e.clientX < rect.left + edgeSize) || (e.clientX > rect.right - edgeSize) || (e.clientY < rect.top + edgeSize) || (e.clientY > rect.bottom - edgeSize);
        const activeEl = document.activeElement, isEditingText = activeEl && el.contains(activeEl) && (activeEl.isContentEditable);
        if (nearEdge || !isEditingText) {
            state.dragMode = 'drag';
            state.dragData = { startX: e.clientX, startY: e.clientY, l: parseFloat(el.style.left), t: parseFloat(el.style.top) };
            if(isMulti) state.dragData.multi = state.multiSelected.map(m => ({ el: m, l: parseFloat(m.style.left), t: parseFloat(m.style.top) }));
            if(!isEditingText) e.preventDefault();
        }

        setTimeout(() => {
            const input = document.getElementById('doc-protect-pw');
            if (input) input.focus();
        }, 100);
    }
};

window.handleMouseMove = function(e) {
    // --- PERFORMANCE FIX: Debounce coordinate updates to stop DOM thrashing ---
    if (!window.coordUpdatePending) {
        window.coordUpdatePending = requestAnimationFrame(() => {
            const cd = document.getElementById('coord-display'); 
            if(cd) cd.innerText = `X: ${e.clientX} | Y: ${e.clientY}`;
            window.coordUpdatePending = null;
        });
    }
    
    if(!state.dragMode && !state.cropMode) {
        const el = e.target.closest('.pub-element');
        if(el) {
            const isShape = el.querySelector('img') || el.querySelector('svg') || el.getAttribute('data-type') === 'shape', rect = el.getBoundingClientRect();
            if (isShape) { el.style.cursor = 'move'; } else { const edgeSize = 15; el.style.cursor = ((e.clientX < rect.left + edgeSize) || (e.clientX > rect.right - edgeSize) || (e.clientY < rect.top + edgeSize) || (e.clientY > rect.bottom - edgeSize)) ? 'move' : 'text'; }
        }
    }
    if(!state.dragMode) return;
    if(state.dragMode === 'marquee') {
        const box = document.getElementById('marquee-box');
        if(box) {
            const paperRect = paper.getBoundingClientRect();
            const clampedX = Math.max(paperRect.left, Math.min(e.clientX, paperRect.right)), clampedY = Math.max(paperRect.top, Math.min(e.clientY, paperRect.bottom));
            const startX = Math.max(paperRect.left, Math.min(state.dragData.startX, paperRect.right)), startY = Math.max(paperRect.top, Math.min(state.dragData.startY, paperRect.bottom));
            box.style.left = Math.min(clampedX, startX) + 'px'; box.style.top = Math.min(clampedY, startY) + 'px';
            box.style.width = Math.abs(clampedX - startX) + 'px'; box.style.height = Math.abs(clampedY - startY) + 'px';
        }
        return;
    }
    if(!state.selectedEl && (!state.multiSelected || state.multiSelected.length === 0)) return;
    const zoom = state.zoom, dx = (e.clientX - state.dragData.startX) / zoom, dy = (e.clientY - state.dragData.startY) / zoom;
    
    if(state.dragMode === 'drag') {
        if(state.dragData.multi && state.dragData.multi.length > 0) { state.dragData.multi.forEach(item => { item.el.style.left = (item.l + dx) + 'px'; item.el.style.top = (item.t + dy) + 'px'; }); } 
        else { state.selectedEl.style.left = (state.dragData.l + dx) + 'px'; state.selectedEl.style.top = (state.dragData.t + dy) + 'px'; }
        if(typeof floatToolbar !== 'undefined') { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
    }
    else if(state.dragMode === 'pan-image') {
        const img = state.selectedEl.querySelector('img'); img.style.left = (state.dragData.l + dx) + 'px'; img.style.top = (state.dragData.t + dy) + 'px';
    }
    else if(state.dragMode === 'rotate') {
        state.selectedEl.style.transform = `rotate(${(Math.atan2(e.clientY - state.dragData.cy, e.clientX - state.dragData.cx) * (180/Math.PI)) + 90}deg)`;
    }
    else if(state.dragMode === 'resize') {
        const d = state.dragData; let rawW = d.w, rawH = d.h, newL = d.l, newT = d.t;
        let imgDx = 0, imgDy = 0;
        if (d.dir.includes('e')) rawW = d.w + dx; else if (d.dir.includes('w')) { rawW = d.w - dx; newL = d.l + dx; if(state.cropMode) imgDx = -dx; }
        if (d.dir.includes('s')) rawH = d.h + dy; else if (d.dir.includes('n')) { rawH = d.h - dy; newT = d.t + dy; if(state.cropMode) imgDy = -dy; }

        if (state.cropMode) {
            const img = state.selectedEl.querySelector('img');
            if (imgDx !== 0) img.style.left = ((parseFloat(img.style.left) || 0) + imgDx) + 'px';
            if (imgDy !== 0) img.style.top = ((parseFloat(img.style.top) || 0) + imgDy) + 'px';
            if(rawW > 10) { state.selectedEl.style.width = rawW + 'px'; state.selectedEl.style.left = newL + 'px'; }
            if(rawH > 10) { state.selectedEl.style.height = rawH + 'px'; state.selectedEl.style.top = newT + 'px'; }
        } else {
            let finalScaleX = d.scaleX, finalScaleY = d.scaleY;
            if (rawW < 0) { rawW = Math.abs(rawW); if (d.dir.includes('e')) newL = d.l - rawW; finalScaleX = -1 * d.scaleX; } 
            if (rawH < 0) { rawH = Math.abs(rawH); if (d.dir.includes('s')) newT = d.t - rawH; finalScaleY = -1 * d.scaleY; }
            if(rawW > 10) { state.selectedEl.style.width = rawW + 'px'; state.selectedEl.style.left = newL + 'px'; }
            if(rawH > 10) { state.selectedEl.style.height = rawH + 'px'; state.selectedEl.style.top = newT + 'px'; }

            const img = state.selectedEl.querySelector('img');
            if (img && d.imgW !== undefined) {
                const ratioX = rawW / Math.abs(d.w), ratioY = rawH / Math.abs(d.h);
                img.style.width = (d.imgW * ratioX) + 'px'; img.style.height = (d.imgH * ratioY) + 'px';
                img.style.left = (d.imgL * ratioX) + 'px'; img.style.top = (d.imgT * ratioY) + 'px';
            }
            const _contentEl = state.selectedEl.querySelector('.element-content');
            let _t3d = '';
            if (_contentEl) {
                const rx = _contentEl.getAttribute('data-3d-rx') || 0;
                const ry = _contentEl.getAttribute('data-3d-ry') || 0;
                const rz = _contentEl.getAttribute('data-3d-rz') || 0;
                const p = _contentEl.getAttribute('data-3d-p') || 800;
                if (rx != 0 || ry != 0 || rz != 0) _t3d = ` perspective(${p}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
                _contentEl.style.transform = `scale(${finalScaleX}, ${finalScaleY})${_t3d}`;
            }
            state.selectedEl.setAttribute('data-scaleX', finalScaleX); state.selectedEl.setAttribute('data-scaleY', finalScaleY);
            if(typeof syncWordArt === 'function' && state.selectedEl.querySelector('.wa-text')) syncWordArt(state.selectedEl);
        }
        if(typeof floatToolbar !== 'undefined') { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
    }
};

window.handleMouseUp = function() {
    if(state.dragMode === 'marquee') {
        const box = document.getElementById('marquee-box');
        if(box) {
            const rect = box.getBoundingClientRect(); box.remove(); state.multiSelected = [];
            paper.querySelectorAll('.pub-element').forEach(el => {
                const elRect = el.getBoundingClientRect();
                if (!(rect.right < elRect.left || rect.left > elRect.right || rect.bottom < elRect.top || rect.top > elRect.bottom)) { state.multiSelected.push(el); el.classList.add('selected'); }
            });
            if(state.multiSelected.length === 1) { window.selectElement(state.multiSelected[0]); state.multiSelected = []; } 
            else if(state.multiSelected.length > 1) { document.getElementById('status-msg').innerText = state.multiSelected.length + " Elements Selected"; if(typeof floatToolbar !== 'undefined') { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; } }
        }
    } else if(state.dragMode) {
        setTimeout(() => { if(typeof updateThumbnails === 'function') updateThumbnails(); }, 50); if(typeof pushHistory === 'function') pushHistory(); 
        if(state.selectedEl && (!state.multiSelected || state.multiSelected.length === 0) && typeof showFloatToolbar === 'function') showFloatToolbar();
    }
    state.dragMode = null;
};























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
window.handleMouseDown = function(e) {
    if(e.target === paper || e.target.classList.contains('margin-guides') || e.target.id === 'viewport' || e.target.classList.contains('viewport')) {
        window.deselect();
        state.dragMode = 'marquee';
        state.dragData = { startX: e.clientX, startY: e.clientY };
        if(!document.getElementById('marquee-box')) {
            const box = document.createElement('div');
            box.id = 'marquee-box';
            box.style.cssText = 'position:fixed; border:1px solid rgba(0,118,112,0.8); background:rgba(0,118,112,0.2); z-index:9999; pointer-events:none;';
            document.body.appendChild(box);
        }
        return;
    }

    if(state.cropMode && state.selectedEl) {
        if(e.target.classList.contains('resize-handle')) {
            state.dragMode = 'resize';
            state.dragData = {
                dir: e.target.dataset.dir, startX: e.clientX, startY: e.clientY,
                w: parseFloat(state.selectedEl.style.width), h: parseFloat(state.selectedEl.style.height),
                l: parseFloat(state.selectedEl.style.left), t: parseFloat(state.selectedEl.style.top)
            };
            e.preventDefault();
            return;
        }
        if(e.target.tagName === 'IMG' && e.target.closest('.pub-element') === state.selectedEl) {
            state.dragMode = 'pan-image';
            state.dragData = { startX: e.clientX, startY: e.clientY, l: parseFloat(e.target.style.left) || 0, t: parseFloat(e.target.style.top) || 0 };
            e.preventDefault();
            return;
        }
        if(!e.target.closest('.pub-element.cropping')) if(typeof toggleCrop === 'function') toggleCrop();
    }

    if(e.target.classList.contains('rotate-handle') || e.target.classList.contains('resize-handle')) {
        if(e.target.classList.contains('rotate-handle')) {
            state.dragMode = 'rotate';
            
            // --- NATIVE GROUP ROTATION ENGINE ---
            if (state.multiSelected && state.multiSelected.length > 1) {
                let minL = Infinity, maxR = -Infinity, minT = Infinity, maxB = -Infinity;
                let minSx = Infinity, maxSx = -Infinity, minSy = Infinity, maxSy = -Infinity;
                
                state.multiSelected.forEach(el => {
                    // Collect inner paper coordinates (for flawless movement)
                    const l = parseFloat(el.style.left) || el.offsetLeft;
                    const t = parseFloat(el.style.top) || el.offsetTop;
                    const w = el.offsetWidth, h = el.offsetHeight;
                    if(l < minL) minL = l; if(l + w > maxR) maxR = l + w;
                    if(t < minT) minT = t; if(t + h > maxB) maxB = t + h;
                    
                    // Collect outer screen coordinates (for flawless mouse angle tracking)
                    const r = el.getBoundingClientRect();
                    if(r.left < minSx) minSx = r.left; if(r.right > maxSx) maxSx = r.right;
                    if(r.top < minSy) minSy = r.top; if(r.bottom > maxSy) maxSy = r.bottom;
                });
                
                const cx = minL + (maxR - minL) / 2;
                const cy = minT + (maxB - minT) / 2;
                const screenCx = minSx + (maxSx - minSx) / 2;
                const screenCy = minSy + (maxSy - minSy) / 2;
                const hr = e.target.getBoundingClientRect();
                
                state.dragData = { 
                    cx: cx, cy: cy, screenCx: screenCx, screenCy: screenCy,
                    startAngle: Math.atan2(hr.top + hr.height/2 - screenCy, hr.left + hr.width/2 - screenCx),
                    items: state.multiSelected.map(el => {
                        const style = window.getComputedStyle(el);
                        const rot = style.transform !== 'none' ? Math.atan2(style.transform.split('(')[1].split(')')[0].split(',')[1], style.transform.split('(')[1].split(')')[0].split(',')[0]) * (180/Math.PI) : 0;
                        const itemCx = (parseFloat(el.style.left) || el.offsetLeft) + el.offsetWidth/2;
                        const itemCy = (parseFloat(el.style.top) || el.offsetTop) + el.offsetHeight/2;
                        return { el: el, w: el.offsetWidth, h: el.offsetHeight, dx: itemCx - cx, dy: itemCy - cy, origRot: rot };
                    })
                };
            } else {
                // SINGLE ROTATION
                const rect = state.selectedEl.getBoundingClientRect();
                state.dragData = { cx: rect.left + rect.width/2, cy: rect.top + rect.height/2 };
            }
        } else {
            state.dragMode = 'resize';
            state.dragData = {
                dir: e.target.dataset.dir, startX: e.clientX, startY: e.clientY,
                w: parseFloat(state.selectedEl.style.width), h: parseFloat(state.selectedEl.style.height),
                l: parseFloat(state.selectedEl.style.left), t: parseFloat(state.selectedEl.style.top),
                scaleX: parseFloat(state.selectedEl.getAttribute('data-scaleX')) || 1,
                scaleY: parseFloat(state.selectedEl.getAttribute('data-scaleY')) || 1
            };
            const img = state.selectedEl.querySelector('img');
            if(img && state.cropMode) {
                 state.dragData.imgW = parseFloat(img.style.width) || img.offsetWidth;
                 state.dragData.imgH = parseFloat(img.style.height) || img.offsetHeight;
                 state.dragData.imgL = parseFloat(img.style.left) || 0;
                 state.dragData.imgT = parseFloat(img.style.top) || 0;
            }
        }
        e.preventDefault();
        return;
    }

    const el = e.target.closest('.pub-element');
    if(el) {
        // --- NATIVE CTRL+CLICK MULTI-SELECT ---
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            state.multiSelected = state.multiSelected || [];
            
            // If this is the very first Ctrl+Click, make sure the already-selected item gets added!
            if (state.multiSelected.length === 0 && state.selectedEl) state.multiSelected.push(state.selectedEl);
            
            if (state.multiSelected.includes(el)) {
                state.multiSelected = state.multiSelected.filter(m => m !== el);
                el.classList.remove('selected');
            } else {
                state.multiSelected.push(el);
                el.classList.add('selected');
            }
            
            // Clean up the UI depending on how many items we just selected
            if (state.multiSelected.length === 0) {
                 window.deselect();
            } else if (state.multiSelected.length === 1) {
                 window.selectElement(state.multiSelected[0]);
                 state.multiSelected = [];
            } else {
                 if(state.selectedEl) { state.selectedEl.classList.remove('selected'); state.selectedEl = null; }
                 document.getElementById('status-msg').innerText = state.multiSelected.length + " Elements Selected";
                 if(typeof floatToolbar !== 'undefined') { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
            }
            return;
        }

        const isMulti = state.multiSelected && state.multiSelected.includes(el);
        if (!isMulti) {
            if(state.selectedEl !== el) window.selectElement(el);
            if(state.multiSelected && state.multiSelected.length > 0) {
                state.multiSelected.forEach(m => m.classList.remove('selected'));
                state.multiSelected = [];
            }
        }

        if(el.querySelector('svg') || el.querySelector('img') || el.getAttribute('data-type') === 'shape') {
            state.dragMode = 'drag';
            state.dragData = { startX: e.clientX, startY: e.clientY, l: parseFloat(el.style.left), t: parseFloat(el.style.top) };
            if(isMulti) state.dragData.multi = state.multiSelected.map(m => ({ el: m, l: parseFloat(m.style.left), t: parseFloat(m.style.top) }));
            e.preventDefault();
            return;
        }

        const rect = el.getBoundingClientRect(), edgeSize = 15;
        const nearEdge = (e.clientX < rect.left + edgeSize) || (e.clientX > rect.right - edgeSize) || (e.clientY < rect.top + edgeSize) || (e.clientY > rect.bottom - edgeSize);
        const activeEl = document.activeElement, isEditingText = activeEl && el.contains(activeEl) && (activeEl.isContentEditable);
        if (nearEdge || !isEditingText) {
            state.dragMode = 'drag';
            state.dragData = { startX: e.clientX, startY: e.clientY, l: parseFloat(el.style.left), t: parseFloat(el.style.top) };
            if(isMulti) state.dragData.multi = state.multiSelected.map(m => ({ el: m, l: parseFloat(m.style.left), t: parseFloat(m.style.top) }));
            if(!isEditingText) e.preventDefault();
        }

        setTimeout(() => {
            const input = document.getElementById('doc-protect-pw');
            if (input) input.focus();
        }, 100);
    }
};

window.handleMouseMove = function(e) {
    const cd = document.getElementById('coord-display');
    if(cd) cd.innerText = `X: ${e.clientX} | Y: ${e.clientY}`;

    if(!state.dragMode && !state.cropMode) {
        const el = e.target.closest('.pub-element');
        if(el) {
            const isShape = el.querySelector('img') || el.querySelector('svg') || el.getAttribute('data-type') === 'shape', rect = el.getBoundingClientRect();
            if (isShape) {
                el.style.cursor = 'move';
            } else {
                const edgeSize = 15;
                el.style.cursor = ((e.clientX < rect.left + edgeSize) || (e.clientX > rect.right - edgeSize) || (e.clientY < rect.top + edgeSize) || (e.clientY > rect.bottom - edgeSize)) ? 'move' : 'text';
            }
        }
    }

    if(!state.dragMode) return;

    if(state.dragMode === 'marquee') {
        const box = document.getElementById('marquee-box');
        if(box) {
            const paperRect = paper.getBoundingClientRect();
            const clampedX = Math.max(paperRect.left, Math.min(e.clientX, paperRect.right)), clampedY = Math.max(paperRect.top, Math.min(e.clientY, paperRect.bottom));
            const startX = Math.max(paperRect.left, Math.min(state.dragData.startX, paperRect.right)), startY = Math.max(paperRect.top, Math.min(state.dragData.startY, paperRect.bottom));
            box.style.left = Math.min(clampedX, startX) + 'px'; box.style.top = Math.min(clampedY, startY) + 'px';
            box.style.width = Math.abs(clampedX - startX) + 'px'; box.style.height = Math.abs(clampedY - startY) + 'px';
        }
        return;
    }

    if(!state.selectedEl && (!state.multiSelected || state.multiSelected.length === 0)) return;

    const zoom = state.zoom;
    if(state.dragMode === 'drag') {
        const dx = (e.clientX - state.dragData.startX) / zoom;
        const dy = (e.clientY - state.dragData.startY) / zoom;
        if(state.dragData.multi && state.dragData.multi.length > 0) {
            state.dragData.multi.forEach(item => {
                item.el.style.left = (item.l + dx) + 'px'; item.el.style.top = (item.t + dy) + 'px';
            });
        } else {
            state.selectedEl.style.left = (state.dragData.l + dx) + 'px'; state.selectedEl.style.top = (state.dragData.t + dy) + 'px';
        }
        if(typeof floatToolbar !== 'undefined') { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
    } 
    else if(state.dragMode === 'pan-image') {
        const dx = (e.clientX - state.dragData.startX) / zoom;
        const dy = (e.clientY - state.dragData.startY) / zoom;
        const img = state.selectedEl.querySelector('img');
        img.style.left = (state.dragData.l + dx) + 'px'; img.style.top = (state.dragData.t + dy) + 'px';
    } 
    else if(state.dragMode === 'rotate') {
        if (state.multiSelected && state.multiSelected.length > 1) {
            
            // --- NATIVE MATH FOR FLAWLESS ORBITS ---
            const d = state.dragData;
            const currentAngle = Math.atan2(e.clientY - d.screenCy, e.clientX - d.screenCx);
            const deltaRad = currentAngle - d.startAngle;
            const deltaDeg = deltaRad * (180 / Math.PI);
            
            const cosT = Math.cos(deltaRad);
            const sinT = Math.sin(deltaRad);
            
            d.items.forEach(item => {
                const new_dx = item.dx * cosT - item.dy * sinT;
                const new_dy = item.dx * sinT + item.dy * cosT;
                item.el.style.left = (d.cx + new_dx - item.w/2) + 'px';
                item.el.style.top = (d.cy + new_dy - item.h/2) + 'px';
                item.el.style.transform = `rotate(${item.origRot + deltaDeg}deg)`;
            });
            
        } else {
            state.selectedEl.style.transform = `rotate(${(Math.atan2(e.clientY - state.dragData.cy, e.clientX - state.dragData.cx) * (180/Math.PI)) + 90}deg)`;
        }
    } 
    else if(state.dragMode === 'resize') {
        const dx = (e.clientX - state.dragData.startX) / zoom;
        const dy = (e.clientY - state.dragData.startY) / zoom;
        const d = state.dragData;
        let rawW = d.w, rawH = d.h, newL = d.l, newT = d.t;
        let imgDx = 0, imgDy = 0;
        
        if (d.dir.includes('e')) rawW = d.w + dx;
        else if (d.dir.includes('w')) { rawW = d.w - dx; newL = d.l + dx; if(state.cropMode) imgDx = -dx; }
        if (d.dir.includes('s')) rawH = d.h + dy;
        else if (d.dir.includes('n')) { rawH = d.h - dy; newT = d.t + dy; if(state.cropMode) imgDy = -dy; }
        
        if (state.cropMode) {
            const img = state.selectedEl.querySelector('img');
            if (imgDx !== 0) img.style.left = ((parseFloat(img.style.left) || 0) + imgDx) + 'px';
            if (imgDy !== 0) img.style.top = ((parseFloat(img.style.top) || 0) + imgDy) + 'px';
            if(rawW > 10) { state.selectedEl.style.width = rawW + 'px'; state.selectedEl.style.left = newL + 'px'; }
            if(rawH > 10) { state.selectedEl.style.height = rawH + 'px'; state.selectedEl.style.top = newT + 'px'; }
        } else {
            let finalScaleX = d.scaleX, finalScaleY = d.scaleY;
            if (rawW < 0) { rawW = Math.abs(rawW); if (d.dir.includes('e')) newL = d.l - rawW; finalScaleX = -1 * d.scaleX; }
            if (rawH < 0) { rawH = Math.abs(rawH); if (d.dir.includes('s')) newT = d.t - rawH; finalScaleY = -1 * d.scaleY; }
            if(rawW > 10) { state.selectedEl.style.width = rawW + 'px'; state.selectedEl.style.left = newL + 'px'; }
            if(rawH > 10) { state.selectedEl.style.height = rawH + 'px'; state.selectedEl.style.top = newT + 'px'; }
            
            const img = state.selectedEl.querySelector('img');
            if (img && d.imgW !== undefined) {
                const ratioX = rawW / Math.abs(d.w), ratioY = rawH / Math.abs(d.h);
                img.style.width = (d.imgW * ratioX) + 'px'; img.style.height = (d.imgH * ratioY) + 'px';
                img.style.left = (d.imgL * ratioX) + 'px'; img.style.top = (d.imgT * ratioY) + 'px';
            }
            const _contentEl = state.selectedEl.querySelector('.element-content');
            let _t3d = '';
            if (_contentEl) {
                const rx = _contentEl.getAttribute('data-3d-rx') || 0;
                const ry = _contentEl.getAttribute('data-3d-ry') || 0;
                const rz = _contentEl.getAttribute('data-3d-rz') || 0;
                const p = _contentEl.getAttribute('data-3d-p') || 800;
                if (rx != 0 || ry != 0 || rz != 0) _t3d = ` perspective(${p}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
                _contentEl.style.transform = `scale(${finalScaleX}, ${finalScaleY})${_t3d}`;
            }
            state.selectedEl.setAttribute('data-scaleX', finalScaleX); state.selectedEl.setAttribute('data-scaleY', finalScaleY);
            if(typeof syncWordArt === 'function' && state.selectedEl.querySelector('.wa-text')) syncWordArt(state.selectedEl);
        }
        if(typeof floatToolbar !== 'undefined') { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
    }
};

window.handleMouseUp = function() {
    if(state.dragMode === 'marquee') {
        const box = document.getElementById('marquee-box');
        if(box) {
            const rect = box.getBoundingClientRect();
            box.remove();
            state.multiSelected = [];
            paper.querySelectorAll('.pub-element').forEach(el => {
                const elRect = el.getBoundingClientRect();
                if (!(rect.right < elRect.left || rect.left > elRect.right || rect.bottom < elRect.top || rect.top > elRect.bottom)) {
                    state.multiSelected.push(el);
                    el.classList.add('selected');
                }
            });
            if(state.multiSelected.length === 1) {
                window.selectElement(state.multiSelected[0]);
                state.multiSelected = [];
            } else if(state.multiSelected.length > 1) {
                document.getElementById('status-msg').innerText = state.multiSelected.length + " Elements Selected";
                if(typeof floatToolbar !== 'undefined') { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
            }
        }
    } else if(state.dragMode) {
        setTimeout(() => { if(typeof updateThumbnails === 'function') updateThumbnails(); }, 50);
        if(typeof pushHistory === 'function') pushHistory();
        if(state.selectedEl && (!state.multiSelected || state.multiSelected.length === 0) && typeof showFloatToolbar === 'function') showFloatToolbar();
    }
    state.dragMode = null;
};


















 










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
window.showInfoModal = function() {
    const isCMYK = document.getElementById('paper').classList.contains('cmyk-mode');
    
    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 20px; max-width: 650px; margin: 0 auto;">
        <!-- Commercial Print Settings -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; display: flex; gap: 15px; align-items: flex-start;">
            <div style="background: #f1f5f9; color: var(--ui-theme-color); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
                <i class="fas fa-palette"></i>
            </div>
            <div style="flex-grow: 1;">
                <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #1e293b;">Commercial Print Settings</h3>
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; line-height: 1.4;">
                    If you are sending this document to a professional printing service, they may require the CMYK color model. Switching to CMYK will apply a soft-proof filter that simulates how your document will look when printed with physical ink (which has a narrower color gamut than a screen).
                </p>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <label style="font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="colorModel" value="RGB" ${!isCMYK ? 'checked' : ''} onchange="toggleColorModel('RGB')" style="accent-color: var(--ui-theme-color);"> 
                        RGB (Digital Display)
                    </label>
                    <label style="font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="colorModel" value="CMYK" ${isCMYK ? 'checked' : ''} onchange="toggleColorModel('CMYK')" style="accent-color: var(--ui-theme-color);"> 
                        CMYK (Commercial Print)
                    </label>
                </div>
            </div>
        </div>

        <!-- Design Checker -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; display: flex; gap: 15px; align-items: flex-start;">
            <div style="background: #fdf2f8; color: #db2777; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
                <i class="fas fa-stethoscope"></i>
            </div>
            <div style="flex-grow: 1;">
                <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #1e293b;">Design Checker</h3>
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; line-height: 1.4;">
                    Run a diagnostic scan on your document to find potential issues before printing or exporting. This will automatically catch text overflow, low-resolution images, or objects that have been accidentally dragged off the page canvas.
                </p>
                <button onclick="runDesignChecker()" style="background: var(--ui-theme-color); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 13px;">
                    <i class="fas fa-search" style="margin-right: 5px;"></i> Run Design Checker
                </button>
                <div id="design-checker-results" style="margin-top: 15px; display: none;"></div>
            </div>
        </div>
        <!-- Inspect Document -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; display: flex; gap: 15px; align-items: flex-start;">
            <div style="background: #ccfbf1; color: var(--ui-theme-color); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
                <i class="fas fa-search-plus"></i>
            </div>
            <div style="flex-grow: 1;">
                <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #1e293b;">Inspect Document</h3>
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; line-height: 1.4;">
                    Check the document for hidden properties or personal information before sharing it with others. The inspector will find and help you remove document metadata, off-canvas elements, and empty text boxes.
                </p>
                <button onclick="showDocumentInspectorModal()" style="background: var(--ui-theme-color); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 13px;">
                    Inspect Document
                </button>
            </div>
        </div>
    </div>
    `;

    if (typeof DialogSystem !== 'undefined') {
        DialogSystem.show('Document Info', html, null, true);
    }
};

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
window.toggleSelectionPane = function() {
    let panel = document.getElementById('op-selection-sidebar');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'op-selection-sidebar';
        panel.className = 'sidebar-panel op-sidebar visible';
        panel.innerHTML = `
            <div class="op-sidebar-header">
                <span class="op-sidebar-title">Selection Pane</span>
                <div class="op-sidebar-top-btns">
                    <button class="custom-dialog-close" onclick="document.getElementById('op-selection-sidebar').classList.remove('visible')"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="op-sidebar-section" style="padding-bottom: 5px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; gap: 6px;">
                    <div class="op-sidebar-btn btn-primary" style="flex:1; margin-bottom:0; justify-content:center; text-align:center;" onclick="window.setSelectionPaneVisibility(true)">Show All</div>
                    <div class="op-sidebar-btn btn-primary" style="flex:1; margin-bottom:0; justify-content:center; text-align:center;" onclick="window.setSelectionPaneVisibility(false)">Hide All</div>
                </div>
            </div>
            <div id="op-selection-list" style="overflow-y: auto; max-height: calc(100vh - 160px); padding: 0 10px;"></div>
        `;
        document.body.appendChild(panel);

        // Set up mutation observer on paper to automatically refresh the pane!
        const paper = document.getElementById('paper');
        if (paper) {
            const observer = new MutationObserver(() => {
                if (document.getElementById('op-selection-sidebar')?.classList.contains('visible')) {
                    window.refreshSelectionPane();
                }
            });
            observer.observe(paper, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'data-element-name'] });
        }
    } else {
        panel.classList.toggle('visible');
    }

    if (panel.classList.contains('visible')) {
        document.getElementById('op-image-sidebar')?.classList.remove('visible');
        document.getElementById('op-wordart-sidebar')?.classList.remove('visible');
        document.getElementById('op-table-sidebar')?.classList.remove('visible');
        window.refreshSelectionPane();
    }
};

window.setSelectionPaneVisibility = function(show) {
    const paper = document.getElementById('paper');
    if (!paper) return;
    const els = Array.from(paper.querySelectorAll('.pub-element'));
    els.forEach(el => {
        if (show) {
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    });
    if (typeof pushHistory === 'function') pushHistory();
};

window.refreshSelectionPane = function() {
    const panel = document.getElementById('op-selection-sidebar');
    if (!panel || !panel.classList.contains('visible')) return;

    const list = document.getElementById('op-selection-list');
    list.innerHTML = '';

    const paper = document.getElementById('paper');
    if (!paper) return;
    
    // Original elements array
    const originalEls = Array.from(paper.querySelectorAll('.pub-element'));
    
    // Clone array to sort (highest on top)
    const els = [...originalEls];
    els.sort((a, b) => {
        const za = parseInt(window.getComputedStyle(a).zIndex) || 0;
        const zb = parseInt(window.getComputedStyle(b).zIndex) || 0;
        if (za === zb) {
            return originalEls.indexOf(b) - originalEls.indexOf(a);
        }
        return zb - za;
    });

    els.forEach((el, index) => {
        let defaultName = "Element";
        if (el.querySelector('img')) defaultName = "Picture";
        else if (el.querySelector('svg')) defaultName = "Shape";
        else if (el.querySelector('table')) defaultName = "Table";
        else if (el.querySelector('.element-content')) defaultName = "Text Box";
        else if (el.querySelector('.wa-text')) defaultName = "WordArt";
        
        const name = el.getAttribute('data-element-name') || `${defaultName} ${originalEls.indexOf(el) + 1}`;
        const isHidden = el.style.display === 'none';
        const isSelected = typeof state !== 'undefined' && (state.selectedEl === el || el.classList.contains('selected'));

        const row = document.createElement('div');
        row.className = 'selection-pane-item' + (isSelected ? ' active' : '');
        row.style.cssText = `display:flex; align-items:center; padding: 6px 10px; margin-bottom: 4px; background: ${isSelected ? 'color-mix(in srgb, var(--ui-theme-color) 10%, transparent)' : 'var(--ui-panel-bg, #f8fafc)'}; border: 1px solid ${isSelected ? 'var(--ui-theme-color)' : 'var(--ui-border, #e2e8f0)'}; color: var(--ui-text); border-radius: 4px; cursor: pointer; transition: 0.2s;`;
        
        row.onclick = (e) => {
            if (e.target.closest('.selection-eye') || e.target.tagName === 'INPUT') return;
            if (typeof selectElement === 'function' && !isHidden) {
                selectElement(el);
            }
        };

        const eye = document.createElement('div');
        eye.className = 'selection-eye';
        eye.style.cssText = `padding: 4px; margin-right: 8px; cursor: pointer; color: ${isHidden ? '#94a3b8' : 'var(--ui-theme-color)'}; font-size: 14px; width: 20px; text-align: center;`;
        eye.innerHTML = `<i class="fas ${isHidden ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
        eye.onclick = (e) => {
            e.stopPropagation();
            el.style.display = isHidden ? '' : 'none';
            if (!isHidden && isSelected) {
                if (typeof deselect === 'function') deselect();
            }
            if (typeof pushHistory === 'function') pushHistory();
        };

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = name;
        nameInput.style.cssText = 'flex: 1; border: none; background: transparent; font-size: 13px; color: var(--ui-text, #334155); outline: none; padding: 2px 5px; min-width: 0;';
        nameInput.onchange = (e) => {
            el.setAttribute('data-element-name', e.target.value);
            if (typeof pushHistory === 'function') pushHistory();
        };

        row.appendChild(eye);
        row.appendChild(nameInput);
        list.appendChild(row);
    });
};

// ==========================================
// SHADOW PANE LOGIC
// ==========================================
window.setShadowPaneVisibility = function(visible) {
    let panel = document.getElementById('op-shadow-sidebar');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'op-shadow-sidebar';
        panel.className = 'sidebar-panel op-sidebar';
        panel.innerHTML = `
            <div class="op-sidebar-header">
                <span class="op-sidebar-title">Shadow / Glow Options</span>
                <div class="op-sidebar-top-btns">
                    <button class="custom-dialog-close" onclick="document.getElementById('op-shadow-sidebar').classList.remove('visible')"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="op-sidebar-section">
                <div class="op-sidebar-label">Shadow Color</div>
                <input type="hidden" id="shadow-color-input" value="#000000">
                <div style="width: 100%; height: 30px; border: 1px solid #ccc; cursor: pointer; background-color:#000000; border-radius:4px;" onclick="CustomColorPicker.open(this, document.getElementById('shadow-color-input').value, (c) => { document.getElementById('shadow-color-input').value = c; this.style.backgroundColor = c; window.updateShadowFromSliders(); })"></div>
            </div>
            <div class="op-sidebar-section">
                <div class="op-sidebar-label" style="display:flex; justify-content:space-between;"><span>Transparency</span> <span style="font-weight:bold;"><span id="shadow-alpha-val">60</span>%</span></div>
                <input type="range" id="shadow-alpha-slider" min="0" max="100" value="60" style="width:100%; accent-color: var(--ui-theme-color);" oninput="document.getElementById('shadow-alpha-val').innerText=this.value; window.updateShadowFromSliders()">
            </div>
            <div class="op-sidebar-section">
                <div class="op-sidebar-label" style="display:flex; justify-content:space-between;"><span>Blur Radius</span> <span style="font-weight:bold;"><span id="shadow-blur-val">10</span>px</span></div>
                <input type="range" id="shadow-blur-slider" min="0" max="100" value="10" style="width:100%; accent-color: var(--ui-theme-color);" oninput="document.getElementById('shadow-blur-val').innerText=this.value; window.updateShadowFromSliders()">
            </div>
            <div class="op-sidebar-section">
                <div class="op-sidebar-label" style="display:flex; justify-content:space-between;"><span>X Offset</span> <span style="font-weight:bold;"><span id="shadow-x-val">5</span>px</span></div>
                <input type="range" id="shadow-x-slider" min="-100" max="100" value="5" style="width:100%; accent-color: var(--ui-theme-color);" oninput="document.getElementById('shadow-x-val').innerText=this.value; window.updateShadowFromSliders()">
            </div>
            <div class="op-sidebar-section">
                <div class="op-sidebar-label" style="display:flex; justify-content:space-between;"><span>Y Offset</span> <span style="font-weight:bold;"><span id="shadow-y-val">5</span>px</span></div>
                <input type="range" id="shadow-y-slider" min="-100" max="100" value="5" style="width:100%; accent-color: var(--ui-theme-color);" oninput="document.getElementById('shadow-y-val').innerText=this.value; window.updateShadowFromSliders()">
            </div>
        `;
        document.body.appendChild(panel);
    }
    
    if (visible) {
        document.querySelectorAll('.sidebar-panel.visible, .op-sidebar.visible').forEach(el => el.classList.remove('visible'));
        panel.classList.add('visible');
        window.parseShadowToSliders();
    } else {
        panel.classList.remove('visible');
    }
};

window.parseShadowToSliders = function() {
    if (!state.selectedEl) return;
    const legacyInner = state.selectedEl.querySelector('img') || state.selectedEl.querySelector('svg');
    let inner = state.selectedEl.querySelector('.element-content') || state.selectedEl;
    
    // Fallback parsing if shadow was already applied to an inner element before hotfix
    if (legacyInner && legacyInner.style.filter.includes('drop-shadow')) {
        inner = legacyInner;
    }

    const filter = inner.style.filter || '';
    const match = filter.match(/drop-shadow\(([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+(rgba?\([^)]+\)|#[0-9a-fA-F]+)\)/);
    if (match) {
        const x = parseFloat(match[1]);
        const y = parseFloat(match[2]);
        const blur = parseFloat(match[3]);
        let colorStr = match[4];
        
        let r = 0, g = 0, b = 0, a = 0.6;
        if (colorStr.startsWith('rgba') || colorStr.startsWith('rgb')) {
            const rgbaMatch = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
            if (rgbaMatch) {
                r = parseInt(rgbaMatch[1]);
                g = parseInt(rgbaMatch[2]);
                b = parseInt(rgbaMatch[3]);
                a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
            }
        }
        
        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        
        document.getElementById('shadow-x-slider').value = x;
        document.getElementById('shadow-x-val').innerText = x;
        document.getElementById('shadow-y-slider').value = y;
        document.getElementById('shadow-y-val').innerText = y;
        document.getElementById('shadow-blur-slider').value = blur;
        document.getElementById('shadow-blur-val').innerText = blur;
        document.getElementById('shadow-alpha-slider').value = Math.round((1 - a) * 100);
        document.getElementById('shadow-alpha-val').innerText = Math.round((1 - a) * 100);
        document.getElementById('shadow-color-input').value = hex;
    }
};

window.updateShadowFromSliders = function() {
    if (!state.selectedEl) return;
    const legacyInner = state.selectedEl.querySelector('img') || state.selectedEl.querySelector('svg');
    if (legacyInner && legacyInner.style.filter.includes('drop-shadow')) {
        legacyInner.style.filter = legacyInner.style.filter.replace(/drop-shadow\((?:[^)(]+|\([^)(]*\))*\)/g, '').trim();
    }
    const inner = state.selectedEl.querySelector('.element-content') || state.selectedEl;
    
    const x = document.getElementById('shadow-x-slider').value;
    const y = document.getElementById('shadow-y-slider').value;
    const blur = document.getElementById('shadow-blur-slider').value;
    const alphaSlider = document.getElementById('shadow-alpha-slider').value;
    const hex = document.getElementById('shadow-color-input').value;
    
    let r = parseInt(hex.substring(1,3), 16);
    let g = parseInt(hex.substring(3,5), 16);
    let b = parseInt(hex.substring(5,7), 16);
    let a = 1 - (alphaSlider / 100);
    
    const dropShadowStr = `drop-shadow(${x}px ${y}px ${blur}px rgba(${r},${g},${b},${a}))`;
    
    let currentFilter = inner.style.filter || '';
    if (currentFilter.includes('drop-shadow')) {
        inner.style.filter = currentFilter.replace(/drop-shadow\((?:[^)(]+|\([^)(]*\))*\)/g, dropShadowStr).trim();
    } else {
        inner.style.filter = (currentFilter + ' ' + dropShadowStr).trim();
    }
    
    clearTimeout(window.shadowHistoryTimeout);
    window.shadowHistoryTimeout = setTimeout(() => {
        if (typeof pushHistory === 'function') pushHistory();
    }, 500);
};

window.bakeSVGFiltersForHtml2Canvas = async function(clone, original) {
    const origImages = original.querySelectorAll('img');
    const cloneImages = clone.querySelectorAll('img');
    
    for (let i = 0; i < cloneImages.length; i++) {
        const cImg = cloneImages[i];
        const oImg = origImages[i];
        if (!oImg) continue;
        
        const comp = window.getComputedStyle(oImg);
        let filter = comp.filter !== 'none' ? comp.filter : oImg.style.filter;
        let opacity = comp.opacity !== '1' ? comp.opacity : oImg.style.opacity;
        
        if (!filter || filter === 'none') {
            const inner = oImg.closest('.element-content');
            if (inner) {
                const iComp = window.getComputedStyle(inner);
                if (iComp.filter && iComp.filter !== 'none') filter = iComp.filter;
            }
        }
        
        if ((filter && filter !== 'none') || (opacity && opacity !== '1')) {
            let finalSrc = oImg.src;
            try {
                let isSvg = false;
                let svgText = null;

                if (finalSrc.includes('.svg') && !finalSrc.startsWith('data:')) {
                    try {
                        let fetchSrc = finalSrc;
                        fetchSrc += (fetchSrc.includes('?') ? '&' : '?') + 'corsbuster=' + Date.now();
                        const svgRes = await fetch(fetchSrc, { mode: 'cors' });
                        if (svgRes.ok) {
                            svgText = await svgRes.text();
                            isSvg = true;
                        }
                    } catch (fetchErr) {
                        console.warn("Could not fetch SVG for dimension normalization (SSL/CORS). Proceeding to direct bake.", fetchErr);
                    }
                } else if (finalSrc.startsWith('data:image/svg+xml')) {
                    const parts = finalSrc.split(',');
                    if (finalSrc.includes(';base64,')) {
                        svgText = decodeURIComponent(escape(atob(parts[1])));
                    } else {
                        svgText = decodeURIComponent(parts[1]);
                    }
                    isSvg = true;
                }

                if (isSvg && svgText) {
                    // Normalize dimensions
                    svgText = svgText.replace(/\bpreserveAspectRatio\s*=\s*["'][^"']*["']/gi, '');
                    svgText = svgText.replace(/<svg/i, '<svg preserveAspectRatio="none" width="100%" height="100%"');
                    finalSrc = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))}`;
                }
            } catch (e) {
                console.warn("Failed to inject SVG filters:", e);
            }

            // Force proxy for external URLs to guarantee CORS headers and bypass local SSL cert issues
            if (finalSrc && finalSrc.startsWith('http') && !finalSrc.includes('wsrv.nl')) {
                let cleanUrl = finalSrc.replace(/^https?:\/\//, '');
                if (cleanUrl.includes('acr.floydcraft')) cleanUrl = 'http://' + cleanUrl;
                finalSrc = `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}`;
            }

            // Fallback for raster images (PNG/JPG) using canvas baking
            let displayW = oImg.naturalWidth || parseFloat(comp.width) || 300;
            let displayH = oImg.naturalHeight || parseFloat(comp.height) || 300;

            // PREVENT OUT-OF-MEMORY (OOM): Cap the baking resolution to prevent huge canvases for high-res images
            const maxDim = 2000;
            if (displayW > maxDim || displayH > maxDim) {
                const ratio = Math.min(maxDim / displayW, maxDim / displayH);
                displayW = Math.round(displayW * ratio);
                displayH = Math.round(displayH * ratio);
            }

            try {
                const bakedSrc = await window.bakeImageForPrint(finalSrc, displayW, displayH, {
                    filter: filter !== 'none' ? filter : '',
                    opacity: opacity !== '1' ? opacity : '1',
                    clipPath: '',
                    imgStyle: { width: '100%', height: '100%', objectFit: 'fill' }
                });
                
                await new Promise(r => {
                    cImg.onload = r;
                    cImg.onerror = r;
                    cImg.src = bakedSrc;
                });
                
                cImg.style.filter = 'none';
                cImg.style.opacity = '1';
            } catch (e) {
                console.warn('Export bake failed, fallback to style', e);
                cImg.src = finalSrc;
                cImg.style.filter = filter !== 'none' ? filter : '';
                cImg.style.opacity = opacity !== '1' ? opacity : '1';
            }
        }

        setTimeout(() => {
            const input = document.getElementById('doc-protect-pw');
            if (input) input.focus();
        }, 100);
    }
};

window.capturePageAsCanvasWithFilters = async function(paper, scaleMultiplier) {
    const clone = paper.cloneNode(true);
    
    // Strip UI elements from the clone before capturing
    clone.querySelectorAll('.margin-guides, .resize-handle, .rotate-handle, .rotate-stick, .selection-box, .op-dynamic-print-style').forEach(el => el.remove());

    const stagingArea = document.createElement('div');
    stagingArea.style.cssText = 'position: fixed; top: -10000px; left: -10000px; z-index: -100; overflow: visible; display: block; opacity: 0.01; pointer-events: none;';
    
    clone.style.width = paper.style.width;
    clone.style.height = paper.style.height;
    clone.style.margin = '0';
    clone.style.boxShadow = 'none';
    
    stagingArea.appendChild(clone);
    document.body.appendChild(stagingArea);

    if (typeof flattenWaTextForPrint === 'function') {
        clone.querySelectorAll('.wa-text').forEach(node => flattenWaTextForPrint(node));
    }

    await window.bakeSVGFiltersForHtml2Canvas(clone, paper);

    const canvas = await html2canvas(clone, { 
        scale: scaleMultiplier, 
        useCORS: true, 
        backgroundColor: state.pages[state.currentPageIndex]?.background || '#ffffff',
        logging: false
    });
    
    stagingArea.remove();
    return canvas;
};

window.shareCurrentPageEmail = async function() {
    if (typeof DialogSystem !== 'undefined') {
        const progressHtml = `
            <div style="text-align:center; padding: 10px;">
                <p style="margin-bottom:15px; font-weight:bold;">Generating email attachment...</p>
                <div style="width:100%; background:#eee; border-radius:10px; overflow:hidden; height:10px;">
                    <div style="width:50%; height:100%; background:var(--ui-theme-color); transition: width 0.3s; animation: indeterminate 1.5s infinite linear;"></div>
                </div>
                <style>@keyframes indeterminate { 0% { width: 0%; margin-left: 0%; } 50% { width: 50%; margin-left: 25%; } 100% { width: 0%; margin-left: 100%; } }</style>
            </div>
        `;
        DialogSystem.show('Share via Email', progressHtml, null, true);
        
        setTimeout(() => {
            if (document.getElementById('custom-dialog-confirm')) document.getElementById('custom-dialog-confirm').style.display = 'none';
            if (document.getElementById('custom-dialog-cancel')) document.getElementById('custom-dialog-cancel').style.display = 'none';
        }, 10);
    }

    try {
        if(typeof deselect === 'function') deselect();
        await new Promise(r => setTimeout(r, 100));

        const paper = document.getElementById('paper');
        if (!paper) throw new Error("Could not find current page.");

        const canvas = await window.capturePageAsCanvasWithFilters(paper, 2);
        const imgDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const base64Data = imgDataUrl.split(',')[1];
        
        const pW = parseFloat(paper.style.width) || 794;
        const docTitle = (document.getElementById('doc-title').innerText || 'Publication').replace(/[^a-zA-Z0-9 -]/g, '');

        const emlContent = `To: \r\nSubject: ${docTitle}\r\nMIME-Version: 1.0\r\nContent-Type: multipart/related; boundary="boundary-op-email"\r\n\r\n--boundary-op-email\r\nContent-Type: text/html; charset="utf-8"\r\n\r\n<!DOCTYPE html>\r\n<html>\r\n<body style="background:#f0f0f0; padding:20px;">\r\n<table width="100%" cellpadding="0" cellspacing="0" border="0">\r\n    <tr>\r\n        <td align="center">\r\n            <img src="cid:pageimage" width="${pW}" style="display:block; max-width:100%; height:auto; border:0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />\r\n        </td>\r\n    </tr>\r\n</table>\r\n<div style="text-align:center; margin-top:30px; font-family:sans-serif; font-size:12px; color:#888;">\r\n    Created with <a href="https://openpublisher.app" style="color:#0ea5e9;">Open Publisher</a>\r\n</div>\r\n</body>\r\n</html>\r\n\r\n--boundary-op-email\r\nContent-Type: image/jpeg; name="page.jpg"\r\nContent-Transfer-Encoding: base64\r\nContent-ID: <pageimage>\r\nContent-Disposition: inline; filename="page.jpg"\r\n\r\n${base64Data}\r\n--boundary-op-email--`;

        const blob = new Blob([emlContent], { type: 'message/rfc822' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${docTitle}.eml`;
        a.click();
        URL.revokeObjectURL(url);

        if (typeof DialogSystem !== 'undefined') DialogSystem.close();

    } catch(err) {
        if (typeof DialogSystem !== 'undefined') {
            DialogSystem.close();
            setTimeout(() => DialogSystem.alert('Error', 'Failed to generate email: ' + err), 300);
        }

        setTimeout(() => {
            const input = document.getElementById('doc-protect-pw');
            if (input) input.focus();
        }, 100);
    }
};

window.exportImageResolutionSetting = 96;

window.showExportImageModal = function() {
    window.exportImageResolutionSetting = 96; // default

    const html = `
        <div style="padding: 10px 20px 0 20px;">
            <p style="margin-bottom: 15px; font-size: 14px; color: var(--ui-text, #555);">Export the current page as a JPEG image.</p>
            
            <div style="display:flex; align-items:center; justify-content:space-between; background:var(--ui-panel-bg, #f8f9fa); padding:15px; border-radius:8px; border:1px solid var(--ui-border, #e0e0e0); margin-bottom:20px;">
                <div>
                    <div style="font-weight:bold; color:var(--ui-theme-dark); margin-bottom:4px;">Export Resolution</div>
                    <div id="img-res-display" style="font-size:13px; color:var(--ui-text-muted, #555);">Web (96 dpi)</div>
                </div>
                <button class="op-btn" style="padding:6px 12px; font-size:13px; background:transparent; color:var(--ui-theme-color); border:1px solid var(--ui-theme-color); border-radius:4px; cursor:pointer;" onclick="window.toggleImageResolution(this)">Change</button>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                <button class="op-btn op-btn-cancel" style="padding:8px 16px; font-size:14px; font-weight:bold; border-radius:4px; cursor:pointer; background:transparent; color:var(--ui-text); border:1px solid var(--ui-border);" onclick="DialogSystem.close()">Cancel</button>
                <button class="op-btn" style="padding:8px 16px; font-size:14px; font-weight:bold; border-radius:4px; cursor:pointer; background: var(--ui-theme-color); color: var(--ui-theme-text, white); border:none;" onclick="
                    DialogSystem.close();
                    if(typeof exportAsImage === 'function') exportAsImage(window.exportImageResolutionSetting);
                ">
                    <i class="fas fa-file-image" style="margin-right: 8px;"></i> Save Image
                </button>
            </div>
        </div>
    `;
    
    if (typeof DialogSystem !== 'undefined') {
        DialogSystem.show('Export as Image', html, null, true);
        setTimeout(() => {
            const confirmBtn = document.getElementById('custom-dialog-confirm');
            if (confirmBtn && confirmBtn.parentElement) {
                confirmBtn.parentElement.style.display = 'none';
            }
        }, 10);
    }
};

window.toggleImageResolution = function(btn) {
    if (window.exportImageResolutionSetting === 96) {
        window.exportImageResolutionSetting = 300;
        document.getElementById('img-res-display').innerText = 'High Quality (300 dpi)';
    } else {
        window.exportImageResolutionSetting = 96;
        document.getElementById('img-res-display').innerText = 'Web (96 dpi)';
    }
};

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
window.showDocumentPropertiesModal = function() {
    const props = state.documentProperties || { author: '', company: '', subject: '', keywords: '' };
    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 15px; max-width: 450px; margin: 0 auto;">
        <p style="margin: 0; font-size: 13px; color: #64748b;">Edit the properties of this document. This metadata is saved within the file.</p>
        <div style="display: flex; flex-direction: column; gap: 5px;">
            <label style="font-size: 12px; font-weight: 600; color: #1e293b;">Author</label>
            <input type="text" id="prop-author" value="${props.author}" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: inherit; font-size: 13px;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px;">
            <label style="font-size: 12px; font-weight: 600; color: #1e293b;">Company</label>
            <input type="text" id="prop-company" value="${props.company}" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: inherit; font-size: 13px;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px;">
            <label style="font-size: 12px; font-weight: 600; color: #1e293b;">Subject</label>
            <input type="text" id="prop-subject" value="${props.subject}" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: inherit; font-size: 13px;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px;">
            <label style="font-size: 12px; font-weight: 600; color: #1e293b;">Keywords</label>
            <input type="text" id="prop-keywords" value="${props.keywords}" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: inherit; font-size: 13px;">
        </div>
    </div>
    `;
    if (typeof DialogSystem !== 'undefined') {
        DialogSystem.show('Document Properties', html, () => {
            state.documentProperties = {
                author: document.getElementById('prop-author').value,
                company: document.getElementById('prop-company').value,
                subject: document.getElementById('prop-subject').value,
                keywords: document.getElementById('prop-keywords').value
            };
        }, false);
    }
};

// --- Document Inspector ---
window.showDocumentInspectorModal = function() {
    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 15px; max-width: 550px; margin: 0 auto;">
        <p style="margin: 0; font-size: 13px; color: #64748b;">The Document Inspector searches your document for hidden data, personal information, and properties. Click 'Inspect' to scan the document.</p>
        
        <div id="inspector-results" style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
            <!-- Results will populate here -->
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
            <button id="btn-run-inspector" onclick="runDocumentInspector()" style="background: var(--ui-theme-color); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 13px;">
                Inspect
            </button>
        </div>
    </div>
    `;

    if (typeof DialogSystem !== 'undefined') {
        DialogSystem.show('Document Inspector', html, null, true);
    }
};

window.runDocumentInspector = function() {
    const resultsContainer = document.getElementById('inspector-results');
    if (!resultsContainer) return;
    
    // 1. Check Document Properties
    const props = state.documentProperties || {};
    let hasProps = (props.author || props.company || props.subject || props.keywords);

    // 2. Check Off-Canvas Elements and Empty Text Boxes
    // We must serialize the current page to ensure state is up-to-date, then scan state.pages.
    state.pages[state.currentPageIndex] = serializeCurrentPage();

    let offCanvasCount = 0;
    let emptyTextCount = 0;

    for (let p of state.pages) {
        if (!p || !p.elements) continue;
        for (let el of p.elements) {
            // Check Empty Text
            if (el.type === 'box' && !el.isImage && !el.isImageFallback) {
                const textContent = el.innerHTML.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, '').trim();
                if (textContent === '') {
                    emptyTextCount++;
                }
            }

            // Check Off-Canvas
            const left = parseFloat(el.left) || 0;
            const top = parseFloat(el.top) || 0;
            const width = parseFloat(el.width) || 0;
            const height = parseFloat(el.height) || 0;
            const pWidth = parseFloat(p.width) || 794;
            const pHeight = parseFloat(p.height) || 1123;
            
            // If the element's bounding box is completely outside [0, pWidth] and [0, pHeight]
            if (left + width < 0 || left > pWidth || top + height < 0 || top > pHeight) {
                offCanvasCount++;
            }
        }
    }

    // Build Results UI
    const buildResultItem = (title, count, icon, onRemove) => {
        let statusHtml = count > 0 ? 
            '<span style="color: #db2777; font-weight: 600; font-size: 13px;">Found</span>' :
            '<span style="color: #16a34a; font-weight: 600; font-size: 13px;">Clean</span>';
        
        let removeBtn = count > 0 ? 
            '<button onclick="' + onRemove + '" style="background: #e2e8f0; color: #1e293b; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">Remove All</button>' : 
            '';

        return `
        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="${icon}" style="color: #64748b; font-size: 16px; width: 20px; text-align: center;"></i>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 13px; font-weight: 600; color: #1e293b;">${title}</span>
                    ${count > 0 && title !== 'Document Properties' ? `<span style="font-size: 11px; color: #64748b;">${count} items found</span>` : ''}
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                ${statusHtml}
                ${removeBtn}
            </div>
        </div>
        `;
    };

    resultsContainer.innerHTML = 
        buildResultItem('Document Properties', hasProps ? 1 : 0, 'fas fa-list-alt', 'removeInspectorProperties()') +
        buildResultItem('Off-Canvas Elements', offCanvasCount, 'fas fa-border-none', 'removeInspectorOffCanvas()') +
        buildResultItem('Empty Text Boxes', emptyTextCount, 'fas fa-comment-slash', 'removeInspectorEmptyText()');
};

window.removeInspectorProperties = function() {
    state.documentProperties = { author: '', company: '', subject: '', keywords: '' };
    runDocumentInspector(); // Re-scan
};

window.removeInspectorOffCanvas = function() {
    for (let i = 0; i < state.pages.length; i++) {
        let p = state.pages[i];
        if (!p || !p.elements) continue;
        const pWidth = parseFloat(p.width) || 794;
        const pHeight = parseFloat(p.height) || 1123;
        
        p.elements = p.elements.filter(el => {
            const left = parseFloat(el.left) || 0;
            const top = parseFloat(el.top) || 0;
            const width = parseFloat(el.width) || 0;
            const height = parseFloat(el.height) || 0;
            const isOffCanvas = (left + width < 0 || left > pWidth || top + height < 0 || top > pHeight);
            return !isOffCanvas;
        });
    }
    loadPage(state.currentPageIndex); // Refresh DOM
    runDocumentInspector(); // Re-scan
};

window.removeInspectorEmptyText = function() {
    for (let i = 0; i < state.pages.length; i++) {
        let p = state.pages[i];
        if (!p || !p.elements) continue;
        p.elements = p.elements.filter(el => {
            if (el.type !== 'box' || el.isImage || el.isImageFallback) return true;
            const textContent = el.innerHTML.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, '').trim();
            return textContent !== '';
        });
    }
    loadPage(state.currentPageIndex); // Refresh DOM
    runDocumentInspector(); // Re-scan
};

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

window.ThesaurusTool = {
    toggleSidebar: function() {
        const sidebar = document.getElementById('op-thesaurus-sidebar');
        if (sidebar) {
            if (sidebar.classList.contains('visible')) {
                sidebar.classList.remove('visible');
            } else {
                document.getElementById('op-table-sidebar')?.classList.remove('visible');
                document.getElementById('op-image-sidebar')?.classList.remove('visible');
                document.getElementById('op-wordart-sidebar')?.classList.remove('visible');
                document.getElementById('op-a11y-sidebar')?.classList.remove('visible');
                document.getElementById('op-graphics-sidebar')?.classList.remove('visible');
                sidebar.classList.add('visible');
                
                // Pre-fill with selected text if it's a single word
                let selection = window.getSelection().toString().trim();
                if (selection && !selection.includes(' ')) {
                    document.getElementById('thesaurus-search-input').value = selection;
                    this.search();
                } else {
                    document.getElementById('thesaurus-search-input').focus();
                }
            }
        }
    },
    
    search: function() {
        const input = document.getElementById('thesaurus-search-input');
        const word = input.value.trim();
        const resultsContainer = document.getElementById('thesaurus-results');
        
        if (!word) return;
        
        resultsContainer.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-circle-notch fa-spin"></i> Searching...</div>';
        
        fetch('https://api.datamuse.com/words?rel_syn=' + encodeURIComponent(word))
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    let html = `<div style="font-size:12px; color:#666; margin-bottom:10px;">Synonyms for <strong>${word}</strong>:</div><div style="display:flex; flex-wrap:wrap; gap:8px;">`;
                    data.forEach(item => {
                        html += `<button onclick="window.ThesaurusTool.replaceWord('${item.word.replace(/'/g, "\\'")}')" style="background:#fff; border:1px solid var(--ui-theme-dark); border-radius:15px; padding:5px 12px; color:var(--ui-theme-dark); cursor:pointer; font-size:13px; transition:all 0.2s;" onmouseover="this.style.background='var(--ui-theme-dark)'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='var(--ui-theme-dark)';" title="Click to replace selected text">${item.word}</button>`;
                    });
                    html += `</div>`;
                    resultsContainer.innerHTML = html;
                } else {
                    resultsContainer.innerHTML = `<div style="color:#666; font-size:13px; text-align:center; margin-top:20px;">No synonyms found for "${word}".</div>`;
                }
            })
            .catch(err => {
                resultsContainer.innerHTML = `<div style="color:#e74c3c; font-size:13px; text-align:center; margin-top:20px;">Failed to load thesaurus data.</div>`;
            });
    },

    replaceWord: function(newWord) {
        const sel = window.getSelection();
        if (sel.rangeCount > 0 && !sel.isCollapsed) {
            const range = sel.getRangeAt(0);
            
            // Check if selection is within our editable workspace
            let isEditable = false;
            let node = range.commonAncestorContainer;
            while(node && node !== document.body) {
                if(node.isContentEditable || (node.classList && (node.classList.contains('editable-text') || node.classList.contains('op-table-cell') || node.classList.contains('wa-text-container')))) {
                    isEditable = true;
                    break;
                }
                node = node.parentNode;
            }

            if (isEditable) {
                // Determine original capitalization (basic)
                const originalText = sel.toString();
                if (originalText.length > 0) {
                    const firstChar = originalText.charAt(0);
                    if (firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase()) {
                        // Title case
                        newWord = newWord.charAt(0).toUpperCase() + newWord.slice(1);
                    }
                }
                document.execCommand('insertText', false, newWord);
                return;
            }
        }
        
        // Fallback: Copy to clipboard if no valid selection is active
        navigator.clipboard.writeText(newWord).then(() => {
            DialogSystem.alert('Copied', `"${newWord}" copied to clipboard! (Highlight a word in your text to auto-replace it)`);
        }).catch(() => {});
    }
};

window.flowTextBoxes = function(headBox) {
    if (!headBox) return;
    
    // 1. Gather ALL text in the chain
    let fullTextStr = '';
    let current = headBox;
    let boxes = [];
    while(current) {
        const content = current.querySelector('.text-content') || current.querySelector('div[contenteditable]');
        if (content) {
            let text = content.innerText;
            if (fullTextStr.length > 0 && !/\s$/.test(fullTextStr) && !/^\s/.test(text)) {
                fullTextStr += ' ';
            }
            fullTextStr += text;
            boxes.push({box: current, content: content});
        }
        const nextId = current.getAttribute('data-next-box');
        current = nextId ? document.getElementById(nextId) : null;
    }

    if (boxes.length < 2) return;

    // 2. Remember caret position globally across the chain
    const sel = window.getSelection();
    let globalCaretOffset = -1;
    if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        let offsetAccumulator = 0;
        for (let i = 0; i < boxes.length; i++) {
            if (boxes[i].content.contains(range.commonAncestorContainer)) {
                const preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(boxes[i].content);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                globalCaretOffset = offsetAccumulator + preCaretRange.toString().length;
                break;
            }
            let textLen = boxes[i].content.innerText.length;
            if (i > 0 && !/\s$/.test(boxes[i-1].content.innerText) && !/^\s/.test(boxes[i].content.innerText)) {
                textLen += 1; 
            }
            offsetAccumulator += textLen;
        }
    }

    // 3. Flow text through the boxes (Binary Search with Off-Screen Clone)
    const tokens = fullTextStr.split(/(\s+)/);
    let tokenIndex = 0;
    let targetCaretBox = null;
    let localCaretOffset = 0;
    let charAccumulator = 0;

    const measureContainer = document.createElement('div');
    measureContainer.style.position = 'absolute';
    measureContainer.style.visibility = 'hidden';
    measureContainer.style.pointerEvents = 'none';
    measureContainer.style.left = '-9999px';
    measureContainer.style.top = '-9999px';
    document.body.appendChild(measureContainer);

    for (let i = 0; i < boxes.length; i++) {
        const boxObj = boxes[i];
        
        if (i === boxes.length - 1) {
            // Last box gets all remaining text
            const remaining = tokens.slice(tokenIndex).join('');
            boxObj.content.innerText = remaining;
            
            const boxLength = remaining.length;
            if (globalCaretOffset >= charAccumulator && globalCaretOffset <= charAccumulator + boxLength) {
                targetCaretBox = boxObj.content;
                localCaretOffset = globalCaretOffset - charAccumulator;
            }
            break;
        }
        
        // Clone for invisible measurement
        const clone = boxObj.content.cloneNode(false);
        const computed = window.getComputedStyle(boxObj.content);
        clone.style.width = computed.width;
        clone.style.height = computed.height;
        clone.style.boxSizing = computed.boxSizing;
        clone.style.padding = computed.padding;
        clone.style.font = computed.font;
        clone.style.lineHeight = computed.lineHeight;
        clone.style.wordWrap = computed.wordWrap;
        clone.style.whiteSpace = computed.whiteSpace;
        measureContainer.appendChild(clone);

        const remainingTokens = tokens.slice(tokenIndex);
        let low = 0;
        let high = remainingTokens.length;
        let bestFit = 0;

        clone.innerText = remainingTokens.join('');
        if (clone.scrollHeight <= clone.clientHeight) {
            bestFit = remainingTokens.length;
        } else {
            while (low <= high) {
                let mid = Math.floor((low + high) / 2);
                clone.innerText = remainingTokens.slice(0, mid).join('');
                if (clone.scrollHeight <= clone.clientHeight) {
                    bestFit = mid;
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            }
        }
        
        if (bestFit === 0 && remainingTokens.length > 0) bestFit = 1;
        
        const fittedTokens = remainingTokens.slice(0, bestFit);
        const currentText = fittedTokens.join('');
        boxObj.content.innerText = currentText;
        
        const boxLength = currentText.length;
        if (globalCaretOffset >= charAccumulator && globalCaretOffset <= charAccumulator + boxLength) {
            targetCaretBox = boxObj.content;
            localCaretOffset = globalCaretOffset - charAccumulator;
        }
        
        charAccumulator += boxLength;
        tokenIndex += bestFit;
        measureContainer.innerHTML = ''; // clear for next loop
    }
    
    document.body.removeChild(measureContainer);

    // 4. Restore caret
    if (targetCaretBox && globalCaretOffset !== -1) {
        const walker = document.createTreeWalker(targetCaretBox, NodeFilter.SHOW_TEXT, null, false);
        let node;
        let currentOffset = 0;
        let set = false;
        while ((node = walker.nextNode())) {
            const len = node.nodeValue.length;
            if (currentOffset + len >= localCaretOffset) {
                const newRange = document.createRange();
                let nodeOffset = localCaretOffset - currentOffset;
                if (nodeOffset > node.nodeValue.length) nodeOffset = node.nodeValue.length;
                if (nodeOffset < 0) nodeOffset = 0;
                
                newRange.setStart(node, nodeOffset);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
                set = true;
                break;
            }
            currentOffset += len;
        }
        if (!set && targetCaretBox.childNodes.length > 0) {
            const newRange = document.createRange();
            newRange.selectNodeContents(targetCaretBox);
            newRange.collapse(false);
            sel.removeAllRanges();
            sel.addRange(newRange);
        }
        targetCaretBox.focus();
    }
};

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







