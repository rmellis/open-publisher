/* =========================================================================
   CONTEXT MENU ADDON (DYNAMIC RIGHT-CLICK SYSTEM)
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
        if (sel && sel.rangeCount > 0) {
            window._contextTargetRange = sel.getRangeAt(0).cloneRange();
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
                
                const clipboardMsg = `DialogSystem.show('Clipboard', '<div style=&quot;display:flex; align-items:center; gap:20px;&quot;><i class=&quot;fas fa-info-circle fa-2x&quot; style=&quot;color:var(--ui-theme-color);&quot;></i><div style=&quot;font-size:14px; max-width:350px; line-height:1.4;&quot;>OpenPublisher was prevented from reading your clipboard, or no data is present. Please use the keyboard shortcuts for copy and paste.<br><br>â€¢ <b>Copy:</b> Ctrl + C (or Cmd + C on Mac)<br>â€¢ <b>Paste:</b> Ctrl + V (or Cmd + V on Mac)</div></div>', null, true)`;
                
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
            html += this.buildItem('Hide Rulers', 'fa-eye-slash', 'if(window.toggleRulers) window.toggleRulers()');
            html += this.buildItem('Toggle Margins', 'fa-vector-square', 'if(window.toggleMargins) window.toggleMargins()');
            html += this.buildItem('Page Design / Size', 'fa-ruler-combined', 'changeSize()');
            html += this.buildItem('Change Background', 'fa-fill-drip', 'if(window.ContextMenuActions) ContextMenuActions.formatBackground()');
            
            html += this.buildDivider();
            
            const checkIcon = '<i class="fas fa-check" style="margin-left: auto; color: var(--ui-theme-color); -webkit-text-stroke: 1px var(--ui-theme-color);"></i>';
            const checkGrid = 'Snap to Grid' + (state.snap.grid ? checkIcon : '');
            const checkGuides = 'Snap to Guides' + (state.snap.guides ? checkIcon : '');
            const checkObjects = 'Snap to Objects' + (state.snap.objects ? checkIcon : '');

            html += this.buildItem(checkGrid, 'fa-border-all', "if(window.toggleSnapOption) window.toggleSnapOption('grid')");
            html += this.buildItem(checkGuides, 'fa-ruler-combined', "if(window.toggleSnapOption) window.toggleSnapOption('guides')");
            html += this.buildItem(checkObjects, 'fa-shapes', "if(window.toggleSnapOption) window.toggleSnapOption('objects')");
        }
        else if (isSidebarBlank) {
            html += this.buildItem('Insert Blank Page', 'fa-file-medical', 'addNewPage()');
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
                const waBetaPng = `<img src="https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/PEtJfoR.png" style="width:14px; height:14px; object-fit:contain; vertical-align: -0.125em; pointer-events:none;">`;
                const clipartPng = `<img src="https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/9CWMb1b.png" style="width:14px; height:14px; object-fit:contain; vertical-align: -0.125em; pointer-events:none;">`;

                html += this.buildFlyoutItem('Insert...', 'fa-plus-circle', `
                    ${this.buildItem('Text Box', 'fa-font', 'addTextBox()')}
                    ${this.buildItem('Picture Placeholder', 'fa-image', 'addPicturePlaceholder()')}
                    ${this.buildItem('WordArt Old', 'fa-text-width', 'showWordArtModal()')}
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
                    ${this.buildItem('Symbol', 'fa-copyright', 'if(window.showSymbolModal) window.showSymbolModal()')}
                    ${this.buildItem('Emojis', 'fa-icons', 'showClipartModal()')}
                `);
                
                html += this.buildDivider();
                html += this.buildItem('Insert Blank Page', 'fa-file-medical', 'addNewPage()');
                html += this.buildItem('Duplicate Page', 'fa-copy', 'if(window.contextDuplicatePage) window.contextDuplicatePage(true)');
                html += this.buildItem('Delete Current Page', 'fa-trash-alt', `deletePage(${state.currentPageIndex}, event)`);
                html += this.buildDivider();
                html += this.buildItem('Page Design / Size', 'fa-ruler-combined', 'changeSize()');
                html += this.buildItem('Format Background', 'fa-fill-drip', 'if(window.ContextMenuActions) ContextMenuActions.formatBackground()');
            } else {
                // --- ELEMENT MENUS ---
                const isImage = el.querySelector('img');
                const isShape = el.getAttribute('data-type') === 'shape';
                const isWordArt = el.querySelector('.wa-text');
                const isTable = el.querySelector('table');
                const isText = !isImage && !isShape && !isWordArt && !isTable;

                // 2. PICTURE CONTEXT MENU
                if (isImage) {
                    html += this.buildItem('Change Picture...', 'fa-exchange-alt', 'ContextMenuActions.changePicture()');
                    html += this.buildItem('Apply to Background (Fill)', 'fa-expand-arrows-alt', 'ContextMenuActions.bgFill()');
                    html += this.buildItem('Apply to Background (Tile)', 'fa-th-large', 'ContextMenuActions.bgTile()');
                    html += this.buildDivider();
                    html += this.buildFlyoutItem('Format Picture', 'fa-paint-brush', `
                        ${this.buildItem('Alt Text', 'fa-universal-access', 'ContextMenuActions.setAltText()')}
                    `);
                    html += this.buildItem('Crop Image', 'fa-crop', 'toggleCrop()');
                    html += this.buildFlyoutItem('Rounded Corners', 'fa-border-style', `
                        ${this.buildItem('None', 'fa-square', "state.selectedEl.querySelector('img').style.clipPath='none'; state.selectedEl.querySelector('img').style.webkitClipPath='none'; pushHistory();")}
                        ${this.buildItem('8px', 'fa-circle-notch', "state.selectedEl.querySelector('img').style.clipPath='inset(0 round 8px)'; state.selectedEl.querySelector('img').style.webkitClipPath='inset(0 round 8px)'; pushHistory();")}
                        ${this.buildItem('16px', 'fa-circle-notch', "state.selectedEl.querySelector('img').style.clipPath='inset(0 round 16px)'; state.selectedEl.querySelector('img').style.webkitClipPath='inset(0 round 16px)'; pushHistory();")}
                        ${this.buildItem('24px', 'fa-circle-notch', "state.selectedEl.querySelector('img').style.clipPath='inset(0 round 24px)'; state.selectedEl.querySelector('img').style.webkitClipPath='inset(0 round 24px)'; pushHistory();")}
                        ${this.buildItem('32px', 'fa-circle-notch', "state.selectedEl.querySelector('img').style.clipPath='inset(0 round 32px)'; state.selectedEl.querySelector('img').style.webkitClipPath='inset(0 round 32px)'; pushHistory();")}
                    `);
                    html += this.buildItem('Insert Caption', 'fa-comment-alt', 'ContextMenuActions.insertCaption()');
                }
                // 3. TEXT BOX CONTEXT MENU
                else if (isText || isWordArt) {
                    let clickedWord = "";
                    let clickedWordRange = null;

                    const extractWordFromRange = (r, offset) => {
                        if (r && r.startContainer.nodeType === 3) {
                            const text = r.startContainer.textContent;
                            let start = offset, end = offset;
                            while (start > 0 && /[A-Za-z0-9_']/.test(text[start - 1])) start--;
                            while (end < text.length && /[A-Za-z0-9_']/.test(text[end])) end++;
                            const w = text.substring(start, end).trim();
                            if (w) {
                                const newRange = document.createRange();
                                newRange.setStart(r.startContainer, start);
                                newRange.setEnd(r.startContainer, end);
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

                    if (!clickedWord && document.caretRangeFromPoint) {
                        const r = document.caretRangeFromPoint(e.clientX, e.clientY);
                        if (r) {
                            const res = extractWordFromRange(r, r.startOffset);
                            if (res) { clickedWord = res.word; clickedWordRange = res.range; }
                        }
                    } 
                    else if (!clickedWord && document.caretPositionFromPoint) {
                        const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
                        if (pos) {
                            const res = extractWordFromRange({startContainer: pos.offsetNode}, pos.offset);
                            if (res) { clickedWord = res.word; clickedWordRange = res.range; }
                        }
                    }

                    if (!clickedWord && sel && sel.rangeCount > 0 && sel.isCollapsed) {
                        const r = sel.getRangeAt(0);
                        const res = extractWordFromRange(r, r.startOffset);
                        if (res) { clickedWord = res.word; clickedWordRange = res.range; }
                    }
                    
                    if (clickedWord && clickedWordRange) {
                        window._currentSpellCheckWord = clickedWord;
                        window._currentSpellCheckRange = clickedWordRange;
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
                }
                // 3.5. TABLE CONTEXT MENU
                else if (isTable) {
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
                }

                // 5. UNIVERSAL OBJECT FUNCTIONS
                html += this.buildDivider();
                html += this.buildItem('Bring to Front', 'fa-layer-group', 'bringFront()');
                html += this.buildItem('Send to Back', 'fa-layer-group', 'sendBack()');
                html += this.buildDivider();
                html += this.buildItem('Copy', 'fa-copy', 'copyEl()');
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

        // Spell Check Async Fetch
        if (window._currentSpellCheckWord) {
            const spellDiv = document.getElementById('spell-check-results');
            if (spellDiv) {
                spellDiv.innerHTML = `<div class="pub-context-item" style="color:#777; font-style:italic; font-size:12px; pointer-events:none;"><i class="fas fa-spinner fa-spin"></i> Checking spelling...</div><div class="pub-context-divider"></div>`;
                
                fetch(`https://api.languagetool.org/v2/check`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `language=en-US&text=${encodeURIComponent(window._currentSpellCheckWord)}`
                })
                .then(r => r.json())
                .then(data => {
                    const spellDiv2 = document.getElementById('spell-check-results');
                    if (!spellDiv2) return;
                    if (data.matches && data.matches.length > 0) {
                        const match = data.matches[0];
                        if (match.replacements && match.replacements.length > 0) {
                            let newHtml = '';
                            const limit = Math.min(3, match.replacements.length);
                            for(let i=0; i<limit; i++) {
                                const suggestion = match.replacements[i].value.replace(/'/g, "\\'");
                                newHtml += this.buildItem(`<b>${suggestion}</b>`, 'fa-magic', `ContextMenuActions.applySpelling('${suggestion}')`);
                            }
                            newHtml += this.buildDivider();
                            spellDiv2.innerHTML = newHtml;
                            return;
                        }
                    }
                    // No matches
                    spellDiv2.innerHTML = `<div class="pub-context-item" style="color:#777; font-size:12px; pointer-events:none;"><i class="fas fa-check"></i> No spelling suggestions</div><div class="pub-context-divider"></div>`;
                }).catch(e => {
                    const spellDiv2 = document.getElementById('spell-check-results');
                    if (spellDiv2) spellDiv2.innerHTML = `<div class="pub-context-item" style="color:#e74c3c; font-size:12px; pointer-events:none;"><i class="fas fa-exclamation-triangle"></i> Spellcheck failed</div><div class="pub-context-divider"></div>`;
                    console.error("Spellcheck error:", e);
                });
            }
            window._currentSpellCheckWord = "";
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
    }
};

// --- ACTION LOGIC FOR NEW CONTEXT FEATURES ---

// Initialize the menu system on load
setTimeout(() => ContextMenuSystem.init(), 500);
