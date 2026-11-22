// Open Publisher Variable Font Studio, Quick Axes Popover & Help Modal (v5.23.0)
(function(window) {
    'use strict';

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function isEditableInput(el) {
        return !!(el && el.tagName && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName.toUpperCase()));
    }

    function isInteractivePopoverTarget(el) {
        if (!el || !el.tagName) return false;
        if (['INPUT', 'TEXTAREA', 'SELECT', 'LABEL', 'BUTTON', 'OPTION'].includes(el.tagName.toUpperCase())) return true;
        return !!(el.closest && el.closest('label, button, .op-vf-modern-select, .op-vf-select-menu, .op-vf-spinner, .op-vf-pop-hdr, .custom-dialog-close'));
    }

    const activeSelectMenus = [];

    function closeAllVfSelectMenus() {
        for (let i = activeSelectMenus.length - 1; i >= 0; i--) {
            const entry = activeSelectMenus[i];
            if (!entry.menu || !entry.menu.isConnected) {
                activeSelectMenus.splice(i, 1);
                continue;
            }
            entry.menu.style.display = 'none';
            if (entry.trigger) {
                entry.trigger.classList.remove('active');
                entry.trigger.setAttribute('aria-expanded', 'false');
            }
        }
    }

    function cleanupSelectMenus(ownerTag) {
        for (let i = activeSelectMenus.length - 1; i >= 0; i--) {
            const entry = activeSelectMenus[i];
            if (!ownerTag || entry.owner === ownerTag || !entry.sel || !entry.sel.isConnected) {
                if (entry.menu && entry.menu.parentNode) entry.menu.parentNode.removeChild(entry.menu);
                activeSelectMenus.splice(i, 1);
            }
        }
    }

    function enhanceVfSelects(rootEl, ownerTag) {
        if (!rootEl) return;
        const selects = Array.from(rootEl.querySelectorAll('select.op-vf-select'));
        selects.forEach(sel => {
            if (!sel.parentNode || sel.dataset.vfEnhanced === '1') return;
            sel.dataset.vfEnhanced = '1';
            sel.style.display = 'none';

            const wrap = document.createElement('div');
            wrap.className = 'op-vf-select-wrap';
            if (sel.style.marginBottom) wrap.style.marginBottom = sel.style.marginBottom;

            const trigger = document.createElement('div');
            trigger.className = 'modern-select op-vf-modern-select';
            trigger.tabIndex = 0;
            trigger.setAttribute('role', 'combobox');
            trigger.setAttribute('aria-expanded', 'false');

            const labelSpan = document.createElement('span');
            labelSpan.className = 'op-vf-select-value';

            const arrowBox = document.createElement('div');
            arrowBox.className = 'arrow-box';
            arrowBox.innerHTML = '<i class="fas fa-chevron-down" style="font-size:10px;"></i>';

            trigger.appendChild(labelSpan);
            trigger.appendChild(arrowBox);
            wrap.appendChild(trigger);
            sel.parentNode.insertBefore(wrap, sel);
            wrap.appendChild(sel);

            const menu = document.createElement('div');
            menu.className = 'op-vf-select-menu';
            menu.setAttribute('data-vf-menu-owner', ownerTag || 'studio');
            menu.style.display = 'none';

            const isFamilySelect = (sel.id === 'op-vf-family-select');

            const syncDisplay = () => {
                const chosen = sel.options[sel.selectedIndex] || sel.options[0];
                labelSpan.textContent = chosen ? chosen.text : '';
                if (isFamilySelect && chosen) {
                    labelSpan.style.fontFamily = `"${chosen.value}", sans-serif`;
                }
                Array.from(menu.children).forEach((item, idx) => {
                    item.classList.toggle('selected', idx === sel.selectedIndex);
                });
            };

            Array.from(sel.options).forEach((opt, idx) => {
                const item = document.createElement('div');
                item.className = 'op-vf-select-option';
                item.textContent = opt.text;
                item.dataset.value = opt.value;
                if (isFamilySelect && opt.value) {
                    item.style.fontFamily = `"${opt.value}", sans-serif`;
                }
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sel.selectedIndex = idx;
                    syncDisplay();
                    closeAllVfSelectMenus();
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                });
                menu.appendChild(item);
            });

            document.body.appendChild(menu);

            const openMenu = (e) => {
                if (e) e.stopPropagation();
                const wasOpen = menu.style.display === 'block';
                closeAllVfSelectMenus();
                if (wasOpen) return;

                syncDisplay();
                const rect = trigger.getBoundingClientRect();
                menu.style.width = rect.width + 'px';
                menu.style.left = Math.max(8, Math.min(window.innerWidth - rect.width - 8, rect.left)) + 'px';
                menu.style.display = 'block';
                trigger.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');

                const menuH = Math.min(230, menu.scrollHeight || 160);
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                if (spaceBelow < menuH + 8 && spaceAbove > spaceBelow) {
                    menu.style.top = Math.max(8, rect.top - menuH - 3) + 'px';
                } else {
                    menu.style.top = Math.min(window.innerHeight - menuH - 8, rect.bottom + 3) + 'px';
                }

                const selectedOpt = menu.querySelector('.op-vf-select-option.selected');
                if (selectedOpt) selectedOpt.scrollIntoView({ block: 'nearest' });

                if (isFamilySelect) {
                    requestAnimationFrame(loadVisibleSelectFonts);
                }
            };

            const loadVisibleSelectFonts = () => {
                const eng = getEngine();
                if (!isFamilySelect || !eng || typeof eng.ensureFontLoaded !== 'function') return;
                const mRect = menu.getBoundingClientRect();
                if (!mRect || mRect.height <= 0) return;
                const topB = mRect.top - 100;
                const botB = mRect.bottom + 140;
                Array.from(menu.children).forEach(optEl => {
                    const r = optEl.getBoundingClientRect();
                    if (r.height > 0 && r.bottom >= topB && r.top <= botB && optEl.dataset.value) {
                        eng.ensureFontLoaded(optEl.dataset.value);
                    }
                });
            };

            if (isFamilySelect) {
                let selScrollRaf = null;
                menu.addEventListener('scroll', () => {
                    if (selScrollRaf) return;
                    selScrollRaf = requestAnimationFrame(() => {
                        selScrollRaf = null;
                        loadVisibleSelectFonts();
                    });
                }, { passive: true });
            }

            trigger.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            trigger.addEventListener('click', openMenu);
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openMenu(e);
                } else if (e.key === 'Escape') {
                    closeAllVfSelectMenus();
                }
            });

            sel.addEventListener('change', syncDisplay);
            sel.addEventListener('op-vf-sync', syncDisplay);
            syncDisplay();

            activeSelectMenus.push({ owner: ownerTag || 'studio', trigger, menu, sel });
        });
    }

    function makeDraggable(boxEl, handleEl) {
        if (!boxEl || !handleEl) return;
        handleEl.style.cursor = 'grab';
        handleEl.addEventListener('mousedown', function(e) {
            if (e.target.closest('button, .custom-dialog-close, .op-vf-help-btn, .op-vf-help-icon-btn')) return;
            const rect = boxEl.getBoundingClientRect();
            boxEl.style.transform = 'none';
            boxEl.style.margin = '0';
            boxEl.style.left = rect.left + 'px';
            boxEl.style.top = rect.top + 'px';
            const startX = e.clientX;
            const startY = e.clientY;
            const origLeft = rect.left;
            const origTop = rect.top;
            handleEl.style.cursor = 'grabbing';
            e.preventDefault();

            function onMove(ev) {
                const maxLeft = Math.max(0, window.innerWidth - 140);
                const maxTop = Math.max(0, window.innerHeight - 60);
                boxEl.style.left = Math.max(0, Math.min(maxLeft, origLeft + (ev.clientX - startX))) + 'px';
                boxEl.style.top = Math.max(0, Math.min(maxTop, origTop + (ev.clientY - startY))) + 'px';
            }
            function onUp() {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                handleEl.style.cursor = 'grab';
            }
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    function showNoticeModal(title, message, onConfirm) {
        const existing = document.getElementById('op-vf-notice-overlay');
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
        const wrap = document.createElement('div');
        wrap.id = 'op-vf-notice-overlay';
        wrap.className = 'op-vf-notice-overlay';
        const isConfirm = typeof onConfirm === 'function';
        wrap.innerHTML = `
            <div class="op-vf-notice-box" role="alertdialog" aria-modal="true">
                <div class="op-vf-notice-header">
                    <span style="display:flex;align-items:center;gap:8px;">
                        <img src="ui/icons/alert.png?v=5.24.2" alt="" style="width:20px;height:20px;object-fit:contain;">
                        <span>${escapeHtml(title)}</span>
                    </span>
                    <button type="button" class="custom-dialog-close" id="op-vf-notice-x" title="Close" aria-label="Close"><i class="fas fa-times"></i></button>
                </div>
                <div class="op-vf-notice-body">
                    <img src="ui/icons/alert.png?v=5.24.2" alt="Notice" style="width:40px;height:40px;object-fit:contain;flex-shrink:0;">
                    <div style="flex:1;line-height:1.45;">${escapeHtml(message)}</div>
                </div>
                <div class="op-vf-notice-footer">
                    ${isConfirm ? '<button type="button" class="op-vf-btn-secondary" id="op-vf-notice-cancel">Cancel</button>' : ''}
                    <button type="button" class="op-vf-btn-primary" id="op-vf-notice-ok">${isConfirm ? 'Confirm' : 'OK'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(wrap);
        const close = () => { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); };
        document.getElementById('op-vf-notice-x').onclick = close;
        const cancelBtn = document.getElementById('op-vf-notice-cancel');
        if (cancelBtn) cancelBtn.onclick = close;
        document.getElementById('op-vf-notice-ok').onclick = () => {
            close();
            if (isConfirm) onConfirm();
        };
    }

    const studioState = {
        isOpen: false,
        activeTab: 'axes',
        family: 'Roboto Flex',
        axes: {},
        opszMode: 'auto',
        showHiddenAxes: false,
        livePreview: true,
        specimenText: 'The quick brown fox jumps cleanly across axes',
        specimenPt: 28,
        altHeld: false,
        matrixX: 'wght',
        matrixY: 'wdth',
        libFilter: 'all',
        libSearch: '',
        targetEl: null,
        snapshotHTML: null,
        rafPending: false,
        popoverOpen: false
    };

    function getEngine() {
        return window.VariableFontsEngine;
    }

    function captureSnapshot() {
        if (!studioState.targetEl) {
            studioState.snapshotHTML = null;
            return;
        }
        const content = studioState.targetEl.querySelector('.element-content') || studioState.targetEl;
        studioState.snapshotHTML = content ? content.innerHTML : null;
    }

    function restoreSnapshot() {
        if (!studioState.targetEl || studioState.snapshotHTML === null) return;
        const content = studioState.targetEl.querySelector('.element-content') || studioState.targetEl;
        if (content) {
            content.innerHTML = studioState.snapshotHTML;
            if (studioState.targetEl.querySelector('.wa-text') && typeof window.syncWordArt === 'function') {
                window.syncWordArt(studioState.targetEl);
            }
            if (typeof window.forceRepaint === 'function') window.forceRepaint();
            if (typeof window.updateFloatToolbarValues === 'function') window.updateFloatToolbarValues();
        }
    }

    function initFromCanvasTarget() {
        const eng = getEngine();
        if (!eng) return;
        const info = eng.inspectTarget();
        studioState.targetEl = info.selectedEl || null;
        captureSnapshot();

        if (info.isVariable && info.fontDef) {
            studioState.family = info.fontDef.family;
            studioState.axes = Object.assign({}, info.axes);
            studioState.opszMode = info.opszMode || 'auto';
        } else {
            const firstVf = eng.CATALOG[0];
            studioState.family = firstVf.family;
            studioState.axes = {};
            firstVf.axes.forEach(a => { studioState.axes[a.tag] = a.default; });
            studioState.opszMode = 'auto';
        }
        if (info.sampleText && info.sampleText !== 'Click to edit text') {
            studioState.specimenText = info.sampleText.slice(0, 90);
        }
        syncDefaultMatrixAxes();
    }

    function syncDefaultMatrixAxes() {
        const eng = getEngine();
        const def = eng ? eng.getFontDef(studioState.family) : null;
        if (!def || !def.axes || def.axes.length === 0) return;
        const pool = studioState.showHiddenAxes ? def.axes : def.axes.filter(a => !a.hidden);
        const list = pool.length >= 2 ? pool : def.axes;
        if (!list.some(a => a.tag === studioState.matrixX)) {
            studioState.matrixX = list[0].tag;
        }
        if (!list.some(a => a.tag === studioState.matrixY) || studioState.matrixY === studioState.matrixX) {
            const second = list.find(a => a.tag !== studioState.matrixX);
            studioState.matrixY = second ? second.tag : list[0].tag;
        }
    }

    function resetAxesToDefault(familyName) {
        const eng = getEngine();
        const def = eng ? eng.getFontDef(familyName || studioState.family) : null;
        if (!def) return;
        const next = {};
        def.axes.forEach(a => { next[a.tag] = a.default; });
        studioState.axes = next;
    }

    function scheduleLiveCanvasSync() {
        if (!studioState.livePreview || !studioState.targetEl) return;
        if (studioState.rafPending) return;
        studioState.rafPending = true;
        requestAnimationFrame(() => {
            studioState.rafPending = false;
            const eng = getEngine();
            if (!eng) return;
            eng.applyVariation({
                family: studioState.family,
                axes: studioState.axes,
                opszMode: studioState.opszMode,
                skipHistory: true,
                targetEl: studioState.targetEl
            });
        });
    }

    function findMatchingInstanceName(def, axes) {
        if (!def || !Array.isArray(def.instances)) return '__custom__';
        for (const inst of def.instances) {
            const keys = Object.keys(inst.coords || {});
            const allMatch = keys.every(k => Math.abs((axes[k] ?? 0) - inst.coords[k]) < 0.05);
            if (allMatch) return inst.name;
        }
        return '__custom__';
    }

    function updateSpecimenPreview() {
        const eng = getEngine();
        if (!eng) return;
        const specBox = document.getElementById('op-vf-specimen-output');
        const cssChip = document.getElementById('op-vf-css-chip');
        const def = eng.getFontDef(studioState.family);
        const hiddenMap = {};
        if (def) {
            def.axes.forEach(a => {
                if (a.hidden && Math.abs((studioState.axes[a.tag] ?? a.default) - a.default) < 0.0001) {
                    hiddenMap[a.tag] = false;
                }
            });
        }
        const cssVar = eng.formatVariationSettings(studioState.axes, studioState.opszMode, hiddenMap);
        if (specBox) {
            specBox.style.fontFamily = `"${studioState.family}", sans-serif`;
            specBox.style.fontSize = studioState.specimenPt + 'pt';
            specBox.style.fontVariationSettings = cssVar;
            specBox.style.fontOpticalSizing = studioState.opszMode === 'auto' ? 'auto' : 'none';
            specBox.style.fontWeight = studioState.axes.wght !== undefined ? String(Math.round(studioState.axes.wght)) : '';
            specBox.style.fontStretch = studioState.axes.wdth !== undefined ? `${studioState.axes.wdth}%` : '';
            if (studioState.axes.slnt !== undefined) {
                specBox.style.fontStyle = Math.abs(studioState.axes.slnt) >= 0.1 ? `oblique ${parseFloat((-studioState.axes.slnt).toFixed(1))}deg` : 'normal';
            } else {
                specBox.style.fontStyle = '';
            }
            specBox.textContent = studioState.specimenText || 'The quick brown fox jumps cleanly';
        }
        if (cssChip) {
            cssChip.textContent = `font-variation-settings: ${cssVar};`;
            cssChip.title = cssChip.textContent;
        }
    }

    function snapToClosestNotch(axis, val, def, altHeld) {
        if (altHeld) return val;
        const span = Math.max(0.001, axis.max - axis.min);
        const snapThreshold = span * 0.018;
        const candidates = [axis.default];
        if (def && Array.isArray(def.instances)) {
            def.instances.forEach(inst => {
                if (inst.coords && inst.coords[axis.tag] !== undefined) {
                    candidates.push(inst.coords[axis.tag]);
                }
            });
        }
        for (const c of candidates) {
            if (Math.abs(val - c) <= snapThreshold) return c;
        }
        return val;
    }

    function getNotchPositions(axis, def) {
        const span = Math.max(0.001, axis.max - axis.min);
        const stops = new Set([axis.default]);
        if (def && Array.isArray(def.instances)) {
            def.instances.forEach(inst => {
                if (inst.coords && inst.coords[axis.tag] !== undefined) {
                    stops.add(inst.coords[axis.tag]);
                }
            });
        }
        return Array.from(stops).map(v => ({
            val: v,
            isDefault: Math.abs(v - axis.default) < 0.0001,
            pct: Math.max(0, Math.min(100, ((v - axis.min) / span) * 100))
        }));
    }

    function renderAxisSliderRow(axis, def, currentVal, isOpszAuto) {
        const eng = getEngine();
        const meta = (eng && eng.AXIS_META[axis.tag]) || {};
        const label = axis.name || meta.name || axis.tag;
        const unit = meta.unit ? ` ${meta.unit}` : '';
        const span = Math.max(0.001, axis.max - axis.min);
        const coarseStep = meta.step || (span <= 2 ? 0.05 : span <= 20 ? 0.5 : 1);
        const fineStep = meta.fineStep || (span <= 2 ? 0.01 : span <= 20 ? 0.1 : 0.5);
        const spinStep = span >= 200 ? 10 : (span <= 2 ? 0.05 : (span <= 20 ? 0.5 : 1));
        const activeStep = studioState.altHeld ? fineStep : coarseStep;
        const notches = getNotchPositions(axis, def);
        const isEdited = Math.abs(currentVal - axis.default) >= 0.0001;
        const locked = (axis.tag === 'opsz' && isOpszAuto);
        const disabledAttr = locked ? 'disabled' : '';

        return `
            <div class="op-vf-axis-row${axis.hidden ? ' is-hidden-axis' : ''}${locked ? ' is-auto-locked' : ''}" data-axis-tag="${axis.tag}">
                <div class="op-vf-axis-head">
                    <div class="op-vf-axis-title-wrap">
                        <span class="op-vf-axis-name">${escapeHtml(label)}</span>
                        <span class="op-vf-axis-tag" title="${escapeHtml(meta.desc || 'OpenType variation axis')}">${escapeHtml(axis.tag)}</span>
                        ${axis.hidden ? '<span class="op-vf-hidden-chip" title="Marked hidden in OpenType fvar table">Hidden</span>' : ''}
                    </div>
                    <div class="op-vf-axis-actions">
                        <div class="modern-spinner op-vf-spinner${locked ? ' is-disabled' : ''}" data-vf-spinner="${axis.tag}">
                            <input type="text" inputmode="decimal" class="op-vf-axis-num" data-vf-num="${axis.tag}" min="${axis.min}" max="${axis.max}" data-spin-step="${spinStep}" data-fine-step="${fineStep}" value="${parseFloat(Number(currentVal).toFixed(3))}" ${disabledAttr} />
                            <div class="spin-btns">
                                <div class="op-vf-spin-btn" data-vf-spin="${axis.tag}" data-dir="1" title="Increase ${escapeHtml(label)}"><i class="fas fa-chevron-up"></i></div>
                                <div class="op-vf-spin-btn" data-vf-spin="${axis.tag}" data-dir="-1" title="Decrease ${escapeHtml(label)}"><i class="fas fa-chevron-down"></i></div>
                            </div>
                        </div>
                        <span class="op-vf-axis-unit">${escapeHtml(unit)}</span>
                        <button type="button" class="op-vf-axis-reset" data-vf-reset="${axis.tag}" title="Reset ${escapeHtml(label)} to ${axis.default}" ${isEdited ? '' : 'disabled'}><i class="fas fa-undo"></i></button>
                    </div>
                </div>
                <div class="op-vf-slider-wrap">
                    <div class="op-vf-notch-track" aria-hidden="true">
                        ${notches.map(n => `<span class="op-vf-notch${n.isDefault ? ' is-default' : ''}" style="left:${n.pct.toFixed(2)}%;"></span>`).join('')}
                    </div>
                    <input type="range" class="op-vf-range" data-vf-range="${axis.tag}" min="${axis.min}" max="${axis.max}" step="${activeStep}" data-coarse-step="${coarseStep}" data-fine-step="${fineStep}" value="${currentVal}" ${disabledAttr} />
                </div>
                <div class="op-vf-axis-bounds">
                    <span>${axis.min}${escapeHtml(unit)}</span>
                    <span>Default: ${axis.default}${escapeHtml(unit)}</span>
                    <span>${axis.max}${escapeHtml(unit)}</span>
                </div>
            </div>
        `;
    }

    function wireAxisSpinners(container, def, onAxisValueChanged) {
        if (!container || !def) return;

        const commitValue = (tag, rawVal, shouldFormatInput) => {
            const axis = def.axes.find(a => a.tag === tag);
            if (!axis || isNaN(rawVal)) return;
            const clamped = Math.max(axis.min, Math.min(axis.max, rawVal));
            const val = parseFloat(Number(clamped).toFixed(3));
            const slider = container.querySelector(`[data-vf-range="${tag}"]`);
            const numInput = container.querySelector(`[data-vf-num="${tag}"]`);
            const resetBtn = container.querySelector(`[data-vf-reset="${tag}"]`);
            if (slider) slider.value = val;
            if (numInput && shouldFormatInput) numInput.value = val;
            if (resetBtn) resetBtn.disabled = Math.abs(val - axis.default) < 0.0001;
            if (typeof onAxisValueChanged === 'function') onAxisValueChanged(tag, val);
        };

        const stepAxis = (tag, dir, ev) => {
            const axis = def.axes.find(a => a.tag === tag);
            const numInput = container.querySelector(`[data-vf-num="${tag}"]`);
            if (!axis || !numInput || numInput.disabled) return;
            const alt = studioState.altHeld || !!(ev && ev.altKey);
            const spinStep = parseFloat(numInput.getAttribute('data-spin-step')) || 1;
            const fineStep = parseFloat(numInput.getAttribute('data-fine-step')) || 0.1;
            const delta = (alt ? fineStep : spinStep) * dir;
            const current = parseFloat(numInput.value);
            const base = isNaN(current) ? (studioState.axes[tag] ?? axis.default) : current;
            const next = parseFloat((base + delta).toFixed(4));
            commitValue(tag, next, true);
        };

        container.querySelectorAll('[data-vf-spin]').forEach(btn => {
            let holdDelay = null;
            let holdInterval = null;
            const stopHold = () => {
                if (holdDelay) { clearTimeout(holdDelay); holdDelay = null; }
                if (holdInterval) { clearInterval(holdInterval); holdInterval = null; }
            };
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                stopHold();
                const tag = btn.getAttribute('data-vf-spin');
                const dir = parseInt(btn.getAttribute('data-dir'), 10) || 1;
                stepAxis(tag, dir, e);
                holdDelay = setTimeout(() => {
                    holdInterval = setInterval(() => stepAxis(tag, dir, null), 60);
                }, 320);
                const onDocUp = () => {
                    stopHold();
                    document.removeEventListener('mouseup', onDocUp);
                    window.removeEventListener('blur', onDocUp);
                };
                document.addEventListener('mouseup', onDocUp);
                window.addEventListener('blur', onDocUp);
            });
            btn.addEventListener('mouseleave', stopHold);
        });

        container.querySelectorAll('[data-vf-num]').forEach(numInput => {
            numInput.addEventListener('keydown', function(e) {
                const tag = this.getAttribute('data-vf-num');
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    stepAxis(tag, e.key === 'ArrowUp' ? 1 : -1, e);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const parsed = parseFloat(this.value);
                    const axis = def.axes.find(a => a.tag === tag);
                    commitValue(tag, isNaN(parsed) ? (axis ? axis.default : 0) : parsed, true);
                    this.blur();
                }
            });
            numInput.addEventListener('input', function() {
                const s = String(this.value || '').trim();
                if (s === '' || s === '-' || s.endsWith('.')) return;
                const val = parseFloat(s);
                if (!isNaN(val)) {
                    commitValue(this.getAttribute('data-vf-num'), val, false);
                }
            });
            const normalizeOnCommit = function() {
                const tag = this.getAttribute('data-vf-num');
                const axis = def.axes.find(a => a.tag === tag);
                const parsed = parseFloat(this.value);
                commitValue(tag, isNaN(parsed) ? (axis ? axis.default : 0) : parsed, true);
            };
            numInput.addEventListener('change', normalizeOnCommit);
            numInput.addEventListener('blur', normalizeOnCommit);
        });
    }

    function wireAxisControlEvents(container) {
        const eng = getEngine();
        if (!eng || !container) return;
        const def = eng.getFontDef(studioState.family);
        if (!def) return;

        const syncStudioInstance = () => {
            const instSelect = document.getElementById('op-vf-instance-select');
            if (instSelect) {
                instSelect.value = findMatchingInstanceName(def, studioState.axes);
                instSelect.dispatchEvent(new Event('op-vf-sync'));
            }
        };

        container.querySelectorAll('[data-vf-range]').forEach(slider => {
            slider.addEventListener('input', function(e) {
                const tag = this.getAttribute('data-vf-range');
                const axis = def.axes.find(a => a.tag === tag);
                if (!axis) return;
                const alt = studioState.altHeld || (e && e.altKey);
                this.step = alt ? this.getAttribute('data-fine-step') : this.getAttribute('data-coarse-step');
                let val = parseFloat(this.value);
                val = snapToClosestNotch(axis, val, def, alt);
                this.value = val;
                studioState.axes[tag] = val;
                if (tag === 'opsz') {
                    studioState.opszMode = 'manual';
                    const manualRadio = document.getElementById('op-vf-opsz-manual');
                    if (manualRadio) manualRadio.checked = true;
                }
                const numInput = container.querySelector(`[data-vf-num="${tag}"]`);
                if (numInput) numInput.value = parseFloat(Number(val).toFixed(3));
                const resetBtn = container.querySelector(`[data-vf-reset="${tag}"]`);
                if (resetBtn) resetBtn.disabled = Math.abs(val - axis.default) < 0.0001;
                syncStudioInstance();
                updateSpecimenPreview();
                scheduleLiveCanvasSync();
            });
        });

        wireAxisSpinners(container, def, (tag, val) => {
            studioState.axes[tag] = val;
            if (tag === 'opsz') {
                studioState.opszMode = 'manual';
                const manualRadio = document.getElementById('op-vf-opsz-manual');
                if (manualRadio) manualRadio.checked = true;
            }
            syncStudioInstance();
            updateSpecimenPreview();
            scheduleLiveCanvasSync();
        });

        container.querySelectorAll('[data-vf-reset]').forEach(btn => {
            btn.addEventListener('click', function() {
                const tag = this.getAttribute('data-vf-reset');
                const axis = def.axes.find(a => a.tag === tag);
                if (!axis) return;
                studioState.axes[tag] = axis.default;
                const slider = container.querySelector(`[data-vf-range="${tag}"]`);
                const num = container.querySelector(`[data-vf-num="${tag}"]`);
                if (slider) slider.value = axis.default;
                if (num) num.value = axis.default;
                this.disabled = true;
                syncStudioInstance();
                updateSpecimenPreview();
                scheduleLiveCanvasSync();
            });
        });
    }

    let libPreviewObserver = null;

    function disconnectLibObserver() {
        if (libPreviewObserver) {
            libPreviewObserver.disconnect();
            libPreviewObserver = null;
        }
    }

    function renderStudioBody() {
        const body = document.getElementById('op-vf-tab-content');
        const eng = getEngine();
        if (!body || !eng) return;
        cleanupSelectMenus('studio');
        disconnectLibObserver();

        if (studioState.activeTab === 'axes') {
            const allVfs = eng.getAllVariableFonts().slice().sort((a, b) => a.family.localeCompare(b.family));
            const def = eng.getFontDef(studioState.family) || eng.CATALOG[0];
            const visibleAxes = def.axes.filter(a => !a.hidden);
            const hiddenAxes = def.axes.filter(a => a.hidden);
            const hasOpsz = def.axes.some(a => a.tag === 'opsz');
            const matchedInst = findMatchingInstanceName(def, studioState.axes);
            const infoNow = eng.inspectTarget();
            const activePt = infoNow.fontSizePt || 12;
            const userPresets = eng.getUserPresets().filter(p => p.family.toLowerCase() === def.family.toLowerCase());

            body.innerHTML = `
                <div class="op-vf-controls-top">
                    <div class="op-vf-field">
                        <label class="op-vf-label" for="op-vf-family-select">Variable Font Family (${allVfs.length})</label>
                        <select id="op-vf-family-select" class="op-vf-select">
                            ${allVfs.map(f => {
                                const vis = eng.getVisibleAxes ? eng.getVisibleAxes(f) : f.axes.filter(a => !a.hidden);
                                const hasCust = !!(eng.hasCustomAxes && eng.hasCustomAxes(f));
                                let axisSummary = `${vis.length} ${vis.length === 1 ? 'axis' : 'axes'}`;
                                if (hasCust) {
                                    const tags = vis.slice(0, 4).map(a => a.tag).join(', ');
                                    axisSummary = vis.length === 1 ? tags : `${vis.length} axes: ${tags}${vis.length > 4 ? '...' : ''}`;
                                }
                                return `<option value="${escapeHtml(f.family)}"${f.family.toLowerCase() === def.family.toLowerCase() ? ' selected' : ''}>${escapeHtml(f.family)} (${escapeHtml(axisSummary)}${f.isCustom ? ', Uploaded' : ''})</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <div class="op-vf-field">
                        <label class="op-vf-label" for="op-vf-instance-select">Named Instance</label>
                        <select id="op-vf-instance-select" class="op-vf-select">
                            <option value="__custom__"${matchedInst === '__custom__' ? ' selected' : ''}>Custom Axis Combination</option>
                            ${(def.instances || []).map(inst => `<option value="${escapeHtml(inst.name)}"${matchedInst === inst.name ? ' selected' : ''}>${escapeHtml(inst.name)}</option>`).join('')}
                        </select>
                    </div>
                </div>

                ${def.instances && def.instances.length > 0 ? `
                <div class="op-vf-instance-chips">
                    ${def.instances.map(inst => `<button type="button" class="op-vf-chip${matchedInst === inst.name ? ' active' : ''}" data-vf-inst="${escapeHtml(inst.name)}">${escapeHtml(inst.name)}</button>`).join('')}
                </div>` : ''}

                ${hasOpsz ? `
                <div class="op-vf-opsz-bar">
                    <div class="op-vf-opsz-left">
                        <strong>Optical Size (opsz):</strong>
                        <span class="op-vf-opsz-note">${studioState.opszMode === 'auto' ? `Auto-matching text size (~${activePt}pt)` : 'Manual axis override active'}</span>
                    </div>
                    <div class="op-vf-segmented">
                        <label><input type="radio" name="op-vf-opsz-mode" id="op-vf-opsz-auto" value="auto"${studioState.opszMode === 'auto' ? ' checked' : ''}><span>Auto (Match Size)</span></label>
                        <label><input type="radio" name="op-vf-opsz-mode" id="op-vf-opsz-manual" value="manual"${studioState.opszMode !== 'auto' ? ' checked' : ''}><span>Manual</span></label>
                    </div>
                </div>` : ''}

                <div class="op-vf-axes-toolbar">
                    <span class="op-vf-tip-text"><i class="fas fa-sliders-h"></i> Drag sliders along instance notches, or hold <b>Alt</b> / <b>Option</b> for fine decimal precision.</span>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span id="op-vf-fine-pill" class="op-vf-fine-pill${studioState.altHeld ? ' active' : ''}">Fine Adjust (Alt)</span>
                        <button type="button" class="op-vf-mini-action" id="op-vf-reset-all"><i class="fas fa-undo"></i> Reset All</button>
                    </div>
                </div>

                <div class="op-vf-axes-list" id="op-vf-axes-list">
                    ${visibleAxes.map(a => renderAxisSliderRow(a, def, studioState.axes[a.tag] ?? a.default, studioState.opszMode === 'auto')).join('')}
                </div>

                ${hiddenAxes.length > 0 ? `
                <div class="op-vf-hidden-section">
                    <label class="op-vf-hidden-toggle">
                        <input type="checkbox" id="op-vf-show-hidden"${studioState.showHiddenAxes ? ' checked' : ''}>
                        <span>Show hidden OpenType axes (${hiddenAxes.length})</span>
                    </label>
                    ${studioState.showHiddenAxes ? `
                    <div class="op-vf-hidden-warning">
                        <img src="ui/icons/alert.png?v=5.24.2" alt="Warning" style="width:22px;height:22px;object-fit:contain;flex-shrink:0;">
                        <span><strong>Hidden Axes Notice:</strong> These parametric axes are marked hidden in the OpenType <code>fvar</code> table because the font normally drives them internally. Direct edits may reduce typographic fidelity.</span>
                    </div>
                    <div class="op-vf-axes-list" id="op-vf-hidden-axes-list">
                        ${hiddenAxes.map(a => renderAxisSliderRow(a, def, studioState.axes[a.tag] ?? a.default, false)).join('')}
                    </div>` : ''}
                </div>` : ''}

                <div class="op-vf-presets-box">
                    <div class="op-vf-presets-head">
                        <span class="op-vf-label" style="margin:0;">Saved Axis Presets (${escapeHtml(def.family)})</span>
                        <div class="op-vf-preset-save-row">
                            <input type="text" id="op-vf-preset-name" class="op-vf-input-sm" placeholder="Preset name (e.g. Hero Poster)">
                            <button type="button" id="op-vf-save-preset-btn" class="op-vf-mini-action"><i class="fas fa-bookmark"></i> Save Preset</button>
                        </div>
                    </div>
                    <div class="op-vf-preset-chips">
                        ${userPresets.length === 0
                            ? '<span style="font-size:11.5px;opacity:0.7;">No saved presets for this font yet. Dial in axes and click Save Preset.</span>'
                            : userPresets.map(p => `<span class="op-vf-preset-pill"><button type="button" class="op-vf-preset-apply" data-preset-id="${escapeHtml(p.id)}">${escapeHtml(p.name)}</button><button type="button" class="op-vf-preset-del" data-preset-del="${escapeHtml(p.id)}" title="Delete preset">&times;</button></span>`).join('')}
                    </div>
                </div>
            `;

            document.getElementById('op-vf-family-select').onchange = async function() {
                studioState.family = this.value;
                resetAxesToDefault(this.value);
                syncDefaultMatrixAxes();
                await eng.ensureFontLoaded(this.value);
                renderStudioBody();
                updateSpecimenPreview();
                scheduleLiveCanvasSync();
            };

            const applyInstance = (instName) => {
                const inst = (def.instances || []).find(i => i.name === instName);
                if (!inst) return;
                Object.assign(studioState.axes, inst.coords);
                if (inst.coords.opsz !== undefined) studioState.opszMode = 'manual';
                renderStudioBody();
                updateSpecimenPreview();
                scheduleLiveCanvasSync();
            };

            document.getElementById('op-vf-instance-select').onchange = function() {
                if (this.value !== '__custom__') applyInstance(this.value);
            };
            body.querySelectorAll('[data-vf-inst]').forEach(btn => {
                btn.onclick = () => applyInstance(btn.getAttribute('data-vf-inst'));
            });

            body.querySelectorAll('input[name="op-vf-opsz-mode"]').forEach(radio => {
                radio.onchange = () => {
                    studioState.opszMode = radio.value;
                    renderStudioBody();
                    updateSpecimenPreview();
                    scheduleLiveCanvasSync();
                };
            });

            document.getElementById('op-vf-reset-all').onclick = () => {
                resetAxesToDefault(studioState.family);
                studioState.opszMode = 'auto';
                renderStudioBody();
                updateSpecimenPreview();
                scheduleLiveCanvasSync();
            };

            const hiddenChk = document.getElementById('op-vf-show-hidden');
            if (hiddenChk) {
                hiddenChk.onchange = () => {
                    studioState.showHiddenAxes = hiddenChk.checked;
                    renderStudioBody();
                };
            }

            document.getElementById('op-vf-save-preset-btn').onclick = () => {
                const inp = document.getElementById('op-vf-preset-name');
                const pName = (inp && inp.value.trim()) || `${def.family} Custom`;
                eng.saveUserPreset(pName, def.family, studioState.axes, studioState.opszMode);
                if (inp) inp.value = '';
                renderStudioBody();
            };

            body.querySelectorAll('.op-vf-preset-apply').forEach(btn => {
                btn.onclick = () => {
                    const pid = btn.getAttribute('data-preset-id');
                    const preset = eng.getUserPresets().find(p => p.id === pid);
                    if (!preset) return;
                    studioState.axes = Object.assign({}, studioState.axes, preset.axes);
                    studioState.opszMode = preset.opszMode || 'manual';
                    renderStudioBody();
                    updateSpecimenPreview();
                    scheduleLiveCanvasSync();
                };
            });
            body.querySelectorAll('.op-vf-preset-del').forEach(btn => {
                btn.onclick = () => {
                    eng.deleteUserPreset(btn.getAttribute('data-preset-del'));
                    renderStudioBody();
                };
            });

            wireAxisControlEvents(document.getElementById('op-vf-axes-list'));
            const hiddenListEl = document.getElementById('op-vf-hidden-axes-list');
            if (hiddenListEl) wireAxisControlEvents(hiddenListEl);
        } else if (studioState.activeTab === 'matrix') {
            const def = eng.getFontDef(studioState.family) || eng.CATALOG[0];
            const axesPool = studioState.showHiddenAxes ? def.axes : def.axes.filter(a => !a.hidden);
            if (axesPool.length < 2) {
                const multiExamples = ['Roboto Flex', 'Google Sans Flex', 'Fraunces', 'Recursive', 'Tilt Prism', 'Shantell Sans', 'Sixtyfour Convergence'];
                body.innerHTML = `
                    <div class="op-vf-single-axis-note">
                        <i class="fas fa-th" style="font-size:28px;color:var(--ui-theme-color,#007670);"></i>
                        <h4 style="margin:8px 0 4px;">${escapeHtml(def.family)} has 1 variable axis (${escapeHtml(def.axes[0].tag)})</h4>
                        <p style="margin:0 0 12px;font-size:12.5px;opacity:0.85;">The 2D Matrix Explorer plots any two axes simultaneously (such as Weight vs Width or Optical Size). Switch to a multi-axis variable font below to explore 2D interpolation:</p>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
                            ${multiExamples.map(m => `<button type="button" class="op-vf-chip" data-switch-vf="${escapeHtml(m)}">${escapeHtml(m)}</button>`).join('')}
                        </div>
                    </div>
                `;
                body.querySelectorAll('[data-switch-vf]').forEach(btn => {
                    btn.onclick = async () => {
                        studioState.family = btn.getAttribute('data-switch-vf');
                        resetAxesToDefault(studioState.family);
                        syncDefaultMatrixAxes();
                        await eng.ensureFontLoaded(studioState.family);
                        renderStudioBody();
                        updateSpecimenPreview();
                        scheduleLiveCanvasSync();
                    };
                });
                return;
            }

            syncDefaultMatrixAxes();
            const axX = axesPool.find(a => a.tag === studioState.matrixX) || axesPool[0];
            const axY = axesPool.find(a => a.tag === studioState.matrixY) || axesPool[1];
            const xVals = [0, 0.25, 0.5, 0.75, 1].map(t => parseFloat((axX.min + t * (axX.max - axX.min)).toFixed(2)));
            const yVals = [1, 0.75, 0.5, 0.25, 0].map(t => parseFloat((axY.min + t * (axY.max - axY.min)).toFixed(2)));
            const curX = studioState.axes[axX.tag] ?? axX.default;
            const curY = studioState.axes[axY.tag] ?? axY.default;
            const padXPct = Math.max(0, Math.min(100, ((curX - axX.min) / Math.max(0.001, axX.max - axX.min)) * 100));
            const padYPct = Math.max(0, Math.min(100, (1 - (curY - axY.min) / Math.max(0.001, axY.max - axY.min)) * 100));

            let cellsHtml = '';
            yVals.forEach(yv => {
                xVals.forEach(xv => {
                    const cellAxes = Object.assign({}, studioState.axes, { [axX.tag]: xv, [axY.tag]: yv });
                    const isNearest = Math.abs(xv - curX) <= (axX.max - axX.min) / 8 && Math.abs(yv - curY) <= (axY.max - axY.min) / 8;
                    const modeForCell = (axX.tag === 'opsz' || axY.tag === 'opsz') ? 'manual' : studioState.opszMode;
                    const fvs = eng.formatVariationSettings(cellAxes, modeForCell);
                    cellsHtml += `
                        <button type="button" class="op-vf-matrix-cell${isNearest ? ' active' : ''}" data-mx="${xv}" data-my="${yv}" title="${escapeHtml(axX.tag)}: ${xv} | ${escapeHtml(axY.tag)}: ${yv}">
                            <span class="op-vf-matrix-glyph" style="font-family:'${escapeHtml(def.family)}', sans-serif; font-variation-settings:${escapeHtml(fvs)}; font-optical-sizing:${modeForCell === 'auto' ? 'auto' : 'none'};">Aa</span>
                            <span class="op-vf-matrix-coords">${xv} / ${yv}</span>
                        </button>
                    `;
                });
            });

            body.innerHTML = `
                <div class="op-vf-controls-top" style="margin-bottom:10px;">
                    <div class="op-vf-field">
                        <label class="op-vf-label" for="op-vf-mx-select">Horizontal Axis (X)</label>
                        <select id="op-vf-mx-select" class="op-vf-select">
                            ${axesPool.map(a => `<option value="${a.tag}"${a.tag === axX.tag ? ' selected' : ''}>${escapeHtml((eng.AXIS_META[a.tag] && eng.AXIS_META[a.tag].name) || a.name || a.tag)} (${a.tag})</option>`).join('')}
                        </select>
                    </div>
                    <div class="op-vf-field">
                        <label class="op-vf-label" for="op-vf-my-select">Vertical Axis (Y)</label>
                        <select id="op-vf-my-select" class="op-vf-select">
                            ${axesPool.map(a => `<option value="${a.tag}"${a.tag === axY.tag ? ' selected' : ''}>${escapeHtml((eng.AXIS_META[a.tag] && eng.AXIS_META[a.tag].name) || a.name || a.tag)} (${a.tag})</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="op-vf-matrix-layout">
                    <div>
                        <div class="op-vf-label" style="margin-bottom:6px;">5x5 Specimen Grid (${escapeHtml(axX.tag)} x ${escapeHtml(axY.tag)})</div>
                        <div class="op-vf-matrix-grid">${cellsHtml}</div>
                    </div>
                    <div class="op-vf-xy-col">
                        <div class="op-vf-label" style="margin-bottom:6px;">Continuous XY Pad</div>
                        <div class="op-vf-xy-pad" id="op-vf-xy-pad">
                            <span class="op-vf-xy-cross-v" style="left:${padXPct.toFixed(1)}%;"></span>
                            <span class="op-vf-xy-cross-h" style="top:${padYPct.toFixed(1)}%;"></span>
                            <span class="op-vf-xy-dot" style="left:${padXPct.toFixed(1)}%; top:${padYPct.toFixed(1)}%;"></span>
                        </div>
                        <div class="op-vf-xy-readout" id="op-vf-xy-readout">${escapeHtml(axX.tag)}: ${parseFloat(Number(curX).toFixed(2))} &nbsp;|&nbsp; ${escapeHtml(axY.tag)}: ${parseFloat(Number(curY).toFixed(2))}</div>
                    </div>
                </div>
            `;

            document.getElementById('op-vf-mx-select').onchange = function() {
                studioState.matrixX = this.value;
                renderStudioBody();
            };
            document.getElementById('op-vf-my-select').onchange = function() {
                studioState.matrixY = this.value;
                renderStudioBody();
            };
            body.querySelectorAll('.op-vf-matrix-cell').forEach(cell => {
                cell.onclick = () => {
                    const xv = parseFloat(cell.getAttribute('data-mx'));
                    const yv = parseFloat(cell.getAttribute('data-my'));
                    studioState.axes[axX.tag] = xv;
                    studioState.axes[axY.tag] = yv;
                    if (axX.tag === 'opsz' || axY.tag === 'opsz') studioState.opszMode = 'manual';
                    renderStudioBody();
                    updateSpecimenPreview();
                    scheduleLiveCanvasSync();
                };
            });

            const pad = document.getElementById('op-vf-xy-pad');
            const readout = document.getElementById('op-vf-xy-readout');
            const applyPadEvent = (ev) => {
                const rect = pad.getBoundingClientRect();
                const nx = Math.max(0, Math.min(1, (ev.clientX - rect.left) / Math.max(1, rect.width)));
                const ny = Math.max(0, Math.min(1, 1 - (ev.clientY - rect.top) / Math.max(1, rect.height)));
                const xv = parseFloat((axX.min + nx * (axX.max - axX.min)).toFixed(2));
                const yv = parseFloat((axY.min + ny * (axY.max - axY.min)).toFixed(2));
                studioState.axes[axX.tag] = xv;
                studioState.axes[axY.tag] = yv;
                if (axX.tag === 'opsz' || axY.tag === 'opsz') studioState.opszMode = 'manual';
                const pctX = (nx * 100).toFixed(1) + '%';
                const pctY = ((1 - ny) * 100).toFixed(1) + '%';
                pad.querySelector('.op-vf-xy-cross-v').style.left = pctX;
                pad.querySelector('.op-vf-xy-cross-h').style.top = pctY;
                const dot = pad.querySelector('.op-vf-xy-dot');
                dot.style.left = pctX;
                dot.style.top = pctY;
                if (readout) readout.textContent = `${axX.tag}: ${xv} | ${axY.tag}: ${yv}`;
                updateSpecimenPreview();
                scheduleLiveCanvasSync();
            };
            pad.addEventListener('mousedown', (e) => {
                applyPadEvent(e);
                const onMove = (mv) => applyPadEvent(mv);
                const onUp = () => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
        } else if (studioState.activeTab === 'library') {
            const allFonts = eng.getAllVariableFonts();
            const q = studioState.libSearch.trim().toLowerCase();
            const hasCustAxes = (f) => !!(eng.hasCustomAxes ? eng.hasCustomAxes(f) : f.axes.some(a => !a.hidden && !['wght', 'wdth', 'opsz', 'slnt', 'ital'].includes(a.tag)));
            const visCount = (f) => (eng.getVisibleAxes ? eng.getVisibleAxes(f) : f.axes.filter(a => !a.hidden)).length;
            const filtered = allFonts.filter(f => {
                if (q && !f.family.toLowerCase().includes(q)) return false;
                if (studioState.libFilter === 'expressive') return hasCustAxes(f);
                if (studioState.libFilter === 'multi') return visCount(f) > 1;
                if (studioState.libFilter === 'opsz') return f.axes.some(a => a.tag === 'opsz');
                if (studioState.libFilter === 'custom') return !!f.isCustom;
                if (['sans', 'serif', 'mono', 'display', 'handwriting'].includes(studioState.libFilter)) return f.category === studioState.libFilter;
                return true;
            }).slice().sort((a, b) => {
                const scoreA = (a.isCustom ? 200 : 0) + (hasCustAxes(a) ? 50 : 0) + visCount(a) * 10;
                const scoreB = (b.isCustom ? 200 : 0) + (hasCustAxes(b) ? 50 : 0) + visCount(b) * 10;
                if (scoreB !== scoreA) return scoreB - scoreA;
                return a.family.localeCompare(b.family);
            });

            const filters = [
                { id: 'all', label: 'All' },
                { id: 'expressive', label: 'Creative / Custom' },
                { id: 'multi', label: 'Multi-Axis (2+)' },
                { id: 'opsz', label: 'Optical Size (opsz)' },
                { id: 'sans', label: 'Sans' },
                { id: 'serif', label: 'Serif' },
                { id: 'mono', label: 'Mono' },
                { id: 'display', label: 'Display' },
                { id: 'handwriting', label: 'Handwriting' },
                { id: 'custom', label: 'Uploaded' }
            ];

            body.innerHTML = `
                <div class="op-vf-upload-zone" id="op-vf-upload-zone">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <i class="fas fa-file-upload" style="font-size:22px;color:var(--ui-theme-color,#007670);"></i>
                        <div>
                            <div style="font-weight:700;font-size:13px;">Upload Local Variable Font (.ttf, .otf, .woff, .woff2)</div>
                            <div style="font-size:11.5px;opacity:0.8;">OpenType <code>fvar</code> axes and named instances are extracted in-browser and saved cleanly inside your library and <code>.opub</code> files.</div>
                        </div>
                    </div>
                    <button type="button" class="op-vf-btn-primary" id="op-vf-upload-btn" style="flex-shrink:0;">Browse Font...</button>
                    <input type="file" id="op-vf-file-input" accept=".ttf,.otf,.woff,.woff2" style="display:none;" />
                </div>

                <div class="op-vf-lib-controls">
                    <div class="op-vf-lib-pills">
                        ${filters.map(fl => `<button type="button" class="op-vf-chip${studioState.libFilter === fl.id ? ' active' : ''}" data-lib-filter="${fl.id}">${fl.label}</button>`).join('')}
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                        <span style="font-size:11.5px;font-weight:600;opacity:0.75;white-space:nowrap;">${filtered.length} ${filtered.length === 1 ? 'font' : 'fonts'}</span>
                        <input type="text" id="op-vf-lib-search" class="op-vf-input-sm" placeholder="Filter variable fonts..." value="${escapeHtml(studioState.libSearch)}" />
                    </div>
                </div>

                <div class="op-vf-library-grid">
                    ${filtered.length === 0 ? '<div style="grid-column:1/-1;text-align:center;padding:24px;opacity:0.7;">No variable fonts matched your filter.</div>' : filtered.map(f => {
                        const visAxes = eng.getVisibleAxes ? eng.getVisibleAxes(f) : f.axes.filter(a => !a.hidden);
                        const isActive = f.family.toLowerCase() === studioState.family.toLowerCase();
                        const isRich = visAxes.length >= 2 || hasCustAxes(f);
                        return `
                        <div class="op-vf-font-card${isActive ? ' active' : ''}" data-vf-preview-family="${escapeHtml(f.family)}">
                            <div class="op-vf-card-top">
                                <strong>${escapeHtml(f.family)}</strong>
                                <span class="vf-badge-pill${isRich ? ' vf-badge-rich' : ''}">${f.isCustom ? 'Uploaded VF' : `${visAxes.length} ${visAxes.length === 1 ? 'Axis' : 'Axes'}`}</span>
                            </div>
                            <div class="op-vf-card-sample" style="font-family:'${escapeHtml(f.family)}', sans-serif;">Aa Bb Gg 123</div>
                            <div class="op-vf-card-tags">
                                ${visAxes.slice(0, 5).map(a => `<span>${escapeHtml(a.tag)}</span>`).join('')}
                                ${visAxes.length > 5 ? `<span>+${visAxes.length - 5} more</span>` : ''}
                                ${f.axes.some(a => a.hidden) ? `<span title="Includes hidden OpenType axes">+${f.axes.filter(a => a.hidden).length} hidden</span>` : ''}
                            </div>
                            <div class="op-vf-card-actions">
                                <button type="button" class="op-vf-mini-action" data-use-font="${escapeHtml(f.family)}"><i class="fas fa-check"></i> ${isActive ? 'Active' : 'Select'}</button>
                                ${f.isCustom ? `<button type="button" class="op-vf-mini-action op-vf-del-btn" data-del-custom="${escapeHtml(f.family)}" title="Remove custom font"><i class="fas fa-trash"></i></button>` : ''}
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            `;

            const previewCards = body.querySelectorAll('.op-vf-font-card[data-vf-preview-family]');
            if (typeof IntersectionObserver === 'function' && previewCards.length > 0) {
                libPreviewObserver = new IntersectionObserver((entries, obs) => {
                    entries.forEach(entry => {
                        if (!entry.isIntersecting) return;
                        const fam = entry.target.getAttribute('data-vf-preview-family');
                        obs.unobserve(entry.target);
                        if (fam) eng.ensureFontLoaded(fam);
                    });
                }, { root: body, rootMargin: '140px' });
                previewCards.forEach(c => libPreviewObserver.observe(c));
            } else {
                Array.from(previewCards).slice(0, 24).forEach(c => {
                    const fam = c.getAttribute('data-vf-preview-family');
                    if (fam) eng.ensureFontLoaded(fam);
                });
            }

            const handleUploadFile = async (file) => {
                if (!file) return;
                try {
                    const buf = await file.arrayBuffer();
                    const entry = await eng.parseOpenTypeVariableFont(buf, file.name);
                    await eng.registerCustomFont(entry, false);
                    studioState.family = entry.family;
                    resetAxesToDefault(entry.family);
                    syncDefaultMatrixAxes();
                    studioState.activeTab = 'axes';
                    document.querySelectorAll('.op-vf-tab-btn').forEach(t => t.classList.toggle('active', t.getAttribute('data-vf-tab') === 'axes'));
                    renderStudioBody();
                    updateSpecimenPreview();
                    scheduleLiveCanvasSync();
                    showNoticeModal('Custom Variable Font Added', `Loaded "${entry.family}" with ${entry.axes.length} variable axes and ${(entry.instances || []).length} named instances.`);
                } catch (err) {
                    showNoticeModal('Font Upload Error', 'Could not parse the selected font file: ' + (err && err.message ? err.message : err));
                }
            };

            const fileInput = document.getElementById('op-vf-file-input');
            const zone = document.getElementById('op-vf-upload-zone');
            document.getElementById('op-vf-upload-btn').onclick = () => fileInput.click();
            fileInput.onchange = () => {
                if (fileInput.files && fileInput.files[0]) handleUploadFile(fileInput.files[0]);
                fileInput.value = '';
            };
            zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
            zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('dragover');
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) handleUploadFile(e.dataTransfer.files[0]);
            });

            body.querySelectorAll('[data-lib-filter]').forEach(btn => {
                btn.onclick = () => {
                    studioState.libFilter = btn.getAttribute('data-lib-filter');
                    renderStudioBody();
                };
            });
            const sInp = document.getElementById('op-vf-lib-search');
            sInp.oninput = () => {
                studioState.libSearch = sInp.value;
                renderStudioBody();
                const nextInp = document.getElementById('op-vf-lib-search');
                if (nextInp) {
                    nextInp.focus();
                    nextInp.setSelectionRange(nextInp.value.length, nextInp.value.length);
                }
            };
            body.querySelectorAll('[data-use-font]').forEach(btn => {
                btn.onclick = async () => {
                    const fam = btn.getAttribute('data-use-font');
                    studioState.family = fam;
                    resetAxesToDefault(fam);
                    syncDefaultMatrixAxes();
                    await eng.ensureFontLoaded(fam);
                    studioState.activeTab = 'axes';
                    document.querySelectorAll('.op-vf-tab-btn').forEach(t => t.classList.toggle('active', t.getAttribute('data-vf-tab') === 'axes'));
                    renderStudioBody();
                    updateSpecimenPreview();
                    scheduleLiveCanvasSync();
                };
            });
            body.querySelectorAll('[data-del-custom]').forEach(btn => {
                btn.onclick = () => {
                    const fam = btn.getAttribute('data-del-custom');
                    showNoticeModal('Remove Custom Font', `Remove "${fam}" from your local Variable Font library?`, async () => {
                        await eng.removeCustomFont(fam);
                        if (studioState.family.toLowerCase() === fam.toLowerCase()) {
                            studioState.family = eng.CATALOG[0].family;
                            resetAxesToDefault(studioState.family);
                        }
                        renderStudioBody();
                        updateSpecimenPreview();
                    });
                };
            });
        }
        enhanceVfSelects(body, 'studio');
    }

    function closeStudio(commitChanges) {
        const eng = getEngine();
        const overlay = document.getElementById('op-vf-modal-overlay');
        if (!overlay) return;
        cleanupSelectMenus('studio');
        disconnectLibObserver();
        if (commitChanges && eng) {
            eng.applyVariation({
                family: studioState.family,
                axes: studioState.axes,
                opszMode: studioState.opszMode,
                skipHistory: false,
                targetEl: studioState.targetEl
            });
        } else if (!commitChanges) {
            restoreSnapshot();
        }
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        studioState.isOpen = false;
        window.removeEventListener('keydown', onStudioKeyChange, true);
        window.removeEventListener('keyup', onStudioKeyChange, true);
    }

    function onStudioKeyChange(e) {
        if (!studioState.isOpen) return;
        const wasAlt = studioState.altHeld;
        studioState.altHeld = !!e.altKey;
        if (wasAlt !== studioState.altHeld) {
            const pill = document.getElementById('op-vf-fine-pill');
            if (pill) pill.classList.toggle('active', studioState.altHeld);
            document.querySelectorAll('#op-vf-modal-window [data-vf-range], #op-vf-quick-popover [data-vf-range]').forEach(r => {
                r.step = studioState.altHeld ? r.getAttribute('data-fine-step') : r.getAttribute('data-coarse-step');
            });
        }
        if (e.type === 'keydown' && e.key === 'Escape' && !document.getElementById('op-vf-help-overlay') && !document.getElementById('op-vf-notice-overlay')) {
            if (activeSelectMenus.some(m => m.menu && m.menu.style.display === 'block')) {
                e.preventDefault();
                e.stopPropagation();
                closeAllVfSelectMenus();
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            closeStudio(false);
        }
    }

    async function showVariableFontsModal(initialTab) {
        const eng = getEngine();
        if (!eng) return;
        closeQuickPopover();
        cleanupSelectMenus('studio');
        const existing = document.getElementById('op-vf-modal-overlay');
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

        initFromCanvasTarget();
        if (initialTab) studioState.activeTab = initialTab;
        await eng.ensureFontLoaded(studioState.family);

        const overlay = document.createElement('div');
        overlay.id = 'op-vf-modal-overlay';
        overlay.className = 'op-vf-modal-overlay';
        overlay.innerHTML = `
            <div class="op-vf-modal-window" id="op-vf-modal-window" role="dialog" aria-modal="true" aria-labelledby="op-vf-modal-title">
                <div class="op-vf-modal-header" id="op-vf-modal-header">
                    <div class="op-vf-header-left">
                        <span class="op-vf-header-badge">VF</span>
                        <div>
                            <div id="op-vf-modal-title" class="op-vf-modal-title">Variable Font Studio</div>
                            <div class="op-vf-modal-subtitle">Continuous OpenType axes, Optical Size (opsz), Named Instances &amp; Custom Fonts</div>
                        </div>
                    </div>
                    <div class="op-vf-header-actions">
                        <button type="button" class="custom-dialog-close op-vf-help-icon-btn" id="op-vf-help-btn" title="Variable Fonts Help" aria-label="Variable Fonts Help"><i class="fas fa-question"></i></button>
                        <button type="button" class="custom-dialog-close" id="op-vf-close-x" title="Close" aria-label="Close"><i class="fas fa-times"></i></button>
                    </div>
                </div>

                <div class="op-vf-tabs">
                    <button type="button" class="op-vf-tab-btn${studioState.activeTab === 'axes' ? ' active' : ''}" data-vf-tab="axes"><i class="fas fa-sliders-h"></i> Axes &amp; Instances</button>
                    <button type="button" class="op-vf-tab-btn${studioState.activeTab === 'matrix' ? ' active' : ''}" data-vf-tab="matrix"><i class="fas fa-th"></i> 2D Matrix Explorer</button>
                    <button type="button" class="op-vf-tab-btn${studioState.activeTab === 'library' ? ' active' : ''}" data-vf-tab="library"><i class="fas fa-font"></i> Font Library &amp; Upload</button>
                </div>

                <div class="op-vf-specimen-bar">
                    <div class="op-vf-specimen-tools">
                        <input type="text" id="op-vf-specimen-input" class="op-vf-input-sm" value="${escapeHtml(studioState.specimenText)}" placeholder="Preview specimen text..." />
                        <div class="op-vf-specimen-size">
                            <span style="font-size:11px;font-weight:600;white-space:nowrap;">Preview Size:</span>
                            <input type="range" id="op-vf-specimen-size" min="14" max="72" step="1" value="${studioState.specimenPt}" />
                            <span id="op-vf-specimen-pt">${studioState.specimenPt}pt</span>
                        </div>
                        <label class="op-vf-live-toggle">
                            <input type="checkbox" id="op-vf-live-check"${studioState.livePreview ? ' checked' : ''}>
                            <span>Live Canvas</span>
                        </label>
                    </div>
                    <div class="op-vf-specimen-stage">
                        <div id="op-vf-specimen-output" class="op-vf-specimen-output"></div>
                    </div>
                    <div class="op-vf-css-row">
                        <code id="op-vf-css-chip" class="op-vf-css-chip">font-variation-settings: normal;</code>
                    </div>
                </div>

                <div class="op-vf-modal-body" id="op-vf-tab-content"></div>

                <div class="op-vf-modal-footer">
                    <button type="button" class="op-vf-btn-secondary" id="op-vf-cancel-btn">Cancel</button>
                    <button type="button" class="op-vf-btn-primary" id="op-vf-apply-btn"><i class="fas fa-check"></i> Apply Variable Font</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        studioState.isOpen = true;

        const win = document.getElementById('op-vf-modal-window');
        makeDraggable(win, document.getElementById('op-vf-modal-header'));

        // Prevent accidental backdrop clicks from dismissing the studio and losing user edits
        overlay.addEventListener('mousedown', (e) => {
            if (e.target === overlay) {
                e.stopPropagation();
                win.classList.remove('op-vf-pulse');
                void win.offsetWidth;
                win.classList.add('op-vf-pulse');
            }
        });

        overlay.querySelectorAll('.op-vf-tab-btn').forEach(btn => {
            btn.onclick = () => {
                studioState.activeTab = btn.getAttribute('data-vf-tab');
                overlay.querySelectorAll('.op-vf-tab-btn').forEach(t => t.classList.toggle('active', t === btn));
                renderStudioBody();
            };
        });

        document.getElementById('op-vf-specimen-input').oninput = function() {
            studioState.specimenText = this.value;
            updateSpecimenPreview();
        };
        document.getElementById('op-vf-specimen-size').oninput = function() {
            studioState.specimenPt = parseInt(this.value, 10) || 28;
            document.getElementById('op-vf-specimen-pt').textContent = studioState.specimenPt + 'pt';
            updateSpecimenPreview();
        };
        document.getElementById('op-vf-live-check').onchange = function() {
            studioState.livePreview = this.checked;
            if (this.checked) scheduleLiveCanvasSync();
        };

        document.getElementById('op-vf-help-btn').onclick = () => showHelpModal();
        document.getElementById('op-vf-close-x').onclick = () => closeStudio(false);
        document.getElementById('op-vf-cancel-btn').onclick = () => closeStudio(false);
        document.getElementById('op-vf-apply-btn').onclick = () => closeStudio(true);

        window.addEventListener('keydown', onStudioKeyChange, true);
        window.addEventListener('keyup', onStudioKeyChange, true);

        renderStudioBody();
        updateSpecimenPreview();
    }

    // =========================================================================
    // QUICK AXES POPOVER (INLINE RIBBON / FLOATING TOOLBAR ACCESS)
    // =========================================================================
    function closeQuickPopover() {
        cleanupSelectMenus('popover');
        const pop = document.getElementById('op-vf-quick-popover');
        if (pop && pop.parentNode) pop.parentNode.removeChild(pop);
        studioState.popoverOpen = false;
    }

    function toggleVariableFontsQuickPopover(anchorEl, ev, preserveCoords) {
        if (ev) ev.stopPropagation();
        const existing = document.getElementById('op-vf-quick-popover');
        if (existing) {
            closeQuickPopover();
            return;
        }
        const eng = getEngine();
        if (!eng) return;
        const info = eng.inspectTarget();

        const pop = document.createElement('div');
        pop.id = 'op-vf-quick-popover';
        pop.className = 'op-vf-quick-popover';
        pop.addEventListener('mousedown', (e) => {
            if (!isInteractivePopoverTarget(e.target)) e.preventDefault();
            e.stopPropagation();
        });

        const placeAndBindPopoverHeader = () => {
            if (preserveCoords && preserveCoords.left && preserveCoords.top) {
                pop.style.left = preserveCoords.left;
                pop.style.top = preserveCoords.top;
            } else {
                positionPopover(pop, anchorEl);
            }
            makeDraggable(pop, document.getElementById('op-vf-pop-hdr'));
            const closeBtn = document.getElementById('op-vf-pop-close-x');
            if (closeBtn) closeBtn.onclick = () => closeQuickPopover();
        };

        if (!info.isVariable) {
            const topMulti = ['Roboto Flex', 'Inter', 'Fraunces', 'Recursive', 'Bricolage Grotesque', 'DM Sans'];
            pop.innerHTML = `
                <div class="op-vf-pop-hdr" id="op-vf-pop-hdr" title="Drag to move">
                    <span><strong>Variable Fonts</strong> (${escapeHtml(info.family)} is static)</span>
                    <div class="op-vf-pop-actions">
                        <button type="button" class="custom-dialog-close op-vf-help-icon-btn" id="op-vf-pop-help-btn" title="Variable Fonts Help" aria-label="Help"><i class="fas fa-question"></i></button>
                        <button type="button" class="custom-dialog-close" id="op-vf-pop-close-x" title="Close" aria-label="Close"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="op-vf-pop-body">
                    <p style="margin:0 0 8px;font-size:12px;">Switch the selected text to a variable font to adjust continuous weight, width, optical size (opsz), or custom axes:</p>
                    <div class="op-vf-pop-quick-list">
                        ${topMulti.map(f => `<button type="button" class="op-vf-chip" data-pop-vf="${escapeHtml(f)}">${escapeHtml(f)}</button>`).join('')}
                    </div>
                </div>
                <div class="op-vf-pop-ftr">
                    <button type="button" class="op-vf-btn-primary" id="op-vf-pop-studio-btn" style="width:100%;">Open Variable Font Studio...</button>
                </div>
            `;
            document.body.appendChild(pop);
            placeAndBindPopoverHeader();
            pop.querySelectorAll('[data-pop-vf]').forEach(btn => {
                btn.onclick = async () => {
                    const fam = btn.getAttribute('data-pop-vf');
                    const def = eng.getFontDef(fam);
                    const axes = {};
                    if (def) def.axes.forEach(a => { axes[a.tag] = a.default; });
                    const coords = (pop.style.left && pop.style.top) ? { left: pop.style.left, top: pop.style.top } : null;
                    await eng.applyVariation({ family: fam, axes, opszMode: 'auto', skipHistory: false, targetEl: info.selectedEl || null });
                    closeQuickPopover();
                    toggleVariableFontsQuickPopover(anchorEl, null, coords);
                };
            });
        } else {
            const def = info.fontDef;
            const visAxes = def.axes.filter(a => !a.hidden);
            studioState.family = def.family;
            studioState.axes = Object.assign({}, info.axes);
            studioState.opszMode = info.opszMode || 'auto';
            studioState.targetEl = info.selectedEl;

            const hasOpsz = visAxes.some(a => a.tag === 'opsz');
            pop.innerHTML = `
                <div class="op-vf-pop-hdr" id="op-vf-pop-hdr" title="Drag to move">
                    <span><strong>${escapeHtml(def.family)}</strong> <span class="vf-badge-pill">VF</span></span>
                    <div class="op-vf-pop-actions">
                        <button type="button" class="custom-dialog-close op-vf-help-icon-btn" id="op-vf-pop-help-btn" title="Variable Fonts Help" aria-label="Help"><i class="fas fa-question"></i></button>
                        <button type="button" class="custom-dialog-close" id="op-vf-pop-close-x" title="Close" aria-label="Close"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="op-vf-pop-body">
                    <select id="op-vf-pop-inst" class="op-vf-select" style="margin-bottom:8px;">
                        <option value="__custom__">Custom Axes</option>
                        ${(def.instances || []).map(i => `<option value="${escapeHtml(i.name)}"${findMatchingInstanceName(def, studioState.axes) === i.name ? ' selected' : ''}>${escapeHtml(i.name)}</option>`).join('')}
                    </select>
                    ${hasOpsz ? `
                    <label style="display:flex;align-items:center;gap:6px;font-size:11.5px;margin-bottom:8px;cursor:pointer;">
                        <input type="checkbox" id="op-vf-pop-opsz"${studioState.opszMode === 'auto' ? ' checked' : ''}>
                        <span>Auto Optical Size (opsz ~${info.fontSizePt}pt)</span>
                    </label>` : ''}
                    <div id="op-vf-pop-sliders">
                        ${visAxes.map(a => renderAxisSliderRow(a, def, studioState.axes[a.tag] ?? a.default, studioState.opszMode === 'auto')).join('')}
                    </div>
                </div>
                <div class="op-vf-pop-ftr">
                    <button type="button" class="op-vf-btn-secondary" id="op-vf-pop-reset">Reset</button>
                    <button type="button" class="op-vf-btn-primary" id="op-vf-pop-studio-btn">Full Studio...</button>
                </div>
            `;
            document.body.appendChild(pop);
            placeAndBindPopoverHeader();
            cleanupSelectMenus('popover');
            enhanceVfSelects(pop, 'popover');

            const popSliders = document.getElementById('op-vf-pop-sliders');
            const instSel = document.getElementById('op-vf-pop-inst');
            const opszChk = document.getElementById('op-vf-pop-opsz');

            const syncPopoverAxisUI = () => {
                const isOpszAuto = studioState.opszMode === 'auto';
                if (opszChk) opszChk.checked = isOpszAuto;
                visAxes.forEach(ax => {
                    const v = parseFloat(Number(studioState.axes[ax.tag] ?? ax.default).toFixed(3));
                    const row = popSliders ? popSliders.querySelector(`[data-axis-tag="${ax.tag}"]`) : null;
                    const slider = popSliders ? popSliders.querySelector(`[data-vf-range="${ax.tag}"]`) : null;
                    const num = popSliders ? popSliders.querySelector(`[data-vf-num="${ax.tag}"]`) : null;
                    const spinWrap = popSliders ? popSliders.querySelector(`[data-vf-spinner="${ax.tag}"]`) : null;
                    const resetBtn = popSliders ? popSliders.querySelector(`[data-vf-reset="${ax.tag}"]`) : null;
                    if (slider) slider.value = v;
                    if (num) num.value = v;
                    if (resetBtn) resetBtn.disabled = Math.abs(v - ax.default) < 0.0001;
                    if (ax.tag === 'opsz') {
                        if (row) row.classList.toggle('is-auto-locked', isOpszAuto);
                        if (spinWrap) spinWrap.classList.toggle('is-disabled', isOpszAuto);
                        if (slider) slider.disabled = isOpszAuto;
                        if (num) num.disabled = isOpszAuto;
                    }
                });
                if (instSel) {
                    instSel.value = findMatchingInstanceName(def, studioState.axes);
                    instSel.dispatchEvent(new Event('op-vf-sync'));
                }
            };

            if (popSliders) {
                popSliders.querySelectorAll('[data-vf-range]').forEach(slider => {
                    slider.addEventListener('input', function(e) {
                        const tag = this.getAttribute('data-vf-range');
                        const axis = def.axes.find(a => a.tag === tag);
                        if (!axis) return;
                        const val = snapToClosestNotch(axis, parseFloat(this.value), def, !!(studioState.altHeld || (e && e.altKey)));
                        this.value = val;
                        studioState.axes[tag] = val;
                        if (tag === 'opsz') studioState.opszMode = 'manual';
                        syncPopoverAxisUI();
                        eng.applyVariation({
                            family: def.family,
                            axes: studioState.axes,
                            opszMode: studioState.opszMode,
                            skipHistory: false,
                            targetEl: studioState.targetEl
                        });
                    });
                });

                wireAxisSpinners(popSliders, def, (tag, val) => {
                    studioState.axes[tag] = val;
                    if (tag === 'opsz') studioState.opszMode = 'manual';
                    syncPopoverAxisUI();
                    eng.applyVariation({
                        family: def.family,
                        axes: studioState.axes,
                        opszMode: studioState.opszMode,
                        skipHistory: false,
                        targetEl: studioState.targetEl
                    });
                });

                popSliders.querySelectorAll('[data-vf-reset]').forEach(btn => {
                    btn.onclick = async () => {
                        const tag = btn.getAttribute('data-vf-reset');
                        const axis = def.axes.find(a => a.tag === tag);
                        if (!axis) return;
                        studioState.axes[tag] = axis.default;
                        syncPopoverAxisUI();
                        await eng.applyVariation({
                            family: def.family,
                            axes: studioState.axes,
                            opszMode: studioState.opszMode,
                            skipHistory: false,
                            targetEl: studioState.targetEl
                        });
                    };
                });
            }

            if (instSel) {
                instSel.onchange = async () => {
                    const inst = (def.instances || []).find(i => i.name === instSel.value);
                    if (!inst) return;
                    Object.assign(studioState.axes, inst.coords);
                    if (inst.coords.opsz !== undefined) studioState.opszMode = 'manual';
                    syncPopoverAxisUI();
                    await eng.applyVariation({
                        family: def.family,
                        axes: studioState.axes,
                        opszMode: studioState.opszMode,
                        skipHistory: false,
                        targetEl: studioState.targetEl
                    });
                };
            }
            if (opszChk) {
                opszChk.onchange = async () => {
                    studioState.opszMode = opszChk.checked ? 'auto' : 'manual';
                    syncPopoverAxisUI();
                    await eng.applyVariation({
                        family: def.family,
                        axes: studioState.axes,
                        opszMode: studioState.opszMode,
                        skipHistory: false,
                        targetEl: studioState.targetEl
                    });
                };
            }
            document.getElementById('op-vf-pop-reset').onclick = async () => {
                resetAxesToDefault(def.family);
                studioState.opszMode = 'auto';
                syncPopoverAxisUI();
                await eng.applyVariation({
                    family: def.family,
                    axes: studioState.axes,
                    opszMode: 'auto',
                    skipHistory: false,
                    targetEl: studioState.targetEl
                });
            };
        }

        document.getElementById('op-vf-pop-help-btn').onclick = () => { closeQuickPopover(); showHelpModal(); };
        document.getElementById('op-vf-pop-studio-btn').onclick = () => { closeQuickPopover(); showVariableFontsModal('axes'); };
        studioState.popoverOpen = true;
    }

    function positionPopover(pop, anchor) {
        if (!anchor || !anchor.getBoundingClientRect) {
            pop.style.top = '115px';
            pop.style.left = '240px';
            return;
        }
        const r = anchor.getBoundingClientRect();
        const floatBar = anchor.closest ? anchor.closest('#float-toolbar') : null;
        const barRect = floatBar ? floatBar.getBoundingClientRect() : null;
        const topRef = barRect ? barRect.top : r.top;
        const bottomRef = barRect ? barRect.bottom : r.bottom;
        const pw = pop.offsetWidth || 330;
        const left = Math.max(8, Math.min(window.innerWidth - pw - 12, r.left));

        const spaceBelow = window.innerHeight - bottomRef - 16;
        const spaceAbove = topRef - 16;
        let ph = pop.offsetHeight || 420;
        let top;

        if (spaceBelow >= ph) {
            top = bottomRef + 6;
        } else if (spaceAbove >= ph || spaceAbove > spaceBelow) {
            const availAbove = Math.max(220, spaceAbove);
            if (ph > availAbove) {
                pop.style.maxHeight = availAbove + 'px';
                ph = availAbove;
            }
            top = Math.max(8, topRef - ph - 8);
        } else {
            const availBelow = Math.max(220, spaceBelow);
            if (ph > availBelow) {
                pop.style.maxHeight = availBelow + 'px';
                ph = availBelow;
            }
            top = Math.min(window.innerHeight - ph - 12, bottomRef + 6);
        }
        pop.style.left = left + 'px';
        pop.style.top = top + 'px';
    }

    // Close custom selects and quick popover on outside click / Escape
    document.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.op-vf-select-wrap') && !e.target.closest('.op-vf-select-menu')) {
            closeAllVfSelectMenus();
        }
        if (!studioState.popoverOpen) return;
        if (e.target.closest('#op-vf-quick-popover') || e.target.closest('.vf-ribbon-btn') || e.target.closest('.op-vf-select-menu')) return;
        closeQuickPopover();
    }, true);

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (studioState.isOpen) return; // Handled by onStudioKeyChange
        if (document.getElementById('op-vf-help-overlay') || document.getElementById('op-vf-notice-overlay')) return;
        if (activeSelectMenus.some(m => m.menu && m.menu.style.display === 'block')) {
            e.preventDefault();
            e.stopPropagation();
            closeAllVfSelectMenus();
            return;
        }
        if (studioState.popoverOpen) {
            e.preventDefault();
            e.stopPropagation();
            closeQuickPopover();
        }
    }, true);

    // =========================================================================
    // [?] VARIABLE FONTS HELP MODAL
    // =========================================================================
    function showHelpModal() {
        const existing = document.getElementById('op-vf-help-overlay');
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

        const topics = [
            {
                id: 'overview',
                title: 'Overview & Quick Start',
                body: '<p><strong>Variable Fonts</strong> store multiple weights, widths, slants, optical sizes, and designer axes inside a single font file so you can dial in exact typography across a continuous range.</p><ul><li><strong>Identify Variable Fonts:</strong> Fonts marked with a teal <code>VF</code> badge in any Font dropdown support variable axes. Use the dropdown <code>VF</code> filter tab to view only variable fonts.</li><li><strong>Quick Popover vs Full Studio:</strong> Click the <code>VF</code> button on the Home, Text Box Tools, WordArt Tools, or Floating Toolbar for fast sliders, or open <strong>Variable Font Studio</strong> for presets, the 2D Matrix Explorer, and font uploads.</li><li><strong>Non-Destructive Preview:</strong> Clicking outside the Studio modal will never discard your adjustments. Use <strong>Apply Variable Font</strong> to commit or <strong>Cancel</strong> to revert.</li></ul>'
            },
            {
                id: 'opsz',
                title: 'Optical Size (opsz) & Standard Axes',
                body: '<p>OpenPublisher supports all 5 registered OpenType axes plus custom designer axes:</p><ul><li><strong>Weight (<code>wght</code>):</strong> Continuous stroke thickness from hairline (<code>100</code>) to black (<code>1000</code>).</li><li><strong>Width (<code>wdth</code>):</strong> Smoothly condenses or expands horizontal glyph proportions (<code>%</code>).</li><li><strong>Optical Size (<code>opsz</code>):</strong> Adjusts stroke contrast and spacing for tiny body captions vs huge headlines. Leave <strong>Auto (Match Font Size)</strong> enabled to sync with your text size automatically, or switch to <strong>Manual</strong> for intentional optical contrast.</li><li><strong>Slant (<code>slnt</code>) &amp; Italic (<code>ital</code>):</strong> Adjusts oblique tilt angle in degrees or true italic letterforms.</li><li><strong>Designer Axes:</strong> Expressive controls such as Grade (<code>GRAD</code>), Casual (<code>CASL</code>), Cursive (<code>CRSV</code>), Monospace (<code>MONO</code>), and Softness (<code>SOFT</code>).</li></ul>'
            },
            {
                id: 'instances',
                title: 'Named Instances & Hidden Axes',
                body: '<p>Variable fonts include predefined combinations created by the type designer called <strong>Named Instances</strong>:</p><ul><li><strong>Named Instances:</strong> Pick any named style (e.g. <em>SemiBold</em>, <em>Condensed Bold</em>, <em>Display Black</em>) from the dropdown or quick chips, then fine-tune from there.</li><li><strong>Notched Sliders:</strong> Tick marks along each slider show Named Instance stops and the axis default. Normal dragging snaps gently to stops.</li><li><strong>Hidden Axes:</strong> Per the OpenType <code>fvar</code> specification, internal parametric axes (such as <code>XOPQ</code>, <code>XTRA</code>, or <code>YTAS</code> in <em>Roboto Flex</em>) are hidden by default. Enable <strong>Show hidden OpenType axes</strong> to reveal them when specialized tweaking is needed.</li></ul>'
            },
            {
                id: 'matrix',
                title: '2D Variation Matrix & Alt Fine-Tuning',
                body: '<p>Explore two axes together visually or dial in ultra-precise decimal coordinates:</p><ul><li><strong>2D Matrix Explorer:</strong> Pick any Horizontal (X) and Vertical (Y) axis pair to view a live <strong>5x5 specimen matrix</strong>. Click any cell to snap immediately, or drag the continuous <strong>XY Pad</strong> crosshair.</li><li><strong>Alt / Option Fine-Tuning:</strong> Hold <strong>Alt</strong> (Windows/Linux) or <strong>Option</strong> (macOS) while dragging any axis slider to bypass notch snapping and adjust in fine decimal increments.</li><li><strong>Saved Axis Presets:</strong> Save your favorite axis combinations under <em>Saved Axis Presets</em> to reuse across headings and templates.</li></ul>'
            },
            {
                id: 'upload',
                title: 'Custom Variable Fonts & .opub Saving',
                body: '<p>Bring your own variable font files cleanly into Open Publisher:</p><ul><li><strong>Upload Local Fonts:</strong> Open the <strong>Font Library &amp; Upload</strong> tab and drop any <code>.ttf</code>, <code>.otf</code>, <code>.woff</code>, or <code>.woff2</code> font file.</li><li><strong>OpenType Binary Parser:</strong> Open Publisher reads the OpenType <code>fvar</code> and <code>name</code> tables directly in your browser to list every axis, range, hidden flag, and named instance automatically.</li><li><strong>Saved Inside .opub:</strong> Custom uploaded fonts and referenced Google Variable Fonts are embedded inside saved <code>.opub</code> project files so documents reopen consistently on any machine.</li></ul>'
            },
            {
                id: 'export',
                title: 'Print, PDF & HTML Export',
                body: '<p>Variable font styling is preserved across every Open Publisher export pipeline:</p><ul><li><strong>Print, PDF, XPS &amp; Image Export:</strong> Text boxes using variable axes or custom variable fonts are rasterized cleanly through the browser OpenType shaper at print resolution so continuous weights, widths, and <code>opsz</code> settings never fall back to regular weights.</li><li><strong>HTML Export:</strong> Generates full variable axis Google Fonts CSS2 links and embeds custom variable font data when offline export is enabled.</li><li><strong>Pack &amp; Go:</strong> Bundles custom variable font files into the archive <code>Fonts/</code> folder and lists them in <code>Fonts.txt</code>.</li></ul>'
            }
        ];

        const wrap = document.createElement('div');
        wrap.id = 'op-vf-help-overlay';
        wrap.className = 'op-vf-help-overlay';
        wrap.innerHTML = `
            <div class="op-vf-help-box" id="op-vf-help-box" role="dialog" aria-modal="true">
                <div class="op-vf-help-header" id="op-vf-help-header">
                    <span style="display:flex;align-items:center;gap:8px;font-weight:700;font-size:13.5px;">
                        <i class="fas fa-book-open"></i> Variable Fonts Help
                    </span>
                    <button type="button" class="custom-dialog-close" id="op-vf-help-close-x" title="Close Help" aria-label="Close Help"><i class="fas fa-times"></i></button>
                </div>
                <div class="op-vf-help-toolbar">
                    <div style="display:flex;align-items:center;gap:4px;">
                        <button type="button" class="op-vf-help-nav-btn" id="op-vf-help-back" disabled><i class="fas fa-arrow-left"></i> Back</button>
                        <button type="button" class="op-vf-help-nav-btn" id="op-vf-help-fwd" disabled>Forward <i class="fas fa-arrow-right"></i></button>
                    </div>
                    <span id="op-vf-help-crumb" style="font-weight:600;opacity:0.85;">${escapeHtml(topics[0].title)}</span>
                </div>
                <div class="op-vf-help-split">
                    <div class="op-vf-help-toc">
                        <div class="op-vf-help-toc-head">Contents</div>
                        ${topics.map((t, i) => `<button type="button" class="op-vf-help-topic-btn${i === 0 ? ' active' : ''}" data-vf-topic="${t.id}"><i class="fas fa-file-alt"></i><span>${escapeHtml(t.title)}</span></button>`).join('')}
                    </div>
                    <div class="op-vf-help-pane" id="op-vf-help-pane"></div>
                </div>
                <div class="op-vf-help-footer">
                    <button type="button" class="op-vf-btn-primary" id="op-vf-help-ok">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(wrap);

        const helpBox = document.getElementById('op-vf-help-box');
        helpBox.style.position = 'fixed';
        makeDraggable(helpBox, document.getElementById('op-vf-help-header'));

        const hist = [topics[0].id];
        let histIdx = 0;
        const backBtn = document.getElementById('op-vf-help-back');
        const fwdBtn = document.getElementById('op-vf-help-fwd');
        const pane = document.getElementById('op-vf-help-pane');
        const crumb = document.getElementById('op-vf-help-crumb');

        function showTopic(id, pushHist) {
            const topic = topics.find(t => t.id === id) || topics[0];
            if (pushHist && hist[histIdx] !== topic.id) {
                hist.splice(histIdx + 1);
                hist.push(topic.id);
                histIdx = hist.length - 1;
            }
            pane.innerHTML = `<h4>${escapeHtml(topic.title)}</h4>${topic.body}`;
            crumb.textContent = topic.title;
            wrap.querySelectorAll('[data-vf-topic]').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-vf-topic') === topic.id);
            });
            backBtn.disabled = histIdx <= 0;
            fwdBtn.disabled = histIdx >= hist.length - 1;
        }

        backBtn.onclick = () => { if (histIdx > 0) { histIdx--; showTopic(hist[histIdx], false); } };
        fwdBtn.onclick = () => { if (histIdx < hist.length - 1) { histIdx++; showTopic(hist[histIdx], false); } };
        wrap.querySelectorAll('[data-vf-topic]').forEach(btn => {
            btn.onclick = () => showTopic(btn.getAttribute('data-vf-topic'), true);
        });
        const closeHelp = () => { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); };
        document.getElementById('op-vf-help-close-x').onclick = closeHelp;
        document.getElementById('op-vf-help-ok').onclick = closeHelp;
        showTopic(topics[0].id, false);
    }

    const VariableFontsUI = {
        showModal: showVariableFontsModal,
        toggleQuickPopover: toggleVariableFontsQuickPopover,
        closeQuickPopover,
        showHelpModal,
        syncFromCanvas(info) {
            if (!studioState.isOpen || !info || !info.selectedEl) return;
        },
        onExternalFontSizeChange(pt) {
            if (!studioState.isOpen || studioState.opszMode !== 'auto') return;
            const note = document.querySelector('.op-vf-opsz-note');
            if (note) note.textContent = `Auto-matching text size (~${pt}pt)`;
        }
    };

    window.VariableFontsUI = VariableFontsUI;
    window.showVariableFontsModal = showVariableFontsModal;
    window.toggleVariableFontsQuickPopover = toggleVariableFontsQuickPopover;
})(window);
