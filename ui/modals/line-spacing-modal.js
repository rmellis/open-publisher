window.showLineSpacingModal = function() {
    if (!state.selectedEl) {
        DialogSystem.alert('Notice', 'Please select a text box first.');
        return;
    }
    
    // Attempt to parse current exact spacing
    const content = state.selectedEl.querySelector('.element-content');
    let currentVal = '';
    if (content && content.style.lineHeight && content.style.lineHeight.includes('pt')) {
        currentVal = parseInt(content.style.lineHeight);
    }
    
    const html = `
        <div style="padding: 10px;">
            <p style="margin-top:0;">Set the absolute line height (Exact point size). Leave blank to revert to normal spacing.</p>
            <div style="display:flex; align-items:center; gap:10px; margin-top:15px;">
                <label>Exact Spacing (pt):</label>
                <input type="number" id="exact-line-spacing-input" class="modern-input" placeholder="e.g. 14" value="${currentVal}" style="width:100px;">
            </div>
        </div>
    `;

    DialogSystem.show('<i class="fas fa-arrows-alt-v" style="margin-right:8px;"></i>Line Spacing Options', html, () => {
        const val = document.getElementById('exact-line-spacing-input').value;
        window.applyExactLineSpacing(val ? val + 'pt' : 'normal');
    });
};


window.applyExactLineSpacing = function(val) {
    if(state.selectedEl) {
        const content = state.selectedEl.querySelector('.element-content');
        if(content) {
            content.style.lineHeight = val;
            pushHistory();
            forceRepaint();
        }

        setTimeout(() => {
            const input = document.getElementById('doc-protect-pw');
            if (input) input.focus();
        }, 100);
    }
};
