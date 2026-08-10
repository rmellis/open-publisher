

(function installRulerHighlights() {
    console.log("🛠️ Ruler Highlight Script initializing (Boundary Clamped)...");

    // 1. Inject styling
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // 2. Attach overlays to body
    const hlH = document.createElement('div');
    hlH.className = 'op-ruler-highlight-h';
    document.body.appendChild(hlH);

    const hlV = document.createElement('div');
    hlV.className = 'op-ruler-highlight-v';
    document.body.appendChild(hlV);

    let rulerH = null;
    let rulerV = null;

    // 3. The high-speed tracking loop
    function trackSelection() {
        if (!rulerH) rulerH = document.getElementById('ruler-h');
        if (!rulerV) rulerV = document.getElementById('ruler-v');

        if (!rulerH || !rulerV) {
            requestAnimationFrame(trackSelection);
            return;
        }

        const selectedEl = document.querySelector('.pub-element.selected');

        if (selectedEl) {
            const elRect = selectedEl.getBoundingClientRect();
            const hRect = rulerH.getBoundingClientRect();
            const vRect = rulerV.getBoundingClientRect();

            // --- MATH: Clamp Horizontal Boundaries ---
            // Don't let the left edge go past the ruler's left edge
            const clampedHLeft = Math.max(elRect.left, hRect.left);
            // Don't let the right edge go past the ruler's right edge
            const clampedHRight = Math.min(elRect.right, hRect.right);
            // Calculate new width after clamping
            const clampedHWidth = clampedHRight - clampedHLeft;

            // Only show if it's actually over the ruler
            if (clampedHWidth > 0) {
                hlH.style.display = 'block';
                hlH.style.left = clampedHLeft + 'px';
                hlH.style.width = clampedHWidth + 'px';
                hlH.style.top = hRect.top + 'px';
                hlH.style.height = hRect.height + 'px';
            } else {
                hlH.style.display = 'none';
            }

            // --- MATH: Clamp Vertical Boundaries ---
            // Don't let the top edge go past the ruler's top edge
            const clampedVTop = Math.max(elRect.top, vRect.top);
            // Don't let the bottom edge go past the ruler's bottom edge
            const clampedVBottom = Math.min(elRect.bottom, vRect.bottom);
            // Calculate new height after clamping
            const clampedVHeight = clampedVBottom - clampedVTop;

            // Only show if it's actually over the ruler
            if (clampedVHeight > 0) {
                hlV.style.display = 'block';
                hlV.style.top = clampedVTop + 'px';
                hlV.style.height = clampedVHeight + 'px';
                hlV.style.left = vRect.left + 'px';
                hlV.style.width = vRect.width + 'px';
            } else {
                hlV.style.display = 'none';
            }

        } else {
            hlH.style.display = 'none';
            hlV.style.display = 'none';
        }

        requestAnimationFrame(trackSelection);
    }

    requestAnimationFrame(trackSelection);
    console.log("✅ Ruler Highlight Loop started successfully.");
})();


(function installKeyboardNudge() {
    console.log("🛠️ Keyboard Nudge Script initializing...");

    let isNudging = false;

    // Listen for key presses
    document.addEventListener('keydown', (e) => {
        // 1. SAFEGUARD: Don't hijack arrow keys if the user is typing in a text box!
        const isTyping = e.target.tagName === 'INPUT' || 
                         e.target.tagName === 'TEXTAREA' || 
                         e.target.isContentEditable;
        if (isTyping) return;

        // 2. Only intercept Arrow keys
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (!keys.includes(e.key)) return;

        // 3. Find all currently selected elements
        const selectedEls = document.querySelectorAll('.pub-element.selected');
        if (selectedEls.length === 0) return;

        // 4. Stop the browser window from scrolling
        e.preventDefault(); 
        isNudging = true;

        // 5. Calculate nudge amount (1px normal, 10px Shift, 50px Ctrl/Cmd)
        let nudgeAmount = 1;
        if (e.shiftKey) nudgeAmount = 10;
        if (e.ctrlKey || e.metaKey) nudgeAmount = 50; // The Paint.net "Super Nudge"

        // 6. Move every selected element
        selectedEls.forEach(el => {
            // Get current positions (default to 0 if not set)
            const currentLeft = parseFloat(el.style.left) || 0;
            const currentTop = parseFloat(el.style.top) || 0;

            if (e.key === 'ArrowUp') el.style.top = (currentTop - nudgeAmount) + 'px';
            if (e.key === 'ArrowDown') el.style.top = (currentTop + nudgeAmount) + 'px';
            if (e.key === 'ArrowLeft') el.style.left = (currentLeft - nudgeAmount) + 'px';
            if (e.key === 'ArrowRight') el.style.left = (currentLeft + nudgeAmount) + 'px';

            // Optional: Keep WordArt synced if needed
            if (typeof syncWordArt === 'function' && el.querySelector('.wa-text')) {
                syncWordArt(el);
            }
        });
    });

    // 7. Save to history ONLY when the user releases the key 
    // (Prevents spamming the undo history with 100 single-pixel moves)
    document.addEventListener('keyup', (e) => {
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (keys.includes(e.key) && isNudging) {
            isNudging = false;
            // Trigger your app's global save state
            if (typeof pushHistory === 'function') {
                pushHistory();
            }
        }
    });

    console.log("✅ Keyboard Nudge Script started successfully.");
})();


(function installContextRichFormattingAndOptions() {
    console.log("🛠️ Context Tools Script initializing...");

    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    const checkInterval = setInterval(() => {
        if (!document.getElementById('ribbon-format-text')) return;
        clearInterval(checkInterval);
        
        // We will loop through both ribbons to inject the same tools
        const targets = [
            { id: 'ribbon-format-text', suffix: 'text' },
            { id: 'ribbon-format-wordart', suffix: 'wa' }
        ];

        targets.forEach(target => {
            const ribbon = document.getElementById(target.id);
            if (!ribbon) return; // Skip if this specific ribbon hasn't rendered yet

            // ==========================================
            // GROUP 1: FONT
            // ==========================================
            const fontGroup = document.createElement('div');
            fontGroup.className = 'group';
            fontGroup.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:6px; padding: 2px;">
                    <div style="display:flex; gap:6px; align-items: center;">
                        <div class="font-picker-container" style="width: 140px;">
                            <div class="modern-select" id="ctx-font-btn-${target.suffix}" onclick="window._currentRibbonSuffix='${target.suffix}'; toggleCustomDropdown('ctx-ribbon'); event.stopPropagation();">
                                <span id="ctx-font-label-${target.suffix}">Arial</span> 
                                <div class="arrow-box"><i class="fas fa-chevron-down" style="font-size:10px;"></i></div>
                            </div>
                        </div>
                        
                        <div class="modern-spinner">
                            <input type="text" id="ctx-font-size-${target.suffix}" value="16" onchange="setTrueFontSize(this.value + 'px')">
                            <div class="spin-btns">
                                <div onmousedown="holdSpinFontSize('ctx-font-size-${target.suffix}', 1)" onmouseup="stopSpinFontSize()" onmouseleave="stopSpinFontSize()"><i class="fas fa-chevron-up"></i></div>
                                <div onmousedown="holdSpinFontSize('ctx-font-size-${target.suffix}', -1)" onmouseup="stopSpinFontSize()" onmouseleave="stopSpinFontSize()"><i class="fas fa-chevron-down"></i></div>
                            </div>
                        </div>
                        
                        <div style="width:1px; height:20px; background:#ccc; margin:0 2px;"></div>
                        
                        <div class="modern-format-btn" onclick="execCmd('removeFormat')" title="Clear Formatting"><i class="fas fa-eraser"></i></div>
                    </div>
                    
                    <div style="display:flex; gap: 4px; align-items: center;">
                        <div class="modern-format-btn" onclick="execCmd('bold')" title="Bold"><i class="fas fa-bold"></i></div>
                        <div class="modern-format-btn" style="font-family: serif; font-style: italic; font-weight: bold; font-size: 18px; padding-top: 2px;" onclick="execCmd('italic')" title="Italic">I</div>
                        <div class="modern-format-btn" onclick="execCmd('underline')" title="Underline"><i class="fas fa-underline"></i></div>
                        <div class="modern-format-btn" onclick="execCmd('strikeThrough')" title="Strikethrough"><i class="fas fa-strikethrough"></i></div>
                        
                        <div class="modern-format-btn" style="font-size: 12px;" onclick="execCmd('subscript')" title="Subscript"><i class="fas fa-subscript"></i></div>
                        <div class="modern-format-btn" style="font-size: 12px;" onclick="execCmd('superscript')" title="Superscript"><i class="fas fa-superscript"></i></div>
                        
                        <div style="width:1px; height:20px; background:#ccc; margin:0 2px;"></div>
                        
                        <div class="modern-format-btn" style="position:relative;" title="Text Color" onclick="CustomColorPicker.open(this, document.getElementById('ctx-text-color-bar-${target.suffix}').style.backgroundColor || '#000000', (c) => { document.getElementById('ctx-text-color-bar-${target.suffix}').style.background=c; execCmd('foreColor', c); })">
                            <i class="fas fa-font" style="margin-top: -2px;"></i>
                            <div style="height:3px; background:black; width:16px; position:absolute; bottom:3px; border-radius: 2px;" id="ctx-text-color-bar-${target.suffix}"></div>
                        </div>
                        
                        <div class="modern-format-btn" style="position:relative;" title="Highlight Color" onclick="CustomColorPicker.open(this, document.getElementById('ctx-bg-color-bar-${target.suffix}').style.backgroundColor || '#ffff00', (c) => { document.getElementById('ctx-bg-color-bar-${target.suffix}').style.background=c; execCmd('hiliteColor', c); })">
                            <i class="fas fa-highlighter" style="margin-top: -2px;"></i>
                            <div style="height:3px; background:yellow; width:16px; position:absolute; bottom:3px; border-radius: 2px;" id="ctx-bg-color-bar-${target.suffix}"></div>
                        </div>
                    </div>
                </div>
                <div class="group-label">Font</div>
            `;

            // ==========================================
            // GROUP 2: PARAGRAPH
            // ==========================================
            const paragraphGroup = document.createElement('div');
            paragraphGroup.className = 'group';
            paragraphGroup.innerHTML = `
                <div style="display:flex; flex-direction:column; padding: 2px;">
                    <div class="ctx-row">
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('insertUnorderedList')" title="Bullet List"><i class="fas fa-list-ul"></i></div>
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('insertOrderedList')" title="Numbered List"><i class="fas fa-list-ol"></i></div>
                        
                        <div style="width:1px; height:16px; background:#ccc; margin:0 2px;"></div>
                        
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('outdent')" title="Decrease Indent"><i class="fas fa-outdent"></i></div>
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('indent')" title="Increase Indent"><i class="fas fa-indent"></i></div>
                    </div>
                    <div class="ctx-row">
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('justifyLeft')" title="Align Left"><i class="fas fa-align-left"></i></div>
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('justifyCenter')" title="Align Center"><i class="fas fa-align-center"></i></div>
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('justifyRight')" title="Align Right"><i class="fas fa-align-right"></i></div>
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('justifyFull')" title="Justify"><i class="fas fa-align-justify"></i></div>
                    </div>
                </div>
                <div class="group-label">Paragraph</div>
            `;

            // ==========================================
            // GROUP 3: VIEW OPTIONS
            // ==========================================
            const optionsGroup = document.createElement('div');
            optionsGroup.className = 'group';
            optionsGroup.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:6px; padding: 2px 6px; justify-content: center; height: 100%;">
                    <label style="font-size:11px; display:flex; align-items:center; gap:4px; cursor:pointer; margin:0; color:var(--ui-text);">
                        <input type="checkbox" id="ribbon-toggle-float-${target.suffix}" checked style="margin:0; cursor:pointer; accent-color: var(--ui-theme-color);"> Show Float Toolbar
                    </label>
                    <label style="font-size:11px; display:flex; align-items:center; gap:4px; cursor:pointer; margin:0; color:var(--ui-text);">
                        <input type="checkbox" id="ribbon-toggle-margins-${target.suffix}" checked style="margin:0; cursor:pointer; accent-color: var(--ui-theme-color);"> Show Page Margins
                    </label>
                </div>
                <div class="group-label">View</div>
            `;

            // Inject the groups securely behind the Clipboard group if it exists
            if (ribbon.children.length > 1) {
                ribbon.insertBefore(fontGroup, ribbon.children[1]);
                ribbon.insertBefore(paragraphGroup, ribbon.children[2]);
                ribbon.insertBefore(optionsGroup, ribbon.children[3]);
            } else {
                ribbon.appendChild(fontGroup);
                ribbon.appendChild(paragraphGroup);
                ribbon.appendChild(optionsGroup);
            }

            // Bind the View option checkboxes for this specific ribbon
            document.getElementById(`ribbon-toggle-float-${target.suffix}`).addEventListener('change', (e) => {
                const ft = document.getElementById('float-toolbar');
                if (ft) {
                    if (!e.target.checked) ft.classList.add('force-hide-float');
                    else ft.classList.remove('force-hide-float');
                }
            });

            document.getElementById(`ribbon-toggle-margins-${target.suffix}`).addEventListener('change', (e) => {
                document.querySelectorAll('.margin-guides').forEach(g => {
                    g.style.display = e.target.checked ? 'block' : 'none';
                });
            });
        });

        // ==========================================
        // GLOBAL LOGIC WIRING (Only needs to run once)
        // ==========================================

        // 1. Font Dropdown Hijack (Reads the _currentRibbonSuffix flag to position correctly)
        if (typeof window.toggleCustomDropdown === 'function' && !window._patchedToggleCustomDropdownCtx) {
            const originalToggle = window.toggleCustomDropdown;
            window.toggleCustomDropdown = function(type) {
                if (type === 'ctx-ribbon') {
                    const menu = document.getElementById('ribbon-font-list');
                    if (!menu) return;

                    const isVisible = menu.style.display === 'block';
                    document.querySelectorAll('.custom-dropdown').forEach(d => d.style.display = 'none');
                    
                    if (!isVisible) {
                        const btn = document.getElementById('ctx-font-btn-' + window._currentRibbonSuffix);
                        if (btn) {
                            const rect = btn.getBoundingClientRect();
                            menu.style.left = rect.left + 'px';
                            menu.style.top = (rect.bottom + 2) + 'px';
                            menu.style.width = '200px';
                            menu.style.zIndex = '9999999';
                        }
                        menu.style.display = 'block';
                    }
                    return;
                }
                originalToggle.apply(this, arguments);
            };
            window._patchedToggleCustomDropdownCtx = true;
        }

        // 2. Sync Font Choice back to our new labels
        if (typeof window.selectFont === 'function' && !window._patchedSelectFontCtx) {
            const originalSelectFont = window.selectFont;
            window.selectFont = function(fontName) {
                originalSelectFont.apply(this, arguments);
                
                // Update labels on BOTH ribbons just to be safe
                const lblText = document.getElementById('ctx-font-label-text');
                const lblWA = document.getElementById('ctx-font-label-wa');
                if (lblText) lblText.innerText = fontName;
                if (lblWA) lblWA.innerText = fontName;
            };
            window._patchedSelectFontCtx = true;
        }

        // 3. Sync font updates when the Float Toolbar updates
        if (typeof window.updateFloatToolbarValues === 'function' && !window._patchedUpdateFloatCtx) {
            const originalUpdateFloat = window.updateFloatToolbarValues;
            window.updateFloatToolbarValues = function() {
                originalUpdateFloat.apply(this, arguments);
                const ribbonLabel = document.getElementById('ribbon-font-label');
                const ribbonSize = document.getElementById('font-size');
                
                if (ribbonLabel) {
                    const lblText = document.getElementById('ctx-font-label-text');
                    const lblWA = document.getElementById('ctx-font-label-wa');
                    if (lblText) lblText.innerText = ribbonLabel.innerText;
                    if (lblWA) lblWA.innerText = ribbonLabel.innerText;
                }
                if (ribbonSize) {
                    const szText = document.getElementById('ctx-font-size-text');
                    const szWA = document.getElementById('ctx-font-size-wa');
                    if (szText) szText.value = ribbonSize.value;
                    if (szWA) szWA.value = ribbonSize.value;
                }
            };
            window._patchedUpdateFloatCtx = true;
        }

        console.log("✅ Context Tools for Text & WordArt added successfully.");
    }, 100); 
})();


(function installScratchAreaFading() {
    console.log("🛠️ Scratch Area Fading Script initializing...");

    // 1. Inject the CSS class for the faded effect
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // 2. The collision detection logic
    function checkOffCanvasStatus(el) {
        const paper = document.getElementById('paper');
        if (!paper || !el) return;

        const paperRect = paper.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        // Check if the element's bounding box is COMPLETELY outside the paper
        const completelyOutside = (
            elRect.right < paperRect.left ||
            elRect.left > paperRect.right ||
            elRect.bottom < paperRect.top ||
            elRect.top > paperRect.bottom
        );

        if (completelyOutside) {
            el.classList.add('scratch-area-item');
        } else {
            el.classList.remove('scratch-area-item');
        }
    }

    // 3. Set up the invisible observer to watch for position changes
    setTimeout(() => {
        const paper = document.getElementById('paper');
        if (!paper) {
            console.warn("Could not find #paper for Scratch Area logic.");
            return;
        }

        // Run an initial check on all existing elements in case a template loaded
        document.querySelectorAll('.pub-element').forEach(checkOffCanvasStatus);

        // Create an observer that watches for style changes (dragging, nudging, resizing)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                // If an element's inline style changes (which happens when its x/y coordinates change)
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (mutation.target.classList.contains('pub-element')) {
                        checkOffCanvasStatus(mutation.target);
                    }
                }
            });
        });

        // Tell the observer to watch the paper and all its children
        observer.observe(paper, { 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['style'] 
        });

        console.log("✅ Scratch Area Fading added successfully.");
    }, 1000); // Small delay to ensure paper is rendered
})();


(function installSmartTextInteraction() {
    console.log("🛠️ Smart Text Interaction Script initializing...");

    let startX = 0;
    let startY = 0;

    // 1. Record exactly where the mouse started
    document.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
    });

    // 2. Evaluate what the user was trying to do when they let go of the mouse
    document.addEventListener('mouseup', (e) => {
        // Calculate how far the mouse moved
        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);

        // If it was a drag, abort completely so we don't mess up the movement engine
        if (dx > 3 || dy > 3) return;

        const pubEl = e.target.closest('.pub-element') || e.target.closest('.page-header') || e.target.closest('.page-footer');
        
        // --- PART A: SINGLE-CLICK TO EDIT WITH EXACT CARET PLACEMENT ---
        if (pubEl) {
            // Target the exact cell/element clicked (Ignores WordArt intentionally)
            let editable = e.target.closest('[contenteditable="true"]');
            
            // Fallback for wrappers
            if (!editable && pubEl.getAttribute('contenteditable') === 'true') {
                editable = pubEl;
            } else if (!editable) {
                editable = pubEl.querySelector('[contenteditable="true"]');
            }

            if (editable && !e.target.closest('.resize-handle') && !e.target.closest('.rotate-handle')) {
                // Focus the box immediately
                editable.focus();

                // If this is a double or triple click, let the browser handle text selection natively
                if (e.detail > 1) return;

                // MAGIC TRICK: Find the exact letter under the mouse pointer
                let range = null;
                
                // Chrome, Safari, Edge
                if (document.caretRangeFromPoint) { 
                    range = document.caretRangeFromPoint(e.clientX, e.clientY);
                } 
                // Firefox Fallback
                else if (document.caretPositionFromPoint) { 
                    const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
                    if (pos) {
                        range = document.createRange();
                        range.setStart(pos.offsetNode, pos.offset);
                        range.collapse(true);
                    }
                }

                // If we successfully found the exact text node, drop the cursor there!
                if (range) {
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } 
        
        // --- PART B: CLEAR HIGHLIGHTS ON EXIT ---
        else {
            const clickedToolbar = e.target.closest('.title-bar') || 
                                   e.target.closest('#ribbon-container') || 
                                   e.target.closest('.sidebar-panel') ||
                                   e.target.closest('#float-toolbar') ||
                                   e.target.closest('.custom-dialog');

            if (!clickedToolbar) {
                if (window.getSelection) {
                    window.getSelection().removeAllRanges();
                }
                
                if (document.activeElement && document.activeElement.getAttribute('contenteditable') === 'true') {
                    document.activeElement.blur();
                }
            }
        }
    });

    console.log("✅ Smart Text Interaction (Stable) added successfully.");
})();


(function installAntiLag() {
    console.log("🛠️ Anti-Lag Script initializing...");

    let thumbnailTimer = null;

    // Lightweight debounce — the new generateThumbnail handles its own sequencing
    window.updateThumbnails = function() {
        if (thumbnailTimer) clearTimeout(thumbnailTimer);
        thumbnailTimer = setTimeout(() => {
            // Skip if the user is actively dragging, cropping, or typing
            if (state.dragMode || state.cropMode || (document.activeElement && document.activeElement.isContentEditable)) {
                window.updateThumbnails();
                return;
            }
            if (typeof generateThumbnail === 'function') generateThumbnail(state.currentPageIndex);
        }, 300); 
    };

    console.log("✅ Anti-Lag successfully applied.");
})();


(function installDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }
    document.body.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (!files || files.length === 0) return;

        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        const otherFiles = Array.from(files).filter(f => !f.type.startsWith('image/'));

        // --- A. HANDLE IMAGES (BATCH SMART SWAP) ---
        if (imageFiles.length > 0) {
            let selectedTargets = [];
            if (state.multiSelected && state.multiSelected.length > 0) {
                selectedTargets = state.multiSelected.filter(el => el.getAttribute('data-type') === 'image' || el.querySelector('img'));
            } else if (state.selectedEl && (state.selectedEl.getAttribute('data-type') === 'image' || state.selectedEl.querySelector('img'))) {
                selectedTargets = [state.selectedEl];
            }

            if (imageFiles.length > 1 && selectedTargets.length <= 1) {
                const allPlaceholders = Array.from(document.querySelectorAll('.pub-element[data-is-placeholder="true"]'));
                if (allPlaceholders.length > 0) {
                    allPlaceholders.sort((a, b) => {
                        const rectA = a.getBoundingClientRect();
                        const rectB = b.getBoundingClientRect();
                        if (Math.abs(rectA.top - rectB.top) < 50) return rectA.left - rectB.left;
                        return rectA.top - rectB.top;
                    });
                    if (selectedTargets.length === 1 && selectedTargets[0].getAttribute('data-is-placeholder') === 'true') {
                        const otherPlaceholders = allPlaceholders.filter(p => p !== selectedTargets[0]);
                        selectedTargets = [selectedTargets[0], ...otherPlaceholders];
                    } else {
                        selectedTargets = allPlaceholders;
                    }
                }
            }

            const paperEl = document.getElementById('paper');
            const rect = paperEl.getBoundingClientRect();
            const scale = typeof getScale === 'function' ? getScale() : 1;
            let dropX = (e.clientX - rect.left) / scale;
            let dropY = (e.clientY - rect.top) / scale;
            let filesProcessed = 0;

            imageFiles.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const result = evt.target.result;
                    if (index < selectedTargets.length) {
                        const target = selectedTargets[index];
                        const img = target.querySelector('.element-content img') || target.querySelector('img');
                        if (img) {
                            img.src = result;
                            img.removeAttribute('crossorigin');
                            img.style.objectFit = 'fill';
                            target.removeAttribute('data-is-placeholder');
                        }
                        filesProcessed++;
                        if (filesProcessed === imageFiles.length) {
                            if (typeof pushHistory === 'function') pushHistory();
                            if (typeof updateThumbnails === 'function') updateThumbnails();
                        }
                    } else {
                        const offset = (index - selectedTargets.length) * 20;
                        const tempImg = new Image();
                        tempImg.onload = function() {
                            const maxWidth = 400; const maxHeight = 400;
                            let targetWidth = tempImg.width; let targetHeight = tempImg.height;
                            if (targetWidth > maxWidth || targetHeight > maxHeight) {
                                const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
                                targetWidth = targetWidth * ratio; targetHeight = targetHeight * ratio;
                            }
                            if (typeof createWrapper === 'function') {
                                const wrapper = createWrapper(`<img src="${result}" style="width:100%; height:100%; position:absolute; top:0; left:0; pointer-events:none;">`);
                                wrapper.style.width = targetWidth + 'px'; 
                                wrapper.style.height = targetHeight + 'px';
                                wrapper.setAttribute('data-type', 'image');
                                wrapper.style.left = (dropX + offset) + 'px';
                                wrapper.style.top = (dropY + offset) + 'px';
                            }
                            filesProcessed++;
                            if (filesProcessed === imageFiles.length) {
                                if (typeof pushHistory === 'function') pushHistory();
                                if (typeof updateThumbnails === 'function') updateThumbnails();
                            }
                        };
                        tempImg.src = result;
                    }
                };
                reader.readAsDataURL(file);
            });
        }

        otherFiles.forEach(file => {
            const fileName = file.name.toLowerCase();
            
            // --- B. HANDLE PUBLISHER FILES (.pub, .pubx) ---
            if (fileName.endsWith('.pub') || fileName.endsWith('.pubx')) {
                if (typeof uploadAndConvertPub === 'function') uploadAndConvertPub(file);
            } 
            
            // --- C. HANDLE WORD DOCUMENTS (.doc, .docx) ---
            else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
                if (typeof uploadAndConvertDoc === 'function') uploadAndConvertDoc(file);
            } 
            
            // --- D. HANDLE OPENPUBLISHER NATIVE FILES (.json, .opub) ---
            else if (fileName.endsWith('.json') || fileName.endsWith('.opub')) {
                const reader = new FileReader();
                reader.onload = window.handlePublisherFileLoad;
                reader.readAsText(file);
            }
            
            // --- E. HANDLE EXCEL SPREADSHEETS (.xls, .xlsx) ---
            else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
                if (typeof uploadAndConvertExcel === 'function') uploadAndConvertExcel(file, fileName);
            }
        });
    }
})();


(function initAboutBox() {
    // 1. Automatically inject the "About" button into the "File" ribbon tab
    function injectButton() {
        const fileRibbon = document.getElementById('ribbon-file');
        if (fileRibbon && !document.getElementById('about-btn-group')) {
            const aboutGroup = document.createElement('div');
            aboutGroup.id = 'about-btn-group';
            aboutGroup.className = 'group';
            aboutGroup.innerHTML = `
                <div class="tool-btn" onclick="window.showAboutDialog()"><i class="fas fa-info-circle"></i>About</div>
                <div class="group-label">Info</div>
            `;
            fileRibbon.appendChild(aboutGroup);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectButton);
    } else {
        injectButton();
    }

    // 2. Render the Custom About Dialog
    window.showAboutDialog = function() {
        const aboutHtml = `
            <style>
                .about-container { font-family: 'Segoe UI', Roboto, Helvetica, sans-serif; color: #334155; text-align: center; padding: 5px; box-sizing: border-box; width: 100%; }
                .about-header { margin-bottom: 15px; }
                
                /* Increased Title & Logo Size */
                .about-title { font-size: 30px; font-weight: 700; color: var(--ui-theme-color); display: flex; align-items: center; justify-content: center; gap: 10px; }
                .about-title i { font-size: 36px; }
                
                .about-subtitle { font-size: 13px; color: #64748b; font-weight: 500; margin-top: 4px; }
                .about-desc { font-size: 13px; line-height: 1.5; margin-bottom: 18px; padding: 0 10px; }
                
                /* ywa.app Premium Sponsor Card */
                .ywa-card {
                    display: flex; align-items: center; gap: 15px; padding: 15px;
                    background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px;
                    text-align: left; transition: all 0.2s ease; margin-bottom: 5px;
                }
                .ywa-card:hover { border-color: #cbd5e1; background: #f1f5f9; }
                .ywa-logo { width: 56px; height: 56px; object-fit: contain; flex-shrink: 0; border-radius: 8px; }
                .ywa-info { flex: 1; }
                .ywa-title { font-weight: 600; font-size: 14px; color: #0f172a; margin-bottom: 4px; }
                .ywa-desc { font-size: 12px; color: #475569; line-height: 1.4; }
                .ywa-link { color: #0ea5e9; text-decoration: none; font-weight: 600; transition: color 0.2s; }
                .ywa-link:hover { text-decoration: underline; color: #0284c7; }

                /* Integrated Green Donate Buttons */
                .about-donate-container { display: flex; flex-direction: column; gap: 4px; opacity: 0; align-items: flex-start; }
                .about-donate-label { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding-left: 2px; }
                .about-donate-btns-wrapper { display: flex; gap: 8px; }
                .about-donate-btn {
                    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
                    color: #ffffff; padding: 6px 14px; border-radius: 4px;
                    text-decoration: none; font-weight: 600; font-size: 13px; white-space: nowrap;
                    transition: all 0.2s; border: none; cursor: pointer; 
                }
                .patreon-btn { background: #FF424D; }
                .patreon-btn:hover { background: #e03640; color: white; text-decoration: none; }
                .paypal-btn { background: #0079C1; }
                .paypal-btn:hover { background: #005a9c; color: white; text-decoration: none; }

                /* Footer Dev Links (GitHub & CodePen) */
                .about-center-links { display: flex; gap: 16px; opacity: 0; align-items: center; }
                .about-footer-link {
                    display: inline-flex; align-items: center; gap: 6px;
                    color: #64748b; text-decoration: none; font-size: 13.5px; font-weight: 600;
                    transition: color 0.2s;
                }
                .about-footer-link:hover { color: #0f172a; text-decoration: none; }
                .about-footer-link i { font-size: 16px; }
            </style>

            <div class="about-container">
                <div class="about-header">
                    <div class="about-title"><i class="fas fa-print"></i> Open Publisher</div>
                    <div class="about-subtitle">Free Online Desktop Publishing Tool</div>
                </div>
                
                <div class="about-desc">
                    An open-source, no-signup alternative to traditional desktop publishing software. 
                    It is <strong>100% ad-free</strong> and completely free to use. Design flyers and documents locally in your browser, with support for 
                    <strong>.pub</strong>, <strong>.doc</strong>, and <strong>.docx</strong> files via cloud conversion.
                </div>

                <div class="ywa-card">
                    <img src="https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/VkbZiaJ.png" alt="ywa.app Logo" class="ywa-logo">
                    <div class="ywa-info">
                        <div class="ywa-title">Featured on ywa.app</div>
                        <div class="ywa-desc">
                            Find Open Publisher and explore a network of fast, secure, and zero-install web applications at <a href="https://ywa.app" target="_blank" class="ywa-link">ywa.app</a>.
                        </div>
                    </div>
                </div>

                <div id="about-donate-btn" class="about-donate-container">
                    <div class="about-donate-label">Support the Project</div>
                    <div class="about-donate-btns-wrapper">
                        <a href="https://www.patreon.com/cw/OpenPublisher" target="_blank" class="about-donate-btn patreon-btn">
                            <i class="fab fa-patreon"></i> Patreon
                        </a>
                        <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=ltait95@yahoo.co.uk&item_name=Support+Your+Web+Apps" target="_blank" class="about-donate-btn paypal-btn">
                            <i class="fab fa-paypal"></i> PayPal
                        </a>
                    </div>
                </div>
                
                <div id="about-center-links" class="about-center-links">
                    <a href="https://github.com/rmellis/open-publisher" target="_blank" class="about-footer-link">
                        <i class="fab fa-github"></i> GitHub
                    </a>
                    <a href="https://codepen.io/rmellis/pen/bNexPwL" target="_blank" class="about-footer-link">
                        <i class="fab fa-codepen"></i> CodePen
                    </a>
                </div>
            </div>
        `;

        if (typeof DialogSystem !== 'undefined') {
            DialogSystem.init(); 
            DialogSystem.show('About', aboutHtml, null, true);
        }

        // Bulletproof loop
        let moveAttempts = 0;
        const moveInterval = setInterval(() => {
            const donateBtn = document.getElementById('about-donate-btn');
            const centerLinks = document.getElementById('about-center-links');
            const actionRow = document.querySelector('.custom-dialog-footer');
            const dialogBox = document.getElementById('custom-dialog-box');

            if (donateBtn && centerLinks && actionRow && dialogBox) {
                // Lock the width so the text wraps beautifully and buttons fit
                dialogBox.style.setProperty('width', '520px', 'important');
                dialogBox.style.setProperty('max-width', '95vw', 'important');

                // Adjust footer to perfectly split 3 elements: Left, Center Block, Right
                actionRow.style.display = 'flex';
                actionRow.style.justifyContent = 'space-between';
                actionRow.style.alignItems = 'center';
                actionRow.style.width = '100%';
                
                // Find the OK button
                const buttons = actionRow.querySelectorAll('button');
                let okBtn = null;
                buttons.forEach(b => { 
                    if (b.innerText.trim().toUpperCase() === 'OK' || b.innerText.trim().toUpperCase() === 'CLOSE') okBtn = b; 
                });
                if (!okBtn && buttons.length > 0) okBtn = buttons[buttons.length - 1];

                // Unhide the injected elements
                donateBtn.style.opacity = '1';
                centerLinks.style.opacity = '1';
                
                // Inject them in order BEFORE the OK button: [Donate] -> [Center Block] -> [OK]
                if (okBtn) {
                    actionRow.insertBefore(donateBtn, okBtn);
                    actionRow.insertBefore(centerLinks, okBtn);
                } else {
                    actionRow.appendChild(donateBtn);
                    actionRow.appendChild(centerLinks);
                }
                
                clearInterval(moveInterval); // Success! Stop looping.
            }

            moveAttempts++;
            if (moveAttempts > 20) {
                if (donateBtn) donateBtn.style.opacity = '1';
                if (centerLinks) centerLinks.style.opacity = '1';
                clearInterval(moveInterval);
            }
        }, 20); 
    };
})();


(function init3DViewMode() {
    function inject3DViewButton() {
        const viewRibbon = document.getElementById('ribbon-view');
        if (viewRibbon && !document.getElementById('3dview-btn-group')) {
            const viewGroup = document.createElement('div');
            viewGroup.id = '3dview-btn-group';
            viewGroup.className = 'group';
            viewGroup.innerHTML = `
                <div class="tool-btn" onclick="window.toggle3DView()"><i class="fas fa-cube"></i>3D View</div>
                <div class="group-label">Topology</div>
            `;
            viewRibbon.appendChild(viewGroup);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject3DViewButton);
    } else {
        inject3DViewButton();
    }

    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    window.is3DViewActive = false;
    window.toggle3DView = function() {
        const livePaper = document.getElementById('paper');
        const viewport = document.getElementById('viewport'); 
        if (!livePaper || !viewport) return;

        if (window.is3DViewActive) {
            window.is3DViewActive = false;
            const overlay = document.getElementById('native-3d-overlay');
            if (overlay) overlay.remove();
            livePaper.style.opacity = '1'; 
            return;
        }

        window.is3DViewActive = true;

        const paperClone = livePaper.cloneNode(true);
        paperClone.id = '3d-paper-clone';

        const allCloneNodes = paperClone.querySelectorAll('*');
        allCloneNodes.forEach(node => {
            if (node.id) node.id = node.id + '-clone';
            node.removeAttribute('contenteditable');
            node.style.userSelect = 'none'; 
            if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(node.tagName)) {
                node.disabled = true;
            }
        });
        
        let activeZoom = (typeof state !== 'undefined' && state.zoom) ? state.zoom : 1.0;
        let rotX = 60;
        let rotZ = -25;
        let panY = 0; 

        const updateTransform = () => {
            paperClone.style.transform = `translateY(${panY}px) scale(${activeZoom}) rotateX(${rotX}deg) rotateZ(${rotZ}deg)`;
        };
        
        paperClone.style.opacity = '1'; 
        paperClone.style.backgroundColor = '#ffffff'; 
        paperClone.style.position = 'relative';
        paperClone.style.top = 'auto';
        paperClone.style.left = 'auto';
        paperClone.style.margin = '0';
        paperClone.style.transformStyle = 'preserve-3d';
        paperClone.style.transition = 'transform 0.1s ease-out'; 
        paperClone.style.boxShadow = '-30px 40px 60px rgba(0,0,0,0.2)'; 
        paperClone.style.pointerEvents = 'none'; 
        
        updateTransform(); 

        livePaper.style.opacity = '0';

        const overlay = document.createElement('div');
        overlay.id = 'native-3d-overlay';
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.zIndex = '9999';
        overlay.style.background = 'transparent'; 
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.perspective = '2500px';
        overlay.style.overflow = 'hidden';
        overlay.style.cursor = 'grab'; 

        const ctrlPanel = document.createElement('div');
        ctrlPanel.className = 'xray-ctrl-panel';

        const zoomInBtn = document.createElement('button');
        zoomInBtn.className = 'xray-btn-icon';
        zoomInBtn.innerHTML = '<i class="fas fa-search-plus"></i>';
        zoomInBtn.title = "Zoom In (Ctrl + Scroll Up)";
        zoomInBtn.onclick = () => { activeZoom = Math.min(activeZoom + 0.1, 3.0); updateTransform(); };

        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.className = 'xray-btn-icon';
        zoomOutBtn.innerHTML = '<i class="fas fa-search-minus"></i>';
        zoomOutBtn.title = "Zoom Out (Ctrl + Scroll Down)";
        zoomOutBtn.onclick = () => { activeZoom = Math.max(activeZoom - 0.1, 0.3); updateTransform(); };

        const closeBtn = document.createElement('button');
        closeBtn.className = 'xray-btn-close';
        closeBtn.innerHTML = '<i class="fas fa-times"></i> Close 3D View';
        closeBtn.onclick = window.toggle3DView;

        ctrlPanel.appendChild(zoomOutBtn);
        ctrlPanel.appendChild(zoomInBtn);
        ctrlPanel.appendChild(closeBtn);

        let isDragging = false, prevMouse = { x: 0, y: 0 };
        
        overlay.onmousedown = (e) => { 
            if (e.target.closest('.xray-ctrl-panel')) return;
            isDragging = true; 
            overlay.style.cursor = 'grabbing';
            prevMouse = { x: e.clientX, y: e.clientY }; 
        };
        overlay.onmouseup = () => { isDragging = false; overlay.style.cursor = 'grab'; };
        overlay.onmouseleave = () => { isDragging = false; overlay.style.cursor = 'grab'; };
        overlay.onmousemove = (e) => {
            if (isDragging) {
                const delta = { x: e.clientX - prevMouse.x, y: e.clientY - prevMouse.y };
                rotZ += delta.x * 0.4; 
                rotX -= delta.y * 0.4;
                updateTransform();
                prevMouse = { x: e.clientX, y: e.clientY };
            }
        };

        overlay.onwheel = (e) => {
            e.preventDefault(); 
            if (e.ctrlKey || e.metaKey) {
                const zoomSpeed = 0.05;
                if (e.deltaY < 0) activeZoom += zoomSpeed;
                else activeZoom -= zoomSpeed;
                activeZoom = Math.max(0.3, Math.min(activeZoom, 3.0)); 
            } else {
                panY -= e.deltaY; 
            }
            updateTransform();
        };

        overlay.appendChild(paperClone);
        overlay.appendChild(ctrlPanel);
        
        if (window.getComputedStyle(viewport).position === 'static') {
            viewport.style.position = 'relative'; 
        }
        
        viewport.appendChild(overlay);
        
        setTimeout(() => {
            const liveElements = Array.from(livePaper.children);
            const cloneElements = Array.from(paperClone.children);

            const isStructural = (el) => {
                const pos = window.getComputedStyle(el).position;
                return el.id === 'margin-guides' || el.id === 'page-border' || el.tagName === 'CANVAS' || el.classList.contains('page-header') || el.classList.contains('page-footer') || pos !== 'absolute';
            };

            const interactiveItems = [];

            liveElements.forEach((liveEl, index) => {
                const cloneEl = cloneElements[index];
                if (!cloneEl) return;

                const liveComputed = window.getComputedStyle(liveEl);

                if (isStructural(liveEl)) {
                    if (cloneEl.tagName === 'CANVAS' || cloneEl.classList.contains('page-background')) cloneEl.style.opacity = '0';
                    cloneEl.style.transform = 'translateZ(0px)';
                } else {
                    cloneEl.style.position = liveComputed.position;
                    cloneEl.style.left = liveComputed.left;
                    cloneEl.style.top = liveComputed.top;
                    cloneEl.style.width = liveComputed.width;
                    cloneEl.style.height = liveComputed.height;
                    cloneEl.style.zIndex = liveComputed.zIndex;
                    
                    // Push to array so we can sort them by rank
                    interactiveItems.push({
                        clone: cloneEl,
                        zVal: parseInt(liveComputed.zIndex) || 0
                    });
                }
            });

            // Sort by actual Z-Index to find their exact physical stacking rank
            interactiveItems.sort((a, b) => a.zVal - b.zVal);

            // THE FIX: Compact Cloud Math. Base lift + tiny micro-step.
            interactiveItems.forEach((item, rankIndex) => {
                // Base lift of 50px off the paper, plus a micro 2px step to stop clipping!
                const zOffset = 50 + (rankIndex * 2); 
                
                item.clone.style.transform = `translateZ(${zOffset}px)`;
                item.clone.style.boxShadow = '-8px 12px 18px rgba(0,0,0,0.15)';
                item.clone.style.backgroundColor = '#ffffff'; 
                item.clone.style.border = '1px solid var(--ui-theme-color)';
                item.clone.style.transformStyle = 'flat';
                item.clone.style.textShadow = '0px 0px 1px rgba(0,0,0,0.2)';
                item.clone.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        }, 10);
    };
})();


(function initDraggableModals() {
    
    // 1. THE SAFE ZONE: Creates a hidden bunker to protect grids from being deleted
    window.rescueGrids = function rescueGrids() {
        let safeZone = document.getElementById('modal-safe-zone');
        if (!safeZone) {
            safeZone = document.createElement('div');
            safeZone.id = 'modal-safe-zone';
            safeZone.style.display = 'none';
            document.body.appendChild(safeZone);
        }
        const grids = ['template-cats', 'template-grid', 'clipart-grid', 'ad-grid', 'dialog-wordart-grid', 'beta-wa-grid'];
        grids.forEach(id => {
            const el = document.getElementById(id);
            if (el) safeZone.appendChild(el); 
        });
    }

    // 2. MONKEY-PATCH DIALOGSYSTEM: We intercept Show and Close to save the grids first!
    if (typeof DialogSystem !== 'undefined' && !DialogSystem._isPatchedForGrids) {
        const originalShow = DialogSystem.show;
        DialogSystem.show = function() {
            rescueGrids(); // Save grids before overwriting HTML
            if (originalShow) originalShow.apply(this, arguments);
        };

        const originalClose = DialogSystem.close;
        DialogSystem.close = function() {
            rescueGrids(); // Save grids before destroying the dialog box!
            if (originalClose) originalClose.apply(this, arguments);
        };
        
        DialogSystem._isPatchedForGrids = true;
    }




    // 4. TEMPLATES MODAL OVERRIDE
    window.showTemplateModal = function() {
        if(typeof rescueGrids === 'function') rescueGrids();
        const cats = document.getElementById('template-cats');
        const grid = document.getElementById('template-grid');
        if (!cats || !grid) return; 

        const html = `<div id="dialog-template-container" style="display:flex; flex-direction:column; gap:15px;"></div>`;
        DialogSystem.show('Publication Templates', html, null, true);
        
        const dialogBox = document.getElementById('custom-dialog-box');
        if(dialogBox) {
            dialogBox.style.width = '850px';
            dialogBox.style.maxWidth = '95vw';
            const body = dialogBox.querySelector('.custom-dialog-body');
            if (body) { body.style.maxHeight = '75vh'; body.style.overflowY = 'auto'; }
        }
        
        const container = document.getElementById('dialog-template-container');
        if(container) {
            container.appendChild(cats);
            container.appendChild(grid);
            cats.style.display = 'flex';
            grid.style.display = 'grid';
        }
    };

    // 5. CLIPART MODAL OVERRIDE
    window.showClipartModal = function() {
        rescueGrids();
        const grid = document.getElementById('clipart-grid');
        if (!grid) return;

        const html = `<div id="dialog-clipart-container"></div>`;
        DialogSystem.show('Emojis', html, null, true);
        
        const dialogBox = document.getElementById('custom-dialog-box');
        if(dialogBox) { 
            dialogBox.style.width = '800px'; 
            dialogBox.style.maxWidth = '95vw'; 
            const body = dialogBox.querySelector('.custom-dialog-body');
            if (body) { body.style.maxHeight = '70vh'; body.style.overflowY = 'auto'; }
        }
        
        const container = document.getElementById('dialog-clipart-container');
        if (container) {
            container.appendChild(grid);
            grid.style.display = 'grid';
        }
        
        Array.from(grid.children).forEach(item => {
            if (item.classList.contains('gallery-item') && !item.dataset.modalHooked) {
                const originalClick = item.onclick;
                item.onclick = (e) => {
                    DialogSystem.close();
                    if(originalClick) originalClick(e);
                };
                item.dataset.modalHooked = 'true';
            }
        });
    };

    // 6. ADS MODAL OVERRIDE
    window.showAdModal = function() {
        rescueGrids();
        const grid = document.getElementById('ad-grid');
        if (!grid) return;

        const html = `<div id="dialog-ad-container"></div>`;
        DialogSystem.show('Advertisement Templates', html, null, true);
        
        const dialogBox = document.getElementById('custom-dialog-box');
        if(dialogBox) { 
            dialogBox.style.width = '700px'; 
            dialogBox.style.maxWidth = '95vw'; 
            const body = dialogBox.querySelector('.custom-dialog-body');
            if (body) { body.style.maxHeight = '65vh'; body.style.overflowY = 'auto'; }
        }
        
        const container = document.getElementById('dialog-ad-container');
        if (container) {
            container.appendChild(grid);
            grid.style.display = 'grid';
        }
        
        Array.from(grid.children).forEach(item => {
            if (item.classList.contains('gallery-item') && !item.dataset.modalHooked) {
                const originalClick = item.onclick;
                item.onclick = (e) => {
                    DialogSystem.close();
                    if(originalClick) originalClick(e);
                };
                item.dataset.modalHooked = 'true';
            }
        });
    };

})();


(function initWordArtExpansion() {
    
    // 1. INJECT THE MASSIVE CSS PAYLOAD
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // 2. NON-DESTRUCTIVE MODAL INJECTION
    /* Legacy WordArt injection replaced by optimized core modal */
})();


(function initTemplateEngineV11() {

    // 1. DIALOG CRASH PREVENTION
    if (typeof DialogSystem !== 'undefined' && !DialogSystem._isSafelyPatched) {
        const originalShow = DialogSystem.show;
        DialogSystem.show = function(title, content, onConfirm, isAlert) {
            const safeConfirm = onConfirm ? function() {
                try { onConfirm(); } catch(e) { console.error("Dialog Blocked:", e); }
            } : null;
            originalShow.call(DialogSystem, title, content, safeConfirm, isAlert);
        };
        DialogSystem._isSafelyPatched = true;
    }

    // 2. THE BULLETPROOF EDITABLE SWEEP
    if (typeof window.originalRenderPage_BeforeEditSweep === 'undefined') {
        window.originalRenderPage_BeforeEditSweep = window.renderPage;
        window.renderPage = function(page) {
            const ret = window.originalRenderPage_BeforeEditSweep(page);
            setTimeout(() => {
                const paperEl = document.getElementById('paper');
                if (!paperEl) return;
                const pubElements = paperEl.querySelectorAll('.pub-element');
                pubElements.forEach(el => {
                    const contentContainer = el.querySelector('.element-content');
                    if (!contentContainer) return;
                    const innerNode = contentContainer.firstElementChild;
                    if (!innerNode) return;
                    if (innerNode.tagName !== 'IMG' && innerNode.tagName !== 'CANVAS' && innerNode.tagName !== 'SVG' && !innerNode.style.clipPath && !innerNode.classList.contains('wa-wrapper')) {
                        innerNode.setAttribute('contenteditable', 'true');
                        innerNode.setAttribute('spellcheck', 'false');
                        contentContainer.style.pointerEvents = 'auto';
                    }
                });
            }, 50);
            return ret;
        };
    }

})();


(function applyUITheme() {
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // Spinner Trigger Logic
    document.addEventListener('click', (e) => {
        if(e.target && e.target.closest && e.target.closest('.cat-btn')) {
            const grid = document.getElementById('template-grid');
            if (grid) {
                grid.classList.add('is-loading');
                setTimeout(() => { grid.classList.remove('is-loading'); }, 250); 
            }
        }
    });
    
    const originalShow = window.showTemplateModal;
    if (typeof originalShow === 'function' && !window._loaderHooked) {
        window._loaderHooked = true;
        window.showTemplateModal = function() {
            originalShow();
            const grid = document.getElementById('template-grid');
            if (grid) {
                grid.classList.add('is-loading');
                setTimeout(() => grid.classList.remove('is-loading'), 250);
            }
        }
    }
})();


(function initFormatIndicator() {
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    const oldIndicator = document.getElementById('op-format-indicator');
    if (oldIndicator) oldIndicator.remove(); 
    
    const indicator = document.createElement('div');
    indicator.id = 'op-format-indicator';
    
    indicator.title = "To change the page size, click 'Size' in the Home tab.";
    document.body.appendChild(indicator);

    const makeIcon = (label, vw, w, fs, y) => `
        <svg width="${w}" height="35" viewBox="0 0 ${vw} 28" style="display:block;">
            <path d="M 2 28 L 2 4 C 2 2.9 2.9 2 4 2 L ${vw-4} 2 C ${vw-2.9} 2 ${vw-2} 2.9 ${vw-2} 4 L ${vw-2} 28" fill="none" stroke="currentColor" stroke-width="0.8"/>
            <text x="${vw/2}" y="${y}" font-family="Arial, sans-serif" font-size="${fs}" font-weight="bold" fill="currentColor" text-anchor="middle">${label}</text>
        </svg>
    `;

    window.setPageFormatIcon = function(format) {
        let svg = '';
        const f = format ? format.toLowerCase() : '';
        if (f === 'letter') svg = makeIcon('LETTER', 32, 40, 6.5, 17);
        else if (f === 'a3') svg = makeIcon('A3', 24, 30, 10, 18);
        else if (f === 'a4') svg = makeIcon('A4', 24, 30, 10, 18);
        else if (f === 'a5') svg = makeIcon('A5', 24, 30, 10, 18);
        else if (f === 'legal') svg = makeIcon('LEGAL', 24, 30, 5.5, 17);
        else if (f === 'tabloid') svg = makeIcon('TABLOID', 34, 42, 5.5, 17);
        else if (f === 'businesscard') {
            svg = `
            <svg width="40" height="35" viewBox="0 0 36 28" style="display:block;">
                <path d="M 2 20 L 2 4 C 2 2.9 2.9 2 4 2 L 32 2 C 33.1 2 34 2.9 34 4 L 34 20 C 34 21.1 33.1 22 32 22 L 4 22 C 2.9 22 2 21.1 2 20 Z" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <text x="18" y="14" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="currentColor" text-anchor="middle">CARD</text>
            </svg>`;
        }
        else svg = makeIcon('CUSTOM', 34, 42, 5.5, 17);
        
        indicator.innerHTML = svg;
        indicator.style.transform = 'scale(1.1)';
        setTimeout(() => { indicator.style.transform = 'scale(1)'; }, 150);
    };

    indicator.innerHTML = makeIcon('A4', 24, 30, 10, 18);

    const originalLoad = window.loadTemplate;
    if (typeof originalLoad === 'function' && !window._formatHooked) {
        window._formatHooked = true;
        window.loadTemplate = function(t) {
            originalLoad(t);
            let w = t.w;
            let h = t.h || 1123;
            if (typeof state !== 'undefined' && state.isSpreadMode) {
                w = w / 2;
            }
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
        };
    }
})();
