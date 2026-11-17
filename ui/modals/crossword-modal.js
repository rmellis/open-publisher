// Open Publisher Crossword & Criss-Cross Builder Engine (v5.22.2)
// Computes the tightest intersecting crossword/criss-cross layout across multiple seeds,
// generates editable Across and Down clue frames that dynamically update when words are
// dragged on the grid, and creates a filled Answer Key on Page 2 by default.

(function(window) {
    'use strict';

    const DEFAULT_WORD_CLUES = [
        'PUBLISHER : Desktop publishing application',
        'LAYOUT : Arrangement of text and visuals on a page',
        'DESIGN : Visual plan for a publication',
        'VECTOR : Resolution-independent path graphic',
        'GRID : Intersecting alignment lines and cells',
        'TYPE : Printed characters and lettering',
        'PRINT : Ink or toner output on paper',
        'MARGIN : Blank border around page content',
        'PALETTE : Coordinated group of theme colors',
        'PAGE : Single sheet side inside a document'
    ].join('\n');

    const COLOR_PRESETS = {
        teal: { label: 'Classic Teal', accent: '#007670', letter: '#0f172a', cellBg: '#ffffff', border: '#334155', number: '#007670', block: '#0f172a' },
        newspaper: { label: 'Classic Print', accent: '#111827', letter: '#111827', cellBg: '#ffffff', border: '#111827', number: '#374151', block: '#111827' },
        ocean: { label: 'Ocean Blue', accent: '#0369a1', letter: '#0c4a6e', cellBg: '#f0f9ff', border: '#0284c7', number: '#0369a1', block: '#0c4a6e' },
        berry: { label: 'Warm Berry', accent: '#be123c', letter: '#4c0519', cellBg: '#fff1f2', border: '#e11d48', number: '#be123c', block: '#881337' },
        forest: { label: 'Forest Mint', accent: '#15803d', letter: '#14532d', cellBg: '#f0fdf4', border: '#16a34a', number: '#15803d', block: '#14532d' },
        chalkboard: { label: 'Chalkboard', accent: '#0d9488', letter: '#f8fafc', cellBg: '#1e293b', border: '#64748b', number: '#5eead4', block: '#0f172a' }
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

    function parseWordCluePairs(rawText) {
        const lines = String(rawText || '').split(/\r?\n/);
        const seen = new Set();
        const entries = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            let rawWord = '';
            let rawClue = '';
            const sepMatch = line.match(/^([^:=|\t]+?)\s*(?::|=|\||\t|\s+-\s+)\s*(.*)$/);
            if (sepMatch) {
                rawWord = sepMatch[1];
                rawClue = sepMatch[2];
            } else {
                const spaceIdx = line.indexOf(' ');
                if (spaceIdx > 0) {
                    rawWord = line.slice(0, spaceIdx);
                    rawClue = line.slice(spaceIdx + 1);
                } else {
                    rawWord = line;
                    rawClue = 'Clue for ' + line.toUpperCase();
                }
            }
            const cleanWord = rawWord.toUpperCase().replace(/[^A-Z0-9]/g, '');
            const cleanClue = (rawClue || '').trim() || ('Clue for ' + cleanWord);
            if (cleanWord.length >= 2 && !seen.has(cleanWord)) {
                seen.add(cleanWord);
                entries.push({ word: cleanWord, clue: cleanClue });
            }
        }
        return entries;
    }

    function buildOccupancyFromPlaced(placedWords, excludeIndex) {
        const gridMap = new Map();
        const acrossSet = new Set();
        const downSet = new Set();
        let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;

        for (let i = 0; i < placedWords.length; i++) {
            if (i === excludeIndex) continue;
            const w = placedWords[i];
            const dr = (w.dir === 'down') ? 1 : 0;
            const dc = (w.dir === 'across') ? 1 : 0;
            for (let k = 0; k < w.word.length; k++) {
                const r = w.r + dr * k;
                const c = w.c + dc * k;
                const key = r + ',' + c;
                gridMap.set(key, w.word[k]);
                if (w.dir === 'across') acrossSet.add(key);
                else downSet.add(key);
                if (r < minR) minR = r;
                if (r > maxR) maxR = r;
                if (c < minC) minC = c;
                if (c > maxC) maxC = c;
            }
        }

        return { gridMap, acrossSet, downSet, minR, maxR, minC, maxC };
    }

    function evaluatePlacement(word, r, c, dir, occ, requireIntersection) {
        const dr = (dir === 'down') ? 1 : 0;
        const dc = (dir === 'across') ? 1 : 0;
        const len = word.length;

        // Endpoints must not abut another occupied cell along the same axis
        if (occ.gridMap.has((r - dr) + ',' + (c - dc))) return { valid: false, intersections: 0 };
        if (occ.gridMap.has((r + dr * len) + ',' + (c + dc * len))) return { valid: false, intersections: 0 };

        let intersections = 0;
        for (let k = 0; k < len; k++) {
            const cr = r + dr * k;
            const cc = c + dc * k;
            const key = cr + ',' + cc;
            const existing = occ.gridMap.get(key);

            // Prevent overlapping parallel words on the exact same axis
            if (dir === 'across' && occ.acrossSet.has(key)) return { valid: false, intersections: 0 };
            if (dir === 'down' && occ.downSet.has(key)) return { valid: false, intersections: 0 };

            if (existing !== undefined) {
                if (existing !== word[k]) return { valid: false, intersections: 0 };
                intersections++;
            } else {
                // Non-intersecting cell cannot kiss orthogonal neighbor tiles
                if (occ.gridMap.has((cr - dc) + ',' + (cc - dr))) return { valid: false, intersections: 0 };
                if (occ.gridMap.has((cr + dc) + ',' + (cc + dr))) return { valid: false, intersections: 0 };
            }
        }

        if (requireIntersection && intersections === 0) {
            return { valid: false, intersections: 0 };
        }
        return { valid: true, intersections };
    }

    function recomputeCrosswordNumbersAndClues(placedWords, skippedWords, meta) {
        if (!placedWords || placedWords.length === 0) {
            return {
                rows: 5,
                cols: 5,
                grid: Array.from({ length: 5 }, () => Array(5).fill(null)),
                numbersGrid: Array.from({ length: 5 }, () => Array(5).fill(0)),
                placedWords: [],
                acrossClues: [],
                downClues: [],
                skippedWords: skippedWords || [],
                intersections: 0,
                bestSeedIndex: (meta && meta.bestSeedIndex) || 0,
                seedsTested: (meta && meta.seedsTested) || 1
            };
        }

        let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
        for (let i = 0; i < placedWords.length; i++) {
            const w = placedWords[i];
            const dr = (w.dir === 'down') ? 1 : 0;
            const dc = (w.dir === 'across') ? 1 : 0;
            minR = Math.min(minR, w.r);
            maxR = Math.max(maxR, w.r + dr * (w.word.length - 1));
            minC = Math.min(minC, w.c);
            maxC = Math.max(maxC, w.c + dc * (w.word.length - 1));
        }

        const rows = Math.max(1, maxR - minR + 1);
        const cols = Math.max(1, maxC - minC + 1);
        const normalized = placedWords.map(w => ({
            word: w.word,
            clue: w.clue,
            r: w.r - minR,
            c: w.c - minC,
            dir: w.dir,
            number: 0
        }));

        const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
        const numbersGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
        const cellCounts = Array.from({ length: rows }, () => Array(cols).fill(0));

        for (let i = 0; i < normalized.length; i++) {
            const w = normalized[i];
            const dr = (w.dir === 'down') ? 1 : 0;
            const dc = (w.dir === 'across') ? 1 : 0;
            for (let k = 0; k < w.word.length; k++) {
                const rr = w.r + dr * k;
                const cc = w.c + dc * k;
                grid[rr][cc] = w.word[k];
                cellCounts[rr][cc]++;
            }
        }

        let intersections = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (cellCounts[r][c] > 1) intersections++;
            }
        }

        // Standard top-to-bottom, left-to-right crossword numbering by unique start coordinates
        const startCellsMap = new Map();
        for (let i = 0; i < normalized.length; i++) {
            const w = normalized[i];
            const key = w.r + ',' + w.c;
            if (!startCellsMap.has(key)) startCellsMap.set(key, []);
            startCellsMap.get(key).push(w);
        }

        const sortedKeys = Array.from(startCellsMap.keys()).sort((a, b) => {
            const [ar, ac] = a.split(',').map(Number);
            const [br, bc] = b.split(',').map(Number);
            return (ar !== br) ? (ar - br) : (ac - bc);
        });

        let clueNum = 1;
        sortedKeys.forEach(key => {
            const [sr, sc] = key.split(',').map(Number);
            numbersGrid[sr][sc] = clueNum;
            const group = startCellsMap.get(key);
            group.forEach(w => { w.number = clueNum; });
            clueNum++;
        });

        const acrossClues = normalized
            .filter(w => w.dir === 'across')
            .sort((a, b) => a.number - b.number);
        const downClues = normalized
            .filter(w => w.dir === 'down')
            .sort((a, b) => a.number - b.number);

        return {
            rows,
            cols,
            grid,
            numbersGrid,
            placedWords: normalized,
            acrossClues,
            downClues,
            skippedWords: skippedWords || [],
            intersections,
            bestSeedIndex: (meta && meta.bestSeedIndex) || 0,
            seedsTested: (meta && meta.seedsTested) || 1
        };
    }

    function solveSingleSeed(entries, seedVal, seedIdx) {
        const rng = makeRng(seedVal);
        const ordered = entries.slice();

        if (seedIdx === 0) {
            ordered.sort((a, b) => b.word.length - a.word.length);
        } else if (seedIdx === 1) {
            // Heuristic: prefer words sharing more letters with other words
            const charFreq = {};
            entries.forEach(e => {
                for (let i = 0; i < e.word.length; i++) {
                    const ch = e.word[i];
                    charFreq[ch] = (charFreq[ch] || 0) + 1;
                }
            });
            const scoreEntry = (e) => {
                let s = e.word.length * 2;
                for (let i = 0; i < e.word.length; i++) s += (charFreq[e.word[i]] || 0);
                return s;
            };
            ordered.sort((a, b) => scoreEntry(b) - scoreEntry(a));
        } else {
            // Shuffle words with mild preference for medium-long anchors
            for (let i = ordered.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                const tmp = ordered[i];
                ordered[i] = ordered[j];
                ordered[j] = tmp;
            }
            if (seedIdx % 3 === 2 && ordered.length > 2) {
                // Keep one of the longest words first as anchor
                let bestI = 0;
                for (let i = 1; i < ordered.length; i++) {
                    if (ordered[i].word.length > ordered[bestI].word.length) bestI = i;
                }
                const anchor = ordered.splice(bestI, 1)[0];
                ordered.unshift(anchor);
            }
        }

        const placed = [];
        const remaining = [];
        const anchorDir = (seedIdx % 2 === 0) ? 'across' : 'down';
        placed.push({ word: ordered[0].word, clue: ordered[0].clue, r: 0, c: 0, dir: anchorDir });

        for (let i = 1; i < ordered.length; i++) {
            remaining.push(ordered[i]);
        }

        // Iterative intersecting passes: place words that intersect existing grid with tightest bounding box
        let progress = true;
        while (remaining.length > 0 && progress) {
            progress = false;
            const occ = buildOccupancyFromPlaced(placed, -1);

            for (let ri = 0; ri < remaining.length; ri++) {
                const candidate = remaining[ri];
                let bestMove = null;
                let bestMoveScore = -Infinity;

                for (let k = 0; k < candidate.word.length; k++) {
                    const ch = candidate.word[k];
                    occ.gridMap.forEach((cellChar, key) => {
                        if (cellChar !== ch) return;
                        const [er, ec] = key.split(',').map(Number);

                        for (let d = 0; d < 2; d++) {
                            const dir = (d === 0) ? 'across' : 'down';
                            const sr = (dir === 'down') ? (er - k) : er;
                            const sc = (dir === 'across') ? (ec - k) : ec;
                            const check = evaluatePlacement(candidate.word, sr, sc, dir, occ, true);
                            if (!check.valid) continue;

                            const endR = sr + ((dir === 'down') ? (candidate.word.length - 1) : 0);
                            const endC = sc + ((dir === 'across') ? (candidate.word.length - 1) : 0);
                            const nMinR = Math.min(occ.minR, sr);
                            const nMaxR = Math.max(occ.maxR, endR);
                            const nMinC = Math.min(occ.minC, sc);
                            const nMaxC = Math.max(occ.maxC, endC);
                            const nRows = nMaxR - nMinR + 1;
                            const nCols = nMaxC - nMinC + 1;
                            const area = nRows * nCols;
                            const aspectPenalty = Math.abs(nRows - nCols) * 16;
                            const moveScore = (check.intersections * 240) - (area * 6) - aspectPenalty + (rng() * 8);

                            if (moveScore > bestMoveScore) {
                                bestMoveScore = moveScore;
                                bestMove = { word: candidate.word, clue: candidate.clue, r: sr, c: sc, dir };
                            }
                        }
                    });
                }

                if (bestMove) {
                    placed.push(bestMove);
                    remaining.splice(ri, 1);
                    progress = true;
                    break;
                }
            }
        }

        // If any words shared zero common letters with existing placed words, pack them tightly next to the grid
        const skipped = [];
        for (let ri = 0; ri < remaining.length; ri++) {
            const candidate = remaining[ri];
            const occ = buildOccupancyFromPlaced(placed, -1);
            let fallbackMove = null;
            let bestArea = Infinity;

            const trySpots = [
                { r: occ.minR, c: occ.maxC + 2, dir: 'down' },
                { r: occ.maxR + 2, c: occ.minC, dir: 'across' }
            ];
            for (let t = 0; t < trySpots.length; t++) {
                const sp = trySpots[t];
                const chk = evaluatePlacement(candidate.word, sp.r, sp.c, sp.dir, occ, false);
                if (chk.valid) {
                    const endR = sp.r + (sp.dir === 'down' ? candidate.word.length - 1 : 0);
                    const endC = sp.c + (sp.dir === 'across' ? candidate.word.length - 1 : 0);
                    const a = (Math.max(occ.maxR, endR) - Math.min(occ.minR, sp.r) + 1) *
                              (Math.max(occ.maxC, endC) - Math.min(occ.minC, sp.c) + 1);
                    if (a < bestArea) {
                        bestArea = a;
                        fallbackMove = { word: candidate.word, clue: candidate.clue, r: sp.r, c: sp.c, dir: sp.dir };
                    }
                }
            }

            if (fallbackMove) {
                placed.push(fallbackMove);
            } else {
                skipped.push(candidate);
            }
        }

        return recomputeCrosswordNumbersAndClues(placed, skipped, { bestSeedIndex: seedIdx });
    }

    function generateCrosswordLayout(entries, options) {
        const opts = options || {};
        const parsed = Array.isArray(entries) ? entries : parseWordCluePairs(entries);
        if (parsed.length === 0) {
            return recomputeCrosswordNumbersAndClues([], [], { bestSeedIndex: 0, seedsTested: 1 });
        }

        const seedsTested = Math.max(1, Math.min(48, parseInt(opts.seedCount, 10) || 16));
        const baseSeed = (typeof opts.baseSeed === 'number') ? opts.baseSeed : ((Date.now() ^ 0x5f3759df) >>> 0);

        let bestLayout = null;
        let bestScore = -Infinity;

        for (let s = 0; s < seedsTested; s++) {
            const candidate = solveSingleSeed(parsed, (baseSeed + Math.imul(s + 1, 2654435761)) >>> 0, s);
            const area = candidate.rows * candidate.cols;
            const skew = Math.abs(candidate.rows - candidate.cols);
            const score = (candidate.placedWords.length * 10000) + (candidate.intersections * 320) - (area * 12) - (skew * 18);
            if (score > bestScore) {
                bestScore = score;
                bestLayout = candidate;
            }
        }

        if (bestLayout) {
            bestLayout.seedsTested = seedsTested;
        }
        return bestLayout;
    }

    function buildCrosswordSvg(layout, options, isAnswerKey) {
        const opts = options || {};
        const cellSize = opts.cellSize || 34;
        const marginCells = opts.previewMarginCells || 0;
        const pad = 16;
        const totalRows = layout.rows + marginCells * 2;
        const totalCols = layout.cols + marginCells * 2;
        const gridW = Math.max(cellSize, totalCols * cellSize);
        const gridH = Math.max(cellSize, totalRows * cellSize);
        const svgW = gridW + pad * 2;
        const svgH = gridH + pad * 2;

        const styleMode = opts.styleMode || 'crisscross';
        const fontFamily = opts.fontFamily || 'Segoe UI, Arial, sans-serif';
        const cellBg = opts.cellBgColor || '#ffffff';
        const borderColor = opts.borderColor || '#334155';
        const letterColor = opts.letterColor || '#0f172a';
        const numberColor = opts.numberColor || '#007670';
        const blockColor = opts.blockColor || '#0f172a';

        const parts = [];
        parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block; width:100%; height:100%; overflow:visible;">`);

        // Optional crossword blacked-out background frame
        if (styleMode === 'crossword') {
            parts.push('<g class="cw-block-cells">');
            for (let r = 0; r < layout.rows; r++) {
                for (let c = 0; c < layout.cols; c++) {
                    if (layout.grid[r][c] !== null) continue;
                    const x = pad + (c + marginCells) * cellSize;
                    const y = pad + (r + marginCells) * cellSize;
                    parts.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${escapeXml(blockColor)}" stroke="${escapeXml(borderColor)}" stroke-width="1" />`);
                }
            }
            parts.push('</g>');
        }

        // Optional faint drop grid guide during modal drag editing
        if (marginCells > 0) {
            parts.push('<g class="cw-drag-guides" pointer-events="none">');
            for (let r = 0; r < totalRows; r++) {
                for (let c = 0; c < totalCols; c++) {
                    const gx = pad + c * cellSize;
                    const gy = pad + r * cellSize;
                    parts.push(`<rect x="${gx}" y="${gy}" width="${cellSize}" height="${cellSize}" fill="none" stroke="rgba(148,163,184,0.22)" stroke-width="0.75" />`);
                }
            }
            parts.push('</g>');
        }

        // Active letter tiles
        parts.push('<g class="cw-active-cells">');
        for (let r = 0; r < layout.rows; r++) {
            for (let c = 0; c < layout.cols; c++) {
                if (layout.grid[r][c] === null) continue;
                const x = pad + (c + marginCells) * cellSize;
                const y = pad + (r + marginCells) * cellSize;
                parts.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${escapeXml(cellBg)}" stroke="${escapeXml(borderColor)}" stroke-width="1.35" />`);
            }
        }
        parts.push('</g>');

        // Clue numbers in top-left corner of starting cells
        const numFontSize = Math.max(8, Math.round(cellSize * 0.28));
        parts.push(`<g class="cw-numbers" font-family="${escapeXml(fontFamily)}" font-size="${numFontSize}" font-weight="700" fill="${escapeXml(numberColor)}" text-anchor="start" pointer-events="none">`);
        for (let r = 0; r < layout.rows; r++) {
            for (let c = 0; c < layout.cols; c++) {
                const n = layout.numbersGrid[r][c];
                if (!n) continue;
                const nx = pad + (c + marginCells) * cellSize + 3;
                const ny = pad + (r + marginCells) * cellSize + numFontSize + 1.5;
                parts.push(`<text x="${nx}" y="${ny}">${n}</text>`);
            }
        }
        parts.push('</g>');

        // Answer Key solution letters (only rendered inside Answer Key mode)
        if (isAnswerKey) {
            const letterSize = Math.round(cellSize * 0.54);
            parts.push(`<g class="cw-answer-letters" font-family="${escapeXml(fontFamily)}" font-size="${letterSize}" font-weight="800" fill="${escapeXml(letterColor)}" text-anchor="middle" dominant-baseline="central" pointer-events="none">`);
            for (let r = 0; r < layout.rows; r++) {
                for (let c = 0; c < layout.cols; c++) {
                    const ch = layout.grid[r][c];
                    if (ch === null) continue;
                    const lx = pad + (c + marginCells + 0.5) * cellSize;
                    const ly = pad + (r + marginCells + 0.56) * cellSize;
                    parts.push(`<text x="${lx}" y="${ly}">${escapeXml(ch)}</text>`);
                }
            }
            parts.push('</g>');
        }

        // Interactive draggable word hit targets (active on Puzzle Grid for both modal preview and canvas dragging)
        if (!isAnswerKey && layout.placedWords.length > 0) {
            const selIdx = (typeof opts.selectedWordIdx === 'number') ? opts.selectedWordIdx : -1;
            parts.push('<g class="cw-word-targets">');
            for (let i = 0; i < layout.placedWords.length; i++) {
                const w = layout.placedWords[i];
                const x = pad + (w.c + marginCells) * cellSize;
                const y = pad + (w.r + marginCells) * cellSize;
                const rw = (w.dir === 'across') ? (w.word.length * cellSize) : cellSize;
                const rh = (w.dir === 'down') ? (w.word.length * cellSize) : cellSize;
                const isSelectedWord = (i === selIdx);
                const strokeAttr = isSelectedWord ? `stroke="${escapeXml(opts.accentColor || '#007670')}" stroke-width="2.2" stroke-dasharray="4 2"` : 'stroke="transparent" stroke-width="0"';
                const fillAttr = isSelectedWord ? 'fill="rgba(0, 118, 112, 0.10)"' : 'fill="transparent"';
                parts.push(
                    `<rect class="cw-word-drag-target" data-cw-word-idx="${i}" data-cw-word="${escapeXml(w.word)}" x="${x}" y="${y}" width="${rw}" height="${rh}" ${fillAttr} ${strokeAttr} style="cursor:grab; pointer-events:all;" />`
                );
            }
            parts.push('</g>');
        }

        // Placeholder group for live drag ghost inside modal or canvas
        parts.push('<g class="cw-drag-ghost" pointer-events="none"></g>');
        parts.push('</svg>');

        return { svgMarkup: parts.join(''), width: svgW, height: svgH, pad, cellSize, marginCells };
    }

    function buildCluesBoxInnerHtml(heading, cluesList, config, isAnswerKey) {
        const accent = config.accentColor || resolveThemeColor();
        const letterColor = config.letterColor || '#0f172a';
        const borderColor = config.borderColor || '#cbd5e1';
        const bgColor = (config.cellBgColor && config.cellBgColor.toLowerCase() !== '#ffffff') ? config.cellBgColor : '#f8fafc';
        const fontFamily = config.fontFamily || 'Segoe UI, Arial, sans-serif';

        const rowsHtml = cluesList.length > 0
            ? cluesList.map(c => {
                const answerTag = isAnswerKey ? ` <strong style="color:${escapeXml(accent)};">(${escapeXml(c.word)})</strong>` : '';
                return `<div style="padding:2px 0; font-size:12.5px; line-height:1.38; color:${escapeXml(letterColor)};"><strong>${c.number}.</strong> ${escapeXml(c.clue)}${answerTag}</div>`;
            }).join('')
            : `<div style="font-size:12px; opacity:0.65; color:${escapeXml(letterColor)};">No ${escapeXml(heading.toLowerCase())} words placed.</div>`;

        return `<div contenteditable="true" spellcheck="false" style="width:100%; height:100%; box-sizing:border-box; padding:10px 14px; outline:none; font-family:${escapeXml(fontFamily)}; background:${escapeXml(bgColor)}; border:1px solid ${escapeXml(borderColor)}; border-radius:8px; overflow-y:auto; -webkit-print-color-adjust:exact; print-color-adjust:exact;">
            <div style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.9px; color:${escapeXml(accent)}; border-bottom:1.5px solid ${escapeXml(borderColor)}; padding-bottom:4px; margin-bottom:7px;">${escapeXml(heading)} (${cluesList.length})</div>
            ${rowsHtml}
        </div>`;
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

    function serializeCwState(cwId, layout, config) {
        return JSON.stringify({
            cwId,
            layout: {
                placedWords: layout.placedWords.map(w => ({ word: w.word, clue: w.clue, r: w.r, c: w.c, dir: w.dir })),
                skippedWords: layout.skippedWords || [],
                bestSeedIndex: layout.bestSeedIndex || 0,
                seedsTested: layout.seedsTested || 1
            },
            config: {
                title: config.title,
                styleMode: config.styleMode,
                fontFamily: config.fontFamily,
                accentColor: config.accentColor,
                letterColor: config.letterColor,
                cellBgColor: config.cellBgColor,
                borderColor: config.borderColor,
                numberColor: config.numberColor,
                blockColor: config.blockColor
            }
        });
    }

    function syncLinkedClueFramesAndAnswerKey(cwId, newLayout, config) {
        // 1. Update live DOM clue frames & answer key frames on active page
        const acrossHtml = buildCluesBoxInnerHtml('Across', newLayout.acrossClues, config, false);
        const downHtml = buildCluesBoxInnerHtml('Down', newLayout.downClues, config, false);
        const ansAcrossHtml = buildCluesBoxInnerHtml('Across Answers', newLayout.acrossClues, config, true);
        const ansDownHtml = buildCluesBoxInnerHtml('Down Answers', newLayout.downClues, config, true);
        const puzzleSvg = buildCrosswordSvg(newLayout, config, false);
        const ansSvg = buildCrosswordSvg(newLayout, config, true);
        const serialized = serializeCwState(cwId, newLayout, config);

        const updateDomEl = (el) => {
            if (!el) return;
            const role = el.getAttribute('data-cw-role');
            const ec = el.querySelector('.element-content') || el;
            if (role === 'puzzle') {
                el.setAttribute('data-cw-state', serialized);
                ec.innerHTML = puzzleSvg.svgMarkup;
                el.setAttribute('data-aspect-ratio', String(puzzleSvg.width / puzzleSvg.height));
            } else if (role === 'across') {
                ec.innerHTML = acrossHtml;
            } else if (role === 'down') {
                ec.innerHTML = downHtml;
            } else if (role === 'answer-key') {
                el.setAttribute('data-cw-state', serialized);
                ec.innerHTML = ansSvg.svgMarkup;
                el.setAttribute('data-aspect-ratio', String(ansSvg.width / ansSvg.height));
            } else if (role === 'answer-across') {
                ec.innerHTML = ansAcrossHtml;
            } else if (role === 'answer-down') {
                ec.innerHTML = ansDownHtml;
            }
        };

        document.querySelectorAll(`.pub-element[data-cw-id="${cwId}"]`).forEach(updateDomEl);

        // 2. Also sync any off-page serialized Crossword / Answer Key elements stored in state.pages
        if (typeof state !== 'undefined' && Array.isArray(state.pages)) {
            const currIdx = (typeof state.currentPageIndex === 'number') ? state.currentPageIndex : 0;
            for (let pi = 0; pi < state.pages.length; pi++) {
                if (pi === currIdx) continue;
                const pg = state.pages[pi];
                if (!pg || !Array.isArray(pg.elements)) continue;
                for (let ei = 0; ei < pg.elements.length; ei++) {
                    const item = pg.elements[ei];
                    const fa = item && item.filterAttributes;
                    if (!fa || fa['data-cw-id'] !== cwId) continue;
                    const role = fa['data-cw-role'];
                    if (role === 'puzzle') {
                        fa['data-cw-state'] = serialized;
                        item.innerHTML = puzzleSvg.svgMarkup;
                    } else if (role === 'across') {
                        item.innerHTML = acrossHtml;
                    } else if (role === 'down') {
                        item.innerHTML = downHtml;
                    } else if (role === 'answer-key') {
                        fa['data-cw-state'] = serialized;
                        item.innerHTML = ansSvg.svgMarkup;
                    } else if (role === 'answer-across') {
                        item.innerHTML = ansAcrossHtml;
                    } else if (role === 'answer-down') {
                        item.innerHTML = ansDownHtml;
                    }
                }
            }
        }
    }

    function insertCrosswordPageObjects(cwId, layout, config, isAnswerKey) {
        const paperEl = document.getElementById('paper');
        const pw = paperEl ? (parseFloat(paperEl.style.width) || 794) : 794;
        const ph = paperEl ? (parseFloat(paperEl.style.height) || 1123) : 1123;
        const margin = 48;
        const usableW = Math.max(300, pw - margin * 2);
        const accent = config.accentColor || resolveThemeColor();
        const rawTitle = (config.title || 'Crossword Puzzle').trim() || 'Crossword Puzzle';
        const headingText = isAnswerKey ? `${rawTitle} - Answer Key` : rawTitle;
        const serialized = serializeCwState(cwId, layout, config);

        // 1. Editable Title
        const titleTop = 42;
        const titleH = 48;
        const titleEl = insertTextBoxElement(
            `<div contenteditable="true" spellcheck="false" style="width:100%; height:100%; box-sizing:border-box; padding:4px 8px; outline:none; text-align:center; font-family:${escapeXml(config.fontFamily || 'Segoe UI, sans-serif')}; font-size:26px; font-weight:800; color:${escapeXml(accent)}; letter-spacing:0.4px;">${escapeXml(headingText)}</div>`,
            margin,
            titleTop,
            usableW,
            titleH
        );
        if (titleEl) {
            titleEl.setAttribute('data-cw-id', cwId);
            titleEl.setAttribute('data-cw-role', isAnswerKey ? 'answer-title' : 'title');
        }

        // 2. Crossword Vector Grid
        const rendered = buildCrosswordSvg(layout, config, isAnswerKey);
        const cluesReserve = 340;
        const maxGridW = usableW;
        const maxGridH = Math.max(240, ph - (titleTop + titleH + 16) - margin - cluesReserve);
        const scale = Math.min(maxGridW / rendered.width, maxGridH / rendered.height, 1.35);
        const boxW = Math.round(rendered.width * scale);
        const boxH = Math.round(rendered.height * scale);
        const boxLeft = Math.round((pw - boxW) / 2);
        const boxTop = titleTop + titleH + 12;

        const gridWrapper = window.createWrapper(rendered.svgMarkup);
        gridWrapper.setAttribute('data-type', 'shape');
        gridWrapper.setAttribute('data-crossword', isAnswerKey ? 'answer-key' : 'puzzle');
        gridWrapper.setAttribute('data-cw-id', cwId);
        gridWrapper.setAttribute('data-cw-role', isAnswerKey ? 'answer-key' : 'puzzle');
        gridWrapper.setAttribute('data-cw-state', serialized);
        gridWrapper.setAttribute('data-aspect-lock', 'true');
        gridWrapper.setAttribute('data-aspect-ratio', String(rendered.width / rendered.height));
        gridWrapper.style.left = boxLeft + 'px';
        gridWrapper.style.top = boxTop + 'px';
        gridWrapper.style.width = boxW + 'px';
        gridWrapper.style.height = boxH + 'px';

        // 3. Two Linked Across & Down Clue Frames side-by-side below the grid
        const clueTop = boxTop + boxH + 16;
        const clueH = Math.max(180, ph - clueTop - margin);
        const colGap = 18;
        const colW = Math.round((usableW - colGap) / 2);

        const acrossFrame = insertTextBoxElement(
            buildCluesBoxInnerHtml(isAnswerKey ? 'Across Answers' : 'Across', layout.acrossClues, config, isAnswerKey),
            margin,
            clueTop,
            colW,
            clueH
        );
        if (acrossFrame) {
            acrossFrame.setAttribute('data-cw-id', cwId);
            acrossFrame.setAttribute('data-cw-role', isAnswerKey ? 'answer-across' : 'across');
        }

        const downFrame = insertTextBoxElement(
            buildCluesBoxInnerHtml(isAnswerKey ? 'Down Answers' : 'Down', layout.downClues, config, isAnswerKey),
            margin + colW + colGap,
            clueTop,
            colW,
            clueH
        );
        if (downFrame) {
            downFrame.setAttribute('data-cw-id', cwId);
            downFrame.setAttribute('data-cw-role', isAnswerKey ? 'answer-down' : 'down');
        }

        return gridWrapper;
    }

    function insertCrosswordIntoDocument(layout, config) {
        if (typeof state === 'undefined' || typeof window.createWrapper !== 'function') return;

        const cwId = 'cw-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1000);
        const startPageIdx = (typeof state.currentPageIndex === 'number') ? state.currentPageIndex : 0;
        const primaryEl = insertCrosswordPageObjects(cwId, layout, config, false);

        if (config.answerKeyOnPage2 && Array.isArray(state.pages)) {
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

            insertCrosswordPageObjects(cwId, layout, config, true);
            if (typeof serializeCurrentPage === 'function') {
                state.pages[targetIdx] = serializeCurrentPage();
            }

            if (typeof window.switchPage === 'function') {
                window.switchPage(startPageIdx);
            }
        }

        const primaryInDom = document.querySelector(`.pub-element[data-cw-id="${cwId}"][data-cw-role="puzzle"]`) || primaryEl;
        if (primaryInDom && document.contains(primaryInDom) && typeof window.selectElement === 'function') {
            window.selectElement(primaryInDom);
        }
        if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
        if (typeof window.updateSidebar === 'function') window.updateSidebar();
        if (typeof window.pushHistory === 'function') window.pushHistory();

        if (typeof showToast === 'function') {
            showToast(config.answerKeyOnPage2
                ? 'Crossword & Across/Down frames created! Answer Key generated on Page 2.'
                : 'Crossword & Across/Down clue frames inserted.');
        }
    }

    // --- Live Canvas Word Drag-to-Reposition Engine (dynamically updates Across/Down clue frames & Answer Key) ---
    function installCanvasWordDragHandler() {
        if (window._crosswordCanvasDragInstalled) return;
        window._crosswordCanvasDragInstalled = true;

        document.addEventListener('mousedown', function(e) {
            if (e.button !== 0 || e.shiftKey || e.ctrlKey || e.metaKey) return;
            const target = e.target;
            if (!target || !target.closest) return;

            const wordTarget = target.closest('.cw-word-drag-target[data-cw-word-idx]');
            if (!wordTarget) return;
            const gridWrapper = wordTarget.closest('.pub-element[data-crossword="puzzle"]');
            if (!gridWrapper || typeof state === 'undefined' || state.selectedEl !== gridWrapper) return;

            const rawState = gridWrapper.getAttribute('data-cw-state');
            if (!rawState) return;
            let parsedState;
            try { parsedState = JSON.parse(rawState); } catch (err) { return; }

            const wordIdx = parseInt(wordTarget.getAttribute('data-cw-word-idx'), 10);
            const cwId = parsedState.cwId || gridWrapper.getAttribute('data-cw-id');
            const currentLayout = recomputeCrosswordNumbersAndClues(
                parsedState.layout.placedWords,
                parsedState.layout.skippedWords,
                parsedState.layout
            );
            const movedWord = currentLayout.placedWords[wordIdx];
            if (!movedWord) return;

            const svg = gridWrapper.querySelector('svg');
            if (!svg) return;
            const svgRect = svg.getBoundingClientRect();
            const vb = svg.viewBox && svg.viewBox.baseVal;
            const vbW = (vb && vb.width) || (currentLayout.cols * 34 + 32);
            const vbH = (vb && vb.height) || (currentLayout.rows * 34 + 32);
            const scaleX = svgRect.width / vbW;
            const scaleY = svgRect.height / vbH;
            const cellSize = 34;
            const pad = 16;

            e.stopPropagation();
            e.preventDefault();

            const startX = e.clientX;
            const startY = e.clientY;
            const occ = buildOccupancyFromPlaced(currentLayout.placedWords, wordIdx);
            const ghostGroup = svg.querySelector('.cw-drag-ghost');
            let lastDr = 0;
            let lastDc = 0;
            let isValidDrop = false;

            const drawGhost = (dRow, dCol, valid) => {
                if (!ghostGroup) return;
                const candR = movedWord.r + dRow;
                const candC = movedWord.c + dCol;
                const gx = pad + candC * cellSize;
                const gy = pad + candR * cellSize;
                const gw = (movedWord.dir === 'across') ? (movedWord.word.length * cellSize) : cellSize;
                const gh = (movedWord.dir === 'down') ? (movedWord.word.length * cellSize) : cellSize;
                const colHex = valid ? '#10b981' : '#ef4444';
                ghostGroup.innerHTML = `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="${colHex}" fill-opacity="0.28" stroke="${colHex}" stroke-width="2.5" stroke-dasharray="4 2" />`;
            };

            const onMove = (me) => {
                const dxSvg = (me.clientX - startX) / Math.max(0.05, scaleX);
                const dySvg = (me.clientY - startY) / Math.max(0.05, scaleY);
                lastDc = Math.round(dxSvg / cellSize);
                lastDr = Math.round(dySvg / cellSize);
                const candR = movedWord.r + lastDr;
                const candC = movedWord.c + lastDc;
                const chk = evaluatePlacement(movedWord.word, candR, candC, movedWord.dir, occ, false);
                isValidDrop = chk.valid;
                drawGhost(lastDr, lastDc, isValidDrop);
            };

            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                if (ghostGroup) ghostGroup.innerHTML = '';

                if ((lastDr !== 0 || lastDc !== 0) && isValidDrop) {
                    const updatedWords = currentLayout.placedWords.map((w, idx) =>
                        idx === wordIdx ? { word: w.word, clue: w.clue, r: w.r + lastDr, c: w.c + lastDc, dir: w.dir } : w
                    );
                    const nextLayout = recomputeCrosswordNumbersAndClues(updatedWords, currentLayout.skippedWords, currentLayout);
                    syncLinkedClueFramesAndAnswerKey(cwId, nextLayout, parsedState.config);
                    if (typeof window.pushHistory === 'function') window.pushHistory();
                    if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
                    if (typeof showToast === 'function') showToast('Word repositioned & Across/Down clues updated!');
                }
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        }, true);
    }

    // --- Shared UI Helpers matching Word Search Studio ---
    function makeModalDraggable(boxEl, handleEl) {
        if (!boxEl || !handleEl) return () => {};
        let xOffset = 0, yOffset = 0;
        let initialX = 0, initialY = 0;
        let active = false;

        handleEl.style.cursor = 'grab';

        const onMouseMove = (e) => {
            if (!active) return;
            e.preventDefault();
            xOffset = e.clientX - initialX;
            yOffset = e.clientY - initialY;
            boxEl.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        };

        const onMouseUp = () => {
            if (!active) return;
            active = false;
            handleEl.style.cursor = 'grab';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        const onMouseDown = (e) => {
            if (e.button !== 0) return;
            if (e.target.closest('button, a, input, select, .cw-header-actions')) return;
            e.preventDefault();
            active = true;
            handleEl.style.cursor = 'grabbing';
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        handleEl.addEventListener('mousedown', onMouseDown);
        return () => {
            handleEl.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }

    function enhanceCrosswordSelects(overlay) {
        const selects = Array.from(overlay.querySelectorAll('select.cw-select'));
        if (!selects.length) return () => {};

        const openMenus = [];
        const closeAllMenus = () => {
            openMenus.forEach(entry => {
                entry.menu.style.display = 'none';
                entry.trigger.classList.remove('active');
            });
        };

        selects.forEach(sel => {
            const wrapper = document.createElement('div');
            wrapper.className = 'cw-select-wrap';
            wrapper.style.cssText = 'position:relative; width:100%;';

            const trigger = document.createElement('div');
            trigger.className = 'modern-select cw-modern-select';
            trigger.tabIndex = 0;
            trigger.setAttribute('role', 'combobox');
            trigger.setAttribute('aria-expanded', 'false');

            const labelSpan = document.createElement('span');
            labelSpan.className = 'cw-select-value';

            const arrowBox = document.createElement('div');
            arrowBox.className = 'arrow-box';
            arrowBox.innerHTML = '<i class="fas fa-chevron-down" style="font-size:10px;"></i>';

            trigger.appendChild(labelSpan);
            trigger.appendChild(arrowBox);

            const menu = document.createElement('div');
            menu.className = 'cw-select-menu';
            menu.style.display = 'none';

            const isFontSelect = sel.id === 'cw-font-family';

            const syncDisplay = () => {
                const chosen = sel.options[sel.selectedIndex] || sel.options[0];
                labelSpan.textContent = chosen ? chosen.text : '';
                if (isFontSelect && chosen) {
                    labelSpan.style.fontFamily = chosen.value;
                }
                Array.from(menu.children).forEach((item, idx) => {
                    item.classList.toggle('selected', idx === sel.selectedIndex);
                });
            };

            Array.from(sel.options).forEach((opt, idx) => {
                const item = document.createElement('div');
                item.className = 'cw-select-option';
                item.textContent = opt.text;
                item.dataset.value = opt.value;
                if (isFontSelect) item.style.fontFamily = opt.value;
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sel.selectedIndex = idx;
                    syncDisplay();
                    closeAllMenus();
                    trigger.setAttribute('aria-expanded', 'false');
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                });
                menu.appendChild(item);
            });

            const openMenu = (e) => {
                if (e) e.stopPropagation();
                const wasOpen = menu.style.display === 'block';
                closeAllMenus();
                if (wasOpen) {
                    trigger.setAttribute('aria-expanded', 'false');
                    return;
                }
                syncDisplay();
                const rect = trigger.getBoundingClientRect();
                menu.style.width = rect.width + 'px';
                menu.style.left = rect.left + 'px';
                menu.style.display = 'block';
                trigger.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');

                const menuH = Math.min(220, menu.scrollHeight || 160);
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                if (spaceBelow < menuH + 8 && spaceAbove > spaceBelow) {
                    menu.style.top = Math.max(8, rect.top - menuH - 3) + 'px';
                } else {
                    menu.style.top = Math.min(window.innerHeight - menuH - 8, rect.bottom + 3) + 'px';
                }
            };

            trigger.addEventListener('click', openMenu);
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openMenu(e);
                } else if (e.key === 'Escape') {
                    closeAllMenus();
                }
            });

            sel.addEventListener('change', syncDisplay);
            syncDisplay();

            sel.style.display = 'none';
            sel.parentNode.insertBefore(wrapper, sel.nextSibling);
            wrapper.appendChild(trigger);
            overlay.appendChild(menu);
            openMenus.push({ menu, trigger });
        });

        const onOutsideClick = (e) => {
            if (!e.target.closest('.cw-modern-select') && !e.target.closest('.cw-select-menu')) {
                closeAllMenus();
            }
        };
        const controlsPane = overlay.querySelector('.cw-controls');
        overlay.addEventListener('click', onOutsideClick);
        if (controlsPane) controlsPane.addEventListener('scroll', closeAllMenus);

        return closeAllMenus;
    }

    function openHelpModal(parentOverlay) {
        const existingHelp = document.getElementById('op-crossword-help-modal');
        if (existingHelp) existingHelp.remove();

        const topics = [
            {
                id: 'overview',
                title: 'Overview & Quick Start',
                body: `
                    <p><strong>Crossword &amp; Criss-Cross Builder</strong> arranges your <code>Word : Clue</code> pairs into the tightest valid intersecting grid across multiple layout seeds.</p>
                    <ul>
                        <li><strong>Enter Pairs:</strong> Type one entry per line as <code>WORD : Clue description</code> (also supports <code>=</code>, <code>|</code>, tabs, or <code> - </code>).</li>
                        <li><strong>Tightest Layout Solver:</strong> Choose Fast (8), Balanced (16), or Tightest (32) seeds to find the most compact intersection layout automatically, or click <em>Next Seed</em> to explore alternate arrangements.</li>
                        <li><strong>Insert:</strong> Click <em>Insert Crossword</em> to place the editable Title, Puzzle Grid, linked Across &amp; Down clue frames, and Page 2 Answer Key.</li>
                    </ul>
                `
            },
            {
                id: 'styles',
                title: 'Crossword vs Criss-Cross',
                body: `
                    <p>Switch effortlessly between classic framed newspaper crosswords and open criss-cross word grids.</p>
                    <ul>
                        <li><strong>Criss-Cross Freeform:</strong> Renders crisp bordered letter tiles only where letters appear, leaving open space transparent over your page background.</li>
                        <li><strong>Classic Crossword:</strong> Fills unused rectangular bounding cells with your chosen <em>Block</em> color to create a traditional blocked grid.</li>
                    </ul>
                `
            },
            {
                id: 'dragging',
                title: 'Manual Word Dragging & Clues',
                body: `
                    <p>Fine-tune any placed word position without breaking clue numbering or links.</p>
                    <ul>
                        <li><strong>Drag in Preview or Canvas:</strong> Grab any placed word in the live preview (or click the inserted Puzzle Grid on the canvas and drag any word directly) to move it to a valid cell. Green highlights confirm valid placement; red flags letter collisions or invalid adjacent tiles.</li>
                        <li><strong>Flip Across / Down:</strong> Select a word in the preview and click <em>Flip Direction</em> to rotate it cleanly when non-conflicting.</li>
                        <li><strong>Live Linked Clue Updates:</strong> Repositioning any word automatically renumbers start cells (#1, #2, #3...) top-to-bottom, left-to-right and updates both the <strong>Across</strong> and <strong>Down</strong> clue text frames plus Page 2 Answer Key.</li>
                    </ul>
                `
            },
            {
                id: 'colors',
                title: 'Colors & Font Styling',
                body: `
                    <p>Style grids and clue frames with one-click presets or Open Publisher's Custom Color Picker.</p>
                    <ul>
                        <li><strong>Color Presets:</strong> Try <em>Classic Teal</em>, <em>Classic Print</em>, <em>Ocean Blue</em>, <em>Warm Berry</em>, <em>Forest Mint</em>, or <em>Chalkboard</em>.</li>
                        <li><strong>Custom Swatches:</strong> Click <em>Accent</em>, <em>Letters</em>, <em>Cell Fill</em>, <em>Borders</em>, <em>Numbers</em>, or <em>Block</em> to customize exact Hex/RGB colors.</li>
                    </ul>
                `
            },
            {
                id: 'answer-key',
                title: 'Answer Key on Page 2',
                body: `
                    <p>Generate a complete solution page ready for answer booklets and handouts.</p>
                    <ul>
                        <li><strong>Checked by Default:</strong> Keeping <em>Generate Answer Key on Page 2</em> checked adds a second page containing the filled solution grid and answer-tagged Across &amp; Down reference frames.</li>
                        <li><strong>Synchronized Edits:</strong> Dragging words on Page 1 dynamically keeps Page 2's Answer Key grid and clues in sync.</li>
                    </ul>
                `
            }
        ];

        const helpOverlay = document.createElement('div');
        helpOverlay.id = 'op-crossword-help-modal';
        helpOverlay.className = 'cw-help-overlay';
        helpOverlay.innerHTML = `
            <style>
                .cw-help-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.14);
                    z-index: 1000030;
                    display: flex; align-items: center; justify-content: center;
                    padding: 16px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .cw-help-box {
                    width: 660px; max-width: 94vw; height: 470px; max-height: 86vh;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #1e293b);
                    border: 1px solid var(--ui-border, #94a3b8); border-radius: 8px;
                    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.28);
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .cw-help-header {
                    padding: 6px 8px 6px 14px;
                    background: linear-gradient(135deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #004a46));
                    color: #ffffff; display: flex; align-items: center; justify-content: space-between;
                    user-select: none; min-height: 44px; box-sizing: border-box;
                }
                .cw-help-toolbar {
                    display: flex; align-items: center; justify-content: space-between; gap: 8px;
                    padding: 6px 12px; background: var(--ui-surface-bg, #f1f4f6);
                    border-bottom: 1px solid var(--ui-border, #cbd5e1); font-size: 12px;
                }
                body.dark-mode .cw-help-toolbar { background: #1e293b; border-color: #334155; }
                .cw-help-nav-btns { display: flex; align-items: center; gap: 4px; }
                .cw-xp-tool-btn {
                    display: inline-flex; align-items: center; gap: 5px;
                    padding: 4px 10px; font-size: 11.5px; font-weight: 600;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-theme-dark, #004a46);
                    border: 1px solid var(--ui-border, #cbd5e1); border-radius: 4px; cursor: pointer;
                }
                .cw-xp-tool-btn:hover:not(:disabled) { border-color: var(--ui-theme-color, #007670); }
                .cw-xp-tool-btn:disabled { opacity: 0.45; cursor: default; }
                body.dark-mode .cw-xp-tool-btn { background: #0f172a; color: #e2e8f0; border-color: #475569; }
                .cw-help-split {
                    display: grid; grid-template-columns: 220px 1fr; flex: 1; min-height: 0; overflow: hidden;
                }
                .cw-help-toc {
                    background: var(--ui-surface-bg, #f4f6f8);
                    border-right: 1px solid var(--ui-border, #cbd5e1);
                    display: flex; flex-direction: column; min-height: 0;
                }
                body.dark-mode .cw-help-toc { background: #162030; border-color: #334155; }
                .cw-help-toc-tabs {
                    display: flex; padding: 6px 8px 0 8px;
                    border-bottom: 1px solid var(--ui-border, #cbd5e1);
                    background: rgba(0, 0, 0, 0.03);
                }
                .cw-help-toc-tab {
                    padding: 5px 12px; font-size: 11.5px; font-weight: 700;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-theme-dark, #004a46);
                    border: 1px solid var(--ui-border, #cbd5e1); border-bottom: none;
                    border-radius: 4px 4px 0 0; margin-bottom: -1px;
                }
                body.dark-mode .cw-help-toc-tab { background: #0f172a; color: #e2e8f0; border-color: #334155; }
                .cw-help-toc-list {
                    flex: 1; overflow-y: auto; padding: 8px 6px; display: flex; flex-direction: column; gap: 2px;
                }
                .cw-help-topic-btn {
                    width: 100%; text-align: left; padding: 7px 9px; border: none; border-radius: 4px;
                    background: transparent; color: var(--ui-text, #1e293b);
                    font-size: 12px; font-weight: 500; cursor: pointer;
                    display: flex; align-items: center; gap: 7px;
                }
                .cw-help-topic-btn:hover { background: rgba(0, 118, 112, 0.1); }
                .cw-help-topic-btn.active {
                    background: var(--ui-theme-color, #007670); color: #ffffff; font-weight: 600;
                }
                .cw-help-topic-btn i { font-size: 11px; width: 14px; text-align: center; opacity: 0.85; }
                .cw-help-content {
                    padding: 18px 22px; overflow-y: auto; background: var(--ui-panel-bg, #ffffff);
                }
                body.dark-mode .cw-help-content { background: #0f172a; color: #e2e8f0; }
                .cw-help-content h3 {
                    margin: 0 0 10px 0; padding-bottom: 8px;
                    font-size: 16px; font-weight: 700; color: var(--ui-theme-dark, #004a46);
                    border-bottom: 1px solid var(--ui-border, #e2e8f0);
                }
                body.dark-mode .cw-help-content h3 { color: #5eead4; border-color: #334155; }
                .cw-help-content p { margin: 0 0 10px 0; font-size: 12.8px; line-height: 1.5; }
                .cw-help-content ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 8px; font-size: 12.6px; line-height: 1.48; }
                .cw-help-content code { background: rgba(0, 118, 112, 0.1); padding: 1px 4px; border-radius: 3px; font-size: 11.5px; }
                .cw-help-footer {
                    padding: 9px 14px; border-top: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-surface-bg, #f1f4f6);
                    display: flex; align-items: center; justify-content: space-between;
                }
                body.dark-mode .cw-help-footer { background: #1e293b; border-color: #334155; }
            </style>
            <div class="cw-help-box" id="cw-help-box">
                <div class="cw-help-header" id="cw-help-header" title="Drag to move">
                    <div style="display:flex; align-items:center; gap:9px;">
                        <i class="fas fa-book-open" style="font-size:15px;"></i>
                        <span style="font-size:14.5px; font-weight:700;">Crossword &amp; Criss-Cross Builder Help</span>
                    </div>
                    <button type="button" class="custom-dialog-close" id="cw-help-close-x" title="Close" aria-label="Close" style="width:32px; height:32px; font-size:17px; border-radius:8px;"><i class="fas fa-times"></i></button>
                </div>
                <div class="cw-help-toolbar">
                    <div class="cw-help-nav-btns">
                        <button type="button" class="cw-xp-tool-btn" id="cw-help-back-btn" disabled><i class="fas fa-arrow-left"></i> Back</button>
                        <button type="button" class="cw-xp-tool-btn" id="cw-help-fwd-btn" disabled>Forward <i class="fas fa-arrow-right"></i></button>
                    </div>
                    <span id="cw-help-breadcrumb" style="opacity:0.75; font-size:11.5px; font-weight:600;">Contents &gt; Overview &amp; Quick Start</span>
                </div>
                <div class="cw-help-split">
                    <div class="cw-help-toc">
                        <div class="cw-help-toc-tabs"><span class="cw-help-toc-tab">Contents</span></div>
                        <div class="cw-help-toc-list">
                            ${topics.map((t, i) => `
                                <button type="button" class="cw-help-topic-btn${i === 0 ? ' active' : ''}" data-topic-id="${t.id}">
                                    <i class="far fa-file-alt"></i>
                                    <span>${escapeXml(t.title)}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="cw-help-content" id="cw-help-content"></div>
                </div>
                <div class="cw-help-footer">
                    <span style="font-size:11.5px; opacity:0.75;">Open Publisher Crossword &amp; Criss-Cross Guide</span>
                    <button type="button" class="btn-primary" id="cw-help-ok-btn" style="padding:6px 18px; border-radius:6px; font-size:12.5px; font-weight:600; cursor:pointer;">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(helpOverlay);

        const helpBox = helpOverlay.querySelector('#cw-help-box');
        const helpHeader = helpOverlay.querySelector('#cw-help-header');
        const contentPane = helpOverlay.querySelector('#cw-help-content');
        const breadcrumb = helpOverlay.querySelector('#cw-help-breadcrumb');
        const backBtn = helpOverlay.querySelector('#cw-help-back-btn');
        const fwdBtn = helpOverlay.querySelector('#cw-help-fwd-btn');
        const teardownDrag = makeModalDraggable(helpBox, helpHeader);

        const navHistory = [0];
        let navPos = 0;

        const renderTopic = (index, pushHist) => {
            const safeIdx = Math.max(0, Math.min(topics.length - 1, index));
            const topic = topics[safeIdx];
            if (pushHist && navHistory[navPos] !== safeIdx) {
                navHistory.splice(navPos + 1);
                navHistory.push(safeIdx);
                navPos = navHistory.length - 1;
            }
            contentPane.innerHTML = `<h3>${escapeXml(topic.title)}</h3>${topic.body}`;
            if (breadcrumb) breadcrumb.textContent = `Contents > ${topic.title}`;
            helpOverlay.querySelectorAll('.cw-help-topic-btn').forEach((btn, idx) => {
                btn.classList.toggle('active', idx === safeIdx);
            });
            backBtn.disabled = (navPos <= 0);
            fwdBtn.disabled = (navPos >= navHistory.length - 1);
        };

        helpOverlay.querySelectorAll('.cw-help-topic-btn').forEach((btn, idx) => {
            btn.addEventListener('click', () => renderTopic(idx, true));
        });
        backBtn.addEventListener('click', () => {
            if (navPos > 0) { navPos--; renderTopic(navHistory[navPos], false); }
        });
        fwdBtn.addEventListener('click', () => {
            if (navPos < navHistory.length - 1) { navPos++; renderTopic(navHistory[navPos], false); }
        });
        renderTopic(0, false);

        const closeHelp = () => {
            teardownDrag();
            helpOverlay.remove();
            if (parentOverlay && document.body.contains(parentOverlay)) parentOverlay.focus?.();
        };

        helpOverlay.querySelector('#cw-help-close-x').addEventListener('click', closeHelp);
        helpOverlay.querySelector('#cw-help-ok-btn').addEventListener('click', closeHelp);
        helpOverlay.addEventListener('mousedown', (e) => {
            if (e.target === helpOverlay) closeHelp();
        });
    }

    function showModal() {
        installCanvasWordDragHandler();
        const existing = document.getElementById('op-crossword-modal');
        if (existing) existing.remove();
        const existingHelp = document.getElementById('op-crossword-help-modal');
        if (existingHelp) existingHelp.remove();

        const themeColor = resolveThemeColor();
        const modalState = {
            title: 'Crossword Puzzle',
            pairsText: DEFAULT_WORD_CLUES,
            styleMode: 'crisscross',
            seedCount: 16,
            baseSeed: 104729,
            fontFamily: 'Segoe UI, Arial, sans-serif',
            accentColor: themeColor,
            letterColor: '#0f172a',
            cellBgColor: '#ffffff',
            borderColor: '#334155',
            numberColor: themeColor,
            blockColor: '#0f172a',
            answerKeyOnPage2: true,
            previewMode: 'puzzle',
            selectedWordIdx: -1,
            layout: null
        };

        modalState.layout = generateCrosswordLayout(modalState.pairsText, {
            seedCount: modalState.seedCount,
            baseSeed: modalState.baseSeed
        });

        const overlay = document.createElement('div');
        overlay.id = 'op-crossword-modal';
        overlay.className = 'cw-modal-overlay';

        const presetButtonsHtml = Object.keys(COLOR_PRESETS).map(key => {
            const p = COLOR_PRESETS[key];
            return `<button type="button" class="cw-color-preset-btn" data-color-preset="${key}" title="${escapeXml(p.label)}">
                <span class="cw-preset-dots"><i style="background:${p.cellBg}; border-color:${p.border};"></i><i style="background:${p.accent};"></i></span>
                <span>${escapeXml(p.label)}</span>
            </button>`;
        }).join('');

        overlay.innerHTML = `
            <style>
                .cw-modal-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.14);
                    z-index: 1000010;
                    display: flex; align-items: center; justify-content: center;
                    padding: 16px; box-sizing: border-box; font-family: 'Segoe UI', system-ui, sans-serif;
                }
                .cw-modal-box {
                    width: 1020px; max-width: 96vw; max-height: 92vh;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #0f172a);
                    border: 1px solid var(--ui-border, #cbd5e1); border-radius: 12px;
                    box-shadow: 0 24px 60px rgba(0,0,0,0.32);
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .cw-modal-header {
                    padding: 10px 14px 10px 20px; background: linear-gradient(135deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #004a46));
                    color: #ffffff; display: flex; align-items: center; justify-content: space-between;
                    user-select: none;
                }
                .cw-header-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
                .cw-header-actions .custom-dialog-close { width: 34px; height: 34px; font-size: 17px; border-radius: 8px; }
                .cw-help-icon-btn:hover { background: rgba(255, 255, 255, 0.25) !important; }
                .cw-modal-body {
                    display: grid; grid-template-columns: 400px 1fr; gap: 18px;
                    padding: 16px 20px; overflow-y: auto; flex: 1; min-height: 0;
                }
                .cw-controls { display: flex; flex-direction: column; gap: 11px; overflow-y: auto; padding-right: 4px; }
                .cw-field-label { display: block; font-size: 11.5px; font-weight: 700; margin-bottom: 4px; opacity: 0.88; }
                .cw-input, .cw-textarea {
                    width: 100%; box-sizing: border-box; padding: 7px 9px; font-size: 12.5px;
                    border: 1px solid var(--ui-border, #cbd5e1); border-radius: 6px;
                    background: var(--ui-surface-bg, #ffffff); color: var(--ui-text, #0f172a);
                    font-family: inherit;
                }
                .cw-textarea { resize: vertical; min-height: 148px; font-family: monospace; line-height: 1.38; font-size: 12px; }
                .cw-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .cw-check-label { display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; font-size: 12px; }
                .cw-check-label input { accent-color: var(--ui-theme-color, #007670); cursor: pointer; }
                .cw-modern-select {
                    width: 100%; height: 30px !important; box-sizing: border-box;
                    border: 1px solid #cbd5e1 !important; border-radius: 5px !important;
                    background: #ffffff !important; font-size: 12.5px !important;
                }
                .cw-modern-select span { padding: 0 9px !important; font-weight: 500 !important; color: var(--ui-theme-dark, #007670) !important; }
                .cw-modern-select .arrow-box { width: 26px !important; background: var(--ui-theme-dark, #007670) !important; color: #ffffff !important; border-radius: 0 4px 4px 0 !important; }
                .cw-modern-select:hover, .cw-modern-select.active { border-color: var(--ui-theme-dark, #007670) !important; }
                body.dark-mode .cw-modern-select { background: #1e293b !important; border-color: #475569 !important; }
                body.dark-mode .cw-modern-select span { color: #f1f5f9 !important; }
                .cw-select-menu {
                    position: fixed; z-index: 1000025; background: #ffffff;
                    border: 1px solid var(--ui-theme-dark, #007670); border-radius: 6px;
                    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.22); max-height: 220px; overflow-y: auto; padding: 3px 0; box-sizing: border-box;
                }
                body.dark-mode .cw-select-menu { background: #1e293b; border-color: #0d9488; }
                .cw-select-option { padding: 7px 10px; font-size: 12.5px; font-weight: 500; color: var(--ui-theme-dark, #007670); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .cw-select-option:hover, .cw-select-option.selected { background: rgba(0, 118, 112, 0.13); }
                body.dark-mode .cw-select-option { color: #e2e8f0; }
                body.dark-mode .cw-select-option:hover, body.dark-mode .cw-select-option.selected { background: rgba(20, 184, 166, 0.22); }
                .cw-color-section { border-top: 1px solid var(--ui-border, #e2e8f0); padding-top: 10px; display: flex; flex-direction: column; gap: 8px; }
                .cw-color-presets { display: flex; flex-wrap: wrap; gap: 5px; }
                .cw-color-preset-btn {
                    display: inline-flex; align-items: center; gap: 5px; padding: 4px 8px; font-size: 11px; font-weight: 600;
                    border-radius: 5px; border: 1px solid var(--ui-border, #cbd5e1); background: var(--ui-panel-bg, #fff);
                    color: var(--ui-text, #334155); cursor: pointer;
                }
                .cw-color-preset-btn:hover { border-color: var(--ui-theme-color, #007670); color: var(--ui-theme-color, #007670); }
                .cw-preset-dots { display: inline-flex; align-items: center; gap: 2px; }
                .cw-preset-dots i { width: 9px; height: 9px; border-radius: 50%; display: inline-block; border: 1px solid rgba(0,0,0,0.2); }
                .cw-color-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px 8px; }
                .cw-color-chip {
                    display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 5px 7px;
                    border: 1px solid var(--ui-border, #cbd5e1); border-radius: 6px; background: var(--ui-surface-bg, #ffffff);
                    color: var(--ui-text, #0f172a); font-size: 11px; font-weight: 600; font-family: inherit; cursor: pointer;
                }
                .cw-color-chip:hover { border-color: var(--ui-theme-color, #007670); }
                .cw-swatch-box { width: 22px; height: 18px; border-radius: 4px; flex-shrink: 0; border: 1px solid rgba(0, 0, 0, 0.25); display: inline-block; }
                .cw-preview-pane {
                    display: flex; flex-direction: column; border: 1px solid var(--ui-border, #cbd5e1);
                    border-radius: 10px; background: #f8fafc; overflow: hidden; min-height: 480px;
                }
                body.dark-mode .cw-preview-pane { background: #1e293b; }
                .cw-preview-toolbar {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 9px 14px; border-bottom: 1px solid var(--ui-border, #e2e8f0);
                    background: var(--ui-panel-bg, #ffffff); gap: 8px; flex-wrap: wrap;
                }
                .cw-preview-tabs { display: flex; gap: 6px; }
                .cw-ptab {
                    padding: 5px 11px; font-size: 12px; font-weight: 600; border-radius: 6px;
                    border: 1px solid var(--ui-border, #cbd5e1); background: transparent;
                    color: var(--ui-text, #475569); cursor: pointer;
                }
                .cw-ptab.active { background: var(--ui-theme-color, #007670); border-color: var(--ui-theme-color, #007670); color: #ffffff; }
                .cw-mini-btn {
                    padding: 5px 9px; font-size: 11px; font-weight: 600; border-radius: 5px;
                    border: 1px solid var(--ui-border, #cbd5e1); background: var(--ui-panel-bg, #fff);
                    color: var(--ui-text, #334155); cursor: pointer;
                }
                .cw-mini-btn:hover:not(:disabled) { border-color: var(--ui-theme-color, #007670); color: var(--ui-theme-color, #007670); }
                .cw-mini-btn:disabled { opacity: 0.45; cursor: default; }
                .cw-preview-split {
                    flex: 1; display: flex; flex-direction: column; padding: 12px; gap: 10px; overflow-y: auto; min-height: 0;
                }
                .cw-preview-canvas {
                    display: flex; align-items: center; justify-content: center; min-height: 270px;
                }
                #cw-preview-svg-host {
                    width: 100%; max-width: 440px; max-height: 310px; background: #ffffff; border-radius: 8px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.08); padding: 8px; box-sizing: border-box;
                    display: flex; align-items: center; justify-content: center;
                }
                .cw-clues-preview {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
                    background: var(--ui-panel-bg, #ffffff); border: 1px solid var(--ui-border, #e2e8f0);
                    border-radius: 8px; padding: 9px 12px; max-height: 155px; overflow-y: auto; font-size: 11.5px;
                }
                .cw-clues-col h5 {
                    margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px;
                    color: var(--ui-theme-color, #007670); border-bottom: 1px solid var(--ui-border, #e2e8f0); padding-bottom: 3px;
                }
                .cw-clues-col div { line-height: 1.38; margin-bottom: 2px; }
                .cw-status-bar {
                    padding: 8px 14px; font-size: 12px; border-top: 1px solid var(--ui-border, #e2e8f0);
                    background: var(--ui-panel-bg, #ffffff); display: flex; justify-content: space-between; align-items: center; gap: 8px;
                }
                .cw-modal-footer {
                    padding: 12px 20px; border-top: 1px solid var(--ui-border, #e2e8f0);
                    display: flex; align-items: center; justify-content: space-between; gap: 10px;
                    background: var(--ui-panel-bg, #ffffff);
                }
                @media (max-width: 860px) {
                    .cw-modal-body { grid-template-columns: 1fr; }
                }
            </style>
            <div class="cw-modal-box" id="cw-modal-box">
                <div class="cw-modal-header" id="cw-modal-header" title="Drag to move">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-th" style="font-size:17px;"></i>
                        <div>
                            <div style="font-size:15px; font-weight:700;">Crossword &amp; Criss-Cross Builder</div>
                            <div style="font-size:11px; opacity:0.88;">Tightest multi-seed intersection layout, draggable words, linked Across/Down clues &amp; Page 2 Answer Key</div>
                        </div>
                    </div>
                    <div class="cw-header-actions">
                        <button type="button" class="custom-dialog-close cw-help-icon-btn" id="cw-help-btn" title="Help" aria-label="Help"><i class="fas fa-question"></i></button>
                        <button type="button" class="custom-dialog-close" id="cw-close-x" title="Close" aria-label="Close"><i class="fas fa-times"></i></button>
                    </div>
                </div>

                <div class="cw-modal-body">
                    <div class="cw-controls">
                        <div>
                            <label class="cw-field-label" for="cw-title">Puzzle Title</label>
                            <input type="text" id="cw-title" class="cw-input" value="${escapeXml(modalState.title)}">
                        </div>

                        <div>
                            <label class="cw-field-label" for="cw-pairs">Word : Clue Pairs (one per line)</label>
                            <textarea id="cw-pairs" class="cw-textarea">${escapeXml(modalState.pairsText)}</textarea>
                        </div>

                        <div class="cw-row-2">
                            <div>
                                <label class="cw-field-label" for="cw-style-mode">Grid Style</label>
                                <select id="cw-style-mode" class="cw-select">
                                    <option value="crisscross">Criss-Cross Freeform</option>
                                    <option value="crossword">Classic Crossword Block</option>
                                </select>
                            </div>
                            <div>
                                <label class="cw-field-label" for="cw-seed-count">Layout Seed Search</label>
                                <select id="cw-seed-count" class="cw-select">
                                    <option value="8">Fast (8 Seeds)</option>
                                    <option value="16" selected>Balanced (16 Seeds)</option>
                                    <option value="32">Tightest (32 Seeds)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="cw-field-label" for="cw-font-family">Letter &amp; Clue Font</label>
                            <select id="cw-font-family" class="cw-select">
                                <option value="Segoe UI, Arial, sans-serif">Segoe UI (Clean)</option>
                                <option value="Courier New, monospace">Courier New (Mono)</option>
                                <option value="Arial, sans-serif">Arial</option>
                                <option value="Georgia, serif">Georgia (Serif)</option>
                                <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                            </select>
                        </div>

                        <div class="cw-color-section">
                            <div style="display:flex; align-items:center; justify-content:space-between;">
                                <label class="cw-field-label" style="margin:0;">Colors &amp; Palette</label>
                                <span style="font-size:10.5px; opacity:0.7;">Presets or custom swatches</span>
                            </div>
                            <div class="cw-color-presets" id="cw-color-presets">
                                ${presetButtonsHtml}
                            </div>
                            <div class="cw-color-grid">
                                <button type="button" class="cw-color-chip" data-color-target="cw-accent-color" title="Title &amp; clue box headings">
                                    <span>Accent</span>
                                    <span class="cw-swatch-box" data-swatch-for="cw-accent-color" style="background:${escapeXml(normalizeHexColor(modalState.accentColor, '#007670'))};"></span>
                                    <input type="hidden" id="cw-accent-color" value="${escapeXml(normalizeHexColor(modalState.accentColor, '#007670'))}">
                                </button>
                                <button type="button" class="cw-color-chip" data-color-target="cw-letter-color" title="Solution letters &amp; clue text">
                                    <span>Letters</span>
                                    <span class="cw-swatch-box" data-swatch-for="cw-letter-color" style="background:${escapeXml(modalState.letterColor)};"></span>
                                    <input type="hidden" id="cw-letter-color" value="${escapeXml(modalState.letterColor)}">
                                </button>
                                <button type="button" class="cw-color-chip" data-color-target="cw-cell-bg-color" title="Letter tile background color">
                                    <span>Cell Fill</span>
                                    <span class="cw-swatch-box" data-swatch-for="cw-cell-bg-color" style="background:${escapeXml(modalState.cellBgColor)};"></span>
                                    <input type="hidden" id="cw-cell-bg-color" value="${escapeXml(modalState.cellBgColor)}">
                                </button>
                                <button type="button" class="cw-color-chip" data-color-target="cw-border-color" title="Tile border &amp; clue frame stroke">
                                    <span>Borders</span>
                                    <span class="cw-swatch-box" data-swatch-for="cw-border-color" style="background:${escapeXml(modalState.borderColor)};"></span>
                                    <input type="hidden" id="cw-border-color" value="${escapeXml(modalState.borderColor)}">
                                </button>
                                <button type="button" class="cw-color-chip" data-color-target="cw-number-color" title="Starting clue numbers inside cells">
                                    <span>Numbers</span>
                                    <span class="cw-swatch-box" data-swatch-for="cw-number-color" style="background:${escapeXml(normalizeHexColor(modalState.numberColor, '#007670'))};"></span>
                                    <input type="hidden" id="cw-number-color" value="${escapeXml(normalizeHexColor(modalState.numberColor, '#007670'))}">
                                </button>
                                <button type="button" class="cw-color-chip" data-color-target="cw-block-color" title="Blocked empty square fill in Classic Crossword mode">
                                    <span>Block</span>
                                    <span class="cw-swatch-box" data-swatch-for="cw-block-color" style="background:${escapeXml(modalState.blockColor)};"></span>
                                    <input type="hidden" id="cw-block-color" value="${escapeXml(modalState.blockColor)}">
                                </button>
                            </div>
                        </div>

                        <div style="border-top:1px solid var(--ui-border, #e2e8f0); padding-top:10px;">
                            <label class="cw-check-label" style="font-weight:700;">
                                <input type="checkbox" id="cw-answer-page2" checked>
                                Generate Answer Key on Page 2
                            </label>
                        </div>
                    </div>

                    <div class="cw-preview-pane">
                        <div class="cw-preview-toolbar">
                            <div class="cw-preview-tabs">
                                <button type="button" class="cw-ptab active" id="cw-ptab-puzzle">Puzzle (Drag Words)</button>
                                <button type="button" class="cw-ptab" id="cw-ptab-answer">Answer Key</button>
                            </div>
                            <div style="display:flex; gap:6px; align-items:center;">
                                <button type="button" class="cw-mini-btn" id="cw-flip-word-btn" disabled title="Flip selected word between Across and Down"><i class="fas fa-sync-alt" style="margin-right:4px;"></i>Flip Dir</button>
                                <button type="button" class="cw-mini-btn" id="cw-shuffle-btn" title="Try a new multi-seed batch"><i class="fas fa-random" style="margin-right:4px;"></i>Next Seed</button>
                            </div>
                        </div>
                        <div class="cw-preview-split">
                            <div class="cw-preview-canvas">
                                <div id="cw-preview-svg-host"></div>
                            </div>
                            <div class="cw-clues-preview" id="cw-clues-preview"></div>
                        </div>
                        <div class="cw-status-bar">
                            <span id="cw-status-text">Ready</span>
                            <span id="cw-grid-meta" style="opacity:0.75;"></span>
                        </div>
                    </div>
                </div>

                <div class="cw-modal-footer">
                    <div style="font-size:11.5px; opacity:0.75;">Drag any word on the grid (preview or canvas) to adjust &amp; dynamically update Across/Down clues.</div>
                    <div style="display:flex; gap:10px;">
                        <button type="button" class="btn-secondary" id="cw-cancel-btn">Cancel</button>
                        <button type="button" class="btn-primary" id="cw-insert-btn"><i class="fas fa-plus" style="margin-right:6px;"></i>Insert Crossword</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const modalBox = overlay.querySelector('#cw-modal-box');
        const modalHeader = overlay.querySelector('#cw-modal-header');
        const teardownMainDrag = makeModalDraggable(modalBox, modalHeader);
        const closeSelectMenus = enhanceCrosswordSelects(overlay);

        const syncColorSwatches = () => {
            overlay.querySelectorAll('.cw-swatch-box[data-swatch-for]').forEach(box => {
                const targetId = box.getAttribute('data-swatch-for');
                const inputEl = targetId ? overlay.querySelector('#' + targetId) : null;
                if (inputEl && inputEl.value) box.style.backgroundColor = inputEl.value;
            });
        };

        const renderCluesPreview = () => {
            const box = overlay.querySelector('#cw-clues-preview');
            const lay = modalState.layout;
            if (!box || !lay) return;
            const showAns = modalState.previewMode === 'answer';
            const fmtClues = (list) => list.length
                ? list.map(c => `<div><strong>${c.number}.</strong> ${escapeXml(c.clue)}${showAns ? ` <em>(${escapeXml(c.word)})</em>` : ''}</div>`).join('')
                : '<div style="opacity:0.6;">None</div>';

            box.innerHTML = `
                <div class="cw-clues-col">
                    <h5>Across (${lay.acrossClues.length})</h5>
                    ${fmtClues(lay.acrossClues)}
                </div>
                <div class="cw-clues-col">
                    <h5>Down (${lay.downClues.length})</h5>
                    ${fmtClues(lay.downClues)}
                </div>
            `;
        };

        const renderPreviewOnly = () => {
            const host = overlay.querySelector('#cw-preview-svg-host');
            const lay = modalState.layout;
            if (!host || !lay) return;
            const isAns = modalState.previewMode === 'answer';
            const renderOpts = Object.assign({}, modalState, {
                previewMarginCells: isAns ? 0 : 1
            });
            const svgInfo = buildCrosswordSvg(lay, renderOpts, isAns);
            host.innerHTML = svgInfo.svgMarkup;

            const aspect = svgInfo.width / svgInfo.height;
            host.style.aspectRatio = String(aspect);

            const statusEl = overlay.querySelector('#cw-status-text');
            const metaEl = overlay.querySelector('#cw-grid-meta');
            const flipBtn = overlay.querySelector('#cw-flip-word-btn');

            if (flipBtn) {
                flipBtn.disabled = !(modalState.selectedWordIdx >= 0 && modalState.selectedWordIdx < lay.placedWords.length && !isAns);
            }
            if (statusEl) {
                if (lay.skippedWords.length > 0) {
                    statusEl.style.color = '#d97706';
                    statusEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Placed ${lay.placedWords.length}/${lay.placedWords.length + lay.skippedWords.length} words (${lay.intersections} intersections)`;
                } else {
                    statusEl.style.color = '#059669';
                    statusEl.innerHTML = `<i class="fas fa-check-circle"></i> Placed all ${lay.placedWords.length} words (${lay.intersections} intersections)`;
                }
            }
            if (metaEl) {
                metaEl.textContent = `${lay.cols}x${lay.rows} grid | Tightest of ${lay.seedsTested} seeds`;
            }

            renderCluesPreview();

            // Attach interactive drag listeners inside Preview SVG
            if (!isAns) {
                const svgEl = host.querySelector('svg');
                const ghostGroup = svgEl && svgEl.querySelector('.cw-drag-ghost');
                if (svgEl) {
                    svgEl.querySelectorAll('.cw-word-drag-target[data-cw-word-idx]').forEach(rectEl => {
                        rectEl.addEventListener('mousedown', (e) => {
                            if (e.button !== 0) return;
                            e.stopPropagation();
                            e.preventDefault();
                            const wIdx = parseInt(rectEl.getAttribute('data-cw-word-idx'), 10);
                            modalState.selectedWordIdx = wIdx;
                            const w = lay.placedWords[wIdx];
                            if (!w) return;

                            const svgRect = svgEl.getBoundingClientRect();
                            const scaleX = svgRect.width / svgInfo.width;
                            const scaleY = svgRect.height / svgInfo.height;
                            const occ = buildOccupancyFromPlaced(lay.placedWords, wIdx);
                            const startX = e.clientX;
                            const startY = e.clientY;
                            let dRow = 0;
                            let dCol = 0;
                            let validDrop = true;

                            const onMove = (me) => {
                                dCol = Math.round(((me.clientX - startX) / Math.max(0.05, scaleX)) / svgInfo.cellSize);
                                dRow = Math.round(((me.clientY - startY) / Math.max(0.05, scaleY)) / svgInfo.cellSize);
                                const candR = w.r + dRow;
                                const candC = w.c + dCol;
                                const chk = evaluatePlacement(w.word, candR, candC, w.dir, occ, false);
                                validDrop = chk.valid;
                                if (ghostGroup) {
                                    const gx = svgInfo.pad + (candC + svgInfo.marginCells) * svgInfo.cellSize;
                                    const gy = svgInfo.pad + (candR + svgInfo.marginCells) * svgInfo.cellSize;
                                    const gw = (w.dir === 'across') ? (w.word.length * svgInfo.cellSize) : svgInfo.cellSize;
                                    const gh = (w.dir === 'down') ? (w.word.length * svgInfo.cellSize) : svgInfo.cellSize;
                                    const colHex = validDrop ? '#10b981' : '#ef4444';
                                    ghostGroup.innerHTML = `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="${colHex}" fill-opacity="0.28" stroke="${colHex}" stroke-width="2.5" stroke-dasharray="4 2" />`;
                                }
                            };

                            const onUp = () => {
                                document.removeEventListener('mousemove', onMove);
                                document.removeEventListener('mouseup', onUp);
                                if (ghostGroup) ghostGroup.innerHTML = '';

                                if ((dRow !== 0 || dCol !== 0) && validDrop) {
                                    const updated = lay.placedWords.map((item, idx) =>
                                        idx === wIdx ? { word: item.word, clue: item.clue, r: item.r + dRow, c: item.c + dCol, dir: item.dir } : item
                                    );
                                    modalState.layout = recomputeCrosswordNumbersAndClues(updated, lay.skippedWords, lay);
                                }
                                renderPreviewOnly();
                            };

                            document.addEventListener('mousemove', onMove);
                            document.addEventListener('mouseup', onUp);
                        });
                    });
                }
            }
        };

        const syncAndRegenerate = (onlyVisual) => {
            modalState.title = overlay.querySelector('#cw-title').value;
            modalState.pairsText = overlay.querySelector('#cw-pairs').value;
            modalState.styleMode = overlay.querySelector('#cw-style-mode').value;
            modalState.seedCount = parseInt(overlay.querySelector('#cw-seed-count').value, 10) || 16;
            modalState.fontFamily = overlay.querySelector('#cw-font-family').value;
            modalState.accentColor = overlay.querySelector('#cw-accent-color').value || themeColor;
            modalState.letterColor = overlay.querySelector('#cw-letter-color').value || '#0f172a';
            modalState.cellBgColor = overlay.querySelector('#cw-cell-bg-color').value || '#ffffff';
            modalState.borderColor = overlay.querySelector('#cw-border-color').value || '#334155';
            modalState.numberColor = overlay.querySelector('#cw-number-color').value || themeColor;
            modalState.blockColor = overlay.querySelector('#cw-block-color').value || '#0f172a';
            modalState.answerKeyOnPage2 = overlay.querySelector('#cw-answer-page2').checked;

            if (!onlyVisual || !modalState.layout) {
                modalState.selectedWordIdx = -1;
                modalState.layout = generateCrosswordLayout(modalState.pairsText, {
                    seedCount: modalState.seedCount,
                    baseSeed: modalState.baseSeed
                });
            }
            renderPreviewOnly();
        };

        // CustomColorPicker swatches
        overlay.querySelectorAll('.cw-color-chip[data-color-target]').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                closeSelectMenus();
                const targetId = chip.getAttribute('data-color-target');
                const inputEl = targetId ? overlay.querySelector('#' + targetId) : null;
                const swatchBox = chip.querySelector('.cw-swatch-box') || chip;
                if (!inputEl) return;

                if (window.CustomColorPicker && typeof window.CustomColorPicker.open === 'function') {
                    window.CustomColorPicker.open(chip, inputEl.value, (chosen) => {
                        inputEl.value = normalizeHexColor(chosen, '#007670');
                        if (swatchBox) swatchBox.style.backgroundColor = inputEl.value;
                        syncAndRegenerate(true);
                    });
                }
            });
        });

        overlay.querySelectorAll('[data-color-preset]').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = COLOR_PRESETS[btn.getAttribute('data-color-preset')];
                if (!preset) return;
                overlay.querySelector('#cw-accent-color').value = preset.accent;
                overlay.querySelector('#cw-letter-color').value = preset.letter;
                overlay.querySelector('#cw-cell-bg-color').value = preset.cellBg;
                overlay.querySelector('#cw-border-color').value = preset.border;
                overlay.querySelector('#cw-number-color').value = preset.number;
                overlay.querySelector('#cw-block-color').value = preset.block;
                syncColorSwatches();
                syncAndRegenerate(true);
            });
        });

        ['#cw-title', '#cw-accent-color', '#cw-letter-color', '#cw-cell-bg-color', '#cw-border-color', '#cw-number-color', '#cw-block-color'].forEach(sel => {
            const el = overlay.querySelector(sel);
            if (el) el.addEventListener('input', () => { syncColorSwatches(); syncAndRegenerate(true); });
        });
        overlay.querySelector('#cw-pairs').addEventListener('input', () => syncAndRegenerate(false));
        overlay.querySelector('#cw-seed-count').addEventListener('change', () => syncAndRegenerate(false));
        ['#cw-style-mode', '#cw-font-family', '#cw-answer-page2'].forEach(sel => {
            const el = overlay.querySelector(sel);
            if (el) el.addEventListener('change', () => syncAndRegenerate(true));
        });

        // Preview tabs, flip word direction, and shuffle seeds
        const ptabPuzzle = overlay.querySelector('#cw-ptab-puzzle');
        const ptabAnswer = overlay.querySelector('#cw-ptab-answer');
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
        overlay.querySelector('#cw-shuffle-btn').addEventListener('click', () => {
            modalState.baseSeed = (modalState.baseSeed + 7919) >>> 0;
            syncAndRegenerate(false);
        });
        overlay.querySelector('#cw-flip-word-btn').addEventListener('click', () => {
            const lay = modalState.layout;
            const idx = modalState.selectedWordIdx;
            if (!lay || idx < 0 || idx >= lay.placedWords.length) return;
            const w = lay.placedWords[idx];
            const nextDir = (w.dir === 'across') ? 'down' : 'across';
            const occ = buildOccupancyFromPlaced(lay.placedWords, idx);
            const chk = evaluatePlacement(w.word, w.r, w.c, nextDir, occ, false);
            if (chk.valid) {
                const updated = lay.placedWords.map((item, wi) => wi === idx ? { word: item.word, clue: item.clue, r: item.r, c: item.c, dir: nextDir } : item);
                modalState.layout = recomputeCrosswordNumbersAndClues(updated, lay.skippedWords, lay);
                renderPreviewOnly();
            } else if (typeof showToast === 'function') {
                showToast('Cannot flip direction here without overlapping another word.');
            }
        });

        overlay.querySelector('#cw-help-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            closeSelectMenus();
            openHelpModal(overlay);
        });

        let onKeyDown = null;
        const closeModal = () => {
            teardownMainDrag();
            closeSelectMenus();
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen && typeof window.CustomColorPicker.close === 'function') {
                window.CustomColorPicker.close();
            }
            if (onKeyDown) document.removeEventListener('keydown', onKeyDown);
            const openHelp = document.getElementById('op-crossword-help-modal');
            if (openHelp) openHelp.remove();
            overlay.remove();
        };
        onKeyDown = (e) => {
            if (e.key !== 'Escape') return;
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen && typeof window.CustomColorPicker.close === 'function') {
                window.CustomColorPicker.close();
                return;
            }
            const openHelp = document.getElementById('op-crossword-help-modal');
            if (openHelp) openHelp.remove();
            else closeModal();
        };
        document.addEventListener('keydown', onKeyDown);

        overlay.querySelector('#cw-close-x').addEventListener('click', closeModal);
        overlay.querySelector('#cw-cancel-btn').addEventListener('click', closeModal);
        overlay.addEventListener('mousedown', (e) => {
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen) return;
            if (e.target === overlay) closeModal();
        });
        overlay.querySelector('#cw-insert-btn').addEventListener('click', () => {
            const layoutToInsert = modalState.layout;
            const cfgCopy = Object.assign({}, modalState);
            closeModal();
            insertCrosswordIntoDocument(layoutToInsert, cfgCopy);
        });

        renderPreviewOnly();
    }

    // Install canvas word drag listener once module loads (supports opened/restored documents)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', installCanvasWordDragHandler);
    } else {
        installCanvasWordDragHandler();
    }

    window.CrosswordStudio = {
        showModal,
        parseWordCluePairs,
        generateCrosswordLayout,
        recomputeCrosswordNumbersAndClues,
        buildCrosswordSvg,
        syncLinkedClueFramesAndAnswerKey
    };
})(window);
