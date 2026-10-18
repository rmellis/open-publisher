// Open Publisher Card & Label Sheet Imposition Engine (v5.10.2)
// Allows designing a single business card / label and printing 10 or 12 to a page (Avery / N-Up Imposition).

(function() {
    'use strict';

    const SHEET_DIMENSIONS = {
        'Letter': { name: 'US Letter (8.5 × 11 in)', width: 816, height: 1056, widthIn: 8.5, heightIn: 11.0 },
        'A4': { name: 'A4 (210 × 297 mm)', width: 794, height: 1123, widthMm: 210, heightMm: 297 }
    };

    /**
     * Checks if a page is card-sized (e.g. business card, badge, or label)
     */
    function isCardSizedPage(page) {
        if (!page) return false;
        if (page.format === 'BusinessCard') return true;
        const w = parseFloat(page.width) || 794;
        const h = parseFloat(page.height) || 1123;
        // Typical cards/labels are <= 5 inches (480px) wide and <= 4 inches (384px) tall, or vice versa
        return (w <= 480 && h <= 384) || (w <= 384 && h <= 480);
    }

    /**
     * Calculates grid layout and margins for a card on a target sheet
     */
    function calculateCardGridLayout(cardW, cardH, sheetW, sheetH, preferredCols, preferredRows, gapX = 0, gapY = 0) {
        let cols = preferredCols || Math.max(1, Math.floor((sheetW + gapX) / (cardW + gapX)));
        let rows = preferredRows || Math.max(1, Math.floor((sheetH + gapY) / (cardH + gapY)));

        // Standard 10-up business card layout detection
        const isStandardBusinessCard = (Math.abs(cardW - 336) < 40 && Math.abs(cardH - 192) < 40) ||
                                       (Math.abs(cardW - 321) < 40 && Math.abs(cardH - 208) < 40);
        
        if (!preferredCols && !preferredRows && isStandardBusinessCard) {
            cols = 2;
            rows = 5;
            gapX = 0;
            gapY = 0;
        }

        const totalGridW = cols * cardW + (cols - 1) * gapX;
        const totalGridH = rows * cardH + (rows - 1) * gapY;

        const marginX = Math.max(0, Math.floor((sheetW - totalGridW) / 2));
        const marginY = Math.max(0, Math.floor((sheetH - totalGridH) / 2));

        return {
            cols,
            rows,
            totalCards: cols * rows,
            totalGridW,
            totalGridH,
            marginX,
            marginY,
            gapX,
            gapY
        };
    }

    /**
     * Build an imposed multi-up sheet from a source card page
     */
    function buildImposedSheet(sourcePage, targetPaperKey, gridConfig, isMirroredBack = false, includeCutMarks = true) {
        const sheetSpec = SHEET_DIMENSIONS[targetPaperKey] || SHEET_DIMENSIONS['Letter'];
        const cardW = parseFloat(sourcePage.width) || 336;
        const cardH = parseFloat(sourcePage.height) || 192;
        const { cols, rows, marginX, marginY, gapX, gapY, totalGridW, totalGridH } = gridConfig;

        const imposedElements = [];

        // 1. Iterate grid positions and clone cards
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // For double-sided reverse pages, mirror columns horizontally so front and back align when flipped
                const effectiveCol = isMirroredBack ? (cols - 1 - c) : c;
                const slotLeft = marginX + effectiveCol * (cardW + gapX);
                const slotTop = marginY + r * (cardH + gapY);

                // Re-create background if card has non-transparent background
                if (sourcePage.background && sourcePage.background !== 'transparent') {
                    imposedElements.push({
                        left: slotLeft + 'px',
                        top: slotTop + 'px',
                        width: cardW + 'px',
                        height: cardH + 'px',
                        zIndex: 1,
                        innerHTML: `<div style="width:100%; height:100%; background:${sourcePage.background}; -webkit-print-color-adjust:exact; print-color-adjust:exact; box-sizing:border-box;"></div>`
                    });
                }

                // Clone elements
                const pageElements = sourcePage.elements || [];
                pageElements.forEach(el => {
                    const clonedEl = JSON.parse(JSON.stringify(el));
                    const elL = parseFloat(el.left) || 0;
                    const elT = parseFloat(el.top) || 0;
                    clonedEl.left = (slotLeft + elL) + 'px';
                    clonedEl.top = (slotTop + elT) + 'px';
                    clonedEl.zIndex = (el.zIndex || 10) + 2;
                    if (el.imgSrc) {
                        clonedEl.imgSrc = el.imgSrc;
                        clonedEl.type = el.type || 'image';
                        clonedEl.imgStyle = el.imgStyle ? { ...el.imgStyle } : {};
                    }
                    imposedElements.push(clonedEl);
                });
            }
        }

        // 2. Add professional cut / crop marks around the perimeter and gutters
        if (includeCutMarks) {
            const markLength = 14; // pixels
            const markColor = '#64748b'; // slate grey
            const markStyle = `position:absolute; pointer-events:none; z-index:9999; background:${markColor}; -webkit-print-color-adjust:exact; print-color-adjust:exact;`;

            // Vertical crop lines (top and bottom margins)
            for (let c = 0; c <= cols; c++) {
                let x = marginX + c * cardW;
                if (c > 0 && c < cols && gapX > 0) {
                    // Two tick marks for gutters with gaps
                    x -= gapX / 2;
                }
                // Top margin tick
                if (marginY >= markLength) {
                    imposedElements.push({
                        left: (x - 0.5) + 'px',
                        top: (marginY - markLength - 2) + 'px',
                        width: '1px',
                        height: markLength + 'px',
                        zIndex: 9999,
                        innerHTML: `<div style="${markStyle} width:1px; height:${markLength}px;"></div>`
                    });
                }
                // Bottom margin tick
                const bottomStart = marginY + totalGridH + 2;
                if (bottomStart + markLength <= sheetSpec.height) {
                    imposedElements.push({
                        left: (x - 0.5) + 'px',
                        top: bottomStart + 'px',
                        width: '1px',
                        height: markLength + 'px',
                        zIndex: 9999,
                        innerHTML: `<div style="${markStyle} width:1px; height:${markLength}px;"></div>`
                    });
                }
            }

            // Horizontal crop lines (left and right margins)
            for (let r = 0; r <= rows; r++) {
                let y = marginY + r * cardH;
                if (r > 0 && r < rows && gapY > 0) {
                    y -= gapY / 2;
                }
                // Left margin tick
                if (marginX >= markLength) {
                    imposedElements.push({
                        left: (marginX - markLength - 2) + 'px',
                        top: (y - 0.5) + 'px',
                        width: markLength + 'px',
                        height: '1px',
                        zIndex: 9999,
                        innerHTML: `<div style="${markStyle} width:${markLength}px; height:1px;"></div>`
                    });
                }
                // Right margin tick
                const rightStart = marginX + totalGridW + 2;
                if (rightStart + markLength <= sheetSpec.width) {
                    imposedElements.push({
                        left: rightStart + 'px',
                        top: (y - 0.5) + 'px',
                        width: markLength + 'px',
                        height: '1px',
                        zIndex: 9999,
                        innerHTML: `<div style="${markStyle} width:${markLength}px; height:1px;"></div>`
                    });
                }
            }

            // Subtle cut lines across gutters between cards if cards abut
            if (gapX === 0 && gapY === 0) {
                // Outer perimeter bounding guide
                imposedElements.push({
                    left: marginX + 'px',
                    top: marginY + 'px',
                    width: totalGridW + 'px',
                    height: totalGridH + 'px',
                    zIndex: 9998,
                    innerHTML: `<div style="position:absolute; width:100%; height:100%; border:1px dashed rgba(100,116,139,0.35); pointer-events:none; box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact;"></div>`
                });

                // Internal dividing lines
                for (let c = 1; c < cols; c++) {
                    const x = marginX + c * cardW;
                    imposedElements.push({
                        left: x + 'px',
                        top: marginY + 'px',
                        width: '1px',
                        height: totalGridH + 'px',
                        zIndex: 9998,
                        innerHTML: `<div style="position:absolute; width:1px; height:100%; border-left:1px dashed rgba(100,116,139,0.25); pointer-events:none; -webkit-print-color-adjust:exact; print-color-adjust:exact;"></div>`
                    });
                }
                for (let r = 1; r < rows; r++) {
                    const y = marginY + r * cardH;
                    imposedElements.push({
                        left: marginX + 'px',
                        top: y + 'px',
                        width: totalGridW + 'px',
                        height: '1px',
                        zIndex: 9998,
                        innerHTML: `<div style="position:absolute; width:100%; height:1px; border-top:1px dashed rgba(100,116,139,0.25); pointer-events:none; -webkit-print-color-adjust:exact; print-color-adjust:exact;"></div>`
                    });
                }
            }
        }

        return {
            id: Date.now() + Math.floor(Math.random() * 10000),
            width: sheetSpec.width + 'px',
            height: sheetSpec.height + 'px',
            background: '#ffffff',
            elements: imposedElements
        };
    }

    /**
     * Executes the card sheet print workflow
     */
    window.executeCardSheetPrint = function(options = {}) {
        if (!state || !state.pages || state.pages.length === 0) return;

        // Serialize active canvas page before building sheets
        if (typeof serializeCurrentPage === 'function') {
            state.pages[state.currentPageIndex] = serializeCurrentPage();
        }

        const sourcePage = state.pages[state.currentPageIndex] || state.pages[0];
        const cardW = parseFloat(sourcePage.width) || 336;
        const cardH = parseFloat(sourcePage.height) || 192;
        const targetPaperKey = options.paper || 'Letter';
        const sheetSpec = SHEET_DIMENSIONS[targetPaperKey] || SHEET_DIMENSIONS['Letter'];

        const gridConfig = calculateCardGridLayout(
            cardW,
            cardH,
            sheetSpec.width,
            sheetSpec.height,
            options.cols,
            options.rows,
            options.gapX || 0,
            options.gapY || 0
        );

        const includeCutMarks = options.cutMarks !== false;
        const isDuplex = options.duplex && state.pages.length >= 2;

        const imposedSheets = [];

        // Sheet 1: Front
        const sheetFront = buildImposedSheet(sourcePage, targetPaperKey, gridConfig, false, includeCutMarks);
        imposedSheets.push(sheetFront);

        // Sheet 2: Back (with mirrored columns so duplex print alignment matches)
        if (isDuplex) {
            const backPage = state.pages[1];
            const sheetBack = buildImposedSheet(backPage, targetPaperKey, gridConfig, true, includeCutMarks);
            imposedSheets.push(sheetBack);
        }

        // Attach imposed spreads to global print hook
        window._isMultiUpPrinting = true;
        window._isBookletPrinting = false;
        window._imposedSpreads = imposedSheets;

        // Invoke native print engine
        if (typeof printFullDocumentDirect === 'function') {
            printFullDocumentDirect(true);
        } else if (typeof printFullDocument === 'function') {
            printFullDocument(true);
        }
    };

    /**
     * Shows the Card & Sheet Imposition Print Modal
     */
    window.showCardSheetModal = function() {
        if (!state || !state.pages || state.pages.length === 0) return;

        const activePage = state.pages[state.currentPageIndex] || state.pages[0];
        if (!isCardSizedPage(activePage)) {
            if (typeof DialogSystem !== 'undefined') {
                const fmtName = (activePage && activePage.format) || 'Standard Page';
                DialogSystem.alert('Card Sheet Printing', `Card Sheet imposition is designed for business cards and labels. Your current publication is full-sized (${fmtName}). Use standard Print or Booklet for full-sized pages.`);
            }
            return;
        }

        if (typeof serializeCurrentPage === 'function') {
            state.pages[state.currentPageIndex] = serializeCurrentPage();
        }
        const cardW = Math.round(parseFloat(activePage.width) || 336);
        const cardH = Math.round(parseFloat(activePage.height) || 192);

        // Convert px to inches and mm for informative display
        const widthIn = (cardW / 96).toFixed(2);
        const heightIn = (cardH / 96).toFixed(2);
        const widthMm = Math.round((cardW / 96) * 25.4);
        const heightMm = Math.round((cardH / 96) * 25.4);

        const hasMultiplePages = state.pages.length >= 2;

        const modalHtml = `
            <div style="font-family: 'Inter', system-ui, sans-serif; color: #1e293b; max-width: 580px; margin: 0 auto; line-height: 1.4;">
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <div style="font-weight: 700; color: #166534; font-size: 13px;">Single Card / Label Detected</div>
                        <div style="font-size: 12px; color: #15803d; margin-top: 2px;">
                            ${widthIn}" × ${heightIn}" (${widthMm} × ${heightMm} mm) • ${cardW} × ${cardH} px
                        </div>
                    </div>
                    <span style="background: #166534; color: white; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px;">
                        Multi-Up Ready
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 180px; gap: 18px; align-items: start;">
                    <!-- Settings Column -->
                    <div style="display: flex; flex-direction: column; gap: 14px;">
                        <!-- Paper Selector -->
                        <div>
                            <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 5px;">Target Paper Sheet</label>
                            <select id="op-cardsheet-paper" style="width: 100%; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; background: #fff;">
                                <option value="Letter" selected>US Letter (8.5 × 11 in) • 10-Up Standard</option>
                                <option value="A4">A4 (210 × 297 mm) • European Standard</option>
                            </select>
                        </div>

                        <!-- Grid Preset -->
                        <div>
                            <label style="display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 5px;">Cards per Sheet Layout</label>
                            <select id="op-cardsheet-preset" style="width: 100%; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; background: #fff;">
                                <option value="10up" selected>10 Cards per Sheet (2 cols × 5 rows) • Avery 5371 / 8371</option>
                                <option value="12up">12 Cards per Sheet (2 cols × 6 rows)</option>
                                <option value="12up_wide">12 Cards per Sheet (3 cols × 4 rows)</option>
                                <option value="8up">8 Postcards / Badges (2 cols × 4 rows)</option>
                                <option value="custom">Custom Columns and Rows</option>
                            </select>
                        </div>

                        <!-- Custom Grid Inputs (Hidden unless Custom is picked) -->
                        <div id="op-cardsheet-custom-row" style="display: none; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label style="display: block; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 3px;">Columns</label>
                                <input type="number" id="op-cardsheet-cols" min="1" max="6" value="2" style="width: 100%; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; box-sizing: border-box;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 3px;">Rows</label>
                                <input type="number" id="op-cardsheet-rows" min="1" max="10" value="5" style="width: 100%; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; box-sizing: border-box;">
                            </div>
                        </div>

                        <!-- Cut Marks Checkbox -->
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                            <label style="display: flex; align-items: flex-start; gap: 8px; cursor: pointer; font-size: 12px; color: #334155;">
                                <input type="checkbox" id="op-cardsheet-cutmarks" checked style="margin-top: 2px;">
                                <span>
                                    <strong>Include Crop / Cut Guidelines</strong><br>
                                    <span style="color: #64748b; font-size: 11px;">Prints alignment ticks and dashed guidelines for scissors or paper cutter.</span>
                                </span>
                            </label>
                        </div>

                        <!-- Double Sided Option -->
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                            <label style="display: flex; align-items: flex-start; gap: 8px; cursor: ${hasMultiplePages ? 'pointer' : 'default'}; font-size: 12px; color: #334155;">
                                <input type="checkbox" id="op-cardsheet-duplex" ${hasMultiplePages ? 'checked' : 'disabled'} style="margin-top: 2px;">
                                <span>
                                    <strong>Double-Sided Printing (Duplex)</strong><br>
                                    <span style="color: #64748b; font-size: 11px;">
                                        ${hasMultiplePages 
                                            ? 'Sheet 1 prints Fronts (Page 1), Sheet 2 prints Backs (Page 2) with mirrored column layout.' 
                                            : 'Add a 2nd page in Open Publisher to print double-sided cards.'}
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <!-- Live Sheet Preview Column -->
                    <div style="text-align: center;">
                        <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                            Sheet Preview
                        </div>
                        <div id="op-cardsheet-preview" style="width: 170px; height: 220px; background: #ffffff; border: 1px solid #94a3b8; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin: 0 auto; position: relative; border-radius: 3px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                            <!-- Dynamically generated preview -->
                        </div>
                        <div id="op-cardsheet-summary" style="font-size: 11px; color: #0f766e; font-weight: 600; margin-top: 8px;">
                            10 Cards on Sheet (2 × 5)
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (typeof DialogSystem !== 'undefined') {
            DialogSystem.show('Print Multiple Copies per Sheet', modalHtml, () => {
                const paper = document.getElementById('op-cardsheet-paper').value;
                const preset = document.getElementById('op-cardsheet-preset').value;
                let cols = 2;
                let rows = 5;

                if (preset === '10up') { cols = 2; rows = 5; }
                else if (preset === '12up') { cols = 2; rows = 6; }
                else if (preset === '12up_wide') { cols = 3; rows = 4; }
                else if (preset === '8up') { cols = 2; rows = 4; }
                else if (preset === 'custom') {
                    cols = parseInt(document.getElementById('op-cardsheet-cols').value) || 2;
                    rows = parseInt(document.getElementById('op-cardsheet-rows').value) || 5;
                }

                const cutMarks = document.getElementById('op-cardsheet-cutmarks').checked;
                const duplex = document.getElementById('op-cardsheet-duplex') && document.getElementById('op-cardsheet-duplex').checked;

                window.executeCardSheetPrint({
                    paper,
                    cols,
                    rows,
                    cutMarks,
                    duplex
                });
            }, false, 'Print / Export Sheet');

            // Hook up live preview and preset toggle listeners
            setTimeout(() => {
                const paperSel = document.getElementById('op-cardsheet-paper');
                const presetSel = document.getElementById('op-cardsheet-preset');
                const customRow = document.getElementById('op-cardsheet-custom-row');
                const colsInput = document.getElementById('op-cardsheet-cols');
                const rowsInput = document.getElementById('op-cardsheet-rows');
                const cutMarksInput = document.getElementById('op-cardsheet-cutmarks');
                const previewEl = document.getElementById('op-cardsheet-preview');
                const summaryEl = document.getElementById('op-cardsheet-summary');

                const updatePreview = () => {
                    const preset = presetSel ? presetSel.value : '10up';
                    let cols = 2, rows = 5;
                    if (preset === '10up') { cols = 2; rows = 5; }
                    else if (preset === '12up') { cols = 2; rows = 6; }
                    else if (preset === '12up_wide') { cols = 3; rows = 4; }
                    else if (preset === '8up') { cols = 2; rows = 4; }
                    else if (preset === 'custom') {
                        cols = parseInt(colsInput.value) || 2;
                        rows = parseInt(rowsInput.value) || 5;
                    }

                    if (customRow) {
                        customRow.style.display = (preset === 'custom') ? 'grid' : 'none';
                    }

                    if (summaryEl) {
                        summaryEl.innerText = `${cols * rows} Cards on Sheet (${cols} × ${rows})`;
                    }

                    if (!previewEl) return;

                    const hasCutMarks = cutMarksInput && cutMarksInput.checked;
                    const previewW = 160;
                    const previewH = 210;

                    let html = `<div style="position:relative; width:${previewW}px; height:${previewH}px; background:#fff; box-sizing:border-box;">`;

                    // Miniature card slots
                    const slotW = Math.floor((previewW - 20) / cols);
                    const slotH = Math.floor((previewH - 20) / rows);
                    const offX = Math.floor((previewW - cols * slotW) / 2);
                    const offY = Math.floor((previewH - rows * slotH) / 2);

                    for (let r = 0; r < rows; r++) {
                        for (let c = 0; c < cols; c++) {
                            const x = offX + c * slotW;
                            const y = offY + r * slotH;
                            html += `
                                <div style="position:absolute; left:${x}px; top:${y}px; width:${slotW - 1}px; height:${slotH - 1}px; background:#f1f5f9; border:1px solid #007670; border-radius:2px; display:flex; align-items:center; justify-content:center; box-sizing:border-box;">
                                    <div style="width:65%; height:3px; background:#cbd5e1; border-radius:1px;"></div>
                                </div>
                            `;
                        }
                    }

                    if (hasCutMarks) {
                        html += `<div style="position:absolute; left:${offX}px; top:${offY}px; width:${cols * slotW}px; height:${rows * slotH}px; border:1px dashed #94a3b8; pointer-events:none; box-sizing:border-box;"></div>`;
                    }

                    html += `</div>`;
                    previewEl.innerHTML = html;
                };

                if (paperSel) paperSel.addEventListener('change', updatePreview);
                if (presetSel) presetSel.addEventListener('change', updatePreview);
                if (colsInput) colsInput.addEventListener('input', updatePreview);
                if (rowsInput) rowsInput.addEventListener('input', updatePreview);
                if (cutMarksInput) cutMarksInput.addEventListener('change', updatePreview);

                updatePreview();
            }, 50);
        }
    };

    /**
     * Smart pre-flight prompt shown when user clicks Print on a small card
     */
    window.showCardSheetPromptModal = function() {
        if (typeof DialogSystem === 'undefined') return;

        const firstPage = state.pages[0];
        const cardW = Math.round(parseFloat(firstPage.width) || 336);
        const cardH = Math.round(parseFloat(firstPage.height) || 192);

        const promptHtml = `
            <div style="font-family: 'Inter', system-ui, sans-serif; color: #334155; line-height: 1.5; max-width: 480px;">
                <p style="margin-top: 0; font-size: 14px;">
                    This publication is <b>business-card sized</b> (${cardW} × ${cardH} px).
                </p>
                <p style="font-size: 13px; color: #475569; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; line-height: 1.5;">
                    <i class="fas fa-th-large" style="color: #0f766e; margin-right: 6px;"></i>
                    You can tile <b>multiple copies per sheet</b> (e.g. 10-up, 12-up, 8-up, or custom grid layouts with cut guidelines on Letter or A4 sheets), or print just a single card.
                </p>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button id="op-prompt-single-btn" class="btn-secondary" style="padding: 8px 16px; cursor: pointer; border-radius: 6px;">
                        Print Single Card
                    </button>
                    <button id="op-prompt-sheet-btn" class="btn-primary" style="padding: 8px 16px; cursor: pointer; border-radius: 6px; background: #007670; color: white; display: inline-flex; align-items: center; gap: 6px;">
                        <i class="fas fa-th-large"></i>Print Multiple per Sheet...
                    </button>
                </div>
            </div>
        `;

        DialogSystem.show('Print Card Options', promptHtml, null, true);

        setTimeout(() => {
            if (document.getElementById('custom-dialog-confirm')) document.getElementById('custom-dialog-confirm').style.display = 'none';
            if (document.getElementById('custom-dialog-cancel')) document.getElementById('custom-dialog-cancel').style.display = 'none';

            const singleBtn = document.getElementById('op-prompt-single-btn');
            const sheetBtn = document.getElementById('op-prompt-sheet-btn');

            if (singleBtn) {
                singleBtn.onclick = () => {
                    DialogSystem.close();
                    setTimeout(() => {
                        if (typeof printFullDocumentDirect === 'function') {
                            printFullDocumentDirect(false);
                        }
                    }, 200);
                };
            }

            if (sheetBtn) {
                sheetBtn.onclick = () => {
                    DialogSystem.close();
                    setTimeout(() => {
                        window.showCardSheetModal();
                    }, 200);
                };
            }
        }, 10);
    };

    /**
     * Synchronizes the visibility of the "Card Sheet" tool button on the ribbon bar.
     * The button is only displayed when a business card or card-sized publication is active.
     */
    function updateCardSheetRibbonVisibility() {
        const btn = document.getElementById('ribbon-card-sheet-btn');
        if (!btn) return;

        let isCard = false;
        if (typeof state !== 'undefined') {
            if (state.format === 'BusinessCard') {
                isCard = true;
            } else if (state.pages && state.pages.length > 0) {
                const curPage = state.pages[state.currentPageIndex] || state.pages[0];
                isCard = isCardSizedPage(curPage);
            }
        }

        btn.style.display = isCard ? 'flex' : 'none';
    }

    window.isCardSizedPage = isCardSizedPage;
    window.printCardSheet = window.showCardSheetModal;
    window.updateCardSheetRibbonVisibility = updateCardSheetRibbonVisibility;

    // Run initial sync once DOM and state are available
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateCardSheetRibbonVisibility);
    } else {
        setTimeout(updateCardSheetRibbonVisibility, 50);
    }

})();
