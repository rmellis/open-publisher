window.ThesaurusTool = {
    toggleSidebar: function() {
        const sidebar = document.getElementById('op-thesaurus-sidebar');
        if (sidebar) {
            if (sidebar.classList.contains('visible')) {
                sidebar.classList.remove('visible');
            } else {
                document.getElementById('op-table-sidebar')?.classList.remove('visible');
                document.getElementById('op-image-sidebar')?.classList.remove('visible');
                document.getElementById('op-wordart-sidebar')?.classList.remove('visible');
                document.getElementById('op-a11y-sidebar')?.classList.remove('visible');
                document.getElementById('op-graphics-sidebar')?.classList.remove('visible');
                sidebar.classList.add('visible');
                
                // Pre-fill with selected text if it's a single word
                let selection = window.getSelection().toString().trim();
                if (selection && !selection.includes(' ')) {
                    document.getElementById('thesaurus-search-input').value = selection;
                    this.search();
                } else {
                    document.getElementById('thesaurus-search-input').focus();
                }
            }
        }
    },
    
    search: function() {
        const input = document.getElementById('thesaurus-search-input');
        const word = input.value.trim();
        const resultsContainer = document.getElementById('thesaurus-results');
        
        if (!word) return;
        
        resultsContainer.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-circle-notch fa-spin"></i> Searching...</div>';
        
        fetch('https://api.datamuse.com/words?rel_syn=' + encodeURIComponent(word))
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    let html = `<div style="font-size:12px; color:#666; margin-bottom:10px;">Synonyms for <strong>${word}</strong>:</div><div style="display:flex; flex-wrap:wrap; gap:8px;">`;
                    data.forEach(item => {
                        html += `<button onclick="window.ThesaurusTool.replaceWord('${item.word.replace(/'/g, "\\'")}')" style="background:#fff; border:1px solid var(--ui-theme-dark); border-radius:15px; padding:5px 12px; color:var(--ui-theme-dark); cursor:pointer; font-size:13px; transition:all 0.2s;" onmouseover="this.style.background='var(--ui-theme-dark)'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='var(--ui-theme-dark)';" title="Click to replace selected text">${item.word}</button>`;
                    });
                    html += `</div>`;
                    resultsContainer.innerHTML = html;
                } else {
                    resultsContainer.innerHTML = `<div style="color:#666; font-size:13px; text-align:center; margin-top:20px;">No synonyms found for "${word}".</div>`;
                }
            })
            .catch(err => {
                resultsContainer.innerHTML = `<div style="color:#e74c3c; font-size:13px; text-align:center; margin-top:20px;">Failed to load thesaurus data.</div>`;
            });
    },

    replaceWord: function(newWord) {
        const sel = window.getSelection();
        if (sel.rangeCount > 0 && !sel.isCollapsed) {
            const range = sel.getRangeAt(0);
            
            // Check if selection is within our editable workspace
            let isEditable = false;
            let node = range.commonAncestorContainer;
            while(node && node !== document.body) {
                if(node.isContentEditable || (node.classList && (node.classList.contains('editable-text') || node.classList.contains('op-table-cell') || node.classList.contains('wa-text-container')))) {
                    isEditable = true;
                    break;
                }
                node = node.parentNode;
            }

            if (isEditable) {
                // Determine original capitalization (basic)
                const originalText = sel.toString();
                if (originalText.length > 0) {
                    const firstChar = originalText.charAt(0);
                    if (firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase()) {
                        // Title case
                        newWord = newWord.charAt(0).toUpperCase() + newWord.slice(1);
                    }
                }
                document.execCommand('insertText', false, newWord);
                return;
            }
        }
        
        // Fallback: Copy to clipboard if no valid selection is active
        navigator.clipboard.writeText(newWord).then(() => {
            DialogSystem.alert('Copied', `"${newWord}" copied to clipboard! (Highlight a word in your text to auto-replace it)`);
        }).catch(() => {});
    }
};
