/**
 * OpenPublisher - Size & Position (Object Dimensions) Engine & Dialog (v5.22.14)
 * Implements GitHub Issue #12: Numerical positioning and sizing for canvas objects
 * (Text boxes, pictures, shapes, tables, WordArt, etc.) with physical unit precision
 * (cm, in, mm, pt, px), aspect ratio locking, live canvas synchronization, and
 * acrylic glass Properties sidebar matching Greeting Card Factory Deluxe 27.
 */

(function(window) {
    'use strict';

    // ==========================================
    // 1. DIMENSION CONTROL SERVICE
    // ==========================================
    const DimensionControlService = {
        _isSyncing: false,
        _activeModalEl: null,
        _modalInitialSnapshot: null,

        getActiveUnit: function() {
            if (typeof state !== 'undefined' && state.unit) {
                return state.unit;
            }
            return 'cm';
        },

        getDpi: function() {
            if (typeof state !== 'undefined' && state.dpi) {
                return state.dpi;
            }
            return 96;
        },

        getCurrentValues: function(el) {
            if (!el) return null;
            const unit = this.getActiveUnit();
            const dpi = this.getDpi();

            let leftPx = parseFloat(el.style.left);
            if (isNaN(leftPx)) leftPx = el.offsetLeft || 0;

            let topPx = parseFloat(el.style.top);
            if (isNaN(topPx)) topPx = el.offsetTop || 0;

            let widthPx = parseFloat(el.style.width);
            if (isNaN(widthPx) || widthPx <= 0) widthPx = el.offsetWidth || 100;

            let heightPx = parseFloat(el.style.height);
            if (isNaN(heightPx) || heightPx <= 0) heightPx = el.offsetHeight || 40;

            const ucs = window.UnitConversionService;
            const xVal = ucs ? ucs.fromPixels(leftPx, unit, dpi) : leftPx;
            const yVal = ucs ? ucs.fromPixels(topPx, unit, dpi) : topPx;
            const wVal = ucs ? ucs.fromPixels(widthPx, unit, dpi) : widthPx;
            const hVal = ucs ? ucs.fromPixels(heightPx, unit, dpi) : heightPx;

            let rotDeg = 0;
            const tr = el.style.transform || '';
            const rotMatch = tr.match(/rotate\(([-\d.]+)deg\)/);
            if (rotMatch) {
                rotDeg = Math.round((parseFloat(rotMatch[1]) || 0) * 10) / 10;
            }

            const isLocked = el.getAttribute('data-aspect-lock') === 'true';
            let aspectRatio = parseFloat(el.getAttribute('data-aspect-ratio'));
            if (!aspectRatio || isNaN(aspectRatio) || aspectRatio <= 0) {
                aspectRatio = (widthPx / heightPx) || 1;
                el.setAttribute('data-aspect-ratio', aspectRatio);
            }

            return {
                el: el,
                unit: unit,
                dpi: dpi,
                leftPx: leftPx,
                topPx: topPx,
                widthPx: widthPx,
                heightPx: heightPx,
                x: this.formatValue(xVal, unit),
                y: this.formatValue(yVal, unit),
                w: this.formatValue(wVal, unit),
                h: this.formatValue(hVal, unit),
                xRaw: xVal,
                yRaw: yVal,
                wRaw: wVal,
                hRaw: hVal,
                rotation: rotDeg,
                isLocked: isLocked,
                aspectRatio: aspectRatio
            };
        },

        formatValue: function(val, unit) {
            const num = parseFloat(val) || 0;
            const u = (unit || this.getActiveUnit()).toLowerCase();
            if (u === 'in' || u === 'cm') {
                return num.toFixed(2);
            }
            if (u === 'mm' || u === 'pt') {
                return num.toFixed(1);
            }
            return String(Math.round(num));
        },

        parseInputDimension: function(str, defaultUnit) {
            if (str === null || str === undefined) return null;
            if (typeof str !== 'string') str = String(str);
            str = str.trim();
            if (!str) return null;

            let unit = defaultUnit || this.getActiveUnit();
            let numStr = str;

            const unitMatch = str.match(/(cm|mm|in|inch|inches|pt|px)$/i);
            if (unitMatch) {
                let matched = unitMatch[1].toLowerCase();
                if (matched === 'inch' || matched === 'inches') matched = 'in';
                unit = matched;
                numStr = str.substring(0, str.length - unitMatch[0].length).trim();
            }

            numStr = numStr.replace(',', '.');
            const num = parseFloat(numStr);
            if (isNaN(num)) return null;

            return { value: num, unit: unit };
        },

        toPixels: function(valObj, dpi) {
            if (!valObj) return 0;
            const d = dpi || this.getDpi();
            const { value, unit } = valObj;
            const u = (unit || 'px').toLowerCase();

            if (u === 'pt') {
                return Math.round((value / 72) * d);
            }
            if (window.UnitConversionService) {
                return window.UnitConversionService.toPixels(value, u, d);
            }
            // Fallback math
            switch (u) {
                case 'in': return Math.round(value * d);
                case 'cm': return Math.round((value / 2.54) * d);
                case 'mm': return Math.round((value / 25.4) * d);
                default: return Math.round(value);
            }
        },

        fromPixelsToUnit: function(px, unit, dpi) {
            const d = dpi || this.getDpi();
            const u = (unit || this.getActiveUnit()).toLowerCase();
            if (u === 'pt') {
                return (px / d) * 72;
            }
            if (window.UnitConversionService) {
                return window.UnitConversionService.fromPixels(px, u, d);
            }
            switch (u) {
                case 'in': return px / d;
                case 'cm': return (px / d) * 2.54;
                case 'mm': return (px / d) * 25.4;
                default: return px;
            }
        },

        getStepForUnit: function(unit, isShift) {
            const u = (unit || this.getActiveUnit()).toLowerCase();
            switch (u) {
                case 'cm': return isShift ? 0.5 : 0.1;
                case 'in': return isShift ? 0.5 : 0.1;
                case 'mm': return isShift ? 5.0 : 1.0;
                case 'pt': return isShift ? 6.0 : 1.0;
                case 'px':
                default: return isShift ? 10.0 : 1.0;
            }
        },

        applyDimensions: function(el, options, recordHistory = true) {
            if (!el) return;
            const current = this.getCurrentValues(el);
            if (!current) return;

            let newLeftPx = current.leftPx;
            let newTopPx = current.topPx;
            let newWidthPx = current.widthPx;
            let newHeightPx = current.heightPx;

            const dpi = current.dpi;
            const isLocked = (options.isLocked !== undefined) ? options.isLocked : current.isLocked;
            const aspectRatio = current.aspectRatio || 1;

            if (options.x !== undefined) {
                const parsedX = typeof options.x === 'object' ? options.x : this.parseInputDimension(options.x, current.unit);
                if (parsedX !== null) newLeftPx = this.toPixels(parsedX, dpi);
            }

            if (options.y !== undefined) {
                const parsedY = typeof options.y === 'object' ? options.y : this.parseInputDimension(options.y, current.unit);
                if (parsedY !== null) newTopPx = this.toPixels(parsedY, dpi);
            }

            let widthChanged = false;
            let heightChanged = false;

            if (options.w !== undefined) {
                const parsedW = typeof options.w === 'object' ? options.w : this.parseInputDimension(options.w, current.unit);
                if (parsedW !== null) {
                    const wPx = Math.max(10, this.toPixels(parsedW, dpi));
                    if (wPx !== newWidthPx) {
                        newWidthPx = wPx;
                        widthChanged = true;
                    }
                }
            }

            if (options.h !== undefined) {
                const parsedH = typeof options.h === 'object' ? options.h : this.parseInputDimension(options.h, current.unit);
                if (parsedH !== null) {
                    const hPx = Math.max(10, this.toPixels(parsedH, dpi));
                    if (hPx !== newHeightPx) {
                        newHeightPx = hPx;
                        heightChanged = true;
                    }
                }
            }

            // Proportional constraint enforcement
            if (isLocked) {
                if (widthChanged && !heightChanged) {
                    newHeightPx = Math.max(10, Math.round(newWidthPx / aspectRatio));
                } else if (heightChanged && !widthChanged) {
                    newWidthPx = Math.max(10, Math.round(newHeightPx * aspectRatio));
                }
            } else if (widthChanged || heightChanged) {
                el.setAttribute('data-aspect-ratio', (newWidthPx / newHeightPx) || 1);
            }

            // Apply styles to canvas element
            el.style.left = newLeftPx + 'px';
            el.style.top = newTopPx + 'px';
            el.style.width = newWidthPx + 'px';
            el.style.height = newHeightPx + 'px';

            if (options.isLocked !== undefined) {
                el.setAttribute('data-aspect-lock', options.isLocked ? 'true' : 'false');
            }

            if (options.rotation !== undefined) {
                const rotDeg = parseFloat(options.rotation) || 0;
                let trans = el.style.transform || '';
                if (trans.includes('rotate')) {
                    trans = trans.replace(/rotate\([-\d.]+deg\)/, `rotate(${rotDeg}deg)`);
                } else {
                    trans = (trans + ` rotate(${rotDeg}deg)`).trim();
                }
                el.style.transform = trans;
            }

            // Trigger element sub-components updates
            if (typeof window.refreshBetaWordArt === 'function') window.refreshBetaWordArt(el);
            if (typeof window.refreshSmartArrow === 'function') window.refreshSmartArrow(el);
            if (el.getAttribute('data-type') === 'progress-bar' && window.ProgressBarEngine && typeof window.ProgressBarEngine.refreshElement === 'function') {
                window.ProgressBarEngine.refreshElement(el);
            }
            if (el.hasAttribute('data-border-art') && window.BorderArtEngine && typeof window.BorderArtEngine.refreshElement === 'function') {
                window.BorderArtEngine.refreshElement(el);
            }

            if (recordHistory && typeof updateThumbnails === 'function') updateThumbnails();
            if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
            if (recordHistory && typeof pushHistory === 'function') pushHistory();

            this.sync(el);
        },

        onRibbonInputChange: function(dim, val) {
            const el = (typeof state !== 'undefined') ? state.selectedEl : null;
            if (!el) return;

            const unit = this.getActiveUnit();
            const parsed = this.parseInputDimension(val, unit);
            if (!parsed) {
                this.sync(el);
                return;
            }

            const patch = {};
            patch[dim] = parsed;
            this.applyDimensions(el, patch, true);
        },

        onInputKeyDown: function(e, dim, inputEl) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.onRibbonInputChange(dim, inputEl.value);
                inputEl.blur();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.stepRibbon(dim, 1, e);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.stepRibbon(dim, -1, e);
            }
        },

        stepRibbon: function(dim, dir, e, recordHistory = true) {
            const el = (typeof state !== 'undefined') ? state.selectedEl : null;
            if (!el) return;

            const current = this.getCurrentValues(el);
            if (!current) return;

            const isShift = e && e.shiftKey;
            const step = this.getStepForUnit(current.unit, isShift);

            let curVal = 0;
            if (dim === 'x') curVal = current.xRaw;
            else if (dim === 'y') curVal = current.yRaw;
            else if (dim === 'w') curVal = current.wRaw;
            else if (dim === 'h') curVal = current.hRaw;

            let nextVal = curVal + (dir * step);
            if (dim === 'w' || dim === 'h') {
                const minVal = this.fromPixelsToUnit(10, current.unit, current.dpi);
                nextVal = Math.max(minVal, nextVal);
            }

            const patch = {};
            patch[dim] = { value: nextVal, unit: current.unit };
            this.applyDimensions(el, patch, recordHistory);
        },

        _spinTimer: null,
        _spinTimeout: null,
        _spinActive: false,
        _spinGlobalStopHandler: null,

        holdSpinRibbon: function(dim, dir, e) {
            if (e && e.button !== undefined && e.button !== 0) return;
            this.stopSpinRibbon(false);

            const el = (typeof state !== 'undefined') ? state.selectedEl : null;
            if (!el) return;

            const isShift = !!(e && e.shiftKey);
            this._spinActive = true;

            const tick = () => {
                if (!this._spinActive) return;
                this.stepRibbon(dim, dir, { shiftKey: isShift }, false);
            };

            tick();

            this._spinTimeout = setTimeout(() => {
                if (!this._spinActive) return;
                this._spinTimer = setInterval(tick, 75);
            }, 400);

            if (!this._spinGlobalStopHandler) {
                this._spinGlobalStopHandler = () => this.stopSpinRibbon(true);
                window.addEventListener('mouseup', this._spinGlobalStopHandler, true);
                window.addEventListener('blur', this._spinGlobalStopHandler);
            }
        },

        stopSpinRibbon: function(commit = true) {
            clearTimeout(this._spinTimeout);
            clearInterval(this._spinTimer);
            this._spinTimeout = null;
            this._spinTimer = null;

            const wasActive = this._spinActive;
            this._spinActive = false;

            if (this._spinGlobalStopHandler) {
                window.removeEventListener('mouseup', this._spinGlobalStopHandler, true);
                window.removeEventListener('blur', this._spinGlobalStopHandler);
                this._spinGlobalStopHandler = null;
            }

            if (commit && wasActive) {
                if (typeof updateThumbnails === 'function') updateThumbnails();
                if (typeof pushHistory === 'function') pushHistory();
            }
        },

        toggleAspectLock: function(locked) {
            const el = (typeof state !== 'undefined') ? state.selectedEl : null;
            if (!el) return;
            el.setAttribute('data-aspect-lock', locked ? 'true' : 'false');
            if (locked) {
                const w = parseFloat(el.style.width) || el.offsetWidth || 1;
                const h = parseFloat(el.style.height) || el.offsetHeight || 1;
                el.setAttribute('data-aspect-ratio', (w / h) || 1);
            }
            if (typeof pushHistory === 'function') pushHistory();
            this.sync(el);
        },

        sync: function(el) {
            if (this._isSyncing) return;
            this._isSyncing = true;
            try {
                const target = el || ((typeof state !== 'undefined') ? state.selectedEl : null);
                const values = target ? this.getCurrentValues(target) : null;
                const activeUnit = this.getActiveUnit();

                // 1. Synchronize all Ribbon input elements
                document.querySelectorAll('.ribbon-dim-input').forEach(input => {
                    const dim = input.getAttribute('data-dim');
                    if (document.activeElement === input) return; // Keep user focus intact
                    if (!values) {
                        input.value = '';
                        input.placeholder = '--';
                        input.disabled = true;
                    } else {
                        input.disabled = false;
                        if (dim === 'x') input.value = values.x;
                        else if (dim === 'y') input.value = values.y;
                        else if (dim === 'w') input.value = values.w;
                        else if (dim === 'h') input.value = values.h;
                    }
                });

                // Synchronize unit badges in ribbons
                document.querySelectorAll('.ribbon-dim-unit').forEach(badge => {
                    badge.innerText = activeUnit;
                });

                // Synchronize aspect lock checkboxes in ribbons
                document.querySelectorAll('.ribbon-dim-lock').forEach(cb => {
                    if (!values) {
                        cb.checked = false;
                        cb.disabled = true;
                    } else {
                        cb.disabled = false;
                        cb.checked = values.isLocked;
                    }
                });

                // 2. Synchronize Dimensions Sidebar (if open)
                const sbX = document.getElementById('sidebar-dim-x');
                const sbY = document.getElementById('sidebar-dim-y');
                const sbW = document.getElementById('sidebar-dim-w');
                const sbH = document.getElementById('sidebar-dim-h');
                const sbLock = document.getElementById('sidebar-dim-lock');
                const sbUnit = document.getElementById('sidebar-dim-unit-select');

                if (sbX && document.activeElement !== sbX) sbX.value = values ? `${values.x} ${activeUnit}` : '';
                if (sbY && document.activeElement !== sbY) sbY.value = values ? `${values.y} ${activeUnit}` : '';
                if (sbW && document.activeElement !== sbW) sbW.value = values ? `${values.w} ${activeUnit}` : '';
                if (sbH && document.activeElement !== sbH) sbH.value = values ? `${values.h} ${activeUnit}` : '';
                if (sbLock) sbLock.checked = values ? values.isLocked : false;
                if (sbUnit && activeUnit) sbUnit.value = activeUnit;

                // 3. Synchronize Size & Position Dialog (if open)
                const dlgX = document.getElementById('sp-input-x');
                const dlgY = document.getElementById('sp-input-y');
                const dlgW = document.getElementById('sp-input-w');
                const dlgH = document.getElementById('sp-input-h');
                const dlgRot = document.getElementById('sp-input-rot');
                const dlgLock = document.getElementById('sp-input-lock');

                if (dlgX && document.activeElement !== dlgX) dlgX.value = values ? values.x : '0.00';
                if (dlgY && document.activeElement !== dlgY) dlgY.value = values ? values.y : '0.00';
                if (dlgW && document.activeElement !== dlgW) dlgW.value = values ? values.w : '0.00';
                if (dlgH && document.activeElement !== dlgH) dlgH.value = values ? values.h : '0.00';
                if (dlgRot && document.activeElement !== dlgRot) dlgRot.value = values ? values.rotation : 0;
                if (dlgLock) dlgLock.checked = values ? values.isLocked : false;

            } finally {
                this._isSyncing = false;
            }
        }
    };

    window.DimensionControlService = DimensionControlService;

    // Backward-compatible alias for existing ribbon calls
    if (!window.ContextRibbonActions) window.ContextRibbonActions = {};
    window.ContextRibbonActions.updateElementSize = function(dim, val) {
        DimensionControlService.onRibbonInputChange(dim, val);
    };
    window.ContextRibbonActions.toggleAspectLock = function(locked) {
        DimensionControlService.toggleAspectLock(locked);
    };

    // ==========================================
    // 2. DEDICATED SIZE & POSITION MODAL DIALOG
    // ==========================================
    window.showSizePositionModal = function(targetEl) {
        let el = targetEl || ((typeof state !== 'undefined') ? state.selectedEl : null);

        if (!el) {
            // Check if any element is on paper and auto-select
            const paper = document.getElementById('paper');
            if (paper) {
                const firstEl = paper.querySelector('.pub-element');
                if (firstEl && typeof selectElement === 'function') {
                    selectElement(firstEl);
                    el = firstEl;
                }
            }
        }

        if (!el) {
            if (typeof DialogSystem !== 'undefined') {
                DialogSystem.alert('Notice', 'Please select a text box, picture, or shape to adjust its size and position.');
            } else {
                alert('Please select an object first.');
            }
            return;
        }

        DimensionControlService._activeModalEl = el;
        const initialDims = DimensionControlService.getCurrentValues(el);
        DimensionControlService._modalInitialSnapshot = {
            left: el.style.left,
            top: el.style.top,
            width: el.style.width,
            height: el.style.height,
            transform: el.style.transform,
            lock: el.getAttribute('data-aspect-lock')
        };

        const unit = initialDims.unit;
        let overlay = document.getElementById('custom-dialog-overlay');
        if (!overlay && typeof DialogSystem !== 'undefined') {
            DialogSystem.init();
            overlay = document.getElementById('custom-dialog-overlay');
        }
        if (!overlay) return;

        const modalHtml = `
            <style>
                .sp-modal-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    width: 480px;
                    max-width: 90vw;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                    color: var(--ui-text, #1e293b);
                }
                .sp-section-card {
                    background: rgba(255, 255, 255, 0.7);
                    border: 1px solid var(--ui-border, #e2e8f0);
                    border-radius: 8px;
                    padding: 12px 14px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                }
                body.dark-mode .sp-section-card {
                    background: rgba(30, 41, 59, 0.6);
                    border-color: #334155;
                    color: #f8fafc;
                }
                .sp-card-title {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--ui-theme-color, #0d9e8f);
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .sp-grid-2x2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px 14px;
                }
                .sp-field {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .sp-field label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--ui-text, #475569);
                    display: flex;
                    justify-content: space-between;
                }
                body.dark-mode .sp-field label {
                    color: #94a3b8;
                }
                .sp-input-with-unit {
                    display: flex;
                    align-items: center;
                    border: 1px solid var(--ui-border, #cbd5e1);
                    border-radius: 5px;
                    background: var(--ui-panel-bg, #fff);
                    overflow: hidden;
                    height: 28px;
                    transition: border-color 0.15s ease;
                }
                .sp-input-with-unit:hover,
                .sp-input-with-unit:focus-within {
                    border-color: var(--ui-theme-dark, #004d48);
                }
                body.dark-mode .sp-input-with-unit {
                    background: #0f172a;
                    border-color: #334155;
                }
                body.dark-mode .sp-input-with-unit:hover,
                body.dark-mode .sp-input-with-unit:focus-within {
                    border-color: var(--ui-theme-color, #14b8a6);
                }
                .sp-input-with-unit input {
                    flex: 1;
                    border: none;
                    outline: none;
                    padding: 4px 8px;
                    font-size: 13px;
                    font-family: inherit;
                    color: var(--ui-theme-dark, #004d48);
                    background: transparent;
                    min-width: 0;
                }
                body.dark-mode .sp-input-with-unit input {
                    color: #f8fafc;
                }
                .sp-unit-badge {
                    padding: 0 9px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #ffffff;
                    background: var(--ui-theme-dark, #004d48);
                    border-left: 1px solid var(--ui-theme-dark, #004d48);
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    user-select: none;
                }
                body.dark-mode .sp-unit-badge {
                    background: var(--ui-theme-dark, #005a54);
                    border-left-color: var(--ui-theme-dark, #005a54);
                    color: #ffffff;
                }
                .sp-stepper-btn {
                    width: 20px;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #64748b;
                    font-size: 10px;
                    transition: background 0.15s;
                }
                .sp-stepper-btn:hover {
                    background: rgba(0,0,0,0.06);
                    color: var(--ui-theme-color, #0d9e8f);
                }
                body.dark-mode .sp-stepper-btn:hover {
                    background: rgba(255,255,255,0.1);
                }
                .sp-checkbox-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    cursor: pointer;
                    user-select: none;
                    margin-top: 8px;
                }
                .sp-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-shrink: 0;
                }
                .sp-header-actions .custom-dialog-close {
                    width: 34px;
                    height: 34px;
                    font-size: 17px;
                    border-radius: 8px;
                    padding: 0;
                    border: none;
                }
                .sp-help-icon-btn:hover,
                body.dark-mode .sp-help-icon-btn:hover {
                    background: rgba(255, 255, 255, 0.25) !important;
                    color: #ffffff !important;
                }
                .sp-align-btns {
                    display: flex;
                    gap: 6px;
                    margin-top: 4px;
                }
                .sp-align-btn {
                    flex: 1;
                    padding: 5px 8px;
                    font-size: 11px;
                    font-weight: 500;
                    border: 1px solid var(--ui-border, #cbd5e1);
                    border-radius: 4px;
                    background: #fff;
                    color: var(--ui-text, #334155);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    transition: all 0.15s;
                }
                body.dark-mode .sp-align-btn {
                    background: #1e293b;
                    border-color: #334155;
                    color: #cbd5e1;
                }
                .sp-align-btn:hover {
                    background: color-mix(in srgb, var(--ui-theme-color, #0d9e8f) 10%, transparent);
                    border-color: var(--ui-theme-color, #0d9e8f);
                    color: var(--ui-theme-color, #0d9e8f);
                }
            </style>
            <div class="custom-dialog" id="custom-dialog-box" style="transform: translate(0px, 0px);">
                <div class="custom-dialog-header" id="custom-dialog-header">
                    <span style="display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-arrows-alt" style="font-size:14px;"></i> Size and Position
                    </span>
                    <div class="sp-header-actions">
                        <span role="button" tabindex="0" class="custom-dialog-close sp-help-icon-btn" onclick="window.showSizePositionHelp(event)" title="Size and Position Help" aria-label="Size and Position Help"><i class="fas fa-question"></i></span>
                        <span role="button" tabindex="0" class="custom-dialog-close" onclick="window.closeSizePositionModal(true)" title="Close" aria-label="Close"><i class="fas fa-times"></i></span>
                    </div>
                </div>
                <div class="custom-dialog-body">
                    <div class="sp-modal-container">
                        <!-- SECTION 1: POSITION -->
                        <div class="sp-section-card">
                            <div class="sp-card-title"><i class="fas fa-crosshairs"></i> Object Position (From Page Origin)</div>
                            <div class="sp-grid-2x2">
                                <div class="sp-field">
                                    <label>Horizontal (X Position):</label>
                                    <div class="sp-input-with-unit">
                                        <input type="text" id="sp-input-x" value="${initialDims.x}" onkeydown="if(event.key==='Enter') window.applySizePositionFromDialog(false);">
                                        <div class="sp-unit-badge" id="sp-unit-badge-x">${unit}</div>
                                    </div>
                                </div>
                                <div class="sp-field">
                                    <label>Vertical (Y Position):</label>
                                    <div class="sp-input-with-unit">
                                        <input type="text" id="sp-input-y" value="${initialDims.y}" onkeydown="if(event.key==='Enter') window.applySizePositionFromDialog(false);">
                                        <div class="sp-unit-badge" id="sp-unit-badge-y">${unit}</div>
                                    </div>
                                </div>
                            </div>
                            <div style="font-size:10px; color:#64748b; margin-top:6px;">Reference: Top-Left corner of document page. You can type values like <code>8.4 cm</code>, <code>2.5 in</code>, or <code>120 px</code>.</div>
                        </div>

                        <!-- SECTION 2: SIZE & DIMENSIONS -->
                        <div class="sp-section-card">
                            <div class="sp-card-title"><i class="fas fa-expand"></i> Dimensions & Scale</div>
                            <div class="sp-grid-2x2">
                                <div class="sp-field">
                                    <label>Width (W):</label>
                                    <div class="sp-input-with-unit">
                                        <input type="text" id="sp-input-w" value="${initialDims.w}" onkeydown="if(event.key==='Enter') window.applySizePositionFromDialog(false);">
                                        <div class="sp-unit-badge" id="sp-unit-badge-w">${unit}</div>
                                    </div>
                                </div>
                                <div class="sp-field">
                                    <label>Height (H):</label>
                                    <div class="sp-input-with-unit">
                                        <input type="text" id="sp-input-h" value="${initialDims.h}" onkeydown="if(event.key==='Enter') window.applySizePositionFromDialog(false);">
                                        <div class="sp-unit-badge" id="sp-unit-badge-h">${unit}</div>
                                    </div>
                                </div>
                            </div>
                            <label class="sp-checkbox-row">
                                <input type="checkbox" id="sp-input-lock" ${initialDims.isLocked ? 'checked' : ''} style="cursor:pointer; accent-color:var(--ui-theme-color);">
                                <span>Lock aspect ratio (Proportional resize)</span>
                            </label>
                        </div>

                        <!-- SECTION 3: ROTATION & ALIGNMENT -->
                        <div class="sp-section-card">
                            <div class="sp-card-title"><i class="fas fa-sync-alt"></i> Rotation & Page Centering</div>
                            <div class="sp-grid-2x2">
                                <div class="sp-field">
                                    <label>Rotation Angle:</label>
                                    <div class="sp-input-with-unit">
                                        <input type="number" id="sp-input-rot" value="${initialDims.rotation}" step="1" onkeydown="if(event.key==='Enter') window.applySizePositionFromDialog(false);">
                                        <div class="sp-unit-badge">deg (&deg;)</div>
                                    </div>
                                </div>
                                <div class="sp-field">
                                    <label>Quick Page Centering:</label>
                                    <div class="sp-align-btns">
                                        <button class="sp-align-btn" onclick="window.centerObjectInDialog('h')"><i class="fas fa-arrows-alt-h"></i> Horizontal</button>
                                        <button class="sp-align-btn" onclick="window.centerObjectInDialog('v')"><i class="fas fa-arrows-alt-v"></i> Vertical</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="custom-dialog-footer" style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <button class="btn-secondary" onclick="window.resetObjectNaturalSize()" title="Reset to natural size" style="font-size:11px; padding:5px 10px;">Reset Size</button>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-secondary" onclick="window.closeSizePositionModal(true)">Cancel</button>
                        <button class="btn-secondary" onclick="window.applySizePositionFromDialog(false)" title="Apply changes immediately to canvas">Apply</button>
                        <button class="btn-primary" onclick="window.applySizePositionFromDialog(true)">OK</button>
                    </div>
                </div>
            </div>
        `;

        overlay.innerHTML = modalHtml;
        overlay.style.display = 'flex';

        if (typeof DialogSystem !== 'undefined' && DialogSystem.makeDraggable) {
            DialogSystem.makeDraggable(document.getElementById('custom-dialog-box'), document.getElementById('custom-dialog-header'));
        }

        const firstInput = document.getElementById('sp-input-x');
        if (firstInput) {
            firstInput.focus();
            firstInput.select();
        }
    };

    window.closeSizePositionModal = function(revert = false) {
        const overlay = document.getElementById('custom-dialog-overlay');
        const el = DimensionControlService._activeModalEl;

        if (revert && el && DimensionControlService._modalInitialSnapshot) {
            const snap = DimensionControlService._modalInitialSnapshot;
            el.style.left = snap.left;
            el.style.top = snap.top;
            el.style.width = snap.width;
            el.style.height = snap.height;
            el.style.transform = snap.transform;
            if (snap.lock) el.setAttribute('data-aspect-lock', snap.lock);
            else el.removeAttribute('data-aspect-lock');

            if (typeof updateThumbnails === 'function') updateThumbnails();
            if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
            DimensionControlService.sync(el);
        }

        if (overlay) overlay.style.display = 'none';
        DimensionControlService._activeModalEl = null;
        DimensionControlService._modalInitialSnapshot = null;
    };

    window.applySizePositionFromDialog = function(closeAfterApply = false) {
        const el = DimensionControlService._activeModalEl;
        if (!el) return;

        const valX = document.getElementById('sp-input-x')?.value;
        const valY = document.getElementById('sp-input-y')?.value;
        const valW = document.getElementById('sp-input-w')?.value;
        const valH = document.getElementById('sp-input-h')?.value;
        const valRot = document.getElementById('sp-input-rot')?.value;
        const isLocked = document.getElementById('sp-input-lock')?.checked;

        DimensionControlService.applyDimensions(el, {
            x: valX,
            y: valY,
            w: valW,
            h: valH,
            rotation: valRot,
            isLocked: isLocked
        }, true);

        if (closeAfterApply) {
            window.closeSizePositionModal(false);
        }
    };

    window.centerObjectInDialog = function(axis) {
        const el = DimensionControlService._activeModalEl;
        if (!el) return;
        const paper = document.getElementById('paper');
        if (!paper) return;

        const pW = paper.clientWidth || 800;
        const pH = paper.clientHeight || 1100;
        const eW = el.offsetWidth || 100;
        const eH = el.offsetHeight || 50;

        const unit = DimensionControlService.getActiveUnit();
        const dpi = DimensionControlService.getDpi();

        if (axis === 'h') {
            const centerLeftPx = Math.max(0, Math.round((pW / 2) - (eW / 2)));
            el.style.left = centerLeftPx + 'px';
            const xVal = DimensionControlService.fromPixelsToUnit(centerLeftPx, unit, dpi);
            const xInput = document.getElementById('sp-input-x');
            if (xInput) xInput.value = DimensionControlService.formatValue(xVal, unit);
        } else if (axis === 'v') {
            const centerTopPx = Math.max(0, Math.round((pH / 2) - (eH / 2)));
            el.style.top = centerTopPx + 'px';
            const yVal = DimensionControlService.fromPixelsToUnit(centerTopPx, unit, dpi);
            const yInput = document.getElementById('sp-input-y');
            if (yInput) yInput.value = DimensionControlService.formatValue(yVal, unit);
        }

        if (typeof updateThumbnails === 'function') updateThumbnails();
        if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
        if (typeof pushHistory === 'function') pushHistory();
        DimensionControlService.sync(el);
    };

    window.resetObjectNaturalSize = function() {
        const el = DimensionControlService._activeModalEl;
        if (!el) return;

        const img = el.querySelector('img');
        if (img && img.naturalWidth && img.naturalHeight) {
            const unit = DimensionControlService.getActiveUnit();
            const dpi = DimensionControlService.getDpi();
            el.style.width = img.naturalWidth + 'px';
            el.style.height = img.naturalHeight + 'px';

            const wVal = DimensionControlService.fromPixelsToUnit(img.naturalWidth, unit, dpi);
            const hVal = DimensionControlService.fromPixelsToUnit(img.naturalHeight, unit, dpi);

            const wInput = document.getElementById('sp-input-w');
            const hInput = document.getElementById('sp-input-h');
            if (wInput) wInput.value = DimensionControlService.formatValue(wVal, unit);
            if (hInput) hInput.value = DimensionControlService.formatValue(hVal, unit);

            if (typeof updateThumbnails === 'function') updateThumbnails();
            if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
            if (typeof pushHistory === 'function') pushHistory();
            DimensionControlService.sync(el);
        }
    };

    window.showSizePositionHelp = function(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        const existingHelp = document.getElementById('op-size-position-help-modal');
        if (existingHelp) existingHelp.remove();

        const topics = [
            {
                id: 'overview',
                title: 'Overview & Quick Start',
                body: `
                    <p><strong>Size and Position</strong> lets you place and resize any text box, picture, shape, WordArt, or table with exact numerical precision without needing rulers.</p>
                    <ul>
                        <li><strong>Position (X, Y):</strong> Sets the horizontal and vertical coordinates from the top-left corner of the document page.</li>
                        <li><strong>Dimensions (W, H):</strong> Sets the exact width and height of the selected object.</li>
                        <li><strong>Apply vs. OK:</strong> Click <em>Apply</em> to preview your exact numbers on the page immediately without closing the dialog, or click <em>OK</em> to commit and close.</li>
                    </ul>
                `
            },
            {
                id: 'ribbon',
                title: 'Ribbon Controls & Hold-to-Spin',
                body: `
                    <p>When any object is selected, the contextual Ribbon tab (such as <strong>Text Box Tools</strong>, <strong>Picture Tools</strong>, or <strong>Drawing Tools</strong>) displays the <strong>Size &amp; Position</strong> group.</p>
                    <ul>
                        <li><strong>Direct Typing:</strong> Type any value into <code>X</code>, <code>Y</code>, <code>W</code>, or <code>H</code> and press <strong>Enter</strong> (or click away) to update immediately.</li>
                        <li><strong>Hold-to-Spin Arrows:</strong> Click or hold the up/down arrows next to any box to continuously nudge or resize the object smoothly. Hold <strong>Shift</strong> while clicking or pressing <strong>Arrow Up / Down</strong> for larger steps.</li>
                        <li><strong>Home &amp; Dialog Launcher:</strong> Open this full precision dialog anytime from the Ribbon <strong>Dialog</strong> button, <strong>Home &rarr; Size &amp; Position</strong>, or by right-clicking an object and choosing <strong>Size and Position...</strong>.</li>
                    </ul>
                `
            },
            {
                id: 'units',
                title: 'Units & Decimal Separators',
                body: `
                    <p>Values automatically display in your document's active measurement unit (defaulting to <code>cm</code>).</p>
                    <ul>
                        <li><strong>Supported Inline Units:</strong> Even if the document is set to centimeters, you can type a unit suffix directly into any box, such as <code>8.4 cm</code>, <code>2.5 in</code>, <code>45 mm</code>, <code>72 pt</code>, or <code>120 px</code>.</li>
                        <li><strong>Decimal Separators:</strong> Both periods (<code>8.40</code>) and commas (<code>8,40</code>) are supported seamlessly.</li>
                    </ul>
                `
            },
            {
                id: 'aspect-rotation',
                title: 'Aspect Ratio, Rotation & Centering',
                body: `
                    <p>Keep proportions intact, set exact rotation angles, or center objects on the page in one click.</p>
                    <ul>
                        <li><strong>Lock Aspect Ratio:</strong> When checked, changing Width automatically adjusts Height proportionally (and vice versa).</li>
                        <li><strong>Rotation Angle:</strong> Enter an exact degree value (<code>0&deg;</code> to <code>360&deg;</code>).</li>
                        <li><strong>Quick Page Centering:</strong> Use <strong>Horizontal</strong> or <strong>Vertical</strong> to center the selected object precisely on the current page.</li>
                        <li><strong>Reset Size:</strong> Restores an image to its original natural pixel dimensions.</li>
                    </ul>
                `
            },
            {
                id: 'sidebar',
                title: 'Dimensions Sidebar & Undo',
                body: `
                    <p>Keep an always-accessible precision panel docked on the right side of the workspace.</p>
                    <ul>
                        <li><strong>Dimensions Pane:</strong> Toggle it from <strong>View &rarr; Show &rarr; Dimensions</strong> to view and edit <code>X</code>, <code>Y</code>, <code>W</code>, <code>H</code>, switch units, or use directional nudge buttons.</li>
                        <li><strong>Two-Way Sync &amp; Undo:</strong> Dragging or resizing on the page updates all numeric fields automatically, and every committed change supports <strong>Ctrl+Z</strong> Undo.</li>
                    </ul>
                `
            }
        ];

        const helpOverlay = document.createElement('div');
        helpOverlay.id = 'op-size-position-help-modal';
        helpOverlay.className = 'sp-help-overlay';
        helpOverlay.innerHTML = `
            <style>
                .sp-help-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.14);
                    z-index: 1000030;
                    display: flex; align-items: center; justify-content: center;
                    padding: 16px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .sp-help-box {
                    width: 660px; max-width: 94vw; height: 460px; max-height: 86vh;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #1e293b);
                    border: 1px solid var(--ui-border, #94a3b8); border-radius: 8px;
                    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.28);
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .sp-help-header {
                    padding: 6px 8px 6px 14px;
                    background: linear-gradient(135deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #004a46));
                    color: #ffffff; display: flex; align-items: center; justify-content: space-between;
                    user-select: none; min-height: 44px; box-sizing: border-box; cursor: grab;
                }
                .sp-help-header:active { cursor: grabbing; }
                .sp-help-header .custom-dialog-close {
                    width: 34px; height: 34px; font-size: 17px; border-radius: 8px; padding: 0;
                }
                .sp-help-toolbar {
                    display: flex; align-items: center; justify-content: space-between; gap: 8px;
                    padding: 6px 12px; background: var(--ui-surface-bg, #f1f4f6);
                    border-bottom: 1px solid var(--ui-border, #cbd5e1); font-size: 12px;
                }
                body.dark-mode .sp-help-toolbar { background: #1e293b; border-color: #334155; }
                .sp-help-nav-btns { display: flex; align-items: center; gap: 4px; }
                .sp-xp-tool-btn {
                    display: inline-flex; align-items: center; gap: 5px;
                    padding: 4px 10px; font-size: 11.5px; font-weight: 600;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-theme-dark, #004a46);
                    border: 1px solid var(--ui-border, #cbd5e1); border-radius: 4px; cursor: pointer;
                }
                body.dark-mode .sp-xp-tool-btn { background: #0f172a; color: #e2e8f0; border-color: #475569; }
                .sp-xp-tool-btn:hover:not(:disabled) { border-color: var(--ui-theme-color, #007670); background: rgba(0, 118, 112, 0.08); }
                .sp-xp-tool-btn:disabled { opacity: 0.45; cursor: default; }
                .sp-help-split {
                    flex: 1; display: grid; grid-template-columns: 210px 1fr; min-height: 0;
                }
                .sp-help-toc {
                    background: var(--ui-surface-bg, #f8fafc); border-right: 1px solid var(--ui-border, #cbd5e1);
                    padding: 10px 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 3px;
                }
                body.dark-mode .sp-help-toc { background: #0f172a; border-right-color: #334155; }
                .sp-help-toc-head {
                    font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
                    color: var(--ui-theme-color, #007670); padding: 2px 6px 6px;
                }
                .sp-help-topic-btn {
                    width: 100%; text-align: left; border: 1px solid transparent; background: transparent;
                    color: var(--ui-text, #1e293b); padding: 7px 9px; border-radius: 4px;
                    font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 7px;
                }
                body.dark-mode .sp-help-topic-btn { color: #e2e8f0; }
                .sp-help-topic-btn i { color: var(--ui-theme-color, #007670); font-size: 11px; flex-shrink: 0; }
                .sp-help-topic-btn:hover { background: rgba(0, 118, 112, 0.08); }
                .sp-help-topic-btn.active {
                    background: var(--ui-theme-color, #007670); color: #ffffff; font-weight: 700;
                }
                .sp-help-topic-btn.active i { color: #ffffff; }
                .sp-help-pane {
                    padding: 16px 20px; overflow-y: auto; font-size: 13px; line-height: 1.55;
                }
                .sp-help-pane h4 {
                    margin: 0 0 10px; font-size: 16px; color: var(--ui-theme-color, #007670);
                    border-bottom: 1px solid var(--ui-border, #e2e8f0); padding-bottom: 6px;
                }
                .sp-help-pane ul { margin: 8px 0 0; padding-left: 18px; }
                .sp-help-pane li { margin-bottom: 7px; }
                .sp-help-pane code {
                    padding: 1px 5px; border-radius: 3px; font-size: 11.5px;
                    background: rgba(0, 118, 112, 0.1); color: var(--ui-theme-dark, #004a46);
                }
                body.dark-mode .sp-help-pane code { background: rgba(45, 212, 191, 0.15); color: #5eead4; }
                .sp-help-footer {
                    padding: 9px 14px; border-top: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-surface-bg, #f8fafc); display: flex; justify-content: flex-end;
                }
                body.dark-mode .sp-help-footer { background: #1e293b; border-top-color: #334155; }
                .sp-help-ok {
                    padding: 6px 18px; border-radius: 5px; border: none; font-weight: 700; font-size: 12.5px;
                    background: var(--ui-theme-color, #007670); color: #ffffff; cursor: pointer;
                }
                .sp-help-ok:hover { background: var(--ui-theme-dark, #004a46); }
                @media (max-width: 560px) {
                    .sp-help-split { grid-template-columns: 1fr; }
                    .sp-help-toc { max-height: 130px; border-right: none; border-bottom: 1px solid var(--ui-border, #cbd5e1); }
                }
            </style>
            <div class="sp-help-box" id="sp-help-box" role="dialog" aria-modal="true" aria-labelledby="sp-help-title">
                <div class="sp-help-header" id="sp-help-header">
                    <span id="sp-help-title" style="display:flex; align-items:center; gap:8px; font-weight:700; font-size:13.5px;">
                        <i class="fas fa-book-open"></i> Size &amp; Position Help
                    </span>
                    <button type="button" class="custom-dialog-close" id="sp-help-close-x" aria-label="Close Help">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="sp-help-toolbar">
                    <div class="sp-help-nav-btns">
                        <button type="button" class="sp-xp-tool-btn" id="sp-help-back-btn" disabled><i class="fas fa-arrow-left"></i> Back</button>
                        <button type="button" class="sp-xp-tool-btn" id="sp-help-fwd-btn" disabled>Forward <i class="fas fa-arrow-right"></i></button>
                    </div>
                    <span id="sp-help-breadcrumb" style="font-weight:600; opacity:0.8;">Overview &amp; Quick Start</span>
                </div>
                <div class="sp-help-split">
                    <div class="sp-help-toc">
                        <div class="sp-help-toc-head">Contents</div>
                        ${topics.map((t, i) => `
                            <button type="button" class="sp-help-topic-btn${i === 0 ? ' active' : ''}" data-topic-id="${t.id}">
                                <i class="fas fa-file-alt"></i><span>${t.title}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="sp-help-pane" id="sp-help-content"></div>
                </div>
                <div class="sp-help-footer">
                    <button type="button" class="sp-help-ok" id="sp-help-ok-btn">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(helpOverlay);
        const helpBox = helpOverlay.querySelector('#sp-help-box');
        const helpHeader = helpOverlay.querySelector('#sp-help-header');
        if (typeof DialogSystem !== 'undefined' && DialogSystem.makeDraggable) {
            DialogSystem.makeDraggable(helpBox, helpHeader);
        }

        const history = [topics[0].id];
        let histIdx = 0;

        const renderTopic = (topicId, pushHist) => {
            const topic = topics.find(t => t.id === topicId) || topics[0];
            if (pushHist && history[histIdx] !== topic.id) {
                history.splice(histIdx + 1);
                history.push(topic.id);
                histIdx = history.length - 1;
            }
            helpOverlay.querySelectorAll('.sp-help-topic-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.topicId === topic.id);
            });
            helpOverlay.querySelector('#sp-help-breadcrumb').textContent = topic.title;
            helpOverlay.querySelector('#sp-help-content').innerHTML = `<h4>${topic.title}</h4>${topic.body}`;
            helpOverlay.querySelector('#sp-help-back-btn').disabled = histIdx <= 0;
            helpOverlay.querySelector('#sp-help-fwd-btn').disabled = histIdx >= history.length - 1;
        };

        renderTopic(topics[0].id, false);

        helpOverlay.querySelectorAll('.sp-help-topic-btn').forEach(btn => {
            btn.addEventListener('click', () => renderTopic(btn.dataset.topicId, true));
        });
        helpOverlay.querySelector('#sp-help-back-btn').addEventListener('click', () => {
            if (histIdx > 0) {
                histIdx--;
                renderTopic(history[histIdx], false);
            }
        });
        helpOverlay.querySelector('#sp-help-fwd-btn').addEventListener('click', () => {
            if (histIdx < history.length - 1) {
                histIdx++;
                renderTopic(history[histIdx], false);
            }
        });

        const closeHelp = () => {
            document.removeEventListener('keydown', onEscHelp, true);
            helpOverlay.remove();
        };
        const onEscHelp = (ev) => {
            if (ev.key === 'Escape') {
                ev.preventDefault();
                ev.stopPropagation();
                closeHelp();
            }
        };
        document.addEventListener('keydown', onEscHelp, true);

        helpOverlay.querySelector('#sp-help-close-x').addEventListener('click', closeHelp);
        helpOverlay.querySelector('#sp-help-ok-btn').addEventListener('click', closeHelp);
        helpOverlay.addEventListener('click', (ev) => {
            if (ev.target === helpOverlay) closeHelp();
        });
    };

    // ==========================================
    // 3. DIMENSIONS SIDEBAR PANE (GREETING CARD FACTORY PARITY)
    // ==========================================
    window.toggleDimensionsPane = function() {
        let panel = document.getElementById('op-dimensions-sidebar');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'op-dimensions-sidebar';
            panel.className = 'sidebar-panel op-sidebar visible';
            panel.innerHTML = `
                <div class="op-sidebar-header">
                    <span class="op-sidebar-title" style="display:flex; align-items:center; gap:8px;">
                        <i class="fas fa-ruler-combined" style="color:var(--ui-theme-color);"></i> Dimensions & Position
                    </span>
                    <div class="op-sidebar-top-btns">
                        <button class="sp-help-icon-btn" onclick="window.showSizePositionHelp(event)" title="Dimensions Help" style="color:#64748b; font-size:12px; margin-right:6px;"><i class="fas fa-question"></i></button>
                        <button class="custom-dialog-close" onclick="document.getElementById('op-dimensions-sidebar').classList.remove('visible')"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <!-- SECTION: DIMENSIONS (MATCHING SCREENSHOT) -->
                <div class="op-sidebar-section">
                    <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--ui-theme-color); margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                        <span>Dimensions</span>
                        <select id="sidebar-dim-unit-select" style="font-size:10px; padding:2px 4px; border-radius:4px; border:1px solid #cbd5e1; background:#fff;" onchange="state.unit=this.value; DimensionControlService.sync();">
                            <option value="cm">cm</option>
                            <option value="in">in</option>
                            <option value="mm">mm</option>
                            <option value="pt">pt</option>
                            <option value="px">px</option>
                        </select>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                        <div>
                            <label style="font-size:11px; font-weight:600; color:#475569; display:block; margin-bottom:2px;">X:</label>
                            <input type="text" id="sidebar-dim-x" placeholder="0,00 cm" style="width:100%; box-sizing:border-box; padding:5px 8px; font-size:12px; border:1px solid #cbd5e1; border-radius:4px;" onkeydown="if(event.key==='Enter') window.applySidebarDimensions();">
                        </div>
                        <div>
                            <label style="font-size:11px; font-weight:600; color:#475569; display:block; margin-bottom:2px;">Y:</label>
                            <input type="text" id="sidebar-dim-y" placeholder="0,00 cm" style="width:100%; box-sizing:border-box; padding:5px 8px; font-size:12px; border:1px solid #cbd5e1; border-radius:4px;" onkeydown="if(event.key==='Enter') window.applySidebarDimensions();">
                        </div>
                        <div>
                            <label style="font-size:11px; font-weight:600; color:#475569; display:block; margin-bottom:2px;">W:</label>
                            <input type="text" id="sidebar-dim-w" placeholder="8,40 cm" style="width:100%; box-sizing:border-box; padding:5px 8px; font-size:12px; border:1px solid #cbd5e1; border-radius:4px;" onkeydown="if(event.key==='Enter') window.applySidebarDimensions();">
                        </div>
                        <div>
                            <label style="font-size:11px; font-weight:600; color:#475569; display:block; margin-bottom:2px;">H:</label>
                            <input type="text" id="sidebar-dim-h" placeholder="2,97 cm" style="width:100%; box-sizing:border-box; padding:5px 8px; font-size:12px; border:1px solid #cbd5e1; border-radius:4px;" onkeydown="if(event.key==='Enter') window.applySidebarDimensions();">
                        </div>
                    </div>
                    <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer; margin-bottom:10px; user-select:none;">
                        <input type="checkbox" id="sidebar-dim-lock" style="cursor:pointer; accent-color:var(--ui-theme-color);" onchange="DimensionControlService.toggleAspectLock(this.checked);">
                        <span>Lock aspect ratio</span>
                    </label>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-primary" style="flex:1; padding:6px; font-size:12px; justify-content:center;" onclick="window.applySidebarDimensions()">Apply</button>
                        <button class="btn-secondary" style="flex:1; padding:6px; font-size:12px; justify-content:center;" onclick="window.showSizePositionModal()">Edit...</button>
                    </div>
                </div>

                <!-- SECTION: NUDGE CONTROLS -->
                <div class="op-sidebar-section">
                    <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--ui-theme-color); margin-bottom:10px;">Move & Resize Nudge</div>
                    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
                        <button class="op-sidebar-btn" style="justify-content:center; padding:6px 0; margin-bottom:0;" onclick="DimensionControlService.stepRibbon('y', -1)" title="Move Up"><i class="fas fa-arrow-up"></i></button>
                        <button class="op-sidebar-btn" style="justify-content:center; padding:6px 0; margin-bottom:0;" onclick="DimensionControlService.stepRibbon('y', 1)" title="Move Down"><i class="fas fa-arrow-down"></i></button>
                        <button class="op-sidebar-btn" style="justify-content:center; padding:6px 0; margin-bottom:0;" onclick="DimensionControlService.stepRibbon('x', -1)" title="Move Left"><i class="fas fa-arrow-left"></i></button>
                        <button class="op-sidebar-btn" style="justify-content:center; padding:6px 0; margin-bottom:0;" onclick="DimensionControlService.stepRibbon('x', 1)" title="Move Right"><i class="fas fa-arrow-right"></i></button>
                    </div>
                    <div style="display:flex; gap:6px; margin-top:8px;">
                        <button class="op-sidebar-btn" style="flex:1; justify-content:center; font-size:11px; padding:6px 0; margin-bottom:0;" onclick="DimensionControlService.stepRibbon('w', 1)" title="Wider"><i class="fas fa-expand-arrows-alt"></i> Width +</button>
                        <button class="op-sidebar-btn" style="flex:1; justify-content:center; font-size:11px; padding:6px 0; margin-bottom:0;" onclick="DimensionControlService.stepRibbon('h', 1)" title="Taller"><i class="fas fa-arrows-alt-v"></i> Height +</button>
                    </div>
                </div>
            `;
            document.body.appendChild(panel);
        } else {
            panel.classList.toggle('visible');
        }

        if (panel.classList.contains('visible')) {
            DimensionControlService.sync();
        }
    };

    window.applySidebarDimensions = function() {
        const el = (typeof state !== 'undefined') ? state.selectedEl : null;
        if (!el) return;

        const valX = document.getElementById('sidebar-dim-x')?.value;
        const valY = document.getElementById('sidebar-dim-y')?.value;
        const valW = document.getElementById('sidebar-dim-w')?.value;
        const valH = document.getElementById('sidebar-dim-h')?.value;
        const isLocked = document.getElementById('sidebar-dim-lock')?.checked;

        DimensionControlService.applyDimensions(el, {
            x: valX,
            y: valY,
            w: valW,
            h: valH,
            isLocked: isLocked
        }, true);
    };

})(window);
