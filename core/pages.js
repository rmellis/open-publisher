// --- SERIALIZER & RENDER ---
function renderPage(pageData) {
    deselect();
    
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
        const m = state.margins || {top: 48, right: 48, bottom: 48, left: 48};
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
    updatePageNumbers();
    updateSidebar();
    scheduleEmojiMigrate();
}

// --- HISTORY MANAGEMENT ---


// --- PAGE MANAGEMENT ---
function addNewPage() {
    if(state.pages.length > 0) {
        state.pages[state.currentPageIndex] = serializeCurrentPage();
    }

    // Automatically detect optimal default page size based on user's region
    let defaultW = '794px'; // A4 default
    let defaultH = '1123px';
    try {
        const locale = navigator.language || navigator.userLanguage || '';
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const letterRegions = ['en-US', 'es-MX', 'en-CA', 'fr-CA', 'es-CO', 'es-VE', 'es-CL', 'en-PH', 'es-PR', 'en-BZ'];
        
        let isLetter = letterRegions.includes(locale) || locale.endsWith('-US') || locale.endsWith('-CA') || locale.endsWith('-MX');
        
        // Timezone override: UK users often have en-US browsers. Timezone gives physical location.
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

    let pageW = defaultW;
    let initialElements = [];
    if (typeof state !== 'undefined' && state.isSpreadMode) {
        pageW = (parseInt(defaultW) * 2) + 'px';
    }

    const newPage = {
        id: Date.now(),
        width: pageW, height: defaultH,
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

    const newPage = {
        id: Date.now() + '-master',
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
    const msg = `<p style="margin-top:0;">Create a new document?</p>
                 <p style="color:#555;"><strong>OK:</strong> Save to history and start fresh.<br>
                 <strong>Cancel:</strong> Abort.</p>`;
                 
    DialogSystem.show('New Document', msg, () => {
         state.pages = [];
         state.history = [];
         state.historyIndex = -1;
         addNewPage();
    });
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
        div.onclick = () => switchPage(i);
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
        const pW_Inches = (pW / 96).toFixed(1);
        const pH_Inches = (pH / 96).toFixed(1);
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
