// layout.js - Z-Index, Alignment, Grouping, and Snapping logic

(function installLayerManager() {
    const BASE_LAYER_Z = 10;

    function isOrderableElement(el) {
        if (!el || el.nodeType !== 1 || !el.classList || !el.classList.contains('pub-element')) return false;
        if (el.getAttribute('data-is-theme') === 'true' || el.classList.contains('op-theme-container')) return false;
        if (el.getAttribute('data-is-border') === 'true' || el.id === 'native-border-art-border' || el.id === 'native-blueprint-border') return false;
        if (el.classList.contains('master-page-element')) return false;
        const parentPub = el.parentElement && el.parentElement.closest ? el.parentElement.closest('.pub-element') : null;
        if (parentPub) return false;
        return true;
    }

    function readRawZIndex(el) {
        if (!el) return BASE_LAYER_Z;
        const inlineZ = parseInt(el.style && el.style.zIndex, 10);
        if (!isNaN(inlineZ)) return inlineZ;
        if (typeof window !== 'undefined' && window.getComputedStyle) {
            const compZ = parseInt(window.getComputedStyle(el).zIndex, 10);
            if (!isNaN(compZ)) return compZ;
        }
        return BASE_LAYER_Z;
    }

    function getPaperEl() {
        return (typeof paper !== 'undefined' && paper) ? paper : document.getElementById('paper');
    }

    function getOrderableElements(paperEl) {
        if (!paperEl) return [];
        return Array.from(paperEl.querySelectorAll('.pub-element')).filter(isOrderableElement);
    }

    function getSortedLayerElements(paperEl) {
        const els = getOrderableElements(paperEl);
        const domIndexMap = new Map();
        els.forEach((el, idx) => domIndexMap.set(el, idx));

        return els.slice().sort((a, b) => {
            const za = readRawZIndex(a);
            const zb = readRawZIndex(b);
            if (za !== zb) return za - zb;
            return domIndexMap.get(a) - domIndexMap.get(b);
        });
    }

    function applySequentialLayers(orderedEls) {
        let changed = false;
        window._isUpdatingLayers = true;
        try {
            for (let i = 0; i < orderedEls.length; i++) {
                const targetZ = String(BASE_LAYER_Z + i);
                if (orderedEls[i].style.zIndex !== targetZ) {
                    orderedEls[i].style.zIndex = targetZ;
                    changed = true;
                }
            }
        } finally {
            window._isUpdatingLayers = false;
        }
        return changed;
    }

    window.getNextLayerZIndex = function() {
        const paperEl = getPaperEl();
        const els = getOrderableElements(paperEl);
        if (els.length === 0) return BASE_LAYER_Z;
        let maxZ = BASE_LAYER_Z - 1;
        els.forEach(el => {
            const z = readRawZIndex(el);
            if (z > maxZ) maxZ = z;
        });
        return Math.max(BASE_LAYER_Z, maxZ + 1);
    };

    window.normalizeCanvasLayers = function(options) {
        const opts = options || {};
        const paperEl = getPaperEl();
        if (!paperEl || window._isUpdatingLayers) return false;
        const ordered = getSortedLayerElements(paperEl);
        if (ordered.length === 0) return false;

        // Check if any duplicate/conflicting or non-normalized z-index exists
        const seen = new Set();
        let needsNormalize = false;
        for (let i = 0; i < ordered.length; i++) {
            const raw = ordered[i].style.zIndex;
            const num = parseInt(raw, 10);
            if (isNaN(num) || num < BASE_LAYER_Z || seen.has(num) || String(num) !== String(BASE_LAYER_Z + i)) {
                needsNormalize = true;
                break;
            }
            seen.add(num);
        }

        if (!needsNormalize) return false;
        const changed = applySequentialLayers(ordered);
        if (changed && !opts.silent) {
            if (typeof window.refreshSelectionPane === 'function') window.refreshSelectionPane();
        }
        return changed;
    };

    function getActiveLayerTargets(paperEl, ordered) {
        const targets = new Set();
        if (typeof state !== 'undefined') {
            if (Array.isArray(state.multiSelected) && state.multiSelected.length > 0) {
                state.multiSelected.forEach(el => {
                    if (isOrderableElement(el) && paperEl.contains(el)) targets.add(el);
                });
            } else if (state.selectedEl && isOrderableElement(state.selectedEl) && paperEl.contains(state.selectedEl)) {
                targets.add(state.selectedEl);
            }
        }
        return ordered.filter(el => targets.has(el));
    }

    window.orderSelectionLayer = function(mode) {
        const paperEl = getPaperEl();
        if (!paperEl) return false;

        // Normalize existing conflicts/ties first so stacking matches visual paint order before stepping
        const ordered = getSortedLayerElements(paperEl);
        if (ordered.length === 0) return false;

        const selectedList = getActiveLayerTargets(paperEl, ordered);
        if (selectedList.length === 0) return false;

        const selectedSet = new Set(selectedList);
        let nextOrder = ordered.slice();

        if (mode === 'front') {
            const rest = ordered.filter(el => !selectedSet.has(el));
            nextOrder = rest.concat(selectedList);
        } else if (mode === 'back') {
            const rest = ordered.filter(el => !selectedSet.has(el));
            nextOrder = selectedList.concat(rest);
        } else if (mode === 'forward') {
            for (let i = nextOrder.length - 2; i >= 0; i--) {
                if (selectedSet.has(nextOrder[i]) && !selectedSet.has(nextOrder[i + 1])) {
                    const tmp = nextOrder[i];
                    nextOrder[i] = nextOrder[i + 1];
                    nextOrder[i + 1] = tmp;
                }
            }
        } else if (mode === 'backward') {
            for (let i = 1; i < nextOrder.length; i++) {
                if (selectedSet.has(nextOrder[i]) && !selectedSet.has(nextOrder[i - 1])) {
                    const tmp = nextOrder[i];
                    nextOrder[i] = nextOrder[i - 1];
                    nextOrder[i - 1] = tmp;
                }
            }
        }

        const changed = applySequentialLayers(nextOrder);
        if (changed) {
            if (typeof window.refreshSelectionPane === 'function') window.refreshSelectionPane();
            if (typeof updateThumbnails === 'function') updateThumbnails();
            if (typeof pushHistory === 'function') pushHistory();
        }
        return changed;
    };

    window.bringFront = function() {
        return window.orderSelectionLayer('front');
    };

    window.sendBack = function() {
        return window.orderSelectionLayer('back');
    };

    window.bringForward = function() {
        return window.orderSelectionLayer('forward');
    };

    window.sendBackward = function() {
        return window.orderSelectionLayer('backward');
    };

    // Actively track #paper element additions / removals / z-index changes so layers stay conflict-free
    let _layerSyncScheduled = false;
    const pendingAddedEls = new Set();

    function scheduleLayerSync() {
        if (_layerSyncScheduled || window._isUpdatingLayers) return;
        _layerSyncScheduled = true;
        queueMicrotask(() => {
            _layerSyncScheduled = false;
            const paperEl = getPaperEl();
            if (!paperEl || window._isUpdatingLayers || window._isRenderingPageLayers) {
                pendingAddedEls.clear();
                return;
            }
            const orderedExisting = getSortedLayerElements(paperEl);
            if (pendingAddedEls.size > 0 && !window._isRestoringHistoryLayers) {
                const existingSet = new Set(orderedExisting);
                const newlyAdded = Array.from(pendingAddedEls).filter(n => existingSet.has(n));
                pendingAddedEls.clear();

                // If newly created/pasted/duplicated elements collide with an existing layer's z-index,
                // bump them strictly above the current stack before normalizing sequentially.
                const usedExistingZ = new Set();
                let maxExistingZ = BASE_LAYER_Z - 1;
                orderedExisting.forEach(el => {
                    if (!newlyAdded.includes(el)) {
                        const z = readRawZIndex(el);
                        usedExistingZ.add(z);
                        if (z > maxExistingZ) maxExistingZ = z;
                    }
                });

                window._isUpdatingLayers = true;
                try {
                    newlyAdded.forEach(el => {
                        const curZ = readRawZIndex(el);
                        if (usedExistingZ.has(curZ) || curZ < BASE_LAYER_Z) {
                            maxExistingZ = Math.max(BASE_LAYER_Z, maxExistingZ + 1);
                            el.style.zIndex = String(maxExistingZ);
                        }
                    });
                } finally {
                    window._isUpdatingLayers = false;
                }
            } else {
                pendingAddedEls.clear();
            }

            window.normalizeCanvasLayers({ silent: false });
        });
    }

    let _paperLayerObs = null;

    window.beginPageLayerRender = function() {
        window._isRenderingPageLayers = true;
        pendingAddedEls.clear();
    };

    window.endPageLayerRender = function() {
        if (_paperLayerObs) {
            try { _paperLayerObs.takeRecords(); } catch (err) {}
        }
        pendingAddedEls.clear();
        window._isRenderingPageLayers = false;
        window.normalizeCanvasLayers({ silent: true });
    };

    function attachPaperLayerObserver() {
        const paperEl = getPaperEl();
        if (!paperEl || paperEl._opLayerObserverAttached || typeof MutationObserver === 'undefined') return;
        paperEl._opLayerObserverAttached = true;

        const obs = new MutationObserver((mutations) => {
            if (window._isUpdatingLayers || window._isRenderingPageLayers) return;
            let shouldSync = false;
            for (let i = 0; i < mutations.length; i++) {
                const m = mutations[i];
                if (m.type === 'childList') {
                    m.addedNodes.forEach(n => {
                        if (isOrderableElement(n)) {
                            pendingAddedEls.add(n);
                            shouldSync = true;
                        }
                    });
                    m.removedNodes.forEach(n => {
                        if (n && n.nodeType === 1 && n.classList && n.classList.contains('pub-element')) {
                            shouldSync = true;
                        }
                    });
                }
            }
            if (shouldSync) scheduleLayerSync();
        });

        _paperLayerObs = obs;
        obs.observe(paperEl, { childList: true });
        window.normalizeCanvasLayers({ silent: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachPaperLayerObserver);
    } else {
        attachPaperLayerObserver();
    }
    setTimeout(attachPaperLayerObserver, 300);
})();

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
