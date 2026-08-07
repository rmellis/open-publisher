/* =========================================================================
   DYNAMIC RULER ENGINE (MATHEMATICAL REDRAW & CRISP TEXT)
   ========================================================================= */
function initRulers() {
    // Sync Rulers when scrolling or resizing
    const vp = document.getElementById('viewport');
    if(vp) vp.addEventListener('scroll', window.syncRulers);
    window.addEventListener('resize', window.syncRulers);
    
    // Force the initial mathematical draw
    window.lastRulerZoom = -1; 
    
    // Trigger an initial sync to draw them on load
    setTimeout(window.syncRulers, 50);
}

window.syncRulers = function() {
    const paperEl = document.getElementById('paper');
    if(!paperEl) return;
    const zoom = state.zoom || 1.0;
    
    // 1. If the zoom changed, perfectly redraw the rulers so text stays 100% crisp!
    if (window.lastRulerZoom !== zoom) {
        window.lastRulerZoom = zoom;
        window.drawCrispRulers(zoom);
    }

    // 2. Shift the rulers to track the paper perfectly
    const hRect = document.getElementById('ruler-h').getBoundingClientRect();
    const vRect = document.getElementById('ruler-v').getBoundingClientRect();
    const pRect = paperEl.getBoundingClientRect();
    
    const offsetX = pRect.left - hRect.left;
    const offsetY = pRect.top - vRect.top;
    
    const hInner = document.getElementById('ruler-h-inner');
    const vInner = document.getElementById('ruler-v-inner');
    
    // Only use translation. NO CSS scaling here, which permanently cures the blurry text bug!
    if (hInner) hInner.style.transform = `translateX(${offsetX}px)`;
    if (vInner) vInner.style.transform = `translateY(${offsetY}px)`;
};

/* =========================================================================
   CANVAS RULER ENGINE (Hardware Accelerated, 100% Crisp, Zero Lag)
   ========================================================================= */
window.initRulers = function() {
    const h = document.getElementById('ruler-h');
    const v = document.getElementById('ruler-v');
    if(!h || !v) return;

    // Inject raw hardware canvases instead of thousands of HTML divs!
    h.innerHTML = `
        <canvas id="ruler-h-canvas" style="position:absolute; top:0; left:0; width:100%; height:100%;"></canvas>
        <div id="indent-markers" class="indent-marker-container">
            <div id="im-first-line" class="indent-marker im-first-line" title="First Line Indent"></div>
            <div id="im-hanging" class="indent-marker im-hanging" title="Hanging Indent"></div>
            <div id="im-left" class="indent-marker im-left" title="Left Indent"></div>
        </div>
    `;
    v.innerHTML = '<canvas id="ruler-v-canvas" style="position:absolute; top:0; left:0; width:100%; height:100%;"></canvas>';

    const vp = document.getElementById('viewport');
    if(vp) vp.addEventListener('scroll', window.syncRulers);
    window.addEventListener('resize', window.syncRulers);

    h.addEventListener('dblclick', (e) => {
        if (!state.selectedEl || !state.selectedEl.querySelector('[contenteditable="true"]')) return;
        // Make sure we have an active indent block assigned
        if (window.updateIndentMarkersPosition) window.updateIndentMarkersPosition();
        window.tabDialog.open();
    });

    // Custom Guide Creation from Rulers
    h.addEventListener('mousedown', (e) => {
        if (e.target.closest('.indent-marker') || e.target.closest('.ruler-c')) return;
        createNewGuide('h', e);
    });
    
    v.addEventListener('mousedown', (e) => {
        if (e.target.closest('.ruler-c')) return;
        createNewGuide('v', e);
    });

    window.initIndentMarkersLogic();
    if (window.initRulerOriginLogic) window.initRulerOriginLogic();

    // Force the first draw
    setTimeout(window.syncRulers, 50);
};

window.syncRulers = function() {
    const hCanvas = document.getElementById('ruler-h-canvas');
    const vCanvas = document.getElementById('ruler-v-canvas');
    const paperEl = document.getElementById('paper');
    if(!hCanvas || !vCanvas || !paperEl) return;

    const hRect = hCanvas.parentElement.getBoundingClientRect();
    const vRect = vCanvas.parentElement.getBoundingClientRect();
    const pRect = paperEl.getBoundingClientRect();

    const zoom = state.zoom || 1.0;
    // Mathematical constants: 1 cm = 37.795275 pixels (at standard 96 web DPI)
    const pxPerMm = 37.795275 / 10;
    
    // High-DPI screen support for ultimate crispness (Retina displays)
    const dpr = window.devicePixelRatio || 1; 

    // Match physical canvas pixels to screen pixels
    hCanvas.width = hRect.width * dpr;
    hCanvas.height = hRect.height * dpr;
    vCanvas.width = vRect.width * dpr;
    vCanvas.height = vRect.height * dpr;

    const hCtx = hCanvas.getContext('2d');
    const vCtx = vCanvas.getContext('2d');
    hCtx.scale(dpr, dpr);
    vCtx.scale(dpr, dpr);

    const isDark = document.body.classList.contains('dark-mode');
    const bgStyle = isDark ? '#333333' : '#eeeeee';
    const fgStyle = isDark ? '#a0a0a0' : '#555555';
    const borderStyle = isDark ? '#555555' : '#9ca3af';

    // Clear canvases and paint the background
    hCtx.fillStyle = bgStyle; 
    hCtx.fillRect(0, 0, hRect.width, hRect.height);
    vCtx.fillStyle = bgStyle; 
    vCtx.fillRect(0, 0, vRect.width, vRect.height);

    // Typography & Line Styles
    hCtx.fillStyle = fgStyle;
    hCtx.font = '10px "Segoe UI", Roboto, sans-serif';
    hCtx.strokeStyle = borderStyle;
    hCtx.lineWidth = 1;

    vCtx.fillStyle = fgStyle;
    vCtx.font = '10px "Segoe UI", Roboto, sans-serif';
    vCtx.strokeStyle = borderStyle;
    vCtx.lineWidth = 1;

    // Optical Level of Detail (LOD) - Smart spacing based on zoom
    let labelStepMm = 10;
    let tickStepMm = 1;
    if (zoom >= 0.8) { 
        labelStepMm = 10; // Labels every 1cm
        tickStepMm = 1;   // Ticks every 1mm
    } else if (zoom >= 0.5) { 
        labelStepMm = 20; // Labels every 2cm
        tickStepMm = 5;   // Ticks every 5mm
    } else if (zoom >= 0.3) { 
        labelStepMm = 50; // Labels every 5cm
        tickStepMm = 10;  // Ticks every 10mm (1cm)
    } else { 
        labelStepMm = 100; // Labels every 10cm
        tickStepMm = 50;   // Ticks every 5cm
    }

    // Offsets (Where is the paper on the screen?)
    const offsetX = (pRect.left - hRect.left) + ((state.rulerOriginX || 0) * zoom);
    const offsetY = (pRect.top - vRect.top) + ((state.rulerOriginY || 0) * zoom);

    // Visible ranges (ONLY draw what is currently on screen for extreme performance!)
    const startMmH = Math.floor(-offsetX / (pxPerMm * zoom));
    const endMmH = Math.ceil((hRect.width - offsetX) / (pxPerMm * zoom));

    hCtx.beginPath();
    for (let mm = startMmH; mm <= endMmH; mm++) {
        // Only draw the required ticks, but ALWAYS guarantee the 1cm major marks
        if (mm % tickStepMm !== 0 && mm % 10 !== 0) continue;
        
        const pos = offsetX + (mm * pxPerMm * zoom);
        const lineX = Math.floor(pos) + 0.5; // +0.5 ensures perfectly crisp 1px lines in Canvas

        let tickH = 5;
        if (mm % 10 === 0) tickH = hRect.height;
        else if (mm % 5 === 0) tickH = hRect.height * 0.5;

        hCtx.moveTo(lineX, hRect.height - tickH);
        hCtx.lineTo(lineX, hRect.height);

        if (mm % labelStepMm === 0) {
            hCtx.fillText(mm / 10, lineX + 3, 10);
        }
    }
    hCtx.stroke();

    // Vertical Ruler
    const startMmV = Math.floor(-offsetY / (pxPerMm * zoom));
    const endMmV = Math.ceil((vRect.height - offsetY) / (pxPerMm * zoom));

    vCtx.beginPath();
    for (let mm = startMmV; mm <= endMmV; mm++) {
        if (mm % tickStepMm !== 0 && mm % 10 !== 0) continue;
        
        const pos = offsetY + (mm * pxPerMm * zoom);
        const lineY = Math.floor(pos) + 0.5;

        let tickW = 5;
        if (mm % 10 === 0) tickW = vRect.width;
        else if (mm % 5 === 0) tickW = vRect.width * 0.5;

        vCtx.moveTo(vRect.width - tickW, lineY);
        vCtx.lineTo(vRect.width, lineY);

        if (mm % labelStepMm === 0) {
            // Drawn upright (un-rotated), exactly like MS Publisher!
            vCtx.fillText(mm / 10, 2, lineY + 10);
        }
    }
    vCtx.stroke();

    if (window.updateIndentMarkersPosition) window.updateIndentMarkersPosition();
};

window.initIndentMarkersLogic = function() {
    let draggingMarker = null;
    let startX = 0;
    let startTextIndent = 0;
    let startPaddingLeft = 0;

    const markers = {
        first: document.getElementById('im-first-line'),
        hanging: document.getElementById('im-hanging'),
        left: document.getElementById('im-left')
    };

    if (!markers.first) return;

    function onMouseDown(e, type) {
        if (!state.selectedEl || !window._activeIndentBlock) return;
        draggingMarker = type;
        startX = e.clientX;
        
        startTextIndent = parseFloat(window.getComputedStyle(window._activeIndentBlock).textIndent) || 0;
        startPaddingLeft = parseFloat(window.getComputedStyle(window._activeIndentBlock).paddingLeft) || 0;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
        e.stopPropagation();
    }

    markers.first.addEventListener('mousedown', (e) => onMouseDown(e, 'first'));
    markers.hanging.addEventListener('mousedown', (e) => onMouseDown(e, 'hanging'));
    markers.left.addEventListener('mousedown', (e) => onMouseDown(e, 'left'));

    function onMouseMove(e) {
        if (!draggingMarker || !window._activeIndentBlock) return;
        const zoom = state.zoom || 1.0;
        const deltaX = (e.clientX - startX) / zoom;
        
        if (draggingMarker === 'first') {
            window._activeIndentBlock.style.textIndent = `${startTextIndent + deltaX}px`;
        } else if (draggingMarker === 'hanging') {
            let appliedDelta = deltaX;
            if (startPaddingLeft + deltaX < 0) appliedDelta = -startPaddingLeft;
            window._activeIndentBlock.style.paddingLeft = `${startPaddingLeft + appliedDelta}px`;
            window._activeIndentBlock.style.textIndent = `${startTextIndent - appliedDelta}px`;
        } else if (draggingMarker === 'left') {
            let appliedDelta = deltaX;
            if (startPaddingLeft + deltaX < 0) appliedDelta = -startPaddingLeft;
            window._activeIndentBlock.style.paddingLeft = `${startPaddingLeft + appliedDelta}px`;
        }
        
        window.updateIndentMarkersPosition();
    }

    function onMouseUp(e) {
        draggingMarker = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        pushHistory();
    }
};

window.initRulerOriginLogic = function() {
    const rulerC = document.querySelector('.ruler-c');
    if (!rulerC) return;
    
    let guideH = document.getElementById('ruler-origin-guide-h');
    let guideV = document.getElementById('ruler-origin-guide-v');
    
    if (!guideH) {
        guideH = document.createElement('div');
        guideH.id = 'ruler-origin-guide-h';
        guideH.className = 'ruler-origin-guide h';
        document.body.appendChild(guideH);
    }
    if (!guideV) {
        guideV = document.createElement('div');
        guideV.id = 'ruler-origin-guide-v';
        guideV.className = 'ruler-origin-guide v';
        document.body.appendChild(guideV);
    }

    let isDraggingOrigin = false;
    
    function onMouseDown(e) {
        if (e.button !== 0) return;
        isDraggingOrigin = true;
        guideH.style.display = 'block';
        guideV.style.display = 'block';
        
        guideH.style.top = `${e.clientY}px`;
        guideV.style.left = `${e.clientX}px`;
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
        e.stopPropagation();
    }
    
    function onMouseMove(e) {
        if (!isDraggingOrigin) return;
        guideH.style.top = `${e.clientY}px`;
        guideV.style.left = `${e.clientX}px`;
    }
    
    function onMouseUp(e) {
        if (!isDraggingOrigin) return;
        isDraggingOrigin = false;
        guideH.style.display = 'none';
        guideV.style.display = 'none';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        
        const paperEl = document.getElementById('paper');
        if (!paperEl) return;
        
        const pRect = paperEl.getBoundingClientRect();
        const zoom = state.zoom || 1.0;
        
        const dropX = e.clientX - pRect.left;
        const dropY = e.clientY - pRect.top;
        
        state.rulerOriginX = dropX / zoom;
        state.rulerOriginY = dropY / zoom;
        
        if (window.syncRulers) window.syncRulers();
        if (typeof saveState === 'function') saveState();
    }
    
    function onDoubleClick(e) {
        state.rulerOriginX = 0;
        state.rulerOriginY = 0;
        if (window.syncRulers) window.syncRulers();
        if (typeof saveState === 'function') saveState();
    }
    
    rulerC.removeEventListener('mousedown', rulerC._originMouseDown);
    rulerC.removeEventListener('dblclick', rulerC._originDoubleClick);
    
    rulerC._originMouseDown = onMouseDown;
    rulerC._originDoubleClick = onDoubleClick;
    
    rulerC.addEventListener('mousedown', rulerC._originMouseDown);
    rulerC.addEventListener('dblclick', rulerC._originDoubleClick);
};

window.updateIndentMarkersPosition = function() {
    const container = document.getElementById('indent-markers');
    if (!container) return;

    if (!state.selectedEl || !state.selectedEl.querySelector('[contenteditable="true"]')) {
        container.style.display = 'none';
        return;
    }

    // Find active block
    let activeBlock = null;
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        let node = sel.getRangeAt(0).commonAncestorContainer;
        while (node && node !== state.selectedEl) {
            if (node.nodeType === 1 && (node.tagName === 'DIV' || node.tagName === 'P')) {
                activeBlock = node;
                break;
            }
            node = node.parentNode;
        }
    }
    
    // Fallback to the contenteditable container itself if no block is found
    if (!activeBlock) {
        activeBlock = state.selectedEl.querySelector('[contenteditable="true"]');
    }

    window._activeIndentBlock = activeBlock;

    const currentTextIndent = parseFloat(window.getComputedStyle(activeBlock).textIndent) || 0;
    const currentPaddingLeft = parseFloat(window.getComputedStyle(activeBlock).paddingLeft) || 0;

    const paperEl = document.getElementById('paper');
    const hCanvas = document.getElementById('ruler-h-canvas');
    if(!paperEl || !hCanvas) return;

    const zoom = state.zoom || 1.0;
    const hRect = hCanvas.parentElement.getBoundingClientRect();
    const elRect = activeBlock.getBoundingClientRect();
    
    const baseOffsetX = (elRect.left - hRect.left);
    const hangingPos = baseOffsetX + (currentPaddingLeft * zoom);
    const firstLinePos = hangingPos + (currentTextIndent * zoom);

    const markers = {
        first: document.getElementById('im-first-line'),
        hanging: document.getElementById('im-hanging'),
        left: document.getElementById('im-left')
    };

    if (markers.first && markers.hanging && markers.left) {
        container.style.display = 'block';
        markers.first.style.left = `${firstLinePos - 5}px`;
        markers.hanging.style.left = `${hangingPos - 5}px`;
        markers.left.style.left = `${hangingPos - 5}px`;
    }
};

window.setZoom = function(z) {
    state.zoom = z;
    const paperEl = document.getElementById('paper');
    if (paperEl) paperEl.style.transform = `scale(${z})`;
    if (window.syncRulers) window.syncRulers();
    // Sync status bar zoom slider
    const slider = document.getElementById('zoom-slider');
    if (slider) slider.value = Math.round(z * 100);
    const display = document.getElementById('zoom-level-display');
    if (display) display.textContent = Math.round(z * 100) + '%';
    // Multi-page view
    if (typeof updateMultiPageView === 'function') updateMultiPageView(z);
};

// --- MULTI-PAGE VIEW ---
// When zoom is low enough, render read-only preview clones of all pages beside the active page
window._multiPageActive = false;

function updateMultiPageView(z) {
    const viewport = document.getElementById('viewport');
    const paperEl = document.getElementById('paper');
    if (!viewport || !paperEl) return;

    const THRESHOLD = 0.45;

    if (z <= THRESHOLD && state.pages.length > 1) {
        if (!window._multiPageActive) enterMultiPageView(z);
        else refreshMultiPageZoom(z);
    } else if (window._multiPageActive) {
        exitMultiPageView();
    }
}

function enterMultiPageView(z) {
    const viewport = document.getElementById('viewport');
    const paperEl = document.getElementById('paper');
    if (!viewport || !paperEl) return;

    // Save the current page before rendering previews
    state.pages[state.currentPageIndex] = serializeCurrentPage();

    window._multiPageActive = true;
    viewport.classList.add('multi-page-mode');

    // Create a wrapper to hold all page previews in a flow
    let wrapper = document.getElementById('multi-page-wrapper');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = 'multi-page-wrapper';
        viewport.appendChild(wrapper);
    }
    wrapper.innerHTML = '';

    state.pages.forEach((pageData, i) => {
        if (i === state.currentPageIndex) {
            // The real paper is already in the viewport, so we add a placeholder marker
            const marker = document.createElement('div');
            marker.className = 'multi-page-slot multi-page-slot-active';
            marker.setAttribute('data-page-index', i);

            const pW = parseFloat(pageData.width) || 794;
            const pH = parseFloat(pageData.height) || 1123;
            marker.style.width = pW + 'px';
            marker.style.height = pH + 'px';

            // Page label
            const label = document.createElement('div');
            label.className = 'multi-page-label multi-page-label-active';
            let labelText = state.hasMasterPage && i === 0 ? 'Master Page' : `Page ${i + 1}`;
            label.textContent = labelText + ' (Editing)';
            marker.appendChild(label);

            wrapper.appendChild(marker);
            return;
        }

        const slot = document.createElement('div');
        slot.className = 'multi-page-slot';
        slot.setAttribute('data-page-index', i);
        slot.onclick = () => {
            // Seamless in-place page switch without leaving multi-page view
            const currentZoom = state.zoom;
            // Move paper back to viewport temporarily so switchPage can work
            const vp = document.getElementById('viewport');
            const pp = document.getElementById('paper');
            const wr = document.getElementById('multi-page-wrapper');
            if (vp && pp && wr) {
                vp.insertBefore(pp, wr);
            }
            window._multiPageActive = false;
            if (wr) wr.remove();
            switchPage(i);
            // Re-enter multi-page view at the same zoom
            enterMultiPageView(currentZoom);
        };

        const pW = parseFloat(pageData.width) || 794;
        const pH = parseFloat(pageData.height) || 1123;
        slot.style.width = pW + 'px';
        slot.style.height = pH + 'px';

        // Build a full-size preview (same as renderThumbnailHTML but at 1:1)
        const previewContainer = document.createElement('div');
        previewContainer.style.cssText = `position: relative; width: ${pW}px; height: ${pH}px; background: ${pageData.background || '#ffffff'}; overflow: hidden; pointer-events: none;`;

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
                    let thumbImgCss = `width: ${s.width||'100%'}; height: ${s.height||'100%'}; top: ${s.top||0}; left: ${s.left||0}; position: ${s.position||'absolute'}; filter: ${s.filter||'none'}; display: block;`;
                    if (s.clipPath && s.clipPath !== 'none') {
                        thumbImgCss += ` clip-path: ${s.clipPath}; -webkit-clip-path: ${s.clipPath};`;
                    }
                    imgDiv.style.cssText = thumbImgCss;
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
                }

                elBox.appendChild(scaleBox);
                previewContainer.appendChild(elBox);
            });
        }

        slot.appendChild(previewContainer);

        // Page label
        const label = document.createElement('div');
        label.className = 'multi-page-label';
        let labelText = state.hasMasterPage && i === 0 ? 'Master Page' : `Page ${i + 1}`;
        label.textContent = labelText;
        slot.appendChild(label);

        wrapper.appendChild(slot);
    });

    // Move #paper into the active slot
    const activeSlot = wrapper.querySelector('.multi-page-slot-active');
    if (activeSlot) {
        activeSlot.insertBefore(paperEl, activeSlot.firstChild);
    }

    refreshMultiPageZoom(z);
}

function refreshMultiPageZoom(z) {
    const wrapper = document.getElementById('multi-page-wrapper');
    if (!wrapper) return;

    // Calculate total width needed for all pages side-by-side at full (unscaled) size
    const GAP = 30;
    const PADDING = 40; // 20px padding on each side
    let totalWidth = PADDING;
    const slots = wrapper.querySelectorAll('.multi-page-slot');
    slots.forEach((slot, i) => {
        totalWidth += parseFloat(slot.style.width) || 794;
        if (i < slots.length - 1) totalWidth += GAP;
    });
    totalWidth += PADDING;

    wrapper.style.width = totalWidth + 'px';
    wrapper.style.minWidth = totalWidth + 'px';
    wrapper.style.transform = `scale(${z})`;

    // Paper keeps scale(1) since wrapper handles zoom
    const paperEl = document.getElementById('paper');
    if (paperEl) paperEl.style.transform = 'scale(1)';
}

function exitMultiPageView() {
    const viewport = document.getElementById('viewport');
    const paperEl = document.getElementById('paper');
    if (!viewport || !paperEl) return;

    window._multiPageActive = false;
    viewport.classList.remove('multi-page-mode');

    // Move paper back to viewport root
    const wrapper = document.getElementById('multi-page-wrapper');
    if (wrapper) {
        viewport.insertBefore(paperEl, wrapper);
        wrapper.remove();
    }

    // Restore paper zoom
    paperEl.style.transform = `scale(${state.zoom})`;
}

window.fitToPage = function() {
    const viewport = document.getElementById('viewport');
    const paperEl = document.getElementById('paper');
    if (!viewport || !paperEl) return;
    const padding = 80; // 40px padding on top/bottom
    const scaleX = (viewport.clientWidth - padding) / paperEl.offsetWidth;
    const scaleY = (viewport.clientHeight - padding) / paperEl.offsetHeight;
    const z = Math.min(scaleX, scaleY);
    setZoom(Math.max(0.2, Math.min(3.0, z)));
    viewport.scrollTop = 0;
    viewport.scrollLeft = Math.max(0, (paperEl.offsetWidth * z - viewport.clientWidth)/2);
};

window.fitToWidth = function() {
    const viewport = document.getElementById('viewport');
    const paperEl = document.getElementById('paper');
    if (!viewport || !paperEl) return;
    const padding = 80;
    const scaleX = (viewport.clientWidth - padding) / paperEl.offsetWidth;
    setZoom(Math.max(0.2, Math.min(3.0, scaleX)));
    viewport.scrollLeft = Math.max(0, (paperEl.offsetWidth * scaleX - viewport.clientWidth)/2);
};


