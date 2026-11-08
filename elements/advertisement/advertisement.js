/**
 * OpenPublisher Modern Advertisement & Promotional Badge Engine (v5.19.1)
 * High-aesthetic vector badges, retail starbursts, 3D folded ribbons,
 * guarantee seals, coupons, and modern status indicators.
 * Fully scalable, non-distorting typography, losslessly serializable,
 * and 300+ DPI vector crisp.
 */

(function(window) {
    'use strict';

    // --- COLOR UTILITIES ---
    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const num = parseInt(hex, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    function isColorLight(hex) {
        const { r, g, b } = hexToRgb(hex);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return yiq >= 150;
    }

    function adjustColorBrightness(hex, percent) {
        const { r, g, b } = hexToRgb(hex);
        const factor = 1 + percent;
        return rgbToHex(r * factor, g * factor, b * factor);
    }

    function makeSolidPalette(hex) {
        const cleanHex = hex.startsWith('#') ? hex : '#' + hex;
        const isLight = isColorLight(cleanHex);
        const primary = cleanHex;
        const secondary = adjustColorBrightness(cleanHex, isLight ? -0.15 : -0.2);
        const accent = isLight ? adjustColorBrightness(cleanHex, -0.3) : adjustColorBrightness(cleanHex, 0.45);
        const border = isLight ? adjustColorBrightness(cleanHex, -0.45) : adjustColorBrightness(cleanHex, -0.35);
        const text = isLight ? '#0f172a' : '#ffffff';
        const subtext = isLight ? '#334155' : '#f8fafc';

        return {
            id: cleanHex,
            name: `Solid (${cleanHex.toUpperCase()})`,
            isSolid: true,
            primary: primary,
            secondary: secondary,
            gradient: [primary, secondary],
            accent: accent,
            light: isLight ? primary : adjustColorBrightness(cleanHex, 0.6),
            text: text,
            subtext: subtext,
            border: border
        };
    }

    // --- CURATED COLOR PALETTES ---
    const PALETTES = {
        'publisher-teal': {
            id: 'publisher-teal',
            name: 'Publisher Teal',
            primary: '#0f766e',
            secondary: '#115e59',
            gradient: ['#14b8a6', '#0f766e'],
            accent: '#5eead4',
            light: '#f0fdfa',
            text: '#ffffff',
            subtext: '#ccfbf1',
            border: '#042f2e'
        },
        'ruby-crimson': {
            id: 'ruby-crimson',
            name: 'Ruby Crimson',
            primary: '#e11d48',
            secondary: '#be123c',
            gradient: ['#fb7185', '#be123c'],
            accent: '#fda4af',
            light: '#fff1f2',
            text: '#ffffff',
            subtext: '#ffe4e6',
            border: '#881337'
        },
        'electric-cobalt': {
            id: 'electric-cobalt',
            name: 'Electric Cobalt',
            primary: '#2563eb',
            secondary: '#1d4ed8',
            gradient: ['#60a5fa', '#1e40af'],
            accent: '#93c5fd',
            light: '#eff6ff',
            text: '#ffffff',
            subtext: '#dbeafe',
            border: '#172554'
        },
        'sunset-tangerine': {
            id: 'sunset-tangerine',
            name: 'Sunset Tangerine',
            primary: '#ea580c',
            secondary: '#c2410c',
            gradient: ['#fb923c', '#9a3412'],
            accent: '#fed7aa',
            light: '#fff7ed',
            text: '#ffffff',
            subtext: '#ffedd5',
            border: '#7c2d12'
        },
        'emerald-deal': {
            id: 'emerald-deal',
            name: 'Emerald Deal',
            primary: '#059669',
            secondary: '#047857',
            gradient: ['#34d399', '#065f46'],
            accent: '#86efac',
            light: '#ecfdf5',
            text: '#ffffff',
            subtext: '#d1fae5',
            border: '#022c22'
        },
        'royal-purple': {
            id: 'royal-purple',
            name: 'Royal Purple',
            primary: '#7c3aed',
            secondary: '#5b21b6',
            gradient: ['#a78bfa', '#4c1d95'],
            accent: '#c4b5fd',
            light: '#f5f3ff',
            text: '#ffffff',
            subtext: '#ede9fe',
            border: '#2e1065'
        },
        'luxury-gold': {
            id: 'luxury-gold',
            name: 'Luxury Gold & Onyx',
            primary: '#0f172a',
            secondary: '#1e293b',
            gradient: ['#fbbf24', '#b45309'],
            accent: '#fef08a',
            light: '#fefce8',
            text: '#fef08a',
            subtext: '#fde047',
            border: '#451a03'
        },
        'neon-cyber': {
            id: 'neon-cyber',
            name: 'Cyber Neon',
            primary: '#0f172a',
            secondary: '#020617',
            gradient: ['#06b6d4', '#ec4899'],
            accent: '#06b6d4',
            light: '#083344',
            text: '#ffffff',
            subtext: '#67e8f9',
            border: '#0891b2'
        },
        'dark-titanium': {
            id: 'dark-titanium',
            name: 'Dark Titanium',
            primary: '#1e293b',
            secondary: '#0f172a',
            gradient: ['#475569', '#0f172a'],
            accent: '#cbd5e1',
            light: '#334155',
            text: '#f8fafc',
            subtext: '#94a3b8',
            border: '#020617'
        }
    };

    function escapeXml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    function generateUid() {
        return 'op_ad_' + Math.random().toString(36).substr(2, 9);
    }

    // Mathematical Starburst Generator
    function makeStarPoints(cx, cy, pts, outerR, innerR) {
        const points = [];
        for (let i = 0; i < pts * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const a = (i * Math.PI / pts) - Math.PI / 2;
            points.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
        }
        return points.join(' ');
    }

    // Mathematical Polygon Generator
    function makePolygonPoints(cx, cy, sides, r, rotation = 0) {
        const points = [];
        for (let i = 0; i < sides; i++) {
            const a = (i * 2 * Math.PI / sides) - Math.PI / 2 + rotation;
            points.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
        }
        return points.join(' ');
    }

    let currentTextOffsets = { x: 0, y: 0, gap: 0, scaleX: 1.0 };

    // Text formatter: scales font based on text length and multi-line breaks with crisp modern typography,
    // and supports precise vertical offset/padding, horizontal offset, and line spacing adjustments (v5.19.1)
    function renderSvgText(text, subtext, cx, cy, font, textColor, subColor, uid, maxWidth = 130, optOffsetX = null, optOffsetY = null, optGap = null, optScaleX = null) {
        text = text || 'SALE';
        const lines = text.split(/<br\s*[\/]?>|\n/gi).map(s => s.trim()).filter(Boolean);
        const hasSub = subtext && subtext.trim().length > 0;
        font = font || 'Montserrat';

        const offX = (optOffsetX !== null && optOffsetX !== undefined) ? optOffsetX : (currentTextOffsets.x || 0);
        const offY = (optOffsetY !== null && optOffsetY !== undefined) ? optOffsetY : (currentTextOffsets.y || 0);
        const offGap = (optGap !== null && optGap !== undefined) ? optGap : (currentTextOffsets.gap || 0);
        let scaleX = (optScaleX !== null && optScaleX !== undefined) ? optScaleX : (currentTextOffsets.scaleX !== undefined ? currentTextOffsets.scaleX : 1.0);
        if (scaleX > 3) scaleX = scaleX / 100.0;
        scaleX = Math.max(0.4, Math.min(1.6, scaleX));

        const isHeavyDisplay = (font === 'Impact' || font === 'Arial Black');
        // Prevent browser faux-bold bloating on inherently heavy fonts like Impact
        const mainWeight = isHeavyDisplay ? 'normal' : '800';
        const letterSpacing = isHeavyDisplay ? '0.8' : '0.5';

        let baseFontSize = 28;
        const longestLine = lines.reduce((max, l) => l.length > max ? l.length : max, 0);
        if (longestLine > 14) baseFontSize = 15;
        else if (longestLine > 10) baseFontSize = 18;
        else if (longestLine > 7) baseFontSize = 22;
        else if (longestLine > 5) baseFontSize = 25;
        else if (longestLine > 3) baseFontSize = 28;
        else baseFontSize = 32;

        if (lines.length > 2) baseFontSize = Math.min(baseFontSize, 16);
        if (hasSub) baseFontSize = Math.min(baseFontSize, 24);

        const lineSpacingAdj = lines.length > 1 ? (offGap * 0.35) : 0;
        const lineHeight = Math.max(12, (baseFontSize * 1.15) + lineSpacingAdj);
        const totalHeight = lines.length * lineHeight;
        const textStartY = (cy + offY) - (totalHeight / 2) + (lineHeight / 2) - (hasSub ? 7 : 0);
        const textCenterX = cx + offX;

        let out = '';
        lines.forEach((line, idx) => {
            const y = textStartY + (idx * lineHeight);
            out += `<text x="${textCenterX.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="${font}, 'Segoe UI', system-ui, sans-serif" font-weight="${mainWeight}" font-size="${baseFontSize}px" fill="${textColor}" filter="url(#${uid}_tshadow)" letter-spacing="${letterSpacing}">${escapeXml(line)}</text>`;
        });

        if (hasSub) {
            const subY = textStartY + totalHeight + 3 + offGap;
            const subFont = Math.max(9, Math.min(12, Math.round(baseFontSize * 0.44)));
            // Subtext is always rendered with clean, high-legibility geometric sans-serif
            const subFontFamily = isHeavyDisplay ? "'Montserrat', 'Segoe UI', system-ui, sans-serif" : `${font}, 'Segoe UI', system-ui, sans-serif`;
            out += `<text x="${textCenterX.toFixed(1)}" y="${subY.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="${subFontFamily}" font-weight="600" font-size="${subFont}px" fill="${subColor}" letter-spacing="1.5" opacity="0.95">${escapeXml(subtext)}</text>`;
        }

        let transformAttr = '';
        if (Math.abs(scaleX - 1.0) > 0.005) {
            const matrixTransX = (textCenterX * (1 - scaleX)).toFixed(2);
            transformAttr = ` transform="matrix(${scaleX.toFixed(3)} 0 0 1 ${matrixTransX} 0)"`;
        }
        return `<g class="ad-text-block" data-text-block="true"${transformAttr} style="cursor:move;">${out}</g>`;
    }

    // Helper for common gradient and shadow defs
    function makeCommonDefs(uid, c) {
        return `
            <defs>
                <linearGradient id="${uid}_bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="${c.gradient[0]}"/>
                    <stop offset="100%" stop-color="${c.gradient[1]}"/>
                </linearGradient>
                <radialGradient id="${uid}_rad" cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stop-color="${c.gradient[0]}"/>
                    <stop offset="100%" stop-color="${c.gradient[1]}"/>
                </radialGradient>
                <filter id="${uid}_shadow" x="-10%" y="-10%" width="125%" height="125%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
                </filter>
                <filter id="${uid}_tshadow">
                    <feDropShadow dx="0" dy="1.2" stdDeviation="0.5" flood-color="rgba(0,0,0,0.25)"/>
                </filter>
            </defs>
        `;
    }

    // --- PRESETS CATALOG (34 Presets) ---
    const AD_PRESETS = [
        // 1. SALES & BURSTS
        {
            id: 'burst_classic_ruby',
            name: 'Classic 16-Pt Starburst',
            category: 'Sales & Bursts',
            defaultText: 'BIG SALE',
            defaultSubtext: 'LIMITED TIME',
            defaultPalette: 'ruby-crimson',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const starPts = makeStarPoints(100, 100, 16, 92, 72);
                const innerPts = makeStarPoints(100, 100, 16, 82, 64);
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${starPts}" fill="url(#${uid}_rad)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <polygon points="${innerPts}" fill="none" stroke="${c.accent}" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.8"/>
                    <circle cx="100" cy="100" r="54" fill="none" stroke="${c.accent}" stroke-width="1.2" opacity="0.6"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'burst_crimson_gold',
            name: '24-Pt Gold Rim Burst',
            category: 'Sales & Bursts',
            defaultText: 'HOT DEAL',
            defaultSubtext: 'TODAY ONLY',
            defaultPalette: 'luxury-gold',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const starPts = makeStarPoints(100, 100, 24, 94, 78);
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${starPts}" fill="url(#${uid}_bg)" stroke="${c.accent}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="66" fill="none" stroke="${c.accent}" stroke-width="2"/>
                    <circle cx="100" cy="100" r="62" fill="none" stroke="${c.border}" stroke-width="1" stroke-dasharray="2,3"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'burst_publisher_teal',
            name: 'Publisher Teal Super Deal',
            category: 'Sales & Bursts',
            defaultText: 'SPECIAL',
            defaultSubtext: 'BEST VALUE',
            defaultPalette: 'publisher-teal',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const starPts = makeStarPoints(100, 100, 20, 94, 76);
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${starPts}" fill="url(#${uid}_rad)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="64" fill="none" stroke="${c.accent}" stroke-width="2"/>
                    <circle cx="100" cy="100" r="59" fill="none" stroke="${c.light}" stroke-width="1.2" stroke-dasharray="3,2"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'burst_flash_flame',
            name: 'Flash Sale Flame Burst',
            category: 'Sales & Bursts',
            defaultText: 'FLASH',
            defaultSubtext: 'SALE',
            defaultPalette: 'sunset-tangerine',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const starPts = makeStarPoints(100, 100, 12, 95, 60);
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${starPts}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="52" fill="none" stroke="${c.accent}" stroke-width="1.8"/>
                    <circle cx="100" cy="100" r="48" fill="none" stroke="${c.light}" stroke-width="1" stroke-dasharray="2,2"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'burst_mega_violet',
            name: '32-Pt Micro-Scallop Rosette',
            category: 'Sales & Bursts',
            defaultText: 'MEGA SALE',
            defaultSubtext: 'EXCLUSIVE',
            defaultPalette: 'royal-purple',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const starPts = makeStarPoints(100, 100, 32, 94, 84);
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${starPts}" fill="url(#${uid}_rad)" stroke="${c.border}" stroke-width="2.2" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="70" fill="none" stroke="${c.accent}" stroke-width="1.8"/>
                    <circle cx="100" cy="100" r="66" fill="none" stroke="${c.light}" stroke-width="1" stroke-dasharray="4,2"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'burst_sunburst_orange',
            name: 'Radial Sunburst Stamp',
            category: 'Sales & Bursts',
            defaultText: 'WOW!',
            defaultSubtext: "DON'T MISS OUT",
            defaultPalette: 'sunset-tangerine',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const starPts = makeStarPoints(100, 100, 18, 93, 70);
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${starPts}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="56" fill="none" stroke="${c.accent}" stroke-width="1.5" stroke-dasharray="4,4"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'burst_onyx_neon',
            name: 'Onyx & Cyber Neon Starburst',
            category: 'Sales & Bursts',
            defaultText: 'EXCLUSIVE',
            defaultSubtext: 'VIP ACCESS',
            defaultPalette: 'neon-cyber',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const starPts = makeStarPoints(100, 100, 16, 92, 70);
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${starPts}" fill="url(#${uid}_bg)" stroke="${c.accent}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="58" fill="none" stroke="${c.accent}" stroke-width="1.5" stroke-dasharray="3,2"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'burst_lightning_deal',
            name: 'Flash Lightning Deal',
            category: 'Sales & Bursts',
            defaultText: 'LIGHTNING',
            defaultSubtext: 'DEAL OF THE DAY',
            defaultPalette: 'sunset-tangerine',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const starPts = makeStarPoints(100, 100, 16, 92, 74);
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${starPts}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="64" fill="none" stroke="${c.accent}" stroke-width="1.8"/>
                    <path d="M 32 100 L 42 86 L 38 98 L 48 98 L 38 114 L 40 102 Z" fill="${c.accent}"/>
                    <path d="M 168 100 L 158 86 L 162 98 L 152 98 L 162 114 L 160 102 Z" fill="${c.accent}"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'burst_atomic_star',
            name: 'Atomic 8-Pt Flare',
            category: 'Sales & Bursts',
            defaultText: 'SUPER',
            defaultSubtext: 'PROMOTION',
            defaultPalette: 'electric-cobalt',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const starPts = makeStarPoints(100, 100, 8, 96, 55);
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${starPts}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="68" fill="none" stroke="${c.accent}" stroke-width="1.5" stroke-dasharray="4,3"/>
                    <circle cx="100" cy="100" r="54" fill="none" stroke="${c.light}" stroke-width="1"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },

        {
            id: 'burst_nova_flare',
            name: 'Supernova 24-Ray Flare',
            category: 'Sales & Bursts',
            defaultText: 'MEGA DEAL',
            defaultSubtext: 'SPECIAL EVENT',
            defaultPalette: 'ruby-crimson',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const pts = [];
                for (let i = 0; i < 24; i++) {
                    const rOuter = (i % 2 === 0) ? 94 : 84;
                    const aOuter = (i * Math.PI / 12) - Math.PI / 2;
                    pts.push(`${(100 + rOuter * Math.cos(aOuter)).toFixed(1)},${(100 + rOuter * Math.sin(aOuter)).toFixed(1)}`);
                    const aInner = aOuter + (Math.PI / 24);
                    pts.push(`${(100 + 68 * Math.cos(aInner)).toFixed(1)},${(100 + 68 * Math.sin(aInner)).toFixed(1)}`);
                }
                const starPoints = pts.join(' ');
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${starPoints}" fill="url(#${uid}_rad)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="66" fill="none" stroke="${c.accent}" stroke-width="2"/>
                    <circle cx="100" cy="100" r="62" fill="none" stroke="${c.light}" stroke-width="1.2" stroke-dasharray="3,3"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'burst_retro_flower',
            name: 'Retro 16-Petal Rosette',
            category: 'Sales & Bursts',
            defaultText: 'EPIC SALE',
            defaultSubtext: 'ALL STYLES',
            defaultPalette: 'emerald-deal',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const pts = [];
                const totalPts = 64;
                for (let i = 0; i < totalPts; i++) {
                    const a = (i * 2 * Math.PI / totalPts) - Math.PI / 2;
                    const r = 84 + 9 * Math.cos(16 * a);
                    pts.push(`${(100 + r * Math.cos(a)).toFixed(1)},${(100 + r * Math.sin(a)).toFixed(1)}`);
                }
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${pts.join(' ')}" fill="url(#${uid}_rad)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="68" fill="none" stroke="${c.accent}" stroke-width="1.8" stroke-dasharray="4,2"/>
                    <circle cx="100" cy="100" r="63" fill="none" stroke="${c.light}" stroke-width="1"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },

        // 2. DISCOUNTS & OFFERS
        {
            id: 'discount_50_circle',
            name: '50% OFF Stitched Double Ring',
            category: 'Discounts & Offers',
            defaultText: '50% OFF',
            defaultSubtext: 'ALL ITEMS',
            defaultPalette: 'ruby-crimson',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <circle cx="100" cy="100" r="90" fill="url(#${uid}_rad)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="82" fill="none" stroke="${c.accent}" stroke-width="2" stroke-dasharray="5,3"/>
                    <circle cx="100" cy="100" r="74" fill="none" stroke="${c.border}" stroke-width="1"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'discount_70_slash',
            name: '70% OFF Cobalt Slash',
            category: 'Discounts & Offers',
            defaultText: '70% OFF',
            defaultSubtext: 'ALL STORE',
            defaultPalette: 'electric-cobalt',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <rect x="12" y="12" width="176" height="176" rx="88" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="78" fill="none" stroke="${c.accent}" stroke-width="2" stroke-dasharray="4,2"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'discount_bogo_token',
            name: 'BOGO Stadium Token',
            category: 'Discounts & Offers',
            defaultText: 'BUY 1 GET 1',
            defaultSubtext: 'FREE',
            defaultPalette: 'emerald-deal',
            width: 200,
            height: 150,
            aspect: 1.33,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <rect x="10" y="15" width="180" height="120" rx="60" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <rect x="18" y="23" width="164" height="104" rx="52" fill="none" stroke="${c.accent}" stroke-width="2" stroke-dasharray="4,3"/>
                    ${renderSvgText(t, st, 100, 75, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'discount_save_big',
            name: 'Save Big Faceted Hexagon',
            category: 'Discounts & Offers',
            defaultText: 'SAVE BIG',
            defaultSubtext: 'UP TO 60%',
            defaultPalette: 'sunset-tangerine',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const hexPts = makePolygonPoints(100, 100, 6, 92, Math.PI / 6);
                const innerHex = makePolygonPoints(100, 100, 6, 80, Math.PI / 6);
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${hexPts}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <polygon points="${innerHex}" fill="none" stroke="${c.accent}" stroke-width="2" stroke-dasharray="4,2"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'discount_diamond_luxe',
            name: 'Diamond Facet Deal',
            category: 'Discounts & Offers',
            defaultText: 'SPECIAL',
            defaultSubtext: '50% SAVINGS',
            defaultPalette: 'luxury-gold',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const outer = "100,10 190,100 100,190 10,100";
                const inner = "100,24 176,100 100,176 24,100";
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${outer}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <polygon points="${inner}" fill="none" stroke="${c.accent}" stroke-width="1.8" stroke-dasharray="3,2"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'discount_clearance_slash',
            name: 'Clearance Price Slash',
            category: 'Discounts & Offers',
            defaultText: 'CLEARANCE',
            defaultSubtext: 'FINAL REDUCTIONS',
            defaultPalette: 'ruby-crimson',
            width: 190,
            height: 160,
            aspect: 1.18,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <circle cx="95" cy="80" r="72" fill="url(#${uid}_rad)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <g transform="rotate(-6 95 80)">
                        <rect x="10" y="58" width="170" height="44" rx="6" fill="${c.secondary}" stroke="${c.accent}" stroke-width="2"/>
                        ${renderSvgText(t, st, 95, 80, f, c.text, c.subtext, uid)}
                    </g>
                `;
            }
        },

        {
            id: 'discount_half_price_split',
            name: 'Half Price Diagonal Split',
            category: 'Discounts & Offers',
            defaultText: '1/2 PRICE',
            defaultSubtext: 'STOREWIDE',
            defaultPalette: 'ruby-crimson',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <circle cx="100" cy="100" r="88" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <path d="M 38 162 L 162 38 A 88 88 0 0 1 38 162 Z" fill="${c.secondary}" opacity="0.6"/>
                    <line x1="38" y1="162" x2="162" y2="38" stroke="${c.accent}" stroke-width="2"/>
                    <circle cx="100" cy="100" r="76" fill="none" stroke="${c.accent}" stroke-width="1.8" stroke-dasharray="4,3"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'discount_bogo_hex_crest',
            name: 'BOGO Free Hex Crest',
            category: 'Discounts & Offers',
            defaultText: 'BUY 1 GET 1',
            defaultSubtext: 'FREE OF CHARGE',
            defaultPalette: 'electric-cobalt',
            width: 190,
            height: 180,
            aspect: 1.05,
            buildSvg: (c, t, st, f, uid) => {
                const hexPts = makePolygonPoints(100, 95, 6, 85, 0);
                const innerHex = makePolygonPoints(100, 95, 6, 75, 0);
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${hexPts}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <polygon points="${innerHex}" fill="none" stroke="${c.accent}" stroke-width="1.8" stroke-dasharray="4,2.5"/>
                    <rect x="55" y="24" width="90" height="4" rx="2" fill="${c.accent}"/>
                    <rect x="55" y="162" width="90" height="4" rx="2" fill="${c.accent}"/>
                    ${renderSvgText(t, st, 100, 95, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'discount_corner_notch_card',
            name: 'Corner-Clipped Discount Token',
            category: 'Discounts & Offers',
            defaultText: 'EXTRA 25%',
            defaultSubtext: 'AT CHECKOUT',
            defaultPalette: 'sunset-tangerine',
            width: 200,
            height: 160,
            aspect: 1.25,
            buildSvg: (c, t, st, f, uid) => {
                const outerCard = "M 38 15 L 162 15 L 185 38 L 185 122 L 162 145 L 38 145 L 15 122 L 15 38 Z";
                const innerCard = "M 42 23 L 158 23 L 177 42 L 177 118 L 158 137 L 42 137 L 23 118 L 23 42 Z";
                return `
                    ${makeCommonDefs(uid, c)}
                    <path d="${outerCard}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <path d="${innerCard}" fill="none" stroke="${c.accent}" stroke-width="1.8" stroke-dasharray="4,3"/>
                    <circle cx="28" cy="28" r="3" fill="${c.accent}"/>
                    <circle cx="172" cy="28" r="3" fill="${c.accent}"/>
                    <circle cx="28" cy="132" r="3" fill="${c.accent}"/>
                    <circle cx="172" cy="132" r="3" fill="${c.accent}"/>
                    ${renderSvgText(t, st, 100, 80, f, c.text, c.subtext, uid)}
                `;
            }
        },

        // 3. RIBBONS & BANNERS
        {
            id: 'ribbon_3d_ruby',
            name: 'Ruby Red 3D Folded Ribbon',
            category: 'Ribbons & Banners',
            defaultText: 'SPECIAL OFFER',
            defaultSubtext: 'ENDS SUNDAY',
            defaultPalette: 'ruby-crimson',
            width: 240,
            height: 110,
            aspect: 2.18,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <g filter="url(#${uid}_shadow)">
                        <!-- Left Fold -->
                        <polygon points="35,35 10,48 35,62 35,48" fill="${c.border}"/>
                        <polygon points="10,48 35,35 35,65 10,78 22,63" fill="${c.secondary}" stroke="${c.border}" stroke-width="1.5"/>
                        <!-- Right Fold -->
                        <polygon points="205,35 230,48 205,62 205,48" fill="${c.border}"/>
                        <polygon points="230,48 205,35 205,65 230,78 218,63" fill="${c.secondary}" stroke="${c.border}" stroke-width="1.5"/>
                        <!-- Center Ribbon Banner -->
                        <rect x="25" y="24" width="190" height="52" rx="4" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2"/>
                        <rect x="30" y="28" width="180" height="44" rx="2" fill="none" stroke="${c.accent}" stroke-width="1.2" stroke-dasharray="3,2" opacity="0.8"/>
                    </g>
                    ${renderSvgText(t, st, 120, 50, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'ribbon_3d_teal',
            name: 'Publisher Teal 3D Banner',
            category: 'Ribbons & Banners',
            defaultText: 'NEW ARRIVAL',
            defaultSubtext: 'SPRING COLLECTION',
            defaultPalette: 'publisher-teal',
            width: 240,
            height: 110,
            aspect: 2.18,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <g filter="url(#${uid}_shadow)">
                        <polygon points="35,35 10,48 35,62 35,48" fill="${c.border}"/>
                        <polygon points="10,48 35,35 35,65 10,78 22,63" fill="${c.secondary}" stroke="${c.border}" stroke-width="1.5"/>
                        <polygon points="205,35 230,48 205,62 205,48" fill="${c.border}"/>
                        <polygon points="230,48 205,35 205,65 230,78 218,63" fill="${c.secondary}" stroke="${c.border}" stroke-width="1.5"/>
                        <rect x="25" y="24" width="190" height="52" rx="4" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2"/>
                        <rect x="30" y="28" width="180" height="44" rx="2" fill="none" stroke="${c.accent}" stroke-width="1.2" stroke-dasharray="3,2"/>
                    </g>
                    ${renderSvgText(t, st, 120, 50, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'ribbon_3d_gold',
            name: 'Imperial Gold 3D Banner',
            category: 'Ribbons & Banners',
            defaultText: 'PREMIUM QUALITY',
            defaultSubtext: 'GUARANTEED',
            defaultPalette: 'luxury-gold',
            width: 240,
            height: 110,
            aspect: 2.18,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <g filter="url(#${uid}_shadow)">
                        <polygon points="35,35 10,48 35,62 35,48" fill="${c.border}"/>
                        <polygon points="10,48 35,35 35,65 10,78 22,63" fill="${c.secondary}" stroke="${c.border}" stroke-width="1.5"/>
                        <polygon points="205,35 230,48 205,62 205,48" fill="${c.border}"/>
                        <polygon points="230,48 205,35 205,65 230,78 218,63" fill="${c.secondary}" stroke="${c.border}" stroke-width="1.5"/>
                        <rect x="25" y="24" width="190" height="52" rx="4" fill="url(#${uid}_bg)" stroke="${c.accent}" stroke-width="2.5"/>
                        <rect x="30" y="28" width="180" height="44" rx="2" fill="none" stroke="${c.border}" stroke-width="1"/>
                    </g>
                    ${renderSvgText(t, st, 120, 50, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'ribbon_award_rosette',
            name: 'Award Trophy Rosette',
            category: 'Ribbons & Banners',
            defaultText: '#1 CHOICE',
            defaultSubtext: 'TOP RATED',
            defaultPalette: 'royal-purple',
            width: 180,
            height: 220,
            aspect: 0.82,
            buildSvg: (c, t, st, f, uid) => {
                const starPts = makeStarPoints(90, 80, 24, 76, 66);
                return `
                    ${makeCommonDefs(uid, c)}
                    <g filter="url(#${uid}_shadow)">
                        <!-- Hanging Tails -->
                        <polygon points="65,120 50,210 75,195 85,210 80,120" fill="${c.secondary}" stroke="${c.border}" stroke-width="1.5"/>
                        <polygon points="115,120 100,210 115,195 130,210 125,120" fill="${c.secondary}" stroke="${c.border}" stroke-width="1.5"/>
                        <!-- Center Medallion -->
                        <polygon points="${starPts}" fill="url(#${uid}_rad)" stroke="${c.border}" stroke-width="2.5"/>
                        <circle cx="90" cy="80" r="56" fill="none" stroke="${c.accent}" stroke-width="2" stroke-dasharray="3,2"/>
                    </g>
                    ${renderSvgText(t, st, 90, 80, f, c.text, c.subtext, uid)}
                `;
            }
        },

        {
            id: 'ribbon_dual_fishtail',
            name: 'Dual Fishtail Header Sash',
            category: 'Ribbons & Banners',
            defaultText: 'SPECIAL OFFER',
            defaultSubtext: 'EXCLUSIVE SELECTION',
            defaultPalette: 'ruby-crimson',
            width: 240,
            height: 110,
            aspect: 2.18,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <path d="M 15 38 L 56 38 L 56 82 L 15 82 L 30 60 Z" fill="${c.secondary}" stroke="${c.border}" stroke-width="2"/>
                    <path d="M 225 38 L 184 38 L 184 82 L 225 82 L 210 60 Z" fill="${c.secondary}" stroke="${c.border}" stroke-width="2"/>
                    <polygon points="56,72 56,82 66,72" fill="${c.border}"/>
                    <polygon points="184,72 184,82 174,72" fill="${c.border}"/>
                    <rect x="52" y="24" width="136" height="48" rx="4" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <rect x="56" y="28" width="128" height="40" rx="2" fill="none" stroke="${c.accent}" stroke-width="1.2" stroke-dasharray="3,2"/>
                    ${renderSvgText(t, st, 120, 48, f, c.text, c.subtext, uid, 120)}
                `;
            }
        },
        {
            id: 'ribbon_diagonal_corner_sash',
            name: 'Angled Corner Ribbon Sash',
            category: 'Ribbons & Banners',
            defaultText: 'NEW ARRIVAL',
            defaultSubtext: 'JUST IN',
            defaultPalette: 'emerald-deal',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <g transform="rotate(-32 90 90)">
                        <polygon points="-8,72 -8,108 8,90" fill="${c.border}"/>
                        <polygon points="188,72 188,108 172,90" fill="${c.border}"/>
                        <rect x="-4" y="66" width="188" height="48" rx="4" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                        <line x1="2" y1="72" x2="178" y2="72" stroke="${c.accent}" stroke-width="1.5"/>
                        <line x1="2" y1="108" x2="178" y2="108" stroke="${c.accent}" stroke-width="1.5"/>
                        ${renderSvgText(t, st, 90, 90, f, c.text, c.subtext, uid, 140)}
                    </g>
                `;
            }
        },
        {
            id: 'ribbon_grand_winner_pennant',
            name: 'Grand Prize Winner Pennant',
            category: 'Ribbons & Banners',
            defaultText: '#1 BEST',
            defaultSubtext: "EDITOR'S CHOICE",
            defaultPalette: 'luxury-gold',
            width: 160,
            height: 210,
            aspect: 0.76,
            buildSvg: (c, t, st, f, uid) => {
                const pennant = "M 25 25 L 135 25 L 135 155 L 80 195 L 25 155 Z";
                const innerPennant = "M 32 32 L 128 32 L 128 148 L 80 183 L 32 148 Z";
                return `
                    ${makeCommonDefs(uid, c)}
                    <rect x="15" y="15" width="130" height="10" rx="4" fill="${c.border}" filter="url(#${uid}_shadow)"/>
                    <circle cx="18" cy="20" r="6" fill="${c.accent}"/>
                    <circle cx="142" cy="20" r="6" fill="${c.accent}"/>
                    <path d="${pennant}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <path d="${innerPennant}" fill="none" stroke="${c.accent}" stroke-width="1.8" stroke-dasharray="4,2.5"/>
                    <polygon points="80,40 83,49 92,49 85,55 87,64 80,59 73,64 75,55 68,49 77,49" fill="${c.accent}" stroke="${c.border}" stroke-width="1"/>
                    ${renderSvgText(t, st, 80, 98, f, c.text, c.subtext, uid, 90)}
                `;
            }
        },

        // 4. SEALS & EMBLEMS
        {
            id: 'seal_guarantee_100',
            name: '100% Guarantee Rosette Seal',
            category: 'Seals & Emblems',
            defaultText: '100%',
            defaultSubtext: 'SATISFACTION GUARANTEED',
            defaultPalette: 'emerald-deal',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const star8 = makeStarPoints(100, 100, 24, 94, 84);
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${star8}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="76" fill="none" stroke="${c.accent}" stroke-width="2" stroke-dasharray="3,2"/>
                    <circle cx="100" cy="100" r="72" fill="none" stroke="${c.border}" stroke-width="1"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'seal_certified_stamp',
            name: 'Official Certified Stamp',
            category: 'Seals & Emblems',
            defaultText: 'CERTIFIED',
            defaultSubtext: 'AUTHENTIC QUALITY',
            defaultPalette: 'electric-cobalt',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <circle cx="100" cy="100" r="88" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="80" fill="none" stroke="${c.accent}" stroke-width="2.5" stroke-dasharray="4,3"/>
                    <circle cx="100" cy="100" r="72" fill="none" stroke="${c.light}" stroke-width="1.2"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'seal_top_pick',
            name: 'Customer 5-Star Top Pick',
            category: 'Seals & Emblems',
            defaultText: 'TOP PICK',
            defaultSubtext: '5-STAR RATED',
            defaultPalette: 'luxury-gold',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const deca = makePolygonPoints(100, 100, 12, 92, 0);
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${deca}" fill="url(#${uid}_bg)" stroke="${c.accent}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="74" fill="none" stroke="${c.accent}" stroke-width="1.8" stroke-dasharray="3,2"/>
                    <!-- 5 Stars Icon Row -->
                    <g fill="${c.accent}" transform="translate(68, 56) scale(0.65)">
                        <polygon points="10,1 13,7 19,7 14,11 16,17 10,13 4,17 6,11 1,7 7,7"/>
                        <polygon points="28,1 31,7 37,7 32,11 34,17 28,13 22,17 24,11 19,7 25,7"/>
                        <polygon points="46,1 49,7 55,7 50,11 52,17 46,13 40,17 42,11 37,7 43,7"/>
                        <polygon points="64,1 67,7 73,7 68,11 70,17 64,13 58,17 60,11 55,7 61,7"/>
                        <polygon points="82,1 85,7 91,7 86,11 88,17 82,13 76,17 78,11 73,7 79,7"/>
                    </g>
                    ${renderSvgText(t, st, 100, 110, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'seal_eco_organic',
            name: 'Eco Botanical Seal',
            category: 'Seals & Emblems',
            defaultText: 'ORGANIC',
            defaultSubtext: '100% NATURAL',
            defaultPalette: 'emerald-deal',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <circle cx="100" cy="100" r="88" fill="url(#${uid}_rad)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <circle cx="100" cy="100" r="76" fill="none" stroke="${c.accent}" stroke-width="1.8" stroke-dasharray="4,2"/>
                    <!-- Botanical Leaves -->
                    <path d="M 85 52 C 85 40, 100 36, 100 48 C 100 36, 115 40, 115 52 C 115 62, 100 66, 100 66 C 100 66, 85 62, 85 52 Z" fill="${c.accent}"/>
                    ${renderSvgText(t, st, 100, 106, f, c.text, c.subtext, uid)}
                `;
            }
        },

        {
            id: 'seal_shield_of_trust',
            name: 'Shield of Trust Security Emblem',
            category: 'Seals & Emblems',
            defaultText: 'VERIFIED',
            defaultSubtext: '100% SECURE',
            defaultPalette: 'publisher-teal',
            width: 180,
            height: 200,
            aspect: 0.9,
            buildSvg: (c, t, st, f, uid) => {
                const shield = "M 90 15 C 135 15, 165 25, 165 42 C 165 125, 125 172, 90 190 C 55 172, 15 125, 15 42 C 15 25, 45 15, 90 15 Z";
                const innerShield = "M 90 24 C 128 24, 154 33, 154 48 C 154 118, 120 160, 90 176 C 60 160, 26 118, 26 48 C 26 33, 52 24, 90 24 Z";
                return `
                    ${makeCommonDefs(uid, c)}
                    <path d="${shield}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <path d="${innerShield}" fill="none" stroke="${c.accent}" stroke-width="2"/>
                    <circle cx="90" cy="54" r="15" fill="${c.accent}"/>
                    <path d="M 83 54 L 88 59 L 98 48" stroke="${c.border}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    ${renderSvgText(t, st, 90, 118, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'seal_vintage_notary_wax',
            name: 'Vintage Notary Wax Stamp',
            category: 'Seals & Emblems',
            defaultText: 'AUTHENTIC',
            defaultSubtext: 'PREMIUM QUALITY',
            defaultPalette: 'ruby-crimson',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const pts = [];
                const total = 54;
                for (let i = 0; i < total; i++) {
                    const a = (i * 2 * Math.PI / total) - Math.PI / 2;
                    const r = 85 + 6 * Math.sin(18 * a);
                    pts.push(`${(90 + r * Math.cos(a)).toFixed(1)},${(90 + r * Math.sin(a)).toFixed(1)}`);
                }
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${pts.join(' ')}" fill="url(#${uid}_rad)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <circle cx="90" cy="90" r="70" fill="none" stroke="${c.accent}" stroke-width="2"/>
                    <circle cx="90" cy="90" r="65" fill="none" stroke="${c.light}" stroke-width="1.5" stroke-dasharray="3,3"/>
                    <circle cx="90" cy="90" r="56" fill="none" stroke="${c.accent}" stroke-width="1.2"/>
                    ${renderSvgText(t, st, 90, 90, f, c.text, c.subtext, uid)}
                `;
            }
        },

        // 5. MODERN & MINIMAL
        {
            id: 'modern_pill_indicator',
            name: 'Publisher Teal Status Pill',
            category: 'Modern & Minimal',
            defaultText: 'IN STOCK',
            defaultSubtext: 'READY TO SHIP',
            defaultPalette: 'publisher-teal',
            width: 210,
            height: 90,
            aspect: 2.33,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <rect x="10" y="15" width="190" height="60" rx="30" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2" filter="url(#${uid}_shadow)"/>
                    <circle cx="36" cy="45" r="8" fill="${c.accent}"/>
                    <circle cx="36" cy="45" r="4" fill="#ffffff"/>
                    ${renderSvgText(t, st, 116, 45, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'modern_gradient_capsule',
            name: 'Cyber Cyan Gradient Capsule',
            category: 'Modern & Minimal',
            defaultText: 'TRENDING',
            defaultSubtext: 'POPULAR CHOICE',
            defaultPalette: 'neon-cyber',
            width: 210,
            height: 90,
            aspect: 2.33,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <rect x="10" y="15" width="190" height="60" rx="30" fill="url(#${uid}_bg)" stroke="${c.accent}" stroke-width="2" filter="url(#${uid}_shadow)"/>
                    <rect x="14" y="19" width="182" height="52" rx="26" fill="none" stroke="${c.light}" stroke-width="1" opacity="0.6"/>
                    ${renderSvgText(t, st, 105, 45, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'modern_titanium_tag',
            name: 'Dark Titanium Chamfer Tag',
            category: 'Modern & Minimal',
            defaultText: 'FEATURED',
            defaultSubtext: 'EDITOR CHOICE',
            defaultPalette: 'dark-titanium',
            width: 200,
            height: 100,
            aspect: 2,
            buildSvg: (c, t, st, f, uid) => {
                const tagPts = "24,15 190,15 190,85 24,85 10,50";
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${tagPts}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <circle cx="28" cy="50" r="5" fill="${c.accent}" stroke="${c.border}" stroke-width="1.5"/>
                    ${renderSvgText(t, st, 110, 50, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'modern_neon_glitch',
            name: 'Cyber Glow Hexagon',
            category: 'Modern & Minimal',
            defaultText: 'NEXT GEN',
            defaultSubtext: 'CYBER DEAL',
            defaultPalette: 'neon-cyber',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const hex1 = makePolygonPoints(100, 100, 6, 90, 0);
                const hex2 = makePolygonPoints(100, 100, 6, 78, 0);
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${hex1}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <polygon points="${hex2}" fill="none" stroke="${c.accent}" stroke-width="2" stroke-dasharray="6,4"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },

        {
            id: 'modern_split_duotone_capsule',
            name: 'Duotone Split Status Capsule',
            category: 'Modern & Minimal',
            defaultText: 'ON SALE',
            defaultSubtext: 'IN STOCK NOW',
            defaultPalette: 'publisher-teal',
            width: 220,
            height: 90,
            aspect: 2.44,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <rect x="10" y="10" width="200" height="70" rx="35" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <circle cx="45" cy="45" r="24" fill="${c.primary}" stroke="${c.accent}" stroke-width="2"/>
                    <circle cx="45" cy="45" r="8" fill="${c.accent}"/>
                    <rect x="14" y="14" width="192" height="62" rx="31" fill="none" stroke="${c.accent}" stroke-width="1.2" opacity="0.6"/>
                    ${renderSvgText(t, st, 128, 45, f, c.text, c.subtext, uid, 110)}
                `;
            }
        },
        {
            id: 'modern_isometric_cube_tag',
            name: 'Isometric Diamond Badge',
            category: 'Modern & Minimal',
            defaultText: 'NEXT GEN',
            defaultSubtext: 'TECH CHOICE',
            defaultPalette: 'neon-cyber',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                const diamond = "90,12 168,90 90,168 12,90";
                const innerDiamond = "90,22 158,90 90,158 22,90";
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${diamond}" fill="url(#${uid}_bg)" stroke="${c.accent}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <polygon points="${innerDiamond}" fill="none" stroke="${c.light}" stroke-width="1.5" stroke-dasharray="4,2"/>
                    <line x1="90" y1="22" x2="90" y2="158" stroke="${c.accent}" stroke-width="1" opacity="0.4"/>
                    <line x1="22" y1="90" x2="158" y2="90" stroke="${c.accent}" stroke-width="1" opacity="0.4"/>
                    ${renderSvgText(t, st, 90, 90, f, c.text, c.subtext, uid)}
                `;
            }
        },

        // 6. RETAIL & COUPONS
        {
            id: 'retail_perforated_coupon',
            name: 'Perforated Coupon Stub',
            category: 'Retail & Coupons',
            defaultText: '$20 OFF',
            defaultSubtext: 'CODE: SAVE20',
            defaultPalette: 'sunset-tangerine',
            width: 220,
            height: 110,
            aspect: 2,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <g filter="url(#${uid}_shadow)">
                        <path d="M 10 15 L 210 15 L 210 45 A 10 10 0 0 0 210 65 L 210 95 L 10 95 L 10 65 A 10 10 0 0 0 10 45 Z" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2.5"/>
                        <!-- Perforated tear line -->
                        <line x1="160" y1="18" x2="160" y2="92" stroke="${c.accent}" stroke-width="2" stroke-dasharray="3,3"/>
                    </g>
                    ${renderSvgText(t, st, 85, 55, f, c.text, c.subtext, uid)}
                    <text x="185" y="55" text-anchor="middle" dominant-baseline="central" font-family="'Montserrat', sans-serif" font-weight="700" font-size="10px" fill="${c.accent}" transform="rotate(-90 185 55)">COUPON</text>
                `;
            }
        },
        {
            id: 'retail_price_tag',
            name: 'Craft Merchandise Price Tag',
            category: 'Retail & Coupons',
            defaultText: 'HOT PRICE',
            defaultSubtext: "DON'T MISS OUT",
            defaultPalette: 'publisher-teal',
            width: 220,
            height: 120,
            aspect: 1.83,
            buildSvg: (c, t, st, f, uid) => {
                const tag = "45,15 210,15 210,105 45,105 10,60";
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${tag}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <circle cx="32" cy="60" r="8" fill="#ffffff" stroke="${c.border}" stroke-width="2"/>
                    <rect x="52" y="24" width="148" height="72" rx="4" fill="none" stroke="${c.accent}" stroke-width="1.5" stroke-dasharray="3,2"/>
                    ${renderSvgText(t, st, 126, 60, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'retail_barcode_voucher',
            name: 'Barcode Voucher Stamp',
            category: 'Retail & Coupons',
            defaultText: 'VOUCHER',
            defaultSubtext: 'SCAN TO REDEEM',
            defaultPalette: 'emerald-deal',
            width: 210,
            height: 120,
            aspect: 1.75,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <rect x="10" y="10" width="190" height="100" rx="8" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <rect x="18" y="18" width="174" height="84" rx="4" fill="none" stroke="${c.accent}" stroke-width="1.2" stroke-dasharray="4,2"/>
                    <!-- Simulated Barcode Lines at Bottom -->
                    <g fill="${c.text}" opacity="0.8">
                        <rect x="35" y="86" width="3" height="10"/>
                        <rect x="42" y="86" width="2" height="10"/>
                        <rect x="48" y="86" width="5" height="10"/>
                        <rect x="57" y="86" width="2" height="10"/>
                        <rect x="63" y="86" width="4" height="10"/>
                        <rect x="71" y="86" width="1" height="10"/>
                        <rect x="76" y="86" width="6" height="10"/>
                        <rect x="86" y="86" width="3" height="10"/>
                        <rect x="93" y="86" width="2" height="10"/>
                        <rect x="99" y="86" width="5" height="10"/>
                        <rect x="108" y="86" width="2" height="10"/>
                        <rect x="114" y="86" width="4" height="10"/>
                        <rect x="122" y="86" width="3" height="10"/>
                        <rect x="129" y="86" width="5" height="10"/>
                        <rect x="138" y="86" width="2" height="10"/>
                        <rect x="144" y="86" width="4" height="10"/>
                        <rect x="152" y="86" width="2" height="10"/>
                        <rect x="158" y="86" width="5" height="10"/>
                        <rect x="167" y="86" width="3" height="10"/>
                    </g>
                    ${renderSvgText(t, st, 105, 48, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'retail_price_drop_bubble',
            name: 'Price Drop Speech Bubble',
            category: 'Retail & Coupons',
            defaultText: 'PRICE DROP',
            defaultSubtext: 'SAVE NOW',
            defaultPalette: 'ruby-crimson',
            width: 200,
            height: 140,
            aspect: 1.43,
            buildSvg: (c, t, st, f, uid) => {
                const bubble = "M 15 15 L 185 15 C 192 15 195 18 195 25 L 195 95 C 195 102 192 105 185 105 L 85 105 L 50 130 L 60 105 L 15 105 C 8 105 5 102 5 95 L 5 25 C 5 18 8 15 15 15 Z";
                return `
                    ${makeCommonDefs(uid, c)}
                    <path d="${bubble}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <rect x="14" y="24" width="172" height="72" rx="4" fill="none" stroke="${c.accent}" stroke-width="1.2" stroke-dasharray="3,2"/>
                    ${renderSvgText(t, st, 100, 60, f, c.text, c.subtext, uid)}
                `;
            }
        },

        {
            id: 'retail_twin_stub_ticket',
            name: 'Cinema Twin-Stub Admit Ticket',
            category: 'Retail & Coupons',
            defaultText: 'VIP PASS',
            defaultSubtext: 'ADMIT ONE',
            defaultPalette: 'luxury-gold',
            width: 220,
            height: 120,
            aspect: 1.83,
            buildSvg: (c, t, st, f, uid) => {
                const ticket = "M 12 10 L 208 10 A 1 1 0 0 1 208 10 L 208 45 A 15 15 0 0 0 208 75 L 208 110 L 12 110 L 12 75 A 15 15 0 0 0 12 45 L 12 10 Z";
                return `
                    ${makeCommonDefs(uid, c)}
                    <path d="${ticket}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="2.5" filter="url(#${uid}_shadow)"/>
                    <line x1="62" y1="12" x2="62" y2="108" stroke="${c.accent}" stroke-width="2" stroke-dasharray="4,4"/>
                    <polygon points="36,46 39,54 48,54 41,60 43,68 36,63 29,68 31,60 24,54 33,54" fill="${c.accent}"/>
                    ${renderSvgText(t, st, 135, 60, f, c.text, c.subtext, uid, 110)}
                `;
            }
        },
        {
            id: 'retail_gift_box_ribbon_tag',
            name: 'Holiday Gift Present Tag',
            category: 'Retail & Coupons',
            defaultText: 'FREE GIFT',
            defaultSubtext: 'WITH PURCHASE',
            defaultPalette: 'ruby-crimson',
            width: 180,
            height: 190,
            aspect: 0.95,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <path d="M 90 44 C 65 14, 45 32, 85 44 Z" fill="${c.accent}" stroke="${c.border}" stroke-width="1.5"/>
                    <path d="M 90 44 C 115 14, 135 32, 95 44 Z" fill="${c.accent}" stroke="${c.border}" stroke-width="1.5"/>
                    <circle cx="90" cy="44" r="7" fill="${c.border}"/>
                    <rect x="25" y="44" width="130" height="132" rx="8" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <rect x="20" y="44" width="140" height="24" rx="4" fill="${c.secondary}" stroke="${c.border}" stroke-width="2"/>
                    <rect x="80" y="44" width="20" height="132" fill="${c.accent}" opacity="0.85"/>
                    <rect x="31" y="74" width="118" height="96" rx="4" fill="none" stroke="${c.light}" stroke-width="1.2" stroke-dasharray="3,3"/>
                    ${renderSvgText(t, st, 90, 122, f, c.text, c.subtext, uid, 105)}
                `;
            }
        },

        // 7. URGENCY & STOCK
        {
            id: 'urgency_24h_flash',
            name: '24-Hour Countdown Timer Badge',
            category: 'Urgency & Stock',
            defaultText: '24 HOURS',
            defaultSubtext: 'TIME RUNNING OUT',
            defaultPalette: 'sunset-tangerine',
            width: 180,
            height: 180,
            aspect: 1,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <circle cx="100" cy="100" r="90" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <!-- Clock ticks -->
                    <circle cx="100" cy="100" r="82" fill="none" stroke="${c.accent}" stroke-width="3" stroke-dasharray="2,12"/>
                    <circle cx="100" cy="100" r="74" fill="none" stroke="${c.accent}" stroke-width="1.5"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'urgency_going_fast',
            name: 'Going Fast Forward Slant',
            category: 'Urgency & Stock',
            defaultText: 'GOING FAST',
            defaultSubtext: 'FEW REMAINING',
            defaultPalette: 'ruby-crimson',
            width: 220,
            height: 100,
            aspect: 2.2,
            buildSvg: (c, t, st, f, uid) => {
                const slant = "25,12 210,12 195,88 10,88";
                return `
                    ${makeCommonDefs(uid, c)}
                    <polygon points="${slant}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <line x1="28" y1="20" x2="202" y2="20" stroke="${c.accent}" stroke-width="2"/>
                    <line x1="18" y1="80" x2="192" y2="80" stroke="${c.accent}" stroke-width="2"/>
                    ${renderSvgText(t, st, 110, 50, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'urgency_exclusive_crown',
            name: 'Exclusive Member Crown Shield',
            category: 'Urgency & Stock',
            defaultText: 'VIP ONLY',
            defaultSubtext: 'MEMBERS CLUB',
            defaultPalette: 'luxury-gold',
            width: 180,
            height: 200,
            aspect: 0.9,
            buildSvg: (c, t, st, f, uid) => {
                const shield = "M 100 10 L 180 30 C 180 120, 100 185, 100 185 C 100 185, 20 120, 20 30 Z";
                return `
                    ${makeCommonDefs(uid, c)}
                    <path d="${shield}" fill="url(#${uid}_bg)" stroke="${c.accent}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <!-- Crown icon -->
                    <polygon points="80,48 85,38 92,45 100,32 108,45 115,38 120,48" fill="${c.accent}"/>
                    ${renderSvgText(t, st, 100, 100, f, c.text, c.subtext, uid)}
                `;
            }
        },
        {
            id: 'urgency_flame_fire_hot',
            name: 'Red Hot Fire Deal',
            category: 'Urgency & Stock',
            defaultText: 'ON FIRE',
            defaultSubtext: 'SELLING FAST',
            defaultPalette: 'sunset-tangerine',
            width: 170,
            height: 200,
            aspect: 0.85,
            buildSvg: (c, t, st, f, uid) => {
                const outerFlame = "M 85 12 C 115 50, 160 100, 155 145 C 150 185, 115 195, 85 195 C 55 195, 20 185, 15 145 C 10 100, 55 50, 85 12 Z";
                const innerFlame = "M 85 55 C 105 85, 135 120, 130 150 C 125 178, 105 185, 85 185 C 65 185, 45 178, 40 150 C 35 120, 65 85, 85 55 Z";
                return `
                    ${makeCommonDefs(uid, c)}
                    <path d="${outerFlame}" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <path d="${innerFlame}" fill="none" stroke="${c.accent}" stroke-width="2" stroke-dasharray="4,2"/>
                    ${renderSvgText(t, st, 85, 130, f, c.text, c.subtext, uid, 100)}
                `;
            }
        },
        {
            id: 'urgency_alarm_clock_drop',
            name: 'Price Drop Alarm Badge',
            category: 'Urgency & Stock',
            defaultText: 'LAST CHANCE',
            defaultSubtext: 'ENDS AT MIDNIGHT',
            defaultPalette: 'ruby-crimson',
            width: 180,
            height: 190,
            aspect: 0.95,
            buildSvg: (c, t, st, f, uid) => {
                return `
                    ${makeCommonDefs(uid, c)}
                    <line x1="48" y1="165" x2="35" y2="184" stroke="${c.border}" stroke-width="5" stroke-linecap="round"/>
                    <line x1="132" y1="165" x2="145" y2="184" stroke="${c.border}" stroke-width="5" stroke-linecap="round"/>
                    <path d="M 40 48 C 30 38, 46 22, 60 34 Z" fill="${c.accent}" stroke="${c.border}" stroke-width="2"/>
                    <path d="M 140 48 C 150 38, 134 22, 120 34 Z" fill="${c.accent}" stroke="${c.border}" stroke-width="2"/>
                    <rect x="85" y="28" width="10" height="16" rx="2" fill="${c.accent}" stroke="${c.border}" stroke-width="1.5"/>
                    <circle cx="90" cy="110" r="68" fill="url(#${uid}_bg)" stroke="${c.border}" stroke-width="3" filter="url(#${uid}_shadow)"/>
                    <circle cx="90" cy="110" r="58" fill="none" stroke="${c.accent}" stroke-width="1.8"/>
                    <circle cx="90" cy="110" r="54" fill="none" stroke="${c.light}" stroke-width="1" stroke-dasharray="2,6"/>
                    ${renderSvgText(t, st, 90, 110, f, c.text, c.subtext, uid, 100)}
                `;
            }
        },
    ];

    // --- ENGINE API ---
    function getPresets() {
        return AD_PRESETS;
    }

    function getPresetById(id) {
        return AD_PRESETS.find(p => p.id === id) || AD_PRESETS[0];
    }

    function getPalettes() {
        return PALETTES;
    }

    function getPaletteById(id) {
        if (!id) return PALETTES['publisher-teal'];
        if (id.startsWith('#')) {
            return makeSolidPalette(id);
        }
        return PALETTES[id] || PALETTES['publisher-teal'];
    }

    function generateAdSVG(presetId, primaryText, subtext, paletteId, font = 'Montserrat', offsets = null) {
        const preset = getPresetById(presetId);
        const palette = getPaletteById(paletteId);
        const uid = generateUid();
        const pText = primaryText !== undefined ? primaryText : preset.defaultText;
        const sText = subtext !== undefined ? subtext : preset.defaultSubtext;
        const fontName = font || 'Montserrat';

        if (offsets) {
            let scX = (offsets.scaleX !== undefined && offsets.scaleX !== null) ? (parseFloat(offsets.scaleX) || 100) : 100;
            if (scX > 3) scX = scX / 100.0;
            currentTextOffsets = {
                x: parseFloat(offsets.x !== undefined ? offsets.x : (offsets.offsetX || 0)) || 0,
                y: parseFloat(offsets.y !== undefined ? offsets.y : (offsets.offsetY || 0)) || 0,
                gap: parseFloat(offsets.gap !== undefined ? offsets.gap : (offsets.lineGap || 0)) || 0,
                scaleX: scX
            };
        } else {
            currentTextOffsets = { x: 0, y: 0, gap: 0, scaleX: 1.0 };
        }

        try {
            const svgInner = preset.buildSvg(palette, pText, sText, fontName, uid);
            const viewBox = `0 0 ${preset.width} ${preset.height}`;
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="100%" height="100%" style="display:block; overflow:visible; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">${svgInner}</svg>`;
        } finally {
            currentTextOffsets = { x: 0, y: 0, gap: 0 };
        }
    }

    function insertAdvertisement(presetId, primaryText, subtext, paletteId, font = 'Montserrat', offsets = null) {
        const preset = getPresetById(presetId);
        const pText = primaryText || preset.defaultText;
        const sText = subtext !== undefined ? subtext : preset.defaultSubtext;
        const palId = paletteId || preset.defaultPalette;
        const fontName = font || 'Montserrat';

        const offX = offsets && offsets.x !== undefined ? (parseFloat(offsets.x) || 0) : 0;
        const offY = offsets && offsets.y !== undefined ? (parseFloat(offsets.y) || 0) : 0;
        const offGap = offsets && offsets.gap !== undefined ? (parseFloat(offsets.gap) || 0) : 0;
        const scaleX = offsets && offsets.scaleX !== undefined ? (parseFloat(offsets.scaleX) || 100) : 100;

        const svgHtml = generateAdSVG(preset.id, pText, sText, palId, fontName, { x: offX, y: offY, gap: offGap, scaleX: scaleX });
        const innerContent = `<div class="element-advertisement" style="width:100%; height:100%; position:relative; overflow:visible; display:flex; align-items:center; justify-content:center;">${svgHtml}</div>`;

        if (typeof window.createWrapper !== 'function') {
            console.error('createWrapper not available');
            return null;
        }

        const el = window.createWrapper(innerContent);
        el.setAttribute('data-type', 'advertisement');
        el.classList.add('has-advertisement');
        el.setAttribute('data-aspect-ratio', String(preset.aspect || 1));
        el.setAttribute('data-lock-aspect', 'true');
        el.setAttribute('data-ad-preset', preset.id);
        el.setAttribute('data-ad-text', encodeURIComponent(pText));
        el.setAttribute('data-ad-subtext', encodeURIComponent(sText));
        el.setAttribute('data-ad-palette', palId);
        el.setAttribute('data-ad-font', fontName);
        el.setAttribute('data-ad-offset-x', String(offX));
        el.setAttribute('data-ad-offset-y', String(offY));
        el.setAttribute('data-ad-line-gap', String(offGap));
        el.setAttribute('data-ad-scale-x', String(scaleX));

        el.style.width = preset.width + 'px';
        el.style.height = preset.height + 'px';

        el.ondblclick = (e) => {
            e.stopPropagation();
            if (typeof window.showAdModal === 'function') {
                window.showAdModal(el);
            }
        };

        if (typeof window.selectElement === 'function') window.selectElement(el);
        if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
        if (typeof window.pushHistory === 'function') window.pushHistory();

        return el;
    }

    function updateAdvertisement(el, config) {
        if (!el) return;
        const presetId = config.presetId || el.getAttribute('data-ad-preset') || 'burst_classic_ruby';
        const primaryText = config.primaryText !== undefined ? config.primaryText : decodeURIComponent(el.getAttribute('data-ad-text') || '');
        const subtext = config.subtext !== undefined ? config.subtext : decodeURIComponent(el.getAttribute('data-ad-subtext') || '');
        const paletteId = config.paletteId || el.getAttribute('data-ad-palette') || 'publisher-teal';
        const font = config.font || el.getAttribute('data-ad-font') || 'Montserrat';

        const offX = config.offsetX !== undefined ? (parseFloat(config.offsetX) || 0) : (parseFloat(el.getAttribute('data-ad-offset-x')) || 0);
        const offY = config.offsetY !== undefined ? (parseFloat(config.offsetY) || 0) : (parseFloat(el.getAttribute('data-ad-offset-y')) || 0);
        const offGap = config.lineGap !== undefined ? (parseFloat(config.lineGap) || 0) : (parseFloat(el.getAttribute('data-ad-line-gap')) || 0);
        const scaleX = config.scaleX !== undefined ? (parseFloat(config.scaleX) || 100) : (parseFloat(el.getAttribute('data-ad-scale-x')) || 100);

        const preset = getPresetById(presetId);
        const svgHtml = generateAdSVG(preset.id, primaryText, subtext, paletteId, font, { x: offX, y: offY, gap: offGap, scaleX: scaleX });

        let adDiv = el.querySelector('.element-advertisement');
        if (!adDiv) {
            const content = el.querySelector('.element-content') || el;
            adDiv = document.createElement('div');
            adDiv.className = 'element-advertisement';
            adDiv.style.cssText = 'width:100%; height:100%; position:relative; overflow:visible; display:flex; align-items:center; justify-content:center;';
            content.appendChild(adDiv);
        }
        adDiv.innerHTML = svgHtml;

        el.setAttribute('data-type', 'advertisement');
        el.classList.add('has-advertisement');
        el.setAttribute('data-aspect-ratio', String(preset.aspect || 1));
        el.setAttribute('data-lock-aspect', 'true');
        el.setAttribute('data-ad-preset', preset.id);
        el.setAttribute('data-ad-text', encodeURIComponent(primaryText));
        el.setAttribute('data-ad-subtext', encodeURIComponent(subtext));
        el.setAttribute('data-ad-palette', paletteId);
        el.setAttribute('data-ad-font', font);
        el.setAttribute('data-ad-offset-x', String(offX));
        el.setAttribute('data-ad-offset-y', String(offY));
        el.setAttribute('data-ad-line-gap', String(offGap));
        el.setAttribute('data-ad-scale-x', String(scaleX));

        el.ondblclick = (e) => {
            e.stopPropagation();
            if (typeof window.showAdModal === 'function') {
                window.showAdModal(el);
            }
        };

        if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
        if (typeof window.pushHistory === 'function') window.pushHistory();
    }

    function getElementConfig(el) {
        if (!el) return null;
        return {
            presetId: el.getAttribute('data-ad-preset') || 'burst_classic_ruby',
            primaryText: decodeURIComponent(el.getAttribute('data-ad-text') || 'SALE'),
            subtext: decodeURIComponent(el.getAttribute('data-ad-subtext') || ''),
            paletteId: el.getAttribute('data-ad-palette') || 'publisher-teal',
            font: el.getAttribute('data-ad-font') || 'Montserrat',
            offsetX: parseFloat(el.getAttribute('data-ad-offset-x')) || 0,
            offsetY: parseFloat(el.getAttribute('data-ad-offset-y')) || 0,
            lineGap: parseFloat(el.getAttribute('data-ad-line-gap')) || 0,
            scaleX: parseFloat(el.getAttribute('data-ad-scale-x')) || 100
        };
    }

    /**
     * Bakes a vector advertisement element into a high-DPI raster image with proportional padding (v5.19.1).
     * Replaces the SVG with an <img> element positioned with precise negative padding offsets,
     * guaranteeing that html2canvas and the print spooler capture the entire unclipped overflow
     * (spikes, facets, tails, shadows) while remaining locked 100% in place without any vertical/horizontal shift.
     */
    async function bakeAdvertisementForPrint(targetEl, scaleMultiplier = 3.0) {
        if (!targetEl) return null;
        const rootEl = (targetEl.classList && targetEl.classList.contains('pub-element')) ? targetEl : (targetEl.closest('.pub-element') || targetEl);
        const content = rootEl.querySelector('.element-content') || rootEl;
        const adDiv = rootEl.querySelector('.element-advertisement') || content;
        
        const existingBaked = adDiv.querySelector('img.ad-baked-img');
        if (existingBaked) return existingBaked;
        
        const svg = adDiv.querySelector('svg');
        if (!svg) return null;

        // Resolve true original viewBox from SVG element directly (never guess or default to wrong aspect ratio)
        let origVbW = 0, origVbH = 0;
        const vbAttr = svg.getAttribute('viewBox');
        if (vbAttr) {
            const parts = vbAttr.trim().split(/[\s,]+/).map(parseFloat);
            if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
                origVbW = parts[2];
                origVbH = parts[3];
            }
        }
        if (!origVbW || !origVbH) {
            const presetId = rootEl.getAttribute('data-ad-preset') || 'burst_classic_ruby';
            const preset = getPresetById(presetId);
            origVbW = preset ? preset.width : 180;
            origVbH = preset ? preset.height : 180;
        }

        let dispW = parseFloat(rootEl.style.width) || parseFloat(content.style.width);
        let dispH = parseFloat(rootEl.style.height) || parseFloat(content.style.height);
        if (!dispW || isNaN(dispW) || dispW <= 0) dispW = rootEl.offsetWidth;
        if (!dispH || isNaN(dispH) || dispH <= 0) dispH = rootEl.offsetHeight;
        if (!dispW || isNaN(dispW) || dispW <= 0) dispW = origVbW;
        if (!dispH || isNaN(dispH) || dispH <= 0) dispH = origVbH;

        // UNIFORM proportional padding: exactly 25% on all 4 sides preserves 100% of the original aspect ratio,
        // guaranteeing badges NEVER pillarbox, shrink, or distort into tiny slivers
        const padRatio = 0.25;
        const padVbX = origVbW * padRatio;
        const padVbY = origVbH * padRatio;
        const totalVbW = origVbW * (1 + 2 * padRatio);
        const totalVbH = origVbH * (1 + 2 * padRatio);

        const padPxX = dispW * padRatio;
        const padPxY = dispH * padRatio;
        const totalDispW = dispW * (1 + 2 * padRatio);
        const totalDispH = dispH * (1 + 2 * padRatio);

        const scale = Math.max(1, Math.min(4, parseFloat(scaleMultiplier) || 3.0));
        const canvasW = Math.round(totalDispW * scale);
        const canvasH = Math.round(totalDispH * scale);

        const innerSvg = svg.innerHTML;
        const expandedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-padVbX} ${-padVbY} ${totalVbW} ${totalVbH}" width="${canvasW}" height="${canvasH}">${innerSvg}</svg>`;
        const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(expandedSvg);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
            let settled = false;
            const done = () => { if (!settled) { settled = true; resolve(); } };
            img.onload = done;
            img.onerror = done;
            img.src = svgDataUrl;
            if (img.complete && img.naturalWidth > 0) done();
            setTimeout(done, 1500);
        });

        const cvs = document.createElement('canvas');
        cvs.width = canvasW;
        cvs.height = canvasH;
        const ctx = cvs.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvasW, canvasH);

        const bakedPng = cvs.toDataURL('image/png');

        const bakedImg = document.createElement('img');
        bakedImg.className = 'ad-baked-img';
        bakedImg.src = bakedPng;
        bakedImg.alt = 'Advertisement Badge';
        bakedImg.setAttribute('data-ad-baked', 'true');
        bakedImg.style.cssText = `position: absolute !important; left: -${padPxX}px !important; top: -${padPxY}px !important; width: ${totalDispW}px !important; height: ${totalDispH}px !important; display: block !important; border: none !important; outline: none !important; max-width: none !important; max-height: none !important; pointer-events: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;`;

        rootEl.style.setProperty('overflow', 'visible', 'important');
        content.style.setProperty('overflow', 'visible', 'important');
        adDiv.style.setProperty('overflow', 'visible', 'important');

        svg.replaceWith(bakedImg);
        return bakedImg;
    }

    /**
     * Prepares vector advertisement elements for print/export rendering (v5.19.1).
     * Bakes all vector advertisements into high-DPI padded images, ensuring zero displacement
     * and complete capture of all overflowing points and shadows.
     */
    async function prepareAdvertisementsForPrint(container, scaleMultiplier = 3.0) {
        if (!container) return;
        const adElements = Array.from(container.querySelectorAll('.pub-element.has-advertisement, .pub-element[data-type="advertisement"], .pub-element[data-ad-preset], .element-advertisement'));
        if (!adElements.length) return;

        const uniqueAds = Array.from(new Set(adElements.map(el => {
            if (el.classList && el.classList.contains('pub-element')) return el;
            return el.closest('.pub-element') || el;
        })));

        for (const el of uniqueAds) {
            try {
                await bakeAdvertisementForPrint(el, scaleMultiplier);
            } catch(e) {
                console.warn('[Advertisement Engine] Failed to bake badge for print:', e);
            }
        }
    }

    function init() {
        document.querySelectorAll('.pub-element.has-advertisement, .pub-element[data-ad-preset]').forEach(el => {
            el.setAttribute('data-type', 'advertisement');
            el.classList.add('has-advertisement');
            el.ondblclick = (e) => {
                e.stopPropagation();
                if (typeof window.showAdModal === 'function') window.showAdModal(el);
            };
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.AdvertisementEngine = {
        getPresets: getPresets,
        getPresetById: getPresetById,
        getPalettes: getPalettes,
        getPaletteById: getPaletteById,
        generateAdSVG: generateAdSVG,
        insertAdvertisement: insertAdvertisement,
        updateAdvertisement: updateAdvertisement,
        getElementConfig: getElementConfig,
        prepareForPrint: prepareAdvertisementsForPrint,
        allowOverflowForPrint: prepareAdvertisementsForPrint,
        bakeForPrint: bakeAdvertisementForPrint,
        init: init
    };
    window.prepareAdvertisementsForPrint = prepareAdvertisementsForPrint;
    window.bakeAdvertisementForPrint = bakeAdvertisementForPrint;

})(window);
