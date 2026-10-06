/**
 * Open Publisher v5.4.0
 * Dedicated Smart Arrows Engine
 *
 * Implements 98 authentic parametric vector arrows across 7 harmonized categories
 * (each category exactly 14 items = 2 rows of 7 in the gallery).
 * Resizing stretches the stem/shaft while preserving arrowhead proportions.
 * Tip adjustments scale smoothly via visual drag handles and floating slider controls.
 */

(function(window) {
    'use strict';

    // Master catalog of all 98 authentic smart arrow styles
    // 7 categories x 14 styles = 98 styles (Strict multiples of 7 for 7-column gallery)
    const ARROW_CATALOG = {
        'Block & Directional': [
            { id: 'block-right', name: 'Right Arrow', desc: 'Standard horizontal block arrow with stem-only stretching' },
            { id: 'block-left', name: 'Left Arrow', desc: 'Standard left-pointing block arrow' },
            { id: 'block-up', name: 'Up Arrow', desc: 'Vertical upward block arrow' },
            { id: 'block-down', name: 'Down Arrow', desc: 'Vertical downward block arrow' },
            { id: 'block-left-right', name: 'Double Arrow (H)', desc: 'Bidirectional horizontal arrow with fixed dual heads' },
            { id: 'block-up-down', name: 'Double Arrow (V)', desc: 'Bidirectional vertical arrow with fixed dual heads' },
            { id: 'quad-arrow', name: '4-Way Quad Arrow', desc: 'Four-way directional cross arrow with fixed tips' },
            { id: 'rounded-block-right', name: 'Rounded Block Right', desc: 'Block arrow with smoothly rounded back corners' },
            { id: 'rounded-block-left', name: 'Rounded Block Left', desc: 'Left block arrow with rounded back corners' },
            { id: 'rounded-block-up', name: 'Rounded Block Up', desc: 'Upward block arrow with rounded back corners' },
            { id: 'rounded-block-down', name: 'Rounded Block Down', desc: 'Downward block arrow with rounded back corners' },
            { id: 'block-diagonal-up-right', name: 'Diagonal Up-Right', desc: '45-degree diagonal upward-right block arrow' },
            { id: 'block-diagonal-down-right', name: 'Diagonal Down-Right', desc: '45-degree diagonal downward-right block arrow' },
            { id: 'blunt-block-right', name: 'Blunt Block Arrow', desc: 'Heavy block arrow with wide 90-degree arrowhead' }
        ],
        'Notched & Shaped': [
            { id: 'notched-right', name: 'Notched Right', desc: 'Right block arrow with indented triangular tail' },
            { id: 'notched-left', name: 'Notched Left', desc: 'Left block arrow with indented tail' },
            { id: 'pentagon-right', name: 'Pentagon Arrow', desc: 'Clean geometric arrow with flat vertical tail' },
            { id: 'chevron-right', name: 'Chevron Arrow', desc: 'V-notched chevron directional pointer' },
            { id: 'chevron-left', name: 'Chevron Left', desc: 'Leftward V-notched chevron pointer' },
            { id: 'chevron-up', name: 'Chevron Up', desc: 'Upward pointing chevron arrow' },
            { id: 'chevron-down', name: 'Chevron Down', desc: 'Downward pointing chevron arrow' },
            { id: 'stealth-right', name: 'Stealth Arrow', desc: 'Swept-wing supersonic jet styling' },
            { id: 'curved-down-right', name: 'Curved Swoop Down', desc: 'Smooth 90-degree downward swooping arrow' },
            { id: 'curved-up-right', name: 'Curved Swoop Up', desc: 'Smooth 90-degree upward swooping arrow' },
            { id: 'u-turn-down', name: 'U-Turn Down', desc: 'Smooth curved 180-degree U-turn loop arrow' },
            { id: 'u-turn-up', name: 'U-Turn Up', desc: 'Smooth curved 180-degree upward U-turn loop arrow' },
            { id: 'dovetail-right', name: 'Dovetail Arrow', desc: 'Classic swallowtail ribbon notch tail with crisp arrowhead' },
            { id: 'tapered-right', name: 'Tapered Progress', desc: 'Corporate progression arrow widening steadily from tail to tip' }
        ],
        'Slender & Precision': [
            { id: 'slender-right', name: 'Slender Right', desc: 'Fine-stem arrow with broad triangular tip' },
            { id: 'slender-left', name: 'Slender Left', desc: 'Fine-stem leftward pointer' },
            { id: 'slender-up', name: 'Slender Up', desc: 'Fine-stem upward pointer' },
            { id: 'slender-down', name: 'Slender Down', desc: 'Fine-stem downward pointer' },
            { id: 'needle-right', name: 'Needle Right', desc: 'Hairline stem with elongated acute needle tip' },
            { id: 'needle-left', name: 'Needle Left', desc: 'Hairline stem with elongated leftward needle tip' },
            { id: 'diamond-tip-right', name: 'Diamond Tip', desc: 'Technical pointer with diamond arrowhead' },
            { id: 'diamond-tip-left', name: 'Diamond Tip Left', desc: 'Left technical pointer with diamond arrowhead' },
            { id: 'ball-stem-right', name: 'Ball Base Pointer', desc: 'Circular origin pin connecting to arrowhead' },
            { id: 'ball-stem-left', name: 'Ball Base Left', desc: 'Leftward pointer with circular origin pin' },
            { id: 'acute-pointer-right', name: 'Acute Pointer', desc: 'Fine-stem arrow with ultra-sharp razor acute tip' },
            { id: 'hairline-arrow', name: 'Hairline Drafting', desc: 'Ultra-fine minimalist technical drafting arrow' },
            { id: 'surveyor-arrow', name: 'Surveyor Pin Arrow', desc: 'Geodesic surveyor marker arrow with lozenge tail pin' },
            { id: 'triangular-pointer-right', name: 'Triangular Pointer', desc: 'Slim stem with prominent equilateral triangular head' }
        ],
        'Callout & Stylized': [
            { id: 'callout-right', name: 'Callout Right', desc: 'Extra wide stem callout block arrow' },
            { id: 'callout-left', name: 'Callout Left', desc: 'Extra wide stem leftward callout block arrow' },
            { id: 'callout-up', name: 'Callout Up', desc: 'Extra wide stem upward callout arrow' },
            { id: 'callout-down', name: 'Callout Down', desc: 'Extra wide stem downward callout arrow' },
            { id: 'heart-arrow-right', name: 'Heart Arrow', desc: 'Directional arrow with heart-shaped arrowhead' },
            { id: 'heart-tail-right', name: 'Heart Tail Arrow', desc: 'Playful arrow with indented heart-shaped tail fletching' },
            { id: 'archery-arrow-right', name: 'Archery Longbow Arrow', desc: 'Classic longbow arrow with dual feather fletching tail' },
            { id: 'cartoon-wedge-right', name: 'Cartoon Wedge', desc: 'Comic-book exaggerated expanding wedge arrow' },
            { id: 'barbed-arrow-right', name: 'Barbed Hunting Arrow', desc: 'Directional arrow with swept retention hunting barbs' },
            { id: 'fishtail-arrow-right', name: 'Fishtail Arrow', desc: 'Flared fishtail notch at tail with spearhead arrow tip' },
            { id: 'rocket-arrow-right', name: 'Rocket Arrow', desc: 'Aerodynamic rocket missile arrow with delta tail fins' },
            { id: 's-curve-arrow-right', name: 'S-Curve Arrow', desc: 'Smooth flowing S-bend ribbon stem into arrow head' },
            { id: 'harpoon-top-right', name: 'Harpoon Barb Top', desc: 'Single upper barb half-arrowhead vector pointer' },
            { id: 'harpoon-bottom-right', name: 'Harpoon Barb Bottom', desc: 'Single lower barb half-arrowhead vector pointer' }
        ],
        'Process & Infographic': [
            { id: 'chevron-block-right', name: 'Chevron Block Arrow', desc: 'Heavy chevron stem flowing into matching arrowhead' },
            { id: 'double-chevron-right', name: 'Double Chevron Arrow', desc: 'Nested dual chevron arrow showing forward progress' },
            { id: 'triple-chevron-right', name: 'Triple Chevron Arrow', desc: 'Nested triple chevron process arrow' },
            { id: 'capsule-arrow-right', name: 'Capsule Stem Arrow', desc: 'Modern UI rounded pill capsule stem with clean arrow tip' },
            { id: 'chamfered-right', name: 'Chamfered Block', desc: 'Architectural crisp 45-degree chamfered corners arrow' },
            { id: 'reverse-tapered-right', name: 'Reverse Tapered', desc: 'Thick tail tapering gracefully forward to arrowhead' },
            { id: 'forked-arrow-right', name: 'Forked Branch Arrow', desc: 'Branching decision flow with dual diverging arrowheads' },
            { id: 'merged-arrow-right', name: 'Merged Flow Arrow', desc: 'Dual incoming stems merging into a single arrow tip' },
            { id: 'loopback-arrow-right', name: 'Loopback Return', desc: 'Agile iterative feedback 180-degree return loop arrow' },
            { id: 'pennant-arrow-right', name: 'Pennant Ribbon Arrow', desc: 'Dovetail pennant ribbon tail with milestone arrowhead' },
            { id: 'milestone-arrow-right', name: 'Milestone Notch Arrow', desc: 'Stem with precision tick indicator notches at progress stages' },
            { id: 'target-arrow-right', name: 'Target Base Arrow', desc: 'Concentric target bullseye base with precision arrow pointer' },
            { id: 'corner-arrow-right', name: '90° Corner Flow', desc: 'Orthogonal downward-then-right flowchart routing arrow' },
            { id: 'hex-stem-right', name: 'Hexagonal Process', desc: 'Modular hexagonal process body connecting to arrowhead' }
        ],
        'Modern & Aerodynamic': [
            { id: 'swept-wing-right', name: 'Swept Wing Arrow', desc: 'Aerodynamic arrow with swept wings flaring past stem' },
            { id: 'dart-arrow-right', name: 'Supersonic Dart', desc: 'Ultra-acute supersonic dart arrow with long swept wings' },
            { id: 'split-stem-right', name: 'Split Stem Arrow', desc: 'Dual parallel floating bars meeting at unified arrowhead' },
            { id: 'angled-cut-right', name: 'Angled Cut Arrow', desc: 'Modern 30-degree forward-sheared tail and matching arrowhead' },
            { id: 'spearhead-right', name: 'Spearhead Arrow', desc: 'Diamond-faceted spearhead arrow on slender stem' },
            { id: 'conical-arrow-right', name: 'Conical Missile Arrow', desc: 'Sleek bullet profile fuselage tapering to needle tip' },
            { id: 'offset-notch-right', name: 'Offset Notch Arrow', desc: 'Asymmetrical architectural cutouts into arrow head' },
            { id: 'chevron-notch-right', name: 'Chevron Notch Arrow', desc: 'Deep parabolic rear chevron notch with matching acute head' },
            { id: 'flared-wing-right', name: 'Flared Wing Arrow', desc: 'Concave curved flared wings meeting at razor arrow tip' },
            { id: 'incline-arrow-up-right', name: 'Incline Growth Arrow', desc: '45-degree isometric ascent growth vector arrow' },
            { id: 'segmented-arrow-right', name: 'Segmented Block Arrow', desc: 'Dynamic 3-block progressive track into prominent arrowhead' },
            { id: 'dual-barb-right', name: 'Dual Barb Arrow', desc: 'High-tech pointer with secondary stabilizer barbs behind tip' },
            { id: 'delta-wing-right', name: 'Delta Wing Arrow', desc: 'Triangular delta wing planform with acute forward pointer' },
            { id: 'razor-arrow-right', name: 'Razor Arrow', desc: 'Ultra-wide low-profile broadhead hunting arrow' }
        ],
        'Hollow & Technical': [
            { id: 'hollow-block-right', name: 'Hollow Right', desc: 'Clean outline right arrow with transparent body' },
            { id: 'hollow-block-left', name: 'Hollow Left', desc: 'Clean outline left arrow with transparent body' },
            { id: 'hollow-block-up', name: 'Hollow Up', desc: 'Clean outline upward arrow' },
            { id: 'hollow-block-down', name: 'Hollow Down', desc: 'Clean outline downward arrow' },
            { id: 'hollow-double-right-left', name: 'Hollow Double (H)', desc: 'Outline bidirectional horizontal arrow' },
            { id: 'hollow-chevron-right', name: 'Hollow Chevron', desc: 'Outline chevron pointer' },
            { id: 'hollow-chevron-left', name: 'Hollow Chevron Left', desc: 'Outline leftward chevron pointer' },
            { id: 'open-barb-right', name: 'Technical Open Barb', desc: 'Architectural line arrow with open V head' },
            { id: 'open-barb-left', name: 'Technical Open Left', desc: 'Architectural left line arrow with open V head' },
            { id: 'open-barb-double', name: 'Technical Double Barb', desc: 'Architectural double-ended open barb arrow' },
            { id: 'open-barb-up', name: 'Technical Open Up', desc: 'Architectural vertical upward line arrow' },
            { id: 'open-barb-down', name: 'Technical Open Down', desc: 'Architectural vertical downward line arrow' },
            { id: 'dimension-arrow', name: 'Dimension Marker', desc: 'Engineering dimension line with end-tick marks' },
            { id: 'dimension-dual-right', name: 'Dual Dimension Marker', desc: 'Professional technical double-leader marker' }
        ]
    };

    /**
     * Compute parametric SVG path coordinates for a given arrow style and dimensions.
     * Guarantees fixed-head, stem-only stretching under all width and height combinations.
     */
    function resolveHead(customHead, defaultHead, maxAllowed) {
        if (customHead !== undefined && customHead !== null && !isNaN(customHead)) {
            return Math.max(8, Math.min(Math.round(customHead), maxAllowed));
        }
        return Math.max(10, Math.min(defaultHead, maxAllowed));
    }

    /**
     * Compute parametric SVG path coordinates for a given arrow style and dimensions.
     * Guarantees proportional head geometry, stem-only stretching, and customizable tip size.
     */
    function buildArrowPath(styleId, width, height, customHead) {
        const w = Math.max(10, Math.round(width));
        const h = Math.max(10, Math.round(height));

        let d = '';
        let headLength = 36;
        let isStrokeOnly = false;

        switch (styleId) {
            // =========================================================================
            // 1. BLOCK & DIRECTIONAL (14 styles)
            // =========================================================================
            case 'block-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'block-left': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemStart = headLength;
                d = `M ${w},${stemTop} L ${stemStart},${stemTop} L ${stemStart},0 L 0,${Math.round(h / 2)} L ${stemStart},${h} L ${stemStart},${stemBottom} L ${w},${stemBottom} Z`;
                break;
            }
            case 'block-up': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.7), maxHead);
                const stemThick = Math.min(Math.round(w * 0.4), Math.max(4, w - 4));
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                const stemStart = headLength;
                d = `M ${stemLeft},${h} L ${stemLeft},${stemStart} L 0,${stemStart} L ${Math.round(w / 2)},0 L ${w},${stemStart} L ${stemRight},${stemStart} L ${stemRight},${h} Z`;
                break;
            }
            case 'block-down': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.7), maxHead);
                const stemThick = Math.min(Math.round(w * 0.4), Math.max(4, w - 4));
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                const stemEnd = h - headLength;
                d = `M ${stemLeft},0 L ${stemLeft},${stemEnd} L 0,${stemEnd} L ${Math.round(w / 2)},${h} L ${w},${stemEnd} L ${stemRight},${stemEnd} L ${stemRight},0 Z`;
                break;
            }
            case 'block-left-right': {
                const maxHead = Math.max(8, Math.floor((w - 10) / 2));
                headLength = resolveHead(customHead, Math.round(h * 0.6), maxHead);
                const stemThick = Math.min(Math.round(h * 0.35), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const leftHeadEnd = headLength;
                const rightHeadStart = w - headLength;
                d = `M 0,${Math.round(h / 2)} L ${leftHeadEnd},0 L ${leftHeadEnd},${stemTop} L ${rightHeadStart},${stemTop} L ${rightHeadStart},0 L ${w},${Math.round(h / 2)} L ${rightHeadStart},${h} L ${rightHeadStart},${stemBottom} L ${leftHeadEnd},${stemBottom} L ${leftHeadEnd},${h} Z`;
                break;
            }
            case 'block-up-down': {
                const maxHead = Math.max(8, Math.floor((h - 10) / 2));
                headLength = resolveHead(customHead, Math.round(w * 0.6), maxHead);
                const stemThick = Math.min(Math.round(w * 0.35), Math.max(4, w - 4));
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                const topHeadEnd = headLength;
                const bottomHeadStart = h - headLength;
                d = `M ${Math.round(w / 2)},0 L ${w},${topHeadEnd} L ${stemRight},${topHeadEnd} L ${stemRight},${bottomHeadStart} L ${w},${bottomHeadStart} L ${Math.round(w / 2)},${h} L 0,${bottomHeadStart} L ${stemLeft},${bottomHeadStart} L ${stemLeft},${topHeadEnd} L 0,${topHeadEnd} Z`;
                break;
            }
            case 'quad-arrow': {
                const minDim = Math.min(w, h);
                const maxHead = Math.max(8, Math.floor((minDim - 10) / 2));
                headLength = resolveHead(customHead, Math.round(minDim * 0.3), maxHead);
                const stemThick = Math.min(Math.round(minDim * 0.28), Math.max(4, minDim - 8));
                const cx = Math.round(w / 2);
                const cy = Math.round(h / 2);
                const halfStem = Math.round(stemThick / 2);
                d = `M ${cx},0 L ${cx + headLength},${headLength} L ${cx + halfStem},${headLength} ` +
                    `L ${cx + halfStem},${cy - halfStem} L ${w - headLength},${cy - halfStem} L ${w - headLength},${cy - headLength} L ${w},${cy} ` +
                    `L ${w - headLength},${cy + headLength} L ${w - headLength},${cy + halfStem} L ${cx + halfStem},${cy + halfStem} ` +
                    `L ${cx + halfStem},${h - headLength} L ${cx + headLength},${h - headLength} L ${cx},${h} ` +
                    `L ${cx - headLength},${h - headLength} L ${cx - halfStem},${h - headLength} L ${cx - halfStem},${cy + halfStem} ` +
                    `L ${headLength},${cy + halfStem} L ${headLength},${cy + headLength} L 0,${cy} ` +
                    `L ${headLength},${cy - headLength} L ${headLength},${cy - halfStem} L ${cx - halfStem},${cy - halfStem} ` +
                    `L ${cx - halfStem},${headLength} L ${cx - headLength},${headLength} Z`;
                break;
            }
            case 'rounded-block-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const r = Math.min(8, Math.round(stemThick / 2));
                d = `M 0,${stemTop + r} Q 0,${stemTop} ${r},${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L ${r},${stemBottom} Q 0,${stemBottom} 0,${stemBottom - r} Z`;
                break;
            }
            case 'rounded-block-left': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemStart = headLength;
                const r = Math.min(8, Math.round(stemThick / 2));
                d = `M ${w - r},${stemTop} Q ${w},${stemTop} ${w},${stemTop + r} L ${w},${stemBottom - r} Q ${w},${stemBottom} ${w - r},${stemBottom} L ${stemStart},${stemBottom} L ${stemStart},${h} L 0,${Math.round(h / 2)} L ${stemStart},0 L ${stemStart},${stemTop} Z`;
                break;
            }
            case 'rounded-block-up': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.7), maxHead);
                const stemThick = Math.min(Math.round(w * 0.4), Math.max(4, w - 4));
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                const stemStart = headLength;
                const r = Math.min(8, Math.round(stemThick / 2));
                d = `M ${stemLeft},${h - r} Q ${stemLeft},${h} ${stemLeft + r},${h} L ${stemRight - r},${h} Q ${stemRight},${h} ${stemRight},${h - r} L ${stemRight},${stemStart} L ${w},${stemStart} L ${Math.round(w / 2)},0 L 0,${stemStart} L ${stemLeft},${stemStart} Z`;
                break;
            }
            case 'rounded-block-down': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.7), maxHead);
                const stemThick = Math.min(Math.round(w * 0.4), Math.max(4, w - 4));
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                const stemEnd = h - headLength;
                const r = Math.min(8, Math.round(stemThick / 2));
                d = `M ${stemLeft + r},0 Q ${stemLeft},0 ${stemLeft},${r} L ${stemLeft},${stemEnd} L 0,${stemEnd} L ${Math.round(w / 2)},${h} L ${w},${stemEnd} L ${stemRight},${stemEnd} L ${stemRight},${r} Q ${stemRight},0 ${stemRight - r},0 Z`;
                break;
            }
            case 'block-diagonal-up-right': {
                const maxHead = Math.max(12, Math.min(w, h) - 10);
                headLength = resolveHead(customHead, Math.round(Math.min(w, h) * 0.45), maxHead);
                const stemThick = Math.max(6, Math.round(Math.min(w, h) * 0.22));
                d = `M 0,${h - stemThick} L ${w - headLength},${stemThick} L ${w - headLength - 6},0 L ${w},0 L ${w},${headLength + 6} L ${w - stemThick},${headLength} L ${stemThick},${h} Z`;
                break;
            }
            case 'block-diagonal-down-right': {
                const maxHead = Math.max(12, Math.min(w, h) - 10);
                headLength = resolveHead(customHead, Math.round(Math.min(w, h) * 0.45), maxHead);
                const stemThick = Math.max(6, Math.round(Math.min(w, h) * 0.22));
                d = `M 0,${stemThick} L ${stemThick},0 L ${w - stemThick},${h - headLength} L ${w},${h - headLength - 6} L ${w},${h} L ${w - headLength - 6},${h} L ${w - headLength},${h - stemThick} Z`;
                break;
            }
            case 'blunt-block-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.5), maxHead);
                const stemThick = Math.min(Math.round(h * 0.55), Math.max(6, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }

            // =========================================================================
            // 2. NOTCHED & SHAPED (14 styles)
            // =========================================================================
            case 'notched-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const notchDepth = Math.min(Math.round(stemThick * 0.8), Math.round(stemEnd * 0.6));
                d = `M 0,${stemTop} L ${notchDepth},${Math.round(h / 2)} L 0,${stemBottom} L ${stemEnd},${stemBottom} L ${stemEnd},${h} L ${w},${Math.round(h / 2)} L ${stemEnd},0 L ${stemEnd},${stemTop} Z`;
                break;
            }
            case 'notched-left': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemStart = headLength;
                const notchDepth = Math.min(Math.round(stemThick * 0.8), Math.round((w - stemStart) * 0.6));
                d = `M ${w},${stemTop} L ${w - notchDepth},${Math.round(h / 2)} L ${w},${stemBottom} L ${stemStart},${stemBottom} L ${stemStart},${h} L 0,${Math.round(h / 2)} L ${stemStart},0 L ${stemStart},${stemTop} Z`;
                break;
            }
            case 'pentagon-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.4), maxHead);
                const stemEnd = w - headLength;
                d = `M 0,0 L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L 0,${h} Z`;
                break;
            }
            case 'chevron-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.45), maxHead);
                const notchDepth = headLength;
                d = `M 0,0 L ${w - headLength},0 L ${w},${Math.round(h / 2)} L ${w - headLength},${h} L 0,${h} L ${notchDepth},${Math.round(h / 2)} Z`;
                break;
            }
            case 'chevron-left': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.45), maxHead);
                const notchDepth = headLength;
                d = `M ${w},0 L ${headLength},0 L 0,${Math.round(h / 2)} L ${headLength},${h} L ${w},${h} L ${w - notchDepth},${Math.round(h / 2)} Z`;
                break;
            }
            case 'chevron-up': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.45), maxHead);
                const notchDepth = headLength;
                d = `M 0,${h} L 0,${headLength} L ${Math.round(w / 2)},0 L ${w},${headLength} L ${w},${h} L ${Math.round(w / 2)},${h - notchDepth} Z`;
                break;
            }
            case 'chevron-down': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.45), maxHead);
                const notchDepth = headLength;
                d = `M 0,0 L 0,${h - headLength} L ${Math.round(w / 2)},${h} L ${w},${h - headLength} L ${w},0 L ${Math.round(w / 2)},${notchDepth} Z`;
                break;
            }
            case 'stealth-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.4), maxHead);
                const wingIn = Math.round(headLength * 0.5);
                const stemThick = Math.min(Math.round(h * 0.25), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                d = `M 0,${stemTop} L ${w - headLength},${stemTop} L ${w - headLength - wingIn},0 L ${w},${Math.round(h / 2)} L ${w - headLength - wingIn},${h} L ${w - headLength},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'curved-down-right': {
                const maxHead = Math.max(10, Math.min(w, h) - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.5), maxHead);
                const stemThick = Math.min(Math.round(w * 0.3), Math.max(6, Math.round(h * 0.3)));
                const r = Math.max(10, Math.min(w, h) - headLength);
                d = `M 0,0 L ${stemThick},0 C ${stemThick + r},0 ${w - headLength},${h - stemThick - r} ${w - headLength},${h - stemThick} ` +
                    `L ${w - headLength},${h - stemThick - 10} L ${w},${Math.round(h - stemThick / 2)} L ${w - headLength},${h + 10} L ${w - headLength},${h} ` +
                    `C ${r},${h} 0,${stemThick + r} 0,${stemThick} Z`;
                break;
            }
            case 'curved-up-right': {
                const maxHead = Math.max(10, Math.min(w, h) - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.5), maxHead);
                const stemThick = Math.min(Math.round(w * 0.3), Math.max(6, Math.round(h * 0.3)));
                const r = Math.max(10, Math.min(w, h) - headLength);
                d = `M 0,${h} L ${stemThick},${h} C ${stemThick + r},${h} ${w - headLength},${stemThick + r} ${w - headLength},${stemThick} ` +
                    `L ${w - headLength},${stemThick + 10} L ${w},${Math.round(stemThick / 2)} L ${w - headLength},${-10} L ${w - headLength},0 ` +
                    `C ${r},0 0,${h - stemThick - r} 0,${h - stemThick} Z`;
                break;
            }
            case 'u-turn-down': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.4), maxHead);
                const stemW = Math.max(6, Math.round(w * 0.25));
                const innerGap = Math.max(8, w - (stemW * 2));
                const topCurve = Math.round(h * 0.4);
                d = `M 0,${h} L ${stemW},${h} L ${stemW},${topCurve} C ${stemW},${topCurve * 0.3} ${w - stemW},${topCurve * 0.3} ${w - stemW},${topCurve} ` +
                    `L ${w - stemW},${h - headLength} L ${w - stemW - 8},${h - headLength} L ${w - Math.round(stemW / 2)},${h} L ${w + 8},${h - headLength} L ${w},${h - headLength} ` +
                    `L ${w},${topCurve} C ${w},0 0,0 0,${topCurve} Z`;
                break;
            }
            case 'u-turn-up': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.4), maxHead);
                const stemW = Math.max(6, Math.round(w * 0.25));
                const bottomCurve = Math.round(h * 0.6);
                d = `M 0,0 L ${stemW},0 L ${stemW},${bottomCurve} C ${stemW},${h - (h - bottomCurve) * 0.3} ${w - stemW},${h - (h - bottomCurve) * 0.3} ${w - stemW},${bottomCurve} ` +
                    `L ${w - stemW},${headLength} L ${w - stemW - 8},${headLength} L ${w - Math.round(stemW / 2)},0 L ${w + 8},${headLength} L ${w},${headLength} ` +
                    `L ${w},${bottomCurve} C ${w},${h} 0,${h} 0,${bottomCurve} Z`;
                break;
            }
            case 'dovetail-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.45), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const notchDepth = Math.round(headLength * 0.4);
                d = `M 0,${stemTop} L ${notchDepth},${Math.round(h / 2)} L 0,${stemBottom} L ${stemEnd},${stemBottom} L ${stemEnd},${h} L ${w},${Math.round(h / 2)} L ${stemEnd},0 L ${stemEnd},${stemTop} Z`;
                break;
            }
            case 'tapered-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.65), maxHead);
                const stemEnd = w - headLength;
                const stemStartTop = Math.round(h * 0.36);
                const stemStartBottom = Math.round(h * 0.64);
                const stemEndTop = Math.round(h * 0.2);
                const stemEndBottom = Math.round(h * 0.8);
                d = `M 0,${stemStartTop} L ${stemEnd},${stemEndTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemEndBottom} L 0,${stemStartBottom} Z`;
                break;
            }

            // =========================================================================
            // 3. SLENDER & PRECISION (14 styles)
            // =========================================================================
            case 'slender-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.8), maxHead);
                const stemThick = Math.max(2, Math.round(h * 0.12));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'slender-left': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.8), maxHead);
                const stemThick = Math.max(2, Math.round(h * 0.12));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemStart = headLength;
                d = `M ${w},${stemTop} L ${stemStart},${stemTop} L ${stemStart},0 L 0,${Math.round(h / 2)} L ${stemStart},${h} L ${stemStart},${stemBottom} L ${w},${stemBottom} Z`;
                break;
            }
            case 'slender-up': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.8), maxHead);
                const stemThick = Math.max(2, Math.round(w * 0.12));
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                const stemStart = headLength;
                d = `M ${stemLeft},${h} L ${stemLeft},${stemStart} L 0,${stemStart} L ${Math.round(w / 2)},0 L ${w},${stemStart} L ${stemRight},${stemStart} L ${stemRight},${h} Z`;
                break;
            }
            case 'slender-down': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.8), maxHead);
                const stemThick = Math.max(2, Math.round(w * 0.12));
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                const stemEnd = h - headLength;
                d = `M ${stemLeft},0 L ${stemLeft},${stemEnd} L 0,${stemEnd} L ${Math.round(w / 2)},${h} L ${w},${stemEnd} L ${stemRight},${stemEnd} L ${stemRight},0 Z`;
                break;
            }
            case 'needle-right': {
                const maxHead = Math.max(12, w - 6);
                headLength = resolveHead(customHead, Math.round(w * 0.5), maxHead);
                const stemThick = Math.max(2, Math.round(h * 0.08));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},${Math.round(h * 0.2)} L ${w},${Math.round(h / 2)} L ${stemEnd},${Math.round(h * 0.8)} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'needle-left': {
                const maxHead = Math.max(12, w - 6);
                headLength = resolveHead(customHead, Math.round(w * 0.5), maxHead);
                const stemThick = Math.max(2, Math.round(h * 0.08));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemStart = headLength;
                d = `M ${w},${stemTop} L ${stemStart},${stemTop} L ${stemStart},${Math.round(h * 0.2)} L 0,${Math.round(h / 2)} L ${stemStart},${Math.round(h * 0.8)} L ${stemStart},${stemBottom} L ${w},${stemBottom} Z`;
                break;
            }
            case 'diamond-tip-right': {
                const maxHead = Math.max(12, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.9), maxHead);
                const stemThick = Math.max(2, Math.round(h * 0.1));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const diamondHalf = Math.round(headLength / 2);
                const diamondLeft = w - headLength;
                const diamondMid = diamondLeft + diamondHalf;
                d = `M 0,${stemTop} L ${diamondLeft},${stemTop} L ${diamondMid},0 L ${w},${Math.round(h / 2)} L ${diamondMid},${h} L ${diamondLeft},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'diamond-tip-left': {
                const maxHead = Math.max(12, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.9), maxHead);
                const stemThick = Math.max(2, Math.round(h * 0.1));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const diamondHalf = Math.round(headLength / 2);
                const diamondRight = headLength;
                const diamondMid = diamondHalf;
                d = `M ${w},${stemTop} L ${diamondRight},${stemTop} L ${diamondMid},0 L 0,${Math.round(h / 2)} L ${diamondMid},${h} L ${diamondRight},${stemBottom} L ${w},${stemBottom} Z`;
                break;
            }
            case 'ball-stem-right': {
                const maxHead = Math.max(10, w - 16);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.max(2, Math.round(h * 0.12));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const radius = Math.min(Math.round(h * 0.35), 14);
                const cy = Math.round(h / 2);
                d = `M ${radius * 2},${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${cy} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L ${radius * 2},${stemBottom} ` +
                    `A ${radius} ${radius} 0 1 1 ${radius * 2} ${stemTop} Z`;
                break;
            }
            case 'ball-stem-left': {
                const maxHead = Math.max(10, w - 16);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.max(2, Math.round(h * 0.12));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemStart = headLength;
                const radius = Math.min(Math.round(h * 0.35), 14);
                const cy = Math.round(h / 2);
                d = `M ${w - radius * 2},${stemTop} L ${stemStart},${stemTop} L ${stemStart},0 L 0,${cy} L ${stemStart},${h} L ${stemStart},${stemBottom} L ${w - radius * 2},${stemBottom} ` +
                    `A ${radius} ${radius} 0 1 0 ${w - radius * 2} ${stemTop} Z`;
                break;
            }
            case 'acute-pointer-right': {
                const maxHead = Math.max(14, w - 6);
                headLength = resolveHead(customHead, Math.round(w * 0.45), maxHead);
                const stemThick = Math.max(2, Math.round(h * 0.08));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},4 L ${w},${Math.round(h / 2)} L ${stemEnd},${h - 4} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'hairline-arrow': {
                const maxHead = Math.max(10, w - 6);
                headLength = resolveHead(customHead, Math.round(h * 0.6), maxHead);
                isStrokeOnly = true;
                const cy = Math.round(h / 2);
                d = `M 0,${cy} L ${w},${cy} M ${w - headLength},0 L ${w},${cy} L ${w - headLength},${h}`;
                break;
            }
            case 'surveyor-arrow': {
                const maxHead = Math.max(10, w - 16);
                headLength = resolveHead(customHead, Math.round(h * 0.65), maxHead);
                const stemThick = Math.max(2, Math.round(h * 0.1));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const loz = Math.min(12, Math.round(h * 0.35));
                const cy = Math.round(h / 2);
                d = `M 0,${cy} L ${loz},${cy - loz} L ${loz * 2},${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${cy} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L ${loz * 2},${stemBottom} L ${loz},${cy + loz} Z`;
                break;
            }
            case 'triangular-pointer-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.75), maxHead);
                const stemThick = Math.max(2, Math.round(h * 0.15));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }

            // =========================================================================
            // 4. CALLOUT & STYLIZED (14 styles)
            // =========================================================================
            case 'callout-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.6), maxHead);
                const stemThick = Math.min(Math.round(h * 0.7), Math.max(6, h - 2));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'callout-left': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.6), maxHead);
                const stemThick = Math.min(Math.round(h * 0.7), Math.max(6, h - 2));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemStart = headLength;
                d = `M ${w},${stemTop} L ${stemStart},${stemTop} L ${stemStart},0 L 0,${Math.round(h / 2)} L ${stemStart},${h} L ${stemStart},${stemBottom} L ${w},${stemBottom} Z`;
                break;
            }
            case 'callout-up': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.6), maxHead);
                const stemThick = Math.min(Math.round(w * 0.7), Math.max(6, w - 2));
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                const stemStart = headLength;
                d = `M ${stemLeft},${h} L ${stemLeft},${stemStart} L 0,${stemStart} L ${Math.round(w / 2)},0 L ${w},${stemStart} L ${stemRight},${stemStart} L ${stemRight},${h} Z`;
                break;
            }
            case 'callout-down': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.6), maxHead);
                const stemThick = Math.min(Math.round(w * 0.7), Math.max(6, w - 2));
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                const stemEnd = h - headLength;
                d = `M ${stemLeft},0 L ${stemLeft},${stemEnd} L 0,${stemEnd} L ${Math.round(w / 2)},${h} L ${w},${stemEnd} L ${stemRight},${stemEnd} L ${stemRight},0 Z`;
                break;
            }
            case 'heart-arrow-right': {
                const maxHead = Math.max(14, w - 12);
                headLength = resolveHead(customHead, Math.round(h * 0.9), maxHead);
                const stemThick = Math.max(3, Math.round(h * 0.12));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const cy = Math.round(h / 2);
                const fletch = Math.min(10, Math.round(headLength * 0.3));
                d = `M 0,${cy - fletch} L ${fletch},${stemTop} L ${stemEnd},${stemTop} ` +
                    `C ${stemEnd},0 ${w - Math.round(headLength * 0.3)},0 ${w},${cy} ` +
                    `C ${w - Math.round(headLength * 0.3)},${h} ${stemEnd},${h} ${stemEnd},${stemBottom} ` +
                    `L ${fletch},${stemBottom} L 0,${cy + fletch} L ${Math.round(fletch * 0.5)},${cy} Z`;
                break;
            }
            case 'heart-tail-right': {
                const maxHead = Math.max(10, w - 16);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.38), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const heartR = Math.min(14, Math.round(stemThick * 0.6));
                const cy = Math.round(h / 2);
                d = `M ${heartR * 2},${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${cy} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L ${heartR * 2},${stemBottom} ` +
                    `C ${heartR},${cy + heartR} 0,${cy + heartR} 0,${cy} ` +
                    `C 0,${cy - heartR} ${heartR},${cy - heartR} ${heartR * 2},${stemTop} Z`;
                break;
            }
            case 'archery-arrow-right': {
                const maxHead = Math.max(12, w - 16);
                headLength = resolveHead(customHead, Math.round(h * 0.8), maxHead);
                const stemThick = Math.max(2, Math.round(h * 0.1));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const fletchW = Math.min(16, Math.round(stemEnd * 0.25));
                const cy = Math.round(h / 2);
                d = `M 0,${cy - 8} L ${fletchW},${stemTop} L ${stemEnd},${stemTop} L ${stemEnd - 4},0 L ${w},${cy} L ${stemEnd - 4},${h} L ${stemEnd},${stemBottom} L ${fletchW},${stemBottom} L 0,${cy + 8} L 4,${cy} Z`;
                break;
            }
            case 'cartoon-wedge-right': {
                const maxHead = Math.max(12, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemEnd = w - headLength;
                const stemStartTop = Math.round(h * 0.4);
                const stemStartBottom = Math.round(h * 0.6);
                const stemEndTop = Math.round(h * 0.2);
                const stemEndBottom = Math.round(h * 0.8);
                d = `M 0,${stemStartTop} L ${stemEnd},${stemEndTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemEndBottom} L 0,${stemStartBottom} Z`;
                break;
            }
            case 'barbed-arrow-right': {
                const maxHead = Math.max(12, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.85), maxHead);
                const stemThick = Math.min(Math.round(h * 0.35), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const barbBack = Math.round(headLength * 0.3);
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd - barbBack},0 L ${w},${Math.round(h / 2)} L ${stemEnd - barbBack},${h} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'fishtail-arrow-right': {
                const maxHead = Math.max(10, w - 12);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.36), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const fishTail = Math.min(14, Math.round(headLength * 0.4));
                const cy = Math.round(h / 2);
                d = `M 0,${stemTop - 6} L ${fishTail},${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${cy} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L ${fishTail},${stemBottom} L 0,${stemBottom + 6} L ${Math.round(fishTail * 0.6)},${cy} Z`;
                break;
            }
            case 'rocket-arrow-right': {
                const maxHead = Math.max(12, w - 14);
                headLength = resolveHead(customHead, Math.round(h * 0.75), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(6, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const finW = Math.min(14, Math.round(headLength * 0.4));
                const cy = Math.round(h / 2);
                d = `M 0,${stemTop - 8} L ${finW},${stemTop} L ${stemEnd},${stemTop} L ${w},${cy} L ${stemEnd},${stemBottom} L ${finW},${stemBottom} L 0,${stemBottom + 8} L 4,${cy} Z`;
                break;
            }
            case 's-curve-arrow-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.6), maxHead);
                const stemThick = Math.max(4, Math.round(h * 0.2));
                const stemEnd = w - headLength;
                const cy = Math.round(h / 2);
                d = `M 0,${Math.round(h * 0.3)} C ${Math.round(stemEnd * 0.3)},${0} ${Math.round(stemEnd * 0.6)},${h} ${stemEnd},${cy - Math.round(stemThick / 2)} ` +
                    `L ${stemEnd},0 L ${w},${cy} L ${stemEnd},${h} L ${stemEnd},${cy + Math.round(stemThick / 2)} ` +
                    `C ${Math.round(stemEnd * 0.6)},${h + stemThick} ${Math.round(stemEnd * 0.3)},${stemThick} 0,${Math.round(h * 0.3) + stemThick} Z`;
                break;
            }
            case 'harpoon-top-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.3), Math.max(4, h - 4));
                const cy = Math.round(h / 2);
                const stemTop = cy - Math.round(stemThick / 2);
                const stemBottom = cy + Math.round(stemThick / 2);
                const stemEnd = w - headLength;
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'harpoon-bottom-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.3), Math.max(4, h - 4));
                const cy = Math.round(h / 2);
                const stemTop = cy - Math.round(stemThick / 2);
                const stemBottom = cy + Math.round(stemThick / 2);
                const stemEnd = w - headLength;
                d = `M 0,${stemTop} L ${w},${stemTop} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }

            // =========================================================================
            // 5. PROCESS & INFOGRAPHIC (14 styles)
            // =========================================================================
            case 'chevron-block-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.45), Math.max(6, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const chevNotch = Math.round(headLength * 0.4);
                d = `M 0,${stemTop} L ${chevNotch},${Math.round(h / 2)} L 0,${stemBottom} L ${stemEnd},${stemBottom} L ${stemEnd},${h} L ${w},${Math.round(h / 2)} L ${stemEnd},0 L ${stemEnd},${stemTop} Z`;
                break;
            }
            case 'double-chevron-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.45), maxHead);
                const c1w = Math.round((w - headLength) * 0.85);
                const notch = Math.round(headLength * 0.6);
                d = `M 0,0 L ${c1w},0 L ${c1w + notch},${Math.round(h / 2)} L ${c1w},${h} L 0,${h} L ${notch},${Math.round(h / 2)} Z ` +
                    `M ${c1w + 4},0 L ${w - headLength},0 L ${w},${Math.round(h / 2)} L ${w - headLength},${h} L ${c1w + 4},${h} L ${c1w + 4 + notch},${Math.round(h / 2)} Z`;
                break;
            }
            case 'triple-chevron-right': {
                const maxHead = Math.max(8, Math.round(w * 0.3));
                headLength = resolveHead(customHead, Math.round(w * 0.28), maxHead);
                const segW = Math.round((w - 8) / 3);
                const notch = Math.round(headLength * 0.5);
                d = `M 0,0 L ${segW},0 L ${segW + notch},${Math.round(h / 2)} L ${segW},${h} L 0,${h} L ${notch},${Math.round(h / 2)} Z ` +
                    `M ${segW + 2},0 L ${segW * 2},0 L ${segW * 2 + notch},${Math.round(h / 2)} L ${segW * 2},${h} L ${segW + 2},${h} L ${segW + 2 + notch},${Math.round(h / 2)} Z ` +
                    `M ${segW * 2 + 4},0 L ${w - headLength},0 L ${w},${Math.round(h / 2)} L ${w - headLength},${h} L ${segW * 2 + 4},${h} L ${segW * 2 + 4 + notch},${Math.round(h / 2)} Z`;
                break;
            }
            case 'capsule-arrow-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const r = Math.round(stemThick / 2);
                d = `M ${r},${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L ${r},${stemBottom} A ${r} ${r} 0 0 1 ${r} ${stemTop} Z`;
                break;
            }
            case 'chamfered-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.42), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const chamfer = Math.min(6, Math.round(stemThick * 0.3));
                d = `M 0,${stemTop + chamfer} L ${chamfer},${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L ${chamfer},${stemBottom} L 0,${stemBottom - chamfer} Z`;
                break;
            }
            case 'reverse-tapered-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemEnd = w - headLength;
                const stemStartTop = Math.round(h * 0.15);
                const stemStartBottom = Math.round(h * 0.85);
                const stemEndTop = Math.round(h * 0.35);
                const stemEndBottom = Math.round(h * 0.65);
                d = `M 0,${stemStartTop} L ${stemEnd},${stemEndTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemEndBottom} L 0,${stemStartBottom} Z`;
                break;
            }
            case 'forked-arrow-right': {
                const maxHead = Math.max(8, Math.round(w * 0.35));
                headLength = resolveHead(customHead, Math.round(w * 0.3), maxHead);
                const stemEnd = w - headLength;
                const stemThick = Math.max(4, Math.round(h * 0.18));
                const branchH = Math.round(h * 0.35);
                d = `M 0,${Math.round(h * 0.42)} L ${Math.round(stemEnd * 0.45)},${Math.round(h * 0.42)} L ${stemEnd},${branchH - Math.round(stemThick / 2)} ` +
                    `L ${stemEnd},0 L ${w},${branchH} L ${stemEnd},${branchH * 2} L ${stemEnd},${branchH + Math.round(stemThick / 2)} ` +
                    `L ${Math.round(stemEnd * 0.55)},${Math.round(h / 2)} L ${stemEnd},${h - branchH - Math.round(stemThick / 2)} ` +
                    `L ${stemEnd},${h - branchH * 2} L ${w},${h - branchH} L ${stemEnd},${h} L ${stemEnd},${h - branchH + Math.round(stemThick / 2)} ` +
                    `L ${Math.round(stemEnd * 0.45)},${Math.round(h * 0.58)} L 0,${Math.round(h * 0.58)} Z`;
                break;
            }
            case 'merged-arrow-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemEnd = w - headLength;
                const stemThick = Math.max(4, Math.round(h * 0.18));
                d = `M 0,${Math.round(h * 0.1)} L ${Math.round(stemEnd * 0.45)},${Math.round(h * 0.1)} L ${stemEnd},${Math.round((h - stemThick * 2) / 2)} ` +
                    `L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${Math.round((h + stemThick * 2) / 2)} ` +
                    `L ${Math.round(stemEnd * 0.45)},${Math.round(h * 0.9)} L 0,${Math.round(h * 0.9)} L 0,${Math.round(h * 0.9) - stemThick} ` +
                    `L ${Math.round(stemEnd * 0.4)},${Math.round(h * 0.55)} L ${Math.round(stemEnd * 0.4)},${Math.round(h * 0.45)} ` +
                    `L 0,${Math.round(h * 0.1) + stemThick} Z`;
                break;
            }
            case 'loopback-arrow-right': {
                const maxHead = Math.max(8, Math.round(w * 0.35));
                headLength = resolveHead(customHead, Math.round(w * 0.3), maxHead);
                const stemThick = Math.max(4, Math.round(h * 0.18));
                const r = Math.round(h / 2);
                d = `M 0,${stemThick} L ${w - r},${stemThick} A ${r - stemThick} ${r - stemThick} 0 0 1 ${w - r},${h - stemThick} ` +
                    `L ${headLength},${h - stemThick} L ${headLength},${h} L 0,${h - Math.round(stemThick / 2)} L ${headLength},${h - stemThick - 8} L ${headLength},${h - stemThick} ` +
                    `L ${w - r},${h - stemThick} A ${r} ${r} 0 0 0 ${w - r},0 L 0,0 Z`;
                break;
            }
            case 'pennant-arrow-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.5), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const notch = Math.round(headLength * 0.35);
                d = `M 0,${stemTop} L ${notch},${Math.round(h / 2)} L 0,${stemBottom} L ${stemEnd},${stemBottom} L ${stemEnd},${h} L ${w},${Math.round(h / 2)} L ${stemEnd},0 L ${stemEnd},${stemTop} Z`;
                break;
            }
            case 'milestone-arrow-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const tick1 = Math.round(stemEnd * 0.33);
                const tick2 = Math.round(stemEnd * 0.66);
                d = `M 0,${stemTop} L ${tick1 - 2},${stemTop} L ${tick1},${stemTop - 6} L ${tick1 + 2},${stemTop} ` +
                    `L ${tick2 - 2},${stemTop} L ${tick2},${stemTop - 6} L ${tick2 + 2},${stemTop} L ${stemEnd},${stemTop} ` +
                    `L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} ` +
                    `L ${tick2 + 2},${stemBottom} L ${tick2},${stemBottom + 6} L ${tick2 - 2},${stemBottom} ` +
                    `L ${tick1 + 2},${stemBottom} L ${tick1},${stemBottom + 6} L ${tick1 - 2},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'target-arrow-right': {
                const maxHead = Math.max(10, w - 16);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.3), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const r = Math.min(14, Math.round(h * 0.4));
                const cy = Math.round(h / 2);
                d = `M ${r * 2},${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${cy} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L ${r * 2},${stemBottom} ` +
                    `A ${r} ${r} 0 1 1 ${r * 2} ${stemTop} Z`;
                break;
            }
            case 'corner-arrow-right': {
                const maxHead = Math.max(10, Math.min(w, h) - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.5), maxHead);
                const stemThick = Math.min(Math.round(w * 0.28), Math.max(6, Math.round(h * 0.28)));
                d = `M 0,0 L ${stemThick},0 L ${stemThick},${h - stemThick} L ${w - headLength},${h - stemThick} ` +
                    `L ${w - headLength},${h - stemThick - 8} L ${w},${h - Math.round(stemThick / 2)} L ${w - headLength},${h + 8} L ${w - headLength},${h} L 0,${h} Z`;
                break;
            }
            case 'hex-stem-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.42), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${Math.round(h / 2)} L 8,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L 8,${stemBottom} Z`;
                break;
            }

            // =========================================================================
            // 6. MODERN & AERODYNAMIC (14 styles)
            // =========================================================================
            case 'swept-wing-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.45), maxHead);
                const stemThick = Math.min(Math.round(h * 0.3), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const wingSweep = Math.round(headLength * 0.4);
                d = `M 0,${stemTop} L ${w - headLength + wingSweep},${stemTop} L ${w - headLength},0 L ${w},${Math.round(h / 2)} L ${w - headLength},${h} L ${w - headLength + wingSweep},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'dart-arrow-right': {
                const maxHead = Math.max(14, w - 6);
                headLength = resolveHead(customHead, Math.round(w * 0.55), maxHead);
                const stemThick = Math.max(3, Math.round(h * 0.12));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd + Math.round(headLength * 0.3)},0 L ${w},${Math.round(h / 2)} L ${stemEnd + Math.round(headLength * 0.3)},${h} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'split-stem-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.75), maxHead);
                const stemEnd = w - headLength;
                const barThick = Math.max(3, Math.round(h * 0.16));
                const gap = Math.max(4, Math.round(h * 0.2));
                const topBarTop = Math.round((h - gap) / 2) - barThick;
                const bottomBarTop = Math.round((h + gap) / 2);
                d = `M 0,${topBarTop} L ${stemEnd},${topBarTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${bottomBarTop + barThick} L 0,${bottomBarTop + barThick} ` +
                    `L 0,${bottomBarTop} L ${stemEnd - 8},${bottomBarTop} L ${stemEnd - 8},${topBarTop + barThick} L 0,${topBarTop + barThick} Z`;
                break;
            }
            case 'angled-cut-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const shear = Math.round(stemThick * 0.6);
                d = `M ${shear},${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'spearhead-right': {
                const maxHead = Math.max(12, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.85), maxHead);
                const stemThick = Math.max(3, Math.round(h * 0.12));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const lozW = Math.round(headLength * 0.5);
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd + lozW},0 L ${w},${Math.round(h / 2)} L ${stemEnd + lozW},${h} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'conical-arrow-right': {
                const maxHead = Math.max(12, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.8), maxHead);
                const stemThick = Math.min(Math.round(h * 0.45), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} C ${stemEnd + Math.round(headLength * 0.5)},${stemTop} ${w - 4},${Math.round(h * 0.35)} ${w},${Math.round(h / 2)} ` +
                    `C ${w - 4},${Math.round(h * 0.65)} ${stemEnd + Math.round(headLength * 0.5)},${stemBottom} ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'offset-notch-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${stemTop + 4} L 6,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'chevron-notch-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.75), maxHead);
                const stemEnd = w - headLength;
                const notch = Math.round(headLength * 0.5);
                d = `M 0,0 L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L 0,${h} L ${notch},${Math.round(h / 2)} Z`;
                break;
            }
            case 'flared-wing-right': {
                const maxHead = Math.max(12, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.85), maxHead);
                const stemThick = Math.max(3, Math.round(h * 0.14));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} Q ${stemEnd + Math.round(headLength * 0.4)},0 ${w},${Math.round(h / 2)} ` +
                    `Q ${stemEnd + Math.round(headLength * 0.4)},${h} ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'incline-arrow-up-right': {
                const maxHead = Math.max(10, Math.min(w, h) - 8);
                headLength = resolveHead(customHead, Math.round(Math.min(w, h) * 0.5), maxHead);
                const stemThick = Math.max(4, Math.round(Math.min(w, h) * 0.2));
                d = `M 0,${h} L ${stemThick},${h} L ${w - headLength},${stemThick} L ${w - headLength},0 L ${w},0 L ${w},${headLength} ` +
                    `L ${w - stemThick},${headLength} L 0,${h - stemThick} Z`;
                break;
            }
            case 'segmented-arrow-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const blockW = Math.round((stemEnd - 8) / 2);
                d = `M 0,${stemTop} L ${blockW},${stemTop} L ${blockW},${stemBottom} L 0,${stemBottom} Z ` +
                    `M ${blockW + 4},${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L ${blockW + 4},${stemBottom} Z`;
                break;
            }
            case 'dual-barb-right': {
                const maxHead = Math.max(12, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.8), maxHead);
                const stemThick = Math.min(Math.round(h * 0.35), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                const barb1 = Math.round(headLength * 0.5);
                d = `M 0,${stemTop} L ${stemEnd - 6},${stemTop} L ${stemEnd - 6},${stemTop - 6} L ${stemEnd},${Math.round(h / 2)} L ${stemEnd - 6},${stemBottom + 6} L ${stemEnd - 6},${stemBottom} ` +
                    `L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'delta-wing-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.4), maxHead);
                const stemThick = Math.min(Math.round(h * 0.3), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${Math.round(h * 0.25)} L ${Math.round(stemEnd * 0.5)},${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L ${Math.round(stemEnd * 0.5)},${stemBottom} L 0,${Math.round(h * 0.75)} Z`;
                break;
            }
            case 'razor-arrow-right': {
                const maxHead = Math.max(12, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.9), maxHead);
                const stemThick = Math.min(Math.round(h * 0.25), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd - 6},0 L ${w},${Math.round(h / 2)} L ${stemEnd - 6},${h} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }

            // =========================================================================
            // 7. HOLLOW & TECHNICAL (14 styles)
            // =========================================================================
            case 'hollow-block-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
            case 'hollow-block-left': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemStart = headLength;
                d = `M ${w},${stemTop} L ${stemStart},${stemTop} L ${stemStart},0 L 0,${Math.round(h / 2)} L ${stemStart},${h} L ${stemStart},${stemBottom} L ${w},${stemBottom} Z`;
                break;
            }
            case 'hollow-block-up': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.7), maxHead);
                const stemThick = Math.min(Math.round(w * 0.4), Math.max(4, w - 4));
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                const stemStart = headLength;
                d = `M ${stemLeft},${h} L ${stemLeft},${stemStart} L 0,${stemStart} L ${Math.round(w / 2)},0 L ${w},${stemStart} L ${stemRight},${stemStart} L ${stemRight},${h} Z`;
                break;
            }
            case 'hollow-block-down': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.7), maxHead);
                const stemThick = Math.min(Math.round(w * 0.4), Math.max(4, w - 4));
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                const stemEnd = h - headLength;
                d = `M ${stemLeft},0 L ${stemLeft},${stemEnd} L 0,${stemEnd} L ${Math.round(w / 2)},${h} L ${w},${stemEnd} L ${stemRight},${stemEnd} L ${stemRight},0 Z`;
                break;
            }
            case 'hollow-double-right-left': {
                const maxHead = Math.max(8, Math.floor((w - 10) / 2));
                headLength = resolveHead(customHead, Math.round(h * 0.6), maxHead);
                const stemThick = Math.min(Math.round(h * 0.35), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const leftHeadEnd = headLength;
                const rightHeadStart = w - headLength;
                d = `M 0,${Math.round(h / 2)} L ${leftHeadEnd},0 L ${leftHeadEnd},${stemTop} L ${rightHeadStart},${stemTop} L ${rightHeadStart},0 L ${w},${Math.round(h / 2)} L ${rightHeadStart},${h} L ${rightHeadStart},${stemBottom} L ${leftHeadEnd},${stemBottom} L ${leftHeadEnd},${h} Z`;
                break;
            }
            case 'hollow-chevron-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.45), maxHead);
                const notchDepth = headLength;
                d = `M 0,0 L ${w - headLength},0 L ${w},${Math.round(h / 2)} L ${w - headLength},${h} L 0,${h} L ${notchDepth},${Math.round(h / 2)} Z`;
                break;
            }
            case 'hollow-chevron-left': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.45), maxHead);
                const notchDepth = headLength;
                d = `M ${w},0 L ${headLength},0 L 0,${Math.round(h / 2)} L ${headLength},${h} L ${w},${h} L ${w - notchDepth},${Math.round(h / 2)} Z`;
                break;
            }
            case 'open-barb-right': {
                const maxHead = Math.max(8, w - 6);
                headLength = resolveHead(customHead, Math.round(h * 0.6), maxHead);
                isStrokeOnly = true;
                const cy = Math.round(h / 2);
                d = `M 0,${cy} L ${w},${cy} M ${w - headLength},0 L ${w},${cy} L ${w - headLength},${h}`;
                break;
            }
            case 'open-barb-left': {
                const maxHead = Math.max(8, w - 6);
                headLength = resolveHead(customHead, Math.round(h * 0.6), maxHead);
                isStrokeOnly = true;
                const cy = Math.round(h / 2);
                d = `M ${w},${cy} L 0,${cy} M ${headLength},0 L 0,${cy} L ${headLength},${h}`;
                break;
            }
            case 'open-barb-double': {
                const maxHead = Math.max(8, Math.floor((w - 10) / 2));
                headLength = resolveHead(customHead, Math.round(h * 0.5), maxHead);
                isStrokeOnly = true;
                const cy = Math.round(h / 2);
                d = `M 0,${cy} L ${w},${cy} M ${headLength},0 L 0,${cy} L ${headLength},${h} M ${w - headLength},0 L ${w},${cy} L ${w - headLength},${h}`;
                break;
            }
            case 'open-barb-up': {
                const maxHead = Math.max(8, h - 6);
                headLength = resolveHead(customHead, Math.round(w * 0.6), maxHead);
                isStrokeOnly = true;
                const cx = Math.round(w / 2);
                d = `M ${cx},${h} L ${cx},0 M 0,${headLength} L ${cx},0 L ${w},${headLength}`;
                break;
            }
            case 'open-barb-down': {
                const maxHead = Math.max(8, h - 6);
                headLength = resolveHead(customHead, Math.round(w * 0.6), maxHead);
                isStrokeOnly = true;
                const cx = Math.round(w / 2);
                d = `M ${cx},0 L ${cx},${h} M 0,${h - headLength} L ${cx},${h} L ${w},${h - headLength}`;
                break;
            }
            case 'dimension-arrow': {
                const maxHead = Math.max(8, Math.floor((w - 10) / 2));
                headLength = resolveHead(customHead, Math.round(h * 0.5), maxHead);
                isStrokeOnly = true;
                const cy = Math.round(h / 2);
                d = `M 0,0 L 0,${h} M 0,${cy} L ${w},${cy} M ${w},0 L ${w},${h} M ${headLength},${cy - 8} L 0,${cy} L ${headLength},${cy + 8} M ${w - headLength},${cy - 8} L ${w},${cy} L ${w - headLength},${cy + 8}`;
                break;
            }
            case 'dimension-dual-right': {
                const maxHead = Math.max(8, Math.floor((w - 10) / 2));
                headLength = resolveHead(customHead, Math.round(h * 0.5), maxHead);
                isStrokeOnly = true;
                const cy = Math.round(h / 2);
                d = `M 0,4 L 0,${h - 4} M 0,${cy} L ${w},${cy} M ${w},4 L ${w},${h - 4} M ${headLength},4 L 0,${cy} L ${headLength},${h - 4} M ${w - headLength},4 L ${w},${cy} L ${w - headLength},${h - 4}`;
                break;
            }

            default: {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemEnd = w - headLength;
                d = `M 0,${stemTop} L ${stemEnd},${stemTop} L ${stemEnd},0 L ${w},${Math.round(h / 2)} L ${stemEnd},${h} L ${stemEnd},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
        }

        return { d, headLength, isStrokeOnly };
    }

    /**
     * Map of 100x100 preview SVGs for each arrow in the dropdown gallery.
     * All items are genuine, recognizable arrows with clear direction and crisp aesthetics.
     */
    const ARROW_PREVIEWS = {
        // --- 1. Block & Directional (14) ---
        'block-right': `<polygon points="10,35 55,35 55,18 90,50 55,82 55,65 10,65" />`,
        'block-left': `<polygon points="90,35 45,35 45,18 10,50 45,82 45,65 90,65" />`,
        'block-up': `<polygon points="35,90 35,45 18,45 50,10 82,45 65,45 65,90" />`,
        'block-down': `<polygon points="35,10 35,55 18,55 50,90 82,55 65,55 65,10" />`,
        'block-left-right': `<polygon points="10,50 35,20 35,38 65,38 65,20 90,50 65,80 65,62 35,62 35,80" />`,
        'block-up-down': `<polygon points="50,10 20,35 38,35 38,65 20,65 50,90 80,65 62,65 62,35 80,35" />`,
        'quad-arrow': `<polygon points="50,6 64,24 56,24 56,44 76,44 76,36 94,50 76,64 76,56 56,56 56,76 64,76 50,94 36,76 44,76 44,56 24,56 24,64 6,50 24,36 24,44 44,44 44,24 36,24" />`,
        'rounded-block-right': `<path d="M 10,42 Q 10,35 17,35 L 55,35 L 55,18 L 90,50 L 55,82 L 55,65 L 17,65 Q 10,65 10,58 Z" />`,
        'rounded-block-left': `<path d="M 83,35 Q 90,35 90,42 L 90,58 Q 90,65 83,65 L 45,65 L 45,82 L 10,50 L 45,18 L 45,35 Z" />`,
        'rounded-block-up': `<path d="M 35,83 Q 35,90 42,90 L 58,90 Q 65,90 65,83 L 65,45 L 82,45 L 50,10 L 18,45 L 35,45 Z" />`,
        'rounded-block-down': `<path d="M 42,10 Q 35,10 35,17 L 35,55 L 18,55 L 50,90 L 82,55 L 65,55 L 65,17 Q 65,10 58,10 Z" />`,
        'block-diagonal-up-right': `<polygon points="14,86 64,36 58,20 90,10 80,42 64,36 14,86" />`,
        'block-diagonal-down-right': `<polygon points="14,14 64,64 58,80 90,90 80,58 64,64 14,14" />`,
        'blunt-block-right': `<polygon points="10,30 55,30 55,10 90,50 55,90 55,70 10,70" />`,

        // --- 2. Notched & Shaped (14) ---
        'notched-right': `<polygon points="10,35 24,50 10,65 55,65 55,82 90,50 55,18 55,35" />`,
        'notched-left': `<polygon points="90,35 76,50 90,65 45,65 45,82 10,50 45,18 45,35" />`,
        'pentagon-right': `<polygon points="10,22 60,22 90,50 60,78 10,78" />`,
        'chevron-right': `<polygon points="10,18 55,18 90,50 55,82 10,82 45,50" />`,
        'chevron-left': `<polygon points="90,18 45,18 10,50 45,82 90,82 55,50" />`,
        'chevron-up': `<polygon points="18,90 18,45 50,10 82,45 82,90 50,55" />`,
        'chevron-down': `<polygon points="18,10 18,55 50,90 82,55 82,10 50,45" />`,
        'stealth-right': `<polygon points="10,40 50,40 35,16 90,50 35,84 50,60 10,60" />`,
        'curved-down-right': `<path d="M 20,15 L 42,15 C 64,15 72,40 72,55 L 62,55 L 85,82 L 95,55 L 85,55 C 85,30 65,15 42,15 Z" />`,
        'curved-up-right': `<path d="M 20,85 L 42,85 C 64,85 72,60 72,45 L 62,45 L 85,18 L 95,45 L 85,45 C 85,70 65,85 42,85 Z" />`,
        'u-turn-down': `<path d="M 20,85 L 36,85 L 36,40 C 36,25 64,25 64,40 L 64,60 L 52,60 L 72,85 L 92,60 L 80,60 L 80,40 C 80,10 20,10 20,40 Z" />`,
        'u-turn-up': `<path d="M 20,15 L 36,15 L 36,60 C 36,75 64,75 64,60 L 64,40 L 52,40 L 72,15 L 92,40 L 80,40 L 80,60 C 80,90 20,90 20,60 Z" />`,
        'dovetail-right': `<polygon points="10,35 22,50 10,65 55,65 55,82 90,50 55,18 55,35" />`,
        'tapered-right': `<polygon points="10,40 55,28 55,15 90,50 55,85 55,72 10,60" />`,

        // --- 3. Slender & Precision (14) ---
        'slender-right': `<polygon points="10,45 60,45 60,25 90,50 60,75 60,55 10,55" />`,
        'slender-left': `<polygon points="90,45 40,45 40,25 10,50 40,75 40,55 90,55" />`,
        'slender-up': `<polygon points="45,90 45,40 25,40 50,10 75,40 55,40 55,90" />`,
        'slender-down': `<polygon points="45,10 45,60 25,60 50,90 75,60 55,60 55,10" />`,
        'needle-right': `<polygon points="10,47 50,47 50,30 92,50 50,70 50,53 10,53" />`,
        'needle-left': `<polygon points="90,47 50,47 50,30 8,50 50,70 50,53 90,53" />`,
        'diamond-tip-right': `<polygon points="10,46 55,46 72,25 90,50 72,75 55,54 10,54" />`,
        'diamond-tip-left': `<polygon points="90,46 45,46 28,25 10,50 28,75 45,54 90,54" />`,
        'ball-stem-right': `<g><circle cx="22" cy="50" r="14" /><polygon points="22,46 58,46 58,25 90,50 58,75 58,54 22,54" /></g>`,
        'ball-stem-left': `<g><circle cx="78" cy="50" r="14" /><polygon points="78,46 42,46 42,25 10,50 42,75 42,54 78,54" /></g>`,
        'acute-pointer-right': `<polygon points="10,47 56,47 56,22 92,50 56,78 56,53 10,53" />`,
        'hairline-arrow': `<g stroke="var(--ui-theme-color)" stroke-width="4" fill="none"><line x1="10" y1="50" x2="88" y2="50" /><polyline points="64,26 88,50 64,74" /></g>`,
        'surveyor-arrow': `<polygon points="10,50 22,35 34,46 62,46 62,26 90,50 62,74 62,54 34,54 22,65" />`,
        'triangular-pointer-right': `<polygon points="10,46 58,46 58,20 90,50 58,80 58,54 10,54" />`,

        // --- 4. Callout & Stylized (14) ---
        'callout-right': `<polygon points="10,25 55,25 55,10 90,50 55,90 55,75 10,75" />`,
        'callout-left': `<polygon points="90,25 45,25 45,10 10,50 45,90 45,75 90,75" />`,
        'callout-up': `<polygon points="25,90 25,45 10,45 50,10 90,45 75,45 75,90" />`,
        'callout-down': `<polygon points="25,10 25,55 10,55 50,90 90,55 75,55 75,10" />`,
        'heart-arrow-right': `<path d="M 10,42 L 56,42 C 56,26 76,26 90,50 C 76,74 56,74 56,58 L 10,58 Z" />`,
        'heart-tail-right': `<path d="M 28,36 L 58,36 L 58,18 L 90,50 L 58,82 L 58,64 L 28,64 C 18,74 8,74 8,50 C 8,26 18,26 28,36 Z" />`,
        'archery-arrow-right': `<polygon points="10,38 24,46 62,46 58,24 90,50 58,76 62,54 24,54 10,62 16,50" />`,
        'cartoon-wedge-right': `<polygon points="10,42 55,26 55,15 90,50 55,85 55,74 10,58" />`,
        'barbed-arrow-right': `<polygon points="10,38 60,38 48,16 92,50 48,84 60,62 10,62" />`,
        'fishtail-arrow-right': `<polygon points="10,30 24,45 60,45 60,20 90,50 60,80 60,55 24,55 10,70 18,50" />`,
        'rocket-arrow-right': `<polygon points="10,32 24,42 60,42 90,50 60,58 24,58 10,68 14,50" />`,
        's-curve-arrow-right': `<path d="M 10,35 C 30,10 50,90 70,45 L 70,25 L 92,50 L 70,75 L 70,55 C 50,100 30,20 10,45 Z" />`,
        'harpoon-top-right': `<polygon points="10,44 60,44 60,18 90,56 10,56" />`,
        'harpoon-bottom-right': `<polygon points="10,44 90,44 60,82 60,56 10,56" />`,

        // --- 5. Process & Infographic (14) ---
        'chevron-block-right': `<polygon points="10,35 24,50 10,65 58,65 58,82 92,50 58,18 58,35" />`,
        'double-chevron-right': `<path d="M 8,16 L 46,16 L 60,50 L 46,84 L 8,84 L 22,50 Z M 48,16 L 82,16 L 96,50 L 82,84 L 48,84 L 62,50 Z" />`,
        'triple-chevron-right': `<path d="M 6,18 L 32,18 L 44,50 L 32,82 L 6,82 L 18,50 Z M 34,18 L 60,18 L 72,50 L 60,82 L 34,82 L 46,50 Z M 62,18 L 84,18 L 96,50 L 84,82 L 62,82 L 74,50 Z" />`,
        'capsule-arrow-right': `<path d="M 24,35 L 58,35 L 58,18 L 92,50 L 58,82 L 58,65 L 24,65 A 15 15 0 0 1 24 35 Z" />`,
        'chamfered-right': `<polygon points="8,42 16,35 58,35 58,18 92,50 58,82 58,65 16,65 8,58" />`,
        'reverse-tapered-right': `<polygon points="10,24 58,38 58,18 92,50 58,82 58,62 10,76" />`,
        'forked-arrow-right': `<path d="M 8,44 L 44,44 L 62,26 L 62,14 L 92,30 L 62,46 L 62,34 L 48,50 L 62,66 L 62,54 L 92,70 L 62,86 L 62,74 L 44,56 L 8,56 Z" />`,
        'merged-arrow-right': `<path d="M 8,18 L 44,18 L 62,40 L 62,20 L 92,50 L 62,80 L 62,60 L 44,82 L 8,82 L 8,70 L 38,54 L 38,46 L 8,30 Z" />`,
        'loopback-arrow-right': `<path d="M 10,22 L 64,22 C 78,22 78,78 64,78 L 40,78 L 40,90 L 16,72 L 40,54 L 40,66 L 64,66 C 70,66 70,34 64,34 L 10,34 Z" />`,
        'pennant-arrow-right': `<polygon points="10,32 24,50 10,68 58,68 58,82 92,50 58,18 58,32" />`,
        'milestone-arrow-right': `<polygon points="10,36 30,36 32,28 34,36 50,36 52,28 54,36 60,36 60,18 92,50 60,82 60,64 54,64 52,72 50,64 34,64 32,72 30,64 10,64" />`,
        'target-arrow-right': `<g><circle cx="24" cy="50" r="16" /><circle cx="24" cy="50" r="8" fill="var(--ui-theme-dark)" /><polygon points="24,44 60,44 60,20 92,50 60,80 60,56 24,56" /></g>`,
        'corner-arrow-right': `<polygon points="12,12 32,12 32,58 64,58 64,44 92,68 64,92 64,78 12,78" />`,
        'hex-stem-right': `<polygon points="8,50 18,36 60,36 60,18 92,50 60,82 60,64 18,64" />`,

        // --- 6. Modern & Aerodynamic (14) ---
        'swept-wing-right': `<polygon points="8,40 56,40 44,18 92,50 44,82 56,60 8,60" />`,
        'dart-arrow-right': `<polygon points="8,48 44,48 58,16 92,50 58,84 44,52 8,52" />`,
        'split-stem-right': `<polygon points="8,32 58,32 58,16 92,50 58,84 58,68 8,68 8,58 50,58 50,42 8,42" />`,
        'angled-cut-right': `<polygon points="22,18 60,18 92,50 60,82 8,82 40,50" />`,
        'spearhead-right': `<polygon points="8,48 52,48 68,20 92,50 68,80 52,52 8,52" />`,
        'conical-arrow-right': `<path d="M 8,36 L 56,36 C 72,36 84,44 92,50 C 84,56 72,64 56,64 L 8,64 Z" />`,
        'offset-notch-right': `<polygon points="8,46 16,36 60,36 60,18 92,50 60,82 60,64 8,64" />`,
        'chevron-notch-right': `<polygon points="8,16 58,16 92,50 58,84 8,84 26,50" />`,
        'flared-wing-right': `<path d="M 8,46 L 56,46 Q 72,16 92,50 Q 72,84 56,54 L 8,54 Z" />`,
        'incline-arrow-up-right': `<polygon points="12,88 28,88 74,42 74,26 90,26 90,74 74,74 74,58 28,104" />`,
        'segmented-arrow-right': `<path d="M 8,38 L 32,38 L 32,62 L 8,62 Z M 38,38 L 62,38 L 62,18 L 92,50 L 62,82 L 62,62 L 38,62 Z" />`,
        'dual-barb-right': `<polygon points="8,40 50,40 42,26 60,50 42,74 50,60 62,40 62,20 92,50 62,80 62,60 8,60" />`,
        'delta-wing-right': `<polygon points="8,30 36,40 60,40 60,18 92,50 60,82 60,60 36,60 8,70" />`,
        'razor-arrow-right': `<polygon points="8,44 56,44 48,14 92,50 48,86 56,56 8,56" />`,

        // --- 7. Hollow & Technical (14) ---
        'hollow-block-right': `<polygon points="10,35 55,35 55,18 90,50 55,82 55,65 10,65" fill="none" stroke="var(--ui-theme-color)" stroke-width="4" />`,
        'hollow-block-left': `<polygon points="90,35 45,35 45,18 10,50 45,82 45,65 90,65" fill="none" stroke="var(--ui-theme-color)" stroke-width="4" />`,
        'hollow-block-up': `<polygon points="35,90 35,45 18,45 50,10 82,45 65,45 65,90" fill="none" stroke="var(--ui-theme-color)" stroke-width="4" />`,
        'hollow-block-down': `<polygon points="35,10 35,55 18,55 50,90 82,55 65,55 65,10" fill="none" stroke="var(--ui-theme-color)" stroke-width="4" />`,
        'hollow-double-right-left': `<polygon points="10,50 35,20 35,38 65,38 65,20 90,50 65,80 65,62 35,62 35,80" fill="none" stroke="var(--ui-theme-color)" stroke-width="4" />`,
        'hollow-chevron-right': `<polygon points="10,18 55,18 90,50 55,82 10,82 45,50" fill="none" stroke="var(--ui-theme-color)" stroke-width="4" />`,
        'hollow-chevron-left': `<polygon points="90,18 45,18 10,50 45,82 90,82 55,50" fill="none" stroke="var(--ui-theme-color)" stroke-width="4" />`,
        'open-barb-right': `<g stroke="var(--ui-theme-color)" stroke-width="4" fill="none"><line x1="10" y1="50" x2="88" y2="50" /><polyline points="62,24 88,50 62,76" /></g>`,
        'open-barb-left': `<g stroke="var(--ui-theme-color)" stroke-width="4" fill="none"><line x1="88" y1="50" x2="12" y2="50" /><polyline points="38,24 12,50 38,76" /></g>`,
        'open-barb-double': `<g stroke="var(--ui-theme-color)" stroke-width="4" fill="none"><line x1="12" y1="50" x2="88" y2="50" /><polyline points="36,24 12,50 36,76" /><polyline points="64,24 88,50 64,76" /></g>`,
        'open-barb-up': `<g stroke="var(--ui-theme-color)" stroke-width="4" fill="none"><line x1="50" y1="88" x2="50" y2="12" /><polyline points="24,36 50,12 76,36" /></g>`,
        'open-barb-down': `<g stroke="var(--ui-theme-color)" stroke-width="4" fill="none"><line x1="50" y1="12" x2="50" y2="88" /><polyline points="24,64 50,88 76,64" /></g>`,
        'dimension-arrow': `<g stroke="var(--ui-theme-color)" stroke-width="3" fill="none"><line x1="12" y1="20" x2="12" y2="80" /><line x1="12" y1="50" x2="88" y2="50" /><line x1="88" y1="20" x2="88" y2="80" /><polyline points="32,36 12,50 32,64" /><polyline points="68,36 88,50 68,64" /></g>`,
        'dimension-dual-right': `<g stroke="var(--ui-theme-color)" stroke-width="3" fill="none"><line x1="10" y1="15" x2="10" y2="85" /><line x1="10" y1="50" x2="90" y2="50" /><line x1="90" y1="15" x2="90" y2="85" /><polyline points="30,30 10,50 30,70" /><polyline points="70,30 90,50 70,70" /></g>`
    };

    /**
     * Inserts a Smart Arrow element into the active canvas.
     */
    function insertSmartArrow(styleId) {
        if (!styleId) styleId = 'block-right';

        const isVertical = (styleId.includes('up') || styleId.includes('down')) && !styleId.includes('left') && !styleId.includes('right');
        const isQuad = styleId === 'quad-arrow';

        let initW = 220;
        let initH = 55;

        // Specialized aspect ratios for vertical, quad, diagonal, or branched arrows
        if (styleId.includes('up-down') || isVertical) {
            initW = 55;
            initH = 220;
        } else if (isQuad) {
            initW = 160;
            initH = 160;
        } else if (styleId.includes('curved-') || styleId.includes('u-turn-') || styleId.includes('diagonal-')) {
            initW = 160;
            initH = 160;
        } else if (styleId.includes('forked-') || styleId.includes('merged-') || styleId.includes('corner-')) {
            initW = 220;
            initH = 90;
        }

        // Palette-responsive initial styling
        const insFill = (window.colorSchemes && window.state && window.colorSchemes[window.state.currentScheme])
            ? window.colorSchemes[window.state.currentScheme][3]
            : 'var(--ui-theme-color)';
        const insStroke = (window.colorSchemes && window.state && window.colorSchemes[window.state.currentScheme])
            ? window.colorSchemes[window.state.currentScheme][0]
            : 'var(--ui-theme-dark)';

        const pathData = buildArrowPath(styleId, initW, initH, null);
        const isHollow = pathData.isStrokeOnly || styleId.startsWith('hollow-');
        const isOpenBarb = pathData.isStrokeOnly || styleId.startsWith('open-barb-') || styleId === 'dimension-arrow' || styleId === 'dimension-dual-right' || styleId === 'hairline-arrow';

        const effectiveFill = isHollow ? 'none' : insFill;
        const effectiveStroke = isOpenBarb ? insFill : insStroke;
        const effectiveStrokeWidth = isOpenBarb ? 3 : (isHollow ? 3 : 2);

        const svgString = `
            <svg class="smart-arrow-svg" data-arrow-style="${styleId}" data-arrow-head="${pathData.headLength || 36}" data-arrow-head-px="${pathData.headLength || 36}" data-arrow-head-length="${pathData.headLength || 36}" data-arrow-stroke-width="${effectiveStrokeWidth}" viewBox="0 0 ${initW} ${initH}" style="width:100%; height:100%; overflow:visible; position:absolute; top:0; left:0;" preserveAspectRatio="none">
                <path class="shape-path smart-arrow-path" d="${pathData.d}" fill="${effectiveFill}" stroke="${effectiveStroke}" stroke-width="${effectiveStrokeWidth}" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
        `.trim();

        let el;
        if (typeof window.createWrapper === 'function') {
            el = window.createWrapper(svgString);
        } else {
            const paper = document.getElementById('paper') || document.body;
            el = document.createElement('div');
            el.className = 'pub-element';
            el.innerHTML = `
                <div class="element-content">${svgString}</div>
                <div class="resize-handle rh-nw" data-dir="nw"></div>
                <div class="resize-handle rh-n" data-dir="n"></div>
                <div class="resize-handle rh-ne" data-dir="ne"></div>
                <div class="resize-handle rh-e" data-dir="e"></div>
                <div class="resize-handle rh-se" data-dir="se"></div>
                <div class="resize-handle rh-s" data-dir="s"></div>
                <div class="resize-handle rh-sw" data-dir="sw"></div>
                <div class="resize-handle rh-w" data-dir="w"></div>
                <div class="rotate-stick"></div>
                <div class="rotate-handle"></div>
            `;
            paper.appendChild(el);
        }

        el.setAttribute('data-type', 'smart-arrow');
        el.setAttribute('data-arrow-style', styleId);
        el.setAttribute('data-arrow-head', String(pathData.headLength || 36));
        el.setAttribute('data-arrow-head-px', String(pathData.headLength || 36));
        el.setAttribute('data-arrow-head-length', String(pathData.headLength || 36));
        const dim = isVertical ? initW : initH;
        el.setAttribute('data-arrow-head-ratio', String((pathData.headLength / Math.max(1, dim)).toFixed(3)));
        el.setAttribute('data-scheme-fill', isHollow ? 'none' : '3');
        el.setAttribute('data-scheme-stroke', isOpenBarb ? '3' : '0');
        el.setAttribute('data-arrow-stroke-width', String(effectiveStrokeWidth));
        el.style.width = initW + 'px';
        el.style.height = initH + 'px';

        const paper = document.getElementById('paper');
        if (paper) {
            const pw = parseFloat(paper.style.width) || 794;
            const ph = parseFloat(paper.style.height) || 1123;
            el.style.left = Math.max(20, Math.round((pw - initW) / 2)) + 'px';
            el.style.top = Math.max(20, Math.round((ph - initH) / 3)) + 'px';
        }

        if (typeof window.applySingleElementScheme === 'function' && window.state && window.state.currentScheme) {
            window.applySingleElementScheme(el, window.state.currentScheme);
        }

        if (typeof window.selectElement === 'function') {
            window.selectElement(el);
        }

        if (typeof window.updateSelectionObserver === 'function') {
            window.updateSelectionObserver();
        } else if (typeof window.renderSelectionOverlays === 'function') {
            window.renderSelectionOverlays();
        }

        if (typeof window.ContextRibbonSystem !== 'undefined' && typeof window.ContextRibbonSystem.updateTabs === 'function') {
            window.ContextRibbonSystem.updateTabs(el);
        }

        if (typeof window.pushHistory === 'function') {
            window.pushHistory();
        }

        return el;
    }

    /**
     * Compute tip handle position and inner selection sub-boxes for active editing.
     */
    function getArrowTipInfo(el) {
        if (!el) return null;
        const styleId = el.getAttribute('data-arrow-style') || 'block-right';
        const w = Math.round(parseFloat(el.style.width)) || el.offsetWidth || 100;
        const h = Math.round(parseFloat(el.style.height)) || el.offsetHeight || 50;

        let headLength = parseFloat(el.getAttribute('data-arrow-head-length')) || parseFloat(el.getAttribute('data-arrow-head-px')) || parseFloat(el.getAttribute('data-arrow-head'));
        if (!headLength || isNaN(headLength)) {
            const pathInfo = buildArrowPath(styleId, w, h, null);
            headLength = pathInfo.headLength;
        }

        const isDoubleH = styleId.includes('left-right') || styleId.includes('double-right-left') || styleId === 'open-barb-double' || styleId === 'dimension-arrow' || styleId === 'dimension-dual-right';
        const isDoubleV = styleId.includes('up-down');
        const isQuad = styleId === 'quad-arrow';
        const isLeft = (styleId.includes('left') || styleId.endsWith('-left')) && !styleId.includes('right');
        const isUp = (styleId.includes('up') || styleId.endsWith('-up')) && !styleId.includes('down') && !styleId.includes('right');
        const isDown = styleId.includes('down') && !styleId.includes('up') && !styleId.includes('right');

        let minHead = 8;
        let maxHead = Math.max(16, w - 10);
        let orientation = 'right';
        let subBoxes = [];
        let handles = [];

        if (isDoubleH) {
            orientation = 'double-h';
            maxHead = Math.max(12, Math.floor((w - 16) / 2));
            headLength = Math.min(headLength, maxHead);
            subBoxes = [
                { left: 0, top: 0, width: headLength, height: h, label: 'Tip' },
                { left: Math.max(0, w - headLength), top: 0, width: headLength, height: h, label: 'Tip' }
            ];
            handles = [
                { x: headLength, y: Math.round(h / 2), dir: 'double-h-left', cursor: 'ew-resize' },
                { x: w - headLength, y: Math.round(h / 2), dir: 'double-h-right', cursor: 'ew-resize' }
            ];
        } else if (isDoubleV) {
            orientation = 'double-v';
            maxHead = Math.max(12, Math.floor((h - 16) / 2));
            headLength = Math.min(headLength, maxHead);
            subBoxes = [
                { left: 0, top: 0, width: w, height: headLength, label: 'Tip' },
                { left: 0, top: Math.max(0, h - headLength), width: w, height: headLength, label: 'Tip' }
            ];
            handles = [
                { x: Math.round(w / 2), y: headLength, dir: 'double-v-top', cursor: 'ns-resize' },
                { x: Math.round(w / 2), y: h - headLength, dir: 'double-v-bottom', cursor: 'ns-resize' }
            ];
        } else if (isQuad) {
            orientation = 'quad';
            const minDim = Math.min(w, h);
            maxHead = Math.max(10, Math.floor((minDim - 16) / 2));
            headLength = Math.min(headLength, maxHead);
            subBoxes = [
                { left: Math.max(0, w - headLength), top: 0, width: headLength, height: h, label: 'Tip' }
            ];
            handles = [
                { x: w - headLength, y: Math.round(h / 2), dir: 'right', cursor: 'ew-resize' }
            ];
        } else if (isLeft) {
            orientation = 'left';
            maxHead = Math.max(14, w - 10);
            headLength = Math.min(headLength, maxHead);
            subBoxes = [
                { left: 0, top: 0, width: headLength, height: h, label: 'Tip' }
            ];
            handles = [
                { x: headLength, y: Math.round(h / 2), dir: 'left', cursor: 'ew-resize' }
            ];
        } else if (isUp) {
            orientation = 'up';
            maxHead = Math.max(14, h - 10);
            headLength = Math.min(headLength, maxHead);
            subBoxes = [
                { left: 0, top: 0, width: w, height: headLength, label: 'Tip' }
            ];
            handles = [
                { x: Math.round(w / 2), y: headLength, dir: 'up', cursor: 'ns-resize' }
            ];
        } else if (isDown) {
            orientation = 'down';
            maxHead = Math.max(14, h - 10);
            headLength = Math.min(headLength, maxHead);
            subBoxes = [
                { left: 0, top: Math.max(0, h - headLength), width: w, height: headLength, label: 'Tip' }
            ];
            handles = [
                { x: Math.round(w / 2), y: h - headLength, dir: 'down', cursor: 'ns-resize' }
            ];
        } else {
            // Standard right-pointing arrow
            orientation = 'right';
            maxHead = Math.max(14, w - 10);
            headLength = Math.min(headLength, maxHead);
            subBoxes = [
                { left: Math.max(0, w - headLength), top: 0, width: headLength, height: h, label: 'Tip' }
            ];
            handles = [
                { x: w - headLength, y: Math.round(h / 2), dir: 'right', cursor: 'ew-resize' }
            ];
        }

        return {
            headLength,
            minHead,
            maxHead,
            orientation,
            subBoxes,
            handles
        };
    }

    /**
     * Refreshes the SVG path geometry of a Smart Arrow when resized or tip adjusted.
     */
    function refreshSmartArrow(el, customW, customH, customHead) {
        if (!el || el.getAttribute('data-type') !== 'smart-arrow') return;
        const styleId = el.getAttribute('data-arrow-style') || 'block-right';
        const w = (customW !== undefined && customW !== null) ? Math.round(customW) : (Math.round(parseFloat(el.style.width)) || el.offsetWidth || 100);
        const h = (customH !== undefined && customH !== null) ? Math.round(customH) : (Math.round(parseFloat(el.style.height)) || el.offsetHeight || 50);

        let head = customHead;
        if (head === undefined || head === null) {
            const attrHead = el.getAttribute('data-arrow-head-length') || el.getAttribute('data-arrow-head-px') || el.getAttribute('data-arrow-head');
            head = attrHead ? parseFloat(attrHead) : null;
        }

        const arrowInfo = buildArrowPath(styleId, w, h, head);
        el.setAttribute('data-arrow-head', String(arrowInfo.headLength));
        el.setAttribute('data-arrow-head-px', String(arrowInfo.headLength));
        el.setAttribute('data-arrow-head-length', String(arrowInfo.headLength));

        const isVertical = (styleId.includes('up') || styleId.includes('down')) && !styleId.includes('left') && !styleId.includes('right');
        const dim = isVertical ? w : h;
        el.setAttribute('data-arrow-head-ratio', String((arrowInfo.headLength / Math.max(1, dim)).toFixed(3)));

        const path = el.querySelector('path.smart-arrow-path') || el.querySelector('path');
        if (path) {
            path.setAttribute('d', arrowInfo.d);
        }

        const svg = el.querySelector('svg.smart-arrow-svg') || el.querySelector('svg');
        if (svg) {
            svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
            svg.setAttribute('data-arrow-style', styleId);
            svg.setAttribute('data-arrow-head', String(arrowInfo.headLength));
            svg.setAttribute('data-arrow-head-px', String(arrowInfo.headLength));
            svg.setAttribute('data-arrow-head-length', String(arrowInfo.headLength));
            if (el.hasAttribute('data-arrow-stroke-width')) {
                svg.setAttribute('data-arrow-stroke-width', el.getAttribute('data-arrow-stroke-width'));
            }
        }

        // Keep quick pill slider in sync if selected
        const tipInputs = document.querySelectorAll('.arrow-tip-range-input');
        const tipVals = document.querySelectorAll('.arrow-tip-range-val');
        tipInputs.forEach(ti => { ti.value = arrowInfo.headLength; });
        tipVals.forEach(tv => { tv.innerText = arrowInfo.headLength + 'px'; });
    }

    /**
     * Refresh all smart arrows across the document.
     */
    function refreshAllSmartArrows() {
        document.querySelectorAll('[data-type="smart-arrow"]').forEach(el => refreshSmartArrow(el));
    }

    /**
     * High-resolution serialization for physical print engine and PDF exports.
     * Guarantees 0-bleed clipping for thick outlines and curved corner caps.
     */
    function bakeSmartArrowForPrint(targetEl, scaleFactor = 4.0) {
        if (!targetEl) return null;
        if (!scaleFactor || isNaN(scaleFactor)) scaleFactor = 4.0;

        // Fast-path: already baked
        if (targetEl.classList && targetEl.classList.contains('smart-arrow-baked-img')) {
            return targetEl;
        }
        if (targetEl.querySelector) {
            const existingImg = targetEl.querySelector('img.smart-arrow-baked-img');
            if (existingImg) return existingImg;
        }

        let arrowWrapper = null;
        let contentDiv = null;
        let svg = null;

        if (targetEl.tagName && targetEl.tagName.toLowerCase() === 'svg') {
            svg = targetEl;
            contentDiv = svg.closest('.element-content') || svg.parentElement;
            arrowWrapper = svg.closest('[data-type="smart-arrow"]') || svg.closest('.pub-element') || (contentDiv ? (contentDiv.closest('[data-type="smart-arrow"]') || contentDiv.closest('.pub-element') || contentDiv.parentElement) : null);
        } else if (targetEl.classList && targetEl.classList.contains('element-content')) {
            contentDiv = targetEl;
            svg = contentDiv.querySelector('svg.smart-arrow-svg') || contentDiv.querySelector('svg');
            arrowWrapper = contentDiv.closest('[data-type="smart-arrow"]') || contentDiv.closest('.pub-element') || contentDiv.parentElement;
        } else {
            arrowWrapper = targetEl.closest('[data-type="smart-arrow"]') || targetEl.closest('.pub-element') || targetEl;
            contentDiv = arrowWrapper.querySelector('.element-content') || arrowWrapper;
            svg = arrowWrapper.querySelector('svg.smart-arrow-svg') || arrowWrapper.querySelector('svg');
        }

        if (!svg) return null;

        // Resolve arrow style
        const styleId = (arrowWrapper && arrowWrapper.getAttribute('data-arrow-style')) ||
                        svg.getAttribute('data-arrow-style') ||
                        (contentDiv && contentDiv.getAttribute('data-arrow-style')) || 'block-right';

        // Resolve true vector dimensions from viewBox first
        let w = 0, h = 0;
        if (svg.getAttribute('viewBox')) {
            const vb = svg.getAttribute('viewBox').trim().split(/[\s,]+/);
            if (vb.length >= 4) {
                w = parseFloat(vb[2]);
                h = parseFloat(vb[3]);
            }
        }
        if (!w || !h || isNaN(w) || isNaN(h)) {
            if (arrowWrapper && arrowWrapper.style && arrowWrapper.style.width && arrowWrapper.style.height) {
                w = parseFloat(arrowWrapper.style.width);
                h = parseFloat(arrowWrapper.style.height);
            }
        }
        if (!w || !h || isNaN(w) || isNaN(h)) {
            if (contentDiv && contentDiv.style && contentDiv.style.width && contentDiv.style.height) {
                w = parseFloat(contentDiv.style.width);
                h = parseFloat(contentDiv.style.height);
            }
        }
        if (!w || !h || isNaN(w) || isNaN(h)) {
            w = arrowWrapper ? (arrowWrapper.offsetWidth || 220) : 220;
            h = arrowWrapper ? (arrowWrapper.offsetHeight || 55) : 55;
        }

        // Resolve head length
        let headLength = parseFloat(arrowWrapper?.getAttribute('data-arrow-head-length')) ||
                         parseFloat(arrowWrapper?.getAttribute('data-arrow-head-px')) ||
                         parseFloat(arrowWrapper?.getAttribute('data-arrow-head')) ||
                         parseFloat(svg.getAttribute('data-arrow-head-length')) ||
                         parseFloat(svg.getAttribute('data-arrow-head-px')) ||
                         parseFloat(svg.getAttribute('data-arrow-head')) ||
                         parseFloat(contentDiv?.getAttribute('data-arrow-head-length')) ||
                         parseFloat(contentDiv?.getAttribute('data-arrow-head-px')) ||
                         parseFloat(contentDiv?.getAttribute('data-arrow-head')) || null;

        const pathInfo = buildArrowPath(styleId, w, h, headLength);
        const path = svg.querySelector('path.smart-arrow-path') || svg.querySelector('path');

        let fill = path ? path.getAttribute('fill') : 'var(--ui-theme-color)';
        let stroke = path ? path.getAttribute('stroke') : 'var(--ui-theme-dark)';
        const attrStrokeWidth = path ? path.getAttribute('stroke-width') : (arrowWrapper?.getAttribute('data-arrow-stroke-width') || svg.getAttribute('data-arrow-stroke-width') || 2);
        let strokeWidth = attrStrokeWidth !== null && attrStrokeWidth !== undefined ? parseFloat(attrStrokeWidth) : 2;
        if (isNaN(strokeWidth) || strokeWidth < 0) strokeWidth = 0;

        // Resolve theme variables safely
        const doc = arrowWrapper?.ownerDocument || document;
        const win = doc.defaultView || window;
        let computed = null;
        try {
            computed = win.getComputedStyle(arrowWrapper || svg);
        } catch (e) {}

        if (fill && fill.includes('var(')) {
            let val = computed ? computed.getPropertyValue('--ui-theme-color').trim() : '';
            if (val && !val.includes('var(')) {
                fill = val;
            } else if (win.colorSchemes && win.state && win.colorSchemes[win.state.currentScheme]) {
                fill = win.colorSchemes[win.state.currentScheme][3] || '#008080';
            } else {
                fill = '#008080';
            }
        }
        if (stroke && stroke.includes('var(')) {
            let val = computed ? computed.getPropertyValue('--ui-theme-dark').trim() : '';
            if (val && !val.includes('var(')) {
                stroke = val;
            } else if (win.colorSchemes && win.state && win.colorSchemes[win.state.currentScheme]) {
                stroke = win.colorSchemes[win.state.currentScheme][0] || '#004d40';
            } else {
                stroke = '#004d40';
            }
        }

        const isHollow = pathInfo.isStrokeOnly || styleId.startsWith('hollow-');
        const isStrokeOnly = pathInfo.isStrokeOnly || styleId.startsWith('open-barb-') || styleId === 'dimension-arrow' || styleId === 'dimension-dual-right' || styleId === 'hairline-arrow';
        const hasStroke = stroke && stroke !== 'none' && stroke !== 'transparent' && strokeWidth > 0;
        const pad = hasStroke ? Math.ceil(Math.max(20, strokeWidth * 1.5 + 4)) : 0;

        const targetW = Math.max(16, Math.round((w + pad * 2) * scaleFactor));
        const targetH = Math.max(16, Math.round((h + pad * 2) * scaleFactor));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.scale(scaleFactor, scaleFactor);
        if (pad > 0) ctx.translate(pad, pad);

        const capAttr = (path && path.getAttribute('stroke-linecap')) || 'round';
        const joinAttr = (path && path.getAttribute('stroke-linejoin')) || 'round';

        try {
            const p = new Path2D(pathInfo.d);
            if (!isStrokeOnly && !isHollow && fill && fill !== 'none' && fill !== 'transparent') {
                ctx.fillStyle = fill;
                ctx.fill(p);
            }
            if (hasStroke) {
                ctx.strokeStyle = stroke;
                ctx.lineWidth = strokeWidth;
                ctx.lineCap = capAttr;
                ctx.lineJoin = joinAttr;
                ctx.stroke(p);
            }
        } catch (e) {
            console.error('[Smart Arrows] Error drawing Path2D in bakeSmartArrowForPrint:', e);
        }

        const pngUrl = canvas.toDataURL('image/png');

        const img = document.createElement('img');
        img.className = 'smart-arrow-baked-img';
        img.src = pngUrl;
        img.alt = 'Smart Arrow';
        img.setAttribute('data-arrow-style', styleId);
        img.style.cssText = `position: absolute !important; top: -${pad}px !important; left: -${pad}px !important; width: ${w + pad * 2}px !important; height: ${h + pad * 2}px !important; max-width: none !important; max-height: none !important; object-fit: fill !important; display: block !important; pointer-events: none !important;`;

        if (arrowWrapper) arrowWrapper.style.overflow = 'visible';
        if (contentDiv) {
            contentDiv.style.overflow = 'visible';
            if (contentDiv.parentElement) contentDiv.parentElement.style.overflow = 'visible';
        }

        // Replace the SVG node with the baked image
        if (svg && svg.parentNode) {
            svg.parentNode.replaceChild(img, svg);
        } else if (contentDiv) {
            contentDiv.innerHTML = '';
            contentDiv.appendChild(img);
        }

        return img;
    }

    /**
     * Show / Hide the Smart Arrows Dropdown Gallery.
     */
    function toggleArrowMenu(btn) {
        const dropdown = document.getElementById('arrow-dropdown');
        if (!dropdown) return;

        if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
            return;
        }

        const rect = btn.getBoundingClientRect();
        dropdown.style.left = rect.left + 'px';
        dropdown.style.top = (rect.bottom + 4) + 'px';
        dropdown.style.display = 'block';

        const closeHandler = (e) => {
            if (!dropdown.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
                dropdown.style.display = 'none';
                document.removeEventListener('click', closeHandler);
            }
        };
        setTimeout(() => document.addEventListener('click', closeHandler), 10);
    }

    /**
     * Initialize Smart Arrow Dropdown Gallery UI with 7-column layout.
     */
    function initArrows() {
        console.log('🏹 Initializing Smart Arrows Engine (v5.4.0 - 98 Authentic Styles)...');
        const dropdown = document.getElementById('arrow-dropdown');
        if (!dropdown) return;

        dropdown.innerHTML = '';
        dropdown.style.width = '380px';
        dropdown.style.maxHeight = '480px';
        dropdown.style.overflowY = 'auto';
        dropdown.style.padding = '0';
        dropdown.style.scrollbarWidth = 'thin';
        dropdown.style.border = '1px solid var(--ui-theme-color)';
        dropdown.style.borderRadius = '6px';
        dropdown.style.boxShadow = '0 4px 12px color-mix(in srgb, var(--ui-theme-color) 15%, transparent)';

        Object.keys(ARROW_CATALOG).forEach(categoryName => {
            const header = document.createElement('div');
            header.className = 'dropdown-category-header';
            header.innerText = categoryName;
            dropdown.appendChild(header);

            const grid = document.createElement('div');
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
            grid.style.gap = '4px';
            grid.style.padding = '8px';
            dropdown.appendChild(grid);

            ARROW_CATALOG[categoryName].forEach(arrow => {
                const item = document.createElement('div');
                item.className = 'shape-dropdown-item arrow-dropdown-item';
                item.title = `${arrow.name} - ${arrow.desc}`;

                const previewMarkup = ARROW_PREVIEWS[arrow.id] || `<polygon points="10,35 55,35 55,18 90,50 55,82 55,65 10,65" />`;
                const isHollowOrTechnical = arrow.id.startsWith('hollow-') || arrow.id.startsWith('open-barb-') || arrow.id === 'dimension-arrow' || arrow.id === 'dimension-dual-right' || arrow.id === 'hairline-arrow';

                let svgContent = '';
                if (isHollowOrTechnical) {
                    svgContent = `<svg class="shape-preview-vector" viewBox="0 0 100 100" style="width:100%; height:100%; overflow:visible;">${previewMarkup}</svg>`;
                } else {
                    svgContent = `<svg class="shape-preview-vector" viewBox="0 0 100 100" style="width:100%; height:100%; overflow:visible;"><g fill="var(--ui-theme-color)" stroke="var(--ui-theme-dark)" stroke-width="2">${previewMarkup}</g></svg>`;
                }

                item.innerHTML = svgContent;

                item.onclick = (e) => {
                    e.stopPropagation();
                    insertSmartArrow(arrow.id);
                    dropdown.style.display = 'none';
                };

                grid.appendChild(item);
            });
        });

        console.log(`✅ Loaded ${Object.values(ARROW_CATALOG).reduce((sum, cat) => sum + cat.length, 0)} Authentic Smart Arrows successfully.`);
    }

    /**
     * Manually set Fill or Outline (Stroke) color on a Smart Arrow element.
     */
    function setSmartArrowColor(arrowEl, type, color) {
        if (!arrowEl) return;
        const svg = arrowEl.querySelector('svg.smart-arrow-svg') || arrowEl.querySelector('svg');
        const path = arrowEl.querySelector('path.smart-arrow-path') || (svg ? svg.querySelector('path') : null);
        if (!path) return;

        if (type === 'fill') {
            if (!color || color === 'none' || color === 'transparent') {
                path.setAttribute('fill', 'none');
                arrowEl.setAttribute('data-custom-fill', 'none');
                arrowEl.setAttribute('data-scheme-fill', 'none');
            } else {
                path.setAttribute('fill', color);
                arrowEl.setAttribute('data-custom-fill', color);
                arrowEl.removeAttribute('data-scheme-fill');
            }
        } else if (type === 'stroke') {
            if (!color || color === 'none' || color === 'transparent') {
                path.setAttribute('stroke', 'none');
                arrowEl.setAttribute('data-custom-stroke', 'none');
                arrowEl.setAttribute('data-scheme-stroke', 'none');
            } else {
                path.setAttribute('stroke', color);
                arrowEl.setAttribute('data-custom-stroke', color);
                arrowEl.removeAttribute('data-scheme-stroke');
                const sw = parseFloat(path.getAttribute('stroke-width')) || 0;
                if (sw <= 0) path.setAttribute('stroke-width', '2');
            }
        }
    }

    /**
     * Manually set Outline (Stroke) thickness on a Smart Arrow element.
     */
    function setSmartArrowStrokeWidth(arrowEl, width) {
        if (!arrowEl) return;
        const svg = arrowEl.querySelector('svg.smart-arrow-svg') || arrowEl.querySelector('svg');
        const path = arrowEl.querySelector('path.smart-arrow-path') || (svg ? svg.querySelector('path') : null);
        if (!path) return;

        const w = parseFloat(width) || 0;
        if (w <= 0) {
            path.setAttribute('stroke', 'none');
            path.setAttribute('stroke-width', '0');
            arrowEl.setAttribute('data-arrow-stroke-width', '0');
        } else {
            path.setAttribute('stroke-width', w);
            arrowEl.setAttribute('data-arrow-stroke-width', w);
            const curStroke = path.getAttribute('stroke');
            if (!curStroke || curStroke === 'none' || curStroke === 'transparent') {
                path.setAttribute('stroke', 'var(--ui-theme-dark)');
                arrowEl.setAttribute('data-scheme-stroke', 'ui-theme-dark');
            }
        }
    }

    // Attach to global window
    window.initArrows = initArrows;
    window.insertSmartArrow = insertSmartArrow;
    window.toggleArrowMenu = toggleArrowMenu;
    window.getArrowTipInfo = getArrowTipInfo;
    window.refreshSmartArrow = refreshSmartArrow;
    window.refreshAllSmartArrows = refreshAllSmartArrows;
    window.buildArrowPath = buildArrowPath;
    window.bakeSmartArrowForPrint = bakeSmartArrowForPrint;
    window.setSmartArrowColor = setSmartArrowColor;
    window.setSmartArrowStrokeWidth = setSmartArrowStrokeWidth;
    window.ARROW_CATALOG = ARROW_CATALOG;

})(window);
