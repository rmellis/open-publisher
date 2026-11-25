// Open Publisher Connect-the-Dots (Dot-to-Dot) Path Tool (v5.24.8)
// Converts any canvas vector path, shape outline, built-in silhouette, custom SVG path,
// or click-plotted path into a numbered sequence of dot nodes with configurable intervals
// (1s, 2s, 5s, 10s, A-Z, a-z), curved or straight guide hints, and automatic Page 2 Answer Keys.

(function(window) {
    'use strict';

    const WORK_SIZE = 500;
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const ALPHABET_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const ALPHABET_LOWER = 'abcdefghijklmnopqrstuvwxyz';

    const SEQUENCE_MODES = {
        '1s': { label: 'Count by 1s (1, 2, 3...)', shortLabel: 'Count by 1s', step: 1, defaultStart: 1, isAlpha: false },
        '2s': { label: 'Count by 2s (2, 4, 6...)', shortLabel: 'Count by 2s', step: 2, defaultStart: 2, isAlpha: false },
        '5s': { label: 'Count by 5s (5, 10, 15...)', shortLabel: 'Count by 5s', step: 5, defaultStart: 5, isAlpha: false },
        '10s': { label: 'Count by 10s (10, 20, 30...)', shortLabel: 'Count by 10s', step: 10, defaultStart: 10, isAlpha: false },
        'alpha-upper': { label: 'Alphabet Uppercase (A-Z)', shortLabel: 'Alphabet A-Z', step: 1, defaultStart: 1, isAlpha: true, upper: true },
        'alpha-lower': { label: 'Alphabet Lowercase (a-z)', shortLabel: 'Alphabet a-z', step: 1, defaultStart: 1, isAlpha: true, upper: false }
    };

    const HINT_STYLES = {
        none: { label: 'None (Blank)', shortLabel: 'None' },
        curved: { label: 'Curved Path Hints', shortLabel: 'Curved Hints' },
        straight: { label: 'Straight Line Hints', shortLabel: 'Straight Hints' }
    };

    const PRESET_SHAPES = {
        heart: {
            label: 'Classic Heart',
            isClosed: true,
            defaultDots: 22,
            d: 'M 50 88 C 12 62, 6 34, 16 20 C 26 8, 42 12, 50 26 C 58 12, 74 8, 84 20 C 94 34, 88 62, 50 88 Z'
        },
        star: {
            label: '5-Point Star',
            isClosed: true,
            defaultDots: 20,
            d: 'M 50 6 L 61.8 34.5 L 92.6 37.2 L 69.2 57.5 L 76.4 87.8 L 50 71.8 L 23.6 87.8 L 30.8 57.5 L 7.4 37.2 L 38.2 34.5 Z'
        },
        butterfly: {
            label: 'Butterfly',
            isClosed: true,
            defaultDots: 30,
            d: 'M 50 32 C 42 12, 14 6, 10 26 C 7 40, 22 48, 36 52 C 18 58, 12 76, 26 86 C 38 94, 46 80, 50 68 C 54 80, 62 94, 74 86 C 88 76, 82 58, 64 52 C 78 48, 93 40, 90 26 C 86 6, 58 12, 50 32 Z'
        },
        rocket: {
            label: 'Rocket Ship',
            isClosed: true,
            defaultDots: 24,
            d: 'M 50 6 C 64 20, 70 40, 70 62 L 86 78 L 86 90 L 66 80 L 60 92 L 50 84 L 40 92 L 34 80 L 14 90 L 14 78 L 30 62 C 30 40, 36 20, 50 6 Z'
        },
        sailboat: {
            label: 'Sailboat',
            isClosed: true,
            defaultDots: 20,
            d: 'M 52 8 L 82 58 L 52 58 Z M 46 16 L 16 58 L 46 58 Z M 10 66 L 90 66 L 78 88 L 22 88 Z',
            // Connected single-contour sailboat silhouette for clean dot-to-dot tracing
            dSingle: 'M 50 8 L 82 60 L 54 60 L 54 66 L 90 66 L 76 88 L 24 88 L 10 66 L 46 66 L 46 60 L 18 60 Z'
        },
        dino: {
            label: 'Friendly Dinosaur',
            isClosed: true,
            defaultDots: 32,
            d: 'M 66 12 C 80 12, 88 22, 86 32 C 84 38, 72 40, 68 42 C 66 50, 70 62, 70 76 L 70 90 L 58 90 L 58 76 L 42 76 L 42 90 L 30 90 L 30 72 C 20 72, 10 64, 8 52 C 16 54, 24 52, 30 44 C 36 32, 46 12, 66 12 Z'
        },
        cat: {
            label: 'Sitting Cat',
            isClosed: true,
            defaultDots: 28,
            d: 'M 32 10 L 42 22 C 47 20, 53 20, 58 22 L 68 10 L 72 28 C 78 36, 76 48, 68 54 C 76 62, 82 76, 86 84 C 92 86, 94 74, 88 68 C 96 66, 98 84, 86 90 L 28 90 C 20 82, 22 62, 32 54 C 24 48, 22 36, 28 28 Z'
        },
        house: {
            label: 'Classic House',
            isClosed: true,
            defaultDots: 18,
            d: 'M 50 10 L 90 44 L 80 44 L 80 88 L 58 88 L 58 64 L 42 64 L 42 88 L 20 88 L 20 44 L 10 44 L 24 32 L 24 16 L 34 16 L 34 24 Z'
        },
        crown: {
            label: 'Royal Crown',
            isClosed: true,
            defaultDots: 20,
            d: 'M 14 78 L 10 26 L 32 50 L 50 18 L 68 50 L 90 26 L 86 78 C 64 84, 36 84, 14 78 Z'
        },
        fish: {
            label: 'Tropical Fish',
            isClosed: true,
            defaultDots: 24,
            d: 'M 14 50 C 26 24, 58 20, 72 42 L 90 24 L 84 50 L 90 76 L 72 58 C 58 80, 26 76, 14 50 Z'
        },
        moon: {
            label: 'Crescent Moon',
            isClosed: true,
            defaultDots: 22,
            d: 'M 62 10 C 30 12, 12 40, 20 68 C 28 92, 62 96, 82 78 C 58 82, 40 66, 40 46 C 40 28, 50 16, 62 10 Z'
        },
        tree: {
            label: 'Pine Tree',
            isClosed: true,
            defaultDots: 24,
            d: 'M 50 8 L 72 34 L 60 34 L 80 56 L 66 56 L 88 78 L 58 78 L 58 92 L 42 92 L 42 78 L 12 78 L 34 56 L 20 56 L 40 34 L 28 34 Z'
        }
    };

    const COLOR_PRESETS = {
        teal: { label: 'Classic Teal', accent: '#007670', dot: '#0f172a', text: '#007670', hint: '#0d9488', solved: '#007670', bg: '#ffffff', border: '#cbd5e1' },
        print: { label: 'Classic Print', accent: '#111827', dot: '#111827', text: '#111827', hint: '#4b5563', solved: '#111827', bg: '#ffffff', border: '#9ca3af' },
        blueprint: { label: 'Blueprint', accent: '#1d4ed8', dot: '#1e3a8a', text: '#1d4ed8', hint: '#60a5fa', solved: '#2563eb', bg: '#eff6ff', border: '#93c5fd' },
        fun: { label: 'Warm Sun', accent: '#ea580c', dot: '#7c2d12', text: '#c2410c', hint: '#fb923c', solved: '#ea580c', bg: '#fffbeb', border: '#fcd34d' },
        berry: { label: 'Warm Berry', accent: '#be123c', dot: '#4c0519', text: '#9f1239', hint: '#fb7185', solved: '#be123c', bg: '#fff1f2', border: '#fda4af' },
        chalkboard: { label: 'Chalkboard', accent: '#2dd4bf', dot: '#f8fafc', text: '#99f6e4', hint: '#5eead4', solved: '#2dd4bf', bg: '#1e293b', border: '#475569' }
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
        if (s.toLowerCase() === 'transparent') return 'transparent';
        if (/^#[0-9a-f]{6}$/i.test(s)) return s;
        if (/^#[0-9a-f]{3}$/i.test(s)) {
            return '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
        }
        const m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
        if (m) {
            const hex = [m[1], m[2], m[3]]
                .map(v => Math.max(0, Math.min(255, parseInt(v, 10) || 0)).toString(16).padStart(2, '0'))
                .join('');
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

    // -------------------------------------------------------------------------
    // SVG Path Splitting & Geometry Extraction Engine
    // -------------------------------------------------------------------------

    function tokenizeSvgPath(d) {
        const str = String(d || '');
        const tokens = [];
        const re = /([a-zA-Z])|([-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?)/g;
        let m;
        while ((m = re.exec(str)) !== null) {
            if (m[1]) tokens.push({ type: 'cmd', val: m[1] });
            else tokens.push({ type: 'num', val: parseFloat(m[2]), raw: m[2] });
        }
        return tokens;
    }

    /**
     * Splits compound SVG path `d` strings (multiple M/m subpaths, e.g. Gear, Smiley, Ring)
     * into independent subpath strings with absolute starting `M`, handling SVG arc flags.
     */
    function splitSvgPathSubpaths(d) {
        const tokens = tokenizeSvgPath(d);
        if (tokens.length === 0) return [];

        const ARITY = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
        const subpaths = [];
        let currentParts = [];
        let cx = 0, cy = 0, sx = 0, sy = 0;
        let i = 0;
        let activeCmd = '';

        const readNumber = () => {
            if (i >= tokens.length || tokens[i].type !== 'num') return null;
            return tokens[i++].val;
        };

        // SVG allows compact arc flags without separators (e.g. "01" -> flag 0, flag 1)
        const readArcFlag = () => {
            if (i >= tokens.length || tokens[i].type !== 'num') return null;
            const tok = tokens[i];
            const raw = String(tok.raw || tok.val);
            if (raw.length > 1 && (raw[0] === '0' || raw[0] === '1') && !raw.includes('.')) {
                const flagVal = raw[0] === '1' ? 1 : 0;
                const rest = raw.slice(1);
                tok.raw = rest;
                tok.val = parseFloat(rest);
                return flagVal;
            }
            i++;
            return tok.val ? 1 : 0;
        };

        const flushSubpath = () => {
            if (currentParts.length > 0) {
                subpaths.push(currentParts.join(' '));
                currentParts = [];
            }
        };

        while (i < tokens.length) {
            if (tokens[i].type === 'cmd') {
                activeCmd = tokens[i++].val;
            } else if (!activeCmd) {
                i++;
                continue;
            }

            const upper = activeCmd.toUpperCase();
            const isRel = activeCmd !== upper;
            const arity = ARITY[upper];
            if (arity === undefined) continue;

            if (upper === 'Z') {
                currentParts.push('Z');
                cx = sx;
                cy = sy;
                activeCmd = '';
                continue;
            }

            const args = [];
            let valid = true;
            if (upper === 'A') {
                const rx = readNumber();
                const ry = readNumber();
                const rot = readNumber();
                const f1 = readArcFlag();
                const f2 = readArcFlag();
                const x = readNumber();
                const y = readNumber();
                if ([rx, ry, rot, f1, f2, x, y].some(v => v === null || Number.isNaN(v))) valid = false;
                else args.push(rx, ry, rot, f1, f2, x, y);
            } else {
                for (let k = 0; k < arity; k++) {
                    const num = readNumber();
                    if (num === null || Number.isNaN(num)) { valid = false; break; }
                    args.push(num);
                }
            }
            if (!valid) break;

            if (upper === 'M') {
                flushSubpath();
                const nx = isRel ? cx + args[0] : args[0];
                const ny = isRel ? cy + args[1] : args[1];
                cx = nx; cy = ny; sx = nx; sy = ny;
                currentParts.push(`M ${nx} ${ny}`);
                activeCmd = isRel ? 'l' : 'L';
            } else if (upper === 'L' || upper === 'T') {
                currentParts.push(`${activeCmd} ${args[0]} ${args[1]}`);
                cx = isRel ? cx + args[0] : args[0];
                cy = isRel ? cy + args[1] : args[1];
            } else if (upper === 'H') {
                currentParts.push(`${activeCmd} ${args[0]}`);
                cx = isRel ? cx + args[0] : args[0];
            } else if (upper === 'V') {
                currentParts.push(`${activeCmd} ${args[0]}`);
                cy = isRel ? cy + args[0] : args[0];
            } else if (upper === 'C') {
                currentParts.push(`${activeCmd} ${args.join(' ')}`);
                cx = isRel ? cx + args[4] : args[4];
                cy = isRel ? cy + args[5] : args[5];
            } else if (upper === 'S' || upper === 'Q') {
                currentParts.push(`${activeCmd} ${args.join(' ')}`);
                cx = isRel ? cx + args[2] : args[2];
                cy = isRel ? cy + args[3] : args[3];
            } else if (upper === 'A') {
                currentParts.push(`${activeCmd} ${args.join(' ')}`);
                cx = isRel ? cx + args[5] : args[5];
                cy = isRel ? cy + args[6] : args[6];
            }
        }
        flushSubpath();
        return subpaths;
    }

    function parseClipPathPolygon(rawClip, width, height) {
        if (!rawClip) return null;
        const m = String(rawClip).match(/polygon\(([^)]+)\)/i);
        if (!m) return null;
        const pts = m[1].split(',').map(part => part.trim()).filter(Boolean).map(pair => {
            const tokens = pair.split(/\s+/);
            if (tokens.length < 2) return null;
            const parseCoord = (tok, dim) => {
                if (tok.endsWith('%')) return (parseFloat(tok) / 100) * dim;
                return parseFloat(tok);
            };
            const x = parseCoord(tokens[0], width);
            const y = parseCoord(tokens[1], height);
            return (Number.isFinite(x) && Number.isFinite(y)) ? { x, y } : null;
        }).filter(Boolean);
        return pts.length >= 3 ? pts : null;
    }

    function densifyLinearVertices(pts, isClosed, targetSamples) {
        if (!Array.isArray(pts) || pts.length < 2) return [];
        const clean = [];
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            const prev = clean[clean.length - 1];
            if (!prev || Math.hypot(p.x - prev.x, p.y - prev.y) > 0.001) {
                clean.push({ x: p.x, y: p.y });
            }
        }
        if (isClosed && clean.length >= 3) {
            const first = clean[0];
            const last = clean[clean.length - 1];
            if (Math.hypot(first.x - last.x, first.y - last.y) > 0.001) {
                clean.push({ x: first.x, y: first.y });
            }
        }
        if (clean.length < 2) return [];

        const cumLen = [0];
        for (let i = 1; i < clean.length; i++) {
            cumLen.push(cumLen[i - 1] + Math.hypot(clean[i].x - clean[i - 1].x, clean[i].y - clean[i - 1].y));
        }
        const total = cumLen[cumLen.length - 1];
        if (total < 1e-4) return [];

        const count = Math.max(24, targetSamples || 360);
        const out = [];
        let segIdx = 0;
        const limit = isClosed ? count : count + 1;
        for (let i = 0; i < limit; i++) {
            const targetD = (i / count) * total;
            while (segIdx < cumLen.length - 2 && cumLen[segIdx + 1] < targetD) segIdx++;
            const s0 = cumLen[segIdx];
            const s1 = cumLen[segIdx + 1];
            const span = Math.max(1e-6, s1 - s0);
            const t = Math.max(0, Math.min(1, (targetD - s0) / span));
            out.push({
                x: clean[segIdx].x + (clean[segIdx + 1].x - clean[segIdx].x) * t,
                y: clean[segIdx].y + (clean[segIdx + 1].y - clean[segIdx].y) * t
            });
        }
        return out;
    }

    function normalizeContourToWorkspace(primaryPts, isClosed, extraPolylines, meta) {
        if (!primaryPts || primaryPts.length < 2) return null;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const scan = (pts) => {
            for (let i = 0; i < pts.length; i++) {
                if (pts[i].x < minX) minX = pts[i].x;
                if (pts[i].x > maxX) maxX = pts[i].x;
                if (pts[i].y < minY) minY = pts[i].y;
                if (pts[i].y > maxY) maxY = pts[i].y;
            }
        };
        scan(primaryPts);
        if (Array.isArray(extraPolylines)) {
            extraPolylines.forEach(ep => scan(ep.points || []));
        }

        const spanX = Math.max(1e-4, maxX - minX);
        const spanY = Math.max(1e-4, maxY - minY);
        const margin = 42;
        const usable = WORK_SIZE - margin * 2;
        const scale = Math.min(usable / spanX, usable / spanY);
        const drawW = spanX * scale;
        const drawH = spanY * scale;
        const offX = (WORK_SIZE - drawW) / 2;
        const offY = (WORK_SIZE - drawH) / 2;

        const mapPts = (pts) => pts.map(p => ({
            x: offX + (p.x - minX) * scale,
            y: offY + (p.y - minY) * scale
        }));

        const normPrimary = mapPts(primaryPts);
        const normSecondary = (Array.isArray(extraPolylines) ? extraPolylines : []).map(ep => ({
            points: mapPts(ep.points || []),
            isClosed: !!ep.isClosed
        })).filter(ep => ep.points.length >= 2);

        return {
            points: normPrimary,
            isClosed: !!isClosed,
            secondaryPolylines: normSecondary,
            sourceWidth: drawW,
            sourceHeight: drawH,
            label: (meta && meta.label) || 'Vector Path'
        };
    }

    /**
     * Measures & dense-samples a list of SVG geometry descriptors { tag, attrs, isClosedHint }
     * in an off-screen temporary SVG attached briefly to document.body.
     */
    function sampleGeometryDescriptors(descriptors, scaleX, scaleY, metaLabel) {
        if (!Array.isArray(descriptors) || descriptors.length === 0) return null;

        const hostSvg = document.createElementNS(SVG_NS, 'svg');
        hostSvg.setAttribute('viewBox', '0 0 1000 1000');
        hostSvg.style.cssText = 'position:fixed;left:-99999px;top:-99999px;width:1px;height:1px;visibility:hidden;pointer-events:none;';
        document.body.appendChild(hostSvg);

        const measured = [];
        try {
            descriptors.forEach(desc => {
                const geom = document.createElementNS(SVG_NS, desc.tag);
                Object.keys(desc.attrs || {}).forEach(k => geom.setAttribute(k, desc.attrs[k]));
                hostSvg.appendChild(geom);
                if (typeof geom.getTotalLength !== 'function') return;
                const totalLen = geom.getTotalLength();
                if (!Number.isFinite(totalLen) || totalLen < 1) return;

                const sampleCount = 420;
                const pts = [];
                for (let i = 0; i < sampleCount; i++) {
                    const dist = (i / sampleCount) * totalLen;
                    const pt = geom.getPointAtLength(dist);
                    pts.push({ x: pt.x * scaleX, y: pt.y * scaleY });
                }
                const endPt = geom.getPointAtLength(totalLen);
                const endScaled = { x: endPt.x * scaleX, y: endPt.y * scaleY };
                const startScaled = pts[0];
                const endGap = Math.hypot(endScaled.x - startScaled.x, endScaled.y - startScaled.y);
                const isClosed = desc.isClosedHint != null ? desc.isClosedHint : (endGap < 3.0);
                if (!isClosed) pts.push(endScaled);

                // Estimate scaled Euclidean length for primary contour selection
                let scaledLen = 0;
                for (let i = 1; i < pts.length; i++) {
                    scaledLen += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
                }
                if (isClosed && pts.length > 2) {
                    scaledLen += Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y);
                }
                measured.push({ points: pts, isClosed, length: scaledLen });
            });
        } finally {
            hostSvg.remove();
        }

        if (measured.length === 0) return null;
        measured.sort((a, b) => b.length - a.length);
        const primary = measured[0];
        const secondary = measured.slice(1, 10);
        return normalizeContourToWorkspace(primary.points, primary.isClosed, secondary, { label: metaLabel });
    }

    function collectDescriptorsFromSvgRoot(svgEl) {
        if (!svgEl) return [];
        const list = [];
        const nodes = svgEl.querySelectorAll('path, polygon, polyline, rect, circle, ellipse, line');
        nodes.forEach(node => {
            const tag = node.tagName.toLowerCase();
            if (tag === 'path') {
                const rawD = node.getAttribute('d') || '';
                const subpaths = splitSvgPathSubpaths(rawD);
                const chunks = subpaths.length > 0 ? subpaths : (rawD.trim() ? [rawD] : []);
                chunks.forEach(sub => {
                    const hasCloseZ = /z\s*$/i.test(sub.trim());
                    list.push({
                        tag: 'path',
                        attrs: { d: sub },
                        isClosedHint: hasCloseZ ? true : null
                    });
                });
            } else if (tag === 'polygon') {
                const pts = node.getAttribute('points') || '';
                if (pts.trim()) list.push({ tag: 'polygon', attrs: { points: pts }, isClosedHint: true });
            } else if (tag === 'polyline') {
                const pts = node.getAttribute('points') || '';
                if (pts.trim()) list.push({ tag: 'polyline', attrs: { points: pts }, isClosedHint: null });
            } else if (tag === 'rect') {
                const attrs = {};
                ['x', 'y', 'width', 'height', 'rx', 'ry'].forEach(a => {
                    if (node.hasAttribute(a)) attrs[a] = node.getAttribute(a);
                });
                if (parseFloat(attrs.width || '0') > 0 && parseFloat(attrs.height || '0') > 0) {
                    list.push({ tag: 'rect', attrs, isClosedHint: true });
                }
            } else if (tag === 'circle') {
                list.push({
                    tag: 'circle',
                    attrs: {
                        cx: node.getAttribute('cx') || '0',
                        cy: node.getAttribute('cy') || '0',
                        r: node.getAttribute('r') || '0'
                    },
                    isClosedHint: true
                });
            } else if (tag === 'ellipse') {
                list.push({
                    tag: 'ellipse',
                    attrs: {
                        cx: node.getAttribute('cx') || '0',
                        cy: node.getAttribute('cy') || '0',
                        rx: node.getAttribute('rx') || '0',
                        ry: node.getAttribute('ry') || '0'
                    },
                    isClosedHint: true
                });
            } else if (tag === 'line') {
                list.push({
                    tag: 'line',
                    attrs: {
                        x1: node.getAttribute('x1') || '0',
                        y1: node.getAttribute('y1') || '0',
                        x2: node.getAttribute('x2') || '0',
                        y2: node.getAttribute('y2') || '0'
                    },
                    isClosedHint: false
                });
            }
        });
        return list;
    }

    function extractPolylineFromElement(el) {
        if (!el) return null;
        const elW = parseFloat(el.style && el.style.width) || el.offsetWidth || 100;
        const elH = parseFloat(el.style && el.style.height) || el.offsetHeight || 100;
        const content = el.querySelector('.element-content') || el;

        // 1. Check for SVG vector geometry (excluding decorative picture frames / border art)
        const svgCandidates = Array.from(content.querySelectorAll('svg')).filter(svg => {
            return !svg.closest('.element-border-art, .border-art-wrapper, .element-picture-frame, #native-border-art-border');
        });
        const svgEl = svgCandidates[0] || null;
        if (svgEl) {
            const descriptors = collectDescriptorsFromSvgRoot(svgEl);
            if (descriptors.length > 0) {
                let vbW = 100, vbH = 100;
                const vbRaw = (svgEl.getAttribute('viewBox') || '').trim();
                if (vbRaw) {
                    const parts = vbRaw.split(/[\s,]+/).map(Number);
                    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
                        vbW = parts[2];
                        vbH = parts[3];
                    }
                } else {
                    const wAttr = parseFloat(svgEl.getAttribute('width'));
                    const hAttr = parseFloat(svgEl.getAttribute('height'));
                    if (wAttr > 0 && hAttr > 0) {
                        vbW = wAttr;
                        vbH = hAttr;
                    } else {
                        vbW = elW;
                        vbH = elH;
                    }
                }
                const preserveAR = (svgEl.getAttribute('preserveAspectRatio') || '').toLowerCase();
                let sx, sy;
                if (preserveAR.includes('none')) {
                    sx = elW / vbW;
                    sy = elH / vbH;
                } else {
                    const uni = Math.min(elW / vbW, elH / vbH);
                    sx = uni;
                    sy = uni;
                }
                const label = el.getAttribute('data-element-name')
                    || el.getAttribute('data-arrow-name')
                    || (el.getAttribute('data-type') === 'smart-arrow' ? 'Canvas Arrow' : 'Canvas Shape');
                return sampleGeometryDescriptors(descriptors, sx, sy, label);
            }
        }

        // 2. Fallback: Check CSS clip-path: polygon(...) on element or inner div
        const clipCandidates = [content, ...Array.from(content.querySelectorAll('div'))];
        for (let i = 0; i < clipCandidates.length; i++) {
            const node = clipCandidates[i];
            const cp = (node.style && (node.style.clipPath || node.style.webkitClipPath)) || '';
            const polyPts = parseClipPathPolygon(cp, elW, elH);
            if (polyPts) {
                const dense = densifyLinearVertices(polyPts, true, 360);
                if (dense.length >= 2) {
                    return normalizeContourToWorkspace(dense, true, [], {
                        label: el.getAttribute('data-element-name') || 'Clipped Shape'
                    });
                }
            }
        }

        return null;
    }

    function extractPolylineFromSvgString(rawInput) {
        const text = String(rawInput || '').trim();
        if (!text) return null;

        let descriptors = [];
        let vbW = 100, vbH = 100;

        if (/<svg[\s>]/i.test(text) || /<(path|polygon|polyline|rect|circle|ellipse|line)[\s>]/i.test(text)) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = /<svg[\s>]/i.test(text) ? text : `<svg xmlns="${SVG_NS}" viewBox="0 0 100 100">${text}</svg>`;
            const parsedSvg = tempDiv.querySelector('svg');
            if (parsedSvg) {
                const vbRaw = (parsedSvg.getAttribute('viewBox') || '').trim();
                if (vbRaw) {
                    const parts = vbRaw.split(/[\s,]+/).map(Number);
                    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
                        vbW = parts[2];
                        vbH = parts[3];
                    }
                }
                descriptors = collectDescriptorsFromSvgRoot(parsedSvg);
            }
        } else {
            // Treat bare text as SVG path `d` attribute (or strip leading `d="` wrapper)
            let bareD = text.replace(/^d\s*=\s*["']/i, '').replace(/["']\s*$/, '').trim();
            if (/^[a-zA-Z]/.test(bareD)) {
                const subs = splitSvgPathSubpaths(bareD);
                const list = subs.length > 0 ? subs : [bareD];
                descriptors = list.map(sub => ({
                    tag: 'path',
                    attrs: { d: sub },
                    isClosedHint: /z\s*$/i.test(sub.trim()) ? true : null
                }));
            }
        }

        if (descriptors.length === 0) return null;
        return sampleGeometryDescriptors(descriptors, 1, 1, 'Custom SVG Path');
    }

    function sampleCatmullRomContour(pts, isClosed, targetSamples) {
        if (!Array.isArray(pts) || pts.length < 2) return null;
        if (pts.length === 2) {
            return normalizeContourToWorkspace(densifyLinearVertices(pts, false, 160), false, [], { label: 'Custom Path' });
        }

        const out = [];
        const segCount = isClosed ? pts.length : pts.length - 1;
        const stepsPerSeg = Math.max(12, Math.round((targetSamples || 360) / segCount));
        const getPt = (idx) => {
            if (isClosed) return pts[((idx % pts.length) + pts.length) % pts.length];
            return pts[Math.max(0, Math.min(pts.length - 1, idx))];
        };

        for (let i = 0; i < segCount; i++) {
            const p0 = getPt(i - 1);
            const p1 = getPt(i);
            const p2 = getPt(i + 1);
            const p3 = getPt(i + 2);
            const stepEnd = (i === segCount - 1 && !isClosed) ? stepsPerSeg : stepsPerSeg - 1;
            for (let s = 0; s <= stepEnd; s++) {
                const t = s / stepsPerSeg;
                const t2 = t * t;
                const t3 = t2 * t;
                const x = 0.5 * (
                    (2 * p1.x) +
                    (-p0.x + p2.x) * t +
                    (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                    (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
                );
                const y = 0.5 * (
                    (2 * p1.y) +
                    (-p0.y + p2.y) * t +
                    (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                    (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
                );
                out.push({ x, y });
            }
        }
        return {
            points: out,
            isClosed: !!isClosed,
            secondaryPolylines: [],
            sourceWidth: WORK_SIZE,
            sourceHeight: WORK_SIZE,
            label: 'Click-to-Plot Path'
        };
    }

    function collectCanvasVectorCandidates() {
        const paper = document.getElementById('paper');
        if (!paper) return [];
        const allEls = Array.from(paper.querySelectorAll('.pub-element'));
        const selectedEl = (typeof state !== 'undefined') ? state.selectedEl : null;
        const results = [];

        allEls.forEach((el, idx) => {
            if (el.hasAttribute('data-dot-to-dot')) return;
            if (el.getAttribute('data-wordsearch') || el.getAttribute('data-crossword') || el.getAttribute('data-codebreaker') || el.getAttribute('data-cryptogram') || el.getAttribute('data-bingo-raffle')) return;
            if (el.style.display === 'none') return;

            const content = el.querySelector('.element-content') || el;
            const svg = Array.from(content.querySelectorAll('svg')).find(s => !s.closest('.element-border-art, .border-art-wrapper, .element-picture-frame, #native-border-art-border'));
            const hasGeom = svg && svg.querySelector('path, polygon, polyline, rect, circle, ellipse, line');
            const hasClipPoly = Array.from(content.querySelectorAll('div')).some(d => /polygon\(/i.test((d.style && (d.style.clipPath || d.style.webkitClipPath)) || ''));
            if (!hasGeom && !hasClipPoly) return;

            const rawName = el.getAttribute('data-element-name')
                || el.getAttribute('data-arrow-name')
                || (el.getAttribute('data-type') === 'smart-arrow' ? `Arrow #${idx + 1}` : `Shape #${idx + 1}`);
            const isSel = !!(selectedEl && selectedEl === el);
            results.push({
                el,
                index: idx,
                label: isSel ? `${rawName} (Selected)` : rawName,
                isSelected: isSel
            });
        });

        results.sort((a, b) => (b.isSelected ? 1 : 0) - (a.isSelected ? 1 : 0));
        return results;
    }

    // -------------------------------------------------------------------------
    // Node Sampling, Numbering Intervals & Outward Collision-Free Labeling
    // -------------------------------------------------------------------------

    function formatNodeLabel(index, sequenceMode, startValue) {
        const mode = SEQUENCE_MODES[sequenceMode] || SEQUENCE_MODES['1s'];
        if (mode.isAlpha) {
            const alpha = mode.upper ? ALPHABET_UPPER : ALPHABET_LOWER;
            if (index < 26) return alpha[index];
            const first = alpha[Math.floor(index / 26) - 1] || alpha[0];
            const second = alpha[index % 26];
            return first + second;
        }
        const start = Number.isFinite(Number(startValue)) ? Number(startValue) : mode.defaultStart;
        return String(start + index * mode.step);
    }

    function computeArcLengths(pts, isClosed) {
        const s = [0];
        for (let i = 1; i < pts.length; i++) {
            s.push(s[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
        }
        let total = s[s.length - 1];
        if (isClosed && pts.length > 2) {
            total += Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y);
        }
        return { cumLen: s, totalLen: total };
    }

    function interpolateContourAtLength(pts, cumLen, totalLen, isClosed, targetS) {
        if (pts.length === 0) return { x: 0, y: 0 };
        if (pts.length === 1 || totalLen <= 1e-6) return { x: pts[0].x, y: pts[0].y };

        let s = targetS;
        if (isClosed) {
            s = ((s % totalLen) + totalLen) % totalLen;
        } else {
            s = Math.max(0, Math.min(totalLen, s));
        }

        let lo = 0, hi = cumLen.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (cumLen[mid] <= s) lo = mid;
            else hi = mid - 1;
        }

        const p0 = pts[lo];
        const p1 = (lo < pts.length - 1) ? pts[lo + 1] : pts[0];
        const s0 = cumLen[lo];
        const s1 = (lo < pts.length - 1) ? cumLen[lo + 1] : totalLen;
        const span = Math.max(1e-6, s1 - s0);
        const t = Math.max(0, Math.min(1, (s - s0) / span));
        return {
            x: p0.x + (p1.x - p0.x) * t,
            y: p0.y + (p1.y - p0.y) * t
        };
    }

    function detectSharpCornerArcs(pts, cumLen, totalLen, isClosed, targetCount) {
        const n = pts.length;
        if (n < 6 || totalLen <= 1e-4) return [];
        const win = 3;
        const candidates = [];

        for (let i = 0; i < n; i++) {
            if (!isClosed && (i < win || i >= n - win)) continue;
            const prevIdx = isClosed ? (i - win + n) % n : (i - win);
            const nextIdx = isClosed ? (i + win) % n : (i + win);
            const ax = pts[i].x - pts[prevIdx].x;
            const ay = pts[i].y - pts[prevIdx].y;
            const bx = pts[nextIdx].x - pts[i].x;
            const by = pts[nextIdx].y - pts[i].y;
            const la = Math.hypot(ax, ay);
            const lb = Math.hypot(bx, by);
            if (la < 1e-4 || lb < 1e-4) continue;
            const dot = Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb)));
            const angleDeg = Math.acos(dot) * (180 / Math.PI);
            if (angleDeg >= 26) {
                candidates.push({ s: cumLen[i], angle: angleDeg });
            }
        }

        candidates.sort((a, b) => b.angle - a.angle);
        const minSep = Math.max(6, totalLen / Math.max(8, targetCount * 2.1));
        const chosen = [];

        for (let i = 0; i < candidates.length; i++) {
            const c = candidates[i];
            const tooClose = chosen.some(exist => {
                const rawDiff = Math.abs(exist.s - c.s);
                const d = isClosed ? Math.min(rawDiff, totalLen - rawDiff) : rawDiff;
                return d < minSep;
            });
            if (!tooClose) chosen.push(c);
            if (chosen.length >= targetCount) break;
        }

        return chosen.map(c => c.s).sort((a, b) => a - b);
    }

    function computeLabelPositions(nodes, isClosed, dotRadius, fontSize) {
        const n = nodes.length;
        if (n === 0) return [];

        // Shoelace signed area determines polygon winding so outward normal points away from interior
        let signedArea = 0;
        for (let i = 0; i < n; i++) {
            const a = nodes[i];
            const b = nodes[(i + 1) % n];
            signedArea += (a.x * b.y - b.x * a.y);
        }
        const windingSign = signedArea >= 0 ? 1 : -1;
        const baseOffset = dotRadius + Math.max(8, fontSize * 0.85) + 4;

        const labels = nodes.map((node, i) => {
            const hasPrev = isClosed || i > 0;
            const hasNext = isClosed || i < n - 1;
            const prev = hasPrev ? nodes[(i - 1 + n) % n] : null;
            const next = hasNext ? nodes[(i + 1) % n] : null;

            const unitNormal = (ax, ay, bx, by) => {
                const dx = bx - ax;
                const dy = by - ay;
                const len = Math.hypot(dx, dy) || 1;
                // In screen Y-down coords, CCW (+area) interior is left (-dy, dx) -> outward is (dy, -dx)
                return windingSign > 0
                    ? { nx: dy / len, ny: -dx / len }
                    : { nx: -dy / len, ny: dx / len };
            };

            let nx = 0, ny = 0;
            if (prev && next) {
                const n1 = unitNormal(prev.x, prev.y, node.x, node.y);
                const n2 = unitNormal(node.x, node.y, next.x, next.y);
                nx = n1.nx + n2.nx;
                ny = n1.ny + n2.ny;
            } else if (next) {
                const n1 = unitNormal(node.x, node.y, next.x, next.y);
                nx = n1.nx; ny = n1.ny;
            } else if (prev) {
                const n1 = unitNormal(prev.x, prev.y, node.x, node.y);
                nx = n1.nx; ny = n1.ny;
            }

            const nLen = Math.hypot(nx, ny);
            if (nLen < 1e-4) {
                nx = 0; ny = -1;
            } else {
                nx /= nLen; ny /= nLen;
            }

            const halfW = Math.max(8, node.label.length * fontSize * 0.34 + 3);
            const halfH = Math.max(7, fontSize * 0.56);

            return {
                x: node.x + nx * baseOffset,
                y: node.y + ny * baseOffset,
                homeX: node.x + nx * baseOffset,
                homeY: node.y + ny * baseOffset,
                halfW,
                halfH
            };
        });

        // Pairwise repulsion between labels & clearance away from all dot centers
        const dotClearance = dotRadius + Math.max(7, fontSize * 0.52) + 3;
        for (let iter = 0; iter < 14; iter++) {
            // 1. Repel overlapping labels
            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    const a = labels[i];
                    const b = labels[j];
                    const reqX = a.halfW + b.halfW + 3;
                    const reqY = a.halfH + b.halfH + 2;
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const ox = reqX - Math.abs(dx);
                    const oy = reqY - Math.abs(dy);
                    if (ox > 0 && oy > 0) {
                        if (ox < oy) {
                            const push = (ox * 0.52) * (dx >= 0 ? 1 : -1 || 1);
                            a.x -= push;
                            b.x += push;
                        } else {
                            const push = (oy * 0.52) * (dy >= 0 ? 1 : -1 || 1);
                            a.y -= push;
                            b.y += push;
                        }
                    }
                }
            }

            // 2. Keep each label clear of every dot center + soft spring back to home position
            for (let i = 0; i < n; i++) {
                const lbl = labels[i];
                for (let k = 0; k < n; k++) {
                    const dot = nodes[k];
                    const dx = lbl.x - dot.x;
                    const dy = lbl.y - dot.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < dotClearance) {
                        const ux = dist > 1e-4 ? dx / dist : 0;
                        const uy = dist > 1e-4 ? dy / dist : -1;
                        const push = dotClearance - dist;
                        lbl.x += ux * push;
                        lbl.y += uy * push;
                    }
                }
                lbl.x += (lbl.homeX - lbl.x) * 0.14;
                lbl.y += (lbl.homeY - lbl.y) * 0.14;
            }
        }

        return labels;
    }

    function sampleDotNodes(contour, options) {
        if (!contour || !Array.isArray(contour.points) || contour.points.length < 2) {
            return { nodes: [], segments: [], isClosed: false, secondaryPolylines: [] };
        }
        const opts = options || {};
        const isClosed = opts.isClosed !== undefined ? !!opts.isClosed : !!contour.isClosed;
        const placementMode = opts.placementMode || 'smart';
        const sequenceMode = opts.sequenceMode || '1s';
        const startValue = opts.startValue != null ? opts.startValue : 1;
        const dotRadius = Number(opts.dotRadius) || 4.2;
        const labelFontSize = Number(opts.labelFontSize) || 12;

        let pts = contour.points.slice();
        if (opts.reverseDirection) {
            pts.reverse();
        }

        const { cumLen, totalLen } = computeArcLengths(pts, isClosed);
        let nodeArcs = [];

        if (opts.exactControlPoints && Array.isArray(opts.exactControlPoints) && opts.exactControlPoints.length >= 2) {
            // In exact Click-to-Plot mode with straight segments or explicit nodes
            const rawNodes = (opts.reverseDirection ? opts.exactControlPoints.slice().reverse() : opts.exactControlPoints.slice());
            const shift = ((parseInt(opts.startShift, 10) || 0) % rawNodes.length + rawNodes.length) % rawNodes.length;
            const ordered = isClosed && shift > 0 ? rawNodes.slice(shift).concat(rawNodes.slice(0, shift)) : rawNodes;
            const nodes = ordered.map((p, idx) => ({
                x: p.x,
                y: p.y,
                s: 0,
                label: formatNodeLabel(idx, sequenceMode, startValue)
            }));
            const segs = [];
            const segTotal = isClosed ? nodes.length : Math.max(0, nodes.length - 1);
            for (let i = 0; i < segTotal; i++) {
                const a = nodes[i];
                const b = nodes[(i + 1) % nodes.length];
                let curvePts = [ { x: a.x, y: a.y }, { x: b.x, y: b.y } ];
                if (opts.curvedControlContour && Array.isArray(opts.curvedControlContour.points) && opts.curvedControlContour.points.length >= 4) {
                    const segPerNode = Math.floor(opts.curvedControlContour.points.length / (isClosed ? ordered.length : (ordered.length - 1)));
                    const rawIdxStart = ((i + (isClosed ? shift : 0)) % ordered.length) * segPerNode;
                    const slice = [];
                    for (let k = 0; k <= segPerNode; k++) {
                        slice.push(opts.curvedControlContour.points[(rawIdxStart + k) % opts.curvedControlContour.points.length]);
                    }
                    if (opts.reverseDirection) slice.reverse();
                    if (slice.length >= 2) {
                        slice[0] = { x: a.x, y: a.y };
                        slice[slice.length - 1] = { x: b.x, y: b.y };
                        curvePts = slice;
                    }
                }
                segs.push({ from: i, to: (i + 1) % nodes.length, curvePts });
            }
            const labels = computeLabelPositions(nodes, isClosed, dotRadius, labelFontSize);
            nodes.forEach((nObj, i) => { nObj.lx = labels[i].x; nObj.ly = labels[i].y; nObj.halfW = labels[i].halfW; nObj.halfH = labels[i].halfH; });
            return {
                nodes,
                segments: segs,
                isClosed,
                secondaryPolylines: contour.secondaryPolylines || []
            };
        }

        const requestedDots = Math.max(3, Math.min(80, parseInt(opts.dotCount, 10) || 24));
        if (placementMode === 'smart') {
            let anchors = detectSharpCornerArcs(pts, cumLen, totalLen, isClosed, requestedDots);
            if (!isClosed) {
                const minEdge = totalLen / Math.max(10, requestedDots * 2);
                anchors = anchors.filter(a => a > minEdge && a < totalLen - minEdge);
                anchors.unshift(0);
                anchors.push(totalLen);
            } else if (anchors.length === 0) {
                anchors = [0];
            }

            const remaining = Math.max(0, requestedDots - anchors.length);
            const spanCount = isClosed ? anchors.length : Math.max(0, anchors.length - 1);
            const spans = [];
            for (let i = 0; i < spanCount; i++) {
                const a = anchors[i];
                const b = isClosed && i === spanCount - 1 ? anchors[0] + totalLen : anchors[i + 1];
                spans.push({ start: a, end: b, len: Math.max(0.01, b - a), extra: 0 });
            }

            if (remaining > 0 && spans.length > 0) {
                // Allocate extra dots one-by-one into largest average-subspan length
                for (let k = 0; k < remaining; k++) {
                    let bestIdx = 0;
                    let bestSpacing = -1;
                    for (let i = 0; i < spans.length; i++) {
                        const spacing = spans[i].len / (spans[i].extra + 1);
                        if (spacing > bestSpacing) {
                            bestSpacing = spacing;
                            bestIdx = i;
                        }
                    }
                    spans[bestIdx].extra++;
                }
            }

            for (let i = 0; i < spans.length; i++) {
                const sp = spans[i];
                if (i === 0 || isClosed) {
                    nodeArcs.push(sp.start % totalLen);
                }
                for (let e = 1; e <= sp.extra; e++) {
                    const sVal = sp.start + (e / (sp.extra + 1)) * sp.len;
                    nodeArcs.push(isClosed ? (sVal % totalLen) : sVal);
                }
                if (!isClosed && i === spans.length - 1) {
                    nodeArcs.push(sp.end);
                }
            }
            if (!isClosed && anchors.length === 2 && spanCount === 1 && nodeArcs.length < 2) {
                nodeArcs = [0, totalLen];
            }
        } else {
            // Uniform arc-length spacing
            for (let i = 0; i < requestedDots; i++) {
                const sVal = isClosed
                    ? (i / requestedDots) * totalLen
                    : (i / Math.max(1, requestedDots - 1)) * totalLen;
                nodeArcs.push(sVal);
            }
        }

        // Clean ordering & shift support for closed loops
        if (isClosed && nodeArcs.length > 1) {
            nodeArcs.sort((a, b) => a - b);
            const shift = ((parseInt(opts.startShift, 10) || 0) % nodeArcs.length + nodeArcs.length) % nodeArcs.length;
            if (shift > 0) {
                nodeArcs = nodeArcs.slice(shift).concat(nodeArcs.slice(0, shift));
            }
        }

        const nodes = nodeArcs.map((sVal, idx) => {
            const pt = interpolateContourAtLength(pts, cumLen, totalLen, isClosed, sVal);
            return {
                x: pt.x,
                y: pt.y,
                s: sVal,
                label: formatNodeLabel(idx, sequenceMode, startValue)
            };
        });

        const segments = [];
        const segTotal = isClosed ? nodes.length : Math.max(0, nodes.length - 1);
        const subSteps = 12;
        for (let i = 0; i < segTotal; i++) {
            const nextIdx = (i + 1) % nodes.length;
            const sA = nodes[i].s;
            let sB = nodes[nextIdx].s;
            if (isClosed && sB <= sA) sB += totalLen;
            const span = Math.max(1e-4, sB - sA);
            const curvePts = [{ x: nodes[i].x, y: nodes[i].y }];
            for (let step = 1; step < subSteps; step++) {
                const sSample = sA + (step / subSteps) * span;
                curvePts.push(interpolateContourAtLength(pts, cumLen, totalLen, isClosed, sSample));
            }
            curvePts.push({ x: nodes[nextIdx].x, y: nodes[nextIdx].y });
            segments.push({ from: i, to: nextIdx, curvePts });
        }

        const labels = computeLabelPositions(nodes, isClosed, dotRadius, labelFontSize);
        nodes.forEach((node, i) => {
            node.lx = labels[i].x;
            node.ly = labels[i].y;
            node.halfW = labels[i].halfW;
            node.halfH = labels[i].halfH;
        });

        return {
            nodes,
            segments,
            isClosed,
            secondaryPolylines: contour.secondaryPolylines || []
        };
    }

    // -------------------------------------------------------------------------
    // Crisp Vector SVG Renderer (Puzzle & Solved Answer Key)
    // -------------------------------------------------------------------------

    function pointsToSvgPathD(pts, closeFlag) {
        if (!pts || pts.length === 0) return '';
        let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
        for (let i = 1; i < pts.length; i++) {
            d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
        }
        if (closeFlag) d += ' Z';
        return d;
    }

    function buildDotToDotSvg(sampled, cfg, isAnswerKey) {
        const nodes = sampled && sampled.nodes ? sampled.nodes : [];
        const segments = sampled && sampled.segments ? sampled.segments : [];
        const secondary = sampled && sampled.secondaryPolylines ? sampled.secondaryPolylines : [];
        const isClosed = !!(sampled && sampled.isClosed);

        const bgColor = normalizeHexColor(cfg.bgColor, '#ffffff');
        const borderColor = normalizeHexColor(cfg.borderColor, '#cbd5e1');
        const dotColor = normalizeHexColor(cfg.dotColor, '#0f172a');
        const numberColor = normalizeHexColor(cfg.textColor, '#007670');
        const hintColor = normalizeHexColor(cfg.hintColor, '#0d9488');
        const solvedColor = normalizeHexColor(cfg.solvedColor, '#007670');
        const accentColor = normalizeHexColor(cfg.accentColor, '#007670');
        const fontFamily = cfg.fontFamily || 'Segoe UI, Arial, sans-serif';
        const dotRadius = Number(cfg.dotRadius) || 4.2;
        const fontSize = Number(cfg.labelFontSize) || 12;
        const hintStyle = cfg.hintStyle || 'curved';
        const hintCoverage = cfg.hintCoverage || 'all';
        const rawHintOp = (cfg.hintOpacity != null && cfg.hintOpacity !== '') ? Number(cfg.hintOpacity) : 0.20;
        const hintOpacity = Number.isFinite(rawHintOp) ? Math.max(0, Math.min(0.75, rawHintOp)) : 0.20;
        const showStartMarker = cfg.showStartMarker !== false;

        if (nodes.length === 0) {
            return {
                svgMarkup: `<svg xmlns="${SVG_NS}" viewBox="0 0 ${WORK_SIZE} ${WORK_SIZE}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%;"><rect x="2" y="2" width="${WORK_SIZE - 4}" height="${WORK_SIZE - 4}" rx="12" fill="${escapeXml(bgColor)}" stroke="${escapeXml(borderColor)}" stroke-width="1.5" stroke-dasharray="6 5"/><text x="250" y="244" text-anchor="middle" font-family="${escapeXml(fontFamily)}" font-size="15" font-weight="600" fill="${escapeXml(numberColor)}" opacity="0.75">Click inside the canvas to plot nodes</text><text x="250" y="268" text-anchor="middle" font-family="${escapeXml(fontFamily)}" font-size="12" fill="${escapeXml(dotColor)}" opacity="0.55">or choose a Built-in Silhouette / Canvas Shape</text></svg>`,
                width: WORK_SIZE,
                height: WORK_SIZE,
                nodeCount: 0,
                firstLabel: '-',
                lastLabel: '-'
            };
        }

        // Compute tight bounding box including curves, dots, and label extents
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const expand = (x, y, rx, ry) => {
            if (x - rx < minX) minX = x - rx;
            if (x + rx > maxX) maxX = x + rx;
            if (y - ry < minY) minY = y - ry;
            if (y + ry > maxY) maxY = y + ry;
        };
        nodes.forEach((nd, idx) => {
            expand(nd.x, nd.y, dotRadius + (idx === 0 && showStartMarker ? 8 : 2), dotRadius + (idx === 0 && showStartMarker ? 8 : 2));
            expand(nd.lx, nd.ly, (nd.halfW || 10) + 4, (nd.halfH || 8) + 4);
        });
        segments.forEach(seg => {
            (seg.curvePts || []).forEach(p => expand(p.x, p.y, 3, 3));
        });
        secondary.forEach(sp => {
            (sp.points || []).forEach(p => expand(p.x, p.y, 2, 2));
        });

        let pad = 26;
        let vbX = Math.floor(minX - pad);
        let vbY = Math.floor(minY - pad);
        let vbW = Math.max(160, Math.ceil(maxX - minX + pad * 2));
        let vbH = Math.max(160, Math.ceil(maxY - minY + pad * 2));
        if (!isAnswerKey && cfg.sourceMode === 'plot') {
            vbX = Math.min(0, vbX);
            vbY = Math.min(0, vbY);
            vbW = Math.max(WORK_SIZE, Math.ceil(maxX + pad) - vbX);
            vbH = Math.max(WORK_SIZE, Math.ceil(maxY + pad) - vbY);
        }
        const haloColor = bgColor === 'transparent' ? '#ffffff' : bgColor;

        const parts = [];
        parts.push(`<svg xmlns="${SVG_NS}" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%;overflow:visible;">`);

        // Optional background card frame
        if (bgColor !== 'transparent') {
            parts.push(`<rect x="${vbX + 1}" y="${vbY + 1}" width="${vbW - 2}" height="${vbH - 2}" rx="12" fill="${escapeXml(bgColor)}" stroke="${escapeXml(borderColor)}" stroke-width="1.5"/>`);
        }

        // Secondary decorative inner contour outlines from compound canvas shapes (if any)
        if (secondary.length > 0 && cfg.includeInnerDetails !== false) {
            parts.push('<g class="dtd-inner-details" pointer-events="none">');
            secondary.forEach(sp => {
                const sd = pointsToSvgPathD(sp.points, sp.isClosed);
                if (!sd) return;
                const op = isAnswerKey ? 0.55 : 0.22;
                const dash = isAnswerKey ? '' : ' stroke-dasharray="3 4"';
                parts.push(`<path d="${sd}" fill="none" stroke="${escapeXml(dotColor)}" stroke-opacity="${op}" stroke-width="1.5" stroke-linejoin="round"${dash}/>`);
            });
            parts.push('</g>');
        }

        // Solved Answer Key Path + Soft Interior Tint
        if (isAnswerKey && segments.length > 0) {
            const solvedPts = [];
            segments.forEach((seg, sIdx) => {
                if (hintStyle === 'straight') {
                    solvedPts.push(nodes[seg.from]);
                    if (sIdx === segments.length - 1 && !isClosed) solvedPts.push(nodes[seg.to]);
                } else {
                    const cPts = seg.curvePts || [nodes[seg.from], nodes[seg.to]];
                    for (let i = 0; i < cPts.length - 1; i++) solvedPts.push(cPts[i]);
                    if (sIdx === segments.length - 1 && !isClosed) solvedPts.push(cPts[cPts.length - 1]);
                }
            });
            const solvedD = pointsToSvgPathD(solvedPts, isClosed);
            if (solvedD) {
                const fillAttr = isClosed ? `fill="${escapeXml(accentColor)}" fill-opacity="0.10"` : 'fill="none"';
                parts.push(`<path class="dtd-solved-path" d="${solvedD}" ${fillAttr} stroke="${escapeXml(solvedColor)}" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/>`);
            }
        }
        // Puzzle Guide Hints (Curved contour or Straight chords)
        else if (!isAnswerKey && hintStyle !== 'none' && hintOpacity > 0 && segments.length > 0) {
            parts.push(`<g class="dtd-guide-hints" data-hint-style="${escapeXml(hintStyle)}">`);
            segments.forEach((seg, sIdx) => {
                if (hintCoverage === 'starter' && sIdx >= 3) return;
                if (hintCoverage === 'alternating' && (sIdx % 2 === 1)) return;

                let dStr = '';
                if (hintStyle === 'curved' && seg.curvePts && seg.curvePts.length >= 2) {
                    dStr = pointsToSvgPathD(seg.curvePts, false);
                } else {
                    const a = nodes[seg.from];
                    const b = nodes[seg.to];
                    dStr = `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
                }
                if (dStr) {
                    parts.push(`<path class="dtd-guide-hint-seg" d="${dStr}" fill="none" stroke="${escapeXml(hintColor)}" stroke-opacity="${hintOpacity.toFixed(2)}" stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round" stroke-linejoin="round"/>`);
                }
            });
            parts.push('</g>');
        }

        // Optional Start Marker (Halo ring on Dot #1 + tiny directional chevron along first segment)
        if (showStartMarker && nodes.length >= 2) {
            const first = nodes[0];
            const firstSeg = segments[0];
            const dirTarget = (firstSeg && hintStyle === 'curved' && firstSeg.curvePts && firstSeg.curvePts.length > 2)
                ? firstSeg.curvePts[Math.min(2, firstSeg.curvePts.length - 1)]
                : nodes[1];
            const dx = dirTarget.x - first.x;
            const dy = dirTarget.y - first.y;
            const segLen = Math.hypot(dx, dy) || 1;
            const ux = dx / segLen;
            const uy = dy / segLen;
            const px = -uy;
            const py = ux;
            const tipDist = Math.min(segLen * 0.65, dotRadius + 14);
            const baseDist = tipDist - 5;
            const tipX = first.x + ux * tipDist;
            const tipY = first.y + uy * tipDist;
            const leftX = first.x + ux * baseDist + px * 3.4;
            const leftY = first.y + uy * baseDist + py * 3.4;
            const rightX = first.x + ux * baseDist - px * 3.4;
            const rightY = first.y + uy * baseDist - py * 3.4;

            parts.push('<g class="dtd-start-marker" pointer-events="none">');
            parts.push(`<circle cx="${first.x.toFixed(1)}" cy="${first.y.toFixed(1)}" r="${(dotRadius + 4.2).toFixed(1)}" fill="none" stroke="${escapeXml(accentColor)}" stroke-width="1.8" stroke-dasharray="2.5 2"/>`);
            parts.push(`<polygon points="${tipX.toFixed(1)},${tipY.toFixed(1)} ${leftX.toFixed(1)},${leftY.toFixed(1)} ${rightX.toFixed(1)},${rightY.toFixed(1)}" fill="${escapeXml(accentColor)}" opacity="0.88"/>`);
            parts.push('</g>');
        }

        // Dots & Number/Letter Labels
        parts.push('<g class="dtd-nodes">');
        nodes.forEach((nd, idx) => {
            const isStart = idx === 0 && showStartMarker;
            const fillCol = isStart ? accentColor : dotColor;
            parts.push(`<circle class="dtd-dot" cx="${nd.x.toFixed(1)}" cy="${nd.y.toFixed(1)}" r="${dotRadius.toFixed(1)}" fill="${escapeXml(fillCol)}" stroke="${escapeXml(haloColor)}" stroke-width="1.4"/>`);
        });
        parts.push('</g>');

        parts.push(`<g class="dtd-labels" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" font-weight="700" text-anchor="middle" dominant-baseline="central">`);
        nodes.forEach((nd, idx) => {
            const isStart = idx === 0 && showStartMarker;
            const lblFill = isStart ? accentColor : numberColor;
            parts.push(`<text class="dtd-label" x="${nd.lx.toFixed(1)}" y="${nd.ly.toFixed(1)}" fill="${escapeXml(lblFill)}" paint-order="stroke" stroke="${escapeXml(haloColor)}" stroke-width="3.6" stroke-linejoin="round">${escapeXml(nd.label)}</text>`);
        });
        parts.push('</g>');

        parts.push('</svg>');

        return {
            svgMarkup: parts.join(''),
            width: vbW,
            height: vbH,
            nodeCount: nodes.length,
            firstLabel: nodes[0].label,
            lastLabel: nodes[nodes.length - 1].label
        };
    }

    // -------------------------------------------------------------------------
    // State Serialization, Linked Answer Keys & Document Insertion
    // -------------------------------------------------------------------------

    function serializeDtdState(dtdId, cfg, contour) {
        return JSON.stringify({
            dtdId,
            title: cfg.title || 'Connect the Dots',
            sourceMode: cfg.sourceMode || 'preset',
            presetKey: cfg.presetKey || 'heart',
            customSvg: cfg.customSvg || '',
            plotPoints: Array.isArray(cfg.plotPoints) ? cfg.plotPoints : [],
            dotCount: cfg.dotCount || 24,
            placementMode: cfg.placementMode || 'smart',
            sequenceMode: cfg.sequenceMode || '1s',
            startValue: cfg.startValue != null ? cfg.startValue : 1,
            hintStyle: cfg.hintStyle || 'curved',
            hintCoverage: cfg.hintCoverage || 'all',
            hintOpacity: cfg.hintOpacity != null ? cfg.hintOpacity : 0.20,
            isClosed: !!cfg.isClosed,
            startShift: cfg.startShift || 0,
            reverseDirection: !!cfg.reverseDirection,
            showStartMarker: cfg.showStartMarker !== false,
            includeInnerDetails: cfg.includeInnerDetails !== false,
            dotRadius: cfg.dotRadius || 4.2,
            labelFontSize: cfg.labelFontSize || 12,
            fontFamily: cfg.fontFamily || 'Segoe UI, Arial, sans-serif',
            accentColor: cfg.accentColor || '#007670',
            dotColor: cfg.dotColor || '#0f172a',
            textColor: cfg.textColor || '#007670',
            hintColor: cfg.hintColor || '#0d9488',
            solvedColor: cfg.solvedColor || '#007670',
            bgColor: cfg.bgColor || '#ffffff',
            borderColor: cfg.borderColor || '#cbd5e1',
            answerKeyOnPage2: !!cfg.answerKeyOnPage2,
            // Preserve extracted canvas contour so re-editing a canvas-derived puzzle keeps exact shape geometry
            savedContour: (cfg.sourceMode === 'canvas' && contour) ? contour : null
        });
    }

    function computeResultFromState(cfg, contour) {
        const isPlotExact = (cfg.sourceMode === 'plot');
        const activeContour = isPlotExact
            ? (cfg.hintStyle === 'curved'
                ? sampleCatmullRomContour(cfg.plotPoints || [], !!cfg.isClosed, 320)
                : normalizeLinearPlotContour(cfg.plotPoints || [], !!cfg.isClosed))
            : contour;

        const sampleOpts = {
            dotCount: cfg.dotCount,
            placementMode: cfg.placementMode,
            sequenceMode: cfg.sequenceMode,
            startValue: cfg.startValue,
            isClosed: cfg.isClosed,
            startShift: cfg.startShift,
            reverseDirection: cfg.reverseDirection,
            dotRadius: cfg.dotRadius,
            labelFontSize: cfg.labelFontSize
        };

        if (isPlotExact && Array.isArray(cfg.plotPoints) && cfg.plotPoints.length === 1) {
            const p = cfg.plotPoints[0];
            const dotR = Number(cfg.dotRadius) || 4.2;
            const fs = Number(cfg.labelFontSize) || 12;
            return {
                nodes: [{ x: p.x, y: p.y, s: 0, label: formatNodeLabel(0, cfg.sequenceMode, cfg.startValue), lx: p.x, ly: p.y - dotR - fs * 0.9 - 3, halfW: 10, halfH: 8 }],
                segments: [],
                isClosed: !!cfg.isClosed,
                secondaryPolylines: []
            };
        }

        if (isPlotExact && Array.isArray(cfg.plotPoints) && cfg.plotPoints.length >= 2) {
            const rawPts = cfg.plotPoints.map(p => ({ x: p.x, y: p.y }));
            const curvedCont = sampleCatmullRomContour(rawPts, !!cfg.isClosed, rawPts.length * 16);
            sampleOpts.exactControlPoints = rawPts;
            sampleOpts.curvedControlContour = cfg.hintStyle === 'curved' ? curvedCont : null;
            return sampleDotNodes(curvedCont || { points: rawPts, isClosed: !!cfg.isClosed }, sampleOpts);
        }

        return sampleDotNodes(activeContour, sampleOpts);
    }

    function normalizeLinearPlotContour(pts, isClosed) {
        if (!Array.isArray(pts) || pts.length < 2) return null;
        return {
            points: densifyLinearVertices(pts, !!isClosed, 240),
            isClosed: !!isClosed,
            secondaryPolylines: [],
            sourceWidth: WORK_SIZE,
            sourceHeight: WORK_SIZE,
            label: 'Click-to-Plot Path'
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

    function buildSubtitleText(sampled, cfg, isAnswerKey) {
        const nodes = (sampled && sampled.nodes) || [];
        const first = nodes.length ? nodes[0].label : '1';
        const second = nodes.length > 1 ? nodes[1].label : '2';
        const last = nodes.length ? nodes[nodes.length - 1].label : 'N';
        const seqInfo = SEQUENCE_MODES[cfg.sequenceMode] || SEQUENCE_MODES['1s'];
        if (isAnswerKey) {
            return `Complete solved picture (${nodes.length} nodes: ${first}, ${second} ... ${last}).`;
        }
        return `Connect the dots in order (${seqInfo.shortLabel}: ${first}, ${second} ... ${last}) to reveal the picture!`;
    }

    function syncLinkedAnswerKeys(dtdId, sampled, cfg, contour) {
        if (!dtdId) return;
        const serialized = serializeDtdState(dtdId, cfg, contour);
        const solvedRender = buildDotToDotSvg(sampled, cfg, true);
        const puzzleRender = buildDotToDotSvg(sampled, cfg, false);
        const rawTitle = (cfg.title || 'Connect the Dots').trim() || 'Connect the Dots';

        const applyRoleUpdate = (el, role) => {
            el.setAttribute('data-dtd-state', serialized);
            const content = el.querySelector('.element-content');
            if (!content) return;
            if (role === 'answer-key') {
                content.innerHTML = solvedRender.svgMarkup;
                el.setAttribute('data-aspect-ratio', String(solvedRender.width / solvedRender.height));
            } else if (role === 'puzzle') {
                content.innerHTML = puzzleRender.svgMarkup;
                el.setAttribute('data-aspect-ratio', String(puzzleRender.width / puzzleRender.height));
            } else if (role === 'title' || role === 'answer-title') {
                const textDiv = content.querySelector('[contenteditable]') || content.firstElementChild;
                if (textDiv) textDiv.textContent = role === 'answer-title' ? `${rawTitle} - Answer Key` : rawTitle;
            } else if (role === 'subtitle' || role === 'answer-subtitle') {
                const textDiv = content.querySelector('[contenteditable]') || content.firstElementChild;
                if (textDiv) textDiv.textContent = buildSubtitleText(sampled, cfg, role === 'answer-subtitle');
            }
        };

        document.querySelectorAll(`.pub-element[data-dtd-id="${dtdId}"]`).forEach(el => {
            const role = el.getAttribute('data-dot-to-dot') || el.getAttribute('data-dtd-role');
            applyRoleUpdate(el, role);
        });

        if (typeof state !== 'undefined' && Array.isArray(state.pages)) {
            for (let pi = 0; pi < state.pages.length; pi++) {
                if (pi === state.currentPageIndex) continue;
                const pg = state.pages[pi];
                if (!pg || !Array.isArray(pg.elements)) continue;
                for (let ei = 0; ei < pg.elements.length; ei++) {
                    const item = pg.elements[ei];
                    const attrs = item && item.filterAttributes;
                    if (!attrs || attrs['data-dtd-id'] !== dtdId) continue;
                    attrs['data-dtd-state'] = serialized;
                    const role = attrs['data-dot-to-dot'] || attrs['data-dtd-role'];
                    if (role === 'answer-key') {
                        item.innerHTML = solvedRender.svgMarkup;
                        attrs['data-aspect-ratio'] = String(solvedRender.width / solvedRender.height);
                    } else if (role === 'puzzle') {
                        item.innerHTML = puzzleRender.svgMarkup;
                        attrs['data-aspect-ratio'] = String(puzzleRender.width / puzzleRender.height);
                    } else if (role === 'title' || role === 'answer-title') {
                        const titleStr = role === 'answer-title' ? `${rawTitle} - Answer Key` : rawTitle;
                        item.innerHTML = `<div contenteditable="true" spellcheck="false" style="width:100%;height:100%;box-sizing:border-box;padding:4px 8px;outline:none;text-align:center;font-family:${escapeXml(cfg.fontFamily || 'Segoe UI, Arial, sans-serif')};font-size:26px;font-weight:800;color:${escapeXml(normalizeHexColor(cfg.accentColor, '#007670'))};">${escapeXml(titleStr)}</div>`;
                    } else if (role === 'subtitle' || role === 'answer-subtitle') {
                        const subStr = buildSubtitleText(sampled, cfg, role === 'answer-subtitle');
                        item.innerHTML = `<div contenteditable="true" spellcheck="false" style="width:100%;height:100%;box-sizing:border-box;outline:none;text-align:center;font-family:${escapeXml(cfg.fontFamily || 'Segoe UI, Arial, sans-serif')};font-size:12.5px;font-weight:600;color:${escapeXml(normalizeHexColor(cfg.textColor, '#007670'))};opacity:0.86;">${escapeXml(subStr)}</div>`;
                    }
                }
            }
        }
    }

    function insertDotToDotPageObjects(dtdId, sampled, cfg, contour, isAnswerKey) {
        const paperEl = document.getElementById('paper');
        const pw = paperEl ? (parseFloat(paperEl.style.width) || 794) : 794;
        const ph = paperEl ? (parseFloat(paperEl.style.height) || 1123) : 1123;
        const margin = 48;
        const usableW = Math.max(280, pw - margin * 2);
        const accentColor = normalizeHexColor(cfg.accentColor, '#007670');
        const textColor = normalizeHexColor(cfg.textColor, '#007670');
        const fontFamily = cfg.fontFamily || 'Segoe UI, Arial, sans-serif';
        const rawTitle = (cfg.title || 'Connect the Dots').trim() || 'Connect the Dots';
        const headingText = isAnswerKey ? `${rawTitle} - Answer Key` : rawTitle;
        const serialized = serializeDtdState(dtdId, cfg, contour);

        // 1. Title Text Box
        const titleTop = 44;
        const titleH = 46;
        const titleEl = insertTextBoxElement(
            `<div contenteditable="true" spellcheck="false" style="width:100%;height:100%;box-sizing:border-box;padding:4px 8px;outline:none;text-align:center;font-family:${escapeXml(fontFamily)};font-size:26px;font-weight:800;color:${escapeXml(accentColor)};">${escapeXml(headingText)}</div>`,
            margin,
            titleTop,
            usableW,
            titleH
        );
        if (titleEl) {
            titleEl.setAttribute('data-dtd-id', dtdId);
            titleEl.setAttribute('data-dtd-role', isAnswerKey ? 'answer-title' : 'title');
        }

        // 2. Instruction Subtitle
        const subText = buildSubtitleText(sampled, cfg, isAnswerKey);
        const subEl = insertTextBoxElement(
            `<div contenteditable="true" spellcheck="false" style="width:100%;height:100%;box-sizing:border-box;outline:none;text-align:center;font-family:${escapeXml(fontFamily)};font-size:12.5px;font-weight:600;color:${escapeXml(textColor)};opacity:0.86;">${escapeXml(subText)}</div>`,
            margin,
            90,
            usableW,
            26
        );
        if (subEl) {
            subEl.setAttribute('data-dtd-id', dtdId);
            subEl.setAttribute('data-dtd-role', isAnswerKey ? 'answer-subtitle' : 'subtitle');
        }

        // 3. Connect-the-Dots Vector SVG
        const rendered = buildDotToDotSvg(sampled, cfg, isAnswerKey);
        const svgTop = 126;
        const maxH = Math.max(280, ph - svgTop - margin - 20);
        const scale = Math.min(usableW / rendered.width, maxH / rendered.height, 1.45);
        const boxW = Math.round(rendered.width * scale);
        const boxH = Math.round(rendered.height * scale);
        const boxLeft = Math.round((pw - boxW) / 2);

        const svgWrapper = window.createWrapper(rendered.svgMarkup);
        svgWrapper.setAttribute('data-type', 'shape');
        svgWrapper.setAttribute('data-dot-to-dot', isAnswerKey ? 'answer-key' : 'puzzle');
        svgWrapper.setAttribute('data-dtd-id', dtdId);
        svgWrapper.setAttribute('data-dtd-role', isAnswerKey ? 'answer-key' : 'puzzle');
        svgWrapper.setAttribute('data-dtd-state', serialized);
        svgWrapper.setAttribute('data-aspect-lock', 'true');
        svgWrapper.setAttribute('data-aspect-ratio', String(rendered.width / rendered.height));
        svgWrapper.setAttribute('data-element-name', isAnswerKey ? 'Connect-the-Dots (Answer Key)' : 'Connect-the-Dots');
        svgWrapper.style.left = boxLeft + 'px';
        svgWrapper.style.top = svgTop + 'px';
        svgWrapper.style.width = boxW + 'px';
        svgWrapper.style.height = boxH + 'px';

        return svgWrapper;
    }

    function insertDotToDotIntoDocument(sampled, cfg, contour, options) {
        const opts = options || {};
        if (typeof state === 'undefined' || typeof window.createWrapper !== 'function') return;

        // Mode A: Updating an existing Connect-the-Dots puzzle element
        if (opts.editEl && document.contains(opts.editEl)) {
            const editEl = opts.editEl;
            const dtdId = editEl.getAttribute('data-dtd-id') || ('dtd-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 10000));
            editEl.setAttribute('data-dtd-id', dtdId);
            const isAns = editEl.getAttribute('data-dot-to-dot') === 'answer-key';
            const rendered = buildDotToDotSvg(sampled, cfg, isAns);
            const content = editEl.querySelector('.element-content');
            if (content) content.innerHTML = rendered.svgMarkup;
            editEl.setAttribute('data-dtd-state', serializeDtdState(dtdId, cfg, contour));
            editEl.setAttribute('data-aspect-lock', 'true');
            editEl.setAttribute('data-aspect-ratio', String(rendered.width / rendered.height));
            syncLinkedAnswerKeys(dtdId, sampled, cfg, contour);

            if (typeof window.selectElement === 'function') window.selectElement(editEl);
            if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
            if (typeof window.updateSidebar === 'function') window.updateSidebar();
            if (typeof window.pushHistory === 'function') window.pushHistory();
            if (typeof showToast === 'function') showToast('Connect-the-Dots puzzle updated!');
            return;
        }

        const dtdId = 'dtd-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 10000);

        // Mode B: Replace the selected canvas shape directly in-place at its exact bounds
        if (cfg.replaceSelected && cfg.sourceMode === 'canvas' && opts.targetCanvasEl && document.contains(opts.targetCanvasEl)) {
            const target = opts.targetCanvasEl;
            const left = target.style.left || '80px';
            const top = target.style.top || '80px';
            const w = Math.max(140, parseFloat(target.style.width) || target.offsetWidth || 220);
            const h = Math.max(140, parseFloat(target.style.height) || target.offsetHeight || 220);
            const rendered = buildDotToDotSvg(sampled, cfg, false);

            const content = target.querySelector('.element-content');
            if (content) {
                content.innerHTML = rendered.svgMarkup;
                content.style.width = '100%';
                content.style.height = '100%';
            }
            target.setAttribute('data-type', 'shape');
            target.setAttribute('data-dot-to-dot', 'puzzle');
            target.setAttribute('data-dtd-id', dtdId);
            target.setAttribute('data-dtd-role', 'puzzle');
            target.setAttribute('data-dtd-state', serializeDtdState(dtdId, cfg, contour));
            target.setAttribute('data-aspect-lock', 'true');
            target.setAttribute('data-aspect-ratio', String(rendered.width / rendered.height));
            target.setAttribute('data-element-name', 'Connect-the-Dots');
            target.style.left = left;
            target.style.top = top;

            // Keep approximate footprint while honoring the new SVG's natural aspect ratio
            const targetArea = Math.sqrt(w * h);
            const svgRatio = rendered.width / rendered.height;
            const nextW = Math.round(Math.max(150, targetArea * Math.sqrt(svgRatio)));
            const nextH = Math.round(Math.max(150, nextW / svgRatio));
            target.style.width = nextW + 'px';
            target.style.height = nextH + 'px';

            if (typeof window.selectElement === 'function') window.selectElement(target);
            if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
            if (typeof window.updateSidebar === 'function') window.updateSidebar();
            if (typeof window.pushHistory === 'function') window.pushHistory();
            if (typeof showToast === 'function') showToast('Vector shape converted into Connect-the-Dots!');
            return;
        }

        // Mode C: Standard 1-or-2-page Fun Studio insertion (Title + Subtitle + Puzzle + Page 2 Answer Key)
        let res = null;
        if (typeof window.insertTwoPagePuzzleIntoDocument === 'function') {
            res = window.insertTwoPagePuzzleIntoDocument({
                needsAnswerKey: !!cfg.answerKeyOnPage2,
                renderPuzzleOnCurrentPage: () => insertDotToDotPageObjects(dtdId, sampled, cfg, contour, false),
                renderAnswerKeyOnCurrentPage: () => insertDotToDotPageObjects(dtdId, sampled, cfg, contour, true)
            });
        }

        const primaryInDom = document.querySelector(`.pub-element[data-dtd-id="${dtdId}"][data-dot-to-dot="puzzle"]`) || (res && res.primaryEl);
        if (primaryInDom && document.contains(primaryInDom) && typeof window.selectElement === 'function') {
            window.selectElement(primaryInDom);
        }
        if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
        if (typeof window.updateSidebar === 'function') window.updateSidebar();
        if (typeof window.pushHistory === 'function') window.pushHistory();

        if (typeof showToast === 'function') {
            const ansPage = res && res.answerPageNumber;
            showToast(ansPage ? `Connect-the-Dots + Page ${ansPage} Answer Key inserted!` : 'Connect-the-Dots puzzle inserted!');
        }
    }

    function installCanvasDotToDotHandlers() {
        if (window._dotToDotCanvasHandlersInstalled) return;
        window._dotToDotCanvasHandlersInstalled = true;

        // Capture double-clicks on inserted Connect-the-Dots puzzles to reopen Studio in Edit mode
        document.addEventListener('dblclick', function(e) {
            const el = e.target && e.target.closest ? e.target.closest('.pub-element[data-dot-to-dot]') : null;
            if (!el) return;
            e.preventDefault();
            e.stopPropagation();
            if (typeof window.selectElement === 'function') window.selectElement(el);
            showModal({ editEl: el });
        }, true);
    }

    // -------------------------------------------------------------------------
    // Shared Fun Studio Modal Helpers (Dragging, Select Dropdowns, XP Help)
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
        const selects = rootEl.querySelectorAll('select.dtd-select');
        const controllers = [];

        const closeAllMenus = (exceptMenu) => {
            document.querySelectorAll('.dtd-select-menu.open').forEach(menu => {
                if (menu !== exceptMenu) menu.classList.remove('open');
            });
            rootEl.querySelectorAll('.dtd-modern-select.open').forEach(btn => {
                if (!exceptMenu || btn._dtdMenu !== exceptMenu) btn.classList.remove('open');
            });
        };

        selects.forEach(sel => {
            sel.style.display = 'none';
            const wrapper = document.createElement('div');
            wrapper.className = 'dtd-select-wrap';
            sel.parentNode.insertBefore(wrapper, sel);
            wrapper.appendChild(sel);

            const trigger = document.createElement('div');
            trigger.className = 'modern-select dtd-modern-select';
            trigger.setAttribute('tabindex', '0');
            trigger.setAttribute('role', 'combobox');
            trigger.setAttribute('aria-expanded', 'false');

            const labelSpan = document.createElement('span');
            labelSpan.className = 'dtd-select-label';
            const arrowBox = document.createElement('div');
            arrowBox.className = 'arrow-box';
            arrowBox.innerHTML = '<i class="fas fa-chevron-down" style="font-size:10px;"></i>';
            trigger.appendChild(labelSpan);
            trigger.appendChild(arrowBox);
            wrapper.appendChild(trigger);

            const menu = document.createElement('div');
            menu.className = 'dtd-select-menu';
            document.body.appendChild(menu);
            trigger._dtdMenu = menu;

            const syncLabelAndActive = () => {
                const selectedOpt = sel.options[sel.selectedIndex] || sel.options[0];
                labelSpan.textContent = selectedOpt ? selectedOpt.textContent : '';
                if (sel.id === 'dtd-font-family' && selectedOpt) {
                    labelSpan.style.fontFamily = selectedOpt.value;
                } else {
                    labelSpan.style.fontFamily = '';
                }
                menu.querySelectorAll('.dtd-select-option').forEach(optBtn => {
                    optBtn.classList.toggle('active', optBtn.dataset.value === sel.value);
                });
            };

            const rebuildOptions = () => {
                menu.innerHTML = '';
                Array.from(sel.options).forEach(opt => {
                    const item = document.createElement('div');
                    item.className = 'dtd-select-option';
                    item.dataset.value = opt.value;
                    item.textContent = opt.textContent;
                    if (sel.id === 'dtd-font-family') item.style.fontFamily = opt.value;
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
            controllers.push({ sel, trigger, menu, syncLabelAndActive, rebuildOptions });
        });

        const onDocClick = (e) => {
            if (!e.target.closest('.dtd-select-wrap') && !e.target.closest('.dtd-select-menu')) {
                closeAllMenus(null);
            }
        };
        document.addEventListener('mousedown', onDocClick);

        return {
            syncAll: () => controllers.forEach(c => c.syncLabelAndActive()),
            rebuildById: (id) => {
                const ctrl = controllers.find(c => c.sel.id === id);
                if (ctrl) ctrl.rebuildOptions();
            },
            closeAll: () => closeAllMenus(null),
            destroy: () => {
                document.removeEventListener('mousedown', onDocClick);
                controllers.forEach(c => c.menu.remove());
            }
        };
    }

    function openHelpModal(parentOverlay) {
        const existingHelp = document.getElementById('op-dottodot-help-modal');
        if (existingHelp) existingHelp.remove();

        const topics = [
            {
                id: 'overview',
                title: 'Overview & Path Sources',
                body: `
                    <p>The <strong>Connect-the-Dots Path Tool</strong> turns any vector shape, arrow, silhouette, or hand-plotted outline into a crisp, printable numbered dot puzzle.</p>
                    <ul>
                        <li><strong>Canvas Shape / Path:</strong> Automatically detects vector shapes and Smart Arrows on your current page. Select a shape first (or right-click it and choose <em>Convert to Connect-the-Dots...</em>) to sample its exact outline.</li>
                        <li><strong>Built-in Silhouettes:</strong> Pick from 12 ready-to-print outlines including Heart, Star, Butterfly, Rocket Ship, Dinosaur, Cat, House, and Crescent Moon.</li>
                        <li><strong>Custom SVG Path:</strong> Paste any full <code>&lt;svg&gt;</code> snippet or raw path <code>d="..."</code> string to generate instant dot puzzles from external vector art.</li>
                        <li><strong>Click-to-Plot Custom Path:</strong> Click directly inside the live preview stage to plot custom nodes point-by-point.</li>
                    </ul>
                `
            },
            {
                id: 'sequences',
                title: 'Numbering Sequences & Intervals',
                body: `
                    <p>Customize the sequence labels printed beside every node for different age groups or classroom counting lessons:</p>
                    <ul>
                        <li><strong>Count by 1s:</strong> Standard <code>1, 2, 3, ...</code> progression, with an editable starting value if you want multi-part puzzles to continue from a later number.</li>
                        <li><strong>Skip Counting (2s, 5s, 10s):</strong> Practice multiplication and number patterns with <code>2, 4, 6...</code>, <code>5, 10, 15...</code>, or <code>10, 20, 30...</code> intervals.</li>
                        <li><strong>Alphabet (A-Z / a-z):</strong> Sequence dots alphabetically from <code>A</code> to <code>Z</code> (or lowercase <code>a</code> to <code>z</code>) for early literacy activities.</li>
                    </ul>
                `
            },
            {
                id: 'hints',
                title: 'Curved vs. Straight Guide Hints',
                body: `
                    <p>Toggle light dashed guide hints between dots to help younger solvers or clarify rounded curves:</p>
                    <ul>
                        <li><strong>None (Blank):</strong> Classic dot-to-dot with zero hint lines between nodes.</li>
                        <li><strong>Curved Path Hints:</strong> Traces light dashed arcs along the real Bezier curvature of your vector contour between each consecutive dot pair.</li>
                        <li><strong>Straight Line Hints:</strong> Draws clean straight dashed chords from dot to dot.</li>
                        <li><strong>Coverage &amp; Opacity:</strong> Choose <em>All Segments</em>, <em>First 3 Starter Hints</em>, or <em>Alternating</em> segments, and dial hint opacity from subtle watermark grey to bold guide dashes.</li>
                    </ul>
                `
            },
            {
                id: 'placement',
                title: 'Dot Placement, Order & Plotting',
                body: `
                    <p>Control how nodes follow your shape and where the puzzle begins:</p>
                    <ul>
                        <li><strong>Smart Corners + Even:</strong> Detects sharp vertices and corners first so points never round off stars or roofs, then fills remaining dots evenly along curves and long edges.</li>
                        <li><strong>Shift Start / Reverse:</strong> Use the preview toolbar buttons to walk the starting dot (<code>#1</code> or <code>A</code>) around the perimeter or flip clockwise vs. counter-clockwise order.</li>
                        <li><strong>Outward Non-Overlapping Labels:</strong> Numbers automatically offset outward along the shape normal and nudge away from neighboring labels and dots for clean print legibility.</li>
                    </ul>
                `
            },
            {
                id: 'output',
                title: 'Re-Editing & Page 2 Answer Key',
                body: `
                    <p>Your puzzle stays non-destructive and editable even after inserting it into your publication:</p>
                    <ul>
                        <li><strong>Replace In-Place or Insert Page:</strong> When converting a canvas shape, choose whether to replace that shape in-place or insert a formatted puzzle sheet onto a page.</li>
                        <li><strong>Double-Click to Re-Edit:</strong> Double-click any inserted Connect-the-Dots puzzle on the canvas (or right-click -&gt; <em>Edit Connect-the-Dots...</em>) to adjust dot count, interval, or hint lines later.</li>
                        <li><strong>Automatic Page 2 Answer Key:</strong> Generates a matched solution page showing the completed vector contour, automatically kept in sync when you edit the puzzle.</li>
                    </ul>
                `
            }
        ];

        const helpOverlay = document.createElement('div');
        helpOverlay.id = 'op-dottodot-help-modal';
        helpOverlay.className = 'dtd-help-overlay';
        helpOverlay.innerHTML = `
            <style>
                .dtd-help-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.14);
                    z-index: 1000030;
                    display: flex; align-items: center; justify-content: center;
                    padding: 16px; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .dtd-help-box {
                    width: 660px; max-width: 94vw; height: 470px; max-height: 86vh;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #1e293b);
                    border: 1px solid var(--ui-border, #94a3b8); border-radius: 8px;
                    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.28);
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .dtd-help-header {
                    padding: 6px 8px 6px 14px;
                    background: linear-gradient(135deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #004a46));
                    color: #ffffff; display: flex; align-items: center; justify-content: space-between;
                    user-select: none; min-height: 44px; box-sizing: border-box;
                }
                .dtd-help-toolbar {
                    display: flex; align-items: center; justify-content: space-between; gap: 8px;
                    padding: 6px 12px; background: var(--ui-surface-bg, #f1f4f6);
                    border-bottom: 1px solid var(--ui-border, #cbd5e1); font-size: 12px;
                }
                body.dark-mode .dtd-help-toolbar { background: #1e293b; border-color: #334155; }
                .dtd-help-nav-btns { display: flex; align-items: center; gap: 4px; }
                .dtd-xp-tool-btn {
                    display: inline-flex; align-items: center; gap: 5px;
                    padding: 4px 10px; font-size: 11.5px; font-weight: 600;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-theme-dark, #004a46);
                    border: 1px solid var(--ui-border, #cbd5e1); border-radius: 4px; cursor: pointer;
                }
                body.dark-mode .dtd-xp-tool-btn { background: #0f172a; color: #e2e8f0; border-color: #475569; }
                .dtd-xp-tool-btn:hover:not(:disabled) { border-color: var(--ui-theme-color, #007670); background: rgba(0, 118, 112, 0.08); }
                .dtd-xp-tool-btn:disabled { opacity: 0.45; cursor: default; }
                .dtd-help-split {
                    flex: 1; display: grid; grid-template-columns: 210px 1fr; min-height: 0;
                }
                .dtd-help-toc {
                    background: var(--ui-surface-bg, #f8fafc); border-right: 1px solid var(--ui-border, #cbd5e1);
                    padding: 10px 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 3px;
                }
                body.dark-mode .dtd-help-toc { background: #0f172a; border-right-color: #334155; }
                .dtd-help-toc-head {
                    font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
                    color: var(--ui-theme-color, #007670); padding: 2px 6px 6px;
                }
                .dtd-help-topic-btn {
                    width: 100%; text-align: left; border: 1px solid transparent; background: transparent;
                    color: var(--ui-text, #1e293b); padding: 7px 9px; border-radius: 4px;
                    font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 7px;
                }
                .dtd-help-topic-btn i { color: var(--ui-theme-color, #007670); font-size: 11px; }
                .dtd-help-topic-btn:hover { background: rgba(0, 118, 112, 0.08); }
                .dtd-help-topic-btn.active { background: var(--ui-theme-color, #007670); color: #ffffff; font-weight: 700; }
                .dtd-help-topic-btn.active i { color: #ffffff; }
                body.dark-mode .dtd-help-topic-btn { color: #e2e8f0; }
                .dtd-help-pane { padding: 16px 20px; overflow-y: auto; font-size: 13px; line-height: 1.55; }
                .dtd-help-pane h4 {
                    margin: 0 0 10px; font-size: 16px; color: var(--ui-theme-color, #007670);
                    border-bottom: 1px solid var(--ui-border, #e2e8f0); padding-bottom: 6px;
                }
                .dtd-help-pane ul { margin: 8px 0 0; padding-left: 18px; }
                .dtd-help-pane li { margin-bottom: 7px; }
                .dtd-help-pane code {
                    padding: 1px 5px; border-radius: 3px; font-size: 11.5px;
                    background: rgba(0, 118, 112, 0.1); color: var(--ui-theme-dark, #004a46);
                }
                body.dark-mode .dtd-help-pane code { background: rgba(45, 212, 191, 0.15); color: #5eead4; }
                .dtd-help-footer {
                    padding: 9px 14px; border-top: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-surface-bg, #f8fafc); display: flex; justify-content: flex-end;
                }
                body.dark-mode .dtd-help-footer { background: #1e293b; border-top-color: #334155; }
                .dtd-help-ok {
                    padding: 6px 18px; border-radius: 5px; border: none; font-weight: 700; font-size: 12.5px;
                    background: var(--ui-theme-color, #007670); color: #ffffff; cursor: pointer;
                }
                .dtd-help-ok:hover { background: var(--ui-theme-dark, #004a46); }
                @media (max-width: 560px) {
                    .dtd-help-split { grid-template-columns: 1fr; }
                    .dtd-help-toc { max-height: 130px; border-right: none; border-bottom: 1px solid var(--ui-border, #cbd5e1); }
                }
            </style>
            <div class="dtd-help-box" id="dtd-help-box" role="dialog" aria-modal="true" aria-labelledby="dtd-help-title">
                <div class="dtd-help-header" id="dtd-help-header">
                    <span id="dtd-help-title" style="display:flex; align-items:center; gap:8px; font-weight:700; font-size:13.5px;">
                        <i class="fas fa-book-open"></i> Connect-the-Dots Help
                    </span>
                    <button type="button" class="custom-dialog-close" id="dtd-help-close-x" aria-label="Close Help">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="dtd-help-toolbar">
                    <div class="dtd-help-nav-btns">
                        <button type="button" class="dtd-xp-tool-btn" id="dtd-help-back-btn" disabled><i class="fas fa-arrow-left"></i> Back</button>
                        <button type="button" class="dtd-xp-tool-btn" id="dtd-help-fwd-btn" disabled>Forward <i class="fas fa-arrow-right"></i></button>
                    </div>
                    <span id="dtd-help-breadcrumb" style="font-weight:600; opacity:0.8;">Overview &amp; Path Sources</span>
                </div>
                <div class="dtd-help-split">
                    <div class="dtd-help-toc">
                        <div class="dtd-help-toc-head">Contents</div>
                        ${topics.map((t, i) => `
                            <button type="button" class="dtd-help-topic-btn${i === 0 ? ' active' : ''}" data-topic-id="${t.id}">
                                <i class="fas fa-file-alt"></i><span>${escapeXml(t.title)}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="dtd-help-pane" id="dtd-help-content"></div>
                </div>
                <div class="dtd-help-footer">
                    <button type="button" class="dtd-help-ok" id="dtd-help-ok-btn">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(helpOverlay);
        const helpBox = helpOverlay.querySelector('#dtd-help-box');
        const helpHeader = helpOverlay.querySelector('#dtd-help-header');
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
            helpOverlay.querySelectorAll('.dtd-help-topic-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.topicId === topic.id);
            });
            helpOverlay.querySelector('#dtd-help-breadcrumb').textContent = topic.title;
            helpOverlay.querySelector('#dtd-help-content').innerHTML = `<h4>${escapeXml(topic.title)}</h4>${topic.body}`;
            helpOverlay.querySelector('#dtd-help-back-btn').disabled = histIdx <= 0;
            helpOverlay.querySelector('#dtd-help-fwd-btn').disabled = histIdx >= history.length - 1;
        };

        helpOverlay.querySelectorAll('.dtd-help-topic-btn').forEach(btn => {
            btn.addEventListener('click', () => renderTopic(btn.dataset.topicId, true));
        });
        helpOverlay.querySelector('#dtd-help-back-btn').addEventListener('click', () => {
            if (histIdx > 0) {
                histIdx--;
                renderTopic(history[histIdx], false);
            }
        });
        helpOverlay.querySelector('#dtd-help-fwd-btn').addEventListener('click', () => {
            if (histIdx < history.length - 1) {
                histIdx++;
                renderTopic(history[histIdx], false);
            }
        });

        const closeHelp = () => {
            teardownDrag();
            helpOverlay.remove();
        };
        helpOverlay.querySelector('#dtd-help-close-x').addEventListener('click', closeHelp);
        helpOverlay.querySelector('#dtd-help-ok-btn').addEventListener('click', closeHelp);
        helpOverlay.addEventListener('mousedown', (e) => {
            if (e.target === helpOverlay && typeof window.triggerModalPulse === 'function') {
                window.triggerModalPulse(helpBox);
            }
        });

        renderTopic(topics[0].id, false);
        if (parentOverlay && !document.body.contains(parentOverlay)) closeHelp();
    }

    // -------------------------------------------------------------------------
    // Main Connect-the-Dots Studio Modal
    // -------------------------------------------------------------------------

    function showModal(options) {
        const opts = options || {};
        const existing = document.getElementById('op-dottodot-modal');
        if (existing) existing.remove();
        const existingHelp = document.getElementById('op-dottodot-help-modal');
        if (existingHelp) existingHelp.remove();

        const editEl = (opts.editEl && document.contains(opts.editEl)) ? opts.editEl : null;
        let savedData = null;
        if (editEl) {
            try {
                savedData = JSON.parse(editEl.getAttribute('data-dtd-state') || 'null');
            } catch (e) {
                savedData = null;
            }
        }

        const initialThemeColor = resolveThemeColor();
        const candidates = collectCanvasVectorCandidates();
        const selectedCandidate = candidates.find(c => c.isSelected) || candidates[0] || null;
        const preferCanvas = !editEl && ((opts.useSelected && candidates.length > 0) || (selectedCandidate && selectedCandidate.isSelected));

        const modalState = {
            title: (savedData && savedData.title) || 'Connect the Dots',
            sourceMode: (savedData && savedData.sourceMode) || (preferCanvas ? 'canvas' : 'preset'),
            presetKey: (savedData && savedData.presetKey) || 'heart',
            canvasIdx: selectedCandidate ? 0 : -1,
            customSvg: (savedData && savedData.customSvg) || 'M 50 12 L 62 38 L 90 42 L 70 62 L 75 90 L 50 76 L 25 90 L 30 62 L 10 42 L 38 38 Z',
            plotPoints: (savedData && Array.isArray(savedData.plotPoints) && savedData.plotPoints.length >= 2)
                ? savedData.plotPoints
                : [
                    { x: 250, y: 78 }, { x: 356, y: 152 }, { x: 398, y: 266 }, { x: 332, y: 374 },
                    { x: 250, y: 422 }, { x: 168, y: 374 }, { x: 102, y: 266 }, { x: 144, y: 152 }
                ],
            dotCount: (savedData && savedData.dotCount) || 22,
            placementMode: (savedData && savedData.placementMode) || 'smart',
            sequenceMode: (savedData && savedData.sequenceMode) || '1s',
            startValue: (savedData && savedData.startValue != null) ? savedData.startValue : 1,
            hintStyle: (savedData && savedData.hintStyle) || 'curved',
            hintCoverage: (savedData && savedData.hintCoverage) || 'all',
            hintOpacity: (savedData && savedData.hintOpacity != null) ? savedData.hintOpacity : 0.20,
            isClosed: (savedData && savedData.isClosed != null) ? !!savedData.isClosed : true,
            startShift: (savedData && savedData.startShift) || 0,
            reverseDirection: !!(savedData && savedData.reverseDirection),
            showStartMarker: (savedData && savedData.showStartMarker != null) ? !!savedData.showStartMarker : true,
            includeInnerDetails: (savedData && savedData.includeInnerDetails != null) ? !!savedData.includeInnerDetails : true,
            dotRadius: (savedData && savedData.dotRadius) || 4.2,
            labelFontSize: (savedData && savedData.labelFontSize) || 12,
            fontFamily: (savedData && savedData.fontFamily) || 'Segoe UI, Arial, sans-serif',
            accentColor: (savedData && savedData.accentColor) || initialThemeColor,
            dotColor: (savedData && savedData.dotColor) || '#0f172a',
            textColor: (savedData && savedData.textColor) || initialThemeColor,
            hintColor: (savedData && savedData.hintColor) || '#0d9488',
            solvedColor: (savedData && savedData.solvedColor) || initialThemeColor,
            bgColor: (savedData && savedData.bgColor) || '#ffffff',
            borderColor: (savedData && savedData.borderColor) || '#cbd5e1',
            replaceSelected: false,
            answerKeyOnPage2: (savedData && savedData.answerKeyOnPage2 != null) ? !!savedData.answerKeyOnPage2 : true,
            previewMode: 'puzzle',
            savedContour: (savedData && savedData.savedContour) || null
        };

        const overlay = document.createElement('div');
        overlay.id = 'op-dottodot-modal';
        overlay.className = 'dtd-modal-overlay';

        const presetShapeOptionsHtml = Object.keys(PRESET_SHAPES).map(key => {
            const p = PRESET_SHAPES[key];
            return `<option value="${key}"${key === modalState.presetKey ? ' selected' : ''}>${escapeXml(p.label)}</option>`;
        }).join('');

        const canvasOptionsHtml = candidates.length > 0
            ? candidates.map((c, idx) => `<option value="${idx}"${idx === 0 ? ' selected' : ''}>${escapeXml(c.label)}</option>`).join('')
            : '<option value="-1">No vector shapes found on current page</option>';

        const colorPresetsHtml = Object.keys(COLOR_PRESETS).map(key => {
            const p = COLOR_PRESETS[key];
            return `<button type="button" class="dtd-preset-btn" data-color-preset="${key}" title="${escapeXml(p.label)}">
                <span class="dtd-preset-swatch" style="background:linear-gradient(135deg, ${p.accent} 50%, ${p.bg} 50%);"></span>
                <span>${escapeXml(p.label)}</span>
            </button>`;
        }).join('');

        overlay.innerHTML = `
            <style>
                .dtd-modal-overlay {
                    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.14);
                    z-index: 1000010;
                    display: flex; align-items: center; justify-content: center;
                    padding: 14px; box-sizing: border-box;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .dtd-modal-box {
                    width: 960px; max-width: 96vw; max-height: 92vh;
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #1e293b);
                    border-radius: 10px; box-shadow: 0 20px 55px rgba(0, 0, 0, 0.34);
                    border: 1px solid var(--ui-border, #cbd5e1);
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .dtd-modal-header {
                    padding: 10px 14px 10px 20px;
                    background: linear-gradient(135deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #004a46));
                    color: #ffffff; display: flex; align-items: center; justify-content: space-between;
                    user-select: none; min-height: 46px; box-sizing: border-box;
                }
                .dtd-header-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
                .dtd-header-actions .custom-dialog-close {
                    width: 34px; height: 34px; font-size: 17px; border-radius: 8px;
                }
                .dtd-help-icon-btn:hover,
                body.dark-mode .dtd-help-icon-btn:hover {
                    background: rgba(255, 255, 255, 0.25) !important;
                }
                .dtd-modal-body {
                    display: grid; grid-template-columns: 356px 1fr; flex: 1; min-height: 0; overflow: hidden;
                }
                .dtd-controls-pane {
                    padding: 14px 16px; border-right: 1px solid var(--ui-border, #e2e8f0);
                    overflow-y: auto; display: flex; flex-direction: column; gap: 11px;
                    background: var(--ui-surface-bg, #f8fafc);
                }
                body.dark-mode .dtd-controls-pane { background: #0f172a; border-right-color: #334155; }
                .dtd-field-label {
                    display: flex; align-items: center; justify-content: space-between;
                    font-size: 11px; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 0.45px; color: var(--ui-theme-dark, #0f766e); margin-bottom: 4px;
                }
                body.dark-mode .dtd-field-label { color: #5eead4; }
                .dtd-input, .dtd-textarea {
                    width: 100%; box-sizing: border-box; border-radius: 6px;
                    border: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #0f172a);
                    padding: 6px 9px; font-size: 12.5px; font-family: inherit; outline: none;
                }
                body.dark-mode .dtd-input, body.dark-mode .dtd-textarea { background: #1e293b; color: #f8fafc; border-color: #475569; }
                .dtd-input:focus, .dtd-textarea:focus {
                    border-color: var(--ui-theme-color, #007670); box-shadow: 0 0 0 2px rgba(0, 118, 112, 0.16);
                }
                .dtd-input:disabled { opacity: 0.52; cursor: not-allowed; }
                .dtd-textarea { min-height: 62px; resize: vertical; font-family: monospace; font-size: 11.5px; line-height: 1.35; }
                .dtd-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .dtd-row-src { display: grid; grid-template-columns: 1fr 76px; gap: 8px; align-items: end; }
                .dtd-select-wrap { position: relative; width: 100%; }
                .dtd-modern-select {
                    width: 100%; min-width: 0; height: 31px; padding: 0 0 0 9px;
                    border-radius: 6px; font-size: 12px; justify-content: space-between;
                    border: 1px solid var(--ui-border, #cbd5e1); background: var(--ui-panel-bg, #ffffff);
                    color: var(--ui-text, #0f172a);
                }
                body.dark-mode .dtd-modern-select { background: #1e293b; color: #f1f5f9; border-color: #475569; }
                .dtd-modern-select span { color: var(--ui-text, #0f172a) !important; padding-left: 0; }
                body.dark-mode .dtd-modern-select span { color: #f1f5f9 !important; filter: none !important; }
                .dtd-select-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
                .dtd-modern-select .arrow-box {
                    height: 100%; width: 28px; display: flex; align-items: center; justify-content: center;
                    background: var(--ui-theme-color, #007670); color: #ffffff;
                    border-top-right-radius: 5px; border-bottom-right-radius: 5px; flex-shrink: 0;
                }
                .dtd-select-menu {
                    position: fixed; z-index: 1000060; display: none; flex-direction: column;
                    background: var(--ui-panel-bg, #ffffff); border: 1px solid var(--ui-border, #cbd5e1);
                    border-radius: 7px; box-shadow: 0 10px 26px rgba(0, 0, 0, 0.22);
                    padding: 4px; max-height: 240px; overflow-y: auto; box-sizing: border-box;
                }
                body.dark-mode .dtd-select-menu { background: #1e293b; border-color: #475569; }
                .dtd-select-menu.open { display: flex; }
                .dtd-select-option {
                    padding: 6px 10px; font-size: 12px; border-radius: 5px; cursor: pointer;
                    color: var(--ui-text, #1e293b); white-space: nowrap;
                }
                body.dark-mode .dtd-select-option { color: #f8fafc; }
                .dtd-select-option:hover { background: rgba(0, 118, 112, 0.12); }
                .dtd-select-option.active { background: var(--ui-theme-color, #007670); color: #ffffff; font-weight: 700; }

                .dtd-seg-group {
                    display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;
                }
                .dtd-seg-btn {
                    padding: 6px 8px; border-radius: 6px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-panel-bg, #ffffff); color: var(--ui-text, #334155);
                    font-size: 11.5px; font-weight: 600; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 5px;
                }
                body.dark-mode .dtd-seg-btn { background: #1e293b; color: #cbd5e1; border-color: #475569; }
                .dtd-seg-btn.active {
                    background: var(--ui-theme-color, #007670); border-color: var(--ui-theme-color, #007670);
                    color: #ffffff; font-weight: 700;
                }
                .dtd-range {
                    width: 100%; accent-color: var(--ui-theme-color, #007670); cursor: pointer;
                }
                .dtd-hint-note {
                    font-size: 11.5px; padding: 7px 9px; border-radius: 6px;
                    background: rgba(0, 118, 112, 0.08); border: 1px solid rgba(0, 118, 112, 0.22);
                    color: var(--ui-text, #1e293b); line-height: 1.4;
                }
                body.dark-mode .dtd-hint-note { background: rgba(45, 212, 191, 0.12); border-color: rgba(45, 212, 191, 0.28); color: #e2e8f0; }

                .dtd-color-section {
                    border: 1px solid var(--ui-border, #e2e8f0); border-radius: 8px;
                    padding: 9px 10px; background: var(--ui-panel-bg, #ffffff); display: flex; flex-direction: column; gap: 7px;
                }
                body.dark-mode .dtd-color-section { background: #1e293b; border-color: #334155; }
                .dtd-color-presets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
                .dtd-preset-btn {
                    display: flex; align-items: center; gap: 5px; padding: 4px 6px;
                    font-size: 10.5px; font-weight: 600; border-radius: 5px;
                    border: 1px solid var(--ui-border, #cbd5e1); background: var(--ui-surface-bg, #f8fafc);
                    color: var(--ui-text, #1e293b); cursor: pointer; text-align: left;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                body.dark-mode .dtd-preset-btn { background: #0f172a; color: #e2e8f0; border-color: #475569; }
                .dtd-preset-btn:hover { border-color: var(--ui-theme-color, #007670); }
                .dtd-preset-swatch { width: 13px; height: 13px; border-radius: 3px; border: 1px solid rgba(0, 0, 0, 0.2); flex-shrink: 0; }
                .dtd-color-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
                .dtd-color-chip {
                    display: flex; align-items: center; justify-content: space-between; gap: 4px;
                    padding: 4px 7px; border-radius: 5px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-surface-bg, #f8fafc); color: var(--ui-text, #1e293b);
                    font-size: 11px; font-weight: 600; cursor: pointer;
                }
                body.dark-mode .dtd-color-chip { background: #0f172a; color: #e2e8f0; border-color: #475569; }
                .dtd-color-chip:hover { border-color: var(--ui-theme-color, #007670); }
                .dtd-swatch-box { width: 16px; height: 16px; border-radius: 4px; border: 1px solid rgba(0, 0, 0, 0.25); flex-shrink: 0; }

                .dtd-check-label {
                    display: flex; align-items: center; gap: 7px; font-size: 12px; cursor: pointer;
                    color: var(--ui-text, #1e293b); user-select: none;
                }
                .dtd-check-label input { accent-color: var(--ui-theme-color, #007670); cursor: pointer; }
                body.dark-mode .dtd-check-label { color: #e2e8f0; }

                .dtd-preview-pane {
                    display: flex; flex-direction: column; min-height: 0; background: var(--ui-panel-bg, #ffffff);
                }
                body.dark-mode .dtd-preview-pane { background: #111827; }
                .dtd-preview-toolbar {
                    display: flex; align-items: center; justify-content: space-between; gap: 8px;
                    padding: 9px 14px; border-bottom: 1px solid var(--ui-border, #e2e8f0); flex-wrap: wrap;
                }
                body.dark-mode .dtd-preview-toolbar { border-bottom-color: #334155; }
                .dtd-preview-tabs { display: flex; gap: 6px; }
                .dtd-ptab {
                    padding: 5px 12px; border-radius: 6px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: transparent; color: var(--ui-text, #334155); font-size: 12px; font-weight: 600; cursor: pointer;
                }
                body.dark-mode .dtd-ptab { color: #cbd5e1; border-color: #475569; }
                .dtd-ptab.active {
                    background: var(--ui-theme-color, #007670); border-color: var(--ui-theme-color, #007670); color: #ffffff;
                }
                .dtd-mini-btn {
                    padding: 5px 10px; border-radius: 6px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: var(--ui-surface-bg, #f8fafc); color: var(--ui-text, #1e293b);
                    font-size: 11.5px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
                }
                body.dark-mode .dtd-mini-btn { background: #1e293b; color: #f8fafc; border-color: #475569; }
                .dtd-mini-btn:hover { border-color: var(--ui-theme-color, #007670); color: var(--ui-theme-color, #007670); }

                .dtd-preview-canvas {
                    flex: 1; display: flex; align-items: center; justify-content: center;
                    min-height: 0; overflow: hidden; padding: 14px 16px;
                    background: var(--ui-surface-bg, #f8fafc);
                }
                body.dark-mode .dtd-preview-canvas { background: #0f172a; }
                .dtd-preview-stage {
                    width: 100%; height: 100%; max-width: 500px; max-height: 455px;
                    display: flex; align-items: center; justify-content: center;
                    box-sizing: border-box;
                }
                .dtd-preview-stage.plot-active svg { cursor: crosshair; }
                .dtd-status-bar {
                    padding: 7px 14px; border-top: 1px solid var(--ui-border, #e2e8f0);
                    font-size: 11.5px; display: flex; align-items: center; justify-content: space-between;
                    background: var(--ui-surface-bg, #f8fafc);
                }
                body.dark-mode .dtd-status-bar { background: #0f172a; border-top-color: #334155; }
                .dtd-modal-footer {
                    padding: 10px 16px; border-top: 1px solid var(--ui-border, #e2e8f0);
                    display: flex; align-items: center; justify-content: space-between; gap: 10px;
                    background: var(--ui-panel-bg, #ffffff);
                }
                body.dark-mode .dtd-modal-footer { background: #111827; border-top-color: #334155; }
                .dtd-btn-secondary {
                    padding: 7px 15px; border-radius: 6px; border: 1px solid var(--ui-border, #cbd5e1);
                    background: transparent; color: var(--ui-text, #1e293b); font-size: 12.5px; font-weight: 600; cursor: pointer;
                }
                body.dark-mode .dtd-btn-secondary { color: #e2e8f0; border-color: #475569; }
                .dtd-btn-primary {
                    padding: 7px 18px; border-radius: 6px; border: none;
                    background: var(--ui-theme-color, #007670); color: #ffffff;
                    font-size: 12.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 7px;
                }
                .dtd-btn-primary:hover { background: var(--ui-theme-dark, #004a46); }
                @media (max-width: 820px) {
                    .dtd-modal-body { grid-template-columns: 1fr; }
                    .dtd-controls-pane { max-height: 290px; border-right: none; border-bottom: 1px solid var(--ui-border, #e2e8f0); }
                }
            </style>
            <div class="dtd-modal-box" id="dtd-modal-box" role="dialog" aria-modal="true" aria-labelledby="dtd-modal-title">
                <div class="dtd-modal-header" id="dtd-modal-header" title="Drag to move">
                    <div id="dtd-modal-title" style="display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-circle-nodes" style="font-size:17px;"></i>
                        <div>
                            <div style="font-size:15px; font-weight:700;">Connect-the-Dots Path Tool</div>
                            <div style="font-size:11px; opacity:0.88;">Convert any vector path or shape outline into numbered nodes with guide hints &amp; Answer Key</div>
                        </div>
                    </div>
                    <div class="dtd-header-actions">
                        <button type="button" class="custom-dialog-close dtd-help-icon-btn" id="dtd-help-btn" title="Connect-the-Dots Help" aria-label="Connect-the-Dots Help">
                            <i class="fas fa-question"></i>
                        </button>
                        <button type="button" class="custom-dialog-close" id="dtd-close-x" title="Close" aria-label="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div class="dtd-modal-body">
                    <div class="dtd-controls-pane">
                        <div>
                            <label class="dtd-field-label" for="dtd-title">Puzzle Title</label>
                            <input type="text" id="dtd-title" class="dtd-input" value="${escapeXml(modalState.title)}">
                        </div>

                        <div>
                            <label class="dtd-field-label" for="dtd-source-mode">Vector Path Source</label>
                            <select id="dtd-source-mode" class="dtd-select">
                                <option value="canvas"${modalState.sourceMode === 'canvas' ? ' selected' : ''}>Canvas Vector Shape / Path</option>
                                <option value="preset"${modalState.sourceMode === 'preset' ? ' selected' : ''}>Built-in Silhouette Library</option>
                                <option value="svg"${modalState.sourceMode === 'svg' ? ' selected' : ''}>Custom SVG Path (d="...")</option>
                                <option value="plot"${modalState.sourceMode === 'plot' ? ' selected' : ''}>Click-to-Plot Custom Path</option>
                            </select>
                        </div>

                        <div id="dtd-panel-canvas" style="${modalState.sourceMode === 'canvas' ? '' : 'display:none;'}">
                            <label class="dtd-field-label" for="dtd-canvas-target">
                                <span>Target Canvas Object</span>
                                <span style="font-size:10px; opacity:0.75;">${candidates.length} detected</span>
                            </label>
                            <select id="dtd-canvas-target" class="dtd-select">${canvasOptionsHtml}</select>
                        </div>

                        <div id="dtd-panel-preset" style="${modalState.sourceMode === 'preset' ? '' : 'display:none;'}">
                            <label class="dtd-field-label" for="dtd-preset-shape">Silhouette Preset</label>
                            <select id="dtd-preset-shape" class="dtd-select">${presetShapeOptionsHtml}</select>
                        </div>

                        <div id="dtd-panel-svg" style="${modalState.sourceMode === 'svg' ? '' : 'display:none;'}">
                            <label class="dtd-field-label" for="dtd-svg-input">Paste SVG Markup or Path Data</label>
                            <textarea id="dtd-svg-input" class="dtd-textarea" placeholder="Paste <svg>...</svg> or M 50 10 L 90 90 ...">${escapeXml(modalState.customSvg)}</textarea>
                        </div>

                        <div id="dtd-panel-plot" class="dtd-hint-note" style="${modalState.sourceMode === 'plot' ? '' : 'display:none;'}">
                            Click anywhere inside the preview frame on the right to place nodes in sequence. Use <strong>Undo Pt</strong> or <strong>Clear</strong> above the preview to adjust.
                        </div>

                        <div class="dtd-row-src">
                            <div>
                                <label class="dtd-field-label" for="dtd-sequence-mode">Numbering Interval</label>
                                <select id="dtd-sequence-mode" class="dtd-select">
                                    <option value="1s"${modalState.sequenceMode === '1s' ? ' selected' : ''}>Count by 1s (1, 2, 3...)</option>
                                    <option value="2s"${modalState.sequenceMode === '2s' ? ' selected' : ''}>Count by 2s (2, 4, 6...)</option>
                                    <option value="5s"${modalState.sequenceMode === '5s' ? ' selected' : ''}>Count by 5s (5, 10, 15...)</option>
                                    <option value="10s"${modalState.sequenceMode === '10s' ? ' selected' : ''}>Count by 10s (10, 20...)</option>
                                    <option value="alpha-upper"${modalState.sequenceMode === 'alpha-upper' ? ' selected' : ''}>Alphabet (A - Z)</option>
                                    <option value="alpha-lower"${modalState.sequenceMode === 'alpha-lower' ? ' selected' : ''}>Alphabet (a - z)</option>
                                </select>
                            </div>
                            <div>
                                <label class="dtd-field-label" for="dtd-start-value">Start #</label>
                                <input type="number" id="dtd-start-value" class="dtd-input" value="${escapeXml(modalState.startValue)}" min="0" max="999">
                            </div>
                        </div>

                        <div>
                            <label class="dtd-field-label">Guide Hints Between Dots</label>
                            <div class="dtd-seg-group" id="dtd-hint-style-group">
                                <button type="button" class="dtd-seg-btn${modalState.hintStyle === 'none' ? ' active' : ''}" data-hint-style="none">None</button>
                                <button type="button" class="dtd-seg-btn${modalState.hintStyle === 'curved' ? ' active' : ''}" data-hint-style="curved"><i class="fas fa-bezier-curve" style="font-size:10px;"></i>Curved</button>
                                <button type="button" class="dtd-seg-btn${modalState.hintStyle === 'straight' ? ' active' : ''}" data-hint-style="straight"><i class="fas fa-slash" style="font-size:10px;"></i>Straight</button>
                            </div>
                        </div>

                        <div class="dtd-row-2" id="dtd-hint-options-row" style="${modalState.hintStyle === 'none' ? 'display:none;' : ''}">
                            <div>
                                <label class="dtd-field-label" for="dtd-hint-coverage">Hint Coverage</label>
                                <select id="dtd-hint-coverage" class="dtd-select">
                                    <option value="all"${modalState.hintCoverage === 'all' ? ' selected' : ''}>All Segments</option>
                                    <option value="starter"${modalState.hintCoverage === 'starter' ? ' selected' : ''}>First 3 Starter</option>
                                    <option value="alternating"${modalState.hintCoverage === 'alternating' ? ' selected' : ''}>Alternating</option>
                                </select>
                            </div>
                            <div>
                                <label class="dtd-field-label" for="dtd-hint-opacity">
                                    <span>Hint Opacity</span>
                                    <span id="dtd-hint-opacity-val">${Math.round(modalState.hintOpacity * 100)}%</span>
                                </label>
                                <input type="range" id="dtd-hint-opacity" class="dtd-range" min="0" max="75" step="1" value="${Math.round(modalState.hintOpacity * 100)}">
                            </div>
                        </div>

                        <div id="dtd-dot-count-wrap" style="${modalState.sourceMode === 'plot' ? 'display:none;' : ''}">
                            <label class="dtd-field-label" for="dtd-dot-count">
                                <span>Number of Nodes (Dots)</span>
                                <span id="dtd-dot-count-val">${modalState.dotCount}</span>
                            </label>
                            <input type="range" id="dtd-dot-count" class="dtd-range" min="6" max="80" step="1" value="${modalState.dotCount}">
                        </div>

                        <div class="dtd-row-2">
                            <div>
                                <label class="dtd-field-label" for="dtd-placement-mode">Node Sampling</label>
                                <select id="dtd-placement-mode" class="dtd-select">
                                    <option value="smart"${modalState.placementMode === 'smart' ? ' selected' : ''}>Smart Corners</option>
                                    <option value="uniform"${modalState.placementMode === 'uniform' ? ' selected' : ''}>Uniform Spacing</option>
                                </select>
                            </div>
                            <div>
                                <label class="dtd-field-label" for="dtd-dot-size">Dot &amp; Label Size</label>
                                <select id="dtd-dot-size" class="dtd-select">
                                    <option value="small">Compact</option>
                                    <option value="medium" selected>Standard</option>
                                    <option value="large">Large (Kids)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="dtd-field-label" for="dtd-font-family">Label Font</label>
                            <select id="dtd-font-family" class="dtd-select">
                                <option value="Segoe UI, Arial, sans-serif">Segoe UI (Clean)</option>
                                <option value="Arial, sans-serif">Arial (Bold)</option>
                                <option value="'Comic Sans MS', 'Trebuchet MS', sans-serif">Comic Sans (Kids)</option>
                                <option value="Georgia, serif">Georgia (Classic Serif)</option>
                                <option value="Courier New, monospace">Courier New (Mono)</option>
                            </select>
                        </div>

                        <div class="dtd-color-section">
                            <div style="display:flex; align-items:center; justify-content:space-between;">
                                <label class="dtd-field-label" style="margin:0;">Colors &amp; Palette</label>
                                <span style="font-size:10.5px; opacity:0.7;">Presets or custom swatches</span>
                            </div>
                            <div class="dtd-color-presets" id="dtd-color-presets">${colorPresetsHtml}</div>
                            <div class="dtd-color-grid">
                                <button type="button" class="dtd-color-chip" data-color-target="dtd-accent-color" title="Title &amp; start marker highlight">
                                    <span>Accent</span>
                                    <span class="dtd-swatch-box" data-swatch-for="dtd-accent-color" style="background:${escapeXml(modalState.accentColor)};"></span>
                                    <input type="hidden" id="dtd-accent-color" value="${escapeXml(modalState.accentColor)}">
                                </button>
                                <button type="button" class="dtd-color-chip" data-color-target="dtd-dot-color" title="Node circle dots">
                                    <span>Dots</span>
                                    <span class="dtd-swatch-box" data-swatch-for="dtd-dot-color" style="background:${escapeXml(modalState.dotColor)};"></span>
                                    <input type="hidden" id="dtd-dot-color" value="${escapeXml(modalState.dotColor)}">
                                </button>
                                <button type="button" class="dtd-color-chip" data-color-target="dtd-text-color" title="Number and letter labels">
                                    <span>Numbers</span>
                                    <span class="dtd-swatch-box" data-swatch-for="dtd-text-color" style="background:${escapeXml(modalState.textColor)};"></span>
                                    <input type="hidden" id="dtd-text-color" value="${escapeXml(modalState.textColor)}">
                                </button>
                                <button type="button" class="dtd-color-chip" data-color-target="dtd-hint-color" title="Dashed guide hint path color">
                                    <span>Hints</span>
                                    <span class="dtd-swatch-box" data-swatch-for="dtd-hint-color" style="background:${escapeXml(modalState.hintColor)};"></span>
                                    <input type="hidden" id="dtd-hint-color" value="${escapeXml(modalState.hintColor)}">
                                </button>
                                <button type="button" class="dtd-color-chip" data-color-target="dtd-solved-color" title="Solved Answer Key contour">
                                    <span>Solved</span>
                                    <span class="dtd-swatch-box" data-swatch-for="dtd-solved-color" style="background:${escapeXml(modalState.solvedColor)};"></span>
                                    <input type="hidden" id="dtd-solved-color" value="${escapeXml(modalState.solvedColor)}">
                                </button>
                                <button type="button" class="dtd-color-chip" data-color-target="dtd-bg-color" title="Puzzle card fill">
                                    <span>Card Fill</span>
                                    <span class="dtd-swatch-box" data-swatch-for="dtd-bg-color" style="background:${escapeXml(modalState.bgColor)};"></span>
                                    <input type="hidden" id="dtd-bg-color" value="${escapeXml(modalState.bgColor)}">
                                </button>
                                <input type="hidden" id="dtd-border-color" value="${escapeXml(modalState.borderColor)}">
                            </div>
                        </div>

                        <div style="border-top:1px solid var(--ui-border, #e2e8f0); padding-top:10px; display:flex; flex-direction:column; gap:7px;">
                            <label class="dtd-check-label">
                                <input type="checkbox" id="dtd-close-loop"${modalState.isClosed ? ' checked' : ''}>
                                Close loop (connect final dot back to start)
                            </label>
                            <label class="dtd-check-label">
                                <input type="checkbox" id="dtd-start-marker"${modalState.showStartMarker ? ' checked' : ''}>
                                Highlight Start Dot with direction arrow
                            </label>
                            <label class="dtd-check-label" id="dtd-replace-row" style="${(!editEl && modalState.sourceMode === 'canvas' && candidates.length > 0) ? '' : 'display:none;'}">
                                <input type="checkbox" id="dtd-replace-selected"${modalState.replaceSelected ? ' checked' : ''}>
                                Replace selected canvas shape in-place
                            </label>
                            <label class="dtd-check-label" id="dtd-answer-row" style="font-weight:700;${editEl ? 'display:none;' : ''}">
                                <input type="checkbox" id="dtd-answer-page2"${modalState.answerKeyOnPage2 ? ' checked' : ''}>
                                Generate Answer Key on Page 2
                            </label>
                        </div>
                    </div>

                    <div class="dtd-preview-pane">
                        <div class="dtd-preview-toolbar">
                            <div class="dtd-preview-tabs">
                                <button type="button" class="dtd-ptab active" id="dtd-ptab-puzzle">Puzzle Preview</button>
                                <button type="button" class="dtd-ptab" id="dtd-ptab-answer">Solved Answer Key</button>
                            </div>
                            <div style="display:flex; gap:6px; flex-wrap:wrap;">
                                <button type="button" class="dtd-mini-btn" id="dtd-undo-pt-btn" style="${modalState.sourceMode === 'plot' ? '' : 'display:none;'}" title="Remove last plotted dot"><i class="fas fa-undo"></i>Undo Pt</button>
                                <button type="button" class="dtd-mini-btn" id="dtd-clear-pt-btn" style="${modalState.sourceMode === 'plot' ? '' : 'display:none;'}" title="Clear plotted points"><i class="fas fa-eraser"></i>Clear</button>
                                <button type="button" class="dtd-mini-btn" id="dtd-shift-start-btn" title="Rotate starting dot position along contour"><i class="fas fa-step-forward"></i>Shift Start</button>
                                <button type="button" class="dtd-mini-btn" id="dtd-reverse-btn" title="Reverse numbering direction"><i class="fas fa-exchange-alt"></i>Reverse</button>
                            </div>
                        </div>
                        <div class="dtd-preview-canvas">
                            <div class="dtd-preview-stage${modalState.sourceMode === 'plot' ? ' plot-active' : ''}" id="dtd-preview-stage"></div>
                        </div>
                        <div class="dtd-status-bar">
                            <span id="dtd-status-text">Ready</span>
                            <span id="dtd-meta-text" style="opacity:0.78;"></span>
                        </div>
                    </div>
                </div>

                <div class="dtd-modal-footer">
                    <span style="font-size:11.5px; opacity:0.75;">
                        ${editEl ? 'Updating this puzzle also syncs any linked Page 2 Answer Key.' : 'Tip: Select any canvas shape first or double-click any inserted puzzle to re-edit.'}
                    </span>
                    <div style="display:flex; gap:8px;">
                        <button type="button" class="dtd-btn-secondary" id="dtd-cancel-btn">Cancel</button>
                        <button type="button" class="dtd-btn-primary" id="dtd-insert-btn"><i class="fas fa-plus"></i> ${editEl ? 'Update Dot-to-Dot' : 'Insert Dot-to-Dot'}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        const modalBox = overlay.querySelector('#dtd-modal-box');
        const modalHeader = overlay.querySelector('#dtd-modal-header');
        const teardownMainDrag = makeModalDraggable(modalBox, modalHeader);
        const selectCtrl = enhanceSelectControls(overlay);

        // Sync saved dot size preset & font selector
        const dotSizeSel = overlay.querySelector('#dtd-dot-size');
        if (modalState.dotRadius <= 3.5) dotSizeSel.value = 'small';
        else if (modalState.dotRadius >= 5.0) dotSizeSel.value = 'large';
        else dotSizeSel.value = 'medium';

        const fontSel = overlay.querySelector('#dtd-font-family');
        if (fontSel && Array.from(fontSel.options).some(o => o.value === modalState.fontFamily)) {
            fontSel.value = modalState.fontFamily;
        }
        selectCtrl.syncAll();

        let lastSampled = null;
        let lastContour = null;
        let activeCanvasEl = selectedCandidate ? selectedCandidate.el : null;

        const resolveActiveContour = () => {
            if (modalState.sourceMode === 'canvas') {
                const cIdx = parseInt(modalState.canvasIdx, 10);
                const cand = (!Number.isNaN(cIdx) && cIdx >= 0 && candidates[cIdx]) ? candidates[cIdx] : null;
                activeCanvasEl = cand ? cand.el : null;
                if (activeCanvasEl) {
                    const ext = extractPolylineFromElement(activeCanvasEl);
                    if (ext) return ext;
                }
                if (editEl && modalState.savedContour) return modalState.savedContour;
                return null;
            }
            activeCanvasEl = null;
            if (modalState.sourceMode === 'preset') {
                const p = PRESET_SHAPES[modalState.presetKey] || PRESET_SHAPES.heart;
                const dPath = p.dSingle || p.d;
                const ext = extractPolylineFromSvgString(dPath);
                if (ext) ext.label = p.label;
                return ext;
            }
            if (modalState.sourceMode === 'svg') {
                return extractPolylineFromSvgString(modalState.customSvg);
            }
            if (modalState.sourceMode === 'plot') {
                return modalState.hintStyle === 'curved'
                    ? sampleCatmullRomContour(modalState.plotPoints, modalState.isClosed, 300)
                    : normalizeLinearPlotContour(modalState.plotPoints, modalState.isClosed);
            }
            return null;
        };

        const renderPreview = () => {
            lastContour = resolveActiveContour();
            lastSampled = computeResultFromState(modalState, lastContour);
            const isAnswer = modalState.previewMode === 'answer';
            const stage = overlay.querySelector('#dtd-preview-stage');
            stage.classList.toggle('plot-active', modalState.sourceMode === 'plot');

            if (!lastContour && modalState.sourceMode !== 'plot') {
                const emptyMsg = modalState.sourceMode === 'canvas'
                    ? 'No vector shapes or paths detected on the current page. Insert a Shape / Arrow or pick another Path Source.'
                    : 'Could not parse any valid SVG vector geometry from the path data above.';
                stage.innerHTML = `<div style="padding:20px;text-align:center;font-size:13px;opacity:0.78;border:1.5px dashed var(--ui-border,#cbd5e1);border-radius:10px;background:var(--ui-panel-bg,#fff);max-width:340px;">${escapeXml(emptyMsg)}</div>`;
                overlay.querySelector('#dtd-status-text').textContent = 'Waiting for valid vector path';
                overlay.querySelector('#dtd-meta-text').textContent = '';
                return;
            }

            const rendered = buildDotToDotSvg(lastSampled, modalState, isAnswer);
            stage.innerHTML = rendered.svgMarkup;

            const statusEl = overlay.querySelector('#dtd-status-text');
            const metaEl = overlay.querySelector('#dtd-meta-text');
            const seqInfo = SEQUENCE_MODES[modalState.sequenceMode] || SEQUENCE_MODES['1s'];
            const hintInfo = HINT_STYLES[modalState.hintStyle] || HINT_STYLES.curved;
            const srcName = (lastContour && lastContour.label) || 'Path';

            statusEl.textContent = `${srcName} - ${rendered.nodeCount} nodes (${rendered.firstLabel} -> ${rendered.lastLabel})`;
            if (modalState.hintStyle === 'none') {
                metaEl.textContent = `${seqInfo.shortLabel} | No Guides`;
            } else if (modalState.hintOpacity <= 0) {
                metaEl.textContent = `${seqInfo.shortLabel} | ${hintInfo.shortLabel} (0% - Off)`;
            } else {
                metaEl.textContent = `${seqInfo.shortLabel} | ${hintInfo.shortLabel} (${Math.round(modalState.hintOpacity * 100)}%)`;
            }
        };

        const updateConditionalPanels = () => {
            const m = modalState.sourceMode;
            overlay.querySelector('#dtd-panel-canvas').style.display = m === 'canvas' ? '' : 'none';
            overlay.querySelector('#dtd-panel-preset').style.display = m === 'preset' ? '' : 'none';
            overlay.querySelector('#dtd-panel-svg').style.display = m === 'svg' ? '' : 'none';
            overlay.querySelector('#dtd-panel-plot').style.display = m === 'plot' ? '' : 'none';
            overlay.querySelector('#dtd-dot-count-wrap').style.display = m === 'plot' ? 'none' : '';
            overlay.querySelector('#dtd-undo-pt-btn').style.display = m === 'plot' ? '' : 'none';
            overlay.querySelector('#dtd-clear-pt-btn').style.display = m === 'plot' ? '' : 'none';
            overlay.querySelector('#dtd-replace-row').style.display = (!editEl && m === 'canvas' && candidates.length > 0) ? '' : 'none';
            overlay.querySelector('#dtd-answer-row').style.display = (!editEl && !(m === 'canvas' && modalState.replaceSelected)) ? '' : 'none';
            overlay.querySelector('#dtd-hint-options-row').style.display = modalState.hintStyle === 'none' ? 'none' : '';

            const seqInfo = SEQUENCE_MODES[modalState.sequenceMode] || SEQUENCE_MODES['1s'];
            overlay.querySelector('#dtd-start-value').disabled = !!seqInfo.isAlpha;
        };

        const syncControlsToState = () => {
            modalState.title = overlay.querySelector('#dtd-title').value;
            modalState.sourceMode = overlay.querySelector('#dtd-source-mode').value;
            modalState.canvasIdx = parseInt(overlay.querySelector('#dtd-canvas-target').value, 10);
            modalState.presetKey = overlay.querySelector('#dtd-preset-shape').value;
            modalState.customSvg = overlay.querySelector('#dtd-svg-input').value;
            modalState.sequenceMode = overlay.querySelector('#dtd-sequence-mode').value;
            modalState.startValue = parseInt(overlay.querySelector('#dtd-start-value').value, 10) || 0;
            modalState.hintCoverage = overlay.querySelector('#dtd-hint-coverage').value;
            const parsedHintOp = parseInt(overlay.querySelector('#dtd-hint-opacity').value, 10);
            modalState.hintOpacity = (Number.isFinite(parsedHintOp) ? Math.max(0, Math.min(75, parsedHintOp)) : 20) / 100;
            modalState.dotCount = parseInt(overlay.querySelector('#dtd-dot-count').value, 10) || 24;
            modalState.placementMode = overlay.querySelector('#dtd-placement-mode').value;
            modalState.fontFamily = overlay.querySelector('#dtd-font-family').value;
            modalState.isClosed = overlay.querySelector('#dtd-close-loop').checked;
            modalState.showStartMarker = overlay.querySelector('#dtd-start-marker').checked;
            modalState.replaceSelected = overlay.querySelector('#dtd-replace-selected').checked;
            modalState.answerKeyOnPage2 = overlay.querySelector('#dtd-answer-page2').checked;

            const szPreset = overlay.querySelector('#dtd-dot-size').value;
            if (szPreset === 'small') { modalState.dotRadius = 3.2; modalState.labelFontSize = 10; }
            else if (szPreset === 'large') { modalState.dotRadius = 5.4; modalState.labelFontSize = 14.5; }
            else { modalState.dotRadius = 4.2; modalState.labelFontSize = 12; }

            modalState.accentColor = overlay.querySelector('#dtd-accent-color').value;
            modalState.dotColor = overlay.querySelector('#dtd-dot-color').value;
            modalState.textColor = overlay.querySelector('#dtd-text-color').value;
            modalState.hintColor = overlay.querySelector('#dtd-hint-color').value;
            modalState.solvedColor = overlay.querySelector('#dtd-solved-color').value;
            modalState.bgColor = overlay.querySelector('#dtd-bg-color').value;
            modalState.borderColor = overlay.querySelector('#dtd-border-color').value;

            overlay.querySelector('#dtd-dot-count-val').textContent = String(modalState.dotCount);
            overlay.querySelector('#dtd-hint-opacity-val').textContent = `${Math.round(modalState.hintOpacity * 100)}%`;
            updateConditionalPanels();
        };

        // Sequence mode switch auto-adjusts default Start Value cleanly & caps Alphabet dots <= 26
        overlay.querySelector('#dtd-sequence-mode').addEventListener('change', () => {
            const nextSeq = overlay.querySelector('#dtd-sequence-mode').value;
            const info = SEQUENCE_MODES[nextSeq] || SEQUENCE_MODES['1s'];
            const startInp = overlay.querySelector('#dtd-start-value');
            if (!info.isAlpha) {
                startInp.value = String(info.defaultStart);
            } else {
                const countSlider = overlay.querySelector('#dtd-dot-count');
                if (parseInt(countSlider.value, 10) > 26) {
                    countSlider.value = '26';
                }
            }
            syncControlsToState();
            renderPreview();
        });

        overlay.querySelector('#dtd-preset-shape').addEventListener('change', () => {
            const p = PRESET_SHAPES[overlay.querySelector('#dtd-preset-shape').value];
            if (p) {
                overlay.querySelector('#dtd-close-loop').checked = !!p.isClosed;
                if (p.defaultDots && !SEQUENCE_MODES[modalState.sequenceMode].isAlpha) {
                    overlay.querySelector('#dtd-dot-count').value = String(p.defaultDots);
                }
            }
            modalState.startShift = 0;
            syncControlsToState();
            renderPreview();
        });

        overlay.querySelector('#dtd-source-mode').addEventListener('change', () => {
            modalState.startShift = 0;
            syncControlsToState();
            renderPreview();
        });

        ['#dtd-canvas-target', '#dtd-hint-coverage', '#dtd-placement-mode', '#dtd-dot-size', '#dtd-font-family', '#dtd-close-loop', '#dtd-start-marker', '#dtd-replace-selected', '#dtd-answer-page2'].forEach(sel => {
            overlay.querySelector(sel).addEventListener('change', () => {
                syncControlsToState();
                renderPreview();
            });
        });

        ['#dtd-title', '#dtd-svg-input', '#dtd-start-value', '#dtd-dot-count', '#dtd-hint-opacity'].forEach(sel => {
            overlay.querySelector(sel).addEventListener('input', () => {
                syncControlsToState();
                renderPreview();
            });
        });

        // Segmented Guide Hints Toggle (None | Curved | Straight)
        overlay.querySelectorAll('[data-hint-style]').forEach(btn => {
            btn.addEventListener('click', () => {
                modalState.hintStyle = btn.dataset.hintStyle;
                overlay.querySelectorAll('[data-hint-style]').forEach(b => b.classList.toggle('active', b === btn));
                updateConditionalPanels();
                renderPreview();
            });
        });

        // Color Presets
        overlay.querySelectorAll('[data-color-preset]').forEach(btn => {
            btn.addEventListener('click', () => {
                const p = COLOR_PRESETS[btn.dataset.colorPreset];
                if (!p) return;
                const pairs = [
                    ['dtd-accent-color', p.accent],
                    ['dtd-dot-color', p.dot],
                    ['dtd-text-color', p.text],
                    ['dtd-hint-color', p.hint],
                    ['dtd-solved-color', p.solved],
                    ['dtd-bg-color', p.bg],
                    ['dtd-border-color', p.border]
                ];
                pairs.forEach(([id, val]) => {
                    const inp = overlay.querySelector('#' + id);
                    const sw = overlay.querySelector(`[data-swatch-for="${id}"]`);
                    if (inp) inp.value = val;
                    if (sw) sw.style.background = val;
                });
                syncControlsToState();
                renderPreview();
            });
        });

        // CustomColorPicker swatches
        overlay.querySelectorAll('.dtd-color-chip').forEach(chip => {
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
                    renderPreview();
                };

                if (window.CustomColorPicker && typeof window.CustomColorPicker.open === 'function') {
                    window.CustomColorPicker.open(chip, initColor, applyVal);
                } else {
                    const nativeInp = document.createElement('input');
                    nativeInp.type = 'color';
                    nativeInp.value = initColor === 'transparent' ? '#ffffff' : initColor;
                    nativeInp.addEventListener('input', () => applyVal(nativeInp.value));
                    nativeInp.click();
                }
            });
        });

        // Click-to-Plot interactive SVG point placement
        overlay.querySelector('#dtd-preview-stage').addEventListener('click', (e) => {
            if (modalState.sourceMode !== 'plot') return;
            const svg = e.currentTarget.querySelector('svg');
            if (!svg) return;
            const pt = svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const ctm = svg.getScreenCTM();
            if (!ctm) return;
            const svgPt = pt.matrixTransform(ctm.inverse());
            modalState.plotPoints.push({ x: Math.round(svgPt.x * 10) / 10, y: Math.round(svgPt.y * 10) / 10 });
            renderPreview();
        });

        overlay.querySelector('#dtd-undo-pt-btn').addEventListener('click', () => {
            if (modalState.sourceMode !== 'plot' || modalState.plotPoints.length === 0) return;
            modalState.plotPoints.pop();
            renderPreview();
        });
        overlay.querySelector('#dtd-clear-pt-btn').addEventListener('click', () => {
            if (modalState.sourceMode !== 'plot') return;
            modalState.plotPoints = [];
            renderPreview();
        });
        overlay.querySelector('#dtd-shift-start-btn').addEventListener('click', () => {
            modalState.startShift = (modalState.startShift + 1);
            renderPreview();
        });
        overlay.querySelector('#dtd-reverse-btn').addEventListener('click', () => {
            modalState.reverseDirection = !modalState.reverseDirection;
            renderPreview();
        });

        // Preview Tabs
        const ptabPuzzle = overlay.querySelector('#dtd-ptab-puzzle');
        const ptabAnswer = overlay.querySelector('#dtd-ptab-answer');
        ptabPuzzle.addEventListener('click', () => {
            modalState.previewMode = 'puzzle';
            ptabPuzzle.classList.add('active');
            ptabAnswer.classList.remove('active');
            renderPreview();
        });
        ptabAnswer.addEventListener('click', () => {
            modalState.previewMode = 'answer';
            ptabAnswer.classList.add('active');
            ptabPuzzle.classList.remove('active');
            renderPreview();
        });

        // XP Help modal trigger
        overlay.querySelector('#dtd-help-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            selectCtrl.closeAll();
            openHelpModal(overlay);
        });

        // Modal Close / Escape handling
        let onKeyDown = null;
        const closeModal = () => {
            teardownMainDrag();
            selectCtrl.destroy();
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen && typeof window.CustomColorPicker.close === 'function') {
                window.CustomColorPicker.close();
            }
            if (onKeyDown) document.removeEventListener('keydown', onKeyDown);
            const openHelp = document.getElementById('op-dottodot-help-modal');
            if (openHelp) openHelp.remove();
            overlay.remove();
        };
        onKeyDown = (e) => {
            if (e.key !== 'Escape') return;
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen && typeof window.CustomColorPicker.close === 'function') {
                window.CustomColorPicker.close();
                return;
            }
            const openHelp = document.getElementById('op-dottodot-help-modal');
            if (openHelp) openHelp.remove();
            else closeModal();
        };
        document.addEventListener('keydown', onKeyDown);

        overlay.querySelector('#dtd-close-x').addEventListener('click', closeModal);
        overlay.querySelector('#dtd-cancel-btn').addEventListener('click', closeModal);
        overlay.addEventListener('mousedown', (e) => {
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen) return;
            if (e.target === overlay && typeof window.triggerModalPulse === 'function') {
                window.triggerModalPulse(overlay.querySelector('#dtd-modal-box'));
            }
        });

        overlay.querySelector('#dtd-insert-btn').addEventListener('click', () => {
            syncControlsToState();
            const activeContour = resolveActiveContour();
            const sampled = computeResultFromState(modalState, activeContour);
            if (!sampled || !sampled.nodes || sampled.nodes.length < 2) {
                if (typeof showToast === 'function') showToast('Please provide a path with at least 2 nodes first!');
                return;
            }
            const cfgCopy = Object.assign({}, modalState);
            const targetCanvasCopy = activeCanvasEl;
            closeModal();
            insertDotToDotIntoDocument(sampled, cfgCopy, activeContour, {
                editEl,
                targetCanvasEl: targetCanvasCopy
            });
        });

        updateConditionalPanels();
        renderPreview();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', installCanvasDotToDotHandlers);
    } else {
        installCanvasDotToDotHandlers();
    }

    window.DotToDotStudio = {
        showModal,
        extractPolylineFromElement,
        extractPolylineFromSvgString,
        sampleDotNodes,
        buildDotToDotSvg,
        formatNodeLabel,
        PRESET_SHAPES
    };
})(window);
