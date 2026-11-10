// OpenPublisher Legacy Fixes & Compatibility (v5.11.9)
(function lockGlobalWorkspaceAnimation() {
    const viewport = document.getElementById('viewport');
    if (!viewport) return;

    window.syncWorkspaceLayout = function() {
        if (!viewport) return;
        if (window._isTransitioningSelection) return;

        const activeSidebar = document.querySelector('#op-image-sidebar.visible, #op-wordart-sidebar.visible, .sidebar-panel.visible');
        const sidebarWidth = 290;
        const screenWidth = window.innerWidth;
        const minContentWidth = 950; 

        if (activeSidebar && screenWidth < sidebarWidth + minContentWidth) {
            const targetWidth = `calc(100% - ${sidebarWidth}px)`;
            const targetMargin = sidebarWidth + 'px';
            if (viewport.style.width !== targetWidth || viewport.style.marginRight !== targetMargin) {
                viewport.style.setProperty('margin-right', targetMargin, 'important');
                viewport.style.setProperty('width', targetWidth, 'important');
            }
        } else {
            if (viewport.style.width !== '100%' || viewport.style.marginRight !== '0px') {
                viewport.style.setProperty('margin-right', '0px', 'important');
                viewport.style.setProperty('width', '100%', 'important');
            }
        }
    };

    const observer = new MutationObserver((mutations) => {
        let shouldSync = false;
        
        for (let m of mutations) {
            if (m.target.id === 'op-image-sidebar' || m.target.id === 'op-wordart-sidebar' || m.target.classList.contains('sidebar-panel')) {
                shouldSync = true;
                break;
            }
        }

        if (shouldSync) {
            if (window._isTransitioningSelection) return;
            window.syncWorkspaceLayout();
        }
    });

    observer.observe(document.body, { 
        attributes: true, 
        attributeFilter: ['class'],
        subtree: true 
    });

    window.addEventListener('resize', () => {
        if (typeof window.syncWorkspaceLayout === 'function') window.syncWorkspaceLayout();
    });
})();

window.updateSliderFill = function(slider) {
    if (!slider) return;
    const min = slider.min !== '' ? parseFloat(slider.min) : 0;
    const max = slider.max !== '' ? parseFloat(slider.max) : 100;
    const val = slider.value !== '' ? parseFloat(slider.value) : min;
    const range = max - min;
    const pct = range === 0 ? 0 : Math.min(100, Math.max(0, ((val - min) / range) * 100));
    slider.style.setProperty('--slider-progress', pct.toFixed(2) + '%');
};

if (!window._sliderFillListenerInstalled) {
    window._sliderFillListenerInstalled = true;
    document.addEventListener('input', function(e) {
        if (e.target && (e.target.classList.contains('op-sidebar-slider') || e.target.classList.contains('wa-sidebar-input'))) {
            window.updateSliderFill(e.target);
        }
    }, true);
}

(function installSidebarImageFilters() {
    // --- NEW SAFEGUARD: Destroy existing instances to prevent clones ---
    document.getElementById('op-image-sidebar')?.remove();
    document.getElementById('op-sidebar-expander')?.remove();
    // -------------------------------------------------------------------

    let userCollapsed = false; 

    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    const expander = document.createElement('div');
    expander.id = 'op-sidebar-expander';
    expander.innerHTML = '<i class="fas fa-chevron-left"></i>';
    document.body.appendChild(expander);

    const panel = document.createElement('div');
    panel.id = 'op-image-sidebar';
    panel.innerHTML = `<div class="op-sidebar-header">
            <span class="op-sidebar-title">Format Picture</span>
            <div class="op-sidebar-top-btns">
                <button class="op-header-btn" id="filter-reset-btn" style="margin-right:8px" title="Reset All"><i class="fas fa-undo"></i></button>
                <button class="custom-dialog-close" id="filter-close-btn"><i class="fas fa-times"></i></button>
            </div>
        </div>

        <!-- Sidebar Section Navigation Tabs -->
        <div class="op-sidebar-tab-bar" id="op-format-pic-tabs">
            <button type="button" class="op-sidebar-tab-btn active" id="op-tab-pic-btn"><i class="fas fa-image"></i> Picture</button>
            <button type="button" class="op-sidebar-tab-btn" id="op-tab-frame-btn"><i class="fas fa-border-style"></i> Frame <span id="op-frame-tab-indicator" class="op-sidebar-frame-badge" style="display:none;"></span></button>
        </div>

        <!-- Tab 1: Picture Filters & Adjustments -->
        <div id="op-sidebar-pic-tab-pane">
            <div class="op-sidebar-section">
                <span class="op-section-label">Visibility</span>
                <div class="op-slider-row">
                    <div class="op-slider-meta"><span class="op-slider-name">Transparency</span><span class="op-slider-num" id="val-transparency">0%</span></div>
                    <input type="range" class="op-sidebar-slider" data-filter="transparency" min="0" max="100" value="0">
                </div>
            </div>

            <div class="op-sidebar-section">
                <span class="op-section-label">Light & Tone</span>
                <div class="op-slider-row">
                    <div class="op-slider-meta"><span class="op-slider-name">Brightness</span><span class="op-slider-num" id="val-brightness">100%</span></div>
                    <input type="range" class="op-sidebar-slider" data-filter="brightness" min="0" max="200" value="100">
                </div>
                <div class="op-slider-row">
                    <div class="op-slider-meta"><span class="op-slider-name">Contrast</span><span class="op-slider-num" id="val-contrast">100%</span></div>
                    <input type="range" class="op-sidebar-slider" data-filter="contrast" min="0" max="200" value="100">
                </div>
            </div>

            <div class="op-sidebar-section">
                <span class="op-section-label">Color Settings</span>
                <div class="op-slider-row">
                    <div class="op-slider-meta"><span class="op-slider-name">Saturation</span><span class="op-slider-num" id="val-saturate">100%</span></div>
                    <input type="range" class="op-sidebar-slider" data-filter="saturate" min="0" max="200" value="100">
                </div>
                <div class="op-slider-row">
                    <div class="op-slider-meta"><span class="op-slider-name">Hue</span><span class="op-slider-num" id="val-hue-rotate">0°</span></div>
                    <input type="range" class="op-sidebar-slider" data-filter="hue-rotate" min="-180" max="180" value="0">
                </div>
                <div class="op-slider-row">
                    <div class="op-slider-meta"><span class="op-slider-name">Grayscale</span><span class="op-slider-num" id="val-grayscale">0%</span></div>
                    <input type="range" class="op-sidebar-slider" data-filter="grayscale" min="0" max="100" value="0">
                </div>
            </div>

            <div class="op-sidebar-section">
                <span class="op-section-label">Effects</span>
                <div class="op-slider-row">
                    <div class="op-slider-meta"><span class="op-slider-name">Blur</span><span class="op-slider-num" id="val-blur">0px</span></div>
                    <input type="range" class="op-sidebar-slider" data-filter="blur" min="0" max="10" value="0" step="0.5">
                </div>
                <div class="op-slider-row">
                    <div class="op-slider-meta"><span class="op-slider-name">Sepia</span><span class="op-slider-num" id="val-sepia">0%</span></div>
                    <input type="range" class="op-sidebar-slider" data-filter="sepia" min="0" max="100" value="0">
                </div>
                <div class="op-slider-row">
                    <div class="op-slider-meta"><span class="op-slider-name">Invert</span><span class="op-slider-num" id="val-invert">0%</span></div>
                    <input type="range" class="op-sidebar-slider" data-filter="invert" min="0" max="100" value="0">
                </div>
            </div>
            
            <div class="op-sidebar-section">
                <span class="op-section-label">Corners</span>
                <div class="op-slider-row">
                    <div class="op-slider-meta"><span class="op-slider-name">Rounded Corners</span><span class="op-slider-num" id="val-rounded-corners">0px</span></div>
                    <input type="range" class="op-sidebar-slider" data-filter="rounded-corners" min="0" max="100" value="0">
                </div>
            </div>
        </div>

        <!-- Tab 2: Picture Frame Settings (Separate Section) -->
        <div id="op-sidebar-frame-tab-pane" style="display:none;">
            <!-- Active Frame Controls -->
            <div id="op-frame-active-controls">
                <!-- Frame Style -->
                <div class="op-sidebar-section">
                    <span class="op-section-label">Frame Style</span>
                    <div class="op-custom-dropdown-container">
                        <div class="op-custom-select-trigger" id="op-frame-style-trigger" tabindex="0">
                            <span id="op-frame-style-label">Classic Natural Oak</span>
                            <div class="drop-arrow"><i class="fas fa-chevron-down"></i></div>
                        </div>
                        <div class="custom-dropdown op-frame-custom-dropdown" id="op-frame-style-dropdown" style="display:none; position:absolute; top:calc(100% + 4px); left:0; z-index:999999;">
                            <div class="op-dropdown-group-header">Wood & Timber</div>
                            <div class="op-frame-item font-item" data-value="oak_wood">Classic Natural Oak</div>
                            <div class="op-frame-item font-item" data-value="dark_walnut">Dark Walnut & Mahogany</div>
                            <div class="op-frame-item font-item" data-value="blonde_maple">Blonde Natural Maple</div>
                            <div class="op-frame-item font-item" data-value="shabby_chic">Distressed Barnwood</div>
                            <div class="op-frame-item font-item" data-value="cherry_wood">American Cherrywood</div>

                            <div class="op-dropdown-group-header">Ornate & Metal</div>
                            <div class="op-frame-item font-item" data-value="baroque_gold">Ornate Baroque Gold</div>
                            <div class="op-frame-item font-item" data-value="antique_silver">Burnished Antique Silver</div>
                            <div class="op-frame-item font-item" data-value="brushed_aluminum">Brushed Champagne Metal</div>
                            <div class="op-frame-item font-item" data-value="art_deco">Art Deco Brass & Enamel</div>

                            <div class="op-dropdown-group-header">Modern Gallery</div>
                            <div class="op-frame-item font-item" data-value="gallery_black">Museum Gallery Box (Black)</div>
                            <div class="op-frame-item font-item" data-value="studio_white">Studio Gallery Float (White)</div>
                            <div class="op-frame-item font-item" data-value="espresso_box">Espresso Gallery Shadowbox</div>

                            <div class="op-dropdown-group-header">Artistic & Novelty</div>
                            <div class="op-frame-item font-item" data-value="retro_plastic_teal">Retro Molded Plastic (Publisher Teal)</div>
                            <div class="op-frame-item font-item" data-value="retro_plastic_red">Retro Molded Plastic (Cherry Red)</div>
                            <div class="op-frame-item font-item" data-value="retro_plastic_yellow">Retro Molded Plastic (Sunshine Yellow)</div>
                            <div class="op-frame-item font-item" data-value="retro_plastic_blue">Retro Molded Plastic (Electric Blue)</div>
                            <div class="op-frame-item font-item" data-value="retro_plastic_green">Retro Molded Plastic (Emerald Green)</div>
                            <div class="op-frame-item font-item" data-value="retro_plastic_purple">Retro Molded Plastic (Royal Purple)</div>
                            <div class="op-frame-item font-item" data-value="retro_plastic_orange">Retro Molded Plastic (Tangerine Orange)</div>
                            <div class="op-frame-item font-item" data-value="retro_plastic_white">Retro Molded Plastic (Glossy White)</div>
                            <div class="op-frame-item font-item" data-value="retro_plastic_black">Retro Molded Plastic (Glossy Jet Black)</div>
                            <div class="op-frame-item font-item" data-value="scalloped_stamp">Vintage Postage Stamp</div>
                        </div>
                        <select class="op-sidebar-select" id="op-frame-style-select" style="display:none;">
                            <optgroup label="Wood & Timber">
                                <option value="oak_wood">Classic Natural Oak</option>
                                <option value="dark_walnut">Dark Walnut & Mahogany</option>
                                <option value="blonde_maple">Blonde Natural Maple</option>
                                <option value="shabby_chic">Distressed Barnwood</option>
                                <option value="cherry_wood">American Cherrywood</option>
                            </optgroup>
                            <optgroup label="Ornate & Metal">
                                <option value="baroque_gold">Ornate Baroque Gold</option>
                                <option value="antique_silver">Burnished Antique Silver</option>
                                <option value="brushed_aluminum">Brushed Champagne Metal</option>
                                <option value="art_deco">Art Deco Brass & Enamel</option>
                            </optgroup>
                            <optgroup label="Modern Gallery">
                                <option value="gallery_black">Museum Gallery Box (Black)</option>
                                <option value="studio_white">Studio Gallery Float (White)</option>
                                <option value="espresso_box">Espresso Gallery Shadowbox</option>
                            </optgroup>
                            <optgroup label="Artistic & Novelty">
                                <option value="retro_plastic_teal">Retro Molded Plastic (Publisher Teal)</option>
                                <option value="retro_plastic_red">Retro Molded Plastic (Cherry Red)</option>
                                <option value="retro_plastic_yellow">Retro Molded Plastic (Sunshine Yellow)</option>
                                <option value="retro_plastic_blue">Retro Molded Plastic (Electric Blue)</option>
                                <option value="retro_plastic_green">Retro Molded Plastic (Emerald Green)</option>
                                <option value="retro_plastic_purple">Retro Molded Plastic (Royal Purple)</option>
                                <option value="retro_plastic_orange">Retro Molded Plastic (Tangerine Orange)</option>
                                <option value="retro_plastic_white">Retro Molded Plastic (Glossy White)</option>
                                <option value="retro_plastic_black">Retro Molded Plastic (Glossy Jet Black)</option>
                                <option value="scalloped_stamp">Vintage Postage Stamp</option>
                            </optgroup>
                        </select>
                    </div>
                    <button type="button" id="op-frame-browse-gallery-btn" style="width:100%; margin-top:8px; padding:6px 10px; font-size:11px; font-weight:600; color:var(--ui-theme-color, #0f766e); background:rgba(15,118,110,0.08); border:1px dashed var(--ui-theme-color, #0f766e); border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
                        <i class="fas fa-th-large"></i> Browse Full Frame Gallery...
                    </button>
                </div>

                <!-- Frame Dimensions -->
                <div class="op-sidebar-section">
                    <span class="op-section-label">Frame Dimensions</span>
                    <div class="op-slider-row">
                        <div class="op-slider-meta">
                            <span class="op-slider-name">Frame Width</span>
                            <span class="op-slider-num" id="val-frame-width">24px</span>
                        </div>
                        <input type="range" class="op-sidebar-slider" id="op-frame-width-slider" min="8" max="54" step="2" value="24">
                    </div>
                </div>

                <!-- Matboard (Passe-Partout) -->
                <div class="op-sidebar-section">
                    <span class="op-section-label">Matboard (Passe-Partout)</span>
                    <label style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:600; color:#334155; cursor:pointer; margin-bottom:10px;">
                        <input type="checkbox" id="op-frame-mat-toggle" style="accent-color:var(--ui-theme-color, #0f766e);">
                        <span>Inner Matboard (Margin)</span>
                    </label>
                    <div id="op-frame-mat-details" style="display:none; flex-direction:column; gap:10px;">
                        <select class="op-sidebar-select" id="op-frame-mat-select">
                            <option value="studio_white">Studio White (Beveled)</option>
                            <option value="warm_cream">Warm Cream Linen</option>
                            <option value="charcoal">Museum Charcoal</option>
                            <option value="white_gold">White Mat with Gold Fillet</option>
                        </select>
                        <div class="op-slider-row">
                            <div class="op-slider-meta">
                                <span class="op-slider-name">Mat Width</span>
                                <span class="op-slider-num" id="val-frame-mat-width">16px</span>
                            </div>
                            <input type="range" class="op-sidebar-slider" id="op-frame-mat-slider" min="6" max="36" step="2" value="16">
                        </div>
                    </div>
                </div>

                <!-- Lighting & Fitting -->
                <div class="op-sidebar-section">
                    <span class="op-section-label">Lighting & Fitting</span>
                    <label style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:600; color:#334155; cursor:pointer; margin-bottom:12px;">
                        <input type="checkbox" id="op-frame-shadow-toggle" style="accent-color:var(--ui-theme-color, #0f766e);">
                        <span>3D Wall Drop Shadow</span>
                    </label>
                    <div style="display:flex; align-items:center; gap:12px; font-size:11px; color:#475569;">
                        <span style="font-weight:700;">Fitting:</span>
                        <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                            <input type="radio" name="op-sidebar-fit" value="outside" style="accent-color:var(--ui-theme-color, #0f766e);"> Outside
                        </label>
                        <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
                            <input type="radio" name="op-sidebar-fit" value="inside" style="accent-color:var(--ui-theme-color, #0f766e);"> Inside
                        </label>
                    </div>
                </div>

                <!-- Remove Frame Action -->
                <div class="op-sidebar-section" style="padding:12px;">
                    <button type="button" id="op-frame-remove-btn" style="width:100%; padding:8px 12px; background:#fff1f2; color:#e11d48; border:1px solid #fecdd3; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.15s ease;">
                        <i class="fas fa-trash-alt"></i> Remove Frame
                    </button>
                </div>
            </div>

            <!-- Empty State (when image has NO frame) -->
            <div id="op-frame-empty-controls" style="display:none; text-align:center; padding:10px 0;">
                <div class="op-sidebar-section" style="padding:22px 14px;">
                    <i class="fas fa-border-style" style="font-size:32px; color:var(--ui-theme-color, #0f766e); opacity:0.6; margin-bottom:12px; display:block;"></i>
                    <div style="font-size:13px; font-weight:700; color:#1e293b; margin-bottom:6px;">No Frame Attached</div>
                    <div style="font-size:11px; color:#64748b; line-height:1.4; margin-bottom:16px;">Add a realistic wood, metallic, gallery, or plastic artistic frame to this image.</div>
                    <button type="button" id="op-frame-add-dialog-btn" style="width:100%; padding:9px 14px; background:var(--ui-theme-color, #0f766e); color:#ffffff; border:none; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 2px 6px rgba(15,118,110,0.25);">
                        <i class="fas fa-plus"></i> Choose Picture Frame...
                    </button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(panel);

    const vp = document.getElementById('viewport') || document.getElementById('workspace');

    const refreshVisibility = (el) => {
        const contentImg = window.getElementContentImage ? window.getElementContentImage(el) : Array.from((el && el.querySelectorAll) ? el.querySelectorAll('img') : []).find(img => !img.closest('.element-border-art, .border-art-wrapper, #native-border-art-border'));
        if (el && (contentImg || el.getAttribute('data-type') === 'emoji')) {
            const isBetaWordArt = el.querySelector('.beta-wa-img') !== null;
            const titleEl = panel.querySelector('.op-sidebar-title');
            if (titleEl) titleEl.innerText = isBetaWordArt ? 'Format WordArt' : 'Format Picture';
            if (userCollapsed) {
                if (panel.classList.contains('visible')) panel.classList.remove('visible');
                if (!expander.classList.contains('visible')) expander.classList.add('visible');
            } else {
                if (!panel.classList.contains('visible')) panel.classList.add('visible');
                if (expander.classList.contains('visible')) expander.classList.remove('visible');
            }
            if (typeof window.syncWorkspaceLayout === 'function') window.syncWorkspaceLayout();
            panel.querySelectorAll('.op-sidebar-slider').forEach(s => {
                const f = s.dataset.filter;
                let v = el.getAttribute(`data-filter-${f}`);
                if (v === null || v === undefined) {
                    if (f === 'transparency') {
                        const img = contentImg;
                        if (img && img.style.opacity !== '' && img.style.opacity !== undefined) {
                            v = Math.round((1 - parseFloat(img.style.opacity)) * 100);
                        } else {
                            v = 0;
                        }
                    } else if (f === 'rounded-corners') {
                        const rawR = el.getAttribute('data-rounded-corners') || (contentImg ? (contentImg.getAttribute('data-rounded-corners') || contentImg.style.borderRadius) : null) || el.style.borderRadius;
                        v = rawR ? (parseInt(rawR) || 0) : 0;
                    } else {
                        v = (['brightness','contrast','saturate'].includes(f)?100:0);
                    }
                }
                s.value = v; 
                const txt = panel.querySelector(`#val-${f}`);
                if(txt) txt.innerText = v + (f==='hue-rotate'?'°':(f==='blur'||f==='rounded-corners')?'px':'%');
                if (typeof window.updateSliderFill === 'function') window.updateSliderFill(s);
            });
            syncFrameInputs(el);
        } else {
            if (panel.classList.contains('visible')) panel.classList.remove('visible');
            if (expander.classList.contains('visible')) expander.classList.remove('visible');
            if (typeof window.syncWorkspaceLayout === 'function') window.syncWorkspaceLayout();
        }
    };

    const apply = (el) => {
        const contentImg = window.getElementContentImage ? window.getElementContentImage(el) : Array.from((el && el.querySelectorAll) ? el.querySelectorAll('img') : []).find(img => !img.closest('.element-border-art, .border-art-wrapper, #native-border-art-border'));
        const img = contentImg || (el.getAttribute('data-type') === 'emoji' ? el.querySelector('svg') : null); if(!img) return;
        const get = (f, d) => el.getAttribute(`data-filter-${f}`) || d;
        img.style.filter = `brightness(${get('brightness',100)}%) contrast(${get('contrast',100)}%) saturate(${get('saturate',100)}%) hue-rotate(${get('hue-rotate',0)}deg) blur(${get('blur',0)}px) sepia(${get('sepia',0)}%) grayscale(${get('grayscale',0)}%) invert(${get('invert',0)}%)`;
        img.style.opacity = 1 - (get('transparency',0) / 100);

        const curIdx = (typeof state !== 'undefined' && state.currentPageIndex !== undefined) ? state.currentPageIndex : 0;
        const activeThumb = document.getElementById('thumb-' + curIdx);
        if (activeThumb && el.id) {
            const tEl = activeThumb.querySelector(`[data-target-id="${el.id}"]`);
            if (tEl) {
                const tImg = tEl.querySelector('img');
                if (tImg) {
                    tImg.style.filter = img.style.filter;
                    tImg.style.opacity = img.style.opacity;
                }
            }
        }
    };

    const applyRoundedCorners = (el, v) => {
        if (!el) return;
        const contentImg = window.getElementContentImage ? window.getElementContentImage(el) : Array.from((el && el.querySelectorAll) ? el.querySelectorAll('img') : []).find(img => !img.closest('.element-border-art, .border-art-wrapper, #native-border-art-border'));
        const img = contentImg || (el.getAttribute('data-type') === 'emoji' ? el.querySelector('svg') : null);
        const content = el.querySelector('.element-content');
        const num = parseInt(v) || 0;
        
        if (num <= 0) {
            if (img) {
                img.style.clipPath = 'none';
                img.style.webkitClipPath = 'none';
                img.style.borderRadius = '';
                img.removeAttribute('data-rounded-corners');
            }
            el.removeAttribute('data-rounded-corners');
            el.style.borderRadius = '';
            if (content) {
                content.style.clipPath = '';
                content.style.webkitClipPath = '';
                content.style.borderRadius = '';
            }
        } else {
            const radStr = `${num}px`;
            const clip = `inset(0 round ${radStr})`;
            if (img) {
                img.style.clipPath = clip;
                img.style.webkitClipPath = clip;
                img.style.borderRadius = radStr;
                img.setAttribute('data-rounded-corners', radStr);
            }
            el.setAttribute('data-rounded-corners', radStr);
            el.style.borderRadius = radStr;
            if (content) {
                content.style.clipPath = '';
                content.style.webkitClipPath = '';
                content.style.borderRadius = radStr;
                content.style.overflow = 'visible';
            }
            el.style.overflow = 'visible';
        }

        const curIdx = (typeof state !== 'undefined' && state.currentPageIndex !== undefined) ? state.currentPageIndex : 0;
        const activeThumb = document.getElementById('thumb-' + curIdx);
        if (activeThumb && el.id) {
            const tEl = activeThumb.querySelector(`[data-target-id="${el.id}"]`);
            if (tEl) {
                const tImg = tEl.querySelector('img');
                if (tImg) {
                    if (num <= 0) {
                        tImg.style.clipPath = 'none';
                        tImg.style.webkitClipPath = 'none';
                        tImg.style.borderRadius = '';
                    } else {
                        const radStr = `${num}px`;
                        tImg.style.clipPath = `inset(0 round ${radStr})`;
                        tImg.style.webkitClipPath = `inset(0 round ${radStr})`;
                        tImg.style.borderRadius = radStr;
                    }
                }
            }
        }
    };

    panel.querySelectorAll('.op-sidebar-slider').forEach(s => {
        if (typeof window.updateSliderFill === 'function') window.updateSliderFill(s);
        s.addEventListener('input', e => {
            if (typeof window.updateSliderFill === 'function') window.updateSliderFill(e.target);
            if(!state.selectedEl) return;
            const f = e.target.dataset.filter, v = e.target.value;
            if (f === 'rounded-corners') {
                applyRoundedCorners(state.selectedEl, v);
            } else {
                state.selectedEl.setAttribute(`data-filter-${f}`, v);
                apply(state.selectedEl);
            }
            const txt = panel.querySelector(`#val-${f}`);
            if(txt) txt.innerText = v + (f==='hue-rotate'?'°':(f==='blur'||f==='rounded-corners')?'px':'%');
        });
        s.addEventListener('change', () => { if(window.pushHistory) pushHistory(); });
    });

    panel.querySelector('#filter-reset-btn').addEventListener('click', () => {
        if(!state.selectedEl) return;
        panel.querySelectorAll('.op-sidebar-slider').forEach(s => {
            const f = s.dataset.filter, d = (['brightness','contrast','saturate'].includes(f)?100:0);
            if (f === 'rounded-corners') {
                applyRoundedCorners(state.selectedEl, 0);
            } else {
                state.selectedEl.removeAttribute(`data-filter-${f}`);
            }
            s.value = d; 
            const txt = panel.querySelector(`#val-${f}`);
            if(txt) txt.innerText = d + (f==='hue-rotate'?'°':(f==='blur'||f==='rounded-corners')?'px':'%');
            if (typeof window.updateSliderFill === 'function') window.updateSliderFill(s);
        });
        apply(state.selectedEl);
        if(window.pushHistory) pushHistory();
    });

    panel.querySelector('#filter-close-btn').addEventListener('click', () => { userCollapsed = true; refreshVisibility(state.selectedEl); });
    
    expander.addEventListener('click', () => { userCollapsed = false; refreshVisibility(state.selectedEl); });


    // Tab switching logic for Format Picture sidebar
    const tabPicBtn = panel.querySelector('#op-tab-pic-btn');
    const tabFrameBtn = panel.querySelector('#op-tab-frame-btn');
    const picTabPane = panel.querySelector('#op-sidebar-pic-tab-pane');
    const frameTabPane = panel.querySelector('#op-sidebar-frame-tab-pane');

    const switchSidebarTab = (tab) => {
        if (tab === 'frame') {
            if (tabFrameBtn) tabFrameBtn.classList.add('active');
            if (tabPicBtn) tabPicBtn.classList.remove('active');
            if (frameTabPane) frameTabPane.style.display = 'block';
            if (picTabPane) picTabPane.style.display = 'none';
            if (state.selectedEl) syncFrameInputs(state.selectedEl);
        } else {
            if (tabPicBtn) tabPicBtn.classList.add('active');
            if (tabFrameBtn) tabFrameBtn.classList.remove('active');
            if (picTabPane) picTabPane.style.display = 'block';
            if (frameTabPane) frameTabPane.style.display = 'none';
        }
    };

    if (tabPicBtn) tabPicBtn.onclick = () => switchSidebarTab('pic');
    if (tabFrameBtn) tabFrameBtn.onclick = () => switchSidebarTab('frame');

    // Sync frame inputs helper
    const syncFrameInputs = (el) => {
        if (!el || !panel) return;
        const config = window.PictureFrameEngine ? window.PictureFrameEngine.getFrameConfig(el) : null;
        const activeBlock = panel.querySelector('#op-frame-active-controls');
        const emptyBlock = panel.querySelector('#op-frame-empty-controls');
        const tabIndicator = panel.querySelector('#op-frame-tab-indicator');

        if (config) {
            if (activeBlock) activeBlock.style.display = 'block';
            if (emptyBlock) emptyBlock.style.display = 'none';
            if (tabIndicator) tabIndicator.style.display = 'inline-block';

            const styleSelect = panel.querySelector('#op-frame-style-select');
            const canonicalId = (window.PictureFrameEngine && window.PictureFrameEngine.normalizeFrameId) ? window.PictureFrameEngine.normalizeFrameId(config.frameId) : config.frameId;
            if (styleSelect) styleSelect.value = canonicalId;

            const triggerLabel = panel.querySelector('#op-frame-style-label');
            const presetObj = window.PictureFrameEngine ? window.PictureFrameEngine.getPresetById(canonicalId) : null;
            if (triggerLabel && presetObj) {
                triggerLabel.innerText = presetObj.name;
            }
            const frameDropdown = panel.querySelector('#op-frame-style-dropdown');
            if (frameDropdown) {
                frameDropdown.querySelectorAll('.op-frame-item').forEach(it => {
                    if (it.getAttribute('data-value') === canonicalId) it.classList.add('highlighted');
                    else it.classList.remove('highlighted');
                });
            }

            const wSlider = panel.querySelector('#op-frame-width-slider');
            const wVal = panel.querySelector('#val-frame-width');
            if (wSlider) {
                wSlider.value = config.frameWidth;
                if (typeof window.updateSliderFill === 'function') window.updateSliderFill(wSlider);
            }
            if (wVal) wVal.innerText = config.frameWidth + 'px';

            const matToggle = panel.querySelector('#op-frame-mat-toggle');
            const matDetails = panel.querySelector('#op-frame-mat-details');
            const hasMat = (config.matId && config.matId !== 'none' && config.matWidth > 0);
            if (matToggle) matToggle.checked = hasMat;
            if (matDetails) matDetails.style.display = hasMat ? 'flex' : 'none';

            const matSelect = panel.querySelector('#op-frame-mat-select');
            if (matSelect && config.matId && config.matId !== 'none') matSelect.value = config.matId;

            const matLabel = panel.querySelector('#op-frame-mat-label');
            const matPresets = window.PictureFrameEngine ? window.PictureFrameEngine.getMatPresets() : [];
            const currentMatObj = matPresets.find(m => m.id === (config.matId || 'studio_white')) || matPresets[1];
            if (matLabel && currentMatObj) {
                matLabel.innerText = currentMatObj.name;
            }
            const matDropdown = panel.querySelector('#op-frame-mat-dropdown');
            if (matDropdown) {
                matDropdown.querySelectorAll('.op-frame-mat-item').forEach(it => {
                    if (it.getAttribute('data-value') === config.matId) it.classList.add('highlighted');
                    else it.classList.remove('highlighted');
                });
            }

            const matSlider = panel.querySelector('#op-frame-mat-slider');
            const matVal = panel.querySelector('#val-frame-mat-width');
            if (matSlider) {
                matSlider.value = config.matWidth || 16;
                if (typeof window.updateSliderFill === 'function') window.updateSliderFill(matSlider);
            }
            if (matVal) matVal.innerText = (config.matWidth || 16) + 'px';

            const shadowToggle = panel.querySelector('#op-frame-shadow-toggle');
            if (shadowToggle) shadowToggle.checked = !!config.hasShadow;

            const fitRadios = panel.querySelectorAll('input[name="op-sidebar-fit"]');
            fitRadios.forEach(r => { r.checked = (r.value === config.fitMode); });
        } else {
            if (activeBlock) activeBlock.style.display = 'none';
            if (emptyBlock) emptyBlock.style.display = 'block';
            if (tabIndicator) tabIndicator.style.display = 'none';
        }
    };

    window.syncFormatPictureSidebarFrame = function(el) {
        if (el && el === state.selectedEl) {
            syncFrameInputs(el);
            if (el.classList.contains('has-picture-frame') && panel.classList.contains('visible')) {
                switchSidebarTab('frame');
            } else if (!el.classList.contains('has-picture-frame')) {
                switchSidebarTab('pic');
            }
        }
    };

    // Frame Style Trigger & Custom Dropdown (matching Font dropdown UI)
    const frameStyleTrigger = panel.querySelector('#op-frame-style-trigger');
    const frameStyleDropdown = panel.querySelector('#op-frame-style-dropdown');
    const frameSelect = panel.querySelector('#op-frame-style-select');

    if (frameStyleTrigger && frameStyleDropdown) {
        frameStyleTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = frameStyleDropdown.style.display === 'block';
            document.querySelectorAll('.custom-dropdown').forEach(d => d.style.display = 'none');
            panel.querySelectorAll('.op-custom-select-trigger').forEach(t => t.classList.remove('active'));
            if (!isOpen) {
                frameStyleDropdown.style.display = 'block';
                frameStyleTrigger.classList.add('active');
                const hl = frameStyleDropdown.querySelector('.op-frame-item.highlighted');
                if (hl) hl.scrollIntoView({ block: 'nearest' });
            }
        });

        frameStyleDropdown.querySelectorAll('.op-frame-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = item.getAttribute('data-value');
                frameStyleDropdown.style.display = 'none';
                frameStyleTrigger.classList.remove('active');
                if (frameSelect) {
                    frameSelect.value = val;
                    frameSelect.dispatchEvent(new Event('change'));
                }
            });
        });
    }

    if (frameSelect) {
        frameSelect.addEventListener('change', (e) => {
            if (!state.selectedEl || !window.PictureFrameEngine) return;
            const cfg = window.PictureFrameEngine.getFrameConfig(state.selectedEl) || { frameWidth: 24, matId: 'none', matWidth: 0, hasShadow: true, fitMode: 'outside' };
            cfg.frameId = (window.PictureFrameEngine && window.PictureFrameEngine.normalizeFrameId) ? window.PictureFrameEngine.normalizeFrameId(e.target.value) : e.target.value;
            window.PictureFrameEngine.applyFrame(state.selectedEl, cfg);
        });
    }

    // Matboard Style Trigger & Custom Dropdown
    const matTrigger = panel.querySelector('#op-frame-mat-trigger');
    const matDropdown = panel.querySelector('#op-frame-mat-dropdown');
    const matSelect = panel.querySelector('#op-frame-mat-select');

    if (matTrigger && matDropdown) {
        matTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = matDropdown.style.display === 'block';
            document.querySelectorAll('.custom-dropdown').forEach(d => d.style.display = 'none');
            panel.querySelectorAll('.op-custom-select-trigger').forEach(t => t.classList.remove('active'));
            if (!isOpen) {
                matDropdown.style.display = 'block';
                matTrigger.classList.add('active');
                const hl = matDropdown.querySelector('.op-frame-mat-item.highlighted');
                if (hl) hl.scrollIntoView({ block: 'nearest' });
            }
        });

        matDropdown.querySelectorAll('.op-frame-mat-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = item.getAttribute('data-value');
                matDropdown.style.display = 'none';
                matTrigger.classList.remove('active');
                if (matSelect) {
                    matSelect.value = val;
                    matSelect.dispatchEvent(new Event('change'));
                }
            });
        });
    }

    // Frame Width Slider
    const frameWidthSlider = panel.querySelector('#op-frame-width-slider');
    if (frameWidthSlider) {
        if (typeof window.updateSliderFill === 'function') window.updateSliderFill(frameWidthSlider);
        frameWidthSlider.addEventListener('input', (e) => {
            if (!state.selectedEl || !window.PictureFrameEngine) return;
            const val = parseInt(e.target.value) || 24;
            const txt = panel.querySelector('#val-frame-width');
            if (txt) txt.innerText = val + 'px';
            if (typeof window.updateSliderFill === 'function') window.updateSliderFill(e.target);
            const cfg = window.PictureFrameEngine.getFrameConfig(state.selectedEl);
            if (cfg) {
                cfg.frameWidth = val;
                window.PictureFrameEngine.applyFrame(state.selectedEl, cfg, true);
            }
        });
        frameWidthSlider.addEventListener('change', () => {
            if (typeof window.pushHistory === 'function') window.pushHistory();
        });
    }

    // Matboard Toggle
    const matToggle = panel.querySelector('#op-frame-mat-toggle');
    const matDetails = panel.querySelector('#op-frame-mat-details');
    if (matToggle) {
        matToggle.addEventListener('change', (e) => {
            if (!state.selectedEl || !window.PictureFrameEngine) return;
            const isChecked = e.target.checked;
            if (matDetails) matDetails.style.display = isChecked ? 'flex' : 'none';
            const cfg = window.PictureFrameEngine.getFrameConfig(state.selectedEl);
            if (cfg) {
                if (isChecked) {
                    const sel = panel.querySelector('#op-frame-mat-select');
                    const slider = panel.querySelector('#op-frame-mat-slider');
                    cfg.matId = (sel && sel.value) ? sel.value : 'studio_white';
                    cfg.matWidth = (slider && parseInt(slider.value)) ? parseInt(slider.value) : 16;
                } else {
                    cfg.matId = 'none';
                    cfg.matWidth = 0;
                }
                window.PictureFrameEngine.applyFrame(state.selectedEl, cfg);
            }
        });
    }

    // Matboard Select
    if (matSelect) {
        matSelect.addEventListener('change', (e) => {
            if (!state.selectedEl || !window.PictureFrameEngine) return;
            const cfg = window.PictureFrameEngine.getFrameConfig(state.selectedEl);
            if (cfg) {
                cfg.matId = e.target.value;
                window.PictureFrameEngine.applyFrame(state.selectedEl, cfg);
            }
        });
    }

    // Matboard Width Slider
    const matSlider = panel.querySelector('#op-frame-mat-slider');
    if (matSlider) {
        if (typeof window.updateSliderFill === 'function') window.updateSliderFill(matSlider);
        matSlider.addEventListener('input', (e) => {
            if (!state.selectedEl || !window.PictureFrameEngine) return;
            const val = parseInt(e.target.value) || 16;
            const txt = panel.querySelector('#val-frame-mat-width');
            if (txt) txt.innerText = val + 'px';
            if (typeof window.updateSliderFill === 'function') window.updateSliderFill(e.target);
            const cfg = window.PictureFrameEngine.getFrameConfig(state.selectedEl);
            if (cfg) {
                cfg.matWidth = val;
                window.PictureFrameEngine.applyFrame(state.selectedEl, cfg, true);
            }
        });
        matSlider.addEventListener('change', () => {
            if (typeof window.pushHistory === 'function') window.pushHistory();
        });
    }

    // Shadow Toggle
    const shadowToggle = panel.querySelector('#op-frame-shadow-toggle');
    if (shadowToggle) {
        shadowToggle.addEventListener('change', (e) => {
            if (!state.selectedEl || !window.PictureFrameEngine) return;
            const cfg = window.PictureFrameEngine.getFrameConfig(state.selectedEl);
            if (cfg) {
                cfg.hasShadow = e.target.checked;
                window.PictureFrameEngine.applyFrame(state.selectedEl, cfg);
            }
        });
    }

    // Fitting Radio
    panel.querySelectorAll('input[name="op-sidebar-fit"]').forEach(r => {
        r.addEventListener('change', (e) => {
            if (!state.selectedEl || !window.PictureFrameEngine) return;
            const cfg = window.PictureFrameEngine.getFrameConfig(state.selectedEl);
            if (cfg) {
                cfg.fitMode = e.target.value;
                window.PictureFrameEngine.applyFrame(state.selectedEl, cfg);
            }
        });
    });

    // Remove Frame Button
    const removeBtn = panel.querySelector('#op-frame-remove-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            if (!state.selectedEl || !window.PictureFrameEngine) return;
            window.PictureFrameEngine.removeFrame(state.selectedEl);
            syncFrameInputs(state.selectedEl);
        });
    }

    // Browse Gallery Buttons
    const openGalleryHandler = () => {
        if (typeof showPictureFrameModal === 'function') {
            showPictureFrameModal();
        }
    };
    const browseBtn = panel.querySelector('#op-frame-browse-gallery-btn');
    const addDialogBtn = panel.querySelector('#op-frame-add-dialog-btn');
    if (browseBtn) browseBtn.addEventListener('click', openGalleryHandler);
    if (addDialogBtn) addDialogBtn.addEventListener('click', openGalleryHandler);

    const hookSelection = () => {
        if(window.selectElement && !window.selectElement._filterHookedLegacy) {
            const oldSel = window.selectElement;
            window.selectElement = (el) => {
                oldSel(el);
                try { refreshVisibility(el); } catch(e){}
            };
            window.selectElement._filterHookedLegacy = true;
        }
        if(window.deselect && !window.deselect._filterHookedLegacy) {
            const oldDes = window.deselect;
            window.deselect = () => {
                oldDes();
                if (window._isTransitioningSelection) return;
                try { refreshVisibility(null); } catch(e){}
            };
            window.deselect._filterHookedLegacy = true;
        }
    };
    hookSelection();
    setTimeout(hookSelection, 500);
    setTimeout(hookSelection, 1000);
})();


(function installSidebarWordArt() {
    // --- NEW SAFEGUARD: Destroy existing instances to prevent clones ---
    document.getElementById('op-wordart-sidebar')?.remove();
    document.getElementById('op-wa-sidebar-expander')?.remove();
    // -------------------------------------------------------------------

    let waUserCollapsed = false;

    const getDef = (f) => {
        if(f === 'lineHeight') return 1.2;
        if(f === 'fontWeight') return 400;
        if(f === 'shadowX' || f === 'shadowY') return 2;
        if(f === 'saturate') return 100; 
        return 0;
    };

    const getUnit = (f) => {
        if (['blur', 'spacing', 'wordSpacing', 'shadowX', 'shadowY'].includes(f)) return 'px';
        if (['opacity', 'saturate'].includes(f)) return '%';
        if (f === 'hue') return '°';
        if (f === 'lineHeight') return 'x';
        return ''; 
    };

    const toggleSliders = (isDisabled) => {
        const sections = ['wa-color-sec', 'wa-shadow-sec', 'wa-typo-sec'];
        sections.forEach(id => {
            const el = panel.querySelector(`#${id}`);
            if (el) {
                if (isDisabled) el.classList.add('wa-disabled-section');
                else el.classList.remove('wa-disabled-section');
                
                el.querySelectorAll('input').forEach(inp => {
                    inp.disabled = isDisabled;
                });
            }
        });
    };

    // --- CORE FEATURE: Auto-Compensating Text Engine ---
    const applyWordArtShape = (target, shape) => {
        if (!target.dataset.origText) {
            target.dataset.origText = target.innerText.trim();
        }
        const text = target.dataset.origText;
        
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.overflow = "visible"; 
        svg.setAttribute("preserveAspectRatio", "none"); 
        
        const defs = document.createElementNS(svgNS, "defs");
        const path = document.createElementNS(svgNS, "path");
        const pathId = "wa-path-" + Math.random().toString(36).substr(2, 9);
        path.id = pathId;
        
        svg.setAttribute("viewBox", "0 0 200 150");
        
        let pathD = "";
        if (shape === 'arch-up') {
            pathD = "M 10,120 Q 100,10 190,120"; 
        } else if (shape === 'arch-down') {
            pathD = "M 10,30 Q 100,140 190,30"; 
        } else if (shape === 'circle') {
            pathD = "M 100, 135 m -65, 0 a 65,65 0 1,1 130,0 a 65,65 0 1,1 -130,0";
        } else {
            pathD = "M 10,75 L 190,75";
        }

        path.setAttribute("d", pathD);
        path.setAttribute("fill", "transparent");
        defs.appendChild(path);
        svg.appendChild(defs);

        const textEl = document.createElementNS(svgNS, "text");
        textEl.setAttribute("fill", "currentColor"); 
        textEl.style.fontFamily = "inherit";
        textEl.style.fontWeight = "inherit";
        
        textEl.setAttribute("dominant-baseline", "middle");

        const charCount = Math.max(1, text.length);
        const dynamicFontSize = Math.min(50, 180 / (charCount * 0.45));
        textEl.style.fontSize = dynamicFontSize + "px"; 

        if (shape === 'arch-down') {
            textEl.style.letterSpacing = (dynamicFontSize * 0.12) + "px";
        } else if (shape === 'circle') {
            textEl.style.letterSpacing = (dynamicFontSize * 0.20) + "px";
        } else {
            textEl.style.letterSpacing = "inherit";
        }

        const textPath = document.createElementNS(svgNS, "textPath");
        textPath.setAttribute("href", "#" + pathId);
        textPath.setAttribute("startOffset", "50%");
        textPath.setAttribute("text-anchor", "middle");
        textPath.textContent = text;

        textEl.appendChild(textPath);
        svg.appendChild(textEl);

        target.innerHTML = '';
        target.appendChild(svg);
        target.style.display = 'block'; 
        target.style.width = '100%';
        target.style.height = '100%';
    };

    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    const expander = document.createElement('div');
    expander.id = 'op-wa-sidebar-expander';
    expander.innerHTML = '<i class="fas fa-font"></i>';
    document.body.appendChild(expander);

    const panel = document.createElement('div');
    panel.id = 'op-wordart-sidebar';
    panel.innerHTML = `<div class="op-sidebar-header">
            <span class="op-sidebar-title">Format WordArt</span>
            <div class="op-sidebar-top-btns">
                <button class="op-header-btn" id="wa-reset-btn" style="margin-right:8px" title="Reset All"><i class="fas fa-undo"></i></button>
                <button class="custom-dialog-close" id="wa-close-btn"><i class="fas fa-times"></i></button>
            </div>
        </div>
        
        <div class="op-sidebar-section">
            <span class="op-section-label">Text Shape</span>
            <div class="wa-shape-grid" id="wa-shape-controls">
                <button class="wa-shape-btn active" data-shape="none" title="Straight Text">
                    <svg viewBox="0 0 24 24"><text x="12" y="16" font-size="12" text-anchor="middle" font-weight="bold" fill="currentColor">ABC</text></svg>
                </button>
                <button class="wa-shape-btn" data-shape="arch-up" title="Arch Up">
                    <svg viewBox="0 0 24 24"><path d="M 4,16 Q 12,6 20,16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                </button>
                <button class="wa-shape-btn" data-shape="arch-down" title="Arch Down">
                    <svg viewBox="0 0 24 24"><path d="M 4,8 Q 12,18 20,8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                </button>
                <button class="wa-shape-btn" data-shape="circle" title="Circle">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="4 3"/></svg>
                </button>
                <button class="wa-shape-btn" data-shape="wave" title="Wave">
                    <svg viewBox="0 0 24 24"><path d="M 3,12 Q 7.5,6 12,12 T 21,12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                </button>
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Color & Effects</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Hue Shift</span><span class="op-slider-num" id="val-wa-hue">0°</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="hue" min="-180" max="180" value="0" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Saturation</span><span class="op-slider-num" id="val-wa-saturate">100%</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="saturate" min="0" max="200" value="100" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Transparency</span><span class="op-slider-num" id="val-wa-opacity">0%</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="opacity" min="0" max="100" value="0">
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Drop Shadow</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Shadow X</span><span class="op-slider-num" id="val-wa-shadowX">2px</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="shadowX" min="-50" max="50" value="2" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Shadow Y</span><span class="op-slider-num" id="val-wa-shadowY">2px</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="shadowY" min="-50" max="50" value="2" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Shadow Blur</span><span class="op-slider-num" id="val-wa-blur">0px</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="blur" min="0" max="25" value="0">
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Typography</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Font Weight</span><span class="op-slider-num" id="val-wa-fontWeight">400</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="fontWeight" min="100" max="900" value="400" step="100">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Letter Spacing</span><span class="op-slider-num" id="val-wa-spacing">0px</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="spacing" min="-10" max="50" value="0" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Word Spacing</span><span class="op-slider-num" id="val-wa-wordSpacing">0px</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="wordSpacing" min="-20" max="50" value="0" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Line Height</span><span class="op-slider-num" id="val-wa-lineHeight">1.2x</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="lineHeight" min="0.5" max="3" value="1.2" step="0.1">
            </div>
        </div>`;
    document.body.appendChild(panel);

    const refreshUI = (el) => {
        const isWA = el && (el.classList.contains('wa-text') || el.querySelector('.wa-text') || el.closest('.wa-wrapper'));
        if (isWA) {
            if (waUserCollapsed) {
                panel.classList.remove('visible');
                expander.classList.add('visible');
            } else {
                panel.classList.add('visible');
                expander.classList.remove('visible');
            }
            const target = el.querySelector('.wa-text') || el.closest('.wa-text') || (el.classList.contains('wa-text') ? el : null);
            if (target) {
                panel.querySelectorAll('.wa-sidebar-input').forEach(input => {
                    const f = input.dataset.waf;
                    const attrVal = target.getAttribute(`data-waf-${f}`);
                    const v = attrVal !== null ? attrVal : getDef(f);
                    input.value = v;
                    const textLabel = panel.querySelector(`#val-wa-${f}`);
                    if(textLabel) textLabel.innerText = v + getUnit(f);
                    if (typeof window.updateSliderFill === 'function') window.updateSliderFill(input);
                });
                
                const currentShape = target.getAttribute('data-waf-shape') || 'none';
                panel.querySelectorAll('.wa-shape-btn').forEach(btn => {
                    if(btn.dataset.shape === currentShape) btn.classList.add('active');
                    else btn.classList.remove('active');
                });
                toggleSliders(currentShape !== 'none');
            }
        } else {
            panel.classList.remove('visible');
            expander.classList.remove('visible');
        }
    };

    setTimeout(() => {
        if (window.selectElement) {
            const originalSelect = window.selectElement;
            window.selectElement = function(el) {
                originalSelect.apply(this, arguments);
                if (el && (el.querySelector('.wa-text') || el.classList.contains('wa-text'))) {
                    document.getElementById('op-image-sidebar')?.classList.remove('visible');
                }
                refreshUI(el);
            };
        }
        if (window.deselect) {
            const originalDeselect = window.deselect;
            window.deselect = function() {
                originalDeselect.apply(this, arguments);
                if (window._isTransitioningSelection) return;
                refreshUI(null);
            };
        }
    }, 1500);

    panel.querySelector('#wa-close-btn').onclick = () => { waUserCollapsed = true; refreshUI(state.selectedEl); };
    expander.onclick = () => { waUserCollapsed = false; refreshUI(state.selectedEl); };

    // --- Shape Button Click Logic ---
    panel.querySelectorAll('.wa-shape-btn').forEach(btn => {
        btn.onclick = (e) => {
            if (!state.selectedEl) return;
            const target = state.selectedEl.querySelector('.wa-text') || state.selectedEl;
            const shape = btn.dataset.shape;
            
            panel.querySelectorAll('.wa-shape-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            target.setAttribute('data-waf-shape', shape);
            applyWordArtShape(target, shape);
            toggleSliders(shape !== 'none');
            
            if (typeof syncWordArt === 'function') {
                syncWordArt(state.selectedEl);
            }
            if (typeof pushHistory === 'function') pushHistory();
        };
    });

    // Reset Button Logic
    panel.querySelector('#wa-reset-btn').onclick = () => {
        if (!state.selectedEl) return;
        const target = state.selectedEl.querySelector('.wa-text') || state.selectedEl;
        
        panel.querySelectorAll('.wa-sidebar-input').forEach(input => {
            const f = input.dataset.waf;
            const d = getDef(f);
            target.removeAttribute(`data-waf-${f}`);
            input.value = d;
            const textLabel = panel.querySelector(`#val-wa-${f}`);
            if(textLabel) textLabel.innerText = d + getUnit(f);
            if (typeof window.updateSliderFill === 'function') window.updateSliderFill(input);
        });

        target.removeAttribute('data-waf-shape');
        panel.querySelectorAll('.wa-shape-btn').forEach(b => {
            if(b.dataset.shape === 'none') b.classList.add('active');
            else b.classList.remove('active');
        });
        applyWordArtShape(target, 'none');
        toggleSliders(false);

        target.style.opacity = 1;
        target.style.letterSpacing = '0px';
        target.style.wordSpacing = '0px';
        target.style.lineHeight = 1.2;
        target.style.fontWeight = 400;
        target.style.webkitTextStroke = '';
        target.style.filter = '';
        
        if (typeof syncWordArt === 'function') syncWordArt(state.selectedEl);
        if (typeof pushHistory === 'function') pushHistory();
    };

    // Slider Logic
    panel.querySelectorAll('.wa-sidebar-input').forEach(input => {
        if (typeof window.updateSliderFill === 'function') window.updateSliderFill(input);
        input.oninput = (e) => {
            if (!state.selectedEl) return;
            const target = state.selectedEl.querySelector('.wa-text') || state.selectedEl;
            const val = e.target.value;
            const f = e.target.dataset.waf;
            
            target.setAttribute(`data-waf-${f}`, val);
            const textLabel = panel.querySelector(`#val-wa-${f}`);
            if(textLabel) textLabel.innerText = val + getUnit(f);
            
            if (f === 'opacity') target.style.opacity = 1 - (val / 100);
            if (f === 'spacing') target.style.letterSpacing = `${val}px`;
            if (f === 'wordSpacing') target.style.wordSpacing = `${val}px`;
            if (f === 'lineHeight') target.style.lineHeight = val;
            if (f === 'fontWeight') target.style.fontWeight = val;
            
            if (['blur', 'shadowX', 'shadowY', 'hue', 'saturate'].includes(f)) {
                const blurVal = target.getAttribute('data-waf-blur') || 0;
                const sxVal = target.getAttribute('data-waf-shadowX') || 2;
                const syVal = target.getAttribute('data-waf-shadowY') || 2;
                const hueVal = target.getAttribute('data-waf-hue') || 0;
                
                const satAttr = target.getAttribute('data-waf-saturate');
                const satVal = satAttr !== null ? satAttr : 100;
                
                let filterStr = '';
                if (blurVal > 0 || sxVal != 0 || syVal != 0) filterStr += `drop-shadow(${sxVal}px ${syVal}px ${blurVal}px rgba(0,0,0,0.5)) `;
                if (hueVal != 0) filterStr += `hue-rotate(${hueVal}deg) `;
                if (satVal != 100) filterStr += `saturate(${satVal}%) `;
                
                target.style.filter = filterStr.trim();
            }

            const currentShape = target.getAttribute('data-waf-shape') || 'none';
            if (['spacing', 'wordSpacing', 'lineHeight', 'outline', 'blur', 'fontWeight', 'shadowX', 'shadowY'].includes(f)) {
                if (typeof syncWordArt === 'function' && currentShape === 'none') {
                    syncWordArt(state.selectedEl);
                }
            }
            if (typeof pushHistory === 'function') pushHistory();
        };
    });
})();


// Obsolete legacy paste interceptors (fixImagePaste, installV63MasterFix) removed.
// The new native paste architecture in smart-images.js and the true multi-copy block handle this cleanly.

(function fixFirefoxUndo() {
    
    // 1. Intercept Ctrl+Z globally
    window.addEventListener('keydown', function(e) {
        if (window.isDrawingModeActive && window.isDrawingModeActive()) {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault(); // Stop Firefox native undo, but allow propagation to drawing engine
            }
            return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
            
            // Are we actively typing?
            const activeEl = document.activeElement;
            const isTextEditing = activeEl && (
                activeEl.isContentEditable || 
                activeEl.tagName === 'INPUT' || 
                activeEl.tagName === 'TEXTAREA' ||
                activeEl.closest('[contenteditable="true"]')
            );

            // If we are NOT typing inside a text box, block Firefox!
            if (!isTextEditing) {
                // This stops Firefox from reverting hidden UI dropdowns (like page orientation)
                e.preventDefault();
                e.stopImmediatePropagation();
                
                // Manually trigger the app's custom undo instead
                if (typeof window.undo === 'function') {
                    window.undo();
                } else if (document.getElementById('undo-btn')) {
                    document.getElementById('undo-btn').click();
                }
            }
        }
    }, true);

    // 2. Prevent the top Undo/Redo buttons from triggering Firefox form submissions
    setTimeout(() => {
        const undoRedoBtns = document.querySelectorAll('#undo-btn, #redo-btn, [title*="Undo"], [title*="Redo"], .undo-btn, .redo-btn');
        undoRedoBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // In Firefox, clicking a <button> can sometimes act as a form submit if not explicitly blocked
                e.preventDefault(); 
            });
            // Stop the buttons from stealing canvas focus
            btn.addEventListener('mousedown', (e) => { e.preventDefault(); });
        });
    }, 1000);
})();



(function installV62MasterFix() {
    console.log("🛠️ V62.0 Master Fix initializing...");

    // --- 1. RESTORE IMAGE SELECTION & MOVEMENT ---
    // Note: The insertSmartImage builder is maintained in extensions/smart-images.js
    // with full loading spinner, fallback image resolution, and error handling.
    // Retroactively fix any broken legacy images sitting on the canvas:
    setTimeout(() => {
        if (typeof scheduleEmojiMigrate === 'function') scheduleEmojiMigrate();
        document.querySelectorAll('.pub-element img').forEach(img => {
            if (img.style.pointerEvents === 'none') {
                img.style.pointerEvents = 'auto';
                img.setAttribute('draggable', 'false');
            }
        });
    }, 500);

    // --- 2. FIX THE DOUBLE-PASTE BUG ---
    // When you copy an element inside the app, we overwrite the OS clipboard with a dummy text string.
    // This forces the "Ghost Hook" to ignore the OS paste, preventing the double-paste from happening!
    if (typeof window.copyEl === 'function' && !window._copyElPatched) {
        const originalCopyEl = window.copyEl;
        window.copyEl = function() {
            originalCopyEl(); // Run your normal internal copy
            
            // Overwrite the OS clipboard so it doesn't hold a stale image
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText("openpublisher_internal");
                } else {
                    const dummy = document.createElement("input");
                    document.body.appendChild(dummy);
                    dummy.value = "openpublisher_internal";
                    dummy.select();
                    document.execCommand("copy");
                    document.body.removeChild(dummy);
                }
            } catch(e) {}
        };
        window._copyElPatched = true;
    }

    // --- 3. CLEAR STALE GHOSTS ---
    // If you click empty space and press Copy, it clears the internal clipboard 
    // so it doesn't paste something you forgot you copied.
    window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
            if (typeof state !== 'undefined' && !state.selectedEl && (!state.multiSelected || state.multiSelected.length === 0)) {
                state.copiedEl = null;
            }
        }
    });

})();


(function installMultiCopyAndSelectAll() {
    console.log("🛠️ V64.0 Multi-Copy & Select All Fix initializing...");

    // --- 1. CTRL + A (Select All) ---
    window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
            // Don't intercept if the user is typing inside a text box (let them select their text!)
            const activeEl = document.activeElement;
            const isTextEditing = activeEl && (activeEl.isContentEditable || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
            if (isTextEditing) return;

            e.preventDefault(); // Stop the browser from highlighting the UI text

            const allElements = document.querySelectorAll('.pub-element');
            if (allElements.length === 0) return;

            // Clear any current single selection safely
            if (typeof window.deselect === 'function') window.deselect();

            // Setup multi-selection array
            state.multiSelected = [];
            allElements.forEach(el => {
                // Ignore the blueprint borders and hidden structural elements
                if (el.dataset.cloaked !== 'true' && el.id !== 'native-blueprint-border' && el.style.display !== 'none') {
                    state.multiSelected.push(el);
                    el.classList.add('selected');
                }
            });

            // Update UI based on how many things we grabbed
            if (state.multiSelected.length === 1) {
                window.selectElement(state.multiSelected[0]);
                state.multiSelected = [];
            } else if (state.multiSelected.length > 1) {
                const status = document.getElementById('status-msg');
                if (status) status.innerText = state.multiSelected.length + " Elements Selected";
                const ft = document.getElementById('float-toolbar');
                if (ft) ft.style.display = 'none';
            }
            if (typeof window.updateSelectionObserver === 'function') window.updateSelectionObserver();
            else if (typeof window.renderSelectionOverlays === 'function') window.renderSelectionOverlays();
        }
    }, true);

    // --- 2. MULTI-ITEM COPY / CUT ---
    window.copyEl = function(isCut = false) {
        // Check up front whether the user has text highlighted inside a contenteditable.
        // We must do this BEFORE the recover-focus block below changes focus/selection.
        const savedCtxRange = window._contextTargetRange && !window._contextTargetRange.collapsed ? window._contextTargetRange : null;
        const selBeforeRecover = window.getSelection();
        const hasTextSelectionBeforeRecover = (selBeforeRecover && selBeforeRecover.rangeCount > 0 && !selBeforeRecover.isCollapsed) || !!savedCtxRange;

        // Recover focus if lost due to clicking ribbon or context menu - but only when the user
        // actually had text selected (i.e. this is a text copy, not an element copy).
        let targetBox = document.activeElement;
        if (hasTextSelectionBeforeRecover &&
            (!targetBox || (!targetBox.isContentEditable && targetBox.tagName !== 'INPUT' && targetBox.tagName !== 'TEXTAREA'))) {
            if (typeof state !== 'undefined' && state.selectedEl) {
                const innerText = state.selectedEl.querySelector('[contenteditable="true"]') || state.selectedEl.querySelector('.text-content');
                if (innerText) {
                    targetBox = innerText;
                    const rangeToRestore = savedCtxRange || state.lastRange;
                    if (rangeToRestore) {
                        targetBox.focus();
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(rangeToRestore);
                    }
                }
            }
        }

        const isTextEditing = targetBox && (targetBox.isContentEditable || targetBox.tagName === 'INPUT' || targetBox.tagName === 'TEXTAREA');
        const sel = window.getSelection();
        const hasTextSelection = sel && sel.rangeCount > 0 && !sel.isCollapsed;

        // Only enter the text-copy path when the user ACTUALLY has text highlighted.
        // Without this guard, selecting a text box and pressing Ctrl+C would find the
        // inner contenteditable, set isTextEditing=true, then silently return because
        // hasTextSelection is false - leaving the element never copied.
        if (isTextEditing && hasTextSelection) {
            let range = sel.getRangeAt(0);
            let textToCopy = sel.toString();
            
            // If cutting or copying a word selection that captured trailing whitespace (e.g. from double-clicking),
            // exclude the trailing whitespace from the cut/copy range so the space after the word is preserved in the document.
            if (isCut || /\s+$/.test(textToCopy)) {
                const trailingMatch = textToCopy.match(/\s+$/);
                if (trailingMatch) {
                    const count = trailingMatch[0].length;
                    let endNode = range.endContainer;
                    let endOff = range.endOffset;
                    if (endNode.nodeType === 3 && endOff >= count) {
                        range.setEnd(endNode, endOff - count);
                    } else if (endNode.nodeType === 1 && endOff > 0) {
                        let lastChild = endNode.childNodes[endOff - 1];
                        if (lastChild && lastChild.nodeType === 3 && lastChild.textContent.length >= count) {
                            range.setEnd(lastChild, lastChild.textContent.length - count);
                        }
                    }
                    textToCopy = range.toString();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }

            state.copiedText = textToCopy;
            
            try {
                const div = document.createElement('div');
                div.appendChild(range.cloneContents());
                let wrapperHtml = div.innerHTML;
                
                let node = range.commonAncestorContainer;
                if (node && node.nodeType === 3) node = node.parentNode;
                
                while (node && node !== document.body && node.getAttribute && node.getAttribute('contenteditable') !== 'true' && !node.classList.contains('text-content')) {
                    const clone = node.cloneNode(false);
                    clone.innerHTML = wrapperHtml;
                    wrapperHtml = clone.outerHTML;
                    node = node.parentNode;
                }
                
                state.copiedHtml = wrapperHtml;
            } catch (err) {
                state.copiedHtml = null;
                console.warn("Failed to capture HTML copy in copyEl", err);
            }
            
            state.copiedElements = [];
            
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(textToCopy).catch(e => {
                        document.execCommand('copy');
                    });
                } else {
                    document.execCommand('copy');
                }
            } catch(e) {
                try { document.execCommand('copy'); } catch(err) {}
            }
            
            if (isCut) {
                // Determine characters immediately before and after the range to preserve spaces
                let charBefore = '';
                let charAfter = '';
                const startContainer = range.startContainer;
                const startOffset = range.startOffset;
                const endContainer = range.endContainer;
                const endOffset = range.endOffset;

                if (startContainer.nodeType === 3 && startOffset > 0) {
                    charBefore = startContainer.textContent[startOffset - 1];
                } else if (startContainer.nodeType === 1 && startOffset > 0) {
                    const prevNode = startContainer.childNodes[startOffset - 1];
                    if (prevNode && prevNode.textContent) charBefore = prevNode.textContent.slice(-1);
                }

                if (endContainer.nodeType === 3 && endOffset < endContainer.textContent.length) {
                    charAfter = endContainer.textContent[endOffset];
                } else if (endContainer.nodeType === 1 && endOffset < endContainer.childNodes.length) {
                    const nextNode = endContainer.childNodes[endOffset];
                    if (nextNode && nextNode.textContent) charAfter = nextNode.textContent[0];
                }

                range.deleteContents();

                // If preceded by a space AND followed by a space, prevent HTML whitespace collapsing
                // from eating the trailing space by converting the preceding space to non-breaking space \u00A0
                if (/\s/.test(charBefore) && /\s/.test(charAfter)) {
                    if (startContainer.nodeType === 3 && startOffset > 0) {
                        const txt = startContainer.textContent;
                        const idx = startOffset - 1;
                        if (txt[idx] === ' ') {
                            startContainer.textContent = txt.substring(0, idx) + '\u00A0' + txt.substring(idx + 1);
                        }
                    }
                }

                const editHost = targetBox.closest ? (targetBox.closest('[contenteditable="true"]') || targetBox) : targetBox;
                if (editHost && editHost.dispatchEvent) {
                    try { editHost.dispatchEvent(new Event('input', { bubbles: true })); } catch(e) {}
                }

                window._contextTargetRange = null;
                if (typeof pushHistory !== 'undefined') pushHistory();
            }
            return;
        }

        state.copiedElements = []; // New array to hold all copied items
        state.copiedText = ""; // Clear text clipboard

        if (state.multiSelected && state.multiSelected.length > 0) {
            // Copy all selected items
            state.multiSelected.forEach(el => {
                state.copiedElements.push(el.cloneNode(true));
            });
            if (isCut) {
                state.multiSelected.forEach(el => el.remove());
                state.multiSelected = [];
                state.selectedEl = null;
                document.getElementById('selection-box').style.display = 'none';
                if(typeof pushHistory !== 'undefined') pushHistory();
            }
        } else if (state.selectedEl) {
            // Copy single selected item
            state.copiedElements.push(state.selectedEl.cloneNode(true));
            if (isCut) {
                state.selectedEl.remove();
                state.selectedEl = null;
                document.getElementById('selection-box').style.display = 'none';
                if(typeof pushHistory !== 'undefined') pushHistory();
            }
        }

        // Overwrite OS clipboard with a dummy string to prevent the double-paste bug (Ghost Hook)
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText("openpublisher_internal_multi");
            } else {
                const dummy = document.createElement("input");
                document.body.appendChild(dummy);
                dummy.value = "openpublisher_internal_multi";
                dummy.select();
                document.execCommand("copy");
                document.body.removeChild(dummy);
            }
        } catch(e) {}
    };

    window.cutEl = function() {
        window.copyEl(true);
    };

    // Global cut listener to cleanly intercept any native cut events in contenteditables
    document.addEventListener('cut', function(e) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
            const active = document.activeElement;
            if (active && (active.isContentEditable || (active.closest && active.closest('[contenteditable="true"]')))) {
                if (!window._handlingCut) {
                    e.preventDefault();
                    window._handlingCut = true;
                    try {
                        window.copyEl(true);
                    } finally {
                        window._handlingCut = false;
                    }
                }
            }
        }
    }, true);

    // --- 3. MULTI-ITEM PASTE ---
    window.pasteEl = function(inPlace = false) {
        // First check if we have our new array of copied elements
        if (state.copiedElements && state.copiedElements.length > 0) {
            
            if (typeof window.deselect === 'function') window.deselect();
            state.multiSelected = [];

            state.copiedElements.forEach((originalClone) => {
                // Clone the clone so we can paste multiple times in a row
                const n = originalClone.cloneNode(true);
                
                if (!inPlace) {
                    // Shift it down and right by 20px so it doesn't perfectly overlap
                    const currentLeft = parseFloat(n.style.left) || 0;
                    const currentTop = parseFloat(n.style.top) || 0;
                    n.style.left = (currentLeft + 20) + 'px';
                    n.style.top = (currentTop + 20) + 'px';
                }
                
                // Add to paper
                const paper = document.getElementById('paper');
                if (paper) paper.appendChild(n);

                // Add to multi-select array
                state.multiSelected.push(n);
                n.classList.add('selected');
            });

            // Update the master copied elements to the NEW positions so if they paste AGAIN, it cascades!
            state.copiedElements = state.multiSelected.map(el => el.cloneNode(true));

            // Update UI based on how many were pasted
            if (state.multiSelected.length === 1) {
                window.selectElement(state.multiSelected[0]);
                state.multiSelected = [];
            } else if (state.multiSelected.length > 1) {
                const status = document.getElementById('status-msg');
                if (status) status.innerText = state.multiSelected.length + " Elements Selected";
                const ft = document.getElementById('float-toolbar');
                if (ft) ft.style.display = 'none';
            }

            if (typeof updateThumbnails === 'function') updateThumbnails();
            if (typeof pushHistory === 'function') pushHistory();
        } 
        // Fallback for older single-item copies just in case
        else if (state.copiedEl) {
            const n = state.copiedEl.cloneNode(true);
            if (!inPlace) {
                n.style.left = (parseFloat(n.style.left)+20)+'px';
                n.style.top = (parseFloat(n.style.top)+20)+'px';
            }
            const paper = document.getElementById('paper');
            if(paper) paper.appendChild(n);
            window.selectElement(n);
            state.copiedEl = n.cloneNode(true); // Cascade
            if(typeof updateThumbnails === 'function') updateThumbnails();
            if(typeof pushHistory === 'function') pushHistory();
        }
    };
/* =========================================================================
   V65.0 - TRUE MULTI-COPY KEYBOARD OVERRIDE
   Fixes the Ctrl+C and Ctrl+V shortcuts ignoring multi-selected arrays.
   ========================================================================= */
(function installV65TrueMultiCopy() {
    console.log("🛠️ V65.0 True Multi-Copy Override initializing...");

    window.addEventListener('keydown', function(e) {
        const activeEl = document.activeElement;
        const isTextEditing = activeEl && (activeEl.isContentEditable || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

        // --- 1. OVERRIDE CTRL + C ---
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
            const sel = window.getSelection();
            const hasTextSelection = sel && sel.rangeCount > 0 && !sel.isCollapsed;

            // If the user is in text editing mode (cursor inside a text box, black border)
            // AND they have text highlighted - let the browser copy the text normally.
            if (isTextEditing && hasTextSelection) return;

            // Otherwise (element selected with no text highlighted, or black-border mode
            // with nothing selected) - copy the whole element.
            if (state.selectedEl || (state.multiSelected && state.multiSelected.length > 0)) {
                e.preventDefault();
                e.stopImmediatePropagation(); // Kill the original broken shortcut
                
                if (typeof window.copyEl === 'function') window.copyEl();
            }
        }

        // Ctrl+V override removed to allow native paste events to handle it properly
    }, true); // 'true' runs this in the Capture Phase, beating the old code to the punch!

    // --- 3. NATIVE COPY SYNC ---
    document.addEventListener('copy', function(e) {
        const active = document.activeElement;
        if (active && (active.isContentEditable || active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
                if (typeof state !== 'undefined') {
                    state.copiedText = sel.toString();
                    
                    try {
                        const range = sel.getRangeAt(0);
                        const div = document.createElement('div');
                        div.appendChild(range.cloneContents());
                        let wrapperHtml = div.innerHTML;
                        
                        let node = range.commonAncestorContainer;
                        if (node && node.nodeType === 3) node = node.parentNode;
                        
                        while (node && node !== document.body && node.getAttribute && node.getAttribute('contenteditable') !== 'true' && !node.classList.contains('text-content')) {
                            const clone = node.cloneNode(false);
                            clone.innerHTML = wrapperHtml;
                            wrapperHtml = clone.outerHTML;
                            node = node.parentNode;
                        }
                        
                        state.copiedHtml = wrapperHtml;
                    } catch (err) {
                        state.copiedHtml = null;
                        console.warn("Failed to capture HTML copy", err);
                    }
                    
                    state.copiedElements = [];
                }
            }
        }
    });
})();
    // --- 4. MULTI-ITEM DELETE OVERRIDE ---
    // Make sure hitting Delete or Backspace clears the whole group safely
    const oldDelete = window.deleteSelected;
    window.deleteSelected = function() {
        if (state.multiSelected && state.multiSelected.length > 0) {
            state.multiSelected.forEach(el => {
                if(el && el.remove) el.remove();
            });
            state.multiSelected = [];
            if(typeof updateThumbnails === 'function') updateThumbnails();
            if(typeof pushHistory === 'function') pushHistory();
            const ft = document.getElementById('float-toolbar');
            if (ft) ft.style.display = 'none';
            const status = document.getElementById('status-msg');
            if (status) status.innerText = "Ready";
        } else if (oldDelete) {
            oldDelete();
        }
    };

})();


(function initializeUniversalPaste() {
    setTimeout(() => {
        try {
            const ribbonButtons = document.querySelectorAll('.paste-btn, .copy-btn, [title="Paste"], [title="Copy"], [id*="paste"], [id*="copy"]');
            ribbonButtons.forEach(button => {
                button.addEventListener('mousedown', (e) => { e.preventDefault(); });
            });
        } catch (e) {}
    }, 1000);

    window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
            const activeEl = document.activeElement;
            const isTextEditing = activeEl && (activeEl.isContentEditable || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.closest('[contenteditable="true"]'));
            if (isTextEditing) return; 

            const originalPrevent = e.preventDefault;
            e.preventDefault = function() { }; // Swallow the preventDefault to force a native paste
        }
    }, true); 

    window.addEventListener('paste', function(e) {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.isContentEditable || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.closest('[contenteditable="true"]'))) return; 

        try {
            const clipboardData = e.clipboardData || window.clipboardData;
            if (!clipboardData) return;
            
            // 1. Check if it's an image first. If it is, it's external (we don't write images to clipboard internally).
            // Let it fall through to smart-images.js
            if (clipboardData.items) {
                for (let i = 0; i < clipboardData.items.length; i++) {
                    if (clipboardData.items[i].type.startsWith('image/')) {
                        return; // Bypass internal text check because an image was explicitly copied
                    }
                }
            }
            
            // 2. Check if the clipboard contains our internal copy marker
            const text = clipboardData.getData('text/plain');
            if (text === "openpublisher_internal_multi") {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (typeof window.pasteEl === 'function') window.pasteEl();
                return;
            }
            
        } catch (err) { console.error("Ghost Hook paste routing failed:", err); }
    }, true); 
})();


;(function upgradeFloatingToolbar() { 
    // Initialize WeakMap to securely bind position data to DOM elements (prevents memory leaks)
    window._floatMem = window._floatMem || new WeakMap();

    const floatBar = document.getElementById('float-toolbar');
    if (!floatBar) return;
    floatBar.style.display = 'none';

    // --- 1. DOM PREPARATION ---
    // Detach critical dropdown elements to prevent reference errors before HTML replacement
    const fontDropdownList = document.getElementById('float-font-list');
    if (fontDropdownList) fontDropdownList.remove(); 

    // --- 2. CSS STYLESHEET INJECTION ---
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // Custom Size Dropdown Logic
    window.toggleFloatSizeDropdown = function() {
        const menu = document.getElementById('float-size-list');
        const isVisible = menu && menu.style.display === 'block';
        document.querySelectorAll('.custom-dropdown').forEach(d => d.style.display = 'none');
        if (!isVisible && menu) {
            menu.style.display = 'block';
            menu.style.top = '24px';
            menu.style.bottom = 'auto';
            const rect = menu.getBoundingClientRect();
            if (rect.bottom > window.innerHeight - 10) {
                menu.style.top = 'auto';
                menu.style.bottom = '24px';
            }
        }
    };

    // Custom Font Dropdown Logic
    window.toggleFloatFontDropdown = function() {
        const menu = document.getElementById('float-font-list');
        const isVisible = menu && menu.style.display === 'block';
        document.querySelectorAll('.custom-dropdown').forEach(d => d.style.display = 'none');
        if (!isVisible && menu) {
            if (typeof window.updateDocumentFontsSection === 'function') {
                window.updateDocumentFontsSection();
            }
            menu.style.display = 'block';
            menu.style.top = '28px';
            menu.style.bottom = 'auto';
            const rect = menu.getBoundingClientRect();
            if (rect.bottom > window.innerHeight - 10) {
                menu.style.top = 'auto';
                menu.style.bottom = '28px';
            }
        }
    };
    
    window.selectFloatSize = function(sizeStr) {
        const lbl = document.getElementById('float-size-label');
        if(lbl) lbl.innerText = parseInt(sizeStr);
        if(typeof setTrueFontSize === 'function') setTrueFontSize(sizeStr);
        const menu = document.getElementById('float-size-list');
        if(menu) menu.style.display = 'none';
    };

    // --- 3. UI TEMPLATE INJECTION ---
    floatBar.innerHTML = `<div class="float-drag-grip" id="float-drag-handle" title="Drag to move">
            <div class="grip-dots">
                <span></span><span></span>
                <span></span><span></span>
                <span></span><span></span>
            </div>
        </div>
        
        <div class="float-tools-col">
            <div class="float-tool-row">
                <div class="float-input-group">
                    <div class="float-font-btn" id="float-font" onclick="toggleFloatFontDropdown(); event.stopPropagation();">
                        <span id="float-font-label" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Segoe UI</span>
                        <div class="drop-arrow"><i class="fas fa-chevron-down"></i></div>
                    </div>
                    <div class="float-size-wrapper">
                        <div class="float-font-btn" id="float-size-btn" onclick="toggleFloatSizeDropdown(); event.stopPropagation();" style="width: 60px;">
                            <span id="float-size-label">16</span>
                            <div class="drop-arrow"><i class="fas fa-chevron-down"></i></div>
                        </div>
                        <div class="custom-dropdown" id="float-size-list" style="display:none; position:absolute; top:24px; left:0; width:60px; z-index:10000;">
                            <div class="float-size-item" onclick="selectFloatSize('8px'); event.stopPropagation();">8</div>
                            <div class="float-size-item" onclick="selectFloatSize('9px'); event.stopPropagation();">9</div>
                            <div class="float-size-item" onclick="selectFloatSize('10px'); event.stopPropagation();">10</div>
                            <div class="float-size-item" onclick="selectFloatSize('11px'); event.stopPropagation();">11</div>
                            <div class="float-size-item" onclick="selectFloatSize('12px'); event.stopPropagation();">12</div>
                            <div class="float-size-item" onclick="selectFloatSize('14px'); event.stopPropagation();">14</div>
                            <div class="float-size-item" onclick="selectFloatSize('16px'); event.stopPropagation();">16</div>
                            <div class="float-size-item" onclick="selectFloatSize('18px'); event.stopPropagation();">18</div>
                            <div class="float-size-item" onclick="selectFloatSize('20px'); event.stopPropagation();">20</div>
                            <div class="float-size-item" onclick="selectFloatSize('24px'); event.stopPropagation();">24</div>
                            <div class="float-size-item" onclick="selectFloatSize('28px'); event.stopPropagation();">28</div>
                            <div class="float-size-item" onclick="selectFloatSize('32px'); event.stopPropagation();">32</div>
                            <div class="float-size-item" onclick="selectFloatSize('36px'); event.stopPropagation();">36</div>
                            <div class="float-size-item" onclick="selectFloatSize('48px'); event.stopPropagation();">48</div>
                            <div class="float-size-item" onclick="selectFloatSize('72px'); event.stopPropagation();">72</div>
                            <div class="float-size-item" onclick="selectFloatSize('80px'); event.stopPropagation();">80</div>
                            <div class="float-size-item" onclick="selectFloatSize('96px'); event.stopPropagation();">96</div>
                            <div class="float-size-item" onclick="selectFloatSize('110px'); event.stopPropagation();">110</div>
                            <div class="float-size-item" onclick="selectFloatSize('120px'); event.stopPropagation();">120</div>
                            <div class="float-size-item" onclick="selectFloatSize('130px'); event.stopPropagation();">130</div>
                            <div class="float-size-item" onclick="selectFloatSize('144px'); event.stopPropagation();">144</div>
                            <div class="float-size-item" onclick="selectFloatSize('160px'); event.stopPropagation();">160</div>
                            <div class="float-size-item" onclick="selectFloatSize('200px'); event.stopPropagation();">200</div>
                            <div class="float-size-item" onclick="selectFloatSize('256px'); event.stopPropagation();">256</div>
                        </div>
                    </div>
                </div>
                
                <div class="float-divider"></div>
                
                <div class="float-mini-btn float-color-btn" title="Text Color" onclick="CustomColorPicker.open(this, document.getElementById('float-text-color-bar').style.backgroundColor || '#004d40', (c) => { document.getElementById('float-text-color-bar').style.background=c; execCmd('foreColor', c); })">
                    <strong style="font-family: Arial, sans-serif;">A</strong>
                    <div class="float-color-bar" id="float-text-color-bar" style="background: #004d40;"></div>
                </div>

                <div class="float-mini-btn float-color-btn" title="Highlight Color" onclick="CustomColorPicker.open(this, document.getElementById('float-bg-color-bar').style.backgroundColor || '#ffff00', (c) => { document.getElementById('float-bg-color-bar').style.background=c; execCmd('hiliteColor', c); })">
                    <i class="fas fa-marker" style="transform: rotate(-15deg); font-size: 13px;"></i>
                    <div class="float-color-bar" id="float-bg-color-bar" style="background: #ffff00;"></div>
                </div>

                <div class="float-divider"></div>

                <div class="float-mini-btn" onclick="execCmd('removeFormat')" title="Clear Formatting"><i class="fas fa-eraser"></i></div>

                <div class="float-divider"></div>

                <div class="float-mini-btn" onclick="bringFront()" title="Bring to Front">
                    <div class="arrange-icon-wrapper">
                        <i class="fas fa-layer-group"></i>
                        <i class="fas fa-arrow-up arrange-arrow"></i>
                    </div>
                </div>
                <div class="float-mini-btn" onclick="sendBack()" title="Send to Back">
                    <div class="arrange-icon-wrapper">
                        <i class="fas fa-layer-group"></i>
                        <i class="fas fa-arrow-down arrange-arrow"></i>
                    </div>
                </div>
            </div>

            <div class="float-tool-row">
                <div class="float-mini-btn" id="float-bold-btn" onclick="execCmd('bold')" title="Bold"><strong>B</strong></div>
                <div class="float-mini-btn" id="float-italic-btn" onclick="execCmd('italic')" title="Italic"><strong><em>I</em></strong></div>
                <div class="float-mini-btn" id="float-underline-btn" onclick="execCmd('underline')" title="Underline"><strong style="text-decoration: underline;">U</strong></div>
                <div class="float-mini-btn" id="float-strikethrough-btn" onclick="execCmd('strikeThrough')" title="Strikethrough"><strong style="text-decoration: line-through;">S</strong></div>
                
                <div class="float-divider"></div>
                
                <div class="float-mini-btn" onclick="execCmd('subscript')" title="Subscript"><strong style="font-family: Arial, sans-serif; font-size: 13px;">X<sub>1</sub></strong></div>
                <div class="float-mini-btn" onclick="execCmd('superscript')" title="Superscript"><strong style="font-family: Arial, sans-serif; font-size: 13px;">X<sup>1</sup></strong></div>

                <div class="float-divider"></div>

                <div class="float-mini-btn" onclick="execCmd('justifyLeft')" title="Align Left"><i class="fas fa-align-left"></i></div>
                <div class="float-mini-btn" onclick="execCmd('justifyCenter')" title="Align Center"><i class="fas fa-align-center"></i></div>
                <div class="float-mini-btn" onclick="execCmd('justifyRight')" title="Align Right"><i class="fas fa-align-right"></i></div>

                <div class="float-divider"></div>

                <div class="float-mini-btn" onclick="execCmd('insertUnorderedList')" title="Bullet List"><i class="fas fa-list-ul"></i></div>
                <div class="float-mini-btn" onclick="execCmd('insertOrderedList')" title="Numbered List"><i class="fas fa-list-ol"></i></div>
            </div>
        </div>`;

    // Restore rescued elements
    if (fontDropdownList) {
        const fGroup = floatBar.querySelector('.float-input-group');
        if(fGroup) {
            fontDropdownList.style.top = '28px';
            fontDropdownList.style.left = '0px';
            fGroup.appendChild(fontDropdownList);
        } else {
            floatBar.appendChild(fontDropdownList);
        }
    }

    // --- 4. INTERACTION LOGIC: DRAGGING & MEMORY ---
    const handle = document.getElementById('float-drag-handle');
    let isDragging = false;
    let dragStartX, dragStartY;
    let initialLeft, initialTop;

    if (handle) {
        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault(); 
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            
            // Convert any transform/bottom based positioning into absolute top/left so drag works smoothly
            const fbRect = floatBar.getBoundingClientRect();
            floatBar.style.bottom = 'auto';
            floatBar.style.transform = 'none';
            floatBar.style.left = fbRect.left + 'px';
            floatBar.style.top = fbRect.top + 'px';
            
            initialLeft = fbRect.left;
            initialTop = fbRect.top;
            document.body.style.cursor = 'grabbing';
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        floatBar.style.left = (initialLeft + dx) + 'px';
        floatBar.style.top = (initialTop + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = 'default';
            
            // Store the exact screen coordinates instead of relative to object
            const fbRect = floatBar.getBoundingClientRect();
            window._globalFloatPos = {
                top: fbRect.top,
                left: fbRect.left
            };
        }
    });

    // Prevent standard UI tools from stealing DOM focus
    floatBar.addEventListener('mousedown', function(e) {
        const tag = e.target.tagName.toUpperCase();
        if (tag === 'INPUT' || tag === 'SELECT') return;
        e.preventDefault(); 
    }, true);

    // --- 5. POSITION LOADER ---
    if (typeof window.showFloatToolbar === 'function' && !window._floatPosPatchedV88) {
        const originalShowFloat = window.showFloatToolbar;
        
        window.showFloatToolbar = function() {
            originalShowFloat.apply(this, arguments);
            // We no longer manually position floatBar here because it is docked by default or uses global dragged pos
        };
        window._floatPosPatchedV88 = true;
    }
    
    // --- 6. FONT SIZE SYNCING ---
    if (typeof window.updateFloatToolbarValues === 'function' && !window._floatUpdatePatchedV88) {
        const originalUpdateFloatValues = window.updateFloatToolbarValues;
        window.updateFloatToolbarValues = function() {
            try { originalUpdateFloatValues.apply(this, arguments); } catch (err) {}
            const ribbonSize = document.getElementById('font-size');
            if (ribbonSize) {
                const szFloatLabel = document.getElementById('float-size-label');
                if (szFloatLabel) szFloatLabel.innerText = ribbonSize.value;
            }
        };
        window._floatUpdatePatchedV88 = true;
    }

})();


;(function installGranularUndoProtector() {
    console.log("🛠️ V91.0 Granular Text Undo Protector initializing...");

    // WeakMap securely binds the history array directly to the DOM element 
    const TextHistory = new WeakMap();

    // Fetches or creates the history stack for the active text box
    function getHist(el) {
        if (!TextHistory.has(el)) {
            TextHistory.set(el, { 
                undo: [], 
                redo: [], 
                isRestoring: false, 
                lastState: el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.innerHTML 
            });
        }
        return TextHistory.get(el);
    }

    window.clearTextHistory = function(el) {
        if (el && TextHistory.has(el)) {
            const hist = TextHistory.get(el);
            hist.undo = [];
            hist.redo = [];
            hist.lastState = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.innerHTML;
        }
    };

    window._opSyncTextUndoBefore = function(el) {
        if (!el) return false;
        const hist = getHist(el);
        const cur = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') ? el.value : el.innerHTML;
        if (hist.undo.length > 0) {
            hist.undo.push(cur);
            if (hist.undo.length > 200) hist.undo.shift();
            hist.redo = [];
            hist.lastState = cur;
            return true;
        }
        return false;
    };

    window._opSyncTextUndoAfter = function(el) {
        if (!el) return;
        const hist = getHist(el);
        hist.lastState = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') ? el.value : el.innerHTML;
    };

    // Forces the cursor to the end of the text so it doesn't snap to the beginning
    function setCursorToEnd(el) {
        try {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.selectionStart = el.selectionEnd = el.value.length;
            } else {
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(el);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } catch(e) {}
    }

    // --- 1. RECORD EVERY SINGLE KEYSTROKE ---
    document.addEventListener('input', function(e) {
        const el = e.target;
        if (!el || (!el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
        
        const hist = getHist(el);
        if (hist.isRestoring) return; // Don't record our own undo/redo actions

        const currentState = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.innerHTML;
        
        // Save the PREVIOUS state to the undo stack
        hist.undo.push(hist.lastState);
        
        // Cap history at 200 strokes to prevent browser memory bloat
        if (hist.undo.length > 200) hist.undo.shift();
        
        // Clear redo stack because we typed something new
        hist.redo = [];
        
        // Update the tracker to the current state
        hist.lastState = currentState;

    }, true); 
    
    // --- 1.5 COMMIT TO GLOBAL HISTORY ON BLUR ---
    document.addEventListener('focusout', function(e) {
        const el = e.target;
        if (!el || (!el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
        
        const hist = getHist(el);
        if (hist.undo.length > 0 && !hist.isRestoring) {
            // We finished editing. Commit the final text block to the app's global history.
            if (typeof window.pushHistory === 'function') window.pushHistory();
            
            // Clear the local character-by-character history so the next Ctrl+Z triggers a global undo
            hist.undo = [];
            hist.redo = [];
        }
    });

    // --- 2. INTERCEPT CTRL+Z AND APPLY EXACT PREVIOUS STATE ---
    document.addEventListener('keydown', function(e) {
        if (window.isDrawingModeActive && window.isDrawingModeActive()) return;
        const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey;
        const isRedo = (e.ctrlKey || e.metaKey) && ((e.key.toLowerCase() === 'y') || (e.key.toLowerCase() === 'z' && e.shiftKey));
        
        if (isUndo || isRedo) {
            const el = document.activeElement;
            if (!el || (!el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
            
            // 🛑 SHIELD ACTIVATED: Stop the app and the browser entirely
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const hist = getHist(el);
            
            if (isUndo && hist.undo.length > 0) {
                hist.isRestoring = true; // Lock the recorder
                
                const currentState = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.innerHTML;
                hist.redo.push(currentState); // Save current so we can redo it
                
                const prevState = hist.undo.pop(); // Grab exact previous keystroke
                
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.value = prevState;
                } else {
                    el.innerHTML = prevState;
                }
                
                hist.lastState = prevState;
                setCursorToEnd(el);
                
                // Release the lock
                setTimeout(() => hist.isRestoring = false, 10);
            } 
            else if (isUndo && hist.undo.length === 0) {
                if (typeof window.undo === 'function') {
                    window.undo();
                } else if (typeof undo === 'function') {
                    undo();
                }
            }
            else if (isRedo && hist.redo.length > 0) {
                hist.isRestoring = true; 
                
                const currentState = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.innerHTML;
                hist.undo.push(currentState);
                
                const nextState = hist.redo.pop();
                
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.value = nextState;
                } else {
                    el.innerHTML = nextState;
                }
                
                hist.lastState = nextState;
                setCursorToEnd(el);
                
                setTimeout(() => hist.isRestoring = false, 10);
            }
            else if (isRedo && hist.redo.length === 0) {
                if (typeof window.redo === 'function') {
                    window.redo();
                } else if (typeof redo === 'function') {
                    redo();
                }
            }
        }
    }, true);
})();


(function installMasterFormattingFix() {
    console.log("🛠️ V70.0 Master Formatting & Drag-Lock Fix initializing...");

    // --- 1. THE FOCUS SHIELD ---
    document.addEventListener('mousedown', function(e) {
        if (e.target.closest('.ribbon-container')) {
            const tag = e.target.tagName.toUpperCase();
            if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
            e.preventDefault();
        }
    }, true); 

    // --- 2. THE COMMAND UPGRADE ---
    if (typeof window.execCmd === 'function' && !window._execCmdPatched) {
        const originalExecCmd = window.execCmd;
        window.execCmd = function(cmd, val) {
            const activeEl = document.activeElement;
            const isTextEditing = activeEl && activeEl.isContentEditable;

            if (!isTextEditing && typeof state !== 'undefined' && state.lastRange && state.selectedEl && state.lastRange.commonAncestorContainer && state.selectedEl.contains(state.lastRange.commonAncestorContainer)) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(state.lastRange);
            }
            originalExecCmd.apply(this, arguments);
        };
        window._execCmdPatched = true;
    }

    // --- 3. THE TRIPLE-CLICK & DRAG-LOCK PROTECTOR ---
    document.addEventListener('mouseup', function(e) {
        // ✨ THE FIX: If the app is actively dragging/resizing a box, DO NOT intercept! 
        // Let the app's native handleMouseUp fire so it releases the element.
        if (typeof state !== 'undefined' && state.dragMode) {
            return; 
        }

        // Otherwise, protect the text highlight from being wiped out
        if (e.target.closest('.element-content') && !e.target.classList.contains('resize-handle') && !e.target.classList.contains('rotate-handle')) {
            const sel = window.getSelection();
            if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
                e.stopImmediatePropagation();
            }
        }
    }, true); 

    // --- 4. THE BULLETPROOF FONT SIZE ENGINE ---
    if (typeof window.setTrueFontSize !== 'undefined') {
        const getEditableHostNode = (node) => {
            if (!node || !node.isConnected) return null;
            const el = node.nodeType === 3 ? node.parentNode : node;
            if (!el || !el.closest) return null;
            const ed = el.closest('[contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"]');
            return (ed && ed.closest('#paper')) ? ed : null;
        };

        const isValidRangeInEl = (range, root) => {
            if (!range || !root) return false;
            const startNode = range.startContainer;
            const endNode = range.endContainer;
            if (!startNode || !endNode || !startNode.isConnected || !endNode.isConnected) return false;
            const startEl = startNode.nodeType === 3 ? startNode.parentNode : startNode;
            const endEl = endNode.nodeType === 3 ? endNode.parentNode : endNode;
            return !!(startEl && endEl && root.contains(startEl) && root.contains(endEl));
        };

        const isLivePaperEditableRange = (range) => {
            if (!range) return false;
            const startEd = getEditableHostNode(range.startContainer);
            const endEd = getEditableHostNode(range.endContainer);
            return !!(startEd && endEd && startEd === endEd);
        };

        const findEditableHost = (range, root) => {
            const walkForEditable = (startNode) => {
                let cur = startNode && startNode.nodeType === 3 ? startNode.parentNode : startNode;
                while (cur && cur !== root) {
                    if (cur.nodeType === 1 && cur.getAttribute && cur.getAttribute('contenteditable') === 'true') {
                        return cur;
                    }
                    cur = cur.parentNode;
                }
                return null;
            };
            if (range) {
                const found = (root ? walkForEditable(range.commonAncestorContainer) || walkForEditable(range.startContainer) : null) ||
                              getEditableHostNode(range.startContainer);
                if (found) return found;
            }
            if (!root) return null;
            return root.querySelector('[contenteditable="true"]') ||
                   root.querySelector('.element-content > div') ||
                   root.querySelector('.element-content');
        };

        if (!window._fontSizeRangeCaptureInstalled) {
            window._fontSizeRangeCaptureInstalled = true;

            const snapshotEditableSelection = (allowCollapsed) => {
                if (typeof state === 'undefined' || state.isProgrammaticUpdate) return;
                const sel = window.getSelection();
                if (!sel || sel.rangeCount === 0) return;
                if (!allowCollapsed && sel.isCollapsed) return;
                const r = sel.getRangeAt(0);
                if (isLivePaperEditableRange(r)) {
                    state.lastRange = r.cloneRange();
                }
            };

            const preBlurSnapshot = (e) => {
                if (!e || !e.target || !e.target.closest) return;
                if (!e.target.closest('#paper') || e.target.closest('input, select, .modern-spinner, .spin-btns, #float-toolbar, #float-size-btn, .ribbon-container, .custom-dropdown')) {
                    snapshotEditableSelection(false);
                }
            };

            document.addEventListener('pointerdown', preBlurSnapshot, true);
            document.addEventListener('mousedown', preBlurSnapshot, true);
            document.addEventListener('selectionchange', () => {
                if (window._opBootSelectionChangeActive) return;
                const active = document.activeElement;
                if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) return;
                snapshotEditableSelection(true);
            });
        }

        let _inSetTrueFontSize = false;
        window.setTrueFontSize = function(val) {
            if (_inSetTrueFontSize || !val) return;
            const parsedNum = parseFloat(val);
            if (isNaN(parsedNum) || parsedNum <= 0) return;

            const activeInput = document.activeElement;
            const liveSelPre = window.getSelection();
            const liveRangePre = (liveSelPre && liveSelPre.rangeCount > 0) ? liveSelPre.getRangeAt(0) : null;
            const hasLivePaperNonCollapsed = isLivePaperEditableRange(liveRangePre) && !liveRangePre.collapsed;

            if (!state.selectedEl && !hasLivePaperNonCollapsed && !(isLivePaperEditableRange(state.lastRange) && !state.lastRange.collapsed)) {
                return;
            }

            _inSetTrueFontSize = true;

            if (window._fontSizeProgTimer) {
                clearTimeout(window._fontSizeProgTimer);
                window._fontSizeProgTimer = null;
            }
            state.isProgrammaticUpdate = true;

            try {
                const waText = state.selectedEl ? state.selectedEl.querySelector('.wa-text') : null;

                if (waText) {
                    waText.style.fontSize = val;
                    waText.style.transform = 'none';
                    state.selectedEl.style.width = (waText.offsetWidth + 8) + 'px';
                    state.selectedEl.style.height = (waText.offsetHeight + 8) + 'px';
                    if (typeof syncWordArt === 'function') syncWordArt(state.selectedEl);
                } else {
                    const selEl = state.selectedEl;
                    const liveValid = isValidRangeInEl(liveRangePre, selEl);
                    const savedValid = isValidRangeInEl(state.lastRange, selEl);
                    const savedInPaperEditable = isLivePaperEditableRange(state.lastRange);

                    let targetRange = null;
                    if (liveValid && !liveRangePre.collapsed) {
                        targetRange = liveRangePre.cloneRange();
                    } else if (savedValid && !state.lastRange.collapsed) {
                        targetRange = state.lastRange.cloneRange();
                    } else if (hasLivePaperNonCollapsed) {
                        targetRange = liveRangePre.cloneRange();
                    } else if (savedInPaperEditable && !state.lastRange.collapsed) {
                        targetRange = state.lastRange.cloneRange();
                    } else if (liveValid) {
                        targetRange = liveRangePre.cloneRange();
                    } else if (savedValid) {
                        targetRange = state.lastRange.cloneRange();
                    } else if (!selEl && isLivePaperEditableRange(liveRangePre)) {
                        targetRange = liveRangePre.cloneRange();
                    }

                    const editableContent = findEditableHost(targetRange, selEl);
                    const validationRoot = editableContent || selEl;

                    if (editableContent) {
                        const wasCollapsed = !targetRange || targetRange.collapsed;
                        const activeIsControl = !!(activeInput && (activeInput.tagName === 'INPUT' || activeInput.tagName === 'TEXTAREA' || activeInput.tagName === 'SELECT'));
                        if (typeof window._opSyncTextUndoBefore === 'function') window._opSyncTextUndoBefore(editableContent);
                        if (typeof pushHistory === 'function') pushHistory(true);

                        const sel = window.getSelection();
                        let res = { fontTags: [], firstText: null, lastText: null };
                        if (typeof window.applyPureFontSizeToEditable === 'function') {
                            res = window.applyPureFontSizeToEditable(editableContent, targetRange, val, wasCollapsed);
                        }

                        if (!wasCollapsed && res.firstText && res.lastText) {
                            const rebuilt = document.createRange();
                            rebuilt.setStart(res.firstText, 0);
                            rebuilt.setEnd(res.lastText, res.lastText.length);
                            state.lastRange = rebuilt.cloneRange();
                            if (!activeIsControl && sel) {
                                sel.removeAllRanges();
                                sel.addRange(rebuilt);
                            }
                        } else if (wasCollapsed && !activeIsControl && sel) {
                            sel.removeAllRanges();
                        }

                        if (typeof window._opSyncTextUndoAfter === 'function') {
                            window._opSyncTextUndoAfter(editableContent);
                        }
                    }
                }

                if (activeInput && (activeInput.id === 'font-size' || activeInput.id === 'ctx-font-size-text' || activeInput.id === 'ctx-font-size-wa') && typeof window.clearTextHistory === 'function') {
                    window.clearTextHistory(activeInput);
                }

                const numVal = parseInt(val);
                const floatSelect = document.getElementById('float-size');
                const floatSizeLabel = document.getElementById('float-size-label');
                const ribbonInput = document.getElementById('font-size');
                const ctxRibbonInput = document.getElementById('ctx-font-size-text');
                const ctxWaInput = document.getElementById('ctx-font-size-wa');

                if (ribbonInput && !isNaN(numVal)) ribbonInput.value = numVal;
                if (ctxRibbonInput && !isNaN(numVal)) ctxRibbonInput.value = numVal;
                if (ctxWaInput && waText && !isNaN(numVal)) ctxWaInput.value = numVal;
                if (floatSizeLabel && !isNaN(numVal)) floatSizeLabel.innerText = numVal;

                if (floatSelect && !isNaN(numVal)) {
                    let optionExists = Array.from(floatSelect.options).some(opt => parseInt(opt.value) === numVal);
                    if (!optionExists) {
                        const newOpt = document.createElement('option');
                        newOpt.value = numVal;
                        newOpt.innerText = numVal;
                        floatSelect.appendChild(newOpt);
                    }
                    floatSelect.value = numVal;
                }

                if (typeof pushHistory === 'function') pushHistory(true);
            } finally {
                _inSetTrueFontSize = false;
                window._fontSizeProgTimer = setTimeout(() => {
                    state.isProgrammaticUpdate = false;
                    window._fontSizeProgTimer = null;
                }, 100);
            }
        };
    }
})();


(function applyGroupDragFix() {
    const style = document.createElement('style');
    
    // NOTE: If your group box uses a different class name than "op-group", 
    // just change it in the line below!
    // CSS extracted to style.css
    document.head.appendChild(style);
})();


(function applyUIFixes() {

    // 1. SELECT ALL REDEMPTION
    // Restores functionality to the ribbon button without breaking multi-select
    window.selectAllElements = function() {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', ctrlKey: true, bubbles: true }));
    };

    // 2. THE "ANTI-FREEZE" SAFETY NET
    // Prevents the Uncaught TypeError that locks your mouse if deselect fails
    if (typeof window.deselect === 'function') {
        const originalDeselect = window.deselect;
        window.deselect = function() {
            // If the app tries to deselect something that isn't there, catch it safely
            if (state && state.selectedEl && !state.selectedEl.classList) {
                if (Array.isArray(state.selectedEl)) {
                    state.selectedEl.forEach(el => {
                        if (el && el.classList) el.classList.remove('selected', 'active');
                    });
                }
                state.selectedEl = null;
            }
            try { 
                originalDeselect(); 
            } catch (e) { 
                console.warn("OpenPublisher: Suppressed deselect crash.");
            }
        };
    }

})();


(function disableGroupingSafely() {

    // 1. The Explanatory Modal (Using your native DialogSystem)
    function showGroupingMaintenanceModal() {
        if (typeof DialogSystem !== 'undefined') {
            DialogSystem.show(
                '<i class="fas fa-exclamation-triangle" style="color: #ffffff;"></i>&nbsp; Grouping Disabled',
                `<div style="text-align: left; line-height: 1.5;">
                    <p>The grouping feature has been disabled.</p>
                    <p>Grouping elements currently conflicts with the <b>Undo</b> function, which can result in duplicated or oversized images appearing on the canvas.</p>
                    <hr style="border: 0; border-top: 1px solid #e1dfdd; margin: 15px 0;">
                    <p><b>Workaround:</b></p>
                    <p>You can still <b>move</b> and <b>rotate</b> multiple items at the same time. Just <b>click and drag a selection box</b> over the items you want (or hold <b>Ctrl / Command</b> while clicking them) to manipulate them together.</p>
                </div>`,
                null, 
                true // Setting isAlert = true hides the cancel button, just showing "OK"
            );
        } else {
            // Failsafe just in case the DialogSystem isn't loaded
            alert("Grouping is disabled due to an Undo bug. Use click-and-drag multi-select or Ctrl/Cmd + Click to move or rotate items together.");
        }
    }

    // 2. Intercept the core engine functions so they trigger the modal
    window.groupItems = showGroupingMaintenanceModal;
    
    if (typeof ContextRibbonActions !== 'undefined') {
        ContextRibbonActions.toggleGroup = showGroupingMaintenanceModal;
    }

    // 3. Ensure the Ribbon Button is safely hooked up
    setTimeout(() => {
        const picTab = document.getElementById('ribbon-picture');
        if (!picTab) return;
        
        let groupBtn = document.getElementById('op-global-group-tab-btn');
        
        if (!groupBtn) {
            const arrangeGroup = Array.from(picTab.querySelectorAll('.group')).find(g => g.innerHTML.includes('Arrange')) || picTab.querySelector('.group:last-child');
            if (!arrangeGroup) return;

            groupBtn = document.createElement('div');
            groupBtn.id = 'op-global-group-tab-btn';
            groupBtn.className = 'tool-btn'; 
            groupBtn.innerHTML = '<i class="fas fa-object-group"></i>Group';
            
            const label = arrangeGroup.querySelector('.group-label');
            if (label) arrangeGroup.insertBefore(groupBtn, label);
            else arrangeGroup.appendChild(groupBtn);
        }

        // Override the click event to strictly show the modal
        groupBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            showGroupingMaintenanceModal();
        };
    }, 1500);

})();





(function fixClipartLag() {
    
    // Intercept the native Clipart button function
    if (typeof window.showClipartModal === 'function' && !window.showClipartModal.isLagFixed) {
        const originalShowClipart = window.showClipartModal;
        let isClipartLoaded = false;
        
        window.showClipartModal = function(...args) {
            
            // 1. If the clipart hasn't been generated yet, do it NOW
            if (!isClipartLoaded && typeof window.initClipart === 'function') {
                window.initClipart();
                isClipartLoaded = true; // Mark it as done so it doesn't rebuild every click
            }

            // 2. Open the modal normally
            originalShowClipart.apply(this, args);
        };
        window.showClipartModal.isLagFixed = true;
    }

})();


;(function installBackgroundDefender() {
    console.log("🛡️ Background Defender Module initializing...");

    // 1. PASSIVE RE-LOCKER (Fixes .opub loading)
    setInterval(() => {
        const paper = document.getElementById('paper');
        if (!paper) return;
        paper.querySelectorAll('.op-theme-container').forEach(container => {
            const wrapper = container.closest('.pub-element');
            if (wrapper) {
                if (wrapper.getAttribute('data-is-theme') !== 'true') {
                    wrapper.setAttribute('data-is-theme', 'true');
                }
                if (wrapper.style.zIndex !== '0') {
                    wrapper.style.zIndex = '0';
                }
                wrapper.classList.remove('selected', 'active-element');
            }
        });
    }, 250);

    // 2. PASSIVE DESELECTION DEFENDER (Prevents Theme Selection)
    const stealthBackgrounds = () => {
        const paper = document.getElementById('paper');
        if (!paper) return;
        paper.querySelectorAll('[data-is-theme="true"]').forEach(el => {
            el.classList.remove('selected', 'active-element');
        });
    };
    
    window.addEventListener('mousedown', stealthBackgrounds, true);
})();


;(function installRealtimeThumbnailDragEngine() { 
    console.log("⚡ v5.8.6: Real-Time Thumbnail Drag Engine initialized.");
    const overlayWrapper = document.getElementById('ts-overlay-wrapper'); 
    if (overlayWrapper) overlayWrapper.remove(); 

    let isTracking = false;
    let rafId = null;

    window.syncRealtimeThumbnailDrag = function() {
        const curIdx = (typeof state !== 'undefined' && state.currentPageIndex !== undefined) ? state.currentPageIndex : 0;
        const activeThumb = document.getElementById('thumb-' + curIdx);
        if (!activeThumb) return;

        let elements = [];
        if (state.multiSelected && state.multiSelected.length > 0) {
            elements = state.multiSelected;
        } else if (state.selectedEl) {
            elements = [state.selectedEl];
        }
        if (elements.length === 0) return;

        const paper = document.getElementById('paper');
        if (!paper) return;

        for (let i = 0; i < elements.length; i++) {
            const cEl = elements[i];
            if (!cEl || !cEl.closest || !cEl.closest('#paper')) continue;

            if (!cEl.id) {
                cEl.id = 'pub-el-' + Math.random().toString(36).substr(2, 9);
            }

            let tEl = activeThumb.querySelector(`[data-target-id="${cEl.id}"]`);
            if (!tEl) {
                const allPaperEls = Array.from(paper.querySelectorAll('.pub-element:not(.master-page-element)'));
                const idx = allPaperEls.indexOf(cEl);
                if (idx !== -1) {
                    const allThumbEls = activeThumb.querySelectorAll('.pub-thumb-element');
                    tEl = allThumbEls[idx];
                    if (tEl) tEl.setAttribute('data-target-id', cEl.id);
                }
            }

            if (tEl) {
                tEl.style.left = cEl.style.left;
                tEl.style.top = cEl.style.top;
                tEl.style.width = cEl.style.width;
                tEl.style.height = cEl.style.height;
                tEl.style.transform = cEl.style.transform || 'none';
                tEl.style.zIndex = cEl.style.zIndex || '10';

                const content = cEl.querySelector('.element-content');
                const thumbScaleBox = tEl.querySelector('.pub-thumb-scalebox') || tEl.firstElementChild;
                if (content && thumbScaleBox) {
                    thumbScaleBox.style.transformOrigin = 'center center';
                    if (content.style.transform) {
                        thumbScaleBox.style.transform = content.style.transform;
                    }
                    const cImg = cEl.querySelector('img');
                    const tImg = thumbScaleBox.querySelector('img');
                    if (cImg && tImg) {
                        const compFit = window.getComputedStyle ? window.getComputedStyle(cImg).objectFit : '';
                        tImg.style.objectFit = cImg.style.objectFit || compFit || 'fill';
                        if (cImg.style.width) tImg.style.width = cImg.style.width;
                        if (cImg.style.height) tImg.style.height = cImg.style.height;
                        if (cImg.style.left) tImg.style.left = cImg.style.left;
                        if (cImg.style.top) tImg.style.top = cImg.style.top;
                    }
                }
            }
        }
    };

    const loop = () => {
        if (!isTracking) return;
        window.syncRealtimeThumbnailDrag();
        rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousedown', (e) => {
        const el = e.target.closest ? e.target.closest('.pub-element, .resize-handle, .rotate-handle') : null;
        if (el) {
            isTracking = true;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(loop);
        }
    }, true);

    window.addEventListener('mousemove', () => {
        if (isTracking || (typeof state !== 'undefined' && state.dragMode)) {
            window.syncRealtimeThumbnailDrag();
        }
    }, true);

    window.addEventListener('mouseup', () => {
        if (isTracking || (typeof state !== 'undefined' && state.dragMode)) {
            isTracking = false;
            if (rafId) cancelAnimationFrame(rafId);
            window.syncRealtimeThumbnailDrag();
        }
    }, true);
})();


;(function installBorderDefenderV5() {
    console.log("🛡️ Border Defender V5 (Shape DNA) initializing...");

    // 1. ABSOLUTE CSS LOCKS & ANTI-FADE
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // 2. THE SHAPE DNA FINDER
    const processBorders = () => {
        const paper = document.getElementById('paper');
        if (!paper) return;
        const paperRect = paper.getBoundingClientRect();

        document.querySelectorAll('.pub-element').forEach(el => {
            // Ignore Background Themes
            if (el.getAttribute('data-is-theme') === 'true' || el.querySelector('.op-theme-container')) return;

            // Check if it's a freshly clicked native border
            if (el.id === 'native-blueprint-border' || el.id === 'native-border-art-border' || el.querySelector('#native-blueprint-border') || el.querySelector('#native-border-art-border') || el.querySelector('.page-border-wrapper')) {
                el.setAttribute('data-is-border', 'true');
                return;
            }

            // Check if it is a loaded border from an .opub save file
            if (el.getAttribute('data-is-border') !== 'true') {
                const rect = el.getBoundingClientRect();
                
                const isFullWidth = rect.width >= (paperRect.width * 0.95);
                const isFullHeight = rect.height >= (paperRect.height * 0.95);
                
                if (isFullWidth && isFullHeight) {
                    // ✨ THE SHAPE DNA FILTER ✨
                    // Based on the native HTML, borders are SVG shapes. Imported documents are not.
                    const isShapeType = el.getAttribute('data-type') === 'shape';
                    const hasSVG = el.querySelector('svg') !== null;
                    const hasNoImages = el.querySelector('img') === null; // Exclude imported docs
                    
                    const isBackZ = el.style.zIndex === '2' || el.style.zIndex === '1' || el.style.zIndex === '0' || !el.style.zIndex;

                    if ((isShapeType || hasSVG) && hasNoImages && isBackZ) {
                        el.setAttribute('data-is-border', 'true');
                    }
                }
            }
        });
    };

    // 3. THE GHOST & ANTI-FADE LOOP
    setInterval(() => {
        processBorders();

        document.querySelectorAll('[data-is-border="true"]').forEach(wrapper => {
            // Strip selection highlights
            wrapper.classList.remove('selected', 'active-element', 'hovered');
            
            // Apply inline CSS locks
            wrapper.style.setProperty('pointer-events', 'none', 'important');
            wrapper.style.setProperty('user-select', 'none', 'important');
            wrapper.style.setProperty('opacity', '1', 'important');
            wrapper.setAttribute('draggable', 'false');
            
            // Lock internal container (from user's HTML snippet)
            const content = wrapper.querySelector('.element-content');
            if (content) content.style.setProperty('pointer-events', 'none', 'important');

            if (wrapper.style.zIndex !== '2') wrapper.style.zIndex = '2';

            // Recursively lock children
            Array.from(wrapper.querySelectorAll('*')).forEach(child => {
                child.setAttribute('draggable', 'false');
                child.style.setProperty('pointer-events', 'none', 'important');
            });

            // Math Spoofer (Ghost Protocol)
            if (!wrapper._ghosted) {
                wrapper._originalGetBoundingClientRect = wrapper.getBoundingClientRect;
                wrapper.getBoundingClientRect = function() {
                    if (document.body.getAttribute('data-stealth-active') === 'true') {
                        return { top: -9999, left: -9999, right: -9999, bottom: -9999, width: 0, height: 0, x: -9999, y: -9999 };
                    }
                    return wrapper._originalGetBoundingClientRect.apply(this, arguments);
                };
                wrapper._ghosted = true;
            }
        });
    }, 200);

    // 4. STEALTH FLAG TOGGLE
    let stealthTimer = null;
    const startStealth = () => { 
        clearTimeout(stealthTimer); 
        document.body.setAttribute('data-stealth-active', 'true'); 
    };
    const stopStealth = () => { 
        document.body.removeAttribute('data-stealth-active'); 
    };

    window.addEventListener('mousedown', startStealth, true);
    window.addEventListener('mousemove', (e) => { if (e.buttons > 0) startStealth(); }, true);
    window.addEventListener('mouseup', () => { stealthTimer = setTimeout(stopStealth, 150); }, true);
    document.addEventListener('mouseleave', () => { stealthTimer = setTimeout(stopStealth, 150); }, true);
    window.addEventListener('beforeprint', stopStealth, true);
    
})();


;(function applyConcaveCradle() { 
    const style = document.createElement('style'); 
    // CSS extracted to style.css 
    document.head.appendChild(style); 
})();



// NOTE: Modern Theme Studio Engine has been extracted to extensions/theme-studio.js (v5.4.8)


;(function upgradeCropHandleSize() {
    console.log("🛠️ V99.0 Unclipped Jumbo Crop Handles (20px) initializing...");
    
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);
})();


;(function installBorderEraserV2_3() {
    console.log("🧹 Border Eraser V2.3 initializing...");

    const injectInterval = setInterval(() => {
        const removeThemeBtn = document.getElementById('ts-clear-theme-btn');
        if (!removeThemeBtn) return; // Wait until the tab renders

        // Prevent duplicates
        if (document.getElementById('ts-clear-border-btn')) {
            clearInterval(injectInterval);
            return;
        }

        // 1. Build the Button Container (Tightened Margins)
        const eraserBtn = document.createElement('div');
        eraserBtn.id = 'ts-clear-border-btn';
        eraserBtn.title = "Remove existing page borders";
        
        eraserBtn.style.cssText = `
            display: inline-flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            height: 73px !important;
            min-width: 50px !important;
            padding: 0 4px !important; /* Reduced padding */
            margin-left: 0px !important; /* Snug up to the left button */
            margin-right: 8px !important; /* Small gap before swatches */
            background: transparent;
            border: 1px solid transparent;
            border-radius: 4px;
            cursor: pointer;
            box-sizing: border-box;
            vertical-align: top;
        `;

        // 2. Build internal elements
        eraserBtn.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 32px; width: 32px; margin-bottom: 2px;">
                <i class="fas fa-border-none" style="font-size: 22px !important; display: block !important;"></i>
            </div>
            <span style="font-size: 11px !important; font-family: 'Segoe UI', sans-serif !important; text-align: center !important; line-height: 1.2 !important; display: block !important; white-space: nowrap;">Remove<br>Border</span>
        `;

        // 3. Re-bind native hover states
        eraserBtn.addEventListener('mouseenter', () => eraserBtn.style.background = 'rgba(0, 0, 0, 0.05)');
        eraserBtn.addEventListener('mouseleave', () => eraserBtn.style.background = 'transparent');
        eraserBtn.addEventListener('mousedown', () => eraserBtn.style.background = 'rgba(0, 0, 0, 0.1)');
        eraserBtn.addEventListener('mouseup', () => eraserBtn.style.background = 'rgba(0, 0, 0, 0.05)');

        // 4. The Purge Logic
        eraserBtn.addEventListener('click', () => {
            console.log("🧹 Executing Border Purge...");
            let purged = false;
            const borders = document.querySelectorAll('#native-blueprint-border, #native-border-art-border, [data-is-border="true"], .page-border-wrapper');
            
            borders.forEach(border => {
                let wrapper = border;
                while (wrapper.parentElement && wrapper.parentElement.id !== 'paper') wrapper = wrapper.parentElement;
                if (wrapper) { wrapper.remove(); purged = true; }
            });

            const pageBorder = document.getElementById('page-border');
            if (pageBorder && (pageBorder.getAttribute('data-style') || pageBorder.innerHTML.trim() !== '')) {
                pageBorder.removeAttribute('data-style');
                pageBorder.innerHTML = '';
                purged = true;
            }

            if (purged && typeof pushHistory === 'function') pushHistory();
        });

        // 5. Anchor it right next to the original button
        removeThemeBtn.parentElement.insertBefore(eraserBtn, removeThemeBtn.nextSibling);
        clearInterval(injectInterval);
    }, 500);

})();


;(function installTextPrintRescue() {
    console.log("🖨️ Text Print Rescue Module initializing...");

    const forceInlineTextStyles = () => {
        // Find every element inside an interactive container
        const allElements = document.querySelectorAll('.pub-element *');

        allElements.forEach(el => {
            // Guard: Never override WordArt text or wrappers with computed styles,
            // as WordArt styles (e.g. .wa-style-9) have default colors like white that would wipe user colors
            if (el.closest && (el.closest('.wa-wrapper') || el.closest('.wa-text') || el.classList.contains('wa-text') || el.classList.contains('wa-wrapper'))) {
                return;
            }

            // Filter down to elements that actually contain readable text
            // (Ignoring empty wrappers, SVG paths, or image containers)
            if (el.innerText && el.innerText.trim() !== '' && el.children.length === 0) {
                
                // Ask the browser what the text currently looks like on the screen
                const computed = window.getComputedStyle(el);

                // If the element doesn't have an explicit inline style, forcefully apply the computed one
                if (!el.style.fontFamily || el.style.fontFamily === '') {
                    el.style.setProperty('font-family', computed.fontFamily, 'important');
                }
                
                if (!el.style.fontSize || el.style.fontSize === '') {
                    el.style.setProperty('font-size', computed.fontSize, 'important');
                }
                
                if (!el.style.color || el.style.color === '') {
                    el.style.setProperty('color', computed.color, 'important');
                }
            }
        });
        console.log("🖨️ Text styles hardcoded for print spooler.");
    };

    // Intercept the browser's print command BEFORE the spooler takes its snapshot
    window.addEventListener('beforeprint', forceInlineTextStyles, true);
    
    // Fallback: If the app uses a custom print button instead of the browser native Ctrl+P
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'p') {
            forceInlineTextStyles();
        }
    }, true);

})();
