function setPageSize(format) {
    const dpi = (typeof state !== 'undefined' && state.dpi) ? state.dpi : 96;
    let w = '794px';
    let h = '1123px';
    
    const standardSizes96 = {
        'A4': { w: '794px', h: '1123px' },
        'Letter': { w: '816px', h: '1056px' },
        'A3': { w: '1123px', h: '1587px' },
        'A5': { w: '559px', h: '794px' },
        'Legal': { w: '816px', h: '1344px' },
        'Tabloid': { w: '1056px', h: '1632px' },
        'BusinessCard': { w: '336px', h: '192px' },
        'Square': { w: '794px', h: '794px' }
    };

    if (dpi === 96 && standardSizes96[format]) {
        w = standardSizes96[format].w;
        h = standardSizes96[format].h;
    } else if (window.UnitConversionService) {
        const dims = window.UnitConversionService.getPresetDimensions(format, 'px', dpi);
        w = dims.widthPx + 'px';
        h = dims.heightPx + 'px';
    } else {
        if (standardSizes96[format]) {
            w = standardSizes96[format].w;
            h = standardSizes96[format].h;
        }
    }
    
    if (typeof state !== 'undefined' && state.isSpreadMode) {
        w = (parseInt(w) * 2) + 'px';
    }
    
    paper.style.width = w;
    paper.style.height = h;
    
    // Auto-update the UI format icon immediately
    if (typeof window.setPageFormatIcon === 'function') window.setPageFormatIcon(format);
    
    if (typeof state !== 'undefined' && state.pages && state.pages.length > 0 && state.pages[state.currentPageIndex]) {
        const isLand = parseFloat(w) >= parseFloat(h);
        state.pages[state.currentPageIndex].width = w;
        state.pages[state.currentPageIndex].height = h;
        state.pages[state.currentPageIndex].dpi = dpi;
        state.pages[state.currentPageIndex].orientation = isLand ? 'landscape' : 'portrait';
        if (!window._orientedPagesRegistry) window._orientedPagesRegistry = new Set();
        window._orientedPagesRegistry.add(state.pages[state.currentPageIndex].id);
        pushHistory();
    }
    if (typeof window.syncRulers === 'function') window.syncRulers();
    if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
    if (typeof window.updateDpiDisplay === 'function') window.updateDpiDisplay(dpi);
    
    const sizeDrop = document.getElementById('size-dropdown');
    if(sizeDrop) sizeDrop.style.display = 'none';
}

// --- HELPER: Scale CSS Pixel Values ---
window.scaleCssPxValues = function(str, scale) {
    if (!str || typeof str !== 'string') return str;
    return str.replace(/([0-9]*\.?[0-9]+)\s*px/gi, (match, num) => {
        const val = parseFloat(num);
        if (isNaN(val)) return match;
        const formatted = (Math.round(val * scale * 100) / 100).toString();
        return formatted + 'px';
    });
};

// --- HELPER: Scale DOM Element Content and Styling ---
window.scaleElementContentDOM = function(el, sx, sy, s) {
    if (!el || !el.style) return;
    if (typeof s !== 'number') s = (sx + sy) / 2;

    // 1. Element bounding coordinates
    const curL = parseFloat(el.style.left) || 0;
    const curT = parseFloat(el.style.top) || 0;
    const curW = parseFloat(el.style.width) || 0;
    const curH = parseFloat(el.style.height) || 0;

    el.style.left = (curL * sx) + 'px';
    el.style.top = (curT * sy) + 'px';
    el.style.width = (curW * sx) + 'px';
    el.style.height = (curH * sy) + 'px';

    if (el.hasAttribute('data-original-font-size')) {
        const origFs = parseFloat(el.getAttribute('data-original-font-size'));
        if (!isNaN(origFs)) {
            el.setAttribute('data-original-font-size', (origFs * s).toFixed(1));
        }
    }

    if (el.style.borderRadius && el.style.borderRadius.includes('px')) {
        el.style.borderRadius = window.scaleCssPxValues(el.style.borderRadius, s);
    }
    if (el.style.borderWidth && el.style.borderWidth.includes('px')) {
        el.style.borderWidth = window.scaleCssPxValues(el.style.borderWidth, s);
    }

    // 2. Element Content
    const content = el.querySelector('.element-content');
    if (content) {
        if (content.style.fontSize && content.style.fontSize.includes('px')) {
            content.style.fontSize = window.scaleCssPxValues(content.style.fontSize, s);
        } else {
            const compFs = parseFloat(window.getComputedStyle(content).fontSize) || 16;
            content.style.fontSize = (Math.round(compFs * s * 100) / 100) + 'px';
        }
        if (content.style.lineHeight && content.style.lineHeight.includes('px')) {
            content.style.lineHeight = window.scaleCssPxValues(content.style.lineHeight, s);
        }
        if (content.style.padding && content.style.padding.includes('px')) {
            content.style.padding = window.scaleCssPxValues(content.style.padding, s);
        }
        if (content.style.borderRadius && content.style.borderRadius.includes('px')) {
            content.style.borderRadius = window.scaleCssPxValues(content.style.borderRadius, s);
        }

        // Child text/table/formatting nodes
        content.querySelectorAll('*').forEach(child => {
            if (child.style.fontSize && child.style.fontSize.includes('px')) {
                child.style.fontSize = window.scaleCssPxValues(child.style.fontSize, s);
            } else if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(child.tagName)) {
                const compFs = parseFloat(window.getComputedStyle(child).fontSize);
                if (compFs && !isNaN(compFs)) {
                    child.style.fontSize = (Math.round(compFs * s * 100) / 100) + 'px';
                }
            } else if (child.tagName === 'FONT' && child.hasAttribute('size')) {
                const szMap = { '1': 10, '2': 13, '3': 16, '4': 18, '5': 24, '6': 32, '7': 48 };
                const basePx = szMap[child.getAttribute('size')] || 16;
                child.style.fontSize = (Math.round(basePx * s * 100) / 100) + 'px';
                child.removeAttribute('size');
            }

            if (child.style.lineHeight && child.style.lineHeight.includes('px')) {
                child.style.lineHeight = window.scaleCssPxValues(child.style.lineHeight, s);
            }
            if (child.style.padding && child.style.padding.includes('px')) {
                child.style.padding = window.scaleCssPxValues(child.style.padding, s);
            }
            if (child.style.margin && child.style.margin.includes('px')) {
                child.style.margin = window.scaleCssPxValues(child.style.margin, s);
            }
            if (child.style.borderWidth && child.style.borderWidth.includes('px')) {
                child.style.borderWidth = window.scaleCssPxValues(child.style.borderWidth, s);
            }
            if (child.style.borderRadius && child.style.borderRadius.includes('px')) {
                child.style.borderRadius = window.scaleCssPxValues(child.style.borderRadius, s);
            }

            if (child.tagName === 'TD' || child.tagName === 'TH') {
                if (child.style.width && child.style.width.includes('px')) {
                    child.style.width = (parseFloat(child.style.width) * sx) + 'px';
                }
                if (child.style.height && child.style.height.includes('px')) {
                    child.style.height = (parseFloat(child.style.height) * sy) + 'px';
                }
            }
        });

        // Cropped images with explicit pixel dimensions/offsets
        const img = content.querySelector('img');
        if (img) {
            ['left', 'width', 'maxWidth'].forEach(prop => {
                if (img.style[prop] && img.style[prop].includes('px')) {
                    img.style[prop] = (parseFloat(img.style[prop]) * sx) + 'px';
                }
            });
            ['top', 'height', 'maxHeight'].forEach(prop => {
                if (img.style[prop] && img.style[prop].includes('px')) {
                    img.style[prop] = (parseFloat(img.style[prop]) * sy) + 'px';
                }
            });
        }

        // SVG stroke-width and dimensions
        content.querySelectorAll('svg').forEach(svg => {
            const wAttr = svg.getAttribute('width');
            const hAttr = svg.getAttribute('height');
            if (wAttr && wAttr.includes('px')) {
                svg.setAttribute('width', (parseFloat(wAttr) * sx) + 'px');
            }
            if (hAttr && hAttr.includes('px')) {
                svg.setAttribute('height', (parseFloat(hAttr) * sy) + 'px');
            }
            svg.querySelectorAll('*').forEach(shape => {
                const sw = shape.getAttribute('stroke-width');
                if (sw && !isNaN(parseFloat(sw))) {
                    shape.setAttribute('stroke-width', (parseFloat(sw) * s).toFixed(1));
                }
                if (shape.style.strokeWidth && shape.style.strokeWidth.includes('px')) {
                    shape.style.strokeWidth = window.scaleCssPxValues(shape.style.strokeWidth, s);
                }
            });
        });

        // WordArt
        if (el.querySelector('.wa-text') && typeof syncWordArt === 'function') {
            syncWordArt(el);
        }

        // Shrink-overflow or Grow-fit re-evaluation
        if (el.getAttribute('data-shrink-overflow') === 'true' && typeof applyShrinkOverflow === 'function') {
            applyShrinkOverflow(el);
        }
        if (el.getAttribute('data-grow-fit') === 'true' && typeof applyGrowFit === 'function') {
            applyGrowFit(el);
        }
    }
};

// --- HELPER: Scale Serialized Element Data ---
window.scaleElementContentData = function(data, sx, sy, s) {
    if (!data) return;
    if (typeof s !== 'number') s = (sx + sy) / 2;

    if (data.left) data.left = (parseFloat(data.left) * sx) + 'px';
    if (data.top) data.top = (parseFloat(data.top) * sy) + 'px';
    if (data.width) data.width = (parseFloat(data.width) * sx) + 'px';
    if (data.height) data.height = (parseFloat(data.height) * sy) + 'px';

    if (data.imgStyle) {
        ['left', 'width', 'maxWidth'].forEach(prop => {
            if (data.imgStyle[prop] && data.imgStyle[prop].includes('px')) {
                data.imgStyle[prop] = (parseFloat(data.imgStyle[prop]) * sx) + 'px';
            }
        });
        ['top', 'height', 'maxHeight'].forEach(prop => {
            if (data.imgStyle[prop] && data.imgStyle[prop].includes('px')) {
                data.imgStyle[prop] = (parseFloat(data.imgStyle[prop]) * sy) + 'px';
            }
        });
    }

    if (data.contentCssText) {
        data.contentCssText = window.scaleCssPxValues(data.contentCssText, s);
    }

    if (data.innerHTML) {
        const temp = document.createElement('div');
        temp.innerHTML = data.innerHTML;
        temp.querySelectorAll('*').forEach(child => {
            if (child.style.fontSize && child.style.fontSize.includes('px')) {
                child.style.fontSize = window.scaleCssPxValues(child.style.fontSize, s);
            }
            if (child.style.lineHeight && child.style.lineHeight.includes('px')) {
                child.style.lineHeight = window.scaleCssPxValues(child.style.lineHeight, s);
            }
            if (child.style.padding && child.style.padding.includes('px')) {
                child.style.padding = window.scaleCssPxValues(child.style.padding, s);
            }
            if (child.style.margin && child.style.margin.includes('px')) {
                child.style.margin = window.scaleCssPxValues(child.style.margin, s);
            }
            if (child.style.borderWidth && child.style.borderWidth.includes('px')) {
                child.style.borderWidth = window.scaleCssPxValues(child.style.borderWidth, s);
            }
            if (child.style.borderRadius && child.style.borderRadius.includes('px')) {
                child.style.borderRadius = window.scaleCssPxValues(child.style.borderRadius, s);
            }
            if (child.tagName === 'TD' || child.tagName === 'TH') {
                if (child.style.width && child.style.width.includes('px')) {
                    child.style.width = (parseFloat(child.style.width) * sx) + 'px';
                }
                if (child.style.height && child.style.height.includes('px')) {
                    child.style.height = (parseFloat(child.style.height) * sy) + 'px';
                }
            }
        });
        data.innerHTML = temp.innerHTML;
    }
};

// --- HELPER: Scale Container Text (Headers/Footers) ---
window.scaleContainerText = function(container, s) {
    if (!container) return;
    container.querySelectorAll('*').forEach(child => {
        if (child.style.fontSize && child.style.fontSize.includes('px')) {
            child.style.fontSize = window.scaleCssPxValues(child.style.fontSize, s);
        }
        if (child.style.lineHeight && child.style.lineHeight.includes('px')) {
            child.style.lineHeight = window.scaleCssPxValues(child.style.lineHeight, s);
        }
    });
};

// --- HELPER: Update DPI Label in Status Bar ---
window.updateDpiDisplay = function(newDpi) {
    const activeDpi = parseInt(newDpi) || (typeof state !== 'undefined' && state.pages && state.pages[state.currentPageIndex] && parseInt(state.pages[state.currentPageIndex].dpi)) || (typeof state !== 'undefined' && parseInt(state.dpi)) || 96;
    const txt = document.getElementById('dpi-status-text');
    const badge = document.getElementById('dpi-status-display');
    const icon = document.getElementById('dpi-status-icon');
    
    if (txt) txt.textContent = `${activeDpi} DPI`;
    if (icon) {
        icon.className = (activeDpi >= 150) ? 'fas fa-print' : 'fas fa-desktop';
    }
    if (badge) {
        let label = 'Web/CSS Standard';
        if (activeDpi >= 300) label = 'High-Res Print';
        else if (activeDpi >= 150) label = 'Medium Print';
        else if (activeDpi >= 140) label = 'Medium Res';
        else if (activeDpi <= 72) label = 'Draft/Screen';
        badge.title = `Document Resolution: ${activeDpi} DPI (${label}) - Click to Change Size & DPI`;
    }
};

// --- HELPER: Visual Notification when DPI or Size is Changed ---
window.notifyDpiChanged = function(dpi, w, h, scaled, oldDpi) {
    window.updateDpiDisplay(dpi);

    // 1. Highlight / pulse the bottom-bar DPI badge
    const badge = document.getElementById('dpi-status-display');
    if (badge) {
        badge.classList.remove('highlight-pulse');
        void badge.offsetWidth; // Force CSS reflow to re-trigger keyframe animation
        badge.classList.add('highlight-pulse');
        setTimeout(() => {
            if (badge) badge.classList.remove('highlight-pulse');
        }, 3000);
    }

    // 2. Clear status message in bottom bar
    const statusMsg = document.getElementById('status-msg');
    if (statusMsg) {
        const scaleNote = scaled ? ' • Content scaled proportionally' : ' • Content preserved';
        const isDpiDiff = oldDpi && (parseInt(oldDpi) !== parseInt(dpi));
        const actionText = isDpiDiff ? `DPI set to ${dpi}` : `Page resized (${dpi} DPI)`;
        statusMsg.innerHTML = `<span style="font-weight:600;"><i class="fas fa-check-circle" style="color:#a7f3d0; margin-right:4px;"></i>${actionText} (${w} &times; ${h} px)${scaleNote}</span>`;
        if (window._statusMsgTimeout) clearTimeout(window._statusMsgTimeout);
        window._statusMsgTimeout = setTimeout(() => {
            if (statusMsg && statusMsg.innerHTML.includes('px)')) {
                statusMsg.innerText = 'Ready';
            }
        }, 5000);
    }

    // 3. Floating Toast Banner near the bottom center of viewport
    let toast = document.getElementById('dpi-change-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'dpi-change-toast';
        document.body.appendChild(toast);
    }

    let resolutionDesc = 'Web / Screen';
    if (dpi >= 300) resolutionDesc = 'High-Resolution Print';
    else if (dpi >= 150) resolutionDesc = 'Medium Print';
    else if (dpi === 140) resolutionDesc = 'Medium Resolution';
    else if (dpi <= 72) resolutionDesc = 'Draft / Low Resolution';

    const isDpiDiff = oldDpi && (parseInt(oldDpi) !== parseInt(dpi));
    const titleText = isDpiDiff ? `Resolution Changed to ${dpi} DPI` : `Document Resized (${dpi} DPI)`;

    toast.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
            <div style="background:#ffffff; color:var(--ui-theme-dark, #005a55); width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; box-shadow:0 2px 6px rgba(0,0,0,0.18);">
                <i class="fas fa-check" style="color:var(--ui-theme-color, #007670);"></i>
            </div>
            <div>
                <div style="font-weight:700; font-size:13px; color:#ffffff; letter-spacing:0.3px;">
                    ${titleText} <span style="font-size:11px; opacity:0.9; font-weight:400; color:#e0f2f1;">(${resolutionDesc})</span>
                </div>
                <div style="font-size:11px; color:#e0f2f1; margin-top:2px;">
                    Canvas: <strong style="color:#ffffff;">${w} &times; ${h} px</strong> ${scaled ? '&bull; Content scaled proportionally' : ''}
                </div>
            </div>
        </div>
    `;

    toast.className = 'dpi-toast-visible';
    if (window._dpiToastTimeout) clearTimeout(window._dpiToastTimeout);
    window._dpiToastTimeout = setTimeout(() => {
        if (toast) toast.className = 'dpi-toast-hidden';
    }, 4000);
};

function changeSize() {
    const currentW = parseInt(paper.style.width) || 794;
    const currentH = parseInt(paper.style.height) || 1123;
    const activeDpi = (typeof state !== 'undefined' && state.dpi) ? state.dpi : 96;
    const activeUnit = (typeof state !== 'undefined' && state.unit) ? state.unit : 'cm';

    const ucs = window.UnitConversionService || {
        toPixels: (v, u, d) => Math.round(parseFloat(v) || 0),
        fromPixels: (v, u, d) => parseFloat(v) || 0,
        convert: (v) => parseFloat(v) || 0,
        formatValue: (v) => parseFloat(v) || 0,
        getPresetDimensions: () => ({ width: 8.27, height: 11.69, widthPx: 794, heightPx: 1123 })
    };

    const initialW = ucs.formatValue(ucs.fromPixels(currentW, activeUnit, activeDpi), activeUnit);
    const initialH = ucs.formatValue(ucs.fromPixels(currentH, activeUnit, activeDpi), activeUnit);

    const formHtml = `
        <div style="margin-bottom:12px;">
            <label style="font-weight:600; font-size:12px; color:var(--ui-theme-dark); display:block; margin-bottom:6px;">Preset Formats:</label>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
                <button type="button" class="btn-secondary resize-preset-btn" data-preset="A4" style="padding:4px 8px; font-size:12px;">A4</button>
                <button type="button" class="btn-secondary resize-preset-btn" data-preset="Letter" style="padding:4px 8px; font-size:12px;">Letter</button>
                <button type="button" class="btn-secondary resize-preset-btn" data-preset="A3" style="padding:4px 8px; font-size:12px;">A3</button>
                <button type="button" class="btn-secondary resize-preset-btn" data-preset="A5" style="padding:4px 8px; font-size:12px;">A5</button>
                <button type="button" class="btn-secondary resize-preset-btn" data-preset="Legal" style="padding:4px 8px; font-size:12px;">Legal</button>
                <button type="button" class="btn-secondary resize-preset-btn" data-preset="Tabloid" style="padding:4px 8px; font-size:12px;">Tabloid</button>
                <button type="button" class="btn-secondary resize-preset-btn" data-preset="BusinessCard" style="padding:4px 8px; font-size:12px;">Business Card</button>
                <button type="button" class="btn-secondary resize-preset-btn" data-preset="Square" style="padding:4px 8px; font-size:12px;">Square</button>
            </div>
        </div>
        <div style="display:flex; gap:12px; margin-bottom:12px;">
            <div style="flex:1;">
                <label style="font-weight:600; font-size:12px; color:var(--ui-theme-dark); display:block; margin-bottom:4px;">Units:</label>
                <select id="resize-dialog-unit" style="width:100%; padding:6px;">
                    <option value="cm" ${activeUnit === 'cm' ? 'selected' : ''}>Centimeters (cm)</option>
                    <option value="in" ${activeUnit === 'in' ? 'selected' : ''}>Inches (in)</option>
                    <option value="mm" ${activeUnit === 'mm' ? 'selected' : ''}>Millimeters (mm)</option>
                    <option value="px" ${activeUnit === 'px' ? 'selected' : ''}>Pixels (px)</option>
                </select>
            </div>
            <div style="flex:1;">
                <label style="font-weight:600; font-size:12px; color:var(--ui-theme-dark); display:block; margin-bottom:4px;">DPI (Resolution):</label>
                <select id="resize-dialog-dpi-select" style="width:100%; padding:6px;">
                    <option value="72" ${activeDpi === 72 ? 'selected' : ''}>72 DPI (Draft/Screen)</option>
                    <option value="96" ${activeDpi === 96 ? 'selected' : ''}>96 DPI (Web/CSS / Default)</option>
                    <option value="140" ${activeDpi === 140 ? 'selected' : ''}>140 DPI</option>
                    <option value="150" ${activeDpi === 150 ? 'selected' : ''}>150 DPI (Medium Print)</option>
                    <option value="300" ${activeDpi === 300 ? 'selected' : ''}>300 DPI (High-Res Print)</option>
                    <option value="custom" ${![72, 96, 140, 150, 300].includes(activeDpi) ? 'selected' : ''}>Custom...</option>
                </select>
            </div>
        </div>
        <div id="resize-dialog-dpi-custom-group" style="display:${![72, 96, 140, 150, 300].includes(activeDpi) ? 'block' : 'none'}; margin-bottom:12px;">
            <label style="font-weight:600; font-size:12px; color:var(--ui-theme-dark); display:block; margin-bottom:4px;">Custom DPI:</label>
            <input type="number" id="resize-dialog-dpi-custom" value="${activeDpi}" min="10" max="2400" style="width:100%; padding:6px;">
        </div>
        <div style="display:flex; gap:12px; margin-bottom:12px;">
            <div class="input-group" style="flex:1; margin-bottom:0;">
                <label id="resize-width-label">Width (${activeUnit}):</label>
                <input type="number" step="any" id="dialog-width" value="${initialW}">
            </div>
            <div class="input-group" style="flex:1; margin-bottom:0;">
                <label id="resize-height-label">Height (${activeUnit}):</label>
                <input type="number" step="any" id="dialog-height" value="${initialH}">
            </div>
        </div>
        <div id="resize-canvas-preview" style="background:#e8f4f2; border:1px solid #b2dfdb; border-radius:6px; padding:8px 12px; font-size:12px; color:#004d40; text-align:center;">
            Resulting Canvas: <strong id="resize-preview-text">${currentW} &times; ${currentH} px (${activeDpi} DPI)</strong>
        </div>
        <div style="margin-top:12px; display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="resize-dialog-scale-content" checked style="cursor:pointer; width:16px; height:16px;">
            <label for="resize-dialog-scale-content" style="font-size:12px; font-weight:600; color:var(--ui-theme-dark); cursor:pointer; user-select:none;">
                Scale page content automatically to match new size / DPI
            </label>
        </div>
    `;

    DialogSystem.show('Resize Document', formHtml, () => {
        const u = document.getElementById('resize-dialog-unit').value;
        const selDpi = document.getElementById('resize-dialog-dpi-select').value;
        const customDpiVal = parseInt(document.getElementById('resize-dialog-dpi-custom').value) || 96;
        const d = (selDpi === 'custom') ? Math.max(10, customDpiVal) : (parseInt(selDpi) || 96);
        
        const newW = document.getElementById('dialog-width').value;
        const newH = document.getElementById('dialog-height').value;
        const scaleContentCheckbox = document.getElementById('resize-dialog-scale-content');
        const shouldScaleContent = scaleContentCheckbox ? scaleContentCheckbox.checked : true;
        
        if (newW && newH && window.UnitConversionService) {
            const finalW = window.UnitConversionService.toPixels(newW, u, d);
            const finalH = window.UnitConversionService.toPixels(newH, u, d);

            // Compute scaling ratios relative to the current single-page base dimensions
            const baseOldW = (typeof state !== 'undefined' && state.isSpreadMode) ? (currentW / 2) : currentW;
            const oldH = currentH;
            const sx = (baseOldW > 0) ? (finalW / baseOldW) : 1;
            const sy = (oldH > 0) ? (finalH / oldH) : 1;
            const s = (sx + sy) / 2;

            let targetW = finalW + 'px';
            if (typeof state !== 'undefined' && state.isSpreadMode) {
                targetW = (finalW * 2) + 'px';
            }
            paper.style.width = targetW;
            paper.style.height = finalH + 'px';
            
            const oldDpi = (state.pages && state.pages[state.currentPageIndex] && state.pages[state.currentPageIndex].dpi) || state.dpi || state.marginsDpi || 96;

            state.dpi = d;
            state.unit = u;

            if (d !== oldDpi && oldDpi > 0) {
                const ratio = d / oldDpi;
                const curM = state.margins || {
                    top: Math.round(0.5 * oldDpi),
                    right: Math.round(0.5 * oldDpi),
                    bottom: Math.round(0.5 * oldDpi),
                    left: Math.round(0.5 * oldDpi)
                };
                state.margins = {
                    top: Math.round(curM.top * ratio),
                    right: Math.round(curM.right * ratio),
                    bottom: Math.round(curM.bottom * ratio),
                    left: Math.round(curM.left * ratio)
                };
                state.marginsDpi = d;
            } else if (!state.marginsDpi) {
                state.marginsDpi = d;
            }

            const marginGuides = paper.querySelector('.margin-guides');
            if (marginGuides && state.margins) {
                marginGuides.style.inset = 'auto';
                marginGuides.style.top = state.margins.top + 'px';
                marginGuides.style.right = state.margins.right + 'px';
                marginGuides.style.bottom = state.margins.bottom + 'px';
                marginGuides.style.left = state.margins.left + 'px';
            }

            if (shouldScaleContent && (Math.abs(sx - 1) > 0.001 || Math.abs(sy - 1) > 0.001)) {
                // 1. Scale active DOM elements on paper (normal and master elements)
                paper.querySelectorAll('.pub-element, .element').forEach(el => {
                    if (typeof window.scaleElementContentDOM === 'function') {
                        window.scaleElementContentDOM(el, sx, sy, s);
                    }
                });

                // 2. Scale custom guides on paper
                paper.querySelectorAll('.custom-guide').forEach(guide => {
                    if (guide.classList.contains('guide-x') || guide.style.left) {
                        const l = parseFloat(guide.style.left) || 0;
                        guide.style.left = (l * sx) + 'px';
                    }
                    if (guide.classList.contains('guide-y') || guide.style.top) {
                        const t = parseFloat(guide.style.top) || 0;
                        guide.style.top = (t * sy) + 'px';
                    }
                });

                // 3. Scale headers & footers on paper
                const pHeader = paper.querySelector('.page-header');
                const pFooter = paper.querySelector('.page-footer');
                if (typeof window.scaleContainerText === 'function') {
                    if (pHeader) window.scaleContainerText(pHeader, s);
                    if (pFooter) window.scaleContainerText(pFooter, s);
                }

                // 4. Update serialized state for all other pages in state.pages
                if (typeof state !== 'undefined' && state.pages && Array.isArray(state.pages)) {
                    state.pages.forEach((pg, idx) => {
                        if (idx !== state.currentPageIndex && pg) {
                            pg.width = targetW;
                            pg.height = finalH + 'px';
                            pg.dpi = d;
                            pg.orientation = (parseFloat(targetW) >= parseFloat(finalH)) ? 'landscape' : 'portrait';
                            if (pg.elements && Array.isArray(pg.elements)) {
                                pg.elements.forEach(elData => {
                                    if (typeof window.scaleElementContentData === 'function') {
                                        window.scaleElementContentData(elData, sx, sy, s);
                                    }
                                });
                            }
                            if (pg.header && typeof window.scaleCssPxValues === 'function') {
                                pg.header = window.scaleCssPxValues(pg.header, s);
                            }
                            if (pg.footer && typeof window.scaleCssPxValues === 'function') {
                                pg.footer = window.scaleCssPxValues(pg.footer, s);
                            }
                        }
                    });
                }

                // 5. Compensate viewport zoom so page visual appearance on screen remains steady
                if (typeof state !== 'undefined' && state.zoom && baseOldW > 0) {
                    const adjustedZoom = Math.round((state.zoom * (baseOldW / finalW)) * 100) / 100;
                    const clampedZoom = Math.max(0.02, Math.min(3.0, adjustedZoom));
                    if (typeof setZoom === 'function') {
                        setZoom(clampedZoom);
                    } else {
                        state.zoom = clampedZoom;
                        if (typeof updateZoomDisplay === 'function') updateZoomDisplay();
                    }
                }
            } else {
                // If not scaling content, still update dimensions & dpi across other pages
                if (typeof state !== 'undefined' && state.pages && Array.isArray(state.pages)) {
                    state.pages.forEach((pg, idx) => {
                        if (idx !== state.currentPageIndex && pg) {
                            pg.width = targetW;
                            pg.height = finalH + 'px';
                            pg.dpi = d;
                            pg.orientation = (parseFloat(targetW) >= parseFloat(finalH)) ? 'landscape' : 'portrait';
                        }
                    });
                }
            }
            
            if (state.pages && state.pages[state.currentPageIndex]) {
                const curP = state.pages[state.currentPageIndex];
                curP.width = targetW;
                curP.height = finalH + 'px';
                curP.dpi = d;
                const isLand = parseFloat(targetW) >= parseFloat(finalH);
                curP.orientation = isLand ? 'landscape' : 'portrait';
                if (!window._orientedPagesRegistry) window._orientedPagesRegistry = new Set();
                window._orientedPagesRegistry.add(curP.id);
            }
            if (typeof updateSidebar === 'function') updateSidebar();
            if (typeof updateThumbnails === 'function') updateThumbnails();
            if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
            if (typeof updateMultiPageView === 'function') updateMultiPageView(state.zoom);
            if (typeof window.syncRulers === 'function') window.syncRulers();
            if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
            if (typeof window.setPageFormatIcon === 'function') {
                const detectedFmt = (window.UnitConversionService && window.UnitConversionService.detectFormat)
                    ? window.UnitConversionService.detectFormat(finalW, finalH, d)
                    : 'Custom';
                window.setPageFormatIcon(detectedFmt);
            }
            if (typeof window.notifyDpiChanged === 'function') {
                window.notifyDpiChanged(d, finalW, finalH, shouldScaleContent, oldDpi);
            } else if (typeof window.updateDpiDisplay === 'function') {
                window.updateDpiDisplay(d);
            }
            pushHistory();
            const sizeDrop = document.getElementById('size-dropdown');
            if (sizeDrop) sizeDrop.style.display = 'none';
        }
    });

    setTimeout(() => {
        let currentUnit = activeUnit;
        const getDialogDpi = () => {
            const sel = document.getElementById('resize-dialog-dpi-select');
            if (sel && sel.value === 'custom') {
                const cust = document.getElementById('resize-dialog-dpi-custom');
                return Math.max(10, parseInt(cust ? cust.value : 96) || 96);
            }
            return parseInt(sel ? sel.value : 96) || 96;
        };

        const updatePreview = () => {
            if (!window.UnitConversionService) return;
            const u = document.getElementById('resize-dialog-unit').value;
            const d = getDialogDpi();
            const wVal = parseFloat(document.getElementById('dialog-width').value) || 0;
            const hVal = parseFloat(document.getElementById('dialog-height').value) || 0;
            const wPx = window.UnitConversionService.toPixels(wVal, u, d);
            const hPx = window.UnitConversionService.toPixels(hVal, u, d);
            const prevText = document.getElementById('resize-preview-text');
            if (prevText) {
                prevText.innerHTML = `${wPx} &times; ${hPx} px (${d} DPI)`;
            }
        };

        const unitSelect = document.getElementById('resize-dialog-unit');
        if (unitSelect) {
            unitSelect.addEventListener('change', function() {
                const nextUnit = this.value;
                const d = getDialogDpi();
                const wEl = document.getElementById('dialog-width');
                const hEl = document.getElementById('dialog-height');
                const curW = parseFloat(wEl.value) || 0;
                const curH = parseFloat(hEl.value) || 0;

                if (window.UnitConversionService) {
                    const convW = window.UnitConversionService.convert(curW, currentUnit, nextUnit, d);
                    const convH = window.UnitConversionService.convert(curH, currentUnit, nextUnit, d);
                    wEl.value = window.UnitConversionService.formatValue(convW, nextUnit);
                    hEl.value = window.UnitConversionService.formatValue(convH, nextUnit);
                }
                currentUnit = nextUnit;
                document.getElementById('resize-width-label').innerText = `Width (${nextUnit}):`;
                document.getElementById('resize-height-label').innerText = `Height (${nextUnit}):`;
                updatePreview();
            });
        }

        const dpiSelect = document.getElementById('resize-dialog-dpi-select');
        const customDpiGroup = document.getElementById('resize-dialog-dpi-custom-group');
        if (dpiSelect) {
            dpiSelect.addEventListener('change', function() {
                if (this.value === 'custom') {
                    if (customDpiGroup) customDpiGroup.style.display = 'block';
                } else {
                    if (customDpiGroup) customDpiGroup.style.display = 'none';
                }
                updatePreview();
            });
        }

        const customDpiInput = document.getElementById('resize-dialog-dpi-custom');
        if (customDpiInput) customDpiInput.addEventListener('input', updatePreview);

        const wInput = document.getElementById('dialog-width');
        const hInput = document.getElementById('dialog-height');
        if (wInput) wInput.addEventListener('input', updatePreview);
        if (hInput) hInput.addEventListener('input', updatePreview);

        document.querySelectorAll('.resize-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const presetKey = btn.getAttribute('data-preset');
                const u = document.getElementById('resize-dialog-unit').value;
                const d = getDialogDpi();
                if (window.UnitConversionService) {
                    const dims = window.UnitConversionService.getPresetDimensions(presetKey, u, d);
                    wInput.value = dims.width;
                    hInput.value = dims.height;
                }
                updatePreview();
            });
        });

        updatePreview();
    }, 0);
}

function toggleOrientation() {
    const currentW = paper.style.width;
    const currentH = paper.style.height;
    paper.style.width = currentH;
    paper.style.height = currentW;
    if (state.pages && state.pages[state.currentPageIndex]) {
        const isLand = parseFloat(currentH) >= parseFloat(currentW);
        state.pages[state.currentPageIndex].orientation = isLand ? 'landscape' : 'portrait';
        if (!window._orientedPagesRegistry) window._orientedPagesRegistry = new Set();
        window._orientedPagesRegistry.add(state.pages[state.currentPageIndex].id);
    }
    if (typeof window.syncRulers === 'function') window.syncRulers();
    pushHistory();
}

function toggleSpreadMode() {
    if (typeof serializeCurrentPage === 'function') {
        state.pages[state.currentPageIndex] = serializeCurrentPage();
    }
    
    state.isSpreadMode = !state.isSpreadMode;
    const btn = document.getElementById('spread-mode-btn');
    if (btn) btn.classList.toggle('active', state.isSpreadMode);

    if (state.isSpreadMode) {
        let newPages = [];
        for (let i = 0; i < state.pages.length; i += 2) {
            let p1 = state.pages[i];
            let p2 = state.pages[i+1];
            let singleW = parseInt(p1.width) || 794;
            let spread = {
                width: (singleW * 2) + 'px',
                height: p1.height || '1123px',
                background: p1.background,
                elements: JSON.parse(JSON.stringify(p1.elements))
            };
            if (p2) {
                p2.elements.forEach(el => {
                    let newEl = JSON.parse(JSON.stringify(el));
                    newEl.left = (parseFloat(newEl.left) + singleW) + 'px';
                    spread.elements.push(newEl);
                });
            }
            
            newPages.push(spread);
        }
        state.pages = newPages;
        state.currentPageIndex = Math.floor(state.currentPageIndex / 2);
    } else {
        let newPages = [];
        state.pages.forEach(spread => {
            const singleW = parseInt(spread.width) / 2;
            let p1 = { width: singleW + 'px', height: spread.height, background: spread.background, elements: [] };
            let p2 = { width: singleW + 'px', height: spread.height, background: spread.background, elements: [] };
            
            spread.elements.forEach(el => {
                if (el.innerHTML && el.innerHTML.includes('spread-fold-line')) return;
                
                if (parseFloat(el.left) < singleW) {
                    p1.elements.push(JSON.parse(JSON.stringify(el)));
                } else {
                    let newEl = JSON.parse(JSON.stringify(el));
                    newEl.left = (parseFloat(newEl.left) - singleW) + 'px';
                    p2.elements.push(newEl);
                }
            });
            newPages.push(p1);
            if (p2.elements.length > 0) {
                newPages.push(p2);
            }
        });
        state.pages = newPages;
        state.currentPageIndex = state.currentPageIndex * 2;
    }
    
    renderPage(state.pages[state.currentPageIndex]);
    updateSidebar();
    if (typeof pushHistory === 'function') pushHistory();
}


function toggleMargins() {
    const g = document.getElementById('margin-guides');
    g.style.display = (g.style.display === 'none') ? 'block' : 'none';
    if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
}



function showGuidesModal() {
    const paper = document.getElementById('paper');
    const cs = getComputedStyle(paper);
    
    let baseSpacing = cs.getPropertyValue('--baseline-spacing').trim().replace('px', '');
    let baseColor = cs.getPropertyValue('--baseline-color').trim();
    let gridSpacing = cs.getPropertyValue('--grid-spacing').trim().replace('px', '');
    let gridColor = cs.getPropertyValue('--grid-color').trim();

    if (!baseSpacing) baseSpacing = '25';
    if (!baseColor) baseColor = '#add8e6';
    if (!gridSpacing) gridSpacing = '20';
    if (!gridColor) gridColor = '#e0e0e0';

    const formHTML = `
        <div style="padding: 10px 0;">
            <div style="font-weight: bold; margin-bottom: 10px; color: var(--ui-theme-color); border-bottom: 1px solid #ccc; padding-bottom: 5px;">Baseline Guides</div>
            <div class="input-group" style="margin-bottom:10px;">
                <label>Spacing (px):</label>
                <div class="modern-spinner">
                    <input type="text" id="baseline-spacing-input" value="${parseInt(baseSpacing)}" onchange="this.value = Math.max(1, parseInt(this.value)||1)">
                    <div class="spin-btns">
                        <div onclick="document.getElementById('baseline-spacing-input').value=Math.max(1, parseInt(document.getElementById('baseline-spacing-input').value||1)+1)"><i class="fas fa-chevron-up"></i></div>
                        <div onclick="document.getElementById('baseline-spacing-input').value=Math.max(1, parseInt(document.getElementById('baseline-spacing-input').value||1)-1)"><i class="fas fa-chevron-down"></i></div>
                    </div>
                </div>
            </div>
            <div class="input-group" style="margin-bottom:15px;">
                <label>Color:</label>
                <div style="width: 54px;">
                    <input type="hidden" id="baseline-color-val" value="${baseColor}">
                    <div id="baseline-color-input" class="color-swatch-trigger" style="background-color: ${baseColor}; cursor:pointer; width:100%; height:30px; border:1px solid var(--ui-theme-color); border-radius:4px;" onclick="CustomColorPicker.open(this, document.getElementById('baseline-color-val').value, (c) => { document.getElementById('baseline-color-val').value = c; this.style.backgroundColor = c; })"></div>
                </div>
            </div>
            
            <div style="font-weight: bold; margin-bottom: 10px; color: var(--ui-theme-color); border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 20px;">Grid Guides</div>
            <div class="input-group" style="margin-bottom:10px;">
                <label>Spacing (px):</label>
                <div class="modern-spinner">
                    <input type="text" id="grid-spacing-input" value="${parseInt(gridSpacing)}" onchange="this.value = Math.max(1, parseInt(this.value)||1)">
                    <div class="spin-btns">
                        <div onclick="document.getElementById('grid-spacing-input').value=Math.max(1, parseInt(document.getElementById('grid-spacing-input').value||1)+1)"><i class="fas fa-chevron-up"></i></div>
                        <div onclick="document.getElementById('grid-spacing-input').value=Math.max(1, parseInt(document.getElementById('grid-spacing-input').value||1)-1)"><i class="fas fa-chevron-down"></i></div>
                    </div>
                </div>
            </div>
            <div class="input-group" style="margin-bottom:15px;">
                <label>Color:</label>
                <div style="width: 54px;">
                    <input type="hidden" id="grid-color-val" value="${gridColor}">
                    <div id="grid-color-input" class="color-swatch-trigger" style="background-color: ${gridColor}; cursor:pointer; width:100%; height:30px; border:1px solid var(--ui-theme-color); border-radius:4px;" onclick="CustomColorPicker.open(this, document.getElementById('grid-color-val').value, (c) => { document.getElementById('grid-color-val').value = c; this.style.backgroundColor = c; })"></div>
                </div>
            </div>
        </div>
    `;

    DialogSystem.show('Grid and Baseline Guides', formHTML, applyGuidesSettings, false, 'OK');
}

function applyGuidesSettings() {
    const paper = document.getElementById('paper');
    const baseSpacing = document.getElementById('baseline-spacing-input').value;
    const baseColor = document.getElementById('baseline-color-val').value;
    const gridSpacing = document.getElementById('grid-spacing-input').value;
    const gridColor = document.getElementById('grid-color-val').value;

    paper.style.setProperty('--baseline-spacing', baseSpacing + 'px');
    paper.style.setProperty('--baseline-color', baseColor);
    paper.style.setProperty('--grid-spacing', gridSpacing + 'px');
    paper.style.setProperty('--grid-color', gridColor);
}

function showCustomMarginsModal() {
    const activeUnit = (state && state.unit) ? state.unit : 'cm';
    const activeDpi = (state && state.dpi) ? state.dpi : 96;
    const marginsDpi = (state && state.marginsDpi) || 96;
    
    let cm = state.margins || {
        top: Math.round(0.5 * activeDpi),
        right: Math.round(0.5 * activeDpi),
        bottom: Math.round(0.5 * activeDpi),
        left: Math.round(0.5 * activeDpi)
    };
    if (marginsDpi !== activeDpi && marginsDpi > 0) {
        const ratio = activeDpi / marginsDpi;
        cm = {
            top: Math.round(cm.top * ratio),
            right: Math.round(cm.right * ratio),
            bottom: Math.round(cm.bottom * ratio),
            left: Math.round(cm.left * ratio)
        };
        state.margins = cm;
        state.marginsDpi = activeDpi;
    }
    
    const ucs = window.UnitConversionService || {
        toPixels: (v, u, d) => Math.round(parseFloat(v) || 0),
        fromPixels: (v, u, d) => parseFloat(v) || 0,
        convert: (v) => parseFloat(v) || 0,
        formatValue: (v) => parseFloat(v) || 0
    };

    const topInit = ucs.formatValue(ucs.fromPixels(cm.top, activeUnit, activeDpi), activeUnit);
    const bottomInit = ucs.formatValue(ucs.fromPixels(cm.bottom, activeUnit, activeDpi), activeUnit);
    const leftInit = ucs.formatValue(ucs.fromPixels(cm.left, activeUnit, activeDpi), activeUnit);
    const rightInit = ucs.formatValue(ucs.fromPixels(cm.right, activeUnit, activeDpi), activeUnit);

    const formHtml = `
        <div style="margin-bottom:12px;">
            <label style="font-weight:600; font-size:12px; color:var(--ui-theme-dark); display:block; margin-bottom:4px;">Units:</label>
            <select id="margins-dialog-unit" style="width:100%; padding:6px;">
                <option value="cm" ${activeUnit === 'cm' ? 'selected' : ''}>Centimeters (cm)</option>
                <option value="in" ${activeUnit === 'in' ? 'selected' : ''}>Inches (in)</option>
                <option value="mm" ${activeUnit === 'mm' ? 'selected' : ''}>Millimeters (mm)</option>
                <option value="px" ${activeUnit === 'px' ? 'selected' : ''}>Pixels (px)</option>
            </select>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
            <div class="input-group" style="margin-bottom:0;">
                <label id="margin-top-label">Top (${activeUnit}):</label>
                <input type="number" step="any" id="dialog-margin-top" value="${topInit}">
            </div>
            <div class="input-group" style="margin-bottom:0;">
                <label id="margin-bottom-label">Bottom (${activeUnit}):</label>
                <input type="number" step="any" id="dialog-margin-bottom" value="${bottomInit}">
            </div>
            <div class="input-group" style="margin-bottom:0;">
                <label id="margin-left-label">Left (${activeUnit}):</label>
                <input type="number" step="any" id="dialog-margin-left" value="${leftInit}">
            </div>
            <div class="input-group" style="margin-bottom:0;">
                <label id="margin-right-label">Right (${activeUnit}):</label>
                <input type="number" step="any" id="dialog-margin-right" value="${rightInit}">
            </div>
        </div>
        <div style="font-size:11px; color:#666; background:#f5f5f5; padding:6px 10px; border-radius:4px; border:1px solid #e0e0e0;">
            Document Resolution: <strong>${activeDpi} DPI</strong> &nbsp;|&nbsp; 1 in = ${activeDpi} px
        </div>
    `;

    DialogSystem.show('Custom Margins', formHtml, () => {
        const u = document.getElementById('margins-dialog-unit').value;
        const tVal = parseFloat(document.getElementById('dialog-margin-top').value) || 0;
        const bVal = parseFloat(document.getElementById('dialog-margin-bottom').value) || 0;
        const lVal = parseFloat(document.getElementById('dialog-margin-left').value) || 0;
        const rVal = parseFloat(document.getElementById('dialog-margin-right').value) || 0;
        
        let tPx = Math.round(tVal);
        let bPx = Math.round(bVal);
        let lPx = Math.round(lVal);
        let rPx = Math.round(rVal);

        if (window.UnitConversionService) {
            tPx = window.UnitConversionService.toPixels(tVal, u, activeDpi);
            bPx = window.UnitConversionService.toPixels(bVal, u, activeDpi);
            lPx = window.UnitConversionService.toPixels(lVal, u, activeDpi);
            rPx = window.UnitConversionService.toPixels(rVal, u, activeDpi);
        }
        
        state.margins = {top: tPx, right: rPx, bottom: bPx, left: lPx};
        state.marginsDpi = activeDpi;
        renderPage(state.pages[state.currentPageIndex]);
        if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
        pushHistory();
    });

    setTimeout(() => {
        let curUnit = activeUnit;
        const sel = document.getElementById('margins-dialog-unit');
        if (!sel) return;
        sel.addEventListener('change', function() {
            const nextUnit = this.value;
            const topEl = document.getElementById('dialog-margin-top');
            const btmEl = document.getElementById('dialog-margin-bottom');
            const lftEl = document.getElementById('dialog-margin-left');
            const rgtEl = document.getElementById('dialog-margin-right');
            
            if (window.UnitConversionService) {
                topEl.value = window.UnitConversionService.formatValue(window.UnitConversionService.convert(topEl.value, curUnit, nextUnit, activeDpi), nextUnit);
                btmEl.value = window.UnitConversionService.formatValue(window.UnitConversionService.convert(btmEl.value, curUnit, nextUnit, activeDpi), nextUnit);
                lftEl.value = window.UnitConversionService.formatValue(window.UnitConversionService.convert(lftEl.value, curUnit, nextUnit, activeDpi), nextUnit);
                rgtEl.value = window.UnitConversionService.formatValue(window.UnitConversionService.convert(rgtEl.value, curUnit, nextUnit, activeDpi), nextUnit);
            }
            
            curUnit = nextUnit;
            document.getElementById('margin-top-label').innerText = `Top (${nextUnit}):`;
            document.getElementById('margin-bottom-label').innerText = `Bottom (${nextUnit}):`;
            document.getElementById('margin-left-label').innerText = `Left (${nextUnit}):`;
            document.getElementById('margin-right-label').innerText = `Right (${nextUnit}):`;
        });
    }, 0);
}

function setMarginPreset(top, right, bottom, left) {
    state.margins = {top: top, right: right, bottom: bottom, left: left};
    state.marginsDpi = (typeof state !== 'undefined' && state.dpi) ? state.dpi : 96;
    renderPage(state.pages[state.currentPageIndex]);
    if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
    pushHistory();
}

function setMarginPresetInches(topIn, rightIn, bottomIn, leftIn) {
    const dpi = (typeof state !== 'undefined' && state.dpi) ? state.dpi : 96;
    const top = Math.round(topIn * dpi);
    const right = Math.round(rightIn * dpi);
    const bottom = Math.round(bottomIn * dpi);
    const left = Math.round(leftIn * dpi);
    setMarginPreset(top, right, bottom, left);
}

function toggleGrid() { paper.classList.toggle('theme-grid'); }

function toggleBaselines() { paper.classList.toggle('theme-baselines'); }

function toggleRulers() {
    const c = document.getElementById('canvas-area');
    if(c.style.gridTemplateColumns === '0px 1fr') {
        c.style.gridTemplateColumns = '20px 1fr'; c.style.gridTemplateRows = '20px 1fr';
    } else {
        c.style.gridTemplateColumns = '0px 1fr'; c.style.gridTemplateRows = '0px 1fr';
    }
}

function toggleScratchArea() {
    const isHidden = document.body.classList.toggle('hide-scratch-area');
    const btn = document.getElementById('scratch-area-toggle-btn');
    if (btn) {
        if (isHidden) {
            btn.classList.remove('active-tool');
            btn.innerHTML = '<i class="far fa-square"></i>Scratch Area';
        } else {
            btn.classList.add('active-tool');
            btn.innerHTML = '<i class="fas fa-check-square"></i>Scratch Area';
        }
    }
}

// Auto-initialize DPI display
if (typeof window !== 'undefined') {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(() => { if (typeof window.updateDpiDisplay === 'function') window.updateDpiDisplay(); }, 100);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            if (typeof window.updateDpiDisplay === 'function') window.updateDpiDisplay();
        });
    }
}