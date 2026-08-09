window.runDesignChecker = function() {
    const resultsContainer = document.getElementById('design-checker-results');
    if (!resultsContainer) return;
    
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '<div style="color: #64748b; font-size: 13px; display:flex; align-items:center; gap:5px;"><i class="fas fa-spinner fa-spin"></i> Scanning document...</div>';
    
    setTimeout(() => {
        const issues = [];
        const paper = document.getElementById('paper');
        const paperRect = paper.getBoundingClientRect();
        
        const elements = paper.querySelectorAll('.pub-element');
        
        elements.forEach(el => {
            // 1. Check Text Overflow
            if (el.dataset.type === 'text') {
                const contentDiv = el.querySelector('.element-content div[contenteditable]');
                if (contentDiv) {
                    // Check if scrollHeight is strictly greater than clientHeight
                    // Some browsers add fractional differences, so giving a 2px leeway
                    if (contentDiv.scrollHeight > contentDiv.clientHeight + 2 || contentDiv.scrollWidth > contentDiv.clientWidth + 2) {
                        issues.push({
                            type: 'Text Overflow',
                            icon: 'fas fa-text-height',
                            color: '#eab308',
                            desc: 'A text box has content that is cut off and not fully visible.',
                            element: el
                        });
                    }
                }
            }
            
            // 2. Check Low-Res Images
            if (el.dataset.type === 'image') {
                const img = el.querySelector('img');
                if (img) {
                    // Stretched larger than native resolution = pixelation
                    if (img.clientWidth > img.naturalWidth || img.clientHeight > img.naturalHeight) {
                        issues.push({
                            type: 'Low-Res Image',
                            icon: 'fas fa-image',
                            color: '#3b82f6',
                            desc: 'An image is stretched beyond its original resolution and may look pixelated when printed.',
                            element: el
                        });
                    }
                }
            }
            
            // 3. Check Off-Page Objects
            const elRect = el.getBoundingClientRect();
            // Completely outside
            if (elRect.right < paperRect.left || elRect.left > paperRect.right || elRect.bottom < paperRect.top || elRect.top > paperRect.bottom) {
                issues.push({
                    type: 'Off-Page Object',
                    icon: 'fas fa-object-ungroup',
                    color: '#ef4444',
                    desc: 'An object is positioned completely off the page canvas.',
                    element: el
                });
            } else if (elRect.left < paperRect.left - 5 || elRect.right > paperRect.right + 5 || elRect.top < paperRect.top - 5 || elRect.bottom > paperRect.bottom + 5) {
                 issues.push({
                    type: 'Partially Off-Page',
                    icon: 'fas fa-crop-alt',
                    color: '#f97316',
                    desc: 'An object is partially hanging off the edge of the page canvas.',
                    element: el
                });
            }
        });
        
        // Render Results
        if (issues.length === 0) {
            resultsContainer.innerHTML = `
                <div style="background: #ecfdf5; border: 1px solid #10b981; color: #065f46; padding: 10px; border-radius: 6px; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-check-circle" style="font-size: 16px;"></i> No design issues found! Your document looks great.
                </div>
            `;
        } else {
            let html = `
                <div style="margin-bottom: 10px; font-weight: 600; color: #1e293b; font-size: 14px;">
                    Found ${issues.length} potential issue${issues.length > 1 ? 's' : ''}:
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; padding-right: 5px;">
            `;
            
            issues.forEach((issue) => {
                html += `
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid ${issue.color}; padding: 10px; border-radius: 4px; display: flex; align-items: flex-start; gap: 10px;">
                        <div style="color: ${issue.color}; margin-top: 2px;"><i class="${issue.icon}"></i></div>
                        <div style="flex-grow: 1;">
                            <div style="font-weight: 600; font-size: 13px; color: #334155;">${issue.type}</div>
                            <div style="font-size: 11px; color: #64748b;">${issue.desc}</div>
                        </div>
                        <button onclick="highlightIssueElement('${issue.element.id}')" title="Locate Element" style="background: none; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer; padding: 4px 8px; color: #475569; transition: background 0.15s;">
                            <i class="fas fa-crosshairs"></i>
                        </button>
                    </div>
                `;
            });
            
            html += `</div>`;
            resultsContainer.innerHTML = html;
        }
    }, 600);
};
