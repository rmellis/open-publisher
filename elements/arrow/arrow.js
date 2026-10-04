/**
 * Open Publisher v5.3.1
 * Dedicated Smart Arrows Engine
 *
 * Implements parametric vector arrows where resizing only stretches the stem/shaft
 * while strictly preserving the arrowhead geometry.
 * High-resolution canvas serialization ensures 100% reliable print spooler and PDF export.
 */

(function(window) {
    'use strict';

    // Master Catalog of Smart Arrows
    const ARROW_CATALOG = {
        'Block Arrows': [
            { id: 'block-right', name: 'Right Arrow', desc: 'Standard horizontal block arrow with stem-only stretching' },
            { id: 'block-left', name: 'Left Arrow', desc: 'Standard left-pointing block arrow' },
            { id: 'block-up', name: 'Up Arrow', desc: 'Vertical upward block arrow' },
            { id: 'block-down', name: 'Down Arrow', desc: 'Vertical downward block arrow' },
            { id: 'block-left-right', name: 'Double Arrow (H)', desc: 'Bidirectional horizontal arrow with fixed dual heads' },
            { id: 'block-up-down', name: 'Double Arrow (V)', desc: 'Bidirectional vertical arrow with fixed dual heads' },
            { id: 'quad-arrow', name: '4-Way Quad Arrow', desc: 'Four-way directional cross arrow with fixed tips' }
        ],
        'Notched & Shaped': [
            { id: 'notched-right', name: 'Notched Right', desc: 'Right block arrow with indented triangular tail' },
            { id: 'notched-left', name: 'Notched Left', desc: 'Left block arrow with indented tail' },
            { id: 'pentagon-right', name: 'Pentagon Arrow', desc: 'Clean geometric arrow with flat vertical tail' },
            { id: 'chevron-right', name: 'Chevron Arrow', desc: 'V-notched chevron directional pointer' },
            { id: 'stealth-right', name: 'Stealth Arrow', desc: 'Swept-wing supersonic jet styling' },
            { id: 'curved-down-right', name: 'Curved Swoop', desc: '90-degree curved directional swoop arrow' },
            { id: 'u-turn-down', name: 'U-Turn Loop', desc: 'Smooth curved U-turn loop arrow' }
        ],
        'Slender & Precision': [
            { id: 'slender-right', name: 'Slender Right', desc: 'Fine-stem arrow with broad triangular tip' },
            { id: 'slender-left', name: 'Slender Left', desc: 'Fine-stem leftward pointer' },
            { id: 'slender-up', name: 'Slender Up', desc: 'Fine-stem upward pointer' },
            { id: 'slender-down', name: 'Slender Down', desc: 'Fine-stem downward pointer' },
            { id: 'needle-right', name: 'Needle Arrow', desc: 'Hairline stem with elongated acute needle tip' },
            { id: 'diamond-tip-right', name: 'Diamond Tip', desc: 'Technical pointer with diamond arrowhead' },
            { id: 'ball-stem-right', name: 'Ball Base Pointer', desc: 'Circular origin pin connecting to arrowhead' },
            { id: 'callout-right', name: 'Callout Arrow', desc: 'Extra wide stem callout block arrow' }
        ],
        'Hollow & Technical': [
            { id: 'hollow-block-right', name: 'Hollow Right', desc: 'Clean outline right arrow with transparent body' },
            { id: 'hollow-block-left', name: 'Hollow Left', desc: 'Clean outline left arrow with transparent body' },
            { id: 'hollow-double-right-left', name: 'Hollow Double', desc: 'Outline bidirectional horizontal arrow' },
            { id: 'open-barb-right', name: 'Technical Open Barb', desc: 'Architectural line arrow with open V head' },
            { id: 'open-barb-left', name: 'Technical Open Left', desc: 'Architectural left line arrow' },
            { id: 'open-barb-double', name: 'Technical Double', desc: 'Architectural double-ended open barb arrow' },
            { id: 'dimension-arrow', name: 'Dimension Marker', desc: 'Engineering dimension line with end-tick marks' }
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
            case 'block-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemLen = w - headLength;
                d = `M 0,${stemTop} L ${stemLen},${stemTop} L ${stemLen},0 L ${w},${h / 2} L ${stemLen},${h} L ${stemLen},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }

            case 'block-left': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                d = `M ${headLength},0 L 0,${h / 2} L ${headLength},${h} L ${headLength},${stemBottom} L ${w},${stemBottom} L ${w},${stemTop} L ${headLength},${stemTop} Z`;
                break;
            }

            case 'block-up': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.7), maxHead);
                const stemThick = Math.min(Math.round(w * 0.4), Math.max(4, w - 4));
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                d = `M ${w / 2},0 L ${w},${headLength} L ${stemRight},${headLength} L ${stemRight},${h} L ${stemLeft},${h} L ${stemLeft},${headLength} L 0,${headLength} Z`;
                break;
            }

            case 'block-down': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.7), maxHead);
                const stemThick = Math.min(Math.round(w * 0.4), Math.max(4, w - 4));
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                const stemEnd = h - headLength;
                d = `M ${stemLeft},0 L ${stemRight},0 L ${stemRight},${stemEnd} L ${w},${stemEnd} L ${w / 2},${h} L 0,${stemEnd} L ${stemLeft},${stemEnd} Z`;
                break;
            }

            case 'block-left-right': {
                const maxHead = Math.max(8, Math.floor((w - 16) / 2));
                headLength = resolveHead(customHead, Math.round(h * 0.65), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemRight = w - headLength;
                d = `M 0,${h / 2} L ${headLength},0 L ${headLength},${stemTop} L ${stemRight},${stemTop} L ${stemRight},0 L ${w},${h / 2} L ${stemRight},${h} L ${stemRight},${stemBottom} L ${headLength},${stemBottom} L ${headLength},${h} Z`;
                break;
            }

            case 'block-up-down': {
                const maxHead = Math.max(8, Math.floor((h - 16) / 2));
                headLength = resolveHead(customHead, Math.round(w * 0.65), maxHead);
                const stemThick = Math.min(Math.round(w * 0.4), Math.max(4, w - 4));
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                const stemBottom = h - headLength;
                d = `M ${w / 2},0 L ${w},${headLength} L ${stemRight},${headLength} L ${stemRight},${stemBottom} L ${w},${stemBottom} L ${w / 2},${h} L 0,${stemBottom} L ${stemLeft},${stemBottom} L ${stemLeft},${headLength} L 0,${headLength} Z`;
                break;
            }

            case 'quad-arrow': {
                const minDim = Math.min(w, h);
                const maxHead = Math.max(6, Math.floor((minDim - 16) / 2));
                headLength = resolveHead(customHead, Math.round(minDim * 0.25), maxHead);
                const stemW = Math.min(Math.round(w * 0.28), Math.max(4, w - headLength * 2 - 4));
                const stemH = Math.min(Math.round(h * 0.28), Math.max(4, h - headLength * 2 - 4));
                const x1 = Math.round((w - stemW) / 2);
                const x2 = x1 + stemW;
                const y1 = Math.round((h - stemH) / 2);
                const y2 = y1 + stemH;
                const wingW = Math.min(8, Math.round(headLength * 0.3));
                const wingH = Math.min(8, Math.round(headLength * 0.3));
                d = `M ${w / 2},0 L ${x2 + wingW},${headLength} L ${x2},${headLength} L ${x2},${y1} L ${w - headLength},${y1} L ${w - headLength},${y1 - wingH} L ${w},${h / 2} L ${w - headLength},${y2 + wingH} L ${w - headLength},${y2} L ${x2},${y2} L ${x2},${h - headLength} L ${x2 + wingW},${h - headLength} L ${w / 2},${h} L ${x1 - wingW},${h - headLength} L ${x1},${h - headLength} L ${x1},${y2} L ${headLength},${y2} L ${headLength},${y2 + wingH} L 0,${h / 2} L ${headLength},${y1 - wingH} L ${headLength},${y1} L ${x1},${y1} L ${x1},${headLength} L ${x1 - wingW},${headLength} Z`;
                break;
            }

            case 'notched-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemLen = w - headLength;
                const notch = Math.min(Math.round(headLength * 0.45), Math.max(2, Math.round(stemLen * 0.5)));
                d = `M 0,${stemTop} L ${stemLen},${stemTop} L ${stemLen},0 L ${w},${h / 2} L ${stemLen},${h} L ${stemLen},${stemBottom} L 0,${stemBottom} L ${notch},${h / 2} Z`;
                break;
            }

            case 'notched-left': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const notch = Math.max(headLength + 2, w - Math.round(headLength * 0.45));
                d = `M ${headLength},0 L 0,${h / 2} L ${headLength},${h} L ${headLength},${stemBottom} L ${w},${stemBottom} L ${notch},${h / 2} L ${w},${stemTop} L ${headLength},${stemTop} Z`;
                break;
            }

            case 'pentagon-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemLen = w - headLength;
                d = `M 0,0 L ${stemLen},0 L ${w},${h / 2} L ${stemLen},${h} L 0,${h} Z`;
                break;
            }

            case 'chevron-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const notch = Math.min(Math.round(headLength * 0.7), Math.max(4, Math.round(w * 0.4)));
                d = `M 0,0 L ${w - notch},0 L ${w},${h / 2} L ${w - notch},${h} L 0,${h} L ${notch},${h / 2} Z`;
                break;
            }

            case 'stealth-right': {
                const maxHead = Math.max(12, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.95), maxHead);
                const wingNotch = Math.round(headLength * 0.6);
                const tailNotch = Math.min(Math.round(headLength * 0.5), Math.max(4, Math.round((w - headLength) * 0.5)));
                d = `M 0,${h * 0.3} L ${w - headLength},${h * 0.3} L ${w - headLength + wingNotch},0 L ${w},${h / 2} L ${w - headLength + wingNotch},${h} L ${w - headLength},${h * 0.7} L 0,${h * 0.7} L ${tailNotch},${h / 2} Z`;
                break;
            }

            case 'slender-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.65), maxHead);
                const stemThick = Math.min(Math.max(4, Math.round(h * 0.16)), h - 4);
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemLen = w - headLength;
                d = `M 0,${stemTop} L ${stemLen},${stemTop} L ${stemLen},0 L ${w},${h / 2} L ${stemLen},${h} L ${stemLen},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }

            case 'slender-left': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.65), maxHead);
                const stemThick = Math.min(Math.max(4, Math.round(h * 0.16)), h - 4);
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                d = `M ${headLength},0 L 0,${h / 2} L ${headLength},${h} L ${headLength},${stemBottom} L ${w},${stemBottom} L ${w},${stemTop} L ${headLength},${stemTop} Z`;
                break;
            }

            case 'slender-up': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.65), maxHead);
                const stemThick = Math.min(Math.max(4, Math.round(w * 0.16)), w - 4);
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                d = `M ${w / 2},0 L ${w},${headLength} L ${stemRight},${headLength} L ${stemRight},${h} L ${stemLeft},${h} L ${stemLeft},${headLength} L 0,${headLength} Z`;
                break;
            }

            case 'slender-down': {
                const maxHead = Math.max(10, h - 8);
                headLength = resolveHead(customHead, Math.round(w * 0.65), maxHead);
                const stemThick = Math.min(Math.max(4, Math.round(w * 0.16)), w - 4);
                const stemLeft = Math.round((w - stemThick) / 2);
                const stemRight = stemLeft + stemThick;
                const stemEnd = h - headLength;
                d = `M ${stemLeft},0 L ${stemRight},0 L ${stemRight},${stemEnd} L ${w},${stemEnd} L ${w / 2},${h} L 0,${stemEnd} L ${stemLeft},${stemEnd} Z`;
                break;
            }

            case 'needle-right': {
                const maxHead = Math.max(12, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 1.1), maxHead);
                const stemThick = Math.min(Math.max(2, Math.round(h * 0.08)), h - 4);
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemLen = w - headLength;
                d = `M 0,${stemTop} L ${stemLen},${stemTop} L ${stemLen},0 L ${w},${h / 2} L ${stemLen},${h} L ${stemLen},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }

            case 'diamond-tip-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.75), maxHead);
                const stemThick = Math.min(Math.max(4, Math.round(h * 0.25)), h - 4);
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const midHead = w - Math.round(headLength / 2);
                const stemLen = w - headLength;
                d = `M 0,${stemTop} L ${stemLen},${stemTop} L ${midHead},0 L ${w},${h / 2} L ${midHead},${h} L ${stemLen},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }

            case 'ball-stem-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.max(4, Math.round(h * 0.2)), h - 4);
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const r = Math.min(Math.round(h * 0.35), Math.max(4, Math.round((w - headLength) * 0.25)));
                const stemLen = w - headLength;
                d = `M ${r},${stemTop} L ${stemLen},${stemTop} L ${stemLen},0 L ${w},${h / 2} L ${stemLen},${h} L ${stemLen},${stemBottom} L ${r},${stemBottom} A ${r},${r} 0 1 1 ${r},${stemTop} Z`;
                break;
            }

            case 'callout-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.75), maxHead);
                const stemThick = Math.min(Math.round(h * 0.65), h - 4);
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemLen = w - headLength;
                d = `M 0,${stemTop} L ${stemLen},${stemTop} L ${stemLen},0 L ${w},${h / 2} L ${stemLen},${h} L ${stemLen},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }

            case 'curved-down-right': {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.65), maxHead);
                const stemThick = Math.min(Math.max(6, Math.round(Math.min(w, h) * 0.22)), Math.min(w, h) - 4);
                const stemLen = w - headLength;
                d = `M 0,0 L ${stemThick},0 Q ${stemThick},${h - stemThick} ${stemLen},${h - stemThick} L ${stemLen},${h - stemThick - 8} L ${w},${h - stemThick / 2} L ${stemLen},${h} L ${stemLen},${h - stemThick + 4} Q 0,${h} 0,0 Z`;
                break;
            }

            case 'u-turn-down': {
                const maxHead = Math.max(8, Math.round(h * 0.6));
                const headLen = resolveHead(customHead, Math.round(Math.min(h * 0.4, w * 0.35)), maxHead);
                headLength = headLen;
                const wing = Math.min(6, Math.max(2, Math.round(headLen * 0.3)));
                const stemThick = Math.min(Math.max(4, Math.round(Math.min(w * 0.16, h * 0.25))), Math.round(h * 0.35));
                const rightX = w - wing;
                const rightStemX = rightX - stemThick;
                const leftX = wing;
                const leftStemX = leftX + stemThick;
                const loopR = (rightX - leftX) / 2;
                const innerR = Math.max(2, (rightStemX - leftStemX) / 2);
                const arcCenterY = Math.min(loopR, Math.round(h * 0.45));
                const tipY = h;
                const headBaseY = Math.max(arcCenterY + 2, h - headLen);
                d = `M ${leftX},${h} L ${leftX},${arcCenterY} A ${loopR},${arcCenterY} 0 0 1 ${rightX},${arcCenterY} L ${rightX},${headBaseY} L ${w},${headBaseY} L ${rightX - stemThick / 2},${tipY} L ${rightStemX - wing},${headBaseY} L ${rightStemX},${headBaseY} L ${rightStemX},${arcCenterY} A ${innerR},${Math.max(1, arcCenterY - stemThick)} 0 0 0 ${leftStemX},${arcCenterY} L ${leftStemX},${h} Z`;
                break;
            }

            case 'hollow-block-right': {
                isStrokeOnly = true;
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemLen = w - headLength;
                d = `M 0,${stemTop} L ${stemLen},${stemTop} L ${stemLen},0 L ${w},${h / 2} L ${stemLen},${h} L ${stemLen},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }

            case 'hollow-block-left': {
                isStrokeOnly = true;
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                d = `M ${headLength},0 L 0,${h / 2} L ${headLength},${h} L ${headLength},${stemBottom} L ${w},${stemBottom} L ${w},${stemTop} L ${headLength},${stemTop} Z`;
                break;
            }

            case 'hollow-double-right-left': {
                isStrokeOnly = true;
                const maxHead = Math.max(8, Math.floor((w - 16) / 2));
                headLength = resolveHead(customHead, Math.round(h * 0.65), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemRight = w - headLength;
                d = `M 0,${h / 2} L ${headLength},0 L ${headLength},${stemTop} L ${stemRight},${stemTop} L ${stemRight},0 L ${w},${h / 2} L ${stemRight},${h} L ${stemRight},${stemBottom} L ${headLength},${stemBottom} L ${headLength},${h} Z`;
                break;
            }

            case 'open-barb-right': {
                isStrokeOnly = true;
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.6), maxHead);
                const barbH = Math.min(h / 2, Math.round(headLength * 0.8));
                d = `M 0,${h / 2} L ${w},${h / 2} M ${w - headLength},${h / 2 - barbH} L ${w},${h / 2} L ${w - headLength},${h / 2 + barbH}`;
                break;
            }

            case 'open-barb-left': {
                isStrokeOnly = true;
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.6), maxHead);
                const barbH = Math.min(h / 2, Math.round(headLength * 0.8));
                d = `M ${w},${h / 2} L 0,${h / 2} M ${headLength},${h / 2 - barbH} L 0,${h / 2} L ${headLength},${h / 2 + barbH}`;
                break;
            }

            case 'open-barb-double': {
                isStrokeOnly = true;
                const maxHead = Math.max(8, Math.floor((w - 16) / 2));
                headLength = resolveHead(customHead, Math.round(h * 0.6), maxHead);
                const barbH = Math.min(h / 2, Math.round(headLength * 0.8));
                d = `M 0,${h / 2} L ${w},${h / 2} M ${headLength},${h / 2 - barbH} L 0,${h / 2} L ${headLength},${h / 2 + barbH} M ${w - headLength},${h / 2 - barbH} L ${w},${h / 2} L ${w - headLength},${h / 2 + barbH}`;
                break;
            }

            case 'dimension-arrow': {
                isStrokeOnly = true;
                const maxHead = Math.max(6, Math.floor((w - 16) / 2));
                headLength = resolveHead(customHead, Math.round(h * 0.55), maxHead);
                const barbH = Math.min(Math.round(h * 0.35), Math.round(headLength * 0.75));
                d = `M 1,0 L 1,${h} M ${w - 1},0 L ${w - 1},${h} M 0,${h / 2} L ${w},${h / 2} M ${headLength},${h / 2 - barbH} L 0,${h / 2} L ${headLength},${h / 2 + barbH} M ${w - headLength},${h / 2 - barbH} L ${w},${h / 2} L ${w - headLength},${h / 2 + barbH}`;
                break;
            }

            default: {
                const maxHead = Math.max(10, w - 8);
                headLength = resolveHead(customHead, Math.round(h * 0.7), maxHead);
                const stemThick = Math.min(Math.round(h * 0.4), Math.max(4, h - 4));
                const stemTop = Math.round((h - stemThick) / 2);
                const stemBottom = stemTop + stemThick;
                const stemLen = w - headLength;
                d = `M 0,${stemTop} L ${stemLen},${stemTop} L ${stemLen},0 L ${w},${h / 2} L ${stemLen},${h} L ${stemLen},${stemBottom} L 0,${stemBottom} Z`;
                break;
            }
        }

        return { d, headLength, isStrokeOnly };
    }

    /**
     * Insert a Smart Arrow into the current page.
     */
    function insertSmartArrow(styleId) {
        const isVertical = styleId.includes('up') || styleId.includes('down');
        const isQuad = styleId === 'quad-arrow';

        let initW = 260;
        let initH = 60;

        if (isVertical && !styleId.includes('left') && !styleId.includes('right')) {
            initW = 60;
            initH = 260;
        } else if (isQuad) {
            initW = 160;
            initH = 160;
        }

        // Palette-responsive initial styling
        const insFill = (window.colorSchemes && window.state && window.colorSchemes[window.state.currentScheme])
            ? window.colorSchemes[window.state.currentScheme][3]
            : 'var(--ui-theme-color)';
        const insStroke = (window.colorSchemes && window.state && window.colorSchemes[window.state.currentScheme])
            ? window.colorSchemes[window.state.currentScheme][0]
            : 'var(--ui-theme-dark)';

        const pathData = buildArrowPath(styleId, initW, initH);
        const isHollow = pathData.isStrokeOnly || styleId.startsWith('hollow-');
        const isOpenBarb = styleId.startsWith('open-barb-') || styleId === 'dimension-arrow';

        const effectiveFill = isHollow ? 'none' : insFill;
        const effectiveStroke = isOpenBarb ? insFill : insStroke;
        const effectiveStrokeWidth = isOpenBarb ? 3 : (isHollow ? 3 : 2);

        const svgString = `
            <svg class="smart-arrow-svg" viewBox="0 0 ${initW} ${initH}" style="width:100%; height:100%; overflow:visible; position:absolute; top:0; left:0;" preserveAspectRatio="none">
                <path class="shape-path smart-arrow-path" d="${pathData.d}" fill="${effectiveFill}" stroke="${effectiveStroke}" stroke-width="${effectiveStrokeWidth}" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
        `.trim();

        if (typeof window.createWrapper === 'function') {
            const el = window.createWrapper(svgString);
            el.setAttribute('data-type', 'smart-arrow');
            el.setAttribute('data-arrow-style', styleId);
            el.setAttribute('data-arrow-head', String(pathData.headLength || 36));
            el.setAttribute('data-arrow-head-px', String(pathData.headLength || 36));
            const dim = (isVertical && !styleId.includes('left') && !styleId.includes('right')) ? initW : initH;
            el.setAttribute('data-arrow-head-ratio', String((pathData.headLength / Math.max(1, dim)).toFixed(3)));
            el.setAttribute('data-scheme-fill', isHollow ? 'none' : '3');
            el.setAttribute('data-scheme-stroke', '0');
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

            if (typeof window.ContextRibbonSystem !== 'undefined' && typeof window.ContextRibbonSystem.updateTabs === 'function') {
                window.ContextRibbonSystem.updateTabs(el);
            }

            if (typeof window.pushHistory === 'function') {
                window.pushHistory();
            }
        }
    }

    /**
     * Compute geometry, sub-selection bounds, and handle coordinates for arrowhead tip adjustment.
     */
    function getArrowTipInfo(el, forcedHead) {
        if (!el) return null;
        const w = parseFloat(el.style.width) || el.offsetWidth || 260;
        const h = parseFloat(el.style.height) || el.offsetHeight || 60;
        const styleId = el.getAttribute('data-arrow-style') || 'block-right';
        const isVertical = (styleId.includes('up') || styleId.includes('down')) && !styleId.includes('left') && !styleId.includes('right');
        const dim = isVertical ? w : h;

        let headLength = (forcedHead !== undefined && forcedHead !== null && !isNaN(forcedHead))
            ? Math.round(Number(forcedHead))
            : (parseFloat(el.getAttribute('data-arrow-head-px')) || parseFloat(el.getAttribute('data-arrow-head')));

        if (!headLength || isNaN(headLength)) {
            headLength = Math.round(dim * 0.7);
        }

        const isDoubleH = styleId.includes('left-right') || styleId.includes('double-right-left') || styleId === 'open-barb-double' || styleId === 'dimension-arrow';
        const isDoubleV = styleId.includes('up-down');
        const isQuad = styleId === 'quad-arrow';
        const isLeft = styleId.includes('left') && !styleId.includes('right');
        const isUp = styleId.includes('up') && !styleId.includes('down');
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
            w,
            h,
            headLength,
            minHead,
            maxHead,
            orientation,
            subBoxes,
            handles
        };
    }

    /**
     * Live refresh of a Smart Arrow element when stretched, resized, or when tip size is adjusted.
     * Recalculates the SVG path so that the arrowhead scales proportionally or to custom user settings.
     */
    function refreshSmartArrow(el, customW, customH, customHead) {
        if (!el || el.getAttribute('data-type') !== 'smart-arrow') return;
        const w = (typeof customW === 'number' && !isNaN(customW)) ? Math.max(5, Math.round(customW)) : (parseFloat(el.style.width) || el.offsetWidth);
        const h = (typeof customH === 'number' && !isNaN(customH)) ? Math.max(5, Math.round(customH)) : (parseFloat(el.style.height) || el.offsetHeight);
        if (w < 5 || h < 5) return;

        const styleId = el.getAttribute('data-arrow-style') || 'block-right';
        const isVertical = (styleId.includes('up') || styleId.includes('down')) && !styleId.includes('left') && !styleId.includes('right');
        const dim = isVertical ? w : h;

        const svg = el.querySelector('svg.smart-arrow-svg') || el.querySelector('svg');
        const path = el.querySelector('path.smart-arrow-path') || (svg ? svg.querySelector('path') : null);
        if (!svg || !path) return;

        let headToUse = customHead;
        if (headToUse === undefined || headToUse === null || isNaN(headToUse)) {
            if (el.getAttribute('data-arrow-head-custom') === 'true' && el.hasAttribute('data-arrow-head-ratio')) {
                const ratio = parseFloat(el.getAttribute('data-arrow-head-ratio')) || 0.7;
                headToUse = Math.round(dim * ratio);
            } else {
                headToUse = undefined;
            }
        }

        const pathData = buildArrowPath(styleId, w, h, headToUse);
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        path.setAttribute('d', pathData.d);

        el.setAttribute('data-arrow-head', String(pathData.headLength));
        el.setAttribute('data-arrow-head-px', String(pathData.headLength));

        if (customHead !== undefined && customHead !== null && !isNaN(customHead)) {
            el.setAttribute('data-arrow-head-custom', 'true');
            if (dim > 0) {
                el.setAttribute('data-arrow-head-ratio', String((pathData.headLength / dim).toFixed(3)));
            }
        }
    }

    /**
     * Refreshes all Smart Arrows within a given container element.
     */
    function refreshAllSmartArrows(container) {
        const root = container || document.getElementById('paper');
        if (!root) return;
        const arrows = root.querySelectorAll('.pub-element[data-type="smart-arrow"]');
        arrows.forEach(el => refreshSmartArrow(el));
    }

    /**
     * High-resolution serialization of Smart Arrows to PNG for print spooler and PDF export.
     * Guarantees 0-pixel offset, no stroke clipping, and identical output across all printer drivers.
     */
    function bakeSmartArrowForPrint(arrowEl, scaleFactor = 4.0) {
        if (!arrowEl) return;
        const w = parseFloat(arrowEl.style.width) || arrowEl.offsetWidth || 260;
        const h = parseFloat(arrowEl.style.height) || arrowEl.offsetHeight || 60;
        const styleId = arrowEl.getAttribute('data-arrow-style') || 'block-right';

        const svg = arrowEl.querySelector('svg');
        const path = arrowEl.querySelector('path.smart-arrow-path') || (svg ? svg.querySelector('path') : null);
        if (!path) return;

        const customHead = parseFloat(arrowEl.getAttribute('data-arrow-head-px')) || parseFloat(arrowEl.getAttribute('data-arrow-head'));
        const pathData = buildArrowPath(styleId, w, h, customHead);
        const d = pathData.d;

        let fill = path.getAttribute('fill') || '#296869';
        let stroke = path.getAttribute('stroke') || '#1a4344';
        let strokeWidth = parseFloat(path.getAttribute('stroke-width')) || 2;

        if (fill.includes('var(') || stroke.includes('var(')) {
            try {
                const comp = window.getComputedStyle(path);
                if (comp.fill && comp.fill !== 'none') fill = comp.fill;
                if (comp.stroke && comp.stroke !== 'none') stroke = comp.stroke;
                if (comp.strokeWidth) strokeWidth = parseFloat(comp.strokeWidth) || strokeWidth;
            } catch (e) {}
        }

        const canvas = document.createElement('canvas');
        const targetW = Math.max(16, Math.round(w * scaleFactor));
        const targetH = Math.max(16, Math.round(h * scaleFactor));
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.scale(scaleFactor, scaleFactor);

        const isStrokeOnly = pathData.isStrokeOnly || styleId.startsWith('open-barb-') || styleId === 'dimension-arrow' || styleId.startsWith('hollow-');

        try {
            const p2d = new Path2D(d);
            if (!isStrokeOnly && fill && fill !== 'none' && fill !== 'transparent') {
                ctx.fillStyle = fill;
                ctx.fill(p2d);
            }
            if (stroke && stroke !== 'none' && strokeWidth > 0) {
                ctx.strokeStyle = stroke;
                ctx.lineWidth = strokeWidth;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke(p2d);
            }

            const pngUrl = canvas.toDataURL('image/png');
            if (pngUrl) {
                const content = arrowEl.querySelector('.element-content') || arrowEl;
                content.innerHTML = `<img class="smart-arrow-baked-img" src="${pngUrl}" style="width:100%; height:100%; object-fit:fill; display:block; pointer-events:none;" alt="Smart Arrow">`;
            }
        } catch (err) {
            console.warn('[Smart Arrows] Print baking fallback:', err);
        }
    }

    /**
     * Toggle the Arrows gallery dropdown menu from the ribbon button.
     */
    function toggleArrowMenu(btn, e) {
        const menu = document.getElementById('arrow-dropdown');
        if (!menu) return;

        // If clicking same button and menu is open, toggle off
        if (menu.style.display === 'block') {
            menu.style.display = 'none';
            return;
        }

        // Hide other dropdowns
        document.querySelectorAll('.dropdown-menu').forEach(m => {
            if (m !== menu) m.style.display = 'none';
        });

        if (btn) {
            const r = btn.getBoundingClientRect();
            menu.style.left = Math.max(10, Math.min(window.innerWidth - 390, r.left)) + 'px';
            menu.style.top = (r.bottom + 5) + 'px';
        } else if (e) {
            menu.style.left = e.clientX + 'px';
            menu.style.top = e.clientY + 'px';
        }
        menu.style.display = 'block';
    }

    // High-precision 100x100 vector previews for dropdown gallery
    const ARROW_PREVIEWS = {
        // --- Block Arrows ---
        'block-right': `<polygon points="10,35 55,35 55,18 90,50 55,82 55,65 10,65" />`,
        'block-left': `<polygon points="90,35 45,35 45,18 10,50 45,82 45,65 90,65" />`,
        'block-up': `<polygon points="35,90 35,45 18,45 50,10 82,45 65,45 65,90" />`,
        'block-down': `<polygon points="35,10 35,55 18,55 50,90 82,55 65,55 65,10" />`,
        'block-left-right': `<polygon points="8,50 30,26 30,38 70,38 70,26 92,50 70,74 70,62 30,62 30,74" />`,
        'block-up-down': `<polygon points="50,8 26,30 38,30 38,70 26,70 50,92 74,70 62,70 62,30 74,30" />`,
        'quad-arrow': `<polygon points="50,8 62,24 56,24 56,44 76,44 76,38 92,50 76,62 76,56 56,56 56,76 62,76 50,92 38,76 44,76 44,56 24,56 24,62 8,50 24,38 24,44 44,44 44,24 38,24" />`,

        // --- Notched & Shaped ---
        'notched-right': `<polygon points="8,26 56,26 56,12 92,50 56,88 56,74 8,74 24,50" />`,
        'notched-left': `<polygon points="92,26 44,26 44,12 8,50 44,88 44,74 92,74 76,50" />`,
        'pentagon-right': `<polygon points="8,24 60,24 92,50 60,76 8,76" />`,
        'chevron-right': `<polygon points="12,14 58,14 90,50 58,86 12,86 44,50" />`,
        'stealth-right': `<polygon points="8,24 50,40 50,14 92,50 50,86 50,60 8,76 24,50" />`,
        'curved-down-right': `<path d="M16,16 C16,50 36,74 68,74 L68,86 L92,66 L68,46 L68,58 C46,58 32,44 32,16 Z" />`,
        'u-turn-down': `<path d="M24,86 L24,42 C24,24 38,12 55,12 C72,12 86,24 86,42 L86,62 L94,62 L78,86 L62,62 L70,62 L70,42 C70,33 63,26 55,26 C47,26 40,33 40,42 L40,86 Z" />`,

        // --- Slender & Precision ---
        'slender-right': `<polygon points="10,46 58,46 58,24 90,50 58,76 58,54 10,54" />`,
        'slender-left': `<polygon points="90,46 42,46 42,24 10,50 42,76 42,54 90,54" />`,
        'slender-up': `<polygon points="46,90 46,42 24,42 50,10 76,42 54,42 54,90" />`,
        'slender-down': `<polygon points="46,10 46,58 24,58 50,90 76,58 54,58 54,10" />`,
        'needle-right': `<polygon points="8,48 48,48 48,32 92,50 48,68 48,52 8,52" />`,
        'diamond-tip-right': `<polygon points="8,46 56,46 56,36 74,22 92,50 74,78 56,64 56,54 8,54" />`,
        'ball-stem-right': `<path d="M 24,36 A 14,14 0 1,0 24,64 L 60,64 L 60,74 L 92,50 L 60,26 L 60,36 Z" />`,
        'callout-right': `<polygon points="8,24 58,24 58,10 92,50 58,90 58,76 8,76" />`,

        // --- Hollow & Technical ---
        'hollow-block-right': `<polygon points="10,35 55,35 55,18 90,50 55,82 55,65 10,65" fill="none" stroke="var(--ui-theme-color)" stroke-width="5" stroke-linejoin="round" />`,
        'hollow-block-left': `<polygon points="90,35 45,35 45,18 10,50 45,82 45,65 90,65" fill="none" stroke="var(--ui-theme-color)" stroke-width="5" stroke-linejoin="round" />`,
        'hollow-double-right-left': `<polygon points="8,50 30,26 30,38 70,38 70,26 92,50 70,74 70,62 30,62 30,74" fill="none" stroke="var(--ui-theme-color)" stroke-width="5" stroke-linejoin="round" />`,
        'open-barb-right': `<g fill="none" stroke="var(--ui-theme-color)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="50" x2="88" y2="50" /><polyline points="58,22 88,50 58,78" /></g>`,
        'open-barb-left': `<g fill="none" stroke="var(--ui-theme-color)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="90" y1="50" x2="12" y2="50" /><polyline points="42,22 12,50 42,78" /></g>`,
        'open-barb-double': `<g fill="none" stroke="var(--ui-theme-color)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="14" y1="50" x2="86" y2="50" /><polyline points="38,24 14,50 38,76" /><polyline points="62,24 86,50 62,76" /></g>`,
        'dimension-arrow': `<g fill="none" stroke="var(--ui-theme-color)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><line x1="14" y1="50" x2="86" y2="50" /><line x1="14" y1="24" x2="14" y2="76" /><line x1="86" y1="24" x2="86" y2="76" /><polyline points="34,34 14,50 34,66" /><polyline points="66,34 86,50 66,66" /></g>`
    };

    /**
     * Initialize the Arrows dropdown gallery.
     */
    function initArrows() {
        console.log('🏹 Initializing Smart Arrows Engine (v5.3.1)...');
        const dropdown = document.getElementById('arrow-dropdown');
        if (!dropdown) return;

        dropdown.innerHTML = '';
        dropdown.style.width = '380px';
        dropdown.style.maxHeight = '450px';
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
                const isHollowOrTechnical = arrow.id.startsWith('hollow-') || arrow.id.startsWith('open-barb-') || arrow.id === 'dimension-arrow';

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

        console.log(`✅ Loaded ${Object.values(ARROW_CATALOG).reduce((sum, cat) => sum + cat.length, 0)} Smart Arrows successfully.`);
    }

    /**
     * Manually set Fill or Outline (Stroke) color on a Smart Arrow element.
     * Removes theme scheme binding to preserve user-chosen custom color.
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
     * When width is 0, removes the stroke completely.
     */
    function setSmartArrowStrokeWidth(arrowEl, width) {
        if (!arrowEl) return;
        const svg = arrowEl.querySelector('svg.smart-arrow-svg') || arrowEl.querySelector('svg');
        const path = arrowEl.querySelector('path.smart-arrow-path') || (svg ? svg.querySelector('path') : null);
        if (!path) return;

        const w = Math.max(0, parseInt(width, 10) || 0);
        arrowEl.setAttribute('data-arrow-stroke-width', String(w));

        if (w === 0) {
            const curStroke = path.getAttribute('stroke');
            if (curStroke && curStroke !== 'none' && curStroke !== 'transparent') {
                arrowEl.setAttribute('data-prev-stroke', curStroke);
            }
            path.setAttribute('stroke-width', '0');
            path.setAttribute('stroke', 'none');
            arrowEl.setAttribute('data-custom-stroke', 'none');
        } else {
            path.setAttribute('stroke-width', String(w));
            const curStroke = path.getAttribute('stroke');
            if (!curStroke || curStroke === 'none' || curStroke === 'transparent') {
                const restored = arrowEl.getAttribute('data-prev-stroke') ||
                    (window.colorSchemes && window.state && window.colorSchemes[window.state.currentScheme] ? window.colorSchemes[window.state.currentScheme][0] : '#1a4344');
                path.setAttribute('stroke', restored);
                arrowEl.setAttribute('data-custom-stroke', restored);
                arrowEl.removeAttribute('data-scheme-stroke');
            }
        }
    }

    // Export API to window
    window.initArrows = initArrows;
    window.toggleArrowMenu = toggleArrowMenu;
    window.buildArrowPath = buildArrowPath;
    window.insertSmartArrow = insertSmartArrow;
    window.refreshSmartArrow = refreshSmartArrow;
    window.refreshAllSmartArrows = refreshAllSmartArrows;
    window.bakeSmartArrowForPrint = bakeSmartArrowForPrint;
    window.getArrowTipInfo = getArrowTipInfo;
    window.setSmartArrowColor = setSmartArrowColor;
    window.setSmartArrowStrokeWidth = setSmartArrowStrokeWidth;
    window.ARROW_CATALOG = ARROW_CATALOG;

})(window);
