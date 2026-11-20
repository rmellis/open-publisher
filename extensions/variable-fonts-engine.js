// Open Publisher Variable Fonts Engine (v5.23.0)
// Supports Google Variable Fonts CSS2, OpenType fvar/name Binary Parsing,
// Auto/Manual Optical Size (opsz), Named Instances, Hidden Axes, 2D Matrix,
// IndexedDB Custom Font Persistence, .opub Embedding, and High-DPI Print/Export Baking.
(function(window) {
    'use strict';

    const STORAGE_PRESETS_KEY = 'opub_vf_user_presets_v1';
    const IDB_NAME = 'OpenPublisherVariableFontsDB';
    const IDB_STORE = 'fonts';
    const IDB_VERSION = 1;

    // Metadata for all 5 registered OpenType axes + custom designer axes
    const AXIS_META = {
        wght: { name: 'Weight', unit: '', step: 1, fineStep: 0.1, registered: true, desc: 'Stroke thickness from hairline to extra black.' },
        wdth: { name: 'Width', unit: '%', step: 0.5, fineStep: 0.1, registered: true, desc: 'Horizontal glyph width from condensed to expanded.' },
        opsz: { name: 'Optical Size', unit: 'pt', step: 0.5, fineStep: 0.1, registered: true, desc: 'Balances stroke contrast and spacing for small vs display sizes.' },
        slnt: { name: 'Slant', unit: 'deg', step: 0.5, fineStep: 0.1, registered: true, desc: 'Oblique glyph angle in degrees.' },
        ital: { name: 'Italic', unit: '', step: 1, fineStep: 0.05, registered: true, desc: 'Switches or interpolates between roman and italic forms.' },
        GRAD: { name: 'Grade', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Adjusts optical ink weight without changing character advance widths.' },
        CASL: { name: 'Casual', unit: '', step: 0.05, fineStep: 0.01, registered: false, desc: 'Interpolates between rigid linear and expressive brush strokes.' },
        CRSV: { name: 'Cursive', unit: '', step: 0.1, fineStep: 0.02, registered: false, desc: 'Controls italic/cursive glyph substitutions and connected styling.' },
        MONO: { name: 'Monospace', unit: '', step: 0.05, fineStep: 0.01, registered: false, desc: 'Transitions proportions from proportional sans to fixed-width code.' },
        SOFT: { name: 'Softness', unit: '%', step: 1, fineStep: 0.2, registered: false, desc: 'Softens sharp serif corners and terminals.' },
        WONK: { name: 'Wonky', unit: '', step: 1, fineStep: 0.1, registered: false, desc: 'Enables playful tilted glyphs and ball terminals.' },
        ARRR: { name: 'AR Readability', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Optimizes spacing and letter clarity for extended viewing distances.' },
        BLED: { name: 'Bleed', unit: '%', step: 1, fineStep: 0.5, registered: false, desc: 'Controls retro CRT phosphor or pixel ink bleed intensity.' },
        BNCE: { name: 'Bounce', unit: '', step: 2, fineStep: 0.5, registered: false, desc: 'Playful vertical baseline bounce of individual characters.' },
        CTRS: { name: 'Contrast', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Stroke contrast between thick stems and thin hairlines.' },
        EDPT: { name: 'Depth', unit: '', step: 2, fineStep: 0.5, registered: false, desc: '3D isometric extrusion depth.' },
        EHLT: { name: 'Highlight', unit: '', step: 1, fineStep: 0.2, registered: false, desc: '3D top-face bevel highlight height.' },
        ELGR: { name: 'Element Grid', unit: '', step: 0.05, fineStep: 0.01, registered: false, desc: 'Modular pixel element grid density.' },
        ELSH: { name: 'Element Shape', unit: '', step: 1, fineStep: 0.2, registered: false, desc: 'Morphs modular pixel/dot shapes (squares, circles, diamonds, stars).' },
        ELXP: { name: 'Element Exposure', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Expands or contracts modular dot/pixel exposure.' },
        HEXP: { name: 'Hyper Expansion', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Expands glyph counters and horizontal proportions for readability.' },
        INFM: { name: 'Informality', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Transitions from neat handwriting to expressive informal strokes.' },
        JITT: { name: 'Jitter', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Adds playful organic pixel jitter across glyph edges.' },
        MORF: { name: 'Morph', unit: '', step: 1, fineStep: 0.2, registered: false, desc: 'Morphs expressive display silhouettes and organic shapes.' },
        SCAN: { name: 'Scanlines', unit: '', step: 2, fineStep: 0.5, registered: false, desc: 'Controls CRT horizontal scanline thickness and separation.' },
        SHLN: { name: 'Shadow Length', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Adjusts 3D extruded shadow depth and drop.' },
        SPAC: { name: 'Spacing', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Controls expressive horizontal tracking and spacing.' },
        SZP1: { name: 'Layer 1 Size', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Primary color ink layer element size.' },
        SZP2: { name: 'Layer 2 Size', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Secondary color ink layer element size.' },
        XELA: { name: 'X Convergence', unit: '', step: 2, fineStep: 0.5, registered: false, desc: 'Horizontal CRT RGB color-channel convergence offset.' },
        YELA: { name: 'Y Convergence', unit: '', step: 2, fineStep: 0.5, registered: false, desc: 'Vertical CRT RGB color-channel convergence offset.' },
        XPN1: { name: 'Layer 1 X Offset', unit: '', step: 2, fineStep: 0.5, registered: false, desc: 'Horizontal position offset for ink layer 1.' },
        XPN2: { name: 'Layer 2 X Offset', unit: '', step: 2, fineStep: 0.5, registered: false, desc: 'Horizontal position offset for ink layer 2.' },
        YPN1: { name: 'Layer 1 Y Offset', unit: '', step: 2, fineStep: 0.5, registered: false, desc: 'Vertical position offset for ink layer 1.' },
        YPN2: { name: 'Layer 2 Y Offset', unit: '', step: 2, fineStep: 0.5, registered: false, desc: 'Vertical position offset for ink layer 2.' },
        XROT: { name: 'X Rotation', unit: 'deg', step: 1, fineStep: 0.2, registered: false, desc: '3D horizontal perspective rotation angle.' },
        YROT: { name: 'Y Rotation', unit: 'deg', step: 1, fineStep: 0.2, registered: false, desc: '3D vertical perspective rotation angle.' },
        YEAR: { name: 'Glacier Year', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Arctic sea-ice melt progression from 1979 (thick) to 2050 (thin).' },
        XOPQ: { name: 'Thick Stroke', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Parametric opaque stroke width in vertical stems.' },
        YOPQ: { name: 'Thin Stroke', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Parametric opaque stroke thickness in horizontal hairlines.' },
        XTRA: { name: 'Counter Width', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Adjusts transparent inner white space (counters) inside glyphs.' },
        YTAS: { name: 'Ascender Height', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Controls lowercase ascender height above the cap line.' },
        YTDE: { name: 'Descender Depth', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Controls depth of descending strokes below baseline.' },
        YTFI: { name: 'Figure Height', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Controls height of numerals.' },
        YTLC: { name: 'Lowercase Height', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Adjusts lowercase x-height.' },
        YTUC: { name: 'Uppercase Height', unit: '', step: 1, fineStep: 0.5, registered: false, desc: 'Adjusts capital letter cap height.' },
        FILL: { name: 'Fill', unit: '', step: 0.05, fineStep: 0.01, registered: false, desc: 'Adjusts interior fill density.' },
        ROND: { name: 'Roundness', unit: '', step: 1, fineStep: 0.2, registered: false, desc: 'Rounds stroke corners and terminals.' },
        FLAR: { name: 'Flare', unit: '', step: 1, fineStep: 0.2, registered: false, desc: 'Controls terminal serif flaring.' },
        VOLM: { name: 'Volume', unit: '', step: 1, fineStep: 0.2, registered: false, desc: 'Controls visual weight and ink trap fill.' },
        SHRP: { name: 'Sharpness', unit: '', step: 1, fineStep: 0.2, registered: false, desc: 'Controls corner sharpness.' }
    };

    function stdWeightInstances(minW, maxW, extra) {
        const stops = [
            { name: 'Thin', wght: 100 },
            { name: 'ExtraLight', wght: 200 },
            { name: 'Light', wght: 300 },
            { name: 'Regular', wght: 400 },
            { name: 'Medium', wght: 500 },
            { name: 'SemiBold', wght: 600 },
            { name: 'Bold', wght: 700 },
            { name: 'ExtraBold', wght: 800 },
            { name: 'Black', wght: 900 },
            { name: 'ExtraBlack', wght: 1000 }
        ];
        return stops
            .filter(s => s.wght >= minW && s.wght <= maxW)
            .map(s => ({ name: s.name, coords: Object.assign({ wght: s.wght }, extra || {}) }));
    }

    // Curated Google Variable Fonts Catalog (129 live-verified families across 101 multi-axis/custom-axis and continuous weight fonts)
    const CATALOG = [
        {
            family: 'Roboto Flex',
            category: 'sans',
            gfParamAxes: true,
            axes: [
                { tag: 'wght', min: 100, max: 1000, default: 400 },
                { tag: 'wdth', min: 25, max: 151, default: 100 },
                { tag: 'opsz', min: 8, max: 144, default: 14 },
                { tag: 'slnt', min: -10, max: 0, default: 0 },
                { tag: 'GRAD', min: -200, max: 150, default: 0 },
                { tag: 'XOPQ', min: 27, max: 175, default: 96, hidden: true },
                { tag: 'XTRA', min: 323, max: 603, default: 468, hidden: true },
                { tag: 'YOPQ', min: 25, max: 135, default: 79, hidden: true },
                { tag: 'YTAS', min: 649, max: 854, default: 750, hidden: true },
                { tag: 'YTDE', min: -305, max: -98, default: -203, hidden: true },
                { tag: 'YTFI', min: 560, max: 788, default: 738, hidden: true },
                { tag: 'YTLC', min: 416, max: 570, default: 514, hidden: true },
                { tag: 'YTUC', min: 528, max: 760, default: 712, hidden: true }
            ],
            instances: [
                ...stdWeightInstances(100, 1000, { wdth: 100, opsz: 14, slnt: 0, GRAD: 0 }),
                { name: 'Condensed Light', coords: { wght: 300, wdth: 75, opsz: 14, slnt: 0, GRAD: 0 } },
                { name: 'Condensed Bold', coords: { wght: 700, wdth: 75, opsz: 14, slnt: 0, GRAD: 0 } },
                { name: 'Expanded Bold', coords: { wght: 700, wdth: 135, opsz: 24, slnt: 0, GRAD: 0 } },
                { name: 'Display Black', coords: { wght: 900, wdth: 105, opsz: 72, slnt: 0, GRAD: 25 } }
            ]
        },
        {
            family: 'Fraunces',
            category: 'serif',
            axes: [
                { tag: 'opsz', min: 9, max: 144, default: 14 },
                { tag: 'wght', min: 100, max: 900, default: 400 },
                { tag: 'SOFT', min: 0, max: 100, default: 0 },
                { tag: 'WONK', min: 0, max: 1, default: 1 }
            ],
            instances: [
                ...stdWeightInstances(100, 900, { opsz: 14, SOFT: 0, WONK: 1 }),
                { name: 'Soft Editorial', coords: { wght: 400, opsz: 24, SOFT: 80, WONK: 1 } },
                { name: 'Display Soft Black', coords: { wght: 900, opsz: 72, SOFT: 100, WONK: 1 } },
                { name: 'Crisp Formal Serif', coords: { wght: 600, opsz: 36, SOFT: 0, WONK: 0 } }
            ]
        },
        {
            family: 'Recursive',
            category: 'mono',
            axes: [
                { tag: 'wght', min: 300, max: 1000, default: 400 },
                { tag: 'slnt', min: -15, max: 0, default: 0 },
                { tag: 'CASL', min: 0, max: 1, default: 0 },
                { tag: 'CRSV', min: 0, max: 1, default: 0.5 },
                { tag: 'MONO', min: 0, max: 1, default: 0 }
            ],
            instances: [
                { name: 'Sans Linear Regular', coords: { wght: 400, slnt: 0, CASL: 0, CRSV: 0, MONO: 0 } },
                { name: 'Sans Casual Bold', coords: { wght: 700, slnt: 0, CASL: 1, CRSV: 0.5, MONO: 0 } },
                { name: 'Sans Casual Italic', coords: { wght: 400, slnt: -15, CASL: 1, CRSV: 1, MONO: 0 } },
                { name: 'Mono Linear Code', coords: { wght: 400, slnt: 0, CASL: 0, CRSV: 0, MONO: 1 } },
                { name: 'Mono Casual Heavy', coords: { wght: 800, slnt: -10, CASL: 1, CRSV: 1, MONO: 1 } },
                { name: 'Ultra Black Poster', coords: { wght: 1000, slnt: -8, CASL: 0.85, CRSV: 0.5, MONO: 0 } }
            ]
        },
        {
            family: 'Roboto Serif',
            category: 'serif',
            axes: [
                { tag: 'opsz', min: 8, max: 144, default: 14 },
                { tag: 'wdth', min: 50, max: 150, default: 100 },
                { tag: 'wght', min: 100, max: 900, default: 400 },
                { tag: 'GRAD', min: -50, max: 100, default: 0 }
            ],
            instances: [
                ...stdWeightInstances(100, 900, { opsz: 14, wdth: 100, GRAD: 0 }),
                { name: 'Micro Caption', coords: { wght: 400, wdth: 105, opsz: 8, GRAD: 15 } },
                { name: 'Editorial Headline', coords: { wght: 700, wdth: 95, opsz: 72, GRAD: 0 } },
                { name: 'Condensed Serif Bold', coords: { wght: 700, wdth: 65, opsz: 24, GRAD: 0 } }
            ]
        },
        {
            family: 'Bricolage Grotesque',
            category: 'display',
            axes: [
                { tag: 'opsz', min: 12, max: 96, default: 14 },
                { tag: 'wdth', min: 75, max: 100, default: 100 },
                { tag: 'wght', min: 200, max: 800, default: 400 }
            ],
            instances: [
                ...stdWeightInstances(200, 800, { opsz: 14, wdth: 100 }),
                { name: 'Compact Display Bold', coords: { wght: 800, opsz: 72, wdth: 75 } },
                { name: 'Wide Title Medium', coords: { wght: 500, opsz: 48, wdth: 100 } }
            ]
        },
        {
            family: 'Merriweather',
            category: 'serif',
            axes: [
                { tag: 'opsz', min: 18, max: 144, default: 18 },
                { tag: 'wdth', min: 87, max: 112, default: 100 },
                { tag: 'wght', min: 300, max: 900, default: 400 }
            ],
            instances: [
                ...stdWeightInstances(300, 900, { opsz: 18, wdth: 100 }),
                { name: 'Book Narrow', coords: { wght: 400, opsz: 18, wdth: 87 } },
                { name: 'Wide Headline', coords: { wght: 800, opsz: 72, wdth: 112 } }
            ]
        },
        {
            family: 'Inter',
            category: 'sans',
            axes: [
                { tag: 'opsz', min: 14, max: 32, default: 14 },
                { tag: 'wght', min: 100, max: 900, default: 400 }
            ],
            instances: [
                ...stdWeightInstances(100, 900, { opsz: 14 }),
                { name: 'Display Bold', coords: { wght: 700, opsz: 32 } }
            ]
        },
        {
            family: 'DM Sans',
            category: 'sans',
            axes: [
                { tag: 'opsz', min: 9, max: 40, default: 14 },
                { tag: 'wght', min: 100, max: 1000, default: 400 }
            ],
            instances: [
                ...stdWeightInstances(100, 1000, { opsz: 14 }),
                { name: 'Display Heavy', coords: { wght: 900, opsz: 40 } }
            ]
        },
        {
            family: 'Bodoni Moda',
            category: 'serif',
            axes: [
                { tag: 'opsz', min: 6, max: 96, default: 14 },
                { tag: 'wght', min: 400, max: 900, default: 400 }
            ],
            instances: [
                ...stdWeightInstances(400, 900, { opsz: 14 }),
                { name: 'Fashion Display', coords: { wght: 700, opsz: 72 } }
            ]
        },
        {
            family: 'Newsreader',
            category: 'serif',
            axes: [
                { tag: 'opsz', min: 6, max: 72, default: 14 },
                { tag: 'wght', min: 200, max: 800, default: 400 }
            ],
            instances: [
                ...stdWeightInstances(200, 800, { opsz: 14 }),
                { name: 'Newspaper Deck', coords: { wght: 600, opsz: 48 } }
            ]
        },
        {
            family: 'Source Serif 4',
            category: 'serif',
            axes: [
                { tag: 'opsz', min: 8, max: 60, default: 14 },
                { tag: 'wght', min: 200, max: 900, default: 400 }
            ],
            instances: [
                ...stdWeightInstances(200, 900, { opsz: 14 }),
                { name: 'Subhead Display', coords: { wght: 700, opsz: 48 } }
            ]
        },
        {
            family: 'Open Sans',
            category: 'sans',
            axes: [
                { tag: 'wdth', min: 75, max: 100, default: 100 },
                { tag: 'wght', min: 300, max: 800, default: 400 }
            ],
            instances: [
                ...stdWeightInstances(300, 800, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wght: 700, wdth: 75 } }
            ]
        },
        {
            family: 'Noto Sans',
            category: 'sans',
            axes: [
                { tag: 'wdth', min: 62.5, max: 100, default: 100 },
                { tag: 'wght', min: 100, max: 900, default: 400 }
            ],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'ExtraCondensed Bold', coords: { wght: 700, wdth: 62.5 } }
            ]
        },
        {
            family: 'Archivo',
            category: 'sans',
            axes: [
                { tag: 'wdth', min: 62, max: 125, default: 100 },
                { tag: 'wght', min: 100, max: 900, default: 400 }
            ],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Condensed Black', coords: { wght: 900, wdth: 65 } },
                { name: 'Expanded Bold', coords: { wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Inconsolata',
            category: 'mono',
            axes: [
                { tag: 'wdth', min: 50, max: 200, default: 100 },
                { tag: 'wght', min: 200, max: 900, default: 400 }
            ],
            instances: [
                ...stdWeightInstances(200, 900, { wdth: 100 }),
                { name: 'UltraCondensed', coords: { wght: 400, wdth: 50 } },
                { name: 'UltraExpanded Bold', coords: { wght: 700, wdth: 200 } }
            ]
        },
        {
            family: 'Cabin',
            category: 'sans',
            axes: [
                { tag: 'wdth', min: 75, max: 100, default: 100 },
                { tag: 'wght', min: 400, max: 700, default: 400 }
            ],
            instances: stdWeightInstances(400, 700, { wdth: 100 })
        },
        {
            family: 'Signika',
            category: 'sans',
            axes: [
                { tag: 'wght', min: 300, max: 700, default: 400 },
                { tag: 'GRAD', min: -30, max: 0, default: 0 }
            ],
            instances: stdWeightInstances(300, 700, { GRAD: 0 })
        },
        { family: 'Playfair Display', category: 'serif', axes: [{ tag: 'wght', min: 400, max: 900, default: 400 }], instances: stdWeightInstances(400, 900) },
        { family: 'Montserrat', category: 'sans', axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }], instances: stdWeightInstances(100, 900) },
        { family: 'Plus Jakarta Sans', category: 'sans', axes: [{ tag: 'wght', min: 200, max: 800, default: 400 }], instances: stdWeightInstances(200, 800) },
        { family: 'Work Sans', category: 'sans', axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }], instances: stdWeightInstances(100, 900) },
        { family: 'Oswald', category: 'display', axes: [{ tag: 'wght', min: 200, max: 700, default: 400 }], instances: stdWeightInstances(200, 700) },
        { family: 'Raleway', category: 'sans', axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }], instances: stdWeightInstances(100, 900) },
        { family: 'Nunito', category: 'sans', axes: [{ tag: 'wght', min: 200, max: 1000, default: 400 }], instances: stdWeightInstances(200, 1000) },
        { family: 'Quicksand', category: 'sans', axes: [{ tag: 'wght', min: 300, max: 700, default: 400 }], instances: stdWeightInstances(300, 700) },
        { family: 'JetBrains Mono', category: 'mono', axes: [{ tag: 'wght', min: 100, max: 800, default: 400 }], instances: stdWeightInstances(100, 800) },
        { family: 'Space Grotesk', category: 'display', axes: [{ tag: 'wght', min: 300, max: 700, default: 400 }], instances: stdWeightInstances(300, 700) },
        { family: 'Bitter', category: 'serif', axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }], instances: stdWeightInstances(100, 900) },
        { family: 'Lora', category: 'serif', axes: [{ tag: 'wght', min: 400, max: 700, default: 400 }], instances: stdWeightInstances(400, 700) },
        { family: 'EB Garamond', category: 'serif', axes: [{ tag: 'wght', min: 400, max: 800, default: 400 }], instances: stdWeightInstances(400, 800) },
        { family: 'Cinzel', category: 'serif', axes: [{ tag: 'wght', min: 400, max: 900, default: 400 }], instances: stdWeightInstances(400, 900) },
        { family: 'Comfortaa', category: 'display', axes: [{ tag: 'wght', min: 300, max: 700, default: 400 }], instances: stdWeightInstances(300, 700) },
        { family: 'Outfit', category: 'sans', axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }], instances: stdWeightInstances(100, 900) },
        { family: 'Manrope', category: 'sans', axes: [{ tag: 'wght', min: 200, max: 800, default: 400 }], instances: stdWeightInstances(200, 800) },
        { family: 'Rubik', category: 'sans', axes: [{ tag: 'wght', min: 300, max: 900, default: 400 }], instances: stdWeightInstances(300, 900) },
        { family: 'Syne', category: 'display', axes: [{ tag: 'wght', min: 400, max: 800, default: 400 }], instances: stdWeightInstances(400, 800) },
        { family: 'Crimson Pro', category: 'serif', axes: [{ tag: 'wght', min: 200, max: 900, default: 400 }], instances: stdWeightInstances(200, 900) },
        { family: 'Exo 2', category: 'sans', axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }], instances: stdWeightInstances(100, 900) },
        { family: 'Dosis', category: 'sans', axes: [{ tag: 'wght', min: 200, max: 800, default: 400 }], instances: stdWeightInstances(200, 800) },
        { family: 'Caveat', category: 'handwriting', axes: [{ tag: 'wght', min: 400, max: 700, default: 400 }], instances: stdWeightInstances(400, 700) },
        { family: 'Roboto Slab', category: 'serif', axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }], instances: stdWeightInstances(100, 900) },
        { family: 'Source Sans 3', category: 'sans', axes: [{ tag: 'wght', min: 200, max: 900, default: 400 }], instances: stdWeightInstances(200, 900) },
        { family: 'Source Code Pro', category: 'mono', axes: [{ tag: 'wght', min: 200, max: 900, default: 400 }], instances: stdWeightInstances(200, 900) },
        { family: 'Vollkorn', category: 'serif', axes: [{ tag: 'wght', min: 400, max: 900, default: 400 }], instances: stdWeightInstances(400, 900) },
        { family: 'Sora', category: 'sans', axes: [{ tag: 'wght', min: 100, max: 800, default: 400 }], instances: stdWeightInstances(100, 800) },
        {
            family: 'Bitcount Ink',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'slnt', min: -8, max: 0, default: 0 }, { tag: 'CRSV', min: 0, max: 1, default: 0.5 }, { tag: 'ELSH', min: 0, max: 100, default: 0 }, { tag: 'ELXP', min: 0, max: 100, default: 0 }, { tag: 'SZP1', min: 0, max: 100, default: 0 }, { tag: 'SZP2', min: 0, max: 100, default: 0 }, { tag: 'XPN1', min: -100, max: 100, default: 0 }, { tag: 'XPN2', min: -100, max: 100, default: 0 }, { tag: 'YPN1', min: -100, max: 100, default: 0 }, { tag: 'YPN2', min: -100, max: 100, default: 0 }],
            instances: [
                { name: 'Classic Pixel', coords: { wght: 400, slnt: 0, CRSV: 0.5, ELSH: 0, ELXP: 0, SZP1: 0, SZP2: 0, XPN1: 0, XPN2: 0, YPN1: 0, YPN2: 0 } },
                { name: 'Round Dots Heavy', coords: { wght: 800, slnt: 0, CRSV: 0.5, ELSH: 100, ELXP: 40, SZP1: 50, SZP2: 20, XPN1: 15, XPN2: -15, YPN1: 15, YPN2: -15 } },
                { name: 'Italic Chromatic Shift', coords: { wght: 700, slnt: -8, CRSV: 1, ELSH: 50, ELXP: 25, SZP1: 65, SZP2: 65, XPN1: 45, XPN2: -45, YPN1: -25, YPN2: 25 } }
            ]
        },
        {
            family: 'Bitcount',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'slnt', min: -8, max: 0, default: 0 }, { tag: 'CRSV', min: 0, max: 1, default: 0.5 }, { tag: 'ELSH', min: 0, max: 100, default: 0 }, { tag: 'ELXP', min: 0, max: 100, default: 0 }],
            instances: [
                { name: 'Square Pixel', coords: { wght: 400, slnt: 0, CRSV: 0.5, ELSH: 0, ELXP: 0 } },
                { name: 'Circle Grid Bold', coords: { wght: 700, slnt: 0, CRSV: 0.5, ELSH: 100, ELXP: 30 } },
                { name: 'Slanted Script Black', coords: { wght: 900, slnt: -8, CRSV: 1, ELSH: 60, ELXP: 50 } }
            ]
        },
        {
            family: 'Bitcount Prop Single',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'slnt', min: -8, max: 0, default: 0 }, { tag: 'CRSV', min: 0, max: 1, default: 0.5 }, { tag: 'ELSH', min: 0, max: 100, default: 0 }, { tag: 'ELXP', min: 0, max: 100, default: 0 }],
            instances: [
                { name: 'Proportional Pixel', coords: { wght: 400, slnt: 0, CRSV: 0.5, ELSH: 0, ELXP: 0 } },
                { name: 'Rounded Bold', coords: { wght: 700, slnt: 0, CRSV: 0.5, ELSH: 100, ELXP: 25 } },
                { name: 'Slanted Retro Heavy', coords: { wght: 800, slnt: -8, CRSV: 1, ELSH: 40, ELXP: 60 } }
            ]
        },
        {
            family: 'Google Sans Flex',
            category: 'sans',
            axes: [{ tag: 'wght', min: 1, max: 1000, default: 400 }, { tag: 'wdth', min: 25, max: 151, default: 100 }, { tag: 'opsz', min: 1, max: 144, default: 18 }, { tag: 'slnt', min: -10, max: 0, default: 0 }, { tag: 'ROND', min: 0, max: 100, default: 0 }],
            instances: [
                { name: 'Rounded Soft', coords: { wght: 500, wdth: 100, opsz: 18, slnt: 0, ROND: 100 } },
                { name: 'Condensed Display', coords: { wght: 700, wdth: 65, opsz: 72, slnt: 0, ROND: 25 } },
                { name: 'Expanded Black', coords: { wght: 900, wdth: 140, opsz: 48, slnt: 0, ROND: 50 } },
                { name: 'Slanted Hairline', coords: { wght: 100, wdth: 100, opsz: 36, slnt: -10, ROND: 100 } }
            ]
        },
        {
            family: 'Tiny5',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 50, max: 200, default: 100 }, { tag: 'ROND', min: 0, max: 100, default: 0 }, { tag: 'BLED', min: 0, max: 100, default: 0 }, { tag: 'JITT', min: 0, max: 100, default: 0 }],
            instances: [
                { name: 'Crisp Pixel', coords: { wght: 400, wdth: 100, BLED: 0, JITT: 0, ROND: 0 } },
                { name: 'Rounded Bubble', coords: { wght: 600, wdth: 115, BLED: 0, JITT: 0, ROND: 100 } },
                { name: 'Jittery Glitch', coords: { wght: 700, wdth: 100, BLED: 35, JITT: 85, ROND: 20 } },
                { name: 'Wide Heavy Bleed', coords: { wght: 900, wdth: 175, BLED: 80, JITT: 15, ROND: 40 } }
            ]
        },
        {
            family: 'Commissioner',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'slnt', min: -12, max: 0, default: 0 }, { tag: 'FLAR', min: 0, max: 100, default: 0 }, { tag: 'VOLM', min: 0, max: 100, default: 0 }],
            instances: [
                ...stdWeightInstances(100, 900, { slnt: 0, FLAR: 0, VOLM: 0 }),
                { name: 'Classic Geometric', coords: { wght: 400, slnt: 0, FLAR: 0, VOLM: 0 } },
                { name: 'Flared Editorial', coords: { wght: 600, slnt: 0, FLAR: 100, VOLM: 30 } },
                { name: 'High Volume Display', coords: { wght: 800, slnt: 0, FLAR: 65, VOLM: 100 } },
                { name: 'Slanted Flared', coords: { wght: 500, slnt: -12, FLAR: 85, VOLM: 20 } }
            ]
        },
        {
            family: 'Geologica',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'slnt', min: -12, max: 0, default: 0 }, { tag: 'CRSV', min: 0, max: 1, default: 0 }, { tag: 'SHRP', min: 0, max: 100, default: 0 }],
            instances: [
                ...stdWeightInstances(100, 900, { slnt: 0, CRSV: 0, SHRP: 0 }),
                { name: 'Clean Geometric', coords: { wght: 400, slnt: 0, CRSV: 0, SHRP: 0 } },
                { name: 'Sharp Ink Traps', coords: { wght: 700, slnt: 0, CRSV: 0, SHRP: 100 } },
                { name: 'Cursive Oblique Bold', coords: { wght: 700, slnt: -12, CRSV: 1, SHRP: 50 } }
            ]
        },
        {
            family: 'Science Gothic',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 50, max: 200, default: 100 }, { tag: 'slnt', min: -10, max: 0, default: 0 }, { tag: 'CTRS', min: 0, max: 85, default: 0 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100, slnt: 0, CTRS: 0 }),
                { name: 'High Contrast Poster', coords: { wght: 700, wdth: 100, slnt: 0, CTRS: 85 } },
                { name: 'Ultra Wide Sci-Fi', coords: { wght: 600, wdth: 180, slnt: -6, CTRS: 40 } },
                { name: 'Narrow Heavy', coords: { wght: 900, wdth: 60, slnt: 0, CTRS: 20 } }
            ]
        },
        {
            family: 'Shantell Sans',
            category: 'handwriting',
            axes: [{ tag: 'wght', min: 300, max: 800, default: 400 }, { tag: 'BNCE', min: -100, max: 100, default: 0 }, { tag: 'INFM', min: 0, max: 100, default: 0 }, { tag: 'SPAC', min: 0, max: 100, default: 0 }],
            instances: [
                { name: 'Neat Marker', coords: { wght: 400, BNCE: 0, INFM: 0, SPAC: 0 } },
                { name: 'Playful Bounce', coords: { wght: 600, BNCE: 75, INFM: 65, SPAC: 15 } },
                { name: 'Wild Comic Script', coords: { wght: 800, BNCE: 100, INFM: 100, SPAC: 35 } },
                { name: 'Inverted Dip', coords: { wght: 500, BNCE: -80, INFM: 80, SPAC: 20 } }
            ]
        },
        {
            family: 'Sixtyfour Convergence',
            category: 'mono',
            axes: [{ tag: 'BLED', min: 0, max: 100, default: 0 }, { tag: 'SCAN', min: -53, max: 100, default: 0 }, { tag: 'XELA', min: -100, max: 100, default: 0 }, { tag: 'YELA', min: -100, max: 100, default: 0 }],
            instances: [
                { name: 'Crisp CRT', coords: { BLED: 0, SCAN: 0, XELA: 0, YELA: 0 } },
                { name: 'RGB Glitch', coords: { BLED: 40, SCAN: 20, XELA: 70, YELA: -55 } },
                { name: 'Heavy Scanlines', coords: { BLED: 75, SCAN: 85, XELA: 25, YELA: 25 } },
                { name: 'Tight Phosphor', coords: { BLED: 20, SCAN: -45, XELA: -40, YELA: 40 } }
            ]
        },
        {
            family: 'Nunito Sans',
            category: 'sans',
            axes: [{ tag: 'wght', min: 200, max: 1000, default: 400 }, { tag: 'wdth', min: 75, max: 125, default: 100 }, { tag: 'opsz', min: 6, max: 12, default: 12 }, { tag: 'YTLC', min: 440, max: 540, default: 500 }],
            instances: [
                ...stdWeightInstances(200, 1000, { wdth: 100, opsz: 12, YTLC: 500 }),
                { name: 'Condensed Title', coords: { wght: 700, wdth: 75, opsz: 12, YTLC: 500 } },
                { name: 'Tall x-Height Bold', coords: { wght: 800, wdth: 115, opsz: 12, YTLC: 540 } },
                { name: 'Compact Caption', coords: { wght: 500, wdth: 100, opsz: 6, YTLC: 460 } }
            ]
        },
        {
            family: 'TikTok Sans',
            category: 'sans',
            axes: [{ tag: 'wght', min: 300, max: 900, default: 400 }, { tag: 'wdth', min: 75, max: 150, default: 100 }, { tag: 'opsz', min: 12, max: 36, default: 14 }, { tag: 'slnt', min: -6, max: 0, default: 0 }],
            instances: [
                ...stdWeightInstances(300, 900, { wdth: 100, opsz: 14, slnt: 0 }),
                { name: 'Compact Bold', coords: { wght: 700, wdth: 75, opsz: 24, slnt: 0 } },
                { name: 'Wide Black Display', coords: { wght: 900, wdth: 140, opsz: 36, slnt: 0 } },
                { name: 'Oblique Medium', coords: { wght: 500, wdth: 100, opsz: 14, slnt: -6 } }
            ]
        },
        {
            family: 'Playfair',
            category: 'serif',
            axes: [{ tag: 'wght', min: 300, max: 900, default: 400 }, { tag: 'wdth', min: 87.5, max: 112.5, default: 100 }, { tag: 'opsz', min: 5, max: 1200, default: 14 }],
            instances: [
                ...stdWeightInstances(300, 900, { wdth: 100, opsz: 14 }),
                { name: 'Fine Editorial Caption', coords: { wght: 400, wdth: 100, opsz: 8 } },
                { name: 'Narrow Headline', coords: { wght: 700, wdth: 87.5, opsz: 96 } },
                { name: 'Wide Luxury Display', coords: { wght: 900, wdth: 112.5, opsz: 360 } }
            ]
        },
        {
            family: 'Handjet',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'ELGR', min: 1, max: 2, default: 1 }, { tag: 'ELSH', min: 0, max: 16, default: 2 }],
            instances: [
                ...stdWeightInstances(100, 900, { ELGR: 1, ELSH: 2 }),
                { name: 'Crisp Pixels', coords: { wght: 400, ELGR: 1, ELSH: 0 } },
                { name: 'Round Dots', coords: { wght: 600, ELGR: 1.25, ELSH: 8 } },
                { name: 'Diamond Mosaic', coords: { wght: 700, ELGR: 1.5, ELSH: 12 } },
                { name: 'Starburst Bold', coords: { wght: 900, ELGR: 2, ELSH: 16 } }
            ]
        },
        {
            family: 'Kode Mono',
            category: 'mono',
            axes: [{ tag: 'wght', min: 400, max: 700, default: 400 }, { tag: 'wdth', min: 75, max: 125, default: 100 }, { tag: 'ROND', min: 0, max: 100, default: 0 }],
            instances: [
                ...stdWeightInstances(400, 700, { wdth: 100, ROND: 0 }),
                { name: 'Sharp Terminal', coords: { wght: 400, wdth: 100, ROND: 0 } },
                { name: 'Rounded Code Bold', coords: { wght: 700, wdth: 105, ROND: 100 } },
                { name: 'Condensed Wide', coords: { wght: 500, wdth: 75, ROND: 50 } }
            ]
        },
        {
            family: 'Google Sans',
            category: 'sans',
            axes: [{ tag: 'wght', min: 400, max: 700, default: 400 }, { tag: 'opsz', min: 17, max: 18, default: 18 }, { tag: 'GRAD', min: -50, max: 200, default: 0 }],
            instances: [
                ...stdWeightInstances(400, 700, { opsz: 18, GRAD: 0 }),
                { name: 'Graded Crisp', coords: { wght: 500, opsz: 18, GRAD: 80 } },
                { name: 'Negative Grade Dark', coords: { wght: 400, opsz: 18, GRAD: -50 } },
                { name: 'Heavy Display Grade', coords: { wght: 700, opsz: 18, GRAD: 200 } }
            ]
        },
        {
            family: 'Pathway Extreme',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 75, max: 100, default: 100 }, { tag: 'opsz', min: 8, max: 144, default: 12 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100, opsz: 12 }),
                { name: 'Micro UI', coords: { wght: 400, wdth: 100, opsz: 8 } },
                { name: 'Compact Bold', coords: { wght: 700, wdth: 75, opsz: 36 } },
                { name: 'High Contrast Poster', coords: { wght: 900, wdth: 100, opsz: 144 } }
            ]
        },
        {
            family: 'Truculenta',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 75, max: 125, default: 100 }, { tag: 'opsz', min: 12, max: 72, default: 14 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100, opsz: 14 }),
                { name: 'Narrow Poster', coords: { wght: 700, wdth: 75, opsz: 48 } },
                { name: 'Wide Friendly', coords: { wght: 500, wdth: 125, opsz: 18 } },
                { name: 'Display Heavy', coords: { wght: 900, wdth: 100, opsz: 72 } }
            ]
        },
        {
            family: 'Nabla',
            category: 'display',
            axes: [{ tag: 'EDPT', min: 0, max: 200, default: 100 }, { tag: 'EHLT', min: 0, max: 24, default: 12 }],
            instances: [
                { name: 'Flat Coin', coords: { EDPT: 0, EHLT: 0 } },
                { name: 'Classic Isometric', coords: { EDPT: 100, EHLT: 12 } },
                { name: 'Deep Extrusion', coords: { EDPT: 200, EHLT: 16 } },
                { name: 'High Bevel Jewel', coords: { EDPT: 140, EHLT: 24 } }
            ]
        },
        {
            family: 'Honk',
            category: 'display',
            axes: [{ tag: 'MORF', min: 0, max: 45, default: 15 }, { tag: 'SHLN', min: 0, max: 100, default: 50 }],
            instances: [
                { name: 'Compact Pop', coords: { MORF: 0, SHLN: 20 } },
                { name: 'Classic Arcade', coords: { MORF: 15, SHLN: 50 } },
                { name: 'Deep Shadow Morph', coords: { MORF: 30, SHLN: 100 } },
                { name: 'Wild Bubbly Poster', coords: { MORF: 45, SHLN: 80 } }
            ]
        },
        {
            family: 'Tilt Prism',
            category: 'display',
            axes: [{ tag: 'XROT', min: -45, max: 45, default: 0 }, { tag: 'YROT', min: -45, max: 45, default: 0 }],
            instances: [
                { name: 'Front Architectural', coords: { XROT: 0, YROT: 0 } },
                { name: 'Tilt Left Hero', coords: { XROT: -30, YROT: 20 } },
                { name: 'Tilt Right Isometric', coords: { XROT: 30, YROT: 25 } },
                { name: 'Low Angle Monument', coords: { XROT: 0, YROT: 45 } },
                { name: 'Overhead Tilt', coords: { XROT: 20, YROT: -40 } }
            ]
        },
        {
            family: 'Tilt Neon',
            category: 'display',
            axes: [{ tag: 'XROT', min: -45, max: 45, default: 0 }, { tag: 'YROT', min: -45, max: 45, default: 0 }],
            instances: [
                { name: 'Front Neon', coords: { XROT: 0, YROT: 0 } },
                { name: 'Tilt Left Sign', coords: { XROT: -30, YROT: 15 } },
                { name: 'Tilt Right Sign', coords: { XROT: 30, YROT: 15 } },
                { name: 'Upward Perspective', coords: { XROT: 0, YROT: 40 } }
            ]
        },
        {
            family: 'Tilt Warp',
            category: 'display',
            axes: [{ tag: 'XROT', min: -45, max: 45, default: 0 }, { tag: 'YROT', min: -45, max: 45, default: 0 }],
            instances: [
                { name: 'Front Bold', coords: { XROT: 0, YROT: 0 } },
                { name: 'Warped Left', coords: { XROT: -35, YROT: 25 } },
                { name: 'Warped Right', coords: { XROT: 35, YROT: 25 } },
                { name: 'Steep Angle', coords: { XROT: 25, YROT: -45 } }
            ]
        },
        {
            family: 'Sixtyfour',
            category: 'mono',
            axes: [{ tag: 'BLED', min: 0, max: 100, default: 0 }, { tag: 'SCAN', min: -53, max: 100, default: 0 }],
            instances: [
                { name: 'Crisp Retro', coords: { BLED: 0, SCAN: 0 } },
                { name: 'Dense Scanlines', coords: { BLED: 25, SCAN: -45 } },
                { name: 'Phosphor Glow', coords: { BLED: 85, SCAN: 60 } }
            ]
        },
        {
            family: 'Workbench',
            category: 'mono',
            axes: [{ tag: 'BLED', min: 0, max: 100, default: 0 }, { tag: 'SCAN', min: -53, max: 100, default: 0 }],
            instances: [
                { name: 'Sharp Terminal', coords: { BLED: 0, SCAN: 0 } },
                { name: 'Heavy CRT Scan', coords: { BLED: 50, SCAN: 85 } },
                { name: 'Thick Phosphor', coords: { BLED: 90, SCAN: 15 } }
            ]
        },
        {
            family: 'Doto',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'ROND', min: 0, max: 100, default: 0 }],
            instances: [
                ...stdWeightInstances(100, 900, { ROND: 0 }),
                { name: 'Square LED Matrix', coords: { wght: 400, ROND: 0 } },
                { name: 'Rounded LED Bold', coords: { wght: 700, ROND: 100 } },
                { name: 'Soft Black Dots', coords: { wght: 900, ROND: 75 } }
            ]
        },
        {
            family: 'Sono',
            category: 'mono',
            axes: [{ tag: 'wght', min: 200, max: 800, default: 400 }, { tag: 'MONO', min: 0, max: 1, default: 1 }],
            instances: [
                ...stdWeightInstances(200, 800, { MONO: 1 }),
                { name: 'Proportional Soft', coords: { wght: 400, MONO: 0 } },
                { name: 'Half Mono Bold', coords: { wght: 700, MONO: 0.5 } },
                { name: 'Full Fixed Code', coords: { wght: 500, MONO: 1 } }
            ]
        },
        {
            family: 'Google Sans Code',
            category: 'mono',
            axes: [{ tag: 'wght', min: 300, max: 800, default: 400 }, { tag: 'MONO', min: 0, max: 1, default: 1 }],
            instances: [
                ...stdWeightInstances(300, 800, { MONO: 1 }),
                { name: 'Proportional Mode', coords: { wght: 400, MONO: 0 } },
                { name: 'Fixed Mono Code', coords: { wght: 500, MONO: 1 } },
                { name: 'Bold Mono Code', coords: { wght: 700, MONO: 1 } }
            ]
        },
        {
            family: 'AR One Sans',
            category: 'sans',
            axes: [{ tag: 'wght', min: 400, max: 700, default: 400 }, { tag: 'ARRR', min: 10, max: 60, default: 10 }],
            instances: [
                ...stdWeightInstances(400, 700, { ARRR: 10 }),
                { name: 'Standard', coords: { wght: 400, ARRR: 10 } },
                { name: 'Wide AR Spacing', coords: { wght: 600, ARRR: 45 } },
                { name: 'Bold AR Maximum', coords: { wght: 700, ARRR: 60 } }
            ]
        },
        {
            family: 'Akshar',
            category: 'sans',
            axes: [{ tag: 'wght', min: 300, max: 700, default: 400 }, { tag: 'CTRS', min: 0, max: 100, default: 0 }],
            instances: [
                ...stdWeightInstances(300, 700, { CTRS: 0 }),
                { name: 'Mono Sans Regular', coords: { wght: 400, CTRS: 0 } },
                { name: 'High Contrast Editorial', coords: { wght: 600, CTRS: 85 } },
                { name: 'Display Contrast Bold', coords: { wght: 700, CTRS: 100 } }
            ]
        },
        {
            family: 'Kumbh Sans',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'YOPQ', min: 40, max: 300, default: 300 }],
            instances: [
                ...stdWeightInstances(100, 900, { YOPQ: 300 }),
                { name: 'High Contrast Display', coords: { wght: 600, YOPQ: 40 } },
                { name: 'Uniform Stroke', coords: { wght: 400, YOPQ: 300 } },
                { name: 'Heavy Display', coords: { wght: 900, YOPQ: 160 } }
            ]
        },
        {
            family: 'Readex Pro',
            category: 'sans',
            axes: [{ tag: 'wght', min: 160, max: 700, default: 400 }, { tag: 'HEXP', min: 0, max: 100, default: 0 }],
            instances: [
                ...stdWeightInstances(160, 700, { HEXP: 0 }),
                { name: 'Compact Pro', coords: { wght: 400, HEXP: 0 } },
                { name: 'Expanded Readable', coords: { wght: 500, HEXP: 60 } },
                { name: 'Max Expansion Bold', coords: { wght: 700, HEXP: 100 } }
            ]
        },
        {
            family: 'Kablammo',
            category: 'display',
            axes: [{ tag: 'MORF', min: 0, max: 60, default: 0 }],
            instances: [
                { name: 'Classic Comic', coords: { MORF: 0 } },
                { name: 'Mid Morph Burst', coords: { MORF: 30 } },
                { name: 'Maximum Chaos', coords: { MORF: 60 } }
            ]
        },
        {
            family: 'Agu Display',
            category: 'display',
            axes: [{ tag: 'MORF', min: 0, max: 60, default: 0 }],
            instances: [
                { name: 'Clean Geometric', coords: { MORF: 0 } },
                { name: 'Blended Morph', coords: { MORF: 30 } },
                { name: 'Expressive Serif', coords: { MORF: 60 } }
            ]
        },
        {
            family: 'Climate Crisis',
            category: 'display',
            axes: [{ tag: 'YEAR', min: 1979, max: 2050, default: 1979 }],
            instances: [
                { name: '1979 Thick Ice', coords: { YEAR: 1979 } },
                { name: '2000 Shrinking', coords: { YEAR: 2000 } },
                { name: '2025 Critical', coords: { YEAR: 2025 } },
                { name: '2050 Ice-Free', coords: { YEAR: 2050 } }
            ]
        },
        {
            family: 'Danfo',
            category: 'display',
            axes: [{ tag: 'ELSH', min: 0, max: 100, default: 0 }],
            instances: [
                { name: 'Geometric Solid', coords: { ELSH: 0 } },
                { name: 'Stepped Decorative', coords: { ELSH: 50 } },
                { name: 'Full Ornament', coords: { ELSH: 100 } }
            ]
        },
        {
            family: 'Geist Pixel',
            category: 'display',
            axes: [{ tag: 'ELSH', min: 0, max: 100, default: 0 }],
            instances: [
                { name: 'Square Pixels', coords: { ELSH: 0 } },
                { name: 'Rounded Dots', coords: { ELSH: 50 } },
                { name: 'Angular Triangles', coords: { ELSH: 100 } }
            ]
        },
        {
            family: 'Roboto',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 75, max: 100, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } }
            ]
        },
        {
            family: 'IBM Plex Sans',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 700, default: 400 }, { tag: 'wdth', min: 75, max: 100, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 700, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } }
            ]
        },
        {
            family: 'Mona Sans',
            category: 'sans',
            axes: [{ tag: 'wght', min: 200, max: 900, default: 400 }, { tag: 'wdth', min: 75, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(200, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Hubot Sans',
            category: 'sans',
            axes: [{ tag: 'wght', min: 200, max: 900, default: 400 }, { tag: 'wdth', min: 75, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(200, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Saira',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 50, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 50 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Saira Stencil',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 50, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 50 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Noto Serif',
            category: 'serif',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 62.5, max: 100, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 62.5 } }
            ]
        },
        {
            family: 'Noto Sans Mono',
            category: 'mono',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 62.5, max: 100, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 62.5 } }
            ]
        },
        {
            family: 'Noto Sans Display',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 62.5, max: 100, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 62.5 } }
            ]
        },
        {
            family: 'Noto Serif Display',
            category: 'serif',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 62.5, max: 100, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 62.5 } }
            ]
        },
        {
            family: 'Cairo',
            category: 'sans',
            axes: [{ tag: 'wght', min: 200, max: 1000, default: 400 }, { tag: 'slnt', min: -11, max: 11, default: 0 }],
            instances: [
                ...stdWeightInstances(200, 1000, { slnt: 0 }),
                { name: 'Oblique Forward', coords: { slnt: 0, wght: 500, slnt: -11 } },
                { name: 'Backslant', coords: { slnt: 0, wght: 500, slnt: 11 } }
            ]
        },
        {
            family: 'Cairo Play',
            category: 'display',
            axes: [{ tag: 'wght', min: 200, max: 1000, default: 400 }, { tag: 'slnt', min: -11, max: 11, default: 0 }],
            instances: [
                ...stdWeightInstances(200, 1000, { slnt: 0 }),
                { name: 'Oblique Forward', coords: { slnt: 0, wght: 500, slnt: -11 } },
                { name: 'Backslant', coords: { slnt: 0, wght: 500, slnt: 11 } }
            ]
        },
        {
            family: 'Afacad Flux',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 1000, default: 400 }, { tag: 'slnt', min: -14, max: 14, default: 0 }],
            instances: [
                ...stdWeightInstances(100, 1000, { slnt: 0 }),
                { name: 'Oblique Forward', coords: { slnt: 0, wght: 500, slnt: -14 } },
                { name: 'Backslant', coords: { slnt: 0, wght: 500, slnt: 14 } }
            ]
        },
        {
            family: 'Gluten',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'slnt', min: -13, max: 13, default: 0 }],
            instances: [
                ...stdWeightInstances(100, 900, { slnt: 0 }),
                { name: 'Oblique Forward', coords: { slnt: 0, wght: 500, slnt: -13 } },
                { name: 'Backslant', coords: { slnt: 0, wght: 500, slnt: 13 } }
            ]
        },
        {
            family: 'Instrument Sans',
            category: 'sans',
            axes: [{ tag: 'wght', min: 400, max: 700, default: 400 }, { tag: 'wdth', min: 75, max: 100, default: 100 }],
            instances: [
                ...stdWeightInstances(400, 700, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } }
            ]
        },
        {
            family: 'Fredoka',
            category: 'sans',
            axes: [{ tag: 'wght', min: 300, max: 700, default: 400 }, { tag: 'wdth', min: 75, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(300, 700, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'DynaPuff',
            category: 'display',
            axes: [{ tag: 'wght', min: 400, max: 700, default: 400 }, { tag: 'wdth', min: 75, max: 100, default: 100 }],
            instances: [
                ...stdWeightInstances(400, 700, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } }
            ]
        },
        {
            family: 'Sour Gummy',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 100, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Asap',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 75, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Encode Sans',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 75, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Advent Pro',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 100, max: 200, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 200 } }
            ]
        },
        {
            family: 'Radio Canada',
            category: 'sans',
            axes: [{ tag: 'wght', min: 300, max: 700, default: 400 }, { tag: 'wdth', min: 75, max: 100, default: 100 }],
            instances: [
                ...stdWeightInstances(300, 700, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } }
            ]
        },
        {
            family: 'Georama',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 62.5, max: 150, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 62.5 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 150 } }
            ]
        },
        {
            family: 'Tektur',
            category: 'display',
            axes: [{ tag: 'wght', min: 400, max: 900, default: 400 }, { tag: 'wdth', min: 75, max: 100, default: 100 }],
            instances: [
                ...stdWeightInstances(400, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } }
            ]
        },
        {
            family: 'Anek Latin',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 800, default: 400 }, { tag: 'wdth', min: 75, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 800, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Big Shoulders',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'opsz', min: 10, max: 72, default: 14 }],
            instances: [
                ...stdWeightInstances(100, 900, { opsz: 14 }),
                { name: 'Display Headline', coords: { opsz: 14, wght: 700, opsz: 72 } }
            ]
        },
        {
            family: 'Big Shoulders Stencil',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'opsz', min: 10, max: 72, default: 14 }],
            instances: [
                ...stdWeightInstances(100, 900, { opsz: 14 }),
                { name: 'Display Headline', coords: { opsz: 14, wght: 700, opsz: 72 } }
            ]
        },
        {
            family: 'Big Shoulders Inline',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'opsz', min: 10, max: 72, default: 14 }],
            instances: [
                ...stdWeightInstances(100, 900, { opsz: 14 }),
                { name: 'Display Headline', coords: { opsz: 14, wght: 700, opsz: 72 } }
            ]
        },
        {
            family: 'Martian Mono',
            category: 'mono',
            axes: [{ tag: 'wght', min: 100, max: 800, default: 400 }, { tag: 'wdth', min: 75, max: 112.5, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 800, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 112.5 } }
            ]
        },
        {
            family: 'Montagu Slab',
            category: 'serif',
            axes: [{ tag: 'wght', min: 100, max: 700, default: 400 }, { tag: 'opsz', min: 16, max: 144, default: 144 }],
            instances: stdWeightInstances(100, 700, { opsz: 144 })
        },
        {
            family: 'Anybody',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 50, max: 150, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 50 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 150 } }
            ]
        },
        {
            family: 'Ubuntu Sans',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 800, default: 400 }, { tag: 'wdth', min: 75, max: 100, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 800, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } }
            ]
        },
        {
            family: 'BioRhyme',
            category: 'serif',
            axes: [{ tag: 'wght', min: 200, max: 800, default: 400 }, { tag: 'wdth', min: 100, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(200, 800, { wdth: 100 }),
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Special Gothic',
            category: 'sans',
            axes: [{ tag: 'wght', min: 400, max: 700, default: 400 }, { tag: 'wdth', min: 75, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(400, 700, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Piazzolla',
            category: 'serif',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'opsz', min: 8, max: 30, default: 14 }],
            instances: [
                ...stdWeightInstances(100, 900, { opsz: 14 }),
                { name: 'Display Headline', coords: { opsz: 14, wght: 700, opsz: 30 } }
            ]
        },
        {
            family: 'Mozilla Headline',
            category: 'sans',
            axes: [{ tag: 'wght', min: 200, max: 700, default: 400 }, { tag: 'wdth', min: 75, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(200, 700, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Kalnia',
            category: 'serif',
            axes: [{ tag: 'wght', min: 100, max: 700, default: 400 }, { tag: 'wdth', min: 100, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 700, { wdth: 100 }),
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Kalnia Glaze',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 700, default: 400 }, { tag: 'wdth', min: 100, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 700, { wdth: 100 }),
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Bodoni Moda SC',
            category: 'serif',
            axes: [{ tag: 'wght', min: 400, max: 900, default: 400 }, { tag: 'opsz', min: 6, max: 96, default: 11 }],
            instances: [
                ...stdWeightInstances(400, 900, { opsz: 11 }),
                { name: 'Display Headline', coords: { opsz: 11, wght: 700, opsz: 72 } }
            ]
        },
        {
            family: 'Imbue',
            category: 'serif',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'opsz', min: 10, max: 100, default: 10 }],
            instances: [
                ...stdWeightInstances(100, 900, { opsz: 10 }),
                { name: 'Display Headline', coords: { opsz: 10, wght: 700, opsz: 72 } }
            ]
        },
        {
            family: 'Trispace',
            category: 'sans',
            axes: [{ tag: 'wght', min: 100, max: 800, default: 400 }, { tag: 'wdth', min: 75, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 800, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Tourney',
            category: 'display',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 75, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 75 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Texturina',
            category: 'serif',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'opsz', min: 12, max: 72, default: 12 }],
            instances: [
                ...stdWeightInstances(100, 900, { opsz: 12 }),
                { name: 'Display Headline', coords: { opsz: 12, wght: 700, opsz: 72 } }
            ]
        },
        {
            family: 'Datatype',
            category: 'mono',
            axes: [{ tag: 'wght', min: 100, max: 900, default: 400 }, { tag: 'wdth', min: 50, max: 150, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 900, { wdth: 100 }),
                { name: 'Condensed Bold', coords: { wdth: 100, wght: 700, wdth: 50 } },
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 150 } }
            ]
        },
        {
            family: 'Literata',
            category: 'serif',
            axes: [{ tag: 'wght', min: 200, max: 900, default: 400 }, { tag: 'opsz', min: 7, max: 72, default: 14 }],
            instances: [
                ...stdWeightInstances(200, 900, { opsz: 14 }),
                { name: 'Display Headline', coords: { opsz: 14, wght: 700, opsz: 72 } }
            ]
        },
        {
            family: 'M PLUS Code Latin',
            category: 'mono',
            axes: [{ tag: 'wght', min: 100, max: 700, default: 400 }, { tag: 'wdth', min: 100, max: 125, default: 100 }],
            instances: [
                ...stdWeightInstances(100, 700, { wdth: 100 }),
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 125 } }
            ]
        },
        {
            family: 'Strichpunkt Sans',
            category: 'sans',
            axes: [{ tag: 'wght', min: 400, max: 900, default: 400 }, { tag: 'wdth', min: 100, max: 200, default: 100 }],
            instances: [
                ...stdWeightInstances(400, 900, { wdth: 100 }),
                { name: 'Expanded Bold', coords: { wdth: 100, wght: 700, wdth: 200 } }
            ]
        }
    ];

    const customFontsMap = new Map(); // lowerCase(family) -> fontEntry
    const loadedGoogleLinks = new Set();
    const loadingPromises = new Map();

    // Google Fonts CSS2 axis sorting: lowercase registered tags alphabetically first, then uppercase custom tags alphabetically
    function sortGoogleAxisTags(a, b) {
        const aLower = a.tag === a.tag.toLowerCase();
        const bLower = b.tag === b.tag.toLowerCase();
        if (aLower !== bLower) return aLower ? -1 : 1;
        return a.tag.localeCompare(b.tag);
    }

    function formatRangeTupleVal(n) {
        return Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(3)));
    }

    function buildGoogleFontsURL(family, fontDef, coreOnly = false) {
        const def = fontDef || CATALOG.find(f => f.family.toLowerCase() === String(family || '').toLowerCase());
        if (!def || !def.axes || def.axes.length === 0) return '';
        let axes = def.axes.slice();
        if (coreOnly) {
            axes = axes.filter(a => !a.hidden && ['opsz', 'slnt', 'wdth', 'wght'].includes(a.tag));
            if (axes.length === 0) {
                const wAxis = def.axes.find(a => a.tag === 'wght') || def.axes[0];
                axes = [wAxis];
            }
        }
        // Google Fonts v2 rejects discrete ital ranges with .. in a range tuple; handle ital cleanly
        const hasItal = axes.some(a => a.tag === 'ital');
        const rangeAxes = axes.filter(a => a.tag !== 'ital').sort(sortGoogleAxisTags);
        const encodedFamily = def.family.trim().replace(/\s+/g, '+');
        if (rangeAxes.length === 0 && hasItal) {
            return `https://fonts.googleapis.com/css2?family=${encodedFamily}:ital@0;1&display=swap`;
        }
        if (hasItal) {
            const tags = ['ital', ...rangeAxes.map(a => a.tag)].join(',');
            const coords = rangeAxes.map(a => `${formatRangeTupleVal(a.min)}..${formatRangeTupleVal(a.max)}`).join(',');
            return `https://fonts.googleapis.com/css2?family=${encodedFamily}:${tags}@0,${coords};1,${coords}&display=swap`;
        }
        const tags = rangeAxes.map(a => a.tag).join(',');
        const coords = rangeAxes.map(a => `${formatRangeTupleVal(a.min)}..${formatRangeTupleVal(a.max)}`).join(',');
        return `https://fonts.googleapis.com/css2?family=${encodedFamily}:${tags}@${coords}&display=swap`;
    }

    function getFontDef(family) {
        if (!family || typeof family !== 'string') return null;
        const clean = family.replace(/['"]/g, '').split(',')[0].trim().toLowerCase();
        if (!clean) return null;
        if (customFontsMap.has(clean)) return customFontsMap.get(clean);
        return CATALOG.find(f => f.family.toLowerCase() === clean) || null;
    }

    function isVariableFont(family) {
        return !!getFontDef(family);
    }

    function isCustomVariableFont(family) {
        if (!family || typeof family !== 'string') return false;
        const clean = family.replace(/['"]/g, '').split(',')[0].trim().toLowerCase();
        return customFontsMap.has(clean);
    }

    const REGISTERED_AXES = new Set(['wght', 'wdth', 'opsz', 'slnt', 'ital']);

    function getVisibleAxes(fontDef) {
        const def = typeof fontDef === 'string' ? getFontDef(fontDef) : fontDef;
        if (!def || !Array.isArray(def.axes)) return [];
        return def.axes.filter(a => !a.hidden);
    }

    function hasCustomAxes(fontDef) {
        const vis = getVisibleAxes(fontDef);
        return vis.some(a => !REGISTERED_AXES.has(a.tag));
    }

    function ensureFontLoaded(family) {
        const def = getFontDef(family);
        if (!def) return Promise.resolve(false);
        const key = def.family.toLowerCase();
        if (def.isCustom) {
            if (document.fonts && typeof document.fonts.load === 'function') {
                return document.fonts.load(`16px "${def.family}"`, 'AaBbGg 0123').catch(() => true);
            }
            return Promise.resolve(true);
        }
        if (loadedGoogleLinks.has(key)) {
            if (document.fonts && typeof document.fonts.load === 'function') {
                return Promise.race([
                    document.fonts.load(`16px "${def.family}"`, 'AaBbGg 0123').catch(() => true),
                    new Promise(r => setTimeout(() => r(true), 1200))
                ]);
            }
            return Promise.resolve(true);
        }
        if (loadingPromises.has(key)) return loadingPromises.get(key);

        const url = buildGoogleFontsURL(def.family, def, false);
        if (!url) return Promise.resolve(false);

        const p = new Promise(resolve => {
            let settled = false;
            const finish = () => {
                if (settled) return;
                settled = true;
                if (document.fonts && typeof document.fonts.load === 'function') {
                    Promise.race([
                        document.fonts.load(`16px "${def.family}"`, 'AaBbGg 0123').catch(() => {}),
                        new Promise(r => setTimeout(r, 1500))
                    ]).then(() => {
                        loadedGoogleLinks.add(key);
                        resolve(true);
                    });
                } else {
                    loadedGoogleLinks.add(key);
                    resolve(true);
                }
            };
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.setAttribute('data-vf-google-font', def.family);
            link.onload = finish;
            link.onerror = () => {
                // Retry safe core axes fallback in case upstream rejects an exotic custom axis range
                const fallbackUrl = buildGoogleFontsURL(def.family, def, true);
                if (fallbackUrl && fallbackUrl !== url) {
                    const fb = document.createElement('link');
                    fb.rel = 'stylesheet';
                    fb.href = fallbackUrl;
                    fb.setAttribute('data-vf-google-font', def.family);
                    fb.onload = finish;
                    fb.onerror = finish;
                    document.head.appendChild(fb);
                } else {
                    finish();
                }
            };
            document.head.appendChild(link);
            setTimeout(finish, 3000);
        });
        loadingPromises.set(key, p);
        return p;
    }

    // =========================================================================
    // OPENTYPE BINARY PARSER (TTF / OTF / WOFF1 fvar + name tables, WOFF2 fallback)
    // =========================================================================
    function readTag(view, offset) {
        return String.fromCharCode(
            view.getUint8(offset),
            view.getUint8(offset + 1),
            view.getUint8(offset + 2),
            view.getUint8(offset + 3)
        );
    }

    function decodeNameRecord(view, stringOffset, rec) {
        if (!rec || stringOffset + rec.offset + rec.length > view.byteLength) return '';
        const start = stringOffset + rec.offset;
        if (rec.platformID === 3 || rec.platformID === 0) {
            let out = '';
            for (let i = 0; i + 1 < rec.length; i += 2) {
                const code = view.getUint16(start + i, false);
                if (code) out += String.fromCharCode(code);
            }
            return out.trim();
        }
        let ascii = '';
        for (let i = 0; i < rec.length; i++) {
            const b = view.getUint8(start + i);
            if (b) ascii += String.fromCharCode(b);
        }
        return ascii.trim();
    }

    function parseNameTable(view, offset, length) {
        const names = new Map();
        if (!offset || offset + 6 > view.byteLength) return names;
        const count = view.getUint16(offset + 2, false);
        const stringStorageOffset = offset + view.getUint16(offset + 4, false);
        const bestPriority = new Map();
        for (let i = 0; i < count; i++) {
            const recOff = offset + 6 + i * 12;
            if (recOff + 12 > view.byteLength || recOff + 12 > offset + length) break;
            const rec = {
                platformID: view.getUint16(recOff, false),
                encodingID: view.getUint16(recOff + 2, false),
                languageID: view.getUint16(recOff + 4, false),
                nameID: view.getUint16(recOff + 6, false),
                length: view.getUint16(recOff + 8, false),
                offset: view.getUint16(recOff + 10, false)
            };
            const text = decodeNameRecord(view, stringStorageOffset, rec);
            if (!text) continue;
            let prio = 1;
            if (rec.platformID === 3 && rec.languageID === 0x0409) prio = 4;
            else if (rec.platformID === 3) prio = 3;
            else if (rec.platformID === 1 && rec.languageID === 0) prio = 2;
            if (!bestPriority.has(rec.nameID) || prio > bestPriority.get(rec.nameID)) {
                bestPriority.set(rec.nameID, prio);
                names.set(rec.nameID, text);
            }
        }
        return names;
    }

    function parseFvarTable(view, offset, length, namesMap) {
        const axes = [];
        const instances = [];
        if (!offset || offset + 16 > view.byteLength || length < 16) return { axes, instances };
        const axesArrayOffset = view.getUint16(offset + 4, false);
        const axisCount = view.getUint16(offset + 8, false);
        const axisSize = view.getUint16(offset + 10, false);
        const instanceCount = view.getUint16(offset + 12, false);
        const instanceSize = view.getUint16(offset + 14, false);

        for (let i = 0; i < axisCount; i++) {
            const pos = offset + axesArrayOffset + i * axisSize;
            if (pos + 20 > view.byteLength) break;
            const tag = readTag(view, pos);
            const minVal = parseFloat((view.getInt32(pos + 4, false) / 65536).toFixed(4));
            const defVal = parseFloat((view.getInt32(pos + 8, false) / 65536).toFixed(4));
            const maxVal = parseFloat((view.getInt32(pos + 12, false) / 65536).toFixed(4));
            const flags = view.getUint16(pos + 16, false);
            const axisNameID = view.getUint16(pos + 18, false);
            const parsedLabel = namesMap.get(axisNameID);
            const meta = AXIS_META[tag];
            axes.push({
                tag,
                name: parsedLabel || (meta ? meta.name : tag),
                min: minVal,
                default: defVal,
                max: maxVal,
                hidden: (flags & 0x0001) !== 0
            });
        }

        const instBase = offset + axesArrayOffset + axisCount * axisSize;
        for (let j = 0; j < instanceCount; j++) {
            const pos = instBase + j * instanceSize;
            if (pos + 4 + axisCount * 4 > view.byteLength) break;
            const subfamilyNameID = view.getUint16(pos, false);
            const coords = {};
            for (let a = 0; a < axes.length; a++) {
                coords[axes[a].tag] = parseFloat((view.getInt32(pos + 4 + a * 4, false) / 65536).toFixed(4));
            }
            const instName = namesMap.get(subfamilyNameID) || `Instance ${j + 1}`;
            instances.push({ name: instName, coords });
        }
        return { axes, instances };
    }

    async function inflateRawZlib(bytes) {
        if (typeof DecompressionStream !== 'function') return null;
        try {
            const ds = new DecompressionStream('deflate');
            const writer = ds.writable.getWriter();
            writer.write(bytes);
            writer.close();
            const res = await new Response(ds.readable).arrayBuffer();
            return new DataView(res);
        } catch (e) {
            return null;
        }
    }

    function arrayBufferToBase64(buf) {
        const bytes = new Uint8Array(buf);
        const chunk = 0x8000;
        let binary = '';
        for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
        }
        return btoa(binary);
    }

    async function parseOpenTypeVariableFont(arrayBuffer, fileName) {
        const view = new DataView(arrayBuffer);
        const cleanBase = String(fileName || 'CustomFont').replace(/\.(ttf|otf|woff2?|variable)$/i, '').replace(/[_-]+/g, ' ').trim();
        const extMatch = String(fileName || '').toLowerCase().match(/\.(ttf|otf|woff2?)$/);
        const ext = extMatch ? extMatch[1] : 'ttf';
        const mimeMap = { ttf: 'font/ttf', otf: 'font/otf', woff: 'font/woff', woff2: 'font/woff2' };
        const formatMap = { ttf: 'truetype', otf: 'opentype', woff: 'woff', woff2: 'woff2' };
        const mime = mimeMap[ext] || 'font/ttf';
        const formatStr = formatMap[ext] || 'truetype';

        let familyName = cleanBase;
        let axes = [];
        let instances = [];
        let binaryParsed = false;

        if (view.byteLength >= 12) {
            const sig = view.getUint32(0, false);
            const sigTag = readTag(view, 0);

            if (sig === 0x00010000 || sigTag === 'OTTO' || sigTag === 'true' || sigTag === 'typ1') {
                const numTables = view.getUint16(4, false);
                const tables = {};
                for (let i = 0; i < numTables; i++) {
                    const tOff = 12 + i * 16;
                    if (tOff + 16 > view.byteLength) break;
                    const tag = readTag(view, tOff);
                    tables[tag] = {
                        offset: view.getUint32(tOff + 8, false),
                        length: view.getUint32(tOff + 12, false)
                    };
                }
                const namesMap = tables.name ? parseNameTable(view, tables.name.offset, tables.name.length) : new Map();
                const parsedFamily = namesMap.get(16) || namesMap.get(1);
                if (parsedFamily) familyName = parsedFamily;
                if (tables.fvar) {
                    const parsed = parseFvarTable(view, tables.fvar.offset, tables.fvar.length, namesMap);
                    axes = parsed.axes;
                    instances = parsed.instances;
                    binaryParsed = true;
                }
            } else if (sigTag === 'wOFF' && view.byteLength >= 44) {
                const numTables = view.getUint16(12, false);
                const tables = {};
                for (let i = 0; i < numTables; i++) {
                    const tOff = 44 + i * 20;
                    if (tOff + 20 > view.byteLength) break;
                    const tag = readTag(view, tOff);
                    tables[tag] = {
                        offset: view.getUint32(tOff + 4, false),
                        compLength: view.getUint32(tOff + 8, false),
                        origLength: view.getUint32(tOff + 12, false)
                    };
                }
                const getWoffTableView = async (meta) => {
                    if (!meta || meta.offset + meta.compLength > view.byteLength) return null;
                    if (meta.compLength === meta.origLength) {
                        return new DataView(arrayBuffer, meta.offset, meta.origLength);
                    }
                    return await inflateRawZlib(new Uint8Array(arrayBuffer, meta.offset, meta.compLength));
                };
                const nameView = await getWoffTableView(tables.name);
                const namesMap = nameView ? parseNameTable(nameView, 0, nameView.byteLength) : new Map();
                const parsedFamily = namesMap.get(16) || namesMap.get(1);
                if (parsedFamily) familyName = parsedFamily;
                const fvarView = await getWoffTableView(tables.fvar);
                if (fvarView) {
                    const parsed = parseFvarTable(fvarView, 0, fvarView.byteLength, namesMap);
                    axes = parsed.axes;
                    instances = parsed.instances;
                    binaryParsed = true;
                }
            }
        }

        // Fallback axes if WOFF2 or static custom font uploaded (ensures WOFF2 remains immediately usable)
        if (!axes || axes.length === 0) {
            axes = [
                { tag: 'wght', name: 'Weight', min: 100, max: 900, default: 400 },
                { tag: 'wdth', name: 'Width', min: 75, max: 125, default: 100 },
                { tag: 'opsz', name: 'Optical Size', min: 8, max: 72, default: 14 }
            ];
            instances = stdWeightInstances(100, 900);
        }

        const dataUri = `data:${mime};base64,${arrayBufferToBase64(arrayBuffer)}`;
        return {
            id: 'vf-custom-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
            family: familyName || 'Custom Variable Font',
            fileName: fileName || 'custom-font.' + ext,
            category: 'custom',
            isCustom: true,
            binaryParsed,
            mime,
            format: formatStr,
            dataUri,
            axes,
            instances
        };
    }

    // =========================================================================
    // INDEXEDDB PERSISTENCE FOR CUSTOM VARIABLE FONTS
    // =========================================================================
    function openFontDB() {
        return new Promise((resolve, reject) => {
            if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB unavailable'));
            const req = indexedDB.open(IDB_NAME, IDB_VERSION);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(IDB_STORE)) {
                    db.createObjectStore(IDB_STORE, { keyPath: 'family' });
                }
            };
            req.onsuccess = (e) => resolve(e.target.result);
            req.onerror = (e) => reject(e.target.error);
        });
    }

    async function saveCustomFontToDB(entry) {
        try {
            const db = await openFontDB();
            await new Promise((resolve, reject) => {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).put(entry);
                tx.oncomplete = resolve;
                tx.onerror = (e) => reject(e.target.error);
            });
        } catch (e) {
            console.warn('[VariableFonts] Could not persist custom font to IndexedDB:', e);
        }
    }

    async function deleteCustomFontFromDB(family) {
        try {
            const db = await openFontDB();
            await new Promise((resolve, reject) => {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).delete(family);
                tx.oncomplete = resolve;
                tx.onerror = (e) => reject(e.target.error);
            });
        } catch (e) {
            console.warn('[VariableFonts] Failed deleting custom font from IndexedDB:', e);
        }
    }

    async function loadSavedCustomFonts() {
        try {
            const db = await openFontDB();
            const entries = await new Promise((resolve, reject) => {
                const tx = db.transaction(IDB_STORE, 'readonly');
                const req = tx.objectStore(IDB_STORE).getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = (e) => reject(e.target.error);
            });
            for (const entry of entries) {
                await registerCustomFont(entry, true);
            }
            return entries;
        } catch (e) {
            return [];
        }
    }

    async function registerCustomFont(entry, skipDB = false) {
        if (!entry || !entry.family || !entry.dataUri) return entry;
        const cleanFam = entry.family.trim();
        customFontsMap.set(cleanFam.toLowerCase(), entry);

        // Inject @font-face stylesheet with full variable weight/stretch/style descriptors
        const styleId = 'vf-custom-style-' + cleanFam.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.setAttribute('data-vf-custom-font', cleanFam);
            document.head.appendChild(styleEl);
        }
        const safeUrl = entry.dataUri;
        const safeFormat = entry.format || 'truetype';
        styleEl.textContent = `
@font-face {
    font-family: "${cleanFam.replace(/"/g, '\\"')}";
    src: url("${safeUrl}") format("${safeFormat}");
    font-weight: 1 1000;
    font-stretch: 25% 200%;
    font-style: oblique -20deg 20deg;
    font-display: swap;
}`;

        if (typeof FontFace === 'function' && document.fonts) {
            try {
                const ff = new FontFace(cleanFam, `url("${safeUrl}")`, {
                    weight: '1 1000',
                    stretch: '25% 200%'
                });
                const loadedFace = await ff.load();
                document.fonts.add(loadedFace);
            } catch (e) {}
        }

        if (typeof window.fontList !== 'undefined' && Array.isArray(window.fontList)) {
            if (!window.fontList.some(f => f.toLowerCase() === cleanFam.toLowerCase())) {
                window.fontList.push(cleanFam);
                window.fontList.sort();
            }
        }
        if (!skipDB) {
            await saveCustomFontToDB(entry);
        }
        if (typeof window.rebuildFontPickers === 'function') {
            window.rebuildFontPickers();
        }
        return entry;
    }

    async function removeCustomFont(family) {
        if (!family) return;
        const key = family.trim().toLowerCase();
        const entry = customFontsMap.get(key);
        customFontsMap.delete(key);
        const styleId = 'vf-custom-style-' + key.replace(/[^a-z0-9]+/g, '-');
        const styleEl = document.getElementById(styleId);
        if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
        if (entry && Array.isArray(window.fontList)) {
            const idx = window.fontList.findIndex(f => f.toLowerCase() === key);
            if (idx !== -1) window.fontList.splice(idx, 1);
        }
        await deleteCustomFontFromDB(entry ? entry.family : family);
        if (typeof window.rebuildFontPickers === 'function') {
            window.rebuildFontPickers();
        }
    }

    // =========================================================================
    // VARIATION SETTINGS PARSING, FORMATTING, INSPECTION & APPLICATION
    // =========================================================================
    function parseVariationSettings(cssStr) {
        const out = {};
        if (!cssStr || typeof cssStr !== 'string' || cssStr === 'normal') return out;
        const re = /['"]([a-zA-Z]{4})['"]\s+(-?\d+(?:\.\d+)?)/g;
        let m;
        while ((m = re.exec(cssStr)) !== null) {
            out[m[1]] = parseFloat(m[2]);
        }
        return out;
    }

    function formatVariationSettings(axesMap, opszMode, includeHiddenOverrides) {
        if (!axesMap || typeof axesMap !== 'object') return 'normal';
        const parts = [];
        Object.keys(axesMap).sort().forEach(tag => {
            if (tag.length !== 4) return;
            if (tag === 'opsz' && opszMode === 'auto') return;
            if (includeHiddenOverrides && includeHiddenOverrides[tag] === false) return;
            const num = parseFloat(axesMap[tag]);
            if (isNaN(num)) return;
            const cleanVal = Number.isInteger(num) ? num : parseFloat(num.toFixed(3));
            parts.push(`"${tag}" ${cleanVal}`);
        });
        return parts.length > 0 ? parts.join(', ') : 'normal';
    }

    function resolveEditableRoot(el) {
        if (!el || el.nodeType !== 1) return null;
        return el.querySelector('.wa-text') ||
            el.querySelector('.text-content') ||
            el.querySelector('[contenteditable="true"]') ||
            el.querySelector('[contenteditable]') ||
            el.querySelector('.element-content > div') ||
            el.querySelector('.element-content') ||
            el;
    }

    function getTargetNodeForInspection(overrideNode) {
        if (overrideNode && overrideNode.nodeType === 1) return overrideNode;
        const sel = window.getSelection();
        const curEl = (typeof state !== 'undefined' && state.selectedEl) ? state.selectedEl : null;
        const activeRange = (sel && sel.rangeCount > 0 && curEl && curEl.contains(sel.getRangeAt(0).commonAncestorContainer))
            ? sel.getRangeAt(0)
            : ((typeof state !== 'undefined' && state.lastRange && state.lastRange.commonAncestorContainer && state.lastRange.commonAncestorContainer.isConnected && (!curEl || curEl.contains(state.lastRange.commonAncestorContainer))) ? state.lastRange : null);

        if (activeRange) {
            let n = activeRange.startContainer;
            if (n.nodeType === 3) n = n.parentNode;
            const spanMatch = n && n.closest ? n.closest('.op-vf-span, [style*="font-variation-settings"], [style*="font-family"]') : null;
            if (spanMatch && (!curEl || curEl.contains(spanMatch))) return spanMatch;
            if (n && n.nodeType === 1) return n;
        }
        if (curEl) {
            const root = resolveEditableRoot(curEl);
            if (root) {
                const firstStyled = root.querySelector('.op-vf-span, [style*="font-variation-settings"], [style*="font-family"]');
                if (firstStyled) return firstStyled;
                return root;
            }
        }
        return null;
    }

    function inspectTarget(overrideNode) {
        const node = getTargetNodeForInspection(overrideNode);
        const curEl = (typeof state !== 'undefined' && state.selectedEl) ? state.selectedEl : null;
        let family = 'Segoe UI';
        let fontSizePx = 16;
        let rawVar = '';
        let opszMode = 'auto';
        let fontWeight = 400;

        if (node && node.nodeType === 1) {
            const comp = window.getComputedStyle(node);
            family = (node.getAttribute('data-vf-font') || (node.style && node.style.fontFamily) || comp.fontFamily || 'Segoe UI')
                .replace(/['"]/g, '').split(',')[0].trim();
            fontSizePx = parseFloat((node.style && node.style.fontSize) || comp.fontSize) || 16;
            rawVar = (node.style && node.style.fontVariationSettings) || node.getAttribute('data-vf-axes') || comp.fontVariationSettings || '';
            const explicitMode = node.getAttribute('data-vf-opsz-mode');
            if (explicitMode === 'manual' || explicitMode === 'auto') {
                opszMode = explicitMode;
            } else if (comp.fontOpticalSizing === 'none' || /['"]opsz['"]/.test(rawVar)) {
                opszMode = 'manual';
            }
            const parsedW = parseInt(comp.fontWeight, 10);
            if (!isNaN(parsedW)) fontWeight = parsedW;
        } else {
            const ribbonLbl = document.getElementById('ribbon-font-label');
            if (ribbonLbl && ribbonLbl.innerText.trim()) family = ribbonLbl.innerText.trim();
        }

        const fontDef = getFontDef(family);
        const parsedAxes = parseVariationSettings(rawVar);
        const effectiveAxes = {};
        if (fontDef && Array.isArray(fontDef.axes)) {
            fontDef.axes.forEach(a => {
                if (parsedAxes[a.tag] !== undefined) {
                    effectiveAxes[a.tag] = parsedAxes[a.tag];
                } else if (a.tag === 'wght' && fontWeight && fontWeight !== 400) {
                    effectiveAxes[a.tag] = Math.min(a.max, Math.max(a.min, fontWeight));
                } else if (a.tag === 'opsz' && opszMode === 'auto') {
                    const autoPt = parseFloat((fontSizePx * 0.75).toFixed(1));
                    effectiveAxes[a.tag] = Math.min(a.max, Math.max(a.min, autoPt));
                } else {
                    effectiveAxes[a.tag] = a.default;
                }
            });
        }

        let sampleText = '';
        if (curEl) {
            const root = resolveEditableRoot(curEl);
            if (root) sampleText = (root.innerText || '').trim();
        }

        return {
            node,
            selectedEl: curEl,
            family,
            fontDef,
            isVariable: !!fontDef,
            fontSizePx,
            fontSizePt: parseFloat((fontSizePx * 0.75).toFixed(1)),
            opszMode,
            axes: effectiveAxes,
            rawVariation: rawVar,
            sampleText
        };
    }

    function applyStylesToNode(targetNode, family, axes, opszMode, fontDef, isAutoSpan) {
        if (!targetNode || !targetNode.style) return;
        const hiddenMap = {};
        if (fontDef && Array.isArray(fontDef.axes)) {
            fontDef.axes.forEach(a => {
                if (a.hidden && Math.abs((axes[a.tag] ?? a.default) - a.default) < 0.0001) {
                    hiddenMap[a.tag] = false; // Omit un-edited hidden axes from inline CSS
                }
            });
        }
        const variationCss = formatVariationSettings(axes, opszMode, hiddenMap);
        if (family) targetNode.style.fontFamily = `"${family}", sans-serif`;
        targetNode.style.fontVariationSettings = variationCss;
        targetNode.style.fontOpticalSizing = (opszMode === 'auto') ? 'auto' : 'none';
        if (axes && axes.wght !== undefined) {
            targetNode.style.fontWeight = String(Math.round(axes.wght));
        } else {
            targetNode.style.fontWeight = '';
        }
        if (axes && axes.wdth !== undefined) {
            targetNode.style.fontStretch = `${parseFloat(Number(axes.wdth).toFixed(2))}%`;
        } else {
            targetNode.style.fontStretch = '';
        }
        if (axes && axes.slnt !== undefined) {
            targetNode.style.fontStyle = Math.abs(axes.slnt) >= 0.1 ? `oblique ${parseFloat((-axes.slnt).toFixed(1))}deg` : 'normal';
        } else if (axes && axes.ital !== undefined) {
            targetNode.style.fontStyle = axes.ital >= 0.5 ? 'italic' : 'normal';
        } else {
            targetNode.style.fontStyle = '';
        }
        targetNode.setAttribute('data-vf-font', family || '');
        targetNode.setAttribute('data-vf-axes', variationCss);
        targetNode.setAttribute('data-vf-opsz-mode', opszMode || 'auto');
        if (isAutoSpan) targetNode.classList.add('op-vf-span');
    }

    async function applyVariation(options) {
        const opts = options || {};
        const family = opts.family;
        const axes = opts.axes || {};
        const opszMode = opts.opszMode || 'auto';
        const skipHistory = !!opts.skipHistory;
        const targetEl = opts.targetEl || (typeof state !== 'undefined' ? state.selectedEl : null);
        const fontDef = getFontDef(family);
        const isLinkedChain = !!(targetEl && targetEl.getAttribute && (targetEl.getAttribute('data-next-box') || targetEl.getAttribute('data-prev-box')));

        if (family && fontDef) {
            await ensureFontLoaded(family);
        }

        if (typeof state !== 'undefined') state.isProgrammaticUpdate = true;
        try {
            if (!targetEl) {
                if (typeof window.setFloatFont === 'function' && family) {
                    window.setFloatFont(family);
                }
                syncRibbonUI();
                return;
            }

            if (!skipHistory && typeof window.pushHistory === 'function') {
                window.pushHistory(true);
            }

            // 1. Multi-cell table support
            if (Array.isArray(window._tableSelectedCells) && window._tableSelectedCells.length > 1) {
                window._tableSelectedCells.forEach(cell => {
                    const editable = cell.querySelector('[contenteditable="true"]') || cell;
                    applyStylesToNode(editable, family, axes, opszMode, fontDef, false);
                    editable.querySelectorAll('.op-vf-span, span[style*="font-variation-settings"], font[face]').forEach(child => {
                        applyStylesToNode(child, family, axes, opszMode, fontDef, false);
                        if (child.tagName === 'FONT') child.removeAttribute('face');
                    });
                });
            } else {
                // 2. Active non-collapsed text range support
                const sel = window.getSelection();
                const rangeCandidate = opts.targetRange ||
                    (sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed && targetEl.contains(sel.getRangeAt(0).commonAncestorContainer) ? sel.getRangeAt(0) : null) ||
                    (typeof state !== 'undefined' && state.lastRange && !state.lastRange.collapsed && state.lastRange.commonAncestorContainer && state.lastRange.commonAncestorContainer.isConnected && targetEl.contains(state.lastRange.commonAncestorContainer) ? state.lastRange : null);

                const waText = targetEl.querySelector ? targetEl.querySelector('.wa-text') : null;
                if (waText) {
                    applyStylesToNode(waText, family, axes, opszMode, fontDef, false);
                    waText.querySelectorAll('[style*="font-variation-settings"], [style*="font-family"]').forEach(ch => {
                        applyStylesToNode(ch, family, axes, opszMode, fontDef, false);
                    });
                    if (typeof window.syncWordArt === 'function') window.syncWordArt(targetEl);
                } else if (rangeCandidate && !rangeCandidate.collapsed) {
                    let existingSpan = null;
                    const sc = rangeCandidate.startContainer.nodeType === 3 ? rangeCandidate.startContainer.parentNode : rangeCandidate.startContainer;
                    if (sc && sc.closest) {
                        const closestSpan = sc.closest('.op-vf-span');
                        if (closestSpan && targetEl.contains(closestSpan) && closestSpan.textContent === rangeCandidate.toString()) {
                            existingSpan = closestSpan;
                        }
                    }
                    if (existingSpan) {
                        applyStylesToNode(existingSpan, family, axes, opszMode, fontDef, true);
                    } else {
                        const span = document.createElement('span');
                        applyStylesToNode(span, family, axes, opszMode, fontDef, true);
                        try {
                            const frag = rangeCandidate.extractContents();
                            frag.querySelectorAll('.op-vf-span, font[face]').forEach(inner => {
                                inner.style.fontFamily = '';
                                inner.style.fontVariationSettings = '';
                                inner.style.fontWeight = '';
                                inner.style.fontStretch = '';
                                inner.style.fontStyle = '';
                                inner.style.fontOpticalSizing = '';
                                if (inner.tagName === 'FONT') inner.removeAttribute('face');
                            });
                            span.appendChild(frag);
                            rangeCandidate.insertNode(span);
                            const nextRange = document.createRange();
                            nextRange.selectNodeContents(span);
                            if (typeof state !== 'undefined') state.lastRange = nextRange.cloneRange();
                            if (sel) {
                                sel.removeAllRanges();
                                sel.addRange(nextRange);
                            }
                        } catch (rangeErr) {
                            const root = resolveEditableRoot(targetEl);
                            if (root) applyStylesToNode(root, family, axes, opszMode, fontDef, false);
                        }
                    }
                } else {
                    // 3. Whole selected element / text box (propagate across linked chains)
                    const applyWholeBoxToRoot = (root) => {
                        if (!root) return;
                        applyStylesToNode(root, family, axes, opszMode, fontDef, false);
                        root.querySelectorAll('.op-vf-span, [style*="font-variation-settings"], [style*="font-family"], font[face]').forEach(child => {
                            applyStylesToNode(child, family, axes, opszMode, fontDef, child.classList.contains('op-vf-span'));
                            if (child.tagName === 'FONT') child.removeAttribute('face');
                        });
                    };
                    if (isLinkedChain && typeof window.applyToLinkedTextBoxChain === 'function') {
                        window.applyToLinkedTextBoxChain(targetEl, (box, boxContent) => {
                            applyWholeBoxToRoot(boxContent);
                        });
                    } else {
                        applyWholeBoxToRoot(resolveEditableRoot(targetEl));
                    }
                }
            }

            if (isLinkedChain) {
                if (!skipHistory && typeof window.flowTextBoxes === 'function') {
                    window.flowTextBoxes(targetEl);
                } else if (skipHistory && typeof window.scheduleTextFlow === 'function') {
                    window.scheduleTextFlow(targetEl, 16);
                }
            }

            if (family) {
                ['ribbon-font-label', 'float-font-label', 'ctx-font-label-text', 'ctx-font-label-wa'].forEach(id => {
                    const lbl = document.getElementById(id);
                    if (lbl) lbl.innerText = family;
                });
            }
            if (typeof window.forceRepaint === 'function') window.forceRepaint();
            if (!skipHistory) {
                if (typeof window.updateDocumentFontsSection === 'function') window.updateDocumentFontsSection(true);
                if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
                if (typeof window.pushHistory === 'function') window.pushHistory();
            }
        } finally {
            if (typeof state !== 'undefined') state.isProgrammaticUpdate = false;
        }
        syncRibbonUI();
    }

    function syncAutoOpticalSizeForElement(el, fontSizePx) {
        if (!el || isNaN(fontSizePx) || fontSizePx <= 0) return;
        const pt = parseFloat((fontSizePx * 0.75).toFixed(1));
        const syncSingleBox = (boxEl, rootEl) => {
            const nodes = [rootEl || resolveEditableRoot(boxEl), ...(boxEl ? Array.from(boxEl.querySelectorAll('[data-vf-font]')) : [])].filter(Boolean);
            const seen = new Set();
            nodes.forEach(n => {
                if (seen.has(n)) return;
                seen.add(n);
                if ((n.getAttribute('data-vf-opsz-mode') || 'auto') === 'auto') {
                    n.style.fontOpticalSizing = 'auto';
                    n.setAttribute('data-vf-opsz-auto-pt', String(pt));
                }
            });
        };
        const isLinkedChain = !!(el.getAttribute && (el.getAttribute('data-next-box') || el.getAttribute('data-prev-box')));
        if (isLinkedChain && typeof window.applyToLinkedTextBoxChain === 'function') {
            window.applyToLinkedTextBoxChain(el, (box, boxContent) => {
                syncSingleBox(box, boxContent);
            });
        } else {
            syncSingleBox(el, resolveEditableRoot(el));
        }
        if (window.VariableFontsUI && typeof window.VariableFontsUI.onExternalFontSizeChange === 'function') {
            window.VariableFontsUI.onExternalFontSizeChange(pt);
        }
    }

    function clearIncompatVariationsOnStaticFont(targetEl, fontName) {
        if (!targetEl || isVariableFont(fontName)) return;

        const sel = window.getSelection ? window.getSelection() : null;
        const rangeCandidate =
            (sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed && targetEl.contains(sel.getRangeAt(0).commonAncestorContainer) ? sel.getRangeAt(0) : null) ||
            (typeof state !== 'undefined' && state.lastRange && !state.lastRange.collapsed && state.lastRange.commonAncestorContainer && state.lastRange.commonAncestorContainer.isConnected && targetEl.contains(state.lastRange.commonAncestorContainer) ? state.lastRange : null);
        if (rangeCandidate && !rangeCandidate.collapsed) return;

        const clearRoot = (root) => {
            if (!root) return;
            [root, ...Array.from(root.querySelectorAll('.op-vf-span, [data-vf-font], [style*="font-variation-settings"]'))].forEach(n => {
                if (n.style) {
                    n.style.fontVariationSettings = '';
                    n.style.fontOpticalSizing = '';
                    n.style.fontStretch = '';
                }
                n.removeAttribute('data-vf-font');
                n.removeAttribute('data-vf-axes');
                n.removeAttribute('data-vf-opsz-mode');
                n.removeAttribute('data-vf-opsz-auto-pt');
            });
        };

        const isLinkedChain = !!(targetEl.getAttribute && (targetEl.getAttribute('data-next-box') || targetEl.getAttribute('data-prev-box')));
        if (isLinkedChain && typeof window.applyToLinkedTextBoxChain === 'function') {
            window.applyToLinkedTextBoxChain(targetEl, (box, boxContent) => {
                clearRoot(boxContent);
            });
        } else {
            clearRoot(resolveEditableRoot(targetEl));
        }
    }

    function syncRibbonUI(overrideNode) {
        const info = inspectTarget(overrideNode);
        const btnIds = ['ribbon-vf-btn', 'float-vf-btn', 'ctx-vf-btn-text', 'ctx-vf-btn-wa'];
        const summary = info.isVariable
            ? `${info.family} (${info.fontDef.axes.filter(a => !a.hidden).length} axes)`
            : 'Variable Font Studio (VF)';
        btnIds.forEach(id => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.classList.toggle('vf-active', !!info.isVariable);
            btn.title = info.isVariable ? `Variable Font Axes: ${summary}` : 'Open Variable Font Axes & Studio';
        });
        if (window.VariableFontsUI && typeof window.VariableFontsUI.syncFromCanvas === 'function') {
            window.VariableFontsUI.syncFromCanvas(info);
        }
    }

    // =========================================================================
    // USER PRESETS (localStorage)
    // =========================================================================
    function getUserPresets() {
        try {
            const raw = localStorage.getItem(STORAGE_PRESETS_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (e) {
            return [];
        }
    }

    function saveUserPreset(name, family, axes, opszMode) {
        const presets = getUserPresets();
        const entry = {
            id: 'preset-' + Date.now(),
            name: String(name || 'Custom Style').trim().slice(0, 40),
            family: String(family || ''),
            axes: Object.assign({}, axes || {}),
            opszMode: opszMode || 'auto'
        };
        presets.unshift(entry);
        const trimmed = presets.slice(0, 30);
        try { localStorage.setItem(STORAGE_PRESETS_KEY, JSON.stringify(trimmed)); } catch (e) {}
        return trimmed;
    }

    function deleteUserPreset(id) {
        const next = getUserPresets().filter(p => p.id !== id);
        try { localStorage.setItem(STORAGE_PRESETS_KEY, JSON.stringify(next)); } catch (e) {}
        return next;
    }

    // =========================================================================
    // .OPUB PERSISTENCE & EXPORT / PRINT BAKING PIPELINE
    // =========================================================================
    function getUsedVariableFontsInDocument(docOrPages) {
        const usedMap = new Map();
        const addIfVf = (fam) => {
            if (!fam || typeof fam !== 'string') return;
            const clean = fam.replace(/['"]/g, '').trim();
            if (!clean) return;
            const def = getFontDef(clean);
            if (def && !usedMap.has(def.family.toLowerCase())) {
                usedMap.set(def.family.toLowerCase(), def);
            }
        };

        const scanFontListString = (rawList) => {
            if (!rawList || typeof rawList !== 'string') return;
            rawList.split(',').forEach(part => addIfVf(part));
        };

        const scanHtmlStr = (html) => {
            if (!html || typeof html !== 'string') return;
            const mList = html.match(/data-vf-font\s*=\s*["']([^"']+)["']/gi);
            if (mList) {
                mList.forEach(m => {
                    const f = m.replace(/data-vf-font\s*=\s*["']?/i, '').replace(/["']$/, '').trim();
                    addIfVf(f);
                });
            }
            const decoded = html
                .replace(/&quot;/gi, "'")
                .replace(/&#39;|&apos;|&#x27;/gi, "'");
            const ffRegex = /font-family\s*:\s*([^;}"<>]+)/gi;
            let match;
            while ((match = ffRegex.exec(decoded)) !== null) {
                scanFontListString(match[1]);
            }
        };

        const pagesToScan = Array.isArray(docOrPages)
            ? docOrPages
            : ((docOrPages && Array.isArray(docOrPages.pages)) ? docOrPages.pages : null);

        if (!pagesToScan) {
            if (typeof window.getDocumentFonts === 'function') {
                window.getDocumentFonts().forEach(addIfVf);
            }
            const livePaper = document.getElementById('paper');
            if (livePaper) {
                livePaper.querySelectorAll('[data-vf-font]').forEach(el => addIfVf(el.getAttribute('data-vf-font')));
                livePaper.querySelectorAll('[style*="font-family"]').forEach(el => {
                    if (el.style && el.style.fontFamily) scanFontListString(el.style.fontFamily);
                });
            }
        }

        const targetPages = pagesToScan || ((typeof state !== 'undefined' && Array.isArray(state.pages)) ? state.pages : []);
        targetPages.forEach(p => {
            if (!p) return;
            if (Array.isArray(p.elements)) {
                p.elements.forEach(e => {
                    if (e.fontFamily) scanFontListString(e.fontFamily);
                    if (e.contentCssText) scanHtmlStr(e.contentCssText);
                    if (e.innerHTML) scanHtmlStr(e.innerHTML);
                });
            }
            if (p.header) scanHtmlStr(p.header);
            if (p.footer) scanHtmlStr(p.footer);
        });
        return Array.from(usedMap.values());
    }

    function getExportFontDataForOpub() {
        const used = getUsedVariableFontsInDocument();
        if (used.length === 0 && customFontsMap.size === 0) return null;
        const googleFamilies = [];
        const embeddedCustom = [];
        used.forEach(def => {
            if (def.isCustom) {
                embeddedCustom.push({
                    id: def.id,
                    family: def.family,
                    fileName: def.fileName,
                    mime: def.mime,
                    format: def.format,
                    dataUri: def.dataUri,
                    axes: def.axes,
                    instances: def.instances
                });
            } else {
                googleFamilies.push(def.family);
            }
        });
        // Also embed custom fonts currently loaded in document library even if only saved for later use
        customFontsMap.forEach(def => {
            if (!embeddedCustom.some(c => c.family.toLowerCase() === def.family.toLowerCase())) {
                embeddedCustom.push({
                    id: def.id,
                    family: def.family,
                    fileName: def.fileName,
                    mime: def.mime,
                    format: def.format,
                    dataUri: def.dataUri,
                    axes: def.axes,
                    instances: def.instances
                });
            }
        });
        return { googleFamilies, customFonts: embeddedCustom };
    }

    async function ensureDocumentFontsLoaded(docOrPages) {
        const used = getUsedVariableFontsInDocument(docOrPages);
        if (used.length === 0) return false;
        let loadedAny = false;
        const tasks = [];
        used.forEach(def => {
            if (!def || def.isCustom) return;
            const key = def.family.toLowerCase();
            if (!loadedGoogleLinks.has(key)) loadedAny = true;
            tasks.push(ensureFontLoaded(def.family));
        });
        if (tasks.length > 0) {
            await Promise.all(tasks);
        }
        if (loadedAny && document.fonts && document.fonts.ready) {
            await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]);
        }
        return loadedAny;
    }

    async function restoreFromOpub(vfData, docData) {
        let loadedAny = false;
        if (vfData && Array.isArray(vfData.customFonts) && vfData.customFonts.length > 0) {
            const customTasks = [];
            vfData.customFonts.forEach(cf => {
                if (cf && cf.family && cf.dataUri) {
                    loadedAny = true;
                    customTasks.push(registerCustomFont(Object.assign({ category: 'custom', isCustom: true }, cf), true));
                }
            });
            if (customTasks.length > 0) {
                await Promise.all(customTasks);
            }
        }

        const familiesToLoad = new Map();
        const addFam = (fam) => {
            if (!fam || typeof fam !== 'string') return;
            const def = getFontDef(fam);
            if (def && !def.isCustom) {
                familiesToLoad.set(def.family.toLowerCase(), def.family);
            }
        };

        if (vfData && Array.isArray(vfData.googleFamilies)) {
            vfData.googleFamilies.forEach(addFam);
        }
        getUsedVariableFontsInDocument(docData).forEach(def => {
            if (def && !def.isCustom) addFam(def.family);
        });

        const googleTasks = [];
        familiesToLoad.forEach((fam, key) => {
            if (!loadedGoogleLinks.has(key)) loadedAny = true;
            googleTasks.push(ensureFontLoaded(fam));
        });
        if (googleTasks.length > 0) {
            await Promise.all(googleTasks);
        }
        if (loadedAny && document.fonts && document.fonts.ready) {
            await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]);
        }
        return loadedAny;
    }

    function buildExportFontHeadHTML(embedCustomBase64 = true) {
        const used = getUsedVariableFontsInDocument();
        let html = '';
        used.forEach(def => {
            if (def.isCustom && embedCustomBase64 && def.dataUri) {
                html += `\n    <style>
@font-face {
    font-family: "${def.family.replace(/"/g, '\\"')}";
    src: url("${def.dataUri}") format("${def.format || 'truetype'}");
    font-weight: 1 1000;
    font-stretch: 25% 200%;
    font-style: oblique -20deg 20deg;
    font-display: swap;
}
    </style>`;
            } else if (!def.isCustom) {
                const url = buildGoogleFontsURL(def.family, def, false);
                if (url) html += `\n    <link href="${url}" rel="stylesheet">`;
            }
        });
        return html;
    }

    // Inline @font-face CSS fetcher for high-res SVG <foreignObject> baking (fixes html2canvas ignoring font-variation-settings)
    const inlineCssCache = new Map();
    async function buildInlineFontFaceCSSForFamilies(families) {
        const blocks = [];
        for (const fam of families) {
            const def = getFontDef(fam);
            if (!def) continue;
            const key = def.family.toLowerCase();
            if (def.isCustom && def.dataUri) {
                blocks.push(`@font-face { font-family: "${def.family}"; src: url("${def.dataUri}") format("${def.format || 'truetype'}"); font-weight: 1 1000; font-stretch: 25% 200%; font-style: oblique -20deg 20deg; }`);
                continue;
            }
            if (inlineCssCache.has(key)) {
                blocks.push(inlineCssCache.get(key));
                continue;
            }
            const url = buildGoogleFontsURL(def.family, def, false);
            if (!url) continue;
            try {
                const res = await Promise.race([
                    fetch(url),
                    new Promise((_, rej) => setTimeout(() => rej(new Error('css timeout')), 2500))
                ]);
                if (!res.ok) continue;
                let cssText = await res.text();
                const urlMatches = Array.from(cssText.matchAll(/url\((https?:\/\/[^)]+)\)/g));
                for (const m of urlMatches) {
                    const fontUrl = m[1].replace(/['"]/g, '');
                    try {
                        const fRes = await Promise.race([
                            fetch(fontUrl),
                            new Promise((_, rej) => setTimeout(() => rej(new Error('woff2 timeout')), 2500))
                        ]);
                        if (fRes.ok) {
                            const buf = await fRes.arrayBuffer();
                            const b64 = `data:font/woff2;base64,${arrayBufferToBase64(buf)}`;
                            cssText = cssText.split(fontUrl).join(b64);
                        }
                    } catch (e) {}
                }
                inlineCssCache.set(key, cssText);
                blocks.push(cssText);
            } catch (e) {}
        }
        return blocks.join('\n');
    }

    const CLONED_STYLE_PROPS = [
        'fontFamily', 'fontSize', 'fontWeight', 'fontStretch', 'fontStyle',
        'fontOpticalSizing', 'fontKerning', 'fontFeatureSettings',
        'lineHeight', 'letterSpacing', 'color', 'textAlign',
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
        'boxSizing', 'whiteSpace', 'wordBreak', 'overflowWrap',
        'textDecoration', 'textTransform', 'textShadow', 'direction',
        'textIndent', 'verticalAlign'
    ];

    function serializeComputedStyledClone(srcNode) {
        const clone = srcNode.cloneNode(true);
        const origList = [srcNode, ...Array.from(srcNode.querySelectorAll('*'))];
        const cloneList = [clone, ...Array.from(clone.querySelectorAll('*'))];
        for (let i = 0; i < cloneList.length; i++) {
            const c = cloneList[i];
            const o = origList[i];
            if (!o || o.nodeType !== 1) continue;
            const cs = window.getComputedStyle(o);
            if (cs.fontVariationSettings && cs.fontVariationSettings !== 'normal') {
                c.style.fontVariationSettings = cs.fontVariationSettings;
            }
            for (const prop of CLONED_STYLE_PROPS) {
                if (cs[prop]) c.style[prop] = cs[prop];
            }
            c.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
        }
        return clone;
    }

    function measureVisualOverflowMetrics(contentEl, boxW, boxH) {
        let minLeft = 0;
        let minTop = 0;
        let maxRight = Math.max(boxW, Math.ceil(contentEl.scrollWidth || 0));
        let maxBottom = Math.max(boxH, Math.ceil(contentEl.scrollHeight || 0));
        let maxFontPx = parseFloat(window.getComputedStyle(contentEl).fontSize) || 16;

        const cr = contentEl.getBoundingClientRect ? contentEl.getBoundingClientRect() : null;
        const hasRect = !!(cr && cr.width > 0 && cr.height > 0);
        const includeRect = (r) => {
            if (!r || !hasRect || (r.width === 0 && r.height === 0)) return;
            minLeft = Math.min(minLeft, r.left - cr.left);
            minTop = Math.min(minTop, r.top - cr.top);
            maxRight = Math.max(maxRight, r.right - cr.left);
            maxBottom = Math.max(maxBottom, r.bottom - cr.top);
        };

        contentEl.querySelectorAll('*').forEach(el => {
            const fs = parseFloat(window.getComputedStyle(el).fontSize);
            if (!isNaN(fs) && fs > maxFontPx) maxFontPx = fs;
            if (hasRect && el.getBoundingClientRect) includeRect(el.getBoundingClientRect());
        });

        if (hasRect && document.createRange) {
            try {
                const range = document.createRange();
                range.selectNodeContents(contentEl);
                includeRect(range.getBoundingClientRect());
            } catch (e) {}
        }

        return { minLeft, minTop, maxRight, maxBottom, maxFontPx };
    }

    async function bakeVariableFontElementsForCanvas(container, scaleMultiplier) {
        if (!container || typeof container.querySelectorAll !== 'function') return;
        const scale = Math.max(1.5, Math.min(4, parseFloat(scaleMultiplier) || 2));
        const vfNodes = Array.from(container.querySelectorAll('[data-vf-axes], [data-vf-font], [style*="font-variation-settings"], .op-vf-span'));
        if (vfNodes.length === 0) return;

        const targetBoxes = new Set();
        vfNodes.forEach(n => {
            const pubEl = n.closest('.pub-element') || n.closest('[data-type]') || n;
            if (pubEl && !pubEl.querySelector('.wa-baked-img')) {
                targetBoxes.add(pubEl);
            }
        });
        if (targetBoxes.size === 0) return;

        const familiesSet = new Set();
        vfNodes.forEach(n => {
            const fAttr = n.getAttribute('data-vf-font') || (n.style && n.style.fontFamily) || '';
            const clean = fAttr.replace(/['"]/g, '').split(',')[0].trim();
            if (clean && isVariableFont(clean)) familiesSet.add(clean);
        });
        if (familiesSet.size === 0) return;

        const fontFaceCSS = await buildInlineFontFaceCSSForFamilies(Array.from(familiesSet));
        if (!fontFaceCSS) return;

        for (const box of targetBoxes) {
            try {
                const contentEl = box.querySelector('.element-content') || box;
                const isLinkedBox = box.hasAttribute('data-next-box') || box.hasAttribute('data-prev-box');
                const boxW = Math.max(10, Math.round(contentEl.offsetWidth || box.offsetWidth || parseFloat(box.style.width) || 300));
                const boxH = Math.max(10, Math.round(contentEl.offsetHeight || box.offsetHeight || parseFloat(box.style.height) || 100));

                let padLeft = 0, padRight = 0, padTop = 0, padBottom = 0;
                if (!isLinkedBox) {
                    const m = measureVisualOverflowMetrics(contentEl, boxW, boxH);
                    padLeft = Math.max(24, Math.ceil(Math.max(0, -m.minLeft) + m.maxFontPx * 0.45));
                    padRight = Math.max(24, Math.ceil(Math.max(0, m.maxRight - boxW) + m.maxFontPx * 0.45));
                    padTop = Math.max(24, Math.ceil(Math.max(0, -m.minTop) + m.maxFontPx * 0.45));
                    padBottom = Math.max(36, Math.ceil(Math.max(0, m.maxBottom - boxH) + m.maxFontPx * 0.85));
                }

                const totalW = Math.min(4096, Math.round(boxW + padLeft + padRight));
                const totalH = Math.min(4096, Math.round(boxH + padTop + padBottom));
                const maxDim = Math.max(totalW, totalH);
                const effScale = maxDim * scale > 4096 ? Math.max(1, 4096 / maxDim) : scale;

                const styledNode = serializeComputedStyledClone(contentEl);
                styledNode.style.width = boxW + 'px';
                styledNode.style.height = isLinkedBox ? (boxH + 'px') : 'auto';
                styledNode.style.minHeight = boxH + 'px';
                styledNode.style.overflow = isLinkedBox ? 'hidden' : 'visible';
                styledNode.style.margin = '0';
                styledNode.style.position = 'relative';
                styledNode.style.background = 'transparent';
                styledNode.style.border = 'none';
                styledNode.style.boxShadow = 'none';
                styledNode.style.outline = 'none';

                const xhtml = new XMLSerializer().serializeToString(styledNode);
                const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
                    <foreignObject x="0" y="0" width="${totalW}" height="${totalH}">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${totalW}px;height:${totalH}px;padding:${padTop}px 0 0 ${padLeft}px;box-sizing:border-box;overflow:${isLinkedBox ? 'hidden' : 'visible'};">
                            <style>${fontFaceCSS}</style>
                            ${xhtml}
                        </div>
                    </foreignObject>
                </svg>`;
                const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
                const img = new Image();
                await new Promise((resolve, reject) => {
                    const t = setTimeout(() => reject(new Error('vf svg timeout')), 3000);
                    img.onload = () => { clearTimeout(t); resolve(); };
                    img.onerror = (err) => { clearTimeout(t); reject(err); };
                    img.src = svgUrl;
                });

                const cvs = document.createElement('canvas');
                cvs.width = Math.round(totalW * effScale);
                cvs.height = Math.round(totalH * effScale);
                const ctx = cvs.getContext('2d');
                ctx.scale(effScale, effScale);
                ctx.drawImage(img, 0, 0, totalW, totalH);

                const pngUrl = cvs.toDataURL('image/png');
                const outImg = document.createElement('img');
                outImg.className = 'op-vf-baked-img';
                outImg.src = pngUrl;
                outImg.style.cssText = `position:absolute; top:${-padTop}px; left:${-padLeft}px; width:${totalW}px; height:${totalH}px; max-width:none; max-height:none; object-fit:fill; pointer-events:none; border:none; outline:none; display:block;`;
                await new Promise(r => {
                    if (outImg.complete) return r();
                    outImg.onload = r;
                    outImg.onerror = r;
                    setTimeout(r, 400);
                });
                contentEl.innerHTML = '';
                contentEl.appendChild(outImg);
                if (!isLinkedBox) {
                    box.style.overflow = 'visible';
                    contentEl.style.overflow = 'visible';
                    if (!contentEl.style.position || contentEl.style.position === 'static') {
                        contentEl.style.position = 'relative';
                    }
                }
            } catch (err) {
                console.warn('[VariableFonts] Skipping print bake fallback for element:', err);
            }
        }
    }

    // Merge catalog fonts into global window.fontList immediately if already loaded, and restore saved custom fonts
    function bootstrapEngine() {
        if (typeof window.fontList !== 'undefined' && Array.isArray(window.fontList)) {
            let added = false;
            CATALOG.forEach(item => {
                if (!window.fontList.some(f => f.toLowerCase() === item.family.toLowerCase())) {
                    window.fontList.push(item.family);
                    added = true;
                }
            });
            if (added) {
                window.fontList.sort();
                if (typeof window.rebuildFontPickers === 'function') {
                    window.rebuildFontPickers();
                }
            }
        }
        loadSavedCustomFonts();
    }

    const VariableFontsEngine = {
        AXIS_META,
        CATALOG,
        getAllVariableFonts() {
            return [...Array.from(customFontsMap.values()), ...CATALOG];
        },
        getCustomFonts() {
            return Array.from(customFontsMap.values());
        },
        getFontDef,
        isVariableFont,
        isCustomVariableFont,
        getVisibleAxes,
        hasCustomAxes,
        buildGoogleFontsURL,
        ensureFontLoaded,
        parseOpenTypeVariableFont,
        registerCustomFont,
        removeCustomFont,
        parseVariationSettings,
        formatVariationSettings,
        inspectTarget,
        applyVariation,
        syncAutoOpticalSizeForElement,
        clearIncompatVariationsOnStaticFont,
        syncRibbonUI,
        getUserPresets,
        saveUserPreset,
        deleteUserPreset,
        getUsedVariableFontsInDocument,
        ensureDocumentFontsLoaded,
        getExportFontDataForOpub,
        restoreFromOpub,
        buildExportFontHeadHTML,
        bakeVariableFontElementsForCanvas,
        bootstrapEngine
    };

    window.VariableFontsEngine = VariableFontsEngine;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrapEngine);
    } else {
        bootstrapEngine();
    }
})(window);
