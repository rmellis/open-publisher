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
