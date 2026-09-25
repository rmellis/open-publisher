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

window.setRulerUnit = function(unit) {
    if (typeof state !== 'undefined') {
        state.rulerUnit = unit;
        state._userExplicitRulerUnit = true;
        if (typeof window.syncRulers === 'function') window.syncRulers();
        if (typeof pushHistory === 'function') pushHistory();
    }
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
    const pageDpi = (state.pages && state.pages[state.currentPageIndex] && parseFloat(state.pages[state.currentPageIndex].dpi)) 
        || (typeof state !== 'undefined' && parseFloat(state.dpi)) 
        || 96;

    // Default ruler unit to cm (standard for desktop publishing in metric regions and Open Publisher's historical default)
    const rulerUnit = (typeof state !== 'undefined' && state._userExplicitRulerUnit && state.rulerUnit) ? state.rulerUnit : 'cm';

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

    // Offsets (Where is the paper on the screen?)
    const offsetX = (pRect.left - hRect.left) + ((state.rulerOriginX || 0) * zoom);
    const offsetY = (pRect.top - vRect.top) + ((state.rulerOriginY || 0) * zoom);

    // Effective visual zoom relative to standard 96 DPI
    const effectiveZoom = zoom * (pageDpi / 96);

    if (rulerUnit === 'in') {
        // --- INCHES RULER ---
        const pxPerUnit = pageDpi; // 1 inch = pageDpi canvas pixels
        
        let labelStep = 1; // Major label step in inches
        let subDivisions = 8; // 1/8 inch
        if (effectiveZoom >= 1.5) {
            subDivisions = 16; // 1/16"
        } else if (effectiveZoom >= 0.75) {
            subDivisions = 8;  // 1/8"
        } else if (effectiveZoom >= 0.4) {
            subDivisions = 4;  // 1/4"
        } else if (effectiveZoom >= 0.2) {
            subDivisions = 2;  // 1/2"
        } else if (effectiveZoom >= 0.1) {
            labelStep = 2;
            subDivisions = 1;
        } else {
            labelStep = 5;
            subDivisions = 1;
        }

        const tickStep = 1 / subDivisions;
        const startH = Math.floor(-offsetX / (pxPerUnit * zoom) * subDivisions) / subDivisions;
        const endH = Math.ceil((hRect.width - offsetX) / (pxPerUnit * zoom) * subDivisions) / subDivisions;

        hCtx.beginPath();
        for (let unit = startH; unit <= endH + 0.0001; unit += tickStep) {
            const roundedUnit = Math.round(unit * subDivisions) / subDivisions;
            const pos = offsetX + (roundedUnit * pxPerUnit * zoom);
            const lineX = Math.floor(pos) + 0.5;

            const isMajor = Math.abs(roundedUnit - Math.round(roundedUnit)) < 0.001;
            const isHalf = Math.abs((roundedUnit * 2) - Math.round(roundedUnit * 2)) < 0.001;
            const isQuarter = Math.abs((roundedUnit * 4) - Math.round(roundedUnit * 4)) < 0.001;

            let tickH = 4;
            if (isMajor) tickH = hRect.height;
            else if (isHalf) tickH = hRect.height * 0.6;
            else if (isQuarter) tickH = hRect.height * 0.4;

            hCtx.moveTo(lineX, hRect.height - tickH);
            hCtx.lineTo(lineX, hRect.height);

            if (isMajor && Math.round(roundedUnit) % labelStep === 0) {
                hCtx.fillText(Math.round(roundedUnit), lineX + 3, 10);
            }
        }
        hCtx.stroke();

        const startV = Math.floor(-offsetY / (pxPerUnit * zoom) * subDivisions) / subDivisions;
        const endV = Math.ceil((vRect.height - offsetY) / (pxPerUnit * zoom) * subDivisions) / subDivisions;

        vCtx.beginPath();
        for (let unit = startV; unit <= endV + 0.0001; unit += tickStep) {
            const roundedUnit = Math.round(unit * subDivisions) / subDivisions;
            const pos = offsetY + (roundedUnit * pxPerUnit * zoom);
            const lineY = Math.floor(pos) + 0.5;

            const isMajor = Math.abs(roundedUnit - Math.round(roundedUnit)) < 0.001;
            const isHalf = Math.abs((roundedUnit * 2) - Math.round(roundedUnit * 2)) < 0.001;
            const isQuarter = Math.abs((roundedUnit * 4) - Math.round(roundedUnit * 4)) < 0.001;

            let tickW = 4;
            if (isMajor) tickW = vRect.width;
            else if (isHalf) tickW = vRect.width * 0.6;
            else if (isQuarter) tickW = vRect.width * 0.4;

            vCtx.moveTo(vRect.width - tickW, lineY);
            vCtx.lineTo(vRect.width, lineY);

            if (isMajor && Math.round(roundedUnit) % labelStep === 0) {
                vCtx.fillText(Math.round(roundedUnit), 2, lineY + 10);
            }
        }
        vCtx.stroke();
    } else if (rulerUnit === 'px') {
        // --- PIXELS RULER ---
        let labelStepPx = 100;
        let tickStepPx = 10;
        if (effectiveZoom >= 1.5) {
            labelStepPx = 50;
            tickStepPx = 5;
        } else if (effectiveZoom >= 0.7) {
            labelStepPx = 100;
            tickStepPx = 10;
        } else if (effectiveZoom >= 0.3) {
            labelStepPx = 200;
            tickStepPx = 20;
        } else {
            labelStepPx = 500;
            tickStepPx = 50;
        }

        const startH = Math.floor(-offsetX / zoom / tickStepPx) * tickStepPx;
        const endH = Math.ceil((hRect.width - offsetX) / zoom / tickStepPx) * tickStepPx;

        hCtx.beginPath();
        for (let px = startH; px <= endH; px += tickStepPx) {
            const pos = offsetX + (px * zoom);
            const lineX = Math.floor(pos) + 0.5;
            let tickH = 4;
            if (px % labelStepPx === 0) tickH = hRect.height;
            else if (px % (labelStepPx / 2) === 0) tickH = hRect.height * 0.5;

            hCtx.moveTo(lineX, hRect.height - tickH);
            hCtx.lineTo(lineX, hRect.height);

            if (px % labelStepPx === 0) {
                hCtx.fillText(px, lineX + 3, 10);
            }
        }
        hCtx.stroke();

        const startV = Math.floor(-offsetY / zoom / tickStepPx) * tickStepPx;
        const endV = Math.ceil((vRect.height - offsetY) / zoom / tickStepPx) * tickStepPx;

        vCtx.beginPath();
        for (let px = startV; px <= endV; px += tickStepPx) {
            const pos = offsetY + (px * zoom);
            const lineY = Math.floor(pos) + 0.5;
            let tickW = 4;
            if (px % labelStepPx === 0) tickW = vRect.width;
            else if (px % (labelStepPx / 2) === 0) tickW = vRect.width * 0.5;

            vCtx.moveTo(vRect.width - tickW, lineY);
            vCtx.lineTo(vRect.width, lineY);

            if (px % labelStepPx === 0) {
                vCtx.fillText(px, 2, lineY + 10);
            }
        }
        vCtx.stroke();
    } else {
        // --- METRIC (CENTIMETERS / MILLIMETERS) RULER ---
        // 1 mm = pageDpi / 25.4 canvas pixels
        const pxPerMm = pageDpi / 25.4;

        // Optical Level of Detail (LOD) - Smart spacing based on effective visual zoom
        let labelStepMm = 10;
        let tickStepMm = 1;
        if (effectiveZoom >= 0.5) { 
            labelStepMm = 10; // Labels every 1cm
            tickStepMm = 1;   // Ticks every 1mm
        } else if (effectiveZoom >= 0.22) { 
            labelStepMm = 10; // Labels every 1cm
            tickStepMm = 2;   // Ticks every 2mm
        } else if (effectiveZoom >= 0.12) { 
            labelStepMm = 20; // Labels every 2cm
            tickStepMm = 5;   // Ticks every 5mm
        } else if (effectiveZoom >= 0.06) { 
            labelStepMm = 50; // Labels every 5cm
            tickStepMm = 10;  // Ticks every 10mm (1cm)
        } else { 
            labelStepMm = 100; // Labels every 10cm
            tickStepMm = 50;   // Ticks every 5cm
        }

        const isMm = (rulerUnit === 'mm');

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
                const labelText = isMm ? mm : (mm / 10);
                hCtx.fillText(labelText, lineX + 3, 10);
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
                const labelText = isMm ? mm : (mm / 10);
                vCtx.fillText(labelText, 2, lineY + 10);
            }
        }
        vCtx.stroke();
    }

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

window.syncHandleScaling = function(z) {
    const zoom = parseFloat(z) || (typeof state !== 'undefined' && parseFloat(state.zoom)) || 0.6;
    if (!zoom || zoom <= 0) return;

    // Optical screen sizes calibrated to the standard 60% page zoom appearance:
    // Resize handle: ~10px visual screen width/height (10 / 0.6 = 16.667px at 60% zoom)
    // Rotate circle: ~11px visual diameter
    // Rotate stick length: ~24px visual length (40px at 60% zoom)
    // Rotate top distance: stick length + half circle diameter
    // Border width: 1 physical screen pixel across all zoom levels
    const handleSize = (10 / zoom).toFixed(3) + 'px';
    const handleHalf = (5 / zoom).toFixed(3) + 'px';
    const rotateSize = (11 / zoom).toFixed(3) + 'px';
    const rotateHalf = (5.5 / zoom).toFixed(3) + 'px';
    const rotateStickLen = (24 / zoom).toFixed(3) + 'px';
    const rotateTop = (29.5 / zoom).toFixed(3) + 'px';
    const borderWidth = Math.max(1, 1 / zoom).toFixed(3) + 'px';
    const handleRadius = (2 / zoom).toFixed(3) + 'px';
    const cropHandleSize = (13.33 / zoom).toFixed(3) + 'px';
    const cropHandleHalf = (6.67 / zoom).toFixed(3) + 'px';
    const cropBorderWidth = Math.max(1.5, 2 / zoom).toFixed(3) + 'px';
    const shapeHandleSize = (8.5 / zoom).toFixed(3) + 'px';

    const root = document.documentElement;
    if (root) {
        root.style.setProperty('--handle-size', handleSize);
        root.style.setProperty('--handle-half', handleHalf);
        root.style.setProperty('--rotate-size', rotateSize);
        root.style.setProperty('--rotate-half', rotateHalf);
        root.style.setProperty('--rotate-stick-len', rotateStickLen);
        root.style.setProperty('--rotate-top', rotateTop);
        root.style.setProperty('--handle-border-width', borderWidth);
        root.style.setProperty('--handle-radius', handleRadius);
        root.style.setProperty('--crop-handle-size', cropHandleSize);
        root.style.setProperty('--crop-handle-half', cropHandleHalf);
        root.style.setProperty('--crop-border-width', cropBorderWidth);
        root.style.setProperty('--shape-handle-size', shapeHandleSize);
    }

    const paperEl = document.getElementById('paper');
    if (paperEl) {
        paperEl.style.setProperty('--handle-size', handleSize);
        paperEl.style.setProperty('--handle-half', handleHalf);
        paperEl.style.setProperty('--rotate-size', rotateSize);
        paperEl.style.setProperty('--rotate-half', rotateHalf);
        paperEl.style.setProperty('--rotate-stick-len', rotateStickLen);
        paperEl.style.setProperty('--rotate-top', rotateTop);
        paperEl.style.setProperty('--handle-border-width', borderWidth);
        paperEl.style.setProperty('--handle-radius', handleRadius);
        paperEl.style.setProperty('--crop-handle-size', cropHandleSize);
        paperEl.style.setProperty('--crop-handle-half', cropHandleHalf);
        paperEl.style.setProperty('--crop-border-width', cropBorderWidth);
        paperEl.style.setProperty('--shape-handle-size', shapeHandleSize);
    }
};

window.setZoom = function(z) {
    state.zoom = z;
    const paperEl = document.getElementById('paper');
    if (paperEl) {
        paperEl.style.transform = `scale(${z})`;
        paperEl.style.setProperty('--zoom-level', z);
    }
    if (window.syncRulers) window.syncRulers();
    if (typeof window.syncHandleScaling === 'function') window.syncHandleScaling(z);
    const slider = document.getElementById('zoom-slider');
    if (slider) {
        const pageDpi = (state.pages && state.pages[state.currentPageIndex] && parseFloat(state.pages[state.currentPageIndex].dpi)) 
            || (typeof state !== 'undefined' && parseFloat(state.dpi)) 
            || 96;
        const minZoomVal = Math.max(2, Math.round(10 * (96 / pageDpi)));
        slider.min = Math.min(5, minZoomVal);
        slider.value = Math.round(z * 100);
    }
    const display = document.getElementById('zoom-level-display');
    if (display) display.textContent = Math.round(z * 100) + '%';
    if (typeof updateMultiPageView === 'function') updateMultiPageView(z);
    if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
};

window.zoomStepOut = function() {
    const pageDpi = (state.pages && state.pages[state.currentPageIndex] && parseFloat(state.pages[state.currentPageIndex].dpi)) 
        || (typeof state !== 'undefined' && parseFloat(state.dpi)) 
        || 96;
    const minZoom = Math.max(0.02, Math.min(0.2, 0.2 * (96 / pageDpi)));
    let delta = 0.1;
    if (state.zoom < 0.25) delta = 0.02;
    else if (state.zoom < 0.5) delta = 0.05;
    const nextZ = Math.max(minZoom, Math.round((state.zoom - delta) * 100) / 100);
    setZoom(nextZ);
};

window.zoomStepIn = function() {
    let delta = 0.1;
    if (state.zoom < 0.25) delta = 0.02;
    else if (state.zoom < 0.5) delta = 0.05;
    const nextZ = Math.min(3.0, Math.round((state.zoom + delta) * 100) / 100);
    setZoom(nextZ);
};

// --- MARGIN GUIDE OVERLAY ---
// .margin-guides lives inside #paper which has transform:scale(z). Chromium rasterises
// the entire #paper subtree into a GPU texture then bilinearly downsamples it, blurring
// any fine dot/dash pattern below ~1.5 physical pixels at low zoom.
// Fix: a position:fixed sibling div rendered at native device-pixel resolution, positioned
// over the paper using getBoundingClientRect() which already accounts for the transform.

(function initMarginGuideOverlay() {
    const ov = document.createElement('div');
    ov.id = 'margin-guide-overlay';
    ov.style.cssText = 'position:fixed; pointer-events:none; z-index:1001; box-sizing:border-box; display:none;';
    document.body.appendChild(ov);
})();

window.syncMarginGuideOverlay = function() {
    const paper  = document.getElementById('paper');
    const guide  = document.getElementById('margin-guides');
    const ov     = document.getElementById('margin-guide-overlay');
    if (!ov || !paper || !guide) return;

    // Mirror visibility of the real margin-guides div
    if (guide.style.display === 'none') {
        ov.style.display = 'none';
        return;
    }

    // getBoundingClientRect on #paper gives the actual rendered rect (after scale transform)
    // in window coordinates, which is exactly what position:fixed uses.
    const pr = paper.getBoundingClientRect();
    const z  = (typeof state !== 'undefined' && state.zoom) ? state.zoom : 1;

    // Read the current margin values from state (paper-coordinate pixels)
    const curDpi = (typeof state !== 'undefined' && state.dpi) ? state.dpi : 96;
    const defaultM = Math.round(0.5 * curDpi);
    const m = (typeof state !== 'undefined' && state.margins) ? state.margins : { top: defaultM, right: defaultM, bottom: defaultM, left: defaultM };

    ov.style.left   = (pr.left   + m.left   * z) + 'px';
    ov.style.top    = (pr.top    + m.top    * z) + 'px';
    ov.style.width  = (pr.width  - (m.left + m.right)  * z) + 'px';
    ov.style.height = (pr.height - (m.top  + m.bottom) * z) + 'px';

    // Match the dot colour to the active UI theme (--ui-theme-color), falling back to teal
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--ui-theme-color').trim() || '#008080';
    ov.style.border = '1px dotted ' + themeColor;

    // Clip the overlay to the canvas viewport so it never bleeds over the ribbon or other UI chrome.
    // clip-path:inset() takes distances from each edge of the element inward.
    // A positive value means that edge is clipped; negative/zero means fully visible.
    const vp = document.getElementById('viewport');
    if (vp) {
        const vr  = vp.getBoundingClientRect();
        const ovR = ov.getBoundingClientRect();
        const clipTop    = Math.max(0, vr.top    - ovR.top)    + 'px';
        const clipRight  = Math.max(0, ovR.right  - vr.right)  + 'px';
        const clipBottom = Math.max(0, ovR.bottom - vr.bottom) + 'px';
        const clipLeft   = Math.max(0, vr.left   - ovR.left)   + 'px';
        ov.style.clipPath = `inset(${clipTop} ${clipRight} ${clipBottom} ${clipLeft})`;
    }

    ov.style.display = 'block';

};

// Run a rAF loop to keep the overlay locked to the paper on every frame.
// This handles fast panning, window resize, and any layout shift without
// needing discrete events - cost is one getBoundingClientRect + 4 style writes per frame.
(function marginOverlayRAFLoop() {
    window.syncMarginGuideOverlay();
    requestAnimationFrame(marginOverlayRAFLoop);
})();

window._compensateBorderSVGForZoom = function() { /* no-op */ };

// --- MULTI-PAGE VIEW ---
// When zoom is low enough, render read-only preview clones of all pages beside the active page.
// The threshold scales dynamically based on DPI so multi-page view activates at the exact same
// optical physical size on screen regardless of whether the document is 72, 96, 140, or 300 DPI.
window._multiPageActive = false;

window.getMultiPageThreshold = function(pageDpi) {
    const dpi = pageDpi 
        || (state && state.pages && state.pages[state.currentPageIndex] && parseFloat(state.pages[state.currentPageIndex].dpi)) 
        || (typeof state !== 'undefined' && parseFloat(state.dpi)) 
        || 96;
    return 0.45 * (96 / dpi);
};

function updateMultiPageView(z) {
    const viewport = document.getElementById('viewport');
    const paperEl = document.getElementById('paper');
    if (!viewport || !paperEl) return;

    const threshold = window.getMultiPageThreshold();

    if (z <= threshold && state.pages && state.pages.length > 1) {
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

    const pageDpi = (state.pages && state.pages[state.currentPageIndex] && parseFloat(state.pages[state.currentPageIndex].dpi)) 
        || (typeof state !== 'undefined' && parseFloat(state.dpi)) 
        || 96;
    const dpiRatio = pageDpi / 96;
    const gap = Math.round(30 * dpiRatio);
    const pad = Math.round(20 * dpiRatio);
    const borderWidth = Math.max(2, Math.round(2 * dpiRatio));

    // Create a wrapper to hold all page previews in a flow
    let wrapper = document.getElementById('multi-page-wrapper');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = 'multi-page-wrapper';
        viewport.appendChild(wrapper);
    }
    wrapper.innerHTML = '';
    wrapper.style.gap = gap + 'px';
    wrapper.style.padding = pad + 'px';

    state.pages.forEach((pageData, i) => {
        const pDpi = parseFloat(pageData.dpi) || pageDpi;
        const pRatio = pDpi / 96;
        const pW = parseFloat(pageData.width) || (794 * pRatio);
        const pH = parseFloat(pageData.height) || (1123 * pRatio);

        if (i === state.currentPageIndex) {
            // The real paper is already in the viewport, so we add a placeholder marker
            const marker = document.createElement('div');
            marker.className = 'multi-page-slot multi-page-slot-active';
            marker.setAttribute('data-page-index', i);
            marker.style.width = pW + 'px';
            marker.style.height = pH + 'px';
            marker.style.borderWidth = borderWidth + 'px';

            // Page label
            const label = document.createElement('div');
            label.className = 'multi-page-label multi-page-label-active';
            let labelText = state.hasMasterPage && i === 0 ? 'Master Page' : `Page ${i + 1}`;
            label.textContent = labelText + ' (Editing)';
            label.style.fontSize = Math.round(13 * dpiRatio) + 'px';
            label.style.bottom = `-${Math.round(28 * dpiRatio)}px`;
            marker.appendChild(label);

            wrapper.appendChild(marker);
            return;
        }

        const slot = document.createElement('div');
        slot.className = 'multi-page-slot';
        slot.setAttribute('data-page-index', i);
        slot.style.width = pW + 'px';
        slot.style.height = pH + 'px';
        slot.style.borderWidth = borderWidth + 'px';

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
            // Re-evaluate multi-page view for the new page at the same zoom
            updateMultiPageView(currentZoom);
        };

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
        label.style.fontSize = Math.round(13 * dpiRatio) + 'px';
        label.style.bottom = `-${Math.round(28 * dpiRatio)}px`;
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

    const pageDpi = (state.pages && state.pages[state.currentPageIndex] && parseFloat(state.pages[state.currentPageIndex].dpi)) 
        || (typeof state !== 'undefined' && parseFloat(state.dpi)) 
        || 96;
    const dpiRatio = pageDpi / 96;
    const GAP = Math.round(30 * dpiRatio);
    const PADDING = Math.round(40 * dpiRatio); // 20px padding * dpiRatio on each side

    // Calculate total width needed for all pages side-by-side at full (unscaled) size
    let totalWidth = PADDING;
    const slots = wrapper.querySelectorAll('.multi-page-slot');
    slots.forEach((slot, i) => {
        totalWidth += parseFloat(slot.style.width) || (794 * dpiRatio);
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
    if (!viewport || !paperEl || !paperEl.offsetWidth || !paperEl.offsetHeight) return;
    const padding = 80; // 40px padding on top/bottom
    const scaleX = (viewport.clientWidth - padding) / paperEl.offsetWidth;
    const scaleY = (viewport.clientHeight - padding) / paperEl.offsetHeight;
    const z = Math.min(scaleX, scaleY);
    const pageDpi = (state.pages && state.pages[state.currentPageIndex] && parseFloat(state.pages[state.currentPageIndex].dpi)) 
        || (typeof state !== 'undefined' && parseFloat(state.dpi)) 
        || 96;
    const minZoom = Math.max(0.02, Math.min(0.2, 0.2 * (96 / pageDpi)));
    setZoom(Math.max(minZoom, Math.min(3.0, z)));
    viewport.scrollTop = 0;
    viewport.scrollLeft = Math.max(0, (paperEl.offsetWidth * z - viewport.clientWidth)/2);
};

window.fitToWidth = function() {
    const viewport = document.getElementById('viewport');
    const paperEl = document.getElementById('paper');
    if (!viewport || !paperEl || !paperEl.offsetWidth) return;
    const padding = 80;
    const scaleX = (viewport.clientWidth - padding) / paperEl.offsetWidth;
    const pageDpi = (state.pages && state.pages[state.currentPageIndex] && parseFloat(state.pages[state.currentPageIndex].dpi)) 
        || (typeof state !== 'undefined' && parseFloat(state.dpi)) 
        || 96;
    const minZoom = Math.max(0.02, Math.min(0.2, 0.2 * (96 / pageDpi)));
    setZoom(Math.max(minZoom, Math.min(3.0, scaleX)));
    viewport.scrollLeft = Math.max(0, (paperEl.offsetWidth * scaleX - viewport.clientWidth)/2);
};

// Initialize handle scaling
if (typeof window.syncHandleScaling === 'function') {
    window.syncHandleScaling(0.6);
}


