window.toggleLockGuides = function() {
    state.isGuidesLocked = !state.isGuidesLocked;
    if (state.isGuidesLocked) {
        document.body.classList.add('guides-locked');
    } else {
        document.body.classList.remove('guides-locked');
    }
};


window.clearAllGuides = function() {
    if (state.isGuidesLocked) {
        DialogSystem.show('Guides Locked', 'Guides are currently locked. Please unlock guides before clearing them.', null, true);
        return;
    }
    const guides = document.querySelectorAll('.custom-guide');
    if (guides.length === 0) return;
    
    // Check if we should prompt
    DialogSystem.show('Clear All Guides', 'Are you sure you want to remove all custom guides from the canvas?', function() {
        guides.forEach(g => g.remove());
        pushHistory();
    }, false, 'Clear');
};


window.createNewGuide = function(dir, e) {
    if (state.isGuidesLocked) return;
    // Right/middle click on a ruler (unit menu etc.) must never spawn a guide or start a drag
    if (e && e.button !== undefined && e.button !== 0) return;
    
    const paperRect = paper.getBoundingClientRect();
    const zoom = state.zoom || 1.0;
    
    const guide = document.createElement('div');
    guide.className = `custom-guide ${dir}`;
    
    if (dir === 'h') {
        const y = (e.clientY - paperRect.top) / zoom;
        guide.style.top = y + 'px';
    } else {
        const x = (e.clientX - paperRect.left) / zoom;
        guide.style.left = x + 'px';
    }
    
    paper.appendChild(guide);
    
    // Immediately start dragging it
    state.dragMode = 'drag-guide';
    state.dragData = {
        guide: guide,
        dir: dir,
        startX: e.clientX,
        startY: e.clientY,
        startPos: parseFloat(guide.style[dir === 'h' ? 'top' : 'left'])
    };
    e.preventDefault();
};


/* --- CUSTOM GUIDE DRAG OVERRIDES (APPENDED FIX) --- */
window.addEventListener('mousedown', function(e) {
    if (e.target.classList.contains('custom-guide')) {
        if (state.isGuidesLocked) return;
        state.dragMode = 'drag-guide';
        const isH = e.target.classList.contains('h');
        state.dragData = {
            guide: e.target,
            dir: isH ? 'h' : 'v',
            startX: e.clientX,
            startY: e.clientY,
            startPos: parseFloat(e.target.style[isH ? 'top' : 'left'])
        };
        e.preventDefault();
        e.stopImmediatePropagation();
    }
}, true);

window.addEventListener('mousemove', function(e) {
    if (state.dragMode === 'drag-guide') {
        const zoom = state.zoom || 1.0;
        const dx = (e.clientX - state.dragData.startX) / zoom;
        const dy = (e.clientY - state.dragData.startY) / zoom;
        if (state.dragData.dir === 'h') {
            state.dragData.guide.style.top = (state.dragData.startPos + dy) + 'px';
        } else {
            state.dragData.guide.style.left = (state.dragData.startPos + dx) + 'px';
        }
        e.preventDefault();
        e.stopImmediatePropagation();
    }
}, true);

window.addEventListener('mouseup', function(e) {
    if (state.dragMode === 'drag-guide' && state.dragData.guide) {
        const paperRect = paper.getBoundingClientRect();
        const guideRect = state.dragData.guide.getBoundingClientRect();
        const rulerH = document.getElementById('ruler-h');
        const rulerV = document.getElementById('ruler-v');
        let remove = false;
        
        // Dropping a guide back onto its ruler (or beyond it) deletes it, exactly like dragging it out of the ruler in reverse.
        // A guide dropped well outside the paper is also deleted. There is no snap-to-paper-edge any more.
        if (state.dragData.dir === 'h') {
            const r = rulerH ? rulerH.getBoundingClientRect() : null;
            if (r && e.clientY <= r.bottom) remove = true;
            if (guideRect.top < paperRect.top - 20 || guideRect.top > paperRect.bottom + 20) remove = true;
        } else {
            const r = rulerV ? rulerV.getBoundingClientRect() : null;
            if (r && e.clientX <= r.right) remove = true;
            if (guideRect.left < paperRect.left - 20 || guideRect.left > paperRect.right + 20) remove = true;
        }
        
        if (remove) state.dragData.guide.remove();
        state.dragMode = null;
        state.dragData = {};
        e.stopImmediatePropagation();
    }
}, true);








