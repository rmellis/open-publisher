/**
 * OpenPublisher Styled Tables Library & Gallery (v5.17.9)
 *
 * A composable table styling system:
 *   Design (22 structures)  x  Colour palette (40)  x  Contents (9 presets)
 *
 * Design notes
 *  - Every cell is painted with a SOLID colour (no transparent rows), so tables
 *    stay clean when placed over photos, artwork or coloured backgrounds.
 *    ("Floating" designs deliberately leave gaps BETWEEN rows/tiles, but every
 *    cell itself is solid.)
 *  - Styling is class based (.op-tbl .op-d-<design> .opp-<palette>) with all
 *    colours driven by CSS custom properties. Because nothing is baked into
 *    inline styles, adding/removing rows and columns keeps banding, header and
 *    corner rounding correct automatically.
 *  - All palette colours are pre-computed to literal hex values (no color-mix)
 *    and no gradients/shadows are used on the table itself, so the PDF/PNG
 *    export pipeline (html2canvas) renders tables identically to the canvas.
 *  - Legacy classes (pt-c-*, pt-r-*, pt-m-*, pub-table-*) are intentionally
 *    left untouched in system-patches.js so existing documents still render.
 */
(function () {
    'use strict';

    /* ------------------------------------------------------------------ *
     *  Colour helpers
     * ------------------------------------------------------------------ */
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    function hexToRgb(hex) {
        let h = String(hex).replace('#', '');
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        const n = parseInt(h, 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
    }
    function mix(a, b, t) {
        const A = hexToRgb(a), B = hexToRgb(b);
        return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
    }
    function luminance(hex) {
        const [r, g, b] = hexToRgb(hex).map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    const readableOn = hex => (luminance(hex) > 0.3 ? '#1a1a1a' : '#ffffff');

    /* ------------------------------------------------------------------ *
     *  Palettes (40): 32 light, 8 dark. Each derives every shade it needs.
     *    h  header bg         hf header text      hl header line / darker tone
     *    a  body row A        b  body row B       t  body text
     *    l  line colour       x  accent           s  soft header tint
     *    sd soft header text  fc first column bg  fcf first column text
     *    tot total row bg
     * ------------------------------------------------------------------ */
    function lightPalette(id, name, accent) {
        return {
            id, name, dark: false, accent,
            v: {
                h: accent, hf: readableOn(accent), hl: mix(accent, '#000000', 0.22),
                a: mix(accent, '#ffffff', 0.94), b: mix(accent, '#ffffff', 0.85),
                t: mix(accent, '#000000', 0.80), l: mix(accent, '#ffffff', 0.68),
                x: accent, s: mix(accent, '#ffffff', 0.80), sd: mix(accent, '#000000', 0.40),
                fc: mix(accent, '#ffffff', 0.72), fcf: mix(accent, '#000000', 0.62),
                tot: mix(accent, '#ffffff', 0.66)
            }
        };
    }
    function darkPalette(id, name, base, accent) {
        return {
            id, name, dark: true, accent, base,
            v: {
                h: accent, hf: readableOn(accent), hl: mix(accent, '#000000', 0.30),
                a: base, b: mix(base, '#ffffff', 0.07),
                t: mix(accent, '#ffffff', 0.86), l: mix(base, '#ffffff', 0.20),
                x: accent, s: mix(base, accent, 0.28), sd: mix(accent, '#ffffff', 0.55),
                fc: mix(base, accent, 0.32), fcf: mix(accent, '#ffffff', 0.85),
                tot: mix(base, accent, 0.45)
            }
        };
    }

    const PALETTES = [
        lightPalette('teal', 'Open Publisher Teal', '#007670'),
        lightPalette('ocean', 'Ocean Blue', '#0369a1'),
        lightPalette('cobalt', 'Cobalt', '#1d4ed8'),
        lightPalette('navy', 'Midnight Navy', '#1e3a8a'),
        lightPalette('indigo', 'Indigo', '#4f46e5'),
        lightPalette('violet', 'Violet', '#7c3aed'),
        lightPalette('purple', 'Royal Purple', '#7e22ce'),
        lightPalette('orchid', 'Orchid', '#c026d3'),
        lightPalette('rose', 'Rose', '#e11d48'),
        lightPalette('pink', 'Hot Pink', '#db2777'),
        lightPalette('crimson', 'Crimson', '#b91c1c'),
        lightPalette('tangerine', 'Tangerine', '#ea580c'),
        lightPalette('amber', 'Amber', '#d97706'),
        lightPalette('gold', 'Gold', '#ca8a04'),
        lightPalette('lime', 'Lime', '#65a30d'),
        lightPalette('emerald', 'Emerald', '#059669'),
        lightPalette('forest', 'Forest', '#166534'),
        lightPalette('mint', 'Mint', '#14b8a6'),
        lightPalette('cyan', 'Cyan', '#0891b2'),
        lightPalette('sky', 'Sky', '#0ea5e9'),
        lightPalette('slate', 'Slate', '#475569'),
        lightPalette('graphite', 'Graphite', '#374151'),
        lightPalette('ink', 'Ink', '#111827'),
        lightPalette('stone', 'Stone', '#78716c'),
        lightPalette('cocoa', 'Cocoa', '#92400e'),
        lightPalette('wine', 'Wine', '#9f1239'),
        lightPalette('plum', 'Plum', '#701a75'),
        lightPalette('peach', 'Peach', '#fb923c'),
        lightPalette('coral', 'Coral', '#f87171'),
        lightPalette('lavender', 'Lavender', '#a78bfa'),
        lightPalette('sage', 'Sage', '#84a98c'),
        lightPalette('sand', 'Sand', '#b08968'),
        darkPalette('midnight', 'Midnight', '#0f172a', '#38bdf8'),
        darkPalette('obsidian', 'Obsidian', '#111111', '#a3a3a3'),
        darkPalette('ember', 'Ember', '#1c1210', '#f97316'),
        darkPalette('aurora', 'Aurora', '#1e1b4b', '#a78bfa'),
        darkPalette('matrix', 'Matrix', '#04120a', '#22c55e'),
        darkPalette('nightrose', 'Night Rose', '#1f0a0f', '#f43f5e'),
        darkPalette('deepsea', 'Deep Sea', '#04202b', '#06b6d4'),
        darkPalette('noirgold', 'Noir Gold', '#0c0a09', '#eab308')
    ];

    /* ------------------------------------------------------------------ *
     *  Designs (22). Each returns CSS for its scoped selector S.
     * ------------------------------------------------------------------ */
    const DESIGNS = [];
    const def = (id, name, cat, css) => DESIGNS.push({ id, name, cat, css });

    // Round the four outer corners of the table via the corner cells (no overflow clipping).
    const corners = (S, r) =>
        `${S} tr:first-child>*:first-child{border-top-left-radius:${r}px}` +
        `${S} tr:first-child>*:last-child{border-top-right-radius:${r}px}` +
        `${S} tr:last-child>*:first-child{border-bottom-left-radius:${r}px}` +
        `${S} tr:last-child>*:last-child{border-bottom-right-radius:${r}px}`;
    // Outer frame drawn on the edge cells so it follows the corner radius.
    const frame = (S, w, c, hc) =>
        `${S} tr>*:first-child{border-left:${w}px solid ${c}}` +
        `${S} tr>*:last-child{border-right:${w}px solid ${c}}` +
        `${S} tr:first-child>*{border-top:${w}px solid ${hc}}` +
        `${S} tr:last-child>*{border-bottom:${w}px solid ${c}}` +
        `${S} th:first-child{border-left-color:${hc}}` +
        `${S} th:last-child{border-right-color:${hc}}`;

    // ---- Classic ----
    def('grid', 'Classic Grid', 'Classic', S =>
        `${S}{border-top:1px solid var(--op-l);border-left:1px solid var(--op-l)}` +
        `${S} th,${S} td{border-right:1px solid var(--op-l);border-bottom:1px solid var(--op-l)}` +
        `${S} th{border-right-color:var(--op-hl);border-bottom-color:var(--op-hl)}`);
    def('banded', 'Banded Rows', 'Classic', S =>
        `${S} th{padding-top:12px;padding-bottom:12px}` +
        `${S} tr:last-child>td{border-bottom:2px solid var(--op-h)}`);
    def('lined', 'Ruled Lines', 'Classic', S =>
        `${S} td{border-bottom:1px solid var(--op-l)}` +
        `${S} th{border-bottom:3px solid var(--op-hl)}`);
    def('columns', 'Column Bands', 'Classic', S =>
        `${S} td:nth-child(odd){background:var(--op-a)}` +
        `${S} td:nth-child(even){background:var(--op-b)}` +
        `${S} th:nth-child(even){background:var(--op-hl)}` +
        `${S} td{border-bottom:1px solid var(--op-l)}`);
    def('firstcol', 'Sidebar Column', 'Classic', S =>
        `${S} td:first-child{background:var(--op-fc);color:var(--op-fcf);font-weight:700}` +
        `${S} th:first-child{background:var(--op-hl)}` +
        `${S} td{border-bottom:1px solid var(--op-l)}`);
    def('checker', 'Checkerboard', 'Classic', S =>
        `${S} tr:nth-child(even)>td:nth-child(even),${S} tr:nth-child(odd)>td:nth-child(odd){background:var(--op-ra)}` +
        `${S} tr:nth-child(even)>td:nth-child(odd),${S} tr:nth-child(odd)>td:nth-child(even){background:var(--op-rb)}`);

    // ---- Modern ----
    def('clean', 'Clean Header', 'Modern', S =>
        `${S} th{background:var(--op-s);color:var(--op-sd);border-bottom:2px solid var(--op-x);font-size:12px;letter-spacing:.9px;text-transform:uppercase}` +
        `${S} td{border-bottom:1px solid var(--op-l)}`);
    def('soft', 'Soft Tiles', 'Modern', S =>
        `${S} th{background:var(--op-s);color:var(--op-sd)}` +
        `${S} th,${S} td{border-right:2px solid var(--op-a);border-bottom:2px solid var(--op-a)}`);
    def('accentbar', 'Accent Rail', 'Modern', S =>
        `${S} th{background:var(--op-s);color:var(--op-sd)}` +
        `${S} th:first-child{border-left:6px solid var(--op-hl)}` +
        `${S} td:first-child{border-left:6px solid var(--op-x)}` +
        `${S} td{border-bottom:1px solid var(--op-l)}`);
    def('matrix', 'Matrix', 'Modern', S =>
        `${S} td:first-child{background:var(--op-h);color:var(--op-hf);font-weight:700}` +
        `${S} th:first-child{background:var(--op-hl)}` +
        `${S} td{border-bottom:1px solid var(--op-l)}`);

    // ---- Rounded ----
    def('round', 'Rounded', 'Rounded', S =>
        frame(S, 1, 'var(--op-l)', 'var(--op-hl)') + corners(S, 14));
    def('roundgrid', 'Rounded Grid', 'Rounded', S =>
        `${S} th,${S} td{border-right:1px solid var(--op-l);border-bottom:1px solid var(--op-l)}` +
        `${S} th{border-right-color:var(--op-hl);border-bottom-color:var(--op-hl)}` +
        frame(S, 1, 'var(--op-hl)', 'var(--op-hl)') + corners(S, 16));
    def('pill', 'Pill', 'Rounded', S =>
        `${S} th,${S} td{padding:9px 18px}` + corners(S, 20));
    def('roundsoft', 'Soft Rounded', 'Rounded', S =>
        `${S} th{background:var(--op-s);color:var(--op-sd);border-bottom:2px solid var(--op-x)}` +
        `${S} td{border-bottom:1px solid var(--op-l)}` +
        frame(S, 1, 'var(--op-l)', 'var(--op-l)') + corners(S, 12));

    // ---- Floating (solid cells with gaps between rows / tiles) ----
    def('float', 'Floating Rows', 'Floating', S =>
        `${S}{border-spacing:0 6px}` +
        `${S} tr>*:first-child{border-top-left-radius:10px;border-bottom-left-radius:10px}` +
        `${S} tr>*:last-child{border-top-right-radius:10px;border-bottom-right-radius:10px}`);
    def('tiles', 'Tiles', 'Floating', S =>
        `${S}{border-spacing:5px}` +
        `${S} th,${S} td{border-radius:9px}`);
    def('cards', 'Row Cards', 'Floating', S =>
        `${S}{border-spacing:0 8px}` +
        `${S} td{border-top:1px solid var(--op-l);border-bottom:1px solid var(--op-l)}` +
        `${S} td:first-child{border-left:6px solid var(--op-x);border-top-left-radius:12px;border-bottom-left-radius:12px}` +
        `${S} td:last-child{border-right:1px solid var(--op-l);border-top-right-radius:12px;border-bottom-right-radius:12px}` +
        `${S} th:first-child{border-top-left-radius:12px;border-bottom-left-radius:12px}` +
        `${S} th:last-child{border-top-right-radius:12px;border-bottom-right-radius:12px}`);

    // ---- Bold ----
    def('bold', 'Bold Header', 'Bold', S =>
        `${S} th{padding:15px 14px;font-size:15px;letter-spacing:1.2px;text-transform:uppercase;border-bottom:5px solid var(--op-hl)}` +
        `${S} td{padding:11px 14px;border-bottom:1px solid var(--op-l)}` +
        `${S} tr:last-child>td{border-bottom:5px solid var(--op-h)}`);
    def('heavy', 'Heavy Frame', 'Bold', S =>
        `${S} th,${S} td{border-right:1px solid var(--op-l);border-bottom:1px solid var(--op-l)}` +
        `${S} th{border-right-color:var(--op-hl)}` +
        frame(S, 3, 'var(--op-h)', 'var(--op-h)'));

    // ---- Minimal (still solid-filled) ----
    def('paper', 'Editorial', 'Minimal', S =>
        `${S} tr>td{background:var(--op-a)}` +
        `${S} tr.op-total>td{background:var(--op-tot)}` +
        `${S} th{background:var(--op-a);color:var(--op-x);font-size:12px;letter-spacing:1.4px;text-transform:uppercase;border-bottom:3px solid var(--op-x)}` +
        `${S} td{border-bottom:1px solid var(--op-l)}` +
        `${S} tr:last-child>td{border-bottom:2px solid var(--op-x)}`);
    def('ledger', 'Ledger', 'Minimal', S =>
        `${S} th{background:var(--op-s);color:var(--op-sd);border-top:2px solid var(--op-x);border-bottom:1px solid var(--op-x)}` +
        `${S} td{border-bottom:1px solid var(--op-l)}` +
        `${S} tr:last-child>td{border-bottom:3px double var(--op-x)}`);
    def('dotted', 'Dotted Rules', 'Minimal', S =>
        `${S} th{letter-spacing:.5px}` +
        `${S} td{border-bottom:2px dotted var(--op-x)}`);

    const CATEGORIES = ['All', 'Classic', 'Modern', 'Rounded', 'Floating', 'Bold', 'Minimal'];

    /* ------------------------------------------------------------------ *
     *  Stylesheet generation (injected once)
     * ------------------------------------------------------------------ */
    function buildCSS() {
        let css = `
.op-tbl{width:100%;height:100%;border-collapse:separate;border-spacing:0;table-layout:fixed;border:0;
  font-family:'Segoe UI',Arial,Helvetica,sans-serif;font-size:14px;line-height:1.4;color:var(--op-t);
  --op-ra:var(--op-a);--op-rb:var(--op-b)}
.op-tbl.op-nohead{--op-ra:var(--op-b);--op-rb:var(--op-a)}
.op-tbl.op-flat{--op-b:var(--op-a)}
.op-tbl th,.op-tbl td{box-sizing:border-box;margin:0;padding:9px 14px;border:0;outline:none;min-width:20px;
  text-align:left;vertical-align:middle;overflow-wrap:anywhere;color:var(--op-t);background:var(--op-a)}
.op-tbl th{background:var(--op-h);color:var(--op-hf);font-weight:700}
.op-tbl tr:nth-child(even)>td{background:var(--op-ra)}
.op-tbl tr:nth-child(odd)>td{background:var(--op-rb)}
`;
        DESIGNS.forEach(d => { css += d.css('.op-tbl.op-d-' + d.id) + '\n'; });
        PALETTES.forEach(p => {
            const v = p.v;
            css += `.opp-${p.id}{--op-h:${v.h};--op-hf:${v.hf};--op-hl:${v.hl};--op-a:${v.a};--op-b:${v.b};` +
                `--op-t:${v.t};--op-l:${v.l};--op-x:${v.x};--op-s:${v.s};--op-sd:${v.sd};` +
                `--op-fc:${v.fc};--op-fcf:${v.fcf};--op-tot:${v.tot}}\n`;
        });
        css += `
.op-tbl .op-ctr{text-align:center}
.op-tbl .op-num{text-align:right}
.op-tbl .op-bold{font-weight:700}
.op-tbl tr.op-total{--op-ra:var(--op-tot);--op-rb:var(--op-tot)}
.op-tbl tr.op-total>td{font-weight:700}
`;
        return css;
    }

    function injectCSS() {
        if (document.getElementById('op-table-styles-css')) return;
        const el = document.createElement('style');
        el.id = 'op-table-styles-css';
        el.textContent = buildCSS();
        document.head.appendChild(el);
    }

    /* ------------------------------------------------------------------ *
     *  Content presets
     * ------------------------------------------------------------------ */
    const CONTENT = [
        { id: 'blank', name: 'Blank' },
        {
            id: 'schedule', name: 'Schedule', align: 'lll', boldFirst: true,
            head: ['Time', 'Event', 'Location'],
            rows: [['09:00 AM', 'Welcome & Registration', 'Main Hall'], ['10:00 AM', 'Opening Keynote', 'Auditorium'],
                ['11:30 AM', 'Workshop Session', 'Room B'], ['01:00 PM', 'Networking Lunch', 'Atrium'],
                ['03:00 PM', 'Panel Discussion', 'Auditorium']]
        },
        {
            id: 'invoice', name: 'Invoice', align: 'lcrr',
            head: ['Description', 'Qty', 'Unit Price', 'Total'],
            rows: [['Consulting Services', '10', '$150.00', '$1,500.00'], ['Design Work', '1', '$299.00', '$299.00'],
                ['Hosting (annual)', '1', '$120.00', '$120.00']],
            tot: ['', '', 'Grand Total', '$1,919.00']
        },
        {
            id: 'pricing', name: 'Pricing', align: 'lccc', boldFirst: true,
            head: ['Plan', 'Starter', 'Pro', 'Business'],
            rows: [['Price', '$9/mo', '$19/mo', '$49/mo'], ['Users', '1', '5', 'Unlimited'],
                ['Storage', '5 GB', '50 GB', '500 GB'], ['Support', 'Email', 'Priority', '24/7 Phone']]
        },
        {
            id: 'compare', name: 'Comparison', align: 'lccc',
            head: ['Feature', 'Free', 'Plus', 'Pro'],
            rows: [['Cloud Sync', '\u2716', '\u2714', '\u2714'], ['Custom Fonts', '\u2714', '\u2714', '\u2714'],
                ['Team Sharing', '\u2716', '\u2716', '\u2714'], ['Priority Support', '\u2716', '\u2716', '\u2714']]
        },
        {
            id: 'roster', name: 'Roster', align: 'lccccc',
            head: ['Name', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            rows: [['Anderson, Sarah', '', '', '', '', ''], ['Miller, James', '', '', '', '', ''],
                ['Patel, Priya', '', '', '', '', ''], ['Nguyen, Daniel', '', '', '', '', '']]
        },
        {
            id: 'financial', name: 'Financial', align: 'lrrrr',
            head: ['Category', 'Q1', 'Q2', 'Q3', 'Q4'],
            rows: [['Revenue', '$150k', '$175k', '$190k', '$210k'], ['Expenses', '$80k', '$85k', '$90k', '$95k'],
                ['Marketing', '$20k', '$22k', '$25k', '$28k']],
            tot: ['Net Income', '$50k', '$68k', '$75k', '$87k']
        },
        {
            id: 'project', name: 'Project Plan', align: 'llll', boldFirst: true,
            head: ['Phase', 'Task', 'Owner', 'Status'],
            rows: [['Discovery', 'Market Research', 'Alice', 'Complete'], ['Design', 'UI Mockups', 'Bob', 'In Progress'],
                ['Build', 'Core Features', 'Carla', 'Planned'], ['Launch', 'Go-Live Checklist', 'Dev', 'Planned']]
        },
        {
            id: 'menu', name: 'Price List', align: 'llr',
            head: ['Item', 'Description', 'Price'],
            rows: [['Espresso', 'Double shot, rich crema', '$3.50'], ['Cappuccino', 'Steamed milk and foam', '$4.25'],
                ['Croissant', 'Butter, baked daily', '$3.75'], ['Avocado Toast', 'Sourdough, lime, chili', '$8.95']]
        },
        // Hidden preset used only for gallery thumbnails.
        {
            id: 'sample', name: 'Sample', hidden: true, align: 'lll',
            head: ['Name', 'Role', 'Status'],
            rows: [['Alex', 'Design', 'Active'], ['Sam', 'Develop', 'Away'], ['Kai', 'Testing', 'Active']]
        }
    ];
    const findContent = id => CONTENT.find(c => c.id === id) || CONTENT[0];
    const naturalRows = ct => (ct && ct.rows) ? 1 + ct.rows.length + (ct.tot ? 1 : 0) : null;

    /* ------------------------------------------------------------------ *
     *  Table markup
     * ------------------------------------------------------------------ */
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const clampInt = (v, lo, hi) => clamp(Math.round(Number(v)) || lo, lo, hi);

    function tableClasses(design, palette, banded, header) {
        const c = ['op-tbl', 'op-d-' + design, 'opp-' + palette];
        if (!banded) c.push('op-flat');
        if (!header) c.push('op-nohead');
        return c;
    }

    function alignClass(ct, j) {
        const a = ct && ct.align ? ct.align[j] : 'l';
        return a === 'c' ? 'op-ctr' : (a === 'r' ? 'op-num' : '');
    }
    function cellHTML(tag, text, cls) {
        return `<${tag}${cls ? ` class="${cls}"` : ''}>${text === '' ? '&nbsp;' : esc(text)}</${tag}>`;
    }

    function buildTable(c) {
        const cols = clampInt(c.cols, 1, 16);
        const rows = clampInt(c.rows, 1, 60);
        const ct = findContent(c.content);
        const hasPreset = !!(ct && ct.rows);
        const head = c.header ? 1 : 0;

        let bodyCount = rows - head;
        let useTotal = false;
        if (hasPreset && ct.tot && rows >= head + ct.rows.length + 1) { useTotal = true; bodyCount -= 1; }

        const classes = tableClasses(c.design, c.palette, c.banded, c.header).join(' ');
        let h = `<table class="${classes}" data-op-table="${c.design}:${c.palette}"${c.preview ? '' : ' contenteditable="true"'}>`;

        if (c.header) {
            h += '<tr>';
            for (let j = 0; j < cols; j++) {
                const t = hasPreset && j < ct.head.length ? ct.head[j] : 'Header ' + (j + 1);
                h += cellHTML('th', t, alignClass(ct, j));
            }
            h += '</tr>';
        }
        for (let i = 0; i < bodyCount; i++) {
            h += '<tr>';
            for (let j = 0; j < cols; j++) {
                let t;
                if (hasPreset) t = (i < ct.rows.length && j < ct.rows[i].length) ? ct.rows[i][j] : '';
                else t = 'Row ' + (i + 1) + ' Data';
                const cls = [alignClass(ct, j), (ct && ct.boldFirst && j === 0 && hasPreset) ? 'op-bold' : ''].filter(Boolean).join(' ');
                h += cellHTML('td', t, cls);
            }
            h += '</tr>';
        }
        if (useTotal) {
            h += '<tr class="op-total">';
            for (let j = 0; j < cols; j++) {
                h += cellHTML('td', j < ct.tot.length ? ct.tot[j] : '', alignClass(ct, j));
            }
            h += '</tr>';
        }
        return h + '</table>';
    }

    /* ------------------------------------------------------------------ *
     *  Apply a design to an existing table (keeps text and structure)
     * ------------------------------------------------------------------ */
    const LEGACY_CLASS = /^(op-tbl|op-d-.+|opp-.+|op-flat|op-nohead|pt-[a-z]-.+|pub-table-.+)$/;
    const CELL_RESET = ['border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft', 'borderRadius', 'background', 'backgroundColor'];
    const TABLE_RESET = ['border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft', 'borderRadius',
        'borderCollapse', 'borderSpacing', 'background', 'backgroundColor', 'overflow', 'boxShadow'];

    function swapTag(cell, tag) {
        const n = document.createElement(tag);
        Array.from(cell.attributes).forEach(a => n.setAttribute(a.name, a.value));
        while (cell.firstChild) n.appendChild(cell.firstChild);
        cell.replaceWith(n);
        n.classList.remove('op-selected-cell');
        return n;
    }

    function applyToTable(table, c) {
        const kept = Array.from(table.classList).filter(cl => !LEGACY_CLASS.test(cl));
        table.className = kept.concat(tableClasses(c.design, c.palette, c.banded, c.header)).join(' ');
        table.setAttribute('data-op-table', c.design + ':' + c.palette);
        TABLE_RESET.forEach(p => { table.style[p] = ''; });

        Array.from(table.rows).forEach(tr => {
            ['background', 'backgroundColor', 'color'].forEach(p => { tr.style[p] = ''; });
            Array.from(tr.cells).forEach(cell => { CELL_RESET.forEach(p => { cell.style[p] = ''; }); });
        });
        const first = table.rows[0];
        if (first) {
            const want = c.header ? 'TH' : 'TD';
            Array.from(first.cells).forEach(cell => { if (cell.tagName !== want) swapTag(cell, want); });
        }
        window._tableSelectedCells = [];
    }

    /* ------------------------------------------------------------------ *
     *  Gallery modal
     * ------------------------------------------------------------------ */
    const STORE_KEY = 'opub_tbl_style';
    const TILE_REF_W = 330;

    const S = { design: 'banded', palette: 'teal', cat: 'All', q: '', content: 'blank', rows: 4, cols: 3, header: true, banded: true, mode: 'insert' };
    try {
        const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
        if (saved && DESIGNS.some(d => d.id === saved.design)) S.design = saved.design;
        if (saved && PALETTES.some(p => p.id === saved.palette)) S.palette = saved.palette;
    } catch (e) { /* ignore corrupt storage */ }

    const designById = id => DESIGNS.find(d => d.id === id) || DESIGNS[0];
    const paletteById = id => PALETTES.find(p => p.id === id) || PALETTES[0];
    const cfg = extra => Object.assign({
        design: S.design, palette: S.palette, rows: S.rows, cols: S.cols,
        header: S.header, banded: S.banded, content: S.content
    }, extra || {});

    function getSelectedTable() {
        const el = (typeof state !== 'undefined' && state) ? state.selectedEl : null;
        return (el && el.querySelector) ? el.querySelector('table') : null;
    }
    function persist() {
        try { localStorage.setItem(STORE_KEY, JSON.stringify({ design: S.design, palette: S.palette })); } catch (e) { /* ignore */ }
    }

    function insertWidth(cols) { return clamp(cols * 110, 320, 700); }

    function doInsert() {
        if (typeof createWrapper !== 'function') { alert('Error: Core layout engine not found.'); return; }
        const el = createWrapper(buildTable(cfg()));
        el.setAttribute('data-type', 'table');
        const w = insertWidth(S.cols);
        el.style.width = w + 'px';

        const tbl = el.querySelector('table');
        let h = Math.max(60, S.rows * 36);
        if (tbl) {
            const probe = tbl.cloneNode(true);
            probe.style.cssText = `position:absolute;visibility:hidden;left:-9999px;top:0;height:auto;width:${w}px`;
            document.body.appendChild(probe);
            h = Math.max(60, probe.offsetHeight + 2);
            document.body.removeChild(probe);
        }
        el.style.height = h + 'px';

        // Replace the default 200x100 history snapshot with the correctly sized one.
        if (typeof state !== 'undefined' && state.history && state.history.length > 0) {
            state.history.pop();
            state.historyIndex--;
            if (typeof pushHistory === 'function') pushHistory();
        }
        persist();
    }

    function doApply() {
        const tbl = getSelectedTable();
        if (!tbl) return false;
        applyToTable(tbl, cfg());
        if (typeof pushHistory === 'function') pushHistory();
        if (typeof updateThumbnails === 'function') updateThumbnails();
        persist();
        return true;
    }
    const primaryAction = () => { if (S.mode === 'apply' && getSelectedTable()) doApply(); else doInsert(); };

    // ---- modal markup ----
    function swatchHTML(p) {
        const bg = p.dark
            ? `linear-gradient(135deg,${p.v.h} 50%,${p.base} 50%)`
            : `linear-gradient(135deg,${p.v.h} 50%,${p.v.b} 50%)`;
        return `<div class="optm-sw${p.id === S.palette ? ' sel' : ''}" role="button" tabindex="0" data-pal="${p.id}" title="${p.name}" style="background:${bg}"></div>`;
    }
    function paletteStripHTML() {
        const light = PALETTES.filter(p => !p.dark).map(swatchHTML).join('');
        const dark = PALETTES.filter(p => p.dark).map(swatchHTML).join('');
        return light + '<span class="optm-sw-div"></span>' + dark;
    }
    function tileHTML(d) {
        const tb = buildTable({
            design: d.id, palette: S.palette, rows: 4, cols: 3, header: S.header,
            banded: S.banded, content: 'sample', preview: true
        });
        return `<div class="optm-tile${d.id === S.design ? ' sel' : ''}" role="button" tabindex="0" data-design="${d.id}" title="${d.name}">
            <div class="optm-tile-pv"><div class="optm-tile-scale">${tb}</div></div>
            <div class="optm-tile-name">${d.name}</div>
            <div class="optm-tile-cat">${d.cat}</div>
            <span class="optm-check"><i class="fas fa-check"></i></span>
        </div>`;
    }
    function modalHTML() {
        const cats = CATEGORIES.map(c => `<div class="optm-chip${c === S.cat ? ' on' : ''}" role="button" tabindex="0" data-cat="${c}">${c}</div>`).join('');
        const contents = CONTENT.filter(c => !c.hidden).map(c =>
            `<div class="optm-chip${c.id === S.content ? ' on' : ''}" role="button" tabindex="0" data-content="${c.id}">${c.name}</div>`).join('');
        return `
<div class="optm" id="optm-root">
  <div class="optm-main">
    <div class="optm-top">
      <div class="optm-search"><i class="fas fa-search"></i>
        <input type="text" id="optm-search" placeholder="Search ${DESIGNS.length} designs..." autocomplete="off" spellcheck="false">
      </div>
      <div class="optm-chips" id="optm-cats">${cats}</div>
      <div>
        <div class="optm-label-row"><span class="optm-label">Colour</span><span class="optm-sub" id="optm-pal-name"></span></div>
        <div class="optm-pal" id="optm-pal">${paletteStripHTML()}</div>
      </div>
    </div>
    <div class="optm-grid" id="optm-grid"></div>
  </div>
  <div class="optm-side">
    <div class="optm-side-scroll">
      <div>
        <div class="optm-label-row"><span class="optm-label">Preview</span><span class="optm-sub" id="optm-sel-name"></span></div>
        <div class="optm-pv" id="optm-pv"><div class="optm-pv-box" id="optm-pv-box"><div class="optm-pv-fit" id="optm-pv-fit"></div></div></div>
      </div>
      <div class="optm-insert-only">
        <div class="optm-label">Contents</div>
        <div class="optm-chips" id="optm-content">${contents}</div>
      </div>
      <div class="optm-row optm-insert-only">
        <label class="optm-field"><span class="optm-label">Rows</span><input type="number" id="optm-rows" min="1" max="60" value="${S.rows}"></label>
        <label class="optm-field"><span class="optm-label">Columns</span><input type="number" id="optm-cols" min="1" max="16" value="${S.cols}"></label>
      </div>
      <div class="optm-opts">
        <div class="optm-label">Options</div>
        <label class="optm-switch"><input type="checkbox" id="optm-header" ${S.header ? 'checked' : ''}><span>Header row</span></label>
        <label class="optm-switch"><input type="checkbox" id="optm-banded" ${S.banded ? 'checked' : ''}><span>Banded rows</span></label>
      </div>
    </div>
  </div>
  <div class="optm-foot">
    <span class="optm-count" id="optm-count"></span>
    <div class="optm-actions">
      <button type="button" class="btn-secondary" data-act="cancel">Cancel</button>
      <button type="button" class="btn-secondary" data-act="apply" id="optm-apply">Apply to Selected Table</button>
      <button type="button" class="btn-primary" data-act="insert" id="optm-insert">Insert Table</button>
    </div>
  </div>
</div>`;
    }

    // ---- modal behaviour ----
    function openModal(opts) {
        injectCSS();
        if (typeof DialogSystem === 'undefined') return;
        const hasTable = !!getSelectedTable();
        S.mode = (opts && opts.mode === 'apply' && hasTable) ? 'apply' : 'insert';
        S.q = '';
        S.cat = 'All';

        DialogSystem.show('Styled Tables', modalHTML(), primaryAction, false, S.mode === 'apply' ? 'Apply' : 'Insert Table');
        const box = document.getElementById('custom-dialog-box');
        if (!box) return;
        box.classList.add('op-tbl-modal');

        const root = box.querySelector('#optm-root');
        const $ = id => root.querySelector('#' + id);
        const grid = $('optm-grid'), pv = $('optm-pv'), box2 = $('optm-pv-box'), fit = $('optm-pv-fit');

        root.classList.toggle('optm-apply-mode', S.mode === 'apply');
        $('optm-apply').style.display = hasTable ? '' : 'none';
        $('optm-apply').className = S.mode === 'apply' ? 'btn-primary' : 'btn-secondary';
        $('optm-insert').className = S.mode === 'apply' ? 'btn-secondary' : 'btn-primary';

        function layoutTiles() {
            const tilePv = grid.querySelector('.optm-tile-pv');
            if (!tilePv) return;
            grid.style.setProperty('--optm-k', Math.max(0.2, (tilePv.clientWidth - 20) / TILE_REF_W).toFixed(3));
        }
        function renderGrid() {
            const q = S.q.trim().toLowerCase();
            const list = DESIGNS.filter(d => (S.cat === 'All' || d.cat === S.cat) && (!q || (d.name + ' ' + d.cat).toLowerCase().includes(q)));
            grid.innerHTML = list.length ? list.map(tileHTML).join('') : '<div class="optm-empty">No designs match your search.</div>';
            $('optm-count').textContent = `${list.length} of ${DESIGNS.length} designs  \u00b7  ${PALETTES.length} colours`;
            layoutTiles();
        }
        function renderPreview() {
            const c = cfg({ preview: true });
            const refW = insertWidth(clampInt(S.cols, 1, 16));
            fit.innerHTML = buildTable(c);
            fit.style.width = refW + 'px';
            const k = Math.min(1, Math.max(0.2, (box2.clientWidth || 280) / refW));
            fit.style.transform = `scale(${k})`;
            box2.style.height = Math.ceil(fit.offsetHeight * k) + 'px';
            $('optm-sel-name').textContent = designById(S.design).name;
            $('optm-pal-name').textContent = paletteById(S.palette).name;
        }
        function recolorTiles() {
            grid.querySelectorAll('.optm-tile').forEach(t => {
                const tb = t.querySelector('table');
                if (tb) tb.className = tableClasses(t.dataset.design, S.palette, S.banded, S.header).join(' ');
            });
        }
        function markSelected(container, attr, value) {
            container.querySelectorAll('[' + attr + ']').forEach(n => n.classList.toggle(attr.indexOf('pal') >= 0 || attr.indexOf('design') >= 0 ? 'sel' : 'on', n.getAttribute(attr) === value));
        }
        function setRowsCols() {
            $('optm-rows').value = S.rows;
            $('optm-cols').value = S.cols;
        }
        const finish = fn => { fn(); DialogSystem.close(); };

        // ---- delegated events ----
        root.addEventListener('click', e => {
            const t = e.target;
            const tile = t.closest('[data-design]');
            const sw = t.closest('[data-pal]');
            const cat = t.closest('[data-cat]');
            const content = t.closest('[data-content]');
            const act = t.closest('[data-act]');

            if (tile) {
                S.design = tile.dataset.design;
                markSelected(grid, 'data-design', S.design);
                renderPreview();
            } else if (sw) {
                S.palette = sw.dataset.pal;
                markSelected($('optm-pal'), 'data-pal', S.palette);
                recolorTiles();
                renderPreview();
            } else if (cat) {
                S.cat = cat.dataset.cat;
                markSelected($('optm-cats'), 'data-cat', S.cat);
                renderGrid();
            } else if (content) {
                S.content = content.dataset.content;
                markSelected($('optm-content'), 'data-content', S.content);
                const ct = findContent(S.content);
                if (ct.rows) { S.rows = naturalRows(ct); S.cols = ct.head.length; setRowsCols(); }
                renderPreview();
            } else if (act) {
                const a = act.dataset.act;
                if (a === 'cancel') DialogSystem.close();
                else if (a === 'insert') finish(doInsert);
                else if (a === 'apply') finish(doApply);
            }
        });
        root.addEventListener('dblclick', e => {
            if (e.target.closest('[data-design]')) finish(primaryAction);
        });
        root.addEventListener('keydown', e => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role="button"]') && !e.target.matches('button')) {
                e.preventDefault();
                e.target.click();
            }
        });

        const search = $('optm-search');
        search.addEventListener('input', () => { S.q = search.value; renderGrid(); });
        search.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); } });

        const numInput = (id, key, lo, hi) => {
            const inp = $(id);
            inp.addEventListener('input', () => {
                const n = parseInt(inp.value, 10);
                if (!isNaN(n)) { S[key] = clamp(n, lo, hi); renderPreview(); }
            });
            inp.addEventListener('blur', () => { inp.value = S[key]; });
        };
        numInput('optm-rows', 'rows', 1, 60);
        numInput('optm-cols', 'cols', 1, 16);

        $('optm-header').addEventListener('change', e => { S.header = e.target.checked; renderGrid(); renderPreview(); });
        $('optm-banded').addEventListener('change', e => { S.banded = e.target.checked; recolorTiles(); renderPreview(); });

        renderGrid();
        renderPreview();
        requestAnimationFrame(() => {
            layoutTiles();
            renderPreview();
            const sel = grid.querySelector('.optm-tile.sel');
            if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
        });
    }

    /* ------------------------------------------------------------------ *
     *  Public API
     * ------------------------------------------------------------------ */
    injectCSS();
    window.openTableTemplatesModal = openModal;
    window.OpTableStyles = {
        designs: DESIGNS, palettes: PALETTES, content: CONTENT,
        build: buildTable, apply: applyToTable, open: openModal
    };
})();
