

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

window.showOptionsModal = function() {
    const autoHyphenate = localStorage.getItem('opub_autoHyphenate') === 'true';
    const username = localStorage.getItem('opub_username') || 'Publisher User';
    const spellcheck = localStorage.getItem('opub_spellcheck') !== 'false';
    
    const tabs = ['General', 'Proofing', 'Save', 'Language', 'Advanced', 'Customize Ribbon', 'Trust Center'];
    
    let tabsHtml = '';
    let contentsHtml = '';
    
    tabs.forEach((tab) => {
        const id = tab.toLowerCase().replace(' ', '-');
        const isActive = tab === 'General'; // Start with General tab open
        
        tabsHtml += `
            <div id="opt-tab-${id}" class="opt-tab" onclick="switchOptionsTab('${id}')" 
                 onmouseover="if(this.style.background !== 'rgb(240, 240, 240)' && this.style.background !== '#f0f0f0') this.style.background='#f9f9f9'" 
                 onmouseout="if(this.style.fontWeight !== 'bold') this.style.background='transparent'"
                 style="padding: 10px 15px; cursor: pointer; border-left: 3px solid ${isActive ? 'var(--ui-theme-color)' : 'transparent'}; 
                 color: #444; background: ${isActive ? '#f0f0f0' : 'transparent'}; font-weight: ${isActive ? 'bold' : 'normal'}; transition: background 0.2s;">
                ${tab}
            </div>
        `;
        
        let tabContent = '';
        if (tab === 'General') {
            tabContent = `
                <strong style="display: block; margin-bottom: 8px;">User Interface options</strong>
                <label style="display: flex; align-items: center; margin-top: 10px; opacity: 0.6; cursor: not-allowed;">
                    <input type="checkbox" disabled style="margin-right: 10px;">
                    Show the Start screen when this application starts <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span>
                </label>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <strong style="display: block; margin-bottom: 8px;">Personalize your copy of Publisher</strong>
                <div style="margin-top: 10px; display: flex; align-items: center;">
                    <span style="margin-right: 15px; width: 100px;">User name:</span>
                    <input type="text" id="opt-username" value="${username}" style="padding: 5px; border: 1px solid #ccc; border-radius: 3px; width: 200px;">
                </div>
                <div style="margin-top: 15px; display: flex; align-items: center;">
                    <span style="margin-right: 15px; width: 100px;">UI Theme:</span>
                    <div class="modern-select" onclick="toggleThemeDropdown(this); event.stopPropagation();" style="width: 200px; height: 26px;">
                        <span id="opt-theme">${localStorage.getItem('opub_ui_theme') || 'Publisher / Classic (Teal)'}</span>
                        <div class="arrow-box"><i class="fas fa-chevron-down" style="font-size:10px;"></i></div>
                    </div>
                </div>
            `;
        } else if (tab === 'Proofing') {
            tabContent = `
                <strong style="display: block; margin-bottom: 8px;">AutoCorrect options</strong>
                <button class="btn-secondary" disabled style="opacity: 0.6; cursor: not-allowed;">AutoCorrect Options... <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span></button>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <strong style="display: block; margin-bottom: 8px;">When correcting spelling in Publisher</strong>
                <label style="display: flex; align-items: center; margin-top: 10px; cursor: pointer;">
                    <input type="checkbox" id="opt-spellcheck" ${spellcheck ? 'checked' : ''} style="margin-right: 10px;">
                    Check spelling as you type
                </label>
                <label style="display: flex; align-items: center; margin-top: 10px; opacity: 0.6; cursor: not-allowed;">
                    <input type="checkbox" disabled style="margin-right: 10px;">
                    Mark grammar errors as you type <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span>
                </label>
            `;
        } else if (tab === 'Save') {
            tabContent = `
                <strong style="display: block; margin-bottom: 8px;">Save documents</strong>
                <label style="display: flex; align-items: center; margin-top: 10px; opacity: 0.6; cursor: not-allowed;">
                    <input type="checkbox" checked disabled style="margin-right: 10px;">
                    Save AutoRecover information every <input type="number" value="10" disabled style="width: 40px; margin: 0 5px; border: 1px solid #ccc; border-radius: 3px;"> minutes <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span>
                </label>
                <div style="margin-top: 15px; opacity: 0.6;">
                    <span style="margin-right: 15px; display: block; margin-bottom: 5px;">Default local file location:</span>
                    <input type="text" value="C:\\Users\\Publisher\\Documents" disabled style="padding: 5px; border: 1px solid #ccc; border-radius: 3px; width: 100%; max-width: 300px; cursor: not-allowed;">
                    <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span>
                </div>
            `;
        } else if (tab === 'Language') {
            tabContent = `
                <strong style="display: block; margin-bottom: 8px;">Office display language</strong>
                <p style="font-size: 12px; color: #666; margin-top: 0;">Set the language priority order for the buttons, tabs and help.</p>
                <select disabled style="padding: 5px; border: 1px solid #ccc; border-radius: 3px; width: 100%; max-width: 300px; margin-top: 10px; opacity: 0.6; cursor: not-allowed;">
                    <option>English (United States) &lt;default&gt;</option>
                </select>
                <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span>
            `;
        } else if (tab === 'Advanced') {
            tabContent = `
                <strong style="display: block; margin-bottom: 8px;">Text Formatting</strong>
                <label style="display: flex; align-items: center; margin-top: 10px; cursor: pointer;">
                    <input type="checkbox" id="opt-autohyphenate" ${autoHyphenate ? 'checked' : ''} style="margin-right: 10px;">
                    Automatically hyphenate in new text boxes
                </label>
                <p style="font-size: 11px; color: #666; margin-left: 23px; margin-top: 4px;">Applies to any newly created text box or newsletter block.</p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <strong style="display: block; margin-bottom: 8px;">Display</strong>
                <div style="margin-top: 10px; opacity: 0.6; display: flex; align-items: center;">
                    <span style="margin-right: 15px;">Show measurements in units of:</span>
                    <select disabled style="padding: 5px; border: 1px solid #ccc; border-radius: 3px; cursor: not-allowed;">
                        <option>Inches</option>
                        <option>Centimeters</option>
                        <option>Pixels</option>
                    </select>
                    <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span>
                </div>
            `;
        } else if (tab === 'Customize Ribbon') {
            tabContent = `
                <strong style="display: block; margin-bottom: 8px;">Customize the Ribbon</strong>
                <div style="display: flex; gap: 20px; margin-top: 10px; opacity: 0.6;">
                    <div style="flex: 1; border: 1px solid #ccc; height: 150px; border-radius: 3px; background: #fafafa; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #888;">
                        List of Commands
                    </div>
                    <div style="flex: 1; border: 1px solid #ccc; height: 150px; border-radius: 3px; background: #fafafa; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #888;">
                        Ribbon Tabs
                    </div>
                </div>
                <p style="color: #d9534f; font-size: 11px; font-weight: bold; text-align: center; margin-top: 10px;">(Drag & Drop Customization Coming Soon)</p>
            `;
        } else if (tab === 'Trust Center') {
            tabContent = `
                <strong style="display: block; margin-bottom: 8px;">Protecting your privacy</strong>
                <p style="font-size: 12px; color: #666; margin-top: 0;">Trust Center contains security and privacy settings. These settings help keep your computer secure.</p>
                <button class="btn-secondary" disabled style="opacity: 0.6; cursor: not-allowed; margin-top: 10px;">Trust Center Settings... <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span></button>
            `;
        }
        
        contentsHtml += `
            <div id="opt-content-${id}" class="opt-content" style="display: ${isActive ? 'block' : 'none'};">
                <h3 style="margin-top: 0; margin-bottom: 25px;">${tab}</h3>
                ${tabContent}
            </div>
        `;
    });
    
    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; display: flex; height: 380px; width: 650px;">
        <div style="width: 170px; border-right: 1px solid #ddd; padding: 15px 0; overflow-y: auto;">
            ${tabsHtml}
        </div>
        <div style="flex-grow: 1; padding: 20px; overflow-y: auto;">
            ${contentsHtml}
        </div>
    </div>
    `;
    DialogSystem.show('Options', html, () => {
        saveGlobalOptions(true);
    }, false, 'OK', () => {
        saveGlobalOptions(false);
    });
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

window.showPagePartsModal = function() {
    const html = `
    <style>
    .pp-card { cursor: pointer; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 8px; text-align: center; background: #ffffff; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .pp-card:hover { transform: translateY(-2px); border-color: var(--ui-theme-color); box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
    .pp-card-title { display: block; color: #1e293b; font-size: 12px; font-weight: 600; margin-bottom: 2px; }
    .pp-card-desc { font-size: 10px; color: #64748b; line-height: 1.2; display: block; }
    .pp-preview-container { height: 45px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
    .pp-scroll::-webkit-scrollbar { width: 6px; }
    .pp-scroll::-webkit-scrollbar-track { background: transparent; }
    .pp-scroll::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.2); border-radius: 10px; }
    </style>
    <div style="padding: 0px; font-family: 'Inter', system-ui, sans-serif;">
        <div style="background: linear-gradient(135deg, var(--ui-theme-color), var(--ui-theme-dark)); border-radius: 0 0 12px 12px; padding: 15px; color: white; text-align: center; margin: -20px -20px 15px -20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 2px 0; font-size: 18px; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">Page Parts Library</h2>
            <p style="margin: 0; font-size: 12px; opacity: 0.9;">Click to drop pre-designed structural elements into your publication.</p>
        </div>
        <div class="pp-scroll" style="max-height: 50vh; overflow-y: auto; overflow-x: hidden; padding-right: 5px; margin-right: -5px;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
            <!-- Sidebar -->
            <div class="pp-card" onclick="insertPagePart('sidebar')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.65); transform-origin: center;">
                        <div style="width: 40px; height: 90px; background:var(--ui-theme-color); border-radius:4px; opacity:0.8;"></div>
                    </div>
                </div>
                <span class="pp-card-title">Sidebar</span>
                <span class="pp-card-desc">Colored side-content block.</span>
            </div>
            
            <!-- Pull Quote -->
            <div class="pp-card" onclick="insertPagePart('pullquote')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width: 80px; height: 40px; border-top:3px solid var(--ui-theme-color); border-bottom:3px solid var(--ui-theme-color); display:flex; align-items:center; justify-content:center;">
                            <span style="font-family:'Playfair Display',serif; font-style:italic; color:var(--ui-theme-color); font-size:12px;">"Quote"</span>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Pull Quote</span>
                <span class="pp-card-desc">Bordered text highlighting.</span>
            </div>
            
            <!-- Heading -->
            <div class="pp-card" onclick="insertPagePart('heading')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width: 90px; height: 30px; border-bottom:3px solid var(--ui-theme-color); text-align:left; display:flex; flex-direction:column; justify-content:flex-end; gap:4px;">
                            <div style="width:70%; height:8px; background:var(--ui-theme-dark);"></div>
                            <div style="width:40%; height:4px; background:#999; margin-bottom:4px;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Heading</span>
                <span class="pp-card-desc">Pre-styled section header.</span>
            </div>
            
            <!-- Callout -->
            <div class="pp-card" onclick="insertPagePart('callout')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width: 80px; height: 50px; border-left:4px solid var(--ui-theme-color); background:#f0f0f0;"></div>
                    </div>
                </div>
                <span class="pp-card-title">Info Callout</span>
                <span class="pp-card-desc">Boxed highlight for notes.</span>
            </div>
            
            <!-- Contact -->
            <div class="pp-card" onclick="insertPagePart('contact')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width: 100px; height: 20px; border-top:2px solid #ccc; display:flex; justify-content:space-between; padding-top:5px;">
                            <div style="width:20%; height:4px; background:#999;"></div><div style="width:20%; height:4px; background:#999;"></div><div style="width:20%; height:4px; background:#999;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Contact Block</span>
                <span class="pp-card-desc">Footer with phone slots.</span>
            </div>

            <!-- Step -->
            <div class="pp-card" onclick="insertPagePart('step')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
                            <div style="width:20px; height:20px; border-radius:50%; background:var(--ui-theme-color);"></div>
                            <div style="width:50px; height:4px; background:#999;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Step (Left)</span>
                <span class="pp-card-desc">List item with left number.</span>
            </div>
            
            <!-- Step Right -->
            <div class="pp-card" onclick="insertPagePart('step-right')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
                            <div style="width:50px; height:4px; background:#999;"></div>
                            <div style="width:20px; height:20px; border-radius:50%; background:var(--ui-theme-color);"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Step (Right)</span>
                <span class="pp-card-desc">List item with right number.</span>
            </div>

            <!-- Tear-off Coupon -->
            <div class="pp-card" onclick="insertPagePart('tear-off')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width: 80px; height: 40px; border:2px dashed var(--ui-theme-color); display:flex; align-items:center; justify-content:center;">
                            <div style="width:40%; height:4px; background:var(--ui-theme-dark);"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Coupon</span>
                <span class="pp-card-desc">Dashed box for offers.</span>
            </div>

            <!-- Author Bio -->
            <div class="pp-card" onclick="insertPagePart('bio')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
                            <div style="width:30px; height:30px; border-radius:50%; background:#e0e0e0;"></div>
                            <div style="width:40px;">
                                <div style="height:4px; background:var(--ui-theme-dark); margin-bottom:4px;"></div>
                                <div style="height:3px; background:#999;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Author Bio</span>
                <span class="pp-card-desc">Avatar and credentials.</span>
            </div>

            <!-- Checklist -->
            <div class="pp-card" onclick="insertPagePart('checklist')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
                            <div style="width:16px; height:16px; border-radius:50%; background:#4CAF50; color:#fff; display:flex; align-items:center; justify-content:center; font-size:10px;">✓</div>
                            <div style="width:60px; height:4px; background:#999;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Checklist Item</span>
                <span class="pp-card-desc">Green checkmark line.</span>
            </div>

            <!-- Menu Item -->
            <div class="pp-card" onclick="insertPagePart('menu-item')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px;">
                            <div style="display:flex; align-items:flex-end; gap:5px; width:80px;">
                                <div style="width:30px; height:4px; background:var(--ui-theme-dark);"></div>
                                <div style="flex-grow:1; border-bottom:2px dotted #ccc;"></div>
                                <div style="width:15px; height:4px; background:var(--ui-theme-color);"></div>
                            </div>
                            <div style="width:80px; height:3px; background:#ccc; opacity:0.5;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Menu Item</span>
                <span class="pp-card-desc">Title, dotted line, price.</span>
            </div>

            <!-- Photo Block -->
            <div class="pp-card" onclick="insertPagePart('photo-block')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width: 70px; height: 60px; border:1px solid #ddd; background:#f9f9f9; padding:5px; box-sizing:border-box;">
                            <div style="width:100%; height:35px; background:#e0e0e0; margin-bottom:5px;"></div>
                            <div style="width:80%; height:3px; background:#ccc; margin:0 auto;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Photo Block</span>
                <span class="pp-card-desc">Placeholder and caption.</span>
            </div>
            
            <!-- Review -->
            <div class="pp-card" onclick="insertPagePart('review')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="color:#FFD700; font-size:16px; letter-spacing:1px; margin-bottom:5px; text-align:center;">★★★★★</div>
                        <div style="width:60px; height:4px; background:#ccc; margin:0 auto 4px auto;"></div>
                        <div style="width:40px; height:3px; background:#eee; margin:0 auto;"></div>
                    </div>
                </div>
                <span class="pp-card-title">Review Quote</span>
                <span class="pp-card-desc">5-star rating layout.</span>
            </div>
            
            <!-- Event Date -->
            <div class="pp-card" onclick="insertPagePart('event-date')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div style="width:30px; height:30px; border:2px solid var(--ui-theme-color); border-radius:4px; display:flex; flex-direction:column; overflow:hidden;">
                                <div style="height:10px; background:var(--ui-theme-color);"></div>
                                <div style="flex-grow:1; background:#fff;"></div>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:3px;">
                                <div style="width:40px; height:4px; background:var(--ui-theme-dark);"></div>
                                <div style="width:60px; height:3px; background:#ccc;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Event Date</span>
                <span class="pp-card-desc">Calendar badge block.</span>
            </div>
            
            <!-- Stat Block -->
            <div class="pp-card" onclick="insertPagePart('stat')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                            <div style="font-size:24px; font-weight:bold; color:var(--ui-theme-color); line-height:1;">99%</div>
                            <div style="width:20px; height:2px; background:var(--ui-theme-dark);"></div>
                            <div style="width:40px; height:3px; background:#ccc;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Stat Callout</span>
                <span class="pp-card-desc">Large highlighted number.</span>
            </div>
            
            <!-- Signature -->
            <div class="pp-card" onclick="insertPagePart('signature')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; flex-direction:column; align-items:center; gap:4px; width:80px;">
                            <div style="display:flex; align-items:flex-end; width:100%; gap:4px;">
                                <span style="font-size:12px; font-weight:bold; color:var(--ui-theme-dark);">X</span>
                                <div style="flex-grow:1; border-bottom:1px solid #333; margin-bottom:2px;"></div>
                            </div>
                            <div style="width:60px; height:3px; background:#ccc;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Signature Line</span>
                <span class="pp-card-desc">Sign-here dotted line.</span>
            </div>
            
            <!-- Pros/Cons -->
            <div class="pp-card" onclick="insertPagePart('pros-cons')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.6); transform-origin: center;">
                        <div style="display:flex; gap:10px;">
                            <div style="border:2px solid #4CAF50; width:30px; height:40px; border-radius:4px; padding:4px; display:flex; flex-direction:column; gap:4px;">
                                <div style="width:10px; height:3px; background:#4CAF50;"></div>
                                <div style="width:20px; height:2px; background:#ccc;"></div>
                                <div style="width:20px; height:2px; background:#ccc;"></div>
                            </div>
                            <div style="border:2px solid #F44336; width:30px; height:40px; border-radius:4px; padding:4px; display:flex; flex-direction:column; gap:4px;">
                                <div style="width:10px; height:3px; background:#F44336;"></div>
                                <div style="width:20px; height:2px; background:#ccc;"></div>
                                <div style="width:20px; height:2px; background:#ccc;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Pros & Cons</span>
                <span class="pp-card-desc">Two-column list layout.</span>
            </div>
            
            <!-- Q&A Block -->
            <div class="pp-card" onclick="insertPagePart('qa-block')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <div style="display:flex; align-items:flex-start; gap:4px;">
                                <span style="font-weight:bold; color:var(--ui-theme-color); font-size:12px;">Q</span>
                                <div style="width:50px; height:3px; background:var(--ui-theme-dark); margin-top:4px;"></div>
                            </div>
                            <div style="display:flex; align-items:flex-start; gap:4px;">
                                <span style="font-weight:bold; color:#888; font-size:12px;">A</span>
                                <div style="width:60px; height:3px; background:#ccc; margin-top:4px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Q&A Block</span>
                <span class="pp-card-desc">Question and Answer list.</span>
            </div>
            
            <!-- Key Takeaway -->
            <div class="pp-card" onclick="insertPagePart('takeaway')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width:70px; height:40px; background:#f5f5f5; border-left:4px solid var(--ui-theme-color); border-radius:4px; padding:6px; box-sizing:border-box;">
                            <div style="width:30px; height:3px; background:var(--ui-theme-color); margin-bottom:6px;"></div>
                            <div style="width:50px; height:3px; background:#999; margin-bottom:4px;"></div>
                            <div style="width:40px; height:3px; background:#999;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Key Takeaway</span>
                <span class="pp-card-desc">Tinted summary box.</span>
            </div>
            
            <!-- Warning Alert -->
            <div class="pp-card" onclick="insertPagePart('warning')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width:80px; height:35px; border:1px solid #FF9800; background:#FFF3E0; border-radius:4px; display:flex; align-items:center; padding:4px; gap:6px; box-sizing:border-box;">
                            <div style="color:#FF9800; font-size:14px; font-weight:bold;">⚠</div>
                            <div style="display:flex; flex-direction:column; gap:3px;">
                                <div style="width:20px; height:3px; background:#E65100;"></div>
                                <div style="width:30px; height:2px; background:#FFB74D;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Warning Alert</span>
                <span class="pp-card-desc">Orange caution banner.</span>
            </div>
            </div>
        </div>
    </div>
    `;
    if (typeof DialogSystem !== 'undefined') {
        DialogSystem.show('Insert Page Part', html, null, true);
    }
};

window.insertPagePart = function(type) {
    if (typeof DialogSystem !== 'undefined') DialogSystem.close();
    
    let htmlContent = '';
    let w = 200, h = 200;
    
    if (type === 'sidebar') {
        w = 250; h = 600;
        htmlContent = `<div style="padding:20px; height:100%; box-sizing:border-box; background:var(--pub-color); color:#fff; overflow:hidden;" contenteditable="true">
            <h2 style="margin-top:0; border-bottom: 2px solid rgba(255,255,255,0.5); padding-bottom:10px; font-family:inherit; font-weight:bold;">Sidebar Title</h2>
            <p style="font-size:14px; line-height:1.6; font-family:inherit;">Use this space to highlight key information, related links, or a brief summary. This sidebar is designed to snap to the edge of your page and draw the reader's eye to important secondary details.</p>
        </div>`;
    } else if (type === 'pullquote') {
        w = 350; h = 180;
        htmlContent = `<div style="height:100%; box-sizing:border-box; border-top: 3px solid var(--pub-color); border-bottom: 3px solid var(--pub-color); display:flex; align-items:center; justify-content:center; padding: 10px;">
            <div style="width:100%; text-align:center; font-family: 'Playfair Display', Georgia, serif; font-style:italic; font-size: 24px; color:var(--pub-color); line-height: 1.4;" contenteditable="true">
                "This is an impactful pull quote that draws the reader's attention to a critical point in your publication."
            </div>
        </div>`;
    } else if (type === 'heading') {
        w = 500; h = 100;
        htmlContent = `<div style="padding:10px; height:100%; box-sizing:border-box; border-bottom: 4px solid var(--pub-color);" contenteditable="true">
            <h1 style="margin:0; font-size:36px; color:var(--ui-theme-dark); font-family: inherit; font-weight:bold;">Main Heading Title</h1>
            <p style="margin:5px 0 0 0; font-size:16px; color:#555; font-family:inherit; font-style:italic;">A brief subtitle goes here to provide context for the section below.</p>
        </div>`;
    } else if (type === 'callout') {
        w = 300; h = 150;
        htmlContent = `<div style="height:100%; box-sizing:border-box; border-left: 6px solid var(--pub-color); background: rgba(0,0,0,0.04); padding: 20px 15px;" contenteditable="true">
            <h3 style="margin:0 0 5px 0; color:var(--pub-color); font-family:inherit; font-size:18px;">Important Note</h3>
            <p style="margin:0; font-size:14px; color:#444; font-family:inherit; line-height: 1.5;">This callout box is perfect for highlighting tips, warnings, or secondary information that shouldn't be missed.</p>
        </div>`;
    } else if (type === 'contact') {
        w = 400; h = 80;
        htmlContent = `<div style="height:100%; box-sizing:border-box; border-top: 2px solid #ccc; padding-top: 15px; display:flex; justify-content:space-between; font-size:14px; font-family:inherit; color:#555;" contenteditable="true">
            <div><strong>Phone:</strong> (555) 123-4567</div>
            <div><strong>Email:</strong> hello@example.com</div>
            <div><strong>Web:</strong> www.example.com</div>
        </div>`;
    } else if (type === 'step') {
        w = 300; h = 120;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; align-items:flex-start; gap: 15px;">
            <div style="width:40px; height:40px; background:var(--pub-color); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:bold; flex-shrink:0;">1</div>
            <div style="padding-top:2px;" contenteditable="true">
                <h3 style="margin:0 0 5px 0; color:var(--ui-theme-dark); font-family:inherit; font-size:18px;">Step One</h3>
                <p style="margin:0; font-size:14px; color:#444; font-family:inherit; line-height:1.5;">Describe the first step of your process here. Keep it concise and clear.</p>
            </div>
        </div>`;
    } else if (type === 'step-right') {
        w = 300; h = 120;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; align-items:flex-start; gap: 15px; text-align:right;">
            <div style="padding-top:2px;" contenteditable="true">
                <h3 style="margin:0 0 5px 0; color:var(--ui-theme-dark); font-family:inherit; font-size:18px;">Step Two</h3>
                <p style="margin:0; font-size:14px; color:#444; font-family:inherit; line-height:1.5;">Describe the next step of your process here. Keep it concise and clear.</p>
            </div>
            <div style="width:40px; height:40px; background:var(--pub-color); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:bold; flex-shrink:0;">2</div>
        </div>`;
    } else if (type === 'tear-off') {
        w = 300; h = 150;
        htmlContent = `<div style="height:100%; box-sizing:border-box; border: 3px dashed var(--pub-color); padding: 20px; text-align:center; background:#fff;" contenteditable="true">
            <h2 style="margin:0 0 10px 0; color:var(--ui-theme-dark); font-family:inherit; text-transform:uppercase; font-weight:bold; font-size:24px;">20% OFF</h2>
            <p style="margin:0; font-size:14px; color:#555; font-family:inherit; line-height:1.4;">Present this coupon at checkout to receive your discount. Valid until the end of the month.</p>
        </div>`;
    } else if (type === 'bio') {
        w = 350; h = 120;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; align-items:center; gap: 20px; border-top:1px solid #ddd; border-bottom:1px solid #ddd; padding: 15px 0;">
            <div style="width:70px; height:70px; background:#e0e0e0; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:#999; font-size:24px; font-family:inherit;">User</div>
            <div contenteditable="true">
                <h3 style="margin:0 0 5px 0; color:var(--ui-theme-dark); font-family:inherit; font-size:18px;">Author Name</h3>
                <p style="margin:0; font-size:13px; color:#555; font-family:inherit; line-height:1.4;">Author bio goes here. A short description of the writer's background and expertise.</p>
            </div>
        </div>`;
    } else if (type === 'checklist') {
        w = 300; h = 60;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; align-items:center; gap: 15px;">
            <div style="width:24px; height:24px; background:#4CAF50; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0;">✓</div>
            <div contenteditable="true" style="font-size:16px; color:#333; font-family:inherit;">Checklist item goes right here</div>
        </div>`;
    } else if (type === 'menu-item') {
        w = 350; h = 60;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; flex-direction:column; justify-content:center;" contenteditable="true">
            <div style="display:flex; align-items:center; gap: 10px; margin-bottom:5px;">
                <h3 style="margin:0; font-size:18px; color:var(--ui-theme-dark); font-family:inherit; white-space:nowrap;">Menu Item Name</h3>
                <div style="flex-grow:1; height:0; border-top:3px dotted #ccc; margin-top:10px;"></div>
                <strong style="font-size:18px; color:var(--pub-color); font-family:inherit; white-space:nowrap;">$12</strong>
            </div>
            <p style="margin:0; font-size:13px; color:#666; font-family:inherit; font-style:italic;">A brief description of the menu item ingredients.</p>
        </div>`;
    } else if (type === 'photo-block') {
        w = 300; h = 250;
        htmlContent = `<div style="height:100%; box-sizing:border-box; padding:10px; background:#f9f9f9; border:1px solid #ddd;">
            <div style="width:100%; height:180px; background:#e0e0e0; display:flex; align-items:center; justify-content:center; color:#999; margin-bottom:10px; font-family:inherit;">[ Photo Placeholder ]</div>
            <div contenteditable="true" style="text-align:center; font-size:13px; color:#555; font-style:italic; font-family:inherit;">Type your photo caption here</div>
        </div>`;
    } else if (type === 'review') {
        w = 300; h = 100;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;" contenteditable="true">
            <div style="color:#FFD700; font-size:24px; letter-spacing:2px; margin-bottom:5px; pointer-events:none; user-select:none;">★★★★★</div>
            <h4 style="margin:0 0 5px 0; color:var(--ui-theme-dark); font-family:inherit; font-size:16px; font-style:italic;">"Absolutely fantastic service!"</h4>
            <span style="font-size:12px; color:#666; font-family:inherit; text-transform:uppercase;">- Jane Doe, Customer</span>
        </div>`;
    } else if (type === 'event-date') {
        w = 350; h = 100;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; align-items:center; gap:20px; padding:15px; border:1px solid #eee; background:#fff;">
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; border:2px solid var(--pub-color); border-radius:8px; width:70px; height:70px; flex-shrink:0; overflow:hidden;">
                <div style="background:var(--pub-color); color:white; width:100%; text-align:center; font-size:12px; font-weight:bold; padding:4px 0; text-transform:uppercase;">OCT</div>
                <div style="font-size:28px; font-weight:bold; color:var(--ui-theme-dark); margin-top:2px;">24</div>
            </div>
            <div contenteditable="true">
                <h3 style="margin:0 0 5px 0; color:var(--ui-theme-dark); font-family:inherit; font-size:18px;">Annual Gala Dinner</h3>
                <p style="margin:0; font-size:13px; color:#555; font-family:inherit;">Join us at 7:00 PM for an evening of celebration and networking.</p>
            </div>
        </div>`;
    } else if (type === 'stat') {
        w = 200; h = 150;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:10px;" contenteditable="true">
            <div style="font-size:48px; font-weight:bold; color:var(--pub-color); font-family:inherit; line-height:1;">99<span style="font-size:24px;">%</span></div>
            <div style="width:40px; height:3px; background:var(--ui-theme-dark); margin:10px auto;"></div>
            <p style="margin:0; font-size:14px; color:#444; font-family:inherit;">Customer satisfaction rate over the last year.</p>
        </div>`;
    } else if (type === 'signature') {
        w = 300; h = 80;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; flex-direction:column; justify-content:flex-end; padding-bottom:10px;">
            <div style="display:flex; align-items:flex-end;">
                <span style="font-size:16px; font-family:inherit; color:var(--ui-theme-dark); margin-right:5px; font-weight:bold;">X</span>
                <div style="flex-grow:1; border-bottom:2px solid #333; height:0; margin-bottom:4px;"></div>
            </div>
            <div style="text-align:center; font-size:12px; color:#666; font-family:inherit; margin-top:5px; text-transform:uppercase; letter-spacing:1px;" contenteditable="true">Authorized Signature</div>
        </div>`;
    } else if (type === 'pros-cons') {
        w = 400; h = 150;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; gap:20px; font-family:inherit;">
            <div style="flex:1; border:1px solid #4CAF50; border-radius:8px; padding:15px; background:rgba(76, 175, 80, 0.05);" contenteditable="true">
                <h3 style="margin:0 0 10px 0; color:#4CAF50; font-size:16px;">Pros</h3>
                <ul style="margin:0; padding-left:20px; font-size:13px; color:#333;">
                    <li style="margin-bottom:5px;">Advantage one</li>
                    <li>Advantage two</li>
                </ul>
            </div>
            <div style="flex:1; border:1px solid #F44336; border-radius:8px; padding:15px; background:rgba(244, 67, 54, 0.05);" contenteditable="true">
                <h3 style="margin:0 0 10px 0; color:#F44336; font-size:16px;">Cons</h3>
                <ul style="margin:0; padding-left:20px; font-size:13px; color:#333;">
                    <li style="margin-bottom:5px;">Disadvantage one</li>
                    <li>Disadvantage two</li>
                </ul>
            </div>
        </div>`;
    } else if (type === 'qa-block') {
        w = 350; h = 120;
        htmlContent = `<div style="height:100%; box-sizing:border-box; font-family:inherit; padding:10px;" contenteditable="true">
            <div style="display:flex; align-items:flex-start; gap:10px; margin-bottom:10px;">
                <strong style="color:var(--pub-color); font-size:18px;">Q.</strong>
                <strong style="font-size:16px; color:var(--ui-theme-dark); padding-top:2px;">What is the most frequently asked question?</strong>
            </div>
            <div style="display:flex; align-items:flex-start; gap:10px;">
                <strong style="color:#888; font-size:18px;">A.</strong>
                <p style="margin:0; font-size:14px; color:#444; padding-top:2px; line-height:1.4;">The answer goes here. Keep it concise, helpful, and directly to the point.</p>
            </div>
        </div>`;
    } else if (type === 'takeaway') {
        w = 350; h = 100;
        htmlContent = `<div style="height:100%; box-sizing:border-box; border-radius:8px; background:linear-gradient(to right, rgba(0,0,0,0.05), rgba(0,0,0,0.02)); padding:15px 20px; border-left:4px solid var(--pub-color); font-family:inherit; display:flex; flex-direction:column; justify-content:center;" contenteditable="true">
            <div style="font-size:12px; font-weight:bold; color:var(--pub-color); text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">Key Takeaway</div>
            <div style="font-size:15px; color:#333; font-style:italic; line-height:1.4;">Summarize the most critical point or actionable advice for the reader right here.</div>
        </div>`;
    } else if (type === 'warning') {
        w = 350; h = 100;
        htmlContent = `<div style="height:100%; box-sizing:border-box; border:1px solid #FF9800; background:#FFF3E0; border-radius:8px; padding:15px; display:flex; align-items:center; gap:15px; font-family:inherit;" contenteditable="true">
            <div style="color:#FF9800; font-size:24px; font-weight:bold; flex-shrink:0;">⚠</div>
            <div>
                <h4 style="margin:0 0 4px 0; color:#E65100; font-size:16px;">Warning</h4>
                <p style="margin:0; font-size:13px; color:#555; line-height:1.4;">Please read carefully before proceeding with the next steps.</p>
            </div>
        </div>`;
    }
    
    const el = createWrapper(htmlContent);
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    
    // Center it
    const paperW = parseFloat(paper.style.width) || 794;
    const paperH = parseFloat(paper.style.height) || 1123;
    el.style.left = ((paperW / 2) - (w / 2)) + 'px';
    el.style.top = ((paperH / 2) - (h / 2)) + 'px';
    
    if (typeof selectElement === 'function') selectElement(el);
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
window.tabDialog = {
    tabs: [],
    
    open: function() {
        if (!window._activeIndentBlock) {
            DialogSystem.alert('Notice', 'Please select a text box and click inside a paragraph first to set tabs for that paragraph.');
            return;
        }
        
        const rawTabs = window._activeIndentBlock.getAttribute('data-tabs');
        this.tabs = rawTabs ? JSON.parse(rawTabs) : [];
        
        const html = `
            <div style="width: 380px; font-size: 13px;">
                <p style="font-size: 12px; color: #555; margin-top: 0; margin-bottom: 15px; line-height: 1.4;">
                    <strong>What are Tabs?</strong> Tabs allow you to align text precisely across the page. Double-click the ruler to set a stop, choose an alignment, and optionally add a leader line (like dots or dashes).
                </p>
                <div style="display: flex; gap: 15px;">
                    <div style="flex: 1;">
                        <label style="font-weight: bold; margin-bottom: 5px; display: block;">Tab stop position:</label>
                        <input type="text" id="tab-position-input" value="100" style="width: 100%; box-sizing: border-box; margin-bottom: 8px; padding: 4px; border: 1px solid #999;">
                        <select id="tab-list" size="8" style="width: 100%; box-sizing: border-box; height: 120px; border: 1px solid #999;"></select>
                    </div>
                    <div style="flex: 1;">
                        <fieldset style="margin-bottom: 10px; border: 1px solid #ccc; padding: 5px 10px;">
                            <legend style="padding: 0 5px; color: #555;">Alignment</legend>
                            <label style="display: block; margin-bottom: 4px;"><input type="radio" name="tab-align" value="left" style="accent-color: var(--ui-theme-color);" checked> Left</label>
                            <label style="display: block; margin-bottom: 4px;"><input type="radio" name="tab-align" value="center" style="accent-color: var(--ui-theme-color);"> Center</label>
                            <label style="display: block; margin-bottom: 4px;"><input type="radio" name="tab-align" value="right" style="accent-color: var(--ui-theme-color);"> Right</label>
                            <label style="display: block;"><input type="radio" name="tab-align" value="decimal" style="accent-color: var(--ui-theme-color);"> Decimal</label>
                        </fieldset>
                        <fieldset style="border: 1px solid #ccc; padding: 5px 10px;">
                            <legend style="padding: 0 5px; color: #555;">Leader</legend>
                            <label style="display: block; margin-bottom: 4px;"><input type="radio" name="tab-leader" value="none" style="accent-color: var(--ui-theme-color);" checked> 1 None</label>
                            <label style="display: block; margin-bottom: 4px;"><input type="radio" name="tab-leader" value="dotted" style="accent-color: var(--ui-theme-color);"> 2 .......</label>
                            <label style="display: block; margin-bottom: 4px;"><input type="radio" name="tab-leader" value="dashed" style="accent-color: var(--ui-theme-color);"> 3 -------</label>
                            <label style="display: block;"><input type="radio" name="tab-leader" value="solid" style="accent-color: var(--ui-theme-color);"> 4 _______</label>
                        </fieldset>
                    </div>
                </div>
                <div style="margin-top: 15px; text-align: right;">
                    <button class="btn-secondary" onclick="window.tabDialog.setTab()" style="padding: 4px 10px;">Set</button>
                    <button class="btn-secondary" onclick="window.tabDialog.clearTab()" style="padding: 4px 10px;">Clear</button>
                    <button class="btn-secondary" onclick="window.tabDialog.clearAllTabs()" style="padding: 4px 10px;">Clear All</button>
                </div>
                <div style="margin-top: 10px; font-size: 11px; color: #666; font-style: italic;">
                    Note: After configuring, press the 'Tab' key inside the text box to jump to these stops.
                </div>
            </div>
        `;
        
        DialogSystem.show('Tabs', html, () => {
            this.applyAndClose();
        });
        
        // Wait for DOM injection
        setTimeout(() => {
            this.renderList();
            const input = document.getElementById('tab-position-input');
            if(input) input.focus();
        }, 10);
    },
    
    renderList: function() {
        const list = document.getElementById('tab-list');
        list.innerHTML = '';
        this.tabs.sort((a,b) => a.pos - b.pos);
        this.tabs.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.pos;
            let leaderText = t.leader === 'none' ? '' : ` (${t.leader})`;
            opt.textContent = `${t.pos}px - ${t.align}${leaderText}`;
            list.appendChild(opt);
        });
    },
    
    setTab: function() {
        const posInput = document.getElementById('tab-position-input').value;
        const pos = parseFloat(posInput);
        if (isNaN(pos) || pos <= 0) return;
        
        const align = document.querySelector('input[name="tab-align"]:checked').value;
        const leader = document.querySelector('input[name="tab-leader"]:checked').value;
        
        this.tabs = this.tabs.filter(t => Math.abs(t.pos - pos) > 1);
        this.tabs.push({ pos, align, leader });
        this.renderList();
        document.getElementById('tab-position-input').value = '';
    },
    
    clearTab: function() {
        const list = document.getElementById('tab-list');
        if (list.selectedIndex < 0) return;
        const pos = parseFloat(list.options[list.selectedIndex].value);
        this.tabs = this.tabs.filter(t => t.pos !== pos);
        this.renderList();
    },
    
    clearAllTabs: function() {
        this.tabs = [];
        this.renderList();
    },
    
    applyAndClose: function() {
        if (!window._activeIndentBlock) return;
        
        if (this.tabs.length === 0) {
            window._activeIndentBlock.removeAttribute('data-tabs');
        } else {
            this.tabs.sort((a,b) => a.pos - b.pos);
            window._activeIndentBlock.setAttribute('data-tabs', JSON.stringify(this.tabs));
        }
        
        pushHistory();
    }
};

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
/* =========================================================================
   EXPORT AS HTML (SINGLE FILE EMAIL NEWSLETTER EXPORT)
   ========================================================================= */

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


window.handlePublisherFileLoad = (evt) => {
    try {
        let rawData = JSON.parse(evt.target.result);
        
        // Legacy support for older array-based saves
        if (Array.isArray(rawData)) {
            rawData = { title: "Untitled Publication", pages: rawData };
        }
        
        const loadDocumentData = (data) => {
            // ✨ TEMPLATE CHECK: If this file was saved as a template, open it as a fresh Untitled document
            if (data.isTemplate) {
                document.getElementById('doc-title').innerText = "Untitled Publication";
            } else {
                document.getElementById('doc-title').innerText = data.title;
            }
            
            state.pages = data.pages;
            state.hasMasterPage = data.hasMasterPage || false;
            state.rulerOriginX = data.rulerOriginX || 0;
            state.rulerOriginY = data.rulerOriginY || 0;
            state.margins = data.margins || {top: 48, right: 48, bottom: 48, left: 48};
            state.documentProperties = data.documentProperties || { author: '', company: '', subject: '', keywords: '' };
            
            // Read Spreads state (or infer for legacy saves)
            if (data.isSpreadMode !== undefined) {
                state.isSpreadMode = data.isSpreadMode;
            } else if (data.pages && data.pages.length > 0) {
                const w = parseInt(data.pages[0].width) || 0;
                state.isSpreadMode = w >= 1500; // Infer spreads if width is double standard
            } else {
                state.isSpreadMode = false;
            }
            
            const btn = document.getElementById('spread-mode-btn');
            if (btn) btn.classList.toggle('active', state.isSpreadMode);

            if (data.colorModel === 'CMYK') {
                document.getElementById('paper').classList.add('cmyk-mode');
            } else {
                document.getElementById('paper').classList.remove('cmyk-mode');
            }
            if (!window._orientedPagesRegistry) window._orientedPagesRegistry = new Set();
            state.pages.forEach(p => window._orientedPagesRegistry.add(p.id));
            state.history = [];
            state.historyIndex = -1;
            state.currentPageIndex = 0;
            renderPage(state.pages[0]);
            setTimeout(() => {
                if (typeof generateAllThumbnails === 'function') generateAllThumbnails();
                if (typeof pushHistory === 'function') pushHistory(); 
            }, 500);
        };

        if (rawData.encrypted) {
            const promptForPassword = () => {
                const html = `
                    <div style="padding: 10px; display: flex; align-items: flex-start; gap: 20px;">
                        <i class="fas fa-unlock-keyhole" style="font-size: 48px; color: var(--ui-theme-color); margin-top: 5px;"></i>
                        <div style="flex: 1;">
                            <p style="margin-bottom:15px; font-size:14px; color:#444;">This document is protected. Please enter the password to open it:</p>
                            <input type="password" id="doc-decrypt-input" style="width:100%; padding:8px; border:2px solid var(--ui-theme-color); border-radius:8px; margin-bottom:15px; outline: none; transition: border-color 0.2s;" placeholder="Password">
                        </div>
                `;
                if (typeof DialogSystem !== 'undefined') {
                    DialogSystem.show('Protected Document', html, async () => {
                        const pw = document.getElementById('doc-decrypt-input').value;
                        try {
                            DialogSystem.alert('Decrypting...', 'Decrypting document with AES-GCM...');
                            const decryptedData = await window.decryptDocumentData(rawData, pw);
                            DialogSystem.close();
                            state.documentPassword = pw;
                            window.updateProtectionIndicator();
                            loadDocumentData(decryptedData);
                        } catch(err) {
                            const errorHtml = `
                                <div style="display: flex; align-items: flex-start; gap: 20px; padding: 10px;">
                                    <i class="fas fa-times" style="font-size: 48px; color: #d9534f; margin-top: 5px;"></i>
                                    <div style="flex: 1; display: flex; align-items: center; min-height: 48px;">
                                        <p style="margin: 0; font-size: 15px; color: #333;">The password was Incorrect.</p>
                                    </div>
                                </div>
                            `;
                            DialogSystem.show('Decryption Failed', errorHtml, () => {
                                setTimeout(promptForPassword, 10);
                            });
                            const confirmBtn = document.getElementById('custom-dialog-confirm');
                            if (confirmBtn) confirmBtn.innerText = 'Retry';
                        }
                    });
                }
            };
            promptForPassword();
        } else {
            state.documentPassword = null;
            window.updateProtectionIndicator();
            loadDocumentData(rawData);
        }

    } catch(err) { 
        if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Error', "Error opening file: " + err); 
    }
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
/* =========================================================================
   WORD DOCUMENT CONVERSION ENDPOINT (.doc / .docx)
   (PRE-FLIGHT MENU + OPTICAL COLOR PICKER + PRINT SPOOLER COMPATIBLE)
   ========================================================================= */
/* =========================================================================
   MULTI-SELECT MARQUEE ADDON
   ========================================================================= */

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
/* =========================================================================
   MULTI-PAGE PRINT SPOOLER ENGINE
   ========================================================================= */
/* =========================================================================
   BOOKLET IMPOSITION (SADDLE-STITCH) ENGINE
   ========================================================================= */
/* =========================================================================
   SPREAD VIEW (BOOKLET DESIGN) TOGGLE
   ========================================================================= */
/* =========================================================================
   THE MASTER ADDON: RIBBONS, MARQUEE, GROUPING, CROP-SCALE & WORDART
========================================================================= */

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

/* =========================================================================
   BUG FIX: The "Event Shield" for Ctrl+Click Multi-Select
   ========================================================================= */
/* =========================================================================
   FEATURE: Picture Format Sidebar (Restored Designer UI + Flicker Fix)
   ========================================================================= */

/* =========================================================================
   GLOBAL WORKSPACE SLIDE LOCK (Ruler-Safe & synchronized 986px)
   ========================================================================= */

/* =========================================================================
   FEATURE: WordArt Sidebar (v4.0 - MS Office Shape Warping Engine added)
   ========================================================================= */
/* =========================================================================
   GLOBAL WORKSPACE SLIDE LOCK (Ruler-Safe & synchronized 986px)
   ========================================================================= */
(function lockGlobalWorkspaceAnimation() {
    const viewport = document.getElementById('viewport');
    if (!viewport) return;

    const observer = new MutationObserver((mutations) => {
        let shouldSync = false;
        
        for (let m of mutations) {
            if (m.target.id === 'op-image-sidebar' || m.target.id === 'op-wordart-sidebar' || m.target.classList.contains('sidebar-panel')) {
                shouldSync = true;
                break;
            }
        }

        if (shouldSync) {
            const activeSidebar = document.querySelector('#op-image-sidebar.visible, #op-wordart-sidebar.visible, .sidebar-panel.visible');
            
            if (activeSidebar) {
                const sidebarWidth = 290;
                const screenWidth = window.innerWidth;
                const minContentWidth = 950; 

                if (screenWidth < sidebarWidth + minContentWidth) {
                    viewport.style.setProperty('margin-right', sidebarWidth + 'px', 'important');
                    viewport.style.setProperty('width', `calc(100% - ${sidebarWidth}px)`, 'important');
                } else {
                    viewport.style.setProperty('margin-right', '0px', 'important');
                    viewport.style.setProperty('width', '100%', 'important');
                }
            } else {
                viewport.style.setProperty('margin-right', '0px', 'important');
                viewport.style.setProperty('width', '100%', 'important');
            }
        }
    });

    observer.observe(document.body, { 
        attributes: true, 
        attributeFilter: ['class'],
        subtree: true 
    });

    window.addEventListener('resize', () => {
        const activeSidebar = document.querySelector('#op-image-sidebar.visible, #op-wordart-sidebar.visible');
        if (activeSidebar) {
             const sidebarWidth = 290;
             const screenWidth = window.innerWidth;
             const minContentWidth = 986;
             if (screenWidth < sidebarWidth + minContentWidth) {
                 viewport.style.setProperty('margin-right', sidebarWidth + 'px', 'important');
                 viewport.style.setProperty('width', `calc(100% - ${sidebarWidth}px)`, 'important');
             } else {
                 viewport.style.setProperty('margin-right', '0px', 'important');
                 viewport.style.setProperty('width', '100%', 'important');
             }
        }
    });
})();

/* =========================================================================
   FEATURE: Picture Format Sidebar
   ========================================================================= */
(function installSidebarImageFilters() {
    // --- NEW SAFEGUARD: Destroy existing instances to prevent clones ---
    document.getElementById('op-image-sidebar')?.remove();
    document.getElementById('op-sidebar-expander')?.remove();
    // -------------------------------------------------------------------

    let userCollapsed = false; 

    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    const expander = document.createElement('div');
    expander.id = 'op-sidebar-expander';
    expander.innerHTML = '<i class="fas fa-chevron-left"></i>';
    document.body.appendChild(expander);

    const panel = document.createElement('div');
    panel.id = 'op-image-sidebar';
    panel.innerHTML = `<div class="op-sidebar-header">
            <span class="op-sidebar-title">Format Picture</span>
            <div class="op-sidebar-top-btns">
                <button class="op-header-btn" id="filter-reset-btn" style="margin-right:8px" title="Reset All"><i class="fas fa-undo"></i></button>
                <button class="custom-dialog-close" id="filter-close-btn"><i class="fas fa-times"></i></button>
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Visibility</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Transparency</span><span class="op-slider-num" id="val-transparency">0%</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="transparency" min="0" max="100" value="0">
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Light & Tone</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Brightness</span><span class="op-slider-num" id="val-brightness">100%</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="brightness" min="0" max="200" value="100">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Contrast</span><span class="op-slider-num" id="val-contrast">100%</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="contrast" min="0" max="200" value="100">
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Color Settings</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Saturation</span><span class="op-slider-num" id="val-saturate">100%</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="saturate" min="0" max="200" value="100">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Hue</span><span class="op-slider-num" id="val-hue-rotate">0°</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="hue-rotate" min="-180" max="180" value="0">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Grayscale</span><span class="op-slider-num" id="val-grayscale">0%</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="grayscale" min="0" max="100" value="0">
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Effects</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Blur</span><span class="op-slider-num" id="val-blur">0px</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="blur" min="0" max="10" value="0" step="0.5">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Sepia</span><span class="op-slider-num" id="val-sepia">0%</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="sepia" min="0" max="100" value="0">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Invert</span><span class="op-slider-num" id="val-invert">0%</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="invert" min="0" max="100" value="0">
            </div>
        </div>`;
    document.body.appendChild(panel);

    const vp = document.getElementById('viewport') || document.getElementById('workspace');

    const refreshVisibility = (el) => {
        if (el && el.querySelector('img')) {
            const isBetaWordArt = el.querySelector('.beta-wa-img') !== null;
            const titleEl = panel.querySelector('.op-sidebar-title');
            if (titleEl) titleEl.innerText = isBetaWordArt ? 'Format WordArt' : 'Format Picture';
            if (userCollapsed) {
                panel.classList.remove('visible'); expander.classList.add('visible'); if (vp) vp.style.width = '';
            } else {
                panel.classList.add('visible'); expander.classList.remove('visible'); if (vp) vp.style.width = 'calc(100% - 290px)';
            }
            panel.querySelectorAll('.op-sidebar-slider').forEach(s => {
                const f = s.dataset.filter;
                const v = el.getAttribute(`data-filter-${f}`) || (['brightness','contrast','saturate'].includes(f)?100:0);
                s.value = v; 
                const txt = panel.querySelector(`#val-${f}`);
                if(txt) txt.innerText = v + (f==='hue-rotate'?'°':f==='blur'?'px':'%');
            });
        } else {
            panel.classList.remove('visible'); expander.classList.remove('visible'); if (vp) vp.style.width = '';
        }
    };

    const apply = (el) => {
        const img = el.querySelector('img'); if(!img) return;
        const get = (f, d) => el.getAttribute(`data-filter-${f}`) || d;
        img.style.filter = `brightness(${get('brightness',100)}%) contrast(${get('contrast',100)}%) saturate(${get('saturate',100)}%) hue-rotate(${get('hue-rotate',0)}deg) blur(${get('blur',0)}px) sepia(${get('sepia',0)}%) grayscale(${get('grayscale',0)}%) invert(${get('invert',0)}%)`;
        img.style.opacity = 1 - (get('transparency',0) / 100);
    };

    panel.querySelectorAll('.op-sidebar-slider').forEach(s => {
        s.addEventListener('input', e => {
            if(!state.selectedEl) return;
            const f = e.target.dataset.filter, v = e.target.value;
            state.selectedEl.setAttribute(`data-filter-${f}`, v);
            const txt = panel.querySelector(`#val-${f}`);
            if(txt) txt.innerText = v + (f==='hue-rotate'?'°':f==='blur'?'px':'%');
            apply(state.selectedEl);
        });
        s.addEventListener('change', () => { if(window.pushHistory) pushHistory(); });
    });

    panel.querySelector('#filter-reset-btn').addEventListener('click', () => {
        if(!state.selectedEl) return;
        panel.querySelectorAll('.op-sidebar-slider').forEach(s => {
            const f = s.dataset.filter, d = (['brightness','contrast','saturate'].includes(f)?100:0);
            state.selectedEl.removeAttribute(`data-filter-${f}`);
            s.value = d; 
            const txt = panel.querySelector(`#val-${f}`);
            if(txt) txt.innerText = d + (f==='hue-rotate'?'°':f==='blur'?'px':'%');
        });
        apply(state.selectedEl);
    });

    panel.querySelector('#filter-close-btn').addEventListener('click', () => { userCollapsed = true; refreshVisibility(state.selectedEl); });
    
    expander.addEventListener('click', () => { userCollapsed = false; refreshVisibility(state.selectedEl); });

    setTimeout(() => {
        if(window.selectElement) {
            const oldSel = window.selectElement;
            window.selectElement = (el) => { oldSel(el); setTimeout(() => refreshVisibility(el), 10); };
        }
        if(window.deselect) {
            const oldDes = window.deselect;
            window.deselect = () => { oldDes(); setTimeout(() => refreshVisibility(null), 10); };
        }
    }, 1000);
})();

/* =========================================================================
   FEATURE: WordArt Sidebar (Anti-Pinch Physics Compensator)
   ========================================================================= */
(function installSidebarWordArt() {
    // --- NEW SAFEGUARD: Destroy existing instances to prevent clones ---
    document.getElementById('op-wordart-sidebar')?.remove();
    document.getElementById('op-wa-sidebar-expander')?.remove();
    // -------------------------------------------------------------------

    let waUserCollapsed = false;

    const getDef = (f) => {
        if(f === 'lineHeight') return 1.2;
        if(f === 'fontWeight') return 400;
        if(f === 'shadowX' || f === 'shadowY') return 2;
        if(f === 'saturate') return 100; 
        return 0;
    };

    const getUnit = (f) => {
        if (['blur', 'spacing', 'wordSpacing', 'shadowX', 'shadowY'].includes(f)) return 'px';
        if (['opacity', 'saturate'].includes(f)) return '%';
        if (f === 'hue') return '°';
        if (f === 'lineHeight') return 'x';
        return ''; 
    };

    const toggleSliders = (isDisabled) => {
        const sections = ['wa-color-sec', 'wa-shadow-sec', 'wa-typo-sec'];
        sections.forEach(id => {
            const el = panel.querySelector(`#${id}`);
            if (el) {
                if (isDisabled) el.classList.add('wa-disabled-section');
                else el.classList.remove('wa-disabled-section');
                
                el.querySelectorAll('input').forEach(inp => {
                    inp.disabled = isDisabled;
                });
            }
        });
    };

    // --- CORE FEATURE: Auto-Compensating Text Engine ---
    const applyWordArtShape = (target, shape) => {
        if (!target.dataset.origText) {
            target.dataset.origText = target.innerText.trim();
        }
        const text = target.dataset.origText;
        
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.overflow = "visible"; 
        svg.setAttribute("preserveAspectRatio", "none"); 
        
        const defs = document.createElementNS(svgNS, "defs");
        const path = document.createElementNS(svgNS, "path");
        const pathId = "wa-path-" + Math.random().toString(36).substr(2, 9);
        path.id = pathId;
        
        svg.setAttribute("viewBox", "0 0 200 150");
        
        let pathD = "";
        if (shape === 'arch-up') {
            pathD = "M 10,120 Q 100,10 190,120"; 
        } else if (shape === 'arch-down') {
            pathD = "M 10,30 Q 100,140 190,30"; 
        } else if (shape === 'circle') {
            pathD = "M 100, 135 m -65, 0 a 65,65 0 1,1 130,0 a 65,65 0 1,1 -130,0";
        } else {
            pathD = "M 10,75 L 190,75";
        }

        path.setAttribute("d", pathD);
        path.setAttribute("fill", "transparent");
        defs.appendChild(path);
        svg.appendChild(defs);

        const textEl = document.createElementNS(svgNS, "text");
        textEl.setAttribute("fill", "currentColor"); 
        textEl.style.fontFamily = "inherit";
        textEl.style.fontWeight = "inherit";
        
        textEl.setAttribute("dominant-baseline", "middle");

        const charCount = Math.max(1, text.length);
        const dynamicFontSize = Math.min(50, 180 / (charCount * 0.45));
        textEl.style.fontSize = dynamicFontSize + "px"; 

        if (shape === 'arch-down') {
            textEl.style.letterSpacing = (dynamicFontSize * 0.12) + "px";
        } else if (shape === 'circle') {
            textEl.style.letterSpacing = (dynamicFontSize * 0.20) + "px";
        } else {
            textEl.style.letterSpacing = "inherit";
        }

        const textPath = document.createElementNS(svgNS, "textPath");
        textPath.setAttribute("href", "#" + pathId);
        textPath.setAttribute("startOffset", "50%");
        textPath.setAttribute("text-anchor", "middle");
        textPath.textContent = text;

        textEl.appendChild(textPath);
        svg.appendChild(textEl);

        target.innerHTML = '';
        target.appendChild(svg);
        target.style.display = 'block'; 
        target.style.width = '100%';
        target.style.height = '100%';
    };

    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    const expander = document.createElement('div');
    expander.id = 'op-wa-sidebar-expander';
    expander.innerHTML = '<i class="fas fa-font"></i>';
    document.body.appendChild(expander);

    const panel = document.createElement('div');
    panel.id = 'op-wordart-sidebar';
    panel.innerHTML = `<div class="op-sidebar-header">
            <span class="op-sidebar-title">Format WordArt</span>
            <div class="op-sidebar-top-btns">
                <button class="op-header-btn" id="wa-reset-btn" style="margin-right:8px" title="Reset All"><i class="fas fa-undo"></i></button>
                <button class="custom-dialog-close" id="wa-close-btn"><i class="fas fa-times"></i></button>
            </div>
        </div>
        
        <div class="op-sidebar-section">
            <span class="op-section-label">Text Shape</span>
            <div class="wa-shape-grid" id="wa-shape-controls">
                <button class="wa-shape-btn active" data-shape="none" title="Straight Text">
                    <svg viewBox="0 0 24 24"><text x="12" y="16" font-size="12" text-anchor="middle" font-weight="bold" fill="currentColor">ABC</text></svg>
                </button>
                <button class="wa-shape-btn" data-shape="arch-up" title="Arch Up">
                    <svg viewBox="0 0 24 24"><path d="M 4,16 Q 12,6 20,16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                </button>
                <button class="wa-shape-btn" data-shape="arch-down" title="Arch Down">
                    <svg viewBox="0 0 24 24"><path d="M 4,8 Q 12,18 20,8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                </button>
                <button class="wa-shape-btn" data-shape="circle" title="Circle">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="4 3"/></svg>
                </button>
                <button class="wa-shape-btn" data-shape="wave" title="Wave">
                    <svg viewBox="0 0 24 24"><path d="M 3,12 Q 7.5,6 12,12 T 21,12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                </button>
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Color & Effects</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Hue Shift</span><span class="op-slider-num" id="val-wa-hue">0°</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="hue" min="-180" max="180" value="0" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Saturation</span><span class="op-slider-num" id="val-wa-saturate">100%</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="saturate" min="0" max="200" value="100" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Transparency</span><span class="op-slider-num" id="val-wa-opacity">0%</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="opacity" min="0" max="100" value="0">
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Drop Shadow</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Shadow X</span><span class="op-slider-num" id="val-wa-shadowX">2px</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="shadowX" min="-50" max="50" value="2" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Shadow Y</span><span class="op-slider-num" id="val-wa-shadowY">2px</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="shadowY" min="-50" max="50" value="2" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Shadow Blur</span><span class="op-slider-num" id="val-wa-blur">0px</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="blur" min="0" max="25" value="0">
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Typography</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Font Weight</span><span class="op-slider-num" id="val-wa-fontWeight">400</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="fontWeight" min="100" max="900" value="400" step="100">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Letter Spacing</span><span class="op-slider-num" id="val-wa-spacing">0px</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="spacing" min="-10" max="50" value="0" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Word Spacing</span><span class="op-slider-num" id="val-wa-wordSpacing">0px</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="wordSpacing" min="-20" max="50" value="0" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Line Height</span><span class="op-slider-num" id="val-wa-lineHeight">1.2x</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="lineHeight" min="0.5" max="3" value="1.2" step="0.1">
            </div>
        </div>`;
    document.body.appendChild(panel);

    const refreshUI = (el) => {
        const isWA = el && (el.classList.contains('wa-text') || el.querySelector('.wa-text') || el.closest('.wa-wrapper'));
        if (isWA) {
            if (waUserCollapsed) {
                panel.classList.remove('visible');
                expander.classList.add('visible');
            } else {
                panel.classList.add('visible');
                expander.classList.remove('visible');
            }
            const target = el.querySelector('.wa-text') || el.closest('.wa-text') || (el.classList.contains('wa-text') ? el : null);
            if (target) {
                panel.querySelectorAll('.wa-sidebar-input').forEach(input => {
                    const f = input.dataset.waf;
                    const attrVal = target.getAttribute(`data-waf-${f}`);
                    const v = attrVal !== null ? attrVal : getDef(f);
                    input.value = v;
                    const textLabel = panel.querySelector(`#val-wa-${f}`);
                    if(textLabel) textLabel.innerText = v + getUnit(f);
                });
                
                const currentShape = target.getAttribute('data-waf-shape') || 'none';
                panel.querySelectorAll('.wa-shape-btn').forEach(btn => {
                    if(btn.dataset.shape === currentShape) btn.classList.add('active');
                    else btn.classList.remove('active');
                });
                toggleSliders(currentShape !== 'none');
            }
        } else {
            panel.classList.remove('visible');
            expander.classList.remove('visible');
        }
    };

    setTimeout(() => {
        if (window.selectElement) {
            const originalSelect = window.selectElement;
            window.selectElement = function(el) {
                originalSelect.apply(this, arguments);
                if (el && (el.querySelector('.wa-text') || el.classList.contains('wa-text'))) {
                    document.getElementById('op-image-sidebar')?.classList.remove('visible');
                }
                refreshUI(el);
            };
        }
        if (window.deselect) {
            const originalDeselect = window.deselect;
            window.deselect = function() {
                originalDeselect.apply(this, arguments);
                refreshUI(null);
            };
        }
    }, 1500);

    panel.querySelector('#wa-close-btn').onclick = () => { waUserCollapsed = true; refreshUI(state.selectedEl); };
    expander.onclick = () => { waUserCollapsed = false; refreshUI(state.selectedEl); };

    // --- Shape Button Click Logic ---
    panel.querySelectorAll('.wa-shape-btn').forEach(btn => {
        btn.onclick = (e) => {
            if (!state.selectedEl) return;
            const target = state.selectedEl.querySelector('.wa-text') || state.selectedEl;
            const shape = btn.dataset.shape;
            
            panel.querySelectorAll('.wa-shape-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            target.setAttribute('data-waf-shape', shape);
            applyWordArtShape(target, shape);
            toggleSliders(shape !== 'none');
            
            if (typeof syncWordArt === 'function') {
                syncWordArt(state.selectedEl);
            }
            if (typeof pushHistory === 'function') pushHistory();
        };
    });

    // Reset Button Logic
    panel.querySelector('#wa-reset-btn').onclick = () => {
        if (!state.selectedEl) return;
        const target = state.selectedEl.querySelector('.wa-text') || state.selectedEl;
        
        panel.querySelectorAll('.wa-sidebar-input').forEach(input => {
            const f = input.dataset.waf;
            const d = getDef(f);
            target.removeAttribute(`data-waf-${f}`);
            input.value = d;
            const textLabel = panel.querySelector(`#val-wa-${f}`);
            if(textLabel) textLabel.innerText = d + getUnit(f);
        });

        target.removeAttribute('data-waf-shape');
        panel.querySelectorAll('.wa-shape-btn').forEach(b => {
            if(b.dataset.shape === 'none') b.classList.add('active');
            else b.classList.remove('active');
        });
        applyWordArtShape(target, 'none');
        toggleSliders(false);

        target.style.opacity = 1;
        target.style.letterSpacing = '0px';
        target.style.wordSpacing = '0px';
        target.style.lineHeight = 1.2;
        target.style.fontWeight = 400;
        target.style.webkitTextStroke = '';
        target.style.filter = '';
        
        if (typeof syncWordArt === 'function') syncWordArt(state.selectedEl);
        if (typeof pushHistory === 'function') pushHistory();
    };

    // Slider Logic
    panel.querySelectorAll('.wa-sidebar-input').forEach(input => {
        input.oninput = (e) => {
            if (!state.selectedEl) return;
            const target = state.selectedEl.querySelector('.wa-text') || state.selectedEl;
            const val = e.target.value;
            const f = e.target.dataset.waf;
            
            target.setAttribute(`data-waf-${f}`, val);
            const textLabel = panel.querySelector(`#val-wa-${f}`);
            if(textLabel) textLabel.innerText = val + getUnit(f);
            
            if (f === 'opacity') target.style.opacity = 1 - (val / 100);
            if (f === 'spacing') target.style.letterSpacing = `${val}px`;
            if (f === 'wordSpacing') target.style.wordSpacing = `${val}px`;
            if (f === 'lineHeight') target.style.lineHeight = val;
            if (f === 'fontWeight') target.style.fontWeight = val;
            
            if (['blur', 'shadowX', 'shadowY', 'hue', 'saturate'].includes(f)) {
                const blurVal = target.getAttribute('data-waf-blur') || 0;
                const sxVal = target.getAttribute('data-waf-shadowX') || 2;
                const syVal = target.getAttribute('data-waf-shadowY') || 2;
                const hueVal = target.getAttribute('data-waf-hue') || 0;
                
                const satAttr = target.getAttribute('data-waf-saturate');
                const satVal = satAttr !== null ? satAttr : 100;
                
                let filterStr = '';
                if (blurVal > 0 || sxVal != 0 || syVal != 0) filterStr += `drop-shadow(${sxVal}px ${syVal}px ${blurVal}px rgba(0,0,0,0.5)) `;
                if (hueVal != 0) filterStr += `hue-rotate(${hueVal}deg) `;
                if (satVal != 100) filterStr += `saturate(${satVal}%) `;
                
                target.style.filter = filterStr.trim();
            }

            const currentShape = target.getAttribute('data-waf-shape') || 'none';
            if (['spacing', 'wordSpacing', 'lineHeight', 'outline', 'blur', 'fontWeight', 'shadowX', 'shadowY'].includes(f)) {
                if (typeof syncWordArt === 'function' && currentShape === 'none') {
                    syncWordArt(state.selectedEl);
                }
            }
            if (typeof pushHistory === 'function') pushHistory();
        };
    });
})();
/* =========================================================================
   FEATURE: Ruler Highlights (Global Overlay + Boundary Clamping)
   ========================================================================= */
(function installRulerHighlights() {
    console.log("🛠️ Ruler Highlight Script initializing (Boundary Clamped)...");

    // 1. Inject styling
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // 2. Attach overlays to body
    const hlH = document.createElement('div');
    hlH.className = 'op-ruler-highlight-h';
    document.body.appendChild(hlH);

    const hlV = document.createElement('div');
    hlV.className = 'op-ruler-highlight-v';
    document.body.appendChild(hlV);

    let rulerH = null;
    let rulerV = null;

    // 3. The high-speed tracking loop
    function trackSelection() {
        if (!rulerH) rulerH = document.getElementById('ruler-h');
        if (!rulerV) rulerV = document.getElementById('ruler-v');

        if (!rulerH || !rulerV) {
            requestAnimationFrame(trackSelection);
            return;
        }

        const selectedEl = document.querySelector('.pub-element.selected');

        if (selectedEl) {
            const elRect = selectedEl.getBoundingClientRect();
            const hRect = rulerH.getBoundingClientRect();
            const vRect = rulerV.getBoundingClientRect();

            // --- MATH: Clamp Horizontal Boundaries ---
            // Don't let the left edge go past the ruler's left edge
            const clampedHLeft = Math.max(elRect.left, hRect.left);
            // Don't let the right edge go past the ruler's right edge
            const clampedHRight = Math.min(elRect.right, hRect.right);
            // Calculate new width after clamping
            const clampedHWidth = clampedHRight - clampedHLeft;

            // Only show if it's actually over the ruler
            if (clampedHWidth > 0) {
                hlH.style.display = 'block';
                hlH.style.left = clampedHLeft + 'px';
                hlH.style.width = clampedHWidth + 'px';
                hlH.style.top = hRect.top + 'px';
                hlH.style.height = hRect.height + 'px';
            } else {
                hlH.style.display = 'none';
            }

            // --- MATH: Clamp Vertical Boundaries ---
            // Don't let the top edge go past the ruler's top edge
            const clampedVTop = Math.max(elRect.top, vRect.top);
            // Don't let the bottom edge go past the ruler's bottom edge
            const clampedVBottom = Math.min(elRect.bottom, vRect.bottom);
            // Calculate new height after clamping
            const clampedVHeight = clampedVBottom - clampedVTop;

            // Only show if it's actually over the ruler
            if (clampedVHeight > 0) {
                hlV.style.display = 'block';
                hlV.style.top = clampedVTop + 'px';
                hlV.style.height = clampedVHeight + 'px';
                hlV.style.left = vRect.left + 'px';
                hlV.style.width = vRect.width + 'px';
            } else {
                hlV.style.display = 'none';
            }

        } else {
            hlH.style.display = 'none';
            hlV.style.display = 'none';
        }

        requestAnimationFrame(trackSelection);
    }

    requestAnimationFrame(trackSelection);
    console.log("✅ Ruler Highlight Loop started successfully.");
})();
/* =========================================================================
   FEATURE: Keyboard Nudge (Arrow Key Movement with Shift/Ctrl Modifiers)
   ========================================================================= */
(function installKeyboardNudge() {
    console.log("🛠️ Keyboard Nudge Script initializing...");

    let isNudging = false;

    // Listen for key presses
    document.addEventListener('keydown', (e) => {
        // 1. SAFEGUARD: Don't hijack arrow keys if the user is typing in a text box!
        const isTyping = e.target.tagName === 'INPUT' || 
                         e.target.tagName === 'TEXTAREA' || 
                         e.target.isContentEditable;
        if (isTyping) return;

        // 2. Only intercept Arrow keys
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (!keys.includes(e.key)) return;

        // 3. Find all currently selected elements
        const selectedEls = document.querySelectorAll('.pub-element.selected');
        if (selectedEls.length === 0) return;

        // 4. Stop the browser window from scrolling
        e.preventDefault(); 
        isNudging = true;

        // 5. Calculate nudge amount (1px normal, 10px Shift, 50px Ctrl/Cmd)
        let nudgeAmount = 1;
        if (e.shiftKey) nudgeAmount = 10;
        if (e.ctrlKey || e.metaKey) nudgeAmount = 50; // The Paint.net "Super Nudge"

        // 6. Move every selected element
        selectedEls.forEach(el => {
            // Get current positions (default to 0 if not set)
            const currentLeft = parseFloat(el.style.left) || 0;
            const currentTop = parseFloat(el.style.top) || 0;

            if (e.key === 'ArrowUp') el.style.top = (currentTop - nudgeAmount) + 'px';
            if (e.key === 'ArrowDown') el.style.top = (currentTop + nudgeAmount) + 'px';
            if (e.key === 'ArrowLeft') el.style.left = (currentLeft - nudgeAmount) + 'px';
            if (e.key === 'ArrowRight') el.style.left = (currentLeft + nudgeAmount) + 'px';

            // Optional: Keep WordArt synced if needed
            if (typeof syncWordArt === 'function' && el.querySelector('.wa-text')) {
                syncWordArt(el);
            }
        });
    });

    // 7. Save to history ONLY when the user releases the key 
    // (Prevents spamming the undo history with 100 single-pixel moves)
    document.addEventListener('keyup', (e) => {
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (keys.includes(e.key) && isNudging) {
            isNudging = false;
            // Trigger your app's global save state
            if (typeof pushHistory === 'function') {
                pushHistory();
            }
        }
    });

    console.log("✅ Keyboard Nudge Script started successfully.");
})();
/* =========================================================================
   FEATURE: Context Tools - Rich Formatting, Paragraphs & View Options
   (Applies to Text Box & WordArt Ribbons)
   ========================================================================= */
(function installContextRichFormattingAndOptions() {
    console.log("🛠️ Context Tools Script initializing...");

    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    setTimeout(() => {
        // We will loop through both ribbons to inject the same tools
        const targets = [
            { id: 'ribbon-format-text', suffix: 'text' },
            { id: 'ribbon-format-wordart', suffix: 'wa' }
        ];

        targets.forEach(target => {
            const ribbon = document.getElementById(target.id);
            if (!ribbon) return; // Skip if this specific ribbon hasn't rendered yet

            // ==========================================
            // GROUP 1: FONT
            // ==========================================
            const fontGroup = document.createElement('div');
            fontGroup.className = 'group';
            fontGroup.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:6px; padding: 2px;">
                    <div style="display:flex; gap:6px; align-items: center;">
                        <div class="font-picker-container" style="width: 140px;">
                            <div class="modern-select" id="ctx-font-btn-${target.suffix}" onclick="window._currentRibbonSuffix='${target.suffix}'; toggleCustomDropdown('ctx-ribbon'); event.stopPropagation();">
                                <span id="ctx-font-label-${target.suffix}">Arial</span> 
                                <div class="arrow-box"><i class="fas fa-chevron-down" style="font-size:10px;"></i></div>
                            </div>
                        </div>
                        
                        <div class="modern-spinner">
                            <input type="text" id="ctx-font-size-${target.suffix}" value="16" onchange="setTrueFontSize(this.value + 'px')">
                            <div class="spin-btns">
                                <div onclick="document.getElementById('ctx-font-size-${target.suffix}').value=parseInt(document.getElementById('ctx-font-size-${target.suffix}').value)+1; setTrueFontSize(document.getElementById('ctx-font-size-${target.suffix}').value + 'px')"><i class="fas fa-chevron-up"></i></div>
                                <div onclick="document.getElementById('ctx-font-size-${target.suffix}').value=Math.max(1,parseInt(document.getElementById('ctx-font-size-${target.suffix}').value)-1); setTrueFontSize(document.getElementById('ctx-font-size-${target.suffix}').value + 'px')"><i class="fas fa-chevron-down"></i></div>
                            </div>
                        </div>
                        
                        <div style="width:1px; height:20px; background:#ccc; margin:0 2px;"></div>
                        
                        <div class="modern-format-btn" onclick="execCmd('removeFormat')" title="Clear Formatting"><i class="fas fa-eraser"></i></div>
                    </div>
                    
                    <div style="display:flex; gap: 4px; align-items: center;">
                        <div class="modern-format-btn" onclick="execCmd('bold')" title="Bold"><i class="fas fa-bold"></i></div>
                        <div class="modern-format-btn" style="font-family: serif; font-style: italic; font-weight: bold; font-size: 18px; padding-top: 2px;" onclick="execCmd('italic')" title="Italic">I</div>
                        <div class="modern-format-btn" onclick="execCmd('underline')" title="Underline"><i class="fas fa-underline"></i></div>
                        <div class="modern-format-btn" onclick="execCmd('strikeThrough')" title="Strikethrough"><i class="fas fa-strikethrough"></i></div>
                        
                        <div class="modern-format-btn" style="font-size: 12px;" onclick="execCmd('subscript')" title="Subscript"><i class="fas fa-subscript"></i></div>
                        <div class="modern-format-btn" style="font-size: 12px;" onclick="execCmd('superscript')" title="Superscript"><i class="fas fa-superscript"></i></div>
                        
                        <div style="width:1px; height:20px; background:#ccc; margin:0 2px;"></div>
                        
                        <div class="modern-format-btn" style="position:relative;" title="Text Color" onclick="CustomColorPicker.open(this, document.getElementById('ctx-text-color-bar-${target.suffix}').style.backgroundColor || '#000000', (c) => { document.getElementById('ctx-text-color-bar-${target.suffix}').style.background=c; execCmd('foreColor', c); })">
                            <i class="fas fa-font" style="margin-top: -2px;"></i>
                            <div style="height:3px; background:black; width:16px; position:absolute; bottom:3px; border-radius: 2px;" id="ctx-text-color-bar-${target.suffix}"></div>
                        </div>
                        
                        <div class="modern-format-btn" style="position:relative;" title="Highlight Color" onclick="CustomColorPicker.open(this, document.getElementById('ctx-bg-color-bar-${target.suffix}').style.backgroundColor || '#ffff00', (c) => { document.getElementById('ctx-bg-color-bar-${target.suffix}').style.background=c; execCmd('hiliteColor', c); })">
                            <i class="fas fa-highlighter" style="margin-top: -2px;"></i>
                            <div style="height:3px; background:yellow; width:16px; position:absolute; bottom:3px; border-radius: 2px;" id="ctx-bg-color-bar-${target.suffix}"></div>
                        </div>
                    </div>
                </div>
                <div class="group-label">Font</div>
            `;

            // ==========================================
            // GROUP 2: PARAGRAPH
            // ==========================================
            const paragraphGroup = document.createElement('div');
            paragraphGroup.className = 'group';
            paragraphGroup.innerHTML = `
                <div style="display:flex; flex-direction:column; padding: 2px;">
                    <div class="ctx-row">
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('insertUnorderedList')" title="Bullet List"><i class="fas fa-list-ul"></i></div>
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('insertOrderedList')" title="Numbered List"><i class="fas fa-list-ol"></i></div>
                        
                        <div style="width:1px; height:16px; background:#ccc; margin:0 2px;"></div>
                        
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('outdent')" title="Decrease Indent"><i class="fas fa-outdent"></i></div>
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('indent')" title="Increase Indent"><i class="fas fa-indent"></i></div>
                    </div>
                    <div class="ctx-row">
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('justifyLeft')" title="Align Left"><i class="fas fa-align-left"></i></div>
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('justifyCenter')" title="Align Center"><i class="fas fa-align-center"></i></div>
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('justifyRight')" title="Align Right"><i class="fas fa-align-right"></i></div>
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('justifyFull')" title="Justify"><i class="fas fa-align-justify"></i></div>
                    </div>
                </div>
                <div class="group-label">Paragraph</div>
            `;

            // ==========================================
            // GROUP 3: VIEW OPTIONS
            // ==========================================
            const optionsGroup = document.createElement('div');
            optionsGroup.className = 'group';
            optionsGroup.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:6px; padding: 2px 6px; justify-content: center; height: 100%;">
                    <label style="font-size:11px; display:flex; align-items:center; gap:4px; cursor:pointer; margin:0; color:var(--ui-text);">
                        <input type="checkbox" id="ribbon-toggle-float-${target.suffix}" checked style="margin:0; cursor:pointer; accent-color: var(--ui-theme-color);"> Show Float Toolbar
                    </label>
                    <label style="font-size:11px; display:flex; align-items:center; gap:4px; cursor:pointer; margin:0; color:var(--ui-text);">
                        <input type="checkbox" id="ribbon-toggle-margins-${target.suffix}" checked style="margin:0; cursor:pointer; accent-color: var(--ui-theme-color);"> Show Page Margins
                    </label>
                </div>
                <div class="group-label">View</div>
            `;

            // Inject the groups securely behind the Clipboard group if it exists
            if (ribbon.children.length > 1) {
                ribbon.insertBefore(fontGroup, ribbon.children[1]);
                ribbon.insertBefore(paragraphGroup, ribbon.children[2]);
                ribbon.insertBefore(optionsGroup, ribbon.children[3]);
            } else {
                ribbon.appendChild(fontGroup);
                ribbon.appendChild(paragraphGroup);
                ribbon.appendChild(optionsGroup);
            }

            // Bind the View option checkboxes for this specific ribbon
            document.getElementById(`ribbon-toggle-float-${target.suffix}`).addEventListener('change', (e) => {
                const ft = document.getElementById('float-toolbar');
                if (ft) {
                    if (!e.target.checked) ft.classList.add('force-hide-float');
                    else ft.classList.remove('force-hide-float');
                }
            });

            document.getElementById(`ribbon-toggle-margins-${target.suffix}`).addEventListener('change', (e) => {
                document.querySelectorAll('.margin-guides').forEach(g => {
                    g.style.display = e.target.checked ? 'block' : 'none';
                });
            });
        });

        // ==========================================
        // GLOBAL LOGIC WIRING (Only needs to run once)
        // ==========================================

        // 1. Font Dropdown Hijack (Reads the _currentRibbonSuffix flag to position correctly)
        if (typeof window.toggleCustomDropdown === 'function' && !window._patchedToggleCustomDropdownCtx) {
            const originalToggle = window.toggleCustomDropdown;
            window.toggleCustomDropdown = function(type) {
                if (type === 'ctx-ribbon') {
                    const menu = document.getElementById('ribbon-font-list');
                    if (!menu) return;

                    const isVisible = menu.style.display === 'block';
                    document.querySelectorAll('.custom-dropdown').forEach(d => d.style.display = 'none');
                    
                    if (!isVisible) {
                        const btn = document.getElementById('ctx-font-btn-' + window._currentRibbonSuffix);
                        if (btn) {
                            const rect = btn.getBoundingClientRect();
                            menu.style.left = rect.left + 'px';
                            menu.style.top = (rect.bottom + 2) + 'px';
                            menu.style.width = '200px';
                            menu.style.zIndex = '9999999';
                        }
                        menu.style.display = 'block';
                    }
                    return;
                }
                originalToggle.apply(this, arguments);
            };
            window._patchedToggleCustomDropdownCtx = true;
        }

        // 2. Sync Font Choice back to our new labels
        if (typeof window.selectFont === 'function' && !window._patchedSelectFontCtx) {
            const originalSelectFont = window.selectFont;
            window.selectFont = function(fontName) {
                originalSelectFont.apply(this, arguments);
                
                // Update labels on BOTH ribbons just to be safe
                const lblText = document.getElementById('ctx-font-label-text');
                const lblWA = document.getElementById('ctx-font-label-wa');
                if (lblText) lblText.innerText = fontName;
                if (lblWA) lblWA.innerText = fontName;
            };
            window._patchedSelectFontCtx = true;
        }

        // 3. Sync font updates when the Float Toolbar updates
        if (typeof window.updateFloatToolbarValues === 'function' && !window._patchedUpdateFloatCtx) {
            const originalUpdateFloat = window.updateFloatToolbarValues;
            window.updateFloatToolbarValues = function() {
                originalUpdateFloat.apply(this, arguments);
                const ribbonLabel = document.getElementById('ribbon-font-label');
                const ribbonSize = document.getElementById('font-size');
                
                if (ribbonLabel) {
                    const lblText = document.getElementById('ctx-font-label-text');
                    const lblWA = document.getElementById('ctx-font-label-wa');
                    if (lblText) lblText.innerText = ribbonLabel.innerText;
                    if (lblWA) lblWA.innerText = ribbonLabel.innerText;
                }
                if (ribbonSize) {
                    const szText = document.getElementById('ctx-font-size-text');
                    const szWA = document.getElementById('ctx-font-size-wa');
                    if (szText) szText.value = ribbonSize.value;
                    if (szWA) szWA.value = ribbonSize.value;
                }
            };
            window._patchedUpdateFloatCtx = true;
        }

        console.log("✅ Context Tools for Text & WordArt added successfully.");
    }, 1500); 
})();
/* =========================================================================
   FEATURE: Scratch Area Fading (Off-Canvas Transparency)
   ========================================================================= */
(function installScratchAreaFading() {
    console.log("🛠️ Scratch Area Fading Script initializing...");

    // 1. Inject the CSS class for the faded effect
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // 2. The collision detection logic
    function checkOffCanvasStatus(el) {
        const paper = document.getElementById('paper');
        if (!paper || !el) return;

        const paperRect = paper.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        // Check if the element's bounding box is COMPLETELY outside the paper
        const completelyOutside = (
            elRect.right < paperRect.left ||
            elRect.left > paperRect.right ||
            elRect.bottom < paperRect.top ||
            elRect.top > paperRect.bottom
        );

        if (completelyOutside) {
            el.classList.add('scratch-area-item');
        } else {
            el.classList.remove('scratch-area-item');
        }
    }

    // 3. Set up the invisible observer to watch for position changes
    setTimeout(() => {
        const paper = document.getElementById('paper');
        if (!paper) {
            console.warn("Could not find #paper for Scratch Area logic.");
            return;
        }

        // Run an initial check on all existing elements in case a template loaded
        document.querySelectorAll('.pub-element').forEach(checkOffCanvasStatus);

        // Create an observer that watches for style changes (dragging, nudging, resizing)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                // If an element's inline style changes (which happens when its x/y coordinates change)
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (mutation.target.classList.contains('pub-element')) {
                        checkOffCanvasStatus(mutation.target);
                    }
                }
            });
        });

        // Tell the observer to watch the paper and all its children
        observer.observe(paper, { 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['style'] 
        });

        console.log("✅ Scratch Area Fading added successfully.");
    }, 1000); // Small delay to ensure paper is rendered
})();
/* =========================================================================
   FEATURE: Smart Text Interaction (Final Stable - Text Boxes & Tables)
   ========================================================================= */
(function installSmartTextInteraction() {
    console.log("🛠️ Smart Text Interaction Script initializing...");

    let startX = 0;
    let startY = 0;

    // 1. Record exactly where the mouse started
    document.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
    });

    // 2. Evaluate what the user was trying to do when they let go of the mouse
    document.addEventListener('mouseup', (e) => {
        // Calculate how far the mouse moved
        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);

        // If it was a drag, abort completely so we don't mess up the movement engine
        if (dx > 3 || dy > 3) return;

        const pubEl = e.target.closest('.pub-element') || e.target.closest('.page-header') || e.target.closest('.page-footer');
        
        // --- PART A: SINGLE-CLICK TO EDIT WITH EXACT CARET PLACEMENT ---
        if (pubEl) {
            // Target the exact cell/element clicked (Ignores WordArt intentionally)
            let editable = e.target.closest('[contenteditable="true"]');
            
            // Fallback for wrappers
            if (!editable && pubEl.getAttribute('contenteditable') === 'true') {
                editable = pubEl;
            } else if (!editable) {
                editable = pubEl.querySelector('[contenteditable="true"]');
            }

            if (editable && !e.target.closest('.resize-handle') && !e.target.closest('.rotate-handle')) {
                // Focus the box immediately
                editable.focus();

                // If this is a double or triple click, let the browser handle text selection natively
                if (e.detail > 1) return;

                // MAGIC TRICK: Find the exact letter under the mouse pointer
                let range = null;
                
                // Chrome, Safari, Edge
                if (document.caretRangeFromPoint) { 
                    range = document.caretRangeFromPoint(e.clientX, e.clientY);
                } 
                // Firefox Fallback
                else if (document.caretPositionFromPoint) { 
                    const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
                    if (pos) {
                        range = document.createRange();
                        range.setStart(pos.offsetNode, pos.offset);
                        range.collapse(true);
                    }
                }

                // If we successfully found the exact text node, drop the cursor there!
                if (range) {
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } 
        
        // --- PART B: CLEAR HIGHLIGHTS ON EXIT ---
        else {
            const clickedToolbar = e.target.closest('.title-bar') || 
                                   e.target.closest('#ribbon-container') || 
                                   e.target.closest('.sidebar-panel') ||
                                   e.target.closest('#float-toolbar') ||
                                   e.target.closest('.custom-dialog');

            if (!clickedToolbar) {
                if (window.getSelection) {
                    window.getSelection().removeAllRanges();
                }
                
                if (document.activeElement && document.activeElement.getAttribute('contenteditable') === 'true') {
                    document.activeElement.blur();
                }
            }
        }
    });

    console.log("✅ Smart Text Interaction (Stable) added successfully.");
})();

/* =========================================================================
   PERFORMANCE ADDON: Smart Thumbnail Debouncer (Anti-Freeze)
   ========================================================================= */
(function installAntiLag() {
    console.log("🛠️ Anti-Lag Script initializing...");

    let thumbnailTimer = null;

    // Lightweight debounce — the new generateThumbnail handles its own sequencing
    window.updateThumbnails = function() {
        if (thumbnailTimer) clearTimeout(thumbnailTimer);
        thumbnailTimer = setTimeout(() => {
            // Skip if the user is actively dragging, cropping, or typing
            if (state.dragMode || state.cropMode || (document.activeElement && document.activeElement.isContentEditable)) {
                window.updateThumbnails();
                return;
            }
            if (typeof generateThumbnail === 'function') generateThumbnail(state.currentPageIndex);
        }, 300); 
    };

    console.log("✅ Anti-Lag successfully applied.");
})();
/* =========================================================================
   DRAG & DROP IMPORT FIX (Images, .pub, .doc, .docx, .json, .opub)
   ========================================================================= */
(function installDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }
    document.body.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (!files || files.length === 0) return;

        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        const otherFiles = Array.from(files).filter(f => !f.type.startsWith('image/'));

        // --- A. HANDLE IMAGES (BATCH SMART SWAP) ---
        if (imageFiles.length > 0) {
            let selectedTargets = [];
            if (state.multiSelected && state.multiSelected.length > 0) {
                selectedTargets = state.multiSelected.filter(el => el.getAttribute('data-type') === 'image' || el.querySelector('img'));
            } else if (state.selectedEl && (state.selectedEl.getAttribute('data-type') === 'image' || state.selectedEl.querySelector('img'))) {
                selectedTargets = [state.selectedEl];
            }

            if (imageFiles.length > 1 && selectedTargets.length <= 1) {
                const allPlaceholders = Array.from(document.querySelectorAll('.pub-element[data-is-placeholder="true"]'));
                if (allPlaceholders.length > 0) {
                    allPlaceholders.sort((a, b) => {
                        const rectA = a.getBoundingClientRect();
                        const rectB = b.getBoundingClientRect();
                        if (Math.abs(rectA.top - rectB.top) < 50) return rectA.left - rectB.left;
                        return rectA.top - rectB.top;
                    });
                    if (selectedTargets.length === 1 && selectedTargets[0].getAttribute('data-is-placeholder') === 'true') {
                        const otherPlaceholders = allPlaceholders.filter(p => p !== selectedTargets[0]);
                        selectedTargets = [selectedTargets[0], ...otherPlaceholders];
                    } else {
                        selectedTargets = allPlaceholders;
                    }
                }
            }

            const paperEl = document.getElementById('paper');
            const rect = paperEl.getBoundingClientRect();
            const scale = typeof getScale === 'function' ? getScale() : 1;
            let dropX = (e.clientX - rect.left) / scale;
            let dropY = (e.clientY - rect.top) / scale;
            let filesProcessed = 0;

            imageFiles.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const result = evt.target.result;
                    if (index < selectedTargets.length) {
                        const target = selectedTargets[index];
                        const img = target.querySelector('.element-content img') || target.querySelector('img');
                        if (img) {
                            img.src = result;
                            img.removeAttribute('crossorigin');
                            img.style.objectFit = 'fill';
                            target.removeAttribute('data-is-placeholder');
                        }
                        filesProcessed++;
                        if (filesProcessed === imageFiles.length) {
                            if (typeof pushHistory === 'function') pushHistory();
                            if (typeof updateThumbnails === 'function') updateThumbnails();
                        }
                    } else {
                        const offset = (index - selectedTargets.length) * 20;
                        const tempImg = new Image();
                        tempImg.onload = function() {
                            const maxWidth = 400; const maxHeight = 400;
                            let targetWidth = tempImg.width; let targetHeight = tempImg.height;
                            if (targetWidth > maxWidth || targetHeight > maxHeight) {
                                const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
                                targetWidth = targetWidth * ratio; targetHeight = targetHeight * ratio;
                            }
                            if (typeof createWrapper === 'function') {
                                const wrapper = createWrapper(`<img src="${result}" style="width:100%; height:100%; position:absolute; top:0; left:0; pointer-events:none;">`);
                                wrapper.style.width = targetWidth + 'px'; 
                                wrapper.style.height = targetHeight + 'px';
                                wrapper.setAttribute('data-type', 'image');
                                wrapper.style.left = (dropX + offset) + 'px';
                                wrapper.style.top = (dropY + offset) + 'px';
                            }
                            filesProcessed++;
                            if (filesProcessed === imageFiles.length) {
                                if (typeof pushHistory === 'function') pushHistory();
                                if (typeof updateThumbnails === 'function') updateThumbnails();
                            }
                        };
                        tempImg.src = result;
                    }
                };
                reader.readAsDataURL(file);
            });
        }

        otherFiles.forEach(file => {
            const fileName = file.name.toLowerCase();
            
            // --- B. HANDLE PUBLISHER FILES (.pub, .pubx) ---
            if (fileName.endsWith('.pub') || fileName.endsWith('.pubx')) {
                if (typeof uploadAndConvertPub === 'function') uploadAndConvertPub(file);
            } 
            
            // --- C. HANDLE WORD DOCUMENTS (.doc, .docx) ---
            else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
                if (typeof uploadAndConvertDoc === 'function') uploadAndConvertDoc(file);
            } 
            
            // --- D. HANDLE OPENPUBLISHER NATIVE FILES (.json, .opub) ---
            else if (fileName.endsWith('.json') || fileName.endsWith('.opub')) {
                const reader = new FileReader();
                reader.onload = window.handlePublisherFileLoad;
                reader.readAsText(file);
            }
            
            // --- E. HANDLE EXCEL SPREADSHEETS (.xls, .xlsx) ---
            else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
                if (typeof uploadAndConvertExcel === 'function') uploadAndConvertExcel(file, fileName);
            }
        });
    }
})();
/* =========================================================================
   EXCEL SPREADSHEET CONVERSION ENDPOINT (.xls / .xlsx)
   ========================================================================= */
/* =========================================================================
   PUBLISHER DOCUMENT CONVERSION ENDPOINT (.pub / .pubx)
   (Fixed FormData Key)
   ========================================================================= */
/* =========================================================================
   OPENPUBLISHER ADDON: Unifide Orientation (noflicker)
   ========================================================================= */
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
}/* =========================================================================
   OPENPUBLISHER ADDON: THE UNIFIED ORIENTATION ENGINE (MANUAL-OVERRIDE SAFE)
   ========================================================================= */

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
/* =========================================================================
   ABOUT BOX & YWA.APP SPONSOR PATCH
   ========================================================================= */
(function initAboutBox() {
    // 1. Automatically inject the "About" button into the "File" ribbon tab
    function injectButton() {
        const fileRibbon = document.getElementById('ribbon-file');
        if (fileRibbon && !document.getElementById('about-btn-group')) {
            const aboutGroup = document.createElement('div');
            aboutGroup.id = 'about-btn-group';
            aboutGroup.className = 'group';
            aboutGroup.innerHTML = `
                <div class="tool-btn" onclick="window.showAboutDialog()"><i class="fas fa-info-circle"></i>About</div>
                <div class="group-label">Info</div>
            `;
            fileRibbon.appendChild(aboutGroup);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectButton);
    } else {
        injectButton();
    }

    // 2. Render the Custom About Dialog
    window.showAboutDialog = function() {
        const aboutHtml = `
            <style>
                .about-container { font-family: 'Segoe UI', Roboto, Helvetica, sans-serif; color: #334155; text-align: center; padding: 5px; box-sizing: border-box; width: 100%; }
                .about-header { margin-bottom: 15px; }
                
                /* Increased Title & Logo Size */
                .about-title { font-size: 30px; font-weight: 700; color: var(--ui-theme-color); display: flex; align-items: center; justify-content: center; gap: 10px; }
                .about-title i { font-size: 36px; }
                
                .about-subtitle { font-size: 13px; color: #64748b; font-weight: 500; margin-top: 4px; }
                .about-desc { font-size: 13px; line-height: 1.5; margin-bottom: 18px; padding: 0 10px; }
                
                /* ywa.app Premium Sponsor Card */
                .ywa-card {
                    display: flex; align-items: center; gap: 15px; padding: 15px;
                    background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px;
                    text-align: left; transition: all 0.2s ease; margin-bottom: 5px;
                }
                .ywa-card:hover { border-color: #cbd5e1; background: #f1f5f9; }
                .ywa-logo { width: 56px; height: 56px; object-fit: contain; flex-shrink: 0; border-radius: 8px; }
                .ywa-info { flex: 1; }
                .ywa-title { font-weight: 600; font-size: 14px; color: #0f172a; margin-bottom: 4px; }
                .ywa-desc { font-size: 12px; color: #475569; line-height: 1.4; }
                .ywa-link { color: #0ea5e9; text-decoration: none; font-weight: 600; transition: color 0.2s; }
                .ywa-link:hover { text-decoration: underline; color: #0284c7; }

                /* Integrated Green Donate Buttons */
                .about-donate-container { display: flex; flex-direction: column; gap: 4px; opacity: 0; align-items: flex-start; }
                .about-donate-label { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding-left: 2px; }
                .about-donate-btns-wrapper { display: flex; gap: 8px; }
                .about-donate-btn {
                    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
                    color: #ffffff; padding: 6px 14px; border-radius: 4px;
                    text-decoration: none; font-weight: 600; font-size: 13px; white-space: nowrap;
                    transition: all 0.2s; border: none; cursor: pointer; 
                }
                .patreon-btn { background: #FF424D; }
                .patreon-btn:hover { background: #e03640; color: white; text-decoration: none; }
                .paypal-btn { background: #0079C1; }
                .paypal-btn:hover { background: #005a9c; color: white; text-decoration: none; }

                /* Footer Dev Links (GitHub & CodePen) */
                .about-center-links { display: flex; gap: 16px; opacity: 0; align-items: center; }
                .about-footer-link {
                    display: inline-flex; align-items: center; gap: 6px;
                    color: #64748b; text-decoration: none; font-size: 13.5px; font-weight: 600;
                    transition: color 0.2s;
                }
                .about-footer-link:hover { color: #0f172a; text-decoration: none; }
                .about-footer-link i { font-size: 16px; }
            </style>

            <div class="about-container">
                <div class="about-header">
                    <div class="about-title"><i class="fas fa-print"></i> Open Publisher</div>
                    <div class="about-subtitle">Free Online Desktop Publishing Tool</div>
                </div>
                
                <div class="about-desc">
                    An open-source, no-signup alternative to traditional desktop publishing software. 
                    It is <strong>100% ad-free</strong> and completely free to use. Design flyers and documents locally in your browser, with support for 
                    <strong>.pub</strong>, <strong>.doc</strong>, and <strong>.docx</strong> files via cloud conversion.
                </div>

                <div class="ywa-card">
                    <img src="https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/VkbZiaJ.png" alt="ywa.app Logo" class="ywa-logo">
                    <div class="ywa-info">
                        <div class="ywa-title">Featured on ywa.app</div>
                        <div class="ywa-desc">
                            Find Open Publisher and explore a network of fast, secure, and zero-install web applications at <a href="https://ywa.app" target="_blank" class="ywa-link">ywa.app</a>.
                        </div>
                    </div>
                </div>

                <div id="about-donate-btn" class="about-donate-container">
                    <div class="about-donate-label">Support the Project</div>
                    <div class="about-donate-btns-wrapper">
                        <a href="https://www.patreon.com/cw/OpenPublisher" target="_blank" class="about-donate-btn patreon-btn">
                            <i class="fab fa-patreon"></i> Patreon
                        </a>
                        <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=ltait95@yahoo.co.uk&item_name=Support+Your+Web+Apps" target="_blank" class="about-donate-btn paypal-btn">
                            <i class="fab fa-paypal"></i> PayPal
                        </a>
                    </div>
                </div>
                
                <div id="about-center-links" class="about-center-links">
                    <a href="https://github.com/rmellis/open-publisher" target="_blank" class="about-footer-link">
                        <i class="fab fa-github"></i> GitHub
                    </a>
                    <a href="https://codepen.io/rmellis/pen/bNexPwL" target="_blank" class="about-footer-link">
                        <i class="fab fa-codepen"></i> CodePen
                    </a>
                </div>
            </div>
        `;

        if (typeof DialogSystem !== 'undefined') {
            DialogSystem.init(); 
            DialogSystem.show('About', aboutHtml, null, true);
        }

        // Bulletproof loop
        let moveAttempts = 0;
        const moveInterval = setInterval(() => {
            const donateBtn = document.getElementById('about-donate-btn');
            const centerLinks = document.getElementById('about-center-links');
            const actionRow = document.querySelector('.custom-dialog-footer');
            const dialogBox = document.getElementById('custom-dialog-box');

            if (donateBtn && centerLinks && actionRow && dialogBox) {
                // Lock the width so the text wraps beautifully and buttons fit
                dialogBox.style.setProperty('width', '520px', 'important');
                dialogBox.style.setProperty('max-width', '95vw', 'important');

                // Adjust footer to perfectly split 3 elements: Left, Center Block, Right
                actionRow.style.display = 'flex';
                actionRow.style.justifyContent = 'space-between';
                actionRow.style.alignItems = 'center';
                actionRow.style.width = '100%';
                
                // Find the OK button
                const buttons = actionRow.querySelectorAll('button');
                let okBtn = null;
                buttons.forEach(b => { 
                    if (b.innerText.trim().toUpperCase() === 'OK' || b.innerText.trim().toUpperCase() === 'CLOSE') okBtn = b; 
                });
                if (!okBtn && buttons.length > 0) okBtn = buttons[buttons.length - 1];

                // Unhide the injected elements
                donateBtn.style.opacity = '1';
                centerLinks.style.opacity = '1';
                
                // Inject them in order BEFORE the OK button: [Donate] -> [Center Block] -> [OK]
                if (okBtn) {
                    actionRow.insertBefore(donateBtn, okBtn);
                    actionRow.insertBefore(centerLinks, okBtn);
                } else {
                    actionRow.appendChild(donateBtn);
                    actionRow.appendChild(centerLinks);
                }
                
                clearInterval(moveInterval); // Success! Stop looping.
            }

            moveAttempts++;
            if (moveAttempts > 20) {
                if (donateBtn) donateBtn.style.opacity = '1';
                if (centerLinks) centerLinks.style.opacity = '1';
                clearInterval(moveInterval);
            }
        }, 20); 
    };
})();
/* =========================================================================
   3D VIEW TOPOLOGY (COMPACT STACK MATH FIX)
   ========================================================================= */
(function init3DViewMode() {
    function inject3DViewButton() {
        const viewRibbon = document.getElementById('ribbon-view');
        if (viewRibbon && !document.getElementById('3dview-btn-group')) {
            const viewGroup = document.createElement('div');
            viewGroup.id = '3dview-btn-group';
            viewGroup.className = 'group';
            viewGroup.innerHTML = `
                <div class="tool-btn" onclick="window.toggle3DView()"><i class="fas fa-cube"></i>3D View</div>
                <div class="group-label">Topology</div>
            `;
            viewRibbon.appendChild(viewGroup);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject3DViewButton);
    } else {
        inject3DViewButton();
    }

    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    window.is3DViewActive = false;
    window.toggle3DView = function() {
        const livePaper = document.getElementById('paper');
        const viewport = document.getElementById('viewport'); 
        if (!livePaper || !viewport) return;

        if (window.is3DViewActive) {
            window.is3DViewActive = false;
            const overlay = document.getElementById('native-3d-overlay');
            if (overlay) overlay.remove();
            livePaper.style.opacity = '1'; 
            return;
        }

        window.is3DViewActive = true;

        const paperClone = livePaper.cloneNode(true);
        paperClone.id = '3d-paper-clone';

        const allCloneNodes = paperClone.querySelectorAll('*');
        allCloneNodes.forEach(node => {
            if (node.id) node.id = node.id + '-clone';
            node.removeAttribute('contenteditable');
            node.style.userSelect = 'none'; 
            if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(node.tagName)) {
                node.disabled = true;
            }
        });
        
        let activeZoom = (typeof state !== 'undefined' && state.zoom) ? state.zoom : 1.0;
        let rotX = 60;
        let rotZ = -25;
        let panY = 0; 

        const updateTransform = () => {
            paperClone.style.transform = `translateY(${panY}px) scale(${activeZoom}) rotateX(${rotX}deg) rotateZ(${rotZ}deg)`;
        };
        
        paperClone.style.opacity = '1'; 
        paperClone.style.backgroundColor = '#ffffff'; 
        paperClone.style.position = 'relative';
        paperClone.style.top = 'auto';
        paperClone.style.left = 'auto';
        paperClone.style.margin = '0';
        paperClone.style.transformStyle = 'preserve-3d';
        paperClone.style.transition = 'transform 0.1s ease-out'; 
        paperClone.style.boxShadow = '-30px 40px 60px rgba(0,0,0,0.2)'; 
        paperClone.style.pointerEvents = 'none'; 
        
        updateTransform(); 

        livePaper.style.opacity = '0';

        const overlay = document.createElement('div');
        overlay.id = 'native-3d-overlay';
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.zIndex = '9999';
        overlay.style.background = 'transparent'; 
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.perspective = '2500px';
        overlay.style.overflow = 'hidden';
        overlay.style.cursor = 'grab'; 

        const ctrlPanel = document.createElement('div');
        ctrlPanel.className = 'xray-ctrl-panel';

        const zoomInBtn = document.createElement('button');
        zoomInBtn.className = 'xray-btn-icon';
        zoomInBtn.innerHTML = '<i class="fas fa-search-plus"></i>';
        zoomInBtn.title = "Zoom In (Ctrl + Scroll Up)";
        zoomInBtn.onclick = () => { activeZoom = Math.min(activeZoom + 0.1, 3.0); updateTransform(); };

        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.className = 'xray-btn-icon';
        zoomOutBtn.innerHTML = '<i class="fas fa-search-minus"></i>';
        zoomOutBtn.title = "Zoom Out (Ctrl + Scroll Down)";
        zoomOutBtn.onclick = () => { activeZoom = Math.max(activeZoom - 0.1, 0.3); updateTransform(); };

        const closeBtn = document.createElement('button');
        closeBtn.className = 'xray-btn-close';
        closeBtn.innerHTML = '<i class="fas fa-times"></i> Close 3D View';
        closeBtn.onclick = window.toggle3DView;

        ctrlPanel.appendChild(zoomOutBtn);
        ctrlPanel.appendChild(zoomInBtn);
        ctrlPanel.appendChild(closeBtn);

        let isDragging = false, prevMouse = { x: 0, y: 0 };
        
        overlay.onmousedown = (e) => { 
            if (e.target.closest('.xray-ctrl-panel')) return;
            isDragging = true; 
            overlay.style.cursor = 'grabbing';
            prevMouse = { x: e.clientX, y: e.clientY }; 
        };
        overlay.onmouseup = () => { isDragging = false; overlay.style.cursor = 'grab'; };
        overlay.onmouseleave = () => { isDragging = false; overlay.style.cursor = 'grab'; };
        overlay.onmousemove = (e) => {
            if (isDragging) {
                const delta = { x: e.clientX - prevMouse.x, y: e.clientY - prevMouse.y };
                rotZ += delta.x * 0.4; 
                rotX -= delta.y * 0.4;
                updateTransform();
                prevMouse = { x: e.clientX, y: e.clientY };
            }
        };

        overlay.onwheel = (e) => {
            e.preventDefault(); 
            if (e.ctrlKey || e.metaKey) {
                const zoomSpeed = 0.05;
                if (e.deltaY < 0) activeZoom += zoomSpeed;
                else activeZoom -= zoomSpeed;
                activeZoom = Math.max(0.3, Math.min(activeZoom, 3.0)); 
            } else {
                panY -= e.deltaY; 
            }
            updateTransform();
        };

        overlay.appendChild(paperClone);
        overlay.appendChild(ctrlPanel);
        
        if (window.getComputedStyle(viewport).position === 'static') {
            viewport.style.position = 'relative'; 
        }
        
        viewport.appendChild(overlay);
        
        setTimeout(() => {
            const liveElements = Array.from(livePaper.children);
            const cloneElements = Array.from(paperClone.children);

            const isStructural = (el) => {
                const pos = window.getComputedStyle(el).position;
                return el.id === 'margin-guides' || el.id === 'page-border' || el.tagName === 'CANVAS' || el.classList.contains('page-header') || el.classList.contains('page-footer') || pos !== 'absolute';
            };

            const interactiveItems = [];

            liveElements.forEach((liveEl, index) => {
                const cloneEl = cloneElements[index];
                if (!cloneEl) return;

                const liveComputed = window.getComputedStyle(liveEl);

                if (isStructural(liveEl)) {
                    if (cloneEl.tagName === 'CANVAS' || cloneEl.classList.contains('page-background')) cloneEl.style.opacity = '0';
                    cloneEl.style.transform = 'translateZ(0px)';
                } else {
                    cloneEl.style.position = liveComputed.position;
                    cloneEl.style.left = liveComputed.left;
                    cloneEl.style.top = liveComputed.top;
                    cloneEl.style.width = liveComputed.width;
                    cloneEl.style.height = liveComputed.height;
                    cloneEl.style.zIndex = liveComputed.zIndex;
                    
                    // Push to array so we can sort them by rank
                    interactiveItems.push({
                        clone: cloneEl,
                        zVal: parseInt(liveComputed.zIndex) || 0
                    });
                }
            });

            // Sort by actual Z-Index to find their exact physical stacking rank
            interactiveItems.sort((a, b) => a.zVal - b.zVal);

            // THE FIX: Compact Cloud Math. Base lift + tiny micro-step.
            interactiveItems.forEach((item, rankIndex) => {
                // Base lift of 50px off the paper, plus a micro 2px step to stop clipping!
                const zOffset = 50 + (rankIndex * 2); 
                
                item.clone.style.transform = `translateZ(${zOffset}px)`;
                item.clone.style.boxShadow = '-8px 12px 18px rgba(0,0,0,0.15)';
                item.clone.style.backgroundColor = '#ffffff'; 
                item.clone.style.border = '1px solid var(--ui-theme-color)';
                item.clone.style.transformStyle = 'flat';
                item.clone.style.textShadow = '0px 0px 1px rgba(0,0,0,0.2)';
                item.clone.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        }, 10);
    };
})();
/* =========================================================================
   UNIFIED DRAGGABLE MODALS PATCH (Clean DOM Rescue Architecture)
   ========================================================================= */
(function initDraggableModals() {
    
    // 1. THE SAFE ZONE: Creates a hidden bunker to protect grids from being deleted
    window.rescueGrids = function rescueGrids() {
        let safeZone = document.getElementById('modal-safe-zone');
        if (!safeZone) {
            safeZone = document.createElement('div');
            safeZone.id = 'modal-safe-zone';
            safeZone.style.display = 'none';
            document.body.appendChild(safeZone);
        }
        const grids = ['template-cats', 'template-grid', 'clipart-grid', 'ad-grid', 'dialog-wordart-grid', 'beta-wa-grid'];
        grids.forEach(id => {
            const el = document.getElementById(id);
            if (el) safeZone.appendChild(el); 
        });
    }

    // 2. MONKEY-PATCH DIALOGSYSTEM: We intercept Show and Close to save the grids first!
    if (typeof DialogSystem !== 'undefined' && !DialogSystem._isPatchedForGrids) {
        const originalShow = DialogSystem.show;
        DialogSystem.show = function() {
            rescueGrids(); // Save grids before overwriting HTML
            if (originalShow) originalShow.apply(this, arguments);
        };

        const originalClose = DialogSystem.close;
        DialogSystem.close = function() {
            rescueGrids(); // Save grids before destroying the dialog box!
            if (originalClose) originalClose.apply(this, arguments);
        };
        
        DialogSystem._isPatchedForGrids = true;
    }


    // 4. TEMPLATES MODAL OVERRIDE
    if (!window._originalLoadTemplate) {
        window._originalLoadTemplate = window.loadTemplate;
        window.loadTemplate = function(t) {
            DialogSystem.close(); 
            setTimeout(() => window._originalLoadTemplate(t), 100); 
        };
    }

    window.showTemplateModal = function() {
        rescueGrids();
        const cats = document.getElementById('template-cats');
        const grid = document.getElementById('template-grid');
        if (!cats || !grid) return; 

        const html = `<div id="dialog-template-container" style="display:flex; flex-direction:column; gap:15px;"></div>`;
        DialogSystem.show('Publication Templates', html, null, true);
        
        const dialogBox = document.getElementById('custom-dialog-box');
        if(dialogBox) {
            dialogBox.style.width = '850px';
            dialogBox.style.maxWidth = '95vw';
            const body = dialogBox.querySelector('.custom-dialog-body');
            if (body) { body.style.maxHeight = '75vh'; body.style.overflowY = 'auto'; }
        }
        
        const container = document.getElementById('dialog-template-container');
        if(container) {
            container.appendChild(cats);
            container.appendChild(grid);
            cats.style.display = 'flex';
            grid.style.display = 'grid';
        }
    };

    // 5. CLIPART MODAL OVERRIDE
    window.showClipartModal = function() {
        rescueGrids();
        const grid = document.getElementById('clipart-grid');
        if (!grid) return;

        const html = `<div id="dialog-clipart-container"></div>`;
        DialogSystem.show('Emojis', html, null, true);
        
        const dialogBox = document.getElementById('custom-dialog-box');
        if(dialogBox) { 
            dialogBox.style.width = '800px'; 
            dialogBox.style.maxWidth = '95vw'; 
            const body = dialogBox.querySelector('.custom-dialog-body');
            if (body) { body.style.maxHeight = '70vh'; body.style.overflowY = 'auto'; }
        }
        
        const container = document.getElementById('dialog-clipart-container');
        if (container) {
            container.appendChild(grid);
            grid.style.display = 'grid';
        }
        
        Array.from(grid.children).forEach(item => {
            if (item.classList.contains('gallery-item') && !item.dataset.modalHooked) {
                const originalClick = item.onclick;
                item.onclick = (e) => {
                    DialogSystem.close();
                    if(originalClick) originalClick(e);
                };
                item.dataset.modalHooked = 'true';
            }
        });
    };

    // 6. ADS MODAL OVERRIDE
    window.showAdModal = function() {
        rescueGrids();
        const grid = document.getElementById('ad-grid');
        if (!grid) return;

        const html = `<div id="dialog-ad-container"></div>`;
        DialogSystem.show('Advertisement Templates', html, null, true);
        
        const dialogBox = document.getElementById('custom-dialog-box');
        if(dialogBox) { 
            dialogBox.style.width = '700px'; 
            dialogBox.style.maxWidth = '95vw'; 
            const body = dialogBox.querySelector('.custom-dialog-body');
            if (body) { body.style.maxHeight = '65vh'; body.style.overflowY = 'auto'; }
        }
        
        const container = document.getElementById('dialog-ad-container');
        if (container) {
            container.appendChild(grid);
            grid.style.display = 'grid';
        }
        
        Array.from(grid.children).forEach(item => {
            if (item.classList.contains('gallery-item') && !item.dataset.modalHooked) {
                const originalClick = item.onclick;
                item.onclick = (e) => {
                    DialogSystem.close();
                    if(originalClick) originalClick(e);
                };
                item.dataset.modalHooked = 'true';
            }
        });
    };

})();
/* =========================================================================
   WordArt Extention pack 1 (Styles 61 - 200)
   140 Pure CSS Styles: High-Contrast Edition (Glares & Blurs Fixed)
   ========================================================================= */
(function initWordArtExpansion() {
    
    // 1. INJECT THE MASSIVE CSS PAYLOAD
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // 2. NON-DESTRUCTIVE MODAL INJECTION
    /* Legacy WordArt injection replaced by optimized core modal */
})();
/* =========================================================================
   WebApp Protection
   ========================================================================= */
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
/* =========================================================================
   TEMPLATE ENGINE V11 (Category Filter Fix & Safe-Zone Designs)
   ========================================================================= */
(function initTemplateEngineV11() {

    // 1. DIALOG CRASH PREVENTION
    if (typeof DialogSystem !== 'undefined' && !DialogSystem._isSafelyPatched) {
        const originalShow = DialogSystem.show;
        DialogSystem.show = function(title, content, onConfirm, isAlert) {
            const safeConfirm = onConfirm ? function() {
                try { onConfirm(); } catch(e) { console.error("Dialog Blocked:", e); }
            } : null;
            originalShow.call(DialogSystem, title, content, safeConfirm, isAlert);
        };
        DialogSystem._isSafelyPatched = true;
    }

    // 2. THE BULLETPROOF EDITABLE SWEEP
    if (typeof window.originalRenderPage_BeforeEditSweep === 'undefined') {
        window.originalRenderPage_BeforeEditSweep = window.renderPage;
        window.renderPage = function(page) {
            const ret = window.originalRenderPage_BeforeEditSweep(page);
            setTimeout(() => {
                const paperEl = document.getElementById('paper');
                if (!paperEl) return;
                const pubElements = paperEl.querySelectorAll('.pub-element');
                pubElements.forEach(el => {
                    const contentContainer = el.querySelector('.element-content');
                    if (!contentContainer) return;
                    const innerNode = contentContainer.firstElementChild;
                    if (!innerNode) return;
                    if (innerNode.tagName !== 'IMG' && innerNode.tagName !== 'CANVAS' && innerNode.tagName !== 'SVG' && !innerNode.style.clipPath && !innerNode.classList.contains('wa-wrapper')) {
                        innerNode.setAttribute('contenteditable', 'true');
                        innerNode.setAttribute('spellcheck', 'false');
                        contentContainer.style.pointerEvents = 'auto';
                    }
                });
            }, 50);
            return ret;
        };
    }

    // 3. THE NEW TEMPLATES DATA (Now with Category 'c' tags)
    const newTemplates = [
        {
            c: "Flyers", n: "Modern Tech Flyer", w: 816, h: 1056, bg: "#1a1a2e",
            els: [
                {html: `<div style="background: #1a1a2e; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Segoe UI', sans-serif; font-size: 72px; font-weight: 800; color: #00e5ff; text-align: center; z-index: 2;">CYBER SYMPOSIUM</div>`, t: 100, l: 50, w: 716, h: 120},
                {html: `<div style="background: #e94560; z-index: 3;"></div>`, t: 220, l: 200, w: 416, h: 5},
                {html: `<div style="font-family: 'Segoe UI', sans-serif; font-size: 24px; color: #e0e0e0; text-align: center; letter-spacing: 2px; z-index: 4;">SHAPING THE FUTURE OF DIGITAL ARCHITECTURE</div>`, t: 260, l: 100, w: 616, h: 100},
                {html: `<div style="font-family: 'Segoe UI', sans-serif; font-size: 18px; color: #888; text-align: center; z-index: 5;">OCTOBER 12TH, 2026 | INNOVATION CENTER<br>WWW.OPENSYMPOSIUM.COM</div>`, t: 650, l: 100, w: 616, h: 100}
            ]
        },
        {
            c: "Resumes", n: "Clean Executive Resume", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="font-family: 'Georgia', serif; font-size: 48px; color: #2c3e50; z-index: 2;">Alex Morgan</div>`, t: 60, l: 50, w: 400, h: 60},
                {html: `<div style="font-family: 'Segoe UI', sans-serif; font-size: 18px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 3px; z-index: 3;">Senior Operations Director</div>`, t: 120, l: 50, w: 400, h: 30},
                {html: `<div style="background: #bdc3c7; z-index: 4;"></div>`, t: 160, l: 50, w: 716, h: 2},
                {html: `<div style="font-family: 'Segoe UI', sans-serif; font-size: 16px; font-weight: bold; color: #34495e; z-index: 5;">EXPERIENCE</div>`, t: 200, l: 50, w: 200, h: 30},
                {html: `<div style="font-family: 'Segoe UI', sans-serif; font-size: 14px; color: #333; line-height: 1.6; z-index: 6;"><b>Global Corp Inc. | 2020 - Present</b><br>Spearheaded international logistics redesign resulting in a 24% reduction in overhead costs. Managed a cross-functional team of 150+ employees across three continents.</div>`, t: 200, l: 280, w: 486, h: 150},
                {html: `<div style="font-family: 'Segoe UI', sans-serif; font-size: 16px; font-weight: bold; color: #34495e; z-index: 7;">EDUCATION</div>`, t: 400, l: 50, w: 200, h: 30},
                {html: `<div style="font-family: 'Segoe UI', sans-serif; font-size: 14px; color: #333; line-height: 1.6; z-index: 8;"><b>Master of Business Administration</b><br>University of Excellence | Class of 2018</div>`, t: 400, l: 280, w: 486, h: 100}
            ]
        },
        {
            c: "Posters", n: "Bold Sale Poster", w: 816, h: 1056, bg: "#e74c3c",
            els: [
                {html: `<div style="background: #e74c3c; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Impact', sans-serif; font-size: 150px; color: #ffffff; text-align: center; text-shadow: 5px 5px 0px #c0392b; z-index: 2;">MASSIVE</div>`, t: 80, l: 50, w: 716, h: 200},
                {html: `<div style="font-family: 'Impact', sans-serif; font-size: 180px; color: #f1c40f; text-align: center; text-shadow: 5px 5px 0px #c0392b; z-index: 3;">SALE!</div>`, t: 250, l: 50, w: 716, h: 200},
                {html: `<div style="background: #ffffff; border: 4px solid #c0392b; z-index: 4;"></div>`, t: 480, l: 100, w: 616, h: 100},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 40px; font-weight: bold; color: #e74c3c; text-align: center; z-index: 5; padding-top: 25px;">UP TO 75% OFF EVERYTHING</div>`, t: 480, l: 100, w: 616, h: 100},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 24px; font-weight: bold; color: #ffffff; text-align: center; z-index: 6;">THIS WEEKEND ONLY. DO NOT MISS OUT.</div>`, t: 680, l: 50, w: 716, h: 50}
            ]
        }
    ];

    // 4. INJECT ADDONS FORCEFULLY (Category Aware)
    function injectAddonTemplates() {
        const grid = document.getElementById('template-grid');
        const activeBtn = document.querySelector('.cat-btn.active');
        if (!grid || !activeBtn) return;
        
        const activeCat = activeBtn.innerText.trim();
        
        // Remove any addons currently injected so we don't get duplicates
        const existing = grid.querySelectorAll('.addon-injected');
        existing.forEach(el => el.remove());
        
        // Filter out templates that don't match the current tab
        const templatesToShow = newTemplates.filter(t => t.c === activeCat);

        templatesToShow.forEach((t) => {
            const div = document.createElement('div');
            div.className = 'tp-item addon-injected';
            const scale = 100 / (t.w || 794); 
            
            let previewHTML = '';
            t.els.forEach(el => {
                let styleFix = "";
                if(el.html.includes('z-index: 1') || el.h > 1000) styleFix = "width: 100%; height: 100%;";
                previewHTML += `<div style="position:absolute; top:${el.t}px; left:${el.l}px; width:${el.w}px; height:${el.h}px; z-index:1; ${styleFix}">${el.html}</div>`;
            });

            const content = `<div style="width: ${t.w}px; height: ${t.h}px; background: ${t.bg}; transform: scale(${scale}); transform-origin: 0 0; overflow: hidden; position: absolute; top: 0; left: 0; pointer-events: none;">${previewHTML}</div>`;
            div.innerHTML = `<div class="template-preview" style="position:relative;">${content}<span style="position:absolute; top:2px; right:2px; background:#ff00de; color:#fff; font-size:9px; padding:2px 4px; font-weight:bold; border-radius:3px;">NEW</span></div><div style="font-size:12px; margin-top:5px;">${t.n}</div>`;
            div.onclick = () => window.loadTemplate(t); 
            grid.appendChild(div);
        });
    }

    if (typeof window.showTemplateModal !== 'undefined') {
        const originalShowTemplateModal = window.showTemplateModal;
        window.showTemplateModal = function() {
            originalShowTemplateModal(); 
            setTimeout(injectAddonTemplates, 100);
        };
    }
    document.addEventListener('click', (e) => {
        if(e.target && e.target.classList && e.target.classList.contains('cat-btn')) {
            setTimeout(injectAddonTemplates, 100); 
        }
    });

    // 5. THE UNIVERSAL LOADER
    window.loadTemplate = function(t) {
        DialogSystem.close(); 
        
        setTimeout(() => {
            DialogSystem.show('Load Template', '<p>Load this template? This will replace your current page content.</p>', () => {
                DialogSystem.close(); 
                
                try {
                    if (state.pages && state.pages.length > 0) {
                        state.pages[state.currentPageIndex] = serializeCurrentPage();
                        pushHistory();
                    }
                } catch(e) {}

                setTimeout(() => {
                    const paperEl = document.getElementById('paper');
                    if (!paperEl) return;

                    const pW = t.w || 794;
                    const pH = t.h || 1123;
                    paperEl.style.width = pW + 'px';
                    paperEl.style.height = pH + 'px';
                    paperEl.style.background = t.bg || '#ffffff';

                    const structural = paperEl.querySelectorAll('.margin-guides, .page-border-container, .page-header, .page-footer');
                    paperEl.innerHTML = '';
                    structural.forEach(el => paperEl.appendChild(el));

                    t.els.forEach((el, index) => {
                        let cleanHtml = el.html.replace(/<(h[1-6]|p|ul|li)(\s|>)/gi, '<div$2').replace(/<\/(h[1-6]|p|ul|li)>/gi, '</div>');
                        
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = cleanHtml;
                        const innerEl = tempDiv.firstElementChild;
                        if(!innerEl) return;

                        let left = el.l + 'px', top = el.t + 'px', width = el.w + 'px', height = el.h + 'px';

                        const isBackground = (el.h >= pH - 10 && el.w >= pW - 10);
                        if (isBackground) {
                            left = '0px'; top = '0px'; width = '100%'; height = '100%';
                            innerEl.style.width = '100%'; innerEl.style.height = '100%';
                        }

                        innerEl.style.position = 'relative';
                        innerEl.style.left = '0';
                        innerEl.style.top = '0';
                        innerEl.style.width = '100%';
                        innerEl.style.height = '100%';

                        const wrapper = document.createElement('div');
                        wrapper.className = 'pub-element';
                        
                        wrapper.id = 'el-' + Date.now() + '-' + Math.floor(Math.random() * 100000) + '-' + index;
                        wrapper.setAttribute('data-type', 'box'); 
                        
                        wrapper.style.left = left; wrapper.style.top = top;
                        wrapper.style.width = width; wrapper.style.height = height;
                        wrapper.style.zIndex = innerEl.style.zIndex || (index + 1);
                        wrapper.setAttribute('data-scaleX', "1"); wrapper.setAttribute('data-scaleY', "1");

                        wrapper.innerHTML = `
                            <div class="element-content">${innerEl.outerHTML}</div>
                            <div class="resize-handle rh-nw" data-dir="nw"></div>
                            <div class="resize-handle rh-n" data-dir="n"></div>
                            <div class="resize-handle rh-ne" data-dir="ne"></div>
                            <div class="resize-handle rh-e" data-dir="e"></div>
                            <div class="resize-handle rh-se" data-dir="se"></div>
                            <div class="resize-handle rh-s" data-dir="s"></div>
                            <div class="resize-handle rh-sw" data-dir="sw"></div>
                            <div class="resize-handle rh-w" data-dir="w"></div>
                            <div class="rotate-stick"></div>
                            <div class="rotate-handle"></div>
                        `;
                        paperEl.appendChild(wrapper);
                    });

                    try {
                        state.pages[state.currentPageIndex] = serializeCurrentPage();
                        pushHistory();
                    } catch(e) {}

                    if (typeof window.renderPage === 'function') {
                        window.renderPage(state.pages[state.currentPageIndex]);
                    }
                }, 100);
            });
        }, 100);
    };
})();
/* =========================================================================
   MODERN EXPANSION PACK 1 (Hard-Coordinate Aura Fix & Image Auto-Heal)
   ========================================================================= */
(function initExpansionPack1() {
    
    // 0. PHYSICAL OVERRIDE FOR THE BROKEN IMAGE ICON
    // Scans the page and instantly swaps the dead Unsplash URL for a working one
    const fixBrokenImages = () => {
        const dead = '1459749411177';
        const live = 'https://images.unsplash.com/photo-1470229722913-7c092dbbfa26?auto=format&fit=crop&w=800&q=80';
        document.querySelectorAll('img').forEach(img => {
            if (img.src.includes(dead)) img.src = live;
        });
    };
    
    // 1. DATA FIX: Aura text shifted safely away from the edges
    const modernTemplates = [
        {
            c: "Magazines", n: "Aura Style Cover", w: 816, h: 1056, bg: "#f8f9fa",
            els: [
                {html: `<div style="background: #f8f9fa; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Times New Roman', Times, serif; font-size: 160px; font-weight: bold; color: #111; text-align: center; letter-spacing: -5px; line-height: 1; z-index: 2;">AURA</div>`, t: 50, l: 50, w: 716, h: 150},
                {html: `<div style="background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); border-radius: 10px; z-index: 3;"></div>`, t: 220, l: 50, w: 716, h: 550},
                // FIXED: Top (t) is now 320, Left (l) is now 60. This physical shift prevents the CSS rotation from clipping!
                {html: `<div style="font-family: Arial, sans-serif; font-size: 40px; font-weight: 900; color: #fff; text-shadow: 2px 2px 10px rgba(0,0,0,0.3); transform: rotate(-5deg); line-height: 1.1; z-index: 4;">THE<br>SPRING<br>ISSUE</div>`, t: 320, l: 60, w: 400, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #111; z-index: 5;"><b>EXCLUSIVE INTERVIEW</b><br>Inside the minds of tomorrow's top designers.</div>`, t: 820, l: 50, w: 300, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #111; text-align: right; z-index: 6;"><b>FASHION WEEK</b><br>10 trends you absolutely cannot miss this season.</div>`, t: 820, l: 466, w: 300, h: 100}
            ]
        },
        {
            c: "Menus", n: "L'Avenir Luxury Menu", w: 816, h: 1056, bg: "#1a1a1a",
            els: [
                {html: `<div style="background: #1a1a1a; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border: 2px solid #d4af37; z-index: 2;"></div>`, t: 30, l: 30, w: 756, h: 996},
                {html: `<div style="font-family: Georgia, serif; font-size: 64px; color: #d4af37; text-align: center; letter-spacing: 15px; z-index: 3;">L'AVENIR</div>`, t: 100, l: 100, w: 616, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #fff; text-align: center; letter-spacing: 5px; z-index: 4;">EST. 2026 | FINE DINING</div>`, t: 180, l: 100, w: 616, h: 30},
                {html: `<div style="font-family: Georgia, serif; font-size: 24px; color: #d4af37; border-bottom: 1px dashed #555; padding-bottom: 10px; z-index: 5;">STARTERS</div>`, t: 300, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #ccc; line-height: 1.8; z-index: 6;"><b>Truffle Arancini</b> ........................................ $18<br><span style="font-size:12px; color:#888;">Wild mushroom, parmesan, black truffle aioli</span></div>`, t: 360, l: 100, w: 616, h: 80},
                {html: `<div style="font-family: Georgia, serif; font-size: 24px; color: #d4af37; border-bottom: 1px dashed #555; padding-bottom: 10px; z-index: 7;">MAINS</div>`, t: 460, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #ccc; line-height: 1.8; z-index: 8;"><b>Wagyu Filet Mignon</b> ........................................ $65<br><span style="font-size:12px; color:#888;">Pomme purée, roasted asparagus, red wine jus</span></div>`, t: 520, l: 100, w: 616, h: 80}
            ]
        },
        {
            c: "Brochures", n: "Nova Tech Handout", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #0055ff; z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 350},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 80px; color: #fff; letter-spacing: -2px; z-index: 3;">NOVA.TECH</div>`, t: 100, l: 50, w: 716, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; color: #80aaff; letter-spacing: 2px; z-index: 4;">ENTERPRISE CLOUD SOLUTIONS</div>`, t: 200, l: 50, w: 716, h: 50},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 32px; font-weight: bold; color: #111; line-height: 1.2; z-index: 5;">Scaling your infrastructure shouldn't be a nightmare.</div>`, t: 450, l: 50, w: 300, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #555; line-height: 1.6; z-index: 6;">Our state-of-the-art serverless platform automatically provisions resources based on real-time traffic spikes, ensuring zero downtime and maximizing cost-efficiency.<br><br><b>• 99.99% Uptime Guarantee<br>• Automated Threat Detection<br>• Instant Scaling</b></div>`, t: 450, l: 400, w: 366, h: 400}
            ]
        }
    ];

    function injectModernPack() {
        const grid = document.getElementById('template-grid');
        const activeBtn = document.querySelector('.cat-btn.active');
        if (!grid || !activeBtn) return;
        const activeCat = activeBtn.innerText.trim();
        const existing = grid.querySelectorAll('.modern-pack-1');
        existing.forEach(el => el.remove());
        
        modernTemplates.filter(t => t.c === activeCat).forEach((t) => {
            const div = document.createElement('div');
            div.className = 'tp-item modern-pack-1';
            const scale = 100 / (t.w || 794); 
            let previewHTML = '';
            t.els.forEach(el => {
                let styleFix = (el.html.includes('z-index: 1') || el.h > 1000) ? "width: 100%; height: 100%;" : "";
                previewHTML += `<div style="position:absolute; top:${el.t}px; left:${el.l}px; width:${el.w}px; height:${el.h}px; z-index:1; ${styleFix}">${el.html}</div>`;
            });
            div.innerHTML = `<div class="template-preview" style="position:relative;"><div style="width: ${t.w}px; height: ${t.h}px; background: ${t.bg}; transform: scale(${scale}); transform-origin: 0 0; overflow: hidden; position: absolute; top: 0; left: 0; pointer-events: none;">${previewHTML}</div></div><div style="font-size:12px; margin-top:5px;">${t.n}</div>`;
            div.onclick = () => window.loadTemplate(t); 
            grid.appendChild(div);
        });
        fixBrokenImages(); 
    }

    if (typeof window.showTemplateModal !== 'undefined') {
        const originalModal = window.showTemplateModal;
        window.showTemplateModal = function() { originalModal(); setTimeout(injectModernPack, 150); };
    }
    document.addEventListener('click', (e) => {
        if(e.target && e.target.classList && e.target.classList.contains('cat-btn')) setTimeout(injectModernPack, 150); 
    });
    
    // Automatically check for the broken image every second
    setInterval(fixBrokenImages, 1000);
})();
/* =========================================================================
   MODERN EXPANSION PACK 2 (The 10-Template Edition & Badge Remover)
   ========================================================================= */
(function initExpansionPack2() {

    // 0. THE BADGE REMOVER
    // This safely hides the old pink "NEW" tags from V11 without touching the core code!
    const style = document.createElement('style');
    style.innerHTML = '.template-preview span { display: none !important; }';
    document.head.appendChild(style);
    
    // 1. THE 10 PREMIUM TEMPLATES
    const modernTemplates2 = [
        // 1. Indie Film Poster
        {
            c: "Posters", n: "Indie Film Poster", w: 816, h: 1056, bg: "#111827",
            els: [
                {html: `<div style="background: #111827; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border: 1px solid #374151; z-index: 2;"></div>`, t: 40, l: 40, w: 736, h: 976},
                {html: `<div style="font-family: 'Georgia', serif; font-size: 100px; color: #f9fafb; text-align: center; letter-spacing: 8px; z-index: 3;">ECLIPSE</div>`, t: 150, l: 50, w: 716, h: 120},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #9ca3af; text-align: center; letter-spacing: 12px; z-index: 4;">A SHORT FILM BY J. DIRECTOR</div>`, t: 300, l: 50, w: 716, h: 40},
                {html: `<div style="background: #3b82f6; z-index: 5;"></div>`, t: 450, l: 358, w: 100, h: 4},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #6b7280; text-align: center; line-height: 2; z-index: 6;">WINNER<br>BEST PICTURE<br>FESTIVAL 2026</div>`, t: 550, l: 200, w: 416, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; color: #f3f4f6; text-align: center; letter-spacing: 4px; z-index: 7;">IN THEATERS OCTOBER</div>`, t: 850, l: 50, w: 716, h: 50}
            ]
        },
        // 2. Startup Brief
        {
            c: "Newsletters", n: "Startup Brief", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #0f172a; z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 200},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 64px; color: #ffffff; letter-spacing: -2px; z-index: 3;">THE WEEKLY ROOT</div>`, t: 50, l: 50, w: 716, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; z-index: 4;">Tech • Design • Culture | Issue 42</div>`, t: 140, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 36px; font-weight: bold; color: #0f172a; z-index: 5;">The Future of Remote Teams</div>`, t: 250, l: 50, w: 716, h: 50},
                {html: `<div style="background: #e2e8f0; z-index: 6;"></div>`, t: 320, l: 50, w: 716, h: 2},
                {html: `<div style="font-family: Georgia, serif; font-size: 16px; color: #334155; line-height: 1.8; column-count: 2; column-gap: 40px; z-index: 7;">As companies continue to adapt to hybrid models, the tools we use are evolving faster than ever. This week, we explore the top 5 software suites transforming how distributed teams collaborate across time zones. <br><br>From asynchronous video updates to AI-driven project management, the landscape of work has fundamentally shifted.</div>`, t: 350, l: 50, w: 716, h: 300},
                {html: `<div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 20px; z-index: 8;"></div>`, t: 700, l: 50, w: 716, h: 200},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #0f172a; z-index: 9;">Upcoming Events</div>`, t: 730, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #475569; line-height: 1.6; z-index: 10;">• <b>Webinar:</b> Designing for Accessibility (Nov 12)<br>• <b>Workshop:</b> Advanced CSS Grid (Nov 15)</div>`, t: 780, l: 80, w: 656, h: 100}
            ]
        },
        // 3. Creative Minimalist Resume
        {
            c: "Resumes", n: "Creative Minimalist", w: 816, h: 1056, bg: "#f4f4f5",
            els: [
                {html: `<div style="background: #f4f4f5; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #18181b; z-index: 2;"></div>`, t: 0, l: 0, w: 250, h: 1056},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 48px; font-weight: 900; color: #18181b; letter-spacing: -1px; z-index: 3;">MORGAN<br>HAYES</div>`, t: 100, l: 300, w: 466, h: 120},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 18px; color: #10b981; font-weight: bold; letter-spacing: 2px; z-index: 4;">UX / UI DESIGNER</div>`, t: 240, l: 300, w: 466, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #a1a1aa; line-height: 2; z-index: 5;">morgan.hayes@email.com<br>portfolio.design</div>`, t: 100, l: 40, w: 170, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #fafafa; border-bottom: 1px solid #3f3f46; padding-bottom: 10px; z-index: 6;">SKILLS</div>`, t: 300, l: 40, w: 170, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 13px; color: #d4d4d8; line-height: 2; z-index: 7;">Figma<br>Prototyping<br>User Research</div>`, t: 360, l: 40, w: 170, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #18181b; border-bottom: 2px solid #e4e4e7; padding-bottom: 10px; z-index: 8;">EXPERIENCE</div>`, t: 320, l: 300, w: 466, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #18181b; z-index: 9;">Senior Product Designer</div>`, t: 390, l: 300, w: 466, h: 25},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 13px; color: #71717a; font-style: italic; z-index: 10;">TechFlow Inc. | 2021 - Present</div>`, t: 420, l: 300, w: 466, h: 25},
                {html: `<div style="font-family: Georgia, serif; font-size: 14px; color: #52525b; line-height: 1.6; z-index: 11;">Lead the redesign of the core SaaS platform, improving user retention by 35%. Mentored a team of 4 junior designers.</div>`, t: 455, l: 300, w: 466, h: 100}
            ]
        },
        // 4. Real Estate Flyer
        {
            c: "Flyers", n: "Luxury Real Estate", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #0f766e; z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 150},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 50px; font-weight: bold; color: #ffffff; letter-spacing: 5px; text-align: center; z-index: 3;">OPEN HOUSE</div>`, t: 45, l: 50, w: 716, h: 80},
                {html: `<div style="font-family: Georgia, serif; font-size: 40px; color: #0f766e; text-align: center; z-index: 4;">123 Meadow Lane, Suburbia</div>`, t: 200, l: 50, w: 716, h: 50},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 60px; font-weight: 900; color: #111827; text-align: center; z-index: 5;">$850,000</div>`, t: 280, l: 50, w: 716, h: 80},
                {html: `<div style="background: #f3f4f6; border-radius: 8px; z-index: 6;"></div>`, t: 400, l: 100, w: 616, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #374151; text-align: center; z-index: 7;">4 BEDS &nbsp; | &nbsp; 3 BATHS &nbsp; | &nbsp; 2,500 SQ FT</div>`, t: 435, l: 100, w: 616, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #4b5563; line-height: 1.8; text-align: center; z-index: 8;">Fully renovated chef's kitchen, vaulted ceilings, and a sprawling backyard perfect for entertaining. Join us this Saturday from 10 AM to 2 PM.</div>`, t: 550, l: 150, w: 516, h: 150}
            ]
        },
        // 5. Cafe Noir Menu
        {
            c: "Menus", n: "Cafe Noir Coffee", w: 816, h: 1056, bg: "#1c1917",
            els: [
                {html: `<div style="background: #1c1917; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border: 1px solid #a8a29e; z-index: 2;"></div>`, t: 40, l: 40, w: 736, h: 976},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 64px; font-weight: 900; color: #d6d3d1; text-align: center; letter-spacing: 10px; z-index: 3;">CAFÉ NOIR</div>`, t: 120, l: 50, w: 716, h: 80},
                {html: `<div style="font-family: Georgia, serif; font-size: 16px; color: #78716c; text-align: center; font-style: italic; z-index: 4;">Locally Roasted. Carefully Crafted.</div>`, t: 210, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 24px; color: #d6d3d1; letter-spacing: 3px; border-bottom: 1px solid #57534e; padding-bottom: 5px; z-index: 5;">COFFEE</div>`, t: 320, l: 150, w: 516, h: 40},
                {html: `<div style="font-family: Courier, monospace; font-size: 18px; color: #a8a29e; line-height: 2.5; z-index: 6;">Espresso ............................ 3.00<br>Americano ........................... 3.50<br>Cappuccino .......................... 4.50<br>Vanilla Latte ....................... 5.00<br>Pour Over ........................... 5.50</div>`, t: 390, l: 150, w: 516, h: 200},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 24px; color: #d6d3d1; letter-spacing: 3px; border-bottom: 1px solid #57534e; padding-bottom: 5px; z-index: 7;">TEA & MORE</div>`, t: 650, l: 150, w: 516, h: 40},
                {html: `<div style="font-family: Courier, monospace; font-size: 18px; color: #a8a29e; line-height: 2.5; z-index: 8;">Matcha Latte ........................ 5.50<br>Chai Tea ............................ 4.00<br>Hot Chocolate ....................... 4.50</div>`, t: 720, l: 150, w: 516, h: 150}
            ]
        },
        // 6. Developer Dark Resume
        {
            c: "Resumes", n: "Dark Mode Developer", w: 816, h: 1056, bg: "#0d1117",
            els: [
                {html: `<div style="background: #0d1117; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Courier New', Courier, monospace; font-size: 60px; font-weight: bold; color: #c9d1d9; z-index: 2;">JANE DOE</div>`, t: 80, l: 80, w: 656, h: 70},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #58a6ff; z-index: 3;">FULL-STACK ENGINEER</div>`, t: 160, l: 80, w: 656, h: 30},
                {html: `<div style="background: #30363d; z-index: 4;"></div>`, t: 210, l: 80, w: 656, h: 2},
                {html: `<div style="font-family: 'Courier New', Courier, monospace; font-size: 14px; color: #8b949e; z-index: 5;">github.com/janedoe | jane@dev.io | New York, NY</div>`, t: 230, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #c9d1d9; z-index: 6;">TECH STACK</div>`, t: 300, l: 80, w: 200, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #8b949e; line-height: 1.8; z-index: 7;">JavaScript (ES6+)<br>React & Next.js<br>Node.js & Express<br>PostgreSQL<br>AWS & Docker</div>`, t: 340, l: 80, w: 200, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #c9d1d9; z-index: 8;">EXPERIENCE</div>`, t: 300, l: 320, w: 416, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #58a6ff; z-index: 9;">Software Engineer II @ CloudBase</div>`, t: 340, l: 320, w: 416, h: 25},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #c9d1d9; line-height: 1.6; z-index: 10;">• Architected and deployed microservices handling 2M+ requests daily.<br>• Reduced database query latency by 40% via Redis caching.</div>`, t: 375, l: 320, w: 416, h: 100}
            ]
        },
        // 7. Gallery Poster
        {
            c: "Posters", n: "Gallery Exhibition", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: linear-gradient(45deg, #ff7e5f, #feb47b); z-index: 2;"></div>`, t: 80, l: 80, w: 656, h: 600},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 90px; font-weight: 900; color: #111; line-height: 0.9; z-index: 3;">MODERN<br>ART.</div>`, t: 550, l: 40, w: 500, h: 200},
                {html: `<div style="font-family: Georgia, serif; font-size: 24px; color: #555; z-index: 4;">A retrospective on abstract minimalism.</div>`, t: 780, l: 45, w: 716, h: 30},
                {html: `<div style="background: #111; z-index: 5;"></div>`, t: 840, l: 45, w: 50, h: 4},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #111; z-index: 6;">OPENS JULY 15</div>`, t: 870, l: 45, w: 300, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #777; z-index: 7;">The Downtown Gallery<br>450 Arts District Blvd.</div>`, t: 900, l: 45, w: 300, h: 50}
            ]
        },
        // 8. Travel Brochure
        {
            c: "Brochures", n: "Travel Agency", w: 816, h: 1056, bg: "#f0f9ff",
            els: [
                {html: `<div style="background: #f0f9ff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 64px; font-weight: 900; color: #0369a1; text-align: center; letter-spacing: 2px; z-index: 2;">ESCAPE TO THE ALPS</div>`, t: 100, l: 50, w: 716, h: 150},
                {html: `<div style="font-family: Georgia, serif; font-size: 20px; color: #0c4a6e; text-align: center; font-style: italic; z-index: 3;">Experience the ultimate winter getaway.</div>`, t: 250, l: 50, w: 716, h: 40},
                {html: `<div style="background: #0284c7; border-radius: 10px; z-index: 4;"></div>`, t: 350, l: 60, w: 200, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #fff; text-align: center; z-index: 5;">SKI PASSES</div>`, t: 380, l: 60, w: 200, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #e0f2fe; text-align: center; padding: 10px; z-index: 6;">Access to over 150 premium trails across 3 mountain peaks.</div>`, t: 440, l: 60, w: 200, h: 200},
                {html: `<div style="background: #0284c7; border-radius: 10px; z-index: 7;"></div>`, t: 350, l: 308, w: 200, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #fff; text-align: center; z-index: 8;">CABINS</div>`, t: 380, l: 308, w: 200, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #e0f2fe; text-align: center; padding: 10px; z-index: 9;">Luxury heated chalets with panoramic views of the valley.</div>`, t: 440, l: 308, w: 200, h: 200},
                {html: `<div style="background: #0284c7; border-radius: 10px; z-index: 10;"></div>`, t: 350, l: 556, w: 200, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #fff; text-align: center; z-index: 11;">TOURS</div>`, t: 380, l: 556, w: 200, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #e0f2fe; text-align: center; padding: 10px; z-index: 12;">Guided snowshoe and snowmobile tours available daily.</div>`, t: 440, l: 556, w: 200, h: 200}
            ]
        },
        // 9. Corporate Seminar
        {
            c: "Flyers", n: "Corporate Seminar", w: 816, h: 1056, bg: "#1e1b4b",
            els: [
                {html: `<div style="background: #1e1b4b; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 80px; font-weight: 900; color: #c7d2fe; letter-spacing: -2px; z-index: 2;">INNOVATE 2026</div>`, t: 100, l: 80, w: 656, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; color: #818cf8; z-index: 3;">A SUMMIT FOR TECH LEADERS</div>`, t: 200, l: 80, w: 656, h: 40},
                {html: `<div style="background: #4f46e5; z-index: 4;"></div>`, t: 260, l: 80, w: 150, h: 5},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #e0e7ff; line-height: 1.6; z-index: 5;">Join 500+ executives to discuss the integration of AI into modern enterprise workflows.</div>`, t: 300, l: 80, w: 500, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #c7d2fe; z-index: 6;">KEYNOTE SPEAKERS:</div>`, t: 450, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #a5b4fc; line-height: 2; z-index: 7;">Dr. Sarah Jenkins - CEO, DataCorp<br>Mark Robinson - VP of Engineering, CloudNet<br>Elena Rostova - Head of AI, FutureSystems</div>`, t: 500, l: 80, w: 656, h: 100},
                {html: `<div style="background: #312e81; padding: 20px; text-align: center; color: #fff; font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; z-index: 8;">REGISTER AT INNOVATE-SUMMIT.COM</div>`, t: 850, l: 80, w: 656, h: 65}
            ]
        },
        // 10. Boutique Sale
        {
            c: "Posters", n: "Boutique Sale", w: 816, h: 1056, bg: "#fff1f2",
            els: [
                {html: `<div style="background: #fff1f2; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border: 2px solid #be123c; z-index: 2;"></div>`, t: 50, l: 50, w: 716, h: 956},
                {html: `<div style="font-family: Georgia, serif; font-size: 30px; color: #be123c; text-align: center; letter-spacing: 5px; z-index: 3;">THE BOUTIQUE</div>`, t: 150, l: 100, w: 616, h: 50},
                {html: `<div style="font-family: Georgia, serif; font-size: 100px; color: #881337; text-align: center; z-index: 4;">SUMMER<br>SALE</div>`, t: 300, l: 100, w: 616, h: 250},
                {html: `<div style="background: #be123c; z-index: 5;"></div>`, t: 580, l: 308, w: 200, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 36px; font-weight: bold; color: #e11d48; text-align: center; z-index: 6;">UP TO 60% OFF</div>`, t: 620, l: 100, w: 616, h: 50},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #9f1239; text-align: center; letter-spacing: 3px; z-index: 7;">FRIDAY TO SUNDAY ONLY</div>`, t: 700, l: 100, w: 616, h: 30}
            ]
        }
    ];

    // 2. INJECTION SYSTEM
    function injectModernPack2() {
        const grid = document.getElementById('template-grid');
        const activeBtn = document.querySelector('.cat-btn.active');
        if (!grid || !activeBtn) return;
        const activeCat = activeBtn.innerText.trim();
        
        const existing = grid.querySelectorAll('.modern-pack-2');
        existing.forEach(el => el.remove());
        
        modernTemplates2.filter(t => t.c === activeCat).forEach((t) => {
            const div = document.createElement('div');
            div.className = 'tp-item modern-pack-2';
            const scale = 100 / (t.w || 794); 
            let previewHTML = '';
            t.els.forEach(el => {
                let styleFix = (el.html.includes('z-index: 1') || el.h > 1000) ? "width: 100%; height: 100%;" : "";
                previewHTML += `<div style="position:absolute; top:${el.t}px; left:${el.l}px; width:${el.w}px; height:${el.h}px; z-index:1; ${styleFix}">${el.html}</div>`;
            });
            // Standard layout with NO extra badges!
            div.innerHTML = `<div class="template-preview" style="position:relative;"><div style="width: ${t.w}px; height: ${t.h}px; background: ${t.bg}; transform: scale(${scale}); transform-origin: 0 0; overflow: hidden; position: absolute; top: 0; left: 0; pointer-events: none;">${previewHTML}</div></div><div style="font-size:12px; margin-top:5px;">${t.n}</div>`;
            div.onclick = () => window.loadTemplate(t); 
            grid.appendChild(div);
        });
    }

    // 3. EVENT LISTENERS
    if (typeof window.showTemplateModal !== 'undefined') {
        const originalModal = window.showTemplateModal;
        window.showTemplateModal = function() { originalModal(); setTimeout(injectModernPack2, 150); };
    }
    document.addEventListener('click', (e) => {
        if(e.target && e.target.classList && e.target.classList.contains('cat-btn')) setTimeout(injectModernPack2, 150); 
    });

})();
/* =========================================================================
   MODERN EXPANSION PACK 3 - BATCH 1 (Invites, Mags, Brochures)
   ========================================================================= */
(function initExpansionPack3Batch1() {

    const pack3Templates = [
        // --- INVITATIONS (3) ---
        {
            c: "Invitations", n: "Elegant Wedding", w: 816, h: 1056, bg: "#fffdf0",
            els: [
                {html: `<div style="background: #fffdf0; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border: 2px solid #d4af37; z-index: 2;"></div>`, t: 50, l: 50, w: 716, h: 956},
                {html: `<div style="font-family: Georgia, serif; font-size: 24px; color: #555; text-align: center; letter-spacing: 4px; z-index: 3;">TOGETHER WITH THEIR FAMILIES</div>`, t: 150, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 72px; color: #d4af37; text-align: center; font-style: italic; z-index: 4;">Eleanor & James</div>`, t: 250, l: 100, w: 616, h: 100},
                {html: `<div style="font-family: Georgia, serif; font-size: 18px; color: #555; text-align: center; line-height: 2; z-index: 5;">INVITE YOU TO CELEBRATE THEIR MARRIAGE<br>SATURDAY, THE FOURTEENTH OF AUGUST<br>TWO THOUSAND TWENTY-SIX<br>AT FOUR O'CLOCK IN THE AFTERNOON</div>`, t: 400, l: 100, w: 616, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #888; text-align: center; letter-spacing: 2px; z-index: 6;">THE GRAND ESTATE<br>123 MANOR ROAD, COUNTRYSIDE</div>`, t: 650, l: 100, w: 616, h: 60},
                {html: `<div style="font-family: Georgia, serif; font-size: 18px; color: #d4af37; text-align: center; font-style: italic; z-index: 7;">Reception to follow</div>`, t: 800, l: 100, w: 616, h: 40}
            ]
        },
        {
            c: "Invitations", n: "Kids Birthday", w: 816, h: 1056, bg: "#fef08a",
            els: [
                {html: `<div style="background: #fef08a; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #ef4444; border-radius: 50%; z-index: 2;"></div>`, t: -100, l: -100, w: 300, h: 300},
                {html: `<div style="background: #3b82f6; border-radius: 50%; z-index: 3;"></div>`, t: 800, l: 600, w: 400, h: 400},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 80px; color: #1f2937; text-align: center; line-height: 1.1; transform: rotate(-3deg); z-index: 4;">YOU'RE<br>INVITED!</div>`, t: 200, l: 50, w: 716, h: 200},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 30px; font-weight: bold; color: #ef4444; text-align: center; z-index: 5;">TO LEO'S 7TH BIRTHDAY PARTY</div>`, t: 450, l: 50, w: 716, h: 50},
                {html: `<div style="background: #ffffff; border: 4px dashed #3b82f6; border-radius: 20px; z-index: 6;"></div>`, t: 550, l: 150, w: 516, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; color: #1f2937; text-align: center; line-height: 2; font-weight: bold; z-index: 7;">WHEN: Saturday, Oct 10th @ 2 PM<br>WHERE: The Jump Zone Park<br>RSVP: To Mom by Oct 1st</div>`, t: 600, l: 150, w: 516, h: 150}
            ]
        },
        {
            c: "Invitations", n: "Corporate Gala", w: 816, h: 1056, bg: "#0f172a",
            els: [
                {html: `<div style="background: #0f172a; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border-left: 2px solid #38bdf8; border-right: 2px solid #38bdf8; z-index: 2;"></div>`, t: 0, l: 100, w: 616, h: 1056},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; color: #94a3b8; text-align: center; letter-spacing: 10px; z-index: 3;">A N N U A L</div>`, t: 200, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 90px; color: #ffffff; text-align: center; z-index: 4;">GALA</div>`, t: 250, l: 100, w: 616, h: 100},
                {html: `<div style="background: #38bdf8; z-index: 5;"></div>`, t: 380, l: 358, w: 100, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #cbd5e1; text-align: center; line-height: 2; z-index: 6;">Join us for an evening of innovation, networking,<br>and recognizing industry excellence.</div>`, t: 450, l: 100, w: 616, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #ffffff; text-align: center; z-index: 7;">DECEMBER 12 | THE METROPOLITAN</div>`, t: 650, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #38bdf8; text-align: center; z-index: 8;">BLACK TIE ATTIRE</div>`, t: 700, l: 100, w: 616, h: 30}
            ]
        },

        // --- MAGAZINES (4) ---
        {
            c: "Magazines", n: "Tech Innovator", w: 816, h: 1056, bg: "#000000",
            els: [
                {html: `<div style="background: #000000; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 120px; color: #ffffff; text-align: center; letter-spacing: -4px; z-index: 2;">WIRED</div>`, t: 50, l: 0, w: 816, h: 150},
                {html: `<div style="background: linear-gradient(180deg, #10b981 0%, #047857 100%); z-index: 3;"></div>`, t: 250, l: 50, w: 716, h: 500},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 60px; font-weight: 900; color: #000000; background: #10b981; padding: 10px; display: inline-block; z-index: 4;">THE AI</div>`, t: 450, l: 20, w: 300, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 60px; font-weight: 900; color: #000000; background: #10b981; padding: 10px; display: inline-block; z-index: 5;">TAKEOVER</div>`, t: 540, l: 20, w: 400, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #ffffff; z-index: 6;">SILICON VALLEY's NEXT BIG BET</div>`, t: 800, l: 50, w: 500, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #9ca3af; z-index: 7;">How quantum computing is quietly reshaping the global economy.</div>`, t: 850, l: 50, w: 400, h: 60}
            ]
        },
        {
            c: "Magazines", n: "Food & Living", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: Georgia, serif; font-size: 100px; color: #1c1917; text-align: center; z-index: 2;">Savor</div>`, t: 40, l: 0, w: 816, h: 120},
                {html: `<div style="background: #fca5a5; border-radius: 400px 400px 0 0; z-index: 3;"></div>`, t: 180, l: 108, w: 600, h: 600},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 70px; font-style: italic; color: #7f1d1d; text-align: center; z-index: 4;">Summer<br>Harvest</div>`, t: 650, l: 108, w: 600, h: 160},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #444; z-index: 5;">50 QUICK DINNERS</div>`, t: 850, l: 80, w: 200, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #777; z-index: 6;">Meals under 30 mins.</div>`, t: 880, l: 80, w: 200, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #444; text-align: right; z-index: 7;">THE PERFECT PIE</div>`, t: 850, l: 536, w: 200, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #777; text-align: right; z-index: 8;">Secrets from a master baker.</div>`, t: 880, l: 536, w: 200, h: 30}
            ]
        },
        {
            c: "Magazines", n: "Travel Escapes", w: 816, h: 1056, bg: "#e0f2fe",
            els: [
                {html: `<div style="background: #e0f2fe; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #0284c7; z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 700},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 130px; font-weight: 900; color: rgba(255,255,255,0.2); letter-spacing: 10px; z-index: 3;">VOYAGE</div>`, t: 20, l: 40, w: 750, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 130px; font-weight: 900; color: #ffffff; letter-spacing: 10px; z-index: 4;">VOYAGE</div>`, t: 40, l: 40, w: 750, h: 150},
                {html: `<div style="font-family: Georgia, serif; font-size: 50px; color: #0284c7; z-index: 5;">The Amalfi Coast</div>`, t: 750, l: 50, w: 500, h: 60},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #0c4a6e; line-height: 1.6; z-index: 6;">Hidden beaches, cliffside villas, and the best pasta in Italy. A complete local's guide to avoiding the tourist traps.</div>`, t: 830, l: 50, w: 400, h: 100},
                {html: `<div style="background: #0369a1; padding: 15px; color: #fff; font-family: Arial, sans-serif; font-weight: bold; text-align: center; z-index: 7;">TOP 10 RESORTS</div>`, t: 750, l: 550, w: 200, h: 50}
            ]
        },
        {
            c: "Magazines", n: "Health & Fitness", w: 816, h: 1056, bg: "#f1f5f9",
            els: [
                {html: `<div style="background: #f1f5f9; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 150px; color: #dc2626; text-align: center; letter-spacing: -8px; z-index: 2;">PULSE</div>`, t: 20, l: 0, w: 816, h: 180},
                {html: `<div style="border: 10px solid #1e293b; z-index: 3;"></div>`, t: 200, l: 50, w: 716, h: 600},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 70px; color: #1e293b; line-height: 0.9; text-transform: uppercase; z-index: 4;">Build<br>Real<br>Strength</div>`, t: 400, l: 80, w: 400, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #dc2626; z-index: 5;">THE 30-DAY KETTLEBELL CHALLENGE</div>`, t: 840, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #475569; column-count: 2; z-index: 6;">Plus: Expert nutrition guides for recovery, the truth about protein supplements, and how sleep impacts muscle growth.</div>`, t: 880, l: 50, w: 716, h: 80}
            ]
        },

        // --- BROCHURES (3) ---
        {
            c: "Brochures", n: "Medical Clinic", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #0d9488; z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 60px; font-weight: bold; color: #ffffff; z-index: 3;">Apex Medical</div>`, t: 80, l: 50, w: 716, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; color: #ccfbf1; z-index: 4;">COMPREHENSIVE FAMILY CARE</div>`, t: 160, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #115e59; z-index: 5;">Our Services</div>`, t: 320, l: 50, w: 300, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #4b5563; line-height: 2; z-index: 6;">• General Practice<br>• Pediatrics<br>• Preventative Care<br>• Immunizations<br>• Physical Therapy</div>`, t: 380, l: 50, w: 300, h: 200},
                {html: `<div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 20px; z-index: 7;"></div>`, t: 320, l: 400, w: 366, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #115e59; z-index: 8;">Patient Portal</div>`, t: 350, l: 430, w: 300, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #4b5563; line-height: 1.6; z-index: 9;">Access your medical records, schedule appointments, and message your doctor securely online 24/7.</div>`, t: 400, l: 430, w: 300, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #0d9488; text-align: center; z-index: 10;">1-800-APEX-MED | apexmedical.org</div>`, t: 900, l: 50, w: 716, h: 40}
            ]
        },
        {
            c: "Brochures", n: "University Prospectus", w: 816, h: 1056, bg: "#f8fafc",
            els: [
                {html: `<div style="background: #f8fafc; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #1e3a8a; border-radius: 0 0 400px 0; z-index: 2;"></div>`, t: 0, l: 0, w: 600, h: 400},
                {html: `<div style="font-family: Georgia, serif; font-size: 60px; color: #ffffff; z-index: 3;">Kingsbridge</div>`, t: 100, l: 50, w: 500, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; color: #bfdbfe; letter-spacing: 3px; z-index: 4;">UNIVERSITY</div>`, t: 180, l: 50, w: 500, h: 30},
                {html: `<div style="font-family: Georgia, serif; font-size: 32px; color: #1e3a8a; z-index: 5;">Shape Your Future.</div>`, t: 450, l: 50, w: 716, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #475569; line-height: 1.8; z-index: 6;">Join a community of scholars dedicated to excellence. With over 150 undergraduate programs and a world-class faculty, Kingsbridge offers an unparalleled educational experience in the heart of the city.</div>`, t: 510, l: 50, w: 400, h: 200},
                {html: `<div style="background: #bfdbfe; z-index: 7;"></div>`, t: 450, l: 500, w: 266, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #1e3a8a; padding: 20px; z-index: 8;">KEY DATES:<br><br>Fall Admissions:<br>Nov 1st<br><br>Financial Aid:<br>Jan 15th<br><br>Campus Tours:<br>Every Friday</div>`, t: 480, l: 520, w: 226, h: 300}
            ]
        },
        {
            c: "Brochures", n: "Eco Foundation", w: 816, h: 1056, bg: "#f0fdf4",
            els: [
                {html: `<div style="background: #f0fdf4; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #166534; z-index: 2;"></div>`, t: 0, l: 600, w: 216, h: 1056},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 80px; font-weight: 900; color: #15803d; line-height: 1; z-index: 3;">PROTECT<br>OUR<br>PLANET.</div>`, t: 150, l: 50, w: 500, h: 300},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #166534; z-index: 4;">Our Mission</div>`, t: 500, l: 50, w: 500, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #1f2937; line-height: 1.8; z-index: 5;">We are dedicated to preserving global biodiversity through community-led conservation projects, sustainable agriculture initiatives, and aggressive climate advocacy.</div>`, t: 550, l: 50, w: 450, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #dcfce7; transform: rotate(90deg); transform-origin: left top; white-space: nowrap; z-index: 6;">THE GLOBAL EARTH INITIATIVE</div>`, t: 100, l: 680, w: 900, h: 40},
                {html: `<div style="background: #15803d; padding: 15px; color: #fff; font-family: Arial, sans-serif; font-weight: bold; text-align: center; border-radius: 5px; z-index: 7;">DONATE TODAY</div>`, t: 800, l: 50, w: 250, h: 50}
            ]
        }
    ];

    function injectPack3Batch1() {
        const grid = document.getElementById('template-grid');
        const activeBtn = document.querySelector('.cat-btn.active');
        if (!grid || !activeBtn) return;
        const activeCat = activeBtn.innerText.trim();
        
        const existing = grid.querySelectorAll('.pack-3-batch-1');
        existing.forEach(el => el.remove());
        
        pack3Templates.filter(t => t.c === activeCat).forEach((t) => {
            const div = document.createElement('div');
            div.className = 'tp-item pack-3-batch-1';
            const scale = 100 / (t.w || 794); 
            let previewHTML = '';
            t.els.forEach(el => {
                let styleFix = (el.html.includes('z-index: 1') || el.h > 1000) ? "width: 100%; height: 100%;" : "";
                previewHTML += `<div style="position:absolute; top:${el.t}px; left:${el.l}px; width:${el.w}px; height:${el.h}px; z-index:1; ${styleFix}">${el.html}</div>`;
            });
            div.innerHTML = `<div class="template-preview" style="position:relative;"><div style="width: ${t.w}px; height: ${t.h}px; background: ${t.bg}; transform: scale(${scale}); transform-origin: 0 0; overflow: hidden; position: absolute; top: 0; left: 0; pointer-events: none;">${previewHTML}</div></div><div style="font-size:12px; margin-top:5px;">${t.n}</div>`;
            div.onclick = () => window.loadTemplate(t); 
            grid.appendChild(div);
        });
    }

    if (typeof window.showTemplateModal !== 'undefined') {
        const originalModal = window.showTemplateModal;
        window.showTemplateModal = function() { originalModal(); setTimeout(injectPack3Batch1, 150); };
    }
    document.addEventListener('click', (e) => {
        if(e.target && e.target.classList && e.target.classList.contains('cat-btn')) setTimeout(injectPack3Batch1, 150); 
    });

})();
/* =========================================================================
   MODERN EXPANSION PACK 3 - BATCH 2 (Certificates & Menus)
   ========================================================================= */
(function initExpansionPack3Batch2() {

    const pack3Templates2 = [
        // --- CERTIFICATES (5) - Natively Landscape! ---
        {
            c: "Certificates", n: "Academic Excellence", w: 1056, h: 816, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 1056, h: 816},
                {html: `<div style="border: 15px solid #1e3a8a; z-index: 2;"></div>`, t: 30, l: 30, w: 996, h: 756},
                {html: `<div style="border: 2px solid #d4af37; z-index: 3;"></div>`, t: 50, l: 50, w: 956, h: 716},
                {html: `<div style="font-family: Georgia, serif; font-size: 50px; color: #1e3a8a; text-align: center; letter-spacing: 5px; z-index: 4;">CERTIFICATE OF EXCELLENCE</div>`, t: 150, l: 100, w: 856, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #555; text-align: center; font-style: italic; z-index: 5;">This is proudly presented to</div>`, t: 280, l: 100, w: 856, h: 30},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 80px; color: #111; text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 10px; z-index: 6;">Sarah Jenkins</div>`, t: 350, l: 200, w: 656, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #555; text-align: center; line-height: 1.8; z-index: 7;">In recognition of outstanding academic performance,<br>dedication, and leadership during the 2026 academic year.</div>`, t: 500, l: 200, w: 656, h: 80},
                {html: `<div style="background: #111; z-index: 8;"></div>`, t: 650, l: 200, w: 200, h: 2},
                {html: `<div style="background: #111; z-index: 9;"></div>`, t: 650, l: 656, w: 200, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; text-align: center; z-index: 10;">DATE</div>`, t: 660, l: 200, w: 200, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; text-align: center; z-index: 11;">SIGNATURE</div>`, t: 660, l: 656, w: 200, h: 30}
            ]
        },
        {
            c: "Certificates", n: "Modern Corporate", w: 1056, h: 816, bg: "#f8fafc",
            els: [
                {html: `<div style="background: #f8fafc; z-index: 1;"></div>`, t: 0, l: 0, w: 1056, h: 816},
                {html: `<div style="background: #0f172a; z-index: 2;"></div>`, t: 0, l: 0, w: 300, h: 816},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 70px; color: #e2e8f0; transform: rotate(-90deg); transform-origin: top left; white-space: nowrap; z-index: 3;">AWARD 2026</div>`, t: 800, l: 50, w: 800, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 60px; font-weight: 900; color: #0f172a; letter-spacing: -2px; z-index: 4;">CERTIFICATE</div>`, t: 150, l: 380, w: 600, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; color: #3b82f6; letter-spacing: 5px; z-index: 5;">OF APPRECIATION</div>`, t: 230, l: 380, w: 600, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #64748b; z-index: 6;">PROUDLY AWARDED TO:</div>`, t: 350, l: 380, w: 600, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 50px; font-weight: bold; color: #1e293b; z-index: 7;">Marcus Vance</div>`, t: 400, l: 380, w: 600, h: 70},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #475569; line-height: 1.6; z-index: 8;">For innovative contributions to the Q3 technology rollout and demonstrating exceptional leadership under pressure.</div>`, t: 500, l: 380, w: 550, h: 80},
                {html: `<div style="background: #cbd5e1; z-index: 9;"></div>`, t: 680, l: 380, w: 250, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #0f172a; z-index: 10;">DIRECTOR OF OPERATIONS</div>`, t: 690, l: 380, w: 250, h: 30}
            ]
        },
        {
            c: "Certificates", n: "Employee of the Month", w: 1056, h: 816, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 1056, h: 816},
                {html: `<div style="border: 5px solid #ca8a04; z-index: 2;"></div>`, t: 40, l: 40, w: 976, h: 736},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 40px; color: #ca8a04; text-align: center; letter-spacing: 10px; z-index: 3;">EMPLOYEE OF THE MONTH</div>`, t: 150, l: 100, w: 856, h: 60},
                {html: `<div style="background: #ca8a04; z-index: 4;"></div>`, t: 230, l: 428, w: 200, h: 4},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 60px; font-weight: bold; color: #111; text-align: center; z-index: 5;">Elena Rodriguez</div>`, t: 320, l: 100, w: 856, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #555; text-align: center; line-height: 1.8; z-index: 6;">Thank you for your tireless dedication, positive attitude,<br>and setting an incredible standard for the entire team in August 2026.</div>`, t: 450, l: 200, w: 656, h: 80},
                {html: `<div style="background: #ca8a04; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 7;"><div style="color: white; font-family: Arial; font-weight: bold; text-align: center; font-size: 24px;">#1</div></div>`, t: 600, l: 478, w: 100, h: 100}
            ]
        },
        {
            c: "Certificates", n: "Graduation Diploma", w: 1056, h: 816, bg: "#fdfbf7",
            els: [
                {html: `<div style="background: #fdfbf7; z-index: 1;"></div>`, t: 0, l: 0, w: 1056, h: 816},
                {html: `<div style="border: 1px solid #78716c; z-index: 2;"></div>`, t: 60, l: 60, w: 936, h: 696},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 24px; color: #444; text-align: center; letter-spacing: 5px; text-transform: uppercase; z-index: 3;">The Board of Trustees of</div>`, t: 160, l: 100, w: 856, h: 40},
                {html: `<div style="font-family: Georgia, serif; font-size: 40px; color: #1c1917; text-align: center; z-index: 4;">HARRISON UNIVERSITY</div>`, t: 210, l: 100, w: 856, h: 50},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 18px; color: #444; text-align: center; font-style: italic; z-index: 5;">hereby confers upon</div>`, t: 300, l: 100, w: 856, h: 30},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 60px; color: #111; text-align: center; z-index: 6;">Thomas Arlington</div>`, t: 360, l: 100, w: 856, h: 80},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 18px; color: #444; text-align: center; line-height: 1.8; z-index: 7;">the degree of Bachelor of Arts in Graphic Design<br>with all the rights, honors, and privileges thereunto appertaining.</div>`, t: 480, l: 150, w: 756, h: 80},
                {html: `<div style="background: #111; z-index: 8;"></div>`, t: 680, l: 400, w: 256, h: 1},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; text-align: center; z-index: 9;">PRESIDENT OF THE UNIVERSITY</div>`, t: 690, l: 400, w: 256, h: 30}
            ]
        },
        {
            c: "Certificates", n: "Kids Superstar Award", w: 1056, h: 816, bg: "#ffedd5",
            els: [
                {html: `<div style="background: #ffedd5; z-index: 1;"></div>`, t: 0, l: 0, w: 1056, h: 816},
                {html: `<div style="border: 8px dashed #f97316; z-index: 2;"></div>`, t: 30, l: 30, w: 996, h: 756},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 70px; color: #ea580c; text-align: center; text-shadow: 4px 4px 0px #fde047; z-index: 3;">SUPERSTAR AWARD!</div>`, t: 120, l: 100, w: 856, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #431407; text-align: center; z-index: 4;">THIS GOES TO:</div>`, t: 280, l: 100, w: 856, h: 40},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 60px; color: #3b82f6; text-align: center; border-bottom: 5px solid #3b82f6; padding-bottom: 10px; z-index: 5;">CHLOE SMITH</div>`, t: 350, l: 250, w: 556, h: 90},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #431407; text-align: center; line-height: 1.6; z-index: 6;">For being an awesome listener, helping others,<br>and bringing a big smile to class every day!</div>`, t: 500, l: 150, w: 756, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #ea580c; text-align: center; z-index: 7;">Great Job! - Mr. Davis</div>`, t: 650, l: 150, w: 756, h: 40}
            ]
        },

        // --- MENUS (3) ---
        {
            c: "Menus", n: "Rustic Italian", w: 816, h: 1056, bg: "#fffbeb",
            els: [
                {html: `<div style="background: #fffbeb; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border-top: 4px solid #78350f; border-bottom: 4px solid #78350f; z-index: 2;"></div>`, t: 80, l: 80, w: 656, h: 150},
                {html: `<div style="font-family: Georgia, serif; font-size: 60px; color: #78350f; text-align: center; z-index: 3;">Trattoria Roma</div>`, t: 100, l: 80, w: 656, h: 70},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #b45309; text-align: center; letter-spacing: 4px; z-index: 4;">AUTHENTIC FAMILY RECIPES</div>`, t: 180, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Georgia, serif; font-size: 28px; color: #78350f; text-align: center; border-bottom: 1px solid #d44400; padding-bottom: 10px; z-index: 5;">ANTIPASTI</div>`, t: 300, l: 150, w: 516, h: 50},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #451a03; z-index: 6;">Bruschetta Classico <span style="float: right;">$12</span></div>`, t: 380, l: 150, w: 516, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #78350f; font-style: italic; z-index: 7;">Toasted artisan bread, vine tomatoes, fresh basil, garlic.</div>`, t: 410, l: 150, w: 516, h: 30},
                {html: `<div style="font-family: Georgia, serif; font-size: 28px; color: #78350f; text-align: center; border-bottom: 1px solid #d44400; padding-bottom: 10px; z-index: 8;">SECONDI</div>`, t: 500, l: 150, w: 516, h: 50},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #451a03; z-index: 9;">Linguine alle Vongole <span style="float: right;">$24</span></div>`, t: 580, l: 150, w: 516, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #78350f; font-style: italic; z-index: 10;">Fresh clams, white wine sauce, parsley, chili flakes.</div>`, t: 610, l: 150, w: 516, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #451a03; z-index: 11;">Vitello Tonnato <span style="float: right;">$28</span></div>`, t: 670, l: 150, w: 516, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #78350f; font-style: italic; z-index: 12;">Veal scaloppine, lemon caper sauce, roasted potatoes.</div>`, t: 700, l: 150, w: 516, h: 30}
            ]
        },
        {
            c: "Menus", n: "Cocktail Lounge", w: 816, h: 1056, bg: "#020617",
            els: [
                {html: `<div style="background: #020617; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 70px; font-weight: 900; color: #ffffff; text-align: center; letter-spacing: 15px; text-shadow: 0 0 20px #e11d48; z-index: 2;">NEON</div>`, t: 100, l: 50, w: 716, h: 90},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 20px; color: #fb7185; text-align: center; letter-spacing: 5px; z-index: 3;">COCKTAILS & SPIRITS</div>`, t: 200, l: 50, w: 716, h: 30},
                {html: `<div style="background: #e11d48; z-index: 4;"></div>`, t: 260, l: 358, w: 100, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 2px; z-index: 5;">SIGNATURES</div>`, t: 350, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #94a3b8; line-height: 2; z-index: 6;"><b>MIDNIGHT RIDER</b> ............................... $16<br>Bourbon, Amaro, Bitters, Smoked Orange<br><br><b>VELVET CRUSH</b> .................................. $15<br>Gin, Blackberry, Lemon, Egg White<br><br><b>ELECTRIC DAISY</b> ................................ $14<br>Tequila, Jalapeno, Lime, Agave</div>`, t: 420, l: 100, w: 616, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 2px; z-index: 7;">CLASSICS</div>`, t: 700, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #94a3b8; line-height: 2; z-index: 8;"><b>OLD FASHIONED</b> ............................... $14<br><b>NEGRONI</b> ....................................... $14<br><b>MARTINI</b> ....................................... $15</div>`, t: 770, l: 100, w: 616, h: 100}
            ]
        },
        {
            c: "Menus", n: "Burger Joint", w: 816, h: 1056, bg: "#fee2e2",
            els: [
                {html: `<div style="background: #fee2e2; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #ef4444; transform: rotate(-2deg); z-index: 2;"></div>`, t: 50, l: 50, w: 716, h: 150},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 70px; color: #ffffff; text-align: center; transform: rotate(-2deg); text-shadow: 3px 3px 0px #991b1b; z-index: 3;">SMASH CITY</div>`, t: 75, l: 50, w: 716, h: 90},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 30px; color: #1f2937; background: #fde047; padding: 10px; display: inline-block; transform: rotate(1deg); z-index: 4;">THE BURGERS</div>`, t: 280, l: 80, w: 300, h: 60},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #ef4444; z-index: 5;">THE CLASSIC SMASH ........... $8</div>`, t: 380, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #4b5563; z-index: 6;">Double patty, American cheese, house sauce, pickles.</div>`, t: 410, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #ef4444; z-index: 7;">SPICY JALAPENO ............. $9</div>`, t: 470, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #4b5563; z-index: 8;">Double patty, pepper jack, crispy jalapenos, spicy mayo.</div>`, t: 500, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 30px; color: #1f2937; background: #fde047; padding: 10px; display: inline-block; transform: rotate(-1deg); z-index: 9;">THE SIDES</div>`, t: 600, l: 80, w: 250, h: 60},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #1f2937; line-height: 2; z-index: 10;">FRENCH FRIES ................. $4<br>ONION RINGS .................. $5<br>CHEESE CURDS ................. $6</div>`, t: 700, l: 80, w: 656, h: 150}
            ]
        }
    ];

    function injectPack3Batch2() {
        const grid = document.getElementById('template-grid');
        const activeBtn = document.querySelector('.cat-btn.active');
        if (!grid || !activeBtn) return;
        const activeCat = activeBtn.innerText.trim();
        
        const existing = grid.querySelectorAll('.pack-3-batch-2');
        existing.forEach(el => el.remove());
        
        pack3Templates2.filter(t => t.c === activeCat).forEach((t) => {
            const div = document.createElement('div');
            div.className = 'tp-item pack-3-batch-2';
            
            // Adjust scale for landscape thumbnails (Certificates)
            const scale = 100 / (t.w || 794); 
            
            let previewHTML = '';
            t.els.forEach(el => {
                let styleFix = (el.html.includes('z-index: 1') || el.h > 1000 || el.w > 1000) ? "width: 100%; height: 100%;" : "";
                previewHTML += `<div style="position:absolute; top:${el.t}px; left:${el.l}px; width:${el.w}px; height:${el.h}px; z-index:1; ${styleFix}">${el.html}</div>`;
            });
            
            div.innerHTML = `<div class="template-preview" style="position:relative; width: 100px; height: 141px; display: flex; align-items: center; justify-content: center; overflow: hidden;"><div style="width: ${t.w}px; height: ${t.h}px; background: ${t.bg}; transform: scale(${scale}); transform-origin: center center; position: absolute; pointer-events: none;">${previewHTML}</div></div><div style="font-size:12px; margin-top:5px;">${t.n}</div>`;
            div.onclick = () => window.loadTemplate(t); 
            grid.appendChild(div);
        });
    }

    if (typeof window.showTemplateModal !== 'undefined') {
        const originalModal = window.showTemplateModal;
        window.showTemplateModal = function() { originalModal(); setTimeout(injectPack3Batch2, 150); };
    }
    document.addEventListener('click', (e) => {
        if(e.target && e.target.classList && e.target.classList.contains('cat-btn')) setTimeout(injectPack3Batch2, 150); 
    });

})();
/* =========================================================================
   MODERN EXPANSION PACK 3 - BATCH 3 (Calendars & Letterheads)
   ========================================================================= */
(function initExpansionPack3Batch3() {

    const pack3Templates3 = [
        // --- CALENDARS (6) ---
        {
            c: "Calendars", n: "Minimalist Wall", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 120px; color: #111; letter-spacing: -5px; z-index: 2;">OCTOBER</div>`, t: 80, l: 50, w: 716, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 40px; font-weight: bold; color: #ef4444; z-index: 3;">2026</div>`, t: 210, l: 60, w: 200, h: 50},
                {html: `<div style="border-top: 4px solid #111; z-index: 4;"></div>`, t: 300, l: 50, w: 716, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #888; letter-spacing: 20px; z-index: 5;">SUN MON TUE WED THU FRI SAT</div>`, t: 320, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; color: #111; line-height: 3; word-spacing: 50px; z-index: 6;">. 1 2 3 4 5 6<br>7 8 9 10 11 12 13<br>14 15 16 17 18 19 20<br>21 22 23 24 25 26 27<br>28 29 30 31 . . .</div>`, t: 380, l: 50, w: 716, h: 500},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #555; z-index: 7;"><b>NOTES:</b><br>10/12 - Project Deadline<br>10/31 - Halloween</div>`, t: 850, l: 50, w: 716, h: 100}
            ]
        },
        {
            c: "Calendars", n: "Corporate Desk", w: 816, h: 1056, bg: "#f8fafc",
            els: [
                {html: `<div style="background: #f8fafc; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #0f172a; border-radius: 0 0 20px 20px; z-index: 2;"></div>`, t: 0, l: 50, w: 716, h: 200},
                {html: `<div style="font-family: Georgia, serif; font-size: 80px; color: #ffffff; text-align: center; z-index: 3;">JANUARY</div>`, t: 50, l: 50, w: 716, h: 100},
                {html: `<div style="background: #38bdf8; z-index: 4;"></div>`, t: 150, l: 308, w: 200, h: 4},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #64748b; letter-spacing: 15px; text-align: center; z-index: 5;">S M T W T F S</div>`, t: 250, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #0f172a; line-height: 2.5; word-spacing: 40px; text-align: center; z-index: 6;">- - 1 2 3 4 5<br>6 7 8 9 10 11 12<br>13 14 15 16 17 18 19<br>20 21 22 23 24 25 26<br>27 28 29 30 31 - -</div>`, t: 300, l: 50, w: 716, h: 400},
                {html: `<div style="border: 2px dashed #cbd5e1; padding: 20px; z-index: 7;"></div>`, t: 750, l: 100, w: 616, h: 200},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #0f172a; z-index: 8;">MONTHLY GOALS</div>`, t: 770, l: 120, w: 576, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #475569; line-height: 2; z-index: 9;">[ ] Finalize Q1 Budget<br>[ ] Client Onboarding<br>[ ] Marketing Review</div>`, t: 820, l: 120, w: 576, h: 100}
            ]
        },
        {
            c: "Calendars", n: "Botanical Planner", w: 816, h: 1056, bg: "#f0fdf4",
            els: [
                {html: `<div style="background: #f0fdf4; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #bbf7d0; border-radius: 400px; z-index: 2;"></div>`, t: -100, l: 500, w: 400, h: 400},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 90px; color: #166534; font-style: italic; z-index: 3;">March</div>`, t: 100, l: 80, w: 400, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; color: #4ade80; letter-spacing: 5px; z-index: 4;">SPRING BLOOMS</div>`, t: 200, l: 80, w: 400, h: 30},
                {html: `<div style="border-top: 1px solid #166534; z-index: 5;"></div>`, t: 300, l: 80, w: 656, h: 2},
                {html: `<table style="width: 100%; height: 100%; text-align: center; font-family: Georgia, serif; font-size: 22px; color: #166534; table-layout: fixed; border-collapse: collapse; z-index: 6;">
                    <tr style="font-weight: bold; color: #14532d; font-size: 18px;"><td>S</td><td>M</td><td>T</td><td>W</td><td>T</td><td>F</td><td>S</td></tr>
                    <tr><td></td><td></td><td></td><td>1</td><td>2</td><td>3</td><td>4</td></tr>
                    <tr><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td></tr>
                    <tr><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td></tr>
                    <tr><td>19</td><td>20</td><td>21</td><td>22</td><td>23</td><td>24</td><td>25</td></tr>
                    <tr><td>26</td><td>27</td><td>28</td><td>29</td><td>30</td><td>31</td><td></td></tr>
                </table>`, t: 330, l: 80, w: 656, h: 450},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 24px; color: #166534; font-style: italic; text-align: center; z-index: 8;">"To plant a garden is to believe in tomorrow."</div>`, t: 880, l: 80, w: 656, h: 50}
            ]
        },
        {
            c: "Calendars", n: "Fitness Tracker", w: 816, h: 1056, bg: "#18181b",
            els: [
                {html: `<div style="background: #18181b; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border: 4px solid #e11d48; z-index: 2;"></div>`, t: 30, l: 30, w: 756, h: 996},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 70px; color: #ffffff; text-align: center; letter-spacing: 5px; z-index: 3;">NOVEMBER</div>`, t: 80, l: 50, w: 716, h: 80},
                {html: `<div style="background: #e11d48; color: #fff; font-family: Arial, sans-serif; font-weight: bold; font-size: 20px; text-align: center; padding: 10px; z-index: 4;">TRAINING BLOCK 04</div>`, t: 180, l: 258, w: 300, h: 45},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #a1a1aa; word-spacing: 50px; text-align: center; z-index: 5;">MON TUE WED THU FRI SAT SUN</div>`, t: 280, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 20px; color: #f4f4f5; line-height: 3; word-spacing: 65px; text-align: center; z-index: 6;">1 2 3 4 5 6 7<br>8 9 10 11 12 13 14<br>15 16 17 18 19 20 21<br>22 23 24 25 26 27 28<br>29 30 - - - - -</div>`, t: 330, l: 50, w: 716, h: 400},
                {html: `<div style="border-top: 2px dashed #3f3f46; z-index: 7;"></div>`, t: 750, l: 50, w: 716, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #e11d48; z-index: 8;">HABIT TRACKER</div>`, t: 780, l: 80, w: 300, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #a1a1aa; line-height: 2; z-index: 9;">[ ] Gallon of Water<br>[ ] 10k Steps<br>[ ] Protein Goal<br>[ ] 8 Hours Sleep</div>`, t: 820, l: 80, w: 300, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #e11d48; z-index: 10;">PERSONAL RECORDS</div>`, t: 780, l: 450, w: 300, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #a1a1aa; line-height: 2; z-index: 11;">Squat: _______<br>Bench: _______<br>Deadlift: _____</div>`, t: 820, l: 450, w: 300, h: 100}
            ]
        },
        {
            c: "Calendars", n: "Family Organizer", w: 816, h: 1056, bg: "#fef08a",
            els: [
                {html: `<div style="background: #fef08a; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #fff; border-radius: 20px; box-shadow: 5px 5px 0px #f59e0b; z-index: 2;"></div>`, t: 40, l: 40, w: 736, h: 976},
                {html: `<div style="font-family: 'Comic Sans MS', 'Arial Black', sans-serif; font-size: 60px; color: #d97706; text-align: center; z-index: 3;">DECEMBER</div>`, t: 80, l: 50, w: 716, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #fff; background: #3b82f6; border-radius: 10px; padding: 10px; text-align: center; z-index: 4;">MOM</div>`, t: 200, l: 80, w: 180, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #fff; background: #ef4444; border-radius: 10px; padding: 10px; text-align: center; z-index: 5;">DAD</div>`, t: 200, l: 318, w: 180, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #fff; background: #10b981; border-radius: 10px; padding: 10px; text-align: center; z-index: 6;">KIDS</div>`, t: 200, l: 556, w: 180, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #444; line-height: 2.5; z-index: 7;">1st - Yoga<br>5th - Book Club<br>12th - Dentist<br>24th - Bake Sale</div>`, t: 260, l: 80, w: 180, h: 200},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #444; line-height: 2.5; z-index: 8;">3rd - Golf<br>10th - Oil Change<br>15th - PTA Meeting</div>`, t: 260, l: 318, w: 180, h: 200},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #444; line-height: 2.5; z-index: 9;">4th - Soccer<br>8th - Field Trip<br>20th - Half Day<br>25th - CHRISTMAS!</div>`, t: 260, l: 556, w: 180, h: 200},
                {html: `<div style="border-top: 4px dashed #fcd34d; z-index: 10;"></div>`, t: 550, l: 80, w: 656, h: 2},
                {html: `<div style="font-family: 'Comic Sans MS', sans-serif; font-size: 30px; color: #d97706; text-align: center; z-index: 11;">CHORE CHART</div>`, t: 580, l: 50, w: 716, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #444; line-height: 2; text-align: center; z-index: 12;">[ ] Take out Trash &nbsp;&nbsp;&nbsp; [ ] Feed Dog &nbsp;&nbsp;&nbsp; [ ] Wash Dishes<br>[ ] Clean Rooms &nbsp;&nbsp;&nbsp; [ ] Vacuum &nbsp;&nbsp;&nbsp; [ ] Water Plants</div>`, t: 650, l: 50, w: 716, h: 80}
            ]
        },
        {
            c: "Calendars", n: "Year-at-a-Glance", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: Georgia, serif; font-size: 60px; color: #111; text-align: center; letter-spacing: 5px; z-index: 2;">2026</div>`, t: 60, l: 50, w: 716, h: 80},
                {html: `<div style="background: #111; z-index: 3;"></div>`, t: 150, l: 308, w: 200, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #333; column-count: 3; column-gap: 50px; line-height: 1.8; z-index: 4;">JANUARY<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>FEBRUARY<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>MARCH<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>APRIL<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>MAY<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>JUNE<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span></div>`, t: 200, l: 80, w: 656, h: 350},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #333; column-count: 3; column-gap: 50px; line-height: 1.8; z-index: 5;">JULY<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>AUGUST<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>SEPTEMBER<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>OCTOBER<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>NOVEMBER<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>DECEMBER<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span></div>`, t: 580, l: 80, w: 656, h: 350}
            ]
        },

        // --- LETTERHEADS (5) ---
        {
            c: "Letterheads", n: "Executive Corporate", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #1e3a8a; z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 80},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 30px; color: #ffffff; z-index: 3;">NEXUS HOLDINGS</div>`, t: 20, l: 50, w: 400, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #bfdbfe; text-align: right; z-index: 4;">1-800-555-0199<br>contact@nexus.com</div>`, t: 20, l: 566, w: 200, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #333; z-index: 5;">DATE: [Insert Date]</div>`, t: 150, l: 80, w: 300, h: 20},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; z-index: 6;">TO:<br>[Recipient Name]<br>[Title/Company]<br>[Address]</div>`, t: 200, l: 80, w: 300, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #444; line-height: 1.8; z-index: 7;">Dear [Name],<br><br>Begin typing your formal letter here. This template is designed for official corporate communications, proposals, and memorandums.<br><br>Sincerely,<br><br><br><b>[Your Name]</b><br>[Your Title]</div>`, t: 350, l: 80, w: 656, h: 400},
                {html: `<div style="background: #e2e8f0; z-index: 8;"></div>`, t: 950, l: 80, w: 656, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 12px; color: #94a3b8; text-align: center; z-index: 9;">100 Business Parkway, Suite 500, Metropolis, NY 10001 | nexus-holdings.com</div>`, t: 970, l: 80, w: 656, h: 20}
            ]
        },
        {
            c: "Letterheads", n: "Creative Agency", w: 816, h: 1056, bg: "#fafafa",
            els: [
                {html: `<div style="background: #fafafa; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #facc15; border-radius: 0 0 100px 0; z-index: 2;"></div>`, t: 0, l: 0, w: 150, h: 150},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 40px; color: #111; z-index: 3;">STUDIO.</div>`, t: 50, l: 180, w: 400, h: 50},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #111; z-index: 4;">DATE: </div>`, t: 150, l: 180, w: 300, h: 20},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.8; z-index: 5;">Hello there,<br><br>Start your creative brief, pitch, or welcome letter here. Use this layout to show off your brand's modern, energetic personality.</div>`, t: 250, l: 180, w: 556, h: 400},
                {html: `<div style="background: #111; border-radius: 100px 0 0 0; z-index: 6;"></div>`, t: 906, l: 666, w: 150, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color: #777; z-index: 7;">HELLO@STUDIO.COM<br>+1 800 123 4567<br>12 ARTS DISTRICT, LA</div>`, t: 950, l: 180, w: 300, h: 60}
            ]
        },
        {
            c: "Letterheads", n: "Medical Clinic", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border-left: 10px solid #0d9488; z-index: 2;"></div>`, t: 50, l: 50, w: 10, h: 956},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 36px; font-weight: bold; color: #0d9488; z-index: 3;">Apex Medical Care</div>`, t: 80, l: 80, w: 500, h: 50},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #64748b; z-index: 4;">500 Health Way, Wellness City, ST 12345<br>Phone: (555) 123-4567 | Fax: (555) 123-4568</div>`, t: 130, l: 80, w: 500, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; z-index: 5;"><b>Date:</b><br><b>Patient Name:</b><br><b>DOB:</b></div>`, t: 220, l: 80, w: 300, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.8; z-index: 6;">To Whom It May Concern,<br><br>Type medical notes, referrals, or official clinic documentation here.</div>`, t: 350, l: 80, w: 656, h: 400},
                {html: `<div style="border-top: 1px solid #cbd5e1; z-index: 7;"></div>`, t: 850, l: 80, w: 300, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #0f172a; font-weight: bold; z-index: 8;">Dr. Jane Smith, MD<br>Chief Medical Officer</div>`, t: 860, l: 80, w: 300, h: 40}
            ]
        },
        {
            c: "Letterheads", n: "Law Firm", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 40px; color: #1e293b; text-align: center; z-index: 2;">HARRINGTON & VANCE</div>`, t: 80, l: 50, w: 716, h: 50},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 12px; color: #ca8a04; letter-spacing: 3px; text-align: center; z-index: 3;">ATTORNEYS AT LAW</div>`, t: 130, l: 50, w: 716, h: 20},
                {html: `<div style="background: #1e293b; z-index: 4;"></div>`, t: 170, l: 150, w: 516, h: 1},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 16px; color: #111; line-height: 2; z-index: 5;">[Date]<br><br><b>VIA CERTIFIED MAIL</b><br><br>[Recipient Name]<br>[Address]<br><br><b>RE: [Case/Subject Matter]</b><br><br>Dear [Name],<br><br>Begin legal correspondence here.</div>`, t: 220, l: 100, w: 616, h: 400},
                {html: `<div style="background: #1e293b; z-index: 6;"></div>`, t: 920, l: 150, w: 516, h: 1},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 12px; color: #475569; text-align: center; z-index: 7;">400 Legal Plaza, Suite 200, Justice City, ST 99999<br>Ph: (555) 987-6543 | Fax: (555) 987-6544 | www.harringtonvance.law</div>`, t: 940, l: 100, w: 616, h: 40}
            ]
        },
        {
            c: "Letterheads", n: "Tech Startup", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: linear-gradient(90deg, #8b5cf6, #ec4899); z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 10},
                {html: `<div style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #111; z-index: 3;">{'dev_corp'}</div>`, t: 60, l: 60, w: 300, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.8; z-index: 4;">Date: [Date]<br><br>Hi [Name],<br><br>Type your proposal, offer letter, or internal memo here. Clean, crisp, and code-ready.</div>`, t: 200, l: 60, w: 696, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #a1a1aa; text-align: right; z-index: 5;">hello@devcorp.io<br>www.devcorp.io<br>@devcorp</div>`, t: 60, l: 556, w: 200, h: 60}
            ]
        }
    ];

    function injectPack3Batch3() {
        const grid = document.getElementById('template-grid');
        const activeBtn = document.querySelector('.cat-btn.active');
        if (!grid || !activeBtn) return;
        const activeCat = activeBtn.innerText.trim();
        
        const existing = grid.querySelectorAll('.pack-3-batch-3');
        existing.forEach(el => el.remove());
        
        pack3Templates3.filter(t => t.c === activeCat).forEach((t) => {
            const div = document.createElement('div');
            div.className = 'tp-item pack-3-batch-3';
            
            const scale = 100 / (t.w || 794); 
            
            let previewHTML = '';
            t.els.forEach(el => {
                let styleFix = (el.html.includes('z-index: 1') || el.h > 1000) ? "width: 100%; height: 100%;" : "";
                previewHTML += `<div style="position:absolute; top:${el.t}px; left:${el.l}px; width:${el.w}px; height:${el.h}px; z-index:1; ${styleFix}">${el.html}</div>`;
            });
            
            div.innerHTML = `<div class="template-preview" style="position:relative;"><div style="width: ${t.w}px; height: ${t.h}px; background: ${t.bg}; transform: scale(${scale}); transform-origin: 0 0; overflow: hidden; position: absolute; top: 0; left: 0; pointer-events: none;">${previewHTML}</div></div><div style="font-size:12px; margin-top:5px;">${t.n}</div>`;
            div.onclick = () => window.loadTemplate(t); 
            grid.appendChild(div);
        });
    }

    if (typeof window.showTemplateModal !== 'undefined') {
        const originalModal = window.showTemplateModal;
        window.showTemplateModal = function() { originalModal(); setTimeout(injectPack3Batch3, 150); };
    }
    document.addEventListener('click', (e) => {
        if(e.target && e.target.classList && e.target.classList.contains('cat-btn')) setTimeout(injectPack3Batch3, 150); 
    });

})();
/* =========================================================================
   MODERN EXPANSION PACK 3 - BATCH 4 (Newsletters, Biz Cards, Social)
   ========================================================================= */
(function initExpansionPack3Batch4() {

    const pack3Templates4 = [
        // --- NEWSLETTERS (4) ---
        {
            c: "Newsletters", n: "Tech Update", w: 816, h: 1056, bg: "#0f172a",
            els: [
                {html: `<div style="background: #0f172a; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Courier New', monospace; font-size: 60px; font-weight: bold; color: #38bdf8; z-index: 2;">DEV.WEEKLY</div>`, t: 60, l: 50, w: 716, h: 80},
                {html: `<div style="background: #38bdf8; z-index: 3;"></div>`, t: 150, l: 50, w: 716, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #94a3b8; text-transform: uppercase; z-index: 4;">Issue #128 | October 2026 | Read Time: 5 Min</div>`, t: 160, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 32px; font-weight: bold; color: #f8fafc; z-index: 5;">The Rise of Edge Computing</div>`, t: 230, l: 50, w: 716, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #cbd5e1; line-height: 1.8; column-count: 2; column-gap: 40px; z-index: 6;">Cloud computing is shifting. Developers are moving logic closer to the user to reduce latency and save costs. This week, we look at the top frameworks making edge deployment seamless.<br><br>Also in this issue: new CSS features dropping in modern browsers, and how to optimize your React bundles for 2027.</div>`, t: 290, l: 50, w: 716, h: 250},
                {html: `<div style="background: #1e293b; border-radius: 8px; padding: 20px; z-index: 7;"></div>`, t: 560, l: 50, w: 716, h: 320},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #38bdf8; z-index: 8;">Top Links</div>`, t: 590, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #f8fafc; line-height: 2.5; z-index: 9;">🔗 10 Tips for Better APIs<br>🔗 The State of JavaScript 2026<br>🔗 Understanding WebAssembly<br>🔗 Postgres Scaling Guide</div>`, t: 640, l: 80, w: 656, h: 200},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #64748b; text-align: center; z-index: 10;">Unsubscribe | View in Browser</div>`, t: 950, l: 50, w: 716, h: 30}
            ]
        },
        {
            c: "Newsletters", n: "Real Estate Market", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #0c4a6e; z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 150},
                {html: `<div style="font-family: Georgia, serif; font-size: 50px; color: #ffffff; text-align: center; z-index: 3;">THE MARKET REPORT</div>`, t: 40, l: 50, w: 716, h: 60},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #bae6fd; text-align: center; letter-spacing: 2px; z-index: 4;">MONTHLY REAL ESTATE INSIGHTS</div>`, t: 100, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; color: #0f172a; text-align: center; z-index: 5;">Interest Rates Drop: What It Means For You</div>`, t: 200, l: 50, w: 716, h: 40},
                {html: `<div style="font-family: Georgia, serif; font-size: 16px; color: #475569; line-height: 1.8; text-align: center; z-index: 6;">For the first time in 14 months, the central bank has lowered rates, creating a unique window of opportunity for both buyers and sellers in the suburban market.</div>`, t: 260, l: 100, w: 616, h: 100},
                {html: `<div style="background: #f1f5f9; border: 1px solid #cbd5e1; z-index: 7;"></div>`, t: 400, l: 50, w: 340, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #0c4a6e; text-align: center; z-index: 8;">Current Avg Price</div>`, t: 430, l: 70, w: 300, h: 30},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 50px; color: #10b981; text-align: center; z-index: 9;">$450K</div>`, t: 500, l: 70, w: 300, h: 80},
                {html: `<div style="background: #f1f5f9; border: 1px solid #cbd5e1; z-index: 10;"></div>`, t: 400, l: 426, w: 340, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #0c4a6e; text-align: center; z-index: 11;">Featured Listing</div>`, t: 430, l: 446, w: 300, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #475569; text-align: center; line-height: 1.6; z-index: 12;"><b>123 Maple Street</b><br>4 Bed | 3 Bath | 2,500 sqft<br><br>A gorgeous newly renovated property in the heart of downtown.</div>`, t: 500, l: 446, w: 300, h: 150}
            ]
        },
        {
            c: "Newsletters", n: "Community Update", w: 816, h: 1056, bg: "#fff7ed",
            els: [
                {html: `<div style="background: #fff7ed; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Comic Sans MS', sans-serif; font-size: 60px; color: #ea580c; text-align: center; z-index: 2;">Valley News</div>`, t: 60, l: 50, w: 716, h: 80},
                {html: `<div style="border-top: 3px dashed #fdba74; z-index: 3;"></div>`, t: 150, l: 100, w: 616, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #9a3412; z-index: 4;">Spring Festival Success!</div>`, t: 180, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #431407; line-height: 1.8; z-index: 5;">Thank you to everyone who came out to the Valley Spring Festival this weekend. We raised over $5,000 for the local animal shelter and had record attendance at the pie-baking contest.</div>`, t: 230, l: 100, w: 616, h: 100},
                {html: `<div style="background: #ffedd5; padding: 20px; border-radius: 10px; z-index: 6;"></div>`, t: 360, l: 100, w: 616, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #ea580c; z-index: 7;">Upcoming Town Events</div>`, t: 390, l: 130, w: 556, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #7c2d12; line-height: 2; z-index: 8;">• <b>May 10:</b> City Council Meeting (7 PM)<br>• <b>May 15:</b> Farmer's Market Opens<br>• <b>May 22:</b> Neighborhood Watch Training</div>`, t: 440, l: 130, w: 556, h: 120}
            ]
        },
        {
            c: "Newsletters", n: "Modern Minimal", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: Helvetica, sans-serif; font-size: 80px; font-weight: 900; color: #111; letter-spacing: -3px; z-index: 2;">FOCUS.</div>`, t: 50, l: 50, w: 716, h: 90},
                {html: `<div style="background: #111; z-index: 3;"></div>`, t: 150, l: 50, w: 716, h: 10},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #777; display: flex; justify-content: space-between; z-index: 4;"><span>VOL. 04</span><span>THE DESIGN ISSUE</span></div>`, t: 180, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: Georgia, serif; font-size: 40px; color: #111; line-height: 1.2; z-index: 5;">Why less is almost always better than more.</div>`, t: 250, l: 50, w: 500, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #555; line-height: 1.8; column-count: 2; column-gap: 40px; z-index: 6;">In a world cluttered with notifications, pop-ups, and infinite scrolling, the most valuable commodity is human attention. <br><br>Minimalism isn't just an aesthetic choice anymore; it is a functional requirement for building products that people actually want to use. We strip away the unnecessary so the essential can speak.</div>`, t: 380, l: 50, w: 716, h: 250},
                {html: `<div style="border: 1px solid #111; padding: 30px; text-align: center; z-index: 7;"></div>`, t: 700, l: 200, w: 416, h: 150},
                {html: `<div style="font-family: Georgia, serif; font-size: 20px; font-style: italic; color: #111; z-index: 8;">"Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away."</div>`, t: 740, l: 230, w: 356, h: 80}
            ]
        },

        // --- BUSINESS CARDS (5) ---
        // Generates 10 cards per page (Avery style 10-up layout)
        {
            c: "Business Cards", n: "Clean Corporate", w: 816, h: 1056, bg: "#ffffff",
            els: Array.from({length: 5}, (_, i) => [
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 25px; background: #ffffff; box-sizing: border-box;"><b style="font-size: 20px; color: #0f172a; font-family: Arial, sans-serif;">Alex Chen</b><br><span style="font-size: 12px; color: #0284c7; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase;">Operations Director</span><div style="margin-top: 45px; font-size: 12px; color: #475569; font-family: Arial, sans-serif; line-height: 1.6;">P: (555) 987-6543<br>E: alex@nexus.com<br>W: www.nexus.com</div></div>`, t: 40 + (i*195), l: 60, w: 330, h: 185},
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 25px; background: #ffffff; box-sizing: border-box;"><b style="font-size: 20px; color: #0f172a; font-family: Arial, sans-serif;">Alex Chen</b><br><span style="font-size: 12px; color: #0284c7; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase;">Operations Director</span><div style="margin-top: 45px; font-size: 12px; color: #475569; font-family: Arial, sans-serif; line-height: 1.6;">P: (555) 987-6543<br>E: alex@nexus.com<br>W: www.nexus.com</div></div>`, t: 40 + (i*195), l: 426, w: 330, h: 185}
            ]).flat()
        },
        {
            c: "Business Cards", n: "Dark Executive", w: 816, h: 1056, bg: "#ffffff",
            els: Array.from({length: 5}, (_, i) => [
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 25px; background: #111827; box-sizing: border-box;"><b style="font-size: 20px; color: #d4af37; font-family: Georgia, serif;">ELEANOR VANCE</b><br><span style="font-size: 11px; color: #9ca3af; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 2px;">Managing Partner</span><div style="margin-top: 45px; font-size: 11px; color: #d1d5db; font-family: Arial, sans-serif; line-height: 1.8;">123 Executive Plaza, NY 10001<br>T: 555-0199 | E: evance@firm.com</div></div>`, t: 40 + (i*195), l: 60, w: 330, h: 185},
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 25px; background: #111827; box-sizing: border-box;"><b style="font-size: 20px; color: #d4af37; font-family: Georgia, serif;">ELEANOR VANCE</b><br><span style="font-size: 11px; color: #9ca3af; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 2px;">Managing Partner</span><div style="margin-top: 45px; font-size: 11px; color: #d1d5db; font-family: Arial, sans-serif; line-height: 1.8;">123 Executive Plaza, NY 10001<br>T: 555-0199 | E: evance@firm.com</div></div>`, t: 40 + (i*195), l: 426, w: 330, h: 185}
            ]).flat()
        },
        {
            c: "Business Cards", n: "Creative Gradient", w: 816, h: 1056, bg: "#ffffff",
            els: Array.from({length: 5}, (_, i) => [
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 25px; background: linear-gradient(135deg, #8b5cf6, #ec4899); box-sizing: border-box;"><b style="font-size: 24px; font-weight: 900; color: #ffffff; font-family: Arial, sans-serif;">Sam Riley.</b><br><span style="font-size: 14px; color: #fdf2f8; font-family: Arial, sans-serif; font-weight: bold;">UI / UX Designer</span><div style="margin-top: 40px; font-size: 12px; font-weight: bold; color: #ffffff; font-family: Arial, sans-serif; line-height: 1.6;">@samdesigns<br>samriley.portfolio</div></div>`, t: 40 + (i*195), l: 60, w: 330, h: 185},
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 25px; background: linear-gradient(135deg, #8b5cf6, #ec4899); box-sizing: border-box;"><b style="font-size: 24px; font-weight: 900; color: #ffffff; font-family: Arial, sans-serif;">Sam Riley.</b><br><span style="font-size: 14px; color: #fdf2f8; font-family: Arial, sans-serif; font-weight: bold;">UI / UX Designer</span><div style="margin-top: 40px; font-size: 12px; font-weight: bold; color: #ffffff; font-family: Arial, sans-serif; line-height: 1.6;">@samdesigns<br>samriley.portfolio</div></div>`, t: 40 + (i*195), l: 426, w: 330, h: 185}
            ]).flat()
        },
        {
            c: "Business Cards", n: "Bakery / Cafe", w: 816, h: 1056, bg: "#ffffff",
            els: Array.from({length: 5}, (_, i) => [
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 20px; background: #fffbeb; box-sizing: border-box;"><div style="text-align: center;"><b style="font-size: 24px; color: #b45309; font-family: 'Comic Sans MS', cursive;">Sweet Treats</b><br><span style="font-size: 12px; color: #d97706; font-family: Arial, sans-serif;">BAKERY & CAFE</span><div style="margin-top: 25px; font-size: 12px; color: #78350f; font-family: Arial, sans-serif; line-height: 1.6;">123 Sugar Lane<br>Order: (555) CAKE-NOW<br>@sweettreatscafe</div></div></div>`, t: 40 + (i*195), l: 60, w: 330, h: 185},
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 20px; background: #fffbeb; box-sizing: border-box;"><div style="text-align: center;"><b style="font-size: 24px; color: #b45309; font-family: 'Comic Sans MS', cursive;">Sweet Treats</b><br><span style="font-size: 12px; color: #d97706; font-family: Arial, sans-serif;">BAKERY & CAFE</span><div style="margin-top: 25px; font-size: 12px; color: #78350f; font-family: Arial, sans-serif; line-height: 1.6;">123 Sugar Lane<br>Order: (555) CAKE-NOW<br>@sweettreatscafe</div></div></div>`, t: 40 + (i*195), l: 426, w: 330, h: 185}
            ]).flat()
        },
        {
            c: "Business Cards", n: "Photography Half-Photo", w: 816, h: 1056, bg: "#ffffff",
            els: Array.from({length: 5}, (_, i) => [
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; overflow: hidden; background: #ffffff; box-sizing: border-box;"><div style="width: 40%; height: 100%; background: #333; float: left; display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px;">[Insert Photo]</div><div style="float: left; width: 60%; padding: 20px; box-sizing: border-box;"><b style="font-size: 16px; color: #111; font-family: Arial, sans-serif;">David Lens</b><br><span style="font-size: 10px; color: #777; font-family: Arial, sans-serif; text-transform: uppercase;">Photographer</span><div style="margin-top: 30px; font-size: 10px; color: #444; font-family: Arial, sans-serif; line-height: 1.6;">555-CAPTURE<br>davidlens.photo</div></div></div>`, t: 40 + (i*195), l: 60, w: 330, h: 185},
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; overflow: hidden; background: #ffffff; box-sizing: border-box;"><div style="width: 40%; height: 100%; background: #333; float: left; display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px;">[Insert Photo]</div><div style="float: left; width: 60%; padding: 20px; box-sizing: border-box;"><b style="font-size: 16px; color: #111; font-family: Arial, sans-serif;">David Lens</b><br><span style="font-size: 10px; color: #777; font-family: Arial, sans-serif; text-transform: uppercase;">Photographer</span><div style="margin-top: 30px; font-size: 10px; color: #444; font-family: Arial, sans-serif; line-height: 1.6;">555-CAPTURE<br>davidlens.photo</div></div></div>`, t: 40 + (i*195), l: 426, w: 330, h: 185}
            ]).flat()
        },

        // --- SOCIAL MEDIA (4) - 800x800 Squares ---
        {
            c: "Social Media", n: "Sale Announcement", w: 800, h: 800, bg: "#ef4444",
            els: [
                {html: `<div style="background: #ef4444; z-index: 1;"></div>`, t: 0, l: 0, w: 800, h: 800},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 180px; color: #fef08a; text-align: center; line-height: 0.9; text-shadow: 8px 8px 0px #b91c1c; z-index: 2;">FLASH<br>SALE</div>`, t: 150, l: 50, w: 700, h: 400},
                {html: `<div style="background: #111827; color: #ffffff; font-family: Arial, sans-serif; font-size: 30px; font-weight: bold; text-align: center; padding: 20px; border-radius: 100px; z-index: 3;">UP TO 70% OFF</div>`, t: 580, l: 200, w: 400, h: 80}
            ]
        },
        {
            c: "Social Media", n: "Inspirational Quote", w: 800, h: 800, bg: "#fdf2f8",
            els: [
                {html: `<div style="background: #fdf2f8; z-index: 1;"></div>`, t: 0, l: 0, w: 800, h: 800},
                {html: `<div style="font-family: Georgia, serif; font-size: 150px; color: #fbcfe8; text-align: center; z-index: 2;">"</div>`, t: 100, l: 300, w: 200, h: 150},
                {html: `<div style="font-family: Georgia, serif; font-size: 40px; color: #831843; text-align: center; line-height: 1.6; font-style: italic; z-index: 3;">Success is not final, failure is not fatal: it is the courage to continue that counts.</div>`, t: 280, l: 100, w: 600, h: 200},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #be185d; text-align: center; z-index: 4;">— Winston Churchill</div>`, t: 550, l: 100, w: 600, h: 50}
            ]
        },
        {
            c: "Social Media", n: "Podcast Promo", w: 800, h: 800, bg: "#0f172a",
            els: [
                {html: `<div style="background: #0f172a; z-index: 1;"></div>`, t: 0, l: 0, w: 800, h: 800},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #38bdf8; text-align: center; letter-spacing: 5px; z-index: 2;">NEW EPISODE OUT NOW</div>`, t: 150, l: 100, w: 600, h: 40},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 80px; color: #f8fafc; text-align: center; line-height: 1; z-index: 3;">THE FUTURE<br>OF DESIGN</div>`, t: 250, l: 50, w: 700, h: 200},
                {html: `<div style="background: #38bdf8; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 4;"><div style="width: 0; height: 0; border-top: 20px solid transparent; border-bottom: 20px solid transparent; border-left: 35px solid white; margin-left: 10px;"></div></div>`, t: 500, l: 350, w: 100, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #94a3b8; text-align: center; z-index: 5;">Available on Spotify & Apple Podcasts</div>`, t: 650, l: 100, w: 600, h: 30}
            ]
        },
        {
            c: "Social Media", n: "Product Drop", w: 800, h: 800, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 800, h: 800},
                {html: `<div style="background: #f1f5f9; border-radius: 400px; z-index: 2;"></div>`, t: 100, l: 100, w: 600, h: 600},
                {html: `<div style="font-family: 'Helvetica', sans-serif; font-size: 100px; font-weight: 900; color: #111; text-align: center; letter-spacing: -3px; z-index: 3;">JUST<br>DROPPED.</div>`, t: 250, l: 100, w: 600, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; color: #475569; text-align: center; z-index: 4;">The Summer Collection is finally here.</div>`, t: 550, l: 100, w: 600, h: 40},
                {html: `<div style="border-bottom: 2px solid #111; font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #111; text-align: center; padding-bottom: 5px; display: inline-block; z-index: 5;">SHOP NOW</div>`, t: 650, l: 320, w: 160, h: 40}
            ]
        }
    ];

    function injectPack3Batch4() {
        const grid = document.getElementById('template-grid');
        const activeBtn = document.querySelector('.cat-btn.active');
        if (!grid || !activeBtn) return;
        const activeCat = activeBtn.innerText.trim();
        
        const existing = grid.querySelectorAll('.pack-3-batch-4');
        existing.forEach(el => el.remove());
        
        pack3Templates4.filter(t => t.c === activeCat).forEach((t) => {
            const div = document.createElement('div');
            div.className = 'tp-item pack-3-batch-4';
            
            // Adjust scale to handle 800x800 squares
            const scale = 100 / (t.w || 794); 
            
            let previewHTML = '';
            t.els.forEach(el => {
                let styleFix = (el.html.includes('z-index: 1') || el.h > 1000 || el.w > 1000) ? "width: 100%; height: 100%;" : "";
                previewHTML += `<div style="position:absolute; top:${el.t}px; left:${el.l}px; width:${el.w}px; height:${el.h}px; z-index:1; ${styleFix}">${el.html}</div>`;
            });
            
            div.innerHTML = `<div class="template-preview" style="position:relative; width: 100px; height: 141px; display: flex; align-items: center; justify-content: center; overflow: hidden;"><div style="width: ${t.w}px; height: ${t.h}px; background: ${t.bg}; transform: scale(${scale}); transform-origin: center center; position: absolute; pointer-events: none;">${previewHTML}</div></div><div style="font-size:12px; margin-top:5px;">${t.n}</div>`;
            div.onclick = () => window.loadTemplate(t); 
            grid.appendChild(div);
        });
    }

    if (typeof window.showTemplateModal !== 'undefined') {
        const originalModal = window.showTemplateModal;
        window.showTemplateModal = function() { originalModal(); setTimeout(injectPack3Batch4, 150); };
    }
    document.addEventListener('click', (e) => {
        if(e.target && e.target.classList && e.target.classList.contains('cat-btn')) setTimeout(injectPack3Batch4, 150); 
    });

})();
/* =========================================================================
   UI THEME: Sticky Tabs, Helper Text, & Loading Spinner (Cleaned)
   ========================================================================= */
(function applyUITheme() {
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // Spinner Trigger Logic
    document.addEventListener('click', (e) => {
        if(e.target && e.target.closest && e.target.closest('.cat-btn')) {
            const grid = document.getElementById('template-grid');
            if (grid) {
                grid.classList.add('is-loading');
                setTimeout(() => { grid.classList.remove('is-loading'); }, 250); 
            }
        }
    });
    
    const originalShow = window.showTemplateModal;
    if (typeof originalShow === 'function' && !window._loaderHooked) {
        window._loaderHooked = true;
        window.showTemplateModal = function() {
            originalShow();
            const grid = document.getElementById('template-grid');
            if (grid) {
                grid.classList.add('is-loading');
                setTimeout(() => grid.classList.remove('is-loading'), 250);
            }
        }
    }
})();
/* =========================================================================
   BUG FIX: Universal Image Paste & Smart Routing
   ========================================================================= */
(function fixImagePaste() {
    console.log("🛠️ Universal Paste Fix initializing...");

    // --- STEP 1: The Ghost Hook (Prevent app from blocking OS clipboard) ---
    window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
            const activeEl = document.activeElement;
            const isTextEditing = activeEl && (
                activeEl.isContentEditable || 
                activeEl.tagName === 'INPUT' || 
                activeEl.tagName === 'TEXTAREA'
            );

            // If we are just on the canvas, stop the app from killing the native paste event
            if (!isTextEditing) {
                const originalPrevent = e.preventDefault;
                e.preventDefault = function() {
                    // Swallow the block request so the browser's native 'paste' event can still fire
                };
                
                // Restore it 50ms later so we don't permanently break the app's keyboard shortcuts
                setTimeout(() => { 
                    e.preventDefault = originalPrevent; 
                }, 50);
            }
        }
    }, true); // Use capture phase to intercept it first!

    // --- STEP 2: Catch the image and route it to our wrapper ---
    window.addEventListener('paste', function(e) {
        const activeEl = document.activeElement;
        const isTextEditing = activeEl && (
            activeEl.isContentEditable || 
            activeEl.tagName === 'INPUT' || 
            activeEl.tagName === 'TEXTAREA'
        );

        if (isTextEditing) return;

        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;

        const items = clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            // Check if the pasted item is an image
            if (items[i].type.indexOf('image/') !== -1) {
                
                e.preventDefault(); 
                e.stopImmediatePropagation();

                const blob = items[i].getAsFile();
                if (!blob) continue;

                const reader = new FileReader();
                reader.onload = function(event) {
                    // Route the image directly into our robust Smart Image builder!
                    if (typeof window.insertSmartImage === 'function') {
                        window.insertSmartImage(event.target.result);
                    } else {
                        console.warn("Error: insertSmartImage function is missing from the codebase.");
                    }
                };
                reader.readAsDataURL(blob);
                
                break; // We successfully handled the image, stop looking
            }
        }
    }, true);
})();

/* =========================================================================
   UI FEATURE: Dynamic Page Format Indicator (App Toolbar Position Fix)
   ========================================================================= */
(function initFormatIndicator() {
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    const oldIndicator = document.getElementById('op-format-indicator');
    if (oldIndicator) oldIndicator.remove(); 
    
    const indicator = document.createElement('div');
    indicator.id = 'op-format-indicator';
    
    indicator.title = "To change the page size, click 'Size' in the Home tab.";
    document.body.appendChild(indicator);

    const makeIcon = (label, vw, w, fs, y) => `
        <svg width="${w}" height="35" viewBox="0 0 ${vw} 28" style="display:block;">
            <path d="M 2 28 L 2 4 C 2 2.9 2.9 2 4 2 L ${vw-4} 2 C ${vw-2.9} 2 ${vw-2} 2.9 ${vw-2} 4 L ${vw-2} 28" fill="none" stroke="currentColor" stroke-width="0.8"/>
            <text x="${vw/2}" y="${y}" font-family="Arial, sans-serif" font-size="${fs}" font-weight="bold" fill="currentColor" text-anchor="middle">${label}</text>
        </svg>
    `;

    window.setPageFormatIcon = function(format) {
        let svg = '';
        const f = format ? format.toLowerCase() : '';
        if (f === 'letter') svg = makeIcon('LETTER', 32, 40, 6.5, 17);
        else if (f === 'a3') svg = makeIcon('A3', 24, 30, 10, 18);
        else if (f === 'a4') svg = makeIcon('A4', 24, 30, 10, 18);
        else if (f === 'a5') svg = makeIcon('A5', 24, 30, 10, 18);
        else if (f === 'legal') svg = makeIcon('LEGAL', 24, 30, 5.5, 17);
        else if (f === 'tabloid') svg = makeIcon('TABLOID', 34, 42, 5.5, 17);
        else if (f === 'businesscard') {
            svg = `
            <svg width="40" height="35" viewBox="0 0 36 28" style="display:block;">
                <path d="M 2 20 L 2 4 C 2 2.9 2.9 2 4 2 L 32 2 C 33.1 2 34 2.9 34 4 L 34 20 C 34 21.1 33.1 22 32 22 L 4 22 C 2.9 22 2 21.1 2 20 Z" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <text x="18" y="14" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="currentColor" text-anchor="middle">CARD</text>
            </svg>`;
        }
        else svg = makeIcon('CUSTOM', 34, 42, 5.5, 17);
        
        indicator.innerHTML = svg;
        indicator.style.transform = 'scale(1.1)';
        setTimeout(() => { indicator.style.transform = 'scale(1)'; }, 150);
    };

    indicator.innerHTML = makeIcon('A4', 24, 30, 10, 18);

    const originalLoad = window.loadTemplate;
    if (typeof originalLoad === 'function' && !window._formatHooked) {
        window._formatHooked = true;
        window.loadTemplate = function(t) {
            originalLoad(t);
            let w = t.w;
            let h = t.h || 1123;
            if (typeof state !== 'undefined' && state.isSpreadMode) {
                w = w / 2;
            }
            let shortEdge = Math.min(w, h);
            let longEdge = Math.max(w, h);
            
            let fmt = 'A4';
            if (shortEdge >= 1100) fmt = 'A3';
            else if (shortEdge >= 1000) fmt = 'Tabloid';
            else if (shortEdge >= 810 && longEdge > 1100) fmt = 'Legal';
            else if (shortEdge > 800) fmt = 'Letter';
            else if (shortEdge < 400) fmt = 'BusinessCard';
            else if (shortEdge < 600) fmt = 'A5';
            
            window.setPageFormatIcon(fmt);
        };
    }
})();
/* =========================================================================
   BUG FIX: Firefox Native Undo Override & Button Stabilization
   ========================================================================= */
(function fixFirefoxUndo() {
    
    // 1. Intercept Ctrl+Z globally
    window.addEventListener('keydown', function(e) {
        if (window.isDrawingModeActive && window.isDrawingModeActive()) {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault(); // Stop Firefox native undo, but allow propagation to drawing engine
            }
            return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
            
            // Are we actively typing?
            const activeEl = document.activeElement;
            const isTextEditing = activeEl && (
                activeEl.isContentEditable || 
                activeEl.tagName === 'INPUT' || 
                activeEl.tagName === 'TEXTAREA' ||
                activeEl.closest('[contenteditable="true"]')
            );

            // If we are NOT typing inside a text box, block Firefox!
            if (!isTextEditing) {
                // This stops Firefox from reverting hidden UI dropdowns (like page orientation)
                e.preventDefault();
                e.stopImmediatePropagation();
                
                // Manually trigger the app's custom undo instead
                if (typeof window.undo === 'function') {
                    window.undo();
                } else if (document.getElementById('undo-btn')) {
                    document.getElementById('undo-btn').click();
                }
            }
        }
    }, true);

    // 2. Prevent the top Undo/Redo buttons from triggering Firefox form submissions
    setTimeout(() => {
        const undoRedoBtns = document.querySelectorAll('#undo-btn, #redo-btn, [title*="Undo"], [title*="Redo"], .undo-btn, .redo-btn');
        undoRedoBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // In Firefox, clicking a <button> can sometimes act as a form submit if not explicitly blocked
                e.preventDefault(); 
            });
            // Stop the buttons from stealing canvas focus
            btn.addEventListener('mousedown', (e) => { e.preventDefault(); });
        });
    }, 1000);
})();
/* =========================================================================
   V63.0 - THE DEFINITIVE PASTE & INTERACTION FIX
   (Ensure the previous "Element Selection Shield" is DELETED)
   ========================================================================= */
(function installV63MasterFix() {
    console.log("🛠️ V63.0 Master Paste Fix initializing...");

    // 1. NEUTRALIZE THE GHOST HOOK DURING INTERNAL PASTES
    // We hijack the browser's native getAsFile API to return null if the app 
    // is pasting an internal element. This completely kills the double-paste bug.
    const originalGetAsFile = DataTransferItem.prototype.getAsFile;
    DataTransferItem.prototype.getAsFile = function() {
        if (window._isInternalPaste) return null;
        return originalGetAsFile.apply(this, arguments);
    };

    window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
            if (typeof state !== 'undefined' && state.copiedEl) {
                window._isInternalPaste = true;
                // Reset the flag shortly after the paste event finishes
                setTimeout(() => { window._isInternalPaste = false; }, 100);
            }
        }
    }, true);

    // 2. CLEAR INTERNAL CLIPBOARD ON TAB EXIT
    // If you leave the tab to copy an image from Google, we clear the 
    // internal clipboard so you don't paste a stale shape by accident.
    window.addEventListener('blur', () => {
        if (typeof state !== 'undefined') {
            state.copiedEl = null;
        }
    });

    // 3. RESCUE UNMOVABLE IMAGES & FIX NATIVE DRAG
    // The Ghost Hook drops raw <img> tags directly onto the paper without wrappers.
    // We scan the paper, wrap them, and ensure all images have draggable="false" 
    // so the browser doesn't interfere with your mouse movements.
    setInterval(() => {
        const paper = document.getElementById('paper');
        if (!paper) return;
        
        // Fix native browser drag interference
        paper.querySelectorAll('img').forEach(img => {
            if (img.getAttribute('draggable') !== 'false') {
                img.setAttribute('draggable', 'false');
            }
            // Strip toxic pointer events if they were injected by other addons
            if (img.style.pointerEvents === 'none') {
                img.style.pointerEvents = 'auto';
            }
        });

        // Wrap naked Ghost Hook images so they can be moved/resized
        const rawImages = Array.from(paper.children).filter(el => el.tagName === 'IMG');
        rawImages.forEach(img => {
            const w = img.offsetWidth || 300;
            const h = img.offsetHeight || 300;
            const l = img.style.left || '50px';
            const t = img.style.top || '50px';
            const z = img.style.zIndex || '10';
            const src = img.src;
            
            img.remove(); // Remove the frozen image
            
            if (typeof window.createWrapper === 'function') {
                const wrapper = window.createWrapper(`<img src="${src}" draggable="false" style="width:100%; height:100%; object-fit:fill; display:block; position:absolute; top:0; left:0;">`);
                wrapper.style.width = w + 'px';
                wrapper.style.height = h + 'px';
                wrapper.style.left = l;
                wrapper.style.top = t;
                wrapper.style.zIndex = z;
            }
        });
    }, 1000);
})();
/* =========================================================================
   V62.0 - MASTER INTERACTION & PASTE FIX
   Fixes unselectable images and the double-paste ghost bug.
   ========================================================================= */
(function installV62MasterFix() {
    console.log("🛠️ V62.0 Master Fix initializing...");

    // --- 1. RESTORE IMAGE SELECTION & MOVEMENT ---
    // Overrides the smart image builder to remove the toxic 'pointer-events: none'
    // and uses draggable="false" instead, restoring full click and drag functionality.
    if (typeof window.insertSmartImage !== 'undefined') {
        window.insertSmartImage = function(imageSrc) {
            const img = new Image();
            img.onload = function() {
                let finalWidth = img.naturalWidth;
                let finalHeight = img.naturalHeight;

                const paper = document.getElementById('paper');
                const maxWidth = (paper ? paper.offsetWidth : 794) - 40;
                const maxHeight = (paper ? paper.offsetHeight : 1123) - 40;

                if (finalWidth > maxWidth || finalHeight > maxHeight) {
                    const scale = Math.min(maxWidth / finalWidth, maxHeight / finalHeight);
                    finalWidth = Math.round(finalWidth * scale);
                    finalHeight = Math.round(finalHeight * scale);
                }

                const el = document.createElement('div');
                el.className = 'pub-element';
                el.style.left = '50px';
                el.style.top = '50px';
                el.style.width = finalWidth + 'px';
                el.style.height = finalHeight + 'px';
                el.style.zIndex = 10;
                el.setAttribute('data-scaleX', "1");
                el.setAttribute('data-scaleY', "1");
                
                // ✨ THE FIX: Removed pointer-events: none; Added draggable="false" ✨
                el.innerHTML = `
                    <div class="element-content">
                        <img src="${imageSrc}" draggable="false" style="width: 100%; height: 100%; object-fit: fill; display: block; position: absolute; top: 0; left: 0;">
                    </div>
                    <div class="resize-handle rh-nw" data-dir="nw"></div>
                    <div class="resize-handle rh-n" data-dir="n"></div>
                    <div class="resize-handle rh-ne" data-dir="ne"></div>
                    <div class="resize-handle rh-e" data-dir="e"></div>
                    <div class="resize-handle rh-se" data-dir="se"></div>
                    <div class="resize-handle rh-s" data-dir="s"></div>
                    <div class="resize-handle rh-sw" data-dir="sw"></div>
                    <div class="resize-handle rh-w" data-dir="w"></div>
                    <div class="rotate-stick"></div>
                    <div class="rotate-handle"></div>
                `;
                
                if (paper) {
                    paper.appendChild(el);
                    if (typeof selectElement === 'function') selectElement(el);
                    if (typeof updateThumbnails === 'function') updateThumbnails();
                    if (typeof pushHistory === 'function') pushHistory();
                }
            };
            img.src = imageSrc;
        };

        // Retroactively fix any broken images already sitting on the canvas!
        setTimeout(() => {
            if (typeof scheduleEmojiMigrate === 'function') scheduleEmojiMigrate();
            document.querySelectorAll('.pub-element img').forEach(img => {
                if (img.style.pointerEvents === 'none') {
                    img.style.pointerEvents = 'auto';
                    img.setAttribute('draggable', 'false');
                }
            });
        }, 500);
    }

    // --- 2. FIX THE DOUBLE-PASTE BUG ---
    // When you copy an element inside the app, we overwrite the OS clipboard with a dummy text string.
    // This forces the "Ghost Hook" to ignore the OS paste, preventing the double-paste from happening!
    if (typeof window.copyEl === 'function' && !window._copyElPatched) {
        const originalCopyEl = window.copyEl;
        window.copyEl = function() {
            originalCopyEl(); // Run your normal internal copy
            
            // Overwrite the OS clipboard so it doesn't hold a stale image
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText("openpublisher_internal");
                } else {
                    const dummy = document.createElement("input");
                    document.body.appendChild(dummy);
                    dummy.value = "openpublisher_internal";
                    dummy.select();
                    document.execCommand("copy");
                    document.body.removeChild(dummy);
                }
            } catch(e) {}
        };
        window._copyElPatched = true;
    }

    // --- 3. CLEAR STALE GHOSTS ---
    // If you click empty space and press Copy, it clears the internal clipboard 
    // so it doesn't paste something you forgot you copied.
    window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
            if (typeof state !== 'undefined' && !state.selectedEl && (!state.multiSelected || state.multiSelected.length === 0)) {
                state.copiedEl = null;
            }
        }
    });

})();
/* =========================================================================
   V64.0 - MULTI-COPY & SELECT ALL FIX
   Restores Ctrl+A and enables copying/pasting multiple elements at once.
   ========================================================================= */
(function installMultiCopyAndSelectAll() {
    console.log("🛠️ V64.0 Multi-Copy & Select All Fix initializing...");

    // --- 1. CTRL + A (Select All) ---
    window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
            // Don't intercept if the user is typing inside a text box (let them select their text!)
            const activeEl = document.activeElement;
            const isTextEditing = activeEl && (activeEl.isContentEditable || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
            if (isTextEditing) return;

            e.preventDefault(); // Stop the browser from highlighting the UI text

            const allElements = document.querySelectorAll('.pub-element');
            if (allElements.length === 0) return;

            // Clear any current single selection safely
            if (typeof window.deselect === 'function') window.deselect();

            // Setup multi-selection array
            state.multiSelected = [];
            allElements.forEach(el => {
                // Ignore the blueprint borders and hidden structural elements
                if (el.dataset.cloaked !== 'true' && el.id !== 'native-blueprint-border' && el.style.display !== 'none') {
                    state.multiSelected.push(el);
                    el.classList.add('selected');
                }
            });

            // Update UI based on how many things we grabbed
            if (state.multiSelected.length === 1) {
                window.selectElement(state.multiSelected[0]);
                state.multiSelected = [];
            } else if (state.multiSelected.length > 1) {
                const status = document.getElementById('status-msg');
                if (status) status.innerText = state.multiSelected.length + " Elements Selected";
                const ft = document.getElementById('float-toolbar');
                if (ft) ft.style.display = 'none';
            }
        }
    }, true);

    // --- 2. MULTI-ITEM COPY / CUT ---
    window.copyEl = function(isCut = false) {
        // Recover focus if lost due to clicking ribbon
        let targetBox = document.activeElement;
        if (!targetBox || (!targetBox.isContentEditable && targetBox.tagName !== 'INPUT' && targetBox.tagName !== 'TEXTAREA')) {
            if (typeof state !== 'undefined' && state.selectedEl) {
                const innerText = state.selectedEl.querySelector('div[contenteditable]') || state.selectedEl.querySelector('.text-content');
                if (innerText) {
                    targetBox = innerText;
                    if (state.lastRange) {
                        targetBox.focus();
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(state.lastRange);
                    }
                }
            }
        }

        const isTextEditing = targetBox && (targetBox.isContentEditable || targetBox.tagName === 'INPUT' || targetBox.tagName === 'TEXTAREA');
        const sel = window.getSelection();
        const hasTextSelection = sel && sel.rangeCount > 0 && !sel.isCollapsed;

        if (isTextEditing) {
            if (hasTextSelection) {
                const textToCopy = sel.toString();
                state.copiedText = textToCopy;
                
                try {
                    const range = sel.getRangeAt(0);
                    const div = document.createElement('div');
                    div.appendChild(range.cloneContents());
                    let wrapperHtml = div.innerHTML;
                    
                    let node = range.commonAncestorContainer;
                    if (node && node.nodeType === 3) node = node.parentNode;
                    
                    while (node && node !== document.body && node.getAttribute && node.getAttribute('contenteditable') !== 'true' && !node.classList.contains('text-content')) {
                        const clone = node.cloneNode(false);
                        clone.innerHTML = wrapperHtml;
                        wrapperHtml = clone.outerHTML;
                        node = node.parentNode;
                    }
                    
                    state.copiedHtml = wrapperHtml;
                } catch (err) {
                    state.copiedHtml = null;
                    console.warn("Failed to capture HTML copy in copyEl", err);
                }
                
                state.copiedElements = [];
                
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(textToCopy).catch(e => {
                            document.execCommand(isCut ? 'cut' : 'copy');
                        });
                    } else {
                        document.execCommand(isCut ? 'cut' : 'copy');
                    }
                } catch(e) {
                    document.execCommand(isCut ? 'cut' : 'copy');
                }
                
                if (isCut) {
                    sel.deleteFromDocument();
                    if (typeof pushHistory !== 'undefined') pushHistory();
                }
            }
            return;
        }

        state.copiedElements = []; // New array to hold all copied items
        state.copiedText = ""; // Clear text clipboard

        if (state.multiSelected && state.multiSelected.length > 0) {
            // Copy all selected items
            state.multiSelected.forEach(el => {
                state.copiedElements.push(el.cloneNode(true));
            });
            if (isCut) {
                state.multiSelected.forEach(el => el.remove());
                state.multiSelected = [];
                state.selectedEl = null;
                document.getElementById('selection-box').style.display = 'none';
                if(typeof pushHistory !== 'undefined') pushHistory();
            }
        } else if (state.selectedEl) {
            // Copy single selected item
            state.copiedElements.push(state.selectedEl.cloneNode(true));
            if (isCut) {
                state.selectedEl.remove();
                state.selectedEl = null;
                document.getElementById('selection-box').style.display = 'none';
                if(typeof pushHistory !== 'undefined') pushHistory();
            }
        }

        // Overwrite OS clipboard with a dummy string to prevent the double-paste bug (Ghost Hook)
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText("openpublisher_internal_multi");
            } else {
                const dummy = document.createElement("input");
                document.body.appendChild(dummy);
                dummy.value = "openpublisher_internal_multi";
                dummy.select();
                document.execCommand("copy");
                document.body.removeChild(dummy);
            }
        } catch(e) {}
    };

    window.cutEl = function() {
        window.copyEl(true);
    };

    // --- 3. MULTI-ITEM PASTE ---
    window.pasteEl = function() {
        // First check if we have our new array of copied elements
        if (state.copiedElements && state.copiedElements.length > 0) {
            
            if (typeof window.deselect === 'function') window.deselect();
            state.multiSelected = [];

            state.copiedElements.forEach((originalClone) => {
                // Clone the clone so we can paste multiple times in a row
                const n = originalClone.cloneNode(true);
                
                // Shift it down and right by 20px so it doesn't perfectly overlap
                const currentLeft = parseFloat(n.style.left) || 0;
                const currentTop = parseFloat(n.style.top) || 0;
                n.style.left = (currentLeft + 20) + 'px';
                n.style.top = (currentTop + 20) + 'px';
                
                // Add to paper
                const paper = document.getElementById('paper');
                if (paper) paper.appendChild(n);

                // Add to multi-select array
                state.multiSelected.push(n);
                n.classList.add('selected');
            });

            // Update the master copied elements to the NEW positions so if they paste AGAIN, it cascades!
            state.copiedElements = state.multiSelected.map(el => el.cloneNode(true));

            // Update UI based on how many were pasted
            if (state.multiSelected.length === 1) {
                window.selectElement(state.multiSelected[0]);
                state.multiSelected = [];
            } else if (state.multiSelected.length > 1) {
                const status = document.getElementById('status-msg');
                if (status) status.innerText = state.multiSelected.length + " Elements Selected";
                const ft = document.getElementById('float-toolbar');
                if (ft) ft.style.display = 'none';
            }

            if (typeof updateThumbnails === 'function') updateThumbnails();
            if (typeof pushHistory === 'function') pushHistory();
        } 
        // Fallback for older single-item copies just in case
        else if (state.copiedEl) {
            const n = state.copiedEl.cloneNode(true);
            n.style.left = (parseFloat(n.style.left)+20)+'px';
            n.style.top = (parseFloat(n.style.top)+20)+'px';
            const paper = document.getElementById('paper');
            if(paper) paper.appendChild(n);
            window.selectElement(n);
            state.copiedEl = n.cloneNode(true); // Cascade
            if(typeof updateThumbnails === 'function') updateThumbnails();
            if(typeof pushHistory === 'function') pushHistory();
        }
    };
/* =========================================================================
   V65.0 - TRUE MULTI-COPY KEYBOARD OVERRIDE
   Fixes the Ctrl+C and Ctrl+V shortcuts ignoring multi-selected arrays.
   ========================================================================= */
(function installV65TrueMultiCopy() {
    console.log("🛠️ V65.0 True Multi-Copy Override initializing...");

    window.addEventListener('keydown', function(e) {
        const activeEl = document.activeElement;
        const isTextEditing = activeEl && (activeEl.isContentEditable || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

        // --- 1. OVERRIDE CTRL + C ---
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
            if (isTextEditing) return; // Let the user copy text normally if typing

            // If they have EITHER a single item OR multiple items selected
            if (state.selectedEl || (state.multiSelected && state.multiSelected.length > 0)) {
                e.preventDefault();
                e.stopImmediatePropagation(); // Kill the original broken shortcut
                
                if (typeof window.copyEl === 'function') window.copyEl();
            }
        }

        // --- 2. OVERRIDE CTRL + V ---
        if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
            if (isTextEditing) return;

            // If they have copied data in EITHER the old or new array
            if (state.copiedEl || (state.copiedElements && state.copiedElements.length > 0)) {
                e.preventDefault();
                e.stopImmediatePropagation(); // Kill the original broken shortcut
                
                // Activate the Ghost Hook shield for multi-pastes
                window._isInternalPaste = true;
                setTimeout(() => { window._isInternalPaste = false; }, 100);

                if (typeof window.pasteEl === 'function') window.pasteEl();
            }
        }
    }, true); // 'true' runs this in the Capture Phase, beating the old code to the punch!

    // --- 3. NATIVE COPY SYNC ---
    document.addEventListener('copy', function(e) {
        const active = document.activeElement;
        if (active && (active.isContentEditable || active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
                if (typeof state !== 'undefined') {
                    state.copiedText = sel.toString();
                    
                    try {
                        const range = sel.getRangeAt(0);
                        const div = document.createElement('div');
                        div.appendChild(range.cloneContents());
                        let wrapperHtml = div.innerHTML;
                        
                        let node = range.commonAncestorContainer;
                        if (node && node.nodeType === 3) node = node.parentNode;
                        
                        while (node && node !== document.body && node.getAttribute && node.getAttribute('contenteditable') !== 'true' && !node.classList.contains('text-content')) {
                            const clone = node.cloneNode(false);
                            clone.innerHTML = wrapperHtml;
                            wrapperHtml = clone.outerHTML;
                            node = node.parentNode;
                        }
                        
                        state.copiedHtml = wrapperHtml;
                    } catch (err) {
                        state.copiedHtml = null;
                        console.warn("Failed to capture HTML copy", err);
                    }
                    
                    state.copiedElements = [];
                }
            }
        }
    });
})();
    // --- 4. MULTI-ITEM DELETE OVERRIDE ---
    // Make sure hitting Delete or Backspace clears the whole group safely
    const oldDelete = window.deleteSelected;
    window.deleteSelected = function() {
        if (state.multiSelected && state.multiSelected.length > 0) {
            state.multiSelected.forEach(el => {
                if(el && el.remove) el.remove();
            });
            state.multiSelected = [];
            if(typeof updateThumbnails === 'function') updateThumbnails();
            if(typeof pushHistory === 'function') pushHistory();
            const ft = document.getElementById('float-toolbar');
            if (ft) ft.style.display = 'none';
            const status = document.getElementById('status-msg');
            if (status) status.innerText = "Ready";
        } else if (oldDelete) {
            oldDelete();
        }
    };

})();
/* =========================================================================
   V3.1.13 MASTER PATCH: Paste, Undo, and Group Rotation Mechanics
   ========================================================================= */

// --- PART 1: The "Ghost Hook" Universal Paste ---
(function initializeUniversalPaste() {
    setTimeout(() => {
        try {
            const ribbonButtons = document.querySelectorAll('.paste-btn, .copy-btn, [title="Paste"], [title="Copy"], [id*="paste"], [id*="copy"]');
            ribbonButtons.forEach(button => {
                button.addEventListener('mousedown', (e) => { e.preventDefault(); });
            });
        } catch (e) {}
    }, 1000);

    window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
            const activeEl = document.activeElement;
            const isTextEditing = activeEl && (activeEl.isContentEditable || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.closest('[contenteditable="true"]'));
            if (isTextEditing) return; 

            const originalPrevent = e.preventDefault;
            e.preventDefault = function() { }; // Swallow the preventDefault to force a native paste
        }
    }, true); 

    window.addEventListener('paste', function(e) {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.isContentEditable || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.closest('[contenteditable="true"]'))) return; 

        try {
            const clipboardData = e.clipboardData || window.clipboardData;
            if (!clipboardData) return;
            const items = clipboardData.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === 'file' && item.type.indexOf('image/') !== -1) {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    const blob = item.getAsFile();
                    if (!blob) continue;

                    const file = new File([blob], "pasted-image.png", { type: blob.type });
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);

                    const dropEvent = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dataTransfer });
                    const dropTarget = document.getElementById('workspace') || document.querySelector('.canvas-container') || document.querySelector('.canvas') || document.body;
                    dropTarget.dispatchEvent(dropEvent);

                    setTimeout(() => {
                        if (!document.querySelector('img[src^="data:image"]')) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                                const img = new Image();
                                img.src = ev.target.result;
                                img.style.maxWidth = '300px';
                                img.style.position = 'absolute';
                                img.style.zIndex = '9999';
                                dropTarget.appendChild(img);
                            };
                            reader.readAsDataURL(blob);
                        }
                    }, 500);
                    return; 
                }
            }
        } catch (err) { console.error("Ghost Hook Image injection failed:", err); }
    }, true); 
})();

// --- PART 2: Firefox Native Undo Override & History Spam Filter ---
(function fixFirefoxUndo() {
    window.addEventListener('keydown', function(e) {
        if (window.isDrawingModeActive && window.isDrawingModeActive()) {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault(); // Stop Firefox native undo, but allow propagation to drawing engine
            }
            return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
            const activeEl = document.activeElement;
            const isTextEditing = activeEl && (activeEl.isContentEditable || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.closest('[contenteditable="true"]'));

            if (!isTextEditing) {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (typeof window.undo === 'function') {
                    window.undo();
                } else if (document.getElementById('undo-btn')) {
                    document.getElementById('undo-btn').click();
                }
            }
        }
    }, true);

    setTimeout(() => {
        const undoRedoBtns = document.querySelectorAll('#undo-btn, #redo-btn, [title*="Undo"], [title*="Redo"], .undo-btn, .redo-btn');
        undoRedoBtns.forEach(btn => {
            btn.addEventListener('click', (e) => { e.preventDefault(); });
            btn.addEventListener('mousedown', (e) => { e.preventDefault(); });
        });
    }, 1000);
})();

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
/* =========================================================================
   Floating Toolbar Engine | A highly optimized, draggable
   floating toolbar with WeakMap coordinate memory, live
   color previewing, and native form element UI overrides.
   ========================================================================= */
;(function upgradeFloatingToolbar() { 
    // Initialize WeakMap to securely bind position data to DOM elements (prevents memory leaks)
    window._floatMem = window._floatMem || new WeakMap();

    const floatBar = document.getElementById('float-toolbar');
    if (!floatBar) return;

    // --- 1. DOM PREPARATION ---
    // Detach critical dropdown elements to prevent reference errors before HTML replacement
    const fontDropdownList = document.getElementById('float-font-list');
    if (fontDropdownList) fontDropdownList.remove(); 

    // --- 2. CSS STYLESHEET INJECTION ---
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // Custom Size Dropdown Logic
    window.toggleFloatSizeDropdown = function() {
        const menu = document.getElementById('float-size-list');
        const isVisible = menu && menu.style.display === 'block';
        document.querySelectorAll('.custom-dropdown').forEach(d => d.style.display = 'none');
        if (!isVisible && menu) {
            menu.style.display = 'block';
            menu.style.top = '24px';
            menu.style.bottom = 'auto';
            const rect = menu.getBoundingClientRect();
            if (rect.bottom > window.innerHeight - 10) {
                menu.style.top = 'auto';
                menu.style.bottom = '24px';
            }
        }
    };

    // Custom Font Dropdown Logic
    window.toggleFloatFontDropdown = function() {
        const menu = document.getElementById('float-font-list');
        const isVisible = menu && menu.style.display === 'block';
        document.querySelectorAll('.custom-dropdown').forEach(d => d.style.display = 'none');
        if (!isVisible && menu) {
            menu.style.display = 'block';
            menu.style.top = '28px';
            menu.style.bottom = 'auto';
            const rect = menu.getBoundingClientRect();
            if (rect.bottom > window.innerHeight - 10) {
                menu.style.top = 'auto';
                menu.style.bottom = '28px';
            }
        }
    };
    
    window.selectFloatSize = function(sizeStr) {
        const lbl = document.getElementById('float-size-label');
        if(lbl) lbl.innerText = parseInt(sizeStr);
        if(typeof setTrueFontSize === 'function') setTrueFontSize(sizeStr);
        const menu = document.getElementById('float-size-list');
        if(menu) menu.style.display = 'none';
    };

    // --- 3. UI TEMPLATE INJECTION ---
    floatBar.innerHTML = `<div class="float-drag-grip" id="float-drag-handle" title="Drag to move">
            <div class="grip-dots">
                <span></span><span></span>
                <span></span><span></span>
                <span></span><span></span>
            </div>
        </div>
        
        <div class="float-tools-col">
            <div class="float-tool-row">
                <div class="float-input-group">
                    <div class="float-font-btn" id="float-font" onclick="toggleFloatFontDropdown(); event.stopPropagation();">
                        <span id="float-font-label" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Arial</span>
                        <div class="drop-arrow"><i class="fas fa-chevron-down"></i></div>
                    </div>
                    <div class="float-size-wrapper">
                        <div class="float-font-btn" id="float-size-btn" onclick="toggleFloatSizeDropdown(); event.stopPropagation();" style="width: 60px;">
                            <span id="float-size-label">16</span>
                            <div class="drop-arrow"><i class="fas fa-chevron-down"></i></div>
                        </div>
                        <div class="custom-dropdown" id="float-size-list" style="display:none; position:absolute; top:24px; left:0; width:60px; z-index:10000;">
                            <div class="float-size-item" onclick="selectFloatSize('8px'); event.stopPropagation();">8</div>
                            <div class="float-size-item" onclick="selectFloatSize('9px'); event.stopPropagation();">9</div>
                            <div class="float-size-item" onclick="selectFloatSize('10px'); event.stopPropagation();">10</div>
                            <div class="float-size-item" onclick="selectFloatSize('11px'); event.stopPropagation();">11</div>
                            <div class="float-size-item" onclick="selectFloatSize('12px'); event.stopPropagation();">12</div>
                            <div class="float-size-item" onclick="selectFloatSize('14px'); event.stopPropagation();">14</div>
                            <div class="float-size-item" onclick="selectFloatSize('16px'); event.stopPropagation();">16</div>
                            <div class="float-size-item" onclick="selectFloatSize('18px'); event.stopPropagation();">18</div>
                            <div class="float-size-item" onclick="selectFloatSize('20px'); event.stopPropagation();">20</div>
                            <div class="float-size-item" onclick="selectFloatSize('24px'); event.stopPropagation();">24</div>
                            <div class="float-size-item" onclick="selectFloatSize('28px'); event.stopPropagation();">28</div>
                            <div class="float-size-item" onclick="selectFloatSize('32px'); event.stopPropagation();">32</div>
                            <div class="float-size-item" onclick="selectFloatSize('36px'); event.stopPropagation();">36</div>
                            <div class="float-size-item" onclick="selectFloatSize('48px'); event.stopPropagation();">48</div>
                            <div class="float-size-item" onclick="selectFloatSize('72px'); event.stopPropagation();">72</div>
                            <div class="float-size-item" onclick="selectFloatSize('80px'); event.stopPropagation();">80</div>
                            <div class="float-size-item" onclick="selectFloatSize('96px'); event.stopPropagation();">96</div>
                            <div class="float-size-item" onclick="selectFloatSize('110px'); event.stopPropagation();">110</div>
                            <div class="float-size-item" onclick="selectFloatSize('120px'); event.stopPropagation();">120</div>
                            <div class="float-size-item" onclick="selectFloatSize('130px'); event.stopPropagation();">130</div>
                            <div class="float-size-item" onclick="selectFloatSize('144px'); event.stopPropagation();">144</div>
                            <div class="float-size-item" onclick="selectFloatSize('160px'); event.stopPropagation();">160</div>
                            <div class="float-size-item" onclick="selectFloatSize('200px'); event.stopPropagation();">200</div>
                            <div class="float-size-item" onclick="selectFloatSize('256px'); event.stopPropagation();">256</div>
                        </div>
                    </div>
                </div>
                
                <div class="float-divider"></div>
                
                <div class="float-mini-btn float-color-btn" title="Text Color" onclick="CustomColorPicker.open(this, document.getElementById('float-text-color-bar').style.backgroundColor || '#004d40', (c) => { document.getElementById('float-text-color-bar').style.background=c; execCmd('foreColor', c); })">
                    <strong style="font-family: Arial, sans-serif;">A</strong>
                    <div class="float-color-bar" id="float-text-color-bar" style="background: #004d40;"></div>
                </div>

                <div class="float-mini-btn float-color-btn" title="Highlight Color" onclick="CustomColorPicker.open(this, document.getElementById('float-bg-color-bar').style.backgroundColor || '#ffff00', (c) => { document.getElementById('float-bg-color-bar').style.background=c; execCmd('hiliteColor', c); })">
                    <i class="fas fa-marker" style="transform: rotate(-15deg); font-size: 13px;"></i>
                    <div class="float-color-bar" id="float-bg-color-bar" style="background: #ffff00;"></div>
                </div>

                <div class="float-divider"></div>

                <div class="float-mini-btn" onclick="execCmd('removeFormat')" title="Clear Formatting"><i class="fas fa-eraser"></i></div>

                <div class="float-divider"></div>

                <div class="float-mini-btn" onclick="bringFront()" title="Bring to Front">
                    <div class="arrange-icon-wrapper">
                        <i class="fas fa-layer-group"></i>
                        <i class="fas fa-arrow-up arrange-arrow"></i>
                    </div>
                </div>
                <div class="float-mini-btn" onclick="sendBack()" title="Send to Back">
                    <div class="arrange-icon-wrapper">
                        <i class="fas fa-layer-group"></i>
                        <i class="fas fa-arrow-down arrange-arrow"></i>
                    </div>
                </div>
            </div>

            <div class="float-tool-row">
                <div class="float-mini-btn" onclick="execCmd('bold')" title="Bold"><strong>B</strong></div>
                <div class="float-mini-btn" onclick="execCmd('italic')" title="Italic"><strong><em>I</em></strong></div>
                <div class="float-mini-btn" onclick="execCmd('underline')" title="Underline"><strong style="text-decoration: underline;">U</strong></div>
                <div class="float-mini-btn" onclick="execCmd('strikeThrough')" title="Strikethrough"><strong style="text-decoration: line-through;">S</strong></div>
                
                <div class="float-divider"></div>
                
                <div class="float-mini-btn" onclick="execCmd('subscript')" title="Subscript"><strong style="font-family: Arial, sans-serif; font-size: 13px;">X<sub>1</sub></strong></div>
                <div class="float-mini-btn" onclick="execCmd('superscript')" title="Superscript"><strong style="font-family: Arial, sans-serif; font-size: 13px;">X<sup>1</sup></strong></div>

                <div class="float-divider"></div>

                <div class="float-mini-btn" onclick="execCmd('justifyLeft')" title="Align Left"><i class="fas fa-align-left"></i></div>
                <div class="float-mini-btn" onclick="execCmd('justifyCenter')" title="Align Center"><i class="fas fa-align-center"></i></div>
                <div class="float-mini-btn" onclick="execCmd('justifyRight')" title="Align Right"><i class="fas fa-align-right"></i></div>

                <div class="float-divider"></div>

                <div class="float-mini-btn" onclick="execCmd('insertUnorderedList')" title="Bullet List"><i class="fas fa-list-ul"></i></div>
                <div class="float-mini-btn" onclick="execCmd('insertOrderedList')" title="Numbered List"><i class="fas fa-list-ol"></i></div>
            </div>
        </div>`;

    // Restore rescued elements
    if (fontDropdownList) {
        const fGroup = floatBar.querySelector('.float-input-group');
        if(fGroup) {
            fontDropdownList.style.top = '28px';
            fontDropdownList.style.left = '0px';
            fGroup.appendChild(fontDropdownList);
        } else {
            floatBar.appendChild(fontDropdownList);
        }
    }

    // --- 4. INTERACTION LOGIC: DRAGGING & MEMORY ---
    const handle = document.getElementById('float-drag-handle');
    let isDragging = false;
    let dragStartX, dragStartY;
    let initialLeft, initialTop;

    if (handle) {
        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault(); 
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            
            // Convert any transform/bottom based positioning into absolute top/left so drag works smoothly
            const fbRect = floatBar.getBoundingClientRect();
            floatBar.style.bottom = 'auto';
            floatBar.style.transform = 'none';
            floatBar.style.left = fbRect.left + 'px';
            floatBar.style.top = fbRect.top + 'px';
            
            initialLeft = fbRect.left;
            initialTop = fbRect.top;
            document.body.style.cursor = 'grabbing';
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        floatBar.style.left = (initialLeft + dx) + 'px';
        floatBar.style.top = (initialTop + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = 'default';
            
            // Store the exact screen coordinates instead of relative to object
            const fbRect = floatBar.getBoundingClientRect();
            window._globalFloatPos = {
                top: fbRect.top,
                left: fbRect.left
            };
        }
    });

    // Prevent standard UI tools from stealing DOM focus
    floatBar.addEventListener('mousedown', function(e) {
        const tag = e.target.tagName.toUpperCase();
        if (tag === 'INPUT' || tag === 'SELECT') return;
        e.preventDefault(); 
    }, true);

    // --- 5. POSITION LOADER ---
    if (typeof window.showFloatToolbar === 'function' && !window._floatPosPatchedV88) {
        const originalShowFloat = window.showFloatToolbar;
        
        window.showFloatToolbar = function() {
            originalShowFloat.apply(this, arguments);
            // We no longer manually position floatBar here because it is docked by default or uses global dragged pos
        };
        window._floatPosPatchedV88 = true;
    }
    
    // --- 6. FONT SIZE SYNCING ---
    if (typeof window.updateFloatToolbarValues === 'function' && !window._floatUpdatePatchedV88) {
        const originalUpdateFloatValues = window.updateFloatToolbarValues;
        window.updateFloatToolbarValues = function() {
            try { originalUpdateFloatValues.apply(this, arguments); } catch (err) {}
            const ribbonSize = document.getElementById('font-size');
            if (ribbonSize) {
                const szFloatLabel = document.getElementById('float-size-label');
                if (szFloatLabel) szFloatLabel.innerText = ribbonSize.value;
            }
        };
        window._floatUpdatePatchedV88 = true;
    }

})();
/* =========================================================================
   Granular Text Undo Protector | Bypasses browser 
   chunking for keystroke-by-keystroke undo history.
   ========================================================================= */
;(function installGranularUndoProtector() {
    console.log("🛠️ V91.0 Granular Text Undo Protector initializing...");

    // WeakMap securely binds the history array directly to the DOM element 
    const TextHistory = new WeakMap();

    // Fetches or creates the history stack for the active text box
    function getHist(el) {
        if (!TextHistory.has(el)) {
            TextHistory.set(el, { 
                undo: [], 
                redo: [], 
                isRestoring: false, 
                lastState: el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.innerHTML 
            });
        }
        return TextHistory.get(el);
    }

    // Forces the cursor to the end of the text so it doesn't snap to the beginning
    function setCursorToEnd(el) {
        try {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.selectionStart = el.selectionEnd = el.value.length;
            } else {
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(el);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } catch(e) {}
    }

    // --- 1. RECORD EVERY SINGLE KEYSTROKE ---
    document.addEventListener('input', function(e) {
        const el = e.target;
        if (!el || (!el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
        
        const hist = getHist(el);
        if (hist.isRestoring) return; // Don't record our own undo/redo actions

        const currentState = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.innerHTML;
        
        // Save the PREVIOUS state to the undo stack
        hist.undo.push(hist.lastState);
        
        // Cap history at 200 strokes to prevent browser memory bloat
        if (hist.undo.length > 200) hist.undo.shift();
        
        // Clear redo stack because we typed something new
        hist.redo = [];
        
        // Update the tracker to the current state
        hist.lastState = currentState;

    }, true); 
    
    // --- 1.5 COMMIT TO GLOBAL HISTORY ON BLUR ---
    document.addEventListener('focusout', function(e) {
        const el = e.target;
        if (!el || (!el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
        
        const hist = getHist(el);
        if (hist.undo.length > 0 && !hist.isRestoring) {
            // We finished editing. Commit the final text block to the app's global history.
            if (typeof window.pushHistory === 'function') window.pushHistory();
            
            // Clear the local character-by-character history so the next Ctrl+Z triggers a global undo
            hist.undo = [];
            hist.redo = [];
        }
    });

    // --- 2. INTERCEPT CTRL+Z AND APPLY EXACT PREVIOUS STATE ---
    document.addEventListener('keydown', function(e) {
        if (window.isDrawingModeActive && window.isDrawingModeActive()) return;
        const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey;
        const isRedo = (e.ctrlKey || e.metaKey) && ((e.key.toLowerCase() === 'y') || (e.key.toLowerCase() === 'z' && e.shiftKey));
        
        if (isUndo || isRedo) {
            const el = document.activeElement;
            if (!el || (!el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
            
            // 🛑 SHIELD ACTIVATED: Stop the app and the browser entirely
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const hist = getHist(el);
            
            if (isUndo && hist.undo.length > 0) {
                hist.isRestoring = true; // Lock the recorder
                
                const currentState = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.innerHTML;
                hist.redo.push(currentState); // Save current so we can redo it
                
                const prevState = hist.undo.pop(); // Grab exact previous keystroke
                
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.value = prevState;
                } else {
                    el.innerHTML = prevState;
                }
                
                hist.lastState = prevState;
                setCursorToEnd(el);
                
                // Release the lock
                setTimeout(() => hist.isRestoring = false, 10);
            } 
            else if (isRedo && hist.redo.length > 0) {
                hist.isRestoring = true; 
                
                const currentState = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.innerHTML;
                hist.undo.push(currentState);
                
                const nextState = hist.redo.pop();
                
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.value = nextState;
                } else {
                    el.innerHTML = nextState;
                }
                
                hist.lastState = nextState;
                setCursorToEnd(el);
                
                setTimeout(() => hist.isRestoring = false, 10);
            }
        }
    }, true);
})();
/* =========================================================================
   Formatting & Drag-Lock fix | fixes text size from home tab and fixes
   the "sticky box" drag bug while preserving triple-click selection.
   ========================================================================= */
(function installMasterFormattingFix() {
    console.log("🛠️ V70.0 Master Formatting & Drag-Lock Fix initializing...");

    // --- 1. THE FOCUS SHIELD ---
    document.addEventListener('mousedown', function(e) {
        if (e.target.closest('.ribbon-container')) {
            const tag = e.target.tagName.toUpperCase();
            if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
            e.preventDefault();
        }
    }, true); 

    // --- 2. THE COMMAND UPGRADE ---
    if (typeof window.execCmd === 'function' && !window._execCmdPatched) {
        const originalExecCmd = window.execCmd;
        window.execCmd = function(cmd, val) {
            const activeEl = document.activeElement;
            const isTextEditing = activeEl && activeEl.isContentEditable;

            if (!isTextEditing && typeof state !== 'undefined' && state.lastRange && state.selectedEl) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(state.lastRange);
            }
            originalExecCmd.apply(this, arguments);
        };
        window._execCmdPatched = true;
    }

    // --- 3. THE TRIPLE-CLICK & DRAG-LOCK PROTECTOR ---
    document.addEventListener('mouseup', function(e) {
        // ✨ THE FIX: If the app is actively dragging/resizing a box, DO NOT intercept! 
        // Let the app's native handleMouseUp fire so it releases the element.
        if (typeof state !== 'undefined' && state.dragMode) {
            return; 
        }

        // Otherwise, protect the text highlight from being wiped out
        if (e.target.closest('.element-content') && !e.target.classList.contains('resize-handle') && !e.target.classList.contains('rotate-handle')) {
            const sel = window.getSelection();
            if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
                e.stopImmediatePropagation();
            }
        }
    }, true); 

    // --- 4. THE BULLETPROOF FONT SIZE ENGINE ---
    if (typeof window.setTrueFontSize !== 'undefined') {
        window.setTrueFontSize = function(val) {
            if (!state.selectedEl) return;
            
            state.isProgrammaticUpdate = true;
            const waText = state.selectedEl.querySelector('.wa-text');
            const activeInput = document.activeElement; 
            
            if (waText) {
                waText.style.fontSize = val;
                waText.style.transform = 'none'; 
                state.selectedEl.style.width = (waText.offsetWidth + 8) + 'px';
                state.selectedEl.style.height = (waText.offsetHeight + 8) + 'px';
                if (typeof syncWordArt === 'function') syncWordArt(state.selectedEl); 
            } else {
                const editableContent = state.selectedEl.querySelector('[contenteditable="true"]') || 
                                        state.selectedEl.querySelector('.element-content > div') || 
                                        state.selectedEl.querySelector('.element-content');
                
                if (editableContent) {
                    editableContent.focus(); 
                    const sel = window.getSelection();
                    sel.removeAllRanges();

                    let wasCollapsed = false;

                    if (state.lastRange) {
                        sel.addRange(state.lastRange);
                        if (sel.isCollapsed) wasCollapsed = true;
                    } else {
                        wasCollapsed = true;
                    }

                    if (wasCollapsed) document.execCommand("selectAll");
                    
                    document.execCommand("fontSize", false, "7"); 
                    
                    const fontTags = state.selectedEl.querySelectorAll('font[size="7"], span[style*="xxx-large"], span[style*="48px"]');
                    fontTags.forEach(f => {
                        f.removeAttribute("size");
                        f.style.fontSize = val;
                    });

                    if (sel.rangeCount > 0 && !wasCollapsed) {
                        state.lastRange = sel.getRangeAt(0).cloneRange();
                    } else if (wasCollapsed) {
                        sel.removeAllRanges(); 
                    }
                }
            }
            
            if (activeInput && (activeInput.tagName === 'INPUT' || activeInput.tagName === 'SELECT')) {
                activeInput.focus();
            }

            const numVal = parseInt(val);
            const floatSelect = document.getElementById('float-size');
            const ribbonInput = document.getElementById('font-size');
            const ctxRibbonInput = document.getElementById('ctx-font-size-text'); 
            
            if (ribbonInput) ribbonInput.value = numVal;
            if (ctxRibbonInput) ctxRibbonInput.value = numVal;
            
            if (floatSelect) {
                let optionExists = Array.from(floatSelect.options).some(opt => parseInt(opt.value) === numVal);
                if (!optionExists) {
                    const newOpt = document.createElement('option');
                    newOpt.value = numVal;
                    newOpt.innerText = numVal;
                    floatSelect.appendChild(newOpt);
                }
                floatSelect.value = numVal;
            }
            
            if (typeof pushHistory === 'function') pushHistory();
            setTimeout(() => { state.isProgrammaticUpdate = false; }, 100);
        };
    }
})();
/* =========================================================================
   BUG FIX: Group Dragging Patch
   Forces the mouse to grab the group wrapper instead of the individual items
   ========================================================================= */
(function applyGroupDragFix() {
    const style = document.createElement('style');
    
    // NOTE: If your group box uses a different class name than "op-group", 
    // just change it in the line below!
    // CSS extracted to style.css
    document.head.appendChild(style);
})();
/* =========================================================================
   NON-GROUPING STABILITY PATCHES (Safe UI Fixes Only)
   ========================================================================= */
(function applyUIFixes() {

    // 1. SELECT ALL REDEMPTION
    // Restores functionality to the ribbon button without breaking multi-select
    window.selectAllElements = function() {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', ctrlKey: true, bubbles: true }));
    };

    // 2. THE "ANTI-FREEZE" SAFETY NET
    // Prevents the Uncaught TypeError that locks your mouse if deselect fails
    if (typeof window.deselect === 'function') {
        const originalDeselect = window.deselect;
        window.deselect = function() {
            // If the app tries to deselect something that isn't there, catch it safely
            if (state && state.selectedEl && !state.selectedEl.classList) {
                if (Array.isArray(state.selectedEl)) {
                    state.selectedEl.forEach(el => {
                        if (el && el.classList) el.classList.remove('selected', 'active');
                    });
                }
                state.selectedEl = null;
            }
            try { 
                originalDeselect(); 
            } catch (e) { 
                console.warn("OpenPublisher: Suppressed deselect crash.");
            }
        };
    }

})();
/* =========================================================================
   GROUP BUTTON HIJACK & MODAL (Final Version)
   ========================================================================= */
(function disableGroupingSafely() {

    // 1. The Explanatory Modal (Using your native DialogSystem)
    function showGroupingMaintenanceModal() {
        if (typeof DialogSystem !== 'undefined') {
            DialogSystem.show(
                '<i class="fas fa-exclamation-triangle" style="color: #ffffff;"></i>&nbsp; Grouping Disabled',
                `<div style="text-align: left; line-height: 1.5;">
                    <p>The grouping feature has been disabled.</p>
                    <p>Grouping elements currently conflicts with the <b>Undo</b> function, which can result in duplicated or oversized images appearing on the canvas.</p>
                    <hr style="border: 0; border-top: 1px solid #e1dfdd; margin: 15px 0;">
                    <p><b>Workaround:</b></p>
                    <p>You can still <b>move</b> and <b>rotate</b> multiple items at the same time. Just <b>click and drag a selection box</b> over the items you want (or hold <b>Ctrl / Command</b> while clicking them) to manipulate them together.</p>
                </div>`,
                null, 
                true // Setting isAlert = true hides the cancel button, just showing "OK"
            );
        } else {
            // Failsafe just in case the DialogSystem isn't loaded
            alert("Grouping is disabled due to an Undo bug. Use click-and-drag multi-select or Ctrl/Cmd + Click to move or rotate items together.");
        }
    }

    // 2. Intercept the core engine functions so they trigger the modal
    window.groupItems = showGroupingMaintenanceModal;
    
    if (typeof ContextRibbonActions !== 'undefined') {
        ContextRibbonActions.toggleGroup = showGroupingMaintenanceModal;
    }

    // 3. Ensure the Ribbon Button is safely hooked up
    setTimeout(() => {
        const picTab = document.getElementById('ribbon-picture');
        if (!picTab) return;
        
        let groupBtn = document.getElementById('op-global-group-tab-btn');
        
        if (!groupBtn) {
            const arrangeGroup = Array.from(picTab.querySelectorAll('.group')).find(g => g.innerHTML.includes('Arrange')) || picTab.querySelector('.group:last-child');
            if (!arrangeGroup) return;

            groupBtn = document.createElement('div');
            groupBtn.id = 'op-global-group-tab-btn';
            groupBtn.className = 'tool-btn'; 
            groupBtn.innerHTML = '<i class="fas fa-object-group"></i>Group';
            
            const label = arrangeGroup.querySelector('.group-label');
            if (label) arrangeGroup.insertBefore(groupBtn, label);
            else arrangeGroup.appendChild(groupBtn);
        }

        // Override the click event to strictly show the modal
        groupBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            showGroupingMaintenanceModal();
        };
    }, 1500);

})();
/* =========================================================================
   Print spooler fix (for text boxes)
   ========================================================================= */
(function fixPrintSpooler() {

    window.printFullDocument = function() {
        // 1. Force a save of the current page so any text you JUST typed is included
        if (typeof state !== 'undefined' && state.pages && state.pages.length > 0) {
            state.pages[state.currentPageIndex] = serializeCurrentPage();
        }

        // 2. Create or find our secret print container
        let printSpooler = document.getElementById('op-print-spooler');
        if (!printSpooler) {
            printSpooler = document.createElement('div');
            printSpooler.id = 'op-print-spooler';
            document.body.appendChild(printSpooler);
        }
        
        printSpooler.innerHTML = ''; // Clear old jobs
        
        // 3. Loop through every page saved in the state memory
        if (typeof state !== 'undefined' && state.pages) {
            state.pages.forEach((page) => {
                let pageWrapper = document.createElement('div');
                pageWrapper.className = 'op-print-page';
                pageWrapper.style.width = page.width;
                pageWrapper.style.height = page.height;
                pageWrapper.style.background = page.background || '#ffffff';
                pageWrapper.style.position = 'relative';
                
                // This overrides the font-size:0 and line-height:0 from the CSS
                // so standard textboxes actually render their text!
                pageWrapper.style.fontSize = '16px';
                pageWrapper.style.lineHeight = 'normal';

                page.elements.forEach(el => {
                    let elDiv = document.createElement('div');
                    elDiv.style.position = 'absolute';
                    elDiv.style.left = el.left;
                    elDiv.style.top = el.top;
                    elDiv.style.width = el.width;
                    elDiv.style.height = el.height;
                    elDiv.style.zIndex = el.zIndex;
                    elDiv.style.transform = el.transform || 'none';
                    
                    if (el.imgSrc) {
                        let img = document.createElement('img');
                        img.src = el.imgSrc;
                        if (el.imgStyle) Object.assign(img.style, el.imgStyle);
                        elDiv.appendChild(img);
                    } else {
                        // Restore the scaling wrapper so resized textboxes print correctly
                        const sX = el.scaleX || "1";
                        const sY = el.scaleY || "1";
                        let cleanHTML = el.innerHTML.replace(/contenteditable="true"/g, 'contenteditable="false"');
                        let css = el.contentCssText || `transform: scale(${sX}, ${sY}); width:100%; height:100%; transform-origin: top left; outline: none; border: none;`;
                        
                        // FIX: Extract perspective to parent to fix vanishing point shift in Chrome print rasterizer
                        let pVal = null;
                        css = css.replace(/perspective\s*\(\s*([^)]+)\s*\)/i, (match, p1) => {
                            pVal = p1;
                            return ''; 
                        });
                        if (pVal) {
                            elDiv.style.perspective = pVal;
                            elDiv.style.perspectiveOrigin = 'center';
                        }
                        
                        // FIX: Strip hardware compositor properties during print spooling
                        css = css.replace(/transform-style:\s*preserve-3d;?/gi, '');
                        css = css.replace(/backface-visibility:\s*hidden;?/gi, '');
                        if (!css.includes('width:')) css += '; width:100%; height:100%;';
                        
                        elDiv.innerHTML = `<div class="element-content" style="${css}">${cleanHTML}</div>`;
                    }
                    
                    pageWrapper.appendChild(elDiv);
                });
                
                printSpooler.appendChild(pageWrapper);
            });
        }

        // 4. Trigger the browser's native Print Dialog
        if (document.activeElement) document.activeElement.blur();
        if (window.getSelection) window.getSelection().removeAllRanges();
        
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                printSpooler.innerHTML = '';
            }, 1000);
        }, 150);
    };

})();
/* =========================================================================
   CLIPART LAZY-LOADER (Fixes the 5-Minute Chrome Lag & Console Spam)
   ========================================================================= */
(function fixClipartLag() {
    
    // Intercept the native Clipart button function
    if (typeof window.showClipartModal === 'function' && !window.showClipartModal.isLagFixed) {
        const originalShowClipart = window.showClipartModal;
        let isClipartLoaded = false;
        
        window.showClipartModal = function(...args) {
            
            // 1. If the clipart hasn't been generated yet, do it NOW
            if (!isClipartLoaded && typeof window.initClipart === 'function') {
                window.initClipart();
                isClipartLoaded = true; // Mark it as done so it doesn't rebuild every click
            }

            // 2. Open the modal normally
            originalShowClipart.apply(this, args);
        };
        window.showClipartModal.isLagFixed = true;
    }

})();
/* =========================================================================
   FEATURE: Enhanced Table Design & Layout Ribbons (v1.2 - Layout Refactor)
   ========================================================================= */
/* =========================================================================
   FEATURE: Smart Image Insertion & Paste (v2.0 - The Bulletproof Fix)
   ========================================================================= */
/* =========================================================================
   FEATURE: Proportional Resize (Hold Shift to maintain Aspect Ratio)
   ========================================================================= */

/* =========================================================================
   THE NATIVE APP BLUEPRINT BORDER (100-Style - Print Safe)
   ========================================================================= */
/* =========================================================================
   FEATURE: The Writer's Suite (Review Tools Addon) - THE ULTIMATE EXPANSION
   ========================================================================= */
/* =========================================================================
   Crop mode exit fix, Converts fixed pixels back to percentages upon exiting 
   thus, allowing the image to natively stretch when the wrapper is resized.
   ========================================================================= */
/* =========================================================================
   FEATURE: Infinite Panning Hand Tool (Middle-Click & Status Bar Toggle)
   ========================================================================= */
/* =========================================================================
   FEATURE: Table Templates (v3.6.5 - 100 Templates
   ========================================================================= */
/* =========================================================================
   ADD-ON: BACKGROUND DEFENDER MODULE
   Standalone script to protect background themes.
   - Re-applies CSS locks when .opub files are loaded.
   - Stealths the background during mouse drags to prevent Text Box ribbon.
   ========================================================================= */
;(function installBackgroundDefender() {
    console.log("🛡️ Background Defender Module initializing...");

    // 1. PASSIVE RE-LOCKER (Fixes .opub loading)
    setInterval(() => {
        document.querySelectorAll('.op-theme-container').forEach(container => {
            const wrapper = container.closest('.pub-element');
            if (wrapper) {
                if (wrapper.getAttribute('data-is-theme') !== 'true') {
                    wrapper.setAttribute('data-is-theme', 'true');
                }
                if (wrapper.style.zIndex !== '0') {
                    wrapper.style.zIndex = '0';
                }
                wrapper.classList.remove('selected', 'active-element');
            }
        });
    }, 250);

    // 2. DELAYED MOUSE STEALTH (Fixes Text Box Ribbon)
    let stealthTimer = null;
    
    const stealthBackgrounds = () => {
        clearTimeout(stealthTimer);
        document.querySelectorAll('[data-is-theme="true"]').forEach(el => {
            el.classList.remove('pub-element', 'selected', 'active-element');
        });
    };
    
    const unstealthBackgrounds = () => {
        document.querySelectorAll('[data-is-theme="true"]').forEach(el => {
            if (!el.classList.contains('pub-element')) {
                el.classList.add('pub-element');
            }
            el.classList.remove('selected', 'active-element');
        });
    };

    // Event Listeners for Stealth
    window.addEventListener('mousedown', stealthBackgrounds, true);
    window.addEventListener('mousemove', (e) => { 
        if (e.buttons > 0) stealthBackgrounds(); 
    }, true);
    
    window.addEventListener('mouseup', () => { 
        stealthTimer = setTimeout(unstealthBackgrounds, 150); 
    }, true);
    
    document.addEventListener('mouseleave', () => { 
        stealthTimer = setTimeout(unstealthBackgrounds, 150); 
    }, true);
    
    // Failsafes for saving and printing
    window.addEventListener('beforeprint', unstealthBackgrounds, true);
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'p')) {
            unstealthBackgrounds();
        }
    }, true);
})();
/* ========================================================================= 
   * Thumbnail Minimap Overlay, Bypasses native base64 rendering to 
   * eliminate CPU lag during element dragging, also utilizes a body-level 
   * "Glass Vault" to prevent framework reconciliation conflicts, 
   * and a strict click-tracker to preserve state across multiple pages. 
   ========================================================================= */ 
;(function installGlassVaultMinimap() { 
    console.log("⚡ Glass Vault Minimap initializing..."); 

    const style = document.createElement('style'); 
    // CSS extracted to style.css 
    document.head.appendChild(style); 

    // Quarantine Wrapper 
    let overlayWrapper = document.getElementById('ts-overlay-wrapper'); 
    if (overlayWrapper) overlayWrapper.remove(); 
    overlayWrapper = document.createElement('div'); 
    overlayWrapper.id = 'ts-overlay-wrapper'; 

    overlayWrapper.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 99; overflow: hidden;'; 
    overlayWrapper.setAttribute('data-html2canvas-ignore', 'true'); 
    document.body.appendChild(overlayWrapper); 

    let isDragging = false; 
    let isPrinting = false;  
    let rafId = null; 
    let activeElement = null; 
    let activeClone = null; 
    let nodeMap = new Map(); 

    // ✨ SIDEBAR CLIPPING OBSERVER ✨
    // Uses native browser engine to perfectly detect if the sidebar is collapsing and clipping the thumbs
    const clipObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If less than 40% of the thumbnail is visible, it means the sidebar collapsed over it.
            entry.target.dataset.glassVisible = (entry.intersectionRatio >= 0.4) ? 'true' : 'false';
        });
    }, {
        // Fire callbacks frequently during the slide animation for instant hiding
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0]
    });
     
    // ✨ PRINT HIBERNATION ✨ 
    const prepareForPrint = () => { 
        isPrinting = true; 
        document.querySelectorAll('.page-thumb').forEach(thumb => { 
            thumb.style.removeProperty('height');  
            thumb.style.removeProperty('width');  
        }); 
    }; 

    const restoreAfterPrint = () => { isPrinting = false; }; 

    window.addEventListener('beforeprint', prepareForPrint); 
    window.addEventListener('afterprint', restoreAfterPrint); 

    const printQuery = window.matchMedia('print'); 
    if (printQuery.addEventListener) { 
        printQuery.addEventListener('change', (e) => { 
            if (e.matches) prepareForPrint(); 
            else restoreAfterPrint(); 
        }); 
    } 

    let lockedIndex = 0; 
    let lastLockedIndex = -1;  

    document.addEventListener('mousedown', (e) => { 
        const thumb = e.target.closest('.page-thumb'); 
        if (thumb) { 
            const thumbs = Array.from(document.querySelectorAll('.page-thumb')); 
            lockedIndex = thumbs.indexOf(thumb); 
            return; 
        } 

        const btn = e.target.closest('div, button'); 
        if (btn && btn.textContent && btn.textContent.toLowerCase().includes('add page')) { 
            setTimeout(() => { 
                const thumbs = document.querySelectorAll('.page-thumb'); 
                lockedIndex = thumbs.length - 1; 
                buildMap(); 
            }, 300); 
        } 
    }, true); 

    // ========================================== 
    // 60FPS POSITION TRACKER 
    // ========================================== 
    const syncPositions = () => { 
        if (isPrinting) { 
            requestAnimationFrame(syncPositions); 
            return; 
        } 

        const thumbs = document.querySelectorAll('.page-thumb'); 
         
        thumbs.forEach((thumb, index) => { 
            // Hook new thumbs into the clipping observer
            if (!thumb.dataset.isObserved) {
                clipObserver.observe(thumb);
                thumb.dataset.isObserved = 'true';
            }

            let panel = document.getElementById('ts-glass-' + index); 
            if (!panel) { 
                panel = document.createElement('div'); 
                panel.id = 'ts-glass-' + index; 
                panel.className = 'ts-glass-panel'; 
                overlayWrapper.appendChild(panel); 
            } 

            const rect = thumb.getBoundingClientRect(); 
            
            // Check if the sidebar is collapsing over it
            const isVisible = thumb.dataset.glassVisible !== 'false';

            if (isVisible && rect.width > 0 && rect.height > 0 && 
                rect.top < window.innerHeight && rect.bottom > 0 &&
                rect.left < window.innerWidth && rect.right > 0) { 
                
                panel.style.display = 'block'; 
                
                if (panel.dataset.top !== rect.top + 'px' || 
                    panel.dataset.height !== rect.height + 'px' ||
                    panel.dataset.left !== rect.left + 'px' || 
                    panel.dataset.width !== rect.width + 'px') { 
                    
                    panel.style.left = rect.left + 'px'; 
                    panel.style.top = rect.top + 'px'; 
                    panel.style.width = rect.width + 'px'; 
                    panel.style.height = rect.height + 'px'; 
                    
                    panel.dataset.top = rect.top + 'px'; 
                    panel.dataset.height = rect.height + 'px'; 
                    panel.dataset.left = rect.left + 'px'; 
                    panel.dataset.width = rect.width + 'px'; 
                } 
            } else { 
                panel.style.display = 'none'; 
            } 
        }); 

        for (let i = thumbs.length; i < overlayWrapper.children.length; i++) { 
            const excess = document.getElementById('ts-glass-' + i); 
            if (excess) excess.style.display = 'none'; 
        } 

        requestAnimationFrame(syncPositions); 
    }; 
    requestAnimationFrame(syncPositions); 

    // ========================================== 
    // THE VISUAL BUILDER 
    // ========================================== 
    const buildMap = () => { 
        if (isDragging || isPrinting) return; 

        const paper = document.getElementById('paper'); 
        const thumbs = document.querySelectorAll('.page-thumb'); 
         
        if (!paper || thumbs.length === 0 || lockedIndex < 0 || lockedIndex >= thumbs.length) return; 

        const activePanel = document.getElementById('ts-glass-' + lockedIndex); 
        const activeThumb = thumbs[lockedIndex]; 
        if (!activePanel || !activeThumb) return; 

        let inner = activePanel.querySelector('.ts-mirror-inner'); 
        if (!inner) { 
            inner = document.createElement('div'); 
            inner.className = 'ts-mirror-inner'; 
            activePanel.appendChild(inner); 
        } 

        if (lockedIndex !== lastLockedIndex) { 
            nodeMap.clear(); 
            document.querySelectorAll('.ts-glass-panel').forEach(panel => {
                panel.style.backgroundColor = 'transparent';
                const inner = panel.querySelector('.ts-mirror-inner');
                if (inner) inner.innerHTML = '';
            });
            lastLockedIndex = lockedIndex; 
        } 

        const paperAspect = paper.offsetHeight / paper.offsetWidth; 
        if (paperAspect > 0) { 
            activeThumb.style.height = `${activeThumb.offsetWidth * paperAspect}px`; 
        } 

        inner.style.width = paper.offsetWidth + 'px'; 
        inner.style.height = paper.offsetHeight + 'px'; 
         
        const thumbRect = activeThumb.getBoundingClientRect(); 
         
        let scaleFactor = 0.15; 
        let translateX = 0; 
        let translateY = 0; 

        if (thumbRect.width > 0 && thumbRect.height > 0 && paper.offsetWidth > 0 && paper.offsetHeight > 0) { 
            const scaleX = thumbRect.width / paper.offsetWidth; 
            const scaleY = thumbRect.height / paper.offsetHeight; 
             
            scaleFactor = Math.min(scaleX, scaleY); 
            translateX = (thumbRect.width - (paper.offsetWidth * scaleFactor)) / 2; 
            translateY = (thumbRect.height - (paper.offsetHeight * scaleFactor)) / 2; 
        } 

        inner.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleFactor})`; 

// ✨ THE BULLETPROOF CLOAKING FIX
        const sanitizeClone = (node) => { 
            const stripFrameworkHooks = (n) => {
                if (n.removeAttribute) {
                    n.removeAttribute('id'); 
                    n.removeAttribute('data-is-border'); // This was the missing link causing the crash!
                }
                if (n.classList) {
                    n.classList.remove('page-border-wrapper', 'page-border', 'native-blueprint-border');
                }
            };
            stripFrameworkHooks(node);
            node.querySelectorAll('*').forEach(stripFrameworkHooks);
        }; 

        const themeLayer = paper.querySelector('.op-theme-container') || paper.querySelector('[data-is-theme="true"]'); 
        let cloneTheme = inner.querySelector('.ts-theme-clone'); 
         
        if (themeLayer) { 
            if (!cloneTheme) { 
                cloneTheme = themeLayer.cloneNode(true); 
                sanitizeClone(cloneTheme); 
                cloneTheme.classList.add('ts-theme-clone'); 
                cloneTheme.style.opacity = '1'; 
                inner.prepend(cloneTheme);  
            } else { 
                cloneTheme.style.cssText = themeLayer.style.cssText; 
                cloneTheme.style.opacity = '1'; 
                 
                const tempTheme = themeLayer.cloneNode(true); 
                sanitizeClone(tempTheme); 
                if (cloneTheme.innerHTML !== tempTheme.innerHTML) { 
                    cloneTheme.innerHTML = tempTheme.innerHTML; 
                } 
            } 
        } else { 
            if (cloneTheme) cloneTheme.remove(); 
            const paperBg = window.getComputedStyle(paper).backgroundColor; 
            if (paperBg && paperBg !== 'rgba(0, 0, 0, 0)') activePanel.style.backgroundColor = paperBg; 
        } 

        const elements = Array.from(paper.querySelectorAll('.pub-element')); 
        const currentSet = new Set(elements); 

        for (let [el, clone] of nodeMap.entries()) { 
            if (!currentSet.has(el)) { 
                clone.remove(); 
                nodeMap.delete(el); 
            } 
        } 

        elements.forEach(el => { 
            // ⚠️ CRITICAL ROLLBACK: Do NOT skip the border container here or the preview breaks!
            // Only skip the theme layer.
            if (el.getAttribute('data-is-theme') === 'true' || el.querySelector('.op-theme-container')) return; 

            let clone = nodeMap.get(el);

            if (!clone) { 
                clone = el.cloneNode(true); 
                sanitizeClone(clone); 
                clone.classList.remove('selected', 'active-element', 'hovered'); 
                clone.querySelectorAll('.resize-handle, .rotate-stick, .rotate-handle').forEach(ui => ui.remove()); 
                clone.style.opacity = '1'; 
                inner.appendChild(clone); 
                nodeMap.set(el, clone); 
            } else { 
                clone.style.cssText = el.style.cssText; 
                clone.style.opacity = '1'; 
                clone.classList.remove('selected', 'active-element', 'hovered'); 

                const tempNode = el.cloneNode(true); 
                sanitizeClone(tempNode); 
                tempNode.querySelectorAll('.resize-handle, .rotate-stick, .rotate-handle').forEach(ui => ui.remove()); 
                 
                if (clone.innerHTML !== tempNode.innerHTML) { 
                    clone.innerHTML = tempNode.innerHTML; 
                } 
            } 
        }); 
    }; 

    // ========================================== 
    // HARDWARE ACCELERATED DRAG LOOP 
    // ========================================== 
    const updateActiveClone = () => { 
        if (!activeElement || !activeClone) return; 
         
        activeClone.style.left = activeElement.style.left; 
        activeClone.style.top = activeElement.style.top; 
        activeClone.style.width = activeElement.style.width; 
        activeClone.style.height = activeElement.style.height; 
        activeClone.style.transform = activeElement.style.transform; 

        if (isDragging) rafId = requestAnimationFrame(updateActiveClone); 
    }; 

    window.addEventListener('mousedown', (e) => { 
        const el = e.target.closest('.pub-element'); 
        if (el) { 
            isDragging = true; 
            activeElement = el; 
            activeClone = nodeMap.get(el); 
            if (activeClone) activeClone.style.zIndex = '9999'; 
            if (rafId) cancelAnimationFrame(rafId); 
            updateActiveClone(); 
        } 
    }, true); 

    const endInteraction = () => { 
        if (isDragging) { 
            isDragging = false; 
            activeElement = null; 
            activeClone = null; 
            if (rafId) cancelAnimationFrame(rafId); 
            buildMap();  
        } 
    }; 

    window.addEventListener('mouseup', endInteraction, true); 
     
    setInterval(() => { if (!isDragging && !isPrinting) buildMap(); }, 800); 
    setTimeout(buildMap, 500); 

})();
/* =========================================================================
   Border Defender Module (+ Anti-Fade Patch)
   - Safely ignores imported .doc/.pub files because they are <img> based.
   ========================================================================= */
;(function installBorderDefenderV5() {
    console.log("🛡️ Border Defender V5 (Shape DNA) initializing...");

    // 1. ABSOLUTE CSS LOCKS & ANTI-FADE
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // 2. THE SHAPE DNA FINDER
    const processBorders = () => {
        const paper = document.getElementById('paper');
        if (!paper) return;
        const paperRect = paper.getBoundingClientRect();

        document.querySelectorAll('.pub-element').forEach(el => {
            // Ignore Background Themes
            if (el.getAttribute('data-is-theme') === 'true' || el.querySelector('.op-theme-container')) return;

            // Check if it's a freshly clicked native border
            if (el.id === 'native-blueprint-border' || el.querySelector('#native-blueprint-border') || el.querySelector('.page-border-wrapper')) {
                el.setAttribute('data-is-border', 'true');
                return;
            }

            // Check if it is a loaded border from an .opub save file
            if (el.getAttribute('data-is-border') !== 'true') {
                const rect = el.getBoundingClientRect();
                
                const isFullWidth = rect.width >= (paperRect.width * 0.95);
                const isFullHeight = rect.height >= (paperRect.height * 0.95);
                
                if (isFullWidth && isFullHeight) {
                    // ✨ THE SHAPE DNA FILTER ✨
                    // Based on the native HTML, borders are SVG shapes. Imported documents are not.
                    const isShapeType = el.getAttribute('data-type') === 'shape';
                    const hasSVG = el.querySelector('svg') !== null;
                    const hasNoImages = el.querySelector('img') === null; // Exclude imported docs
                    
                    const isBackZ = el.style.zIndex === '2' || el.style.zIndex === '1' || el.style.zIndex === '0' || !el.style.zIndex;

                    if ((isShapeType || hasSVG) && hasNoImages && isBackZ) {
                        el.setAttribute('data-is-border', 'true');
                    }
                }
            }
        });
    };

    // 3. THE GHOST & ANTI-FADE LOOP
    setInterval(() => {
        processBorders();

        document.querySelectorAll('[data-is-border="true"]').forEach(wrapper => {
            // Strip selection highlights
            wrapper.classList.remove('selected', 'active-element', 'hovered');
            
            // Apply inline CSS locks
            wrapper.style.setProperty('pointer-events', 'none', 'important');
            wrapper.style.setProperty('user-select', 'none', 'important');
            wrapper.style.setProperty('opacity', '1', 'important');
            wrapper.setAttribute('draggable', 'false');
            
            // Lock internal container (from user's HTML snippet)
            const content = wrapper.querySelector('.element-content');
            if (content) content.style.setProperty('pointer-events', 'none', 'important');

            if (wrapper.style.zIndex !== '2') wrapper.style.zIndex = '2';

            // Recursively lock children
            Array.from(wrapper.querySelectorAll('*')).forEach(child => {
                child.setAttribute('draggable', 'false');
                child.style.setProperty('pointer-events', 'none', 'important');
            });

            // Math Spoofer (Ghost Protocol)
            if (!wrapper._ghosted) {
                wrapper._originalGetBoundingClientRect = wrapper.getBoundingClientRect;
                wrapper.getBoundingClientRect = function() {
                    if (document.body.getAttribute('data-stealth-active') === 'true') {
                        return { top: -9999, left: -9999, right: -9999, bottom: -9999, width: 0, height: 0, x: -9999, y: -9999 };
                    }
                    return wrapper._originalGetBoundingClientRect.apply(this, arguments);
                };
                wrapper._ghosted = true;
            }
        });
    }, 200);

    // 4. STEALTH FLAG TOGGLE
    let stealthTimer = null;
    const startStealth = () => { 
        clearTimeout(stealthTimer); 
        document.body.setAttribute('data-stealth-active', 'true'); 
    };
    const stopStealth = () => { 
        document.body.removeAttribute('data-stealth-active'); 
    };

    window.addEventListener('mousedown', startStealth, true);
    window.addEventListener('mousemove', (e) => { if (e.buttons > 0) startStealth(); }, true);
    window.addEventListener('mouseup', () => { stealthTimer = setTimeout(stopStealth, 150); }, true);
    document.addEventListener('mouseleave', () => { stealthTimer = setTimeout(stopStealth, 150); }, true);
    window.addEventListener('beforeprint', stopStealth, true);
    
})();
/* =========================================================================
   ADD-ON PATCH: THE GEOMETRY FIX
   - Abandons hacky z-index rules and hole-punches.
   - Uses CSS polygon geometry to physically shape the glass panel.
   - Shaves a 4px margin to reveal the native green borders underneath.
   - Slices a diagonal chamfer in the top-right to reveal the native Red X.
   ========================================================================= */
;(function applyConcaveCradle() { 
    const style = document.createElement('style'); 
    // CSS extracted to style.css 
    document.head.appendChild(style); 
})();
/* =========================================================================
    The Theme Studio to replace the old themes on the page design tab.
    Clean, formatted, and documented for production use.
   ========================================================================= */
;(function installPerfectedThemeStudio() {
    console.log("🛠️ Theme Studio initializing...");

    // ==========================================
    // 1. CLEANUP & PREPARATION
    // ==========================================
    const oldThemeGroup = document.getElementById('theme-group');
    if (oldThemeGroup) oldThemeGroup.style.display = 'none';
    
    const oldModernGroup = document.getElementById('modern-theme-group');
    if (oldModernGroup) oldModernGroup.style.display = 'none';
    
    const rogueStudio = document.getElementById('advanced-theme-studio');
    if (rogueStudio) rogueStudio.remove();

    // ==========================================
    // 2. INJECT CSS
    // ==========================================
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // ==========================================
    // 3. THEME DEFINITIONS
    // ==========================================
    const gradients = [
        { c1: '#4facfe', c2: '#00f2fe', icon: 'fa-sun' },
        { c1: '#667eea', c2: '#764ba2', icon: 'fa-moon' },
        { c1: '#ff0844', c2: '#ffb199', icon: 'fa-fire' },
        { c1: '#f83600', c2: '#f9d423', icon: 'fa-bolt' },
        { c1: '#b224ef', c2: '#7579ff', icon: 'fa-star' },
        { c1: '#fa709a', c2: '#fee140', icon: 'fa-heart' },
        { c1: '#89f7fe', c2: '#66a6ff', icon: 'fa-water' },
        { c1: '#0ba360', c2: '#3cba92', icon: 'fa-leaf' },
        { c1: '#232526', c2: '#414345', icon: 'fa-city' },
        { c1: '#ff7e5f', c2: '#feb47b', icon: 'fa-sunset' },
        { c1: '#a18cd1', c2: '#fbc2eb', icon: 'fa-magic' },
        { c1: '#2b5876', c2: '#4e4376', icon: 'fa-meteor' }
    ];

    const textures = [
        { c1: '#f1f5f9', url: 'https://www.transparenttextures.com/patterns/white-wall.png', icon: 'fa-border-all' },
        { c1: '#cbd5e1', url: 'https://www.transparenttextures.com/patterns/brushed-alum.png', icon: 'fa-align-justify' },
        { c1: '#94a3b8', url: 'https://www.transparenttextures.com/patterns/concrete-wall.png', icon: 'fa-circle-half-stroke' },
        { c1: '#fde047', url: 'https://www.transparenttextures.com/patterns/cream-paper.png', icon: 'fa-scroll' },
        { c1: '#3b82f6', url: 'https://www.transparenttextures.com/patterns/denim.png', icon: 'fa-layer-group' },
        { c1: '#1e293b', url: 'https://www.transparenttextures.com/patterns/leather.png', icon: 'fa-grip' },
        { c1: '#8b5cf6', url: 'https://www.transparenttextures.com/patterns/wood-pattern.png', icon: 'fa-tree' },
        { c1: '#10b981', url: 'https://www.transparenttextures.com/patterns/cubes.png', icon: 'fa-cubes' },
        { c1: '#64748b', url: 'https://www.transparenttextures.com/patterns/asphalt-pattern.png', icon: 'fa-road' },
        { c1: '#334155', url: 'https://www.transparenttextures.com/patterns/carbon-fibre.png', icon: 'fa-chess-board' },
        { c1: '#fef08a', url: 'https://www.transparenttextures.com/patterns/notebook.png', icon: 'fa-book' },
        { c1: '#ef4444', url: 'https://www.transparenttextures.com/patterns/brick-wall.png', icon: 'fa-th-large' }
    ];

// ==========================================
    // 4. BUILD THE UI DOM
    // ==========================================
    const studioContainer = document.createElement('div');
    studioContainer.id = 'advanced-theme-studio';
    studioContainer.className = 'group'; 

    let swatchesHTML = `<div class="ts-swatch-grid">`;
    gradients.forEach((g) => {
        swatchesHTML += `<div class="ts-swatch" data-type="gradient" data-c1="${g.c1}" data-c2="${g.c2}" style="background: linear-gradient(135deg, ${g.c1}, ${g.c2});"><i class="fas ${g.icon}"></i></div>`;
    });
    textures.forEach((t) => {
        swatchesHTML += `<div class="ts-swatch" data-type="texture" data-c1="${t.c1}" data-url="${t.url}" style="background: ${t.c1} url('${t.url}');"><i class="fas ${t.icon}"></i></div>`;
    });
    swatchesHTML += `</div>`;

    studioContainer.innerHTML = `<div class="ts-ribbon-container">
            <div id="ts-clear-theme-btn" title="Remove Theme">
                <i class="fas fa-eraser"></i>
                <span style="line-height: 1.2;">Remove<br>Theme</span>
            </div>
            
            <div id="no-bg-btn" onclick="clearPageBackground()" title="Override Master Theme (Blank Page)">
                <i class="fas fa-ban"></i>
                <span style="line-height: 1.2;">Ignore<br>Theme</span>
            </div>
            
            <div class="ts-divider"></div>
            ${swatchesHTML}
            <div class="ts-divider"></div>
            
            <div class="ts-sliders">
                <div class="ts-slider-group">
                    <label style="white-space: nowrap; padding-right: 10px;">Saturation <span style="font-size: 11px; color: #888; margin-left: 2px;">N/A</span></label>
                    <input type="range" id="ts-sat-slider" class="ts-slider" min="0" max="200" value="100" disabled style="filter: grayscale(100%); opacity: 0.5; cursor: not-allowed;">
                </div>
                <div class="ts-slider-group">
                    <label style="white-space: nowrap; padding-right: 10px;">Brightness <span style="font-size: 11px; color: #888; margin-left: 2px;">N/A</span></label>
                    <input type="range" id="ts-bri-slider" class="ts-slider" min="50" max="150" value="100" disabled style="filter: grayscale(100%); opacity: 0.5; cursor: not-allowed;">
                </div>
                <div class="ts-slider-group">
                    <label style="white-space: nowrap; padding-right: 10px;">Texture <span style="font-size: 11px; color: #888; margin-left: 2px;">N/A</span></label>
                    <input type="range" id="ts-tex-slider" class="ts-slider" min="0" max="100" value="100" disabled style="filter: grayscale(100%); opacity: 0.5; cursor: not-allowed;">
                </div>
            </div>
        </div>
        <div class="group-label">Theme Studio</div>`;

    // Inject into the ribbon
    if (oldThemeGroup && oldThemeGroup.parentNode) {
        oldThemeGroup.parentNode.insertBefore(studioContainer, oldThemeGroup.nextSibling);
    } else {
        document.body.appendChild(studioContainer);
    }

    // ==========================================
    // 5. THEME INJECTION & SAVE BACKUP
    // ==========================================
    const applyThemeToCanvas = (swatch) => {
        const paper = document.getElementById('paper');
        if (!paper) return;

        // Save active tab to prevent jump
        const activeTabEl = document.querySelector('.tab.active');
        const activeTabId = activeTabEl ? activeTabEl.id.replace('tab-', '') : null;

        // Clear existing
        const existingTheme = paper.querySelector('[data-is-theme="true"]');
        if (existingTheme) existingTheme.remove();

        const type = swatch.getAttribute('data-type');
        const c1 = swatch.getAttribute('data-c1');
        const c2 = swatch.getAttribute('data-c2') || '';
        const url = swatch.getAttribute('data-url') || '';

        // ✨ THE SAVE BACKUP: Anchor the configuration to the root document.
        // The app's serializer will natively save these attributes into the .opub file.
        paper.setAttribute('data-theme-saved', 'true');
        paper.setAttribute('data-theme-type', type);
        paper.setAttribute('data-theme-c1', c1);
        paper.setAttribute('data-theme-c2', c2);
        paper.setAttribute('data-theme-url', url);

        // Mute app's tab switching temporarily
        const originalSwitchTab = window.switchTab;
        window.switchTab = function() {}; 

        if (typeof createWrapper === 'function') {
            const wrapper = createWrapper(`<div class="op-theme-container" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;"></div>`);
            
            wrapper.setAttribute('data-is-theme', 'true');
            wrapper.setAttribute('data-type', 'box');
            wrapper.style.cssText += 'left: 0px !important; top: 0px !important; width: 100% !important; height: 100% !important; z-index: 0 !important;';

            const container = wrapper.querySelector('.op-theme-container');
            
            // Build visual layers
            const bgDiv = document.createElement('div');
            bgDiv.className = 'op-theme-bg';
            bgDiv.style.cssText = 'position:absolute; inset:0; width:100%; height:100%;';
            
            if (type === 'gradient') {
                bgDiv.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
            } else {
                bgDiv.style.backgroundColor = c1;
            }
            container.appendChild(bgDiv);

            if (type === 'texture') {
                const texDiv = document.createElement('div');
                texDiv.className = 'op-theme-tex';
                texDiv.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; background-repeat:repeat; opacity:1;';
                texDiv.style.backgroundImage = `url('${url}')`;
                container.appendChild(texDiv);
            }
            
            if (typeof deselect === 'function') deselect();
        }

        // Restore tab behavior
        window.switchTab = originalSwitchTab;
        if (activeTabId && typeof window.switchTab === 'function') {
            window.switchTab(activeTabId);
        }

        updateLiveFilters();
        if (typeof pushHistory === 'function') pushHistory();
    };

    const updateLiveFilters = () => {
        const paper = document.getElementById('paper');
        if (!paper) return;

        const themeLayer = paper.querySelector('[data-is-theme="true"]');
        if (!themeLayer) return;

        const sat = document.getElementById('ts-sat-slider').value;
        const bri = document.getElementById('ts-bri-slider').value;
        const texVal = document.getElementById('ts-tex-slider').value;
        const texStr = texVal / 100;

        // Backup slider states for saving
        paper.setAttribute('data-theme-sat', sat);
        paper.setAttribute('data-theme-bri', bri);
        paper.setAttribute('data-theme-tex', texVal);

        const container = themeLayer.querySelector('.op-theme-container');
        if (container) container.style.filter = `saturate(${sat}%) brightness(${bri}%)`;

        const texLayer = themeLayer.querySelector('.op-theme-tex');
        if (texLayer) texLayer.style.opacity = texStr;
    };

    // ==========================================
    // 6. CLEAR THEME LOGIC
    // ==========================================
    document.getElementById('ts-clear-theme-btn').addEventListener('click', () => {
        const paper = document.getElementById('paper');
        if (paper) {
            const existingTheme = paper.querySelector('[data-is-theme="true"]');
            if (existingTheme) existingTheme.remove();
            paper.style.background = '#ffffff';
            
            // Wipe save backup
            paper.removeAttribute('data-theme-saved');
            ['type', 'c1', 'c2', 'url', 'sat', 'bri', 'tex'].forEach(attr => {
                paper.removeAttribute(`data-theme-${attr}`);
            });
        }
        
        swatches.forEach(s => s.classList.remove('active'));
        document.getElementById('ts-sat-slider').value = 100;
        document.getElementById('ts-bri-slider').value = 100;
        document.getElementById('ts-tex-slider').value = 100;

        if (typeof pushHistory === 'function') pushHistory();
    });

    // ==========================================
    // 7. PRINT RESCUE HOOK
    // ==========================================
    window.addEventListener('beforeprint', () => {
        setTimeout(() => {
            const spooler = document.getElementById('op-print-spooler');
            if (!spooler) return;
            
            const scalers = spooler.querySelectorAll('.op-print-scaler');
            scalers.forEach(scaler => {
                const children = Array.from(scaler.children);
                children.forEach(child => {
                    if (child.innerHTML.includes('op-theme-container')) {
                        const pageWrapper = scaler.parentElement;
                        pageWrapper.insertBefore(child, scaler);
                        child.style.left = '0px';
                        child.style.top = '0px';
                        child.style.width = '100%';
                        child.style.height = '100%';
                        child.style.transform = 'none';
                        const content = child.querySelector('.element-content');
                        if (content) content.style.transform = 'none';
                    }
                });
            });
        }, 5);
    });

    // ==========================================
    // 8. THE SELF-HEALING ENGINE & Z-INDEX
    // ==========================================
    setInterval(() => {
        const paper = document.getElementById('paper');
        if (!paper) return;

        let theme = document.querySelector('[data-is-theme="true"]');

        // ✨ FEATURE: Ignore Background Override
        if (state.pages[state.currentPageIndex] && state.pages[state.currentPageIndex].ignoreBackground) {
            if (theme) theme.remove();
            return;
        }

        // ✨ HEAL SCENARIO 1: Document loaded, theme was enabled, but wrapper was wiped out.
        if (!theme && paper.getAttribute('data-theme-saved') === 'true') {
            console.log("🛠️ Theme Studio: Reconstructing deleted theme wrapper from save file...");
            if (typeof createWrapper === 'function') {
                theme = createWrapper(`<div class="op-theme-container"></div>`); // temporary shell
                theme.setAttribute('data-is-theme', 'true');
                theme.setAttribute('data-type', 'box');
                theme.style.cssText += 'left: 0px !important; top: 0px !important; width: 100% !important; height: 100% !important; z-index: 0 !important;';
                if (typeof deselect === 'function') deselect();
            }
        }

        // ✨ HEAL SCENARIO 2: Wrapper exists, but the inner SVG visuals were stripped during Save/Load.
        if (theme && !theme.querySelector('.op-theme-bg') && paper.getAttribute('data-theme-saved') === 'true') {
            console.log("🛠️ Theme Studio: Restoring background visuals from save state...");
            
            const type = paper.getAttribute('data-theme-type');
            const c1 = paper.getAttribute('data-theme-c1');
            const c2 = paper.getAttribute('data-theme-c2');
            const url = paper.getAttribute('data-theme-url');

            if (type && c1) {
                theme.innerHTML = ''; // Clear junk HTML from the save serializer
                
                const container = document.createElement('div');
                container.className = 'op-theme-container';
                container.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; pointer-events:none; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;';
                
                const bgDiv = document.createElement('div');
                bgDiv.className = 'op-theme-bg';
                bgDiv.style.cssText = 'position:absolute; inset:0; width:100%; height:100%;';
                if (type === 'gradient') {
                    bgDiv.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
                } else {
                    bgDiv.style.backgroundColor = c1;
                }
                container.appendChild(bgDiv);

                if (type === 'texture') {
                    const texDiv = document.createElement('div');
                    texDiv.className = 'op-theme-tex';
                    texDiv.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; background-repeat:repeat; opacity:1;';
                    texDiv.style.backgroundImage = `url('${url}')`;
                    container.appendChild(texDiv);
                }
                theme.appendChild(container);

                // Restore UI Sliders
                const sat = paper.getAttribute('data-theme-sat');
                const bri = paper.getAttribute('data-theme-bri');
                const tex = paper.getAttribute('data-theme-tex');
                
                if (sat) document.getElementById('ts-sat-slider').value = sat;
                if (bri) document.getElementById('ts-bri-slider').value = bri;
                if (tex) document.getElementById('ts-tex-slider').value = tex;

                // Restore UI Swatch highlight
                const swatches = document.querySelectorAll('.ts-swatch');
                swatches.forEach(s => s.classList.remove('active'));
                const activeSwatch = Array.from(swatches).find(s => s.getAttribute('data-c1') === c1);
                if (activeSwatch) activeSwatch.classList.add('active');

                // Apply restored filter values directly to the new container
                updateLiveFilters();
            }
        }

        // Maintain Stacking Order
        if (theme && theme.style.zIndex !== '0') {
            theme.style.zIndex = '0';
        }
        const border = document.getElementById('native-blueprint-border');
        if (border && border.style.zIndex !== '2') {
            border.style.zIndex = '2';
        }
    }, 500);

    // ==========================================
    // 9. THE DELAYED MOUSE-STEALTH DEFENSE
    // ==========================================
    let stealthTimer = null;
    
    const stealthTheme = () => {
        clearTimeout(stealthTimer);
        const theme = document.querySelector('[data-is-theme="true"]');
        if (theme) {
            theme.classList.remove('pub-element', 'selected', 'active-element');
        }
    };
    
    const unstealthTheme = () => {
        const theme = document.querySelector('[data-is-theme="true"]');
        if (theme) {
            if (!theme.classList.contains('pub-element')) {
                theme.classList.add('pub-element');
            }
            theme.classList.remove('selected', 'active-element');
        }
    };

    window.addEventListener('mousedown', stealthTheme, true);
    
    window.addEventListener('mousemove', (e) => {
        if (e.buttons > 0) stealthTheme();
    }, true);

    window.addEventListener('mouseup', () => {
        stealthTimer = setTimeout(unstealthTheme, 150);
    }, true);

    document.addEventListener('mouseleave', () => {
        stealthTimer = setTimeout(unstealthTheme, 150);
    }, true);

    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'a') {
            stealthTheme();
            stealthTimer = setTimeout(unstealthTheme, 150); 
        }
    }, true);

    window.addEventListener('beforeprint', unstealthTheme, true);

    // ==========================================
    // 10. BIND EVENT LISTENERS
    // ==========================================
    const swatches = studioContainer.querySelectorAll('.ts-swatch');
    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            swatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            applyThemeToCanvas(swatch);
        });
    });

    const sliders = studioContainer.querySelectorAll('.ts-slider');
    sliders.forEach(slider => {
        slider.addEventListener('input', updateLiveFilters);
        slider.addEventListener('change', () => {
            if (typeof pushHistory === 'function') pushHistory();
        });
    });

})();
/* =========================================================================
   V99.0 - UNCLIPPED JUMBO CROP HANDLES (20px)
   (REPLACEMENT FOR V98.0) Bumps handle size to 20px for better ergonomics.
   ========================================================================= */
;(function upgradeCropHandleSize() {
    console.log("🛠️ V99.0 Unclipped Jumbo Crop Handles (20px) initializing...");
    
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);
})();
/* =========================================================================
   Border Eraser Module (UI Spacing Fix)
   ========================================================================= */
;(function installBorderEraserV2_3() {
    console.log("🧹 Border Eraser V2.3 initializing...");

    const injectInterval = setInterval(() => {
        const removeThemeBtn = document.getElementById('ts-clear-theme-btn');
        if (!removeThemeBtn) return; // Wait until the tab renders

        // Prevent duplicates
        if (document.getElementById('ts-clear-border-btn')) {
            clearInterval(injectInterval);
            return;
        }

        // 1. Build the Button Container (Tightened Margins)
        const eraserBtn = document.createElement('div');
        eraserBtn.id = 'ts-clear-border-btn';
        eraserBtn.title = "Remove existing page borders";
        
        eraserBtn.style.cssText = `
            display: inline-flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            height: 73px !important;
            min-width: 50px !important;
            padding: 0 4px !important; /* Reduced padding */
            margin-left: 0px !important; /* Snug up to the left button */
            margin-right: 8px !important; /* Small gap before swatches */
            background: transparent;
            border: 1px solid transparent;
            border-radius: 4px;
            cursor: pointer;
            box-sizing: border-box;
            vertical-align: top;
        `;

        // 2. Build internal elements
        eraserBtn.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 32px; width: 32px; margin-bottom: 2px;">
                <i class="fas fa-border-none" style="font-size: 22px !important; display: block !important;"></i>
            </div>
            <span style="font-size: 11px !important; font-family: 'Segoe UI', sans-serif !important; text-align: center !important; line-height: 1.2 !important; display: block !important; white-space: nowrap;">Remove<br>Border</span>
        `;

        // 3. Re-bind native hover states
        eraserBtn.addEventListener('mouseenter', () => eraserBtn.style.background = 'rgba(0, 0, 0, 0.05)');
        eraserBtn.addEventListener('mouseleave', () => eraserBtn.style.background = 'transparent');
        eraserBtn.addEventListener('mousedown', () => eraserBtn.style.background = 'rgba(0, 0, 0, 0.1)');
        eraserBtn.addEventListener('mouseup', () => eraserBtn.style.background = 'rgba(0, 0, 0, 0.05)');

        // 4. The Purge Logic
        eraserBtn.addEventListener('click', () => {
            console.log("🧹 Executing Border Purge...");
            let purged = false;
            const borders = document.querySelectorAll('#native-blueprint-border, [data-is-border="true"], .page-border-wrapper');
            
            borders.forEach(border => {
                let wrapper = border;
                while (wrapper.parentElement && wrapper.parentElement.id !== 'paper') wrapper = wrapper.parentElement;
                if (wrapper) { wrapper.remove(); purged = true; }
            });

            if (purged && typeof pushHistory === 'function') pushHistory();
        });

        // 5. Anchor it right next to the original button
        removeThemeBtn.parentElement.insertBefore(eraserBtn, removeThemeBtn.nextSibling);
        clearInterval(injectInterval);
    }, 500);

})();
/* =========================================================================
   Text Print Rescue Module
   Solves the "invisible default text" bug during printing.
   ========================================================================= */
;(function installTextPrintRescue() {
    console.log("🖨️ Text Print Rescue Module initializing...");

    const forceInlineTextStyles = () => {
        // Find every element inside an interactive container
        const allElements = document.querySelectorAll('.pub-element *');

        allElements.forEach(el => {
            // Filter down to elements that actually contain readable text
            // (Ignoring empty wrappers, SVG paths, or image containers)
            if (el.innerText && el.innerText.trim() !== '' && el.children.length === 0) {
                
                // Ask the browser what the text currently looks like on the screen
                const computed = window.getComputedStyle(el);

                // If the element doesn't have an explicit inline style, forcefully apply the computed one
                if (!el.style.fontFamily || el.style.fontFamily === '') {
                    el.style.setProperty('font-family', computed.fontFamily, 'important');
                }
                
                if (!el.style.fontSize || el.style.fontSize === '') {
                    el.style.setProperty('font-size', computed.fontSize, 'important');
                }
                
                if (!el.style.color || el.style.color === '') {
                    el.style.setProperty('color', computed.color, 'important');
                }
            }
        });
        console.log("🖨️ Text styles hardcoded for print spooler.");
    };

    // Intercept the browser's print command BEFORE the spooler takes its snapshot
    window.addEventListener('beforeprint', forceInlineTextStyles, true);
    
    // Fallback: If the app uses a custom print button instead of the browser native Ctrl+P
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'p') {
            forceInlineTextStyles();
        }
    }, true);

})();
/* =========================================================================
   MODERN SAVE SYSTEM (File System Access API + Title Sync)
   Upgrades the save dialog to allow syncing the chosen filename to the UI.
   ========================================================================= */
/* =========================================================================
   KEYBOARD SHORTCUT OVERRIDES (Ctrl+S, Ctrl+O)
   Prevents the browser defaults and routes to app functions.
   ========================================================================= */
/* =========================================================================
   Printer Router and page - print sizer
   - Chrome Portrait: UNTOUCHED (-8px).
   - All Landscape: UNTOUCHED (0px).
   - Firefox Portrait: Shifted 'top' to 15px to force a hard drop.
   ========================================================================= */
/* =========================================================================
   apply crop to images on print
   ========================================================================= */
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
/* =========================================================================
   WORDART FILTER ADD-ON
   The following wordarts are not compatable with the new Print engine
   this Safely purges broken or unwanted WordArt styles from the UI gallery.
   ========================================================================= */
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
/* =========================================================================
   INP FIX (Overrides for heavy functions)
   ========================================================================= */

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
window.showWebClipartModal = function() {
    if (typeof webClipartLibrary === 'undefined' || typeof webClipartBaseUrl === 'undefined') {
        DialogSystem.show('Error', '<p>Clipart library not loaded.</p>', null, true);
        return;
    }
    
    const uiHTML = `
        <style>
            #custom-dialog-header { display: none !important; }
            .custom-dialog-footer { display: none !important; }
            .custom-dialog-body { padding: 0 !important; background: #f3f4f6 !important; border-radius: 8px; overflow: hidden; }
            
            .wa-modal-header {
                background: var(--ui-theme-dark);
                padding: 16px 25px;
                display: flex;
                align-items: center;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
                cursor: grab;
                position: relative;
            }
            .wa-modal-header:active { cursor: grabbing; }
            .wa-modal-title {
                color: white;
                font-family: 'Segoe UI', sans-serif;
                font-size: 20px;
                font-weight: 600;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 20px;
                flex-grow: 1;
                padding-right: 30px; /* Space for the close button */
            }
            .wa-close-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                right: 20px;
                color: rgba(255, 255, 255, 0.7);
                font-size: 20px;
                cursor: pointer;
                z-index: 2;
            }
            .wa-close-btn:hover { color: white; }
            
            .clipart-grid-container {
                height: 500px;
                overflow-y: auto;
                padding: 20px;
                background: white;
            }
            
            .clipart-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                gap: 15px;
            }
            
            .clipart-card {
                aspect-ratio: 1;
                border: 2px solid transparent;
                border-radius: 8px;
                padding: 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.1s, border-color 0.2s, box-shadow 0.2s;
            }
            
            .clipart-card:hover {
                transform: scale(1.05);
                border-color: var(--ui-theme-color);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .clipart-card.selected {
                border-color: var(--ui-theme-color);
                background-color: rgba(0, 118, 112, 0.1);
                box-shadow: 0 4px 12px rgba(0, 118, 112, 0.2);
            }
        </style>
        <div class="wa-modal-header" id="clipart-modal-header">
            <div class="wa-modal-title">
                <span>Clipart Gallery</span>
                <div id="clipart-search-wrapper" style="position: relative; flex-grow: 1; max-width: 400px; font-weight: normal; font-size: 14px;">
                    <i class="fas fa-search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #888; pointer-events: none;"></i>
                    <input type="text" id="clipart-search-input" placeholder="Search for clipart (e.g., 'tree', 'computer', 'apple')..." style="width: 100%; padding: 10px 15px 10px 40px; border-radius: 20px; border: 1px solid #ddd; outline: none; box-sizing: border-box; background: rgba(255,255,255,0.95); user-select: text; -webkit-user-select: text; font-family: 'Segoe UI', sans-serif;">
                </div>
            </div>
            <div class="custom-dialog-close" id="clipart-close-x" style="position: absolute; top: 8px; right: 8px; z-index: 10;"><i class="fas fa-times"></i></div>
        </div>
        <div class="clipart-grid-container" id="clipart-grid-container" style="height: 50vh;">
            <!-- Grid goes here -->
        </div>
        <div class="wa-modal-footer" style="padding: 15px; text-align: right; border-top: 1px solid #eee; background: #fafafa; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            <button id="clipart-btn-cancel" class="btn-secondary" style="margin-right: 10px;">Cancel</button>
            <button id="clipart-btn-ok" class="btn-primary" disabled>OK</button>
        </div>
    `;

    DialogSystem.show('', uiHTML, null, true);
    
    // Style the dialog box exactly like beta wordart
    setTimeout(() => {
        const dialogBox = document.getElementById('custom-dialog-box');
        if(dialogBox) {
            dialogBox.style.width = '850px';
            dialogBox.style.maxWidth = '95vw';
            dialogBox.style.padding = '0';
            dialogBox.style.backgroundColor = 'transparent';
            dialogBox.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';

            const header = document.getElementById('clipart-modal-header');
            if (header) {
                let isDragging = false;
                header.addEventListener('mousedown', function(e) {
                    if (e.target.closest('#clipart-search-wrapper') || e.target.closest('#clipart-close-x')) return;
                    isDragging = true;
                    const rect = dialogBox.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    const offsetY = e.clientY - rect.top;

                    dialogBox.style.position = 'fixed';
                    dialogBox.style.transform = 'none';
                    dialogBox.style.margin = '0';
                    dialogBox.style.bottom = 'auto';
                    dialogBox.style.right = 'auto';
                    dialogBox.style.left = (e.clientX - offsetX) + 'px';
                    dialogBox.style.top = (e.clientY - offsetY) + 'px';

                    const onMouseMove = (me) => {
                        if (!isDragging) return;
                        dialogBox.style.left = (me.clientX - offsetX) + 'px';
                        dialogBox.style.top = (me.clientY - offsetY) + 'px';
                    };

                    const onMouseUp = () => {
                        isDragging = false;
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });
            }
            
            const closeBtn = document.getElementById('clipart-close-x');
            if (closeBtn) closeBtn.onclick = () => DialogSystem.close();
        }

        // Render using IntersectionObserver to prevent UI locking
        const container = document.getElementById('clipart-grid-container');
        if (!container) return;
        
        const grid = document.createElement('div');
        grid.className = 'clipart-grid';
        container.appendChild(grid);

        const thumbBaseUrl = "https://wsrv.nl/?url=acr.floydcraft.co.uk/clipart-thumbs/";
        const highResBaseUrl = "https://wsrv.nl/?url=acr.floydcraft.co.uk/clipart/";
        
        let activeLoads = 0;
        const maxConcurrent = 5;
        const loadQueue = [];
        
        const processQueue = () => {
            // Priority sort: currently visible items jump to the front of the queue
            loadQueue.sort((a, b) => (b.isIntersecting ? 1 : 0) - (a.isIntersecting ? 1 : 0));

            while (activeLoads < maxConcurrent && loadQueue.length > 0) {
                const card = loadQueue.shift();
                const filename = card.dataset.filename;
                activeLoads++;
                
                const img = new Image();
                img.onload = () => {
                    card.innerHTML = '';
                    card.appendChild(img);
                    card.loaded = true;
                    observer.unobserve(card); // Unobserve only when fully loaded
                    activeLoads--;
                    processQueue();
                };
                img.onerror = () => {
                    setTimeout(() => {
                        activeLoads--;
                        card.retries = (card.retries || 0) + 1;
                        loadQueue.push(card); // Retry by pushing back into queue
                        processQueue();
                    }, 1500);
                };
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                img.style.objectFit = 'contain';
                img.style.pointerEvents = 'none';
                img.style.animation = 'fadeIn 0.3s';
                
                // Fallback to high-res version if the thumbnail fails to load after 2 attempts
                if (card.retries >= 2) {
                    img.src = `${highResBaseUrl}${filename}`;
                } else {
                    img.src = `${thumbBaseUrl}${filename}`;
                }
            }
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const card = entry.target;
                card.isIntersecting = entry.isIntersecting; // Continuously track visibility status

                if (entry.isIntersecting) {
                    if (!card.loaded && !card.queued) {
                        card.queued = true;
                        card.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: var(--ui-theme-color); font-size: 24px; opacity: 0.5;"></i>';
                        loadQueue.push(card);
                        processQueue();
                    }
                }
            });
        }, { root: container, rootMargin: '300px' });

        let selectedFilename = null;
        let selectedElement = null;
        
        const closeBtn = document.getElementById('clipart-close-x');
        if (closeBtn) closeBtn.onclick = () => DialogSystem.close();

        const btnOk = document.getElementById('clipart-btn-ok');
        const btnCancel = document.getElementById('clipart-btn-cancel');

        if (btnCancel) btnCancel.onclick = () => DialogSystem.close();
        if (btnOk) {
            btnOk.onclick = () => {
                if (selectedFilename) {
                    DialogSystem.close();
                    if(window.insertSmartImage) {
                        window.insertSmartImage(highResBaseUrl + selectedFilename, thumbBaseUrl + selectedFilename);
                    } else {
                        DialogSystem.alert('Error', 'Image insertion function not found.');
                    }
                }
            };
        }

        // We can create the empty divs in one go, 3400 divs is fast enough (~10ms)
        const fragment = document.createDocumentFragment();
        const allCards = [];
        
        // Create a shuffled copy of the library so it's different every time
        const shuffledLibrary = [...webClipartLibrary];
        for (let i = shuffledLibrary.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledLibrary[i], shuffledLibrary[j]] = [shuffledLibrary[j], shuffledLibrary[i]];
        }
        
        for (let i = 0; i < shuffledLibrary.length; i++) {
            const filename = shuffledLibrary[i];
            
            // Clean up the filename to create a human-readable custom name for tags
            let customName = filename.replace(/\.png$/i, '');
            customName = customName.replace(/-\d+$/, ''); // Remove trailing ID numbers
            customName = customName.replace(/_PNG_Clip_Art|_PNG_Clipart|_PNG_Image|_Clip_Art_PNG_Image|_Clip_Art|_Clipart|_PNG/gi, '');
            customName = customName.replace(/_/g, ' ');
            customName = customName.trim();

            const card = document.createElement('div');
            card.className = 'clipart-card';
            card.dataset.filename = filename;
            card.dataset.customName = customName.toLowerCase();
            card.title = customName; // Use custom name as hover tooltip
            
            card.onclick = () => {
                if (selectedElement) selectedElement.classList.remove('selected');
                card.classList.add('selected');
                selectedElement = card;
                selectedFilename = filename;
                if (btnOk) btnOk.disabled = false;
            };

            card.ondblclick = () => {
                DialogSystem.close();
                if(window.insertSmartImage) {
                    window.insertSmartImage(highResBaseUrl + filename, thumbBaseUrl + filename);
                } else {
                    DialogSystem.alert('Error', 'Image insertion function not found.');
                }
            };
            
            observer.observe(card);
            fragment.appendChild(card);
            allCards.push(card);
        }
        grid.appendChild(fragment);

        // Search Bar Logic
        const searchInput = document.getElementById('clipart-search-input');
        if (searchInput) {
            searchInput.oninput = (e) => {
                const query = e.target.value.toLowerCase().trim();
                const terms = query.split(' ').filter(t => t.length > 0);
                
                allCards.forEach(card => {
                    if (terms.length === 0) {
                        card.style.display = 'flex';
                        return;
                    }
                    const name = card.dataset.customName;
                    const matches = terms.every(term => name.includes(term));
                    card.style.display = matches ? 'flex' : 'none';
                });
            };
        }
    }, 10);
};
/* =======================================================
   PICTURE PLACEHOLDER ADDON
======================================================== */
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
/* =========================================================================
   COMPRESS PICTURES ADDON
   ========================================================================= */

/* =========================================================================
   FEATURE: MS Paint-Style Drawing Engine
   ========================================================================= */

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

window.runDesignChecker = function() {
    const resultsContainer = document.getElementById('design-checker-results');
    if (!resultsContainer) return;
    
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '<div style="color: #64748b; font-size: 13px; display:flex; align-items:center; gap:5px;"><i class="fas fa-spinner fa-spin"></i> Scanning document...</div>';
    
    setTimeout(() => {
        const issues = [];
        const paper = document.getElementById('paper');
        const paperRect = paper.getBoundingClientRect();
        
        const elements = paper.querySelectorAll('.pub-element');
        
        elements.forEach(el => {
            // 1. Check Text Overflow
            if (el.dataset.type === 'text') {
                const contentDiv = el.querySelector('.element-content div[contenteditable]');
                if (contentDiv) {
                    // Check if scrollHeight is strictly greater than clientHeight
                    // Some browsers add fractional differences, so giving a 2px leeway
                    if (contentDiv.scrollHeight > contentDiv.clientHeight + 2 || contentDiv.scrollWidth > contentDiv.clientWidth + 2) {
                        issues.push({
                            type: 'Text Overflow',
                            icon: 'fas fa-text-height',
                            color: '#eab308',
                            desc: 'A text box has content that is cut off and not fully visible.',
                            element: el
                        });
                    }
                }
            }
            
            // 2. Check Low-Res Images
            if (el.dataset.type === 'image') {
                const img = el.querySelector('img');
                if (img) {
                    // Stretched larger than native resolution = pixelation
                    if (img.clientWidth > img.naturalWidth || img.clientHeight > img.naturalHeight) {
                        issues.push({
                            type: 'Low-Res Image',
                            icon: 'fas fa-image',
                            color: '#3b82f6',
                            desc: 'An image is stretched beyond its original resolution and may look pixelated when printed.',
                            element: el
                        });
                    }
                }
            }
            
            // 3. Check Off-Page Objects
            const elRect = el.getBoundingClientRect();
            // Completely outside
            if (elRect.right < paperRect.left || elRect.left > paperRect.right || elRect.bottom < paperRect.top || elRect.top > paperRect.bottom) {
                issues.push({
                    type: 'Off-Page Object',
                    icon: 'fas fa-object-ungroup',
                    color: '#ef4444',
                    desc: 'An object is positioned completely off the page canvas.',
                    element: el
                });
            } else if (elRect.left < paperRect.left - 5 || elRect.right > paperRect.right + 5 || elRect.top < paperRect.top - 5 || elRect.bottom > paperRect.bottom + 5) {
                 issues.push({
                    type: 'Partially Off-Page',
                    icon: 'fas fa-crop-alt',
                    color: '#f97316',
                    desc: 'An object is partially hanging off the edge of the page canvas.',
                    element: el
                });
            }
        });
        
        // Render Results
        if (issues.length === 0) {
            resultsContainer.innerHTML = `
                <div style="background: #ecfdf5; border: 1px solid #10b981; color: #065f46; padding: 10px; border-radius: 6px; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-check-circle" style="font-size: 16px;"></i> No design issues found! Your document looks great.
                </div>
            `;
        } else {
            let html = `
                <div style="margin-bottom: 10px; font-weight: 600; color: #1e293b; font-size: 14px;">
                    Found ${issues.length} potential issue${issues.length > 1 ? 's' : ''}:
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; padding-right: 5px;">
            `;
            
            issues.forEach((issue) => {
                html += `
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid ${issue.color}; padding: 10px; border-radius: 4px; display: flex; align-items: flex-start; gap: 10px;">
                        <div style="color: ${issue.color}; margin-top: 2px;"><i class="${issue.icon}"></i></div>
                        <div style="flex-grow: 1;">
                            <div style="font-weight: 600; font-size: 13px; color: #334155;">${issue.type}</div>
                            <div style="font-size: 11px; color: #64748b;">${issue.desc}</div>
                        </div>
                        <button onclick="highlightIssueElement('${issue.element.id}')" title="Locate Element" style="background: none; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer; padding: 4px 8px; color: #475569; transition: background 0.15s;">
                            <i class="fas fa-crosshairs"></i>
                        </button>
                    </div>
                `;
            });
            
            html += `</div>`;
            resultsContainer.innerHTML = html;
        }
    }, 600);
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

window.AccessibilityScanner = {
    issues: [],

    toggleSidebar: function() {
        const sidebar = document.getElementById('op-a11y-sidebar');
        if (sidebar) {
            if (sidebar.classList.contains('visible')) {
                sidebar.classList.remove('visible');
            } else {
                // hide others
                document.getElementById('op-table-sidebar')?.classList.remove('visible');
                document.getElementById('op-image-sidebar')?.classList.remove('visible');
                document.getElementById('op-wordart-sidebar')?.classList.remove('visible');
                sidebar.classList.add('visible');
                this.scanDocument();
            }
        }
    },

    luminance: function(r, g, b) {
        let a = [r, g, b].map(function (v) {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    },

    contrastRatio: function(rgb1, rgb2) {
        let lum1 = this.luminance(rgb1[0], rgb1[1], rgb1[2]);
        let lum2 = this.luminance(rgb2[0], rgb2[1], rgb2[2]);
        let brightest = Math.max(lum1, lum2);
        let darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    },

    parseColor: function(colorStr) {
        if (!colorStr) return null;
        if (colorStr === 'transparent' || colorStr === 'none') return [255, 255, 255]; // Treat transparent as white paper
        let c = document.createElement('canvas').getContext('2d');
        c.fillStyle = colorStr;
        let computed = c.fillStyle;
        if (computed.startsWith('#')) {
            let r = parseInt(computed.slice(1, 3), 16);
            let g = parseInt(computed.slice(3, 5), 16);
            let b = parseInt(computed.slice(5, 7), 16);
            return [r, g, b];
        } else if (computed.startsWith('rgb')) {
            let parts = computed.match(/\d+/g);
            if (parts && parts.length >= 3) {
                return [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])];
            }
        }
        return [255, 255, 255]; // fallback
    },

    scanDocument: function() {
        if (typeof serializeCurrentPage === 'function') {
            state.pages[state.currentPageIndex] = serializeCurrentPage();
        }

        this.issues = [];
        let issueIdCounter = 0;

        for (let i = 0; i < state.pages.length; i++) {
            let p = state.pages[i];
            if (!p || !p.elements) continue;

            let pageHasH1 = false;
            let highestHeading = 0;

            p.elements.forEach((el, index) => {
                // Rule 1: Missing Alt Text
                if (el.imgSrc || el.type === 'image') {
                    if (!el.altText || el.altText.trim() === '') {
                        this.issues.push({
                            id: issueIdCounter++,
                            type: 'altText',
                            pageIndex: i,
                            elIndex: index,
                            title: 'Missing Alt Text',
                            desc: 'An image on this page is missing alternative text.',
                            icon: 'fa-image',
                            severity: 'error'
                        });
                    }
                }

                // Rule 2 & 3
                if (el.innerHTML && el.type !== 'image' && el.type !== 'emoji') {
                    let tempDiv = document.createElement('div');
                    tempDiv.innerHTML = el.innerHTML;
                    
                    // Rule 2: Contrast Ratio
                    let fgColor = '#000000';
                    let bgColor = p.background || '#ffffff';
                    if (el.contentCssText) {
                        let styleMatch = el.contentCssText.match(/color:\s*([^;]+)/);
                        if (styleMatch) fgColor = styleMatch[1].trim();
                    }
                    if (el.bg) bgColor = el.bg;
                    
                    let fgRgb = this.parseColor(fgColor);
                    let bgRgb = this.parseColor(bgColor);
                    
                    if (fgRgb && bgRgb) {
                        let ratio = this.contrastRatio(fgRgb, bgRgb);
                        if (ratio < 4.5 && tempDiv.textContent.trim().length > 0) {
                             this.issues.push({
                                id: issueIdCounter++,
                                type: 'contrast',
                                pageIndex: i,
                                elIndex: index,
                                title: 'Low Color Contrast',
                                desc: `Text contrast ratio is ${ratio.toFixed(2)}:1 (minimum 4.5:1).`,
                                icon: 'fa-adjust',
                                severity: 'warning'
                            });
                        }
                    }

                    // Rule 3: Heading Structure
                    let headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
                    headings.forEach(h => {
                        let level = parseInt(h.tagName.substring(1));
                        if (level === 1) pageHasH1 = true;
                        
                        if (highestHeading !== 0 && level > highestHeading + 1) {
                            this.issues.push({
                                id: issueIdCounter++,
                                type: 'headingJump',
                                pageIndex: i,
                                elIndex: index,
                                title: 'Illogical Heading Structure',
                                desc: `Heading jumps from H${highestHeading} to H${level}.`,
                                icon: 'fa-heading',
                                severity: 'warning'
                            });
                        }
                        highestHeading = level;
                    });
                }
            });
            
            if (highestHeading > 0 && !pageHasH1) {
                this.issues.push({
                    id: issueIdCounter++,
                    type: 'missingH1',
                    pageIndex: i,
                    elIndex: -1,
                    title: 'Missing Page Title (H1)',
                    desc: 'This page has headings but no primary H1 heading.',
                    icon: 'fa-heading',
                    severity: 'error'
                });
            }
        }
        
        this.renderSidebar();
    },

    renderSidebar: function() {
        const container = document.getElementById('a11y-results-container');
        if (!container) return;
        
        if (this.issues.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 30px 10px; color:#555;">
                    <i class="fas fa-check-circle" style="font-size:40px; color:#2e7d32; margin-bottom:15px;"></i>
                    <h3 style="margin:0 0 10px 0; font-size:16px;">Accessibility Good!</h3>
                    <p style="font-size:12px; margin:0;">No major issues found on any pages.</p>
                </div>
            `;
            return;
        }

        let html = `<div style="margin-bottom:15px; font-weight:bold; color:var(--ui-danger, #d32f2f);"><i class="fas fa-exclamation-triangle" style="color:var(--ui-danger, #d32f2f);"></i> ${this.issues.length} Issues Found</div>`;
        
        this.issues.forEach(issue => {
            let severityColor = issue.severity === 'error' ? 'var(--ui-danger, #d32f2f)' : '#f57c00';
            html += `
                <div style="background:var(--ribbon-bg, #f9f9f9); border-left:4px solid ${severityColor}; padding:10px; margin-bottom:10px; border-radius:0 4px 4px 0; font-size:12px; position:relative;">
                    <div style="font-weight:bold; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:${severityColor}"><i class="fas ${issue.icon}" style="margin-right:5px; color:${severityColor}"></i> ${issue.title}</span>
                        <span style="color:var(--ui-text-muted, #888); font-size:10px; background:var(--ribbon-border, #e0e0e0); padding:2px 6px; border-radius:10px;">Page ${issue.pageIndex + 1}</span>
                    </div>
                    <div style="margin-bottom:10px; color:var(--ui-text, #555); line-height:1.4;">${issue.desc}</div>
                    <button onclick="window.AccessibilityScanner.fixIssue(${issue.id})" style="background:var(--ui-theme-color); color:#fff; border:none; padding:5px 12px; border-radius:4px; cursor:pointer; font-size:11px; font-weight:600; width:100%; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1"><i class="fas fa-wrench" style="margin-right:5px;"></i>Fix Issue</button>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },

    fixIssue: function(issueId) {
        let issue = this.issues.find(i => i.id === issueId);
        if (!issue) return;

        if (state.currentPageIndex !== issue.pageIndex) {
            loadPage(issue.pageIndex);
        }

        if (window.ContextMenuSystem) window.ContextMenuSystem.hide();
        document.querySelectorAll('.pub-element').forEach(el => el.classList.remove('selected'));
        state.selectedEl = null;

        if (issue.elIndex >= 0) {
            let elDivs = document.getElementById('paper').querySelectorAll('.pub-element');
            if (elDivs[issue.elIndex]) {
                elDivs[issue.elIndex].classList.add('selected');
                state.selectedEl = elDivs[issue.elIndex];
            }
        }

        if (issue.type === 'altText') {
            if (window.ContextMenuActions && ContextMenuActions.setAltText) {
                ContextMenuActions.setAltText();
            }
        } else if (issue.type === 'contrast') {
            if (state.selectedEl) {
                let content = state.selectedEl.querySelector('.element-content');
                if (content) {
                    content.style.color = '#000000';
                    let spans = content.querySelectorAll('span, p, h1, h2, h3, h4, h5, h6');
                    spans.forEach(s => s.style.color = '#000000');
                    if (window.pushHistory) pushHistory();
                    setTimeout(() => this.scanDocument(), 100);
                }
            }
        } else if (issue.type === 'headingJump') {
            DialogSystem.show('Heading Structure', '<div style="display:flex; align-items:center; gap:20px;"><i class="fas fa-info-circle fa-2x" style="color:var(--ui-theme-color);"></i><div style="line-height:1.4; font-size:14px;">Please manually adjust the heading levels using the Formatting Ribbon (e.g. change H3 to H2) to ensure a logical reading order.</div></div>', null, true);
        } else if (issue.type === 'missingH1') {
            DialogSystem.show('Auto-Fix Missing Title', '<div style="display:flex; align-items:center; gap:20px;"><i class="fas fa-magic fa-2x" style="color:var(--ui-theme-color);"></i><div style="line-height:1.4; font-size:14px;">This page is missing an H1 title. Would you like to automatically insert a new Page Title for screen readers?</div></div>', () => {
                let tb = addTextBox();
                let content = tb.querySelector('.element-content > div');
                if (content) {
                    content.innerHTML = '<h1 style="margin:0; font-family:var(--pub-font, Arial); color:var(--ui-theme-dark);">Page Title</h1>';
                }
                tb.style.width = '400px';
                tb.style.height = '60px';
                tb.style.left = '50px';
                tb.style.top = '50px';
                if (window.pushHistory) pushHistory();
                setTimeout(() => this.scanDocument(), 100);
            });
        }
    }
};

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

window.GraphicsManager = {
    toggleSidebar: function() {
        const sidebar = document.getElementById('op-graphics-sidebar');
        if (sidebar) {
            if (sidebar.classList.contains('visible')) {
                sidebar.classList.remove('visible');
            } else {
                // hide others
                document.getElementById('op-table-sidebar')?.classList.remove('visible');
                document.getElementById('op-image-sidebar')?.classList.remove('visible');
                document.getElementById('op-wordart-sidebar')?.classList.remove('visible');
                document.getElementById('op-a11y-sidebar')?.classList.remove('visible');
                sidebar.classList.add('visible');
                this.scanImages();
            }
        }
    },

    scanImages: function() {
        if (typeof serializeCurrentPage === 'function') {
            state.pages[state.currentPageIndex] = serializeCurrentPage();
        }

        let imagesList = [];

        for (let i = 0; i < state.pages.length; i++) {
            let p = state.pages[i];
            if (!p || !p.elements) continue;

            p.elements.forEach((el, index) => {
                if (el.imgSrc || el.type === 'image' || (el.type === 'shape' && el.imgSrc)) {
                    imagesList.push({
                        pageIndex: i,
                        elementIndex: index,
                        src: el.imgSrc,
                        element: el
                    });
                }
            });
        }
        this.renderList(imagesList);
    },

    formatBytes: function(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    },

    updateLinkedImage: function(pageIndex, elementIndex) {
        if (!state.pages[pageIndex] || !state.pages[pageIndex].elements[elementIndex]) return;
        const elData = state.pages[pageIndex].elements[elementIndex];
        
        const isEmbedded = elData.imgSrc && elData.imgSrc.startsWith('data:');
        
        if (!isEmbedded) {
            let url = elData.imgSrc;
            const qIdx = url.indexOf('?');
            if (qIdx !== -1) {
                // Strip old timestamp but keep other query params if needed? 
                // It's safer to just strip everything and append our own for cache busting
                url = url.substring(0, qIdx);
            }
            
            const newUrl = url + '?t=' + Date.now();
            elData.imgSrc = newUrl;
            
            if (state.currentPageIndex === pageIndex) {
                const paper = document.getElementById('paper');
                if (paper) {
                    const els = paper.querySelectorAll('.element');
                    if (els[elementIndex]) {
                        const img = els[elementIndex].querySelector('img');
                        if (img) img.src = newUrl;
                    }
                }
            }
            
            if (typeof pushHistory === 'function') pushHistory();
            this.scanImages();
            return;
        }

        // It's a Data URI (Embedded), we must prompt the user to select the updated file
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const newUrl = evt.target.result;
                    elData.imgSrc = newUrl;
                    
                    if (state.currentPageIndex === pageIndex) {
                        const paper = document.getElementById('paper');
                        if (paper) {
                            const els = paper.querySelectorAll('.element');
                            if (els[elementIndex]) {
                                const img = els[elementIndex].querySelector('img');
                                if (img) img.src = newUrl;
                            }
                        }
                    }
                    if (typeof pushHistory === 'function') pushHistory();
                    this.scanImages();
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        };
        input.click();
    },

    renderList: function(imagesList) {
        const container = document.getElementById('graphics-manager-results');
        if (!container) return;

        if (imagesList.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--ui-text-muted, #666);"><i class="fas fa-image fa-3x" style="color:var(--ui-border, #ddd); margin-bottom:15px;"></i><br>No graphics found in this document.</div>';
            return;
        }

        container.innerHTML = `<div style="font-size:12px; color:var(--ui-text-muted, #666); margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;"><span>Total Graphics: <strong style="color:var(--ui-text)">${imagesList.length}</strong></span><button onclick="window.GraphicsManager.scanImages()" style="background:none; border:none; color:var(--ui-theme-color); cursor:pointer;"><i class="fas fa-sync-alt"></i> Refresh</button></div>`;

        const listDiv = document.createElement('div');
        listDiv.className = 'graphics-manager-list';
        listDiv.style.display = 'flex';
        listDiv.style.flexDirection = 'column';
        listDiv.style.gap = '10px';

        imagesList.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'graphics-card';
            card.style.background = 'var(--ui-panel-bg, #fff)';
            card.style.border = '1px solid var(--ui-border, #ddd)';
            card.style.borderRadius = '6px';
            card.style.padding = '10px';
            card.style.display = 'flex';
            card.style.color = 'var(--ui-text)';
            card.style.gap = '15px';
            card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            card.style.transition = 'box-shadow 0.2s';
            card.style.cursor = 'pointer';
            card.onmouseover = () => card.style.boxShadow = '0 3px 6px rgba(0,0,0,0.1)';
            card.onmouseout = () => card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            
            card.onclick = () => this.goToFileManagerImage(item.pageIndex, item.elementIndex);

            const thumbContainer = document.createElement('div');
            thumbContainer.style.width = '60px';
            thumbContainer.style.height = '60px';
            thumbContainer.style.flexShrink = '0';
            thumbContainer.style.backgroundColor = 'var(--ui-hover-bg, #eee)';
            thumbContainer.style.borderRadius = '4px';
            thumbContainer.style.display = 'flex';
            thumbContainer.style.alignItems = 'center';
            thumbContainer.style.justifyContent = 'center';
            thumbContainer.style.overflow = 'hidden';

            const img = document.createElement('img');
            img.src = item.src;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.objectFit = 'contain';
            thumbContainer.appendChild(img);

            const details = document.createElement('div');
            details.style.flexGrow = '1';
            details.style.fontSize = '12px';
            details.style.lineHeight = '1.4';
            details.style.color = '#333';

            const isEmbedded = item.src.startsWith('data:');
            const typeBadge = isEmbedded ? 
                `<span style="background:#e8f5e9; color:#2e7d32; padding:2px 6px; border-radius:10px; font-size:10px; font-weight:bold;"><i class="fas fa-file-archive"></i> Embedded</span>` : 
                `<span style="background:#e3f2fd; color:#1565c0; padding:2px 6px; border-radius:10px; font-size:10px; font-weight:bold;"><i class="fas fa-link"></i> Linked</span>`;

            const updateBtnHtml = `<div style="margin-top:8px;"><button onclick="event.stopPropagation(); window.GraphicsManager.updateLinkedImage(${item.pageIndex}, ${item.elementIndex})" style="background:var(--ui-theme-color); color:#fff; border:none; padding:4px 10px; border-radius:4px; font-size:11px; cursor:pointer;"><i class="fas fa-sync-alt"></i> Update Image</button></div>`;

            details.innerHTML = `
                <div style="font-weight:bold; font-size:13px; margin-bottom:4px;">Page ${item.pageIndex + 1}</div>
                <div style="margin-bottom:4px;">${typeBadge}</div>
                <div id="res-${idx}" style="color:#666;"><i class="fas fa-spinner fa-spin"></i> Resizing...</div>
                <div id="size-${idx}" style="color:#666;"><i class="fas fa-spinner fa-spin"></i> Calculating...</div>
                ${updateBtnHtml}
            `;

            card.appendChild(thumbContainer);
            card.appendChild(details);
            listDiv.appendChild(card);

            // Async resolve resolution
            const tempImg = new Image();
            tempImg.onload = function() {
                const resEl = document.getElementById(`res-${idx}`);
                if (resEl) resEl.innerHTML = `<i class="fas fa-crop-alt"></i> ${this.width} x ${this.height} px`;
            };
            tempImg.onerror = function() {
                const resEl = document.getElementById(`res-${idx}`);
                if (resEl) resEl.innerHTML = `<i class="fas fa-exclamation-triangle" style="color:#c00"></i> Error`;
            };
            tempImg.src = item.src;

            // Async resolve size
            if (isEmbedded) {
                // Estimate base64 size: 
                let base64str = item.src.split(',')[1];
                if (base64str) {
                    let sizeBytes = Math.floor(base64str.length * 0.75);
                    setTimeout(() => {
                        const sizeEl = document.getElementById(`size-${idx}`);
                        if (sizeEl) sizeEl.innerHTML = `<i class="fas fa-hdd"></i> ${window.GraphicsManager.formatBytes(sizeBytes)}`;
                    }, 50);
                } else {
                    const sizeEl = document.getElementById(`size-${idx}`);
                    if (sizeEl) sizeEl.innerHTML = `<i class="fas fa-hdd"></i> Unknown`;
                }
            } else {
                // Try to fetch HEAD for linked file size
                fetch(item.src, { method: 'HEAD', mode: 'cors' })
                    .then(response => {
                        const size = response.headers.get('content-length');
                        const sizeEl = document.getElementById(`size-${idx}`);
                        if (size) {
                            if (sizeEl) sizeEl.innerHTML = `<i class="fas fa-hdd"></i> ${window.GraphicsManager.formatBytes(size)}`;
                        } else {
                            if (sizeEl) sizeEl.innerHTML = `<i class="fas fa-hdd"></i> Unknown`;
                        }
                    })
                    .catch(e => {
                        const sizeEl = document.getElementById(`size-${idx}`);
                        if (sizeEl) sizeEl.innerHTML = `<i class="fas fa-hdd"></i> Blocked (CORS/Network)`;
                    });
            }
        });

        container.appendChild(listDiv);
    },

    goToFileManagerImage: function(pageIndex, elementIndex) {
        if (state.currentPageIndex !== pageIndex) {
            switchPage(pageIndex);
        }
        
        setTimeout(() => {
            const paper = document.getElementById('paper');
            if (paper) {
                const el = paper.children[elementIndex];
                if (el && typeof selectElement === 'function') {
                    selectElement(el, new Event('click'));
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 300);
    }
};

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
window.CustomColorPicker = class CustomColorPicker {
    static init() {
        this.el = document.getElementById('custom-color-picker');
        this.themeGrid = document.getElementById('ccp-theme-colors');
        this.standardGrid = document.getElementById('ccp-standard-colors');
        this.recentGrid = document.getElementById('ccp-recent-colors');
        this.hexInput = document.getElementById('custom-color-hex');
        this.rgbInputs = {
            r: document.getElementById('custom-color-r'),
            g: document.getElementById('custom-color-g'),
            b: document.getElementById('custom-color-b')
        };
        this.previewSwatch = document.getElementById('ccp-preview-swatch');
        this.eyedropperBtn = document.getElementById('ccp-eyedropper');
        
        // Tab elements
        this.tabs = document.querySelectorAll('.ccp-tab');
        this.tabContents = document.querySelectorAll('.ccp-tab-content');
        
        // Canvas elements
        this.svCanvas = document.getElementById('ccp-sv-canvas');
        this.hueCanvas = document.getElementById('ccp-hue-canvas');
        this.svCursor = document.getElementById('ccp-sv-cursor');
        this.hueCursor = document.getElementById('ccp-hue-cursor');
        
        if (!this.el) return;
        
        // Colors arrays
        this.themeColors = [
            '#ffffff', '#000000', '#f4f5f7', 'var(--ui-theme-color)', '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#34495e',
            '#f2f2f2', '#333333', '#e0e3e8', '#00a89d', '#f1948a', '#85c1e9', '#82e0aa', '#f7dc6f', '#c39bd3', '#85929e',
            '#cccccc', '#222222', '#b0b5be', '#004a46', '#b03a2e', '#21618c', '#1e8449', '#b7950b', '#6c3483', '#212f3c'
        ];
        this.standardColors = [
            '#ff0000', '#ff5733', '#ffc300', '#daf7a6', '#28b463', '#1abc9c', '#3498db', '#2980b9', '#8e44ad', '#839192',
            '#c0392b', '#d35400', '#f39c12', '#aed6f1', '#2ecc71', '#16a085', '#2e86c1', '#2471a3', '#9b59b6', '#7f8c8d',
            '#922b21', '#ba4a00', '#d68910', '#5dade2', '#27ae60', '#117864', '#2874a6', '#1f618d', '#76448a', '#707b7c',
            '#7b241c', '#a04000', '#b9770e', '#3498db', '#229954', '#0e6655', '#21618c', '#1a5276', '#633974', '#616a6b',
            '#641e16', '#873600', '#9c640c', '#2e86c1', '#1d8348', '#0b5345', '#1b4f72', '#154360', '#512e5f', '#515a5a'
        ];
        this.recentColors = ['var(--ui-theme-color)', '#ffffff', '#000000', '#e74c3c', '#3498db', '#f1c40f'];
        
        this.renderSwatches(this.themeGrid, this.themeColors);
        this.renderSwatches(this.standardGrid, this.standardColors);
        this.renderSwatches(this.recentGrid, this.recentColors);
        
        // Hide eyedropper if not supported
        if (!window.EyeDropper && this.eyedropperBtn) {
            this.eyedropperBtn.style.display = 'none';
        }
        
        // State
        this.isOpen = false;
        this.callback = null;
        this.anchor = null;
        this.currentColor = '#000000';
        this.hsv = { h: 0, s: 0, v: 0 };
        
        this.bindEvents();
        this.initCanvases();
    }
    
    static bindEvents() {
        // Prevent clicking inside the color picker from bubbling up and closing parent dropdowns
        this.el.addEventListener('mousedown', (e) => e.stopPropagation());

        // Hex input
        this.hexInput.addEventListener('change', (e) => this.setFromHex(e.target.value, true));
        this.hexInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.setFromHex(e.target.value, true);
                this.selectColor(this.currentColor);
            }
        });

        // RGB inputs
        const updateFromRgb = () => {
            let r = parseInt(this.rgbInputs.r.value) || 0;
            let g = parseInt(this.rgbInputs.g.value) || 0;
            let b = parseInt(this.rgbInputs.b.value) || 0;
            r = Math.max(0, Math.min(255, r));
            g = Math.max(0, Math.min(255, g));
            b = Math.max(0, Math.min(255, b));
            const hex = '#' + [r, g, b].map(x => {
                const h = x.toString(16);
                return h.length === 1 ? '0' + h : h;
            }).join('');
            this.setFromHex(hex, true);
        };
        ['r', 'g', 'b'].forEach(ch => {
            if (this.rgbInputs[ch]) {
                this.rgbInputs[ch].addEventListener('change', updateFromRgb);
                this.rgbInputs[ch].addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        updateFromRgb();
                        this.selectColor(this.currentColor);
                    }
                });
            }
        });
        
        // Eyedropper API
        if (this.eyedropperBtn) {
            this.eyedropperBtn.addEventListener('click', async () => {
                if (window.EyeDropper) {
                    const eyeDropper = new EyeDropper();
                    try {
                        const result = await eyeDropper.open();
                        this.setFromHex(result.sRGBHex, true);
                        this.selectColor(result.sRGBHex);
                    } catch (e) {
                        // user canceled
                    }
                }
            });
        }
        
        // Tabs
        this.tabs.forEach(tab => {
            tab.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.tabs.forEach(t => t.classList.remove('active'));
                this.tabContents.forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('ccp-tab-' + tab.dataset.tab).classList.add('active');
            });
        });
        
        // Dragging state
        let isDraggingSV = false;
        let isDraggingHue = false;
        
        const updateSV = (e) => {
            if (!isDraggingSV) return;
            const rect = this.svCanvas.getBoundingClientRect();
            let x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            let y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
            this.hsv.s = x / rect.width;
            this.hsv.v = 1 - (y / rect.height);
            this.updateFromHSV();
        };
        
        const updateHue = (e) => {
            if (!isDraggingHue) return;
            const rect = this.hueCanvas.getBoundingClientRect();
            let y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
            this.hsv.h = 360 - ((y / rect.height) * 360);
            if (this.hsv.h === 360) this.hsv.h = 0;
            this.updateFromHSV();
        };
        
        this.svCanvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDraggingSV = true;
            updateSV(e);
        });
        this.hueCanvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDraggingHue = true;
            updateHue(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDraggingSV) updateSV(e);
            if (isDraggingHue) updateHue(e);
        });
        
        document.addEventListener('mouseup', () => {
            isDraggingSV = false;
            isDraggingHue = false;
        });
        
        // Click outside to close
        document.addEventListener('mousedown', (e) => {
            if (this.isOpen && !this.el.contains(e.target) && this.anchor && !this.anchor.contains(e.target)) {
                this.close();
            }
        });
    }
    
    static initCanvases() {
        // Draw Hue Canvas (static)
        const ctx = this.hueCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, this.hueCanvas.height);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(1/6, '#ff00ff');
        gradient.addColorStop(2/6, '#0000ff');
        gradient.addColorStop(3/6, '#00ffff');
        gradient.addColorStop(4/6, '#00ff00');
        gradient.addColorStop(5/6, '#ffff00');
        gradient.addColorStop(1, '#ff0000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.hueCanvas.width, this.hueCanvas.height);
    }
    
    static renderSVCanvas() {
        const ctx = this.svCanvas.getContext('2d');
        const w = this.svCanvas.width;
        const h = this.svCanvas.height;
        
        // Base hue color
        ctx.fillStyle = `hsl(${this.hsv.h}, 100%, 50%)`;
        ctx.fillRect(0, 0, w, h);
        
        // White gradient
        const whiteGrad = ctx.createLinearGradient(0, 0, w, 0);
        whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
        whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = whiteGrad;
        ctx.fillRect(0, 0, w, h);
        
        // Black gradient
        const blackGrad = ctx.createLinearGradient(0, 0, 0, h);
        blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
        blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = blackGrad;
        ctx.fillRect(0, 0, w, h);
    }
    
    static updateFromHSV() {
        this.renderSVCanvas();
        this.currentColor = this.hsvToHex(this.hsv.h, this.hsv.s, this.hsv.v);
        this.hexInput.value = this.currentColor;
        this.updateRgbInputs(this.currentColor);
        this.previewSwatch.style.backgroundColor = this.currentColor;
        this.updateCursors();
        
        if (this.callback) this.callback(this.currentColor);
    }
    
    static setFromHex(hex, updateCursors = true) {
        if (!/^#[0-9A-Fa-f]{6}$/i.test(hex)) return;
        this.currentColor = hex.toLowerCase();
        this.previewSwatch.style.backgroundColor = this.currentColor;
        this.hexInput.value = this.currentColor;
        this.updateRgbInputs(this.currentColor);
        
        if (updateCursors) {
            this.hsv = this.hexToHsv(this.currentColor);
            this.renderSVCanvas();
            this.updateCursors();
        }
    }

    static updateRgbInputs(hex) {
        if (!this.rgbInputs || !this.rgbInputs.r) return;
        this.rgbInputs.r.value = parseInt(hex.substring(1,3), 16);
        this.rgbInputs.g.value = parseInt(hex.substring(3,5), 16);
        this.rgbInputs.b.value = parseInt(hex.substring(5,7), 16);
    }
    
    static updateCursors() {
        const svX = this.hsv.s * this.svCanvas.width;
        const svY = (1 - this.hsv.v) * this.svCanvas.height;
        this.svCursor.style.left = svX + 'px';
        this.svCursor.style.top = svY + 'px';
        
        const hueY = (1 - (this.hsv.h / 360)) * this.hueCanvas.height;
        this.hueCursor.style.top = hueY + 'px';
    }
    
    static hsvToHex(h, s, v) {
        let r, g, b;
        let i = Math.floor(h / 60);
        let f = h / 60 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        const toHex = x => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    
    static hexToHsv(hex) {
        let r = parseInt(hex.substring(1,3), 16) / 255;
        let g = parseInt(hex.substring(3,5), 16) / 255;
        let b = parseInt(hex.substring(5,7), 16) / 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;
        let d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s, v: v };
    }
    
    static renderSwatches(container, colors) {
        container.innerHTML = '';
        colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.title = color;
            swatch.onmousedown = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.setFromHex(color);
                this.selectColor(color);
            };
            container.appendChild(swatch);
        });
    }
    
    static open(anchorElement, initialColor, callback) {
        this.anchor = anchorElement;
        this.callback = callback;
        
        let validInitial = initialColor && /^#[0-9A-Fa-f]{6}$/i.test(initialColor) ? initialColor : '#000000';
        this.setFromHex(validInitial, true);
        
        this.el.style.display = 'block';
        this.isOpen = true;
        
        const rect = anchorElement.getBoundingClientRect();
        let top = rect.bottom + window.scrollY + 5;
        let left = rect.left + window.scrollX;
        
        if (left + this.el.offsetWidth > window.innerWidth) {
            left = window.innerWidth - this.el.offsetWidth - 10;
        }
        if (top + this.el.offsetHeight > window.innerHeight) {
            top = rect.top + window.scrollY - this.el.offsetHeight - 5;
        }
        
        this.el.style.top = top + 'px';
        this.el.style.left = left + 'px';
    }
    
    static close() {
        this.el.style.display = 'none';
        this.isOpen = false;
        this.anchor = null;
        this.callback = null;
    }
    
    static selectColor(color) {
        // Update recent colors array
        const lowercaseColor = color.toLowerCase();
        const index = this.recentColors.indexOf(lowercaseColor);
        if (index > -1) {
            this.recentColors.splice(index, 1);
        }
        this.recentColors.unshift(lowercaseColor);
        if (this.recentColors.length > 10) {
            this.recentColors.pop();
        }
        this.renderSwatches(this.recentGrid, this.recentColors);

        if (this.callback) {
            this.callback(color);
        }
        this.close();
    }
};

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

/* =========================================================================
   Z-INDEX OVERLAY PATCH (Global Handles Fix)
   ========================================================================= */





