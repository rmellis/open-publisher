(function installEventShield() {
    
    // 1. Intercept the Mousedown to build the group
    window.addEventListener('mousedown', function(e) {
        const el = e.target.closest('.pub-element');
        
        if ((e.ctrlKey || e.metaKey) && el) {
            // Kill the app's native mousedown logic
            e.preventDefault();
            e.stopImmediatePropagation();

            // Initialize the array
            if (!state.multiSelected) state.multiSelected = [];

            // Migrate the first item into the group safely
            if (state.selectedEl && state.multiSelected.length === 0) {
                state.multiSelected.push(state.selectedEl);
                state.selectedEl = null; // Detach from single-select logic, but keep the visual highlight
            }

            // Toggle the item you just clicked
            if (state.multiSelected.includes(el)) {
                state.multiSelected = state.multiSelected.filter(m => m !== el);
                el.classList.remove('selected');
            } else {
                state.multiSelected.push(el);
                el.classList.add('selected');
            }

            // Resolve the UI
            if (state.multiSelected.length === 0) {
                if (typeof window.deselect === 'function') window.deselect();
            } else if (state.multiSelected.length === 1) {
                if (typeof window.selectElement === 'function') window.selectElement(state.multiSelected[0]);
                state.multiSelected = [];
            } else {
                const status = document.getElementById('status-msg');
                if (status) status.innerText = state.multiSelected.length + " Elements Selected";
                const ft = document.getElementById('float-toolbar');
                if (ft) ft.style.display = 'none';
            }
        }
    }, true); // 'true' means Capture Phase (we get to it before the app does)

    // 2. THE KILL SWITCH: Destroy rogue clicks!
    // This stops the app from instantly firing its single-select logic a millisecond later.
    window.addEventListener('click', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.target.closest('.pub-element')) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    }, true);

    // 3. Destroy rogue mouseups!
    window.addEventListener('mouseup', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.target.closest('.pub-element')) {
            e.stopImmediatePropagation();
        }
    }, true);

})();


(function installShortcutOverrides() {
    document.addEventListener('keydown', function(e) {
        // SAVE: Ctrl+S / Cmd+S
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && !e.shiftKey) {
            e.preventDefault(); 
            if (typeof window.saveDocument === 'function') {
                window.saveDocument();
            } else {
                console.error("Open Publisher: saveDocument() is not accessible.");
            }
        }
        
        // OPEN: Ctrl+O / Cmd+O
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o' && !e.shiftKey) {
            e.preventDefault(); 
            if (typeof window.openDocument === 'function') {
                window.openDocument();
            } else {
                console.error("Open Publisher: openDocument() is not accessible.");
            }
        }
    }, true); // Use capture phase to intercept it early

    console.log("✅ Shortcut overrides (Ctrl+S, Ctrl+O) installed successfully.");
})();


(function installZIndexOverlayPatch() {
    window._selectionObserver = null;
    
    window.updateSelectionObserver = function() {
        if (window._selectionObserver) window._selectionObserver.disconnect();
        
        let els = [];
        if (state.selectedEl) els.push(state.selectedEl);
        if (state.multiSelected && state.multiSelected.length > 0) els = state.multiSelected;

        if (els.length > 0) {
            window._selectionObserver = new MutationObserver(() => window.renderSelectionOverlays());
            els.forEach(el => {
                window._selectionObserver.observe(el, { attributes: true, attributeFilter: ['style', 'class', 'data-scaleX', 'data-scaleY'] });
            });
            window.renderSelectionOverlays();
        } else {
            const container = document.getElementById('selection-overlay-container');
            if (container) container.innerHTML = '';
        }
    };

    window.renderSelectionOverlays = function() {
        const paper = document.getElementById('paper');
        if(!paper) return;
        let container = document.getElementById('selection-overlay-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'selection-overlay-container';
            container.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999999;';
            paper.appendChild(container);
        }
        container.innerHTML = '';

        let els = [];
        if (state.multiSelected && state.multiSelected.length > 0) {
            els = state.multiSelected;
        } else if (state.selectedEl) {
            els.push(state.selectedEl);
        }

        els.forEach(el => {
            const overlay = document.createElement('div');
            overlay.className = 'selected-overlay'; 
            overlay.style.cssText = `
                position: absolute;
                left: ${el.style.left}; top: ${el.style.top};
                width: ${el.style.width}; height: ${el.style.height};
                transform: ${el.style.transform};
                pointer-events: none;
                z-index: 999999;
            `;
            
            const box = document.createElement('div');
            box.style.cssText = 'position: absolute; inset: -1px; border: 1px dashed var(--selection); pointer-events: none;';
            overlay.appendChild(box);

            if (els.length === 1 && !el.classList.contains('editing-shape') && !el.classList.contains('cropping')) {
                const dirs = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
                dirs.forEach(dir => {
                    const h = document.createElement('div');
                    h.className = `resize-handle rh-${dir}`;
                    h.dataset.dir = dir;
                    h.style.pointerEvents = 'auto'; 
                    h.style.display = 'block';
                    overlay.appendChild(h);
                });
                const rStick = document.createElement('div');
                rStick.className = 'rotate-stick';
                rStick.style.display = 'block';
                
                const rHandle = document.createElement('div');
                rHandle.className = 'rotate-handle';
                rHandle.style.pointerEvents = 'auto'; 
                rHandle.style.display = 'block';
                
                overlay.appendChild(rStick);
                overlay.appendChild(rHandle);
            }

            container.appendChild(overlay);
        });
    };

    // Polling fallback to catch selection changes across the app
    setTimeout(() => {
        let lastSelected = null;
        let lastMultiCount = 0;
        setInterval(() => {
            const currentMultiCount = state.multiSelected ? state.multiSelected.length : 0;
            if (state.selectedEl !== lastSelected || currentMultiCount !== lastMultiCount) {
                lastSelected = state.selectedEl;
                lastMultiCount = currentMultiCount;
                window.updateSelectionObserver();
            }
        }, 100);
    }, 1500);

})();


(function upgradeSaveSystem() {
    
window.updateProtectionIndicator = function() {
    const indicator = document.getElementById('protected-indicator');
    if (indicator) {
        indicator.style.display = state.documentPassword ? 'flex' : 'none';
    }
};

window.showProtectDocumentModal = function() {
    const isProtected = !!state.documentPassword;
    const html = `
        <div style="padding: 10px; display: flex; align-items: flex-start; gap: 20px;">
            <i class="fas fa-key" style="font-size: 48px; color: var(--ui-theme-color); margin-top: 10px;"></i>
            <div style="flex-grow: 1;">
                <p style="margin-bottom: 15px; font-size: 14px; color: #444;">
                    ${isProtected 
                        ? 'This document is currently <strong>protected</strong>. Enter a new password to change it, or clear the boxes to remove protection.' 
                        : 'Enter a password to encrypt this document. The file will be locked with AES-GCM encryption upon saving.'}
                </p>
                <div style="margin-bottom: 15px;">
                    <label style="display:block; font-size:14px; font-weight:400; color:#333; margin-bottom:5px;">Document Password</label>
                    <input type="password" id="doc-protect-pw" placeholder="Enter password..." value="${isProtected ? state.documentPassword : ''}" style="width: 100%; padding: 8px; border: 2px solid var(--ui-theme-color); border-radius: 8px; outline: none; transition: border-color 0.2s;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display:block; font-size:14px; font-weight:400; color:#333; margin-bottom:5px;">Confirm Password</label>
                    <input type="password" id="doc-protect-pw-confirm" placeholder="Confirm password..." value="${isProtected ? state.documentPassword : ''}" style="width: 100%; padding: 8px; border: 2px solid var(--ui-theme-color); border-radius: 8px; outline: none; transition: border-color 0.2s;">
                    <div id="doc-protect-error" style="display: none; color: #d9534f; font-size: 12px; margin-top: 5px; font-weight: 600;"><i class="fas fa-exclamation-triangle"></i> Passwords do not match!</div>
                </div>
                <p style="font-size: 11px; color: #d9534f; margin-bottom: 0;"><strong>Warning:</strong> If you lose this password, your document cannot be recovered.</p>
            </div>
        </div>
    `;

    if (typeof DialogSystem !== 'undefined') {
        DialogSystem.show('Protect Document', html, () => {
            const pw = document.getElementById('doc-protect-pw').value.trim();
            if (pw === '') {
                state.documentPassword = null;
                window.updateProtectionIndicator();
                DialogSystem.alert('Protection Removed', 'Document protection has been disabled. The file will be saved as plain text on your next save.');
            } else {
                state.documentPassword = pw;
                window.updateProtectionIndicator();
                DialogSystem.alert('Protection Enabled', 'Password has been set! The document will be fully encrypted on your next save.');
            }
        });

        // Intercept confirm click to validate passwords match
        const confirmBtn = document.getElementById('custom-dialog-confirm');
        if (confirmBtn) {
            const originalOnclick = confirmBtn.onclick;
            confirmBtn.onclick = (e) => {
                const pw = document.getElementById('doc-protect-pw').value.trim();
                const cpw = document.getElementById('doc-protect-pw-confirm').value.trim();
                if (pw !== cpw) {
                    document.getElementById('doc-protect-error').style.display = 'block';
                    document.getElementById('doc-protect-pw-confirm').style.borderColor = '#d9534f';
                    return; // Stop execution, dialog stays open
                }
                document.getElementById('doc-protect-error').style.display = 'none';
                if (originalOnclick) originalOnclick(e);
            };
            
            // Hide error when typing
            document.getElementById('doc-protect-pw-confirm').oninput = function() {
                this.style.borderColor = 'var(--ui-theme-color)';
                document.getElementById('doc-protect-error').style.display = 'none';
            };
            document.getElementById('doc-protect-pw').oninput = function() {
                document.getElementById('doc-protect-pw-confirm').style.borderColor = 'var(--ui-theme-color)';
                document.getElementById('doc-protect-error').style.display = 'none';
            };
        }

        setTimeout(() => {
            const input = document.getElementById('doc-protect-pw');
            if (input) input.focus();
        }, 100);
    }
};

// --- CRYPTO HELPERS ---
async function deriveKeyForDocument(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

async function bufferToBase64Async(buffer) {
    return new Promise((resolve, reject) => {
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            resolve(dataUrl.substring(dataUrl.indexOf(',') + 1));
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function base64ToBufferAsync(base64) {
    const res = await fetch(`data:application/octet-stream;base64,${base64}`);
    return await res.arrayBuffer();
}

window.encryptDocumentData = async function(docData, password) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKeyForDocument(password, salt);
    
    const enc = new TextEncoder();
    const encodedData = enc.encode(JSON.stringify(docData));
    
    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encodedData
    );
    
    return {
        encrypted: true,
        salt: await bufferToBase64Async(salt),
        iv: await bufferToBase64Async(iv),
        data: await bufferToBase64Async(encryptedContent)
    };
};

window.decryptDocumentData = async function(encryptedObj, password) {
    const salt = await base64ToBufferAsync(encryptedObj.salt);
    const iv = await base64ToBufferAsync(encryptedObj.iv);
    const encryptedContent = await base64ToBufferAsync(encryptedObj.data);
    
    const key = await deriveKeyForDocument(password, salt);
    
    const decryptedContent = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        key,
        encryptedContent
    );
    
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decryptedContent));
};

    window.saveDocument = async function(isTemplate = false) {
        
        // 1. Serialize the current page before saving
        state.pages[state.currentPageIndex] = serializeCurrentPage();
        
        // Get the current title from the UI
        const currentTitle = document.getElementById('doc-title').innerText || 'Publication1';
        
        const docData = {
            title: currentTitle,
            pages: state.pages,
            isTemplate: isTemplate,
            hasMasterPage: state.hasMasterPage || false,
            isSpreadMode: state.isSpreadMode || false,
            rulerOriginX: state.rulerOriginX || 0,
            rulerOriginY: state.rulerOriginY || 0,
            margins: state.margins || {top: 48, right: 48, bottom: 48, left: 48},
            documentProperties: state.documentProperties || { author: '', company: '', subject: '', keywords: '' }
        };
        let savePayload = docData;
        if (state.documentPassword) {
            try {
                if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Encrypting...', 'Encrypting document with AES-GCM 256...');
                savePayload = await window.encryptDocumentData(docData, state.documentPassword);
                if (typeof DialogSystem !== 'undefined') DialogSystem.close();
            } catch (err) {
                if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Encryption Error', 'Failed to encrypt document: ' + err.message);
                return;
            }
        }
        
        const blob = new Blob([JSON.stringify(savePayload)], {type: 'application/json'});

        // 2. Try to use the modern File System API (Chrome/Edge/Opera)
        if (window.showSaveFilePicker) {
            try {
                // Pop the OS Save Dialog and wait for the user's decision
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: currentTitle + '.opub',
                    types: [{
                        description: 'Open Publisher Document',
                        accept: { 'application/json': ['.opub'] },
                    }],
                });

                // Write the file to their hard drive
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();

                // ✨ THE FIX: Update the UI with the exact name they typed!
                // We strip the ".opub" extension off so it looks clean in the toolbar
                const newName = fileHandle.name.replace(/\.opub$/i, '');
                
                // If they just saved a template, instantly rename their current working session 
                // so they don't accidentally overwrite the template on their next Ctrl+S
                if (isTemplate) {
                    document.getElementById('doc-title').innerText = "Untitled " + newName;
                } else {
                    document.getElementById('doc-title').innerText = newName;
                }
                
                // Optional: Flash a quick success message
                if (typeof DialogSystem !== 'undefined') {
                    DialogSystem.alert('Saved', `Document successfully saved as "${fileHandle.name}"`);
                }

            } catch (err) {
                // If they clicked "Cancel" in the OS dialog, an AbortError is thrown.
                // We can safely ignore it.
                if (err.name !== 'AbortError') {
                    console.error('Save failed:', err);
                }
            }
        } 
        // 3. FALLBACK for Firefox/Safari (They don't fully support the new API yet)
        else {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = currentTitle + '.opub';
            a.click();
            
            // Clean up the memory leak 
            setTimeout(() => URL.revokeObjectURL(a.href), 100);
        }
    };
    
    console.log("✅ Modern Save System with Title Sync installed.");
})();


(function installSidebarImageFilters() {
    
    let userCollapsed = false; 

    // 1. Inject YOUR Preferred Refined CSS (Untouched)
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // 2. Inject HTML (Untouched)
    const expander = document.createElement('div');
    expander.id = 'op-sidebar-expander';
    expander.innerHTML = '<i class="fas fa-chevron-left"></i>';
    document.body.appendChild(expander);

    const panel = document.createElement('div');
    panel.id = 'op-image-sidebar';
    panel.innerHTML = `<div class="op-sidebar-header">
            <span class="op-sidebar-title">Format Picture</span>
            <div class="op-sidebar-top-btns">
                <button class="op-header-btn" id="filter-reset-btn" style="margin-right:8px" title="Reset All"><i class="fas fa-undo"></i></button>
                <button class="custom-dialog-close" id="filter-close-btn"><i class="fas fa-times"></i></button>
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Visibility</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Transparency</span><span class="op-slider-num" id="val-transparency">0%</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="transparency" min="0" max="100" value="0">
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Light & Tone</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Brightness</span><span class="op-slider-num" id="val-brightness">100%</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="brightness" min="0" max="200" value="100">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Contrast</span><span class="op-slider-num" id="val-contrast">100%</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="contrast" min="0" max="200" value="100">
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Color Settings</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Saturation</span><span class="op-slider-num" id="val-saturate">100%</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="saturate" min="0" max="200" value="100">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Hue</span><span class="op-slider-num" id="val-hue-rotate">0°</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="hue-rotate" min="-180" max="180" value="0">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Grayscale</span><span class="op-slider-num" id="val-grayscale">0%</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="grayscale" min="0" max="100" value="0">
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Effects</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Blur</span><span class="op-slider-num" id="val-blur">0px</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="blur" min="0" max="10" value="0" step="0.5">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Sepia</span><span class="op-slider-num" id="val-sepia">0%</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="sepia" min="0" max="100" value="0">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Invert</span><span class="op-slider-num" id="val-invert">0%</span></div>
                <input type="range" class="op-sidebar-slider" data-filter="invert" min="0" max="100" value="0">
            </div>
        </div>`;
    document.body.appendChild(panel);

    // 3. Logic
    const vp = document.getElementById('viewport') || document.getElementById('workspace');

    // Helper to sync visibility based on selection and user preference
    const refreshVisibility = (el) => {
        if (el && el.querySelector('img')) {
            const isBetaWordArt = el.querySelector('.beta-wa-img') !== null;
            const titleEl = panel.querySelector('.op-sidebar-title');
            if (titleEl) titleEl.innerText = isBetaWordArt ? 'Format WordArt' : 'Format Picture';
            if (userCollapsed) {
                panel.classList.remove('visible');
                expander.classList.add('visible');
                if (vp) vp.style.width = '';
            } else {
                panel.classList.add('visible');
                expander.classList.remove('visible');
                if (vp) vp.style.width = 'calc(100% - 290px)';
            }
            // Sync slider values
            document.querySelectorAll('.op-sidebar-slider').forEach(s => {
                const f = s.dataset.filter;
                const v = el.getAttribute(`data-filter-${f}`) || (['brightness','contrast','saturate'].includes(f)?100:0);
                s.value = v; 
                const txt = document.getElementById(`val-${f}`);
                if(txt) txt.innerText = v + (f==='hue-rotate'?'°':f==='blur'?'px':'%');
            });
        } else {
            panel.classList.remove('visible');
            expander.classList.remove('visible');
            if (vp) vp.style.width = '';
        }
    };

    const apply = (el) => {
        const img = el.querySelector('img'); if(!img) return;
        const get = (f, d) => el.getAttribute(`data-filter-${f}`) || d;
        img.style.filter = `brightness(${get('brightness',100)}%) contrast(${get('contrast',100)}%) saturate(${get('saturate',100)}%) hue-rotate(${get('hue-rotate',0)}deg) blur(${get('blur',0)}px) sepia(${get('sepia',0)}%) grayscale(${get('grayscale',0)}%) invert(${get('invert',0)}%)`;
        img.style.opacity = 1 - (get('transparency',0) / 100);
    };

    document.querySelectorAll('.op-sidebar-slider').forEach(s => {
        s.addEventListener('input', e => {
            if(!state.selectedEl) return;
            const f = e.target.dataset.filter, v = e.target.value;
            state.selectedEl.setAttribute(`data-filter-${f}`, v);
            const txt = document.getElementById(`val-${f}`);
            if(txt) txt.innerText = v + (f==='hue-rotate'?'°':f==='blur'?'px':'%');
            apply(state.selectedEl);
        });
        s.addEventListener('change', () => { if(window.pushHistory) pushHistory(); });
    });

    document.getElementById('filter-reset-btn').addEventListener('click', () => {
        if(!state.selectedEl) return;
        document.querySelectorAll('.op-sidebar-slider').forEach(s => {
            const f = s.dataset.filter, d = (['brightness','contrast','saturate'].includes(f)?100:0);
            state.selectedEl.removeAttribute(`data-filter-${f}`);
            s.value = d; 
            const txt = document.getElementById(`val-${f}`);
            if(txt) txt.innerText = d + (f==='hue-rotate'?'°':f==='blur'?'px':'%');
        });
        apply(state.selectedEl);
    });

    document.getElementById('filter-close-btn').addEventListener('click', () => { 
        userCollapsed = true; 
        refreshVisibility(state.selectedEl);
    });

    document.getElementById('op-sidebar-expander').addEventListener('click', () => { 
        userCollapsed = false; 
        refreshVisibility(state.selectedEl);
    });

    setTimeout(() => {
        if(window.selectElement) {
            const oldSel = window.selectElement;
            window.selectElement = (el) => {
                oldSel(el);
                // 10ms delay prevents selection race conditions/flicker
                setTimeout(() => refreshVisibility(el), 10);
            };
        }
        if(window.deselect) {
            const oldDes = window.deselect;
            window.deselect = () => { 
                oldDes(); 
                setTimeout(() => refreshVisibility(null), 10);
            };
        }
    }, 1000);
})();


(function lockGlobalWorkspaceAnimation() {
    const viewport = document.getElementById('viewport');
    if (!viewport) return;

    const observer = new MutationObserver((mutations) => {
        let shouldSync = false;
        
        for (let m of mutations) {
            if (m.target.id === 'op-image-sidebar' || m.target.id === 'op-wordart-sidebar' || m.target.classList.contains('sidebar-panel')) {
                shouldSync = true;
                break;
            }
        }

        if (shouldSync) {
            const activeSidebar = document.querySelector('#op-image-sidebar.visible, #op-wordart-sidebar.visible, .sidebar-panel.visible');
            
            if (activeSidebar) {
                const sidebarWidth = 290;
                const screenWidth = window.innerWidth;
                const minContentWidth = 950; 

                if (screenWidth < sidebarWidth + minContentWidth) {
                    viewport.style.setProperty('margin-right', sidebarWidth + 'px', 'important');
                    viewport.style.setProperty('width', `calc(100% - ${sidebarWidth}px)`, 'important');
                } else {
                    viewport.style.setProperty('margin-right', '0px', 'important');
                    viewport.style.setProperty('width', '100%', 'important');
                }
            } else {
                viewport.style.setProperty('margin-right', '0px', 'important');
                viewport.style.setProperty('width', '100%', 'important');
            }
        }
    });

    observer.observe(document.body, { 
        attributes: true, 
        attributeFilter: ['class'],
        subtree: true 
    });

    window.addEventListener('resize', () => {
        const activeSidebar = document.querySelector('#op-image-sidebar.visible, #op-wordart-sidebar.visible');
        if (activeSidebar) {
             const sidebarWidth = 290;
             const screenWidth = window.innerWidth;
             const minContentWidth = 986;
             if (screenWidth < sidebarWidth + minContentWidth) {
                 viewport.style.setProperty('margin-right', sidebarWidth + 'px', 'important');
                 viewport.style.setProperty('width', `calc(100% - ${sidebarWidth}px)`, 'important');
             } else {
                 viewport.style.setProperty('margin-right', '0px', 'important');
                 viewport.style.setProperty('width', '100%', 'important');
             }
        }
    });
})();


(function installSidebarWordArt() {
    let waUserCollapsed = false;

    // Helper functions for units and defaults
    const getDef = (f) => {
        if(f === 'lineHeight') return 1.2;
        if(f === 'fontWeight') return 400;
        if(f === 'shadowX' || f === 'shadowY') return 2;
        if(f === 'saturate') return 100; 
        return 0;
    };

    const getUnit = (f) => {
        if (['blur', 'spacing', 'wordSpacing', 'shadowX', 'shadowY'].includes(f)) return 'px';
        if (['opacity', 'saturate'].includes(f)) return '%';
        if (f === 'hue') return '°';
        if (f === 'lineHeight') return 'x';
        return ''; 
    };

    // --- CORE FEATURE: Vector Text Warping Engine ---
    const applyWordArtShape = (target, shape) => {
        // 1. Store the original raw text forever so we can always regenerate
        if (!target.dataset.origText) {
            target.dataset.origText = target.innerText.trim();
        }
        const text = target.dataset.origText;
        
        // 2. If 'none', revert to plain text
        if (!shape || shape === 'none') {
            target.innerHTML = text;
            target.style.display = 'inline-block';
            return;
        }

        // 3. Generate SVG dynamically
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.minWidth = "150px"; 
        svg.style.minHeight = "80px";
        svg.style.overflow = "visible"; // Prevents bounding box clipping
        
        const defs = document.createElementNS(svgNS, "defs");
        const path = document.createElementNS(svgNS, "path");
        const pathId = "wa-path-" + Math.random().toString(36).substr(2, 9);
        path.id = pathId;
        
        let pathD = "";
        if (shape === 'arch-up') {
            svg.setAttribute("viewBox", "0 0 200 100");
            pathD = "M 10,90 Q 100,-20 190,90"; 
        } else if (shape === 'arch-down') {
            svg.setAttribute("viewBox", "0 0 200 100");
            pathD = "M 10,10 Q 100,120 190,10";
        } else if (shape === 'circle') {
            svg.setAttribute("viewBox", "0 0 200 200");
            svg.style.minHeight = "150px";
            pathD = "M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0";
        } else if (shape === 'wave') {
            svg.setAttribute("viewBox", "0 0 200 100");
            pathD = "M 10,50 Q 55,0 100,50 T 190,50";
        }

        path.setAttribute("d", pathD);
        path.setAttribute("fill", "transparent");
        defs.appendChild(path);
        svg.appendChild(defs);

        const textEl = document.createElementNS(svgNS, "text");
        textEl.setAttribute("fill", "currentColor"); // Inherits your current font color!
        textEl.style.fontFamily = "inherit";
        textEl.style.fontSize = "26px"; // Scales appropriately to viewBox
        textEl.style.fontWeight = "inherit";
        textEl.style.letterSpacing = "inherit";

        const textPath = document.createElementNS(svgNS, "textPath");
        textPath.setAttribute("href", "#" + pathId);
        textPath.setAttribute("startOffset", "50%");
        textPath.setAttribute("text-anchor", "middle");
        textPath.textContent = text;

        textEl.appendChild(textPath);
        svg.appendChild(textEl);

        target.innerHTML = '';
        target.appendChild(svg);
        target.style.display = 'flex'; 
    };

    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    const expander = document.createElement('div');
    expander.id = 'op-wa-sidebar-expander';
    expander.innerHTML = '<i class="fas fa-font"></i>';
    document.body.appendChild(expander);

    const panel = document.createElement('div');
    panel.id = 'op-wordart-sidebar';
    panel.innerHTML = `<div class="op-sidebar-header">
            <span class="op-sidebar-title">Format WordArt</span>
            <div class="op-sidebar-top-btns">
                <button class="op-header-btn" id="wa-reset-btn" style="margin-right:8px" title="Reset All"><i class="fas fa-undo"></i></button>
                <button class="custom-dialog-close" id="wa-close-btn"><i class="fas fa-times"></i></button>
            </div>
        </div>
        
        <div class="op-sidebar-section">
            <span class="op-section-label">Text Shape</span>
            <div class="wa-shape-grid" id="wa-shape-controls">
                <button class="wa-shape-btn active" data-shape="none" title="Straight Text">
                    <svg viewBox="0 0 24 24"><text x="12" y="16" font-size="12" text-anchor="middle" font-weight="bold" fill="currentColor">ABC</text></svg>
                </button>
                <button class="wa-shape-btn" data-shape="arch-up" title="Arch Up">
                    <svg viewBox="0 0 24 24"><path d="M 4,16 Q 12,6 20,16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                </button>
                <button class="wa-shape-btn" data-shape="arch-down" title="Arch Down">
                    <svg viewBox="0 0 24 24"><path d="M 4,8 Q 12,18 20,8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                </button>
                <button class="wa-shape-btn" data-shape="circle" title="Circle">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="4 3"/></svg>
                </button>
                <button class="wa-shape-btn" data-shape="wave" title="Wave">
                    <svg viewBox="0 0 24 24"><path d="M 3,12 Q 7.5,6 12,12 T 21,12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                </button>
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Color & Effects</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Hue Shift</span><span class="op-slider-num" id="val-wa-hue">0°</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="hue" min="-180" max="180" value="0" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Saturation</span><span class="op-slider-num" id="val-wa-saturate">100%</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="saturate" min="0" max="200" value="100" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Transparency</span><span class="op-slider-num" id="val-wa-opacity">0%</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="opacity" min="0" max="100" value="0">
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Drop Shadow</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Shadow X</span><span class="op-slider-num" id="val-wa-shadowX">2px</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="shadowX" min="-50" max="50" value="2" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Shadow Y</span><span class="op-slider-num" id="val-wa-shadowY">2px</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="shadowY" min="-50" max="50" value="2" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Shadow Blur</span><span class="op-slider-num" id="val-wa-blur">0px</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="blur" min="0" max="25" value="0">
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Typography</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Font Weight</span><span class="op-slider-num" id="val-wa-fontWeight">400</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="fontWeight" min="100" max="900" value="400" step="100">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Letter Spacing</span><span class="op-slider-num" id="val-wa-spacing">0px</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="spacing" min="-10" max="50" value="0" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Word Spacing</span><span class="op-slider-num" id="val-wa-wordSpacing">0px</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="wordSpacing" min="-20" max="50" value="0" step="1">
            </div>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Line Height</span><span class="op-slider-num" id="val-wa-lineHeight">1.2x</span></div>
                <input type="range" class="wa-sidebar-input" data-waf="lineHeight" min="0.5" max="3" value="1.2" step="0.1">
            </div>
        </div>`;
    document.body.appendChild(panel);

    const refreshUI = (el) => {
        const isWA = el && (el.classList.contains('wa-text') || el.querySelector('.wa-text') || el.closest('.wa-wrapper'));
        if (isWA) {
            if (waUserCollapsed) {
                panel.classList.remove('visible');
                expander.classList.add('visible');
            } else {
                panel.classList.add('visible');
                expander.classList.remove('visible');
            }
            const target = el.querySelector('.wa-text') || el.closest('.wa-text') || (el.classList.contains('wa-text') ? el : null);
            if (target) {
                // Update Sliders
                panel.querySelectorAll('.wa-sidebar-input').forEach(input => {
                    const f = input.dataset.waf;
                    const attrVal = target.getAttribute(`data-waf-${f}`);
                    const v = attrVal !== null ? attrVal : getDef(f);
                    input.value = v;
                    document.getElementById(`val-wa-${f}`).innerText = v + getUnit(f);
                });
                
                // Update Shape Buttons
                const currentShape = target.getAttribute('data-waf-shape') || 'none';
                panel.querySelectorAll('.wa-shape-btn').forEach(btn => {
                    if(btn.dataset.shape === currentShape) btn.classList.add('active');
                    else btn.classList.remove('active');
                });
            }
        } else {
            panel.classList.remove('visible');
            expander.classList.remove('visible');
        }
    };

    setTimeout(() => {
        if (window.selectElement) {
            const originalSelect = window.selectElement;
            window.selectElement = function(el) {
                originalSelect.apply(this, arguments);
                if (el && (el.querySelector('.wa-text') || el.classList.contains('wa-text'))) {
                    document.getElementById('op-image-sidebar')?.classList.remove('visible');
                }
                refreshUI(el);
            };
        }
        if (window.deselect) {
            const originalDeselect = window.deselect;
            window.deselect = function() {
                originalDeselect.apply(this, arguments);
                refreshUI(null);
            };
        }
    }, 1500);

    // Sidebar Close / Expander
    document.getElementById('wa-close-btn').onclick = () => { waUserCollapsed = true; refreshUI(state.selectedEl); };
    expander.onclick = () => { waUserCollapsed = false; refreshUI(state.selectedEl); };

    // --- Shape Button Click Logic ---
    panel.querySelectorAll('.wa-shape-btn').forEach(btn => {
        btn.onclick = (e) => {
            if (!state.selectedEl) return;
            const target = state.selectedEl.querySelector('.wa-text') || state.selectedEl;
            const shape = btn.dataset.shape;
            
            // UI Toggle
            panel.querySelectorAll('.wa-shape-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Set Attribute & Apply Engine
            target.setAttribute('data-waf-shape', shape);
            applyWordArtShape(target, shape);
            
            // Sync Engine
            if (typeof syncWordArt === 'function') syncWordArt(state.selectedEl);
            if (typeof pushHistory === 'function') pushHistory();
        };
    });

    // Reset Button Logic
    document.getElementById('wa-reset-btn').onclick = () => {
        if (!state.selectedEl) return;
        const target = state.selectedEl.querySelector('.wa-text') || state.selectedEl;
        
        // Reset Sliders
        panel.querySelectorAll('.wa-sidebar-input').forEach(input => {
            const f = input.dataset.waf;
            const d = getDef(f);
            target.removeAttribute(`data-waf-${f}`);
            input.value = d;
            document.getElementById(`val-wa-${f}`).innerText = d + getUnit(f);
        });

        // Reset Shape
        target.removeAttribute('data-waf-shape');
        panel.querySelectorAll('.wa-shape-btn').forEach(b => {
            if(b.dataset.shape === 'none') b.classList.add('active');
            else b.classList.remove('active');
        });
        applyWordArtShape(target, 'none');

        // Strip CSS
        target.style.opacity = 1;
        target.style.letterSpacing = '0px';
        target.style.wordSpacing = '0px';
        target.style.lineHeight = 1.2;
        target.style.fontWeight = 400;
        target.style.filter = '';
        
        if (typeof syncWordArt === 'function') syncWordArt(state.selectedEl);
        if (typeof pushHistory === 'function') pushHistory();
    };

    // Slider Logic
    panel.querySelectorAll('.wa-sidebar-input').forEach(input => {
        input.oninput = (e) => {
            if (!state.selectedEl) return;
            const target = state.selectedEl.querySelector('.wa-text') || state.selectedEl;
            const val = e.target.value;
            const f = e.target.dataset.waf;
            
            target.setAttribute(`data-waf-${f}`, val);
            document.getElementById(`val-wa-${f}`).innerText = val + getUnit(f);
            
            if (f === 'opacity') target.style.opacity = 1 - (val / 100);
            if (f === 'spacing') target.style.letterSpacing = `${val}px`;
            if (f === 'wordSpacing') target.style.wordSpacing = `${val}px`;
            if (f === 'lineHeight') target.style.lineHeight = val;
            if (f === 'fontWeight') target.style.fontWeight = val;
            
            if (['blur', 'shadowX', 'shadowY', 'hue', 'saturate'].includes(f)) {
                const blurVal = target.getAttribute('data-waf-blur') || 0;
                const sxVal = target.getAttribute('data-waf-shadowX') || 2;
                const syVal = target.getAttribute('data-waf-shadowY') || 2;
                const hueVal = target.getAttribute('data-waf-hue') || 0;
                
                const satAttr = target.getAttribute('data-waf-saturate');
                const satVal = satAttr !== null ? satAttr : 100;
                
                let filterStr = '';
                if (blurVal > 0 || sxVal != 0 || syVal != 0) filterStr += `drop-shadow(${sxVal}px ${syVal}px ${blurVal}px rgba(0,0,0,0.5)) `;
                if (hueVal != 0) filterStr += `hue-rotate(${hueVal}deg) `;
                if (satVal != 100) filterStr += `saturate(${satVal}%) `;
                
                target.style.filter = filterStr.trim();
            }

            if (['spacing', 'wordSpacing', 'lineHeight', 'fontWeight', 'blur', 'shadowX', 'shadowY'].includes(f)) {
                if (typeof syncWordArt === 'function') syncWordArt(state.selectedEl);
            }
            if (typeof pushHistory === 'function') pushHistory();
        };
    });
})();


(function enhanceTableRibbons() {
    console.log("🛠️ Enhanced Table Ribbons Script initializing...");

    // --- NEW: Table Multi-Cell Selection State ---
    window._tableSelectionStartCell = null;
    window._tableSelectedCells = [];

    // --- NEW: Table Select-All Handle ---
    const tableSelectHandle = document.createElement('div');
    tableSelectHandle.id = 'op-table-select-handle';
    tableSelectHandle.innerHTML = '<i class="fas fa-arrows-alt"></i>';
    tableSelectHandle.style.cssText = `
        position: absolute;
        width: 18px;
        height: 18px;
        background: var(--ui-theme-color);
        color: white;
        border-radius: 3px;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        transform: translate(-9px, -9px);
    `;
    document.body.appendChild(tableSelectHandle);

    let handleTargetTable = null;

    tableSelectHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (handleTargetTable) {
            window._tableSelectionStartCell = null;
            window._tableSelectedCells = Array.from(handleTargetTable.querySelectorAll('td, th'));
            document.querySelectorAll('.op-selected-cell').forEach(c => c.classList.remove('op-selected-cell'));
            window._tableSelectedCells.forEach(c => c.classList.add('op-selected-cell'));
            
            const pubEl = handleTargetTable.closest('.pub-element');
            if (pubEl && typeof selectElement === 'function') {
                selectElement(pubEl);
            }
            if (window.ContextRibbonActions) ContextRibbonActions.showRibbons();
        }
    });

    // Helper: Map DOM table to a 2D logical grid to handle colspans/rowspans
    function getTableGridMap(table) {
        const grid = [];
        const cellMap = new Map(); // Maps cell DOM element to {r, c, rs, cs}
        
        for (let r = 0; r < table.rows.length; r++) {
            const row = table.rows[r];
            if (!grid[r]) grid[r] = [];
            
            let c = 0;
            for (let i = 0; i < row.cells.length; i++) {
                const cell = row.cells[i];
                // Skip already filled grid slots
                while (grid[r][c] !== undefined) c++;
                
                const rs = parseInt(cell.getAttribute('rowspan') || 1);
                const cs = parseInt(cell.getAttribute('colspan') || 1);
                
                cellMap.set(cell, { r, c, rs, cs });
                
                for (let yy = 0; yy < rs; yy++) {
                    for (let xx = 0; xx < cs; xx++) {
                        if (!grid[r + yy]) grid[r + yy] = [];
                        grid[r + yy][c + xx] = cell;
                    }
                }
                c += cs;
            }
        }
        return { grid, cellMap };
    }

    // Helper: Calculate bounding box between two cells
    function getBoundingBox(gridInfo, cellA, cellB) {
        const infoA = gridInfo.cellMap.get(cellA);
        const infoB = gridInfo.cellMap.get(cellB);
        if (!infoA || !infoB) return null;

        let minR = Math.min(infoA.r, infoB.r);
        let maxR = Math.max(infoA.r + infoA.rs - 1, infoB.r + infoB.rs - 1);
        let minC = Math.min(infoA.c, infoB.c);
        let maxC = Math.max(infoA.c + infoA.cs - 1, infoB.c + infoB.cs - 1);

        // Expand bounds if partial merged cells are caught
        let expanded = true;
        while (expanded) {
            expanded = false;
            for (let r = minR; r <= maxR; r++) {
                for (let c = minC; c <= maxC; c++) {
                    const cNode = gridInfo.grid[r][c];
                    if (!cNode) continue;
                    const cInfo = gridInfo.cellMap.get(cNode);
                    if (cInfo.r < minR) { minR = cInfo.r; expanded = true; }
                    if (cInfo.r + cInfo.rs - 1 > maxR) { maxR = cInfo.r + cInfo.rs - 1; expanded = true; }
                    if (cInfo.c < minC) { minC = cInfo.c; expanded = true; }
                    if (cInfo.c + cInfo.cs - 1 > maxC) { maxC = cInfo.c + cInfo.cs - 1; expanded = true; }
                }
            }
        }
        return { minR, maxR, minC, maxC };
    }

    // --- CUSTOM TABLE CELL RESIZER & MULTI-CELL SELECTION LOGIC ---
    window._tableResizeState = null;

    // Bind document-level drag events for tables
    document.addEventListener('mousedown', (e) => {
        const cell = e.target.closest('td, th');

        // If right-clicking on an already selected cell, do not clear the selection
        if (e.button === 2 && cell && window._tableSelectedCells.includes(cell)) {
            return;
        }

        // If clicking inside the UI (context menu, ribbon, sidebars), do not clear the selection
        if (e.target.closest('.pub-context-menu') || e.target.closest('.ribbon-container') || e.target.closest('.op-sidebar') || e.target.closest('#op-table-sidebar')) {
            return;
        }

        // Clear previous selection if clicking outside or left-clicking
        if (window._tableSelectedCells.length > 0) {
            document.querySelectorAll('.op-selected-cell').forEach(c => c.classList.remove('op-selected-cell'));
            window._tableSelectedCells = [];
            window._tableSelectionStartCell = null;
        }

        if (cell && cell.closest('.workspace')) {
            const rect = cell.getBoundingClientRect();
            const isRightEdge = Math.abs(e.clientX - rect.right) <= 8;
            const isBottomEdge = Math.abs(e.clientY - rect.bottom) <= 8;
            const isLeftEdge = Math.abs(e.clientX - rect.left) <= 8;
            const isTopEdge = Math.abs(e.clientY - rect.top) <= 8;
            
            const isBorderClick = isRightEdge || isBottomEdge || isLeftEdge || isTopEdge;
            
            if (isBorderClick && !e.target.closest('.resize-handle')) {
                const table = cell.closest('table');
                const gridInfo = getTableGridMap(table);
                const cInfo = gridInfo.cellMap.get(cell);
                if (!cInfo) return;

                let cellA = null, cellB = null;
                let dir = '';
                
                if (isRightEdge || isLeftEdge) {
                    dir = 'col';
                    const targetCol = isRightEdge ? (cInfo.c + cInfo.cs - 1) : (cInfo.c - 1);
                    if (targetCol >= 0 && gridInfo.grid[0]) {
                        cellA = gridInfo.grid[0][targetCol] || gridInfo.grid[cInfo.r][targetCol];
                        cellB = gridInfo.grid[0][targetCol + 1] || gridInfo.grid[cInfo.r][targetCol + 1];
                    }
                } else if (isBottomEdge || isTopEdge) {
                    dir = 'row';
                    const targetRow = isBottomEdge ? (cInfo.r + cInfo.rs - 1) : (cInfo.r - 1);
                    if (targetRow >= 0 && gridInfo.grid[targetRow]) {
                        cellA = (gridInfo.grid[targetRow][0] || cell).parentElement;
                        if (gridInfo.grid[targetRow + 1]) {
                            cellB = (gridInfo.grid[targetRow + 1][0] || cell).parentElement;
                        }
                    }
                }
                
                if (!cellA || !cellB || cellA === cellB) {
                    // This is an OUTER table edge. We do not want to resize the table via borders.
                    // Return early so the native element drag logic can take over to move it.
                    return;
                }

                // START CUSTOM RESIZE for INTERNAL boundaries
                e.preventDefault(); // Stop text selection
                e.stopPropagation(); // Stop element drag logic from firing
                e.stopImmediatePropagation();
                
                // Freeze all column/row dimensions to absolute pixels to prevent layout shifts during zero-sum resizing
                if (dir === 'col') {
                    const firstRowCells = table.rows[0]?.cells;
                    if (firstRowCells) {
                        for (let i = 0; i < firstRowCells.length; i++) {
                            const c = firstRowCells[i];
                            c.style.width = c.offsetWidth + 'px';
                        }
                    }
                } else if (dir === 'row') {
                    const rows = table.rows;
                    for (let i = 0; i < rows.length; i++) {
                        const r = rows[i];
                        r.style.height = r.offsetHeight + 'px';
                    }
                }
                
                window._tableResizeState = {
                    dir: dir,
                    startX: e.clientX,
                    startY: e.clientY,
                    cellA: cellA,
                    cellB: cellB,
                    startWA: cellA.offsetWidth || 0,
                    startWB: cellB ? cellB.offsetWidth : 0,
                    startHA: cellA.offsetHeight || 0,
                    startHB: cellB ? cellB.offsetHeight : 0
                };
                return;
            }

            if (!isBorderClick && !e.target.closest('.resize-handle')) {
                window._tableSelectionStartCell = cell;
                // Don't add the visual class yet; wait until they actually drag across a boundary
            }
        }
    }, true);

    document.addEventListener('mousemove', (e) => {
        // --- TABLE SELECT HANDLE POSITIONING ---
        if (!e.buttons) {
            const isOnHandle = e.target.closest('#op-table-select-handle');
            let table = null;
            
            const cell = e.target.closest('td, th');
            if (cell && cell.closest('.workspace')) {
                table = cell.closest('table');
            } else {
                const pubEl = e.target.closest('.pub-element');
                if (pubEl && pubEl.querySelector('table')) {
                    table = pubEl.querySelector('table');
                }
            }
            
            if (table) {
                const rect = table.getBoundingClientRect();
                tableSelectHandle.style.display = 'flex';
                tableSelectHandle.style.left = (rect.left + window.scrollX) + 'px';
                tableSelectHandle.style.top = (rect.top + window.scrollY) + 'px';
                handleTargetTable = table;
            } else if (!isOnHandle) {
                tableSelectHandle.style.display = 'none';
                handleTargetTable = null;
            }
        } else if (handleTargetTable && e.buttons > 0) {
            // hide handle while dragging
            tableSelectHandle.style.display = 'none';
        }

        // --- CUSTOM TABLE RESIZER (ACTIVE DRAG) ---
        if (window._tableResizeState) {
            const s = window._tableResizeState;
            if (s.dir === 'col') {
                const dx = e.clientX - s.startX;
                const minW = 15;
                let actualDx = dx;
                
                if (s.startWA + actualDx < minW) actualDx = minW - s.startWA;
                if (s.cellB && s.startWB - actualDx < minW) actualDx = s.startWB - minW;
                
                s.cellA.style.width = (s.startWA + actualDx) + 'px';
                if (s.cellB) s.cellB.style.width = (s.startWB - actualDx) + 'px';
            } else if (s.dir === 'row') {
                const dy = e.clientY - s.startY;
                const minH = 15;
                let actualDy = dy;
                
                if (s.startHA + actualDy < minH) actualDy = minH - s.startHA;
                if (s.cellB && s.startHB - actualDy < minH) actualDy = s.startHB - minH;
                
                s.cellA.style.height = (s.startHA + actualDy) + 'px';
                if (s.cellB) s.cellB.style.height = (s.startHB - actualDy) + 'px';
            }
            return;
        }
        
        // --- HOVER CURSOR CHANGER ---
        const cell = e.target.closest('td, th');
        if (cell && cell.closest('.workspace') && !window._tableSelectionStartCell && !e.buttons) {
            const rect = cell.getBoundingClientRect();
            const isRightEdge = Math.abs(e.clientX - rect.right) <= 8;
            const isBottomEdge = Math.abs(e.clientY - rect.bottom) <= 8;
            const isLeftEdge = Math.abs(e.clientX - rect.left) <= 8;
            const isTopEdge = Math.abs(e.clientY - rect.top) <= 8;
            
            if (isRightEdge || isBottomEdge || isLeftEdge || isTopEdge) {
                const table = cell.closest('table');
                const gridInfo = getTableGridMap(table);
                const cInfo = gridInfo.cellMap.get(cell);
                
                let cellA = null, cellB = null;
                if (cInfo) {
                    if (isRightEdge || isLeftEdge) {
                        const targetCol = isRightEdge ? (cInfo.c + cInfo.cs - 1) : (cInfo.c - 1);
                        if (targetCol >= 0 && gridInfo.grid[0]) {
                            cellA = gridInfo.grid[0][targetCol] || gridInfo.grid[cInfo.r][targetCol];
                            cellB = gridInfo.grid[0][targetCol + 1] || gridInfo.grid[cInfo.r][targetCol + 1];
                        }
                    } else if (isBottomEdge || isTopEdge) {
                        const targetRow = isBottomEdge ? (cInfo.r + cInfo.rs - 1) : (cInfo.r - 1);
                        if (targetRow >= 0 && gridInfo.grid[targetRow]) {
                            cellA = (gridInfo.grid[targetRow][0] || cell).parentElement;
                            if (gridInfo.grid[targetRow + 1]) {
                                cellB = (gridInfo.grid[targetRow + 1][0] || cell).parentElement;
                            }
                        }
                    }
                }
                
                if (!cellA || !cellB || cellA === cellB) {
                    cell.style.cursor = 'move';
                } else if (isRightEdge || isLeftEdge) {
                    cell.style.cursor = 'col-resize';
                } else {
                    cell.style.cursor = 'row-resize';
                }
            } else {
                cell.style.cursor = 'text';
            }
        } else if (cell && !e.buttons) {
             cell.style.cursor = 'text';
        }

        // --- EXISTING MULTI-SELECT LOGIC ---
        if (!window._tableSelectionStartCell) return;
        if (e.buttons !== 1) { // Left mouse button must be held down to drag
            window._tableSelectionStartCell = null;
            return;
        }

        // Because contenteditable can swallow mouseover during native text drag, we use elementFromPoint
        const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
        if (!hoveredEl) return;

        const hoverCell = hoveredEl.closest('td, th');
        if (!hoverCell) return;
        
        const table = hoverCell.closest('table');
        const startTable = window._tableSelectionStartCell.closest('table');
        if (table !== startTable) return;

        // If we are still just inside the original cell, don't trigger the multi-cell selection yet
        // This preserves native text selection behavior within a single cell.
        if (hoverCell === window._tableSelectionStartCell && window._tableSelectedCells.length <= 1) return;

        // Clear previous visual highlights
        document.querySelectorAll('.op-selected-cell').forEach(c => c.classList.remove('op-selected-cell'));
        window._tableSelectedCells = [];

        const gridInfo = getTableGridMap(table);
        const bbox = getBoundingBox(gridInfo, window._tableSelectionStartCell, hoverCell);
        if (!bbox) return;

        // Collect all cells in bbox
        const uniqueCells = new Set();
        for (let r = bbox.minR; r <= bbox.maxR; r++) {
            for (let c = bbox.minC; c <= bbox.maxC; c++) {
                if (gridInfo.grid[r] && gridInfo.grid[r][c]) {
                    uniqueCells.add(gridInfo.grid[r][c]);
                }
            }
        }

        window._tableSelectedCells = Array.from(uniqueCells);
        window._tableSelectedCells.forEach(c => c.classList.add('op-selected-cell'));
        
        // Force clear native text selection to avoid confusing dual-highlights
        window.getSelection().removeAllRanges();
    });

    document.addEventListener('mouseup', () => {
        window._tableResizeState = null;
        // Just stop tracking the drag initiator. The selection bounding box remains highlighted.
        window._tableSelectionStartCell = null;
    });

    // 1. EXTEND THE CONTEXT ACTIONS
    ContextRibbonActions.getTargetCells = function() {
        if (window._tableSelectedCells && window._tableSelectedCells.length > 0) {
            return window._tableSelectedCells;
        }
        if (state.selectedEl && state.selectedEl.querySelector('table')) {
            if (state.lastRange) {
                let node = state.lastRange.startContainer;
                if (node.nodeType === 3) node = node.parentNode;
                const cell = node.closest('td, th');
                if (cell && state.selectedEl.contains(cell)) {
                    return [cell];
                }
            }
            if (window._tableSelectionStartCell && state.selectedEl.contains(window._tableSelectionStartCell)) {
                return [window._tableSelectionStartCell];
            }
        }
        return null; 
    };

    ContextRibbonActions.getActiveCell = function() {
        const targets = this.getTargetCells();
        if (targets && targets.length > 0) return targets[0];
        if (state.selectedEl && state.selectedEl.querySelector('table')) return state.selectedEl.querySelector('td, th');
        return null;
    };

    const getTable = () => state.selectedEl?.querySelector('table');

    // --- Layout Logic ---
    ContextRibbonActions.insertRowAbove = function() {
        const cell = this.getActiveCell(); const table = getTable();
        if (cell && table) {
            const tr = cell.closest('tr');
            const newRow = table.insertRow(tr.rowIndex);
            for(let i=0; i<tr.cells.length; i++) {
                const newCell = newRow.insertCell();
                newCell.style.cssText = tr.cells[i].style.cssText;
                newCell.innerHTML = "&nbsp;";
                newCell.setAttribute('contenteditable', 'true');
            }
            pushHistory();
        }
    };

    ContextRibbonActions.insertRowBelow = function() {
        const cell = this.getActiveCell(); const table = getTable();
        if (cell && table) {
            const tr = cell.closest('tr');
            const newRow = table.insertRow(tr.rowIndex + 1);
            for(let i=0; i<tr.cells.length; i++) {
                const newCell = newRow.insertCell();
                newCell.style.cssText = tr.cells[i].style.cssText;
                newCell.innerHTML = "&nbsp;";
                newCell.setAttribute('contenteditable', 'true');
            }
            pushHistory();
        }
    };

    ContextRibbonActions.insertColLeft = function() {
        const cell = this.getActiveCell(); const table = getTable();
        if (cell && table) {
            const index = cell.cellIndex;
            for(let r=0; r<table.rows.length; r++) {
                const newCell = table.rows[r].insertCell(index);
                const refCell = table.rows[r].cells[index > 0 ? index - 1 : index + 1] || table.rows[r].cells[0];
                newCell.style.cssText = refCell.style.cssText;
                newCell.innerHTML = "&nbsp;";
                newCell.setAttribute('contenteditable', 'true');
            }
            pushHistory();
        }
    };

    ContextRibbonActions.insertColRight = function() {
        const cell = this.getActiveCell(); const table = getTable();
        if (cell && table) {
            const index = cell.cellIndex;
            for(let r=0; r<table.rows.length; r++) {
                const newCell = table.rows[r].insertCell(index + 1);
                const refCell = table.rows[r].cells[index];
                newCell.style.cssText = refCell.style.cssText;
                newCell.innerHTML = "&nbsp;";
                newCell.setAttribute('contenteditable', 'true');
            }
            pushHistory();
        }
    };

    ContextRibbonActions.deleteRow = function() {
        const cell = this.getActiveCell(); const table = getTable();
        if (cell && table) {
            table.deleteRow(cell.closest('tr').rowIndex);
            if(table.rows.length === 0) deleteSelected();
            else pushHistory();
        }
    };

    ContextRibbonActions.deleteCol = function() {
        const cell = this.getActiveCell(); const table = getTable();
        if (cell && table) {
            const index = cell.cellIndex;
            for(let r=0; r<table.rows.length; r++) {
                if (table.rows[r].cells.length > index) table.rows[r].deleteCell(index);
            }
            if(table.rows[0] && table.rows[0].cells.length === 0) deleteSelected();
            else pushHistory();
        }
    };

    ContextRibbonActions.mergeRight = function() {
        const cell = this.getActiveCell();
        if (!cell) return;
        const nextCell = cell.nextElementSibling;
        if (!nextCell) return;
        
        let colSpan1 = parseInt(cell.getAttribute('colspan') || 1);
        let colSpan2 = parseInt(nextCell.getAttribute('colspan') || 1);
        
        cell.setAttribute('colspan', colSpan1 + colSpan2);
        cell.innerHTML += '<br>' + nextCell.innerHTML;
        nextCell.remove();
        pushHistory();
    };

    ContextRibbonActions.mergeDown = function() {
        const cell = this.getActiveCell();
        if (!cell) return;
        const row = cell.parentElement;
        const nextRow = row.nextElementSibling;
        if (!nextRow) return;
        
        const cellIndex = Array.from(row.children).indexOf(cell);
        const nextCell = nextRow.children[cellIndex];
        if (!nextCell) return;
        
        let rowSpan1 = parseInt(cell.getAttribute('rowspan') || 1);
        let rowSpan2 = parseInt(nextCell.getAttribute('rowspan') || 1);
        
        cell.setAttribute('rowspan', rowSpan1 + rowSpan2);
        cell.innerHTML += '<br>' + nextCell.innerHTML;
        nextCell.remove();
        pushHistory();
    };

    ContextRibbonActions.mergeSelectedCells = function() {
        if (!window._tableSelectedCells || window._tableSelectedCells.length <= 1) return;
        
        const table = window._tableSelectedCells[0].closest('table');
        if (!table) return;

        const gridInfo = getTableGridMap(table);
        
        // Find absolute top-left anchor cell
        let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
        window._tableSelectedCells.forEach(cell => {
            const info = gridInfo.cellMap.get(cell);
            if (info.r < minR) minR = info.r;
            if (info.r + info.rs - 1 > maxR) maxR = info.r + info.rs - 1;
            if (info.c < minC) minC = info.c;
            if (info.c + info.cs - 1 > maxC) maxC = info.c + info.cs - 1;
        });

        const anchorCell = gridInfo.grid[minR][minC];
        if (!anchorCell) return;

        // Set dimensions
        anchorCell.setAttribute('rowspan', (maxR - minR + 1));
        anchorCell.setAttribute('colspan', (maxC - minC + 1));

        // Merge content and delete others
        let mergedHtml = anchorCell.innerHTML;
        const isEmptyHtml = (html) => {
            let str = html.replace(/&nbsp;/g, '').replace(/<br\s*\/?>/gi, '').replace(/\s+/g, '').trim();
            return str === '' && !html.includes('<img') && !html.includes('<svg') && !html.includes('<canvas');
        };

        if (isEmptyHtml(mergedHtml)) {
            mergedHtml = '';
        }

        window._tableSelectedCells.forEach(cell => {
            if (cell !== anchorCell) {
                if (!isEmptyHtml(cell.innerHTML)) {
                    if (mergedHtml !== '') mergedHtml += '<br>';
                    mergedHtml += cell.innerHTML;
                }
                cell.remove();
            }
        });
        
        if (mergedHtml === '') {
            mergedHtml = '<br>'; // Keep one break for focus/caret
        }

        anchorCell.innerHTML = mergedHtml;
        
        // Clear selection
        document.querySelectorAll('.op-selected-cell').forEach(c => c.classList.remove('op-selected-cell'));
        window._tableSelectedCells = [];
        
        pushHistory();
    };

    ContextRibbonActions.splitSelectedCell = function() {
        const anchorCell = this.getActiveCell();
        if (!anchorCell) return;

        const rSpan = parseInt(anchorCell.getAttribute('rowspan')) || 1;
        const cSpan = parseInt(anchorCell.getAttribute('colspan')) || 1;

        if (rSpan <= 1 && cSpan <= 1) return;

        const table = anchorCell.closest('table');
        if (!table) return;

        const gridInfo = getTableGridMap(table);
        const anchorInfo = gridInfo.cellMap.get(anchorCell);
        if (!anchorInfo) return;

        const startR = anchorInfo.r;
        const startC = anchorInfo.c;

        anchorCell.removeAttribute('rowspan');
        anchorCell.removeAttribute('colspan');

        for (let i = startR; i < startR + rSpan; i++) {
            const tr = table.rows[i];
            if (!tr) continue;

            const colsToInsert = (i === startR) ? cSpan - 1 : cSpan;
            
            let insertBeforeNode = null;
            for (let c = 0; c < tr.cells.length; c++) {
                const physicalCell = tr.cells[c];
                const physicalCellInfo = gridInfo.cellMap.get(physicalCell);
                if (physicalCellInfo && physicalCellInfo.c >= startC + cSpan) {
                    insertBeforeNode = physicalCell;
                    break;
                }
            }

            for (let k = 0; k < colsToInsert; k++) {
                const newTd = document.createElement(anchorCell.tagName);
                newTd.innerHTML = '<br>';
                
                if (insertBeforeNode) {
                    tr.insertBefore(newTd, insertBeforeNode);
                } else {
                    tr.appendChild(newTd);
                }
            }
        }

        if (window._tableSelectedCells) {
            document.querySelectorAll('.op-selected-cell').forEach(c => c.classList.remove('op-selected-cell'));
            window._tableSelectedCells = [];
            window._tableSelectionStartCell = null;
        }

        pushHistory();
    };


    ContextRibbonActions.cellAlign = function(vAlign, hAlign) {
        const cell = this.getActiveCell();
        if (cell) {
            cell.style.verticalAlign = vAlign;
            cell.style.textAlign = hAlign;
            pushHistory();
        }
    };

    ContextRibbonActions.setCellPadding = function(val) {
        const table = getTable();
        if (!table) return;
        
        let targetCells = window._tableSelectedCells && window._tableSelectedCells.length > 0 ? window._tableSelectedCells : Array.from(table.querySelectorAll('td, th'));
        
        targetCells.forEach(td => {
            td.style.padding = val + 'px';
        });
        
        const label = document.getElementById('val-cell-padding');
        if (label) label.innerText = val + 'px';
    };

    ContextRibbonActions.distributeCols = function() {
        const table = getTable();
        if (!table || table.rows.length === 0) return;
        
        const targets = this.getTargetCells();
        const gridInfo = getTableGridMap(table);
        let targetCols = new Set();
        
        if (!targets || targets.length === 0 || targets.length === table.querySelectorAll('td, th').length) {
            for(let c=0; c<gridInfo.grid[0].length; c++) targetCols.add(c);
        } else {
            targets.forEach(cell => {
                const info = gridInfo.cellMap.get(cell);
                if (info) {
                    for (let c = info.c; c < info.c + info.cs; c++) targetCols.add(c);
                }
            });
        }
        
        const colsArr = Array.from(targetCols);
        if (colsArr.length > 0) {
            let totalWidth = 0;
            const cellsToResize = new Set();
            const row0 = gridInfo.grid[0];
            
            // Freeze all columns first
            const firstRowCells = table.rows[0].cells;
            for(let i=0; i<firstRowCells.length; i++) {
                firstRowCells[i].style.width = firstRowCells[i].offsetWidth + 'px';
            }
            
            colsArr.forEach(c => {
                const cell = row0[c];
                if (cell) cellsToResize.add(cell);
            });
            
            cellsToResize.forEach(cell => {
                totalWidth += cell.offsetWidth;
            });
            
            if (cellsToResize.size > 0) {
                const newW = (totalWidth / cellsToResize.size) + 'px';
                cellsToResize.forEach(cell => {
                    cell.style.width = newW;
                });
            }
            pushHistory();
        }
    };

    ContextRibbonActions.distributeRows = function() {
        const table = getTable();
        if (!table || table.rows.length === 0) return;
        
        const targets = this.getTargetCells();
        let targetRows = new Set();
        
        if (!targets || targets.length === 0 || targets.length === table.querySelectorAll('td, th').length) {
            for(let r=0; r<table.rows.length; r++) targetRows.add(r);
        } else {
            const gridInfo = getTableGridMap(table);
            targets.forEach(cell => {
                const info = gridInfo.cellMap.get(cell);
                if (info) {
                    for (let r = info.r; r < info.r + info.rs; r++) targetRows.add(r);
                }
            });
        }
        
        const rowsArr = Array.from(targetRows);
        if (rowsArr.length > 0) {
            let totalHeight = 0;
            // Freeze all rows first to prevent layout shifts
            for(let i=0; i<table.rows.length; i++) {
                table.rows[i].style.height = table.rows[i].offsetHeight + 'px';
            }
            rowsArr.forEach(r => {
                if (table.rows[r]) totalHeight += table.rows[r].offsetHeight;
            });
            const newH = (totalHeight / rowsArr.length) + 'px';
            rowsArr.forEach(r => {
                if (table.rows[r]) table.rows[r].style.height = newH;
            });
            pushHistory();
        }
    };

    // --- Design Logic ---
    ContextRibbonActions.cellFill = function(color) {
        const table = getTable();
        if (table) {
            const targets = this.getTargetCells();
            if (targets) {
                targets.forEach(cell => cell.style.backgroundColor = color);
            } else {
                table.style.backgroundColor = color;
                for(let r=0; r<table.rows.length; r++) {
                    for(let c=0; c<table.rows[r].cells.length; c++) {
                        table.rows[r].cells[c].style.backgroundColor = color;
                    }
                }
            }
            pushHistory();
        }
    };

    ContextRibbonActions.tableBorderColor = function(color) {
        const table = getTable();
        if (table) {
            let targetCells = this.getTargetCells();
            if (targetCells) {
                targetCells.forEach(cell => {
                    cell.style.borderColor = color;
                });
            } else {
                table.style.borderColor = color;
                for(let r=0; r<table.rows.length; r++) {
                    for(let c=0; c<table.rows[r].cells.length; c++) {
                        table.rows[r].cells[c].style.borderColor = color;
                    }
                }
            }
            pushHistory();
        }
    };

    ContextRibbonActions.applyBorderThickness = function(px) {
        const table = getTable();
        if (table) {
            let targetCells = this.getTargetCells();

            if (targetCells) {
                targetCells.forEach(cell => {
                    cell.style.borderWidth = `${px}px`;
                    cell.style.borderStyle = 'solid';
                    if (!cell.style.borderColor && table.style.borderColor) {
                        cell.style.borderColor = table.style.borderColor;
                    }
                });
            } else {
                table.style.borderWidth = `${px}px`;
                table.style.borderStyle = 'solid';
                for(let r=0; r<table.rows.length; r++) {
                    for(let c=0; c<table.rows[r].cells.length; c++) {
                        table.rows[r].cells[c].style.borderWidth = `${px}px`;
                        table.rows[r].cells[c].style.borderStyle = 'solid';
                    }
                }
            }
            pushHistory();
        }
    };

    ContextRibbonActions.cellPadding = function(px) {
        const table = getTable();
        if (table && px) {
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.padding = px;
                }
            }
            pushHistory();
        }
    };

    ContextRibbonActions.applyTemplate = function(type) {
        const table = getTable();
        if (!table) return;
        
        table.style.borderCollapse = 'separate';
        table.style.borderSpacing = '0';
        table.style.overflow = 'hidden';
        table.style.borderRadius = '0px';
        table.style.border = '1px solid #000';
        table.style.boxShadow = 'none';
        
        // Reset wrapper styles
        if(state.selectedEl) {
            state.selectedEl.style.borderRadius = '0px';
            state.selectedEl.style.overflow = 'visible';
            state.selectedEl.style.boxShadow = 'none';
        }

        for(let r=0; r<table.rows.length; r++) {
            for(let c=0; c<table.rows[r].cells.length; c++) {
                table.rows[r].cells[c].style.border = 'none';
                table.rows[r].cells[c].style.borderRight = '1px solid #000';
                table.rows[r].cells[c].style.borderBottom = '1px solid #000';
                table.rows[r].cells[c].style.backgroundColor = 'transparent';
                table.rows[r].cells[c].style.color = '#000';
                table.rows[r].cells[c].style.fontWeight = 'normal';
                table.rows[r].cells[c].style.padding = '6px';
            }
        }

        if (type === 'modern') {
            table.style.border = '1px solid #ccc';
            table.style.borderRadius = '8px';
            if(state.selectedEl) { state.selectedEl.style.borderRadius = '8px'; state.selectedEl.style.overflow = 'hidden'; }

            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px solid #ccc';
                    table.rows[r].cells[c].style.borderBottom = '1px solid #ccc';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = 'var(--ui-theme-color)';
                        table.rows[r].cells[c].style.color = '#fff';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                    } else if (r % 2 === 1) {
                        table.rows[r].cells[c].style.backgroundColor = '#f9f9f9';
                    }
                }
            }
        } else if (type === 'minimal') {
            table.style.border = 'none';
            table.style.borderTop = '2px solid #333';
            table.style.borderBottom = '2px solid #333';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = 'none';
                    table.rows[r].cells[c].style.borderBottom = 'none';
                    if (r === 0) {
                        table.rows[r].cells[c].style.borderBottom = '1px solid #333';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                    }
                }
            }
        } else if (type === 'soft') {
            table.style.border = 'none';
            table.style.borderRadius = '10px';
            table.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
            if(state.selectedEl) { 
                state.selectedEl.style.borderRadius = '10px'; 
                state.selectedEl.style.overflow = 'hidden'; 
                state.selectedEl.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)'; 
                table.style.boxShadow = 'none'; 
            }

            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = 'none';
                    table.rows[r].cells[c].style.borderBottom = '1px solid #f0f0f0';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = '#f5f7f9';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                        table.rows[r].cells[c].style.color = 'var(--ui-theme-dark)';
                    }
                }
            }
        } else if (type === 'accent') {
            table.style.border = '1px solid var(--ui-theme-color)';
            table.style.borderRadius = '4px';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px solid var(--ui-theme-color)';
                    table.rows[r].cells[c].style.borderBottom = '1px solid var(--ui-theme-color)';
                    if (c === 0) {
                        table.rows[r].cells[c].style.backgroundColor = 'var(--ui-theme-color)';
                        table.rows[r].cells[c].style.color = '#fff';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                    }
                }
            }
        } else if (type === 'dark') {
            table.style.border = '1px solid #444';
            table.style.borderRadius = '8px';
            table.style.backgroundColor = '#222';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px solid #444';
                    table.rows[r].cells[c].style.borderBottom = '1px solid #444';
                    table.rows[r].cells[c].style.color = '#ddd';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = '#111';
                        table.rows[r].cells[c].style.color = '#fff';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                    } else if (r % 2 === 1) {
                        table.rows[r].cells[c].style.backgroundColor = '#2a2a2a';
                    }
                }
            }
        } else if (type === 'bordered') {
            table.style.border = '3px solid var(--ui-theme-color)';
            table.style.borderRadius = '12px';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px dashed var(--ui-theme-color)';
                    table.rows[r].cells[c].style.borderBottom = '1px dashed var(--ui-theme-color)';
                    table.rows[r].cells[c].style.color = 'var(--ui-theme-dark)';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = 'rgba(0, 118, 112, 0.1)';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                    }
                }
            }
        } else if (type === 'elegant') {
            table.style.border = '1px solid #d4c4b7';
            table.style.borderRadius = '0px';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px solid #efeae6';
                    table.rows[r].cells[c].style.borderBottom = '1px solid #efeae6';
                    table.rows[r].cells[c].style.color = '#4a4036';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = '#f4f0ec';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                        table.rows[r].cells[c].style.borderBottom = '2px solid #d4c4b7';
                    }
                }
            }
        } else if (type === 'highlight') {
            table.style.border = 'none';
            table.style.borderRadius = '0px';
            table.style.borderTop = '1px solid #ccc';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = 'none';
                    table.rows[r].cells[c].style.borderBottom = '1px solid #eee';
                    if (r === 0) {
                        table.rows[r].cells[c].style.borderBottom = '3px solid var(--ui-theme-color)';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                        table.rows[r].cells[c].style.color = 'var(--ui-theme-dark)';
                    }
                }
            }
        } else if (type === 'ocean') {
            table.style.border = '1px solid #1E3A8A';
            table.style.borderRadius = '8px';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px solid #93C5FD';
                    table.rows[r].cells[c].style.borderBottom = '1px solid #93C5FD';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = '#1E3A8A';
                        table.rows[r].cells[c].style.color = '#fff';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                    } else if (r % 2 === 1) {
                        table.rows[r].cells[c].style.backgroundColor = '#EFF6FF';
                    }
                }
            }
        } else if (type === 'sunset') {
            table.style.border = '2px solid #EA580C';
            table.style.borderRadius = '6px';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px solid #FDBA74';
                    table.rows[r].cells[c].style.borderBottom = '1px solid #FDBA74';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = '#EA580C';
                        table.rows[r].cells[c].style.color = '#fff';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                    } else if (r % 2 === 1) {
                        table.rows[r].cells[c].style.backgroundColor = '#FFF7ED';
                    }
                }
            }
        } else if (type === 'corporate') {
            table.style.border = '1px solid #1F2937';
            table.style.borderRadius = '0px';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px solid #E5E7EB';
                    table.rows[r].cells[c].style.borderBottom = '1px solid #E5E7EB';
                    table.rows[r].cells[c].style.color = '#111827';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = '#F3F4F6';
                        table.rows[r].cells[c].style.color = '#1F2937';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                        table.rows[r].cells[c].style.borderBottom = '2px solid #1F2937';
                    }
                }
            }
        } else if (type === 'monochrome') {
            table.style.border = '4px solid #000';
            table.style.borderRadius = '0px';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '2px solid #000';
                    table.rows[r].cells[c].style.borderBottom = '2px solid #000';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = '#000';
                        table.rows[r].cells[c].style.color = '#fff';
                        table.rows[r].cells[c].style.fontWeight = '900';
                    }
                }
            }
        } else if (type === 'neon') {
            table.style.border = '2px solid #39FF14';
            table.style.borderRadius = '4px';
            table.style.backgroundColor = '#000';
            table.style.boxShadow = '0 0 10px #39FF14';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px solid #1F8A0B';
                    table.rows[r].cells[c].style.borderBottom = '1px solid #1F8A0B';
                    table.rows[r].cells[c].style.color = '#39FF14';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = '#111';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                        table.rows[r].cells[c].style.borderBottom = '2px solid #39FF14';
                    }
                }
            }
        } else if (type === 'pastel') {
            table.style.border = 'none';
            table.style.borderRadius = '12px';
            table.style.backgroundColor = '#F5F3FF';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '2px solid #fff';
                    table.rows[r].cells[c].style.borderBottom = '2px solid #fff';
                    table.rows[r].cells[c].style.color = '#5B21B6';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = '#DDD6FE';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                    }
                }
            }
        } else if (type === 'ledger') {
            table.style.border = '1px solid #ccc';
            table.style.borderRadius = '0px';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px solid #eee';
                    table.rows[r].cells[c].style.borderBottom = '1px solid #eee';
                    table.rows[r].cells[c].style.color = '#333';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = '#fff';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                        table.rows[r].cells[c].style.borderBottom = '3px double #000';
                    } else if (r % 2 === 1) {
                        table.rows[r].cells[c].style.backgroundColor = '#ECFDF5';
                    }
                }
            }
        } else if (type === 'transparent') {
            table.style.border = 'none';
            table.style.borderRadius = '0px';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = 'none';
                    table.rows[r].cells[c].style.borderBottom = 'none';
                }
            }
        } else if (type === 'forest') {
            table.style.border = '1px solid #166534';
            table.style.borderRadius = '8px';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px solid #86EFAC';
                    table.rows[r].cells[c].style.borderBottom = '1px solid #86EFAC';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = '#166534';
                        table.rows[r].cells[c].style.color = '#fff';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                    } else if (r % 2 === 1) {
                        table.rows[r].cells[c].style.backgroundColor = '#F0FDF4';
                    }
                }
            }
        } else if (type === 'ruby') {
            table.style.border = '3px double #991B1B';
            table.style.borderRadius = '0px';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px solid #FECACA';
                    table.rows[r].cells[c].style.borderBottom = '1px solid #FECACA';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = '#991B1B';
                        table.rows[r].cells[c].style.color = '#fff';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                    }
                }
            }
        } else if (type === 'gold') {
            table.style.border = '2px solid #B45309';
            table.style.borderRadius = '0px';
            table.style.backgroundColor = '#FEF3C7';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px solid #D97706';
                    table.rows[r].cells[c].style.borderBottom = '1px solid #D97706';
                    table.rows[r].cells[c].style.color = '#78350F';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = '#F59E0B';
                        table.rows[r].cells[c].style.color = '#fff';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                    }
                }
            }
        } else if (type === 'hacker') {
            table.style.border = '1px solid #06B6D4';
            table.style.borderRadius = '0px';
            table.style.backgroundColor = '#111827';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px solid #0891B2';
                    table.rows[r].cells[c].style.borderBottom = '1px solid #0891B2';
                    table.rows[r].cells[c].style.color = '#22D3EE';
                    table.rows[r].cells[c].style.fontFamily = 'monospace';
                    if (r === 0) {
                        table.rows[r].cells[c].style.borderBottom = '2px solid #06B6D4';
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                        table.rows[r].cells[c].style.color = '#67E8F9';
                    }
                }
            }
        } else if (type === 'checker') {
            table.style.border = '2px solid #000';
            table.style.borderRadius = '0px';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px solid #000';
                    table.rows[r].cells[c].style.borderBottom = '1px solid #000';
                    if ((r + c) % 2 === 0) {
                        table.rows[r].cells[c].style.backgroundColor = '#eee';
                    } else {
                        table.rows[r].cells[c].style.backgroundColor = '#fff';
                    }
                    if (r === 0) {
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                    }
                }
            }
        } else if (type === 'blueprint') {
            table.style.border = '2px solid #fff';
            table.style.borderRadius = '0px';
            table.style.backgroundColor = '#1D4ED8';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px dashed #fff';
                    table.rows[r].cells[c].style.borderBottom = '1px dashed #fff';
                    table.rows[r].cells[c].style.color = '#fff';
                    if (r === 0) {
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                        table.rows[r].cells[c].style.borderBottom = '2px solid #fff';
                    }
                }
            }
        } else if (type === 'comic') {
            table.style.border = '4px solid #000';
            table.style.borderRadius = '12px';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '2px solid #000';
                    table.rows[r].cells[c].style.borderBottom = '2px solid #000';
                    if (r === 0) {
                        table.rows[r].cells[c].style.backgroundColor = '#FDE047';
                        table.rows[r].cells[c].style.fontWeight = '900';
                        table.rows[r].cells[c].style.borderBottom = '4px solid #000';
                    }
                }
            }
        } else if (type === 'dotted') {
            table.style.border = '2px dotted #9CA3AF';
            table.style.borderRadius = '0px';
            for(let r=0; r<table.rows.length; r++) {
                for(let c=0; c<table.rows[r].cells.length; c++) {
                    table.rows[r].cells[c].style.borderRight = '1px dotted #9CA3AF';
                    table.rows[r].cells[c].style.borderBottom = '1px dotted #9CA3AF';
                    if (r === 0) {
                        table.rows[r].cells[c].style.fontWeight = 'bold';
                        table.rows[r].cells[c].style.borderBottom = '2px dotted #9CA3AF';
                    }
                }
            }
        }
        
        // Sync wrapper styling to clip corners properly
        if(state.selectedEl) {
            state.selectedEl.style.borderRadius = table.style.borderRadius || '0px';
            if (table.style.boxShadow && table.style.boxShadow !== 'none') {
                state.selectedEl.style.boxShadow = table.style.boxShadow;
                table.style.boxShadow = 'none'; // move shadow to wrapper
            }
            if(table.style.borderRadius && table.style.borderRadius !== '0px') {
                state.selectedEl.style.overflow = 'hidden';
            } else {
                state.selectedEl.style.overflow = 'visible';
            }
        }

        pushHistory();
    };

    // 2. OVERWRITE THE RIBBON UI HTML
    const checkRibbons = setInterval(() => {
        const designTab = document.getElementById('ribbon-table-design');
        const layoutTab = document.getElementById('ribbon-table-layout');
        
        const clipGroup = `<div class="group"><div class="tool-btn" onclick="copyEl()"><i class="fas fa-copy" style="color:var(--ui-theme-color)"></i> Copy</div><div class="tool-btn" onclick="ContextMenuActions.pasteNormal()"><i class="fas fa-paste" style="color:var(--ui-theme-color)"></i> Paste</div><div class="group-label">Clipboard</div></div>`;
        const arrGroup = `<div class="group"><div class="tool-btn" onclick="bringFront()"><i class="fas fa-arrow-up" style="color:var(--ui-theme-color)"></i> Front</div><div class="tool-btn" onclick="sendBack()"><i class="fas fa-arrow-down" style="color:var(--ui-theme-color)"></i> Back</div><div class="tool-btn" onclick="ContextRibbonActions.alignCenter()"><i class="fas fa-align-center" style="color:var(--ui-theme-color)"></i> Align</div><div class="tool-btn" onclick="ContextRibbonActions.toggleGroup()"><i class="fas fa-object-group" style="color:var(--ui-theme-color)"></i> Group</div><div class="tool-btn" onclick="toggleRotateMenu(this); event.stopPropagation();"><i class="fas fa-sync-alt" style="color:var(--ui-theme-color)"></i> Rotate <i class="fas fa-caret-down"></i></div><div class="tool-btn" onclick="deleteSelected()" style="color:#c00;"><i class="fas fa-trash-alt" style="color:var(--ui-theme-color);"></i> Delete</div><div class="group-label">Arrange</div></div>`;

        if (designTab) {
            clearInterval(checkRibbons);

            // --- REBUILD: Table Design ---
            designTab.innerHTML = `${clipGroup}
                <div class="group">
                    <div class="tool-btn" onclick="ContextRibbonActions.tableStyle()"><i class="fas fa-paint-roller" style="color:var(--ui-theme-color)"></i>Zebra</div>
                    <div class="group-label">Styles</div>
                </div>
                <div class="group">
                    <div style="display:flex; flex-direction:column; padding: 2px; align-items:center; justify-content:center; gap:5px; height:100%;">
                        <div class="mini-btn ctx-btn-strict ctx-color-strict" style="width:40px; height:35px;" title="Cell Fill Color" onclick="CustomColorPicker.open(this, document.getElementById('ctx-cell-fill-bar').style.backgroundColor || '#ffffff', (color) => { document.getElementById('ctx-cell-fill-bar').style.background=color; ContextRibbonActions.cellFill(color); })">
                            <i class="fas fa-fill-drip" style="font-size:18px; color:var(--ui-theme-color); margin-top:-2px;"></i>
                            <div style="height:5px; background:#ffffff; width:30px; position:absolute; bottom:2px; border:1px solid #ccc;" id="ctx-cell-fill-bar"></div>
                        </div>
                    </div>
                    <div class="group-label">Shading</div>
                </div>
                <div class="group">
                    <div style="display:flex; flex-direction:column; padding: 2px; justify-content:center; gap:6px; height:100%;">
                        <div style="display:flex; align-items:center; gap:4px; font-size:11px;">
                            <i class="fas fa-border-all" style="color:#666; width:14px; text-align:center;"></i>
                            <div class="modern-spinner" style="width: 54px;">
                                <input type="text" id="ctx-tbl-border-ribbon" value="1" onchange="ContextRibbonActions.applyBorderThickness(this.value)">
                                <div class="spin-btns">
                                    <div onclick="document.getElementById('ctx-tbl-border-ribbon').value=Math.min(64, parseInt(document.getElementById('ctx-tbl-border-ribbon').value)+1); ContextRibbonActions.applyBorderThickness(document.getElementById('ctx-tbl-border-ribbon').value)"><i class="fas fa-chevron-up"></i></div>
                                    <div onclick="document.getElementById('ctx-tbl-border-ribbon').value=Math.max(0, parseInt(document.getElementById('ctx-tbl-border-ribbon').value)-1); ContextRibbonActions.applyBorderThickness(document.getElementById('ctx-tbl-border-ribbon').value)"><i class="fas fa-chevron-down"></i></div>
                                </div>
                            </div>
                            px
                        </div>
                        <div style="display:flex; align-items:center; gap:4px; font-size:11px;">
                            <i class="fas fa-palette" style="color:#666; width:14px; text-align:center;"></i>
                            <div class="modern-color-picker" style="background-color: #000000; width: 54px; height: 22px; cursor: pointer; border: 1px solid #ccc;" onclick="CustomColorPicker.open(this, this.style.backgroundColor || '#000000', (color) => { this.style.backgroundColor = color; ContextRibbonActions.tableBorderColor(color); })"></div> 
                            Color
                        </div>
                    </div>
                    <div class="group-label">Borders</div>
                </div>
                <div class="group">
                    <div style="display:flex; flex-direction:column; padding: 2px; justify-content:center; align-items:center; height:100%;">
                        <span style="font-size:10px; color:var(--ui-theme-dark); margin-bottom:4px; font-weight:bold;">Cell margins</span>
                        <div class="modern-select" id="ctx-margin-btn" style="position: relative; width: 85px;" onclick="
                            const m = document.getElementById('ctx-margin-dropdown');
                            if(m.style.display === 'block') {
                                m.style.display = 'none';
                            } else {
                                document.querySelectorAll('.custom-dropdown').forEach(d => d.style.display = 'none');
                                const rect = this.getBoundingClientRect();
                                m.style.left = rect.left + 'px';
                                m.style.top = (rect.bottom + 2) + 'px';
                                m.style.display = 'block';
                            }
                            event.stopPropagation();
                        ">
                            <span id="ctx-margin-label" style="font-size: 11px;">Default</span>
                            <div class="arrow-box"><i class="fas fa-chevron-down" style="font-size:10px;"></i></div>
                        </div>
                    </div>
                    <div class="tool-btn" onclick="showLineSpacingModal()"><i class="fas fa-arrows-alt-v" style="color:var(--ui-theme-color)"></i> Line<br>Spacing</div>
                    <div class="group-label">Spacing</div>
                </div>
                ${arrGroup}
                <div class="group" style="padding-right: 12px;">
                    <div style="display:grid; grid-template-columns: repeat(12, 1fr); gap: 4px; padding: 2px 4px; height:100%; align-content: center;">
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('modern')" title="Modern Teal Header">
                            <div style="width:24px; height:18px; border-radius:4px; border:1px solid #aaa; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:var(--ui-theme-color); display:flex;"><div style="flex:1;border-right:1px solid #aaa;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#f9f9f9; border-top:1px solid #aaa; display:flex;"><div style="flex:1;border-right:1px solid #aaa;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; border-top:1px solid #aaa; display:flex;"><div style="flex:1;border-right:1px solid #aaa;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('minimal')" title="Minimalist Lines">
                            <div style="width:24px; height:18px; border-radius:0px; border:none; border-top:2px solid #000; border-bottom:2px solid #000; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#fff; border-bottom:1px solid #000;"></div>
                                <div style="flex:1; background:#fff;"></div>
                                <div style="flex:1; background:#fff;"></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('soft')" title="Soft Gray Header">
                            <div style="width:24px; height:18px; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.15); overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#e0e0e0; display:flex;"><div style="flex:1;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; border-top:1px solid #eee;"></div>
                                <div style="flex:1; background:#fff; border-top:1px solid #eee;"></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('accent')" title="Teal Accent Column">
                            <div style="width:24px; height:18px; border-radius:3px; border:1px solid var(--ui-theme-color); overflow:hidden; display:flex;">
                                <div style="width:30%; background:var(--ui-theme-color); border-right:1px solid var(--ui-theme-color);"></div>
                                <div style="flex:1; background:#fff; display:flex; flex-direction:column;">
                                    <div style="flex:1; border-bottom:1px solid var(--ui-theme-color);"></div>
                                    <div style="flex:1; border-bottom:1px solid var(--ui-theme-color);"></div>
                                    <div style="flex:1;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('dark')" title="Dark Mode">
                            <div style="width:24px; height:18px; border-radius:4px; border:1px solid #444; background:#222; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#111; display:flex;"><div style="flex:1;border-right:1px solid #444;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#2a2a2a; border-top:1px solid #444; display:flex;"><div style="flex:1;border-right:1px solid #444;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#222; border-top:1px solid #444; display:flex;"><div style="flex:1;border-right:1px solid #444;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('bordered')" title="Teal Grid Outline">
                            <div style="width:24px; height:18px; border-radius:4px; border:2px solid var(--ui-theme-color); overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:rgba(0,118,112,0.1); display:flex;"><div style="flex:1;border-right:1px dashed var(--ui-theme-color);"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; border-top:1px dashed var(--ui-theme-color); display:flex;"><div style="flex:1;border-right:1px dashed var(--ui-theme-color);"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; border-top:1px dashed var(--ui-theme-color); display:flex;"><div style="flex:1;border-right:1px dashed var(--ui-theme-color);"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('elegant')" title="Elegant Gold/Cream">
                            <div style="width:24px; height:18px; border-radius:0px; border:1px solid #d4c4b7; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#f4f0ec; border-bottom:2px solid #d4c4b7; display:flex;"><div style="flex:1;border-right:1px solid #efeae6;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; display:flex;"><div style="flex:1;border-right:1px solid #efeae6;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; border-top:1px solid #efeae6; display:flex;"><div style="flex:1;border-right:1px solid #efeae6;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('highlight')" title="Teal Highlight">
                            <div style="width:24px; height:18px; border-radius:0px; border:none; border-top:1px solid #ccc; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#fff; border-bottom:2px solid var(--ui-theme-color);"></div>
                                <div style="flex:1; background:#fff; border-bottom:1px solid #eee;"></div>
                                <div style="flex:1; background:#fff;"></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('ocean')" title="Ocean Blue">
                            <div style="width:24px; height:18px; border-radius:4px; border:1px solid #1E3A8A; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#1E3A8A; display:flex;"><div style="flex:1;border-right:1px solid #1E3A8A;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#EFF6FF; border-top:1px solid #93C5FD; display:flex;"><div style="flex:1;border-right:1px solid #93C5FD;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; border-top:1px solid #93C5FD; display:flex;"><div style="flex:1;border-right:1px solid #93C5FD;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('sunset')" title="Sunset Orange">
                            <div style="width:24px; height:18px; border-radius:4px; border:1px solid #EA580C; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#EA580C; display:flex;"><div style="flex:1;border-right:1px solid #EA580C;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#FFF7ED; border-top:1px solid #FDBA74; display:flex;"><div style="flex:1;border-right:1px solid #FDBA74;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; border-top:1px solid #FDBA74; display:flex;"><div style="flex:1;border-right:1px solid #FDBA74;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('corporate')" title="Corporate Gray">
                            <div style="width:24px; height:18px; border-radius:0px; border:1px solid #1F2937; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#F3F4F6; border-bottom:1px solid #1F2937; display:flex;"><div style="flex:1;border-right:1px solid #E5E7EB;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; display:flex;"><div style="flex:1;border-right:1px solid #E5E7EB;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; border-top:1px solid #E5E7EB; display:flex;"><div style="flex:1;border-right:1px solid #E5E7EB;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('monochrome')" title="Monochrome">
                            <div style="width:24px; height:18px; border-radius:0px; border:2px solid #000; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#000; display:flex;"><div style="flex:1;border-right:1px solid #000;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; border-top:1px solid #000; display:flex;"><div style="flex:1;border-right:1px solid #000;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; border-top:1px solid #000; display:flex;"><div style="flex:1;border-right:1px solid #000;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('neon')" title="Neon Hacker">
                            <div style="width:24px; height:18px; border-radius:3px; border:1px solid #39FF14; background:#000; box-shadow:0 0 3px #39FF14; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#111; border-bottom:1px solid #39FF14; display:flex;"><div style="flex:1;border-right:1px solid #1F8A0B;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#000; display:flex;"><div style="flex:1;border-right:1px solid #1F8A0B;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#000; border-top:1px solid #1F8A0B; display:flex;"><div style="flex:1;border-right:1px solid #1F8A0B;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('pastel')" title="Pastel Lavender">
                            <div style="width:24px; height:18px; border-radius:4px; background:#F5F3FF; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#DDD6FE; display:flex;"><div style="flex:1;border-right:1px solid #fff;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; border-top:1px solid #fff; display:flex;"><div style="flex:1;border-right:1px solid #fff;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; border-top:1px solid #fff; display:flex;"><div style="flex:1;border-right:1px solid #fff;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('ledger')" title="Ledger">
                            <div style="width:24px; height:18px; border-radius:0px; border:1px solid #ccc; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#fff; border-bottom:2px double #000; display:flex;"><div style="flex:1;border-right:1px solid #eee;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#ECFDF5; display:flex;"><div style="flex:1;border-right:1px solid #eee;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; border-top:1px solid #eee; display:flex;"><div style="flex:1;border-right:1px solid #eee;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('transparent')" title="Transparent Gridlines">
                            <div style="width:24px; height:18px; border-radius:0px; border:1px dashed #ccc; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; display:flex;"><div style="flex:1;border-right:1px dashed #eee;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; border-top:1px dashed #eee; display:flex;"><div style="flex:1;border-right:1px dashed #eee;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; border-top:1px dashed #eee; display:flex;"><div style="flex:1;border-right:1px dashed #eee;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('forest')" title="Forest Green">
                            <div style="width:24px; height:18px; border-radius:4px; border:1px solid #166534; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#166534; display:flex;"><div style="flex:1;border-right:1px solid #166534;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#F0FDF4; border-top:1px solid #86EFAC; display:flex;"><div style="flex:1;border-right:1px solid #86EFAC;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; border-top:1px solid #86EFAC; display:flex;"><div style="flex:1;border-right:1px solid #86EFAC;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('ruby')" title="Ruby Red">
                            <div style="width:24px; height:18px; border-radius:0px; border:3px double #991B1B; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#991B1B; display:flex;"><div style="flex:1;border-right:1px solid #FECACA;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; border-top:1px solid #FECACA; display:flex;"><div style="flex:1;border-right:1px solid #FECACA;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; border-top:1px solid #FECACA; display:flex;"><div style="flex:1;border-right:1px solid #FECACA;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('gold')" title="Gold">
                            <div style="width:24px; height:18px; border-radius:0px; border:2px solid #B45309; background:#FEF3C7; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#F59E0B; display:flex;"><div style="flex:1;border-right:1px solid #D97706;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#FEF3C7; border-top:1px solid #D97706; display:flex;"><div style="flex:1;border-right:1px solid #D97706;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#FEF3C7; border-top:1px solid #D97706; display:flex;"><div style="flex:1;border-right:1px solid #D97706;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('hacker')" title="Cyber Hacker">
                            <div style="width:24px; height:18px; border-radius:0px; border:1px solid #06B6D4; background:#111827; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#111827; border-bottom:2px solid #06B6D4; display:flex;"><div style="flex:1;border-right:1px solid #0891B2;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#111827; display:flex;"><div style="flex:1;border-right:1px solid #0891B2;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#111827; border-top:1px solid #0891B2; display:flex;"><div style="flex:1;border-right:1px solid #0891B2;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('checker')" title="Checkerboard">
                            <div style="width:24px; height:18px; border-radius:0px; border:2px solid #000; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; display:flex;"><div style="flex:1;background:#eee;border-right:1px solid #000;"></div><div style="flex:1;background:#fff;"></div></div>
                                <div style="flex:1; border-top:1px solid #000; display:flex;"><div style="flex:1;background:#fff;border-right:1px solid #000;"></div><div style="flex:1;background:#eee;"></div></div>
                                <div style="flex:1; border-top:1px solid #000; display:flex;"><div style="flex:1;background:#eee;border-right:1px solid #000;"></div><div style="flex:1;background:#fff;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('blueprint')" title="Blueprint">
                            <div style="width:24px; height:18px; border-radius:0px; border:2px solid #fff; background:#1D4ED8; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; border-bottom:2px solid #fff; display:flex;"><div style="flex:1;border-right:1px dashed #fff;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; display:flex;"><div style="flex:1;border-right:1px dashed #fff;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; border-top:1px dashed #fff; display:flex;"><div style="flex:1;border-right:1px dashed #fff;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('comic')" title="Comic Book">
                            <div style="width:24px; height:18px; border-radius:4px; border:3px solid #000; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; background:#FDE047; border-bottom:3px solid #000; display:flex;"><div style="flex:1;border-right:2px solid #000;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; display:flex;"><div style="flex:1;border-right:2px solid #000;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; background:#fff; border-top:2px solid #000; display:flex;"><div style="flex:1;border-right:2px solid #000;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                        <div class="template-btn" onclick="ContextRibbonActions.applyTemplate('dotted')" title="Dotted Outline">
                            <div style="width:24px; height:18px; border-radius:0px; border:2px dotted #9CA3AF; overflow:hidden; display:flex; flex-direction:column;">
                                <div style="flex:1; border-bottom:2px dotted #9CA3AF; display:flex;"><div style="flex:1;border-right:1px dotted #9CA3AF;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; display:flex;"><div style="flex:1;border-right:1px dotted #9CA3AF;"></div><div style="flex:1;"></div></div>
                                <div style="flex:1; border-top:1px dotted #9CA3AF; display:flex;"><div style="flex:1;border-right:1px dotted #9CA3AF;"></div><div style="flex:1;"></div></div>
                            </div>
                        </div>
                    </div>
                    <style>
                        .template-btn { cursor:pointer; padding:3px; border:1px solid transparent; border-radius:4px; transition:all 0.1s; display: flex; align-items: center; justify-content: center; background:#fff; }
                        .template-btn:hover { background:rgba(0,118,112,0.1); border-color:var(--ui-theme-color); transform:scale(1.1); box-shadow:0 2px 5px rgba(0,0,0,0.1); }
                    </style>
                    <div class="group-label">Templates</div>
                </div>`;
            
            if(!document.getElementById('ctx-margin-dropdown')) {
                const drop = document.createElement('div');
                drop.id = 'ctx-margin-dropdown';
                drop.className = 'custom-dropdown';
                drop.style.width = '95px';
                drop.innerHTML = `
                    <style>
                        #ctx-margin-dropdown { border-radius: 6px; overflow: hidden; border: 1px solid var(--ui-theme-color); box-shadow: 0 4px 12px rgba(0, 118, 112, 0.15); padding: 2px; }
                        .margin-item { padding: 6px 8px; cursor: pointer; font-size: 11px; display: flex; align-items: center; gap: 6px; border-radius: 4px; transition: all 0.1s; margin-bottom: 2px; }
                        .margin-item:last-child { margin-bottom: 0; }
                        .margin-item:hover { background: rgba(0, 118, 112, 0.1); color: var(--ui-theme-dark); }
                        .margin-item i { color: #666; width: 12px; text-align: center; }
                        .margin-item:hover i { color: var(--ui-theme-dark); }
                    </style>
                    <div class="margin-item" onclick="document.getElementById('ctx-margin-label').innerText='Tight'; ContextRibbonActions.cellPadding('2px'); this.parentElement.style.display='none';"><i class="fas fa-compress"></i> Tight</div>
                    <div class="margin-item" onclick="document.getElementById('ctx-margin-label').innerText='Normal'; ContextRibbonActions.cellPadding('6px'); this.parentElement.style.display='none';"><i class="fas fa-grip-lines"></i> Normal</div>
                    <div class="margin-item" onclick="document.getElementById('ctx-margin-label').innerText='Relaxed'; ContextRibbonActions.cellPadding('12px'); this.parentElement.style.display='none';"><i class="fas fa-expand"></i> Relaxed</div>
                    <div class="margin-item" onclick="document.getElementById('ctx-margin-label').innerText='Default'; ContextRibbonActions.cellPadding(''); this.parentElement.style.display='none';"><i class="fas fa-eraser"></i> Default</div>
                `;
                document.body.appendChild(drop);
            }
            
            
            console.log("✅ Table Ribbons successfully refactored with new layout groups.");
        }
    }, 500);

})();


(function installPanningHand() {
    console.log("🛠️ Infinite Panning Hand Script initializing...");

    let isPanning = false;
    let panModeEnabled = false;
    let startX = 0, startY = 0;
    let animationFrameId = null;

    const viewport = document.getElementById('viewport');
    if (!viewport) return;

    // 1. Inject CSS for Cursors and the Status Bar UI
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // 2. Inject the UI Button neatly on the FAR LEFT of the status bar
    const statusBar = document.querySelector('.status-bar');
    const statusMsg = document.getElementById('status-msg');
    
    if (statusBar && statusMsg) {
        // Group the "Ready" message and our Pan button together so flexbox space-between doesn't break
        let leftGroup = document.getElementById('status-left-group');
        if (!leftGroup) {
            leftGroup = document.createElement('div');
            leftGroup.id = 'status-left-group';
            leftGroup.style.display = 'flex';
            leftGroup.style.alignItems = 'center';
            leftGroup.style.gap = '20px'; // Nice spacing between "Ready" and the button
            
            statusBar.insertBefore(leftGroup, statusMsg);
            leftGroup.appendChild(statusMsg);
        }

        const panBtn = document.createElement('div');
        panBtn.id = 'pan-mode-toggle';
        panBtn.innerHTML = '<i class="fas fa-hand-paper"></i> <span style="font-weight:600;">Pan Tool</span>';
        panBtn.title = "Toggle Pan Mode (Middle-Click also pans)";
        
        leftGroup.appendChild(panBtn);

        // Click event to toggle Pan Mode
        panBtn.addEventListener('click', () => {
            panModeEnabled = !panModeEnabled;
            if (panModeEnabled) {
                panBtn.classList.add('active');
                viewport.classList.add('pan-mode');
                if (typeof deselect === 'function') deselect(); 
            } else {
                panBtn.classList.remove('active');
                viewport.classList.remove('pan-mode');
            }
        });
    }

    // 3. The "Capture Phase" Shield
    window.addEventListener('mousedown', (e) => {
        if (e.target.closest('#viewport') || e.target.closest('#paper')) {
            if (e.button === 1 || (e.button === 0 && panModeEnabled)) {
                e.preventDefault(); 
                e.stopImmediatePropagation(); 
                
                isPanning = true;
                startX = e.clientX;
                startY = e.clientY;
                viewport.classList.add('panning');
            }
        }
    }, true);

    // 4. Hybrid Math Engine: Scrolls if possible, physically pushes the paper if blocked!
    window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;

        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        
        animationFrameId = requestAnimationFrame(() => {
            const oldScrollLeft = viewport.scrollLeft;
            const oldScrollTop = viewport.scrollTop;
            
            // Try to use native scrollbars first
            viewport.scrollLeft -= dx;
            viewport.scrollTop -= dy;
            
            // Calculate how much movement the scrollbars FAILED to absorb
            const unscrollableX = dx + (viewport.scrollLeft - oldScrollLeft);
            const unscrollableY = dy + (viewport.scrollTop - oldScrollTop);
            
            // Apply the leftover movement directly to the paper to create an infinite canvas feel
            const paper = document.getElementById('paper');
            if (paper && (unscrollableX !== 0 || unscrollableY !== 0)) {
                const currentLeft = parseFloat(paper.style.left) || 0;
                const currentTop = parseFloat(paper.style.top) || 0;
                
                paper.style.left = (currentLeft + unscrollableX) + 'px';
                paper.style.top = (currentTop + unscrollableY) + 'px';
            }
            
            // Keep rulers perfectly glued to the moving paper
            if (typeof window.syncRulers === 'function') window.syncRulers();
        });
    });

    // 5. Release the Canvas
    window.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            viewport.classList.remove('panning');
            if (typeof window.syncRulers === 'function') window.syncRulers();
        }
    });
    
    window.addEventListener('mouseleave', () => {
        if (isPanning) {
            isPanning = false;
            viewport.classList.remove('panning');
        }
    });

    console.log("✅ Infinite Panning Hand Tool added successfully.");
})();


(function installTableTemplates() {
    console.log("🛠️ Table Templates Script initializing...");

    // 1. Setup Base UI CSS & Structural Table CSS
    const style = document.createElement('style');
    let cssRules = `
        /* Grid of Previews */
        .tt-grid {
            display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;
            max-height: 500px; overflow-y: auto; background: #faf9f8; padding: 15px;
            border-radius: 4px; border: 1px solid #eee;
        }
        .tt-card {
            background: white; border: 1px solid #ddd; border-radius: 6px; padding: 12px;
            cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; gap: 10px;
        }
        .tt-card:hover { border-color: var(--ui-theme-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .tt-name { font-size: 13px; font-weight: bold; color: #444; text-align: center; margin-top: auto; }
        
        /* Mini Preview Tables (CSS-only for UI thumbnails) */
        .mini-table { width: 100%; border-collapse: collapse; font-size: 6px; user-select: none; }
        .mini-table th, .mini-table td { padding: 4px; text-align: left; }
        
        /* --- 10 STRUCTURAL TEMPLATE CSS --- */
        .pub-table-minimal th { border-bottom: 2px solid #333; padding: 6px; font-weight: bold; text-align: left; }
        .pub-table-minimal td { border-bottom: 1px solid #eee; padding: 6px; }
        .pub-table-grid th { background: #e1dfdd; border: 1px solid #999; padding: 6px; font-weight: bold; color: #333; text-align: left;}
        .pub-table-grid td { border: 1px solid #999; padding: 6px; }
        .pub-table-schedule { border-left: 4px solid var(--ui-theme-color); }
        .pub-table-schedule th { background: #faf9f8; padding: 8px; text-align: left; border-bottom: 2px solid #ddd; color: #333; }
        .pub-table-schedule td { padding: 8px; border-bottom: 1px solid #eee; }
        .pub-table-schedule tr td:first-child { font-weight: bold; color: var(--ui-theme-color); width: 30%; }
        .pub-table-invoice th { border-bottom: 2px solid #333; padding: 8px; text-align: left; background:#faf9f8; }
        .pub-table-invoice td { border-bottom: 1px solid #eee; padding: 8px; }
        .pub-table-invoice .amount { text-align: right; }
        .pub-table-invoice .total-row td { border-top: 2px solid #333; border-bottom: 3px double #333; background:#fff; }
        .pub-table-pricing th { background: #f8f9fa; padding: 15px; text-align: center; border: 1px solid #ddd; font-size: 18px; }
        .pub-table-pricing td { padding: 10px; text-align: center; border: 1px solid #ddd; }
        .pub-table-pricing .highlight { background: var(--ui-theme-color); color: white; border-color: var(--ui-theme-color); }
        .pub-table-pricing .highlight-cell { border-left: 2px solid var(--ui-theme-color); border-right: 2px solid var(--ui-theme-color); }
        .pub-table-matrix th { border-bottom: 2px solid #ddd; padding: 10px; }
        .pub-table-matrix td { border-bottom: 1px solid #eee; padding: 10px; }
        .pub-table-roster th { background: #e0e0e0; border: 1px solid #999; padding: 6px; text-align: left; }
        .pub-table-roster td { border: 1px solid #ccc; padding: 6px; }
        .pub-table-roster .chk { width: 40px; text-align: center; }
        .pub-table-financial th { border-bottom: 1px solid #000; padding: 6px; text-align: left; }
        .pub-table-financial td { padding: 6px; }
        .pub-table-financial .num { text-align: right; }
        .pub-table-financial .total td { border-top: 1px solid #000; border-bottom: 3px double #000; }
        .pub-table-roadmap th { padding: 8px; text-align: left; border: 1px solid #555; }
        .pub-table-roadmap td { border: 1px solid #ccc; padding: 8px; }
    `;

    // 2. Define 10 Hand-crafted Structural Layouts
    const structuralTemplates = [
        {
            name: 'Clean Minimalist',
            previewHTML: `<table class="mini-table" style="border:none;"><tr><th style="border:none; border-bottom:2px solid #333;">Col 1</th><th style="border:none; border-bottom:2px solid #333;">Col 2</th></tr><tr><td style="border:none; border-bottom:1px solid #eee;">Data</td><td style="border:none; border-bottom:1px solid #eee;">Data</td></tr></table>`,
            insertHTML: `<table class="pub-table-minimal" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;" contenteditable="true"><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr><tr><td>Row 1 Data</td><td>Row 1 Data</td><td>Row 1 Data</td></tr><tr><td>Row 2 Data</td><td>Row 2 Data</td><td>Row 2 Data</td></tr></table>`
        },
        {
            name: 'Professional Grid',
            previewHTML: `<table class="mini-table"><tr style="background:#e1dfdd;"><th>Col 1</th><th>Col 2</th></tr><tr><td style="border:1px solid #999;">Data</td><td style="border:1px solid #999;">Data</td></tr></table>`,
            insertHTML: `<table class="pub-table-grid" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;" contenteditable="true"><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr><tr><td>Row 1 Data</td><td>Row 1 Data</td><td>Row 1 Data</td></tr><tr><td>Row 2 Data</td><td>Row 2 Data</td><td>Row 2 Data</td></tr></table>`
        },
        {
            name: 'Schedule / Agenda',
            previewHTML: `<table class="mini-table" style="border:none; border-left:3px solid var(--ui-theme-color);"><tr><th style="border:none; border-bottom:2px solid #ddd; background:#faf9f8;">Time</th><th style="border:none; border-bottom:2px solid #ddd; background:#faf9f8;">Event</th></tr><tr><td style="border:none; border-bottom:1px solid #eee; font-weight:bold; color:var(--ui-theme-color);">09:00</td><td style="border:none; border-bottom:1px solid #eee;">Data</td></tr></table>`,
            insertHTML: `<table class="pub-table-schedule" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;" contenteditable="true"><tr><th>Time</th><th>Event</th><th>Location</th></tr><tr><td>09:00 AM</td><td>Opening Keynote</td><td>Main Hall</td></tr><tr><td>10:30 AM</td><td>Strategy Session</td><td>Room B</td></tr></table>`
        },
        {
            name: 'Invoice List',
            previewHTML: `<table class="mini-table" style="border:none;"><tr><th style="border:none; border-bottom:2px solid #333;">Item</th><th style="border:none; border-bottom:2px solid #333; text-align:right;">Total</th></tr><tr><td style="border:none; border-bottom:1px solid #eee;">Service</td><td style="border:none; border-bottom:1px solid #eee; text-align:right;">$150</td></tr></table>`,
            insertHTML: `<table class="pub-table-invoice" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;" contenteditable="true"><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th class="amount">Total</th></tr><tr><td>Consulting Services</td><td>10</td><td>$150.00</td><td class="amount">$1,500.00</td></tr><tr><td>Software License</td><td>1</td><td>$299.00</td><td class="amount">$299.00</td></tr><tr class="total-row"><td colspan="3" style="text-align:right; font-weight:bold;">Grand Total:</td><td class="amount" style="font-weight:bold;">$1,799.00</td></tr></table>`
        },
        {
            name: 'Pricing Tiers',
            previewHTML: `<table class="mini-table" style="text-align:center;"><tr><th style="border:1px solid #ccc;">Basic</th><th style="background:var(--ui-theme-color); color:#fff;">Pro</th><th style="border:1px solid #ccc;">Max</th></tr><tr><td style="border:1px solid #ccc;">$9</td><td style="border:2px solid var(--ui-theme-color);">$19</td><td style="border:1px solid #ccc;">$29</td></tr></table>`,
            insertHTML: `<table class="pub-table-pricing" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px; text-align:center;" contenteditable="true"><tr><th>Basic<br><span style="font-size:24px;">$9</span></th><th class="highlight">Pro<br><span style="font-size:24px;">$19</span></th><th>Enterprise<br><span style="font-size:24px;">$49</span></th></tr><tr><td>Feature A</td><td class="highlight-cell">Feature A</td><td>Feature A</td></tr><tr><td>Feature B</td><td class="highlight-cell">Feature B</td><td>Feature B</td></tr></table>`
        },
        {
            name: 'Feature Matrix',
            previewHTML: `<table class="mini-table"><tr><th style="text-align:left;">Feature</th><th>Free</th><th>Pro</th></tr><tr><td style="border-bottom:1px solid #eee;">Multi-user</td><td style="text-align:center; border-bottom:1px solid #eee;">✖</td><td style="text-align:center; border-bottom:1px solid #eee;">✔</td></tr></table>`,
            insertHTML: `<table class="pub-table-matrix" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;" contenteditable="true"><tr><th style="text-align:left;">Feature</th><th style="text-align:center;">Starter</th><th style="text-align:center;">Professional</th></tr><tr><td>Cloud Sync</td><td style="text-align:center; color:red;">✖</td><td style="text-align:center; color:green;">✔</td></tr><tr><td>Priority Support</td><td style="text-align:center; color:red;">✖</td><td style="text-align:center; color:green;">✔</td></tr></table>`
        },
        {
            name: 'Attendance Roster',
            previewHTML: `<table class="mini-table"><tr><th style="background:#e0e0e0;">Name</th><th style="background:#e0e0e0; width:10px;">M</th><th style="background:#e0e0e0; width:10px;">T</th></tr><tr><td style="border:1px solid #ccc;">John</td><td style="border:1px solid #ccc;"></td><td style="border:1px solid #ccc;"></td></tr></table>`,
            insertHTML: `<table class="pub-table-roster" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;" contenteditable="true"><tr><th>Student Name</th><th class="chk">Mon</th><th class="chk">Tue</th><th class="chk">Wed</th><th class="chk">Thu</th><th class="chk">Fri</th></tr><tr><td>Anderson, Sarah</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>Miller, James</td><td></td><td></td><td></td><td></td><td></td></tr></table>`
        },
        {
            name: 'Financial Report',
            previewHTML: `<table class="mini-table" style="border:none;"><tr><th style="border-bottom:1px solid #000;">Account</th><th style="border-bottom:1px solid #000;">Q1</th></tr><tr><td style="border-bottom:3px double #000;">Total</td><td style="border-bottom:3px double #000;">$1M</td></tr></table>`,
            insertHTML: `<table class="pub-table-financial" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;" contenteditable="true"><tr><th>Category</th><th class="num">Q1</th><th class="num">Q2</th><th class="num">Q3</th><th class="num">Q4</th></tr><tr><td>Revenue</td><td class="num">$150k</td><td class="num">$175k</td><td class="num">$190k</td><td class="num">$210k</td></tr><tr><td>Expenses</td><td class="num">$80k</td><td class="num">$85k</td><td class="num">$90k</td><td class="num">$95k</td></tr><tr class="total"><td style="font-weight:bold;">Net Income</td><td class="num" style="font-weight:bold;">$70k</td><td class="num" style="font-weight:bold;">$90k</td><td class="num" style="font-weight:bold;">$100k</td><td class="num" style="font-weight:bold;">$115k</td></tr></table>`
        },
        {
            name: 'Project Roadmap',
            previewHTML: `<table class="mini-table"><tr style="background:#333; color:#fff;"><th style="border:1px solid #555;">Phase</th><th style="border:1px solid #555;">Status</th></tr><tr><td style="border:1px solid #ccc;">Design</td><td style="border:1px solid #ccc;">Done</td></tr></table>`,
            insertHTML: `<table class="pub-table-roadmap" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;" contenteditable="true"><tr style="background:#333; color:white;"><th>Phase</th><th>Task</th><th>Owner</th><th>Status</th></tr><tr><td style="font-weight:bold;">1. Discovery</td><td>Market Research</td><td>Alice</td><td style="color:green; font-weight:bold;">Complete</td></tr><tr><td style="font-weight:bold;">2. Design</td><td>UI Mockups</td><td>Bob</td><td style="color:orange; font-weight:bold;">In Progress</td></tr></table>`
        },
        {
            name: 'Nutrition Facts',
            previewHTML: `<table class="mini-table" style="border:2px solid #000;"><tr><th style="border-bottom:4px solid #000; font-size:8px;">Nutrition</th></tr><tr><td>Calories 200</td></tr></table>`,
            insertHTML: `<table style="width: 100%; border-collapse: collapse; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; border: 4px solid black;" contenteditable="true"><tr><th style="border-bottom: 8px solid black; font-size: 24px; font-weight: 900; padding: 4px; text-align: left;">Nutrition Facts</th></tr><tr><td style="border-bottom: 1px solid black; padding: 4px;"><b>Serving Size</b> 1 cup (228g)</td></tr><tr><td style="border-bottom: 4px solid black; padding: 4px; font-size: 18px;"><b>Calories</b> 280</td></tr><tr><td style="border-bottom: 1px solid black; padding: 4px; text-align: right;"><b>% Daily Value*</b></td></tr><tr><td style="border-bottom: 1px solid black; padding: 4px;"><b>Total Fat</b> 9g <span style="float:right; font-weight:bold;">12%</span></td></tr></table>`
        }
    ];

    // 3. Define 30 Color Themes
    const colorThemes = [
        { id: 'zebra', name: 'Open Publisher', thBg: 'var(--ui-theme-color)', thColor: '#fff', bColor: '#ccc', thBColor: 'var(--ui-theme-dark)', altBg: '#f3f2f1' },
        { id: 'blue', name: 'Corporate Blue', thBg: '#2a5699', thColor: '#fff', bColor: '#c4d4e8', thBColor: '#1e3f70', altBg: '#f0f4fa' },
        { id: 'dark', name: 'Dark Elegant', thBg: '#2c3e50', thColor: '#fff', bColor: '#bdc3c7', thBColor: '#1a252f', altBg: '#f8f9fa' },
        { id: 'crimson', name: 'Crimson Red', thBg: '#c62828', thColor: '#fff', bColor: '#ffcdd2', thBColor: '#b71c1c', altBg: '#ffebee' },
        { id: 'sunset', name: 'Sunset Orange', thBg: '#ef6c00', thColor: '#fff', bColor: '#ffe0b2', thBColor: '#e65100', altBg: '#fff3e0' },
        { id: 'sunflower', name: 'Sunflower Yellow', thBg: '#fbc02d', thColor: '#000', bColor: '#fff9c4', thBColor: '#f57f17', altBg: '#fffde7' },
        { id: 'forest', name: 'Forest Green', thBg: '#2e7d32', thColor: '#fff', bColor: '#c8e6c9', thBColor: '#1b5e20', altBg: '#e8f5e9' },
        { id: 'ocean', name: 'Ocean Teal', thBg: '#00838f', thColor: '#fff', bColor: '#b2ebf2', thBColor: '#006064', altBg: '#e0f7fa' },
        { id: 'royal', name: 'Royal Purple', thBg: '#6a1b9a', thColor: '#fff', bColor: '#e1bee7', thBColor: '#4a148c', altBg: '#f3e5f5' },
        { id: 'magenta', name: 'Deep Magenta', thBg: '#ad1457', thColor: '#fff', bColor: '#f8bbd0', thBColor: '#880e4f', altBg: '#fce4ec' },
        { id: 'slate', name: 'Slate Gray', thBg: '#455a64', thColor: '#fff', bColor: '#cfd8dc', thBColor: '#263238', altBg: '#eceff1' },
        { id: 'choco', name: 'Chocolate Brown', thBg: '#4e342e', thColor: '#fff', bColor: '#d7ccc8', thBColor: '#3e2723', altBg: '#efebe9' },
        { id: 'navy', name: 'Midnight Navy', thBg: '#1a237e', thColor: '#fff', bColor: '#c5cae9', thBColor: '#1a237e', altBg: '#e8eaf6' },
        { id: 'pink', name: 'Vibrant Pink', thBg: '#d81b60', thColor: '#fff', bColor: '#f8bbd0', thBColor: '#c2185b', altBg: '#fce4ec' },
        { id: 'mint', name: 'Mint Fresh', thBg: '#00bfa5', thColor: '#000', bColor: '#b2dfdb', thBColor: '#00897b', altBg: '#e0f2f1' },
        { id: 'indigo', name: 'Indigo Pro', thBg: '#283593', thColor: '#fff', bColor: '#c5cae9', thBColor: '#1a237e', altBg: '#e8eaf6' },
        { id: 'cyber', name: 'Cyber Terminal', thBg: '#000', thColor: '#0f0', bColor: '#0f0', thBColor: '#0f0', altBg: '#111', tdColor: '#0f0' },
        { id: 'blueprint', name: 'Blueprint', thBg: '#0d47a1', thColor: '#fff', bColor: '#8c9eff', thBColor: '#e8eaf6', altBg: '#1a237e', tdColor: '#fff' },
        { id: 'contrast', name: 'High Contrast', thBg: '#000', thColor: '#fff', bColor: '#000', thBColor: '#000', altBg: '#fff' },
        { id: 'pastel', name: 'Soft Pastel', thBg: '#f48fb1', thColor: '#fff', bColor: '#f8bbd0', thBColor: '#f06292', altBg: '#fce4ec' },
        { id: 'neon', name: 'Neon Cyan', thBg: '#00e5ff', thColor: '#000', bColor: '#00e5ff', thBColor: '#00b8d4', altBg: '#e0ffff' },
        { id: 'lavender', name: 'Lavender Dream', thBg: '#7e57c2', thColor: '#fff', bColor: '#d1c4e9', thBColor: '#512da8', altBg: '#ede7f6' },
        { id: 'wine', name: 'Ruby Wine', thBg: '#880e4f', thColor: '#fff', bColor: '#f8bbd0', thBColor: '#4a0029', altBg: '#fce4ec' },
        { id: 'autumn', name: 'Autumn Gold', thBg: '#f57f17', thColor: '#fff', bColor: '#fff59d', thBColor: '#f57f17', altBg: '#fffde7' },
        { id: 'aqua', name: 'Marine Aqua', thBg: '#006064', thColor: '#fff', bColor: '#b2ebf2', thBColor: '#006064', altBg: '#e0f7fa' },
        { id: 'emerald', name: 'Emerald City', thBg: '#00695c', thColor: '#fff', bColor: '#b2dfdb', thBColor: '#004d40', altBg: '#e0f2f1' },
        { id: 'berry', name: 'Berry Purple', thBg: '#8e24aa', thColor: '#fff', bColor: '#e1bee7', thBColor: '#6a1b9a', altBg: '#f3e5f5' },
        { id: 'espresso', name: 'Espresso', thBg: '#3e2723', thColor: '#fff', bColor: '#d7ccc8', thBColor: '#3e2723', altBg: '#efebe9' },
        { id: 'steel', name: 'Steel Blue', thBg: '#37474f', thColor: '#fff', bColor: '#cfd8dc', thBColor: '#263238', altBg: '#eceff1' },
        { id: 'sand', name: 'Desert Sand', thBg: '#8d6e63', thColor: '#fff', bColor: '#d7ccc8', thBColor: '#5d4037', altBg: '#efebe9' }
    ];

    // 4. Generate the 90 Style Variants (Classic, Rounded, Ghost)
    const dynamicTemplates = [];
    colorThemes.forEach(t => {
        // --- Variant 1: Classic Grid ---
        cssRules += `
            .pt-c-${t.id} th { background: ${t.thBg}; color: ${t.thColor}; border: 1px solid ${t.thBColor}; padding: 6px; text-align: left; }
            .pt-c-${t.id} td { border: 1px solid ${t.bColor}; padding: 6px; color: ${t.tdColor || 'inherit'}; }
            .pt-c-${t.id} tr:nth-child(even) td { background: ${t.altBg}; }
        `;
        dynamicTemplates.push({
            name: `${t.name} (Grid)`,
            previewHTML: `<table class="mini-table" style="border:none;"><tr style="background:${t.thBg}; color:${t.thColor};"><th style="border:1px solid ${t.thBColor};">C1</th><th style="border:1px solid ${t.thBColor};">C2</th></tr><tr><td style="border:1px solid ${t.bColor};">A</td><td style="border:1px solid ${t.bColor};">B</td></tr><tr style="background:${t.altBg};"><td style="border:1px solid ${t.bColor};">C</td><td style="border:1px solid ${t.bColor};">D</td></tr></table>`,
            insertHTML: `<table class="pt-c-${t.id}" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;" contenteditable="true"><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr><tr><td>Row 1 Data</td><td>Row 1 Data</td><td>Row 1 Data</td></tr><tr><td>Row 2 Data</td><td>Row 2 Data</td><td>Row 2 Data</td></tr><tr><td>Row 3 Data</td><td>Row 3 Data</td><td>Row 3 Data</td></tr></table>`
        });

        // --- Variant 2: Modern SaaS Rounded (3x Radius: 24px) ---
        cssRules += `
            .pt-r-${t.id} { border-collapse: separate; border-spacing: 0; border: 1px solid ${t.bColor}; border-radius: 24px; overflow: hidden; }
            .pt-r-${t.id} th { background: ${t.thBg}; color: ${t.thColor}; border-bottom: 1px solid ${t.bColor}; padding: 8px; text-align: left; font-weight: bold; }
            .pt-r-${t.id} td { border-bottom: 1px solid ${t.bColor}; padding: 8px; color: ${t.tdColor || 'inherit'}; }
            .pt-r-${t.id} tr:last-child td { border-bottom: none; }
            .pt-r-${t.id} tr:nth-child(even) td { background: ${t.altBg === 'transparent' ? '#f9f9f9' : t.altBg}; }
        `;
        dynamicTemplates.push({
            name: `${t.name} (Rounded)`,
            previewHTML: `<table class="mini-table" style="border:1px solid ${t.bColor}; border-radius:12px; overflow:hidden;"><tr style="background:${t.thBg}; color:${t.thColor};"><th style="border-bottom:1px solid ${t.bColor};">C1</th><th style="border-bottom:1px solid ${t.bColor};">C2</th></tr><tr><td style="border-bottom:1px solid ${t.bColor};">A</td><td style="border-bottom:1px solid ${t.bColor};">B</td></tr><tr style="background:${t.altBg === 'transparent' ? '#f9f9f9' : t.altBg};"><td style="border:none;">C</td><td style="border:none;">D</td></tr></table>`,
            insertHTML: `<table class="pt-r-${t.id}" style="width: 100%; font-family: Arial, sans-serif; font-size: 14px;" contenteditable="true"><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr><tr><td>Row 1 Data</td><td>Row 1 Data</td><td>Row 1 Data</td></tr><tr><td>Row 2 Data</td><td>Row 2 Data</td><td>Row 2 Data</td></tr><tr><td>Row 3 Data</td><td>Row 3 Data</td><td>Row 3 Data</td></tr></table>`
        });

        // --- Variant 3: Ghost / Minimal ---
        cssRules += `
            .pt-m-${t.id} th { background: transparent; color: ${t.thBg}; border-bottom: 3px solid ${t.thBg}; padding: 6px; text-align: left; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
            .pt-m-${t.id} td { border-bottom: 1px solid ${t.bColor}; padding: 8px; color: ${t.tdColor || 'inherit'}; }
            .pt-m-${t.id} tr:last-child td { border-bottom: 2px solid ${t.thBg}; }
        `;
        dynamicTemplates.push({
            name: `${t.name} (Ghost)`,
            previewHTML: `<table class="mini-table" style="border:none;"><tr><th style="border:none; border-bottom:2px solid ${t.thBg}; color:${t.thBg};">C1</th><th style="border:none; border-bottom:2px solid ${t.thBg}; color:${t.thBg};">C2</th></tr><tr><td style="border:none; border-bottom:1px solid ${t.bColor};">A</td><td style="border:none; border-bottom:1px solid ${t.bColor};">B</td></tr><tr><td style="border:none; border-bottom:2px solid ${t.thBg};">C</td><td style="border:none; border-bottom:2px solid ${t.thBg};">D</td></tr></table>`,
            insertHTML: `<table class="pt-m-${t.id}" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;" contenteditable="true"><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr><tr><td>Row 1 Data</td><td>Row 1 Data</td><td>Row 1 Data</td></tr><tr><td>Row 2 Data</td><td>Row 2 Data</td><td>Row 2 Data</td></tr><tr><td>Row 3 Data</td><td>Row 3 Data</td><td>Row 3 Data</td></tr></table>`
        });
    });

    // Finalize CSS and append to document
    style.innerHTML += cssRules;
    document.head.appendChild(style);

    // Merge structural + dynamic themes (100 Total!)
    window.tableTemplatesData = [...structuralTemplates, ...dynamicTemplates];

    // 5. Trigger the Native DialogSystem Window

    // 6. Handle the Click -> Insert -> Close Pipeline

    // 7. Inject the Ribbon Button directly into the "Tables" group
    setTimeout(() => {
        const insertRibbon = document.getElementById('ribbon-insert');
        if (insertRibbon) {
            // FIX: Removed all layout hacks! Pure native .tool-btn styling with your exact span.
            const buttonHTML = `
                <div class="tool-btn" onclick="openTableTemplatesModal()" title="Styled Table Templates">
                    <div style="position:relative; display:flex; justify-content:center; align-items:center; width:26px; height:22px;">
                        <i class="fas fa-table" style="font-size: 24px; color: var(--ui-theme-dark); margin:0;"></i>
                        <i class="fas fa-pen" style="font-size: 11px; position:absolute; bottom: -5px; right: -6px; color: var(--ui-theme-dark); text-shadow: 1px 1px 0px var(--ribbon-bg, #f3f2f1), -1px -1px 0px var(--ribbon-bg, #f3f2f1), 1px -1px 0px var(--ribbon-bg, #f3f2f1), -1px 1px 0px var(--ribbon-bg, #f3f2f1); margin:0;"></i>
                    </div>
                    <span style="line-height:1.1; text-align:center;">Styled<br>Templates</span>
                </div>
            `;
            
            const groups = insertRibbon.querySelectorAll('.group');
            let tableGroup = Array.from(groups).find(g => g.querySelector('.group-label')?.innerText === 'Tables');
            
            if (tableGroup) {
                // Safely inject it right before the "Tables" label text at the bottom
                const label = tableGroup.querySelector('.group-label');
                if(label) label.insertAdjacentHTML('beforebegin', buttonHTML);
            } else {
                console.warn("Could not find the 'Tables' group. Appending safely to the end.");
                const newGroup = document.createElement('div');
                newGroup.className = 'group';
                newGroup.innerHTML = buttonHTML + '<div class="group-label">Tables</div>';
                insertRibbon.appendChild(newGroup);
            }
        }
    }, 1500);
/* =========================================================================
   V95.0 - THE DEFINITIVE CROP ANCHOR FIX
   (REPLACEMENT) Includes both MouseDown and MouseMove to fix the NaNpx bug
   ========================================================================= */
;(function installDefinitiveCropFix() {
    console.log("🛠️ V95.0 Definitive Crop Anchor Fix initializing...");

    // --- 1. MOUSE DOWN: Capture the starting coordinates of the image! ---
    window.handleMouseDown = function(e) {
        if(e.target === paper || e.target.classList.contains('margin-guides') || e.target.id === 'viewport' || e.target.classList.contains('viewport')) {
            if(state.shapeEditMode) window.exitShapeEditMode();
            if(typeof window.deselect === 'function') window.deselect();
            state.dragMode = 'marquee';
            state.dragData = { startX: e.clientX, startY: e.clientY };
            if(!document.getElementById('marquee-box')) {
                const box = document.createElement('div');
                box.id = 'marquee-box';
                box.style.cssText = 'position:fixed; border:1px solid rgba(0,118,112,0.8); background:rgba(0,118,112,0.2); z-index:9999; pointer-events:none;';
                document.body.appendChild(box);
            }
            return;
        }

        if(state.shapeEditMode && e.target.classList.contains('shape-edit-handle')) {
            state.dragMode = 'shape-point';
            const idx = parseInt(e.target.dataset.index);
            state.dragData = { 
                index: idx, 
                startX: e.clientX, 
                startY: e.clientY, 
                startPtX: window._shapeEditContext.points[idx].x,
                startPtY: window._shapeEditContext.points[idx].y,
                handle: e.target 
            };
            e.preventDefault();
            return;
        }


        if(state.cropMode && state.selectedEl) {
            if(e.target.classList.contains('resize-handle')) {
                state.dragMode = 'resize';
                
                // ✨ THE FIX: We MUST capture the image's starting Left & Top here!
                const img = state.selectedEl.querySelector('img');
                const startImgLeft = img ? (parseFloat(img.style.left) || 0) : 0;
                const startImgTop = img ? (parseFloat(img.style.top) || 0) : 0;

                state.dragData = {
                    dir: e.target.dataset.dir, startX: e.clientX, startY: e.clientY,
                    w: parseFloat(state.selectedEl.style.width) || state.selectedEl.offsetWidth, 
                    h: parseFloat(state.selectedEl.style.height) || state.selectedEl.offsetHeight,
                    l: parseFloat(state.selectedEl.style.left) || state.selectedEl.offsetLeft, 
                    t: parseFloat(state.selectedEl.style.top) || state.selectedEl.offsetTop,
                    scaleX: parseFloat(state.selectedEl.getAttribute('data-scaleX')) || 1,
                    scaleY: parseFloat(state.selectedEl.getAttribute('data-scaleY')) || 1,
                    imgL: startImgLeft, // ✨ Saved to memory
                    imgT: startImgTop   // ✨ Saved to memory
                };
                e.preventDefault(); return;
            }
            const targetImg = e.target.tagName === 'IMG' ? e.target : e.target.querySelector('img');
            if(targetImg && e.target.closest('.pub-element') === state.selectedEl && !e.target.classList.contains('resize-handle')) {
                state.dragMode = 'pan-image';
                state.dragData = { startX: e.clientX, startY: e.clientY, l: parseFloat(targetImg.style.left) || 0, t: parseFloat(targetImg.style.top) || 0 };
                e.preventDefault(); return;
            }
            if(!e.target.closest('.pub-element.cropping')) if(typeof toggleCrop === 'function') toggleCrop();
        }

        if(e.target.classList.contains('rotate-handle') || e.target.classList.contains('resize-handle')) {
            if(e.target.classList.contains('rotate-handle')) {
                state.dragMode = 'rotate';
                if (state.multiSelected && state.multiSelected.length > 1) {
                    let minL = Infinity, maxR = -Infinity, minT = Infinity, maxB = -Infinity;
                    let minSx = Infinity, maxSx = -Infinity, minSy = Infinity, maxSy = -Infinity;
                    state.multiSelected.forEach(el => {
                        const l = parseFloat(el.style.left) || el.offsetLeft;
                        const t = parseFloat(el.style.top) || el.offsetTop;
                        const w = el.offsetWidth, h = el.offsetHeight;
                        if(l < minL) minL = l; if(l + w > maxR) maxR = l + w;
                        if(t < minT) minT = t; if(t + h > maxB) maxB = t + h;
                        const r = el.getBoundingClientRect();
                        if(r.left < minSx) minSx = r.left; if(r.right > maxSx) maxSx = r.right;
                        if(r.top < minSy) minSy = r.top; if(r.bottom > maxSy) maxSy = r.bottom;
                    });
                    const cx = minL + (maxR - minL) / 2, cy = minT + (maxB - minT) / 2;
                    const screenCx = minSx + (maxSx - minSx) / 2, screenCy = minSy + (maxSy - minSy) / 2;
                    const hr = e.target.getBoundingClientRect();
                    state.dragData = { 
                        cx: cx, cy: cy, screenCx: screenCx, screenCy: screenCy,
                        startAngle: Math.atan2(hr.top + hr.height/2 - screenCy, hr.left + hr.width/2 - screenCx),
                        items: state.multiSelected.map(el => {
                            const style = window.getComputedStyle(el);
                            const rot = style.transform !== 'none' ? Math.atan2(style.transform.split('(')[1].split(')')[0].split(',')[1], style.transform.split('(')[1].split(')')[0].split(',')[0]) * (180/Math.PI) : 0;
                            return { el: el, w: el.offsetWidth, h: el.offsetHeight, dx: ((parseFloat(el.style.left) || el.offsetLeft) + el.offsetWidth/2) - cx, dy: ((parseFloat(el.style.top) || el.offsetTop) + el.offsetHeight/2) - cy, origRot: rot };
                        })
                    };
                } else {
                    const rect = state.selectedEl.getBoundingClientRect();
                    state.dragData = { cx: rect.left + rect.width/2, cy: rect.top + rect.height/2 };
                }
            } else {
                state.dragMode = 'resize';
                state.dragData = {
                    dir: e.target.dataset.dir, startX: e.clientX, startY: e.clientY,
                    w: parseFloat(state.selectedEl.style.width) || state.selectedEl.offsetWidth, 
                    h: parseFloat(state.selectedEl.style.height) || state.selectedEl.offsetHeight,
                    l: parseFloat(state.selectedEl.style.left) || state.selectedEl.offsetLeft, 
                    t: parseFloat(state.selectedEl.style.top) || state.selectedEl.offsetTop,
                    scaleX: parseFloat(state.selectedEl.getAttribute('data-scaleX')) || 1,
                    scaleY: parseFloat(state.selectedEl.getAttribute('data-scaleY')) || 1
                };
            }
            e.preventDefault(); return;
        }

        const el = e.target.closest('.pub-element');
        if(el) {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault(); e.stopImmediatePropagation(); 
                state.multiSelected = state.multiSelected || [];
                if (state.selectedEl && state.multiSelected.length === 0) {
                    state.multiSelected.push(state.selectedEl); state.selectedEl = null;
                }
                if (state.multiSelected.includes(el)) {
                    state.multiSelected = state.multiSelected.filter(m => m !== el); el.classList.remove('selected');
                } else {
                    state.multiSelected.push(el); el.classList.add('selected');
                }
                if (state.multiSelected.length === 0) { if(typeof window.deselect === 'function') window.deselect(); } 
                else if (state.multiSelected.length === 1) { if(typeof window.selectElement === 'function') window.selectElement(state.multiSelected[0]); state.multiSelected = []; } 
                else {
                    if(document.getElementById('status-msg')) document.getElementById('status-msg').innerText = state.multiSelected.length + " Elements Selected";
                    if(typeof floatToolbar !== 'undefined' && floatToolbar) { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
                }
                return;
            }

            const isMulti = state.multiSelected && state.multiSelected.includes(el);
            if (!isMulti) {
                if(state.selectedEl !== el && typeof window.selectElement === 'function') window.selectElement(el);
                if(state.multiSelected && state.multiSelected.length > 0) { state.multiSelected.forEach(m => m.classList.remove('selected')); state.multiSelected = []; }
            }

            if(el.querySelector('svg') || el.querySelector('img') || el.getAttribute('data-type') === 'shape') {
                state.dragMode = 'drag';
                state.dragData = { startX: e.clientX, startY: e.clientY, l: parseFloat(el.style.left), t: parseFloat(el.style.top) };
                if(isMulti) state.dragData.multi = state.multiSelected.map(m => ({ el: m, l: parseFloat(m.style.left), t: parseFloat(m.style.top) }));
                e.preventDefault(); return;
            }

            const targetNode = e.target.nodeType === 3 ? e.target.parentNode : e.target;
            const editable = targetNode.closest('[contenteditable="true"]');
            const targetIsText = !!editable;
            const rect = el.getBoundingClientRect(), edgeSize = 15;
            const nearEdge = (e.clientX < rect.left + edgeSize) || (e.clientX > rect.right - edgeSize) || (e.clientY < rect.top + edgeSize) || (e.clientY > rect.bottom - edgeSize);
            const activeEl = document.activeElement, isEditingText = activeEl && el.contains(activeEl) && (activeEl.isContentEditable);
            
            if (targetIsText && !nearEdge) {
                // Clicking directly on the text: force focus for Firefox to allow native selection to start immediately
                if (editable && document.activeElement !== editable) {
                    editable.focus();
                }
                // Let native selection/cursor placement happen
                return;
            }

            if (nearEdge || !isEditingText) {
                state.dragMode = 'drag';
                state.dragData = { startX: e.clientX, startY: e.clientY, l: parseFloat(el.style.left), t: parseFloat(el.style.top) };
                if(isMulti) state.dragData.multi = state.multiSelected.map(m => ({ el: m, l: parseFloat(m.style.left), t: parseFloat(m.style.top) }));
                if(!isEditingText) e.preventDefault(); 
            }
        }
    };

    // --- 2. MOUSE MOVE: Perfectly mapped counter-translation ---
    window.handleMouseMove = function(e) {
        const cd = document.getElementById('coord-display'); 
        if(cd) cd.innerText = `X: ${e.clientX} | Y: ${e.clientY}`;
        
        if(!state.dragMode && !state.cropMode) {
            const el = e.target.closest('.pub-element');
            if(el) {
                const isShape = el.querySelector('img') || el.querySelector('svg') || el.getAttribute('data-type') === 'shape';
                const rect = el.getBoundingClientRect();
                if (isShape) { el.style.cursor = 'move'; } 
                else { const edgeSize = 15; el.style.cursor = ((e.clientX < rect.left + edgeSize) || (e.clientX > rect.right - edgeSize) || (e.clientY < rect.top + edgeSize) || (e.clientY > rect.bottom - edgeSize)) ? 'move' : 'text'; }
            }
        }
        
        if(!state.dragMode) return;
        
        if(state.dragMode === 'marquee') {
            const box = document.getElementById('marquee-box');
            if(box) {
                const paperRect = paper.getBoundingClientRect();
                const clampedX = Math.max(paperRect.left, Math.min(e.clientX, paperRect.right));
                const clampedY = Math.max(paperRect.top, Math.min(e.clientY, paperRect.bottom));
                const startX = Math.max(paperRect.left, Math.min(state.dragData.startX, paperRect.right));
                const startY = Math.max(paperRect.top, Math.min(state.dragData.startY, paperRect.bottom));
                
                box.style.left = Math.min(clampedX, startX) + 'px'; box.style.top = Math.min(clampedY, startY) + 'px';
                box.style.width = Math.abs(clampedX - startX) + 'px'; box.style.height = Math.abs(clampedY - startY) + 'px';
            }
            return;
        }
        
        if(!state.selectedEl && (!state.multiSelected || state.multiSelected.length === 0)) return;
        
        const zoom = state.zoom || 1;
        const dx = (e.clientX - state.dragData.startX) / zoom;
        const dy = (e.clientY - state.dragData.startY) / zoom;
        
        if(state.dragMode === 'shape-point') {
            const w = state.selectedEl.offsetWidth;
            const h = state.selectedEl.offsetHeight;
            const ptIndex = state.dragData.index;
            const pt = window._shapeEditContext.points[ptIndex];
            
            if (window._shapeEditContext.type === 'clip-path') {
                const pX = (dx / w) * 100;
                const pY = (dy / h) * 100;
                pt.x = Math.max(0, Math.min(100, state.dragData.startPtX + pX));
                pt.y = Math.max(0, Math.min(100, state.dragData.startPtY + pY));
                
                const newPoints = window._shapeEditContext.points.map(p => `${p.x}% ${p.y}%`).join(', ');
                window._shapeEditContext.contentDiv.style.clipPath = `polygon(${newPoints})`;
            } else if (window._shapeEditContext.type === 'svg-polygon') {
                const pX = (dx / w) * 100;
                const pY = (dy / h) * 100;
                pt.x = state.dragData.startPtX + pX;
                pt.y = state.dragData.startPtY + pY;
                
                const newPoints = window._shapeEditContext.points.map(p => `${p.x},${p.y}`).join(' ');
                window._shapeEditContext.svgPolygon.setAttribute('points', newPoints);
            }
            
            state.dragData.handle.style.left = pt.x + '%';
            state.dragData.handle.style.top = pt.y + '%';
            return;
        }
        else if(state.dragMode === 'drag') {
            if(state.dragData.multi && state.dragData.multi.length > 0) { 
                state.dragData.multi.forEach(item => { 
                    const s = window.applySnapping(item.l + dx, item.t + dy, item.el.offsetWidth, item.el.offsetHeight, item.el, e);
                    item.el.style.left = s.x + 'px'; item.el.style.top = s.y + 'px'; 
                }); 
            } else { 
                const s = window.applySnapping(state.dragData.l + dx, state.dragData.t + dy, state.selectedEl.offsetWidth, state.selectedEl.offsetHeight, state.selectedEl, e);
                state.selectedEl.style.left = s.x + 'px'; state.selectedEl.style.top = s.y + 'px'; 
            }
            if(typeof floatToolbar !== 'undefined' && floatToolbar) { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
        }
        else if(state.dragMode === 'pan-image') {
            const img = state.selectedEl.querySelector('img'); 
            img.style.left = (state.dragData.l + dx) + 'px'; img.style.top = (state.dragData.t + dy) + 'px';
        }
        else if(state.dragMode === 'rotate') {
            if (state.multiSelected && state.multiSelected.length > 1) {
                const d = state.dragData;
                const currentAngle = Math.atan2(e.clientY - d.screenCy, e.clientX - d.screenCx);
                const deltaRad = currentAngle - d.startAngle;
                const deltaDeg = deltaRad * (180 / Math.PI);
                const cosT = Math.cos(deltaRad); const sinT = Math.sin(deltaRad);
                
                d.items.forEach(item => {
                    const new_dx = item.dx * cosT - item.dy * sinT;
                    const new_dy = item.dx * sinT + item.dy * cosT;
                    item.el.style.left = (d.cx + new_dx - item.w/2) + 'px';
                    item.el.style.top = (d.cy + new_dy - item.h/2) + 'px';
                    item.el.style.transform = `rotate(${item.origRot + deltaDeg}deg)`;
                });
            } else {
                const angle = Math.atan2(e.clientY - state.dragData.cy, e.clientX - state.dragData.cx) * (180/Math.PI);
                state.selectedEl.style.transform = `rotate(${angle + 90}deg)`;
            }
        }
        else if(state.dragMode === 'resize') {
            const d = state.dragData; 
            const sX = Math.abs(d.scaleX) || 1;
            const sY = Math.abs(d.scaleY) || 1;

            let rawW = d.w, rawH = d.h, newL = d.l, newT = d.t;
            let imgDx = 0, imgDy = 0;
            
            if (e.ctrlKey || e.metaKey) {
                // Center Resize Shifts
                if (d.dir.includes('e')) { rawW = d.w + 2 * dx; newL = d.l - dx; }
                else if (d.dir.includes('w')) { rawW = d.w - 2 * dx; newL = d.l + dx; if (state.cropMode) imgDx = -(dx / sX); }
                
                if (d.dir.includes('s')) { rawH = d.h + 2 * dy; newT = d.t - dy; }
                else if (d.dir.includes('n')) { rawH = d.h - 2 * dy; newT = d.t + dy; if (state.cropMode) imgDy = -(dy / sY); }
            } else {
                // Container Width & Left Origin Shifts
                if (d.dir.includes('e')) {
                    rawW = d.w + dx; 
                } else if (d.dir.includes('w')) { 
                    rawW = d.w - dx; 
                    newL = d.l + dx; 
                    // Divides the screen delta by the image's scale so it perfectly compensates
                    if (state.cropMode) imgDx = -(dx / sX); 
                }
                
                // Container Height & Top Origin Shifts
                if (d.dir.includes('s')) {
                    rawH = d.h + dy; 
                } else if (d.dir.includes('n')) { 
                    rawH = d.h - dy; 
                    newT = d.t + dy; 
                    if (state.cropMode) imgDy = -(dy / sY); 
                }
            }

            // Aspect Ratio Lock (Standard Resize Only)
            if ((e.shiftKey || state.selectedEl.getAttribute('data-aspect-lock') === 'true') && !state.cropMode) {
                const safeW = d.w || 1; const safeH = d.h || 1;
                const scaleX = Math.abs(rawW / safeW), scaleY = Math.abs(rawH / safeH);
                let dominantScale = 1;
                if (d.dir === 'e' || d.dir === 'w') dominantScale = scaleX;
                else if (d.dir === 'n' || d.dir === 's') dominantScale = scaleY;
                else dominantScale = Math.max(scaleX, scaleY);
                rawW = (Math.sign(rawW) || 1) * Math.abs(safeW) * dominantScale;
                rawH = (Math.sign(rawH) || 1) * Math.abs(safeH) * dominantScale;
                
                if (e.ctrlKey || e.metaKey) {
                    newL = d.l + (d.w - rawW) / 2;
                    newT = d.t + (d.h - rawH) / 2;
                } else {
                    if (d.dir.includes('w')) newL = (d.l + d.w) - rawW;
                    if (d.dir.includes('n')) newT = (d.t + d.h) - rawH;
                }
            }

            if (state.cropMode) {
                const img = state.selectedEl.querySelector('img');
                if (img) {
                    // ✨ THE FIX: We use the saved d.imgL so it adds the delta safely without returning NaN!
                    if (imgDx !== 0 && d.imgL !== undefined) img.style.left = (d.imgL + imgDx) + 'px';
                    if (imgDy !== 0 && d.imgT !== undefined) img.style.top = (d.imgT + imgDy) + 'px';
                }
                
                if (rawW > 10) { state.selectedEl.style.width = rawW + 'px'; state.selectedEl.style.left = newL + 'px'; }
                if (rawH > 10) { state.selectedEl.style.height = rawH + 'px'; state.selectedEl.style.top = newT + 'px'; }
            } else {
                let finalScaleX = d.scaleX, finalScaleY = d.scaleY;
                if (rawW < 0) { rawW = Math.abs(rawW); if (d.dir.includes('e')) newL = d.l - rawW; finalScaleX = -1 * d.scaleX; } 
                if (rawH < 0) { rawH = Math.abs(rawH); if (d.dir.includes('s')) newT = d.t - rawH; finalScaleY = -1 * d.scaleY; }
                
                if (rawW > 10) { state.selectedEl.style.width = rawW + 'px'; state.selectedEl.style.left = newL + 'px'; }
                if (rawH > 10) { state.selectedEl.style.height = rawH + 'px'; state.selectedEl.style.top = newT + 'px'; }

                const img = state.selectedEl.querySelector('img');
                if (img && d.imgW !== undefined) {
                    const ratioX = rawW / Math.abs(d.w), ratioY = rawH / Math.abs(d.h);
                    img.style.width = (d.imgW * ratioX) + 'px'; img.style.height = (d.imgH * ratioY) + 'px';
                    img.style.left = (d.imgL * ratioX) + 'px'; img.style.top = (d.imgT * ratioY) + 'px';
                }
                
                const _contentEl = state.selectedEl.querySelector('.element-content');
            let _t3d = '';
            if (_contentEl) {
                const rx = _contentEl.getAttribute('data-3d-rx') || 0;
                const ry = _contentEl.getAttribute('data-3d-ry') || 0;
                const rz = _contentEl.getAttribute('data-3d-rz') || 0;
                const p = _contentEl.getAttribute('data-3d-p') || 800;
                if (rx != 0 || ry != 0 || rz != 0) _t3d = ` perspective(${p}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
                _contentEl.style.transform = `scale(${finalScaleX}, ${finalScaleY})${_t3d}`;
            }
                state.selectedEl.setAttribute('data-scaleX', finalScaleX); state.selectedEl.setAttribute('data-scaleY', finalScaleY);
                if(typeof syncWordArt === 'function' && state.selectedEl.querySelector('.wa-text')) syncWordArt(state.selectedEl);
            }
            if(typeof floatToolbar !== 'undefined' && floatToolbar) { floatToolbar.style.display = 'none'; const _wa = document.getElementById('wa-float-toolbar'); if(_wa) _wa.style.display = 'none'; }
        }
    };

    console.log("✅ Definitive Crop Anchor Fix installed.");
})();
})();


(function installGraphicsManagerSidebar() {
    document.getElementById('op-graphics-sidebar')?.remove();

    const panel = document.createElement('div');
    panel.id = 'op-graphics-sidebar';
    panel.className = 'sidebar-panel op-sidebar';
    panel.innerHTML = `<div class="op-sidebar-header">
            <span class="op-sidebar-title">Graphics Manager</span>
            <div class="op-sidebar-top-btns">
                <button class="custom-dialog-close" onclick="document.getElementById('op-graphics-sidebar').classList.remove('visible')"><i class="fas fa-times"></i></button>
            </div>
        </div>
        <div id="graphics-manager-results" style="padding: 15px; overflow-y:auto; height:calc(100% - 50px); background:transparent;"></div>
    `;
    let workspace = document.querySelector('.workspace');
    if (workspace) workspace.appendChild(panel);
    else document.body.appendChild(panel);
})();

// ==========================================
// CORE ENGINE PERFORMANCE PATCHES
// ==========================================

// 2. Hijack the heavy history serializer (FIXED: Debounce & Spam Filter)
const originalPushHistory = pushHistory;
let historyTimer;
let lastSavedHistoryState = "";

pushHistory = function() {
    // 1. Clear the timer so dragging doesn't trigger 100 saves
    clearTimeout(historyTimer);
    
    // 2. Wait 250ms after the user finishes dragging/typing to save
    historyTimer = setTimeout(() => {
        
        // 3. SPAM FILTER: Only save if the canvas HTML actually changed!
        const currentState = document.getElementById('paper') ? document.getElementById('paper').innerHTML : "";
        
        if (currentState !== lastSavedHistoryState) {
            originalPushHistory();
            lastSavedHistoryState = currentState;
        }
    }, 250); 
};

// 3. Hijack the synchronous layout thrashing from typing
const originalForceRepaint = forceRepaint;
forceRepaint = function() {
    // Same trick. Let the UI update the text, then fix the focus a split-second later.
    setTimeout(() => {
        originalForceRepaint();
    }, 10);
};


// ==========================================
// PRINT ENGINE CROP MASK FIX
// ==========================================

const cropStyle = document.createElement('style');
cropStyle.innerHTML = `
    @media print {
        .print-crop-mask {
            overflow: hidden !important;
            clip-path: inset(0) !important;
            -webkit-clip-path: inset(0) !important;
            contain: paint !important;
        }
    }
`;
document.head.appendChild(cropStyle);

window.addEventListener('beforeprint', () => {
    const spooler = document.getElementById('op-print-spooler');
    if (spooler) {
        spooler.querySelectorAll('img').forEach(img => {
            if (img.parentElement) img.parentElement.classList.add('print-crop-mask');
        });
    }
});


// ==========================================
// AUTO-ROTATION MIXED ORIENTATION FIX
// ==========================================

// 1. Global registry to remember which pages we've already auto-fixed.
// This ensures we NEVER fight the user if they manually click the Orient button later!
window._orientedPagesRegistry = window._orientedPagesRegistry || new Set();

// --- MAIN CANVAS ENGINE ---
setInterval(() => {
    if (!state.pages || state.pages.length === 0) return;

    const currentPage = state.pages[state.currentPageIndex];
    if (!currentPage || !currentPage.id) return;
    
    // 2. If we haven't checked this specific page yet, check it!
    if (!window._orientedPagesRegistry.has(currentPage.id)) {
        window._orientedPagesRegistry.add(currentPage.id); // Lock it permanently for this session
        
        const bgEl = currentPage.elements.find(e => e.imgSrc && e.imgSrc.startsWith('data:image'));
        
        if (bgEl) {
            const img = new Image();
            img.onload = function() {
                let needsFix = false;
                
                if (img.width > img.height) { 
                    if (currentPage.width !== "1123px") {
                        currentPage.width = "1123px";
                        currentPage.height = "794px";
                        needsFix = true;
                    }
                } else { 
                    if (currentPage.width !== "794px") {
                        currentPage.width = "794px";
                        currentPage.height = "1123px";
                        needsFix = true;
                    }
                }

                if (needsFix) {
                    const paperEl = document.getElementById('paper');
                    if (paperEl) {
                        paperEl.style.width = currentPage.width;
                        paperEl.style.height = currentPage.height;
                    }
                    if (typeof window.renderPage === 'function') window.renderPage(currentPage);
                    if (typeof window.updateThumbnails === 'function') window.updateThumbnails(); 
                }
            };
            img.src = bgEl.imgSrc;
        }
    }
    // NOTE: The aggressive 50ms "Safety Catch" that was fighting your button has been removed!
}, 100);



// ==========================================
// THUMBNAIL ASPECT RATIO FIX
// ==========================================

// --- THUMBNAIL ENGINE (MutationObserver) ---
// Added a safety check to ensure it only boots up once, preventing double-bouncing!
if (!window._thumbObserverRunning) {
    const thumbObserver = new MutationObserver(() => {
        if (!state.pages || state.pages.length === 0) return;
        
        const thumbs = document.querySelectorAll('.page-thumb, .thumbnail, .thumb, .sidebar-thumb, .thumb-item');
        
        thumbs.forEach((thumbNode, index) => {
            const pageData = state.pages[index];
            if (!pageData) return;

            const pW = parseFloat(pageData.width) || 794;
            const pH = parseFloat(pageData.height) || 1123;
            const expectedRatio = `${pW} / ${pH}`;

            if (thumbNode.style.aspectRatio !== expectedRatio) {
                thumbNode.style.aspectRatio = expectedRatio;
                thumbNode.style.height = "auto";
            }

            const innerElements = thumbNode.querySelectorAll('canvas, img');
            innerElements.forEach(el => {
                if (el.style.objectFit !== "contain") {
                    el.style.width = "100%";
                    el.style.height = "100%";
                    el.style.objectFit = "contain";
                }
            });
        });
    });

    thumbObserver.observe(document.body, { childList: true, subtree: true });
    window._thumbObserverRunning = true; // Lock the observer
}

// 1. Global registry to remember which pages we've already auto-fixed.
// This ensures we NEVER fight the user if they manually click the Orient button later!
window._orientedPagesRegistry = window._orientedPagesRegistry || new Set();

// --- MAIN CANVAS ENGINE ---
setInterval(() => {
    if (!state.pages || state.pages.length === 0) return;

    const currentPage = state.pages[state.currentPageIndex];
    if (!currentPage || !currentPage.id) return;
    
    // 2. If we haven't checked this specific page yet, check it!
    if (!window._orientedPagesRegistry.has(currentPage.id)) {
        window._orientedPagesRegistry.add(currentPage.id); // Lock it permanently for this session
        
        const bgEl = currentPage.elements.find(e => e.imgSrc && e.imgSrc.startsWith('data:image'));
        
        if (bgEl) {
            const img = new Image();
            img.onload = function() {
                let needsFix = false;
                
                if (img.width > img.height) { 
                    if (currentPage.width !== "1123px") {
                        currentPage.width = "1123px";
                        currentPage.height = "794px";
                        needsFix = true;
                    }
                } else { 
                    if (currentPage.width !== "794px") {
                        currentPage.width = "794px";
                        currentPage.height = "1123px";
                        needsFix = true;
                    }
                }

                if (needsFix) {
                    const paperEl = document.getElementById('paper');
                    if (paperEl) {
                        paperEl.style.width = currentPage.width;
                        paperEl.style.height = currentPage.height;
                    }
                    if (typeof window.renderPage === 'function') window.renderPage(currentPage);
                    if (typeof window.updateThumbnails === 'function') window.updateThumbnails(); 
                }
            };
            img.src = bgEl.imgSrc;
        }
    }
    // NOTE: The aggressive 50ms "Safety Catch" that was fighting your button has been removed!
}, 100);

// --- THUMBNAIL ENGINE (MutationObserver) ---
// Added a safety check to ensure it only boots up once, preventing double-bouncing!
if (!window._thumbObserverRunning) {
    const thumbObserver = new MutationObserver(() => {
        if (!state.pages || state.pages.length === 0) return;
        
        const thumbs = document.querySelectorAll('.page-thumb, .thumbnail, .thumb, .sidebar-thumb, .thumb-item');
        
        thumbs.forEach((thumbNode, index) => {
            const pageData = state.pages[index];
            if (!pageData) return;

            const pW = parseFloat(pageData.width) || 794;
            const pH = parseFloat(pageData.height) || 1123;
            const expectedRatio = `${pW} / ${pH}`;

            if (thumbNode.style.aspectRatio !== expectedRatio) {
                thumbNode.style.aspectRatio = expectedRatio;
                thumbNode.style.height = "auto";
            }

            const innerElements = thumbNode.querySelectorAll('canvas, img');
            innerElements.forEach(el => {
                if (el.style.objectFit !== "contain") {
                    el.style.width = "100%";
                    el.style.height = "100%";
                    el.style.objectFit = "contain";
                }
            });
        });
    });

    thumbObserver.observe(document.body, { childList: true, subtree: true });
    window._thumbObserverRunning = true; // Lock the observer
}

// ==========================================
// ANTI-IFRAME HIJACK SECURITY PATCH
// ==========================================

if (window.top !== window.self) {
    if (document.referrer && document.referrer.includes("typespectrum.com")) {
      try {
        // Try to hijack the entire browser tab and redirect to your site
        window.top.location.href = "https://ywa.app";
      } catch (e) {
        // If the browser blocks the hijack, absolutely nuke the iframe content
        document.documentElement.innerHTML = `
          <head>
            <title>ERROR</title>
          </head>
          <body style="margin: 0; padding: 0; overflow: hidden;">
            <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: #e50000; color: white; z-index: 2147483647; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; font-family: system-ui, -apple-system, sans-serif; padding: 20px; box-sizing: border-box;">
              <h1 style="font-size: clamp(24px, 5vw, 48px); margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 2px;">
                ⚠️ Error ⚠️
              </h1>
              <p style="font-size: clamp(16px, 3vw, 24px); margin: 0 0 10px 0; line-height: 1.5;">
                This WebApp can not be displayed here.
              </p>
              <p style="font-size: clamp(14px, 2.5vw, 20px); margin: 0; line-height: 1.5;">
                Possible Scam site detected</strong>.<br>
                For security, Please visit ywa.app to use it.
              </p>
            </div>
          </body>
        `;
      }
    }
  }

// ==========================================
// ANTI AD-OVERLAY SECURITY PATCH
// ==========================================

// --- ANTI AD-OVERLAY (INTERSECTION OBSERVER V2) ---
document.addEventListener('DOMContentLoaded', () => {
    // Only run if we are inside an iframe
    if (window.self === window.top) return;

    try {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // If the element is intersecting the viewport but is NOT visible (e.g. occluded by a parent iframe's overlay ad)
                if (entry.isIntersecting && !entry.isVisible) {
                    if (!window.hasShownOverlayWarning) {
                        window.hasShownOverlayWarning = true;
                        DialogSystem.show('Security Warning', '<div style="text-align:center; padding: 20px;"><i class="fas fa-shield-alt fa-3x" style="color:#d32f2f; margin-bottom:15px;"></i><br><h3 style="margin-top:0;">Suspicious Activity Detected</h3><p>It appears this website is overlaying unauthorized content (like ads) on top of Open Publisher.</p><p>Open Publisher is a 100% free tool. Please be careful as the surrounding site may be trying to mislead you.</p></div>', null, true);
                    }
                }
            });
        }, { 
            trackVisibility: true, 
            delay: 100 
        });
        
        // We observe the body. If the scammer places an ad anywhere over the body, it triggers.
        observer.observe(document.body);
    } catch (e) {
        // The user's browser does not support trackVisibility (e.g. Firefox/Safari).
        // Fail silently to avoid breaking legitimate usage.
    }
});