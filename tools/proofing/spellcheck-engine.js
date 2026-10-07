/**
 * OpenPublisher Professional Spellcheck Engine (v5.4.6)
 * Real-time visual spellcheck using modern CSS Custom Highlight API
 * integrated with OpenPublisher's existing LanguageTool online spell check service.
 * Renders crisp red wavy squiggly underlines across all zoom levels without
 * requiring bundled offline dictionary files or mutating DOM text nodes.
 */

(function initSpellCheckEngine() {
    'use strict';

    const _customDictSet = new Set();
    const _ignoredSet = new Set();
    const _knownBadWords = new Set();
    const _knownGoodWords = new Set();
    const _suggestionsMap = new Map();
    let _debounceTimer = null;
    let _activeFetchAbort = null;

    // Load custom dictionaries from localStorage
    function loadCustomDictionaries() {
        try {
            const savedCustom = localStorage.getItem('opub_custom_dictionary');
            if (savedCustom) {
                const arr = JSON.parse(savedCustom);
                if (Array.isArray(arr)) {
                    arr.forEach(w => _customDictSet.add(w.toLowerCase().trim()));
                }
            }
            const savedIgnored = localStorage.getItem('opub_ignored_words');
            if (savedIgnored) {
                const arr = JSON.parse(savedIgnored);
                if (Array.isArray(arr)) {
                    arr.forEach(w => _ignoredSet.add(w.toLowerCase().trim()));
                }
            }
        } catch(e) {
            console.warn('Failed to load custom dictionaries:', e);
        }
    }

    loadCustomDictionaries();

    /**
     * Checks if a word token is eligible for spell checking.
     */
    function isCheckableWord(rawWord) {
        if (!rawWord) return false;
        const clean = rawWord.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
        if (!clean) return false;
        if (clean.length === 1) return false; // Single letters ignored
        if (/[0-9_]/.test(rawWord)) return false; // Numbers/symbols ignored
        if (rawWord === rawWord.toUpperCase() && rawWord.length >= 2 && rawWord.length <= 5) return false; // Acronyms (PDF, PNG, SVG)
        if (_customDictSet.has(clean) || _ignoredSet.has(clean)) return false;
        return true;
    }

    /**
     * Synchronously checks if a word is currently known to be misspelled.
     */
    function isWordMisspelled(word) {
        if (!word) return false;
        if (typeof state !== 'undefined' && state.spellCheck === false) return false;
        const clean = word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
        if (!clean) return false;
        if (!isCheckableWord(word)) return false;
        if (_customDictSet.has(clean) || _ignoredSet.has(clean)) return false;
        if (_knownGoodWords.has(clean)) return false;
        if (_knownBadWords.has(clean)) return true;
        return false;
    }

    /**
     * Paints red squiggly underlines on the document using CSS.highlights
     */
    function paintHighlights() {
        if (typeof CSS === 'undefined' || !('highlights' in CSS)) return;

        if (typeof state !== 'undefined' && state.spellCheck === false) {
            try { CSS.highlights.delete('spelling-error'); } catch(e) {}
            return;
        }

        const paper = document.getElementById('paper');
        if (!paper) return;

        const editables = paper.querySelectorAll('.pub-element [contenteditable="true"], [contenteditable="true"]');
        const ranges = [];
        const wordRegex = /[A-Za-z]+(?:['’][A-Za-z]+)?/g;

        editables.forEach(editable => {
            if (editable.classList.contains('wa-text') || editable.getAttribute('spellcheck') === 'false') {
                return;
            }

            const walker = document.createTreeWalker(editable, NodeFilter.SHOW_TEXT);
            let textNode;

            while ((textNode = walker.nextNode())) {
                const text = textNode.textContent;
                if (!text || text.trim() === '') continue;

                wordRegex.lastIndex = 0;
                let match;

                while ((match = wordRegex.exec(text)) !== null) {
                    const rawWord = match[0];
                    if (isWordMisspelled(rawWord)) {
                        try {
                            const range = new Range();
                            range.setStart(textNode, match.index);
                            range.setEnd(textNode, match.index + rawWord.length);
                            ranges.push(range);
                        } catch(err) {
                            // Boundary safety
                        }
                    }
                }
            }
        });

        try {
            if (ranges.length > 0) {
                const highlight = new Highlight(...ranges);
                CSS.highlights.set('spelling-error', highlight);
            } else {
                CSS.highlights.delete('spelling-error');
            }
        } catch(e) {
            console.warn('SpellCheckEngine Highlight error:', e);
        }
    }

    /**
     * Extracts all unique unverified checkable words from visible editables
     */
    function getUnverifiedWords() {
        const paper = document.getElementById('paper');
        if (!paper) return [];

        const editables = paper.querySelectorAll('.pub-element [contenteditable="true"], [contenteditable="true"]');
        const wordRegex = /[A-Za-z]+(?:['’][A-Za-z]+)?/g;
        const unverified = new Set();

        editables.forEach(editable => {
            if (editable.classList.contains('wa-text') || editable.getAttribute('spellcheck') === 'false') return;
            const text = editable.innerText || '';
            wordRegex.lastIndex = 0;
            let match;
            while ((match = wordRegex.exec(text)) !== null) {
                const rawWord = match[0];
                const clean = rawWord.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
                if (isCheckableWord(rawWord) && !_knownBadWords.has(clean) && !_knownGoodWords.has(clean)) {
                    unverified.add(clean);
                }
            }
        });

        return Array.from(unverified);
    }

    /**
     * Queries the online LanguageTool service for text verification
     */
    function checkWithOnlineService(wordsToCheck) {
        if (!wordsToCheck || wordsToCheck.length === 0) return;
        if (typeof state !== 'undefined' && state.spellCheck === false) return;

        // Batch words up to 50 at a time in a space-separated string
        const batch = wordsToCheck.slice(0, 50);
        const combinedText = batch.join(' ');
        const userLang = (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('en'))
            ? (navigator.language.toLowerCase() === 'en-gb' ? 'en-GB' : 'en-US')
            : 'en-US';

        try {
            fetch('https://api.languagetool.org/v2/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `language=${userLang}&text=${encodeURIComponent(combinedText)}`
            })
            .then(res => res.json())
            .then(data => {
                const flaggedInBatch = new Set();

                if (data.matches && Array.isArray(data.matches)) {
                    data.matches.forEach(m => {
                        const isMisspelling = m.rule && (
                            m.rule.issueType === 'misspelling' ||
                            (m.rule.category && m.rule.category.id === 'TYPOS') ||
                            (m.shortMessage && m.shortMessage.toLowerCase().includes('spelling'))
                        );
                        if (!isMisspelling) return;

                        const word = combinedText.substring(m.offset, m.offset + m.length).trim().toLowerCase();
                        if (word && isCheckableWord(word)) {
                            flaggedInBatch.add(word);
                            _knownBadWords.add(word);
                            if (m.replacements && m.replacements.length > 0) {
                                _suggestionsMap.set(word, m.replacements.map(r => r.value));
                            }
                        }
                    });
                }

                // Any word in the batch not flagged is recognized as good!
                batch.forEach(w => {
                    if (!flaggedInBatch.has(w)) {
                        _knownGoodWords.add(w);
                    }
                });

                paintHighlights();
            })
            .catch(err => {
                // Network failure fallback: keep current cache
                console.warn('LanguageTool online spell check unreachable:', err);
            });
        } catch(e) {
            console.warn('LanguageTool fetch error:', e);
        }
    }

    /**
     * Main run cycle: immediately paints known words, then queries unverified words
     */
    function run() {
        if (typeof state !== 'undefined' && state.spellCheck === false) {
            if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
                try { CSS.highlights.delete('spelling-error'); } catch(e) {}
            }
            return;
        }

        // 1. Paint immediately from existing cache
        paintHighlights();

        // 2. Query any newly typed unverified words
        const unverified = getUnverifiedWords();
        if (unverified.length > 0) {
            checkWithOnlineService(unverified);
        }
    }

    function triggerDebounced(delay = 250) {
        if (_debounceTimer) clearTimeout(_debounceTimer);
        _debounceTimer = setTimeout(run, delay);
    }

    /**
     * Adds a word to the user custom dictionary
     */
    function addToDictionary(word) {
        if (!word) return;
        const clean = word.toLowerCase().trim();
        _customDictSet.add(clean);
        _knownBadWords.delete(clean);
        _knownGoodWords.add(clean);
        try {
            localStorage.setItem('opub_custom_dictionary', JSON.stringify(Array.from(_customDictSet)));
        } catch(e) {}
        paintHighlights();
    }

    /**
     * Ignores a word for the current session
     */
    function ignoreWord(word) {
        if (!word) return;
        const clean = word.toLowerCase().trim();
        _ignoredSet.add(clean);
        _knownBadWords.delete(clean);
        _knownGoodWords.add(clean);
        try {
            localStorage.setItem('opub_ignored_words', JSON.stringify(Array.from(_ignoredSet)));
        } catch(e) {}
        paintHighlights();
    }

    /**
     * Registers a known bad word directly from context menu fetch
     */
    function recordMisspelledWord(word, suggestions = []) {
        if (!word) return;
        const clean = word.toLowerCase().trim();
        if (isCheckableWord(clean)) {
            _knownBadWords.add(clean);
            if (suggestions.length > 0) {
                _suggestionsMap.set(clean, suggestions);
            }
            paintHighlights();
        }
    }

    function init() {
        document.addEventListener('input', function(e) {
            if (e.target && e.target.isContentEditable) {
                triggerDebounced(300);
            }
        }, true);

        document.addEventListener('selectionchange', function() {
            if (document.activeElement && document.activeElement.isContentEditable) {
                triggerDebounced(350);
            }
        });

        window.addEventListener('mouseup', function() {
            triggerDebounced(150);
        });

        setTimeout(run, 400);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function getSuggestions(word) {
        if (!word) return [];
        const clean = word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
        return _suggestionsMap.get(clean) || [];
    }

    window.SpellCheckEngine = {
        run: run,
        trigger: triggerDebounced,
        isWordMisspelled: isWordMisspelled,
        getSuggestions: getSuggestions,
        addToDictionary: addToDictionary,
        ignoreWord: ignoreWord,
        recordMisspelledWord: recordMisspelledWord,
        paintHighlights: paintHighlights
    };

})();
