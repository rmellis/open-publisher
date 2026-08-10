window.setShadowPaneVisibility = function(visible) {
    let panel = document.getElementById('op-shadow-sidebar');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'op-shadow-sidebar';
        panel.className = 'sidebar-panel op-sidebar';
        panel.innerHTML = `
            <div class="op-sidebar-header">
                <span class="op-sidebar-title">Shadow / Glow Options</span>
                <div class="op-sidebar-top-btns">
                    <button class="custom-dialog-close" onclick="document.getElementById('op-shadow-sidebar').classList.remove('visible')"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="op-sidebar-section">
                <div class="op-sidebar-label">Shadow Color</div>
                <input type="hidden" id="shadow-color-input" value="#000000">
                <div style="width: 100%; height: 30px; border: 1px solid #ccc; cursor: pointer; background-color:#000000; border-radius:8px;" onclick="CustomColorPicker.open(this, document.getElementById('shadow-color-input').value, (c) => { document.getElementById('shadow-color-input').value = c; this.style.backgroundColor = c; window.updateShadowFromSliders(); })"></div>
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
        `;
        document.body.appendChild(panel);
    }
    
    if (visible) {
        document.querySelectorAll('.sidebar-panel.visible, .op-sidebar.visible').forEach(el => el.classList.remove('visible'));
        panel.classList.add('visible');
        window.parseShadowToSliders();
    } else {
        panel.classList.remove('visible');
    }
};


window.parseShadowToSliders = function() {
    if (!state.selectedEl) return;
    const legacyInner = state.selectedEl.querySelector('img') || state.selectedEl.querySelector('svg');
    let inner = state.selectedEl.querySelector('.element-content') || state.selectedEl;
    
    // Fallback parsing if shadow was already applied to an inner element before hotfix
    if (legacyInner && legacyInner.style.filter.includes('drop-shadow')) {
        inner = legacyInner;
    }

    const filter = inner.style.filter || '';
    const match = filter.match(/drop-shadow\(([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+(rgba?\([^)]+\)|#[0-9a-fA-F]+)\)/);
    if (match) {
        const x = parseFloat(match[1]);
        const y = parseFloat(match[2]);
        const blur = parseFloat(match[3]);
        let colorStr = match[4];
        
        let r = 0, g = 0, b = 0, a = 0.6;
        if (colorStr.startsWith('rgba') || colorStr.startsWith('rgb')) {
            const rgbaMatch = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
            if (rgbaMatch) {
                r = parseInt(rgbaMatch[1]);
                g = parseInt(rgbaMatch[2]);
                b = parseInt(rgbaMatch[3]);
                a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
            }
        }
        
        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        
        document.getElementById('shadow-x-slider').value = x;
        document.getElementById('shadow-x-val').innerText = x;
        document.getElementById('shadow-y-slider').value = y;
        document.getElementById('shadow-y-val').innerText = y;
        document.getElementById('shadow-blur-slider').value = blur;
        document.getElementById('shadow-blur-val').innerText = blur;
        document.getElementById('shadow-alpha-slider').value = Math.round((1 - a) * 100);
        document.getElementById('shadow-alpha-val').innerText = Math.round((1 - a) * 100);
        document.getElementById('shadow-color-input').value = hex;
    }
};


window.updateShadowFromSliders = function() {
    if (!state.selectedEl) return;
    const legacyInner = state.selectedEl.querySelector('img') || state.selectedEl.querySelector('svg');
    if (legacyInner && legacyInner.style.filter.includes('drop-shadow')) {
        legacyInner.style.filter = legacyInner.style.filter.replace(/drop-shadow\((?:[^)(]+|\([^)(]*\))*\)/g, '').trim();
    }
    const inner = state.selectedEl.querySelector('.element-content') || state.selectedEl;
    
    const x = document.getElementById('shadow-x-slider').value;
    const y = document.getElementById('shadow-y-slider').value;
    const blur = document.getElementById('shadow-blur-slider').value;
    const alphaSlider = document.getElementById('shadow-alpha-slider').value;
    const hex = document.getElementById('shadow-color-input').value;
    
    let r = parseInt(hex.substring(1,3), 16);
    let g = parseInt(hex.substring(3,5), 16);
    let b = parseInt(hex.substring(5,7), 16);
    let a = 1 - (alphaSlider / 100);
    
    const dropShadowStr = `drop-shadow(${x}px ${y}px ${blur}px rgba(${r},${g},${b},${a}))`;
    
    let currentFilter = inner.style.filter || '';
    if (currentFilter.includes('drop-shadow')) {
        inner.style.filter = currentFilter.replace(/drop-shadow\((?:[^)(]+|\([^)(]*\))*\)/g, dropShadowStr).trim();
    } else {
        inner.style.filter = (currentFilter + ' ' + dropShadowStr).trim();
    }
    
    clearTimeout(window.shadowHistoryTimeout);
    window.shadowHistoryTimeout = setTimeout(() => {
        if (typeof pushHistory === 'function') pushHistory();
    }, 500);
};
