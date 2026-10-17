// OpenPublisher Print Engine (v5.9.6)
(function installNativePrintHooks() {

    function buildPrintDOM() {
        let pagesToPrint = state && state.pages ? state.pages : [];
        if ((window._isBookletPrinting || window._isMultiUpPrinting) && window._imposedSpreads) {
            pagesToPrint = window._imposedSpreads;
        }

        if (pagesToPrint && pagesToPrint.length > 0) {
            if (!window._isBookletPrinting && !window._isMultiUpPrinting && typeof serializeCurrentPage === 'function') {
                pagesToPrint[state.currentPageIndex] = serializeCurrentPage();
            }
        }

        let isLandscape = false;
        // Precise Browser Detection
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        const browserClass = isFirefox ? 'op-ff' : (isChrome ? 'op-ch' : 'op-std');

        let pW = '794px';
        let pH = '1123px';
        
        if (pagesToPrint && pagesToPrint.length > 0) {
            const firstPage = pagesToPrint[0];
            pW = firstPage.width || '794px';
            pH = firstPage.height || '1123px';
            if (parseFloat(pW) > parseFloat(pH)) isLandscape = true;
        }

        const oldStyles = document.querySelectorAll('.op-dynamic-print-style');
        oldStyles.forEach(s => s.remove());

        const printStyle = document.createElement('style');
        printStyle.className = 'op-dynamic-print-style';
        document.head.appendChild(printStyle);
        
        printStyle.innerHTML = `
            @media print {
                @page { 
                    size: ${isLandscape ? 'landscape' : 'portrait'}; 
                    margin: 0 !important; 
                }
                
                html, body {
                    margin: 0 !important; padding: 0 !important;
                    width: 100% !important; height: 100% !important;
                    background: white !important; overflow: hidden !important;
                }
                
                body > *:not(#op-print-spooler) { display: none !important; }
                
                #op-print-spooler { 
                    display: block !important;
                    position: fixed !important;
                    top: 0 !important; left: 0 !important;
                    width: 100vw !important; height: 100vh !important;
                    background: white !important;
                }
                
                .op-print-page {
                    position: relative !important;
                    width: ${pW} !important; height: ${pH} !important;
                    background: transparent !important;
                    margin: ${isLandscape ? '0' : '0 auto'} !important;
                    overflow: visible !important; 
                    page-break-after: always !important;
                }

                .op-print-scaler {
                    position: absolute !important;
                    width: 100% !important; height: 100% !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                /* ✨ UNIVERSAL LANDSCAPE (UNTOUCHED) ✨ */
                ${isLandscape ? `
                .op-print-scaler {
                    top: 0 !important;
                    left: 0 !important;
                    transform: scaleX(1.02) scaleY(1.025) !important;
                    transform-origin: top left !important;
                }
                ` : `
                /* ✨ FIREFOX PORTRAIT CLASS (HEAVY DROP) ✨ */
                #op-print-spooler.op-ff .op-print-scaler {
                    /* ✨ Shoved down to 15px to clear the top crop ✨ */
                    top: 15px !important;
                    left: 1px !important;
                    transform: scale(1.025) !important;
                    transform-origin: center center !important;
                }

                /* ✨ CHROME PORTRAIT CLASS (UNTOUCHED) ✨ */
                #op-print-spooler.op-ch .op-print-scaler {
                    top: -8px !important;
                    left: 1px !important;
                    transform: scaleX(1.025) scaleY(1.035) !important;
                    transform-origin: top center !important;
                }
                `}
            }
        `;

        let printSpooler = document.getElementById('op-print-spooler');
        if (!printSpooler) {
            printSpooler = document.createElement('div');
            printSpooler.id = 'op-print-spooler';
            document.body.appendChild(printSpooler);
        }
        
        // Apply the specific browser class directly to the spooler
        printSpooler.className = browserClass;
        printSpooler.innerHTML = '';

        if (pagesToPrint) {
            pagesToPrint.forEach((page) => {
                let pageWrapper = document.createElement('div');
                pageWrapper.className = 'op-print-page';
                let scaler = document.createElement('div');
                scaler.className = 'op-print-scaler';
                scaler.style.background = page.background || '#ffffff';

                let elementsToRender = page.elements || [];
                
                // Final safety check: if this page has ignoreBackground=true, forcefully strip any residual theme wrappers
                if (page.ignoreBackground) {
                    elementsToRender = elementsToRender.filter(el => !(el.innerHTML && (el.innerHTML.includes('op-theme-container') || el.innerHTML.includes('op-theme-bg'))));
                }
                
                elementsToRender.forEach(el => {
                    let elDiv = document.createElement('div');
                    elDiv.className = 'pub-element';
                    if (el.id) elDiv.id = el.id;
                    if (el.type) elDiv.setAttribute('data-type', el.type);
                    if (el.arrowStyle) elDiv.setAttribute('data-arrow-style', el.arrowStyle);
                    if (el.arrowHead) {
                        elDiv.setAttribute('data-arrow-head', el.arrowHead);
                        elDiv.setAttribute('data-arrow-head-px', el.arrowHead);
                        elDiv.setAttribute('data-arrow-head-length', el.arrowHead);
                    }
                    if (el.arrowStrokeWidth) elDiv.setAttribute('data-arrow-stroke-width', el.arrowStrokeWidth);

                    elDiv.style.position = 'absolute';
                    elDiv.style.left = el.left;
                    elDiv.style.top = el.top;
                    elDiv.style.width = el.width;
                    elDiv.style.height = el.height;
                    elDiv.style.zIndex = el.zIndex;
                    elDiv.style.transform = el.transform || 'none';

                    if (el.imgSrc) {
                        let img = document.createElement('img');
                        img.crossOrigin = 'anonymous';
                        img.setAttribute('crossorigin', 'anonymous');
                        img.src = el.imgSrc;
                        if (el.altText) img.alt = el.altText;
                        if (el.imgStyle) Object.assign(img.style, el.imgStyle);
                        img.style.display = 'block';
                        elDiv.style.overflow = 'visible';
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
                        const sX = el.scaleX || "1";
                        const sY = el.scaleY || "1";
                        if (sX !== "1" || sY !== "1") {
                            img.style.transform = `scale(${sX}, ${sY})`;
                            img.style.transformOrigin = 'center center';
                        }
                        elDiv.appendChild(img);
                    } else {
                        const sX = el.scaleX || "1";
                        const sY = el.scaleY || "1";
                        let cleanHTML = el.innerHTML.replace(/contenteditable="true"/g, 'contenteditable="false"');
                        
                        let css = el.contentCssText || `transform: scale(${sX}, ${sY}); width:100%; height:100%; transform-origin: center center; outline: none; border: none;`;
                        
                        let pVal = null;
                        css = css.replace(/perspective\s*\(\s*([^)]+)\s*\)/i, (match, p1) => { pVal = p1; return ''; });
                        if (pVal) { elDiv.style.perspective = pVal; elDiv.style.perspectiveOrigin = 'center'; }
                        
                        css = css.replace(/transform-style:\s*preserve-3d;?/gi, '').replace(/backface-visibility:\s*hidden;?/gi, '');
                        if (!css.includes('width:')) css += '; width:100%; height:100%;';
                        
                        elDiv.innerHTML = `<div class="element-content" style="${css}">${cleanHTML}</div>`;
                    }
                    scaler.appendChild(elDiv);
                });

                // ✨ HIGH-RES BORDER ART & PAGE BORDER PRINT RENDERING ✨
                const hasBorderArtInScaler = scaler.querySelector('#native-border-art-border, .border-art-wrapper');
                if (!hasBorderArtInScaler && page.borderStyle && page.borderStyle.startsWith('borderart:')) {
                    const parts = page.borderStyle.split(':');
                    const artId = parts[1] || 'santas';
                    const preset = window.BorderArtEngine ? window.BorderArtEngine.getPresetById(artId) : null;
                    if (preset && window.BorderArtEngine) {
                        const pW = parseFloat(page.width) || 794;
                        const pH = parseFloat(page.height) || 1123;
                        const size = parseInt(parts[2]) || 32;
                        const inset = parts[3] !== undefined ? parseInt(parts[3]) : 15;
                        const bDiv = document.createElement('div');
                        bDiv.id = 'native-border-art-border';
                        bDiv.className = 'pub-element';
                        bDiv.setAttribute('data-type', 'shape');
                        bDiv.setAttribute('data-is-border', 'true');
                        bDiv.style.cssText = `position: absolute; left: 0px; top: 0px; width: ${pW}px; height: ${pH}px; z-index: 1; pointer-events: none; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;`;
                        bDiv.innerHTML = `<div class="element-content" style="width:100%; height:100%; position:absolute; inset:0; pointer-events:none;">${window.BorderArtEngine.generateTilesHTML(preset, pW, pH, size, inset)}</div>`;
                        scaler.appendChild(bDiv);
                    }
                }

                const hasStandardBorderInScaler = scaler.querySelector('.page-border-container, #native-blueprint-border');
                if (!hasStandardBorderInScaler && page.borderStyle && page.borderStyle !== 'none' && !page.borderStyle.startsWith('borderart:')) {
                    const bDiv = document.createElement('div');
                    bDiv.className = 'page-border-container';
                    bDiv.style.cssText = 'position: absolute; inset: 0; pointer-events: none; z-index: 2500; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;';
                    const type = page.borderStyle;
                    if (type.startsWith('fancy-')) {
                        if (type === 'fancy-deco') {
                            bDiv.style.border = '15px solid #333';
                            bDiv.style.outline = '2px dashed #333';
                            bDiv.style.outlineOffset = '-20px';
                        } else if (type === 'fancy-cert') {
                            bDiv.style.border = '20px solid #d4af37';
                            bDiv.style.borderImage = 'linear-gradient(to bottom right, #b8860b, #ffd700, #b8860b) 1';
                            const inner = document.createElement('div');
                            inner.style.position = 'absolute'; inner.style.inset = '5px'; inner.style.border = '2px solid #b8860b';
                            bDiv.appendChild(inner);
                        } else if (type === 'fancy-double') {
                            bDiv.style.border = 'double 10px #000';
                            bDiv.style.outline = 'double 4px #000';
                            bDiv.style.outlineOffset = '-15px';
                        } else if (type === 'fancy-antique') {
                            bDiv.style.border = '10px double #5d4037';
                            const c = document.createElement('div');
                            c.style.cssText = 'position:absolute; inset:5px; border: 2px solid #5d4037; border-radius: 10px;';
                            bDiv.appendChild(c);
                        } else if (type === 'fancy-modern') {
                            bDiv.style.border = '20px solid #2c3e50';
                            bDiv.style.borderBottom = '40px solid #2c3e50';
                        } else if (type === 'fancy-floral') {
                            bDiv.style.border = '5px solid green';
                            const tl = document.createElement('div'); tl.innerText = '🌿'; tl.style.cssText = 'position:absolute; top:-15px; left:-15px; font-size:40px;';
                            const tr = document.createElement('div'); tr.innerText = '🌿'; tr.style.cssText = 'position:absolute; top:-15px; right:-15px; font-size:40px; transform:scaleX(-1);';
                            const bl = document.createElement('div'); bl.innerText = '🌿'; bl.style.cssText = 'position:absolute; bottom:-15px; left:-15px; font-size:40px; transform:scaleY(-1);';
                            const br = document.createElement('div'); br.innerText = '🌿'; br.style.cssText = 'position:absolute; bottom:-15px; right:-15px; font-size:40px; transform:scale(-1);';
                            bDiv.appendChild(tl); bDiv.appendChild(tr); bDiv.appendChild(bl); bDiv.appendChild(br);
                        }
                    } else {
                        bDiv.style.border = '2px ' + type + ' #333';
                    }
                    scaler.appendChild(bDiv);
                }

                // ✨ HIGH-RES WORDART PRINT BAKING (Native Browser Print Spooler) ✨
                const betaWordArts = Array.from(scaler.querySelectorAll('.beta-wa-img'));
                betaWordArts.forEach(waImg => {
                    const text = waImg.getAttribute('data-beta-wa-text');
                    const styleId = parseInt(waImg.getAttribute('data-beta-wa-style'), 10);
                    if (text && styleId && typeof window.renderWordArtCanvasSync === 'function') {
                        const parentEl = waImg.closest('.pub-element') || waImg.parentElement;
                        const dispW = parentEl ? (parseFloat(parentEl.style.width) || parentEl.offsetWidth || 800) : 800;
                        const dispH = parentEl ? (parseFloat(parentEl.style.height) || parentEl.offsetHeight || 200) : 200;
                        const baseW = parentEl ? (parseFloat(parentEl.getAttribute('data-beta-wa-basew')) || 600) : 600;
                        const baseH = parentEl ? (parseFloat(parentEl.getAttribute('data-beta-wa-baseh')) || 130) : 130;
                        const targetW = Math.max(1600, Math.min(6000, Math.round(dispW * 4.0)));
                        const targetH = Math.max(600, Math.min(4500, Math.round(dispH * 4.0)));
                        const scaleX = Math.max(1.0, Math.min(12.0, targetW / baseW));
                        const scaleY = Math.max(1.0, Math.min(18.0, targetH / baseH));
                        try {
                            const highResSrc = window.renderWordArtCanvasSync(text, styleId, false, scaleX, scaleY);
                            if (highResSrc) waImg.src = highResSrc;
                        } catch (err) {
                            console.warn('[Print Engine] Failed to upscale WordArt for spooler:', err);
                        }
                    }
                });

                // ✨ HIGH-RES SMART ARROW PRINT BAKING (Native Browser Print Spooler) ✨
                const arrowTargets = Array.from(scaler.querySelectorAll('[data-type="smart-arrow"], .pub-element[data-type="smart-arrow"], svg.smart-arrow-svg'));
                const smartArrows = Array.from(new Set(arrowTargets.map(el => (el.classList && el.classList.contains('smart-arrow-svg')) ? (el.closest('[data-type="smart-arrow"]') || el.closest('.pub-element') || el) : el)));
                smartArrows.forEach(arrowEl => {
                    if (typeof window.bakeSmartArrowForPrint === 'function') {
                        window.bakeSmartArrowForPrint(arrowEl, 4.0);
                    }
                });

                // ✨ NORMALIZE MULTI-LINE INLINE TEXT BACKGROUNDS (Pasted CSS / Highlights) FOR PRINT SPOOLER ✨
                if (typeof window.normalizeTextBackgroundsForPrint === 'function') {
                    window.normalizeTextBackgroundsForPrint(scaler);
                }

                pageWrapper.appendChild(scaler);
                printSpooler.appendChild(pageWrapper);
            });
        }
    }

    window.buildPrintDOM = buildPrintDOM;
    window.addEventListener('beforeprint', buildPrintDOM);
    window.addEventListener('afterprint', () => {
        const spooler = document.getElementById('op-print-spooler');
        if (spooler) {
            spooler.innerHTML = '';
            spooler.className = '';
        }
    });

    // Maintain imposition state until user interaction
    const clearImpositionState = () => {
        window._isBookletPrinting = false;
        window._isMultiUpPrinting = false;
        window._imposedSpreads = null;
    };
    window.addEventListener('mousedown', clearImpositionState);
    window.addEventListener('keydown', clearImpositionState);
    window.addEventListener('touchstart', clearImpositionState);

    window.printFullDocumentDirect = async (isImposed = false) => {
        if (!isImposed) clearImpositionState();
        
        if (window.OP_Desktop_API) {
            // Need to manually build and cleanup if we bypass the browser's native beforeprint/afterprint events
            if (typeof buildPrintDOM === 'function') buildPrintDOM();
            await window.OP_Desktop_API.triggerCustomPrint();
            const spooler = document.getElementById('op-print-spooler');
            if (spooler) {
                spooler.innerHTML = '';
                spooler.className = '';
            }
        } else {
            window.print();
        }
    };

    window.printFullDocument = async (isBooklet = false) => {
        if (!isBooklet && !window._isMultiUpPrinting) clearImpositionState();

        // Smart pre-flight detection for business-card sized documents
        if (!isBooklet && !window._isMultiUpPrinting && typeof state !== 'undefined' && state.pages && state.pages.length > 0) {
            const firstPage = state.pages[0];
            if (typeof window.isCardSizedPage === 'function' && window.isCardSizedPage(firstPage) && typeof window.showCardSheetPromptModal === 'function') {
                window.showCardSheetPromptModal();
                return;
            }
        }

        return window.printFullDocumentDirect(isBooklet || window._isMultiUpPrinting);
    };
})();


(function installPhysicalPrintEngine() {
    console.log("[Print Engine] Initializing Sandbox Iframe Print sequence v5.9.1...");

    // 1. Purge all legacy print styles and spoolers from the DOM
    document.querySelectorAll('.op-dynamic-print-style, #op-master-print-css, #op-legacy-viewport-fix, #op-legacy-ratio-fix, #op-definitive-scale-fix').forEach(e => e.remove());
    const oldSpooler = document.getElementById('op-print-spooler');
    if (oldSpooler) oldSpooler.remove();
    document.querySelectorAll('.op-print-frame').forEach(f => f.remove());

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const loadImageStrict = (imgEl, src) => new Promise((resolve) => {
        let settled = false;
        const done = () => {
            if (!settled) {
                settled = true;
                resolve();
            }
        };
        imgEl.onload = done;
        imgEl.onerror = done;
        if (src && !src.startsWith('data:')) {
            imgEl.crossOrigin = 'anonymous';
            imgEl.setAttribute('crossorigin', 'anonymous');
        }
        if (imgEl.complete && imgEl.naturalWidth !== undefined && imgEl.naturalWidth > 0 && imgEl.src === src) {
            done();
            return;
        }
        if (imgEl.src !== src) {
            imgEl.src = src;
        }
        if (imgEl.complete && imgEl.naturalWidth !== undefined && imgEl.naturalWidth > 0) {
            done();
            return;
        }
        setTimeout(done, 4000); // 4s safety timeout ensures print never hangs while giving adequate time for network images
    });

    const PRINT_MATH_SPACE = '\u205F';

    const flattenWaTextForPrint = (wa) => {
        const text = (wa.innerText || wa.textContent || '').replace(/\s+/g, ' ').trim();
        wa.textContent = '';
        if (text) {
            wa.appendChild(document.createTextNode(text.split(' ').join(PRINT_MATH_SPACE)));
        }
        wa.style.setProperty('white-space', 'nowrap', 'important');
        wa.style.setProperty('word-spacing', '0', 'important');
    };

    const fixWordArtSpacesInHtml = (html) => {
        if (!html || !html.includes('wa-text')) return html;
        return html.replace(/(<[^>]*\bwa-text\b[^>]*>)([\s\S]*?)(<\/div>)/gi, (_, open, body, close) => {
            const text = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            return open + text.split(' ').join(PRINT_MATH_SPACE) + close;
        });
    };

    const getImageShapeClipPath = (el, page, livePaper) => {
        let shapeClip = (el.imgStyle && el.imgStyle.clipPath) ? el.imgStyle.clipPath : (el.clipPath || '');
        if ((!shapeClip || shapeClip === 'none') && (el.borderRadius || (el.imgStyle && el.imgStyle.borderRadius))) {
            const r = el.borderRadius || el.imgStyle.borderRadius;
            if (r && r !== 'none' && r !== '0px') shapeClip = `inset(0 round ${r})`;
        }
        if ((!shapeClip || shapeClip === 'none') && page === state.pages[state.currentPageIndex] && livePaper) {
            const l1 = parseFloat(el.left) || 0;
            const t1 = parseFloat(el.top) || 0;
            const liveEls = Array.from(livePaper.querySelectorAll('.pub-element'));
            const activeEl = liveEls.find(e => Math.abs((parseFloat(e.style.left) || 0) - l1) < 2 && Math.abs((parseFloat(e.style.top) || 0) - t1) < 2);
            if (activeEl) {
                const activeImg = activeEl.querySelector('img');
                if (activeImg) {
                    const comp = window.getComputedStyle(activeImg);
                    if (comp.clipPath && comp.clipPath !== 'none') shapeClip = comp.clipPath;
                    else if (activeImg.style.clipPath && activeImg.style.clipPath !== 'none') shapeClip = activeImg.style.clipPath;
                    else if (activeImg.style.webkitClipPath && activeImg.style.webkitClipPath !== 'none') shapeClip = activeImg.style.webkitClipPath;
                    else if (activeImg.style.borderRadius && activeImg.style.borderRadius !== 'none' && activeImg.style.borderRadius !== '0px') {
                        shapeClip = `inset(0 round ${activeImg.style.borderRadius})`;
                    } else if (comp.borderRadius && comp.borderRadius !== '0px' && comp.borderRadius !== 'none') {
                        shapeClip = `inset(0 round ${comp.borderRadius})`;
                    }
                }
            }
        }
        return (shapeClip && shapeClip !== 'none') ? shapeClip : '';
    };

    const applyClipPathRegion = (ctx, clipPath, w, h, scale = 1, offsetX = 0, offsetY = 0) => {
        const normalized = (clipPath || '').trim();
        if (!normalized || normalized === 'none') return;

        // 1. Inset / Rounded Corners: inset(...) or inset(... round ...)
        const insetMatch = normalized.match(/^inset\(\s*(.*?)\s*\)$/i);
        if (insetMatch) {
            const rawBody = insetMatch[1].trim();
            const roundParts = rawBody.split(/\s+round\s+/i);
            const insetsStr = roundParts[0].trim();
            const radiiStr = roundParts[1] ? roundParts[1].trim() : '';

            const parseDist = (val, total) => {
                if (!val || val === '0' || val === '0px' || val === '0%') return 0;
                const s = val.trim();
                if (s.endsWith('%')) return (parseFloat(s) / 100) * total;
                if (s.endsWith('px')) return parseFloat(s) * scale;
                return parseFloat(s) * scale;
            };

            let top = 0, right = 0, bottom = 0, left = 0;
            if (insetsStr) {
                const iTokens = insetsStr.split(/\s+/).filter(Boolean);
                if (iTokens.length === 1) {
                    top = parseDist(iTokens[0], h);
                    right = parseDist(iTokens[0], w);
                    bottom = top;
                    left = right;
                } else if (iTokens.length === 2) {
                    top = bottom = parseDist(iTokens[0], h);
                    right = left = parseDist(iTokens[1], w);
                } else if (iTokens.length === 3) {
                    top = parseDist(iTokens[0], h);
                    right = left = parseDist(iTokens[1], w);
                    bottom = parseDist(iTokens[2], h);
                } else if (iTokens.length >= 4) {
                    top = parseDist(iTokens[0], h);
                    right = parseDist(iTokens[1], w);
                    bottom = parseDist(iTokens[2], h);
                    left = parseDist(iTokens[3], w);
                }
            }

            const rectX = offsetX + left;
            const rectY = offsetY + top;
            const rectW = Math.max(0, w - left - right);
            const rectH = Math.max(0, h - top - bottom);

            let rTL = 0, rTR = 0, rBR = 0, rBL = 0;
            if (radiiStr) {
                const horizRadii = radiiStr.split('/')[0].trim();
                const rTokens = horizRadii.split(/\s+/).filter(Boolean);
                const parseR = (val) => parseDist(val, Math.min(rectW, rectH));

                if (rTokens.length === 1) {
                    rTL = rTR = rBR = rBL = parseR(rTokens[0]);
                } else if (rTokens.length === 2) {
                    rTL = rBR = parseR(rTokens[0]);
                    rTR = rBL = parseR(rTokens[1]);
                } else if (rTokens.length === 3) {
                    rTL = parseR(rTokens[0]);
                    rTR = rBL = parseR(rTokens[1]);
                    rBR = parseR(rTokens[2]);
                } else if (rTokens.length >= 4) {
                    rTL = parseR(rTokens[0]);
                    rTR = parseR(rTokens[1]);
                    rBR = parseR(rTokens[2]);
                    rBL = parseR(rTokens[3]);
                }
            }

            ctx.beginPath();
            const maxR = Math.min(rectW / 2, rectH / 2);
            rTL = Math.min(rTL, maxR);
            rTR = Math.min(rTR, maxR);
            rBR = Math.min(rBR, maxR);
            rBL = Math.min(rBL, maxR);

            if (rTL > 0 || rTR > 0 || rBR > 0 || rBL > 0) {
                if (typeof ctx.roundRect === 'function') {
                    ctx.roundRect(rectX, rectY, rectW, rectH, [rTL, rTR, rBR, rBL]);
                } else {
                    ctx.moveTo(rectX + rTL, rectY);
                    ctx.lineTo(rectX + rectW - rTR, rectY);
                    ctx.arcTo(rectX + rectW, rectY, rectX + rectW, rectY + rTR, rTR);
                    ctx.lineTo(rectX + rectW, rectY + rectH - rBR);
                    ctx.arcTo(rectX + rectW, rectY + rectH, rectX, rectY + rectH, rBR);
                    ctx.lineTo(rectX + rBL, rectY + rectH);
                    ctx.arcTo(rectX, rectY + rectH, rectX, rectY, rBL);
                    ctx.lineTo(rectX, rectY + rTL);
                    ctx.arcTo(rectX, rectY, rectX + rTL, rectY, rTL);
                }
            } else {
                ctx.rect(rectX, rectY, rectW, rectH);
            }
            ctx.closePath();
            ctx.clip();
            return;
        }

        // 2. Circle or Ellipse: circle(...) or ellipse(...)
        if (/^circle\(/i.test(normalized) || /^ellipse\(/i.test(normalized)) {
            ctx.beginPath();
            ctx.ellipse(offsetX + w / 2, offsetY + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            return;
        }

        // 3. Polygon: polygon(...)
        const polyMatch = normalized.match(/^polygon\(\s*([^)]+)\)/i);
        if (polyMatch) {
            const coords = polyMatch[1].split(/\s*,\s*/);
            ctx.beginPath();
            coords.forEach((pair, i) => {
                const nums = pair.trim().split(/\s+/).filter(Boolean);
                if (nums.length >= 2) {
                    let xVal = 0, yVal = 0;
                    if (nums[0].endsWith('%')) xVal = (parseFloat(nums[0]) / 100) * w;
                    else if (nums[0].endsWith('px')) xVal = parseFloat(nums[0]) * scale;
                    else xVal = (parseFloat(nums[0]) / 100) * w;

                    if (nums[1].endsWith('%')) yVal = (parseFloat(nums[1]) / 100) * h;
                    else if (nums[1].endsWith('px')) yVal = parseFloat(nums[1]) * scale;
                    else yVal = (parseFloat(nums[1]) / 100) * h;

                    const finalX = offsetX + xVal;
                    const finalY = offsetY + yVal;
                    if (i === 0) ctx.moveTo(finalX, finalY);
                    else ctx.lineTo(finalX, finalY);
                }
            });
            ctx.closePath();
            ctx.clip();
            return;
        }
    };

    const parseImageLayoutValue = (value, base) => {
        const raw = (value ?? '').toString().trim();
        if (!raw) return 0;
        if (raw.endsWith('%')) return (parseFloat(raw) / 100) * base;
        return parseFloat(raw) || 0;
    };

    const isDefaultFillImageLayout = (imgStyle = {}) => {
        if (!imgStyle || Object.keys(imgStyle).length === 0) return true;
        const w = (imgStyle.width || '100%').toString().trim();
        const h = (imgStyle.height || '100%').toString().trim();
        const l = (imgStyle.left || '0').toString().trim();
        const t = (imgStyle.top || '0').toString().trim();
        const leftZero = !l || l === '0' || l === '0px' || l === '0%';
        const topZero = !t || t === '0' || t === '0px' || t === '0%';
        const isWidth100 = !w || w === '100%' || w === 'auto';
        const isHeight100 = !h || h === '100%' || h === 'auto';
        return isWidth100 && isHeight100 && leftZero && topZero;
    };

    window.bakeImageForPrint = (src, displayW, displayH, { filter = '', opacity = '1', clipPath = '', imgStyle = {} } = {}) => new Promise((resolve, reject) => {
        let isSettled = false;
        const safetyTimer = setTimeout(() => {
            if (!isSettled) {
                isSettled = true;
                reject(new Error("bakeImageForPrint timeout"));
            }
        }, 5000);

        const safeResolve = (val) => {
            if (!isSettled) {
                isSettled = true;
                clearTimeout(safetyTimer);
                resolve(val);
            }
        };

        const safeReject = (err) => {
            if (!isSettled) {
                isSettled = true;
                clearTimeout(safetyTimer);
                reject(err);
            }
        };

        const attemptLoad = (useCORS) => {
            const tempImg = new Image();
            let loadSrc = src;
            if (!loadSrc.startsWith('data:')) {
                const isSameOrigin = loadSrc.startsWith('/') || loadSrc.startsWith('./') || (typeof window !== 'undefined' && window.location && loadSrc.startsWith(window.location.origin));
                if (useCORS && !isSameOrigin) {
                    tempImg.crossOrigin = 'anonymous';
                }
            }
            tempImg.onload = () => {
                if (isSettled) return;
                const scale = 2;
                
                let finalFilter = (filter || '').replace(/\bnone\b/g, '').trim();
                let padX = 0, padY = 0, padW = 0, padH = 0;
                
                if (finalFilter && finalFilter.includes('blur')) {
                    finalFilter = finalFilter.replace(/blur\(([\d.]+)px\)/g, (match, p1) => `blur(${parseFloat(p1) * scale}px)`);
                }
                
                if (finalFilter && finalFilter.includes('drop-shadow')) {
                    finalFilter = finalFilter.replace(/drop-shadow\(((?:[^)(]+|\([^)(]*\))*)\)/g, (dsMatch, dsInner) => {
                        const match = dsInner.match(/([-\d.]+)px\s+([-\d.]+)px(?:\s+([-\d.]+)px)?/);
                        if (match) {
                            const sx = parseFloat(match[1]) * scale;
                            const sy = parseFloat(match[2]) * scale;
                            const blur = (match[3] ? parseFloat(match[3]) : 0) * scale;
                            const spread = Math.max(blur * 2, 20 * scale);
                            padX = Math.max(padX, sx < 0 ? Math.abs(sx) + spread : spread);
                            padY = Math.max(padY, sy < 0 ? Math.abs(sy) + spread : spread);
                            padW = Math.max(padW, Math.abs(sx) + spread * 2);
                            padH = Math.max(padH, Math.abs(sy) + spread * 2);
                            
                            const scaledInner = dsInner.replace(/([-\d.]+)px\s+([-\d.]+)px(?:\s+([-\d.]+)px)?/, 
                                (m, p1, p2, p3) => p3 ? `${parseFloat(p1)*scale}px ${parseFloat(p2)*scale}px ${parseFloat(p3)*scale}px` : `${parseFloat(p1)*scale}px ${parseFloat(p2)*scale}px`);
                            return `drop-shadow(${scaledInner})`;
                        }
                        return dsMatch;
                    });
                }

                const c = document.createElement('canvas');
                c.width = (displayW * scale) + padW;
                c.height = (displayH * scale) + padH;
                const ctx = c.getContext('2d');

                const rasterCanvas = document.createElement('canvas');
                rasterCanvas.width = displayW * scale;
                rasterCanvas.height = displayH * scale;
                const rasterCtx = rasterCanvas.getContext('2d');
                
                rasterCtx.save();
                if (clipPath) applyClipPathRegion(rasterCtx, clipPath, rasterCanvas.width, rasterCanvas.height, scale, 0, 0);

                if (isDefaultFillImageLayout(imgStyle)) {
                    rasterCtx.drawImage(tempImg, 0, 0, rasterCanvas.width, rasterCanvas.height);
                } else {
                    let wVal = parseImageLayoutValue(imgStyle.width, displayW);
                    let hVal = parseImageLayoutValue(imgStyle.height, displayH);
                    const imgW = (wVal > 0 ? wVal : displayW) * scale;
                    const imgH = (hVal > 0 ? hVal : displayH) * scale;
                    const imgL = parseImageLayoutValue(imgStyle.left, displayW) * scale;
                    const imgT = parseImageLayoutValue(imgStyle.top, displayH) * scale;
                    rasterCtx.drawImage(tempImg, imgL, imgT, imgW, imgH);
                }
                rasterCtx.restore();

                ctx.save();
                if (clipPath && padW === 0 && padH === 0) {
                    applyClipPathRegion(ctx, clipPath, c.width, c.height, scale, 0, 0);
                }
                if (finalFilter && finalFilter !== 'none') ctx.filter = finalFilter;
                const parsedAlpha = (!opacity || isNaN(parseFloat(opacity))) ? 1.0 : parseFloat(opacity);
                ctx.globalAlpha = Math.max(0, Math.min(1, parsedAlpha));
                
                ctx.drawImage(rasterCanvas, padX, padY, displayW * scale, displayH * scale);
                ctx.restore();
                
                try {
                    safeResolve({ src: c.toDataURL('image/png'), padX, padY, padW, padH });
                } catch (e) {
                    safeReject(e);
                }
            };
            tempImg.onerror = (e) => {
                if (isSettled) return;
                // If standard CORS load failed, retry once with cache-busting to bypass any stale opaque cache
                if (useCORS && !loadSrc.includes('corsbuster=') && !loadSrc.startsWith('data:')) {
                    const busterSrc = loadSrc + (loadSrc.includes('?') ? '&' : '?') + 'corsbuster=' + Date.now();
                    const busterImg = new Image();
                    busterImg.crossOrigin = 'anonymous';
                    busterImg.onload = () => {
                        tempImg.onload.call(busterImg);
                    };
                    busterImg.onerror = (err) => {
                        safeReject(err);
                    };
                    busterImg.src = busterSrc;
                    return;
                }
                safeReject(e);
            };
            tempImg.src = loadSrc;
            if (tempImg.complete && tempImg.naturalWidth > 0) {
                tempImg.onload();
            }
        };
        attemptLoad(!src.startsWith('data:'));
    });

    window.bakeThemeBackgroundForPrint = async function(themeSettings, width, height) {
        if (!themeSettings || !themeSettings.saved) return null;
        const c1 = themeSettings.c1 || '#ffffff';
        const c2 = themeSettings.c2 || '';
        const type = themeSettings.type || 'color';
        const url = themeSettings.url || '';
        const sat = themeSettings.sat !== undefined ? parseFloat(themeSettings.sat) : 100;
        const bri = themeSettings.bri !== undefined ? parseFloat(themeSettings.bri) : 100;
        const con = themeSettings.con !== undefined ? parseFloat(themeSettings.con) : 100;
        const hue = themeSettings.hue !== undefined ? parseFloat(themeSettings.hue) : 0;
        const tex = themeSettings.tex !== undefined ? parseFloat(themeSettings.tex) : 100;
        const texOpacity = isNaN(tex) ? 1 : Math.max(0, Math.min(1, tex / 100));
        const sizeVal = themeSettings.size !== undefined ? parseFloat(themeSettings.size) : 100;
        const patternScale = isNaN(sizeVal) ? 1 : Math.max(0.2, Math.min(4, sizeVal / 100));

        const scale = 2;
        const targetW = Math.max(100, Math.round((parseFloat(width) || 794) * scale));
        const targetH = Math.max(100, Math.round((parseFloat(height) || 1123) * scale));

        const baseCanvas = document.createElement('canvas');
        baseCanvas.width = targetW;
        baseCanvas.height = targetH;
        const baseCtx = baseCanvas.getContext('2d');

        // 1. Draw base fill (gradient or solid)
        if (type === 'gradient' && c2) {
            const grad = baseCtx.createLinearGradient(0, 0, targetW, targetH);
            grad.addColorStop(0, c1);
            grad.addColorStop(1, c2);
            baseCtx.fillStyle = grad;
            baseCtx.fillRect(0, 0, targetW, targetH);
        } else {
            baseCtx.fillStyle = c1;
            baseCtx.fillRect(0, 0, targetW, targetH);
        }

        // 2. If textured theme, load and tile texture pattern with patternScale and texOpacity
        if (type === 'texture' && url) {
            try {
                const textureImg = new Image();
                textureImg.crossOrigin = 'Anonymous';
                let safeUrl = url;
                if (safeUrl.startsWith('http') && !safeUrl.includes('wsrv.nl')) {
                    const clean = safeUrl.replace(/^https?:\/\//, '');
                    safeUrl = `https://wsrv.nl/?url=${encodeURIComponent(clean)}`;
                }
                await new Promise((resolve) => {
                    const timer = setTimeout(resolve, 2000);
                    textureImg.onload = () => { clearTimeout(timer); resolve(); };
                    textureImg.onerror = () => { clearTimeout(timer); resolve(); };
                    textureImg.src = safeUrl;
                    if (textureImg.complete && textureImg.naturalWidth > 0) {
                        clearTimeout(timer);
                        resolve();
                    }
                });

                if (textureImg.naturalWidth > 0) {
                    const tileW = Math.max(4, Math.round(textureImg.naturalWidth * patternScale * scale));
                    const tileH = Math.max(4, Math.round(textureImg.naturalHeight * patternScale * scale));

                    const tileCanvas = document.createElement('canvas');
                    tileCanvas.width = tileW;
                    tileCanvas.height = tileH;
                    const tileCtx = tileCanvas.getContext('2d');
                    tileCtx.drawImage(textureImg, 0, 0, tileW, tileH);

                    const pattern = baseCtx.createPattern(tileCanvas, 'repeat');
                    if (pattern) {
                        baseCtx.save();
                        baseCtx.globalAlpha = texOpacity;
                        baseCtx.fillStyle = pattern;
                        baseCtx.fillRect(0, 0, targetW, targetH);
                        baseCtx.restore();
                    }
                }
            } catch (texErr) {
                console.warn('[Print Engine] Texture pattern load error for bake:', texErr);
            }
        }

        // 3. Apply Saturation, Brightness, Contrast, and Hue Rotate via Canvas 2D filter
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetW;
        finalCanvas.height = targetH;
        const finalCtx = finalCanvas.getContext('2d');

        finalCtx.save();
        if ('filter' in finalCtx) {
            finalCtx.filter = `saturate(${sat}%) brightness(${bri}%) contrast(${con}%) hue-rotate(${hue}deg)`;
        }
        finalCtx.drawImage(baseCanvas, 0, 0);
        finalCtx.restore();

        // 4. Pixel-level fallback verification (ensures effect even if context filter was bypassed)
        if (sat !== 100 || bri !== 100 || con !== 100 || hue !== 0) {
            try {
                const sample1 = baseCtx.getImageData(Math.round(targetW / 2), Math.round(targetH / 2), 1, 1).data;
                const sample2 = finalCtx.getImageData(Math.round(targetW / 2), Math.round(targetH / 2), 1, 1).data;
                const diff = Math.abs(sample1[0] - sample2[0]) + Math.abs(sample1[1] - sample2[1]) + Math.abs(sample1[2] - sample2[2]);
                if (diff === 0) {
                    const imgData = finalCtx.getImageData(0, 0, targetW, targetH);
                    const d = imgData.data;
                    const s = sat / 100;
                    const b = bri / 100;
                    const c = con / 100;
                    const angle = (hue * Math.PI) / 180;
                    const cosA = Math.cos(angle);
                    const sinA = Math.sin(angle);
                    const m00 = 0.213 + cosA * 0.787 - sinA * 0.213;
                    const m01 = 0.715 - cosA * 0.715 - sinA * 0.715;
                    const m02 = 0.072 - cosA * 0.072 + sinA * 0.928;
                    const m10 = 0.213 - cosA * 0.213 + sinA * 0.143;
                    const m11 = 0.715 + cosA * 0.285 + sinA * 0.140;
                    const m12 = 0.072 - cosA * 0.072 - sinA * 0.283;
                    const m20 = 0.213 - cosA * 0.213 - sinA * 0.787;
                    const m21 = 0.715 - cosA * 0.715 + sinA * 0.715;
                    const m22 = 0.072 + cosA * 0.928 + sinA * 0.072;

                    const dLen = d.length;
                    for (let px = 0; px < dLen; px += 4) {
                        let r = d[px], g = d[px + 1], bl = d[px + 2];
                        if (hue !== 0) {
                            const nR = r * m00 + g * m01 + bl * m02;
                            const nG = r * m10 + g * m11 + bl * m12;
                            const nB = r * m20 + g * m21 + bl * m22;
                            r = nR; g = nG; bl = nB;
                        }
                        if (s !== 1) {
                            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
                            r = lum + (r - lum) * s;
                            g = lum + (g - lum) * s;
                            bl = lum + (bl - lum) * s;
                        }
                        if (b !== 1) {
                            r *= b; g *= b; bl *= b;
                        }
                        if (c !== 1) {
                            r = 128 + (r - 128) * c;
                            g = 128 + (g - 128) * c;
                            bl = 128 + (bl - 128) * c;
                        }
                        d[px] = Math.max(0, Math.min(255, Math.round(r)));
                        d[px + 1] = Math.max(0, Math.min(255, Math.round(g)));
                        d[px + 2] = Math.max(0, Math.min(255, Math.round(bl)));
                    }
                    finalCtx.putImageData(imgData, 0, 0);
                }
            } catch (fallbackErr) {
                console.warn('[Print Engine] Pixel fallback check skipped:', fallbackErr);
            }
        }

        return finalCanvas.toDataURL('image/jpeg', 0.95);
    };

    // ✨ NORMALIZE MULTI-LINE INLINE TEXT BACKGROUNDS (Pasted CSS / Highlights) FOR PRINT ✨
    // In html2canvas, inline box fragmentation is unsupported; multi-line inline elements
    // receive a single union bounding box, painting an oversized solid rectangle.
    // This normalizer segments inline text background elements (such as pasted Discord addresses
    // or highlighted text) at explicit <br> tags and visual line wraps into individual per-line
    // spans while strictly preserving all actual text box backgrounds, colors, and gradients.
    const isInlineTextBgCandidate = (el) => {
        if (!el || el.nodeType !== 1) return false;
        if (el.hasAttribute('data-op-line-split')) return false;
        const tag = el.tagName ? el.tagName.toUpperCase() : '';
        if (tag === 'TABLE' || tag === 'THEAD' || tag === 'TBODY' || tag === 'TFOOT' ||
            tag === 'TR' || tag === 'TH' || tag === 'TD' || tag === 'SVG' || tag === 'CANVAS' ||
            tag === 'IMG' || tag === 'HR' || tag === 'BR') {
            return false;
        }
        if (el.classList.contains('element-content') || el.classList.contains('pub-element')) {
            return false;
        }
        if (el.closest('[data-type="shape"], .border-art-wrapper, #native-border-art-border, .page-border-container, .op-theme-container, .op-theme-bg')) {
            return false;
        }
        if (el.classList.contains('wa-text') || el.closest('.wa-text, .beta-wa-img, [class*="wa-style-"]')) {
            return false;
        }

        const comp = window.getComputedStyle(el);
        const display = comp.display;
        const isInlineLevel = display === 'inline' || display === 'inline-block' ||
            tag === 'SPAN' || tag === 'MARK' || tag === 'FONT' || tag === 'A' ||
            tag === 'B' || tag === 'STRONG' || tag === 'I' || tag === 'EM' ||
            tag === 'U' || tag === 'S' || tag === 'SMALL' || tag === 'CODE' ||
            tag === 'SUB' || tag === 'SUP';
        if (!isInlineLevel) return false;

        if (el.hasAttribute('data-opub-hilite') || tag === 'MARK') return true;

        const sBg = el.style.backgroundColor || el.style.background;
        if (sBg && sBg !== 'transparent' && sBg !== 'none' && !sBg.includes('rgba(0, 0, 0, 0)')) {
            return true;
        }

        const bg = comp.backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgba(0,0,0,0)') {
            return true;
        }

        return false;
    };

    const measureInlineBgMetrics = (bgEl) => {
        let scaleX = 1;
        let scaleY = 1;
        try {
            const contentEl = bgEl.closest('.element-content');
            if (contentEl && contentEl.offsetWidth > 0 && contentEl.offsetHeight > 0) {
                const cRect = contentEl.getBoundingClientRect();
                if (cRect.width > 0) scaleX = cRect.width / contentEl.offsetWidth;
                if (cRect.height > 0) scaleY = cRect.height / contentEl.offsetHeight;
            }
        } catch (e) {}

        let fontSize = 14;
        let computedLineHeight = 0;
        try {
            const bgComp = window.getComputedStyle(bgEl);
            fontSize = parseFloat(bgComp.fontSize) || 14;
            computedLineHeight = parseFloat(bgComp.lineHeight) || 0;
            if (!computedLineHeight && bgEl.parentNode && bgEl.parentNode.nodeType === 1) {
                const parentComp = window.getComputedStyle(bgEl.parentNode);
                computedLineHeight = parseFloat(parentComp.lineHeight) || 0;
            }
        } catch (e) {}

        const lineGroups = [];
        try {
            const rects = Array.from(bgEl.getClientRects());
            for (const r of rects) {
                const w = r.width / scaleX;
                const h = r.height / scaleY;
                const t = r.top / scaleY;
                if (w <= 0.5 || h <= 0.5) continue;
                let group = lineGroups.find(g => Math.abs(g.top - t) <= 2.5);
                if (!group) {
                    lineGroups.push({ top: t, height: h });
                } else if (h > group.height) {
                    group.height = h;
                }
            }
            lineGroups.sort((a, b) => a.top - b.top);
        } catch (e) {}

        let inlineHeight = 0;
        if (lineGroups.length > 0) {
            inlineHeight = lineGroups.reduce((sum, g) => sum + g.height, 0) / lineGroups.length;
        } else {
            inlineHeight = fontSize * 1.12;
        }

        let lineStride = 0;
        if (lineGroups.length >= 2) {
            const validSteps = [];
            for (let i = 0; i < lineGroups.length - 1; i++) {
                const step = lineGroups[i + 1].top - lineGroups[i].top;
                if (step >= inlineHeight * 0.6 && step <= inlineHeight * 1.75) {
                    validSteps.push(step);
                }
            }
            if (validSteps.length > 0) {
                lineStride = validSteps.reduce((sum, s) => sum + s, 0) / validSteps.length;
            }
        }
        if (!lineStride || lineStride <= 0) {
            lineStride = computedLineHeight > 0 ? computedLineHeight : (inlineHeight + 1.5);
        }

        const rawGap = lineStride - inlineHeight;
        const lineGap = Math.max(1.25, Math.min(2.0, rawGap > 0.5 ? rawGap : 1.5));

        return {
            scaleX,
            scaleY,
            inlineHeight,
            lineStride,
            lineGap,
            lineGroups
        };
    };

    const convertPreservedNewlinesToBr = (rootEl) => {
        if (!rootEl) return;
        try {
            const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, null, false);
            const textNodes = [];
            let tNode;
            while ((tNode = walker.nextNode())) {
                if (tNode.nodeValue && /[\r\n]/.test(tNode.nodeValue)) {
                    textNodes.push(tNode);
                }
            }
            for (const node of textNodes) {
                const parentEl = node.parentElement || rootEl;
                let ws = 'normal';
                try {
                    ws = window.getComputedStyle(parentEl).whiteSpace || 'normal';
                } catch (e) {}
                if (ws === 'pre' || ws === 'pre-wrap' || ws === 'pre-line' || ws === 'break-spaces') {
                    const normalized = node.nodeValue.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                    const parts = normalized.split('\n');
                    if (parts.length > 1 && node.parentNode) {
                        const frag = document.createDocumentFragment();
                        for (let i = 0; i < parts.length; i++) {
                            if (parts[i].length > 0) {
                                frag.appendChild(document.createTextNode(parts[i]));
                            }
                            if (i < parts.length - 1) {
                                frag.appendChild(document.createElement('br'));
                            }
                        }
                        node.parentNode.replaceChild(frag, node);
                    }
                }
            }
        } catch (e) {}
    };

    const unwrapNestedBlocksToBr = (rootEl) => {
        if (!rootEl) return;
        try {
            const blockSelector = 'div, p';
            let blockEl;
            let guard = 200;
            while ((blockEl = rootEl.querySelector(blockSelector)) && guard-- > 0) {
                if (blockEl.hasAttribute('data-op-line-split')) break;
                const p = blockEl.parentNode;
                if (!p) break;

                const prev = blockEl.previousSibling;
                const hasPrevContent = prev && !(prev.nodeType === 1 && prev.tagName.toUpperCase() === 'BR') &&
                    ((prev.nodeType === 3 && prev.nodeValue && prev.nodeValue.replace(/[\s\u00a0\u200b\u200c\u200d\ufeff]+/g, '').length > 0) ||
                     (prev.nodeType === 1 && (prev.textContent.replace(/[\s\u00a0\u200b\u200c\u200d\ufeff]+/g, '').length > 0 || prev.querySelector('br, img, svg'))));
                if (hasPrevContent) {
                    p.insertBefore(document.createElement('br'), blockEl);
                }

                const lastChild = blockEl.lastChild;
                const endsWithBr = lastChild && lastChild.nodeType === 1 && lastChild.tagName.toUpperCase() === 'BR';
                const hasNextSibling = !!blockEl.nextSibling;

                while (blockEl.firstChild) {
                    p.insertBefore(blockEl.firstChild, blockEl);
                }
                if (!endsWithBr && hasNextSibling) {
                    p.insertBefore(document.createElement('br'), blockEl);
                }
                blockEl.remove();
            }
        } catch (e) {}
    };

    const splitInlineBackgroundAtBr = (bgEl, preMeasuredMetrics = null) => {
        if (!bgEl || !bgEl.parentNode) return;
        if (bgEl.hasAttribute('data-op-line-split')) return;

        const metrics = preMeasuredMetrics || measureInlineBgMetrics(bgEl);
        const { scaleX, scaleY, lineStride, lineGap, lineGroups } = metrics;

        const parent = bgEl.parentNode;
        let textAlign = 'left';
        try {
            const parentComp = window.getComputedStyle(parent);
            textAlign = parentComp.textAlign || 'left';
        } catch (e) {}

        let origRadius = '0px';
        let padLeft = 0;
        let padRight = 0;
        let noWrapMode = 'nowrap';
        try {
            const bgComp = window.getComputedStyle(bgEl);
            if (bgComp.borderRadius && bgComp.borderRadius !== '0px') {
                origRadius = bgComp.borderRadius;
            }
            const pL = parseFloat(bgComp.paddingLeft);
            const pR = parseFloat(bgComp.paddingRight);
            if (!isNaN(pL) && pL > 0) padLeft = pL;
            if (!isNaN(pR) && pR > 0) padRight = pR;
            const ws = bgComp.whiteSpace || 'normal';
            if (ws === 'pre' || ws === 'pre-wrap' || ws === 'break-spaces') {
                noWrapMode = 'pre';
            }
        } catch (e) {}

        const linesCreated = [];

        const formatLineElement = (el) => {
            if (!el || el.nodeType !== 1) return;
            el.style.display = 'block';
            el.style.width = 'fit-content';
            el.style.maxWidth = 'none';
            el.style.whiteSpace = noWrapMode;
            el.style.boxSizing = 'border-box';
            el.style.marginTop = '0px';
            el.style.marginBottom = '0px';
            el.style.paddingTop = '0px';
            el.style.paddingBottom = '0px';
            el.style.paddingLeft = padLeft + 'px';
            el.style.paddingRight = padRight + 'px';
            el.style.borderRadius = origRadius;
            el.style.lineHeight = 'inherit';
            el.setAttribute('data-op-line-split', 'true');

            try {
                el.querySelectorAll('*').forEach(child => {
                    child.setAttribute('data-op-line-split', 'true');
                });
            } catch (e) {}

            if (textAlign === 'center') {
                el.style.marginLeft = 'auto';
                el.style.marginRight = 'auto';
            } else if (textAlign === 'right' || textAlign === 'end') {
                el.style.marginLeft = 'auto';
                el.style.marginRight = '0px';
            } else {
                el.style.marginLeft = '0px';
                el.style.marginRight = 'auto';
            }

            try {
                const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
                let tNode;
                while ((tNode = walker.nextNode())) {
                    if (tNode.nodeValue) {
                        tNode.nodeValue = tNode.nodeValue.replace(/[\r\n]+/g, '');
                    }
                }
            } catch (err) {}

            linesCreated.push(el);
        };

        let br;
        let guard = 500;
        while ((br = bgEl.querySelector('br')) && guard-- > 0) {
            try {
                const range = document.createRange();
                range.setStartBefore(bgEl);
                range.setEndBefore(br);
                const fragment = range.extractContents();

                br.remove();

                const parent = bgEl.parentNode;
                if (!parent) break;

                const cleanText = (fragment.textContent || '').replace(/[\s\u00a0\u200b\u200c\u200d\ufeff]+/g, '');
                const hasContent = cleanText.length > 0 || !!fragment.querySelector('img, svg');
                if (hasContent) {
                    const lineEl = fragment.firstElementChild || fragment;
                    formatLineElement(lineEl);
                    parent.insertBefore(fragment, bgEl);
                } else {
                    const spacer = document.createElement('div');
                    spacer.style.cssText = `height: ${lineStride.toFixed(2)}px; min-height: ${lineStride.toFixed(2)}px; line-height: ${lineStride.toFixed(2)}px; display: block; margin: 0; padding: 0; width: 100%; background: transparent !important; border: none !important; pointer-events: none;`;
                    spacer.innerHTML = '&nbsp;';
                    spacer.style.color = 'transparent';
                    spacer.style.fontSize = '1px';
                    spacer.setAttribute('data-op-line-split', 'true');
                    spacer.setAttribute('data-op-line-spacer', 'true');
                    parent.insertBefore(spacer, bgEl);
                }
            } catch (err) {
                console.warn('[Print Engine] Error splitting inline text background at BR:', err);
                break;
            }
        }

        const remainingClean = (bgEl.textContent || '').replace(/[\s\u00a0\u200b\u200c\u200d\ufeff]+/g, '');
        if (remainingClean.length === 0 && !bgEl.querySelector('img, svg')) {
            bgEl.remove();
        } else {
            formatLineElement(bgEl);
        }

        // Enforce exact sub-pixel vertical stride parity (stripHeight + lineGap === lineStride)
        // and lock exact shrink-wrapped ceiling pixel widths onto each line element
        for (let k = 0; k < linesCreated.length; k++) {
            const line = linesCreated[k];
            if (!line.parentNode) continue;

            try {
                const lineRect = line.getBoundingClientRect();
                const naturalBlockH = (lineRect.height / scaleY) || lineStride;
                const targetStride = lineStride > 0 ? lineStride : naturalBlockH;
                const stripHeight = Math.max(1, targetStride - lineGap);

                const textRange = document.createRange();
                textRange.selectNodeContents(line);
                const textRect = textRange.getBoundingClientRect();
                const textW = Math.ceil((textRect.width || 0) / scaleX);

                const compL = window.getComputedStyle(line);
                const pL = parseFloat(compL.paddingLeft) || padLeft;
                const pR = parseFloat(compL.paddingRight) || padRight;
                const borderL = parseFloat(compL.borderLeftWidth) || 0;
                const borderR = parseFloat(compL.borderRightWidth) || 0;
                const totalW = textW + pL + pR + borderL + borderR;

                const rectW = Math.ceil(((lineRect.width || 0) / scaleX) || line.offsetWidth || 0);
                const finalW = (rectW > 0 && rectW <= totalW + 4) ? rectW : Math.ceil(totalW);
                if (finalW > 0) {
                    line.style.width = finalW + 'px';
                }

                line.style.height = stripHeight.toFixed(2) + 'px';
                line.style.lineHeight = stripHeight.toFixed(2) + 'px';
                line.style.marginTop = '0px';
                line.style.marginBottom = lineGap.toFixed(2) + 'px';
            } catch (e) {
                line.style.width = 'fit-content';
            }
        }

        // Verify that every empty-line gap from the unsplit editor layout is preserved between linesCreated
        if (lineGroups && lineGroups.length === linesCreated.length && linesCreated.length >= 2) {
            for (let k = 0; k < linesCreated.length - 1; k++) {
                const lineK = linesCreated[k];
                const lineNext = linesCreated[k + 1];
                if (!lineK.parentNode || !lineNext.parentNode) continue;
                try {
                    const editorStep = lineGroups[k + 1].top - lineGroups[k].top;
                    const curTopK = lineK.getBoundingClientRect().top / scaleY;
                    const curTopNext = lineNext.getBoundingClientRect().top / scaleY;
                    const currentStep = curTopNext - curTopK;
                    const missingStep = editorStep - currentStep;
                    if (missingStep >= lineStride * 0.5) {
                        const curMb = parseFloat(lineK.style.marginBottom) || lineGap;
                        lineK.style.marginBottom = (curMb + missingStep).toFixed(2) + 'px';
                    }
                } catch (e) {}
            }
        }
    };

    const splitSoftWrappedInlineBackground = (bgEl, existingMetrics = null) => {
        if (!bgEl || !bgEl.parentNode) return;
        if (bgEl.hasAttribute('data-op-line-split')) return;
        let rects;
        try {
            rects = bgEl.getClientRects();
        } catch (e) {
            return;
        }
        if (!rects || rects.length <= 1) return;

        const preMeasuredMetrics = existingMetrics || measureInlineBgMetrics(bgEl);
        const { scaleY, lineStride } = preMeasuredMetrics;

        convertPreservedNewlinesToBr(bgEl);
        unwrapNestedBlocksToBr(bgEl);

        const walker = document.createTreeWalker(bgEl, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false);
        const nodes = [];
        let wNode;
        while ((wNode = walker.nextNode())) {
            if (wNode.nodeType === 3 && wNode.nodeValue && wNode.nodeValue.length > 0) {
                nodes.push(wNode);
            } else if (wNode.nodeType === 1 && wNode.tagName && wNode.tagName.toUpperCase() === 'BR') {
                nodes.push(wNode);
            }
        }

        let currentLineTop = null;
        const breakPoints = [];

        for (const node of nodes) {
            if (node.nodeType === 1) {
                currentLineTop = null;
                continue;
            }
            const textLen = node.nodeValue.length;
            for (let i = 0; i < textLen; i++) {
                const range = document.createRange();
                range.setStart(node, i);
                range.setEnd(node, i + 1);
                const r = range.getBoundingClientRect();
                if (!r || (r.width === 0 && r.height === 0)) continue;

                if (currentLineTop === null) {
                    currentLineTop = r.top;
                } else if (r.top > currentLineTop + 3) {
                    const stepPx = (r.top - currentLineTop) / (scaleY || 1);
                    const brCount = (lineStride > 0) ? Math.max(1, Math.round(stepPx / lineStride)) : 1;
                    breakPoints.push({ node: node, offset: i, count: brCount });
                    currentLineTop = r.top;
                }
            }
        }

        if (breakPoints.length === 0 && !bgEl.querySelector('br')) return;

        for (let j = breakPoints.length - 1; j >= 0; j--) {
            const bp = breakPoints[j];
            try {
                const rightText = bp.node.splitText(bp.offset);
                if (bp.node.nodeValue) {
                    bp.node.nodeValue = bp.node.nodeValue.replace(/[ \t]+$/, '');
                }
                const count = bp.count || 1;
                for (let c = 0; c < count; c++) {
                    const br = document.createElement('br');
                    bp.node.parentNode.insertBefore(br, rightText);
                }
            } catch (e) {}
        }

        splitInlineBackgroundAtBr(bgEl, preMeasuredMetrics);
    };

    const normalizeTextBackgroundsForPrint = (container) => {
        if (!container) return;

        const contentContainers = container.querySelectorAll('.element-content');
        if (contentContainers.length === 0) return;

        contentContainers.forEach(contentEl => {
            if (contentEl.closest('[data-type="shape"], .border-art-wrapper, #native-border-art-border, .page-border-container, .op-theme-container')) {
                return;
            }

            let cScaleY = 1;
            try {
                if (contentEl.offsetHeight > 0) {
                    const cRect = contentEl.getBoundingClientRect();
                    if (cRect.height > 0) cScaleY = cRect.height / contentEl.offsetHeight;
                }
            } catch (e) {}

            const allDescendants = Array.from(contentEl.querySelectorAll('*'));
            const bgElements = allDescendants.filter(isInlineTextBgCandidate);

            bgElements.sort((a, b) => {
                let depthA = 0, pA = a;
                while ((pA = pA.parentElement)) depthA++;
                let depthB = 0, pB = b;
                while ((pB = pB.parentElement)) depthB++;
                return depthA - depthB;
            });

            // Pre-measure all candidate line groups and metrics before mutating the DOM
            const preMetricsMap = new Map();
            const preContentLineGroups = [];
            for (const bgEl of bgElements) {
                const m = measureInlineBgMetrics(bgEl);
                preMetricsMap.set(bgEl, m);
                if (m.lineGroups) {
                    for (const g of m.lineGroups) {
                        const existing = preContentLineGroups.find(cg => Math.abs(cg.top - g.top) <= 2.5);
                        if (!existing) {
                            preContentLineGroups.push({ top: g.top, height: g.height });
                        } else if (g.height > existing.height) {
                            existing.height = g.height;
                        }
                    }
                }
            }
            preContentLineGroups.sort((a, b) => a.top - b.top);

            // Pass 1: Normalize preserved newlines & nested block boundaries into <br> and split
            for (const bgEl of bgElements) {
                if (!bgEl.parentNode || bgEl.hasAttribute('data-op-line-split')) continue;
                const preMetrics = preMetricsMap.get(bgEl);
                convertPreservedNewlinesToBr(bgEl);
                unwrapNestedBlocksToBr(bgEl);
                if (bgEl.querySelector('br')) {
                    splitInlineBackgroundAtBr(bgEl, preMetrics);
                }
            }

            // Pass 2: Split any remaining soft-wrapped multi-line text backgrounds
            const remainingDescendants = Array.from(contentEl.querySelectorAll('*'));
            for (const el of remainingDescendants) {
                if (!el.parentNode || el.hasAttribute('data-op-line-split')) continue;
                if (isInlineTextBgCandidate(el)) {
                    splitSoftWrappedInlineBackground(el, preMetricsMap.get(el) || null);
                }
            }

            // Pass 3: Container-wide pre-split vertical step verification across all split/background lines
            if (preContentLineGroups.length >= 2) {
                const postLineEls = Array.from(contentEl.querySelectorAll('[data-op-line-split="true"]:not([data-op-line-spacer="true"])')).filter(el => {
                    return !el.parentElement || !el.parentElement.closest('[data-op-line-split="true"]');
                });
                if (postLineEls.length === preContentLineGroups.length) {
                    for (let k = 0; k < postLineEls.length - 1; k++) {
                        const lineK = postLineEls[k];
                        const lineNext = postLineEls[k + 1];
                        if (!lineK.parentNode || !lineNext.parentNode) continue;
                        try {
                            const editorStep = preContentLineGroups[k + 1].top - preContentLineGroups[k].top;
                            const curTopK = lineK.getBoundingClientRect().top / cScaleY;
                            const curTopNext = lineNext.getBoundingClientRect().top / cScaleY;
                            const currentStep = curTopNext - curTopK;
                            const missingStep = editorStep - currentStep;
                            const avgH = preContentLineGroups[k].height || 14;
                            if (missingStep >= avgH * 0.5) {
                                const curMb = parseFloat(lineK.style.marginBottom) || 0;
                                lineK.style.marginBottom = (curMb + missingStep).toFixed(2) + 'px';
                            }
                        } catch (e) {}
                    }
                }
            }
        });
    };

    window.normalizeTextBackgroundsForPrint = normalizeTextBackgroundsForPrint;

    window.printFullDocument = async function(isBooklet = false) {
        // Smart pre-flight detection for business card sized pages
        if (!isBooklet && !window._isMultiUpPrinting && typeof state !== 'undefined' && state.pages && state.pages.length > 0) {
            const firstPage = state.pages[0];
            if (typeof window.isCardSizedPage === 'function' && window.isCardSizedPage(firstPage) && typeof window.showCardSheetPromptModal === 'function') {
                window.showCardSheetPromptModal();
                return;
            }
        }
        return window.printFullDocumentDirect(isBooklet || window._isMultiUpPrinting);
    };

    window.printFullDocumentDirect = async function(isImposed = false) {
        if (!isImposed) {
            window._isBookletPrinting = false;
            window._isMultiUpPrinting = false;
            window._imposedSpreads = null;
        }
        
        let pagesToPrint = typeof state !== 'undefined' && state.pages ? state.pages : [];
        if ((window._isBookletPrinting || window._isMultiUpPrinting) && window._imposedSpreads) {
            pagesToPrint = window._imposedSpreads;
        }

        // Pre-Flight: Force browser to commit layout repaints
        document.querySelectorAll('.pub-element').forEach(el => el.getBoundingClientRect());
        await sleep(100);

        if (pagesToPrint && pagesToPrint.length > 0) {
            if (state && state.cropMode && typeof window.toggleCrop === 'function') window.toggleCrop();
            if (!window._isBookletPrinting && !window._isMultiUpPrinting && typeof serializeCurrentPage === 'function') pagesToPrint[state.currentPageIndex] = serializeCurrentPage();
            pagesToPrint.forEach((page) => {
                page.elements.forEach((el) => {
                    if (el.innerHTML) el.innerHTML = fixWordArtSpacesInHtml(el.innerHTML);
                });
            });
        }

        const isMultiUp = !!(window._isMultiUpPrinting && window._imposedSpreads);
        const multiUpNote = isMultiUp 
            ? `<div id="pdf-print-subnote" style="margin-top: 15px; font-size: 12px; color: #475569; line-height: 1.45; background: #f8fafc; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: left; box-sizing: border-box; max-width: 100%;">
                <div style="display: flex; align-items: flex-start; gap: 8px;">
                    <i class="fas fa-th-large" style="color: var(--ui-theme-dark, #007670); margin-top: 2px; flex-shrink: 0;"></i>
                    <span style="flex: 1;"><b>Arranging Cards for Print:</b> Open Publisher is tiling your design across the sheet with high-resolution graphics and crop guidelines. This takes a little longer than a standard print, but is actively working...</span>
                </div>
               </div>`
            : '';

        if (typeof DialogSystem !== 'undefined') {
            DialogSystem.show(isMultiUp ? 'Preparing Card Sheet...' : 'Preparing Print Job...', `
                <div style="text-align:center; padding: 20px 10px; font-family: 'Comfortaa', 'Afacad Flux', sans-serif; width: 380px; max-width: 90vw; margin: 0 auto; box-sizing: border-box;">
                    <div style="margin-bottom: 20px; display: flex; justify-content: center;">
                        <img src="https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/ZtZYk3e.png" class="print-anim-icon" style="width: 80px; height: auto;" alt="Print Icon" />
                    </div>
                    <p id="pdf-print-status" style="margin-bottom:20px; font-size:18px; color: var(--ui-text, #000); font-weight: 400;">
                        ${isMultiUp ? 'Arranging Card Sheet...' : 'Assembling Publication...'}
                    </p>
                    <div style="width: 100%; height: 20px; border: 2px solid var(--ui-theme-dark); border-radius: 20px; padding: 2px; background: transparent; overflow: hidden; box-sizing: border-box;">
                        <div id="pdf-print-progress" style="width: 0%; height: 100%; background: var(--ui-theme-color); border-radius: 20px; transition: width 0.3s ease;"></div>
                    </div>
                    ${multiUpNote}
                </div>
                <style>
                    #custom-dialog-box:has(#pdf-print-status) { width: 420px !important; max-width: 92vw !important; }
                    #custom-dialog-header { background-color: var(--ui-theme-dark) !important; color: white !important; font-size: 20px !important; font-family: 'Comfortaa', 'Afacad Flux', sans-serif !important; }
                    #custom-dialog-close { color: white !important; opacity: 0.8; }
                    #custom-dialog-confirm { display: none !important; }
                    .print-anim-icon { mix-blend-mode: multiply; }
                    body.dark-mode .print-anim-icon { filter: invert(1) grayscale(1) contrast(100); mix-blend-mode: screen; }
                    body.dark-mode #pdf-print-subnote { background: #1e293b !important; color: #cbd5e1 !important; border-color: #334155 !important; }
                </style>
            `, null, true);
        }

        const stagingArea = document.createElement('div');
        stagingArea.id = 'pdf-print-staging';
        stagingArea.style.cssText = 'position: fixed; top: 0; left: 0; z-index: -100; overflow: visible; display: flex; align-items: flex-start; justify-content: flex-start; opacity: 0.01; pointer-events: none;';
        document.body.appendChild(stagingArea);

        try {
            const totalPages = pagesToPrint.length;
            const progressEl = document.getElementById('pdf-print-progress');
            const statusEl = document.getElementById('pdf-print-status');

            const livePaper = document.getElementById('paper');
            let borderHtml = '';
            let masterThemeSettings = null;
            
            if (livePaper && livePaper.getAttribute('data-theme-saved') === 'true') {
                masterThemeSettings = {
                    saved: true,
                    id: livePaper.getAttribute('data-theme-id') || '',
                    name: livePaper.getAttribute('data-theme-name') || '',
                    type: livePaper.getAttribute('data-theme-type') || 'color',
                    c1: livePaper.getAttribute('data-theme-c1') || '#ffffff',
                    c2: livePaper.getAttribute('data-theme-c2') || '',
                    url: livePaper.getAttribute('data-theme-url') || '',
                    sat: livePaper.getAttribute('data-theme-sat') || '100',
                    bri: livePaper.getAttribute('data-theme-bri') || '100',
                    con: livePaper.getAttribute('data-theme-con') || '100',
                    hue: livePaper.getAttribute('data-theme-hue') || '0',
                    tex: livePaper.getAttribute('data-theme-tex') || '100',
                    size: livePaper.getAttribute('data-theme-size') || '100'
                };
            } else if (state.pages && state.pages[0] && state.pages[0].themeSettings && state.pages[0].themeSettings.saved) {
                masterThemeSettings = state.pages[0].themeSettings;
            }

            if (livePaper) {
                const liveBorder = livePaper.querySelector('[data-is-border="true"], #native-blueprint-border, #native-border-art-border');
                if (liveBorder) borderHtml = liveBorder.outerHTML;
            }

            // Determine the Master Layout based ENTIRELY on Page 1
            const masterPage = pagesToPrint[0] || {};
            const masterPW = parseFloat(masterPage.width) || 794;
            const masterPH = parseFloat(masterPage.height) || 1123;
            const masterIsPortrait = masterPW <= masterPH;
            
            // Resolve master DPI: check page.dpi, then state.dpi, then fallback heuristics
            let masterDpi = parseFloat(masterPage.dpi) || (typeof state !== 'undefined' && parseFloat(state.dpi)) || 0;
            if (!masterDpi || masterDpi <= 0) {
                const shortEdge = Math.min(masterPW, masterPH);
                if (shortEdge >= 2000) masterDpi = 300;
                else if (shortEdge >= 1000) masterDpi = 140;
                else masterDpi = 96;
            }

            // Convert exact canvas pixels to physical inches using document DPI
            let widthInches = (masterPW / masterDpi).toFixed(3);
            let heightInches = (masterPH / masterDpi).toFixed(3);

            if (typeof window.UnitConversionService !== 'undefined') {
                const fmt = window.UnitConversionService.detectFormat(masterPW, masterPH, masterDpi);
                const preset = window.UnitConversionService.PRESETS[fmt];
                if (preset) {
                    const pWIn = masterIsPortrait ? preset.widthIn : preset.heightIn;
                    const pHIn = masterIsPortrait ? preset.heightIn : preset.widthIn;
                    widthInches = pWIn.toFixed(3);
                    heightInches = pHIn.toFixed(3);
                }
            }

            let iframeHTMLString = '';

            for (let i = 0; i < totalPages; i++) {
                const page = pagesToPrint[i];
                if (statusEl) {
                    statusEl.innerText = isMultiUp 
                        ? `Arranging & rendering card sheet ${i + 1} of ${totalPages}...` 
                        : `Rendering page ${i + 1} of ${totalPages}...`;
                }
                if (progressEl) progressEl.style.width = `${((i) / totalPages) * 100}%`;

                const pW = parseFloat(page.width) || 794;
                const pH = parseFloat(page.height) || 1123;

                let pageWrapper = document.createElement('div');
                pageWrapper.style.width = pW + 'px';
                pageWrapper.style.height = pH + 'px';
                pageWrapper.style.position = 'relative';
                pageWrapper.style.overflow = 'hidden';
                pageWrapper.style.background = page.background || '#ffffff';

                // Determine active theme settings for this page
                let currentThemeSettings = null;
                if (page.themeSettings && page.themeSettings.saved) {
                    currentThemeSettings = page.themeSettings;
                } else if (masterThemeSettings && masterThemeSettings.saved) {
                    currentThemeSettings = masterThemeSettings;
                }

                // If theme is active and not ignored, bake it into a physical raster image so html2canvas renders exact adjusted colors
                if (currentThemeSettings && !page.ignoreBackground) {
                    const bakedDataUrl = await window.bakeThemeBackgroundForPrint(currentThemeSettings, pW, pH);
                    if (bakedDataUrl) {
                        const pageThemeHtml = `
                            <div class="op-theme-container op-theme-baked-wrap" style="position:absolute; top:0; left:0; width:${pW}px; height:${pH}px; pointer-events:none; z-index:-10;">
                                <img class="op-theme-baked-bg" src="${bakedDataUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:fill; display:block; border:none; outline:none; margin:0; padding:0; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">
                            </div>
                        `;
                        pageWrapper.insertAdjacentHTML('afterbegin', pageThemeHtml);
                    }
                }

                let elementsToRender = page.elements || [];
                let renderHeader = page.header || '';
                let renderFooter = page.footer || '';

                if (state.hasMasterPage && i > 0 && pagesToPrint === state.pages && state.pages[0] && !page.ignoreMasterPage) {
                    if (state.pages[0].elements) {
                        elementsToRender = state.pages[0].elements.concat(elementsToRender);
                    }
                    renderHeader = state.pages[0].header || '';
                    renderFooter = state.pages[0].footer || '';
                }
                
                // UNCONDITIONALLY filter out any raw unbaked theme wrappers from elementsToRender so they never occlude the baked background
                elementsToRender = elementsToRender.filter(el => !(el.innerHTML && (el.innerHTML.includes('op-theme-container') || el.innerHTML.includes('op-theme-bg'))));

                for (let el of elementsToRender) {
                    let elDiv = document.createElement('div');
                    elDiv.className = 'pub-element';
                    if (el.type) elDiv.setAttribute('data-type', el.type);
                    if (el.arrowStyle) elDiv.setAttribute('data-arrow-style', el.arrowStyle);
                    if (el.arrowHead) {
                        elDiv.setAttribute('data-arrow-head', el.arrowHead);
                        elDiv.setAttribute('data-arrow-head-px', el.arrowHead);
                        elDiv.setAttribute('data-arrow-head-length', el.arrowHead);
                    }
                    if (el.arrowStrokeWidth) elDiv.setAttribute('data-arrow-stroke-width', el.arrowStrokeWidth);
                    
                    elDiv.style.position = 'absolute';
                    elDiv.style.left = el.left;
                    elDiv.style.top = el.top;
                    elDiv.style.width = el.width;
                    elDiv.style.height = el.height;
                    elDiv.style.zIndex = el.zIndex;
                    elDiv.style.transform = el.transform || 'none';

                    let hueFilter = '';
                    if (el.filter && el.filter.includes('hue-rotate')) hueFilter = el.filter;
                    else if (el.style && el.style.filter && el.style.filter.includes('hue-rotate')) hueFilter = el.style.filter;
                    
                    if (!hueFilter && el.innerHTML) {
                        const match = el.innerHTML.match(/filter:\s*([^;"']*(?:hue-rotate|saturate)[^;"']*)/i);
                        if (match) hueFilter = match[1].trim();
                    }

                    if (!hueFilter && page === state.pages[state.currentPageIndex] && livePaper) {
                        const l1 = parseFloat(el.left) || 0;
                        const t1 = parseFloat(el.top) || 0;
                        const liveEls = Array.from(livePaper.querySelectorAll('.pub-element'));
                        
                        const matchEl = liveEls.find(e => {
                            const l2 = parseFloat(e.style.left) || 0;
                            const t2 = parseFloat(e.style.top) || 0;
                            return Math.abs(l1 - l2) < 2 && Math.abs(t1 - t2) < 2;
                        });
                        
                        if (matchEl) {
                            const comp = window.getComputedStyle(matchEl);
                            if (comp.filter && comp.filter !== 'none') hueFilter = comp.filter;
                            else {
                                const inner = matchEl.querySelector('.element-content');
                                if (inner) {
                                    const iComp = window.getComputedStyle(inner);
                                    if (iComp.filter && iComp.filter !== 'none') hueFilter = iComp.filter;
                                }
                            }
                        }
                    }

                    if (hueFilter && hueFilter !== 'none') {
                        elDiv.setAttribute('data-target-filter', hueFilter);
                    }

                    if (el.imgSrc) {
                        elDiv.style.overflow = 'visible';
                        elDiv.style.contain = 'none';
                        hueFilter = '';
                        if (elDiv.hasAttribute('data-target-filter')) {
                            elDiv.removeAttribute('data-target-filter');
                        }

                        let finalSrc = el.imgSrc;

                        try {
                            let isSvg = false;
                            let svgText = null;

                            if (finalSrc.includes('.svg') && !finalSrc.startsWith('data:')) {
                                const svgRes = await fetch(finalSrc, { mode: 'cors' });
                                svgText = await svgRes.text();
                                isSvg = true;
                            } else if (finalSrc.startsWith('data:image/svg+xml')) {
                                svgText = decodeURIComponent(escape(atob(finalSrc.split(',')[1])));
                                isSvg = true;
                            }

                            if (isSvg && svgText) {
                                svgText = svgText.replace(/\bpreserveAspectRatio\s*=\s*["'][^"']*["']/gi, '');
                                svgText = svgText.replace(/<svg/i, '<svg preserveAspectRatio="none" width="100%" height="100%"');
                                finalSrc = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))}`;
                            }
                        } catch (e) { }

                        // Force proxy for external URLs to guarantee CORS headers and bypass local SSL cert issues
                        if (finalSrc && finalSrc.startsWith('http') && !finalSrc.includes('wsrv.nl')) {
                            let cleanUrl = finalSrc.replace(/^https?:\/\//, '');
                            if (cleanUrl.includes('acr.floydcraft')) cleanUrl = 'http://' + cleanUrl;
                            finalSrc = `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}`;
                        }

                        let cropDiv = document.createElement('div');
                        cropDiv.style.width = '100%';
                        cropDiv.style.height = '100%';
                        cropDiv.style.position = 'relative';

                        const shapeClipPath = getImageShapeClipPath(el, page, livePaper);
                        if (shapeClipPath) {
                            cropDiv.style.clipPath = shapeClipPath;
                            cropDiv.style.webkitClipPath = shapeClipPath;
                            cropDiv.style.overflow = 'hidden';
                            cropDiv.style.contain = 'paint';
                        } else {
                            cropDiv.style.clipPath = 'none';
                            cropDiv.style.webkitClipPath = 'none';
                            cropDiv.style.overflow = 'hidden';
                            cropDiv.style.contain = 'paint';
                        }

                        const sX = el.scaleX || "1";
                        const sY = el.scaleY || "1";
                        cropDiv.style.transform = `scale(${sX}, ${sY})`;
                        cropDiv.style.transformOrigin = 'center center';

                        let img = document.createElement('img');
                        img.crossOrigin = 'anonymous';
                        img.setAttribute('crossorigin', 'anonymous');
                        // Note: do not prematurely set img.src here so loadImageStrict can manage onload/onerror/src and prevent event swallowed bugs
                        const savedImgStyle = { ...(el.imgStyle || {}) };
                        if (el.imgStyle) Object.assign(img.style, el.imgStyle);
                        img.style.clipPath = 'none';
                        img.style.webkitClipPath = 'none';

                        if (isDefaultFillImageLayout(savedImgStyle)) {
                            img.style.width = '100%';
                            img.style.height = '100%';
                            img.style.objectFit = savedImgStyle.objectFit || 'fill';
                            img.style.display = 'block';
                            img.style.position = 'absolute';
                            img.style.top = '0';
                            img.style.left = '0';
                        } else {
                            img.style.position = savedImgStyle.position || 'absolute';
                            img.style.width = savedImgStyle.width || '100%';
                            img.style.height = savedImgStyle.height || '100%';
                            img.style.top = savedImgStyle.top || '0';
                            img.style.left = savedImgStyle.left || '0';
                            img.style.maxWidth = savedImgStyle.maxWidth || 'none';
                            img.style.maxHeight = savedImgStyle.maxHeight || 'none';
                            img.style.display = 'block';
                            if (savedImgStyle.objectFit) img.style.objectFit = savedImgStyle.objectFit;
                        }

                        let currentFilter = ''; let currentOpacity = '1';
                        if (el.imgStyle) {
                            if (el.imgStyle.opacity !== undefined && el.imgStyle.opacity !== '' && el.imgStyle.opacity !== null) {
                                currentOpacity = String(el.imgStyle.opacity);
                            }
                            if (el.imgStyle.filter) currentFilter = el.imgStyle.filter;
                        }
                        if (!currentFilter && el.filter) {
                            currentFilter = el.filter;
                        }
                        if (!currentFilter && el.contentCssText) {
                            const m = el.contentCssText.match(/filter:\s*([^;]+)/i);
                            if (m) currentFilter = m[1].trim();
                        }
                        if (!currentFilter && el.innerHTML) {
                            const m = el.innerHTML.match(/filter:\s*([^;"]+)/i);
                            if (m) currentFilter = m[1].trim();
                        }
                        currentFilter = (currentFilter || '').replace(/\bnone\b/g, '').trim();

                        if (page === state.pages[state.currentPageIndex] && livePaper) {
                            const l1 = parseFloat(el.left) || 0;
                            const t1 = parseFloat(el.top) || 0;
                            const liveEls = Array.from(livePaper.querySelectorAll('.pub-element'));
                            const activeEl = (el.id ? livePaper.querySelector('#' + CSS.escape(el.id)) : null) ||
                                liveEls.find(e => Math.abs((parseFloat(e.style.left)||0) - l1) < 2 && Math.abs((parseFloat(e.style.top)||0) - t1) < 2);
                            
                            if (activeEl) {
                                let liveFilter = '';
                                const activeImg = activeEl.querySelector('img');
                                if (activeImg) {
                                    if (isDefaultFillImageLayout(savedImgStyle)) {
                                        const liveW = activeImg.style.width;
                                        const liveH = activeImg.style.height;
                                        const liveL = activeImg.style.left;
                                        const liveT = activeImg.style.top;
                                        if (liveW && liveW !== '100%' && liveW !== 'auto') {
                                            savedImgStyle.width = liveW;
                                            savedImgStyle.height = liveH;
                                            savedImgStyle.left = liveL;
                                            savedImgStyle.top = liveT;
                                            savedImgStyle.position = activeImg.style.position || 'absolute';
                                        }
                                    }
                                    const comp = window.getComputedStyle(activeImg);
                                    const f1 = (comp.filter && comp.filter !== 'none') ? comp.filter : (activeImg.style.filter || '');
                                    if (f1 && f1 !== 'none') liveFilter = (liveFilter + ' ' + f1).trim();
                                    if (activeImg.style.opacity) currentOpacity = activeImg.style.opacity;
                                    else if (comp.opacity && comp.opacity !== '1') currentOpacity = comp.opacity;
                                }
                                
                                const activeContent = activeEl.querySelector('.element-content');
                                if (activeContent) {
                                    const cComp = window.getComputedStyle(activeContent);
                                    const f2 = (cComp.filter && cComp.filter !== 'none') ? cComp.filter : (activeContent.style.filter || '');
                                    if (f2 && f2 !== 'none') {
                                        if (f2.includes('drop-shadow') && liveFilter.includes('drop-shadow')) {
                                            liveFilter = liveFilter.replace(/drop-shadow\((?:[^)(]+|\([^)(]*\))*\)/g, '').trim();
                                        }
                                        liveFilter = (liveFilter + ' ' + f2).trim();
                                    }
                                }

                                const elComp = window.getComputedStyle(activeEl);
                                const f3 = (elComp.filter && elComp.filter !== 'none') ? elComp.filter : (activeEl.style.filter || '');
                                if (f3 && f3 !== 'none') {
                                    if (f3.includes('drop-shadow') && liveFilter.includes('drop-shadow')) {
                                        liveFilter = liveFilter.replace(/drop-shadow\((?:[^)(]+|\([^)(]*\))*\)/g, '').trim();
                                    }
                                    liveFilter = (liveFilter + ' ' + f3).trim();
                                }

                                liveFilter = liveFilter.replace(/\bnone\b/g, '').trim();
                                if (liveFilter) {
                                    currentFilter = liveFilter;
                                }
                            }
                        }
                        currentFilter = (currentFilter || '').replace(/\bnone\b/g, '').trim();

                        const displayW = parseFloat(el.width) || parseFloat(el.imgStyle?.width) || 400;
                        const displayH = parseFloat(el.height) || parseFloat(el.imgStyle?.height) || 400;
                        const hasOpacityChange = (currentOpacity !== '' && currentOpacity !== '1' && !isNaN(parseFloat(currentOpacity)) && parseFloat(currentOpacity) < 0.999);
                        const isCropped = !isDefaultFillImageLayout(savedImgStyle);
                        const needsBake = !!(isCropped || shapeClipPath || (currentFilter && currentFilter !== 'none') || hasOpacityChange);

                        if (needsBake) {
                            try {
                                const baked = await bakeImageForPrint(finalSrc, displayW, displayH, {
                                    filter: currentFilter,
                                    opacity: currentOpacity,
                                    clipPath: shapeClipPath,
                                    imgStyle: savedImgStyle
                                });
                                const bakedSrc = typeof baked === 'string' ? baked : baked.src;
                                await loadImageStrict(img, bakedSrc);
                                
                                if (baked && baked.padW) {
                                    img.style.position = 'absolute';
                                    img.style.left = '0px';
                                    img.style.top = '0px';
                                    img.style.width = `calc(100% + ${baked.padW/2}px)`;
                                    img.style.height = `calc(100% + ${baked.padH/2}px)`;
                                    img.style.marginLeft = `-${baked.padX/2}px`;
                                    img.style.marginTop = `-${baked.padY/2}px`;
                                    img.style.maxWidth = 'none';
                                    img.style.maxHeight = 'none';
                                    cropDiv.style.overflow = 'visible'; // ALLOW SHADOW TO BE SEEN
                                    cropDiv.style.contain = 'none'; // ALLOW SHADOW TO BE SEEN
                                    elDiv.style.overflow = 'visible';
                                    elDiv.style.contain = 'none';
                                } else {
                                    img.style.position = 'absolute';
                                    img.style.left = '0px';
                                    img.style.top = '0px';
                                    img.style.width = '100%';
                                    img.style.height = '100%';
                                    img.style.marginLeft = '0px';
                                    img.style.marginTop = '0px';
                                    img.style.maxWidth = 'none';
                                    img.style.maxHeight = 'none';
                                    img.style.objectFit = 'fill';
                                    cropDiv.style.overflow = 'hidden';
                                    cropDiv.style.contain = 'paint';
                                }
                                
                                img.style.filter = 'none';
                                img.style.WebkitFilter = 'none';
                                img.style.opacity = '1';
                                cropDiv.style.clipPath = 'none';
                                cropDiv.style.webkitClipPath = 'none';
                                const rMatch = shapeClipPath ? shapeClipPath.match(/round\s+([0-9]+(?:\.[0-9]+)?(?:px|%))/i) : null;
                                if (rMatch && (!baked || !baked.padW)) {
                                    cropDiv.style.borderRadius = rMatch[1];
                                }
                            } catch(e) {
                                console.warn('[Print Engine] Image bake failed, falling back to CSS clipping:', e);
                                await loadImageStrict(img, finalSrc);
                                let safeFilter = (currentFilter || '').replace(/\bnone\b/g, '').trim();
                                img.style.filter = safeFilter || 'none';
                                img.style.opacity = hasOpacityChange ? currentOpacity : '1';
                                if (isCropped || shapeClipPath) {
                                    cropDiv.style.overflow = 'hidden';
                                    cropDiv.style.contain = 'paint';
                                } else {
                                    cropDiv.style.overflow = 'visible';
                                    cropDiv.style.contain = 'none';
                                }
                                elDiv.style.overflow = 'visible';
                                elDiv.style.contain = 'none';
                                if (shapeClipPath) {
                                    cropDiv.style.clipPath = shapeClipPath;
                                    cropDiv.style.webkitClipPath = shapeClipPath;
                                    const rMatch = shapeClipPath.match(/round\s+([0-9]+(?:\.[0-9]+)?(?:px|%))/i);
                                    if (rMatch) {
                                        cropDiv.style.borderRadius = rMatch[1];
                                        img.style.borderRadius = rMatch[1];
                                    }
                                } else {
                                    cropDiv.style.clipPath = 'none';
                                    cropDiv.style.webkitClipPath = 'none';
                                }
                            }
                        } else {
                            await loadImageStrict(img, finalSrc);
                            img.style.opacity = '1';
                            if (isCropped || shapeClipPath) {
                                cropDiv.style.overflow = 'hidden';
                                cropDiv.style.contain = 'paint';
                            }
                        }
                        
                        cropDiv.appendChild(img);
                        elDiv.appendChild(cropDiv);
                        
                    } else if (el.clipPath) {
                        const sX = el.scaleX || "1";
                        const sY = el.scaleY || "1";
                        elDiv.innerHTML = `<div style="width:100%; height:100%; background:${el.bg}; clip-path:${el.clipPath}; -webkit-clip-path:${el.clipPath}; transform: scale(${sX}, ${sY}); transform-origin: center center;"></div>`;
                    } else {
                        const pad = 40;
                        const sX = el.scaleX || "1";
                        const sY = el.scaleY || "1";
                        
                        elDiv.style.left = `calc(${el.left} - ${pad}px)`;
                        elDiv.style.top = `calc(${el.top} - ${pad}px)`;
                        elDiv.style.width = `calc(${el.width} + ${pad * 2}px)`;
                        elDiv.style.height = `calc(${el.height} + ${pad * 2}px)`;

                        let cleanHTML = el.innerHTML.replace(/contenteditable="true"/g, 'contenteditable="false"');
                        cleanHTML = cleanHTML.replace(/https:\/\/(www\.transparenttextures\.com[^'"]+)/g, 'https://wsrv.nl/?url=$1');
                        cleanHTML = fixWordArtSpacesInHtml(cleanHTML);
                        
                        let css = el.contentCssText || `transform: scale(${sX}, ${sY}); width:100%; height:100%; transform-origin: center center; outline: none; border: none;`;
                        css += " overflow: visible !important;";
                        
                        let pVal = null;
                        css = css.replace(/perspective\s*\(\s*([^)]+)\s*\)/i, (match, p1) => { pVal = p1; return ''; });
                        
                        css = css.replace(/transform-style:\s*preserve-3d;?/gi, '').replace(/backface-visibility:\s*hidden;?/gi, '');
                        if (!css.includes('width:')) css += '; width:100%; height:100%;';
                        
                        let parentStyle = `position: absolute; top: ${pad}px; left: ${pad}px; width: ${el.width}; height: ${el.height}; overflow: visible !important;`;
                        if (pVal) { parentStyle += ` perspective: ${pVal}; perspective-origin: center;`; }
                        
                        elDiv.innerHTML = `
                            <div style="${parentStyle}">
                                <div class="element-content" style="${css}">
                                    ${cleanHTML}
                                </div>
                            </div>
                        `;
                    }
                    pageWrapper.appendChild(elDiv);
                }

                if (borderHtml && !pageWrapper.querySelector('#native-border-art-border, [data-is-border="true"]')) {
                    pageWrapper.insertAdjacentHTML('beforeend', borderHtml);
                } else if (!pageWrapper.querySelector('#native-border-art-border, .border-art-wrapper') && page.borderStyle && page.borderStyle.startsWith('borderart:')) {
                    const parts = page.borderStyle.split(':');
                    const artId = parts[1] || 'santas';
                    const preset = window.BorderArtEngine ? window.BorderArtEngine.getPresetById(artId) : null;
                    if (preset && window.BorderArtEngine) {
                        const pW = parseFloat(page.width) || 794;
                        const pH = parseFloat(page.height) || 1123;
                        const size = parseInt(parts[2]) || 32;
                        const inset = parts[3] !== undefined ? parseInt(parts[3]) : 15;
                        const bDiv = document.createElement('div');
                        bDiv.id = 'native-border-art-border';
                        bDiv.className = 'pub-element';
                        bDiv.setAttribute('data-type', 'shape');
                        bDiv.setAttribute('data-is-border', 'true');
                        bDiv.style.cssText = `position: absolute; left: 0px; top: 0px; width: ${pW}px; height: ${pH}px; z-index: 1; pointer-events: none;`;
                        bDiv.innerHTML = `<div class="element-content" style="width:100%; height:100%; position:absolute; inset:0; pointer-events:none;">${window.BorderArtEngine.generateTilesHTML(preset, pW, pH, size, inset)}</div>`;
                        pageWrapper.appendChild(bDiv);
                    }
                }
                
                if (state.headersVisible) {
                    if (renderHeader) pageWrapper.insertAdjacentHTML('beforeend', `<div class="page-header visible" style="pointer-events:none; z-index:0;">${renderHeader}</div>`);
                    if (renderFooter) pageWrapper.insertAdjacentHTML('beforeend', `<div class="page-footer visible" style="pointer-events:none; z-index:0;">${renderFooter}</div>`);
                }

                stagingArea.appendChild(pageWrapper);

                // --- TAB PRINT RESCUE MODULE ---
                // html2canvas fails spectacularly on flex-grow calculations.
                // We bake exact computed pixel widths into the inline styles to freeze the layout.
                pageWrapper.querySelectorAll('.op-tab-container').forEach(container => {
                    const children = Array.from(container.children);
                    children.forEach(child => {
                        const w = child.getBoundingClientRect().width;
                        child.style.flexGrow = '0';
                        child.style.flexShrink = '0';
                        child.style.width = `${w}px`;
                        child.style.minWidth = `${w}px`;
                        child.style.maxWidth = `${w}px`;
                        
                        // html2canvas gradient fallback
                        if (child.classList.contains('op-tab-spacer')) {
                            child.style.overflow = 'hidden';
                            child.style.whiteSpace = 'nowrap';
                            if (child.classList.contains('op-tab-leader-dotted') || child.classList.contains('op-tab-leader-dashed')) {
                                child.style.backgroundImage = 'none';
                                const char = child.classList.contains('op-tab-leader-dotted') ? '.' : '-';
                                child.innerText = char.repeat(Math.ceil(w / 6) + 2);
                                child.style.letterSpacing = child.classList.contains('op-tab-leader-dotted') ? '4px' : '2px';
                            }
                        }
                    });
                });

                pageWrapper.querySelectorAll('.wa-text').forEach(flattenWaTextForPrint);

                // ✨ HIGH-RES WORDART PRINT BAKING (Physical Print & PDF Export) ✨
                const betaWordArts = Array.from(pageWrapper.querySelectorAll('.beta-wa-img'));
                if (betaWordArts.length > 0 && (typeof window.generateWordArtPNG === 'function' || typeof window.renderWordArtCanvasSync === 'function')) {
                    if (statusEl) statusEl.innerText = `Baking high-resolution WordArt on page ${i + 1}...`;
                    for (const waImg of betaWordArts) {
                        const text = waImg.getAttribute('data-beta-wa-text');
                        const styleId = parseInt(waImg.getAttribute('data-beta-wa-style'), 10);
                        if (text && styleId) {
                            const parentEl = waImg.closest('.pub-element') || waImg.parentElement;
                            const dispW = parentEl ? (parseFloat(parentEl.style.width) || parentEl.offsetWidth || 800) : 800;
                            const dispH = parentEl ? (parseFloat(parentEl.style.height) || parentEl.offsetHeight || 200) : 200;
                            const baseW = parentEl ? (parseFloat(parentEl.getAttribute('data-beta-wa-basew')) || 600) : 600;
                            const baseH = parentEl ? (parseFloat(parentEl.getAttribute('data-beta-wa-baseh')) || 130) : 130;
                            const targetW = Math.max(1600, Math.min(6000, Math.round(dispW * 4.0)));
                            const targetH = Math.max(600, Math.min(4500, Math.round(dispH * 4.0)));
                            const scaleX = Math.max(1.0, Math.min(12.0, targetW / baseW));
                            const scaleY = Math.max(1.0, Math.min(18.0, targetH / baseH));
                            try {
                                const renderFn = window.generateWordArtPNG || window.renderWordArtCanvasSync;
                                const highResSrc = await renderFn(text, styleId, false, scaleX, scaleY);
                                if (highResSrc) {
                                    await loadImageStrict(waImg, highResSrc);
                                }
                            } catch (err) {
                                console.warn('[Print Engine] Failed to upscale WordArt for print:', err);
                            }
                        }
                    }
                }

                // ✨ HIGH-RES SMART ARROW PRINT BAKING (Physical Print & PDF Export) ✨
                const arrowTargets = Array.from(pageWrapper.querySelectorAll('[data-type="smart-arrow"], .pub-element[data-type="smart-arrow"], svg.smart-arrow-svg'));
                const printSmartArrows = Array.from(new Set(arrowTargets.map(el => (el.classList && el.classList.contains('smart-arrow-svg')) ? (el.closest('[data-type="smart-arrow"]') || el.closest('.pub-element') || el) : el)));
                if (printSmartArrows.length > 0 && typeof window.bakeSmartArrowForPrint === 'function') {
                    if (statusEl) statusEl.innerText = `Baking high-resolution Arrows on page ${i + 1}...`;
                    for (const arrowEl of printSmartArrows) {
                        try {
                            const bakedImg = window.bakeSmartArrowForPrint(arrowEl, 4.0);
                            if (bakedImg && typeof loadImageStrict === 'function') {
                                await loadImageStrict(bakedImg, bakedImg.src);
                            }
                        } catch (err) {
                            console.warn('[Print Engine] Failed to bake Smart Arrow for export:', err);
                        }
                    }
                }

                if (statusEl) statusEl.innerText = `Converting WordArt to a printable format on page ${i + 1}...`;
                
                const wordArts = Array.from(pageWrapper.querySelectorAll('.wa-text')).filter(node => {
                    if (node.getAttribute('data-wa-print-baked') === 'true') return false;
                    let comp;
                    try { comp = window.getComputedStyle(node); } catch (e) { return false; }
                    if (!comp) return false;
                    const wClip = comp.webkitBackgroundClip || comp.backgroundClip || '';
                    const fill = comp.webkitTextFillColor || '';
                    const hasClip = wClip === 'text' || fill === 'transparent';
                    if (!hasClip) return false;
                    const bgImage = comp.backgroundImage !== 'none' ? comp.backgroundImage : comp.background;
                    return bgImage && bgImage !== 'none';
                });

                for (let node of wordArts) {
                    try {
                        flattenWaTextForPrint(node);

                        const comp = window.getComputedStyle(node);
                        const bgImage = comp.backgroundImage !== 'none' ? comp.backgroundImage : comp.background;
                        if (!bgImage || bgImage === 'none') continue;

                        const w = node.offsetWidth || 300;
                        const h = node.offsetHeight || 100;

                        const gradDiv = document.createElement('div');
                        gradDiv.style.cssText = `position:fixed; top:-9999px; left:-9999px; width:${w}px; height:${h}px; background:${bgImage};`;
                        document.body.appendChild(gradDiv);
                        const gradCanvas = await html2canvas(gradDiv, { scale: 2, logging: false });
                        gradDiv.remove();

                        const maskNode = node.cloneNode(true);
                        flattenWaTextForPrint(maskNode);
                        
                        Array.from(maskNode.classList).forEach(cls => {
                            if (cls.startsWith('wa-style-')) {
                                maskNode.classList.remove(cls);
                            }
                        });

                        maskNode.style.setProperty('text-shadow', 'none', 'important');
                        maskNode.style.setProperty('-webkit-text-stroke', '0px', 'important');
                        maskNode.style.setProperty('color', '#000000', 'important');
                        maskNode.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
                        maskNode.style.setProperty('background', 'transparent', 'important');
                        maskNode.style.setProperty('background-color', 'transparent', 'important');
                        maskNode.style.setProperty('background-image', 'none', 'important');
                        maskNode.style.setProperty('-webkit-background-clip', 'initial', 'important');
                        maskNode.style.setProperty('white-space', 'nowrap', 'important');
                        maskNode.style.setProperty('display', 'block', 'important');
                        maskNode.style.setProperty('transform', 'none', 'important');
                        maskNode.style.setProperty('margin', '0', 'important');

                        const captureBox = document.createElement('div');
                        captureBox.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;overflow:visible; background:transparent;`;
                        captureBox.appendChild(maskNode);
                        document.body.appendChild(captureBox);

                        const maskCanvas = await html2canvas(captureBox, { scale: 2, logging: false, backgroundColor: null });
                        captureBox.remove();

                        const finalCanvas = document.createElement('canvas');
                        finalCanvas.width = maskCanvas.width;
                        finalCanvas.height = maskCanvas.height;
                        const ctx = finalCanvas.getContext('2d');

                        ctx.drawImage(maskCanvas, 0, 0);
                        ctx.globalCompositeOperation = 'source-in';
                        ctx.drawImage(gradCanvas, 0, 0, finalCanvas.width, finalCanvas.height);

                        Array.from(node.classList).forEach(cls => {
                            if (cls.startsWith('wa-style-')) node.classList.remove(cls);
                        });

                        node.innerHTML = '';
                        node.setAttribute('data-wa-print-baked', 'true');
                        node.style.position = 'relative';
                        node.style.width = w + 'px';
                        node.style.height = h + 'px';
                        node.style.margin = '0';
                        node.style.setProperty('background', 'none', 'important');
                        node.style.setProperty('background-image', 'none', 'important');
                        node.style.setProperty('-webkit-background-clip', 'border-box', 'important');
                        node.style.setProperty('background-clip', 'border-box', 'important');
                        node.style.setProperty('filter', 'none', 'important');

                        const img = document.createElement('img');
                        img.src = finalCanvas.toDataURL('image/png');
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'contain';
                        img.style.pointerEvents = 'none';
                        img.style.display = 'block';
                        node.appendChild(img);

                    } catch (e) {}
                }

                if (statusEl) statusEl.innerText = `Applying color filters on page ${i + 1}...`;
                const filterElements = Array.from(pageWrapper.querySelectorAll('[data-target-filter]'));
                
                for (let fNode of filterElements) {
                    try {
                        const filterStr = fNode.getAttribute('data-target-filter');
                        if (!filterStr || filterStr === 'none') continue;

                        const w = fNode.offsetWidth || parseFloat(fNode.style.width) || 300;
                        const h = fNode.offsetHeight || parseFloat(fNode.style.height) || 100;
                        
                        const clone = fNode.cloneNode(true);
                        clone.style.position = 'relative';
                        clone.style.left = '0';
                        clone.style.top = '0';
                        clone.style.transform = 'none';
                        clone.style.margin = '0';
                        
                        clone.style.filter = 'none';
                        clone.querySelectorAll('*').forEach(n => {
                            if (n.style) n.style.filter = 'none';
                        });
                        
                        const tempBox = document.createElement('div');
                        tempBox.style.cssText = `position:fixed; top:-9999px; left:-9999px; width:${w}px; height:${h}px;`;
                        tempBox.appendChild(clone);
                        document.body.appendChild(tempBox);

                        const rawCanvas = await html2canvas(tempBox, { scale: 2, logging: false, backgroundColor: null });
                        tempBox.remove();

                        const bakedCanvas = document.createElement('canvas');
                        bakedCanvas.width = rawCanvas.width;
                        bakedCanvas.height = rawCanvas.height;
                        const ctx = bakedCanvas.getContext('2d');
                        ctx.filter = filterStr;
                        ctx.drawImage(rawCanvas, 0, 0);

                        fNode.innerHTML = `<img src="${bakedCanvas.toDataURL('image/png')}" style="width:100%; height:100%; object-fit:contain; pointer-events:none; border:none; outline:none; filter:none !important;">`;
                        fNode.style.filter = 'none';
                        fNode.style.WebkitFilter = 'none';
                        fNode.removeAttribute('data-target-filter');

                    } catch(e) {}
                }

                const bgUrls = [];
                pageWrapper.querySelectorAll('*').forEach(node => {
                    const bg = node.style.backgroundImage;
                    if (bg && bg !== 'none' && bg.includes('url(')) {
                        const match = bg.match(/url\(['"]?(.*?)['"]?\)/);
                        if (match && match[1] && !match[1].startsWith('data:')) bgUrls.push(match[1]);
                    }
                });

                if (bgUrls.length > 0) {
                    if (statusEl) statusEl.innerText = `Implementing textures for page ${i + 1}...`;
                    await Promise.all(bgUrls.map(url => {
                        return new Promise(resolve => {
                            let settled = false;
                            const done = () => { if (!settled) { settled = true; resolve(); } };
                            const img = new Image(); 
                            img.crossOrigin = "Anonymous";
                            img.onload = done; 
                            img.onerror = done; 
                            img.src = url;
                            if (img.complete && img.naturalWidth > 0) done();
                            setTimeout(done, 2000);
                        });
                    }));
                }

                if (statusEl) {
                    statusEl.innerText = isMultiUp 
                        ? `Rendering high-res card sheet ${i + 1} of ${totalPages}...` 
                        : `Rendering page ${i + 1} of ${totalPages}...`;
                }
                await sleep(100); 

                // ✨ NORMALIZE MULTI-LINE INLINE TEXT BACKGROUNDS (Pasted CSS / Highlights) FOR PRINT ✨
                normalizeTextBackgroundsForPrint(pageWrapper);
                
                // Calculate optimal html2canvas scale based on page DPI (target print density is ~300 DPI)
                const pageDpi = parseFloat(page.dpi) || masterDpi || 96;
                const targetScale = Math.max(1, Math.min(3, Math.round(300 / pageDpi)));
                const fallbackScale = Math.max(1, targetScale - 1);

                let h2cBg = (typeof window.sanitizeH2cBackgroundColor === 'function')
                    ? window.sanitizeH2cBackgroundColor(page.background || '#ffffff', !!currentThemeSettings)
                    : (currentThemeSettings || (page.background && (page.background.includes('gradient') || page.background.includes('url('))) ? null : '#ffffff');

                const bakedImgs = Array.from(pageWrapper.querySelectorAll('.op-theme-baked-bg'));
                for (const bImg of bakedImgs) {
                    if (!bImg.complete) {
                        await new Promise(r => { bImg.onload = r; bImg.onerror = r; setTimeout(r, 200); });
                    }
                }

                // Ensure all Border Art tiles preserve 1:1 aspect ratio, have CORS credentials, and are fully preloaded for html2canvas
                const borderArtImgs = Array.from(pageWrapper.querySelectorAll('.border-art-wrapper img, .element-border-art img'));
                if (borderArtImgs.length > 0) {
                    borderArtImgs.forEach(img => {
                        img.crossOrigin = 'anonymous';
                        img.setAttribute('crossorigin', 'anonymous');
                        if (img.src && img.src.includes('acr.floydcraft') && !img.src.includes('fit=contain')) {
                            img.src = img.src + '&w=128&h=128&fit=contain';
                        }
                    });
                    if (statusEl) statusEl.innerText = `Preparing Border Art tiles on page ${i + 1}...`;
                    await Promise.all(borderArtImgs.map(img => {
                        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
                        return new Promise(resolve => {
                            let settled = false;
                            const done = () => { if (!settled) { settled = true; resolve(); } };
                            img.onload = done;
                            img.onerror = done;
                            if (img.complete && img.naturalWidth > 0) done();
                            setTimeout(done, 2500);
                        });
                    }));
                }

                // Universal pre-flight: verify all <img> elements in pageWrapper have crossOrigin set for html2canvas
                pageWrapper.querySelectorAll('img').forEach(pImg => {
                    if (pImg.src && !pImg.src.startsWith('data:')) {
                        pImg.crossOrigin = 'anonymous';
                        pImg.setAttribute('crossorigin', 'anonymous');
                    }
                });

                let canvas;
                try {
                    const h2cPromise = html2canvas(pageWrapper, { 
                        scale: targetScale, useCORS: true, logging: false, backgroundColor: h2cBg, imageTimeout: 4000
                    });
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`html2canvas scale ${targetScale} timeout`)), 12000));
                    canvas = await Promise.race([h2cPromise, timeoutPromise]);
                } catch (h2cErr) {
                    console.warn(`[Print Engine] html2canvas scale ${targetScale} failed or timed out, falling back to scale ${fallbackScale}:`, h2cErr);
                    try {
                        canvas = await html2canvas(pageWrapper, { 
                            scale: fallbackScale, useCORS: true, logging: false, backgroundColor: h2cBg, imageTimeout: 3000
                        });
                    } catch (fallbackErr) {
                        console.warn(`[Print Engine] html2canvas fallback scale ${fallbackScale} with bg failed, retrying with transparent background:`, fallbackErr);
                        canvas = await html2canvas(pageWrapper, { 
                            scale: fallbackScale, useCORS: true, logging: false, backgroundColor: null, imageTimeout: 3000
                        });
                    }
                }

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const isPortrait = pW <= pH;

                // ✨ AUTO-ROTATION NORMALIZATION ✨
                // If this page's orientation doesn't match Page 1's orientation, we rotate it dynamically.
                // This ensures the legacy Chromium printer receives a document where ALL pages are the exact same shape.
                let imgStyle = '';
                if (isPortrait !== masterIsPortrait) {
                    // Rotate the image 90 degrees and apply the 1.004 scale for micro-bleed
                    imgStyle = `position: absolute; top: 50%; left: 50%; width: ${heightInches}in !important; height: ${widthInches}in !important; transform: translate(-50%, -50%) rotate(90deg) scale(1.004); object-fit: fill; display: block; border: none; outline: none; margin: 0; padding: 0; max-width: none !important;`;
                } else {
                    // Normal orientation with -0.2% micro-bleed
                    imgStyle = `position: absolute; top: -0.2%; left: -0.2%; width: 100.4% !important; height: 100.4% !important; object-fit: fill; display: block; border: none; outline: none; margin: 0; padding: 0; max-width: none !important;`;
                }
                
                const isLastPage = (i === totalPages - 1);
                const pageBreakCss = isLastPage 
                    ? 'page-break-after: avoid; break-after: avoid;' 
                    : 'page-break-after: always; break-after: page;';

                // Collect the rendered page into the HTML string, locked exactly to the master layout size.
                // Using height: calc(${heightInches}in - 1px) eliminates sub-pixel rounding overflow into blank sheets.
                iframeHTMLString += `
                    <div class="page" style="width: ${widthInches}in; height: calc(${heightInches}in - 1px); position: relative; overflow: hidden; ${pageBreakCss} background: white; margin: 0; padding: 0; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid; font-size: 0; line-height: 0;">
                        <img src="${imgData}" style="${imgStyle}">
                    </div>
                `;

                stagingArea.innerHTML = ''; 
            }

            if (progressEl) progressEl.style.width = '100%';
            if (statusEl) statusEl.innerText = "Launching Printer...";
            stagingArea.remove();

            const printIframe = document.createElement('iframe');
            printIframe.className = 'op-print-frame';
            
            // Set the iframe's internal viewport to match the physical Master paper size.
            printIframe.style.cssText = `
                position: fixed; 
                top: 0; 
                left: 0; 
                width: ${widthInches}in; 
                height: 100vh; 
                z-index: -9999; 
                opacity: 0.01; 
                pointer-events: none; 
                border: none;
            `;
            document.body.appendChild(printIframe);

            const iframeDoc = printIframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print Document</title>
                    <style>
                        /* ✨ THE UNIFIED MASTER LAYOUT ✨ */
                        @page { 
                            size: ${widthInches}in ${heightInches}in !important; 
                            margin: 0 !important; 
                        }
                        html, body { 
                            margin: 0 !important; 
                            padding: 0 !important; 
                            background: white !important; 
                            -webkit-print-color-adjust: exact !important; 
                            print-color-adjust: exact !important;
                            width: ${widthInches}in !important;
                            max-width: ${widthInches}in !important;
                            min-width: ${widthInches}in !important;
                            height: auto !important;
                            overflow: visible !important;
                        }
                        
                        .page {
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                        }
                        
                        /* Stop the printer from kicking out a blank page at the end */
                        .page:last-child {
                            page-break-after: avoid !important;
                            break-after: avoid !important;
                        }
                    </style>
                </head>
                <body>
                    ${iframeHTMLString}
                </body>
                </html>
            `);
            iframeDoc.close();

            setTimeout(async () => {
                if (typeof DialogSystem !== 'undefined') DialogSystem.close();
                
                if (window.OP_Desktop_API) {
                    await window.OP_Desktop_API.triggerCustomPrint();
                } else {
                    printIframe.contentWindow.focus();
                    printIframe.contentWindow.print();
                }
                
                setTimeout(() => { printIframe.remove(); }, 2000);
            }, 500);

        } catch (err) {
            console.error("[Print Engine] Assembly Failed:", err);
            if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Print Error', 'Failed to generate print file.');
            if (stagingArea) stagingArea.remove();
        }
    };

    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
            e.preventDefault(); 
            e.stopImmediatePropagation(); 
            window.printFullDocument();
        }
    }, true);
})();


