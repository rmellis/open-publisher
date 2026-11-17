// Open Publisher Codebreaker (Cipher Grid) Generator (v5.22.3)
// Builds intersecting crossword-style grids without clues where letters A-Z are replaced
// with numbers 1-26, plus an A-to-Z & 1-to-26 bottom tracking table, configurable
// starter letters (difficulty), custom styling/colors, XP-style Help, and Page 2 Answer Key.

(function(window) {
    'use strict';

    const DEFAULT_CODEBREAKER_WORDS = [
        'JAZZ', 'QUARTZ', 'SPHINX', 'WIZARD', 'GLYPH', 'VEXING',
        'COBALT', 'FROZEN', 'PUMPKIN', 'KNIGHT', 'VELVET', 'OXYGEN',
        'MYSTIC', 'ANCHOR', 'BREEZE', 'FLIGHT', 'CIPHER', 'JOURNAL',
        'DYNAMO', 'TROPHY', 'EMBARK', 'WICKED'
    ].join('\n');

    const COLOR_PRESETS = {
        teal: { label: 'Classic Teal', accent: '#007670', letter: '#0f172a', cellBg: '#ffffff', border: '#334155', number: '#007670', block: '#0f172a' },
        newspaper: { label: 'Classic Print', accent: '#111827', letter: '#111827', cellBg: '#ffffff', border: '#111827', number: '#374151', block: '#111827' },
        ocean: { label: 'Ocean Blue', accent: '#0369a1', letter: '#0c4a6e', cellBg: '#f0f9ff', border: '#0284c7', number: '#0369a1', block: '#0c4a6e' },
        berry: { label: 'Warm Berry', accent: '#be123c', letter: '#4c0519', cellBg: '#fff1f2', border: '#e11d48', number: '#be123c', block: '#881337' },
        forest: { label: 'Forest Mint', accent: '#15803d', letter: '#14532d', cellBg: '#f0fdf4', border: '#16a34a', number: '#15803d', block: '#14532d' },
        chalkboard: { label: 'Chalkboard', accent: '#0d9488', letter: '#f8fafc', cellBg: '#1e293b', border: '#64748b', number: '#5eead4', block: '#0f172a' }
    };

    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

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

    function hexToRgba(hex, alpha) {
        const norm = normalizeHexColor(hex, '#007670');
        const r = parseInt(norm.slice(1, 3), 16);
        const g = parseInt(norm.slice(3, 5), 16);
        const b = parseInt(norm.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function contrastTextForBg(hex) {
        const norm = normalizeHexColor(hex, '#007670');
        const r = parseInt(norm.slice(1, 3), 16);
        const g = parseInt(norm.slice(3, 5), 16);
        const b = parseInt(norm.slice(5, 7), 16);
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return lum > 0.65 ? '#0f172a' : '#ffffff';
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

    function parseWordList(rawText) {
        const tokens = String(rawText || '').split(/[\r\n,;\t ]+/);
        const seen = new Set();
        const words = [];
        for (let i = 0; i < tokens.length; i++) {
            const cleaned = tokens[i].toUpperCase().replace(/[^A-Z]/g, '');
            if (cleaned.length >= 2 && !seen.has(cleaned)) {
                seen.add(cleaned);
                words.push(cleaned);
            }
        }
        return words;
    }

    function cellKey(r, c) {
        return r + ',' + c;
    }

    function evaluatePlacement(word, r, c, dir, occ, requireIntersection) {
        const dr = (dir === 'down') ? 1 : 0;
        const dc = (dir === 'across') ? 1 : 0;
        const len = word.length;

        const prevKey = cellKey(r - dr, c - dc);
        const nextKey = cellKey(r + dr * len, c + dc * len);
        if (occ.has(prevKey) || occ.has(nextKey)) {
            return { valid: false, intersections: 0 };
        }

        let intersections = 0;
        for (let i = 0; i < len; i++) {
            const cr = r + dr * i;
            const cc = c + dc * i;
            const ch = word[i];
            const k = cellKey(cr, cc);
            const existing = occ.get(k);

            if (existing) {
                if (existing.ch !== ch) return { valid: false, intersections: 0 };
                if (dir === 'across' && existing.across) return { valid: false, intersections: 0 };
                if (dir === 'down' && existing.down) return { valid: false, intersections: 0 };
                intersections++;
            } else {
                const sideA = occ.get(cellKey(cr - dc, cc - dr));
                const sideB = occ.get(cellKey(cr + dc, cc + dr));
                if (sideA || sideB) return { valid: false, intersections: 0 };
            }
        }

        if (requireIntersection && occ.size > 0 && intersections === 0) {
            return { valid: false, intersections: 0 };
        }
        return { valid: true, intersections };
    }

    function placeWordIntoOcc(word, r, c, dir, occ) {
        const dr = (dir === 'down') ? 1 : 0;
        const dc = (dir === 'across') ? 1 : 0;
        for (let i = 0; i < word.length; i++) {
            const cr = r + dr * i;
            const cc = c + dc * i;
            const k = cellKey(cr, cc);
            const cur = occ.get(k) || { ch: word[i], across: false, down: false };
            cur.ch = word[i];
            if (dir === 'across') cur.across = true;
            else cur.down = true;
            occ.set(k, cur);
        }
    }

    function computeBounds(occ) {
        if (!occ || occ.size === 0) {
            return { minR: 0, maxR: 0, minC: 0, maxC: 0, rows: 1, cols: 1 };
        }
        let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
        occ.forEach((_, key) => {
            const parts = key.split(',');
            const r = parseInt(parts[0], 10);
            const c = parseInt(parts[1], 10);
            if (r < minR) minR = r;
            if (r > maxR) maxR = r;
            if (c < minC) minC = c;
            if (c > maxC) maxC = c;
        });
        return {
            minR, maxR, minC, maxC,
            rows: maxR - minR + 1,
            cols: maxC - minC + 1
        };
    }

    function countUniqueLetters(placedWords) {
        const set = new Set();
        for (let i = 0; i < placedWords.length; i++) {
            const w = placedWords[i].word;
            for (let j = 0; j < w.length; j++) set.add(w[j]);
        }
        return set.size;
    }

    function tryPlaceWordBest(word, occ, letterIndex, rng, curBounds) {
        let bestMove = null;
        let bestScore = -Infinity;
        const candidateAnchors = [];

        for (let i = 0; i < word.length; i++) {
            const spots = letterIndex.get(word[i]);
            if (!spots) continue;
            for (let j = 0; j < spots.length; j++) {
                const sp = spots[j];
                if (!sp.across) {
                    candidateAnchors.push({ r: sp.r, c: sp.c - i, dir: 'across' });
                }
                if (!sp.down) {
                    candidateAnchors.push({ r: sp.r - i, c: sp.c, dir: 'down' });
                }
            }
        }

        const seenCand = new Set();
        for (let k = 0; k < candidateAnchors.length; k++) {
            const cand = candidateAnchors[k];
            const ck = cand.dir + ':' + cand.r + ',' + cand.c;
            if (seenCand.has(ck)) continue;
            seenCand.add(ck);

            const evalRes = evaluatePlacement(word, cand.r, cand.c, cand.dir, occ, true);
            if (!evalRes.valid) continue;

            const dr = (cand.dir === 'down') ? 1 : 0;
            const dc = (cand.dir === 'across') ? 1 : 0;
            const endR = cand.r + dr * (word.length - 1);
            const endC = cand.c + dc * (word.length - 1);
            const nMinR = Math.min(curBounds.minR, cand.r, endR);
            const nMaxR = Math.max(curBounds.maxR, cand.r, endR);
            const nMinC = Math.min(curBounds.minC, cand.c, endC);
            const nMaxC = Math.max(curBounds.maxC, cand.c, endC);
            const nRows = nMaxR - nMinR + 1;
            const nCols = nMaxC - nMinC + 1;
            const newArea = nRows * nCols;
            const aspectPenalty = Math.abs(nRows - nCols) * 6;
            const maxDimPenalty = Math.max(nRows, nCols) * 3;
            const score = (evalRes.intersections * 150) - newArea - aspectPenalty - maxDimPenalty + (rng() * 0.6);

            if (score > bestScore) {
                bestScore = score;
                bestMove = { r: cand.r, c: cand.c, dir: cand.dir, intersections: evalRes.intersections };
            }
        }
        return bestMove;
    }

    function solveSingleSeed(wordsList, seed) {
        const rng = makeRng(seed);
        const ordered = wordsList.slice().sort((a, b) => {
            const diff = b.length - a.length;
            if (diff !== 0) return diff;
            return rng() - 0.5;
        });

        const topLen = Math.min(4, ordered.length);
        for (let i = topLen - 1; i > 0; i--) {
            if (rng() < 0.45) {
                const swapIdx = Math.floor(rng() * (i + 1));
                const tmp = ordered[i];
                ordered[i] = ordered[swapIdx];
                ordered[swapIdx] = tmp;
            }
        }

        const occ = new Map();
        const letterIndex = new Map();
        const placed = [];
        let pending = [];

        const indexPlacedWord = (w, r, c, dir) => {
            const dr = (dir === 'down') ? 1 : 0;
            const dc = (dir === 'across') ? 1 : 0;
            for (let i = 0; i < w.length; i++) {
                const cr = r + dr * i;
                const cc = c + dc * i;
                const ch = w[i];
                if (!letterIndex.has(ch)) letterIndex.set(ch, []);
                letterIndex.get(ch).push({
                    r: cr,
                    c: cc,
                    across: dir === 'across',
                    down: dir === 'down'
                });
            }
        };

        for (let idx = 0; idx < ordered.length; idx++) {
            const word = ordered[idx];
            if (placed.length === 0) {
                const startDir = rng() < 0.52 ? 'across' : 'down';
                placeWordIntoOcc(word, 0, 0, startDir, occ);
                indexPlacedWord(word, 0, 0, startDir);
                placed.push({ word, r: 0, c: 0, dir: startDir });
                continue;
            }

            const curBounds = computeBounds(occ);
            const bestMove = tryPlaceWordBest(word, occ, letterIndex, rng, curBounds);
            if (bestMove) {
                placeWordIntoOcc(word, bestMove.r, bestMove.c, bestMove.dir, occ);
                indexPlacedWord(word, bestMove.r, bestMove.c, bestMove.dir);
                placed.push({ word, r: bestMove.r, c: bestMove.c, dir: bestMove.dir });
            } else {
                pending.push(word);
            }
        }

        // Second & third pass so skipped words can attach onto later-placed words
        for (let pass = 0; pass < 2 && pending.length > 0; pass++) {
            const nextPending = [];
            let placedAny = false;
            for (let i = 0; i < pending.length; i++) {
                const word = pending[i];
                const curBounds = computeBounds(occ);
                const bestMove = tryPlaceWordBest(word, occ, letterIndex, rng, curBounds);
                if (bestMove) {
                    placeWordIntoOcc(word, bestMove.r, bestMove.c, bestMove.dir, occ);
                    indexPlacedWord(word, bestMove.r, bestMove.c, bestMove.dir);
                    placed.push({ word, r: bestMove.r, c: bestMove.c, dir: bestMove.dir });
                    placedAny = true;
                } else {
                    nextPending.push(word);
                }
            }
            pending = nextPending;
            if (!placedAny) break;
        }

        // Detached fallback placement only if strictly needed so words still appear neatly
        const skipped = [];
        for (let i = 0; i < pending.length; i++) {
            const word = pending[i];
            const b = computeBounds(occ);
            const fallbackDir = 'across';
            const fallbackR = b.maxR + 2;
            const fallbackC = b.minC;
            const chk = evaluatePlacement(word, fallbackR, fallbackC, fallbackDir, occ, false);
            if (chk.valid) {
                placeWordIntoOcc(word, fallbackR, fallbackC, fallbackDir, occ);
                placed.push({ word, r: fallbackR, c: fallbackC, dir: fallbackDir });
            } else {
                skipped.push(word);
            }
        }

        let totalIntersections = 0;
        occ.forEach((cell) => {
            if (cell.across && cell.down) totalIntersections++;
        });
        const bounds = computeBounds(occ);
        const area = bounds.rows * bounds.cols;
        const aspectDiff = Math.abs(bounds.rows - bounds.cols);
        const uniqueLetters = countUniqueLetters(placed);
        const overallScore = (placed.length * 10000) + (uniqueLetters * 450) + (totalIntersections * 380) - (area * 6) - (aspectDiff * 40);

        return {
            seed,
            placedWords: placed,
            skippedWords: skipped,
            bounds,
            area,
            intersections: totalIntersections,
            uniqueLetters,
            overallScore
        };
    }

    function normalizeLayout(rawSol) {
        const minR = rawSol.bounds.minR;
        const minC = rawSol.bounds.minC;
        const rows = rawSol.bounds.rows;
        const cols = rawSol.bounds.cols;

        const grid = Array.from({ length: rows }, () => Array(cols).fill(''));
        const normalizedWords = rawSol.placedWords.map((w) => {
            const nr = w.r - minR;
            const nc = w.c - minC;
            const dr = (w.dir === 'down') ? 1 : 0;
            const dc = (w.dir === 'across') ? 1 : 0;
            for (let i = 0; i < w.word.length; i++) {
                grid[nr + dr * i][nc + dc * i] = w.word[i];
            }
            return { word: w.word, r: nr, c: nc, dir: w.dir };
        });

        let intersections = 0;
        const freq = {};
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const ch = grid[r][c];
                if (!ch) continue;
                freq[ch] = (freq[ch] || 0) + 1;
                const hasAcross = (c > 0 && !!grid[r][c - 1]) || (c + 1 < cols && !!grid[r][c + 1]);
                const hasDown = (r > 0 && !!grid[r - 1][c]) || (r + 1 < rows && !!grid[r + 1][c]);
                if (hasAcross && hasDown) intersections++;
            }
        }

        return {
            rows,
            cols,
            grid,
            placedWords: normalizedWords,
            skippedWords: rawSol.skippedWords || [],
            intersections,
            uniqueLetters: Object.keys(freq).length,
            letterFrequency: freq,
            seed: rawSol.seed,
            area: rows * cols
        };
    }

    function generateCodebreakerLayout(wordsList, opts) {
        const options = opts || {};
        const seedCount = Math.max(1, Math.min(48, parseInt(options.seedCount, 10) || 16));
        const baseSeed = (options.baseSeed != null) ? (options.baseSeed >>> 0) : (Date.now() >>> 0);

        if (!wordsList || wordsList.length === 0) {
            return {
                rows: 5,
                cols: 5,
                grid: Array.from({ length: 5 }, () => Array(5).fill('')),
                placedWords: [],
                skippedWords: [],
                intersections: 0,
                uniqueLetters: 0,
                letterFrequency: {},
                seed: baseSeed,
                area: 25
            };
        }

        let best = null;
        for (let i = 0; i < seedCount; i++) {
            const candidate = solveSingleSeed(wordsList, baseSeed + (i * 101));
            if (!best || candidate.overallScore > best.overallScore) {
                best = candidate;
            }
        }
        return normalizeLayout(best);
    }

    function generateCipherMapping(layout, cipherSeed, starterCount) {
        const rng = makeRng(cipherSeed || 1337);
        const numbers = [];
        for (let i = 1; i <= 26; i++) numbers.push(i);
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            const tmp = numbers[i];
            numbers[i] = numbers[j];
            numbers[j] = tmp;
        }

        const letterToNumber = {};
        const numberToLetter = {};
        for (let i = 0; i < 26; i++) {
            const ch = ALPHABET[i];
            const num = numbers[i];
            letterToNumber[ch] = num;
            numberToLetter[num] = ch;
        }

        const freq = (layout && layout.letterFrequency) ? layout.letterFrequency : {};
        const activeLetters = Object.keys(freq);
        const wantStarters = Math.max(0, Math.min(8, parseInt(starterCount, 10) || 0));

        // Prefer letters that appear at least twice so each starter meaningfully reveals puzzle cells
        const ranked = activeLetters.slice().sort((a, b) => {
            const fa = freq[a] || 0;
            const fb = freq[b] || 0;
            const multiA = fa >= 2 ? 0 : 1;
            const multiB = fb >= 2 ? 0 : 1;
            if (multiA !== multiB) return multiA - multiB;
            return rng() - 0.5;
        });

        const starterLetters = [];
        const starterSet = new Set();
        for (let i = 0; i < ranked.length && starterLetters.length < wantStarters; i++) {
            starterLetters.push(ranked[i]);
            starterSet.add(ranked[i]);
        }

        return {
            cipherSeed: cipherSeed || 1337,
            letterToNumber,
            numberToLetter,
            starterLetters,
            starterSet,
            activeSet: new Set(activeLetters)
        };
    }

    function buildCodebreakerGridSvg(layout, cipher, cfg, options) {
        const opts = options || {};
        const isAnswer = !!opts.isAnswer;
        const styleMode = cfg.styleMode || 'crossword';
        const fontFamily = cfg.fontFamily || 'Segoe UI, Arial, sans-serif';
        const accentColor = normalizeHexColor(cfg.accentColor, '#007670');
        const letterColor = normalizeHexColor(cfg.letterColor, '#0f172a');
        const cellBgColor = normalizeHexColor(cfg.cellBgColor, '#ffffff');
        const borderColor = normalizeHexColor(cfg.borderColor, '#334155');
        const numberColor = normalizeHexColor(cfg.numberColor, '#007670');
        const blockColor = normalizeHexColor(cfg.blockColor, '#0f172a');

        const rows = Math.max(1, layout.rows || 1);
        const cols = Math.max(1, layout.cols || 1);
        const cellSize = 36;
        const pad = 10;
        const gridW = cols * cellSize;
        const gridH = rows * cellSize;
        const svgW = gridW + pad * 2;
        const svgH = gridH + pad * 2;

        const bgParts = [];
        const activeCellParts = [];
        const numberParts = [];
        const letterParts = [];

        if (styleMode === 'crossword') {
            bgParts.push(`<rect x="${pad}" y="${pad}" width="${gridW}" height="${gridH}" fill="${escapeXml(blockColor)}" stroke="${escapeXml(blockColor)}" stroke-width="2" rx="2"/>`);
        }

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const ch = layout.grid[r] && layout.grid[r][c];
                if (!ch) continue;
                const x = pad + c * cellSize;
                const y = pad + r * cellSize;
                const num = cipher.letterToNumber[ch] || 1;
                const isStarter = cipher.starterSet.has(ch);

                activeCellParts.push(
                    `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${escapeXml(cellBgColor)}" stroke="${escapeXml(borderColor)}" stroke-width="1.35"/>`
                );
                if (!isAnswer && isStarter) {
                    activeCellParts.push(
                        `<rect x="${x + 0.7}" y="${y + 0.7}" width="${cellSize - 1.4}" height="${cellSize - 1.4}" fill="${escapeXml(hexToRgba(accentColor, 0.14))}"/>`
                    );
                }

                numberParts.push(
                    `<text x="${x + 3.5}" y="${y + 10.5}" fill="${escapeXml(numberColor)}" font-family="${escapeXml(fontFamily)}" font-size="9.5" font-weight="700" text-anchor="start">${num}</text>`
                );

                if (isAnswer || isStarter) {
                    const starterReveal = contrastTextForBg(accentColor) === '#ffffff' ? accentColor : letterColor;
                    const revealFill = isStarter ? starterReveal : letterColor;
                    letterParts.push(
                        `<text x="${x + cellSize / 2}" y="${y + cellSize / 2 + 4.5}" fill="${escapeXml(revealFill)}" font-family="${escapeXml(fontFamily)}" font-size="${Math.round(cellSize * 0.46)}" font-weight="800" text-anchor="middle" dominant-baseline="central">${escapeXml(ch)}</text>`
                    );
                }
            }
        }

        return [
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;overflow:visible;">`,
            `<g class="cb-grid-bg">${bgParts.join('')}</g>`,
            `<g class="cb-active-cells">${activeCellParts.join('')}</g>`,
            `<g class="cb-cipher-numbers">${numberParts.join('')}</g>`,
            `<g class="cb-letters">${letterParts.join('')}</g>`,
            `</svg>`
        ].join('');
    }

    function buildCodebreakerTrackerSvg(layout, cipher, cfg, options) {
        const opts = options || {};
        const isAnswer = !!opts.isAnswer;
        const fontFamily = cfg.fontFamily || 'Segoe UI, Arial, sans-serif';
        const accentColor = normalizeHexColor(cfg.accentColor, '#007670');
        const letterColor = normalizeHexColor(cfg.letterColor, '#0f172a');
        const cellBgColor = normalizeHexColor(cfg.cellBgColor, '#ffffff');
        const borderColor = normalizeHexColor(cfg.borderColor, '#334155');
        const numberColor = normalizeHexColor(cfg.numberColor, '#007670');

        const svgW = 680;
        const padX = 10;
        const cols = 13;
        const cellW = Math.floor((svgW - padX * 2) / cols); // 50px
        const gridStartX = Math.round((svgW - cellW * cols) / 2);

        const numHdrH = 18;
        const letterBoxH = 26;
        const rowH = numHdrH + letterBoxH;
        const rowGap = 6;

        const titleY = 16;
        const row1Y = 24;
        const row2Y = row1Y + rowH + rowGap;

        const parts = [];
        parts.push(`<rect x="1" y="1" width="${svgW - 2}" height="186" rx="6" fill="${escapeXml(cellBgColor)}" stroke="${escapeXml(borderColor)}" stroke-width="1.35"/>`);
        parts.push(`<text x="${gridStartX}" y="${titleY}" fill="${escapeXml(accentColor)}" font-family="${escapeXml(fontFamily)}" font-size="11" font-weight="800" letter-spacing="0.6">${isAnswer ? 'DECODED CIPHER KEY (1 - 26)' : 'CODE KEY &amp; LETTER TRACKER (1 - 26)'}</text>`);

        const starterText = cipher.starterLetters.length > 0
            ? 'Starters: ' + cipher.starterLetters.join(', ')
            : 'No starters (Expert)';
        parts.push(`<text x="${gridStartX + cellW * cols}" y="${titleY}" fill="${escapeXml(numberColor)}" font-family="${escapeXml(fontFamily)}" font-size="10.5" font-weight="700" text-anchor="end">${escapeXml(isAnswer ? 'Full Solution Key' : starterText)}</text>`);

        // Two rows of 13 cells: 1-13 and 14-26
        for (let n = 1; n <= 26; n++) {
            const rIdx = n <= 13 ? 0 : 1;
            const cIdx = (n - 1) % 13;
            const x = gridStartX + cIdx * cellW;
            const y = rIdx === 0 ? row1Y : row2Y;
            const ch = cipher.numberToLetter[n] || '';
            const isStarter = cipher.starterSet.has(ch);
            const isUsedInGrid = cipher.activeSet.has(ch);
            const showLetter = isAnswer || isStarter;

            // Top number header bar
            const hdrFill = isStarter ? accentColor : hexToRgba(accentColor, 0.14);
            const hdrTextColor = isStarter ? contrastTextForBg(accentColor) : numberColor;
            parts.push(`<rect x="${x}" y="${y}" width="${cellW}" height="${numHdrH}" fill="${escapeXml(hdrFill)}" stroke="${escapeXml(borderColor)}" stroke-width="1"/>`);
            parts.push(`<text x="${x + cellW / 2}" y="${y + numHdrH / 2 + 0.5}" fill="${escapeXml(hdrTextColor)}" font-family="${escapeXml(fontFamily)}" font-size="10.5" font-weight="800" text-anchor="middle" dominant-baseline="central">${n}</text>`);

            // Lower write-in / revealed letter cell
            const boxFill = showLetter && isStarter
                ? hexToRgba(accentColor, 0.10)
                : (!isUsedInGrid && !showLetter ? hexToRgba(borderColor, 0.06) : cellBgColor);
            parts.push(`<rect x="${x}" y="${y + numHdrH}" width="${cellW}" height="${letterBoxH}" fill="${escapeXml(boxFill)}" stroke="${escapeXml(borderColor)}" stroke-width="1"/>`);

            if (showLetter) {
                const lColor = isStarter && contrastTextForBg(accentColor) === '#ffffff' ? accentColor : letterColor;
                parts.push(`<text x="${x + cellW / 2}" y="${y + numHdrH + letterBoxH / 2 + 0.5}" fill="${escapeXml(lColor)}" font-family="${escapeXml(fontFamily)}" font-size="14" font-weight="800" text-anchor="middle" dominant-baseline="central">${escapeXml(ch)}</text>`);
            }
        }

        // Bottom A-to-Z Alphabet Checklist Bar (26 columns)
        const azLabelY = row2Y + rowH + 17;
        const azBarY = azLabelY + 6;
        const azBarH = 26;
        const totalTableW = cellW * cols; // 650px
        const azCellW = totalTableW / 26; // 25px exact!

        parts.push(`<text x="${gridStartX}" y="${azLabelY}" fill="${escapeXml(contrastTextForBg(accentColor) === '#ffffff' ? accentColor : letterColor)}" font-family="${escapeXml(fontFamily)}" font-size="10" font-weight="800" letter-spacing="0.5">A - Z ALPHABET TRACKER (CROSS OFF USED LETTERS)</text>`);

        for (let i = 0; i < 26; i++) {
            const ch = ALPHABET[i];
            const x = gridStartX + i * azCellW;
            const isStarter = cipher.starterSet.has(ch);
            const isUsedInGrid = cipher.activeSet.has(ch);
            const marked = isStarter || (isAnswer && isUsedInGrid);

            const azBg = marked ? accentColor : cellBgColor;
            const azTxt = marked ? contrastTextForBg(accentColor) : (isUsedInGrid ? letterColor : hexToRgba(letterColor, 0.38));

            parts.push(`<rect x="${x.toFixed(2)}" y="${azBarY}" width="${azCellW.toFixed(2)}" height="${azBarH}" fill="${escapeXml(azBg)}" stroke="${escapeXml(borderColor)}" stroke-width="0.95"/>`);
            parts.push(`<text x="${(x + azCellW / 2).toFixed(2)}" y="${azBarY + azBarH / 2 + 0.5}" fill="${escapeXml(azTxt)}" font-family="${escapeXml(fontFamily)}" font-size="12" font-weight="800" text-anchor="middle" dominant-baseline="central">${ch}</text>`);
            if (isStarter && !isAnswer) {
                parts.push(`<line x1="${(x + 4).toFixed(2)}" y1="${azBarY + azBarH - 4}" x2="${(x + azCellW - 4).toFixed(2)}" y2="${azBarY + azBarH - 4}" stroke="${escapeXml(azTxt)}" stroke-width="1.5" stroke-linecap="round"/>`);
            }
        }

        const svgH = 188;
        return [
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;">`,
            parts.join(''),
            `</svg>`
        ].join('');
    }

    // Shared drag helper for movable modal windows
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

    // Styled app dropdown mirroring WordSearchStudio & CrosswordStudio
    function enhanceSelectControls(rootEl) {
        const selects = rootEl.querySelectorAll('select.cb-select');
        const controllers = [];

        const closeAllMenus = (exceptMenu) => {
            document.querySelectorAll('.cb-select-menu.open').forEach(menu => {
                if (menu !== exceptMenu) menu.classList.remove('open');
            });
            rootEl.querySelectorAll('.cb-modern-select.open').forEach(btn => {
                if (!exceptMenu || btn._cbMenu !== exceptMenu) btn.classList.remove('open');
            });
        };

        selects.forEach(sel => {
            sel.style.display = 'none';
            const wrapper = document.createElement('div');
            wrapper.className = 'cb-select-wrap';
            sel.parentNode.insertBefore(wrapper, sel);
            wrapper.appendChild(sel);

            const trigger = document.createElement('div');
            trigger.className = 'modern-select cb-modern-select';
            trigger.setAttribute('tabindex', '0');
            trigger.setAttribute('role', 'combobox');
            trigger.setAttribute('aria-expanded', 'false');

            const labelSpan = document.createElement('span');
            labelSpan.className = 'cb-select-label';
            const arrowBox = document.createElement('div');
            arrowBox.className = 'arrow-box';
            arrowBox.innerHTML = '<i class="fas fa-chevron-down" style="font-size:10px;"></i>';
            trigger.appendChild(labelSpan);
            trigger.appendChild(arrowBox);
            wrapper.appendChild(trigger);

            const menu = document.createElement('div');
            menu.className = 'cb-select-menu';
            if (sel.id === 'cb-font-family') menu.classList.add('cb-select-menu-fonts');
            document.body.appendChild(menu);
            trigger._cbMenu = menu;

            const syncLabelAndActive = () => {
                const selectedOpt = sel.options[sel.selectedIndex] || sel.options[0];
                labelSpan.textContent = selectedOpt ? selectedOpt.textContent : '';
                if (sel.id === 'cb-font-family' && selectedOpt) {
                    labelSpan.style.fontFamily = selectedOpt.value;
                } else {
                    labelSpan.style.fontFamily = '';
                }
                menu.querySelectorAll('.cb-select-option').forEach(optBtn => {
                    optBtn.classList.toggle('active', optBtn.dataset.value === sel.value);
                });
            };

            const rebuildOptions = () => {
                menu.innerHTML = '';
                Array.from(sel.options).forEach(opt => {
                    const item = document.createElement('div');
                    item.className = 'cb-select-option';
                    item.dataset.value = opt.value;
                    item.textContent = opt.textContent;
                    if (sel.id === 'cb-font-family') {
                        item.style.fontFamily = opt.value;
                    }
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
            if (!e.target.closest('.cb-select-wrap') && !e.target.closest('.cb-select-menu')) {
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
        const existingHelp = document.getElementById('op-codebreaker-help-modal');
        if (existingHelp) existingHelp.remove();

        const topics = [
            {
                id: 'overview',
                title: 'Overview & Quick Start',
                body: `
                    <p><strong>Codebreaker (Cipher Grid)</strong> creates clue-free substitution crossword puzzles where every letter <code>A-Z</code> is replaced by a secret cipher number from <code>1</code> to <code>26</code>.</p>
                    <ul>
                        <li><strong>Word Pool:</strong> Keep the rich pangram-ready default word list or paste your own custom word list (one per line, space, or comma separated).</li>
                        <li><strong>Cipher Numbers:</strong> Each unique letter receives a distinct number <code>1-26</code> across the entire puzzle and tracking table.</li>
                        <li><strong>Insert:</strong> Click <em>Insert Codebreaker</em> to add the Title, Cipher Grid, Bottom A-to-Z Tracking Table, and Page 2 Answer Key.</li>
                    </ul>
                `
            },
            {
                id: 'cipher',
                title: 'Cipher Numbers (1-26)',
                body: `
                    <p>Every matching number in the grid stands for the exact same letter of the alphabet.</p>
                    <ul>
                        <li><strong>Consistent Substitution:</strong> If square <code>14</code> stands for <code>E</code> in one word, every square labeled <code>14</code> across the entire grid is also <code>E</code>.</li>
                        <li><strong>Shuffle Cipher:</strong> Click <em>Shuffle Cipher</em> anytime to deal a brand-new <code>1-26</code> number assignment without changing the grid layout.</li>
                        <li><strong>New Layout Seed:</strong> Click <em>New Seed</em> to compute an alternate compact intersecting arrangement from multiple seeds.</li>
                    </ul>
                `
            },
            {
                id: 'starters',
                title: 'Starter Letters & Difficulty',
                body: `
                    <p>Control how easy or challenging your Codebreaker puzzle is using pre-filled starter letters.</p>
                    <ul>
                        <li><strong>Starter Letters Selector:</strong> Choose <strong>0 Starters (Expert)</strong>, <strong>2 Starters (Hard)</strong>, <strong>3 Starters (Normal)</strong>, <strong>4 Starters (Easy)</strong>, or <strong>5 Starters (Warmup)</strong>.</li>
                        <li><strong>Pre-Filled Reveals:</strong> Starter letters are pre-filled both inside their matching grid squares and inside the bottom <code>1-26</code> and <code>A-Z</code> tracking tables so players have a solid starting foothold.</li>
                    </ul>
                `
            },
            {
                id: 'tracker',
                title: 'A-to-Z Tracking Table',
                body: `
                    <p>Every puzzle automatically includes a printable decoding reference strip at the bottom of the page.</p>
                    <ul>
                        <li><strong>Code Key (1-26):</strong> Two compact rows covering numbers <code>1</code> through <code>26</code> so solvers can pencil in each decoded letter beside its number.</li>
                        <li><strong>A-Z Alphabet Tracker:</strong> A full <code>A-Z</code> checklist bar right beneath the code key so solvers can cross off letters already discovered (with starter letters already marked).</li>
                    </ul>
                `
            },
            {
                id: 'answer-key',
                title: 'Styles, Colors & Page 2 Answer Key',
                body: `
                    <p>Customize visual styling with presets or Open Publisher's Custom Color Picker, and auto-generate a ready-to-print solution page.</p>
                    <ul>
                        <li><strong>Grid Styles:</strong> Toggle between <strong>Classic Crossword Block</strong> (solid dark empty squares) and <strong>Criss-Cross Freeform</strong> (transparent background).</li>
                        <li><strong>Color Customization:</strong> Apply one-click presets or click <em>Accent</em>, <em>Letters</em>, <em>Cell Fill</em>, <em>Borders</em>, <em>Numbers</em>, or <em>Block</em> swatches.</li>
                        <li><strong>Answer Key on Page 2:</strong> Checked by default. Places the fully solved Cipher Grid and complete decoded <code>1-26</code> / <code>A-Z</code> solution table cleanly on Page 2.</li>
                    </ul>
                `
            }
        ];

        const helpOverlay = document.createElement('div');
        helpOverlay.id = 'op-codebreaker-help-modal';
        helpOverlay.className = 'cb-help-overlay';
        helpOverlay.innerHTML = `
            <style>
                .cb-help-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.14);
                    z-index: 1000030;
                    display: flex; align-items: center; justify-content: center;
                    padding: 16px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .cb-help-box {
                    width: 660px; max-width: 94vw; height: 470px; max-height: 86vh;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #1e293b);
                    border: 1px solid var(--ui-border, #94a3b8); border-radius: 8px;
                    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.28);
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .cb-help-header {
                    padding: 6px 8px 6px 14px;
                    background: linear-gradient(135deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #004a46));
                    color: #ffffff; display: flex; align-items: center; justify-content: space-between;
                    user-select: none; min-height: 44px; box-sizing: border-box;
                }
                .cb-help-toolbar {
                    display: flex; align-items: center; justify-content: space-between; gap: 8px;
                    padding: 6px 12px; background: var(--ui-surface-bg, #f1f4f6);
                    border-bottom: 1px solid var(--ui-border, #cbd5e1); font-size: 12px;
                }
                body.dark-mode .cb-help-toolbar { background: #1e293b; border-color: #334155; }
                .cb-help-nav-btns { display: flex; align-items: center; gap: 4px; }
                .cb-xp-tool-btn {
                    display: inline-flex; align-items: center; gap: 5px;
                    padding: 4px 10px; font-size: 11.5px; font-weight: 600;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-theme-dark, #004a46);
                    border: 1px solid var(--ui-border, #cbd5e1); border-radius: 4px; cursor: pointer;
                }
                body.dark-mode .cb-xp-tool-btn { background: #0f172a; color: #e2e8f0; border-color: #475569; }
                .cb-xp-tool-btn:hover:not(:disabled) { border-color: var(--ui-theme-color, #007670); background: rgba(0, 118, 112, 0.08); }
                .cb-xp-tool-btn:disabled { opacity: 0.45; cursor: default; }
                .cb-help-split {
                    flex: 1; display: grid; grid-template-columns: 205px 1fr; min-height: 0;
                }
                .cb-help-toc {
                    background: var(--ui-surface-bg, #f8fafc); border-right: 1px solid var(--ui-border, #cbd5e1);
                    padding: 10px 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 3px;
                }
                body.dark-mode .cb-help-toc { background: #0f172a; border-right-color: #334155; }
                .cb-help-toc-head {
                    font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
                    color: var(--ui-theme-color, #007670); padding: 2px 6px 6px;
                }
                .cb-help-topic-btn {
                    width: 100%; text-align: left; border: 1px solid transparent; background: transparent;
                    color: var(--ui-text, #1e293b); padding: 7px 9px; border-radius: 4px;
                    font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 7px;
                }
                .cb-help-topic-btn i { color: var(--ui-theme-color, #007670); font-size: 11px; }
                .cb-help-topic-btn:hover { background: rgba(0, 118, 112, 0.08); }
                .cb-help-topic-btn.active {
                    background: var(--ui-theme-color, #007670); color: #ffffff; font-weight: 700;
                }
                .cb-help-topic-btn.active i { color: #ffffff; }
                .cb-help-pane {
                    padding: 16px 20px; overflow-y: auto; font-size: 13px; line-height: 1.55;
                }
                .cb-help-pane h4 {
                    margin: 0 0 10px; font-size: 16px; color: var(--ui-theme-color, #007670);
                    border-bottom: 1px solid var(--ui-border, #e2e8f0); padding-bottom: 6px;
                }
                .cb-help-pane ul { margin: 8px 0 0; padding-left: 18px; }
                .cb-help-pane li { margin-bottom: 7px; }
                .cb-help-pane code {
                    padding: 1px 5px; border-radius: 3px; font-size: 11.5px;
                    background: rgba(0, 118, 112, 0.1); color: var(--ui-theme-dark, #004a46);
                }
                body.dark-mode .cb-help-pane code { background: rgba(45, 212, 191, 0.15); color: #5eead4; }
                .cb-help-footer {
                    padding: 9px 14px; border-top: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-surface-bg, #f8fafc); display: flex; justify-content: flex-end;
                }
                body.dark-mode .cb-help-footer { background: #1e293b; border-top-color: #334155; }
                .cb-help-ok {
                    padding: 6px 18px; border-radius: 5px; border: none; font-weight: 700; font-size: 12.5px;
                    background: var(--ui-theme-color, #007670); color: #ffffff; cursor: pointer;
                }
                .cb-help-ok:hover { background: var(--ui-theme-dark, #004a46); }
                @media (max-width: 560px) {
                    .cb-help-split { grid-template-columns: 1fr; }
                    .cb-help-toc { max-height: 130px; border-right: none; border-bottom: 1px solid var(--ui-border, #cbd5e1); }
                }
            </style>
            <div class="cb-help-box" id="cb-help-box" role="dialog" aria-modal="true" aria-labelledby="cb-help-title">
                <div class="cb-help-header" id="cb-help-header">
                    <span id="cb-help-title" style="display:flex; align-items:center; gap:8px; font-weight:700; font-size:13.5px;">
                        <i class="fas fa-book-open"></i> Codebreaker (Cipher Grid) Help
                    </span>
                    <button type="button" class="custom-dialog-close" id="cb-help-close-x" aria-label="Close Help">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="cb-help-toolbar">
                    <div class="cb-help-nav-btns">
                        <button type="button" class="cb-xp-tool-btn" id="cb-help-back-btn" disabled><i class="fas fa-arrow-left"></i> Back</button>
                        <button type="button" class="cb-xp-tool-btn" id="cb-help-fwd-btn" disabled>Forward <i class="fas fa-arrow-right"></i></button>
                    </div>
                    <span id="cb-help-breadcrumb" style="font-weight:600; opacity:0.8;">Overview &amp; Quick Start</span>
                </div>
                <div class="cb-help-split">
                    <div class="cb-help-toc">
                        <div class="cb-help-toc-head">Contents</div>
                        ${topics.map((t, i) => `
                            <button type="button" class="cb-help-topic-btn${i === 0 ? ' active' : ''}" data-topic-id="${t.id}">
                                <i class="fas fa-file-alt"></i><span>${escapeXml(t.title)}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="cb-help-pane" id="cb-help-content"></div>
                </div>
                <div class="cb-help-footer">
                    <button type="button" class="cb-help-ok" id="cb-help-ok-btn">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(helpOverlay);
        const helpBox = helpOverlay.querySelector('#cb-help-box');
        const helpHeader = helpOverlay.querySelector('#cb-help-header');
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
            helpOverlay.querySelectorAll('.cb-help-topic-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.topicId === topic.id);
            });
            helpOverlay.querySelector('#cb-help-breadcrumb').textContent = topic.title;
            helpOverlay.querySelector('#cb-help-content').innerHTML = `<h4>${escapeXml(topic.title)}</h4>${topic.body}`;
            helpOverlay.querySelector('#cb-help-back-btn').disabled = histIdx <= 0;
            helpOverlay.querySelector('#cb-help-fwd-btn').disabled = histIdx >= history.length - 1;
        };

        helpOverlay.querySelectorAll('.cb-help-topic-btn').forEach(btn => {
            btn.addEventListener('click', () => renderTopic(btn.dataset.topicId, true));
        });
        helpOverlay.querySelector('#cb-help-back-btn').addEventListener('click', () => {
            if (histIdx > 0) {
                histIdx--;
                renderTopic(history[histIdx], false);
            }
        });
        helpOverlay.querySelector('#cb-help-fwd-btn').addEventListener('click', () => {
            if (histIdx < history.length - 1) {
                histIdx++;
                renderTopic(history[histIdx], false);
            }
        });

        const closeHelp = () => {
            teardownDrag();
            helpOverlay.remove();
        };
        helpOverlay.querySelector('#cb-help-close-x').addEventListener('click', closeHelp);
        helpOverlay.querySelector('#cb-help-ok-btn').addEventListener('click', closeHelp);
        helpOverlay.addEventListener('mousedown', (e) => {
            if (e.target === helpOverlay) closeHelp();
        });

        renderTopic(topics[0].id, false);
        if (parentOverlay && !document.body.contains(parentOverlay)) closeHelp();
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

    function insertCodebreakerPageObjects(cbId, layout, cipher, cfg, isAnswerKey) {
        const paperEl = document.getElementById('paper');
        const pw = paperEl ? (parseFloat(paperEl.style.width) || 794) : 794;
        const ph = paperEl ? (parseFloat(paperEl.style.height) || 1123) : 1123;
        const margin = 44;
        const usableW = Math.max(360, pw - margin * 2);
        const fontFamily = cfg.fontFamily || 'Segoe UI, Arial, sans-serif';
        const rawAccent = normalizeHexColor(cfg.accentColor, '#007670');
        const accentColor = contrastTextForBg(rawAccent) === '#ffffff' ? rawAccent : normalizeHexColor(cfg.letterColor, '#0f172a');
        const letterColor = normalizeHexColor(cfg.letterColor, '#0f172a');
        const rawTitle = (cfg.title || 'Codebreaker Challenge').trim() || 'Codebreaker Challenge';
        const headingText = isAnswerKey ? `${rawTitle} - Answer Key` : rawTitle;

        // 1. Editable Title
        const titleTop = 34;
        const titleH = 44;
        const titleEl = insertTextBoxElement(
            `<div contenteditable="true" spellcheck="false" style="width:100%; height:100%; box-sizing:border-box; padding:4px 8px; outline:none; text-align:center; font-family:${escapeXml(fontFamily)}; font-size:23px; font-weight:800; color:${escapeXml(accentColor)}; letter-spacing:0.3px;">${escapeXml(headingText)}</div>`,
            margin,
            titleTop,
            usableW,
            titleH
        );
        if (titleEl) {
            titleEl.setAttribute('data-cb-id', cbId);
            titleEl.setAttribute('data-cb-role', isAnswerKey ? 'answer-title' : 'title');
        }

        // 2. Subtitle / Instructions line on Puzzle page
        let gridTop = titleTop + titleH + 8;
        if (!isAnswerKey) {
            const subEl = insertTextBoxElement(
                `<div contenteditable="true" spellcheck="false" style="width:100%; height:100%; box-sizing:border-box; outline:none; text-align:center; font-family:${escapeXml(fontFamily)}; font-size:12px; font-weight:600; color:${escapeXml(letterColor)}; opacity:0.84;">Crack the 1-26 substitution cipher. Every matching number represents the same letter.</div>`,
                margin,
                78,
                usableW,
                24
            );
            if (subEl) {
                subEl.setAttribute('data-cb-id', cbId);
                subEl.setAttribute('data-cb-role', 'subtitle');
            }
            gridTop = 108;
        } else {
            gridTop = 94;
        }

        // 3. Cipher Grid SVG & Tracker proportions
        const trackerAspect = 680 / 188;
        const trackerW = Math.min(usableW, 690);
        const trackerH = Math.round(trackerW / trackerAspect);
        const trackerTop = Math.max(480, ph - 36 - trackerH);
        const maxGridH = Math.max(240, trackerTop - gridTop - 16);

        const rawW = Math.max(1, layout.cols * 36 + 20);
        const rawH = Math.max(1, layout.rows * 36 + 20);
        const gridAspect = rawW / rawH;

        let gridW = Math.min(usableW, Math.round(maxGridH * gridAspect));
        let gridH = Math.round(gridW / gridAspect);
        if (gridH > maxGridH) {
            gridH = maxGridH;
            gridW = Math.round(gridH * gridAspect);
        }
        const gridLeft = Math.round((pw - gridW) / 2);

        const gridSvg = buildCodebreakerGridSvg(layout, cipher, cfg, { isAnswer: isAnswerKey });
        const gridWrapper = window.createWrapper(gridSvg);
        gridWrapper.setAttribute('data-type', 'shape');
        gridWrapper.setAttribute('data-codebreaker', isAnswerKey ? 'answer-key' : 'puzzle');
        gridWrapper.setAttribute('data-cb-id', cbId);
        gridWrapper.setAttribute('data-cb-role', isAnswerKey ? 'answer-key' : 'puzzle');
        gridWrapper.setAttribute('data-aspect-lock', 'true');
        gridWrapper.setAttribute('data-aspect-ratio', String(rawW / rawH));
        gridWrapper.style.left = gridLeft + 'px';
        gridWrapper.style.top = gridTop + 'px';
        gridWrapper.style.width = gridW + 'px';
        gridWrapper.style.height = gridH + 'px';

        // 4. Bottom A-to-Z & 1-26 Tracking Table SVG
        const trackerSvg = buildCodebreakerTrackerSvg(layout, cipher, cfg, { isAnswer: isAnswerKey });
        const trackerWrapper = window.createWrapper(trackerSvg);
        trackerWrapper.setAttribute('data-type', 'shape');
        trackerWrapper.setAttribute('data-codebreaker', isAnswerKey ? 'answer-tracker' : 'tracker');
        trackerWrapper.setAttribute('data-cb-id', cbId);
        trackerWrapper.setAttribute('data-cb-role', isAnswerKey ? 'answer-tracker' : 'tracker');
        trackerWrapper.setAttribute('data-aspect-lock', 'true');
        trackerWrapper.setAttribute('data-aspect-ratio', String(trackerAspect));
        trackerWrapper.style.left = Math.round((pw - trackerW) / 2) + 'px';
        trackerWrapper.style.top = trackerTop + 'px';
        trackerWrapper.style.width = trackerW + 'px';
        trackerWrapper.style.height = trackerH + 'px';

        return gridWrapper;
    }

    function insertCodebreakerIntoDocument(layout, cipher, cfg) {
        if (typeof state === 'undefined' || typeof window.createWrapper !== 'function') return;

        const cbId = 'cb-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 10000);
        const startPageIdx = (typeof state.currentPageIndex === 'number') ? state.currentPageIndex : 0;
        const primaryEl = insertCodebreakerPageObjects(cbId, layout, cipher, cfg, false);

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

            insertCodebreakerPageObjects(cbId, layout, cipher, cfg, true);
            if (typeof serializeCurrentPage === 'function') {
                state.pages[targetIdx] = serializeCurrentPage();
            }

            if (typeof window.switchPage === 'function') {
                window.switchPage(startPageIdx);
            }
            answerPageNumber = targetIdx + 1;
        }

        const primaryInDom = document.querySelector(`.pub-element[data-cb-id="${cbId}"][data-codebreaker="puzzle"]`) || primaryEl;
        if (primaryInDom && document.contains(primaryInDom) && typeof window.selectElement === 'function') {
            window.selectElement(primaryInDom);
        }
        if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
        if (typeof window.updateSidebar === 'function') window.updateSidebar();
        if (typeof window.pushHistory === 'function') window.pushHistory();

        if (typeof showToast === 'function') {
            showToast(answerPageNumber ? `Codebreaker puzzle + Page ${answerPageNumber} Answer Key added!` : 'Codebreaker puzzle added!');
        }
    }

    function showModal() {
        const existing = document.getElementById('op-codebreaker-modal');
        if (existing) existing.remove();
        const existingHelp = document.getElementById('op-codebreaker-help-modal');
        if (existingHelp) existingHelp.remove();

        const initialThemeColor = resolveThemeColor();
        const modalState = {
            title: 'Codebreaker Challenge',
            wordsText: DEFAULT_CODEBREAKER_WORDS,
            styleMode: 'crisscross',
            starterCount: 3,
            seedCount: 16,
            fontFamily: 'Segoe UI, Arial, sans-serif',
            accentColor: initialThemeColor,
            letterColor: '#0f172a',
            cellBgColor: '#ffffff',
            borderColor: '#334155',
            numberColor: initialThemeColor,
            blockColor: '#0f172a',
            answerKeyOnPage2: true,
            previewMode: 'puzzle',
            baseSeed: 2401,
            cipherSeed: 7309,
            layout: null,
            cipher: null
        };

        const words = parseWordList(modalState.wordsText);
        modalState.layout = generateCodebreakerLayout(words, { seedCount: modalState.seedCount, baseSeed: modalState.baseSeed });
        modalState.cipher = generateCipherMapping(modalState.layout, modalState.cipherSeed, modalState.starterCount);

        const overlay = document.createElement('div');
        overlay.id = 'op-codebreaker-modal';
        overlay.className = 'cb-modal-overlay';

        const presetButtonsHtml = Object.keys(COLOR_PRESETS).map(key => {
            const p = COLOR_PRESETS[key];
            return `<button type="button" class="cb-preset-btn" data-color-preset="${key}" title="${escapeXml(p.label)}">
                <span class="cb-preset-swatch" style="background:linear-gradient(135deg, ${p.accent} 50%, ${p.block} 50%);"></span>
                <span>${escapeXml(p.label)}</span>
            </button>`;
        }).join('');

        overlay.innerHTML = `
            <style>
                .cb-modal-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.14);
                    z-index: 1000010;
                    display: flex; align-items: center; justify-content: center;
                    padding: 14px; box-sizing: border-box;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .cb-modal-box {
                    width: 960px; max-width: 96vw; max-height: 92vh;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #1e293b);
                    border-radius: 10px; box-shadow: 0 20px 55px rgba(0, 0, 0, 0.34);
                    border: 1px solid var(--ui-border, #cbd5e1);
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .cb-modal-header {
                    padding: 8px 10px 8px 18px;
                    background: linear-gradient(135deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #004a46));
                    color: #ffffff; display: flex; align-items: center; justify-content: space-between;
                    user-select: none; min-height: 46px; box-sizing: border-box;
                }
                .cb-header-title { display: flex; align-items: center; gap: 9px; font-weight: 700; font-size: 14.5px; }
                .cb-header-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
                .cb-header-actions .custom-dialog-close {
                    width: 34px; height: 34px; font-size: 17px; border-radius: 8px;
                }
                .cb-help-icon-btn:hover,
                body.dark-mode .cb-help-icon-btn:hover {
                    background: rgba(255, 255, 255, 0.25) !important;
                }
                .cb-modal-body {
                    display: grid; grid-template-columns: 356px 1fr; flex: 1; min-height: 0; overflow: hidden;
                }
                .cb-controls-pane {
                    padding: 14px 16px; border-right: 1px solid var(--ui-border, #e2e8f0);
                    overflow-y: auto; display: flex; flex-direction: column; gap: 11px;
                    background: var(--ui-surface-bg, #f8fafc);
                }
                body.dark-mode .cb-controls-pane { background: #0f172a; border-right-color: #334155; }
                .cb-field-label {
                    display: block; font-size: 11px; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 0.45px; color: var(--ui-theme-dark, #0f766e); margin-bottom: 4px;
                }
                body.dark-mode .cb-field-label { color: #5eead4; }
                .cb-input, .cb-textarea {
                    width: 100%; box-sizing: border-box; border-radius: 6px;
                    border: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #0f172a);
                    padding: 7px 9px; font-size: 12.5px; font-family: inherit; outline: none;
                }
                body.dark-mode .cb-input, body.dark-mode .cb-textarea { background: #1e293b; color: #f8fafc; border-color: #475569; }
                .cb-input:focus, .cb-textarea:focus {
                    border-color: var(--ui-theme-color, #007670); box-shadow: 0 0 0 2px rgba(0, 118, 112, 0.16);
                }
                .cb-textarea {
                    min-height: 116px; resize: vertical; line-height: 1.4;
                    font-family: Consolas, 'Courier New', monospace; font-size: 12px;
                }
                .cb-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .cb-select-wrap { position: relative; width: 100%; }
                .cb-modern-select {
                    width: 100%; min-width: 0; height: 31px; padding: 0 0 0 9px;
                    border-radius: 6px; font-size: 12px; justify-content: space-between;
                    border: 1px solid var(--ui-border, #cbd5e1); background: var(--ui-panel-bg, #ffffff);
                    color: var(--ui-text, #0f172a);
                }
                body.dark-mode .cb-modern-select { background: #1e293b; color: #f8fafc; border-color: #475569; }
                .cb-select-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
                .cb-modern-select .arrow-box {
                    height: 100%; width: 28px; display: flex; align-items: center; justify-content: center;
                    background: var(--ui-theme-color, #007670); color: #ffffff;
                    border-top-right-radius: 5px; border-bottom-right-radius: 5px; flex-shrink: 0;
                }
                .cb-select-menu {
                    position: fixed; z-index: 1000060; display: none; flex-direction: column;
                    background: var(--ui-panel-bg, #ffffff); border: 1px solid var(--ui-border, #cbd5e1);
                    border-radius: 7px; box-shadow: 0 10px 26px rgba(0, 0, 0, 0.22);
                    padding: 4px; max-height: 240px; overflow-y: auto; box-sizing: border-box;
                }
                body.dark-mode .cb-select-menu { background: #1e293b; border-color: #475569; }
                .cb-select-menu.open { display: flex; }
                .cb-select-option {
                    padding: 6px 10px; font-size: 12px; border-radius: 5px; cursor: pointer;
                    color: var(--ui-text, #1e293b); white-space: nowrap;
                }
                body.dark-mode .cb-select-option { color: #f8fafc; }
                .cb-select-option:hover { background: rgba(0, 118, 112, 0.12); }
                .cb-select-option.active { background: var(--ui-theme-color, #007670); color: #ffffff; font-weight: 700; }

                .cb-color-section {
                    border: 1px solid var(--ui-border, #e2e8f0); border-radius: 8px;
                    padding: 9px 10px; background: var(--ui-panel-bg, #ffffff); display: flex; flex-direction: column; gap: 7px;
                }
                body.dark-mode .cb-color-section { background: #1e293b; border-color: #334155; }
                .cb-color-presets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
                .cb-preset-btn {
                    display: flex; align-items: center; gap: 5px; padding: 4px 6px;
                    font-size: 10.5px; font-weight: 600; border-radius: 5px;
                    border: 1px solid var(--ui-border, #cbd5e1); background: var(--ui-surface-bg, #f8fafc);
                    color: var(--ui-text, #1e293b); cursor: pointer; text-align: left;
                }
                body.dark-mode .cb-preset-btn { background: #0f172a; color: #e2e8f0; border-color: #475569; }
                .cb-preset-btn:hover { border-color: var(--ui-theme-color, #007670); }
                .cb-preset-swatch { width: 13px; height: 13px; border-radius: 3px; border: 1px solid rgba(0, 0, 0, 0.2); flex-shrink: 0; }
                .cb-color-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
                .cb-color-chip {
                    display: flex; align-items: center; justify-content: space-between; gap: 4px;
                    padding: 4px 7px; border-radius: 5px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-surface-bg, #f8fafc); color: var(--ui-text, #1e293b);
                    font-size: 11px; font-weight: 600; cursor: pointer;
                }
                body.dark-mode .cb-color-chip { background: #0f172a; color: #e2e8f0; border-color: #475569; }
                .cb-color-chip:hover { border-color: var(--ui-theme-color, #007670); }
                .cb-swatch-box { width: 16px; height: 16px; border-radius: 4px; border: 1px solid rgba(0, 0, 0, 0.25); flex-shrink: 0; }

                .cb-check-label {
                    display: flex; align-items: center; gap: 7px; font-size: 12px; cursor: pointer;
                    color: var(--ui-text, #1e293b); user-select: none;
                }
                body.dark-mode .cb-check-label { color: #e2e8f0; }

                .cb-preview-pane {
                    display: flex; flex-direction: column; min-height: 0; background: var(--ui-panel-bg, #ffffff);
                }
                body.dark-mode .cb-preview-pane { background: #111827; }
                .cb-preview-toolbar {
                    display: flex; align-items: center; justify-content: space-between; gap: 8px;
                    padding: 9px 14px; border-bottom: 1px solid var(--ui-border, #e2e8f0);
                }
                body.dark-mode .cb-preview-toolbar { border-bottom-color: #334155; }
                .cb-preview-tabs { display: flex; gap: 6px; }
                .cb-ptab {
                    padding: 5px 12px; border-radius: 6px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: transparent; color: var(--ui-text, #334155); font-size: 12px; font-weight: 600; cursor: pointer;
                }
                body.dark-mode .cb-ptab { color: #cbd5e1; border-color: #475569; }
                .cb-ptab.active {
                    background: var(--ui-theme-color, #007670); border-color: var(--ui-theme-color, #007670); color: #ffffff;
                }
                .cb-mini-btn {
                    padding: 5px 10px; border-radius: 6px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-surface-bg, #f8fafc); color: var(--ui-text, #1e293b);
                    font-size: 11.5px; font-weight: 600; cursor: pointer;
                }
                body.dark-mode .cb-mini-btn { background: #1e293b; color: #f8fafc; border-color: #475569; }
                .cb-mini-btn:hover { border-color: var(--ui-theme-color, #007670); color: var(--ui-theme-color, #007670); }

                .cb-preview-stack {
                    flex: 1; display: flex; flex-direction: column; min-height: 0; overflow-y: auto;
                    padding: 12px 14px; gap: 10px; align-items: center; justify-content: flex-start;
                    background: var(--ui-surface-bg, #f8fafc);
                }
                body.dark-mode .cb-preview-stack { background: #0f172a; }
                .cb-preview-grid-card {
                    width: 100%; max-width: 490px; aspect-ratio: 4 / 3; max-height: 310px;
                    display: flex; align-items: center; justify-content: center;
                    background: #ffffff; border: 1px solid var(--ui-border, #cbd5e1);
                    border-radius: 8px; padding: 10px; box-sizing: border-box;
                }
                .cb-preview-tracker-card {
                    width: 100%; max-width: 540px;
                    background: #ffffff; border: 1px solid var(--ui-border, #cbd5e1);
                    border-radius: 8px; padding: 6px; box-sizing: border-box;
                }
                body.dark-mode .cb-preview-grid-card,
                body.dark-mode .cb-preview-tracker-card { background: #1e293b; border-color: #334155; }

                .cb-status-bar {
                    padding: 7px 14px; border-top: 1px solid var(--ui-border, #e2e8f0);
                    font-size: 11.5px; display: flex; align-items: center; justify-content: space-between;
                    background: var(--ui-surface-bg, #f8fafc);
                }
                body.dark-mode .cb-status-bar { background: #0f172a; border-top-color: #334155; }
                .cb-modal-footer {
                    padding: 10px 16px; border-top: 1px solid var(--ui-border, #e2e8f0);
                    display: flex; align-items: center; justify-content: space-between; gap: 10px;
                    background: var(--ui-panel-bg, #ffffff);
                }
                body.dark-mode .cb-modal-footer { background: #111827; border-top-color: #334155; }
                .cb-btn-secondary {
                    padding: 7px 15px; border-radius: 6px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: transparent; color: var(--ui-text, #1e293b); font-size: 12.5px; font-weight: 600; cursor: pointer;
                }
                body.dark-mode .cb-btn-secondary { color: #e2e8f0; border-color: #475569; }
                .cb-btn-primary {
                    padding: 7px 18px; border-radius: 6px; border: none;
                    background: var(--ui-theme-color, #007670); color: #ffffff;
                    font-size: 12.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 7px;
                }
                .cb-btn-primary:hover { background: var(--ui-theme-dark, #004a46); }
                @media (max-width: 820px) {
                    .cb-modal-body { grid-template-columns: 1fr; }
                    .cb-controls-pane { max-height: 290px; border-right: none; border-bottom: 1px solid var(--ui-border, #e2e8f0); }
                }
            </style>
            <div class="cb-modal-box" id="cb-modal-box" role="dialog" aria-modal="true" aria-labelledby="cb-modal-title">
                <div class="cb-modal-header" id="cb-modal-header">
                    <div class="cb-header-title" id="cb-modal-title">
                        <i class="fas fa-key"></i>
                        <span>Codebreaker (Cipher Grid) Generator</span>
                    </div>
                    <div class="cb-header-actions">
                        <button type="button" class="custom-dialog-close cb-help-icon-btn" id="cb-help-btn" title="Codebreaker Help" aria-label="Codebreaker Help">
                            <i class="fas fa-question"></i>
                        </button>
                        <button type="button" class="custom-dialog-close" id="cb-close-x" title="Close" aria-label="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div class="cb-modal-body">
                    <div class="cb-controls-pane">
                        <div>
                            <label class="cb-field-label" for="cb-title">Puzzle Title</label>
                            <input type="text" id="cb-title" class="cb-input" value="${escapeXml(modalState.title)}">
                        </div>

                        <div>
                            <label class="cb-field-label" for="cb-words">Word Pool (no clues needed)</label>
                            <textarea id="cb-words" class="cb-textarea">${escapeXml(modalState.wordsText)}</textarea>
                        </div>

                        <div class="cb-row-2">
                            <div>
                                <label class="cb-field-label" for="cb-style-mode">Grid Style</label>
                                <select id="cb-style-mode" class="cb-select">
                                    <option value="crisscross" selected>Criss-Cross Freeform</option>
                                    <option value="crossword">Classic Crossword Block</option>
                                </select>
                            </div>
                            <div>
                                <label class="cb-field-label" for="cb-starter-count">Starter Letters</label>
                                <select id="cb-starter-count" class="cb-select">
                                    <option value="0">0 Starters (Expert)</option>
                                    <option value="2">2 Starters (Hard)</option>
                                    <option value="3" selected>3 Starters (Normal)</option>
                                    <option value="4">4 Starters (Easy)</option>
                                    <option value="5">5 Starters (Warmup)</option>
                                </select>
                            </div>
                        </div>

                        <div class="cb-row-2">
                            <div>
                                <label class="cb-field-label" for="cb-seed-count">Layout Search</label>
                                <select id="cb-seed-count" class="cb-select">
                                    <option value="8">Fast (8 Seeds)</option>
                                    <option value="16" selected>Balanced (16 Seeds)</option>
                                    <option value="32">Tightest (32 Seeds)</option>
                                </select>
                            </div>
                            <div>
                                <label class="cb-field-label" for="cb-font-family">Letter &amp; Key Font</label>
                                <select id="cb-font-family" class="cb-select">
                                    <option value="Segoe UI, Arial, sans-serif">Segoe UI (Clean)</option>
                                    <option value="Courier New, monospace">Courier New (Mono)</option>
                                    <option value="Arial, sans-serif">Arial</option>
                                    <option value="Georgia, serif">Georgia (Serif)</option>
                                    <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                                </select>
                            </div>
                        </div>

                        <div class="cb-color-section">
                            <div style="display:flex; align-items:center; justify-content:space-between;">
                                <label class="cb-field-label" style="margin:0;">Colors &amp; Palette</label>
                                <span style="font-size:10.5px; opacity:0.7;">Presets or custom swatches</span>
                            </div>
                            <div class="cb-color-presets" id="cb-color-presets">
                                ${presetButtonsHtml}
                            </div>
                            <div class="cb-color-grid">
                                <button type="button" class="cb-color-chip" data-color-target="cb-accent-color" title="Title, key headers &amp; starter highlight">
                                    <span>Accent</span>
                                    <span class="cb-swatch-box" data-swatch-for="cb-accent-color" style="background:${escapeXml(normalizeHexColor(modalState.accentColor, '#007670'))};"></span>
                                    <input type="hidden" id="cb-accent-color" value="${escapeXml(normalizeHexColor(modalState.accentColor, '#007670'))}">
                                </button>
                                <button type="button" class="cb-color-chip" data-color-target="cb-letter-color" title="Decoded letters">
                                    <span>Letters</span>
                                    <span class="cb-swatch-box" data-swatch-for="cb-letter-color" style="background:${escapeXml(modalState.letterColor)};"></span>
                                    <input type="hidden" id="cb-letter-color" value="${escapeXml(modalState.letterColor)}">
                                </button>
                                <button type="button" class="cb-color-chip" data-color-target="cb-cell-bg-color" title="Tile background color">
                                    <span>Cell Fill</span>
                                    <span class="cb-swatch-box" data-swatch-for="cb-cell-bg-color" style="background:${escapeXml(modalState.cellBgColor)};"></span>
                                    <input type="hidden" id="cb-cell-bg-color" value="${escapeXml(modalState.cellBgColor)}">
                                </button>
                                <button type="button" class="cb-color-chip" data-color-target="cb-border-color" title="Tile &amp; table borders">
                                    <span>Borders</span>
                                    <span class="cb-swatch-box" data-swatch-for="cb-border-color" style="background:${escapeXml(modalState.borderColor)};"></span>
                                    <input type="hidden" id="cb-border-color" value="${escapeXml(modalState.borderColor)}">
                                </button>
                                <button type="button" class="cb-color-chip" data-color-target="cb-number-color" title="Cipher numbers 1-26 inside cells">
                                    <span>Numbers</span>
                                    <span class="cb-swatch-box" data-swatch-for="cb-number-color" style="background:${escapeXml(normalizeHexColor(modalState.numberColor, '#007670'))};"></span>
                                    <input type="hidden" id="cb-number-color" value="${escapeXml(normalizeHexColor(modalState.numberColor, '#007670'))}">
                                </button>
                                <button type="button" class="cb-color-chip" data-color-target="cb-block-color" title="Blocked empty squares">
                                    <span>Block</span>
                                    <span class="cb-swatch-box" data-swatch-for="cb-block-color" style="background:${escapeXml(modalState.blockColor)};"></span>
                                    <input type="hidden" id="cb-block-color" value="${escapeXml(modalState.blockColor)}">
                                </button>
                            </div>
                        </div>

                        <div style="border-top:1px solid var(--ui-border, #e2e8f0); padding-top:10px;">
                            <label class="cb-check-label" style="font-weight:700;">
                                <input type="checkbox" id="cb-answer-page2" checked>
                                Generate Answer Key on Page 2
                            </label>
                        </div>
                    </div>

                    <div class="cb-preview-pane">
                        <div class="cb-preview-toolbar">
                            <div class="cb-preview-tabs">
                                <button type="button" class="cb-ptab active" id="cb-ptab-puzzle">Puzzle &amp; Key Table</button>
                                <button type="button" class="cb-ptab" id="cb-ptab-answer">Answer Key</button>
                            </div>
                            <div style="display:flex; gap:6px; align-items:center;">
                                <button type="button" class="cb-mini-btn" id="cb-shuffle-cipher-btn" title="Generate new 1-26 cipher numbers and starter letters"><i class="fas fa-dice" style="margin-right:4px;"></i>Shuffle Cipher</button>
                                <button type="button" class="cb-mini-btn" id="cb-shuffle-grid-btn" title="Search another intersecting grid layout seed"><i class="fas fa-random" style="margin-right:4px;"></i>New Seed</button>
                            </div>
                        </div>
                        <div class="cb-preview-stack">
                            <div class="cb-preview-grid-card" id="cb-preview-svg-host"></div>
                            <div class="cb-preview-tracker-card" id="cb-preview-tracker-host"></div>
                        </div>
                        <div class="cb-status-bar">
                            <span id="cb-status-text">Ready</span>
                            <span id="cb-grid-meta" style="opacity:0.75;"></span>
                        </div>
                    </div>
                </div>

                <div class="cb-modal-footer">
                    <span style="font-size:11.5px; opacity:0.75;">
                        Includes pre-generated 1-26 Code Key &amp; A-Z Tracker at the bottom of the puzzle.
                    </span>
                    <div style="display:flex; gap:8px;">
                        <button type="button" class="cb-btn-secondary" id="cb-cancel-btn">Cancel</button>
                        <button type="button" class="cb-btn-primary" id="cb-insert-btn"><i class="fas fa-plus"></i> Insert Codebreaker</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        const modalBox = overlay.querySelector('#cb-modal-box');
        const modalHeader = overlay.querySelector('#cb-modal-header');
        const teardownMainDrag = makeModalDraggable(modalBox, modalHeader);
        const selectCtrl = enhanceSelectControls(overlay);

        const renderPreviewOnly = () => {
            const isAnswer = modalState.previewMode === 'answer';
            const gridHost = overlay.querySelector('#cb-preview-svg-host');
            const trackerHost = overlay.querySelector('#cb-preview-tracker-host');
            if (gridHost) {
                gridHost.innerHTML = buildCodebreakerGridSvg(modalState.layout, modalState.cipher, modalState, { isAnswer });
            }
            if (trackerHost) {
                trackerHost.innerHTML = buildCodebreakerTrackerSvg(modalState.layout, modalState.cipher, modalState, { isAnswer });
            }

            const statusEl = overlay.querySelector('#cb-status-text');
            const metaEl = overlay.querySelector('#cb-grid-meta');
            const lay = modalState.layout;
            const cip = modalState.cipher;
            if (statusEl) {
                const starterStr = cip.starterLetters.length > 0 ? cip.starterLetters.join(', ') : 'None';
                statusEl.textContent = `Placed ${lay.placedWords.length} words (${lay.uniqueLetters}/26 letters active) - Starters: ${starterStr}`;
            }
            if (metaEl) {
                metaEl.textContent = `${lay.cols} x ${lay.rows} grid - ${lay.intersections} intersections`;
            }
        };

        const syncControlsToState = () => {
            modalState.title = overlay.querySelector('#cb-title').value;
            modalState.wordsText = overlay.querySelector('#cb-words').value;
            modalState.styleMode = overlay.querySelector('#cb-style-mode').value;
            modalState.starterCount = parseInt(overlay.querySelector('#cb-starter-count').value, 10) || 0;
            modalState.seedCount = parseInt(overlay.querySelector('#cb-seed-count').value, 10) || 16;
            modalState.fontFamily = overlay.querySelector('#cb-font-family').value;
            modalState.accentColor = overlay.querySelector('#cb-accent-color').value;
            modalState.letterColor = overlay.querySelector('#cb-letter-color').value;
            modalState.cellBgColor = overlay.querySelector('#cb-cell-bg-color').value;
            modalState.borderColor = overlay.querySelector('#cb-border-color').value;
            modalState.numberColor = overlay.querySelector('#cb-number-color').value;
            modalState.blockColor = overlay.querySelector('#cb-block-color').value;
            modalState.answerKeyOnPage2 = overlay.querySelector('#cb-answer-page2').checked;
        };

        const syncAndRegenerate = (regenGrid, regenCipher) => {
            syncControlsToState();
            if (regenGrid) {
                const parsed = parseWordList(modalState.wordsText);
                modalState.layout = generateCodebreakerLayout(parsed, {
                    seedCount: modalState.seedCount,
                    baseSeed: modalState.baseSeed
                });
            }
            if (regenGrid || regenCipher) {
                modalState.cipher = generateCipherMapping(
                    modalState.layout,
                    modalState.cipherSeed,
                    modalState.starterCount
                );
            }
            renderPreviewOnly();
        };

        let debounceTimer = null;
        const scheduleWordsRegen = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => syncAndRegenerate(true, true), 180);
        };

        overlay.querySelector('#cb-words').addEventListener('input', scheduleWordsRegen);
        overlay.querySelector('#cb-title').addEventListener('input', () => syncControlsToState());
        overlay.querySelector('#cb-seed-count').addEventListener('change', () => syncAndRegenerate(true, true));
        overlay.querySelector('#cb-starter-count').addEventListener('change', () => syncAndRegenerate(false, true));
        ['#cb-style-mode', '#cb-font-family', '#cb-answer-page2'].forEach(sel => {
            overlay.querySelector(sel).addEventListener('change', () => {
                syncControlsToState();
                renderPreviewOnly();
            });
        });

        // Color Presets
        overlay.querySelectorAll('[data-color-preset]').forEach(btn => {
            btn.addEventListener('click', () => {
                const p = COLOR_PRESETS[btn.dataset.colorPreset];
                if (!p) return;
                const pairs = [
                    ['cb-accent-color', p.accent],
                    ['cb-letter-color', p.letter],
                    ['cb-cell-bg-color', p.cellBg],
                    ['cb-border-color', p.border],
                    ['cb-number-color', p.number],
                    ['cb-block-color', p.block]
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

        // Color Chips wired to Open Publisher's CustomColorPicker
        overlay.querySelectorAll('.cb-color-chip').forEach(chip => {
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

        const ptabPuzzle = overlay.querySelector('#cb-ptab-puzzle');
        const ptabAnswer = overlay.querySelector('#cb-ptab-answer');
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

        overlay.querySelector('#cb-shuffle-cipher-btn').addEventListener('click', () => {
            modalState.cipherSeed = (modalState.cipherSeed + 5281) >>> 0;
            syncAndRegenerate(false, true);
        });
        overlay.querySelector('#cb-shuffle-grid-btn').addEventListener('click', () => {
            modalState.baseSeed = (modalState.baseSeed + 7919) >>> 0;
            syncAndRegenerate(true, true);
        });

        overlay.querySelector('#cb-help-btn').addEventListener('click', (e) => {
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
            const openHelp = document.getElementById('op-codebreaker-help-modal');
            if (openHelp) openHelp.remove();
            overlay.remove();
        };
        onKeyDown = (e) => {
            if (e.key !== 'Escape') return;
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen && typeof window.CustomColorPicker.close === 'function') {
                window.CustomColorPicker.close();
                return;
            }
            const openHelp = document.getElementById('op-codebreaker-help-modal');
            if (openHelp) openHelp.remove();
            else closeModal();
        };
        document.addEventListener('keydown', onKeyDown);

        overlay.querySelector('#cb-close-x').addEventListener('click', closeModal);
        overlay.querySelector('#cb-cancel-btn').addEventListener('click', closeModal);
        overlay.addEventListener('mousedown', (e) => {
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen) return;
            if (e.target === overlay) closeModal();
        });
        overlay.querySelector('#cb-insert-btn').addEventListener('click', () => {
            syncControlsToState();
            const layoutCopy = modalState.layout;
            const cipherCopy = modalState.cipher;
            const cfgCopy = Object.assign({}, modalState);
            closeModal();
            insertCodebreakerIntoDocument(layoutCopy, cipherCopy, cfgCopy);
        });

        renderPreviewOnly();
    }

    window.CodebreakerStudio = {
        showModal,
        parseWordList,
        generateCodebreakerLayout,
        generateCipherMapping,
        buildCodebreakerGridSvg,
        buildCodebreakerTrackerSvg
    };
})(window);
