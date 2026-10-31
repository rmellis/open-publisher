/* =========================================================================
   CONTEXT MENU ADDON (DYNAMIC RIGHT-CLICK SYSTEM - v5.11.9)
========================================================================= */

const ContextMenuSystem = {
    init: function() {
        // 1. Inject Windows 11 / Publisher Green Theme CSS for the menu
        // Extracted full style block

        // 2. Create the DOM element
        this.menuEl = document.createElement('div');
        this.menuEl.className = 'pub-context-menu';
        document.body.appendChild(this.menuEl);

        // 3. Attach Global Event Listeners
        document.addEventListener('contextmenu', (e) => this.handleRightClick(e));
        document.addEventListener('click', () => this.hide());
        // Hide on scroll or zoom
        window.addEventListener('wheel', () => this.hide()); 
    },

    handleRightClick: function(e) {
        // Evaluate the exact target
        const isPaperOrInside = e.target.closest('#paper') !== null;
        const isWorkspace = e.target.closest('#viewport') !== null;
        const isMarginGuides = e.target.classList.contains('margin-guides');
        
        const isSidebarBlank = e.target.closest('#sidebar') && !e.target.closest('.page-thumb-container');
        const isRuler = e.target.closest('.ruler-h') || e.target.closest('.ruler-v') || e.target.closest('.ruler-c');
        
        const isRibbonBlank = e.target.closest('.ribbon-container') && !e.target.closest('.tool-btn, .modern-select, .group-label, .ribbon-tabs, input, select');
        
        const isTitleBar = e.target.closest('.title-bar') !== null || e.target.closest('.ribbon-tabs') !== null;
        const isDocTitle = e.target.closest('#doc-title') !== null;
        
        const isZoomBar = e.target.closest('#zoom-slider-container') !== null;
        
        // Let default browser menu happen ONLY on text inputs and selects
        const targetInput = e.target.closest('input');
        if ((targetInput && targetInput.type !== 'range' && targetInput.type !== 'color') || e.target.closest('textarea') || e.target.closest('select')) {
            return;
        }

        e.preventDefault();
        this.hide();

        const el = e.target.closest('.pub-element');
        
        // If right-clicking an element, select it first
        if(el && state.selectedEl !== el) selectElement(el);
        if(!el && (isPaperOrInside || isMarginGuides)) deselect();

        // Build dynamic menu based on target
        window._contextTargetLink = e.target.closest('a');
        
        const sel = window.getSelection();
        let preservedRange = null;
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
            let r = sel.getRangeAt(0);
            const selStr = sel.toString();
            // If the user selected a word or text that captured trailing whitespace (e.g. Chromium double-click),
            // trim the trailing whitespace so context actions (Cut, Copy) and the highlight target strictly the word.
            if (/\s+$/.test(selStr)) {
                const count = selStr.match(/\s+$/)[0].length;
                if (r.endContainer.nodeType === 3 && r.endOffset >= count) {
                    try {
                        r = r.cloneRange();
                        r.setEnd(r.endContainer, r.endOffset - count);
                        sel.removeAllRanges();
                        sel.addRange(r);
                    } catch(err) {}
                }
            }
            preservedRange = r.cloneRange();
            window._contextTargetRange = preservedRange;
            if (typeof state !== 'undefined') {
                state.lastRange = window._contextTargetRange;
            }
        } else {
            window._contextTargetRange = null;
        }
        
        let html = '';

        if (isRibbonBlank) {
            html += this.buildItem('Toggle Fullscreen', 'fa-expand', 'if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(e => console.log(e)); } else { document.exitFullscreen(); }');
            html += this.buildItem('Export to PDF', 'fa-file-pdf', 'if(window.exportNativePDF) window.exportNativePDF()');
            html += this.buildItem('Save Project', 'fa-save', 'if(window.saveDocument) window.saveDocument()');
            html += this.buildDivider();
            html += this.buildItem('Show / Hide Rulers', 'fa-ruler-combined', 'if(window.toggleRulers) window.toggleRulers()');
            html += this.buildItem('Toggle Grid Background', 'fa-border-all', 'if(window.toggleGrid) window.toggleGrid()');
            html += this.buildDivider();
            html += this.buildItem('Reload App', 'fa-sync-alt', 'window.location.reload()');
        }
        else if (isTitleBar) {
            html += this.buildItem('Rename Publication', 'fa-pen', 'document.getElementById("doc-title").focus(); window.getSelection().selectAllChildren(document.getElementById("doc-title"));');
            
            if (isDocTitle) {
                html += this.buildDivider();
                
                const clipboardMsg = `DialogSystem.show('Clipboard', '<div style=&quot;display:flex; align-items:center; gap:20px;&quot;><i class=&quot;fas fa-info-circle fa-2x&quot; style=&quot;color:var(--ui-theme-color);&quot;></i><div style=&quot;font-size:14px; max-width:350px; line-height:1.4;&quot;>OpenPublisher was prevented from reading your clipboard, or no data is present. Please use the keyboard shortcuts for clipboard actions.<br><br>• <b>Cut:</b> Ctrl + X (or Cmd + X on Mac)<br>• <b>Copy:</b> Ctrl + C (or Cmd + C on Mac)<br>• <b>Paste:</b> Ctrl + V (or Cmd + V on Mac)</div></div>', null, true)`;
                
                html += this.buildItem('Cut', 'fa-cut', clipboardMsg);
                html += this.buildItem('Copy', 'fa-copy', clipboardMsg);
                html += this.buildItem('Paste', 'fa-paste', clipboardMsg);
            }
            
            html += this.buildDivider();
            html += this.buildItem('Page Setup', 'fa-file-invoice', 'if(typeof changeSize === "function") changeSize()');
            html += this.buildItem('Format Background', 'fa-fill-drip', 'if(window.ContextMenuActions) ContextMenuActions.formatBackground()');
            html += this.buildDivider();
            html += this.buildItem('Save Publication', 'fa-save', 'if(window.saveDocument) window.saveDocument()');
            html += this.buildItem('Export to PDF', 'fa-file-pdf', 'if(window.exportNativePDF) window.exportNativePDF()');
            html += this.buildItem('Print Document', 'fa-print', 'if(window.printFullDocument) window.printFullDocument()');
            html += this.buildDivider();
            html += this.buildItem('Reload App', 'fa-sync-alt', 'window.location.reload()');
            html += this.buildItemRaw('Knowledge Base', '<img src="ui/icons/kb.webp" style="width:14px; height:14px; object-fit:contain;">', 'if(window.showKnowledgeBase) window.showKnowledgeBase()');
            html += this.buildItem('About Open Publisher', 'fa-info-circle', 'if(window.showAboutDialog) window.showAboutDialog()');
        }
        else if (isRuler) {
            const currentUnit = (typeof state !== 'undefined' && state._userExplicitRulerUnit && state.rulerUnit) ? state.rulerUnit : 'cm';
            const checkIcon = '<i class="fas fa-check" style="margin-left: auto; color: var(--ui-theme-color); -webkit-text-stroke: 1px var(--ui-theme-color);"></i>';
            
            html += this.buildItem('Centimeters (cm)' + (currentUnit === 'cm' ? checkIcon : ''), 'fa-ruler-horizontal', "if(window.setRulerUnit) window.setRulerUnit('cm')");
            html += this.buildItem('Inches (in)' + (currentUnit === 'in' ? checkIcon : ''), 'fa-ruler-horizontal', "if(window.setRulerUnit) window.setRulerUnit('in')");
            html += this.buildItem('Millimeters (mm)' + (currentUnit === 'mm' ? checkIcon : ''), 'fa-ruler-horizontal', "if(window.setRulerUnit) window.setRulerUnit('mm')");
            html += this.buildItem('Pixels (px)' + (currentUnit === 'px' ? checkIcon : ''), 'fa-ruler-horizontal', "if(window.setRulerUnit) window.setRulerUnit('px')");

            html += this.buildDivider();
            html += this.buildItem('Hide Rulers', 'fa-eye-slash', 'if(window.toggleRulers) window.toggleRulers()');
            html += this.buildItem('Toggle Margins', 'fa-vector-square', 'if(window.toggleMargins) window.toggleMargins()');
            html += this.buildItem('Page Design / Size', 'fa-ruler-combined', 'changeSize()');
            html += this.buildItem('Change Background', 'fa-fill-drip', 'if(window.ContextMenuActions) ContextMenuActions.formatBackground()');
            
            html += this.buildDivider();
            
            const checkGrid = 'Snap to Grid' + (state.snap.grid ? checkIcon : '');
            const checkGuides = 'Snap to Guides' + (state.snap.guides ? checkIcon : '');
            const checkObjects = 'Snap to Objects' + (state.snap.objects ? checkIcon : '');

            html += this.buildItem(checkGrid, 'fa-border-all', "if(window.toggleSnapOption) window.toggleSnapOption('grid')");
            html += this.buildItem(checkGuides, 'fa-ruler-combined', "if(window.toggleSnapOption) window.toggleSnapOption('guides')");
            html += this.buildItem(checkObjects, 'fa-shapes', "if(window.toggleSnapOption) window.toggleSnapOption('objects')");
        }
        else if (isSidebarBlank) {
            html += this.buildItem('Insert Blank Page', 'fa-file-medical', 'addNewPage()');
            html += this.buildItem('Insert Template Page...', 'fa-columns', 'if(window.showInsertTemplateModal) window.showInsertTemplateModal()');
            html += this.buildItem('Duplicate Current Page', 'fa-copy', 'if(window.contextDuplicatePage) window.contextDuplicatePage()');
            html += this.buildItem('Delete Current Page', 'fa-trash-alt', `deletePage(${state.currentPageIndex}, event)`);
            
            html += this.buildDivider();
            
            html += this.buildItem('Toggle Spreads', 'fa-book-open', 'if(window.toggleSpreadMode) window.toggleSpreadMode()');
            html += this.buildItem('Collapse Sidebar', 'fa-compress-arrows-alt', "if(window.toggleSidebar) window.toggleSidebar(true)");
            
            html += this.buildDivider();
            
            html += this.buildItem('Page Design / Size', 'fa-ruler-combined', 'changeSize()');
            html += this.buildItem('Export to PDF', 'fa-file-pdf', 'if(window.exportNativePDF) window.exportNativePDF()');
            html += this.buildItem('Print Document', 'fa-print', 'if(window.printFullDocument) window.printFullDocument()');
        }
        else if (!el && isWorkspace && !isPaperOrInside && !isMarginGuides) {
            // --- PASTEBOARD MENU ---
            const canPaste = ''; // Always enabled so we can check OS clipboard securely on click
            
            html += this.buildItem('Paste', 'fa-paste', `if(window.ContextMenuActions) ContextMenuActions.pasteNormal()`, canPaste);
            html += this.buildItem('Select All', 'fa-object-group', 'if(window.selectAllElements) window.selectAllElements()');
            html += this.buildDivider();
            html += this.buildItem('Toggle Rulers', 'fa-ruler-combined', 'if(window.toggleRulers) window.toggleRulers()');
            html += this.buildItem('Toggle Boundaries', 'fa-border-all', "document.getElementById('paper').classList.toggle('show-boundaries')");
            html += this.buildItem('Toggle Focus Mode', 'fa-moon', 'if(window.WritersSuite && window.WritersSuite.toggleFocusMode) window.WritersSuite.toggleFocusMode()');
            html += this.buildItem('3D Topology View', 'fa-cube', 'if(window.toggle3DView) window.toggle3DView()');
            html += this.buildDivider();
            
            html += this.buildFlyoutItem('Snapping...', 'fa-magnet', `
                ${this.buildItem('Snap to Grid', 'fa-th', "if(window.toggleSnapOption) window.toggleSnapOption('grid')")}
                ${this.buildItem('Snap to Objects', 'fa-object-align-left', "if(window.toggleSnapOption) window.toggleSnapOption('objects')")}
            `);
            
            html += this.buildDivider();
            html += this.buildItem('Page Orientation', 'fa-sync-alt', 'if(window.toggleOrientation) window.toggleOrientation()');
            html += this.buildItem('Toggle Spreads', 'fa-book-open', 'if(window.toggleSpreadMode) window.toggleSpreadMode()');
            html += this.buildItem('Multi-Page Overview', 'fa-th-large', 'if(window.toggleMultiPageView) window.toggleMultiPageView()');
            html += this.buildItem('Run Design Checker', 'fa-stethoscope', 'if(window.showInfoModal) { window.showInfoModal(); setTimeout(window.runDesignChecker, 300); }');
        }
        else if (isZoomBar) {
            // --- ZOOM BAR MENU ---
            for (let i = 60; i <= 200; i += 10) {
                const icon = i < 100 ? 'fa-search-minus' : (i > 100 ? 'fa-search-plus' : 'fa-search');
                html += this.buildItem(i + '%', icon, `setZoom(${(i / 100).toFixed(2)})`);
            }
        }
        else if (!isPaperOrInside && !isWorkspace && !el) {
            // --- GENERIC FALLBACK MENU ---
            html += this.buildItem('Toggle Fullscreen', 'fa-expand', 'if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(e => console.log(e)); } else { document.exitFullscreen(); }');
            html += this.buildDivider();
            html += this.buildItem('Save Publication', 'fa-save', 'if(window.saveDocument) window.saveDocument()');
            html += this.buildItem('Export to PDF', 'fa-file-pdf', 'if(window.exportNativePDF) window.exportNativePDF()');
            html += this.buildItem('Print Document', 'fa-print', 'if(window.printFullDocument) window.printFullDocument()');
            html += this.buildDivider();
            html += this.buildItem('Reload App', 'fa-sync-alt', 'window.location.reload()');
            html += this.buildItemRaw('Knowledge Base', '<img src="ui/icons/kb.webp" style="width:14px; height:14px; object-fit:contain;">', 'if(window.showKnowledgeBase) window.showKnowledgeBase()');
            html += this.buildItem('About Open Publisher', 'fa-info-circle', 'if(window.showAboutDialog) window.showAboutDialog()');
        }
        else {
            if (!el) {
                // --- PAPER MENU ---
                const canPaste = ''; // Always enabled
                
                html += this.buildItem('Paste', 'fa-paste', `if(window.ContextMenuActions) ContextMenuActions.pasteNormal()`, canPaste);
                html += this.buildItem('Paste in Place', 'fa-clipboard-check', `if(window.ContextMenuActions) ContextMenuActions.pasteNormal(true)`, canPaste);
                html += this.buildDivider();
                
                const qrcodeSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--ui-theme-dark)" style="vertical-align: -0.125em;"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 2h8v8H2V2zm2 2v4h4V4H4z"/><rect x="5" y="5" width="2" height="2"/><path fill-rule="evenodd" clip-rule="evenodd" d="M14 2h8v8h-8V2zm2 2v4h4V4h-4z"/><rect x="17" y="5" width="2" height="2"/><path fill-rule="evenodd" clip-rule="evenodd" d="M2 14h8v8H2v-8zm2 2v4h4v-4H4z"/><rect x="5" y="17" width="2" height="2"/><rect x="11" y="2" width="2" height="3"/><rect x="11" y="6" width="2" height="4"/><rect x="2" y="11" width="3" height="2"/><rect x="6" y="11" width="4" height="2"/><rect x="14" y="11" width="3" height="2"/><rect x="18" y="11" width="4" height="2"/><rect x="11" y="14" width="2" height="4"/><rect x="11" y="19" width="2" height="3"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="2" height="2"/><rect x="21" y="14" width="1" height="3"/><rect x="15" y="18" width="2" height="4"/><rect x="18" y="17" width="4" height="2"/><rect x="18" y="20" width="2" height="2"/><rect x="21" y="20" width="1" height="2"/></svg>`;
                const waLegacyPng = `<img src="ui/icons/WordArt.png?v=5.14.5" style="width:14px; height:14px; object-fit:contain; vertical-align: -0.125em; pointer-events:none; filter: hue-rotate(var(--ui-theme-hue-shift, 0deg)) grayscale(var(--ui-theme-grayscale, 0%));">`;
                const waBetaPng = `<img src="ui/icons/BetaWordArt.png?v=5.14.5" style="width:14px; height:14px; object-fit:contain; vertical-align: -0.125em; pointer-events:none; filter: hue-rotate(var(--ui-theme-hue-shift, 0deg)) grayscale(var(--ui-theme-grayscale, 0%));">`;
                const clipartPng = `<img src="https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/9CWMb1b.png" style="width:14px; height:14px; object-fit:contain; vertical-align: -0.125em; pointer-events:none; filter: hue-rotate(var(--ui-theme-hue-shift, 0deg)) grayscale(var(--ui-theme-grayscale, 0%));">`;

                html += this.buildFlyoutItem('Insert...', 'fa-plus-circle', `
                    ${this.buildItem('Text Box', 'fa-font', 'addTextBox()')}
                    ${this.buildItem('Picture Placeholder', 'fa-image', 'addPicturePlaceholder()')}
                    ${this.buildItemRaw('WordArt Old', waLegacyPng, 'showWordArtModal()')}
                    ${this.buildItemRaw('WordArt New', waBetaPng, 'if(window.showBetaWordArtModal) window.showBetaWordArtModal()')}
                    ${this.buildItemRaw('Clipart', clipartPng, 'if(window.showWebClipartModal) window.showWebClipartModal()')}
                    ${this.buildItem('Shapes', 'fa-shapes', 'toggleShapeMenu(this)')}
                    ${this.buildItem('Page Parts', 'fa-puzzle-piece', 'if(window.showPagePartsModal) window.showPagePartsModal()')}
                    ${this.buildDivider()}
                    ${this.buildItem('Coupons', 'fa-ticket-alt', 'showCouponModal()')}
                    ${this.buildItem('Ads', 'fa-ad', 'showAdModal()')}
                    ${this.buildItemRaw('QR Code', qrcodeSvg, 'showQRCodeModal()')}
                    ${this.buildItem('Table', 'fa-table', 'toggleTableMenu(this)')}
                    ${this.buildItem('Styled Tables', 'fa-border-all', 'if(window.openTableTemplatesModal) window.openTableTemplatesModal()')}
                    ${this.buildItem('Progress Bar', 'fa-tasks', 'if(window.ProgressBarEngine) window.ProgressBarEngine.showModal()')}
                    ${this.buildItem('Chart or Graph...', 'fa-chart-pie', 'if(window.showChartModal) window.showChartModal()')}
                    ${this.buildItem('Page from Template...', 'fa-file-invoice', 'if(window.showInsertTemplateModal) window.showInsertTemplateModal()')}
                    ${this.buildItem('Symbol', 'fa-copyright', 'if(window.showSymbolModal) window.showSymbolModal()')}
                    ${this.buildItem('Emojis', 'fa-icons', 'showClipartModal()')}
                `);
                
                html += this.buildDivider();
                html += this.buildItem('Insert Blank Page', 'fa-file-medical', 'addNewPage()');
                html += this.buildItem('Insert Template Page...', 'fa-columns', 'if(window.showInsertTemplateModal) window.showInsertTemplateModal()');
                html += this.buildItem('Duplicate Page', 'fa-copy', 'if(window.contextDuplicatePage) window.contextDuplicatePage(true)');
                html += this.buildItem('Delete Current Page', 'fa-trash-alt', `deletePage(${state.currentPageIndex}, event)`);
                html += this.buildDivider();
                html += this.buildItem('Page Design / Size', 'fa-ruler-combined', 'changeSize()');
                html += this.buildItem('Format Background', 'fa-fill-drip', 'if(window.ContextMenuActions) ContextMenuActions.formatBackground()');
            } else {
                // --- ELEMENT MENUS ---
                const contentImg = window.getElementContentImage ? window.getElementContentImage(el) : Array.from(el.querySelectorAll('img')).find(img => !img.closest('.element-border-art, .border-art-wrapper, #native-border-art-border'));
                const isTable = el.querySelector('table') !== null;
                const isProgressBar = el.getAttribute('data-type') === 'progress-bar' || el.querySelector('.progress-bar-widget') !== null;
                const isChart = el.getAttribute('data-type') === 'chart' || el.hasAttribute('data-chart-config');
                const isShape = !isProgressBar && !isChart && (el.getAttribute('data-type') === 'shape' || el.getAttribute('data-type') === 'smart-arrow');
                const isWordArt = !isProgressBar && !isChart && el.querySelector('.wa-text') !== null;
                const isText = !isProgressBar && !isChart && ((el.querySelector('[contenteditable="true"]') !== null && !isTable) || (!contentImg && !isShape && !isWordArt && !isTable));
                const isImage = !isProgressBar && !isChart && !isText && !!contentImg;

                let clickedWord = "";
                let clickedWordRange = null;
                let clickedPointRange = null;

                if (document.caretRangeFromPoint) {
                    clickedPointRange = document.caretRangeFromPoint(e.clientX, e.clientY);
                } else if (document.caretPositionFromPoint) {
                    const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
                    if (pos && pos.offsetNode) {
                        try {
                            clickedPointRange = document.createRange();
                            clickedPointRange.setStart(pos.offsetNode, pos.offset);
                            clickedPointRange.collapse(true);
                        } catch(err) {}
                    }
                }

                const getEditableFromContext = (target, container) => {
                    if (target) {
                        if (target.isContentEditable) return target;
                        if (target.closest) {
                            const ed = target.closest('[contenteditable="true"]');
                            if (ed) return ed;
                        }
                    }
                    if (container) {
                        if (container.isContentEditable) return container;
                        const ed = container.querySelector ? container.querySelector('[contenteditable="true"]') : null;
                        if (ed) return ed;
                    }
                    if (clickedPointRange && clickedPointRange.startContainer) {
                        const sc = clickedPointRange.startContainer;
                        const ed = sc.nodeType === 1 ? sc.closest('[contenteditable="true"]') : sc.parentElement?.closest('[contenteditable="true"]');
                        if (ed) return ed;
                    }
                    if (typeof state !== 'undefined' && state.selectedEl) {
                        if (state.selectedEl.isContentEditable) return state.selectedEl;
                        const ed = state.selectedEl.querySelector ? state.selectedEl.querySelector('[contenteditable="true"]') : null;
                        if (ed) return ed;
                    }
                    return null;
                };

                const extractWordFromRange = (r, offset) => {
                    if (!r || !r.startContainer) return null;
                    let node = r.startContainer;
                    let o = offset;
                    if (node.nodeType === 1 && node.childNodes.length > 0) {
                        const idx = Math.min(o, node.childNodes.length - 1);
                        node = node.childNodes[idx];
                        while (node && node.nodeType === 1 && node.firstChild) {
                            node = node.firstChild;
                        }
                        o = 0;
                    }
                    if (node && node.nodeType === 3) {
                        const text = node.textContent;
                        let start = Math.min(o, text.length), end = Math.min(o, text.length);
                        while (start > 0 && /[A-Za-z0-9_'’]/.test(text[start - 1])) start--;
                        while (end < text.length && /[A-Za-z0-9_'’]/.test(text[end])) end++;
                        const w = text.substring(start, end).trim();
                        if (w) {
                            const newRange = document.createRange();
                            newRange.setStart(node, start);
                            newRange.setEnd(node, end);
                            return { word: w, range: newRange };
                        }
                    }
                    return null;
                };

                const sel = window.getSelection();
                
                if (sel && sel.toString().trim() && sel.rangeCount > 0) {
                    const selText = sel.toString().trim();
                    if (selText.split(/\s+/).length === 1) { 
                        clickedWord = selText;
                        clickedWordRange = sel.getRangeAt(0);
                    }
                }

                if (!clickedWord && clickedPointRange) {
                    const res = extractWordFromRange(clickedPointRange, clickedPointRange.startOffset);
                    if (res) { clickedWord = res.word; clickedWordRange = res.range; }
                }

                if (!clickedWord && sel && sel.rangeCount > 0 && sel.isCollapsed) {
                    const r = sel.getRangeAt(0);
                    const res = extractWordFromRange(r, r.startOffset);
                    if (res) { clickedWord = res.word; clickedWordRange = res.range; }
                }

                // 2. PICTURE CONTEXT MENU
                if (isImage) {
                    html += this.buildItem('Change Picture...', 'fa-exchange-alt', 'ContextMenuActions.changePicture()');
                    html += this.buildItem('Apply to Background (Fill)', 'fa-expand-arrows-alt', 'ContextMenuActions.bgFill()');
                    html += this.buildItem('Apply to Background (Tile)', 'fa-th-large', 'ContextMenuActions.bgTile()');
                    html += this.buildItem('Format Picture...', 'fa-paint-brush', 'ContextMenuActions.formatTextBox()');
                    html += this.buildItem('Alt Text', 'fa-universal-access', 'ContextMenuActions.setAltText()');
                    html += this.buildItem('Crop Image', 'fa-crop', 'toggleCrop()');
                    html += this.buildItem('Crop to Shape', 'fa-shapes', 'if(window.ContextRibbonActions && ContextRibbonActions.cropToShape) ContextRibbonActions.cropToShape();');
                    html += this.buildFlyoutItem('Rounded Corners', 'fa-border-style', `
                        ${this.buildItem('None', 'fa-square', "if(window.ContextMenuActions && ContextMenuActions.setRoundedCorners) ContextMenuActions.setRoundedCorners('none'); else { const img=state.selectedEl.querySelector('img'); if(img){ img.style.clipPath='none'; img.style.webkitClipPath='none'; img.style.borderRadius=''; img.removeAttribute('data-rounded-corners'); state.selectedEl.removeAttribute('data-rounded-corners'); state.selectedEl.style.borderRadius=''; } const c=state.selectedEl.querySelector('.element-content'); if(c){ c.style.clipPath=''; c.style.webkitClipPath=''; c.style.borderRadius=''; } pushHistory(); }")}
                        ${this.buildItem('8px', 'fa-circle-notch', "if(window.ContextMenuActions && ContextMenuActions.setRoundedCorners) ContextMenuActions.setRoundedCorners('8px'); else { const img=state.selectedEl.querySelector('img'); if(img){ img.style.clipPath='inset(0 round 8px)'; img.style.webkitClipPath='inset(0 round 8px)'; img.style.borderRadius='8px'; img.setAttribute('data-rounded-corners', '8px'); state.selectedEl.setAttribute('data-rounded-corners', '8px'); state.selectedEl.style.borderRadius='8px'; } const c=state.selectedEl.querySelector('.element-content'); if(c){ c.style.clipPath=''; c.style.webkitClipPath=''; c.style.borderRadius='8px'; c.style.overflow='visible'; } state.selectedEl.style.overflow='visible'; pushHistory(); }")}
                        ${this.buildItem('16px', 'fa-circle-notch', "if(window.ContextMenuActions && ContextMenuActions.setRoundedCorners) ContextMenuActions.setRoundedCorners('16px'); else { const img=state.selectedEl.querySelector('img'); if(img){ img.style.clipPath='inset(0 round 16px)'; img.style.webkitClipPath='inset(0 round 16px)'; img.style.borderRadius='16px'; img.setAttribute('data-rounded-corners', '16px'); state.selectedEl.setAttribute('data-rounded-corners', '16px'); state.selectedEl.style.borderRadius='16px'; } const c=state.selectedEl.querySelector('.element-content'); if(c){ c.style.clipPath=''; c.style.webkitClipPath=''; c.style.borderRadius='16px'; c.style.overflow='visible'; } state.selectedEl.style.overflow='visible'; pushHistory(); }")}
                        ${this.buildItem('24px', 'fa-circle-notch', "if(window.ContextMenuActions && ContextMenuActions.setRoundedCorners) ContextMenuActions.setRoundedCorners('24px'); else { const img=state.selectedEl.querySelector('img'); if(img){ img.style.clipPath='inset(0 round 24px)'; img.style.webkitClipPath='inset(0 round 24px)'; img.style.borderRadius='24px'; img.setAttribute('data-rounded-corners', '24px'); state.selectedEl.setAttribute('data-rounded-corners', '24px'); state.selectedEl.style.borderRadius='24px'; } const c=state.selectedEl.querySelector('.element-content'); if(c){ c.style.clipPath=''; c.style.webkitClipPath=''; c.style.borderRadius='24px'; c.style.overflow='visible'; } state.selectedEl.style.overflow='visible'; pushHistory(); }")}
                        ${this.buildItem('32px', 'fa-circle-notch', "if(window.ContextMenuActions && ContextMenuActions.setRoundedCorners) ContextMenuActions.setRoundedCorners('32px'); else { const img=state.selectedEl.querySelector('img'); if(img){ img.style.clipPath='inset(0 round 32px)'; img.style.webkitClipPath='inset(0 round 32px)'; img.style.borderRadius='32px'; img.setAttribute('data-rounded-corners', '32px'); state.selectedEl.setAttribute('data-rounded-corners', '32px'); state.selectedEl.style.borderRadius='32px'; } const c=state.selectedEl.querySelector('.element-content'); if(c){ c.style.clipPath=''; c.style.webkitClipPath=''; c.style.borderRadius='32px'; c.style.overflow='visible'; } state.selectedEl.style.overflow='visible'; pushHistory(); }")}
                    `);
                    html += this.buildItem('Insert Caption', 'fa-comment-alt', 'ContextMenuActions.insertCaption()');
                }
                // 3. TEXT BOX CONTEXT MENU
                else if (isText || isWordArt) {
                    const resolvedEditable = getEditableFromContext(e.target, el);
                    if (clickedWord || clickedPointRange || resolvedEditable) {
                        window._currentSpellCheckWord = clickedWord || "";
                        window._currentSpellCheckRange = clickedWordRange || clickedPointRange;
                        window._currentSpellCheckPointRange = clickedPointRange;
                        window._currentSpellCheckEditable = resolvedEditable;
                        html += '<div id="spell-check-results"></div>';
                    }

                    html += this.buildItem('Text Fit: Best Fit', 'fa-compress-arrows-alt', 'ContextMenuActions.bestFitText()');
                    html += this.buildItem('Drop Cap', 'fa-heading', 'ContextMenuActions.dropCap()');
                    html += this.buildItem('Change Case', 'fa-font', 'ContextMenuActions.changeCase()');
                    if (window._contextTargetLink) {
                        html += this.buildItem('Remove Hyperlink', 'fa-unlink', 'ContextMenuActions.removeHyperlink()');
                    } else if (sel && sel.toString().trim().length > 0) {
                        html += this.buildItem('Add Hyperlink', 'fa-link', 'ContextMenuActions.addHyperlink()');
                    }
                    html += this.buildDivider();
                    html += this.buildItem('Format Text Box', 'fa-border-style', 'ContextMenuActions.formatTextBox()');
                    html += this.buildItem('Border Art...', 'fa-palette', 'if(window.ContextMenuActions && ContextMenuActions.openBorderArt) ContextMenuActions.openBorderArt(); else if(window.BorderArtEngine) BorderArtEngine.openForElement(state.selectedEl);');
                }
                // 3.5. TABLE CONTEXT MENU
                else if (isTable) {
                    const resolvedEditable = getEditableFromContext(e.target, el);
                    if (clickedWord || clickedPointRange || resolvedEditable) {
                        window._currentSpellCheckWord = clickedWord || "";
                        window._currentSpellCheckRange = clickedWordRange || clickedPointRange;
                        window._currentSpellCheckPointRange = clickedPointRange;
                        window._currentSpellCheckEditable = resolvedEditable;
                        html += '<div id="spell-check-results"></div>';
                    }
                    html += this.buildItem('Insert Row Above', 'fa-arrow-up', 'if(window.ContextRibbonActions) ContextRibbonActions.insertRowAbove()');
                    html += this.buildItem('Insert Row Below', 'fa-arrow-down', 'if(window.ContextRibbonActions) ContextRibbonActions.insertRowBelow()');
                    html += this.buildItem('Insert Column Left', 'fa-arrow-left', 'if(window.ContextRibbonActions) ContextRibbonActions.insertColLeft()');
                    html += this.buildItem('Insert Column Right', 'fa-arrow-right', 'if(window.ContextRibbonActions) ContextRibbonActions.insertColRight()');
                    html += this.buildDivider();
                    html += this.buildItem('Select All Cells', 'fa-border-all', 'if(window.ContextRibbonActions) ContextRibbonActions.selectAllCells()');
                    html += this.buildDivider();
                    
                    const targetCell = e.target.closest('td, th');
                    const isMerged = targetCell && (parseInt(targetCell.getAttribute('colspan')) > 1 || parseInt(targetCell.getAttribute('rowspan')) > 1);

                    if (window._tableSelectedCells && window._tableSelectedCells.length > 1) {
                        html += this.buildItem('Merge Cells', 'fa-object-group', 'if(window.ContextRibbonActions) ContextRibbonActions.mergeSelectedCells()');
                    } else if (isMerged) {
                        html += this.buildItem('Split Cells (revert)', 'fa-object-ungroup', 'if(window.ContextRibbonActions) ContextRibbonActions.splitSelectedCell()');
                    } else {
                        html += this.buildItem('Merge Cell Right', 'fa-object-group', 'if(window.ContextRibbonActions) ContextRibbonActions.mergeRight()');
                        html += this.buildItem('Merge Cell Down', 'fa-object-group', 'if(window.ContextRibbonActions) ContextRibbonActions.mergeDown()');
                    }
                    
                    html += this.buildDivider();
                    html += this.buildItem('Delete Row', 'fa-minus-circle', 'if(window.ContextRibbonActions) ContextRibbonActions.deleteRow()');
                    html += this.buildItem('Delete Column', 'fa-minus-circle', 'if(window.ContextRibbonActions) ContextRibbonActions.deleteCol()');
                    html += this.buildDivider();
                    if (window._tableSelectedCells && window._tableSelectedCells.length > 1) {
                        html += this.buildItem('Clear Cell Text (' + window._tableSelectedCells.length + ' cells)', 'fa-eraser', 'if(window.clearSelectedCellText) window.clearSelectedCellText()');
                    } else if (targetCell) {
                        html += this.buildItem('Clear Cell Text', 'fa-eraser', 'if(window.clearSelectedCellText) window.clearSelectedCellText()');
                    }
                    html += this.buildItem('Convert to Text', 'fa-align-left', 'if(window.ContextRibbonActions) ContextRibbonActions.convertTableToText()');
                    if (window._contextTargetLink) {
                        html += this.buildDivider();
                        html += this.buildItem('Remove Hyperlink', 'fa-unlink', 'ContextMenuActions.removeHyperlink()');
                    } else if (window.getSelection() && window.getSelection().toString().trim().length > 0) {
                        html += this.buildDivider();
                        html += this.buildItem('Add Hyperlink', 'fa-link', 'ContextMenuActions.addHyperlink()');
                    }
                }
                // 4. SHAPE CONTEXT MENU
                else if (isShape) {
                    html += this.buildItem('Edit Points', 'fa-draw-polygon', 'if(window.toggleShapeEditPoints) window.toggleShapeEditPoints()');
                    html += this.buildItem('Add/Edit Text', 'fa-font', 'ContextMenuActions.addShapeText()');
                    html += this.buildItem('Set as Default Shape', 'fa-check-circle', 'ContextMenuActions.setDefaultShape()');
                    html += this.buildDivider();
                    html += this.buildItem('Format AutoShape', 'fa-border-style', 'ContextMenuActions.formatTextBox()');
                    html += this.buildItem('Border Art...', 'fa-palette', 'if(window.ContextMenuActions && ContextMenuActions.openBorderArt) ContextMenuActions.openBorderArt(); else if(window.BorderArtEngine) BorderArtEngine.openForElement(state.selectedEl);');
                }
                // 4.5. PROGRESS BAR CONTEXT MENU
                else if (isProgressBar) {
                    html += this.buildItem('Designer / Edit Progress Bar...', 'fa-sliders-h', 'if(window.ProgressBarEngine) window.ProgressBarEngine.showModal(state.selectedEl)');
                    html += this.buildFlyoutItem('Change Style Preset', 'fa-palette', `
                        ${this.buildItem('CV Emerald Skill', 'fa-circle', "if(window.ProgressBarEngine){ state.selectedEl.setAttribute('data-pb-style','capsule-green'); const p=ProgressBarEngine.styles.find(s=>s.id==='capsule-green'); state.selectedEl.setAttribute('data-pb-fill',p.fillColor); state.selectedEl.setAttribute('data-pb-track',p.trackColor); state.selectedEl.setAttribute('data-pb-radius',p.radius); ProgressBarEngine.refreshElement(state.selectedEl); pushHistory(); }")}
                        ${this.buildItem('Publisher Teal', 'fa-circle', "if(window.ProgressBarEngine){ state.selectedEl.setAttribute('data-pb-style','capsule-teal'); const p=ProgressBarEngine.styles.find(s=>s.id==='capsule-teal'); state.selectedEl.setAttribute('data-pb-fill',p.fillColor); state.selectedEl.setAttribute('data-pb-track',p.trackColor); state.selectedEl.setAttribute('data-pb-radius',p.radius); ProgressBarEngine.refreshElement(state.selectedEl); pushHistory(); }")}
                        ${this.buildItem('Executive Sapphire', 'fa-circle', "if(window.ProgressBarEngine){ state.selectedEl.setAttribute('data-pb-style','modern-sapphire'); const p=ProgressBarEngine.styles.find(s=>s.id==='modern-sapphire'); state.selectedEl.setAttribute('data-pb-fill',p.fillColor); state.selectedEl.setAttribute('data-pb-track',p.trackColor); state.selectedEl.setAttribute('data-pb-radius',p.radius); state.selectedEl.setAttribute('data-pb-show-label','right'); ProgressBarEngine.refreshElement(state.selectedEl); pushHistory(); }")}
                        ${this.buildItem('Cyberpunk Glow', 'fa-circle', "if(window.ProgressBarEngine){ state.selectedEl.setAttribute('data-pb-style','cyber-cyan'); const p=ProgressBarEngine.styles.find(s=>s.id==='cyber-cyan'); state.selectedEl.setAttribute('data-pb-fill',p.fillColor); state.selectedEl.setAttribute('data-pb-track',p.trackColor); state.selectedEl.setAttribute('data-pb-radius',p.radius); state.selectedEl.setAttribute('data-pb-glow',p.glow); ProgressBarEngine.refreshElement(state.selectedEl); pushHistory(); }")}
                        ${this.buildItem('Sunset Radiance', 'fa-circle', "if(window.ProgressBarEngine){ state.selectedEl.setAttribute('data-pb-style','sunset-gradient'); const p=ProgressBarEngine.styles.find(s=>s.id==='sunset-gradient'); state.selectedEl.setAttribute('data-pb-fill',p.fillColor); state.selectedEl.setAttribute('data-pb-track',p.trackColor); state.selectedEl.setAttribute('data-pb-radius',p.radius); ProgressBarEngine.refreshElement(state.selectedEl); pushHistory(); }")}
                        ${this.buildItem('10-Pip Rating Blocks', 'fa-th-large', "if(window.ProgressBarEngine){ state.selectedEl.setAttribute('data-pb-style','segmented-pips'); const p=ProgressBarEngine.styles.find(s=>s.id==='segmented-pips'); state.selectedEl.setAttribute('data-pb-fill',p.fillColor); state.selectedEl.setAttribute('data-pb-track',p.trackColor); state.selectedEl.setAttribute('data-pb-radius',p.radius); state.selectedEl.setAttribute('data-pb-show-label','right'); ProgressBarEngine.refreshElement(state.selectedEl); pushHistory(); }")}
                        ${this.buildItem('Barber Stripe', 'fa-bars', "if(window.ProgressBarEngine){ state.selectedEl.setAttribute('data-pb-style','candy-stripe'); const p=ProgressBarEngine.styles.find(s=>s.id==='candy-stripe'); state.selectedEl.setAttribute('data-pb-fill',p.fillColor); state.selectedEl.setAttribute('data-pb-track',p.trackColor); state.selectedEl.setAttribute('data-pb-radius',p.radius); ProgressBarEngine.refreshElement(state.selectedEl); pushHistory(); }")}
                        ${this.buildItem('Prestige Gold', 'fa-star', "if(window.ProgressBarEngine){ state.selectedEl.setAttribute('data-pb-style','prestige-gold'); const p=ProgressBarEngine.styles.find(s=>s.id==='prestige-gold'); state.selectedEl.setAttribute('data-pb-fill',p.fillColor); state.selectedEl.setAttribute('data-pb-track',p.trackColor); state.selectedEl.setAttribute('data-pb-radius',p.radius); ProgressBarEngine.refreshElement(state.selectedEl); pushHistory(); }")}
                    `);
                    html += this.buildDivider();
                }
                // 4.6. CHART CONTEXT MENU
                else if (isChart) {
                    html += this.buildItem('Edit Chart Data...', 'fa-chart-pie', 'if(window.showChartModal) window.showChartModal(state.selectedEl)');
                    html += this.buildDivider();
                }

                // 5. UNIVERSAL OBJECT FUNCTIONS
                html += this.buildDivider();
                html += this.buildItem('Bring to Front', 'fa-layer-group', 'bringFront()');
                html += this.buildItem('Send to Back', 'fa-layer-group', 'sendBack()');
                html += this.buildDivider();
                html += this.buildItem('Cut', 'fa-cut', 'if(window.ContextMenuActions && ContextMenuActions.cut) ContextMenuActions.cut(); else if(window.cutEl) window.cutEl(); else cutEl();');
                html += this.buildItem('Copy', 'fa-copy', 'if(window.ContextMenuActions && ContextMenuActions.copy) ContextMenuActions.copy(); else copyEl();');
                html += this.buildItem('Duplicate', 'fa-clone', 'if(window.duplicateSelected) window.duplicateSelected(); else if(typeof duplicateSelected === "function") duplicateSelected();');
                html += this.buildItem('Paste', 'fa-paste', 'if(window.ContextMenuActions) ContextMenuActions.pasteNormal()');
                if (isText) {
                    html += this.buildItem('Paste Without Formatting', 'fa-paste', 'if(window.ContextMenuActions) ContextMenuActions.pasteWithoutFormatting()');
                }
                html += this.buildItem('Delete', 'fa-trash', 'deleteSelected()');
                html += this.buildDivider();
                html += this.buildItem('Save as Picture...', 'fa-file-image', 'ContextMenuActions.saveAsPicture()');
                html += this.buildItem('Flatten to Image (Fix 3D)', 'fa-compress', 'ContextMenuActions.flattenToImage()');
                html += this.buildItem('Add to Building Blocks', 'fa-puzzle-piece', 'ContextMenuActions.addBuildingBlock()');
            }
        }

        this.menuEl.innerHTML = html;
        this.menuEl.style.display = 'block';

        // Ensure text selection is maintained while context menu is displayed
        if (preservedRange && sel) {
            try {
                if (sel.isCollapsed || sel.rangeCount === 0 || sel.toString() !== preservedRange.toString()) {
                    sel.removeAllRanges();
                    sel.addRange(preservedRange);
                }
            } catch(err) {}
        }

        // Proofing (Spell & Grammar) Async Fetch
        if (window._currentSpellCheckWord || window._currentSpellCheckRange || window._currentSpellCheckPointRange || window._currentSpellCheckEditable) {
            const spellDiv = document.getElementById('spell-check-results');
            if (spellDiv) {
                const wordToCheck = window._currentSpellCheckWord || "";
                window._lastSpellCheckedWord = wordToCheck;
                const cleanWord = (wordToCheck || '').toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
                const cleanWordEscaped = (wordToCheck || '').replace(/'/g, "\\'");
                const editable = window._currentSpellCheckEditable;

                const activeIssue = (window.SpellCheckEngine && window.SpellCheckEngine.getIssueAt)
                    ? window.SpellCheckEngine.getIssueAt(editable, wordToCheck, window._currentSpellCheckRange, window._currentSpellCheckPointRange)
                    : null;

                if (activeIssue && activeIssue.type === 'grammar') {
                    if (activeIssue.range) {
                        window._currentSpellCheckRange = activeIssue.range;
                    }
                    let newHtml = '';
                    const ruleMsg = (activeIssue.message || activeIssue.shortMessage || 'Grammar / Formatting suggestion')
                        .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                    newHtml += `<div class="pub-context-item" style="color:#27ae60; font-size:11px; font-weight:600; line-height:1.3; max-width:260px; white-space:normal; padding:6px 14px; pointer-events:none;"><i class="fas fa-check-circle" style="color:#27ae60; margin-right:6px;"></i> ${ruleMsg}</div>`;

                    if (activeIssue.replacements && activeIssue.replacements.length > 0) {
                        const limit = Math.min(3, activeIssue.replacements.length);
                        for (let i = 0; i < limit; i++) {
                            const suggestion = activeIssue.replacements[i].replace(/'/g, "\\'");
                            newHtml += this.buildItem(`<b>${suggestion}</b>`, 'fa-magic', `ContextMenuActions.applyGrammar('${suggestion}')`);
                        }
                    }
                    if (activeIssue.ruleId) {
                        newHtml += this.buildItem('Ignore Rule', 'fa-eye-slash', `if(window.SpellCheckEngine) window.SpellCheckEngine.ignoreGrammarRule('${activeIssue.ruleId}'); ContextMenuSystem.hide();`);
                    }
                    newHtml += this.buildDivider();
                    spellDiv.innerHTML = newHtml;
                } else if (activeIssue && activeIssue.type === 'spelling') {
                    if (activeIssue.range) {
                        window._currentSpellCheckRange = activeIssue.range;
                    }
                    let newHtml = '';
                    const suggestions = activeIssue.replacements || [];
                    const limit = Math.min(4, suggestions.length);
                    for (let i = 0; i < limit; i++) {
                        const suggestion = suggestions[i].replace(/'/g, "\\'");
                        newHtml += this.buildItem(`<b>${suggestion}</b>`, 'fa-magic', `ContextMenuActions.applySpelling('${suggestion}')`);
                    }
                    if (cleanWordEscaped) {
                        newHtml += this.buildItem('Add to Dictionary', 'fa-plus-circle', `if (window.SpellCheckEngine) window.SpellCheckEngine.addToDictionary('${cleanWordEscaped}'); ContextMenuSystem.hide();`);
                        newHtml += this.buildItem('Ignore All', 'fa-eye-slash', `if (window.SpellCheckEngine) window.SpellCheckEngine.ignoreWord('${cleanWordEscaped}'); ContextMenuSystem.hide();`);
                    }
                    newHtml += this.buildDivider();
                    spellDiv.innerHTML = newHtml;
                } else if (cleanWord && window.SpellCheckEngine && window.SpellCheckEngine.isWordMisspelled && window.SpellCheckEngine.isWordMisspelled(cleanWord)) {
                    // Misspelled word: instant local suggestions from comprehensive dictionary
                    const suggestions = (window.SpellCheckEngine.getSuggestions)
                        ? window.SpellCheckEngine.getSuggestions(wordToCheck || cleanWord)
                        : [];
                    let newHtml = '';
                    const limit = Math.min(4, suggestions.length);
                    for (let i = 0; i < limit; i++) {
                        const suggestion = suggestions[i].replace(/'/g, "\\'");
                        newHtml += this.buildItem(`<b>${suggestion}</b>`, 'fa-magic', `ContextMenuActions.applySpelling('${suggestion}')`);
                    }
                    if (cleanWordEscaped) {
                        newHtml += this.buildItem('Add to Dictionary', 'fa-plus-circle', `if (window.SpellCheckEngine) window.SpellCheckEngine.addToDictionary('${cleanWordEscaped}'); ContextMenuSystem.hide();`);
                        newHtml += this.buildItem('Ignore All', 'fa-eye-slash', `if (window.SpellCheckEngine) window.SpellCheckEngine.ignoreWord('${cleanWordEscaped}'); ContextMenuSystem.hide();`);
                    }
                    newHtml += this.buildDivider();
                    spellDiv.innerHTML = newHtml;
                } else {
                    // Word is valid and correctly spelled: zero error indicators needed
                    spellDiv.innerHTML = '';
                }
            }
        }

        // Keep menu on screen (Clamp to viewport)
        const rect = this.menuEl.getBoundingClientRect();
        let x = e.clientX;
        let y = e.clientY;
        if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 5;
        if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 5;

        this.menuEl.style.left = x + 'px';
        this.menuEl.style.top = y + 'px';
    },

    buildItem: function(label, icon, action, disabledClass = '') {
        // If disabled, don't pass the action
        const clickAction = disabledClass ? '' : `onclick="event.stopPropagation(); ${action}; ContextMenuSystem.hide();"`;
        return `<div class="pub-context-item ${disabledClass}" onmousedown="event.preventDefault();" ${clickAction}><i class="fas fa-fw ${icon}"></i> ${label}</div>`;
    },

    buildItemRaw: function(label, rawIconHtml, action, disabledClass = '') {
        const clickAction = disabledClass ? '' : `onclick="event.stopPropagation(); ${action}; ContextMenuSystem.hide();"`;
        return `<div class="pub-context-item ${disabledClass}" onmousedown="event.preventDefault();" ${clickAction}><i class="fas fa-fw" style="display:inline-flex; align-items:center; justify-content:center; font-style:normal;">${rawIconHtml}</i> ${label}</div>`;
    },
    
    buildFlyoutItem: function(label, icon, childrenHtml) {
        return `
            <div class="pub-context-item has-flyout">
                <i class="fas fa-fw ${icon}"></i> ${label}
                <i class="fas fa-caret-right"></i>
                <div class="pub-flyout-menu">
                    ${childrenHtml}
                </div>
            </div>
        `;
    },
    
    buildDivider: function() {
        return `<div class="pub-context-divider"></div>`;
    },

    hide: function() {
        if(this.menuEl) this.menuEl.style.display = 'none';
        window._currentSpellCheckWord = "";
        window._currentSpellCheckRange = null;
        window._currentSpellCheckPointRange = null;
        window._currentSpellCheckEditable = null;
    }
};

window.ContextMenuSystem = ContextMenuSystem;

// Initialize the menu system on load
setTimeout(() => ContextMenuSystem.init(), 500);
