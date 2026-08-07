// layout.js - Z-Index, Alignment, Grouping, and Snapping logic

window.bringFront = function() {
    if(state.selectedEl) {
        const els = Array.from(paper.querySelectorAll('.pub-element'));
        const maxZ = els.reduce((max, el) => Math.max(max, parseInt(el.style.zIndex) || 10), 0);
        state.selectedEl.style.zIndex = maxZ + 1;
        if(typeof pushHistory === 'function') pushHistory();
    }
};

window.sendBack = function() {
    if(state.selectedEl) {
        const els = Array.from(paper.querySelectorAll('.pub-element'));
        const minZ = els.reduce((min, el) => Math.min(min, parseInt(el.style.zIndex) || 10), 10000);
        state.selectedEl.style.zIndex = Math.max(1, minZ - 1);
        if(typeof pushHistory === 'function') pushHistory();
    }
};

window.toggleSnapMenu = function(btn) {
    const m = document.getElementById('snap-dropdown');
    if (!m) return;
    const isBlock = m.style.display === 'block';
    document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
    if (!isBlock) {
        m.style.display = 'block';
        const r = btn.getBoundingClientRect();
        if (r.left + m.offsetWidth > window.innerWidth) m.style.left = (r.right - m.offsetWidth) + 'px';
        else m.style.left = r.left + 'px';
        m.style.top = (r.bottom+5) + 'px';
    }
};

window.applySnapping = function(x, y, elW, elH, el, e) {
    if (e && (e.ctrlKey || e.metaKey)) return { x, y };
    
    let resX = x; let resY = y;
    
    let sgY = document.getElementById('smart-guide-y');
    if(!sgY) { 
        sgY = document.createElement('div'); 
        sgY.id='smart-guide-y'; 
        sgY.style.cssText='position:absolute; width:1px; height:100%; background:rgba(0,118,112,0.7); top:0; left:0; z-index:9999; opacity:0; pointer-events:none; transition: opacity 0.15s ease-out;'; 
        document.getElementById('paper').appendChild(sgY); 
    }
    let sgX = document.getElementById('smart-guide-x');
    if(!sgX) { 
        sgX = document.createElement('div'); 
        sgX.id='smart-guide-x'; 
        sgX.style.cssText='position:absolute; width:100%; height:1px; background:rgba(0,118,112,0.7); left:0; top:0; z-index:9999; opacity:0; pointer-events:none; transition: opacity 0.15s ease-out;'; 
        document.getElementById('paper').appendChild(sgX); 
    }
    
    sgY.style.opacity = '0';
    sgX.style.opacity = '0';

    if (state.snap.grid) {
        const tol = 15;
        const gx = Math.round(x / 20) * 20;
        const gy = Math.round(y / 20) * 20;
        if (Math.abs(x - gx) <= tol) resX = gx;
        if (Math.abs(y - gy) <= tol) resY = gy;
    }
    
    let snappedToGuideX = false;
    let snappedToGuideY = false;

    if (state.snap.guides) {
        const tol = 8;
        const margin = 48;
        const pw = 794; const ph = 1123;
        
        if (Math.abs(x - margin) <= tol) { resX = margin; snappedToGuideX = true; sgY.style.left = margin+'px'; }
        else if (Math.abs((x + elW) - (pw - margin)) <= tol) { resX = (pw - margin) - elW; snappedToGuideX = true; sgY.style.left = (pw-margin)+'px'; }
        else if (Math.abs((x + elW/2) - pw/2) <= tol) { resX = pw/2 - elW/2; snappedToGuideX = true; sgY.style.left = (pw/2)+'px'; }

        if (Math.abs(y - margin) <= tol) { resY = margin; snappedToGuideY = true; sgX.style.top = margin+'px'; }
        else if (Math.abs((y + elH) - (ph - margin)) <= tol) { resY = (ph - margin) - elH; snappedToGuideY = true; sgX.style.top = (ph-margin)+'px'; }
        else if (Math.abs((y + elH/2) - ph/2) <= tol) { resY = ph/2 - elH/2; snappedToGuideY = true; sgX.style.top = (ph/2)+'px'; }
        
        // Custom Guides
        document.querySelectorAll('.custom-guide.v').forEach(g => {
            const gX = parseFloat(g.style.left);
            if (Math.abs(x - gX) <= tol) { resX = gX; snappedToGuideX = true; sgY.style.left = gX+'px'; }
            else if (Math.abs((x + elW) - gX) <= tol) { resX = gX - elW; snappedToGuideX = true; sgY.style.left = gX+'px'; }
            else if (Math.abs((x + elW/2) - gX) <= tol) { resX = gX - elW/2; snappedToGuideX = true; sgY.style.left = gX+'px'; }
        });
        document.querySelectorAll('.custom-guide.h').forEach(g => {
            const gY = parseFloat(g.style.top);
            if (Math.abs(y - gY) <= tol) { resY = gY; snappedToGuideY = true; sgX.style.top = gY+'px'; }
            else if (Math.abs((y + elH) - gY) <= tol) { resY = gY - elH; snappedToGuideY = true; sgX.style.top = gY+'px'; }
            else if (Math.abs((y + elH/2) - gY) <= tol) { resY = gY - elH/2; snappedToGuideY = true; sgX.style.top = gY+'px'; }
        });
    }
    
    if (state.snap.objects && el) {
        const tol = 8;
        const siblings = Array.from(document.querySelectorAll('#paper > .pub-element')).filter(n => n !== el && (!state.multiSelected || !state.multiSelected.includes(n)));
        let snappedObjX = false; let snappedObjY = false;
        
        for (let sib of siblings) {
            const sL = parseFloat(sib.style.left); const sT = parseFloat(sib.style.top);
            const sW = sib.offsetWidth; const sH = sib.offsetHeight;
            
            if (!snappedToGuideX && !snappedObjX) {
                if (Math.abs(x - sL) <= tol) { resX = sL; snappedObjX = true; sgY.style.left = sL+'px'; } 
                else if (Math.abs((x + elW) - (sL + sW)) <= tol) { resX = (sL + sW) - elW; snappedObjX = true; sgY.style.left = (sL+sW)+'px'; } 
                else if (Math.abs(x - (sL + sW)) <= tol) { resX = sL + sW; snappedObjX = true; sgY.style.left = (sL+sW)+'px'; } 
                else if (Math.abs((x + elW) - sL) <= tol) { resX = sL - elW; snappedObjX = true; sgY.style.left = sL+'px'; } 
                else if (Math.abs((x + elW/2) - (sL + sW/2)) <= tol) { resX = (sL + sW/2) - elW/2; snappedObjX = true; sgY.style.left = (sL+sW/2)+'px'; } 
            }
            if (!snappedToGuideY && !snappedObjY) {
                if (Math.abs(y - sT) <= tol) { resY = sT; snappedObjY = true; sgX.style.top = sT+'px'; }
                else if (Math.abs((y + elH) - (sT + sH)) <= tol) { resY = (sT + sH) - elH; snappedObjY = true; sgX.style.top = (sT+sH)+'px'; }
                else if (Math.abs(y - (sT + sH)) <= tol) { resY = sT + sH; snappedObjY = true; sgX.style.top = (sT+sH)+'px'; }
                else if (Math.abs((y + elH) - sT) <= tol) { resY = sT - elH; snappedObjY = true; sgX.style.top = sT+'px'; }
                else if (Math.abs((y + elH/2) - (sT + sH/2)) <= tol) { resY = (sT + sH/2) - elH/2; snappedObjY = true; sgX.style.top = (sT+sH/2)+'px'; }
            }
            if ((snappedToGuideX || snappedObjX) && (snappedToGuideY || snappedObjY)) break;
        }
        if (snappedObjX) snappedToGuideX = true;
        if (snappedObjY) snappedToGuideY = true;
    }
    
    if (snappedToGuideX) sgY.style.opacity = '1';
    if (snappedToGuideY) sgX.style.opacity = '1';

    return { x: resX, y: resY };
};

document.addEventListener('mouseup', () => {
    const sgX = document.getElementById('smart-guide-x');
    const sgY = document.getElementById('smart-guide-y');
    if (sgX) sgX.style.opacity = '0';
    if (sgY) sgY.style.opacity = '0';
});
