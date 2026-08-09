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
    const tmplData = {
        "Resumes": [
            {
                n: "Modern Minimal", bg: "#fff",
                els: [
                    {html:"<div style='background:#2c3e50; width:100%; height:100%;'></div>", t:0, l:0, w:250, h:1123},
                    {html:"<div style='border-radius:50%; background:#ccc; width:100%; height:100%; overflow:hidden; border:5px solid white;'><img src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' style='width:100%; height:100%; object-fit:cover;'></div>", t:50, l:50, w:150, h:150},
                    {html:"<h2 style='color:white; font-family:Montserrat; font-weight:700; text-align:center;'>JOHN<br>DOE</h2>", t:220, l:25, w:200, h:120},
                    {html:"<div style='color:#ccc; font-family:Lato; text-align:center; font-size:14px;'>GRAPHIC DESIGNER</div>", t:340, l:25, w:200, h:50},
                    {html:"<h3 style='color:white; border-bottom:1px solid #555; font-family:Montserrat; padding-bottom:5px;'>CONTACT</h3>", t:400, l:25, w:200, h:60},
                    {html:"<div style='color:#ccc; font-size:12px; line-height:1.5;'><i class='fas fa-phone'></i> +1 234 567 890<br><i class='fas fa-envelope'></i> hello@johndoe.com<br><i class='fas fa-map-marker-alt'></i> New York, NY</div>", t:470, l:25, w:200, h:120},
                    {html:"<h3 style='color:white; border-bottom:1px solid #555; font-family:Montserrat; padding-bottom:5px; margin-top:20px;'>SKILLS</h3>", t:600, l:25, w:200, h:60},
                    {html:"<div style='color:#ccc; font-size:12px;'>• Photoshop<br>• Illustrator<br>• InDesign<br>• HTML/CSS</div>", t:670, l:25, w:200, h:120},
                    
                    {html:"<h1 style='color:#333; font-family:Montserrat; font-weight:700; border-bottom:2px solid #2c3e50; padding-bottom:10px;'>EXPERIENCE</h1>", t:50, l:300, w:450, h:80},
                    {html:"<h3 style='color:#2c3e50; font-family:Montserrat; margin:0;'>Senior Designer</h3><div style='color:#777; font-size:12px;'>Creative Agency / 2020 - Present</div><p style='font-size:13px; color:#555;'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>", t:140, l:300, w:450, h:140},
                    {html:"<h3 style='color:#2c3e50; font-family:Montserrat; margin:0;'>Junior Designer</h3><div style='color:#777; font-size:12px;'>StartUp Inc / 2018 - 2020</div><p style='font-size:13px; color:#555;'>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>", t:300, l:300, w:450, h:140},
                    {html:"<h1 style='color:#333; font-family:Montserrat; font-weight:700; border-bottom:2px solid #2c3e50; padding-bottom:10px;'>EDUCATION</h1>", t:460, l:300, w:450, h:80},
                    {html:"<h3 style='color:#2c3e50; font-family:Montserrat; margin:0;'>Bachelor of Arts</h3><div style='color:#777; font-size:12px;'>University of Design / 2014 - 2018</div>", t:550, l:300, w:450, h:100}
                ]
            },
            {
                n: "Corporate Blue", bg: "#f0f8ff",
                els: [
                    {html:"<div style='border-top:20px solid #0056b3; width:100%; height:100%;'></div>", t:0, l:0, w:794, h:1123},
                    {html:"<h1 style='color:#0056b3; font-family:Arial; font-size:48px; font-weight:bold; letter-spacing:2px;'>JANE SMITH</h1>", t:50, l:50, w:500, h:80},
                    {html:"<div style='font-size:18px; color:#555; font-family:Arial; letter-spacing:4px;'>MARKETING MANAGER</div>", t:130, l:50, w:500, h:50},
                    {html:"<div style='display:flex; justify-content:space-between; border-bottom:1px solid #ccc; padding-bottom:10px; color:#0056b3; font-weight:bold;'><span>PROFILE</span></div>", t:200, l:50, w:694, h:50},
                    {html:"<p style='font-family:Georgia; color:#444; font-size:14px; line-height:1.6;'>Dedicated professional with 10+ years of experience in strategic marketing and team leadership. Proven track record of increasing revenue and brand awareness.</p>", t:260, l:50, w:694, h:100},
                    {html:"<div style='display:flex; justify-content:space-between; border-bottom:1px solid #ccc; padding-bottom:10px; color:#0056b3; font-weight:bold; margin-top:20px;'><span>PROFESSIONAL HISTORY</span></div>", t:380, l:50, w:694, h:50},
                    {html:"<div style='margin-bottom:20px;'><b style='font-size:16px;'>Global Corp</b> <span style='float:right; color:#777;'>2019-Present</span><br><i style='color:#555;'>Head of Marketing</i><ul style='font-size:13px; margin-top:5px; color:#444;'><li>Led a team of 15 specialists.</li><li>Increased sales by 25% YoY.</li></ul></div>", t:440, l:50, w:694, h:140},
                    {html:"<div style='margin-bottom:20px;'><b style='font-size:16px;'>Tech Solutions</b> <span style='float:right; color:#777;'>2015-2019</span><br><i style='color:#555;'>Marketing Associate</i><ul style='font-size:13px; margin-top:5px; color:#444;'><li>Managed social media campaigns.</li><li>Developed SEO strategies.</li></ul></div>", t:600, l:50, w:694, h:140}
                ]
            },
            {
                 n: "Creative Splash", bg: "#fff",
                 els: [
                     {html:"<div style='background:#ff6b6b; width:100%; height:100%; clip-path:polygon(0 0, 100% 0, 100% 85%, 0 100%);'></div>", t:0, l:0, w:794, h:300},
                     {html:"<h1 style='color:white; font-family:Poppins; font-weight:900; font-size:60px; line-height:0.9;'>ALEX<br>RIVER</h1>", t:50, l:50, w:400, h:180},
                     {html:"<div style='background:white; color:#ff6b6b; padding:5px 15px; font-family:Poppins; font-weight:bold; display:inline-block;'>ART DIRECTOR</div>", t:240, l:50, w:200, h:60},
                     {html:"<div style='column-count:2; column-gap:40px; font-family:Roboto; color:#444; font-size:13px;'><h3 style='color:#ff6b6b;'>About Me</h3>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.<br><br><h3 style='color:#ff6b6b;'>Education</h3><b>Design School</b><br>2010-2014<br>Bachelor of Arts<br><br><h3 style='color:#ff6b6b;'>Contact</h3>alex@example.com<br>123-456-7890<br><br><h3 style='color:#ff6b6b;'>Experience</h3><b>Studio X</b> - Senior Artist<br>Managed diverse projects for high-end clients.</div>", t:350, l:50, w:694, h:700}
                 ]
            },
            {
                n: "Executive", bg: "#fafafa",
                els: [
                     {html:"<div style='border-left:5px solid #333; height:100%; padding-left:20px;'><h1 style='text-transform:uppercase; letter-spacing:5px; color:#333; margin:0;'>Sarah Connor</h1><h3 style='color:#666; font-weight:300; margin-top:5px;'>Operations Manager</h3></div>", t:50, l:50, w:700, h:120},
                     {html:"<hr style='border:1px solid #ccc;'>", t:180, l:50, w:700, h:10},
                     {html:"<h4 style='text-transform:uppercase; color:#333;'>Summary</h4><p style='font-size:13px; color:#555;'>Experienced operations manager looking for new opportunities in logistics.</p>", t:210, l:50, w:700, h:100},
                     {html:"<h4 style='text-transform:uppercase; color:#333;'>Work Experience</h4><b style='font-size:14px;'>Logistics Co.</b><br><i style='font-size:12px; color:#777;'>2018-2022</i><p style='font-size:13px;'>Streamlined shipping processes.</p>", t:330, l:50, w:700, h:150},
                     {html:"<div style='background:#333; color:white; padding:20px; text-align:center;'>Contact: 555-999-8888 • sarah@example.com</div>", t:1000, l:50, w:700, h:80}
                ]
            },
            {
                n: "Simple Lines", bg: "#fff",
                els: [
                     {html:"<div style='border-right:2px solid #333; height:100%; width:200px; padding-right:20px; text-align:right;'><h2 style='margin:0;'>JAKE</h2><h2 style='margin:0; color:#777;'>SULLY</h2><br><p>Graphic Designer</p><br><p>contact@email.com</p></div>", t:50, l:0, w:220, h:1000},
                     {html:"<div style='padding-left:20px;'><h3 style='border-bottom:1px solid #ccc;'>Experience</h3><p><b>Company A</b> - 2020-Present<br>Lead Designer.</p><h3 style='border-bottom:1px solid #ccc;'>Education</h3><p><b>School B</b> - 2016-2020<br>BFA Design.</p></div>", t:50, l:250, w:500, h:1000}
                ]
            },
            {
                 n: "Dark Mode", bg: "#222",
                 els: [
                     {html:"<h1 style='color:white; border-bottom:2px solid #00e5ff; display:inline-block;'>NEO ANDERSON</h1>", t:50, l:50, w:700, h:80},
                     {html:"<h3 style='color:#ccc;'>Software Engineer</h3>", t:130, l:50, w:700, h:50},
                     {html:"<div style='color:white; font-family:monospace;'> > Skills: [JS, Python, C++] <br> > Experience: 5 Years <br> > Status: Hired</div>", t:200, l:50, w:700, h:200},
                     {html:"<div style='border:1px solid #444; padding:20px; color:#aaa;'>Project A: AI Bot<br>Project B: Web App</div>", t:450, l:50, w:700, h:300}
                 ]
            }
        ],
        "Invitations": [
            {
                n: "Floral Wedding", bg: "#fdfbf7",
                els: [
                    {html:"<div style='border:2px solid #d4af37; height:100%; width:100%;'></div>", t:20, l:20, w:754, h:1083},
                    {html:"<div style='font-size:80px; text-align:center;'>🌸 🌿 🌸</div>", t:50, l:200, w:400, h:120},
                    {html:"<h3 style='text-align:center; font-family:Lato; letter-spacing:3px; color:#777; text-transform:uppercase; font-size:14px;'>Save The Date</h3>", t:200, l:200, w:400, h:50},
                    {html:"<h1 style='text-align:center; font-family:\"Great Vibes\"; font-size:72px; color:#333; margin:0;'>Sarah & James</h1>", t:260, l:100, w:600, h:150},
                    {html:"<div style='text-align:center; font-family:\"Playfair Display\"; font-style:italic; font-size:20px; color:#555;'>Are getting married</div>", t:420, l:200, w:400, h:60},
                    {html:"<div style='text-align:center; font-family:Lato; font-size:18px; font-weight:bold; border-top:1px solid #d4af37; border-bottom:1px solid #d4af37; padding:15px 0; color:#333; width:100%;'>SATURDAY, JUNE 24TH, 2024</div>", t:500, l:150, w:500, h:80},
                    {html:"<div style='text-align:center; font-family:Lato; font-size:14px; line-height:1.6; color:#555;'>AT TWO O'CLOCK IN THE AFTERNOON<br>THE GRAND GARDEN ESTATE<br>NEW YORK, NY</div>", t:600, l:150, w:500, h:120},
                    {html:"<div style='font-size:80px; text-align:center; transform:scaleY(-1);'>🌸 🌿 🌸</div>", t:950, l:200, w:400, h:120}
                ]
            },
            {
                n: "Kids Birthday", bg: "#e0f7fa",
                els: [
                    {html:"<div style='background:#fff; border-radius:20px; border:5px dashed #ff4081; width:100%; height:100%;'></div>", t:20, l:20, w:754, h:1083},
                    {html:"<div style='font-size:100px; text-align:center;'>🎈 🎂 🦄</div>", t:50, l:150, w:500, h:150},
                    {html:"<h1 style='font-family:\"Bangers\"; color:#ff4081; font-size:60px; text-align:center; text-shadow:3px 3px 0 #fff, 5px 5px 0 #00bcd4;'>YOU'RE INVITED!</h1>", t:220, l:50, w:700, h:120},
                    {html:"<h2 style='font-family:\"Comic Neue\"; color:#3f51b5; text-align:center; font-weight:bold;'>To Emma's 5th Birthday!</h2>", t:350, l:100, w:600, h:80},
                    {html:"<div style='background:#ffeb3b; padding:20px; border-radius:15px; font-family:\"Comic Neue\"; font-size:20px; text-align:center; font-weight:bold; color:#d84315; transform:rotate(-2deg);'>Pizza, Games & Cake!</div>", t:450, l:200, w:400, h:120},
                    {html:"<div style='text-align:center; font-family:Arial; font-size:18px; line-height:2;'>📅 July 15th<br>⏰ 2:00 PM - 5:00 PM<br>📍 123 Fun Street</div>", t:600, l:200, w:400, h:180},
                    {html:"<div style='font-size:80px; position:absolute; bottom:0; left:0;'>🎁</div>", t:950, l:50, w:100, h:100},
                    {html:"<div style='font-size:80px; position:absolute; bottom:0; right:0;'>🎉</div>", t:950, l:640, w:100, h:100}
                ]
            },
            {
                n: "Elegant Gold", bg: "#1a1a1a",
                els: [
                    {html:"<div style='border:1px solid #d4af37; width:100%; height:100%;'></div>", t:15, l:15, w:764, h:1093},
                    {html:"<div style='border:1px solid #d4af37; width:100%; height:100%;'></div>", t:25, l:25, w:744, h:1073},
                    {html:"<h1 style='font-family:\"Cinzel\"; color:#d4af37; text-align:center; font-size:50px; letter-spacing:5px;'>GALA NIGHT</h1>", t:150, l:100, w:600, h:100},
                    {html:"<div style='width:100px; height:2px; background:#d4af37; margin:0 auto;'></div>", t:260, l:347, w:100, h:2},
                    {html:"<p style='color:#ccc; text-align:center; font-family:\"Lato\"; font-weight:300; letter-spacing:2px; font-size:14px;'>YOU ARE CORDIALLY INVITED TO THE</p>", t:300, l:100, w:600, h:60},
                    {html:"<h2 style='color:white; text-align:center; font-family:\"Playfair Display\"; font-style:italic;'>Annual Charity Ball</h2>", t:380, l:100, w:600, h:80},
                    {html:"<div style='color:#d4af37; text-align:center; font-family:\"Cinzel\"; border:1px solid #d4af37; padding:15px; width:100%;'>DECEMBER 31ST • 8:00 PM</div>", t:500, l:200, w:400, h:80},
                    {html:"<p style='color:#999; text-align:center; font-size:12px; margin-top:50px;'>BLACK TIE ATTIRE • RSVP BY DEC 20</p>", t:900, l:200, w:400, h:60}
                ]
            },
            {
                n: "Baby Shower", bg: "#e6e6fa",
                els: [
                     {html:"<div style='border:4px dotted white; border-radius:20px; height:100%; width:100%;'></div>", t:20, l:20, w:754, h:1083},
                     {html:"<div style='font-size:80px; text-align:center;'>🍼 🧸</div>", t:80, l:250, w:300, h:120},
                     {html:"<h1 style='font-family:\"Pacifico\"; color:#9370db; text-align:center; font-size:60px;'>It's a Boy!</h1>", t:200, l:100, w:600, h:100},
                     {html:"<h3 style='font-family:\"Quicksand\"; text-align:center; color:#555;'>Please join us for a Baby Shower honoring</h3>", t:320, l:100, w:600, h:60},
                     {html:"<h2 style='font-family:\"Dancing Script\"; text-align:center; font-size:48px; color:#483d8b;'>Jessica Brown</h2>", t:380, l:100, w:600, h:100},
                     {html:"<div style='background:white; padding:20px; border-radius:10px; text-align:center; color:#666;'>Sunday, April 10th @ 2PM<br>123 Bluebell Lane</div>", t:550, l:200, w:400, h:120}
                ]
            },
            {
                n: "Retirement Party", bg: "#fff",
                els: [
                     {html:"<div style='background:#222; height:300px; width:100%; clip-path:polygon(0 0, 100% 0, 100% 80%, 0 100%);'></div>", t:0, l:0, w:794, h:300},
                     {html:"<h1 style='color:white; font-family:\"Cinzel\"; font-size:60px; text-align:center;'>RETIREMENT</h1>", t:50, l:50, w:700, h:100},
                     {html:"<h2 style='color:#d4af37; text-align:center; font-family:sans-serif;'>CELEBRATION</h2>", t:150, l:50, w:700, h:60},
                     {html:"<h1 style='text-align:center; font-family:\"Playfair Display\"; font-size:50px;'>Robert Wilson</h1>", t:350, l:100, w:600, h:100},
                     {html:"<p style='text-align:center; font-style:italic; font-size:18px;'>Join us to celebrate 40 years of dedication.</p>", t:460, l:100, w:600, h:60},
                     {html:"<div style='border-top:1px solid #ccc; border-bottom:1px solid #ccc; padding:20px; text-align:center; font-weight:bold;'>Friday, Oct 5th • 6:00 PM • The Country Club</div>", t:600, l:100, w:600, h:80}
                ]
            },
            {
                n: "Graduation", bg: "#fff",
                els: [
                     {html:"<div style='border:2px solid black; padding:10px; height:100%; width:100%;'></div>", t:10, l:10, w:774, h:1103},
                     {html:"<h1 style='font-family:serif; text-align:center; font-size:60px;'>Class of 2024</h1>", t:100, l:100, w:600, h:100},
                     {html:"<div style='font-size:100px; text-align:center;'>🎓</div>", t:200, l:300, w:200, h:150},
                     {html:"<h2 style='text-align:center;'>You Did It!</h2>", t:350, l:200, w:400, h:60},
                     {html:"<p style='text-align:center; font-size:18px;'>Open House Celebration</p>", t:420, l:200, w:400, h:50}
                ]
            }
        ],
        "Flyers": [
            {
                n:"Lost Dog", bg:"#fff", 
                els: [
                    {html:"<h1 style='color:red; text-align:center; font-family:Impact; font-size:80px; margin:0; letter-spacing:5px;'>LOST DOG</h1>", t:50, l:50, w:700, h:120},
                    {html:"<div style='background:#eee; width:100%; height:100%; display:flex; align-items:center; justify-content:center; border:5px solid #333;'><i class='fas fa-dog' style='font-size:150px; color:#aaa;'></i></div>", t:180, l:100, w:600, h:400},
                    {html:"<h2 style='text-align:center; font-family:Arial; font-size:40px; background:yellow; padding:10px;'>REWARD $500</h2>", t:620, l:100, w:600, h:100},
                    {html:"<p style='text-align:center; font-size:24px; font-family:Arial;'>Please help us find 'Buster'. Last seen at the park. Very friendly. Wearing a blue collar.</p>", t:740, l:100, w:600, h:150},
                    {html:"<div style='border:5px dashed red; padding:20px; text-align:center; font-weight:bold; font-size:40px; font-family:Impact;'>CALL 555-0199</div>", t:920, l:100, w:600, h:120}
                ]
            },
            {
                n:"Concert Gig", bg:"#111", 
                els: [
                    {html:"<h1 style='color:#0ff; text-align:center; font-family:\"Monoton\"; font-size:80px; text-shadow:4px 4px #f0f; margin:0;'>LIVE</h1>", t:100, l:50, w:700, h:120},
                    {html:"<h2 style='color:white; text-align:center; font-family:\"Rock Salt\"; font-size:40px; transform:rotate(-5deg); text-shadow:2px 2px black;'>THE ROCKERS</h2>", t:240, l:100, w:600, h:100},
                    {html:"<div style='background:rgba(255,0,255,0.8); color:white; padding:20px; text-align:center; font-family:Impact; font-size:24px; transform:rotate(2deg);'>SATURDAY NIGHT<br>JULY 24TH</div>", t:800, l:450, w:300, h:140},
                    {html:"<div style='color:#0ff; font-family:Courier; font-weight:bold; text-align:center; font-size:24px;'>DOORS OPEN 8PM • $15 ENTRY</div>", t:1000, l:100, w:600, h:60}
                ]
            },
            {
                n:"Real Estate", bg:"#fff",
                els: [
                    {html:"<div style='background:#003366; width:100%; height:100%; clip-path:polygon(0 0, 100% 0, 100% 80%, 0 100%);'></div>", t:0, l:0, w:794, h:600},
                    {html:"<img src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80' style='width:100%; height:100%; object-fit:cover; border:5px solid white; box-shadow:0 10px 20px rgba(0,0,0,0.3);'>", t:120, l:100, w:600, h:350},
                    {html:"<h1 style='color:white; font-family:\"Lato\"; font-weight:900; font-size:48px; text-shadow:2px 2px 5px rgba(0,0,0,0.5);'>JUST LISTED</h1>", t:40, l:50, w:400, h:80},
                    {html:"<h2 style='color:#003366; font-family:\"Playfair Display\"; font-size:36px; margin:0;'>Modern Family Home</h2>", t:620, l:100, w:600, h:60},
                    {html:"<p style='font-family:Arial; color:#555; font-size:16px;'>3 Bed • 2 Bath • 2 Car Garage</p>", t:680, l:100, w:600, h:40},
                    {html:"<div style='display:flex; justify-content:space-around;'><img src='https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=200&q=80' style='width:180px; height:120px; object-fit:cover;'><img src='https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=200&q=80' style='width:180px; height:120px; object-fit:cover;'><img src='https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=200&q=80' style='width:180px; height:120px; object-fit:cover;'></div>", t:740, l:50, w:700, h:150},
                    {html:"<div style='background:#d4af37; color:white; font-weight:bold; font-size:24px; padding:10px 30px;'>$850,000</div>", t:950, l:100, w:200, h:60},
                    {html:"<div style='text-align:right; font-family:Arial; color:#333;'><b>Call Agent Name</b><br>555-888-999</div>", t:950, l:450, w:250, h:80}
                ]
            },
            {
                n: "Grand Opening", bg: "#fff",
                els: [
                     {html:"<div style='background:#ff4081; width:100%; height:100%;'></div>", t:0, l:0, w:794, h:400},
                     {html:"<h1 style='color:white; font-size:80px; font-family:\"Bebas Neue\"; text-align:center;'>GRAND<br>OPENING</h1>", t:50, l:50, w:700, h:250},
                     {html:"<div style='width:600px; height:400px; background:#eee; margin:0 auto; border:10px solid white; overflow:hidden;'><img src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80' style='width:100%; height:100%; object-fit:cover;'></div>", t:350, l:100, w:600, h:400},
                     {html:"<h2 style='text-align:center; color:#333;'>WE ARE NOW OPEN!</h2>", t:780, l:100, w:600, h:60},
                     {html:"<p style='text-align:center; font-size:20px; color:#555;'>Come visit our new store and get 20% off everything!</p>", t:850, l:100, w:600, h:80},
                     {html:"<div style='background:#333; color:white; padding:10px; text-align:center; font-weight:bold;'>123 Main Street • Open 9am-9pm</div>", t:1000, l:100, w:600, h:60}
                ]
            },
            {
                n: "Garage Sale", bg: "#ffeb3b",
                els: [
                     {html:"<div style='border:10px solid black; width:100%; height:100%;'></div>", t:20, l:20, w:754, h:1083},
                     {html:"<h1 style='font-family:Impact; font-size:100px; text-align:center; line-height:0.9;'>GARAGE<br>SALE</h1>", t:80, l:50, w:700, h:200},
                     {html:"<div style='background:red; color:white; font-size:30px; font-weight:bold; padding:20px; text-align:center; transform:rotate(-5deg);'>EVERYTHING MUST GO!</div>", t:300, l:100, w:600, h:100},
                     {html:"<ul style='font-size:30px; font-family:sans-serif;'><li>Furniture</li><li>Clothes</li><li>Tools</li><li>Toys</li></ul>", t:450, l:250, w:300, h:250},
                     {html:"<h2 style='text-align:center; font-size:40px;'>THIS SATURDAY!</h2>", t:750, l:100, w:600, h:60},
                     {html:"<div style='text-align:center; font-size:24px;'>7AM - 1PM • 45 Maple Avenue</div>", t:820, l:100, w:600, h:80}
                ]
            },
            {
                n: "Car Wash", bg: "#0288d1",
                els: [
                     {html:"<div style='border:5px dashed white; width:100%; height:100%; border-radius:20px;'></div>", t:20, l:20, w:754, h:1083},
                     {html:"<h1 style='color:white; text-align:center; font-family:\"Luckiest Guy\", cursive; font-size:80px; text-shadow:4px 4px 0 #005b9f;'>CAR WASH</h1>", t:50, l:50, w:700, h:120},
                     {html:"<div style='font-size:150px; text-align:center;'>🚗 💦</div>", t:200, l:200, w:400, h:200},
                     {html:"<div style='background:yellow; color:red; font-weight:bold; font-size:40px; text-align:center; transform:rotate(5deg); padding:10px; border:3px solid red;'>ONLY $10</div>", t:450, l:450, w:250, h:100},
                     {html:"<h2 style='color:white; text-align:center;'>Support the High School Band</h2>", t:600, l:100, w:600, h:60},
                     {html:"<p style='color:white; text-align:center; font-size:24px;'>Saturday Morning<br>School Parking Lot</p>", t:680, l:100, w:600, h:100}
                ]
            }
        ],
        "Magazines": [
            {
                n:"Fashion Cover", bg:"#fff",
                els: [
                    {html:"<img src='https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80' style='width:100%; height:100%; object-fit:cover;'>", t:0, l:0, w:794, h:1123},
                    {html:"<h1 style='color:white; font-family:\"Didot\", serif; font-size:120px; text-align:center; letter-spacing:-5px; line-height:1; mix-blend-mode:overlay;'>VOGUE</h1>", t:20, l:0, w:794, h:160},
                    {html:"<div style='color:white; font-family:\"Lato\"; font-weight:bold; font-size:32px; text-shadow:2px 2px 5px rgba(0,0,0,0.5);'>SUMMER<br>STYLES</div>", t:300, l:50, w:300, h:120},
                    {html:"<div style='color:#ffff00; font-family:\"Lato\"; font-weight:bold; font-size:24px; text-shadow:1px 1px 2px rgba(0,0,0,0.8);'>100+<br>LOOKS</div>", t:450, l:50, w:200, h:100},
                    {html:"<div style='color:white; font-family:\"Lato\"; text-align:right; font-size:28px; text-shadow:2px 2px 5px rgba(0,0,0,0.5);'>THE<br>ICONS<br>ISSUE</div>", t:800, l:500, w:250, h:180},
                    {html:"<div style='background:white; height:40px; width:150px; display:flex; align-items:center; justify-content:center; font-family:monospace; letter-spacing:3px;'>BARCODE</div>", t:1050, l:50, w:150, h:50}
                ]
            },
            {
                n:"Tech Monthly", bg:"#000",
                els: [
                    {html:"<img src='https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80' style='width:100%; height:100%; object-fit:cover; opacity:0.8;'>", t:0, l:0, w:794, h:1123},
                    {html:"<h1 style='color:white; font-family:\"Orbitron\"; font-size:90px; text-align:center; letter-spacing:10px; border-top:2px solid #00ff00; border-bottom:2px solid #00ff00;'>WIRED</h1>", t:30, l:50, w:700, h:140},
                    {html:"<div style='color:#00ff00; font-family:\"Roboto Mono\"; font-size:30px; background:black; display:inline-block; padding:5px;'>FUTURE OF AI</div>", t:250, l:50, w:350, h:60},
                    {html:"<p style='color:white; font-family:Arial; font-size:18px; text-shadow:1px 1px 2px black;'>Are robots taking over?<br>Exclusive interview inside.</p>", t:320, l:50, w:300, h:100},
                    {html:"<div style='color:cyan; font-family:\"Roboto Mono\"; font-size:30px; text-align:right;'>CYBER<br>SECURITY</div>", t:700, l:500, w:250, h:100}
                ]
            },
            {
                n:"Foodie", bg:"#fff",
                els: [
                     {html:"<img src='https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80' style='width:100%; height:100%; object-fit:cover;'>", t:0, l:0, w:794, h:1123},
                     {html:"<h1 style='color:#fff; font-family:\"Lobster\"; font-size:100px; text-align:center; text-shadow:2px 2px 10px rgba(0,0,0,0.5);'>Delicious</h1>", t:20, l:50, w:700, h:150},
                     {html:"<div style='background:rgba(255,255,255,0.9); padding:20px; border-radius:50%; width:150px; height:150px; display:flex; align-items:center; justify-content:center; text-align:center; color:#e65100; font-weight:bold; transform:rotate(-10deg); box-shadow:0 5px 15px rgba(0,0,0,0.2);'>BEST<br>RECIPES<br>2024</div>", t:200, l:50, w:150, h:150},
                     {html:"<h2 style='color:white; text-shadow:2px 2px 4px black; text-align:center;'>Comfort Food Classics</h2>", t:900, l:100, w:600, h:60},
                     {html:"<div style='color:white; text-align:center; font-size:24px; font-weight:bold; text-shadow:1px 1px 2px black;'>Quick & Easy Dinners • Dessert Special</div>", t:970, l:50, w:700, h:60}
                ]
            },
            {
                n:"Nature", bg:"#2e7d32",
                els: [
                    {html:"<img src='https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=800&q=80' style='width:100%; height:100%; object-fit:cover; opacity:0.8;'>", t:0, l:0, w:794, h:1123},
                    {html:"<h1 style='color:white; font-family:serif; text-align:center; font-size:100px;'>WILD</h1>", t:50, l:50, w:700, h:120},
                    {html:"<h3 style='color:white; text-align:center; letter-spacing:10px;'>PHOTOGRAPHY</h3>", t:160, l:50, w:700, h:60},
                    {html:"<div style='position:absolute; bottom:50px; right:50px; color:white; text-align:right;'><h2>ISSUE 24</h2><p>The Great Outdoors</p></div>", t:900, l:400, w:350, h:150}
                ]
            }
        ],
        "Brochures": [
            {
                n:"Tri-Fold Layout", bg:"#fff", 
                els: [
                    {html:"<div style='border-right:1px dashed #ccc; height:100%; width:100%; display:flex; justify-content:center; padding-top:20px; color:#999; font-size:10px;'>Inside Flap</div>", t:0, l:0, w:264, h:1123},
                    {html:"<div style='border-right:1px dashed #ccc; height:100%; width:100%; display:flex; justify-content:center; padding-top:20px; color:#999; font-size:10px;'>Back Cover</div>", t:0, l:264, w:264, h:1123},
                    {html:"<div style='height:100%; width:100%; display:flex; justify-content:center; padding-top:20px; color:#999; font-size:10px;'>Front Cover</div>", t:0, l:528, w:264, h:1123},
                    // Front Cover
                    {html:"<img src='https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80' style='width:100%; height:100%; object-fit:cover;'>", t:100, l:540, w:240, h:300},
                    {html:"<h1 style='color:#333; font-family:Helvetica; font-weight:bold; font-size:32px; text-align:center;'>MODERN<br>LIVING</h1>", t:420, l:540, w:240, h:120},
                    {html:"<p style='text-align:center; color:#777; font-family:Arial; font-size:14px;'>Interior Design Solutions</p>", t:550, l:540, w:240, h:50},
                    // Back Cover
                    {html:"<h3 style='text-align:center; color:#333; font-family:Helvetica;'>Contact Us</h3><p style='text-align:center; font-size:12px; color:#555;'>123 Main St, City<br>www.example.com<br>555-1234</p>", t:800, l:276, w:240, h:160},
                    // Inside Flap
                    {html:"<h3 style='color:var(--ui-theme-color); font-family:Helvetica; border-bottom:2px solid var(--ui-theme-color);'>Our Services</h3><ul style='font-size:12px; font-family:Arial; color:#444; padding-left:20px;'><li>Space Planning</li><li>Color Consultation</li><li>Furniture Selection</li></ul>", t:200, l:12, w:240, h:200}
                ]
            },
            {
                n:"Travel Brochure", bg:"#e0f2f1",
                els: [
                    {html:"<div style='border-right:1px dashed #999; height:100%; width:100%;'></div>", t:0, l:0, w:264, h:1123},
                    {html:"<div style='border-right:1px dashed #999; height:100%; width:100%;'></div>", t:0, l:264, w:264, h:1123},
                    // Cover
                    {html:"<img src='https://images.unsplash.com/photo-1502003153089-649eb051d819?auto=format&fit=crop&w=400&q=80' style='width:100%; height:100%; object-fit:cover; clip-path:polygon(0 0, 100% 0, 100% 85%, 0 100%);'>", t:0, l:528, w:266, h:500},
                    {html:"<h1 style='color:#00695c; font-family:\"Pacifico\"; font-size:40px; text-align:center;'>Visit<br>Paradise</h1>", t:520, l:540, w:240, h:140},
                    {html:"<div style='background:#00695c; color:white; padding:10px; text-align:center; font-family:Arial; border-radius:5px;'>Book Now 50% Off</div>", t:700, l:560, w:200, h:60},
                    // Middle
                    {html:"<img src='https://images.unsplash.com/photo-1537551080512-fb7dd14fbf90?auto=format&fit=crop&w=400&q=80' style='width:100%; height:100%; object-fit:cover; border-radius:10px;'>", t:100, l:280, w:230, h:160},
                    {html:"<h4 style='color:#00695c; font-family:Arial;'>Luxury Hotels</h4><p style='font-size:11px; font-family:Arial;'>Experience world class comfort.</p>", t:270, l:280, w:230, h:100}
                ]
            },
            {
                n:"Bi-Fold Medical", bg:"#fff",
                els: [
                    {html:"<div style='border-right:1px solid #ccc; height:100%; width:100%;'></div>", t:0, l:396, w:2, h:1123},
                    {html:"<div style='background:#2196f3; height:100%; width:40px; position:absolute; right:0;'></div>", t:0, l:754, w:40, h:1123},
                    {html:"<img src='https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80' style='width:100%; height:300px; object-fit:cover;'>", t:100, l:420, w:330, h:300},
                    {html:"<h1 style='color:#1565c0; font-family:sans-serif;'>HEALTH FIRST<br>CLINIC</h1>", t:420, l:420, w:300, h:120},
                    {html:"<p style='color:#555;'>Caring for you and your family.</p>", t:550, l:420, w:300, h:50},
                    {html:"<h3 style='color:#1565c0;'>Services</h3><ul><li>Checkups</li><li>Dental</li><li>Cardiology</li></ul>", t:100, l:50, w:300, h:200}
                ]
            },
            {
                n: "Corporate", bg: "#e8eaf6",
                els: [
                    {html:"<div style='border-right:1px solid #ccc; height:100%; width:100%;'></div>", t:0, l:264, w:2, h:1123},
                    {html:"<div style='border-right:1px solid #ccc; height:100%; width:100%;'></div>", t:0, l:528, w:2, h:1123},
                    {html:"<div style='background:#3f51b5; height:200px; width:100%; position:absolute; top:0;'></div>", t:0, l:0, w:794, h:200},
                    {html:"<h2 style='color:white; position:absolute; top:50px; left:550px;'>Annual Report</h2>", t:0, l:0, w:794, h:200},
                    {html:"<div style='position:absolute; bottom:50px; left:550px;'><h3 style='color:#3f51b5;'>Contact</h3><p>info@company.com</p></div>", t:0, l:0, w:794, h:1123}
                ]
            }
        ],
        "Certificates": [
            {
                n:"Classic Award", bg:"#fffaf0", 
                els: [
                    {html:"<div style='border:20px solid #d4af37; height:100%; width:100%;'></div>", t:0, l:0, w:794, h:1123},
                    {html:"<div style='border:2px solid #d4af37; height:calc(100% - 10px); width:calc(100% - 10px); position:absolute; top:5px; left:5px;'></div>", t:0, l:0, w:794, h:1123},
                    {html:"<h1 style='font-family:\"Cinzel\", serif; font-size:60px; text-align:center; color:#b8860b; margin-bottom:0;'>Certificate</h1>", t:150, l:100, w:600, h:100},
                    {html:"<h3 style='font-family:sans-serif; text-align:center; font-size:18px; letter-spacing:5px; margin-top:0;'>OF APPRECIATION</h3>", t:230, l:200, w:400, h:50},
                    {html:"<p style='text-align:center; font-style:italic; font-family:\"Playfair Display\"; font-size:20px;'>This is proudly presented to</p>", t:320, l:200, w:400, h:50},
                    {html:"<h2 style='text-align:center; font-family:\"Great Vibes\"; font-size:80px; color:#333; margin:0;'>Recipient Name</h2>", t:380, l:100, w:600, h:140},
                    {html:"<div style='width:400px; height:1px; background:#b8860b; margin:0 auto;'></div>", t:500, l:200, w:400, h:2},
                    {html:"<p style='text-align:center; font-family:\"Lato\"; color:#555;'>For outstanding performance and lasting contribution to the team.</p>", t:540, l:150, w:500, h:80},
                    {html:"<div style='border-top:1px solid black; width:200px; text-align:center; padding-top:5px; font-family:Arial;'>Date</div>", t:850, l:100, w:200, h:60},
                    {html:"<div style='border-top:1px solid black; width:200px; text-align:center; padding-top:5px; font-family:Arial;'>Signature</div>", t:850, l:500, w:200, h:60},
                    {html:"<div style='width:120px; height:120px; border-radius:50%; background:linear-gradient(45deg, #ffd700, #b8860b); display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-family:\"Cinzel\"; border:4px double white; box-shadow:0 5px 10px rgba(0,0,0,0.3);'>GOLD<br>SEAL</div>", t:750, l:340, w:120, h:120}
                ]
            },
            {
                n:"Diploma", bg:"#fff",
                els: [
                    {html:"<div style='background:url(https://www.transparenttextures.com/patterns/cream-paper.png); width:100%; height:100%; opacity:0.5;'></div>", t:0, l:0, w:794, h:1123},
                     {html:"<div style='border:10px double #333; height:100%; width:100%; box-sizing:border-box;'></div>", t:20, l:20, w:754, h:1083},
                     {html:"<div style='font-size:100px; text-align:center; color:#333;'>🏛️</div>", t:80, l:350, w:100, h:120},
                     {html:"<h1 style='font-family:\"Old Standard TT\"; font-size:48px; text-align:center; text-transform:uppercase;'>University of Excellence</h1>", t:200, l:50, w:700, h:100},
                     {html:"<p style='text-align:center; font-family:\"Old Standard TT\"; font-size:18px;'>Upon the recommendation of the faculty, hereby confers upon</p>", t:320, l:100, w:600, h:80},
                     {html:"<h2 style='text-align:center; font-family:\"Pinyon Script\", cursive; font-size:50px; font-style:italic; border-bottom:1px solid #ccc;'>Student Name</h2>", t:400, l:100, w:600, h:100},
                     {html:"<p style='text-align:center; font-family:\"Old Standard TT\"; font-size:18px;'>the degree of</p>", t:520, l:200, w:400, h:50},
                     {html:"<h2 style='text-align:center; font-family:\"Old Standard TT\"; font-size:32px; font-weight:bold;'>Bachelor of Arts</h2>", t:570, l:100, w:600, h:80}
                ]
            },
            {
                n:"Gift Certificate", bg:"#f3e5f5",
                els: [
                     {html:"<div style='border:2px dashed #9c27b0; height:100%; width:100%;'></div>", t:10, l:10, w:774, h:300},
                     {html:"<h1 style='color:#9c27b0; font-family:serif; font-style:italic;'>Gift Certificate</h1>", t:50, l:50, w:400, h:60},
                     {html:"<div style='font-size:40px; font-weight:bold; color:#333;'>$50.00</div>", t:50, l:600, w:150, h:60},
                     {html:"<div style='border-bottom:1px solid #333; margin-top:20px;'>To:</div><br><div style='border-bottom:1px solid #333; margin-top:20px;'>From:</div>", t:120, l:50, w:600, h:120},
                     {html:"<div style='background:#9c27b0; color:white; padding:5px; text-align:center;'>Valid at all store locations</div>", t:250, l:50, w:300, h:40}
                ]
            },
            {
                n:"Employee of Month", bg:"#e3f2fd",
                els: [
                    {html:"<div style='border:10px solid #1976d2; height:100%; width:100%;'></div>", t:0, l:0, w:794, h:1123},
                    {html:"<h1 style='text-align:center; color:#0d47a1; font-family:Arial; font-weight:900;'>EMPLOYEE<br>OF THE MONTH</h1>", t:100, l:100, w:600, h:150},
                    {html:"<div style='width:200px; height:200px; background:#ddd; border:5px solid #1976d2; margin:0 auto;'></div>", t:300, l:300, w:200, h:200},
                    {html:"<h2 style='text-align:center; color:#1976d2; border-bottom:2px solid #1976d2;'>JOHN SMITH</h2>", t:550, l:200, w:400, h:60},
                    {html:"<p style='text-align:center;'>In recognition of your hard work and dedication.</p>", t:650, l:200, w:400, h:80}
                ]
            }
        ],
        "Menus": [
            {
                n:"Chalkboard Menu", bg:"#333",
                els: [
                    {html:"<div style='border:5px solid #8B4513; width:100%; height:100%;'></div>", t:10, l:10, w:774, h:1103},
                    {html:"<h1 style='color:white; font-family:\"Patrick Hand\", cursive; text-align:center; font-size:60px; border-bottom:2px dashed #777; padding-bottom:10px;'>THE BURGER JOINT</h1>", t:50, l:50, w:700, h:120},
                    {html:"<h2 style='color:#ffcc00; font-family:\"Patrick Hand\"; font-size:30px;'>BURGERS</h2>", t:180, l:50, w:300, h:60},
                    {html:"<div style='color:white; font-family:\"Patrick Hand\"; font-size:20px;'><div style='display:flex; justify-content:space-between;'><span>Classic Beef</span><span>$12</span></div><p style='font-size:14px; color:#aaa; margin-top:0;'>Lettuce, tomato, cheese, secret sauce</p></div>", t:230, l:50, w:300, h:100},
                    {html:"<div style='color:white; font-family:\"Patrick Hand\"; font-size:20px;'><div style='display:flex; justify-content:space-between;'><span>Bacon Deluxe</span><span>$15</span></div><p style='font-size:14px; color:#aaa; margin-top:0;'>Double bacon, bbq sauce, onion rings</p></div>", t:330, l:50, w:300, h:100},
                    {html:"<h2 style='color:#ffcc00; font-family:\"Patrick Hand\"; font-size:30px;'>DRINKS</h2>", t:460, l:50, w:300, h:60},
                    {html:"<div style='color:white; font-family:\"Patrick Hand\"; font-size:20px;'><div style='display:flex; justify-content:space-between;'><span>Craft Beer</span><span>$8</span></div><div style='display:flex; justify-content:space-between;'><span>Milkshakes</span><span>$6</span></div></div>", t:510, l:50, w:300, h:120},
                    {html:"<img src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' style='width:100%; height:100%; object-fit:cover; border:5px solid white; transform:rotate(5deg);'>", t:200, l:400, w:300, h:300}
                ]
            },
            {
                n:"Fine Dining", bg:"#fff",
                els: [
                    {html:"<div style='border:1px solid #000; height:95%; width:95%; position:absolute; top:2.5%; left:2.5%;'></div>", t:0, l:0, w:794, h:1123},
                    {html:"<h1 style='font-family:\"Playfair Display\"; text-align:center; letter-spacing:5px; font-size:40px; margin-top:40px;'>LE GOURMET</h1>", t:50, l:200, w:400, h:100},
                    {html:"<div style='text-align:center; font-style:italic; font-family:serif; color:#777;'>Menu de Saison</div>", t:120, l:300, w:200, h:40},
                    {html:"<h3 style='text-align:center; font-family:\"Lato\"; letter-spacing:3px; font-size:16px; margin-top:50px;'>APPETIZERS</h3>", t:200, l:200, w:400, h:50},
                    {html:"<div style='text-align:center; font-family:serif; font-size:18px;'><b>French Onion Soup</b> . . . . $12</div><div style='text-align:center; font-size:12px; color:#555; font-style:italic;'>Gruyere crouton</div>", t:260, l:200, w:400, h:80},
                    {html:"<div style='text-align:center; font-family:serif; font-size:18px;'><b>Escargot</b> . . . . $16</div><div style='text-align:center; font-size:12px; color:#555; font-style:italic;'>Garlic herb butter</div>", t:340, l:200, w:400, h:80},
                    {html:"<h3 style='text-align:center; font-family:\"Lato\"; letter-spacing:3px; font-size:16px; margin-top:30px;'>MAIN COURSES</h3>", t:450, l:200, w:400, h:50},
                    {html:"<div style='text-align:center; font-family:serif; font-size:18px;'><b>Duck Confit</b> . . . . $32</div><div style='text-align:center; font-size:12px; color:#555; font-style:italic;'>Roasted potatoes, orange glaze</div>", t:510, l:200, w:400, h:80},
                     {html:"<div style='font-size:30px; text-align:center;'>❦</div>", t:700, l:370, w:50, h:60}
                ]
            },
            {
                n:"Coffee Shop", bg:"#d7ccc8",
                els: [
                    {html:"<h1 style='font-family:\"Courier New\"; text-align:center; font-size:50px; color:#3e2723;'>Morning Brew</h1>", t:50, l:100, w:600, h:80},
                    {html:"<div style='border-top:2px solid #3e2723; width:100%;'></div>", t:120, l:100, w:600, h:10},
                    {html:"<h2 style='color:#5d4037;'>Espresso</h2><p>Latte ... $4<br>Cappuccino ... $4<br>Mocha ... $5</p>", t:150, l:100, w:300, h:150},
                    {html:"<h2 style='color:#5d4037;'>Bakery</h2><p>Croissant ... $3<br>Muffin ... $3<br>Bagel ... $2</p>", t:150, l:450, w:300, h:150},
                    {html:"<img src='https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80' style='width:100%; height:100%; object-fit:cover; border-radius:50%;'>", t:400, l:250, w:300, h:300}
                ]
            },
            {
                n:"Cocktail Bar", bg:"#263238",
                els: [
                    {html:"<div style='border:2px solid #ffcc80; height:100%; width:100%;'></div>", t:20, l:20, w:754, h:1083},
                    {html:"<h1 style='color:#ffcc80; font-family:\"Righteous\"; text-align:center; font-size:60px; letter-spacing:5px;'>THE LOUNGE</h1>", t:80, l:50, w:700, h:100},
                    {html:"<h3 style='color:white; text-align:center; border-bottom:1px solid #555;'>SIGNATURE COCKTAILS</h3>", t:200, l:150, w:500, h:50},
                    {html:"<b style='color:#ffcc80; font-size:20px;'>Old Fashioned</b><span style='float:right; color:white;'>$14</span><br><i style='color:#ccc; font-size:14px;'>Bourbon, bitters, sugar</i>", t:270, l:150, w:500, h:80},
                    {html:"<b style='color:#ffcc80; font-size:20px;'>Martini</b><span style='float:right; color:white;'>$15</span><br><i style='color:#ccc; font-size:14px;'>Gin, vermouth, olive</i>", t:360, l:150, w:500, h:80},
                    {html:"<div style='text-align:center; color:#777; margin-top:50px;'>Happy Hour 5-7PM</div>", t:800, l:200, w:400, h:40}
                ]
            }
        ],
        "Calendars": [
            {
                n:"Monthly Planner", bg:"#fff",
                els: [
                     {html:"<div style='background:#ff6b6b; height:150px; width:100%; display:flex; align-items:center; justify-content:center; color:white; font-family:sans-serif; font-size:60px; font-weight:bold;'>JANUARY</div>", t:0, l:0, w:794, h:150},
                     {html:"<table style='width:100%; height:100%; text-align:left; font-family:Arial; border:1px solid #ccc;'><tr style='background:#eee; font-weight:bold; text-align:center;'><td style='height:30px;'>SUN</td><td>MON</td><td>TUE</td><td>WED</td><td>THU</td><td>FRI</td><td>SAT</td></tr><tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr><tr><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td><td>14</td></tr><tr><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td><td>20</td><td>21</td></tr><tr><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td><td>27</td><td>28</td></tr><tr><td>29</td><td>30</td><td>31</td><td></td><td></td><td></td><td></td></tr></table>", t:180, l:20, w:754, h:600},
                     {html:"<h3 style='font-family:sans-serif; color:#ff6b6b;'>Notes</h3><div style='border-bottom:1px solid #ccc; height:30px;'></div><div style='border-bottom:1px solid #ccc; height:30px;'></div><div style='border-bottom:1px solid #ccc; height:30px;'></div>", t:820, l:20, w:754, h:200}
                ]
            },
            {
                n:"Weekly Schedule", bg:"#e8f5e9",
                els: [
                    {html:"<h1 style='text-align:center; color:#2e7d32;'>Weekly Schedule</h1>", t:30, l:100, w:600, h:60},
                    {html:"<div style='background:white; border:1px solid #ccc; padding:10px;'><b style='color:#2e7d32;'>Monday</b><br><br><br></div>", t:100, l:50, w:200, h:150},
                    {html:"<div style='background:white; border:1px solid #ccc; padding:10px;'><b style='color:#2e7d32;'>Tuesday</b><br><br><br></div>", t:100, l:280, w:200, h:150},
                    {html:"<div style='background:white; border:1px solid #ccc; padding:10px;'><b style='color:#2e7d32;'>Wednesday</b><br><br><br></div>", t:100, l:510, w:200, h:150},
                    {html:"<div style='background:white; border:1px solid #ccc; padding:10px;'><b style='color:#2e7d32;'>Thursday</b><br><br><br></div>", t:300, l:50, w:200, h:150},
                    {html:"<div style='background:white; border:1px solid #ccc; padding:10px;'><b style='color:#2e7d32;'>Friday</b><br><br><br></div>", t:300, l:280, w:200, h:150},
                    {html:"<div style='background:white; border:1px solid #ccc; padding:10px;'><b style='color:#2e7d32;'>Weekend</b><br><br><br></div>", t:300, l:510, w:200, h:150}
                ]
            },
            {
                n:"Yearly View", bg:"#fff",
                els: [
                     {html:"<h1 style='text-align:center;'>2024</h1>", t:20, l:100, w:600, h:80},
                     // Simulated small months
                     {html:"<div style='font-size:10px; border:1px solid #ccc;'>JAN<br>1 2 3...</div>", t:120, l:50, w:150, h:120},
                     {html:"<div style='font-size:10px; border:1px solid #ccc;'>FEB<br>1 2 3...</div>", t:120, l:220, w:150, h:120},
                     {html:"<div style='font-size:10px; border:1px solid #ccc;'>MAR<br>1 2 3...</div>", t:120, l:390, w:150, h:120},
                     {html:"<div style='font-size:10px; border:1px solid #ccc;'>APR<br>1 2 3...</div>", t:120, l:560, w:150, h:120},
                     // Row 2
                     {html:"<div style='font-size:10px; border:1px solid #ccc;'>MAY<br>1 2 3...</div>", t:260, l:50, w:150, h:120},
                     {html:"<div style='font-size:10px; border:1px solid #ccc;'>JUN<br>1 2 3...</div>", t:260, l:220, w:150, h:120},
                     {html:"<div style='font-size:10px; border:1px solid #ccc;'>JUL<br>1 2 3...</div>", t:260, l:390, w:150, h:120},
                     {html:"<div style='font-size:10px; border:1px solid #ccc;'>AUG<br>1 2 3...</div>", t:260, l:560, w:150, h:120}
                ]
            }
        ],
        "Letterheads": [
            {
                n: "Modern Geo", bg:"#fff",
                els: [
                    {html:"<div style='background:linear-gradient(135deg, #00c6ff 0%, #0072ff 100%); width:100%; height:100%; clip-path:polygon(0 0, 100% 0, 100% 15%, 0 35%);'></div>", t:0, l:0, w:794, h:300},
                    {html:"<div style='background:linear-gradient(135deg, #00c6ff 0%, #0072ff 100%); width:100%; height:100%; clip-path:polygon(100% 100%, 0 100%, 0 85%, 100% 65%);'></div>", t:900, l:0, w:794, h:223},
                    {html:"<h1 style='color:white; font-family:sans-serif; margin:0;'>COMPANY NAME</h1>", t:30, l:40, w:400, h:60},
                    {html:"<div style='color:white; font-family:sans-serif; font-size:12px;'>123 Business Rd, Tech City</div>", t:90, l:40, w:300, h:40},
                    {html:"<div style='color:white; font-family:sans-serif; font-size:12px; text-align:right;'>www.company.com<br>info@company.com</div>", t:1000, l:500, w:250, h:60},
                    {html:"<div style='font-family:serif; font-size:12px; color:#333; line-height:2;'>Dear [Name],<br><br>Start typing your letter here...</div>", t:250, l:50, w:694, h:500}
                ]
            },
            {
                n: "Minimal Black", bg:"#fff",
                els: [
                    {html:"<div style='border-bottom:2px solid black;'></div>", t:100, l:50, w:694, h:2},
                    {html:"<h1 style='font-family:\"Helvetica\"; letter-spacing:2px; font-weight:bold;'>JOHN DOE</h1>", t:50, l:50, w:400, h:50},
                    {html:"<div style='text-align:right; font-size:12px; color:#555;'>123 Street Name<br>City, State, Zip<br>555-123-4567</div>", t:50, l:450, w:294, h:50},
                    {html:"<div style='font-family:sans-serif; font-size:12px; color:#333; line-height:1.6;'>To Whom It May Concern,<br><br>Body of the letter goes here...</div>", t:150, l:50, w:694, h:500}
                ]
            },
            {
                n: "Corporate Red", bg:"#fff",
                els: [
                    {html:"<div style='background:#d32f2f; height:100%; width:10px; position:absolute; left:0;'></div>", t:0, l:0, w:10, h:1123},
                    {html:"<h1 style='color:#d32f2f; font-family:sans-serif;'>Global Solutions</h1>", t:50, l:40, w:400, h:60},
                    {html:"<p style='color:#777; font-size:12px;'>Innovating for the future.</p>", t:110, l:40, w:300, h:30},
                    {html:"<div style='text-align:right; color:#d32f2f; font-weight:bold;'>CONFIDENTIAL</div>", t:50, l:500, w:250, h:30}
                ]
            },
            {
                n: "Legal", bg:"#fff",
                els: [
                    {html:"<div style='border-left:1px solid #ccc; height:100%; position:absolute; left:100px;'></div>", t:0, l:0, w:100, h:1123},
                    {html:"<h1 style='text-align:center; font-family:serif; text-transform:uppercase; font-size:24px; text-decoration:underline;'>Legal Document</h1>", t:50, l:100, w:600, h:50},
                    {html:"<p style='font-family:serif; line-height:2;'>1. This agreement is made between...</p>", t:150, l:120, w:600, h:500}
                ]
            }
        ],
        "Newsletters": [
            {
                n:"Classic 2-Col", bg:"#fff", 
                els: [
                    {html:"<h1 style='border-bottom:3px double black; font-size:40px; text-transform:uppercase; font-family:serif;'>The Daily News</h1>", t:40, l:40, w:714, h:100},
                    {html:"<h3 style='font-family:sans-serif; background:#eee; padding:5px;'>Top Story: Big Event Happens</h3>", t:150, l:40, w:340, h:50},
                    {html:"<p style='font-size:12px; text-align:justify;'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>", t:210, l:40, w:340, h:200},
                    {html:"<img src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80' style='width:100%; height:100px; object-fit:cover;'>", t:150, l:414, w:340, h:100},
                    {html:"<h3 style='font-family:sans-serif;'>Community Updates</h3><p style='font-size:12px;'>Upcoming events at the town hall.</p>", t:260, l:414, w:340, h:100}
                ]
            },
            {
                 n:"School Update", bg:"#fff3e0",
                 els: [
                     {html:"<div style='background:#ff9800; padding:10px;'><h1 style='color:white; text-align:center;'>SCHOOL NEWS</h1></div>", t:40, l:40, w:714, h:80},
                     {html:"<h2 style='color:#e65100;'>Principal's Note</h2><p>Welcome back students! We have an exciting year ahead.</p>", t:140, l:40, w:714, h:100},
                     {html:"<div style='background:white; border:1px solid orange; padding:10px;'><h3 style='margin:0;'>Important Dates</h3><ul><li>Sep 1: First Day</li><li>Oct 31: Halloween Party</li></ul></div>", t:250, l:40, w:300, h:150},
                     {html:"<img src='https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80' style='width:100%; height:100%; object-fit:cover;'>", t:250, l:360, w:394, h:150}
                 ]
            },
            {
                n:"Corporate Brief", bg:"#fff",
                els: [
                    {html:"<div style='background:#1a237e; width:100%; height:100%;'></div>", t:0, l:0, w:200, h:1123},
                    {html:"<h1 style='color:white; font-family:sans-serif; text-align:right; padding-right:20px;'>Q1 REPORT</h1>", t:50, l:0, w:180, h:80},
                    {html:"<div style='color:white; padding:20px;'><b>Highlights:</b><br><br>• Growth up 10%<br>• New Hire<br>• Office Party</div>", t:150, l:0, w:200, h:200},
                    {html:"<h1 style='color:#1a237e;'>Executive Summary</h1><p>We are pleased to announce record profits this quarter.</p>", t:50, l:250, w:500, h:150},
                    {html:"<img src='https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80' style='width:100%; height:100%; object-fit:cover;'>", t:250, l:250, w:500, h:200}
                ]
            },
            {
                n:"Tech Digest", bg:"#263238",
                els: [
                    {html:"<h1 style='color:#80cbc4; text-align:center;'>TECH DIGEST</h1>", t:50, l:50, w:700, h:80},
                    {html:"<div style='column-count:3; column-gap:20px; color:#eceff1;'><p>Latest Gadgets</p><p>Software Trends</p><p>Coding Tips</p></div>", t:150, l:50, w:700, h:800}
                ]
            }
        ],
        "Business Cards": [
            {
                n:"Modern (10up)", bg:"#fff", 
                els: Array.from({length: 5}, (_, i) => [
                    {html:"<div style='border:1px solid #ddd; width:100%; height:100%; padding:15px; background:#f9f9f9;'><b style='font-size:16px; color:#333;'>John Doe</b><br><span style='font-size:11px; color:#777; text-transform:uppercase;'>Creative Director</span><br><br><span style='font-size:11px;'>555-1234 • john@design.com</span><div style='width:30px; height:30px; background:#333; position:absolute; right:15px; top:15px; border-radius:50%;'></div></div>", t:50 + (i*210), l:50, w:320, h:180},
                    {html:"<div style='border:1px solid #ddd; width:100%; height:100%; padding:15px; background:#f9f9f9;'><b style='font-size:16px; color:#333;'>John Doe</b><br><span style='font-size:11px; color:#777; text-transform:uppercase;'>Creative Director</span><br><br><span style='font-size:11px;'>555-1234 • john@design.com</span><div style='width:30px; height:30px; background:#333; position:absolute; right:15px; top:15px; border-radius:50%;'></div></div>", t:50 + (i*210), l:400, w:320, h:180}
                ]).flat()
            },
            {
                n:"Dark (10up)", bg:"#fff", 
                els: Array.from({length: 5}, (_, i) => [
                    {html:"<div style='background:#222; color:white; width:100%; height:100%; padding:15px;'><b style='font-size:16px; color:#d4af37;'>JANE SMITH</b><br><span style='font-size:10px;'>CEO & Founder</span><br><div style='border-top:1px solid #444; margin:10px 0;'></div><span style='font-size:10px;'>jsmith@corp.com</span></div>", t:50 + (i*210), l:50, w:320, h:180},
                    {html:"<div style='background:#222; color:white; width:100%; height:100%; padding:15px;'><b style='font-size:16px; color:#d4af37;'>JANE SMITH</b><br><span style='font-size:10px;'>CEO & Founder</span><br><div style='border-top:1px solid #444; margin:10px 0;'></div><span style='font-size:10px;'>jsmith@corp.com</span></div>", t:50 + (i*210), l:400, w:320, h:180}
                ]).flat()
            },
            {
                n:"Photo (10up)", bg:"#fff", 
                els: Array.from({length: 5}, (_, i) => [
                    {html:"<div style='border:1px solid #ccc; width:100%; height:100%; overflow:hidden;'><div style='width:40%; height:100%; background:url(https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80); background-size:cover; float:left;'></div><div style='float:left; width:60%; padding:10px;'><b style='font-size:14px;'>Alex Lee</b><br><span style='font-size:10px;'>Photographer</span><br><br><span style='font-size:10px;'>555-SNAP</span></div></div>", t:50 + (i*210), l:50, w:320, h:180},
                    {html:"<div style='border:1px solid #ccc; width:100%; height:100%; overflow:hidden;'><div style='width:40%; height:100%; background:url(https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80); background-size:cover; float:left;'></div><div style='float:left; width:60%; padding:10px;'><b style='font-size:14px;'>Alex Lee</b><br><span style='font-size:10px;'>Photographer</span><br><br><span style='font-size:10px;'>555-SNAP</span></div></div>", t:50 + (i*210), l:400, w:320, h:180}
                ]).flat()
            },
            {
                n:"Bold (10up)", bg:"#fff",
                 els: Array.from({length: 5}, (_, i) => [
                    {html:"<div style='background:#ffeb3b; width:100%; height:100%; padding:15px; display:flex; align-items:center; justify-content:center; flex-direction:column;'><b style='font-size:20px; font-weight:900;'>HELLO.</b><span style='font-size:12px;'>I am a developer</span></div>", t:50 + (i*210), l:50, w:320, h:180},
                    {html:"<div style='background:#ffeb3b; width:100%; height:100%; padding:15px; display:flex; align-items:center; justify-content:center; flex-direction:column;'><b style='font-size:20px; font-weight:900;'>HELLO.</b><span style='font-size:12px;'>I am a developer</span></div>", t:50 + (i*210), l:400, w:320, h:180}
                ]).flat()
            }
        ],
        "Posters": [
            {
                n:"Motivational", bg:"#000",
                els: [
                    {html:"<img src='https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80' style='width:100%; height:100%; object-fit:cover; opacity:0.6;'>", t:0, l:0, w:794, h:1123},
                    {html:"<h1 style='color:white; font-family:\"Oswald\"; font-size:120px; text-align:center; text-transform:uppercase; border:10px solid white; padding:20px;'>Dream<br>Big</h1>", t:200, l:100, w:600, h:400},
                    {html:"<p style='color:white; text-align:center; font-size:24px; font-style:italic;'>\"The only way to do great work is to love what you do.\"</p>", t:650, l:100, w:600, h:100}
                ]
            },
            {
                n:"Movie Poster", bg:"#1a237e",
                els: [
                    {html:"<img src='https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80' style='width:100%; height:100%; object-fit:cover; mix-blend-mode:overlay;'>", t:0, l:0, w:794, h:1123},
                    {html:"<h1 style='color:#fff; font-family:\"Cinzel\"; font-size:80px; text-align:center; text-shadow:0 0 10px cyan;'>THE GALAXY</h1>", t:50, l:50, w:700, h:120},
                    {html:"<h3 style='color:#ccc; text-align:center; letter-spacing:10px;'>COMING SOON</h3>", t:160, l:100, w:600, h:60},
                    {html:"<div style='position:absolute; bottom:50px; width:100%; text-align:center; color:#aaa; font-size:12px;'>STARRING ACTOR NAME • DIRECTED BY DIRECTOR NAME</div>", t:1000, l:0, w:794, h:50}
                ]
            },
            {
                n:"Yoga Class", bg:"#e0f7fa",
                els: [
                    {html:"<img src='https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&w=800&q=80' style='width:100%; height:500px; object-fit:cover; border-radius:0 0 300px 300px;'>", t:0, l:0, w:794, h:500},
                    {html:"<h1 style='text-align:center; color:#006064; font-family:sans-serif; font-weight:300; font-size:60px;'>Morning Yoga</h1>", t:550, l:100, w:600, h:100},
                    {html:"<p style='text-align:center; font-size:20px; color:#555;'>Find your balance.</p>", t:650, l:200, w:400, h:50},
                    {html:"<div style='background:#00bcd4; color:white; padding:15px; text-align:center; border-radius:50px; font-size:24px;'>First Class Free</div>", t:750, l:250, w:300, h:80}
                ]
            },
            {
                n:"Missing Person", bg:"#fff",
                els: [
                    {html:"<h1 style='background:red; color:white; text-align:center; font-size:80px; font-weight:bold;'>MISSING</h1>", t:50, l:50, w:700, h:120},
                    {html:"<div style='background:#ccc; width:100%; height:100%; display:flex; align-items:center; justify-content:center;'>PHOTO</div>", t:200, l:200, w:400, h:400},
                    {html:"<h2 style='text-align:center;'>JANE DOE</h2>", t:620, l:200, w:400, h:60},
                    {html:"<p style='text-align:center; font-size:20px;'>Last seen wearing a blue jacket.</p>", t:680, l:100, w:600, h:80},
                    {html:"<h1 style='text-align:center;'>CALL 911</h1>", t:800, l:200, w:400, h:100}
                ]
            },
            {
                n: "Art Exhibition", bg: "#212121",
                els: [
                     {html:"<h1 style='color:white; font-family:sans-serif; text-align:right; font-size:80px; margin-right:50px;'>MODERN<br>ART</h1>", t:50, l:200, w:500, h:200},
                     {html:"<div style='background:white; width:400px; height:400px; transform:rotate(10deg); margin:0 auto; border:10px solid #333;'></div>", t:300, l:200, w:400, h:400},
                     {html:"<p style='color:#777; text-align:center; margin-top:50px;'>Gallery Open Night</p>", t:800, l:200, w:400, h:50}
                ]
            }
        ],
        "Social Media": [
            {
                n:"Instagram Quote", bg:"#fff",
                els: [
                    {html:"<div style='width:100%; height:100%; background:linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);'></div>", t:0, l:0, w:794, h:794},
                    {html:"<div style='background:white; width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:40px;'><h1 style='font-family:\"Playfair Display\"; text-align:center; font-style:italic;'>\"Creativity is intelligence having fun.\"</h1></div>", t:100, l:100, w:600, h:600},
                    {html:"<p style='text-align:center; color:white; font-weight:bold;'>@yourhandle</p>", t:720, l:200, w:400, h:50}
                ]
            },
            {
                n:"YouTube Thumb", bg:"#fff",
                els: [
                    {html:"<img src='https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80' style='width:100%; height:100%; object-fit:cover;'>", t:0, l:0, w:794, h:446},
                    {html:"<h1 style='color:white; font-family:Impact; font-size:100px; -webkit-text-stroke:3px black; text-shadow:5px 5px 0 black;'>EPIC VLOG!</h1>", t:50, l:50, w:700, h:150},
                    {html:"<div style='background:red; color:white; font-weight:bold; font-size:40px; padding:10px; display:inline-block; transform:rotate(-5deg);'>MUST WATCH</div>", t:250, l:50, w:300, h:80},
                    {html:"<img src='https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' style='border:5px solid white; border-radius:50%; width:100%; height:100%; object-fit:cover;'>", t:250, l:600, w:150, h:150}
                ]
            },
            {
                n:"Sale Story", bg:"#000",
                els: [
                    {html:"<img src='https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80' style='width:100%; height:100%; object-fit:cover; opacity:0.6;'>", t:0, l:0, w:794, h:1123},
                    {html:"<h1 style='color:white; font-family:sans-serif; font-size:150px; text-align:center; margin:0;'>SALE</h1>", t:100, l:50, w:700, h:200},
                    {html:"<h2 style='color:#ff00ff; text-align:center; font-size:60px;'>50% OFF</h2>", t:300, l:100, w:600, h:100},
                    {html:"<div style='border:2px solid white; color:white; padding:15px; text-align:center; border-radius:30px; margin-top:200px;'>SWIPE UP TO SHOP</div>", t:900, l:200, w:400, h:80}
                ]
            },
            {
                n:"Event Post", bg:"#3f51b5",
                els: [
                    {html:"<div style='background:white; width:100%; height:100%; clip-path:polygon(0 0, 100% 0, 100% 85%, 0 100%);'></div>", t:20, l:20, w:754, h:600},
                    {html:"<h1 style='color:#3f51b5; font-size:60px; text-align:center;'>WEBINAR</h1>", t:100, l:50, w:700, h:100},
                    {html:"<h3 style='color:#333; text-align:center;'>Learn Design in 30 Days</h3>", t:220, l:100, w:600, h:60},
                    {html:"<div style='text-align:center; color:white; font-size:24px;'>LINK IN BIO</div>", t:700, l:200, w:400, h:50}
                ]
            },
            {
                n: "Pinterest Pin", bg: "#f8bbd0",
                els: [
                    {html:"<img src='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80' style='width:100%; height:100%; object-fit:cover; opacity:0.8;'>", t:0, l:0, w:794, h:1123},
                    {html:"<div style='background:white; opacity:0.9; padding:20px; text-align:center;'><h1 style='margin:0;'>10 Style Tips</h1><p>Look great for less.</p></div>", t:400, l:100, w:600, h:200}
                ]
            }
        ]
    };
    
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

    Object.keys(tmplData).forEach(cat => {
        const btn = document.createElement('div');
        btn.className = 'cat-btn';
        
        // Add Icon if exists
        const iconClass = icons[cat] || "fa-file-alt";
        btn.innerHTML = `<i class="fas ${iconClass}"></i> ${cat}`;
        
        btn.onclick = (e) => loadCat(cat, e);
        catsDiv.appendChild(btn);
    });

    function loadCat(cat, e) {
        gridDiv.innerHTML = '';
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        
        // Handle active state
        if(e && e.currentTarget) e.currentTarget.classList.add('active');
        else if(!e && catsDiv.firstChild) catsDiv.firstChild.classList.add('active');
        
        tmplData[cat].forEach(t => {
            const div = document.createElement('div');
            div.className = 'tp-item';
            
            // --- PREVIEW LOGIC: Render scaled HTML ---
            let previewHTML = '';
            t.els.forEach(el => {
                // We construct the HTML structure exactly as it will appear
                previewHTML += `<div style="position:absolute; top:${el.t}px; left:${el.l}px; width:${el.w}px; height:${el.h}px; z-index:1;">${el.html}</div>`;
            });
            
            // Create a scaled container (A4 size scaled down)
            // A4 is 794x1123. 
            // To fit into 100px width, scale is approx 0.125
            const content = `
                <div style="
                    width: 794px; 
                    height: 1123px; 
                    background: ${t.bg}; 
                    transform: scale(0.125); 
                    transform-origin: 0 0; 
                    overflow: hidden; 
                    position: absolute; 
                    top: 0; left: 0;
                    pointer-events: none;
                ">
                    ${previewHTML}
                </div>
            `;

            div.innerHTML = `<div class="template-preview">${content}</div><div>${t.n}</div>`;
            div.onclick = () => loadTemplate(t);
            gridDiv.appendChild(div);
        });
    }
    // Trigger load of first category
    if(catsDiv.firstChild) loadCat(Object.keys(tmplData)[0]);
}
function loadTemplate(t) {
    DialogSystem.show('Load Template', '<p>Load this template? This will replace your ENTIRE document and start fresh.</p>', () => {
        state.pages = []; // Wipe document
        state.history = [];
        state.historyIndex = -1;
        
        const newElements = t.els.map(el => {
            return {
                left: el.l + 'px', top: el.t + 'px',
                width: el.w + 'px', height: el.h + 'px',
                innerHTML: el.html,
                transform: 'none', zIndex: 10,
                scaleX: "1", scaleY: "1"
            };
        });
        
        const p = {
           id: Date.now(),
           width: '794px', height: '1123px',
           background: t.bg || '#ffffff',
           header: 'Header', footer: 'Footer', borderStyle: 'none',
           elements: newElements
        };
        
        state.pages.push(p);
        state.currentPageIndex = 0;
        
        renderPage(state.pages[0]);
        updateSidebar();
        document.getElementById('template-modal').style.display = 'none';
        pushHistory();
    });
}
function showAdModal() { document.getElementById('ad-modal').style.display = 'flex'; }
function showTemplateModal() { document.getElementById('template-modal').style.display = 'flex'; }
