function showMinimapContextMenu(e, index) {
    state.contextMenuTargetIndex = index;
    const menu = document.getElementById('minimap-context-menu');
    if (!menu) return;
    
    const ignoreMasterIcon = menu.querySelector('#cm-ignore-master i');
    const defaultMasterIcon = menu.querySelector('#cm-default-master i');
    if (state.pages[index] && state.pages[index].ignoreMasterPage) {
        if(ignoreMasterIcon) ignoreMasterIcon.style.opacity = '1';
        if(defaultMasterIcon) defaultMasterIcon.style.opacity = '0';
    } else {
        if(ignoreMasterIcon) ignoreMasterIcon.style.opacity = '0';
        if(defaultMasterIcon) defaultMasterIcon.style.opacity = '1';
    }
    
    menu.style.display = 'flex';
    
    // Position menu
    let x = e.clientX;
    let y = e.clientY;
    
    // Ensure it doesn't go off-screen
    const rect = menu.getBoundingClientRect();
    if (x + 180 > window.innerWidth) x = window.innerWidth - 180;
    if (y + 190 > window.innerHeight) y = window.innerHeight - 190;
    
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
}


function contextAddPage() {
    addNewPage(state.contextMenuTargetIndex);
}


function contextDuplicatePage(fromPasteboard = false) {
    const index = (fromPasteboard || state.contextMenuTargetIndex === undefined) ? state.currentPageIndex : state.contextMenuTargetIndex;
    const pageToCopy = state.pages[index];
    if (!pageToCopy) return;
    
    // If it's the current page, serialize it first to ensure we get latest changes
    if (index === state.currentPageIndex) {
        state.pages[index] = serializeCurrentPage();
    }
    
    // Deep clone the page
    const clonedPage = JSON.parse(JSON.stringify(state.pages[index]));
    
    // Assign a new ID
    clonedPage.id = Date.now() + Math.floor(Math.random() * 1000);
    
    // Insert after the target index
    state.pages.splice(index + 1, 0, clonedPage);
    state.currentPageIndex = index + 1;
    
    renderPage(state.pages[state.currentPageIndex]);
    updateSidebar();
    
    setTimeout(() => {
        if(typeof updateThumbnails === 'function') updateThumbnails();
        pushHistory(); 
    }, 50);
}


function contextMoveUp() {
    const index = state.contextMenuTargetIndex;
    if(index > 0) {
        // 1. Permanently save current canvas BEFORE modifying the array!
        state.pages[state.currentPageIndex] = serializeCurrentPage();

        // 2. Perform the mathematical swap
        const item = state.pages.splice(index, 1)[0];
        state.pages.splice(index - 1, 0, item);

        // 3. Track where the user's active page went
        let targetIndex = state.currentPageIndex;
        if (state.currentPageIndex === index) {
            targetIndex = index - 1;
        } else if (state.currentPageIndex === index - 1) {
            targetIndex = index;
        }
        state.currentPageIndex = targetIndex;

        // 4. Update the UI instantly
        renderPage(state.pages[state.currentPageIndex]);
        pushHistory();
        
        // 5. Update sidebar immediately
        updateSidebar();
        const correctThumb = document.querySelectorAll('.page-thumb')[targetIndex];
        if (correctThumb) correctThumb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }
}

function contextMoveDown() {
    const index = state.contextMenuTargetIndex;
    if(index < state.pages.length - 1) {
        // 1. Permanently save current canvas BEFORE modifying the array!
        state.pages[state.currentPageIndex] = serializeCurrentPage();

        // 2. Perform the mathematical swap
        const item = state.pages.splice(index, 1)[0];
        state.pages.splice(index + 1, 0, item);

        // 3. Track where the user's active page went
        let targetIndex = state.currentPageIndex;
        if (state.currentPageIndex === index) {
            targetIndex = index + 1;
        } else if (state.currentPageIndex === index + 1) {
            targetIndex = index;
        }
        state.currentPageIndex = targetIndex;

        // 4. Update the UI instantly
        renderPage(state.pages[state.currentPageIndex]);
        pushHistory();

        // 5. Update sidebar immediately
        updateSidebar();
        const correctThumb = document.querySelectorAll('.page-thumb')[targetIndex];
        if (correctThumb) correctThumb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }
}

function contextDeletePage() {
    deletePage(state.contextMenuTargetIndex, { stopPropagation: () => {} });
}

function contextSetIgnoreMaster(ignore) {
    const idx = state.contextMenuTargetIndex;
    if (idx === undefined || !state.pages[idx]) return;
    if (idx === 0 && state.hasMasterPage) {
        if (typeof DialogSystem !== 'undefined') DialogSystem.show('Invalid Operation', 'You cannot ignore the master page on the master page itself.');
        return;
    }
    
    if (idx === state.currentPageIndex && typeof serializeCurrentPage === 'function') {
        state.pages[idx] = serializeCurrentPage();
    }
    
    state.pages[idx].ignoreMasterPage = ignore;
    
    if (idx === state.currentPageIndex) {
        renderPage(idx);
    }
    
    updateSidebar();
    saveState();
    
    const menu = document.getElementById('minimap-context-menu');
    if (menu) menu.style.display = 'none';
}

function contextAddNote() {
    const index = (state.contextMenuTargetIndex === undefined) ? state.currentPageIndex : state.contextMenuTargetIndex;
    const page = state.pages[index];
    if (!page) return;
    
    const menu = document.getElementById('minimap-context-menu');
    if (menu) menu.style.display = 'none';
    
    const existingNote = page.note || "";
    DialogSystem.show('Add Page Note', `
        <div style="margin-bottom: 10px; font-size: 14px; color: #555;">Add a short identifier or note to display under this page's thumbnail in the Navigation Pane. Leave blank to remove.</div>
        <input type="text" id="page-note-input" value="${existingNote.replace(/"/g, '&quot;')}" style="width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-family: sans-serif;" placeholder="e.g. Back Cover">
    `, () => {
        const input = document.getElementById('page-note-input');
        if (input) {
            const val = input.value.trim();
            if (val) {
                state.pages[index].note = val;
            } else {
                delete state.pages[index].note;
            }
            updateSidebar();
            if (typeof pushHistory === 'function') pushHistory();
        }
    });
}

function toggleSidebar(forceClose) {
    const sb = document.getElementById('sidebar');
    const trigger = document.getElementById('sidebar-toggle-trigger');
    
    if(forceClose) {
        sb.classList.add('manual-collapsed');
        sb.classList.remove('active');
        trigger.style.display = 'flex'; 
    } else {
        if(sb.classList.contains('manual-collapsed')) {
            sb.classList.remove('manual-collapsed');
            trigger.style.display = 'none'; 
        } else if(window.innerWidth <= 900) {
            sb.classList.toggle('active');
        } else {
            sb.classList.add('manual-collapsed');
            trigger.style.display = 'flex';
        }
    }
}

function closeModal(el) { el.style.display = 'none'; }


function toggleBorderMenu(btn) {
    const m = document.getElementById('border-dropdown');
    const r = btn.getBoundingClientRect();
    m.style.left = r.left + 'px'; m.style.top = (r.bottom+5) + 'px';
    m.style.display = 'block';
}

function toggleRecolorMenu(btn) {
    const m = document.getElementById('recolor-dropdown');
    const isBlock = m.style.display === 'block';
    document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
    if (!isBlock) {
        const r = btn.getBoundingClientRect();
        m.style.left = r.left + 'px'; m.style.top = (r.bottom+5) + 'px';
        m.style.display = 'block';
    }
}



function toggleColorBlindMenu(btn) {
    const m = document.getElementById('color-blind-dropdown');
    const isBlock = m.style.display === 'block';
    document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
    if (!isBlock) {
        m.style.display = 'block';
        const r = btn.getBoundingClientRect();
        if (r.left + m.offsetWidth > window.innerWidth) m.style.left = (r.right - m.offsetWidth) + 'px';
        else m.style.left = r.left + 'px';
        m.style.top = (r.bottom+5) + 'px';
    }
}

function toggleSizeMenu(btn) {
    const m = document.getElementById('size-dropdown');
    const isBlock = m.style.display === 'block';
    document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
    if (!isBlock) {
        const r = btn.getBoundingClientRect();
        m.style.left = r.left + 'px'; m.style.top = (r.bottom+5) + 'px';
        m.style.display = 'block';
    }
}

function toggleMarginsMenu(btn) {
    const m = document.getElementById('margins-dropdown');
    const isBlock = m.style.display === 'block';
    document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
    if (!isBlock) {
        const r = btn.getBoundingClientRect();
        m.style.left = r.left + 'px'; m.style.top = (r.bottom+5) + 'px';
        m.style.display = 'block';
    }
}

function toggleGuidesMenu(btn) {
    const m = document.getElementById('guides-dropdown');
    
    // Update Lock Guides checkmark
    const lockBtn = document.getElementById('lock-guides-btn');
    if (lockBtn) {
        lockBtn.innerHTML = (state.isGuidesLocked ? '<i class="fas fa-check" style="margin-right: 8px; width: 14px; text-align: center; color: var(--ui-theme-color);"></i> ' : '<i class="fas fa-lock" style="margin-right: 8px; width: 14px; text-align: center;"></i> ') + 'Lock Guides';
    }

    const isBlock = m.style.display === 'block';
    document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
    if (!isBlock) {
        const r = btn.getBoundingClientRect();
        m.style.left = r.left + 'px'; m.style.top = (r.bottom+5) + 'px';
        m.style.display = 'block';
    }
}

function createWrapper(htmlContent) {
    const el = document.createElement('div');
    el.className = 'pub-element';
    el.style.left = '50px';
    el.style.top = '50px';
    el.style.width = '200px';
    el.style.height = '100px';
    el.style.zIndex = 10;
    
    // Default scale
    el.setAttribute('data-scaleX', "1");
    el.setAttribute('data-scaleY', "1");
    
    let inner = htmlContent || '';
    if (state.spellCheck) {
        inner = inner.replace(/contenteditable="true"/g, 'contenteditable="true" spellcheck="true" lang="en"');
    } else {
        inner = inner.replace(/contenteditable="true"/g, 'contenteditable="true" spellcheck="false"');
    }
    
    el.innerHTML = `
        <div class="element-content">${inner}</div>
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
    paper.appendChild(el);
    selectElement(el);
    updateThumbnails();
    pushHistory();
    return el;
}

function toggleHeaderFooter(forceState) {
    if (typeof forceState === 'boolean') {
        state.headersVisible = forceState;
    } else {
        state.headersVisible = !state.headersVisible;
    }
    const hdr = paper.querySelector('.page-header');
    const ftr = paper.querySelector('.page-footer');
    if(state.headersVisible) {
        hdr.classList.add('visible');
        ftr.classList.add('visible');
    } else {
        hdr.classList.remove('visible');
        ftr.classList.remove('visible');
    }
}

function toggleCustomDropdown(type) {
    const id = type === 'ribbon' ? 'ribbon-font-list' : 'float-font-list';
    const menu = document.getElementById(id);
    const isVisible = menu.style.display === 'block';
    
    // Close others
    document.querySelectorAll('.custom-dropdown').forEach(d => d.style.display = 'none');
    
    if (!isVisible) {
        // Calculate position to prevent clipping in Ribbon overflow
        if(type === 'ribbon') {
            const btn = document.getElementById('ribbon-font-btn');
            const rect = btn.getBoundingClientRect();
            menu.style.left = rect.left + 'px';
            menu.style.top = (rect.bottom + 2) + 'px';
            // We must ensure the width matches or is appropriate
            menu.style.width = '200px'; 
        }
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}

function syncWordArt(el) {
    const text = el.querySelector('.wa-text');
    const wrapper = el.querySelector('.wa-wrapper');
    const content = el.querySelector('.element-content');
    if(!text) return;
    
    // Temporarily remove transform to measure its natural footprint
    text.style.transform = 'none';
    text.style.whiteSpace = 'nowrap'; // Keep it on one line
    
    // NEW: Force the containers to allow visual bleed (shadows, strokes) outside the box
    el.style.overflow = 'visible';
    if (content) content.style.overflow = 'visible';
    text.style.overflow = 'visible';
    
    // Ensure wrapper centers the scaled text perfectly within the padded area
    if (wrapper) {
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.overflow = 'visible'; // NEW: No clipping here either
    }
    
    // Keep the 4px padding on all sides (8px total) as a baseline buffer
    const cw = el.clientWidth - 8;
    const ch = el.clientHeight - 8;
    const tw = text.offsetWidth;
    const th = text.offsetHeight;
    
    if(tw > 0 && th > 0 && cw > 0 && ch > 0) {
        // Calculate the exact ratio to fill the inner padded box
        const scaleX = cw / tw;
        const scaleY = ch / th;
        text.style.transform = `scale(${scaleX}, ${scaleY})`;
    }
}

function initBasicBorders() {
    const dropdown = document.getElementById('border-dropdown');
    if (!dropdown) return;

    // --- 1. SPATIAL CLOAKING & TOGGLE FIX ---
    if (!window.borderSpatialCloakAdded) {
        
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('border-dropdown');
            if (menu && menu.style.display !== 'none' && !menu.contains(e.target) && !e.target.closest('.custom-color-picker')) {
                setTimeout(() => { menu.style.display = 'none'; }, 10);
            }
        }, true); 

        const toggleBorderIdentity = (shouldCloak) => {
            const b = document.getElementById('native-blueprint-border');
            if (!b) return;

            if (shouldCloak && b.dataset.cloaked !== 'true') {
                b.classList.remove('pub-element');
                b.removeAttribute('data-type');
                b.dataset.cloaked = 'true';
            } else if (!shouldCloak && b.dataset.cloaked === 'true') {
                b.classList.add('pub-element');
                b.setAttribute('data-type', 'shape');
                b.dataset.cloaked = 'false';
            }
        };

        ['mousemove', 'mousedown', 'touchstart'].forEach(evt => {
            document.addEventListener(evt, (e) => {
                const paper = document.getElementById('paper') || document.querySelector('.page.active') || document.querySelector('.page');
                if (paper && paper.contains(e.target)) {
                    toggleBorderIdentity(true);
                } else {
                    toggleBorderIdentity(false);
                }
            }, { passive: true, capture: true });
        });

        window.addEventListener('beforeprint', () => toggleBorderIdentity(false));
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) toggleBorderIdentity(false);
        }, { passive: true, capture: true });

        window.borderSpatialCloakAdded = true;
    }

    // --- 2. STRIP NATIVE PARENT STYLING ---
    dropdown.style.height = 'auto';
    dropdown.style.maxHeight = 'none';
    dropdown.style.overflow = 'visible';
    dropdown.style.background = 'transparent';
    dropdown.style.backgroundColor = 'transparent';
    dropdown.style.border = 'none';
    dropdown.style.boxShadow = 'none';
    dropdown.style.padding = '0';

    if (dropdown.dataset.ready === 'true') return;
    dropdown.dataset.ready = 'true';

    // Extracted full style block

    const presetColors = ['#000000', '#475569', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'];
    let swatchesHTML = `<div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:8px; margin-bottom:12px; justify-items:center;">`;
    presetColors.forEach(c => {
        swatchesHTML += `<div class="color-swatch" data-color="${c}" style="width:24px; height:24px; border-radius:50%; background:${c}; cursor:pointer; border:1px solid #cbd5e1; box-shadow:0 1px 2px rgba(0,0,0,0.1); transition:transform 0.1s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"></div>`;
    });
    swatchesHTML += `</div>`;

    dropdown.innerHTML = `<div id="border-menu-scroll-container" style="padding:15px; width:100%; box-sizing:border-box; background:white; border-radius:8px; border:2px solid var(--ui-theme-color); max-height:450px; overflow-y:auto; overflow-x:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.15);">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <label style="font-size:12px; font-weight:bold; color:#333;">Thickness</label>
                <span id="border-weight-label" style="font-size:12px; color:#666;">10px</span>
            </div>
            
            <input type="range" id="border-weight" min="1" max="50" value="10" style="width:100%; margin-bottom:15px; cursor:pointer; accent-color: var(--ui-theme-color);">
            
            <label style="font-size:12px; font-weight:bold; display:block; margin-bottom:10px; color:#333;">Color</label>
            ${swatchesHTML}
            <div id="custom-color-wrapper" style="position:relative; width:100%; height:32px; margin-bottom:20px; border-radius:6px; border:1px solid #cbd5e1; background-color:#000000; overflow:hidden; box-shadow:inset 0 1px 3px rgba(0,0,0,0.2); cursor:pointer;" onclick="CustomColorPicker.open(this, document.getElementById('border-color').value, (c) => { document.getElementById('border-color').value = c; document.getElementById('border-color').dispatchEvent(new Event('input', {bubbles:true})); })">
                <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; color:#ffffff; text-shadow:0px 1px 3px rgba(0,0,0,0.8); pointer-events:none;">Custom Color</div>
                <input type="hidden" id="border-color" value="#000000">
            </div>
            <label style="font-size:12px; font-weight:bold; display:block; margin-bottom:8px; color:#333;">Style (100)</label>
            <div id="border-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px;"></div>
        </div>`;

    const weightInput = document.getElementById('border-weight');
    const colorInput = document.getElementById('border-color');
    const colorWrapper = document.getElementById('custom-color-wrapper');
    const grid = document.getElementById('border-grid');

    const borderLibrary = [
        'None', 'Solid', 'Rounded', 'Capsule', 'Beveled', 'Plaque', 'Ticket', 
        'Dashed', 'Dotted', 'Dash-Dot', 'Dsh-Dt-Dt', 'Barcode', 'Blocky', 
        'Filmstrip', 'Double', 'Triple', 'Thk-Thn-Thk', 'Pinstripe', 'Dbl-Round', 
        'Dbl-Dash', 'Dbl-Dot', 'Frame', 'Elegant', 'Blueprint', 'Stitch', 
        'Shadow', 'Outset', 'Groove', 'Inset', 'Railway', 'Brackets', 'Deco', 
        'Morocco', 'Target', 'Crosshairs', 'Diamond', 'Quad', 'Penta', 
        'Thk-Thn', 'Thn-Thk', 'Echo', 'Neon', '3D-Inset', '3D-Outset', 
        'Double-Stitch', 'Triple-Dash', 'Morse', 'Zebra', 'Checkers', 'Corner-Only', 
        'Overhang', 'Offset', 'Cutout', 'Notch', 'Plus', 'X-Marks', 
        'Pins', 'Nails', 'Circles', 'Squares', 'Triangles', 'Hexagons', 
        'Octagons', 'Stars', 'Compass', 'Tape', 'Film-Round', 'Dotted-Double', 
        'Dotted-Triple', 'Grid-Corners', 'Hash-Corners', 'Bracket-Out',
        'Double-Dashed', 'Dash-Dot-Dot', 'Dash-Dot-Dot-Dot', 'Solid-Dashed', 'Dashed-Solid', 
        'Solid-Dotted', 'Dotted-Solid', 'Edge-TB', 'Edge-LR', 'Corner-Dots', 
        'Corner-Squares', 'Corner-Cross', 'Corner-Angles', 'Double-Corners', 'Bracket-In', 
        'Tape-Corners', 'Photo-Corners', 'T-Corners', 'Chevron-Corners', 'Star-Corners', 
        'Hex-Corners', 'Oct-Corners', 'Target-Corners', 'Deco-Dots', 'Deco-Dash', 
        'Dot-Grid', 'Cross-Hatch', 'Ultimate'
    ];

    // --- 3. THE PROPORTIONAL SCALING SVG ENGINE (100 Styles) ---
    function getBorderSVG(style, w, vW, vH, color) {
        if (style === 'None' || w === 0) return '';
        let r = '';
        const minDim = Math.min(vW, vH);
        
        if (style === 'Dashed') {
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${w * 3}, ${w * 2}"></rect>`;
        } else if (style === 'Dotted') {
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="0.1, ${w * 2}" stroke-linecap="round"></rect>`;
        } else if (style === 'Dash-Dot') {
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${w * 4}, ${w * 1.5}, ${w}, ${w * 1.5}"></rect>`;
        } else if (style === 'Dsh-Dt-Dt') {
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${w * 4}, ${w * 1.5}, ${w}, ${w * 1.5}, ${w}, ${w * 1.5}"></rect>`;
        } else if (style === 'Filmstrip') {
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${w}, ${w * 1.5}"></rect>`;
        } else if (style === 'Barcode') {
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${w*0.5}, ${w}, ${w*3}, ${w*2}, ${w}, ${w*0.5}, ${w*2}, ${w}"></rect>`;
        } else if (style === 'Blocky') {
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${w*6}, ${w*0.5}"></rect>`;
        } else if (style === 'Double') {
            const t = w / 3;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - (t*5)}" height="${vH - (t*5)}" fill="none" stroke="${color}" stroke-width="${t}"></rect>`;
        } else if (style === 'Triple') {
            const f = w / 5;
            r = `<rect x="${f/2}" y="${f/2}" width="${vW - f}" height="${vH - f}" fill="none" stroke="${color}" stroke-width="${f}"></rect>
                 <rect x="${f*2.5}" y="${f*2.5}" width="${vW - (f*5)}" height="${vH - (f*5)}" fill="none" stroke="${color}" stroke-width="${f}"></rect>
                 <rect x="${f*4.5}" y="${f*4.5}" width="${vW - (f*9)}" height="${vH - (f*9)}" fill="none" stroke="${color}" stroke-width="${f}"></rect>`;
        } else if (style === 'Thk-Thn-Thk') {
            const f = w / 7;
            r = `<rect x="${f}" y="${f}" width="${vW - f*2}" height="${vH - f*2}" fill="none" stroke="${color}" stroke-width="${f*2}"></rect>
                 <rect x="${f*3.5}" y="${f*3.5}" width="${vW - f*7}" height="${vH - f*7}" fill="none" stroke="${color}" stroke-width="${f}"></rect>
                 <rect x="${f*6}" y="${f*6}" width="${vW - f*12}" height="${vH - f*12}" fill="none" stroke="${color}" stroke-width="${f*2}"></rect>`;
        } else if (style === 'Rounded') {
            const rad = Math.min(Math.max(w * 1.5, 15), minDim/2);
            r = `<rect x="${w/2}" y="${w/2}" rx="${rad}" ry="${rad}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}"></rect>`;
        } else if (style === 'Capsule') {
            const rad = minDim/2;
            r = `<rect x="${w/2}" y="${w/2}" rx="${rad}" ry="${rad}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}"></rect>`;
        } else if (style === 'Dbl-Round') {
            const t = w / 3;
            const rOut = Math.min(Math.max(w * 1.5, 15), minDim/2);
            const rIn = Math.max(rOut - (t*2), 2);
            r = `<rect x="${t/2}" y="${t/2}" rx="${rOut}" ry="${rOut}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" rx="${rIn}" ry="${rIn}" width="${vW - (t*5)}" height="${vH - (t*5)}" fill="none" stroke="${color}" stroke-width="${t}"></rect>`;
        } else if (style === 'Frame') {
            const thk = w * 0.7;
            const thn = w * 0.15;
            const gp = w * 0.15;
            r = `<rect x="${thk/2}" y="${thk/2}" width="${vW - thk}" height="${vH - thk}" fill="none" stroke="${color}" stroke-width="${thk}"></rect>
                 <rect x="${thk + gp + thn/2}" y="${thk + gp + thn/2}" width="${vW - (thk*2) - (gp*2) - thn}" height="${vH - (thk*2) - (gp*2) - thn}" fill="none" stroke="${color}" stroke-width="${thn}"></rect>`;
        } else if (style === 'Elegant') {
            const thn = w * 0.15;
            const thk = w * 0.7;
            const gp = w * 0.15;
            r = `<rect x="${thn/2}" y="${thn/2}" width="${vW - thn}" height="${vH - thn}" fill="none" stroke="${color}" stroke-width="${thn}"></rect>
                 <rect x="${thn + gp + thk/2}" y="${thn + gp + thk/2}" width="${vW - (thn*2) - (gp*2) - thk}" height="${vH - (thn*2) - (gp*2) - thk}" fill="none" stroke="${color}" stroke-width="${thk}"></rect>`;
        } else if (style === 'Blueprint') {
            const thn = w * 0.15;
            const thk = w * 0.7;
            const gp = w * 0.15;
            r = `<rect x="${thn/2}" y="${thn/2}" width="${vW - thn}" height="${vH - thn}" fill="none" stroke="${color}" stroke-width="${thn}"></rect>
                 <rect x="${thn + gp + thk/2}" y="${thn + gp + thk/2}" width="${vW - (thn*2) - (gp*2) - thk}" height="${vH - (thn*2) - (gp*2) - thk}" fill="none" stroke="${color}" stroke-width="${thk}" stroke-dasharray="${thk*3}, ${thk*2}"></rect>`;
        } else if (style === 'Pinstripe') {
            const th = w / 9; 
            for(let i=0; i<5; i++) {
                let off = (th * 2 * i) + th/2;
                r += `<rect x="${off}" y="${off}" width="${vW - off*2}" height="${vH - off*2}" fill="none" stroke="${color}" stroke-width="${th}"></rect>`;
            }
        } else if (style === 'Stitch') {
            const sol = w * 0.4;
            const gp = w * 0.4;
            const dsh = w * 0.2;
            r = `<rect x="${sol/2}" y="${sol/2}" width="${vW - sol}" height="${vH - sol}" fill="none" stroke="${color}" stroke-width="${sol}"></rect>
                 <rect x="${sol + gp + dsh/2}" y="${sol + gp + dsh/2}" width="${vW - (sol*2) - (gp*2) - dsh}" height="${vH - (sol*2) - (gp*2) - dsh}" fill="none" stroke="${color}" stroke-width="${dsh}" stroke-dasharray="${dsh * 3}, ${dsh * 2}"></rect>`;
        } else if (style === 'Beveled') {
            const b = Math.min(Math.max(w * 1.5, 15), minDim/2.5);
            const pts = `${b},${w/2} ${vW - b},${w/2} ${vW - w/2},${b} ${vW - w/2},${vH - b} ${vW - b},${vH - w/2} ${b},${vH - w/2} ${w/2},${vH - b} ${w/2},${b}`;
            r = `<polygon points="${pts}" fill="none" stroke="${color}" stroke-width="${w}" />`;
        } else if (style === 'Plaque') {
            const c = Math.min(Math.max(w * 2, 12), minDim/2.5);
            r = `<path d="M ${c},${w/2} L ${vW-c},${w/2} L ${vW-c},${c} L ${vW-w/2},${c} L ${vW-w/2},${vH-c} L ${vW-c},${vH-c} L ${vW-c},${vH-w/2} L ${c},${vH-w/2} L ${c},${vH-c} L ${w/2},${vH-c} L ${w/2},${c} L ${c},${c} Z" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="miter" />`;
        } else if (style === 'Ticket') {
            const c = Math.min(Math.max(w * 2, 12), minDim/2.5);
            r = `<path d="M ${c},${w/2} L ${vW-c},${w/2} A ${c} ${c} 0 0 1 ${vW-w/2} ${c} L ${vW-w/2},${vH-c} A ${c} ${c} 0 0 1 ${vW-c} ${vH-w/2} L ${c},${vH-w/2} A ${c} ${c} 0 0 1 ${w/2} ${vH-c} L ${w/2},${c} A ${c} ${c} 0 0 1 ${c} ${w/2} Z" fill="none" stroke="${color}" stroke-width="${w}" />`;
        } else if (style === 'Shadow') {
            r = `<rect x="${w}" y="${w}" width="${vW - w}" height="${vH - w}" fill="none" stroke="#cbd5e1" stroke-width="${w}"></rect>
                 <rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}"></rect>`;
        } else if (style === 'Outset') {
            r = `<polyline points="${w/2},${vH-w/2} ${w/2},${w/2} ${vW-w/2},${w/2}" fill="none" stroke="${color}" stroke-width="${w}" opacity="0.4" />
                 <polyline points="${vW-w/2},${w/2} ${vW-w/2},${vH-w/2} ${w/2},${vH-w/2}" fill="none" stroke="${color}" stroke-width="${w}" opacity="1" />`;
        } else if (style === 'Groove') {
            const h = w/2;
            r = `<polyline points="${h/2},${vH-h/2} ${h/2},${h/2} ${vW-h/2},${h/2}" fill="none" stroke="${color}" stroke-width="${h}" opacity="0.4" />
                 <polyline points="${vW-h/2},${h/2} ${vW-h/2},${vH-h/2} ${h/2},${vH-h/2}" fill="none" stroke="${color}" stroke-width="${h}" />
                 <polyline points="${h + h/2},${vH-h-h/2} ${h + h/2},${h + h/2} ${vW-h-h/2},${h + h/2}" fill="none" stroke="${color}" stroke-width="${h}" />
                 <polyline points="${vW-h-h/2},${h + h/2} ${vW-h-h/2},${vH-h-h/2} ${h + h/2},${vH-h-h/2}" fill="none" stroke="${color}" stroke-width="${h}" opacity="0.4" />`;
        } else if (style === 'Inset') {
            r = `<polyline points="${w/2},${vH-w/2} ${w/2},${w/2} ${vW-w/2},${w/2}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${vW-w/2},${w/2} ${vW-w/2},${vH-w/2} ${w/2},${vH-w/2}" fill="none" stroke="${color}" stroke-width="${w}" opacity="0.3" />`;
        } else if (style === 'Railway') {
            const o = w * 0.15;
            const c = w * 0.7;
            r = `<rect x="${o/2}" y="${o/2}" width="${vW - o}" height="${vH - o}" fill="none" stroke="${color}" stroke-width="${o}"></rect>
                 <rect x="${o + c + o/2}" y="${o + c + o/2}" width="${vW - (o*2) - (c*2) - o}" height="${vH - (o*2) - (c*2) - o}" fill="none" stroke="${color}" stroke-width="${o}"></rect>
                 <rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${w*0.5}, ${w*1.5}"></rect>`;
        } else if (style === 'Brackets') {
            const c = Math.min(Math.max(w * 3, 20), minDim/2.5); 
            r = `<polyline points="${w/2},${w/2 + c} ${w/2},${w/2} ${w/2 + c},${w/2}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${vW - w/2 - c},${w/2} ${vW - w/2},${w/2} ${vW - w/2},${w/2 + c}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${vW - w/2},${vH - w/2 - c} ${vW - w/2},${vH - w/2} ${vW - w/2 - c},${vH - w/2}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${w/2},${vH - w/2 - c} ${w/2},${vH - w/2} ${w/2 + c},${vH - w/2}" fill="none" stroke="${color}" stroke-width="${w}" />`;
        } else if (style === 'Deco') {
            const t = Math.max(w * 0.15, 1);
            const g1 = w * 0.5;
            const g2 = w * 0.2;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <rect x="${t + g1 + t/2}" y="${t + g1 + t/2}" width="${vW - (t*2 + g1*2) - t}" height="${vH - (t*2 + g1*2) - t}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <rect x="${t*2 + g1 + g2 + t/2}" y="${t*2 + g1 + g2 + t/2}" width="${vW - (t*4 + g1*2 + g2*2) - t}" height="${vH - (t*4 + g1*2 + g2*2) - t}" fill="none" stroke="${color}" stroke-width="${t}"></rect>`;
        } else if (style === 'Morocco') {
            const c = Math.min(Math.max(w * 2, 15), minDim/2.5);
            r = `<rect x="${w/2}" y="${w/2}" width="${vW-w}" height="${vH-w}" fill="none" stroke="${color}" stroke-width="${w*0.2}" />
                 <rect x="${w*0.2}" y="${w*0.2}" width="${c}" height="${c}" fill="none" stroke="${color}" stroke-width="${w*0.4}" />
                 <rect x="${vW-c-w*0.2}" y="${w*0.2}" width="${c}" height="${c}" fill="none" stroke="${color}" stroke-width="${w*0.4}" />
                 <rect x="${w*0.2}" y="${vH-c-w*0.2}" width="${c}" height="${c}" fill="none" stroke="${color}" stroke-width="${w*0.4}" />
                 <rect x="${vW-c-w*0.2}" y="${vH-c-w*0.2}" width="${c}" height="${c}" fill="none" stroke="${color}" stroke-width="${w*0.4}" />`;
        } else if (style === 'Target') {
            const c = Math.min(Math.max(w * 2, 12), minDim / 2.5);
            r = `<rect x="${c}" y="${c}" width="${vW-c*2}" height="${vH-c*2}" fill="none" stroke="${color}" stroke-width="${w*0.2}" />
                 <circle cx="${c}" cy="${c}" r="${c - w*0.2}" fill="none" stroke="${color}" stroke-width="${w*0.4}" />
                 <circle cx="${vW-c}" cy="${c}" r="${c - w*0.2}" fill="none" stroke="${color}" stroke-width="${w*0.4}" />
                 <circle cx="${c}" cy="${vH-c}" r="${c - w*0.2}" fill="none" stroke="${color}" stroke-width="${w*0.4}" />
                 <circle cx="${vW-c}" cy="${vH-c}" r="${c - w*0.2}" fill="none" stroke="${color}" stroke-width="${w*0.4}" />`;
        } else if (style === 'Crosshairs') {
            const c = Math.min(Math.max(w * 2, 15), minDim / 2.5);
            r = `<rect x="${c}" y="${c}" width="${vW-c*2}" height="${vH-c*2}" fill="none" stroke="${color}" stroke-width="${w*0.2}" />
                 <path d="M ${c},${0} L ${c},${c*2} M ${0},${c} L ${c*2},${c}" stroke="${color}" stroke-width="${w*0.4}" />
                 <path d="M ${vW-c},${0} L ${vW-c},${c*2} M ${vW-c*2},${c} L ${vW},${c}" stroke="${color}" stroke-width="${w*0.4}" />
                 <path d="M ${vW-c},${vH-c*2} L ${vW-c},${vH} M ${vW-c*2},${vH-c} L ${vW},${vH-c}" stroke="${color}" stroke-width="${w*0.4}" />
                 <path d="M ${c},${vH-c*2} L ${c},${vH} M ${0},${vH-c} L ${c*2},${vH-c}" stroke="${color}" stroke-width="${w*0.4}" />`;
        } else if (style === 'Diamond') {
            const c = Math.min(Math.max(w * 1.5, 12), minDim / 2.5);
            r = `<rect x="${c}" y="${c}" width="${vW-c*2}" height="${vH-c*2}" fill="none" stroke="${color}" stroke-width="${w*0.2}" />
                 <polygon points="${c},${0} ${c*2},${c} ${c},${c*2} ${0},${c}" fill="white" stroke="${color}" stroke-width="${w*0.3}" />
                 <polygon points="${vW-c},${0} ${vW},${c} ${vW-c},${c*2} ${vW-c*2},${c}" fill="white" stroke="${color}" stroke-width="${w*0.3}" />
                 <polygon points="${vW-c},${vH-c*2} ${vW},${vH-c} ${vW-c},${vH} ${vW-c*2},${vH-c}" fill="white" stroke="${color}" stroke-width="${w*0.3}" />
                 <polygon points="${c},${vH-c*2} ${c*2},${vH-c} ${c},${vH} ${0},${vH-c}" fill="white" stroke="${color}" stroke-width="${w*0.3}" />`;
        } else if (style === 'Quad') {
            const t = w / 7;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - (t*5)}" height="${vH - (t*5)}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <rect x="${t*4.5}" y="${t*4.5}" width="${vW - (t*9)}" height="${vH - (t*9)}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <rect x="${t*6.5}" y="${t*6.5}" width="${vW - (t*13)}" height="${vH - (t*13)}" fill="none" stroke="${color}" stroke-width="${t}"></rect>`;
        } else if (style === 'Penta') {
            const t = w / 9;
            for(let i=0; i<5; i++) {
                let o = (t*2*i) + t/2;
                r += `<rect x="${o}" y="${o}" width="${vW - o*2}" height="${vH - o*2}" fill="none" stroke="${color}" stroke-width="${t}"></rect>`;
            }
        } else if (style === 'Thk-Thn') {
            const tk = w * 0.75, tn = w * 0.15, gp = w * 0.1;
            r = `<rect x="${tk/2}" y="${tk/2}" width="${vW - tk}" height="${vH - tk}" fill="none" stroke="${color}" stroke-width="${tk}"></rect>
                 <rect x="${tk + gp + tn/2}" y="${tk + gp + tn/2}" width="${vW - (tk*2) - (gp*2) - tn}" height="${vH - (tk*2) - (gp*2) - tn}" fill="none" stroke="${color}" stroke-width="${tn}"></rect>`;
        } else if (style === 'Thn-Thk') {
            const tn = w * 0.15, tk = w * 0.75, gp = w * 0.1;
            r = `<rect x="${tn/2}" y="${tn/2}" width="${vW - tn}" height="${vH - tn}" fill="none" stroke="${color}" stroke-width="${tn}"></rect>
                 <rect x="${tn + gp + tk/2}" y="${tn + gp + tk/2}" width="${vW - (tn*2) - (gp*2) - tk}" height="${vH - (tn*2) - (gp*2) - tk}" fill="none" stroke="${color}" stroke-width="${tk}"></rect>`;
        } else if (style === 'Echo') {
            const t = w / 4;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}" opacity="1"></rect>
                 <rect x="${t*1.5}" y="${t*1.5}" width="${vW - (t*3)}" height="${vH - (t*3)}" fill="none" stroke="${color}" stroke-width="${t}" opacity="0.6"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - (t*5)}" height="${vH - (t*5)}" fill="none" stroke="${color}" stroke-width="${t}" opacity="0.3"></rect>
                 <rect x="${t*3.5}" y="${t*3.5}" width="${vW - (t*7)}" height="${vH - (t*7)}" fill="none" stroke="${color}" stroke-width="${t}" opacity="0.1"></rect>`;
        } else if (style === 'Neon') {
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}" opacity="0.2"></rect>
                 <rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w*0.5}" opacity="0.5"></rect>
                 <rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w*0.15}" opacity="1"></rect>`;
        } else if (style === '3D-Inset') {
            r = `<polyline points="${w},${vH-w} ${w},${w} ${vW-w},${w}" fill="none" stroke="${color}" stroke-width="${w}" opacity="0.3"></polyline>
                 <polyline points="${vW-w},${w} ${vW-w},${vH-w} ${w},${vH-w}" fill="none" stroke="${color}" stroke-width="${w}" opacity="0.8"></polyline>`;
        } else if (style === '3D-Outset') {
            r = `<polyline points="${w},${vH-w} ${w},${w} ${vW-w},${w}" fill="none" stroke="${color}" stroke-width="${w}" opacity="0.8"></polyline>
                 <polyline points="${vW-w},${w} ${vW-w},${vH-w} ${w},${vH-w}" fill="none" stroke="${color}" stroke-width="${w}" opacity="0.3"></polyline>`;
        } else if (style === 'Double-Stitch') {
            const t = w / 3;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="${t*2}, ${t*2}"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - (t*5)}" height="${vH - (t*5)}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="${t*2}, ${t*2}" stroke-dashoffset="${t*2}"></rect>`;
        } else if (style === 'Triple-Dash') {
            const t = w / 5;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="${t*3}, ${t*2}"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - (t*5)}" height="${vH - (t*5)}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="${t*3}, ${t*2}" stroke-dashoffset="${t}"></rect>
                 <rect x="${t*4.5}" y="${t*4.5}" width="${vW - (t*9)}" height="${vH - (t*9)}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="${t*3}, ${t*2}" stroke-dashoffset="${t*2}"></rect>`;
        } else if (style === 'Morse') {
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${w * 4}, ${w}, ${w}, ${w}"></rect>`;
        } else if (style === 'Zebra') {
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${w * 3}, ${w * 3}"></rect>`;
        } else if (style === 'Checkers') {
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}" opacity="0.3"></rect>
                 <rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${w * 2}, ${w * 2}"></rect>`;
        } else if (style === 'Corner-Only') {
            const c = Math.min(Math.max(w * 4, 25), minDim / 3);
            r = `<polyline points="${w/2},${c} ${w/2},${w/2} ${c},${w/2}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${vW-c},${w/2} ${vW-w/2},${w/2} ${vW-w/2},${c}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${w/2},${vH-c} ${w/2},${vH-w/2} ${c},${vH-w/2}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${vW-c},${vH-w/2} ${vW-w/2},${vH-w/2} ${vW-w/2},${vH-c}" fill="none" stroke="${color}" stroke-width="${w}" />`;
        } else if (style === 'Overhang') {
            const c = Math.min(Math.max(w * 2, 10), minDim / 4);
            r = `<line x1="0" y1="${c}" x2="${vW}" y2="${c}" stroke="${color}" stroke-width="${w*0.5}" />
                 <line x1="0" y1="${vH-c}" x2="${vW}" y2="${vH-c}" stroke="${color}" stroke-width="${w*0.5}" />
                 <line x1="${c}" y1="0" x2="${c}" y2="${vH}" stroke="${color}" stroke-width="${w*0.5}" />
                 <line x1="${vW-c}" y1="0" x2="${vW-c}" y2="${vH}" stroke="${color}" stroke-width="${w*0.5}" />`;
        } else if (style === 'Offset') {
            const t = w / 2;
            r = `<rect x="${0}" y="${0}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <rect x="${t}" y="${t}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}" opacity="0.5"></rect>`;
        } else if (style === 'Cutout') {
            const c = Math.min(Math.max(w * 2, 15), minDim/3);
            const mx = vW/2; const my = vH/2;
            r = `<path d="M ${c},${w/2} L ${mx-c},${w/2} A ${c} ${c} 0 0 0 ${mx+c} ${w/2} L ${vW-c},${w/2} L ${vW-w/2},${c} L ${vW-w/2},${my-c} A ${c} ${c} 0 0 0 ${vW-w/2} ${my+c} L ${vW-w/2},${vH-c} L ${vW-c},${vH-w/2} L ${mx+c},${vH-w/2} A ${c} ${c} 0 0 0 ${mx-c} ${vH-w/2} L ${c},${vH-w/2} L ${w/2},${vH-c} L ${w/2},${my+c} A ${c} ${c} 0 0 0 ${w/2} ${my-c} L ${w/2},${c} Z" fill="none" stroke="${color}" stroke-width="${w}" />`;
        } else if (style === 'Notch') {
            const c = Math.min(Math.max(w * 2, 15), minDim/3);
            const mx = vW/2; const my = vH/2;
            r = `<path d="M ${c},${w/2} L ${mx-c},${w/2} L ${mx},${w/2+c} L ${mx+c},${w/2} L ${vW-c},${w/2} L ${vW-w/2},${c} L ${vW-w/2},${my-c} L ${vW-w/2-c},${my} L ${vW-w/2},${my+c} L ${vW-w/2},${vH-c} L ${vW-c},${vH-w/2} L ${mx+c},${vH-w/2} L ${mx},${vH-w/2-c} L ${mx-c},${vH-w/2} L ${c},${vH-w/2} L ${w/2},${vH-c} L ${w/2},${my+c} L ${w/2+c},${my} L ${w/2},${my-c} L ${w/2},${c} Z" fill="none" stroke="${color}" stroke-width="${w}" />`;
        } else if (style === 'Plus') {
            const c = Math.min(Math.max(w * 2, 12), minDim/3);
            const t = w * 0.3;
            r = `<rect x="${c}" y="${c}" width="${vW-c*2}" height="${vH-c*2}" fill="none" stroke="${color}" stroke-width="${t}" />
                 <path d="M ${c/2},${c} L ${c*1.5},${c} M ${c},${c/2} L ${c},${c*1.5}" stroke="${color}" stroke-width="${w*0.6}" />
                 <path d="M ${vW-c*1.5},${c} L ${vW-c/2},${c} M ${vW-c},${c/2} L ${vW-c},${c*1.5}" stroke="${color}" stroke-width="${w*0.6}" />
                 <path d="M ${c/2},${vH-c} L ${c*1.5},${vH-c} M ${c},${vH-c*1.5} L ${c},${vH-c/2}" stroke="${color}" stroke-width="${w*0.6}" />
                 <path d="M ${vW-c*1.5},${vH-c} L ${vW-c/2},${vH-c} M ${vW-c},${vH-c*1.5} L ${vW-c},${vH-c/2}" stroke="${color}" stroke-width="${w*0.6}" />`;
        } else if (style === 'X-Marks') {
            const c = Math.min(Math.max(w * 2, 12), minDim/3);
            const t = w * 0.3; const d = c/2;
            r = `<rect x="${c}" y="${c}" width="${vW-c*2}" height="${vH-c*2}" fill="none" stroke="${color}" stroke-width="${t}" />
                 <path d="M ${c-d},${c-d} L ${c+d},${c+d} M ${c-d},${c+d} L ${c+d},${c-d}" stroke="${color}" stroke-width="${w*0.6}" />
                 <path d="M ${vW-c-d},${c-d} L ${vW-c+d},${c+d} M ${vW-c-d},${c+d} L ${vW-c+d},${c-d}" stroke="${color}" stroke-width="${w*0.6}" />
                 <path d="M ${c-d},${vH-c-d} L ${c+d},${vH-c+d} M ${c-d},${vH-c+d} L ${c+d},${vH-c-d}" stroke="${color}" stroke-width="${w*0.6}" />
                 <path d="M ${vW-c-d},${vH-c-d} L ${vW-c+d},${vH-c+d} M ${vW-c-d},${vH-c+d} L ${vW-c+d},${vH-c-d}" stroke="${color}" stroke-width="${w*0.6}" />`;
        } else if (style === 'Pins') {
            const c = Math.min(Math.max(w * 2, 12), minDim/3);
            r = `<rect x="${c}" y="${c}" width="${vW-c*2}" height="${vH-c*2}" fill="none" stroke="${color}" stroke-width="${w*0.3}" />
                 <circle cx="${c}" cy="${c}" r="${w*0.8}" fill="${color}" />
                 <circle cx="${vW-c}" cy="${c}" r="${w*0.8}" fill="${color}" />
                 <circle cx="${c}" cy="${vH-c}" r="${w*0.8}" fill="${color}" />
                 <circle cx="${vW-c}" cy="${vH-c}" r="${w*0.8}" fill="${color}" />`;
        } else if (style === 'Nails') {
            const c = Math.min(Math.max(w * 2, 12), minDim/3);
            const s = w * 1.5;
            r = `<rect x="${c}" y="${c}" width="${vW-c*2}" height="${vH-c*2}" fill="none" stroke="${color}" stroke-width="${w*0.3}" />
                 <rect x="${c-s/2}" y="${c-s/2}" width="${s}" height="${s}" fill="${color}" />
                 <rect x="${vW-c-s/2}" y="${c-s/2}" width="${s}" height="${s}" fill="${color}" />
                 <rect x="${c-s/2}" y="${vH-c-s/2}" width="${s}" height="${s}" fill="${color}" />
                 <rect x="${vW-c-s/2}" y="${vH-c-s/2}" width="${s}" height="${s}" fill="${color}" />`;
        } else if (style === 'Circles') {
            const c = Math.min(Math.max(w * 3, 15), minDim/3);
            r = `<rect x="${c}" y="${c}" width="${vW-c*2}" height="${vH-c*2}" fill="none" stroke="${color}" stroke-width="${w*0.5}" />
                 <circle cx="${c}" cy="${c}" r="${c-w/2}" fill="white" stroke="${color}" stroke-width="${w*0.5}" />
                 <circle cx="${vW-c}" cy="${c}" r="${c-w/2}" fill="white" stroke="${color}" stroke-width="${w*0.5}" />
                 <circle cx="${c}" cy="${vH-c}" r="${c-w/2}" fill="white" stroke="${color}" stroke-width="${w*0.5}" />
                 <circle cx="${vW-c}" cy="${vH-c}" r="${c-w/2}" fill="white" stroke="${color}" stroke-width="${w*0.5}" />`;
        } else if (style === 'Squares') {
            const c = Math.min(Math.max(w * 3, 15), minDim/3);
            const s = (c-w/2)*2;
            r = `<rect x="${c}" y="${c}" width="${vW-c*2}" height="${vH-c*2}" fill="none" stroke="${color}" stroke-width="${w*0.5}" />
                 <rect x="${c-s/2}" y="${c-s/2}" width="${s}" height="${s}" fill="white" stroke="${color}" stroke-width="${w*0.5}" />
                 <rect x="${vW-c-s/2}" y="${c-s/2}" width="${s}" height="${s}" fill="white" stroke="${color}" stroke-width="${w*0.5}" />
                 <rect x="${c-s/2}" y="${vH-c-s/2}" width="${s}" height="${s}" fill="white" stroke="${color}" stroke-width="${w*0.5}" />
                 <rect x="${vW-c-s/2}" y="${vH-c-s/2}" width="${s}" height="${s}" fill="white" stroke="${color}" stroke-width="${w*0.5}" />`;
        } else if (style === 'Triangles') {
            const c = Math.min(Math.max(w * 3, 15), minDim/3);
            r = `<rect x="${c}" y="${c}" width="${vW-c*2}" height="${vH-c*2}" fill="none" stroke="${color}" stroke-width="${w*0.5}" />
                 <polygon points="${w/2},${w/2} ${c*2},${w/2} ${w/2},${c*2}" fill="white" stroke="${color}" stroke-width="${w*0.5}" />
                 <polygon points="${vW-w/2},${w/2} ${vW-c*2},${w/2} ${vW-w/2},${c*2}" fill="white" stroke="${color}" stroke-width="${w*0.5}" />
                 <polygon points="${w/2},${vH-w/2} ${c*2},${vH-w/2} ${w/2},${vH-c*2}" fill="white" stroke="${color}" stroke-width="${w*0.5}" />
                 <polygon points="${vW-w/2},${vH-w/2} ${vW-c*2},${vH-w/2} ${vW-w/2},${vH-c*2}" fill="white" stroke="${color}" stroke-width="${w*0.5}" />`;
        } else if (style === 'Hexagons') {
            const c = Math.min(Math.max(w * 2.5, 12), minDim/3);
            const d = c * 0.6;
            const hex = (cx, cy) => `<polygon points="${cx},${cy-c} ${cx+d},${cy-d} ${cx+d},${cy+d} ${cx},${cy+c} ${cx-d},${cy+d} ${cx-d},${cy-d}" fill="white" stroke="${color}" stroke-width="${w*0.5}" />`;
            r = `<rect x="${c}" y="${c}" width="${vW-c*2}" height="${vH-c*2}" fill="none" stroke="${color}" stroke-width="${w*0.5}" />
                 ${hex(c, c)} ${hex(vW-c, c)} ${hex(c, vH-c)} ${hex(vW-c, vH-c)}`;
        } else if (style === 'Octagons') {
            const c = Math.min(Math.max(w * 2.5, 12), minDim/3);
            const d = c * 0.7; const e = c * 0.4;
            const oct = (cx, cy) => `<polygon points="${cx-e},${cy-d} ${cx+e},${cy-d} ${cx+d},${cy-e} ${cx+d},${cy+e} ${cx+e},${cy+d} ${cx-e},${cy+d} ${cx-d},${cy+e} ${cx-d},${cy-e}" fill="white" stroke="${color}" stroke-width="${w*0.5}" />`;
            r = `<rect x="${c}" y="${c}" width="${vW-c*2}" height="${vH-c*2}" fill="none" stroke="${color}" stroke-width="${w*0.5}" />
                 ${oct(c, c)} ${oct(vW-c, c)} ${oct(c, vH-c)} ${oct(vW-c, vH-c)}`;
        } else if (style === 'Stars') {
            const c = Math.min(Math.max(w * 2.5, 12), minDim/3);
            const d = c * 0.3;
            const star = (cx, cy) => `<polygon points="${cx},${cy-c} ${cx+d},${cy-d} ${cx+c},${cy} ${cx+d},${cy+d} ${cx},${cy+c} ${cx-d},${cy+d} ${cx-c},${cy} ${cx-d},${cy-d}" fill="white" stroke="${color}" stroke-width="${w*0.5}" />`;
            r = `<rect x="${c}" y="${c}" width="${vW-c*2}" height="${vH-c*2}" fill="none" stroke="${color}" stroke-width="${w*0.5}" />
                 ${star(c, c)} ${star(vW-c, c)} ${star(c, vH-c)} ${star(vW-c, vH-c)}`;
        } else if (style === 'Compass') {
            const c = Math.min(Math.max(w * 2, 12), minDim/3);
            r = `<rect x="${c}" y="${c}" width="${vW-c*2}" height="${vH-c*2}" fill="none" stroke="${color}" stroke-width="${w*0.5}" />
                 <path d="M ${w/2},${w/2} L ${c*2},${c*2} M ${c*2},${w/2} L ${w/2},${c*2}" stroke="${color}" stroke-width="${w*0.6}" />
                 <path d="M ${vW-c*2},${w/2} L ${vW-w/2},${c*2} M ${vW-w/2},${w/2} L ${vW-c*2},${c*2}" stroke="${color}" stroke-width="${w*0.6}" />
                 <path d="M ${w/2},${vH-c*2} L ${c*2},${vH-w/2} M ${c*2},${vH-c*2} L ${w/2},${vH-w/2}" stroke="${color}" stroke-width="${w*0.6}" />
                 <path d="M ${vW-c*2},${vH-c*2} L ${vW-w/2},${vH-w/2} M ${vW-w/2},${vH-c*2} L ${vW-c*2},${vH-w/2}" stroke="${color}" stroke-width="${w*0.6}" />`;
        } else if (style === 'Tape') {
            const c = Math.min(Math.max(w * 3, 15), minDim/3);
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w*0.3}"></rect>
                 <polygon points="${0},${c} ${c},${0} ${c*1.5},${0} ${0},${c*1.5}" fill="${color}" opacity="0.7" />
                 <polygon points="${vW},${c} ${vW-c},${0} ${vW-c*1.5},${0} ${vW},${c*1.5}" fill="${color}" opacity="0.7" />
                 <polygon points="${0},${vH-c} ${c},${vH} ${c*1.5},${vH} ${0},${vH-c*1.5}" fill="${color}" opacity="0.7" />
                 <polygon points="${vW},${vH-c} ${vW-c},${vH} ${vW-c*1.5},${vH} ${vW},${vH-c*1.5}" fill="${color}" opacity="0.7" />`;
        } else if (style === 'Film-Round') {
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}"></rect>
                 <rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="white" stroke-width="${w*0.4}" stroke-dasharray="0.1, ${w*1.5}" stroke-linecap="round"></rect>`;
        } else if (style === 'Dotted-Double') {
            const t = w / 3;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="0.1, ${t*2}" stroke-linecap="round"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - (t*5)}" height="${vH - (t*5)}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="0.1, ${t*2}" stroke-linecap="round" stroke-dashoffset="${t}"></rect>`;
        } else if (style === 'Dotted-Triple') {
            const t = w / 5;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="0.1, ${t*2}" stroke-linecap="round"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - (t*5)}" height="${vH - (t*5)}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="0.1, ${t*2}" stroke-linecap="round" stroke-dashoffset="${t}"></rect>
                 <rect x="${t*4.5}" y="${t*4.5}" width="${vW - (t*9)}" height="${vH - (t*9)}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="0.1, ${t*2}" stroke-linecap="round"></rect>`;
        } else if (style === 'Grid-Corners') {
            const c = Math.min(Math.max(w * 3, 15), minDim/3);
            const t = w * 0.3;
            r = `<rect x="${c}" y="${c}" width="${vW - c*2}" height="${vH - c*2}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <path d="M ${c/3},${0} L ${c/3},${c} M ${c*0.66},${0} L ${c*0.66},${c} M ${0},${c/3} L ${c},${c/3} M ${0},${c*0.66} L ${c},${c*0.66}" stroke="${color}" stroke-width="${t}" />
                 <path d="M ${vW-c/3},${0} L ${vW-c/3},${c} M ${vW-c*0.66},${0} L ${vW-c*0.66},${c} M ${vW-c},${c/3} L ${vW},${c/3} M ${vW-c},${c*0.66} L ${vW},${c*0.66}" stroke="${color}" stroke-width="${t}" />
                 <path d="M ${c/3},${vH-c} L ${c/3},${vH} M ${c*0.66},${vH-c} L ${c*0.66},${vH} M ${0},${vH-c/3} L ${c},${vH-c/3} M ${0},${vH-c*0.66} L ${c},${vH-c*0.66}" stroke="${color}" stroke-width="${t}" />
                 <path d="M ${vW-c/3},${vH-c} L ${vW-c/3},${vH} M ${vW-c*0.66},${vH-c} L ${vW-c*0.66},${vH} M ${vW-c},${vH-c/3} L ${vW},${vH-c/3} M ${vW-c},${vH-c*0.66} L ${vW},${vH-c*0.66}" stroke="${color}" stroke-width="${t}" />`;
        } else if (style === 'Hash-Corners') {
            const c = Math.min(Math.max(w * 3, 15), minDim/3);
            const t = w * 0.3;
            r = `<rect x="${c}" y="${c}" width="${vW - c*2}" height="${vH - c*2}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <path d="M ${0},${c*0.33} L ${c*0.33},${0} M ${0},${c*0.66} L ${c*0.66},${0} M ${0},${c} L ${c},${0} M ${c*0.33},${c} L ${c},${c*0.33} M ${c*0.66},${c} L ${c},${c*0.66}" stroke="${color}" stroke-width="${t}" />
                 <path d="M ${vW},${c*0.33} L ${vW-c*0.33},${0} M ${vW},${c*0.66} L ${vW-c*0.66},${0} M ${vW},${c} L ${vW-c},${0} M ${vW-c*0.33},${c} L ${vW-c},${c*0.33} M ${vW-c*0.66},${c} L ${vW-c},${c*0.66}" stroke="${color}" stroke-width="${t}" />
                 <path d="M ${0},${vH-c*0.33} L ${c*0.33},${vH} M ${0},${vH-c*0.66} L ${c*0.66},${vH} M ${0},${vH-c} L ${c},${vH} M ${c*0.33},${vH-c} L ${c},${vH-c*0.33} M ${c*0.66},${vH-c} L ${c},${vH-c*0.66}" stroke="${color}" stroke-width="${t}" />
                 <path d="M ${vW},${vH-c*0.33} L ${vW-c*0.33},${vH} M ${vW},${vH-c*0.66} L ${vW-c*0.66},${vH} M ${vW},${vH-c} L ${vW-c},${vH} M ${vW-c*0.33},${vH-c} L ${vW-c},${vH-c*0.33} M ${vW-c*0.66},${vH-c} L ${vW-c},${vH-c*0.66}" stroke="${color}" stroke-width="${t}" />`;
        } else if (style === 'Bracket-Out') {
            const c = Math.min(Math.max(w * 3, 20), minDim/2.5); 
            r = `<polyline points="${w/2+c},${w/2 + c*2} ${w/2+c},${w/2+c} ${w/2 + c*2},${w/2+c}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${vW - w/2 - c*2},${w/2+c} ${vW - w/2 - c},${w/2+c} ${vW - w/2 - c},${w/2 + c*2}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${vW - w/2 - c},${vH - w/2 - c*2} ${vW - w/2 - c},${vH - w/2 - c} ${vW - w/2 - c*2},${vH - w/2 - c}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${w/2+c},${vH - w/2 - c*2} ${w/2+c},${vH - w/2 - c} ${w/2 + c*2},${vH - w/2 - c}" fill="none" stroke="${color}" stroke-width="${w}" />`;
        } else if (style === 'Double-Dashed') {
            const t = w/3;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="${t*4}, ${t*2}"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - t*5}" height="${vH - t*5}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="${t*4}, ${t*2}" stroke-dashoffset="${t*3}"></rect>`;
        } else if (style === 'Dash-Dot-Dot') {
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${w * 4}, ${w}, ${w}, ${w}, ${w}, ${w}"></rect>`;
        } else if (style === 'Dash-Dot-Dot-Dot') {
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${w * 4}, ${w}, ${w}, ${w}, ${w}, ${w}, ${w}, ${w}"></rect>`;
        } else if (style === 'Solid-Dashed') {
            const t = w/3;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - t*5}" height="${vH - t*5}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="${t*3}, ${t*2}"></rect>`;
        } else if (style === 'Dashed-Solid') {
            const t = w/3;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="${t*3}, ${t*2}"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - t*5}" height="${vH - t*5}" fill="none" stroke="${color}" stroke-width="${t}"></rect>`;
        } else if (style === 'Solid-Dotted') {
            const t = w/3;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - t*5}" height="${vH - t*5}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="0.1, ${t*2}" stroke-linecap="round"></rect>`;
        } else if (style === 'Dotted-Solid') {
            const t = w/3;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="0.1, ${t*2}" stroke-linecap="round"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - t*5}" height="${vH - t*5}" fill="none" stroke="${color}" stroke-width="${t}"></rect>`;
        } else if (style === 'Edge-TB') {
            r = `<line x1="0" y1="${w/2}" x2="${vW}" y2="${w/2}" stroke="${color}" stroke-width="${w}" />
                 <line x1="0" y1="${vH-w/2}" x2="${vW}" y2="${vH-w/2}" stroke="${color}" stroke-width="${w}" />`;
        } else if (style === 'Edge-LR') {
            r = `<line x1="${w/2}" y1="0" x2="${w/2}" y2="${vH}" stroke="${color}" stroke-width="${w}" />
                 <line x1="${vW-w/2}" y1="0" x2="${vW-w/2}" y2="${vH}" stroke="${color}" stroke-width="${w}" />`;
        } else if (style === 'Corner-Dots') {
            const c = Math.min(Math.max(w * 2, 10), minDim/3);
            r = `<circle cx="${c}" cy="${c}" r="${w}" fill="${color}" />
                 <circle cx="${vW-c}" cy="${c}" r="${w}" fill="${color}" />
                 <circle cx="${c}" cy="${vH-c}" r="${w}" fill="${color}" />
                 <circle cx="${vW-c}" cy="${vH-c}" r="${w}" fill="${color}" />`;
        } else if (style === 'Corner-Squares') {
            const c = Math.min(Math.max(w * 2, 10), minDim/3);
            r = `<rect x="${c-w}" y="${c-w}" width="${w*2}" height="${w*2}" fill="${color}" />
                 <rect x="${vW-c-w}" y="${c-w}" width="${w*2}" height="${w*2}" fill="${color}" />
                 <rect x="${c-w}" y="${vH-c-w}" width="${w*2}" height="${w*2}" fill="${color}" />
                 <rect x="${vW-c-w}" y="${vH-c-w}" width="${w*2}" height="${w*2}" fill="${color}" />`;
        } else if (style === 'Corner-Cross') {
            const c = Math.min(Math.max(w * 2, 10), minDim/3);
            const d = w;
            const cross = (cx, cy) => `<path d="M ${cx-d},${cy} L ${cx+d},${cy} M ${cx},${cy-d} L ${cx},${cy+d}" stroke="${color}" stroke-width="${w*0.5}" />`;
            r = `${cross(c,c)} ${cross(vW-c,c)} ${cross(c,vH-c)} ${cross(vW-c,vH-c)}`;
        } else if (style === 'Corner-Angles') {
            const c = Math.min(Math.max(w * 3, 15), minDim/3);
            r = `<polyline points="${0},${c} ${0},${0} ${c},${0}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${vW-c},${0} ${vW},${0} ${vW},${c}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${0},${vH-c} ${0},${vH} ${c},${vH}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${vW-c},${vH} ${vW},${vH} ${vW},${vH-c}" fill="none" stroke="${color}" stroke-width="${w}" />`;
        } else if (style === 'Double-Corners') {
            const c = Math.min(Math.max(w * 3, 15), minDim/3);
            const t = w/3;
            r = `<polyline points="${0},${c} ${0},${0} ${c},${0}" fill="none" stroke="${color}" stroke-width="${t}" />
                 <polyline points="${vW-c},${0} ${vW},${0} ${vW},${c}" fill="none" stroke="${color}" stroke-width="${t}" />
                 <polyline points="${0},${vH-c} ${0},${vH} ${c},${vH}" fill="none" stroke="${color}" stroke-width="${t}" />
                 <polyline points="${vW-c},${vH} ${vW},${vH} ${vW},${vH-c}" fill="none" stroke="${color}" stroke-width="${t}" />
                 <polyline points="${t*2},${c} ${t*2},${t*2} ${c},${t*2}" fill="none" stroke="${color}" stroke-width="${t}" />
                 <polyline points="${vW-c},${t*2} ${vW-t*2},${t*2} ${vW-t*2},${c}" fill="none" stroke="${color}" stroke-width="${t}" />
                 <polyline points="${t*2},${vH-c} ${t*2},${vH-t*2} ${c},${vH-t*2}" fill="none" stroke="${color}" stroke-width="${t}" />
                 <polyline points="${vW-c},${vH-t*2} ${vW-t*2},${vH-t*2} ${vW-t*2},${vH-c}" fill="none" stroke="${color}" stroke-width="${t}" />`;
        } else if (style === 'Bracket-In') {
            const c = Math.min(Math.max(w * 3, 20), minDim/2.5);
            r = `<polyline points="${w/2},${w/2+c} ${w/2+c},${w/2+c} ${w/2+c},${w/2}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${vW-w/2},${w/2+c} ${vW-w/2-c},${w/2+c} ${vW-w/2-c},${w/2}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${w/2},${vH-w/2-c} ${w/2+c},${vH-w/2-c} ${w/2+c},${vH-w/2}" fill="none" stroke="${color}" stroke-width="${w}" />
                 <polyline points="${vW-w/2},${vH-w/2-c} ${vW-w/2-c},${vH-w/2-c} ${vW-w/2-c},${vH-w/2}" fill="none" stroke="${color}" stroke-width="${w}" />`;
        } else if (style === 'Tape-Corners') {
            const c = Math.min(Math.max(w * 4, 20), minDim/3);
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w*0.2}"></rect>
                 <polygon points="${0},${c} ${c},${0} ${c+w},${0} ${0},${c+w}" fill="${color}" opacity="0.6" />
                 <polygon points="${vW},${c} ${vW-c},${0} ${vW-c-w},${0} ${vW},${c+w}" fill="${color}" opacity="0.6" />
                 <polygon points="${0},${vH-c} ${c},${vH} ${c+w},${vH} ${0},${vH-c-w}" fill="${color}" opacity="0.6" />
                 <polygon points="${vW},${vH-c} ${vW-c},${vH} ${vW-c-w},${vH} ${vW},${vH-c-w}" fill="${color}" opacity="0.6" />`;
        } else if (style === 'Photo-Corners') {
            const c = Math.min(Math.max(w * 3, 15), minDim/3);
            r = `<polygon points="${0},${c} ${c},${0} ${0},${0}" fill="${color}" />
                 <polygon points="${vW},${c} ${vW-c},${0} ${vW},${0}" fill="${color}" />
                 <polygon points="${0},${vH-c} ${c},${vH} ${0},${vH}" fill="${color}" />
                 <polygon points="${vW},${vH-c} ${vW-c},${vH} ${vW},${vH}" fill="${color}" />`;
        } else if (style === 'T-Corners') {
            const c = Math.min(Math.max(w * 3, 15), minDim/3);
            r = `<rect x="${c}" y="${c}" width="${vW-c*2}" height="${vH-c*2}" fill="none" stroke="${color}" stroke-width="${w*0.5}" />
                 <line x1="${c}" y1="${c}" x2="${0}" y2="${0}" stroke="${color}" stroke-width="${w}" />
                 <line x1="${vW-c}" y1="${c}" x2="${vW}" y2="${0}" stroke="${color}" stroke-width="${w}" />
                 <line x1="${c}" y1="${vH-c}" x2="${0}" y2="${vH}" stroke="${color}" stroke-width="${w}" />
                 <line x1="${vW-c}" y1="${vH-c}" x2="${vW}" y2="${vH}" stroke="${color}" stroke-width="${w}" />`;
        } else if (style === 'Chevron-Corners') {
            const c = Math.min(Math.max(w * 3, 15), minDim/3);
            const chev = (cx, cy, dx, dy) => `<polyline points="${cx},${cy+dy} ${cx+dx},${cy+dy} ${cx+dx},${cy}" fill="none" stroke="${color}" stroke-width="${w*0.5}" /> <polyline points="${cx-dx*0.5},${cy+dy*1.5} ${cx+dx*1.5},${cy+dy*1.5} ${cx+dx*1.5},${cy-dy*0.5}" fill="none" stroke="${color}" stroke-width="${w*0.5}" />`;
            r = `${chev(c, c, -c, -c)} ${chev(vW-c, c, c, -c)} ${chev(c, vH-c, -c, c)} ${chev(vW-c, vH-c, c, c)}`;
        } else if (style === 'Star-Corners') {
            const c = Math.min(Math.max(w * 3, 15), minDim/3);
            const d = w;
            const st = (cx, cy) => `<polygon points="${cx},${cy-d} ${cx+d/3},${cy-d/3} ${cx+d},${cy} ${cx+d/3},${cy+d/3} ${cx},${cy+d} ${cx-d/3},${cy+d/3} ${cx-d},${cy} ${cx-d/3},${cy-d/3}" fill="${color}" />`;
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w*0.2}"></rect>
                 ${st(w/2, w/2)} ${st(vW-w/2, w/2)} ${st(w/2, vH-w/2)} ${st(vW-w/2, vH-w/2)}`;
        } else if (style === 'Hex-Corners') {
            const c = Math.min(Math.max(w * 2, 10), minDim/3);
            const hx = (cx, cy) => `<polygon points="${cx},${cy-c} ${cx+c},${cy-c/2} ${cx+c},${cy+c/2} ${cx},${cy+c} ${cx-c},${cy+c/2} ${cx-c},${cy-c/2}" fill="${color}" />`;
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w*0.2}"></rect>
                 ${hx(w/2, w/2)} ${hx(vW-w/2, w/2)} ${hx(w/2, vH-w/2)} ${hx(vW-w/2, vH-w/2)}`;
        } else if (style === 'Oct-Corners') {
            const c = Math.min(Math.max(w * 2, 10), minDim/3);
            const d = c*0.7; const e = c*0.4;
            const oc = (cx, cy) => `<polygon points="${cx-e},${cy-d} ${cx+e},${cy-d} ${cx+d},${cy-e} ${cx+d},${cy+e} ${cx+e},${cy+d} ${cx-e},${cy+d} ${cx-d},${cy+e} ${cx-d},${cy-e}" fill="${color}" />`;
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w*0.2}"></rect>
                 ${oc(w/2, w/2)} ${oc(vW-w/2, w/2)} ${oc(w/2, vH-w/2)} ${oc(vW-w/2, vH-w/2)}`;
        } else if (style === 'Target-Corners') {
            const c = Math.min(Math.max(w * 2, 12), minDim/3);
            const tc = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="${c}" fill="none" stroke="${color}" stroke-width="${w*0.3}" /><circle cx="${cx}" cy="${cy}" r="${c*0.5}" fill="${color}" />`;
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w*0.2}"></rect>
                 ${tc(w/2, w/2)} ${tc(vW-w/2, w/2)} ${tc(w/2, vH-w/2)} ${tc(vW-w/2, vH-w/2)}`;
        } else if (style === 'Deco-Dots') {
            const t = w/5;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - t*5}" height="${vH - t*5}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="0.1, ${t*2}" stroke-linecap="round"></rect>
                 <rect x="${t*4.5}" y="${t*4.5}" width="${vW - t*9}" height="${vH - t*9}" fill="none" stroke="${color}" stroke-width="${t}"></rect>`;
        } else if (style === 'Deco-Dash') {
            const t = w/5;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - t*5}" height="${vH - t*5}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="${t*3}, ${t*2}"></rect>
                 <rect x="${t*4.5}" y="${t*4.5}" width="${vW - t*9}" height="${vH - t*9}" fill="none" stroke="${color}" stroke-width="${t}"></rect>`;
        } else if (style === 'Dot-Grid') {
            const t = w/3;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="0.1, ${t*2}" stroke-linecap="round"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - t*5}" height="${vH - t*5}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="0.1, ${t*2}" stroke-linecap="round" stroke-dashoffset="${t}"></rect>`;
        } else if (style === 'Cross-Hatch') {
            const t = w/4;
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <rect x="${t*3.5}" y="${t*3.5}" width="${vW - t*7}" height="${vH - t*7}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <line x1="${0}" y1="${0}" x2="${t*4}" y2="${t*4}" stroke="${color}" stroke-width="${t}" />
                 <line x1="${vW}" y1="${0}" x2="${vW-t*4}" y2="${t*4}" stroke="${color}" stroke-width="${t}" />
                 <line x1="${0}" y1="${vH}" x2="${t*4}" y2="${vH-t*4}" stroke="${color}" stroke-width="${t}" />
                 <line x1="${vW}" y1="${vH}" x2="${vW-t*4}" y2="${vH-t*4}" stroke="${color}" stroke-width="${t}" />`;
        } else if (style === 'Ultimate') {
            const t = w/6;
            const c = Math.min(Math.max(w * 3, 20), minDim/3);
            r = `<rect x="${t/2}" y="${t/2}" width="${vW - t}" height="${vH - t}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <rect x="${t*2.5}" y="${t*2.5}" width="${vW - t*5}" height="${vH - t*5}" fill="none" stroke="${color}" stroke-width="${t}" stroke-dasharray="${t*3}, ${t*2}"></rect>
                 <rect x="${t*5.5}" y="${t*5.5}" width="${vW - t*11}" height="${vH - t*11}" fill="none" stroke="${color}" stroke-width="${t}"></rect>
                 <polygon points="${0},${c} ${c},${0} ${c+t*4},${0} ${0},${c+t*4}" fill="${color}" />
                 <polygon points="${vW},${c} ${vW-c},${0} ${vW-c-t*4},${0} ${vW},${c+t*4}" fill="${color}" />
                 <polygon points="${0},${vH-c} ${c},${vH} ${c+t*4},${vH} ${0},${vH-c-t*4}" fill="${color}" />
                 <polygon points="${vW},${vH-c} ${vW-c},${vH} ${vW-c-t*4},${vH} ${vW},${vH-c-t*4}" fill="${color}" />`;
        } else {
            r = `<rect x="${w/2}" y="${w/2}" width="${vW - w}" height="${vH - w}" fill="none" stroke="${color}" stroke-width="${w}"></rect>`;
        }
        return r;
    }

    // --- 4. APPLY TO PAGE ---
    const applyNativeBlueprint = (style) => {
        const paper = document.getElementById('paper') || document.querySelector('.page.active');
        if (!paper) return;

        const oldBorder = document.getElementById('native-blueprint-border');
        if (oldBorder) oldBorder.remove();

        const w = parseInt(weightInput.value);
        const color = colorInput.value;
        document.getElementById('border-weight-label').innerText = w + 'px';

        if (style === 'None' || w === 0) return;

        const pWidth = paper.offsetWidth;
        const pHeight = paper.offsetHeight;
        const inset = 15; 
        const vW = pWidth - (inset * 2);
        const vH = pHeight - (inset * 2);

        const wrapper = document.createElement('div');
        wrapper.id = 'native-blueprint-border';
        wrapper.className = 'pub-element'; 
        wrapper.setAttribute('data-type', 'shape');
        
        wrapper.style.cssText = `
            position: absolute;
            left: ${inset}px;
            top: ${inset}px;
            width: ${vW}px;
            height: ${vH}px;
            z-index: 0; 
            pointer-events: none !important;
        `;

        wrapper.innerHTML = `
            <div class="element-content" style="width:100%; height:100%;">
                <svg viewBox="0 0 ${vW} ${vH}" style="width:100%; height:100%; overflow:visible; position:absolute; top:0; left:0;">
                    <g class="shape-path">
                        <g fill="transparent">
                            ${getBorderSVG(style, w, vW, vH, color)}
                        </g>
                    </g>
                </svg>
            </div>
        `;
        paper.insertBefore(wrapper, paper.firstChild);
    };

    // --- 5. BUILD ACCURATE UI BUTTONS ---
    borderLibrary.forEach(style => {
        const btn = document.createElement('div');
        btn.style.cssText = "display:flex; flex-direction:column; align-items:center; justify-content:center; padding:6px; border:1px solid #e2e8f0; border-radius:6px; cursor:pointer; background:#f8fafc; transition:all 0.1s;";
        
        let previewContent = '';
        if (style === 'None') {
            previewContent = `<div style="width:100%; height:100%; border:1px solid #e2e8f0; background:#f8fafc; box-sizing:border-box;"></div>`;
        } else {
            const miniSVG = getBorderSVG(style, 2, 70, 22, '#334155');
            previewContent = `
                <svg viewBox="0 0 70 22" style="width:100%; height:100%; position:absolute; top:0; left:0; overflow:visible;">
                    <g fill="transparent">${miniSVG}</g>
                </svg>
            `;
        }

        btn.innerHTML = `
            <div style="width:100%; height:22px; margin-bottom:4px; position:relative;">
                ${previewContent}
            </div>
            <span style="font-size:10px; color:#475569; font-weight:bold; text-align:center;">${style}</span>
        `;
        
        btn.onmouseover = () => btn.style.background = '#f1f5f9';
        btn.onmouseout = () => btn.style.background = '#f8fafc';
        
        btn.onclick = () => {
            window.currentBorderStyle = style;
            if (style !== 'None' && parseInt(weightInput.value) === 0) {
                weightInput.value = 10;
            }
            applyNativeBlueprint(window.currentBorderStyle);
        };
        grid.appendChild(btn);
    });

    // --- 6. EVENT LISTENERS ---
    window.currentBorderStyle = 'Solid';
    weightInput.oninput = () => applyNativeBlueprint(window.currentBorderStyle);
    
    colorInput.oninput = (e) => {
        colorWrapper.style.backgroundColor = e.target.value;
        applyNativeBlueprint(window.currentBorderStyle);
    };

    const swatches = dropdown.querySelectorAll('.color-swatch');
    swatches.forEach(swatch => {
        swatch.onclick = (e) => {
            const hex = e.target.getAttribute('data-color');
            colorInput.value = hex; 
            colorWrapper.style.backgroundColor = hex; 
            applyNativeBlueprint(window.currentBorderStyle); 
        };
    });
}