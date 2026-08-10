(function installNativePrintHooks() {

    function buildPrintDOM() {
        let pagesToPrint = state && state.pages ? state.pages : [];
        if (window._isBookletPrinting && window._imposedSpreads) {
            pagesToPrint = window._imposedSpreads;
        }

        if (pagesToPrint && pagesToPrint.length > 0) {
            if (!window._isBookletPrinting && typeof serializeCurrentPage === 'function') {
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
                    elDiv.style.position = 'absolute';
                    elDiv.style.left = el.left;
                    elDiv.style.top = el.top;
                    elDiv.style.width = el.width;
                    elDiv.style.height = el.height;
                    elDiv.style.zIndex = el.zIndex;
                    elDiv.style.transform = el.transform || 'none';

                    if (el.imgSrc) {
                        let img = document.createElement('img');
                        img.src = el.imgSrc;
                        if (el.imgStyle) Object.assign(img.style, el.imgStyle);
                        elDiv.appendChild(img);
                    } else {
                        const sX = el.scaleX || "1";
                        const sY = el.scaleY || "1";
                        let cleanHTML = el.innerHTML.replace(/contenteditable="true"/g, 'contenteditable="false"');
                        
                        let css = el.contentCssText || `transform: scale(${sX}, ${sY}); width:100%; height:100%; transform-origin: top left; outline: none; border: none;`;
                        
                        let pVal = null;
                        css = css.replace(/perspective\s*\(\s*([^)]+)\s*\)/i, (match, p1) => { pVal = p1; return ''; });
                        if (pVal) { elDiv.style.perspective = pVal; elDiv.style.perspectiveOrigin = 'center'; }
                        
                        css = css.replace(/transform-style:\s*preserve-3d;?/gi, '').replace(/backface-visibility:\s*hidden;?/gi, '');
                        if (!css.includes('width:')) css += '; width:100%; height:100%;';
                        
                        elDiv.innerHTML = `<div class="element-content" style="${css}">${cleanHTML}</div>`;
                    }
                    scaler.appendChild(elDiv);
                });
                pageWrapper.appendChild(scaler);
                printSpooler.appendChild(pageWrapper);
            });
        }
    }

    window.addEventListener('beforeprint', buildPrintDOM);
    window.addEventListener('afterprint', () => {
        const spooler = document.getElementById('op-print-spooler');
        if (spooler) {
            spooler.innerHTML = '';
            spooler.className = '';
        }
    });

    // Safari fires afterprint early and beforeprint multiple times. 
    // Maintain the booklet state until the user physically interacts with the app again.
    const clearBookletState = () => {
        window._isBookletPrinting = false;
        window._imposedSpreads = null;
    };
    window.addEventListener('mousedown', clearBookletState);
    window.addEventListener('keydown', clearBookletState);
    window.addEventListener('touchstart', clearBookletState);

    window.printFullDocument = (isBooklet = false) => {
        if (!isBooklet) clearBookletState();
        window.print();
    };
})();


(function installPhysicalPrintEngine() {
    console.log("[Print Engine] Initializing Sandbox Iframe Print sequence v4.6.2...");

    // 1. Purge all legacy print styles and spoolers from the DOM
    document.querySelectorAll('.op-dynamic-print-style, #op-master-print-css, #op-legacy-viewport-fix, #op-legacy-ratio-fix, #op-definitive-scale-fix').forEach(e => e.remove());
    const oldSpooler = document.getElementById('op-print-spooler');
    if (oldSpooler) oldSpooler.remove();
    document.querySelectorAll('.op-print-frame').forEach(f => f.remove());

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const loadImageStrict = (imgEl, src) => new Promise((resolve) => {
        imgEl.onload = resolve;
        imgEl.onerror = resolve; 
        imgEl.src = src;
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
        let shapeClip = (el.imgStyle && el.imgStyle.clipPath) ? el.imgStyle.clipPath : '';
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
                }
            }
        }
        return (shapeClip && shapeClip !== 'none') ? shapeClip : '';
    };

    const applyClipPathRegion = (ctx, clipPath, w, h) => {
        const normalized = (clipPath || '').trim();
        if (!normalized || normalized === 'none') return;
        if (/^circle\(/i.test(normalized)) {
            ctx.beginPath();
            ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
            ctx.clip();
            return;
        }
        const polyMatch = normalized.match(/^polygon\(\s*([^)]+)\)/i);
        if (polyMatch) {
            const coords = polyMatch[1].split(/\s*,\s*/);
            ctx.beginPath();
            coords.forEach((pair, i) => {
                const nums = pair.trim().split(/\s+/);
                const x = (parseFloat(nums[0]) / 100) * w;
                const y = (parseFloat(nums[1]) / 100) * h;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.clip();
        }
    };

    const parseImageLayoutValue = (value, base) => {
        const raw = (value ?? '').toString().trim();
        if (!raw) return 0;
        if (raw.endsWith('%')) return (parseFloat(raw) / 100) * base;
        return parseFloat(raw) || 0;
    };

    const isDefaultFillImageLayout = (imgStyle = {}) => {
        const w = (imgStyle.width || '100%').toString().trim();
        const h = (imgStyle.height || '100%').toString().trim();
        const l = (imgStyle.left ?? '0').toString().trim();
        const t = (imgStyle.top ?? '0').toString().trim();
        const leftZero = l === '0' || l === '0px' || l === '0%';
        const topZero = t === '0' || t === '0px' || t === '0%';
        return w === '100%' && h === '100%' && leftZero && topZero;
    };

    window.bakeImageForPrint = (src, displayW, displayH, { filter = '', opacity = '1', clipPath = '', imgStyle = {} } = {}) => new Promise((resolve, reject) => {
        const attemptLoad = (useCORS) => {
            const tempImg = new Image();
            let loadSrc = src;
            if (!loadSrc.startsWith('data:')) {
                const isSameOrigin = loadSrc.startsWith('/') || loadSrc.startsWith('./') || loadSrc.startsWith(window.location.origin);
                if (useCORS && !isSameOrigin) tempImg.crossOrigin = 'Anonymous';
                if (!isSameOrigin) {
                    loadSrc += (loadSrc.includes('?') ? '&' : '?') + 'corsbuster=' + Date.now();
                }
            }
            tempImg.onload = () => {
                const scale = 2;
                
                let finalFilter = filter;
                let padX = 0, padY = 0, padW = 0, padH = 0;
                
                if (finalFilter && finalFilter.includes('blur')) {
                    finalFilter = finalFilter.replace(/blur\(([\d.]+)px\)/g, (match, p1) => `blur(${parseFloat(p1) * scale}px)`);
                }
                
                if (finalFilter && finalFilter.includes('drop-shadow')) {
                    const match = finalFilter.match(/([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px/);
                    if (match) {
                        const sx = parseFloat(match[1]) * scale;
                        const sy = parseFloat(match[2]) * scale;
                        const blur = parseFloat(match[3]) * scale;
                        const spread = blur * 2;
                        padX = Math.max(0, sx < 0 ? Math.abs(sx) + spread : spread);
                        padY = Math.max(0, sy < 0 ? Math.abs(sy) + spread : spread);
                        padW = Math.abs(sx) + spread * 2;
                        padH = Math.abs(sy) + spread * 2;
                        
                        finalFilter = finalFilter.replace(/([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px/g, 
                            (m, p1, p2, p3) => `${parseFloat(p1)*scale}px ${parseFloat(p2)*scale}px ${parseFloat(p3)*scale}px`);
                    }
                }

                const c = document.createElement('canvas');
                c.width = (displayW * scale) + padW;
                c.height = (displayH * scale) + padH;
                const ctx = c.getContext('2d');

                const rasterCanvas = document.createElement('canvas');
                rasterCanvas.width = displayW * scale;
                rasterCanvas.height = displayH * scale;
                const rasterCtx = rasterCanvas.getContext('2d');
                
                if (isDefaultFillImageLayout(imgStyle)) {
                    rasterCtx.drawImage(tempImg, 0, 0, rasterCanvas.width, rasterCanvas.height);
                } else {
                    const imgW = parseImageLayoutValue(imgStyle.width, displayW) * scale;
                    const imgH = parseImageLayoutValue(imgStyle.height, displayH) * scale;
                    const imgL = parseImageLayoutValue(imgStyle.left, displayW) * scale;
                    const imgT = parseImageLayoutValue(imgStyle.top, displayH) * scale;
                    rasterCtx.drawImage(tempImg, imgL, imgT, imgW, imgH);
                }

                ctx.save();
                if (clipPath) applyClipPathRegion(ctx, clipPath, c.width, c.height);
                if (finalFilter && finalFilter !== 'none') ctx.filter = finalFilter;
                ctx.globalAlpha = parseFloat(opacity);
                
                ctx.drawImage(rasterCanvas, padX, padY, displayW * scale, displayH * scale);
                ctx.restore();
                
                try {
                    resolve({ src: c.toDataURL('image/png'), padX, padY, padW, padH });
                } catch (e) {
                    reject(e);
                }
            };
            tempImg.onerror = (e) => {
                if (useCORS) attemptLoad(false);
                else reject(e);
            };
            tempImg.src = loadSrc;
        };
        attemptLoad(!src.startsWith('data:'));
    });

    window.printFullDocument = async function(isBooklet = false) {
        if (!isBooklet) {
            window._isBookletPrinting = false;
            window._imposedSpreads = null;
        }
        
        let pagesToPrint = typeof state !== 'undefined' && state.pages ? state.pages : [];
        if (window._isBookletPrinting && window._imposedSpreads) {
            pagesToPrint = window._imposedSpreads;
        }

        // Pre-Flight: Force browser to commit layout repaints
        document.querySelectorAll('.pub-element').forEach(el => el.getBoundingClientRect());
        await sleep(100);

        if (pagesToPrint && pagesToPrint.length > 0) {
            if (state && state.cropMode && typeof window.toggleCrop === 'function') window.toggleCrop();
            if (!window._isBookletPrinting && typeof serializeCurrentPage === 'function') pagesToPrint[state.currentPageIndex] = serializeCurrentPage();
            pagesToPrint.forEach((page) => {
                page.elements.forEach((el) => {
                    if (el.innerHTML) el.innerHTML = fixWordArtSpacesInHtml(el.innerHTML);
                });
            });
        }

        if (typeof DialogSystem !== 'undefined') {
            DialogSystem.show('Preparing Print Job...', `
                <div style="text-align:center; padding: 20px 10px; font-family: 'Comfortaa', 'Afacad Flux', sans-serif;">
                    <div style="margin-bottom: 20px; display: flex; justify-content: center;">
                        <img src="https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/ZtZYk3e.png" class="print-anim-icon" style="width: 80px; height: auto;" alt="Print Icon" />
                    </div>
                    <p id="pdf-print-status" style="margin-bottom:20px; font-size:18px; color: var(--ui-text, #000); font-weight: 400;">
                        Assembling Publication...
                    </p>
                    <div style="width: 100%; height: 20px; border: 2px solid var(--ui-theme-dark); border-radius: 20px; padding: 2px; background: transparent; overflow: hidden; box-sizing: border-box;">
                        <div id="pdf-print-progress" style="width: 0%; height: 100%; background: var(--ui-theme-color); border-radius: 20px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                <style>
                    #custom-dialog-header { background-color: var(--ui-theme-dark) !important; color: white !important; font-size: 20px !important; font-family: 'Comfortaa', 'Afacad Flux', sans-serif !important; }
                    #custom-dialog-close { color: white !important; opacity: 0.8; }
                    #custom-dialog-confirm { display: none !important; }
                    .print-anim-icon { mix-blend-mode: multiply; }
                    body.dark-mode .print-anim-icon { filter: invert(1) grayscale(1) contrast(100); mix-blend-mode: screen; }
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
            let themeHtml = ''; let borderHtml = '';
            
            if (livePaper) {
                const isSaved = livePaper.getAttribute('data-theme-saved');
                if (isSaved === 'true') {
                    const tType = livePaper.getAttribute('data-theme-type') || 'color';
                    const c1 = livePaper.getAttribute('data-theme-c1') || '#ffffff';
                    const c2 = livePaper.getAttribute('data-theme-c2') || '';
                    const url = livePaper.getAttribute('data-theme-url') || '';
                    
                    let bgCss = `background: ${c1};`;
                    if (tType === 'gradient' && c2) bgCss = `background: linear-gradient(135deg, ${c1}, ${c2});`;
                    
                    let htmlStr = `<div class="op-theme-container" style="position:absolute; top:0; left:0; bottom:0; right:0; width:100%; height:100%; pointer-events:none; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; z-index:-10;">`;
                    htmlStr += `<div class="op-theme-bg" style="position:absolute; top:0; left:0; bottom:0; right:0; width:100%; height:100%; ${bgCss}"></div>`;
                    
                    if (tType === 'texture' && url) {
                        const safeUrl = url.replace(/https:\/\/(www\.transparenttextures\.com[^'"]+)/g, 'https://wsrv.nl/?url=$1');
                        htmlStr += `<div class="op-theme-tex" style="position:absolute; top:0; left:0; bottom:0; right:0; width:100%; height:100%; background-repeat:repeat; opacity:1; background-image:url('${safeUrl}');"></div>`;
                    }
                    htmlStr += `</div>`;
                    themeHtml = htmlStr;
                }
                const liveBorder = livePaper.querySelector('[data-is-border="true"], #native-blueprint-border');
                if (liveBorder) borderHtml = liveBorder.outerHTML;
            }

            // Determine the Master Layout based ENTIRELY on Page 1
            const masterPW = parseFloat(pagesToPrint[0].width) || 794;
            const masterPH = parseFloat(pagesToPrint[0].height) || 1123;
            const masterIsPortrait = masterPW <= masterPH;
            
            // Convert exact pixels to physical inches (96 DPI standard) for the iframe
            const widthInches = (masterPW / 96).toFixed(3);
            const heightInches = (masterPH / 96).toFixed(3);

            let iframeHTMLString = '';

            for (let i = 0; i < totalPages; i++) {
                const page = pagesToPrint[i];
                if (statusEl) statusEl.innerText = `Rendering page ${i + 1} of ${totalPages}...`;
                if (progressEl) progressEl.style.width = `${((i) / totalPages) * 100}%`;

                const pW = parseFloat(page.width) || 794;
                const pH = parseFloat(page.height) || 1123;

                let pageWrapper = document.createElement('div');
                pageWrapper.style.width = pW + 'px';
                pageWrapper.style.height = pH + 'px';
                pageWrapper.style.position = 'relative';
                pageWrapper.style.overflow = 'hidden';
                pageWrapper.style.background = page.background || '#ffffff';

                if (themeHtml && !page.ignoreBackground) pageWrapper.insertAdjacentHTML('afterbegin', themeHtml);

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
                
                // Final safety check: if this page has ignoreBackground=true, forcefully strip any residual theme wrappers
                if (page.ignoreBackground) {
                    elementsToRender = elementsToRender.filter(el => !(el.innerHTML && (el.innerHTML.includes('op-theme-container') || el.innerHTML.includes('op-theme-bg'))));
                }

                for (let el of elementsToRender) {
                    let elDiv = document.createElement('div');
                    
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
                        cropDiv.style.overflow = 'hidden';
                        cropDiv.style.contain = 'paint';

                        const shapeClipPath = getImageShapeClipPath(el, page, livePaper);
                        if (shapeClipPath) {
                            cropDiv.style.clipPath = shapeClipPath;
                            cropDiv.style.webkitClipPath = shapeClipPath;
                        } else {
                            cropDiv.style.clipPath = 'inset(0)';
                        }

                        const sX = el.scaleX || "1";
                        const sY = el.scaleY || "1";
                        cropDiv.style.transform = `scale(${sX}, ${sY})`;
                        cropDiv.style.transformOrigin = 'center center';

                        let img = document.createElement('img');
                        img.src = finalSrc;
                        const savedImgStyle = { ...(el.imgStyle || {}) };
                        if (el.imgStyle) Object.assign(img.style, el.imgStyle);
                        img.style.clipPath = 'none';
                        img.style.webkitClipPath = 'none';

                        if (isDefaultFillImageLayout(savedImgStyle)) {
                            img.style.width = '100%';
                            img.style.height = '100%';
                            img.style.objectFit = 'fill';
                        } else {
                            img.style.position = savedImgStyle.position || 'absolute';
                            img.style.maxWidth = savedImgStyle.maxWidth || 'none';
                            img.style.maxHeight = savedImgStyle.maxHeight || 'none';
                            if (savedImgStyle.objectFit) img.style.objectFit = savedImgStyle.objectFit;
                        }

                        let currentFilter = ''; let currentOpacity = '1';
                        if (el.imgStyle) {
                            if (el.imgStyle.opacity !== undefined) currentOpacity = el.imgStyle.opacity;
                            if (el.imgStyle.filter) currentFilter = el.imgStyle.filter;
                        }

                        if (page === state.pages[state.currentPageIndex] && livePaper) {
                            const l1 = parseFloat(el.left) || 0;
                            const t1 = parseFloat(el.top) || 0;
                            const liveEls = Array.from(livePaper.querySelectorAll('.pub-element'));
                            const activeEl = liveEls.find(e => Math.abs((parseFloat(e.style.left)||0) - l1) < 2 && Math.abs((parseFloat(e.style.top)||0) - t1) < 2);
                            
                            if (activeEl) {
                                const activeImg = activeEl.querySelector('img');
                                if (activeImg) {
                                    const comp = window.getComputedStyle(activeImg);
                                    currentFilter = (comp.filter && comp.filter !== 'none') ? comp.filter : (activeImg.style.filter || currentFilter);
                                    currentOpacity = (comp.opacity && comp.opacity !== '1') ? comp.opacity : (activeImg.style.opacity || currentOpacity);
                                }
                                
                                const activeContent = activeEl.querySelector('.element-content');
                                if (activeContent) {
                                    const cComp = window.getComputedStyle(activeContent);
                                    if (cComp.filter && cComp.filter !== 'none') {
                                        currentFilter = (currentFilter + ' ' + cComp.filter).trim();
                                    } else if (activeContent.style.filter && activeContent.style.filter !== 'none') {
                                        currentFilter = (currentFilter + ' ' + activeContent.style.filter).trim();
                                    }
                                }
                            }
                            
                            // Prevent html2canvas from double-processing this element!
                            hueFilter = '';
                            if (elDiv.hasAttribute('data-target-filter')) {
                                elDiv.removeAttribute('data-target-filter');
                            }
                        }

                        const displayW = parseFloat(el.width) || parseFloat(el.imgStyle?.width) || 400;
                        const displayH = parseFloat(el.height) || parseFloat(el.imgStyle?.height) || 400;
                        const needsBake = shapeClipPath || (currentFilter && currentFilter !== 'none') || currentOpacity !== '1';

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
                                    img.style.width = `calc(100% + ${baked.padW/2}px)`;
                                    img.style.height = `calc(100% + ${baked.padH/2}px)`;
                                    img.style.marginLeft = `-${baked.padX/2}px`;
                                    img.style.marginTop = `-${baked.padY/2}px`;
                                    img.style.maxWidth = 'none';
                                    img.style.maxHeight = 'none';
                                    cropDiv.style.overflow = 'visible'; // ALLOW SHADOW TO BE SEEN
                                    cropDiv.style.contain = 'none'; // ALLOW SHADOW TO BE SEEN
                                }
                                
                                img.style.filter = 'none';
                                img.style.WebkitFilter = 'none';
                                img.style.opacity = '1';
                                cropDiv.style.clipPath = 'none';
                                cropDiv.style.webkitClipPath = 'none';
                            } catch(e) {
                                await loadImageStrict(img, finalSrc);
                                let safeFilter = currentFilter || '';
                                if (safeFilter.includes('drop-shadow')) {
                                    safeFilter = safeFilter.replace(/drop-shadow\((?:[^)(]+|\([^)(]*\))*\)/g, '').trim();
                                }
                                img.style.filter = safeFilter || 'none';
                                img.style.opacity = currentOpacity;
                                if (shapeClipPath) {
                                    cropDiv.style.clipPath = shapeClipPath;
                                    cropDiv.style.webkitClipPath = shapeClipPath;
                                }
                            }
                        } else {
                            await loadImageStrict(img, finalSrc);
                            img.style.opacity = currentOpacity;
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
                        
                        let css = el.contentCssText || `transform: scale(${sX}, ${sY}); width:100%; height:100%; transform-origin: top left; outline: none; border: none;`;
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

                if (borderHtml) pageWrapper.insertAdjacentHTML('beforeend', borderHtml);
                
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
                            const img = new Image(); img.crossOrigin = "Anonymous";
                            img.onload = resolve; img.onerror = resolve; img.src = url;
                        });
                    }));
                }

                if (statusEl) statusEl.innerText = `Rendering page ${i + 1} of ${totalPages}...`;
                await sleep(100); 
                
                // Scale 3 ensures maximum pixel density before the physical print mappings apply
                let h2cBg = page.background || '#ffffff';
                if (h2cBg.includes('gradient')) h2cBg = null;

                const canvas = await html2canvas(pageWrapper, { 
                    scale: 3, useCORS: true, logging: false, backgroundColor: h2cBg
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const isPortrait = pW <= pH;

                // ✨ AUTO-ROTATION NORMALIZATION ✨
                // If this page's orientation doesn't match Page 1's orientation, we rotate it dynamically.
                // This ensures the legacy Chromium printer receives a document where ALL pages are the exact same shape.
                let imgStyle = '';
                if (isPortrait !== masterIsPortrait) {
                    // Rotate the image 90 degrees and apply the 1.004 scale for micro-bleed
                    imgStyle = `position: absolute; top: 50%; left: 50%; width: ${pW}px !important; height: ${pH}px !important; transform: translate(-50%, -50%) rotate(90deg) scale(1.004); object-fit: fill; display: block; border: none; outline: none; margin: 0; padding: 0; max-width: none !important;`;
                } else {
                    // Normal orientation with -0.2% micro-bleed
                    imgStyle = `position: absolute; top: -0.2%; left: -0.2%; width: 100.4% !important; height: 100.4% !important; object-fit: fill; display: block; border: none; outline: none; margin: 0; padding: 0; max-width: none !important;`;
                }
                
                // Collect the rendered page into the HTML string, locked exactly to the master layout size
                iframeHTMLString += `
                    <div class="page" style="width: ${widthInches}in; height: ${heightInches}in; position: relative; overflow: hidden; page-break-after: always; break-after: page; background: white; margin: 0; padding: 0; box-sizing: border-box;">
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
            
            // Set the iframe's internal viewport to exactly match the Master paper width.
            printIframe.style.cssText = `
                position: fixed; 
                top: 0; 
                left: 0; 
                width: ${masterPW}px; 
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
                        
                        /* Stop the printer from kicking out a blank page at the end */
                        .page:last-child {
                            page-break-after: auto !important;
                            break-after: auto !important;
                        }
                    </style>
                </head>
                <body>
                    ${iframeHTMLString}
                </body>
                </html>
            `);
            iframeDoc.close();

            setTimeout(() => {
                if (typeof DialogSystem !== 'undefined') DialogSystem.close();
                
                printIframe.contentWindow.focus();
                printIframe.contentWindow.print();
                
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


