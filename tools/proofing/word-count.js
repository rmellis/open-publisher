// word-count.js
(function() {
    let lastText = null;
    let lastEl = null;

    function updateWordCount() {
        if (typeof state === 'undefined') return;

        const statusSpan = document.getElementById('word-count-status');
        if (!statusSpan) return;

        if (!state.selectedEl) {
            statusSpan.style.display = 'none';
            lastEl = null;
            lastText = null;
            return;
        }

        const isTextBox = (state.selectedEl.querySelector && state.selectedEl.querySelector('.text-content') !== null) || 
                          (state.selectedEl.querySelector && state.selectedEl.querySelector('[contenteditable="true"]') !== null) || 
                          (state.selectedEl.classList && state.selectedEl.classList.contains('el-text'));
        
        if (!isTextBox) {
            statusSpan.style.display = 'none';
            lastEl = null;
            lastText = null;
            return;
        }

        const textNode = (state.selectedEl.querySelector && state.selectedEl.querySelector('.text-content')) || 
                         (state.selectedEl.querySelector && state.selectedEl.querySelector('[contenteditable="true"]')) || 
                         state.selectedEl;
        const text = textNode.innerText || '';
        
        if (lastEl === state.selectedEl && lastText === text) {
            return; // No change
        }

        lastEl = state.selectedEl;
        lastText = text;

        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        statusSpan.innerText = words === 1 ? '1 Word' : words + ' Words';
        statusSpan.style.display = 'inline';
    }

    setInterval(updateWordCount, 200);

    window.showWordCountModal = function() {
        if (typeof state === 'undefined' || !state.selectedEl) {
            if(typeof DialogSystem !== 'undefined') DialogSystem.alert("Word Count", "Please select a text box first.");
            return;
        }
        
        const isTextBox = (state.selectedEl.querySelector && state.selectedEl.querySelector('.text-content') !== null) || 
                          (state.selectedEl.querySelector && state.selectedEl.querySelector('[contenteditable="true"]') !== null) || 
                          (state.selectedEl.classList && state.selectedEl.classList.contains('el-text'));
        if (!isTextBox) {
            if(typeof DialogSystem !== 'undefined') DialogSystem.alert("Word Count", "Selected element is not a text box.");
            return;
        }

        const textNode = (state.selectedEl.querySelector && state.selectedEl.querySelector('.text-content')) || 
                         (state.selectedEl.querySelector && state.selectedEl.querySelector('[contenteditable="true"]')) || 
                         state.selectedEl;
        const text = textNode.innerText || '';

        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const charsNoSpaces = text.replace(/\s+/g, '').length;
        const charsWithSpaces = text.length;
        const paragraphs = text.trim() === '' ? 0 : text.split(/\n+/).filter(p => p.trim().length > 0).length;
        const lines = text.trim() === '' ? 0 : text.split('\n').length;

        const html = `
            <style>
                .wc-table { width: 100%; border-collapse: collapse !important; text-align: left; font-size: 14px; border: none !important; }
                .wc-table td { padding: 12px 4px !important; border: none !important; border-bottom: 1px solid var(--ui-border, #eaeaea) !important; color: var(--ui-text-color, #333) !important; }
                .wc-table tr:last-child td { border-bottom: none !important; }
                .wc-table td.wc-val { text-align: right; font-weight: 600; }
            </style>
            <div style="max-width: 350px; margin: 0 auto; padding: 10px;">
                <table class="wc-table">
                    <tr><td>Words</td><td class="wc-val">${words}</td></tr>
                    <tr><td>Characters (no spaces)</td><td class="wc-val">${charsNoSpaces}</td></tr>
                    <tr><td>Characters (with spaces)</td><td class="wc-val">${charsWithSpaces}</td></tr>
                    <tr><td>Paragraphs</td><td class="wc-val">${paragraphs}</td></tr>
                    <tr><td>Lines</td><td class="wc-val">${lines}</td></tr>
                </table>
            </div>
        `;
        if(typeof DialogSystem !== 'undefined') DialogSystem.show("Word Count", html, null, true, "Close");
    };
})();
