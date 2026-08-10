function initAds() {
    console.log("🛠️ Advanced SVG Ads Library (Clean UI Edition) initializing...");
    
    const grid = document.getElementById('ad-grid');
    if (!grid) return;
    
    // Reset and format the grid container
    grid.innerHTML = '';
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(4, 1fr)";
    grid.style.gap = "10px";
    grid.style.padding = "10px";

    // --- MATHEMATICAL GENERATORS FOR ADS ---
    const star = (pts, ir) => {
        let points = [];
        for(let i=0; i<pts*2; i++) {
            let r = i%2===0 ? 45 : ir;
            let a = (i * Math.PI / pts) - Math.PI/2;
            points.push(`${(50 + r*Math.cos(a)).toFixed(1)},${(50 + r*Math.sin(a)).toFixed(1)}`);
        }
        return `<polygon points="${points.join(' ')}" />`;
    };

    const poly = (sides) => {
        let points = [];
        for(let i=0; i<sides; i++) {
            let a = (i * 2 * Math.PI / sides) - Math.PI/2;
            points.push(`${(50 + 45*Math.cos(a)).toFixed(1)},${(50 + 45*Math.sin(a)).toFixed(1)}`);
        }
        return `<polygon points="${points.join(' ')}" />`;
    };

    // Robust Shapes that actually fit text well
    const circle = `<circle cx="50" cy="50" r="45" />`;
    const doubleCircle = `<circle cx="50" cy="50" r="45" /><circle cx="50" cy="50" r="38" fill="none" stroke-width="2" stroke-dasharray="4 4" />`;
    const softRect = `<rect x="5" y="15" width="90" height="70" rx="10" ry="10" />`;
    const pill = `<rect x="5" y="20" width="90" height="60" rx="30" ry="30" />`;
    const straightRibbon = `<polygon points="5,25 95,25 85,50 95,75 5,75 15,50" />`;
    const solidBadge = `<polygon points="25,5 75,5 95,50 75,95 25,95 5,50" />`;
    const snippedRect = `<polygon points="15,5 85,5 95,15 95,85 85,95 15,95 5,85 5,15" />`;
    const ticket = `<path d="M5,20 H95 V40 A10,10 0 0,0 95,60 V80 H5 V60 A10,10 0 0,0 5,40 Z" />`;

    // --- THE MASSIVE 96-TEMPLATE ADVERTISEMENT LIBRARY ---
    const ads = [
        // Row 1: High Impact Sales
        { t: 'SALE', bg: '#e11d48', tc: 'white', stroke: '#9f1239', markup: star(24, 38) },
        { t: 'NEW!', bg: '#0ea5e9', tc: 'white', stroke: '#0369a1', markup: star(12, 32) },
        { t: '50%<br>OFF', bg: '#f59e0b', tc: '#ffffff', stroke: '#b45309', markup: doubleCircle },
        { t: 'HOT<br>DEAL', bg: '#ef4444', tc: 'white', stroke: '#b91c1c', markup: star(16, 36) },
        
        // Row 2: Value & Promos
        { t: 'WOW!', bg: '#ec4899', tc: 'white', stroke: '#be185d', markup: star(20, 35) },
        { t: 'TOP<br>RATED', bg: '#f59e0b', tc: 'white', stroke: '#b45309', markup: solidBadge },
        { t: 'MEGA<br>SALE', bg: '#8b5cf6', tc: 'white', stroke: '#6d28d9', markup: star(32, 42) },
        { t: 'SUPER<br>BUY', bg: '#10b981', tc: 'white', stroke: '#047857', markup: star(10, 36) },
        
        // Row 3: Ribbons & Banners
        { t: 'SPECIAL', bg: '#eab308', tc: '#713f12', stroke: '#a16207', markup: straightRibbon },
        { t: 'WINNER', bg: '#3b82f6', tc: 'white', stroke: '#2e1065', markup: pill },
        { t: 'PROMO', bg: '#f43f5e', tc: 'white', stroke: '#9d174d', markup: softRect },
        { t: 'AWARD', bg: '#d97706', tc: 'white', stroke: '#78350f', markup: poly(8) },
        
        // Row 4: Shields & Plaques
        { t: 'VALUE', bg: '#14b8a6', tc: 'white', stroke: '#0f766e', markup: snippedRect },
        { t: 'BEST<br>SELLER', bg: '#8b5cf6', tc: 'white', stroke: '#6d28d9', markup: solidBadge },
        { t: 'PREMIUM', bg: '#1e293b', tc: '#f8fafc', stroke: '#0f172a', markup: poly(6) },
        { t: 'TRUSTED', bg: '#059669', tc: 'white', stroke: '#064e3b', markup: circle },
        
        // Row 5: Modern Deals
        { t: 'OFFICIAL', bg: '#2563eb', tc: 'white', stroke: '#1e3a8a', markup: snippedRect },
        { t: 'BOGO', bg: '#10b981', tc: 'white', stroke: '#047857', markup: pill },
        { t: 'LIMITED', bg: '#1e293b', tc: '#f8fafc', stroke: '#0f172a', markup: softRect },
        { t: 'FREE', bg: '#14b8a6', tc: 'white', stroke: '#0f766e', markup: star(8, 38) },
        
        // Row 6: Clearance & Urgency
        { t: 'CLEARANCE', bg: '#f97316', tc: 'white', stroke: '#c2410c', markup: straightRibbon },
        { t: '2 FOR 1', bg: '#dc2626', tc: 'white', stroke: '#7f1d1d', markup: circle },
        { t: 'VIP', bg: '#fcd34d', tc: '#78350f', stroke: '#b45309', markup: doubleCircle },
        { t: 'MEMBER', bg: '#334155', tc: '#fbbf24', stroke: '#0f172a', markup: poly(8) },
        
        // Row 7: Pricing specific
        { t: '75% OFF', bg: '#c026d3', tc: 'white', stroke: '#701a75', markup: star(24, 38) },
        { t: 'ONLY $5', bg: '#ea580c', tc: 'white', stroke: '#7c2d12', markup: ticket },
        { t: 'FRESH', bg: '#84cc16', tc: 'white', stroke: '#3f6212', markup: softRect },
        { t: 'HUGE<br>SAVINGS', bg: '#eab308', tc: '#713f12', stroke: '#a16207', markup: star(16, 36) },

        // Row 8: Action Words
        { t: 'DON\'T<br>MISS OUT', bg: '#e11d48', tc: 'white', stroke: '#881337', markup: circle },
        { t: 'BUY NOW', bg: '#2563eb', tc: 'white', stroke: '#1e3a8a', markup: pill },
        { t: 'DEAL OF<br>THE DAY', bg: '#059669', tc: 'white', stroke: '#064e3b', markup: snippedRect },
        { t: 'HURRY!', bg: '#d946ef', tc: 'white', stroke: '#701a75', markup: star(12, 35) },
        
        // Row 9: Trust Signals
        { t: 'COUPON', bg: '#64748b', tc: 'white', stroke: '#334155', markup: ticket },
        { t: 'GIFT', bg: '#f43f5e', tc: 'white', stroke: '#be123c', markup: solidBadge },
        { t: '100%<br>GUARANTEE', bg: '#10b981', tc: 'white', stroke: '#047857', markup: poly(8) },
        { t: 'BONUS', bg: '#6366f1', tc: 'white', stroke: '#3730a3', markup: star(24, 40) },

        // Row 10: Extra Variety
        { t: 'FLASH<br>SALE', bg: '#fbbf24', tc: '#b45309', stroke: '#d97706', markup: star(16, 30) },
        { t: 'LAST<br>CHANCE', bg: '#dc2626', tc: 'white', stroke: '#991b1b', markup: circle },
        { t: 'EXCLUSIVE', bg: '#111827', tc: '#38bdf8', stroke: '#38bdf8', markup: straightRibbon },
        { t: 'DISCOUNT', bg: '#4ade80', tc: '#064e3b', stroke: '#047857', markup: softRect },

        // Row 11: Vibrant 
        { t: 'EPIC', bg: '#f472b6', tc: 'white', stroke: '#be185d', markup: star(8, 38) },
        { t: 'LATEST', bg: '#22d3ee', tc: '#0c4a6e', stroke: '#0891b2', markup: pill },
        { t: 'TRENDING', bg: '#a78bfa', tc: 'white', stroke: '#5b21b6', markup: doubleCircle },
        { t: 'POPULAR', bg: '#fb923c', tc: 'white', stroke: '#c2410c', markup: poly(6) },

        // Row 12: Final Additions
        { t: 'BARGAIN', bg: '#34d399', tc: '#022c22', stroke: '#047857', markup: solidBadge },
        { t: 'REDUCED', bg: '#f87171', tc: 'white', stroke: '#991b1b', markup: ticket },
        { t: 'FEATURED', bg: '#818cf8', tc: 'white', stroke: '#3730a3', markup: snippedRect },
        { t: 'LOCAL', bg: '#a3e635', tc: '#3f6212', stroke: '#4d7c0f', markup: star(12, 38) },

        // Row 13: Urgency
        { t: 'ENDS<br>SOON', bg: '#ef4444', tc: 'white', stroke: '#991b1b', markup: pill },
        { t: 'LAST<br>DAY', bg: '#f97316', tc: 'white', stroke: '#c2410c', markup: star(12, 35) },
        { t: '24H<br>ONLY', bg: '#000000', tc: '#fcd34d', stroke: '#fcd34d', markup: doubleCircle },
        { t: 'GOING<br>FAST', bg: '#facc15', tc: '#713f12', stroke: '#ca8a04', markup: snippedRect },
        
        // Row 14: Stock & Inventory
        { t: 'SOLD<br>OUT', bg: '#64748b', tc: 'white', stroke: '#334155', markup: doubleCircle },
        { t: 'IN<br>STOCK', bg: '#10b981', tc: 'white', stroke: '#047857', markup: softRect },
        { t: 'LOW<br>STOCK', bg: '#f59e0b', tc: 'white', stroke: '#b45309', markup: poly(8) },
        { t: 'RESTOCK', bg: '#3b82f6', tc: 'white', stroke: '#1d4ed8', markup: pill },

        // Row 15: Events & Media
        { t: 'LIVE', bg: '#ef4444', tc: 'white', stroke: '#b91c1c', markup: circle },
        { t: 'PREMIERE', bg: '#8b5cf6', tc: 'white', stroke: '#5b21b6', markup: star(16, 35) },
        { t: 'WEBINAR', bg: '#0ea5e9', tc: 'white', stroke: '#0369a1', markup: ticket },
        { t: 'EVENT', bg: '#14b8a6', tc: 'white', stroke: '#0f766e', markup: straightRibbon },

        // Row 16: E-Commerce / Shipping
        { t: 'FREE<br>SHIP', bg: '#10b981', tc: 'white', stroke: '#047857', markup: ticket },
        { t: 'FAST<br>DELIVERY', bg: '#3b82f6', tc: 'white', stroke: '#1d4ed8', markup: softRect },
        { t: 'NEXT<br>DAY', bg: '#f97316', tc: 'white', stroke: '#c2410c', markup: poly(6) },
        { t: '2-DAY<br>SHIP', bg: '#6366f1', tc: 'white', stroke: '#4338ca', markup: doubleCircle },

        // Row 17: SaaS / Pricing Tiers
        { t: 'BASIC', bg: '#94a3b8', tc: 'white', stroke: '#475569', markup: solidBadge },
        { t: 'PRO', bg: '#3b82f6', tc: 'white', stroke: '#1e3a8a', markup: solidBadge },
        { t: 'ENTERPRISE', bg: '#0f172a', tc: 'white', stroke: '#f1f5f9', markup: solidBadge },
        { t: 'GOLD', bg: '#eab308', tc: 'white', stroke: '#a16207', markup: solidBadge },

        // Row 18: Seasonal Deals
        { t: 'SUMMER<br>SALE', bg: '#f59e0b', tc: 'white', stroke: '#b45309', markup: star(16, 36) },
        { t: 'WINTER<br>DEAL', bg: '#06b6d4', tc: 'white', stroke: '#0891b2', markup: star(12, 35) },
        { t: 'SPRING<br>OFFER', bg: '#84cc16', tc: 'white', stroke: '#4d7c0f', markup: circle },
        { t: 'FALL<br>FEST', bg: '#ea580c', tc: 'white', stroke: '#9a3412', markup: poly(8) },

        // Row 19: Discount Percentages
        { t: '10% OFF', bg: '#ec4899', tc: 'white', stroke: '#be185d', markup: circle },
        { t: '20% OFF', bg: '#d946ef', tc: 'white', stroke: '#86198f', markup: doubleCircle },
        { t: '30% OFF', bg: '#8b5cf6', tc: 'white', stroke: '#5b21b6', markup: star(24, 38) },
        { t: '40% OFF', bg: '#6366f1', tc: 'white', stroke: '#4338ca', markup: pill },

        // Row 20: More Discount Percentages
        { t: '60% OFF', bg: '#3b82f6', tc: 'white', stroke: '#1d4ed8', markup: poly(8) },
        { t: '70% OFF', bg: '#0ea5e9', tc: 'white', stroke: '#0369a1', markup: snippedRect },
        { t: '80% OFF', bg: '#14b8a6', tc: 'white', stroke: '#0f766e', markup: softRect },
        { t: '90% OFF', bg: '#10b981', tc: 'white', stroke: '#047857', markup: star(32, 42) },

        // Row 21: Powerful Appeals
        { t: 'SAVE<br>BIG', bg: '#f43f5e', tc: 'white', stroke: '#be123c', markup: star(10, 36) },
        { t: 'HUGE<br>DROP', bg: '#ef4444', tc: 'white', stroke: '#991b1b', markup: straightRibbon },
        { t: 'MUST<br>HAVE', bg: '#facc15', tc: '#713f12', stroke: '#ca8a04', markup: circle },
        { t: 'EPIC<br>DEAL', bg: '#a855f7', tc: 'white', stroke: '#7e22ce', markup: softRect },

        // Row 22: Trust & Security
        { t: 'VERIFIED', bg: '#3b82f6', tc: 'white', stroke: '#1e40af', markup: poly(6) },
        { t: 'SECURE', bg: '#10b981', tc: 'white', stroke: '#065f46', markup: solidBadge },
        { t: 'PROTECTED', bg: '#475569', tc: 'white', stroke: '#1e293b', markup: softRect },
        { t: 'CERTIFIED', bg: '#eab308', tc: 'white', stroke: '#854d0e', markup: doubleCircle },

        // Row 23: Hype & Popularity
        { t: 'VIRAL', bg: '#f472b6', tc: 'white', stroke: '#db2777', markup: star(12, 32) },
        { t: 'ON FIRE', bg: '#ef4444', tc: 'white', stroke: '#b91c1c', markup: circle },
        { t: 'TOP PICK', bg: '#fcd34d', tc: '#92400e', stroke: '#b45309', markup: star(5, 20) },
        { t: 'CHOICE', bg: '#6366f1', tc: 'white', stroke: '#4338ca', markup: pill },

        // Row 24: Extra Sales Offers
        { t: '1/2 PRICE', bg: '#e11d48', tc: 'white', stroke: '#9f1239', markup: circle },
        { t: 'BUY 2<br>GET 1', bg: '#2563eb', tc: 'white', stroke: '#1d4ed8', markup: softRect },
        { t: 'BUNDLE', bg: '#9333ea', tc: 'white', stroke: '#6b21a8', markup: poly(8) },
        { t: 'EXTRA 10%', bg: '#f43f5e', tc: 'white', stroke: '#be123c', markup: star(16, 35) }
    ];

    // --- RENDER THE AD UI ---
    ads.forEach(ad => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.style.cssText = "background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; height: 100px; cursor: pointer; transition: all 0.2s ease;";
        
        const parsedMarkup = ad.markup.replace('stroke="currentColor"', `stroke="${ad.tc}"`);

        // Thumbnail Preview
        div.innerHTML = `
            <svg viewBox="0 0 100 100" style="position: absolute; width: 85%; height: 85%; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">
                <g class="shape-path" fill="${ad.bg}" stroke="${ad.stroke}" stroke-width="2">${parsedMarkup}</g>
            </svg>
            <div style="position: absolute; z-index: 2; color: ${ad.tc}; font-family: 'Impact', sans-serif; font-size: 11px; text-align: center; line-height: 1.1; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); pointer-events: none;">${ad.t}</div>
        `;
        
        div.onmouseover = () => { div.style.borderColor = '#94a3b8'; div.style.transform = 'scale(1.03)'; };
        div.onmouseout = () => { div.style.borderColor = '#e2e8f0'; div.style.transform = 'scale(1)'; };

        // Insertion Logic
        div.onclick = () => {
            const svgString = `<svg viewBox="0 0 100 100" style="width:100%; height:100%; overflow:visible; position:absolute; top:0; left:0; z-index:1;"><g class="shape-path" fill="${ad.bg}" stroke="${ad.stroke}" stroke-width="2">${parsedMarkup}</g></svg>`;
            
            const textString = `
                <div class="wa-wrapper" style="position:absolute; inset:0; z-index:2; pointer-events:none;">
                    <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; transform:scale(0.5); pointer-events:auto;">
                        <div class="wa-text wa-style-none" style="color:${ad.tc}; font-family:'Impact', sans-serif; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); line-height: 1.1;">${ad.t}</div>
                    </div>
                </div>
            `;
            
            if (typeof createWrapper === 'function') {
                const el = createWrapper(`${svgString}${textString}`);
                el.setAttribute('data-type', 'shape');
                if (typeof selectElement === 'function') selectElement(el); // Re-trigger UI now that type is set
                el.style.width = '150px'; 
                el.style.height = '150px';
                
                // --- THE FIX: Custom Double Click Editor Layout ---
                el.ondblclick = (e) => {
                    e.stopPropagation();
                    const textNode = el.querySelector('.wa-text');
                    if (textNode) {
                        const currentText = textNode.innerHTML.replace(/<br\s*[\/]?>/gi, '\n');
                        
                        // We override the global .input-group styling by using an isolated flex column 
                        // and box-sizing to ensure it perfectly stacks and stretches to 100% width.
                        const form = `
                            <div style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box;">
                                <label style="font-weight:bold; margin-bottom:8px; color:#333;">Advertisement Text:</label>
                                <textarea id="ad-text-edit" style="width:100%; height:100px; padding:10px; font-family:inherit; font-size:14px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; resize: vertical; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);">${currentText}</textarea>
                            </div>
                        `;
                        
                        if (typeof DialogSystem !== 'undefined') {
                            DialogSystem.show('Edit Ad Text', form, () => {
                                const newText = document.getElementById('ad-text-edit').value.replace(/\n/g, '<br>');
                                textNode.innerHTML = newText;
                                if (typeof syncWordArt === 'function') syncWordArt(el);
                                if (typeof pushHistory === 'function') pushHistory();
                            });
                        }
                    }
                };
                
                if (typeof syncWordArt === 'function') syncWordArt(el);
            }
            
            document.getElementById('ad-modal').style.display = 'none';
            if (typeof pushHistory === 'function') pushHistory();
        };
        
        grid.appendChild(div);
    });

    console.log(`âœ… Loaded ${ads.length} Clean-Editing SVG Ads successfully.`);
}

function initTemplates() {
    const catsDiv = document.getElementById('template-cats');
    const gridDiv = document.getElementById('template-grid');
    
    // Icon mapping for Font Awesome
    const icons = {
        "Resumes": "fa-user-tie",
        "Invitations": "fa-envelope-open-text",
        "Flyers": "fa-paper-plane",
        "Magazines": "fa-book-open",
        "Brochures": "fa-columns",
        "Certificates": "fa-certificate",
        "Menus": "fa-utensils",
        "Calendars": "fa-calendar-alt",
        "Letterheads": "fa-file-signature",
        "Newsletters": "fa-newspaper",
        "Business Cards": "fa-id-card",
        "Posters": "fa-image",
        "Social Media": "fa-share-alt"
    };

    fetch('elements/templates/template-index.json?v=4.16.17')
        .then(res => res.json())
        .then(indexData => {
            Object.keys(indexData).forEach(cat => {
                const btn = document.createElement('div');
                btn.className = 'cat-btn';
                
                // Add Icon if exists
                const iconClass = icons[cat] || "fa-file-alt";
                btn.innerHTML = `<i class="fas ${iconClass}"></i> ${cat}`;
                
                btn.onclick = (e) => loadCat(cat, indexData, e);
                catsDiv.appendChild(btn);
            });
            
            // Trigger load of first category
            if(catsDiv.firstChild) loadCat(Object.keys(indexData)[0], indexData);
        })
        .catch(err => {
            console.error("Failed to load template index:", err);
            if (window.location.protocol === 'file:') {
                gridDiv.innerHTML = '<div style="padding:40px; text-align:center; color:#666; width: 100%; max-width:500px; margin:40px auto; grid-column: 1 / -1;"><i class="fas fa-exclamation-triangle" style="font-size:48px; color:#f59e0b; margin-bottom:20px; display:block;"></i><h3 style="margin-top:0;">Local File Access Blocked</h3><p>Browsers block reading templates directly from the hard drive for security reasons.</p><p style="margin-top:15px;">To view and use templates, please run Open Publisher through a local web server (e.g. Node <code>http-server</code>, Python <code>http.server</code>, or Nginx).</p></div>';
            } else {
                gridDiv.innerHTML = '<div style="padding:40px; text-align:center; color:#666; grid-column: 1 / -1;">Failed to load templates. Please check your network connection.</div>';
            }
        });

    // Maps pixel dimensions to a human-readable page size label.
    // Checks paper sizes first, then p-scale video resolutions, then falls back to raw dimensions.
    function getPageSizeLabel(w, h) {
        const tol = 5;
        const near = (a, b) => Math.abs(a - b) <= tol;

        // --- Paper sizes (portrait orientation, px at 96dpi) ---
        const paper = [
            { label: 'A4',      w: 794,  h: 1123 },
            { label: 'Letter',  w: 816,  h: 1056 },
            { label: 'A5',      w: 559,  h: 794  },
            { label: 'A3',      w: 1123, h: 1587 },
            { label: 'Legal',   w: 816,  h: 1344 },
            { label: 'A6',      w: 397,  h: 559  },
            { label: 'Tabloid', w: 1056, h: 1632 },
        ];
        for (const s of paper) {
            if (near(w, s.w) && near(h, s.h)) return s.label;
            if (near(w, s.h) && near(h, s.w)) return s.label + ' ↔';
        }

        // --- Square ---
        if (near(w, h)) return 'Square';

        // --- P-scale video/screen resolutions (landscape native) ---
        const pScales = [
            { label: '480p',  sw: 854,  sh: 480  },
            { label: '720p',  sw: 1280, sh: 720  },
            { label: '1080p', sw: 1920, sh: 1080 },
            { label: '1440p', sw: 2560, sh: 1440 },
            { label: '4K',    sw: 3840, sh: 2160 },
        ];
        for (const p of pScales) {
            if (near(w, p.sw) && near(h, p.sh)) return p.label;
            if (near(w, p.sh) && near(h, p.sw)) return p.label + ' ↕';
        }

        // --- Fallback: raw resolution ---
        return `${w}\u00d7${h}`;
    }

    function loadCat(cat, indexData, e) {
        gridDiv.innerHTML = '';
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        
        // Handle active state
        if(e && e.currentTarget) e.currentTarget.classList.add('active');
        else if(!e && catsDiv.firstChild) catsDiv.firstChild.classList.add('active');
        
        const templates = indexData[cat];
        templates.forEach(t => {
            const div = document.createElement('div');
            div.className = 'tp-item';
            div.innerHTML = `<div class="template-preview" style="display:flex;align-items:center;justify-content:center;color:#999;">Loading...</div><div>${t.name}</div>`;
            gridDiv.appendChild(div);
            
            // Fetch the template file
            fetch(`elements/templates/files/${t.file}?v=4.16.17`)
                .then(res => res.json())
                .then(opubData => {
                    const page = opubData.pages[0];
                    let previewHTML = '';
                    page.elements.forEach(el => {
                        previewHTML += `<div style="position:absolute; top:${el.top}; left:${el.left}; width:${el.width}; height:${el.height}; z-index:${el.zIndex};">${el.innerHTML}</div>`;
                    });
                    
                    // Parse width/height if available to scale correctly
                    const w = parseInt(page.width) || 794;
                    const h = parseInt(page.height) || 1123;
                    const scale = 100 / w; // scale to fit 100px width thumbnail
                    const sizeLabel = getPageSizeLabel(w, h);
                    
                    const content = `
                        <div style="
                            width: ${page.width}; 
                            height: ${page.height}; 
                            background: ${page.background}; 
                            transform: scale(${scale}); 
                            transform-origin: 0 0; 
                            overflow: hidden; 
                            position: absolute; 
                            top: 0; left: 0;
                            pointer-events: none;
                        ">
                            ${previewHTML}
                        </div>
                    `;
                    const sizeBadge = `<div style="position:absolute; bottom:5px; right:5px; z-index:999; background:rgba(13,158,143,0.72); color:#fff; font-size:10px; font-family:'Segoe UI',sans-serif; font-weight:700; padding:3px 8px; border-radius:20px; pointer-events:none; letter-spacing:0.5px; line-height:1.5; box-shadow:0 1px 4px rgba(0,0,0,0.2); backdrop-filter:blur(3px);">${sizeLabel}</div>`;
                    div.innerHTML = `<div class="template-preview" style="position:relative; width:100px; height:${h*scale}px; overflow:hidden; background:#eee;">${content}${sizeBadge}</div><div style="margin-top:10px;">${t.name}</div>`;
                    div.onclick = () => loadTemplate(opubData);
                })
                .catch(err => {
                    div.innerHTML = `<div class="template-preview" style="display:flex;align-items:center;justify-content:center;color:red;">Error</div><div>${t.name}</div>`;
                    console.error("Failed to load template file:", err);
                });
        });
    }
}

function loadTemplate(opubData) {
    DialogSystem.show('Load Template', '<p>Load this template? This will replace your ENTIRE document and start fresh.</p>', () => {
        state.pages = []; // Wipe document
        state.history = [];
        state.historyIndex = -1;
        
        // Deep copy the pages to avoid reference issues
        state.pages = JSON.parse(JSON.stringify(opubData.pages));
        
        // Generate new IDs for the pages to ensure uniqueness
        state.pages.forEach(p => {
            p.id = Date.now() + Math.random();
        });
        
        state.currentPageIndex = 0;
        
        renderPage(state.pages[0]);
        updateSidebar();
        document.getElementById('template-modal').style.display = 'none';
        pushHistory();
    });
}

function showAdModal() { document.getElementById('ad-modal').style.display = 'flex'; }
function showTemplateModal() { document.getElementById('template-modal').style.display = 'flex'; }
