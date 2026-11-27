// Open Publisher Bingo & Raffle Ticket Generator Studio (v5.24.20)
// Generates randomized, non-identical Bingo cards (with optional Caller's Master Sheet)
// and sequentially numbered Raffle tickets (with matching tear-off stubs) across multiple pages,
// complete with custom styling presets, color palettes, cut guides, double-click re-editing,
// and an integrated Windows XP-style Help window.

(function(window) {
    'use strict';

    const SVG_NS = 'http://www.w3.org/2000/svg';

    const DEFAULT_PARTY_WORDS = [
        'Balloons', 'Confetti', 'Sparkler', 'Music', 'Dance',
        'Trophy', 'Ribbon', 'Gift Box', 'Cupcake', 'Popcorn',
        'Starlight', 'Rainbow', 'Fireworks', 'Lantern', 'Applause',
        'Encore', 'Spotlight', 'Curtain', 'Carousel', 'Ferris Wheel',
        'Carnival', 'Parade', 'Ticket', 'Jackpot', 'Lucky Penny',
        'Clover', 'Horseshoe', 'Treasure', 'Diamond', 'Gold Coin',
        'Emerald', 'Sapphire', 'Sunrise', 'Sunset', 'Ocean Wave',
        'Mountain', 'Campfire', 'Pinwheel', 'Origami', 'Kaleidoscope',
        'Domino', 'Dice Roll', 'Spinner', 'Marbles', 'Puzzles',
        'Checkers', 'Postcard', 'Scrapbook', 'Memory', 'Victory'
    ];

    const CLASSROOM_WORDS = [
        'Apple', 'Backpack', 'Bicycle', 'Butterfly', 'Cactus',
        'Compass', 'Crayon', 'Dinosaur', 'Dolphin', 'Dragonfly',
        'Eagle', 'Feather', 'Firefly', 'Fossil', 'Galaxy',
        'Giraffe', 'Glacier', 'Acorn', 'Hedgehog', 'Horizon',
        'Island', 'Jellyfish', 'Kangaroo', 'Ladybug', 'Lighthouse',
        'Magnet', 'Maple Leaf', 'Microscope', 'Notebook', 'Octopus',
        'Owl', 'Panda', 'Penguin', 'Prism', 'Rainbow',
        'Redwood', 'Rocket', 'Seashell', 'Starfish', 'Sunflower',
        'Telescope', 'Thunder', 'Tortoise', 'Volcano', 'Waterfall',
        'Whale', 'Windmill', 'Xylophone', 'Zebra', 'Comet'
    ];

    const OFFICE_PHRASES = [
        'Circle Back', 'Action Item', 'Quick Sync', 'Deep Dive', 'Move the Needle',
        'Low Hanging Fruit', 'Touch Base', 'Ping Me', 'Bandwidth', 'Alignment',
        'Brainstorm', 'Take Offline', 'Next Steps', 'Deliverable', 'Roadmap',
        'Milestone', 'Bottleneck', 'Game Changer', 'Synergy', 'Scale Up',
        'Deck Slide', 'Follow Up', 'Kickoff Call', 'On My Radar', 'Status Check',
        'Team Huddle', 'Best Practice', 'Value Add', 'Hard Stop', 'Standup Meeting',
        'Blue Sky', 'Pivot Now', 'Big Picture', 'Coffee Break', 'Inbox Zero',
        'Lunch & Learn', 'Friday Demo', 'Muted Mic', 'Screen Share', 'Can You Hear Me',
        'Freeze Frame', 'Drop Link', 'Whiteboard', 'Sticky Note', 'Launch Day',
        'Shipped It', 'Beta Test', 'High Five', 'Wrap Up', 'Weekend Soon'
    ];

    const BINGO_POOL_PRESETS = {
        party50: {
            label: 'Party & Game Night (50 Words)',
            classicColumns: false,
            text: DEFAULT_PARTY_WORDS.join('\n')
        },
        numbers75: {
            label: 'Classic Numbers (1-75 BINGO)',
            classicColumns: true,
            text: Array.from({ length: 75 }, (_, i) => String(i + 1)).join('\n')
        },
        numbers50: {
            label: 'Sequential Numbers (1-50)',
            classicColumns: false,
            text: Array.from({ length: 50 }, (_, i) => String(i + 1)).join('\n')
        },
        classroom50: {
            label: 'Classroom & Nature (50 Words)',
            classicColumns: false,
            text: CLASSROOM_WORDS.join('\n')
        },
        office50: {
            label: 'Office & Team Meeting (50 Phrases)',
            classicColumns: false,
            text: OFFICE_PHRASES.join('\n')
        }
    };

    const BINGO_STYLE_PRESETS = {
        classic: { label: 'Classic Hall', desc: 'Bold top header banner & clean cell grid' },
        modern: { label: 'Modern Minimal', desc: 'Rounded frame, soft tint & airy cells' },
        vintage: { label: 'Vintage Carnival', desc: 'Double border, corner dots & serif banner' },
        festive: { label: 'Festive Party', desc: 'Star accents, pill badge & playful border' },
        inksaver: { label: 'Ink-Saver Print', desc: 'Crisp high-contrast low-ink black & white' },
        chalkboard: { label: 'Chalkboard Dark', desc: 'Deep charcoal board with luminous chalk ink' }
    };

    const RAFFLE_STYLE_PRESETS = {
        classic: { label: 'Classic Scalloped Stub', desc: 'Notched corners, scalloped stub & perforation' },
        modern: { label: 'Modern Event Pass', desc: 'Sleek rounded ticket with accent header & badge' },
        gala: { label: 'Gala Gold Frame', desc: 'Double luxury frame, corner emblems & serif look' },
        carnival: { label: 'Carnival & Fair', desc: 'Bold striped borders, stars & playful banner' },
        minimal: { label: 'Minimal Ink-Saver', desc: 'Crisp low-ink wireframe ticket for fast bulk print' },
        vip: { label: 'VIP Dark Foil', desc: 'Deep slate card face with high-contrast accents' }
    };

    const COLOR_PRESETS = {
        teal: { label: 'Classic Teal', accent: '#007670', secondary: '#0f172a', text: '#0f172a', cellBg: '#f0fdfa', border: '#0d9488', cardBg: '#ffffff' },
        print: { label: 'Classic Print', accent: '#111827', secondary: '#374151', text: '#111827', cellBg: '#f8fafc', border: '#1f2937', cardBg: '#ffffff' },
        gold: { label: 'Royal Gold', accent: '#b45309', secondary: '#78350f', text: '#1f2937', cellBg: '#fffbeb', border: '#d97706', cardBg: '#ffffff' },
        carnival: { label: 'Carnival Red', accent: '#dc2626', secondary: '#991b1b', text: '#1e293b', cellBg: '#fef2f2', border: '#ef4444', cardBg: '#ffffff' },
        berry: { label: 'Warm Berry', accent: '#be123c', secondary: '#4c0519', text: '#1e293b', cellBg: '#fff1f2', border: '#f43f5e', cardBg: '#ffffff' },
        chalkboard: { label: 'Chalkboard', accent: '#2dd4bf', secondary: '#f59e0b', text: '#f8fafc', cellBg: '#0f172a', border: '#475569', cardBg: '#1e293b' }
    };

    const FONT_OPTIONS = [
        { label: 'Segoe UI (Clean Sans)', value: 'Segoe UI, Arial, sans-serif' },
        { label: 'Georgia (Classic Serif)', value: "Georgia, 'Times New Roman', serif" },
        { label: 'Trebuchet MS (Friendly)', value: "'Trebuchet MS', Arial, sans-serif" },
        { label: 'Courier New (Ticket Mono)', value: "'Courier New', monospace" },
        { label: 'Impact (Bold Display)', value: "Impact, 'Arial Black', sans-serif" },
        { label: 'Comic Sans MS (Playful)', value: "'Comic Sans MS', cursive, sans-serif" }
    ];

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
        if (s.toLowerCase() === 'transparent') return '#ffffff';
        if (/^#[0-9a-f]{6}$/i.test(s)) return s;
        if (/^#[0-9a-f]{3}$/i.test(s)) {
            return '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
        }
        const m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
        if (m) {
            return '#' + [m[1], m[2], m[3]]
                .map(v => Math.max(0, Math.min(255, parseInt(v, 10) || 0)).toString(16).padStart(2, '0'))
                .join('');
        }
        return fb;
    }

    function hexToLuminance(hex) {
        const clean = normalizeHexColor(hex, '#ffffff').slice(1);
        const r = parseInt(clean.slice(0, 2), 16) || 0;
        const g = parseInt(clean.slice(2, 4), 16) || 0;
        const b = parseInt(clean.slice(4, 6), 16) || 0;
        return (r * 299 + g * 587 + b * 114) / 1000;
    }

    function contrastInkOn(bgHex) {
        return hexToLuminance(bgHex) >= 145 ? '#111827' : '#ffffff';
    }

    function resolveThemeColor() {
        try {
            const raw = getComputedStyle(document.documentElement).getPropertyValue('--ui-theme-color').trim();
            if (raw && (raw.startsWith('#') || raw.startsWith('rgb'))) return normalizeHexColor(raw, '#007670');
        } catch (e) {}
        return '#007670';
    }

    function getCurrentPageDimensions() {
        const paperEl = document.getElementById('paper');
        let w = paperEl ? (parseFloat(paperEl.style.width) || 794) : 794;
        let h = paperEl ? (parseFloat(paperEl.style.height) || 1123) : 1123;
        if (typeof state !== 'undefined' && state.isSpreadMode) {
            w = Math.round(w / 2);
        }
        return { width: Math.max(300, w), height: Math.max(300, h) };
    }

    // -------------------------------------------------------------------------
    // Pool Parsing, Randomizer & Bingo / Raffle Batch Generators
    // -------------------------------------------------------------------------

    function parsePoolItems(rawText) {
        const parts = String(rawText || '')
            .split(/[\n,;]+/)
            .map(s => s.trim())
            .filter(Boolean);
        const seen = new Set();
        const out = [];
        for (let i = 0; i < parts.length; i++) {
            const key = parts[i].toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                out.push(parts[i]);
            }
        }
        return out;
    }

    function fisherYatesShuffle(arr) {
        const copy = arr.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = copy[i];
            copy[i] = copy[j];
            copy[j] = tmp;
        }
        return copy;
    }

    function isNumericPool75(poolItems) {
        const nums = new Set(poolItems.map(s => parseInt(s, 10)).filter(n => !Number.isNaN(n)));
        if (nums.size < 75) return false;
        for (let n = 1; n <= 75; n++) {
            if (!nums.has(n)) return false;
        }
        return true;
    }

    function buildSingleBingoCardCells(poolItems, gridSize, hasFreeSpace, useClassicColumns) {
        const totalCells = gridSize * gridSize;
        const centerIdx = hasFreeSpace ? Math.floor(totalCells / 2) : -1;
        const needed = totalCells - (hasFreeSpace ? 1 : 0);

        if (useClassicColumns && gridSize === 5 && isNumericPool75(poolItems)) {
            const cols = [
                fisherYatesShuffle(Array.from({ length: 15 }, (_, k) => String(k + 1))).slice(0, 5),
                fisherYatesShuffle(Array.from({ length: 15 }, (_, k) => String(k + 16))).slice(0, 5),
                fisherYatesShuffle(Array.from({ length: 15 }, (_, k) => String(k + 31))).slice(0, 5),
                fisherYatesShuffle(Array.from({ length: 15 }, (_, k) => String(k + 46))).slice(0, 5),
                fisherYatesShuffle(Array.from({ length: 15 }, (_, k) => String(k + 61))).slice(0, 5)
            ];
            const cells = new Array(25);
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    const idx = r * 5 + c;
                    cells[idx] = (idx === centerIdx) ? '__FREE__' : cols[c][r];
                }
            }
            return cells;
        }

        // Pull randomized distinct items; if user supplied fewer items than `needed`, pad cleanly across rounds
        let drawn = [];
        if (poolItems.length === 0) {
            for (let k = 1; k <= needed; k++) drawn.push(String(k));
        } else if (poolItems.length >= needed) {
            drawn = fisherYatesShuffle(poolItems).slice(0, needed);
        } else {
            while (drawn.length < needed) {
                const chunk = fisherYatesShuffle(poolItems);
                for (let i = 0; i < chunk.length && drawn.length < needed; i++) {
                    drawn.push(chunk[i]);
                }
            }
        }

        const cells = [];
        let cursor = 0;
        for (let idx = 0; idx < totalCells; idx++) {
            if (idx === centerIdx) {
                cells.push('__FREE__');
            } else {
                cells.push(drawn[cursor++]);
            }
        }
        return cells;
    }

    function generateUniqueBingoBatch(cfg) {
        const poolItems = parsePoolItems(cfg.wordsText);
        const gridSize = [3, 4, 5].includes(parseInt(cfg.gridSize, 10)) ? parseInt(cfg.gridSize, 10) : 5;
        const hasFreeSpace = !!(cfg.freeCenter && (gridSize % 2 === 1));
        const requiredCount = gridSize * gridSize - (hasFreeSpace ? 1 : 0);
        const cardCount = Math.max(1, Math.min(100, parseInt(cfg.cardCount, 10) || 30));
        const useClassicColumns = !!(cfg.classicBingoColumns && gridSize === 5 && isNumericPool75(poolItems));

        const seen = new Set();
        const cards = [];
        const maxAttempts = cardCount * 60;
        let attempts = 0;
        let duplicateWarning = false;

        while (cards.length < cardCount && attempts < maxAttempts) {
            attempts++;
            const cells = buildSingleBingoCardCells(poolItems, gridSize, hasFreeSpace, useClassicColumns);
            const sig = cells.join('\x1f');
            if (!seen.has(sig)) {
                seen.add(sig);
                cards.push({
                    cardIndex: cards.length,
                    serialNumber: cards.length + 1,
                    serialLabel: `Card #${String(cards.length + 1).padStart(3, '0')} of ${String(cardCount).padStart(3, '0')}`,
                    cells
                });
            }
        }

        if (cards.length < cardCount) {
            duplicateWarning = true;
            while (cards.length < cardCount) {
                const cells = buildSingleBingoCardCells(poolItems, gridSize, hasFreeSpace, useClassicColumns);
                cards.push({
                    cardIndex: cards.length,
                    serialNumber: cards.length + 1,
                    serialLabel: `Card #${String(cards.length + 1).padStart(3, '0')} of ${String(cardCount).padStart(3, '0')}`,
                    cells
                });
            }
        }

        let warning = '';
        if (poolItems.length < requiredCount) {
            warning = `Pool has ${poolItems.length} unique entries (a ${gridSize}x${gridSize} grid needs ${requiredCount}). Entries repeat to fill cards; add ${requiredCount - poolItems.length}+ more for full non-repeating cards.`;
        } else if (duplicateWarning) {
            warning = 'Exhausted unique permutations for this pool size; some cards share layouts.';
        }

        return {
            cards,
            poolItems,
            gridSize,
            requiredCount,
            hasFreeSpace,
            useClassicColumns,
            warning
        };
    }

    function formatTicketSerial(num, cfg) {
        const prefix = cfg.serialPrefix != null ? String(cfg.serialPrefix) : '#';
        const suffix = cfg.serialSuffix != null ? String(cfg.serialSuffix) : '';
        const pad = Math.max(0, Math.min(8, parseInt(cfg.padDigits, 10) || 0));
        const absNum = Math.max(0, parseInt(num, 10) || 0);
        const numStr = pad > 0 ? String(absNum).padStart(pad, '0') : String(absNum);
        return `${prefix}${numStr}${suffix}`;
    }

    function generateRaffleBatch(cfg) {
        const ticketCount = Math.max(1, Math.min(200, parseInt(cfg.ticketCount, 10) || 30));
        const startNum = Math.max(0, parseInt(cfg.startNumber, 10) || 1);
        const tagSource = (cfg.raffleTagsText != null && String(cfg.raffleTagsText).trim() !== '') ? cfg.raffleTagsText : cfg.wordsText;
        const customPool = cfg.useCustomLabels ? parsePoolItems(tagSource) : [];
        const tickets = [];

        for (let i = 0; i < ticketCount; i++) {
            const numVal = startNum + i;
            tickets.push({
                ticketIndex: i,
                numberValue: numVal,
                serialText: formatTicketSerial(numVal, cfg),
                customLabel: customPool.length > 0 ? customPool[i % customPool.length] : ''
            });
        }
        return { tickets, startNum, endNum: startNum + ticketCount - 1 };
    }

    // -------------------------------------------------------------------------
    // SVG Typography Wrapping & Barcode Helper
    // -------------------------------------------------------------------------

    function wrapCellText(rawText, gridSize) {
        const text = String(rawText || '').trim();
        if (!text) return { lines: [''], fontSize: 18, lineHeight: 20 };

        const baseMax = gridSize === 3 ? 28 : (gridSize === 4 ? 22 : 18);
        const maxPerLine = gridSize === 3 ? 13 : (gridSize === 4 ? 10 : 8);

        if (text.length <= maxPerLine && !text.includes(' ')) {
            const fs = text.length <= 3 ? (gridSize === 5 ? 24 : 28)
                : text.length <= 6 ? (gridSize === 5 ? 16 : 20)
                : Math.max(9.5, Math.min(15, (gridSize === 5 ? 88 : 112) / text.length));
            return { lines: [text], fontSize: fs, lineHeight: fs * 1.15 };
        }

        const words = text.split(/\s+/);
        const lines = [];
        let current = '';

        for (let i = 0; i < words.length; i++) {
            const w = words[i];
            if (!current) {
                current = w;
            } else if ((current.length + 1 + w.length) <= maxPerLine + 2) {
                current += ' ' + w;
            } else {
                lines.push(current);
                current = w;
            }
        }
        if (current) lines.push(current);

        // Clamp to at most 3 lines
        if (lines.length > 3) {
            const head = lines.slice(0, 2);
            head.push(lines.slice(2).join(' '));
            lines.length = 0;
            lines.push(...head);
        }

        const longest = lines.reduce((m, ln) => Math.max(m, ln.length), 1);
        let fs = baseMax;
        if (lines.length === 1) {
            fs = longest <= 2 ? (gridSize === 5 ? 26 : 30)
                : longest <= 5 ? (gridSize === 5 ? 18 : 22)
                : Math.max(9.5, Math.min(baseMax, (gridSize === 5 ? 92 : 118) / longest));
        } else if (lines.length === 2) {
            fs = Math.max(9, Math.min(gridSize === 5 ? 13.5 : 16.5, (gridSize === 5 ? 96 : 120) / longest));
        } else {
            fs = Math.max(8, Math.min(gridSize === 5 ? 11.2 : 13.5, (gridSize === 5 ? 94 : 116) / longest));
        }

        return { lines, fontSize: fs, lineHeight: fs * 1.16 };
    }

    function buildBarcodeBarsSvg(seedNum, x, y, w, h, color, vertical) {
        const bars = [];
        let seed = ((seedNum + 17) * 2654435761) >>> 0;
        const count = 22;
        if (vertical) {
            const step = h / count;
            for (let i = 0; i < count; i++) {
                seed = (seed * 1664525 + 1013904223) >>> 0;
                const thickness = ((seed >> 24) % 3 === 0) ? step * 0.72 : (((seed >> 16) % 2 === 0) ? step * 0.45 : step * 0.28);
                if ((seed & 7) !== 0) {
                    bars.push(`<rect x="${x.toFixed(1)}" y="${(y + i * step).toFixed(1)}" width="${w.toFixed(1)}" height="${thickness.toFixed(1)}" fill="${escapeXml(color)}" opacity="0.82"/>`);
                }
            }
        } else {
            const step = w / count;
            for (let i = 0; i < count; i++) {
                seed = (seed * 1664525 + 1013904223) >>> 0;
                const thickness = ((seed >> 24) % 3 === 0) ? step * 0.72 : (((seed >> 16) % 2 === 0) ? step * 0.45 : step * 0.28);
                if ((seed & 7) !== 0) {
                    bars.push(`<rect x="${(x + i * step).toFixed(1)}" y="${y.toFixed(1)}" width="${thickness.toFixed(1)}" height="${h.toFixed(1)}" fill="${escapeXml(color)}" opacity="0.82"/>`);
                }
            }
        }
        return bars.join('');
    }

    // -------------------------------------------------------------------------
    // SVG Renderers: Bingo Card, Caller's Master Sheet & Raffle Ticket
    // -------------------------------------------------------------------------

    function buildBingoCardSvg(cardData, cfg, totalCards) {
        const vbW = 500;
        const vbH = 620;
        const style = cfg.cardStyle || 'classic';
        const gridSize = [3, 4, 5].includes(parseInt(cfg.gridSize, 10)) ? parseInt(cfg.gridSize, 10) : 5;
        const fontFamily = cfg.fontFamily || 'Segoe UI, Arial, sans-serif';

        const accent = normalizeHexColor(cfg.accentColor, '#007670');
        const secondary = normalizeHexColor(cfg.secondaryColor, '#0f172a');
        const textCol = normalizeHexColor(cfg.textColor, '#0f172a');
        const cellBg = normalizeHexColor(cfg.cellBgColor, '#f0fdfa');
        const borderCol = normalizeHexColor(cfg.borderColor, '#0d9488');
        const cardBg = normalizeHexColor(cfg.cardBgColor, '#ffffff');

        const isInkSaver = style === 'inksaver';
        const effectiveBg = cardBg;
        const effectiveCellTint = cellBg;
        const effectiveText = textCol;
        const effectiveAccent = accent;
        const effectiveBorder = borderCol;
        const headerTextInk = contrastInkOn(effectiveAccent);

        const cornerStyle = cfg.cellCornerStyle || 'sharp';
        const cellRadius = cornerStyle === 'rounded' ? 8 : (cornerStyle === 'soft' ? 4 : 0);
        const cardRadius = (style === 'modern' || style === 'festive') ? 18 : (style === 'vintage' ? 8 : 12);

        const pad = 24;
        const innerW = vbW - pad * 2;
        const bannerTop = 26;
        const hasSubtitle = Boolean((cfg.subtitle || '').trim());
        const bannerH = hasSubtitle ? 74 : 62;
        const headerStr = (cfg.title || 'BINGO').trim() || 'BINGO';
        const splitLetters = headerStr.replace(/\s+/g, '');
        const splitIntoColumns = cfg.splitHeaderLetters !== false && splitLetters.length === gridSize;

        const gridTop = bannerTop + bannerH + (splitIntoColumns ? 48 : 14);
        const footerH = cfg.showSerial ? 30 : 12;
        const gridAreaH = vbH - gridTop - pad - footerH;
        const gridAreaSize = Math.min(innerW, gridAreaH);
        const gridLeft = (vbW - gridAreaSize) / 2;
        const gap = cornerStyle === 'rounded' ? 5 : (cornerStyle === 'soft' ? 3 : 0);
        const cellSize = (gridAreaSize - gap * (gridSize - 1)) / gridSize;

        const parts = [];
        parts.push(`<svg xmlns="${SVG_NS}" viewBox="0 0 ${vbW} ${vbH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%;">`);

        // Outer Card Body
        parts.push(`<rect x="4" y="4" width="${vbW - 8}" height="${vbH - 8}" rx="${cardRadius}" fill="${escapeXml(effectiveBg)}" stroke="${escapeXml(effectiveBorder)}" stroke-width="${style === 'modern' ? 2 : 3}"/>`);

        // Style-specific ornamental frames
        if (style === 'vintage') {
            parts.push(`<rect x="11" y="11" width="${vbW - 22}" height="${vbH - 22}" rx="5" fill="none" stroke="${escapeXml(effectiveAccent)}" stroke-width="1.2" stroke-dasharray="4 3"/>`);
            const cPts = [[16, 16], [vbW - 16, 16], [16, vbH - 16], [vbW - 16, vbH - 16]];
            cPts.forEach(([cx, cy]) => {
                parts.push(`<circle cx="${cx}" cy="${cy}" r="3.2" fill="${escapeXml(effectiveAccent)}"/>`);
            });
        } else if (style === 'festive') {
            parts.push(`<rect x="10" y="10" width="${vbW - 20}" height="${vbH - 20}" rx="14" fill="none" stroke="${escapeXml(effectiveAccent)}" stroke-opacity="0.35" stroke-width="1.5"/>`);
        }

        // Top Title Banner
        if (isInkSaver) {
            parts.push(`<rect x="${pad}" y="${bannerTop}" width="${innerW}" height="${bannerH}" rx="10" fill="none" stroke="${escapeXml(effectiveAccent)}" stroke-width="2.2"/>`);
            parts.push(`<text x="${vbW / 2}" y="${bannerTop + (hasSubtitle ? 34 : bannerH / 2 + 1)}" text-anchor="middle" dominant-baseline="central" font-family="${escapeXml(fontFamily)}" font-size="${splitIntoColumns ? 26 : 30}" font-weight="900" letter-spacing="3" fill="${escapeXml(effectiveAccent)}">${escapeXml(splitIntoColumns ? (cfg.eventBanner || 'GAME NIGHT') : headerStr)}</text>`);
            if (hasSubtitle) {
                parts.push(`<text x="${vbW / 2}" y="${bannerTop + 56}" text-anchor="middle" font-family="${escapeXml(fontFamily)}" font-size="11.5" font-weight="600" fill="${escapeXml(effectiveText)}" opacity="0.82">${escapeXml(cfg.subtitle)}</text>`);
            }
        } else {
            parts.push(`<rect x="${pad}" y="${bannerTop}" width="${innerW}" height="${bannerH}" rx="${style === 'modern' ? 12 : 8}" fill="${escapeXml(effectiveAccent)}"/>`);
            if (style === 'festive') {
                parts.push(`<polygon points="${pad + 18},${bannerTop + 14} ${pad + 21},${bannerTop + 21} ${pad + 28},${bannerTop + 22} ${pad + 23},${bannerTop + 27} ${pad + 24},${bannerTop + 34} ${pad + 18},${bannerTop + 30} ${pad + 12},${bannerTop + 34} ${pad + 13},${bannerTop + 27} ${pad + 8},${bannerTop + 22} ${pad + 15},${bannerTop + 21}" fill="${escapeXml(headerTextInk)}" opacity="0.72"/>`);
                parts.push(`<polygon points="${vbW - pad - 18},${bannerTop + 14} ${vbW - pad - 15},${bannerTop + 21} ${vbW - pad - 8},${bannerTop + 22} ${vbW - pad - 13},${bannerTop + 27} ${vbW - pad - 12},${bannerTop + 34} ${vbW - pad - 18},${bannerTop + 30} ${vbW - pad - 24},${bannerTop + 34} ${vbW - pad - 23},${bannerTop + 27} ${vbW - pad - 28},${bannerTop + 22} ${vbW - pad - 21},${bannerTop + 21}" fill="${escapeXml(headerTextInk)}" opacity="0.72"/>`);
            }
            const bannerHeadline = splitIntoColumns ? (cfg.eventBanner && cfg.eventBanner.trim() ? cfg.eventBanner.trim() : `${headerStr} NIGHT`) : headerStr;
            const headSize = bannerHeadline.length > 18 ? 20 : (bannerHeadline.length > 12 ? 24 : 30);
            parts.push(`<text x="${vbW / 2}" y="${bannerTop + (hasSubtitle ? 30 : bannerH / 2 + 1)}" text-anchor="middle" dominant-baseline="central" font-family="${escapeXml(fontFamily)}" font-size="${headSize}" font-weight="900" letter-spacing="${splitIntoColumns ? 1.5 : 4}" fill="${escapeXml(headerTextInk)}">${escapeXml(bannerHeadline)}</text>`);
            if (hasSubtitle) {
                parts.push(`<text x="${vbW / 2}" y="${bannerTop + 56}" text-anchor="middle" font-family="${escapeXml(fontFamily)}" font-size="11.5" font-weight="600" fill="${escapeXml(headerTextInk)}" opacity="0.88">${escapeXml(cfg.subtitle)}</text>`);
            }
        }

        // Column Letters Row (e.g. B - I - N - G - O)
        if (splitIntoColumns) {
            const colRowY = bannerTop + bannerH + 10;
            const colH = 34;
            for (let c = 0; c < gridSize; c++) {
                const cx = gridLeft + c * (cellSize + gap);
                const colBoxFill = isInkSaver ? effectiveCellTint : secondary;
                const colTextFill = isInkSaver ? effectiveText : contrastInkOn(secondary);
                if (gap > 0 || style === 'modern') {
                    parts.push(`<rect x="${cx.toFixed(1)}" y="${colRowY}" width="${cellSize.toFixed(1)}" height="${colH}" rx="6" fill="${escapeXml(colBoxFill)}" stroke="${escapeXml(effectiveBorder)}" stroke-width="1.2"/>`);
                    parts.push(`<text x="${(cx + cellSize / 2).toFixed(1)}" y="${colRowY + colH / 2 + 1}" text-anchor="middle" dominant-baseline="central" font-family="${escapeXml(fontFamily)}" font-size="22" font-weight="900" fill="${escapeXml(colTextFill)}">${escapeXml(splitLetters[c].toUpperCase())}</text>`);
                } else {
                    parts.push(`<rect x="${cx.toFixed(1)}" y="${colRowY}" width="${cellSize.toFixed(1)}" height="${colH}" fill="${escapeXml(colBoxFill)}" stroke="${escapeXml(effectiveBorder)}" stroke-width="1.5"/>`);
                    parts.push(`<text x="${(cx + cellSize / 2).toFixed(1)}" y="${colRowY + colH / 2 + 1}" text-anchor="middle" dominant-baseline="central" font-family="${escapeXml(fontFamily)}" font-size="22" font-weight="900" fill="${escapeXml(colTextFill)}">${escapeXml(splitLetters[c].toUpperCase())}</text>`);
                }
            }
        }

        // Outer Grid Backing Border when sharp
        if (gap === 0) {
            parts.push(`<rect x="${gridLeft.toFixed(1)}" y="${gridTop.toFixed(1)}" width="${gridAreaSize.toFixed(1)}" height="${gridAreaSize.toFixed(1)}" fill="none" stroke="${escapeXml(effectiveBorder)}" stroke-width="2.4"/>`);
        }

        // N x N Cells
        const cells = Array.isArray(cardData.cells) ? cardData.cells : [];
        const altTint = cfg.alternateTint !== false;
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const idx = r * gridSize + c;
                const val = cells[idx] != null ? cells[idx] : '';
                const cx = gridLeft + c * (cellSize + gap);
                const cy = gridTop + r * (cellSize + gap);
                const isFree = val === '__FREE__';

                let fillCell = effectiveBg;
                if (isFree) {
                    fillCell = isInkSaver ? effectiveCellTint : effectiveAccent;
                } else if (altTint && ((r + c) % 2 === 1)) {
                    fillCell = effectiveCellTint;
                }

                parts.push(`<rect x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" rx="${cellRadius}" fill="${escapeXml(fillCell)}" stroke="${escapeXml(effectiveBorder)}" stroke-width="${gap > 0 ? 1.5 : 1.3}"/>`);

                if (isFree) {
                    const freeFill = isInkSaver ? effectiveAccent : headerTextInk;
                    const midX = cx + cellSize / 2;
                    const midY = cy + cellSize / 2;
                    const sr = Math.min(cellSize * 0.24, 21);
                    const ir = sr * 0.44;
                    const starPts = [];
                    for (let k = 0; k < 10; k++) {
                        const rad = (k % 2 === 0) ? sr : ir;
                        const ang = (-Math.PI / 2) + (k * Math.PI / 5);
                        starPts.push(`${(midX + Math.cos(ang) * rad).toFixed(1)},${(midY - 8 + Math.sin(ang) * rad).toFixed(1)}`);
                    }
                    parts.push(`<polygon points="${starPts.join(' ')}" fill="${escapeXml(freeFill)}" opacity="0.92"/>`);
                    const freeLabel = (cfg.freeText || 'FREE').trim() || 'FREE';
                    parts.push(`<text x="${midX.toFixed(1)}" y="${(midY + sr + 6).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="${escapeXml(fontFamily)}" font-size="${freeLabel.length > 6 ? 10 : 12.5}" font-weight="900" letter-spacing="0.8" fill="${escapeXml(freeFill)}">${escapeXml(freeLabel)}</text>`);
                } else {
                    const fitted = wrapCellText(val, gridSize);
                    const midX = cx + cellSize / 2;
                    const totalBlockH = fitted.lines.length * fitted.lineHeight;
                    const firstY = cy + cellSize / 2 - totalBlockH / 2 + fitted.lineHeight * 0.5;

                    parts.push(`<text x="${midX.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="${escapeXml(fontFamily)}" font-size="${fitted.fontSize.toFixed(1)}" font-weight="700" fill="${escapeXml(effectiveText)}">`);
                    fitted.lines.forEach((ln, li) => {
                        parts.push(`<tspan x="${midX.toFixed(1)}" y="${(firstY + li * fitted.lineHeight).toFixed(1)}">${escapeXml(ln)}</tspan>`);
                    });
                    parts.push('</text>');
                }
            }
        }

        // Serial Number & Brand Footer
        if (cfg.showSerial) {
            const footY = vbH - 16;
            const total = totalCards || cfg.cardCount || 30;
            const label = cardData.serialLabel || `Card #${String((cardData.cardIndex || 0) + 1).padStart(3, '0')} of ${String(total).padStart(3, '0')}`;
            parts.push(`<text x="${gridLeft.toFixed(1)}" y="${footY}" font-family="Consolas, 'Courier New', monospace" font-size="11" font-weight="700" fill="${escapeXml(effectiveText)}" opacity="0.72">${escapeXml(label)}</text>`);
            parts.push(`<text x="${(gridLeft + gridAreaSize).toFixed(1)}" y="${footY}" text-anchor="end" font-family="${escapeXml(fontFamily)}" font-size="10.5" font-weight="700" fill="${escapeXml(effectiveAccent)}" opacity="0.85">${escapeXml((cfg.footerNote || '').trim())}</text>`);
        }

        parts.push('</svg>');
        return { svgMarkup: parts.join(''), width: vbW, height: vbH };
    }

    function buildBingoCallerListSvg(poolItems, cfg, totalCards) {
        const vbW = 700;
        const items = Array.isArray(poolItems) ? poolItems : [];
        const cols = items.length > 36 ? 3 : 2;
        const rows = Math.max(1, Math.ceil(items.length / cols));
        const rowH = 26;
        const headerH = 98;
        const pad = 28;
        const vbH = Math.max(420, headerH + rows * rowH + pad * 2);

        const accent = normalizeHexColor(cfg.accentColor, '#007670');
        const textCol = normalizeHexColor(cfg.textColor, '#0f172a');
        const borderCol = normalizeHexColor(cfg.borderColor, '#cbd5e1');
        const fontFamily = cfg.fontFamily || 'Segoe UI, Arial, sans-serif';
        const title = `${(cfg.title || 'BINGO').trim() || 'BINGO'} - Caller's Master Sheet`;
        const colW = (vbW - pad * 2 - (cols - 1) * 14) / cols;

        const parts = [];
        parts.push(`<svg xmlns="${SVG_NS}" viewBox="0 0 ${vbW} ${vbH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%;">`);
        parts.push(`<rect x="4" y="4" width="${vbW - 8}" height="${vbH - 8}" rx="12" fill="#ffffff" stroke="${escapeXml(borderCol)}" stroke-width="2"/>`);
        parts.push(`<rect x="${pad}" y="22" width="${vbW - pad * 2}" height="56" rx="8" fill="${escapeXml(accent)}"/>`);
        const hInk = contrastInkOn(accent);
        parts.push(`<text x="${vbW / 2}" y="44" text-anchor="middle" dominant-baseline="central" font-family="${escapeXml(fontFamily)}" font-size="20" font-weight="800" fill="${escapeXml(hInk)}">${escapeXml(title)}</text>`);
        parts.push(`<text x="${vbW / 2}" y="66" text-anchor="middle" font-family="${escapeXml(fontFamily)}" font-size="11.5" font-weight="600" fill="${escapeXml(hInk)}" opacity="0.9">${items.length} Unique Pool Entries • ${totalCards} Non-Identical Cards • Check off each item as called</text>`);

        items.forEach((item, idx) => {
            const col = Math.floor(idx / rows);
            const row = idx % rows;
            const x = pad + col * (colW + 14);
            const y = headerH + row * rowH;
            parts.push(`<rect x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" width="14" height="14" rx="3" fill="#ffffff" stroke="${escapeXml(accent)}" stroke-width="1.6"/>`);
            parts.push(`<text x="${(x + 22).toFixed(1)}" y="${(y + 11.5).toFixed(1)}" dominant-baseline="central" font-family="Consolas, monospace" font-size="10.5" font-weight="700" fill="${escapeXml(accent)}">${idx + 1}.</text>`);
            const label = item.length > 24 ? item.slice(0, 23) + '...' : item;
            parts.push(`<text x="${(x + 48).toFixed(1)}" y="${(y + 11.5).toFixed(1)}" dominant-baseline="central" font-family="${escapeXml(fontFamily)}" font-size="12" font-weight="600" fill="${escapeXml(textCol)}">${escapeXml(label)}</text>`);
            if (row < rows - 1) {
                parts.push(`<line x1="${x.toFixed(1)}" y1="${(y + rowH - 1).toFixed(1)}" x2="${(x + colW).toFixed(1)}" y2="${(y + rowH - 1).toFixed(1)}" stroke="#e2e8f0" stroke-width="1"/>`);
            }
        });

        parts.push('</svg>');
        return { svgMarkup: parts.join(''), width: vbW, height: vbH };
    }

    function buildRaffleTicketSvg(ticket, cfg) {
        const vbW = 760;
        const vbH = 240;
        const style = cfg.ticketStyle || 'classic';
        const stubPos = cfg.stubPosition === 'right' ? 'right' : 'left';
        const perfStyle = cfg.perforationStyle || 'notches-scissors';
        const fontFamily = cfg.fontFamily || 'Segoe UI, Arial, sans-serif';

        const accent = normalizeHexColor(cfg.accentColor, '#007670');
        const secondary = normalizeHexColor(cfg.secondaryColor, '#0f172a');
        const textCol = normalizeHexColor(cfg.textColor, '#0f172a');
        const tintBg = normalizeHexColor(cfg.cellBgColor, '#f0fdfa');
        const borderCol = normalizeHexColor(cfg.borderColor, '#0d9488');
        const cardBg = normalizeHexColor(cfg.cardBgColor, '#ffffff');

        const isMinimal = style === 'minimal';
        const effectiveBg = cardBg;
        const effectiveTint = tintBg;
        const effectiveText = textCol;
        const effectiveAccent = accent;
        const effectiveBorder = borderCol;
        const headerInk = contrastInkOn(effectiveAccent);

        const stubW = 216;
        const perfX = stubPos === 'left' ? stubW : (vbW - stubW);
        const stubX = stubPos === 'left' ? 10 : perfX;
        const bodyX = stubPos === 'left' ? perfX : 10;
        const bodyW = vbW - stubW - 10;

        const parts = [];
        parts.push(`<svg xmlns="${SVG_NS}" viewBox="0 0 ${vbW} ${vbH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%;">`);

        const clipId = `rt-clip-${ticket.ticketIndex || 0}-${Math.floor(Math.random() * 100000)}`;
        const hasNotches = perfStyle !== 'dashed';

        // Outer ticket silhouette (notched corners for classic/carnival or sleek rounded rect for modern)
        let outlineD = '';
        if (style === 'classic' || style === 'carnival' || style === 'gala') {
            const notch = 14;
            const rPerf = 11;
            if (hasNotches) {
                outlineD = `M ${10 + notch} 10 L ${perfX - rPerf} 10 A ${rPerf} ${rPerf} 0 0 0 ${perfX + rPerf} 10 L ${vbW - 10 - notch} 10 A ${notch} ${notch} 0 0 0 ${vbW - 10} ${10 + notch} L ${vbW - 10} ${vbH - 10 - notch} A ${notch} ${notch} 0 0 0 ${vbW - 10 - notch} ${vbH - 10} L ${perfX + rPerf} ${vbH - 10} A ${rPerf} ${rPerf} 0 0 0 ${perfX - rPerf} ${vbH - 10} L ${10 + notch} ${vbH - 10} A ${notch} ${notch} 0 0 0 10 ${vbH - 10 - notch} L 10 ${10 + notch} A ${notch} ${notch} 0 0 0 ${10 + notch} 10 Z`;
            } else {
                outlineD = `M ${10 + notch} 10 L ${vbW - 10 - notch} 10 A ${notch} ${notch} 0 0 0 ${vbW - 10} ${10 + notch} L ${vbW - 10} ${vbH - 10 - notch} A ${notch} ${notch} 0 0 0 ${vbW - 10 - notch} ${vbH - 10} L ${10 + notch} ${vbH - 10} A ${notch} ${notch} 0 0 0 10 ${vbH - 10 - notch} L 10 ${10 + notch} A ${notch} ${notch} 0 0 0 ${10 + notch} 10 Z`;
            }
        } else {
            const r = style === 'modern' ? 14 : 6;
            const rPerf = 10;
            if (hasNotches) {
                outlineD = `M ${10 + r} 10 L ${perfX - rPerf} 10 A ${rPerf} ${rPerf} 0 0 0 ${perfX + rPerf} 10 L ${vbW - 10 - r} 10 Q ${vbW - 10} 10 ${vbW - 10} ${10 + r} L ${vbW - 10} ${vbH - 10 - r} Q ${vbW - 10} ${vbH - 10} ${vbW - 10 - r} ${vbH - 10} L ${perfX + rPerf} ${vbH - 10} A ${rPerf} ${rPerf} 0 0 0 ${perfX - rPerf} ${vbH - 10} L ${10 + r} ${vbH - 10} Q 10 ${vbH - 10} 10 ${vbH - 10 - r} L 10 ${10 + r} Q 10 10 ${10 + r} 10 Z`;
            } else {
                outlineD = `M ${10 + r} 10 L ${vbW - 10 - r} 10 Q ${vbW - 10} 10 ${vbW - 10} ${10 + r} L ${vbW - 10} ${vbH - 10 - r} Q ${vbW - 10} ${vbH - 10} ${vbW - 10 - r} ${vbH - 10} L ${10 + r} ${vbH - 10} Q 10 ${vbH - 10} 10 ${vbH - 10 - r} L 10 ${10 + r} Q 10 10 ${10 + r} 10 Z`;
            }
        }

        parts.push(`<defs><clipPath id="${clipId}"><path d="${outlineD}"/></clipPath></defs>`);
        parts.push(`<path d="${outlineD}" fill="${escapeXml(effectiveBg)}" stroke="${escapeXml(effectiveBorder)}" stroke-width="2.6"/>`);
        parts.push(`<g clip-path="url(#${clipId})">`);

        // Stub background tint
        parts.push(`<rect x="${stubX}" y="10" width="${stubW - (stubPos === 'left' ? 10 : 10)}" height="${vbH - 20}" fill="${escapeXml(effectiveTint)}"/>`);

        // Decorative style accents inside body
        if (style === 'carnival') {
            parts.push(`<rect x="${bodyX}" y="10" width="${bodyW}" height="12" fill="${escapeXml(effectiveAccent)}"/>`);
            parts.push(`<rect x="${bodyX}" y="${vbH - 22}" width="${bodyW}" height="12" fill="${escapeXml(effectiveAccent)}"/>`);
        } else if (style === 'modern') {
            const barX = stubPos === 'left' ? vbW - 26 : 10;
            parts.push(`<rect x="${barX}" y="10" width="16" height="${vbH - 20}" fill="${escapeXml(effectiveAccent)}"/>`);
        } else if (style === 'gala') {
            parts.push(`<rect x="${bodyX + 12}" y="20" width="${bodyW - 24}" height="${vbH - 40}" rx="4" fill="none" stroke="${escapeXml(effectiveAccent)}" stroke-width="1.4"/>`);
            parts.push(`<rect x="${bodyX + 16}" y="24" width="${bodyW - 32}" height="${vbH - 48}" rx="2" fill="none" stroke="${escapeXml(effectiveAccent)}" stroke-opacity="0.55" stroke-width="1" stroke-dasharray="3 2"/>`);
        } else if (style === 'classic' || style === 'vip') {
            parts.push(`<rect x="${bodyX + 12}" y="20" width="${bodyW - 24}" height="${vbH - 40}" rx="6" fill="none" stroke="${escapeXml(effectiveBorder)}" stroke-opacity="0.45" stroke-width="1.2"/>`);
        }

        // Top Header Band on Main Ticket
        const titleTop = style === 'carnival' ? 28 : 26;
        const contentLeft = bodyX + 26;
        const contentRight = bodyX + bodyW - (style === 'modern' && stubPos === 'left' ? 30 : 24);
        const contentMidX = (contentLeft + contentRight) / 2;

        // Top Prize / Admit Badge Row
        const ticketTitle = (cfg.ticketTitle || 'GRAND COMMUNITY RAFFLE').trim() || 'RAFFLE TICKET';
        const prizeText = (cfg.ticketSubtitle || 'Official Entry Ticket • Keep This Half to Claim Prize').trim();
        const eventMeta = (cfg.ticketMeta || 'Draw Date: Saturday 7:00 PM • Main Auditorium').trim();
        const priceBadge = (cfg.ticketPrice || '').trim();
        const footerNote = (cfg.ticketFooter || 'No cash alternative • Winner need not be present if contact info completed').trim();

        // Main Body Header Pill / Banner
        const bannerFill = isMinimal ? 'none' : effectiveAccent;
        const bannerInk = isMinimal ? effectiveAccent : headerInk;
        const headerW = contentRight - contentLeft;
        const hasPrice = Boolean(priceBadge);
        const titleBoxW = hasPrice ? headerW - 98 : headerW;
        parts.push(`<rect x="${contentLeft}" y="${titleTop}" width="${titleBoxW}" height="44" rx="7" fill="${escapeXml(bannerFill)}"${isMinimal ? ` stroke="${escapeXml(effectiveAccent)}" stroke-width="1.6"` : ''}/>`);
        const titleFs = ticketTitle.length > 26 ? 17 : (ticketTitle.length > 18 ? 20 : 23);
        parts.push(`<text x="${(contentLeft + titleBoxW / 2).toFixed(1)}" y="${titleTop + 22}" text-anchor="middle" dominant-baseline="central" font-family="${escapeXml(fontFamily)}" font-size="${titleFs}" font-weight="900" letter-spacing="1.2" fill="${escapeXml(bannerInk)}">${escapeXml(ticketTitle)}</text>`);

        if (hasPrice) {
            const px = contentLeft + titleBoxW + 8;
            parts.push(`<rect x="${px}" y="${titleTop}" width="90" height="44" rx="7" fill="${escapeXml(isMinimal ? effectiveBg : secondary)}" stroke="${escapeXml(effectiveBorder)}" stroke-width="1.4"/>`);
            parts.push(`<text x="${(px + 45).toFixed(1)}" y="${titleTop + 22}" text-anchor="middle" dominant-baseline="central" font-family="${escapeXml(fontFamily)}" font-size="${priceBadge.length > 6 ? 13 : 16}" font-weight="900" fill="${escapeXml(isMinimal ? effectiveText : contrastInkOn(secondary))}">${escapeXml(priceBadge)}</text>`);
        }

        // Subtitle & Event Metadata
        if (prizeText) {
            parts.push(`<text x="${contentMidX.toFixed(1)}" y="${titleTop + 68}" text-anchor="middle" font-family="${escapeXml(fontFamily)}" font-size="15.5" font-weight="800" fill="${escapeXml(effectiveText)}">${escapeXml(prizeText)}</text>`);
        }
        if (eventMeta) {
            parts.push(`<text x="${contentMidX.toFixed(1)}" y="${titleTop + 92}" text-anchor="middle" font-family="${escapeXml(fontFamily)}" font-size="12.5" font-weight="600" fill="${escapeXml(effectiveText)}" opacity="0.82">${escapeXml(eventMeta)}</text>`);
        }

        // Optional Custom Prize / Label Tag per ticket
        if (ticket.customLabel) {
            parts.push(`<rect x="${(contentMidX - 110).toFixed(1)}" y="${titleTop + 104}" width="220" height="22" rx="11" fill="${escapeXml(effectiveAccent)}" fill-opacity="0.13" stroke="${escapeXml(effectiveAccent)}" stroke-opacity="0.45" stroke-width="1"/>`);
            parts.push(`<text x="${contentMidX.toFixed(1)}" y="${titleTop + 115}" text-anchor="middle" dominant-baseline="central" font-family="${escapeXml(fontFamily)}" font-size="11.5" font-weight="700" fill="${escapeXml(effectiveAccent)}">${escapeXml(ticket.customLabel)}</text>`);
        }

        // Matching Serial Number Badge on Main Ticket
        const serialBoxW = 148;
        const serialBoxH = 34;
        const serialBoxX = contentLeft;
        const serialBoxY = vbH - 72;
        parts.push(`<rect x="${serialBoxX}" y="${serialBoxY}" width="${serialBoxW}" height="${serialBoxH}" rx="6" fill="${escapeXml(isMinimal ? effectiveBg : effectiveTint)}" stroke="${escapeXml(effectiveAccent)}" stroke-width="1.8"/>`);
        parts.push(`<text x="${(serialBoxX + 10).toFixed(1)}" y="${serialBoxY + 11}" font-family="${escapeXml(fontFamily)}" font-size="8.5" font-weight="800" letter-spacing="0.8" fill="${escapeXml(effectiveAccent)}">TICKET NUMBER</text>`);
        parts.push(`<text x="${(serialBoxX + serialBoxW / 2).toFixed(1)}" y="${serialBoxY + 24}" text-anchor="middle" dominant-baseline="central" font-family="Consolas, 'Courier New', monospace" font-size="${ticket.serialText.length > 9 ? 13 : 16}" font-weight="900" fill="${escapeXml(effectiveText)}">${escapeXml(ticket.serialText)}</text>`);

        // Optional Deterministic Vector Barcode Strip on Main Ticket
        if (cfg.showBarcode !== false) {
            const bcX = contentRight - 145;
            const bcY = vbH - 72;
            parts.push(buildBarcodeBarsSvg(ticket.numberValue, bcX, bcY + 2, 138, 22, effectiveText, false));
            parts.push(`<text x="${(bcX + 69).toFixed(1)}" y="${bcY + 32}" text-anchor="middle" font-family="Consolas, monospace" font-size="8.5" font-weight="700" fill="${escapeXml(effectiveText)}" opacity="0.7">${escapeXml(ticket.serialText)}</text>`);
        }

        if (footerNote) {
            parts.push(`<text x="${contentMidX.toFixed(1)}" y="${vbH - 25}" text-anchor="middle" font-family="${escapeXml(fontFamily)}" font-size="9.5" font-weight="600" fill="${escapeXml(effectiveText)}" opacity="0.68">${escapeXml(footerNote)}</text>`);
        }

        // Tear-Off Stub Contents (Matching Serial + Write-in Contact Lines)
        const stubLeft = stubX + 14;
        const stubInnerW = stubW - 38;
        const stubMidX = stubLeft + stubInnerW / 2;

        // Stub Matching Serial Header Pill
        parts.push(`<rect x="${stubLeft}" y="22" width="${stubInnerW}" height="32" rx="6" fill="${escapeXml(isMinimal ? effectiveBg : effectiveAccent)}"${isMinimal ? ` stroke="${escapeXml(effectiveAccent)}" stroke-width="1.5"` : ''}/>`);
        parts.push(`<text x="${stubMidX.toFixed(1)}" y="31" text-anchor="middle" font-family="${escapeXml(fontFamily)}" font-size="7.5" font-weight="800" letter-spacing="0.9" fill="${escapeXml(bannerInk)}" opacity="0.88">RAFFLE STUB</text>`);
        parts.push(`<text x="${stubMidX.toFixed(1)}" y="45" text-anchor="middle" font-family="Consolas, 'Courier New', monospace" font-size="${ticket.serialText.length > 9 ? 12 : 14.5}" font-weight="900" fill="${escapeXml(bannerInk)}">${escapeXml(ticket.serialText)}</text>`);

        const stubMode = cfg.stubFields || 'name-phone-email';
        if (stubMode === 'serial-only') {
            parts.push(`<text x="${stubMidX.toFixed(1)}" y="98" text-anchor="middle" font-family="${escapeXml(fontFamily)}" font-size="11" font-weight="800" fill="${escapeXml(effectiveText)}">${escapeXml(ticketTitle.slice(0, 22))}</text>`);
            parts.push(`<text x="${stubMidX.toFixed(1)}" y="138" text-anchor="middle" font-family="Consolas, 'Courier New', monospace" font-size="22" font-weight="900" fill="${escapeXml(effectiveAccent)}">${escapeXml(ticket.serialText)}</text>`);
            parts.push(`<text x="${stubMidX.toFixed(1)}" y="168" text-anchor="middle" font-family="${escapeXml(fontFamily)}" font-size="10" font-weight="600" fill="${escapeXml(effectiveText)}" opacity="0.72">PLACE THIS STUB</text>`);
            parts.push(`<text x="${stubMidX.toFixed(1)}" y="182" text-anchor="middle" font-family="${escapeXml(fontFamily)}" font-size="10" font-weight="600" fill="${escapeXml(effectiveText)}" opacity="0.72">IN DRAWING DRUM</text>`);
        } else {
            const fields = stubMode === 'name-phone' ? ['Name:', 'Phone:'] : ['Name:', 'Phone:', 'Email:'];
            const startY = 74;
            const stepY = stubMode === 'name-phone' ? 52 : 38;
            fields.forEach((lbl, fi) => {
                const fy = startY + fi * stepY;
                parts.push(`<text x="${stubLeft}" y="${fy}" font-family="${escapeXml(fontFamily)}" font-size="10" font-weight="700" fill="${escapeXml(effectiveText)}" opacity="0.82">${escapeXml(lbl)}</text>`);
                parts.push(`<line x1="${stubLeft}" y1="${fy + (stepY - 14)}" x2="${stubLeft + stubInnerW}" y2="${fy + (stepY - 14)}" stroke="${escapeXml(effectiveBorder)}" stroke-opacity="0.72" stroke-width="1.2" stroke-dasharray="2 1"/>`);
            });
        }

        // Bottom stub mini reference + event name
        parts.push(`<text x="${stubMidX.toFixed(1)}" y="${vbH - 22}" text-anchor="middle" font-family="Consolas, monospace" font-size="9.5" font-weight="700" fill="${escapeXml(effectiveAccent)}">KEEP STUB FOR DRAW • ${escapeXml(ticket.serialText)}</text>`);

        parts.push('</g>'); // end clipPath

        // Perforation Tear Line + Cut Marks
        const lineTop = hasNotches ? 24 : 14;
        const lineBot = hasNotches ? vbH - 24 : vbH - 14;
        if (perfStyle === 'notches-dots') {
            parts.push(`<line x1="${perfX}" y1="${lineTop}" x2="${perfX}" y2="${lineBot}" stroke="${escapeXml(effectiveBorder)}" stroke-width="2.4" stroke-dasharray="1.5 6" stroke-linecap="round"/>`);
        } else {
            parts.push(`<line x1="${perfX}" y1="${lineTop}" x2="${perfX}" y2="${lineBot}" stroke="${escapeXml(effectiveBorder)}" stroke-width="1.8" stroke-dasharray="6 4"/>`);
        }
        if (perfStyle === 'notches-scissors') {
            // Crisp tiny vector scissors icon centered near bottom of tear line
            const sx = perfX;
            const sy = lineBot - 16;
            parts.push(`<g transform="translate(${sx}, ${sy})" fill="none" stroke="${escapeXml(effectiveAccent)}" stroke-width="1.5">`);
            parts.push(`<circle cx="-4" cy="4" r="2.8" fill="${escapeXml(effectiveBg)}"/><circle cx="4" cy="4" r="2.8" fill="${escapeXml(effectiveBg)}"/>`);
            parts.push(`<line x1="-2.5" y1="1.8" x2="3.5" y2="-7"/><line x1="2.5" y1="1.8" x2="-3.5" y2="-7"/>`);
            parts.push('</g>');
        }

        parts.push('</svg>');
        return { svgMarkup: parts.join(''), width: vbW, height: vbH };
    }

    // -------------------------------------------------------------------------
    // Multi-Up Sheet Layout & Page Preview Composer
    // -------------------------------------------------------------------------

    function computeSheetLayout(pageW, pageH, mode, perPage) {
        const margin = 36;
        const gutter = 16;
        const availW = Math.max(200, pageW - margin * 2);
        const availH = Math.max(200, pageH - margin * 2);
        const isLandscape = pageW >= pageH;

        let cols = 1;
        let rows = 1;
        if (mode === 'bingo') {
            if (perPage === 1) { cols = 1; rows = 1; }
            else if (perPage === 2) { cols = isLandscape ? 2 : 1; rows = isLandscape ? 1 : 2; }
            else { cols = 2; rows = 2; }
        } else {
            if (perPage <= 4) { cols = 1; rows = 4; }
            else if (perPage === 5) { cols = 1; rows = 5; }
            else if (perPage === 6) { cols = 2; rows = 3; }
            else if (perPage === 8) { cols = 2; rows = 4; }
            else { cols = 2; rows = 5; }
        }

        const slotW = (availW - gutter * (cols - 1)) / cols;
        const slotH = (availH - gutter * (rows - 1)) / rows;
        const itemRatio = mode === 'bingo' ? (500 / 620) : (760 / 240);

        let drawW = slotW;
        let drawH = drawW / itemRatio;
        if (drawH > slotH) {
            drawH = slotH;
            drawW = drawH * itemRatio;
        }

        const totalGridW = drawW * cols + gutter * (cols - 1);
        const totalGridH = drawH * rows + gutter * (rows - 1);
        const originX = (pageW - totalGridW) / 2;
        const originY = (pageH - totalGridH) / 2;

        const slots = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                slots.push({
                    left: originX + c * (drawW + gutter),
                    top: originY + r * (drawH + gutter),
                    width: drawW,
                    height: drawH
                });
            }
        }

        return { cols, rows, gutter, originX, originY, drawW, drawH, totalGridW, totalGridH, slots, pageW, pageH };
    }

    function buildCutGuidesSvg(layout) {
        const { cols, rows, gutter, originX, originY, drawW, drawH, totalGridW, totalGridH, pageW, pageH } = layout;
        const lines = [];
        const pad = 12;

        // Horizontal gutter lines
        for (let r = 0; r <= rows; r++) {
            const y = r === 0 ? originY : (r === rows ? originY + totalGridH : originY + r * drawH + (r - 0.5) * gutter);
            lines.push(`<line x1="${Math.max(8, originX - pad).toFixed(1)}" y1="${y.toFixed(1)}" x2="${Math.min(pageW - 8, originX + totalGridW + pad).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#64748b" stroke-opacity="0.55" stroke-width="1" stroke-dasharray="5 5"/>`);
        }
        // Vertical gutter lines
        for (let c = 0; c <= cols; c++) {
            const x = c === 0 ? originX : (c === cols ? originX + totalGridW : originX + c * drawW + (c - 0.5) * gutter);
            lines.push(`<line x1="${x.toFixed(1)}" y1="${Math.max(8, originY - pad).toFixed(1)}" x2="${x.toFixed(1)}" y2="${Math.min(pageH - 8, originY + totalGridH + pad).toFixed(1)}" stroke="#64748b" stroke-opacity="0.55" stroke-width="1" stroke-dasharray="5 5"/>`);
        }

        return {
            svgMarkup: `<svg xmlns="${SVG_NS}" viewBox="0 0 ${pageW} ${pageH}" width="100%" height="100%" preserveAspectRatio="none" style="display:block;width:100%;height:100%;pointer-events:none;">${lines.join('')}</svg>`,
            width: pageW,
            height: pageH
        };
    }

    function buildSheetPreviewSvg(mode, batch, cfg, sheetIndex) {
        const dims = getCurrentPageDimensions();
        const perPage = mode === 'bingo'
            ? ([1, 2, 4].includes(parseInt(cfg.cardsPerPage, 10)) ? parseInt(cfg.cardsPerPage, 10) : 2)
            : ([4, 5, 6, 8, 10].includes(parseInt(cfg.ticketsPerPage, 10)) ? parseInt(cfg.ticketsPerPage, 10) : 5);
        const layout = computeSheetLayout(dims.width, dims.height, mode, perPage);
        const items = mode === 'bingo' ? batch.cards : batch.tickets;
        const start = sheetIndex * perPage;
        const pageItems = items.slice(start, start + perPage);

        const parts = [];
        parts.push(`<svg xmlns="${SVG_NS}" viewBox="0 0 ${dims.width} ${dims.height}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%;">`);
        parts.push(`<rect x="0" y="0" width="${dims.width}" height="${dims.height}" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>`);

        pageItems.forEach((item, idx) => {
            const slot = layout.slots[idx];
            if (!slot) return;
            const rendered = mode === 'bingo'
                ? buildBingoCardSvg(item, cfg, items.length)
                : buildRaffleTicketSvg(item, cfg);
            parts.push(`<svg x="${slot.left.toFixed(1)}" y="${slot.top.toFixed(1)}" width="${slot.width.toFixed(1)}" height="${slot.height.toFixed(1)}" viewBox="0 0 ${rendered.width} ${rendered.height}">`);
            // Strip outer <svg ...> and </svg> to nest cleanly inside composite sheet preview
            const inner = rendered.svgMarkup.replace(/^<svg[^>]*>/i, '').replace(/<\/svg>\s*$/i, '');
            parts.push(inner);
            parts.push('</svg>');
        });

        if (cfg.showCutLines) {
            const guides = buildCutGuidesSvg(layout);
            const innerGuides = guides.svgMarkup.replace(/^<svg[^>]*>/i, '').replace(/<\/svg>\s*$/i, '');
            parts.push(innerGuides);
        }

        parts.push('</svg>');
        return { svgMarkup: parts.join(''), width: dims.width, height: dims.height };
    }

    // -------------------------------------------------------------------------
    // Serialization & Multi-Page Batch Document Insertion / Live Edit Sync
    // -------------------------------------------------------------------------

    function buildElementStatePayload(batchId, mode, cfg, itemSpecific) {
        const clean = {
            batchId,
            mode,
            title: cfg.title,
            eventBanner: cfg.eventBanner,
            subtitle: cfg.subtitle,
            wordsText: cfg.wordsText,
            poolPreset: cfg.poolPreset,
            gridSize: cfg.gridSize,
            cardCount: cfg.cardCount,
            cardsPerPage: cfg.cardsPerPage,
            cardStyle: cfg.cardStyle,
            cellCornerStyle: cfg.cellCornerStyle,
            splitHeaderLetters: cfg.splitHeaderLetters,
            freeCenter: cfg.freeCenter,
            freeText: cfg.freeText,
            classicBingoColumns: cfg.classicBingoColumns,
            alternateTint: cfg.alternateTint,
            showSerial: cfg.showSerial,
            footerNote: cfg.footerNote,
            includeCallerSheet: cfg.includeCallerSheet,
            ticketCount: cfg.ticketCount,
            startNumber: cfg.startNumber,
            serialPrefix: cfg.serialPrefix,
            serialSuffix: cfg.serialSuffix,
            padDigits: cfg.padDigits,
            ticketsPerPage: cfg.ticketsPerPage,
            ticketStyle: cfg.ticketStyle,
            stubPosition: cfg.stubPosition,
            perforationStyle: cfg.perforationStyle,
            stubFields: cfg.stubFields,
            ticketTitle: cfg.ticketTitle,
            ticketSubtitle: cfg.ticketSubtitle,
            ticketMeta: cfg.ticketMeta,
            ticketPrice: cfg.ticketPrice,
            ticketFooter: cfg.ticketFooter,
            showBarcode: cfg.showBarcode,
            useCustomLabels: cfg.useCustomLabels,
            raffleTagsText: cfg.raffleTagsText,
            showCutLines: cfg.showCutLines,
            fontFamily: cfg.fontFamily,
            accentColor: cfg.accentColor,
            secondaryColor: cfg.secondaryColor,
            textColor: cfg.textColor,
            cellBgColor: cfg.cellBgColor,
            borderColor: cfg.borderColor,
            cardBgColor: cfg.cardBgColor
        };
        if (itemSpecific) {
            Object.assign(clean, itemSpecific);
        }
        return JSON.stringify(clean);
    }

    function createSerializedShapeElement(opts) {
        return {
            id: 'pub-el-' + Math.random().toString(36).slice(2, 11),
            left: Math.round(opts.left) + 'px',
            top: Math.round(opts.top) + 'px',
            width: Math.round(opts.width) + 'px',
            height: Math.round(opts.height) + 'px',
            transform: 'none',
            zIndex: opts.zIndex != null ? opts.zIndex : 10,
            type: 'shape',
            innerHTML: opts.svgMarkup,
            contentCssText: 'width: 100%; height: 100%; transform: scale(1, 1);',
            scaleX: '1',
            scaleY: '1',
            filterAttributes: opts.filterAttributes || {}
        };
    }

    function insertBatchIntoDocument(mode, batch, cfg) {
        if (typeof window.insertMultiPageBatchIntoDocument !== 'function') {
            if (typeof showToast === 'function') showToast('Multi-page allocator unavailable.');
            return;
        }

        const dims = getCurrentPageDimensions();
        const batchId = 'br-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 10000);
        const pageBuilders = [];

        if (mode === 'bingo') {
            const perPage = [1, 2, 4].includes(parseInt(cfg.cardsPerPage, 10)) ? parseInt(cfg.cardsPerPage, 10) : 2;
            const layout = computeSheetLayout(dims.width, dims.height, 'bingo', perPage);
            const total = batch.cards.length;
            const sheetCount = Math.ceil(total / perPage);

            for (let s = 0; s < sheetCount; s++) {
                const slice = batch.cards.slice(s * perPage, (s + 1) * perPage);
                pageBuilders.push(() => {
                    const els = [];
                    slice.forEach((card, slotIdx) => {
                        const slot = layout.slots[slotIdx];
                        const rendered = buildBingoCardSvg(card, cfg, total);
                        const stateStr = buildElementStatePayload(batchId, 'bingo', cfg, {
                            itemIndex: card.cardIndex,
                            cardCells: card.cells,
                            serialLabel: card.serialLabel,
                            totalCards: total
                        });
                        els.push(createSerializedShapeElement({
                            left: slot.left,
                            top: slot.top,
                            width: slot.width,
                            height: slot.height,
                            zIndex: 10 + slotIdx,
                            svgMarkup: rendered.svgMarkup,
                            filterAttributes: {
                                'data-element-name': `Bingo Card #${card.cardIndex + 1}`,
                                'data-bingo-raffle': 'bingo-card',
                                'data-br-id': batchId,
                                'data-br-role': 'bingo-card',
                                'data-br-index': String(card.cardIndex),
                                'data-br-state': stateStr,
                                'data-aspect-lock': 'true',
                                'data-aspect-ratio': String(rendered.width / rendered.height)
                            }
                        }));
                    });
                    if (cfg.showCutLines) {
                        const guides = buildCutGuidesSvg(layout);
                        els.push(createSerializedShapeElement({
                            left: 0,
                            top: 0,
                            width: dims.width,
                            height: dims.height,
                            zIndex: 5,
                            svgMarkup: guides.svgMarkup,
                            filterAttributes: {
                                'data-element-name': 'Sheet Cut Guides',
                                'data-bingo-raffle': 'cut-guides',
                                'data-br-id': batchId,
                                'data-br-role': 'cut-guides',
                                'data-locked': 'true'
                            }
                        }));
                    }
                    return els;
                });
            }

            if (cfg.includeCallerSheet) {
                pageBuilders.push(() => {
                    const rendered = buildBingoCallerListSvg(batch.poolItems, cfg, total);
                    const margin = 42;
                    const maxW = dims.width - margin * 2;
                    const maxH = dims.height - margin * 2;
                    const scale = Math.min(maxW / rendered.width, maxH / rendered.height);
                    const w = rendered.width * scale;
                    const h = rendered.height * scale;
                    const stateStr = buildElementStatePayload(batchId, 'bingo', cfg, {
                        itemIndex: -1,
                        callerPool: batch.poolItems,
                        totalCards: total
                    });
                    return [createSerializedShapeElement({
                        left: (dims.width - w) / 2,
                        top: (dims.height - h) / 2,
                        width: w,
                        height: h,
                        zIndex: 10,
                        svgMarkup: rendered.svgMarkup,
                        filterAttributes: {
                            'data-element-name': "Bingo Caller's Master Sheet",
                            'data-bingo-raffle': 'bingo-caller',
                            'data-br-id': batchId,
                            'data-br-role': 'bingo-caller',
                            'data-br-index': '-1',
                            'data-br-state': stateStr,
                            'data-aspect-lock': 'true',
                            'data-aspect-ratio': String(rendered.width / rendered.height)
                        }
                    })];
                });
            }
        } else {
            const perPage = [4, 5, 6, 8, 10].includes(parseInt(cfg.ticketsPerPage, 10)) ? parseInt(cfg.ticketsPerPage, 10) : 5;
            const layout = computeSheetLayout(dims.width, dims.height, 'raffle', perPage);
            const total = batch.tickets.length;
            const sheetCount = Math.ceil(total / perPage);

            for (let s = 0; s < sheetCount; s++) {
                const slice = batch.tickets.slice(s * perPage, (s + 1) * perPage);
                pageBuilders.push(() => {
                    const els = [];
                    slice.forEach((ticket, slotIdx) => {
                        const slot = layout.slots[slotIdx];
                        const rendered = buildRaffleTicketSvg(ticket, cfg);
                        const stateStr = buildElementStatePayload(batchId, 'raffle', cfg, {
                            itemIndex: ticket.ticketIndex,
                            numberValue: ticket.numberValue,
                            serialText: ticket.serialText,
                            customLabel: ticket.customLabel || '',
                            totalTickets: total
                        });
                        els.push(createSerializedShapeElement({
                            left: slot.left,
                            top: slot.top,
                            width: slot.width,
                            height: slot.height,
                            zIndex: 10 + slotIdx,
                            svgMarkup: rendered.svgMarkup,
                            filterAttributes: {
                                'data-element-name': `Raffle Ticket ${ticket.serialText}`,
                                'data-bingo-raffle': 'raffle-ticket',
                                'data-br-id': batchId,
                                'data-br-role': 'raffle-ticket',
                                'data-br-index': String(ticket.ticketIndex),
                                'data-br-state': stateStr,
                                'data-aspect-lock': 'true',
                                'data-aspect-ratio': String(rendered.width / rendered.height)
                            }
                        }));
                    });
                    if (cfg.showCutLines) {
                        const guides = buildCutGuidesSvg(layout);
                        els.push(createSerializedShapeElement({
                            left: 0,
                            top: 0,
                            width: dims.width,
                            height: dims.height,
                            zIndex: 5,
                            svgMarkup: guides.svgMarkup,
                            filterAttributes: {
                                'data-element-name': 'Sheet Cut Guides',
                                'data-bingo-raffle': 'cut-guides',
                                'data-br-id': batchId,
                                'data-br-role': 'cut-guides',
                                'data-locked': 'true'
                            }
                        }));
                    }
                    return els;
                });
            }
        }

        const res = window.insertMultiPageBatchIntoDocument({
            pageBuilders,
            reuseEmptyCurrentPage: true
        });

        const firstEl = document.querySelector(`.pub-element[data-br-id="${batchId}"][data-bingo-raffle]`);
        if (firstEl && typeof window.selectElement === 'function') {
            window.selectElement(firstEl);
        }
        if (typeof window.pushHistory === 'function') window.pushHistory();

        if (typeof showToast === 'function' && res) {
            if (mode === 'bingo') {
                const callerTxt = cfg.includeCallerSheet ? " + Caller's Sheet" : '';
                showToast(`${batch.cards.length} unique Bingo cards${callerTxt} inserted across ${res.pagesCount} page${res.pagesCount === 1 ? '' : 's'}!`);
            } else {
                const firstSerial = batch.tickets[0] ? batch.tickets[0].serialText : '';
                const lastSerial = batch.tickets[batch.tickets.length - 1] ? batch.tickets[batch.tickets.length - 1].serialText : '';
                showToast(`${batch.tickets.length} Raffle tickets (${firstSerial} to ${lastSerial}) inserted across ${res.pagesCount} page${res.pagesCount === 1 ? '' : 's'}!`);
            }
        }
    }

    function updateExistingElementOrBatch(editEl, cfg, applyToWholeBatch) {
        if (!editEl || !document.contains(editEl)) return;
        const brId = editEl.getAttribute('data-br-id');
        let origSaved = {};
        try {
            origSaved = JSON.parse(editEl.getAttribute('data-br-state') || '{}');
        } catch (e) {}

        const renderForSavedItem = (savedObj) => {
            const role = savedObj.mode === 'bingo' ? (savedObj.callerPool ? 'bingo-caller' : 'bingo-card') : 'raffle-ticket';
            if (role === 'bingo-caller') {
                const rendered = buildBingoCallerListSvg(savedObj.callerPool || parsePoolItems(cfg.wordsText), cfg, savedObj.totalCards || cfg.cardCount);
                const stateStr = buildElementStatePayload(brId, 'bingo', cfg, {
                    itemIndex: -1,
                    callerPool: savedObj.callerPool || parsePoolItems(cfg.wordsText),
                    totalCards: savedObj.totalCards || cfg.cardCount
                });
                return { svgMarkup: rendered.svgMarkup, stateStr };
            }
            if (savedObj.mode === 'raffle') {
                const serialText = savedObj.serialText || formatTicketSerial(savedObj.numberValue || 1, cfg);
                const tagPool = cfg.useCustomLabels ? parsePoolItems(cfg.raffleTagsText || cfg.wordsText) : [];
                const tIdx = savedObj.itemIndex || 0;
                const resolvedTag = cfg.useCustomLabels
                    ? (tagPool.length > 0 ? tagPool[tIdx % tagPool.length] : (savedObj.customLabel || ''))
                    : '';
                const ticketObj = {
                    ticketIndex: tIdx,
                    numberValue: savedObj.numberValue || 1,
                    serialText,
                    customLabel: resolvedTag
                };
                const rendered = buildRaffleTicketSvg(ticketObj, cfg);
                const stateStr = buildElementStatePayload(brId, 'raffle', cfg, {
                    itemIndex: ticketObj.ticketIndex,
                    numberValue: ticketObj.numberValue,
                    serialText: ticketObj.serialText,
                    customLabel: ticketObj.customLabel,
                    totalTickets: savedObj.totalTickets || cfg.ticketCount
                });
                return { svgMarkup: rendered.svgMarkup, stateStr };
            }
            const cardObj = {
                cardIndex: savedObj.itemIndex || 0,
                serialLabel: savedObj.serialLabel || `Card #${String((savedObj.itemIndex || 0) + 1).padStart(3, '0')}`,
                cells: Array.isArray(savedObj.cardCells) ? savedObj.cardCells : []
            };
            const rendered = buildBingoCardSvg(cardObj, cfg, savedObj.totalCards || cfg.cardCount);
            const stateStr = buildElementStatePayload(brId, 'bingo', cfg, {
                itemIndex: cardObj.cardIndex,
                cardCells: cardObj.cells,
                serialLabel: cardObj.serialLabel,
                totalCards: savedObj.totalCards || cfg.cardCount
            });
            return { svgMarkup: rendered.svgMarkup, stateStr };
        };

        let updatedCount = 0;

        if (!applyToWholeBatch || !brId) {
            const next = renderForSavedItem(origSaved);
            const content = editEl.querySelector('.element-content');
            if (content) content.innerHTML = next.svgMarkup;
            editEl.setAttribute('data-br-state', next.stateStr);
            updatedCount = 1;
        } else {
            document.querySelectorAll(`.pub-element[data-br-id="${brId}"][data-bingo-raffle]`).forEach(el => {
                if (el.getAttribute('data-bingo-raffle') === 'cut-guides') return;
                let itemState = {};
                try {
                    itemState = JSON.parse(el.getAttribute('data-br-state') || '{}');
                } catch (e) {}
                const next = renderForSavedItem(itemState);
                const content = el.querySelector('.element-content');
                if (content) content.innerHTML = next.svgMarkup;
                el.setAttribute('data-br-state', next.stateStr);
                updatedCount++;
            });

            if (typeof state !== 'undefined' && Array.isArray(state.pages)) {
                for (let pi = 0; pi < state.pages.length; pi++) {
                    if (pi === state.currentPageIndex) continue;
                    const pg = state.pages[pi];
                    if (!pg || !Array.isArray(pg.elements)) continue;
                    for (let ei = 0; ei < pg.elements.length; ei++) {
                        const item = pg.elements[ei];
                        const attrs = item && item.filterAttributes;
                        if (!attrs || attrs['data-br-id'] !== brId) continue;
                        if (attrs['data-bingo-raffle'] === 'cut-guides') continue;
                        let itemState = {};
                        try {
                            itemState = JSON.parse(attrs['data-br-state'] || '{}');
                        } catch (e) {}
                        const next = renderForSavedItem(itemState);
                        item.innerHTML = next.svgMarkup;
                        attrs['data-br-state'] = next.stateStr;
                        updatedCount++;
                    }
                }
            }
        }

        if (typeof window.selectElement === 'function') window.selectElement(editEl);
        if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
        if (typeof window.updateSidebar === 'function') window.updateSidebar();
        if (typeof window.pushHistory === 'function') window.pushHistory();
        if (typeof showToast === 'function') {
            showToast(updatedCount > 1 ? `Updated styling across all ${updatedCount} items in batch!` : 'Item styling updated!');
        }
    }

    function installCanvasHandlers() {
        if (window._bingoRaffleCanvasHandlersInstalled) return;
        window._bingoRaffleCanvasHandlersInstalled = true;

        document.addEventListener('dblclick', function(e) {
            const el = e.target && e.target.closest ? e.target.closest('.pub-element[data-bingo-raffle]') : null;
            if (!el || el.getAttribute('data-bingo-raffle') === 'cut-guides') return;
            e.preventDefault();
            e.stopPropagation();
            if (typeof window.selectElement === 'function') window.selectElement(el);
            showModal({ editEl: el });
        }, true);
    }

    // -------------------------------------------------------------------------
    // Shared Studio UI Helpers (Dragging, Modern Selects, XP Help Window)
    // -------------------------------------------------------------------------

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
            dragState = { startX: e.clientX, startY: e.clientY, origLeft: rect.left, origTop: rect.top };
            e.preventDefault();
        };
        const onMouseMove = (e) => {
            if (!dragState) return;
            const maxLeft = Math.max(0, window.innerWidth - 120);
            const maxTop = Math.max(0, window.innerHeight - 60);
            boxEl.style.left = Math.max(-boxEl.offsetWidth + 120, Math.min(maxLeft, dragState.origLeft + (e.clientX - dragState.startX))) + 'px';
            boxEl.style.top = Math.max(0, Math.min(maxTop, dragState.origTop + (e.clientY - dragState.startY))) + 'px';
        };
        const onMouseUp = () => { dragState = null; };

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
        const selects = rootEl.querySelectorAll('select.br-select');
        const controllers = [];

        const closeAllMenus = (exceptMenu) => {
            document.querySelectorAll('.br-select-menu.open').forEach(menu => {
                if (menu !== exceptMenu) menu.classList.remove('open');
            });
            rootEl.querySelectorAll('.br-modern-select.open').forEach(btn => {
                if (!exceptMenu || btn._brMenu !== exceptMenu) btn.classList.remove('open');
            });
        };

        selects.forEach(sel => {
            sel.style.display = 'none';
            const wrapper = document.createElement('div');
            wrapper.className = 'br-select-wrap';
            sel.parentNode.insertBefore(wrapper, sel);
            wrapper.appendChild(sel);

            const trigger = document.createElement('div');
            trigger.className = 'modern-select br-modern-select';
            trigger.setAttribute('tabindex', '0');
            trigger.setAttribute('role', 'combobox');
            trigger.setAttribute('aria-expanded', 'false');

            const labelSpan = document.createElement('span');
            labelSpan.className = 'br-select-label';
            const arrowBox = document.createElement('div');
            arrowBox.className = 'arrow-box';
            arrowBox.innerHTML = '<i class="fas fa-chevron-down" style="font-size:10px;"></i>';
            trigger.appendChild(labelSpan);
            trigger.appendChild(arrowBox);
            wrapper.appendChild(trigger);

            const menu = document.createElement('div');
            menu.className = 'br-select-menu';
            document.body.appendChild(menu);
            trigger._brMenu = menu;

            const syncLabelAndActive = () => {
                const selectedOpt = sel.options[sel.selectedIndex] || sel.options[0];
                labelSpan.textContent = selectedOpt ? selectedOpt.textContent : '';
                if (sel.id === 'br-font-family' && selectedOpt) {
                    labelSpan.style.fontFamily = selectedOpt.value;
                } else {
                    labelSpan.style.fontFamily = '';
                }
                menu.querySelectorAll('.br-select-option').forEach(optBtn => {
                    optBtn.classList.toggle('active', optBtn.dataset.value === sel.value);
                });
            };

            const rebuildOptions = () => {
                menu.innerHTML = '';
                Array.from(sel.options).forEach(opt => {
                    const item = document.createElement('div');
                    item.className = 'br-select-option';
                    item.dataset.value = opt.value;
                    item.textContent = opt.textContent;
                    if (sel.id === 'br-font-family') item.style.fontFamily = opt.value;
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
                const vw = window.innerWidth || document.documentElement.clientWidth || 1280;
                const menuW = Math.max(150, rect.width);
                const clampedLeft = Math.max(8, Math.min(rect.left, vw - menuW - 8));
                menu.style.minWidth = menuW + 'px';
                menu.style.left = clampedLeft + 'px';
                const estHeight = Math.min(240, menu.children.length * 32 + 12);
                const spaceBelow = window.innerHeight - rect.bottom;
                menu.style.top = (spaceBelow < estHeight && rect.top > estHeight)
                    ? Math.max(8, rect.top - estHeight - 4) + 'px'
                    : (rect.bottom + 4) + 'px';
                menu.classList.add('open');
                trigger.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
            };

            trigger.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
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
            controllers.push({ sel, trigger, menu, syncLabelAndActive, rebuildOptions });
        });

        const controlsPane = rootEl.querySelector('.br-controls-pane');
        const onDocClick = (e) => {
            if (!e.target.closest('.br-select-wrap') && !e.target.closest('.br-select-menu')) {
                closeAllMenus(null);
            }
        };
        const onPaneScrollOrResize = () => closeAllMenus(null);
        document.addEventListener('mousedown', onDocClick);
        window.addEventListener('resize', onPaneScrollOrResize);
        if (controlsPane) controlsPane.addEventListener('scroll', onPaneScrollOrResize, { passive: true });

        return {
            syncAll: () => controllers.forEach(c => c.syncLabelAndActive()),
            closeAll: () => closeAllMenus(null),
            destroy: () => {
                document.removeEventListener('mousedown', onDocClick);
                window.removeEventListener('resize', onPaneScrollOrResize);
                if (controlsPane) controlsPane.removeEventListener('scroll', onPaneScrollOrResize);
                controllers.forEach(c => c.menu.remove());
            }
        };
    }

    function openHelpModal(parentOverlay) {
        const existingHelp = document.getElementById('op-bingoraffle-help-modal');
        if (existingHelp) existingHelp.remove();

        const topics = [
            {
                id: 'overview',
                title: 'Overview & Choosing a Mode',
                body: `
                    <p><strong>Bingo &amp; Raffle Studio</strong> lets you generate large batches of printable, multi-page event materials in seconds:</p>
                    <ul>
                        <li><strong>Bingo Cards Mode:</strong> Enter a pool of words, phrases, or numbers (50+ items recommended) and generate up to 100 randomized, strictly non-identical cards alongside a printable <em>Caller's Master Checklist Sheet</em>.</li>
                        <li><strong>Raffle Tickets Mode:</strong> Generate up to 200 sequentially numbered tickets with matching tear-off stubs, write-in contact lines, perforation notches, barcodes, and multi-up sheet layouts.</li>
                    </ul>
                `
            },
            {
                id: 'bingo',
                title: 'Randomized Bingo Cards & Uniqueness',
                body: `
                    <p>Every Bingo card in your batch is shuffled independently using Fisher-Yates randomization and checked for uniqueness:</p>
                    <ul>
                        <li><strong>50+ Word or Number Pools:</strong> Paste one item per line (or comma-separated), or pick from built-in presets like <em>Party &amp; Game Night (50 Words)</em>, <em>Classic Numbers (1-75)</em>, or <em>Classroom</em>.</li>
                        <li><strong>Guaranteed Non-Identical Cards:</strong> Generating 30 cards from 50 words automatically verifies every card has a unique arrangement (no duplicate boards).</li>
                        <li><strong>Free Space &amp; B-I-N-G-O Columns:</strong> Toggle the center star Free Space with custom text, choose 3x3, 4x4, or 5x5 grids, and enable Classic B-I-N-G-O column ranges (1-15, 16-30, 31-45, 46-60, 61-75) when using 1-75 numbers.</li>
                    </ul>
                `
            },
            {
                id: 'raffle',
                title: 'Raffle Tickets & Matching Tear-Off Stubs',
                body: `
                    <p>Design professional event and fundraiser raffle tickets ready for double-sided or single-sided sheet printing:</p>
                    <ul>
                        <li><strong>Matching Stub &amp; Ticket Numbers:</strong> Choose your starting number (e.g. <code>1</code>), prefix (<code>#</code> or <code>No. </code>), zero padding (e.g. <code>4</code> digits for <code>#0001</code> - <code>#0030</code>), and optional suffix. The exact same serial renders on both the stub and the main body.</li>
                        <li><strong>Perforation &amp; Stub Layout:</strong> Place the tear-off stub on the Left or Right with Scissors + Notches, Dotted Perforation, or Dashed tear lines, plus Name / Phone / Email write-in lines.</li>
                    </ul>
                `
            },
            {
                id: 'styling',
                title: 'Custom Styling, Colors & Cut Guides',
                body: `
                    <p>Match any school event, party theme, gala, or budget ink requirement:</p>
                    <ul>
                        <li><strong>6 Visual Styles per Mode:</strong> Switch between Classic, Modern Minimal, Vintage Carnival / Gala, Festive, Ink-Saver Black &amp; White, and Chalkboard / VIP Dark styles.</li>
                        <li><strong>Custom Color Swatches &amp; Fonts:</strong> Pick a preset palette or click any color chip (Accent, Secondary, Text, Tint, Border, Background) to dial exact brand colors.</li>
                        <li><strong>Dashed Sheet Cut Guides:</strong> Enable <em>Show Sheet Cut Guides</em> to place crisp dashed trim lines along page margins and ticket/card gutters.</li>
                    </ul>
                `
            },
            {
                id: 'multipage',
                title: 'Multi-Page Output, Re-Editing & Printing',
                body: `
                    <p>Inserting a batch automatically distributes cards or tickets evenly across multiple publication pages:</p>
                    <ul>
                        <li><strong>Automatic Page Creation:</strong> For example, 30 Bingo cards at 2 cards/page populates 15 pages (+ Page 16 Caller's Master Sheet), while 30 Raffle tickets at 5 tickets/page populates 6 pages automatically.</li>
                        <li><strong>Double-Click Re-Editing:</strong> Double-click any card or ticket later (or right-click &rarr; <em>Edit Bingo / Raffle...</em>) to update colors, fonts, or titles across that single item or the entire batch without losing unique card layouts or ticket numbers.</li>
                    </ul>
                `
            }
        ];

        const helpOverlay = document.createElement('div');
        helpOverlay.id = 'op-bingoraffle-help-modal';
        helpOverlay.className = 'br-help-overlay';
        helpOverlay.innerHTML = `
            <style>
                .br-help-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.14);
                    z-index: 1000030; display: flex; align-items: center; justify-content: center;
                    padding: 16px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .br-help-box {
                    width: 660px; max-width: 94vw; height: 470px; max-height: 86vh;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #1e293b);
                    border: 1px solid var(--ui-border, #94a3b8); border-radius: 8px;
                    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.28);
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .br-help-header {
                    padding: 6px 8px 6px 14px;
                    background: linear-gradient(135deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #004a46));
                    color: #ffffff; display: flex; align-items: center; justify-content: space-between;
                    user-select: none; min-height: 44px; box-sizing: border-box;
                }
                .br-help-toolbar {
                    display: flex; align-items: center; justify-content: space-between; gap: 8px;
                    padding: 6px 12px; background: var(--ui-surface-bg, #f1f4f6);
                    border-bottom: 1px solid var(--ui-border, #cbd5e1); font-size: 12px;
                }
                body.dark-mode .br-help-toolbar { background: #1e293b; border-color: #334155; }
                .br-help-nav-btns { display: flex; align-items: center; gap: 4px; }
                .br-xp-tool-btn {
                    display: inline-flex; align-items: center; gap: 5px;
                    padding: 4px 10px; font-size: 11.5px; font-weight: 600;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-theme-dark, #004a46);
                    border: 1px solid var(--ui-border, #cbd5e1); border-radius: 4px; cursor: pointer;
                }
                body.dark-mode .br-xp-tool-btn { background: #0f172a; color: #e2e8f0; border-color: #475569; }
                .br-xp-tool-btn:hover:not(:disabled) { border-color: var(--ui-theme-color, #007670); background: rgba(0, 118, 112, 0.08); }
                .br-xp-tool-btn:disabled { opacity: 0.45; cursor: default; }
                .br-help-split { flex: 1; display: grid; grid-template-columns: 215px 1fr; min-height: 0; }
                .br-help-toc {
                    background: var(--ui-surface-bg, #f8fafc); border-right: 1px solid var(--ui-border, #cbd5e1);
                    padding: 10px 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 3px;
                }
                body.dark-mode .br-help-toc { background: #0f172a; border-right-color: #334155; }
                .br-help-toc-head {
                    font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
                    color: var(--ui-theme-color, #007670); padding: 2px 6px 6px;
                }
                .br-help-topic-btn {
                    width: 100%; text-align: left; border: 1px solid transparent; background: transparent;
                    color: var(--ui-text, #1e293b); padding: 7px 9px; border-radius: 4px;
                    font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 7px;
                }
                .br-help-topic-btn i { color: var(--ui-theme-color, #007670); font-size: 11px; flex-shrink: 0; }
                .br-help-topic-btn:hover { background: rgba(0, 118, 112, 0.08); }
                .br-help-topic-btn.active { background: var(--ui-theme-color, #007670); color: #ffffff; font-weight: 700; }
                .br-help-topic-btn.active i { color: #ffffff; }
                body.dark-mode .br-help-topic-btn { color: #e2e8f0; }
                .br-help-pane { padding: 16px 20px; overflow-y: auto; font-size: 13px; line-height: 1.55; }
                .br-help-pane h4 {
                    margin: 0 0 10px; font-size: 16px; color: var(--ui-theme-color, #007670);
                    border-bottom: 1px solid var(--ui-border, #e2e8f0); padding-bottom: 6px;
                }
                .br-help-pane ul { margin: 8px 0 0; padding-left: 18px; }
                .br-help-pane li { margin-bottom: 7px; }
                .br-help-pane code {
                    padding: 1px 5px; border-radius: 3px; font-size: 11.5px;
                    background: rgba(0, 118, 112, 0.1); color: var(--ui-theme-dark, #004a46);
                }
                body.dark-mode .br-help-pane code { background: rgba(45, 212, 191, 0.15); color: #5eead4; }
                .br-help-footer {
                    padding: 9px 14px; border-top: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-surface-bg, #f8fafc); display: flex; justify-content: flex-end;
                }
                body.dark-mode .br-help-footer { background: #1e293b; border-top-color: #334155; }
                .br-help-ok {
                    padding: 6px 18px; border-radius: 5px; border: none; font-weight: 700; font-size: 12.5px;
                    background: var(--ui-theme-color, #007670); color: #ffffff; cursor: pointer;
                }
                .br-help-ok:hover { background: var(--ui-theme-dark, #004a46); }
                body.bright-theme .br-help-header,
                body.bright-theme .br-help-header .custom-dialog-close,
                body.bright-theme .br-help-topic-btn.active,
                body.bright-theme .br-help-topic-btn.active i,
                body.bright-theme .br-help-ok {
                    color: #111111 !important;
                }
                body.bright-theme .br-help-header .custom-dialog-close:hover {
                    background: rgba(0, 0, 0, 0.14) !important;
                    color: #000000 !important;
                }
                @media (max-width: 560px) {
                    .br-help-split { grid-template-columns: 1fr; }
                    .br-help-toc { max-height: 130px; border-right: none; border-bottom: 1px solid var(--ui-border, #cbd5e1); }
                }
            </style>
            <div class="br-help-box" id="br-help-box" role="dialog" aria-modal="true" aria-labelledby="br-help-title">
                <div class="br-help-header" id="br-help-header">
                    <span id="br-help-title" style="display:flex; align-items:center; gap:8px; font-weight:700; font-size:13.5px;">
                        <i class="fas fa-book-open"></i> Bingo &amp; Raffle Studio Help
                    </span>
                    <button type="button" class="custom-dialog-close" id="br-help-close-x" aria-label="Close Help">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="br-help-toolbar">
                    <div class="br-help-nav-btns">
                        <button type="button" class="br-xp-tool-btn" id="br-help-back-btn" disabled><i class="fas fa-arrow-left"></i> Back</button>
                        <button type="button" class="br-xp-tool-btn" id="br-help-fwd-btn" disabled>Forward <i class="fas fa-arrow-right"></i></button>
                    </div>
                    <span id="br-help-breadcrumb" style="font-weight:600; opacity:0.8;">Overview &amp; Choosing a Mode</span>
                </div>
                <div class="br-help-split">
                    <div class="br-help-toc">
                        <div class="br-help-toc-head">Contents</div>
                        ${topics.map((t, i) => `
                            <button type="button" class="br-help-topic-btn${i === 0 ? ' active' : ''}" data-topic-id="${t.id}">
                                <i class="fas fa-file-alt"></i><span>${escapeXml(t.title)}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="br-help-pane" id="br-help-content"></div>
                </div>
                <div class="br-help-footer">
                    <button type="button" class="br-help-ok" id="br-help-ok-btn">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(helpOverlay);
        const helpBox = helpOverlay.querySelector('#br-help-box');
        const helpHeader = helpOverlay.querySelector('#br-help-header');
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
            helpOverlay.querySelectorAll('.br-help-topic-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.topicId === topic.id);
            });
            helpOverlay.querySelector('#br-help-breadcrumb').textContent = topic.title;
            helpOverlay.querySelector('#br-help-content').innerHTML = `<h4>${escapeXml(topic.title)}</h4>${topic.body}`;
            helpOverlay.querySelector('#br-help-back-btn').disabled = histIdx <= 0;
            helpOverlay.querySelector('#br-help-fwd-btn').disabled = histIdx >= history.length - 1;
        };

        helpOverlay.querySelectorAll('.br-help-topic-btn').forEach(btn => {
            btn.addEventListener('click', () => renderTopic(btn.dataset.topicId, true));
        });
        helpOverlay.querySelector('#br-help-back-btn').addEventListener('click', () => {
            if (histIdx > 0) {
                histIdx--;
                renderTopic(history[histIdx], false);
            }
        });
        helpOverlay.querySelector('#br-help-fwd-btn').addEventListener('click', () => {
            if (histIdx < history.length - 1) {
                histIdx++;
                renderTopic(history[histIdx], false);
            }
        });

        const closeHelp = () => {
            teardownDrag();
            helpOverlay.remove();
        };
        helpOverlay.querySelector('#br-help-close-x').addEventListener('click', closeHelp);
        helpOverlay.querySelector('#br-help-ok-btn').addEventListener('click', closeHelp);
        helpOverlay.addEventListener('mousedown', (e) => {
            if (e.target === helpOverlay && typeof window.triggerModalPulse === 'function') {
                window.triggerModalPulse(helpBox);
            }
        });

        renderTopic(topics[0].id, false);
        if (parentOverlay && !document.body.contains(parentOverlay)) closeHelp();
    }

    // -------------------------------------------------------------------------
    // Main Bingo & Raffle Studio Modal
    // -------------------------------------------------------------------------

    function showModal(options) {
        const opts = options || {};
        const existing = document.getElementById('op-bingoraffle-modal');
        if (existing) existing.remove();
        const existingHelp = document.getElementById('op-bingoraffle-help-modal');
        if (existingHelp) existingHelp.remove();

        const editEl = (opts.editEl && document.contains(opts.editEl)) ? opts.editEl : null;
        let saved = null;
        if (editEl) {
            try {
                saved = JSON.parse(editEl.getAttribute('data-br-state') || 'null');
            } catch (e) {
                saved = null;
            }
        }

        const themeColor = resolveThemeColor();
        const initialMode = (saved && (saved.mode === 'bingo' || saved.mode === 'raffle'))
            ? saved.mode
            : (opts.mode === 'raffle' ? 'raffle' : 'bingo');

        const modalState = {
            mode: initialMode,
            // Bingo config
            title: (saved && saved.title) || 'BINGO',
            eventBanner: (saved && saved.eventBanner) || 'COMMUNITY GAME NIGHT',
            subtitle: (saved && saved.subtitle) || 'Match 5 in a row horizontally, vertically, or diagonally!',
            poolPreset: (saved && saved.poolPreset) || 'party50',
            wordsText: (saved && saved.wordsText) || BINGO_POOL_PRESETS.party50.text,
            gridSize: (saved && saved.gridSize) || 5,
            cardCount: (saved && saved.cardCount) || 30,
            cardsPerPage: (saved && saved.cardsPerPage) || 2,
            cardStyle: (saved && saved.cardStyle) || 'classic',
            cellCornerStyle: (saved && saved.cellCornerStyle) || 'sharp',
            splitHeaderLetters: (saved && saved.splitHeaderLetters != null) ? !!saved.splitHeaderLetters : true,
            freeCenter: (saved && saved.freeCenter != null) ? !!saved.freeCenter : true,
            freeText: (saved && saved.freeText) || 'FREE',
            classicBingoColumns: !!(saved && saved.classicBingoColumns),
            alternateTint: (saved && saved.alternateTint != null) ? !!saved.alternateTint : true,
            showSerial: (saved && saved.showSerial != null) ? !!saved.showSerial : true,
            footerNote: (saved && saved.footerNote) || 'Open Publisher Edition',
            includeCallerSheet: (saved && saved.includeCallerSheet != null) ? !!saved.includeCallerSheet : true,
            // Raffle config
            ticketCount: (saved && saved.ticketCount) || 30,
            startNumber: (saved && saved.startNumber != null) ? saved.startNumber : 1,
            serialPrefix: (saved && saved.serialPrefix != null) ? saved.serialPrefix : '#',
            serialSuffix: (saved && saved.serialSuffix != null) ? saved.serialSuffix : '',
            padDigits: (saved && saved.padDigits != null) ? saved.padDigits : 4,
            ticketsPerPage: (saved && saved.ticketsPerPage) || 5,
            ticketStyle: (saved && saved.ticketStyle) || 'classic',
            stubPosition: (saved && saved.stubPosition) || 'left',
            perforationStyle: (saved && saved.perforationStyle) || 'notches-scissors',
            stubFields: (saved && saved.stubFields) || 'name-phone-email',
            ticketTitle: (saved && saved.ticketTitle) || 'GRAND COMMUNITY RAFFLE',
            ticketSubtitle: (saved && saved.ticketSubtitle) || 'Official Entry Ticket • Win Great Prizes!',
            ticketMeta: (saved && saved.ticketMeta) || 'Drawing: Saturday, 7:00 PM • Main Event Hall',
            ticketPrice: (saved && saved.ticketPrice != null) ? saved.ticketPrice : '$5.00',
            ticketFooter: (saved && saved.ticketFooter) || 'Please complete stub & retain main ticket half to claim prize.',
            showBarcode: (saved && saved.showBarcode != null) ? !!saved.showBarcode : true,
            useCustomLabels: !!(saved && saved.useCustomLabels),
            raffleTagsText: (saved && saved.raffleTagsText != null) ? saved.raffleTagsText : 'Grand Prize Entry\nVIP Bonus Draw\nEarly Bird Special\nDoor Prize Entry',
            // Shared styling
            showCutLines: (saved && saved.showCutLines != null) ? !!saved.showCutLines : true,
            fontFamily: (saved && saved.fontFamily) || 'Segoe UI, Arial, sans-serif',
            accentColor: (saved && saved.accentColor) || themeColor,
            secondaryColor: (saved && saved.secondaryColor) || '#0f172a',
            textColor: (saved && saved.textColor) || '#0f172a',
            cellBgColor: (saved && saved.cellBgColor) || '#f0fdfa',
            borderColor: (saved && saved.borderColor) || themeColor,
            cardBgColor: (saved && saved.cardBgColor) || '#ffffff',
            // Modal runtime preview state
            previewTab: 'single', // 'single' | 'sheet' | 'caller'
            previewIndex: 0,
            sheetIndex: 0,
            applyBatchEdit: true
        };

        let bingoBatch = generateUniqueBingoBatch(modalState);
        let raffleBatch = generateRaffleBatch(modalState);

        if (editEl && saved && saved.mode === 'bingo' && Array.isArray(saved.cardCells)) {
            bingoBatch.cards[0] = {
                cardIndex: saved.itemIndex || 0,
                serialNumber: (saved.itemIndex || 0) + 1,
                serialLabel: saved.serialLabel || 'Card #001',
                cells: saved.cardCells
            };
        }

        const overlay = document.createElement('div');
        overlay.id = 'op-bingoraffle-modal';
        overlay.className = 'br-modal-overlay';

        const poolOptionsHtml = Object.keys(BINGO_POOL_PRESETS).map(k =>
            `<option value="${k}"${modalState.poolPreset === k ? ' selected' : ''}>${escapeXml(BINGO_POOL_PRESETS[k].label)}</option>`
        ).join('');
        const bingoStyleOptionsHtml = Object.keys(BINGO_STYLE_PRESETS).map(k =>
            `<option value="${k}"${modalState.cardStyle === k ? ' selected' : ''}>${escapeXml(BINGO_STYLE_PRESETS[k].label)}</option>`
        ).join('');
        const raffleStyleOptionsHtml = Object.keys(RAFFLE_STYLE_PRESETS).map(k =>
            `<option value="${k}"${modalState.ticketStyle === k ? ' selected' : ''}>${escapeXml(RAFFLE_STYLE_PRESETS[k].label)}</option>`
        ).join('');
        const fontOptionsHtml = FONT_OPTIONS.map(f =>
            `<option value="${escapeXml(f.value)}"${modalState.fontFamily === f.value ? ' selected' : ''}>${escapeXml(f.label)}</option>`
        ).join('');
        const colorPresetsHtml = Object.keys(COLOR_PRESETS).map(k => {
            const p = COLOR_PRESETS[k];
            return `<button type="button" class="br-preset-btn" data-color-preset="${k}" title="${escapeXml(p.label)}">
                <span class="br-preset-swatch" style="background:linear-gradient(135deg, ${p.accent} 50%, ${p.cardBg} 50%);"></span>
                <span>${escapeXml(p.label)}</span>
            </button>`;
        }).join('');

        overlay.innerHTML = `
            <style>
                .br-modal-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.14);
                    z-index: 1000010; display: flex; align-items: center; justify-content: center;
                    padding: 14px; box-sizing: border-box;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .br-modal-box {
                    width: 990px; max-width: 96vw; max-height: 92vh;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #1e293b);
                    border-radius: 10px; box-shadow: 0 20px 55px rgba(0, 0, 0, 0.34);
                    border: 1px solid var(--ui-border, #cbd5e1);
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .br-modal-header {
                    padding: 10px 14px 10px 20px;
                    background: linear-gradient(135deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #004a46));
                    color: #ffffff; display: flex; align-items: center; justify-content: space-between;
                    user-select: none; min-height: 46px; box-sizing: border-box;
                }
                .br-header-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
                .br-header-actions .custom-dialog-close {
                    width: 34px; height: 34px; font-size: 17px; border-radius: 8px;
                }
                .br-help-icon-btn:hover,
                body.dark-mode .br-help-icon-btn:hover {
                    background: rgba(255, 255, 255, 0.25) !important;
                }
                .br-modal-body {
                    display: grid; grid-template-columns: 382px 1fr; flex: 1; min-height: 0; overflow: hidden;
                }
                .br-controls-pane {
                    padding: 13px 15px; border-right: 1px solid var(--ui-border, #e2e8f0);
                    overflow-y: auto; display: flex; flex-direction: column; gap: 10px;
                    background: var(--ui-surface-bg, #f8fafc);
                }
                body.dark-mode .br-controls-pane { background: #0f172a; border-right-color: #334155; }
                .br-field-label {
                    display: flex; align-items: center; justify-content: space-between;
                    font-size: 11px; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 0.45px; color: var(--ui-theme-dark, #0f766e); margin-bottom: 4px;
                }
                body.dark-mode .br-field-label { color: #5eead4; }
                .br-input, .br-textarea {
                    width: 100%; box-sizing: border-box; border-radius: 6px;
                    border: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #0f172a);
                    padding: 6px 9px; font-size: 12.5px; font-family: inherit; outline: none;
                }
                body.dark-mode .br-input, body.dark-mode .br-textarea { background: #1e293b; color: #f8fafc; border-color: #475569; }
                .br-input:focus, .br-textarea:focus {
                    border-color: var(--ui-theme-color, #007670); box-shadow: 0 0 0 2px rgba(0, 118, 112, 0.16);
                }
                .br-textarea { min-height: 90px; resize: vertical; font-family: Consolas, monospace; font-size: 11.5px; line-height: 1.38; }
                .br-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .br-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 7px; }
                .br-seg-group { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
                .br-seg-btn {
                    padding: 7px 10px; border-radius: 6px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #334155);
                    font-size: 12px; font-weight: 600; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                }
                body.dark-mode .br-seg-btn { background: #1e293b; color: #cbd5e1; border-color: #475569; }
                .br-seg-btn.active,
                body.dark-mode .br-seg-btn.active {
                    background: var(--ui-theme-color, #007670); border-color: var(--ui-theme-color, #007670);
                    color: #ffffff; font-weight: 700;
                }
                .br-select-wrap { position: relative; width: 100%; }
                .br-modern-select {
                    width: 100%; min-width: 0; height: 31px; padding: 0 0 0 9px;
                    border-radius: 6px; font-size: 12px; justify-content: space-between;
                    border: 1px solid var(--ui-border, #cbd5e1); background: var(--ui-panel-bg, #ffffff);
                    color: var(--ui-text, #0f172a);
                }
                body.dark-mode .br-modern-select { background: #1e293b; color: #f1f5f9; border-color: #475569; }
                .br-modern-select span { color: var(--ui-text, #0f172a) !important; padding-left: 0; }
                body.dark-mode .br-modern-select span { color: #f1f5f9 !important; filter: none !important; }
                .br-select-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
                .br-modern-select .arrow-box {
                    height: 100%; width: 28px; display: flex; align-items: center; justify-content: center;
                    background: var(--ui-theme-color, #007670); color: #ffffff;
                    border-top-right-radius: 5px; border-bottom-right-radius: 5px; flex-shrink: 0;
                }
                .br-select-menu {
                    position: fixed; z-index: 1000060; display: none; flex-direction: column;
                    background: var(--ui-panel-bg, #ffffff); border: 1px solid var(--ui-border, #cbd5e1);
                    border-radius: 7px; box-shadow: 0 10px 26px rgba(0, 0, 0, 0.22);
                    padding: 4px; max-height: 240px; overflow-y: auto; box-sizing: border-box;
                }
                body.dark-mode .br-select-menu { background: #1e293b; border-color: #475569; }
                .br-select-menu.open { display: flex; }
                .br-select-option {
                    padding: 6px 10px; font-size: 12px; border-radius: 5px; cursor: pointer;
                    color: var(--ui-text, #1e293b); white-space: nowrap;
                }
                body.dark-mode .br-select-option { color: #f8fafc; }
                .br-select-option:hover { background: rgba(0, 118, 112, 0.12); }
                .br-select-option.active { background: var(--ui-theme-color, #007670); color: #ffffff; font-weight: 700; }

                .br-checks-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 8px; }
                .br-check-label {
                    display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer;
                    color: var(--ui-text, #1e293b); user-select: none;
                }
                .br-check-label input { accent-color: var(--ui-theme-color, #007670); cursor: pointer; }
                body.dark-mode .br-check-label { color: #e2e8f0; }

                .br-warn-banner {
                    font-size: 11.5px; padding: 7px 9px; border-radius: 6px;
                    background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.45);
                    color: #b45309; line-height: 1.38; display: none;
                }
                body.dark-mode .br-warn-banner { color: #fcd34d; background: rgba(245, 158, 11, 0.16); }

                .br-color-section {
                    border: 1px solid var(--ui-border, #e2e8f0); border-radius: 8px;
                    padding: 9px 10px; background: var(--ui-panel-bg, #ffffff); display: flex; flex-direction: column; gap: 7px;
                }
                body.dark-mode .br-color-section { background: #1e293b; border-color: #334155; }
                .br-color-presets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
                .br-preset-btn {
                    display: flex; align-items: center; gap: 5px; padding: 4px 6px;
                    font-size: 10.5px; font-weight: 600; border-radius: 5px;
                    border: 1px solid var(--ui-border, #cbd5e1); background: var(--ui-surface-bg, #f8fafc);
                    color: var(--ui-text, #1e293b); cursor: pointer; text-align: left;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                body.dark-mode .br-preset-btn { background: #0f172a; color: #e2e8f0; border-color: #475569; }
                .br-preset-btn:hover { border-color: var(--ui-theme-color, #007670); }
                .br-preset-swatch { width: 13px; height: 13px; border-radius: 3px; border: 1px solid rgba(0, 0, 0, 0.2); flex-shrink: 0; }
                .br-color-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
                .br-color-chip {
                    display: flex; align-items: center; justify-content: space-between; gap: 4px;
                    padding: 4px 7px; border-radius: 5px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-surface-bg, #f8fafc); color: var(--ui-text, #1e293b);
                    font-size: 11px; font-weight: 600; cursor: pointer;
                }
                body.dark-mode .br-color-chip { background: #0f172a; color: #e2e8f0; border-color: #475569; }
                .br-color-chip:hover { border-color: var(--ui-theme-color, #007670); }
                .br-swatch-box { width: 16px; height: 16px; border-radius: 4px; border: 1px solid rgba(0, 0, 0, 0.25); flex-shrink: 0; }

                .br-preview-pane { display: flex; flex-direction: column; min-height: 0; background: var(--ui-panel-bg, #ffffff); }
                body.dark-mode .br-preview-pane { background: #111827; }
                .br-preview-toolbar {
                    display: flex; align-items: center; justify-content: space-between; gap: 8px;
                    padding: 9px 14px; border-bottom: 1px solid var(--ui-border, #e2e8f0); flex-wrap: wrap;
                }
                body.dark-mode .br-preview-toolbar { border-bottom-color: #334155; }
                .br-preview-tabs { display: flex; gap: 6px; }
                .br-ptab {
                    padding: 5px 11px; border-radius: 6px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: transparent; color: var(--ui-text, #334155); font-size: 11.5px; font-weight: 600; cursor: pointer;
                }
                body.dark-mode .br-ptab { color: #cbd5e1; border-color: #475569; }
                .br-ptab.active {
                    background: var(--ui-theme-color, #007670); border-color: var(--ui-theme-color, #007670); color: #ffffff;
                }
                .br-pager { display: flex; align-items: center; gap: 6px; }
                .br-mini-btn {
                    padding: 5px 9px; border-radius: 6px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-surface-bg, #f8fafc); color: var(--ui-text, #1e293b);
                    font-size: 11.5px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
                }
                body.dark-mode .br-mini-btn { background: #1e293b; color: #f8fafc; border-color: #475569; }
                .br-mini-btn:hover { border-color: var(--ui-theme-color, #007670); color: var(--ui-theme-color, #007670); }
                .br-mini-btn:disabled { opacity: 0.42; cursor: default; pointer-events: none; }
                .br-mini-btn i { pointer-events: none; }
                .br-preview-canvas {
                    flex: 1; display: flex; align-items: center; justify-content: center;
                    min-height: 0; overflow: hidden; padding: 14px 16px;
                    background: var(--ui-surface-bg, #f8fafc);
                }
                body.dark-mode .br-preview-canvas { background: #0f172a; }
                .br-preview-stage {
                    width: 100%; height: 100%; max-width: 520px; max-height: 455px;
                    display: flex; align-items: center; justify-content: center; box-sizing: border-box;
                }
                .br-status-bar {
                    padding: 7px 14px; border-top: 1px solid var(--ui-border, #e2e8f0);
                    font-size: 11.5px; display: flex; align-items: center; justify-content: space-between;
                    background: var(--ui-surface-bg, #f8fafc); gap: 8px;
                }
                body.dark-mode .br-status-bar { background: #0f172a; border-top-color: #334155; }
                .br-modal-footer {
                    padding: 10px 16px; border-top: 1px solid var(--ui-border, #e2e8f0);
                    display: flex; align-items: center; justify-content: space-between; gap: 10px;
                    background: var(--ui-panel-bg, #ffffff);
                }
                body.dark-mode .br-modal-footer { background: #111827; border-top-color: #334155; }
                .br-btn-secondary {
                    padding: 7px 15px; border-radius: 6px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: transparent; color: var(--ui-text, #1e293b); font-size: 12.5px; font-weight: 600; cursor: pointer;
                }
                body.dark-mode .br-btn-secondary { color: #e2e8f0; border-color: #475569; }
                .br-btn-primary {
                    padding: 7px 18px; border-radius: 6px; border: none;
                    background: var(--ui-theme-color, #007670); color: #ffffff;
                    font-size: 12.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 7px;
                }
                .br-btn-primary:hover { background: var(--ui-theme-dark, #004a46); }

                /* Bright-theme dark ink contrast parity (matches Light & Dark Bright Themes) */
                body.bright-theme .br-modal-header,
                body.bright-theme .br-modal-header .custom-dialog-close,
                body.bright-theme .br-seg-btn.active,
                body.bright-theme .br-ptab.active,
                body.bright-theme .br-btn-primary,
                body.bright-theme .br-modern-select .arrow-box,
                body.bright-theme .br-select-option.active {
                    color: #111111 !important;
                }
                body.bright-theme .br-help-icon-btn:hover,
                body.bright-theme .br-modal-header .custom-dialog-close:hover {
                    background: rgba(0, 0, 0, 0.14) !important;
                    color: #000000 !important;
                }

                @media (max-width: 820px) {
                    .br-modal-body { grid-template-columns: 1fr; }
                    .br-controls-pane { max-height: 290px; border-right: none; border-bottom: 1px solid var(--ui-border, #e2e8f0); }
                }
            </style>
            <div class="br-modal-box" id="br-modal-box" role="dialog" aria-modal="true" aria-labelledby="br-modal-title">
                <div class="br-modal-header" id="br-modal-header" title="Drag to move">
                    <div id="br-modal-title" style="display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-ticket-alt" style="font-size:17px;"></i>
                        <div>
                            <div style="font-size:15px; font-weight:700;">Bingo &amp; Raffle Ticket Studio</div>
                            <div style="font-size:11px; opacity:0.88;">Generate unique randomized Bingo cards or sequentially numbered Raffle tickets across pages</div>
                        </div>
                    </div>
                    <div class="br-header-actions">
                        <button type="button" class="custom-dialog-close br-help-icon-btn" id="br-help-btn" title="Bingo &amp; Raffle Studio Help" aria-label="Help">
                            <i class="fas fa-question"></i>
                        </button>
                        <button type="button" class="custom-dialog-close" id="br-close-x" title="Close" aria-label="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div class="br-modal-body">
                    <div class="br-controls-pane">
                        <div${editEl ? ' style="display:none;"' : ''}>
                            <label class="br-field-label">Generator Mode</label>
                            <div class="br-seg-group">
                                <button type="button" class="br-seg-btn${modalState.mode === 'bingo' ? ' active' : ''}" data-br-mode="bingo"><i class="fas fa-th-large"></i> Bingo Cards</button>
                                <button type="button" class="br-seg-btn${modalState.mode === 'raffle' ? ' active' : ''}" data-br-mode="raffle"><i class="fas fa-ticket-alt"></i> Raffle Tickets</button>
                            </div>
                        </div>

                        <!-- BINGO CONTROLS -->
                        <div id="br-bingo-controls" style="display:${modalState.mode === 'bingo' ? 'flex' : 'none'}; flex-direction:column; gap:10px;">
                            <div class="br-row-2">
                                <div>
                                    <label class="br-field-label" for="br-bingo-title">Header Letters / Title</label>
                                    <input type="text" id="br-bingo-title" class="br-input" value="${escapeXml(modalState.title)}">
                                </div>
                                <div>
                                    <label class="br-field-label" for="br-bingo-banner">Event Banner</label>
                                    <input type="text" id="br-bingo-banner" class="br-input" value="${escapeXml(modalState.eventBanner)}">
                                </div>
                            </div>

                            <div>
                                <label class="br-field-label" for="br-bingo-subtitle">Subtitle / Instructions</label>
                                <input type="text" id="br-bingo-subtitle" class="br-input" value="${escapeXml(modalState.subtitle)}">
                            </div>

                            <div>
                                <label class="br-field-label" for="br-pool-preset">Word / Number Pool Preset</label>
                                <select id="br-pool-preset" class="br-select">${poolOptionsHtml}</select>
                            </div>

                            <div>
                                <label class="br-field-label" for="br-words-input">
                                    <span>Words or Numbers Pool</span>
                                    <span id="br-pool-count-badge" style="font-size:10px; opacity:0.8;">50 unique items</span>
                                </label>
                                <textarea id="br-words-input" class="br-textarea" placeholder="Enter 50+ words, phrases, or numbers (one per line or comma-separated)...">${escapeXml(modalState.wordsText)}</textarea>
                            </div>

                            <div id="br-bingo-warn" class="br-warn-banner"></div>

                            <div class="br-row-3"${editEl ? ' style="display:none;"' : ''}>
                                <div>
                                    <label class="br-field-label" for="br-grid-size">Grid Size</label>
                                    <select id="br-grid-size" class="br-select">
                                        <option value="3"${modalState.gridSize === 3 ? ' selected' : ''}>3x3 Grid</option>
                                        <option value="4"${modalState.gridSize === 4 ? ' selected' : ''}>4x4 Grid</option>
                                        <option value="5"${modalState.gridSize === 5 ? ' selected' : ''}>5x5 Grid</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="br-field-label" for="br-card-count">Unique Cards</label>
                                    <input type="number" id="br-card-count" class="br-input" min="1" max="100" value="${modalState.cardCount}">
                                </div>
                                <div>
                                    <label class="br-field-label" for="br-cards-per-page">Per Page</label>
                                    <select id="br-cards-per-page" class="br-select">
                                        <option value="1"${modalState.cardsPerPage === 1 ? ' selected' : ''}>1 / Page</option>
                                        <option value="2"${modalState.cardsPerPage === 2 ? ' selected' : ''}>2 / Page</option>
                                        <option value="4"${modalState.cardsPerPage === 4 ? ' selected' : ''}>4 / Page</option>
                                    </select>
                                </div>
                            </div>

                            <div class="br-row-2">
                                <div>
                                    <label class="br-field-label" for="br-bingo-style">Card Design Style</label>
                                    <select id="br-bingo-style" class="br-select">${bingoStyleOptionsHtml}</select>
                                </div>
                                <div>
                                    <label class="br-field-label" for="br-cell-corners">Cell Corner Style</label>
                                    <select id="br-cell-corners" class="br-select">
                                        <option value="sharp"${modalState.cellCornerStyle === 'sharp' ? ' selected' : ''}>Sharp Classic Grid</option>
                                        <option value="soft"${modalState.cellCornerStyle === 'soft' ? ' selected' : ''}>Soft Bevel</option>
                                        <option value="rounded"${modalState.cellCornerStyle === 'rounded' ? ' selected' : ''}>Rounded Tiles</option>
                                    </select>
                                </div>
                            </div>

                            <div class="br-row-2">
                                <div>
                                    <label class="br-field-label" for="br-free-text">Free Space Label</label>
                                    <input type="text" id="br-free-text" class="br-input" value="${escapeXml(modalState.freeText)}">
                                </div>
                                <div>
                                    <label class="br-field-label" for="br-footer-note">Footer Note</label>
                                    <input type="text" id="br-footer-note" class="br-input" value="${escapeXml(modalState.footerNote)}">
                                </div>
                            </div>

                            <div class="br-checks-grid">
                                <label class="br-check-label"><input type="checkbox" id="br-free-center"${modalState.freeCenter ? ' checked' : ''}> Center FREE Space</label>
                                <label class="br-check-label"><input type="checkbox" id="br-split-letters"${modalState.splitHeaderLetters ? ' checked' : ''}> Column B-I-N-G-O Row</label>
                                <label class="br-check-label"><input type="checkbox" id="br-classic-cols"${modalState.classicBingoColumns ? ' checked' : ''}> 1-75 Column Ranges</label>
                                <label class="br-check-label"><input type="checkbox" id="br-alt-tint"${modalState.alternateTint ? ' checked' : ''}> Alternating Cell Tint</label>
                                <label class="br-check-label"><input type="checkbox" id="br-show-serial"${modalState.showSerial ? ' checked' : ''}> Print Card Serial #</label>
                                <label class="br-check-label" style="${editEl ? 'display:none;' : ''}"><input type="checkbox" id="br-caller-sheet"${modalState.includeCallerSheet ? ' checked' : ''}> Caller's Master Sheet</label>
                            </div>
                        </div>

                        <!-- RAFFLE CONTROLS -->
                        <div id="br-raffle-controls" style="display:${modalState.mode === 'raffle' ? 'flex' : 'none'}; flex-direction:column; gap:10px;">
                            <div class="br-row-2">
                                <div>
                                    <label class="br-field-label" for="br-ticket-title">Event / Raffle Title</label>
                                    <input type="text" id="br-ticket-title" class="br-input" value="${escapeXml(modalState.ticketTitle)}">
                                </div>
                                <div>
                                    <label class="br-field-label" for="br-ticket-price">Price / Admit Badge</label>
                                    <input type="text" id="br-ticket-price" class="br-input" value="${escapeXml(modalState.ticketPrice)}">
                                </div>
                            </div>

                            <div>
                                <label class="br-field-label" for="br-ticket-subtitle">Prize / Tagline</label>
                                <input type="text" id="br-ticket-subtitle" class="br-input" value="${escapeXml(modalState.ticketSubtitle)}">
                            </div>

                            <div>
                                <label class="br-field-label" for="br-ticket-meta">Date, Time &amp; Venue Line</label>
                                <input type="text" id="br-ticket-meta" class="br-input" value="${escapeXml(modalState.ticketMeta)}">
                            </div>

                            <div class="br-row-3"${editEl ? ' style="display:none;"' : ''}>
                                <div>
                                    <label class="br-field-label" for="br-ticket-count">Quantity</label>
                                    <input type="number" id="br-ticket-count" class="br-input" min="1" max="200" value="${modalState.ticketCount}">
                                </div>
                                <div>
                                    <label class="br-field-label" for="br-start-num">Start #</label>
                                    <input type="number" id="br-start-num" class="br-input" min="0" max="999999" value="${modalState.startNumber}">
                                </div>
                                <div>
                                    <label class="br-field-label" for="br-tickets-per-page">Per Page</label>
                                    <select id="br-tickets-per-page" class="br-select">
                                        <option value="4"${modalState.ticketsPerPage === 4 ? ' selected' : ''}>4 / Page</option>
                                        <option value="5"${modalState.ticketsPerPage === 5 ? ' selected' : ''}>5 / Page</option>
                                        <option value="6"${modalState.ticketsPerPage === 6 ? ' selected' : ''}>6 / Page</option>
                                        <option value="8"${modalState.ticketsPerPage === 8 ? ' selected' : ''}>8 / Page</option>
                                        <option value="10"${modalState.ticketsPerPage === 10 ? ' selected' : ''}>10 / Page</option>
                                    </select>
                                </div>
                            </div>

                            <div class="br-row-3">
                                <div>
                                    <label class="br-field-label" for="br-serial-prefix">Prefix</label>
                                    <input type="text" id="br-serial-prefix" class="br-input" value="${escapeXml(modalState.serialPrefix)}">
                                </div>
                                <div>
                                    <label class="br-field-label" for="br-pad-digits">Digits Pad</label>
                                    <select id="br-pad-digits" class="br-select">
                                        <option value="0"${modalState.padDigits === 0 ? ' selected' : ''}>No Pad (1)</option>
                                        <option value="3"${modalState.padDigits === 3 ? ' selected' : ''}>3 Digits (001)</option>
                                        <option value="4"${modalState.padDigits === 4 ? ' selected' : ''}>4 Digits (0001)</option>
                                        <option value="5"${modalState.padDigits === 5 ? ' selected' : ''}>5 Digits (00001)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="br-field-label" for="br-serial-suffix">Suffix</label>
                                    <input type="text" id="br-serial-suffix" class="br-input" value="${escapeXml(modalState.serialSuffix)}" placeholder="Optional">
                                </div>
                            </div>

                            <div class="br-row-2">
                                <div>
                                    <label class="br-field-label" for="br-raffle-style">Ticket Design Style</label>
                                    <select id="br-raffle-style" class="br-select">${raffleStyleOptionsHtml}</select>
                                </div>
                                <div>
                                    <label class="br-field-label" for="br-stub-pos">Tear-Off Stub Side</label>
                                    <select id="br-stub-pos" class="br-select">
                                        <option value="left"${modalState.stubPosition === 'left' ? ' selected' : ''}>Left Side Stub</option>
                                        <option value="right"${modalState.stubPosition === 'right' ? ' selected' : ''}>Right Side Stub</option>
                                    </select>
                                </div>
                            </div>

                            <div class="br-row-2">
                                <div>
                                    <label class="br-field-label" for="br-perf-style">Perforation Line</label>
                                    <select id="br-perf-style" class="br-select">
                                        <option value="notches-scissors"${modalState.perforationStyle === 'notches-scissors' ? ' selected' : ''}>Notches + Scissors</option>
                                        <option value="notches-dots"${modalState.perforationStyle === 'notches-dots' ? ' selected' : ''}>Notches + Dotted</option>
                                        <option value="dashed"${modalState.perforationStyle === 'dashed' ? ' selected' : ''}>Clean Dashed Tear</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="br-field-label" for="br-stub-fields">Stub Write-In Lines</label>
                                    <select id="br-stub-fields" class="br-select">
                                        <option value="name-phone-email"${modalState.stubFields === 'name-phone-email' ? ' selected' : ''}>Name, Phone &amp; Email</option>
                                        <option value="name-phone"${modalState.stubFields === 'name-phone' ? ' selected' : ''}>Name &amp; Phone</option>
                                        <option value="serial-only"${modalState.stubFields === 'serial-only' ? ' selected' : ''}>Matching Serial Only</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label class="br-field-label" for="br-ticket-footer">Fine Print / Footer Note</label>
                                <input type="text" id="br-ticket-footer" class="br-input" value="${escapeXml(modalState.ticketFooter)}">
                            </div>

                            <div class="br-checks-grid">
                                <label class="br-check-label"><input type="checkbox" id="br-show-barcode"${modalState.showBarcode ? ' checked' : ''}> Vector Barcode Strip</label>
                                <label class="br-check-label"><input type="checkbox" id="br-use-custom-labels"${modalState.useCustomLabels ? ' checked' : ''}> Attach Pool Tags</label>
                            </div>

                            <div id="br-raffle-tags-wrap" style="display:${modalState.useCustomLabels ? 'block' : 'none'};">
                                <label class="br-field-label" for="br-raffle-tags-input">Custom Ticket Tags (Cycles Across Tickets)</label>
                                <textarea id="br-raffle-tags-input" class="br-textarea" style="min-height:64px;" placeholder="Enter one tag/prize label per line...">${escapeXml(modalState.raffleTagsText)}</textarea>
                            </div>
                        </div>

                        <!-- SHARED STYLING, FONT & PALETTE -->
                        <div class="br-row-2">
                            <div>
                                <label class="br-field-label" for="br-font-family">Typography Font</label>
                                <select id="br-font-family" class="br-select">${fontOptionsHtml}</select>
                            </div>
                            <div style="display:flex; align-items:flex-end; padding-bottom:5px;">
                                <label class="br-check-label" style="${editEl ? 'display:none;' : ''}">
                                    <input type="checkbox" id="br-show-cut-lines"${modalState.showCutLines ? ' checked' : ''}>
                                    Show Sheet Cut Guides
                                </label>
                            </div>
                        </div>

                        <div class="br-color-section">
                            <label class="br-field-label" style="margin-bottom:0;">Colors &amp; Palette</label>
                            <div class="br-color-presets">${colorPresetsHtml}</div>
                            <div class="br-color-grid">
                                <button type="button" class="br-color-chip" data-color-target="br-accent-color"><span>Accent</span><i class="br-swatch-box" data-swatch-for="br-accent-color" style="background:${modalState.accentColor};"></i></button>
                                <button type="button" class="br-color-chip" data-color-target="br-secondary-color"><span>Secondary</span><i class="br-swatch-box" data-swatch-for="br-secondary-color" style="background:${modalState.secondaryColor};"></i></button>
                                <button type="button" class="br-color-chip" data-color-target="br-text-color"><span>Text</span><i class="br-swatch-box" data-swatch-for="br-text-color" style="background:${modalState.textColor};"></i></button>
                                <button type="button" class="br-color-chip" data-color-target="br-cellbg-color"><span>Tint Fill</span><i class="br-swatch-box" data-swatch-for="br-cellbg-color" style="background:${modalState.cellBgColor};"></i></button>
                                <button type="button" class="br-color-chip" data-color-target="br-border-color"><span>Borders</span><i class="br-swatch-box" data-swatch-for="br-border-color" style="background:${modalState.borderColor};"></i></button>
                                <button type="button" class="br-color-chip" data-color-target="br-cardbg-color"><span>Paper Bg</span><i class="br-swatch-box" data-swatch-for="br-cardbg-color" style="background:${modalState.cardBgColor};"></i></button>
                            </div>
                            <input type="hidden" id="br-accent-color" value="${escapeXml(modalState.accentColor)}">
                            <input type="hidden" id="br-secondary-color" value="${escapeXml(modalState.secondaryColor)}">
                            <input type="hidden" id="br-text-color" value="${escapeXml(modalState.textColor)}">
                            <input type="hidden" id="br-cellbg-color" value="${escapeXml(modalState.cellBgColor)}">
                            <input type="hidden" id="br-border-color" value="${escapeXml(modalState.borderColor)}">
                            <input type="hidden" id="br-cardbg-color" value="${escapeXml(modalState.cardBgColor)}">
                        </div>

                        <label class="br-check-label" id="br-batch-edit-row" style="font-weight:700; ${editEl ? '' : 'display:none;'}">
                            <input type="checkbox" id="br-apply-batch-edit"${modalState.applyBatchEdit ? ' checked' : ''}>
                            Apply style updates to all items in this batch (across pages)
                        </label>
                    </div>

                    <div class="br-preview-pane">
                        <div class="br-preview-toolbar">
                            <div class="br-preview-tabs">
                                <button type="button" class="br-ptab active" id="br-ptab-single">Single Card</button>
                                <button type="button" class="br-ptab" id="br-ptab-sheet"${editEl ? ' style="display:none;"' : ''}>Page Sheet</button>
                                <button type="button" class="br-ptab" id="br-ptab-caller"${editEl ? ' style="display:none;"' : ''}>Caller's List</button>
                            </div>
                            <div class="br-pager">
                                <button type="button" class="br-mini-btn" id="br-prev-item" title="Previous"><i class="fas fa-chevron-left"></i></button>
                                <span id="br-pager-label" style="font-size:11.5px; font-weight:700; min-width:84px; text-align:center;">Card 1 of 30</span>
                                <button type="button" class="br-mini-btn" id="br-next-item" title="Next"><i class="fas fa-chevron-right"></i></button>
                                <button type="button" class="br-mini-btn" id="br-reshuffle-btn" title="Generate fresh random combinations"${editEl ? ' style="display:none;"' : ''}><i class="fas fa-random"></i> Reshuffle</button>
                            </div>
                        </div>
                        <div class="br-preview-canvas">
                            <div class="br-preview-stage" id="br-preview-stage"></div>
                        </div>
                        <div class="br-status-bar">
                            <span id="br-status-text">Ready</span>
                            <span id="br-meta-text" style="opacity:0.8;"></span>
                        </div>
                    </div>
                </div>

                <div class="br-modal-footer">
                    <span style="font-size:11.5px; opacity:0.78;">
                        ${editEl ? 'Editing preserves unique Bingo layouts &amp; sequential Raffle serials.' : 'Tip: Double-click any inserted card or ticket later to restyle it cleanly.'}
                    </span>
                    <div style="display:flex; gap:8px;">
                        <button type="button" class="br-btn-secondary" id="br-cancel-btn">Cancel</button>
                        <button type="button" class="br-btn-primary" id="br-insert-btn"><i class="fas fa-layer-group"></i> <span id="br-insert-label">Insert 30 Bingo Cards</span></button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        const modalBox = overlay.querySelector('#br-modal-box');
        const modalHeader = overlay.querySelector('#br-modal-header');
        const teardownDrag = makeModalDraggable(modalBox, modalHeader);
        const selectCtrl = enhanceSelectControls(overlay);

        const regenerateBatches = () => {
            if (!editEl) {
                bingoBatch = generateUniqueBingoBatch(modalState);
                raffleBatch = generateRaffleBatch(modalState);
            } else {
                raffleBatch = generateRaffleBatch(modalState);
            }
        };

        const syncControlsToState = (needRegen) => {
            modalState.title = overlay.querySelector('#br-bingo-title').value;
            modalState.eventBanner = overlay.querySelector('#br-bingo-banner').value;
            modalState.subtitle = overlay.querySelector('#br-bingo-subtitle').value;
            modalState.poolPreset = overlay.querySelector('#br-pool-preset').value;
            modalState.wordsText = overlay.querySelector('#br-words-input').value;
            modalState.gridSize = parseInt(overlay.querySelector('#br-grid-size').value, 10) || 5;
            modalState.cardCount = Math.max(1, Math.min(100, parseInt(overlay.querySelector('#br-card-count').value, 10) || 30));
            modalState.cardsPerPage = parseInt(overlay.querySelector('#br-cards-per-page').value, 10) || 2;
            modalState.cardStyle = overlay.querySelector('#br-bingo-style').value;
            modalState.cellCornerStyle = overlay.querySelector('#br-cell-corners').value;
            modalState.freeText = overlay.querySelector('#br-free-text').value;
            modalState.footerNote = overlay.querySelector('#br-footer-note').value;
            modalState.freeCenter = overlay.querySelector('#br-free-center').checked;
            modalState.splitHeaderLetters = overlay.querySelector('#br-split-letters').checked;
            modalState.classicBingoColumns = overlay.querySelector('#br-classic-cols').checked;
            modalState.alternateTint = overlay.querySelector('#br-alt-tint').checked;
            modalState.showSerial = overlay.querySelector('#br-show-serial').checked;
            modalState.includeCallerSheet = overlay.querySelector('#br-caller-sheet').checked;

            modalState.ticketTitle = overlay.querySelector('#br-ticket-title').value;
            modalState.ticketPrice = overlay.querySelector('#br-ticket-price').value;
            modalState.ticketSubtitle = overlay.querySelector('#br-ticket-subtitle').value;
            modalState.ticketMeta = overlay.querySelector('#br-ticket-meta').value;
            modalState.ticketCount = Math.max(1, Math.min(200, parseInt(overlay.querySelector('#br-ticket-count').value, 10) || 30));
            modalState.startNumber = Math.max(0, parseInt(overlay.querySelector('#br-start-num').value, 10) || 0);
            modalState.ticketsPerPage = parseInt(overlay.querySelector('#br-tickets-per-page').value, 10) || 5;
            modalState.serialPrefix = overlay.querySelector('#br-serial-prefix').value;
            modalState.padDigits = parseInt(overlay.querySelector('#br-pad-digits').value, 10) || 0;
            modalState.serialSuffix = overlay.querySelector('#br-serial-suffix').value;
            modalState.ticketStyle = overlay.querySelector('#br-raffle-style').value;
            modalState.stubPosition = overlay.querySelector('#br-stub-pos').value;
            modalState.perforationStyle = overlay.querySelector('#br-perf-style').value;
            modalState.stubFields = overlay.querySelector('#br-stub-fields').value;
            modalState.ticketFooter = overlay.querySelector('#br-ticket-footer').value;
            modalState.showBarcode = overlay.querySelector('#br-show-barcode').checked;
            modalState.useCustomLabels = overlay.querySelector('#br-use-custom-labels').checked;
            modalState.raffleTagsText = overlay.querySelector('#br-raffle-tags-input').value;

            const tagsWrap = overlay.querySelector('#br-raffle-tags-wrap');
            if (tagsWrap) tagsWrap.style.display = modalState.useCustomLabels ? 'block' : 'none';

            modalState.fontFamily = overlay.querySelector('#br-font-family').value;
            modalState.showCutLines = overlay.querySelector('#br-show-cut-lines').checked;
            modalState.applyBatchEdit = overlay.querySelector('#br-apply-batch-edit').checked;

            modalState.accentColor = overlay.querySelector('#br-accent-color').value;
            modalState.secondaryColor = overlay.querySelector('#br-secondary-color').value;
            modalState.textColor = overlay.querySelector('#br-text-color').value;
            modalState.cellBgColor = overlay.querySelector('#br-cellbg-color').value;
            modalState.borderColor = overlay.querySelector('#br-border-color').value;
            modalState.cardBgColor = overlay.querySelector('#br-cardbg-color').value;

            if (needRegen) regenerateBatches();
        };

        const renderPreview = () => {
            const isBingo = modalState.mode === 'bingo';
            overlay.querySelector('#br-bingo-controls').style.display = isBingo ? 'flex' : 'none';
            overlay.querySelector('#br-raffle-controls').style.display = isBingo ? 'none' : 'flex';
            overlay.querySelectorAll('[data-br-mode]').forEach(b => b.classList.toggle('active', b.dataset.brMode === modalState.mode));

            const ptabSingle = overlay.querySelector('#br-ptab-single');
            const ptabSheet = overlay.querySelector('#br-ptab-sheet');
            const ptabCaller = overlay.querySelector('#br-ptab-caller');
            ptabSingle.textContent = isBingo ? 'Single Card' : 'Single Ticket';
            ptabCaller.style.display = (!editEl && isBingo) ? '' : 'none';
            if (!isBingo && modalState.previewTab === 'caller') modalState.previewTab = 'single';
            ptabSingle.classList.toggle('active', modalState.previewTab === 'single');
            ptabSheet.classList.toggle('active', modalState.previewTab === 'sheet');
            ptabCaller.classList.toggle('active', modalState.previewTab === 'caller');

            const reshuffleBtn = overlay.querySelector('#br-reshuffle-btn');
            const prevBtn = overlay.querySelector('#br-prev-item');
            const nextBtn = overlay.querySelector('#br-next-item');
            reshuffleBtn.style.display = (!editEl && isBingo) ? '' : 'none';

            // Update pool count & warning banner
            const poolCount = bingoBatch.poolItems.length;
            overlay.querySelector('#br-pool-count-badge').textContent = `${poolCount} unique item${poolCount === 1 ? '' : 's'}`;
            const warnEl = overlay.querySelector('#br-bingo-warn');
            if (!editEl && isBingo && bingoBatch.warning) {
                warnEl.textContent = bingoBatch.warning;
                warnEl.style.display = 'block';
            } else {
                warnEl.style.display = 'none';
            }

            const stage = overlay.querySelector('#br-preview-stage');
            const pagerLabel = overlay.querySelector('#br-pager-label');
            const statusText = overlay.querySelector('#br-status-text');
            const metaText = overlay.querySelector('#br-meta-text');
            const insertLabel = overlay.querySelector('#br-insert-label');

            if (isBingo) {
                const cards = bingoBatch.cards;
                const total = cards.length;
                const sheetCount = Math.ceil(total / modalState.cardsPerPage);
                modalState.previewIndex = Math.max(0, Math.min(total - 1, modalState.previewIndex));
                modalState.sheetIndex = Math.max(0, Math.min(sheetCount - 1, modalState.sheetIndex));

                const canPage = !editEl && ((modalState.previewTab === 'sheet' && sheetCount > 1) || (modalState.previewTab === 'single' && total > 1));
                prevBtn.style.display = (editEl || modalState.previewTab === 'caller') ? 'none' : '';
                nextBtn.style.display = (editEl || modalState.previewTab === 'caller') ? 'none' : '';
                prevBtn.disabled = !canPage;
                nextBtn.disabled = !canPage;

                if (modalState.previewTab === 'caller') {
                    stage.innerHTML = buildBingoCallerListSvg(bingoBatch.poolItems, modalState, total).svgMarkup;
                    pagerLabel.textContent = 'Master List';
                } else if (modalState.previewTab === 'sheet') {
                    stage.innerHTML = buildSheetPreviewSvg('bingo', bingoBatch, modalState, modalState.sheetIndex).svgMarkup;
                    pagerLabel.textContent = `Page ${modalState.sheetIndex + 1} of ${sheetCount}`;
                } else {
                    const card = cards[modalState.previewIndex] || cards[0];
                    stage.innerHTML = buildBingoCardSvg(card, modalState, total).svgMarkup;
                    pagerLabel.textContent = editEl ? 'Editing Card' : `Card ${modalState.previewIndex + 1} of ${total}`;
                }

                const totalPages = sheetCount + (modalState.includeCallerSheet ? 1 : 0);
                statusText.textContent = editEl
                    ? `Editing Bingo Card (${modalState.gridSize}x${modalState.gridSize})`
                    : `${total} Non-Identical ${modalState.gridSize}x${modalState.gridSize} Cards (${poolCount} pool items)`;
                metaText.textContent = editEl
                    ? (BINGO_STYLE_PRESETS[modalState.cardStyle] || BINGO_STYLE_PRESETS.classic).label
                    : `${totalPages} Page${totalPages === 1 ? '' : 's'} (${modalState.cardsPerPage}/page${modalState.includeCallerSheet ? " + Caller's Sheet" : ''})`;
                insertLabel.textContent = editEl ? 'Update Bingo' : `Insert ${total} Bingo Card${total === 1 ? '' : 's'}`;
            } else {
                const tickets = raffleBatch.tickets;
                const total = tickets.length;
                const sheetCount = Math.ceil(total / modalState.ticketsPerPage);
                modalState.previewIndex = Math.max(0, Math.min(total - 1, modalState.previewIndex));
                modalState.sheetIndex = Math.max(0, Math.min(sheetCount - 1, modalState.sheetIndex));

                const canPage = !editEl && ((modalState.previewTab === 'sheet' && sheetCount > 1) || (modalState.previewTab === 'single' && total > 1));
                prevBtn.style.display = editEl ? 'none' : '';
                nextBtn.style.display = editEl ? 'none' : '';
                prevBtn.disabled = !canPage;
                nextBtn.disabled = !canPage;

                if (editEl && saved && saved.mode === 'raffle') {
                    const tagPool = modalState.useCustomLabels ? parsePoolItems(modalState.raffleTagsText || modalState.wordsText) : [];
                    const tIdx = saved.itemIndex || 0;
                    const editTicket = {
                        ticketIndex: tIdx,
                        numberValue: saved.numberValue || 1,
                        serialText: saved.serialText || formatTicketSerial(saved.numberValue || 1, modalState),
                        customLabel: modalState.useCustomLabels ? (tagPool.length > 0 ? tagPool[tIdx % tagPool.length] : (saved.customLabel || '')) : ''
                    };
                    stage.innerHTML = buildRaffleTicketSvg(editTicket, modalState).svgMarkup;
                    pagerLabel.textContent = `Ticket ${editTicket.serialText}`;
                } else if (modalState.previewTab === 'sheet') {
                    stage.innerHTML = buildSheetPreviewSvg('raffle', raffleBatch, modalState, modalState.sheetIndex).svgMarkup;
                    pagerLabel.textContent = `Page ${modalState.sheetIndex + 1} of ${sheetCount}`;
                } else {
                    const t = tickets[modalState.previewIndex] || tickets[0];
                    stage.innerHTML = buildRaffleTicketSvg(t, modalState).svgMarkup;
                    pagerLabel.textContent = `Ticket ${modalState.previewIndex + 1} of ${total}`;
                }

                const firstS = tickets[0] ? tickets[0].serialText : '';
                const lastS = tickets[tickets.length - 1] ? tickets[tickets.length - 1].serialText : '';
                statusText.textContent = editEl
                    ? `Editing Raffle Ticket`
                    : `${total} Sequential Tickets (${firstS} to ${lastS})`;
                metaText.textContent = editEl
                    ? (RAFFLE_STYLE_PRESETS[modalState.ticketStyle] || RAFFLE_STYLE_PRESETS.classic).label
                    : `${sheetCount} Page${sheetCount === 1 ? '' : 's'} (${modalState.ticketsPerPage}/page • Matching Stubs)`;
                insertLabel.textContent = editEl ? 'Update Raffle Ticket' : `Insert ${total} Raffle Ticket${total === 1 ? '' : 's'}`;
            }
        };

        // Mode switcher
        overlay.querySelectorAll('[data-br-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                modalState.mode = btn.dataset.brMode;
                modalState.previewTab = 'single';
                modalState.previewIndex = 0;
                modalState.sheetIndex = 0;
                renderPreview();
            });
        });

        const applyColorPreset = (presetKey) => {
            const p = COLOR_PRESETS[presetKey];
            if (!p) return;
            const pairs = [
                ['br-accent-color', p.accent],
                ['br-secondary-color', p.secondary],
                ['br-text-color', p.text],
                ['br-cellbg-color', p.cellBg],
                ['br-border-color', p.border],
                ['br-cardbg-color', p.cardBg]
            ];
            pairs.forEach(([id, val]) => {
                const inp = overlay.querySelector('#' + id);
                const sw = overlay.querySelector(`[data-swatch-for="${id}"]`);
                if (inp) inp.value = val;
                if (sw) sw.style.background = val;
            });
        };

        // Pool preset selector auto-populates textarea & column range toggle
        overlay.querySelector('#br-pool-preset').addEventListener('change', () => {
            const preset = BINGO_POOL_PRESETS[overlay.querySelector('#br-pool-preset').value];
            if (preset) {
                overlay.querySelector('#br-words-input').value = preset.text;
                overlay.querySelector('#br-classic-cols').checked = !!preset.classicColumns;
                if (preset.classicColumns) overlay.querySelector('#br-grid-size').value = '5';
                selectCtrl.syncAll();
            }
            syncControlsToState(true);
            renderPreview();
        });

        // 1-75 Column Ranges auto-loads numbers 1-75 if current pool doesn't contain 1-75
        overlay.querySelector('#br-classic-cols').addEventListener('change', () => {
            const cb = overlay.querySelector('#br-classic-cols');
            if (cb.checked) {
                const curItems = parsePoolItems(overlay.querySelector('#br-words-input').value);
                if (!isNumericPool75(curItems)) {
                    overlay.querySelector('#br-pool-preset').value = 'numbers75';
                    overlay.querySelector('#br-words-input').value = BINGO_POOL_PRESETS.numbers75.text;
                }
                overlay.querySelector('#br-grid-size').value = '5';
                selectCtrl.syncAll();
            }
            syncControlsToState(true);
            renderPreview();
        });

        // Style preset selection syncs palette nicely for Dark/Minimal styles & restores light bg when switching away
        const handleStyleChange = (nextStyle, darkKey, monoKey) => {
            if (nextStyle === darkKey) {
                applyColorPreset('chalkboard');
            } else if (nextStyle === monoKey) {
                applyColorPreset('print');
            } else if (hexToLuminance(overlay.querySelector('#br-cardbg-color').value) < 120) {
                applyColorPreset('teal');
            }
            syncControlsToState(false);
            renderPreview();
        };
        overlay.querySelector('#br-bingo-style').addEventListener('change', (e) => handleStyleChange(e.target.value, 'chalkboard', 'inksaver'));
        overlay.querySelector('#br-raffle-style').addEventListener('change', (e) => handleStyleChange(e.target.value, 'vip', 'minimal'));

        // Inputs requiring batch regeneration vs style-only refresh
        ['#br-words-input', '#br-grid-size', '#br-card-count', '#br-free-center',
         '#br-ticket-count', '#br-start-num', '#br-serial-prefix', '#br-pad-digits', '#br-serial-suffix', '#br-use-custom-labels', '#br-raffle-tags-input']
            .forEach(sel => {
                const el = overlay.querySelector(sel);
                const evt = (el.tagName === 'TEXTAREA' || el.type === 'text' || el.type === 'number') ? 'input' : 'change';
                el.addEventListener(evt, () => {
                    syncControlsToState(true);
                    renderPreview();
                });
            });

        ['#br-bingo-title', '#br-bingo-banner', '#br-bingo-subtitle', '#br-cards-per-page',
         '#br-cell-corners', '#br-free-text', '#br-footer-note', '#br-split-letters', '#br-alt-tint', '#br-show-serial', '#br-caller-sheet',
         '#br-ticket-title', '#br-ticket-price', '#br-ticket-subtitle', '#br-ticket-meta', '#br-tickets-per-page',
         '#br-stub-pos', '#br-perf-style', '#br-stub-fields', '#br-ticket-footer', '#br-show-barcode',
         '#br-font-family', '#br-show-cut-lines', '#br-apply-batch-edit']
            .forEach(sel => {
                const el = overlay.querySelector(sel);
                const evt = (el.tagName === 'TEXTAREA' || el.type === 'text' || el.type === 'number') ? 'input' : 'change';
                el.addEventListener(evt, () => {
                    syncControlsToState(false);
                    renderPreview();
                });
            });

        // Color Presets
        overlay.querySelectorAll('[data-color-preset]').forEach(btn => {
            btn.addEventListener('click', () => {
                applyColorPreset(btn.dataset.colorPreset);
                syncControlsToState(false);
                renderPreview();
            });
        });

        // CustomColorPicker swatches
        overlay.querySelectorAll('.br-color-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                selectCtrl.closeAll();
                const targetId = chip.dataset.colorTarget;
                const hiddenInp = overlay.querySelector('#' + targetId);
                const swatchEl = overlay.querySelector(`[data-swatch-for="${targetId}"]`);
                const initCol = hiddenInp ? hiddenInp.value : '#007670';

                const applyCol = (hex) => {
                    const clean = normalizeHexColor(hex, initCol);
                    if (hiddenInp) hiddenInp.value = clean;
                    if (swatchEl) swatchEl.style.background = clean;
                    syncControlsToState(false);
                    renderPreview();
                };

                if (window.CustomColorPicker && typeof window.CustomColorPicker.open === 'function') {
                    window.CustomColorPicker.open(chip, initCol, applyCol);
                } else {
                    const nativeInp = document.createElement('input');
                    nativeInp.type = 'color';
                    nativeInp.value = initCol;
                    nativeInp.addEventListener('input', () => applyCol(nativeInp.value));
                    nativeInp.click();
                }
            });
        });

        // Preview Tabs & Pager
        overlay.querySelector('#br-ptab-single').addEventListener('click', () => { modalState.previewTab = 'single'; renderPreview(); });
        overlay.querySelector('#br-ptab-sheet').addEventListener('click', () => { modalState.previewTab = 'sheet'; renderPreview(); });
        overlay.querySelector('#br-ptab-caller').addEventListener('click', () => { modalState.previewTab = 'caller'; renderPreview(); });

        overlay.querySelector('#br-prev-item').addEventListener('click', () => {
            if (editEl || modalState.previewTab === 'caller') return;
            const totalItems = modalState.mode === 'bingo' ? bingoBatch.cards.length : raffleBatch.tickets.length;
            const perPage = modalState.mode === 'bingo' ? modalState.cardsPerPage : modalState.ticketsPerPage;
            const totalSheets = Math.max(1, Math.ceil(totalItems / perPage));
            if (modalState.previewTab === 'sheet') {
                modalState.sheetIndex = (modalState.sheetIndex - 1 + totalSheets) % totalSheets;
            } else {
                modalState.previewIndex = (modalState.previewIndex - 1 + totalItems) % totalItems;
            }
            renderPreview();
        });
        overlay.querySelector('#br-next-item').addEventListener('click', () => {
            if (editEl || modalState.previewTab === 'caller') return;
            const totalItems = modalState.mode === 'bingo' ? bingoBatch.cards.length : raffleBatch.tickets.length;
            const perPage = modalState.mode === 'bingo' ? modalState.cardsPerPage : modalState.ticketsPerPage;
            const totalSheets = Math.max(1, Math.ceil(totalItems / perPage));
            if (modalState.previewTab === 'sheet') {
                modalState.sheetIndex = (modalState.sheetIndex + 1) % totalSheets;
            } else {
                modalState.previewIndex = (modalState.previewIndex + 1) % totalItems;
            }
            renderPreview();
        });
        overlay.querySelector('#br-reshuffle-btn').addEventListener('click', () => {
            if (editEl) return;
            bingoBatch = generateUniqueBingoBatch(modalState);
            if (modalState.previewTab === 'caller') {
                modalState.previewTab = 'single';
            }
            renderPreview();
            if (typeof showToast === 'function') showToast('Bingo cards reshuffled!');
        });

        overlay.querySelector('#br-help-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            selectCtrl.closeAll();
            openHelpModal(overlay);
        });

        let onKeyDown = null;
        const closeModal = () => {
            teardownDrag();
            selectCtrl.destroy();
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen && typeof window.CustomColorPicker.close === 'function') {
                window.CustomColorPicker.close();
            }
            if (onKeyDown) document.removeEventListener('keydown', onKeyDown);
            const openHelp = document.getElementById('op-bingoraffle-help-modal');
            if (openHelp) openHelp.remove();
            overlay.remove();
        };
        onKeyDown = (e) => {
            if (e.key !== 'Escape') return;
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen && typeof window.CustomColorPicker.close === 'function') {
                window.CustomColorPicker.close();
                return;
            }
            const openHelp = document.getElementById('op-bingoraffle-help-modal');
            if (openHelp) openHelp.remove();
            else closeModal();
        };
        document.addEventListener('keydown', onKeyDown);

        overlay.querySelector('#br-close-x').addEventListener('click', closeModal);
        overlay.querySelector('#br-cancel-btn').addEventListener('click', closeModal);
        overlay.addEventListener('mousedown', (e) => {
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen) return;
            if (e.target === overlay && typeof window.triggerModalPulse === 'function') {
                window.triggerModalPulse(modalBox);
            }
        });

        overlay.querySelector('#br-insert-btn').addEventListener('click', () => {
            syncControlsToState(false);
            const cfgCopy = Object.assign({}, modalState);
            const activeMode = modalState.mode;
            const bBatch = bingoBatch;
            const rBatch = raffleBatch;
            const applyAll = modalState.applyBatchEdit;
            closeModal();

            if (editEl) {
                updateExistingElementOrBatch(editEl, cfgCopy, applyAll);
            } else {
                insertBatchIntoDocument(activeMode, activeMode === 'bingo' ? bBatch : rBatch, cfgCopy);
            }
        });

        selectCtrl.syncAll();
        renderPreview();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', installCanvasHandlers);
    } else {
        installCanvasHandlers();
    }

    window.BingoRaffleStudio = {
        showModal,
        parsePoolItems,
        generateUniqueBingoBatch,
        generateRaffleBatch,
        buildBingoCardSvg,
        buildBingoCallerListSvg,
        buildRaffleTicketSvg,
        buildSheetPreviewSvg,
        formatTicketSerial,
        BINGO_POOL_PRESETS,
        BINGO_STYLE_PRESETS,
        RAFFLE_STYLE_PRESETS
    };
})(window);
