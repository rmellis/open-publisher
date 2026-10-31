// Open Publisher UI Interactions (v5.14.1)
(function installRulerTrackingEngine() {
    console.log("🛠️ Ruler Tracking Engine initializing (Selection & Cursor Indicators v5.14.1)...");

    let rulerH = null;
    let rulerV = null;
    let selMarkerH = null;
    let curMarkerH = null;
    let selMarkerV = null;
    let curMarkerV = null;

    function ensureRulerMarkers() {
        if (!rulerH) rulerH = document.getElementById('ruler-h');
        if (!rulerV) rulerV = document.getElementById('ruler-v');
        if (!rulerH || !rulerV) return false;

        if (!selMarkerH || !selMarkerH.parentNode) {
            selMarkerH = document.getElementById('ruler-h-selection-marker');
            if (!selMarkerH) {
                selMarkerH = document.createElement('div');
                selMarkerH.id = 'ruler-h-selection-marker';
                selMarkerH.className = 'ruler-selection-marker-h op-ruler-highlight-h';
                rulerH.appendChild(selMarkerH);
            }
        }
        if (!curMarkerH || !curMarkerH.parentNode) {
            curMarkerH = document.getElementById('ruler-h-cursor-marker');
            if (!curMarkerH) {
                curMarkerH = document.createElement('div');
                curMarkerH.id = 'ruler-h-cursor-marker';
                curMarkerH.className = 'ruler-cursor-marker-h';
                rulerH.appendChild(curMarkerH);
            }
        }
        if (!selMarkerV || !selMarkerV.parentNode) {
            selMarkerV = document.getElementById('ruler-v-selection-marker');
            if (!selMarkerV) {
                selMarkerV = document.createElement('div');
                selMarkerV.id = 'ruler-v-selection-marker';
                selMarkerV.className = 'ruler-selection-marker-v op-ruler-highlight-v';
                rulerV.appendChild(selMarkerV);
            }
        }
        if (!curMarkerV || !curMarkerV.parentNode) {
            curMarkerV = document.getElementById('ruler-v-cursor-marker');
            if (!curMarkerV) {
                curMarkerV = document.createElement('div');
                curMarkerV.id = 'ruler-v-cursor-marker';
                curMarkerV.className = 'ruler-cursor-marker-v';
                rulerV.appendChild(curMarkerV);
            }
        }
        return true;
    }

    // --- Cached geometry (refreshed once per frame, never inside mouse events) ---
    let hRectCache = null;
    let vRectCache = null;
    let vpRectCache = null;
    let rulersActive = false;
    let lastRulerHealthCheck = 0;

    // --- Last written values (skip redundant style writes) ---
    let lastSel = { hl: NaN, hw: NaN, vt: NaN, vh: NaN, marquee: null, shownH: null, shownV: null };
    let lastCur = { x: NaN, y: NaN, hShown: null, vShown: null };

    // --- Latest mouse position ---
    let mouseX = -1;
    let mouseY = -1;
    let mouseSeen = false;

    function setDisplay(el, show, key, store) {
        if (store[key] !== show) {
            el.style.display = show ? 'block' : 'none';
            store[key] = show;
        }
    }

    // Writes the cursor hairlines using cached geometry only (no layout reads).
    // Uses transforms so the move is handled by the compositor, not by layout.
    function applyCursor() {
        if (!rulersActive || !mouseSeen || !hRectCache || !vRectCache || !vpRectCache) {
            if (curMarkerH) setDisplay(curMarkerH, false, 'hShown', lastCur);
            if (curMarkerV) setDisplay(curMarkerV, false, 'vShown', lastCur);
            return;
        }

        const inH = mouseX >= hRectCache.left && mouseX <= vpRectCache.right &&
                    mouseY >= hRectCache.top && mouseY <= vpRectCache.bottom;
        const inV = mouseY >= vRectCache.top && mouseY <= vpRectCache.bottom &&
                    mouseX >= vRectCache.left && mouseX <= vpRectCache.right;

        if (inH) {
            const x = Math.round(mouseX - hRectCache.left);
            if (x !== lastCur.x) {
                curMarkerH.style.transform = 'translate3d(' + x + 'px, 0, 0)';
                lastCur.x = x;
            }
        }
        setDisplay(curMarkerH, inH, 'hShown', lastCur);

        if (inV) {
            const y = Math.round(mouseY - vRectCache.top);
            if (y !== lastCur.y) {
                curMarkerV.style.transform = 'translate3d(0, ' + y + 'px, 0)';
                lastCur.y = y;
            }
        }
        setDisplay(curMarkerV, inV, 'vShown', lastCur);
    }

    function hideSelection() {
        setDisplay(selMarkerH, false, 'shownH', lastSel);
        setDisplay(selMarkerV, false, 'shownV', lastSel);
    }

    // 1. Per-frame loop: refresh geometry, update selection spans, then place the cursor
    function trackSelection() {
        if (!ensureRulerMarkers()) {
            requestAnimationFrame(trackSelection);
            return;
        }

        const canvasArea = document.querySelector('.canvas-area');
        const isMultiPage = (canvasArea && canvasArea.classList.contains('multi-page-canvas')) ||
                            (typeof state !== 'undefined' && state.isMultiPageMode);
        rulersActive = !isMultiPage && rulerH.offsetParent !== null;

        if (!rulersActive) {
            hideSelection();
            applyCursor();
            requestAnimationFrame(trackSelection);
            return;
        }

        // Automatic Ruler Canvas Self-Healing (handles background hibernation & low-resource GPU recovery)
        if (!document.hidden) {
            const now = performance.now();
            if (now - lastRulerHealthCheck > 1000) {
                lastRulerHealthCheck = now;
                if (typeof window.isRulerCanvasHealthy === 'function' && !window.isRulerCanvasHealthy()) {
                    if (typeof window.syncRulers === 'function') window.syncRulers();
                }
            }
        }

        // Refresh geometry once per frame so mouse events never touch layout
        hRectCache = rulerH.getBoundingClientRect();
        vRectCache = rulerV.getBoundingClientRect();
        const vp = document.getElementById('viewport');
        vpRectCache = vp ? vp.getBoundingClientRect() : (canvasArea ? canvasArea.getBoundingClientRect() : null);

        let targetRect = null;
        let isMarquee = false;

        // Priority 1: Active Marquee Box drag
        if (typeof state !== 'undefined' && state.dragMode === 'marquee') {
            const marqueeBox = document.getElementById('marquee-box');
            if (marqueeBox && marqueeBox.style.display !== 'none') {
                targetRect = marqueeBox.getBoundingClientRect();
                isMarquee = true;
            }
        }

        // Priority 2: Multi-selection bounding box union
        if (!targetRect && typeof state !== 'undefined' && state.multiSelected && state.multiSelected.length > 0) {
            let minLeft = Infinity, minTop = Infinity, maxRight = -Infinity, maxBottom = -Infinity;
            let count = 0;
            state.multiSelected.forEach(el => {
                if (el && el.getBoundingClientRect) {
                    const r = el.getBoundingClientRect();
                    if (r.width > 0 || r.height > 0) {
                        minLeft = Math.min(minLeft, r.left);
                        minTop = Math.min(minTop, r.top);
                        maxRight = Math.max(maxRight, r.right);
                        maxBottom = Math.max(maxBottom, r.bottom);
                        count++;
                    }
                }
            });
            if (count > 0 && maxRight > minLeft && maxBottom > minTop) {
                targetRect = {
                    left: minLeft,
                    top: minTop,
                    right: maxRight,
                    bottom: maxBottom,
                    width: maxRight - minLeft,
                    height: maxBottom - minTop
                };
            }
        }

        // Priority 3: Single selected element
        if (!targetRect && typeof state !== 'undefined' && state.selectedEl) {
            targetRect = state.selectedEl.getBoundingClientRect();
        }

        // Priority 4: Fallback DOM query
        if (!targetRect) {
            const fallbackEl = document.querySelector('.pub-element.selected');
            if (fallbackEl) {
                targetRect = fallbackEl.getBoundingClientRect();
            }
        }

        if (targetRect && targetRect.width > 0 && targetRect.height > 0) {
            const hl = targetRect.left - hRectCache.left;
            const hw = targetRect.width;
            const vt = targetRect.top - vRectCache.top;
            const vh = targetRect.height;

            // Marquee drags use a lighter, airier tint than object selections
            if (lastSel.marquee !== isMarquee) {
                selMarkerH.classList.toggle('is-marquee', isMarquee);
                selMarkerV.classList.toggle('is-marquee', isMarquee);
                lastSel.marquee = isMarquee;
            }
            if (hl !== lastSel.hl || hw !== lastSel.hw) {
                selMarkerH.style.left = hl + 'px';
                selMarkerH.style.width = hw + 'px';
                lastSel.hl = hl; lastSel.hw = hw;
            }
            if (vt !== lastSel.vt || vh !== lastSel.vh) {
                selMarkerV.style.top = vt + 'px';
                selMarkerV.style.height = vh + 'px';
                lastSel.vt = vt; lastSel.vh = vh;
            }
            setDisplay(selMarkerH, true, 'shownH', lastSel);
            setDisplay(selMarkerV, true, 'shownV', lastSel);
        } else {
            hideSelection();
        }

        // Re-place the cursor against fresh geometry (covers scrolling / zooming under a still mouse)
        applyCursor();

        requestAnimationFrame(trackSelection);
    }

    // 2. Real-time cursor tracking: capture phase so no other handler can swallow the event,
    //    and the markers are moved immediately with cached geometry (zero layout reads).
    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        mouseSeen = true;
        if (!ensureRulerMarkers()) return;
        // One-time priming: if no animation frame has populated the cache yet, do it now
        if (!hRectCache || !vRectCache || !vpRectCache) {
            const canvasArea = document.querySelector('.canvas-area');
            const isMultiPage = (canvasArea && canvasArea.classList.contains('multi-page-canvas')) ||
                                (typeof state !== 'undefined' && state.isMultiPageMode);
            rulersActive = !isMultiPage && rulerH.offsetParent !== null;
            hRectCache = rulerH.getBoundingClientRect();
            vRectCache = rulerV.getBoundingClientRect();
            const vp = document.getElementById('viewport');
            vpRectCache = vp ? vp.getBoundingClientRect() : (canvasArea ? canvasArea.getBoundingClientRect() : null);
        }
        applyCursor();
    }

    function onMouseLeave() {
        mouseSeen = false;
        applyCursor();
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true, capture: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    window.addEventListener('blur', onMouseLeave);

    requestAnimationFrame(trackSelection);
    console.log("✅ Ruler Tracking Engine started successfully.");
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
                                <span id="ctx-font-label-${target.suffix}">Segoe UI</span> 
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
                        
                        <div style="width:1px; height:16px; background:#ccc; margin:0 2px;"></div>
                        
                        <div class="mini-btn ctx-btn-strict" id="ctx-dir-ltr-${target.suffix}" onclick="window.setTextDirection('ltr')" title="Left-to-Right Text Direction (Ctrl+Left Shift)"><svg width="14" height="14" viewBox="0 0 16 16"><path d="M1 2.5h7v1.8H1zm0 3.2h5v1.8H1zm0 3.2h7v1.8H1zm0 3.2h4v1.8H1z"/><path d="M10 7.8h4.5m-2.2-2.2 2.2 2.2-2.2 2.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></div>
                        <div class="mini-btn ctx-btn-strict" id="ctx-dir-rtl-${target.suffix}" onclick="window.setTextDirection('rtl')" title="Right-to-Left Text Direction (Ctrl+Right Shift)"><svg width="14" height="14" viewBox="0 0 16 16"><path d="M8 2.5h7v1.8H8zm2 3.2h5v1.8h-5zm-2 3.2h7v1.8H8zm3 3.2h4v1.8h-4z"/><path d="M6 7.8H1.5m2.2-2.2-2.2 2.2 2.2 2.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></div>
                    </div>
                    <div class="ctx-row">
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('justifyLeft')" title="Align Left"><i class="fas fa-align-left"></i></div>
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('justifyCenter')" title="Align Center"><i class="fas fa-align-center"></i></div>
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('justifyRight')" title="Align Right"><i class="fas fa-align-right"></i></div>
                        <div class="mini-btn ctx-btn-strict" onclick="execCmd('justifyFull')" title="Justify"><i class="fas fa-align-justify"></i></div>
                        
                        <div style="width:1px; height:16px; background:#ccc; margin:0 2px;"></div>
                        
                        <div class="mini-btn ctx-btn-strict" onclick="showLineSpacingModal()" title="Line Spacing"><i class="fas fa-arrows-alt-v"></i></div>
                        
                        <div style="width:1px; height:16px; background:#ccc; margin:0 2px;"></div>
                        
                        <div class="mini-btn ctx-btn-strict" id="ctx-dir-auto-${target.suffix}" onclick="window.setTextDirection('auto')" title="Auto Text Direction (Detect from language)"><svg width="14" height="14" viewBox="0 0 16 16"><path d="M1 2.5h14v1.8H1zm2 3.4h10v1.8H3z"/><path d="M2.2 12.5h11.6m-9-2.2-2.4 2.2 2.4 2.2m6.6-4.4 2.4 2.2-2.4 2.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></div>
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

        let pubEl = e.target.closest('.pub-element') || e.target.closest('.page-header') || e.target.closest('.page-footer');
        if (pubEl && typeof state !== 'undefined' && state.selectedEl && state.selectedEl !== pubEl && state.selectedEl.classList.contains('pub-element')) {
            // Respect click-through redirection from hollow decorative border frames
            pubEl = state.selectedEl;
        }
        
        // --- PART A: SINGLE-CLICK TO EDIT WITH EXACT CARET PLACEMENT ---
        if (pubEl) {
            // Target the exact cell/element clicked (Ignores WordArt intentionally)
            let editable = (pubEl.contains(e.target)) ? e.target.closest('[contenteditable="true"]') : null;
            
            // Fallback for wrappers or click-through: find the contenteditable child under (clientX, clientY)
            if (!editable && pubEl.getAttribute('contenteditable') === 'true') {
                editable = pubEl;
            } else if (!editable) {
                const candidates = Array.from(pubEl.querySelectorAll('[contenteditable="true"]')).filter(n => n.tagName !== 'STYLE' && n.tagName !== 'SCRIPT');
                if (candidates.length === 1) {
                    editable = candidates[0];
                } else if (candidates.length > 1) {
                    editable = candidates.find(c => {
                        const r = c.getBoundingClientRect();
                        return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
                    });
                    if (!editable) {
                        // Pick closest vertically to click Y
                        let bestDist = Infinity;
                        candidates.forEach(c => {
                            const r = c.getBoundingClientRect();
                            const cy = (r.top + r.bottom) / 2;
                            const d = Math.abs(e.clientY - cy);
                            if (d < bestDist) { bestDist = d; editable = c; }
                        });
                    }
                }
            }

            // If user double-clicked a non-image decorative box that has no text yet, allow typing into it on demand
            if (!editable && e.detail >= 2 && pubEl.classList.contains('pub-element')) {
                const dtype = pubEl.getAttribute('data-type') || '';
                if (!['image', 'chart', 'progress-bar', 'smart-arrow', 'wordart', 'beta-wordart', 'emoji'].includes(dtype) && !pubEl.querySelector('img, svg, canvas, table')) {
                    const c = pubEl.querySelector('.element-content');
                    const targetDiv = c && (Array.from(c.children).find(ch => ch.tagName === 'DIV') || c);
                    if (targetDiv) {
                        targetDiv.setAttribute('contenteditable', 'true');
                        targetDiv.setAttribute('spellcheck', 'false');
                        targetDiv.style.outline = 'none';
                        editable = targetDiv;
                    }
                }
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

                // If we successfully found a text node inside editable, drop the cursor there!
                if (range && editable.contains(range.startContainer)) {
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
                                   e.target.closest('.ribbon-container') ||
                                   e.target.closest('#custom-color-picker') ||
                                   e.target.closest('.custom-dropdown') ||
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
            if (typeof serializeCurrentPage === 'function' && state.pages && state.pages[state.currentPageIndex]) {
                state.pages[state.currentPageIndex] = serializeCurrentPage();
            }
            if (typeof generateThumbnail === 'function') generateThumbnail(state.currentPageIndex);
        }, 200); 
    };

    console.log("✅ Anti-Lag successfully applied.");
})();


(function installDragAndDrop() {
    function isFileDrag(e) {
        if (!e.dataTransfer) return false;
        const types = e.dataTransfer.types;
        return (types && (types.includes('Files') || types.includes('application/x-moz-file'))) || 
               (e.dataTransfer.files && e.dataTransfer.files.length > 0);
    }

    ['dragenter', 'dragover', 'dragleave'].forEach(eventName => {
        document.body.addEventListener(eventName, function(e) {
            if (isFileDrag(e)) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, false);
    });

    document.body.addEventListener('drop', function(e) {
        if (isFileDrag(e)) {
            e.preventDefault();
            e.stopPropagation();
            handleDrop(e);
        }
    }, false);

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
                selectedTargets = state.multiSelected.filter(el => el.getAttribute('data-type') === 'image' || (window.getElementContentImage ? window.getElementContentImage(el) : Array.from(el.querySelectorAll('img')).find(img => !img.closest('.element-border-art, .border-art-wrapper, #native-border-art-border'))));
            } else if (state.selectedEl && (state.selectedEl.getAttribute('data-type') === 'image' || (window.getElementContentImage ? window.getElementContentImage(state.selectedEl) : Array.from(state.selectedEl.querySelectorAll('img')).find(img => !img.closest('.element-border-art, .border-art-wrapper, #native-border-art-border'))))) {
                selectedTargets = [state.selectedEl];
            }

            // If dropping exactly 1 image onto a single selected target/placeholder, do direct smart swap
            if (imageFiles.length === 1 && selectedTargets.length === 1) {
                const target = selectedTargets[0];
                const img = target.querySelector('.element-content img') || target.querySelector('img');
                if (img) {
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        img.src = evt.target.result;
                        img.removeAttribute('crossorigin');
                        img.style.objectFit = 'fill';
                        target.removeAttribute('data-is-placeholder');
                        if (typeof pushHistory === 'function') pushHistory();
                        if (typeof updateThumbnails === 'function') updateThumbnails();
                    };
                    reader.readAsDataURL(imageFiles[0]);
                    return;
                }
            }

            const paperEl = document.getElementById('paper');
            const rect = paperEl ? paperEl.getBoundingClientRect() : { left: 0, top: 0 };
            const scale = typeof getScale === 'function' ? getScale() : 1;
            let dropX = (e.clientX - rect.left) / scale;
            let dropY = (e.clientY - rect.top) / scale;

            // Route to unified batch image handler!
            if (typeof window.handleBatchImageFiles === 'function') {
                window.handleBatchImageFiles(imageFiles, { x: dropX, y: dropY });
            } else if (imageFiles.length === 1 && typeof window.insertSmartImage === 'function') {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    window.insertSmartImage(evt.target.result, null, { x: dropX, y: dropY });
                };
                reader.readAsDataURL(imageFiles[0]);
            }
        }

        if (otherFiles.length > 0 && typeof DashboardSystem !== 'undefined' && DashboardSystem && typeof DashboardSystem.close === 'function') {
            try { DashboardSystem.close(); } catch (err) {}
        }

        otherFiles.forEach(file => {
            const fileName = file.name.toLowerCase();
            
            // --- B. HANDLE PDF DOCUMENTS (.pdf) ---
            if (fileName.endsWith('.pdf')) {
                if (typeof openPdfDocument === 'function') openPdfDocument(file);
            }

            // --- C. HANDLE PUBLISHER FILES (.pub, .pubx) ---
            else if (fileName.endsWith('.pub') || fileName.endsWith('.pubx')) {
                if (typeof uploadAndConvertPub === 'function') uploadAndConvertPub(file);
            } 
            
            // --- D. HANDLE WORD DOCUMENTS (.doc, .docx) ---
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
                <div class="tool-btn" onclick="window.showKnowledgeBase()"><img src="ui/icons/kb.webp" style="width:22px; height:22px; object-fit:contain; pointer-events:none; margin-bottom: 0px; filter: hue-rotate(var(--ui-theme-hue-shift, 0deg)) grayscale(var(--ui-theme-grayscale, 0%));">Knowledge<br>Base</div>
                <div class="tool-btn" onclick="window.showAboutDialog()"><i class="fas fa-info-circle"></i>About</div>
                <div class="group-label">Help</div>
            `;
            fileRibbon.appendChild(aboutGroup);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectButton);
    } else {
        injectButton();
    }

    // 2. Render the Knowledge Base Dialog
    window.showKnowledgeBase = function() {
        const kbHtml = `<iframe src="https://kb.openpublisher.app/?in_app=true" style="width:100%; height:100%; min-height:500px; border:none; display:block;"></iframe>`;
        DialogSystem.show('Knowledge Base', kbHtml, null, true);
        
        const dialogBox = document.getElementById('custom-dialog-box');
        if(dialogBox) {
            // Decouple from flex centering so CSS resize works naturally from the top-left anchor
            const w = 1200;
            const h = window.innerHeight * 0.85;
            const left = Math.max(0, (window.innerWidth - w) / 2);
            const top = Math.max(0, (window.innerHeight - h) / 2);
            
            dialogBox.style.position = 'absolute';
            dialogBox.style.left = left + 'px';
            dialogBox.style.top = top + 'px';
            
            // Set dimensions and enable native resizing
            dialogBox.style.width = '1200px';
            dialogBox.style.height = '85vh';
            dialogBox.style.maxWidth = '95vw';
            dialogBox.style.maxHeight = '95vh';
            dialogBox.style.resize = 'both';
            dialogBox.style.overflow = 'hidden'; // Required for CSS resize property to work
            
            const body = dialogBox.querySelector('.custom-dialog-body');
            if (body) { 
                body.style.padding = '0'; 
                body.style.height = 'calc(100% - 40px)'; // Account for header
                body.style.overflow = 'hidden'; 
            }
            
            // Hide the OK/Cancel footer entirely
            const footer = dialogBox.querySelector('.custom-dialog-footer');
            if (footer) {
                footer.style.display = 'none';
            }
        }
    };

    // 3. Render the Custom About Dialog
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
                    transition: color 0.2s; white-space: nowrap;
                }
                .about-footer-link:hover { color: #0f172a; text-decoration: none; }
                .about-footer-link i { font-size: 16px; }

                /* Project Contributors Section (Compact) */
                .about-contributors-section { text-align: left; margin-top: 6px; margin-bottom: 2px; }
                .about-contrib-label {
                    font-size: 9px; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px; padding-left: 2px;
                    display: flex; align-items: center;
                }
                .about-contributors-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 3px;
                    box-sizing: border-box;
                    padding: 1px 2px;
                }
                .about-contributors-grid.scrollable {
                    max-height: 82px;
                    overflow-y: auto;
                }
                .about-contributors-grid::-webkit-scrollbar { width: 4px; }
                .about-contributors-grid::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .contributor-badge {
                    display: flex; align-items: center; gap: 5px; padding: 2px 7px; height: 22px; box-sizing: border-box;
                    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;
                    text-decoration: none; color: inherit; transition: all 0.15s ease; min-width: 0;
                    position: relative;
                }
                .contributor-badge:hover {
                    background: #f1f5f9; border-color: #94a3b8; text-decoration: none;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.06); z-index: 2;
                }
                .contributor-badge.core {
                    background: color-mix(in srgb, var(--ui-theme-color) 7%, #ffffff);
                    border-color: color-mix(in srgb, var(--ui-theme-color) 35%, #cbd5e1);
                }
                .contributor-badge.core:hover {
                    background: color-mix(in srgb, var(--ui-theme-color) 14%, #ffffff);
                    border-color: var(--ui-theme-color);
                }
                .contributor-badge.core .contributor-name {
                    color: var(--ui-theme-color);
                }
                .contributor-badge.core .contributor-avatar {
                    color: var(--ui-theme-color);
                }
                .contributor-avatar { width: 12px; height: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; color: #475569; }
                .contributor-meta { display: flex; align-items: baseline; gap: 4px; min-width: 0; overflow: hidden; white-space: nowrap; }
                .contributor-name { font-size: 10.5px; font-weight: 600; color: #0f172a; flex-shrink: 0; }
                .contributor-sep { font-size: 7px; color: #94a3b8; flex-shrink: 0; }
                .contributor-role { font-size: 9px; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

                body.dark-mode .contributor-badge { background: var(--ui-bg, #1e293b) !important; border-color: var(--ui-border, #334155) !important; }
                body.dark-mode .contributor-badge:hover { background: color-mix(in srgb, var(--ui-bg, #1e293b) 80%, white) !important; border-color: color-mix(in srgb, var(--ui-border, #334155) 70%, white) !important; }
                body.dark-mode .contributor-badge.core {
                    background: color-mix(in srgb, var(--ui-theme-color) 15%, var(--ui-bg, #1e293b)) !important;
                    border-color: color-mix(in srgb, var(--ui-theme-color) 50%, var(--ui-border, #334155)) !important;
                }
                body.dark-mode .contributor-badge.core:hover {
                    background: color-mix(in srgb, var(--ui-theme-color) 25%, var(--ui-bg, #1e293b)) !important;
                    border-color: var(--ui-theme-color) !important;
                }
                body.dark-mode .contributor-badge.core .contributor-name { color: color-mix(in srgb, var(--ui-theme-color) 80%, white) !important; }
                body.dark-mode .contributor-badge.core .contributor-avatar { color: color-mix(in srgb, var(--ui-theme-color) 80%, white) !important; }
                body.dark-mode .contributor-name { color: var(--ui-text, #f1f5f9) !important; }
                body.dark-mode .contributor-role { color: color-mix(in srgb, var(--ui-text, #f1f5f9) 70%, transparent) !important; }
                body.dark-mode .contributor-avatar { color: color-mix(in srgb, var(--ui-text, #f1f5f9) 80%, transparent) !important; }
                body.dark-mode .contributor-sep { color: color-mix(in srgb, var(--ui-text, #f1f5f9) 40%, transparent) !important; }
                body.dark-mode .about-contrib-label { color: color-mix(in srgb, var(--ui-text, #f1f5f9) 70%, transparent) !important; }
            </style>

            <div class="about-container">
                <div class="about-header">
                    <div class="about-title"><i class="v5-logo-icon"></i> Open Publisher</div>
                    <div class="about-subtitle">Free Online Desktop Publishing Tool • v5.14.1</div>
                </div>
                
                <div class="about-desc">
                    An open-source, no-signup alternative to traditional desktop publishing software. 
                    It is <strong>100% ad-free</strong> and completely free to use. Design flyers and documents locally in your browser, with support for 
                    <strong>.pub</strong>, <strong>.doc</strong>, and <strong>.docx</strong> files via cloud conversion.
                    <br><br>
                    <a href="#" onclick="window.showKnowledgeBase(); return false;" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--ui-theme-color); color: #fff; border-radius: 20px; text-decoration: none; font-weight: 600; font-size: 13px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                        <img src="ui/icons/kb.webp" style="width:16px; height:16px; object-fit:contain; filter: brightness(0) invert(1);"> Open Knowledge Base
                    </a>
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

                <div class="about-contributors-section">
                    <div class="about-contrib-label"><i class="fas fa-users" style="font-size: 8px; margin-right: 3px;"></i> Contributors</div>
                    <div class="about-contributors-grid scrollable">
                        <a href="https://github.com/rmellis" target="_blank" rel="noopener noreferrer" class="contributor-badge core" title="@rmellis - Main Developer">
                            <div class="contributor-avatar"><i class="fab fa-github"></i></div>
                            <div class="contributor-meta">
                                <span class="contributor-name">@rmellis</span>
                                <span class="contributor-sep">•</span>
                                <span class="contributor-role">Main Developer</span>
                            </div>
                        </a>
                        <a href="https://github.com/Tallulah95" target="_blank" rel="noopener noreferrer" class="contributor-badge core" title="@tallulah95 - Main Designer & Tester">
                            <div class="contributor-avatar"><i class="fab fa-github"></i></div>
                            <div class="contributor-meta">
                                <span class="contributor-name">@tallulah95</span>
                                <span class="contributor-sep">•</span>
                                <span class="contributor-role">Main Designer &amp; Tester</span>
                            </div>
                        </a>
                        <a href="https://github.com/anupamme" target="_blank" rel="noopener noreferrer" class="contributor-badge" title="@anupamme - Security Fix">
                            <div class="contributor-avatar"><i class="fab fa-github"></i></div>
                            <div class="contributor-meta">
                                <span class="contributor-name">@anupamme</span>
                                <span class="contributor-sep">•</span>
                                <span class="contributor-role">Security Fix</span>
                            </div>
                        </a>
                        <a href="https://github.com/lucastucious" target="_blank" rel="noopener noreferrer" class="contributor-badge" title="@lucastucious - DPI Feature Suggestion">
                            <div class="contributor-avatar"><i class="fab fa-github"></i></div>
                            <div class="contributor-meta">
                                <span class="contributor-name">@lucastucious</span>
                                <span class="contributor-sep">•</span>
                                <span class="contributor-role">DPI Feature Suggestion</span>
                            </div>
                        </a>
                        <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" class="contributor-badge" title="Gemini - Complex Problem Solver">
                            <div class="contributor-avatar">
                                <svg viewBox="0 0 24 24" width="11" height="11" fill="url(#gemini-sparkle-grad)" style="flex-shrink:0;">
                                    <defs>
                                        <linearGradient id="gemini-sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stop-color="#4285F4"/>
                                            <stop offset="50%" stop-color="#9B72CB"/>
                                            <stop offset="100%" stop-color="#D96570"/>
                                        </linearGradient>
                                    </defs>
                                    <path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z"/>
                                </svg>
                            </div>
                            <div class="contributor-meta">
                                <span class="contributor-name">Gemini</span>
                                <span class="contributor-sep">•</span>
                                <span class="contributor-role">Complex Problem Solver</span>
                            </div>
                        </a>
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
                dialogBox.style.setProperty('width', '540px', 'important');
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
        const grids = ['template-cats', 'template-grid', 'clipart-grid', 'ad-grid', 'dialog-wordart-grid', 'beta-wa-grid', 'itp-cards-grid', 'itp-category-bar'];
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




    // 4. TEMPLATES MODAL OVERRIDE (v5.14.1: Added Multi-Page Insert Template Banner)
    window.showTemplateModal = function() {
        if(typeof rescueGrids === 'function') rescueGrids();
        const cats = document.getElementById('template-cats');
        const grid = document.getElementById('template-grid');
        if (!cats || !grid) return; 

        const bannerHtml = `
            <div class="template-multipage-banner" style="display:flex; align-items:center; justify-content:space-between; background:linear-gradient(135deg, color-mix(in srgb, var(--ui-theme-color, #0d9e8f) 12%, #ffffff) 0%, color-mix(in srgb, var(--ui-theme-color, #0d9e8f) 4%, #ffffff) 100%); border:1px solid color-mix(in srgb, var(--ui-theme-color, #0d9e8f) 30%, transparent); border-radius:8px; padding:10px 16px; margin-bottom:5px; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:34px; height:34px; border-radius:6px; background:var(--ui-theme-color, #0d9e8f); color:#ffffff; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; box-shadow:0 2px 5px rgba(0,0,0,0.15);">
                        <i class="fas fa-layer-group"></i>
                    </div>
                    <div>
                        <div style="font-weight:600; font-size:13px; color:#1e293b;">Insert Templates into Multi-Page Publications</div>
                        <div style="font-size:11px; color:#64748b;">Add templates directly to specific pages or mix multiple template styles across your document.</div>
                    </div>
                </div>
                <button id="btn-open-insert-template-modal" onclick="if(window.showInsertTemplateModal) window.showInsertTemplateModal();" style="display:inline-flex; align-items:center; gap:8px; background:var(--ui-theme-color, #0d9e8f); color:#ffffff; border:none; padding:8px 16px; border-radius:6px; font-weight:600; font-size:12px; cursor:pointer; box-shadow:0 2px 8px color-mix(in srgb, var(--ui-theme-color, #0d9e8f) 35%, transparent); transition:all 0.2s ease; white-space:nowrap;">
                    <i class="fas fa-file-medical"></i> Insert Template to Page...
                </button>
            </div>
        `;

        const html = `<div id="dialog-template-container" style="display:flex; flex-direction:column; gap:12px;">${bannerHtml}</div>`;
        DialogSystem.show('Publication Templates', html, null, true);
        
        const dialogBox = document.getElementById('custom-dialog-box');
        if(dialogBox) {
            dialogBox.style.width = '1050px';
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

    // 5. CLIPART MODAL OVERRIDE (v5.11.6: Beta WordArt Style Emoji Dialog)
    window.showClipartModal = function() {
        rescueGrids();
        const grid = document.getElementById('clipart-grid');
        if (!grid) return;

        const uiHTML = `
            <style>
                /* Overwrite default dialog styles to achieve the edge-to-edge banner */
                #custom-dialog-header { display: none !important; }
                .custom-dialog-footer { display: none !important; }
                .custom-dialog-body { padding: 0 !important; background: #f3f4f6 !important; border-radius: 8px; overflow: hidden; }
                
                /* The Green Header Banner */
                .emoji-modal-header {
                    background: var(--ui-theme-dark);
                    padding: 15px 25px;
                    text-align: center;
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                    cursor: grab;
                    position: relative;
                }
                .emoji-modal-header:active {
                    cursor: grabbing;
                }
                .emoji-modal-title {
                    color: white;
                    font-family: 'Segoe UI', sans-serif;
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    pointer-events: none;
                }
                
                /* The Giant White Input Box */
                .emoji-modal-input-wrapper {
                    position: relative;
                    width: 100%;
                    box-sizing: border-box;
                }
                .emoji-modal-input {
                    width: 100%;
                    padding: 12px 42px 12px 15px;
                    font-size: 20px;
                    font-family: 'Segoe UI', Arial, sans-serif;
                    font-weight: 600;
                    text-align: center;
                    color: #111;
                    border: none;
                    border-radius: 4px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    outline: none;
                    box-sizing: border-box;
                    transition: box-shadow 0.2s;
                }
                .emoji-modal-input:focus {
                    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.4);
                }
                .emoji-modal-input::placeholder {
                    color: #94a3b8;
                    font-weight: 600;
                    font-size: 18px;
                }
                #emoji-search-clear {
                    display: none;
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    cursor: pointer;
                    color: #888;
                    font-size: 18px;
                    transition: color 0.15s;
                }
                #emoji-search-clear:hover {
                    color: #333;
                }

                /* Grid Area */
                .emoji-modal-grid-container {
                    padding: 15px 20px;
                    background: #f1f5f9;
                    max-height: 55vh;
                    overflow-y: auto;
                }
                #clipart-grid {
                    display: grid !important;
                    grid-template-columns: repeat(5, 1fr) !important;
                    gap: 10px !important;
                }
                @media (min-width: 650px) {
                    #clipart-grid {
                        grid-template-columns: repeat(6, 1fr) !important;
                    }
                }
                @media (min-width: 800px) {
                    #clipart-grid {
                        grid-template-columns: repeat(7, 1fr) !important;
                    }
                }
                
                /* The Selectable Cards (Exact Beta WordArt style) */
                #clipart-grid .gallery-item.emoji-item {
                    background: white;
                    border: 3px solid transparent;
                    border-radius: 12px;
                    height: 65px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
                    transition: all 0.15s ease-in-out;
                    box-sizing: border-box;
                }
                #clipart-grid .gallery-item.emoji-item:hover {
                    box-shadow: 0 6px 12px rgba(0,0,0,0.08);
                    transform: translateY(-2px);
                }
                #clipart-grid .gallery-item.emoji-item.selected {
                    border-color: var(--ui-theme-color);
                    background: #f0fdf4; 
                    box-shadow: 0 4px 8px rgba(0, 118, 112, 0.15);
                }
                #clipart-grid .gallery-item.emoji-item img {
                    max-width: 44px;
                    max-height: 44px;
                    width: 44px;
                    height: 44px;
                    object-fit: contain;
                    pointer-events: none;
                    user-select: none;
                }
                #clipart-grid .gallery-item.emoji-item .emoji-fallback-char {
                    font-size: 34px;
                    line-height: 1;
                    user-select: none;
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;
                }

                /* Category Header inside grid */
                #clipart-grid .emoji-category-header {
                    grid-column: 1 / -1;
                    font-family: 'Segoe UI', sans-serif;
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #64748b;
                    padding: 12px 6px 4px 6px;
                    border-bottom: 1px solid #e2e8f0;
                    margin-top: 8px;
                    background: transparent;
                }

                /* Custom Footer */
                .emoji-modal-footer {
                    padding: 10px 20px;
                    background: #f1f5f9;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    border-bottom-left-radius: 8px;
                    border-bottom-right-radius: 8px;
                    border-top: 1px solid #e2e8f0;
                }
                .emoji-btn {
                    padding: 8px 24px;
                    font-size: 14px;
                    font-weight: 700;
                    border-radius: 20px;
                    cursor: pointer;
                    font-family: 'Segoe UI', sans-serif;
                    border: none;
                    transition: all 0.2s;
                }
                .emoji-btn-ok {
                    background: var(--ui-theme-dark);
                    color: white;
                }
                .emoji-btn-ok:hover {
                    background: var(--ui-theme-color);
                }
                .emoji-btn-cancel {
                    background: white;
                    color: var(--ui-theme-dark);
                    border: 2px solid #cbd5e1;
                }
                .emoji-btn-cancel:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                }
                
                /* Custom Scrollbar */
                .emoji-modal-grid-container::-webkit-scrollbar { width: 8px; }
                .emoji-modal-grid-container::-webkit-scrollbar-track { background: transparent; }
                .emoji-modal-grid-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .emoji-modal-grid-container::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                /* Dark Mode Overrides */
                body.dark-mode .custom-dialog-body { background: #1e293b !important; }
                body.dark-mode .emoji-modal-grid-container { background: #0f172a !important; }
                body.dark-mode .emoji-modal-footer { background: #0f172a !important; border-top-color: #334155 !important; }
                body.dark-mode #clipart-grid .gallery-item.emoji-item { background: #1e293b !important; box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important; }
                body.dark-mode #clipart-grid .gallery-item.emoji-item.selected { border-color: var(--ui-theme-color) !important; background: #064e3b !important; }
                body.dark-mode #clipart-grid .emoji-category-header { color: #94a3b8 !important; border-bottom-color: #334155 !important; }
                body.dark-mode .emoji-btn-cancel { background: #1e293b !important; color: #e2e8f0 !important; border-color: #475569 !important; }
                body.dark-mode .emoji-btn-cancel:hover { background: #334155 !important; }
                body.dark-mode .emoji-modal-input { background: #1e293b !important; color: #f8fafc !important; }
            </style>
            
            <div class="emoji-modal-header" id="emoji-modal-header">
                <div class="custom-dialog-close" id="emoji-close-x" title="Close" style="position: absolute; top: 8px; right: 8px; z-index: 10;"><i class="fas fa-times"></i></div>
                <div class="emoji-modal-title">Emojis</div>
                <div class="emoji-modal-input-wrapper">
                    <input type="text" id="emoji-search-input" class="emoji-modal-input" placeholder="Search Emojis (e.g. smile, hand, heart, food)..." autocomplete="off">
                    <span id="emoji-search-clear" title="Clear search"><i class="fas fa-times-circle"></i></span>
                </div>
            </div>
            
            <div class="emoji-modal-grid-container" id="dialog-clipart-container"></div>
            
            <div class="emoji-modal-footer">
                <button class="emoji-btn emoji-btn-ok" id="emoji-btn-ok">OK</button>
                <button class="emoji-btn emoji-btn-cancel" id="emoji-btn-cancel">Cancel</button>
            </div>
        `;

        DialogSystem.show('', uiHTML, null, true);
        
        setTimeout(() => {
            const dialogBox = document.getElementById('custom-dialog-box');
            if (dialogBox) { 
                dialogBox.style.width = '850px'; 
                dialogBox.style.maxWidth = '95vw'; 
                dialogBox.style.padding = '0';
                dialogBox.style.backgroundColor = 'transparent';
                dialogBox.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';

                const header = document.getElementById('emoji-modal-header');
                if (header) {
                    let isDragging = false;
                    header.addEventListener('mousedown', function(e) {
                        if (e.target.tagName.toLowerCase() === 'input' || e.target.id === 'emoji-close-x' || e.target.closest('#emoji-close-x') || e.target.id === 'emoji-search-clear' || e.target.closest('#emoji-search-clear')) return;
                        isDragging = true;
                        const rect = dialogBox.getBoundingClientRect();
                        const offsetX = e.clientX - rect.left;
                        const offsetY = e.clientY - rect.top;

                        dialogBox.style.position = 'fixed';
                        dialogBox.style.transform = 'none';
                        dialogBox.style.margin = '0';
                        dialogBox.style.bottom = 'auto';
                        dialogBox.style.right = 'auto';
                        dialogBox.style.left = (e.clientX - offsetX) + 'px';
                        dialogBox.style.top = (e.clientY - offsetY) + 'px';

                        const onMouseMove = (me) => {
                            if (!isDragging) return;
                            dialogBox.style.left = (me.clientX - offsetX) + 'px';
                            dialogBox.style.top = (me.clientY - offsetY) + 'px';
                        };

                        const onMouseUp = () => {
                            isDragging = false;
                            document.removeEventListener('mousemove', onMouseMove);
                            document.removeEventListener('mouseup', onMouseUp);
                        };

                        document.addEventListener('mousemove', onMouseMove);
                        document.addEventListener('mouseup', onMouseUp);
                    });
                }
            }
        }, 10);
        
        const container = document.getElementById('dialog-clipart-container');
        if (container) {
            container.appendChild(grid);
            grid.style.display = 'grid';
        }

        const closeX = document.getElementById('emoji-close-x');
        if (closeX) closeX.onclick = () => DialogSystem.close();

        const cancelBtn = document.getElementById('emoji-btn-cancel');
        if (cancelBtn) cancelBtn.onclick = () => DialogSystem.close();

        const selectEmoji = (item) => {
            if (!item) return;
            grid.querySelectorAll('.gallery-item.emoji-item.selected').forEach(c => c.classList.remove('selected'));
            item.classList.add('selected');
            const img = item.querySelector('img');
            grid.dataset.selectedUrl = (img && img.src) || '';
            grid.dataset.selectedChar = item.getAttribute('data-char') || (img && img.alt) || '';
        };

        const executeInsertion = () => {
            let selected = grid.querySelector('.gallery-item.emoji-item.selected');
            if (!selected || selected.style.display === 'none') {
                selected = grid.querySelector('.gallery-item.emoji-item:not([style*="display: none"])');
            }
            if (selected) {
                const img = selected.querySelector('img');
                const url = (img && img.src) || grid.dataset.selectedUrl;
                const char = selected.getAttribute('data-char') || grid.dataset.selectedChar || (img && img.alt) || '';
                DialogSystem.close();
                if (url && typeof insertEmojiFromUrl === 'function') {
                    insertEmojiFromUrl(url, char);
                }
            } else {
                DialogSystem.close();
            }
        };

        const okBtn = document.getElementById('emoji-btn-ok');
        if (okBtn) {
            okBtn.onclick = executeInsertion;
        }

        // Pre-select first emoji card if none selected
        const firstVisibleCard = grid.querySelector('.gallery-item.emoji-item:not([style*="display: none"])');
        if (firstVisibleCard && !grid.querySelector('.gallery-item.emoji-item.selected')) {
            selectEmoji(firstVisibleCard);
        }

        Array.from(grid.children).forEach(item => {
            if (item.classList.contains('gallery-item')) {
                item.onclick = (e) => {
                    e.stopPropagation();
                    selectEmoji(item);
                };
                item.ondblclick = (e) => {
                    e.stopPropagation();
                    selectEmoji(item);
                    executeInsertion();
                };
            }
        });

        const searchInput = document.getElementById('emoji-search-input');
        const searchClear = document.getElementById('emoji-search-clear');
        if (searchInput) {
            searchInput.value = '';
            if (typeof window.filterEmojis === 'function') {
                window.filterEmojis('');
            }
            const firstCard = grid.querySelector('.gallery-item.emoji-item:not([style*="display: none"])');
            if (firstCard) selectEmoji(firstCard);

            searchInput.addEventListener('input', (e) => {
                if (typeof window.filterEmojis === 'function') {
                    window.filterEmojis(e.target.value);
                }
                const selected = grid.querySelector('.gallery-item.emoji-item.selected');
                if (!selected || selected.style.display === 'none') {
                    const firstMatch = grid.querySelector('.gallery-item.emoji-item:not([style*="display: none"])');
                    if (firstMatch) selectEmoji(firstMatch);
                }
            });
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (searchInput.value) {
                        searchInput.value = '';
                        if (typeof window.filterEmojis === 'function') {
                            window.filterEmojis('');
                        }
                        const firstCard = grid.querySelector('.gallery-item.emoji-item:not([style*="display: none"])');
                        if (firstCard) selectEmoji(firstCard);
                    } else if (typeof DialogSystem !== 'undefined') {
                        DialogSystem.close();
                    }
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    executeInsertion();
                }
            });
            setTimeout(() => searchInput.focus(), 80);
        }

        if (searchClear) {
            searchClear.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    if (typeof window.filterEmojis === 'function') {
                        window.filterEmojis('');
                    }
                    const firstCard = grid.querySelector('.gallery-item.emoji-item:not([style*="display: none"])');
                    if (firstCard) selectEmoji(firstCard);
                    searchInput.focus();
                }
            });
        }
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
        DialogSystem.show = function(title, content, onConfirm, isAlert, confirmText, onApply) {
            const safeConfirm = onConfirm ? function() {
                try { onConfirm(); } catch(e) { console.error("Dialog Blocked:", e); }
            } : null;
            originalShow.call(DialogSystem, title, content, safeConfirm, isAlert, confirmText, onApply);
        };
        DialogSystem._isSafelyPatched = true;
    }

    // 2. DEEP TEMPLATE EDITABILITY ENGINE
    window.ensureTemplateElementsEditable = function(rootEl) {
        const paperEl = rootEl || document.getElementById('paper');
        if (!paperEl) return;
        const isSpell = typeof state !== 'undefined' ? (state.spellCheck !== false) : true;
        const langCode = navigator.language || 'en';
        const pw = parseFloat(paperEl.style.width) || 794;
        const ph = parseFloat(paperEl.style.height) || 1123;

        const pubElements = paperEl.querySelectorAll('.pub-element');
        pubElements.forEach(el => {
            if (el.classList.contains('master-page-element') || el.getAttribute('data-is-border') === 'true') return;
            if (window.isChartElement && window.isChartElement(el)) {
                if (el.getAttribute('data-type') !== 'chart') el.setAttribute('data-type', 'chart');
                el.querySelectorAll('[contenteditable]').forEach(ce => ce.removeAttribute('contenteditable'));
                return;
            }
            const dtype = el.getAttribute('data-type') || '';
            if (['image', 'chart', 'progress-bar', 'smart-arrow', 'wordart', 'beta-wordart', 'emoji'].includes(dtype)) return;
            if (el.querySelector('.progress-bar-widget, .wa-wrapper, .wa-text, svg.smart-arrow-svg, .chart-pie-group, .chart-column-group, .chart-bar-group, .chart-line-group, .chart-area-group, .chart-half-donut-group, .chart-stacked-group, .chart-radar-group, .chart-slice')) return;

            const contentContainer = el.querySelector('.element-content');
            if (!contentContainer) return;

            // Never leave contenteditable on <style>, <script>, <img>, <svg>, <canvas>
            contentContainer.querySelectorAll('style, script, img, svg, canvas').forEach(badNode => {
                if (badNode.hasAttribute('contenteditable')) badNode.removeAttribute('contenteditable');
            });

            // Determine visible text (ignoring <style> and <script> content)
            const visibleText = Array.from(contentContainer.childNodes)
                .filter(n => n.nodeName !== 'STYLE' && n.nodeName !== 'SCRIPT')
                .map(n => n.textContent || '')
                .join('')
                .trim();

            const nonStyleChildren = Array.from(contentContainer.children).filter(
                c => c.tagName !== 'STYLE' && c.tagName !== 'SCRIPT'
            );
            if (nonStyleChildren.length === 0) return;

            // Normalize single-child elements:
            // 1. Promote centered inner rotate(...) to the outer .pub-element transform so selection bounding box & print match
            // 2. Ensure bordered <img>/<div > uses box-sizing: border-box
            // 3. Ensure empty background/frame <div> fills 100% width and height
            if (nonStyleChildren.length === 1) {
                const onlyChild = nonStyleChildren[0];
                if (onlyChild && onlyChild.style) {
                    const childTf = onlyChild.style.transform || '';
                    const childOrigin = (onlyChild.style.transformOrigin || '').toLowerCase();
                    const hasCornerOrigin = childOrigin.includes('left') || childOrigin.includes('top') || childOrigin.includes('right') || childOrigin.includes('bottom');
                    if (childTf && /rotate\([^)]+\)/i.test(childTf) && !hasCornerOrigin && (!el.style.transform || el.style.transform === 'none')) {
                        const rotMatch = childTf.match(/rotate\([^)]+\)/i);
                        if (rotMatch) {
                            el.style.transform = rotMatch[0];
                            onlyChild.style.transform = childTf.replace(/rotate\([^)]+\)/i, '').trim();
                        }
                    }
                    if ((onlyChild.style.border || onlyChild.style.padding) && !onlyChild.style.boxSizing) {
                        onlyChild.style.boxSizing = 'border-box';
                    }
                    if (onlyChild.tagName === 'DIV' && onlyChild.children.length === 0 && !visibleText) {
                        if (!onlyChild.style.width) onlyChild.style.width = '100%';
                        if (!onlyChild.style.height) onlyChild.style.height = '100%';
                        if (!onlyChild.style.boxSizing) onlyChild.style.boxSizing = 'border-box';
                    }
                }
            }

            // Check if this is a pure image/SVG element with no text
            if (nonStyleChildren.length === 1 && ['IMG', 'SVG', 'CANVAS'].includes(nonStyleChildren[0].tagName)) {
                return;
            }

            // If element has a table, make table cells editable
            const tables = contentContainer.querySelectorAll('table');
            if (tables.length > 0) {
                contentContainer.querySelectorAll('td, th').forEach(cell => {
                    cell.setAttribute('contenteditable', 'true');
                    cell.setAttribute('spellcheck', 'false');
                    if (isSpell) cell.setAttribute('lang', langCode);
                    cell.style.outline = 'none';
                });
                contentContainer.style.pointerEvents = 'auto';
                return;
            }

            // If element has NO visible text, check if it is a decorative background, divider line, or hollow frame
            if (!visibleText) {
                const ew = parseFloat(el.style.width) || el.offsetWidth || 0;
                const eh = parseFloat(el.style.height) || el.offsetHeight || 0;
                const firstNode = nonStyleChildren[0];
                const isThinLine = (ew <= 14 || eh <= 14);
                const isFullPageBg = (ew >= pw * 0.9 && eh >= ph * 0.9);
                const hasImgOrSvg = !!contentContainer.querySelector('img, svg, canvas');
                const hasClipPath = !!(firstNode && firstNode.style && firstNode.style.clipPath);
                const bgStr = (firstNode && firstNode.style && (firstNode.style.background || firstNode.style.backgroundColor || firstNode.style.backgroundImage)) || '';
                const borderStr = (firstNode && firstNode.style && (firstNode.style.border || firstNode.style.borderTop || firstNode.style.borderLeft || firstNode.style.borderBottom || firstNode.style.borderRight || firstNode.style.outline)) || '';
                const isHollowBorder = !bgStr || bgStr === 'transparent' || bgStr === 'none' ? !!borderStr : false;

                if (isThinLine || isFullPageBg || hasImgOrSvg || hasClipPath || isHollowBorder || dtype === 'shape') {
                    // Remove accidental contenteditable from pure decorative shapes/lines/frames
                    contentContainer.querySelectorAll('[contenteditable="true"]').forEach(ce => ce.removeAttribute('contenteditable'));
                    return;
                }
            }

            // Element has text (or is a blank user text box)
            const hasEmbeddedMedia = !!contentContainer.querySelector('img, svg, canvas');
            const applyEditableAttrs = (node) => {
                if (!node || node.nodeType !== 1) return;
                if (['STYLE', 'SCRIPT', 'IMG', 'SVG', 'CANVAS'].includes(node.tagName)) return;
                node.setAttribute('contenteditable', 'true');
                node.setAttribute('spellcheck', 'false');
                if (isSpell) node.setAttribute('lang', langCode);
                if (!node.style.outline) node.style.outline = 'none';
                node.style.pointerEvents = 'auto';
            };

            if (!hasEmbeddedMedia) {
                // Make every direct non-style child editable (supports single wrapper div OR multiple sibling h1/p/div tags)
                nonStyleChildren.forEach(child => {
                    if (!child.style.clipPath || (child.textContent && child.textContent.trim().length > 0)) {
                        applyEditableAttrs(child);
                    }
                });
            } else {
                // Composite element containing both <img>/<svg> and text:
                // Apply contenteditable to the deepest text-bearing containers that do NOT wrap <img>/<svg>
                let markedAny = false;
                const walkForTextContainers = (node) => {
                    if (!node || node.nodeType !== 1) return;
                    if (['STYLE', 'SCRIPT', 'IMG', 'SVG', 'CANVAS'].includes(node.tagName)) return;
                    const containsMedia = !!node.querySelector('img, svg, canvas');
                    const hasText = (node.textContent || '').trim().length > 0;
                    if (!hasText) return;
                    if (!containsMedia) {
                        applyEditableAttrs(node);
                        markedAny = true;
                        return;
                    }
                    // Has both media and text: check if it has direct text nodes alongside media
                    const hasDirectText = Array.from(node.childNodes).some(
                        cn => cn.nodeType === 3 && (cn.textContent || '').trim().length > 0
                    );
                    if (hasDirectText) {
                        applyEditableAttrs(node);
                        markedAny = true;
                    } else {
                        Array.from(node.children).forEach(walkForTextContainers);
                    }
                };
                nonStyleChildren.forEach(walkForTextContainers);
                if (!markedAny && visibleText) {
                    nonStyleChildren.forEach(applyEditableAttrs);
                }
            }
            contentContainer.style.pointerEvents = 'auto';
        });
    };

    if (typeof window.originalRenderPage_BeforeEditSweep === 'undefined') {
        window.originalRenderPage_BeforeEditSweep = window.renderPage;
        window.renderPage = function(page) {
            const ret = window.originalRenderPage_BeforeEditSweep(page);
            window.ensureTemplateElementsEditable(document.getElementById('paper'));
            setTimeout(() => {
                window.ensureTemplateElementsEditable(document.getElementById('paper'));
            }, 40);
            return ret;
        };
    }

    // 3. UNIVERSAL CSS COLOR, MULTI-STOP GRADIENT, BORDER & THEME STUDIO
    window.TemplateCSSColorEngine = {
        designerPalettes: [
            { id: 'royal-gold', name: 'Royal Navy & Gold', colors: ['#0a1628', '#1e293b', '#d4af37', '#f8fafc', '#94a3b8'] },
            { id: 'emerald-cream', name: 'Emerald & Cream', colors: ['#064e3b', '#047857', '#d97706', '#fdfbf7', '#6ee7b7'] },
            { id: 'midnight-neon', name: 'Midnight Neon', colors: ['#0f0728', '#1e1b4b', '#a855f7', '#00f5d4', '#f8fafc'] },
            { id: 'crimson-slate', name: 'Crimson & Slate', colors: ['#111827', '#1f2937', '#e11d48', '#ffffff', '#fda4af'] },
            { id: 'teal-executive', name: 'Teal Executive', colors: ['#0f172a', '#007670', '#14b8a6', '#f8fafc', '#cbd5e1'] },
            { id: 'terracotta-warm', name: 'Warm Terracotta', colors: ['#291d18', '#b05c34', '#e07a5f', '#faf6f0', '#f2cc8f'] },
            { id: 'rose-blush', name: 'Rose Gold & Blush', colors: ['#2d1b22', '#b76e79', '#e8a598', '#fdf8f6', '#f4d5cd'] },
            { id: 'cyber-electric', name: 'Electric Blue & Dark', colors: ['#090d16', '#1e3a8a', '#3b82f6', '#60a5fa', '#f8fafc'] },
            { id: 'forest-sage', name: 'Forest & Sage', colors: ['#1b4332', '#2d6a4f', '#52b788', '#f4f9f5', '#b7e4c7'] },
            { id: 'sunset-festival', name: 'Sunset Festival', colors: ['#3b0764', '#be185d', '#ea580c', '#fef3c7', '#fde047'] },
            { id: 'champagne-noir', name: 'Champagne Noir', colors: ['#0d0d0d', '#1c1c1c', '#c9a84c', '#f5f0e6', '#a39e93'] },
            { id: 'monochrome-pro', name: 'Monochrome Studio', colors: ['#09090b', '#27272a', '#71717a', '#fafafa', '#e4e4e7'] }
        ],

        // Normalize any CSS color (#rgb, #rrggbb, rgb(), rgba(), var(--...), named) to 6-digit #hex
        toHex: function(colorStr) {
            if (!colorStr) return null;
            let s = colorStr.toString().trim();
            if (s.toLowerCase().startsWith('var(')) {
                const m = s.match(/var\(\s*(--[^,\s)]+)/i);
                if (m && typeof getComputedStyle === 'function') {
                    const resolved = getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim();
                    if (resolved) s = resolved;
                    else return '#007670';
                } else {
                    return '#007670';
                }
            }
            s = s.toLowerCase();
            if (!s || s === 'transparent' || s === 'none' || s === 'inherit' || s === 'initial' || s === 'currentcolor') return null;
            if (s === 'rgba(0, 0, 0, 0)' || s === 'rgba(0,0,0,0)') return null;
            if (/^#[0-9a-f]{6}$/i.test(s)) return s.toLowerCase();
            if (/^#[0-9a-f]{3}$/i.test(s)) {
                return '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
            }
            if (/^#[0-9a-f]{8}$/i.test(s)) return s.substring(0, 7).toLowerCase();
            const rgbMatch = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
            if (rgbMatch) {
                if (rgbMatch[4] !== undefined && parseFloat(rgbMatch[4]) === 0) return null;
                const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1]))).toString(16).padStart(2, '0');
                const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2]))).toString(16).padStart(2, '0');
                const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3]))).toString(16).padStart(2, '0');
                return `#${r}${g}${b}`;
            }
            const namedMap = {
                white: '#ffffff', black: '#000000', gold: '#ffd700', silver: '#c0c0c0',
                red: '#ff0000', blue: '#0000ff', green: '#008000', yellow: '#ffff00',
                orange: '#ffa500', purple: '#800080', pink: '#ffc0cb', teal: '#008080',
                navy: '#000080', gray: '#808080', grey: '#808080', cyan: '#00ffff',
                magenta: '#ff00ff', maroon: '#800000', olive: '#808000', coral: '#ff7f50',
                crimson: '#dc143c', indigo: '#4b0082', violet: '#ee82ee', khaki: '#f0e68c',
                ivory: '#fffff0', beige: '#f5f5dc', wheat: '#f5deb3', tan: '#d2b48c'
            };
            return namedMap[s] || null;
        },

        // Replace the Nth color token inside a CSS gradient string
        replaceGradientStopColor: function(gradStr, stopIndex, newColor) {
            if (!gradStr) return gradStr;
            const colorRegex = /(#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\))/g;
            let idx = 0;
            return gradStr.replace(colorRegex, (match) => {
                if (idx++ === stopIndex) {
                    // If original stop was rgba with alpha < 1 and newColor is #hex, preserve alpha if user wants, or use newColor
                    const alphaMatch = match.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/i);
                    if (alphaMatch && parseFloat(alphaMatch[1]) > 0 && parseFloat(alphaMatch[1]) < 1 && /^#[0-9a-f]{6}$/i.test(newColor)) {
                        const a = parseFloat(alphaMatch[1]);
                        const r = parseInt(newColor.slice(1, 3), 16);
                        const g = parseInt(newColor.slice(3, 5), 16);
                        const b = parseInt(newColor.slice(5, 7), 16);
                        return `rgba(${r}, ${g}, ${b}, ${a})`;
                    }
                    return newColor;
                }
                return match;
            });
        },

        // Extract all color stops from a gradient string
        extractGradientStops: function(gradStr) {
            if (!gradStr || !gradStr.includes('gradient')) return [];
            const colorRegex = /(#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\))/g;
            const stops = [];
            let m;
            let i = 0;
            while ((m = colorRegex.exec(gradStr)) !== null) {
                const raw = m[1];
                const hex = this.toHex(raw);
                if (hex) {
                    stops.push({ index: i, raw: raw, hex: hex });
                }
                i++;
            }
            return stops;
        },

        // Friendly label for a DOM node inside a template element
        describeNode: function(node, rootContent) {
            if (!node || node === rootContent) return 'Box';
            const txt = (node.textContent || '').replace(/@import[^;]+;/g, '').trim();
            if (txt.length > 0 && txt.length <= 22) {
                return `"${txt.substring(0, 18)}${txt.length > 18 ? '...' : ''}"`;
            }
            const tag = (node.tagName || '').toUpperCase();
            if (['SVG', 'PATH', 'CIRCLE', 'RECT', 'POLYGON', 'LINE', 'ELLIPSE'].includes(tag)) return `Vector (${tag.toLowerCase()})`;
            if (tag === 'TD' || tag === 'TH') return `Table Cell`;
            if (tag === 'TABLE') return `Table`;
            if (tag === 'HR') return `Divider Line`;
            if (/^H[1-6]$/.test(tag)) return `Heading (${tag})`;
            const w = node.style && node.style.width;
            const h = node.style && node.style.height;
            if (h && parseFloat(h) <= 12 && w && (w === '100%' || parseFloat(w) > 30)) return 'Accent Bar / Line';
            if (w && parseFloat(w) <= 12 && h && (h === '100%' || parseFloat(h) > 30)) return 'Vertical Accent Strip';
            if (node.parentElement === rootContent) return 'Main Container';
            return 'Inner Element';
        },

        // Scan a .pub-element and return all editable CSS color slots, gradients, bars, borders, and images
        scanElement: function(el) {
            const result = {
                gradients: [],
                fills: [],
                borders: [],
                svgs: [],
                texts: [],
                bars: [],
                images: [],
                allSwatches: []
            };
            if (!el) return result;
            // Never scan or modify chart widgets, progress bars, smart arrows, or wordart with CSS Color Studio
            const dtype = el.getAttribute ? (el.getAttribute('data-type') || '') : '';
            if (['chart', 'progress-bar', 'smart-arrow', 'wordart', 'beta-wordart', 'emoji'].includes(dtype)) return result;
            if (window.isChartElement && window.isChartElement(el)) return result;
            if (el.querySelector && el.querySelector('.progress-bar-widget, svg.smart-arrow-svg, .wa-wrapper')) return result;

            const content = el.querySelector('.element-content');
            if (!content) return result;

            const nodes = [content, ...Array.from(content.querySelectorAll('*'))].filter(
                n => n.tagName !== 'STYLE' && n.tagName !== 'SCRIPT' && !n.classList.contains('resize-handle') && !n.classList.contains('rotate-handle')
            );

            const textGroups = new Map(); // hex -> { hex, nodes: [], label }

            nodes.forEach((node) => {
                if (!node.style && !['SVG', 'PATH', 'RECT', 'CIRCLE', 'POLYGON', 'ELLIPSE', 'LINE', 'POLYLINE'].includes(node.tagName)) return;
                const nodeDesc = this.describeNode(node, content);
                const rawStyle = node.getAttribute ? (node.getAttribute('style') || '') : '';

                // 1. Gradients (background or backgroundImage)
                const bgFull = (node.style && (node.style.backgroundImage || node.style.background)) || '';
                if (bgFull && bgFull.includes('gradient')) {
                    const stops = this.extractGradientStops(bgFull);
                    if (stops.length > 0) {
                        const gradEntry = {
                            node: node,
                            label: `${nodeDesc} Gradient`,
                            rawGradient: bgFull,
                            stops: stops
                        };
                        result.gradients.push(gradEntry);
                        stops.forEach((st, sIdx) => {
                            result.allSwatches.push({
                                category: 'gradient',
                                label: `${nodeDesc} Gradient Stop ${sIdx + 1}`,
                                shortLabel: `Grad ${sIdx + 1}`,
                                hex: st.hex,
                                apply: (newHex) => {
                                    const currentGrad = node.style.backgroundImage && node.style.backgroundImage.includes('gradient')
                                        ? node.style.backgroundImage
                                        : node.style.background;
                                    const updated = this.replaceGradientStopColor(currentGrad, st.index, newHex);
                                    node.style.background = updated;
                                    node.style.webkitPrintColorAdjust = 'exact';
                                    node.style.printColorAdjust = 'exact';
                                }
                            });
                        });
                    }
                } else if (node.style) {
                    // 2. Solid Background Fill
                    const bgCol = node.style.backgroundColor || (rawStyle.match(/background(?:-color)?\s*:\s*([^;]+)/i) || [])[1];
                    if (bgCol && !bgCol.includes('gradient') && !bgCol.includes('url(')) {
                        const hex = this.toHex(bgCol);
                        if (hex) {
                            const slot = {
                                category: 'fill',
                                node: node,
                                label: `${nodeDesc} Fill`,
                                shortLabel: 'Fill',
                                hex: hex,
                                apply: (newHex) => {
                                    node.style.background = newHex;
                                    node.style.backgroundColor = newHex;
                                    node.style.webkitPrintColorAdjust = 'exact';
                                    node.style.printColorAdjust = 'exact';
                                }
                            };
                            result.fills.push(slot);
                            result.allSwatches.push(slot);
                        }
                    }
                }

                // 3. Borders & Accent Side Borders & Outlines
                if (node.style) {
                    const borderProps = [
                        { prop: 'border', colorProp: 'borderColor', widthProp: 'borderWidth', name: 'Border' },
                        { prop: 'borderTop', colorProp: 'borderTopColor', widthProp: 'borderTopWidth', name: 'Top Border' },
                        { prop: 'borderBottom', colorProp: 'borderBottomColor', widthProp: 'borderBottomWidth', name: 'Bottom Border' },
                        { prop: 'borderLeft', colorProp: 'borderLeftColor', widthProp: 'borderLeftWidth', name: 'Left Accent' },
                        { prop: 'borderRight', colorProp: 'borderRightColor', widthProp: 'borderRightWidth', name: 'Right Accent' },
                        { prop: 'outline', colorProp: 'outlineColor', widthProp: 'outlineWidth', name: 'Outline' }
                    ];
                    const hasFullBorder = !!(node.style.borderWidth && parseFloat(node.style.borderWidth) > 0 && node.style.borderStyle !== 'none');
                    borderProps.forEach(bp => {
                        if (bp.prop !== 'border' && bp.prop !== 'outline' && hasFullBorder) {
                            // Skip individual sides if uniform border is set
                            if (node.style.borderTopColor === node.style.borderBottomColor &&
                                node.style.borderLeftColor === node.style.borderRightColor &&
                                node.style.borderTopColor === node.style.borderLeftColor &&
                                node.style.borderTopWidth === node.style.borderLeftWidth) {
                                return;
                            }
                        }
                        if (bp.prop === 'border' && !hasFullBorder) return;
                        const wVal = node.style[bp.widthProp];
                        const cVal = node.style[bp.colorProp];
                        if (wVal && parseFloat(wVal) > 0 && cVal) {
                            const hex = this.toHex(cVal);
                            if (hex) {
                                const bSlot = {
                                    category: 'border',
                                    node: node,
                                    prop: bp.prop,
                                    colorProp: bp.colorProp,
                                    widthProp: bp.widthProp,
                                    widthPx: parseFloat(wVal) || 1,
                                    label: `${nodeDesc} ${bp.name}`,
                                    shortLabel: bp.name,
                                    hex: hex,
                                    apply: (newHex) => {
                                        node.style[bp.colorProp] = newHex;
                                    }
                                };
                                result.borders.push(bSlot);
                                result.allSwatches.push(bSlot);
                            }
                        }
                    });
                }

                // 4. SVG & Vector Elements
                const tag = (node.tagName || '').toUpperCase();
                if (['SVG', 'PATH', 'RECT', 'CIRCLE', 'POLYGON', 'ELLIPSE', 'LINE', 'POLYLINE'].includes(tag)) {
                    const fillAttr = node.getAttribute('fill') || (node.style && node.style.fill);
                    const strokeAttr = node.getAttribute('stroke') || (node.style && node.style.stroke);
                    const fillHex = this.toHex(fillAttr);
                    if (fillHex) {
                        const sSlot = {
                            category: 'svg',
                            node: node,
                            label: `SVG ${tag.toLowerCase()} Fill`,
                            shortLabel: 'Vector',
                            hex: fillHex,
                            apply: (newHex) => {
                                if (node.hasAttribute('fill')) node.setAttribute('fill', newHex);
                                if (node.style && node.style.fill) node.style.fill = newHex;
                            }
                        };
                        result.svgs.push(sSlot);
                        result.allSwatches.push(sSlot);
                    }
                    const strokeHex = this.toHex(strokeAttr);
                    if (strokeHex) {
                        const stSlot = {
                            category: 'svg',
                            node: node,
                            label: `SVG ${tag.toLowerCase()} Stroke`,
                            shortLabel: 'Stroke',
                            hex: strokeHex,
                            apply: (newHex) => {
                                if (node.hasAttribute('stroke')) node.setAttribute('stroke', newHex);
                                if (node.style && node.style.stroke) node.style.stroke = newHex;
                            }
                        };
                        result.svgs.push(stSlot);
                        result.allSwatches.push(stSlot);
                    }
                }

                // 5. CSS Width-Based Progress / Skill Bars inside composite divs
                if (tag === 'DIV' && node.style && node.style.width && node.style.width.endsWith('%')) {
                    const pct = parseFloat(node.style.width);
                    if (pct > 0 && pct < 100 && node.children.length === 0 && !(node.textContent || '').trim()) {
                        const parentH = node.parentElement && node.parentElement.style ? parseFloat(node.parentElement.style.height) : 0;
                        const selfH = parseFloat(node.style.height) || parentH;
                        if (selfH > 0 && selfH <= 32) {
                            result.bars.push({
                                node: node,
                                pct: Math.round(pct),
                                label: `Bar Fill (${Math.round(pct)}%)`
                            });
                        }
                    }
                }

                // 6. Embedded Images
                if (tag === 'IMG') {
                    result.images.push({
                        node: node,
                        src: node.src,
                        opacity: node.style.opacity !== '' && node.style.opacity !== undefined ? parseFloat(node.style.opacity) : 1,
                        objectFit: node.style.objectFit || 'cover'
                    });
                }

                // 7. Text Colors (group by hex so user can change matching text colors cleanly)
                if (node.style && node.style.color) {
                    const hasText = Array.from(node.childNodes).some(cn => cn.nodeType === 3 && (cn.textContent || '').trim().length > 0) ||
                                    (node === content || node.parentElement === content) && (node.textContent || '').trim().length > 0;
                    if (hasText) {
                        const tHex = this.toHex(node.style.color);
                        if (tHex) {
                            if (!textGroups.has(tHex)) {
                                textGroups.set(tHex, {
                                    category: 'text',
                                    hex: tHex,
                                    nodes: [node],
                                    label: `Text (${nodeDesc})`,
                                    shortLabel: 'Text'
                                });
                            } else {
                                textGroups.get(tHex).nodes.push(node);
                            }
                        }
                    }
                }
            });

            textGroups.forEach((tg) => {
                const slot = {
                    category: 'text',
                    hex: tg.hex,
                    label: tg.nodes.length > 1 ? `Text Color (${tg.nodes.length} items)` : tg.label,
                    shortLabel: 'Text',
                    apply: (newHex) => {
                        tg.nodes.forEach(n => { n.style.color = newHex; });
                    }
                };
                result.texts.push(slot);
                result.allSwatches.push(slot);
            });

            return result;
        },

        // Populate the "Detected Element Colors" section inside Box Fill dropdown
        populateDropdownSection: function(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            const el = typeof state !== 'undefined' ? state.selectedEl : null;
            if (!el) {
                container.style.display = 'none';
                return;
            }
            const scan = this.scanElement(el);
            if (scan.allSwatches.length === 0) {
                container.style.display = 'none';
                return;
            }
            container.style.display = 'block';
            container.innerHTML = `
                <div class="styled-section-label" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>Detected Element Colors (Click to Edit)</span>
                    <span style="font-size:10px; color:var(--ui-theme-color); cursor:pointer; font-weight:700;" onclick="document.getElementById('textbox-fill-dropdown').style.display='none'; window.TemplateCSSColorEngine.openStudio(state.selectedEl); event.stopPropagation();">Open Studio &rarr;</span>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;"></div>
            `;
            const strip = container.lastElementChild;
            scan.allSwatches.slice(0, 12).forEach((sw) => {
                const chip = document.createElement('div');
                chip.style.cssText = 'display:inline-flex; align-items:center; gap:5px; padding:3px 7px 3px 4px; border-radius:14px; border:1px solid var(--ui-border, #cbd5e1); background:var(--ui-bg, #f8fafc); cursor:pointer; font-size:10.5px; font-weight:600; color:var(--ui-text, #1e293b); transition:all 0.15s;';
                chip.title = `Click to change ${sw.label} (${sw.hex})`;
                chip.innerHTML = `<span style="width:14px; height:14px; border-radius:50%; background:${sw.hex}; border:1px solid rgba(0,0,0,0.2); display:inline-block; flex-shrink:0;"></span><span>${sw.shortLabel}</span>`;
                chip.onclick = (e) => {
                    e.stopPropagation();
                    if (!window.CustomColorPicker) return;
                    window.CustomColorPicker.open(chip, sw.hex, (newColor) => {
                        sw.apply(newColor);
                        sw.hex = newColor;
                        chip.firstElementChild.style.background = newColor;
                        if (window.TextBoxStylesSystem) window.TextBoxStylesSystem.updateRibbonIndicators(el);
                        this.refreshRibbonPanel(el);
                        if (typeof pushHistory === 'function') pushHistory();
                        if (typeof updateThumbnails === 'function') updateThumbnails();
                    });
                };
                strip.appendChild(chip);
            });
        },

        // Inject the live "Element Colors & CSS" group into all contextual Ribbon tabs
        injectRibbonGroups: function() {
            const ribbonIds = ['ribbon-format-text', 'ribbon-format-shape', 'ribbon-format-pic', 'ribbon-table-design'];
            ribbonIds.forEach(rId => {
                const rib = document.getElementById(rId);
                if (!rib || rib.querySelector('.op-css-colors-ribbon-group')) return;
                const grp = document.createElement('div');
                grp.className = 'group op-css-colors-ribbon-group';
                grp.innerHTML = `
                    <div style="display:flex; align-items:center; gap:6px; height:100%; padding:0 4px;">
                        <div class="op-css-ribbon-swatch-grid" style="display:grid; grid-template-columns:repeat(4, 18px); grid-auto-rows:18px; gap:4px; align-content:center; min-width:36px;"></div>
                        <div class="tool-btn" onclick="window.TemplateCSSColorEngine.openStudio((window.state && window.state.selectedEl) || null);" title="Customize All CSS Colors, Gradients, Borders & Page Palette" style="min-width:58px;">
                            <i class="fas fa-palette" style="color:var(--ui-theme-color);"></i>
                            <span style="font-size:10.5px; line-height:1.1; margin-top:2px;">CSS Colors<br>&amp; Style</span>
                        </div>
                    </div>
                    <div class="group-label">Element Colors</div>
                `;
                // Insert right after Text Box Styles or Shape Styles or Adjust group
                const styleGrp = rib.querySelector('#group-format-textbox-styles') || rib.children[1] || null;
                if (styleGrp && styleGrp.nextSibling) {
                    rib.insertBefore(grp, styleGrp.nextSibling);
                } else {
                    rib.appendChild(grp);
                }
            });
        },

        // Refresh the live color swatches in the Ribbon and floating quick-pill when selection changes
        refreshRibbonPanel: function(el) {
            this.injectRibbonGroups();
            if (!el && typeof state !== 'undefined') el = state.selectedEl;
            const grids = document.querySelectorAll('.op-css-ribbon-swatch-grid');
            if (!el) {
                grids.forEach(g => { g.innerHTML = ''; });
                this.hideFloatingPill();
                return;
            }
            const scan = this.scanElement(el);
            const swatches = scan.allSwatches.slice(0, 8);
            grids.forEach(grid => {
                grid.innerHTML = '';
                if (swatches.length === 0) {
                    grid.style.display = 'none';
                    return;
                }
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = `repeat(${Math.min(4, Math.max(1, Math.ceil(swatches.length / 2)))}, 18px)`;
                swatches.forEach(sw => {
                    const dot = document.createElement('div');
                    dot.style.cssText = `width:18px; height:18px; border-radius:4px; background:${sw.hex}; border:1.5px solid rgba(0,0,0,0.25); box-shadow:inset 0 0 0 1px rgba(255,255,255,0.35); cursor:pointer; transition:transform 0.12s;`;
                    dot.title = `${sw.label} (${sw.hex}) - Click to recolor`;
                    dot.onmouseenter = () => { dot.style.transform = 'scale(1.15)'; };
                    dot.onmouseleave = () => { dot.style.transform = 'scale(1)'; };
                dot.onclick = (e) => {
                        e.stopPropagation();
                        if (!window.CustomColorPicker) return;
                        window.CustomColorPicker.open(dot, sw.hex, (newColor) => {
                            sw.apply(newColor);
                            sw.hex = newColor;
                            dot.style.background = newColor;
                            if (window.TextBoxStylesSystem) window.TextBoxStylesSystem.updateRibbonIndicators(el);
                            // Update floating pill dots in-place if open, then refresh after picker closes
                            setTimeout(() => {
                                if (!window.CustomColorPicker || !window.CustomColorPicker.isOpen) {
                                    this.refreshFloatingPill(el);
                                }
                            }, 30);
                            if (typeof pushHistory === 'function') pushHistory();
                            if (typeof updateThumbnails === 'function') updateThumbnails();
                        });
                    };
                    grid.appendChild(dot);
                });
            });
            this.refreshFloatingPill(el, scan);
        },

        hideFloatingPill: function() {
            const pill = document.getElementById('op-floating-css-color-pill');
            if (pill) pill.style.display = 'none';
        },

        // Show a sleek floating action/color bar below/above the selected element
        refreshFloatingPill: function(el, preScanned) {
            if (!el || !el.isConnected || (typeof state !== 'undefined' && state.cropMode)) {
                this.hideFloatingPill();
                return;
            }
            const dtype = el.getAttribute('data-type') || '';
            if (['smart-arrow', 'wordart', 'beta-wordart', 'emoji'].includes(dtype) || el.querySelector('svg.smart-arrow-svg, .wa-wrapper, .wa-text')) {
                this.hideFloatingPill();
                return;
            }

            let pill = document.getElementById('op-floating-css-color-pill');
            if (!pill) {
                pill = document.createElement('div');
                pill.id = 'op-floating-css-color-pill';
                pill.style.cssText = 'position:fixed; z-index:99990; display:none; align-items:center; gap:5px; padding:4px 8px; background:var(--ui-panel-bg, #ffffff); border:1px solid var(--ui-border, #cbd5e1); border-radius:20px; box-shadow:0 4px 14px rgba(0,0,0,0.16); font-family:"Segoe UI",sans-serif; font-size:11px; user-select:none; pointer-events:auto;';
                document.body.appendChild(pill);
            }

            pill.innerHTML = '';

            // 1. Dedicated Chart Studio button for Chart elements (instead of CSS Colors & Style)
            const isChart = (dtype === 'chart') || (window.isChartElement && window.isChartElement(el));
            if (isChart) {
                const chartBtn = document.createElement('button');
                chartBtn.type = 'button';
                chartBtn.style.cssText = 'display:inline-flex; align-items:center; gap:5px; background:var(--ui-theme-color, #007670); color:#ffffff; border:none; border-radius:12px; padding:4px 11px; font-size:11px; font-weight:600; cursor:pointer; white-space:nowrap;';
                chartBtn.innerHTML = `<i class="fas fa-chart-pie" style="font-size:11px;"></i> Edit Chart &amp; Graph`;
                chartBtn.title = 'Open Chart & Graph Format Studio';
                chartBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (typeof window.showChartModal === 'function') {
                        window.showChartModal(el);
                    }
                };
                pill.appendChild(chartBtn);
                this.positionFloatingPill(el, pill);
                return;
            }

            // 2. Dedicated Progress Bar Studio button for Progress Bar widgets
            const isProgressBar = (dtype === 'progress-bar') || !!el.querySelector('.progress-bar-widget');
            if (isProgressBar) {
                const pbBtn = document.createElement('button');
                pbBtn.type = 'button';
                pbBtn.style.cssText = 'display:inline-flex; align-items:center; gap:5px; background:var(--ui-theme-color, #007670); color:#ffffff; border:none; border-radius:12px; padding:4px 11px; font-size:11px; font-weight:600; cursor:pointer; white-space:nowrap;';
                pbBtn.innerHTML = `<i class="fas fa-tasks" style="font-size:11px;"></i> Edit Progress Bar`;
                pbBtn.title = 'Open Progress Bar & Meter Studio';
                pbBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (window.ProgressBarEngine && typeof window.ProgressBarEngine.showModal === 'function') {
                        window.ProgressBarEngine.showModal(el);
                    }
                };
                pill.appendChild(pbBtn);
                this.positionFloatingPill(el, pill);
                return;
            }

            // Skip standalone raw images (they use Format Picture sidebar)
            const standaloneImg = window.getElementContentImage ? window.getElementContentImage(el) : null;
            if (dtype === 'image' || standaloneImg) {
                this.hideFloatingPill();
                return;
            }

            const scan = preScanned || this.scanElement(el);
            const visualSwatches = scan.allSwatches.filter(s => s.category !== 'text').slice(0, 6);
            const displaySwatches = visualSwatches.length > 0 ? visualSwatches : scan.allSwatches.slice(0, 5);

            displaySwatches.forEach(sw => {
                const dot = document.createElement('div');
                dot.style.cssText = `width:16px; height:16px; border-radius:50%; background:${sw.hex}; border:1.5px solid rgba(0,0,0,0.28); box-shadow:inset 0 0 0 1px rgba(255,255,255,0.4); cursor:pointer; flex-shrink:0; transition:transform 0.12s;`;
                dot.title = `${sw.label} (${sw.hex}) - Click to change color`;
                dot.onmouseenter = () => { dot.style.transform = 'scale(1.2)'; };
                dot.onmouseleave = () => { dot.style.transform = 'scale(1)'; };
                dot.onclick = (e) => {
                    e.stopPropagation();
                    if (!window.CustomColorPicker) return;
                    window.CustomColorPicker.open(dot, sw.hex, (newColor) => {
                        sw.apply(newColor);
                        sw.hex = newColor;
                        dot.style.background = newColor;
                        if (window.TextBoxStylesSystem) window.TextBoxStylesSystem.updateRibbonIndicators(el);
                        setTimeout(() => {
                            if (!window.CustomColorPicker || !window.CustomColorPicker.isOpen) {
                                this.refreshRibbonPanel(el);
                            }
                        }, 30);
                        if (typeof pushHistory === 'function') pushHistory();
                        if (typeof updateThumbnails === 'function') updateThumbnails();
                    });
                };
                pill.appendChild(dot);
            });

            const studioBtn = document.createElement('button');
            studioBtn.type = 'button';
            studioBtn.style.cssText = 'display:inline-flex; align-items:center; gap:4px; background:var(--ui-theme-color, #007670); color:#ffffff; border:none; border-radius:12px; padding:3px 9px; font-size:11px; font-weight:600; cursor:pointer; margin-left:2px; white-space:nowrap;';
            studioBtn.innerHTML = `<i class="fas fa-palette" style="font-size:10px;"></i> Colors &amp; Style`;
            studioBtn.title = 'Open CSS Color, Gradient & Style Studio';
            studioBtn.onclick = (e) => {
                e.stopPropagation();
                this.openStudio(el);
            };
            pill.appendChild(studioBtn);

            this.positionFloatingPill(el, pill);
        },

        positionFloatingPill: function(el, pill) {
            if (!pill) pill = document.getElementById('op-floating-css-color-pill');
            if (!pill || !el || !el.isConnected) {
                if (pill) pill.style.display = 'none';
                return;
            }
            const vp = document.getElementById('viewport');
            if (!vp) return;
            const vpRect = vp.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            if (r.width <= 0 || r.height <= 0 || r.bottom < vpRect.top || r.top > vpRect.bottom) {
                pill.style.display = 'none';
                return;
            }
            pill.style.display = 'inline-flex';
            const pillW = pill.offsetWidth || 180;
            const pillH = pill.offsetHeight || 28;
            let left = Math.round(r.left + (r.width - pillW) / 2);
            left = Math.max(vpRect.left + 8, Math.min(vpRect.right - pillW - 8, left));
            let top = Math.round(r.bottom + 10);
            if (top + pillH > vpRect.bottom - 8) {
                top = Math.max(vpRect.top + 8, Math.round(r.top - pillH - 10));
            }
            pill.style.left = left + 'px';
            pill.style.top = top + 'px';
        },

        // Scan all elements on the current page and group every CSS color across the page
        scanPagePalette: function() {
            const paperEl = document.getElementById('paper');
            const colorMap = new Map(); // hex -> { hex, count, setters: [] }
            if (!paperEl) return [];

            const addSetter = (hex, fn) => {
                if (!hex) return;
                if (!colorMap.has(hex)) {
                    colorMap.set(hex, { hex: hex, count: 0, setters: [] });
                }
                const entry = colorMap.get(hex);
                entry.count++;
                entry.setters.push(fn);
            };

            // Also include paper background if solid color
            const paperBg = this.toHex(paperEl.style.backgroundColor || paperEl.style.background);
            if (paperBg) {
                addSetter(paperBg, (newHex) => {
                    paperEl.style.background = newHex;
                    if (typeof state !== 'undefined' && state.pages && state.pages[state.currentPageIndex]) {
                        state.pages[state.currentPageIndex].background = newHex;
                    }
                });
            }

            paperEl.querySelectorAll('.pub-element').forEach(el => {
                const scan = this.scanElement(el);
                scan.allSwatches.forEach(sw => {
                    addSetter(sw.hex, sw.apply);
                });
            });

            return Array.from(colorMap.values()).sort((a, b) => b.count - a.count);
        },

        // Apply a 1-click designer palette across the current page (maps existing page colors by luminance rank)
        applyDesignerPaletteToPage: function(paletteId) {
            const pal = this.designerPalettes.find(p => p.id === paletteId);
            if (!pal) return;
            const pageColors = this.scanPagePalette();
            if (pageColors.length === 0) return;

            const getLuma = (hex) => {
                const c = hex.replace('#', '');
                const r = parseInt(c.slice(0, 2), 16) || 0;
                const g = parseInt(c.slice(2, 4), 16) || 0;
                const b = parseInt(c.slice(4, 6), 16) || 0;
                return 0.299 * r + 0.587 * g + 0.114 * b;
            };

            // Sort both current page colors and palette colors from darkest to lightest so contrast is preserved!
            const sortedPage = [...pageColors].sort((a, b) => getLuma(a.hex) - getLuma(b.hex));
            const sortedPal = [...pal.colors].sort((a, b) => getLuma(a) - getLuma(b));

            sortedPage.forEach((entry, idx) => {
                const mappedIdx = sortedPage.length === 1
                    ? 0
                    : Math.min(sortedPal.length - 1, Math.round((idx / (sortedPage.length - 1)) * (sortedPal.length - 1)));
                const targetHex = sortedPal[mappedIdx];
                entry.setters.forEach(fn => fn(targetHex));
            });

            if (typeof state !== 'undefined' && state.selectedEl) {
                this.refreshRibbonPanel(state.selectedEl);
                if (window.TextBoxStylesSystem) window.TextBoxStylesSystem.updateRibbonIndicators(state.selectedEl);
            }
            if (typeof pushHistory === 'function') pushHistory();
            if (typeof updateThumbnails === 'function') updateThumbnails();
        },

        // Open the full interactive CSS Color, Gradient, Border & Theme Studio modal
        openStudio: function(targetEl) {
            const el = targetEl || (typeof state !== 'undefined' ? state.selectedEl : null);
            if (el && ((typeof window.isChartElement === 'function' && window.isChartElement(el)) || el.getAttribute('data-type') === 'chart' || (el.dataset && el.dataset.chartConfig))) {
                if (typeof window.showChartModal === 'function') {
                    window.showChartModal(el);
                    return;
                }
            }
            const scan = el ? this.scanElement(el) : { gradients: [], fills: [], borders: [], svgs: [], texts: [], bars: [], images: [], allSwatches: [] };
            const pagePalette = this.scanPagePalette();
            const visualBox = (el && window.TextBoxStylesSystem) ? window.TextBoxStylesSystem.getVisualBoxTarget(el) : (el && el.querySelector('.element-content'));
            const curRadius = visualBox ? (parseInt(visualBox.style.borderRadius) || 0) : 0;

            const uiHtml = `
                <style>
                    .css-studio-wrap { font-family: 'Segoe UI', system-ui, sans-serif; color: var(--ui-text, #1e293b); display: flex; flex-direction: column; gap: 14px; max-height: 68vh; overflow-y: auto; padding-right: 4px; }
                    .css-studio-section { background: var(--ui-bg, #f8fafc); border: 1px solid var(--ui-border, #e2e8f0); border-radius: 8px; padding: 12px 14px; }
                    .css-studio-sec-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--ui-theme-color, #007670); margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
                    .css-studio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(175px, 1fr)); gap: 8px; }
                    .css-slot-card { display: flex; align-items: center; gap: 8px; background: var(--ui-panel-bg, #ffffff); border: 1px solid var(--ui-border, #cbd5e1); border-radius: 6px; padding: 6px 10px; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s; }
                    .css-slot-card:hover { border-color: var(--ui-theme-color, #007670); box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
                    .css-slot-swatch { width: 24px; height: 24px; border-radius: 5px; border: 1px solid rgba(0,0,0,0.22); flex-shrink: 0; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.35); }
                    .css-slot-meta { display: flex; flex-direction: column; min-width: 0; flex: 1; }
                    .css-slot-label { font-size: 11.5px; font-weight: 600; color: var(--ui-text, #1e293b); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                    .css-slot-hex { font-size: 10px; color: #64748b; font-family: monospace; }
                    .css-theme-card { display: flex; flex-direction: column; gap: 5px; background: var(--ui-panel-bg, #ffffff); border: 1px solid var(--ui-border, #cbd5e1); border-radius: 6px; padding: 7px 9px; cursor: pointer; transition: all 0.15s; }
                    .css-theme-card:hover { border-color: var(--ui-theme-color, #007670); transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.08); }
                    .css-theme-bar { display: flex; height: 14px; border-radius: 4px; overflow: hidden; border: 1px solid rgba(0,0,0,0.12); }
                    .css-theme-bar > span { flex: 1; height: 100%; }
                </style>
                <div class="css-studio-wrap" id="css-studio-root">
                    ${el ? `
                        <div class="css-studio-section" id="css-studio-el-section">
                            <div class="css-studio-sec-title">
                                <span><i class="fas fa-crosshairs" style="margin-right:6px;"></i> Selected Element Colors &amp; Gradients</span>
                                <span style="font-size:10.5px; font-weight:600; color:#64748b;">Click any color to customize live</span>
                            </div>
                            <div class="css-studio-grid" id="css-studio-el-swatches"></div>
                            <div id="css-studio-el-extras" style="margin-top:10px; display:flex; flex-direction:column; gap:8px;"></div>
                        </div>
                        <div class="css-studio-section">
                            <div class="css-studio-sec-title">
                                <span><i class="fas fa-vector-square" style="margin-right:6px;"></i> Box Fill, Outline &amp; Corner Styling</span>
                            </div>
                            <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
                                <button type="button" class="btn-secondary" style="padding:5px 10px; font-size:12px; cursor:pointer;" onclick="if(window.TextBoxStylesSystem) window.TextBoxStylesSystem.pickCustomSolidFill(this);">
                                    <i class="fas fa-fill-drip" style="color:var(--ui-theme-color); margin-right:4px;"></i> Set Solid Box Fill...
                                </button>
                                <button type="button" class="btn-secondary" style="padding:5px 10px; font-size:12px; cursor:pointer;" onclick="if(window.TextBoxStylesSystem) window.TextBoxStylesSystem.pickCustomBorderColor(this);">
                                    <i class="fas fa-border-style" style="color:var(--ui-theme-color); margin-right:4px;"></i> Set Box Outline Color...
                                </button>
                                <div style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:600;">
                                    <span>Corner Radius:</span>
                                    <input type="range" id="css-studio-radius-slider" min="0" max="60" value="${Math.min(60, curRadius)}" style="width:90px; accent-color:var(--ui-theme-color);">
                                    <span id="css-studio-radius-val" style="min-width:32px;">${curRadius}px</span>
                                </div>
                                <button type="button" class="btn-secondary" style="padding:5px 10px; font-size:12px; cursor:pointer;" onclick="DialogSystem.close(); if(window.BorderArtEngine) window.BorderArtEngine.openForElement(state.selectedEl);">
                                    <i class="fas fa-Sparkles" style="color:var(--ui-theme-color);"></i> Border Art...
                                </button>
                            </div>
                        </div>
                    ` : ''}

                    <div class="css-studio-section">
                        <div class="css-studio-sec-title">
                            <span><i class="fas fa-swatchbook" style="margin-right:6px;"></i> Entire Page Color Palette (${pagePalette.length} Colors Detected)</span>
                            <span style="font-size:10.5px; font-weight:600; color:#64748b;">Replaces color everywhere on this page</span>
                        </div>
                        <div class="css-studio-grid" id="css-studio-page-swatches"></div>
                    </div>

                    <div class="css-studio-section">
                        <div class="css-studio-sec-title">
                            <span><i class="fas fa-magic" style="margin-right:6px;"></i> 1-Click Designer Color Themes (Re-Theme Entire Page)</span>
                        </div>
                        <div class="css-studio-grid" id="css-studio-themes-grid"></div>
                    </div>
                </div>
            `;

            DialogSystem.show('CSS Color, Gradient & Theme Studio', uiHtml, () => {
                if (el) this.refreshRibbonPanel(el);
                if (typeof pushHistory === 'function') pushHistory();
                if (typeof updateThumbnails === 'function') updateThumbnails();
            }, true, 'Done');

            const dlgBox = document.getElementById('custom-dialog-box');
            if (dlgBox) {
                dlgBox.style.width = '720px';
                dlgBox.style.maxWidth = '95vw';
            }

            // Populate Selected Element Swatches
            const elGrid = document.getElementById('css-studio-el-swatches');
            if (elGrid && el) {
                if (scan.allSwatches.length === 0) {
                    elGrid.innerHTML = `<div style="grid-column:1/-1; font-size:12px; color:#64748b;">No custom CSS colors detected on this element yet. Use "Set Solid Box Fill" or "Set Box Outline Color" below to add styling.</div>`;
                } else {
                    scan.allSwatches.forEach(sw => {
                        const card = document.createElement('div');
                        card.className = 'css-slot-card';
                        card.innerHTML = `
                            <div class="css-slot-swatch" style="background:${sw.hex};"></div>
                            <div class="css-slot-meta">
                                <span class="css-slot-label" title="${sw.label}">${sw.label}</span>
                                <span class="css-slot-hex">${sw.hex.toUpperCase()}</span>
                            </div>
                        `;
                        card.onclick = (e) => {
                            e.stopPropagation();
                            if (!window.CustomColorPicker) return;
                            window.CustomColorPicker.open(card.firstElementChild, sw.hex, (newColor) => {
                                sw.apply(newColor);
                                sw.hex = newColor;
                                card.firstElementChild.style.background = newColor;
                                card.querySelector('.css-slot-hex').textContent = newColor.toUpperCase();
                                if (window.TextBoxStylesSystem) window.TextBoxStylesSystem.updateRibbonIndicators(el);
                                this.refreshRibbonPanel(el);
                                if (typeof pushHistory === 'function') pushHistory();
                                if (typeof updateThumbnails === 'function') updateThumbnails();
                            });
                        };
                        elGrid.appendChild(card);
                    });
                }

                // Populate Extras: CSS Bar Sliders, Border Weight Sliders, and Embedded Image Controls
                const extras = document.getElementById('css-studio-el-extras');
                if (extras) {
                    scan.bars.forEach((bar) => {
                        const row = document.createElement('div');
                        row.style.cssText = 'display:flex; align-items:center; gap:10px; font-size:12px; background:var(--ui-panel-bg,#fff); padding:6px 10px; border-radius:6px; border:1px solid var(--ui-border,#cbd5e1);';
                        row.innerHTML = `
                            <span style="font-weight:600; min-width:120px;"><i class="fas fa-tasks" style="color:var(--ui-theme-color); margin-right:5px;"></i> ${bar.label}:</span>
                            <input type="range" min="1" max="100" value="${bar.pct}" style="flex:1; accent-color:var(--ui-theme-color);">
                            <span style="font-weight:700; min-width:38px; text-align:right;">${bar.pct}%</span>
                        `;
                        const rng = row.querySelector('input');
                        const valSpan = row.lastElementChild;
                        rng.oninput = () => {
                            bar.node.style.width = rng.value + '%';
                            valSpan.textContent = rng.value + '%';
                        };
                        rng.onchange = () => {
                            if (typeof pushHistory === 'function') pushHistory();
                            if (typeof updateThumbnails === 'function') updateThumbnails();
                        };
                        extras.appendChild(row);
                    });

                    scan.images.forEach((imgItem, idx) => {
                        const row = document.createElement('div');
                        row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; font-size:12px; background:var(--ui-panel-bg,#fff); padding:6px 10px; border-radius:6px; border:1px solid var(--ui-border,#cbd5e1);';
                        const opPct = Math.round(imgItem.opacity * 100);
                        row.innerHTML = `
                            <div style="display:flex; align-items:center; gap:8px;">
                                <i class="fas fa-image" style="color:var(--ui-theme-color);"></i>
                                <span style="font-weight:600;">Embedded Photo ${scan.images.length > 1 ? idx + 1 : ''}</span>
                                <button type="button" class="btn-secondary" style="padding:3px 9px; font-size:11.5px; cursor:pointer;">Swap Photo...</button>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span style="font-weight:600;">Photo Opacity:</span>
                                <input type="range" min="5" max="100" value="${opPct}" style="width:90px; accent-color:var(--ui-theme-color);">
                                <span style="min-width:34px; font-weight:700;">${opPct}%</span>
                            </div>
                        `;
                        const swapBtn = row.querySelector('button');
                        swapBtn.onclick = () => {
                            const fInput = document.createElement('input');
                            fInput.type = 'file';
                            fInput.accept = 'image/*';
                            fInput.onchange = (ev) => {
                                if (ev.target.files && ev.target.files[0]) {
                                    const reader = new FileReader();
                                    reader.onload = (loadEv) => {
                                        imgItem.node.src = loadEv.target.result;
                                        if (typeof pushHistory === 'function') pushHistory();
                                        if (typeof updateThumbnails === 'function') updateThumbnails();
                                    };
                                    reader.readAsDataURL(ev.target.files[0]);
                                }
                            };
                            fInput.click();
                        };
                        const opSlider = row.querySelector('input[type="range"]');
                        const opLabel = row.querySelector('div:last-child span:last-child');
                        opSlider.oninput = () => {
                            imgItem.node.style.opacity = (parseInt(opSlider.value) / 100).toFixed(2);
                            opLabel.textContent = opSlider.value + '%';
                        };
                        opSlider.onchange = () => {
                            if (typeof pushHistory === 'function') pushHistory();
                            if (typeof updateThumbnails === 'function') updateThumbnails();
                        };
                        extras.appendChild(row);
                    });
                }

                // Corner radius slider wiring
                const rSlider = document.getElementById('css-studio-radius-slider');
                const rVal = document.getElementById('css-studio-radius-val');
                if (rSlider && visualBox) {
                    rSlider.oninput = () => {
                        visualBox.style.borderRadius = rSlider.value + 'px';
                        if (rVal) rVal.textContent = rSlider.value + 'px';
                    };
                    rSlider.onchange = () => {
                        if (typeof pushHistory === 'function') pushHistory();
                        if (typeof updateThumbnails === 'function') updateThumbnails();
                    };
                }
            }

            // Populate Page Palette Swatches
            const pageGrid = document.getElementById('css-studio-page-swatches');
            if (pageGrid) {
                pagePalette.forEach(pEntry => {
                    const card = document.createElement('div');
                    card.className = 'css-slot-card';
                    card.innerHTML = `
                        <div class="css-slot-swatch" style="background:${pEntry.hex};"></div>
                        <div class="css-slot-meta">
                            <span class="css-slot-label">Page Color (${pEntry.count}x)</span>
                            <span class="css-slot-hex">${pEntry.hex.toUpperCase()}</span>
                        </div>
                    `;
                    card.onclick = (e) => {
                        e.stopPropagation();
                        if (!window.CustomColorPicker) return;
                        window.CustomColorPicker.open(card.firstElementChild, pEntry.hex, (newColor) => {
                            pEntry.setters.forEach(fn => fn(newColor));
                            pEntry.hex = newColor;
                            card.firstElementChild.style.background = newColor;
                            card.querySelector('.css-slot-hex').textContent = newColor.toUpperCase();
                            if (el) this.refreshRibbonPanel(el);
                            if (typeof pushHistory === 'function') pushHistory();
                            if (typeof updateThumbnails === 'function') updateThumbnails();
                        });
                    };
                    pageGrid.appendChild(card);
                });
            }

            // Populate 1-Click Designer Themes
            const themesGrid = document.getElementById('css-studio-themes-grid');
            if (themesGrid) {
                this.designerPalettes.forEach(pal => {
                    const tCard = document.createElement('div');
                    tCard.className = 'css-theme-card';
                    tCard.innerHTML = `
                        <div style="font-size:11px; font-weight:700; color:var(--ui-text,#1e293b);">${pal.name}</div>
                        <div class="css-theme-bar">
                            ${pal.colors.map(c => `<span style="background:${c};"></span>`).join('')}
                        </div>
                    `;
                    tCard.onclick = () => {
                        this.applyDesignerPaletteToPage(pal.id);
                        DialogSystem.close();
                        this.openStudio(el);
                    };
                    themesGrid.appendChild(tCard);
                });
            }
        }
    };

    // Hook selectElement, deselect, scroll, mouseup, and contextmenu so the Ribbon & Floating Pill stay synced
    const ensureSelectHooksWrapped = () => {
        if (typeof window.selectElement === 'function' && !window.selectElement._cssColorHooked) {
            const origSelect = window.selectElement;
            const wrappedSelect = function(el) {
                const res = origSelect.apply(this, arguments);
                if (window.TemplateCSSColorEngine) {
                    window.TemplateCSSColorEngine.refreshRibbonPanel(el);
                }
                return res;
            };
            wrappedSelect._cssColorHooked = true;
            window.selectElement = wrappedSelect;
        }

        if (typeof window.deselect === 'function' && !window.deselect._cssColorHooked) {
            const origDeselect = window.deselect;
            const wrappedDeselect = function() {
                const res = origDeselect.apply(this, arguments);
                if (window.TemplateCSSColorEngine) {
                    window.TemplateCSSColorEngine.hideFloatingPill();
                }
                return res;
            };
            wrappedDeselect._cssColorHooked = true;
            window.deselect = wrappedDeselect;
        }
    };

    const installSelectionHooks = () => {
        if (typeof window.selectElement !== 'function') {
            setTimeout(installSelectionHooks, 100);
            return;
        }
        ensureSelectHooksWrapped();
        // Re-verify hooks after late 1500ms patches in system-patches.js and legacy-fixes.js
        setTimeout(ensureSelectHooksWrapped, 600);
        setTimeout(ensureSelectHooksWrapped, 1700);

        if (window._cssColorEngineHooked) return;
        window._cssColorEngineHooked = true;

        // Keep floating pill aligned on scroll/drag/resize and restore after mouseup
        const vp = document.getElementById('viewport');
        if (vp) {
            vp.addEventListener('scroll', () => {
                if (typeof state !== 'undefined' && state.selectedEl && window.TemplateCSSColorEngine) {
                    window.TemplateCSSColorEngine.positionFloatingPill(state.selectedEl);
                }
            }, { passive: true });
        }
        document.addEventListener('mousemove', () => {
            if (typeof state !== 'undefined' && state.dragMode && state.selectedEl && window.TemplateCSSColorEngine) {
                window.TemplateCSSColorEngine.positionFloatingPill(state.selectedEl);
            }
        }, { passive: true });
        document.addEventListener('mouseup', (e) => {
            ensureSelectHooksWrapped();
            if (typeof state !== 'undefined' && state.selectedEl && window.TemplateCSSColorEngine) {
                // Do not refresh if clicking inside color picker or modal dialog
                if (e.target && e.target.closest && e.target.closest('.custom-color-picker, #custom-dialog-overlay, #op-floating-css-color-pill')) {
                    return;
                }
                setTimeout(() => {
                    if (typeof state !== 'undefined' && state.selectedEl && window.TemplateCSSColorEngine) {
                        window.TemplateCSSColorEngine.refreshRibbonPanel(state.selectedEl);
                    }
                }, 20);
            }
        }, { passive: true });

        // Upgrade ContextMenuActions.formatTextBox so Format Text Box opens the rich CSS Color & Box Studio (or Chart Studio for charts)
        if (typeof window.ContextMenuActions !== 'undefined') {
            window.ContextMenuActions.formatTextBox = function() {
                const sel = typeof state !== 'undefined' ? state.selectedEl : null;
                if (sel && window.isChartElement && window.isChartElement(sel)) {
                    if (typeof window.showChartModal === 'function') window.showChartModal(sel);
                    return;
                }
                if (window.TemplateCSSColorEngine) {
                    window.TemplateCSSColorEngine.openStudio(sel);
                }
            };
        }

        // Inject "Customize Element Colors & CSS..." into Right-Click Context Menu
        const ctxMenu = document.getElementById('context-menu');
        if (ctxMenu && !document.getElementById('ctx-item-css-studio')) {
            const item = document.createElement('div');
            item.id = 'ctx-item-css-studio';
            item.className = 'context-item';
            item.innerHTML = `<i class="fas fa-palette" style="color:var(--ui-theme-color);"></i> Customize Colors &amp; CSS Style...`;
            item.onclick = () => {
                ctxMenu.style.display = 'none';
                const sel = typeof state !== 'undefined' ? state.selectedEl : null;
                if (sel && window.isChartElement && window.isChartElement(sel)) {
                    if (typeof window.showChartModal === 'function') window.showChartModal(sel);
                    return;
                }
                if (window.TemplateCSSColorEngine) {
                    window.TemplateCSSColorEngine.openStudio(sel);
                }
            };
            ctxMenu.insertBefore(item, ctxMenu.firstChild);
        }

        window.TemplateCSSColorEngine.injectRibbonGroups();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', installSelectionHooks);
    } else {
        setTimeout(installSelectionHooks, 50);
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
        else if (f === 'square') svg = makeIcon('SQUARE', 28, 28, 5.5, 17);
        else svg = makeIcon('CUSTOM', 34, 42, 5.5, 17);
        
        indicator.innerHTML = svg;
        indicator.style.transform = 'scale(1.1)';
        setTimeout(() => { indicator.style.transform = 'scale(1)'; }, 150);
        if (typeof window.updateCardSheetRibbonVisibility === 'function') {
            window.updateCardSheetRibbonVisibility();
        }
    };

    indicator.innerHTML = makeIcon('A4', 24, 30, 10, 18);

    const originalLoad = window.loadTemplate;
    if (typeof originalLoad === 'function' && !window._formatHooked) {
        window._formatHooked = true;
        window.loadTemplate = function(t) {
            originalLoad(t);
            const p0 = (t && t.pages && t.pages[0]) || {};
            let w = parseFloat(t.w || p0.width || 794);
            let h = parseFloat(t.h || p0.height || 1123);
            if (typeof state !== 'undefined' && state.isSpreadMode) {
                w = w / 2;
            }
            const activeDpi = (p0.dpi) || (typeof state !== 'undefined' && state.dpi) || 96;
            let fmt = t.format || p0.format || (typeof state !== 'undefined' && state.format);
            if (!fmt || fmt === 'Custom') {
                if (window.UnitConversionService && window.UnitConversionService.detectFormat) {
                    fmt = window.UnitConversionService.detectFormat(w, h, activeDpi);
                } else {
                    let shortEdge = Math.min(w, h);
                    let longEdge = Math.max(w, h);
                    
                    if (Math.abs(w - h) <= 10) fmt = 'Square';
                    else if (shortEdge >= 1100) fmt = 'A3';
                    else if (shortEdge >= 1000) fmt = 'Tabloid';
                    else if (shortEdge >= 810 && longEdge > 1100) fmt = 'Legal';
                    else if (shortEdge > 800) fmt = 'Letter';
                    else if (shortEdge < 400) fmt = 'BusinessCard';
                    else if (shortEdge < 600) fmt = 'A5';
                    else fmt = 'A4';
                }
            }
            if (typeof state !== 'undefined') state.format = fmt;
            window.setPageFormatIcon(fmt);
        };
    }
})();
