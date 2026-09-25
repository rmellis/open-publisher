// --- SERIALIZER & RENDER ---
function renderPage(pageData) {
    deselect();
    const pageDpi = (pageData && pageData.dpi) || (typeof state !== 'undefined' && state.dpi) || 96;
    if (typeof state !== 'undefined') state.dpi = pageDpi;
    
    // Normalize and enforce explicit orientation if present
    if (pageData.orientation) {
        let curW = parseFloat(pageData.width) || 794;
        let curH = parseFloat(pageData.height) || 1123;
        if (pageData.orientation === 'landscape' && curW < curH) {
            pageData.width = Math.max(curW, curH) + 'px';
            pageData.height = Math.min(curW, curH) + 'px';
        } else if (pageData.orientation === 'portrait' && curW > curH) {
            pageData.width = Math.min(curW, curH) + 'px';
            pageData.height = Math.max(curW, curH) + 'px';
        }
    } else {
        pageData.orientation = (parseFloat(pageData.width) >= parseFloat(pageData.height || '1123')) ? 'landscape' : 'portrait';
    }

    if (pageData.id) {
        if (!window._orientedPagesRegistry) window._orientedPagesRegistry = new Set();
        window._orientedPagesRegistry.add(pageData.id);
    }
    
    paper.style.width = pageData.width;
    paper.style.height = pageData.height;
    if (pageData.ignoreBackground) {
        paper.style.background = '#ffffff';
    } else {
        paper.style.background = pageData.background;
    }
    if (typeof window.setPageFormatIcon === 'function') {
        let w = parseFloat(pageData.width);
        let h = parseFloat(pageData.height || '1123');
        if (typeof state !== 'undefined' && state.isSpreadMode) w = w / 2;
        
        let fmt = 'A4';
        if (window.UnitConversionService && window.UnitConversionService.detectFormat) {
            fmt = window.UnitConversionService.detectFormat(w, h, pageDpi);
        } else {
            let shortEdge = Math.min(w, h);
            let longEdge = Math.max(w, h);
            
            if (Math.abs(w - h) <= 10) fmt = 'Square';
            else if (shortEdge >= 1100) fmt = 'A3';
            else if (shortEdge >= 1000) fmt = 'Tabloid';
            else if (shortEdge >= 810 && longEdge > 1100) fmt = 'Legal';
            else if (shortEdge > 800) fmt = 'Letter';
            else if (shortEdge < 400) fmt = 'BusinessCard';
            else if (shortEdge < 600) fmt = 'A5';
        }
        
        window.setPageFormatIcon(fmt);
    }
    
    if (typeof state !== 'undefined' && state.isSpreadMode) {
        paper.classList.add('is-spread');
    } else {
        paper.classList.remove('is-spread');
    }
    let renderHeader = pageData.header;
    let renderFooter = pageData.footer;
    let isHeaderEditable = true;

    if (state.hasMasterPage && state.currentPageIndex !== 0 && state.pages[0] && !pageData.ignoreMasterPage) {
        renderHeader = state.pages[0].header;
        renderFooter = state.pages[0].footer;
        isHeaderEditable = false;
    }
    
    const headerEl = paper.querySelector('.page-header');
    const footerEl = paper.querySelector('.page-footer');
    
    headerEl.innerHTML = renderHeader;
    footerEl.innerHTML = renderFooter;
    headerEl.setAttribute('contenteditable', isHeaderEditable ? 'true' : 'false');
    footerEl.setAttribute('contenteditable', isHeaderEditable ? 'true' : 'false');
    if (isHeaderEditable) {
        headerEl.setAttribute('spellcheck', state.spellCheck ? 'true' : 'false');
        footerEl.setAttribute('spellcheck', state.spellCheck ? 'true' : 'false');
        if (state.spellCheck) {
            headerEl.setAttribute('lang', 'en');
            footerEl.setAttribute('lang', 'en');
        }
    }
    
    const borderEl = paper.querySelector('.page-border-container');
    borderEl.setAttribute('data-style', pageData.borderStyle);
    setPageBorder(pageData.borderStyle, false); 

    const structural = paper.querySelectorAll('.margin-guides, .page-border-container, .page-header, .page-footer');
    paper.innerHTML = '';
    structural.forEach(el => paper.appendChild(el));

    const marginGuides = paper.querySelector('.margin-guides');
    if (marginGuides) {
        if (!state.margins) {
            state.margins = {
                top: Math.round(0.5 * pageDpi),
                right: Math.round(0.5 * pageDpi),
                bottom: Math.round(0.5 * pageDpi),
                left: Math.round(0.5 * pageDpi)
            };
            state.marginsDpi = pageDpi;
        } else if (state.marginsDpi && state.marginsDpi !== pageDpi && state.marginsDpi > 0) {
            const ratio = pageDpi / state.marginsDpi;
            state.margins = {
                top: Math.round(state.margins.top * ratio),
                right: Math.round(state.margins.right * ratio),
                bottom: Math.round(state.margins.bottom * ratio),
                left: Math.round(state.margins.left * ratio)
            };
            state.marginsDpi = pageDpi;
        } else if (!state.marginsDpi) {
            state.marginsDpi = pageDpi;
        }

        const m = state.margins;
        marginGuides.style.inset = 'auto';
        marginGuides.style.top = m.top + 'px';
        marginGuides.style.right = m.right + 'px';
        marginGuides.style.bottom = m.bottom + 'px';
        marginGuides.style.left = m.left + 'px';
    }

    let elementsToRender = [];
    if (state.hasMasterPage && state.currentPageIndex !== 0 && state.pages[0] && !pageData.ignoreMasterPage) {
        elementsToRender = state.pages[0].elements.map(e => Object.assign({}, e, { _isMaster: true }));
    }
    elementsToRender = elementsToRender.concat(pageData.elements.map(e => Object.assign({}, e, { _isMaster: false })));

    elementsToRender.forEach(data => {
        const el = document.createElement('div');
        el.className = 'pub-element';
        if (data._isMaster) {
            el.classList.add('master-page-element');
            el.style.pointerEvents = 'none';
        }
        if (data.innerHTML && data.innerHTML.includes('spread-fold-line')) {
            el.classList.add('ignore-selection');
            el.style.pointerEvents = 'none';
        }
        el.style.left = data.left;
        el.style.top = data.top;
        el.style.width = data.width;
        el.style.height = data.height;
        el.style.transform = data.transform || 'none';
        el.style.zIndex = data.zIndex || 10;
        if (data.overflow) el.style.overflow = data.overflow;
        if (data.type) el.setAttribute('data-type', data.type);
        
        // Restore scale attributes
        const sX = data.scaleX || "1";
        const sY = data.scaleY || "1";
        el.setAttribute('data-scaleX', sX);
        el.setAttribute('data-scaleY', sY);
        if (data.shrinkOverflow) el.setAttribute('data-shrink-overflow', 'true');

        let inner = '';
        if (data.imgSrc) {
            const s = data.imgStyle || {};
            let styleStr = `width:${s.width||'100%'}; height:${s.height||'100%'}; top:${s.top||0}; left:${s.left||0}; position:${s.position||'absolute'}; filter:${s.filter||'none'}; max-width:${s.maxWidth||'none'}; max-height:${s.maxHeight||'none'}; object-fit:${s.objectFit||'fill'};`;
            if (s.clipPath && s.clipPath !== 'none') {
                styleStr += ` clip-path:${s.clipPath}; -webkit-clip-path:${s.clipPath};`;
            }
            const altAttr = data.altText ? ` alt="${data.altText.replace(/"/g, '&quot;')}"` : ' alt=""';
            inner = `<img src="${data.imgSrc}" style="${styleStr}"${altAttr}>`;
        } else if (data.clipPath) {
            inner = `<div style="width:100%; height:100%; background:${data.bg}; clip-path:${data.clipPath}"></div>`;
        } else {
            inner = data.innerHTML || '';
        }
        
        // Force Chromium spellcheck on load
        if (state.spellCheck) {
            inner = inner.replace(/contenteditable="true"/g, 'contenteditable="true" spellcheck="true" lang="en"');
        } else {
            inner = inner.replace(/contenteditable="true"/g, 'contenteditable="true" spellcheck="false"');
        }
        
        const css = data.contentCssText || `transform: scale(${sX}, ${sY});`;
        let d3d = '';
        if (data.rx3d) d3d += ` data-3d-rx="${data.rx3d}"`;
        if (data.ry3d) d3d += ` data-3d-ry="${data.ry3d}"`;
        if (data.rz3d) d3d += ` data-3d-rz="${data.rz3d}"`;
        if (data.p3d) d3d += ` data-3d-p="${data.p3d}"`;

        el.innerHTML = `
            <div class="element-content" style="${css}"${d3d}>${inner}</div>
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

        if (data.cropMode) el.classList.add('cropping');
        if (data.shrinkOverflow) applyShrinkOverflow(el);
        if (data.growFit) applyGrowFit(el);
        if (data.type === 'emoji') applyEmojiStretch(el.querySelector('.element-content'));
        paper.appendChild(el);
    });
    
    toggleHeaderFooter(state.headersVisible);
    document.getElementById('page-count-status').innerText = `Page ${state.currentPageIndex + 1} of ${state.pages.length}`;
    if (typeof window.updateDpiDisplay === 'function') window.updateDpiDisplay(pageDpi);
    updatePageNumbers();
    updateSidebar();
    scheduleEmojiMigrate();
    if (typeof state !== 'undefined' && state.viewMode === 'multipage' && typeof updateMultiPageView === 'function') {
        updateMultiPageView(state.zoom);
    }
    if (typeof window.syncRulers === 'function') window.syncRulers();
    if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
    if (typeof window.syncHandleScaling === 'function') window.syncHandleScaling(state.zoom);
}

// --- HISTORY MANAGEMENT ---


// --- PAGE MANAGEMENT ---
function addNewPage() {
    if(state.pages.length > 0) {
        state.pages[state.currentPageIndex] = serializeCurrentPage();
    }

    let defaultW = '794px'; 
    let defaultH = '1123px';
    
    // Inherit from current page if one exists
    if (state.pages.length > 0) {
        defaultW = state.pages[state.currentPageIndex].width || defaultW;
        defaultH = state.pages[state.currentPageIndex].height || defaultH;
        
        // Convert to single page width if we're in spread mode so logic below can handle doubling correctly
        if (state.isSpreadMode) {
            defaultW = (parseInt(defaultW) / 2) + 'px';
        }
    } else {
        // Automatically detect optimal default page size based on user's region
        try {
            const locale = navigator.language || navigator.userLanguage || '';
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            const letterRegions = ['en-US', 'es-MX', 'en-CA', 'fr-CA', 'es-CO', 'es-VE', 'es-CL', 'en-PH', 'es-PR', 'en-BZ'];
            
            let isLetter = letterRegions.includes(locale) || locale.endsWith('-US') || locale.endsWith('-CA') || locale.endsWith('-MX');
            
            if (tz.startsWith('Europe/') || tz.startsWith('Australia/') || tz.startsWith('Africa/') || tz.startsWith('Asia/')) {
                if (tz !== 'Asia/Manila') {
                    isLetter = false;
                }
            }
            
            if (isLetter) {
                defaultW = '816px'; // US Letter
                defaultH = '1056px';
            }
        } catch(e) {}
        
        // If the paper element was already explicitly sized (e.g. by Dashboard), respect that over defaults
        const paperElem = document.getElementById('paper');
        if (paperElem && paperElem.style.width && paperElem.style.height) {
            defaultW = paperElem.style.width;
            defaultH = paperElem.style.height;
            if (state.isSpreadMode) {
                defaultW = (parseInt(defaultW) / 2) + 'px';
            }
        }
    }

    let pageW = defaultW;
    let initialElements = [];
    if (typeof state !== 'undefined' && state.isSpreadMode) {
        pageW = (parseInt(defaultW) * 2) + 'px';
    }

    const isLand = parseFloat(pageW) >= parseFloat(defaultH);
    const newPage = {
        id: Date.now(),
        orientation: isLand ? 'landscape' : 'portrait',
        width: pageW, height: defaultH,
        dpi: (state.pages.length > 0 && state.pages[state.currentPageIndex] && state.pages[state.currentPageIndex].dpi) ? state.pages[state.currentPageIndex].dpi : (state.dpi || 96),
        background: '#ffffff',
        header: 'Header (Type here)', 
        footer: 'Footer (Type here)',
        borderStyle: 'none',
        elements: initialElements
    };
    
    state.pages.push(newPage);
    state.currentPageIndex = state.pages.length - 1;
    renderPage(newPage);
    updateSidebar();
    
    setTimeout(() => {
        updateThumbnails();
        pushHistory(); 
    }, 50);
}

function addMasterPage() {
    if (state.hasMasterPage) {
        switchPage(0);
        return;
    }

    if(state.pages.length > 0) {
        state.pages[state.currentPageIndex] = serializeCurrentPage();
    }

    let defaultW = '794px'; 
    let defaultH = '1123px';
    try {
        const locale = navigator.language || navigator.userLanguage || '';
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const letterRegions = ['en-US', 'es-MX', 'en-CA', 'fr-CA', 'es-CO', 'es-VE', 'es-CL', 'en-PH', 'es-PR', 'en-BZ'];
        
        let isLetter = letterRegions.includes(locale) || locale.endsWith('-US') || locale.endsWith('-CA') || locale.endsWith('-MX');
        
        if (tz.startsWith('Europe/') || tz.startsWith('Australia/') || tz.startsWith('Africa/') || tz.startsWith('Asia/')) {
            if (tz !== 'Asia/Manila') {
                isLetter = false;
            }
        }
        
        if (isLetter) {
            defaultW = '816px'; 
            defaultH = '1056px';
        }
    } catch(e) {}

    let pageW = defaultW;
    if (typeof state !== 'undefined' && state.isSpreadMode) {
        pageW = (parseInt(defaultW) * 2) + 'px';
    }

    const isMasterLand = parseFloat(pageW) >= parseFloat(defaultH);
    const newPage = {
        id: Date.now() + '-master',
        orientation: isMasterLand ? 'landscape' : 'portrait',
        width: pageW, height: defaultH,
        background: '#ffffff',
        header: 'Header (Type here)', 
        footer: 'Footer (Type here)',
        borderStyle: 'none',
        elements: []
    };
    
    state.hasMasterPage = true;
    state.pages.unshift(newPage);
    state.currentPageIndex = 0;
    
    renderPage(newPage);
    updateSidebar();
    
    setTimeout(() => {
        updateThumbnails();
        pushHistory(); 
    }, 50);
}

function switchPage(newIndex) {
    if (newIndex === state.currentPageIndex) return;
    // Save current page state
    state.pages[state.currentPageIndex] = serializeCurrentPage();
    state.currentPageIndex = newIndex;
    
    if (state.pages[newIndex]._needsRender) {
        state.pages[newIndex]._needsRender = false;
    }
    
    renderPage(state.pages[newIndex]);
    updateSidebar();
}

function deletePage(index, event) {
    event.stopPropagation();
    
    DialogSystem.show('Delete Page', '<p>Are you sure you want to permanently delete this page?</p>', () => {
        if (state.hasMasterPage && index === 0) {
            state.hasMasterPage = false;
        }
        state.pages.splice(index, 1);
        if(state.pages.length === 0) {
            addNewPage();
        } else {
            if(state.currentPageIndex >= state.pages.length) {
                state.currentPageIndex = state.pages.length - 1;
            }
            renderPage(state.pages[state.currentPageIndex]);
            updateSidebar();
            pushHistory();
        }
    });
}

function handleNewDocument() {
    const activeDpi = (typeof state !== 'undefined' && state.dpi) ? state.dpi : 96;
    const activeUnit = (typeof state !== 'undefined' && state.unit) ? state.unit : 'cm';

    const ucs = window.UnitConversionService || {
        toPixels: (v, u, d) => Math.round(parseFloat(v) || 0),
        fromPixels: (v, u, d) => parseFloat(v) || 0,
        convert: (v) => parseFloat(v) || 0,
        formatValue: (v) => parseFloat(v) || 0,
        getPresetDimensions: () => ({ width: 8.27, height: 11.69, widthPx: 794, heightPx: 1123 })
    };

    let defaultPreset = 'A4';
    try {
        const locale = navigator.language || navigator.userLanguage || '';
        if (locale.endsWith('-US') || locale.endsWith('-CA') || locale.endsWith('-MX')) {
            defaultPreset = 'Letter';
        }
    } catch(e) {}

    const initDims = ucs.getPresetDimensions(defaultPreset, activeUnit, activeDpi);

    const formHtml = `
        <div style="margin-bottom:12px;">
            <label style="font-weight:600; font-size:12px; color:var(--ui-theme-dark); display:block; margin-bottom:6px;">Page Format:</label>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
                <button type="button" class="btn-secondary newdoc-preset-btn ${defaultPreset === 'A4' ? 'active' : ''}" data-preset="A4" style="padding:4px 8px; font-size:12px;">A4</button>
                <button type="button" class="btn-secondary newdoc-preset-btn ${defaultPreset === 'Letter' ? 'active' : ''}" data-preset="Letter" style="padding:4px 8px; font-size:12px;">Letter</button>
                <button type="button" class="btn-secondary newdoc-preset-btn" data-preset="A3" style="padding:4px 8px; font-size:12px;">A3</button>
                <button type="button" class="btn-secondary newdoc-preset-btn" data-preset="A5" style="padding:4px 8px; font-size:12px;">A5</button>
                <button type="button" class="btn-secondary newdoc-preset-btn" data-preset="Legal" style="padding:4px 8px; font-size:12px;">Legal</button>
                <button type="button" class="btn-secondary newdoc-preset-btn" data-preset="Tabloid" style="padding:4px 8px; font-size:12px;">Tabloid</button>
                <button type="button" class="btn-secondary newdoc-preset-btn" data-preset="BusinessCard" style="padding:4px 8px; font-size:12px;">Business Card</button>
                <button type="button" class="btn-secondary newdoc-preset-btn" data-preset="Square" style="padding:4px 8px; font-size:12px;">Square</button>
            </div>
        </div>
        <div style="margin-bottom:12px;">
            <label style="font-weight:600; font-size:12px; color:var(--ui-theme-dark); display:block; margin-bottom:6px;">Orientation:</label>
            <div style="display:flex; gap:10px;">
                <button type="button" id="newdoc-orient-portrait" class="btn-secondary newdoc-orient-btn active" data-orient="portrait" style="flex:1; padding:6px; font-size:12px; display:flex; align-items:center; justify-content:center; gap:6px;">
                    <i class="far fa-file"></i> Portrait
                </button>
                <button type="button" id="newdoc-orient-landscape" class="btn-secondary newdoc-orient-btn" data-orient="landscape" style="flex:1; padding:6px; font-size:12px; display:flex; align-items:center; justify-content:center; gap:6px;">
                    <i class="far fa-file" style="transform:rotate(90deg);"></i> Landscape
                </button>
            </div>
        </div>
        <div style="display:flex; gap:12px; margin-bottom:12px;">
            <div style="flex:1;">
                <label style="font-weight:600; font-size:12px; color:var(--ui-theme-dark); display:block; margin-bottom:4px;">Units:</label>
                <select id="newdoc-dialog-unit" style="width:100%; padding:6px;">
                    <option value="cm" ${activeUnit === 'cm' ? 'selected' : ''}>Centimeters (cm)</option>
                    <option value="in" ${activeUnit === 'in' ? 'selected' : ''}>Inches (in)</option>
                    <option value="mm" ${activeUnit === 'mm' ? 'selected' : ''}>Millimeters (mm)</option>
                    <option value="px" ${activeUnit === 'px' ? 'selected' : ''}>Pixels (px)</option>
                </select>
            </div>
            <div style="flex:1;">
                <label style="font-weight:600; font-size:12px; color:var(--ui-theme-dark); display:block; margin-bottom:4px;">DPI (Resolution):</label>
                <select id="newdoc-dialog-dpi-select" style="width:100%; padding:6px;">
                    <option value="72" ${activeDpi === 72 ? 'selected' : ''}>72 DPI (Draft/Screen)</option>
                    <option value="96" ${activeDpi === 96 ? 'selected' : ''}>96 DPI (Web/CSS / Default)</option>
                    <option value="140" ${activeDpi === 140 ? 'selected' : ''}>140 DPI</option>
                    <option value="150" ${activeDpi === 150 ? 'selected' : ''}>150 DPI (Medium Print)</option>
                    <option value="300" ${activeDpi === 300 ? 'selected' : ''}>300 DPI (High-Res Print)</option>
                    <option value="custom" ${![72, 96, 140, 150, 300].includes(activeDpi) ? 'selected' : ''}>Custom...</option>
                </select>
            </div>
        </div>
        <div id="newdoc-dialog-dpi-custom-group" style="display:${![72, 96, 140, 150, 300].includes(activeDpi) ? 'block' : 'none'}; margin-bottom:12px;">
            <label style="font-weight:600; font-size:12px; color:var(--ui-theme-dark); display:block; margin-bottom:4px;">Custom DPI:</label>
            <input type="number" id="newdoc-dialog-dpi-custom" value="${activeDpi}" min="10" max="2400" style="width:100%; padding:6px;">
        </div>
        <div style="display:flex; gap:12px; margin-bottom:12px;">
            <div class="input-group" style="flex:1; margin-bottom:0;">
                <label id="newdoc-width-label">Width (${activeUnit}):</label>
                <input type="number" step="any" id="newdoc-dialog-width" value="${initDims.width}">
            </div>
            <div class="input-group" style="flex:1; margin-bottom:0;">
                <label id="newdoc-height-label">Height (${activeUnit}):</label>
                <input type="number" step="any" id="newdoc-dialog-height" value="${initDims.height}">
            </div>
        </div>
        <div id="newdoc-canvas-preview" style="background:#e8f4f2; border:1px solid #b2dfdb; border-radius:6px; padding:8px 12px; font-size:12px; color:#004d40; text-align:center;">
            Resulting Canvas: <strong id="newdoc-preview-text">${initDims.widthPx} &times; ${initDims.heightPx} px (${activeDpi} DPI, Portrait)</strong>
        </div>
    `;

    DialogSystem.show('New Document', formHtml, () => {
        const u = document.getElementById('newdoc-dialog-unit').value;
        const selDpi = document.getElementById('newdoc-dialog-dpi-select').value;
        const customDpiVal = parseInt(document.getElementById('newdoc-dialog-dpi-custom').value) || 96;
        const d = (selDpi === 'custom') ? Math.max(10, customDpiVal) : (parseInt(selDpi) || 96);
        
        const wVal = parseFloat(document.getElementById('newdoc-dialog-width').value) || 0;
        const hVal = parseFloat(document.getElementById('newdoc-dialog-height').value) || 0;

        if (wVal && hVal && window.UnitConversionService) {
            const finalW = window.UnitConversionService.toPixels(wVal, u, d);
            const finalH = window.UnitConversionService.toPixels(hVal, u, d);
            const isLand = finalW >= finalH;

            state.pages = [];
            state.history = [];
            state.historyIndex = -1;
            state.dpi = d;
            state.unit = u;
            state.margins = {
                top: Math.round(0.5 * d),
                right: Math.round(0.5 * d),
                bottom: Math.round(0.5 * d),
                left: Math.round(0.5 * d)
            };
            state.marginsDpi = d;

            let pageW = finalW + 'px';
            let pageH = finalH + 'px';
            if (state.isSpreadMode) pageW = (finalW * 2) + 'px';
            paper.style.width = pageW;
            paper.style.height = pageH;

            const newPage = {
                id: Date.now(),
                orientation: isLand ? 'landscape' : 'portrait',
                width: pageW,
                height: pageH,
                dpi: d,
                background: '#ffffff',
                header: 'Header (Type here)',
                footer: 'Footer (Type here)',
                borderStyle: 'none',
                elements: []
            };

            state.pages.push(newPage);
            state.currentPageIndex = 0;
            renderPage(newPage);
            updateSidebar();
            if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
            if (typeof window.setPageFormatIcon === 'function') {
                const detectedFmt = (window.UnitConversionService && window.UnitConversionService.detectFormat)
                    ? window.UnitConversionService.detectFormat(finalW, finalH, d)
                    : (currentPreset || 'A4');
                window.setPageFormatIcon(detectedFmt);
            }
            
            setTimeout(() => {
                if (typeof updateThumbnails === 'function') updateThumbnails();
                pushHistory();
            }, 50);
        }
    }, false, 'Create Document');

    setTimeout(() => {
        let currentUnit = activeUnit;
        let currentOrient = 'portrait';
        let currentPreset = defaultPreset;

        const getDialogDpi = () => {
            const sel = document.getElementById('newdoc-dialog-dpi-select');
            if (sel && sel.value === 'custom') {
                const cust = document.getElementById('newdoc-dialog-dpi-custom');
                return Math.max(10, parseInt(cust ? cust.value : 96) || 96);
            }
            return parseInt(sel ? sel.value : 96) || 96;
        };

        const updatePreview = () => {
            if (!window.UnitConversionService) return;
            const u = document.getElementById('newdoc-dialog-unit').value;
            const d = getDialogDpi();
            const wVal = parseFloat(document.getElementById('newdoc-dialog-width').value) || 0;
            const hVal = parseFloat(document.getElementById('newdoc-dialog-height').value) || 0;
            const wPx = window.UnitConversionService.toPixels(wVal, u, d);
            const hPx = window.UnitConversionService.toPixels(hVal, u, d);
            const orientLabel = (wPx >= hPx) ? 'Landscape' : 'Portrait';
            const prevText = document.getElementById('newdoc-preview-text');
            if (prevText) {
                prevText.innerHTML = `${wPx} &times; ${hPx} px (${d} DPI, ${orientLabel})`;
            }
        };

        // Orientation buttons
        const orientBtns = document.querySelectorAll('.newdoc-orient-btn');
        orientBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const orient = btn.getAttribute('data-orient');
                if (orient === currentOrient) return;
                currentOrient = orient;
                orientBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Swap width and height
                const wEl = document.getElementById('newdoc-dialog-width');
                const hEl = document.getElementById('newdoc-dialog-height');
                const oldW = wEl.value;
                wEl.value = hEl.value;
                hEl.value = oldW;
                updatePreview();
            });
        });

        // Units dropdown
        const unitSelect = document.getElementById('newdoc-dialog-unit');
        if (unitSelect) {
            unitSelect.addEventListener('change', function() {
                const nextUnit = this.value;
                const d = getDialogDpi();
                const wEl = document.getElementById('newdoc-dialog-width');
                const hEl = document.getElementById('newdoc-dialog-height');
                const curW = parseFloat(wEl.value) || 0;
                const curH = parseFloat(hEl.value) || 0;

                if (window.UnitConversionService) {
                    const convW = window.UnitConversionService.convert(curW, currentUnit, nextUnit, d);
                    const convH = window.UnitConversionService.convert(curH, currentUnit, nextUnit, d);
                    wEl.value = window.UnitConversionService.formatValue(convW, nextUnit);
                    hEl.value = window.UnitConversionService.formatValue(convH, nextUnit);
                }
                currentUnit = nextUnit;
                document.getElementById('newdoc-width-label').innerText = `Width (${nextUnit}):`;
                document.getElementById('newdoc-height-label').innerText = `Height (${nextUnit}):`;
                updatePreview();
            });
        }

        // DPI dropdown
        const dpiSelect = document.getElementById('newdoc-dialog-dpi-select');
        const customDpiGroup = document.getElementById('newdoc-dialog-dpi-custom-group');
        if (dpiSelect) {
            dpiSelect.addEventListener('change', function() {
                if (this.value === 'custom') {
                    if (customDpiGroup) customDpiGroup.style.display = 'block';
                } else {
                    if (customDpiGroup) customDpiGroup.style.display = 'none';
                }
                updatePreview();
            });
        }

        const customDpiInput = document.getElementById('newdoc-dialog-dpi-custom');
        if (customDpiInput) customDpiInput.addEventListener('input', updatePreview);

        const wInput = document.getElementById('newdoc-dialog-width');
        const hInput = document.getElementById('newdoc-dialog-height');
        if (wInput) wInput.addEventListener('input', updatePreview);
        if (hInput) hInput.addEventListener('input', updatePreview);

        // Preset buttons
        const presetBtns = document.querySelectorAll('.newdoc-preset-btn');
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const presetKey = btn.getAttribute('data-preset');
                currentPreset = presetKey;
                presetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const u = document.getElementById('newdoc-dialog-unit').value;
                const d = getDialogDpi();
                if (window.UnitConversionService) {
                    const dims = window.UnitConversionService.getPresetDimensions(presetKey, u, d);
                    if (currentOrient === 'landscape') {
                        wInput.value = dims.height;
                        hInput.value = dims.width;
                    } else {
                        wInput.value = dims.width;
                        hInput.value = dims.height;
                    }
                }
                updatePreview();
            });
        });

        updatePreview();
    }, 0);
}

function renderThumbnailHTML(pageData, pageIndex) {
    if (!pageData) return document.createElement('div');
    const pW = parseFloat(pageData.width) || 794;
    const pH = parseFloat(pageData.height) || 1123;
    const scale = 100 / pW;

    const outerWrapper = document.createElement('div');
    outerWrapper.style.cssText = `transform: scale(${scale}); transform-origin: top left; width: ${pW}px; height: ${pH}px; pointer-events: none;`;

    const innerWrapper = document.createElement('div');
    innerWrapper.style.cssText = `position: relative; width: ${pW}px; height: ${pH}px; background: ${pageData.background || '#ffffff'}; overflow: hidden; transform-origin: top left; pointer-events: none;`;

    if (pageData.elements && pageData.elements.length > 0) {
        pageData.elements.forEach(data => {
            const sX = data.scaleX || "1";
            const sY = data.scaleY || "1";
            
            const elBox = document.createElement('div');
            elBox.style.cssText = `position: absolute; left: ${data.left}; top: ${data.top}; width: ${data.width}; height: ${data.height}; transform: ${data.transform || 'none'}; z-index: ${data.zIndex || 10};`;
            
            const scaleBox = document.createElement('div');
            scaleBox.style.cssText = `transform: scale(${sX}, ${sY}); width: 100%; height: 100%; overflow: hidden; position: relative; transform-origin: top left; outline: none; border: none;`;
            if (data.contentCssText) scaleBox.style.cssText += ' ' + data.contentCssText;

            if (data.imgSrc && data.imgSrc !== '') {
                const imgDiv = document.createElement('div');
                const s = data.imgStyle || {};
                
                // Use a div with background-image instead of an img tag to bypass any weird img rendering bugs
                let thumbImgCss = `width: ${s.width||'100%'}; height: ${s.height||'100%'}; top: ${s.top||0}; left: ${s.left||0}; position: ${s.position||'absolute'}; filter: ${s.filter||'none'}; display: block;`;
                if (s.clipPath && s.clipPath !== 'none') {
                    thumbImgCss += ` clip-path: ${s.clipPath}; -webkit-clip-path: ${s.clipPath};`;
                }
                imgDiv.style.cssText = thumbImgCss;
                
                // Add the image overlay
                let objFit = s.objectFit || '100% 100%';
                if (objFit === 'fill') objFit = '100% 100%';
                if (objFit === 'contain') objFit = 'contain';
                
                imgDiv.style.background = `url('${data.imgSrc}') center center / ${objFit} no-repeat`;
                
                scaleBox.appendChild(imgDiv);

            } else if (data.clipPath) {
                const clipDiv = document.createElement('div');
                clipDiv.style.cssText = `width: 100%; height: 100%; background: ${data.bg}; clip-path: ${data.clipPath}`;
                scaleBox.appendChild(clipDiv);
            } else {
                scaleBox.innerHTML = (data.innerHTML || '').replace(/contenteditable="true"/g, 'contenteditable="false"');
                if (data.bgImage) {
                    const childDiv = scaleBox.querySelector('div');
                    if (childDiv) childDiv.style.backgroundImage = data.bgImage;
                }
                // Update page number spans in thumbnails
                if (data.type === 'page-number' && typeof pageIndex === 'number') {
                    const curSpan = scaleBox.querySelector('.pn-current');
                    const totSpan = scaleBox.querySelector('.pn-total');
                    if (curSpan) curSpan.textContent = pageIndex + 1;
                    if (totSpan) totSpan.textContent = state.pages.length;
                }
            }
            
            elBox.appendChild(scaleBox);
            innerWrapper.appendChild(elBox);
        });
    }

    outerWrapper.appendChild(innerWrapper);
    return outerWrapper;
}

function updateSidebar() {
    const sb = document.getElementById('sidebar');
    const btns = Array.from(sb.querySelectorAll('.page-add-btn'));
    sb.innerHTML = '';
    
    // Re-inject toggle button if cleared
    if(!sb.querySelector('.sidebar-collapse-btn')) {
         const t = document.createElement('div');
         t.className = 'sidebar-collapse-btn';
         t.innerHTML = '<i class="fas fa-angle-double-left"></i>';
         t.onclick = () => toggleSidebar(true);
         sb.appendChild(t);
    } else {
         sb.appendChild(sb.querySelector('.sidebar-collapse-btn'));
    }

    state.pages.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = `page-thumb-container ${i === state.currentPageIndex ? 'active' : ''}`;
        div.onclick = () => {
            if (typeof state !== 'undefined' && state.viewMode === 'multipage') {
                if (typeof window.selectMultiPageSlot === 'function') {
                    window.selectMultiPageSlot(i);
                } else {
                    state.currentPageIndex = i;
                    updateSidebar();
                }
            } else {
                switchPage(i);
            }
        };
        div.ondblclick = () => {
            if (typeof window.openPageInSingleMode === 'function') {
                window.openPageInSingleMode(i);
            } else {
                switchPage(i);
                if (typeof fitToPage === 'function') fitToPage();
            }
        };
        div.oncontextmenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            showMinimapContextMenu(e, i);
        };
        
        const pW = parseFloat(p.width) || 794;
        const pH = parseFloat(p.height) || 1123;
        const thumbHeight = pH * (100 / pW);
        
        let labelText = state.isSpreadMode ? `Page ${(i*2)+1} - ${(i*2)+2}` : `Page ${i+1}`;
        if (state.hasMasterPage && i === 0) {
            labelText = 'Master Page';
        }
        const pDpi = parseFloat(p.dpi) || (typeof state !== 'undefined' && parseFloat(state.dpi)) || 96;
        const pW_Inches = (pW / pDpi).toFixed(1);
        const pH_Inches = (pH / pDpi).toFixed(1);
        let sizeText = `<span style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.5); color: white; padding: 2px 4px; border-radius: 3px; font-size: 8px;">${pW_Inches} x ${pH_Inches} in</span>`;
        
        div.innerHTML = `
            <div class="page-del-btn" onclick="deletePage(${i}, event)" title="Delete Page"><i class="fas fa-times"></i></div>
            <div class="page-thumb" id="thumb-${i}" style="height: ${thumbHeight}px;">
                ${sizeText}
            </div>
            <small>${labelText}</small>
            ${p.note ? `<div style="font-size: 10px; color: var(--ui-theme-color); text-align: center; word-break: break-word; line-height: 1.1; margin-top: 2px; font-weight: bold;">${p.note.replace(/</g, '&lt;')}</div>` : ''}
        `;
        
        const thumbContainer = div.querySelector('.page-thumb');
        if (p._needsRender) {
            thumbContainer.innerHTML = `<div style="display:flex; justify-content:center; align-items:center; height:100%; color:var(--ui-theme-color); font-size: 24px;"><i class="fas fa-circle-notch fa-spin"></i></div>`;
        } else {
            const thumbNode = renderThumbnailHTML(p, i);
            thumbContainer.appendChild(thumbNode);
        }

        sb.appendChild(div);
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'add-page-btns-wrapper';
    if (btns.length > 0) wrapper.appendChild(btns[0]);
    if (btns.length > 1) {
        if (state.hasMasterPage) {
            btns[1].innerHTML = '<i class="fas fa-arrow-right"></i> Master';
        } else {
            btns[1].innerHTML = '<i class="fas fa-plus"></i> Master';
        }
        wrapper.appendChild(btns[1]);
    }
    sb.appendChild(wrapper);
}

function updateThumbnails() {
    // Keep it fast: just serialize the current page and update its thumbnail HTML directly
    state.pages[state.currentPageIndex] = serializeCurrentPage();
    generateThumbnail(state.currentPageIndex);
}

function generateThumbnail(index) {
    const pageData = state.pages[index];
    if (!pageData) return;
    const thumbEl = document.getElementById(`thumb-${index}`);
    if (thumbEl) {
        thumbEl.innerHTML = '';
        thumbEl.appendChild(renderThumbnailHTML(pageData, index));
    }
}

// generateAllThumbnails is essentially a no-op now, because updateSidebar already renders everything synchronously
function generateAllThumbnails() {
    updateSidebar();
}
