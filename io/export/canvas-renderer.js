window.bakeSVGFiltersForHtml2Canvas = async function(clone, original) {
    const origImages = original.querySelectorAll('img');
    const cloneImages = clone.querySelectorAll('img');
    
    for (let i = 0; i < cloneImages.length; i++) {
        const cImg = cloneImages[i];
        const oImg = origImages[i];
        if (!oImg) continue;
        
        const comp = window.getComputedStyle(oImg);
        let filter = comp.filter !== 'none' ? comp.filter : oImg.style.filter;
        let opacity = comp.opacity !== '1' ? comp.opacity : oImg.style.opacity;
        
        if (!filter || filter === 'none') {
            const inner = oImg.closest('.element-content');
            if (inner) {
                const iComp = window.getComputedStyle(inner);
                if (iComp.filter && iComp.filter !== 'none') filter = iComp.filter;
            }
        }
        
        if ((filter && filter !== 'none') || (opacity && opacity !== '1')) {
            let finalSrc = oImg.src;
            try {
                let isSvg = false;
                let svgText = null;

                if (finalSrc.includes('.svg') && !finalSrc.startsWith('data:')) {
                    try {
                        let fetchSrc = finalSrc;
                        fetchSrc += (fetchSrc.includes('?') ? '&' : '?') + 'corsbuster=' + Date.now();
                        const svgRes = await fetch(fetchSrc, { mode: 'cors' });
                        if (svgRes.ok) {
                            svgText = await svgRes.text();
                            isSvg = true;
                        }
                    } catch (fetchErr) {
                        console.warn("Could not fetch SVG for dimension normalization (SSL/CORS). Proceeding to direct bake.", fetchErr);
                    }
                } else if (finalSrc.startsWith('data:image/svg+xml')) {
                    const parts = finalSrc.split(',');
                    if (finalSrc.includes(';base64,')) {
                        svgText = decodeURIComponent(escape(atob(parts[1])));
                    } else {
                        svgText = decodeURIComponent(parts[1]);
                    }
                    isSvg = true;
                }

                if (isSvg && svgText) {
                    // Normalize dimensions
                    svgText = svgText.replace(/\bpreserveAspectRatio\s*=\s*["'][^"']*["']/gi, '');
                    svgText = svgText.replace(/<svg/i, '<svg preserveAspectRatio="none" width="100%" height="100%"');
                    finalSrc = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))}`;
                }
            } catch (e) {
                console.warn("Failed to inject SVG filters:", e);
            }

            // Force proxy for external URLs to guarantee CORS headers and bypass local SSL cert issues
            if (finalSrc && finalSrc.startsWith('http') && !finalSrc.includes('wsrv.nl')) {
                let cleanUrl = finalSrc.replace(/^https?:\/\//, '');
                if (cleanUrl.includes('acr.floydcraft')) cleanUrl = 'http://' + cleanUrl;
                finalSrc = `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}`;
            }

            // Fallback for raster images (PNG/JPG) using canvas baking
            let displayW = oImg.naturalWidth || parseFloat(comp.width) || 300;
            let displayH = oImg.naturalHeight || parseFloat(comp.height) || 300;

            // PREVENT OUT-OF-MEMORY (OOM): Cap the baking resolution to prevent huge canvases for high-res images
            const maxDim = 2000;
            if (displayW > maxDim || displayH > maxDim) {
                const ratio = Math.min(maxDim / displayW, maxDim / displayH);
                displayW = Math.round(displayW * ratio);
                displayH = Math.round(displayH * ratio);
            }

            try {
                const baked = await window.bakeImageForPrint(finalSrc, displayW, displayH, {
                    filter: filter !== 'none' ? filter : '',
                    opacity: opacity !== '1' ? opacity : '1',
                    clipPath: '',
                    imgStyle: { width: '100%', height: '100%', objectFit: 'fill' }
                });
                
                const bakedSrc = typeof baked === 'string' ? baked : baked.src;
                
                await new Promise(r => {
                    cImg.onload = r;
                    cImg.onerror = r;
                    cImg.src = bakedSrc;
                });
                
                cImg.style.filter = 'none';
                cImg.style.opacity = '1';
            } catch (e) {
                console.warn('Export bake failed, fallback to style', e);
                cImg.src = finalSrc;
                cImg.style.filter = filter !== 'none' ? filter : '';
                cImg.style.opacity = opacity !== '1' ? opacity : '1';
            }
        }

        setTimeout(() => {
            const input = document.getElementById('doc-protect-pw');
            if (input) input.focus();
        }, 100);
    }
};


window.capturePageAsCanvasWithFilters = async function(paper, scaleMultiplier) {
    const clone = paper.cloneNode(true);
    
    // Strip UI elements from the clone before capturing
    clone.querySelectorAll('.margin-guides, .resize-handle, .rotate-handle, .rotate-stick, .selection-box, .op-dynamic-print-style').forEach(el => el.remove());

    const stagingArea = document.createElement('div');
    stagingArea.style.cssText = 'position: fixed; top: -10000px; left: -10000px; z-index: -100; overflow: visible; display: block; opacity: 0.01; pointer-events: none;';
    
    clone.style.width = paper.style.width;
    clone.style.height = paper.style.height;
    clone.style.margin = '0';
    clone.style.boxShadow = 'none';
    
    stagingArea.appendChild(clone);
    document.body.appendChild(stagingArea);

    if (typeof flattenWaTextForPrint === 'function') {
        clone.querySelectorAll('.wa-text').forEach(node => flattenWaTextForPrint(node));
    }

    await window.bakeSVGFiltersForHtml2Canvas(clone, paper);

    const canvas = await html2canvas(clone, { 
        scale: scaleMultiplier, 
        useCORS: true, 
        backgroundColor: state.pages[state.currentPageIndex]?.background || '#ffffff',
        logging: false
    });
    
    stagingArea.remove();
    return canvas;
};


window.shareCurrentPageEmail = async function() {
    if (typeof DialogSystem !== 'undefined') {
        const progressHtml = `
            <div style="text-align:center; padding: 10px;">
                <p style="margin-bottom:15px; font-weight:bold;">Generating email attachment...</p>
                <div style="width:100%; background:#eee; border-radius:10px; overflow:hidden; height:10px;">
                    <div style="width:50%; height:100%; background:var(--ui-theme-color); transition: width 0.3s; animation: indeterminate 1.5s infinite linear;"></div>
                </div>
                <style>@keyframes indeterminate { 0% { width: 0%; margin-left: 0%; } 50% { width: 50%; margin-left: 25%; } 100% { width: 0%; margin-left: 100%; } }</style>
            </div>
        `;
        DialogSystem.show('Share via Email', progressHtml, null, true);
        
        setTimeout(() => {
            if (document.getElementById('custom-dialog-confirm')) document.getElementById('custom-dialog-confirm').style.display = 'none';
            if (document.getElementById('custom-dialog-cancel')) document.getElementById('custom-dialog-cancel').style.display = 'none';
        }, 10);
    }

    try {
        if(typeof deselect === 'function') deselect();
        await new Promise(r => setTimeout(r, 100));

        const paper = document.getElementById('paper');
        if (!paper) throw new Error("Could not find current page.");

        const canvas = await window.capturePageAsCanvasWithFilters(paper, 2);
        const imgDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const base64Data = imgDataUrl.split(',')[1];
        
        const pW = parseFloat(paper.style.width) || 794;
        const docTitle = (document.getElementById('doc-title').innerText || 'Publication').replace(/[^a-zA-Z0-9 -]/g, '');

        const emlContent = `To: \r\nSubject: ${docTitle}\r\nMIME-Version: 1.0\r\nContent-Type: multipart/related; boundary="boundary-op-email"\r\n\r\n--boundary-op-email\r\nContent-Type: text/html; charset="utf-8"\r\n\r\n<!DOCTYPE html>\r\n<html>\r\n<body style="background:#f0f0f0; padding:20px;">\r\n<table width="100%" cellpadding="0" cellspacing="0" border="0">\r\n    <tr>\r\n        <td align="center">\r\n            <img src="cid:pageimage" width="${pW}" style="display:block; max-width:100%; height:auto; border:0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />\r\n        </td>\r\n    </tr>\r\n</table>\r\n<div style="text-align:center; margin-top:30px; font-family:sans-serif; font-size:12px; color:#888;">\r\n    Created with <a href="https://openpublisher.app" style="color:#0ea5e9;">Open Publisher</a>\r\n</div>\r\n</body>\r\n</html>\r\n\r\n--boundary-op-email\r\nContent-Type: image/jpeg; name="page.jpg"\r\nContent-Transfer-Encoding: base64\r\nContent-ID: <pageimage>\r\nContent-Disposition: inline; filename="page.jpg"\r\n\r\n${base64Data}\r\n--boundary-op-email--`;

        const blob = new Blob([emlContent], { type: 'message/rfc822' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${docTitle}.eml`;
        a.click();
        URL.revokeObjectURL(url);

        if (typeof DialogSystem !== 'undefined') DialogSystem.close();

    } catch(err) {
        if (typeof DialogSystem !== 'undefined') {
            DialogSystem.close();
            setTimeout(() => DialogSystem.alert('Error', 'Failed to generate email: ' + err), 300);
        }

        setTimeout(() => {
            const input = document.getElementById('doc-protect-pw');
            if (input) input.focus();
        }, 100);
    }
};
