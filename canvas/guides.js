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
