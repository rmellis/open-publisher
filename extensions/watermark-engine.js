// ========================================================
// Open Publisher Watermark Engine (v5.19.11)
// Document Watermark Stamps & Tiled Security Patterns
// ========================================================

(function initWatermarkEngine() {
    console.log("🛠️ Watermark Engine initializing (Document Watermark Stamps & Tiled Security Patterns v5.19.11)...");

    const PRESETS = {
        draft: {
            id: 'draft',
            type: 'text',
            text: 'DRAFT',
            fontFamily: 'Segoe UI, sans-serif',
            fontWeight: '800',
            mode: 'diagonal',
            style: 'solid',
            color: '#64748b',
            opacity: 0.16,
            fontSize: 'auto',
            scale: 100,
            scope: 'all',
            layer: 'behind'
        },
        confidential: {
            id: 'confidential',
            type: 'text',
            text: 'CONFIDENTIAL',
            fontFamily: 'Impact, sans-serif',
            fontWeight: '800',
            mode: 'diagonal',
            style: 'solid',
            color: '#dc2626',
            opacity: 0.18,
            fontSize: 'auto',
            scale: 100,
            scope: 'all',
            layer: 'behind'
        },
        sample: {
            id: 'sample',
            type: 'text',
            text: 'SAMPLE',
            fontFamily: 'Arial, sans-serif',
            fontWeight: '800',
            mode: 'diagonal',
            style: 'solid',
            color: '#4f46e5',
            opacity: 0.16,
            fontSize: 'auto',
            scale: 100,
            scope: 'all',
            layer: 'behind'
        },
        donotcopy: {
            id: 'donotcopy',
            type: 'text',
            text: 'DO NOT COPY',
            fontFamily: 'Impact, sans-serif',
            fontWeight: '800',
            mode: 'diagonal',
            style: 'solid',
            color: '#d97706',
            opacity: 0.18,
            fontSize: 'auto',
            scale: 100,
            scope: 'all',
            layer: 'behind'
        },
        urgent: {
            id: 'urgent',
            type: 'text',
            text: 'URGENT',
            fontFamily: 'Impact, sans-serif',
            fontWeight: '800',
            mode: 'diagonal',
            style: 'solid',
            color: '#e11d48',
            opacity: 0.20,
            fontSize: 'auto',
            scale: 100,
            scope: 'all',
            layer: 'behind'
        },
        paid: {
            id: 'paid',
            type: 'text',
            text: 'PAID',
            fontFamily: 'Impact, sans-serif',
            fontWeight: '800',
            mode: 'diagonal',
            style: 'outline-stamp',
            color: '#059669',
            opacity: 0.22,
            fontSize: 'auto',
            scale: 100,
            scope: 'all',
            layer: 'behind'
        },
        copy: {
            id: 'copy',
            type: 'text',
            text: 'COPY',
            fontFamily: 'Arial, sans-serif',
            fontWeight: '800',
            mode: 'diagonal',
            style: 'solid',
            color: '#475569',
            opacity: 0.16,
            fontSize: 'auto',
            scale: 100,
            scope: 'all',
            layer: 'behind'
        },
        proof: {
            id: 'proof',
            type: 'text',
            text: 'PROOF',
            fontFamily: 'Georgia, serif',
            fontWeight: '800',
            mode: 'diagonal',
            style: 'outline-stamp',
            color: '#7c3aed',
            opacity: 0.20,
            fontSize: 'auto',
            scale: 100,
            scope: 'all',
            layer: 'behind'
        },
        security_tile: {
            id: 'security_tile',
            type: 'text',
            text: 'CONFIDENTIAL',
            fontFamily: 'Segoe UI, sans-serif',
            fontWeight: '700',
            mode: 'tiled',
            style: 'solid',
            color: '#94a3b8',
            opacity: 0.12,
            fontSize: '28',
            scale: 100,
            scope: 'all',
            layer: 'behind'
        }
    };

    function shouldApplyToPage(configOrIndex, pageIndexOrTotal, totalPagesOrConfig) {
        let config, pageIndex, totalPages;
        if (typeof configOrIndex === 'object' && configOrIndex !== null) {
            config = configOrIndex;
            pageIndex = pageIndexOrTotal || 0;
            totalPages = totalPagesOrConfig || 1;
        } else {
            pageIndex = configOrIndex || 0;
            totalPages = pageIndexOrTotal || 1;
            config = totalPagesOrConfig;
        }
        if (!config) return false;
        const scope = config.scope || 'all';
        if (scope === 'all') return true;
        if (scope === 'first-only') return pageIndex === 0;
        if (scope === 'except-first') return pageIndex > 0;
        if (scope === 'current') return pageIndex === (config.targetPageIndex !== undefined ? config.targetPageIndex : 0);
        return true;
    }

    function calculateAutoFontSize(text, width, height, mode) {
        if (mode === 'tiled') return 28;
        const len = Math.max(1, (text || '').length);
        const diagonal = Math.sqrt(width * width + height * height);
        // Target width: approx 65% of page diagonal
        const targetW = diagonal * 0.65;
        const size = Math.round(targetW / (len * 0.65));
        return Math.max(24, Math.min(140, size));
    }

    function generateWatermarkHTML(config, width, height, isThumb = false) {
        if (!config) return '';
        const pW = parseFloat(width) || 794;
        const pH = parseFloat(height) || 1123;
        const zIndex = config.layer === 'front' ? 998 : 0;

        const scaleVal = (config.scale !== undefined && config.scale !== null) ? parseInt(config.scale) : 100;
        const scaleMultiplier = Math.max(0.2, Math.min(3.0, scaleVal / 100));

        if (config.type === 'image') {
            const imgSrc = config.imgSrc || '';
            if (!imgSrc) return '';
            const scalePercent = Math.max(10, Math.min(95, Math.round(scaleVal * 0.5)));
            const opacity = config.opacity !== undefined ? config.opacity : 0.15;
            const washout = config.washout !== false ? 'filter: grayscale(100%) brightness(1.2);' : '';
            return `
                <div class="watermark-inner-wrap" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: ${zIndex}; overflow: hidden;">
                    <img src="${imgSrc}" style="max-width: ${scalePercent}%; max-height: ${scalePercent}%; opacity: ${opacity}; ${washout} object-fit: contain; pointer-events: none; display: block; border: none; outline: none; margin: 0; padding: 0;">
                </div>
            `;
        }

        // Text watermark
        const text = (config.text || 'DRAFT').toUpperCase();
        const mode = config.mode || 'diagonal';
        const style = config.style || 'solid';
        const color = config.color || '#64748b';
        const opacity = config.opacity !== undefined ? config.opacity : 0.16;
        const fontFam = config.fontFamily || 'Segoe UI, sans-serif';
        const fontWt = config.fontWeight || '800';

        let fontSize = config.fontSize === 'auto' || !config.fontSize
            ? calculateAutoFontSize(text, pW, pH, mode)
            : parseInt(config.fontSize) || 72;

        // Apply scale multiplier
        fontSize = Math.round(fontSize * scaleMultiplier);

        const uniquePatternId = 'wm-pat-' + Math.random().toString(36).substring(2, 9);

        if (mode === 'tiled') {
            const tileW = Math.max(120, Math.round(fontSize * text.length * 0.85));
            const tileH = Math.round(tileW * 0.65);
            return `
                <svg width="100%" height="100%" viewBox="0 0 ${pW} ${pH}" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: ${zIndex}; overflow: hidden; display: block;">
                    <defs>
                        <pattern id="${uniquePatternId}" width="${tileW}" height="${tileH}" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
                            <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
                                  font-family="${fontFam}" font-size="${fontSize}px" font-weight="${fontWt}"
                                  fill="${color}" fill-opacity="${opacity}" letter-spacing="2px">
                                ${escapeHtml(text)}
                            </text>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#${uniquePatternId})" />
                </svg>
            `;
        }

        const angle = mode === 'horizontal' ? 0 : -45;

        let fillAttr = `fill="${color}" fill-opacity="${opacity}"`;
        if (style === 'outline') {
            fillAttr = `fill="none" stroke="${color}" stroke-width="${Math.max(1.5, Math.round(fontSize * 0.035))}" stroke-opacity="${opacity}"`;
        } else if (style === 'outline-stamp') {
            fillAttr = `fill="${color}" fill-opacity="${opacity}" stroke="${color}" stroke-width="${Math.max(1, Math.round(fontSize * 0.02))}" stroke-opacity="${opacity}"`;
        }

        let stampBox = '';
        if (style === 'outline-stamp' || style === 'border-stamp') {
            const approxCharW = fontSize * 0.65;
            const textW = approxCharW * text.length;
            const padX = fontSize * 0.45;
            const padY = fontSize * 0.25;
            const boxW = textW + padX * 2;
            const boxH = fontSize + padY * 2;
            const boxX = (pW - boxW) / 2;
            const boxY = (pH - boxH) / 2;
            const strkW = Math.max(3, Math.round(fontSize * 0.06));
            const rPx = Math.max(4, Math.round(fontSize * 0.1));
            stampBox = `
                <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="${rPx}" ry="${rPx}"
                      fill="none" stroke="${color}" stroke-width="${strkW}" stroke-opacity="${opacity}"
                      stroke-dasharray="none" transform="rotate(${angle} ${pW / 2} ${pH / 2})" />
            `;
        }

        return `
            <svg width="100%" height="100%" viewBox="0 0 ${pW} ${pH}" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: ${zIndex}; overflow: hidden; display: block;">
                ${stampBox}
                <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
                      transform="rotate(${angle} ${pW / 2} ${pH / 2})"
                      font-family="${fontFam}" font-size="${fontSize}px" font-weight="${fontWt}"
                      ${fillAttr} letter-spacing="4px">
                    ${escapeHtml(text)}
                </text>
            </svg>
        `;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function renderWatermarkOnCanvas() {
        const paper = document.getElementById('paper');
        if (!paper) return;

        // Clean existing watermark
        const existing = paper.querySelector('#page-watermark');
        if (existing) existing.remove();

        if (typeof state === 'undefined' || !state.watermark) return;

        const totalPages = (state.pages && state.pages.length) ? state.pages.length : 1;
        const curIdx = state.currentPageIndex || 0;
        if (!shouldApplyToPage(state.watermark, curIdx, totalPages)) return;

        const pW = parseFloat(paper.style.width) || 794;
        const pH = parseFloat(paper.style.height) || 1123;
        const html = generateWatermarkHTML(state.watermark, pW, pH);
        if (!html) return;

        const wmContainer = document.createElement('div');
        wmContainer.id = 'page-watermark';
        wmContainer.className = 'no-select';
        wmContainer.style.cssText = `position: absolute; inset: 0; pointer-events: none; z-index: ${state.watermark.layer === 'front' ? 998 : 0}; overflow: hidden;`;
        wmContainer.innerHTML = html;

        if (state.watermark.layer === 'front') {
            paper.appendChild(wmContainer);
        } else {
            // Insert behind elements (before first pub-element or after background theme)
            const firstPubEl = paper.querySelector('.pub-element');
            if (firstPubEl) {
                paper.insertBefore(wmContainer, firstPubEl);
            } else {
                paper.appendChild(wmContainer);
            }
        }
    }

    // Modal UI Implementation
    function ensureModalStyles() {
        if (document.getElementById('op-watermark-styles')) return;
        const style = document.createElement('style');
        style.id = 'op-watermark-styles';
        style.textContent = `
            #custom-dialog-box.watermark-dialog-box {
                width: 780px !important;
                max-width: 95vw !important;
            }
            .wm-modal-body {
                display: flex;
                gap: 20px;
                box-sizing: border-box;
                min-height: 440px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            @media (max-width: 680px) {
                .wm-modal-body { flex-direction: column; }
            }
            .wm-controls-pane {
                flex: 1.1;
                overflow-y: auto;
                padding-right: 14px;
                border-right: 1px solid #e2e8f0;
            }
            body.dark-mode .wm-controls-pane { border-right-color: #334155; }
            .wm-preview-pane {
                width: 240px;
                flex-shrink: 0;
                background: #f8fafc;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 16px;
                box-sizing: border-box;
                border: 1px solid #e2e8f0;
            }
            body.dark-mode .wm-preview-pane {
                background: #0f172a;
                border-color: #334155;
            }

            .wm-tabs-nav {
                display: flex;
                background: #f1f5f9;
                border-radius: 8px;
                padding: 3px;
                gap: 4px;
                margin-bottom: 14px;
            }
            body.dark-mode .wm-tabs-nav { background: #0f172a; }
            .wm-tab-btn {
                flex: 1;
                padding: 7px 10px;
                border-radius: 6px;
                border: none;
                background: transparent;
                color: #64748b;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }
            .wm-tab-btn.active {
                background: #ffffff;
                color: var(--ui-theme-dark, #007670);
                box-shadow: 0 1px 4px rgba(0,0,0,0.08);
            }
            body.dark-mode .wm-tab-btn.active {
                background: #1e293b;
                color: #38bdf8;
                box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            }

            .wm-presets-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 6px;
                margin-bottom: 14px;
            }
            .wm-preset-chip {
                padding: 8px 6px;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                background: #f8fafc;
                font-size: 11px;
                font-weight: 700;
                text-align: center;
                cursor: pointer;
                color: #334155;
                transition: all 0.12s;
                user-select: none;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            body.dark-mode .wm-preset-chip {
                background: #1e293b;
                border-color: #334155;
                color: #e2e8f0;
            }
            .wm-preset-chip:hover {
                border-color: var(--ui-theme-dark, #007670);
                transform: translateY(-1px);
            }
            .wm-preset-chip.active {
                border-color: var(--ui-theme-dark, #007670);
                background: rgba(0, 118, 112, 0.08);
                color: var(--ui-theme-dark, #007670);
                box-shadow: 0 0 0 1px var(--ui-theme-dark, #007670);
            }
            body.dark-mode .wm-preset-chip.active {
                background: rgba(56, 189, 248, 0.12);
                border-color: #38bdf8;
                color: #38bdf8;
                box-shadow: 0 0 0 1px #38bdf8;
            }

            .wm-form-group {
                margin-bottom: 12px;
            }
            .wm-label {
                display: block;
                font-size: 11px;
                font-weight: 700;
                margin-bottom: 5px;
                color: #475569;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            body.dark-mode .wm-label { color: #94a3b8; }
            .wm-input, .wm-select {
                width: 100%;
                padding: 7px 10px;
                border-radius: 6px;
                border: 1px solid #cbd5e1;
                font-size: 12px;
                box-sizing: border-box;
                background: #ffffff;
                color: inherit;
                font-family: inherit;
                outline: none;
            }
            body.dark-mode .wm-input, body.dark-mode .wm-select {
                background: #0f172a;
                border-color: #334155;
            }
            .wm-input:focus, .wm-select:focus {
                border-color: var(--ui-theme-dark, #007670);
                box-shadow: 0 0 0 2px rgba(0, 118, 112, 0.15);
            }

            .wm-row {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            .wm-row > * { flex: 1; }

            .wm-slider-wrap {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .wm-slider {
                flex: 1;
                height: 6px;
                border-radius: 4px;
                background: #e2e8f0;
                outline: none;
                accent-color: var(--ui-theme-dark, #007670);
                cursor: pointer;
            }
            body.dark-mode .wm-slider { background: #334155; }
            .wm-slider-val {
                width: 44px;
                font-size: 12px;
                font-weight: 700;
                text-align: right;
                color: #64748b;
            }

            .wm-radio-group {
                display: flex;
                gap: 6px;
            }
            .wm-radio-pill {
                flex: 1;
                padding: 6px 6px;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                text-align: center;
                cursor: pointer;
                user-select: none;
                transition: all 0.12s;
            }
            body.dark-mode .wm-radio-pill {
                border-color: #334155;
            }
            .wm-radio-pill.active {
                background: var(--ui-theme-dark, #007670);
                color: #ffffff;
                border-color: var(--ui-theme-dark, #007670);
            }

            /* Live Preview Miniature */
            .wm-sheet-preview {
                width: 200px;
                height: 282px;
                background: #ffffff;
                border-radius: 4px;
                box-shadow: 0 8px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06);
                position: relative;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                padding: 20px 16px;
                box-sizing: border-box;
                user-select: none;
            }
            .wm-preview-mock-header {
                width: 50%;
                height: 8px;
                background: #cbd5e1;
                border-radius: 3px;
                margin-bottom: 14px;
            }
            .wm-preview-mock-line {
                width: 100%;
                height: 4px;
                background: #e2e8f0;
                border-radius: 3px;
                margin-bottom: 7px;
            }
            .wm-preview-mock-line.short { width: 70%; }
            .wm-preview-mock-line.indent { width: 85%; margin-left: 15%; }
            .wm-preview-overlay {
                position: absolute;
                inset: 0;
                pointer-events: none;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }

    let activeConfig = null;

    function showModal() {
        ensureModalStyles();

        // Initialize state from existing document watermark or default
        const existing = (typeof state !== 'undefined' && state.watermark)
            ? JSON.parse(JSON.stringify(state.watermark))
            : Object.assign({}, PRESETS.draft);

        activeConfig = Object.assign({
            type: 'text',
            text: 'DRAFT',
            fontFamily: 'Segoe UI, sans-serif',
            fontWeight: '800',
            mode: 'diagonal',
            style: 'solid',
            color: '#64748b',
            opacity: 0.16,
            fontSize: 'auto',
            scale: 100,
            scope: 'all',
            layer: 'behind'
        }, existing);

        const modalBodyHTML = `
            <div class="wm-modal-body">
                <!-- CONTROLS PANE -->
                <div class="wm-controls-pane">
                    <div class="wm-tabs-nav">
                        <button type="button" class="wm-tab-btn active" data-tab="presets" onclick="WatermarkEngine.switchTab('presets')">
                            <i class="fas fa-th-large"></i> Presets
                        </button>
                        <button type="button" class="wm-tab-btn" data-tab="custom" onclick="WatermarkEngine.switchTab('custom')">
                            <i class="fas fa-font"></i> Custom Text
                        </button>
                        <button type="button" class="wm-tab-btn" data-tab="image" onclick="WatermarkEngine.switchTab('image')">
                            <i class="fas fa-image"></i> Image Logo
                        </button>
                    </div>

                    <!-- PRESETS TAB -->
                    <div id="wm-tab-presets" class="wm-tab-content">
                        <div class="wm-form-group">
                            <label class="wm-label">Choose a Standard Stamp</label>
                            <div class="wm-presets-grid">
                                <div class="wm-preset-chip ${activeConfig.id === 'draft' ? 'active' : ''}" data-preset="draft" onclick="WatermarkEngine.selectPreset('draft')">DRAFT</div>
                                <div class="wm-preset-chip ${activeConfig.id === 'confidential' ? 'active' : ''}" data-preset="confidential" onclick="WatermarkEngine.selectPreset('confidential')">CONFIDENTIAL</div>
                                <div class="wm-preset-chip ${activeConfig.id === 'sample' ? 'active' : ''}" data-preset="sample" onclick="WatermarkEngine.selectPreset('sample')">SAMPLE</div>
                                <div class="wm-preset-chip ${activeConfig.id === 'donotcopy' ? 'active' : ''}" data-preset="donotcopy" onclick="WatermarkEngine.selectPreset('donotcopy')">DO NOT COPY</div>
                                <div class="wm-preset-chip ${activeConfig.id === 'urgent' ? 'active' : ''}" data-preset="urgent" onclick="WatermarkEngine.selectPreset('urgent')">URGENT</div>
                                <div class="wm-preset-chip ${activeConfig.id === 'paid' ? 'active' : ''}" data-preset="paid" onclick="WatermarkEngine.selectPreset('paid')">PAID STAMP</div>
                                <div class="wm-preset-chip ${activeConfig.id === 'copy' ? 'active' : ''}" data-preset="copy" onclick="WatermarkEngine.selectPreset('copy')">COPY</div>
                                <div class="wm-preset-chip ${activeConfig.id === 'proof' ? 'active' : ''}" data-preset="proof" onclick="WatermarkEngine.selectPreset('proof')">PROOF</div>
                                <div class="wm-preset-chip ${activeConfig.id === 'security_tile' ? 'active' : ''}" data-preset="security_tile" onclick="WatermarkEngine.selectPreset('security_tile')">SECURITY TILE</div>
                            </div>
                        </div>
                    </div>

                    <!-- CUSTOM TEXT TAB -->
                    <div id="wm-tab-custom" class="wm-tab-content" style="display: none;">
                        <div class="wm-form-group">
                            <label class="wm-label">Watermark Text</label>
                            <input type="text" id="wm-custom-text" class="wm-input" value="${escapeHtml(activeConfig.text || 'CONFIDENTIAL')}" placeholder="Enter watermark wording...">
                        </div>
                        <div class="wm-row wm-form-group">
                            <div>
                                <label class="wm-label">Font Family</label>
                                <select id="wm-font-family" class="wm-select">
                                    <option value="Segoe UI, sans-serif">Segoe UI</option>
                                    <option value="Impact, sans-serif">Impact</option>
                                    <option value="Arial, sans-serif">Arial</option>
                                    <option value="Times New Roman, serif">Times New Roman</option>
                                    <option value="Georgia, serif">Georgia</option>
                                    <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                                    <option value="Pacifico, cursive">Pacifico</option>
                                    <option value="Courier New, monospace">Courier New</option>
                                </select>
                            </div>
                            <div>
                                <label class="wm-label">Orientation</label>
                                <select id="wm-text-mode" class="wm-select">
                                    <option value="diagonal">Diagonal (-45°)</option>
                                    <option value="horizontal">Horizontal (0°)</option>
                                    <option value="tiled">Security Tiled Matrix</option>
                                </select>
                            </div>
                        </div>
                        <div class="wm-row wm-form-group">
                            <div>
                                <label class="wm-label">Style</label>
                                <select id="wm-text-style" class="wm-select">
                                    <option value="solid">Solid Fill</option>
                                    <option value="outline">Hollow Outline</option>
                                    <option value="outline-stamp">Border Stamp Box</option>
                                </select>
                            </div>
                            <div>
                                <label class="wm-label">Color</label>
                                <div style="display:flex; gap:6px; align-items:center;">
                                    <input type="color" id="wm-color-picker" value="${activeConfig.color || '#64748b'}" style="width:34px; height:32px; padding:0; border:none; border-radius:6px; cursor:pointer;">
                                    <input type="text" id="wm-color-hex" class="wm-input" value="${activeConfig.color || '#64748b'}" style="flex:1;">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- IMAGE TAB -->
                    <div id="wm-tab-image" class="wm-tab-content" style="display: none;">
                        <div class="wm-form-group">
                            <label class="wm-label">Select Image or Logo</label>
                            <div style="display:flex; gap:8px;">
                                <input type="text" id="wm-img-url" class="wm-input" placeholder="Image URL or upload..." value="${escapeHtml(activeConfig.imgSrc || '')}">
                                <button type="button" class="btn-secondary" style="padding: 0 12px; height: 32px;" onclick="document.getElementById('wm-file-input').click()"><i class="fas fa-folder-open"></i></button>
                                <input type="file" id="wm-file-input" accept="image/*" style="display:none;" onchange="WatermarkEngine.handleFileUpload(this)">
                            </div>
                        </div>
                        <div class="wm-form-group">
                            <label style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:600; cursor:pointer; color:#475569;">
                                <input type="checkbox" id="wm-washout-toggle" ${activeConfig.washout !== false ? 'checked' : ''}>
                                Washout (High-key grayscale fade)
                            </label>
                        </div>
                    </div>

                    <!-- COMMON SETTINGS: OPACITY & SCALE SLIDERS -->
                    <div class="wm-form-group" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
                        <div class="wm-row">
                            <label class="wm-label">Opacity / Density</label>
                            <span class="wm-slider-val" id="wm-opacity-num">${Math.round((activeConfig.opacity || 0.16) * 100)}%</span>
                        </div>
                        <div class="wm-slider-wrap">
                            <input type="range" id="wm-opacity-slider" class="wm-slider" min="5" max="65" value="${Math.round((activeConfig.opacity || 0.16) * 100)}">
                        </div>
                    </div>

                    <div class="wm-form-group" style="margin-top: 10px;">
                        <div class="wm-row">
                            <label class="wm-label">Watermark Scale</label>
                            <span class="wm-slider-val" id="wm-scale-num">${activeConfig.scale || 100}%</span>
                        </div>
                        <div class="wm-slider-wrap">
                            <input type="range" id="wm-scale-slider" class="wm-slider" min="25" max="250" value="${activeConfig.scale || 100}">
                        </div>
                    </div>

                    <div class="wm-form-group" style="margin-top: 12px;">
                        <label class="wm-label">Pages to Apply</label>
                        <div class="wm-radio-group">
                            <div class="wm-radio-pill ${activeConfig.scope === 'all' ? 'active' : ''}" data-scope="all" onclick="WatermarkEngine.setScope('all')">All Pages</div>
                            <div class="wm-radio-pill ${activeConfig.scope === 'except-first' ? 'active' : ''}" data-scope="except-first" onclick="WatermarkEngine.setScope('except-first')">Except Cover</div>
                            <div class="wm-radio-pill ${activeConfig.scope === 'first-only' ? 'active' : ''}" data-scope="first-only" onclick="WatermarkEngine.setScope('first-only')">First Only</div>
                            <div class="wm-radio-pill ${activeConfig.scope === 'current' ? 'active' : ''}" data-scope="current" onclick="WatermarkEngine.setScope('current')">Current</div>
                        </div>
                    </div>

                    <div class="wm-form-group">
                        <label class="wm-label">Layer Placement</label>
                        <div class="wm-radio-group">
                            <div class="wm-radio-pill ${activeConfig.layer === 'behind' ? 'active' : ''}" data-layer="behind" onclick="WatermarkEngine.setLayer('behind')">Behind Content</div>
                            <div class="wm-radio-pill ${activeConfig.layer === 'front' ? 'active' : ''}" data-layer="front" onclick="WatermarkEngine.setLayer('front')">Over Content</div>
                        </div>
                    </div>
                </div>

                <!-- LIVE PREVIEW PANE -->
                <div class="wm-preview-pane">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 12px; letter-spacing: 0.5px;">Live Page Preview</div>
                    <div class="wm-sheet-preview" id="wm-sheet-preview">
                        <div class="wm-preview-mock-header"></div>
                        <div class="wm-preview-mock-line"></div>
                        <div class="wm-preview-mock-line"></div>
                        <div class="wm-preview-mock-line short"></div>
                        <div style="height: 12px;"></div>
                        <div class="wm-preview-mock-line indent"></div>
                        <div class="wm-preview-mock-line indent"></div>
                        <div class="wm-preview-mock-line indent short"></div>
                        <div style="height: 14px;"></div>
                        <div class="wm-preview-mock-line"></div>
                        <div class="wm-preview-mock-line"></div>
                        <div class="wm-preview-overlay" id="wm-preview-overlay"></div>
                    </div>
                </div>
            </div>
        `;

        if (typeof DialogSystem !== 'undefined') {
            DialogSystem.show(
                '<i class="fas fa-stamp" style="margin-right:8px;"></i>Document Watermark',
                modalBodyHTML,
                function() {
                    applyCurrent();
                },
                false,
                'Apply Watermark'
            );

            const dialogBox = document.getElementById('custom-dialog-box');
            if (dialogBox) {
                dialogBox.classList.add('watermark-dialog-box');
                const footer = dialogBox.querySelector('.custom-dialog-footer');
                if (footer && typeof state !== 'undefined' && state.watermark) {
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'btn-secondary';
                    removeBtn.id = 'wm-remove-btn';
                    removeBtn.style.cssText = 'color: #dc2626; border-color: #fca5a5; margin-right: auto; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
                    removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Remove Watermark';
                    removeBtn.onclick = () => {
                        remove();
                        DialogSystem.close();
                    };
                    footer.insertBefore(removeBtn, footer.firstChild);
                }
            }
        }

        // Bind interactive event listeners for live preview
        bindModalEvents();
        updateModalPreview();
    }

    function closeModal() {
        if (typeof DialogSystem !== 'undefined' && typeof DialogSystem.close === 'function') {
            DialogSystem.close();
        }
    }

    function switchTab(tabId) {
        document.querySelectorAll('.wm-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });
        const presetsTab = document.getElementById('wm-tab-presets');
        const customTab = document.getElementById('wm-tab-custom');
        const imageTab = document.getElementById('wm-tab-image');
        if (presetsTab) presetsTab.style.display = tabId === 'presets' ? 'block' : 'none';
        if (customTab) customTab.style.display = tabId === 'custom' ? 'block' : 'none';
        if (imageTab) imageTab.style.display = tabId === 'image' ? 'block' : 'none';

        if (tabId === 'image') {
            activeConfig.type = 'image';
        } else {
            activeConfig.type = 'text';
        }
        updateModalPreview();
    }

    function selectPreset(presetId) {
        const p = PRESETS[presetId];
        if (!p) return;
        const curScale = (activeConfig && activeConfig.scale !== undefined) ? activeConfig.scale : (p.scale || 100);
        const curScope = (activeConfig && activeConfig.scope) ? activeConfig.scope : 'all';
        const curLayer = (activeConfig && activeConfig.layer) ? activeConfig.layer : 'behind';
        activeConfig = Object.assign({}, p, {
            scale: curScale,
            scope: curScope,
            layer: curLayer
        });

        document.querySelectorAll('.wm-preset-chip').forEach(c => {
            c.classList.toggle('active', c.getAttribute('data-preset') === presetId);
        });

        const opSlider = document.getElementById('wm-opacity-slider');
        const opNum = document.getElementById('wm-opacity-num');
        if (opSlider && opNum) {
            const opVal = Math.round(activeConfig.opacity * 100);
            opSlider.value = opVal;
            opNum.innerText = opVal + '%';
        }

        const scaleSlider = document.getElementById('wm-scale-slider');
        const scaleNum = document.getElementById('wm-scale-num');
        if (scaleSlider && scaleNum) {
            scaleSlider.value = activeConfig.scale;
            scaleNum.innerText = activeConfig.scale + '%';
        }

        updateModalPreview();
    }

    function setScope(scope) {
        if (!activeConfig) return;
        activeConfig.scope = scope;
        document.querySelectorAll('[data-scope]').forEach(pill => {
            pill.classList.toggle('active', pill.getAttribute('data-scope') === scope);
        });
    }

    function setLayer(layer) {
        if (!activeConfig) return;
        activeConfig.layer = layer;
        document.querySelectorAll('[data-layer]').forEach(pill => {
            pill.classList.toggle('active', pill.getAttribute('data-layer') === layer);
        });
        updateModalPreview();
    }

    function handleFileUpload(input) {
        if (!input || !input.files || !input.files[0]) return;
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            activeConfig.type = 'image';
            activeConfig.imgSrc = e.target.result;
            const urlInput = document.getElementById('wm-img-url');
            if (urlInput) urlInput.value = file.name;
            updateModalPreview();
        };
        reader.readAsDataURL(file);
    }

    function bindModalEvents() {
        const customTextInput = document.getElementById('wm-custom-text');
        if (customTextInput) {
            customTextInput.addEventListener('input', (e) => {
                activeConfig.text = e.target.value;
                delete activeConfig.id;
                document.querySelectorAll('.wm-preset-chip').forEach(c => c.classList.remove('active'));
                updateModalPreview();
            });
        }

        const fontSelect = document.getElementById('wm-font-family');
        if (fontSelect) {
            fontSelect.value = activeConfig.fontFamily || 'Segoe UI, sans-serif';
            fontSelect.addEventListener('change', (e) => {
                activeConfig.fontFamily = e.target.value;
                updateModalPreview();
            });
        }

        const modeSelect = document.getElementById('wm-text-mode');
        if (modeSelect) {
            modeSelect.value = activeConfig.mode || 'diagonal';
            modeSelect.addEventListener('change', (e) => {
                activeConfig.mode = e.target.value;
                updateModalPreview();
            });
        }

        const styleSelect = document.getElementById('wm-text-style');
        if (styleSelect) {
            styleSelect.value = activeConfig.style || 'solid';
            styleSelect.addEventListener('change', (e) => {
                activeConfig.style = e.target.value;
                updateModalPreview();
            });
        }

        const colorPick = document.getElementById('wm-color-picker');
        const colorHex = document.getElementById('wm-color-hex');
        if (colorPick && colorHex) {
            colorPick.addEventListener('input', (e) => {
                activeConfig.color = e.target.value;
                colorHex.value = e.target.value;
                updateModalPreview();
            });
            colorHex.addEventListener('input', (e) => {
                activeConfig.color = e.target.value;
                colorPick.value = e.target.value;
                updateModalPreview();
            });
        }

        const opSlider = document.getElementById('wm-opacity-slider');
        const opNum = document.getElementById('wm-opacity-num');
        if (opSlider && opNum) {
            opSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) || 16;
                activeConfig.opacity = val / 100;
                opNum.innerText = val + '%';
                updateModalPreview();
            });
        }

        const scaleSlider = document.getElementById('wm-scale-slider');
        const scaleNum = document.getElementById('wm-scale-num');
        if (scaleSlider && scaleNum) {
            scaleSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) || 100;
                activeConfig.scale = val;
                scaleNum.innerText = val + '%';
                updateModalPreview();
            });
        }

        const washoutToggle = document.getElementById('wm-washout-toggle');
        if (washoutToggle) {
            washoutToggle.addEventListener('change', (e) => {
                activeConfig.washout = e.target.checked;
                updateModalPreview();
            });
        }

        const imgUrlInput = document.getElementById('wm-img-url');
        if (imgUrlInput) {
            imgUrlInput.addEventListener('input', (e) => {
                activeConfig.type = 'image';
                activeConfig.imgSrc = e.target.value.trim();
                updateModalPreview();
            });
        }
    }

    function getDocumentDimensions() {
        if (typeof state !== 'undefined' && state.pages && state.pages[state.currentPageIndex]) {
            const p = state.pages[state.currentPageIndex];
            const w = parseFloat(p.width) || 794;
            const h = parseFloat(p.height) || 1123;
            return { w, h };
        }
        const paper = document.getElementById('paper');
        if (paper) {
            const w = parseFloat(paper.style.width) || 794;
            const h = parseFloat(paper.style.height) || 1123;
            return { w, h };
        }
        return { w: 794, h: 1123 };
    }

    function updateSheetPreviewSize(docW, docH) {
        const sheet = document.getElementById('wm-sheet-preview');
        if (!sheet) return;
        const maxW = 210;
        const maxH = 282;
        const ratio = docW / docH;
        let w, h;
        if (ratio >= 1) { // Landscape
            w = maxW;
            h = Math.max(140, Math.round(maxW / ratio));
        } else { // Portrait
            h = maxH;
            w = Math.max(140, Math.round(maxH * ratio));
        }
        sheet.style.width = w + 'px';
        sheet.style.height = h + 'px';
    }

    function updateModalPreview() {
        const overlay = document.getElementById('wm-preview-overlay');
        if (!overlay || !activeConfig) return;
        const { w, h } = getDocumentDimensions();
        updateSheetPreviewSize(w, h);
        overlay.innerHTML = generateWatermarkHTML(activeConfig, w, h);
    }

    function applyCurrent() {
        if (!activeConfig) return;
        if (typeof state === 'undefined') return;

        // Remember current page index if scope is 'current'
        if (activeConfig.scope === 'current') {
            activeConfig.targetPageIndex = state.currentPageIndex || 0;
        }

        state.watermark = JSON.parse(JSON.stringify(activeConfig));
        renderWatermarkOnCanvas();

        if (typeof pushHistory === 'function') {
            pushHistory();
        }

        closeModal();

        if (typeof DialogSystem !== 'undefined' && DialogSystem.toast) {
            DialogSystem.toast('Watermark applied to document');
        }
    }

    function remove() {
        if (typeof state === 'undefined') return;
        delete state.watermark;
        renderWatermarkOnCanvas();

        if (typeof pushHistory === 'function') {
            pushHistory();
        }

        closeModal();

        if (typeof DialogSystem !== 'undefined' && DialogSystem.toast) {
            DialogSystem.toast('Watermark removed');
        }
    }

    // Public API
    window.WatermarkEngine = {
        PRESETS,
        showModal,
        closeModal,
        switchTab,
        selectPreset,
        setScope,
        setLayer,
        handleFileUpload,
        updateModalPreview,
        applyCurrent,
        apply: function(config) {
            if (typeof state === 'undefined') return;
            state.watermark = JSON.parse(JSON.stringify(config));
            renderWatermarkOnCanvas();
            if (typeof pushHistory === 'function') pushHistory();
        },
        remove,
        shouldApplyToPage,
        generateWatermarkHTML,
        renderWatermarkOnCanvas
    };

    window.showWatermarkModal = showModal;

})();
