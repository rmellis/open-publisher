/**
 * OpenPublisher Promotional Badge & Advertisement Studio Modal (v5.19.1)
 * Rich interactive advertisement designer with real-time vector preview,
 * instant live text customization, curated palettes, solid color fill picker,
 * Google WebFonts typography, instant search, and category filtering.
 */

(function(window) {
    'use strict';

    window.showAdModal = function(targetEl = null) {
        // If targetEl is not passed, check if currently selected element is an advertisement
        if (!targetEl && typeof state !== 'undefined' && state.selectedEl) {
            const sel = state.selectedEl;
            if (sel.getAttribute('data-type') === 'advertisement' || sel.classList.contains('has-advertisement') || sel.hasAttribute('data-ad-preset')) {
                targetEl = sel;
            }
        }

        const isEditMode = !!targetEl;
        const engine = window.AdvertisementEngine;
        if (!engine) {
            console.error('AdvertisementEngine not loaded.');
            return;
        }

        const presets = engine.getPresets();
        const palettes = engine.getPalettes();

        // Initial configuration from existing element or defaults
        const existingConfig = isEditMode ? engine.getElementConfig(targetEl) : null;
        let selectedPresetId = existingConfig ? existingConfig.presetId : 'burst_classic_ruby';
        let currentPrimaryText = existingConfig ? existingConfig.primaryText : '';
        let currentSubtext = existingConfig ? existingConfig.subtext : '';
        let selectedPaletteId = existingConfig ? existingConfig.paletteId : 'publisher-teal';
        let selectedFont = existingConfig ? existingConfig.font : 'Montserrat';
        let selectedSize = 180;
        let solidColorHex = selectedPaletteId.startsWith('#') ? selectedPaletteId : '#0f766e';
        let currentOffsetX = existingConfig ? (existingConfig.offsetX || 0) : 0;
        let currentOffsetY = existingConfig ? (existingConfig.offsetY || 0) : 0;
        let currentLineGap = existingConfig ? (existingConfig.lineGap || 0) : 0;
        let currentScaleX = existingConfig ? (existingConfig.scaleX !== undefined ? existingConfig.scaleX : 100) : 100;
        let activeTab = 'style';

        // If inserting new and text is empty, seed with preset defaults
        const initialPreset = engine.getPresetById(selectedPresetId);
        if (!isEditMode) {
            if (!currentPrimaryText) currentPrimaryText = initialPreset.defaultText;
            if (!currentSubtext && initialPreset.defaultSubtext) currentSubtext = initialPreset.defaultSubtext;
            if (existingConfig === null && initialPreset.defaultPalette) selectedPaletteId = initialPreset.defaultPalette;
        }

        let activeCategory = 'all';
        let searchQuery = '';

        const fontOptions = [
            { label: 'Montserrat (Modern Clean)', value: 'Montserrat' },
            { label: 'Segoe UI (Clean Geometric)', value: 'Segoe UI' },
            { label: 'Bebas Neue (Condensed)', value: 'Bebas Neue' },
            { label: 'Impact (Bold Headline)', value: 'Impact' },
            { label: 'Anton (Tall Punchy)', value: 'Anton' },
            { label: 'Righteous (Retro Display)', value: 'Righteous' },
            { label: 'Playfair Display (Luxury Serif)', value: 'Playfair Display' },
            { label: 'Arial Black (Heavy Impact)', value: 'Arial Black' }
        ];

        const categories = [
            { id: 'all', label: 'All Badges' },
            { id: 'Sales & Bursts', label: 'Sales & Bursts' },
            { id: 'Discounts & Offers', label: 'Discounts & Offers' },
            { id: 'Ribbons & Banners', label: 'Ribbons & Banners' },
            { id: 'Seals & Emblems', label: 'Seals & Emblems' },
            { id: 'Modern & Minimal', label: 'Modern & Minimal' },
            { id: 'Retail & Coupons', label: 'Retail & Coupons' },
            { id: 'Urgency & Stock', label: 'Urgency & Stock' }
        ];

        const isCustomSolid = selectedPaletteId.startsWith('#');

        const modalHtml = `
            <div class="ad-studio-modal-container" style="display:flex; gap:20px; width:790px; max-width:94vw; max-height:82vh; box-sizing:border-box; font-family:'Segoe UI', system-ui, sans-serif; color:#1e293b; overflow:visible;">
                <!-- LEFT COLUMN: Live Studio Stage & Real-Time Customizer -->
                <div style="flex:0 0 315px; display:flex; flex-direction:column; background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0; padding:14px; box-sizing:border-box; overflow:visible; position:relative;">
                    <!-- Preview Title & Dimensions Badge -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#475569;">Live Badge Preview</span>
                        <span id="ad-preview-dims" style="font-size:11px; background:#e2e8f0; padding:2px 8px; border-radius:10px; color:#475569; font-weight:600;">180 x 180 px</span>
                    </div>

                    <!-- Stage Viewport -->
                    <div style="height:175px; min-height:175px; background:#f1f5f9; border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; box-shadow:inset 0 2px 6px rgba(0,0,0,0.06); padding:10px; box-sizing:border-box; border:1px dashed #cbd5e1; user-select:none;">
                        <!-- Floating drag hint badge -->
                        <div id="ad-drag-pill" style="position:absolute; top:6px; right:8px; font-size:9.5px; background:rgba(15,118,110,0.9); color:#ffffff; padding:2px 8px; border-radius:10px; font-weight:600; pointer-events:none; display:none; z-index:10; box-shadow:0 2px 4px rgba(0,0,0,0.15); transition:opacity 0.15s ease;">✥ Drag text to position</div>
                        <div id="ad-preview-stage" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; transition:transform 0.15s ease; cursor:grab;">
                            <!-- SVG Rendered Here -->
                        </div>
                    </div>

                    <!-- Selected Preset Header Badge -->
                    <div style="margin-top:8px; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
                        <div id="ad-badge-name" style="font-size:12px; font-weight:700; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Classic 16-Pt Starburst</div>
                        <span id="ad-badge-cat" style="font-size:10px; background:#f1f5f9; color:#475569; padding:2px 6px; border-radius:4px; font-weight:600; white-space:nowrap;">Sales</span>
                    </div>

                    <!-- Navigation Tabs: Content & Style vs. Position & Spacing -->
                    <div style="display:flex; background:#e2e8f0; border-radius:7px; padding:3px; margin-top:8px; gap:3px;">
                        <button type="button" id="ad-tab-btn-style" class="ad-custom-tab-btn active" style="flex:1; border:none; background:#ffffff; color:#0f172a; padding:5px 8px; border-radius:5px; font-size:11px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; box-shadow:0 1px 2px rgba(0,0,0,0.06); transition:all 0.15s ease;">
                            <i class="fas fa-paint-brush" style="font-size:10px; color:var(--ui-theme-color, #0f766e);"></i> Content & Style
                        </button>
                        <button type="button" id="ad-tab-btn-position" class="ad-custom-tab-btn" style="flex:1; border:none; background:transparent; color:#64748b; padding:5px 8px; border-radius:5px; font-size:11px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; transition:all 0.15s ease;">
                            <i class="fas fa-arrows-alt" style="font-size:10px;"></i> Position & Spacing
                            <span id="ad-tab-offset-badge" style="display:${(currentOffsetX || currentOffsetY || currentLineGap) ? 'inline-block' : 'none'}; width:6px; height:6px; border-radius:50%; background:var(--ui-theme-color, #0f766e);"></span>
                        </button>
                    </div>

                    <!-- TAB 1: Content & Style (overflow visible so font dropdown never crops) -->
                    <div id="ad-tab-pane-style" style="margin-top:8px; display:flex; flex-direction:column; gap:7px; overflow:visible; position:relative;">
                        <!-- Primary Headline Input -->
                        <div>
                            <label for="ad-input-text" style="display:block; font-size:10px; font-weight:700; text-transform:uppercase; color:#475569; margin-bottom:3px; letter-spacing:0.3px;">Primary Headline / Text:</label>
                            <input type="text" id="ad-input-text" value="${currentPrimaryText}" placeholder="e.g. 50% OFF, SALE, DEAL" style="width:100%; padding:5px 8px; font-size:12px; border:1px solid #cbd5e1; border-radius:6px; background:#ffffff; color:#0f172a; box-sizing:border-box; outline:none;">
                        </div>

                        <!-- Subtext Input -->
                        <div>
                            <label for="ad-input-subtext" style="display:block; font-size:10px; font-weight:700; text-transform:uppercase; color:#475569; margin-bottom:3px; letter-spacing:0.3px;">Subtext / Banner Subtitle:</label>
                            <input type="text" id="ad-input-subtext" value="${currentSubtext}" placeholder="e.g. LIMITED TIME, TODAY ONLY" style="width:100%; padding:5px 8px; font-size:12px; border:1px solid #cbd5e1; border-radius:6px; background:#ffffff; color:#0f172a; box-sizing:border-box; outline:none;">
                        </div>

                        <!-- Font Typography Dropdown (allow full popover visibility) -->
                        <div style="position:relative; z-index:10000;">
                            <label for="ad-select-font" style="display:block; font-size:10px; font-weight:700; text-transform:uppercase; color:#475569; margin-bottom:3px; letter-spacing:0.3px;">Typography Font:</label>
                            <select id="ad-select-font" style="width:100%; padding:5px 8px; font-size:12px; border:1px solid #cbd5e1; border-radius:6px; background:#ffffff; color:#0f172a; box-sizing:border-box; outline:none; cursor:pointer;">
                                ${fontOptions.map(f => `<option value="${f.value}" ${f.value === selectedFont ? 'selected' : ''}>${f.label}</option>`).join('')}
                            </select>
                        </div>

                        <!-- Color Palette & Solid Fill Section -->
                        <div style="position:relative; z-index:1;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <label style="font-size:10px; font-weight:700; text-transform:uppercase; color:#475569; letter-spacing:0.3px;">Color Styling:</label>
                                <span id="ad-palette-label" style="font-size:10px; font-weight:600; color:var(--ui-theme-color, #0f766e);">
                                    ${isCustomSolid ? 'Solid: ' + selectedPaletteId.toUpperCase() : (palettes[selectedPaletteId]?.name || 'Publisher Teal')}
                                </span>
                            </div>

                            <!-- Gradient Chips -->
                            <div id="ad-palettes-chips" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:5px;">
                                ${Object.keys(palettes).map(key => {
                                    const p = palettes[key];
                                    const isSel = !isCustomSolid && key === selectedPaletteId;
                                    const grad = p.gradient ? `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` : p.primary;
                                    return `
                                        <div class="ad-palette-chip ${isSel ? 'active' : ''}" data-palette="${p.id}" title="${p.name}" style="height:24px; border-radius:5px; background:${grad}; cursor:pointer; border:2px solid ${isSel ? 'var(--ui-theme-color, #0f766e)' : '#e2e8f0'}; box-shadow:${isSel ? '0 0 0 2px rgba(15,118,110,0.35)' : 'none'}; position:relative; display:flex; align-items:center; justify-content:center; transition:all 0.15s ease;">
                                            ${isSel ? '<i class="fas fa-check" style="color:#ffffff; font-size:10px; filter:drop-shadow(0 1px 1px rgba(0,0,0,0.6));"></i>' : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>

                            <!-- Solid Color Fill Option -->
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px; padding-top:6px; border-top:1px dashed #e2e8f0;">
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <div id="ad-solid-swatch" style="width:26px; height:22px; border-radius:5px; border:2px solid ${isCustomSolid ? 'var(--ui-theme-color, #0f766e)' : '#cbd5e1'}; background:${solidColorHex}; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.1); position:relative; display:flex; align-items:center; justify-content:center;" title="Click to choose a solid color">
                                        ${isCustomSolid ? '<i class="fas fa-check" style="color:#ffffff; font-size:10px; filter:drop-shadow(0 1px 1px rgba(0,0,0,0.6));"></i>' : '<i class="fas fa-palette" style="color:rgba(255,255,255,0.7); font-size:9px;"></i>'}
                                    </div>
                                    <div>
                                        <div style="font-size:10px; font-weight:700; color:#334155; text-transform:uppercase;">Solid Color Fill</div>
                                        <div id="ad-solid-hex-label" style="font-size:9px; color:#64748b; font-family:monospace;">${isCustomSolid ? selectedPaletteId.toUpperCase() : 'Custom Solid'}</div>
                                    </div>
                                </div>
                                <button type="button" id="ad-btn-pick-solid" style="background:#ffffff; border:1px solid #cbd5e1; border-radius:4px; font-size:10px; font-weight:600; color:#475569; padding:3px 8px; cursor:pointer;">
                                    <i class="fas fa-eye-dropper" style="margin-right:3px;"></i>Pick Color
                                </button>
                            </div>

                            <!-- Note regarding color adaptation -->
                            <div style="font-size:9.5px; color:#64748b; line-height:1.3; margin-top:6px; background:#f1f5f9; padding:5px 8px; border-radius:4px; border-left:3px solid var(--ui-theme-color, #0f766e);">
                                <i class="fas fa-info-circle" style="color:var(--ui-theme-color, #0f766e); margin-right:3px;"></i>Color palettes and solid fills adapt dynamically across all vector badges. Specialized badges preserve their authentic metallic or gold accents.
                            </div>
                        </div>

                        <!-- Size Preset (Insert mode only) -->
                        ${!isEditMode ? `
                            <div style="margin-top:2px;">
                                <label for="ad-select-size" style="display:block; font-size:10px; font-weight:700; text-transform:uppercase; color:#475569; margin-bottom:3px; letter-spacing:0.3px;">Badge Canvas Size:</label>
                                <select id="ad-select-size" style="width:100%; padding:4px 6px; font-size:11px; border:1px solid #cbd5e1; border-radius:6px; background:#ffffff; color:#0f172a; box-sizing:border-box; outline:none; cursor:pointer;">
                                    <option value="130">Small (130 px)</option>
                                    <option value="180" selected>Medium (180 px - Recommended)</option>
                                    <option value="240">Large (240 px)</option>
                                    <option value="300">X-Large (300 px Hero)</option>
                                </select>
                            </div>
                        ` : ''}
                    </div>

                    <!-- TAB 2: Text Positioning & Line Spacing -->
                    <div id="ad-tab-pane-position" style="margin-top:8px; display:none; flex-direction:column; gap:9px; overflow:visible; position:relative;">
                        <!-- Helper tip card -->
                        <div style="font-size:10px; color:#0f766e; background:#f0fdfa; border:1px solid #ccfbf1; border-left:3px solid var(--ui-theme-color, #0f766e); padding:6px 8px; border-radius:5px; display:flex; align-items:center; gap:6px;">
                            <i class="fas fa-arrows-alt" style="font-size:12px;"></i>
                            <span>Drag the text directly in the preview stage, or use the sliders below:</span>
                        </div>

                        <!-- ↕ Vertical Position (Padding Y) -->
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                                <label for="ad-slider-offset-y" style="font-size:10px; font-weight:700; text-transform:uppercase; color:#475569; letter-spacing:0.3px;">↕ Vertical Position (Padding):</label>
                                <span id="ad-val-offset-y" style="font-size:10px; font-weight:700; color:var(--ui-theme-color, #0f766e); background:#ffffff; border:1px solid #cbd5e1; padding:1px 6px; border-radius:10px; min-width:32px; text-align:center;">${currentOffsetY > 0 ? '+' : ''}${currentOffsetY} px</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <button type="button" id="ad-btn-nudge-y-minus" title="Nudge Up (-1px)" style="width:24px; height:24px; border:1px solid #cbd5e1; border-radius:4px; background:#ffffff; cursor:pointer; font-size:12px; font-weight:bold; color:#475569; display:flex; align-items:center; justify-content:center;">-</button>
                                <input type="range" id="ad-slider-offset-y" min="-50" max="50" step="1" value="${currentOffsetY}" style="flex:1; cursor:pointer; accent-color:var(--ui-theme-color, #0f766e);">
                                <button type="button" id="ad-btn-nudge-y-plus" title="Nudge Down (+1px)" style="width:24px; height:24px; border:1px solid #cbd5e1; border-radius:4px; background:#ffffff; cursor:pointer; font-size:12px; font-weight:bold; color:#475569; display:flex; align-items:center; justify-content:center;">+</button>
                            </div>
                        </div>

                        <!-- ↔ Horizontal Position (Offset X) -->
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                                <label for="ad-slider-offset-x" style="font-size:10px; font-weight:700; text-transform:uppercase; color:#475569; letter-spacing:0.3px;">↔ Horizontal Position:</label>
                                <span id="ad-val-offset-x" style="font-size:10px; font-weight:700; color:var(--ui-theme-color, #0f766e); background:#ffffff; border:1px solid #cbd5e1; padding:1px 6px; border-radius:10px; min-width:32px; text-align:center;">${currentOffsetX > 0 ? '+' : ''}${currentOffsetX} px</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <button type="button" id="ad-btn-nudge-x-minus" title="Nudge Left (-1px)" style="width:24px; height:24px; border:1px solid #cbd5e1; border-radius:4px; background:#ffffff; cursor:pointer; font-size:12px; font-weight:bold; color:#475569; display:flex; align-items:center; justify-content:center;">-</button>
                                <input type="range" id="ad-slider-offset-x" min="-50" max="50" step="1" value="${currentOffsetX}" style="flex:1; cursor:pointer; accent-color:var(--ui-theme-color, #0f766e);">
                                <button type="button" id="ad-btn-nudge-x-plus" title="Nudge Right (+1px)" style="width:24px; height:24px; border:1px solid #cbd5e1; border-radius:4px; background:#ffffff; cursor:pointer; font-size:12px; font-weight:bold; color:#475569; display:flex; align-items:center; justify-content:center;">+</button>
                            </div>
                        </div>

                        <!-- ⇕ Line Gap / Line Spacing -->
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                                <label for="ad-slider-line-gap" style="font-size:10px; font-weight:700; text-transform:uppercase; color:#475569; letter-spacing:0.3px;">⇕ Line Gap / Spacing:</label>
                                <span id="ad-val-line-gap" style="font-size:10px; font-weight:700; color:var(--ui-theme-color, #0f766e); background:#ffffff; border:1px solid #cbd5e1; padding:1px 6px; border-radius:10px; min-width:32px; text-align:center;">${currentLineGap > 0 ? '+' : ''}${currentLineGap} px</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <button type="button" id="ad-btn-nudge-gap-minus" title="Decrease Gap (-1px)" style="width:24px; height:24px; border:1px solid #cbd5e1; border-radius:4px; background:#ffffff; cursor:pointer; font-size:12px; font-weight:bold; color:#475569; display:flex; align-items:center; justify-content:center;">-</button>
                                <input type="range" id="ad-slider-line-gap" min="-15" max="35" step="1" value="${currentLineGap}" style="flex:1; cursor:pointer; accent-color:var(--ui-theme-color, #0f766e);">
                                <button type="button" id="ad-btn-nudge-gap-plus" title="Increase Gap (+1px)" style="width:24px; height:24px; border:1px solid #cbd5e1; border-radius:4px; background:#ffffff; cursor:pointer; font-size:12px; font-weight:bold; color:#475569; display:flex; align-items:center; justify-content:center;">+</button>
                            </div>
                        </div>
                        <!-- Text Width / Condense Slider -->
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                                <label for="ad-slider-scale-x" style="font-size:10px; font-weight:700; text-transform:uppercase; color:#475569; letter-spacing:0.3px;">↔ Text Width (Fit / Thin):</label>
                                <span id="ad-val-scale-x" style="font-size:10px; font-weight:700; color:var(--ui-theme-color, #0f766e); background:#ffffff; border:1px solid #cbd5e1; padding:1px 6px; border-radius:10px; min-width:32px; text-align:center;">${currentScaleX}%${currentScaleX < 100 ? ' (Thin)' : (currentScaleX > 100 ? ' (Wide)' : '')}</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <button type="button" id="ad-btn-nudge-scale-minus" title="Make Thinner (-5%)" style="width:24px; height:24px; border:1px solid #cbd5e1; border-radius:4px; background:#ffffff; cursor:pointer; font-size:12px; font-weight:bold; color:#475569; display:flex; align-items:center; justify-content:center;">-</button>
                                <input type="range" id="ad-slider-scale-x" min="50" max="150" step="1" value="${currentScaleX}" style="flex:1; cursor:pointer; accent-color:var(--ui-theme-color, #0f766e);">
                                <button type="button" id="ad-btn-nudge-scale-plus" title="Make Wider (+5%)" style="width:24px; height:24px; border:1px solid #cbd5e1; border-radius:4px; background:#ffffff; cursor:pointer; font-size:12px; font-weight:bold; color:#475569; display:flex; align-items:center; justify-content:center;">+</button>
                            </div>
                            <div style="font-size:9px; color:#94a3b8; margin-top:2px;">Compress font width horizontally to fit long headlines into compact badges.</div>
                        </div>

                        <!-- Action Buttons: Reset & Center -->
                        <div style="display:flex; gap:6px; margin-top:6px; padding-top:6px; border-top:1px dashed #e2e8f0;">
                            <button type="button" id="ad-btn-reset-pos" style="flex:1; background:#ffffff; border:1px solid #cbd5e1; border-radius:5px; padding:5px 8px; font-size:11px; font-weight:600; color:#475569; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; transition:all 0.15s ease;">
                                <i class="fas fa-undo"></i> Reset Layout
                            </button>
                            <button type="button" id="ad-btn-center-pos" style="flex:1; background:#ffffff; border:1px solid #cbd5e1; border-radius:5px; padding:5px 8px; font-size:11px; font-weight:600; color:#475569; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; transition:all 0.15s ease;">
                                <i class="fas fa-crosshairs"></i> Center (0,0)
                            </button>
                        </div>
                    </div>

                    <!-- Remove Badge Button in Edit Mode -->
                    ${isEditMode ? `
                        <div style="margin-top:10px; padding-top:6px;">
                            <button type="button" id="ad-btn-remove" class="btn-secondary" style="width:100%; font-size:11px; padding:5px 10px; color:#dc2626; border-color:#fecaca; background:#fff5f5; display:inline-flex; align-items:center; justify-content:center; gap:6px; border-radius:6px; cursor:pointer;">
                                <i class="fas fa-trash-alt"></i> Delete Badge
                            </button>
                        </div>
                    ` : ''}
                </div>

                <!-- RIGHT COLUMN: Search Bar, Category Filter Tabs & Badge Presets Grid -->
                <div style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
                    <!-- Search Input Bar -->
                    <div style="position:relative; margin-bottom:8px;">
                        <i class="fas fa-search" style="position:absolute; left:11px; top:50%; transform:translateY(-50%); color:#94a3b8; font-size:12px; pointer-events:none;"></i>
                        <input type="text" id="ad-search-input" placeholder="Search 50 badges (e.g. sale, offer, ribbon, seal, coupon, discount)..." style="width:100%; padding:7px 10px 7px 32px; font-size:12px; border:1px solid #cbd5e1; border-radius:6px; background:#ffffff; color:#0f172a; box-sizing:border-box; outline:none;">
                    </div>

                    <!-- Category Pills -->
                    <div style="display:flex; gap:5px; margin-bottom:8px; border-bottom:1px solid #e2e8f0; padding-bottom:6px; overflow-x:auto;">
                        ${categories.map(c => `
                            <button type="button" class="ad-cat-tab ${c.id === activeCategory ? 'active' : ''}" data-cat="${c.id}" style="border:none; background:${c.id === activeCategory ? 'var(--ui-theme-color, #0f766e)' : '#f1f5f9'}; color:${c.id === activeCategory ? '#ffffff' : '#475569'}; padding:4px 9px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; white-space:nowrap; transition:all 0.15s ease;">
                                ${c.label}
                            </button>
                        `).join('')}
                    </div>

                    <!-- Cards Gallery Grid -->
                    <div id="ad-cards-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:10px; flex:1; max-height:460px; overflow-y:auto; padding-right:4px;">
                        <!-- Injected via JavaScript -->
                    </div>
                </div>
            </div>
        `;

        const modalTitle = isEditMode
            ? '<i class="fas fa-ad" style="margin-right:8px; color:var(--ui-theme-color, #0f766e);"></i>Edit Advertisement Badge'
            : '<i class="fas fa-ad" style="margin-right:8px; color:var(--ui-theme-color, #0f766e);"></i>Advertisement & Promotional Badge Studio';

        const confirmButtonText = isEditMode ? 'Update Badge' : 'Insert Badge';

        DialogSystem.show(modalTitle, modalHtml, () => {
            // Confirm Action
            const pText = (document.getElementById('ad-input-text')?.value || '').trim();
            const sText = (document.getElementById('ad-input-subtext')?.value || '').trim();
            const font = document.getElementById('ad-select-font')?.value || selectedFont;
            const sizeVal = parseInt(document.getElementById('ad-select-size')?.value) || selectedSize;

            if (isEditMode && targetEl) {
                engine.updateAdvertisement(targetEl, {
                    presetId: selectedPresetId,
                    primaryText: pText,
                    subtext: sText,
                    paletteId: selectedPaletteId,
                    font: font,
                    offsetX: currentOffsetX,
                    offsetY: currentOffsetY,
                    lineGap: currentLineGap,
                    scaleX: currentScaleX
                });
            } else {
                const inserted = engine.insertAdvertisement(
                    selectedPresetId,
                    pText,
                    sText,
                    selectedPaletteId,
                    font,
                    {
                        x: currentOffsetX,
                        y: currentOffsetY,
                        gap: currentLineGap,
                        scaleX: currentScaleX
                    }
                );
                if (inserted && sizeVal) {
                    const preset = engine.getPresetById(selectedPresetId);
                    const aspect = preset.aspect || 1;
                    inserted.style.width = sizeVal + 'px';
                    inserted.style.height = Math.round(sizeVal / aspect) + 'px';
                }
            }
        }, false, confirmButtonText);

        // Adjust modal width & positioning
        const dialogBox = document.getElementById('custom-dialog-box');
        if (dialogBox) {
            dialogBox.style.width = '820px';
            dialogBox.style.maxWidth = '96vw';
            dialogBox.classList.add('allow-overflow');
            dialogBox.style.overflow = 'visible';
            const body = dialogBox.querySelector('.custom-dialog-body');
            if (body) {
                body.style.maxHeight = '84vh';
                body.style.overflow = 'visible';
                body.style.padding = '16px';
            }
        }

        // --- DOM REFERENCES ---
        const previewStage = document.getElementById('ad-preview-stage');
        const previewDims = document.getElementById('ad-preview-dims');
        const badgeName = document.getElementById('ad-badge-name');
        const badgeCat = document.getElementById('ad-badge-cat');
        const inputText = document.getElementById('ad-input-text');
        const inputSubtext = document.getElementById('ad-input-subtext');
        const selectFont = document.getElementById('ad-select-font');
        const selectSize = document.getElementById('ad-select-size');
        const paletteLabel = document.getElementById('ad-palette-label');
        const cardsGrid = document.getElementById('ad-cards-grid');
        const searchInput = document.getElementById('ad-search-input');
        const btnRemove = document.getElementById('ad-btn-remove');
        const solidSwatch = document.getElementById('ad-solid-swatch');
        const solidHexLabel = document.getElementById('ad-solid-hex-label');
        const btnPickSolid = document.getElementById('ad-btn-pick-solid');

        // --- SYNC POSITION CONTROLS ---
        function syncPositionControls() {
            const sliderY = document.getElementById('ad-slider-offset-y');
            const valY = document.getElementById('ad-val-offset-y');
            const sliderX = document.getElementById('ad-slider-offset-x');
            const valX = document.getElementById('ad-val-offset-x');
            const sliderGap = document.getElementById('ad-slider-line-gap');
            const valGap = document.getElementById('ad-val-line-gap');
            const tabBadge = document.getElementById('ad-tab-offset-badge');

            if (sliderY) sliderY.value = currentOffsetY;
            if (valY) valY.textContent = `${currentOffsetY > 0 ? '+' : ''}${currentOffsetY} px`;

            if (sliderX) sliderX.value = currentOffsetX;
            if (valX) valX.textContent = `${currentOffsetX > 0 ? '+' : ''}${currentOffsetX} px`;

            if (sliderGap) sliderGap.value = currentLineGap;
            if (valGap) valGap.textContent = `${currentLineGap > 0 ? '+' : ''}${currentLineGap} px`;

            const sliderScaleX = document.getElementById('ad-slider-scale-x');
            const valScaleX = document.getElementById('ad-val-scale-x');
            if (sliderScaleX) sliderScaleX.value = currentScaleX;
            if (valScaleX) {
                valScaleX.textContent = `${currentScaleX}%${currentScaleX < 100 ? ' (Thin)' : (currentScaleX > 100 ? ' (Wide)' : '')}`;
            }

            if (tabBadge) {
                const hasCustom = (currentOffsetX !== 0 || currentOffsetY !== 0 || currentLineGap !== 0 || currentScaleX !== 100);
                tabBadge.style.display = hasCustom ? 'inline-block' : 'none';
            }
        }

        // --- RENDER LIVE PREVIEW ---
        function updateLivePreview() {
            const p = engine.getPresetById(selectedPresetId);
            if (!p) return;

            const text = (inputText ? inputText.value : currentPrimaryText) || p.defaultText;
            const subtext = (inputSubtext ? inputSubtext.value : currentSubtext);
            const font = selectFont ? selectFont.value : selectedFont;

            const svgHtml = engine.generateAdSVG(p.id, text, subtext, selectedPaletteId, font, {
                x: currentOffsetX,
                y: currentOffsetY,
                gap: currentLineGap,
                scaleX: currentScaleX
            });
            if (previewStage) {
                previewStage.innerHTML = svgHtml;
                const svg = previewStage.querySelector('svg');
                if (svg) {
                    svg.style.maxWidth = '100%';
                    svg.style.maxHeight = '100%';
                    svg.style.objectFit = 'contain';
                    svg.style.filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))';
                }
            }

            if (badgeName) badgeName.textContent = p.name;
            if (badgeCat) badgeCat.textContent = p.category;

            const currentPal = engine.getPaletteById(selectedPaletteId);
            if (paletteLabel && currentPal) {
                paletteLabel.textContent = currentPal.isSolid ? `Solid: ${selectedPaletteId.toUpperCase()}` : currentPal.name;
            }

            if (previewDims) {
                const aspect = p.aspect || 1;
                const curSize = selectSize ? parseInt(selectSize.value) || 180 : 180;
                const h = Math.round(curSize / aspect);
                previewDims.textContent = `${curSize} x ${h} px`;
            }

            syncPositionControls();
        }

        // --- RENDER CARDS GRID ---
        function renderCards() {
            if (!cardsGrid) return;
            cardsGrid.innerHTML = '';

            const q = searchQuery.toLowerCase().trim();
            const filtered = presets.filter(p => {
                const matchCat = (activeCategory === 'all' || p.category === activeCategory);
                if (!matchCat) return false;
                if (!q) return true;
                return p.name.toLowerCase().includes(q) ||
                       p.category.toLowerCase().includes(q) ||
                       p.defaultText.toLowerCase().includes(q) ||
                       (p.defaultSubtext && p.defaultSubtext.toLowerCase().includes(q));
            });

            if (filtered.length === 0) {
                cardsGrid.innerHTML = `
                    <div style="grid-column:1/-1; padding:32px; text-align:center; color:#94a3b8; font-size:13px;">
                        <i class="fas fa-search" style="font-size:24px; margin-bottom:8px; display:block;"></i>
                        No advertisement badges found matching "${escapeXml(q)}".
                    </div>
                `;
                return;
            }

            filtered.forEach(p => {
                const isSelected = p.id === selectedPresetId;
                const card = document.createElement('div');
                card.className = `ad-preset-card ${isSelected ? 'selected' : ''}`;
                card.setAttribute('data-id', p.id);
                card.setAttribute('data-preset', p.id);
                card.style.cssText = `
                    background: #ffffff;
                    border: 2px solid ${isSelected ? 'var(--ui-theme-color, #0f766e)' : '#e2e8f0'};
                    border-radius: 8px;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    box-shadow: ${isSelected ? '0 0 0 2px rgba(15,118,110,0.25)' : '0 1px 3px rgba(0,0,0,0.04)'};
                    position: relative;
                `;

                // Generate clean SVG thumbnail
                const thumbSvg = engine.generateAdSVG(p.id, p.defaultText, p.defaultSubtext, selectedPaletteId, selectedFont);

                card.innerHTML = `
                    <div style="width:100%; height:82px; display:flex; align-items:center; justify-content:center; overflow:hidden; pointer-events:none;">
                        ${thumbSvg}
                    </div>
                    <div style="margin-top:6px; font-size:11px; font-weight:700; color:#1e293b; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;" title="${p.name}">
                        ${p.name}
                    </div>
                    <div style="font-size:9px; color:#64748b; margin-top:2px; text-transform:uppercase; font-weight:600;">
                        ${p.category}
                    </div>
                `;

                const svgEl = card.querySelector('svg');
                if (svgEl) {
                    svgEl.style.width = '75px';
                    svgEl.style.height = '75px';
                    svgEl.style.objectFit = 'contain';
                }

                card.onmouseenter = () => {
                    if (p.id !== selectedPresetId) {
                        card.style.borderColor = '#94a3b8';
                        card.style.transform = 'translateY(-2px)';
                    }
                };
                card.onmouseleave = () => {
                    if (p.id !== selectedPresetId) {
                        card.style.borderColor = '#e2e8f0';
                        card.style.transform = 'translateY(0)';
                    }
                };

                card.onclick = () => {
                    selectedPresetId = p.id;

                    // If user has not typed custom text, adopt preset default text
                    if (!inputText || inputText.value === '' || inputText.value === initialPreset.defaultText) {
                        if (inputText) inputText.value = p.defaultText;
                        currentPrimaryText = p.defaultText;
                    }
                    if (!inputSubtext || inputSubtext.value === '' || inputSubtext.value === (initialPreset.defaultSubtext || '')) {
                        if (inputSubtext) inputSubtext.value = p.defaultSubtext || '';
                        currentSubtext = p.defaultSubtext || '';
                    }

                    updateLivePreview();
                    renderCards();
                };

                cardsGrid.appendChild(card);
            });
        }

        // --- EVENT LISTENERS ---
        // Real-time typing listeners
        if (inputText) {
            inputText.addEventListener('input', () => {
                currentPrimaryText = inputText.value;
                updateLivePreview();
            });
        }

        if (inputSubtext) {
            inputSubtext.addEventListener('input', () => {
                currentSubtext = inputSubtext.value;
                updateLivePreview();
            });
        }

        if (selectFont) {
            selectFont.addEventListener('change', () => {
                selectedFont = selectFont.value;
                updateLivePreview();
                renderCards();
            });
        }

        if (selectSize) {
            selectSize.addEventListener('change', () => {
                selectedSize = parseInt(selectSize.value) || 180;
                updateLivePreview();
            });
        }

        // Palette chip selection
        document.querySelectorAll('.ad-palette-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const palId = chip.getAttribute('data-palette');
                if (!palId) return;
                selectedPaletteId = palId;

                // Deactivate solid swatch
                if (solidSwatch) {
                    solidSwatch.style.borderColor = '#cbd5e1';
                    solidSwatch.innerHTML = '<i class="fas fa-palette" style="color:rgba(255,255,255,0.7); font-size:9px;"></i>';
                }
                if (solidHexLabel) solidHexLabel.textContent = 'Custom Solid';

                document.querySelectorAll('.ad-palette-chip').forEach(c => {
                    c.classList.remove('active');
                    c.style.border = '2px solid #e2e8f0';
                    c.style.boxShadow = 'none';
                    c.innerHTML = '';
                });

                chip.classList.add('active');
                chip.style.border = '2px solid var(--ui-theme-color, #0f766e)';
                chip.style.boxShadow = '0 0 0 2px rgba(15,118,110,0.35)';
                chip.innerHTML = '<i class="fas fa-check" style="color:#ffffff; font-size:10px; filter:drop-shadow(0 1px 1px rgba(0,0,0,0.6));"></i>';

                updateLivePreview();
                renderCards();
            });
        });

        // Solid Color Picker Trigger
        function openSolidPicker(anchor) {
            if (typeof window.CustomColorPicker !== 'undefined') {
                window.CustomColorPicker.open(anchor, solidColorHex, (chosenHex) => {
                    solidColorHex = chosenHex;
                    selectedPaletteId = chosenHex;

                    // Uncheck all gradient chips
                    document.querySelectorAll('.ad-palette-chip').forEach(c => {
                        c.classList.remove('active');
                        c.style.border = '2px solid #e2e8f0';
                        c.style.boxShadow = 'none';
                        c.innerHTML = '';
                    });

                    // Update solid swatch
                    if (solidSwatch) {
                        solidSwatch.style.backgroundColor = chosenHex;
                        solidSwatch.style.borderColor = 'var(--ui-theme-color, #0f766e)';
                        solidSwatch.innerHTML = '<i class="fas fa-check" style="color:#ffffff; font-size:10px; filter:drop-shadow(0 1px 1px rgba(0,0,0,0.6));"></i>';
                    }
                    if (solidHexLabel) {
                        solidHexLabel.textContent = chosenHex.toUpperCase();
                    }
                    if (paletteLabel) {
                        paletteLabel.textContent = `Solid: ${chosenHex.toUpperCase()}`;
                    }

                    updateLivePreview();
                    renderCards();
                });
            }
        }

        if (solidSwatch) {
            solidSwatch.addEventListener('click', (e) => openSolidPicker(solidSwatch));
        }
        if (btnPickSolid) {
            btnPickSolid.addEventListener('click', (e) => openSolidPicker(solidSwatch || btnPickSolid));
        }

        // Category Tab switching
        document.querySelectorAll('.ad-cat-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.ad-cat-tab').forEach(t => {
                    t.classList.remove('active');
                    t.style.background = '#f1f5f9';
                    t.style.color = '#475569';
                });
                tab.classList.add('active');
                tab.style.background = 'var(--ui-theme-color, #0f766e)';
                tab.style.color = '#ffffff';
                activeCategory = tab.getAttribute('data-cat') || 'all';
                renderCards();
            });
        });

        // Search input
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                renderCards();
            });
        }

        // Delete button in Edit mode
        if (btnRemove && targetEl) {
            btnRemove.addEventListener('click', () => {
                if (typeof window.deleteElement === 'function') {
                    window.deleteElement(targetEl);
                } else if (targetEl.parentElement) {
                    targetEl.parentElement.removeChild(targetEl);
                }
                DialogSystem.close();
                if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
                if (typeof window.pushHistory === 'function') window.pushHistory();
            });
        }

        // --- TAB SWITCHING: Content & Style vs. Position & Spacing ---
        const tabBtnStyle = document.getElementById('ad-tab-btn-style');
        const tabBtnPosition = document.getElementById('ad-tab-btn-position');
        const tabPaneStyle = document.getElementById('ad-tab-pane-style');
        const tabPanePosition = document.getElementById('ad-tab-pane-position');

        function switchTab(tab) {
            activeTab = tab;
            if (tab === 'style') {
                if (tabBtnStyle) {
                    tabBtnStyle.classList.add('active');
                    tabBtnStyle.style.background = '#ffffff';
                    tabBtnStyle.style.color = '#0f172a';
                    tabBtnStyle.style.fontWeight = '700';
                    tabBtnStyle.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)';
                }
                if (tabBtnPosition) {
                    tabBtnPosition.classList.remove('active');
                    tabBtnPosition.style.background = 'transparent';
                    tabBtnPosition.style.color = '#64748b';
                    tabBtnPosition.style.fontWeight = '600';
                    tabBtnPosition.style.boxShadow = 'none';
                }
                if (tabPaneStyle) tabPaneStyle.style.display = 'flex';
                if (tabPanePosition) tabPanePosition.style.display = 'none';
            } else {
                if (tabBtnPosition) {
                    tabBtnPosition.classList.add('active');
                    tabBtnPosition.style.background = '#ffffff';
                    tabBtnPosition.style.color = '#0f172a';
                    tabBtnPosition.style.fontWeight = '700';
                    tabBtnPosition.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)';
                }
                if (tabBtnStyle) {
                    tabBtnStyle.classList.remove('active');
                    tabBtnStyle.style.background = 'transparent';
                    tabBtnStyle.style.color = '#64748b';
                    tabBtnStyle.style.fontWeight = '600';
                    tabBtnStyle.style.boxShadow = 'none';
                }
                if (tabPaneStyle) tabPaneStyle.style.display = 'none';
                if (tabPanePosition) tabPanePosition.style.display = 'flex';
                syncPositionControls();
            }
        }

        if (tabBtnStyle) tabBtnStyle.addEventListener('click', () => switchTab('style'));
        if (tabBtnPosition) tabBtnPosition.addEventListener('click', () => switchTab('position'));

        // --- POSITION & LINE SPACING CONTROLS ---
        const sliderY = document.getElementById('ad-slider-offset-y');
        const btnNudgeYMinus = document.getElementById('ad-btn-nudge-y-minus');
        const btnNudgeYPlus = document.getElementById('ad-btn-nudge-y-plus');

        if (sliderY) {
            sliderY.addEventListener('input', () => {
                currentOffsetY = parseInt(sliderY.value) || 0;
                updateLivePreview();
            });
        }
        if (btnNudgeYMinus) {
            btnNudgeYMinus.addEventListener('click', () => {
                currentOffsetY = Math.max(-50, currentOffsetY - 1);
                updateLivePreview();
            });
        }
        if (btnNudgeYPlus) {
            btnNudgeYPlus.addEventListener('click', () => {
                currentOffsetY = Math.min(50, currentOffsetY + 1);
                updateLivePreview();
            });
        }

        const sliderX = document.getElementById('ad-slider-offset-x');
        const btnNudgeXMinus = document.getElementById('ad-btn-nudge-x-minus');
        const btnNudgeXPlus = document.getElementById('ad-btn-nudge-x-plus');

        if (sliderX) {
            sliderX.addEventListener('input', () => {
                currentOffsetX = parseInt(sliderX.value) || 0;
                updateLivePreview();
            });
        }
        if (btnNudgeXMinus) {
            btnNudgeXMinus.addEventListener('click', () => {
                currentOffsetX = Math.max(-50, currentOffsetX - 1);
                updateLivePreview();
            });
        }
        if (btnNudgeXPlus) {
            btnNudgeXPlus.addEventListener('click', () => {
                currentOffsetX = Math.min(50, currentOffsetX + 1);
                updateLivePreview();
            });
        }

        const sliderGap = document.getElementById('ad-slider-line-gap');
        const btnNudgeGapMinus = document.getElementById('ad-btn-nudge-gap-minus');
        const btnNudgeGapPlus = document.getElementById('ad-btn-nudge-gap-plus');

        if (sliderGap) {
            sliderGap.addEventListener('input', () => {
                currentLineGap = parseInt(sliderGap.value) || 0;
                updateLivePreview();
            });
        }
        if (btnNudgeGapMinus) {
            btnNudgeGapMinus.addEventListener('click', () => {
                currentLineGap = Math.max(-15, currentLineGap - 1);
                updateLivePreview();
            });
        }
        if (btnNudgeGapPlus) {
            btnNudgeGapPlus.addEventListener('click', () => {
                currentLineGap = Math.min(35, currentLineGap + 1);
                updateLivePreview();
            });
        }

        const sliderScaleX = document.getElementById('ad-slider-scale-x');
        const btnNudgeScaleMinus = document.getElementById('ad-btn-nudge-scale-minus');
        const btnNudgeScalePlus = document.getElementById('ad-btn-nudge-scale-plus');

        if (sliderScaleX) {
            sliderScaleX.addEventListener('input', () => {
                currentScaleX = parseInt(sliderScaleX.value) || 100;
                updateLivePreview();
            });
        }
        if (btnNudgeScaleMinus) {
            btnNudgeScaleMinus.addEventListener('click', () => {
                currentScaleX = Math.max(50, currentScaleX - 5);
                updateLivePreview();
            });
        }
        if (btnNudgeScalePlus) {
            btnNudgeScalePlus.addEventListener('click', () => {
                currentScaleX = Math.min(150, currentScaleX + 5);
                updateLivePreview();
            });
        }

        const btnResetPos = document.getElementById('ad-btn-reset-pos');
        if (btnResetPos) {
            btnResetPos.addEventListener('click', () => {
                currentOffsetX = 0;
                currentOffsetY = 0;
                currentLineGap = 0;
                currentScaleX = 100;
                updateLivePreview();
            });
        }

        const btnCenterPos = document.getElementById('ad-btn-center-pos');
        if (btnCenterPos) {
            btnCenterPos.addEventListener('click', () => {
                currentOffsetX = 0;
                currentOffsetY = 0;
                updateLivePreview();
            });
        }

        // --- INTERACTIVE DRAGGING ON PREVIEW STAGE ---
        let isDraggingText = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let dragStartOffsetX = 0;
        let dragStartOffsetY = 0;
        const dragPill = document.getElementById('ad-drag-pill');

        if (previewStage) {
            previewStage.addEventListener('pointerenter', () => {
                if (dragPill && !isDraggingText) {
                    dragPill.style.display = 'block';
                    dragPill.textContent = '✥ Drag text to position';
                }
            });

            previewStage.addEventListener('pointerleave', () => {
                if (dragPill && !isDraggingText) {
                    dragPill.style.display = 'none';
                }
            });

            previewStage.addEventListener('pointerdown', (e) => {
                isDraggingText = true;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                dragStartOffsetX = currentOffsetX;
                dragStartOffsetY = currentOffsetY;

                if (dragPill) {
                    dragPill.style.display = 'block';
                    dragPill.textContent = `↕ Y: ${currentOffsetY > 0 ? '+' : ''}${currentOffsetY}px | ↔ X: ${currentOffsetX > 0 ? '+' : ''}${currentOffsetX}px`;
                }
                previewStage.style.cursor = 'grabbing';
                if (typeof previewStage.setPointerCapture === 'function') {
                    try { previewStage.setPointerCapture(e.pointerId); } catch(err) {}
                }
                e.preventDefault();
            });

            previewStage.addEventListener('pointermove', (e) => {
                if (!isDraggingText) return;

                const svg = previewStage.querySelector('svg');
                let scaleFactor = 1.0;
                if (svg) {
                    const rect = svg.getBoundingClientRect();
                    const vbParts = (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(parseFloat);
                    if (vbParts.length >= 4 && rect.width > 0) {
                        scaleFactor = vbParts[2] / rect.width;
                    }
                }

                const deltaX = (e.clientX - dragStartX) * scaleFactor;
                const deltaY = (e.clientY - dragStartY) * scaleFactor;

                currentOffsetX = Math.round(Math.max(-50, Math.min(50, dragStartOffsetX + deltaX)));
                currentOffsetY = Math.round(Math.max(-50, Math.min(50, dragStartOffsetY + deltaY)));

                if (dragPill) {
                    dragPill.textContent = `↕ Y: ${currentOffsetY > 0 ? '+' : ''}${currentOffsetY}px | ↔ X: ${currentOffsetX > 0 ? '+' : ''}${currentOffsetX}px`;
                }

                updateLivePreview();
            });

            const finishDrag = (e) => {
                if (!isDraggingText) return;
                isDraggingText = false;
                previewStage.style.cursor = 'grab';
                if (typeof previewStage.releasePointerCapture === 'function') {
                    try { previewStage.releasePointerCapture(e.pointerId); } catch(err) {}
                }
                if (dragPill) {
                    dragPill.textContent = '✥ Drag text to position';
                    setTimeout(() => {
                        if (!isDraggingText && dragPill) dragPill.style.display = 'none';
                    }, 1200);
                }
            };

            previewStage.addEventListener('pointerup', finishDrag);
            previewStage.addEventListener('pointercancel', finishDrag);
        }

        function escapeXml(str) {
            if (!str) return '';
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        // Initial setup
        renderCards();
        updateLivePreview();
    };

})(window);
