window._shadowSidebarOwnerEl = null;

function stripDropShadowFilter(filterStr) {
    return (filterStr || '')
        .replace(/drop-shadow\((?:[^)(]+|\([^)(]*\))*\)/gi, '')
        .replace(/\bnone\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractDropShadowExpr(filterStr) {
    if (!filterStr || !/drop-shadow\s*\(/i.test(filterStr)) return '';
    const matches = filterStr.match(/drop-shadow\((?:[^)(]+|\([^)(]*\))*\)/gi);
    return matches && matches.length > 0 ? matches[matches.length - 1].trim() : '';
}

function getShadowCandidateNodes(el) {
    if (!el) return [];
    const inner = el.querySelector('.element-content') || el;
    const nodes = [inner];
    if (el !== inner) nodes.push(el);
    el.querySelectorAll('img, svg, .element-content > div').forEach(node => {
        if (node.closest('.element-border-art, .border-art-wrapper, .resize-handle, .selected-overlay, .element-quick-actions')) return;
        if (!nodes.includes(node)) nodes.push(node);
    });
    return nodes;
}

window.getElementDropShadowInfo = function(el) {
    if (!el) return null;
    const inner = el.querySelector('.element-content') || el;
    const nodes = getShadowCandidateNodes(el);
    for (const node of nodes) {
        const inlineFilter = (node.style && node.style.filter) || '';
        const expr = extractDropShadowExpr(inlineFilter);
        if (expr) {
            return { node, inner, filterStr: inlineFilter, dropShadowExpr: expr };
        }
    }
    return null;
};

window.normalizeDropShadowForElement = function(el) {
    const info = window.getElementDropShadowInfo(el);
    if (!info) return null;
    if (info.node === info.inner) return info;

    info.node.style.filter = stripDropShadowFilter(info.node.style.filter);
    const baseInnerFilter = stripDropShadowFilter(info.inner.style.filter);
    info.inner.style.filter = (baseInnerFilter ? `${baseInnerFilter} ${info.dropShadowExpr}` : info.dropShadowExpr).trim();
    return {
        node: info.inner,
        inner: info.inner,
        filterStr: info.inner.style.filter,
        dropShadowExpr: info.dropShadowExpr
    };
};

function parseCssColorToHexAlpha(colorStr) {
    if (!colorStr) return { hex: '#000000', alpha: 0.6 };
    const clean = colorStr.trim();
    let r = 0, g = 0, b = 0, a = 1;

    const rgbMatch = clean.match(/^rgba?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)\s*[,\s]\s*([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);
    if (rgbMatch) {
        r = Math.max(0, Math.min(255, Math.round(parseFloat(rgbMatch[1]))));
        g = Math.max(0, Math.min(255, Math.round(parseFloat(rgbMatch[2]))));
        b = Math.max(0, Math.min(255, Math.round(parseFloat(rgbMatch[3]))));
        if (rgbMatch[4] !== undefined) {
            const rawA = rgbMatch[4];
            a = rawA.endsWith('%') ? parseFloat(rawA) / 100 : parseFloat(rawA);
        }
    } else if (clean.startsWith('#')) {
        let hexVal = clean.slice(1);
        if (hexVal.length === 3 || hexVal.length === 4) {
            hexVal = hexVal.split('').map(c => c + c).join('');
        }
        if (hexVal.length === 6 || hexVal.length === 8) {
            r = parseInt(hexVal.slice(0, 2), 16) || 0;
            g = parseInt(hexVal.slice(2, 4), 16) || 0;
            b = parseInt(hexVal.slice(4, 6), 16) || 0;
            if (hexVal.length === 8) a = (parseInt(hexVal.slice(6, 8), 16) || 0) / 255;
        }
    } else if (document.body) {
        const probe = document.createElement('span');
        probe.style.color = clean;
        probe.style.display = 'none';
        document.body.appendChild(probe);
        const resolved = window.getComputedStyle(probe).color || '';
        probe.remove();
        if (resolved && resolved !== clean) {
            return parseCssColorToHexAlpha(resolved);
        }
    }

    a = Math.max(0, Math.min(1, isNaN(a) ? 1 : a));
    const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return { hex, alpha: a };
}

window.parseDropShadowCss = function(dropShadowExpr) {
    if (!dropShadowExpr) return null;
    const innerMatch = dropShadowExpr.match(/^drop-shadow\((.*)\)$/i);
    if (!innerMatch) return null;
    const body = innerMatch[1].trim();

    let colorToken = '';
    const fnColorMatch = body.match(/(?:rgba?|hsla?)\([^)]+\)/i);
    if (fnColorMatch) {
        colorToken = fnColorMatch[0];
    } else {
        const hexMatch = body.match(/#[0-9a-fA-F]{3,8}\b/);
        if (hexMatch) {
            colorToken = hexMatch[0];
        } else {
            const wordMatch = body.match(/(?:^|\s)([a-zA-Z]+)(?=\s|$)/);
            if (wordMatch && !/^px$/i.test(wordMatch[1])) {
                colorToken = wordMatch[1];
            }
        }
    }

    const lengthsStr = (colorToken ? body.replace(colorToken, ' ') : body).trim();
    const nums = [];
    for (const part of lengthsStr.split(/\s+/)) {
        if (!part) continue;
        const val = parseFloat(part);
        if (!isNaN(val)) nums.push(val);
    }
    if (nums.length < 2) return null;

    const { hex, alpha } = parseCssColorToHexAlpha(colorToken || 'rgba(0,0,0,1)');
    return {
        x: nums[0],
        y: nums[1],
        blur: nums.length >= 3 ? Math.max(0, nums[2]) : 0,
        hex,
        alpha
    };
};

window.removeShadowFromSelected = function() {
    if (typeof state === 'undefined' || !state.selectedEl) return;
    getShadowCandidateNodes(state.selectedEl).forEach(node => {
        if (node.style && node.style.filter && /drop-shadow/i.test(node.style.filter)) {
            node.style.filter = stripDropShadowFilter(node.style.filter);
        }
    });
    window.setShadowPaneVisibility(false);
    if (typeof updateThumbnails === 'function') updateThumbnails();
    if (typeof pushHistory === 'function') pushHistory();
};

window.syncShadowPaneForSelection = function(activeEl) {
    const panel = document.getElementById('op-shadow-sidebar');
    if (!panel || !panel.classList.contains('visible')) return;
    const hasMulti = typeof state !== 'undefined' && Array.isArray(state.multiSelected) && state.multiSelected.length > 0;
    const currentEl = (activeEl !== undefined)
        ? activeEl
        : (typeof state !== 'undefined' ? state.selectedEl : null);
    const owner = window._shadowSidebarOwnerEl;
    if (hasMulti || !currentEl || !currentEl.isConnected || (owner && currentEl !== owner)) {
        window.setShadowPaneVisibility(false);
    }
};

window.setShadowPaneVisibility = function(visible, targetEl) {
    if (!visible) {
        window._shadowSidebarOwnerEl = null;
        const existingPanel = document.getElementById('op-shadow-sidebar');
        if (existingPanel) {
            existingPanel.classList.remove('visible');
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen && window.CustomColorPicker.anchor && existingPanel.contains(window.CustomColorPicker.anchor) && typeof window.CustomColorPicker.close === 'function') {
                window.CustomColorPicker.close();
            }
        }
        if (typeof window.syncWorkspaceLayout === 'function') window.syncWorkspaceLayout();
        return;
    }

    const ownerEl = targetEl || (typeof state !== 'undefined' ? state.selectedEl : null);
    if (!ownerEl) {
        window.setShadowPaneVisibility(false);
        return;
    }

    let panel = document.getElementById('op-shadow-sidebar');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'op-shadow-sidebar';
        panel.className = 'sidebar-panel op-sidebar';
        panel.innerHTML = `
            <div class="op-sidebar-header">
                <span class="op-sidebar-title">Shadow / Glow Options</span>
                <div class="op-sidebar-top-btns">
                    <button class="custom-dialog-close" onclick="window.setShadowPaneVisibility(false)"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="op-sidebar-section">
                <div class="op-sidebar-label">Shadow Color</div>
                <input type="hidden" id="shadow-color-input" value="#000000">
                <div id="shadow-color-swatch" style="width: 100%; height: 30px; border: 1px solid #ccc; cursor: pointer; background-color:#000000; border-radius:8px;" onclick="CustomColorPicker.open(this, document.getElementById('shadow-color-input').value, (c) => { document.getElementById('shadow-color-input').value = c; this.style.backgroundColor = c; window.updateShadowFromSliders(); })"></div>
            </div>
            <div class="op-sidebar-section">
                <div class="op-sidebar-label" style="display:flex; justify-content:space-between;"><span>Transparency</span> <span style="font-weight:500;"><span id="shadow-alpha-val">60</span>%</span></div>
                <input type="range" id="shadow-alpha-slider" min="0" max="100" value="60" class="op-sidebar-slider" oninput="document.getElementById('shadow-alpha-val').innerText=this.value; window.updateShadowFromSliders()">
            </div>
            <div class="op-sidebar-section">
                <div class="op-sidebar-label" style="display:flex; justify-content:space-between;"><span>Blur Radius</span> <span style="font-weight:500;"><span id="shadow-blur-val">10</span>px</span></div>
                <input type="range" id="shadow-blur-slider" min="0" max="100" value="10" class="op-sidebar-slider" oninput="document.getElementById('shadow-blur-val').innerText=this.value; window.updateShadowFromSliders()">
            </div>
            <div class="op-sidebar-section">
                <div class="op-sidebar-label" style="display:flex; justify-content:space-between;"><span>X Offset</span> <span style="font-weight:500;"><span id="shadow-x-val">5</span>px</span></div>
                <input type="range" id="shadow-x-slider" min="-100" max="100" value="5" class="op-sidebar-slider" oninput="document.getElementById('shadow-x-val').innerText=this.value; window.updateShadowFromSliders()">
            </div>
            <div class="op-sidebar-section">
                <div class="op-sidebar-label" style="display:flex; justify-content:space-between;"><span>Y Offset</span> <span style="font-weight:500;"><span id="shadow-y-val">5</span>px</span></div>
                <input type="range" id="shadow-y-slider" min="-100" max="100" value="5" class="op-sidebar-slider" oninput="document.getElementById('shadow-y-val').innerText=this.value; window.updateShadowFromSliders()">
            </div>
            <div class="op-sidebar-section" style="margin-top:8px;">
                <button type="button" id="shadow-remove-btn" class="op-sidebar-btn danger" style="justify-content:center; width:100%;" onclick="window.removeShadowFromSelected()">
                    <i class="fas fa-trash-alt"></i> Remove Shadow / Glow
                </button>
            </div>
        `;
        document.body.appendChild(panel);
        panel.querySelectorAll('.op-sidebar-slider').forEach(s => {
            if (typeof window.updateSliderFill === 'function') window.updateSliderFill(s);
        });
    }
    
    window._shadowSidebarOwnerEl = ownerEl;
    if (typeof window.retractOtherSidebars === 'function') {
        window.retractOtherSidebars('op-shadow-sidebar');
    } else {
        document.querySelectorAll('.sidebar-panel.visible, .op-sidebar.visible').forEach(el => {
            if (el !== panel) el.classList.remove('visible');
        });
    }
    panel.classList.add('visible');
    window.parseShadowToSliders();
    if (typeof window.syncWorkspaceLayout === 'function') window.syncWorkspaceLayout();
};


window.parseShadowToSliders = function() {
    if (typeof state === 'undefined' || !state.selectedEl) return;
    const info = window.getElementDropShadowInfo(state.selectedEl);
    if (!info) return;

    const parsed = window.parseDropShadowCss(info.dropShadowExpr);
    if (!parsed) return;

    const sx = document.getElementById('shadow-x-slider');
    const sy = document.getElementById('shadow-y-slider');
    const sb = document.getElementById('shadow-blur-slider');
    const sa = document.getElementById('shadow-alpha-slider');
    const transparency = Math.round((1 - parsed.alpha) * 100);

    if (sx) { sx.value = parsed.x; document.getElementById('shadow-x-val').innerText = parsed.x; if (typeof window.updateSliderFill === 'function') window.updateSliderFill(sx); }
    if (sy) { sy.value = parsed.y; document.getElementById('shadow-y-val').innerText = parsed.y; if (typeof window.updateSliderFill === 'function') window.updateSliderFill(sy); }
    if (sb) { sb.value = parsed.blur; document.getElementById('shadow-blur-val').innerText = parsed.blur; if (typeof window.updateSliderFill === 'function') window.updateSliderFill(sb); }
    if (sa) { sa.value = transparency; document.getElementById('shadow-alpha-val').innerText = transparency; if (typeof window.updateSliderFill === 'function') window.updateSliderFill(sa); }

    const colorInput = document.getElementById('shadow-color-input');
    if (colorInput) colorInput.value = parsed.hex;
    const swatch = document.getElementById('shadow-color-swatch');
    if (swatch) swatch.style.backgroundColor = parsed.hex;
};


window.updateShadowFromSliders = function() {
    if (typeof state === 'undefined' || !state.selectedEl) return;
    const inner = state.selectedEl.querySelector('.element-content') || state.selectedEl;
    getShadowCandidateNodes(state.selectedEl).forEach(node => {
        if (node !== inner && node.style && node.style.filter && /drop-shadow/i.test(node.style.filter)) {
            node.style.filter = stripDropShadowFilter(node.style.filter);
        }
    });

    const x = document.getElementById('shadow-x-slider').value;
    const y = document.getElementById('shadow-y-slider').value;
    const blur = document.getElementById('shadow-blur-slider').value;
    const alphaSlider = document.getElementById('shadow-alpha-slider').value;
    const hex = document.getElementById('shadow-color-input').value;

    const { hex: normHex } = parseCssColorToHexAlpha(hex);
    const r = parseInt(normHex.substring(1, 3), 16);
    const g = parseInt(normHex.substring(3, 5), 16);
    const b = parseInt(normHex.substring(5, 7), 16);
    const a = 1 - (alphaSlider / 100);

    const dropShadowStr = `drop-shadow(${x}px ${y}px ${blur}px rgba(${r},${g},${b},${a}))`;

    const currentFilter = (inner.style.filter || '').replace(/\bnone\b/gi, '').trim();
    if (/drop-shadow\s*\(/i.test(currentFilter)) {
        inner.style.filter = currentFilter.replace(/drop-shadow\((?:[^)(]+|\([^)(]*\))*\)/gi, dropShadowStr).trim();
    } else {
        inner.style.filter = (currentFilter ? `${currentFilter} ${dropShadowStr}` : dropShadowStr).trim();
    }

    state.selectedEl.style.overflow = 'visible';
    inner.style.overflow = 'visible';
    const childImg = state.selectedEl.querySelector('img');
    if (childImg) {
        inner.style.clipPath = '';
        inner.style.webkitClipPath = '';
    }

    clearTimeout(window.shadowHistoryTimeout);
    window.shadowHistoryTimeout = setTimeout(() => {
        if (typeof pushHistory === 'function') pushHistory();
    }, 500);
};

(function installShadowPaneAutoRetract() {
    const ensureHooks = () => {
        if (typeof window.selectElement === 'function' && !window.selectElement._shadowPaneHooked) {
            const origSelect = window.selectElement;
            const wrappedSelect = function(el) {
                const res = origSelect.apply(this, arguments);
                try {
                    if (typeof window.syncShadowPaneForSelection === 'function') {
                        window.syncShadowPaneForSelection(el);
                    }
                } catch (err) {}
                return res;
            };
            wrappedSelect._shadowPaneHooked = true;
            window.selectElement = wrappedSelect;
        }
        if (typeof window.deselect === 'function' && !window.deselect._shadowPaneHooked) {
            const origDeselect = window.deselect;
            const wrappedDeselect = function() {
                const res = origDeselect.apply(this, arguments);
                try {
                    if (!window._isTransitioningSelection && typeof window.syncShadowPaneForSelection === 'function') {
                        window.syncShadowPaneForSelection(null);
                    }
                } catch (err) {}
                return res;
            };
            wrappedDeselect._shadowPaneHooked = true;
            window.deselect = wrappedDeselect;
        }
    };

    ensureHooks();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureHooks);
    }
    setTimeout(ensureHooks, 500);
    setTimeout(ensureHooks, 1700);

    // Sync after pointer interactions (catches marquee multi-select, Ctrl+Click multi-select, and element deletion)
    if (!window._shadowPanePointerSyncBound) {
        window._shadowPanePointerSyncBound = true;
        const scheduleSync = () => {
            queueMicrotask(() => {
                if (typeof window.syncShadowPaneForSelection === 'function') {
                    window.syncShadowPaneForSelection();
                }
            });
        };
        document.addEventListener('mousedown', (e) => {
            const panel = document.getElementById('op-shadow-sidebar');
            if (!panel || !panel.classList.contains('visible')) return;
            if (e.target && (e.target.closest('#op-shadow-sidebar') || e.target.closest('#custom-color-picker'))) return;
            scheduleSync();
        });
        document.addEventListener('mouseup', () => {
            const panel = document.getElementById('op-shadow-sidebar');
            if (panel && panel.classList.contains('visible')) scheduleSync();
        });
    }
})();
