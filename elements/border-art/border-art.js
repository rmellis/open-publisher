/* =========================================================================
   BORDER ART ENGINE (v5.7.0)
   Classic Clipart Borders (Santas, Bells, Trees, Apples, Stars, etc.)
   Using optimized web clipart thumbnails with uniform edge tiling.
========================================================================= */

(function(window) {
    'use strict';

    const THUMB_BASE_URL = 'https://wsrv.nl/?url=acr.floydcraft.co.uk/clipart-thumbs/';

    const BORDER_ART_PRESETS = [
        {
            id: 'santas',
            name: 'Santas',
            category: 'Holiday',
            file: 'Cute_Santa_PNG_Clipart-21.png',
            description: 'Classic Christmas Santas'
        },
        {
            id: 'bells',
            name: 'Holiday Bells',
            category: 'Holiday',
            file: 'Christmas_Bells_PNG_Clipart-9.png',
            description: 'Festive Christmas bells'
        },
        {
            id: 'christmas_trees',
            name: 'Christmas Trees',
            category: 'Holiday',
            file: 'Beautiful_Christmas_Tree_PNG_Clipart-2.png',
            description: 'Decorated pine trees'
        },
        {
            id: 'candy_canes',
            name: 'Candy Canes',
            category: 'Holiday',
            file: 'Red_Christmas_Stocking_with_Candy_Cane_PNG_Clipart-45.png',
            description: 'Holiday stockings with candy cane'
        },
        {
            id: 'snowmen',
            name: 'Snowmen',
            category: 'Holiday',
            file: 'Snowman_with_Christmas_Hat_PNG_Clipart-57.png',
            description: 'Festive smiling snowmen with hats'
        },
        {
            id: 'easter_eggs',
            name: 'Easter Eggs',
            category: 'Holiday',
            file: 'Blue_Easter_Egg_PNG_Clip_Art-1235.png',
            description: 'Decorated festive Easter eggs'
        },
        {
            id: 'easter_bunnies',
            name: 'Easter Bunnies',
            category: 'Holiday',
            file: 'Easter_Bunny_PNG_Clip_Art-1263.png',
            description: 'Cute holiday Easter bunnies'
        },
        {
            id: 'stars',
            name: 'Stars & Baubles',
            category: 'Celebration',
            file: 'Red_Christmas_Ball_with_Stars_PNG_Clipart-44.png',
            description: 'Sparkling star ornaments'
        },
        {
            id: 'balloons',
            name: 'Party Balloons',
            category: 'Celebration',
            file: 'Red_Balloon_PNG_Clip_Art-2015.png',
            description: 'Festive party balloons'
        },
        {
            id: 'party_smiles',
            name: 'Party Smiles',
            category: 'Celebration',
            file: 'Party_Emoticon_PNG_Clip_Art-2263.png',
            description: 'Celebratory party smiles'
        },
        {
            id: 'gifts',
            name: 'Gift Boxes',
            category: 'Celebration',
            file: 'Blue_Gift_Box_with_Snowflakes_PNG_Clipart-727.png',
            description: 'Wrapped holiday present boxes'
        },
        {
            id: 'cakes',
            name: 'Cakes',
            category: 'Celebration',
            file: 'Christmas_Cake_PNG_Clipart-10.png',
            description: 'Festive celebration cakes'
        },
        {
            id: 'cupcakes',
            name: 'Cupcakes',
            category: 'Celebration',
            file: 'Muffin_PNG_Clipart-513.png',
            description: 'Celebration baked cupcakes'
        },
        {
            id: 'champagne',
            name: 'Champagne',
            category: 'Celebration',
            file: 'Bottle_of_Champagne_PNG_Clip_Art-2535.png',
            description: 'Celebratory champagne bottles'
        },
        {
            id: 'cocktails',
            name: 'Cocktails',
            category: 'Celebration',
            file: 'Cocktail_Orange_PNG_Clipart-722.png',
            description: 'Festive tropical cocktails'
        },
        {
            id: 'diamonds',
            name: 'Diamonds',
            category: 'Celebration',
            file: 'Blue_Diamond_PNG_Clipart-785.png',
            description: 'Sparkling precious diamonds'
        },
        {
            id: 'gold_coins',
            name: 'Gold Coins',
            category: 'Celebration',
            file: 'Coins_Gold_PNG_Clip_Art-1994.png',
            description: 'Shining gold treasure coins'
        },
        {
            id: 'hearts',
            name: 'Hearts',
            category: 'Romantic',
            file: 'Beautiful_Heart_PNG_Clipart-997.png',
            description: 'Vibrant love hearts'
        },
        {
            id: 'roses',
            name: 'Red Roses',
            category: 'Romantic',
            file: 'Beautiful_Red_Rose_PNG_Clipart-162.png',
            description: 'Elegant blooming red roses'
        },
        {
            id: 'apples',
            name: 'Apples',
            category: 'Nature & Food',
            file: 'Apple_PNG_Clip_Art-1467.png',
            description: 'Classic Microsoft Word red apples'
        },
        {
            id: 'sunflowers',
            name: 'Sunflowers',
            category: 'Nature & Food',
            file: 'Sunflower_PNG_Clipart-192.png',
            description: 'Vibrant golden sunflowers'
        },
        {
            id: 'flowers',
            name: 'Lilies',
            category: 'Nature & Food',
            file: 'Lilium_Flower_PNG_Clipart_Image-2287.png',
            description: 'Graceful floral lilies'
        },
        {
            id: 'autumn_leaves',
            name: 'Autumn Leaves',
            category: 'Nature & Food',
            file: 'Autumn_Maple_Leaf_PNG_Clip_Art-1973.png',
            description: 'Golden autumn maple leaves'
        },
        {
            id: 'butterflies',
            name: 'Butterflies',
            category: 'Nature & Food',
            file: 'Butterfly_PNG_Clip_Art-2413.png',
            description: 'Vibrant winged butterflies'
        },
        {
            id: 'ladybugs',
            name: 'Ladybugs',
            category: 'Nature & Food',
            file: 'Ladybug_PNG_Clip_Art-1582.png',
            description: 'Spotted red garden ladybugs'
        },
        {
            id: 'honeybees',
            name: 'Honeybees',
            category: 'Nature & Food',
            file: 'Bee_PNG_Clip_Art-1590.png',
            description: 'Buzzing striped honeybees'
        },
        {
            id: 'songbirds',
            name: 'Songbirds',
            category: 'Nature & Food',
            file: 'Bird_PNG_Clip_Art-1566.png',
            description: 'Chirping colorful wild songbirds'
        },
        {
            id: 'strawberries',
            name: 'Strawberries',
            category: 'Nature & Food',
            file: 'Strawberry_PNG_Clip_Art-3029.png',
            description: 'Sweet red garden strawberries'
        },
        {
            id: 'cherries',
            name: 'Cherries',
            category: 'Nature & Food',
            file: 'Cherry_PNG_Clipart-220.png',
            description: 'Glossy red twin cherries'
        },
        {
            id: 'lemons',
            name: 'Lemons',
            category: 'Nature & Food',
            file: 'Lemon_PNG_Clip_Art-1524.png',
            description: 'Fresh yellow citrus lemons'
        },
        {
            id: 'pineapples',
            name: 'Pineapples',
            category: 'Nature & Food',
            file: 'Pineapple_Fruit_PNG_Clipart-247.png',
            description: 'Tropical golden pineapples'
        },
        {
            id: 'watermelons',
            name: 'Watermelons',
            category: 'Nature & Food',
            file: 'Piece_of_Watermelon_PNG_Clipart-245.png',
            description: 'Juicy summer watermelon slices'
        },
        {
            id: 'ice_cream',
            name: 'Ice Cream',
            category: 'Nature & Food',
            file: 'Chocolate_Ice_Cream_Cone_PNG_Clip_Art-1694.png',
            description: 'Chocolate ice cream cones'
        },
        {
            id: 'palm_trees',
            name: 'Palm Trees',
            category: 'Nature & Food',
            file: 'Coconut_Palm_Tree_PNG_Clip_Art-1480.png',
            description: 'Tropical coconut palm trees'
        },
        {
            id: 'starfish',
            name: 'Starfish',
            category: 'Nature & Food',
            file: 'Yellow_Starfish_PNG_Clip_Art-1450.png',
            description: 'Golden ocean starfish'
        },
        {
            id: 'seashells',
            name: 'Seashells',
            category: 'Nature & Food',
            file: 'Seashell_PNG_Clip_Art-1535.png',
            description: 'Coastal ocean seashells'
        },
        {
            id: 'sunny_skies',
            name: 'Sunny Skies',
            category: 'Nature & Food',
            file: 'Partly_Cloudy_with_Sun_Weather_Icon_PNG_Clip_Art-1501.png',
            description: 'Warm sunshine and clouds'
        },
        {
            id: 'soccer_balls',
            name: 'Soccer Balls',
            category: 'Sports',
            file: 'Soccer_Ball_PNG_Clip_Art-1361.png',
            description: 'Classic soccer sports balls'
        },
        {
            id: 'pencils',
            name: 'Pencils',
            category: 'Education',
            file: 'Pencil_PNG_Clip_Art-1224.png',
            description: 'School and studio pencils'
        },
        {
            id: 'clocks',
            name: 'Alarm Clocks',
            category: 'Education',
            file: 'Alarm_Clock_PNG_Clip_Art-1121.png',
            description: 'Classic ringing twin-bell clocks'
        }
    ];

    const BorderArtEngine = {
        presets: BORDER_ART_PRESETS,
        currentTarget: 'page', // 'page' or 'elem'
        currentSize: 32,
        currentInset: 15,
        currentArtId: null,
        initialized: false,
        _targetElement: null,

        getPresetById: function(id) {
            return BORDER_ART_PRESETS.find(p => p.id === id) || null;
        },

        getThumbUrl: function(filename) {
            return THUMB_BASE_URL + encodeURIComponent(filename) + '&w=128&h=128&fit=contain';
        },

        /* Generates HTML for repeating border art tiles */
        generateTilesHTML: function(preset, w, h, iconSize, inset) {
            if (!preset || !w || !h) return '';
            iconSize = Math.max(12, Math.min(80, parseInt(iconSize) || 32));
            inset = Math.max(0, Math.min(100, parseInt(inset) || 0));

            const left = inset;
            const top = inset;
            const spanW = w - (2 * inset);
            const spanH = h - (2 * inset);

            if (spanW <= iconSize || spanH <= iconSize) return '';

            // Compute uniform divisions
            const numX = Math.max(1, Math.round((spanW - iconSize) / Math.max(1, iconSize)));
            const numY = Math.max(1, Math.round((spanH - iconSize) / Math.max(1, iconSize)));
            const stepX = (spanW - iconSize) / numX;
            const stepY = (spanH - iconSize) / numY;

            const imgUrl = this.getThumbUrl(preset.file);

            let html = `<div class="border-art-wrapper" data-art="${preset.id}" data-size="${iconSize}" data-inset="${inset}" style="position:absolute; inset:0; pointer-events:none; overflow:hidden; z-index:2500; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">`;

            const makeTile = (x, y) => {
                return `<img src="${imgUrl}" alt="${preset.name}" crossorigin="anonymous" style="position:absolute; left:${Math.round(x)}px; top:${Math.round(y)}px; width:${iconSize}px; height:${iconSize}px; object-fit:contain; pointer-events:none; user-select:none; -webkit-user-drag:none; display:block; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">`;
            };

            // Top edge (including corners)
            for (let k = 0; k <= numX; k++) {
                html += makeTile(left + k * stepX, top);
            }
            // Bottom edge (including corners)
            for (let k = 0; k <= numX; k++) {
                html += makeTile(left + k * stepX, top + spanH - iconSize);
            }
            // Left edge (excluding corners)
            for (let k = 1; k < numY; k++) {
                html += makeTile(left, top + k * stepY);
            }
            // Right edge (excluding corners)
            for (let k = 1; k < numY; k++) {
                html += makeTile(left + spanW - iconSize, top + k * stepY);
            }

            html += `</div>`;
            return html;
        },

        /* Renders border art into the page-border container and serializes native-border-art-border element */
        renderPageBorder: function(container, styleString) {
            if (!container) container = document.getElementById('page-border');
            const paper = document.getElementById('paper') || (container ? container.closest('#paper') : null) || document.querySelector('.page.active');
            if (!paper) return;

            // Clear native blueprint border if present to prevent overlap
            const nativeBp = document.getElementById('native-blueprint-border');
            if (nativeBp) nativeBp.remove();

            const oldBorderEl = document.getElementById('native-border-art-border') || paper.querySelector('#native-border-art-border');

            if (!styleString || styleString === 'none') {
                if (container) {
                    container.innerHTML = '';
                    container.removeAttribute('data-style');
                }
                if (oldBorderEl) oldBorderEl.remove();
                this.currentArtId = null;
                this.updateActiveUI(null);
                return;
            }

            // Parse borderart:id:size:inset
            const parts = styleString.split(':');
            const artId = parts[1] || 'santas';
            const size = parseInt(parts[2]) || this.currentSize;
            const inset = parts[3] !== undefined && !isNaN(parseInt(parts[3])) ? parseInt(parts[3]) : this.currentInset;

            const preset = this.getPresetById(artId);
            if (!preset) {
                if (container) container.innerHTML = '';
                if (oldBorderEl) oldBorderEl.remove();
                return;
            }

            if (this.currentTarget === 'page') {
                this.currentArtId = artId;
                this.currentSize = size;
                this.currentInset = inset;
            }

            const w = paper.offsetWidth || parseFloat(paper.style.width) || 794;
            const h = paper.offsetHeight || parseFloat(paper.style.height) || 1123;

            const tilesHTML = this.generateTilesHTML(preset, w, h, size, inset);

            if (container) {
                container.setAttribute('data-style', `borderart:${artId}:${size}:${inset}`);
                container.style.cssText = 'position: absolute; inset: 0; pointer-events: none; z-index: 2500; box-sizing: border-box; overflow: hidden;';
                container.innerHTML = tilesHTML;
            }

            // Create or update the serialized .pub-element inside #paper
            let borderEl = oldBorderEl;
            if (!borderEl) {
                borderEl = document.createElement('div');
                borderEl.id = 'native-border-art-border';
                borderEl.className = 'pub-element';
                borderEl.setAttribute('data-type', 'shape');
                borderEl.setAttribute('data-is-border', 'true');
                paper.appendChild(borderEl);
            }
            borderEl.setAttribute('data-border-art', `borderart:${artId}:${size}:${inset}`);
            borderEl.setAttribute('data-is-border', 'true');
            borderEl.style.cssText = `position: absolute; left: 0px; top: 0px; width: ${w}px; height: ${h}px; z-index: 1; pointer-events: none !important; user-select: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;`;
            borderEl.innerHTML = `<div class="element-content" style="width:100%; height:100%; position:absolute; inset:0; pointer-events:none;">${tilesHTML}</div>`;

            if (this.currentTarget === 'page') {
                this.updateActiveUI(artId);
            }
        },

        /* Renders border art on a selected canvas element */
        renderElementBorder: function(el, artId, size, inset, explicitW, explicitH) {
            if (!el) return;
            const content = el.querySelector('.element-content') || el;
            const oldOverlay = el.querySelector('.element-border-art');
            const textDiv = (el.querySelector && !el.querySelector('table')) ? el.querySelector('[contenteditable="true"]') : null;

            if (!artId || artId === 'none') {
                if (oldOverlay) oldOverlay.remove();
                el.removeAttribute('data-border-art');
                if (this._elementObserver) {
                    try { this._elementObserver.unobserve(el); } catch(e) {}
                }
                if (textDiv) {
                    if (textDiv.hasAttribute('data-original-padding')) {
                        textDiv.style.padding = textDiv.getAttribute('data-original-padding');
                        textDiv.removeAttribute('data-original-padding');
                    } else {
                        textDiv.style.padding = '10px';
                    }
                }
                return;
            }

            const preset = this.getPresetById(artId);
            if (!preset) return;

            const w = explicitW !== undefined ? explicitW : (el.offsetWidth || parseFloat(el.style.width) || 300);
            const h = explicitH !== undefined ? explicitH : (el.offsetHeight || parseFloat(el.style.height) || 200);

            const safeSize = Math.max(12, Math.min(size || 32, Math.max(16, Math.floor(Math.min(w, h) / 2 - 2))));
            const safeInset = Math.max(0, Math.min(inset !== undefined ? inset : 0, Math.max(0, Math.floor((Math.min(w, h) - safeSize) / 2 - 2))));

            const tilesHTML = this.generateTilesHTML(preset, w, h, safeSize, safeInset);

            let overlay = oldOverlay;
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'element-border-art';
                content.appendChild(overlay);
            }
            overlay.setAttribute('data-border-art', `${artId}:${safeSize}:${safeInset}`);
            overlay.style.cssText = 'position: absolute; inset: 0; pointer-events: none; z-index: 999; overflow: hidden; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;';
            overlay.innerHTML = tilesHTML;

            el.setAttribute('data-border-art', `${artId}:${size || safeSize}:${inset !== undefined ? inset : safeInset}`);
            el._lastBorderArtW = Math.round(w);
            el._lastBorderArtH = Math.round(h);

            // Dynamic padding for text boxes matching border reach + buffer
            if (textDiv) {
                if (!textDiv.hasAttribute('data-original-padding')) {
                    textDiv.setAttribute('data-original-padding', textDiv.style.padding || '10px');
                }
                const borderReach = safeInset + safeSize;
                const maxPad = Math.max(10, Math.floor(Math.min(w, h) / 2 - 4));
                const targetPad = Math.min(maxPad, Math.round(borderReach + 6));
                textDiv.style.padding = targetPad + 'px';
                textDiv.style.boxSizing = 'border-box';
            }

            this.observeElement(el);
        },

        /* Refreshes border art on an element based on current dimensions */
        refreshElement: function(el, explicitW, explicitH) {
            if (!el) return;
            const attr = el.getAttribute('data-border-art');
            if (!attr || attr === 'none') return;
            const parts = attr.split(':');
            const artId = parts[0];
            const size = parseInt(parts[1]) || this.currentSize;
            const inset = parts[2] !== undefined ? parseInt(parts[2]) : this.currentInset;
            this.renderElementBorder(el, artId, size, inset, explicitW, explicitH);
        },

        /* Observes an element for external dimension changes via ResizeObserver */
        observeElement: function(el) {
            if (!el || typeof ResizeObserver === 'undefined') return;
            if (!this._elementObserver) {
                this._elementObserver = new ResizeObserver(entries => {
                    for (const entry of entries) {
                        const target = entry.target;
                        if (target && target.hasAttribute('data-border-art')) {
                            const cr = entry.contentRect;
                            const w = cr ? Math.round(cr.width) : target.offsetWidth;
                            const h = cr ? Math.round(cr.height) : target.offsetHeight;
                            if (target._lastBorderArtW !== w || target._lastBorderArtH !== h) {
                                target._lastBorderArtW = w;
                                target._lastBorderArtH = h;
                                BorderArtEngine.refreshElement(target, w, h);
                            }
                        }
                    }
                });
            }
            try {
                this._elementObserver.observe(el);
            } catch(e) {}
        },

        /* Apply chosen border art */
        apply: function(artId) {
            const size = this.currentSize || 32;
            const inset = (this.currentInset !== undefined && this.currentInset !== null) ? this.currentInset : 0;

            this.currentSize = size;
            this.currentInset = inset;
            this.currentArtId = (artId && artId !== 'none') ? artId : null;

            if (this.currentTarget === 'elem') {
                const targetEl = (window.state && window.state.selectedEl) ? window.state.selectedEl : (this._targetElement || document.querySelector('.pub-element.selected'));
                if (targetEl) {
                    this._targetElement = targetEl;
                    this.renderElementBorder(targetEl, artId, size, inset);
                    this.updateActiveUI(this.currentArtId);
                    if (typeof window.pushHistory === 'function') window.pushHistory();
                    if (typeof window.updatePageThumbnails === 'function') window.updatePageThumbnails();
                    return;
                }
            }
            this.applyToPage(artId, size, inset);
            this.updateActiveUI(this.currentArtId);
        },

        applyToPage: function(artId, size, inset) {
            if (!artId || artId === 'none') {
                if (typeof window.setPageBorder === 'function') {
                    window.setPageBorder('none', true);
                } else {
                    this.renderPageBorder(document.getElementById('page-border'), 'none');
                }
            } else {
                const styleStr = `borderart:${artId}:${size}:${inset}`;
                if (typeof window.setPageBorder === 'function') {
                    window.setPageBorder(styleStr, true);
                } else {
                    this.renderPageBorder(document.getElementById('page-border'), styleStr);
                }
            }
            if (typeof window.pushHistory === 'function') window.pushHistory();
            if (typeof window.updatePageThumbnails === 'function') window.updatePageThumbnails();
        },

        /* Highlight currently active card in UI */
        updateActiveUI: function(activeId) {
            const cards = document.querySelectorAll('.border-art-card');
            cards.forEach(card => {
                const id = card.getAttribute('data-id');
                if (id === activeId) {
                    card.classList.add('active');
                    card.style.borderColor = 'var(--ui-theme-color)';
                    card.style.backgroundColor = 'color-mix(in srgb, var(--ui-theme-color) 12%, transparent)';
                } else {
                    card.classList.remove('active');
                    card.style.borderColor = 'var(--ui-border, #e2e8f0)';
                    card.style.backgroundColor = 'var(--ui-bg, #f8fafc)';
                }
            });
        },

        /* Initialize Dropdown UI */
        init: function() {
            const dropdown = document.getElementById('border-art-dropdown');
            if (!dropdown) return;
            if (this.initialized) return;
            this.initialized = true;

            // Reset dropdown outer container
            dropdown.style.cssText = 'position: absolute; display: none; z-index: 999999; width: 410px; padding: 0; background: transparent; border: none; box-shadow: none;';

            let gridCardsHTML = '';
            BORDER_ART_PRESETS.forEach(p => {
                const thumb = this.getThumbUrl(p.file);
                gridCardsHTML += `
                    <div class="border-art-card" data-id="${p.id}" onclick="BorderArtEngine.apply('${p.id}')" title="${p.description}" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:5px 2px; border:1px solid var(--ui-border, #e2e8f0); border-radius:6px; cursor:pointer; background:var(--ui-bg, #f8fafc); transition:all 0.15s; user-select:none; position:relative; min-width:0; box-sizing:border-box;">
                        <div class="border-art-card-img-box" style="width:28px; height:28px; display:flex; align-items:center; justify-content:center; margin-bottom:2px;">
                            <img src="${thumb}" alt="${p.name}" style="max-width:26px; max-height:26px; object-fit:contain; pointer-events:none;">
                        </div>
                        <span style="font-size:9.5px; font-weight:600; text-align:center; color:var(--ui-text, #334155); line-height:1.15; width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${p.name}">${p.name}</span>
                        <span style="font-size:7.5px; color:var(--ui-text-muted, #64748b); text-align:center; margin-top:1px; width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.category}</span>
                    </div>
                `;
            });

            dropdown.innerHTML = `
                <div id="border-art-scroll-container" style="padding:12px 8px 18px 8px; width:100%; box-sizing:border-box; background:var(--ui-panel-bg, #ffffff); border-radius:8px; border:2px solid var(--ui-theme-color); overflow-y:auto; overflow-x:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.18); color:var(--ui-text, #333333); font-family:inherit;">
                    <!-- Header -->
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; border-bottom:1px solid var(--ui-border, #e2e8f0); padding-bottom:8px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <i class="fas fa-palette" style="color:var(--ui-theme-color); font-size:14px;"></i>
                            <strong style="font-size:13px; color:var(--ui-text, #1e293b);">Border Art</strong>
                        </div>
                        <span style="font-size:10px; font-weight:600; background:color-mix(in srgb, var(--ui-theme-color) 15%, transparent); color:var(--ui-theme-color); padding:2px 6px; border-radius:10px;">${BORDER_ART_PRESETS.length} Styles</span>
                    </div>

                    <!-- Target Selector -->
                    <div style="display:flex; gap:6px; margin-bottom:12px;">
                        <button type="button" id="border-art-target-page" class="border-art-target-btn active" onclick="BorderArtEngine.setTarget('page')" style="flex:1; padding:6px 8px; font-size:11px; font-weight:600; border-radius:5px; border:1px solid var(--ui-theme-color); background:var(--ui-theme-color); color:#ffffff; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; transition:all 0.1s;">
                            <i class="fas fa-file-alt"></i> Whole Page
                        </button>
                        <button type="button" id="border-art-target-elem" class="border-art-target-btn" onclick="BorderArtEngine.setTarget('elem')" style="flex:1; padding:6px 8px; font-size:11px; font-weight:600; border-radius:5px; border:1px solid var(--ui-border, #cbd5e1); background:var(--ui-bg, #f8fafc); color:var(--ui-text, #475569); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px; transition:all 0.1s;">
                            <i class="fas fa-vector-square"></i> Selected Box
                        </button>
                    </div>

                    <!-- Sliders -->
                    <div style="margin-bottom:10px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:11px; font-weight:bold; color:var(--ui-text, #333333);">
                            <span>Art Size</span>
                            <span id="border-art-size-val" style="color:var(--ui-theme-color);">${this.currentSize}px</span>
                        </div>
                        <input type="range" id="border-art-size-slider" min="16" max="64" value="${this.currentSize}" step="2" style="width:100%; cursor:pointer; accent-color:var(--ui-theme-color);" oninput="BorderArtEngine.onSizeChange(this.value)">
                    </div>

                    <div style="margin-bottom:12px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:11px; font-weight:bold; color:var(--ui-text, #333333);">
                            <span>Margin / Inset</span>
                            <span id="border-art-inset-val" style="color:var(--ui-theme-color);">${this.currentInset}px</span>
                        </div>
                        <input type="range" id="border-art-inset-slider" min="0" max="60" value="${this.currentInset}" step="1" style="width:100%; cursor:pointer; accent-color:var(--ui-theme-color);" oninput="BorderArtEngine.onInsetChange(this.value)">
                    </div>

                    <!-- None / Remove Button -->
                    <button type="button" id="border-art-none-btn" onclick="BorderArtEngine.apply('none')" style="width:100%; padding:7px; margin-bottom:12px; font-size:11px; font-weight:bold; border:1px dashed var(--ui-border, #cbd5e1); border-radius:6px; background:var(--ui-bg, #f8fafc); color:var(--ui-text, #64748b); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; transition:all 0.1s;">
                        <i class="fas fa-ban"></i> None (Remove Border Art)
                    </button>

                    <!-- Clipart Grid -->
                    <label style="font-size:11px; font-weight:bold; display:block; margin-bottom:8px; color:var(--ui-text, #333333);">Choose Clipart Pattern</label>
                    <div id="border-art-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:5px;">
                        ${gridCardsHTML}
                    </div>
                </div>
            `;

            // Hover effects on cards
            const cards = dropdown.querySelectorAll('.border-art-card');
            cards.forEach(card => {
                card.onmouseover = () => {
                    if (!card.classList.contains('active')) {
                        card.style.borderColor = 'var(--ui-theme-color)';
                        card.style.backgroundColor = 'color-mix(in srgb, var(--ui-theme-color) 10%, transparent)';
                        card.style.transform = 'translateY(-1px)';
                    }
                };
                card.onmouseout = () => {
                    if (!card.classList.contains('active')) {
                        card.style.borderColor = 'var(--ui-border, #e2e8f0)';
                        card.style.backgroundColor = 'var(--ui-bg, #f8fafc)';
                        card.style.transform = 'none';
                    }
                };
            });

            // Window resize listener to recompute dropdown position & max-height if open
            window.addEventListener('resize', () => {
                const m = document.getElementById('border-art-dropdown');
                const btn = document.getElementById('border-art-btn');
                if (m && m.style.display === 'block' && btn) {
                    BorderArtEngine.positionMenu(btn);
                }
            });

            // Outside click to close dropdown
            document.addEventListener('click', (e) => {
                const m = document.getElementById('border-art-dropdown');
                if (m && m.style.display !== 'none' && !m.contains(e.target) && !e.target.closest('#border-art-btn') && !e.target.closest('.pub-context-item') && !e.target.closest('#custom-dialog-box')) {
                    setTimeout(() => { m.style.display = 'none'; }, 10);
                }
            }, true);

            // Responsive auto-resize listener for paper
            const paperEl = document.getElementById('paper');
            if (paperEl && window.ResizeObserver) {
                const ro = new ResizeObserver(() => {
                    const pageBorder = document.getElementById('page-border');
                    if (pageBorder) {
                        const style = pageBorder.getAttribute('data-style');
                        if (style && style.startsWith('borderart:')) {
                            BorderArtEngine.renderPageBorder(pageBorder, style);
                        }
                    }
                });
                ro.observe(paperEl);
            }
        },

        syncStateWithTarget: function() {
            let artId = null;
            let size = 32;
            let inset = (this.currentTarget === 'elem') ? 0 : 15;

            if (this.currentTarget === 'elem') {
                const target = (window.state && window.state.selectedEl) ? window.state.selectedEl : (this._targetElement || document.querySelector('.pub-element.selected'));
                if (target) {
                    this._targetElement = target;
                    const attr = target.getAttribute('data-border-art');
                    if (attr && attr !== 'none') {
                        const parts = attr.split(':');
                        artId = parts[0];
                        if (parts[1]) size = parseInt(parts[1]) || 32;
                        if (parts[2] !== undefined) inset = parseInt(parts[2]) || 0;
                    }
                }
            } else {
                const pageBorder = document.getElementById('page-border');
                if (pageBorder) {
                    const st = pageBorder.getAttribute('data-style');
                    if (st && st.startsWith('borderart:')) {
                        const parts = st.split(':');
                        artId = parts[1];
                        if (parts[2]) size = parseInt(parts[2]) || 32;
                        if (parts[3] !== undefined) inset = parseInt(parts[3]) || 15;
                    }
                }
            }

            this.currentArtId = artId;
            this.currentSize = size;
            this.currentInset = inset;

            this.updateActiveUI(artId);

            const sSlider = document.getElementById('border-art-size-slider');
            const sVal = document.getElementById('border-art-size-val');
            if (sSlider) sSlider.value = size;
            if (sVal) sVal.innerText = size + 'px';

            const iSlider = document.getElementById('border-art-inset-slider');
            const iVal = document.getElementById('border-art-inset-val');
            if (iSlider) iSlider.value = inset;
            if (iVal) iVal.innerText = inset + 'px';
        },

        getActiveArtId: function() {
            if (this.currentArtId && this.currentArtId !== 'none') {
                return this.currentArtId;
            }
            if (this.currentTarget === 'elem') {
                const targetEl = (window.state && window.state.selectedEl) ? window.state.selectedEl : (this._targetElement || document.querySelector('.pub-element.selected'));
                if (targetEl) {
                    const attr = targetEl.getAttribute('data-border-art');
                    if (attr && attr !== 'none') {
                        return attr.split(':')[0];
                    }
                }
            } else {
                const pageBorder = document.getElementById('page-border');
                if (pageBorder) {
                    const st = pageBorder.getAttribute('data-style');
                    if (st && st.startsWith('borderart:')) {
                        return st.split(':')[1];
                    }
                }
            }
            return null;
        },

        setTarget: function(target) {
            this.currentTarget = target;
            const btnPage = document.getElementById('border-art-target-page');
            const btnElem = document.getElementById('border-art-target-elem');
            if (btnPage && btnElem) {
                if (target === 'page') {
                    btnPage.classList.add('active');
                    btnPage.style.background = 'var(--ui-theme-color)';
                    btnPage.style.color = '#ffffff';
                    btnPage.style.borderColor = 'var(--ui-theme-color)';

                    btnElem.classList.remove('active');
                    btnElem.style.background = 'var(--ui-bg, #f8fafc)';
                    btnElem.style.color = 'var(--ui-text, #475569)';
                    btnElem.style.borderColor = 'var(--ui-border, #cbd5e1)';
                } else {
                    btnElem.classList.add('active');
                    btnElem.style.background = 'var(--ui-theme-color)';
                    btnElem.style.color = '#ffffff';
                    btnElem.style.borderColor = 'var(--ui-theme-color)';

                    btnPage.classList.remove('active');
                    btnPage.style.background = 'var(--ui-bg, #f8fafc)';
                    btnPage.style.color = 'var(--ui-text, #475569)';
                    btnPage.style.borderColor = 'var(--ui-border, #cbd5e1)';
                }
            }

            this.syncStateWithTarget();
        },

        onSizeChange: function(val) {
            const v = parseInt(val) || 32;
            this.currentSize = v;
            const slider = document.getElementById('border-art-size-slider');
            if (slider && String(slider.value) !== String(v)) slider.value = v;
            const lbl = document.getElementById('border-art-size-val');
            if (lbl) lbl.innerText = v + 'px';

            const artId = this.getActiveArtId();
            if (artId) {
                this.currentArtId = artId;
                this.apply(artId);
            }
        },

        onInsetChange: function(val) {
            const v = parseInt(val) || 0;
            this.currentInset = v;
            const slider = document.getElementById('border-art-inset-slider');
            if (slider && String(slider.value) !== String(v)) slider.value = v;
            const lbl = document.getElementById('border-art-inset-val');
            if (lbl) lbl.innerText = v + 'px';

            const artId = this.getActiveArtId();
            if (artId) {
                this.currentArtId = artId;
                this.apply(artId);
            }
        },

        positionMenu: function(btn) {
            const m = document.getElementById('border-art-dropdown');
            if (!m || !btn) return;
            const r = btn.getBoundingClientRect();
            const menuW = 410;
            let leftPos = r.left;
            if (leftPos + menuW > window.innerWidth - 10) {
                leftPos = Math.max(10, window.innerWidth - menuW - 10);
            }
            m.style.left = Math.max(10, leftPos) + 'px';
            m.style.top = (r.bottom + 5) + 'px';
            m.style.display = 'block';

            // Dynamically calculate height to drop down ~80% of space below ribbon
            const spaceBelow = window.innerHeight - (r.bottom + 5);
            const availH = Math.max(200, Math.round(spaceBelow * 0.80));
            const scrollContainer = document.getElementById('border-art-scroll-container');
            if (scrollContainer) {
                scrollContainer.style.maxHeight = availH + 'px';
                scrollContainer.style.overflowY = 'auto';
                scrollContainer.style.overflowX = 'hidden';
            }
        },

        toggleMenu: function(btn) {
            this.init();
            const m = document.getElementById('border-art-dropdown');
            if (!m) return;

            const isBlock = m.style.display === 'block';
            document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');

            if (!isBlock) {
                // If element is selected, update target buttons state
                if (window.state && window.state.selectedEl) {
                    this.setTarget('elem');
                } else {
                    this.setTarget('page');
                }

                this.positionMenu(btn);

                const scrollContainer = document.getElementById('border-art-scroll-container');
                if (scrollContainer) {
                    scrollContainer.scrollTop = 0;
                }
            }
        },

        openForElement: function(el, x, y) {
            this.init();
            const target = el || (window.state && window.state.selectedEl ? window.state.selectedEl : null) || this._targetElement;
            if (target) {
                this._targetElement = target;
                if (window.selectElement && window.state && window.state.selectedEl !== target) {
                    window.selectElement(target);
                }
            }
            this.setTarget('elem');

            const m = document.getElementById('border-art-dropdown');
            if (!m) return;

            document.querySelectorAll('.dropdown-menu').forEach(d => {
                if (d !== m) d.style.display = 'none';
            });

            let posX = 100, posY = 150;
            if (x !== undefined && y !== undefined) {
                posX = x;
                posY = y;
            } else if (target) {
                const r = target.getBoundingClientRect();
                posX = r.right + 12;
                posY = r.top;
            } else {
                const btn = document.getElementById('border-art-btn');
                if (btn) {
                    const r = btn.getBoundingClientRect();
                    posX = r.left;
                    posY = r.bottom + 5;
                }
            }

            const menuW = 410;
            if (posX + menuW > window.innerWidth - 10) {
                posX = Math.max(10, window.innerWidth - menuW - 10);
            }
            if (posY + 320 > window.innerHeight) {
                posY = Math.max(40, window.innerHeight - 480);
            }

            m.style.left = Math.max(10, Math.round(posX)) + 'px';
            m.style.top = Math.max(10, Math.round(posY)) + 'px';

            const spaceBelow = window.innerHeight - posY;
            const availH = Math.max(220, Math.round(Math.min(window.innerHeight * 0.80, Math.max(spaceBelow * 0.82, 340))));
            const scrollContainer = document.getElementById('border-art-scroll-container');
            if (scrollContainer) {
                scrollContainer.style.maxHeight = availH + 'px';
                scrollContainer.style.overflowY = 'auto';
                scrollContainer.style.overflowX = 'hidden';
                scrollContainer.scrollTop = 0;
            }

            setTimeout(() => {
                m.style.display = 'block';
            }, 25);
        }
    };

    window.BorderArtEngine = BorderArtEngine;
    window.initBorderArt = () => BorderArtEngine.init();
    window.toggleBorderArtMenu = (btn) => BorderArtEngine.toggleMenu(btn);
    window.applyBorderArt = (id) => BorderArtEngine.apply(id);
    window.openBorderArtForElement = (el, x, y) => BorderArtEngine.openForElement(el, x, y);

    // Initialize on load
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => BorderArtEngine.init(), 600);
    });

})(window);
