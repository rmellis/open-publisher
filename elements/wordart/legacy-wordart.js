// --- 4. WORDART SWAP & SPELLCHECK FIX ---
const brokenWordArts = [
    6, 8, 10, 13, 17, 18, 24, 25, 28, 34, 55, 57, 60, 80, 90, 96, 
    102, 103, 109, 112, 113, 117, 118, 124, 125, 128, 131, 138, 
    140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 155, 
    160, 168, 169, 175, 177, 178, 181, 182, 184, 185, 187, 189, 
    190, 192, 193, 194, 195, 198, 199, 200
];

window.handleWordArtClick = function(i) {
    if (state.selectedEl && state.selectedEl.querySelector('.wa-text')) {
        const waText = state.selectedEl.querySelector('.wa-text');
        const classes = Array.from(waText.classList);
        classes.forEach(c => { if(c.startsWith('wa-style-')) waText.classList.remove(c); });
        waText.classList.add(`wa-style-${i}`);
        waText.setAttribute('spellcheck', 'false'); 
        if (typeof DialogSystem !== 'undefined') DialogSystem.close(); 
        const oldModal = document.getElementById('wordart-modal');
        if (oldModal) oldModal.style.display = 'none';
        if(typeof syncWordArt === 'function') syncWordArt(state.selectedEl);
        if(typeof pushHistory === 'function') pushHistory();
    } else {
        try {
            const el = createWrapper(`<div class="wa-wrapper"><div class="wa-text wa-style-${i}" spellcheck="false">Word Art</div></div>`);
            setTimeout(() => { if(typeof syncWordArt === 'function') syncWordArt(el); }, 10);
        } catch(e) { console.error(e); }
        if (typeof DialogSystem !== 'undefined') DialogSystem.close(); 
        const oldModal = document.getElementById('wordart-modal');
        if (oldModal) oldModal.style.display = 'none';
    }
};

window.initWordArt = function() {
    const grid = document.getElementById('wordart-grid'); if (!grid) return; 
    if (grid.children.length > 0) return;
    
    let html = '';
    for(let i=1; i<=214; i++) {
        if (brokenWordArts.includes(i)) continue;
        let demoText = 'Aa';
        if ((i >= 81 && i <= 90) || (i >= 141 && i <= 150) || (i >= 191 && i <= 200)) demoText = 'AaBb'; 
        else if (i === 112 || i === 113 || i === 145) demoText = 'TXT';
        
        html += `<div class="gallery-item" style="height:40px;" onclick="handleWordArtClick(${i})">
                    <div class="wa-text wa-style-${i}" style="font-size:24px; font-family: Impact, sans-serif;">${demoText}</div>
                 </div>`;
    }
    grid.innerHTML = html;
};
    // 3. WORDART MODAL OVERRIDE
    window.showWordArtModal = function() {
        if(window.rescueGrids) window.rescueGrids(); 
        let grid = document.getElementById('dialog-wordart-grid');
        
        // If grid doesn't exist at all, build it!
        if (!grid) {
            grid = document.createElement('div');
            grid.id = 'dialog-wordart-grid';
            grid.className = 'gallery-grid';
            grid.style.cssText = 'grid-template-columns: repeat(5, 1fr); gap: 10px; padding: 10px; background: #fafafa;';
            
            let gridHtml = '';
            for(let i=1; i<=214; i++) {
                if (brokenWordArts.includes(i)) continue;
                let demoText = 'Aa';
                if ((i >= 81 && i <= 90) || (i >= 141 && i <= 150) || (i >= 191 && i <= 200)) demoText = 'AaBb'; 
                else if (i === 112 || i === 113 || i === 145) demoText = 'TXT';
                
                gridHtml += `<div class="gallery-item" style="height:40px;" onclick="handleWordArtClick(${i})">
                            <div class="wa-text wa-style-${i}" style="font-size:24px; font-family: Impact, sans-serif;">${demoText}</div>
                         </div>`;
            }
            grid.innerHTML = gridHtml;
            // Place it in safe zone initially so it exists in DOM
            const safeZone = document.getElementById('modal-safe-zone');
            if (safeZone) safeZone.appendChild(grid);
        }

        const htmlStr = `<div id="dialog-wordart-container"></div>`;
        DialogSystem.show('WordArt Gallery', htmlStr, null, true);
        
        const dialogBox = document.getElementById('custom-dialog-box');
        if(dialogBox) {
            dialogBox.style.width = '650px';
            dialogBox.style.maxWidth = '95vw';
            const body = dialogBox.querySelector('.custom-dialog-body');
            if (body) { body.style.maxHeight = '65vh'; body.style.overflowY = 'auto'; }
        }
        
        // Retrieve grid from safe zone and append to the newly rendered modal container
        const container = document.getElementById('dialog-wordart-container');
        if (container && grid) {
            container.appendChild(grid);
            grid.style.display = 'grid'; // ensure it's visible
        }
    };

    if (window.ContextRibbonActions) {
        window.ContextRibbonActions.openWordArtModal = window.showWordArtModal;
    }


// --- MIGRATED WA TOOLBAR DRAG ---
let waToolbarDrag = { active: false, startX: 0, startY: 0, initLeft: 0, initTop: 0 };
function startDragWaToolbar(e) {
    e.preventDefault();
    e.stopPropagation();
    const tb = document.getElementById('wa-float-toolbar');
    waToolbarDrag.active = true;
    waToolbarDrag.startX = e.clientX;
    waToolbarDrag.startY = e.clientY;
    waToolbarDrag.initLeft = parseInt(tb.style.left || 0, 10);
    waToolbarDrag.initTop = parseInt(tb.style.top || 0, 10);
    
    document.addEventListener('mousemove', doDragWaToolbar);
    document.addEventListener('mouseup', stopDragWaToolbar);
}
function doDragWaToolbar(e) {
    if(!waToolbarDrag.active) return;
    const dx = e.clientX - waToolbarDrag.startX;
    const dy = e.clientY - waToolbarDrag.startY;
    const tb = document.getElementById('wa-float-toolbar');
    tb.style.left = (waToolbarDrag.initLeft + dx) + 'px';
    tb.style.top = (waToolbarDrag.initTop + dy) + 'px';
}
function stopDragWaToolbar() {
    waToolbarDrag.active = false;
    document.removeEventListener('mousemove', doDragWaToolbar);
    document.removeEventListener('mouseup', stopDragWaToolbar);
}
