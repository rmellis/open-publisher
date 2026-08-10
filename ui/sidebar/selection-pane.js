window.toggleSelectionPane = function() {
    let panel = document.getElementById('op-selection-sidebar');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'op-selection-sidebar';
        panel.className = 'sidebar-panel op-sidebar visible';
        panel.innerHTML = `
            <div class="op-sidebar-header">
                <span class="op-sidebar-title">Selection Pane</span>
                <div class="op-sidebar-top-btns">
                    <button class="custom-dialog-close" onclick="document.getElementById('op-selection-sidebar').classList.remove('visible')"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="op-sidebar-section" style="padding-bottom: 5px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; gap: 6px;">
                    <div class="op-sidebar-btn btn-primary" style="flex:1; margin-bottom:0; justify-content:center; text-align:center;" onclick="window.setSelectionPaneVisibility(true)">Show All</div>
                    <div class="op-sidebar-btn btn-primary" style="flex:1; margin-bottom:0; justify-content:center; text-align:center;" onclick="window.setSelectionPaneVisibility(false)">Hide All</div>
                </div>
            </div>
            <div id="op-selection-list" style="overflow-y: auto; max-height: calc(100vh - 160px); padding: 0 10px;"></div>
        `;
        document.body.appendChild(panel);

        // Set up mutation observer on paper to automatically refresh the pane!
        const paper = document.getElementById('paper');
        if (paper) {
            const observer = new MutationObserver(() => {
                if (document.getElementById('op-selection-sidebar')?.classList.contains('visible')) {
                    window.refreshSelectionPane();
                }
            });
            observer.observe(paper, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'data-element-name'] });
        }
    } else {
        panel.classList.toggle('visible');
    }

    if (panel.classList.contains('visible')) {
        document.getElementById('op-image-sidebar')?.classList.remove('visible');
        document.getElementById('op-wordart-sidebar')?.classList.remove('visible');
        document.getElementById('op-table-sidebar')?.classList.remove('visible');
        window.refreshSelectionPane();
    }
};


window.setSelectionPaneVisibility = function(show) {
    const paper = document.getElementById('paper');
    if (!paper) return;
    const els = Array.from(paper.querySelectorAll('.pub-element'));
    els.forEach(el => {
        if (show) {
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    });
    if (typeof pushHistory === 'function') pushHistory();
};


window.refreshSelectionPane = function() {
    const panel = document.getElementById('op-selection-sidebar');
    if (!panel || !panel.classList.contains('visible')) return;

    const list = document.getElementById('op-selection-list');
    list.innerHTML = '';

    const paper = document.getElementById('paper');
    if (!paper) return;
    
    // Original elements array
    const originalEls = Array.from(paper.querySelectorAll('.pub-element'));
    
    // Clone array to sort (highest on top)
    const els = [...originalEls];
    els.sort((a, b) => {
        const za = parseInt(window.getComputedStyle(a).zIndex) || 0;
        const zb = parseInt(window.getComputedStyle(b).zIndex) || 0;
        if (za === zb) {
            return originalEls.indexOf(b) - originalEls.indexOf(a);
        }
        return zb - za;
    });

    els.forEach((el, index) => {
        let defaultName = "Element";
        if (el.querySelector('img')) defaultName = "Picture";
        else if (el.querySelector('svg')) defaultName = "Shape";
        else if (el.querySelector('table')) defaultName = "Table";
        else if (el.querySelector('.element-content')) defaultName = "Text Box";
        else if (el.querySelector('.wa-text')) defaultName = "WordArt";
        
        const name = el.getAttribute('data-element-name') || `${defaultName} ${originalEls.indexOf(el) + 1}`;
        const isHidden = el.style.display === 'none';
        const isSelected = typeof state !== 'undefined' && (state.selectedEl === el || el.classList.contains('selected'));

        const row = document.createElement('div');
        row.className = 'selection-pane-item' + (isSelected ? ' active' : '');
        row.style.cssText = `display:flex; align-items:center; padding: 6px 10px; margin-bottom: 4px; background: ${isSelected ? 'color-mix(in srgb, var(--ui-theme-color) 10%, transparent)' : 'var(--ui-panel-bg, #f8fafc)'}; border: 1px solid ${isSelected ? 'var(--ui-theme-color)' : 'var(--ui-border, #e2e8f0)'}; color: var(--ui-text); border-radius: 4px; cursor: pointer; transition: 0.2s;`;
        
        row.onclick = (e) => {
            if (e.target.closest('.selection-eye') || e.target.tagName === 'INPUT') return;
            if (typeof selectElement === 'function' && !isHidden) {
                selectElement(el);
            }
        };

        const eye = document.createElement('div');
        eye.className = 'selection-eye';
        eye.style.cssText = `padding: 4px; margin-right: 8px; cursor: pointer; color: ${isHidden ? '#94a3b8' : 'var(--ui-theme-color)'}; font-size: 14px; width: 20px; text-align: center;`;
        eye.innerHTML = `<i class="fas ${isHidden ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
        eye.onclick = (e) => {
            e.stopPropagation();
            el.style.display = isHidden ? '' : 'none';
            if (!isHidden && isSelected) {
                if (typeof deselect === 'function') deselect();
            }
            if (typeof pushHistory === 'function') pushHistory();
        };

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = name;
        nameInput.style.cssText = 'flex: 1; border: none; background: transparent; font-size: 13px; color: var(--ui-text, #334155); outline: none; padding: 2px 5px; min-width: 0;';
        nameInput.onchange = (e) => {
            el.setAttribute('data-element-name', e.target.value);
            if (typeof pushHistory === 'function') pushHistory();
        };

        row.appendChild(eye);
        row.appendChild(nameInput);
        list.appendChild(row);
    });
};
