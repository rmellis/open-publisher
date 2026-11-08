/**
 * OpenPublisher Picture Frame & Borders Modal (v5.19.1)
 * Rich interactive frame picker with category filtering, real-time visual preview,
 * custom rail width and matting sliders, 3D shadow controls, and 1-click frame removal.
 */

(function(window) {
    'use strict';

    window.showPictureFrameModal = function() {
        // Find target element
        let targetEl = (typeof state !== 'undefined' && state.selectedEl) ? state.selectedEl : null;
        if (!targetEl) {
            // Check if any picture element is on paper
            const paper = document.getElementById('paper');
            if (paper) {
                targetEl = paper.querySelector('.pub-element[data-type="image"]') || paper.querySelector('.pub-element img')?.closest('.pub-element');
                if (targetEl && typeof selectElement === 'function') {
                    selectElement(targetEl);
                }
            }
        }

        const img = targetEl ? (targetEl.querySelector('.element-content img') || targetEl.querySelector('img')) : null;
        if (!targetEl || !img) {
            if (typeof DialogSystem !== 'undefined') {
                DialogSystem.alert('Notice', 'Please select a picture or image first to add a frame.');
            } else {
                alert('Please select a picture or image first.');
            }
            return;
        }

        const presets = window.PictureFrameEngine ? window.PictureFrameEngine.getPresets() : [];
        const matPresets = window.PictureFrameEngine ? window.PictureFrameEngine.getMatPresets() : [];

        // Read current element config or defaults
        const existingConfig = window.PictureFrameEngine ? window.PictureFrameEngine.getFrameConfig(targetEl) : null;
        let selectedFrameId = existingConfig ? existingConfig.frameId : 'oak_wood';
        let currentFrameWidth = existingConfig ? existingConfig.frameWidth : 24;
        let selectedMatId = existingConfig ? existingConfig.matId : 'none';
        let currentMatWidth = existingConfig ? existingConfig.matWidth : 0;
        let hasShadow = existingConfig ? existingConfig.hasShadow : true;
        let fitMode = existingConfig ? existingConfig.fitMode : 'outside';

        let activeCategory = 'all';

        const imgSrc = img.getAttribute('src') || '';
        const origW = parseFloat(targetEl.getAttribute('data-frame-orig-w')) || targetEl.offsetWidth || 300;
        const origH = parseFloat(targetEl.getAttribute('data-frame-orig-h')) || targetEl.offsetHeight || 200;

        const modalHtml = `
            <div class="picture-frame-modal-container" style="display:flex; gap:20px; width:760px; max-width:92vw; max-height:78vh; box-sizing:border-box; font-family:'Segoe UI', system-ui, sans-serif; color:#1e293b;">
                <!-- LEFT: Interactive Live Preview -->
                <div style="flex: 0 0 320px; display:flex; flex-direction:column; background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0; padding:16px; box-sizing:border-box;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#475569;">Frame Preview</span>
                        <span id="pf-preview-dims" style="font-size:11px; background:#e2e8f0; padding:2px 8px; border-radius:10px; color:#475569; font-weight:600;">${Math.round(origW)} × ${Math.round(origH)} px</span>
                    </div>

                    <!-- Stage / Matboard Viewport -->
                    <div style="flex:1; min-height:220px; max-height:250px; background:#cbd5e1; border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; box-shadow:inset 0 2px 6px rgba(0,0,0,0.12); padding:16px; box-sizing:border-box;">
                        <div id="pf-stage-box" style="position:relative; width:220px; height:160px; display:flex; align-items:center; justify-content:center; transition: all 0.15s ease;">
                            <img id="pf-stage-img" src="${imgSrc}" style="position:absolute; object-fit:cover; display:block; transition: all 0.15s ease;">
                            <div id="pf-stage-svg" style="position:absolute; inset:0; pointer-events:none;"></div>
                        </div>
                    </div>

                    <!-- Selected Frame Info Badge -->
                    <div style="margin-top:14px; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px;">
                        <div id="pf-badge-name" style="font-size:13px; font-weight:700; color:#0f172a; margin-bottom:2px;">Classic Natural Oak</div>
                        <div id="pf-badge-desc" style="font-size:11px; color:#64748b; line-height:1.35;">Warm golden oak woodgrain, mitered 45° joints.</div>
                    </div>

                    <!-- Frame Actions -->
                    <div style="margin-top:auto; padding-top:14px; display:flex; justify-content:space-between; align-items:center;">
                        <button type="button" id="pf-btn-remove" class="btn-secondary" style="font-size:12px; padding:6px 12px; color:#dc2626; border-color:#fecaca; background:#fff5f5; display:${existingConfig ? 'inline-flex' : 'none'}; align-items:center; gap:6px;">
                            <i class="fas fa-trash-alt"></i> Remove Frame
                        </button>
                        <div style="margin-left:auto; font-size:11px; color:#64748b; font-style:italic;">Fits to image outside</div>
                    </div>
                </div>

                <!-- RIGHT: Category Tabs, Presets Gallery & Tuning Sliders -->
                <div style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
                    <!-- Category Tabs -->
                    <div style="display:flex; gap:6px; margin-bottom:12px; border-bottom:1px solid #e2e8f0; padding-bottom:8px; overflow-x:auto;">
                        <button type="button" class="pf-cat-tab active" data-cat="all" style="border:none; background:#e2e8f0; color:#1e293b; padding:5px 11px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer;">All Frames</button>
                        <button type="button" class="pf-cat-tab" data-cat="Wood & Timber" style="border:none; background:transparent; color:#64748b; padding:5px 11px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer;">Wood & Timber</button>
                        <button type="button" class="pf-cat-tab" data-cat="Ornate & Metal" style="border:none; background:transparent; color:#64748b; padding:5px 11px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer;">Ornate & Gold</button>
                        <button type="button" class="pf-cat-tab" data-cat="Modern Gallery" style="border:none; background:transparent; color:#64748b; padding:5px 11px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer;">Gallery</button>
                        <button type="button" class="pf-cat-tab" data-cat="Artistic & Novelty" style="border:none; background:transparent; color:#64748b; padding:5px 11px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer;">Artistic / Plastic</button>
                    </div>

                    <!-- Scrollable Frame Cards Grid -->
                    <div id="pf-cards-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:10px; max-height:210px; overflow-y:auto; padding-right:4px; margin-bottom:14px;">
                        <!-- Cards injected by JS -->
                    </div>

                    <!-- Customization Controls Panel -->
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px; display:flex; flex-direction:column; gap:10px; overflow-y:auto;">
                        <!-- Slider: Frame Rail Width -->
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <label for="pf-slider-width" style="font-size:11px; font-weight:700; color:#334155; text-transform:uppercase;">Frame Width:</label>
                                <span id="pf-val-width" style="font-size:11px; font-weight:700; color:var(--ui-theme-color, #0f766e);">${currentFrameWidth}px</span>
                            </div>
                            <input type="range" id="pf-slider-width" min="8" max="54" step="2" value="${currentFrameWidth}" style="width:100%; accent-color:var(--ui-theme-color, #0f766e); cursor:pointer;">
                        </div>

                        <!-- Matboard (Passe-Partout Margin) Toggle & Controls -->
                        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <label style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700; color:#334155; text-transform:uppercase; cursor:pointer; user-select:none;">
                                    <input type="checkbox" id="pf-check-mat" ${selectedMatId !== 'none' ? 'checked' : ''} style="accent-color:var(--ui-theme-color, #0f766e);">
                                    <span>Inner Matboard (White / Color Margin)</span>
                                </label>
                                <span id="pf-mat-status" style="font-size:10px; color:#64748b; font-weight:600;">${selectedMatId === 'none' ? 'Direct Fit (Flush)' : 'Margin Enabled'}</span>
                            </div>

                            <div id="pf-mat-controls-row" style="display:${selectedMatId === 'none' ? 'none' : 'flex'}; gap:12px; align-items:flex-end; margin-top:8px; padding-top:8px; border-top:1px dashed #e2e8f0;">
                                <div style="flex:1;">
                                    <label for="pf-select-mat" style="display:block; font-size:10px; font-weight:600; color:#475569; margin-bottom:4px;">Mat Style:</label>
                                    <select id="pf-select-mat" style="width:100%; padding:4px 6px; font-size:11px; border-radius:5px; border:1px solid #cbd5e1; background:#ffffff; color:#1e293b;">
                                        ${matPresets.filter(m => m.id !== 'none').map(m => `<option value="${m.id}" ${m.id === (selectedMatId !== 'none' ? selectedMatId : 'studio_white') ? 'selected' : ''}>${m.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div style="flex:1;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                        <label for="pf-slider-mat" style="font-size:10px; font-weight:600; color:#475569;">Mat Width:</label>
                                        <span id="pf-val-mat" style="font-size:10px; font-weight:700; color:var(--ui-theme-color, #0f766e);">${currentMatWidth || 16}px</span>
                                    </div>
                                    <input type="range" id="pf-slider-mat" min="6" max="36" step="2" value="${currentMatWidth || 16}" style="width:100%; accent-color:var(--ui-theme-color, #0f766e); cursor:pointer;">
                                </div>
                            </div>
                        </div>

                        <!-- Shadow and Fit Options -->
                        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:4px; border-top:1px dashed #e2e8f0;">
                            <label style="display:flex; align-items:center; gap:6px; font-size:12px; color:#334155; cursor:pointer; user-select:none;">
                                <input type="checkbox" id="pf-check-shadow" ${hasShadow ? 'checked' : ''} style="accent-color:var(--ui-theme-color, #0f766e);">
                                <span>3D Wall Drop Shadow</span>
                            </label>

                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:11px; color:#64748b; font-weight:600;">Fitting:</span>
                                <label style="display:flex; align-items:center; gap:4px; font-size:11px; color:#334155; cursor:pointer;">
                                    <input type="radio" name="pf-fit" value="outside" ${fitMode === 'outside' ? 'checked' : ''} style="accent-color:var(--ui-theme-color, #0f766e);">
                                    <span>Outside</span>
                                </label>
                                <label style="display:flex; align-items:center; gap:4px; font-size:11px; color:#334155; cursor:pointer;">
                                    <input type="radio" name="pf-fit" value="inside" ${fitMode === 'inside' ? 'checked' : ''} style="accent-color:var(--ui-theme-color, #0f766e);">
                                    <span>Inside</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        DialogSystem.show('<i class="fas fa-border-style" style="margin-right:8px; color:var(--ui-theme-color, #0f766e);"></i>Picture Frame & Borders', modalHtml, () => {
            // Apply selected frame configuration to target element
            if (window.PictureFrameEngine) {
                window.PictureFrameEngine.applyFrame(targetEl, {
                    frameId: selectedFrameId,
                    frameWidth: currentFrameWidth,
                    matId: selectedMatId,
                    matWidth: currentMatWidth,
                    hasShadow: hasShadow,
                    fitMode: fitMode
                });
            }
        });

        // Elements
        const stageBox = document.getElementById('pf-stage-box');
        const stageImg = document.getElementById('pf-stage-img');
        const stageSvg = document.getElementById('pf-stage-svg');
        const cardsGrid = document.getElementById('pf-cards-grid');
        const badgeName = document.getElementById('pf-badge-name');
        const badgeDesc = document.getElementById('pf-badge-desc');
        const sliderWidth = document.getElementById('pf-slider-width');
        const valWidth = document.getElementById('pf-val-width');
        const checkMat = document.getElementById('pf-check-mat');
        const matControlsRow = document.getElementById('pf-mat-controls-row');
        const matStatus = document.getElementById('pf-mat-status');
        const selectMat = document.getElementById('pf-select-mat');
        const sliderMat = document.getElementById('pf-slider-mat');
        const valMat = document.getElementById('pf-val-mat');
        const checkShadow = document.getElementById('pf-check-shadow');
        const btnRemove = document.getElementById('pf-btn-remove');
        const previewDims = document.getElementById('pf-preview-dims');

        // Helper to update the live preview stage
        function updateLivePreview() {
            const preset = window.PictureFrameEngine ? window.PictureFrameEngine.getPresetById(selectedFrameId) : null;
            if (preset) {
                badgeName.innerText = preset.name;
                badgeDesc.innerText = preset.description;
            }

            // Calculate stage dimensions matching the exact aspect ratio of the framed picture
            const maxStageW = 230;
            const maxStageH = 165;
            const effectiveW = (fitMode === 'outside') ? (origW + 2 * (currentFrameWidth + (selectedMatId !== 'none' ? currentMatWidth : 0))) : origW;
            const effectiveH = (fitMode === 'outside') ? (origH + 2 * (currentFrameWidth + (selectedMatId !== 'none' ? currentMatWidth : 0))) : origH;
            const targetAspect = (effectiveW > 0 && effectiveH > 0) ? (effectiveW / effectiveH) : (4 / 3);

            let stageW, stageH;
            if (targetAspect >= (maxStageW / maxStageH)) {
                stageW = maxStageW;
                stageH = Math.max(80, Math.round(maxStageW / targetAspect));
            } else {
                stageH = maxStageH;
                stageW = Math.max(80, Math.round(maxStageH * targetAspect));
            }

            // Sync container size exactly to eliminate any aspect or coordinate stretching
            stageBox.style.width = stageW + 'px';
            stageBox.style.height = stageH + 'px';

            // In preview stage, scale down frame and mat proportionally to match stage size
            const scaleFactor = stageW / effectiveW;
            const previewFrameW = Math.max(4, Math.round(currentFrameWidth * scaleFactor));
            const previewMatW = (selectedMatId !== 'none') ? Math.max(3, Math.round(currentMatWidth * scaleFactor)) : 0;
            const totalInset = previewFrameW + previewMatW;

            const svgHtml = window.PictureFrameEngine ? window.PictureFrameEngine.generateFrameSVG(
                selectedFrameId,
                stageW,
                stageH,
                previewFrameW,
                selectedMatId,
                previewMatW,
                hasShadow
            ) : '';

            stageSvg.innerHTML = svgHtml;

            // Size and position the preview photo inside the aperture with zero gap
            const photoW = stageW - 2 * totalInset;
            const photoH = stageH - 2 * totalInset;

            stageImg.style.left = totalInset + 'px';
            stageImg.style.top = totalInset + 'px';
            stageImg.style.width = photoW + 'px';
            stageImg.style.height = (photoH + 0.5) + 'px'; // +0.5px subpixel overlap eliminates any hairline gap
            stageImg.style.objectFit = 'cover';
            stageImg.style.backgroundColor = 'transparent';

            valWidth.innerText = currentFrameWidth + 'px';
            if (valMat) valMat.innerText = (currentMatWidth || 16) + 'px';

            const computedTotalW = (fitMode === 'outside') ? Math.round(origW + 2 * (currentFrameWidth + (selectedMatId !== 'none' ? currentMatWidth : 0))) : Math.round(origW);
            const computedTotalH = (fitMode === 'outside') ? Math.round(origH + 2 * (currentFrameWidth + (selectedMatId !== 'none' ? currentMatWidth : 0))) : Math.round(origH);
            if (previewDims) {
                previewDims.innerText = `${computedTotalW} × ${computedTotalH} px`;
            }
        }

        // Render Cards Grid
        function renderCards() {
            if (!cardsGrid) return;
            cardsGrid.innerHTML = '';

            const filtered = presets.filter(p => (activeCategory === 'all' || p.category === activeCategory));
            filtered.forEach(preset => {
                const card = document.createElement('div');
                card.className = `pf-card ${preset.id === selectedFrameId ? 'selected' : ''}`;
                card.style.cssText = `
                    background: ${preset.id === selectedFrameId ? '#f0fdfa' : '#ffffff'};
                    border: 2px solid ${preset.id === selectedFrameId ? 'var(--ui-theme-color, #0f766e)' : '#e2e8f0'};
                    border-radius: 8px;
                    padding: 8px 6px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    text-align: center;
                    user-select: none;
                `;

                // Mini preview SVG for card (direct fit so inner image area is clearly visible)
                const miniSvg = window.PictureFrameEngine ? window.PictureFrameEngine.generateFrameSVG(preset.id, 84, 58, 10, 'none', 0, false) : '';

                card.innerHTML = `
                    <div style="position:relative; width:84px; height:58px; background:#e2e8f0; border-radius:4px; overflow:hidden; margin-bottom:6px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                        <div style="position:absolute; inset:10px; background:linear-gradient(135deg, #a7f3d0, #6ee7b7); border-radius:2px;"></div>
                        <div style="position:absolute; inset:0; pointer-events:none;">${miniSvg}</div>
                    </div>
                    <div style="font-size:11px; font-weight:700; color:#1e293b; line-height:1.2; max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${preset.name}</div>
                    <div style="font-size:9px; color:#64748b; margin-top:2px;">${preset.category}</div>
                `;

                card.addEventListener('mouseenter', () => {
                    if (preset.id !== selectedFrameId) card.style.borderColor = '#94a3b8';
                });
                card.addEventListener('mouseleave', () => {
                    if (preset.id !== selectedFrameId) card.style.borderColor = '#e2e8f0';
                });

                card.addEventListener('click', () => {
                    selectedFrameId = preset.id;
                    if (preset.defaultWidth && !existingConfig) {
                        currentFrameWidth = preset.defaultWidth;
                        sliderWidth.value = currentFrameWidth;
                    }
                    renderCards();
                    updateLivePreview();
                });

                cardsGrid.appendChild(card);
            });
        }

        // Category Tab switching
        document.querySelectorAll('.pf-cat-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.pf-cat-tab').forEach(t => {
                    t.classList.remove('active');
                    t.style.background = 'transparent';
                    t.style.color = '#64748b';
                });
                tab.classList.add('active');
                tab.style.background = '#e2e8f0';
                tab.style.color = '#1e293b';
                activeCategory = tab.getAttribute('data-cat') || 'all';
                renderCards();
            });
        });

        // Sliders & Select event listeners
        if (sliderWidth) {
            sliderWidth.addEventListener('input', (e) => {
                currentFrameWidth = parseInt(e.target.value) || 24;
                updateLivePreview();
            });
        }

        if (checkMat) {
            checkMat.addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedMatId = (selectMat && selectMat.value) ? selectMat.value : 'studio_white';
                    currentMatWidth = (sliderMat && parseInt(sliderMat.value)) ? parseInt(sliderMat.value) : 16;
                    if (matControlsRow) matControlsRow.style.display = 'flex';
                    if (matStatus) {
                        matStatus.innerText = 'Margin Enabled';
                        matStatus.style.color = 'var(--ui-theme-color, #0f766e)';
                    }
                } else {
                    selectedMatId = 'none';
                    currentMatWidth = 0;
                    if (matControlsRow) matControlsRow.style.display = 'none';
                    if (matStatus) {
                        matStatus.innerText = 'Direct Fit (Flush)';
                        matStatus.style.color = '#64748b';
                    }
                }
                updateLivePreview();
            });
        }

        if (selectMat) {
            selectMat.addEventListener('change', (e) => {
                if (checkMat && checkMat.checked) {
                    selectedMatId = e.target.value;
                    updateLivePreview();
                }
            });
        }

        if (sliderMat) {
            sliderMat.addEventListener('input', (e) => {
                currentMatWidth = parseInt(e.target.value) || 16;
                if (valMat) valMat.innerText = currentMatWidth + 'px';
                if (checkMat && checkMat.checked) {
                    updateLivePreview();
                }
            });
        }

        if (checkShadow) {
            checkShadow.addEventListener('change', (e) => {
                hasShadow = !!e.target.checked;
                updateLivePreview();
            });
        }

        document.querySelectorAll('input[name="pf-fit"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                fitMode = e.target.value;
                updateLivePreview();
            });
        });

        // Remove Frame action
        if (btnRemove) {
            btnRemove.addEventListener('click', () => {
                if (window.PictureFrameEngine) {
                    window.PictureFrameEngine.removeFrame(targetEl);
                }
                DialogSystem.close();
            });
        }

        renderCards();
        updateLivePreview();
    };

})(window);
