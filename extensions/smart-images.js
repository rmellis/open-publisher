(function installSmartImages() {
    console.log("🛠️ Smart Image Script initializing...");

    // 1. The Bulletproof Image Builder
    window.insertSmartImage = function(imageSrc, fallbackSrc) {
        const spinner = document.createElement('div');
        spinner.id = 'op-image-import-spinner';
        spinner.innerHTML = `
            <div style="text-align: center; color: var(--ui-theme-color); font-family: 'Segoe UI', Arial, sans-serif; background: rgba(255,255,255,0.95); padding: 24px 44px; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.25); border: 1px solid rgba(0,0,0,0.08); pointer-events: auto;">
                <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 15px;"></i>
                <div style="font-size: 18px; font-weight: 600; letter-spacing: 0.5px; color: #1e293b;">Importing Image...</div>
                <div style="font-size: 14px; opacity: 0.75; margin-top: 5px; color: #64748b;">Please wait</div>
            </div>
        `;
        spinner.style.position = 'fixed';
        spinner.style.top = '0';
        spinner.style.left = '0';
        spinner.style.width = '100vw';
        spinner.style.height = '100vh';
        spinner.style.backgroundColor = 'rgba(0, 0, 0, 0.18)';
        spinner.style.backdropFilter = 'blur(1px)';
        spinner.style.display = 'flex';
        spinner.style.alignItems = 'center';
        spinner.style.justifyContent = 'center';
        spinner.style.zIndex = '999999';
        spinner.style.pointerEvents = 'auto';
        document.body.appendChild(spinner);

        const removeSpinner = () => {
            if (spinner && spinner.parentNode) {
                spinner.parentNode.removeChild(spinner);
            }
        };

        const img = new Image();
        let fallbackAttempted = false;

        img.onerror = function() {
            if (fallbackSrc && !fallbackAttempted) {
                console.warn("Primary image failed to load (onerror), falling back to:", fallbackSrc);
                fallbackAttempted = true;
                img.src = fallbackSrc;
            } else {
                removeSpinner();
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
                removeSpinner();
                DialogSystem.alert('Error', 'The image loaded but appears to be empty or corrupted.');
                return;
            }

            removeSpinner();
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

            // Use drop coordinates if supplied, otherwise default to 50px
            let leftPos = 50;
            let topPos = 50;
            if (dropCoords && typeof dropCoords.x === 'number' && typeof dropCoords.y === 'number') {
                leftPos = Math.round(dropCoords.x);
                topPos = Math.round(dropCoords.y);
            }

            // 🚨 THE BYPASS: Create the element manually to avoid the 200x100 hardcode!
            const el = document.createElement('div');
            el.className = 'pub-element';
            el.style.left = leftPos + 'px';
            el.style.top = topPos + 'px';
            el.style.width = finalWidth + 'px';
            el.style.height = finalHeight + 'px';
            el.style.zIndex = 10;
            el.setAttribute('data-type', 'image');
            
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

    // --- BATCH IMAGE IMPORT SYSTEM ---
    window._pendingBatchImages = null;

    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }

    function loadImageElement(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = src;
        });
    }

    function showBatchImportSpinner(count, mode) {
        const spinner = document.createElement('div');
        spinner.id = 'op-batch-import-spinner';
        const modeText = mode === 'newPages' 
            ? `Generating ${count} new pages...` 
            : `Adding ${count} images to page...`;
        spinner.innerHTML = `
            <div style="text-align: center; color: var(--ui-theme-color); font-family: 'Segoe UI', Arial, sans-serif; background: rgba(255,255,255,0.95); padding: 24px 44px; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.25); border: 1px solid rgba(0,0,0,0.08); pointer-events: auto;">
                <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 15px;"></i>
                <div style="font-size: 18px; font-weight: 600; letter-spacing: 0.5px; color: #1e293b;">${modeText}</div>
                <div style="font-size: 14px; opacity: 0.75; margin-top: 5px; color: #64748b;">Please wait</div>
            </div>
        `;
        spinner.style.position = 'fixed';
        spinner.style.top = '0';
        spinner.style.left = '0';
        spinner.style.width = '100vw';
        spinner.style.height = '100vh';
        spinner.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
        spinner.style.backdropFilter = 'blur(1px)';
        spinner.style.display = 'flex';
        spinner.style.alignItems = 'center';
        spinner.style.justifyContent = 'center';
        spinner.style.zIndex = '999999';
        spinner.style.pointerEvents = 'auto';
        document.body.appendChild(spinner);
        return spinner;
    }

    function createSmartImageElement(src, x, y, width, height) {
        const el = document.createElement('div');
        el.className = 'pub-element';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.width = width + 'px';
        el.style.height = height + 'px';
        el.style.zIndex = 10;
        el.setAttribute('data-type', 'image');
        el.setAttribute('data-scaleX', "1");
        el.setAttribute('data-scaleY', "1");

        el.innerHTML = `
            <div class="element-content">
                <img src="${src}" draggable="false" style="width: 100%; height: 100%; object-fit: fill; display: block; position: absolute; top: 0; left: 0;">
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
        return el;
    }

    window.handleBatchImageFiles = function(fileList, dropCoords = null) {
        const files = Array.from(fileList || []).filter(f => f && f.type && f.type.startsWith('image/'));
        if (files.length === 0) return;

        if (files.length === 1) {
            // Direct single-image insert with zero friction
            const reader = new FileReader();
            reader.onload = function(evt) {
                window.insertSmartImage(evt.target.result, null, dropCoords);
            };
            reader.readAsDataURL(files[0]);
            return;
        }

        // Multiple images: store pending and show modal
        window._pendingBatchImages = {
            files: files,
            dropCoords: dropCoords
        };
        window.showBatchImageChoiceModal(files.length);
    };

    window.showBatchImageChoiceModal = function(count) {
        const modalHtml = `
            <div style="font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 16px; max-width: 520px; margin: 0 auto; padding: 4px 0;">
                <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">
                    You selected <strong>${count} images</strong>. How would you like to add them to your publication?
                </p>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <!-- Option 1: Current Page -->
                    <div id="batch-opt-current-page" class="batch-import-card" role="button" tabindex="0" onclick="window.executeBatchImageImport('currentPage')" 
                         style="border: 2px solid var(--ui-border, #e2e8f0); border-radius: 10px; padding: 16px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: all 0.2s ease; background: var(--ui-panel-bg, #ffffff);">
                        <div style="width: 48px; height: 48px; border-radius: 10px; background: color-mix(in srgb, var(--ui-theme-color) 12%, transparent); color: var(--ui-theme-color); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
                            <i class="fas fa-layer-group"></i>
                        </div>
                        <div style="flex-grow: 1;">
                            <div style="font-weight: 600; font-size: 15px; color: var(--ui-text, #1e293b); margin-bottom: 3px;">
                                Place all on current page
                            </div>
                            <div style="font-size: 13px; color: #64748b; line-height: 1.4;">
                                Add all ${count} images onto the active page with staggered positioning.
                            </div>
                        </div>
                        <div style="color: var(--ui-theme-color); font-size: 16px; padding-right: 4px;">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>

                    <!-- Option 2: New Page for Each -->
                    <div id="batch-opt-new-pages" class="batch-import-card" role="button" tabindex="0" onclick="window.executeBatchImageImport('newPages')" 
                         style="border: 2px solid var(--ui-border, #e2e8f0); border-radius: 10px; padding: 16px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: all 0.2s ease; background: var(--ui-panel-bg, #ffffff);">
                        <div style="width: 48px; height: 48px; border-radius: 10px; background: color-mix(in srgb, var(--ui-theme-color) 12%, transparent); color: var(--ui-theme-color); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
                            <i class="fas fa-file-circle-plus"></i>
                        </div>
                        <div style="flex-grow: 1;">
                            <div style="font-weight: 600; font-size: 15px; color: var(--ui-text, #1e293b); margin-bottom: 3px;">
                                Create a new page for each image
                            </div>
                            <div style="font-size: 13px; color: #64748b; line-height: 1.4;">
                                Automatically generate ${count} pages, placing each image centered on its own page.
                            </div>
                        </div>
                        <div style="color: var(--ui-theme-color); font-size: 16px; padding-right: 4px;">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (typeof DialogSystem !== 'undefined') {
            DialogSystem.show('Import Multiple Images', modalHtml, null, false);
        }

        // Programmatic event bindings and UI cleanup for desktop shells (NW.js / Electron / Web)
        setTimeout(() => {
            const confirmBtn = document.getElementById('custom-dialog-confirm');
            if (confirmBtn) confirmBtn.style.display = 'none';

            const optCurrent = document.getElementById('batch-opt-current-page');
            const optNew = document.getElementById('batch-opt-new-pages');

            if (optCurrent) {
                const triggerCurrent = (e) => {
                    if (e) { e.preventDefault(); e.stopPropagation(); }
                    window.executeBatchImageImport('currentPage');
                };
                optCurrent.addEventListener('click', triggerCurrent);
                optCurrent.addEventListener('pointerdown', (e) => {
                    if (e.button === 0) triggerCurrent(e);
                });
                optCurrent.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        triggerCurrent(e);
                    }
                });
            }

            if (optNew) {
                const triggerNew = (e) => {
                    if (e) { e.preventDefault(); e.stopPropagation(); }
                    window.executeBatchImageImport('newPages');
                };
                optNew.addEventListener('click', triggerNew);
                optNew.addEventListener('pointerdown', (e) => {
                    if (e.button === 0) triggerNew(e);
                });
                optNew.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        triggerNew(e);
                    }
                });
            }
        }, 20);
    };

    window.executeBatchImageImport = async function(mode) {
        if (!window._pendingBatchImages || !window._pendingBatchImages.files) {
            if (typeof DialogSystem !== 'undefined') DialogSystem.close();
            return;
        }

        const { files, dropCoords } = window._pendingBatchImages;
        window._pendingBatchImages = null;
        if (typeof DialogSystem !== 'undefined') DialogSystem.close();

        const spinner = showBatchImportSpinner(files.length, mode);

        try {
            if (mode === 'currentPage') {
                await importBatchOnCurrentPage(files, dropCoords);
            } else if (mode === 'newPages') {
                await importBatchOnNewPages(files);
            }
        } catch (err) {
            console.error("Batch image import failed:", err);
            if (typeof DialogSystem !== 'undefined') {
                DialogSystem.alert('Import Error', 'An error occurred while importing images: ' + (err.message || err));
            }
        } finally {
            if (spinner && spinner.parentNode) spinner.parentNode.removeChild(spinner);
        }
    };

    async function importBatchOnCurrentPage(files, dropCoords) {
        const paperEl = document.getElementById('paper');
        const paperW = paperEl ? paperEl.offsetWidth : 794;
        const paperH = paperEl ? paperEl.offsetHeight : 1123;
        const maxWidth = paperW - 80;
        const maxHeight = paperH - 80;

        let baseX = 50;
        let baseY = 50;
        if (dropCoords && typeof dropCoords.x === 'number' && typeof dropCoords.y === 'number') {
            baseX = Math.round(dropCoords.x);
            baseY = Math.round(dropCoords.y);
        }

        let lastInsertedEl = null;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const dataUrl = await readFileAsDataURL(file);
            const img = await loadImageElement(dataUrl);

            let finalWidth = img.naturalWidth || 300;
            let finalHeight = img.naturalHeight || 200;

            if (finalWidth > maxWidth || finalHeight > maxHeight) {
                const ratio = Math.min(maxWidth / finalWidth, maxHeight / finalHeight);
                finalWidth = Math.round(finalWidth * ratio);
                finalHeight = Math.round(finalHeight * ratio);
            }

            const offset = (i % 10) * 25;
            let posX = baseX + offset;
            let posY = baseY + offset;

            if (posX + finalWidth > paperW + 100) posX = Math.max(20, paperW - finalWidth - 20);
            if (posY + finalHeight > paperH + 100) posY = Math.max(20, paperH - finalHeight - 20);

            const el = createSmartImageElement(img.src, posX, posY, finalWidth, finalHeight);
            if (paperEl) {
                paperEl.appendChild(el);
                lastInsertedEl = el;
            }
        }

        if (lastInsertedEl && typeof selectElement === 'function') {
            selectElement(lastInsertedEl);
        }
        if (typeof updateThumbnails === 'function') updateThumbnails();
        if (typeof pushHistory === 'function') pushHistory();

        const statusMsg = document.getElementById('status-msg');
        if (statusMsg) statusMsg.innerText = `Added ${files.length} images to page`;
    }

    async function importBatchOnNewPages(files) {
        if (!files || files.length === 0) return;

        // Ensure state and state.pages are present
        if (typeof state === 'undefined') window.state = { pages: [] };
        if (!state.pages) state.pages = [];

        // Save active page before appending new pages
        if (typeof serializeCurrentPage === 'function' && state.pages.length > 0 && typeof state.currentPageIndex === 'number' && state.pages[state.currentPageIndex]) {
            state.pages[state.currentPageIndex] = serializeCurrentPage();
        }

        const paperEl = document.getElementById('paper');
        const currentElements = paperEl ? paperEl.querySelectorAll('.pub-element') : [];
        const isDocEmpty = (state.pages.length === 1 && currentElements.length === 0);

        // Inherit page dimensions from the current document or default A4
        const basePage = state.pages.length > 0 ? state.pages[0] : null;
        let defaultW = (basePage && basePage.width) ? basePage.width : (paperEl && paperEl.style.width ? paperEl.style.width : '794px');
        let defaultH = (basePage && basePage.height) ? basePage.height : (paperEl && paperEl.style.height ? paperEl.style.height : '1123px');

        const firstTargetIndex = isDocEmpty ? 0 : state.pages.length;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const dataUrl = await readFileAsDataURL(file);
            const img = await loadImageElement(dataUrl);

            const pW = parseFloat(defaultW) || 794;
            const pH = parseFloat(defaultH) || 1123;
            const maxWidth = pW - 80;
            const maxHeight = pH - 80;

            let finalWidth = img.naturalWidth || 300;
            let finalHeight = img.naturalHeight || 200;

            if (finalWidth > maxWidth || finalHeight > maxHeight) {
                const ratio = Math.min(maxWidth / finalWidth, maxHeight / finalHeight);
                finalWidth = Math.round(finalWidth * ratio);
                finalHeight = Math.round(finalHeight * ratio);
            }

            const posX = Math.max(20, Math.round((pW - finalWidth) / 2));
            const posY = Math.max(20, Math.round((pH - finalHeight) / 2));

            const imgElData = {
                left: posX + 'px',
                top: posY + 'px',
                width: finalWidth + 'px',
                height: finalHeight + 'px',
                transform: 'none',
                zIndex: 10,
                type: 'image',
                imgSrc: dataUrl,
                altText: file.name ? file.name.replace(/\.[^/.]+$/, "") : '',
                scaleX: "1",
                scaleY: "1",
                imgStyle: {
                    width: '100%',
                    height: '100%',
                    top: '0px',
                    left: '0px',
                    position: 'absolute',
                    objectFit: 'fill'
                }
            };

            if (i === 0 && isDocEmpty) {
                // Populate the existing empty page
                const el = createSmartImageElement(img.src, posX, posY, finalWidth, finalHeight);
                if (paperEl) paperEl.appendChild(el);
                if (typeof serializeCurrentPage === 'function') {
                    state.pages[0] = serializeCurrentPage();
                } else {
                    state.pages[0].elements = [imgElData];
                }
            } else {
                // Construct new page data in memory without DOM layout thrashing or race conditions
                const isLand = pW >= pH;
                const newPage = {
                    id: Date.now() + i + Math.random(),
                    orientation: isLand ? 'landscape' : 'portrait',
                    width: defaultW,
                    height: defaultH,
                    background: '#ffffff',
                    header: (basePage && basePage.header) ? basePage.header : 'Header (Type here)',
                    footer: (basePage && basePage.footer) ? basePage.footer : 'Footer (Type here)',
                    borderStyle: (basePage && basePage.borderStyle) ? basePage.borderStyle : 'none',
                    elements: [imgElData]
                };
                state.pages.push(newPage);
            }
        }

        // Navigate to the start of the newly added pages
        state.currentPageIndex = firstTargetIndex;
        if (typeof renderPage === 'function' && state.pages[firstTargetIndex]) {
            renderPage(state.pages[firstTargetIndex]);
        }

        if (typeof updateSidebar === 'function') updateSidebar();
        if (typeof updateThumbnails === 'function') updateThumbnails();
        if (typeof pushHistory === 'function') pushHistory();

        const statusMsg = document.getElementById('status-msg');
        if (statusMsg) statusMsg.innerText = `Created ${files.length} pages for batch images`;
    }

    // 2. Kill the old event listener by cloning and replacing the upload button
    const oldUploadBtn = document.getElementById('img-upload');
    if (oldUploadBtn) {
        const newUploadBtn = oldUploadBtn.cloneNode(true);
        oldUploadBtn.parentNode.replaceChild(newUploadBtn, oldUploadBtn);

        // 3. Attach our new smart listener supporting single and multiple files
        newUploadBtn.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                window.handleBatchImageFiles(e.target.files);
            }
            e.target.value = ''; // Reset input so the same files can be chosen again
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

            // TABLE & MIN-BOUNDS CLAMPING
            // Enforce minimum width/height so tables cannot be squished past their physical bounds
            if (d.minW !== undefined && rawW < d.minW) {
                if (d.dir.includes('w')) {
                    const diff = d.minW - rawW;
                    newL -= diff;
                    if (state.cropMode) imgDx += diff;
                }
                rawW = d.minW;
            }
            if (d.minH !== undefined && rawH < d.minH) {
                if (d.dir.includes('n')) {
                    const diff = d.minH - rawH;
                    newT -= diff;
                    if (state.cropMode) imgDy += diff;
                }
                rawH = d.minH;
            }

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
