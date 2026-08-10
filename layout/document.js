function setPageSize(format) {
    let w = '794px';
    let h = '1123px';
    if(format === 'Letter') {
        w = '816px'; h = '1056px';
    } else if(format === 'A3') {
        w = '1123px'; h = '1587px';
    } else if(format === 'A5') {
        w = '559px'; h = '794px';
    } else if(format === 'Legal') {
        w = '816px'; h = '1344px';
    } else if(format === 'Tabloid') {
        w = '1056px'; h = '1632px';
    } else if(format === 'BusinessCard') {
        w = '336px'; h = '192px';
    }
    
    if (typeof state !== 'undefined' && state.isSpreadMode) {
        w = (parseInt(w) * 2) + 'px';
    }
    
    paper.style.width = w;
    paper.style.height = h;
    
    // Auto-update the UI format icon immediately
    if (typeof window.setPageFormatIcon === 'function') window.setPageFormatIcon(format);
    
    pushHistory();
    const sizeDrop = document.getElementById('size-dropdown');
    if(sizeDrop) sizeDrop.style.display = 'none';
}

function changeSize() {
    const currentW = parseInt(paper.style.width) || 794;
    const currentH = parseInt(paper.style.height) || 1123;
    
    const formHtml = `
        <div style="display:flex; gap:10px; margin-bottom:15px;">
            <button class="btn-secondary" onclick="document.getElementById('dialog-width').value=794; document.getElementById('dialog-height').value=1123; return false;" style="flex:1;">A4</button>
            <button class="btn-secondary" onclick="document.getElementById('dialog-width').value=816; document.getElementById('dialog-height').value=1056; return false;" style="flex:1;">Letter</button>
        </div>
        <div class="input-group" style="margin-bottom:10px;">
            <label>Width (px):</label>
            <input type="number" id="dialog-width" value="${currentW}">
        </div>
        <div class="input-group">
            <label>Height (px):</label>
            <input type="number" id="dialog-height" value="${currentH}">
        </div>
    `;

    DialogSystem.show('Resize Document', formHtml, () => {
        const newW = document.getElementById('dialog-width').value;
        const newH = document.getElementById('dialog-height').value;
        if(newW && newH) {
            let finalW = newW + 'px';
            if (typeof state !== 'undefined' && state.isSpreadMode) {
                finalW = (parseInt(newW) * 2) + 'px';
            }
            paper.style.width = finalW;
            paper.style.height = newH + 'px';
            pushHistory();
            const sizeDrop = document.getElementById('size-dropdown');
            if (sizeDrop) sizeDrop.style.display = 'none';
        }
    });
}

function toggleOrientation() {
    const currentW = paper.style.width;
    const currentH = paper.style.height;
    paper.style.width = currentH;
    paper.style.height = currentW;
    pushHistory();
}

function toggleSpreadMode() {
    if (typeof serializeCurrentPage === 'function') {
        state.pages[state.currentPageIndex] = serializeCurrentPage();
    }
    
    state.isSpreadMode = !state.isSpreadMode;
    const btn = document.getElementById('spread-mode-btn');
    if (btn) btn.classList.toggle('active', state.isSpreadMode);

    if (state.isSpreadMode) {
        let newPages = [];
        for (let i = 0; i < state.pages.length; i += 2) {
            let p1 = state.pages[i];
            let p2 = state.pages[i+1];
            let singleW = parseInt(p1.width) || 794;
            let spread = {
                width: (singleW * 2) + 'px',
                height: p1.height || '1123px',
                background: p1.background,
                elements: JSON.parse(JSON.stringify(p1.elements))
            };
            if (p2) {
                p2.elements.forEach(el => {
                    let newEl = JSON.parse(JSON.stringify(el));
                    newEl.left = (parseFloat(newEl.left) + singleW) + 'px';
                    spread.elements.push(newEl);
                });
            }
            
            newPages.push(spread);
        }
        state.pages = newPages;
        state.currentPageIndex = Math.floor(state.currentPageIndex / 2);
    } else {
        let newPages = [];
        state.pages.forEach(spread => {
            const singleW = parseInt(spread.width) / 2;
            let p1 = { width: singleW + 'px', height: spread.height, background: spread.background, elements: [] };
            let p2 = { width: singleW + 'px', height: spread.height, background: spread.background, elements: [] };
            
            spread.elements.forEach(el => {
                if (el.innerHTML && el.innerHTML.includes('spread-fold-line')) return;
                
                if (parseFloat(el.left) < singleW) {
                    p1.elements.push(JSON.parse(JSON.stringify(el)));
                } else {
                    let newEl = JSON.parse(JSON.stringify(el));
                    newEl.left = (parseFloat(newEl.left) - singleW) + 'px';
                    p2.elements.push(newEl);
                }
            });
            newPages.push(p1);
            if (p2.elements.length > 0) {
                newPages.push(p2);
            }
        });
        state.pages = newPages;
        state.currentPageIndex = state.currentPageIndex * 2;
    }
    
    renderPage(state.pages[state.currentPageIndex]);
    updateSidebar();
    if (typeof pushHistory === 'function') pushHistory();
}


function toggleMargins() {
    const g = document.getElementById('margin-guides');
    g.style.display = (g.style.display === 'none') ? 'block' : 'none';
}


function showGuidesModal() {
    const paper = document.getElementById('paper');
    const cs = getComputedStyle(paper);
    
    let baseSpacing = cs.getPropertyValue('--baseline-spacing').trim().replace('px', '');
    let baseColor = cs.getPropertyValue('--baseline-color').trim();
    let gridSpacing = cs.getPropertyValue('--grid-spacing').trim().replace('px', '');
    let gridColor = cs.getPropertyValue('--grid-color').trim();

    if (!baseSpacing) baseSpacing = '25';
    if (!baseColor) baseColor = '#add8e6';
    if (!gridSpacing) gridSpacing = '20';
    if (!gridColor) gridColor = '#e0e0e0';

    const formHTML = `
        <div style="padding: 10px 0;">
            <div style="font-weight: bold; margin-bottom: 10px; color: var(--ui-theme-color); border-bottom: 1px solid #ccc; padding-bottom: 5px;">Baseline Guides</div>
            <div class="input-group" style="margin-bottom:10px;">
                <label>Spacing (px):</label>
                <div class="modern-spinner">
                    <input type="text" id="baseline-spacing-input" value="${parseInt(baseSpacing)}" onchange="this.value = Math.max(1, parseInt(this.value)||1)">
                    <div class="spin-btns">
                        <div onclick="document.getElementById('baseline-spacing-input').value=Math.max(1, parseInt(document.getElementById('baseline-spacing-input').value||1)+1)"><i class="fas fa-chevron-up"></i></div>
                        <div onclick="document.getElementById('baseline-spacing-input').value=Math.max(1, parseInt(document.getElementById('baseline-spacing-input').value||1)-1)"><i class="fas fa-chevron-down"></i></div>
                    </div>
                </div>
            </div>
            <div class="input-group" style="margin-bottom:15px;">
                <label>Color:</label>
                <div style="width: 54px;">
                    <input type="hidden" id="baseline-color-val" value="${baseColor}">
                    <div id="baseline-color-input" class="color-swatch-trigger" style="background-color: ${baseColor}; cursor:pointer; width:100%; height:30px; border:1px solid var(--ui-theme-color); border-radius:4px;" onclick="CustomColorPicker.open(this, document.getElementById('baseline-color-val').value, (c) => { document.getElementById('baseline-color-val').value = c; this.style.backgroundColor = c; })"></div>
                </div>
            </div>
            
            <div style="font-weight: bold; margin-bottom: 10px; color: var(--ui-theme-color); border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 20px;">Grid Guides</div>
            <div class="input-group" style="margin-bottom:10px;">
                <label>Spacing (px):</label>
                <div class="modern-spinner">
                    <input type="text" id="grid-spacing-input" value="${parseInt(gridSpacing)}" onchange="this.value = Math.max(1, parseInt(this.value)||1)">
                    <div class="spin-btns">
                        <div onclick="document.getElementById('grid-spacing-input').value=Math.max(1, parseInt(document.getElementById('grid-spacing-input').value||1)+1)"><i class="fas fa-chevron-up"></i></div>
                        <div onclick="document.getElementById('grid-spacing-input').value=Math.max(1, parseInt(document.getElementById('grid-spacing-input').value||1)-1)"><i class="fas fa-chevron-down"></i></div>
                    </div>
                </div>
            </div>
            <div class="input-group" style="margin-bottom:15px;">
                <label>Color:</label>
                <div style="width: 54px;">
                    <input type="hidden" id="grid-color-val" value="${gridColor}">
                    <div id="grid-color-input" class="color-swatch-trigger" style="background-color: ${gridColor}; cursor:pointer; width:100%; height:30px; border:1px solid var(--ui-theme-color); border-radius:4px;" onclick="CustomColorPicker.open(this, document.getElementById('grid-color-val').value, (c) => { document.getElementById('grid-color-val').value = c; this.style.backgroundColor = c; })"></div>
                </div>
            </div>
        </div>
    `;

    DialogSystem.show('Grid and Baseline Guides', formHTML, applyGuidesSettings, false, 'OK');
}

function applyGuidesSettings() {
    const paper = document.getElementById('paper');
    const baseSpacing = document.getElementById('baseline-spacing-input').value;
    const baseColor = document.getElementById('baseline-color-val').value;
    const gridSpacing = document.getElementById('grid-spacing-input').value;
    const gridColor = document.getElementById('grid-color-val').value;

    paper.style.setProperty('--baseline-spacing', baseSpacing + 'px');
    paper.style.setProperty('--baseline-color', baseColor);
    paper.style.setProperty('--grid-spacing', gridSpacing + 'px');
    paper.style.setProperty('--grid-color', gridColor);
}

function showCustomMarginsModal() {
    const cm = state.margins || {top: 48, right: 48, bottom: 48, left: 48};
    const formHtml = `
        <div class="input-group" style="margin-bottom:10px;">
            <label>Top Margin (px):</label>
            <input type="number" id="dialog-margin-top" value="${cm.top}">
        </div>
        <div class="input-group" style="margin-bottom:10px;">
            <label>Bottom Margin (px):</label>
            <input type="number" id="dialog-margin-bottom" value="${cm.bottom}">
        </div>
        <div class="input-group" style="margin-bottom:10px;">
            <label>Left Margin (px):</label>
            <input type="number" id="dialog-margin-left" value="${cm.left}">
        </div>
        <div class="input-group">
            <label>Right Margin (px):</label>
            <input type="number" id="dialog-margin-right" value="${cm.right}">
        </div>
    `;

    DialogSystem.show('Custom Margins', formHtml, () => {
        const t = parseInt(document.getElementById('dialog-margin-top').value) || 0;
        const b = parseInt(document.getElementById('dialog-margin-bottom').value) || 0;
        const l = parseInt(document.getElementById('dialog-margin-left').value) || 0;
        const r = parseInt(document.getElementById('dialog-margin-right').value) || 0;
        
        state.margins = {top: t, right: r, bottom: b, left: l};
        renderPage(state.pages[state.currentPageIndex]);
        pushHistory();
    });
}

function setMarginPreset(top, right, bottom, left) {
    state.margins = {top: top, right: right, bottom: bottom, left: left};
    renderPage(state.pages[state.currentPageIndex]);
    pushHistory();
}

function toggleGrid() { paper.classList.toggle('theme-grid'); }

function toggleBaselines() { paper.classList.toggle('theme-baselines'); }

function toggleRulers() {
    const c = document.getElementById('canvas-area');
    if(c.style.gridTemplateColumns === '0px 1fr') {
        c.style.gridTemplateColumns = '20px 1fr'; c.style.gridTemplateRows = '20px 1fr';
    } else {
        c.style.gridTemplateColumns = '0px 1fr'; c.style.gridTemplateRows = '0px 1fr';
    }
}

function toggleScratchArea() {
    const isHidden = document.body.classList.toggle('hide-scratch-area');
    const btn = document.getElementById('scratch-area-toggle-btn');
    if (btn) {
        if (isHidden) {
            btn.classList.remove('active-tool');
            btn.innerHTML = '<i class="far fa-square"></i>Scratch Area';
        } else {
            btn.classList.add('active-tool');
            btn.innerHTML = '<i class="fas fa-check-square"></i>Scratch Area';
        }
    }
}