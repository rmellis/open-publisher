/**
 * OpenPublisher Professional Proofing & Grammar Engine (v5.8.4)
 * Real-time visual spellcheck and grammar proofing using modern CSS Custom Highlight API
 * integrated with OpenPublisher's existing LanguageTool online proofing service.
 * Renders:
 *  - Crisp RED wavy underlines for spelling mistakes (::highlight(spelling-error))
 *  - Crisp GREEN wavy underlines for grammar, contextual spelling, formatting,
 *    typography, and duplication mistakes (::highlight(grammar-error))
 * Across all zoom levels with continuous descender coverage (text-decoration-skip-ink: none)
 * without requiring bundled offline dictionary files or mutating DOM text nodes.
 */

(function initProofingEngine() {
    'use strict';

    const _customDictSet = new Set();
    const _ignoredWordsSet = new Set();
    const _ignoredRulesSet = new Set();
    const _knownBadWords = new Set();
    const _knownGoodWords = new Set();
    const _suggestionsMap = new Map();
    const _editableCache = new Map(); // editable element -> { text, spellingMatches, grammarMatches }
    let _debounceTimer = null;
    let _activeFetches = new Map();

    // Load custom dictionaries and ignored rules from localStorage
    function loadPreferences() {
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
                    arr.forEach(w => _ignoredWordsSet.add(w.toLowerCase().trim()));
                }
            }
            const savedRules = localStorage.getItem('opub_ignored_grammar_rules');
            if (savedRules) {
                const arr = JSON.parse(savedRules);
                if (Array.isArray(arr)) {
                    arr.forEach(r => _ignoredRulesSet.add(r));
                }
            }
        } catch(e) {
            console.warn('Failed to load proofing preferences:', e);
        }
    }

    loadPreferences();

    /**
     * Checks if grammar error marking is globally enabled.
     */
    function isGrammarEnabled() {
        if (typeof state !== 'undefined' && state.grammarCheck !== undefined) {
            return !!state.grammarCheck;
        }
        return localStorage.getItem('opub_grammarcheck') !== 'false';
    }

    /**
     * Checks if a word token is eligible for spell checking.
     */
    function isCheckableWord(rawWord) {
        if (!rawWord) return false;
        const clean = rawWord.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
        if (!clean) return false;
        if (clean.length === 1 && clean !== 'a' && clean !== 'i') return false; // Single letters ignored except a/i
        
        const ignoreNumbers = localStorage.getItem('opub_ignore_numbers') !== 'false';
        if (ignoreNumbers && /[0-9_]/.test(rawWord)) return false; // Numbers/symbols ignored
        
        const ignoreUppercase = localStorage.getItem('opub_ignore_uppercase') !== 'false';
        if (ignoreUppercase && rawWord === rawWord.toUpperCase() && rawWord.length >= 2 && rawWord.length <= 5) return false; // Acronyms (PDF, PNG, SVG)
        
        if (_customDictSet.has(clean) || _ignoredWordsSet.has(clean)) return false;
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
        if (_customDictSet.has(clean) || _ignoredWordsSet.has(clean)) return false;
        if (_knownGoodWords.has(clean)) return false;
        if (_knownBadWords.has(clean)) return true;
        return false;
    }

    /**
     * Maps character offsets within a root element's text to a DOM Range.
     */
    function createRangeForOffsets(root, startOffset, length) {
        if (!root || length <= 0) return null;
        const endOffset = startOffset + length;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let currentOffset = 0;
        let node;
        let startNode = null, startNodeOffset = 0;
        let endNode = null, endNodeOffset = 0;

        while ((node = walker.nextNode())) {
            const text = node.textContent;
            const nodeLen = text.length;

            if (!startNode && currentOffset + nodeLen > startOffset) {
                startNode = node;
                startNodeOffset = startOffset - currentOffset;
            }
            if (startNode && currentOffset + nodeLen >= endOffset) {
                endNode = node;
                endNodeOffset = endOffset - currentOffset;
                break;
            }
            currentOffset += nodeLen;
        }

        if (startNode && endNode) {
            try {
                const range = new Range();
                range.setStart(startNode, Math.min(startNodeOffset, startNode.textContent.length));
                range.setEnd(endNode, Math.min(endNodeOffset, endNode.textContent.length));
                return range;
            } catch(e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Classifies a LanguageTool match into 'spelling' (red) or 'grammar' (green).
     */
    function classifyMatch(m) {
        if (!m || !m.rule) return 'grammar';
        const catId = (m.rule.category && m.rule.category.id) ? m.rule.category.id : '';
        const shortMsg = (m.shortMessage || '').toLowerCase();

        // Pure spelling mistakes -> RED squiggly line
        if (catId === 'TYPOS' || shortMsg === 'spelling mistake' || (m.rule.id && m.rule.id.startsWith('MORFOLOGIK_'))) {
            return 'spelling';
        }

        // Grammar, contextual spelling (CONFUSED_WORDS), casing (CASING),
        // typography (TYPOGRAPHY), punctuation, repetition, style -> GREEN squiggly line
        return 'grammar';
    }

    /**
     * Paints both red (spelling) and green (grammar) squiggly underlines.
     */
    function paintHighlights() {
        if (typeof CSS === 'undefined' || !('highlights' in CSS)) return;

        if (typeof state !== 'undefined' && state.spellCheck === false) {
            try { CSS.highlights.delete('spelling-error'); } catch(e) {}
            try { CSS.highlights.delete('grammar-error'); } catch(e) {}
            return;
        }

        const grammarEnabled = isGrammarEnabled();
        if (!grammarEnabled) {
            try { CSS.highlights.delete('grammar-error'); } catch(e) {}
        }

        const paper = document.getElementById('paper');
        if (!paper) return;

        const editables = paper.querySelectorAll('.pub-element [contenteditable="true"], [contenteditable="true"]');
        const spellingRanges = [];
        const grammarRanges = [];
        const wordRegex = /[A-Za-z]+(?:['’][A-Za-z]+)?/g;

        editables.forEach(editable => {
            if (editable.classList.contains('wa-text') || editable.getAttribute('data-spellcheck') === 'false') {
                return;
            }

            const cached = _editableCache.get(editable);
            const coveredSpellingSpans = [];

            if (cached) {
                // 1. Paint cached spelling matches
                if (cached.spellingMatches && cached.spellingMatches.length > 0) {
                    cached.spellingMatches.forEach(m => {
                        const cleanWord = (m.word || '').toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
                        if (_customDictSet.has(cleanWord) || _ignoredWordsSet.has(cleanWord)) return;

                        const range = createRangeForOffsets(editable, m.offset, m.length);
                        if (range) {
                            spellingRanges.push(range);
                            m.range = range;
                            coveredSpellingSpans.push({ start: m.offset, end: m.offset + m.length });
                        }
                    });
                }

                // 2. Paint cached grammar matches
                if (grammarEnabled && cached.grammarMatches && cached.grammarMatches.length > 0) {
                    cached.grammarMatches.forEach(m => {
                        if (m.ruleId && _ignoredRulesSet.has(m.ruleId)) return;
                        const cleanText = (m.text || '').toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
                        if (_customDictSet.has(cleanText) || _ignoredWordsSet.has(cleanText)) return;

                        const range = createRangeForOffsets(editable, m.offset, m.length);
                        if (range) {
                            grammarRanges.push(range);
                            m.range = range;
                        }
                    });
                }
            }

            // 3. Fallback: highlight any known bad words from previous checks not yet in cached matches
            const walker = document.createTreeWalker(editable, NodeFilter.SHOW_TEXT);
            let textNode;
            let currentOffset = 0;

            while ((textNode = walker.nextNode())) {
                const text = textNode.textContent;
                if (!text || text.trim() === '') {
                    currentOffset += text.length;
                    continue;
                }

                wordRegex.lastIndex = 0;
                let match;

                while ((match = wordRegex.exec(text)) !== null) {
                    const rawWord = match[0];
                    const clean = rawWord.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
                    const wordStart = currentOffset + match.index;
                    const wordEnd = wordStart + rawWord.length;

                    // Avoid duplicate range if already covered by an online spelling match
                    const alreadyCovered = coveredSpellingSpans.some(s => s.start <= wordStart && s.end >= wordEnd);

                    if (!alreadyCovered && _knownBadWords.has(clean) && !_customDictSet.has(clean) && !_ignoredWordsSet.has(clean)) {
                        try {
                            const range = new Range();
                            range.setStart(textNode, match.index);
                            range.setEnd(textNode, match.index + rawWord.length);
                            spellingRanges.push(range);
                        } catch(err) {}
                    }
                }
                currentOffset += text.length;
            }
        });

        // Register both Highlights in CSS.highlights
        try {
            if (spellingRanges.length > 0) {
                CSS.highlights.set('spelling-error', new Highlight(...spellingRanges));
            } else {
                CSS.highlights.delete('spelling-error');
            }

            if (grammarEnabled && grammarRanges.length > 0) {
                CSS.highlights.set('grammar-error', new Highlight(...grammarRanges));
            } else {
                CSS.highlights.delete('grammar-error');
            }
        } catch(e) {
            console.warn('ProofingEngine Highlight error:', e);
        }
    }

    /**
     * Checks an editable element with LanguageTool
     */
    function checkEditableWithLanguageTool(editable) {
        if (!editable) return;
        if (typeof state !== 'undefined' && state.spellCheck === false) return;
        if (editable.classList.contains('wa-text') || editable.getAttribute('data-spellcheck') === 'false') return;

        const text = editable.innerText || '';
        if (!text || text.trim() === '') {
            _editableCache.delete(editable);
            paintHighlights();
            return;
        }

        const cached = _editableCache.get(editable);
        if (cached && cached.text === text) {
            paintHighlights();
            return;
        }

        const savedLang = localStorage.getItem('opub_proofing_lang');
        const userLang = savedLang || ((typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('en'))
            ? (navigator.language.toLowerCase() === 'en-gb' ? 'en-GB' : 'en-US')
            : 'en-US');

        // Check if online proofing is permitted by user privacy settings
        if (localStorage.getItem('opub_online_proofing_enabled') === 'false') {
            paintHighlights();
            return;
        }

        // Abort any prior in-flight fetch for this editable
        if (_activeFetches.has(editable)) {
            try { _activeFetches.get(editable).abort(); } catch(e) {}
        }
        const abortCtrl = new AbortController();
        _activeFetches.set(editable, abortCtrl);

        fetch('https://api.languagetool.org/v2/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `language=${userLang}&text=${encodeURIComponent(text)}`,
            signal: abortCtrl.signal
        })
        .then(res => res.json())
        .then(data => {
            _activeFetches.delete(editable);
            const spellingMatches = [];
            const grammarMatches = [];
            const flaggedWordsInText = new Set();

            if (data.matches && Array.isArray(data.matches)) {
                data.matches.forEach(m => {
                    const matchedStr = text.substring(m.offset, m.offset + m.length);
                    const cleanWord = matchedStr.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
                    const classification = classifyMatch(m);
                    const ruleId = (m.rule && m.rule.id) ? m.rule.id : '';
                    const replacements = (m.replacements && Array.isArray(m.replacements))
                        ? m.replacements.map(r => r.value)
                        : [];

                    if (classification === 'spelling') {
                        if (isCheckableWord(matchedStr)) {
                            flaggedWordsInText.add(cleanWord);
                            _knownBadWords.add(cleanWord);
                            if (replacements.length > 0) {
                                _suggestionsMap.set(cleanWord, replacements);
                            }
                            spellingMatches.push({
                                offset: m.offset,
                                length: m.length,
                                word: matchedStr,
                                replacements: replacements,
                                ruleId: ruleId
                            });
                        }
                    } else {
                        // Grammar, contextual spelling, formatting, casing, repetition
                        if (!_ignoredRulesSet.has(ruleId)) {
                            grammarMatches.push({
                                offset: m.offset,
                                length: m.length,
                                text: matchedStr,
                                ruleId: ruleId,
                                catId: (m.rule && m.rule.category) ? m.rule.category.id : '',
                                message: m.message,
                                shortMessage: m.shortMessage,
                                replacements: replacements
                            });
                        }
                    }
                });
            }

            // Mark words in text not flagged as typos as good
            const wordRegex = /[A-Za-z]+(?:['’][A-Za-z]+)?/g;
            let wMatch;
            while ((wMatch = wordRegex.exec(text)) !== null) {
                const w = wMatch[0];
                const clean = w.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
                if (isCheckableWord(w) && !flaggedWordsInText.has(clean)) {
                    _knownGoodWords.add(clean);
                }
            }

            _editableCache.set(editable, {
                text: text,
                spellingMatches: spellingMatches,
                grammarMatches: grammarMatches
            });

            paintHighlights();
        })
        .catch(err => {
            _activeFetches.delete(editable);
            if (err.name !== 'AbortError') {
                console.warn('LanguageTool proofing fetch failed:', err);
            }
        });
    }

    /**
     * Scans and verifies visible editable elements
     */
    function run() {
        if (typeof state !== 'undefined' && state.spellCheck === false) {
            if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
                try { CSS.highlights.delete('spelling-error'); } catch(e) {}
                try { CSS.highlights.delete('grammar-error'); } catch(e) {}
            }
            return;
        }

        // 1. Immediately paint from existing cache
        paintHighlights();

        // 2. Query LanguageTool for any unverified or modified editable text boxes
        const paper = document.getElementById('paper');
        if (!paper) return;

        const editables = paper.querySelectorAll('.pub-element [contenteditable="true"], [contenteditable="true"]');
        editables.forEach(editable => {
            checkEditableWithLanguageTool(editable);
        });
    }

    function triggerDebounced(delay = 350) {
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
        _ignoredWordsSet.add(clean);
        _knownBadWords.delete(clean);
        _knownGoodWords.add(clean);
        try {
            localStorage.setItem('opub_ignored_words', JSON.stringify(Array.from(_ignoredWordsSet)));
        } catch(e) {}
        paintHighlights();
    }

    /**
     * Ignores a grammar rule for current user/session
     */
    function ignoreGrammarRule(ruleId) {
        if (!ruleId) return;
        _ignoredRulesSet.add(ruleId);
        try {
            localStorage.setItem('opub_ignored_grammar_rules', JSON.stringify(Array.from(_ignoredRulesSet)));
        } catch(e) {}

        // Remove from all editable caches
        _editableCache.forEach(cached => {
            if (cached.grammarMatches) {
                cached.grammarMatches = cached.grammarMatches.filter(m => m.ruleId !== ruleId);
            }
        });

        paintHighlights();
    }

    /**
     * Registers a known bad word directly
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

    /**
     * Returns spelling suggestions for a word
     */
    function getSuggestions(word) {
        if (!word) return [];
        const clean = word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
        return _suggestionsMap.get(clean) || [];
    }

    /**
     * Retrieves any active proofing issue (grammar or spelling) at the given editable/word/range
     */
    function getIssueAt(editable, word, wordRange) {
        const cleanWord = (word || '').toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
        const cached = editable ? _editableCache.get(editable) : null;

        if (cached) {
            // Check grammar issues first (if grammar checking is enabled)
            if (isGrammarEnabled() && cached.grammarMatches && cached.grammarMatches.length > 0) {
                for (const gm of cached.grammarMatches) {
                    if (gm.ruleId && _ignoredRulesSet.has(gm.ruleId)) continue;
                    if (!gm.range && editable) {
                        gm.range = createRangeForOffsets(editable, gm.offset, gm.length);
                    }

                    let matches = false;
                    if (wordRange && gm.range) {
                        try {
                            matches = (wordRange.compareBoundaryPoints(Range.END_TO_START, gm.range) <= 0 &&
                                       wordRange.compareBoundaryPoints(Range.START_TO_END, gm.range) >= 0);
                        } catch(e) {}
                    }

                    const gmText = (gm.text || '').toLowerCase().trim();
                    if (!matches && cleanWord && (gmText === cleanWord || gmText.includes(cleanWord) || cleanWord.includes(gmText))) {
                        matches = true;
                    }

                    if (matches) {
                        return {
                            type: 'grammar',
                            ruleId: gm.ruleId,
                            message: gm.message,
                            shortMessage: gm.shortMessage,
                            text: gm.text,
                            replacements: gm.replacements || [],
                            range: gm.range || wordRange
                        };
                    }
                }
            }

            // Check spelling issues
            if (cached.spellingMatches && cached.spellingMatches.length > 0) {
                for (const sm of cached.spellingMatches) {
                    if (!sm.range && editable) {
                        sm.range = createRangeForOffsets(editable, sm.offset, sm.length);
                    }

                    let matches = false;
                    if (wordRange && sm.range) {
                        try {
                            matches = (wordRange.compareBoundaryPoints(Range.END_TO_START, sm.range) <= 0 &&
                                       wordRange.compareBoundaryPoints(Range.START_TO_END, sm.range) >= 0);
                        } catch(e) {}
                    }

                    const smWord = (sm.word || '').toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
                    if (!matches && (smWord === cleanWord || cleanWord === smWord)) {
                        matches = true;
                    }

                    if (matches) {
                        return {
                            type: 'spelling',
                            word: sm.word,
                            replacements: sm.replacements || [],
                            range: sm.range || wordRange
                        };
                    }
                }
            }
        }

        // Check fallback known bad words
        if (cleanWord && _knownBadWords.has(cleanWord) && !_customDictSet.has(cleanWord) && !_ignoredWordsSet.has(cleanWord)) {
            return {
                type: 'spelling',
                word: word,
                replacements: _suggestionsMap.get(cleanWord) || [],
                range: wordRange
            };
        }

        return null;
    }

    const DEFAULT_AUTOCORRECT = {
        '(c)': '©',
        '(r)': '®',
        '(tm)': '™',
        '(p)': '§',
        '-->': '→',
        '<--': '←',
        '<->': '↔',
        '==>': '⇒',
        '<==': '⇐',
        '<=>': '⇔',
        '1/2': '½',
        '1/4': '¼',
        '3/4': '¾',
        '+-': '±',
        ':)': '😊',
        ':(': '🙁',
        ';)': '😉'
    };

    function getAutoCorrectMap() {
        try {
            const saved = localStorage.getItem('opub_custom_autocorrect');
            if (saved) {
                const custom = JSON.parse(saved);
                return Object.assign({}, DEFAULT_AUTOCORRECT, custom);
            }
        } catch(e) {}
        return Object.assign({}, DEFAULT_AUTOCORRECT);
    }

    function applyAutoCorrect(editable) {
        if (!editable || localStorage.getItem('opub_autocorrect_enabled') === 'false') return;
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;

        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        if (!node || node.nodeType !== Node.TEXT_NODE) return;

        const textBefore = node.textContent.substring(0, range.startOffset);
        const acMap = getAutoCorrectMap();

        for (const shortcut in acMap) {
            if (textBefore.endsWith(shortcut)) {
                const repl = acMap[shortcut];
                const startPos = range.startOffset - shortcut.length;
                node.textContent = node.textContent.substring(0, startPos) + repl + node.textContent.substring(range.startOffset);
                const newRange = document.createRange();
                newRange.setStart(node, startPos + repl.length);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
                break;
            }
        }
    }

    function init() {
        document.addEventListener('input', function(e) {
            if (e.target && e.target.isContentEditable) {
                triggerDebounced(350);
            }
        }, true);

        document.addEventListener('keydown', function(e) {
            if ((e.key === ' ' || e.key === 'Enter') && e.target && e.target.isContentEditable) {
                applyAutoCorrect(e.target);
            }
        }, true);

        document.addEventListener('selectionchange', function() {
            if (document.activeElement && document.activeElement.isContentEditable) {
                triggerDebounced(400);
            }
        });

        window.addEventListener('mouseup', function() {
            triggerDebounced(200);
        });

        setTimeout(run, 400);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.SpellCheckEngine = {
        run: run,
        trigger: triggerDebounced,
        isWordMisspelled: isWordMisspelled,
        isGrammarEnabled: isGrammarEnabled,
        setGrammarEnabled: function(val) {
            if (typeof state !== 'undefined') state.grammarCheck = !!val;
            localStorage.setItem('opub_grammarcheck', val ? 'true' : 'false');
            paintHighlights();
        },
        getCustomDictionary: function() {
            return Array.from(_customDictSet);
        },
        removeFromDictionary: function(word) {
            if (!word) return;
            const clean = word.toLowerCase().trim();
            _customDictSet.delete(clean);
            try {
                localStorage.setItem('opub_custom_dictionary', JSON.stringify(Array.from(_customDictSet)));
            } catch(e) {}
            _knownBadWords.add(clean);
            _knownGoodWords.delete(clean);
            run();
        },
        resetIgnoredRules: function() {
            _ignoredRulesSet.clear();
            _ignoredWordsSet.clear();
            try {
                localStorage.removeItem('opub_ignored_grammar_rules');
                localStorage.removeItem('opub_ignored_words');
            } catch(e) {}
            run();
        },
        getAutoCorrectMap: getAutoCorrectMap,
        addAutoCorrectRule: function(shortcut, replacement) {
            if (!shortcut || !replacement) return;
            try {
                const custom = JSON.parse(localStorage.getItem('opub_custom_autocorrect') || '{}');
                custom[shortcut] = replacement;
                localStorage.setItem('opub_custom_autocorrect', JSON.stringify(custom));
            } catch(e) {}
        },
        removeAutoCorrectRule: function(shortcut) {
            if (!shortcut) return;
            try {
                const custom = JSON.parse(localStorage.getItem('opub_custom_autocorrect') || '{}');
                delete custom[shortcut];
                localStorage.setItem('opub_custom_autocorrect', JSON.stringify(custom));
            } catch(e) {}
        },
        resetAutoCorrect: function() {
            try {
                localStorage.removeItem('opub_custom_autocorrect');
            } catch(e) {}
        },
        getSuggestions: getSuggestions,
        getIssueAt: getIssueAt,
        createRangeForOffsets: createRangeForOffsets,
        addToDictionary: addToDictionary,
        ignoreWord: ignoreWord,
        ignoreGrammarRule: ignoreGrammarRule,
        recordMisspelledWord: recordMisspelledWord,
        paintHighlights: paintHighlights
    };

    // Provide proofing alias
    window.ProofingEngine = window.SpellCheckEngine;

})();
