
function initFontPickers() {
    const ribbonList = document.getElementById('ribbon-font-list');
    const floatList = document.getElementById('float-font-list');
    const preloader = document.getElementById('font-preloader');
    
    // Sort Alphabetically
    fontList.sort();

    fontList.forEach(font => {
        // Ribbon Item
        const item1 = document.createElement('div');
        item1.className = 'font-item';
        item1.innerText = font;
        item1.style.fontFamily = font;
        item1.onclick = () => { selectFont(font); };
        ribbonList.appendChild(item1);

        // Float Item
        const item2 = document.createElement('div');
        item2.className = 'font-item';
        item2.innerText = font;
        item2.style.fontFamily = font;
        item2.onclick = () => { selectFont(font); };
        floatList.appendChild(item2);

        // Preload font by creating an element
        const span = document.createElement('span');
        span.style.fontFamily = font;
        span.innerText = "A";
        preloader.appendChild(span);
    });
}


function selectFont(fontName) {
    // FIXED: Immediately update UI Labels visually
    document.getElementById('ribbon-font-label').innerText = fontName;
    document.getElementById('float-font-label').innerText = fontName;
    
    // Execute
    if (state.selectedEl) {
        // If text selected, specific execute
        execCmd('fontName', fontName);
        
        // FIXED: Force immediate repaint to show font change
        forceRepaint();
    } else {
        // Set float font updates global execution state
        setFloatFont(fontName);
    }
    
    // Hide Menus
    document.querySelectorAll('.custom-dropdown').forEach(d => d.style.display = 'none');
}


function setTrueFontSize(val) {
    if (state.selectedEl) {
        const waText = state.selectedEl.querySelector('.wa-text');
        
        if (waText) {
            // NEW WORDART LOGIC: Change font size, then expand the container box to match!
            waText.style.fontSize = val;
            waText.style.transform = 'none'; 
            
            // Add 8px to account for the 4px padding on each side
            state.selectedEl.style.width = (waText.offsetWidth + 8) + 'px';
            state.selectedEl.style.height = (waText.offsetHeight + 8) + 'px';
            
            syncWordArt(state.selectedEl); 
            
        } else {
            // STANDARD TEXT LOGIC
            if (state.lastRange) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(state.lastRange);
            }
            
            // Trigger the browser's native resize
            document.execCommand("fontSize", false, "7"); 
            
            // Catch both standard <font> tags and browser-generated <span> tags
            const fontTags = state.selectedEl.querySelectorAll('font[size="7"], span[style*="xxx-large"], span[style*="48px"]');
            fontTags.forEach(f => {
                f.removeAttribute("size");
                f.style.fontSize = val;
            });
            
            // Fallback for collapsed selections
            const sel = window.getSelection();
            if(sel.isCollapsed) {
                 const content = state.selectedEl.querySelector('.element-content > div') || state.selectedEl.querySelector('.element-content');
                 if(content) content.style.fontSize = val;
            }
        }
        
        // Push exact number to both UI elements
        const numVal = parseInt(val);
        const floatSelect = document.getElementById('float-size');
        
        document.getElementById('font-size').value = numVal;
        
        // Ensure the dropdown has the option before setting it
        if (floatSelect) {
            let optionExists = Array.from(floatSelect.options).some(opt => parseInt(opt.value) === numVal);
            if(!optionExists) {
                const newOpt = document.createElement('option');
                newOpt.value = numVal;
                newOpt.innerText = numVal;
                floatSelect.appendChild(newOpt);
            }
            floatSelect.value = numVal;
        }
        
        // Immediately capture the new selection range so rapid consecutive font changes (or shortcuts) don't fail
        const currentSel = window.getSelection();
        if (currentSel.rangeCount > 0) {
            state.lastRange = currentSel.getRangeAt(0).cloneRange();
        }
        
        pushHistory();
    }
}


function addTextBox() { 
    const autoHyphenate = localStorage.getItem('opub_autoHyphenate') === 'true';
    const hyphenStyle = autoHyphenate ? ' hyphens:auto; -webkit-hyphens:auto;' : '';
    
    const el = createWrapper(`<div style="padding:10px; height:100%; word-wrap:break-word;${hyphenStyle}" contenteditable="true">Click to edit text</div>`); 
    el.setAttribute('data-scheme-text', '0');
    applySingleElementScheme(el, state.currentScheme);
    return el;
}


function execCmd(cmd, val) { 
    if(cmd === 'foreColor' && state.selectedEl && state.selectedEl.getAttribute('data-type') === 'shape') {
        const shapeDiv = state.selectedEl.querySelector('.element-content div');
        if(shapeDiv) shapeDiv.style.background = val;
        const svgShape = state.selectedEl.querySelector('svg *');
        if(svgShape) svgShape.style.stroke = val;
        updateThumbnails();
        pushHistory();
        return;
    }
    
    // Crucial fix: The native OS color picker (<input type="color">) steals focus when opened.
    // If we don't restore the selection before executing the command, it fails because
    // the text box is no longer the active selection.
    if (state.lastRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(state.lastRange);
    }
    
    // Enable styleWithCSS to force the browser to use <span style="..."> instead of legacy <font> tags.
    // Legacy <font> tags notoriously fail to apply when the selection includes <br> tags or spans across complex nodes.
    try { document.execCommand('styleWithCSS', false, true); } catch(e) {}
    
    if (cmd === 'hiliteColor') {
        // Different browsers use different commands for text background color.
        document.execCommand('hiliteColor', false, val);
        document.execCommand('backColor', false, val);
    } else {
        document.execCommand(cmd, false, val); 
    }
    
    try { document.execCommand('styleWithCSS', false, false); } catch(e) {}
    
    // Ensure focus is explicitly maintained on the target text box so typing can resume
    if (state.selectedEl) {
        const textEditBox = state.selectedEl.querySelector('div[contenteditable]');
        if (textEditBox && document.activeElement !== textEditBox) {
            textEditBox.focus();
        }
    } 
    
    const sel = window.getSelection();
    if(sel.rangeCount > 0) state.lastRange = sel.getRangeAt(0).cloneRange();
    
    if(!state.isProgrammaticUpdate) updateFloatToolbarValues();
}


function execFloatCmd(cmd, val) {
    state.isProgrammaticUpdate = true;
    if (state.lastRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(state.lastRange);
    }
    execCmd(cmd, val);
    setTimeout(() => { state.isProgrammaticUpdate = false; }, 100);
}


function toggleSpellCheck() {
    state.spellCheck = !state.spellCheck;
    document.body.setAttribute('spellcheck', state.spellCheck);
    
    document.querySelectorAll('.pub-content [contenteditable="true"]').forEach(el => {
        if (el.classList.contains('wa-text')) return;
        el.setAttribute('spellcheck', state.spellCheck ? 'true' : 'false');
        if (state.spellCheck) {
            el.setAttribute('lang', 'en');
        }
    });
    
    const status = state.spellCheck ? "ON" : "OFF";
    DialogSystem.alert('Spell Check', "Spell check toggled " + status);
}

function openThesaurus() { 
    if (window.ThesaurusTool) {
        window.ThesaurusTool.toggleSidebar();
    } else {
        window.open('https://www.thesaurus.com/', '_blank'); 
    }
}


function updateFloatToolbarValues() {
    const activeId = document.activeElement ? document.activeElement.id : null;
    if(['float-font', 'float-size', 'font-size', 'ribbon-font-btn'].includes(activeId)) return;

    if(state.lastRange) {
        // Pinpoint the exact text node the cursor is touching
        let node = state.lastRange.startContainer;
        if (node.nodeType === 3) {
            node = node.parentNode;
        } else {
            // If the browser targets a wrapper, dig down to the exact child element
            const offset = state.lastRange.startOffset;
            if (node.childNodes.length > offset) {
                let child = node.childNodes[offset];
                if (child.nodeType === 3) child = child.parentNode;
                if (child && child.nodeType === 1) node = child;
            }
        }

        if(node && (node.nodeType === 1)) {
            const computed = window.getComputedStyle(node);
            const fam = computed.fontFamily.replace(/['"]/g, '').split(',')[0].trim();
            
            // Update Font Family Labels
            document.getElementById('ribbon-font-label').innerText = fam;
            document.getElementById('float-font-label').innerText = fam;

            const fSize = parseInt(computed.fontSize);
            
            const floatSelect = document.getElementById('float-size');
            const ribbonInput = document.getElementById('font-size');

            // Force the float dropdown to accept custom numbers
            if (floatSelect) {
                let optionExists = Array.from(floatSelect.options).some(opt => parseInt(opt.value) === fSize);
                if(!optionExists) {
                    const newOpt = document.createElement('option');
                    newOpt.value = fSize;
                    newOpt.innerText = fSize;
                    floatSelect.appendChild(newOpt);
                    
                    // Sort options so the new number fits in naturally
                    const opts = Array.from(floatSelect.options);
                    opts.sort((a,b) => parseInt(a.value) - parseInt(b.value));
                    floatSelect.innerHTML = '';
                    opts.forEach(o => floatSelect.appendChild(o));
                }
                floatSelect.value = fSize;
            }
            
            // Update the Ribbon Input
            if (ribbonInput) {
                ribbonInput.value = fSize;
            }
        }
    }
}


function showFloatToolbar() {
    if(!state.selectedEl) return;
    
    const el = state.selectedEl;
    const isImage = el.querySelector('img');
    const isBetaWordArt = el.querySelector('.beta-wa-img');
    const isSvg = el.querySelector('svg');
    const isShape = el.getAttribute('data-type') === 'shape';
    const isWordArt = el.querySelector('.wa-text');
    const isTable = el.querySelector('table');
    
    const waToolbar = document.getElementById('wa-float-toolbar');
    
    // Always reset both
    { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
    if (waToolbar) waToolbar.style.display = 'none';
    
    let activeToolbar = null;
    
    if (isBetaWordArt) {
        activeToolbar = waToolbar;
    } else {
        // Standard negative logic for the text toolbar
        if(isImage || (isShape && !isWordArt && !isTable)) return;
        if(isSvg && !isWordArt && !isShape) return;
        activeToolbar = floatToolbar;
    }

    if (!activeToolbar) return;

    const rect = state.selectedEl.getBoundingClientRect();
    activeToolbar.style.display = 'flex';
    
    if (activeToolbar === floatToolbar) {
        if (window._globalFloatPos) {
            activeToolbar.style.bottom = 'auto';
            activeToolbar.style.transform = 'none';
            activeToolbar.style.top = window._globalFloatPos.top + 'px';
            activeToolbar.style.left = window._globalFloatPos.left + 'px';
        } else {
            // Dock the text toolbar at the bottom center by default
            activeToolbar.style.top = 'auto';
            activeToolbar.style.bottom = '30px';
            activeToolbar.style.left = '50%';
            activeToolbar.style.transform = 'translateX(-50%)';
        }
        updateFloatToolbarValues();
    } else {
        // Position the WordArt toolbar near the object
        let top = rect.top - 80; 
        let left = rect.left;
        if (activeToolbar === waToolbar) top -= 20;
        if(top < 10) top = rect.bottom + 20; 
        if(left < 10) left = 10;
        
        activeToolbar.style.bottom = 'auto';
        activeToolbar.style.transform = 'none';
        activeToolbar.style.top = top + 'px';
        activeToolbar.style.left = left + 'px';
    }
}

function setFloatSize(val) {
    state.isProgrammaticUpdate = true;
    setTrueFontSize(val + 'px');
    setTimeout(() => { state.isProgrammaticUpdate = false; }, 100);
}

function setFloatFont(val) {
    state.isProgrammaticUpdate = true;
    if (state.lastRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(state.lastRange);
    }
    document.execCommand('fontName', false, val);
    setTimeout(() => { state.isProgrammaticUpdate = false; }, 100);
}


function isTextEditing() {
     const ae = document.activeElement;
     return ae && (ae.isContentEditable || ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA');
}

// --- MIGRATED FONT LIST ---
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
