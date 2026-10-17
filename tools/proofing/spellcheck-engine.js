/**
 * OpenPublisher Professional Proofing & Grammar Engine (v5.9.3)
 * Comprehensive offline spellcheck and online grammar proofing using modern CSS Custom Highlight API.
 * Powered by OpenPublisher's comprehensive 280,000+ word offline dictionary (SCOWL + ENABLE1 + DTP)
 * with instant O(1) text-node token scanning and intelligent local phonetic/Levenshtein suggestion engine.
 * Renders:
 *  - Crisp RED wavy underlines for spelling mistakes (::highlight(spelling-error))
 *  - Crisp GREEN wavy underlines for grammar, duplication, casing, and style mistakes (::highlight(grammar-error))
 * Across all zoom levels with continuous descender coverage (text-decoration-skip-ink: none)
 * without mutating DOM text nodes or suffering offset drift.
 */

(function initProofingEngine() {
    'use strict';

    const _customDictSet = new Set();
    const _ignoredWordsSet = new Set();
    const _ignoredRulesSet = new Set();
    const _knownBadWords = new Set();
    const _knownGoodWords = new Set();
    const _suggestionsMap = new Map();
    const _editableCache = new Map(); // editable element -> { text, grammarMatches }
    let _debounceTimer = null;
    let _activeFetches = new Map();

    const WORD_REGEX = /[A-Za-z]+(?:['’][A-Za-z]+)?/g;
    const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
    const PHONETIC_RULES = [
        ['ite', 'ight'], ['ight', 'ite'],
        ['ph', 'f'], ['f', 'ph'],
        ['c', 'k'], ['k', 'c'],
        ['c', 's'], ['s', 'c'],
        ['sc', 's'], ['s', 'sc'],
        ['ie', 'ei'], ['ei', 'ie'],
        ['tion', 'sion'], ['sion', 'tion'],
        ['able', 'ible'], ['ible', 'able'],
        ['ant', 'ent'], ['ent', 'ant'],
        ['ance', 'ence'], ['ence', 'ance'],
        ['dg', 'g'], ['g', 'dg'],
        ['qu', 'kw'], ['kw', 'qu'],
        ['x', 'cks'], ['cks', 'x'],
        ['ll', 'l'], ['l', 'll'],
        ['cc', 'c'], ['c', 'cc'],
        ['mm', 'm'], ['m', 'mm'],
        ['ss', 's'], ['s', 'ss'],
        ['pp', 'p'], ['p', 'pp'],
        ['rr', 'r'], ['r', 'rr'],
        ['tt', 't'], ['t', 'tt'],
        ['ff', 'f'], ['f', 'ff'],
        ['nn', 'n'], ['n', 'nn'],
        ['dd', 'd'], ['d', 'dd'],
        ['bb', 'b'], ['b', 'bb'],
        ['gg', 'g'], ['g', 'gg']
    ];

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
        if (clean.length === 1 && clean !== 'a' && clean !== 'i' && clean !== 'o') return false; // Single letters ignored except a/i/o
        
        const ignoreNumbers = localStorage.getItem('opub_ignore_numbers') !== 'false';
        if (ignoreNumbers && /[0-9_]/.test(rawWord)) return false; // Numbers/symbols ignored
        
        const ignoreUppercase = localStorage.getItem('opub_ignore_uppercase') !== 'false';
        if (ignoreUppercase && rawWord === rawWord.toUpperCase() && rawWord.length >= 2 && rawWord.length <= 5) return false; // Acronyms (PDF, PNG, SVG)
        
        if (_customDictSet.has(clean) || _ignoredWordsSet.has(clean)) return false;
        return true;
    }

    /**
     * Checks if a word exists in the dictionary, custom dictionary, or ignored words.
     */
    function isWordInDictionary(word) {
        if (!word) return true;
        const clean = word.toLowerCase().trim();
        if (!clean) return true;

        if (_customDictSet.has(clean) || _ignoredWordsSet.has(clean) || _knownGoodWords.has(clean)) {
            return true;
        }

        if (window.OPUB_DICTIONARY) {
            if (window.OPUB_DICTIONARY.has(clean)) return true;

            const straightApos = clean.replace(/’/g, "'");
            if (window.OPUB_DICTIONARY.has(straightApos)) return true;

            const noApos = straightApos.replace(/'/g, '');
            if (window.OPUB_DICTIONARY.has(noApos)) return true;

            // Possessive form check: e.g. "publisher's" -> "publisher"
            if (straightApos.endsWith("'s")) {
                const base = straightApos.slice(0, -2);
                if (window.OPUB_DICTIONARY.has(base)) return true;
            }
            // Plural possessive form check: e.g. "publishers'" -> "publishers"
            if (straightApos.endsWith("s'")) {
                const base = straightApos.slice(0, -1);
                if (window.OPUB_DICTIONARY.has(base)) return true;
            }
        }

        return false;
    }

    /**
     * Synchronously checks if a word is currently known to be misspelled.
     */
    function isWordMisspelled(word) {
        if (!word) return false;
        if (typeof state !== 'undefined' && state.spellCheck === false) return false;
        if (!isCheckableWord(word)) return false;

        const clean = word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
        if (!clean) return false;

        if (isWordInDictionary(word)) return false;
        if (_knownBadWords.has(clean)) return true;

        // If offline dictionary is loaded, word is definitely misspelled
        if (window.OPUB_DICTIONARY) return true;

        return false;
    }

    /**
     * Maps character offsets within a root element's text to a DOM Range.
     * Robust against offset drift and DOM TreeWalker/innerText whitespace divergence
     * by anchoring to expectedText and snapping cleanly to token boundaries.
     */
    function createRangeForOffsets(root, startOffset, length, expectedText) {
        if (!root || length <= 0) return null;

        // Collect all text nodes with their cumulative offsets
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const textEntries = [];
        let fullText = '';
        let node;

        while ((node = walker.nextNode())) {
            const str = node.textContent;
            const start = fullText.length;
            fullText += str;
            textEntries.push({
                node: node,
                text: str,
                start: start,
                end: fullText.length
            });
        }

        if (textEntries.length === 0 || fullText.length === 0) return null;

        let targetStart = startOffset;
        let targetEnd = startOffset + length;

        // If expectedText is provided, find the exact or closest occurrence in fullText to avoid offset drift
        if (expectedText && typeof expectedText === 'string') {
            const exp = expectedText.trim();
            if (exp.length > 0) {
                let matchIndex = -1;
                // 1. Exact match at startOffset?
                if (fullText.substring(startOffset, startOffset + exp.length) === exp) {
                    matchIndex = startOffset;
                } else {
                    // 2. Search for closest exact occurrence
                    let closestDist = Infinity;
                    let idx = fullText.indexOf(exp);
                    while (idx !== -1) {
                        const dist = Math.abs(idx - startOffset);
                        if (dist < closestDist) {
                            closestDist = dist;
                            matchIndex = idx;
                        }
                        idx = fullText.indexOf(exp, idx + 1);
                    }

                    // 3. Case-insensitive search fallback
                    if (matchIndex === -1) {
                        const lowerFull = fullText.toLowerCase();
                        const lowerExp = exp.toLowerCase();
                        let lidx = lowerFull.indexOf(lowerExp);
                        closestDist = Infinity;
                        while (lidx !== -1) {
                            const dist = Math.abs(lidx - startOffset);
                            if (dist < closestDist) {
                                closestDist = dist;
                                matchIndex = lidx;
                            }
                            lidx = lowerFull.indexOf(lowerExp, lidx + 1);
                        }
                    }

                    // 4. Apostrophe normalization fallback (' vs ’)
                    if (matchIndex === -1) {
                        const normFull = fullText.replace(/’/g, "'").toLowerCase();
                        const normExp = exp.replace(/’/g, "'").toLowerCase();
                        let nidx = normFull.indexOf(normExp);
                        closestDist = Infinity;
                        while (nidx !== -1) {
                            const dist = Math.abs(nidx - startOffset);
                            if (dist < closestDist) {
                                closestDist = dist;
                                matchIndex = nidx;
                            }
                            nidx = normFull.indexOf(normExp, nidx + 1);
                        }
                    }
                }

                if (matchIndex !== -1) {
                    targetStart = matchIndex;
                    targetEnd = matchIndex + exp.length;
                }
            }
        }

        // Clamp to fullText bounds
        targetStart = Math.max(0, Math.min(targetStart, fullText.length));
        targetEnd = Math.max(targetStart, Math.min(targetEnd, fullText.length));

        // Trim any leading or trailing whitespace so squiggles never underline blank spaces or bleed into whitespace
        while (targetStart < targetEnd && /\s/.test(fullText[targetStart])) targetStart++;
        while (targetEnd > targetStart && /\s/.test(fullText[targetEnd - 1])) targetEnd--;
        if (targetStart >= targetEnd) return null;

        // Locate startNode and startOffsetInNode
        let startNode = null, startNodeOffset = 0;
        let endNode = null, endNodeOffset = 0;

        for (const entry of textEntries) {
            if (!startNode && targetStart >= entry.start && targetStart <= entry.end) {
                startNode = entry.node;
                startNodeOffset = targetStart - entry.start;
            }
            if (targetEnd >= entry.start && targetEnd <= entry.end) {
                endNode = entry.node;
                endNodeOffset = targetEnd - entry.start;
                break;
            }
        }

        // Fallback for endNode if targetEnd is at the very end
        if (!endNode && textEntries.length > 0) {
            const last = textEntries[textEntries.length - 1];
            endNode = last.node;
            endNodeOffset = last.text.length;
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
     * Applies original word casing (lowercase, capitalized, or all-caps) to a suggestion.
     */
    function applyCasing(str, isAllUpper, isCapitalized) {
        if (!str) return str;
        if (isAllUpper) return str.toUpperCase();
        if (isCapitalized) return str.charAt(0).toUpperCase() + str.slice(1);
        return str;
    }

    /**
     * Generates intelligent, context-aware spelling suggestions using phonetic patterns,
     * Damerau-Levenshtein distance, and common frequency weighting.
     */
    function getSuggestions(rawWord) {
        if (!rawWord) return [];
        const isAllUpper = (rawWord === rawWord.toUpperCase() && rawWord.length > 1);
        const isCapitalized = (!isAllUpper && rawWord.charAt(0) === rawWord.charAt(0).toUpperCase());

        const word = rawWord.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
        if (!word || word.length < 2) return [];

        if (_suggestionsMap.has(word)) {
            return _suggestionsMap.get(word).map(w => applyCasing(w, isAllUpper, isCapitalized));
        }

        if (!window.OPUB_DICTIONARY) return [];

        const candidates = new Map(); // candidate -> score

        function addCandidate(cand, baseScore) {
            if (!cand || cand === word) return;
            if (!window.OPUB_DICTIONARY.has(cand)) return;

            let score = baseScore;
            // Frequency rank bonus (Google / SCOWL top common words)
            if (window.OPUB_COMMON_MAP && window.OPUB_COMMON_MAP.has(cand)) {
                const rank = window.OPUB_COMMON_MAP.get(cand);
                score += Math.max(0, 50 - (rank / 400));
            }
            // Same first letter bonus
            if (cand[0] === word[0]) score += 15;
            // Length proximity penalty
            score -= Math.abs(cand.length - word.length) * 4;

            if (!candidates.has(cand) || candidates.get(cand) < score) {
                candidates.set(cand, score);
            }
        }

        // 1. Phonetic transformations (high priority)
        for (let i = 0; i < PHONETIC_RULES.length; i++) {
            const [from, to] = PHONETIC_RULES[i];
            if (word.includes(from)) {
                const cand = word.replace(from, to);
                addCandidate(cand, 100);
            }
        }

        // 2. Damerau-Levenshtein Edit Distance 1
        const len = word.length;
        // Deletions
        for (let i = 0; i < len; i++) {
            addCandidate(word.slice(0, i) + word.slice(i + 1), 85);
        }
        // Transpositions
        for (let i = 0; i < len - 1; i++) {
            if (word[i] !== word[i + 1]) {
                addCandidate(word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2), 90);
            }
        }
        // Replacements
        for (let i = 0; i < len; i++) {
            const prefix = word.slice(0, i);
            const suffix = word.slice(i + 1);
            for (let j = 0; j < 26; j++) {
                const ch = ALPHABET[j];
                if (ch !== word[i]) {
                    addCandidate(prefix + ch + suffix, 80);
                }
            }
        }
        // Insertions
        for (let i = 0; i <= len; i++) {
            const prefix = word.slice(0, i);
            const suffix = word.slice(i);
            for (let j = 0; j < 26; j++) {
                addCandidate(prefix + ALPHABET[j] + suffix, 80);
            }
        }

        // 3. Edit Distance 2 if fewer than 4 candidates
        if (candidates.size < 4 && len <= 12) {
            const e1List = [];
            for (let i = 0; i < len; i++) e1List.push(word.slice(0, i) + word.slice(i + 1));
            for (let i = 0; i < len - 1; i++) e1List.push(word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2));
            for (let i = 0; i < len; i++) {
                for (let j = 0; j < 26; j += 2) e1List.push(word.slice(0, i) + ALPHABET[j] + word.slice(i + 1));
            }

            for (let k = 0; k < e1List.length; k++) {
                const e1 = e1List[k];
                if (e1.length < 3) continue;
                const e1Len = e1.length;
                for (let i = 0; i < e1Len; i++) {
                    const c2 = e1.slice(0, i) + e1.slice(i + 1);
                    if (window.OPUB_COMMON_MAP && window.OPUB_COMMON_MAP.has(c2)) addCandidate(c2, 45);
                }
                for (let i = 0; i < e1Len - 1; i++) {
                    const c2 = e1.slice(0, i) + e1[i + 1] + e1[i] + e1.slice(i + 2);
                    if (window.OPUB_COMMON_MAP && window.OPUB_COMMON_MAP.has(c2)) addCandidate(c2, 50);
                }
                for (let i = 0; i < e1Len; i++) {
                    for (let j = 0; j < 26; j += 3) {
                        const c2 = e1.slice(0, i) + ALPHABET[j] + e1.slice(i + 1);
                        if (window.OPUB_COMMON_MAP && window.OPUB_COMMON_MAP.has(c2)) addCandidate(c2, 40);
                    }
                }
                if (candidates.size >= 10) break;
            }
        }

        const sorted = Array.from(candidates.entries())
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);

        const result = sorted.slice(0, 5).map(s => applyCasing(s, isAllUpper, isCapitalized));
        _suggestionsMap.set(word, result);
        return result;
    }

    /**
     * Paints both red (spelling) and green (grammar) squiggly underlines.
     * Uses direct text-node token scanning so spelling error ranges NEVER drift,
     * never underline half-words, and never span across block elements.
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

        editables.forEach(editable => {
            if (editable.classList.contains('wa-text') || editable.getAttribute('data-spellcheck') === 'false') {
                return;
            }

            // 1. Direct text node token scanning for spelling errors
            // Walks DOM text nodes directly; attaches Range strictly to (textNode, match.index, match.index + len)
            const walker = document.createTreeWalker(editable, NodeFilter.SHOW_TEXT);
            let textNode;

            while ((textNode = walker.nextNode())) {
                const text = textNode.textContent;
                if (!text || !text.trim()) continue;

                WORD_REGEX.lastIndex = 0;
                let match;
                while ((match = WORD_REGEX.exec(text)) !== null) {
                    const rawWord = match[0];
                    if (!isCheckableWord(rawWord)) continue;

                    if (isWordMisspelled(rawWord)) {
                        try {
                            const range = new Range();
                            range.setStart(textNode, match.index);
                            range.setEnd(textNode, match.index + rawWord.length);
                            spellingRanges.push(range);
                        } catch(err) {}
                    }
                }
            }

            // 2. Grammar matches from background proofing (if enabled)
            if (grammarEnabled) {
                const rootEditable = (editable.closest ? (editable.closest('[contenteditable="true"]') || editable) : editable);
                const cached = _editableCache.get(rootEditable);
                if (cached && cached.grammarMatches && cached.grammarMatches.length > 0) {
                    cached.grammarMatches.forEach(m => {
                        if (m.ruleId && _ignoredRulesSet.has(m.ruleId)) return;
                        if (m.range && m.range.startContainer && m.range.startContainer.isConnected) {
                            grammarRanges.push(m.range);
                        } else {
                            const range = createRangeForOffsets(rootEditable, m.offset, m.length, m.text);
                            if (range) {
                                m.range = range;
                                grammarRanges.push(range);
                            }
                        }
                    });
                }
            }
        });

        // Register highlights in CSS.highlights
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
     * Checks an editable element with LanguageTool for grammar, punctuation, and style rules
     */
    function checkEditableWithLanguageTool(editable) {
        if (!editable) return;
        if (typeof state !== 'undefined' && state.spellCheck === false) return;
        if (!isGrammarEnabled()) return;
        if (editable.classList.contains('wa-text') || editable.getAttribute('data-spellcheck') === 'false') return;

        const rootEditable = (editable.closest ? (editable.closest('[contenteditable="true"]') || editable) : editable);
        const text = rootEditable.innerText || '';
        if (!text || text.trim() === '') {
            _editableCache.delete(rootEditable);
            paintHighlights();
            return;
        }

        const cached = _editableCache.get(rootEditable);
        if (cached && cached.text === text) {
            paintHighlights();
            return;
        }

        const savedLang = localStorage.getItem('opub_proofing_lang');
        const userLang = savedLang || ((typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('en'))
            ? (navigator.language.toLowerCase() === 'en-gb' ? 'en-GB' : 'en-US')
            : 'en-US');

        if (localStorage.getItem('opub_online_proofing_enabled') === 'false') {
            paintHighlights();
            return;
        }

        if (_activeFetches.has(rootEditable)) {
            try { _activeFetches.get(rootEditable).abort(); } catch(e) {}
        }
        const abortCtrl = new AbortController();
        _activeFetches.set(rootEditable, abortCtrl);

        fetch('https://api.languagetool.org/v2/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `language=${userLang}&text=${encodeURIComponent(text)}`,
            signal: abortCtrl.signal
        })
        .then(res => res.json())
        .then(data => {
            _activeFetches.delete(rootEditable);
            const grammarMatches = [];

            if (data.matches && Array.isArray(data.matches)) {
                data.matches.forEach(m => {
                    let matchOffset = m.offset;
                    let matchLength = m.length;
                    let matchedStr = text.substring(matchOffset, matchOffset + matchLength);

                    // Skip matches that are only whitespace (e.g. WHITESPACE_RULE flagging double spaces)
                    // Highlighting whitespace creates detached squiggles that clip or float awkwardly
                    if (matchedStr.trim().length === 0) return;

                    const classification = classifyMatch(m);
                    const ruleId = (m.rule && m.rule.id) ? m.rule.id : '';
                    let replacements = (m.replacements && Array.isArray(m.replacements))
                        ? m.replacements.map(r => r.value)
                        : [];

                    // LanguageTool tokenizes contractions like "it's" as "it" and "'s".
                    // If the match only covers the start of a contraction (e.g. UPPERCASE_SENTENCE_START flagging "it"),
                    // expand matchLength and replacements to cover the full contraction so the entire word is highlighted and replaced properly.
                    const restOfWordMatch = text.substring(matchOffset + matchLength).match(/^(['’][A-Za-z]+)/);
                    if (restOfWordMatch && (ruleId === 'UPPERCASE_SENTENCE_START' || (m.rule && m.rule.category && m.rule.category.id === 'CASING'))) {
                        const suffix = restOfWordMatch[1];
                        matchLength += suffix.length;
                        matchedStr += suffix;
                        replacements = replacements.map(r => r + suffix);
                    }

                    // LanguageTool is used exclusively for grammar, repetition, punctuation, and style
                    // Spelling is 100% managed by our comprehensive offline dictionary
                    if (classification !== 'spelling' && !_ignoredRulesSet.has(ruleId)) {
                        grammarMatches.push({
                            offset: matchOffset,
                            length: matchLength,
                            text: matchedStr,
                            ruleId: ruleId,
                            catId: (m.rule && m.rule.category) ? m.rule.category.id : '',
                            message: m.message,
                            shortMessage: m.shortMessage,
                            replacements: replacements
                        });
                    }
                });
            }

            _editableCache.set(rootEditable, {
                text: text,
                grammarMatches: grammarMatches
            });

            paintHighlights();
        })
        .catch(err => {
            _activeFetches.delete(rootEditable);
            if (err.name !== 'AbortError') {
                console.warn('LanguageTool proofing fetch failed:', err);
            }
        });
    }

    /**
     * Scans and verifies visible editable elements immediately
     */
    function run() {
        if (typeof state !== 'undefined' && state.spellCheck === false) {
            if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
                try { CSS.highlights.delete('spelling-error'); } catch(e) {}
                try { CSS.highlights.delete('grammar-error'); } catch(e) {}
            }
            return;
        }

        // 1. Immediately paint highlights from local dictionary
        paintHighlights();

        // 2. If grammar check is enabled, query LanguageTool in background
        if (isGrammarEnabled()) {
            const paper = document.getElementById('paper');
            if (!paper) return;

            const editables = paper.querySelectorAll('.pub-element [contenteditable="true"], [contenteditable="true"]');
            editables.forEach(editable => {
                checkEditableWithLanguageTool(editable);
            });
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
     * Retrieves any active proofing issue (grammar or spelling) at the given editable/word/range.
     * Supports both word ranges and collapsed caret point ranges.
     */
    function getIssueAt(editable, word, wordRange, pointRange) {
        const cleanWord = (word || '').toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
        let rootEditable = editable ? (editable.closest ? (editable.closest('[contenteditable="true"]') || editable) : editable) : null;
        if (!rootEditable && wordRange && wordRange.startContainer) {
            const sc = wordRange.startContainer;
            rootEditable = sc.nodeType === 1 ? sc.closest('[contenteditable="true"]') : sc.parentElement?.closest('[contenteditable="true"]');
        }
        if (!rootEditable && pointRange && pointRange.startContainer) {
            const sc = pointRange.startContainer;
            rootEditable = sc.nodeType === 1 ? sc.closest('[contenteditable="true"]') : sc.parentElement?.closest('[contenteditable="true"]');
        }
        if (!rootEditable && typeof state !== 'undefined' && state.selectedEl) {
            rootEditable = state.selectedEl.isContentEditable ? state.selectedEl : (state.selectedEl.querySelector ? state.selectedEl.querySelector('[contenteditable="true"]') : null);
        }

        // 1. Check grammar issues first
        if (isGrammarEnabled()) {
            const candidateCaches = [];
            if (rootEditable && _editableCache.has(rootEditable)) {
                candidateCaches.push({ ed: rootEditable, cache: _editableCache.get(rootEditable) });
            } else {
                for (const [ed, c] of _editableCache.entries()) {
                    candidateCaches.push({ ed, cache: c });
                }
            }

            for (const { ed, cache } of candidateCaches) {
                if (!cache || !cache.grammarMatches || cache.grammarMatches.length === 0) continue;
                for (const gm of cache.grammarMatches) {
                    if (gm.ruleId && _ignoredRulesSet.has(gm.ruleId)) continue;
                    // Re-create range if missing, or if text nodes were mutated and detached the range
                    if ((!gm.range || !gm.range.startContainer || !gm.range.startContainer.isConnected) && ed) {
                        gm.range = createRangeForOffsets(ed, gm.offset, gm.length, gm.text);
                    }
                    if (!gm.range) continue;

                    let matches = false;
                    const testRange = wordRange || pointRange;
                    if (testRange && gm.range) {
                        try {
                            const endsAfterStart = testRange.compareBoundaryPoints(Range.END_TO_START, gm.range) > 0;
                            const startsBeforeEnd = testRange.compareBoundaryPoints(Range.START_TO_END, gm.range) < 0;
                            if (endsAfterStart && startsBeforeEnd) {
                                matches = true;
                            }
                        } catch(e) {}
                    }

                    if (!matches && pointRange && gm.range) {
                        try {
                            const afterStart = pointRange.compareBoundaryPoints(Range.START_TO_START, gm.range) >= 0;
                            const beforeEnd = pointRange.compareBoundaryPoints(Range.END_TO_END, gm.range) <= 0;
                            if (afterStart && beforeEnd) {
                                matches = true;
                            }
                        } catch(e) {}
                    }

                    const gmText = (gm.text || '').toLowerCase().trim();
                    if (!matches && cleanWord) {
                        const gmTokens = gmText.split(/[^a-z0-9'’]+/).filter(Boolean);
                        const cleanNorm = cleanWord.replace(/’/g, "'");
                        const cleanNoApos = cleanNorm.replace(/'/g, '');
                        const allTokens = [...gmTokens, ...gmTokens.map(t => t.replace(/['’]/g, ''))];
                        if (gmText === cleanWord || gmText.includes(cleanWord) || cleanWord.includes(gmText) ||
                            allTokens.some(t => t === cleanNorm || t === cleanNoApos || cleanNorm.includes(t) || t.includes(cleanNorm))) {
                            matches = true;
                        }
                    }

                    if (matches) {
                        return {
                            type: 'grammar',
                            ruleId: gm.ruleId,
                            message: gm.message,
                            shortMessage: gm.shortMessage,
                            text: gm.text,
                            replacements: gm.replacements || [],
                            range: gm.range || testRange
                        };
                    }
                }
            }
        }

        // 2. Check spelling issues
        if (word && isWordMisspelled(word)) {
            return {
                type: 'spelling',
                word: word,
                replacements: getSuggestions(word),
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
                triggerDebounced(250);
            }
        }, true);

        document.addEventListener('keydown', function(e) {
            if ((e.key === ' ' || e.key === 'Enter') && e.target && e.target.isContentEditable) {
                applyAutoCorrect(e.target);
            }
        }, true);

        document.addEventListener('selectionchange', function() {
            if (document.activeElement && document.activeElement.isContentEditable) {
                triggerDebounced(300);
            }
        });

        window.addEventListener('mouseup', function() {
            triggerDebounced(150);
        });

        setTimeout(run, 300);
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
        isWordInDictionary: isWordInDictionary,
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
