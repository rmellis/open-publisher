window.saveDocument = function() {
    state.pages[state.currentPageIndex] = serializeCurrentPage();
    const firstPage = state.pages[0] || {};
    const curDpi = state.dpi || (firstPage && firstPage.dpi) || 96;
    state.dpi = curDpi;
    const detectedFormat = (typeof state !== 'undefined' && state.format)
        || (firstPage && firstPage.format)
        || (window.UnitConversionService ? window.UnitConversionService.detectFormat(parseFloat(firstPage.width || paper.style.width || 794), parseFloat(firstPage.height || paper.style.height || 1123), curDpi) : 'A4');
    state.format = detectedFormat;

    // Ensure all pages have explicit orientation, dpi, and format set
    state.pages.forEach(p => {
        if (!p.orientation) {
            p.orientation = parseFloat(p.width) >= parseFloat(p.height) ? 'landscape' : 'portrait';
        }
        if (!p.dpi) {
            p.dpi = curDpi;
        }
        if (!p.format) {
            p.format = detectedFormat;
        }
    });
    const docOrientation = firstPage.orientation || (parseFloat(firstPage.width) >= parseFloat(firstPage.height) ? 'landscape' : 'portrait');
    const docData = {
        title: document.getElementById('doc-title').innerText,
        orientation: docOrientation,
        format: detectedFormat,
        dpi: curDpi,
        unit: state.unit || 'cm',
        rulerUnit: state.rulerUnit || 'cm',
        rulerUnitExplicit: !!state._userExplicitRulerUnit,
        pages: state.pages,
        hasMasterPage: state.hasMasterPage || false,
        isSpreadMode: state.isSpreadMode || false,
        rulerOriginX: state.rulerOriginX || 0,
        rulerOriginY: state.rulerOriginY || 0,
        margins: state.margins || {top: 48, right: 48, bottom: 48, left: 48},
        colorModel: document.getElementById('paper').classList.contains('cmyk-mode') ? 'CMYK' : 'RGB'
    };
    
    const paperEl = document.getElementById('paper');
    if (paperEl && paperEl.getAttribute('data-theme-saved') === 'true') {
        docData.themeSettings = {
            saved: true,
            id: paperEl.getAttribute('data-theme-id') || '',
            name: paperEl.getAttribute('data-theme-name') || '',
            type: paperEl.getAttribute('data-theme-type') || '',
            c1: paperEl.getAttribute('data-theme-c1') || '',
            c2: paperEl.getAttribute('data-theme-c2') || '',
            url: paperEl.getAttribute('data-theme-url') || '',
            sat: paperEl.getAttribute('data-theme-sat') || '100',
            bri: paperEl.getAttribute('data-theme-bri') || '100',
            con: paperEl.getAttribute('data-theme-con') || '100',
            hue: paperEl.getAttribute('data-theme-hue') || '0',
            tex: paperEl.getAttribute('data-theme-tex') || '100',
            size: paperEl.getAttribute('data-theme-size') || '100'
        };
    }
    
    if (window.DashboardSystem) {
        let sizeLabel = 'Custom';
        if (typeof window.getPageSizeLabel === 'function' && state.pages.length > 0) {
            const w = parseInt(state.pages[0].width);
            const h = parseInt(state.pages[0].height);
            sizeLabel = window.getPageSizeLabel(w, h);
        }
        try {
            DashboardSystem.addToRecent(docData.title + '.opub', docData, '', sizeLabel);
        } catch(e) {}
    }

    const blob = new Blob([JSON.stringify(docData)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = docData.title + '.opub'; 
    a.click();
}

window.saveDocumentAs = function() {
    const currentTitle = document.getElementById('doc-title').innerText || 'Untitled Document';
    const html = `
        <div style="margin-bottom:15px; font-size:14px; color:#555;">
            Enter a new name for your document.
        </div>
        <input type="text" id="save-as-filename" class="op-input-field" value="${currentTitle}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; font-family:inherit;" />
    `;
    DialogSystem.show('Save As', html, () => {
        const input = document.getElementById('save-as-filename');
        if (input && input.value.trim() !== '') {
            document.getElementById('doc-title').innerText = input.value.trim();
            if (typeof window.saveDocument === 'function') {
                window.saveDocument();
            } else {
                saveDocument();
            }
        }
    }, false, 'Save As');
};

function openDocument() { document.getElementById('file-open').click(); }

window.printFullDocument = async function(isBooklet = false) {
    if (!isBooklet && !window._isMultiUpPrinting && typeof serializeCurrentPage === 'function') {
        state.pages[state.currentPageIndex] = serializeCurrentPage();
    }

    // Smart pre-flight detection for business-card sized documents
    if (!isBooklet && !window._isMultiUpPrinting && state.pages && state.pages.length > 0) {
        const firstPage = state.pages[0];
        if (typeof window.isCardSizedPage === 'function' && window.isCardSizedPage(firstPage) && typeof window.showCardSheetPromptModal === 'function') {
            window.showCardSheetPromptModal();
            return;
        }
    }

    return window.printFullDocumentDirect(isBooklet || window._isMultiUpPrinting);
};

window.printFullDocumentDirect = async function(isImposed = false) {
    if (!isImposed && !window._isBookletPrinting && !window._isMultiUpPrinting && typeof serializeCurrentPage === 'function') {
        state.pages[state.currentPageIndex] = serializeCurrentPage();
    }
    // 1. Create or find our secret print container
    let printSpooler = document.getElementById('op-print-spooler');
    if (!printSpooler) {
        printSpooler = document.createElement('div');
        printSpooler.id = 'op-print-spooler';
        document.body.appendChild(printSpooler);
    }
    
    // Clear out any old print jobs
    printSpooler.innerHTML = ''; 

    // 2. Loop through every page saved in the state memory or imposed spreads
    const pagesToRender = (window._imposedSpreads && (isImposed || window._isBookletPrinting || window._isMultiUpPrinting)) 
        ? window._imposedSpreads 
        : state.pages;

    pagesToRender.forEach((page, pageIndex) => {
        // Create a blank piece of paper for this page
        let pageWrapper = document.createElement('div');
        pageWrapper.className = 'op-print-page';
        pageWrapper.style.width = page.width;
        pageWrapper.style.height = page.height;
        pageWrapper.style.background = page.background || '#ffffff';
        pageWrapper.style.position = 'relative';

        // 3. Reconstruct every element on this specific page
        let elementsToRender = page.elements || [];
        if (!isImposed && !window._isBookletPrinting && !window._isMultiUpPrinting && state.hasMasterPage && pageIndex > 0 && state.pages[0] && state.pages[0].elements && !page.ignoreMasterPage) {
             elementsToRender = state.pages[0].elements.concat(elementsToRender);
        }
        
        // Strip out the master theme wrapper if this page requested a blank background
        if (page.ignoreBackground) {
            elementsToRender = elementsToRender.filter(el => !(el.innerHTML && (el.innerHTML.includes('op-theme-container') || el.innerHTML.includes('op-theme-bg'))));
        }
        
        elementsToRender.forEach(el => {
            let elDiv = document.createElement('div');
            elDiv.style.position = 'absolute';
            elDiv.style.left = el.left;
            elDiv.style.top = el.top;
            elDiv.style.width = el.width;
            elDiv.style.height = el.height;
            elDiv.style.zIndex = el.zIndex;
            elDiv.style.transform = el.transform || 'none';
            elDiv.style.overflow = 'visible';
            
            // If it's a background image layer, rebuild the image
            if (el.imgSrc) {
                 let img = document.createElement('img');
                 img.crossOrigin = 'anonymous';
                 img.setAttribute('crossorigin', 'anonymous');
                 img.src = el.imgSrc;
                 if (el.altText) img.alt = el.altText;
                 // Apply the exact styles (like opacity) from the state
                 if (el.imgStyle) {
                     Object.assign(img.style, el.imgStyle);
                 }
                 img.style.display = 'block';
                 let fStr = (el.imgStyle && el.imgStyle.filter) ? el.imgStyle.filter : (el.filter || '');
                 if (!fStr && el.contentCssText) {
                     const m = el.contentCssText.match(/filter:\s*([^;]+)/i);
                     if (m) fStr = m[1];
                 }
                 if (!fStr && el.innerHTML) {
                     const m = el.innerHTML.match(/filter:\s*([^;"']+)/i);
                     if (m) fStr = m[1];
                 }
                 fStr = (fStr || '').replace(/\bnone\b/g, '').trim();
                 if (fStr) {
                     img.style.filter = fStr;
                     img.style.WebkitFilter = fStr;
                 }
                 const effectiveClip = (el.imgStyle && el.imgStyle.clipPath) || el.clipPath;
                 if (effectiveClip && effectiveClip !== 'none') {
                     img.style.clipPath = effectiveClip;
                     img.style.webkitClipPath = effectiveClip;
                     const rMatch = effectiveClip.match(/round\s+([0-9]+(?:\.[0-9]+)?(?:px|%))/i);
                     if (rMatch) {
                         img.style.borderRadius = rMatch[1];
                     }
                 }
                 const effectiveRadius = (el.imgStyle && el.imgStyle.borderRadius) || el.borderRadius;
                 if (effectiveRadius && effectiveRadius !== 'none') {
                     img.style.borderRadius = effectiveRadius;
                 }
                 elDiv.appendChild(img);
            } else {
                 // Otherwise, it's text. Just dump the exact HTML inside!
                 elDiv.innerHTML = el.innerHTML;
            }
            pageWrapper.appendChild(elDiv);
        });
        
        // Add the finished page to our hidden stack
        printSpooler.appendChild(pageWrapper);
    });

    // 4. Trigger the browser's native Print Dialog!
    // Give the DOM 100 milliseconds to render the images before popping the dialog
    await new Promise(resolve => setTimeout(resolve, 100));

    if (window.OP_Desktop_API) {
        await window.OP_Desktop_API.triggerCustomPrint();
    } else {
        window.print();
    }
    
    // 5. Clean up the mess so we don't crash the browser's memory
    printSpooler.innerHTML = '';
}

function printBooklet() {
    if (state.pages.length === 0) return;
    
    const executeBookletPrint = () => {
        if (typeof serializeCurrentPage === 'function') {
            state.pages[state.currentPageIndex] = serializeCurrentPage();
        }
        
        // 1. Temporarily split spreads back to single pages in memory if needed
        let singlePages = [];
        if (state.isSpreadMode) {
            state.pages.forEach((spread, spreadIndex) => {
                const singleW = parseInt(spread.width) / 2;
                let leftPage = { width: singleW + 'px', height: spread.height, background: spread.background, elements: [] };
                let rightPage = { width: singleW + 'px', height: spread.height, background: spread.background, elements: [] };
                
                let spreadElements = spread.elements || [];
                if (state.hasMasterPage && spreadIndex > 0 && state.pages[0] && state.pages[0].elements && !spread.ignoreMasterPage) {
                    spreadElements = state.pages[0].elements.concat(spreadElements);
                }
                
                // Strip out the master theme wrapper if this page requested a blank background
                if (spread.ignoreBackground) {
                    spreadElements = spreadElements.filter(el => !(el.innerHTML && (el.innerHTML.includes('op-theme-container') || el.innerHTML.includes('op-theme-bg'))));
                }
                
                spreadElements.forEach(el => {
                    let elLeft = parseFloat(el.left);
                    if (elLeft < singleW) {
                        leftPage.elements.push(JSON.parse(JSON.stringify(el)));
                    } else {
                        let newEl = JSON.parse(JSON.stringify(el));
                        newEl.left = (elLeft - singleW) + 'px';
                        rightPage.elements.push(newEl);
                    }
                });
                singlePages.push(leftPage, rightPage);
            });
        } else {
            singlePages = JSON.parse(JSON.stringify(state.pages));
            if (state.hasMasterPage && state.pages[0] && state.pages[0].elements) {
                for (let i = 1; i < singlePages.length; i++) {
                    if (!singlePages[i].ignoreMasterPage) {
                        singlePages[i].elements = state.pages[0].elements.concat(singlePages[i].elements || []);
                    }
                    if (singlePages[i].ignoreBackground) {
                        singlePages[i].elements = singlePages[i].elements.filter(el => !(el.innerHTML && (el.innerHTML.includes('op-theme-container') || el.innerHTML.includes('op-theme-bg'))));
                    }
                }
            }
        }
        
        // 2. Pad to multiple of 4
        while (singlePages.length % 4 !== 0) {
            singlePages.push({
                width: singlePages[0].width,
                height: singlePages[0].height,
                background: '#ffffff',
                elements: []
            });
        }
        
        // 3. Saddle-Stitch Imposition
        let imposedSpreads = [];
        let numPages = singlePages.length;
        let singleW = parseInt(singlePages[0].width);
        
        for (let i = 0; i < numPages / 2; i++) {
            let leftIndex, rightIndex;
            if (i % 2 === 0) {
                leftIndex = numPages - 1 - i;
                rightIndex = i;
            } else {
                leftIndex = i;
                rightIndex = numPages - 1 - i;
            }
            
            let leftPage = singlePages[leftIndex];
            let rightPage = singlePages[rightIndex];
            
            let spread = {
                width: (singleW * 2) + 'px',
                height: leftPage.height,
                background: '#ffffff',
                elements: []
            };

            if (leftPage.background && leftPage.background !== 'transparent') {
                spread.elements.push({
                    left: '0px',
                    top: '0px',
                    width: singleW + 'px',
                    height: spread.height,
                    zIndex: -9999,
                    innerHTML: `<div style="width:100%; height:100%; background: ${leftPage.background};"></div>`
                });
            }

            if (rightPage.background && rightPage.background !== 'transparent') {
                spread.elements.push({
                    left: singleW + 'px',
                    top: '0px',
                    width: singleW + 'px',
                    height: spread.height,
                    zIndex: -9999,
                    innerHTML: `<div style="width:100%; height:100%; background: ${rightPage.background};"></div>`
                });
            }
            
            leftPage.elements.forEach(el => {
                if (el.innerHTML && el.innerHTML.includes('spread-fold-line')) return;
                spread.elements.push(JSON.parse(JSON.stringify(el)));
            });
            rightPage.elements.forEach(el => {
                if (el.innerHTML && el.innerHTML.includes('spread-fold-line')) return;
                let newEl = JSON.parse(JSON.stringify(el));
                newEl.left = (parseFloat(newEl.left) + singleW) + 'px';
                spread.elements.push(newEl);
            });
            
            // Add the fold line down the center
            spread.elements.push({
                left: singleW + 'px',
                top: '0px',
                width: '1px',
                height: spread.height,
                zIndex: 9999,
                innerHTML: "<div style='width:1px; height:100%; border-left: 1px dashed #999; pointer-events:none;' class='spread-fold-line'></div>"
            });
            
            imposedSpreads.push(spread);
        }
        
        window._isBookletPrinting = true;
        window._imposedSpreads = imposedSpreads;
        printFullDocument(true); // Trigger the print hook
    };

    if (!state.isSpreadMode && typeof DialogSystem !== 'undefined') {
        const dialogHtml = `
            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 5px;">
                <div style="flex: 1;">
                    <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.5; color: #334155; text-align: left;">
                        The Booklet print feature is designed to be used with <b>Spreads</b> enabled in the View menu. 
                    </p>
                    <p style="margin: 0 0 15px 0; font-size: 13px; line-height: 1.5; color: #64748b; text-align: left; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <i class="fas fa-info-circle" style="color: #0f766e; margin-right: 5px;"></i>
                        To turn on Spreads, click the <b>View</b> tab and select <b>Spreads</b> like in the image to the right.
                    </p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #334155; text-align: left; font-weight: 500;">
                        Are you sure you want to continue printing without Spreads?
                    </p>
                </div>
                <div style="flex-shrink: 0; width: 170px;">
                    <img src="https://saw.floydcraft.co.uk/spreads.jpg" alt="Spreads Button" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.05); display: block;">
                </div>
            </div>
        `;
        DialogSystem.show('Spreads Recommended', dialogHtml, () => {
            executeBookletPrint();
        });
    } else {
        executeBookletPrint();
    }
}

window.printCardSheet = function() {
    if (typeof showCardSheetModal === 'function') {
        showCardSheetModal();
    }
};

function uploadAndConvertDoc(file) {
    if (typeof DashboardSystem !== 'undefined' && DashboardSystem && typeof DashboardSystem.close === 'function') {
        try { DashboardSystem.close(); } catch (e) {}
    }
    
    // --- 1. THE PRE-FLIGHT MENU ---
    // Pauses the process to ask the user how they want to import
    // --- 1. THE PRE-FLIGHT MENU (NARROW-OPTIMIZED UI) ---
    const promptHtml = `
        <style>
            /* Fluid container that respects the parent's width */
            .op-import-modal { 
                font-family: 'Segoe UI', Roboto, Helvetica, sans-serif; 
                color: #334155; 
                text-align: left; 
                padding: 0; 
                width: 100%; 
                box-sizing: border-box; 
            }
            .op-import-modal p { margin-top: 0; font-size: 13px; margin-bottom: 12px; font-weight: 500; }
            
            /* Fluid Cards */
            .op-import-card {
                display: block; 
                padding: 10px;
                border: 2px solid #e2e8f0; 
                border-radius: 8px; 
                margin-bottom: 10px;
                cursor: pointer; 
                transition: all 0.2s ease; 
                background: #ffffff;
                width: 100%; 
                box-sizing: border-box; /* Crucial: stops borders/padding from adding to the width */
            }
            .op-import-card:hover { border-color: #94a3b8; background: #f8fafc; }
            .op-import-card:has(input:checked) { border-color: #0ea5e9; background: #f0f9ff; }
            
            .op-import-card.safe-mode { border-color: #fde68a; background: #fffbeb; }
            .op-import-card.safe-mode:hover { border-color: #fcd34d; background: #fef3c7; }
            .op-import-card.safe-mode:has(input:checked) { border-color: #f59e0b; background: #fef3c7; }

            /* Header Row */
            .op-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }

            .op-import-card input[type="radio"] {
                width: 16px; height: 16px; margin: 0; cursor: pointer; accent-color: #0ea5e9; flex-shrink: 0;
            }
            .op-import-card.safe-mode input[type="radio"] { accent-color: #d97706; }

            .op-import-icon {
                display: flex; align-items: center; justify-content: center;
                width: 28px; height: 28px; border-radius: 6px; font-size: 13px; flex-shrink: 0;
            }
            .icon-edit { background: #e0f2fe; color: #0284c7; }
            .icon-safe { background: #fef3c7; color: #d97706; }

            .op-import-title { font-weight: 600; font-size: 13px; color: #0f172a; line-height: 1.2; }
            .title-safe { color: #92400e; }

            /* Description that wraps safely */
            .op-import-desc { 
                font-size: 11.5px; 
                color: #64748b; 
                line-height: 1.4; 
                margin-left: 24px; 
                display: block;
                white-space: normal; /* Forces text to wrap instead of pushing out the side */
            }
            .desc-safe { color: #92400e; }

            /* Fluid Buttons */
            .op-import-actions { display: flex; gap: 8px; margin-top: 15px; width: 100%; box-sizing: border-box; }
            .op-btn {
                flex: 1; padding: 8px 0; border-radius: 6px; font-weight: 600; font-size: 12.5px;
                cursor: pointer; transition: all 0.2s; border: none; outline: none; text-align: center;
            }
            .op-btn-cancel { background: #f1f5f9; color: #475569; }
            .op-btn-cancel:hover { background: #e2e8f0; color: #0f172a; }
            .op-btn-start { background: #0ea5e9; color: white; }
            .op-btn-start:hover { background: #0284c7; }
        </style>

        <div class="op-import-modal">
            <p>Select how to process this document:</p>

            <label class="op-import-card">
                <div class="op-card-header">
                    <input type="radio" name="importMode" id="mode-editable" value="editable" checked>
                    <div class="op-import-icon icon-edit"><i class="fas fa-file-signature"></i></div>
                    <span class="op-import-title">Editable Text Mode</span>
                </div>
                <span class="op-import-desc">Extracts text and layout. Best for standard files that you need to edit.</span>
            </label>

            <label class="op-import-card safe-mode">
                <div class="op-card-header">
                    <input type="radio" name="importMode" id="mode-image" value="image">
                    <div class="op-import-icon icon-safe"><i class="fas fa-file-image"></i></div>
                    <span class="op-import-title title-safe">Flattened Image Mode</span>
                </div>
                <span class="op-import-desc desc-safe">Converts the document to a high-res, uneditable image. 100% accurate layout.</span>
            </label>

            <div class="op-import-actions">
                <button id="btn-cancel-import" class="op-btn op-btn-cancel">Cancel</button>
                <button id="btn-start-import" class="op-btn op-btn-start"><i class="fas fa-cloud-upload-alt" style="margin-right:6px;"></i>Start</button>
            </div>
        </div>
    `;

    DialogSystem.show('Import Options', promptHtml, null, true);
    
    // Safely expand the physical dialog window so our new cards fit perfectly!
    setTimeout(() => {
        const dialogContent = document.getElementById('custom-dialog-content');
        if (dialogContent && dialogContent.parentElement) {
            dialogContent.parentElement.style.width = '520px';
            dialogContent.parentElement.style.maxWidth = '95vw';
        }
    }, 10);    
    // Hide the default confirm button so we can use our custom ones
    const defaultConfirm = document.getElementById('custom-dialog-confirm');
    if (defaultConfirm) defaultConfirm.style.display = 'none';

    // Bind Cancel Button
    document.getElementById('btn-cancel-import').onclick = () => {
        DialogSystem.close();
    };

    // Bind Start Button
    document.getElementById('btn-start-import').onclick = () => {
        // Lock in the user's choice BEFORE the server is ever contacted!
        const isImageMode = document.getElementById('mode-image').checked;
        
        // --- 2. THE PROGRESS BAR ---
        // Swap the UI to the progress bar now that the choice is made
        const progressHtml = `
            <div style="text-align:center; padding: 10px;">
                <p id="convert-status" style="margin-bottom:15px; font-weight:bold;">Processing Document...</p>
                <div style="width:100%; background:#eee; border-radius:10px; overflow:hidden; height:10px;">
                    <div id="convert-progress" style="width:0%; height:100%; background:var(--selection); transition: width 0.3s;"></div>
                </div>
            </div>
        `;
        
        // CRASH FIX: Safely redraw the entire dialog using the native system
        DialogSystem.show('Processing Document...', progressHtml, null, true);
        const newConfirm = document.getElementById('custom-dialog-confirm');
        if (newConfirm) newConfirm.style.display = 'none';

        // --- 3. EXECUTE CONVERSION ---
        const formData = new FormData();
        formData.append('docFile', file); 

        const xhr = new XMLHttpRequest();
        const docEndpoint = window.OPENPUB_SERVER_URL
            ? `${window.OPENPUB_SERVER_URL.replace(/\/$/, '')}/api/convert-doc`
            : 'https://buy-abraham-birth-future.trycloudflare.com/api/convert-doc';
        xhr.open('POST', docEndpoint, true); 

        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 40; 
                const progressBar = document.getElementById('convert-progress');
                if (progressBar) progressBar.style.width = percentComplete + '%';
                
                if (percentComplete >= 40) {
                    const statusText = document.getElementById('convert-status');
                    if (statusText) statusText.innerText = "Generating the layout...";
                    
                    let fakeProgress = 40;
                    window.convertInterval = setInterval(() => {
                        if(fakeProgress < 75) {
                            fakeProgress += 1;
                            const pb = document.getElementById('convert-progress');
                            if (pb) pb.style.width = fakeProgress + '%';
                        }
                    }, 800);
                }
            }
        };

        xhr.onload = async function() {
            clearInterval(window.convertInterval);
            
            if (xhr.status === 200) {
                const pb = document.getElementById('convert-progress');
                if (pb) pb.style.width = '85%';
                const statusText = document.getElementById('convert-status');
                if (statusText) statusText.innerText = "Processing Mapping...";
                
                try {
                    const data = JSON.parse(xhr.responseText);
                    
                    const binaryString = window.atob(data.pdfData);
                    const binaryLen = binaryString.length;
                    const bytes = new Uint8Array(binaryLen);
                    for (let i = 0; i < binaryLen; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }

                    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
                    let opPages = [];

                    let hasImages = false;
                    const ops = pdfjsLib.OPS || { paintJpegXObject: 82, paintImageXObject: 85, paintImageMaskXObject: 83 };
                    const imageOps = [ops.paintJpegXObject, ops.paintImageXObject, ops.paintImageMaskXObject];

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const opList = await page.getOperatorList();
                        if (opList.fnArray.some(op => imageOps.includes(op))) {
                            hasImages = true;
                            break; 
                        }
                    }

                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const viewport = page.getViewport({ scale: 1.0 });
                        const ratio = 96 / 72;
                        
                        const pageWidth = Math.round(viewport.width * ratio);
                        const pageHeight = Math.round(viewport.height * ratio);

                        let elements = [];
                        let zIndexCounter = 10;
                        
                        // ==========================================
                        // THE FORK IN THE ROAD (IMAGE vs EDITABLE)
                        // ==========================================
                        if (isImageMode) {
                            // OPTION A: FLATTENED IMAGE MODE
                            const status = document.getElementById('convert-status');
                            if (status) status.innerText = `Rendering High-Res Image (Page ${pageNum})...`;
                            
                            const viewportImg = page.getViewport({ scale: 2.5 }); 
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            canvas.width = viewportImg.width; canvas.height = viewportImg.height;
                            await page.render({ canvasContext: ctx, viewport: viewportImg }).promise;
                            
                            const imgDataUrl = canvas.toDataURL('image/jpeg', 0.95);

                            elements.push({
                                left: "0px", top: "0px", width: "100%", height: "100%",
                                transform: "none", zIndex: "1", type: "box", 
                                innerHTML: "", imgSrc: imgDataUrl, clipPath: "", bg: "", cropMode: false,
                                imgStyle: { width: "100%", height: "100%", position: "absolute", pointerEvents: "none" },
                                scaleX: "1", scaleY: "1"
                            });

                        } else {
                            // OPTION B: EDITABLE TEXT MODE (OVERHAULED V2 PIPELINE)
                            const status = document.getElementById('convert-status');
                            if (status) status.innerText = `Extracting Editable Text (Page ${pageNum})...`;

                            const pageResult = await window.OpenPubImporter.processPdfPage(page, pageNum, {
                                isPublisher: false,
                                hasImages,
                                structuredPage: (data.structuredPages && data.structuredPages[pageNum - 1]) || null
                            });
                            elements = pageResult.elements;
                        }

                        opPages.push({
                            id: Date.now() + pageNum,
                            width: `${pageWidth}px`, height: `${pageHeight}px`,
                            background: "#ffffff", elements: elements,
                            header: "", footer: "", borderStyle: "none", thumb: ""
                        });
                    }

                    const pb = document.getElementById('convert-progress');
                    if (pb) pb.style.width = '100%';
                    setTimeout(() => {
                        document.getElementById('doc-title').innerText = data.title;
                        state.pages = opPages;
                        state.history = [];
                        state.historyIndex = -1;
                        state.currentPageIndex = 0;
                        renderPage(state.pages[0]);
                        
                        updateSidebar();
                        if(typeof updateThumbnails === 'function') updateThumbnails();
                        if(typeof pushHistory === 'function') pushHistory(); 
                        
                        DialogSystem.close(); 
                    }, 500);

                } catch(err) {
                    console.error(err);
                    DialogSystem.close();
                    DialogSystem.alert('Error', "Failed to assemble layout from the Word document, if you are using CodePen, switch to https://openpublisher.app for pub, doc and docx support..");
                }
            } else {
                DialogSystem.close();
                DialogSystem.alert('Error', "I dont understand, I cannot process this Word file.");
            }
        };

        xhr.onerror = function() {
            clearInterval(window.convertInterval);
            DialogSystem.close();
            DialogSystem.alert('Error', "Could not reach the conversion server via cloudflare.");
        };

        xhr.send(formData);
    };
}

function uploadAndConvertExcel(file, fileName) {
    const isModern = fileName.endsWith('.xlsx');
    
    // --- 1. THE PRE-FLIGHT MENU ---
    const promptHtml = `
        <style>
            .op-import-modal { font-family: 'Segoe UI', sans-serif; color: #334155; width: 100%; box-sizing: border-box; }
            .op-import-modal p { margin-top: 0; font-size: 13px; margin-bottom: 12px; font-weight: 500; }
            .op-import-card { display: block; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s ease; background: #ffffff; width: 100%; box-sizing: border-box; }
            .op-import-card:hover { border-color: #94a3b8; background: #f8fafc; }
            .op-import-card:has(input:checked) { border-color: #0ea5e9; background: #f0f9ff; }
            .op-import-card.safe-mode { border-color: #fde68a; background: #fffbeb; }
            .op-import-card.safe-mode:hover { border-color: #fcd34d; background: #fef3c7; }
            .op-import-card.safe-mode:has(input:checked) { border-color: #f59e0b; background: #fef3c7; }
            .op-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
            .op-import-card input[type="radio"] { width: 16px; height: 16px; margin: 0; cursor: pointer; accent-color: #0ea5e9; }
            .op-import-card.safe-mode input[type="radio"] { accent-color: #d97706; }
            .op-import-icon { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; font-size: 13px; }
            .icon-edit { background: #e0f2fe; color: #0284c7; }
            .icon-safe { background: #fef3c7; color: #d97706; }
            .op-import-title { font-weight: 600; font-size: 13px; color: #0f172a; }
            .title-safe { color: #92400e; }
            .op-import-desc { font-size: 11.5px; color: #64748b; line-height: 1.4; margin-left: 24px; display: block; white-space: normal; }
            .desc-safe { color: #92400e; }
            .op-import-actions { display: flex; gap: 8px; margin-top: 15px; width: 100%; box-sizing: border-box; }
            .op-btn { flex: 1; padding: 8px 0; border-radius: 6px; font-weight: 600; font-size: 12.5px; cursor: pointer; transition: all 0.2s; border: none; text-align: center; }
            .op-btn-cancel { background: #f1f5f9; color: #475569; }
            .op-btn-cancel:hover { background: #e2e8f0; color: #0f172a; }
            .op-btn-start { background: #0ea5e9; color: white; }
            .op-btn-start:hover { background: #0284c7; }
        </style>

        <div class="op-import-modal">
            <p>Select how to process this Spreadsheet file:</p>
            <label class="op-import-card" style="${!isModern ? 'opacity: 0.5; pointer-events: none;' : ''}">
                <div class="op-card-header">
                    <input type="radio" name="importModeExcel" id="mode-styled-excel" value="styled" ${isModern ? 'checked' : 'disabled'}>
                    <div class="op-import-icon icon-edit"><i class="fas fa-palette"></i></div>
                    <span class="op-import-title">Styled Data Mode (ExcelJS)</span>
                </div>
                <span class="op-import-desc">Retains cell colors, font formatting, and alignments. Best for styled reports. ${!isModern ? '<br><b>(Requires .xlsx format)</b>' : ''}</span>
            </label>

            <label class="op-import-card safe-mode">
                <div class="op-card-header">
                    <input type="radio" name="importModeExcel" id="mode-raw-excel" value="raw" ${!isModern ? 'checked' : ''}>
                    <div class="op-import-icon icon-safe"><i class="fas fa-table"></i></div>
                    <span class="op-import-title title-safe">Raw Data Mode (SheetJS)</span>
                </div>
                <span class="op-import-desc desc-safe">Extracts only the raw text and structure. Best for large or overly-complex files.</span>
            </label>

            <div class="op-import-actions">
                <button id="btn-cancel-excel" class="op-btn op-btn-cancel">Cancel</button>
                <button id="btn-start-excel" class="op-btn op-btn-start"><i class="fas fa-cloud-upload-alt" style="margin-right:6px;"></i>Start</button>
            </div>
        </div>
    `;

    DialogSystem.show('Import Spreadsheet', promptHtml, null, true);
    
    setTimeout(() => {
        const dialogContent = document.getElementById('custom-dialog-content');
        if (dialogContent && dialogContent.parentElement) {
            dialogContent.parentElement.style.width = '520px';
            dialogContent.parentElement.style.maxWidth = '95vw';
        }
    }, 10);    
    
    const defaultConfirm = document.getElementById('custom-dialog-confirm');
    const defaultCancel = document.getElementById('custom-dialog-cancel');
    if (defaultConfirm) defaultConfirm.style.display = 'none';
    if (defaultCancel) defaultCancel.style.display = 'none';

    document.getElementById('btn-cancel-excel').onclick = () => DialogSystem.close();

    document.getElementById('btn-start-excel').onclick = () => {
        const mode = document.getElementById('mode-styled-excel').checked ? 'styled' : 'raw';
        DialogSystem.close();
        
        // Execute extraction
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const buffer = evt.target.result;
                let tableHTML = '';
                
                // Use ExcelJS for modern .xlsx files (retains colors & styles)
                if (mode === 'styled' && typeof ExcelJS !== 'undefined') {
                    const workbook = new ExcelJS.Workbook();
                    await workbook.xlsx.load(buffer);
                    const worksheet = workbook.worksheets[0];
                    
                    let html = '<table style="width: 100%; border-collapse: collapse; font-family: inherit; font-size: 12px;">';
                    
                    worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
                        html += '<tr>';
                        row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
                            let cellStyle = 'border: 1px solid #cbd5e1; padding: 4px 8px;';
                            
                            // Background color
                            if (cell.fill && cell.fill.type === 'pattern' && cell.fill.fgColor && cell.fill.fgColor.argb) {
                                let argb = cell.fill.fgColor.argb;
                                if (argb.length === 8) {
                                    const a = parseInt(argb.substring(0, 2), 16) / 255;
                                    const r = parseInt(argb.substring(2, 4), 16);
                                    const g = parseInt(argb.substring(4, 6), 16);
                                    const b = parseInt(argb.substring(6, 8), 16);
                                    cellStyle += `background-color: rgba(${r},${g},${b},${a});`;
                                } else {
                                    cellStyle += `background-color: #${argb};`;
                                }
                            }
                            
                            // Font color & weight
                            if (cell.font) {
                                if (cell.font.color && cell.font.color.argb) {
                                    let argb = cell.font.color.argb;
                                    if (argb.length === 8) {
                                        cellStyle += `color: #${argb.substring(2)};`;
                                    } else {
                                        cellStyle += `color: #${argb};`;
                                    }
                                }
                                if (cell.font.bold) cellStyle += 'font-weight: bold;';
                                if (cell.font.italic) cellStyle += 'font-style: italic;';
                            }
                            
                            // Alignment
                            if (cell.alignment) {
                                if (cell.alignment.horizontal) cellStyle += `text-align: ${cell.alignment.horizontal};`;
                                if (cell.alignment.vertical) cellStyle += `vertical-align: ${cell.alignment.vertical};`;
                            }
                            
                            const cellValue = cell.text || cell.value || '';
                            html += `<td style="${cellStyle}" contenteditable="true">${cellValue}</td>`;
                        });
                        html += '</tr>';
                    });
                    html += '</table>';
                    tableHTML = html;
                } 
                // Fallback to SheetJS for raw data
                else if (typeof XLSX !== 'undefined') {
                    const data = new Uint8Array(buffer);
                    const workbook = XLSX.read(data, {type: 'array'});
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    let rawHtml = XLSX.utils.sheet_to_html(worksheet, { editable: true });
                    
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(rawHtml, 'text/html');
                    const table = doc.querySelector('table');
                    if (!table) throw new Error("No table found in spreadsheet");
                    
                    table.style.width = '100%';
                    table.style.borderCollapse = 'collapse';
                    table.style.fontFamily = 'inherit';
                    table.style.fontSize = '12px';
                    
                    const tds = table.querySelectorAll('td, th');
                    tds.forEach(td => {
                        td.style.border = '1px solid #cbd5e1';
                        td.style.padding = '4px 8px';
                        td.setAttribute('contenteditable', 'true');
                    });
                    tableHTML = table.outerHTML;
                } else {
                    if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Error', "Excel parsing libraries not loaded.");
                    return;
                }
                
                if (typeof createWrapper === 'function' && tableHTML) {
                    const wrapper = createWrapper(tableHTML);
                    wrapper.setAttribute('data-type', 'table');
                    const tbl = wrapper.querySelector('table');
                    if(tbl) {
                        const clone = tbl.cloneNode(true);
                        clone.style.position = 'absolute'; clone.style.visibility = 'hidden';
                        clone.style.width = 'max-content'; clone.style.height = 'max-content';
                        clone.style.maxWidth = 'none'; clone.style.maxHeight = 'none';
                        document.body.appendChild(clone);
                        
                        const h = clone.offsetHeight;
                        
                        document.body.removeChild(clone);
                        
                        wrapper.style.width = '500px';
                        wrapper.style.height = (h + 10) + 'px';
                    } else {
                        wrapper.style.width = '500px';
                        wrapper.style.height = '300px';
                    }
                    if(typeof state !== 'undefined' && state.history && state.history.length > 0) {
                        state.history.pop();
                        state.historyIndex--;
                        if(typeof pushHistory === 'function') pushHistory();
                    }
                }
            } catch(err) {
                if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Error', "Error parsing spreadsheet: " + err);
            }
        };
        reader.readAsArrayBuffer(file);
    };
}

/* =========================================================================
   MICROSOFT PUBLISHER (.PUB) & PDF LAYOUT RECONSTRUCTION ENGINE (V2)
   ========================================================================= */
window.OpenPubImporter = (function() {
    const PUA_SYMBOL_MAP = {
        '\uF0FF': '⊞', '\uE000': '⊞', '\uE782': '⊞', '\uF8FF': '⊞',
        '\uF021': '✁', '\uF022': '“', '\uF028': '☎', '\uF029': '✆',
        '\uF02A': '✉', '\uF03C': '💾', '\uF04A': '☺', '\uF04B': '😐',
        '\uF04C': '☹', '\uF050': '✈', '\uF052': '☀', '\uF054': '❄',
        '\uF06C': '●', '\uF06D': '❍', '\uF06E': '■', '\uF06F': '□',
        '\uF071': '❑', '\uF072': '❒', '\uF073': '⧫', '\uF074': '◆',
        '\uF075': '❖', '\uF076': '➢', '\uF077': '♦', '\uF091': '‘',
        '\uF092': '’', '\uF093': '“', '\uF094': '”', '\uF096': '-',
        '\uF097': '-', '\uF09F': '•', '\uF0A7': '▪', '\uF0A8': '▫',
        '\uF0B7': '•', '\uF0D8': '➢', '\uF0DC': '➔', '\uF0E0': '➡',
        '\uF0E8': '➔', '\uF0F0': '⇨', '\uF0FC': '✔', '\uF0FD': '☒',
        '\uF0FE': '☑'
    };

    // Clean inline SVG data URL for the Windows key icon when used inline
    const WINDOWS_KEY_SVG_DATA_URL = "data:image/svg+xml;utf8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">' +
        '<path fill="#181818" d="M2 5.2L12.5 3.6v9.5H2V5.2zm12.2-1.9L26 1.5v11.6H14.2V3.3zM2 14.8h10.5v9.6L2 22.8v-8zm12.2 0H26v11.7l-11.8-1.8v-9.9z"/>' +
        '</svg>'
    );

    function mapPublisherFont(rawName, isPublisher = true) {
        if (!rawName) {
            return isPublisher ? "'Calibri', 'Segoe UI', Arial, sans-serif" : "Arial, Helvetica, sans-serif";
        }
        const cleaned = String(rawName)
            .replace(/^[A-Z]{6}\+/, '')
            .replace(/[-_](Bold|Italic|Oblique|Regular|Roman|Medium|Light|Heavy|Black|PSMT|MT)+/gi, '')
            .trim()
            .toLowerCase();

        if (cleaned.includes('calibri') || cleaned.includes('carlito')) {
            return "'Calibri', 'Carlito', 'Segoe UI', Arial, sans-serif";
        }
        if (cleaned.includes('cambria') || cleaned.includes('caladea')) {
            return "'Cambria', 'Caladea', Georgia, 'Times New Roman', serif";
        }
        if (cleaned.includes('segoe')) {
            return "'Segoe UI', 'Calibri', Arial, sans-serif";
        }
        if (cleaned.includes('tahoma')) {
            return "'Tahoma', 'Geneva', 'Segoe UI', sans-serif";
        }
        if (cleaned.includes('verdana')) {
            return "'Verdana', 'Tahoma', Geneva, sans-serif";
        }
        if (cleaned.includes('franklin')) {
            return "'Franklin Gothic Medium', 'Franklin Gothic', 'Arial Narrow', Arial, sans-serif";
        }
        if (cleaned.includes('trebuchet')) {
            return "'Trebuchet MS', 'Segoe UI', Arial, sans-serif";
        }
        if (cleaned.includes('century gothic') || cleaned.includes('futura')) {
            return "'Century Gothic', 'Futura', 'Segoe UI', sans-serif";
        }
        if (cleaned.includes('gill')) {
            return "'Gill Sans', 'Gill Sans MT', 'Calibri', sans-serif";
        }
        if (cleaned.includes('garamond')) {
            return "'Garamond', Georgia, 'Times New Roman', serif";
        }
        if (cleaned.includes('palatino') || cleaned.includes('antiqua')) {
            return "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif";
        }
        if (cleaned.includes('georgia')) {
            return "Georgia, 'Cambria', 'Times New Roman', serif";
        }
        if (cleaned.includes('times') || cleaned.includes('liberation serif') || cleaned.includes('dejavu serif')) {
            return "'Times New Roman', Times, Georgia, serif";
        }
        if (cleaned.includes('consolas') || cleaned.includes('courier') || cleaned.includes('mono') || cleaned.includes('lucida console')) {
            return "'Consolas', 'Courier New', monospace";
        }
        if (cleaned.includes('impact') || cleaned.includes('haettenschweiler')) {
            return "Impact, 'Arial Black', sans-serif";
        }
        if (cleaned.includes('comic')) {
            return "'Comic Sans MS', cursive, sans-serif";
        }
        if (isPublisher && (cleaned.includes('dejavu sans') || cleaned.includes('liberation sans') || cleaned === 'sans-serif')) {
            return "'Calibri', 'Segoe UI', Arial, sans-serif";
        }
        return "'Calibri', 'Segoe UI', Arial, sans-serif";
    }

    function sanitizePublisherText(str, fontName = '') {
        if (!str) return '';
        let out = String(str);
        out = out.replace(/[\uE000-\uF8FF]/g, (ch) => {
            if (PUA_SYMBOL_MAP[ch]) return PUA_SYMBOL_MAP[ch];
            const code = ch.charCodeAt(0);
            if (code >= 0xF020 && code <= 0xF07E) {
                const lowerFont = (fontName || '').toLowerCase();
                if (!lowerFont.includes('wingding') && !lowerFont.includes('webding') && !lowerFont.includes('symbol')) {
                    return String.fromCharCode(code - 0xF000);
                }
            }
            return '⊞';
        });
        // Repair corrupted replacement character quotes around words (e.g. \uFFFDDuplicate\uFFFD -> “Duplicate”)
        out = out.replace(/\uFFFD([^\uFFFD]+)\uFFFD/g, '“$1”');
        out = out.replace(/^\uFFFD/, '“').replace(/\uFFFD$/, '”');
        return out;
    }

    function parseRgbLuminance(colorStr) {
        if (!colorStr) return 0;
        const m = String(colorStr).match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (m) {
            return 0.299 * Number(m[1]) + 0.587 * Number(m[2]) + 0.114 * Number(m[3]);
        }
        if (String(colorStr).startsWith('#')) {
            let hex = String(colorStr).slice(1);
            if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            const r = parseInt(hex.slice(0, 2), 16) || 0;
            const g = parseInt(hex.slice(2, 4), 16) || 0;
            const b = parseInt(hex.slice(4, 6), 16) || 0;
            return 0.299 * r + 0.587 * g + 0.114 * b;
        }
        return 0;
    }

    /**
     * Phase 2: Deduplicate cloned/offset shadow text layers into native CSS text-shadow.
     * Never keeps duplicate DOM text nodes for shadows.
     */
    function deduplicateAndExtractShadows(rawItems) {
        if (!Array.isArray(rawItems) || rawItems.length === 0) return [];
        const items = rawItems.map((it, idx) => ({ ...it, _origIdx: idx }));
        const consumed = new Set();
        const result = [];

        const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

        for (let i = 0; i < items.length; i++) {
            if (consumed.has(i)) continue;
            let primary = { ...items[i] };
            const strA = norm(primary.str);
            if (!strA) continue;

            for (let j = i + 1; j < items.length; j++) {
                if (consumed.has(j)) continue;
                const candidate = items[j];
                const strB = norm(candidate.str);
                if (!strB) continue;

                const sameOrSubstring = (strA === strB) ||
                    (strA.length > 3 && strB.length > 3 && (strA.includes(strB) || strB.includes(strA)));
                if (!sameOrSubstring) continue;

                const fontSize = Math.max(primary.fontSize || 16, candidate.fontSize || 16);
                if (Math.abs((primary.fontSize || 16) - (candidate.fontSize || 16)) > fontSize * 0.2) continue;

                const dx = candidate.tx - primary.tx;
                const dy = candidate.ty - primary.ty;
                const dist = Math.hypot(dx, dy);

                if (dist <= Math.max(10, fontSize * 0.5)) {
                    consumed.add(j);
                    if (dist < 0.45) {
                        // Synthetic faux-bold offset
                        if (dist > 0.08) primary.isBold = true;
                        if (candidate.isBold) primary.isBold = true;
                        if (candidate.isItalic) primary.isItalic = true;
                        if (candidate.str.length > primary.str.length) {
                            primary.str = candidate.str;
                            primary.width = candidate.width;
                        }
                    } else if (strA === strB) {
                        // True drop-shadow layer pair!
                        // Determine which node is the shadow vs foreground:
                        // Higher luminance (lighter grey) or earlier painter index when shifted down/right
                        const lumA = parseRgbLuminance(primary.color);
                        const lumB = parseRgbLuminance(candidate.color);
                        let fg = primary;
                        let sh = candidate;
                        if (Math.abs(lumA - lumB) > 15) {
                            fg = lumA < lumB ? primary : candidate;
                            sh = lumA < lumB ? candidate : primary;
                        } else {
                            // In painter's order, item painted second (candidate) sits on top of item painted first (primary)
                            fg = candidate;
                            sh = primary;
                        }
                        const offX = sh.tx - fg.tx;
                        const offY = sh.ty - fg.ty;
                        const sColor = sh.color && sh.color !== 'black' ? sh.color : 'rgba(0, 0, 0, 0.35)';
                        primary = {
                            ...fg,
                            isBold: Boolean(fg.isBold || sh.isBold),
                            isItalic: Boolean(fg.isItalic || sh.isItalic),
                            textShadow: `${offX.toFixed(1)}px ${offY.toFixed(1)}px 2px ${sColor}`
                        };
                    }
                }
            }
            result.push(primary);
        }
        return result;
    }

    /**
     * Crop a clean icon or graphic region from a rendered canvas and make near-white background transparent.
     */
    function cropIconDataUrl(sourceCanvas, x0, y0, x1, y1, makeWhiteTransparent = true) {
        const w = Math.max(1, Math.round(x1 - x0));
        const h = Math.max(1, Math.round(y1 - y0));
        const outCanvas = document.createElement('canvas');
        outCanvas.width = w;
        outCanvas.height = h;
        const outCtx = outCanvas.getContext('2d');
        outCtx.drawImage(sourceCanvas, Math.round(x0), Math.round(y0), w, h, 0, 0, w, h);
        if (makeWhiteTransparent) {
            const imgData = outCtx.getImageData(0, 0, w, h);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
                if (d[i] > 235 && d[i + 1] > 235 && d[i + 2] > 235) {
                    d[i + 3] = 0;
                }
            }
            outCtx.putImageData(imgData, 0, 0);
        }
        return outCanvas.toDataURL('image/png');
    }

    /**
     * Detect inline key icon graphic just to the left of a "+ K" or "+ P" text item on a rendered canvas.
     */
    function findInlineKeyIcon(canvas, imgData, item, scale) {
        if (!canvas || !imgData || !/^\+\s*[A-Z0-9]/i.test(item.str.trim())) return null;
        const cw = canvas.width;
        const ch = canvas.height;
        const data = imgData.data;

        const searchLeftPx = Math.max(0, Math.floor((item.tx - item.fontSize * 1.15) * scale));
        const searchRightPx = Math.min(cw - 1, Math.floor((item.tx - 3) * scale));
        const topPageY = item.top !== undefined ? item.top : (item.ty - item.fontSize * 0.85);
        const searchTopPx = Math.max(0, Math.floor((topPageY + item.fontSize * 0.15) * scale));
        const searchBotPx = Math.min(ch - 1, Math.floor((topPageY + item.fontSize * 1.05) * scale));

        // Scan from right to left (closest to '+ K' / '+ P') to isolate the icon cluster
        // without accidentally picking up text letters further to the left (like "li" in "Duplicate")
        let maxX = -1, minX = cw, minY = ch, maxY = -1;
        let emptyColsAfterCluster = 0;

        for (let x = searchRightPx; x >= searchLeftPx; x--) {
            let colHasDark = false;
            for (let y = searchTopPx; y <= searchBotPx; y++) {
                const idx = (y * cw + x) * 4;
                const lum = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                if (lum < 200) {
                    colHasDark = true;
                    if (x > maxX) maxX = x;
                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
            if (!colHasDark && maxX !== -1) {
                emptyColsAfterCluster++;
                // Allow the narrow white vertical cross-gap inside the 4-pane Windows logo (up to 4px),
                // but stop once we hit the wider white space to the left of the Windows logo!
                if (emptyColsAfterCluster > Math.ceil(4 * scale)) {
                    break;
                }
            } else if (colHasDark) {
                emptyColsAfterCluster = 0;
            }
        }

        if (maxX === -1 || (maxX - minX) < 4 || (maxY - minY) < 6) return null;
        const pad = Math.ceil(2 * scale);
        const dataUrl = cropIconDataUrl(
            canvas,
            Math.max(0, minX - pad),
            Math.max(0, minY - pad),
            Math.min(cw, maxX + pad + 1),
            Math.min(ch, maxY + pad + 1),
            true
        );
        return {
            dataUrl,
            left: minX / scale,
            top: minY / scale,
            width: (maxX - minX + 1) / scale,
            height: (maxY - minY + 1) / scale
        };
    }

    function eraseRegionsFromCanvas(canvas, ctx, imgData, regions, scale) {
        if (!canvas || !ctx || !imgData || !Array.isArray(regions) || regions.length === 0) return;
        const cw = canvas.width;
        const ch = canvas.height;
        const data = imgData.data;

        regions.forEach(reg => {
            const x0 = Math.max(0, Math.floor((reg.left - 3) * scale));
            const x1 = Math.min(cw - 1, Math.ceil((reg.left + reg.width + 4) * scale));
            const y0 = Math.max(0, Math.floor((reg.top - 2) * scale));
            const y1 = Math.min(ch - 1, Math.ceil((reg.top + reg.height + 3) * scale));
            if (x1 <= x0 || y1 <= y0) return;

            const yTop = Math.max(0, y0 - 2);
            const yBot = Math.min(ch - 1, y1 + 2);
            let whiteSamples = 0;
            let totalSamples = 0;
            let sumBgR = 0, sumBgG = 0, sumBgB = 0;

            for (let x = x0; x <= x1; x += 2) {
                const idxT = (yTop * cw + x) * 4;
                const idxB = (yBot * cw + x) * 4;
                if (data[idxT] > 238 && data[idxT + 1] > 238 && data[idxT + 2] > 238) whiteSamples++;
                if (data[idxB] > 238 && data[idxB + 1] > 238 && data[idxB + 2] > 238) whiteSamples++;
                sumBgR += data[idxT] + data[idxB];
                sumBgG += data[idxT + 1] + data[idxB + 1];
                sumBgB += data[idxT + 2] + data[idxB + 2];
                totalSamples += 2;
            }

            const isMostlyWhiteBg = totalSamples > 0 && (whiteSamples / totalSamples) >= 0.78;
            if (isMostlyWhiteBg) {
                for (let y = y0; y <= y1; y++) {
                    let rowIdx = (y * cw + x0) * 4;
                    for (let x = x0; x <= x1; x++) {
                        data[rowIdx] = 255;
                        data[rowIdx + 1] = 255;
                        data[rowIdx + 2] = 255;
                        data[rowIdx + 3] = 255;
                        rowIdx += 4;
                    }
                }
            } else if (reg.inkRGB) {
                const bgR = Math.round(reg.bgRGB ? reg.bgRGB[0] : (sumBgR / Math.max(1, totalSamples)));
                const bgG = Math.round(reg.bgRGB ? reg.bgRGB[1] : (sumBgG / Math.max(1, totalSamples)));
                const bgB = Math.round(reg.bgRGB ? reg.bgRGB[2] : (sumBgB / Math.max(1, totalSamples)));
                const [inkR, inkG, inkB] = reg.inkRGB;

                for (let y = y0; y <= y1; y++) {
                    let rowIdx = (y * cw + x0) * 4;
                    for (let x = x0; x <= x1; x++) {
                        const r = data[rowIdx], g = data[rowIdx + 1], b = data[rowIdx + 2];
                        const distInk = Math.abs(r - inkR) + Math.abs(g - inkG) + Math.abs(b - inkB);
                        const distBg = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
                        if (distInk < 95 && distInk < distBg) {
                            data[rowIdx] = bgR;
                            data[rowIdx + 1] = bgG;
                            data[rowIdx + 2] = bgB;
                        }
                        rowIdx += 4;
                    }
                }
            }
        });

        ctx.putImageData(imgData, 0, 0);
    }

    /**
     * Phase 3: Reconstruct lines, inline spans, callouts, and paragraph alignments,
     * and resolve libmspub font-substitution collisions.
     */
    function reconstructPublisherElements(rawItems, options = {}) {
        const pageWidth = options.pageWidth || 816;
        const pageHeight = options.pageHeight || 1056;
        const sourceCanvas = options.sourceCanvas || null;
        const sourceImgData = options.sourceImgData || null;
        const canvasScale = options.canvasScale || 1.5;
        const isPublisher = options.isPublisher !== false;
        const erasedRegionsOut = Array.isArray(options.erasedRegionsOut) ? options.erasedRegionsOut : [];

        // 1. Sanitize text and map fonts
        const sanitized = rawItems.map(it => {
            const cleanStr = sanitizePublisherText(it.str, it.fontFamily);
            const mappedFont = mapPublisherFont(it.fontFamily, isPublisher);
            const top = it.top !== undefined ? it.top : (it.ty - it.fontSize * 0.85);
            const height = it.height !== undefined ? it.height : (it.fontSize * 1.2);
            return {
                ...it,
                str: cleanStr,
                fontFamily: mappedFont,
                left: it.tx,
                top,
                width: it.width,
                height
            };
        }).filter(it => it.str && it.str.trim());

        // 2. Deduplicate shadow layers into native CSS text-shadow
        const deduped = deduplicateAndExtractShadows(sanitized);

        // 3. Extract inline key icons for "+ K" / "+ P" items if sourceCanvas is available,
        // or attach clean Windows key SVG icon
        const hasShortcutKeys = deduped.some(it => /^\+\s*[A-Z0-9]$/i.test(it.str.trim()));
        deduped.forEach(it => {
            if (/^\+\s*[A-Z0-9]$/i.test(it.str.trim())) {
                const cropped = findInlineKeyIcon(sourceCanvas, sourceImgData, it, canvasScale);
                it.inlineIconUrl = (cropped && cropped.dataUrl) ? cropped.dataUrl : WINDOWS_KEY_SVG_DATA_URL;
                if (cropped) {
                    erasedRegionsOut.push({
                        left: cropped.left - 2,
                        top: cropped.top - 2,
                        width: cropped.width + 4,
                        height: cropped.height + 4
                    });
                }
                erasedRegionsOut.push({
                    left: it.tx - it.fontSize * 1.25,
                    top: it.top - 2,
                    width: it.fontSize * 1.25,
                    height: it.height + 4
                });
            }
        });

        // 4. Merge multi-line side callouts that share the same left X and non-black color
        // ONLY on shortcut-key sheets (e.g. "TV name:" + "HRCONF" or "TV name: Conf" + "4")
        const mergedCallouts = [];
        const usedCalloutIdx = new Set();
        deduped.sort((a, b) => a.top - b.top || a.left - b.left);

        for (let i = 0; i < deduped.length; i++) {
            if (usedCalloutIdx.has(i)) continue;
            const curr = { ...deduped[i] };

            const isSideCallout = hasShortcutKeys && curr.left > pageWidth * 0.55 && curr.width < pageWidth * 0.4;
            if (isSideCallout) {
                for (let j = i + 1; j < deduped.length; j++) {
                    if (usedCalloutIdx.has(j)) continue;
                    const next = deduped[j];
                    const sameLeft = Math.abs(next.left - curr.left) < 8;
                    const verticalStep = next.top - curr.top;
                    if (sameLeft && verticalStep > 0 && verticalStep < curr.fontSize * 1.6 && next.width < pageWidth * 0.4) {
                        usedCalloutIdx.add(j);
                        curr.str = `${curr.str.trim()} ${next.str.trim()}`;
                        curr.width = Math.max(curr.width, next.width) + 25;
                    }
                }
            }
            mergedCallouts.push(curr);
        }

        // 5. Group items sharing the same horizontal baseline into lines
        const lines = [];
        const lineUsed = new Set();

        for (let i = 0; i < mergedCallouts.length; i++) {
            if (lineUsed.has(i)) continue;
            const seed = mergedCallouts[i];
            const group = [seed];
            lineUsed.add(i);

            for (let j = i + 1; j < mergedCallouts.length; j++) {
                if (lineUsed.has(j)) continue;
                const cand = mergedCallouts[j];
                const sameBaseline = Math.abs(cand.top - seed.top) < Math.min(seed.fontSize, cand.fontSize) * 0.42;
                if (!sameBaseline) continue;

                // Never merge a standalone "+ P" / "+ K" shortcut key into a quoted line like “Duplicate”
                const seedIsKey = /^\+\s*[A-Z0-9]$/i.test(seed.str.trim());
                const candIsKey = /^\+\s*[A-Z0-9]$/i.test(cand.str.trim());
                const seedIsQuoted = /^[“"‘'].*[”"’']$/.test(seed.str.trim());
                const candIsQuoted = /^[“"‘'].*[”"’']$/.test(cand.str.trim());
                if ((seedIsKey && candIsQuoted) || (candIsKey && seedIsQuoted)) continue;

                // Do not merge a side callout in a completely different color with a centered display key
                const seedIsRed = /rgb\(\s*2[0-5]\d\s*,\s*[0-6]?\d/.test(seed.color || '');
                const candIsRed = /rgb\(\s*2[0-5]\d\s*,\s*[0-6]?\d/.test(cand.color || '');
                if (seedIsRed !== candIsRed && Math.abs(seed.fontSize - cand.fontSize) > 8) continue;

                // Prevent collapsing multi-column tables/lists across wide horizontal column gaps
                // unless this is a shortcut-key instruction line with an inline key gap
                group.sort((a, b) => a.left - b.left);
                const groupRight = Math.max(...group.map(g => g.left + g.width));
                const hGap = cand.left - groupRight;
                const maxAllowedGap = hasShortcutKeys ? 210 : Math.max(seed.fontSize * 1.5, 20);
                if (hGap > maxAllowedGap) continue;

                group.push(cand);
                lineUsed.add(j);
            }

            group.sort((a, b) => a.left - b.left);
            lines.push(group);
        }

        // 6. Detect split lines with an intentional inline gap (e.g. "To mirror your screen, press" ... "and select")
        // where a floating "+ P" keystroke was vertically displaced onto the next line ("Duplicate") by libmspub!
        const consumedFloatingLines = new Set();
        if (hasShortcutKeys) {
            for (let li = 0; li < lines.length; li++) {
                const grp = lines[li];
                if (grp.length === 2) {
                    const leftPart = grp[0];
                    const rightPart = grp[1];
                    const gapStart = leftPart.left + leftPart.width;
                    const gapEnd = rightPart.left;
                    const gapWidth = gapEnd - gapStart;

                    if (gapWidth > 50 && gapWidth < 220) {
                        for (let fk = 0; fk < lines.length; fk++) {
                            if (fk === li || consumedFloatingLines.has(fk)) continue;
                            if (lines[fk].length === 1 && /^\+\s*[A-Z0-9]$/i.test(lines[fk][0].str.trim())) {
                                const keyItem = lines[fk][0];
                                const vDist = Math.abs(keyItem.top - leftPart.top);
                                if (vDist > 15 && vDist < 85 && Math.abs(keyItem.fontSize - leftPart.fontSize) < 6) {
                                    consumedFloatingLines.add(fk);
                                    erasedRegionsOut.push({
                                        left: gapStart - 4,
                                        top: leftPart.top - 4,
                                        width: gapWidth + 8,
                                        height: (leftPart.height || leftPart.fontSize * 1.2) + 8
                                    });
                                    grp.splice(1, 0, {
                                        ...keyItem,
                                        top: leftPart.top,
                                        fontSize: leftPart.fontSize
                                    });
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        const activeLines = lines.filter((_, idx) => !consumedFloatingLines.has(idx));

        // 7. Build structured line descriptors and detect horizontal alignment
        let lineObjs = activeLines.map(grp => {
            const first = grp[0];
            const minLeft = first.left;
            const maxRight = Math.max(...grp.map(g => g.left + g.width));
            const rawSpanWidth = maxRight - minLeft;

            const estTrueWidth = grp.length === 1 && rawSpanWidth > 180
                ? (rawSpanWidth - 10) / 1.05
                : rawSpanWidth;
            const estCenter = minLeft + estTrueWidth / 2;

            const isSingleShortKey = grp.length === 1 && /^\+\s*[A-Z0-9]$/i.test(first.str.trim());
            const hasInlineIcon = grp.some(g => Boolean(g.inlineIconUrl));
            const isSideCallout = hasShortcutKeys && grp.length === 1 && minLeft > pageWidth * 0.55 && rawSpanWidth < pageWidth * 0.42;

            const sharedLeftMarginCount = activeLines.filter(otherGrp => {
                const oLeft = otherGrp[0].left;
                const oRight = Math.max(...otherGrp.map(g => g.left + g.width));
                const oWidth = oRight - oLeft;
                return Math.abs(oLeft - minLeft) < 3.0 && Math.abs(oWidth - rawSpanWidth) > 25;
            }).length;
            const isLeftMarginColumn = sharedLeftMarginCount >= 1 && minLeft >= 36;

            const explicitAlign = first.textAlign || '';
            const isCentered = explicitAlign
                ? explicitAlign === 'center'
                : (isPublisher && !isSideCallout && !isLeftMarginColumn && (
                    isSingleShortKey ||
                    hasInlineIcon ||
                    Math.abs(estCenter - pageWidth / 2) < pageWidth * (hasShortcutKeys ? 0.075 : 0.055) ||
                    (hasShortcutKeys && grp.length >= 2 && minLeft < pageWidth * 0.2 && maxRight > pageWidth * 0.8)
                ));

            const joinSeparator = (hasShortcutKeys && (hasInlineIcon || grp.length > 1)) ? '&nbsp;&nbsp;' : ' ';
            const spansHtml = grp.map(span => {
                const weightCSS = span.isBold ? 'font-weight: bold;' : 'font-weight: normal;';
                const styleCSS = span.isItalic ? 'font-style: italic;' : 'font-style: normal;';
                const colorCSS = span.color ? `color: ${span.color};` : '';
                const shadowCSS = span.textShadow ? `text-shadow: ${span.textShadow};` : '';
                const winLogoSvgData = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><path fill="#222222" d="M2 5.2L12.5 3.6v9.5H2V5.2zm12.2-1.9L26 1.5v11.6H14.2V3.3zM2 14.8h10.5v9.6L2 22.8v-8zm12.2 0H26v11.7l-11.8-1.8v-9.9z"/></svg>');
                const iconHtml = span.inlineIconUrl
                    ? `<span contenteditable="false" style="display: inline-block; position: relative; width: 0.78em; height: 0.78em; vertical-align: -0.07em; margin: 0 8px 0 4px; background-image: url(&quot;${winLogoSvgData}&quot;); background-repeat: no-repeat; background-position: center; background-size: contain; -webkit-print-color-adjust: exact; print-color-adjust: exact; user-select: none;"></span>`
                    : '';
                const safeText = span.str
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
                return `<span style="${weightCSS} ${styleCSS} ${colorCSS} ${shadowCSS}">${iconHtml}${safeText}</span>`;
            }).join(joinSeparator);

            const fontSize = first.fontSize || 28;
            const normalizedFontSize = (isPublisher && Math.abs(fontSize - 29.3) < 1.2) ? 26.5 : fontSize;
            const height = Math.max(...grp.map(g => g.height || fontSize * 1.2));

            let boxLeft = minLeft;
            let boxWidth = Math.min(pageWidth - boxLeft - 8, Math.max(rawSpanWidth * 1.05 + 14, 45));
            let textAlign = explicitAlign || 'left';

            if (isCentered) {
                textAlign = 'center';
                if (isSingleShortKey) {
                    boxWidth = 220;
                    boxLeft = (pageWidth - boxWidth) / 2;
                } else {
                    boxWidth = Math.min(pageWidth - 32, Math.max(estTrueWidth * 1.05, 320));
                    boxLeft = (pageWidth - boxWidth) / 2;
                }
            } else if (isSideCallout) {
                textAlign = 'left';
                boxLeft = Math.max(minLeft, pageWidth * 0.64);
                boxWidth = Math.min(pageWidth - boxLeft - 12, Math.max(rawSpanWidth + 24, 220));
            }

            return {
                left: boxLeft,
                top: first.top,
                width: boxWidth,
                height,
                fontSize: normalizedFontSize,
                fontFamily: first.fontFamily,
                color: first.color || 'rgb(36, 36, 36)',
                textShadow: first.textShadow || 'none',
                textAlign,
                isCentered,
                isSideCallout,
                isSingleShortKey,
                spansHtml,
                rawText: grp.map(g => g.str).join(' ')
            };
        });

        // 8. Resolve vertical overlaps caused by libmspub font/line-spacing substitution
        lineObjs.sort((a, b) => a.top - b.top);
        const slips = [];
        let currSlip = [];
        for (const lo of lineObjs) {
            if (currSlip.length === 0) {
                currSlip.push(lo);
            } else {
                const prevMaxBottom = Math.max(...currSlip.map(x => x.top + x.height));
                if (lo.top - prevMaxBottom > 65) {
                    slips.push(currSlip);
                    currSlip = [lo];
                } else {
                    currSlip.push(lo);
                }
            }
        }
        if (currSlip.length > 0) slips.push(currSlip);

        slips.forEach(slip => {
            const displayKey = slip.find(x => x.isSingleShortKey && x.fontSize >= 38);
            const sideCallout = slip.find(x => x.isSideCallout);
            if (displayKey) {
                const linesAbove = slip.filter(x => x !== displayKey && x !== sideCallout && x.top < displayKey.top);
                if (linesAbove.length > 0) {
                    const bottomAbove = Math.max(...linesAbove.map(x => x.top + x.height));
                    if (displayKey.top < bottomAbove + 4) {
                        displayKey.top = bottomAbove + 4;
                    }
                }
                if (sideCallout) {
                    sideCallout.top = displayKey.top + (displayKey.height - sideCallout.height) * 0.5;
                }
                const obstacleBottom = Math.max(
                    displayKey.top + displayKey.height,
                    sideCallout ? (sideCallout.top + sideCallout.height) : 0
                );
                const linesBelow = slip.filter(x => x !== displayKey && x !== sideCallout && x.top > displayKey.top - 5);
                linesBelow.sort((a, b) => a.top - b.top);
                if (linesBelow.length > 0 && linesBelow[0].top < obstacleBottom + 4) {
                    const shiftDown = (obstacleBottom + 6) - linesBelow[0].top;
                    linesBelow.forEach((lb, idx) => {
                        lb.top += shiftDown;
                        if (idx > 0) {
                            const minTop = linesBelow[idx - 1].top + linesBelow[idx - 1].height + 2;
                            if (lb.top < minTop) lb.top = minTop;
                        }
                    });
                }
            }
        });

        // 9. Emit clean .opub elements
        let zIndexCounter = 10;
        return lineObjs.map(lo => {
            const shadowStyle = (lo.textShadow && lo.textShadow !== 'none')
                ? `text-shadow: ${lo.textShadow};`
                : 'text-shadow: none;';
            return {
                id: 'pub-el-' + Math.random().toString(36).substr(2, 9),
                left: `${lo.left.toFixed(1)}px`,
                top: `${lo.top.toFixed(1)}px`,
                width: `${lo.width.toFixed(1)}px`,
                height: `${lo.height.toFixed(1)}px`,
                transform: 'none',
                zIndex: String(zIndexCounter++),
                type: 'box',
                innerHTML: `<div style="width: 100%; height: 100%; font-family: ${lo.fontFamily}; color: ${lo.color}; font-size: ${lo.fontSize.toFixed(1)}px; line-height: 1.15; text-align: ${lo.textAlign}; white-space: nowrap; overflow: visible; background: transparent; ${shadowStyle} padding: 0px;" contenteditable="true" spellcheck="true" lang="en-US">${lo.spansHtml}</div>`,
                imgSrc: '',
                clipPath: '',
                bg: '',
                cropMode: false,
                imgStyle: {},
                scaleX: '1',
                scaleY: '1'
            };
        });
    }

    /**
     * Native PDF text reconstruction (v5.14.2).
     * - Groups items by REAL baseline and never merges across column gaps (both directions).
     * - Joins items with a space only when the measured gap calls for one.
     * - Places boxes using measured ascent of the substitute font so baselines line up.
     * - Fits each span to the original PDF width via a small letter-spacing correction.
     * - Contrast guard prevents text that matches its local background colour (e.g. white on white).
     */
    let _pdfMeasureCtx = null;
    function measurePdfFont(weight, style, sizePx, family) {
        if (!_pdfMeasureCtx) _pdfMeasureCtx = document.createElement('canvas').getContext('2d');
        const ctx = _pdfMeasureCtx;
        ctx.font = `${style} ${weight} ${sizePx}px ${family}`;
        const m = ctx.measureText('Hxg');
        const asc = m.fontBoundingBoxAscent || sizePx * 0.95;
        const desc = m.fontBoundingBoxDescent || sizePx * 0.25;
        return { ctx, asc, desc };
    }

    function reconstructPdfElements(rawItems, options = {}) {
        const pageWidth = options.pageWidth || 816;
        const lum = (c) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];

        // 1. Sanitize, map fonts, preserve the real baseline (ty)
        let items = rawItems.map(it => ({
            ...it,
            str: sanitizePublisherText(it.str, it.fontFamily),
            fontFamily: mapPublisherFont(it.fontFamily, false),
            left: it.tx,
            top: it.ty - it.fontSize * 0.85,
            height: it.fontSize * 1.2
        })).filter(it => it.str && it.str.trim());

        // 2. Collapse duplicate / faux-bold / shadow layers
        items = deduplicateAndExtractShadows(items);
        items.sort((a, b) => a.ty - b.ty || a.left - b.left);

        // 3. Group by real baseline, then split on column gaps (interval distance, both directions)
        const used = new Set();
        const lines = [];
        for (let i = 0; i < items.length; i++) {
            if (used.has(i)) continue;
            const seed = items[i];
            const row = [seed];
            used.add(i);
            for (let j = i + 1; j < items.length; j++) {
                if (used.has(j)) continue;
                const c = items[j];
                if (Math.abs(c.ty - seed.ty) < Math.min(seed.fontSize, c.fontSize) * 0.25) {
                    row.push(c);
                    used.add(j);
                }
            }
            row.sort((a, b) => a.left - b.left);
            let chain = [row[0]];
            for (let k = 1; k < row.length; k++) {
                const prev = chain[chain.length - 1];
                const cur = row[k];
                const fs = Math.max(prev.fontSize, cur.fontSize);
                const gap = cur.left - (prev.left + prev.width);
                if (gap >= -fs * 0.15 && gap <= fs * 0.9) {
                    cur._gapBefore = gap;
                    chain.push(cur);
                } else {
                    lines.push(chain);
                    chain = [cur];
                }
            }
            lines.push(chain);
        }

        // 4. Emit one element per line chain
        let z = 10;
        return lines.map(chain => {
            const first = chain[0];
            const minLeft = first.left;
            const maxRight = Math.max(...chain.map(c => c.left + c.width));
            const big = chain.reduce((a, b) => (b.fontSize > a.fontSize ? b : a), chain[0]);
            const bigMetrics = measurePdfFont(big.isBold ? 'bold' : 'normal', big.isItalic ? 'italic' : 'normal', big.fontSize, big.fontFamily);
            const lineHeightPx = bigMetrics.asc + bigMetrics.desc;

            const spans = chain.map((span, idx) => {
                const weight = span.isBold ? 'bold' : 'normal';
                const style = span.isItalic ? 'italic' : 'normal';
                const text = span.str.trim();

                // Contrast guard: never let ink match the local background
                let ink = span.inkRGB || [36, 36, 36];
                const bg = span.bgRGB || [255, 255, 255];
                if (Math.abs(lum(ink) - lum(bg)) < 40) {
                    ink = lum(bg) < 128 ? [255, 255, 255] : [36, 36, 36];
                }

                // Fit substitute-font width to the PDF width
                const mm = measurePdfFont(weight, style, span.fontSize, span.fontFamily);
                const measured = mm.ctx.measureText(text).width;
                let letterSpacing = 0;
                if (measured > 0 && text.length > 1 && span.width > 0) {
                    const ratio = span.width / measured;
                    if (ratio > 0.75 && ratio < 1.35) {
                        letterSpacing = Math.max(-1.5, Math.min(1.5, (span.width - measured) / text.length));
                    }
                }

                const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const sep = idx === 0 ? '' : ((span._gapBefore !== undefined && span._gapBefore < span.fontSize * 0.15) ? '' : ' ');
                const shadow = span.textShadow ? `text-shadow: ${span.textShadow};` : '';
                return `${sep}<span style="font-family: ${span.fontFamily}; font-size: ${span.fontSize.toFixed(2)}px; font-weight: ${weight}; font-style: ${style}; color: rgb(${ink[0]}, ${ink[1]}, ${ink[2]}); letter-spacing: ${letterSpacing.toFixed(3)}px; ${shadow}">${safe}</span>`;
            }).join('');

            const top = first.ty - bigMetrics.asc;
            const width = Math.min(pageWidth - minLeft + 40, (maxRight - minLeft) + Math.max(6, big.fontSize * 0.5));
            const firstInk = first.inkRGB || [36, 36, 36];
            return {
                id: 'pdf-el-' + Math.random().toString(36).substr(2, 9),
                left: `${minLeft.toFixed(1)}px`,
                top: `${top.toFixed(1)}px`,
                width: `${width.toFixed(1)}px`,
                height: `${lineHeightPx.toFixed(1)}px`,
                transform: 'none',
                zIndex: String(z++),
                type: 'box',
                innerHTML: `<div style="width: 100%; height: 100%; font-family: ${big.fontFamily}; font-size: ${big.fontSize.toFixed(2)}px; line-height: ${lineHeightPx.toFixed(2)}px; color: rgb(${firstInk[0]}, ${firstInk[1]}, ${firstInk[2]}); text-align: left; white-space: nowrap; overflow: visible; background: transparent; padding: 0px;" contenteditable="true" spellcheck="true" lang="en-US">${spans}</div>`,
                imgSrc: '',
                clipPath: '',
                bg: '',
                cropMode: false,
                imgStyle: {},
                scaleX: '1',
                scaleY: '1'
            };
        });
    }

    /**
     * Process a single PDF.js page into clean, deduplicated, properly aligned OpenPublisher elements,
     * while preserving all images, backgrounds, borders, and graphics on a text-erased canvas layer.
     */
    async function processPdfPage(page, pageNum, options = {}) {
        const viewport = page.getViewport({ scale: 1.0 });
        const ratio = 96 / 72;
        const pageWidth = Math.round(viewport.width * ratio);
        const pageHeight = Math.round(viewport.height * ratio);

        const renderScale = 2.0;
        const viewportImg = page.getViewport({ scale: renderScale });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = viewportImg.width;
        canvas.height = viewportImg.height;
        await page.render({ canvasContext: ctx, viewport: viewportImg }).promise;

        try {
            const fullImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const pxPerPagePx = renderScale / ratio;

            const opList = await page.getOperatorList();
            const ops = (typeof pdfjsLib !== 'undefined' && pdfjsLib.OPS)
                ? pdfjsLib.OPS
                : { paintJpegXObject: 82, paintImageXObject: 85, paintImageMaskXObject: 83, paintInlineImageXObject: 86 };
            const imageOps = [ops.paintJpegXObject, ops.paintImageXObject, ops.paintImageMaskXObject, ops.paintInlineImageXObject].filter(Boolean);
            const pageHasImages = Boolean(options.hasImages) || (opList && Array.isArray(opList.fnArray) && opList.fnArray.some(op => imageOps.includes(op)));

            const textContent = await page.getTextContent();
            const hasRawText = textContent && Array.isArray(textContent.items) && textContent.items.some(it => it.str && it.str.trim());

            let bgCanvas = canvas;
            let bgCtx = ctx;
            let noTextImgData = fullImgData;

            if (hasRawText) {
                bgCanvas = document.createElement('canvas');
                bgCanvas.width = canvasWidth;
                bgCanvas.height = canvasHeight;
                bgCtx = bgCanvas.getContext('2d', { willReadFrequently: true });
                bgCtx.fillText = () => {};
                bgCtx.strokeText = () => {};
                await page.render({ canvasContext: bgCtx, viewport: viewportImg }).promise;
                noTextImgData = bgCtx.getImageData(0, 0, canvasWidth, canvasHeight);
            }

            const rawItems = [];
            const erasedRegions = [];

            textContent.items.forEach(item => {
                if (!item.str || !item.str.trim()) return;
                const tx = item.transform[4] * ratio;
                const ty = (viewport.height - item.transform[5]) * ratio;
                const fontSize = Math.abs(item.transform[0] || item.transform[3]) * ratio;
                const itemWidth = item.width * ratio;

                let isItalicFont = Math.abs(item.transform[1]) > 0.1 || Math.abs(item.transform[2]) > 0.1;
                let isBoldFont = false;
                let detectedFontName = '';

                try {
                    const rawFont = page.commonObjs.get(item.fontName) || page.objs.get(item.fontName);
                    detectedFontName = rawFont?.name || rawFont?.fallbackName || '';
                    const realName = detectedFontName.toLowerCase();
                    isBoldFont = realName.includes('bold') || realName.includes('black') || realName.includes('heavy');
                    if (!isItalicFont) isItalicFont = realName.includes('italic') || realName.includes('oblique');
                } catch (e) {}

                if (!isBoldFont || !isItalicFont || !detectedFontName) {
                    const fallbackStyle = textContent.styles[item.fontName] || {};
                    const fallbackName = fallbackStyle.fontFamily || fallbackStyle.name || '';
                    if (!detectedFontName) detectedFontName = fallbackName;
                    const lowerFb = fallbackName.toLowerCase();
                    if (!isBoldFont) isBoldFont = lowerFb.includes('bold') || lowerFb.includes('black') || lowerFb.includes('heavy');
                    if (!isItalicFont) isItalicFont = lowerFb.includes('italic') || lowerFb.includes('oblique');
                }

                // Compare fullImgData (with text) against noTextImgData (without text) inside the glyph box
                // to extract exact unblended core glyph ink color
                const xStart = Math.max(0, Math.floor(tx * pxPerPagePx));
                const xEnd = Math.min(canvasWidth - 1, Math.ceil((tx + Math.max(itemWidth, 4)) * pxPerPagePx));
                const yStart = Math.max(0, Math.floor((ty - fontSize * 0.75) * pxPerPagePx));
                const yEnd = Math.min(canvasHeight - 1, Math.ceil((ty - fontSize * 0.10) * pxPerPagePx));

                let maxDiff = 0;
                let sumBgR = 0, sumBgG = 0, sumBgB = 0, bgCount = 0;
                const fData = fullImgData.data;
                const nData = noTextImgData.data;

                for (let py = yStart; py <= yEnd; py += 2) {
                    const rowOff = py * canvasWidth;
                    for (let px = xStart; px <= xEnd; px += 2) {
                        const idx = (rowOff + px) * 4;
                        const bgR = nData[idx], bgG = nData[idx + 1], bgB = nData[idx + 2];
                        sumBgR += bgR; sumBgG += bgG; sumBgB += bgB; bgCount++;
                        const diff = Math.abs(fData[idx] - bgR) + Math.abs(fData[idx + 1] - bgG) + Math.abs(fData[idx + 2] - bgB);
                        if (diff > maxDiff) maxDiff = diff;
                    }
                }

                const avgBgR = bgCount > 0 ? sumBgR / bgCount : 255;
                const avgBgG = bgCount > 0 ? sumBgG / bgCount : 255;
                const avgBgB = bgCount > 0 ? sumBgB / bgCount : 255;
                let inkR = (avgBgR + avgBgG + avgBgB) / 3 < 128 ? 255 : 36;
                let inkG = inkR, inkB = inkR;

                if (maxDiff > 12) {
                    const threshold = Math.max(24, maxDiff * 0.65);
                    let optR = 0, optG = 0, optB = 0, samples = 0;
                    for (let py = yStart; py <= yEnd; py += 2) {
                        const rowOff = py * canvasWidth;
                        for (let px = xStart; px <= xEnd; px += 2) {
                            const idx = (rowOff + px) * 4;
                            const diff = Math.abs(fData[idx] - nData[idx]) + Math.abs(fData[idx + 1] - nData[idx + 1]) + Math.abs(fData[idx + 2] - nData[idx + 2]);
                            if (diff >= threshold) {
                                optR += fData[idx];
                                optG += fData[idx + 1];
                                optB += fData[idx + 2];
                                samples++;
                            }
                        }
                    }
                    if (samples > 0) {
                        inkR = Math.round(optR / samples);
                        inkG = Math.round(optG / samples);
                        inkB = Math.round(optB / samples);
                    }
                } else {
                    // Fallback for outline/Type3 glyph paths not rendered via fillText
                    let optR = 0, optG = 0, optB = 0, samples = 0;
                    const py = Math.floor((ty - fontSize * 0.3) * pxPerPagePx);
                    if (py >= 0 && py < canvasHeight) {
                        for (let x = 0; x < itemWidth; x += 2) {
                            const px = Math.floor((tx + x) * pxPerPagePx);
                            if (px >= 0 && px < canvasWidth) {
                                const idx = (py * canvasWidth + px) * 4;
                                const r = fData[idx], g = fData[idx + 1], b = fData[idx + 2];
                                if (Math.abs(r - avgBgR) + Math.abs(g - avgBgG) + Math.abs(b - avgBgB) > 42) {
                                    optR += r; optG += g; optB += b; samples++;
                                }
                            }
                        }
                    }
                    if (samples > 0) {
                        inkR = Math.round(optR / samples);
                        inkG = Math.round(optG / samples);
                        inkB = Math.round(optB / samples);
                    }
                    erasedRegions.push({
                        left: tx,
                        top: ty - fontSize * 0.88,
                        width: itemWidth,
                        height: fontSize * 1.18,
                        inkRGB: [inkR, inkG, inkB],
                        bgRGB: [avgBgR, avgBgG, avgBgB]
                    });
                }

                const finalColor = `rgb(${inkR}, ${inkG}, ${inkB})`;

                rawItems.push({
                    str: item.str.trim(),
                    tx,
                    ty,
                    width: itemWidth,
                    fontSize,
                    isBold: isBoldFont,
                    isItalic: isItalicFont,
                    fontFamily: detectedFontName,
                    color: finalColor,
                    inkRGB: [inkR, inkG, inkB],
                    bgRGB: [avgBgR, avgBgG, avgBgB],
                    hasEOL: Boolean(item.hasEOL)
                });
            });

            const reconstructFn = options.nativePdf ? reconstructPdfElements : reconstructPublisherElements;
            const textElements = reconstructFn(rawItems, {
                pageWidth,
                pageHeight,
                sourceCanvas: canvas,
                sourceImgData: fullImgData,
                canvasScale: pxPerPagePx,
                isPublisher: options.isPublisher !== false,
                erasedRegionsOut: erasedRegions
            });

            // Erase any promoted inline key icons (or outline fallback regions) from the text-free background canvas
            if (erasedRegions.length > 0) {
                eraseRegionsFromCanvas(bgCanvas, bgCtx, noTextImgData, erasedRegions, pxPerPagePx);
            }

            // Check if the background canvas still has non-white visual graphics (photos, cards, borders, shapes, colored backgrounds)
            let nonWhiteCount = 0;
            let totalChecked = 0;
            const d = noTextImgData.data;
            const step = 4;
            for (let y = 0; y < canvasHeight; y += step) {
                const rowOff = y * canvasWidth;
                for (let x = 0; x < canvasWidth; x += step) {
                    const idx = (rowOff + x) * 4;
                    if (d[idx] < 245 || d[idx + 1] < 245 || d[idx + 2] < 245) {
                        nonWhiteCount++;
                    }
                    totalChecked++;
                }
            }
            const nonWhiteRatio = totalChecked > 0 ? (nonWhiteCount / totalChecked) : 0;
            const hasShortcutKeys = rawItems.some(it => /^\+\s*[A-Z0-9]$/i.test(it.str.trim()));

            const backgroundElements = [];
            if (textElements.length === 0 || nonWhiteRatio > 0.0006 || (pageHasImages && !hasShortcutKeys)) {
                const imgDataUrl = bgCanvas.toDataURL('image/jpeg', 0.90);
                backgroundElements.push({
                    left: '0px',
                    top: '0px',
                    width: '100%',
                    height: '100%',
                    transform: 'none',
                    zIndex: '1',
                    type: 'box',
                    innerHTML: '',
                    imgSrc: imgDataUrl,
                    clipPath: '',
                    bg: '',
                    cropMode: false,
                    imgStyle: { width: '100%', height: '100%', position: 'absolute', pointerEvents: 'none' },
                    scaleX: '1',
                    scaleY: '1'
                });
            }

            // Include any standalone extracted images from ServerSide if present and no full-page background was added
            const standaloneImageElements = [];
            if (backgroundElements.length === 0 && options.structuredPage && Array.isArray(options.structuredPage.images)) {
                options.structuredPage.images.forEach((imgObj, idx) => {
                    if (imgObj.width > 45 || imgObj.height > 45) {
                        standaloneImageElements.push({
                            id: `pub-img-${pageNum}-${idx}`,
                            left: `${imgObj.left}px`,
                            top: `${imgObj.top}px`,
                            width: `${imgObj.width}px`,
                            height: `${imgObj.height}px`,
                            transform: 'none',
                            zIndex: String(2 + idx),
                            type: 'box',
                            innerHTML: '',
                            imgSrc: imgObj.dataUrl,
                            clipPath: '',
                            bg: '',
                            cropMode: false,
                            imgStyle: { width: '100%', height: '100%', position: 'absolute', pointerEvents: 'none' },
                            scaleX: '1',
                            scaleY: '1'
                        });
                    }
                });
            }

            return {
                pageWidth,
                pageHeight,
                elements: [...backgroundElements, ...standaloneImageElements, ...textElements]
            };
        } catch (err) {
            console.warn('processPdfPage fallback to raster canvas:', err);
            const fallbackUrl = canvas.toDataURL('image/jpeg', 0.90);
            return {
                pageWidth,
                pageHeight,
                elements: [{
                    left: '0px',
                    top: '0px',
                    width: '100%',
                    height: '100%',
                    transform: 'none',
                    zIndex: '1',
                    type: 'box',
                    innerHTML: '',
                    imgSrc: fallbackUrl,
                    clipPath: '',
                    bg: '',
                    cropMode: false,
                    imgStyle: { width: '100%', height: '100%', position: 'absolute', pointerEvents: 'none' },
                    scaleX: '1',
                    scaleY: '1'
                }]
            };
        }
    }

    /**
     * Direct parser for libmspub SVG / XML payloads (supports Phase 2, 3, & 4 synthetic & live SVG imports)
     */
    function parseLibmspubSvg(svgMarkup, options = {}) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
        const svgRoot = doc.querySelector('svg');
        if (!svgRoot) throw new Error('Invalid SVG payload');

        const pageWidth = parseFloat(svgRoot.getAttribute('width')) || 816;
        const pageHeight = parseFloat(svgRoot.getAttribute('height')) || 1056;
        const elements = [];
        let zCounter = 2;

        // 1. Extract embedded <image> elements and complex vector groups (<g data-complex-vector="true">)
        const imageNodes = Array.from(svgRoot.querySelectorAll('image'));
        imageNodes.forEach((imgNode, idx) => {
            const x = parseFloat(imgNode.getAttribute('x')) || 0;
            const y = parseFloat(imgNode.getAttribute('y')) || 0;
            const w = parseFloat(imgNode.getAttribute('width')) || 32;
            const h = parseFloat(imgNode.getAttribute('height')) || 32;
            const href = imgNode.getAttribute('href') || imgNode.getAttribute('xlink:href') || '';
            if (href && (w > 45 || h > 45)) {
                elements.push({
                    id: `pub-svg-img-${idx}`,
                    left: `${x.toFixed(1)}px`,
                    top: `${y.toFixed(1)}px`,
                    width: `${w.toFixed(1)}px`,
                    height: `${h.toFixed(1)}px`,
                    transform: 'none',
                    zIndex: String(zCounter++),
                    type: 'box',
                    innerHTML: '',
                    imgSrc: href,
                    clipPath: '',
                    bg: '',
                    cropMode: false,
                    imgStyle: { width: '100%', height: '100%', position: 'absolute', pointerEvents: 'none' },
                    scaleX: '1',
                    scaleY: '1'
                });
            }
        });

        // Per-element fallback for complex vector groups
        const complexGroups = Array.from(svgRoot.querySelectorAll('[data-complex-vector="true"], g.complex-vector'));
        complexGroups.forEach((gNode, idx) => {
            const x = parseFloat(gNode.getAttribute('data-x') || gNode.getAttribute('x')) || 0;
            const y = parseFloat(gNode.getAttribute('data-y') || gNode.getAttribute('y')) || 0;
            const w = parseFloat(gNode.getAttribute('data-width') || gNode.getAttribute('width')) || 120;
            const h = parseFloat(gNode.getAttribute('data-height') || gNode.getAttribute('height')) || 80;
            const miniSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${gNode.outerHTML}</svg>`;
            const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(miniSvg);
            elements.push({
                id: `pub-vec-fallback-${idx}`,
                left: `${x.toFixed(1)}px`,
                top: `${y.toFixed(1)}px`,
                width: `${w.toFixed(1)}px`,
                height: `${h.toFixed(1)}px`,
                transform: 'none',
                zIndex: String(zCounter++),
                type: 'box',
                innerHTML: '',
                imgSrc: dataUrl,
                 isImageFallback: true,
                clipPath: '',
                bg: '',
                cropMode: false,
                imgStyle: { width: '100%', height: '100%', position: 'absolute', pointerEvents: 'none' },
                scaleX: '1',
                scaleY: '1'
            });
        });

        // 2. Parse <text> and <tspan> nodes
        const textNodes = Array.from(svgRoot.querySelectorAll('text'));
        const rawTextItems = [];

        textNodes.forEach(tNode => {
            const tx = parseFloat(tNode.getAttribute('x')) || 0;
            const ty = parseFloat(tNode.getAttribute('y')) || 0;
            const fontSize = parseFloat(tNode.getAttribute('font-size')) || 18;
            const fontFamily = tNode.getAttribute('font-family') || 'Calibri';
            const fill = tNode.getAttribute('fill') || '#222222';
            const weight = (tNode.getAttribute('font-weight') || '').toLowerCase();
            const fStyle = (tNode.getAttribute('font-style') || '').toLowerCase();
            const anchor = (tNode.getAttribute('text-anchor') || '').toLowerCase();
            const explicitAlign = anchor === 'middle' ? 'center' : (anchor === 'end' ? 'right' : 'left');

            const tspans = Array.from(tNode.querySelectorAll('tspan'));
            if (tspans.length > 0) {
                const parsedSpans = [];
                let totalEstW = 0;
                tspans.forEach(ts => {
                    const txt = sanitizePublisherText(ts.textContent, ts.getAttribute('font-family') || fontFamily);
                    if (!txt) return;
                    const sFontSize = parseFloat(ts.getAttribute('font-size')) || fontSize;
                    const sWeight = (ts.getAttribute('font-weight') || weight).toLowerCase();
                    const sStyle = (ts.getAttribute('font-style') || fStyle).toLowerCase();
                    const sColor = ts.getAttribute('fill') || fill;
                    const estW = txt.length * sFontSize * 0.52;
                    parsedSpans.push({
                        str: txt,
                        sFontSize,
                        sWeight,
                        sStyle,
                        sColor,
                        sFontFamily: ts.getAttribute('font-family') || fontFamily,
                        hasExplicitX: ts.hasAttribute('x'),
                        explicitX: parseFloat(ts.getAttribute('x')),
                        sY: ts.hasAttribute('y') ? parseFloat(ts.getAttribute('y')) : ty,
                        estW
                    });
                    totalEstW += estW + 6;
                });

                let cursorX = anchor === 'middle' ? (tx - totalEstW / 2) : tx;
                parsedSpans.forEach(ps => {
                    const itemX = ps.hasExplicitX ? ps.explicitX : cursorX;
                    rawTextItems.push({
                        str: ps.str,
                        tx: itemX,
                        ty: ps.sY,
                        width: ps.estW,
                        fontSize: ps.sFontSize,
                        fontFamily: ps.sFontFamily,
                        isBold: ps.sWeight === 'bold' || Number(ps.sWeight) >= 600,
                        isItalic: ps.sStyle === 'italic' || ps.sStyle === 'oblique',
                        color: ps.sColor,
                        textAlign: explicitAlign
                    });
                    cursorX = itemX + ps.estW + 6;
                });
            } else {
                const txt = sanitizePublisherText(tNode.textContent, fontFamily);
                if (!txt || !txt.trim()) return;
                const estW = txt.trim().length * fontSize * 0.52;
                const isShortKey = /^\+\s*[A-Z0-9]$/i.test(txt.trim());
                rawTextItems.push({
                    str: txt.trim(),
                    tx: anchor === 'middle' ? (tx - estW / 2) : tx,
                    ty,
                    width: estW,
                    fontSize,
                    fontFamily,
                    isBold: weight === 'bold' || Number(weight) >= 600,
                    isItalic: fStyle === 'italic' || fStyle === 'oblique',
                    color: fill,
                    textAlign: isShortKey ? 'center' : explicitAlign
                });
            }
        });

        const reconstructedText = reconstructPublisherElements(rawTextItems, {
            pageWidth,
            pageHeight,
            isPublisher: true
        });

        return {
            title: options.title || 'Imported Publisher Document',
            pages: [{
                id: Date.now(),
                width: `${pageWidth}px`,
                height: `${pageHeight}px`,
                background: '#ffffff',
                elements: [...elements, ...reconstructedText],
                header: '',
                footer: '',
                borderStyle: 'none',
                thumb: ''
            }]
        };
    }

    /**
     * Phase 4: Sanitize and repair legacy broken .opub files on load
     * (removes full-page raster ghost text behind haloCSS text elements, merges cloned shadow layers,
     * repairs corrupted quotes/PUA symbols, and reconstructs centered/inline layouts).
     */
    function sanitizeLegacyOpubData(data) {
        if (!data || !Array.isArray(data.pages)) return data;

        data.pages.forEach(page => {
            if (!page || !Array.isArray(page.elements) || page.elements.length < 2) return;
            const pageWidth = parseFloat(page.width) || 816;
            const pageHeight = parseFloat(page.height) || 1056;

            // Detect if this page is a legacy broken .pub import:
            // Has a full-page zIndex=1 background image AND pub-el-* text elements with 8-direction white haloCSS
            // OR has duplicate offset shadow text layers
            const bgElIdx = page.elements.findIndex(el =>
                (el.imgSrc || el.isImage || el.type === 'image') &&
                (el.width === '100%' || parseFloat(el.width) >= pageWidth * 0.95) &&
                (el.height === '100%' || parseFloat(el.height) >= pageHeight * 0.95) &&
                (!el.innerHTML || !el.innerHTML.includes('contenteditable'))
            );

            const hasLegacyHaloElements = page.elements.some(el =>
                el.innerHTML &&
                (el.innerHTML.includes('2px 0 2px') || el.innerHTML.includes('2px 0px 2px')) &&
                el.innerHTML.includes('-2px -2px 2px')
            );

            const textEls = page.elements.filter((el, idx) => idx !== bgElIdx && el.innerHTML && el.innerHTML.includes('contenteditable'));
            if (textEls.length === 0) return;

            // Check if there are legacy cloned shadow nodes even without bgElIdx
            let hasClonedShadows = false;
            if (!hasLegacyHaloElements) {
                const stripHtml = (h) => (h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
                for (let i = 0; i < textEls.length; i++) {
                    for (let j = i + 1; j < textEls.length; j++) {
                        const tA = stripHtml(textEls[i].innerHTML);
                        const tB = stripHtml(textEls[j].innerHTML);
                        if (tA && tA === tB) {
                            const dx = parseFloat(textEls[j].left) - parseFloat(textEls[i].left);
                            const dy = parseFloat(textEls[j].top) - parseFloat(textEls[i].top);
                            const dist = Math.hypot(dx, dy);
                            if (dist >= 0.2 && dist <= 18) {
                                hasClonedShadows = true;
                                break;
                            }
                        }
                    }
                    if (hasClonedShadows) break;
                }
            }

            // Upgrade any inline <img src="data:image/svg+xml..."> or <svg viewBox="0 0 28 28"> icons inside contenteditable boxes
            const winLogoSvgData = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><path fill="#222222" d="M2 5.2L12.5 3.6v9.5H2V5.2zm12.2-1.9L26 1.5v11.6H14.2V3.3zM2 14.8h10.5v9.6L2 22.8v-8zm12.2 0H26v11.7l-11.8-1.8v-9.9z"/></svg>');
            const winSpanIconHtml = `<span contenteditable="false" style="display: inline-block; position: relative; width: 0.78em; height: 0.78em; vertical-align: -0.07em; margin: 0 8px 0 4px; background-image: url(&quot;${winLogoSvgData}&quot;); background-repeat: no-repeat; background-position: center; background-size: contain; -webkit-print-color-adjust: exact; print-color-adjust: exact; user-select: none;"></span>`;
            page.elements.forEach(el => {
                if (el.innerHTML && el.innerHTML.includes('contenteditable')) {
                    el.innerHTML = el.innerHTML
                        .replace(/<img[^>]+src="data:image\/svg\+xml[^"]*"[^>]*>/gi, winSpanIconHtml)
                        .replace(/<svg[^>]*viewBox="0 0 28 28"[^>]*>[\s\S]*?<\/svg>/gi, winSpanIconHtml);
                }
            });

            if (!hasLegacyHaloElements && !hasClonedShadows) return;

            // Parse text elements into rawItems for reconstructPublisherElements
            const rawItems = [];
            const nonTextEls = [];
            const hasLegacyShortcutKeys = textEls.some(el => {
                const plain = (el.innerHTML || '').replace(/<[^>]+>/g, '').trim();
                return /^\+\s*[A-Z0-9]$/i.test(plain);
            });

            page.elements.forEach((el, idx) => {
                if (idx === bgElIdx && hasLegacyHaloElements && hasLegacyShortcutKeys) {
                    // Drop the full-page ghost-text raster background on shortcut-key sheets!
                    return;
                }
                if (!el.innerHTML || !el.innerHTML.includes('contenteditable')) {
                    nonTextEls.push(el);
                    return;
                }

                const tmp = document.createElement('div');
                tmp.innerHTML = el.innerHTML;
                const outerDiv = tmp.querySelector('div') || tmp;
                const spanEl = tmp.querySelector('span') || outerDiv;
                const rawStr = tmp.textContent || '';
                if (!rawStr.trim()) return;

                const styleStr = (outerDiv.getAttribute('style') || '') + ';' + (spanEl.getAttribute('style') || '');
                const fsMatch = styleStr.match(/font-size:\s*([\d.]+)px/i);
                const colMatch = styleStr.match(/color:\s*(rgb\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/i);
                const ffMatch = styleStr.match(/font-family:\s*([^;]+)/i);
                const isBold = /font-weight:\s*(bold|[6-9]00)/i.test(styleStr);
                const isItalic = /font-style:\s*(italic|oblique)/i.test(styleStr);

                // Preserve existing native single text-shadow (if not the 8-direction white halo)
                let existingShadow = '';
                const tsMatch = styleStr.match(/text-shadow:\s*([^;]+)/i);
                if (tsMatch && !tsMatch[1].includes('-2px -2px')) {
                    existingShadow = tsMatch[1].trim();
                }

                const fontSize = fsMatch ? parseFloat(fsMatch[1]) : 24;
                const left = parseFloat(el.left) || 0;
                const top = parseFloat(el.top) || 0;
                const width = parseFloat(el.width) || (rawStr.length * fontSize * 0.55);
                const height = parseFloat(el.height) || (fontSize * 1.2);

                rawItems.push({
                    str: rawStr.trim(),
                    tx: left,
                    ty: top + fontSize * 0.85,
                    top,
                    width,
                    height,
                    fontSize,
                    fontFamily: ffMatch ? ffMatch[1].trim() : 'Calibri',
                    color: colMatch ? colMatch[1].trim() : 'rgb(36, 36, 36)',
                    isBold,
                    isItalic,
                    textShadow: existingShadow !== 'none' ? existingShadow : ''
                });
            });

            const cleanTextElements = reconstructPublisherElements(rawItems, {
                pageWidth,
                pageHeight,
                isPublisher: true
            });

            page.elements = [...nonTextEls, ...cleanTextElements];
        });

        return data;
    }

    return {
        mapPublisherFont,
        sanitizePublisherText,
        deduplicateAndExtractShadows,
        reconstructPublisherElements,
        processPdfPage,
        parseLibmspubSvg,
        sanitizeLegacyOpubData,
        WINDOWS_KEY_SVG_DATA_URL
    };
})();

function uploadAndConvertPub(file) {
    if (typeof DashboardSystem !== 'undefined' && DashboardSystem && typeof DashboardSystem.close === 'function') {
        try { DashboardSystem.close(); } catch (e) {}
    }
    
    // --- 1. THE PRE-FLIGHT MENU ---
    const promptHtml = `
        <style>
            .op-import-modal { font-family: 'Segoe UI', sans-serif; color: #334155; width: 100%; box-sizing: border-box; }
            .op-import-modal p { margin-top: 0; font-size: 13px; margin-bottom: 12px; font-weight: 500; }
            .op-import-card { display: block; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s ease; background: #ffffff; width: 100%; box-sizing: border-box; }
            .op-import-card:hover { border-color: #94a3b8; background: #f8fafc; }
            .op-import-card:has(input:checked) { border-color: #0ea5e9; background: #f0f9ff; }
            .op-import-card.safe-mode { border-color: #fde68a; background: #fffbeb; }
            .op-import-card.safe-mode:hover { border-color: #fcd34d; background: #fef3c7; }
            .op-import-card.safe-mode:has(input:checked) { border-color: #f59e0b; background: #fef3c7; }
            .op-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
            .op-import-card input[type="radio"] { width: 16px; height: 16px; margin: 0; cursor: pointer; accent-color: #0ea5e9; }
            .op-import-card.safe-mode input[type="radio"] { accent-color: #d97706; }
            .op-import-icon { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; font-size: 13px; }
            .icon-edit { background: #e0f2fe; color: #0284c7; }
            .icon-safe { background: #fef3c7; color: #d97706; }
            .op-import-title { font-weight: 600; font-size: 13px; color: #0f172a; }
            .title-safe { color: #92400e; }
            .op-import-desc { font-size: 11.5px; color: #64748b; line-height: 1.4; margin-left: 24px; display: block; white-space: normal; }
            .desc-safe { color: #92400e; }
            .op-import-actions { display: flex; gap: 8px; margin-top: 15px; width: 100%; box-sizing: border-box; }
            .op-btn { flex: 1; padding: 8px 0; border-radius: 6px; font-weight: 600; font-size: 12.5px; cursor: pointer; transition: all 0.2s; border: none; text-align: center; }
            .op-btn-cancel { background: #f1f5f9; color: #475569; }
            .op-btn-cancel:hover { background: #e2e8f0; color: #0f172a; }
            .op-btn-start { background: #0ea5e9; color: white; }
            .op-btn-start:hover { background: #0284c7; }
        </style>

        <div class="op-import-modal">
            <p>Select how to process this Publisher file:</p>
            <label class="op-import-card">
                <div class="op-card-header">
                    <input type="radio" name="importModePub" id="mode-editable-pub" value="editable" checked>
                    <div class="op-import-icon icon-edit"><i class="fas fa-file-signature"></i></div>
                    <span class="op-import-title">Editable Text Mode</span>
                </div>
                <span class="op-import-desc">Extracts text and layout. Best for files that you need to edit.</span>
            </label>

            <label class="op-import-card safe-mode">
                <div class="op-card-header">
                    <input type="radio" name="importModePub" id="mode-image-pub" value="image">
                    <div class="op-import-icon icon-safe"><i class="fas fa-file-image"></i></div>
                    <span class="op-import-title title-safe">Flattened Image Mode</span>
                </div>
                <span class="op-import-desc desc-safe">Converts the document to a high-res, uneditable image. 100% accurate layout.</span>
            </label>

            <div class="op-import-actions">
                <button id="btn-cancel-pub" class="op-btn op-btn-cancel">Cancel</button>
                <button id="btn-start-pub" class="op-btn op-btn-start"><i class="fas fa-cloud-upload-alt" style="margin-right:6px;"></i>Start</button>
            </div>
        </div>
    `;

    DialogSystem.show('Import Publisher File', promptHtml, null, true);
    
    setTimeout(() => {
        const dialogContent = document.getElementById('custom-dialog-content');
        if (dialogContent && dialogContent.parentElement) {
            dialogContent.parentElement.style.width = '520px';
            dialogContent.parentElement.style.maxWidth = '95vw';
        }
    }, 10);    
    
    const defaultConfirm = document.getElementById('custom-dialog-confirm');
    if (defaultConfirm) defaultConfirm.style.display = 'none';

    document.getElementById('btn-cancel-pub').onclick = () => DialogSystem.close();

    document.getElementById('btn-start-pub').onclick = () => {
        const isImageMode = document.getElementById('mode-image-pub').checked;
        
        // --- 2. PROGRESS BAR ---
        const progressHtml = `
            <div style="text-align:center; padding: 10px;">
                <p id="convert-status-pub" style="margin-bottom:15px; font-weight:bold;">Processing Publisher Document...</p>
                <div style="width:100%; background:#eee; border-radius:10px; overflow:hidden; height:10px;">
                    <div id="convert-progress-pub" style="width:0%; height:100%; background:var(--selection); transition: width 0.3s;"></div>
                </div>
            </div>
        `;
        
        DialogSystem.show('Processing...', progressHtml, null, true);
        const newConfirm = document.getElementById('custom-dialog-confirm');
        if (newConfirm) newConfirm.style.display = 'none';

        // --- 3. EXECUTE CONVERSION ---
        const formData = new FormData();
        formData.append('pubFile', file); 

        const xhr = new XMLHttpRequest();
        const pubEndpoint = window.OPENPUB_SERVER_URL
            ? `${window.OPENPUB_SERVER_URL.replace(/\/$/, '')}/api/convert-pub`
            : 'https://buy-abraham-birth-future.trycloudflare.com/api/convert-pub';
        xhr.open('POST', pubEndpoint, true); 

        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 40; 
                const progressBar = document.getElementById('convert-progress-pub');
                if (progressBar) progressBar.style.width = percentComplete + '%';
                
                if (percentComplete >= 40) {
                    const statusText = document.getElementById('convert-status-pub');
                    if (statusText) statusText.innerText = "Generating the layout...";
                    
                    let fakeProgress = 40;
                    window.convertIntervalPub = setInterval(() => {
                        if(fakeProgress < 75) {
                            fakeProgress += 1;
                            const pb = document.getElementById('convert-progress-pub');
                            if (pb) pb.style.width = fakeProgress + '%';
                        }
                    }, 800);
                }
            }
        };

        xhr.onload = async function() {
            clearInterval(window.convertIntervalPub);
            
            if (xhr.status === 200) {
                const pb = document.getElementById('convert-progress-pub');
                if (pb) pb.style.width = '85%';
                const statusText = document.getElementById('convert-status-pub');
                if (statusText) statusText.innerText = "Processing Mapping...";
                
                try {
                    const data = JSON.parse(xhr.responseText);
                    const binaryString = window.atob(data.pdfData);
                    const binaryLen = binaryString.length;
                    const bytes = new Uint8Array(binaryLen);
                    for (let i = 0; i < binaryLen; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }

                    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
                    let opPages = [];
                    let hasImages = false;
                    const ops = pdfjsLib.OPS || { paintJpegXObject: 82, paintImageXObject: 85, paintImageMaskXObject: 83 };
                    const imageOps = [ops.paintJpegXObject, ops.paintImageXObject, ops.paintImageMaskXObject];

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const opList = await page.getOperatorList();
                        if (opList.fnArray.some(op => imageOps.includes(op))) {
                            hasImages = true; break; 
                        }
                    }

                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const viewport = page.getViewport({ scale: 1.0 });
                        const ratio = 96 / 72;
                        
                        const pageWidth = Math.round(viewport.width * ratio);
                        const pageHeight = Math.round(viewport.height * ratio);

                        let elements = [];
                        
                        if (isImageMode) {
                            const status = document.getElementById('convert-status-pub');
                            if (status) status.innerText = `Rendering High-Res Image (Page ${pageNum})...`;
                            
                            const viewportImg = page.getViewport({ scale: 2.5 }); 
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            canvas.width = viewportImg.width; canvas.height = viewportImg.height;
                            await page.render({ canvasContext: ctx, viewport: viewportImg }).promise;
                            
                            const imgDataUrl = canvas.toDataURL('image/jpeg', 0.95);

                            elements.push({
                                left: "0px", top: "0px", width: "100%", height: "100%",
                                transform: "none", zIndex: "1", type: "box", 
                                innerHTML: "", imgSrc: imgDataUrl, clipPath: "", bg: "", cropMode: false,
                                imgStyle: { width: "100%", height: "100%", position: "absolute", pointerEvents: "none" },
                                scaleX: "1", scaleY: "1"
                            });

                        } else {
                            const status = document.getElementById('convert-status-pub');
                            if (status) status.innerText = `Extracting Editable Text (Page ${pageNum})...`;

                            const pageResult = await window.OpenPubImporter.processPdfPage(page, pageNum, {
                                isPublisher: true,
                                hasImages,
                                structuredPage: (data.structuredPages && data.structuredPages[pageNum - 1]) || null
                            });
                            elements = pageResult.elements;
                        }

                        opPages.push({
                            id: Date.now() + pageNum,
                            width: `${pageWidth}px`, height: `${pageHeight}px`,
                            background: "#ffffff", elements: elements,
                            header: "", footer: "", borderStyle: "none", thumb: ""
                        });
                    }

                    const pb = document.getElementById('convert-progress-pub');
                    if (pb) pb.style.width = '100%';
                    setTimeout(() => {
                        document.getElementById('doc-title').innerText = data.title;
                        state.pages = opPages;
                        state.history = [];
                        state.historyIndex = -1;
                        state.currentPageIndex = 0;
                        renderPage(state.pages[0]);
                        
                        updateSidebar();
                        if(typeof updateThumbnails === 'function') updateThumbnails();
                        if(typeof pushHistory === 'function') pushHistory(); 
                        DialogSystem.close(); 
                    }, 500);

                } catch(err) {
                    console.error(err);
                    DialogSystem.close();
                    DialogSystem.alert('Error', "Failed to assemble layout from the Publisher document.");
                }
            } else {
                DialogSystem.close();
                DialogSystem.alert('Error', "I don't understand, I cannot process this Publisher file.");
            }
        };

        xhr.onerror = function() {
            clearInterval(window.convertIntervalPub);
            DialogSystem.close();
            DialogSystem.alert('Error', "Could not reach the conversion server.");
        };

        xhr.send(formData);
    };
}

/* =========================================================================
   PDF DOCUMENT IMPORT ENGINE (v5.14.2)
   ========================================================================= */
function openPdfDocument(file) {
    if (typeof DashboardSystem !== 'undefined' && DashboardSystem && typeof DashboardSystem.close === 'function') {
        try { DashboardSystem.close(); } catch (e) {}
    }

    // --- 1. THE PRE-FLIGHT MODAL ---
    const promptHtml = `
        <style>
            .op-import-modal { font-family: 'Segoe UI', sans-serif; color: #334155; width: 100%; box-sizing: border-box; }
            .op-import-modal p { margin-top: 0; font-size: 13px; margin-bottom: 12px; font-weight: 500; }
            .op-import-card { display: block; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s ease; background: #ffffff; width: 100%; box-sizing: border-box; }
            .op-import-card:hover { border-color: #94a3b8; background: #f8fafc; }
            .op-import-card:has(input:checked) { border-color: #0ea5e9; background: #f0f9ff; }
            .op-import-card.safe-mode { border-color: #fde68a; background: #fffbeb; }
            .op-import-card.safe-mode:hover { border-color: #fcd34d; background: #fef3c7; }
            .op-import-card.safe-mode:has(input:checked) { border-color: #f59e0b; background: #fef3c7; }
            .op-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
            .op-import-card input[type="radio"] { width: 16px; height: 16px; margin: 0; cursor: pointer; accent-color: #0ea5e9; }
            .op-import-card.safe-mode input[type="radio"] { accent-color: #d97706; }
            .op-import-icon { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; font-size: 13px; }
            .icon-edit { background: #e0f2fe; color: #0284c7; }
            .icon-safe { background: #fef3c7; color: #d97706; }
            .op-import-title { font-weight: 600; font-size: 13px; color: #0f172a; }
            .title-safe { color: #92400e; }
            .op-import-desc { font-size: 11.5px; color: #64748b; line-height: 1.4; margin-left: 24px; display: block; white-space: normal; }
            .desc-safe { color: #92400e; }
            .op-import-actions { display: flex; gap: 8px; margin-top: 15px; width: 100%; box-sizing: border-box; }
            .op-btn { flex: 1; padding: 8px 0; border-radius: 6px; font-weight: 600; font-size: 12.5px; cursor: pointer; transition: all 0.2s; border: none; text-align: center; }
            .op-btn-cancel { background: #f1f5f9; color: #475569; }
            .op-btn-cancel:hover { background: #e2e8f0; color: #0f172a; }
            .op-btn-start { background: #0ea5e9; color: white; }
            .op-btn-start:hover { background: #0284c7; }
        </style>

        <div class="op-import-modal">
            <p>Select how to process this PDF document:</p>
            <label class="op-import-card">
                <div class="op-card-header">
                    <input type="radio" name="importModePdf" id="mode-editable-pdf" value="editable" checked>
                    <div class="op-import-icon icon-edit"><i class="fas fa-file-signature"></i></div>
                    <span class="op-import-title">Editable Text Mode</span>
                </div>
                <span class="op-import-desc">Extracts text, fonts, colors, and layout as editable canvas elements. Best for documents you need to edit.</span>
            </label>

            <label class="op-import-card safe-mode">
                <div class="op-card-header">
                    <input type="radio" name="importModePdf" id="mode-image-pdf" value="image">
                    <div class="op-import-icon icon-safe"><i class="fas fa-file-image"></i></div>
                    <span class="op-import-title title-safe">Flattened Image Mode</span>
                </div>
                <span class="op-import-desc desc-safe">Converts pages to high-res, uneditable images with 100% accurate visual layout.</span>
            </label>

            <div class="op-import-actions">
                <button id="btn-cancel-pdf" class="op-btn op-btn-cancel">Cancel</button>
                <button id="btn-start-pdf" class="op-btn op-btn-start"><i class="fas fa-file-pdf" style="margin-right:6px;"></i>Open PDF</button>
            </div>
        </div>
    `;

    DialogSystem.show('Import PDF Document', promptHtml, null, true);

    setTimeout(() => {
        const dialogContent = document.getElementById('custom-dialog-content');
        if (dialogContent && dialogContent.parentElement) {
            dialogContent.parentElement.style.width = '520px';
            dialogContent.parentElement.style.maxWidth = '95vw';
        }
    }, 10);

    const defaultConfirm = document.getElementById('custom-dialog-confirm');
    if (defaultConfirm) defaultConfirm.style.display = 'none';

    document.getElementById('btn-cancel-pdf').onclick = () => DialogSystem.close();

    document.getElementById('btn-start-pdf').onclick = () => {
        const isImageMode = document.getElementById('mode-image-pdf').checked;

        // --- 2. PROGRESS MODAL ---
        const progressHtml = `
            <div style="text-align:center; padding: 10px;">
                <p id="convert-status-pdf" style="margin-bottom:15px; font-weight:bold;">Reading PDF Document...</p>
                <div style="width:100%; background:#eee; border-radius:10px; overflow:hidden; height:10px;">
                    <div id="convert-progress-pdf" style="width:15%; height:100%; background:var(--selection, #0ea5e9); transition: width 0.3s;"></div>
                </div>
            </div>
        `;

        DialogSystem.show('Processing PDF...', progressHtml, null, true);
        const newConfirm = document.getElementById('custom-dialog-confirm');
        if (newConfirm) newConfirm.style.display = 'none';

        // --- 3. LOCAL EXTRACTION ENGINE ---
        const reader = new FileReader();
        reader.onprogress = (evt) => {
            if (evt.lengthComputable) {
                const pct = Math.round((evt.loaded / evt.total) * 30);
                const pb = document.getElementById('convert-progress-pdf');
                if (pb) pb.style.width = pct + '%';
            }
        };

        reader.onload = async function(evt) {
            try {
                const pb = document.getElementById('convert-progress-pdf');
                if (pb) pb.style.width = '35%';
                const statusText = document.getElementById('convert-status-pdf');
                if (statusText) statusText.innerText = "Analyzing PDF Structure...";

                const bytes = new Uint8Array(evt.target.result);
                if (typeof pdfjsLib === 'undefined') {
                    throw new Error("PDF processing engine (pdfjsLib) is not loaded.");
                }

                const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
                let opPages = [];
                let hasImages = false;
                const ops = pdfjsLib.OPS || { paintJpegXObject: 82, paintImageXObject: 85, paintImageMaskXObject: 83 };
                const imageOps = [ops.paintJpegXObject, ops.paintImageXObject, ops.paintImageMaskXObject].filter(Boolean);

                for (let i = 1; i <= pdf.numPages; i++) {
                    const p = await pdf.getPage(i);
                    const opList = await p.getOperatorList();
                    if (opList && Array.isArray(opList.fnArray) && opList.fnArray.some(op => imageOps.includes(op))) {
                        hasImages = true;
                        break;
                    }
                }

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 1.0 });
                    const ratio = 96 / 72;

                    const pageWidth = Math.round(viewport.width * ratio);
                    const pageHeight = Math.round(viewport.height * ratio);

                    let elements = [];

                    if (isImageMode) {
                        if (statusText) statusText.innerText = `Rendering High-Res Image (Page ${pageNum} of ${pdf.numPages})...`;

                        const viewportImg = page.getViewport({ scale: 2.5 });
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = viewportImg.width;
                        canvas.height = viewportImg.height;
                        await page.render({ canvasContext: ctx, viewport: viewportImg }).promise;

                        const imgDataUrl = canvas.toDataURL('image/jpeg', 0.95);

                        elements.push({
                            left: "0px", top: "0px", width: "100%", height: "100%",
                            transform: "none", zIndex: "1", type: "box",
                            innerHTML: "", imgSrc: imgDataUrl, clipPath: "", bg: "", cropMode: false,
                            imgStyle: { width: "100%", height: "100%", position: "absolute", pointerEvents: "none" },
                            scaleX: "1", scaleY: "1"
                        });
                    } else {
                        if (statusText) statusText.innerText = `Extracting Editable Text (Page ${pageNum} of ${pdf.numPages})...`;

                        const pageResult = await window.OpenPubImporter.processPdfPage(page, pageNum, {
                            isPublisher: false,
                            nativePdf: true,
                            hasImages,
                            structuredPage: null
                        });
                        elements = pageResult.elements || [];
                    }

                    opPages.push({
                        id: Date.now() + pageNum,
                        width: `${pageWidth}px`, height: `${pageHeight}px`,
                        background: "#ffffff", elements: elements,
                        header: "", footer: "", borderStyle: "none", thumb: ""
                    });

                    if (pb) {
                        const pageProgress = 35 + Math.round((pageNum / pdf.numPages) * 60);
                        pb.style.width = pageProgress + '%';
                    }
                }

                if (pb) pb.style.width = '100%';
                setTimeout(() => {
                    const docTitle = file.name ? file.name.replace(/\.[^/.]+$/, "") : "Imported_PDF";
                    const titleEl = document.getElementById('doc-title');
                    if (titleEl) titleEl.innerText = docTitle;
                    state.pages = opPages;
                    state.history = [];
                    state.historyIndex = -1;
                    state.currentPageIndex = 0;
                    renderPage(state.pages[0]);

                    updateSidebar();
                    if (typeof updateThumbnails === 'function') updateThumbnails();
                    if (typeof pushHistory === 'function') pushHistory();
                    DialogSystem.close();

                    if (typeof window.showToastNotification === 'function') {
                        window.showToastNotification(`Opened PDF: ${docTitle} (${opPages.length} ${opPages.length === 1 ? 'page' : 'pages'})`, 'fa-file-pdf');
                    }
                }, 400);

            } catch (err) {
                console.error("PDF processing error:", err);
                DialogSystem.close();
                DialogSystem.alert('Error', "Failed to assemble layout from the PDF document: " + (err.message || err));
            }
        };

        reader.onerror = function() {
            DialogSystem.close();
            DialogSystem.alert('Error', "Could not read the selected PDF file.");
        };

        reader.readAsArrayBuffer(file);
    };
}
window.openPdfDocument = openPdfDocument;
window.uploadAndConvertPdf = openPdfDocument;

window.handleFileUpload = function(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.pdf')) {
        if (typeof openPdfDocument === 'function') openPdfDocument(file);
    } else if (fileName.endsWith('.pub') || fileName.endsWith('.pubx')) {
        if (typeof uploadAndConvertPub === 'function') uploadAndConvertPub(file);
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        if (typeof uploadAndConvertDoc === 'function') uploadAndConvertDoc(file);
    }
    e.target.value = '';
};

// ==========================================
// FILE OPEN & INSERTION LOGIC
// ==========================================

// --- STANDARD FILE OPEN MENU ---
const fileOpenEl = document.getElementById('file-open');
if (fileOpenEl) {
    fileOpenEl.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (typeof DashboardSystem !== 'undefined' && DashboardSystem && typeof DashboardSystem.close === 'function') {
            try { DashboardSystem.close(); } catch (err) {}
        }

        const fileName = file.name.toLowerCase();

        // 1. Handle PDF Documents (.pdf)
        if (fileName.endsWith('.pdf')) {
            if (typeof openPdfDocument === 'function') openPdfDocument(file);
            e.target.value = '';
            return;
        }

        // 2. Handle Publisher Files
        if (fileName.endsWith('.pub') || fileName.endsWith('.pubx')) {
            if (typeof uploadAndConvertPub === 'function') uploadAndConvertPub(file);
            e.target.value = ''; 
            return;
        }

        // 3. Handle Word Documents
        if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
            if (typeof uploadAndConvertDoc === 'function') uploadAndConvertDoc(file);
            e.target.value = ''; 
            return;
        }

        // 4. Handle OpenPublisher Native Files (.json or .opub)
        if (fileName.endsWith('.json') || fileName.endsWith('.opub')) {
            const reader = new FileReader();
            reader.onload = window.handlePublisherFileLoad;
            reader.readAsText(file);
            e.target.value = ''; 
        }
    });
}


// --- INSERT FILE (TEXT) MENU ---
document.getElementById('insert-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;

    if (!state.selectedEl) {
        if(typeof DialogSystem !== 'undefined') {
            DialogSystem.show('Insert File', 'Please select a text box first to insert the file contents into.');
        } else {
            alert('Please select a text box first to insert the file contents into.');
        }
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const data = JSON.parse(evt.target.result);
            let combinedText = '';
            if (data.pages && Array.isArray(data.pages)) {
                data.pages.forEach(page => {
                    if (page.elements && Array.isArray(page.elements)) {
                        page.elements.forEach(el => {
                            // Strictly only process generic boxes (which text boxes are)
                            if (el.type !== 'box' && el.type !== 'text' && el.type !== undefined) return;
                            if (el.isImage || el.isImageFallback) return;
                            if (!el.innerHTML) return;

                            const temp = document.createElement('div');
                            temp.innerHTML = el.innerHTML;
                            
                            // Text boxes are characterized by having a contenteditable region
                            const editableNode = temp.querySelector('[contenteditable="true"]');
                            if (!editableNode) return; // If it's not editable, it's not a text box (e.g. a grouped shape)

                            // WordArt sometimes sneaks in if it was editable, filter it out
                            if (temp.querySelector('.wa-text') || temp.querySelector('svg')) return;

                            // Scrape ONLY the pure text/html content, leaving behind the layout wrappers
                            let cleanHTML = editableNode.innerHTML.trim();
                            if (cleanHTML && cleanHTML !== 'Click to edit text' && cleanHTML !== '<br>') {
                                // Add a paragraph break between distinct text boxes
                                combinedText += cleanHTML + '<br><br>';
                            }
                        });
                    }
                });
            }
            
            if (combinedText) {
                const contentNode = state.selectedEl.querySelector('.element-content');
                // The target element's editable area is inside element-content > div
                const targetEditableNode = contentNode ? (contentNode.querySelector('[contenteditable="true"]') || contentNode) : null;
                
                if (targetEditableNode) {
                    targetEditableNode.innerHTML += combinedText;
                    if(typeof saveState === 'function') saveState();
                    if(typeof pushHistory === 'function') pushHistory();
                    if(typeof DialogSystem !== 'undefined') {
                        DialogSystem.show('Insert File', 'Text successfully imported from the document and poured into your selected box.');
                    }
                } else {
                    if(typeof DialogSystem !== 'undefined') {
                        DialogSystem.show('Insert File', 'Could not insert text into the selected element.');
                    }
                }
            } else {
                if(typeof DialogSystem !== 'undefined') {
                    DialogSystem.show('Insert File', 'No text found in the selected document to import.');
                }
            }
        } catch(err) {
            console.error(err);
            if(typeof DialogSystem !== 'undefined') {
                DialogSystem.show('Error', 'Failed to read or parse the file. Ensure it is a valid OpenPublisher document.');
            }
        }
        e.target.value = '';
    };
    reader.readAsText(file);
});
