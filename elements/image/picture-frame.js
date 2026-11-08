/**
 * OpenPublisher Professional Picture Frame Engine (v5.19.1)
 * Authentic, high-fidelity frame borders for images and photographs:
 *  - Wood & Timber: Classic Natural Oak, Dark Walnut/Mahogany, Distressed Barnwood, American Cherry
 *  - Ornate & Metallic: Baroque Gilded Gold, Burnished Antique Silver, Brushed Aluminum, Art Deco
 *  - Modern Gallery: Museum Gallery Box (Black), Studio Gallery Float (White)
 *  - Artistic & Novelty: Retro Molded Glossy Plastic (Red, Yellow, Blue), Vintage Postage Stamp
 * Includes passe-partout / matboard options with bevels, real-time sizing, outside fitting,
 * lossless .opub serialization, and offline 300+ DPI print & PDF fidelity.
 */

(function(window) {
    'use strict';

    const FRAME_PRESETS = [
        {
            id: 'oak_wood',
            name: 'Classic Natural Oak',
            category: 'Wood & Timber',
            description: 'Warm golden oak woodgrain, mitered 45° joints, and satin luster.',
            defaultWidth: 24,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'dark_walnut',
            name: 'Dark Walnut & Mahogany',
            category: 'Wood & Timber',
            description: 'Rich espresso hardwood molding with multi-tier beveled profiles.',
            defaultWidth: 26,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'shabby_chic',
            name: 'Distressed Barnwood',
            category: 'Wood & Timber',
            description: 'Vintage white-washed rustic timber with natural weathered grain.',
            defaultWidth: 24,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'cherry_wood',
            name: 'American Cherrywood',
            category: 'Wood & Timber',
            description: 'Warm reddish-brown polished wood with traditional stepped molding.',
            defaultWidth: 22,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'baroque_gold',
            name: 'Ornate Baroque Gold',
            category: 'Ornate & Metal',
            description: 'Gilded antique gold leaf, embossed cove relief, and corner flourishes.',
            defaultWidth: 28,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'antique_silver',
            name: 'Antique Silver Pewter',
            category: 'Ornate & Metal',
            description: 'Burnished hammered metallic silver with beaded inner trim.',
            defaultWidth: 24,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'brushed_aluminum',
            name: 'Brushed Champagne Metal',
            category: 'Ornate & Metal',
            description: 'Contemporary sleek minimalist metallic profile with hairline sheen.',
            defaultWidth: 16,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'art_deco',
            name: 'Art Deco Brass & Enamel',
            category: 'Ornate & Metal',
            description: '1920s geometric stepped corner chevrons and inlaid brass banding.',
            defaultWidth: 24,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'gallery_black',
            name: 'Museum Gallery Box (Black)',
            category: 'Modern Gallery',
            description: 'Deep matte black box frame with sharp chamfered inner bevel.',
            defaultWidth: 22,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'studio_white',
            name: 'Studio Gallery Float (White)',
            category: 'Modern Gallery',
            description: 'Crisp contemporary white frame with delicate recessed shadow line.',
            defaultWidth: 20,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'blonde_maple',
            name: 'Blonde Natural Maple',
            category: 'Wood & Timber',
            description: 'Light Scandinavian blonde hardwood molding with clean square profile.',
            defaultWidth: 22,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'espresso_box',
            name: 'Espresso Gallery Shadowbox',
            category: 'Modern Gallery',
            description: 'Warm dark roasted coffee hardwood exhibition box frame.',
            defaultWidth: 22,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'retro_plastic_teal',
            name: 'Retro Molded Plastic (Publisher Teal)',
            category: 'Artistic & Novelty',
            description: 'OpenPublisher signature teal green molded acrylic frame with glossy highlights.',
            defaultWidth: 22,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'retro_plastic_red',
            name: 'Retro Molded Plastic (Cherry Red)',
            category: 'Artistic & Novelty',
            description: 'Curved high-gloss acrylic with specular highlight reflections.',
            defaultWidth: 22,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'retro_plastic_yellow',
            name: 'Retro Molded Plastic (Sunshine Yellow)',
            category: 'Artistic & Novelty',
            description: 'Pop art glossy vibrant yellow molded acrylic frame.',
            defaultWidth: 22,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'retro_plastic_blue',
            name: 'Retro Molded Plastic (Electric Blue)',
            category: 'Artistic & Novelty',
            description: 'Deep saturated cobalt blue glossy molded plastic profile.',
            defaultWidth: 22,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'retro_plastic_green',
            name: 'Retro Molded Plastic (Emerald Green)',
            category: 'Artistic & Novelty',
            description: 'Vibrant pop-art emerald green glossy molded acrylic frame.',
            defaultWidth: 22,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'retro_plastic_purple',
            name: 'Retro Molded Plastic (Royal Purple)',
            category: 'Artistic & Novelty',
            description: 'Deep saturated glossy violet acrylic frame profile.',
            defaultWidth: 22,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'retro_plastic_orange',
            name: 'Retro Molded Plastic (Tangerine Orange)',
            category: 'Artistic & Novelty',
            description: 'Retro 1970s pop-art tangerine orange molded plastic frame.',
            defaultWidth: 22,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'retro_plastic_white',
            name: 'Retro Molded Plastic (Glossy White)',
            category: 'Artistic & Novelty',
            description: 'Sleek contemporary high-gloss molded white acrylic frame.',
            defaultWidth: 22,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'retro_plastic_black',
            name: 'Retro Molded Plastic (Glossy Jet Black)',
            category: 'Artistic & Novelty',
            description: 'Mirror-finish high-gloss jet black molded acrylic frame.',
            defaultWidth: 22,
            defaultMat: 'none',
            defaultMatWidth: 0
        },
        {
            id: 'scalloped_stamp',
            name: 'Vintage Postage Stamp',
            category: 'Artistic & Novelty',
            description: 'Playful perforated scalloped outer edge in retro paper tone.',
            defaultWidth: 20,
            defaultMat: 'none',
            defaultMatWidth: 0
        }
    ];

    const MAT_PRESETS = [
        { id: 'none', name: 'No Mat (Direct Fit)', color: 'transparent', borderColor: 'transparent', description: 'Photo fills directly to the inner frame edge.' },
        { id: 'studio_white', name: 'Studio White', color: '#fbfbfb', borderColor: '#e2e8f0', description: 'Crisp bright white mat with 45° beveled cut.' },
        { id: 'warm_cream', name: 'Warm Cream Linen', color: '#f7f4ea', borderColor: '#e5dec9', description: 'Warm ivory tone with subtle paper warmth.' },
        { id: 'museum_black', name: 'Museum Charcoal', color: '#1e2124', borderColor: '#36393f', description: 'Deep charcoal black for high dramatic contrast.' },
        { id: 'gold_fillet', name: 'White Mat with Gold Fillet', color: '#fafafa', borderColor: '#d4af37', fillet: '#c5a059', description: 'Classic gallery mat with gilded inner accent line.' }
    ];

    let _resizeObserver = null;

    /**
     * Normalizes preset IDs to canonical identifiers, supporting legacy and UI aliases.
     */
    function normalizeFrameId(id) {
        if (!id) return 'oak_wood';
        const map = {
            'museum_box_black': 'gallery_black',
            'museum_gallery_box': 'gallery_black',
            'gallery_float_white': 'studio_white',
            'studio_gallery_float': 'studio_white',
            'champagne_metal': 'brushed_aluminum',
            'brushed_champagne': 'brushed_aluminum',
            'cherrywood': 'cherry_wood',
            'american_cherrywood': 'cherry_wood',
            'distressed_wood': 'shabby_chic',
            'distressed_barnwood': 'shabby_chic',
            'ornate_gold': 'baroque_gold',
            'baroque_gilded_gold': 'baroque_gold',
            'art_deco_brass': 'art_deco',
            'vintage_postage': 'scalloped_stamp',
            'retro_plastic_default': 'retro_plastic_teal',
            'retro_plastic_teal_green': 'retro_plastic_teal',
            'postage_stamp': 'scalloped_stamp'
        };
        return map[id] || id;
    }

    /**
     * Generates a unique SVG string representing the frame rails, corners, and mat.
     */
    function generateFrameSVG(frameId, w, h, frameW, matId, matW, hasShadow) {
        frameId = normalizeFrameId(frameId);
        frameW = Math.max(6, Math.min(frameW || 24, Math.floor(Math.min(w, h) / 3)));
        const useMat = (matId && matId !== 'none');
        matW = useMat ? Math.max(4, Math.min(matW || 16, Math.floor((Math.min(w, h) - 2 * frameW) / 3))) : 0;
        
        const F = frameW;
        const M = matW;
        const T = F + M;
        const uid = 'pf_' + Math.random().toString(36).substring(2, 9);

        // Coordinates
        const x0 = 0, y0 = 0;
        const x1 = F, y1 = F;
        const x2 = F + M, y2 = F + M;
        const x3 = w - (F + M), y3 = h - (F + M);
        const x4 = w - F, y4 = h - F;
        const x5 = w, y5 = h;

        let defs = '';
        let railsHTML = '';
        let matHTML = '';
        let cornersHTML = '';
        let filterAttr = '';

        if (hasShadow) {
            defs += `
                <filter id="${uid}_shadow" x="-15%" y="-15%" width="130%" height="130%">
                    <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.38)"/>
                    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.2)"/>
                </filter>
            `;
            filterAttr = `filter="url(#${uid}_shadow)"`;
        }

        // 1. Frame Style Definition
        if (frameId === 'oak_wood') {
            defs += `
                <linearGradient id="${uid}_oak_h" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#8c5828"/>
                    <stop offset="12%" stop-color="#bf854e"/>
                    <stop offset="35%" stop-color="#d69f67"/>
                    <stop offset="55%" stop-color="#c28850"/>
                    <stop offset="78%" stop-color="#9e6632"/>
                    <stop offset="92%" stop-color="#734720"/>
                    <stop offset="100%" stop-color="#4d2c12"/>
                </linearGradient>
                <linearGradient id="${uid}_oak_v" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#8c5828"/>
                    <stop offset="12%" stop-color="#bf854e"/>
                    <stop offset="35%" stop-color="#d69f67"/>
                    <stop offset="55%" stop-color="#c28850"/>
                    <stop offset="78%" stop-color="#9e6632"/>
                    <stop offset="92%" stop-color="#734720"/>
                    <stop offset="100%" stop-color="#4d2c12"/>
                </linearGradient>
                <linearGradient id="${uid}_oak_h_rev" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stop-color="#8c5828"/>
                    <stop offset="12%" stop-color="#bf854e"/>
                    <stop offset="35%" stop-color="#d69f67"/>
                    <stop offset="55%" stop-color="#c28850"/>
                    <stop offset="78%" stop-color="#9e6632"/>
                    <stop offset="92%" stop-color="#734720"/>
                    <stop offset="100%" stop-color="#4d2c12"/>
                </linearGradient>
                <linearGradient id="${uid}_oak_v_rev" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stop-color="#8c5828"/>
                    <stop offset="12%" stop-color="#bf854e"/>
                    <stop offset="35%" stop-color="#d69f67"/>
                    <stop offset="55%" stop-color="#c28850"/>
                    <stop offset="78%" stop-color="#9e6632"/>
                    <stop offset="92%" stop-color="#734720"/>
                    <stop offset="100%" stop-color="#4d2c12"/>
                </linearGradient>
            `;
            railsHTML = `
                <!-- Top Rail -->
                <polygon points="${x0},${y0} ${x5},${y0} ${x4},${y1} ${x1},${y1}" fill="url(#${uid}_oak_h)" stroke="#3a2512" stroke-width="0.5"/>
                <!-- Bottom Rail -->
                <polygon points="${x0},${y5} ${x5},${y5} ${x4},${y4} ${x1},${y4}" fill="url(#${uid}_oak_h_rev)" stroke="#3a2512" stroke-width="0.5"/>
                <!-- Left Rail -->
                <polygon points="${x0},${y0} ${x1},${y1} ${x1},${y4} ${x0},${y5}" fill="url(#${uid}_oak_v)" stroke="#3a2512" stroke-width="0.5"/>
                <!-- Right Rail -->
                <polygon points="${x5},${y0} ${x4},${y1} ${x4},${y4} ${x5},${y5}" fill="url(#${uid}_oak_v_rev)" stroke="#3a2512" stroke-width="0.5"/>
                <!-- Miter Corner Seams -->
                <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#3d210b" stroke-width="1.2" opacity="0.6"/>
                <line x1="${x5}" y1="${y0}" x2="${x4}" y2="${y1}" stroke="#3d210b" stroke-width="1.2" opacity="0.6"/>
                <line x1="${x0}" y1="${y5}" x2="${x1}" y2="${y4}" stroke="#3d210b" stroke-width="1.2" opacity="0.6"/>
                <line x1="${x5}" y1="${y5}" x2="${x4}" y2="${y4}" stroke="#3d210b" stroke-width="1.2" opacity="0.6"/>
                <!-- Outer & Inner Highlight Beads -->
                <rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="#e6b986" stroke-width="1" opacity="0.4"/>
                <rect x="${x1}" y="${y1}" width="${w - 2*F}" height="${h - 2*F}" fill="none" stroke="#2b1605" stroke-width="1.5" opacity="0.8"/>
            `;
        } else if (frameId === 'dark_walnut') {
            defs += `
                <linearGradient id="${uid}_wal_h" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#1c100a"/>
                    <stop offset="15%" stop-color="#3d2316"/>
                    <stop offset="35%" stop-color="#593420"/>
                    <stop offset="60%" stop-color="#402416"/>
                    <stop offset="85%" stop-color="#24140b"/>
                    <stop offset="95%" stop-color="#c5a059"/>
                    <stop offset="100%" stop-color="#140b06"/>
                </linearGradient>
                <linearGradient id="${uid}_wal_v" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#1c100a"/>
                    <stop offset="15%" stop-color="#3d2316"/>
                    <stop offset="35%" stop-color="#593420"/>
                    <stop offset="60%" stop-color="#402416"/>
                    <stop offset="85%" stop-color="#24140b"/>
                    <stop offset="95%" stop-color="#c5a059"/>
                    <stop offset="100%" stop-color="#140b06"/>
                </linearGradient>
                <linearGradient id="${uid}_wal_h_rev" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stop-color="#1c100a"/>
                    <stop offset="15%" stop-color="#3d2316"/>
                    <stop offset="35%" stop-color="#593420"/>
                    <stop offset="60%" stop-color="#402416"/>
                    <stop offset="85%" stop-color="#24140b"/>
                    <stop offset="95%" stop-color="#c5a059"/>
                    <stop offset="100%" stop-color="#140b06"/>
                </linearGradient>
                <linearGradient id="${uid}_wal_v_rev" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stop-color="#1c100a"/>
                    <stop offset="15%" stop-color="#3d2316"/>
                    <stop offset="35%" stop-color="#593420"/>
                    <stop offset="60%" stop-color="#402416"/>
                    <stop offset="85%" stop-color="#24140b"/>
                    <stop offset="95%" stop-color="#c5a059"/>
                    <stop offset="100%" stop-color="#140b06"/>
                </linearGradient>
            `;
            railsHTML = `
                <polygon points="${x0},${y0} ${x5},${y0} ${x4},${y1} ${x1},${y1}" fill="url(#${uid}_wal_h)"/>
                <polygon points="${x0},${y5} ${x5},${y5} ${x4},${y4} ${x1},${y4}" fill="url(#${uid}_wal_h_rev)"/>
                <polygon points="${x0},${y0} ${x1},${y1} ${x1},${y4} ${x0},${y5}" fill="url(#${uid}_wal_v)"/>
                <polygon points="${x5},${y0} ${x4},${y1} ${x4},${y4} ${x5},${y5}" fill="url(#${uid}_wal_v_rev)"/>
                <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#0f0704" stroke-width="1.2" opacity="0.8"/>
                <line x1="${x5}" y1="${y0}" x2="${x4}" y2="${y1}" stroke="#0f0704" stroke-width="1.2" opacity="0.8"/>
                <line x1="${x0}" y1="${y5}" x2="${x1}" y2="${y4}" stroke="#0f0704" stroke-width="1.2" opacity="0.8"/>
                <line x1="${x5}" y1="${y5}" x2="${x4}" y2="${y4}" stroke="#0f0704" stroke-width="1.2" opacity="0.8"/>
                <!-- Gold Fillet Lip -->
                <rect x="${x1 - 2}" y="${y1 - 2}" width="${w - 2*F + 4}" height="${h - 2*F + 4}" fill="none" stroke="#d4af37" stroke-width="1.5"/>
            `;
        } else if (frameId === 'blonde_maple') {
            defs += `
                <linearGradient id="${uid}_maple_h" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#d4b996"/>
                    <stop offset="15%" stop-color="#f5e6d3"/>
                    <stop offset="35%" stop-color="#faefe3"/>
                    <stop offset="60%" stop-color="#edd8be"/>
                    <stop offset="85%" stop-color="#dfc5a6"/>
                    <stop offset="100%" stop-color="#aa8a66"/>
                </linearGradient>
                <linearGradient id="${uid}_maple_v" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#d4b996"/>
                    <stop offset="15%" stop-color="#f5e6d3"/>
                    <stop offset="35%" stop-color="#faefe3"/>
                    <stop offset="60%" stop-color="#edd8be"/>
                    <stop offset="85%" stop-color="#dfc5a6"/>
                    <stop offset="100%" stop-color="#aa8a66"/>
                </linearGradient>
                <linearGradient id="${uid}_maple_h_rev" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stop-color="#d4b996"/>
                    <stop offset="15%" stop-color="#f5e6d3"/>
                    <stop offset="35%" stop-color="#faefe3"/>
                    <stop offset="60%" stop-color="#edd8be"/>
                    <stop offset="85%" stop-color="#dfc5a6"/>
                    <stop offset="100%" stop-color="#aa8a66"/>
                </linearGradient>
                <linearGradient id="${uid}_maple_v_rev" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stop-color="#d4b996"/>
                    <stop offset="15%" stop-color="#f5e6d3"/>
                    <stop offset="35%" stop-color="#faefe3"/>
                    <stop offset="60%" stop-color="#edd8be"/>
                    <stop offset="85%" stop-color="#dfc5a6"/>
                    <stop offset="100%" stop-color="#aa8a66"/>
                </linearGradient>
            `;
            railsHTML = `
                <polygon points="${x0},${y0} ${x5},${y0} ${x4},${y1} ${x1},${y1}" fill="url(#${uid}_maple_h)"/>
                <polygon points="${x0},${y5} ${x5},${y5} ${x4},${y4} ${x1},${y4}" fill="url(#${uid}_maple_h_rev)"/>
                <polygon points="${x0},${y0} ${x1},${y1} ${x1},${y4} ${x0},${y5}" fill="url(#${uid}_maple_v)"/>
                <polygon points="${x5},${y0} ${x4},${y1} ${x4},${y4} ${x5},${y5}" fill="url(#${uid}_maple_v_rev)"/>
                <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#8f704e" stroke-width="1" opacity="0.6"/>
                <line x1="${x5}" y1="${y0}" x2="${x4}" y2="${y1}" stroke="#8f704e" stroke-width="1" opacity="0.6"/>
                <line x1="${x0}" y1="${y5}" x2="${x1}" y2="${y4}" stroke="#8f704e" stroke-width="1" opacity="0.6"/>
                <line x1="${x5}" y1="${y5}" x2="${x4}" y2="${y4}" stroke="#8f704e" stroke-width="1" opacity="0.6"/>
                <rect x="${x1}" y="${y1}" width="${w - 2*F}" height="${h - 2*F}" fill="none" stroke="#a3835e" stroke-width="1"/>
            `;
        } else if (frameId === 'shabby_chic' || frameId === 'distressed_wood') {
            defs += `
                <linearGradient id="${uid}_shabby_h" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#d9d5cb"/>
                    <stop offset="20%" stop-color="#f2efe9"/>
                    <stop offset="45%" stop-color="#e0dcd3"/>
                    <stop offset="70%" stop-color="#c4bea8"/>
                    <stop offset="90%" stop-color="#ada797"/>
                    <stop offset="100%" stop-color="#736d5f"/>
                </linearGradient>
                <linearGradient id="${uid}_shabby_v" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#d9d5cb"/>
                    <stop offset="20%" stop-color="#f2efe9"/>
                    <stop offset="45%" stop-color="#e0dcd3"/>
                    <stop offset="70%" stop-color="#c4bea8"/>
                    <stop offset="90%" stop-color="#ada797"/>
                    <stop offset="100%" stop-color="#736d5f"/>
                </linearGradient>
                <linearGradient id="${uid}_shabby_h_rev" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stop-color="#d9d5cb"/>
                    <stop offset="20%" stop-color="#f2efe9"/>
                    <stop offset="45%" stop-color="#e0dcd3"/>
                    <stop offset="70%" stop-color="#c4bea8"/>
                    <stop offset="90%" stop-color="#ada797"/>
                    <stop offset="100%" stop-color="#736d5f"/>
                </linearGradient>
                <linearGradient id="${uid}_shabby_v_rev" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stop-color="#d9d5cb"/>
                    <stop offset="20%" stop-color="#f2efe9"/>
                    <stop offset="45%" stop-color="#e0dcd3"/>
                    <stop offset="70%" stop-color="#c4bea8"/>
                    <stop offset="90%" stop-color="#ada797"/>
                    <stop offset="100%" stop-color="#736d5f"/>
                </linearGradient>
            `;
            railsHTML = `
                <polygon points="${x0},${y0} ${x5},${y0} ${x4},${y1} ${x1},${y1}" fill="url(#${uid}_shabby_h)"/>
                <polygon points="${x0},${y5} ${x5},${y5} ${x4},${y4} ${x1},${y4}" fill="url(#${uid}_shabby_h_rev)"/>
                <polygon points="${x0},${y0} ${x1},${y1} ${x1},${y4} ${x0},${y5}" fill="url(#${uid}_shabby_v)"/>
                <polygon points="${x5},${y0} ${x4},${y1} ${x4},${y4} ${x5},${y5}" fill="url(#${uid}_shabby_v_rev)"/>
                <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#595347" stroke-width="1.2" opacity="0.6"/>
                <line x1="${x5}" y1="${y0}" x2="${x4}" y2="${y1}" stroke="#595347" stroke-width="1.2" opacity="0.6"/>
                <line x1="${x0}" y1="${y5}" x2="${x1}" y2="${y4}" stroke="#595347" stroke-width="1.2" opacity="0.6"/>
                <line x1="${x5}" y1="${y5}" x2="${x4}" y2="${y4}" stroke="#595347" stroke-width="1.2" opacity="0.6"/>
                <rect x="${x1}" y="${y1}" width="${w - 2*F}" height="${h - 2*F}" fill="none" stroke="#4a4439" stroke-width="1.5" opacity="0.5"/>
            `;
        } else if (frameId === 'cherry_wood' || frameId === 'cherrywood') {
            defs += `
                <linearGradient id="${uid}_cherry_h" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#4d1a13"/>
                    <stop offset="18%" stop-color="#802b20"/>
                    <stop offset="40%" stop-color="#a6382a"/>
                    <stop offset="65%" stop-color="#8c2e22"/>
                    <stop offset="85%" stop-color="#591c14"/>
                    <stop offset="100%" stop-color="#330f0a"/>
                </linearGradient>
                <linearGradient id="${uid}_cherry_v" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#4d1a13"/>
                    <stop offset="18%" stop-color="#802b20"/>
                    <stop offset="40%" stop-color="#a6382a"/>
                    <stop offset="65%" stop-color="#8c2e22"/>
                    <stop offset="85%" stop-color="#591c14"/>
                    <stop offset="100%" stop-color="#330f0a"/>
                </linearGradient>
                <linearGradient id="${uid}_cherry_h_rev" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stop-color="#4d1a13"/>
                    <stop offset="18%" stop-color="#802b20"/>
                    <stop offset="40%" stop-color="#a6382a"/>
                    <stop offset="65%" stop-color="#8c2e22"/>
                    <stop offset="85%" stop-color="#591c14"/>
                    <stop offset="100%" stop-color="#330f0a"/>
                </linearGradient>
                <linearGradient id="${uid}_cherry_v_rev" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stop-color="#4d1a13"/>
                    <stop offset="18%" stop-color="#802b20"/>
                    <stop offset="40%" stop-color="#a6382a"/>
                    <stop offset="65%" stop-color="#8c2e22"/>
                    <stop offset="85%" stop-color="#591c14"/>
                    <stop offset="100%" stop-color="#330f0a"/>
                </linearGradient>
            `;
            railsHTML = `
                <polygon points="${x0},${y0} ${x5},${y0} ${x4},${y1} ${x1},${y1}" fill="url(#${uid}_cherry_h)"/>
                <polygon points="${x0},${y5} ${x5},${y5} ${x4},${y4} ${x1},${y4}" fill="url(#${uid}_cherry_h_rev)"/>
                <polygon points="${x0},${y0} ${x1},${y1} ${x1},${y4} ${x0},${y5}" fill="url(#${uid}_cherry_v)"/>
                <polygon points="${x5},${y0} ${x4},${y1} ${x4},${y4} ${x5},${y5}" fill="url(#${uid}_cherry_v_rev)"/>
                <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#240a06" stroke-width="1.2" opacity="0.7"/>
                <line x1="${x5}" y1="${y0}" x2="${x4}" y2="${y1}" stroke="#240a06" stroke-width="1.2" opacity="0.7"/>
                <line x1="${x0}" y1="${y5}" x2="${x1}" y2="${y4}" stroke="#240a06" stroke-width="1.2" opacity="0.7"/>
                <line x1="${x5}" y1="${y5}" x2="${x4}" y2="${y4}" stroke="#240a06" stroke-width="1.2" opacity="0.7"/>
                <rect x="${x1}" y="${y1}" width="${w - 2*F}" height="${h - 2*F}" fill="none" stroke="#240a06" stroke-width="1.5" opacity="0.8"/>
            `;
        } else if (frameId === 'baroque_gold' || frameId === 'ornate_gold') {
            defs += `
                <linearGradient id="${uid}_gold_h" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#543c0c"/>
                    <stop offset="12%" stop-color="#a37822"/>
                    <stop offset="28%" stop-color="#d4af37"/>
                    <stop offset="45%" stop-color="#fdf1a9"/>
                    <stop offset="62%" stop-color="#d4af37"/>
                    <stop offset="80%" stop-color="#966d1a"/>
                    <stop offset="94%" stop-color="#fdf1a9"/>
                    <stop offset="100%" stop-color="#3d2a06"/>
                </linearGradient>
                <linearGradient id="${uid}_gold_v" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#543c0c"/>
                    <stop offset="12%" stop-color="#a37822"/>
                    <stop offset="28%" stop-color="#d4af37"/>
                    <stop offset="45%" stop-color="#fdf1a9"/>
                    <stop offset="62%" stop-color="#d4af37"/>
                    <stop offset="80%" stop-color="#966d1a"/>
                    <stop offset="94%" stop-color="#fdf1a9"/>
                    <stop offset="100%" stop-color="#3d2a06"/>
                </linearGradient>
                <linearGradient id="${uid}_gold_h_rev" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stop-color="#543c0c"/>
                    <stop offset="12%" stop-color="#a37822"/>
                    <stop offset="28%" stop-color="#d4af37"/>
                    <stop offset="45%" stop-color="#fdf1a9"/>
                    <stop offset="62%" stop-color="#d4af37"/>
                    <stop offset="80%" stop-color="#966d1a"/>
                    <stop offset="94%" stop-color="#fdf1a9"/>
                    <stop offset="100%" stop-color="#3d2a06"/>
                </linearGradient>
                <linearGradient id="${uid}_gold_v_rev" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stop-color="#543c0c"/>
                    <stop offset="12%" stop-color="#a37822"/>
                    <stop offset="28%" stop-color="#d4af37"/>
                    <stop offset="45%" stop-color="#fdf1a9"/>
                    <stop offset="62%" stop-color="#d4af37"/>
                    <stop offset="80%" stop-color="#966d1a"/>
                    <stop offset="94%" stop-color="#fdf1a9"/>
                    <stop offset="100%" stop-color="#3d2a06"/>
                </linearGradient>
            `;
            const cornerSize = Math.min(F * 1.5, 40);
            railsHTML = `
                <polygon points="${x0},${y0} ${x5},${y0} ${x4},${y1} ${x1},${y1}" fill="url(#${uid}_gold_h)"/>
                <polygon points="${x0},${y5} ${x5},${y5} ${x4},${y4} ${x1},${y4}" fill="url(#${uid}_gold_h_rev)"/>
                <polygon points="${x0},${y0} ${x1},${y1} ${x1},${y4} ${x0},${y5}" fill="url(#${uid}_gold_v)"/>
                <polygon points="${x5},${y0} ${x4},${y1} ${x4},${y4} ${x5},${y5}" fill="url(#${uid}_gold_v_rev)"/>
                <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#3d2a06" stroke-width="1.5"/>
                <line x1="${x5}" y1="${y0}" x2="${x4}" y2="${y1}" stroke="#3d2a06" stroke-width="1.5"/>
                <line x1="${x0}" y1="${y5}" x2="${x1}" y2="${y4}" stroke="#3d2a06" stroke-width="1.5"/>
                <line x1="${x5}" y1="${y5}" x2="${x4}" y2="${y4}" stroke="#3d2a06" stroke-width="1.5"/>
                <!-- Embossed Center Bead Line -->
                <rect x="${F*0.4}" y="${F*0.4}" width="${w - 0.8*F}" height="${h - 0.8*F}" fill="none" stroke="#fdf1a9" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.85"/>
                <!-- Inner Deep Bevel -->
                <rect x="${x1}" y="${y1}" width="${w - 2*F}" height="${h - 2*F}" fill="none" stroke="#332104" stroke-width="2"/>
            `;
            // Corner Acanthus / Rosette Flourishes
            cornersHTML = `
                <g fill="#fdf1a9" stroke="#543c0c" stroke-width="0.75" opacity="0.9">
                    <!-- NW -->
                    <circle cx="${F*0.6}" cy="${F*0.6}" r="${F*0.25}"/>
                    <path d="M${F*0.3},${F*0.6} Q${F*0.6},${F*0.3} ${F*0.9},${F*0.6}"/>
                    <!-- NE -->
                    <circle cx="${w - F*0.6}" cy="${F*0.6}" r="${F*0.25}"/>
                    <path d="M${w - F*0.9},${F*0.6} Q${w - F*0.6},${F*0.3} ${w - F*0.3},${F*0.6}"/>
                    <!-- SW -->
                    <circle cx="${F*0.6}" cy="${h - F*0.6}" r="${F*0.25}"/>
                    <path d="M${F*0.3},${h - F*0.6} Q${F*0.6},${h - F*0.3} ${F*0.9},${h - F*0.6}"/>
                    <!-- SE -->
                    <circle cx="${w - F*0.6}" cy="${h - F*0.6}" r="${F*0.25}"/>
                    <path d="M${w - F*0.9},${h - F*0.6} Q${w - F*0.6},${h - F*0.3} ${w - F*0.3},${h - F*0.6}"/>
                </g>
            `;
        } else if (frameId === 'antique_silver') {
            defs += `
                <linearGradient id="${uid}_sil_h" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#343a40"/>
                    <stop offset="15%" stop-color="#6c757d"/>
                    <stop offset="35%" stop-color="#ced4da"/>
                    <stop offset="50%" stop-color="#f8f9fa"/>
                    <stop offset="70%" stop-color="#adb5bd"/>
                    <stop offset="90%" stop-color="#495057"/>
                    <stop offset="100%" stop-color="#212529"/>
                </linearGradient>
                <linearGradient id="${uid}_sil_v" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#343a40"/>
                    <stop offset="15%" stop-color="#6c757d"/>
                    <stop offset="35%" stop-color="#ced4da"/>
                    <stop offset="50%" stop-color="#f8f9fa"/>
                    <stop offset="70%" stop-color="#adb5bd"/>
                    <stop offset="90%" stop-color="#495057"/>
                    <stop offset="100%" stop-color="#212529"/>
                </linearGradient>
                <linearGradient id="${uid}_sil_h_rev" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stop-color="#343a40"/>
                    <stop offset="15%" stop-color="#6c757d"/>
                    <stop offset="35%" stop-color="#ced4da"/>
                    <stop offset="50%" stop-color="#f8f9fa"/>
                    <stop offset="70%" stop-color="#adb5bd"/>
                    <stop offset="90%" stop-color="#495057"/>
                    <stop offset="100%" stop-color="#212529"/>
                </linearGradient>
                <linearGradient id="${uid}_sil_v_rev" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stop-color="#343a40"/>
                    <stop offset="15%" stop-color="#6c757d"/>
                    <stop offset="35%" stop-color="#ced4da"/>
                    <stop offset="50%" stop-color="#f8f9fa"/>
                    <stop offset="70%" stop-color="#adb5bd"/>
                    <stop offset="90%" stop-color="#495057"/>
                    <stop offset="100%" stop-color="#212529"/>
                </linearGradient>
            `;
            railsHTML = `
                <polygon points="${x0},${y0} ${x5},${y0} ${x4},${y1} ${x1},${y1}" fill="url(#${uid}_sil_h)"/>
                <polygon points="${x0},${y5} ${x5},${y5} ${x4},${y4} ${x1},${y4}" fill="url(#${uid}_sil_h_rev)"/>
                <polygon points="${x0},${y0} ${x1},${y1} ${x1},${y4} ${x0},${y5}" fill="url(#${uid}_sil_v)"/>
                <polygon points="${x5},${y0} ${x4},${y1} ${x4},${y4} ${x5},${y5}" fill="url(#${uid}_sil_v_rev)"/>
                <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#1f2428" stroke-width="1.2"/>
                <line x1="${x5}" y1="${y0}" x2="${x4}" y2="${y1}" stroke="#1f2428" stroke-width="1.2"/>
                <line x1="${x0}" y1="${y5}" x2="${x1}" y2="${y4}" stroke="#1f2428" stroke-width="1.2"/>
                <line x1="${x5}" y1="${y5}" x2="${x4}" y2="${y4}" stroke="#1f2428" stroke-width="1.2"/>
                <rect x="${F*0.4}" y="${F*0.4}" width="${w - 0.8*F}" height="${h - 0.8*F}" fill="none" stroke="#f8f9fa" stroke-width="1" stroke-dasharray="2,3" opacity="0.8"/>
            `;
        } else if (frameId === 'brushed_aluminum' || frameId === 'champagne_metal') {
            defs += `
                <linearGradient id="${uid}_alum_h" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#e9ecef"/>
                    <stop offset="25%" stop-color="#f8f9fa"/>
                    <stop offset="60%" stop-color="#dee2e6"/>
                    <stop offset="100%" stop-color="#adb5bd"/>
                </linearGradient>
                <linearGradient id="${uid}_alum_v" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#e9ecef"/>
                    <stop offset="25%" stop-color="#f8f9fa"/>
                    <stop offset="60%" stop-color="#dee2e6"/>
                    <stop offset="100%" stop-color="#adb5bd"/>
                </linearGradient>
            `;
            railsHTML = `
                <polygon points="${x0},${y0} ${x5},${y0} ${x4},${y1} ${x1},${y1}" fill="url(#${uid}_alum_h)"/>
                <polygon points="${x0},${y5} ${x5},${y5} ${x4},${y4} ${x1},${y4}" fill="url(#${uid}_alum_h)"/>
                <polygon points="${x0},${y0} ${x1},${y1} ${x1},${y4} ${x0},${y5}" fill="url(#${uid}_alum_v)"/>
                <polygon points="${x5},${y0} ${x4},${y1} ${x4},${y4} ${x5},${y5}" fill="url(#${uid}_alum_v)"/>
                <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#adb5bd" stroke-width="0.75"/>
                <line x1="${x5}" y1="${y0}" x2="${x4}" y2="${y1}" stroke="#adb5bd" stroke-width="0.75"/>
                <line x1="${x0}" y1="${y5}" x2="${x1}" y2="${y4}" stroke="#adb5bd" stroke-width="0.75"/>
                <line x1="${x5}" y1="${y5}" x2="${x4}" y2="${y4}" stroke="#adb5bd" stroke-width="0.75"/>
                <rect x="${x1}" y="${y1}" width="${w - 2*F}" height="${h - 2*F}" fill="none" stroke="#6c757d" stroke-width="1"/>
            `;
        } else if (frameId === 'art_deco' || frameId === 'art_deco_brass') {
            defs += `
                <linearGradient id="${uid}_deco_h" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#d4af37"/>
                    <stop offset="25%" stop-color="#141414"/>
                    <stop offset="75%" stop-color="#262626"/>
                    <stop offset="100%" stop-color="#d4af37"/>
                </linearGradient>
                <linearGradient id="${uid}_deco_v" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#d4af37"/>
                    <stop offset="25%" stop-color="#141414"/>
                    <stop offset="75%" stop-color="#262626"/>
                    <stop offset="100%" stop-color="#d4af37"/>
                </linearGradient>
                <linearGradient id="${uid}_deco_h_rev" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stop-color="#d4af37"/>
                    <stop offset="25%" stop-color="#141414"/>
                    <stop offset="75%" stop-color="#262626"/>
                    <stop offset="100%" stop-color="#d4af37"/>
                </linearGradient>
                <linearGradient id="${uid}_deco_v_rev" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stop-color="#d4af37"/>
                    <stop offset="25%" stop-color="#141414"/>
                    <stop offset="75%" stop-color="#262626"/>
                    <stop offset="100%" stop-color="#d4af37"/>
                </linearGradient>
            `;
            railsHTML = `
                <polygon points="${x0},${y0} ${x5},${y0} ${x4},${y1} ${x1},${y1}" fill="url(#${uid}_deco_h)"/>
                <polygon points="${x0},${y5} ${x5},${y5} ${x4},${y4} ${x1},${y4}" fill="url(#${uid}_deco_h_rev)"/>
                <polygon points="${x0},${y0} ${x1},${y1} ${x1},${y4} ${x0},${y5}" fill="url(#${uid}_deco_v)"/>
                <polygon points="${x5},${y0} ${x4},${y1} ${x4},${y4} ${x5},${y5}" fill="url(#${uid}_deco_v_rev)"/>
                <rect x="${F*0.4}" y="${F*0.4}" width="${w - 0.8*F}" height="${h - 0.8*F}" fill="none" stroke="#d4af37" stroke-width="1.5"/>
                <rect x="${x1}" y="${y1}" width="${w - 2*F}" height="${h - 2*F}" fill="none" stroke="#d4af37" stroke-width="1.5"/>
            `;
            const cs = F;
            cornersHTML = `
                <g fill="none" stroke="#d4af37" stroke-width="1.5">
                    <!-- NW -->
                    <rect x="0" y="0" width="${cs}" height="${cs}" fill="#1a1a1a"/>
                    <line x1="0" y1="${cs*0.5}" x2="${cs*0.5}" y2="0"/>
                    <line x1="${cs*0.3}" y1="${cs}" x2="${cs}" y2="${cs*0.3}"/>
                    <rect x="0" y="0" width="${cs}" height="${cs}" stroke="#d4af37" stroke-width="1.2"/>
                    <!-- NE -->
                    <rect x="${w - cs}" y="0" width="${cs}" height="${cs}" fill="#1a1a1a"/>
                    <line x1="${w}" y1="${cs*0.5}" x2="${w - cs*0.5}" y2="0"/>
                    <line x1="${w - cs*0.3}" y1="${cs}" x2="${w - cs}" y2="${cs*0.3}"/>
                    <rect x="${w - cs}" y="0" width="${cs}" height="${cs}" stroke="#d4af37" stroke-width="1.2"/>
                    <!-- SW -->
                    <rect x="0" y="${h - cs}" width="${cs}" height="${cs}" fill="#1a1a1a"/>
                    <line x1="0" y1="${h - cs*0.5}" x2="${cs*0.5}" y2="${h}"/>
                    <line x1="${cs*0.3}" y1="${h - cs}" x2="${cs}" y2="${h - cs*0.3}"/>
                    <rect x="0" y="${h - cs}" width="${cs}" height="${cs}" stroke="#d4af37" stroke-width="1.2"/>
                    <!-- SE -->
                    <rect x="${w - cs}" y="${h - cs}" width="${cs}" height="${cs}" fill="#1a1a1a"/>
                    <line x1="${w}" y1="${h - cs*0.5}" x2="${w - cs*0.5}" y2="${h}"/>
                    <line x1="${w - cs*0.3}" y1="${h - cs}" x2="${w - cs}" y2="${h - cs*0.3}"/>
                    <rect x="${w - cs}" y="${h - cs}" width="${cs}" height="${cs}" stroke="#d4af37" stroke-width="1.2"/>
                </g>
            `;
        } else if (frameId === 'gallery_black' || frameId === 'museum_box_black') {
            defs += `
                <linearGradient id="${uid}_blk_h" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#141416"/>
                    <stop offset="30%" stop-color="#24262b"/>
                    <stop offset="70%" stop-color="#18191c"/>
                    <stop offset="100%" stop-color="#0a0a0c"/>
                </linearGradient>
                <linearGradient id="${uid}_blk_v" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#141416"/>
                    <stop offset="30%" stop-color="#24262b"/>
                    <stop offset="70%" stop-color="#18191c"/>
                    <stop offset="100%" stop-color="#0a0a0c"/>
                </linearGradient>
                <linearGradient id="${uid}_blk_h_rev" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stop-color="#141416"/>
                    <stop offset="30%" stop-color="#24262b"/>
                    <stop offset="70%" stop-color="#18191c"/>
                    <stop offset="100%" stop-color="#0a0a0c"/>
                </linearGradient>
                <linearGradient id="${uid}_blk_v_rev" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stop-color="#141416"/>
                    <stop offset="30%" stop-color="#24262b"/>
                    <stop offset="70%" stop-color="#18191c"/>
                    <stop offset="100%" stop-color="#0a0a0c"/>
                </linearGradient>
            `;
            railsHTML = `
                <polygon points="${x0},${y0} ${x5},${y0} ${x4},${y1} ${x1},${y1}" fill="url(#${uid}_blk_h)"/>
                <polygon points="${x0},${y5} ${x5},${y5} ${x4},${y4} ${x1},${y4}" fill="url(#${uid}_blk_h_rev)"/>
                <polygon points="${x0},${y0} ${x1},${y1} ${x1},${y4} ${x0},${y5}" fill="url(#${uid}_blk_v)"/>
                <polygon points="${x5},${y0} ${x4},${y1} ${x4},${y4} ${x5},${y5}" fill="url(#${uid}_blk_v_rev)"/>
                <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#2e3138" stroke-width="1"/>
                <line x1="${x5}" y1="${y0}" x2="${x4}" y2="${y1}" stroke="#2e3138" stroke-width="1"/>
                <line x1="${x0}" y1="${y5}" x2="${x1}" y2="${y4}" stroke="#2e3138" stroke-width="1"/>
                <line x1="${x5}" y1="${y5}" x2="${x4}" y2="${y4}" stroke="#2e3138" stroke-width="1"/>
                <rect x="${x1}" y="${y1}" width="${w - 2*F}" height="${h - 2*F}" fill="none" stroke="#000000" stroke-width="1.5"/>
            `;
        } else if (frameId === 'studio_white' || frameId === 'gallery_float_white') {
            defs += `
                <linearGradient id="${uid}_wht_h" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="40%" stop-color="#f8f9fa"/>
                    <stop offset="80%" stop-color="#edf0f2"/>
                    <stop offset="100%" stop-color="#d6dadf"/>
                </linearGradient>
                <linearGradient id="${uid}_wht_v" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="40%" stop-color="#f8f9fa"/>
                    <stop offset="80%" stop-color="#edf0f2"/>
                    <stop offset="100%" stop-color="#d6dadf"/>
                </linearGradient>
                <linearGradient id="${uid}_wht_h_rev" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="40%" stop-color="#f8f9fa"/>
                    <stop offset="80%" stop-color="#edf0f2"/>
                    <stop offset="100%" stop-color="#d6dadf"/>
                </linearGradient>
                <linearGradient id="${uid}_wht_v_rev" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="40%" stop-color="#f8f9fa"/>
                    <stop offset="80%" stop-color="#edf0f2"/>
                    <stop offset="100%" stop-color="#d6dadf"/>
                </linearGradient>
            `;
            railsHTML = `
                <polygon points="${x0},${y0} ${x5},${y0} ${x4},${y1} ${x1},${y1}" fill="url(#${uid}_wht_h)"/>
                <polygon points="${x0},${y5} ${x5},${y5} ${x4},${y4} ${x1},${y4}" fill="url(#${uid}_wht_h_rev)"/>
                <polygon points="${x0},${y0} ${x1},${y1} ${x1},${y4} ${x0},${y5}" fill="url(#${uid}_wht_v)"/>
                <polygon points="${x5},${y0} ${x4},${y1} ${x4},${y4} ${x5},${y5}" fill="url(#${uid}_wht_v_rev)"/>
                <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#cbd5e1" stroke-width="0.75"/>
                <line x1="${x5}" y1="${y0}" x2="${x4}" y2="${y1}" stroke="#cbd5e1" stroke-width="0.75"/>
                <line x1="${x0}" y1="${y5}" x2="${x1}" y2="${y4}" stroke="#cbd5e1" stroke-width="0.75"/>
                <line x1="${x5}" y1="${y5}" x2="${x4}" y2="${y4}" stroke="#cbd5e1" stroke-width="0.75"/>
                <rect x="${x1}" y="${y1}" width="${w - 2*F}" height="${h - 2*F}" fill="none" stroke="#94a3b8" stroke-width="1.2" opacity="0.6"/>
            `;
        } else if (frameId === 'espresso_box') {
            defs += `
                <linearGradient id="${uid}_esp_h" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#190e0a"/>
                    <stop offset="25%" stop-color="#361f16"/>
                    <stop offset="70%" stop-color="#24140e"/>
                    <stop offset="100%" stop-color="#0d0705"/>
                </linearGradient>
                <linearGradient id="${uid}_esp_v" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#190e0a"/>
                    <stop offset="25%" stop-color="#361f16"/>
                    <stop offset="70%" stop-color="#24140e"/>
                    <stop offset="100%" stop-color="#0d0705"/>
                </linearGradient>
                <linearGradient id="${uid}_esp_h_rev" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stop-color="#190e0a"/>
                    <stop offset="25%" stop-color="#361f16"/>
                    <stop offset="70%" stop-color="#24140e"/>
                    <stop offset="100%" stop-color="#0d0705"/>
                </linearGradient>
                <linearGradient id="${uid}_esp_v_rev" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stop-color="#190e0a"/>
                    <stop offset="25%" stop-color="#361f16"/>
                    <stop offset="70%" stop-color="#24140e"/>
                    <stop offset="100%" stop-color="#0d0705"/>
                </linearGradient>
            `;
            railsHTML = `
                <polygon points="${x0},${y0} ${x5},${y0} ${x4},${y1} ${x1},${y1}" fill="url(#${uid}_esp_h)"/>
                <polygon points="${x0},${y5} ${x5},${y5} ${x4},${y4} ${x1},${y4}" fill="url(#${uid}_esp_h_rev)"/>
                <polygon points="${x0},${y0} ${x1},${y1} ${x1},${y4} ${x0},${y5}" fill="url(#${uid}_esp_v)"/>
                <polygon points="${x5},${y0} ${x4},${y1} ${x4},${y4} ${x5},${y5}" fill="url(#${uid}_esp_v_rev)"/>
                <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#42251a" stroke-width="1"/>
                <line x1="${x5}" y1="${y0}" x2="${x4}" y2="${y1}" stroke="#42251a" stroke-width="1"/>
                <line x1="${x0}" y1="${y5}" x2="${x1}" y2="${y4}" stroke="#42251a" stroke-width="1"/>
                <line x1="${x5}" y1="${y5}" x2="${x4}" y2="${y4}" stroke="#42251a" stroke-width="1"/>
                <rect x="${x1}" y="${y1}" width="${w - 2*F}" height="${h - 2*F}" fill="none" stroke="#120906" stroke-width="1.5"/>
            `;
        } else if (frameId.startsWith('retro_plastic_')) {
            let baseColor = '#e11d48', glossColor = '#fda4af', shadowColor = '#881337';
            if (frameId === 'retro_plastic_teal' || frameId === 'retro_plastic_default' || frameId === 'retro_plastic_teal_green') {
                baseColor = '#0f766e'; glossColor = '#5eead4'; shadowColor = '#042f2e';
            } else if (frameId === 'retro_plastic_yellow') {
                baseColor = '#eab308'; glossColor = '#fef08a'; shadowColor = '#854d0e';
            } else if (frameId === 'retro_plastic_blue') {
                baseColor = '#2563eb'; glossColor = '#93c5fd'; shadowColor = '#1e3a8a';
            } else if (frameId === 'retro_plastic_green') {
                baseColor = '#16a34a'; glossColor = '#86efac'; shadowColor = '#14532d';
            } else if (frameId === 'retro_plastic_purple') {
                baseColor = '#7c3aed'; glossColor = '#c4b5fd'; shadowColor = '#4c1d95';
            } else if (frameId === 'retro_plastic_orange') {
                baseColor = '#ea580c'; glossColor = '#fed7aa'; shadowColor = '#7c2d12';
            } else if (frameId === 'retro_plastic_white') {
                baseColor = '#f8fafc'; glossColor = '#ffffff'; shadowColor = '#94a3b8';
            } else if (frameId === 'retro_plastic_black') {
                baseColor = '#18181b'; glossColor = '#71717a'; shadowColor = '#020617';
            }

            defs += `
                <linearGradient id="${uid}_plast_h" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${shadowColor}"/>
                    <stop offset="25%" stop-color="${baseColor}"/>
                    <stop offset="45%" stop-color="${glossColor}"/>
                    <stop offset="65%" stop-color="${baseColor}"/>
                    <stop offset="100%" stop-color="${shadowColor}"/>
                </linearGradient>
                <linearGradient id="${uid}_plast_h_rev" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stop-color="${shadowColor}"/>
                    <stop offset="25%" stop-color="${baseColor}"/>
                    <stop offset="45%" stop-color="${glossColor}"/>
                    <stop offset="65%" stop-color="${baseColor}"/>
                    <stop offset="100%" stop-color="${shadowColor}"/>
                </linearGradient>
                <linearGradient id="${uid}_plast_v" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="${shadowColor}"/>
                    <stop offset="25%" stop-color="${baseColor}"/>
                    <stop offset="45%" stop-color="${glossColor}"/>
                    <stop offset="65%" stop-color="${baseColor}"/>
                    <stop offset="100%" stop-color="${shadowColor}"/>
                </linearGradient>
                <linearGradient id="${uid}_plast_v_rev" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stop-color="${shadowColor}"/>
                    <stop offset="25%" stop-color="${baseColor}"/>
                    <stop offset="45%" stop-color="${glossColor}"/>
                    <stop offset="65%" stop-color="${baseColor}"/>
                    <stop offset="100%" stop-color="${shadowColor}"/>
                </linearGradient>
            `;
            railsHTML = `
                <!-- Molded Plastic Rail Shell with 100% Hollow Aperture -->
                <path d="M 10 0 L ${w - 10} 0 Q ${w} 0 ${w} 10 L ${w} ${h - 10} Q ${w} ${h} ${w - 10} ${h} L 10 ${h} Q 0 ${h} 0 ${h - 10} L 0 10 Q 0 0 10 0 Z M ${x1} ${y1} L ${x1} ${y4} L ${x4} ${y4} L ${x4} ${y1} Z" fill="${baseColor}" fill-rule="evenodd"/>
                <!-- Shaded Plastic Rails -->
                <polygon points="${x0},${y0} ${x5},${y0} ${x4},${y1} ${x1},${y1}" fill="url(#${uid}_plast_h)" opacity="0.85"/>
                <polygon points="${x0},${y5} ${x5},${y5} ${x4},${y4} ${x1},${y4}" fill="url(#${uid}_plast_h_rev)" opacity="0.85"/>
                <polygon points="${x0},${y0} ${x1},${y1} ${x1},${y4} ${x0},${y5}" fill="url(#${uid}_plast_v)" opacity="0.85"/>
                <polygon points="${x5},${y0} ${x4},${y1} ${x4},${y4} ${x5},${y5}" fill="url(#${uid}_plast_v_rev)" opacity="0.85"/>
                <!-- Specular Highlight Curve -->
                <polyline points="${F*0.5},${h - F*0.5} ${F*0.5},${F*0.5} ${w - F*0.5},${F*0.5}" fill="none" stroke="${glossColor}" stroke-width="${Math.max(1.5, Math.round(F*0.12))}" stroke-linecap="round" opacity="0.9"/>
                <!-- Outer Rounded Contour & Inner Bevel Stroke -->
                <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="8" ry="8" fill="none" stroke="${shadowColor}" stroke-width="1" opacity="0.6"/>
                <rect x="${x1}" y="${y1}" width="${w - 2*F}" height="${h - 2*F}" rx="2" ry="2" fill="none" stroke="${shadowColor}" stroke-width="1.5"/>
            `;
        } else if (frameId === 'scalloped_stamp' || frameId === 'vintage_postage') {
            const r = Math.max(3, Math.min(5, Math.round(F * 0.22)));
            const step = Math.max(12, Math.round(r * 3.8));
            let stampHoles = '';
            for (let x = step; x < w - step/2; x += step) {
                stampHoles += `<circle cx="${x}" cy="0" r="${r}" fill="black"/>`;
                stampHoles += `<circle cx="${x}" cy="${h}" r="${r}" fill="black"/>`;
            }
            for (let y = step; y < h - step/2; y += step) {
                stampHoles += `<circle cx="0" cy="${y}" r="${r}" fill="black"/>`;
                stampHoles += `<circle cx="${w}" cy="${y}" r="${r}" fill="black"/>`;
            }

            defs += `
                <mask id="${uid}_stamp_mask">
                    <rect x="0" y="0" width="${w}" height="${h}" fill="white"/>
                    ${stampHoles}
                </mask>
                <linearGradient id="${uid}_stamp_grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#f5efe0"/>
                    <stop offset="50%" stop-color="#ebe2cf"/>
                    <stop offset="100%" stop-color="#dfd4bd"/>
                </linearGradient>
            `;

            railsHTML = `
                <!-- Hollow Stamp Border with Masked Perforations -->
                <path d="M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${x1} ${y1} L ${x1} ${y4} L ${x4} ${y4} L ${x4} ${y1} Z" fill="url(#${uid}_stamp_grad)" fill-rule="evenodd" stroke="#b8a88c" stroke-width="0.75" mask="url(#${uid}_stamp_mask)"/>
                <!-- Engraved Outer Hairline -->
                <rect x="${r * 1.8}" y="${r * 1.8}" width="${w - 2 * r * 1.8}" height="${h - 2 * r * 1.8}" fill="none" stroke="#8c7853" stroke-width="0.75" opacity="0.6"/>
                <!-- Engraved Inner Postal Border meeting image flush -->
                <rect x="${x1}" y="${y1}" width="${w - 2*F}" height="${h - 2*F}" fill="none" stroke="#5c4827" stroke-width="1.5"/>
                <!-- Perforated Stamp Inner Accent Line -->
                <rect x="${x1 - Math.max(2, Math.round(F*0.18))}" y="${y1 - Math.max(2, Math.round(F*0.18))}" width="${w - 2*F + 2*Math.max(2, Math.round(F*0.18))}" height="${h - 2*F + 2*Math.max(2, Math.round(F*0.18))}" fill="none" stroke="#a3906b" stroke-width="1" stroke-dasharray="3,3"/>
            `;
        } else {
            // Safe resilient fallback - hollow aperture mitered border with zero gap
            railsHTML = `
                <path d="M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${x1} ${y1} L ${x1} ${y4} L ${x4} ${y4} L ${x4} ${y1} Z" fill="#334155" fill-rule="evenodd"/>
                <rect x="${x1}" y="${y1}" width="${w - 2*F}" height="${h - 2*F}" fill="none" stroke="#1e293b" stroke-width="1.5"/>
            `;
        }

        // 2. Matboard (Passe-Partout) Definition
        if (useMat && M > 0) {
            const matPreset = MAT_PRESETS.find(m => m.id === matId) || MAT_PRESETS[1];
            defs += `
                <filter id="${uid}_mat_inset" x="0" y="0" width="100%" height="100%">
                    <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
                </filter>
            `;
            matHTML = `
                <!-- Matboard Field (Path with cutout for the photo) -->
                <path d="M${x1},${y1} H${x4} V${y4} H${x1} Z M${x2},${y2} V${y3} H${x3} V${y2} Z" fill="${matPreset.color}" fill-rule="evenodd"/>
                <!-- Mat 45° Bevel Cut Shadow onto Photo -->
                <rect x="${x2}" y="${y2}" width="${w - 2*T}" height="${h - 2*T}" fill="none" stroke="${matPreset.borderColor}" stroke-width="1.5" filter="url(#${uid}_mat_inset)"/>
            `;
            if (matPreset.fillet) {
                matHTML += `
                    <!-- Gilded / Contrast Fillet -->
                    <rect x="${x2 - 2}" y="${y2 - 2}" width="${w - 2*T + 4}" height="${h - 2*T + 4}" fill="none" stroke="${matPreset.fillet}" stroke-width="1.5"/>
                `;
            }
        }

        return `
            <svg class="picture-frame-svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" ${filterAttr}>
                <defs>${defs}</defs>
                ${railsHTML}
                ${matHTML}
                ${cornersHTML}
            </svg>
        `.trim();
    }

    /**
     * Applies a frame style to a given .pub-element containing an image.
     */
    function applyFrame(el, options, skipHistory = false) {
        if (!el) return;
        const img = el.querySelector('.element-content img') || el.querySelector('img');
        if (!img) return;

        options = options || {};
        const frameId = normalizeFrameId(options.frameId || 'oak_wood');
        const frameWidth = parseInt(options.frameWidth) || 24;
        const matId = options.matId || 'none';
        const matWidth = (matId !== 'none') ? (parseInt(options.matWidth) || 16) : 0;
        const hasShadow = (options.hasShadow !== undefined) ? !!options.hasShadow : true;
        const fitMode = options.fitMode || 'outside'; // 'outside' (default) or 'inside'

        const totalInset = frameWidth + matWidth;

        // Save original geometry if not already recorded
        let origW = parseFloat(el.getAttribute('data-frame-orig-w'));
        let origH = parseFloat(el.getAttribute('data-frame-orig-h'));
        let origX = parseFloat(el.getAttribute('data-frame-orig-x'));
        let origY = parseFloat(el.getAttribute('data-frame-orig-y'));

        const isCurrentlyFramed = el.classList.contains('has-picture-frame');

        if (!isCurrentlyFramed || isNaN(origW) || isNaN(origH)) {
            origW = el.offsetWidth || parseFloat(el.style.width) || 300;
            origH = el.offsetHeight || parseFloat(el.style.height) || 200;
            origX = el.offsetLeft || parseFloat(el.style.left) || 50;
            origY = el.offsetTop || parseFloat(el.style.top) || 50;

            el.setAttribute('data-frame-orig-w', Math.round(origW));
            el.setAttribute('data-frame-orig-h', Math.round(origH));
            el.setAttribute('data-frame-orig-x', Math.round(origX));
            el.setAttribute('data-frame-orig-y', Math.round(origY));
        }

        let targetW, targetH, targetX, targetY;

        if (fitMode === 'outside') {
            targetW = Math.round(origW + 2 * totalInset);
            targetH = Math.round(origH + 2 * totalInset);
            targetX = Math.round(origX - totalInset);
            targetY = Math.round(origY - totalInset);
        } else {
            targetW = Math.round(origW);
            targetH = Math.round(origH);
            targetX = Math.round(origX);
            targetY = Math.round(origY);
        }

        el.style.width = targetW + 'px';
        el.style.height = targetH + 'px';
        el.style.left = targetX + 'px';
        el.style.top = targetY + 'px';

        // Position interior image inside frame & mat aperture
        const photoW = Math.max(10, targetW - 2 * totalInset);
        const photoH = Math.max(10, targetH - 2 * totalInset);

        img.style.position = 'absolute';
        img.style.left = totalInset + 'px';
        img.style.top = totalInset + 'px';
        img.style.width = photoW + 'px';
        img.style.height = photoH + 'px';
        img.style.boxSizing = 'border-box';

        // Create or update overlay
        const contentDiv = el.querySelector('.element-content') || el;
        let overlay = el.querySelector('.element-picture-frame');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'element-picture-frame';
            overlay.style.cssText = 'position: absolute; inset: 0; pointer-events: none; z-index: 5; overflow: visible; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;';
            contentDiv.appendChild(overlay);
        }

        overlay.innerHTML = generateFrameSVG(frameId, targetW, targetH, frameWidth, matId, matWidth, hasShadow);

        el.classList.add('has-picture-frame');
        el.setAttribute('data-picture-frame', `${frameId}:${frameWidth}:${matId}:${matWidth}:${hasShadow ? 1 : 0}:${fitMode}`);
        if (!el.getAttribute('data-type')) el.setAttribute('data-type', 'image');

        observeElement(el);

        if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
        if (!skipHistory && typeof window.pushHistory === 'function') window.pushHistory();
        if (typeof window.syncFormatPictureSidebarFrame === 'function') window.syncFormatPictureSidebarFrame(el);
    }

    /**
     * Strips any applied picture frame and restores original image dimensions.
     */
    function removeFrame(el) {
        if (!el) return;
        const img = el.querySelector('.element-content img') || el.querySelector('img');
        const overlay = el.querySelector('.element-picture-frame');

        if (overlay) overlay.remove();

        const origW = parseFloat(el.getAttribute('data-frame-orig-w'));
        const origH = parseFloat(el.getAttribute('data-frame-orig-h'));
        const origX = parseFloat(el.getAttribute('data-frame-orig-x'));
        const origY = parseFloat(el.getAttribute('data-frame-orig-y'));

        if (!isNaN(origW) && !isNaN(origH)) {
            el.style.width = origW + 'px';
            el.style.height = origH + 'px';
            if (!isNaN(origX)) el.style.left = origX + 'px';
            if (!isNaN(origY)) el.style.top = origY + 'px';
        }

        if (img) {
            img.style.position = 'absolute';
            img.style.left = '0px';
            img.style.top = '0px';
            img.style.width = '100%';
            img.style.height = '100%';
        }

        el.classList.remove('has-picture-frame');
        el.removeAttribute('data-picture-frame');
        el.removeAttribute('data-frame-orig-w');
        el.removeAttribute('data-frame-orig-h');
        el.removeAttribute('data-frame-orig-x');
        el.removeAttribute('data-frame-orig-y');

        if (_resizeObserver) {
            try { _resizeObserver.unobserve(el); } catch(e) {}
        }

        if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
        if (typeof window.pushHistory === 'function') window.pushHistory();
    }

    /**
     * Parses frame configuration from an element.
     */
    function getFrameConfig(el) {
        if (!el) return null;
        const attr = el.getAttribute('data-picture-frame');
        if (!attr) return null;
        const parts = attr.split(':');
        return {
            frameId: normalizeFrameId(parts[0] || 'oak_wood'),
            frameWidth: parseInt(parts[1]) || 24,
            matId: parts[2] || 'none',
            matWidth: parseInt(parts[3]) || 0,
            hasShadow: parts[4] === '1',
            fitMode: parts[5] || 'outside'
        };
    }

    /**
     * Refreshes the SVG overlay on element resize.
     */
    function refreshElement(el) {
        if (!el) return;
        const config = getFrameConfig(el);
        if (!config) return;

        const w = el.offsetWidth || parseFloat(el.style.width) || 300;
        const h = el.offsetHeight || parseFloat(el.style.height) || 200;
        const totalInset = config.frameWidth + (config.matId !== 'none' ? config.matWidth : 0);

        const img = el.querySelector('.element-content img') || el.querySelector('img');
        if (img) {
            const photoW = Math.max(10, w - 2 * totalInset);
            const photoH = Math.max(10, h - 2 * totalInset);
            img.style.left = totalInset + 'px';
            img.style.top = totalInset + 'px';
            img.style.width = photoW + 'px';
            img.style.height = photoH + 'px';
        }

        let overlay = el.querySelector('.element-picture-frame');
        if (!overlay) {
            const contentDiv = el.querySelector('.element-content') || el;
            overlay = document.createElement('div');
            overlay.className = 'element-picture-frame';
            overlay.style.cssText = 'position: absolute; inset: 0; pointer-events: none; z-index: 5; overflow: visible; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;';
            contentDiv.appendChild(overlay);
        }
        overlay.innerHTML = generateFrameSVG(config.frameId, w, h, config.frameWidth, config.matId, config.matWidth, config.hasShadow);
        observeElement(el);
    }

    function observeElement(el) {
        if (!el || typeof ResizeObserver === 'undefined') return;
        if (!_resizeObserver) {
            _resizeObserver = new ResizeObserver(entries => {
                for (const entry of entries) {
                    const target = entry.target;
                    if (target && target.classList.contains('has-picture-frame')) {
                        refreshElement(target);
                    }
                }
            });
        }
        _resizeObserver.observe(el);
    }

    // Initialize any existing framed elements on document ready and watch paper for new ones
    function init() {
        document.querySelectorAll('.pub-element[data-picture-frame]').forEach(el => {
            el.classList.add('has-picture-frame');
            observeElement(el);
            refreshElement(el);
        });

        const paper = document.getElementById('paper');
        if (paper && typeof MutationObserver !== 'undefined') {
            const paperObserver = new MutationObserver(mutations => {
                for (const m of mutations) {
                    if (m.addedNodes) {
                        m.addedNodes.forEach(node => {
                            if (node.nodeType === 1) {
                                if (node.hasAttribute && node.hasAttribute('data-picture-frame')) {
                                    node.classList.add('has-picture-frame');
                                    observeElement(node);
                                    refreshElement(node);
                                }
                                if (node.querySelectorAll) {
                                    node.querySelectorAll('.pub-element[data-picture-frame]').forEach(child => {
                                        child.classList.add('has-picture-frame');
                                        observeElement(child);
                                        refreshElement(child);
                                    });
                                }
                            }
                        });
                    }
                }
            });
            paperObserver.observe(paper, { childList: true, subtree: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.PictureFrameEngine = {
        getPresets: function() { return FRAME_PRESETS; },
        getPresetById: function(id) { 
            id = normalizeFrameId(id);
            return FRAME_PRESETS.find(p => p.id === id) || FRAME_PRESETS[0]; 
        },
        getMatPresets: function() { return MAT_PRESETS; },
        generateFrameSVG: generateFrameSVG,
        applyFrame: applyFrame,
        removeFrame: removeFrame,
        getFrameConfig: getFrameConfig,
        refreshElement: refreshElement,
        normalizeFrameId: normalizeFrameId
    };

})(window);
