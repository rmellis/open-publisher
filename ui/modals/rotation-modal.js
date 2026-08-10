window.showRotationModal = function() {
    if (!state.selectedEl) return;
    let currentRot = 0;
    if (state.selectedEl.style.transform && state.selectedEl.style.transform.includes('rotate')) {
        const match = state.selectedEl.style.transform.match(/rotate\(([-\d.]+)deg\)/);
        if (match) currentRot = parseFloat(match[1]);
    }
    const form = `<div class="input-group"><label>Rotation (Degrees):</label><input type="number" id="exact-rotation-input" value="${currentRot}"></div>`;
    DialogSystem.show('Exact Rotation', form, () => {
        const deg = parseFloat(document.getElementById('exact-rotation-input').value) || 0;
        let trans = state.selectedEl.style.transform || '';
        if (trans.includes('rotate')) {
            trans = trans.replace(/rotate\([-\d.]+deg\)/, `rotate(${deg}deg)`);
        } else {
            trans += ` rotate(${deg}deg)`;
        }
        state.selectedEl.style.transform = trans;
        pushHistory();
    });
};


window.toggleRotateMenu = function(btn) {
    let m = document.getElementById('rotate-dropdown');
    if (!m) {
        m = document.createElement('div');
        m.id = 'rotate-dropdown';
        m.className = 'dropdown-menu';
        m.style.cssText = 'min-width: 150px;';
        
        const createItem = (icon, text, onclick) => {
            const d = document.createElement('div');
            d.className = 'dropdown-item';
            d.innerHTML = `<i class="fas ${icon}" style="width: 26px; text-align: center;"></i> <span>${text}</span>`;
            d.onclick = () => { m.style.display = 'none'; onclick(); };
            return d;
        };

        m.appendChild(createItem('fa-redo', 'Rotate Right 90°', () => { if(window.ContextRibbonActions) ContextRibbonActions.rotateRelative(90); }));
        m.appendChild(createItem('fa-undo', 'Rotate Left 90°', () => { if(window.ContextRibbonActions) ContextRibbonActions.rotateRelative(-90); }));
        m.appendChild(createItem('fa-arrows-alt-v', 'Flip Vertical', () => { if(window.ContextRibbonActions) ContextRibbonActions.flipScale('Y'); }));
        m.appendChild(createItem('fa-arrows-alt-h', 'Flip Horizontal', () => { if(window.ContextRibbonActions) ContextRibbonActions.flipScale('X'); }));
        
        const sep = document.createElement('div');
        sep.style.cssText = 'height: 1px; background: #e2e8f0; margin: 5px 0;';
        m.appendChild(sep);
        
        m.appendChild(createItem('fa-sync-alt', 'More Rotation Options...', () => { window.showRotationModal(); }));
        
        document.body.appendChild(m);
    }
    
    const isBlock = m.style.display === 'block';
    document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
    if (!isBlock) {
        const r = btn.getBoundingClientRect();
        m.style.left = r.left + 'px'; m.style.top = (r.bottom + 5) + 'px';
        m.style.display = 'block';
    }
};
