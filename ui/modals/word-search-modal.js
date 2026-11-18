// Open Publisher Word Search Studio Engine (v5.22.0)
// Supports rectangular & vector-masked grids (Star, Heart, Circle, Custom Polygon),
// toggleable diagonal/backward placement, custom filler alphabets & hidden secret messages,
// stylized vector loop highlights, and automatic Page 2 Answer Key generation.

(function(window) {
    'use strict';

    const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const DEFAULT_WORDS = [
        'PUBLISHER',
        'DESIGN',
        'VECTOR',
        'PUZZLE',
        'LAYOUT',
        'GRAPHICS',
        'CREATIVE',
        'STUDIO',
        'CANVAS',
        'PRINT'
    ].join('\n');

    const LOOP_PALETTE = [
        '#0f766e', '#dc2626', '#2563eb', '#d97706', '#7c3aed',
        '#059669', '#db2777', '#0891b2', '#ea580c', '#4f46e5'
    ];

    const POLYGON_PRESETS = {
        triangle: [[50, 8], [92, 88], [8, 88]],
        hexagon: [[50, 6], [89, 28], [89, 72], [50, 94], [11, 72], [11, 28]],
        diamond: [[50, 5], [95, 50], [50, 95], [5, 50]],
        arrow: [[10, 34], [58, 34], [58, 12], [94, 50], [58, 88], [58, 66], [10, 66]]
    };

    const COLOR_PRESETS = {
        teal: { label: 'Classic Teal', accent: '#0f766e', letter: '#0f172a', cellBg: '#ffffff', grid: '#cbd5e1', outline: '#0f766e', loop: '#0f766e' },
        ocean: { label: 'Ocean Blue', accent: '#0369a1', letter: '#0c4a6e', cellBg: '#f0f9ff', grid: '#bae6fd', outline: '#0284c7', loop: '#0284c7' },
        berry: { label: 'Warm Berry', accent: '#be123c', letter: '#4c0519', cellBg: '#fff1f2', grid: '#fecdd3', outline: '#e11d48', loop: '#e11d48' },
        forest: { label: 'Forest Mint', accent: '#15803d', letter: '#14532d', cellBg: '#f0fdf4', grid: '#bbf7d0', outline: '#16a34a', loop: '#16a34a' },
        amber: { label: 'Sunny Gold', accent: '#b45309', letter: '#451a03', cellBg: '#fffbeb', grid: '#fde68a', outline: '#d97706', loop: '#d97706' },
        chalkboard: { label: 'Chalkboard', accent: '#0d9488', letter: '#f8fafc', cellBg: '#1e293b', grid: '#475569', outline: '#2dd4bf', loop: '#2dd4bf' }
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
        const fb = fallback || '#0f766e';
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
            if (raw && (raw.startsWith('#') || raw.startsWith('rgb'))) return normalizeHexColor(raw, '#0f766e');
        } catch (e) {}
        return '#0f766e';
    }

    function buildStarPolygon() {
        const pts = [];
        const cx = 50, cy = 51, outerR = 46, innerR = 21;
        for (let i = 0; i < 10; i++) {
            const r = (i % 2 === 0) ? outerR : innerR;
            const angle = (-Math.PI / 2) + (i * Math.PI / 5);
            pts.push([
                +(cx + Math.cos(angle) * r).toFixed(2),
                +(cy + Math.sin(angle) * r).toFixed(2)
            ]);
        }
        return pts;
    }

    function buildHeartPolygon() {
        const pts = [];
        const steps = 44;
        for (let i = 0; i < steps; i++) {
            const t = (i / steps) * Math.PI * 2;
            const hx = 16 * Math.pow(Math.sin(t), 3);
            const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            // Map x in [-16, 16] -> [6, 94], y in [-17, 13] -> [8, 94]
            const nx = 50 + (hx / 16) * 44;
            const ny = 47 + ((hy - 1.5) / 15.5) * 42;
            pts.push([+nx.toFixed(2), +ny.toFixed(2)]);
        }
        return pts;
    }

    function buildCirclePolygon() {
        const pts = [];
        const steps = 36;
        for (let i = 0; i < steps; i++) {
            const a = (i / steps) * Math.PI * 2;
            pts.push([+(50 + Math.cos(a) * 45).toFixed(2), +(50 + Math.sin(a) * 45).toFixed(2)]);
        }
        return pts;
    }

    function parsePolygonPointsText(rawText) {
        if (!rawText) return [];
        const pts = [];
        const cleaned = rawText.trim().replace(/;/g, ' ');
        const pairRegex = /(-?[\d.]+)\s*,\s*(-?[\d.]+)/g;
        let m;
        while ((m = pairRegex.exec(cleaned)) !== null) {
            const x = parseFloat(m[1]);
            const y = parseFloat(m[2]);
            if (!isNaN(x) && !isNaN(y)) {
                pts.push([Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y))]);
            }
        }
        if (pts.length >= 3) return pts;

        const nums = cleaned.split(/\s+/).map(parseFloat).filter(n => !isNaN(n));
        for (let i = 0; i + 1 < nums.length; i += 2) {
            pts.push([Math.max(0, Math.min(100, nums[i])), Math.max(0, Math.min(100, nums[i + 1]))]);
        }
        return pts;
    }

    function formatPolygonPointsText(pts) {
        return (pts || []).map(p => `${Math.round(p[0] * 10) / 10},${Math.round(p[1] * 10) / 10}`).join(' ');
    }

    function getMaskPolygon(maskShape, customPts) {
        if (maskShape === 'star') return buildStarPolygon();
        if (maskShape === 'heart') return buildHeartPolygon();
        if (maskShape === 'circle') return buildCirclePolygon();
        if (maskShape === 'custom') return (customPts && customPts.length >= 3) ? customPts : POLYGON_PRESETS.hexagon;
        return null;
    }

    function isPointInPolygon(px, py, pts) {
        if (!pts || pts.length < 3) return false;
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            const xi = pts[i][0], yi = pts[i][1];
            const xj = pts[j][0], yj = pts[j][1];
            const intersect = ((yi > py) !== (yj > py)) &&
                (px < ((xj - xi) * (py - yi)) / ((yj - yi) || 1e-9) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    function buildCellMask(rows, cols, maskShape, customPts) {
        const mask = Array.from({ length: rows }, () => Array(cols).fill(true));
        if (maskShape === 'rect') return { mask, polygon: null, activeCount: rows * cols };

        const polygon = getMaskPolygon(maskShape, customPts);
        if (!polygon || polygon.length < 3) return { mask, polygon: null, activeCount: rows * cols };

        let activeCount = 0;
        for (let r = 0; r < rows; r++) {
            const ny = ((r + 0.5) / rows) * 100;
            for (let c = 0; c < cols; c++) {
                const nx = ((c + 0.5) / cols) * 100;
                const inside = isPointInPolygon(nx, ny, polygon);
                mask[r][c] = inside;
                if (inside) activeCount++;
            }
        }
        return { mask, polygon, activeCount };
    }

    function parseWordList(rawText) {
        if (!rawText) return [];
        const tokens = rawText.split(/[\r\n,;]+/);
        const seen = new Set();
        const words = [];
        for (const raw of tokens) {
            const display = raw.trim().replace(/\s+/g, ' ').toUpperCase();
            if (!display) continue;
            // Keep Unicode letters and digits for placement, stripping spaces/punctuation
            let letters = '';
            for (const ch of display) {
                if (/[\p{L}\p{N}]/u.test(ch)) letters += ch;
            }
            if (letters.length < 2 || seen.has(letters)) continue;
            seen.add(letters);
            words.push({ display, letters });
        }
        return words;
    }

    function shuffleArray(arr) {
        const copy = arr.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = copy[i];
            copy[i] = copy[j];
            copy[j] = tmp;
        }
        return copy;
    }

    function buildDirectionVectors(allowDiagonal, allowBackward) {
        const dirs = [
            [0, 1],  // Right
            [1, 0]   // Down
        ];
        if (allowBackward) {
            dirs.push([0, -1], [-1, 0]);
        }
        if (allowDiagonal) {
            dirs.push([1, 1], [-1, 1]);
            if (allowBackward) {
                dirs.push([1, -1], [-1, -1]);
            }
        }
        return dirs;
    }

    function generateWordSearchPuzzle(config) {
        const rows = Math.max(5, Math.min(28, parseInt(config.rows, 10) || 15));
        const cols = Math.max(5, Math.min(28, parseInt(config.cols, 10) || 15));
        const maskShape = config.maskShape || 'rect';
        const customPts = config.customPolygon || [];
        const { mask, polygon, activeCount } = buildCellMask(rows, cols, maskShape, customPts);

        const parsedWords = parseWordList(config.wordsText);
        const dirs = buildDirectionVectors(!!config.allowDiagonal, !!config.allowBackward);
        const grid = Array.from({ length: rows }, () => Array(cols).fill(null));

        // Sort longest first with random tie-breakers so dense grids pack cleanly
        const placementQueue = shuffleArray(parsedWords).sort((a, b) => b.letters.length - a.letters.length);
        const placedWords = [];
        const failedWords = [];

        for (const wordObj of placementQueue) {
            const letters = Array.from(wordObj.letters);
            const len = letters.length;
            const candidates = [];
            let bestScore = -1;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (!mask[r][c]) continue;
                    for (let d = 0; d < dirs.length; d++) {
                        const dr = dirs[d][0];
                        const dc = dirs[d][1];
                        const endR = r + dr * (len - 1);
                        const endC = c + dc * (len - 1);
                        if (endR < 0 || endR >= rows || endC < 0 || endC >= cols) continue;

                        let valid = true;
                        let intersections = 0;
                        for (let k = 0; k < len; k++) {
                            const nr = r + dr * k;
                            const nc = c + dc * k;
                            if (!mask[nr][nc]) {
                                valid = false;
                                break;
                            }
                            const existing = grid[nr][nc];
                            if (existing !== null && existing !== letters[k]) {
                                valid = false;
                                break;
                            }
                            if (existing === letters[k]) intersections++;
                        }
                        if (!valid) continue;

                        if (intersections > bestScore) {
                            bestScore = intersections;
                            candidates.length = 0;
                            candidates.push({ r, c, dr, dc });
                        } else if (intersections === bestScore) {
                            candidates.push({ r, c, dr, dc });
                        }
                    }
                }
            }

            if (candidates.length === 0) {
                failedWords.push(wordObj);
                continue;
            }

            const chosen = candidates[Math.floor(Math.random() * candidates.length)];
            for (let k = 0; k < len; k++) {
                const nr = chosen.r + chosen.dr * k;
                const nc = chosen.c + chosen.dc * k;
                grid[nr][nc] = letters[k];
            }
            placedWords.push({
                display: wordObj.display,
                letters: wordObj.letters,
                r: chosen.r,
                c: chosen.c,
                dr: chosen.dr,
                dc: chosen.dc,
                len
            });
        }

        // Preserve original input order in the displayed word bank
        const placedSet = new Set(placedWords.map(w => w.letters));
        const orderedWordBank = parsedWords.filter(w => placedSet.has(w.letters));

        // Count unused active cells before filling
        let unusedCount = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (mask[r][c] && grid[r][c] === null) unusedCount++;
            }
        }

        // Build filler character pool
        let fillerPool = Array.from((config.fillerAlphabet || DEFAULT_ALPHABET).toUpperCase().replace(/\s+/g, ''));
        if (fillerPool.length === 0) fillerPool = Array.from(DEFAULT_ALPHABET);

        const fillerMode = config.fillerMode || 'alphabet';
        let secretChars = [];
        if (fillerMode === 'secret' && config.secretMessage) {
            secretChars = Array.from(config.secretMessage.toUpperCase()).filter(ch => /[\p{L}\p{N}]/u.test(ch));
        }

        let secretCursor = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (!mask[r][c] || grid[r][c] !== null) continue;
                if (fillerMode === 'secret' && secretCursor < secretChars.length) {
                    grid[r][c] = secretChars[secretCursor++];
                } else {
                    grid[r][c] = fillerPool[Math.floor(Math.random() * fillerPool.length)];
                }
            }
        }

        return {
            rows,
            cols,
            maskShape,
            polygon,
            mask,
            grid,
            activeCount,
            unusedCount,
            secretUsedCount: Math.min(secretChars.length, unusedCount),
            secretTotalLength: secretChars.length,
            placedWords,
            orderedWordBank,
            failedWords
        };
    }

    function buildWordSearchSvg(puzzle, options, isAnswerKey) {
        const opts = options || {};
        const cellSize = 32;
        const pad = 16;
        const gridW = puzzle.cols * cellSize;
        const gridH = puzzle.rows * cellSize;
        const svgW = gridW + pad * 2;
        const svgH = gridH + pad * 2;

        const accentColor = opts.accentColor || resolveThemeColor();
        const fontFamily = opts.fontFamily || 'Segoe UI, Arial, sans-serif';
        const letterColor = opts.letterColor || '#0f172a';
        const cellBgColor = opts.cellBgColor || '#ffffff';
        const gridBorderColor = opts.gridBorderColor || '#cbd5e1';
        const outlineColor = opts.outlineColor || accentColor;
        const loopColor = opts.loopColor || accentColor;
        const showGridlines = opts.showGridlines !== false;
        const showMaskOutline = opts.showMaskOutline !== false;
        const loopStyle = opts.loopStyle || 'capsule-color';

        const parts = [];
        parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block; width:100%; height:100%; overflow:visible;">`);

        // Active cell fills & optional gridlines (drawn for active mask cells only)
        parts.push('<g class="ws-grid-cells">');
        const cellStroke = showGridlines ? escapeXml(gridBorderColor) : 'none';
        for (let r = 0; r < puzzle.rows; r++) {
            for (let c = 0; c < puzzle.cols; c++) {
                if (!puzzle.mask[r][c]) continue;
                const x = pad + c * cellSize;
                const y = pad + r * cellSize;
                parts.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${escapeXml(cellBgColor)}" stroke="${cellStroke}" stroke-width="1" />`);
            }
        }
        parts.push('</g>');

        // Stylized Answer Key Loop Highlights rendered cleanly above cell fill & behind letters
        if (isAnswerKey && puzzle.placedWords.length > 0) {
            parts.push('<g class="ws-answer-loops">');
            puzzle.placedWords.forEach((w, idx) => {
                const x0 = pad + (w.c + 0.5) * cellSize;
                const y0 = pad + (w.r + 0.5) * cellSize;
                const endR = w.r + w.dr * (w.len - 1);
                const endC = w.c + w.dc * (w.len - 1);
                const x1 = pad + (endC + 0.5) * cellSize;
                const y1 = pad + (endR + 0.5) * cellSize;

                const mx = (x0 + x1) / 2;
                const my = (y0 + y1) / 2;
                const dist = Math.hypot(x1 - x0, y1 - y0);
                const angleDeg = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
                const capH = cellSize * 0.76;
                const capW = dist + capH;
                const rx = capH / 2;
                const useCustomLoop = (loopStyle === 'capsule-theme' || loopStyle === 'outline-theme');
                const color = useCustomLoop ? loopColor : LOOP_PALETTE[idx % LOOP_PALETTE.length];

                let fillAttr = `fill="${escapeXml(color)}" fill-opacity="0.24"`;
                let strokeAttr = `stroke="${escapeXml(color)}" stroke-width="2" stroke-opacity="0.9"`;

                if (loopStyle === 'outline-color' || loopStyle === 'outline-theme') {
                    fillAttr = 'fill="none"';
                    strokeAttr = `stroke="${escapeXml(color)}" stroke-width="2.2" stroke-opacity="0.95"`;
                } else if (loopStyle === 'marker') {
                    fillAttr = `fill="${escapeXml(color)}" fill-opacity="0.34"`;
                    strokeAttr = 'stroke="none"';
                }

                parts.push(
                    `<rect x="${(-capW / 2).toFixed(2)}" y="${(-capH / 2).toFixed(2)}" width="${capW.toFixed(2)}" height="${capH.toFixed(2)}" rx="${rx.toFixed(2)}" ry="${rx.toFixed(2)}" transform="translate(${mx.toFixed(2)} ${my.toFixed(2)}) rotate(${angleDeg.toFixed(2)})" ${fillAttr} ${strokeAttr} />`
                );
            });
            parts.push('</g>');
        }

        // Grid letters
        const fontSize = Math.round(cellSize * 0.54);
        parts.push(`<g class="ws-letters" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" font-weight="700" fill="${escapeXml(letterColor)}" text-anchor="middle" dominant-baseline="central">`);
        for (let r = 0; r < puzzle.rows; r++) {
            for (let c = 0; c < puzzle.cols; c++) {
                if (!puzzle.mask[r][c] || puzzle.grid[r][c] === null) continue;
                const cx = pad + (c + 0.5) * cellSize;
                const cy = pad + (r + 0.5) * cellSize;
                parts.push(`<text x="${cx}" y="${cy}">${escapeXml(puzzle.grid[r][c])}</text>`);
            }
        }
        parts.push('</g>');

        // Crisp vector mask silhouette outline drawn over cell edges
        if (showMaskOutline && puzzle.polygon && puzzle.polygon.length >= 3) {
            const polyStr = puzzle.polygon
                .map(p => `${(pad + (p[0] / 100) * gridW).toFixed(1)},${(pad + (p[1] / 100) * gridH).toFixed(1)}`)
                .join(' ');
            parts.push(`<polygon points="${polyStr}" fill="none" stroke="${escapeXml(outlineColor)}" stroke-opacity="0.65" stroke-width="2.2" stroke-linejoin="round" pointer-events="none" />`);
        }

        parts.push('</svg>');

        return {
            svgMarkup: parts.join(''),
            width: svgW,
            height: svgH
        };
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

    function insertWordSearchPageObjects(puzzle, config, isAnswerKey) {
        const paperEl = document.getElementById('paper');
        const pw = paperEl ? (parseFloat(paperEl.style.width) || 794) : 794;
        const ph = paperEl ? (parseFloat(paperEl.style.height) || 1123) : 1123;
        const margin = 52;
        const usableW = Math.max(260, pw - margin * 2);
        const accent = config.accentColor || resolveThemeColor();
        const rawTitle = (config.title || 'Word Search').trim() || 'Word Search';
        const headingText = isAnswerKey ? `${rawTitle} - Answer Key` : rawTitle;

        // 1. Title Text Box
        const titleTop = 48;
        const titleH = 54;
        insertTextBoxElement(
            `<div contenteditable="true" spellcheck="false" style="width:100%; height:100%; box-sizing:border-box; padding:4px 8px; outline:none; text-align:center; font-family:${escapeXml(config.fontFamily || 'Segoe UI, sans-serif')}; font-size:28px; font-weight:800; color:${escapeXml(accent)}; letter-spacing:0.5px;">${escapeXml(headingText)}</div>`,
            margin,
            titleTop,
            usableW,
            titleH
        );

        // 2. Grid Vector SVG
        const rendered = buildWordSearchSvg(puzzle, config, isAnswerKey);
        const maxGridW = usableW;
        const wordBankReserve = (puzzle.orderedWordBank.length > 0) ? 185 : 60;
        const maxGridH = Math.max(240, ph - (titleTop + titleH + 20) - margin - wordBankReserve);
        const scale = Math.min(maxGridW / rendered.width, maxGridH / rendered.height, 1.35);
        const boxW = Math.round(rendered.width * scale);
        const boxH = Math.round(rendered.height * scale);
        const boxLeft = Math.round((pw - boxW) / 2);
        const boxTop = titleTop + titleH + 14;

        const svgWrapper = window.createWrapper(rendered.svgMarkup);
        svgWrapper.setAttribute('data-type', 'shape');
        svgWrapper.setAttribute('data-wordsearch', isAnswerKey ? 'answer-key' : 'puzzle');
        svgWrapper.setAttribute('data-aspect-lock', 'true');
        svgWrapper.setAttribute('data-aspect-ratio', String(rendered.width / rendered.height));
        svgWrapper.style.left = boxLeft + 'px';
        svgWrapper.style.top = boxTop + 'px';
        svgWrapper.style.width = boxW + 'px';
        svgWrapper.style.height = boxH + 'px';

        // 3. Word Bank / Legend Text Box
        const bankTop = boxTop + boxH + 16;
        const bankH = Math.max(90, ph - bankTop - margin);
        const wordCount = puzzle.orderedWordBank.length;
        const colCount = wordCount <= 6 ? 2 : (wordCount <= 12 ? 3 : 4);
        const bankLetterColor = config.letterColor || '#1e293b';
        const bankBgColor = (config.cellBgColor && config.cellBgColor.toLowerCase() !== '#ffffff') ? config.cellBgColor : '#f8fafc';
        const bankBorderColor = config.gridBorderColor || '#cbd5e1';
        const wordItemsHtml = puzzle.orderedWordBank
            .map(w => `<div style="padding:3px 6px; font-weight:600; color:${escapeXml(bankLetterColor)}; font-size:13px; letter-spacing:0.4px; break-inside:avoid;">${escapeXml(w.display)}</div>`)
            .join('');

        let extraNoteHtml = '';
        if (isAnswerKey && config.fillerMode === 'secret' && config.secretMessage && config.secretMessage.trim()) {
            extraNoteHtml = `<div style="margin-top:8px; padding-top:6px; border-top:1px dashed ${escapeXml(bankBorderColor)}; font-size:11.5px; color:${escapeXml(accent)}; font-weight:700; text-align:center;">Hidden Secret Message: ${escapeXml(config.secretMessage.trim().toUpperCase())}</div>`;
        }

        if (wordItemsHtml || extraNoteHtml) {
            insertTextBoxElement(
                `<div contenteditable="true" spellcheck="false" style="width:100%; height:100%; box-sizing:border-box; padding:10px 14px; outline:none; font-family:${escapeXml(config.fontFamily || 'Segoe UI, sans-serif')}; background:${escapeXml(bankBgColor)}; border:1px solid ${escapeXml(bankBorderColor)}; border-radius:8px; -webkit-print-color-adjust:exact; print-color-adjust:exact;">
                    <div style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:${escapeXml(accent)}; margin-bottom:6px; text-align:center;">${isAnswerKey ? 'Solution Words (' + wordCount + ')' : 'Word Bank (' + wordCount + ' Words)'}</div>
                    <div style="column-count:${colCount}; column-gap:16px; text-align:center;">${wordItemsHtml}</div>
                    ${extraNoteHtml}
                </div>`,
                margin,
                bankTop,
                usableW,
                bankH
            );
        }

        return svgWrapper;
    }

    function insertWordSearchIntoDocument(puzzle, config) {
        if (typeof state === 'undefined' || typeof window.createWrapper !== 'function') return;

        let res = null;
        if (typeof window.insertTwoPagePuzzleIntoDocument === 'function') {
            res = window.insertTwoPagePuzzleIntoDocument({
                needsAnswerKey: !!config.answerKeyOnPage2,
                renderPuzzleOnCurrentPage: () => insertWordSearchPageObjects(puzzle, config, false),
                renderAnswerKeyOnCurrentPage: () => insertWordSearchPageObjects(puzzle, config, true)
            });
        }

        const puzzleInDom = document.querySelector('.pub-element[data-wordsearch="puzzle"]') || (res && res.primaryEl);
        if (puzzleInDom && document.contains(puzzleInDom) && typeof window.selectElement === 'function') {
            window.selectElement(puzzleInDom);
        }
        if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
        if (typeof window.updateSidebar === 'function') window.updateSidebar();
        if (typeof window.pushHistory === 'function') window.pushHistory();

        if (typeof showToast === 'function') {
            const ansPage = res && res.answerPageNumber;
            showToast(ansPage
                ? `Word Search created! Answer Key generated on Page ${ansPage}.`
                : 'Word Search inserted onto page.');
        }
    }

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
            if (e.target.closest('button, a, input, select, .ws-header-actions')) return;
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

    function enhanceWordSearchSelects(overlay) {
        const selects = Array.from(overlay.querySelectorAll('select.ws-select'));
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
            wrapper.className = 'ws-select-wrap';
            wrapper.style.cssText = 'position:relative; width:100%;';

            const trigger = document.createElement('div');
            trigger.className = 'modern-select ws-modern-select';
            trigger.tabIndex = 0;
            trigger.setAttribute('role', 'combobox');
            trigger.setAttribute('aria-expanded', 'false');

            const labelSpan = document.createElement('span');
            labelSpan.className = 'ws-select-value';

            const arrowBox = document.createElement('div');
            arrowBox.className = 'arrow-box';
            arrowBox.innerHTML = '<i class="fas fa-chevron-down" style="font-size:10px;"></i>';

            trigger.appendChild(labelSpan);
            trigger.appendChild(arrowBox);

            const menu = document.createElement('div');
            menu.className = 'ws-select-menu';
            menu.style.display = 'none';

            const isFontSelect = sel.id === 'ws-font-family';

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
                item.className = 'ws-select-option';
                item.textContent = opt.text;
                item.dataset.value = opt.value;
                if (isFontSelect) {
                    item.style.fontFamily = opt.value;
                }
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
            if (!e.target.closest('.ws-modern-select') && !e.target.closest('.ws-select-menu')) {
                closeAllMenus();
            }
        };
        const controlsPane = overlay.querySelector('.ws-controls');
        overlay.addEventListener('click', onOutsideClick);
        if (controlsPane) controlsPane.addEventListener('scroll', closeAllMenus);

        return closeAllMenus;
    }

    function openHelpModal(parentOverlay) {
        const existingHelp = document.getElementById('op-wordsearch-help-modal');
        if (existingHelp) {
            existingHelp.remove();
        }

        const topics = [
            {
                id: 'overview',
                title: 'Overview & Quick Start',
                body: `
                    <p><strong>Word Search Studio</strong> builds crisp vector word search puzzles and printable Answer Keys directly on your Open Publisher pages.</p>
                    <ul>
                        <li><strong>Enter Words:</strong> Paste or type words one per line or separated by commas.</li>
                        <li><strong>Shape &amp; Grid:</strong> Pick Grid, Star, Heart, Circle, or a Custom Polygon mask, then tune Rows and Columns (5 to 28).</li>
                        <li><strong>Preview Live:</strong> Toggle between <em>Puzzle Preview</em> and <em>Answer Key Loops</em>, or click <em>Shuffle Grid</em> for a new arrangement.</li>
                        <li><strong>Insert:</strong> Click <em>Insert Word Search</em> to place the Title, Vector Puzzle Grid, Word Bank, and (by default) Page 2 Answer Key.</li>
                    </ul>
                `
            },
            {
                id: 'words-grid',
                title: 'Words & Grid Sizing',
                body: `
                    <p>Control puzzle difficulty and layout density using word directions and grid dimensions.</p>
                    <ul>
                        <li><strong>Grid Rows &amp; Columns (5-28):</strong> Increase grid size if long words or shaped masks report skipped words in the status bar.</li>
                        <li><strong>Allow Diagonal Words:</strong> Enables 45-degree word placement across cells.</li>
                        <li><strong>Allow Backward Words:</strong> Allows words to read right-to-left or bottom-to-top for extra challenge.</li>
                        <li><strong>Show Cell Gridlines / Outline:</strong> Toggle internal cell boxes or the outer mask silhouette outline independently.</li>
                    </ul>
                `
            },
            {
                id: 'masks',
                title: 'Shaped & Polygon Masks',
                body: `
                    <p>Mask puzzles into thematic silhouettes while keeping text and grid spacing perfectly aligned.</p>
                    <ul>
                        <li><strong>Built-in Shapes:</strong> Choose <em>Grid</em> (full rectangle), <em>Star</em>, <em>Heart</em>, or <em>Circle</em>.</li>
                        <li><strong>Custom Vector Polygon:</strong> Click inside the 100x100 drawing pad to plot polygon corners in order, use quick presets (<em>Triangle</em>, <em>Hexagon</em>, <em>Diamond</em>, <em>Arrow</em>), or edit normalized <code>x,y</code> coordinates directly.</li>
                        <li><strong>Undo Pt / Clear:</strong> Step back individual points or start a fresh polygon silhouette anytime.</li>
                    </ul>
                `
            },
            {
                id: 'fillers',
                title: 'Filler & Secret Messages',
                body: `
                    <p>Customize the decoy letters that fill unused cells inside your puzzle mask.</p>
                    <ul>
                        <li><strong>Random Custom Alphabet:</strong> Uses only letters you specify (default A-Z). Limiting the pool to letters from your word list creates tricky near-miss decoys.</li>
                        <li><strong>Hide Secret Message:</strong> Switches filler generation to spell out a secret phrase reading sequentially left-to-right, top-to-bottom through unused cells. The capacity counter shows how many filler cells are used.</li>
                    </ul>
                `
            },
            {
                id: 'colors',
                title: 'Colors & Font Styling',
                body: `
                    <p>Match your publication theme using presets or Open Publisher's Custom Color Picker.</p>
                    <ul>
                        <li><strong>Color Presets:</strong> Apply curated schemes like <em>Classic Teal</em>, <em>Ocean Blue</em>, <em>Warm Berry</em>, or <em>Chalkboard</em> in one click.</li>
                        <li><strong>Individual Swatches:</strong> Click any swatch (<em>Accent</em>, <em>Letters</em>, <em>Cell Fill</em>, <em>Gridlines</em>, <em>Outline</em>, <em>Loop</em>) to open the custom color picker with Theme Colors, Standard Colors, Spectrum, and RGB/Hex controls.</li>
                        <li><strong>Letter Font:</strong> Pick clean sans-serif, monospace, serif, or playful lettering for both the grid and Word Bank.</li>
                    </ul>
                `
            },
            {
                id: 'answer-key',
                title: 'Answer Key & Page 2',
                body: `
                    <p>Automatically produce a matching solution sheet ready for teachers, books, and handouts.</p>
                    <ul>
                        <li><strong>Generate Answer Key on Page 2:</strong> Checked by default. Automatically populates Page 2 (inserting one if needed) with <em>Title - Answer Key</em>, solution loops, and the Word Bank.</li>
                        <li><strong>Loop Highlight Styles:</strong> Choose Multi-Color Translucent Capsules, Multi-Color Ink-Saver Outlines, Custom Loop Color styles driven by your <em>Loop</em> swatch, or Bold Highlighter Swipes.</li>
                        <li><strong>Editable Output:</strong> Once inserted, Titles and Word Banks are normal editable text boxes and grids are crisp vector SVGs.</li>
                    </ul>
                `
            }
        ];

        const helpOverlay = document.createElement('div');
        helpOverlay.id = 'op-wordsearch-help-modal';
        helpOverlay.className = 'ws-help-overlay';
        helpOverlay.innerHTML = `
            <style>
                .ws-help-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.14);
                    z-index: 1000030;
                    display: flex; align-items: center; justify-content: center;
                    padding: 16px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .ws-help-box {
                    width: 660px; max-width: 94vw; height: 470px; max-height: 86vh;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #1e293b);
                    border: 1px solid var(--ui-border, #94a3b8); border-radius: 8px;
                    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.28);
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .ws-help-header {
                    padding: 6px 8px 6px 14px;
                    background: linear-gradient(135deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #004a46));
                    color: #ffffff; display: flex; align-items: center; justify-content: space-between;
                    user-select: none; min-height: 44px; box-sizing: border-box;
                }
                .ws-help-toolbar {
                    display: flex; align-items: center; justify-content: space-between; gap: 8px;
                    padding: 6px 12px; background: var(--ui-surface-bg, #f1f4f6);
                    border-bottom: 1px solid var(--ui-border, #cbd5e1); font-size: 12px;
                }
                body.dark-mode .ws-help-toolbar { background: #1e293b; border-color: #334155; }
                .ws-help-nav-btns { display: flex; align-items: center; gap: 4px; }
                .ws-xp-tool-btn {
                    display: inline-flex; align-items: center; gap: 5px;
                    padding: 4px 10px; font-size: 11.5px; font-weight: 600;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-theme-dark, #004a46);
                    border: 1px solid var(--ui-border, #cbd5e1); border-radius: 4px; cursor: pointer;
                }
                .ws-xp-tool-btn:hover:not(:disabled) {
                    border-color: var(--ui-theme-color, #007670);
                    background: color-mix(in srgb, var(--ui-theme-color, #007670) 8%, var(--ui-panel-bg, #ffffff));
                }
                .ws-xp-tool-btn:disabled { opacity: 0.45; cursor: default; }
                body.dark-mode .ws-xp-tool-btn {
                    background: #0f172a; color: #e2e8f0; border-color: #475569;
                }
                .ws-help-split {
                    display: grid; grid-template-columns: 220px 1fr; flex: 1; min-height: 0; overflow: hidden;
                }
                .ws-help-toc {
                    background: var(--ui-surface-bg, #f4f6f8);
                    border-right: 1px solid var(--ui-border, #cbd5e1);
                    display: flex; flex-direction: column; min-height: 0;
                }
                body.dark-mode .ws-help-toc { background: #162030; border-color: #334155; }
                .ws-help-toc-tabs {
                    display: flex; padding: 6px 8px 0 8px;
                    border-bottom: 1px solid var(--ui-border, #cbd5e1);
                    background: rgba(0, 0, 0, 0.03);
                }
                .ws-help-toc-tab {
                    padding: 5px 12px; font-size: 11.5px; font-weight: 700;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-theme-dark, #004a46);
                    border: 1px solid var(--ui-border, #cbd5e1); border-bottom: none;
                    border-radius: 4px 4px 0 0; margin-bottom: -1px;
                }
                body.dark-mode .ws-help-toc-tab { background: #0f172a; color: #e2e8f0; border-color: #334155; }
                .ws-help-toc-list {
                    flex: 1; overflow-y: auto; padding: 8px 6px; display: flex; flex-direction: column; gap: 2px;
                }
                .ws-help-topic-btn {
                    width: 100%; text-align: left; padding: 7px 9px; border: none; border-radius: 4px;
                    background: transparent; color: var(--ui-text, #1e293b);
                    font-size: 12px; font-weight: 500; cursor: pointer;
                    display: flex; align-items: center; gap: 7px;
                }
                .ws-help-topic-btn:hover { background: rgba(0, 118, 112, 0.1); }
                .ws-help-topic-btn.active {
                    background: var(--ui-theme-color, #007670); color: #ffffff; font-weight: 600;
                }
                .ws-help-topic-btn i { font-size: 11px; width: 14px; text-align: center; opacity: 0.85; }
                .ws-help-content {
                    padding: 18px 22px; overflow-y: auto; background: var(--ui-panel-bg, #ffffff);
                }
                body.dark-mode .ws-help-content { background: #0f172a; color: #e2e8f0; }
                .ws-help-content h3 {
                    margin: 0 0 10px 0; padding-bottom: 8px;
                    font-size: 16px; font-weight: 700; color: var(--ui-theme-dark, #004a46);
                    border-bottom: 1px solid var(--ui-border, #e2e8f0);
                }
                body.dark-mode .ws-help-content h3 { color: #5eead4; border-color: #334155; }
                .ws-help-content p { margin: 0 0 10px 0; font-size: 12.8px; line-height: 1.5; }
                .ws-help-content ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 8px; font-size: 12.6px; line-height: 1.48; }
                .ws-help-content code {
                    background: rgba(0, 118, 112, 0.1); padding: 1px 4px; border-radius: 3px; font-size: 11.5px;
                }
                .ws-help-footer {
                    padding: 9px 14px; border-top: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-surface-bg, #f1f4f6);
                    display: flex; align-items: center; justify-content: space-between;
                }
                body.dark-mode .ws-help-footer { background: #1e293b; border-color: #334155; }
                @media (max-width: 620px) {
                    .ws-help-split { grid-template-columns: 1fr; }
                    .ws-help-toc { max-height: 140px; border-right: none; border-bottom: 1px solid var(--ui-border, #cbd5e1); }
                }
            </style>
            <div class="ws-help-box" id="ws-help-box">
                <div class="ws-help-header" id="ws-help-header" title="Drag to move">
                    <div style="display:flex; align-items:center; gap:9px;">
                        <i class="fas fa-book-open" style="font-size:15px;"></i>
                        <span style="font-size:14.5px; font-weight:700;">Word Search Studio Help</span>
                    </div>
                    <button type="button" class="custom-dialog-close" id="ws-help-close-x" title="Close" aria-label="Close" style="width:32px; height:32px; font-size:17px; border-radius:8px;"><i class="fas fa-times"></i></button>
                </div>
                <div class="ws-help-toolbar" id="ws-help-toolbar">
                    <div class="ws-help-nav-btns">
                        <button type="button" class="ws-xp-tool-btn" id="ws-help-back-btn" disabled><i class="fas fa-arrow-left"></i> Back</button>
                        <button type="button" class="ws-xp-tool-btn" id="ws-help-fwd-btn" disabled>Forward <i class="fas fa-arrow-right"></i></button>
                    </div>
                    <span id="ws-help-breadcrumb" style="opacity:0.75; font-size:11.5px; font-weight:600;">Contents &gt; Overview &amp; Quick Start</span>
                </div>
                <div class="ws-help-split">
                    <div class="ws-help-toc">
                        <div class="ws-help-toc-tabs">
                            <span class="ws-help-toc-tab">Contents</span>
                        </div>
                        <div class="ws-help-toc-list" id="ws-help-toc-list">
                            ${topics.map((t, i) => `
                                <button type="button" class="ws-help-topic-btn${i === 0 ? ' active' : ''}" data-topic-id="${t.id}">
                                    <i class="far fa-file-alt"></i>
                                    <span>${escapeXml(t.title)}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="ws-help-content" id="ws-help-content"></div>
                </div>
                <div class="ws-help-footer">
                    <span style="font-size:11.5px; opacity:0.75;">Open Publisher Word Search Studio Guide</span>
                    <button type="button" class="btn-primary" id="ws-help-ok-btn" style="padding:6px 18px; border-radius:6px; font-size:12.5px; font-weight:600; cursor:pointer;">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(helpOverlay);

        const helpBox = helpOverlay.querySelector('#ws-help-box');
        const helpHeader = helpOverlay.querySelector('#ws-help-header');
        const contentPane = helpOverlay.querySelector('#ws-help-content');
        const breadcrumb = helpOverlay.querySelector('#ws-help-breadcrumb');
        const backBtn = helpOverlay.querySelector('#ws-help-back-btn');
        const fwdBtn = helpOverlay.querySelector('#ws-help-fwd-btn');
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
            helpOverlay.querySelectorAll('.ws-help-topic-btn').forEach((btn, idx) => {
                btn.classList.toggle('active', idx === safeIdx);
            });
            backBtn.disabled = (navPos <= 0);
            fwdBtn.disabled = (navPos >= navHistory.length - 1);
        };

        helpOverlay.querySelectorAll('.ws-help-topic-btn').forEach((btn, idx) => {
            btn.addEventListener('click', () => renderTopic(idx, true));
        });
        backBtn.addEventListener('click', () => {
            if (navPos > 0) {
                navPos--;
                renderTopic(navHistory[navPos], false);
            }
        });
        fwdBtn.addEventListener('click', () => {
            if (navPos < navHistory.length - 1) {
                navPos++;
                renderTopic(navHistory[navPos], false);
            }
        });

        renderTopic(0, false);

        const closeHelp = () => {
            teardownDrag();
            helpOverlay.remove();
            if (parentOverlay && document.body.contains(parentOverlay)) {
                parentOverlay.focus?.();
            }
        };

        helpOverlay.querySelector('#ws-help-close-x').addEventListener('click', closeHelp);
        helpOverlay.querySelector('#ws-help-ok-btn').addEventListener('click', closeHelp);
        helpOverlay.addEventListener('mousedown', (e) => {
            if (e.target === helpOverlay) closeHelp();
        });
    }

    function showModal() {
        const existing = document.getElementById('op-wordsearch-modal');
        if (existing) existing.remove();
        const existingHelp = document.getElementById('op-wordsearch-help-modal');
        if (existingHelp) existingHelp.remove();

        const themeColor = resolveThemeColor();
        const modalState = {
            title: 'Word Search',
            wordsText: DEFAULT_WORDS,
            rows: 15,
            cols: 15,
            maskShape: 'rect',
            customPolygon: POLYGON_PRESETS.hexagon.map(p => p.slice()),
            allowDiagonal: true,
            allowBackward: true,
            showGridlines: true,
            showMaskOutline: true,
            fillerMode: 'alphabet',
            fillerAlphabet: DEFAULT_ALPHABET,
            secretMessage: 'GREAT JOB YOU FOUND THEM ALL',
            answerKeyOnPage2: true,
            loopStyle: 'capsule-color',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            accentColor: themeColor,
            letterColor: '#0f172a',
            cellBgColor: '#ffffff',
            gridBorderColor: '#cbd5e1',
            outlineColor: themeColor,
            loopColor: themeColor,
            previewMode: 'puzzle',
            puzzle: null
        };

        modalState.puzzle = generateWordSearchPuzzle(modalState);

        const overlay = document.createElement('div');
        overlay.id = 'op-wordsearch-modal';
        overlay.className = 'ws-modal-overlay';
        const presetButtonsHtml = Object.keys(COLOR_PRESETS).map(key => {
            const p = COLOR_PRESETS[key];
            return `<button type="button" class="ws-color-preset-btn" data-color-preset="${key}" title="${escapeXml(p.label)}">
                <span class="ws-preset-dots"><i style="background:${p.cellBg}; border-color:${p.grid};"></i><i style="background:${p.accent};"></i></span>
                <span>${escapeXml(p.label)}</span>
            </button>`;
        }).join('');

        overlay.innerHTML = `
            <style>
                .ws-modal-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.14);
                    z-index: 1000010;
                    display: flex; align-items: center; justify-content: center;
                    padding: 16px; box-sizing: border-box; font-family: 'Segoe UI', system-ui, sans-serif;
                }
                .ws-modal-box {
                    width: 980px; max-width: 96vw; max-height: 92vh;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #0f172a);
                    border: 1px solid var(--ui-border, #cbd5e1); border-radius: 12px;
                    box-shadow: 0 24px 60px rgba(0,0,0,0.32);
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .ws-modal-header {
                    padding: 10px 14px 10px 20px; background: linear-gradient(135deg, var(--ui-theme-color, #0f766e), var(--ui-theme-dark, #0b5a54));
                    color: #ffffff; display: flex; align-items: center; justify-content: space-between;
                    user-select: none;
                }
                .ws-header-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
                .ws-header-actions .custom-dialog-close {
                    width: 34px; height: 34px; font-size: 17px; border-radius: 8px;
                }
                .ws-help-icon-btn:hover {
                    background: rgba(255, 255, 255, 0.25) !important;
                }
                .ws-modal-body {
                    display: grid; grid-template-columns: 405px 1fr; gap: 18px;
                    padding: 18px 20px; overflow-y: auto; flex: 1; min-height: 0;
                }
                .ws-controls { display: flex; flex-direction: column; gap: 11px; overflow-y: auto; padding-right: 4px; }
                .ws-field-label { display: block; font-size: 11.5px; font-weight: 700; margin-bottom: 4px; opacity: 0.88; }
                .ws-input, .ws-select, .ws-textarea {
                    width: 100%; box-sizing: border-box; padding: 7px 9px; font-size: 12.5px;
                    border: 1px solid var(--ui-border, #cbd5e1); border-radius: 6px;
                    background: var(--ui-surface-bg, #ffffff); color: var(--ui-text, #0f172a);
                    font-family: inherit;
                }
                .ws-textarea { resize: vertical; min-height: 86px; font-family: monospace; line-height: 1.35; }
                .ws-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .ws-shape-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
                .ws-shape-btn {
                    padding: 6px 4px; border: 1.5px solid var(--ui-border, #cbd5e1);
                    border-radius: 6px; background: transparent; color: var(--ui-text, #334155);
                    cursor: pointer; font-size: 11px; font-weight: 600;
                    display: flex; flex-direction: column; align-items: center; gap: 3px;
                }
                .ws-shape-btn.active {
                    border-color: var(--ui-theme-color, #0f766e);
                    background: color-mix(in srgb, var(--ui-theme-color, #0f766e) 14%, transparent);
                    color: var(--ui-theme-color, #0f766e);
                }
                .ws-checks { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 10px; font-size: 12px; }
                .ws-check-label { display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; font-size: 12px; }
                .ws-check-label input { accent-color: var(--ui-theme-color, #0f766e); cursor: pointer; }
                /* App-themed dropdowns matching UI Theme & Font pickers */
                .ws-modern-select {
                    width: 100%; height: 30px !important; box-sizing: border-box;
                    border: 1px solid #cbd5e1 !important; border-radius: 5px !important;
                    background: #ffffff !important; font-size: 12.5px !important;
                }
                .ws-modern-select span {
                    padding: 0 9px !important; font-weight: 500 !important;
                    color: var(--ui-theme-dark, #0f766e) !important;
                }
                .ws-modern-select .arrow-box {
                    width: 26px !important; background: var(--ui-theme-dark, #0f766e) !important;
                    color: #ffffff !important; border-radius: 0 4px 4px 0 !important;
                }
                .ws-modern-select:hover, .ws-modern-select.active {
                    border-color: var(--ui-theme-dark, #0f766e) !important;
                }
                body.dark-mode .ws-modern-select {
                    background: #1e293b !important; border-color: #475569 !important;
                }
                body.dark-mode .ws-modern-select span { color: #f1f5f9 !important; }
                .ws-select-menu {
                    position: fixed; z-index: 1000025;
                    background: #ffffff; border: 1px solid var(--ui-theme-dark, #0f766e);
                    border-radius: 6px; box-shadow: 0 10px 26px rgba(15, 23, 42, 0.22);
                    max-height: 220px; overflow-y: auto; padding: 3px 0; box-sizing: border-box;
                }
                body.dark-mode .ws-select-menu {
                    background: #1e293b; border-color: #0d9488;
                }
                .ws-select-option {
                    padding: 7px 10px; font-size: 12.5px; font-weight: 500;
                    color: var(--ui-theme-dark, #0f766e); cursor: pointer;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                .ws-select-option:hover, .ws-select-option.selected {
                    background: rgba(15, 118, 110, 0.13);
                }
                body.dark-mode .ws-select-option { color: #e2e8f0; }
                body.dark-mode .ws-select-option:hover,
                body.dark-mode .ws-select-option.selected {
                    background: rgba(20, 184, 166, 0.22);
                }
                /* Colors & Theme customization */
                .ws-color-section {
                    border-top: 1px solid var(--ui-border, #e2e8f0); padding-top: 10px;
                    display: flex; flex-direction: column; gap: 8px;
                }
                .ws-color-presets { display: flex; flex-wrap: wrap; gap: 5px; }
                .ws-color-preset-btn {
                    display: inline-flex; align-items: center; gap: 5px;
                    padding: 4px 8px; font-size: 11px; font-weight: 600; border-radius: 5px;
                    border: 1px solid var(--ui-border, #cbd5e1); background: var(--ui-panel-bg, #fff);
                    color: var(--ui-text, #334155); cursor: pointer;
                }
                .ws-color-preset-btn:hover { border-color: var(--ui-theme-color, #0f766e); color: var(--ui-theme-color, #0f766e); }
                .ws-preset-dots { display: inline-flex; align-items: center; gap: 2px; }
                .ws-preset-dots i {
                    width: 9px; height: 9px; border-radius: 50%; display: inline-block;
                    border: 1px solid rgba(0,0,0,0.2);
                }
                .ws-color-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px 8px; }
                .ws-color-chip {
                    display: flex; align-items: center; justify-content: space-between; gap: 6px;
                    padding: 5px 7px; border: 1px solid var(--ui-border, #cbd5e1); border-radius: 6px;
                    background: var(--ui-surface-bg, #ffffff); color: var(--ui-text, #0f172a);
                    font-size: 11px; font-weight: 600; font-family: inherit; cursor: pointer;
                    transition: border-color 0.15s;
                }
                .ws-color-chip:hover { border-color: var(--ui-theme-color, #007670); }
                .ws-color-chip span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .ws-swatch-box {
                    width: 22px; height: 18px; border-radius: 4px; flex-shrink: 0;
                    border: 1px solid rgba(0, 0, 0, 0.25); display: inline-block;
                }
                .ws-poly-box {
                    border: 1px solid var(--ui-border, #cbd5e1); border-radius: 8px; padding: 10px;
                    background: rgba(15, 118, 110, 0.04); display: none; flex-direction: column; gap: 8px;
                }
                .ws-poly-box.visible { display: flex; }
                .ws-poly-pad-wrap { display: flex; gap: 10px; align-items: flex-start; }
                #ws-poly-svg {
                    width: 140px; height: 140px; background: #ffffff; border: 1.5px dashed var(--ui-theme-color, #0f766e);
                    border-radius: 6px; cursor: crosshair; flex-shrink: 0;
                }
                .ws-mini-btn {
                    padding: 4px 7px; font-size: 10.5px; font-weight: 600; border-radius: 4px;
                    border: 1px solid var(--ui-border, #cbd5e1); background: var(--ui-panel-bg, #fff);
                    color: var(--ui-text, #334155); cursor: pointer;
                }
                .ws-mini-btn:hover { border-color: var(--ui-theme-color, #0f766e); color: var(--ui-theme-color, #0f766e); }
                .ws-preview-pane {
                    display: flex; flex-direction: column; border: 1px solid var(--ui-border, #cbd5e1);
                    border-radius: 10px; background: #f8fafc; overflow: hidden; min-height: 460px;
                }
                body.dark-mode .ws-preview-pane { background: #1e293b; }
                .ws-preview-toolbar {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 10px 14px; border-bottom: 1px solid var(--ui-border, #e2e8f0);
                    background: var(--ui-panel-bg, #ffffff); gap: 8px; flex-wrap: wrap;
                }
                .ws-preview-tabs { display: flex; gap: 6px; }
                .ws-ptab {
                    padding: 5px 11px; font-size: 12px; font-weight: 600; border-radius: 6px;
                    border: 1px solid var(--ui-border, #cbd5e1); background: transparent;
                    color: var(--ui-text, #475569); cursor: pointer;
                }
                .ws-ptab.active {
                    background: var(--ui-theme-color, #0f766e); border-color: var(--ui-theme-color, #0f766e); color: #ffffff;
                }
                .ws-preview-canvas {
                    flex: 1; display: flex; align-items: center; justify-content: center;
                    padding: 16px; overflow: auto; min-height: 360px;
                }
                #ws-preview-svg-host {
                    width: 100%; max-width: 440px; aspect-ratio: 1 / 1;
                    background: #ffffff; border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.08);
                    padding: 10px; box-sizing: border-box; display: flex; align-items: center; justify-content: center;
                }
                .ws-status-bar {
                    padding: 8px 14px; font-size: 12px; border-top: 1px solid var(--ui-border, #e2e8f0);
                    background: var(--ui-panel-bg, #ffffff); display: flex; justify-content: space-between; align-items: center; gap: 8px;
                }
                .ws-modal-footer {
                    padding: 12px 20px; border-top: 1px solid var(--ui-border, #e2e8f0);
                    display: flex; align-items: center; justify-content: space-between; gap: 10px;
                    background: var(--ui-panel-bg, #ffffff);
                }
                body.dark-mode .ws-modal-footer { background: #111827; border-top-color: #334155; }
                .ws-btn-secondary {
                    padding: 7px 15px; border-radius: 6px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: transparent; color: var(--ui-text, #1e293b); font-size: 12.5px; font-weight: 600; cursor: pointer;
                }
                body.dark-mode .ws-btn-secondary { color: #e2e8f0; border-color: #475569; }
                .ws-btn-primary {
                    padding: 7px 18px; border-radius: 6px; border: none;
                    background: var(--ui-theme-color, #007670); color: #ffffff;
                    font-size: 12.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 7px;
                }
                .ws-btn-primary:hover { background: var(--ui-theme-dark, #004a46); }
                @media (max-width: 820px) {
                    .ws-modal-body { grid-template-columns: 1fr; }
                }
            </style>
            <div class="ws-modal-box" id="ws-modal-box">
                <div class="ws-modal-header" id="ws-modal-header" title="Drag to move">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-search" style="font-size:17px;"></i>
                        <div>
                            <div style="font-size:15px; font-weight:700;">Word Search Studio</div>
                            <div style="font-size:11px; opacity:0.88;">Custom grid shapes, secret filler messages &amp; stylized Page 2 Answer Key</div>
                        </div>
                    </div>
                    <div class="ws-header-actions">
                        <button type="button" class="custom-dialog-close ws-help-icon-btn" id="ws-help-btn" title="Help" aria-label="Help"><i class="fas fa-question"></i></button>
                        <button type="button" class="custom-dialog-close" id="ws-close-x" title="Close" aria-label="Close"><i class="fas fa-times"></i></button>
                    </div>
                </div>

                <div class="ws-modal-body">
                    <div class="ws-controls">
                        <div>
                            <label class="ws-field-label" for="ws-title">Puzzle Title</label>
                            <input type="text" id="ws-title" class="ws-input" value="${escapeXml(modalState.title)}">
                        </div>

                        <div>
                            <label class="ws-field-label" for="ws-words">Word List (one word/phrase per line or comma-separated)</label>
                            <textarea id="ws-words" class="ws-textarea">${escapeXml(modalState.wordsText)}</textarea>
                        </div>

                        <div>
                            <label class="ws-field-label">Grid Shape Mask</label>
                            <div class="ws-shape-grid" id="ws-shape-selector">
                                <button type="button" class="ws-shape-btn active" data-shape="rect"><i class="far fa-square"></i>Grid</button>
                                <button type="button" class="ws-shape-btn" data-shape="star"><i class="far fa-star"></i>Star</button>
                                <button type="button" class="ws-shape-btn" data-shape="heart"><i class="far fa-heart"></i>Heart</button>
                                <button type="button" class="ws-shape-btn" data-shape="circle"><i class="far fa-circle"></i>Circle</button>
                                <button type="button" class="ws-shape-btn" data-shape="custom"><i class="fas fa-draw-polygon"></i>Polygon</button>
                            </div>
                        </div>

                        <div class="ws-poly-box" id="ws-poly-editor">
                            <div style="font-size:11px; font-weight:700; color:var(--ui-theme-color, #0f766e);">Custom Vector Polygon Mask</div>
                            <div class="ws-poly-pad-wrap">
                                <svg id="ws-poly-svg" viewBox="0 0 100 100" title="Click to add vertices"></svg>
                                <div style="flex:1; display:flex; flex-direction:column; gap:5px;">
                                    <div style="font-size:10.5px; opacity:0.8;">Click the pad to draw points, choose a preset, or paste coordinates (0-100):</div>
                                    <div style="display:flex; flex-wrap:wrap; gap:4px;">
                                        <button type="button" class="ws-mini-btn" data-preset="triangle">Triangle</button>
                                        <button type="button" class="ws-mini-btn" data-preset="hexagon">Hexagon</button>
                                        <button type="button" class="ws-mini-btn" data-preset="diamond">Diamond</button>
                                        <button type="button" class="ws-mini-btn" data-preset="arrow">Arrow</button>
                                        <button type="button" class="ws-mini-btn" id="ws-poly-undo">Undo Pt</button>
                                        <button type="button" class="ws-mini-btn" id="ws-poly-clear">Clear</button>
                                    </div>
                                    <input type="text" id="ws-polygon-points" class="ws-input" style="font-size:11px; font-family:monospace;" value="${escapeXml(formatPolygonPointsText(modalState.customPolygon))}">
                                </div>
                            </div>
                        </div>

                        <div class="ws-row-2">
                            <div>
                                <label class="ws-field-label" for="ws-rows">Grid Rows (5-28)</label>
                                <input type="number" id="ws-rows" class="ws-input" min="5" max="28" value="15">
                            </div>
                            <div>
                                <label class="ws-field-label" for="ws-cols">Grid Columns (5-28)</label>
                                <input type="number" id="ws-cols" class="ws-input" min="5" max="28" value="15">
                            </div>
                        </div>

                        <div class="ws-checks">
                            <label class="ws-check-label"><input type="checkbox" id="ws-allow-diag" checked> Allow Diagonal Words</label>
                            <label class="ws-check-label"><input type="checkbox" id="ws-allow-back" checked> Allow Backward Words</label>
                            <label class="ws-check-label"><input type="checkbox" id="ws-show-grid" checked> Show Cell Gridlines</label>
                            <label class="ws-check-label"><input type="checkbox" id="ws-show-outline" checked> Show Shape Outline</label>
                        </div>

                        <div style="border-top:1px solid var(--ui-border, #e2e8f0); padding-top:10px; display:flex; flex-direction:column; gap:8px;">
                            <div class="ws-row-2">
                                <div>
                                    <label class="ws-field-label" for="ws-filler-mode">Filler Letter Mode</label>
                                    <select id="ws-filler-mode" class="ws-select">
                                        <option value="alphabet">Random Custom Alphabet</option>
                                        <option value="secret">Hide Secret Message</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="ws-field-label" for="ws-font-family">Letter Font</label>
                                    <select id="ws-font-family" class="ws-select">
                                        <option value="Segoe UI, Arial, sans-serif">Segoe UI (Clean)</option>
                                        <option value="Courier New, monospace">Courier New (Mono)</option>
                                        <option value="Arial, sans-serif">Arial</option>
                                        <option value="Georgia, serif">Georgia (Serif)</option>
                                        <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                                        <option value="Comic Sans MS, cursive, sans-serif">Playful Comic</option>
                                    </select>
                                </div>
                            </div>

                            <div id="ws-filler-alpha-wrap">
                                <label class="ws-field-label" for="ws-filler-alphabet">Custom Filler-Letter Alphabet</label>
                                <input type="text" id="ws-filler-alphabet" class="ws-input" value="${escapeXml(modalState.fillerAlphabet)}">
                            </div>

                            <div id="ws-secret-wrap" style="display:none;">
                                <label class="ws-field-label" for="ws-secret-message">Secret Message (hidden sequentially in unused cells)</label>
                                <input type="text" id="ws-secret-message" class="ws-input" value="${escapeXml(modalState.secretMessage)}">
                                <div id="ws-secret-hint" style="font-size:10.5px; opacity:0.78; margin-top:3px;"></div>
                            </div>
                        </div>

                        <div class="ws-color-section">
                            <div style="display:flex; align-items:center; justify-content:space-between;">
                                <label class="ws-field-label" style="margin:0;">Colors &amp; Palette</label>
                                <span style="font-size:10.5px; opacity:0.7;">Presets or custom swatches</span>
                            </div>
                            <div class="ws-color-presets" id="ws-color-presets">
                                ${presetButtonsHtml}
                            </div>
                            <div class="ws-color-grid">
                                <button type="button" class="ws-color-chip" data-color-target="ws-accent-color" title="Title, Word Bank heading &amp; secret note">
                                    <span>Accent</span>
                                    <span class="ws-swatch-box" data-swatch-for="ws-accent-color" style="background:${escapeXml(normalizeHexColor(modalState.accentColor, '#007670'))};"></span>
                                    <input type="hidden" id="ws-accent-color" value="${escapeXml(normalizeHexColor(modalState.accentColor, '#007670'))}">
                                </button>
                                <button type="button" class="ws-color-chip" data-color-target="ws-letter-color" title="Puzzle grid letters &amp; word bank items">
                                    <span>Letters</span>
                                    <span class="ws-swatch-box" data-swatch-for="ws-letter-color" style="background:${escapeXml(modalState.letterColor)};"></span>
                                    <input type="hidden" id="ws-letter-color" value="${escapeXml(modalState.letterColor)}">
                                </button>
                                <button type="button" class="ws-color-chip" data-color-target="ws-cell-bg-color" title="Active puzzle cell background fill">
                                    <span>Cell Fill</span>
                                    <span class="ws-swatch-box" data-swatch-for="ws-cell-bg-color" style="background:${escapeXml(modalState.cellBgColor)};"></span>
                                    <input type="hidden" id="ws-cell-bg-color" value="${escapeXml(modalState.cellBgColor)}">
                                </button>
                                <button type="button" class="ws-color-chip" data-color-target="ws-grid-color" title="Grid cell border color">
                                    <span>Gridlines</span>
                                    <span class="ws-swatch-box" data-swatch-for="ws-grid-color" style="background:${escapeXml(modalState.gridBorderColor)};"></span>
                                    <input type="hidden" id="ws-grid-color" value="${escapeXml(modalState.gridBorderColor)}">
                                </button>
                                <button type="button" class="ws-color-chip" data-color-target="ws-outline-color" title="Star / Heart / Circle / Polygon border outline">
                                    <span>Outline</span>
                                    <span class="ws-swatch-box" data-swatch-for="ws-outline-color" style="background:${escapeXml(normalizeHexColor(modalState.outlineColor, '#007670'))};"></span>
                                    <input type="hidden" id="ws-outline-color" value="${escapeXml(normalizeHexColor(modalState.outlineColor, '#007670'))}">
                                </button>
                                <button type="button" class="ws-color-chip" data-color-target="ws-loop-color" title="Custom single-color Answer Key loop highlight">
                                    <span>Loop</span>
                                    <span class="ws-swatch-box" data-swatch-for="ws-loop-color" style="background:${escapeXml(normalizeHexColor(modalState.loopColor, '#007670'))};"></span>
                                    <input type="hidden" id="ws-loop-color" value="${escapeXml(normalizeHexColor(modalState.loopColor, '#007670'))}">
                                </button>
                            </div>
                        </div>

                        <div style="border-top:1px solid var(--ui-border, #e2e8f0); padding-top:10px; display:flex; flex-direction:column; gap:8px;">
                            <label class="ws-check-label" style="font-weight:700;">
                                <input type="checkbox" id="ws-answer-page2" checked>
                                Generate Answer Key on Page 2
                            </label>
                            <div>
                                <label class="ws-field-label" for="ws-loop-style">Answer Key Loop Highlight Style</label>
                                <select id="ws-loop-style" class="ws-select">
                                    <option value="capsule-color">Multi-Color Translucent Capsules</option>
                                    <option value="outline-color">Multi-Color Outlined Loops (Ink-Saver)</option>
                                    <option value="capsule-theme">Custom Loop Color Capsules</option>
                                    <option value="outline-theme">Custom Loop Color Outlined (Ink-Saver)</option>
                                    <option value="marker">Bold Highlighter Swipes</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="ws-preview-pane">
                        <div class="ws-preview-toolbar">
                            <div class="ws-preview-tabs">
                                <button type="button" class="ws-ptab active" id="ws-ptab-puzzle">Puzzle Preview</button>
                                <button type="button" class="ws-ptab" id="ws-ptab-answer">Answer Key Loops</button>
                            </div>
                            <button type="button" class="ws-mini-btn" id="ws-shuffle-btn"><i class="fas fa-random" style="margin-right:4px;"></i>Shuffle Grid</button>
                        </div>
                        <div class="ws-preview-canvas">
                            <div id="ws-preview-svg-host"></div>
                        </div>
                        <div class="ws-status-bar">
                            <span id="ws-status-text">Ready</span>
                            <span id="ws-cell-count" style="opacity:0.75;"></span>
                        </div>
                    </div>
                </div>

                <div class="ws-modal-footer">
                    <div style="font-size:11.5px; opacity:0.75;" id="ws-footer-note">Inserts editable Title, crisp Vector Puzzle Grid, and Word Bank (+ Page 2 Answer Key).</div>
                    <div style="display:flex; gap:8px;">
                        <button type="button" class="ws-btn-secondary" id="ws-cancel-btn">Cancel</button>
                        <button type="button" class="ws-btn-primary" id="ws-insert-btn"><i class="fas fa-plus"></i> Insert Word Search</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const modalBox = overlay.querySelector('#ws-modal-box');
        const modalHeader = overlay.querySelector('#ws-modal-header');
        const teardownMainDrag = makeModalDraggable(modalBox, modalHeader);
        const closeSelectMenus = enhanceWordSearchSelects(overlay);

        const renderPolygonPad = () => {
            const padSvg = overlay.querySelector('#ws-poly-svg');
            if (!padSvg) return;
            const pts = modalState.customPolygon || [];
            const polyStr = pts.map(p => `${p[0]},${p[1]}`).join(' ');
            const dots = pts.map((p, i) =>
                `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="${i === 0 ? '#dc2626' : '#0f766e'}" stroke="#ffffff" stroke-width="1" />`
            ).join('');
            padSvg.innerHTML = `
                ${pts.length >= 3 ? `<polygon points="${polyStr}" fill="rgba(15,118,110,0.18)" stroke="#0f766e" stroke-width="1.5" />` : (pts.length === 2 ? `<polyline points="${polyStr}" fill="none" stroke="#0f766e" stroke-width="1.5" />` : '')}
                ${dots}
            `;
        };

        const renderPreviewOnly = () => {
            const host = overlay.querySelector('#ws-preview-svg-host');
            const p = modalState.puzzle;
            if (!host || !p) return;
            const svgInfo = buildWordSearchSvg(p, modalState, modalState.previewMode === 'answer');
            host.innerHTML = svgInfo.svgMarkup;

            const aspect = svgInfo.width / svgInfo.height;
            host.style.aspectRatio = String(aspect);

            const statusEl = overlay.querySelector('#ws-status-text');
            const countEl = overlay.querySelector('#ws-cell-count');
            const secretHint = overlay.querySelector('#ws-secret-hint');

            if (statusEl) {
                if (p.failedWords.length > 0) {
                    statusEl.style.color = '#dc2626';
                    statusEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Placed ${p.placedWords.length}/${p.placedWords.length + p.failedWords.length} (Skipped: ${escapeXml(p.failedWords.map(w => w.display).slice(0, 3).join(', '))}${p.failedWords.length > 3 ? '...' : ''})`;
                } else {
                    statusEl.style.color = '#059669';
                    statusEl.innerHTML = `<i class="fas fa-check-circle"></i> Placed all ${p.placedWords.length} words cleanly`;
                }
            }
            if (countEl) {
                countEl.textContent = `${p.activeCount} active cells | ${p.unusedCount} filler cells`;
            }
            if (secretHint) {
                secretHint.textContent = p.secretTotalLength > p.unusedCount
                    ? `Secret message truncated (${p.secretUsedCount}/${p.secretTotalLength} letters fit in ${p.unusedCount} unused cells)`
                    : `${p.secretUsedCount} / ${p.unusedCount} unused cells used for secret message`;
            }
        };

        const syncAndRegenerate = (onlyVisual) => {
            modalState.title = overlay.querySelector('#ws-title').value;
            modalState.accentColor = overlay.querySelector('#ws-accent-color').value || themeColor;
            modalState.letterColor = overlay.querySelector('#ws-letter-color').value || '#0f172a';
            modalState.cellBgColor = overlay.querySelector('#ws-cell-bg-color').value || '#ffffff';
            modalState.gridBorderColor = overlay.querySelector('#ws-grid-color').value || '#cbd5e1';
            modalState.outlineColor = overlay.querySelector('#ws-outline-color').value || modalState.accentColor;
            modalState.loopColor = overlay.querySelector('#ws-loop-color').value || modalState.accentColor;
            modalState.wordsText = overlay.querySelector('#ws-words').value;
            modalState.rows = Math.max(5, Math.min(28, parseInt(overlay.querySelector('#ws-rows').value, 10) || 15));
            modalState.cols = Math.max(5, Math.min(28, parseInt(overlay.querySelector('#ws-cols').value, 10) || 15));
            modalState.allowDiagonal = overlay.querySelector('#ws-allow-diag').checked;
            modalState.allowBackward = overlay.querySelector('#ws-allow-back').checked;
            modalState.showGridlines = overlay.querySelector('#ws-show-grid').checked;
            modalState.showMaskOutline = overlay.querySelector('#ws-show-outline').checked;
            modalState.fillerMode = overlay.querySelector('#ws-filler-mode').value;
            modalState.fillerAlphabet = overlay.querySelector('#ws-filler-alphabet').value || DEFAULT_ALPHABET;
            modalState.secretMessage = overlay.querySelector('#ws-secret-message').value;
            modalState.fontFamily = overlay.querySelector('#ws-font-family').value;
            modalState.answerKeyOnPage2 = overlay.querySelector('#ws-answer-page2').checked;
            modalState.loopStyle = overlay.querySelector('#ws-loop-style').value;

            overlay.querySelector('#ws-secret-wrap').style.display = (modalState.fillerMode === 'secret') ? 'block' : 'none';
            overlay.querySelector('#ws-poly-editor').classList.toggle('visible', modalState.maskShape === 'custom');

            if (!onlyVisual || !modalState.puzzle) {
                modalState.puzzle = generateWordSearchPuzzle(modalState);
            }
            renderPolygonPad();
            renderPreviewOnly();
        };

        // Shape button wiring
        overlay.querySelectorAll('#ws-shape-selector .ws-shape-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                overlay.querySelectorAll('#ws-shape-selector .ws-shape-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                modalState.maskShape = btn.getAttribute('data-shape') || 'rect';
                syncAndRegenerate(false);
            });
        });

        const syncColorSwatches = () => {
            overlay.querySelectorAll('.ws-swatch-box[data-swatch-for]').forEach(box => {
                const targetId = box.getAttribute('data-swatch-for');
                const inputEl = targetId ? overlay.querySelector('#' + targetId) : null;
                if (inputEl && inputEl.value) {
                    box.style.backgroundColor = inputEl.value;
                }
            });
        };

        // Choosing a custom Loop color immediately activates Custom Loop Color mode so changes are visible right away
        const loopColorInput = overlay.querySelector('#ws-loop-color');
        const loopStyleSelect = overlay.querySelector('#ws-loop-style');
        const onLoopColorPick = () => {
            syncColorSwatches();
            if (loopStyleSelect && loopStyleSelect.value === 'outline-color') {
                loopStyleSelect.value = 'outline-theme';
                loopStyleSelect.dispatchEvent(new Event('change', { bubbles: true }));
            } else if (loopStyleSelect && (loopStyleSelect.value === 'capsule-color' || loopStyleSelect.value === 'marker')) {
                loopStyleSelect.value = 'capsule-theme';
                loopStyleSelect.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                syncAndRegenerate(true);
            }
        };
        if (loopColorInput) {
            loopColorInput.addEventListener('input', onLoopColorPick);
        }

        // Open Publisher CustomColorPicker wiring for each swatch chip
        overlay.querySelectorAll('.ws-color-chip[data-color-target]').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                closeSelectMenus();
                const targetId = chip.getAttribute('data-color-target');
                const inputEl = targetId ? overlay.querySelector('#' + targetId) : null;
                const swatchBox = chip.querySelector('.ws-swatch-box') || chip;
                if (!inputEl) return;

                if (window.CustomColorPicker && typeof window.CustomColorPicker.open === 'function') {
                    window.CustomColorPicker.open(chip, inputEl.value, (chosen) => {
                        inputEl.value = normalizeHexColor(chosen, '#007670');
                        if (swatchBox) swatchBox.style.backgroundColor = inputEl.value;
                        if (targetId === 'ws-loop-color') {
                            onLoopColorPick();
                        } else {
                            syncAndRegenerate(true);
                        }
                    });
                }
            });
        });

        // One-click color preset wiring
        overlay.querySelectorAll('[data-color-preset]').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = COLOR_PRESETS[btn.getAttribute('data-color-preset')];
                if (!preset) return;
                overlay.querySelector('#ws-accent-color').value = preset.accent;
                overlay.querySelector('#ws-letter-color').value = preset.letter;
                overlay.querySelector('#ws-cell-bg-color').value = preset.cellBg;
                overlay.querySelector('#ws-grid-color').value = preset.grid;
                overlay.querySelector('#ws-outline-color').value = preset.outline;
                overlay.querySelector('#ws-loop-color').value = preset.loop;
                syncColorSwatches();
                syncAndRegenerate(true);
            });
        });

        // Interactive Custom Polygon click drawing & presets
        const polySvg = overlay.querySelector('#ws-poly-svg');
        const polyInput = overlay.querySelector('#ws-polygon-points');
        if (polySvg) {
            polySvg.addEventListener('click', (e) => {
                const rect = polySvg.getBoundingClientRect();
                const nx = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
                const ny = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
                modalState.customPolygon.push([nx, ny]);
                if (polyInput) polyInput.value = formatPolygonPointsText(modalState.customPolygon);
                syncAndRegenerate(false);
            });
        }
        overlay.querySelectorAll('[data-preset]').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-preset');
                if (POLYGON_PRESETS[key]) {
                    modalState.customPolygon = POLYGON_PRESETS[key].map(p => p.slice());
                    if (polyInput) polyInput.value = formatPolygonPointsText(modalState.customPolygon);
                    syncAndRegenerate(false);
                }
            });
        });
        overlay.querySelector('#ws-poly-undo').addEventListener('click', () => {
            modalState.customPolygon.pop();
            if (polyInput) polyInput.value = formatPolygonPointsText(modalState.customPolygon);
            syncAndRegenerate(false);
        });
        overlay.querySelector('#ws-poly-clear').addEventListener('click', () => {
            modalState.customPolygon = [];
            if (polyInput) polyInput.value = '';
            syncAndRegenerate(false);
        });
        if (polyInput) {
            polyInput.addEventListener('input', () => {
                const parsed = parsePolygonPointsText(polyInput.value);
                modalState.customPolygon = parsed;
                syncAndRegenerate(false);
            });
        }

        // Visual-only color inputs & title (no grid reshuffle when picking colors)
        ['#ws-title', '#ws-accent-color', '#ws-letter-color', '#ws-cell-bg-color', '#ws-grid-color', '#ws-outline-color'].forEach(sel => {
            const el = overlay.querySelector(sel);
            if (el) el.addEventListener('input', () => {
                syncColorSwatches();
                syncAndRegenerate(true);
            });
        });

        // Content/grid inputs
        ['#ws-words', '#ws-rows', '#ws-cols', '#ws-filler-alphabet', '#ws-secret-message'].forEach(sel => {
            const el = overlay.querySelector(sel);
            if (el) el.addEventListener('input', () => syncAndRegenerate(false));
        });
        ['#ws-allow-diag', '#ws-allow-back', '#ws-filler-mode'].forEach(sel => {
            const el = overlay.querySelector(sel);
            if (el) el.addEventListener('change', () => syncAndRegenerate(false));
        });
        ['#ws-show-grid', '#ws-show-outline', '#ws-font-family', '#ws-answer-page2', '#ws-loop-style'].forEach(sel => {
            const el = overlay.querySelector(sel);
            if (el) el.addEventListener('change', () => syncAndRegenerate(true));
        });

        // Preview mode tabs
        const ptabPuzzle = overlay.querySelector('#ws-ptab-puzzle');
        const ptabAnswer = overlay.querySelector('#ws-ptab-answer');
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
        overlay.querySelector('#ws-shuffle-btn').addEventListener('click', () => {
            modalState.puzzle = generateWordSearchPuzzle(modalState);
            renderPreviewOnly();
        });

        // Help Modal trigger
        overlay.querySelector('#ws-help-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            closeSelectMenus();
            openHelpModal(overlay);
        });

        // Close / Insert / Escape handling
        let onKeyDown = null;
        const closeModal = () => {
            teardownMainDrag();
            closeSelectMenus();
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen && typeof window.CustomColorPicker.close === 'function') {
                window.CustomColorPicker.close();
            }
            if (onKeyDown) document.removeEventListener('keydown', onKeyDown);
            const openHelp = document.getElementById('op-wordsearch-help-modal');
            if (openHelp) openHelp.remove();
            overlay.remove();
        };
        onKeyDown = (e) => {
            if (e.key !== 'Escape') return;
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen && typeof window.CustomColorPicker.close === 'function') {
                window.CustomColorPicker.close();
                return;
            }
            const openHelp = document.getElementById('op-wordsearch-help-modal');
            if (openHelp) {
                openHelp.remove();
            } else {
                closeModal();
            }
        };
        document.addEventListener('keydown', onKeyDown);

        overlay.querySelector('#ws-close-x').addEventListener('click', closeModal);
        overlay.querySelector('#ws-cancel-btn').addEventListener('click', closeModal);
        overlay.addEventListener('mousedown', (e) => {
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen) return;
            if (e.target === overlay) closeModal();
        });
        overlay.querySelector('#ws-insert-btn').addEventListener('click', () => {
            const puzzleToInsert = modalState.puzzle;
            const cfgCopy = Object.assign({}, modalState);
            closeModal();
            insertWordSearchIntoDocument(puzzleToInsert, cfgCopy);
        });

        renderPolygonPad();
        renderPreviewOnly();
    }

    window.WordSearchStudio = {
        showModal,
        generateWordSearchPuzzle,
        buildWordSearchSvg,
        buildCellMask,
        isPointInPolygon,
        parsePolygonPointsText
    };
})(window);
