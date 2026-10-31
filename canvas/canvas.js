/* =========================================================================
   CANVAS RULER ENGINE (Hardware Accelerated, 100% Crisp, Zero Lag) (v5.11.10)
   ========================================================================= */
window.initRulers = function() {
    const h = document.getElementById('ruler-h');
    const v = document.getElementById('ruler-v');
    if(!h || !v) return;

    // Inject raw hardware canvases instead of thousands of HTML divs!
    h.innerHTML = `
        <canvas id="ruler-h-canvas" style="position:absolute; top:0; left:0; width:100%; height:100%;"></canvas>
        <div id="ruler-h-selection-marker" class="ruler-selection-marker-h op-ruler-highlight-h" style="display:none;"></div>
        <div id="ruler-h-cursor-marker" class="ruler-cursor-marker-h" style="display:none;"></div>
        <div id="indent-markers" class="indent-marker-container">
            <div id="im-first-line" class="indent-marker im-first-line" title="First Line Indent"></div>
            <div id="im-hanging" class="indent-marker im-hanging" title="Hanging Indent"></div>
            <div id="im-left" class="indent-marker im-left" title="Left Indent"></div>
        </div>
    `;
    v.innerHTML = `
        <canvas id="ruler-v-canvas" style="position:absolute; top:0; left:0; width:100%; height:100%;"></canvas>
        <div id="ruler-v-selection-marker" class="ruler-selection-marker-v op-ruler-highlight-v" style="display:none;"></div>
        <div id="ruler-v-cursor-marker" class="ruler-cursor-marker-v" style="display:none;"></div>
    `;

    const hCanvas = document.getElementById('ruler-h-canvas');
    const vCanvas = document.getElementById('ruler-v-canvas');

    function wireCanvasLossRecovery(canvas) {
        if (!canvas) return;
        // e.preventDefault() on contextlost informs the browser engine that
        // the application is ready to restore its context when GPU resources recover.
        canvas.addEventListener('contextlost', (e) => {
            e.preventDefault();
            console.warn('[OpenPublisher Ruler] Canvas context lost. Preventing permanent discard.');
        }, false);

        canvas.addEventListener('contextrestored', () => {
            console.log('[OpenPublisher Ruler] Canvas context restored. Repainting rulers...');
            if (window.syncRulers) requestAnimationFrame(window.syncRulers);
        }, false);
    }

    wireCanvasLossRecovery(hCanvas);
    wireCanvasLossRecovery(vCanvas);

    if (!window._rulerLifecycleListenersAttached) {
        window._rulerLifecycleListenersAttached = true;

        // When returning to tab from background, low-resource hibernation, or window focus
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && window.syncRulers) {
                requestAnimationFrame(() => {
                    if (window.syncRulers) window.syncRulers();
                });
            }
        });

        window.addEventListener('focus', () => {
            if (window.syncRulers) {
                requestAnimationFrame(() => {
                    if (window.syncRulers) window.syncRulers();
                });
            }
        });

        window.addEventListener('pageshow', () => {
            if (window.syncRulers) {
                requestAnimationFrame(() => {
                    if (window.syncRulers) window.syncRulers();
                });
            }
        });
    }

    const vp = document.getElementById('viewport');
    if(vp) vp.addEventListener('scroll', window.syncRulers);
    window.addEventListener('resize', () => {
        if (window.syncRulers) window.syncRulers();
        if (typeof window.updateCanvasScrollBounds === 'function') window.updateCanvasScrollBounds();
    });

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

    // Ruler corner click recovery
    const rc = document.querySelector('.ruler-c');
    if (rc && !rc._recoveryWired) {
        rc._recoveryWired = true;
        rc.addEventListener('click', () => {
            if (window.syncRulers) window.syncRulers();
        });
    }

    window.initIndentMarkersLogic();
    if (window.initRulerOriginLogic) window.initRulerOriginLogic();
    if (typeof window.initCanvasScrollEnhancements === 'function') window.initCanvasScrollEnhancements();

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

window.isRulerCanvasHealthy = function() {
    if (document.hidden) return true;
    const hCanvas = document.getElementById('ruler-h-canvas');
    const vCanvas = document.getElementById('ruler-v-canvas');
    if (!hCanvas || !vCanvas) return false;

    if (hCanvas.width <= 0 || hCanvas.height <= 0 || vCanvas.width <= 0 || vCanvas.height <= 0) {
        return false;
    }

    const hCtx = hCanvas.getContext('2d');
    const vCtx = vCanvas.getContext('2d');
    if (!hCtx || !vCtx) return false;

    if (typeof hCtx.isContextLost === 'function' && hCtx.isContextLost()) return false;
    if (typeof vCtx.isContextLost === 'function' && vCtx.isContextLost()) return false;

    return true;
};

window.ensureRulersRendered = function() {
    if (document.hidden) return;
    if (!window.isRulerCanvasHealthy()) {
        if (window.syncRulers) window.syncRulers();
    }
};

window.syncRulers = function() {
    const rh = document.getElementById('ruler-h');
    const rv = document.getElementById('ruler-v');
    const rc = document.querySelector('.ruler-c');

    if (window._multiPageActive || (typeof state !== 'undefined' && state.viewMode === 'multipage')) {
        if (rh) rh.style.display = 'none';
        if (rv) rv.style.display = 'none';
        if (rc) rc.style.display = 'none';
        return;
    } else {
        if (rh && rh.style.display === 'none') rh.style.display = '';
        if (rv && rv.style.display === 'none') rv.style.display = '';
        if (rc && rc.style.display === 'none') rc.style.display = '';
    }

    let hCanvas = document.getElementById('ruler-h-canvas');
    let vCanvas = document.getElementById('ruler-v-canvas');
    const paperEl = document.getElementById('paper');
    if (!paperEl) return;

    // Self-healing: if canvases were destroyed or detached, reinitialize
    if (!hCanvas || !vCanvas) {
        if (typeof window.initRulers === 'function') {
            window.initRulers();
            hCanvas = document.getElementById('ruler-h-canvas');
            vCanvas = document.getElementById('ruler-v-canvas');
        }
        if (!hCanvas || !vCanvas) return;
    }

    const hParent = hCanvas.parentElement;
    const vParent = vCanvas.parentElement;
    if (!hParent || !vParent) return;

    const hRect = hParent.getBoundingClientRect();
    const vRect = vParent.getBoundingClientRect();
    const pRect = paperEl.getBoundingClientRect();

    // Prevent collapsing canvas to 0x0 if called during background tab or zero dimensions
    if (hRect.width <= 0 || vRect.height <= 0 || hRect.height <= 0 || vRect.width <= 0) {
        if (!document.hidden && !window._rulerPendingRetry) {
            window._rulerPendingRetry = true;
            requestAnimationFrame(() => {
                window._rulerPendingRetry = false;
                if (window.syncRulers) window.syncRulers();
            });
        }
        return;
    }

    const zoom = state.zoom || 1.0;
    const pageDpi = (state.pages && state.pages[state.currentPageIndex] && parseFloat(state.pages[state.currentPageIndex].dpi)) 
        || (typeof state !== 'undefined' && parseFloat(state.dpi)) 
        || 96;

    // Default ruler unit to cm (standard for desktop publishing in metric regions and Open Publisher's historical default)
    const rulerUnit = (typeof state !== 'undefined' && state._userExplicitRulerUnit && state.rulerUnit) ? state.rulerUnit : 'cm';

    // High-DPI screen support for ultimate crispness (Retina displays)
    const dpr = window.devicePixelRatio || 1; 

    // Match physical canvas pixels to screen pixels
    const targetHW = Math.max(1, Math.round(hRect.width * dpr));
    const targetHH = Math.max(1, Math.round(hRect.height * dpr));
    const targetVW = Math.max(1, Math.round(vRect.width * dpr));
    const targetVH = Math.max(1, Math.round(vRect.height * dpr));

    if (hCanvas.width !== targetHW || hCanvas.height !== targetHH) {
        hCanvas.width = targetHW;
        hCanvas.height = targetHH;
    }
    if (vCanvas.width !== targetVW || vCanvas.height !== targetVH) {
        vCanvas.width = targetVW;
        vCanvas.height = targetVH;
    }

    const hCtx = hCanvas.getContext('2d');
    const vCtx = vCanvas.getContext('2d');
    if (!hCtx || !vCtx) return;

    // Idempotent transform
    hCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    vCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

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

    const invZoom = (1 / zoom).toFixed(6);
    const zoomStr = zoom.toFixed(6);

    // Zoom-invariant screen sizes across all zoom levels (10% to 400%+):
    const handleSize = (10 / zoom).toFixed(3) + 'px';
    const handleHalf = (5 / zoom).toFixed(3) + 'px';
    const rotateSize = (13 / zoom).toFixed(3) + 'px';
    const rotateHalf = (6.5 / zoom).toFixed(3) + 'px';
    const rotateStickLen = (24 / zoom).toFixed(3) + 'px';
    const rotateTop = (30.5 / zoom).toFixed(3) + 'px';
    const borderWidth = (1.5 / zoom).toFixed(4) + 'px';
    const handleRadius = (2 / zoom).toFixed(3) + 'px';
    const cropHandleSize = (14 / zoom).toFixed(3) + 'px';
    const cropHandleHalf = (7 / zoom).toFixed(3) + 'px';
    const cropBorderWidth = (2 / zoom).toFixed(4) + 'px';
    const shapeHandleSize = (10 / zoom).toFixed(3) + 'px';

    // Smart Arrow UI optical scaling (true zoom invariance)
    const arrowUiScale = invZoom;
    const arrowHandleSize = (14 / zoom).toFixed(3) + 'px';
    const arrowHandleBorder = (2 / zoom).toFixed(4) + 'px';
    const arrowBorderWidth = (1.5 / zoom).toFixed(4) + 'px';

    const applyVars = (target) => {
        if (!target) return;
        target.style.setProperty('--zoom-level', zoomStr);
        target.style.setProperty('--ui-inv-zoom', invZoom);
        target.style.setProperty('--handle-size', handleSize);
        target.style.setProperty('--handle-half', handleHalf);
        target.style.setProperty('--rotate-size', rotateSize);
        target.style.setProperty('--rotate-half', rotateHalf);
        target.style.setProperty('--rotate-stick-len', rotateStickLen);
        target.style.setProperty('--rotate-top', rotateTop);
        target.style.setProperty('--handle-border-width', borderWidth);
        target.style.setProperty('--handle-radius', handleRadius);
        target.style.setProperty('--crop-handle-size', cropHandleSize);
        target.style.setProperty('--crop-handle-half', cropHandleHalf);
        target.style.setProperty('--crop-border-width', cropBorderWidth);
        target.style.setProperty('--shape-handle-size', shapeHandleSize);
        target.style.setProperty('--arrow-ui-scale', arrowUiScale);
        target.style.setProperty('--arrow-handle-size', arrowHandleSize);
        target.style.setProperty('--arrow-handle-border', arrowHandleBorder);
        target.style.setProperty('--arrow-border-width', arrowBorderWidth);
    };

    applyVars(document.documentElement);
    const paperEl = document.getElementById('paper');
    applyVars(paperEl);

    // Keep quick actions edge-flip and rotate-handle clearance synced when zooming
    if (typeof window.updateQuickActionsPosition === 'function') {
        const qaPill = document.querySelector('.selected-overlay .element-quick-actions');
        const boundEl = (typeof state !== 'undefined' && state.selectedEl) || (qaPill && qaPill.parentElement && qaPill.parentElement._boundEl);
        if (qaPill && boundEl) {
            window.updateQuickActionsPosition(qaPill, boundEl);
        }
    }
};

window.updateCanvasScrollBounds = function() {
    const vp = document.getElementById('viewport');
    if (!vp) return;
    if (vp.classList.contains('panning')) return;

    const isMulti = window._multiPageActive || (typeof state !== 'undefined' && state.viewMode === 'multipage');
    const wrapper = document.getElementById('multi-page-wrapper');
    const paper = document.getElementById('paper');

    const z = (typeof state !== 'undefined' && state.zoom) ? state.zoom : 1;
    const vpW = vp.clientWidth;
    const vpH = vp.clientHeight;
    const extraBottom = window._extraBottomScratch || 0;
    const extraRight = window._extraRightScratch || 0;

    let rightEdge, bottomEdge;

    if (isMulti && wrapper) {
        const unscaledW = wrapper._totalUnscaledWidth || wrapper.offsetWidth || 2000;
        const unscaledH = wrapper._totalUnscaledHeight || wrapper.offsetHeight || 1200;
        const scaledW = unscaledW * z;
        const scaledH = unscaledH * z;
        const pad = 40;

        const currentWrapperTop = parseFloat(wrapper.style.top) || 0;
        const currentWrapperLeft = parseFloat(wrapper.style.left) || 0;

        const bottomScratch = Math.max(vpH * 0.25, scaledH * 0.15, 200) + extraBottom;
        const rightScratch = Math.max(pad, vpW * 0.15, scaledW * 0.1) + extraRight;

        const wrapperTopPos = Math.max(0, currentWrapperTop);
        const wrapperLeftPos = Math.max(0, currentWrapperLeft);

        rightEdge = pad + wrapperLeftPos + scaledW + rightScratch;
        bottomEdge = pad + wrapperTopPos + scaledH + bottomScratch;
    } else {
        if (!paper) return;
        const pad = 50;
        const paperW = paper.offsetWidth || 794;
        const paperH = paper.offsetHeight || 1123;
        const scaledW = paperW * z;
        const scaledH = paperH * z;

        const hasCustomMargin = !!(paper.style.marginLeft && paper.style.marginLeft !== '' && paper.style.marginLeft !== '0px');
        const naturalLeft = (vpW - scaledW) / 2;
        const shiftNeeded = pad - naturalLeft;

        if (!hasCustomMargin) {
            if (shiftNeeded > 0) {
                if (!paper.dataset.customPanOffset) {
                    paper.style.left = shiftNeeded + 'px';
                }
            } else {
                if (!paper.dataset.customPanOffset && paper.style.left) {
                    paper.style.left = '';
                }
            }
        } else {
            // When custom margins (e.g. NW.js pasteboard) are active, do not force paper.style.left
            if (!paper.dataset.customPanOffset && paper.style.left) {
                paper.style.left = '';
            }
        }

        const currentPaperTop = parseFloat(paper.style.top) || 0;
        const bottomScratch = Math.max(vpH * 0.25, scaledH * 0.15, 200) + extraBottom;
        const rightScratch = Math.max(pad, vpW * 0.15, scaledW * 0.1) + extraRight;

        const baseLeft = (!hasCustomMargin && shiftNeeded > 0) ? shiftNeeded : 0;
        const currentPaperLeft = parseFloat(paper.style.left) || baseLeft;

        let actualLeftEdge = 0;
        if (hasCustomMargin) {
            actualLeftEdge = paper.offsetLeft + (paper.dataset.customPanOffset ? (parseFloat(paper.style.left) || 0) : 0);
        } else {
            actualLeftEdge = (shiftNeeded > 0 ? currentPaperLeft : (naturalLeft + currentPaperLeft));
        }

        const effectivePaperRight = actualLeftEdge + scaledW;
        const calculatedRightEdge = hasCustomMargin
            ? Math.max(vpW, effectivePaperRight + rightScratch, (paper.offsetLeft + scaledW + (parseFloat(paper.style.marginRight) || 0)))
            : (shiftNeeded > 0 ? (pad + scaledW + rightScratch) : Math.max(vpW, (naturalLeft + scaledW + rightScratch)));
        rightEdge = Math.max(calculatedRightEdge, effectivePaperRight + rightScratch);

        const paperTopPos = Math.max(0, currentPaperTop);
        bottomEdge = pad + paperTopPos + scaledH + bottomScratch;
    }

    let sizer = document.getElementById('canvas-scroll-sizer');
    if (!sizer) {
        sizer = document.createElement('div');
        sizer.id = 'canvas-scroll-sizer';
        sizer.style.position = 'absolute';
        sizer.style.pointerEvents = 'none';
        sizer.style.visibility = 'hidden';
        sizer.style.width = '1px';
        sizer.style.height = '1px';
        vp.appendChild(sizer);
    }
    sizer.style.left = Math.max(1, Math.round(rightEdge - 1)) + 'px';
    sizer.style.top = Math.max(1, Math.round(bottomEdge - 1)) + 'px';

    if (window.syncRulers) window.syncRulers();
    if (window.syncMarginGuideOverlay) window.syncMarginGuideOverlay();
    if (typeof window.checkPageVisibility === 'function') window.checkPageVisibility();
};

window.checkPageVisibility = function() {
    const vp = document.getElementById('viewport');
    const isMulti = window._multiPageActive || (typeof state !== 'undefined' && state.viewMode === 'multipage');
    const target = isMulti ? document.getElementById('multi-page-wrapper') : document.getElementById('paper');
    const btn = document.getElementById('floating-return-to-page-btn');
    if (!vp || !target || !btn) return;

    const vpRect = vp.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    // Check if any portion of target is visible within viewport rectangle
    const isVisible = (
        targetRect.right > vpRect.left &&
        targetRect.left < vpRect.right &&
        targetRect.bottom > vpRect.top &&
        targetRect.top < vpRect.bottom
    );

    if (!isVisible) {
        const iconEl = btn.querySelector('.return-btn-icon');
        let iconClass = 'fa-crosshairs';

        if (targetRect.bottom <= vpRect.top) {
            iconClass = 'fa-arrow-up';
        } else if (targetRect.top >= vpRect.bottom) {
            iconClass = 'fa-arrow-down';
        } else if (targetRect.right <= vpRect.left) {
            iconClass = 'fa-arrow-left';
        } else if (targetRect.left >= vpRect.right) {
            iconClass = 'fa-arrow-right';
        }

        if (iconEl) {
            iconEl.className = `fas ${iconClass} return-btn-icon`;
        }
        btn.classList.add('visible');
    } else {
        btn.classList.remove('visible');
    }
};

window.returnToPage = function(instant = false) {
    const vp = document.getElementById('viewport');
    const paper = document.getElementById('paper');
    const wrapper = document.getElementById('multi-page-wrapper');
    const isMulti = window._multiPageActive || (typeof state !== 'undefined' && state.viewMode === 'multipage');
    if (!vp) return;

    // 1. Reset any scratch/pan displacement offsets on the canvas elements
    if (paper) {
        delete paper.dataset.customPanOffset;
        paper.style.top = '';
        paper.style.left = '';
    }
    if (wrapper) {
        delete wrapper.dataset.customPanOffset;
        wrapper.style.top = '';
        wrapper.style.left = '';
    }
    window._extraBottomScratch = 0;
    window._extraRightScratch = 0;

    // 2. Synchronize scroll bounds immediately
    if (typeof window.updateCanvasScrollBounds === 'function') {
        window.updateCanvasScrollBounds();
    }

    const z = (typeof state !== 'undefined' && state.zoom) ? state.zoom : 1;
    const vpW = vp.clientWidth;
    const vpH = vp.clientHeight;
    const scrollBehavior = instant ? 'auto' : 'smooth';

    // 3. Compute the exact resting target to center the page in the viewport
    if (isMulti && wrapper) {
        const activeIdx = (typeof state !== 'undefined' && typeof state.currentPageIndex === 'number') ? state.currentPageIndex : 0;
        if (typeof window.highlightAndCenterMultiPageSlot === 'function') {
            window.highlightAndCenterMultiPageSlot(activeIdx);
        } else {
            vp.scrollTo({ left: 0, top: 0, behavior: scrollBehavior });
        }
    } else if (paper) {
        const paperW = paper.offsetWidth || 794;
        const paperVisualCenter = paper.offsetLeft + (paperW / 2);
        const paperVisualTop = paper.offsetTop || 50;
        const targetScrollLeft = Math.max(0, Math.min(vp.scrollWidth - vpW, Math.round(paperVisualCenter - (vpW / 2))));
        const targetScrollTop = paperVisualTop <= 60 ? 0 : Math.max(0, Math.min(vp.scrollHeight - vpH, Math.round(paperVisualTop - 50)));

        vp.scrollTo({
            left: targetScrollLeft,
            top: targetScrollTop,
            behavior: scrollBehavior
        });
    }

    const btn = document.getElementById('floating-return-to-page-btn');
    if (btn) btn.classList.remove('visible');

    if (typeof window.syncRulers === 'function') window.syncRulers();
    if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
};

window.initCanvasScrollEnhancements = function() {
    const vp = document.getElementById('viewport');
    if (!vp || vp._hasScrollEnhancements) return;
    vp._hasScrollEnhancements = true;

    vp.addEventListener('scroll', () => {
        if (typeof window.checkPageVisibility === 'function') window.checkPageVisibility();
    }, { passive: true });

    vp.addEventListener('wheel', (e) => {
        if (e.ctrlKey) return;
        if (vp.classList.contains('panning')) return;

        const isMulti = window._multiPageActive || (typeof state !== 'undefined' && state.viewMode === 'multipage');
        const targetEl = isMulti ? document.getElementById('multi-page-wrapper') : document.getElementById('paper');
        if (!targetEl) return;

        const target = e.target;
        if (target && (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
            return;
        }

        // Normalize deltas across browsers:
        // In Firefox, e.deltaMode === 1 (DOM_DELTA_LINE), deltaY is ~3 lines instead of ~100px
        let dy = e.deltaY;
        let dx = e.deltaX;
        if (e.deltaMode === 1) {
            dy *= 25;
            dx *= 25;
        } else if (e.deltaMode === 2) {
            dy *= 400;
            dx *= 400;
        }

        // Shift-wheel maps vertical mouse wheel to horizontal scrolling
        if (e.shiftKey && !dx && dy) {
            dx = dy;
            dy = 0;
        }

        const z = (typeof state !== 'undefined' && state.zoom) ? state.zoom : 1;
        let baseLeft = 0;
        let shiftNeeded = 0;
        const hasCustomMargin = !isMulti && !!(targetEl.style.marginLeft && targetEl.style.marginLeft !== '' && targetEl.style.marginLeft !== '0px');

        if (!isMulti && !hasCustomMargin) {
            const pad = 50;
            const paperW = targetEl.offsetWidth || 794;
            const scaledW = paperW * z;
            const vpW = vp.clientWidth;
            const naturalLeft = (vpW - scaledW) / 2;
            shiftNeeded = pad - naturalLeft;
            baseLeft = shiftNeeded > 0 ? shiftNeeded : 0;
        } else {
            baseLeft = 0;
        }

        const currentLeft = parseFloat(targetEl.style.left) || baseLeft;
        const currentTop = parseFloat(targetEl.style.top) || 0;

        let handled = false;

        // --- VERTICAL WHEEL SCROLLING (UP / DOWN) ---
        if (dy !== 0) {
            if (dy < 0) {
                // User wants to scroll UP
                if (currentTop < 0) {
                    // Target was previously panned upwards: restore downwards towards 0
                    const stepY = Math.max(15, Math.round(Math.abs(dy) * 0.8));
                    const newTop = Math.min(0, currentTop + stepY);
                    targetEl.style.top = (newTop === 0 ? '' : newTop + 'px');
                    if (newTop === 0 && (parseFloat(targetEl.style.left) || baseLeft) === baseLeft) {
                        delete targetEl.dataset.customPanOffset;
                    }
                    if (e.cancelable) e.preventDefault();
                    handled = true;
                } else if (vp.scrollTop <= 2) {
                    // At top boundary: push target downwards to reveal scratch area above
                    const stepY = Math.max(15, Math.round(Math.abs(dy) * 0.8));
                    targetEl.style.top = (currentTop + stepY) + 'px';
                    targetEl.dataset.customPanOffset = "true";
                    if (e.cancelable) e.preventDefault();
                    handled = true;
                }
                // Otherwise vp.scrollTop > 2: allow native upward scrolling through document
            } else {
                // User wants to scroll DOWN (dy > 0)
                if (currentTop > 0) {
                    // Target was shifted down into top scratch: restore it upwards towards 0 first
                    const stepY = Math.max(15, Math.round(dy * 0.8));
                    const newTop = Math.max(0, currentTop - stepY);
                    targetEl.style.top = (newTop === 0 ? '' : newTop + 'px');
                    if (newTop === 0 && (parseFloat(targetEl.style.left) || baseLeft) === baseLeft) {
                        delete targetEl.dataset.customPanOffset;
                    }
                    if (e.cancelable) e.preventDefault();
                    handled = true;
                } else {
                    // Native downward scroll: if at bottom boundary, extend bottom scratch
                    const atBottom = (vp.scrollTop + vp.clientHeight >= vp.scrollHeight - 15);
                    if (atBottom) {
                        const inc = Math.max(100, Math.round(Math.abs(dy) * 2));
                        window._extraBottomScratch = (window._extraBottomScratch || 0) + inc;
                        handled = true;
                    }
                }
            }
        }

        // --- HORIZONTAL WHEEL SCROLLING (LEFT / RIGHT) ---
        if (dx !== 0) {
            if (dx < 0) {
                // User wants to scroll LEFT
                if (currentLeft < baseLeft) {
                    // Target was previously panned leftwards past baseLeft: restore right towards baseLeft
                    const stepX = Math.max(15, Math.round(Math.abs(dx) * 0.8));
                    const newLeft = Math.min(baseLeft, currentLeft + stepX);
                    targetEl.style.left = (newLeft === baseLeft ? (!isMulti && !hasCustomMargin && shiftNeeded > 0 ? shiftNeeded + 'px' : '') : newLeft + 'px');
                    if (newLeft === baseLeft && (parseFloat(targetEl.style.top) || 0) === 0) {
                        delete targetEl.dataset.customPanOffset;
                    }
                    if (e.cancelable) e.preventDefault();
                    handled = true;
                } else if (vp.scrollLeft <= 2) {
                    // At left boundary: push target right to reveal scratch area to the left
                    const stepX = Math.max(15, Math.round(Math.abs(dx) * 0.8));
                    targetEl.style.left = (currentLeft + stepX) + 'px';
                    targetEl.dataset.customPanOffset = "true";
                    if (e.cancelable) e.preventDefault();
                    handled = true;
                }
                // Otherwise vp.scrollLeft > 2: allow native leftward scrolling
            } else {
                // User wants to scroll RIGHT (dx > 0)
                if (currentLeft > baseLeft) {
                    // Target was shifted right into left scratch: restore it left towards baseLeft first
                    const stepX = Math.max(15, Math.round(dx * 0.8));
                    const newLeft = Math.max(baseLeft, currentLeft - stepX);
                    targetEl.style.left = (newLeft === baseLeft ? (!isMulti && !hasCustomMargin && shiftNeeded > 0 ? shiftNeeded + 'px' : '') : newLeft + 'px');
                    if (newLeft === baseLeft && (parseFloat(targetEl.style.top) || 0) === 0) {
                        delete targetEl.dataset.customPanOffset;
                    }
                    if (e.cancelable) e.preventDefault();
                    handled = true;
                } else {
                    // Native rightward scroll: if at right boundary, extend right scratch
                    const atRight = (vp.scrollLeft + vp.clientWidth >= vp.scrollWidth - 15);
                    if (atRight) {
                        const inc = Math.max(100, Math.round(Math.abs(dx) * 2));
                        window._extraRightScratch = (window._extraRightScratch || 0) + inc;
                        handled = true;
                    }
                }
            }
        }

        if (handled) {
            if (typeof window.updateCanvasScrollBounds === 'function') window.updateCanvasScrollBounds();
            if (typeof window.syncRulers === 'function') window.syncRulers();
            if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
            if (typeof window.checkPageVisibility === 'function') window.checkPageVisibility();
        }
    }, { passive: false });
};

window.setZoom = function(z) {
    state.zoom = z;
    const paperEl = document.getElementById('paper');
    if (paperEl && (!state.viewMode || state.viewMode === 'single')) {
        paperEl.style.transform = `scale(${z})`;
        paperEl.style.setProperty('--zoom-level', z);
    }
    if (state.viewMode === 'multipage' && window._multiPageActive) {
        if (typeof refreshMultiPageZoom === 'function') refreshMultiPageZoom(z);
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

    if (window._zoomWaTimer) clearTimeout(window._zoomWaTimer);
    window._zoomWaTimer = setTimeout(() => {
        if (typeof window.upgradeAllCanvasWordArt === 'function') {
            window.upgradeAllCanvasWordArt(paperEl);
        }
    }, 200);
    if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
    if (typeof window.updateCanvasScrollBounds === 'function') window.updateCanvasScrollBounds();
    if (typeof state !== 'undefined' && state.selectedEl && typeof window.updateArrowTipOverlay === 'function') {
        const overlay = document.querySelector('.selected-overlay');
        if (overlay) window.updateArrowTipOverlay(overlay, state.selectedEl);
    }
    if (typeof window.SpellCheckEngine !== 'undefined') {
        window.SpellCheckEngine.trigger(100);
    }
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

    if (window._multiPageActive || (typeof state !== 'undefined' && state.viewMode === 'multipage')) {
        ov.style.display = 'none';
        return;
    }

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
    const isCard = (typeof state !== 'undefined') && (state.format === 'BusinessCard' || (state.pages && state.pages[state.currentPageIndex] && state.pages[state.currentPageIndex].format === 'BusinessCard'));
    const defaultM = Math.round((isCard ? 0.125 : 0.5) * curDpi);
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

// --- MULTI-PAGE VIEW & VIEW MODES ---
// Decoupled from viewport zoom: zoom level scales the active view mode (single or multipage)
// without ever automatically triggering a layout switch. Multi-Page Overview is an explicit toggle.
window._multiPageActive = false;

window.getMultiPageThreshold = function(pageDpi) {
    return 0.2;
};

window.showMultiPageIntroModal = function(force = false) {
    if (!force) {
        try {
            if (localStorage.getItem('op_hide_multipage_intro') === '1') {
                return;
            }
        } catch (e) {}
    }
    if (typeof DialogSystem === 'undefined') return;

    const html = `
        <div class="multipage-dialog-box">
            <div class="multipage-dialog-header-wrap">
                <div class="multipage-dialog-icon">
                    <i class="fas fa-th-large" style="color:var(--ui-theme-color, #008080); font-size:20px;"></i>
                </div>
                <div>
                    <div style="font-weight:700; font-size:14px; margin-bottom:3px;">Multi-Page Overview Mode</div>
                    <div style="opacity:0.8; font-size:12px;">Preview and organize all pages in your publication side-by-side.</div>
                </div>
            </div>

            <div class="multipage-dialog-card">
                <div style="font-weight:600; font-size:12px; margin-bottom:6px; color:var(--ui-theme-color, #008080);">
                    <i class="fas fa-tools" style="margin-right:5px;"></i> Mode Functions & Navigation
                </div>
                <ul style="margin:0; padding-left:18px; font-size:12px; line-height:1.6; opacity:0.9;">
                    <li><b>Select & Center:</b> Single-click any page thumbnail or slot to center it in view.</li>
                    <li><b>Edit Page:</b> Double-click any page or press <kbd style="background:rgba(0,0,0,0.06); border:1px solid rgba(0,0,0,0.15); border-radius:3px; padding:1px 5px; font-size:11px;">Enter</kbd> to return to Single-Page editing mode.</li>
                    <li><b>Arrow Navigation:</b> Use <kbd style="background:rgba(0,0,0,0.06); border:1px solid rgba(0,0,0,0.15); border-radius:3px; padding:1px 5px; font-size:11px;">Left</kbd> and <kbd style="background:rgba(0,0,0,0.06); border:1px solid rgba(0,0,0,0.15); border-radius:3px; padding:1px 5px; font-size:11px;">Right</kbd> arrow keys to navigate between pages, or <kbd style="background:rgba(0,0,0,0.06); border:1px solid rgba(0,0,0,0.15); border-radius:3px; padding:1px 5px; font-size:11px;">Esc</kbd> to exit.</li>
                    <li><b>Zoom & Pan:</b> Use the zoom slider, mouse wheel, or pan tool to inspect your layout at any scale.</li>
                </ul>
            </div>

            <div class="multipage-dialog-warning">
                <div style="font-weight:600; font-size:12px; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
                    <i class="fas fa-ruler-combined"></i> Why are rulers and margin guides hidden?
                </div>
                <div style="font-size:12px; line-height:1.5;">
                    Rulers and margin guides measure relative to a single active page origin. In Multi-Page Overview, multiple pages tile across differing canvas positions, so rulers are temporarily hidden to prevent misleading coordinates. They will automatically restore when you return to Single-Page mode.
                </div>
            </div>

            <label style="display:flex; align-items:center; gap:8px; font-size:12px; opacity:0.85; cursor:pointer; user-select:none; margin-top:6px;">
                <input type="checkbox" id="op-multipage-intro-dont-show" onchange="try { if (this.checked) localStorage.setItem('op_hide_multipage_intro', '1'); else localStorage.removeItem('op_hide_multipage_intro'); } catch(e){}" style="cursor:pointer;" />
                Do not show this notice again
            </label>
        </div>
    `;

    DialogSystem.show('Multi-Page Overview', html, null, true, 'Got It');
};

window.setViewMode = function(mode) {
    if (typeof state === 'undefined') return;
    if (mode === 'multipage') {
        if (!state.pages || state.pages.length <= 1) {
            // Cannot enter multi-page overview if there is only 1 page
            const statusMsg = document.getElementById('status-msg');
            if (statusMsg) statusMsg.innerText = 'Multi-Page Overview requires at least 2 pages';
            mode = 'single';
        }
    }
    state.viewMode = mode;
    if (mode === 'multipage') {
        if (!window._multiPageActive) {
            enterMultiPageView(state.zoom);
            window.showMultiPageIntroModal();
        }
    } else {
        if (window._multiPageActive) {
            exitMultiPageView();
        }
    }
    window.updateViewModeUI();
};

window.toggleMultiPageView = function() {
    const newMode = (state.viewMode === 'multipage') ? 'single' : 'multipage';
    window.setViewMode(newMode);
};

window.updateViewModeUI = function() {
    const isMulti = typeof state !== 'undefined' && state.viewMode === 'multipage';
    
    // Ribbon buttons
    const btnRibbonSingle = document.getElementById('ribbon-view-single');
    const btnRibbonMulti = document.getElementById('ribbon-view-multi');
    if (btnRibbonSingle) btnRibbonSingle.classList.toggle('active-tool', !isMulti);
    if (btnRibbonMulti) btnRibbonMulti.classList.toggle('active-tool', isMulti);

    // Status bar buttons
    const statusSingle = document.getElementById('status-view-single');
    const statusMulti = document.getElementById('status-view-multi');
    if (statusSingle) statusSingle.classList.toggle('active', !isMulti);
    if (statusMulti) statusMulti.classList.toggle('active', isMulti);
};

window.selectMultiPageSlot = function(index) {
    if (typeof state === 'undefined' || !state.pages || !state.pages[index]) return;
    state.currentPageIndex = index;
    window.highlightAndCenterMultiPageSlot(index);
    if (typeof updateSidebar === 'function') updateSidebar();
    const pageCountStatus = document.getElementById('page-count-status');
    if (pageCountStatus) pageCountStatus.innerText = `Page ${index + 1} of ${state.pages.length}`;
};

window.highlightAndCenterMultiPageSlot = function(index) {
    const wrapper = document.getElementById('multi-page-wrapper');
    const viewport = document.getElementById('viewport');
    if (!wrapper || !viewport) return;

    const slots = wrapper.querySelectorAll('.multi-page-slot');
    slots.forEach((s, idx) => {
        const isActive = (idx === index);
        s.classList.toggle('multi-page-slot-active', isActive);
        const lbl = s.querySelector('.multi-page-label');
        if (lbl) {
            lbl.classList.toggle('multi-page-label-active', isActive);
            let baseTxt = state.hasMasterPage && idx === 0 ? 'Master Page' : `Page ${idx + 1}`;
            lbl.textContent = isActive ? `${baseTxt} (Selected - Double-click to Edit)` : baseTxt;
        }
    });

    const targetSlot = slots[index];
    if (targetSlot) {
        const z = (typeof state !== 'undefined' && state.zoom) ? state.zoom : 1;
        const wrapperLeft = wrapper.offsetLeft || 0;
        const slotCenter = wrapperLeft + ((targetSlot.offsetLeft + targetSlot.offsetWidth / 2) * z);
        const vpCenter = viewport.clientWidth / 2;
        const scrollTarget = Math.max(0, Math.min(viewport.scrollWidth - viewport.clientWidth, Math.round(slotCenter - vpCenter)));
        viewport.scrollTo({ left: scrollTarget, top: 0, behavior: 'smooth' });
    }
};

window.openPageInSingleMode = function(index) {
    if (typeof state === 'undefined') return;
    if (typeof switchPage === 'function' && state.currentPageIndex !== index) {
        switchPage(index);
    } else {
        state.currentPageIndex = index;
    }
    window.setViewMode('single');
    setTimeout(() => {
        if (typeof window.returnToPage === 'function') window.returnToPage(true);
        else if (typeof fitToPage === 'function') fitToPage();
    }, 30);
};

function updateMultiPageView(z) {
    // Only update if multi-page view is explicitly active
    if (state && state.viewMode === 'multipage' && window._multiPageActive) {
        refreshMultiPageZoom(z);
    }
}

function enterMultiPageView(z) {
    const viewport = document.getElementById('viewport');
    const paperEl = document.getElementById('paper');
    if (!viewport || !paperEl) return;
    if (!state.pages || state.pages.length <= 1) return;

    // Save active page state before switching view
    if (typeof serializeCurrentPage === 'function' && state.pages[state.currentPageIndex]) {
        state.pages[state.currentPageIndex] = serializeCurrentPage();
    }

    window._multiPageActive = true;
    state.viewMode = 'multipage';
    viewport.classList.add('multi-page-mode');
    viewport.style.justifyContent = 'flex-start';
    viewport.style.alignItems = 'flex-start';

    const canvasArea = document.getElementById('canvas-area');
    if (canvasArea) canvasArea.classList.add('multi-page-canvas');
    if (window.syncRulers) window.syncRulers();

    // Hide fixed margin guide overlay while in multi-page mode
    const ov = document.getElementById('margin-guide-overlay');
    if (ov) ov.style.display = 'none';

    // Paper is hidden in multi-page mode; preview containers represent all pages
    paperEl.style.display = 'none';

    const pageDpi = (state.pages && state.pages[state.currentPageIndex] && parseFloat(state.pages[state.currentPageIndex].dpi)) 
        || (typeof state !== 'undefined' && parseFloat(state.dpi)) 
        || 96;
    const dpiRatio = pageDpi / 96;
    const gap = Math.round(30 * dpiRatio);
    const pad = Math.round(30 * dpiRatio);
    const borderWidth = Math.max(2, Math.round(2 * dpiRatio));

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

        const slot = document.createElement('div');
        const isActive = (i === state.currentPageIndex);
        slot.className = `multi-page-slot ${isActive ? 'multi-page-slot-active' : ''}`;
        slot.setAttribute('data-page-index', i);
        slot.style.width = pW + 'px';
        slot.style.height = pH + 'px';
        slot.style.borderWidth = borderWidth + 'px';
        slot.title = `Page ${i + 1} - Click to select, Double-click to edit`;

        slot.onclick = (e) => {
            e.stopPropagation();
            window.selectMultiPageSlot(i);
        };

        slot.ondblclick = (e) => {
            e.stopPropagation();
            window.openPageInSingleMode(i);
        };

        // Build preview container
        const previewContainer = document.createElement('div');
        previewContainer.style.cssText = `position: relative; width: ${pW}px; height: ${pH}px; background: ${pageData.background || '#ffffff'}; overflow: hidden; pointer-events: none;`;

        // Render master page elements if applicable
        if (state.hasMasterPage && i !== 0 && state.pages[0] && !pageData.ignoreMasterPage && state.pages[0].elements) {
            state.pages[0].elements.forEach(data => {
                const sX = data.scaleX || "1";
                const sY = data.scaleY || "1";
                const elBox = document.createElement('div');
                const zVal = (data.zIndex !== undefined && data.zIndex !== null && data.zIndex !== '') ? data.zIndex : 5;
                elBox.style.cssText = `position: absolute; left: ${data.left}; top: ${data.top}; width: ${data.width}; height: ${data.height}; transform: ${data.transform || 'none'}; z-index: ${zVal}; opacity: 0.9;`;
                const scaleBox = document.createElement('div');
                scaleBox.style.cssText = `transform: scale(${sX}, ${sY}); width: 100%; height: 100%; overflow: hidden; position: relative; transform-origin: center center; outline: none; border: none;`;
                if (data.contentCssText) scaleBox.style.cssText += ' ' + data.contentCssText;
                if (data.imgSrc && data.imgSrc !== '') {
                    const imgDiv = document.createElement('div');
                    const s = data.imgStyle || {};
                    let thumbImgCss = `width: ${s.width||'100%'}; height: ${s.height||'100%'}; top: ${s.top||0}; left: ${s.left||0}; position: ${s.position||'absolute'}; filter: ${s.filter||'none'}; display: block;`;
                    const effectiveClip = s.clipPath || data.clipPath;
                    if (effectiveClip && effectiveClip !== 'none') {
                        thumbImgCss += ` clip-path: ${effectiveClip}; -webkit-clip-path: ${effectiveClip};`;
                    }
                    const effectiveRadius = s.borderRadius || data.borderRadius || (data.filterAttributes && data.filterAttributes['data-rounded-corners']);
                    if (effectiveRadius && effectiveRadius !== 'none') {
                        thumbImgCss += ` border-radius: ${effectiveRadius};`;
                        scaleBox.style.borderRadius = effectiveRadius;
                        scaleBox.style.overflow = 'hidden';
                        scaleBox.style.clipPath = `inset(0 round ${effectiveRadius})`;
                    }
                    imgDiv.style.cssText = thumbImgCss;
                    let objFit = s.objectFit || data.objectFit || '100% 100%';
                    if (objFit === 'fill') objFit = '100% 100%';
                    if (objFit === 'contain') objFit = 'contain';
                    imgDiv.style.background = `url('${data.imgSrc}') center center / ${objFit} no-repeat`;
                    scaleBox.appendChild(imgDiv);
                } else if (data.clipPath && !data.innerHTML) {
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

        // Render page elements
        if (pageData.elements && pageData.elements.length > 0) {
            pageData.elements.forEach(data => {
                const sX = data.scaleX || "1";
                const sY = data.scaleY || "1";

                const elBox = document.createElement('div');
                const zVal = (data.zIndex !== undefined && data.zIndex !== null && data.zIndex !== '') ? data.zIndex : 10;
                elBox.style.cssText = `position: absolute; left: ${data.left}; top: ${data.top}; width: ${data.width}; height: ${data.height}; transform: ${data.transform || 'none'}; z-index: ${zVal};`;

                const scaleBox = document.createElement('div');
                scaleBox.style.cssText = `transform: scale(${sX}, ${sY}); width: 100%; height: 100%; overflow: hidden; position: relative; transform-origin: center center; outline: none; border: none;`;
                if (data.contentCssText) scaleBox.style.cssText += ' ' + data.contentCssText;

                if (data.imgSrc && data.imgSrc !== '') {
                    const imgDiv = document.createElement('div');
                    const s = data.imgStyle || {};
                    let thumbImgCss = `width: ${s.width||'100%'}; height: ${s.height||'100%'}; top: ${s.top||0}; left: ${s.left||0}; position: ${s.position||'absolute'}; filter: ${s.filter||'none'}; display: block;`;
                    const effectiveClip = s.clipPath || data.clipPath;
                    if (effectiveClip && effectiveClip !== 'none') {
                        thumbImgCss += ` clip-path: ${effectiveClip}; -webkit-clip-path: ${effectiveClip};`;
                    }
                    const effectiveRadius = s.borderRadius || data.borderRadius || (data.filterAttributes && data.filterAttributes['data-rounded-corners']);
                    if (effectiveRadius && effectiveRadius !== 'none') {
                        thumbImgCss += ` border-radius: ${effectiveRadius};`;
                        scaleBox.style.borderRadius = effectiveRadius;
                        scaleBox.style.overflow = 'hidden';
                        scaleBox.style.clipPath = `inset(0 round ${effectiveRadius})`;
                    }
                    imgDiv.style.cssText = thumbImgCss;
                    let objFit = s.objectFit || data.objectFit || '100% 100%';
                    if (objFit === 'fill') objFit = '100% 100%';
                    if (objFit === 'contain') objFit = 'contain';
                    imgDiv.style.background = `url('${data.imgSrc}') center center / ${objFit} no-repeat`;
                    scaleBox.appendChild(imgDiv);
                } else if (data.clipPath && !data.innerHTML) {
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
        label.className = `multi-page-label ${isActive ? 'multi-page-label-active' : ''}`;
        let labelText = state.hasMasterPage && i === 0 ? 'Master Page' : `Page ${i + 1}`;
        label.textContent = isActive ? `${labelText} (Selected - Double-click to Edit)` : labelText;
        label.style.fontSize = Math.round(13 * dpiRatio) + 'px';
        label.style.bottom = `-${Math.round(28 * dpiRatio)}px`;
        slot.appendChild(label);

        wrapper.appendChild(slot);
    });

    // Save pre-overview zoom so single page editing zoom can be restored on exit
    if (typeof window._preMultiPageZoom !== 'number') {
        window._preMultiPageZoom = (state && typeof state.zoom === 'number') ? state.zoom : 1.0;
    }

    // Calculate a comfortable zoom level for overview if current zoom is too large
    let targetZoom = z || state.zoom || 0.35;
    if (targetZoom > 0.4) {
        if (viewport && viewport.clientHeight) {
            const pRatio = pageDpi / 96;
            const approxH = (1123 * pRatio) + 120;
            targetZoom = Math.min(0.4, Math.max(0.1, (viewport.clientHeight - 80) / approxH));
        } else {
            targetZoom = 0.35;
        }
    }
    state.zoom = targetZoom;
    const slider = document.getElementById('zoom-slider');
    if (slider) slider.value = Math.round(targetZoom * 100);
    const display = document.getElementById('zoom-level-display');
    if (display) display.textContent = Math.round(targetZoom * 100) + '%';

    refreshMultiPageZoom(targetZoom);
    window._extraBottomScratch = 0;
    window._extraRightScratch = 0;
    if (typeof window.updateCanvasScrollBounds === 'function') window.updateCanvasScrollBounds();
    window.updateViewModeUI();

    // Center active page in viewport
    setTimeout(() => {
        window.highlightAndCenterMultiPageSlot(state.currentPageIndex);
    }, 30);
}

function refreshMultiPageZoom(z) {
    const wrapper = document.getElementById('multi-page-wrapper');
    if (!wrapper) return;

    const pageDpi = (state.pages && state.pages[state.currentPageIndex] && parseFloat(state.pages[state.currentPageIndex].dpi)) 
        || (typeof state !== 'undefined' && parseFloat(state.dpi)) 
        || 96;
    const dpiRatio = pageDpi / 96;
    const GAP = Math.round(30 * dpiRatio);
    const PADDING = Math.round(60 * dpiRatio);

    let totalWidth = PADDING;
    let maxHeight = 0;
    const slots = wrapper.querySelectorAll('.multi-page-slot');
    slots.forEach((slot, i) => {
        const slotW = parseFloat(slot.style.width) || (794 * dpiRatio);
        const slotH = parseFloat(slot.style.height) || (1123 * dpiRatio);
        totalWidth += slotW;
        if (slotH > maxHeight) maxHeight = slotH;
        if (i < slots.length - 1) totalWidth += GAP;
    });
    totalWidth += PADDING;
    maxHeight += PADDING * 2;

    wrapper._totalUnscaledWidth = totalWidth;
    wrapper._totalUnscaledHeight = maxHeight;
    wrapper.style.width = totalWidth + 'px';
    wrapper.style.minWidth = totalWidth + 'px';
    wrapper.style.transform = `scale(${z})`;
    if (typeof window.updateCanvasScrollBounds === 'function') {
        window.updateCanvasScrollBounds();
    }
}

function exitMultiPageView() {
    const viewport = document.getElementById('viewport');
    const paperEl = document.getElementById('paper');
    if (!viewport || !paperEl) return;

    window._multiPageActive = false;
    state.viewMode = 'single';
    viewport.classList.remove('multi-page-mode');
    const hasCustomMargin = !!(paperEl.style.marginLeft && paperEl.style.marginLeft !== '' && paperEl.style.marginLeft !== '0px');
    viewport.style.justifyContent = hasCustomMargin ? 'flex-start' : '';
    viewport.style.alignItems = '';

    const canvasArea = document.getElementById('canvas-area');
    if (canvasArea) canvasArea.classList.remove('multi-page-canvas');

    const wrapper = document.getElementById('multi-page-wrapper');
    if (wrapper) wrapper.remove();

    // Restore zoom level saved prior to entering multi-page overview
    let restoredZoom = 1.0;
    if (typeof window._preMultiPageZoom === 'number' && window._preMultiPageZoom >= 0.2) {
        restoredZoom = window._preMultiPageZoom;
        delete window._preMultiPageZoom;
    } else if (typeof state.zoom === 'number' && state.zoom > 0.4) {
        restoredZoom = state.zoom;
    }
    state.zoom = restoredZoom;

    const zoomSlider = document.getElementById('zoom-slider');
    if (zoomSlider) {
        zoomSlider.value = Math.round(restoredZoom * 100);
        zoomSlider.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const zoomDisplay = document.getElementById('zoom-level-display');
    if (zoomDisplay) zoomDisplay.textContent = Math.round(restoredZoom * 100) + '%';

    // Restore paper display and zoom
    paperEl.style.display = '';
    paperEl.style.transform = `scale(${state.zoom})`;
    paperEl.style.top = '';
    paperEl.style.left = '';
    delete paperEl.dataset.customPanOffset;
    window._extraBottomScratch = 0;
    window._extraRightScratch = 0;

    // Re-render active page into paper
    if (typeof renderPage === 'function' && state.pages && state.pages[state.currentPageIndex]) {
        renderPage(state.pages[state.currentPageIndex]);
    }

    if (typeof window.updateCanvasScrollBounds === 'function') {
        window.updateCanvasScrollBounds();
    }

    // Immediately center viewport directly on the page without smooth glide lag
    if (typeof window.returnToPage === 'function') {
        window.returnToPage(true);
    } else {
        viewport.scrollTop = 0;
        if (hasCustomMargin && viewport.scrollWidth > viewport.clientWidth) {
            const paperVisualCenter = paperEl.offsetLeft + (paperEl.offsetWidth / 2);
            viewport.scrollLeft = Math.max(0, Math.min(viewport.scrollWidth - viewport.clientWidth, Math.round(paperVisualCenter - (viewport.clientWidth / 2))));
        } else {
            viewport.scrollLeft = 0;
        }
    }

    // Schedule secondary syncs to absorb NW.js custom margin recalculations and reflows
    setTimeout(() => {
        if (state && state.viewMode === 'single' && typeof window.returnToPage === 'function') {
            window.returnToPage(true);
        }
    }, 30);
    setTimeout(() => {
        if (state && state.viewMode === 'single' && typeof window.returnToPage === 'function') {
            window.returnToPage(true);
        }
    }, 100);

    const returnBtn = document.getElementById('floating-return-to-page-btn');
    if (returnBtn) returnBtn.classList.remove('visible');

    if (window.syncRulers) window.syncRulers();
    if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
    window.updateViewModeUI();
}

window.fitToPage = function() {
    const viewport = document.getElementById('viewport');
    if (state.viewMode === 'multipage') {
        const wrapper = document.getElementById('multi-page-wrapper');
        if (!viewport || !wrapper) return;
        const totalW = wrapper._totalUnscaledWidth || 2000;
        const totalH = wrapper._totalUnscaledHeight || 1200;
        const pad = 80;
        const vpW = viewport.clientWidth || (window.innerWidth - 300);
        const vpH = viewport.clientHeight || (window.innerHeight - 150);
        const scaleX = (vpW - pad) / totalW;
        const scaleY = (vpH - pad) / totalH;
        const z = Math.min(scaleX, scaleY);
        setZoom(Math.max(0.04, Math.min(1.0, z)));
        return;
    }

    const paperEl = document.getElementById('paper');
    if (!viewport || !paperEl) return;
    const paperW = paperEl.offsetWidth || parseInt(paperEl.style.width) || (state.pages && state.pages[state.currentPageIndex] && parseInt(state.pages[state.currentPageIndex].width)) || 794;
    const paperH = paperEl.offsetHeight || parseInt(paperEl.style.height) || (state.pages && state.pages[state.currentPageIndex] && parseInt(state.pages[state.currentPageIndex].height)) || 1123;
    if (paperW <= 0 || paperH <= 0) return;

    const vpW = viewport.clientWidth || (window.innerWidth - 300);
    const vpH = viewport.clientHeight || (window.innerHeight - 150);
    const padding = 80; // 40px padding on top/bottom
    const scaleX = (vpW - padding) / paperW;
    const scaleY = (vpH - padding) / paperH;
    const z = Math.min(scaleX, scaleY);
    const pageDpi = (state.pages && state.pages[state.currentPageIndex] && parseFloat(state.pages[state.currentPageIndex].dpi)) 
        || (typeof state !== 'undefined' && parseFloat(state.dpi)) 
        || 96;
    const minZoom = Math.max(0.02, Math.min(0.2, 0.2 * (96 / pageDpi)));
    setZoom(Math.max(minZoom, Math.min(3.0, z)));
    viewport.scrollTop = 0;
    const hasCustomMargin = !!(paperEl.style.marginLeft && paperEl.style.marginLeft !== '' && paperEl.style.marginLeft !== '0px');
    if (hasCustomMargin && viewport.scrollWidth > vpW) {
        const paperVisualCenter = paperEl.offsetLeft + (paperW / 2);
        viewport.scrollLeft = Math.max(0, Math.min(viewport.scrollWidth - vpW, Math.round(paperVisualCenter - (vpW / 2))));
    } else {
        viewport.scrollLeft = Math.max(0, (paperW * z - vpW) / 2);
    }
};

window.fitToWidth = function() {
    const viewport = document.getElementById('viewport');
    const paperEl = document.getElementById('paper');
    if (!viewport || !paperEl) return;
    const paperW = paperEl.offsetWidth || parseInt(paperEl.style.width) || (state.pages && state.pages[state.currentPageIndex] && parseInt(state.pages[state.currentPageIndex].width)) || 794;
    if (paperW <= 0) return;
    const vpW = viewport.clientWidth || (window.innerWidth - 300);
    const padding = 80;
    const scaleX = (vpW - padding) / paperW;
    const pageDpi = (state.pages && state.pages[state.currentPageIndex] && parseFloat(state.pages[state.currentPageIndex].dpi)) 
        || (typeof state !== 'undefined' && parseFloat(state.dpi)) 
        || 96;
    const minZoom = Math.max(0.02, Math.min(0.2, 0.2 * (96 / pageDpi)));
    setZoom(Math.max(minZoom, Math.min(3.0, scaleX)));
    const hasCustomMargin = !!(paperEl.style.marginLeft && paperEl.style.marginLeft !== '' && paperEl.style.marginLeft !== '0px');
    if (hasCustomMargin && viewport.scrollWidth > vpW) {
        const paperVisualCenter = paperEl.offsetLeft + (paperW / 2);
        viewport.scrollLeft = Math.max(0, Math.min(viewport.scrollWidth - vpW, Math.round(paperVisualCenter - (vpW / 2))));
    } else {
        viewport.scrollLeft = Math.max(0, (paperW * scaleX - vpW) / 2);
    }
};

window.focusPage = function(pageIndex = null) {
    // 1. Ensure single page mode if in multi-page mode
    if (state.viewMode === 'multipage' && typeof window.setViewMode === 'function') {
        const targetIdx = (typeof pageIndex === 'number') ? pageIndex : (state.currentPageIndex || 0);
        if (typeof window.openPageInSingleMode === 'function') {
            window.openPageInSingleMode(targetIdx);
        } else {
            window.setViewMode('single');
        }
    }

    // 2. Switch to target page if requested
    if (typeof pageIndex === 'number' && pageIndex >= 0 && state.pages && pageIndex < state.pages.length) {
        if (state.currentPageIndex !== pageIndex && typeof renderPage === 'function' && state.pages[pageIndex]) {
            state.currentPageIndex = pageIndex;
            renderPage(state.pages[pageIndex]);
        }
    }

    // 3. Clear active selection so focus rests cleanly on the page canvas
    state.selectedEl = null;
    if (typeof window.clearSelectionOverlays === 'function') {
        window.clearSelectionOverlays();
    }
    const floatBar = document.getElementById('float-toolbar');
    if (floatBar) floatBar.style.display = 'none';

    // 4. Centering and viewport positioning
    const viewport = document.getElementById('viewport');
    const paperEl = document.getElementById('paper');
    if (!viewport || !paperEl) return;

    // Reset pan offsets
    paperEl.style.left = '';
    paperEl.style.top = '';
    if (paperEl.hasAttribute('tabindex')) {
        paperEl.removeAttribute('tabindex');
    }

    // Reset viewport vertical scroll to top of document
    viewport.scrollTop = 0;

    // Fit page to viewport to calculate ideal optical scale for current DPI and paper size
    if (typeof window.fitToPage === 'function') {
        window.fitToPage();
    }

    if (typeof window.updateCanvasScrollBounds === 'function') {
        window.updateCanvasScrollBounds();
    }
    viewport.scrollTop = 0;

    if (typeof window.returnToPage === 'function') {
        window.returnToPage(true);
    }

    // Synchronize all canvas overlays, rulers, and tools
    if (typeof window.syncRulers === 'function') window.syncRulers();
    if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
    if (typeof window.syncHandleScaling === 'function') window.syncHandleScaling(state.zoom);
    if (window.minimapSystem && typeof window.minimapSystem.updateMinimap === 'function') {
        window.minimapSystem.updateMinimap();
    }
};

// Initialize handle scaling
if (typeof window.syncHandleScaling === 'function') {
    window.syncHandleScaling(0.6);
}

if (typeof window.initCanvasScrollEnhancements === 'function') {
    window.initCanvasScrollEnhancements();
}


