window.runDocumentInspector = function() {
    const resultsContainer = document.getElementById('inspector-results');
    if (!resultsContainer) return;
    
    // 1. Check Document Properties
    const props = state.documentProperties || {};
    let hasProps = (props.author || props.company || props.subject || props.keywords);

    // 2. Check Off-Canvas Elements and Empty Text Boxes
    // We must serialize the current page to ensure state is up-to-date, then scan state.pages.
    state.pages[state.currentPageIndex] = serializeCurrentPage();

    let offCanvasCount = 0;
    let emptyTextCount = 0;

    for (let p of state.pages) {
        if (!p || !p.elements) continue;
        for (let el of p.elements) {
            // Check Empty Text
            if (el.type === 'box' && !el.isImage && !el.isImageFallback) {
                const textContent = el.innerHTML.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, '').trim();
                if (textContent === '') {
                    emptyTextCount++;
                }
            }

            // Check Off-Canvas
            const left = parseFloat(el.left) || 0;
            const top = parseFloat(el.top) || 0;
            const width = parseFloat(el.width) || 0;
            const height = parseFloat(el.height) || 0;
            const pWidth = parseFloat(p.width) || 794;
            const pHeight = parseFloat(p.height) || 1123;
            
            // If the element's bounding box is completely outside [0, pWidth] and [0, pHeight]
            if (left + width < 0 || left > pWidth || top + height < 0 || top > pHeight) {
                offCanvasCount++;
            }
        }
    }

    // Build Results UI
    const buildResultItem = (title, count, icon, onRemove) => {
        let statusHtml = count > 0 ? 
            '<span style="color: #db2777; font-weight: 600; font-size: 13px;">Found</span>' :
            '<span style="color: #16a34a; font-weight: 600; font-size: 13px;">Clean</span>';
        
        let removeBtn = count > 0 ? 
            '<button onclick="' + onRemove + '" style="background: #e2e8f0; color: #1e293b; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">Remove All</button>' : 
            '';

        return `
        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="${icon}" style="color: #64748b; font-size: 16px; width: 20px; text-align: center;"></i>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 13px; font-weight: 600; color: #1e293b;">${title}</span>
                    ${count > 0 && title !== 'Document Properties' ? `<span style="font-size: 11px; color: #64748b;">${count} items found</span>` : ''}
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                ${statusHtml}
                ${removeBtn}
            </div>
        </div>
        `;
    };

    resultsContainer.innerHTML = 
        buildResultItem('Document Properties', hasProps ? 1 : 0, 'fas fa-list-alt', 'removeInspectorProperties()') +
        buildResultItem('Off-Canvas Elements', offCanvasCount, 'fas fa-border-none', 'removeInspectorOffCanvas()') +
        buildResultItem('Empty Text Boxes', emptyTextCount, 'fas fa-comment-slash', 'removeInspectorEmptyText()');
};


window.showDocumentInspectorModal = function() {
    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 15px; max-width: 550px; margin: 0 auto;">
        <p style="margin: 0; font-size: 13px; color: #64748b;">The Document Inspector searches your document for hidden data, personal information, and properties. Click 'Inspect' to scan the document.</p>
        
        <div id="inspector-results" style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
            <!-- Results will populate here -->
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
            <button id="btn-run-inspector" onclick="runDocumentInspector()" style="background: var(--ui-theme-color); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 13px;">
                Inspect
            </button>
        </div>
    </div>
    `;

    if (typeof DialogSystem !== 'undefined') {
        DialogSystem.show('Document Inspector', html, null, true);
    }
};


window.removeInspectorProperties = function() {
    state.documentProperties = { author: '', company: '', subject: '', keywords: '' };
    runDocumentInspector(); // Re-scan
};


window.removeInspectorOffCanvas = function() {
    for (let i = 0; i < state.pages.length; i++) {
        let p = state.pages[i];
        if (!p || !p.elements) continue;
        const pWidth = parseFloat(p.width) || 794;
        const pHeight = parseFloat(p.height) || 1123;
        
        p.elements = p.elements.filter(el => {
            const left = parseFloat(el.left) || 0;
            const top = parseFloat(el.top) || 0;
            const width = parseFloat(el.width) || 0;
            const height = parseFloat(el.height) || 0;
            const isOffCanvas = (left + width < 0 || left > pWidth || top + height < 0 || top > pHeight);
            return !isOffCanvas;
        });
    }
    loadPage(state.currentPageIndex); // Refresh DOM
    runDocumentInspector(); // Re-scan
};


window.removeInspectorEmptyText = function() {
    for (let i = 0; i < state.pages.length; i++) {
        let p = state.pages[i];
        if (!p || !p.elements) continue;
        p.elements = p.elements.filter(el => {
            if (el.type !== 'box' || el.isImage || el.isImageFallback) return true;
            const textContent = el.innerHTML.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, '').trim();
            return textContent !== '';
        });
    }
    loadPage(state.currentPageIndex); // Refresh DOM
    runDocumentInspector(); // Re-scan
};
