

(function lockGlobalWorkspaceAnimation() {
    const viewport = document.getElementById('viewport');
    if (!viewport) return;

    const observer = new MutationObserver((mutations) => {
        let shouldSync = false;
        
        for (let m of mutations) {
            if (m.target.id === 'op-image-sidebar' || m.target.id === 'op-wordart-sidebar' || m.target.classList.contains('sidebar-panel')) {
                shouldSync = true;
                break;
            }
        }

        if (shouldSync) {
            const activeSidebar = document.querySelector('#op-image-sidebar.visible, #op-wordart-sidebar.visible, .sidebar-panel.visible');
            
            if (activeSidebar) {
                const sidebarWidth = 290;
                const screenWidth = window.innerWidth;
                const minContentWidth = 950; 

                if (screenWidth < sidebarWidth + minContentWidth) {
                    viewport.style.setProperty('margin-right', sidebarWidth + 'px', 'important');
                    viewport.style.setProperty('width', `calc(100% - ${sidebarWidth}px)`, 'important');
                } else {
                    viewport.style.setProperty('margin-right', '0px', 'important');
                    viewport.style.setProperty('width', '100%', 'important');
                }
            } else {
                viewport.style.setProperty('margin-right', '0px', 'important');
                viewport.style.setProperty('width', '100%', 'important');
            }
        }
    });

    observer.observe(document.body, { 
        attributes: true, 
        attributeFilter: ['class'],
        subtree: true 
    });

    window.addEventListener('resize', () => {
        const activeSidebar = document.querySelector('#op-image-sidebar.visible, #op-wordart-sidebar.visible');
        if (activeSidebar) {
             const sidebarWidth = 290;
             const screenWidth = window.innerWidth;
             const minContentWidth = 986;
             if (screenWidth < sidebarWidth + minContentWidth) {
                 viewport.style.setProperty('margin-right', sidebarWidth + 'px', 'important');
                 viewport.style.setProperty('width', `calc(100% - ${sidebarWidth}px)`, 'important');
             } else {
                 viewport.style.setProperty('margin-right', '0px', 'important');
                 viewport.style.setProperty('width', '100%', 'important');
             }
        }
    });
})();


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
        </div>`;
    document.body.appendChild(panel);

    const vp = document.getElementById('viewport') || document.getElementById('workspace');

    const refreshVisibility = (el) => {
        if (el && (el.querySelector('img') || el.getAttribute('data-type') === 'emoji')) {
            const isBetaWordArt = el.querySelector('.beta-wa-img') !== null;
            const titleEl = panel.querySelector('.op-sidebar-title');
            if (titleEl) titleEl.innerText = isBetaWordArt ? 'Format WordArt' : 'Format Picture';
            if (userCollapsed) {
                panel.classList.remove('visible'); expander.classList.add('visible'); if (vp) vp.style.width = '';
            } else {
                panel.classList.add('visible'); expander.classList.remove('visible'); if (vp) vp.style.width = 'calc(100% - 290px)';
            }
            panel.querySelectorAll('.op-sidebar-slider').forEach(s => {
                const f = s.dataset.filter;
                let v = el.getAttribute(`data-filter-${f}`);
                if (v === null || v === undefined) {
                    if (f === 'transparency') {
                        const img = el.querySelector('img');
                        if (img && img.style.opacity !== '' && img.style.opacity !== undefined) {
                            v = Math.round((1 - parseFloat(img.style.opacity)) * 100);
                        } else {
                            v = 0;
                        }
                    } else {
                        v = (['brightness','contrast','saturate'].includes(f)?100:0);
                    }
                }
                s.value = v; 
                const txt = panel.querySelector(`#val-${f}`);
                if(txt) txt.innerText = v + (f==='hue-rotate'?'°':f==='blur'?'px':'%');
            });
        } else {
            panel.classList.remove('visible'); expander.classList.remove('visible'); if (vp) vp.style.width = '';
        }
    };

    const apply = (el) => {
        const img = el.querySelector('img') || (el.getAttribute('data-type') === 'emoji' ? el.querySelector('svg') : null); if(!img) return;
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

    panel.querySelectorAll('.op-sidebar-slider').forEach(s => {
        s.addEventListener('input', e => {
            if(!state.selectedEl) return;
            const f = e.target.dataset.filter, v = e.target.value;
            state.selectedEl.setAttribute(`data-filter-${f}`, v);
            const txt = panel.querySelector(`#val-${f}`);
            if(txt) txt.innerText = v + (f==='hue-rotate'?'°':f==='blur'?'px':'%');
            apply(state.selectedEl);
        });
        s.addEventListener('change', () => { if(window.pushHistory) pushHistory(); });
    });

    panel.querySelector('#filter-reset-btn').addEventListener('click', () => {
        if(!state.selectedEl) return;
        panel.querySelectorAll('.op-sidebar-slider').forEach(s => {
            const f = s.dataset.filter, d = (['brightness','contrast','saturate'].includes(f)?100:0);
            state.selectedEl.removeAttribute(`data-filter-${f}`);
            s.value = d; 
            const txt = panel.querySelector(`#val-${f}`);
            if(txt) txt.innerText = d + (f==='hue-rotate'?'°':f==='blur'?'px':'%');
        });
        apply(state.selectedEl);
        if(window.pushHistory) pushHistory();
    });

    panel.querySelector('#filter-close-btn').addEventListener('click', () => { userCollapsed = true; refreshVisibility(state.selectedEl); });
    
    expander.addEventListener('click', () => { userCollapsed = false; refreshVisibility(state.selectedEl); });

    const hookSelection = () => {
        if(window.selectElement && !window.selectElement._filterHookedLegacy) {
            const oldSel = window.selectElement;
            window.selectElement = (el) => {
                oldSel(el);
                try { refreshVisibility(el); } catch(e){}
                setTimeout(() => refreshVisibility(el), 10);
            };
            window.selectElement._filterHookedLegacy = true;
        }
        if(window.deselect && !window.deselect._filterHookedLegacy) {
            const oldDes = window.deselect;
            window.deselect = () => {
                oldDes();
                try { refreshVisibility(null); } catch(e){}
                setTimeout(() => refreshVisibility(null), 10);
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
            const textToCopy = sel.toString();
            state.copiedText = textToCopy;
            
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
                console.warn("Failed to capture HTML copy in copyEl", err);
            }
            
            state.copiedElements = [];
            
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(textToCopy).catch(e => {
                        document.execCommand(isCut ? 'cut' : 'copy');
                    });
                } else {
                    document.execCommand(isCut ? 'cut' : 'copy');
                }
            } catch(e) {
                document.execCommand(isCut ? 'cut' : 'copy');
            }
            
            if (isCut) {
                sel.deleteFromDocument();
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
                        <span id="float-font-label" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Arial</span>
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
                <div class="float-mini-btn" onclick="execCmd('bold')" title="Bold"><strong>B</strong></div>
                <div class="float-mini-btn" onclick="execCmd('italic')" title="Italic"><strong><em>I</em></strong></div>
                <div class="float-mini-btn" onclick="execCmd('underline')" title="Underline"><strong style="text-decoration: underline;">U</strong></div>
                <div class="float-mini-btn" onclick="execCmd('strikeThrough')" title="Strikethrough"><strong style="text-decoration: line-through;">S</strong></div>
                
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

            if (!isTextEditing && typeof state !== 'undefined' && state.lastRange && state.selectedEl) {
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
        window.setTrueFontSize = function(val) {
            if (!state.selectedEl) return;
            
            state.isProgrammaticUpdate = true;
            const waText = state.selectedEl.querySelector('.wa-text');
            const activeInput = document.activeElement; 
            
            if (waText) {
                waText.style.fontSize = val;
                waText.style.transform = 'none'; 
                state.selectedEl.style.width = (waText.offsetWidth + 8) + 'px';
                state.selectedEl.style.height = (waText.offsetHeight + 8) + 'px';
                if (typeof syncWordArt === 'function') syncWordArt(state.selectedEl); 
            } else {
                const editableContent = state.selectedEl.querySelector('[contenteditable="true"]') || 
                                        state.selectedEl.querySelector('.element-content > div') || 
                                        state.selectedEl.querySelector('.element-content');
                
                if (editableContent) {
                    editableContent.focus(); 
                    const sel = window.getSelection();
                    sel.removeAllRanges();

                    let wasCollapsed = false;

                    if (state.lastRange) {
                        sel.addRange(state.lastRange);
                        if (sel.isCollapsed) wasCollapsed = true;
                    } else {
                        wasCollapsed = true;
                    }

                    if (wasCollapsed) document.execCommand("selectAll");
                    
                    document.execCommand("fontSize", false, "7"); 
                    
                    const fontTags = state.selectedEl.querySelectorAll('font[size="7"], span[style*="xxx-large"], span[style*="48px"]');
                    fontTags.forEach(f => {
                        f.removeAttribute("size");
                        f.style.fontSize = val;
                    });

                    if (sel.rangeCount > 0 && !wasCollapsed) {
                        state.lastRange = sel.getRangeAt(0).cloneRange();
                    } else if (wasCollapsed) {
                        sel.removeAllRanges(); 
                    }
                }
            }
            
            if (activeInput && (activeInput.tagName === 'INPUT' || activeInput.tagName === 'SELECT')) {
                activeInput.focus();
            }

            const numVal = parseInt(val);
            const floatSelect = document.getElementById('float-size');
            const ribbonInput = document.getElementById('font-size');
            const ctxRibbonInput = document.getElementById('ctx-font-size-text'); 
            
            if (ribbonInput) ribbonInput.value = numVal;
            if (ctxRibbonInput) ctxRibbonInput.value = numVal;
            
            if (floatSelect) {
                let optionExists = Array.from(floatSelect.options).some(opt => parseInt(opt.value) === numVal);
                if (!optionExists) {
                    const newOpt = document.createElement('option');
                    newOpt.value = numVal;
                    newOpt.innerText = numVal;
                    floatSelect.appendChild(newOpt);
                }
                floatSelect.value = numVal;
            }
            
            if (typeof pushHistory === 'function') pushHistory();
            setTimeout(() => { state.isProgrammaticUpdate = false; }, 100);
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
    console.log("⚡ v5.6.6: Real-Time Thumbnail Drag Engine initialized.");
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
                if (content && thumbScaleBox && content.style.transform) {
                    thumbScaleBox.style.transform = content.style.transform;
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
            if (el.id === 'native-blueprint-border' || el.querySelector('#native-blueprint-border') || el.querySelector('.page-border-wrapper')) {
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
            const borders = document.querySelectorAll('#native-blueprint-border, [data-is-border="true"], .page-border-wrapper');
            
            borders.forEach(border => {
                let wrapper = border;
                while (wrapper.parentElement && wrapper.parentElement.id !== 'paper') wrapper = wrapper.parentElement;
                if (wrapper) { wrapper.remove(); purged = true; }
            });

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
