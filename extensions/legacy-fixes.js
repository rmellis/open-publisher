

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
                const v = el.getAttribute(`data-filter-${f}`) || (['brightness','contrast','saturate'].includes(f)?100:0);
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
    });

    panel.querySelector('#filter-close-btn').addEventListener('click', () => { userCollapsed = true; refreshVisibility(state.selectedEl); });
    
    expander.addEventListener('click', () => { userCollapsed = false; refreshVisibility(state.selectedEl); });

    setTimeout(() => {
        if(window.selectElement) {
            const oldSel = window.selectElement;
            window.selectElement = (el) => { oldSel(el); setTimeout(() => refreshVisibility(el), 10); };
        }
        if(window.deselect) {
            const oldDes = window.deselect;
            window.deselect = () => { oldDes(); setTimeout(() => refreshVisibility(null), 10); };
        }
    }, 1000);
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
        }
    }, true);

    // --- 2. MULTI-ITEM COPY / CUT ---
    window.copyEl = function(isCut = false) {
        // Check up front whether the user has text highlighted inside a contenteditable.
        // We must do this BEFORE the recover-focus block below changes focus/selection.
        const selBeforeRecover = window.getSelection();
        const hasTextSelectionBeforeRecover = selBeforeRecover && selBeforeRecover.rangeCount > 0 && !selBeforeRecover.isCollapsed;

        // Recover focus if lost due to clicking ribbon - but only when the user
        // actually had text selected (i.e. this is a text copy, not an element copy).
        let targetBox = document.activeElement;
        if (hasTextSelectionBeforeRecover &&
            (!targetBox || (!targetBox.isContentEditable && targetBox.tagName !== 'INPUT' && targetBox.tagName !== 'TEXTAREA'))) {
            if (typeof state !== 'undefined' && state.selectedEl) {
                const innerText = state.selectedEl.querySelector('[contenteditable="true"]') || state.selectedEl.querySelector('.text-content');
                if (innerText) {
                    targetBox = innerText;
                    if (state.lastRange) {
                        targetBox.focus();
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(state.lastRange);
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
        document.querySelectorAll('.op-theme-container').forEach(container => {
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

    // 2. DELAYED MOUSE STEALTH (Fixes Text Box Ribbon)
    let stealthTimer = null;
    
    const stealthBackgrounds = () => {
        clearTimeout(stealthTimer);
        document.querySelectorAll('[data-is-theme="true"]').forEach(el => {
            el.classList.remove('pub-element', 'selected', 'active-element');
        });
    };
    
    const unstealthBackgrounds = () => {
        document.querySelectorAll('[data-is-theme="true"]').forEach(el => {
            if (!el.classList.contains('pub-element')) {
                el.classList.add('pub-element');
            }
            el.classList.remove('selected', 'active-element');
        });
    };

    // Event Listeners for Stealth
    window.addEventListener('mousedown', stealthBackgrounds, true);
    window.addEventListener('mousemove', (e) => { 
        if (e.buttons > 0) stealthBackgrounds(); 
    }, true);
    
    window.addEventListener('mouseup', () => { 
        stealthTimer = setTimeout(unstealthBackgrounds, 150); 
    }, true);
    
    document.addEventListener('mouseleave', () => { 
        stealthTimer = setTimeout(unstealthBackgrounds, 150); 
    }, true);
    
    // Failsafes for saving and printing
    window.addEventListener('beforeprint', unstealthBackgrounds, true);
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'p')) {
            unstealthBackgrounds();
        }
    }, true);
})();


;(function installGlassVaultMinimap() { 
    console.log("⚡ Glass Vault Minimap initializing..."); 

    const style = document.createElement('style'); 
    // CSS extracted to style.css 
    document.head.appendChild(style); 

    // Quarantine Wrapper 
    let overlayWrapper = document.getElementById('ts-overlay-wrapper'); 
    if (overlayWrapper) overlayWrapper.remove(); 
    overlayWrapper = document.createElement('div'); 
    overlayWrapper.id = 'ts-overlay-wrapper'; 

    overlayWrapper.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 90; overflow: hidden;'; 
    overlayWrapper.setAttribute('data-html2canvas-ignore', 'true'); 
    document.body.appendChild(overlayWrapper); 

    let isDragging = false; 
    let isPrinting = false;  
    let rafId = null; 
    let activeElement = null; 
    let activeClone = null; 
    let nodeMap = new Map(); 

    // ✨ SIDEBAR CLIPPING OBSERVER ✨
    // Uses native browser engine to perfectly detect if the sidebar is collapsing and clipping the thumbs
    const clipObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If less than 40% of the thumbnail is visible, it means the sidebar collapsed over it.
            entry.target.dataset.glassVisible = (entry.intersectionRatio >= 0.4) ? 'true' : 'false';
        });
    }, {
        root: document.getElementById('sidebar') || null,
        // Fire callbacks frequently during the slide animation for instant hiding
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0]
    });
     
    // ✨ PRINT HIBERNATION ✨ 
    const prepareForPrint = () => { 
        isPrinting = true; 
        document.querySelectorAll('.page-thumb').forEach(thumb => { 
            thumb.style.removeProperty('height');  
            thumb.style.removeProperty('width');  
        }); 
    }; 

    const restoreAfterPrint = () => { isPrinting = false; }; 

    window.addEventListener('beforeprint', prepareForPrint); 
    window.addEventListener('afterprint', restoreAfterPrint); 

    const printQuery = window.matchMedia('print'); 
    if (printQuery.addEventListener) { 
        printQuery.addEventListener('change', (e) => { 
            if (e.matches) prepareForPrint(); 
            else restoreAfterPrint(); 
        }); 
    } 

    let lockedIndex = 0; 
    let lastLockedIndex = -1;  

    document.addEventListener('mousedown', (e) => { 
        const thumb = e.target.closest('.page-thumb'); 
        if (thumb) { 
            const thumbs = Array.from(document.querySelectorAll('.page-thumb')); 
            lockedIndex = thumbs.indexOf(thumb); 
            return; 
        } 

        const btn = e.target.closest('div, button'); 
        if (btn && btn.textContent && btn.textContent.toLowerCase().includes('add page')) { 
            setTimeout(() => { 
                const thumbs = document.querySelectorAll('.page-thumb'); 
                lockedIndex = thumbs.length - 1; 
                buildMap(); 
            }, 300); 
        } 
    }, true); 

    // ========================================== 
    // 60FPS POSITION TRACKER 
    // ========================================== 
    const syncPositions = () => { 
        if (isPrinting) { 
            requestAnimationFrame(syncPositions); 
            return; 
        } 

        const thumbs = document.querySelectorAll('.page-thumb'); 
        const sb = document.getElementById('sidebar');
        const sbRect = sb ? sb.getBoundingClientRect() : null;
        const isSbVisible = sb && sbRect && sbRect.width > 5 && sbRect.height > 5;

        if (!isSbVisible || !overlayWrapper) {
            if (overlayWrapper) overlayWrapper.style.display = 'none';
        } else {
            overlayWrapper.style.display = 'block';
            // Clip overlay wrapper precisely to the visible sidebar bounds so no glass panel can ever render into ribbon or status bar
            const clipTop = Math.max(0, Math.floor(sbRect.top));
            const clipRight = Math.max(0, Math.floor(window.innerWidth - sbRect.right));
            const clipBottom = Math.max(0, Math.floor(window.innerHeight - sbRect.bottom));
            const clipLeft = Math.max(0, Math.floor(sbRect.left));
            overlayWrapper.style.clipPath = `inset(${clipTop}px ${clipRight}px ${clipBottom}px ${clipLeft}px)`;
        }
         
        thumbs.forEach((thumb, index) => { 
            // Hook new thumbs into the clipping observer
            if (!thumb.dataset.isObserved) {
                clipObserver.observe(thumb);
                thumb.dataset.isObserved = 'true';
            }

            let panel = document.getElementById('ts-glass-' + index); 
            if (!panel) { 
                panel = document.createElement('div'); 
                panel.id = 'ts-glass-' + index; 
                panel.className = 'ts-glass-panel'; 
                overlayWrapper.appendChild(panel); 
            } 

            const rect = thumb.getBoundingClientRect(); 
            
            // Check if the sidebar is collapsing over it
            const isVisible = thumb.dataset.glassVisible !== 'false';

            // Boundary check: ensure the thumb has visible overlap with the sidebar bounds
            const isInsideSidebar = isSbVisible && 
                rect.bottom > sbRect.top && 
                rect.top < sbRect.bottom && 
                rect.right > sbRect.left && 
                rect.left < sbRect.right;

            if (isVisible && isInsideSidebar && rect.width > 0 && rect.height > 0 && 
                rect.top < window.innerHeight && rect.bottom > 0 &&
                rect.left < window.innerWidth && rect.right > 0) { 
                
                panel.style.display = 'block'; 
                
                if (panel.dataset.top !== rect.top + 'px' || 
                    panel.dataset.height !== rect.height + 'px' ||
                    panel.dataset.left !== rect.left + 'px' || 
                    panel.dataset.width !== rect.width + 'px') { 
                    
                    panel.style.left = rect.left + 'px'; 
                    panel.style.top = rect.top + 'px'; 
                    panel.style.width = rect.width + 'px'; 
                    panel.style.height = rect.height + 'px'; 
                    
                    panel.dataset.top = rect.top + 'px'; 
                    panel.dataset.height = rect.height + 'px'; 
                    panel.dataset.left = rect.left + 'px'; 
                    panel.dataset.width = rect.width + 'px'; 
                } 
            } else { 
                panel.style.display = 'none'; 
            } 
        }); 

        for (let i = thumbs.length; i < overlayWrapper.children.length; i++) { 
            const excess = document.getElementById('ts-glass-' + i); 
            if (excess) excess.style.display = 'none'; 
        } 

        requestAnimationFrame(syncPositions); 
    }; 
    requestAnimationFrame(syncPositions); 

    const sbEl = document.getElementById('sidebar');
    if (sbEl) {
        sbEl.addEventListener('scroll', syncPositions, { passive: true });
    }
    window.addEventListener('resize', syncPositions, { passive: true }); 

    // ========================================== 
    // THE VISUAL BUILDER 
    // ========================================== 
    const buildMap = () => { 
        if (isDragging || isPrinting) return; 

        const paper = document.getElementById('paper'); 
        const thumbs = document.querySelectorAll('.page-thumb'); 
         
        if (!paper || thumbs.length === 0 || lockedIndex < 0 || lockedIndex >= thumbs.length) return; 

        const activePanel = document.getElementById('ts-glass-' + lockedIndex); 
        const activeThumb = thumbs[lockedIndex]; 
        if (!activePanel || !activeThumb) return; 

        let inner = activePanel.querySelector('.ts-mirror-inner'); 
        if (!inner) { 
            inner = document.createElement('div'); 
            inner.className = 'ts-mirror-inner'; 
            activePanel.appendChild(inner); 
        } 

        if (lockedIndex !== lastLockedIndex) { 
            nodeMap.clear(); 
            document.querySelectorAll('.ts-glass-panel').forEach(panel => {
                panel.style.backgroundColor = 'transparent';
                const inner = panel.querySelector('.ts-mirror-inner');
                if (inner) inner.innerHTML = '';
            });
            lastLockedIndex = lockedIndex; 
        } 

        const paperAspect = paper.offsetHeight / paper.offsetWidth; 
        if (paperAspect > 0) { 
            activeThumb.style.height = `${activeThumb.offsetWidth * paperAspect}px`; 
        } 

        inner.style.width = paper.offsetWidth + 'px'; 
        inner.style.height = paper.offsetHeight + 'px'; 
         
        const thumbRect = activeThumb.getBoundingClientRect(); 
         
        let scaleFactor = 0.15; 
        let translateX = 0; 
        let translateY = 0; 

        if (thumbRect.width > 0 && thumbRect.height > 0 && paper.offsetWidth > 0 && paper.offsetHeight > 0) { 
            const scaleX = thumbRect.width / paper.offsetWidth; 
            const scaleY = thumbRect.height / paper.offsetHeight; 
             
            scaleFactor = Math.min(scaleX, scaleY); 
            translateX = (thumbRect.width - (paper.offsetWidth * scaleFactor)) / 2; 
            translateY = (thumbRect.height - (paper.offsetHeight * scaleFactor)) / 2; 
        } 

        inner.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleFactor})`; 

// ✨ THE BULLETPROOF CLOAKING FIX
        const sanitizeClone = (node) => { 
            const stripFrameworkHooks = (n) => {
                if (n.removeAttribute) {
                    n.removeAttribute('id'); 
                    n.removeAttribute('data-is-border'); // This was the missing link causing the crash!
                }
                if (n.classList) {
                    n.classList.remove('page-border-wrapper', 'page-border', 'native-blueprint-border');
                }
            };
            stripFrameworkHooks(node);
            node.querySelectorAll('*').forEach(stripFrameworkHooks);
        }; 

        const themeLayer = paper.querySelector('.op-theme-container') || paper.querySelector('[data-is-theme="true"]'); 
        let cloneTheme = inner.querySelector('.ts-theme-clone'); 
         
        if (themeLayer) { 
            if (!cloneTheme) { 
                cloneTheme = themeLayer.cloneNode(true); 
                sanitizeClone(cloneTheme); 
                cloneTheme.classList.add('ts-theme-clone'); 
                cloneTheme.style.opacity = '1'; 
                inner.prepend(cloneTheme);  
            } else { 
                cloneTheme.style.cssText = themeLayer.style.cssText; 
                cloneTheme.style.opacity = '1'; 
                 
                const tempTheme = themeLayer.cloneNode(true); 
                sanitizeClone(tempTheme); 
                if (cloneTheme.innerHTML !== tempTheme.innerHTML) { 
                    cloneTheme.innerHTML = tempTheme.innerHTML; 
                } 
            } 
        } else { 
            if (cloneTheme) cloneTheme.remove(); 
            const paperBg = window.getComputedStyle(paper).backgroundColor; 
            if (paperBg && paperBg !== 'rgba(0, 0, 0, 0)') activePanel.style.backgroundColor = paperBg; 
        } 

        const elements = Array.from(paper.querySelectorAll('.pub-element')); 
        const currentSet = new Set(elements); 

        for (let [el, clone] of nodeMap.entries()) { 
            if (!currentSet.has(el)) { 
                clone.remove(); 
                nodeMap.delete(el); 
            } 
        } 

        elements.forEach(el => { 
            // ⚠️ CRITICAL ROLLBACK: Do NOT skip the border container here or the preview breaks!
            // Only skip the theme layer.
            if (el.getAttribute('data-is-theme') === 'true' || el.querySelector('.op-theme-container')) return; 

            let clone = nodeMap.get(el);

            if (!clone) { 
                clone = el.cloneNode(true); 
                sanitizeClone(clone); 
                clone.classList.remove('selected', 'active-element', 'hovered'); 
                clone.querySelectorAll('.resize-handle, .rotate-stick, .rotate-handle').forEach(ui => ui.remove()); 
                clone.style.opacity = '1'; 
                inner.appendChild(clone); 
                nodeMap.set(el, clone); 
            } else { 
                clone.style.cssText = el.style.cssText; 
                clone.style.opacity = '1'; 
                clone.classList.remove('selected', 'active-element', 'hovered'); 

                const tempNode = el.cloneNode(true); 
                sanitizeClone(tempNode); 
                tempNode.querySelectorAll('.resize-handle, .rotate-stick, .rotate-handle').forEach(ui => ui.remove()); 
                 
                if (clone.innerHTML !== tempNode.innerHTML) { 
                    clone.innerHTML = tempNode.innerHTML; 
                } 
            } 
        }); 
    }; 

    // ========================================== 
    // HARDWARE ACCELERATED DRAG LOOP 
    // ========================================== 
    const updateActiveClone = () => { 
        if (!activeElement || !activeClone) return; 
         
        activeClone.style.left = activeElement.style.left; 
        activeClone.style.top = activeElement.style.top; 
        activeClone.style.width = activeElement.style.width; 
        activeClone.style.height = activeElement.style.height; 
        activeClone.style.transform = activeElement.style.transform; 

        if (isDragging) rafId = requestAnimationFrame(updateActiveClone); 
    }; 

    window.addEventListener('mousedown', (e) => { 
        const el = e.target.closest('.pub-element'); 
        if (el) { 
            isDragging = true; 
            activeElement = el; 
            activeClone = nodeMap.get(el); 
            if (activeClone) activeClone.style.zIndex = '9999'; 
            if (rafId) cancelAnimationFrame(rafId); 
            updateActiveClone(); 
        } 
    }, true); 

    const endInteraction = () => { 
        if (isDragging) { 
            isDragging = false; 
            activeElement = null; 
            activeClone = null; 
            if (rafId) cancelAnimationFrame(rafId); 
            buildMap();  
        } 
    }; 

    window.addEventListener('mouseup', endInteraction, true); 
     
    setInterval(() => { if (!isDragging && !isPrinting) buildMap(); }, 800); 
    setTimeout(buildMap, 500); 

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


;(function installPerfectedThemeStudio() {
    console.log("🛠️ Theme Studio initializing (v5.4.1 Modernized Background Controls & 300 Themes)...");

    // ==========================================
    // 1. CLEANUP & PREPARATION
    // ==========================================
    const oldThemeGroup = document.getElementById('theme-group');
    if (oldThemeGroup) oldThemeGroup.style.display = 'none';
    
    const oldModernGroup = document.getElementById('modern-theme-group');
    if (oldModernGroup) oldModernGroup.style.display = 'none';
    
    const rogueStudio = document.getElementById('advanced-theme-studio');
    if (rogueStudio) rogueStudio.remove();

    const existingPopover = document.getElementById('ts-gallery-popover');
    if (existingPopover) existingPopover.remove();

    // ==========================================
    // 2. INJECT CSS
    // ==========================================
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // ==========================================
    // 3. THEME DEFINITIONS (300 Authentic Curated Themes)
    // ==========================================
    const THEME_CATEGORIES = [
        { id: 'gradient', name: 'Modern & Vibrant Gradients', icon: 'fa-rainbow', count: 60 },
        { id: 'corporate', name: 'Corporate, Legal & Editorial', icon: 'fa-briefcase', count: 60 },
        { id: 'dark', name: 'Dark Mode & Luxury', icon: 'fa-moon', count: 60 },
        { id: 'texture', name: 'Fine Papers, Fabrics & Materials', icon: 'fa-scroll', count: 60 },
        { id: 'pastel', name: 'Soft Pastels & Earthy Naturals', icon: 'fa-leaf', count: 60 }
    ];

    const ALL_THEMES = [
        {
            "id": "aurora-sky",
            "name": "Aurora Sky",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#4facfe",
            "c2": "#00f2fe",
            "icon": "fa-sun"
        },
        {
            "id": "sunset-horizon",
            "name": "Sunset Horizon",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#fa709a",
            "c2": "#fee140",
            "icon": "fa-cloud-sun"
        },
        {
            "id": "cosmic-violet",
            "name": "Cosmic Violet",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#667eea",
            "c2": "#764ba2",
            "icon": "fa-moon"
        },
        {
            "id": "crimson-ember",
            "name": "Crimson Ember",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#ff0844",
            "c2": "#ffb199",
            "icon": "fa-fire"
        },
        {
            "id": "solar-flare",
            "name": "Solar Flare",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#f83600",
            "c2": "#f9d423",
            "icon": "fa-bolt"
        },
        {
            "id": "neon-cyberpunk",
            "name": "Neon Cyberpunk",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#b224ef",
            "c2": "#7579ff",
            "icon": "fa-star"
        },
        {
            "id": "azure-tide",
            "name": "Azure Tide",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#89f7fe",
            "c2": "#66a6ff",
            "icon": "fa-water"
        },
        {
            "id": "emerald-biosphere",
            "name": "Emerald Biosphere",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#0ba360",
            "c2": "#3cba92",
            "icon": "fa-leaf"
        },
        {
            "id": "twilight-glow",
            "name": "Twilight Glow",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#ff7e5f",
            "c2": "#feb47b",
            "icon": "fa-sunset"
        },
        {
            "id": "mystic-lavender",
            "name": "Mystic Lavender",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#a18cd1",
            "c2": "#fbc2eb",
            "icon": "fa-magic"
        },
        {
            "id": "deep-celestial",
            "name": "Deep Celestial",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#2b5876",
            "c2": "#4e4376",
            "icon": "fa-meteor"
        },
        {
            "id": "citrus-burst",
            "name": "Citrus Burst",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#f6d365",
            "c2": "#fda085",
            "icon": "fa-lemon"
        },
        {
            "id": "arctic-glacier",
            "name": "Arctic Glacier",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#cfd9df",
            "c2": "#e2ebf0",
            "icon": "fa-snowflake"
        },
        {
            "id": "neon-mint",
            "name": "Neon Mint",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#43e97b",
            "c2": "#38f9d7",
            "icon": "fa-seedling"
        },
        {
            "id": "royal-amethyst",
            "name": "Royal Amethyst",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#5f72bd",
            "c2": "#9b23ea",
            "icon": "fa-gem"
        },
        {
            "id": "ocean-trench",
            "name": "Ocean Trench",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#09203f",
            "c2": "#537895",
            "icon": "fa-compass"
        },
        {
            "id": "rose-quartz",
            "name": "Rose Quartz",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#ff9a9e",
            "c2": "#fad0c4",
            "icon": "fa-heart"
        },
        {
            "id": "electric-indigo",
            "name": "Electric Indigo",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#30cfd0",
            "c2": "#330867",
            "icon": "fa-bolt-lightning"
        },
        {
            "id": "amber-blaze",
            "name": "Amber Blaze",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#ff9900",
            "c2": "#ff5500",
            "icon": "fa-fire-flame-curved"
        },
        {
            "id": "bora-bora",
            "name": "Bora Bora Blue",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#00c6ff",
            "c2": "#0072ff",
            "icon": "fa-umbrella-beach"
        },
        {
            "id": "mauve-velvet",
            "name": "Mauve Velvet",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#8e2de2",
            "c2": "#4a00e0",
            "icon": "fa-sparkles"
        },
        {
            "id": "golden-hour",
            "name": "Golden Hour",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#f12711",
            "c2": "#f5af19",
            "icon": "fa-sun"
        },
        {
            "id": "northern-lights",
            "name": "Northern Lights",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#43cea2",
            "c2": "#185a9d",
            "icon": "fa-mountain-sun"
        },
        {
            "id": "cherry-blossom",
            "name": "Cherry Blossom",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#f857a6",
            "c2": "#ff5858",
            "icon": "fa-spa"
        },
        {
            "id": "executive-slate",
            "name": "Executive Slate",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f8fafc",
            "c2": "#e2e8f0",
            "icon": "fa-briefcase"
        },
        {
            "id": "oxford-blue-wash",
            "name": "Oxford Blue Wash",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f0f4f8",
            "c2": "#d9e2ec",
            "icon": "fa-graduation-cap"
        },
        {
            "id": "legal-ivory",
            "name": "Legal Ivory",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fefcf3",
            "c2": "#fdf6e2",
            "icon": "fa-scale-balanced"
        },
        {
            "id": "warm-parchment",
            "name": "Warm Parchment",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fbf8f1",
            "c2": "#f4ede4",
            "icon": "fa-scroll"
        },
        {
            "id": "minimalist-chalk",
            "name": "Minimalist Chalk",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f5f5f7",
            "c2": "#e5e5ea",
            "icon": "fa-square"
        },
        {
            "id": "financial-cool-grey",
            "name": "Financial Cool Grey",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f1f5f9",
            "c2": "#cbd5e1",
            "icon": "fa-chart-line"
        },
        {
            "id": "editorial-bone",
            "name": "Editorial Bone",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#faf8f5",
            "c2": "#ede8e1",
            "icon": "fa-newspaper"
        },
        {
            "id": "corporate-sterling",
            "name": "Corporate Sterling",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#e2e8f0",
            "c2": "#f8fafc",
            "icon": "fa-building-columns"
        },
        {
            "id": "harvard-crimson-wash",
            "name": "Harvard Crimson Wash",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fdf2f2",
            "c2": "#fde8e8",
            "icon": "fa-landmark"
        },
        {
            "id": "tech-cyan-tint",
            "name": "Tech Cyan Tint",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f0fdfa",
            "c2": "#ccfbf1",
            "icon": "fa-microchip"
        },
        {
            "id": "monochrome-silk",
            "name": "Monochrome Silk",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f4f4f6",
            "c2": "#e4e4e7",
            "icon": "fa-feather"
        },
        {
            "id": "cambridge-amber",
            "name": "Cambridge Amber",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fffbeb",
            "c2": "#fef3c7",
            "icon": "fa-book-open"
        },
        {
            "id": "banker-subtle-blue",
            "name": "Banker Subtle Blue",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#eff6ff",
            "c2": "#dbeafe",
            "icon": "fa-vault"
        },
        {
            "id": "editorial-newsprint",
            "name": "Editorial Newsprint",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f6f5f0",
            "c2": "#eae7df",
            "icon": "fa-feather-pointed"
        },
        {
            "id": "architectural-concrete",
            "name": "Architectural Grey",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#e4e4e7",
            "c2": "#d4d4d8",
            "icon": "fa-compass-drafting"
        },
        {
            "id": "classic-stationery",
            "name": "Classic Stationery",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fafaf9",
            "c2": "#f5f5f4",
            "icon": "fa-signature"
        },
        {
            "id": "manhattan-granite",
            "name": "Manhattan Granite",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f3f4f6",
            "c2": "#e5e7eb",
            "icon": "fa-city"
        },
        {
            "id": "legal-manuscript",
            "name": "Legal Manuscript",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fdfbf7",
            "c2": "#f7f3e9",
            "icon": "fa-file-contract"
        },
        {
            "id": "nordic-frost",
            "name": "Nordic Frost",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f8fafc",
            "c2": "#ecfeff",
            "icon": "fa-icicles"
        },
        {
            "id": "consortium-blue",
            "name": "Consortium Blue",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f0f7ff",
            "c2": "#e0f2fe",
            "icon": "fa-handshake"
        },
        {
            "id": "berlin-sand",
            "name": "Berlin Sandstone",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fbf9f5",
            "c2": "#f3ede2",
            "icon": "fa-monument"
        },
        {
            "id": "vienna-porcelain",
            "name": "Vienna Porcelain",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fafaf9",
            "c2": "#f4f4f5",
            "icon": "fa-chess-rook"
        },
        {
            "id": "matte-noir",
            "name": "Matte Noir",
            "cat": "dark",
            "type": "gradient",
            "c1": "#121214",
            "c2": "#18181b",
            "icon": "fa-circle"
        },
        {
            "id": "obsidian-gold",
            "name": "Obsidian Gold",
            "cat": "dark",
            "type": "gradient",
            "c1": "#1c1917",
            "c2": "#292524",
            "icon": "fa-crown"
        },
        {
            "id": "midnight-navy",
            "name": "Midnight Navy",
            "cat": "dark",
            "type": "gradient",
            "c1": "#0f172a",
            "c2": "#1e293b",
            "icon": "fa-moon"
        },
        {
            "id": "smoked-titanium",
            "name": "Smoked Titanium",
            "cat": "dark",
            "type": "gradient",
            "c1": "#232526",
            "c2": "#414345",
            "icon": "fa-shield"
        },
        {
            "id": "royal-burgundy",
            "name": "Royal Burgundy",
            "cat": "dark",
            "type": "gradient",
            "c1": "#2c0b0e",
            "c2": "#451217",
            "icon": "fa-wine-glass"
        },
        {
            "id": "emerald-velvet",
            "name": "Emerald Velvet",
            "cat": "dark",
            "type": "gradient",
            "c1": "#062319",
            "c2": "#0d3a2a",
            "icon": "fa-ring"
        },
        {
            "id": "deep-space",
            "name": "Deep Space",
            "cat": "dark",
            "type": "gradient",
            "c1": "#0a0f1d",
            "c2": "#162035",
            "icon": "fa-shuttle-space"
        },
        {
            "id": "gunmetal-slate",
            "name": "Gunmetal Slate",
            "cat": "dark",
            "type": "gradient",
            "c1": "#27272a",
            "c2": "#3f3f46",
            "icon": "fa-layer-group"
        },
        {
            "id": "espresso-roast",
            "name": "Espresso Roast",
            "cat": "dark",
            "type": "gradient",
            "c1": "#1c140e",
            "c2": "#2e2118",
            "icon": "fa-mug-hot"
        },
        {
            "id": "deep-teal-noir",
            "name": "Deep Teal Noir",
            "cat": "dark",
            "type": "gradient",
            "c1": "#041d1e",
            "c2": "#0a2e30",
            "icon": "fa-water"
        },
        {
            "id": "eclipse-dark",
            "name": "Eclipse Gradient",
            "cat": "dark",
            "type": "gradient",
            "c1": "#090a0f",
            "c2": "#1e2029",
            "icon": "fa-circle-half-stroke"
        },
        {
            "id": "black-onyx",
            "name": "Black Onyx",
            "cat": "dark",
            "type": "gradient",
            "c1": "#050505",
            "c2": "#1a1a1a",
            "icon": "fa-gem"
        },
        {
            "id": "violet-night",
            "name": "Violet Night",
            "cat": "dark",
            "type": "gradient",
            "c1": "#180e29",
            "c2": "#2d184a",
            "icon": "fa-wand-magic-sparkles"
        },
        {
            "id": "dark-damask",
            "name": "Dark Damask",
            "cat": "dark",
            "type": "gradient",
            "c1": "#141416",
            "c2": "#222228",
            "icon": "fa-chess-king"
        },
        {
            "id": "cyber-matrix-dark",
            "name": "Cyber Matrix Dark",
            "cat": "dark",
            "type": "gradient",
            "c1": "#0d1912",
            "c2": "#122b1e",
            "icon": "fa-terminal"
        },
        {
            "id": "charcoal-minimal",
            "name": "Charcoal Minimal",
            "cat": "dark",
            "type": "gradient",
            "c1": "#1e1e1e",
            "c2": "#2d2d2d",
            "icon": "fa-square-full"
        },
        {
            "id": "steel-shadow",
            "name": "Steel Shadow",
            "cat": "dark",
            "type": "gradient",
            "c1": "#1a202c",
            "c2": "#2d3748",
            "icon": "fa-cube"
        },
        {
            "id": "bronze-noir",
            "name": "Bronze Noir",
            "cat": "dark",
            "type": "gradient",
            "c1": "#261e14",
            "c2": "#3d2f1f",
            "icon": "fa-medal"
        },
        {
            "id": "midnight-amethyst",
            "name": "Midnight Amethyst",
            "cat": "dark",
            "type": "gradient",
            "c1": "#1e0826",
            "c2": "#2e1040",
            "icon": "fa-gem"
        },
        {
            "id": "carbon-graphite",
            "name": "Carbon Graphite",
            "cat": "dark",
            "type": "gradient",
            "c1": "#18181b",
            "c2": "#27272a",
            "icon": "fa-atom"
        },
        {
            "id": "dark-cognac",
            "name": "Dark Cognac",
            "cat": "dark",
            "type": "gradient",
            "c1": "#2a170c",
            "c2": "#3d2314",
            "icon": "fa-whiskey-glass"
        },
        {
            "id": "deep-sapphire",
            "name": "Deep Sapphire",
            "cat": "dark",
            "type": "gradient",
            "c1": "#071527",
            "c2": "#0f2744",
            "icon": "fa-compass"
        },
        {
            "id": "imperial-jade",
            "name": "Imperial Jade",
            "cat": "dark",
            "type": "gradient",
            "c1": "#061d15",
            "c2": "#0d3225",
            "icon": "fa-shield-halved"
        },
        {
            "id": "phantom-grey",
            "name": "Phantom Grey",
            "cat": "dark",
            "type": "gradient",
            "c1": "#111827",
            "c2": "#1f2937",
            "icon": "fa-ghost"
        },
        {
            "id": "white-wall",
            "name": "White Wall Texture",
            "cat": "texture",
            "type": "texture",
            "c1": "#f8fafc",
            "url": "https://www.transparenttextures.com/patterns/white-wall.png",
            "icon": "fa-border-all"
        },
        {
            "id": "brushed-aluminum",
            "name": "Brushed Aluminum",
            "cat": "texture",
            "type": "texture",
            "c1": "#cbd5e1",
            "url": "https://www.transparenttextures.com/patterns/brushed-alum.png",
            "icon": "fa-align-justify"
        },
        {
            "id": "concrete-wall",
            "name": "Concrete Wall",
            "cat": "texture",
            "type": "texture",
            "c1": "#94a3b8",
            "url": "https://www.transparenttextures.com/patterns/concrete-wall.png",
            "icon": "fa-circle-half-stroke"
        },
        {
            "id": "cream-paper",
            "name": "Cream Paper",
            "cat": "texture",
            "type": "texture",
            "c1": "#fde047",
            "url": "https://www.transparenttextures.com/patterns/cream-paper.png",
            "icon": "fa-scroll"
        },
        {
            "id": "denim-fabric",
            "name": "Denim Fabric",
            "cat": "texture",
            "type": "texture",
            "c1": "#3b82f6",
            "url": "https://www.transparenttextures.com/patterns/denim.png",
            "icon": "fa-layer-group"
        },
        {
            "id": "black-leather",
            "name": "Black Leather",
            "cat": "texture",
            "type": "texture",
            "c1": "#1e293b",
            "url": "https://www.transparenttextures.com/patterns/leather.png",
            "icon": "fa-grip"
        },
        {
            "id": "wood-pattern",
            "name": "Wood Pattern",
            "cat": "texture",
            "type": "texture",
            "c1": "#8b5cf6",
            "url": "https://www.transparenttextures.com/patterns/wood-pattern.png",
            "icon": "fa-tree"
        },
        {
            "id": "cubes-pattern",
            "name": "Cubes Pattern",
            "cat": "texture",
            "type": "texture",
            "c1": "#10b981",
            "url": "https://www.transparenttextures.com/patterns/cubes.png",
            "icon": "fa-cubes"
        },
        {
            "id": "asphalt-road",
            "name": "Asphalt Road",
            "cat": "texture",
            "type": "texture",
            "c1": "#64748b",
            "url": "https://www.transparenttextures.com/patterns/asphalt-pattern.png",
            "icon": "fa-road"
        },
        {
            "id": "carbon-fibre",
            "name": "Carbon Fibre",
            "cat": "texture",
            "type": "texture",
            "c1": "#334155",
            "url": "https://www.transparenttextures.com/patterns/carbon-fibre.png",
            "icon": "fa-chess-board"
        },
        {
            "id": "notebook-paper",
            "name": "Notebook Paper",
            "cat": "texture",
            "type": "texture",
            "c1": "#fef08a",
            "url": "https://www.transparenttextures.com/patterns/notebook.png",
            "icon": "fa-book"
        },
        {
            "id": "brick-wall",
            "name": "Brick Wall",
            "cat": "texture",
            "type": "texture",
            "c1": "#ef4444",
            "url": "https://www.transparenttextures.com/patterns/brick-wall.png",
            "icon": "fa-th-large"
        },
        {
            "id": "subtle-dots",
            "name": "Subtle Dots",
            "cat": "texture",
            "type": "texture",
            "c1": "#f1f5f9",
            "url": "https://www.transparenttextures.com/patterns/subtle-dots.png",
            "icon": "fa-ellipsis"
        },
        {
            "id": "clean-grid",
            "name": "Blueprint Grid",
            "cat": "texture",
            "type": "texture",
            "c1": "#ffffff",
            "url": "https://www.transparenttextures.com/patterns/gridme.png",
            "icon": "fa-table-cells"
        },
        {
            "id": "linen-cloth",
            "name": "Linen Texture",
            "cat": "texture",
            "type": "texture",
            "c1": "#fafaf9",
            "url": "https://www.transparenttextures.com/patterns/retina-wood.png",
            "icon": "fa-shirt"
        },
        {
            "id": "handmade-vellum",
            "name": "Handmade Vellum",
            "cat": "texture",
            "type": "texture",
            "c1": "#fef9c3",
            "url": "https://www.transparenttextures.com/patterns/subtle-grunge.png",
            "icon": "fa-file-lines"
        },
        {
            "id": "graph-paper",
            "name": "Graph Paper",
            "cat": "texture",
            "type": "texture",
            "c1": "#f8fafc",
            "url": "https://www.transparenttextures.com/patterns/graphy.png",
            "icon": "fa-square-check"
        },
        {
            "id": "chalkboard",
            "name": "Chalkboard Slate",
            "cat": "texture",
            "type": "texture",
            "c1": "#2c3e50",
            "url": "https://www.transparenttextures.com/patterns/chalkboard.png",
            "icon": "fa-chalkboard"
        },
        {
            "id": "diagonal-mesh",
            "name": "Diagonal Mesh",
            "cat": "texture",
            "type": "texture",
            "c1": "#e2e8f0",
            "url": "https://www.transparenttextures.com/patterns/diagonal-noise.png",
            "icon": "fa-lines-leaning"
        },
        {
            "id": "terrazzo-stone",
            "name": "Ruffled Vellum",
            "cat": "texture",
            "type": "texture",
            "c1": "#f4f4f5",
            "url": "https://www.transparenttextures.com/patterns/crisp-paper-ruffles.png",
            "icon": "fa-mountain"
        },
        {
            "id": "aged-parchment-tex",
            "name": "Aged Parchment",
            "cat": "texture",
            "type": "texture",
            "c1": "#fef3c7",
            "url": "https://www.transparenttextures.com/patterns/aged-paper.png",
            "icon": "fa-scroll"
        },
        {
            "id": "canvas-weave",
            "name": "Canvas Weave",
            "cat": "texture",
            "type": "texture",
            "c1": "#f5f5f4",
            "url": "https://www.transparenttextures.com/patterns/canvas.png",
            "icon": "fa-palette"
        },
        {
            "id": "diag-stripes-light",
            "name": "Diagonal Stripes",
            "cat": "texture",
            "type": "texture",
            "c1": "#f1f5f9",
            "url": "https://www.transparenttextures.com/patterns/diagonal-striped-brick.png",
            "icon": "fa-bars"
        },
        {
            "id": "cork-board",
            "name": "Natural Cork",
            "cat": "texture",
            "type": "texture",
            "c1": "#e7d7b5",
            "url": "https://www.transparenttextures.com/patterns/cork-board.png",
            "icon": "fa-thumbtack"
        },
        {
            "id": "white-diamond",
            "name": "Diamond Mesh",
            "cat": "texture",
            "type": "texture",
            "c1": "#fafafa",
            "url": "https://www.transparenttextures.com/patterns/white-diamond.png",
            "icon": "fa-diamond"
        },
        {
            "id": "honeycomb-grid",
            "name": "Honeycomb Grid",
            "cat": "texture",
            "type": "texture",
            "c1": "#f8fafc",
            "url": "https://www.transparenttextures.com/patterns/hexellence.png",
            "icon": "fa-shapes"
        },
        {
            "id": "sage-matcha",
            "name": "Sage Matcha",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#e8f5e9",
            "c2": "#c8e6c9",
            "icon": "fa-seedling"
        },
        {
            "id": "blush-rose",
            "name": "Blush Rose",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fce4ec",
            "c2": "#f8bbd0",
            "icon": "fa-spa"
        },
        {
            "id": "lavender-mist",
            "name": "Lavender Mist",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f3e5f5",
            "c2": "#e1bee7",
            "icon": "fa-flower"
        },
        {
            "id": "terracotta-clay",
            "name": "Terracotta Clay",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fbe9e7",
            "c2": "#ffccbc",
            "icon": "fa-shapes"
        },
        {
            "id": "desert-sandstone",
            "name": "Desert Sandstone",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fff8e1",
            "c2": "#ffecb3",
            "icon": "fa-sun"
        },
        {
            "id": "mint-breeze",
            "name": "Mint Breeze",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#e0f2f1",
            "c2": "#b2dfdb",
            "icon": "fa-wind"
        },
        {
            "id": "soft-peach",
            "name": "Soft Peach",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fff3e0",
            "c2": "#ffe0b2",
            "icon": "fa-circle-dot"
        },
        {
            "id": "morning-sky",
            "name": "Morning Sky",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#e1f5fe",
            "c2": "#b3e5fc",
            "icon": "fa-cloud"
        },
        {
            "id": "lilac-dream",
            "name": "Lilac Dream",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#ede7f6",
            "c2": "#d1c4e9",
            "icon": "fa-moon"
        },
        {
            "id": "buttercream",
            "name": "Buttercream",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fefde8",
            "c2": "#fef08a",
            "icon": "fa-ice-cream"
        },
        {
            "id": "eucalyptus",
            "name": "Eucalyptus Green",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#ecfdf5",
            "c2": "#a7f3d0",
            "icon": "fa-leaf"
        },
        {
            "id": "coral-whisper",
            "name": "Coral Whisper",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fff1f2",
            "c2": "#fecdd3",
            "icon": "fa-heart"
        },
        {
            "id": "warm-oat",
            "name": "Warm Oat",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fafaf9",
            "c2": "#e7e5e4",
            "icon": "fa-wheat-awn"
        },
        {
            "id": "dusty-mauve",
            "name": "Dusty Mauve",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fae8ff",
            "c2": "#f0abfc",
            "icon": "fa-gem"
        },
        {
            "id": "glacier-mist",
            "name": "Glacier Mist",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f0fdfa",
            "c2": "#99f6e4",
            "icon": "fa-droplet"
        },
        {
            "id": "chamomile",
            "name": "Chamomile Cream",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fffbeb",
            "c2": "#fde68a",
            "icon": "fa-sun-plant-wilt"
        },
        {
            "id": "apricot-sorbet",
            "name": "Apricot Sorbet",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fff7ed",
            "c2": "#fed7aa",
            "icon": "fa-apple-whole"
        },
        {
            "id": "celadon-green",
            "name": "Celadon Green",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f0fdf4",
            "c2": "#bbf7d0",
            "icon": "fa-clover"
        },
        {
            "id": "powder-periwinkle",
            "name": "Powder Periwinkle",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#eef2ff",
            "c2": "#c7d2fe",
            "icon": "fa-cloud-meatball"
        },
        {
            "id": "warm-alabaster",
            "name": "Warm Alabaster",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fefce8",
            "c2": "#fef08a",
            "icon": "fa-cookie"
        },
        {
            "id": "rose-clay",
            "name": "Rose Clay",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fff1f2",
            "c2": "#fecdd3",
            "icon": "fa-feather"
        },
        {
            "id": "coastal-fog",
            "name": "Coastal Fog",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f8fafc",
            "c2": "#e2e8f0",
            "icon": "fa-water"
        },
        {
            "id": "pistachio-cream",
            "name": "Pistachio Cream",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f7fee7",
            "c2": "#d9f99d",
            "icon": "fa-seedling"
        },
        {
            "id": "vanilla-latte",
            "name": "Vanilla Latte",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fffbeb",
            "c2": "#f5ebe0",
            "icon": "fa-mug-saucer"
        },
        {
            "id": "tropic-lagoon",
            "name": "Tropic Lagoon",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#00c9ff",
            "c2": "#92fe9d",
            "icon": "fa-water"
        },
        {
            "id": "flamingo-glow",
            "name": "Flamingo Glow",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#f85032",
            "c2": "#e73827",
            "icon": "fa-dove"
        },
        {
            "id": "magenta-haze",
            "name": "Magenta Haze",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#d946ef",
            "c2": "#8b5cf6",
            "icon": "fa-wand-magic-sparkles"
        },
        {
            "id": "hyper-orange",
            "name": "Hyper Orange",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#ff4e50",
            "c2": "#f9d423",
            "icon": "fa-fire"
        },
        {
            "id": "sapphire-stream",
            "name": "Sapphire Stream",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#1e3c72",
            "c2": "#2a5298",
            "icon": "fa-water"
        },
        {
            "id": "matcha-lemonade",
            "name": "Matcha Lemonade",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#84fab0",
            "c2": "#8fd3f4",
            "icon": "fa-glass-water"
        },
        {
            "id": "peach-schnapps",
            "name": "Peach Schnapps",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#ffd1ff",
            "c2": "#fae1dd",
            "icon": "fa-heart"
        },
        {
            "id": "cyber-lime",
            "name": "Cyber Lime",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#a8ff78",
            "c2": "#78ffd6",
            "icon": "fa-bolt"
        },
        {
            "id": "velvet-sun",
            "name": "Velvet Sun",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#e1eec3",
            "c2": "#f05053",
            "icon": "fa-sun"
        },
        {
            "id": "plum-nebula",
            "name": "Plum Nebula",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#3f2b96",
            "c2": "#a8c0ff",
            "icon": "fa-meteor"
        },
        {
            "id": "electric-magenta",
            "name": "Electric Magenta",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#f72585",
            "c2": "#7209b7",
            "icon": "fa-star"
        },
        {
            "id": "aqua-marine",
            "name": "Aqua Marine",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#13547a",
            "c2": "#80d0c7",
            "icon": "fa-fish"
        },
        {
            "id": "summer-solstice",
            "name": "Summer Solstice",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#ffb347",
            "c2": "#ffcc33",
            "icon": "fa-sun-plant-wilt"
        },
        {
            "id": "blazing-orchid",
            "name": "Blazing Orchid",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#ec008c",
            "c2": "#fc6767",
            "icon": "fa-gem"
        },
        {
            "id": "deep-abyss",
            "name": "Deep Abyss",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#0f2027",
            "c2": "#2c5364",
            "icon": "fa-cloud-rain"
        },
        {
            "id": "cosmic-fusion",
            "name": "Cosmic Fusion",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#ff007f",
            "c2": "#7928ca",
            "icon": "fa-atom"
        },
        {
            "id": "zurich-clean",
            "name": "Zurich Minimal",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f8f9fa",
            "c2": "#e9ecef",
            "icon": "fa-building-columns"
        },
        {
            "id": "tokyo-monochrome",
            "name": "Tokyo Monochrome",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f1f3f5",
            "c2": "#dee2e6",
            "icon": "fa-torii-gate"
        },
        {
            "id": "london-fog-wash",
            "name": "London Fog Wash",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f4f6f8",
            "c2": "#e1e7eb",
            "icon": "fa-cloud"
        },
        {
            "id": "wall-street-navy",
            "name": "Wall Street Tint",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f0f4f9",
            "c2": "#dce5ef",
            "icon": "fa-money-bill-wave"
        },
        {
            "id": "scandi-birch",
            "name": "Scandinavian Birch",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fcfbfa",
            "c2": "#f3ede2",
            "icon": "fa-tree"
        },
        {
            "id": "parliament-vellum",
            "name": "Parliament Vellum",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fbf9f2",
            "c2": "#f4eedb",
            "icon": "fa-scale-unbalanced"
        },
        {
            "id": "florence-marble",
            "name": "Florence Marble",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#faf9f6",
            "c2": "#ede9e3",
            "icon": "fa-monument"
        },
        {
            "id": "geneva-diplomat",
            "name": "Geneva Diplomat",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f2f5f9",
            "c2": "#e2e8f1",
            "icon": "fa-landmark-flag"
        },
        {
            "id": "silicon-slate",
            "name": "Silicon Slate",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f3f4f6",
            "c2": "#d1d5db",
            "icon": "fa-microchip"
        },
        {
            "id": "boston-brahmin",
            "name": "Boston Crimson Tint",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fff5f5",
            "c2": "#fed7d7",
            "icon": "fa-graduation-cap"
        },
        {
            "id": "frankfurt-steel",
            "name": "Frankfurt Steel",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#eff2f5",
            "c2": "#dbe1e8",
            "icon": "fa-coins"
        },
        {
            "id": "sorbonne-cream",
            "name": "Sorbonne Cream",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fefcf6",
            "c2": "#faf1da",
            "icon": "fa-book"
        },
        {
            "id": "amsterdam-wash",
            "name": "Amsterdam Wash",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f0f9ff",
            "c2": "#e0f2fe",
            "icon": "fa-bridge-water"
        },
        {
            "id": "chicago-limestone",
            "name": "Chicago Limestone",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f7f7f5",
            "c2": "#eae8e1",
            "icon": "fa-building"
        },
        {
            "id": "chartered-slate",
            "name": "Chartered Slate",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f1f5f9",
            "c2": "#cbd5e1",
            "icon": "fa-file-invoice"
        },
        {
            "id": "notary-parchment",
            "name": "Notary Parchment",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fdfbee",
            "c2": "#f9f2d5",
            "icon": "fa-stamp"
        },
        {
            "id": "press-gallery",
            "name": "Press Gallery Tint",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f8fafc",
            "c2": "#eceff1",
            "icon": "fa-bullhorn"
        },
        {
            "id": "kyoto-washi",
            "name": "Kyoto Washi Wash",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fbfaf7",
            "c2": "#f5f0e6",
            "icon": "fa-scroll"
        },
        {
            "id": "vampire-garnet",
            "name": "Vampire Garnet",
            "cat": "dark",
            "type": "gradient",
            "c1": "#210408",
            "c2": "#380710",
            "icon": "fa-droplet"
        },
        {
            "id": "midnight-pine",
            "name": "Midnight Pine",
            "cat": "dark",
            "type": "gradient",
            "c1": "#03170e",
            "c2": "#072e1d",
            "icon": "fa-tree"
        },
        {
            "id": "caviar-black",
            "name": "Caviar Black",
            "cat": "dark",
            "type": "gradient",
            "c1": "#0d0d0f",
            "c2": "#17181c",
            "icon": "fa-circle"
        },
        {
            "id": "black-diamond-dark",
            "name": "Black Diamond Dark",
            "cat": "dark",
            "type": "gradient",
            "c1": "#111116",
            "c2": "#21212c",
            "icon": "fa-gem"
        },
        {
            "id": "dark-nebula",
            "name": "Dark Nebula",
            "cat": "dark",
            "type": "gradient",
            "c1": "#14052b",
            "c2": "#280a54",
            "icon": "fa-star"
        },
        {
            "id": "basalt-lava",
            "name": "Basalt Lava",
            "cat": "dark",
            "type": "gradient",
            "c1": "#1c1917",
            "c2": "#322521",
            "icon": "fa-volcano"
        },
        {
            "id": "space-cadet",
            "name": "Space Cadet Navy",
            "cat": "dark",
            "type": "gradient",
            "c1": "#0b132b",
            "c2": "#1c2541",
            "icon": "fa-shuttle-space"
        },
        {
            "id": "truffle-dark",
            "name": "Truffle Roast",
            "cat": "dark",
            "type": "gradient",
            "c1": "#1b1612",
            "c2": "#2b231c",
            "icon": "fa-cookie-bite"
        },
        {
            "id": "black-tuxedo",
            "name": "Black Tuxedo",
            "cat": "dark",
            "type": "gradient",
            "c1": "#0a0a0c",
            "c2": "#1a1a22",
            "icon": "fa-user-tie"
        },
        {
            "id": "dark-petroleum",
            "name": "Dark Petroleum",
            "cat": "dark",
            "type": "gradient",
            "c1": "#02161a",
            "c2": "#052c35",
            "icon": "fa-oil-well"
        },
        {
            "id": "cyber-void",
            "name": "Cyber Void",
            "cat": "dark",
            "type": "gradient",
            "c1": "#090d16",
            "c2": "#131c31",
            "icon": "fa-terminal"
        },
        {
            "id": "gothic-plum",
            "name": "Gothic Plum",
            "cat": "dark",
            "type": "gradient",
            "c1": "#1b0e1e",
            "c2": "#301736",
            "icon": "fa-cross"
        },
        {
            "id": "abyssal-indigo",
            "name": "Abyssal Indigo",
            "cat": "dark",
            "type": "gradient",
            "c1": "#0c0d21",
            "c2": "#161842",
            "icon": "fa-compass"
        },
        {
            "id": "bronze-patina",
            "name": "Bronze Patina",
            "cat": "dark",
            "type": "gradient",
            "c1": "#161b17",
            "c2": "#242c26",
            "icon": "fa-shield"
        },
        {
            "id": "noir-carbonite",
            "name": "Noir Carbonite",
            "cat": "dark",
            "type": "gradient",
            "c1": "#141414",
            "c2": "#242424",
            "icon": "fa-cube"
        },
        {
            "id": "midnight-chambray",
            "name": "Midnight Chambray",
            "cat": "dark",
            "type": "gradient",
            "c1": "#0c1926",
            "c2": "#14283d",
            "icon": "fa-vest"
        },
        {
            "id": "paper-fibers",
            "name": "Paper Fibers",
            "cat": "texture",
            "type": "texture",
            "c1": "#fdfcf7",
            "url": "https://www.transparenttextures.com/patterns/paper-fibres.png",
            "icon": "fa-newspaper"
        },
        {
            "id": "woven-fabric",
            "name": "Woven Fabric",
            "cat": "texture",
            "type": "texture",
            "c1": "#f8fafc",
            "url": "https://www.transparenttextures.com/patterns/fabric-plaid.png",
            "icon": "fa-rug"
        },
        {
            "id": "leather-grain",
            "name": "Saddle Leather",
            "cat": "texture",
            "type": "texture",
            "c1": "#d2b48c",
            "url": "https://www.transparenttextures.com/patterns/soft-wallpaper.png",
            "icon": "fa-scroll"
        },
        {
            "id": "carbon-weave",
            "name": "Carbon Weave",
            "cat": "texture",
            "type": "texture",
            "c1": "#1e293b",
            "url": "https://www.transparenttextures.com/patterns/dark-geometric.png",
            "icon": "fa-shield-halved"
        },
        {
            "id": "handmade-paper",
            "name": "Handmade Craft Paper",
            "cat": "texture",
            "type": "texture",
            "c1": "#faf8f0",
            "url": "https://www.transparenttextures.com/patterns/handmade-paper.png",
            "icon": "fa-leaf"
        },
        {
            "id": "rough-cloth",
            "name": "Rough Burlap",
            "cat": "texture",
            "type": "texture",
            "c1": "#f5ede1",
            "url": "https://www.transparenttextures.com/patterns/rough-cloth.png",
            "icon": "fa-bag-shopping"
        },
        {
            "id": "cross-stitch",
            "name": "Cross Stitch",
            "cat": "texture",
            "type": "texture",
            "c1": "#f1f5f9",
            "url": "https://www.transparenttextures.com/patterns/cross-stripes.png",
            "icon": "fa-xmark"
        },
        {
            "id": "vintage-speckle",
            "name": "Vintage Speckle",
            "cat": "texture",
            "type": "texture",
            "c1": "#fcfbf7",
            "url": "https://www.transparenttextures.com/patterns/subtle-freckles.png",
            "icon": "fa-certificate"
        },
        {
            "id": "herringbone-tex",
            "name": "Herringbone Weave",
            "cat": "texture",
            "type": "texture",
            "c1": "#f5f5f4",
            "url": "https://www.transparenttextures.com/patterns/herringbone.png",
            "icon": "fa-bars-staggered"
        },
        {
            "id": "crinkled-paper",
            "name": "Crinkled Paper",
            "cat": "texture",
            "type": "texture",
            "c1": "#fefce8",
            "url": "https://www.transparenttextures.com/patterns/crinkled-paper-texture.png",
            "icon": "fa-file"
        },
        {
            "id": "felt-surface",
            "name": "Wool Felt",
            "cat": "texture",
            "type": "texture",
            "c1": "#e2e8f0",
            "url": "https://www.transparenttextures.com/patterns/felt.png",
            "icon": "fa-mitten"
        },
        {
            "id": "light-wool",
            "name": "Light Wool Weave",
            "cat": "texture",
            "type": "texture",
            "c1": "#fafaf9",
            "url": "https://www.transparenttextures.com/patterns/knitted-netting.png",
            "icon": "fa-socks"
        },
        {
            "id": "micro-perforated",
            "name": "Micro Perforated",
            "cat": "texture",
            "type": "texture",
            "c1": "#f8fafc",
            "url": "https://www.transparenttextures.com/patterns/perforated-white.png",
            "icon": "fa-braille"
        },
        {
            "id": "subtle-stripes",
            "name": "Fine Pinstripe",
            "cat": "texture",
            "type": "texture",
            "c1": "#f8fafc",
            "url": "https://www.transparenttextures.com/patterns/pinstripe-light.png",
            "icon": "fa-align-left"
        },
        {
            "id": "honey-dew",
            "name": "Honeydew Melon",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f0fdf4",
            "c2": "#dcfce7",
            "icon": "fa-apple-whole"
        },
        {
            "id": "seafoam-glow",
            "name": "Seafoam Glow",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#e6fffa",
            "c2": "#b2f5ea",
            "icon": "fa-water"
        },
        {
            "id": "pale-papaya",
            "name": "Pale Papaya",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fff7ed",
            "c2": "#fed7aa",
            "icon": "fa-lemon"
        },
        {
            "id": "cloud-dancer",
            "name": "Cloud Dancer",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f8fafc",
            "c2": "#f1f5f9",
            "icon": "fa-cloud"
        },
        {
            "id": "rosewater",
            "name": "Rosewater Tint",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fff1f2",
            "c2": "#ffe4e6",
            "icon": "fa-spa"
        },
        {
            "id": "creamy-macaron",
            "name": "Creamy Macaron",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fdf4ff",
            "c2": "#fae8ff",
            "icon": "fa-cookie"
        },
        {
            "id": "almond-milk",
            "name": "Almond Milk",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fdfbf7",
            "c2": "#f7f1e5",
            "icon": "fa-mug-hot"
        },
        {
            "id": "foggy-fjord",
            "name": "Foggy Fjord",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f0fdfa",
            "c2": "#ccfbf1",
            "icon": "fa-mountain"
        },
        {
            "id": "soft-thistle",
            "name": "Soft Thistle",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#faf5ff",
            "c2": "#f3e8ff",
            "icon": "fa-plant-wilt"
        },
        {
            "id": "chamomile-tea",
            "name": "Chamomile Tea",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fefce8",
            "c2": "#fef9c3",
            "icon": "fa-mug-saucer"
        },
        {
            "id": "linen-whisper",
            "name": "Linen Whisper",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fbfaf8",
            "c2": "#f4efe6",
            "icon": "fa-feather"
        },
        {
            "id": "pale-sagebrush",
            "name": "Pale Sagebrush",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f2f7f4",
            "c2": "#dcece1",
            "icon": "fa-seedling"
        },
        {
            "id": "blush-prosecco",
            "name": "Blush Prosecco",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fff5f5",
            "c2": "#fed7d7",
            "icon": "fa-champagne-glasses"
        },
        {
            "id": "arctic-morning",
            "name": "Arctic Morning",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f0f9ff",
            "c2": "#bae6fd",
            "icon": "fa-snowflake"
        },
        {
            "id": "warm-shortbread",
            "name": "Warm Shortbread",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fffbeb",
            "c2": "#fde68a",
            "icon": "fa-bread-slice"
        },
        {
            "id": "silver-willow",
            "name": "Silver Willow",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f8fafc",
            "c2": "#e2e8f0",
            "icon": "fa-tree"
        },
        {
            "id": "neon-sunburst",
            "name": "Neon Sunburst",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#ff416c",
            "c2": "#ff4b2b",
            "icon": "fa-sun"
        },
        {
            "id": "malibu-sunset",
            "name": "Malibu Sunset",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#ff6b6b",
            "c2": "#ffe66d",
            "icon": "fa-umbrella-beach"
        },
        {
            "id": "deep-sapphire-glow",
            "name": "Sapphire Glow",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#0052d4",
            "c2": "#4364f7",
            "icon": "fa-gem"
        },
        {
            "id": "electric-violet",
            "name": "Electric Violet",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#7f00ff",
            "c2": "#e100ff",
            "icon": "fa-bolt"
        },
        {
            "id": "caribbean-turquoise",
            "name": "Caribbean Turquoise",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#00b4db",
            "c2": "#0083b0",
            "icon": "fa-water"
        },
        {
            "id": "ember-glow",
            "name": "Ember Glow",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#e65c00",
            "c2": "#f9d423",
            "icon": "fa-fire"
        },
        {
            "id": "amethyst-haze",
            "name": "Amethyst Haze",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#9d50bb",
            "c2": "#6e48aa",
            "icon": "fa-wand-magic-sparkles"
        },
        {
            "id": "acid-lime",
            "name": "Acid Lime",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#11998e",
            "c2": "#38ef7d",
            "icon": "fa-seedling"
        },
        {
            "id": "crimson-tide",
            "name": "Crimson Tide",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#642b73",
            "c2": "#c6426e",
            "icon": "fa-wave-square"
        },
        {
            "id": "solar-wind",
            "name": "Solar Wind",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#fe8c00",
            "c2": "#f83600",
            "icon": "fa-wind"
        },
        {
            "id": "plasma-blue",
            "name": "Plasma Blue",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#0575e6",
            "c2": "#00f260",
            "icon": "fa-atom"
        },
        {
            "id": "bubblegum-pop",
            "name": "Bubblegum Pop",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#ff9a8b",
            "c2": "#ff6a88",
            "icon": "fa-candy-cane"
        },
        {
            "id": "ultramarine-flow",
            "name": "Ultramarine Flow",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#1fa2ff",
            "c2": "#12d8fa",
            "icon": "fa-water"
        },
        {
            "id": "magma-core",
            "name": "Magma Core",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#cb2d3e",
            "c2": "#ef473a",
            "icon": "fa-volcano"
        },
        {
            "id": "neon-cyan-surge",
            "name": "Neon Cyan Surge",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#00f0ff",
            "c2": "#5200ff",
            "icon": "fa-bolt-lightning"
        },
        {
            "id": "velvet-ruby",
            "name": "Velvet Ruby",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#870000",
            "c2": "#190a05",
            "icon": "fa-ring"
        },
        {
            "id": "tropical-hibiscus",
            "name": "Tropical Hibiscus",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#fd746c",
            "c2": "#ff9068",
            "icon": "fa-spa"
        },
        {
            "id": "arctic-aurora",
            "name": "Arctic Aurora",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#02aab0",
            "c2": "#00cdac",
            "icon": "fa-icicles"
        },
        {
            "id": "cosmic-flare",
            "name": "Cosmic Flare",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#ff00cc",
            "c2": "#333399",
            "icon": "fa-meteor"
        },
        {
            "id": "golden-amber",
            "name": "Golden Amber",
            "cat": "gradient",
            "type": "gradient",
            "c1": "#f7971e",
            "c2": "#ffd200",
            "icon": "fa-coins"
        },
        {
            "id": "delaware-chancery",
            "name": "Delaware Chancery",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fcfcf9",
            "c2": "#f5f4ed",
            "icon": "fa-scale-balanced"
        },
        {
            "id": "singapore-finance",
            "name": "Singapore Financial",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f0fdf4",
            "c2": "#e2f7ea",
            "icon": "fa-landmark"
        },
        {
            "id": "canary-wharf",
            "name": "Canary Wharf Slate",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#eff6ff",
            "c2": "#dbeafe",
            "icon": "fa-building-columns"
        },
        {
            "id": "edinburgh-parchment",
            "name": "Edinburgh Parchment",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fdfbee",
            "c2": "#f5edd6",
            "icon": "fa-scroll"
        },
        {
            "id": "mit-cyber-tint",
            "name": "MIT Slate Tint",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f4f6f9",
            "c2": "#e5eaf2",
            "icon": "fa-microchip"
        },
        {
            "id": "cambridge-don",
            "name": "Cambridge Don Ivory",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fcfaf2",
            "c2": "#f7f1df",
            "icon": "fa-feather"
        },
        {
            "id": "oxford-press",
            "name": "Oxford Press Tint",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f7f7f9",
            "c2": "#eaebf0",
            "icon": "fa-book"
        },
        {
            "id": "barrister-silk",
            "name": "Barrister Silk",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fbfbfb",
            "c2": "#f0f0f2",
            "icon": "fa-user-tie"
        },
        {
            "id": "rotterdam-modern",
            "name": "Rotterdam Modern",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f1f5f9",
            "c2": "#e1e7ef",
            "icon": "fa-city"
        },
        {
            "id": "stockholm-clean",
            "name": "Stockholm Clean",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f9fafb",
            "c2": "#eceef1",
            "icon": "fa-square"
        },
        {
            "id": "milan-editorial",
            "name": "Milan Editorial",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#faf8f5",
            "c2": "#f2ede4",
            "icon": "fa-newspaper"
        },
        {
            "id": "monaco-prestige",
            "name": "Monaco Prestige",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fcfaf4",
            "c2": "#f6eee0",
            "icon": "fa-crown"
        },
        {
            "id": "hague-tribunal",
            "name": "The Hague Tribunal",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f3f6fa",
            "c2": "#e3eaf3",
            "icon": "fa-gavel"
        },
        {
            "id": "seoul-minimal",
            "name": "Seoul Minimal",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f8f9fa",
            "c2": "#e5e7eb",
            "icon": "fa-archway"
        },
        {
            "id": "dublin-parliament",
            "name": "Dublin Parliament",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f8faf5",
            "c2": "#e8f0df",
            "icon": "fa-clover"
        },
        {
            "id": "helsinki-frost",
            "name": "Helsinki Frost",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f6f9fb",
            "c2": "#e4edf3",
            "icon": "fa-snowflake"
        },
        {
            "id": "madrid-manuscript",
            "name": "Madrid Manuscript",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#faf7f0",
            "c2": "#f2ecd8",
            "icon": "fa-signature"
        },
        {
            "id": "toronto-sterling",
            "name": "Toronto Sterling",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f3f4f6",
            "c2": "#e1e3e8",
            "icon": "fa-tower-observation"
        },
        {
            "id": "geneva-treaty",
            "name": "Geneva Treaty Paper",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#fdfbf7",
            "c2": "#f7f2e7",
            "icon": "fa-file-contract"
        },
        {
            "id": "brussels-chancery",
            "name": "Brussels Chancery",
            "cat": "corporate",
            "type": "gradient",
            "c1": "#f2f5f9",
            "c2": "#e4ebf4",
            "icon": "fa-shield-halved"
        },
        {
            "id": "royal-velvet-dark",
            "name": "Royal Velvet Dark",
            "cat": "dark",
            "type": "gradient",
            "c1": "#1f0036",
            "c2": "#35005c",
            "icon": "fa-crown"
        },
        {
            "id": "dark-mahogany",
            "name": "Dark Mahogany",
            "cat": "dark",
            "type": "gradient",
            "c1": "#1a0d0a",
            "c2": "#2e1610",
            "icon": "fa-tree"
        },
        {
            "id": "deep-merlot",
            "name": "Deep Merlot",
            "cat": "dark",
            "type": "gradient",
            "c1": "#260611",
            "c2": "#3f0d1f",
            "icon": "fa-wine-glass"
        },
        {
            "id": "obsidian-shale",
            "name": "Obsidian Shale",
            "cat": "dark",
            "type": "gradient",
            "c1": "#121316",
            "c2": "#1e2025",
            "icon": "fa-gem"
        },
        {
            "id": "astral-navy",
            "name": "Astral Navy",
            "cat": "dark",
            "type": "gradient",
            "c1": "#081226",
            "c2": "#102142",
            "icon": "fa-meteor"
        },
        {
            "id": "midnight-forest",
            "name": "Midnight Forest",
            "cat": "dark",
            "type": "gradient",
            "c1": "#041910",
            "c2": "#092e1f",
            "icon": "fa-leaf"
        },
        {
            "id": "black-pearl",
            "name": "Black Pearl",
            "cat": "dark",
            "type": "gradient",
            "c1": "#0e1118",
            "c2": "#1b212f",
            "icon": "fa-circle"
        },
        {
            "id": "carbon-matrix",
            "name": "Carbon Matrix",
            "cat": "dark",
            "type": "gradient",
            "c1": "#0f1412",
            "c2": "#1c2622",
            "icon": "fa-terminal"
        },
        {
            "id": "dark-amethyst-noir",
            "name": "Amethyst Noir",
            "cat": "dark",
            "type": "gradient",
            "c1": "#170a24",
            "c2": "#28143d",
            "icon": "fa-gem"
        },
        {
            "id": "smoked-obsidian",
            "name": "Smoked Obsidian",
            "cat": "dark",
            "type": "gradient",
            "c1": "#161616",
            "c2": "#262626",
            "icon": "fa-cloud"
        },
        {
            "id": "abyssal-trench",
            "name": "Abyssal Trench",
            "cat": "dark",
            "type": "gradient",
            "c1": "#030e1c",
            "c2": "#091e38",
            "icon": "fa-water"
        },
        {
            "id": "dark-espresso-crema",
            "name": "Dark Crema",
            "cat": "dark",
            "type": "gradient",
            "c1": "#1f150e",
            "c2": "#332317",
            "icon": "fa-mug-hot"
        },
        {
            "id": "steel-monolith",
            "name": "Steel Monolith",
            "cat": "dark",
            "type": "gradient",
            "c1": "#1a1d24",
            "c2": "#282d37",
            "icon": "fa-monument"
        },
        {
            "id": "gothic-crypt",
            "name": "Gothic Crypt",
            "cat": "dark",
            "type": "gradient",
            "c1": "#130f1c",
            "c2": "#221b30",
            "icon": "fa-cross"
        },
        {
            "id": "dark-cast-iron",
            "name": "Dark Cast Iron",
            "cat": "dark",
            "type": "gradient",
            "c1": "#17181c",
            "c2": "#23252b",
            "icon": "fa-shield"
        },
        {
            "id": "velvet-noir",
            "name": "Velvet Noir",
            "cat": "dark",
            "type": "gradient",
            "c1": "#0f0d14",
            "c2": "#1e1929",
            "icon": "fa-feather"
        },
        {
            "id": "black-amber",
            "name": "Black Amber",
            "cat": "dark",
            "type": "gradient",
            "c1": "#1f1305",
            "c2": "#33200a",
            "icon": "fa-sun"
        },
        {
            "id": "cyber-graphite",
            "name": "Cyber Graphite",
            "cat": "dark",
            "type": "gradient",
            "c1": "#111418",
            "c2": "#1e232a",
            "icon": "fa-microchip"
        },
        {
            "id": "midnight-indigo",
            "name": "Midnight Indigo",
            "cat": "dark",
            "type": "gradient",
            "c1": "#0b0c26",
            "c2": "#141640",
            "icon": "fa-compass"
        },
        {
            "id": "dark-hematite",
            "name": "Dark Hematite",
            "cat": "dark",
            "type": "gradient",
            "c1": "#1b1c1e",
            "c2": "#2b2d30",
            "icon": "fa-atom"
        },
        {
            "id": "subtle-zebra",
            "name": "Subtle Zebra Paper",
            "cat": "texture",
            "type": "texture",
            "c1": "#f8fafc",
            "url": "https://www.transparenttextures.com/patterns/subtle-zebra-3d.png",
            "icon": "fa-bars"
        },
        {
            "id": "criss-cross",
            "name": "Criss Cross Linen",
            "cat": "texture",
            "type": "texture",
            "c1": "#fafaf9",
            "url": "https://www.transparenttextures.com/patterns/crissxcross.png",
            "icon": "fa-xmark"
        },
        {
            "id": "graph-coders",
            "name": "Engineer Grid",
            "cat": "texture",
            "type": "texture",
            "c1": "#f1f5f9",
            "url": "https://www.transparenttextures.com/patterns/graph-paper.png",
            "icon": "fa-table-cells"
        },
        {
            "id": "woven-basket",
            "name": "Woven Basket",
            "cat": "texture",
            "type": "texture",
            "c1": "#fbf7ee",
            "url": "https://www.transparenttextures.com/patterns/woven.png",
            "icon": "fa-basket-shopping"
        },
        {
            "id": "french-stucco",
            "name": "French Stucco",
            "cat": "texture",
            "type": "texture",
            "c1": "#f7f6f0",
            "url": "https://www.transparenttextures.com/patterns/french-stucco.png",
            "icon": "fa-paint-roller"
        },
        {
            "id": "grey-sand",
            "name": "Grey Sand Texture",
            "cat": "texture",
            "type": "texture",
            "c1": "#e2e8f0",
            "url": "https://www.transparenttextures.com/patterns/grey-sandbag.png",
            "icon": "fa-water"
        },
        {
            "id": "white-tiles",
            "name": "Mosaic Tiles",
            "cat": "texture",
            "type": "texture",
            "c1": "#ffffff",
            "url": "https://www.transparenttextures.com/patterns/white-tiles.png",
            "icon": "fa-border-all"
        },
        {
            "id": "rice-paper",
            "name": "Japanese Rice Paper",
            "cat": "texture",
            "type": "texture",
            "c1": "#fcfbf4",
            "url": "https://www.transparenttextures.com/patterns/rice-paper-2.png",
            "icon": "fa-scroll"
        },
        {
            "id": "clean-linen",
            "name": "Pressed White Linen",
            "cat": "texture",
            "type": "texture",
            "c1": "#fefefe",
            "url": "https://www.transparenttextures.com/patterns/white-linen.png",
            "icon": "fa-shirt"
        },
        {
            "id": "wave-cut",
            "name": "Wave Cut Paper",
            "cat": "texture",
            "type": "texture",
            "c1": "#f0fdfa",
            "url": "https://www.transparenttextures.com/patterns/wave-cut.png",
            "icon": "fa-water"
        },
        {
            "id": "cardboard-grain",
            "name": "Kraft Cardboard",
            "cat": "texture",
            "type": "texture",
            "c1": "#e8d8b8",
            "url": "https://www.transparenttextures.com/patterns/cardboard-flat.png",
            "icon": "fa-box"
        },
        {
            "id": "light-honeycomb",
            "name": "Honeycomb Mesh",
            "cat": "texture",
            "type": "texture",
            "c1": "#f8fafc",
            "url": "https://www.transparenttextures.com/patterns/white-diamond-dark.png",
            "icon": "fa-shapes"
        },
        {
            "id": "sandpaper-tex",
            "name": "Fine Sandpaper",
            "cat": "texture",
            "type": "texture",
            "c1": "#f5f0e6",
            "url": "https://www.transparenttextures.com/patterns/sandpaper.png",
            "icon": "fa-brush"
        },
        {
            "id": "twill-weave",
            "name": "Heavy Cotton Twill",
            "cat": "texture",
            "type": "texture",
            "c1": "#f1f5f9",
            "url": "https://www.transparenttextures.com/patterns/twill.png",
            "icon": "fa-layer-group"
        },
        {
            "id": "padded-leather",
            "name": "Padded White Leather",
            "cat": "texture",
            "type": "texture",
            "c1": "#fafafa",
            "url": "https://www.transparenttextures.com/patterns/padded-light.png",
            "icon": "fa-couch"
        },
        {
            "id": "brushed-steel-tex",
            "name": "Brushed Steel",
            "cat": "texture",
            "type": "texture",
            "c1": "#cbd5e1",
            "url": "https://www.transparenttextures.com/patterns/brushed-alum-dark.png",
            "icon": "fa-shield"
        },
        {
            "id": "subtle-net",
            "name": "Subtle Netting",
            "cat": "texture",
            "type": "texture",
            "c1": "#f8fafc",
            "url": "https://www.transparenttextures.com/patterns/subtle-net.png",
            "icon": "fa-table-cells-large"
        },
        {
            "id": "groove-paper",
            "name": "Grooved Paper",
            "cat": "texture",
            "type": "texture",
            "c1": "#faf9f5",
            "url": "https://www.transparenttextures.com/patterns/groovepaper.png",
            "icon": "fa-file"
        },
        {
            "id": "chalk-dust",
            "name": "Light Chalk Texture",
            "cat": "texture",
            "type": "texture",
            "c1": "#f4f4f5",
            "url": "https://www.transparenttextures.com/patterns/chalkdust.png",
            "icon": "fa-pen-nib"
        },
        {
            "id": "vintage-wallpaper",
            "name": "Victorian Damask Paper",
            "cat": "texture",
            "type": "texture",
            "c1": "#fcfbf6",
            "url": "https://www.transparenttextures.com/patterns/vintage-speckles.png",
            "icon": "fa-crown"
        },
        {
            "id": "elderflower-cream",
            "name": "Elderflower Cream",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fefce8",
            "c2": "#fef08a",
            "icon": "fa-seedling"
        },
        {
            "id": "lavender-ice",
            "name": "Lavender Ice",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f5f3ff",
            "c2": "#ede9fe",
            "icon": "fa-snowflake"
        },
        {
            "id": "soft-cashmere",
            "name": "Soft Cashmere",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#faf7f2",
            "c2": "#ede4d6",
            "icon": "fa-mitten"
        },
        {
            "id": "ocean-foam",
            "name": "Ocean Foam",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#ecfdf5",
            "c2": "#d1fae5",
            "icon": "fa-water"
        },
        {
            "id": "blush-peony",
            "name": "Blush Peony",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fff1f2",
            "c2": "#ffe4e6",
            "icon": "fa-spa"
        },
        {
            "id": "sweet-cantaloupe",
            "name": "Sweet Cantaloupe",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fff7ed",
            "c2": "#fed7aa",
            "icon": "fa-lemon"
        },
        {
            "id": "willow-green",
            "name": "Willow Green",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f0fdf4",
            "c2": "#dcfce7",
            "icon": "fa-leaf"
        },
        {
            "id": "powder-hydrangea",
            "name": "Powder Hydrangea",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#eff6ff",
            "c2": "#dbeafe",
            "icon": "fa-seedling"
        },
        {
            "id": "soft-chamois",
            "name": "Soft Chamois",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fdfbf7",
            "c2": "#f5edd8",
            "icon": "fa-scroll"
        },
        {
            "id": "pebble-grey",
            "name": "Pebble Grey",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f8fafc",
            "c2": "#e2e8f0",
            "icon": "fa-gem"
        },
        {
            "id": "pale-terracotta",
            "name": "Pale Terracotta",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fff1ee",
            "c2": "#fed7cd",
            "icon": "fa-shapes"
        },
        {
            "id": "creamy-vanilla",
            "name": "Creamy Vanilla",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fefdf0",
            "c2": "#fef7cd",
            "icon": "fa-ice-cream"
        },
        {
            "id": "mint-eucalyptus",
            "name": "Mint Eucalyptus",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f0fdf9",
            "c2": "#ccfbf1",
            "icon": "fa-wind"
        },
        {
            "id": "soft-primrose",
            "name": "Soft Primrose",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fffbeb",
            "c2": "#fef3c7",
            "icon": "fa-sun"
        },
        {
            "id": "misty-heath",
            "name": "Misty Heath",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#faf5ff",
            "c2": "#f3e8ff",
            "icon": "fa-cloud"
        },
        {
            "id": "warm-biscuit",
            "name": "Warm Biscuit",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#faf6f0",
            "c2": "#ece2d0",
            "icon": "fa-cookie"
        },
        {
            "id": "blush-quartz",
            "name": "Blush Quartz",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fdf2f4",
            "c2": "#fce2e6",
            "icon": "fa-heart"
        },
        {
            "id": "pale-aquamarine",
            "name": "Pale Aquamarine",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#f0fdfa",
            "c2": "#bbf7d0",
            "icon": "fa-water"
        },
        {
            "id": "soft-flaxen",
            "name": "Soft Flaxen",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fefce8",
            "c2": "#fbf3b9",
            "icon": "fa-wheat-awn"
        },
        {
            "id": "nordic-birch-pastel",
            "name": "Nordic Birch Pastel",
            "cat": "pastel",
            "type": "gradient",
            "c1": "#fafaf8",
            "c2": "#ede8db",
            "icon": "fa-tree"
        }
    ];

    const getThemeBackgroundCss = (t) => {
        if (t.type === 'gradient') {
            return `linear-gradient(135deg, ${t.c1}, ${t.c2})`;
        } else {
            return `${t.c1} url('${t.url}')`;
        }
    };

    const createSwatchEl = (t, extraClass = '') => {
        const div = document.createElement('div');
        div.className = `ts-swatch ${extraClass}`.trim();
        div.setAttribute('data-theme-id', t.id);
        div.setAttribute('data-theme-name', t.name);
        div.setAttribute('data-type', t.type);
        div.setAttribute('data-c1', t.c1);
        if (t.c2) div.setAttribute('data-c2', t.c2);
        if (t.url) div.setAttribute('data-url', t.url);
        div.title = t.name;
        div.style.background = getThemeBackgroundCss(t);
        return div;
    };

    // ==========================================
    // 4. BUILD THE UI DOM
    // ==========================================
    const studioContainer = document.createElement('div');
    studioContainer.id = 'advanced-theme-studio';
    studioContainer.className = 'group';

    // 4a. Compact Ribbon Gallery Container
    const galleryContainer = document.createElement('div');
    galleryContainer.className = 'ts-gallery-container';
    galleryContainer.id = 'ts-gallery-container';

    const galleryViewport = document.createElement('div');
    galleryViewport.className = 'ts-gallery-viewport';
    galleryViewport.id = 'ts-gallery-viewport';

    const galleryStrip = document.createElement('div');
    galleryStrip.className = 'ts-gallery-strip';
    galleryStrip.id = 'ts-gallery-strip';

    // Populate gallery strip with all 88 themes
    ALL_THEMES.forEach(t => {
        galleryStrip.appendChild(createSwatchEl(t));
    });
    galleryViewport.appendChild(galleryStrip);

    // Vertical Gallery Controls (▲, ▼, ⌄)
    const galleryControls = document.createElement('div');
    galleryControls.className = 'ts-gallery-controls';
    galleryControls.innerHTML = `
        <button type="button" class="ts-gallery-btn" id="ts-gallery-up" title="Previous Themes (Up)">
            <svg viewBox="0 0 16 16" width="9" height="9" fill="currentColor"><path d="M8 4.5l5 5.5H3z"/></svg>
        </button>
        <button type="button" class="ts-gallery-btn" id="ts-gallery-down" title="Next Themes (Down)">
            <svg viewBox="0 0 16 16" width="9" height="9" fill="currentColor"><path d="M8 11.5l-5-5.5h10z"/></svg>
        </button>
        <button type="button" class="ts-gallery-btn" id="ts-gallery-more" title="More Themes (300 Catalog)">
            <svg viewBox="0 0 16 16" width="9" height="9" fill="currentColor"><path d="M2 3h12v1.8H2zm1.5 4.2h9L8 13z"/></svg>
        </button>
    `;

    galleryContainer.appendChild(galleryViewport);
    galleryContainer.appendChild(galleryControls);

    // Build ribbon layout
    studioContainer.innerHTML = `<div class="ts-ribbon-container">
            <div id="ts-clear-theme-btn" title="Remove Theme">
                <i class="fas fa-eraser"></i>
                <span style="line-height: 1.2;">Remove<br>Theme</span>
            </div>
            
            <div id="no-bg-btn" onclick="toggleIgnoreTheme()" title="Ignore Theme (Blank Page)">
                <i class="fas fa-ban"></i>
                <span style="line-height: 1.2;">Ignore<br>Theme</span>
            </div>
            
            <div class="ts-divider"></div>
            <!-- galleryContainer inserted here -->
            <div class="ts-divider"></div>
            
            <div class="ts-sliders-container" id="ts-sliders-container">
                <div class="ts-sliders-col" id="ts-col-1">
                    <div class="ts-slider-row" id="ts-row-sat">
                        <div class="ts-slider-label-wrap">
                            <span class="ts-slider-label">Saturation</span>
                            <span class="ts-badge-pill" id="ts-sat-badge" title="Click to reset Saturation to 100%">100%</span>
                        </div>
                        <input type="range" id="ts-sat-slider" class="ts-slider" min="0" max="200" value="100" aria-label="Saturation">
                    </div>
                    <div class="ts-slider-row" id="ts-row-bri">
                        <div class="ts-slider-label-wrap">
                            <span class="ts-slider-label">Brightness</span>
                            <span class="ts-badge-pill" id="ts-bri-badge" title="Click to reset Brightness to 100%">100%</span>
                        </div>
                        <input type="range" id="ts-bri-slider" class="ts-slider" min="50" max="150" value="100" aria-label="Brightness">
                    </div>
                    <div class="ts-slider-row" id="ts-row-con">
                        <div class="ts-slider-label-wrap">
                            <span class="ts-slider-label">Contrast</span>
                            <span class="ts-badge-pill" id="ts-con-badge" title="Click to reset Contrast to 100%">100%</span>
                        </div>
                        <input type="range" id="ts-con-slider" class="ts-slider" min="50" max="150" value="100" aria-label="Contrast">
                    </div>
                </div>
                
                <div class="ts-divider"></div>

                <div class="ts-sliders-col" id="ts-col-2">
                    <div class="ts-slider-row" id="ts-row-hue">
                        <div class="ts-slider-label-wrap">
                            <span class="ts-slider-label">Hue Shift</span>
                            <span class="ts-badge-pill" id="ts-hue-badge" title="Click to reset Hue Shift to 0°">0°</span>
                        </div>
                        <input type="range" id="ts-hue-slider" class="ts-slider" min="0" max="360" value="0" aria-label="Hue Shift">
                    </div>
                    <div class="ts-slider-row" id="ts-row-tex">
                        <div class="ts-slider-label-wrap">
                            <span class="ts-slider-label">Texture</span>
                            <span class="ts-badge-pill" id="ts-tex-badge" title="Click to reset Texture to 100%">100%</span>
                        </div>
                        <input type="range" id="ts-tex-slider" class="ts-slider" min="0" max="100" value="100" aria-label="Texture Opacity">
                    </div>
                    <div class="ts-slider-row" id="ts-row-size">
                        <div class="ts-slider-label-wrap">
                            <span class="ts-slider-label">Zoom</span>
                            <span class="ts-badge-pill" id="ts-size-badge" title="Click to reset Pattern Zoom to 100%">100%</span>
                        </div>
                        <input type="range" id="ts-size-slider" class="ts-slider" min="25" max="300" step="5" value="100" aria-label="Pattern Zoom">
                    </div>
                </div>
            </div>
        </div>
        <div class="group-label">Theme Studio</div>`;

    const dividers = studioContainer.querySelectorAll('.ts-divider');
    dividers[0].parentNode.insertBefore(galleryContainer, dividers[1]);

    // Inject studio container into the ribbon
    if (oldThemeGroup && oldThemeGroup.parentNode) {
        oldThemeGroup.parentNode.insertBefore(studioContainer, oldThemeGroup.nextSibling);
    } else {
        document.body.appendChild(studioContainer);
    }

    // 4b. Create Categorized Dropdown Popover
    const popover = document.createElement('div');
    popover.id = 'ts-gallery-popover';
    popover.style.display = 'none';

    let popoverBodyHTML = '';
    THEME_CATEGORIES.forEach(cat => {
        const catThemes = ALL_THEMES.filter(t => t.cat === cat.id);
        popoverBodyHTML += `
            <div class="ts-cat-section" data-cat="${cat.id}">
                <div class="ts-cat-header">
                    <span class="ts-cat-title"><i class="fas ${cat.icon}"></i> ${cat.name}</span>
                    <span class="ts-cat-badge">${catThemes.length}</span>
                </div>
                <div class="ts-cat-grid">
        `;
        catThemes.forEach(t => {
            const bg = getThemeBackgroundCss(t);
            const c2Attr = t.c2 ? `data-c2="${t.c2}"` : '';
            const urlAttr = t.url ? `data-url="${t.url}"` : '';
            popoverBodyHTML += `<div class="ts-swatch" data-theme-id="${t.id}" data-theme-name="${t.name}" data-type="${t.type}" data-c1="${t.c1}" ${c2Attr} ${urlAttr} title="${t.name}" style="background: ${bg};"></div>`;
        });
        popoverBodyHTML += `
                </div>
            </div>
        `;
    });

    popover.innerHTML = `
        <div class="ts-popover-header">
            <div class="ts-popover-title-row">
                <span class="ts-popover-title"><i class="fas fa-palette"></i> Theme Studio Catalog <span class="ts-badge-count">300</span></span>
                <button type="button" class="ts-popover-close" id="ts-popover-close" title="Close"><i class="fas fa-times"></i></button>
            </div>
            <div class="ts-popover-search-wrap">
                <i class="fas fa-search ts-search-icon"></i>
                <input type="text" id="ts-popover-search" placeholder="Search themes (e.g. Slate, Gold, Linen, Lavender)..." autocomplete="off">
                <button type="button" id="ts-popover-clear-search" style="display:none;" title="Clear Search"><i class="fas fa-times-circle"></i></button>
            </div>
        </div>
        <div class="ts-popover-body" id="ts-popover-body">
            ${popoverBodyHTML}
            <div id="ts-popover-empty" class="ts-popover-empty" style="display:none;">
                <i class="fas fa-search" style="font-size:24px; opacity:0.4;"></i>
                <span>No matching themes found</span>
            </div>
        </div>
        <div class="ts-popover-footer">
            <button type="button" class="ts-popover-action-btn" id="ts-pop-clear-btn">
                <i class="fas fa-eraser"></i> Remove Theme
            </button>
            <button type="button" class="ts-popover-action-btn" id="ts-pop-ignore-btn">
                <i class="fas fa-ban"></i> Toggle Ignore Theme
            </button>
        </div>
    `;
    document.body.appendChild(popover);

    if (typeof window.updateIgnoreThemeButtonUI === 'function') {
        window.updateIgnoreThemeButtonUI();
    }

    // ==========================================
    // 5. GALLERY STRIP NAVIGATION & POPOVER LOGIC
    // ==========================================
    let currentGalleryRow = 0;
    const swatchesPerRow = 8;
    const totalRows = Math.ceil(ALL_THEMES.length / swatchesPerRow);
    const maxGalleryRow = Math.max(0, totalRows - 2); // 2 rows visible in viewport
    const rowStepHeight = 28; // 24px swatch + 4px gap

    const updateGalleryStripPosition = () => {
        galleryStrip.style.transform = `translateY(-${currentGalleryRow * rowStepHeight}px)`;
        const upBtn = document.getElementById('ts-gallery-up');
        const downBtn = document.getElementById('ts-gallery-down');
        if (upBtn) {
            upBtn.classList.toggle('disabled', currentGalleryRow <= 0);
            upBtn.disabled = currentGalleryRow <= 0;
        }
        if (downBtn) {
            downBtn.classList.toggle('disabled', currentGalleryRow >= maxGalleryRow);
            downBtn.disabled = currentGalleryRow >= maxGalleryRow;
        }
    };
    updateGalleryStripPosition();

    document.getElementById('ts-gallery-up').addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentGalleryRow > 0) {
            currentGalleryRow--;
            updateGalleryStripPosition();
        }
    });

    document.getElementById('ts-gallery-down').addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentGalleryRow < maxGalleryRow) {
            currentGalleryRow++;
            updateGalleryStripPosition();
        }
    });

    galleryViewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY > 0 && currentGalleryRow < maxGalleryRow) {
            currentGalleryRow++;
            updateGalleryStripPosition();
        } else if (e.deltaY < 0 && currentGalleryRow > 0) {
            currentGalleryRow--;
            updateGalleryStripPosition();
        }
    }, { passive: false });

    const moreBtn = document.getElementById('ts-gallery-more');
    const closeBtn = document.getElementById('ts-popover-close');
    const searchInput = document.getElementById('ts-popover-search');
    const clearSearchBtn = document.getElementById('ts-popover-clear-search');
    const popEmpty = document.getElementById('ts-popover-empty');

    const openThemePopover = () => {
        popover.style.display = 'flex';
        moreBtn.classList.add('active');

        const rect = galleryContainer.getBoundingClientRect();
        const popWidth = 520;
        let left = rect.left;
        if (left + popWidth > window.innerWidth - 10) {
            left = window.innerWidth - popWidth - 10;
        }
        if (left < 10) left = 10;
        popover.style.top = (rect.bottom + 4) + 'px';
        popover.style.left = left + 'px';

        if (searchInput) {
            searchInput.value = '';
            filterPopoverThemes('');
            setTimeout(() => searchInput.focus(), 50);
        }
    };

    const closeThemePopover = () => {
        popover.style.display = 'none';
        moreBtn.classList.remove('active');
    };

    const toggleThemePopover = (e) => {
        if (e) e.stopPropagation();
        if (popover.style.display === 'none' || !popover.style.display) {
            openThemePopover();
        } else {
            closeThemePopover();
        }
    };

    moreBtn.addEventListener('click', toggleThemePopover);
    if (closeBtn) closeBtn.addEventListener('click', closeThemePopover);

    const filterPopoverThemes = (query) => {
        const q = (query || '').trim().toLowerCase();
        let totalMatches = 0;
        const sections = popover.querySelectorAll('.ts-cat-section');

        sections.forEach(sec => {
            let catMatches = 0;
            sec.querySelectorAll('.ts-swatch').forEach(sw => {
                const name = (sw.getAttribute('data-theme-name') || '').toLowerCase();
                const match = !q || name.includes(q);
                sw.style.display = match ? '' : 'none';
                if (match) catMatches++;
            });
            sec.style.display = catMatches > 0 ? '' : 'none';
            const badge = sec.querySelector('.ts-cat-badge');
            if (badge) badge.textContent = catMatches;
            totalMatches += catMatches;
        });

        if (popEmpty) popEmpty.style.display = totalMatches === 0 ? 'flex' : 'none';
        if (clearSearchBtn) clearSearchBtn.style.display = q ? 'block' : 'none';
    };

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterPopoverThemes(e.target.value);
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (searchInput.value) {
                    searchInput.value = '';
                    filterPopoverThemes('');
                } else {
                    closeThemePopover();
                }
            }
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            filterPopoverThemes('');
            searchInput.focus();
        });
    }

    document.addEventListener('click', (e) => {
        if (popover.style.display !== 'none' && popover.style.display) {
            if (!popover.contains(e.target) && !moreBtn.contains(e.target)) {
                closeThemePopover();
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popover.style.display !== 'none' && popover.style.display) {
            closeThemePopover();
        }
    });

    document.getElementById('ts-pop-clear-btn').addEventListener('click', () => {
        document.getElementById('ts-clear-theme-btn').click();
        closeThemePopover();
    });
    document.getElementById('ts-pop-ignore-btn').addEventListener('click', () => {
        if (typeof toggleIgnoreTheme === 'function') toggleIgnoreTheme();
        closeThemePopover();
    });

    const highlightActiveSwatch = (themeId, c1) => {
        const allSwatches = document.querySelectorAll('.ts-swatch');
        allSwatches.forEach(s => {
            const matches = (themeId && s.getAttribute('data-theme-id') === themeId) ||
                            (!themeId && s.getAttribute('data-c1') === c1);
            s.classList.toggle('active', !!matches);
        });

        if (themeId) {
            const stripSwatches = Array.from(galleryStrip.querySelectorAll('.ts-swatch'));
            const idx = stripSwatches.findIndex(s => s.getAttribute('data-theme-id') === themeId);
            if (idx >= 0) {
                const targetRow = Math.floor(idx / swatchesPerRow);
                if (targetRow < currentGalleryRow || targetRow > currentGalleryRow + 1) {
                    currentGalleryRow = Math.min(targetRow, maxGalleryRow);
                    updateGalleryStripPosition();
                }
            }
        }
    };

    // ==========================================
    // 6. THEME INJECTION & SAVE BACKUP
    // ==========================================
    const applyThemeToCanvas = (swatch) => {
        const paper = document.getElementById('paper');
        if (!paper) return;

        // When applying a theme, ensure ignoreBackground is turned off on current page
        if (state.pages && state.pages[state.currentPageIndex]) {
            state.pages[state.currentPageIndex].ignoreBackground = false;
        }
        if (typeof window.updateIgnoreThemeButtonUI === 'function') {
            window.updateIgnoreThemeButtonUI();
        }

        // Save active tab to prevent jump
        const activeTabEl = document.querySelector('.tab.active');
        let activeTabId = 'design';
        if (activeTabEl) {
            const m = activeTabEl.getAttribute('onclick')?.match(/switchTab\(['"]([^'"]+)['"]\)/);
            if (m && m[1]) activeTabId = m[1];
            else if (activeTabEl.id) activeTabId = activeTabEl.id.replace('tab-', '');
        }

        // Clear existing
        const existingTheme = paper.querySelector('[data-is-theme="true"]');
        if (existingTheme) existingTheme.remove();

        const id = swatch.getAttribute('data-theme-id') || '';
        const name = swatch.getAttribute('data-theme-name') || '';
        const type = swatch.getAttribute('data-type');
        const c1 = swatch.getAttribute('data-c1');
        const c2 = swatch.getAttribute('data-c2') || '';
        const url = swatch.getAttribute('data-url') || '';

        // Anchor configuration to root document
        paper.setAttribute('data-theme-saved', 'true');
        paper.setAttribute('data-theme-id', id);
        paper.setAttribute('data-theme-name', name);
        paper.setAttribute('data-theme-type', type);
        paper.setAttribute('data-theme-c1', c1);
        paper.setAttribute('data-theme-c2', c2);
        paper.setAttribute('data-theme-url', url);

        // Synchronize active highlights across strip & popover
        highlightActiveSwatch(id, c1);

        // Mute app's tab switching temporarily
        const originalSwitchTab = window.switchTab;
        window.switchTab = function() {}; 

        if (typeof createWrapper === 'function') {
            const wrapper = createWrapper(`<div class="op-theme-container" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;"></div>`);
            
            wrapper.setAttribute('data-is-theme', 'true');
            wrapper.setAttribute('data-type', 'box');
            wrapper.style.cssText += 'left: 0px !important; top: 0px !important; width: 100% !important; height: 100% !important; z-index: 0 !important;';

            const container = wrapper.querySelector('.op-theme-container');
            
            // Build visual layers
            const bgDiv = document.createElement('div');
            bgDiv.className = 'op-theme-bg';
            bgDiv.style.cssText = 'position:absolute; inset:0; width:100%; height:100%;';
            
            if (type === 'gradient') {
                bgDiv.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
            } else {
                bgDiv.style.backgroundColor = c1;
            }
            container.appendChild(bgDiv);

            if (type === 'texture') {
                const texDiv = document.createElement('div');
                texDiv.className = 'op-theme-tex';
                texDiv.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; background-repeat:repeat; opacity:1;';
                texDiv.style.backgroundImage = `url('${url}')`;
                const preloadImg = new Image();
                preloadImg.onload = () => {
                    if (preloadImg.naturalWidth > 0) {
                        texDiv.setAttribute('data-base-w', preloadImg.naturalWidth);
                        texDiv.setAttribute('data-base-h', preloadImg.naturalHeight);
                        updateLiveFilters();
                    }
                };
                preloadImg.src = url;
                container.appendChild(texDiv);
            }
            
            if (typeof deselect === 'function') deselect();
        }

        // Restore tab behavior
        window.switchTab = originalSwitchTab;
        if (activeTabId && typeof window.switchTab === 'function') {
            window.switchTab(activeTabId);
        }

        updateLiveFilters();
        if (typeof pushHistory === 'function') pushHistory();
    };

    const updateSliderTrackFill = (slider, min, max, val) => {
        if (!slider) return;
        const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
        const isDark = document.body.classList.contains('dark-mode');
        const bgEmpty = isDark ? '#334155' : '#e2e8f0';
        slider.style.background = `linear-gradient(to right, var(--ui-theme-color, #007670) 0%, var(--ui-theme-color, #007670) ${pct}%, ${bgEmpty} ${pct}%, ${bgEmpty} 100%)`;
    };

    const updateLiveFilters = () => {
        const paper = document.getElementById('paper');
        if (!paper) return;

        const satSlider = document.getElementById('ts-sat-slider');
        const briSlider = document.getElementById('ts-bri-slider');
        const conSlider = document.getElementById('ts-con-slider');
        const hueSlider = document.getElementById('ts-hue-slider');
        const texSlider = document.getElementById('ts-tex-slider');
        const sizeSlider = document.getElementById('ts-size-slider');
        const satBadge = document.getElementById('ts-sat-badge');
        const briBadge = document.getElementById('ts-bri-badge');
        const conBadge = document.getElementById('ts-con-badge');
        const hueBadge = document.getElementById('ts-hue-badge');
        const texBadge = document.getElementById('ts-tex-badge');
        const sizeBadge = document.getElementById('ts-size-badge');

        const sat = satSlider ? parseInt(satSlider.value, 10) : 100;
        const bri = briSlider ? parseInt(briSlider.value, 10) : 100;
        const con = conSlider ? parseInt(conSlider.value, 10) : 100;
        const hue = hueSlider ? parseInt(hueSlider.value, 10) : 0;
        const texVal = texSlider ? parseInt(texSlider.value, 10) : 100;
        const sizeVal = sizeSlider ? parseInt(sizeSlider.value, 10) : 100;
        const texStr = (texVal / 100).toString();

        // Backup slider states for saving & printing
        paper.setAttribute('data-theme-sat', sat);
        paper.setAttribute('data-theme-bri', bri);
        paper.setAttribute('data-theme-con', con);
        paper.setAttribute('data-theme-hue', hue);
        paper.setAttribute('data-theme-tex', texVal);
        paper.setAttribute('data-theme-size', sizeVal);

        // Also save to active page model so switching pages retains adjustments
        if (state.pages && state.pages[state.currentPageIndex]) {
            state.pages[state.currentPageIndex].themeSettings = {
                saved: paper.getAttribute('data-theme-saved') === 'true',
                id: paper.getAttribute('data-theme-id') || '',
                name: paper.getAttribute('data-theme-name') || '',
                type: paper.getAttribute('data-theme-type') || '',
                c1: paper.getAttribute('data-theme-c1') || '',
                c2: paper.getAttribute('data-theme-c2') || '',
                url: paper.getAttribute('data-theme-url') || '',
                sat: String(sat),
                bri: String(bri),
                con: String(con),
                hue: String(hue),
                tex: String(texVal),
                size: String(sizeVal)
            };
        }

        // Update numeric badges
        if (satBadge) satBadge.textContent = `${sat}%`;
        if (briBadge) briBadge.textContent = `${bri}%`;
        if (conBadge) conBadge.textContent = `${con}%`;
        if (hueBadge) hueBadge.textContent = `${hue}°`;

        // Update slider tracks
        if (satSlider) updateSliderTrackFill(satSlider, 0, 200, sat);
        if (briSlider) updateSliderTrackFill(briSlider, 50, 150, bri);
        if (conSlider) updateSliderTrackFill(conSlider, 50, 150, con);
        if (hueSlider) updateSliderTrackFill(hueSlider, 0, 360, hue);
        if (texSlider) updateSliderTrackFill(texSlider, 0, 100, texVal);
        if (sizeSlider) updateSliderTrackFill(sizeSlider, 25, 300, sizeVal);

        const themeLayer = paper.querySelector('[data-is-theme="true"]');
        const themeType = paper.getAttribute('data-theme-type') || '';
        const hasTextureLayer = themeLayer && !!themeLayer.querySelector('.op-theme-tex');
        const isTextureTheme = themeType === 'texture' || hasTextureLayer;

        const texRow = document.getElementById('ts-row-tex');
        const sizeRow = document.getElementById('ts-row-size');
        if (texSlider && texBadge) {
            if (isTextureTheme) {
                texSlider.disabled = false;
                texBadge.textContent = `${texVal}%`;
                texBadge.title = 'Click to reset Texture Opacity to 100%';
                texBadge.classList.remove('ts-badge-disabled');
                if (texRow) texRow.classList.remove('disabled');
            } else {
                texSlider.disabled = true;
                texBadge.textContent = 'None';
                texBadge.title = 'Texture opacity applies to textured themes';
                texBadge.classList.add('ts-badge-disabled');
                if (texRow) texRow.classList.add('disabled');
            }
        }
        if (sizeSlider && sizeBadge) {
            if (isTextureTheme) {
                sizeSlider.disabled = false;
                sizeBadge.textContent = `${sizeVal}%`;
                sizeBadge.title = 'Click to reset Pattern Zoom to 100%';
                sizeBadge.classList.remove('ts-badge-disabled');
                if (sizeRow) sizeRow.classList.remove('disabled');
            } else {
                sizeSlider.disabled = true;
                sizeBadge.textContent = 'None';
                sizeBadge.title = 'Pattern zoom applies to textured themes';
                sizeBadge.classList.add('ts-badge-disabled');
                if (sizeRow) sizeRow.classList.add('disabled');
            }
        }

        document.querySelectorAll('.op-theme-container').forEach(container => {
            container.style.filter = `saturate(${sat}%) brightness(${bri}%) contrast(${con}%) hue-rotate(${hue}deg)`;
            container.style.webkitFilter = `saturate(${sat}%) brightness(${bri}%) contrast(${con}%) hue-rotate(${hue}deg)`;
        });
        document.querySelectorAll('.op-theme-tex').forEach(texLayer => {
            texLayer.style.opacity = texStr;
            const baseW = parseFloat(texLayer.getAttribute('data-base-w')) || 100;
            if (sizeVal === 100) {
                texLayer.style.backgroundSize = 'auto auto';
            } else {
                const scaledW = Math.round(baseW * (sizeVal / 100));
                texLayer.style.backgroundSize = `${scaledW}px auto`;
            }
        });
    };

    // Wire up adjustment listeners
    const satSlider = document.getElementById('ts-sat-slider');
    const briSlider = document.getElementById('ts-bri-slider');
    const conSlider = document.getElementById('ts-con-slider');
    const hueSlider = document.getElementById('ts-hue-slider');
    const texSlider = document.getElementById('ts-tex-slider');
    const sizeSlider = document.getElementById('ts-size-slider');
    const satBadge = document.getElementById('ts-sat-badge');
    const briBadge = document.getElementById('ts-bri-badge');
    const conBadge = document.getElementById('ts-con-badge');
    const hueBadge = document.getElementById('ts-hue-badge');
    const texBadge = document.getElementById('ts-tex-badge');
    const sizeBadge = document.getElementById('ts-size-badge');

    if (satSlider) {
        satSlider.addEventListener('input', () => updateLiveFilters());
        satSlider.addEventListener('change', () => { if (typeof pushHistory === 'function') pushHistory(); });
    }
    if (briSlider) {
        briSlider.addEventListener('input', () => updateLiveFilters());
        briSlider.addEventListener('change', () => { if (typeof pushHistory === 'function') pushHistory(); });
    }
    if (conSlider) {
        conSlider.addEventListener('input', () => updateLiveFilters());
        conSlider.addEventListener('change', () => { if (typeof pushHistory === 'function') pushHistory(); });
    }
    if (hueSlider) {
        hueSlider.addEventListener('input', () => updateLiveFilters());
        hueSlider.addEventListener('change', () => { if (typeof pushHistory === 'function') pushHistory(); });
    }
    if (texSlider) {
        texSlider.addEventListener('input', () => updateLiveFilters());
        texSlider.addEventListener('change', () => { if (typeof pushHistory === 'function') pushHistory(); });
    }
    if (sizeSlider) {
        sizeSlider.addEventListener('input', () => updateLiveFilters());
        sizeSlider.addEventListener('change', () => { if (typeof pushHistory === 'function') pushHistory(); });
    }

    if (satBadge) {
        satBadge.addEventListener('click', () => {
            if (satSlider) {
                satSlider.value = 100;
                updateLiveFilters();
                if (typeof pushHistory === 'function') pushHistory();
            }
        });
    }
    if (briBadge) {
        briBadge.addEventListener('click', () => {
            if (briSlider) {
                briSlider.value = 100;
                updateLiveFilters();
                if (typeof pushHistory === 'function') pushHistory();
            }
        });
    }
    if (conBadge) {
        conBadge.addEventListener('click', () => {
            if (conSlider) {
                conSlider.value = 100;
                updateLiveFilters();
                if (typeof pushHistory === 'function') pushHistory();
            }
        });
    }
    if (hueBadge) {
        hueBadge.addEventListener('click', () => {
            if (hueSlider) {
                hueSlider.value = 0;
                updateLiveFilters();
                if (typeof pushHistory === 'function') pushHistory();
            }
        });
    }
    if (texBadge) {
        texBadge.addEventListener('click', () => {
            if (texSlider && !texSlider.disabled) {
                texSlider.value = 100;
                updateLiveFilters();
                if (typeof pushHistory === 'function') pushHistory();
            }
        });
    }
    if (sizeBadge) {
        sizeBadge.addEventListener('click', () => {
            if (sizeSlider && !sizeSlider.disabled) {
                sizeSlider.value = 100;
                updateLiveFilters();
                if (typeof pushHistory === 'function') pushHistory();
            }
        });
    }

    // Initial sync of track fill and badges
    updateLiveFilters();

    // ==========================================
    // 7. CLEAR THEME LOGIC
    // ==========================================
    document.getElementById('ts-clear-theme-btn').addEventListener('click', () => {
        const paper = document.getElementById('paper');
        if (paper) {
            const existingTheme = paper.querySelector('[data-is-theme="true"]');
            if (existingTheme) existingTheme.remove();
            paper.style.background = '#ffffff';
            
            // Wipe save backup
            paper.removeAttribute('data-theme-saved');
            ['id', 'name', 'type', 'c1', 'c2', 'url', 'sat', 'bri', 'con', 'hue', 'tex', 'size'].forEach(attr => {
                paper.removeAttribute(`data-theme-${attr}`);
            });
            if (state.pages && state.pages[state.currentPageIndex]) {
                delete state.pages[state.currentPageIndex].themeSettings;
            }
        }
        
        document.querySelectorAll('.ts-swatch').forEach(s => s.classList.remove('active'));
        if (document.getElementById('ts-sat-slider')) document.getElementById('ts-sat-slider').value = 100;
        if (document.getElementById('ts-bri-slider')) document.getElementById('ts-bri-slider').value = 100;
        if (document.getElementById('ts-con-slider')) document.getElementById('ts-con-slider').value = 100;
        if (document.getElementById('ts-hue-slider')) document.getElementById('ts-hue-slider').value = 0;
        if (document.getElementById('ts-tex-slider')) document.getElementById('ts-tex-slider').value = 100;
        if (document.getElementById('ts-size-slider')) document.getElementById('ts-size-slider').value = 100;
        updateLiveFilters();

        if (typeof pushHistory === 'function') pushHistory();
    });

    // ==========================================
    // 8. PRINT RESCUE HOOK
    // ==========================================
    window.addEventListener('beforeprint', () => {
        setTimeout(() => {
            const spooler = document.getElementById('op-print-spooler');
            if (!spooler) return;
            
            const scalers = spooler.querySelectorAll('.op-print-scaler');
            scalers.forEach(scaler => {
                const children = Array.from(scaler.children);
                children.forEach(child => {
                    if (child.innerHTML.includes('op-theme-container')) {
                        const pageWrapper = scaler.parentElement;
                        pageWrapper.insertBefore(child, scaler);
                        child.style.left = '0px';
                        child.style.top = '0px';
                        child.style.width = '100%';
                        child.style.height = '100%';
                        child.style.transform = 'none';
                        const content = child.querySelector('.element-content');
                        if (content) content.style.transform = 'none';

                        // Ensure background filter and texture opacity are explicitly preserved in print spooler
                        const container = child.querySelector('.op-theme-container');
                        if (container) {
                            const paper = document.getElementById('paper');
                            const sat = paper ? (paper.getAttribute('data-theme-sat') || '100') : '100';
                            const bri = paper ? (paper.getAttribute('data-theme-bri') || '100') : '100';
                            const con = paper ? (paper.getAttribute('data-theme-con') || '100') : '100';
                            const hue = paper ? (paper.getAttribute('data-theme-hue') || '0') : '0';
                            const tex = paper ? (paper.getAttribute('data-theme-tex') || '100') : '100';
                            const size = paper ? (paper.getAttribute('data-theme-size') || '100') : '100';

                            container.style.filter = `saturate(${sat}%) brightness(${bri}%) contrast(${con}%) hue-rotate(${hue}deg)`;
                            container.style.webkitFilter = `saturate(${sat}%) brightness(${bri}%) contrast(${con}%) hue-rotate(${hue}deg)`;
                            const texLayer = container.querySelector('.op-theme-tex');
                            if (texLayer) {
                                texLayer.style.opacity = (parseFloat(tex) / 100).toString();
                                const baseW = parseFloat(texLayer.getAttribute('data-base-w')) || 100;
                                if (size !== '100') {
                                    texLayer.style.backgroundSize = `${Math.round(baseW * (parseFloat(size) / 100))}px auto`;
                                }
                            }

                            if (typeof window.bakeThemeBackgroundForPrint === 'function') {
                                const tSettings = {
                                    saved: true,
                                    id: paper ? (paper.getAttribute('data-theme-id') || '') : '',
                                    type: paper ? (paper.getAttribute('data-theme-type') || 'color') : 'color',
                                    c1: paper ? (paper.getAttribute('data-theme-c1') || '#ffffff') : '#ffffff',
                                    c2: paper ? (paper.getAttribute('data-theme-c2') || '') : '',
                                    url: paper ? (paper.getAttribute('data-theme-url') || '') : '',
                                    sat: sat,
                                    bri: bri,
                                    con: con,
                                    hue: hue,
                                    tex: tex,
                                    size: size
                                };
                                const pw = pageWrapper.offsetWidth || 794;
                                const ph = pageWrapper.offsetHeight || 1123;
                                window.bakeThemeBackgroundForPrint(tSettings, pw, ph).then(bakedUrl => {
                                    if (bakedUrl) {
                                        container.innerHTML = `<img class="op-theme-baked-bg" src="${bakedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:fill; display:block; border:none; outline:none; margin:0; padding:0; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">`;
                                        container.style.filter = 'none';
                                        container.style.webkitFilter = 'none';
                                    }
                                }).catch(() => {});
                            }
                        }
                    }
                });
            });
        }, 5);
    });

    // ==========================================
    // 9. THE SELF-HEALING ENGINE & Z-INDEX
    // ==========================================
    window.restoreThemeFromSave = function() {
        const paper = document.getElementById('paper');
        if (!paper) return;

        // If current page has themeSettings saved on page model, synchronize to paper attributes
        if (state.pages && state.pages[state.currentPageIndex] && state.pages[state.currentPageIndex].themeSettings) {
            const ts = state.pages[state.currentPageIndex].themeSettings;
            if (ts.saved) {
                paper.setAttribute('data-theme-saved', 'true');
                if (ts.id) paper.setAttribute('data-theme-id', ts.id);
                if (ts.name) paper.setAttribute('data-theme-name', ts.name);
                if (ts.type) paper.setAttribute('data-theme-type', ts.type);
                if (ts.c1) paper.setAttribute('data-theme-c1', ts.c1);
                if (ts.c2) paper.setAttribute('data-theme-c2', ts.c2);
                if (ts.url) paper.setAttribute('data-theme-url', ts.url);
                if (ts.sat) paper.setAttribute('data-theme-sat', ts.sat);
                if (ts.bri) paper.setAttribute('data-theme-bri', ts.bri);
                if (ts.con) paper.setAttribute('data-theme-con', ts.con);
                if (ts.hue) paper.setAttribute('data-theme-hue', ts.hue);
                if (ts.tex) paper.setAttribute('data-theme-tex', ts.tex);
                if (ts.size) paper.setAttribute('data-theme-size', ts.size);
            }
        }

        if (paper.getAttribute('data-theme-saved') !== 'true') return;

        // If current page ignores theme, do not restore
        if (state.pages && state.pages[state.currentPageIndex] && state.pages[state.currentPageIndex].ignoreBackground) {
            return;
        }

        let theme = paper.querySelector('[data-is-theme="true"]');

        // Heal Scenario 1: Document loaded, theme was enabled, but wrapper was wiped out
        if (!theme) {
            console.log("🛠️ Theme Studio: Reconstructing deleted theme wrapper from save file...");
            const activeTabEl = document.querySelector('.tab.active');
            let activeTabId = 'design';
            if (activeTabEl) {
                const m = activeTabEl.getAttribute('onclick')?.match(/switchTab\(['"]([^'"]+)['"]\)/);
                if (m && m[1]) activeTabId = m[1];
                else if (activeTabEl.id) activeTabId = activeTabEl.id.replace('tab-', '');
            }

            const originalSwitchTab = window.switchTab;
            window.switchTab = function() {};

            if (typeof createWrapper === 'function') {
                theme = createWrapper(`<div class="op-theme-container"></div>`);
                theme.setAttribute('data-is-theme', 'true');
                theme.setAttribute('data-type', 'box');
                theme.style.cssText += 'left: 0px !important; top: 0px !important; width: 100% !important; height: 100% !important; z-index: 0 !important;';
                if (typeof deselect === 'function') deselect();
            }

            window.switchTab = originalSwitchTab;
            if (activeTabId && typeof window.switchTab === 'function') {
                window.switchTab(activeTabId);
            }
        }

        // Heal Scenario 2: Wrapper exists, but inner visuals were stripped during Save/Load
        if (theme && !theme.querySelector('.op-theme-bg')) {
            console.log("🛠️ Theme Studio: Restoring background visuals from save state...");
            
            const type = paper.getAttribute('data-theme-type');
            const c1 = paper.getAttribute('data-theme-c1');
            const c2 = paper.getAttribute('data-theme-c2');
            const url = paper.getAttribute('data-theme-url');

            if (type && c1) {
                theme.innerHTML = '';
                
                const container = document.createElement('div');
                container.className = 'op-theme-container';
                container.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; pointer-events:none; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;';
                
                const bgDiv = document.createElement('div');
                bgDiv.className = 'op-theme-bg';
                bgDiv.style.cssText = 'position:absolute; inset:0; width:100%; height:100%;';
                if (type === 'gradient') {
                    bgDiv.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
                } else {
                    bgDiv.style.backgroundColor = c1;
                }
                container.appendChild(bgDiv);

                if (type === 'texture') {
                    const texDiv = document.createElement('div');
                    texDiv.className = 'op-theme-tex';
                    texDiv.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; background-repeat:repeat; opacity:1;';
                    texDiv.style.backgroundImage = `url('${url}')`;
                    container.appendChild(texDiv);
                }
                theme.appendChild(container);

                // Restore UI Sliders
                const sat = paper.getAttribute('data-theme-sat');
                const bri = paper.getAttribute('data-theme-bri');
                const con = paper.getAttribute('data-theme-con');
                const hue = paper.getAttribute('data-theme-hue');
                const tex = paper.getAttribute('data-theme-tex');
                const size = paper.getAttribute('data-theme-size');
                
                if (sat && document.getElementById('ts-sat-slider')) document.getElementById('ts-sat-slider').value = sat;
                if (bri && document.getElementById('ts-bri-slider')) document.getElementById('ts-bri-slider').value = bri;
                if (con && document.getElementById('ts-con-slider')) document.getElementById('ts-con-slider').value = con;
                if (hue && document.getElementById('ts-hue-slider')) document.getElementById('ts-hue-slider').value = hue;
                if (tex && document.getElementById('ts-tex-slider')) document.getElementById('ts-tex-slider').value = tex;
                if (size && document.getElementById('ts-size-slider')) document.getElementById('ts-size-slider').value = size;

                // Restore UI Swatch highlight
                const savedId = paper.getAttribute('data-theme-id');
                highlightActiveSwatch(savedId, c1);

            }
        } else if (theme && theme.querySelector('.op-theme-bg')) {
            const sat = paper.getAttribute('data-theme-sat');
            const bri = paper.getAttribute('data-theme-bri');
            const con = paper.getAttribute('data-theme-con');
            const hue = paper.getAttribute('data-theme-hue');
            const tex = paper.getAttribute('data-theme-tex');
            const size = paper.getAttribute('data-theme-size');
            const satEl = document.getElementById('ts-sat-slider');
            const briEl = document.getElementById('ts-bri-slider');
            const conEl = document.getElementById('ts-con-slider');
            const hueEl = document.getElementById('ts-hue-slider');
            const texEl = document.getElementById('ts-tex-slider');
            const sizeEl = document.getElementById('ts-size-slider');
            let needsUpdate = false;
            if (sat && satEl && satEl.value !== sat) { satEl.value = sat; needsUpdate = true; }
            if (bri && briEl && briEl.value !== bri) { briEl.value = bri; needsUpdate = true; }
            if (con && conEl && conEl.value !== con) { conEl.value = con; needsUpdate = true; }
            if (hue && hueEl && hueEl.value !== hue) { hueEl.value = hue; needsUpdate = true; }
            if (tex && texEl && texEl.value !== tex) { texEl.value = tex; needsUpdate = true; }
            if (size && sizeEl && sizeEl.value !== size) { sizeEl.value = size; needsUpdate = true; }
            if (needsUpdate) updateLiveFilters();
        }

        // Maintain Stacking Order
        if (theme && theme.style.zIndex !== '0') {
            theme.style.zIndex = '0';
        }
    };

    setInterval(() => {
        const paper = document.getElementById('paper');
        if (!paper) return;

        let theme = document.querySelector('[data-is-theme="true"]');

        // Ignore Background Override
        if (state.pages[state.currentPageIndex] && state.pages[state.currentPageIndex].ignoreBackground) {
            if (theme) theme.remove();
            return;
        }

        if (typeof window.restoreThemeFromSave === 'function') {
            window.restoreThemeFromSave();
        }
        const border = document.getElementById('native-blueprint-border');
        if (border && border.style.zIndex !== '2') {
            border.style.zIndex = '2';
        }
    }, 500);

    // ==========================================
    // 10. THE DELAYED MOUSE-STEALTH DEFENSE
    // ==========================================
    let stealthTimer = null;
    
    const stealthTheme = () => {
        clearTimeout(stealthTimer);
        const theme = document.querySelector('[data-is-theme="true"]');
        if (theme) {
            theme.classList.remove('pub-element', 'selected', 'active-element');
        }
    };
    
    const unstealthTheme = () => {
        const theme = document.querySelector('[data-is-theme="true"]');
        if (theme) {
            if (!theme.classList.contains('pub-element')) {
                theme.classList.add('pub-element');
            }
            theme.classList.remove('selected', 'active-element');
        }
    };

    window.addEventListener('mousedown', stealthTheme, true);
    
    window.addEventListener('mousemove', (e) => {
        if (e.buttons > 0) stealthTheme();
    }, true);

    window.addEventListener('mouseup', () => {
        stealthTimer = setTimeout(unstealthTheme, 150);
    }, true);

    document.addEventListener('mouseleave', () => {
        stealthTimer = setTimeout(unstealthTheme, 150);
    }, true);

    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'a') {
            stealthTheme();
            stealthTimer = setTimeout(unstealthTheme, 150); 
        }
    }, true);

    window.addEventListener('beforeprint', unstealthTheme, true);

    // ==========================================
    // 11. BIND SWATCH & SLIDER EVENT LISTENERS
    // ==========================================
    galleryStrip.querySelectorAll('.ts-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            applyThemeToCanvas(swatch);
        });
    });

    popover.querySelectorAll('.ts-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            applyThemeToCanvas(swatch);
            // Popover remains open so user can preview and audition multiple themes against canvas without menu closing
        });
    });

    const sliders = studioContainer.querySelectorAll('.ts-slider');
    sliders.forEach(slider => {
        slider.addEventListener('input', updateLiveFilters);
        slider.addEventListener('change', () => {
            if (typeof pushHistory === 'function') pushHistory();
        });
    });

})();


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
