/* =========================================================================
   ALIGN & DISTRIBUTE ENGINE (MS Publisher Arrange -> Align Workflow)
   Supports 1+ objects (auto-margin fallback), multi-selection bounding box,
   Margin Guides (including Spread Mode half-page), Page, true edge-to-edge
   distribution for varying sizes, locked-element skipping, zoom-invariant
   unscaled #paper math, single-step Undo, Ribbon menu & Context submenu.
========================================================================= */
(function () {
    'use strict';

    const VALID_MODES = ['selection', 'margins', 'page'];
    const DEFAULT_MARGIN = 48;

    if (!VALID_MODES.includes(window._opAlignMode)) {
        window._opAlignMode = 'selection';
    }

    function normalizeMode(mode) {
        return VALID_MODES.includes(mode) ? mode : 'selection';
    }

    function roundPx(val) {
        return Math.round(val * 100) / 100;
    }

    function numOr(val, fallback) {
        const n = parseFloat(val);
        return Number.isFinite(n) ? n : fallback;
    }

    function getPaperEl() {
        return document.getElementById('paper');
    }

    function getPaperMetrics(paper) {
        if (!paper) return { width: 794, height: 1123 };
        const width = paper.offsetWidth || numOr(paper.style.width, 794);
        const height = paper.offsetHeight || numOr(paper.style.height, 1123);
        return { width, height };
    }

    function isElementLocked(el) {
        if (!el || !el.classList || !el.classList.contains('pub-element')) return true;
        return (
            el.getAttribute('data-locked') === 'true' ||
            el.classList.contains('locked') ||
            el.getAttribute('data-hf-locked') === 'true' ||
            el.classList.contains('op-hf-box')
        );
    }

    function getRawSelectedElements() {
        const paper = getPaperEl();
        if (!paper || typeof state === 'undefined' || !state) return [];
        const candidates = [];
        if (Array.isArray(state.multiSelected) && state.multiSelected.length > 0) {
            state.multiSelected.forEach(el => candidates.push(el));
        }
        if (state.selectedEl) {
            candidates.push(state.selectedEl);
        }
        const unique = [];
        const seen = new Set();
        for (let i = 0; i < candidates.length; i++) {
            const el = candidates[i];
            if (!el || seen.has(el)) continue;
            if (!el.classList || !el.classList.contains('pub-element')) continue;
            if (!paper.contains(el)) continue;
            seen.add(el);
            unique.push(el);
        }
        return unique;
    }

    function getUnlockedSelectedElements() {
        return getRawSelectedElements().filter(el => !isElementLocked(el));
    }

    function measureElement(el) {
        const l = Number.isFinite(parseFloat(el.style.left)) ? parseFloat(el.style.left) : (el.offsetLeft || 0);
        const t = Number.isFinite(parseFloat(el.style.top)) ? parseFloat(el.style.top) : (el.offsetTop || 0);
        const w = el.offsetWidth || numOr(el.style.width, 0);
        const h = el.offsetHeight || numOr(el.style.height, 0);
        return {
            el,
            l,
            t,
            w,
            h,
            r: l + w,
            b: t + h
        };
    }

    function getSelectionBounds(items) {
        let minL = Infinity;
        let minT = Infinity;
        let maxR = -Infinity;
        let maxB = -Infinity;
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            if (it.l < minL) minL = it.l;
            if (it.t < minT) minT = it.t;
            if (it.r > maxR) maxR = it.r;
            if (it.b > maxB) maxB = it.b;
        }
        return { left: minL, top: minT, right: maxR, bottom: maxB };
    }

    function getMarginsConfig() {
        const m = (typeof state !== 'undefined' && state && state.margins) ? state.margins : null;
        return {
            top: m && Number.isFinite(Number(m.top)) ? Number(m.top) : DEFAULT_MARGIN,
            right: m && Number.isFinite(Number(m.right)) ? Number(m.right) : DEFAULT_MARGIN,
            bottom: m && Number.isFinite(Number(m.bottom)) ? Number(m.bottom) : DEFAULT_MARGIN,
            left: m && Number.isFinite(Number(m.left)) ? Number(m.left) : DEFAULT_MARGIN
        };
    }

    function getReferenceBounds(items, explicitMode) {
        const requestedMode = normalizeMode(explicitMode || window._opAlignMode);
        const effectiveMode = (requestedMode === 'selection' && items.length <= 1) ? 'margins' : requestedMode;

        if (effectiveMode === 'selection') {
            const box = getSelectionBounds(items);
            return {
                left: box.left,
                top: box.top,
                right: box.right,
                bottom: box.bottom,
                effectiveMode: 'selection',
                requestedMode
            };
        }

        const paper = getPaperEl();
        const { width: paperW, height: paperH } = getPaperMetrics(paper);

        if (effectiveMode === 'page') {
            return {
                left: 0,
                top: 0,
                right: paperW,
                bottom: paperH,
                effectiveMode: 'page',
                requestedMode
            };
        }

        const m = getMarginsConfig();
        const isSpread = (typeof state !== 'undefined' && state && !!state.isSpreadMode);
        if (isSpread) {
            const halfW = paperW / 2;
            const selBox = items.length > 0 ? getSelectionBounds(items) : { left: 0, right: 0 };
            const selCenterX = (selBox.left + selBox.right) / 2;
            if (selCenterX >= halfW) {
                return {
                    left: halfW + m.left,
                    top: m.top,
                    right: paperW - m.right,
                    bottom: paperH - m.bottom,
                    effectiveMode: 'margins',
                    requestedMode
                };
            }
            return {
                left: m.left,
                top: m.top,
                right: halfW - m.right,
                bottom: paperH - m.bottom,
                effectiveMode: 'margins',
                requestedMode
            };
        }

        return {
            left: m.left,
            top: m.top,
            right: paperW - m.right,
            bottom: paperH - m.bottom,
            effectiveMode: 'margins',
            requestedMode
        };
    }

    function commitCanvasChange() {
        if (typeof window.renderSelectionOverlays === 'function') {
            window.renderSelectionOverlays();
        }
        if (
            typeof state !== 'undefined' &&
            state &&
            state.selectedEl &&
            (!state.multiSelected || state.multiSelected.length === 0)
        ) {
            if (typeof window.showFloatToolbar === 'function') {
                window.showFloatToolbar();
            }
            if (window.DimensionControlService && typeof window.DimensionControlService.sync === 'function') {
                window.DimensionControlService.sync(state.selectedEl);
            }
        }
        if (typeof window.updateThumbnails === 'function') {
            window.updateThumbnails();
        }
        if (typeof window.pushHistory === 'function') {
            window.pushHistory(true);
        }
    }

    function align(kind, opts) {
        const unlocked = getUnlockedSelectedElements();
        if (unlocked.length === 0) {
            if (typeof window.showToast === 'function' && getRawSelectedElements().length > 0) {
                window.showToast('Selected object is locked and cannot be aligned.');
            }
            return { applied: false, reason: 'no-unlocked-selection' };
        }

        const items = unlocked.map(measureElement);
        const ref = getReferenceBounds(items, opts && opts.mode);
        const refW = ref.right - ref.left;
        const refH = ref.bottom - ref.top;
        let changed = false;

        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            if (kind === 'left' || kind === 'center' || kind === 'right') {
                let targetLeft = it.l;
                if (kind === 'left') targetLeft = ref.left;
                else if (kind === 'center') targetLeft = ref.left + (refW - it.w) / 2;
                else if (kind === 'right') targetLeft = ref.right - it.w;
                const rounded = roundPx(targetLeft);
                if (Math.abs(rounded - it.l) > 0.005) changed = true;
                it.el.style.left = rounded + 'px';
            } else if (kind === 'top' || kind === 'middle' || kind === 'bottom') {
                let targetTop = it.t;
                if (kind === 'top') targetTop = ref.top;
                else if (kind === 'middle') targetTop = ref.top + (refH - it.h) / 2;
                else if (kind === 'bottom') targetTop = ref.bottom - it.h;
                const rounded = roundPx(targetTop);
                if (Math.abs(rounded - it.t) > 0.005) changed = true;
                it.el.style.top = rounded + 'px';
            } else {
                return { applied: false, reason: 'unknown-action' };
            }
        }

        if (changed) {
            commitCanvasChange();
        } else if (typeof window.renderSelectionOverlays === 'function') {
            window.renderSelectionOverlays();
        }

        return { applied: true, changed, count: items.length, effectiveMode: ref.effectiveMode };
    }

    function canDistribute(itemsOrCount, explicitMode) {
        const mode = normalizeMode(explicitMode || window._opAlignMode);
        const count = Array.isArray(itemsOrCount) ? itemsOrCount.length : Number(itemsOrCount || 0);
        return mode === 'selection' ? count >= 3 : count >= 2;
    }

    function distribute(axis, opts) {
        const isHoriz = axis === 'horizontal' || axis === 'horizontally' || axis === 'h';
        const isVert = axis === 'vertical' || axis === 'vertically' || axis === 'v';
        if (!isHoriz && !isVert) return { applied: false, reason: 'unknown-axis' };

        const unlocked = getUnlockedSelectedElements();
        const mode = normalizeMode((opts && opts.mode) || window._opAlignMode);
        if (!canDistribute(unlocked, mode)) {
            return { applied: false, reason: 'insufficient-selection' };
        }

        const items = unlocked.map(measureElement);
        const sorted = items.slice().sort((a, b) => {
            if (isHoriz) return (a.l - b.l) || (a.t - b.t);
            return (a.t - b.t) || (a.l - b.l);
        });

        let spanStart;
        let spanEnd;
        if (mode === 'selection') {
            if (isHoriz) {
                spanStart = sorted[0].l;
                spanEnd = sorted[sorted.length - 1].r;
            } else {
                spanStart = sorted[0].t;
                spanEnd = sorted[sorted.length - 1].b;
            }
        } else {
            const ref = getReferenceBounds(sorted, mode);
            if (isHoriz) {
                spanStart = ref.left;
                spanEnd = ref.right;
            } else {
                spanStart = ref.top;
                spanEnd = ref.bottom;
            }
        }

        const sumSizes = sorted.reduce((acc, it) => acc + (isHoriz ? it.w : it.h), 0);
        const gap = ((spanEnd - spanStart) - sumSizes) / (sorted.length - 1);

        let cursor = spanStart;
        let changed = false;
        for (let i = 0; i < sorted.length; i++) {
            const it = sorted[i];
            const rounded = roundPx(cursor);
            if (isHoriz) {
                if (Math.abs(rounded - it.l) > 0.005) changed = true;
                it.el.style.left = rounded + 'px';
                cursor += it.w + gap;
            } else {
                if (Math.abs(rounded - it.t) > 0.005) changed = true;
                it.el.style.top = rounded + 'px';
                cursor += it.h + gap;
            }
        }

        if (changed) {
            commitCanvasChange();
        } else if (typeof window.renderSelectionOverlays === 'function') {
            window.renderSelectionOverlays();
        }

        return { applied: true, changed, count: sorted.length, gap: roundPx(gap), mode };
    }

    function setMode(mode) {
        window._opAlignMode = normalizeMode(mode);
        const menu = document.getElementById('align-dropdown');
        if (menu && menu.style.display === 'block') {
            renderMenuContents(menu);
        }
        return window._opAlignMode;
    }

    function getMode() {
        return normalizeMode(window._opAlignMode);
    }

    function getIconSvg(type) {
        const common = 'viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
        switch (type) {
            case 'left':
                return `<svg ${common}><line x1="2.5" y1="2" x2="2.5" y2="14"/><rect x="5" y="3.5" width="9" height="3.2" rx="0.6" fill="currentColor" stroke="none"/><rect x="5" y="9.3" width="5.5" height="3.2" rx="0.6" fill="currentColor" stroke="none"/></svg>`;
            case 'center':
                return `<svg ${common}><line x1="8" y1="1.8" x2="8" y2="14.2"/><rect x="3" y="3.5" width="10" height="3.2" rx="0.6" fill="currentColor" stroke="none"/><rect x="4.75" y="9.3" width="6.5" height="3.2" rx="0.6" fill="currentColor" stroke="none"/></svg>`;
            case 'right':
                return `<svg ${common}><line x1="13.5" y1="2" x2="13.5" y2="14"/><rect x="2" y="3.5" width="9" height="3.2" rx="0.6" fill="currentColor" stroke="none"/><rect x="5.5" y="9.3" width="5.5" height="3.2" rx="0.6" fill="currentColor" stroke="none"/></svg>`;
            case 'top':
                return `<svg ${common}><line x1="2" y1="2.5" x2="14" y2="2.5"/><rect x="3.5" y="5" width="3.2" height="9" rx="0.6" fill="currentColor" stroke="none"/><rect x="9.3" y="5" width="3.2" height="5.5" rx="0.6" fill="currentColor" stroke="none"/></svg>`;
            case 'middle':
                return `<svg ${common}><line x1="1.8" y1="8" x2="14.2" y2="8"/><rect x="3.5" y="3" width="3.2" height="10" rx="0.6" fill="currentColor" stroke="none"/><rect x="9.3" y="4.75" width="3.2" height="6.5" rx="0.6" fill="currentColor" stroke="none"/></svg>`;
            case 'bottom':
                return `<svg ${common}><line x1="2" y1="13.5" x2="14" y2="13.5"/><rect x="3.5" y="2" width="3.2" height="9" rx="0.6" fill="currentColor" stroke="none"/><rect x="9.3" y="5.5" width="3.2" height="5.5" rx="0.6" fill="currentColor" stroke="none"/></svg>`;
            case 'dist-h':
                return `<svg ${common}><line x1="2" y1="2.2" x2="2" y2="13.8"/><line x1="14" y1="2.2" x2="14" y2="13.8"/><rect x="5" y="4.5" width="2.3" height="7" rx="0.5" fill="currentColor" stroke="none"/><rect x="8.7" y="4.5" width="2.3" height="7" rx="0.5" fill="currentColor" stroke="none"/></svg>`;
            case 'dist-v':
                return `<svg ${common}><line x1="2.2" y1="2" x2="13.8" y2="2"/><line x1="2.2" y1="14" x2="13.8" y2="14"/><rect x="4.5" y="5" width="7" height="2.3" rx="0.5" fill="currentColor" stroke="none"/><rect x="4.5" y="8.7" width="7" height="2.3" rx="0.5" fill="currentColor" stroke="none"/></svg>`;
            default:
                return `<svg ${common}><line x1="2.5" y1="2" x2="2.5" y2="14"/><rect x="5" y="3.5" width="9" height="3.2" rx="0.6" fill="currentColor" stroke="none"/><rect x="5" y="9.3" width="5.5" height="3.2" rx="0.6" fill="currentColor" stroke="none"/></svg>`;
        }
    }

    function closeAlignMenu() {
        const menu = document.getElementById('align-dropdown');
        if (menu) menu.style.display = 'none';
    }

    function renderMenuContents(menu) {
        const mode = getMode();
        const unlocked = getUnlockedSelectedElements();
        const hasSelection = unlocked.length > 0;
        const distAllowed = canDistribute(unlocked, mode);
        const alignDisabledTitle = hasSelection ? '' : 'Select at least 1 unlocked object on the canvas';
        const distDisabledTitle = mode === 'selection'
            ? 'Select 3 or more unlocked objects to distribute evenly (or switch Relative To Margin Guides / Page)'
            : 'Select 2 or more unlocked objects to distribute evenly';

        const modeSubtitle = (unlocked.length === 1 && mode === 'selection')
            ? '<span class="op-align-hint">1 object: Auto Margin Guides</span>'
            : (unlocked.length > 1 ? `<span class="op-align-hint">${unlocked.length} unlocked</span>` : '<span class="op-align-hint">No selection</span>');

        const alignItems = [
            { kind: 'left', label: 'Align Left', icon: 'left' },
            { kind: 'center', label: 'Align Center', icon: 'center' },
            { kind: 'right', label: 'Align Right', icon: 'right' },
            { kind: 'top', label: 'Align Top', icon: 'top' },
            { kind: 'middle', label: 'Align Middle', icon: 'middle' },
            { kind: 'bottom', label: 'Align Bottom', icon: 'bottom' }
        ];

        const distItems = [
            { axis: 'horizontal', label: 'Distribute Horizontally', icon: 'dist-h' },
            { axis: 'vertical', label: 'Distribute Vertically', icon: 'dist-v' }
        ];

        const modes = [
            { id: 'selection', label: 'Selected Objects (Auto Margin for 1)' },
            { id: 'margins', label: 'Margin Guides' },
            { id: 'page', label: 'Page' }
        ];

        let html = `
            <div class="op-align-header">
                <span>Align &amp; Distribute</span>
                ${modeSubtitle}
            </div>
            <div class="op-align-scroll">
                <div class="op-align-section-label">Align Objects</div>
                ${alignItems.map(it => `
                    <div class="op-align-item ${hasSelection ? '' : 'disabled'}" data-align-action="${it.kind}" title="${alignDisabledTitle || it.label}">
                        <span class="op-align-icon">${getIconSvg(it.icon)}</span>
                        <span class="op-align-text">${it.label}</span>
                    </div>
                `).join('')}

                <div class="op-align-divider"></div>
                <div class="op-align-section-label">Distribute Objects</div>
                ${distItems.map(it => `
                    <div class="op-align-item ${distAllowed ? '' : 'disabled'}" data-dist-action="${it.axis}" title="${distAllowed ? it.label : distDisabledTitle}">
                        <span class="op-align-icon">${getIconSvg(it.icon)}</span>
                        <span class="op-align-text">${it.label}</span>
                    </div>
                `).join('')}

                <div class="op-align-divider"></div>
                <div class="op-align-section-label">Align Relative To</div>
                ${modes.map(m => {
                    const active = mode === m.id;
                    return `
                        <div class="op-align-item ${active ? 'active' : ''}" data-align-mode="${m.id}">
                            <span class="op-align-check-slot">${active ? '<i class="fas fa-check op-align-check"></i>' : ''}</span>
                            <span class="op-align-text">${m.label}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        menu.innerHTML = html;

        menu.querySelectorAll('[data-align-action]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                if (el.classList.contains('disabled')) return;
                align(el.getAttribute('data-align-action'));
                closeAlignMenu();
            });
        });

        menu.querySelectorAll('[data-dist-action]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                if (el.classList.contains('disabled')) return;
                distribute(el.getAttribute('data-dist-action'));
                closeAlignMenu();
            });
        });

        menu.querySelectorAll('[data-align-mode]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                setMode(el.getAttribute('data-align-mode'));
            });
        });
    }

    function positionMenu(menu, triggerEl) {
        menu.style.display = 'block';
        menu.style.position = 'fixed';
        menu.style.zIndex = '10050';

        const mw = 276;
        menu.style.width = mw + 'px';

        const vw = window.innerWidth || 1280;
        const vh = window.innerHeight || 800;

        if (triggerEl && typeof triggerEl.getBoundingClientRect === 'function') {
            const rect = triggerEl.getBoundingClientRect();
            const topPos = Math.round(rect.bottom + 2);
            menu.style.left = Math.max(8, Math.min(rect.left, vw - mw - 8)) + 'px';
            menu.style.top = topPos + 'px';

            const headerEl = menu.querySelector('.op-align-header');
            const scrollEl = menu.querySelector('.op-align-scroll');
            if (scrollEl) {
                const headerH = headerEl ? headerEl.offsetHeight : 34;
                const avail = vh - topPos - headerH - 14;
                scrollEl.style.maxHeight = Math.max(150, Math.min(540, avail)) + 'px';
            }
        }
    }

    function toggleMenu(triggerEl) {
        let menu = document.getElementById('align-dropdown');
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'align-dropdown';
            menu.className = 'dropdown-menu op-font-scheme-menu op-align-menu';
            document.body.appendChild(menu);
        }

        const wasOpen = menu.style.display === 'block';
        document.querySelectorAll('.dropdown-menu').forEach(d => { d.style.display = 'none'; });
        if (wasOpen) return;

        renderMenuContents(menu);
        positionMenu(menu, triggerEl);
    }

    function getContextMenuHtml(ctxMenuSystem) {
        if (!ctxMenuSystem || typeof ctxMenuSystem.buildItemRaw !== 'function') return '';
        const mode = getMode();
        const unlocked = getUnlockedSelectedElements();
        const hasSelection = unlocked.length > 0;
        const distAllowed = canDistribute(unlocked, mode);
        const alignDisabledClass = hasSelection ? '' : 'disabled';
        const distDisabledClass = distAllowed ? '' : 'disabled';
        const checkHtml = '<i class="fas fa-check op-align-ctx-check" style="color:var(--ui-theme-color);"></i>';
        const emptySlot = '<span style="display:inline-block; width:14px;"></span>';

        const sub = [
            ctxMenuSystem.buildItemRaw('Align Left', getIconSvg('left'), "if(window.AlignDistribute) AlignDistribute.align('left')", alignDisabledClass),
            ctxMenuSystem.buildItemRaw('Align Center', getIconSvg('center'), "if(window.AlignDistribute) AlignDistribute.align('center')", alignDisabledClass),
            ctxMenuSystem.buildItemRaw('Align Right', getIconSvg('right'), "if(window.AlignDistribute) AlignDistribute.align('right')", alignDisabledClass),
            ctxMenuSystem.buildItemRaw('Align Top', getIconSvg('top'), "if(window.AlignDistribute) AlignDistribute.align('top')", alignDisabledClass),
            ctxMenuSystem.buildItemRaw('Align Middle', getIconSvg('middle'), "if(window.AlignDistribute) AlignDistribute.align('middle')", alignDisabledClass),
            ctxMenuSystem.buildItemRaw('Align Bottom', getIconSvg('bottom'), "if(window.AlignDistribute) AlignDistribute.align('bottom')", alignDisabledClass),
            ctxMenuSystem.buildDivider(),
            ctxMenuSystem.buildItemRaw('Distribute Horizontally', getIconSvg('dist-h'), "if(window.AlignDistribute) AlignDistribute.distribute('horizontal')", distDisabledClass),
            ctxMenuSystem.buildItemRaw('Distribute Vertically', getIconSvg('dist-v'), "if(window.AlignDistribute) AlignDistribute.distribute('vertical')", distDisabledClass),
            ctxMenuSystem.buildDivider(),
            ctxMenuSystem.buildItemRaw('Selected Objects (Auto Margin for 1)', mode === 'selection' ? checkHtml : emptySlot, "if(window.AlignDistribute) AlignDistribute.setMode('selection')"),
            ctxMenuSystem.buildItemRaw('Margin Guides', mode === 'margins' ? checkHtml : emptySlot, "if(window.AlignDistribute) AlignDistribute.setMode('margins')"),
            ctxMenuSystem.buildItemRaw('Page', mode === 'page' ? checkHtml : emptySlot, "if(window.AlignDistribute) AlignDistribute.setMode('page')")
        ].join('');

        return ctxMenuSystem.buildFlyoutItem('Align &amp; Distribute', 'fa-align-center', sub);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAlignMenu();
        }
    });

    window.addEventListener('resize', () => {
        const menu = document.getElementById('align-dropdown');
        if (menu && menu.style.display === 'block') {
            closeAlignMenu();
        }
    });

    const api = {
        align,
        distribute,
        setMode,
        getMode,
        canDistribute,
        getUnlockedSelectedElements,
        getReferenceBounds,
        toggleMenu,
        closeMenu: closeAlignMenu,
        getContextMenuHtml,
        getIconSvg
    };

    window.AlignDistribute = api;
    window.toggleAlignMenu = toggleMenu;
    window.alignSelectedObjects = align;
    window.distributeSelectedObjects = distribute;
    window.setAlignReferenceMode = setMode;
})();
