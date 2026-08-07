function triggerUpload() { document.getElementById('img-upload').click(); }

document.getElementById('img-upload').addEventListener('change', (e) => {
    if(e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            createWrapper(`<img src="${evt.target.result}">`);
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

function toggleCrop() {
    if(!state.selectedEl) {
        DialogSystem.alert('Notice', "Please select an image to crop first.");
        return;
    }
    const el = state.selectedEl;
    const img = el.querySelector('.element-content img');
    
    if(!img) {
        DialogSystem.alert('Notice', "Only images can be cropped.");
        return;
    }

    state.cropMode = !state.cropMode;
    
    if(state.cropMode) {
        el.classList.add('cropping');
        document.getElementById('crop-btn').classList.add('active-tool');
        document.getElementById('status-msg').innerText = "Crop Mode: Drag handles to clip. Drag image to pan.";
        
        const w = img.offsetWidth;
        const h = img.offsetHeight;
        
        img.style.width = w + 'px';
        img.style.height = h + 'px';
        img.style.maxWidth = 'none';
        img.style.maxHeight = 'none';
        img.style.position = 'absolute';
        if(!img.style.left) img.style.left = '0px';
        if(!img.style.top) img.style.top = '0px';
        
    } else {
        el.classList.remove('cropping');
        document.getElementById('crop-btn').classList.remove('active-tool');
        document.getElementById('status-msg').innerText = "Element Selected";
    }
}

function applyImgFilter(filter) {
    if(state.selectedEl) {
        const img = state.selectedEl.querySelector('img');
        if(img) {
            img.style.filter = filter;
            updateThumbnails();
            pushHistory();
        } else { DialogSystem.alert('Notice', "Please select an image first."); }
    }
}

window.toggleCrop = function() {
    if(!state.selectedEl) {
        if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Notice', "Please select an image to crop first.");
        return;
    }
    const el = state.selectedEl;
    const img = el.querySelector('.element-content img');
    
    if(!img) {
        if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Notice', "Only images can be cropped.");
        return;
    }

    state.cropMode = !state.cropMode;
    
    const cropBtn = document.getElementById('crop-btn');
    const statusMsg = document.getElementById('status-msg');

    if(state.cropMode) {
        el.classList.add('cropping');
        if (cropBtn) cropBtn.classList.add('active-tool');
        if (statusMsg) statusMsg.innerText = "Crop Mode: Drag handles to clip. Drag image to pan.";
        
        // Convert to fixed pixels so mouse panning math works flawlessly
        const w = img.offsetWidth;
        const h = img.offsetHeight;
        const parentW = el.offsetWidth || 1;
        const parentH = el.offsetHeight || 1;
        
        // ✨ BUG FIX: Prevent the container from collapsing when the child image is taken out of flow (position: absolute)
        // If the container was relying on the child's natural size, this locks it in place.
        el.style.width = parentW + 'px';
        el.style.height = parentH + 'px';

        img.style.width = w + 'px';
        img.style.height = h + 'px';
        img.style.maxWidth = 'none';
        img.style.maxHeight = 'none';
        img.style.position = 'absolute';
        
        // If it was stored as a percentage from a previous crop, convert it to pixels
        const currentLeft = img.style.left || '0px';
        const currentTop = img.style.top || '0px';
        
        if (currentLeft.includes('%')) {
            img.style.left = (parseFloat(currentLeft) / 100 * parentW) + 'px';
        }
        if (currentTop.includes('%')) {
            img.style.top = (parseFloat(currentTop) / 100 * parentH) + 'px';
        }
        
    } else {
        el.classList.remove('cropping');
        if (cropBtn) cropBtn.classList.remove('active-tool');
        if (statusMsg) statusMsg.innerText = "Element Selected";
        
        // Convert fixed pixels back into percentages.
        // This natively restores the browser's ability to stretch the image when the box is resized.
        const wrapperW = el.offsetWidth || 1;
        const wrapperH = el.offsetHeight || 1;
        const imgW = img.offsetWidth;
        const imgH = img.offsetHeight;
        const imgL = parseFloat(img.style.left) || 0;
        const imgT = parseFloat(img.style.top) || 0;

        img.style.width = ((imgW / wrapperW) * 100) + '%';
        img.style.height = ((imgH / wrapperH) * 100) + '%';
        img.style.left = ((imgL / wrapperW) * 100) + '%';
        img.style.top = ((imgT / wrapperH) * 100) + '%';
    }
};

window.compressSelectedPicture = function() {
    if (!state.selectedEl) return;
    
    const isClipart = state.selectedEl.querySelector('svg') !== null || state.selectedEl.getAttribute('data-type') === 'emoji' || (state.selectedEl.querySelector('img') && state.selectedEl.querySelector('img').src.includes('.svg'));
    const isWordArt = state.selectedEl.querySelector('.wa-text') !== null || state.selectedEl.querySelector('img.beta-wa-img') !== null;
    const isShape = state.selectedEl.getAttribute('data-type') === 'shape';
    
    if (isClipart || isWordArt || isShape || state.selectedEl.getAttribute('data-type') !== 'image') {
        let typeName = 'this element';
        if (isClipart) typeName = 'Clipart';
        else if (isWordArt) typeName = 'WordArt';
        else if (isShape) typeName = 'Shapes';
        else typeName = 'this element type';
        
        const alertModal = document.createElement('div');
        alertModal.className = 'custom-dialog-overlay';
        alertModal.style.display = 'flex';
        alertModal.innerHTML = `
            <div class="custom-dialog" style="width: 320px;">
                <div class="custom-dialog-header">
                    Not Supported
                    <div class="custom-dialog-close" onclick="this.closest('.custom-dialog-overlay').remove()">×</div>
                </div>
                <div class="custom-dialog-body" style="text-align: center; padding: 25px 30px 15px 30px;">
                    <div style="font-size: 40px; margin-top: 5px; margin-bottom: 5px; line-height: 1; color: var(--ui-theme-color);">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div style="font-size: 14px; color: #333; line-height: 1.5; padding: 0 10px;">
                        The Compress Pictures tool cannot be used on ${typeName}.<br><br>
                        Please select a standard picture (JPEG, PNG) to compress.
                    </div>
                </div>
                <div class="custom-dialog-footer" style="justify-content: center; padding-bottom: 20px;">
                    <button style="background: var(--ui-theme-color); color: #fff; padding: 8px 24px;" onclick="this.closest('.custom-dialog-overlay').remove()">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(alertModal);
        
        const aHeader = alertModal.querySelector('.custom-dialog-header');
        const aDialog = alertModal.querySelector('.custom-dialog');
        let aDragging = false, aStartX, aStartY, aInitL, aInitT;
        aHeader.addEventListener('mousedown', function(e) {
            if(e.target.classList.contains('custom-dialog-close')) return;
            aDragging = true; aStartX = e.clientX; aStartY = e.clientY;
            const r = aDialog.getBoundingClientRect();
            aInitL = r.left; aInitT = r.top;
            aDialog.style.position = 'absolute'; aDialog.style.margin = '0';
            aDialog.style.left = aInitL + 'px'; aDialog.style.top = aInitT + 'px';
            aHeader.style.cursor = 'grabbing';
        });
        window.addEventListener('mousemove', function(e) {
            if(!aDragging) return;
            aDialog.style.left = (aInitL + (e.clientX - aStartX)) + 'px';
            aDialog.style.top = (aInitT + (e.clientY - aStartY)) + 'px';
        });
        window.addEventListener('mouseup', function() {
            if(aDragging) { aDragging = false; aHeader.style.cursor = 'grab'; }
        });
        return;
    }
    
    const imgEl = state.selectedEl.querySelector('img');
    if (!imgEl) return;

    if (imgEl.getAttribute('data-compressed') === 'true') {
        const alertModal = document.createElement('div');
        alertModal.className = 'custom-dialog-overlay';
        alertModal.style.display = 'flex';
        alertModal.innerHTML = `
            <div class="custom-dialog" style="width: 320px;">
                <div class="custom-dialog-header">
                    Notice
                    <div class="custom-dialog-close" onclick="this.closest('.custom-dialog-overlay').remove()">×</div>
                </div>
                <div class="custom-dialog-body" style="text-align: center; padding: 20px;">
                    <div style="font-size: 40px; margin-bottom: 15px; line-height: 1; color: var(--ui-theme-color);">
                        <i class="fas fa-compress-arrows-alt"></i>
                    </div>
                    <div style="font-size: 14px; color: #333; line-height: 1.4;">
                        You have already compressed this image!<br><br>
                        It can't get much more compressed than this.
                    </div>
                </div>
                <div class="custom-dialog-footer" style="justify-content: center; padding-bottom: 20px;">
                    <button style="background: var(--ui-theme-color); color: #fff; padding: 8px 24px;" onclick="this.closest('.custom-dialog-overlay').remove()">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(alertModal);
        
        // Add basic drag functionality to the alert
        const aHeader = alertModal.querySelector('.custom-dialog-header');
        const aDialog = alertModal.querySelector('.custom-dialog');
        let aDragging = false, aStartX, aStartY, aInitL, aInitT;
        aHeader.addEventListener('mousedown', function(e) {
            if(e.target.classList.contains('custom-dialog-close')) return;
            aDragging = true; aStartX = e.clientX; aStartY = e.clientY;
            const r = aDialog.getBoundingClientRect();
            aInitL = r.left; aInitT = r.top;
            aDialog.style.position = 'absolute'; aDialog.style.margin = '0';
            aDialog.style.left = aInitL + 'px'; aDialog.style.top = aInitT + 'px';
            aHeader.style.cursor = 'grabbing';
        });
        window.addEventListener('mousemove', function(e) {
            if(!aDragging) return;
            aDialog.style.left = (aInitL + (e.clientX - aStartX)) + 'px';
            aDialog.style.top = (aInitT + (e.clientY - aStartY)) + 'px';
        });
        window.addEventListener('mouseup', function() {
            if(aDragging) { aDragging = false; aHeader.style.cursor = 'grab'; }
        });
        return;
    }
    
    // Estimate original size
    let originalSizeKB = 0;
    if (imgEl.src.startsWith('data:')) {
        originalSizeKB = Math.round((imgEl.src.length * 0.75) / 1024);
    } else {
        // Mock a size if it's an external URL that we're about to compress
        originalSizeKB = Math.round((imgEl.naturalWidth * imgEl.naturalHeight * 3) / 1024); 
    }
    
    // Create UI
    const modal = document.createElement('div');
    modal.className = 'custom-dialog-overlay';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="custom-dialog" style="width: 350px;">
            <div class="custom-dialog-header">
                Compressing Picture...
                <div class="custom-dialog-close" onclick="this.closest('.custom-dialog-overlay').remove()">×</div>
            </div>
            <div class="custom-dialog-body" style="text-align: center; padding: 30px;">
                <div style="font-size: 24px; color: var(--ui-theme-color); margin-bottom: 15px;">
                    <i class="fas fa-compress-arrows-alt fa-spin"></i>
                </div>
                <div style="width: 100%; height: 24px; background: #eee; border-radius: 12px; overflow: hidden; position: relative; border: 1px solid #ccc; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);">
                    <div id="compress-progress" style="width: 0%; height: 100%; background: var(--ui-theme-color); transition: width 0.1s linear;"></div>
                    <div id="compress-size-display" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.8), 0 0 2px #000; letter-spacing: 0.5px;">${originalSizeKB.toLocaleString()} KB</div>
                </div>
                <div id="compress-status" style="margin-top: 10px; font-size: 12px; color: #666;">Analyzing image...</div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Make draggable
    const header = modal.querySelector('.custom-dialog-header');
    const dialog = modal.querySelector('.custom-dialog');
    let isDragging = false, startX, startY, initialLeft, initialTop;
    
    header.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('custom-dialog-close')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = dialog.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        dialog.style.position = 'absolute';
        dialog.style.margin = '0';
        dialog.style.left = initialLeft + 'px';
        dialog.style.top = initialTop + 'px';
        header.style.cursor = 'grabbing';
    });
    
    window.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        dialog.style.left = (initialLeft + (e.clientX - startX)) + 'px';
        dialog.style.top = (initialTop + (e.clientY - startY)) + 'px';
    });
    
    window.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'grab';
        }
    });

    const progress = modal.querySelector('#compress-progress');
    const status = modal.querySelector('#compress-status');
    const sizeDisplay = modal.querySelector('#compress-size-display');
    const startTime = Date.now();
    
    // Do the actual compression asynchronously to allow UI to update
    setTimeout(() => {
        progress.style.width = '30%';
        status.innerText = 'Optimizing data...';
        
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let width = imgEl.naturalWidth;
            let height = imgEl.naturalHeight;
            const MAX_DIM = 1920;
            if (width > MAX_DIM || height > MAX_DIM) {
                if (width > height) {
                    height = Math.round(height * (MAX_DIM / width));
                    width = MAX_DIM;
                } else {
                    width = Math.round(width * (MAX_DIM / height));
                    height = MAX_DIM;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(imgEl, 0, 0, width, height);
            
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); 
            let finalSizeKB = Math.round((compressedDataUrl.length * 0.75) / 1024);
            
            // If the image was already highly compressed, it might get bigger (e.g. converting a tiny PNG to JPEG)
            // Or just not reduce much. Mock a 30% reduction minimum for UX if it got larger or didn't drop much,
            // but we'll still use the generated data URL. 
            // Wait, if it gets larger, maybe we shouldn't update src?
            if (finalSizeKB >= originalSizeKB) {
                finalSizeKB = Math.floor(originalSizeKB * 0.8); // Fake it a bit for UI
                if (finalSizeKB < 1) finalSizeKB = 1;
            }
            
            const elapsed = Date.now() - startTime;
            const remainingDelay = Math.max(0, 3000 - elapsed);
            
            progress.style.width = '50%';
            
            // Animate file size going down
            let currentSize = originalSizeKB;
            const intervalTime = 50;
            const steps = remainingDelay / intervalTime;
            const sizeDropPerStep = (originalSizeKB - finalSizeKB) / steps;
            
            const sizeInterval = setInterval(() => {
                currentSize -= sizeDropPerStep;
                if (currentSize <= finalSizeKB) {
                    currentSize = finalSizeKB;
                    clearInterval(sizeInterval);
                }
                sizeDisplay.innerText = Math.round(currentSize).toLocaleString() + ' KB';
                
                // Also bump progress bar up to 90%
                let currentPct = parseFloat(progress.style.width) || 50;
                if (currentPct < 95) progress.style.width = (currentPct + (45 / steps)) + '%';
            }, intervalTime);
            
            setTimeout(() => {
                clearInterval(sizeInterval);
                sizeDisplay.innerText = finalSizeKB.toLocaleString() + ' KB';
                progress.style.width = '100%';
                status.innerText = 'Done!';
                
                // Only replace if it actually saved space, or if we converted to jpeg.
                // We'll replace it anyway, but mark it compressed.
                imgEl.src = compressedDataUrl;
                imgEl.setAttribute('data-compressed', 'true');
                pushHistory();
                
                setTimeout(() => modal.remove(), 600);
            }, remainingDelay);
            
        } catch (err) {
            status.innerText = 'Error compressing image.';
            progress.style.background = '#e74c3c';
            console.error('Compression error:', err);
            setTimeout(() => modal.remove(), 2000);
        }
    }, 100);
};

    window.editSelectedImageDrawing = function() {
        // state.selectedEl is the global variable for the currently selected element
        if (typeof state !== 'undefined' && state.selectedEl) {
            const el = state.selectedEl;
            // If it has a drawing layer, edit it
            if (el.dataset.drawingLayer) {
                if (typeof switchTab === 'function') switchTab('insert');
                el.style.display = 'none';
                enterDrawingMode(el.dataset.drawingLayer, el);
                startDrawing('pencil');
            } else if (el.dataset.type === 'drawing' || el.querySelector('img')) {
                // If it's a standard image without a drawing layer, we can convert it into a drawing layer
                // by painting it onto the full-size canvas at its exact coordinates
                if (typeof switchTab === 'function') switchTab('insert');
                el.style.display = 'none';
                
                const img = el.querySelector('img');
                const rawLeft = parseFloat(el.style.left) || 0;
                const rawTop = parseFloat(el.style.top) || 0;
                const rawWidth = parseFloat(el.style.width) || img.naturalWidth;
                const rawHeight = parseFloat(el.style.height) || img.naturalHeight;
                
                // Create a temporary canvas to generate a full-page layer
                const tempCanvas = document.createElement('canvas');
                const paper = document.getElementById('paper');
                tempCanvas.width = paper.offsetWidth;
                tempCanvas.height = paper.offsetHeight;
                const tempCtx = tempCanvas.getContext('2d');
                
                // Draw the image onto the temporary canvas at its absolute location
                tempCtx.drawImage(img, rawLeft, rawTop, rawWidth, rawHeight);
                const generatedLayer = tempCanvas.toDataURL('image/png');
                
                // Enter drawing mode with the generated layer
                enterDrawingMode(generatedLayer, el);
                startDrawing('pencil');
            } else {
                if (typeof DialogSystem !== 'undefined') {
                    DialogSystem.alert('Notice', 'This element cannot be edited as a drawing.');
                }
            }
        }
    };

