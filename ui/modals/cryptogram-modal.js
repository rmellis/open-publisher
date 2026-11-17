// Open Publisher Cryptogram & Secret Cipher Frames (v5.22.4)
// Specialized live-converting cipher text boxes supporting Solvable Substitution Ciphers,
// Pigpen (Masonic) Geometric Symbols, Grade-1 Braille Dots, and International Morse Code,
// with blank write-in guess lines above each symbol and automatic Page 2 Answer Keys.

(function(window) {
    'use strict';

    const DEFAULT_PROSE = 'Keep this secret message safe until the mission is complete!';
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    const CIPHER_MODES = {
        substitution: { label: 'Substitution Cipher (A-Z)', shortLabel: 'Sub' },
        pigpen: { label: 'Pigpen (Masonic) Symbols', shortLabel: 'Pigpen' },
        braille: { label: 'Braille Dots (Grade-1)', shortLabel: 'Braille' },
        morse: { label: 'Morse Code', shortLabel: 'Morse' }
    };

    const MORSE_MAP = {
        A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
        G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
        M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
        S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
        Y: '-.--', Z: '--..',
        '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
        '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
    };

    // Standard International Grade-1 English Braille dots (1-3 left col, 4-6 right col)
    const BRAILLE_MAP = {
        A: [1], B: [1, 2], C: [1, 4], D: [1, 4, 5], E: [1, 5],
        F: [1, 2, 4], G: [1, 2, 4, 5], H: [1, 2, 5], I: [2, 4], J: [2, 4, 5],
        K: [1, 3], L: [1, 2, 3], M: [1, 3, 4], N: [1, 3, 4, 5], O: [1, 3, 5],
        P: [1, 2, 3, 4], Q: [1, 2, 3, 4, 5], R: [1, 2, 3, 5], S: [2, 3, 4], T: [2, 3, 4, 5],
        U: [1, 3, 6], V: [1, 2, 3, 6], W: [2, 4, 5, 6], X: [1, 3, 4, 6], Y: [1, 3, 4, 5, 6],
        Z: [1, 3, 5, 6]
    };

    const COLOR_PRESETS = {
        teal: { label: 'Classic Teal', accent: '#007670', symbol: '#0f172a', line: '#475569', text: '#007670', bg: '#ffffff', border: '#cbd5e1' },
        newspaper: { label: 'Classic Print', accent: '#111827', symbol: '#111827', line: '#374151', text: '#111827', bg: '#ffffff', border: '#9ca3af' },
        parchment: { label: 'Spy Parchment', accent: '#92400e', symbol: '#451a03', line: '#78350f', text: '#92400e', bg: '#fffbeb', border: '#d97706' },
        ocean: { label: 'Ocean Blue', accent: '#0369a1', symbol: '#0c4a6e', line: '#0284c7', text: '#0369a1', bg: '#f0f9ff', border: '#7dd3fc' },
        berry: { label: 'Warm Berry', accent: '#be123c', symbol: '#4c0519', line: '#e11d48', text: '#be123c', bg: '#fff1f2', border: '#fda4af' },
        chalkboard: { label: 'Dark Dossier', accent: '#2dd4bf', symbol: '#f8fafc', line: '#94a3b8', text: '#5eead4', bg: '#1e293b', border: '#475569' }
    };

    function escapeXml(str) {
        return String(str == null ? '' : str).replace(/[&<>"']/g, (ch) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch]));
    }

    function normalizeHexColor(raw, fallback) {
        const fb = fallback || '#007670';
        if (!raw) return fb;
        const s = String(raw).trim();
        if (/^#[0-9a-f]{6}$/i.test(s)) return s;
        if (/^#[0-9a-f]{3}$/i.test(s)) {
            return '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
        }
        const m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
        if (m) {
            const hex = [m[1], m[2], m[3]].map(v => Math.max(0, Math.min(255, parseInt(v, 10) || 0)).toString(16).padStart(2, '0')).join('');
            return '#' + hex;
        }
        return fb;
    }

    function resolveThemeColor() {
        try {
            const raw = getComputedStyle(document.documentElement).getPropertyValue('--ui-theme-color').trim();
            if (raw && (raw.startsWith('#') || raw.startsWith('rgb'))) return normalizeHexColor(raw, '#007670');
        } catch (e) {}
        return '#007670';
    }

    function makeRng(seed) {
        let s = (seed >>> 0) || 1;
        return function() {
            s = (s * 1664525 + 1013904223) >>> 0;
            return s / 4294967296;
        };
    }

    // Builds a solvable monoalphabetic derangement (no letter encodes to itself)
    function generateSubstitutionKey(seed) {
        const rng = makeRng(seed || 5150);
        const pool = ALPHABET.slice();
        for (let attempt = 0; attempt < 24; attempt++) {
            const shuffled = pool.slice();
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                const tmp = shuffled[i];
                shuffled[i] = shuffled[j];
                shuffled[j] = tmp;
            }
            let fixedIdx = -1;
            for (let i = 0; i < 26; i++) {
                if (shuffled[i] === ALPHABET[i]) {
                    fixedIdx = i;
                    const swapWith = (i + 1) % 26;
                    const t = shuffled[i];
                    shuffled[i] = shuffled[swapWith];
                    shuffled[swapWith] = t;
                }
            }
            let valid = true;
            for (let i = 0; i < 26; i++) {
                if (shuffled[i] === ALPHABET[i]) { valid = false; break; }
            }
            if (valid || fixedIdx === -1) {
                const map = {};
                for (let i = 0; i < 26; i++) map[ALPHABET[i]] = shuffled[i];
                return map;
            }
        }
        // Deterministic fallback rotation by 13 (ROT13 derangement)
        const rot = {};
        for (let i = 0; i < 26; i++) rot[ALPHABET[i]] = ALPHABET[(i + 13) % 26];
        return rot;
    }

    function selectStarterHints(prose, hintCount, seed) {
        const count = Math.max(0, Math.min(5, parseInt(hintCount, 10) || 0));
        if (count === 0) return [];
        const rng = makeRng((seed || 101) + 77);
        const freq = {};
        const upper = String(prose || '').toUpperCase();
        for (let i = 0; i < upper.length; i++) {
            const ch = upper[i];
            if (ch >= 'A' && ch <= 'Z') freq[ch] = (freq[ch] || 0) + 1;
        }
        const candidates = Object.keys(freq).sort((a, b) => {
            const multiA = freq[a] >= 2 ? 0 : 1;
            const multiB = freq[b] >= 2 ? 0 : 1;
            if (multiA !== multiB) return multiA - multiB;
            return rng() - 0.5;
        });
        return candidates.slice(0, count);
    }

    function buildPigpenSvg(letter, color, sizePx) {
        const ch = String(letter || '').toUpperCase();
        const idx = ALPHABET.indexOf(ch);
        if (idx < 0) return '';
        const sz = sizePx || 24;
        const c = escapeXml(color);
        const paths = [];
        let dot = '';

        if (idx < 18) {
            // Grid 1 (A-I, no dot) and Grid 2 (J-R, with dot)
            const localIdx = idx % 9;
            const hasDot = idx >= 9;
            const row = Math.floor(localIdx / 3); // 0,1,2
            const col = localIdx % 3;             // 0,1,2
            const x1 = 4, x2 = 20, y1 = 4, y2 = 20;
            const top = row > 0;
            const bottom = row < 2;
            const left = col > 0;
            const right = col < 2;

            if (top) paths.push(`M ${x1} ${y1} L ${x2} ${y1}`);
            if (bottom) paths.push(`M ${x1} ${y2} L ${x2} ${y2}`);
            if (left) paths.push(`M ${x1} ${y1} L ${x1} ${y2}`);
            if (right) paths.push(`M ${x2} ${y1} L ${x2} ${y2}`);
            if (hasDot) dot = `<circle cx="12" cy="12" r="2.25" fill="${c}"/>`;
        } else {
            // X-Grid 1 (S-V, no dot) and X-Grid 2 (W-Z, with dot)
            const wedgeIdx = (idx - 18) % 4;
            const hasDot = idx >= 22;
            if (wedgeIdx === 0) {
                // Opens UP (S / W)
                paths.push('M 4 5 L 12 18 L 20 5');
                if (hasDot) dot = `<circle cx="12" cy="8.5" r="2.2" fill="${c}"/>`;
            } else if (wedgeIdx === 1) {
                // Opens LEFT (T / X)
                paths.push('M 5 4 L 18 12 L 5 20');
                if (hasDot) dot = `<circle cx="8.5" cy="12" r="2.2" fill="${c}"/>`;
            } else if (wedgeIdx === 2) {
                // Opens RIGHT (U / Y)
                paths.push('M 19 4 L 6 12 L 19 20');
                if (hasDot) dot = `<circle cx="15.5" cy="12" r="2.2" fill="${c}"/>`;
            } else {
                // Opens DOWN (V / Z)
                paths.push('M 4 19 L 12 6 L 20 19');
                if (hasDot) dot = `<circle cx="12" cy="15.5" r="2.2" fill="${c}"/>`;
            }
        }

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${sz}" height="${sz}" style="display:block;overflow:visible;"><path d="${paths.join(' ')}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter"/>${dot}</svg>`;
    }

    function buildBrailleSvg(letter, color, sizePx) {
        const ch = String(letter || '').toUpperCase();
        const dots = BRAILLE_MAP[ch];
        if (!dots) return '';
        const active = new Set(dots);
        const h = sizePx || 24;
        const w = Math.round(h * (18 / 24));
        const c = escapeXml(color);
        const coords = {
            1: [5.2, 4.5], 4: [12.8, 4.5],
            2: [5.2, 12.0], 5: [12.8, 12.0],
            3: [5.2, 19.5], 6: [12.8, 19.5]
        };
        const circles = [];
        for (let d = 1; d <= 6; d++) {
            const [cx, cy] = coords[d];
            if (active.has(d)) {
                circles.push(`<circle cx="${cx}" cy="${cy}" r="2.35" fill="${c}"/>`);
            } else {
                circles.push(`<circle cx="${cx}" cy="${cy}" r="1.65" fill="none" stroke="${c}" stroke-opacity="0.3" stroke-width="1"/>`);
            }
        }
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 24" width="${w}" height="${h}" style="display:block;overflow:visible;">${circles.join('')}</svg>`;
    }

    function buildMorseSvg(char, color, sizePx) {
        const ch = String(char || '').toUpperCase();
        const pattern = MORSE_MAP[ch];
        if (!pattern) return '';
        const h = Math.max(14, Math.round((sizePx || 24) * 0.65));
        const c = escapeXml(color);
        let x = 2;
        const shapes = [];
        for (let i = 0; i < pattern.length; i++) {
            if (pattern[i] === '.') {
                shapes.push(`<circle cx="${x + 2.2}" cy="8" r="2.2" fill="${c}"/>`);
                x += 4.4;
            } else {
                shapes.push(`<rect x="${x}" y="6.1" width="8.6" height="3.8" rx="1.6" fill="${c}"/>`);
                x += 8.6;
            }
            if (i < pattern.length - 1) x += 2.6;
        }
        const totalW = Math.max(16, Math.ceil(x + 2));
        const drawW = Math.round(totalW * (h / 16));
        return {
            html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} 16" width="${drawW}" height="${h}" style="display:block;overflow:visible;">${shapes.join('')}</svg>`,
            minCellWidth: Math.max(20, drawW + 4)
        };
    }

    function encodeCharacterToken(ch, cfg, isAnswer) {
        const upper = String(ch || '').toUpperCase();
        const mode = cfg.mode || 'substitution';
        const symbolColor = normalizeHexColor(cfg.symbolColor, '#0f172a');
        const lineColor = normalizeHexColor(cfg.lineColor, '#475569');
        const textColor = normalizeHexColor(cfg.textColor, '#007670');
        const fontFamily = cfg.fontFamily || 'Segoe UI, Arial, sans-serif';
        const symSize = Math.max(16, Math.min(34, parseInt(cfg.symbolSize, 10) || 22));
        const showBlankLines = cfg.showBlankLines !== false;
        const isAlpha = upper >= 'A' && upper <= 'Z';
        const isDigit = upper >= '0' && upper <= '9';

        const encodable = (mode === 'morse') ? (isAlpha || isDigit) : isAlpha;
        if (!encodable) {
            return `<span class="cg-punct" style="display:inline-flex;align-items:flex-end;justify-content:center;min-width:6px;padding:0 1px 2px;font-family:${escapeXml(fontFamily)};font-size:${Math.round(symSize * 0.78)}px;font-weight:700;color:${escapeXml(symbolColor)};line-height:1;">${escapeXml(ch)}</span>`;
        }

        const hintSet = new Set(Array.isArray(cfg.hintLetters) ? cfg.hintLetters : []);
        const showGuessLetter = isAnswer || hintSet.has(upper);
        const lineHeightPx = Math.max(16, Math.round(symSize * 0.85));
        const guessFontSize = Math.max(12, Math.round(symSize * 0.68));
        const borderBottomStyle = showBlankLines
            ? `border-bottom:1.75px solid ${escapeXml(lineColor)};`
            : 'border-bottom:none;';

        let glyphHtml = '';
        let cellMinW = symSize + 4;

        if (mode === 'substitution') {
            const subMap = (cfg.cipherMap && typeof cfg.cipherMap === 'object') ? cfg.cipherMap : {};
            const cipherChar = isAlpha ? (subMap[upper] || upper) : upper;
            glyphHtml = `<span style="font-family:${escapeXml(fontFamily)};font-size:${Math.round(symSize * 0.78)}px;font-weight:800;color:${escapeXml(symbolColor)};line-height:1.1;letter-spacing:0.4px;">${escapeXml(cipherChar)}</span>`;
            cellMinW = Math.max(20, symSize + 2);
        } else if (mode === 'pigpen') {
            glyphHtml = buildPigpenSvg(upper, symbolColor, symSize);
            cellMinW = Math.max(24, symSize + 4);
        } else if (mode === 'braille') {
            glyphHtml = buildBrailleSvg(upper, symbolColor, symSize);
            cellMinW = Math.max(20, symSize);
        } else if (mode === 'morse') {
            const morseObj = buildMorseSvg(upper, symbolColor, symSize);
            glyphHtml = morseObj ? morseObj.html : escapeXml(upper);
            cellMinW = morseObj ? morseObj.minCellWidth : 24;
        }

        const guessSlotHtml = (showBlankLines || showGuessLetter)
            ? `<span class="cg-guess-line" style="width:100%;height:${lineHeightPx}px;${borderBottomStyle}display:flex;align-items:flex-end;justify-content:center;padding-bottom:1px;box-sizing:border-box;font-family:${escapeXml(fontFamily)};font-size:${guessFontSize}px;font-weight:800;color:${escapeXml(textColor)};line-height:1;">${showGuessLetter ? escapeXml(upper) : '&nbsp;'}</span>`
            : '';

        return `<span class="cg-char-cell" style="display:inline-flex;flex-direction:column;align-items:center;min-width:${cellMinW}px;box-sizing:border-box;">${guessSlotHtml}<span class="cg-glyph" style="margin-top:${(showBlankLines || showGuessLetter) ? 4 : 0}px;min-height:${Math.max(14, Math.round(symSize * 0.65))}px;display:flex;align-items:center;justify-content:center;">${glyphHtml}</span></span>`;
    }

    function renderCipherTokensHtml(prose, cfg, options) {
        const opts = options || {};
        const isAnswer = !!opts.isAnswer;
        const lines = String(prose || '').split(/\r?\n/);
        const symSize = Math.max(16, Math.min(34, parseInt(cfg.symbolSize, 10) || 22));
        const wordGap = Math.max(10, Math.round(symSize * 0.62));
        const charGap = (cfg.mode === 'morse') ? 6 : 4;
        const lineHtmlParts = [];

        for (let li = 0; li < lines.length; li++) {
            const lineText = lines[li];
            if (!lineText.trim()) {
                lineHtmlParts.push('<div style="height:14px;"></div>');
                continue;
            }
            const words = lineText.trim().split(/\s+/);
            const wordBlocks = words.map((word) => {
                const charHtml = [];
                for (let ci = 0; ci < word.length; ci++) {
                    charHtml.push(encodeCharacterToken(word[ci], cfg, isAnswer));
                }
                return `<span class="cg-word" style="display:inline-flex;flex-wrap:wrap;align-items:flex-end;gap:${charGap}px;margin:0 ${wordGap}px 12px 0;vertical-align:top;">${charHtml.join('')}</span>`;
            });
            lineHtmlParts.push(`<div class="cg-line" style="display:flex;flex-wrap:wrap;align-items:flex-end;">${wordBlocks.join('')}</div>`);
        }

        if (lineHtmlParts.length === 0) {
            return `<div style="font-size:12px;opacity:0.65;font-style:italic;padding:8px;">Type normal prose above to automatically encode into ${escapeXml((CIPHER_MODES[cfg.mode] && CIPHER_MODES[cfg.mode].label) || 'cipher symbols')}...</div>`;
        }
        return lineHtmlParts.join('');
    }

    function buildAnswerLegendHtml(cfg) {
        const mode = cfg.mode || 'substitution';
        const accentColor = normalizeHexColor(cfg.accentColor, '#007670');
        const symbolColor = normalizeHexColor(cfg.symbolColor, '#0f172a');
        const bgColor = normalizeHexColor(cfg.bgColor, '#ffffff');
        const borderColor = normalizeHexColor(cfg.borderColor, '#cbd5e1');
        const textColor = normalizeHexColor(cfg.textColor, '#007670');
        const fontFamily = cfg.fontFamily || 'Segoe UI, Arial, sans-serif';
        const usedUpper = new Set(String(cfg.prose || '').toUpperCase().replace(/[^A-Z]/g, '').split(''));
        const subMap = (cfg.cipherMap && typeof cfg.cipherMap === 'object') ? cfg.cipherMap : {};

        const modeLabel = (CIPHER_MODES[mode] && CIPHER_MODES[mode].label) || 'Cipher Key';
        const cells = ALPHABET.map((plainCh) => {
            const isUsed = usedUpper.has(plainCh);
            let symHtml = '';
            if (mode === 'substitution') {
                const cipherCh = subMap[plainCh] || plainCh;
                symHtml = `<span style="font-family:${escapeXml(fontFamily)};font-size:12px;font-weight:800;color:${escapeXml(symbolColor)};">${escapeXml(cipherCh)}</span>`;
            } else if (mode === 'pigpen') {
                symHtml = buildPigpenSvg(plainCh, symbolColor, 18);
            } else if (mode === 'braille') {
                symHtml = buildBrailleSvg(plainCh, symbolColor, 18);
            } else {
                const mObj = buildMorseSvg(plainCh, symbolColor, 15);
                symHtml = mObj ? mObj.html : escapeXml(plainCh);
            }
            const cellBg = isUsed ? 'rgba(0,118,112,0.08)' : bgColor;
            const hdrBg = isUsed ? accentColor : 'rgba(148,163,184,0.22)';
            const hdrClr = isUsed ? '#ffffff' : textColor;
            return `<div style="display:flex;flex-direction:column;align-items:center;border:1px solid ${escapeXml(borderColor)};border-radius:4px;overflow:hidden;background:${cellBg};min-width:0;">
                <div style="width:100%;text-align:center;font-size:10px;font-weight:800;padding:2px 0;background:${escapeXml(hdrBg)};color:${escapeXml(hdrClr)};font-family:${escapeXml(fontFamily)};">${plainCh}</div>
                <div style="height:24px;display:flex;align-items:center;justify-content:center;padding:2px 3px;">${symHtml}</div>
            </div>`;
        }).join('');

        return `<div style="width:100%;height:100%;box-sizing:border-box;padding:10px 12px;background:${escapeXml(bgColor)};border:1.5px solid ${escapeXml(borderColor)};border-radius:8px;font-family:${escapeXml(fontFamily)};">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <span style="font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:${escapeXml(accentColor)};">Cipher Decoder Key: ${escapeXml(modeLabel)}</span>
                <span style="font-size:10.5px;font-weight:600;color:${escapeXml(symbolColor)};opacity:0.75;">Highlighted letters appear in puzzle</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(13,minmax(0,1fr));gap:5px;">${cells}</div>
        </div>`;
    }

    function buildLiveFrameInnerHtml(cfg, isAnswerKey) {
        const bgColor = normalizeHexColor(cfg.bgColor, '#ffffff');
        const borderColor = normalizeHexColor(cfg.borderColor, '#cbd5e1');
        const accentColor = normalizeHexColor(cfg.accentColor, '#007670');
        const fontFamily = cfg.fontFamily || 'Segoe UI, Arial, sans-serif';
        const mode = cfg.mode || 'substitution';
        const tokensHtml = renderCipherTokensHtml(cfg.prose, cfg, { isAnswer: !!isAnswerKey });

        if (isAnswerKey) {
            return `<div class="cg-frame-card" style="width:100%;height:100%;box-sizing:border-box;padding:16px 18px;background:${escapeXml(bgColor)};border:1.5px solid ${escapeXml(borderColor)};border-radius:8px;overflow:auto;">
                <div class="cg-tokens-view" style="width:100%;box-sizing:border-box;">${tokensHtml}</div>
            </div>`;
        }

        const modeBtns = Object.keys(CIPHER_MODES).map((mKey) => {
            const activeCls = mKey === mode ? ' active' : '';
            return `<button type="button" class="cg-inline-mode-btn${activeCls}" data-cg-set-mode="${mKey}">${escapeXml(CIPHER_MODES[mKey].shortLabel)}</button>`;
        }).join('');

        return `<div class="cg-frame-card" style="width:100%;height:100%;box-sizing:border-box;padding:14px 16px;background:${escapeXml(bgColor)};border:1.5px solid ${escapeXml(borderColor)};border-radius:8px;display:flex;flex-direction:column;overflow:hidden;">
            <div class="cg-live-editor-bar">
                <span style="font-size:10.5px;font-weight:800;text-transform:uppercase;color:${escapeXml(accentColor)};white-space:nowrap;">Type Prose:</span>
                <textarea rows="1" class="cg-prose-input" spellcheck="false" style="font-family:${escapeXml(fontFamily)};">${escapeXml(cfg.prose || '')}</textarea>
                <div class="cg-inline-mode-group">${modeBtns}</div>
            </div>
            <div class="cg-tokens-view" style="flex:1;overflow-y:auto;padding-top:4px;">${tokensHtml}</div>
        </div>`;
    }

    function serializeCgState(cgId, cfg) {
        return JSON.stringify({
            cgId,
            prose: cfg.prose || '',
            mode: cfg.mode || 'substitution',
            seed: cfg.seed || 5150,
            cipherMap: cfg.cipherMap || generateSubstitutionKey(cfg.seed || 5150),
            hintCount: cfg.hintCount || 0,
            hintLetters: Array.isArray(cfg.hintLetters) ? cfg.hintLetters : [],
            showBlankLines: cfg.showBlankLines !== false,
            symbolSize: cfg.symbolSize || 22,
            fontFamily: cfg.fontFamily || 'Segoe UI, Arial, sans-serif',
            accentColor: cfg.accentColor || '#007670',
            symbolColor: cfg.symbolColor || '#0f172a',
            lineColor: cfg.lineColor || '#475569',
            textColor: cfg.textColor || '#007670',
            bgColor: cfg.bgColor || '#ffffff',
            borderColor: cfg.borderColor || '#cbd5e1'
        });
    }

    function syncLinkedCryptogramAnswerKey(cgId, cfg) {
        if (!cgId) return;
        const serialized = serializeCgState(cgId, cfg);
        const ansHtml = buildLiveFrameInnerHtml(cfg, true);
        const legendHtml = buildAnswerLegendHtml(cfg);

        // 1. Live DOM matches on active page
        document.querySelectorAll(`.pub-element[data-cg-id="${cgId}"][data-cryptogram="answer-key"]`).forEach((el) => {
            el.setAttribute('data-cg-state', serialized);
            const c = el.querySelector('.element-content');
            if (c) c.innerHTML = ansHtml;
        });
        document.querySelectorAll(`.pub-element[data-cg-id="${cgId}"][data-cryptogram="answer-legend"]`).forEach((el) => {
            el.setAttribute('data-cg-state', serialized);
            const c = el.querySelector('.element-content');
            if (c) c.innerHTML = legendHtml;
        });

        // 2. Serialized pages in state.pages (Page 2 Answer Key)
        if (typeof state !== 'undefined' && Array.isArray(state.pages)) {
            for (let pi = 0; pi < state.pages.length; pi++) {
                if (pi === state.currentPageIndex) continue;
                const pg = state.pages[pi];
                if (!pg || !Array.isArray(pg.elements)) continue;
                for (let ei = 0; ei < pg.elements.length; ei++) {
                    const item = pg.elements[ei];
                    const attrs = item && item.filterAttributes;
                    if (!attrs || attrs['data-cg-id'] !== cgId) continue;
                    attrs['data-cg-state'] = serialized;
                    const role = attrs['data-cryptogram'] || attrs['data-cg-role'];
                    if (role === 'answer-key') item.innerHTML = ansHtml;
                    else if (role === 'answer-legend') item.innerHTML = legendHtml;
                }
            }
        }
    }

    function installCanvasCryptogramHandlers() {
        if (window._cryptogramCanvasHandlersInstalled) return;
        window._cryptogramCanvasHandlersInstalled = true;

        // Live prose typing inside [data-cryptogram="frame"] .cg-prose-input
        document.addEventListener('input', function(e) {
            const proseInput = e.target && e.target.closest ? e.target.closest('.pub-element[data-cryptogram="frame"] .cg-prose-input') : null;
            if (!proseInput) return;
            const frameEl = proseInput.closest('.pub-element[data-cryptogram="frame"]');
            if (!frameEl) return;
            let parsed = {};
            try {
                parsed = JSON.parse(frameEl.getAttribute('data-cg-state') || '{}');
            } catch (err) {
                parsed = {};
            }
            const newProse = proseInput.value != null ? String(proseInput.value) : (proseInput.innerText || proseInput.textContent || '').replace(/\u00a0/g, ' ');
            parsed.prose = newProse;
            if (!parsed.cipherMap) parsed.cipherMap = generateSubstitutionKey(parsed.seed || 5150);
            parsed.hintLetters = selectStarterHints(newProse, parsed.hintCount || 0, parsed.seed || 5150);

            const cgId = frameEl.getAttribute('data-cg-id') || parsed.cgId || '';
            frameEl.setAttribute('data-cg-state', serializeCgState(cgId, parsed));

            const tokensView = frameEl.querySelector('.cg-tokens-view');
            if (tokensView) {
                tokensView.innerHTML = renderCipherTokensHtml(newProse, parsed, { isAnswer: false });
            }
            syncLinkedCryptogramAnswerKey(cgId, parsed);
        });

        // Persist textarea textContent cleanly when blurred and shield canvas key shortcuts while typing
        document.addEventListener('blur', function(e) {
            const proseInput = e.target && e.target.closest ? e.target.closest('.pub-element[data-cryptogram="frame"] .cg-prose-input') : null;
            if (!proseInput) return;
            if (proseInput.tagName === 'TEXTAREA') {
                proseInput.textContent = proseInput.value;
            }
        }, true);

        document.addEventListener('keydown', function(e) {
            const proseInput = e.target && e.target.closest ? e.target.closest('.pub-element[data-cryptogram="frame"] .cg-prose-input') : null;
            if (!proseInput) return;
            // Allow Ctrl+A, Backspace, Delete, arrows natively inside textarea without triggering canvas Delete/SelectAll
            e.stopPropagation();
        }, true);

        // Prevent inline mode switch buttons or prose box clicks from initiating a drag or closing selection
        document.addEventListener('mousedown', function(e) {
            const modeBtn = e.target && e.target.closest ? e.target.closest('.pub-element[data-cryptogram="frame"] .cg-inline-mode-btn') : null;
            if (modeBtn) {
                e.stopPropagation();
                e.preventDefault();
                const frameEl = modeBtn.closest('.pub-element[data-cryptogram="frame"]');
                if (!frameEl) return;
                const nextMode = modeBtn.getAttribute('data-cg-set-mode');
                if (!nextMode || !CIPHER_MODES[nextMode]) return;

                let parsed = {};
                try {
                    parsed = JSON.parse(frameEl.getAttribute('data-cg-state') || '{}');
                } catch (err) {
                    parsed = {};
                }
                parsed.mode = nextMode;
                if (!parsed.cipherMap) parsed.cipherMap = generateSubstitutionKey(parsed.seed || 5150);

                const cgId = frameEl.getAttribute('data-cg-id') || parsed.cgId || '';
                frameEl.setAttribute('data-cg-state', serializeCgState(cgId, parsed));

                frameEl.querySelectorAll('.cg-inline-mode-btn').forEach(b => {
                    b.classList.toggle('active', b.getAttribute('data-cg-set-mode') === nextMode);
                });
                const tokensView = frameEl.querySelector('.cg-tokens-view');
                if (tokensView) {
                    tokensView.innerHTML = renderCipherTokensHtml(parsed.prose || '', parsed, { isAnswer: false });
                }
                syncLinkedCryptogramAnswerKey(cgId, parsed);
                if (typeof window.pushHistory === 'function') window.pushHistory();
                return;
            }

            const proseInput = e.target && e.target.closest ? e.target.closest('.pub-element[data-cryptogram="frame"] .cg-prose-input') : null;
            if (proseInput) {
                const frameEl = proseInput.closest('.pub-element[data-cryptogram="frame"]');
                if (frameEl && typeof state !== 'undefined' && state.selectedEl !== frameEl && typeof window.selectElement === 'function') {
                    window.selectElement(frameEl);
                }
                e.stopPropagation();
            }
        }, true);

        // Double-clicking the cipher tokens area jumps cursor into the live prose editor bar
        document.addEventListener('dblclick', function(e) {
            const tokensView = e.target && e.target.closest ? e.target.closest('.pub-element[data-cryptogram="frame"] .cg-tokens-view') : null;
            if (!tokensView) return;
            const frameEl = tokensView.closest('.pub-element[data-cryptogram="frame"]');
            if (!frameEl) return;
            if (typeof window.selectElement === 'function') window.selectElement(frameEl);
            const proseInput = frameEl.querySelector('.cg-prose-input');
            if (proseInput) {
                proseInput.focus();
                try {
                    if (proseInput.tagName === 'TEXTAREA' && typeof proseInput.setSelectionRange === 'function') {
                        const len = (proseInput.value || '').length;
                        proseInput.setSelectionRange(len, len);
                    } else {
                        const range = document.createRange();
                        range.selectNodeContents(proseInput);
                        range.collapse(false);
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                } catch (err) {}
            }
        });
    }

    function insertTextBoxElement(innerHtml, left, top, width, height) {
        if (typeof window.createWrapper !== 'function') return null;
        const el = window.createWrapper(innerHtml);
        el.setAttribute('data-type', 'text');
        el.style.left = Math.round(left) + 'px';
        el.style.top = Math.round(top) + 'px';
        el.style.width = Math.round(width) + 'px';
        el.style.height = Math.round(height) + 'px';
        return el;
    }

    function insertCryptogramPageObjects(cgId, cfg, isAnswerKey) {
        const paperEl = document.getElementById('paper');
        const pw = paperEl ? (parseFloat(paperEl.style.width) || 794) : 794;
        const ph = paperEl ? (parseFloat(paperEl.style.height) || 1123) : 1123;
        const margin = 48;
        const usableW = Math.max(360, pw - margin * 2);
        const accentColor = normalizeHexColor(cfg.accentColor, '#007670');
        const textColor = normalizeHexColor(cfg.textColor, '#007670');
        const fontFamily = cfg.fontFamily || 'Segoe UI, Arial, sans-serif';
        const rawTitle = (cfg.title || 'Secret Cipher Cryptogram').trim() || 'Secret Cipher Cryptogram';
        const headingText = isAnswerKey ? `${rawTitle} - Answer Key` : rawTitle;
        const serialized = serializeCgState(cgId, cfg);

        // 1. Title Text Box
        const titleTop = 40;
        const titleH = 44;
        const titleEl = insertTextBoxElement(
            `<div contenteditable="true" spellcheck="false" style="width:100%;height:100%;box-sizing:border-box;padding:4px 8px;outline:none;text-align:center;font-family:${escapeXml(fontFamily)};font-size:23px;font-weight:800;color:${escapeXml(accentColor)};">${escapeXml(headingText)}</div>`,
            margin,
            titleTop,
            usableW,
            titleH
        );
        if (titleEl) {
            titleEl.setAttribute('data-cg-id', cgId);
            titleEl.setAttribute('data-cg-role', isAnswerKey ? 'answer-title' : 'title');
        }

        // 2. Subtitle / Decoding instruction
        const modeLabel = (CIPHER_MODES[cfg.mode] && CIPHER_MODES[cfg.mode].label) || 'Secret Cipher';
        const subText = isAnswerKey
            ? `Complete plaintext solution and decoder chart (${modeLabel}).`
            : `Decode this ${modeLabel} message by writing each letter on the blank line above its symbol.`;
        const subEl = insertTextBoxElement(
            `<div contenteditable="true" spellcheck="false" style="width:100%;height:100%;box-sizing:border-box;outline:none;text-align:center;font-family:${escapeXml(fontFamily)};font-size:12px;font-weight:600;color:${escapeXml(textColor)};opacity:0.85;">${escapeXml(subText)}</div>`,
            margin,
            84,
            usableW,
            24
        );
        if (subEl) {
            subEl.setAttribute('data-cg-id', cgId);
            subEl.setAttribute('data-cg-role', isAnswerKey ? 'answer-subtitle' : 'subtitle');
        }

        // 3. Main Cryptogram Frame (live editable on Page 1; solved on Page 2)
        const frameTop = 116;
        const legendH = 148;
        const frameH = isAnswerKey
            ? Math.max(260, ph - frameTop - legendH - 64)
            : Math.max(300, Math.min(540, ph - frameTop - 60));

        const frameHtml = buildLiveFrameInnerHtml(cfg, isAnswerKey);
        const frameEl = window.createWrapper(frameHtml);
        frameEl.setAttribute('data-type', 'text');
        frameEl.setAttribute('data-cryptogram', isAnswerKey ? 'answer-key' : 'frame');
        frameEl.setAttribute('data-cg-id', cgId);
        frameEl.setAttribute('data-cg-role', isAnswerKey ? 'answer-key' : 'frame');
        frameEl.setAttribute('data-cg-state', serialized);
        frameEl.style.left = margin + 'px';
        frameEl.style.top = frameTop + 'px';
        frameEl.style.width = usableW + 'px';
        frameEl.style.height = frameH + 'px';

        // 4. Page 2 Answer Decoder Key Legend
        if (isAnswerKey) {
            const legendTop = Math.min(ph - legendH - 36, frameTop + frameH + 18);
            const legendHtml = buildAnswerLegendHtml(cfg);
            const legendEl = window.createWrapper(legendHtml);
            legendEl.setAttribute('data-type', 'text');
            legendEl.setAttribute('data-cryptogram', 'answer-legend');
            legendEl.setAttribute('data-cg-id', cgId);
            legendEl.setAttribute('data-cg-role', 'answer-legend');
            legendEl.setAttribute('data-cg-state', serialized);
            legendEl.style.left = margin + 'px';
            legendEl.style.top = legendTop + 'px';
            legendEl.style.width = usableW + 'px';
            legendEl.style.height = legendH + 'px';
        }

        return frameEl;
    }

    function insertCryptogramIntoDocument(cfg) {
        if (typeof state === 'undefined' || typeof window.createWrapper !== 'function') return;

        const cgId = 'cg-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 10000);
        const startPageIdx = (typeof state.currentPageIndex === 'number') ? state.currentPageIndex : 0;
        const primaryEl = insertCryptogramPageObjects(cgId, cfg, false);

        let answerPageNumber = null;
        if (cfg.answerKeyOnPage2 && Array.isArray(state.pages)) {
            if (typeof serializeCurrentPage === 'function') {
                state.pages[startPageIdx] = serializeCurrentPage();
            }

            const targetIdx = startPageIdx + 1;
            const existingNext = state.pages[targetIdx];
            const isNextBlank = existingNext && Array.isArray(existingNext.elements) && existingNext.elements.length === 0;

            if (!isNextBlank) {
                const basePage = state.pages[startPageIdx] || {};
                const blankPage = {
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    orientation: basePage.orientation || 'portrait',
                    ignoreMasterPage: false,
                    ignoreBackground: false,
                    width: basePage.width || '794px',
                    height: basePage.height || '1123px',
                    dpi: basePage.dpi || state.dpi || 96,
                    format: basePage.format || state.format || 'A4',
                    background: '#ffffff',
                    header: '',
                    footer: '',
                    borderStyle: 'none',
                    elements: []
                };
                state.pages.splice(targetIdx, 0, blankPage);
            }

            if (typeof window.switchPage === 'function') {
                window.switchPage(targetIdx);
            } else {
                state.currentPageIndex = targetIdx;
                if (typeof renderPage === 'function') renderPage(state.pages[targetIdx]);
            }

            insertCryptogramPageObjects(cgId, cfg, true);
            if (typeof serializeCurrentPage === 'function') {
                state.pages[targetIdx] = serializeCurrentPage();
            }

            if (typeof window.switchPage === 'function') {
                window.switchPage(startPageIdx);
            }
            answerPageNumber = targetIdx + 1;
        }

        const primaryInDom = document.querySelector(`.pub-element[data-cg-id="${cgId}"][data-cryptogram="frame"]`) || primaryEl;
        if (primaryInDom && document.contains(primaryInDom) && typeof window.selectElement === 'function') {
            window.selectElement(primaryInDom);
        }
        if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
        if (typeof window.updateSidebar === 'function') window.updateSidebar();
        if (typeof window.pushHistory === 'function') window.pushHistory();

        if (typeof showToast === 'function') {
            showToast(answerPageNumber ? `Cryptogram frame + Page ${answerPageNumber} Answer Key inserted!` : 'Cryptogram frame inserted!');
        }
    }

    function makeModalDraggable(boxEl, handleEl) {
        if (!boxEl || !handleEl) return () => {};
        handleEl.style.cursor = 'move';
        let dragState = null;

        const onMouseDown = (e) => {
            if (e.button !== 0) return;
            if (e.target && e.target.closest('button, input, select, textarea, a')) return;
            const rect = boxEl.getBoundingClientRect();
            boxEl.style.position = 'fixed';
            boxEl.style.left = rect.left + 'px';
            boxEl.style.top = rect.top + 'px';
            boxEl.style.margin = '0';
            dragState = {
                startX: e.clientX,
                startY: e.clientY,
                origLeft: rect.left,
                origTop: rect.top
            };
            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!dragState) return;
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;
            const maxLeft = Math.max(0, window.innerWidth - 120);
            const maxTop = Math.max(0, window.innerHeight - 60);
            const nextLeft = Math.max(-boxEl.offsetWidth + 120, Math.min(maxLeft, dragState.origLeft + dx));
            const nextTop = Math.max(0, Math.min(maxTop, dragState.origTop + dy));
            boxEl.style.left = nextLeft + 'px';
            boxEl.style.top = nextTop + 'px';
        };

        const onMouseUp = () => {
            dragState = null;
        };

        handleEl.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        return () => {
            handleEl.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }

    function enhanceSelectControls(rootEl) {
        const selects = rootEl.querySelectorAll('select.cg-select');
        const controllers = [];

        const closeAllMenus = (exceptMenu) => {
            document.querySelectorAll('.cg-select-menu.open').forEach(menu => {
                if (menu !== exceptMenu) menu.classList.remove('open');
            });
            rootEl.querySelectorAll('.cg-modern-select.open').forEach(btn => {
                if (!exceptMenu || btn._cgMenu !== exceptMenu) btn.classList.remove('open');
            });
        };

        selects.forEach(sel => {
            sel.style.display = 'none';
            const wrapper = document.createElement('div');
            wrapper.className = 'cg-select-wrap';
            sel.parentNode.insertBefore(wrapper, sel);
            wrapper.appendChild(sel);

            const trigger = document.createElement('div');
            trigger.className = 'modern-select cg-modern-select';
            trigger.setAttribute('tabindex', '0');
            trigger.setAttribute('role', 'combobox');
            trigger.setAttribute('aria-expanded', 'false');

            const labelSpan = document.createElement('span');
            labelSpan.className = 'cg-select-label';
            const arrowBox = document.createElement('div');
            arrowBox.className = 'arrow-box';
            arrowBox.innerHTML = '<i class="fas fa-chevron-down" style="font-size:10px;"></i>';
            trigger.appendChild(labelSpan);
            trigger.appendChild(arrowBox);
            wrapper.appendChild(trigger);

            const menu = document.createElement('div');
            menu.className = 'cg-select-menu';
            document.body.appendChild(menu);
            trigger._cgMenu = menu;

            const syncLabelAndActive = () => {
                const selectedOpt = sel.options[sel.selectedIndex] || sel.options[0];
                labelSpan.textContent = selectedOpt ? selectedOpt.textContent : '';
                if (sel.id === 'cg-font-family' && selectedOpt) {
                    labelSpan.style.fontFamily = selectedOpt.value;
                } else {
                    labelSpan.style.fontFamily = '';
                }
                menu.querySelectorAll('.cg-select-option').forEach(optBtn => {
                    optBtn.classList.toggle('active', optBtn.dataset.value === sel.value);
                });
            };

            const rebuildOptions = () => {
                menu.innerHTML = '';
                Array.from(sel.options).forEach(opt => {
                    const item = document.createElement('div');
                    item.className = 'cg-select-option';
                    item.dataset.value = opt.value;
                    item.textContent = opt.textContent;
                    if (sel.id === 'cg-font-family') item.style.fontFamily = opt.value;
                    item.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (sel.value !== opt.value) {
                            sel.value = opt.value;
                            sel.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        syncLabelAndActive();
                        closeAllMenus(null);
                    });
                    menu.appendChild(item);
                });
                syncLabelAndActive();
            };

            const openMenu = () => {
                closeAllMenus(menu);
                const rect = trigger.getBoundingClientRect();
                menu.style.minWidth = Math.max(150, rect.width) + 'px';
                menu.style.left = rect.left + 'px';
                const estHeight = Math.min(240, menu.children.length * 32 + 12);
                const spaceBelow = window.innerHeight - rect.bottom;
                if (spaceBelow < estHeight && rect.top > estHeight) {
                    menu.style.top = (rect.top - estHeight - 4) + 'px';
                } else {
                    menu.style.top = (rect.bottom + 4) + 'px';
                }
                menu.classList.add('open');
                trigger.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
            };

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                if (menu.classList.contains('open')) {
                    closeAllMenus(null);
                    trigger.setAttribute('aria-expanded', 'false');
                } else {
                    openMenu();
                }
            });

            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    trigger.click();
                } else if (e.key === 'Escape') {
                    closeAllMenus(null);
                }
            });

            sel.addEventListener('change', syncLabelAndActive);
            rebuildOptions();
            controllers.push({ sel, trigger, menu, syncLabelAndActive });
        });

        const onDocClick = (e) => {
            if (!e.target.closest('.cg-select-wrap') && !e.target.closest('.cg-select-menu')) {
                closeAllMenus(null);
            }
        };
        document.addEventListener('mousedown', onDocClick);

        return {
            syncAll: () => controllers.forEach(c => c.syncLabelAndActive()),
            closeAll: () => closeAllMenus(null),
            destroy: () => {
                document.removeEventListener('mousedown', onDocClick);
                controllers.forEach(c => c.menu.remove());
            }
        };
    }

    function openHelpModal(parentOverlay) {
        const existingHelp = document.getElementById('op-cryptogram-help-modal');
        if (existingHelp) existingHelp.remove();

        const topics = [
            {
                id: 'overview',
                title: 'Overview & Live Typing',
                body: `
                    <p><strong>Cryptogram &amp; Secret Cipher Frames</strong> are specialized smart text boxes that convert normal prose directly into solvable secret cipher puzzles.</p>
                    <ul>
                        <li><strong>Studio Builder or Live Canvas:</strong> Compose your message inside this window, or edit prose directly inside the inserted frame on your publication page whenever it is selected.</li>
                        <li><strong>Word-Safe Wrapping:</strong> Encoded words never split awkwardly across lines, while punctuation passes through cleanly without extra blank lines.</li>
                        <li><strong>Write-In Guess Lines:</strong> Blank dash lines appear directly above every cipher symbol so readers can pencil in decoded letters.</li>
                    </ul>
                `
            },
            {
                id: 'modes',
                title: 'Cipher Modes Explained',
                body: `
                    <p>Switch seamlessly between four classic cipher systems in the builder or right from the inline frame bar:</p>
                    <ul>
                        <li><strong>Substitution Cipher (A-Z):</strong> Solvable monoalphabetic cipher where no letter maps to itself. Click <em>Shuffle Key</em> to deal a brand-new substitution mapping.</li>
                        <li><strong>Pigpen (Masonic) Symbols:</strong> Geometric tic-tac-toe and X-grid vector shapes for A-Z, including dotted variants for J-R and W-Z.</li>
                        <li><strong>Braille Dots (Grade-1):</strong> Standard 2x3 Grade-1 English Braille dot cells with subtle open position guides for clear visual decoding.</li>
                        <li><strong>Morse Code:</strong> Crisp dot-and-dash signals for A-Z letters and 0-9 digits scaled cleanly below each write-in blank.</li>
                    </ul>
                `
            },
            {
                id: 'hints',
                title: 'Write-In Lines & Starter Hints',
                body: `
                    <p>Fine-tune reading comfort and solving difficulty before printing or exporting:</p>
                    <ul>
                        <li><strong>Show Write-In Blank Lines:</strong> Enabled by default. Displays crisp pencil lines above every cipher character for easy solving.</li>
                        <li><strong>Starter Hint Letters:</strong> Optionally pre-fill 1, 2, or 3 decoded letters on their write-in lines across the frame to give solvers a helpful starting clue.</li>
                    </ul>
                `
            },
            {
                id: 'canvas',
                title: 'Editing Frames on the Canvas',
                body: `
                    <p>Once inserted onto your publication page, the Cryptogram frame remains live and editable:</p>
                    <ul>
                        <li><strong>Live Prose Bar:</strong> Select the frame (or double-click its symbols) to reveal the compact <em>Type Prose</em> bar at the top of the frame. Every character you type converts live!</li>
                        <li><strong>Quick Mode Buttons:</strong> Switch between <code>Sub</code>, <code>Pigpen</code>, <code>Braille</code>, and <code>Morse</code> directly inside the frame bar.</li>
                        <li><strong>Clean Print View:</strong> Deselecting the frame or printing automatically hides the top editor bar so only your puzzle and guess lines print.</li>
                    </ul>
                `
            },
            {
                id: 'answer-key',
                title: 'Colors & Page 2 Answer Key',
                body: `
                    <p>Style frames to match newsletters, mysteries, and classroom handouts, with automatic solutions on Page 2:</p>
                    <ul>
                        <li><strong>Presets &amp; Custom Swatches:</strong> Pick <em>Classic Teal</em>, <em>Classic Print</em>, <em>Spy Parchment</em>, <em>Ocean Blue</em>, <em>Warm Berry</em>, or <em>Dark Dossier</em>, or click any swatch to open Open Publisher's Custom Color Picker.</li>
                        <li><strong>Page 2 Answer Key:</strong> Checked by default. Generates the fully solved message frame plus a complete A-Z Decoder Key chart on Page 2 that updates automatically when you edit Page 1 prose.</li>
                    </ul>
                `
            }
        ];

        const helpOverlay = document.createElement('div');
        helpOverlay.id = 'op-cryptogram-help-modal';
        helpOverlay.className = 'cg-help-overlay';
        helpOverlay.innerHTML = `
            <style>
                .cg-help-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.14);
                    z-index: 1000030;
                    display: flex; align-items: center; justify-content: center;
                    padding: 16px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .cg-help-box {
                    width: 660px; max-width: 94vw; height: 470px; max-height: 86vh;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #1e293b);
                    border: 1px solid var(--ui-border, #94a3b8); border-radius: 8px;
                    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.28);
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .cg-help-header {
                    padding: 6px 8px 6px 14px;
                    background: linear-gradient(135deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #004a46));
                    color: #ffffff; display: flex; align-items: center; justify-content: space-between;
                    user-select: none; min-height: 44px; box-sizing: border-box;
                }
                .cg-help-toolbar {
                    display: flex; align-items: center; justify-content: space-between; gap: 8px;
                    padding: 6px 12px; background: var(--ui-surface-bg, #f1f4f6);
                    border-bottom: 1px solid var(--ui-border, #cbd5e1); font-size: 12px;
                }
                body.dark-mode .cg-help-toolbar { background: #1e293b; border-color: #334155; }
                .cg-help-nav-btns { display: flex; align-items: center; gap: 4px; }
                .cg-xp-tool-btn {
                    display: inline-flex; align-items: center; gap: 5px;
                    padding: 4px 10px; font-size: 11.5px; font-weight: 600;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-theme-dark, #004a46);
                    border: 1px solid var(--ui-border, #cbd5e1); border-radius: 4px; cursor: pointer;
                }
                body.dark-mode .cg-xp-tool-btn { background: #0f172a; color: #e2e8f0; border-color: #475569; }
                .cg-xp-tool-btn:hover:not(:disabled) { border-color: var(--ui-theme-color, #007670); background: rgba(0, 118, 112, 0.08); }
                .cg-xp-tool-btn:disabled { opacity: 0.45; cursor: default; }
                .cg-help-split {
                    flex: 1; display: grid; grid-template-columns: 210px 1fr; min-height: 0;
                }
                .cg-help-toc {
                    background: var(--ui-surface-bg, #f8fafc); border-right: 1px solid var(--ui-border, #cbd5e1);
                    padding: 10px 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 3px;
                }
                body.dark-mode .cg-help-toc { background: #0f172a; border-right-color: #334155; }
                .cg-help-toc-head {
                    font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
                    color: var(--ui-theme-color, #007670); padding: 2px 6px 6px;
                }
                .cg-help-topic-btn {
                    width: 100%; text-align: left; border: 1px solid transparent; background: transparent;
                    color: var(--ui-text, #1e293b); padding: 7px 9px; border-radius: 4px;
                    font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 7px;
                }
                .cg-help-topic-btn i { color: var(--ui-theme-color, #007670); font-size: 11px; }
                .cg-help-topic-btn:hover { background: rgba(0, 118, 112, 0.08); }
                .cg-help-topic-btn.active { background: var(--ui-theme-color, #007670); color: #ffffff; font-weight: 700; }
                .cg-help-topic-btn.active i { color: #ffffff; }
                .cg-help-pane { padding: 16px 20px; overflow-y: auto; font-size: 13px; line-height: 1.55; }
                .cg-help-pane h4 {
                    margin: 0 0 10px; font-size: 16px; color: var(--ui-theme-color, #007670);
                    border-bottom: 1px solid var(--ui-border, #e2e8f0); padding-bottom: 6px;
                }
                .cg-help-pane ul { margin: 8px 0 0; padding-left: 18px; }
                .cg-help-pane li { margin-bottom: 7px; }
                .cg-help-pane code {
                    padding: 1px 5px; border-radius: 3px; font-size: 11.5px;
                    background: rgba(0, 118, 112, 0.1); color: var(--ui-theme-dark, #004a46);
                }
                body.dark-mode .cg-help-pane code { background: rgba(45, 212, 191, 0.15); color: #5eead4; }
                .cg-help-footer {
                    padding: 9px 14px; border-top: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-surface-bg, #f8fafc); display: flex; justify-content: flex-end;
                }
                body.dark-mode .cg-help-footer { background: #1e293b; border-top-color: #334155; }
                .cg-help-ok {
                    padding: 6px 18px; border-radius: 5px; border: none; font-weight: 700; font-size: 12.5px;
                    background: var(--ui-theme-color, #007670); color: #ffffff; cursor: pointer;
                }
                .cg-help-ok:hover { background: var(--ui-theme-dark, #004a46); }
                @media (max-width: 560px) {
                    .cg-help-split { grid-template-columns: 1fr; }
                    .cg-help-toc { max-height: 130px; border-right: none; border-bottom: 1px solid var(--ui-border, #cbd5e1); }
                }
            </style>
            <div class="cg-help-box" id="cg-help-box" role="dialog" aria-modal="true" aria-labelledby="cg-help-title">
                <div class="cg-help-header" id="cg-help-header">
                    <span id="cg-help-title" style="display:flex; align-items:center; gap:8px; font-weight:700; font-size:13.5px;">
                        <i class="fas fa-book-open"></i> Cryptogram &amp; Secret Cipher Help
                    </span>
                    <button type="button" class="custom-dialog-close" id="cg-help-close-x" aria-label="Close Help">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="cg-help-toolbar">
                    <div class="cg-help-nav-btns">
                        <button type="button" class="cg-xp-tool-btn" id="cg-help-back-btn" disabled><i class="fas fa-arrow-left"></i> Back</button>
                        <button type="button" class="cg-xp-tool-btn" id="cg-help-fwd-btn" disabled>Forward <i class="fas fa-arrow-right"></i></button>
                    </div>
                    <span id="cg-help-breadcrumb" style="font-weight:600; opacity:0.8;">Overview &amp; Live Typing</span>
                </div>
                <div class="cg-help-split">
                    <div class="cg-help-toc">
                        <div class="cg-help-toc-head">Contents</div>
                        ${topics.map((t, i) => `
                            <button type="button" class="cg-help-topic-btn${i === 0 ? ' active' : ''}" data-topic-id="${t.id}">
                                <i class="fas fa-file-alt"></i><span>${escapeXml(t.title)}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="cg-help-pane" id="cg-help-content"></div>
                </div>
                <div class="cg-help-footer">
                    <button type="button" class="cg-help-ok" id="cg-help-ok-btn">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(helpOverlay);
        const helpBox = helpOverlay.querySelector('#cg-help-box');
        const helpHeader = helpOverlay.querySelector('#cg-help-header');
        const teardownDrag = makeModalDraggable(helpBox, helpHeader);

        const history = [topics[0].id];
        let histIdx = 0;

        const renderTopic = (topicId, pushHist) => {
            const topic = topics.find(t => t.id === topicId) || topics[0];
            if (pushHist && history[histIdx] !== topic.id) {
                history.splice(histIdx + 1);
                history.push(topic.id);
                histIdx = history.length - 1;
            }
            helpOverlay.querySelectorAll('.cg-help-topic-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.topicId === topic.id);
            });
            helpOverlay.querySelector('#cg-help-breadcrumb').textContent = topic.title;
            helpOverlay.querySelector('#cg-help-content').innerHTML = `<h4>${escapeXml(topic.title)}</h4>${topic.body}`;
            helpOverlay.querySelector('#cg-help-back-btn').disabled = histIdx <= 0;
            helpOverlay.querySelector('#cg-help-fwd-btn').disabled = histIdx >= history.length - 1;
        };

        helpOverlay.querySelectorAll('.cg-help-topic-btn').forEach(btn => {
            btn.addEventListener('click', () => renderTopic(btn.dataset.topicId, true));
        });
        helpOverlay.querySelector('#cg-help-back-btn').addEventListener('click', () => {
            if (histIdx > 0) {
                histIdx--;
                renderTopic(history[histIdx], false);
            }
        });
        helpOverlay.querySelector('#cg-help-fwd-btn').addEventListener('click', () => {
            if (histIdx < history.length - 1) {
                histIdx++;
                renderTopic(history[histIdx], false);
            }
        });

        const closeHelp = () => {
            teardownDrag();
            helpOverlay.remove();
        };
        helpOverlay.querySelector('#cg-help-close-x').addEventListener('click', closeHelp);
        helpOverlay.querySelector('#cg-help-ok-btn').addEventListener('click', closeHelp);
        helpOverlay.addEventListener('mousedown', (e) => {
            if (e.target === helpOverlay) closeHelp();
        });

        renderTopic(topics[0].id, false);
        if (parentOverlay && !document.body.contains(parentOverlay)) closeHelp();
    }

    function showModal() {
        const existing = document.getElementById('op-cryptogram-modal');
        if (existing) existing.remove();
        const existingHelp = document.getElementById('op-cryptogram-help-modal');
        if (existingHelp) existingHelp.remove();

        const initialThemeColor = resolveThemeColor();
        const modalState = {
            title: 'Secret Cipher Cryptogram',
            prose: DEFAULT_PROSE,
            mode: 'substitution',
            seed: 4219,
            cipherMap: generateSubstitutionKey(4219),
            hintCount: 2,
            hintLetters: [],
            showBlankLines: true,
            symbolSize: 22,
            fontFamily: 'Segoe UI, Arial, sans-serif',
            accentColor: initialThemeColor,
            symbolColor: '#0f172a',
            lineColor: '#475569',
            textColor: initialThemeColor,
            bgColor: '#ffffff',
            borderColor: '#cbd5e1',
            answerKeyOnPage2: true,
            previewMode: 'puzzle'
        };
        modalState.hintLetters = selectStarterHints(modalState.prose, modalState.hintCount, modalState.seed);

        const overlay = document.createElement('div');
        overlay.id = 'op-cryptogram-modal';
        overlay.className = 'cg-modal-overlay';

        const presetButtonsHtml = Object.keys(COLOR_PRESETS).map(key => {
            const p = COLOR_PRESETS[key];
            return `<button type="button" class="cg-preset-btn" data-color-preset="${key}" title="${escapeXml(p.label)}">
                <span class="cg-preset-swatch" style="background:linear-gradient(135deg, ${p.accent} 50%, ${p.bg} 50%);"></span>
                <span>${escapeXml(p.label)}</span>
            </button>`;
        }).join('');

        overlay.innerHTML = `
            <style>
                .cg-modal-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.14);
                    z-index: 1000010;
                    display: flex; align-items: center; justify-content: center;
                    padding: 14px; box-sizing: border-box;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .cg-modal-box {
                    width: 960px; max-width: 96vw; max-height: 92vh;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #1e293b);
                    border-radius: 10px; box-shadow: 0 20px 55px rgba(0, 0, 0, 0.34);
                    border: 1px solid var(--ui-border, #cbd5e1);
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .cg-modal-header {
                    padding: 8px 10px 8px 18px;
                    background: linear-gradient(135deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #004a46));
                    color: #ffffff; display: flex; align-items: center; justify-content: space-between;
                    user-select: none; min-height: 46px; box-sizing: border-box;
                }
                .cg-header-title { display: flex; align-items: center; gap: 9px; font-weight: 700; font-size: 14.5px; }
                .cg-header-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
                .cg-header-actions .custom-dialog-close {
                    width: 34px; height: 34px; font-size: 17px; border-radius: 8px;
                }
                .cg-help-icon-btn:hover,
                body.dark-mode .cg-help-icon-btn:hover {
                    background: rgba(255, 255, 255, 0.25) !important;
                }
                .cg-modal-body {
                    display: grid; grid-template-columns: 356px 1fr; flex: 1; min-height: 0; overflow: hidden;
                }
                .cg-controls-pane {
                    padding: 14px 16px; border-right: 1px solid var(--ui-border, #e2e8f0);
                    overflow-y: auto; display: flex; flex-direction: column; gap: 11px;
                    background: var(--ui-surface-bg, #f8fafc);
                }
                body.dark-mode .cg-controls-pane { background: #0f172a; border-right-color: #334155; }
                .cg-field-label {
                    display: block; font-size: 11px; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 0.45px; color: var(--ui-theme-dark, #0f766e); margin-bottom: 4px;
                }
                body.dark-mode .cg-field-label { color: #5eead4; }
                .cg-input, .cg-textarea {
                    width: 100%; box-sizing: border-box; border-radius: 6px;
                    border: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #0f172a);
                    padding: 7px 9px; font-size: 12.5px; font-family: inherit; outline: none;
                }
                body.dark-mode .cg-input, body.dark-mode .cg-textarea { background: #1e293b; color: #f8fafc; border-color: #475569; }
                .cg-input:focus, .cg-textarea:focus {
                    border-color: var(--ui-theme-color, #007670); box-shadow: 0 0 0 2px rgba(0, 118, 112, 0.16);
                }
                .cg-textarea { min-height: 88px; resize: vertical; line-height: 1.45; }
                .cg-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .cg-select-wrap { position: relative; width: 100%; }
                .cg-modern-select {
                    width: 100%; min-width: 0; height: 31px; padding: 0 0 0 9px;
                    border-radius: 6px; font-size: 12px; justify-content: space-between;
                    border: 1px solid var(--ui-border, #cbd5e1); background: var(--ui-panel-bg, #ffffff);
                    color: var(--ui-text, #0f172a);
                }
                body.dark-mode .cg-modern-select { background: #1e293b; color: #f8fafc; border-color: #475569; }
                .cg-select-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
                .cg-modern-select .arrow-box {
                    height: 100%; width: 28px; display: flex; align-items: center; justify-content: center;
                    background: var(--ui-theme-color, #007670); color: #ffffff;
                    border-top-right-radius: 5px; border-bottom-right-radius: 5px; flex-shrink: 0;
                }
                .cg-select-menu {
                    position: fixed; z-index: 1000060; display: none; flex-direction: column;
                    background: var(--ui-panel-bg, #ffffff); border: 1px solid var(--ui-border, #cbd5e1);
                    border-radius: 7px; box-shadow: 0 10px 26px rgba(0, 0, 0, 0.22);
                    padding: 4px; max-height: 240px; overflow-y: auto; box-sizing: border-box;
                }
                body.dark-mode .cg-select-menu { background: #1e293b; border-color: #475569; }
                .cg-select-menu.open { display: flex; }
                .cg-select-option {
                    padding: 6px 10px; font-size: 12px; border-radius: 5px; cursor: pointer;
                    color: var(--ui-text, #1e293b); white-space: nowrap;
                }
                body.dark-mode .cg-select-option { color: #f8fafc; }
                .cg-select-option:hover { background: rgba(0, 118, 112, 0.12); }
                .cg-select-option.active { background: var(--ui-theme-color, #007670); color: #ffffff; font-weight: 700; }

                .cg-color-section {
                    border: 1px solid var(--ui-border, #e2e8f0); border-radius: 8px;
                    padding: 9px 10px; background: var(--ui-panel-bg, #ffffff); display: flex; flex-direction: column; gap: 7px;
                }
                body.dark-mode .cg-color-section { background: #1e293b; border-color: #334155; }
                .cg-color-presets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
                .cg-preset-btn {
                    display: flex; align-items: center; gap: 5px; padding: 4px 6px;
                    font-size: 10.5px; font-weight: 600; border-radius: 5px;
                    border: 1px solid var(--ui-border, #cbd5e1); background: var(--ui-surface-bg, #f8fafc);
                    color: var(--ui-text, #1e293b); cursor: pointer; text-align: left;
                }
                body.dark-mode .cg-preset-btn { background: #0f172a; color: #e2e8f0; border-color: #475569; }
                .cg-preset-btn:hover { border-color: var(--ui-theme-color, #007670); }
                .cg-preset-swatch { width: 13px; height: 13px; border-radius: 3px; border: 1px solid rgba(0, 0, 0, 0.2); flex-shrink: 0; }
                .cg-color-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
                .cg-color-chip {
                    display: flex; align-items: center; justify-content: space-between; gap: 4px;
                    padding: 4px 7px; border-radius: 5px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-surface-bg, #f8fafc); color: var(--ui-text, #1e293b);
                    font-size: 11px; font-weight: 600; cursor: pointer;
                }
                body.dark-mode .cg-color-chip { background: #0f172a; color: #e2e8f0; border-color: #475569; }
                .cg-color-chip:hover { border-color: var(--ui-theme-color, #007670); }
                .cg-swatch-box { width: 16px; height: 16px; border-radius: 4px; border: 1px solid rgba(0, 0, 0, 0.25); flex-shrink: 0; }

                .cg-check-label {
                    display: flex; align-items: center; gap: 7px; font-size: 12px; cursor: pointer;
                    color: var(--ui-text, #1e293b); user-select: none;
                }
                body.dark-mode .cg-check-label { color: #e2e8f0; }

                .cg-preview-pane {
                    display: flex; flex-direction: column; min-height: 0; background: var(--ui-panel-bg, #ffffff);
                }
                body.dark-mode .cg-preview-pane { background: #111827; }
                .cg-preview-toolbar {
                    display: flex; align-items: center; justify-content: space-between; gap: 8px;
                    padding: 9px 14px; border-bottom: 1px solid var(--ui-border, #e2e8f0);
                }
                body.dark-mode .cg-preview-toolbar { border-bottom-color: #334155; }
                .cg-preview-tabs { display: flex; gap: 6px; }
                .cg-ptab {
                    padding: 5px 12px; border-radius: 6px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: transparent; color: var(--ui-text, #334155); font-size: 12px; font-weight: 600; cursor: pointer;
                }
                body.dark-mode .cg-ptab { color: #cbd5e1; border-color: #475569; }
                .cg-ptab.active {
                    background: var(--ui-theme-color, #007670); border-color: var(--ui-theme-color, #007670); color: #ffffff;
                }
                .cg-mini-btn {
                    padding: 5px 10px; border-radius: 6px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-surface-bg, #f8fafc); color: var(--ui-text, #1e293b);
                    font-size: 11.5px; font-weight: 600; cursor: pointer;
                }
                body.dark-mode .cg-mini-btn { background: #1e293b; color: #f8fafc; border-color: #475569; }
                .cg-mini-btn:hover { border-color: var(--ui-theme-color, #007670); color: var(--ui-theme-color, #007670); }

                .cg-preview-canvas {
                    flex: 1; display: flex; flex-direction: column; min-height: 0; overflow-y: auto;
                    padding: 14px 16px; gap: 12px; background: var(--ui-surface-bg, #f8fafc);
                }
                body.dark-mode .cg-preview-canvas { background: #0f172a; }
                .cg-preview-frame-host {
                    border-radius: 8px; padding: 16px 18px; box-sizing: border-box;
                }
                .cg-status-bar {
                    padding: 7px 14px; border-top: 1px solid var(--ui-border, #e2e8f0);
                    font-size: 11.5px; display: flex; align-items: center; justify-content: space-between;
                    background: var(--ui-surface-bg, #f8fafc);
                }
                body.dark-mode .cg-status-bar { background: #0f172a; border-top-color: #334155; }
                .cg-modal-footer {
                    padding: 10px 16px; border-top: 1px solid var(--ui-border, #e2e8f0);
                    display: flex; align-items: center; justify-content: space-between; gap: 10px;
                    background: var(--ui-panel-bg, #ffffff);
                }
                body.dark-mode .cg-modal-footer { background: #111827; border-top-color: #334155; }
                .cg-btn-secondary {
                    padding: 7px 15px; border-radius: 6px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: transparent; color: var(--ui-text, #1e293b); font-size: 12.5px; font-weight: 600; cursor: pointer;
                }
                body.dark-mode .cg-btn-secondary { color: #e2e8f0; border-color: #475569; }
                .cg-btn-primary {
                    padding: 7px 18px; border-radius: 6px; border: none;
                    background: var(--ui-theme-color, #007670); color: #ffffff;
                    font-size: 12.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 7px;
                }
                .cg-btn-primary:hover { background: var(--ui-theme-dark, #004a46); }
                @media (max-width: 820px) {
                    .cg-modal-body { grid-template-columns: 1fr; }
                    .cg-controls-pane { max-height: 290px; border-right: none; border-bottom: 1px solid var(--ui-border, #e2e8f0); }
                }
            </style>
            <div class="cg-modal-box" id="cg-modal-box" role="dialog" aria-modal="true" aria-labelledby="cg-modal-title">
                <div class="cg-modal-header" id="cg-modal-header">
                    <div class="cg-header-title" id="cg-modal-title">
                        <i class="fas fa-user-secret"></i>
                        <span>Cryptogram &amp; Secret Cipher Frame</span>
                    </div>
                    <div class="cg-header-actions">
                        <button type="button" class="custom-dialog-close cg-help-icon-btn" id="cg-help-btn" title="Cryptogram Help" aria-label="Cryptogram Help">
                            <i class="fas fa-question"></i>
                        </button>
                        <button type="button" class="custom-dialog-close" id="cg-close-x" title="Close" aria-label="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div class="cg-modal-body">
                    <div class="cg-controls-pane">
                        <div>
                            <label class="cg-field-label" for="cg-title">Frame Title</label>
                            <input type="text" id="cg-title" class="cg-input" value="${escapeXml(modalState.title)}">
                        </div>

                        <div>
                            <label class="cg-field-label" for="cg-prose">Secret Message (Type Normal Prose)</label>
                            <textarea id="cg-prose" class="cg-textarea">${escapeXml(modalState.prose)}</textarea>
                        </div>

                        <div class="cg-row-2">
                            <div>
                                <label class="cg-field-label" for="cg-cipher-mode">Cipher System</label>
                                <select id="cg-cipher-mode" class="cg-select">
                                    <option value="substitution" selected>Substitution Cipher</option>
                                    <option value="pigpen">Pigpen (Masonic)</option>
                                    <option value="braille">Braille Dots</option>
                                    <option value="morse">Morse Code</option>
                                </select>
                            </div>
                            <div>
                                <label class="cg-field-label" for="cg-hint-count">Starter Hints</label>
                                <select id="cg-hint-count" class="cg-select">
                                    <option value="0">0 Hints (Expert)</option>
                                    <option value="1">1 Hint Letter</option>
                                    <option value="2" selected>2 Hint Letters</option>
                                    <option value="3">3 Hint Letters</option>
                                </select>
                            </div>
                        </div>

                        <div class="cg-row-2">
                            <div>
                                <label class="cg-field-label" for="cg-symbol-size">Symbol Size</label>
                                <select id="cg-symbol-size" class="cg-select">
                                    <option value="18">Compact (18px)</option>
                                    <option value="22" selected>Standard (22px)</option>
                                    <option value="26">Large (26px)</option>
                                    <option value="30">Extra Large (30px)</option>
                                </select>
                            </div>
                            <div>
                                <label class="cg-field-label" for="cg-font-family">Guess &amp; Letter Font</label>
                                <select id="cg-font-family" class="cg-select">
                                    <option value="Segoe UI, Arial, sans-serif">Segoe UI (Clean)</option>
                                    <option value="Courier New, monospace">Courier New (Mono)</option>
                                    <option value="Arial, sans-serif">Arial</option>
                                    <option value="Georgia, serif">Georgia (Serif)</option>
                                    <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                                </select>
                            </div>
                        </div>

                        <div class="cg-color-section">
                            <div style="display:flex; align-items:center; justify-content:space-between;">
                                <label class="cg-field-label" style="margin:0;">Colors &amp; Palette</label>
                                <span style="font-size:10.5px; opacity:0.7;">Presets or custom swatches</span>
                            </div>
                            <div class="cg-color-presets" id="cg-color-presets">
                                ${presetButtonsHtml}
                            </div>
                            <div class="cg-color-grid">
                                <button type="button" class="cg-color-chip" data-color-target="cg-accent-color" title="Title &amp; key header highlight">
                                    <span>Accent</span>
                                    <span class="cg-swatch-box" data-swatch-for="cg-accent-color" style="background:${escapeXml(normalizeHexColor(modalState.accentColor, '#007670'))};"></span>
                                    <input type="hidden" id="cg-accent-color" value="${escapeXml(normalizeHexColor(modalState.accentColor, '#007670'))}">
                                </button>
                                <button type="button" class="cg-color-chip" data-color-target="cg-symbol-color" title="Cipher symbols, dots &amp; dashes">
                                    <span>Symbols</span>
                                    <span class="cg-swatch-box" data-swatch-for="cg-symbol-color" style="background:${escapeXml(modalState.symbolColor)};"></span>
                                    <input type="hidden" id="cg-symbol-color" value="${escapeXml(modalState.symbolColor)}">
                                </button>
                                <button type="button" class="cg-color-chip" data-color-target="cg-line-color" title="Blank guess dash lines">
                                    <span>Guess Line</span>
                                    <span class="cg-swatch-box" data-swatch-for="cg-line-color" style="background:${escapeXml(modalState.lineColor)};"></span>
                                    <input type="hidden" id="cg-line-color" value="${escapeXml(modalState.lineColor)}">
                                </button>
                                <button type="button" class="cg-color-chip" data-color-target="cg-text-color" title="Hints &amp; solution text">
                                    <span>Hints</span>
                                    <span class="cg-swatch-box" data-swatch-for="cg-text-color" style="background:${escapeXml(normalizeHexColor(modalState.textColor, '#007670'))};"></span>
                                    <input type="hidden" id="cg-text-color" value="${escapeXml(normalizeHexColor(modalState.textColor, '#007670'))}">
                                </button>
                                <button type="button" class="cg-color-chip" data-color-target="cg-bg-color" title="Frame card background">
                                    <span>Frame Fill</span>
                                    <span class="cg-swatch-box" data-swatch-for="cg-bg-color" style="background:${escapeXml(modalState.bgColor)};"></span>
                                    <input type="hidden" id="cg-bg-color" value="${escapeXml(modalState.bgColor)}">
                                </button>
                                <button type="button" class="cg-color-chip" data-color-target="cg-border-color" title="Frame border color">
                                    <span>Borders</span>
                                    <span class="cg-swatch-box" data-swatch-for="cg-border-color" style="background:${escapeXml(modalState.borderColor)};"></span>
                                    <input type="hidden" id="cg-border-color" value="${escapeXml(modalState.borderColor)}">
                                </button>
                            </div>
                        </div>

                        <div style="border-top:1px solid var(--ui-border, #e2e8f0); padding-top:10px; display:flex; flex-direction:column; gap:7px;">
                            <label class="cg-check-label">
                                <input type="checkbox" id="cg-blank-lines" checked>
                                Show blank write-in dash lines above symbols
                            </label>
                            <label class="cg-check-label" style="font-weight:700;">
                                <input type="checkbox" id="cg-answer-page2" checked>
                                Generate Answer Key on Page 2
                            </label>
                        </div>
                    </div>

                    <div class="cg-preview-pane">
                        <div class="cg-preview-toolbar">
                            <div class="cg-preview-tabs">
                                <button type="button" class="cg-ptab active" id="cg-ptab-puzzle">Puzzle Frame</button>
                                <button type="button" class="cg-ptab" id="cg-ptab-answer">Answer Key &amp; Decoder</button>
                            </div>
                            <button type="button" class="cg-mini-btn" id="cg-shuffle-key-btn" title="Shuffle substitution key and starter hints"><i class="fas fa-random" style="margin-right:4px;"></i>Shuffle Key</button>
                        </div>
                        <div class="cg-preview-canvas">
                            <div class="cg-preview-frame-host" id="cg-preview-frame-host"></div>
                            <div id="cg-preview-legend-host" style="display:none;"></div>
                        </div>
                        <div class="cg-status-bar">
                            <span id="cg-status-text">Ready</span>
                            <span id="cg-meta-text" style="opacity:0.75;"></span>
                        </div>
                    </div>
                </div>

                <div class="cg-modal-footer">
                    <span style="font-size:11.5px; opacity:0.75;">
                        Inserted frames remain live on the canvas: click the frame to type or edit prose directly.
                    </span>
                    <div style="display:flex; gap:8px;">
                        <button type="button" class="cg-btn-secondary" id="cg-cancel-btn">Cancel</button>
                        <button type="button" class="cg-btn-primary" id="cg-insert-btn"><i class="fas fa-plus"></i> Insert Cipher Frame</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        const modalBox = overlay.querySelector('#cg-modal-box');
        const modalHeader = overlay.querySelector('#cg-modal-header');
        const teardownMainDrag = makeModalDraggable(modalBox, modalHeader);
        const selectCtrl = enhanceSelectControls(overlay);

        const renderPreviewOnly = () => {
            const isAnswer = modalState.previewMode === 'answer';
            const frameHost = overlay.querySelector('#cg-preview-frame-host');
            const legendHost = overlay.querySelector('#cg-preview-legend-host');
            if (frameHost) {
                frameHost.style.background = modalState.bgColor;
                frameHost.style.border = `1.5px solid ${modalState.borderColor}`;
                frameHost.innerHTML = renderCipherTokensHtml(modalState.prose, modalState, { isAnswer });
            }
            if (legendHost) {
                if (isAnswer) {
                    legendHost.style.display = 'block';
                    legendHost.innerHTML = buildAnswerLegendHtml(modalState);
                } else {
                    legendHost.style.display = 'none';
                    legendHost.innerHTML = '';
                }
            }

            const statusEl = overlay.querySelector('#cg-status-text');
            const metaEl = overlay.querySelector('#cg-meta-text');
            const lettersOnly = modalState.prose.toUpperCase().replace(/[^A-Z]/g, '');
            const uniqueCount = new Set(lettersOnly.split('')).size;
            if (statusEl) {
                const modeLabel = (CIPHER_MODES[modalState.mode] && CIPHER_MODES[modalState.mode].label) || modalState.mode;
                const hintsText = modalState.hintLetters.length > 0 ? modalState.hintLetters.join(', ') : 'None';
                statusEl.textContent = `${modeLabel} - Hints: ${hintsText}`;
            }
            if (metaEl) {
                metaEl.textContent = `${lettersOnly.length} letters (${uniqueCount}/26 unique)`;
            }
        };

        const syncControlsToState = () => {
            modalState.title = overlay.querySelector('#cg-title').value;
            modalState.prose = overlay.querySelector('#cg-prose').value;
            modalState.mode = overlay.querySelector('#cg-cipher-mode').value;
            modalState.hintCount = parseInt(overlay.querySelector('#cg-hint-count').value, 10) || 0;
            modalState.symbolSize = parseInt(overlay.querySelector('#cg-symbol-size').value, 10) || 22;
            modalState.fontFamily = overlay.querySelector('#cg-font-family').value;
            modalState.accentColor = overlay.querySelector('#cg-accent-color').value;
            modalState.symbolColor = overlay.querySelector('#cg-symbol-color').value;
            modalState.lineColor = overlay.querySelector('#cg-line-color').value;
            modalState.textColor = overlay.querySelector('#cg-text-color').value;
            modalState.bgColor = overlay.querySelector('#cg-bg-color').value;
            modalState.borderColor = overlay.querySelector('#cg-border-color').value;
            modalState.showBlankLines = overlay.querySelector('#cg-blank-lines').checked;
            modalState.answerKeyOnPage2 = overlay.querySelector('#cg-answer-page2').checked;
            modalState.hintLetters = selectStarterHints(modalState.prose, modalState.hintCount, modalState.seed);
        };

        overlay.querySelector('#cg-prose').addEventListener('input', () => {
            syncControlsToState();
            renderPreviewOnly();
        });
        overlay.querySelector('#cg-title').addEventListener('input', syncControlsToState);
        ['#cg-cipher-mode', '#cg-hint-count', '#cg-symbol-size', '#cg-font-family', '#cg-blank-lines', '#cg-answer-page2'].forEach(sel => {
            overlay.querySelector(sel).addEventListener('change', () => {
                syncControlsToState();
                renderPreviewOnly();
            });
        });

        overlay.querySelectorAll('[data-color-preset]').forEach(btn => {
            btn.addEventListener('click', () => {
                const p = COLOR_PRESETS[btn.dataset.colorPreset];
                if (!p) return;
                const pairs = [
                    ['cg-accent-color', p.accent],
                    ['cg-symbol-color', p.symbol],
                    ['cg-line-color', p.line],
                    ['cg-text-color', p.text],
                    ['cg-bg-color', p.bg],
                    ['cg-border-color', p.border]
                ];
                pairs.forEach(([id, val]) => {
                    const inp = overlay.querySelector('#' + id);
                    const sw = overlay.querySelector(`[data-swatch-for="${id}"]`);
                    if (inp) inp.value = val;
                    if (sw) sw.style.background = val;
                });
                syncControlsToState();
                renderPreviewOnly();
            });
        });

        overlay.querySelectorAll('.cg-color-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                selectCtrl.closeAll();
                const targetId = chip.dataset.colorTarget;
                const hiddenInput = overlay.querySelector('#' + targetId);
                const swatchEl = overlay.querySelector(`[data-swatch-for="${targetId}"]`);
                const initColor = hiddenInput ? hiddenInput.value : '#007670';

                const applyVal = (hex) => {
                    const clean = normalizeHexColor(hex, initColor);
                    if (hiddenInput) hiddenInput.value = clean;
                    if (swatchEl) swatchEl.style.background = clean;
                    syncControlsToState();
                    renderPreviewOnly();
                };

                if (window.CustomColorPicker && typeof window.CustomColorPicker.open === 'function') {
                    window.CustomColorPicker.open(chip, initColor, applyVal);
                } else {
                    const nativeInp = document.createElement('input');
                    nativeInp.type = 'color';
                    nativeInp.value = initColor;
                    nativeInp.addEventListener('input', () => applyVal(nativeInp.value));
                    nativeInp.click();
                }
            });
        });

        const ptabPuzzle = overlay.querySelector('#cg-ptab-puzzle');
        const ptabAnswer = overlay.querySelector('#cg-ptab-answer');
        ptabPuzzle.addEventListener('click', () => {
            modalState.previewMode = 'puzzle';
            ptabPuzzle.classList.add('active');
            ptabAnswer.classList.remove('active');
            renderPreviewOnly();
        });
        ptabAnswer.addEventListener('click', () => {
            modalState.previewMode = 'answer';
            ptabAnswer.classList.add('active');
            ptabPuzzle.classList.remove('active');
            renderPreviewOnly();
        });

        overlay.querySelector('#cg-shuffle-key-btn').addEventListener('click', () => {
            modalState.seed = (modalState.seed + 7919) >>> 0;
            modalState.cipherMap = generateSubstitutionKey(modalState.seed);
            syncControlsToState();
            renderPreviewOnly();
        });

        overlay.querySelector('#cg-help-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            selectCtrl.closeAll();
            openHelpModal(overlay);
        });

        let onKeyDown = null;
        const closeModal = () => {
            teardownMainDrag();
            selectCtrl.destroy();
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen && typeof window.CustomColorPicker.close === 'function') {
                window.CustomColorPicker.close();
            }
            if (onKeyDown) document.removeEventListener('keydown', onKeyDown);
            const openHelp = document.getElementById('op-cryptogram-help-modal');
            if (openHelp) openHelp.remove();
            overlay.remove();
        };
        onKeyDown = (e) => {
            if (e.key !== 'Escape') return;
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen && typeof window.CustomColorPicker.close === 'function') {
                window.CustomColorPicker.close();
                return;
            }
            const openHelp = document.getElementById('op-cryptogram-help-modal');
            if (openHelp) openHelp.remove();
            else closeModal();
        };
        document.addEventListener('keydown', onKeyDown);

        overlay.querySelector('#cg-close-x').addEventListener('click', closeModal);
        overlay.querySelector('#cg-cancel-btn').addEventListener('click', closeModal);
        overlay.addEventListener('mousedown', (e) => {
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen) return;
            if (e.target === overlay) closeModal();
        });
        overlay.querySelector('#cg-insert-btn').addEventListener('click', () => {
            syncControlsToState();
            const cfgCopy = Object.assign({}, modalState);
            closeModal();
            insertCryptogramIntoDocument(cfgCopy);
        });

        renderPreviewOnly();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', installCanvasCryptogramHandlers);
    } else {
        installCanvasCryptogramHandlers();
    }

    window.CryptogramStudio = {
        showModal,
        generateSubstitutionKey,
        selectStarterHints,
        buildPigpenSvg,
        buildBrailleSvg,
        buildMorseSvg,
        renderCipherTokensHtml,
        buildAnswerLegendHtml,
        syncLinkedCryptogramAnswerKey
    };
})(window);
