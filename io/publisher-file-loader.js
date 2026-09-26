window.handlePublisherFileLoad = (evt) => {
    try {
        let rawData = JSON.parse(evt.target.result);
        
        // Legacy support for older array-based saves
        if (Array.isArray(rawData)) {
            rawData = { title: "Untitled Publication", pages: rawData };
        }
        
        const loadDocumentData = (data) => {
            // ✨ TEMPLATE CHECK: If this file was saved as a template, open it as a fresh Untitled document
            if (data.isTemplate) {
                document.getElementById('doc-title').innerText = "Untitled Publication";
            } else {
                document.getElementById('doc-title').innerText = data.title;
            }
            
            state.pages = data.pages;
            state.hasMasterPage = data.hasMasterPage || false;
            state.rulerOriginX = data.rulerOriginX || 0;
            state.rulerOriginY = data.rulerOriginY || 0;
            state.dpi = data.dpi || (data.pages && data.pages[0] && data.pages[0].dpi) || 96;
            const docDpi = state.dpi;
            state.format = data.format || (data.pages && data.pages[0] && data.pages[0].format) || null;
            const loadedMargins = data.margins || { top: Math.round(0.5 * docDpi), right: Math.round(0.5 * docDpi), bottom: Math.round(0.5 * docDpi), left: Math.round(0.5 * docDpi) };
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
            
            // Read Spreads state (or infer for legacy saves)
            if (data.isSpreadMode !== undefined) {
                state.isSpreadMode = data.isSpreadMode;
            } else if (data.pages && data.pages.length > 0) {
                const w = parseInt(data.pages[0].width) || 0;
                state.isSpreadMode = w >= 1500; // Infer spreads if width is double standard
            } else {
                state.isSpreadMode = false;
            }
            
            const btn = document.getElementById('spread-mode-btn');
            if (btn) btn.classList.toggle('active', state.isSpreadMode);

            if (data.colorModel === 'CMYK') {
                document.getElementById('paper').classList.add('cmyk-mode');
            } else {
                document.getElementById('paper').classList.remove('cmyk-mode');
            }
            
            // Normalize and enforce orientation on loaded pages
            if (!window._orientedPagesRegistry) window._orientedPagesRegistry = new Set();
            if (state.pages && Array.isArray(state.pages)) {
                state.pages.forEach(p => {
                    if (!p.id) p.id = Date.now() + Math.random();
                    if (!p.dpi) p.dpi = state.dpi;
                    if (!p.format && state.format) p.format = state.format;
                    // If root document has orientation and page does not, inherit root orientation
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
            state.currentPageIndex = 0;
            renderPage(state.pages[0]);
            if (typeof window.updateDpiDisplay === 'function') window.updateDpiDisplay(state.dpi);
            if (state.format && typeof window.setPageFormatIcon === 'function') window.setPageFormatIcon(state.format);
            // Sync the margin guide overlay after the page renders so it is correctly
            // positioned over the paper at the current zoom level.
            setTimeout(() => {
                if (typeof window.syncMarginGuideOverlay === 'function') {
                    window.syncMarginGuideOverlay();
                }
            }, 100);

            setTimeout(() => {
                if (typeof generateAllThumbnails === 'function') generateAllThumbnails();
                if (typeof pushHistory === 'function') pushHistory(); 
            }, 500);
            
            if (typeof DashboardSystem !== 'undefined' && DashboardSystem) {
                DashboardSystem.close();
            }
        };

        if (rawData.encrypted) {
            const promptForPassword = () => {
                const html = `
                    <div style="padding: 10px; display: flex; align-items: flex-start; gap: 20px;">
                        <i class="fas fa-unlock-keyhole" style="font-size: 48px; color: var(--ui-theme-color); margin-top: 5px;"></i>
                        <div style="flex: 1;">
                            <p style="margin-bottom:15px; font-size:14px; color:#444;">This document is protected. Please enter the password to open it:</p>
                            <input type="password" id="doc-decrypt-input" style="width:100%; padding:8px; border:2px solid var(--ui-theme-color); border-radius:8px; margin-bottom:15px; outline: none; transition: border-color 0.2s;" placeholder="Password">
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
                            window.updateProtectionIndicator();
                            loadDocumentData(decryptedData);
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
            window.updateProtectionIndicator();
            loadDocumentData(rawData);
        }

    } catch(err) { 
        if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Error', "Error opening file: " + err); 
    }
};
