function pushHistory() {
    state.pages[state.currentPageIndex] = serializeCurrentPage();

    if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
    }

    const snapshot = JSON.parse(JSON.stringify({
        pages: state.pages,
        idx: state.currentPageIndex,
        isSpreadMode: state.isSpreadMode
    }));

    state.history.push(snapshot);
    state.historyIndex++;
}

function undo() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        restoreSnapshot(state.history[state.historyIndex]);
    }
}

function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        restoreSnapshot(state.history[state.historyIndex]);
    }
}

function restoreSnapshot(snap) {
    state.pages = JSON.parse(JSON.stringify(snap.pages));
    if (!window._orientedPagesRegistry) window._orientedPagesRegistry = new Set();
    state.pages.forEach(p => window._orientedPagesRegistry.add(p.id));
    state.currentPageIndex = snap.idx;
    
    // Restore Spread Mode state (default to false if undefined in older snapshots)
    state.isSpreadMode = snap.isSpreadMode || false;
    const btn = document.getElementById('spread-mode-btn');
    if (btn) btn.classList.toggle('active', state.isSpreadMode);
    
    renderPage(state.pages[state.currentPageIndex]);
    setTimeout(() => { if (typeof generateAllThumbnails === 'function') generateAllThumbnails(); }, 300);
}

function serializeCurrentPage() {
    // FIXED: Preserve existing thumbnail if present so it doesn't blank out on page switch
    const existingPage = state.pages[state.currentPageIndex] || {};
    
    const p = {
        id: existingPage.id || Date.now(),
        thumb: existingPage.thumb, // <--- PRESERVE THUMBNAIL
        ignoreMasterPage: existingPage.ignoreMasterPage || false,
        ignoreBackground: existingPage.ignoreBackground || false,
        width: paper.style.width || '794px',
        height: paper.style.height || '1123px',
        background: paper.style.background || 'white',
        header: paper.querySelector('.page-header').innerHTML,
        footer: paper.querySelector('.page-footer').innerHTML,
        borderStyle: paper.querySelector('.page-border-container').getAttribute('data-style') || 'none',
        elements: []
    };

    const els = paper.querySelectorAll('.pub-element:not(.master-page-element)');
    els.forEach(el => {
        const data = {
            left: el.style.left,
            top: el.style.top,
            width: el.style.width,
            height: el.style.height,
            transform: el.style.transform,
            zIndex: el.style.zIndex,
            type: el.getAttribute('data-type') || 'box',
            innerHTML: '', 
            imgSrc: '', 
            clipPath: '', 
            bg: '', 
            cropMode: el.classList.contains('cropping'),
            imgStyle: {},
            scaleX: el.getAttribute('data-scaleX') || "1",
            scaleY: el.getAttribute('data-scaleY') || "1",
            shrinkOverflow: el.getAttribute('data-shrink-overflow') === 'true',
            growFit: el.getAttribute('data-grow-fit') === 'true'
        };

        const content = el.querySelector('.element-content');
        
        data.contentCssText = content ? content.style.cssText : '';
        data.rx3d = content ? content.getAttribute('data-3d-rx') : null;
        data.ry3d = content ? content.getAttribute('data-3d-ry') : null;
        data.rz3d = content ? content.getAttribute('data-3d-rz') : null;
        data.p3d = content ? content.getAttribute('data-3d-p') : null;
        const img = content ? content.querySelector('img') : null;
        const shapeDiv = content ? content.querySelector('div') : null;
        const isTrueImage = img && (data.type === 'image' || data.type === 'emoji' || (content.children.length === 1 && content.children[0].tagName === 'IMG'));

        if (isTrueImage) {
            data.imgSrc = img.src;
            data.altText = img.alt || '';
            const imgClipPath = img.style.clipPath || img.style.webkitClipPath || '';
            data.imgStyle = {
                width: img.style.width,
                height: img.style.height,
                top: img.style.top,
                left: img.style.left,
                position: img.style.position,
                filter: img.style.filter,
                maxWidth: img.style.maxWidth,
                maxHeight: img.style.maxHeight
            };
            if (imgClipPath && imgClipPath !== 'none') {
                data.imgStyle.clipPath = imgClipPath;
            }
            const imgObjectFit = img.style.objectFit;
            if (imgObjectFit) data.imgStyle.objectFit = imgObjectFit;
            data.isImage = true;
        } else if (shapeDiv && shapeDiv.style.clipPath) {
            data.clipPath = shapeDiv.style.clipPath;
            data.bg = shapeDiv.style.background;
        } else {
            if (shapeDiv && shapeDiv.style.backgroundImage && shapeDiv.style.backgroundImage.includes('data:image')) {
                data.bgImage = shapeDiv.style.backgroundImage;
                const oldBg = shapeDiv.style.backgroundImage;
                shapeDiv.style.backgroundImage = 'none';
                data.innerHTML = content ? content.innerHTML : '';
                shapeDiv.style.backgroundImage = oldBg;
            } else {
                data.innerHTML = content ? content.innerHTML : '';
            }
            if (data.innerHTML.includes('<img') || data.innerHTML.includes('<IMG')) {
                data.isImageFallback = true;
            }
        }

        p.elements.push(data);
    });
    return p;
}

