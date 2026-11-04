// ==========================================
// OPEN PUBLISHER FILE LOADER (v5.17.0)
// Staged Progress UI, Anti-Blank Delay & Desktop Association Handler
// ==========================================

(function() {
    function ensureLoadingModalStyles() {
        if (document.getElementById('op-pub-loading-styles')) return;
        const style = document.createElement('style');
        style.id = 'op-pub-loading-styles';
        style.textContent = `
            #op-pub-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 99999999;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(15, 23, 42, 0.55);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                opacity: 1;
                transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                user-select: none;
                -webkit-user-select: none;
            }
            #op-pub-loading-overlay.fade-out {
                opacity: 0;
                pointer-events: none;
            }
            .op-pub-loading-card {
                background: #ffffff;
                border-radius: 16px;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(226, 232, 240, 0.8);
                width: 390px;
                max-width: 90vw;
                padding: 30px 24px 24px;
                text-align: center;
                box-sizing: border-box;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                animation: opPubModalPop 0.28s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes opPubModalPop {
                from { transform: scale(0.92); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .op-pub-loading-icon-badge {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: rgba(0, 118, 112, 0.12);
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 14px;
                color: var(--ui-theme-color, #007670);
                font-size: 24px;
            }
            .op-pub-loading-title {
                font-size: 18px;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 4px;
            }
            .op-pub-loading-subtitle {
                font-size: 13px;
                color: #64748b;
                margin-bottom: 20px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                padding: 0 10px;
            }
            .op-pub-loading-status {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 9px;
                margin-bottom: 12px;
                font-size: 14px;
                font-weight: 600;
                color: var(--ui-theme-dark, #005a55);
                min-height: 24px;
            }
            .op-pub-loading-progress-track {
                width: 100%;
                height: 8px;
                background: #e2e8f0;
                border-radius: 4px;
                overflow: hidden;
                position: relative;
                margin-bottom: 10px;
            }
            .op-pub-loading-progress-bar {
                width: 20%;
                height: 100%;
                background: linear-gradient(90deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #005a55));
                border-radius: 4px;
                transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .op-pub-loading-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
                color: #94a3b8;
                font-weight: 500;
            }
            body.dark-mode .op-pub-loading-card,
            html.dark-mode .op-pub-loading-card {
                background: #1e293b !important;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.12) !important;
            }
            body.dark-mode .op-pub-loading-title,
            html.dark-mode .op-pub-loading-title {
                color: #f8fafc !important;
            }
            body.dark-mode .op-pub-loading-subtitle,
            html.dark-mode .op-pub-loading-subtitle {
                color: #94a3b8 !important;
            }
            body.dark-mode .op-pub-loading-status,
            html.dark-mode .op-pub-loading-status {
                color: #38bdf8 !important;
            }
            body.dark-mode .op-pub-loading-progress-track,
            html.dark-mode .op-pub-loading-progress-track {
                background: rgba(255, 255, 255, 0.12) !important;
            }
        `;
        document.head.appendChild(style);
    }

    function applyDocumentToState(data) {
        if (data.isTemplate) {
            const titleEl = document.getElementById('doc-title');
            if (titleEl) titleEl.innerText = "Untitled Publication";
            window._wrapperBoundTitle = null;
            if (typeof state !== 'undefined' && state) state._wrapperBoundTitle = null;
        } else {
            const titleEl = document.getElementById('doc-title');
            const docTitle = (data.title || "Untitled Publication").replace(/ \*$/, '').trim();
            if (titleEl) titleEl.innerText = docTitle;
            window._wrapperBoundTitle = docTitle;
            if (typeof state !== 'undefined' && state) state._wrapperBoundTitle = docTitle;
        }
        
        state.pages = data.pages;
        state.currentPageIndex = 0;
        state.hasMasterPage = data.hasMasterPage || false;
        state.rulerOriginX = data.rulerOriginX || 0;
        state.rulerOriginY = data.rulerOriginY || 0;
        state.dpi = data.dpi || (data.pages && data.pages[0] && data.pages[0].dpi) || 96;
        const docDpi = state.dpi;
        const firstP = data.pages && data.pages[0];
        const isCardFile = data.format === 'BusinessCard' || (firstP && (firstP.format === 'BusinessCard' || (parseFloat(firstP.width) <= 360 && parseFloat(firstP.height) <= 260)));
        const defaultMInches = isCardFile ? 0.125 : 0.5;
        const loadedMargins = data.margins || { top: Math.round(defaultMInches * docDpi), right: Math.round(defaultMInches * docDpi), bottom: Math.round(defaultMInches * docDpi), left: Math.round(defaultMInches * docDpi) };
        const loadedMarginsDpi = data.marginsDpi || (data.dpi ? data.dpi : 96);

        if (data.marginsDpi && data.marginsDpi !== docDpi && data.marginsDpi > 0) {
            const ratio = docDpi / data.marginsDpi;
            state.margins = {
                top: Math.round(loadedMargins.top * ratio),
                right: Math.round(loadedMargins.right * ratio),
                bottom: Math.round(loadedMargins.bottom * ratio),
                left: Math.round(loadedMargins.left * ratio)
            };
            state.marginsDpi = docDpi;
        } else if (!data.marginsDpi && docDpi !== 96 && loadedMargins.top === 48 && loadedMargins.right === 48 && loadedMargins.bottom === 48 && loadedMargins.left === 48) {
            const ratio = docDpi / 96;
            state.margins = {
                top: Math.round(48 * ratio),
                right: Math.round(48 * ratio),
                bottom: Math.round(48 * ratio),
                left: Math.round(48 * ratio)
            };
            state.marginsDpi = docDpi;
        } else {
            state.margins = loadedMargins;
            state.marginsDpi = loadedMarginsDpi;
        }
        state.unit = data.unit || 'cm';
        if (data.rulerUnit && data.rulerUnitExplicit) {
            state.rulerUnit = data.rulerUnit;
            state._userExplicitRulerUnit = true;
        } else {
            state.rulerUnit = 'cm';
            state._userExplicitRulerUnit = false;
        }
        
        if (data.isSpreadMode !== undefined) {
            state.isSpreadMode = !!data.isSpreadMode;
        } else {
            state.isSpreadMode = false;
        }
        
        const btn = document.getElementById('spread-mode-btn');
        if (btn) btn.classList.toggle('active', state.isSpreadMode);

        const paperEl = document.getElementById('paper');
        if (paperEl) {
            if (data.colorModel === 'CMYK') {
                paperEl.classList.add('cmyk-mode');
            } else {
                paperEl.classList.remove('cmyk-mode');
            }
        }
        
        // Normalize orientation on loaded pages
        if (!window._orientedPagesRegistry) window._orientedPagesRegistry = new Set();
        if (state.pages && Array.isArray(state.pages)) {
            state.pages.forEach(p => {
                if (!p.id) p.id = Date.now() + Math.random();
                if (!p.dpi) p.dpi = state.dpi;
                if (!p.format && state.format) p.format = state.format;
                if (!p.orientation && data.orientation) {
                    p.orientation = data.orientation;
                }
                if (p.orientation) {
                    let curW = parseFloat(p.width) || 794;
                    let curH = parseFloat(p.height) || 1123;
                    if (p.orientation === 'landscape' && curW < curH) {
                        p.width = Math.max(curW, curH) + 'px';
                        p.height = Math.min(curW, curH) + 'px';
                    } else if (p.orientation === 'portrait' && curW > curH) {
                        p.width = Math.min(curW, curH) + 'px';
                        p.height = Math.max(curW, curH) + 'px';
                    }
                } else {
                    p.orientation = (parseFloat(p.width) >= parseFloat(p.height || '1123')) ? 'landscape' : 'portrait';
                }
                if (p.elements && Array.isArray(p.elements)) {
                    p.elements.forEach(el => {
                        if (!el.left || isNaN(parseFloat(el.left))) el.left = '20px';
                        if (!el.top || isNaN(parseFloat(el.top))) el.top = '20px';
                        if (parseFloat(el.left) < -200) el.left = '20px';
                        if (parseFloat(el.top) < -200) el.top = '20px';
                    });
                }
                window._orientedPagesRegistry.add(p.id);
            });
        }
        if (window._multiPageActive && typeof exitMultiPageView === 'function') {
            exitMultiPageView();
        }
        state.viewMode = 'single';
        if (typeof window.updateViewModeUI === 'function') window.updateViewModeUI();
        state.history = [];
        state.historyIndex = -1;
        if (data.themeSettings && data.themeSettings.saved) {
            if (state.pages && state.pages[0] && !state.pages[0].themeSettings) {
                state.pages[0].themeSettings = Object.assign({}, data.themeSettings);
            }
        }
        
        // Render the page onto canvas paper
        if (typeof renderPage === 'function' && state.pages[0]) {
            renderPage(state.pages[0]);
        }
        if (typeof window.updateDpiDisplay === 'function') window.updateDpiDisplay(state.dpi);
        if (state.format && typeof window.setPageFormatIcon === 'function') window.setPageFormatIcon(state.format);
        if (typeof window.focusPage === 'function') {
            window.focusPage(0);
        }
        if (typeof window.syncMarginGuideOverlay === 'function') {
            window.syncMarginGuideOverlay();
        }
        if (typeof updateSidebar === 'function') {
            updateSidebar();
        }
    }

    /**
     * Staged publication loading with visual progress dialog and delay buffer.
     * Prevents race conditions during startup in desktop wrappers (NW.js / Electron)
     * and provides engaging visual feedback.
     */
    window.loadPublicationWithProgress = function(data, onComplete) {
        if (!data || !data.pages) return;
        ensureLoadingModalStyles();
        window._documentLoadingActive = true;
        window._hasLoadedInitialDocument = true;

        // Dismiss dashboard and remove splash screen immediately
        if (typeof DashboardSystem !== 'undefined' && DashboardSystem && typeof DashboardSystem.close === 'function') {
            try { DashboardSystem.close(); } catch(e) {}
        }
        const splash = document.getElementById('splash-screen');
        if (splash) splash.remove();

        const docTitle = data.isTemplate ? "Untitled Publication" : (data.title || "Untitled Publication");
        const titleEl = document.getElementById('doc-title');
        if (titleEl) titleEl.innerText = docTitle;

        let overlay = document.getElementById('op-pub-loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'op-pub-loading-overlay';
            document.body.appendChild(overlay);
        }
        overlay.className = '';
        overlay.style.display = 'flex';

        overlay.innerHTML = `
            <div class="op-pub-loading-card">
                <div class="op-pub-loading-icon-badge">
                    <i class="fas fa-book-open"></i>
                </div>
                <div class="op-pub-loading-title" id="op-loading-heading">Reading Document...</div>
                <div class="op-pub-loading-subtitle" id="op-loading-docname">${docTitle}</div>
                
                <div class="op-pub-loading-status">
                    <i class="fas fa-circle-notch fa-spin"></i>
                    <span id="op-loading-status-text">Reading publication..</span>
                </div>
                
                <div class="op-pub-loading-progress-track">
                    <div class="op-pub-loading-progress-bar" id="op-loading-progress-bar" style="width: 20%;"></div>
                </div>
                
                <div class="op-pub-loading-footer">
                    <span id="op-loading-step-label">Analyzing publication structure</span>
                    <span id="op-loading-pct">20%</span>
                </div>
            </div>
        `;

        // Gather document statistics for accurate stage sublabels
        let imgCount = 0;
        let waCount = 0;
        let totalElements = 0;
        if (data.pages && Array.isArray(data.pages)) {
            data.pages.forEach(p => {
                if (p.elements && Array.isArray(p.elements)) {
                    totalElements += p.elements.length;
                    p.elements.forEach(el => {
                        if (el.imgSrc || el.isImage || el.type === 'image') imgCount++;
                        if (el.type === 'wordart' || el.type === 'beta-wordart' || (el.innerHTML && (el.innerHTML.includes('wa-') || el.innerHTML.includes('wordart')))) waCount++;
                    });
                }
            });
        }

        const updateStage = (text, stepLabel, pct) => {
            const statusText = document.getElementById('op-loading-status-text');
            const progressEl = document.getElementById('op-loading-progress-bar');
            const stepLabelEl = document.getElementById('op-loading-step-label');
            const pctEl = document.getElementById('op-loading-pct');
            if (statusText) statusText.textContent = text;
            if (progressEl) progressEl.style.width = pct + '%';
            if (stepLabelEl) stepLabelEl.textContent = stepLabel;
            if (pctEl) pctEl.textContent = pct + '%';
        };

        // Stage 1 (0ms - Immediate): Reading publication..
        updateStage('Reading publication..', 'Analyzing publication structure', 20);

        // Stage 2 (180ms): Extracting images..
        setTimeout(() => {
            const imgMsg = imgCount > 0 ? `Resolving ${imgCount} image assets` : 'Scanning image buffers';
            updateStage('Extracting images..', imgMsg, 40);
        }, 180);

        // Stage 3 (360ms): Decoding wordart..
        setTimeout(() => {
            const waMsg = waCount > 0 ? `Decoding ${waCount} WordArt objects` : 'Initializing typography & vector curves';
            updateStage('Decoding wordart..', waMsg, 60);
        }, 360);

        // Stage 4 (540ms): Importing assets..
        setTimeout(() => {
            const assetMsg = totalElements > 0 ? `Importing ${totalElements} layout elements` : 'Synchronizing layout & margins';
            updateStage('Importing assets..', assetMsg, 80);
        }, 540);

        // Stage 5 (720ms): Crafting the page..
        setTimeout(() => {
            updateStage('Crafting the page..', 'Constructing canvas elements', 95);
            applyDocumentToState(data);
        }, 720);

        // Stage 6 (920ms): Ready!
        setTimeout(() => {
            updateStage('Ready!', 'Publication loaded', 100);
            if (typeof generateAllThumbnails === 'function') generateAllThumbnails();
            if (typeof pushHistory === 'function') pushHistory();
            window._documentLoadingActive = false;
            if (typeof onComplete === 'function') onComplete();
        }, 920);

        // Stage 7 (1080ms): Smooth fade out and dismissal
        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.remove();
                }
            }, 260);
        }, 1080);
    };

    /**
     * Primary document load handler for .opub files.
     * Supports FileReader events, JSON strings, and direct object payloads.
     */
    window.handlePublisherFileLoad = (evt) => {
        try {
            let rawData;
            if (typeof evt === 'string') {
                rawData = JSON.parse(evt);
            } else if (evt && evt.pages && Array.isArray(evt.pages)) {
                rawData = evt;
            } else if (evt && evt.target && typeof evt.target.result === 'string') {
                rawData = JSON.parse(evt.target.result);
            } else {
                rawData = evt;
            }
            
            // Legacy support for older array-based saves
            if (Array.isArray(rawData)) {
                rawData = { title: "Untitled Publication", pages: rawData };
            }

            // Automatically sanitize legacy broken .pub imports & cloned shadow layers
            if (window.OpenPubImporter && typeof window.OpenPubImporter.sanitizeLegacyOpubData === 'function') {
                rawData = window.OpenPubImporter.sanitizeLegacyOpubData(rawData);
            }

            const paperEl = document.getElementById('paper');
            if (!document.body || !paperEl) {
                // Early startup invocation: defer until DOMContentLoaded
                window._pendingStartupPublication = rawData;
                window._hasLoadedInitialDocument = true;
                window._documentLoadingActive = true;
                window.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => {
                        if (window._pendingStartupPublication) {
                            const doc = window._pendingStartupPublication;
                            window._pendingStartupPublication = null;
                            window.handlePublisherFileLoad(doc);
                        }
                    }, 50);
                });
                return;
            }

            if (rawData.encrypted) {
                const promptForPassword = () => {
                    const html = `
                        <div style="padding: 10px; display: flex; align-items: flex-start; gap: 20px;">
                            <i class="fas fa-unlock-keyhole" style="font-size: 48px; color: var(--ui-theme-color); margin-top: 5px;"></i>
                            <div style="flex: 1;">
                                <p style="margin-bottom:15px; font-size:14px; color:#444;">This document is protected. Please enter the password to open it:</p>
                                <input type="password" id="doc-decrypt-input" style="width:100%; padding:8px; border:2px solid var(--ui-theme-color); border-radius:8px; margin-bottom:15px; outline: none; transition: border-color 0.2s;" placeholder="Password">
                            </div>
                        </div>
                    `;
                    if (typeof DialogSystem !== 'undefined') {
                        DialogSystem.show('Protected Document', html, async () => {
                            const pw = document.getElementById('doc-decrypt-input').value;
                            try {
                                DialogSystem.alert('Decrypting...', 'Decrypting document with AES-GCM...');
                                const decryptedData = await window.decryptDocumentData(rawData, pw);
                                DialogSystem.close();
                                state.documentPassword = pw;
                                if (typeof window.updateProtectionIndicator === 'function') {
                                    window.updateProtectionIndicator();
                                }
                                window.loadPublicationWithProgress(decryptedData);
                            } catch(err) {
                                const errorHtml = `
                                    <div style="display: flex; align-items: flex-start; gap: 20px; padding: 10px;">
                                        <i class="fas fa-times" style="font-size: 48px; color: #d9534f; margin-top: 5px;"></i>
                                        <div style="flex: 1; display: flex; align-items: center; min-height: 48px;">
                                            <p style="margin: 0; font-size: 15px; color: #333;">The password was Incorrect.</p>
                                        </div>
                                    </div>
                                `;
                                DialogSystem.show('Decryption Failed', errorHtml, () => {
                                    setTimeout(promptForPassword, 10);
                                });
                                const confirmBtn = document.getElementById('custom-dialog-confirm');
                                if (confirmBtn) confirmBtn.innerText = 'Retry';
                            }
                        });
                    }
                };
                promptForPassword();
            } else {
                state.documentPassword = null;
                if (typeof window.updateProtectionIndicator === 'function') {
                    window.updateProtectionIndicator();
                }
                window.loadPublicationWithProgress(rawData);
            }

        } catch(err) { 
            if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Error', "Error opening file: " + err); 
        }
    };

    /**
     * Automatic NW.js command line argument watcher for file associations.
     */
    window.checkNwStartupArgv = function() {
        if (window._startupFileProcessed) return;
        try {
            const nwObj = (typeof nw !== 'undefined' && nw) || (typeof window !== 'undefined' && window.nw);
            if (!nwObj || !nwObj.App || !Array.isArray(nwObj.App.argv) || nwObj.App.argv.length === 0) return;
            
            const targetPath = nwObj.App.argv.find(arg => typeof arg === 'string' && (arg.toLowerCase().endsWith('.opub') || arg.toLowerCase().endsWith('.json')));
            if (targetPath && typeof require === 'function') {
                const fs = require('fs');
                if (fs && typeof fs.existsSync === 'function' && fs.existsSync(targetPath)) {
                    window._startupFileProcessed = true;
                    window._documentLoadingActive = true;
                    window._hasLoadedInitialDocument = true;
                    const fileContent = fs.readFileSync(targetPath, 'utf8');
                    window.handlePublisherFileLoad(fileContent);
                }
            }
        } catch(err) {
            // Non-Node environment
        }
    };

    // Listen for runtime file open events in NW.js
    try {
        const nwObj = (typeof nw !== 'undefined' && nw) || (typeof window !== 'undefined' && window.nw);
        if (nwObj && nwObj.App && typeof nwObj.App.on === 'function') {
            nwObj.App.on('open', function(cmdline) {
                try {
                    if (typeof cmdline === 'string' && typeof require === 'function') {
                        const match = cmdline.match(/(?:[a-zA-Z]:\\[^\t\r\n"]+\.opub|"[^"]+\.opub")/i);
                        const rawPath = match ? match[0].replace(/^"|"$/g, '') : null;
                        if (rawPath) {
                            const fs = require('fs');
                            if (fs && fs.existsSync(rawPath)) {
                                const content = fs.readFileSync(rawPath, 'utf8');
                                window.handlePublisherFileLoad(content);
                            }
                        }
                    }
                } catch(e) {}
            });
        }
    } catch(e) {}

    // Global aliases for desktop wrappers
    window.loadPublisherFile = window.handlePublisherFileLoad;
    window.loadPublication = window.handlePublisherFileLoad;
    window.loadProject = window.handlePublisherFileLoad;

})();
