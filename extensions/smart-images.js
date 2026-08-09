(function installSmartImages() {
    console.log("🛠️ Smart Image Script initializing...");

    // 1. The Bulletproof Image Builder
    window.insertSmartImage = function(imageSrc, fallbackSrc) {
        const paper = document.getElementById('paper');
        
        const spinner = document.createElement('div');
        spinner.innerHTML = `
            <div style="text-align: center; color: var(--ui-theme-color); font-family: 'Segoe UI', Arial, sans-serif; background: rgba(255,255,255,0.9); padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <i class="fas fa-spinner fa-spin" style="font-size: 50px; margin-bottom: 15px;"></i>
                <div style="font-size: 18px; font-weight: 600; letter-spacing: 0.5px;">Importing Image...</div>
                <div style="font-size: 14px; opacity: 0.7; margin-top: 5px;">Please wait</div>
            </div>
        `;
        spinner.style.position = paper ? 'absolute' : 'fixed';
        spinner.style.top = '0';
        spinner.style.left = '0';
        spinner.style.width = paper ? '100%' : '100vw';
        spinner.style.height = paper ? '100%' : '100vh';
        spinner.style.backgroundColor = 'transparent';
        spinner.style.display = 'flex';
        spinner.style.alignItems = 'center';
        spinner.style.justifyContent = 'center';
        spinner.style.zIndex = '999999';
        
        if (paper) {
            paper.appendChild(spinner);
        } else {
            document.body.appendChild(spinner);
        }

        const img = new Image();
        let fallbackAttempted = false;

        img.onerror = function() {
            if (fallbackSrc && !fallbackAttempted) {
                console.warn("Primary image failed to load (onerror), falling back to:", fallbackSrc);
                fallbackAttempted = true;
                img.src = fallbackSrc;
            } else {
                if (spinner.parentNode) spinner.parentNode.removeChild(spinner);
                DialogSystem.alert('Error', 'Failed to load image. It may not exist on the server.');
            }
        };
        img.onload = function() {
            // Check if the proxy returned a 1x1 error pixel instead of a 404
            if (img.naturalWidth <= 1 && fallbackSrc && !fallbackAttempted) {
                console.warn("Primary image returned 1x1 pixel, falling back to:", fallbackSrc);
                fallbackAttempted = true;
                img.src = fallbackSrc;
                return;
            }
            
            if (img.naturalWidth <= 1) {
                if (spinner.parentNode) spinner.parentNode.removeChild(spinner);
                DialogSystem.alert('Error', 'The image loaded but appears to be empty or corrupted.');
                return;
            }

            if (spinner.parentNode) spinner.parentNode.removeChild(spinner);
            let finalWidth = img.naturalWidth;
            let finalHeight = img.naturalHeight;

            // Use actual paper size, fallback to A4 if missing
            const maxWidth = (paper ? paper.offsetWidth : 794) - 40;
            const maxHeight = (paper ? paper.offsetHeight : 1123) - 40;

            // Scale down if it exceeds the page bounds, preserving aspect ratio
            if (finalWidth > maxWidth || finalHeight > maxHeight) {
                const scale = Math.min(maxWidth / finalWidth, maxHeight / finalHeight);
                finalWidth = Math.round(finalWidth * scale);
                finalHeight = Math.round(finalHeight * scale);
            }

            // 🚨 THE BYPASS: Create the element manually to avoid the 200x100 hardcode!
            const el = document.createElement('div');
            el.className = 'pub-element';
            el.style.left = '50px';
            el.style.top = '50px';
            el.style.width = finalWidth + 'px';
            el.style.height = finalHeight + 'px';
            el.style.zIndex = 10;
            
            el.setAttribute('data-scaleX', "1");
            el.setAttribute('data-scaleY', "1");
            
            // Inject the HTML with the exact resize handles so it behaves normally
            el.innerHTML = `
                <div class="element-content">
                    <img src="${img.src}" draggable="false" style="width: 100%; height: 100%; object-fit: fill; display: block; position: absolute; top: 0; left: 0;">
                </div>
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
            
            if (paper) {
                paper.appendChild(el);
                if (typeof selectElement === 'function') selectElement(el);
                if (typeof updateThumbnails === 'function') updateThumbnails();
                if (typeof pushHistory === 'function') pushHistory();
            }
        };
        
        img.src = imageSrc;
    };

    // 2. Kill the old event listener by cloning and replacing the upload button
    const oldUploadBtn = document.getElementById('img-upload');
    if (oldUploadBtn) {
        const newUploadBtn = oldUploadBtn.cloneNode(true);
        oldUploadBtn.parentNode.replaceChild(newUploadBtn, oldUploadBtn);

        // 3. Attach our new smart listener
        newUploadBtn.addEventListener('change', (e) => {
            if(e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    window.insertSmartImage(evt.target.result);
                };
                reader.readAsDataURL(e.target.files[0]);
            }
            e.target.value = ''; // Reset input so the same file can be chosen again
        });
    }

    // 4. Add Global Paste Support (Ctrl+V)
    document.addEventListener('paste', function(e) {
        // Don't intercept if user is typing text
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
            if (window._isShiftPasting) {
                e.preventDefault();
                const clipboardData = e.clipboardData || window.clipboardData || (e.originalEvent && e.originalEvent.clipboardData);
                if (clipboardData) {
                    const text = clipboardData.getData('text/plain');
                    if (text) {
                        const success = document.execCommand('insertText', false, text);
                        if (!success && active.isContentEditable) {
                            const selection = window.getSelection();
                            if (selection.rangeCount > 0) {
                                const range = selection.getRangeAt(0);
                                range.deleteContents();
                                range.insertNode(document.createTextNode(text));
                                range.collapse(false);
                            }
                        } else if (!success) {
                            // Fallback for INPUT or TEXTAREA
                            const start = active.selectionStart;
                            const end = active.selectionEnd;
                            const val = active.value;
                            active.value = val.substring(0, start) + text + val.substring(end);
                            active.selectionStart = active.selectionEnd = start + text.length;
                        }
                    }
                }
                window._isShiftPasting = false;
            }
            return;
        }
        
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = function(event) {
                    window.insertSmartImage(event.target.result);
                };
                reader.readAsDataURL(blob);
                e.preventDefault();
                break; // Only paste one image at a time
            }
        }
    });

    console.log("✅ Smart Image Script installed successfully.");
})();


(function installAspectRatioLock() {
    console.log("🛠️ Aspect Ratio Lock Script initializing...");

    // We override the master MouseMove engine to inject our Aspect Ratio math
    window.handleMouseMove = function(e) {
        const cd = document.getElementById('coord-display'); 
        if(cd) cd.innerText = `X: ${e.clientX} | Y: ${e.clientY}`;
        
        // 1. Cursor Hover States
        if(!state.dragMode && !state.cropMode) {
            const el = e.target.closest('.pub-element');
            if(el) {
                const isShape = el.querySelector('img') || el.querySelector('svg') || el.getAttribute('data-type') === 'shape';
                const rect = el.getBoundingClientRect();
                if (isShape) { 
                    el.style.cursor = 'move'; 
                } else { 
                    const edgeSize = 15; 
                    el.style.cursor = ((e.clientX < rect.left + edgeSize) || (e.clientX > rect.right - edgeSize) || (e.clientY < rect.top + edgeSize) || (e.clientY > rect.bottom - edgeSize)) ? 'move' : 'text'; 
                }
            }
        }
        
        if(!state.dragMode) return;
        
        // 2. Marquee Multi-Select
        if(state.dragMode === 'marquee') {
            const box = document.getElementById('marquee-box');
            if(box) {
                const paperRect = paper.getBoundingClientRect();
                const clampedX = Math.max(paperRect.left, Math.min(e.clientX, paperRect.right));
                const clampedY = Math.max(paperRect.top, Math.min(e.clientY, paperRect.bottom));
                const startX = Math.max(paperRect.left, Math.min(state.dragData.startX, paperRect.right));
                const startY = Math.max(paperRect.top, Math.min(state.dragData.startY, paperRect.bottom));
                
                box.style.left = Math.min(clampedX, startX) + 'px'; 
                box.style.top = Math.min(clampedY, startY) + 'px';
                box.style.width = Math.abs(clampedX - startX) + 'px'; 
                box.style.height = Math.abs(clampedY - startY) + 'px';
            }
            return;
        }
        
        if(!state.selectedEl && (!state.multiSelected || state.multiSelected.length === 0)) return;
        
        const zoom = state.zoom;
        const dx = (e.clientX - state.dragData.startX) / zoom;
        const dy = (e.clientY - state.dragData.startY) / zoom;
        
        // 3. Dragging Elements
        if(state.dragMode === 'drag') {
            if(state.dragData.multi && state.dragData.multi.length > 0) { 
                state.dragData.multi.forEach(item => { 
                    item.el.style.left = (item.l + dx) + 'px'; 
                    item.el.style.top = (item.t + dy) + 'px'; 
                }); 
            } else { 
                state.selectedEl.style.left = (state.dragData.l + dx) + 'px'; 
                state.selectedEl.style.top = (state.dragData.t + dy) + 'px'; 
            }
            if(typeof floatToolbar !== 'undefined') { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
        }
        // 4. Panning inside Crop Box
        else if(state.dragMode === 'pan-image') {
            const img = state.selectedEl.querySelector('img'); 
            img.style.left = (state.dragData.l + dx) + 'px'; 
            img.style.top = (state.dragData.t + dy) + 'px';
        }
        // 5. Rotation
        else if(state.dragMode === 'rotate') {
            const angle = Math.atan2(e.clientY - state.dragData.cy, e.clientX - state.dragData.cx) * (180/Math.PI);
            state.selectedEl.style.transform = `rotate(${angle + 90}deg)`;
        }
        // 6. Resizing Engine
        else if(state.dragMode === 'resize') {
            const d = state.dragData; 
            let rawW = d.w, rawH = d.h, newL = d.l, newT = d.t;
            let imgDx = 0, imgDy = 0;
            
            // Standard Independent Math
            if (d.dir.includes('e')) rawW = d.w + dx; 
            else if (d.dir.includes('w')) { rawW = d.w - dx; newL = d.l + dx; if(state.cropMode) imgDx = -dx; }
            
            if (d.dir.includes('s')) rawH = d.h + dy; 
            else if (d.dir.includes('n')) { rawH = d.h - dy; newT = d.t + dy; if(state.cropMode) imgDy = -dy; }

            // --- 🚨 THE NEW ASPECT RATIO LOCK 🚨 ---
            if (e.shiftKey && !state.cropMode) {
                // Determine scale relative to the starting dimensions (avoiding div by zero)
                const safeW = d.w || 1;
                const safeH = d.h || 1;
                const scaleX = Math.abs(rawW / safeW);
                const scaleY = Math.abs(rawH / safeH);
                
                let dominantScale = 1;
                
                // Which handle is being pulled determines which axis drives the math
                if (d.dir === 'e' || d.dir === 'w') dominantScale = scaleX;
                else if (d.dir === 'n' || d.dir === 's') dominantScale = scaleY;
                else dominantScale = Math.max(scaleX, scaleY); // Corners use max delta

                // Keep negative values intact for mirroring/flipping support
                const signW = Math.sign(rawW) || 1;
                const signH = Math.sign(rawH) || 1;
                
                rawW = signW * Math.abs(safeW) * dominantScale;
                rawH = signH * Math.abs(safeH) * dominantScale;

                // Mathematical anchor compensation (Keeps opposite edge glued in place)
                if (d.dir.includes('w')) newL = (d.l + d.w) - rawW;
                if (d.dir.includes('n')) newT = (d.t + d.h) - rawH;
            }
            // ----------------------------------------

            if (state.cropMode) {
                const img = state.selectedEl.querySelector('img');
                if (imgDx !== 0) img.style.left = ((parseFloat(img.style.left) || 0) + imgDx) + 'px';
                if (imgDy !== 0) img.style.top = ((parseFloat(img.style.top) || 0) + imgDy) + 'px';
                if (rawW > 10) { state.selectedEl.style.width = rawW + 'px'; state.selectedEl.style.left = newL + 'px'; }
                if (rawH > 10) { state.selectedEl.style.height = rawH + 'px'; state.selectedEl.style.top = newT + 'px'; }
            } else {
                let finalScaleX = d.scaleX, finalScaleY = d.scaleY;
                
                // Handle mirroring if dragged past the zero axis
                if (rawW < 0) { rawW = Math.abs(rawW); if (d.dir.includes('e')) newL = d.l - rawW; finalScaleX = -1 * d.scaleX; } 
                if (rawH < 0) { rawH = Math.abs(rawH); if (d.dir.includes('s')) newT = d.t - rawH; finalScaleY = -1 * d.scaleY; }
                
                if (rawW > 10) { state.selectedEl.style.width = rawW + 'px'; state.selectedEl.style.left = newL + 'px'; }
                if (rawH > 10) { state.selectedEl.style.height = rawH + 'px'; state.selectedEl.style.top = newT + 'px'; }

                const img = state.selectedEl.querySelector('img');
                if (img && d.imgW !== undefined) {
                    const ratioX = rawW / Math.abs(d.w), ratioY = rawH / Math.abs(d.h);
                    img.style.width = (d.imgW * ratioX) + 'px'; 
                    img.style.height = (d.imgH * ratioY) + 'px';
                    img.style.left = (d.imgL * ratioX) + 'px'; 
                    img.style.top = (d.imgT * ratioY) + 'px';
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
                state.selectedEl.setAttribute('data-scaleX', finalScaleX); 
                state.selectedEl.setAttribute('data-scaleY', finalScaleY);
                
                if(typeof syncWordArt === 'function' && state.selectedEl.querySelector('.wa-text')) syncWordArt(state.selectedEl);
            }
            if(typeof floatToolbar !== 'undefined') { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
        }
    };
})();
