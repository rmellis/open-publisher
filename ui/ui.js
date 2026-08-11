const DialogSystem = {
    init: function() {
        // Inject the overlay into the body once
        if(!document.getElementById('custom-dialog-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'custom-dialog-overlay';
            overlay.id = 'custom-dialog-overlay';
            document.body.appendChild(overlay);
            
            // Allow Esc key to close open dialogs
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const overlayElem = document.getElementById('custom-dialog-overlay');
                    // Only close if it's currently displayed
                    if (overlayElem && overlayElem.style.display !== 'none') {
                        DialogSystem.close();
                    }
                }
            });
        }
    },
    show: function(title, contentHtml, onConfirm, isAlert = false, confirmText = 'OK', onApply = null) {
        const overlay = document.getElementById('custom-dialog-overlay');
        
        // Build the HTML structure
        overlay.innerHTML = `
            <div class="custom-dialog" id="custom-dialog-box" style="transform: translate(0px, 0px);">
                <div class="custom-dialog-header" id="custom-dialog-header">
                    <span>${title}</span>
                    <span class="custom-dialog-close" onclick="DialogSystem.close()"><i class="fas fa-times"></i></span>
                </div>
                <div class="custom-dialog-body">
                    ${contentHtml}
                </div>
                <div class="custom-dialog-footer">
                    <button class="btn-secondary" onclick="DialogSystem.close()" style="${isAlert ? 'display:none;' : ''}">Cancel</button>
                    <button class="btn-primary" id="custom-dialog-confirm">${confirmText}</button>
                    ${onApply ? `<button class="btn-secondary" id="custom-dialog-apply" style="margin-left: 8px;">Apply</button>` : ''}
                </div>
            </div>
        `;
        
        overlay.style.display = 'flex';

        // Initialize dragging functionality
        this.makeDraggable(document.getElementById('custom-dialog-box'), document.getElementById('custom-dialog-header'));

        // Setup the OK button
        const confirmBtn = document.getElementById('custom-dialog-confirm');
        confirmBtn.onclick = () => {
            if (onConfirm) onConfirm();
            this.close();
        };
        
        if (onApply) {
            const applyBtn = document.getElementById('custom-dialog-apply');
            if (applyBtn) {
                applyBtn.onclick = () => { onApply(); };
            }
        }

        // Allow pressing Enter in input fields to confirm
        document.getElementById('custom-dialog-box').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName.toLowerCase() === 'input') {
                e.preventDefault();
                confirmBtn.click();
            }
        });
        
        this.convertNativeSelects(document.getElementById('custom-dialog-box'));
    },
    convertNativeSelects: function(container) {
        if(!container) return;
        const selects = container.querySelectorAll('select');
        selects.forEach(sel => {
            const wrapper = document.createElement('div');
            wrapper.className = 'custom-dom-select';
            
            // Inherit the width from the original select, fallback to 100%
            const w = sel.style.width || '100%';
            
            wrapper.style.cssText = `position:relative; width:${w}; border:1px solid #ccc; border-radius:4px; cursor:pointer; background:#fff; font-family:inherit; font-size:13px; color:var(--ui-theme-dark); display:flex; justify-content:space-between; align-items:center; user-select:none; min-height: 26px;`;
            wrapper.onmouseover = () => wrapper.style.borderColor = 'var(--ui-theme-dark)';
            wrapper.onmouseout = () => wrapper.style.borderColor = '#ccc';
            
            const display = document.createElement('span');
            display.innerText = sel.options.length && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].text : '';
            display.style.pointerEvents = 'none';
            display.style.overflow = 'hidden';
            display.style.textOverflow = 'ellipsis';
            display.style.whiteSpace = 'nowrap';
            display.style.fontWeight = '500';
            display.style.paddingLeft = '8px';
            
            const arrowBox = document.createElement('div');
            arrowBox.style.cssText = 'background:var(--ui-theme-dark); color:white; width:26px; align-self:stretch; display:flex; align-items:center; justify-content:center; pointer-events:none; flex-shrink:0; border-radius:0 3px 3px 0;';
            
            const arrow = document.createElement('i');
            arrow.className = 'fas fa-chevron-down';
            arrow.style.cssText = 'font-size:10px; color:#fff; pointer-events:none;';
            arrowBox.appendChild(arrow);
            
            const optionsList = document.createElement('div');
            optionsList.style.cssText = 'display:none; position:absolute; top:calc(100% + 2px); left:0; right:0; background:#fff; border:1px solid var(--ui-theme-dark); border-radius:4px; z-index:9999; max-height:200px; overflow-y:auto; box-shadow:0 4px 6px rgba(0,0,0,0.1);';
            
            Array.from(sel.options).forEach((opt, idx) => {
                const optDiv = document.createElement('div');
                optDiv.innerText = opt.text;
                // Change dropdown option text color to dark teal green
                optDiv.style.cssText = 'padding:6px 8px; cursor:pointer; color:var(--ui-theme-dark); font-size:13px; font-weight:500; transition:background 0.1s;';
                if (idx === sel.selectedIndex) optDiv.style.background = 'rgba(0,118,112,0.1)';
                optDiv.onmouseover = () => optDiv.style.background = 'rgba(0,118,112,0.15)';
                optDiv.onmouseout = () => optDiv.style.background = idx === sel.selectedIndex ? 'rgba(0,118,112,0.1)' : '#fff';
                optDiv.onclick = (e) => {
                    e.stopPropagation();
                    sel.selectedIndex = idx;
                    display.innerText = opt.text;
                    optionsList.style.display = 'none';
                    Array.from(optionsList.children).forEach(c => c.style.background = '#fff');
                    optDiv.style.background = 'rgba(0,118,112,0.1)';
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                };
                optionsList.appendChild(optDiv);
            });
            
            wrapper.onclick = (e) => {
                e.stopPropagation();
                const isShowing = optionsList.style.display === 'block';
                document.querySelectorAll('.custom-dom-select-list').forEach(l => l.style.display = 'none');
                optionsList.style.display = isShowing ? 'none' : 'block';
            };
            
            optionsList.className = 'custom-dom-select-list';
            
            wrapper.appendChild(display);
            wrapper.appendChild(arrowBox);
            wrapper.appendChild(optionsList);
            sel.style.display = 'none';
            sel.parentNode.insertBefore(wrapper, sel.nextSibling);
        });
        
        if (!window._patchedDialogSelectsClick) {
            document.addEventListener('click', () => {
                document.querySelectorAll('.custom-dom-select-list').forEach(l => l.style.display = 'none');
            });
            window._patchedDialogSelectsClick = true;
        }
    },
    alert: function(title, msg) {
        // Quick helper for simple alerts with only an OK button
        this.show(title, `<p style="margin:0;">${msg}</p>`, null, true);
    },
    spinner: function(msg) {
        const overlay = document.getElementById('custom-dialog-overlay');
        overlay.innerHTML = `
            <div class="custom-dialog" style="transform: translate(0px, 0px); width:300px; text-align:center;">
                <div class="custom-dialog-body" style="padding:40px;">
                    <i class="fas fa-circle-notch fa-spin" style="font-size:3rem; color:#0f766e; margin-bottom:15px;"></i>
                    <p style="margin:0; font-weight:500; color:#333;">${msg}</p>
                </div>
            </div>
        `;
        overlay.style.display = 'flex';
    },
    close: function() {
        if (window._dialogCancelHook) {
            window._dialogCancelHook();
            window._dialogCancelHook = null;
        }
        const overlay = document.getElementById('custom-dialog-overlay');
        if (overlay) overlay.style.display = 'none';
    },
    makeDraggable: function(elmnt, header) {
        let currentX = 0, currentY = 0, initialX = 0, initialY = 0;
        let xOffset = 0, yOffset = 0;

        header.onmousedown = dragStart;

        function dragStart(e) {
            e.preventDefault();
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            document.onmouseup = dragEnd;
            document.onmousemove = drag;
        }

        function drag(e) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            
            elmnt.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }

        function dragEnd() {
            document.onmouseup = null;
            document.onmousemove = null;
        }

        setTimeout(() => {
            const input = document.getElementById('doc-protect-pw');
            if (input) input.focus();
        }, 100);
    }
};

function switchTab(t) {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.ribbon-toolbar').forEach(x => x.classList.remove('active'));
    
    let tabEl = null;
    if (typeof event !== 'undefined' && event && event.currentTarget && event.currentTarget.classList && event.currentTarget.classList.contains('tab')) {
        tabEl = event.currentTarget;
    } else {
        tabEl = document.getElementById('tab-' + t) || 
                document.querySelector(`.tab[onclick*="'${t}'"]`) || 
                document.querySelector(`.tab[onclick*='"${t}"']`);
    }
    
    if (tabEl) {
        tabEl.classList.add('active');
        if (!tabEl.classList.contains('contextual-tab')) {
            window.lastStandardTab = t;
        }
    }
    
    let rb = document.getElementById('ribbon-'+t);
    if(rb) rb.classList.add('active');
}

window.ContextMenuActions = {
    
    removeHyperlink: function() {
        if (window._contextTargetLink && window._contextTargetLink.parentNode) {
            const link = window._contextTargetLink;
            const parent = link.parentNode;
            while (link.firstChild) {
                parent.insertBefore(link.firstChild, link);
            }
            parent.removeChild(link);
            window._contextTargetLink = null;
            if (typeof pushHistory !== 'undefined') pushHistory();
            return;
        }
        document.execCommand('unlink', false, null);
        if (typeof pushHistory !== 'undefined') pushHistory();
    },

    pasteNormal: async function() {
        let targetBox = document.activeElement;
        
        // Recover focus if lost due to clicking the context menu
        if (!targetBox || (!targetBox.isContentEditable && targetBox.tagName !== 'INPUT' && targetBox.tagName !== 'TEXTAREA')) {
            if (typeof state !== 'undefined' && state.selectedEl) {
                const innerText = state.selectedEl.querySelector('div[contenteditable]') || state.selectedEl.querySelector('.text-content');
                if (innerText) {
                    targetBox = innerText;
                    targetBox.focus();
                    if (state.lastRange) {
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(state.lastRange);
                    }
                }
            }
        }
        
        const isTextEditing = targetBox && (targetBox.isContentEditable || targetBox.tagName === 'INPUT' || targetBox.tagName === 'TEXTAREA');

        if (!isTextEditing) {
            // Not editing text? Just paste elements.
            if (typeof window.pasteEl === 'function') window.pasteEl();
            return;
        }
        
        try {
            // Restore focus
            if (state.lastRange && targetBox) {
                targetBox.focus();
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(state.lastRange);
            }
            
            // Check internal element clipboard
            if (state.copiedElements && state.copiedElements.length > 0) {
                 targetBox.blur();
                 if (typeof window.pasteEl === 'function') window.pasteEl();
                 return;
            }

            // Check internal text clipboard (avoids browser permission prompts entirely!)
            if (typeof state.copiedHtml === 'string' && state.copiedHtml.length > 0) {
                const success = document.execCommand('insertHTML', false, state.copiedHtml);
                if (!success) {
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.deleteContents();
                        const div = document.createElement('div');
                        div.innerHTML = state.copiedHtml;
                        const frag = document.createDocumentFragment();
                        let node, lastNode;
                        while ((node = div.firstChild)) {
                            lastNode = frag.appendChild(node);
                        }
                        range.insertNode(frag);
                        if (lastNode) {
                            const newRange = range.cloneRange();
                            newRange.setStartAfter(lastNode);
                            newRange.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(newRange);
                        }
                    }
                }
            } else if (typeof state.copiedText === 'string' && state.copiedText.length > 0) {
                const success = document.execCommand('insertText', false, state.copiedText);
                if (!success) {
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(document.createTextNode(state.copiedText));
                        range.collapse(false);
                    }
                }
            } else {
                // Emtpy internal buffer (e.g., trying to paste from outside the app via the ribbon)
                if (typeof DialogSystem !== 'undefined') {
                    DialogSystem.show('Paste', '<div style="display:flex; align-items:center; gap:20px;"><i class="fas fa-info-circle fa-2x" style="color:var(--ui-theme-color);"></i><div style="font-size:14px; max-width:350px; line-height:1.4;">To paste text from other applications, please use your keyboard shortcut:<br><br>• <b>Windows / Linux:</b> Ctrl + V<br>• <b>Mac:</b> Cmd + V</div></div>', null, true);
                } else {
                    alert('Please use Ctrl+V or Cmd+V to paste text from other applications.');
                }
            }
        } catch (err) {
            console.warn('Paste normal failed:', err);
        }
    },

    pasteWithoutFormatting: async function() {
        let targetBox = document.activeElement;
        if (!targetBox || (!targetBox.isContentEditable && targetBox.tagName !== 'INPUT' && targetBox.tagName !== 'TEXTAREA')) {
            if (state.selectedEl) {
                targetBox = state.selectedEl.querySelector('div[contenteditable]') || state.selectedEl.querySelector('.text-content');
                if (targetBox) {
                    targetBox.focus();
                    if (state.lastRange) {
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(state.lastRange);
                    }
                }
            }
        }
        
        if (targetBox && (targetBox.isContentEditable || targetBox.tagName === 'INPUT' || targetBox.tagName === 'TEXTAREA')) {
            try {
                // Restore focus
                if (state.lastRange && targetBox) {
                    targetBox.focus();
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(state.lastRange);
                }
                
                // Check internal text clipboard (avoids browser permission prompts entirely!)
                if (typeof state.copiedText === 'string' && state.copiedText.length > 0) {
                    const success = document.execCommand('insertText', false, state.copiedText);
                    if (!success) {
                        const selection = window.getSelection();
                        if (selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            range.deleteContents();
                            range.insertNode(document.createTextNode(state.copiedText));
                            range.collapse(false);
                        }
                    }
                    return;
                } else {
                    // Empty internal buffer (e.g., trying to paste from outside the app via the ribbon)
                    DialogSystem.show('Paste Without Formatting', '<div style="display:flex; align-items:center; gap:20px;"><i class="fas fa-info-circle fa-2x" style="color:var(--ui-theme-color);"></i><div style="font-size:14px; max-width:350px; line-height:1.4;">To paste text without formatting from other applications, please use your keyboard shortcut:<br><br>• <b>Windows / Linux:</b> Ctrl + Shift + V<br>• <b>Mac:</b> Cmd + Shift + V</div></div>', null, true);
                }
            } catch (err) {
                console.warn('Paste without formatting failed:', err);
            }
        }
    },
    setAltText: function() {
        if (!state.selectedEl) return;
        const img = state.selectedEl.querySelector('img');
        if (!img) return;
        const currentAlt = img.alt || '';
        const html = `
            <div style="display:flex; gap:15px; margin-bottom:15px; align-items:flex-start;">
                <div style="flex-shrink:0; width:100px; height:100px; background:#f0f0f0; border:1px solid #ccc; border-radius:4px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                    <img src="${img.src}" style="max-width:100%; max-height:100%; object-fit:contain;">
                </div>
                <div style="flex-grow:1; display:flex; flex-direction:column; justify-content:center; height:100px;">
                    <label style="display:block; margin-bottom:5px; font-weight:bold;">Description for screen readers:</label>
                    <input type="text" id="op-alt-text-input" value="${currentAlt.replace(/"/g, '&quot;')}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;" autocomplete="off" placeholder="e.g. A brown dog jumping over a log">
                    <p style="font-size:12px; color:#666; margin:8px 0 0 0; line-height:1.3;">Alt text helps users who use screen readers understand the content of images.</p>
                </div>
            </div>
        `;
        
        DialogSystem.show('Alt Text', html, () => {
            const input = document.getElementById('op-alt-text-input');
            if (input) {
                img.alt = input.value.trim();
                if (window.pushHistory) pushHistory();
                if (window.AccessibilityScanner) setTimeout(() => window.AccessibilityScanner.scanDocument(), 100);
            }
        });
        
        setTimeout(() => {
            const input = document.getElementById('op-alt-text-input');
            if (input) {
                input.focus();
                input.select();
            }
        }, 50);
    },

    alignTextVertical: function(align) {
        if (!state.selectedEl) return;
        const editable = state.selectedEl.querySelector('[contenteditable="true"]');
        const parent = state.selectedEl.querySelector('.element-content');
        
        if (editable && parent && editable.parentElement === parent) {
            // Apply table behavior to bypass WebKit flexbox printing bugs with anonymous text nodes
            parent.style.display = 'table';
            parent.style.tableLayout = 'fixed';
            parent.style.width = '100%';
            parent.style.height = '100%';

            editable.style.display = 'table-cell';
            
            if (align === 'top') editable.style.verticalAlign = 'top';
            if (align === 'center') editable.style.verticalAlign = 'middle';
            if (align === 'bottom') editable.style.verticalAlign = 'bottom';
            
            // Cleanup any previous flex properties just in case
            editable.style.flexDirection = '';
            editable.style.justifyContent = '';
            
            pushHistory();
        }
    },

    changeCase: function() {
        let sel = window.getSelection();
        if ((sel.rangeCount === 0 || sel.isCollapsed) && state.lastRange) {
            sel.removeAllRanges();
            sel.addRange(state.lastRange);
        }
        
        if (sel.rangeCount === 0 || sel.isCollapsed) return;

        const text = sel.toString();
        if (!text) return;

        const isUpper = text === text.toUpperCase() && text !== text.toLowerCase();
        const isLower = text === text.toLowerCase() && text !== text.toUpperCase();
        
        const toTitleCase = (str) => {
            return str.replace(
                /\w\S*/g,
                txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
            );
        };

        let newText = '';
        if (isUpper) {
            newText = text.toLowerCase();
        } else if (isLower) {
            newText = toTitleCase(text);
        } else {
            newText = text.toUpperCase();
        }

        document.execCommand('insertText', false, newText);
        pushHistory();
    },

    applySpelling: function(suggestion) {
        const range = window._currentSpellCheckRange;
        if (range && range.startContainer) {
            const text = range.startContainer.textContent;
            const before = text.substring(0, range.startOffset);
            const after = text.substring(range.endOffset);
            range.startContainer.textContent = before + suggestion + after;
            pushHistory();
            if (state.selectedEl) {
                state.selectedEl.focus();
            }
        }
    },

    // -- Page Features --
    formatBackground: function() {
        const form = `
            <style>
                #custom-dialog-header { background-color: var(--ui-theme-dark) !important; color: white !important; font-size: 18px !important; font-family: 'Comfortaa', 'Afacad Flux', sans-serif !important; border-bottom: none !important; }
                #custom-dialog-close { color: white !important; opacity: 0.8; }
                .ctx-bg-label { display:flex; align-items:center; cursor:pointer; font-weight:bold; color: var(--ui-theme-dark); font-size: 15px; }
                .ctx-bg-input-container { margin-top:10px; margin-left: 24px; margin-bottom: 15px; padding-left: 12px; border-left: 2px solid color-mix(in srgb, var(--ui-theme-dark) 20%, transparent); }
                .ctx-bg-input-group { display: flex; align-items: center; margin-bottom: 10px; }
                .ctx-bg-input-group label { width: 75px; color: #444; font-size: 13px; font-weight: 600; }
                .ctx-bg-input-group input[type="color"] { width: 50px; height: 30px; border: 1px solid #ccc; border-radius: 4px; padding: 0; cursor: pointer; }
                .ctx-bg-input-group select { flex: 1; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; outline: none; }
                .ctx-bg-input-group select:focus { border-color: var(--ui-theme-dark); }
                .ctx-bg-info { background: color-mix(in srgb, var(--ui-theme-dark) 4%, transparent); border: 1px solid color-mix(in srgb, var(--ui-theme-dark) 15%, transparent); border-radius: 8px; padding: 12px; margin-top: 20px; font-size: 12px; color: var(--ui-theme-dark); text-align: center; line-height: 1.4; }
            </style>
            <div style="padding: 5px;">
                <div style="margin-bottom: 15px;">
                    <label class="ctx-bg-label">
                        <input type="radio" name="bg-type" value="solid" checked style="margin-right:8px; accent-color: var(--ui-theme-dark);"> Solid Color
                    </label>
                    <div class="ctx-bg-input-container">
                        <div class="ctx-bg-input-group" style="margin-bottom: 0;">
                            <label>Color:</label>
                            <input type="hidden" id="ctx-bg-color" value="#ffffff">
                            <div style="background-color:#ffffff; width:40px; height:24px; border:1px solid #ccc; border-radius:4px; cursor:pointer; margin-left:10px;" onclick="CustomColorPicker.open(this, document.getElementById('ctx-bg-color').value, (c) => { document.getElementById('ctx-bg-color').value = c; this.style.backgroundColor = c; })"></div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 5px;">
                    <label class="ctx-bg-label">
                        <input type="radio" name="bg-type" value="gradient" style="margin-right:8px; accent-color: var(--ui-theme-dark);"> Gradient
                    </label>
                    <div class="ctx-bg-input-container">
                        <div class="ctx-bg-input-group">
                            <label>Color 1:</label>
                            <input type="hidden" id="ctx-bg-grad-1" value="#f0f0f0">
                            <div style="background-color:#f0f0f0; width:40px; height:24px; border:1px solid #ccc; border-radius:4px; cursor:pointer; margin-left:10px;" onclick="CustomColorPicker.open(this, document.getElementById('ctx-bg-grad-1').value, (c) => { document.getElementById('ctx-bg-grad-1').value = c; this.style.backgroundColor = c; })"></div>
                        </div>
                        <div class="ctx-bg-input-group">
                            <label>Color 2:</label>
                            <input type="hidden" id="ctx-bg-grad-2" value="#d4d4d4">
                            <div style="background-color:#d4d4d4; width:40px; height:24px; border:1px solid #ccc; border-radius:4px; cursor:pointer; margin-left:10px;" onclick="CustomColorPicker.open(this, document.getElementById('ctx-bg-grad-2').value, (c) => { document.getElementById('ctx-bg-grad-2').value = c; this.style.backgroundColor = c; })"></div>
                        </div>
                        <div class="ctx-bg-input-group" style="margin-bottom: 0;">
                            <label>Direction:</label>
                            <select id="ctx-bg-grad-dir">
                                <option value="to bottom">Top to Bottom</option>
                                <option value="to right">Left to Right</option>
                                <option value="135deg">Diagonal</option>
                                <option value="radial">Radial</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="ctx-bg-info">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    <strong>Looking for more?</strong><br>
                    You can find more detailed themes and textures in <strong>Page Design &gt; Theme Studio</strong>
                </div>
            </div>
        `;
        DialogSystem.show('Format Background', form, () => {
            const paper = document.getElementById('paper');
            const isSolid = document.querySelector('input[name="bg-type"]:checked').value === 'solid';
            if (isSolid) {
                paper.style.background = document.getElementById('ctx-bg-color').value;
            } else {
                const c1 = document.getElementById('ctx-bg-grad-1').value;
                const c2 = document.getElementById('ctx-bg-grad-2').value;
                const dir = document.getElementById('ctx-bg-grad-dir').value;
                if (dir === 'radial') {
                    paper.style.background = `radial-gradient(circle, ${c1}, ${c2})`;
                } else {
                    paper.style.background = `linear-gradient(${dir}, ${c1}, ${c2})`;
                }
            }
            pushHistory();
        });
    },

    // -- Image Features --
    changePicture: function() {
        if(!state.selectedEl) return;
        const img = state.selectedEl.querySelector('img');
        if(!img) return;

        // Create a temporary hidden file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            if(e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    img.src = evt.target.result;
                    setTimeout(() => { updateThumbnails(); pushHistory(); }, 100);
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        };
        input.click();
    },
    bgFill: function() {
        if(!state.selectedEl) return;
        const img = state.selectedEl.querySelector('img');
        if(img) {
            paper.style.background = `url(${img.src}) center center / cover no-repeat`;
            pushHistory();
        }
    },
    bgTile: function() {
        if(!state.selectedEl) return;
        const img = state.selectedEl.querySelector('img');
        if(img) {
            paper.style.background = `url(${img.src}) repeat`;
            pushHistory();
        }
    },
    insertCaption: function() {
        if(!state.selectedEl) return;
        const el = state.selectedEl;
        // Extend box height slightly and append a text area at the bottom
        const currentH = parseFloat(el.style.height) || 100;
        el.style.height = (currentH + 30) + 'px';
        
        const content = el.querySelector('.element-content');
        const caption = document.createElement('div');
        caption.setAttribute('contenteditable', 'true');
        caption.style.cssText = "position:absolute; bottom:0; width:100%; text-align:center; background:rgba(255,255,255,0.8); font-size:12px; padding:2px; font-family:Arial;";
        caption.innerText = "Type caption here...";
        content.appendChild(caption);
        pushHistory();
    },

    // -- Text Box Features --
    bestFitText: function() {
        if(!state.selectedEl) return;
        const el = state.selectedEl;
        const wa = el.querySelector('.wa-text');
        
        if (wa && typeof syncWordArt === 'function') {
            syncWordArt(el); // Use our custom WordArt engine
            pushHistory();
            return;
        }

        // Standard Text: Mathematically shrink/grow font until scrollHeight matches clientHeight
        const content = el.querySelector('.element-content > div') || el.querySelector('.element-content');
        if(!content) return;
        
        let size = 150; // Start huge
        content.style.fontSize = size + 'px';
        
        // Loop down until it fits without overflowing
        while((content.scrollHeight > el.clientHeight || content.scrollWidth > el.clientWidth) && size > 6) {
            size--;
            content.style.fontSize = size + 'px';
        }
        pushHistory();
    },
    toggleShrinkOverflow: function() {
        if(!state.selectedEl) return;
        const el = state.selectedEl;
        const btn = document.getElementById('btn-shrink-overflow');
        if (el.getAttribute('data-shrink-overflow') === 'true') {
            el.removeAttribute('data-shrink-overflow');
            el.removeAttribute('data-original-font-size'); // Reset baseline
            if (window.shrinkObserver) window.shrinkObserver.unobserve(el);
            const content = el.querySelector('.element-content > div') || el.querySelector('.element-content');
            if(content) content.style.fontSize = ''; // reset to CSS default or float-toolbar set size
            if (btn) btn.classList.remove('active');
        } else {
            // Disable growFit if active
            el.removeAttribute('data-grow-fit');
            const growBtn = document.getElementById('btn-grow-fit');
            if(growBtn) growBtn.classList.remove('active');

            el.setAttribute('data-shrink-overflow', 'true');
            if (window.shrinkObserver) window.shrinkObserver.observe(el);
            if (btn) btn.classList.add('active');
            applyShrinkOverflow(el);
        }
        pushHistory();
    },
    toggleGrowFit: function() {
        if(!state.selectedEl) return;
        const el = state.selectedEl;
        const btn = document.getElementById('btn-grow-fit');
        if (el.getAttribute('data-grow-fit') === 'true') {
            el.removeAttribute('data-grow-fit');
            if (window.shrinkObserver && el.getAttribute('data-shrink-overflow') !== 'true') {
                window.shrinkObserver.unobserve(el);
            }
            if (btn) btn.classList.remove('active');
        } else {
            // Disable shrinkOverflow if active
            el.removeAttribute('data-shrink-overflow');
            el.removeAttribute('data-original-font-size');
            const content = el.querySelector('.element-content > div') || el.querySelector('.element-content');
            if(content) content.style.fontSize = '';
            const shrinkBtn = document.getElementById('btn-shrink-overflow');
            if(shrinkBtn) shrinkBtn.classList.remove('active');

            el.setAttribute('data-grow-fit', 'true');
            if (window.shrinkObserver) window.shrinkObserver.observe(el);
            if (btn) btn.classList.add('active');
            applyGrowFit(el);
        }
        pushHistory();
    },
    dropCap: function() {
        // Simulates Publisher's Drop Cap by floating the first letter
        if(!state.selectedEl) return;
        const content = state.selectedEl.querySelector('.element-content > div') || state.selectedEl.querySelector('.element-content');
        if(!content || !content.innerText.trim()) return;

        if(content.querySelector('.drop-cap')) {
            DialogSystem.alert('Notice', 'Drop cap already applied.');
            return;
        }

        // Safely extract the first visible character without breaking HTML tags
        function extractFirstChar(node) {
            for (let child of node.childNodes) {
                if (child.nodeType === 3) { // TEXT_NODE
                    const match = child.textContent.match(/\S/);
                    if (match) {
                        const char = match[0];
                        child.textContent = child.textContent.replace(char, '');
                        return char;
                    }
                } else if (child.nodeType === 1) { // ELEMENT_NODE
                    const char = extractFirstChar(child);
                    if (char) return char;
                }
            }
            return null;
        }

        const firstChar = extractFirstChar(content);
        if (!firstChar) return;

        content.insertAdjacentHTML('afterbegin', `<span class="drop-cap" style="float:left; font-size:3.5em; line-height:0.8; padding-right:8px; padding-top:4px; font-weight:bold; color:var(--ui-theme-color);">${firstChar}</span>`);
        pushHistory();
    },
    formatTextBox: function() {
        if(!state.selectedEl) return;
        const form = `
            <div class="input-group" style="margin-bottom:10px;"><label>Fill Color:</label>
                <input type="hidden" id="ctx-box-bg" value="#ffffff"><div style="background-color:#ffffff; width:40px; height:24px; border:1px solid #ccc; border-radius:4px; cursor:pointer; display:inline-block; vertical-align:middle;" onclick="CustomColorPicker.open(this, document.getElementById('ctx-box-bg').value, (c) => { document.getElementById('ctx-box-bg').value = c; this.style.backgroundColor = c; })"></div>
            </div>
            <div class="input-group" style="margin-bottom:10px;"><label>Border Color:</label>
                <input type="hidden" id="ctx-box-bc" value="#000000"><div style="background-color:#000000; width:40px; height:24px; border:1px solid #ccc; border-radius:4px; cursor:pointer; display:inline-block; vertical-align:middle;" onclick="CustomColorPicker.open(this, document.getElementById('ctx-box-bc').value, (c) => { document.getElementById('ctx-box-bc').value = c; this.style.backgroundColor = c; })"></div>
            </div>
            <div class="input-group"><label>Border Thickness (px):</label><div class="modern-spinner"><input type="text" id="ctx-box-bt" value="0" onchange="this.value = Math.max(0, Math.min(20, parseInt(this.value)||0))"><div class="spin-btns"><div onclick="document.getElementById('ctx-box-bt').value=Math.min(20, parseInt(document.getElementById('ctx-box-bt').value||0)+1)"><i class="fas fa-chevron-up"></i></div><div onclick="document.getElementById('ctx-box-bt').value=Math.max(0, parseInt(document.getElementById('ctx-box-bt').value||0)-1)"><i class="fas fa-chevron-down"></i></div></div></div></div>
        `;
        DialogSystem.show('Format Text Box', form, () => {
            const bg = document.getElementById('ctx-box-bg').value;
            const bc = document.getElementById('ctx-box-bc').value;
            const bt = document.getElementById('ctx-box-bt').value;
            const content = state.selectedEl.querySelector('.element-content');
            
            content.style.background = bg;
            content.style.border = bt > 0 ? `${bt}px solid ${bc}` : 'none';
            pushHistory();
        });
    },

    // -- Shape Features --
    addShapeText: function() {
        if(!state.selectedEl) return;
        const content = state.selectedEl.querySelector('.element-content');
        // Overlay a transparent flexbox text area perfectly over the shape
        if(!content.querySelector('.shape-text')) {
            content.insertAdjacentHTML('beforeend', `<div class="shape-text" contenteditable="true" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:white; font-family:Arial; font-weight:bold; text-align:center; z-index:2;">Edit Text</div>`);
        }
    },
    setDefaultShape: function() {
        if(!state.selectedEl) return;
        const shape = state.selectedEl.querySelector('.element-content div');
        if(shape) {
            state.defaultShapeStyle = {
                bg: shape.style.background,
                clip: shape.style.clipPath
            };
            DialogSystem.alert('Saved', 'Current color and shape saved as Default AutoShape.');
        }
    },

    // -- Universal Features --
    saveAsPicture: async function() {
        if(!state.selectedEl) return;
        DialogSystem.alert('Exporting...', 'Generating high-resolution image of element...');
        
        const el = state.selectedEl;
        const content = el.querySelector('.element-content');
        
        const clone = content.cloneNode(true);
        
        let cleanHTML = clone.innerHTML.replace(/contenteditable="true"/g, 'contenteditable="false"');
        cleanHTML = cleanHTML.replace(/https:\/\/(www\.transparenttextures\.com[^'"]+)/g, 'https://wsrv.nl/?url=$1');
        cleanHTML = cleanHTML.replace(/transform-style:\s*preserve-3d;?/gi, '').replace(/backface-visibility:\s*hidden;?/gi, '');
        if (typeof fixWordArtSpacesInHtml === 'function') {
            cleanHTML = fixWordArtSpacesInHtml(cleanHTML);
        }
        clone.innerHTML = cleanHTML;

        const stagingArea = document.createElement('div');
        stagingArea.style.cssText = 'position: fixed; top: -10000px; left: -10000px; z-index: -100; overflow: visible; display: block; opacity: 0.01; pointer-events: none;';
        
        clone.style.width = el.style.width || 'auto';
        clone.style.height = el.style.height || 'auto';
        
        stagingArea.appendChild(clone);
        document.body.appendChild(stagingArea);
        
        if (typeof flattenWaTextForPrint === 'function') {
            clone.querySelectorAll('.wa-text').forEach(node => flattenWaTextForPrint(node));
        }

        if (typeof window.bakeSVGFiltersForHtml2Canvas === 'function') {
            await window.bakeSVGFiltersForHtml2Canvas(clone, content);
        }
        
        html2canvas(clone, { backgroundColor: null, scale: 3, useCORS: true, logging: false }).then(canvas => {
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = 'publisher-element.png';
            a.click();
            stagingArea.remove();
            DialogSystem.close(); // Close the exporting alert
        }).catch(err => {
            stagingArea.remove();
            DialogSystem.close();
            console.error(err);
        });
    },
    flattenToImage: async function() {
        if(!state.selectedEl) return;
        DialogSystem.spinner('Rasterizing 3D Element...');
        
        const el = state.selectedEl;
        const content = el.querySelector('.element-content');
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        
        // 1. Save original 3D state
        const originalTransform = content.style.transform;
        const originalStyle = content.style.transformStyle;
        const rx = content.getAttribute('data-3d-rx');
        const ry = content.getAttribute('data-3d-ry');
        const rz = content.getAttribute('data-3d-rz');
        const p = content.getAttribute('data-3d-p');
        
        // 2. Temporarily remove 3D to get a clean 2D raster
        content.style.transform = 'none';
        content.style.transformStyle = 'flat';
        
        // --- CLIP-PATH INTERCEPT FOR HTML2CANVAS ---
        let shapeDiv = content.querySelector('div:not(.shape-text)') || content;
        let clipStr = shapeDiv.style.clipPath || shapeDiv.style.webkitClipPath || '';
        let clipPoints = null;
        if (clipStr && clipStr.includes('polygon')) {
            const match = clipStr.match(/polygon\(([^)]+)\)/);
            if(match) {
                clipPoints = match[1].split(',').map(s => {
                    const parts = s.trim().split(' ').filter(p => p !== '');
                    return { x: parseFloat(parts[0]), y: parseFloat(parts[1]) };
                });
            }
            shapeDiv.style.clipPath = 'none';
            shapeDiv.style.webkitClipPath = 'none';
        }
        
        try {
            // 3. Render flat 2D state using html2canvas (handles CORS, CSS, fonts perfectly)
            let flatCanvas = await html2canvas(content, { scale: 3, backgroundColor: null, useCORS: true, logging: false });
            
            if (clipPoints && clipPoints.length > 2) {
                const clipCanvas = document.createElement('canvas');
                clipCanvas.width = flatCanvas.width;
                clipCanvas.height = flatCanvas.height;
                const cCtx = clipCanvas.getContext('2d');
                cCtx.beginPath();
                clipPoints.forEach((pt, i) => {
                    const px = (pt.x / 100) * clipCanvas.width;
                    const py = (pt.y / 100) * clipCanvas.height;
                    if(i===0) cCtx.moveTo(px, py);
                    else cCtx.lineTo(px, py);
                });
                cCtx.closePath();
                cCtx.clip();
                cCtx.drawImage(flatCanvas, 0, 0);
                flatCanvas = clipCanvas;
            }
            
            if (clipStr) {
                shapeDiv.style.clipPath = clipStr;
                shapeDiv.style.webkitClipPath = clipStr;
            }

            const flatBase64 = flatCanvas.toDataURL('image/png');
            
            // Restore 3D immediately so user doesn't see a flicker
            content.style.transform = originalTransform;
            content.style.transformStyle = originalStyle;
            
            // 4. Project the 2D image into 3D using foreignObject
            const pad = Math.max(w, h, 200); 
            const svgW = w + pad * 2;
            const svgH = h + pad * 2;
            
            const svgString = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}">
                    <foreignObject width="100%" height="100%">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%; height:100%; position:relative;">
                            <img src="${flatBase64}" style="
                                position: absolute;
                                left: ${pad}px;
                                top: ${pad}px;
                                width: ${w}px;
                                height: ${h}px;
                                transform: ${originalTransform};
                                transform-origin: center;
                                transform-style: preserve-3d;
                                object-fit: fill;
                            "/>
                        </div>
                    </foreignObject>
                </svg>
            `;
            
            const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
            
            const img = new Image();
            // Removed img.crossOrigin = "Anonymous" because it taints Blob URIs
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = svgW * 2;
                canvas.height = svgH * 2;
                const ctx = canvas.getContext('2d');
                ctx.scale(2, 2);
                ctx.drawImage(img, 0, 0);
                // URL revocation not needed for Data URIs
                
                try {
                    // Extract pixel data from the raw, padded 3D canvas
                    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const l = pixels.data.length;
                    let bound = { top: null, left: null, right: null, bottom: null };
                    
                    for (let i = 0; i < l; i += 4) {
                        if (pixels.data[i + 3] !== 0) {
                            const x = (i / 4) % canvas.width;
                            const y = ~~((i / 4) / canvas.width);
                            if (bound.top === null) bound.top = y;
                            if (bound.left === null || x < bound.left) bound.left = x;
                            if (bound.right === null || x > bound.right) bound.right = x;
                            if (bound.bottom === null || y > bound.bottom) bound.bottom = y;
                        }
                    }
                    
                    let finalDataUrl;
                    let newWidth = w;
                    let newHeight = h;
                    let offsetX = 0;
                    let offsetY = 0;
                    
                    if (bound.top === null) {
                        // Empty canvas fallback
                        const cropCanvas = document.createElement('canvas');
                        cropCanvas.width = w * 2;
                        cropCanvas.height = h * 2;
                        const cropCtx = cropCanvas.getContext('2d');
                        cropCtx.drawImage(canvas, pad * 2, pad * 2, w * 2, h * 2, 0, 0, w * 2, h * 2);
                        finalDataUrl = cropCanvas.toDataURL('image/png');
                    } else {
                        // Trim to exact 3D visual bounds
                        const trimWidth = bound.right - bound.left + 1;
                        const trimHeight = bound.bottom - bound.top + 1;
                        
                        const cropCanvas = document.createElement('canvas');
                        cropCanvas.width = trimWidth;
                        cropCanvas.height = trimHeight;
                        const cropCtx = cropCanvas.getContext('2d');
                        cropCtx.drawImage(canvas, bound.left, bound.top, trimWidth, trimHeight, 0, 0, trimWidth, trimHeight);
                        
                        finalDataUrl = cropCanvas.toDataURL('image/png');
                        
                        // Calculate offset from the original top-left corner
                        const offsetCanvasX = bound.left - (pad * 2);
                        const offsetCanvasY = bound.top - (pad * 2);
                        
                        offsetX = offsetCanvasX / 2;
                        offsetY = offsetCanvasY / 2;
                        
                        newWidth = trimWidth / 2;
                        newHeight = trimHeight / 2;
                    }
                    
                    const originalHtml = content.outerHTML;
                    
                    // Generate a standard image element (matching V62 interaction fixes)
                    content.innerHTML = '<img src="' + finalDataUrl + '" draggable="false" style="width: 100%; height: 100%; object-fit: fill; display: block; position: absolute; top: 0; left: 0; pointer-events: auto;">';
                    
                    content.style.transform = '';
                    content.style.transformStyle = '';
                    content.style.backfaceVisibility = '';
                    content.style.background = 'transparent';
                    content.style.border = 'none';
                    content.style.clipPath = '';
                    content.removeAttribute('data-3d-rx');
                    content.removeAttribute('data-3d-ry');
                    content.removeAttribute('data-3d-rz');
                    content.removeAttribute('data-3d-p');
                    
                    // Save the original state so we can un-flatten it later
                    const originalState = {
                        html: originalHtml, 
                        w: el.style.width,
                        h: el.style.height,
                        l: el.style.left,
                        t: el.style.top,
                        type: el.getAttribute('data-type')
                    };
                    el.setAttribute('data-original-state', encodeURIComponent(JSON.stringify(originalState)));
                    el.setAttribute('data-type', 'image');
                    el.setAttribute('data-scaleX', '1');
                    el.setAttribute('data-scaleY', '1');
                    
                    // Adjust the bounding box of the element to perfectly wrap the 3D-rotated image!
                    el.style.left = (parseFloat(el.style.left || 0) + offsetX) + 'px';
                    el.style.top = (parseFloat(el.style.top || 0) + offsetY) + 'px';
                    el.style.width = newWidth + 'px';
                    el.style.height = newHeight + 'px';
                    
                    if (typeof selectElement === 'function') {
                        selectElement(el); // Refresh handles
                    }
                    
                    serializeCurrentPage();
                    DialogSystem.close();
                } catch(e) {
                    console.error("Canvas crop error:", e);
                    DialogSystem.close();
                    DialogSystem.alert('Error', 'Canvas cropping failed: ' + (e.name || 'Error') + ' - ' + (e.message || e));
                }
            };
            img.onerror = () => {
                DialogSystem.close();
                DialogSystem.alert('Error', 'Failed to render 3D projection.');
            };
            img.src = url;
            
        } catch(err) {
            console.error(err);
            content.style.transform = originalTransform;
            content.style.transformStyle = originalStyle;
            DialogSystem.close();
            DialogSystem.alert('Error', '2D Rasterization failed.');
        }
    },
    addBuildingBlock: function() {
        if(!state.selectedEl && (!state.multiSelected || state.multiSelected.length === 0)) return;
        // In a full backend system this would save to a database. For this web clone, we store in memory.
        DialogSystem.alert('Building Blocks', 'Layout saved to Building Blocks gallery!<br><br><small>(Note: As a browser app, this clears upon refresh).</small>');
    }
};

function initRibbonResponsiveness() {
    const toolbars = document.querySelectorAll('.ribbon-toolbar');

    toolbars.forEach(tb => {
        if (tb.parentNode.classList.contains('ribbon-toolbar-wrapper')) return;
        
        // Create Wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'ribbon-toolbar-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.flexGrow = '1';
        wrapper.style.flexDirection = 'column';
        wrapper.style.display = tb.classList.contains('active') ? 'flex' : 'none';
        
        tb.parentNode.insertBefore(wrapper, tb);
        wrapper.appendChild(tb);

        // Create Left Pan Arrow
        const panLeft = document.createElement('div');
        panLeft.className = 'ribbon-pan-arrow left';
        panLeft.innerHTML = '<i class="fas fa-chevron-left"></i>';
        
        // Create Right Pan Arrow
        const panRight = document.createElement('div');
        panRight.className = 'ribbon-pan-arrow right';
        panRight.innerHTML = '<i class="fas fa-chevron-right"></i>';
        
        wrapper.appendChild(panLeft);
        wrapper.appendChild(panRight);

        // Pan Logic
        let scrollInterval;
        const startPan = (amt, arrowBtn) => {
            arrowBtn.classList.add('clicked');
            scrollInterval = setInterval(() => { tb.scrollLeft += amt; }, 20);
        };
        const stopPan = () => clearInterval(scrollInterval);

        panLeft.onmousedown = () => startPan(-15, panLeft);
        panLeft.onmouseup = stopPan;
        panLeft.onmouseleave = stopPan;

        panRight.onmousedown = () => startPan(15, panRight);
        panRight.onmouseup = stopPan;
        panRight.onmouseleave = stopPan;

        // Visibility Observer
        const checkScroll = () => {
            if (wrapper.style.display === 'none') return;
            
            if (tb.scrollWidth > tb.clientWidth && Math.ceil(tb.scrollLeft + tb.clientWidth) < tb.scrollWidth) {
                panRight.classList.add('visible');
            } else {
                panRight.classList.remove('visible');
            }

            if (tb.scrollLeft > 0) {
                panLeft.classList.add('visible');
            } else {
                panLeft.classList.remove('visible');
            }
        };

        tb.addEventListener('scroll', checkScroll);
        new ResizeObserver(checkScroll).observe(tb);
        
        // Also allow mousewheel scrolling inside ribbon
        tb.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                tb.scrollLeft += e.deltaY;
                e.preventDefault();
            }
        }, { passive: false });
        
        // Save reference for tab switching
        tb._wrapper = wrapper;
    });

    // We no longer attach click listeners here because contextual tabs are created dynamically.
    // Wrapper visibility is now managed inside switchTab().
}

// --- 1. TAB SWITCHING FIX ---
window.switchTab = function(t) {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.ribbon-toolbar').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.ribbon-toolbar-wrapper').forEach(w => w.style.display = 'none');
    
    let targetTab = document.getElementById('tab-' + t); 
    if (!targetTab) {
        document.querySelectorAll('.tab').forEach(tab => {
            const clickAction = tab.getAttribute('onclick');
            if (clickAction && clickAction.includes("'" + t + "'")) targetTab = tab;
        });
    }
    if (targetTab) targetTab.classList.add('active');
    
    const toolbar = document.getElementById('ribbon-' + t);
    if(toolbar) {
        toolbar.classList.add('active');
        if (toolbar._wrapper) {
            toolbar._wrapper.style.display = 'flex';
            setTimeout(() => toolbar.dispatchEvent(new Event('scroll')), 50);
        }

        setTimeout(() => {
            const input = document.getElementById('doc-protect-pw');
            if (input) input.focus();
        }, 100);
    }
};


// --- 2A. TABLE LAYOUT SIDEBAR ---
(function installSidebarTableLayout() {
    document.getElementById('op-table-sidebar')?.remove();

    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    const panel = document.createElement('div');
    panel.id = 'op-table-sidebar';
    panel.innerHTML = `<div class="op-sidebar-header">
            <span class="op-sidebar-title">Table Layout</span>
            <div class="op-sidebar-top-btns">
                <button class="custom-dialog-close" onclick="document.getElementById('op-table-sidebar').classList.remove('visible')"><i class="fas fa-times"></i></button>
            </div>
        </div>
        
        <div class="op-sidebar-section">
            <span class="op-section-label">Rows & Columns</span>
            <div class="op-sidebar-btn" onclick="if(window.ContextRibbonActions) ContextRibbonActions.insertRowAbove()"><i class="fas fa-plus-circle" style="color:var(--ui-theme-color)"></i> Insert Above</div>
            <div class="op-sidebar-btn" onclick="if(window.ContextRibbonActions) ContextRibbonActions.insertRowBelow()"><i class="fas fa-plus-circle" style="color:var(--ui-theme-color)"></i> Insert Below</div>
            <div class="op-sidebar-btn" onclick="if(window.ContextRibbonActions) ContextRibbonActions.insertColLeft()"><i class="fas fa-plus-circle" style="color:var(--ui-theme-color)"></i> Insert Left/Right</div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Delete</span>
            <div class="op-sidebar-btn danger" onclick="if(window.ContextRibbonActions) ContextRibbonActions.deleteRow()"><i class="fas fa-minus-circle" style="color:#c00"></i> Delete Row</div>
            <div class="op-sidebar-btn danger" onclick="if(window.ContextRibbonActions) ContextRibbonActions.deleteCol()"><i class="fas fa-minus-circle" style="color:#c00"></i> Delete Column</div>
            <div class="op-sidebar-btn danger" onclick="if(window.ContextRibbonActions) { ContextRibbonActions.deleteRow(); if(window.deleteSelected) window.deleteSelected(); }"><i class="fas fa-trash-alt" style="color:#c00"></i> Delete Table</div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Cell Size</span>
            <div class="op-sidebar-btn" onclick="if(window.ContextRibbonActions) ContextRibbonActions.distributeRows()"><i class="fas fa-arrows-alt-v"></i> Distribute Rows</div>
            <div class="op-sidebar-btn" onclick="if(window.ContextRibbonActions) ContextRibbonActions.distributeCols()"><i class="fas fa-arrows-alt-h"></i> Distribute Columns</div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Alignment</span>
            <div class="op-sidebar-grid-container">
                <div class="op-sidebar-grid-btn" title="Top Left" onclick="if(window.ContextRibbonActions) ContextRibbonActions.cellAlign('top', 'left')"><i class="fas fa-align-left"></i></div>
                <div class="op-sidebar-grid-btn" title="Top Center" onclick="if(window.ContextRibbonActions) ContextRibbonActions.cellAlign('top', 'center')"><i class="fas fa-align-center"></i></div>
                <div class="op-sidebar-grid-btn" title="Top Right" onclick="if(window.ContextRibbonActions) ContextRibbonActions.cellAlign('top', 'right')"><i class="fas fa-align-right"></i></div>
                
                <div class="op-sidebar-grid-btn" title="Center Left" onclick="if(window.ContextRibbonActions) ContextRibbonActions.cellAlign('middle', 'left')"><i class="fas fa-align-left"></i></div>
                <div class="op-sidebar-grid-btn" title="Center" onclick="if(window.ContextRibbonActions) ContextRibbonActions.cellAlign('middle', 'center')"><i class="fas fa-align-center"></i></div>
                <div class="op-sidebar-grid-btn" title="Center Right" onclick="if(window.ContextRibbonActions) ContextRibbonActions.cellAlign('middle', 'right')"><i class="fas fa-align-right"></i></div>
                
                <div class="op-sidebar-grid-btn" title="Bottom Left" onclick="if(window.ContextRibbonActions) ContextRibbonActions.cellAlign('bottom', 'left')"><i class="fas fa-align-left"></i></div>
                <div class="op-sidebar-grid-btn" title="Bottom Center" onclick="if(window.ContextRibbonActions) ContextRibbonActions.cellAlign('bottom', 'center')"><i class="fas fa-align-center"></i></div>
                <div class="op-sidebar-grid-btn" title="Bottom Right" onclick="if(window.ContextRibbonActions) ContextRibbonActions.cellAlign('bottom', 'right')"><i class="fas fa-align-right"></i></div>
            </div>
        </div>

        <div class="op-sidebar-section">
            <span class="op-section-label">Cell Margins</span>
            <div class="op-slider-row">
                <div class="op-slider-meta"><span class="op-slider-name">Padding</span><span class="op-slider-num" id="val-cell-padding">0px</span></div>
                <input type="range" class="op-table-slider" id="table-padding-slider" min="0" max="50" value="0" step="1" oninput="if(window.ContextRibbonActions) ContextRibbonActions.setCellPadding(this.value)" onchange="if(window.pushHistory) pushHistory()">
            </div>
        </div>`;

    document.querySelector('.workspace').appendChild(panel);
})();

// --- 2. CONTEXTUAL RIBBONS & ACTIONS ---
window.shrinkObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        if (entry.target.getAttribute('data-shrink-overflow') === 'true') {
            applyShrinkOverflow(entry.target);
        }
        if (entry.target.getAttribute('data-grow-fit') === 'true') {
            applyGrowFit(entry.target);
        }
    }
});

document.addEventListener('input', function(e) {
    if(e.target.isContentEditable) {
        const pubEl = e.target.closest('.pub-element');
        if(pubEl && pubEl.getAttribute('data-shrink-overflow') === 'true') {
            applyShrinkOverflow(pubEl);
        }
        if(pubEl && pubEl.getAttribute('data-grow-fit') === 'true') {
            applyGrowFit(pubEl);
        }
    }
});

window.applyShrinkOverflow = function(el) {
    const content = el.querySelector('.element-content > div') || el.querySelector('.element-content');
    if(!content) return;
    
    // Check if we already stored the original font size on this element
    let originalSize = parseFloat(el.getAttribute('data-original-font-size'));
    
    // If not, store its current computed size as the baseline
    if (!originalSize || isNaN(originalSize)) {
        originalSize = parseFloat(window.getComputedStyle(content).fontSize) || 16;
        el.setAttribute('data-original-font-size', originalSize);
    }
    
    let size = originalSize;
    content.style.fontSize = size + 'px';
    
    // Shrink down if there's overflow, but stop at 6px so it's not totally invisible
    while((content.scrollHeight > el.clientHeight || content.scrollWidth > el.clientWidth) && size > 6) {
        size -= 1;
        content.style.fontSize = size + 'px';
    }
};

window.applyGrowFit = function(el) {
    const content = el.querySelector('.element-content > div') || el.querySelector('.element-content');
    if(!content) return;
    
    // Temporarily set height very small to force scrollHeight to represent the exact content height
    const currentH = el.style.height;
    el.style.height = '10px';
    
    let newHeight = content.scrollHeight;
    if (newHeight < 20) newHeight = 20; // Enforce minimum height
    
    el.style.height = newHeight + 'px';
};

window.ContextRibbonActions = {
    rotateRelative: function(degDelta) {
        if (!state.selectedEl) return;
        let trans = state.selectedEl.style.transform || '';
        let currentRot = 0;
        const match = trans.match(/rotate\(([-\d.]+)deg\)/);
        if (match) currentRot = parseFloat(match[1]);
        const newRot = currentRot + degDelta;
        if (match) {
            trans = trans.replace(/rotate\([-\d.]+deg\)/, `rotate(${newRot}deg)`);
        } else {
            trans += ` rotate(${newRot}deg)`;
        }
        state.selectedEl.style.transform = trans;
        pushHistory();
    },
    flipScale: function(axis) {
        if (!state.selectedEl) return;
        let trans = state.selectedEl.style.transform || '';
        const scaleRegex = new RegExp(`scale${axis}\\(([-1]+)\\)`);
        const match = trans.match(scaleRegex);
        if (match) {
            trans = trans.replace(scaleRegex, `scale${axis}(${match[1] === '-1' ? '1' : '-1'})`);
        } else {
            trans += ` scale${axis}(-1)`;
        }
        state.selectedEl.style.transform = trans;
        pushHistory();
    },
    toggleAspectLock: function(locked) {
        if (!state.selectedEl) return;
        state.selectedEl.setAttribute('data-aspect-lock', locked ? 'true' : 'false');
        if (locked) {
            state.selectedEl.setAttribute('data-aspect-ratio', (state.selectedEl.offsetWidth / state.selectedEl.offsetHeight) || 1);
        }
    },
    updateElementSize: function(dim, val) {
        if (!state.selectedEl) return;
        const el = state.selectedEl;
        let newW = parseFloat(dim === 'w' ? val : (document.getElementById('ribbon-el-w')?.value || el.offsetWidth));
        let newH = parseFloat(dim === 'h' ? val : (document.getElementById('ribbon-el-h')?.value || el.offsetHeight));
        const isLocked = el.getAttribute('data-aspect-lock') === 'true';
        const originalAspectRatio = parseFloat(el.getAttribute('data-aspect-ratio')) || (el.offsetWidth / el.offsetHeight) || 1;
        
        if (isLocked) {
            if (dim === 'w') {
                newH = newW / originalAspectRatio;
                const hInput = document.getElementById('ribbon-el-h');
                if (hInput) hInput.value = Math.round(newH);
            } else if (dim === 'h') {
                newW = newH * originalAspectRatio;
                const wInput = document.getElementById('ribbon-el-w');
                if (wInput) wInput.value = Math.round(newW);
            }
        } else {
            el.setAttribute('data-aspect-ratio', (newW / newH) || 1);
        }
        
        if (newW >= 10) el.style.width = newW + 'px';
        if (newH >= 10) el.style.height = newH + 'px';
        
        if (typeof updateThumbnails === 'function') updateThumbnails();
        pushHistory();
    },
    alignCenter: function() {
        if(!state.selectedEl) return;
        state.selectedEl.style.left = Math.max(0, (paper.clientWidth / 2) - (state.selectedEl.clientWidth / 2)) + 'px';
        pushHistory();
    },
    toggleGroup: function() {
        if(state.multiSelected && state.multiSelected.length > 1) {
            let minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
            state.multiSelected.forEach(el => {
                const l = parseFloat(el.style.left), t = parseFloat(el.style.top), w = el.offsetWidth, h = el.offsetHeight;
                if(l < minL) minL = l; if(t < minT) minT = t; if(l + w > maxR) maxR = l + w + 10; if(t + h > maxB) maxB = t + h + 10;
            });
            const groupEl = createWrapper(`<div class="group-content" style="width:100%; height:100%; position:relative;"></div>`);
            groupEl.setAttribute('data-type', 'group'); groupEl.style.left = minL + 'px'; groupEl.style.top = minT + 'px';
            groupEl.style.width = (maxR - minL) + 'px'; groupEl.style.height = (maxB - minT) + 'px';
            const container = groupEl.querySelector('.group-content');
            state.multiSelected.forEach(el => {
                el.style.left = (parseFloat(el.style.left) - minL) + 'px'; el.style.top = (parseFloat(el.style.top) - minT) + 'px';
                el.classList.remove('selected'); el.querySelectorAll('.resize-handle, .rotate-handle, .rotate-stick').forEach(h => h.style.display = 'none');
                container.appendChild(el);
            });
            state.multiSelected = []; selectElement(groupEl); pushHistory();
        } else if(state.selectedEl && state.selectedEl.getAttribute('data-type') === 'group') {
            const groupEl = state.selectedEl, gL = parseFloat(groupEl.style.left), gT = parseFloat(groupEl.style.top);
            Array.from(groupEl.querySelectorAll('.group-content > .pub-element')).forEach(el => {
                el.style.left = (parseFloat(el.style.left) + gL) + 'px'; el.style.top = (parseFloat(el.style.top) + gT) + 'px';
                el.querySelectorAll('.resize-handle, .rotate-handle, .rotate-stick').forEach(h => h.style.display = 'block');
                paper.appendChild(el);
            });
            window.deselect(); groupEl.remove(); pushHistory();
        }
    },
    linkTextBox: function() {
        if(!state.selectedEl) return;
        window.isLinkingTextBox = true;
        window.linkingSourceBox = state.selectedEl;
        document.body.classList.add('linking-mode');
        const chainCursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>') 12 12, crosshair`;
        document.body.style.cursor = chainCursor;
        const paper = document.getElementById('paper');
        if (paper) paper.style.cursor = chainCursor;
    },
    setColumns: function() {
        if(!state.selectedEl) return;
        const content = state.selectedEl.querySelector('.element-content > div') || state.selectedEl.querySelector('.element-content');
        if(content && typeof DialogSystem !== 'undefined') {
            DialogSystem.show('Text Columns', '<div class="input-group"><label>Columns:</label><input type="number" id="ctx-cols" value="2" min="1" max="5"></div>', () => {
                content.style.columnCount = document.getElementById('ctx-cols').value; content.style.columnGap = '20px'; pushHistory();
            });
        }
    },
    openWordArtModal: function() {
        const floatBar = document.getElementById('float-toolbar'); if(floatBar) floatBar.style.display = 'none';
        const waModal = document.getElementById('wordart-modal'); if(waModal) { waModal.style.display = 'flex'; waModal.style.zIndex = '6000'; }
    },
    addDropShadow: function() { 
        if(state.selectedEl) { 
            const legacyInner = state.selectedEl.querySelector('img') || state.selectedEl.querySelector('svg');
            if (legacyInner && legacyInner.style.filter.includes('drop-shadow')) {
                legacyInner.style.filter = legacyInner.style.filter.replace(/drop-shadow\((?:[^)(]+|\([^)(]*\))*\)/g, '').trim();
            }
            const inner = state.selectedEl.querySelector('.element-content') || state.selectedEl;
            const currentFilter = inner.style.filter || '';
            if (currentFilter.includes('drop-shadow')) {
                inner.style.filter = currentFilter.replace(/drop-shadow\((?:[^)(]+|\([^)(]*\))*\)/g, '').trim();
                if (window.setShadowPaneVisibility) window.setShadowPaneVisibility(false);
            } else {
                inner.style.filter = (currentFilter + ' drop-shadow(5px 5px 10px rgba(0,0,0,0.6))').trim();
                if (window.setShadowPaneVisibility) window.setShadowPaneVisibility(true);
            }
            if (typeof pushHistory === 'function') pushHistory(); 
        } 
    },
    addGlow: function() { 
        if(state.selectedEl) { 
            const legacyInner = state.selectedEl.querySelector('img') || state.selectedEl.querySelector('svg');
            if (legacyInner && legacyInner.style.filter.includes('drop-shadow')) {
                legacyInner.style.filter = legacyInner.style.filter.replace(/drop-shadow\((?:[^)(]+|\([^)(]*\))*\)/g, '').trim();
            }
            const inner = state.selectedEl.querySelector('.element-content') || state.selectedEl;
            const currentFilter = inner.style.filter || '';
            if (currentFilter.includes('drop-shadow')) {
                inner.style.filter = currentFilter.replace(/drop-shadow\((?:[^)(]+|\([^)(]*\))*\)/g, '').trim();
                if (window.setShadowPaneVisibility) window.setShadowPaneVisibility(false);
            } else {
                inner.style.filter = (currentFilter + ' drop-shadow(0px 0px 15px rgba(0,191,255,0.8))').trim();
                if (window.setShadowPaneVisibility) window.setShadowPaneVisibility(true);
            }
            if (typeof pushHistory === 'function') pushHistory(); 
        } 
    },
    cropToShape: function() {
        if(state.selectedEl && state.selectedEl.querySelector('img') && typeof DialogSystem !== 'undefined') {
            DialogSystem.show('Crop to Shape', `
                <style>
                    .shape-crop-btn {
                        width: 100%;
                        background: var(--ui-panel-bg, white);
                        border: 1px solid var(--ui-theme-color) !important;
                        color: var(--ui-theme-color);
                        display: flex;
                        align-items: center;
                        justify-content: flex-start;
                        gap: 10px;
                        padding: 6px 15px;
                        border-radius: 20px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.2s;
                    }
                    .shape-crop-btn:hover {
                        background: color-mix(in srgb, var(--ui-theme-color) 10%, transparent);
                    }
                    .shape-crop-btn .icon {
                        width: 16px;
                        height: 16px;
                        background: var(--ui-theme-color);
                        flex-shrink: 0;
                    }
                </style>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; max-height:600px; overflow-y:auto; padding-right:10px;">
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='none'; document.getElementById('custom-dialog-confirm').click();" style="grid-column: 1 / -1; justify-content: center; color: var(--ui-text) !important; border-color: var(--ui-border) !important;">
                        <div style="width:16px; height:16px; border:2px dashed var(--ui-text-muted); flex-shrink:0;"></div> <span style="color: var(--ui-text);">Remove Crop</span>
                    </button>
                    <hr style="grid-column: 1 / -1; border:0; border-top:1px solid var(--ui-border); width:100%; margin: 5px 0;">
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='inset(0 round 8px)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:inset(0 round 2px);"></div> Rounded 8px
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='inset(0 round 16px)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:inset(0 round 4px);"></div> Rounded 16px
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='inset(0 round 24px)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:inset(0 round 6px);"></div> Rounded 24px
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='inset(0 round 32px)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:inset(0 round 8px);"></div> Rounded 32px
                    </button>

                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='circle(50%)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:circle(50%);"></div> Circle / Oval
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='polygon(50% 0%, 0% 100%, 100% 100%)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:polygon(50% 0%, 0% 100%, 100% 100%);"></div> Triangle
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);"></div> Diamond
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);"></div> Pentagon
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);"></div> Hexagon
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);"></div> Octagon
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);"></div> Star
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='polygon(33% 0%, 66% 0%, 66% 33%, 100% 33%, 100% 66%, 66% 66%, 66% 100%, 33% 100%, 33% 66%, 0% 66%, 0% 33%, 33% 33%)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:polygon(33% 0%, 66% 0%, 66% 33%, 100% 33%, 100% 66%, 66% 66%, 66% 100%, 33% 100%, 33% 66%, 0% 66%, 0% 33%, 33% 33%);"></div> Cross
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%);"></div> Right Arrow
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='polygon(40% 0%, 40% 20%, 100% 20%, 100% 80%, 40% 80%, 40% 100%, 0% 50%)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:polygon(40% 0%, 40% 20%, 100% 20%, 100% 80%, 40% 80%, 40% 100%, 0% 50%);"></div> Left Arrow
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);"></div> Trapezoid
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);"></div> Parallelogram
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%);"></div> Shield
                    </button>
                    
                    <button class="shape-crop-btn" onclick="document.getElementById('ctx-crop-shape').value='polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)'; document.getElementById('custom-dialog-confirm').click();">
                        <div class="icon" style="clip-path:polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%);"></div> Speech Bubble
                    </button>
                </div>
                <input type="hidden" id="ctx-crop-shape" value="none">
            `, () => {
                const shape = document.getElementById('ctx-crop-shape').value;
                const img = state.selectedEl.querySelector('img');
                const clip = shape === 'none' ? 'none' : shape;
                img.style.clipPath = clip;
                img.style.webkitClipPath = clip;
                pushHistory();
            });
        }
    },
    insertTableRow: function() { if(state.selectedEl && state.selectedEl.querySelector('table')) { const row = state.selectedEl.querySelector('table').insertRow(); for(let i=0; i<state.selectedEl.querySelector('table').rows[0].cells.length; i++) { const cell = row.insertCell(); cell.style.cssText = "border-right:1px solid #000; border-bottom:1px solid #000; height:20px; outline:none;"; cell.setAttribute('contenteditable', 'true'); } pushHistory(); } },
    insertTableCol: function() { if(state.selectedEl && state.selectedEl.querySelector('table')) { for(let i=0; i<state.selectedEl.querySelector('table').rows.length; i++) { const cell = state.selectedEl.querySelector('table').rows[i].insertCell(); cell.style.cssText = "border-right:1px solid #000; border-bottom:1px solid #000; min-width:20px; outline:none;"; cell.setAttribute('contenteditable', 'true'); } pushHistory(); } },
    tableStyle: function() { if(state.selectedEl && state.selectedEl.querySelector('table')) { const t = state.selectedEl.querySelector('table'); for(let i=0; i<t.rows.length; i++) { t.rows[i].style.background = (i % 2 === 0) ? '#f2f2f2' : '#ffffff'; if(i===0) { t.rows[i].style.background = 'var(--ui-theme-color)'; t.rows[i].style.color='white'; t.rows[i].style.fontWeight='bold'; } } pushHistory(); } },
    tableBorders: function() {
        if(state.selectedEl && state.selectedEl.querySelector('table') && typeof DialogSystem !== 'undefined') {
            DialogSystem.show('Table Borders', `
                <div class="input-group">
                    <label>Thickness (px):</label>
                    <div class="modern-spinner">
                        <input type="text" id="ctx-tbl-border" value="1" onchange="this.value = Math.max(0, Math.min(64, parseInt(this.value)||0))">
                        <div class="spin-btns">
                            <div onclick="document.getElementById('ctx-tbl-border').value=Math.min(64, parseInt(document.getElementById('ctx-tbl-border').value||0)+1)"><i class="fas fa-chevron-up"></i></div>
                            <div onclick="document.getElementById('ctx-tbl-border').value=Math.max(0, parseInt(document.getElementById('ctx-tbl-border').value||0)-1)"><i class="fas fa-chevron-down"></i></div>
                        </div>
                    </div>
                </div>
                <div class="input-group" style="margin-top:10px;">
                    <label>Diagonal Line (Selected Cells):</label>
                    <select id="ctx-tbl-diagonal" style="width:100%; padding:5px;">
                        <option value="none">None</option>
                        <option value="to bottom right">Top-Left to Bottom-Right</option>
                        <option value="to top right">Bottom-Left to Top-Right</option>
                    </select>
                </div>
            `, () => {
                const thic = document.getElementById('ctx-tbl-border').value;
                const diag = document.getElementById('ctx-tbl-diagonal').value;
                const t = state.selectedEl.querySelector('table');
                
                t.style.borderTop = t.style.borderLeft = `${thic}px solid #000`;
                for(let r=0; r<t.rows.length; r++) {
                    for(let c=0; c<t.rows[r].cells.length; c++) {
                        t.rows[r].cells[c].style.borderRight = t.rows[r].cells[c].style.borderBottom = `${thic}px solid #000`;
                    }
                }
                
                let targetCells = window._tableSelectedCells && window._tableSelectedCells.length > 0 ? window._tableSelectedCells : [t.rows[0].cells[0]];
                
                targetCells.forEach(cell => {
                    if (diag === 'none') {
                        cell.style.background = '';
                    } else {
                        const thickness = Math.max(1, parseInt(thic));
                        cell.style.background = `linear-gradient(${diag}, transparent calc(50% - ${thickness/2}px), #000 calc(50% - ${thickness/2}px), #000 calc(50% + ${thickness/2}px), transparent calc(50% + ${thickness/2}px))`;
                    }
                });
                
                pushHistory();
            });
        }
    },
    convertTableToText: function() {
        if(!state.selectedEl) return;
        const t = state.selectedEl.querySelector('table');
        if(!t) return;
        if(typeof DialogSystem !== 'undefined') {
            DialogSystem.show('Convert Table to Text', `
                <div style="margin-bottom:15px; font-size:14px;">
                    <p style="margin-top:0;">Separate text with:</p>
                    <div style="margin-bottom:8px;"><label><input type="radio" name="ctx-tbl-sep" value="tab" checked> Tabs</label></div>
                    <div style="margin-bottom:8px;"><label><input type="radio" name="ctx-tbl-sep" value="comma"> Commas</label></div>
                    <div style="margin-bottom:8px;"><label><input type="radio" name="ctx-tbl-sep" value="para"> Paragraph marks</label></div>
                    <div><label><input type="radio" name="ctx-tbl-sep" value="other" id="ctx-tbl-sep-other-radio"> Other: <input type="text" id="ctx-tbl-sep-other" style="width:30px; text-align:center; padding:2px; border:1px solid #ccc; border-radius:3px;" maxlength="1" onfocus="document.getElementById('ctx-tbl-sep-other-radio').checked=true"></label></div>
                </div>
            `, () => {
                const sepRadios = document.getElementsByName('ctx-tbl-sep');
                let sepType = 'tab';
                for(let r of sepRadios) if(r.checked) sepType = r.value;
                
                let sep = ''; 
                if(sepType === 'comma') sep = ', ';
                else if(sepType === 'para') sep = '<br>';
                else if(sepType === 'other') {
                    const custom = document.getElementById('ctx-tbl-sep-other').value;
                    sep = custom.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    if(!sep) sep = ' ';
                } else {
                    sep = '&nbsp;&nbsp;&nbsp;&nbsp;';
                }

                let html = '';
                for(let r=0; r<t.rows.length; r++) {
                    let rowText = [];
                    for(let c=0; c<t.rows[r].cells.length; c++) {
                        let text = t.rows[r].cells[c].innerText.trim();
                        text = text.replace(/\\n/g, '<br>');
                        rowText.push(text);
                    }
                    html += rowText.join(sep);
                    if(r < t.rows.length - 1) html += '<br>';
                }

                const div = document.createElement('div');
                div.style.padding = '10px';
                div.style.height = '100%';
                div.style.wordWrap = 'break-word';
                div.style.boxSizing = 'border-box';
                div.innerHTML = html;
                div.setAttribute('contenteditable', 'true');

                const contentWrapper = state.selectedEl.querySelector('.element-content');
                if (contentWrapper) {
                    contentWrapper.innerHTML = '';
                    contentWrapper.appendChild(div);
                } else {
                    // Fallback just in case
                    state.selectedEl.innerHTML = '';
                    state.selectedEl.appendChild(div);
                }
                
                // Force ribbon switch from Table Design to Text Box Tools
                if(typeof switchTab === 'function') switchTab('format-text');
                if(typeof updateRibbon === 'function') updateRibbon();
                
                pushHistory();
            });
        }

        setTimeout(() => {
            const input = document.getElementById('doc-protect-pw');
            if (input) input.focus();
        }, 100);
    }
};

window.ContextRibbonSystem = {
    init: function() {
        const clipGroup = `<div class="group"><div class="tool-btn" onclick="copyEl()"><i class="fas fa-copy" style="color:var(--ui-theme-color)"></i> Copy</div><div class="tool-btn" onclick="ContextMenuActions.pasteNormal()"><i class="fas fa-paste" style="color:var(--ui-theme-color)"></i> Paste</div><div class="group-label">Clipboard</div></div>`;
        const arrGroup = `<div class="group"><div class="tool-btn" onclick="bringFront()"><i class="fas fa-arrow-up" style="color:var(--ui-theme-color)"></i> Front</div><div class="tool-btn" onclick="sendBack()"><i class="fas fa-arrow-down" style="color:var(--ui-theme-color)"></i> Back</div><div class="tool-btn" onclick="ContextRibbonActions.alignCenter()"><i class="fas fa-align-center" style="color:var(--ui-theme-color)"></i> Align</div><div class="tool-btn" onclick="ContextRibbonActions.toggleGroup()"><i class="fas fa-object-group" style="color:var(--ui-theme-color)"></i> Group</div><div class="tool-btn" onclick="toggleRotateMenu(this); event.stopPropagation();"><i class="fas fa-sync-alt" style="color:var(--ui-theme-color)"></i> Rotate <i class="fas fa-caret-down"></i></div><div class="tool-btn" onclick="deleteSelected()" style="color:#c00;"><i class="fas fa-trash-alt" style="color:var(--ui-theme-color);"></i> Delete</div><div class="group-label">Arrange</div></div>`;
        const drawGroup = `<div class="group drawing-tools-group"><div class="tool-btn drawing-tool-btn" data-tool="pencil" onclick="if(typeof startDrawing==='function') startDrawing('pencil')"><i class="fas fa-pencil-alt" style="color:var(--ui-theme-color)"></i> Pencil</div><div class="tool-btn drawing-tool-btn" data-tool="brush" onclick="if(typeof startDrawing==='function') startDrawing('brush')"><i class="fas fa-paint-brush" style="color:var(--ui-theme-color)"></i> Brush</div><div class="tool-btn drawing-tool-btn" data-tool="spray" onclick="if(typeof startDrawing==='function') startDrawing('spray')"><i class="fas fa-spray-can" style="color:var(--ui-theme-color)"></i> Spray</div><div class="tool-btn drawing-tool-btn" data-tool="eraser" onclick="if(typeof startDrawing==='function') startDrawing('eraser')"><i class="fas fa-eraser" style="color:var(--ui-theme-color)"></i> Eraser</div><div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; margin: 0 5px;"><div class="drawing-color-picker" style="width:25px; height:25px; background-color:#000000; border:none; padding:0; cursor:pointer; border-radius: 6px; box-shadow: 0 0 2px rgba(0,0,0,0.3); outline: none;" title="Drawing Color" onclick="CustomColorPicker.open(this, this.style.backgroundColor || '#000000', (c) => { this.style.backgroundColor = c; if(typeof updateDrawingColor === 'function') updateDrawingColor(c); })"></div><div class="tool-btn finish-drawing-btn" onclick="if(typeof finishDrawing==='function') finishDrawing()" style="color:var(--ui-theme-color); font-weight:bold; display:none; padding: 2px 5px; min-width:unset;"><i class="fas fa-check-circle"></i> Done</div></div><div class="group-label">Drawing</div></div>`;
        const sizeGroup = `
            <div class="group">
                <div style="display:flex; flex-direction:column; justify-content:center; gap:3px; padding:0 4px; font-size:11px; height:100%;">
                    <div style="display:flex; align-items:center; justify-content:space-between;">
                        <label class="ribbon-mini-label" style="margin-right:4px;">W:</label>
                        <div class="modern-spinner" style="width:54px;">
                            <input type="text" id="ribbon-el-w" onchange="ContextRibbonActions.updateElementSize('w', this.value)">
                            <div class="spin-btns">
                                <div onclick="document.getElementById('ribbon-el-w').value=parseInt(document.getElementById('ribbon-el-w').value||0)+1; ContextRibbonActions.updateElementSize('w', document.getElementById('ribbon-el-w').value)"><i class="fas fa-chevron-up"></i></div>
                                <div onclick="document.getElementById('ribbon-el-w').value=Math.max(1,parseInt(document.getElementById('ribbon-el-w').value||0)-1); ContextRibbonActions.updateElementSize('w', document.getElementById('ribbon-el-w').value)"><i class="fas fa-chevron-down"></i></div>
                            </div>
                        </div>
                        <span class="ribbon-mini-label" style="margin-left:4px;">px</span>
                    </div>
                    <div style="display:flex; align-items:center; justify-content:space-between;">
                        <label class="ribbon-mini-label" style="margin-right:4px;">H:</label>
                        <div class="modern-spinner" style="width:54px;">
                            <input type="text" id="ribbon-el-h" onchange="ContextRibbonActions.updateElementSize('h', this.value)">
                            <div class="spin-btns">
                                <div onclick="document.getElementById('ribbon-el-h').value=parseInt(document.getElementById('ribbon-el-h').value||0)+1; ContextRibbonActions.updateElementSize('h', document.getElementById('ribbon-el-h').value)"><i class="fas fa-chevron-up"></i></div>
                                <div onclick="document.getElementById('ribbon-el-h').value=Math.max(1,parseInt(document.getElementById('ribbon-el-h').value||0)-1); ContextRibbonActions.updateElementSize('h', document.getElementById('ribbon-el-h').value)"><i class="fas fa-chevron-down"></i></div>
                            </div>
                        </div>
                        <span class="ribbon-mini-label" style="margin-left:4px;">px</span>
                    </div>
                    <div style="display:flex; align-items:center; margin-top:2px; cursor:pointer;" onclick="const cb = document.getElementById('ribbon-el-lock'); cb.checked = !cb.checked; ContextRibbonActions.toggleAspectLock(cb.checked);">
                        <input type="checkbox" id="ribbon-el-lock" style="margin:0 4px 0 0; cursor:pointer; accent-color: var(--ui-theme-color);" onchange="ContextRibbonActions.toggleAspectLock(this.checked); event.stopPropagation();">
                        <span class="ribbon-mini-label" style="user-select:none;">Lock aspect ratio</span>
                    </div>
                </div>
                <div class="group-label">Size</div>
            </div>`;

        const tabsC = document.querySelector('.ribbon-tabs');
        if (tabsC && !document.getElementById('tab-format-text')) {
            tabsC.insertAdjacentHTML('beforeend', `<div class="tab contextual-tab tab-text" onclick="switchTab('format-text')" id="tab-format-text">Text Box Tools</div><div class="tab contextual-tab tab-wordart" onclick="switchTab('format-wordart')" id="tab-format-wordart">WordArt Tools</div><div class="tab contextual-tab tab-pic" onclick="switchTab('format-pic')" id="tab-format-pic">Picture Tools</div><div class="tab contextual-tab tab-shape" onclick="switchTab('format-shape')" id="tab-format-shape">Drawing Tools</div><div class="tab contextual-tab tab-table" onclick="switchTab('table-design')" id="tab-table-design">Table Design</div>`);
        }

        const ribC = document.querySelector('.ribbon-container');
        if (ribC && !document.getElementById('ribbon-format-text')) {
            ribC.insertAdjacentHTML('beforeend', `
                <div class="ribbon-toolbar contextual-toolbar" id="ribbon-format-text">${clipGroup}<div class="group"><div class="tool-btn" onclick="ContextRibbonActions.linkTextBox()"><i class="fas fa-link" style="color:var(--ui-theme-color)"></i> Link</div><div class="tool-btn" onclick="if(typeof ContextMenuActions !== 'undefined') ContextMenuActions.bestFitText()"><i class="fas fa-compress-arrows-alt" style="color:var(--ui-theme-color)"></i> Fit</div><div class="tool-btn" id="btn-shrink-overflow" onclick="if(typeof ContextMenuActions !== 'undefined') ContextMenuActions.toggleShrinkOverflow()"><i class="fas fa-compress" style="color:var(--ui-theme-color)"></i> Shrink Text<br>on Overflow</div><div class="tool-btn" id="btn-grow-fit" onclick="if(typeof ContextMenuActions !== 'undefined') ContextMenuActions.toggleGrowFit()"><i class="fas fa-text-height" style="color:var(--ui-theme-color)"></i> Grow Box<br>to Fit</div><div class="group-label">Text Flow</div></div><div class="group"><div class="tool-btn" onclick="if(typeof ContextMenuActions !== 'undefined') ContextMenuActions.alignTextVertical('top')"><i class="fas fa-align-left" style="transform: rotate(90deg); color:var(--ui-theme-color)"></i> Top</div><div class="tool-btn" onclick="if(typeof ContextMenuActions !== 'undefined') ContextMenuActions.alignTextVertical('center')"><i class="fas fa-align-center" style="transform: rotate(90deg); color:var(--ui-theme-color)"></i> Middle</div><div class="tool-btn" onclick="if(typeof ContextMenuActions !== 'undefined') ContextMenuActions.alignTextVertical('bottom')"><i class="fas fa-align-right" style="transform: rotate(90deg); color:var(--ui-theme-color)"></i> Bottom</div><div class="group-label">Alignment</div></div><div class="group"><div class="tool-btn" onclick="if(typeof ContextMenuActions !== 'undefined') ContextMenuActions.changeCase()"><i class="fas fa-font" style="color:var(--ui-theme-color)"></i> Change Case</div><div class="tool-btn" onclick="if(typeof ContextMenuActions !== 'undefined') ContextMenuActions.dropCap()"><i class="fas fa-heading" style="color:var(--ui-theme-color)"></i> Drop Cap</div><div class="tool-btn" onclick="ContextRibbonActions.setColumns()"><i class="fas fa-columns" style="color:var(--ui-theme-color)"></i> Columns</div><div class="tool-btn" onclick="showLineSpacingModal()"><i class="fas fa-arrows-alt-v" style="color:var(--ui-theme-color)"></i> Line<br>Spacing</div><div class="group-label">Typography</div></div>${arrGroup}<div class="group"><div class="tool-btn" onclick="document.getElementById('paper').classList.toggle('show-text-blocks')"><i class="fas fa-paragraph" style="color:var(--ui-theme-color)"></i> ¶ Blocks</div><div class="tool-btn" onclick="toggleSnapMenu(this); event.stopPropagation();"><i class="fas fa-magnet" style="color:var(--ui-theme-color)"></i> Snap To <i class="fas fa-caret-down"></i></div><div class="group-label">Layout</div></div></div>
                <div class="ribbon-toolbar contextual-toolbar" id="ribbon-format-wordart">${clipGroup}<div class="group"><div class="tool-btn" onclick="if(typeof ContextMenuActions !== 'undefined') ContextMenuActions.bestFitText()"><i class="fas fa-expand-arrows-alt" style="color:var(--ui-theme-color)"></i> Fit to Box</div><div class="tool-btn" onclick="ContextRibbonActions.openWordArtModal()"><i class="fas fa-font" style="color:var(--ui-theme-color)"></i> Change Style</div><div class="group-label">WordArt Options</div></div>${arrGroup}</div>
                <div class="ribbon-toolbar contextual-toolbar" id="ribbon-format-pic">${clipGroup}<div class="group"><div class="tool-btn" onclick="if(typeof editSelectedImageDrawing === 'function') editSelectedImageDrawing()"><i class="fas fa-paint-brush" style="color:var(--ui-theme-color)"></i> Edit</div><div class="group-label">Draw</div></div><div class="group"><div class="tool-btn" onclick="toggleRecolorMenu(this); event.stopPropagation();"><i class="fas fa-tint" style="color:var(--ui-theme-color)"></i> Recolor</div><div class="tool-btn" onclick="if(typeof ContextMenuActions !== 'undefined') ContextMenuActions.changePicture()"><i class="fas fa-exchange-alt" style="color:var(--ui-theme-color)"></i> Swap</div><div class="tool-btn" onclick="if(typeof compressSelectedPicture === 'function') compressSelectedPicture()"><i class="fas fa-compress-arrows-alt" style="color:var(--ui-theme-color)"></i> Compress<br>Pictures</div><div class="group-label">Adjust</div></div><div class="group"><div class="tool-btn" onclick="ContextRibbonActions.addDropShadow()"><i class="fas fa-clone" style="color:var(--ui-theme-color)"></i> Shadow</div><div class="tool-btn" onclick="ContextRibbonActions.addGlow()"><i class="fas fa-sun" style="color:var(--ui-theme-color)"></i> Glow</div><div class="tool-btn" onclick="if(typeof toggleCrop === 'function') toggleCrop()"><i class="fas fa-crop" style="color:var(--ui-theme-color)"></i> Crop</div><div class="tool-btn" onclick="ContextRibbonActions.cropToShape()"><i class="fas fa-draw-polygon" style="color:var(--ui-theme-color)"></i> Shape Crop</div><div class="group-label">Picture Styles</div></div>${arrGroup}<div class="group"><div class="tool-btn" onclick="toggleSnapMenu(this); event.stopPropagation();"><i class="fas fa-magnet" style="color:var(--ui-theme-color)"></i> Snap To <i class="fas fa-caret-down"></i></div><div class="group-label">Layout</div></div>${sizeGroup}</div>
                <div class="ribbon-toolbar contextual-toolbar" id="ribbon-format-shape">${clipGroup}<div class="group"><div class="tool-btn" onclick="document.getElementById('shape-dropdown').style.display='block'"><i class="fas fa-shapes" style="color:var(--ui-theme-color)"></i> Shapes</div><div class="tool-btn" onclick="if(typeof ContextMenuActions !== 'undefined') ContextMenuActions.formatTextBox()"><div style="display:flex; flex-direction:column; align-items:center; margin-bottom: 2px;"><i class="fas fa-fill-drip"></i><div style="height: 4px; width: 20px; background: var(--ui-theme-color); margin-top: 2px;"></div></div>Shape Fill</div><div class="tool-btn" onclick="ContextRibbonActions.addDropShadow()"><i class="fas fa-clone" style="color:var(--ui-theme-color)"></i> Shadow</div><div class="tool-btn" onclick="ContextRibbonActions.addGlow()"><i class="fas fa-sun" style="color:var(--ui-theme-color)"></i> Glow</div><div class="group-label">Shape Styles</div></div>${drawGroup}${arrGroup}${sizeGroup}</div>
                <div class="ribbon-toolbar contextual-toolbar" id="ribbon-table-design">${clipGroup}<div class="group"><div class="tool-btn" onclick="ContextRibbonActions.tableStyle()"><i class="fas fa-table" style="color:var(--ui-theme-color)"></i> Styles</div><div class="tool-btn" onclick="ContextRibbonActions.tableBorders()"><i class="fas fa-border-all" style="color:var(--ui-theme-color)"></i> Borders</div><div class="tool-btn" onclick="showLineSpacingModal()"><i class="fas fa-arrows-alt-v" style="color:var(--ui-theme-color)"></i> Line<br>Spacing</div><div class="tool-btn" onclick="ContextRibbonActions.convertTableToText()"><i class="fas fa-align-left" style="color:var(--ui-theme-color)"></i> Convert<br>to Text</div><div class="group-label">Table Formats</div></div>${arrGroup}</div>
            `);
            initRibbonResponsiveness();
        }

        if (!window.originalSelectElementForRibbon) {
            window.originalSelectElementForRibbon = window.selectElement;
            window.originalDeselectForRibbon = window.deselect;
            window.selectElement = function(el) { if (window.originalSelectElementForRibbon) window.originalSelectElementForRibbon(el); window.ContextRibbonSystem.updateTabs(el); };
            window.deselect = function() { if (window.originalDeselectForRibbon) window.originalDeselectForRibbon(); window.ContextRibbonSystem.hideAllTabs(); };
        }
    },
    updateTabs: function(el) {
        this.hideAllTabs(false); if (!el) return;
        const isImage = el.querySelector('img') || el.getAttribute('data-type') === 'emoji', isShape = el.getAttribute('data-type') === 'shape', isWordArt = el.querySelector('.wa-text'), isTable = el.querySelector('table'), isText = !isImage && !isShape && !isWordArt && !isTable;
        let tabIdToOpen = null;
        if (isImage) { document.getElementById('tab-format-pic').style.display = 'inline-block'; tabIdToOpen = 'format-pic'; } 
        else if (isTable) { 
            document.getElementById('tab-table-design').style.display = 'inline-block'; 
            tabIdToOpen = 'table-design'; 
            document.getElementById('op-table-sidebar')?.classList.add('visible'); 
            const firstCell = el.querySelector('td, th');
            if (firstCell) {
                const padVal = parseInt(firstCell.style.padding) || 0;
                const slider = document.getElementById('table-padding-slider');
                const label = document.getElementById('val-cell-padding');
                if (slider) slider.value = padVal;
                if (label) label.innerText = padVal + 'px';
            }
        }
        else if (isShape) { document.getElementById('tab-format-shape').style.display = 'inline-block'; tabIdToOpen = 'format-shape'; } 
        else if (isWordArt) { document.getElementById('tab-format-wordart').style.display = 'inline-block'; tabIdToOpen = 'format-wordart'; } 
        else if (isText) { 
            document.getElementById('tab-format-text').style.display = 'inline-block'; 
            tabIdToOpen = 'format-text'; 
            const shrinkBtn = document.getElementById('btn-shrink-overflow');
            if (shrinkBtn) {
                if (el.getAttribute('data-shrink-overflow') === 'true') {
                    shrinkBtn.classList.add('active');
                } else {
                    shrinkBtn.classList.remove('active');
                }
            }
            const growBtn = document.getElementById('btn-grow-fit');
            if (growBtn) {
                if (el.getAttribute('data-grow-fit') === 'true') {
                    growBtn.classList.add('active');
                } else {
                    growBtn.classList.remove('active');
                }
            }
        }
        if (tabIdToOpen) window.switchTab(tabIdToOpen);

        const wInput = document.getElementById('ribbon-el-w');
        const hInput = document.getElementById('ribbon-el-h');
        const lockInput = document.getElementById('ribbon-el-lock');
        if (wInput && hInput && lockInput) {
            wInput.value = parseInt(el.offsetWidth);
            hInput.value = parseInt(el.offsetHeight);
            lockInput.checked = el.getAttribute('data-aspect-lock') === 'true';
            if (!el.hasAttribute('data-aspect-ratio')) el.setAttribute('data-aspect-ratio', (el.offsetWidth / el.offsetHeight) || 1);
        }
    },
    hideAllTabs: function() {
        document.querySelectorAll('.contextual-tab').forEach(tab => { tab.style.display = 'none'; });
        document.getElementById('op-table-sidebar')?.classList.remove('visible');
        let activeTab = document.querySelector('.tab.active');
        if (!activeTab || activeTab.classList.contains('contextual-tab') || activeTab.style.display === 'none') {
            window.switchTab(window.lastStandardTab || 'home');
        }

        setTimeout(() => {
            const input = document.getElementById('doc-protect-pw');
            if (input) input.focus();
        }, 100);
    }
};



// ==========================================
// ACCESSIBILITY HIGHLIGHTER
// ==========================================

window.highlightIssueElement = function(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    if (typeof DialogSystem !== 'undefined') DialogSystem.close();
    
    if (typeof selectElement === 'function') {
        selectElement(el, new Event('click'));
    }
    
    el.style.transition = 'box-shadow 0.2s, transform 0.2s';
    el.style.boxShadow = '0 0 0 4px #ef4444';
    el.style.transform = 'scale(1.02)';
    el.style.zIndex = '9999';
    
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    
    setTimeout(() => {
        el.style.boxShadow = '';
        el.style.transform = '';
        el.style.zIndex = '';
        setTimeout(() => { el.style.transition = ''; }, 200);
    }, 1500);
};