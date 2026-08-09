function handleMouseDown(e) {
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
        return;
    }

    if(e.target === paper || e.target.classList.contains('margin-guides')) {
        deselect();
        return;
    }

    if(state.shapeEditMode && e.target.classList.contains('shape-edit-handle')) {
        state.dragMode = 'shape-point';
        state.dragData = {
            index: parseInt(e.target.dataset.index),
            startX: e.clientX,
            startY: e.clientY
        };
        e.preventDefault();
        return;
    }


    // Handle Cropping Logic
    if(state.cropMode && state.selectedEl) {
        if(e.target.classList.contains('resize-handle')) {
            state.dragMode = 'resize'; 
            state.dragData = {
                dir: e.target.dataset.dir,
                startX: e.clientX, startY: e.clientY,
                w: parseFloat(state.selectedEl.style.width),
                h: parseFloat(state.selectedEl.style.height),
                l: parseFloat(state.selectedEl.style.left),
                t: parseFloat(state.selectedEl.style.top)
            };
            e.preventDefault();
            return;
        }
        
        if(e.target.tagName === 'IMG' && e.target.closest('.pub-element') === state.selectedEl) {
            state.dragMode = 'pan-image';
            const img = e.target;
            state.dragData = {
                startX: e.clientX, startY: e.clientY,
                l: parseFloat(img.style.left) || 0,
                t: parseFloat(img.style.top) || 0
            };
            e.preventDefault();
            return;
        }
        
        if(!e.target.closest('.pub-element.cropping')) {
            toggleCrop();
        }
    }

    // Standard Logic (Resize/Rotate)
    if(e.target.classList.contains('rotate-handle') || e.target.classList.contains('resize-handle')) {
        if(e.target.classList.contains('rotate-handle')) {
            state.dragMode = 'rotate';
            const rect = state.selectedEl.getBoundingClientRect();
            state.dragData = { cx: rect.left + rect.width/2, cy: rect.top + rect.height/2 };
        } else {
            state.dragMode = 'resize';
            const content = state.selectedEl.querySelector('.element-content');
            // Store current scale state
            const curSX = parseFloat(state.selectedEl.getAttribute('data-scaleX')) || 1;
            const curSY = parseFloat(state.selectedEl.getAttribute('data-scaleY')) || 1;

            state.dragData = {
                dir: e.target.dataset.dir,
                startX: e.clientX, startY: e.clientY,
                w: parseFloat(state.selectedEl.style.width),
                h: parseFloat(state.selectedEl.style.height),
                l: parseFloat(state.selectedEl.style.left),
                t: parseFloat(state.selectedEl.style.top),
                scaleX: curSX,
                scaleY: curSY
            };
        }
        e.preventDefault(); 
        return;
    }

    const el = e.target.closest('.pub-element');
    if(el) {
        // If not already selected, select it
        const isSelected = (state.selectedEl === el);
        if(!isSelected) selectElement(el);
        
        // Click on WordArt to edit?
        if(el.querySelector('.wa-text') && isSelected) {
            // Do nothing here, allow drag, double click handles edit
        }

        // --- EDGE DRAG LOGIC (Robust) ---
        const isClipart = el.querySelector('svg');
        const isImage = el.querySelector('img');
        const isShape = el.getAttribute('data-type') === 'shape';
        
        // 1. NON-TEXT ITEMS: Always drag immediately
        if(isClipart || isImage || isShape) {
             state.dragMode = 'drag';
             state.dragData = {
                startX: e.clientX, startY: e.clientY,
                l: parseFloat(el.style.left), t: parseFloat(el.style.top)
             };
             e.preventDefault();
             return;
        }

        // 2. TEXT/EDITABLE ITEMS:
        // Drag if clicking edge OR using move cursor area
        const rect = el.getBoundingClientRect();
        const edgeSize = 15; 
        const x = e.clientX; 
        const y = e.clientY;
        
        const nearEdge = (x < rect.left + edgeSize) || (x > rect.right - edgeSize) || 
                         (y < rect.top + edgeSize) || (y > rect.bottom - edgeSize);
        
        // --- FIX: Allow dragging over and over unless specifically in text edit mode ---
        // If the user clicks inside, but isn't explicitly targeting a text cursor or selected text
        // we should allow drag. 
        const activeEl = document.activeElement;
        const isEditingText = activeEl && el.contains(activeEl) && (activeEl.isContentEditable);
        
        if (nearEdge || !isEditingText) {
            state.dragMode = 'drag';
            state.dragData = {
                startX: e.clientX, startY: e.clientY,
                l: parseFloat(el.style.left), t: parseFloat(el.style.top)
            };
            if(!isEditingText) e.preventDefault(); 
        }
    }
}

function handleMouseMove(e) {
    document.getElementById('coord-display').innerText = `X: ${e.clientX} | Y: ${e.clientY}`;
    
    // Cursor Update Logic
    if(!state.dragMode && !state.cropMode) {
        const el = e.target.closest('.pub-element');
        if(el) {
            const isShape = el.querySelector('img') || el.querySelector('svg') || el.getAttribute('data-type') === 'shape';
            const rect = el.getBoundingClientRect();
            
            if (isShape) {
                el.style.cursor = 'move';
            } else {
                // For text boxes, only edges are move
                const edgeSize = 15;
                const x = e.clientX; const y = e.clientY;
                const nearEdge = (x < rect.left + edgeSize) || (x > rect.right - edgeSize) || 
                                 (y < rect.top + edgeSize) || (y > rect.bottom - edgeSize);
                el.style.cursor = nearEdge ? 'move' : 'text';
            }
        }
    }

    if(!state.dragMode || !state.selectedEl) return;

    const zoom = state.zoom;
    


    if (state.dragMode === 'drag-guide') {
        const dx = (e.clientX - state.dragData.startX) / zoom;
        const dy = (e.clientY - state.dragData.startY) / zoom;
        
        if (state.dragData.dir === 'h') {
            state.dragData.guide.style.top = (state.dragData.startPos + dy) + 'px';
        } else {
            state.dragData.guide.style.left = (state.dragData.startPos + dx) + 'px';
        }
        return;
    }

    if(state.dragMode === 'drag') {
        const dx = (e.clientX - state.dragData.startX) / zoom;
        const dy = (e.clientY - state.dragData.startY) / zoom;
        let rawX = state.dragData.l + dx;
        let rawY = state.dragData.t + dy;
        
        const snapped = window.applySnapping(rawX, rawY, state.selectedEl.offsetWidth, state.selectedEl.offsetHeight);
        
        state.selectedEl.style.left = snapped.x + 'px';
        state.selectedEl.style.top = snapped.y + 'px';
        
        // Hide toolbar while dragging
        { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
    }
    else if(state.dragMode === 'shape-point') {
        const dx = (e.clientX - state.dragData.startX) / zoom;
        const dy = (e.clientY - state.dragData.startY) / zoom;
        const el = state.selectedEl;
        
        // Convert dx, dy to percentages or SVG coords based on shape size
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        
        const ptIndex = state.dragData.index;
        const pt = window._shapeEditContext.points[ptIndex];
        
        if (window._shapeEditContext.type === 'clip-path') {
            // Percentages
            const pX = (dx / w) * 100;
            const pY = (dy / h) * 100;
            pt.x = Math.max(0, Math.min(100, pt.x + pX));
            pt.y = Math.max(0, Math.min(100, pt.y + pY));
            
            // Apply new clip-path
            const newPoints = window._shapeEditContext.points.map(p => `${p.x}% ${p.y}%`).join(', ');
            window._shapeEditContext.contentDiv.style.clipPath = `polygon(${newPoints})`;
        } else if (window._shapeEditContext.type === 'svg-polygon') {
            // SVG viewbox is usually 0 0 100 100
            const pX = (dx / w) * 100;
            const pY = (dy / h) * 100;
            pt.x = pt.x + pX;
            pt.y = pt.y + pY;
            
            // Apply new points attribute
            const newPoints = window._shapeEditContext.points.map(p => `${p.x},${p.y}`).join(' ');
            window._shapeEditContext.svgPolygon.setAttribute('points', newPoints);
        }
        
        // Update drag start so we do relative steps
        state.dragData.startX = e.clientX;
        state.dragData.startY = e.clientY;
        
        // Update handle position
        const handle = document.querySelector(`.shape-edit-handle[data-index="${ptIndex}"]`);
        if (handle) {
            handle.style.left = pt.x + '%';
            handle.style.top = pt.y + '%';
        }
    }
    else if(state.dragMode === 'pan-image') {
        const dx = (e.clientX - state.dragData.startX) / zoom;
        const dy = (e.clientY - state.dragData.startY) / zoom;
        const img = state.selectedEl.querySelector('img');
        img.style.left = (state.dragData.l + dx) + 'px';
        img.style.top = (state.dragData.t + dy) + 'px';
    }
    else if(state.dragMode === 'rotate') {
        const angle = Math.atan2(e.clientY - state.dragData.cy, e.clientX - state.dragData.cx) * (180/Math.PI);
        state.selectedEl.style.transform = `rotate(${angle + 90}deg)`;
    }
    else if(state.dragMode === 'resize') {
        const dx = (e.clientX - state.dragData.startX) / zoom;
        const dy = (e.clientY - state.dragData.startY) / zoom;
        const d = state.dragData;
        
        // Calculate raw new dimensions
        let rawW = d.w;
        let rawH = d.h;
        let newL = d.l;
        let newT = d.t;
        
        // --- CROP MASKING LOGIC ---
        // If Cropping, dragging Left/Top handles changes container size/pos
        // We must move the inner image inversely to keep it "stationary" visually.
        const isCrop = state.cropMode;
        let imgDx = 0;
        let imgDy = 0;

        // Horizontal
        if (d.dir.includes('e')) {
            rawW = d.w + dx;
        } else if (d.dir.includes('w')) {
            rawW = d.w - dx;
            newL = d.l + dx;
            if(isCrop) imgDx = -dx;
        }
        
        // Vertical
        if (d.dir.includes('s')) {
            rawH = d.h + dy;
        } else if (d.dir.includes('n')) {
            rawH = d.h - dy;
            newT = d.t + dy;
            if(isCrop) imgDy = -dy;
        }

        if (isCrop) {
            // Update Image Position for Masking Effect
            const img = state.selectedEl.querySelector('img');
            if (imgDx !== 0) {
                 const curL = parseFloat(img.style.left) || 0;
                 img.style.left = (curL + imgDx) + 'px';
            }
            if (imgDy !== 0) {
                 const curT = parseFloat(img.style.top) || 0;
                 img.style.top = (curT + imgDy) + 'px';
            }
            // Apply Simple Container Resize
            if(rawW > 10) {
                state.selectedEl.style.width = rawW + 'px';
                state.selectedEl.style.left = newL + 'px';
            }
            if(rawH > 10) {
                state.selectedEl.style.height = rawH + 'px';
                state.selectedEl.style.top = newT + 'px';
            }
        } else {
            // --- NORMAL RESIZE WITH MIRRORING ---
            // Handle Mirroring (Negative Scale)
            let finalScaleX = d.scaleX;
            let finalScaleY = d.scaleY;
            
            if (rawW < 0) {
                rawW = Math.abs(rawW);
                if (d.dir.includes('e')) newL = d.l - rawW;
                finalScaleX = -1 * d.scaleX;
            } 
            if (rawH < 0) {
                rawH = Math.abs(rawH);
                if (d.dir.includes('s')) newT = d.t - rawH;
                finalScaleY = -1 * d.scaleY;
            }

            // Apply
            state.selectedEl.style.width = rawW + 'px';
            state.selectedEl.style.height = rawH + 'px';
            state.selectedEl.style.left = newL + 'px';
            state.selectedEl.style.top = newT + 'px';
            
            // Update Scale Transform on Content
            const content = state.selectedEl.querySelector('.element-content');
            content.style.transform = `scale(${finalScaleX}, ${finalScaleY})`;
            
            // Store state
            state.selectedEl.setAttribute('data-scaleX', finalScaleX);
            state.selectedEl.setAttribute('data-scaleY', finalScaleY);

            // NEW: Stretch WordArt while dragging
            if(state.selectedEl.querySelector('.wa-text')) {
                syncWordArt(state.selectedEl);
            }
        }

        { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
    }
}

function handleMouseUp() {
    if (state.dragMode === 'drag-guide' && state.dragData.guide) {
        // If dragged outside the paper area, delete it
        const paperRect = paper.getBoundingClientRect();
        const guideRect = state.dragData.guide.getBoundingClientRect();
        
        let remove = false;
        if (state.dragData.dir === 'h') {
            if (guideRect.top < paperRect.top - 10 || guideRect.top > paperRect.bottom + 10) remove = true;
        } else {
            if (guideRect.left < paperRect.left - 10 || guideRect.left > paperRect.right + 10) remove = true;
        }
        
        if (remove) {
            state.dragData.guide.remove();
        }
    }

    if(state.dragMode) {
        setTimeout(() => updateThumbnails(), 50);
        pushHistory(); 
        // Show toolbar again if item is selected
        if(state.selectedEl) showFloatToolbar();
    }
    state.dragMode = null;
}

function handleKeyUp(e) {
    if(e.target.isContentEditable) {
        if(this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            updateThumbnails();
            pushHistory();
        }, 1000);
    }
}

function selectElement(el) {
    if (window.isLinkingTextBox) {
        window.isLinkingTextBox = false;
        document.body.style.cursor = 'default';
        const paper = document.getElementById('paper');
        if (paper) paper.style.cursor = 'default';
        document.body.classList.remove('linking-mode');

        const isTextBox = el.querySelector('.text-content') !== null || el.querySelector('div[contenteditable]') !== null;
        if (!isTextBox) {
            if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Invalid Selection', 'Please select a text box to link to.');
            return;
        }

        const textContent = el.querySelector('.text-content') || el.querySelector('div[contenteditable]');
        if (textContent && textContent.innerText.trim() !== '' && textContent.innerText.trim() !== 'Click to edit text') {
            if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Link Text Box', 'You need to select an empty text box to pour the text into.');
            return;
        }

        if (window.linkingSourceBox && window.linkingSourceBox !== el) {
            if (!el.id) el.id = 'txt-' + Date.now();
            window.linkingSourceBox.setAttribute('data-next-box', el.id);
            el.setAttribute('data-prev-box', window.linkingSourceBox.id);

            // Flow text visually
            if (typeof flowTextBoxes === 'function') {
                let headBox = window.linkingSourceBox;
                while(headBox.getAttribute('data-prev-box')) {
                    const prev = document.getElementById(headBox.getAttribute('data-prev-box'));
                    if (prev) headBox = prev;
                    else break;
                }
                flowTextBoxes(headBox);
            }
        }
        return;
    }

    if(state.selectedEl && state.selectedEl !== el) deselect();
    state.selectedEl = el;
    el.classList.add('selected');
    document.getElementById('status-msg').innerText = "Element Selected";
    
    if (window.parseShadowToSliders && document.getElementById('op-shadow-sidebar') && document.getElementById('op-shadow-sidebar').classList.contains('visible')) {
        window.parseShadowToSliders();
    }
    showFloatToolbar();
}

function deselect() {
    if(state.cropMode) toggleCrop(); 
    if(state.shapeEditMode && typeof window.exitShapeEditMode === 'function') window.exitShapeEditMode();

    if(state.selectedEl) {
        state.selectedEl.classList.remove('selected');
        const wa = state.selectedEl.querySelector('.wa-text');
        if(wa) {
             wa.classList.remove('editing');
             wa.setAttribute('contenteditable', 'false');
             syncWordArt(state.selectedEl); // NEW: Stretch to fit box when done typing
        }
    }
    state.selectedEl = null;
    document.getElementById('status-msg').innerText = "Ready";
    { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
    const waToolbar = document.getElementById('wa-float-toolbar');
    if (waToolbar) waToolbar.style.display = 'none';
}


function selectAllElements() {
    const all = document.querySelectorAll('.pub-element');
    if(all.length > 0) selectElement(all[0]); 
    DialogSystem.alert('Selection', "All elements selected (Bulk move not yet supported in this version).");
}

function copyEl() { if(state.selectedEl) state.copiedEl = state.selectedEl.cloneNode(true); }

function pasteEl() { 
    if(state.copiedEl) { 
        const n = state.copiedEl.cloneNode(true);
        n.style.left = (parseFloat(n.style.left)+20)+'px';
        n.style.top = (parseFloat(n.style.top)+20)+'px';
        paper.appendChild(n);
        selectElement(n);
        updateThumbnails();
        pushHistory();
    } 
}

function deleteSelected() { 
    if(state.selectedEl) { 
        state.selectedEl.remove(); 
        state.selectedEl=null; 
        updateThumbnails();
        pushHistory();
        { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
    } 
}

function setupZoomControls() {
    window.addEventListener('wheel', (e) => {
        if(e.ctrlKey) {
            e.preventDefault();
            let delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom(Math.max(0.2, Math.min(3.0, state.zoom + delta)));
        }
    }, {passive: false});

    document.addEventListener('keydown', (e) => {
        if(e.ctrlKey && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            setZoom(Math.max(0.2, Math.min(3.0, state.zoom + 0.1)));
        }
        if(e.ctrlKey && e.key === '-') {
            e.preventDefault();
            setZoom(Math.max(0.2, Math.min(3.0, state.zoom - 0.1)));
        }
        if(e.ctrlKey && e.key === '0') {
            e.preventDefault();
            setZoom(1.0);
        }
    });
}

function forceRepaint() {
    if(state.selectedEl) {
        const el = state.selectedEl;
        // Toggling a harmless style property forces layout recalculation
        const oldDisplay = el.style.display;
        el.style.display = 'none';
        // Trigger reflow
        el.offsetHeight; 
        el.style.display = oldDisplay || 'block'; 
        
        // Ensure focus remains for continued editing
        const content = el.querySelector('.element-content');
        if(content && content.getAttribute('contenteditable') === 'true') {
            content.focus();
        }
    }
}