
function saveDocument() {
    state.pages[state.currentPageIndex] = serializeCurrentPage();
    const docData = {
        title: document.getElementById('doc-title').innerText,
        pages: state.pages,
        hasMasterPage: state.hasMasterPage || false,
        isSpreadMode: state.isSpreadMode || false,
        rulerOriginX: state.rulerOriginX || 0,
        rulerOriginY: state.rulerOriginY || 0,
        margins: state.margins || {top: 48, right: 48, bottom: 48, left: 48},
        colorModel: document.getElementById('paper').classList.contains('cmyk-mode') ? 'CMYK' : 'RGB'
    };
    
    if (window.DashboardSystem && window.html2canvas) {
        const paper = document.getElementById('paper');
        html2canvas(paper, { scale: 0.2 }).then(canvas => {
            const thumbDataUrl = canvas.toDataURL('image/jpeg', 0.6);
            let sizeLabel = 'Custom';
            if (typeof window.getPageSizeLabel === 'function' && state.pages.length > 0) {
                const w = parseInt(state.pages[0].width);
                const h = parseInt(state.pages[0].height);
                sizeLabel = window.getPageSizeLabel(w, h);
            }
            DashboardSystem.addToRecent(docData.title + '.opub', docData, thumbDataUrl, sizeLabel);
        }).catch(err => console.log('Could not generate thumbnail', err));
    }

    const blob = new Blob([JSON.stringify(docData)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = docData.title + '.opub'; 
    a.click();
}


function openDocument() { document.getElementById('file-open').click(); }

function printFullDocument(isBooklet = false) {
    if (!isBooklet && typeof serializeCurrentPage === 'function') {
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

    // 2. Loop through every page saved in the state memory
    state.pages.forEach((page, pageIndex) => {
        // Create a blank piece of paper for this page
        let pageWrapper = document.createElement('div');
        pageWrapper.className = 'op-print-page';
        pageWrapper.style.width = page.width;
        pageWrapper.style.height = page.height;
        pageWrapper.style.background = page.background || '#ffffff';
        pageWrapper.style.position = 'relative';

        // 3. Reconstruct every element on this specific page
        let elementsToRender = page.elements || [];
        if (state.hasMasterPage && pageIndex > 0 && state.pages[0] && state.pages[0].elements && !page.ignoreMasterPage) {
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
            
            // If it's a background image layer, rebuild the image
            if (el.imgSrc) {
                 let img = document.createElement('img');
                 img.src = el.imgSrc;
                 if (el.altText) img.alt = el.altText;
                 // Apply the exact styles (like opacity) from the state
                 if (el.imgStyle) {
                     Object.assign(img.style, el.imgStyle);
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
    setTimeout(() => {
        window.print();
        
        // 5. Clean up the mess so we don't crash the browser's memory
        setTimeout(() => {
            printSpooler.innerHTML = '';
        }, 1000); 
    }, 100);
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

function uploadAndConvertDoc(file) {
    
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
        xhr.open('POST', 'https://determine-regardless-passage-occurring.trycloudflare.com/api/convert-doc', true); 

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
                            // OPTION B: EDITABLE TEXT MODE (WITH OPTICAL COLOR PICKER)
                            const status = document.getElementById('convert-status');
                            if (status) status.innerText = `Extracting Editable Text (Page ${pageNum})...`;

                            let bgImgData = null; 
                            let canvasWidth = 0;
                            let canvasHeight = 0;

                            // ALWAYS render the hidden canvas so our Optical Scanner has something to look at!
                            const viewportImg = page.getViewport({ scale: 2.0 }); 
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d', { willReadFrequently: true });
                            canvas.width = viewportImg.width; canvas.height = viewportImg.height;
                            await page.render({ canvasContext: ctx, viewport: viewportImg }).promise;
                            
                            bgImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            canvasWidth = canvas.width;
                            canvasHeight = canvas.height;
                            
                            if (hasImages) {
                                const imgDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                                elements.push({
                                    left: "0px", top: "0px", width: "100%", height: "100%",
                                    transform: "none", zIndex: "1", type: "box", 
                                    innerHTML: "", imgSrc: imgDataUrl, clipPath: "", bg: "", cropMode: false,
                                    imgStyle: { width: "100%", height: "100%", position: "absolute", pointerEvents: "none" },
                                    scaleX: "1", scaleY: "1"
                                });
                            }

                            await page.getOperatorList(); 
                            const textContent = await page.getTextContent();
                            
                            const items = [];
                            textContent.items.forEach(item => {
                                const str = item.str.trim().replace(/[\uE000-\uF8FF]/g, '•');
                                if (!str) return;

                                const tx = item.transform[4] * ratio;
                                const ty = (viewport.height - item.transform[5]) * ratio;
                                const fontSize = Math.abs(item.transform[0] || item.transform[3]) * ratio;
                                
                                let isItalicFont = Math.abs(item.transform[1]) > 0.1 || Math.abs(item.transform[2]) > 0.1;
                                let isBoldFont = false;

                                try {
                                    const rawFont = page.commonObjs.get(item.fontName) || page.objs.get(item.fontName);
                                    const realName = (rawFont?.name || rawFont?.fallbackName || "").toLowerCase();
                                    isBoldFont = realName.includes("bold") || realName.includes("black") || realName.includes("heavy");
                                    if (!isItalicFont) isItalicFont = realName.includes("italic") || realName.includes("oblique");
                                } catch(e) {}
                                
                                if (!isBoldFont || !isItalicFont) {
                                    const fallbackStyle = textContent.styles[item.fontName] || {};
                                    const fallbackName = (fallbackStyle.fontFamily || fallbackStyle.name || "").toLowerCase();
                                    if (!isBoldFont) isBoldFont = fallbackName.includes("bold") || fallbackName.includes("black") || fallbackName.includes("heavy");
                                    if (!isItalicFont) isItalicFont = fallbackName.includes("italic") || fallbackName.includes("oblique");
                                }

                                // --- THE OPTICAL COLOR PICKER ---
                                let optR = 0, optG = 0, optB = 0, samples = 0;
                                // Draw a virtual line through the physical center of the text on the hidden canvas
                                let py = Math.floor((ty - fontSize * 0.3) * (2.0 / ratio)); 
                                
                                if (py >= 0 && py < canvasHeight) {
                                    // Sample the pixels across the width of the text fragment
                                    for (let x = 0; x < (item.width * ratio); x += 2) {
                                        let px = Math.floor((tx + x) * (2.0 / ratio));
                                        if (px >= 0 && px < canvasWidth) {
                                            const idx = (py * canvasWidth + px) * 4;
                                            const r = bgImgData.data[idx];
                                            const g = bgImgData.data[idx+1];
                                            const b = bgImgData.data[idx+2];
                                            
                                            // Ignore the white background of the page! Only sample dark/colored ink pixels.
                                            if (r < 240 || g < 240 || b < 240) {
                                                optR += r; optG += g; optB += b;
                                                samples++;
                                            }
                                        }
                                    }
                                }
                                
                                // Calculate the true average ink color of the physical letters
                                let finalColor = 'black';
                                if (samples > 0) {
                                    finalColor = `rgb(${Math.round(optR/samples)}, ${Math.round(optG/samples)}, ${Math.round(optB/samples)})`;
                                }

                                const isFormLine = /^[_.\-|=☑\[\]]+$/.test(str.replace(/\s/g, ''));
                                items.push({ str, tx, ty, width: item.width * ratio, fontSize, isBold: isBoldFont, isItalic: isItalicFont, isFormLine, color: finalColor });
                            });

                            items.sort((a, b) => b.str.length - a.str.length);

                            const finalItems = [];
                            items.forEach(item => {
                                let isDup = false;
                                finalItems.forEach(existing => {
                                    const diffX = Math.abs(existing.tx - item.tx);
                                    const diffY = Math.abs(existing.ty - item.ty);
                                    
                                    if (diffY < (item.fontSize * 0.3) && diffX < (item.fontSize * 0.5)) {
                                        if (existing.str.includes(item.str) || item.str.includes(existing.str)) {
                                            isDup = true;
                                            if (diffX > 0.1 && diffX < 3.0) existing.isBold = true;
                                            if (item.isItalic) existing.isItalic = true;
                                            if (item.isBold) existing.isBold = true;
                                            
                                            if (item.str.length > existing.str.length) {
                                                existing.str = item.str;
                                                existing.width = item.width;
                                            }
                                        }
                                    }
                                });
                                if (!isDup) finalItems.push(item);
                            });

                            // Plot exactly to screen
                            finalItems.forEach(item => {
                                const safeWidth = (item.width * 1.05) + 10; 
                                const top = item.ty - (item.fontSize * 0.85);

                                let haloCSS = "text-shadow: none;";
                                
                                // Halo generation
                                if (hasImages && !item.isFormLine && bgImgData) {
                                    let px = Math.floor(item.tx * (2.0 / ratio));
                                    let py = Math.floor((item.ty - item.fontSize * 0.8) * (2.0 / ratio));
                                    
                                    if(px < 0) px = 0; if(py < 0) py = 0;
                                    if(px >= canvasWidth) px = canvasWidth - 1;
                                    if(py >= canvasHeight) py = canvasHeight - 1;
                                    
                                    const idx = (py * canvasWidth + px) * 4;
                                    const hColor = `rgb(${bgImgData.data[idx]}, ${bgImgData.data[idx+1]}, ${bgImgData.data[idx+2]})`;
                                    
                                    haloCSS = `text-shadow: 2px 0 2px ${hColor}, -2px 0 2px ${hColor}, 0 2px 2px ${hColor}, 0 -2px 2px ${hColor}, 2px 2px 2px ${hColor}, -2px -2px 2px ${hColor}, 2px -2px 2px ${hColor}, -2px 2px 2px ${hColor};`;
                                }
                                
                                const weightCSS = item.isBold ? "font-weight: bold !important;" : "font-weight: normal;";
                                const styleCSS = item.isItalic ? "font-style: italic !important;" : "font-style: normal;";

                                elements.push({
                                    left: `${item.tx.toFixed(1)}px`, 
                                    top: `${top.toFixed(1)}px`, 
                                    width: `${safeWidth.toFixed(1)}px`, 
                                    height: `${(item.fontSize * 1.2).toFixed(1)}px`, 
                                    transform: "none", zIndex: (zIndexCounter++).toString(), type: "box", 
                                    innerHTML: `<div style="width:100%; height:100%; font-family:sans-serif; color:${item.color}; font-size:${item.fontSize.toFixed(1)}px; line-height:1; white-space:nowrap; overflow:visible; background:transparent; ${haloCSS} padding: 0;"><span style="${weightCSS} ${styleCSS}">${item.str}</span></div>`, 
                                    imgSrc: "", clipPath: "", bg: "", cropMode: false, imgStyle: {}, scaleX: "1", scaleY: "1"
                                });
                            });
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

function uploadAndConvertPub(file) {
    
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
        
        // 🐛 THE FIX: Changed 'docFile' to 'pubFile' so the backend knows it's a Publisher document!
        formData.append('pubFile', file); 

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://determine-regardless-passage-occurring.trycloudflare.com/api/convert-pub', true); 

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
                        let zIndexCounter = 10;
                        
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

                            let bgImgData = null; 
                            let canvasWidth = 0; let canvasHeight = 0;

                            const viewportImg = page.getViewport({ scale: 2.0 }); 
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d', { willReadFrequently: true });
                            canvas.width = viewportImg.width; canvas.height = viewportImg.height;
                            await page.render({ canvasContext: ctx, viewport: viewportImg }).promise;
                            
                            bgImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            canvasWidth = canvas.width; canvasHeight = canvas.height;
                            
                            if (hasImages) {
                                const imgDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                                elements.push({
                                    left: "0px", top: "0px", width: "100%", height: "100%",
                                    transform: "none", zIndex: "1", type: "box", 
                                    innerHTML: "", imgSrc: imgDataUrl, clipPath: "", bg: "", cropMode: false,
                                    imgStyle: { width: "100%", height: "100%", position: "absolute", pointerEvents: "none" },
                                    scaleX: "1", scaleY: "1"
                                });
                            }

                            await page.getOperatorList(); 
                            const textContent = await page.getTextContent();
                            const items = [];
                            
                            textContent.items.forEach(item => {
                                const str = item.str.trim().replace(/[\uE000-\uF8FF]/g, '•');
                                if (!str) return;

                                const tx = item.transform[4] * ratio;
                                const ty = (viewport.height - item.transform[5]) * ratio;
                                const fontSize = Math.abs(item.transform[0] || item.transform[3]) * ratio;
                                
                                let isItalicFont = Math.abs(item.transform[1]) > 0.1 || Math.abs(item.transform[2]) > 0.1;
                                let isBoldFont = false;

                                try {
                                    const rawFont = page.commonObjs.get(item.fontName) || page.objs.get(item.fontName);
                                    const realName = (rawFont?.name || rawFont?.fallbackName || "").toLowerCase();
                                    isBoldFont = realName.includes("bold") || realName.includes("black") || realName.includes("heavy");
                                    if (!isItalicFont) isItalicFont = realName.includes("italic") || realName.includes("oblique");
                                } catch(e) {}
                                
                                if (!isBoldFont || !isItalicFont) {
                                    const fallbackStyle = textContent.styles[item.fontName] || {};
                                    const fallbackName = (fallbackStyle.fontFamily || fallbackStyle.name || "").toLowerCase();
                                    if (!isBoldFont) isBoldFont = fallbackName.includes("bold") || fallbackName.includes("black") || fallbackName.includes("heavy");
                                    if (!isItalicFont) isItalicFont = fallbackName.includes("italic") || fallbackName.includes("oblique");
                                }

                                let optR = 0, optG = 0, optB = 0, samples = 0;
                                let py = Math.floor((ty - fontSize * 0.3) * (2.0 / ratio)); 
                                
                                if (py >= 0 && py < canvasHeight) {
                                    for (let x = 0; x < (item.width * ratio); x += 2) {
                                        let px = Math.floor((tx + x) * (2.0 / ratio));
                                        if (px >= 0 && px < canvasWidth) {
                                            const idx = (py * canvasWidth + px) * 4;
                                            const r = bgImgData.data[idx]; const g = bgImgData.data[idx+1]; const b = bgImgData.data[idx+2];
                                            if (r < 240 || g < 240 || b < 240) {
                                                optR += r; optG += g; optB += b; samples++;
                                            }
                                        }
                                    }
                                }
                                
                                let finalColor = 'black';
                                if (samples > 0) finalColor = `rgb(${Math.round(optR/samples)}, ${Math.round(optG/samples)}, ${Math.round(optB/samples)})`;

                                const isFormLine = /^[_.\-|=☑\[\]]+$/.test(str.replace(/\s/g, ''));
                                items.push({ str, tx, ty, width: item.width * ratio, fontSize, isBold: isBoldFont, isItalic: isItalicFont, isFormLine, color: finalColor });
                            });

                            items.sort((a, b) => b.str.length - a.str.length);
                            const finalItems = [];
                            
                            items.forEach(item => {
                                let isDup = false;
                                finalItems.forEach(existing => {
                                    const diffX = Math.abs(existing.tx - item.tx);
                                    const diffY = Math.abs(existing.ty - item.ty);
                                    
                                    if (diffY < (item.fontSize * 0.3) && diffX < (item.fontSize * 0.5)) {
                                        if (existing.str.includes(item.str) || item.str.includes(existing.str)) {
                                            isDup = true;
                                            if (diffX > 0.1 && diffX < 3.0) existing.isBold = true;
                                            if (item.isItalic) existing.isItalic = true;
                                            if (item.isBold) existing.isBold = true;
                                            if (item.str.length > existing.str.length) { existing.str = item.str; existing.width = item.width; }
                                        }
                                    }
                                });
                                if (!isDup) finalItems.push(item);
                            });

                            finalItems.forEach(item => {
                                const safeWidth = (item.width * 1.05) + 10; 
                                const top = item.ty - (item.fontSize * 0.85);
                                let haloCSS = "text-shadow: none;";
                                
                                if (hasImages && !item.isFormLine && bgImgData) {
                                    let px = Math.floor(item.tx * (2.0 / ratio));
                                    let py = Math.floor((item.ty - item.fontSize * 0.8) * (2.0 / ratio));
                                    if(px < 0) px = 0; if(py < 0) py = 0; if(px >= canvasWidth) px = canvasWidth - 1; if(py >= canvasHeight) py = canvasHeight - 1;
                                    const idx = (py * canvasWidth + px) * 4;
                                    const hColor = `rgb(${bgImgData.data[idx]}, ${bgImgData.data[idx+1]}, ${bgImgData.data[idx+2]})`;
                                    haloCSS = `text-shadow: 2px 0 2px ${hColor}, -2px 0 2px ${hColor}, 0 2px 2px ${hColor}, 0 -2px 2px ${hColor}, 2px 2px 2px ${hColor}, -2px -2px 2px ${hColor}, 2px -2px 2px ${hColor}, -2px 2px 2px ${hColor};`;
                                }
                                
                                const weightCSS = item.isBold ? "font-weight: bold !important;" : "font-weight: normal;";
                                const styleCSS = item.isItalic ? "font-style: italic !important;" : "font-style: normal;";

                                elements.push({
                                    left: `${item.tx.toFixed(1)}px`, top: `${top.toFixed(1)}px`, 
                                    width: `${safeWidth.toFixed(1)}px`, height: `${(item.fontSize * 1.2).toFixed(1)}px`, 
                                    transform: "none", zIndex: (zIndexCounter++).toString(), type: "box", 
                                    innerHTML: `<div style="width:100%; height:100%; font-family:sans-serif; color:${item.color}; font-size:${item.fontSize.toFixed(1)}px; line-height:1; white-space:nowrap; overflow:visible; background:transparent; ${haloCSS} padding: 0;"><span style="${weightCSS} ${styleCSS}">${item.str}</span></div>`, 
                                    imgSrc: "", clipPath: "", bg: "", cropMode: false, imgStyle: {}, scaleX: "1", scaleY: "1"
                                });
                            });
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

// ==========================================
// FILE OPEN & INSERTION LOGIC
// ==========================================

// --- STANDARD FILE OPEN MENU ---
document.getElementById('file-open').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;

    const fileName = file.name.toLowerCase();

    // 1. Handle Publisher Files
    if (fileName.endsWith('.pub') || fileName.endsWith('.pubx')) {
        if (typeof uploadAndConvertPub === 'function') uploadAndConvertPub(file);
        e.target.value = ''; 
        return;
    }

    // 2. Handle Word Documents
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        if (typeof uploadAndConvertDoc === 'function') uploadAndConvertDoc(file);
        e.target.value = ''; 
        return;
    }

    // 3. Handle OpenPublisher Native Files (.json or .opub)
    if (fileName.endsWith('.json') || fileName.endsWith('.opub')) {
        const reader = new FileReader();
        reader.onload = window.handlePublisherFileLoad;
        reader.readAsText(file);
        e.target.value = ''; 
    }
});

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