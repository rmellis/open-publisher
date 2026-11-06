/**
 * OpenPublisher Line Spacing & Typography Options Modal (v5.18.5)
 * Provides real-time interactive line spacing adjustment with presets,
 * dual slider/stepper controls, persistent selection protection,
 * and live canvas/preview synchronization.
 */

window.showLineSpacingModal = function() {
    if (!state.selectedEl) {
        DialogSystem.alert('Notice', 'Please select a text box first.');
        return;
    }

    const targetEl = state.selectedEl;
    let content = targetEl.querySelector('.element-content');
    if (!content && targetEl.classList.contains('element-content')) {
        content = targetEl;
    }
    if (!content) {
        content = targetEl.querySelector('[contenteditable="true"]') || targetEl;
    }

    // Capture initial state for Cancel/Revert
    const initialLineHeight = content.style.lineHeight || '';

    // Measure font size and compute baseline line height
    const computedStyle = window.getComputedStyle(content);
    const computedFsPx = parseFloat(computedStyle.fontSize) || 16;
    const computedFsPt = Math.max(6, Math.round(computedFsPx * 0.75));

    // Determine current point value
    let currentPt = computedFsPt;
    let isNormal = !initialLineHeight || initialLineHeight === 'normal';

    if (initialLineHeight && initialLineHeight !== 'normal') {
        if (initialLineHeight.includes('pt')) {
            currentPt = parseFloat(initialLineHeight) || computedFsPt;
        } else if (initialLineHeight.includes('px')) {
            currentPt = Math.round((parseFloat(initialLineHeight) || computedFsPx) * 0.75);
        } else if (!isNaN(parseFloat(initialLineHeight))) {
            // Unitless multiplier (e.g. 1.2, 1.4)
            currentPt = Math.round(parseFloat(initialLineHeight) * computedFsPt);
        }
    } else {
        const compLhPx = parseFloat(computedStyle.lineHeight);
        if (!isNaN(compLhPx) && compLhPx > 0) {
            currentPt = Math.round(compLhPx * 0.75);
        } else {
            currentPt = Math.round(computedFsPt * 1.25);
        }
    }
    currentPt = Math.max(1, Math.round(currentPt));

    // Capture active selection range inside content so text remains selected
    const sel = window.getSelection();
    let savedRange = null;
    if (sel && sel.rangeCount > 0 && content.contains(sel.anchorNode)) {
        savedRange = sel.getRangeAt(0).cloneRange();
        state.lastRange = savedRange;
    } else if (state.lastRange && content.contains(state.lastRange.commonAncestorContainer)) {
        savedRange = state.lastRange;
    }

    // Apply native CSS Custom Highlight API to keep highlighted text visually selected while modal has focus
    if (savedRange && !savedRange.collapsed && typeof CSS !== 'undefined' && 'highlights' in CSS) {
        try {
            CSS.highlights.set('line-spacing-selection', new Highlight(savedRange));
        } catch(e) {}
    }

    // Mark element active and ensure it stays selected
    targetEl.classList.add('selected', 'op-line-spacing-active-target');
    state.selectedEl = targetEl;

    const minPt = Math.max(4, Math.round(computedFsPt * 0.5));
    const maxPt = Math.max(140, Math.round(Math.max(currentPt * 2.2, computedFsPt * 3.5)));

    const html = `
        <div class="op-line-spacing-modal-container" style="padding: 4px 6px; width: 420px; box-sizing: border-box; font-family: inherit;">
            <p style="margin: 0 0 14px 0; font-size: 12px; color: var(--ui-text-muted, #64748b); line-height: 1.45;">
                Adjust the vertical line spacing for text inside the selected text box. Changes preview live on canvas.
            </p>

            <!-- Quick Presets -->
            <div style="margin-bottom: 16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--ui-theme-dark,#0f766e);">
                        Quick Presets
                    </span>
                    <span style="font-size:11px; color:#94a3b8;">Font size: ${computedFsPt}pt</span>
                </div>
                <div class="op-ls-presets" style="display:flex; gap:6px; flex-wrap:wrap;">
                    <button type="button" class="op-ls-preset-btn" data-multiplier="1.0" title="Single Spacing (1.0x)">1.0x</button>
                    <button type="button" class="op-ls-preset-btn" data-multiplier="1.15" title="Standard Spacing (1.15x)">1.15x</button>
                    <button type="button" class="op-ls-preset-btn" data-multiplier="1.25" title="Relaxed Spacing (1.25x)">1.25x</button>
                    <button type="button" class="op-ls-preset-btn" data-multiplier="1.5" title="Spacious Spacing (1.5x)">1.5x</button>
                    <button type="button" class="op-ls-preset-btn" data-multiplier="2.0" title="Double Spacing (2.0x)">2.0x</button>
                    <button type="button" class="op-ls-preset-btn ${isNormal ? 'active' : ''}" data-multiplier="normal" title="Revert to Normal/Auto spacing">Auto</button>
                </div>
            </div>

            <!-- Exact Spacing Slider & Stepper -->
            <div style="background: var(--ui-panel-bg, #f8fafc); border: 1px solid var(--ui-border, #e2e8f0); border-radius: 8px; padding: 12px 14px; margin-bottom: 14px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <label for="exact-line-spacing-input" style="font-size:12px; font-weight:600; color:var(--ui-text,#1e293b); cursor:pointer;">
                        Exact Line Spacing:
                    </label>
                    <span id="exact-line-spacing-badge" style="background:var(--ui-theme-color,#007670); color:#fff; font-size:11px; font-weight:700; padding:2px 10px; border-radius:12px; font-variant-numeric: tabular-nums;">
                        ${isNormal ? 'Normal (' + currentPt + 'pt)' : currentPt + ' pt'}
                    </span>
                </div>

                <!-- Slider -->
                <div style="margin-bottom: 12px; display:flex; align-items:center; gap:10px;">
                    <input type="range" id="exact-line-spacing-slider" class="op-sidebar-slider" min="${minPt}" max="${maxPt}" step="1" value="${currentPt}" style="flex:1; cursor:pointer;">
                </div>

                <!-- Stepper Row -->
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:11px; color:var(--ui-text-muted,#64748b);">Fine Tune:</span>
                    <div style="display:flex; align-items:center; gap:4px;">
                        <button type="button" id="exact-ls-dec" class="op-ls-stepper-btn" title="Decrease line spacing by 1pt (or 5pt with Shift)">
                            <i class="fas fa-minus" style="font-size:9px;"></i>
                        </button>
                        <div style="position:relative; display:inline-flex; align-items:center;">
                            <input type="number" id="exact-line-spacing-input" class="modern-input op-ls-number-input" min="1" max="500" step="1" value="${isNormal ? '' : currentPt}" placeholder="${currentPt}">
                            <span style="position:absolute; right:7px; font-size:11px; color:#94a3b8; pointer-events:none;">pt</span>
                        </div>
                        <button type="button" id="exact-ls-inc" class="op-ls-stepper-btn" title="Increase line spacing by 1pt (or 5pt with Shift)">
                            <i class="fas fa-plus" style="font-size:9px;"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- In-Dialog Live Preview Card -->
            <div style="background: var(--ui-panel-bg, #f8fafc); border: 1px dashed var(--ui-border, #cbd5e1); border-radius: 6px; padding: 10px 14px; margin-bottom: 10px;">
                <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#94a3b8; margin-bottom:4px;">
                    Typography Preview
                </div>
                <div id="op-ls-preview-box" style="font-size: 13px; line-height: ${isNormal ? 'normal' : currentPt + 'pt'}; color: var(--ui-text, #1e293b); transition: line-height 0.05s ease; user-select: none;">
                    <div>Open Publisher precision typographic line spacing.</div>
                    <div>Watch text vertical rhythm adjust smoothly in real time.</div>
                </div>
            </div>

            <!-- Hint -->
            <div style="font-size:11px; color:#64748b; display:flex; align-items:center; gap:6px;">
                <i class="fas fa-info-circle" style="color:var(--ui-theme-color,#007670); font-size:11px;"></i>
                <span>Drag dialog header to reposition. Changes preview live on canvas.</span>
            </div>
        </div>
    `;

    DialogSystem.show('<i class="fas fa-arrows-alt-v" style="margin-right:8px;"></i>Line Spacing Options', html, () => {
        cleanup(true);
    });

    // Wire up Cancel hook for 'X', Cancel button, and Escape key
    window._dialogCancelHook = () => {
        cleanup(false);
    };

    // Live update function
    function updateLive(val, isNormalSpacing = false) {
        if (!content) return;

        // 1. Apply to canvas text element
        content.style.lineHeight = isNormalSpacing ? 'normal' : val;

        // Also update any child nodes with explicit inline line-height to maintain consistency
        const styledChildren = content.querySelectorAll('[style*="line-height"]');
        styledChildren.forEach(child => {
            child.style.lineHeight = isNormalSpacing ? 'normal' : val;
        });

        // 2. Keep selection active and update handles
        if (state.selectedEl !== targetEl) {
            state.selectedEl = targetEl;
        }
        targetEl.classList.add('selected');

        // 3. Update in-dialog preview
        const previewBox = document.getElementById('op-ls-preview-box');
        if (previewBox) {
            previewBox.style.lineHeight = isNormalSpacing ? 'normal' : val;
        }
        const badge = document.getElementById('exact-line-spacing-badge');
        if (badge) {
            badge.innerText = isNormalSpacing ? 'Normal (' + currentPt + 'pt)' : val;
        }

        // 4. Update selection overlays so the dashed border and handles match text height dynamically
        if (typeof window.updateSelectionObserver === 'function') {
            window.updateSelectionObserver();
        } else if (typeof window.renderSelectionOverlays === 'function') {
            window.renderSelectionOverlays();
        }

        // 5. Update minimap thumbnail
        if (typeof window.updateThumbnails === 'function') {
            window.updateThumbnails();
        }
    }

    function updatePresetHighlight(activeMultiplier) {
        const btns = document.querySelectorAll('.op-ls-preset-btn');
        btns.forEach(b => {
            if (activeMultiplier === null) {
                b.classList.remove('active');
            } else if (b.dataset.multiplier === String(activeMultiplier)) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
    }

    // Connect interactive controls
    const slider = document.getElementById('exact-line-spacing-slider');
    const numberInput = document.getElementById('exact-line-spacing-input');
    const decBtn = document.getElementById('exact-ls-dec');
    const incBtn = document.getElementById('exact-ls-inc');
    const presetBtns = document.querySelectorAll('.op-ls-preset-btn');

    if (slider && numberInput) {
        slider.oninput = () => {
            currentPt = parseInt(slider.value) || computedFsPt;
            numberInput.value = currentPt;
            updatePresetHighlight(null);
            updateLive(currentPt + 'pt');
        };

        numberInput.oninput = () => {
            const raw = numberInput.value.trim();
            if (!raw) {
                updatePresetHighlight('normal');
                updateLive('normal', true);
                return;
            }
            currentPt = Math.max(1, parseInt(raw) || computedFsPt);
            if (currentPt > maxPt) {
                slider.max = currentPt + 20;
            }
            slider.value = currentPt;
            updatePresetHighlight(null);
            updateLive(currentPt + 'pt');
        };

        if (decBtn) {
            decBtn.onclick = (e) => {
                const step = e.shiftKey ? 5 : 1;
                currentPt = Math.max(1, currentPt - step);
                slider.value = Math.min(slider.max, Math.max(slider.min, currentPt));
                numberInput.value = currentPt;
                updatePresetHighlight(null);
                updateLive(currentPt + 'pt');
            };
        }

        if (incBtn) {
            incBtn.onclick = (e) => {
                const step = e.shiftKey ? 5 : 1;
                currentPt = currentPt + step;
                if (currentPt > parseFloat(slider.max)) {
                    slider.max = currentPt + 20;
                }
                slider.value = currentPt;
                numberInput.value = currentPt;
                updatePresetHighlight(null);
                updateLive(currentPt + 'pt');
            };
        }

        presetBtns.forEach(btn => {
            btn.onclick = () => {
                const mult = btn.dataset.multiplier;
                if (mult === 'normal') {
                    numberInput.value = '';
                    slider.value = Math.round(computedFsPt * 1.25);
                    currentPt = Math.round(computedFsPt * 1.25);
                    updatePresetHighlight('normal');
                    updateLive('normal', true);
                } else {
                    const m = parseFloat(mult);
                    currentPt = Math.max(1, Math.round(computedFsPt * m));
                    if (currentPt > parseFloat(slider.max)) {
                        slider.max = currentPt + 20;
                    }
                    slider.value = currentPt;
                    numberInput.value = currentPt;
                    updatePresetHighlight(mult);
                    updateLive(currentPt + 'pt');
                }
            };
        });
    }

    function cleanup(isConfirmed) {
        window._dialogCancelHook = null;

        // Clean up CSS Custom Highlight
        if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
            try { CSS.highlights.delete('line-spacing-selection'); } catch(e) {}
        }

        targetEl.classList.remove('op-line-spacing-active-target');

        if (!isConfirmed) {
            // Revert on cancel
            content.style.lineHeight = initialLineHeight;
            const styledChildren = content.querySelectorAll('[style*="line-height"]');
            styledChildren.forEach(child => {
                child.style.lineHeight = initialLineHeight;
            });

            if (typeof window.updateSelectionObserver === 'function') {
                window.updateSelectionObserver();
            } else if (typeof window.renderSelectionOverlays === 'function') {
                window.renderSelectionOverlays();
            }
            if (typeof window.updateThumbnails === 'function') {
                window.updateThumbnails();
            }
        } else {
            // Push history on confirm
            if (typeof pushHistory === 'function') {
                pushHistory();
            }
        }

        // Keep targetEl selected and focused
        state.selectedEl = targetEl;
        targetEl.classList.add('selected');

        content.focus();
        if (savedRange) {
            try {
                const curSel = window.getSelection();
                curSel.removeAllRanges();
                curSel.addRange(savedRange);
                state.lastRange = savedRange;
            } catch(e) {}
        }

        if (typeof updateFloatToolbarValues === 'function') {
            updateFloatToolbarValues();
        }
    }
};

window.applyExactLineSpacing = function(val) {
    if (state.selectedEl) {
        const targetEl = state.selectedEl;
        let content = targetEl.querySelector('.element-content') || targetEl;
        if (content) {
            content.style.lineHeight = val;
            const styledChildren = content.querySelectorAll('[style*="line-height"]');
            styledChildren.forEach(child => {
                child.style.lineHeight = val;
            });

            if (typeof pushHistory === 'function') pushHistory();
            if (typeof window.updateSelectionObserver === 'function') {
                window.updateSelectionObserver();
            } else if (typeof window.renderSelectionOverlays === 'function') {
                window.renderSelectionOverlays();
            }
            if (typeof window.updateThumbnails === 'function') {
                window.updateThumbnails();
            }

            content.focus();
            if (state.lastRange && content.contains(state.lastRange.commonAncestorContainer)) {
                try {
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(state.lastRange);
                } catch(e) {}
            }
        }
    }
};
