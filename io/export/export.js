window.exportAsHTML = async function(opts = {}) {
    if (typeof opts === 'boolean') opts = { seamless: opts };
    // Save current page state first
    state.pages[state.currentPageIndex] = serializeCurrentPage();
    
    const docTitle = document.getElementById('doc-title').innerText || 'Publication1';
    
    // --- Progress Dialog ---
    const progressHtml = `
        <div style="text-align:center; padding: 10px;">
            <p id="html-export-status" style="margin-bottom:15px; font-weight:bold;">Preparing HTML Export...</p>
            <div style="width:100%; background:#eee; border-radius:10px; overflow:hidden; height:10px;">
                <div id="html-export-progress" style="width:0%; height:100%; background:var(--ui-theme-color); transition: width 0.3s;"></div>
            </div>
        </div>
    `;
    if (typeof DialogSystem !== 'undefined') DialogSystem.show('Export as HTML', progressHtml, null, true);
    
    setTimeout(() => {
        if (document.getElementById('custom-dialog-confirm')) document.getElementById('custom-dialog-confirm').style.display = 'none';
        if (document.getElementById('custom-dialog-cancel')) document.getElementById('custom-dialog-cancel').style.display = 'none';
    }, 10);
    
    await new Promise(r => setTimeout(r, 100));
    
    try {
        // --- 1. Scan for used fonts ---
        const setStatus = (msg, pct) => {
            const s = document.getElementById('html-export-status');
            const p = document.getElementById('html-export-progress');
            if (s) s.innerText = msg;
            if (p) p.style.width = pct + '%';
        };
        
        setStatus('Scanning typography...', 15);
        await new Promise(r => setTimeout(r, 50));
        
        const usedFonts = new Set();
        state.pages.forEach(page => {
            const pageStr = JSON.stringify(page);
            const fontRegex = /font-family:\s*['"]?([^'";,}\\]+)/gi;
            let m;
            while ((m = fontRegex.exec(pageStr)) !== null) {
                let font = m[1].trim().replace(/['"]/g, '');
                if (font && font !== 'inherit' && font !== 'sans-serif' && font !== 'serif' && font !== 'monospace') {
                    usedFonts.add(font);
                }
            }
        });
        
        // Build a Google Fonts link that only includes fonts actually used
        let fontLink = '';
        const googleFontFamilies = [];
        usedFonts.forEach(f => {
            // Skip system fonts
            const systemFonts = ['Arial', 'Segoe UI', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Helvetica', 'sans-serif', 'serif'];
            if (!systemFonts.includes(f)) {
                googleFontFamilies.push('family=' + f.replace(/\s+/g, '+') + ':wght@400;700');
            }
        });
        if (opts.fonts !== false && googleFontFamilies.length > 0) {
            fontLink = `<link href="https://fonts.googleapis.com/css2?${googleFontFamilies.join('&')}&display=swap" rel="stylesheet">`;
        }
        
        // --- 1.5 Setup Print Spooler for Computed Styles ---
        setStatus('Generating exact computed styles...', 30);
        await new Promise(r => setTimeout(r, 50));
        
        let printSpooler = document.getElementById('op-html-spooler');
        if (!printSpooler) {
            printSpooler = document.createElement('div');
            printSpooler.id = 'op-html-spooler';
            printSpooler.style.position = 'absolute';
            printSpooler.style.left = '-9999px';
            printSpooler.style.opacity = '0.01'; // Changed from visibility:hidden for html2canvas
            printSpooler.style.pointerEvents = 'none';
            document.body.appendChild(printSpooler);
        }
        printSpooler.innerHTML = '';
        
        let pagesHTML = '';
        
        for (let i = 0; i < state.pages.length; i++) {
            setStatus(`Rendering page ${i + 1} of ${state.pages.length}...`, 30 + Math.round((i / state.pages.length) * 50));
            await new Promise(r => setTimeout(r, 20));
            
            const page = state.pages[i];
            const pW = parseFloat(page.width) || 794;
            const pH = parseFloat(page.height) || 1123;
            
            // Build the page in the spooler to get computed styles
            let pageWrapper = document.createElement('div');
            pageWrapper.className = 'op-page';
            pageWrapper.style.position = 'relative';
            pageWrapper.style.width = pW + 'px';
            pageWrapper.style.minHeight = pH + 'px';
            pageWrapper.style.background = page.background || '#ffffff';
            pageWrapper.style.margin = opts.seamless ? '0 auto' : '0 auto 30px auto';
            pageWrapper.style.overflow = 'hidden';
            pageWrapper.style.boxShadow = opts.seamless ? 'none' : '0 2px 15px rgba(0,0,0,0.12)';
            pageWrapper.style.boxSizing = 'border-box';
            
            let elementsToRender = page.elements || [];
            let renderHeader = page.header || '';
            let renderFooter = page.footer || '';

            if (state.hasMasterPage && i > 0 && state.pages[0] && !page.ignoreMasterPage) {
                if (state.pages[0].elements) {
                    elementsToRender = state.pages[0].elements.concat(elementsToRender);
                }
                renderHeader = state.pages[0].header || '';
                renderFooter = state.pages[0].footer || '';
            }
            
            if (elementsToRender.length > 0) {
                for (const data of elementsToRender) {
                    if (data.innerHTML && data.innerHTML.includes('spread-fold-line')) continue;
                    
                    let elDiv = document.createElement('div');
                    elDiv.style.position = 'absolute';
                    elDiv.style.left = data.left;
                    elDiv.style.top = data.top;
                    elDiv.style.width = data.width;
                    elDiv.style.height = data.height;
                    elDiv.style.zIndex = data.zIndex || 10;
                    if (data.transform && data.transform !== 'none') elDiv.style.transform = data.transform;
                    
                    let contentDiv = document.createElement('div');
                    contentDiv.style.width = '100%';
                    contentDiv.style.height = '100%';
                    contentDiv.style.overflow = 'hidden';
                    contentDiv.style.position = 'relative';
                    contentDiv.style.cssText += (data.contentCssText || `transform: scale(${data.scaleX || 1}, ${data.scaleY || 1});`);
                    
                    if (data.imgSrc) {
                        let img = document.createElement('img');
                        let src = data.imgSrc;
                        if (opts.base64 && !src.startsWith('data:')) {
                            try {
                                const response = await fetch(src, { mode: 'cors', credentials: 'omit' });
                                const blob = await response.blob();
                                src = await new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result);
                                    reader.readAsDataURL(blob);
                                });
                            } catch (e) {
                                console.warn('CORS blocked base64 conversion for:', src);
                            }
                        }
                        img.src = src;
                        img.alt = data.altText || '';
                        Object.assign(img.style, data.imgStyle || { width:'100%', height:'100%' });
                        contentDiv.appendChild(img);
                    } else if (data.clipPath) {
                        let bgDiv = document.createElement('div');
                        bgDiv.style.width = '100%';
                        bgDiv.style.height = '100%';
                        bgDiv.style.background = data.bg;
                        bgDiv.style.clipPath = data.clipPath;
                        contentDiv.appendChild(bgDiv);
                    } else {
                        contentDiv.innerHTML = (data.innerHTML || '').replace(/contenteditable="true"/g, 'contenteditable="false"');
                    }
                    
                    elDiv.appendChild(contentDiv);
                    pageWrapper.appendChild(elDiv);
                }
            }
            if (state.headersVisible) {
                if (renderHeader) pageWrapper.insertAdjacentHTML('beforeend', `<div class="page-header visible" style="pointer-events:none; z-index:0; position:absolute; top:0; left:0; width:100%; font-family:inherit;">${renderHeader}</div>`);
                if (renderFooter) pageWrapper.insertAdjacentHTML('beforeend', `<div class="page-footer visible" style="pointer-events:none; z-index:0; position:absolute; bottom:0; left:0; width:100%; font-family:inherit;">${renderFooter}</div>`);
            }
            
            printSpooler.appendChild(pageWrapper);
            
            // --- Inline Computed Styles ---
            // For Tables and WordArt, we extract the exact styles calculated by the browser
            // and hard-bake them into the style attribute, dodging CORS and email client limitations!
            const targetElements = pageWrapper.querySelectorAll('.wa-text, .wa-wrapper, table, th, td, tr, .pub-table');
            targetElements.forEach(el => {
                const comp = window.getComputedStyle(el);
                const props = [
                    'color', 'background', 'font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing',
                    'text-shadow', 'text-transform', 'text-align', 'border', 'border-top', 'border-bottom', 'border-left', 'border-right',
                    'border-collapse', 'padding', 'margin', 'filter', '-webkit-text-stroke', '-webkit-background-clip', 'transform'
                ];
                let inlineStr = '';
                props.forEach(p => {
                    const val = comp.getPropertyValue(p);
                    if (val && val !== 'none' && val !== 'normal' && val !== '0px' && val !== 'rgba(0, 0, 0, 0)' && val !== 'transparent' && val !== 'matrix(1, 0, 0, 1, 0, 0)') {
                        inlineStr += `${p}: ${val}; `;
                    }
                });
                
                // Keep background-clip for WordArt gradients
                if (el.className.includes('wa-style-') && comp.webkitBackgroundClip === 'text') {
                    inlineStr += `-webkit-background-clip: text; -webkit-text-fill-color: transparent; `;
                }
                
                el.style.cssText += inlineStr;
            });
            
            if (opts.email && typeof html2canvas !== 'undefined') {
                const canvas = await html2canvas(pageWrapper, { scale: 2, useCORS: true, backgroundColor: page.background || '#ffffff' });
                const imgData = canvas.toDataURL('image/jpeg', 0.85);
                const tbl = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: ${opts.seamless ? '0 auto' : '0 auto 30px auto'};">
    <tr>
        <td align="center">
            <img src="${imgData}" width="${pW}" style="display:block; max-width:100%; height:auto; border:0;" />
        </td>
    </tr>
</table>`;
                pagesHTML += `\n<!-- Page ${i + 1} -->\n` + tbl;
            } else {
                pagesHTML += `\n<!-- Page ${i + 1} -->\n` + pageWrapper.outerHTML;
            }
            printSpooler.innerHTML = ''; // Clean up after capturing
        }
        
        // Clean up spooler entirely
        if(printSpooler) document.body.removeChild(printSpooler);
        
        // --- 3. Assemble final HTML ---
        setStatus('Assembling HTML file...', 85);
        await new Promise(r => setTimeout(r, 50));
        
        let seoTags = '';
        if (opts.seo) {
            let fullText = '';
            state.pages.forEach(p => p.elements && p.elements.forEach(e => {
                if(e.innerHTML && !e.innerHTML.includes('spread-fold-line')) {
                    let temp = document.createElement('div');
                    temp.innerHTML = e.innerHTML.replace(/<[^>]+>/g, ' ');
                    fullText += temp.textContent + ' ';
                }
            }));
            if (fullText.length > 20) {
                const stopWords = ['the','is','at','which','and','on','a','an','in','of','to','for','with','it','as','be','are','that','this','from','by','or','you','your','we','our','will','can'];
                const words = fullText.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
                const frequency = {};
                words.forEach(w => { if (w.length > 2 && !stopWords.includes(w)) frequency[w] = (frequency[w] || 0) + 1; });
                const keywords = Object.keys(frequency).sort((a, b) => frequency[b] - frequency[a]).slice(0, 5).join(', ');
                const desc = fullText.substring(0, 150).replace(/\s+/g, ' ').trim() + '...';
                seoTags = `
    <meta name="description" content="${desc}">
    <meta name="keywords" content="${keywords}">
    <meta property="og:title" content="${docTitle}">
    <meta property="og:description" content="${desc}">
    <meta property="og:type" content="article">`;
            }
        }

        let finalHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${docTitle}</title>${seoTags}
    ${fontLink}
    <style>
        /* Open Publisher HTML Export */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: ${opts.seamless ? (state.pages[0]?.background || '#ffffff') : '#f0f0f0'};
            font-family: 'Segoe UI', Arial, sans-serif;
            padding: ${opts.seamless ? '0' : '20px 0'};
            ${opts.selectable !== false && !opts.email ? '' : 'user-select: none; -webkit-user-select: none;'}
        }
        .op-page {
            page-break-after: always;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .op-page:last-child {
            page-break-after: auto;
            margin-bottom: 0 !important;
        }
        img { border: 0; display: block; }
        @media print {
            body { background: white; padding: 0; }
            .op-page { box-shadow: none !important; margin-bottom: 0 !important; }
        }
        ${opts.autoscale !== false ? `
        @media (max-width: ${state.pages[0]?.width || 794}px) {
            .op-page, table {
                transform-origin: top center;
                transform: scale(calc(100vw / ${state.pages[0]?.width || 794}));
                margin-bottom: calc(-100vw * (1 - (100vw / ${state.pages[0]?.width || 794}))) !important;
            }
        }
        ` : `
        @media (max-width: 850px) {
            .op-page {
                transform-origin: top center;
                transform: scale(0.5);
                margin-bottom: -40% !important;
            }
        }`}
    </style>
</head>
<body>
    <!--
        Generated by Open Publisher (https://openpublisher.app)
        Document: ${docTitle}
        Pages: ${state.pages.length}
        Date: ${new Date().toISOString().split('T')[0]}
    -->
${pagesHTML}
</body>
</html>`;
        
        if (opts.minify) {
            finalHTML = finalHTML.replace(/>\s+</g, '><').trim();
        }
        
        // --- 4. Download ---
        setStatus('Downloading...', 100);
        await new Promise(r => setTimeout(r, 100));
        
        const blob = new Blob([finalHTML], { type: 'text/html;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = docTitle.replace(/\s+/g, '_') + '.html';
        a.click();
        
        setTimeout(() => { if (typeof DialogSystem !== 'undefined') DialogSystem.close(); }, 1200);
        
    } catch (err) {
        if (typeof DialogSystem !== 'undefined') {
            DialogSystem.close();
            DialogSystem.alert('Export Error', 'Failed to export HTML: ' + err.message);
        }
    }
}

/* =========================================================================
   PACK AND GO (COMMERCIAL PRINTER EXPORT)
   ========================================================================= */
window.packAndGo = async function() {
    if (typeof JSZip === 'undefined') {
        if(typeof DialogSystem !== 'undefined') DialogSystem.alert('Error', 'Zip library not loaded. Check your connection.');
        return;
    }
    
    // UI Progress Indicator
    const progressHtml = `
        <div style="text-align:center; padding: 10px;">
            <p id="pack-status" style="margin-bottom:15px; font-weight:bold;">Analyzing Document Assets...</p>
            <div style="width:100%; background:#eee; border-radius:10px; overflow:hidden; height:10px;">
                <div id="pack-progress" style="width:0%; height:100%; background:var(--ui-theme-color); transition: width 0.3s;"></div>
            </div>
        </div>
    `;
    if(typeof DialogSystem !== 'undefined') DialogSystem.show('Pack and Go', progressHtml, null, true);
    
    setTimeout(() => {
        if(document.getElementById('custom-dialog-confirm')) document.getElementById('custom-dialog-confirm').style.display = 'none';
        if(document.getElementById('custom-dialog-cancel')) document.getElementById('custom-dialog-cancel').style.display = 'none';
    }, 10);
    
    // Wait for UI to render
    await new Promise(r => setTimeout(r, 100));
    
    try {
        const zip = new JSZip();
        const imgFolder = zip.folder("Images");
        
        // 1. Serialize State
        state.pages[state.currentPageIndex] = serializeCurrentPage();
        const docData = {
            title: document.getElementById('doc-title').innerText,
            pages: state.pages,
            colorModel: document.getElementById('paper').classList.contains('cmyk-mode') ? 'CMYK' : 'RGB'
        };
        let docString = JSON.stringify(docData);
        
        // 2. Extract Base64 Images
        if(document.getElementById('pack-status')) document.getElementById('pack-status').innerText = 'Extracting Images...';
        if(document.getElementById('pack-progress')) document.getElementById('pack-progress').style.width = '30%';
        await new Promise(r => setTimeout(r, 50));
        
        let imgCount = 1;
        docString = docString.replace(/data:image\/(png|jpeg|gif|webp);base64,([a-zA-Z0-9+/=]+)/g, function(match, ext, data) {
            let filename = `image_${imgCount}.${ext}`;
            imgFolder.file(filename, data, {base64: true});
            imgCount++;
            return `Images/${filename}`;
        });
        
        // 3. Scan for Typography
        if(document.getElementById('pack-status')) document.getElementById('pack-status').innerText = 'Compiling Fonts...';
        if(document.getElementById('pack-progress')) document.getElementById('pack-progress').style.width = '60%';
        await new Promise(r => setTimeout(r, 50));
        
        let usedFonts = new Set();
        const fontRegex = /font-family:\\?['"]?([^\\'";]+)\\?['"]?/gi;
        let match;
        while ((match = fontRegex.exec(docString)) !== null) {
            let font = match[1].trim();
            font = font.split(',')[0].replace(/['"]/g, '').trim();
            usedFonts.add(font);
        }
        usedFonts.delete('inherit');
        usedFonts.delete('sans-serif');
        usedFonts.delete('serif');
        
        let fontsText = "--- Open Publisher: Pack and Go Font Manifest ---\n\n";
        fontsText += "The following fonts are required to correctly render this document.\n";
        fontsText += "Standard web fonts can be downloaded for free via Google Fonts (fonts.google.com).\n\n";
        usedFonts.forEach(f => {
            fontsText += `- ${f}\n`;
        });
        zip.file("Fonts.txt", fontsText);
        
        // 4. Save Native Project File
        if(document.getElementById('pack-status')) document.getElementById('pack-status').innerText = 'Building Archive...';
        if(document.getElementById('pack-progress')) document.getElementById('pack-progress').style.width = '85%';
        await new Promise(r => setTimeout(r, 50));
        
        zip.file(docData.title + ".opub", docString);
        
        // 5. Generate ZIP
        const content = await zip.generateAsync({type:"blob"});
        if(document.getElementById('pack-progress')) document.getElementById('pack-progress').style.width = '100%';
        if(document.getElementById('pack-status')) document.getElementById('pack-status').innerText = 'Download Starting...';
        
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = docData.title.replace(/\s+/g, '_') + '_PackAndGo.zip';
        a.click();
        
        setTimeout(() => { if(typeof DialogSystem !== 'undefined') DialogSystem.close(); }, 1500);
        
    } catch(err) {
        if(typeof DialogSystem !== 'undefined') {
            DialogSystem.close();
            DialogSystem.alert('Error', 'Failed to generate package: ' + err);
        }
    }
}
window.exportNativePDF = function() {
    if(typeof DialogSystem !== 'undefined') {
        const msg = `
            <div style="text-align: center; font-size: 14px; margin-bottom: 10px;">
                <p>Open Publisher uses your browser's native print engine to generate perfect, high-resolution vector PDFs.</p>
                <br>
                <p>In the print dialog that opens, simply change your <b>Destination</b> or <b>Printer</b> to <b>"Save as PDF"</b>.</p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button id="btn-proceed-pdf" style="background:#0ea5e9; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;">Open Print Dialog</button>
            </div>
        `;
        DialogSystem.show('Export High-Res PDF', msg, null, true);
        
        setTimeout(() => {
            if(document.getElementById('custom-dialog-confirm')) document.getElementById('custom-dialog-confirm').style.display = 'none';
            if(document.getElementById('custom-dialog-cancel')) document.getElementById('custom-dialog-cancel').style.display = 'none';
            
            document.getElementById('btn-proceed-pdf').onclick = () => {
                DialogSystem.close();
                setTimeout(() => {
                    if (typeof printFullDocument === 'function') printFullDocument();
                }, 300);
            };
        }, 10);
    } else {
        if (typeof printFullDocument === 'function') printFullDocument();
    }
};

window.exportXPS = function() {
    if(typeof DialogSystem !== 'undefined') {
        const msg = `
            <div style="text-align: center; font-size: 14px; margin-bottom: 10px;">
                <p>To save this document as an XPS file, you can use the built-in Windows XPS Document Writer.</p>
                <br>
                <p>In the print dialog that opens, simply change your <b>Destination</b> or <b>Printer</b> to <b>"Microsoft XPS Document Writer"</b>.</p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button id="btn-proceed-xps" style="background:#0ea5e9; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;">Open Print Dialog</button>
            </div>
        `;
        DialogSystem.show('Export as XPS', msg, null, true);
        
        setTimeout(() => {
            if(document.getElementById('custom-dialog-confirm')) document.getElementById('custom-dialog-confirm').style.display = 'none';
            if(document.getElementById('custom-dialog-cancel')) document.getElementById('custom-dialog-cancel').style.display = 'none';
            
            document.getElementById('btn-proceed-xps').onclick = () => {
                DialogSystem.close();
                setTimeout(() => {
                    if (typeof printFullDocument === 'function') printFullDocument();
                }, 300);
            };
        }, 10);
    } else {
        if (typeof printFullDocument === 'function') printFullDocument();
    }
};
