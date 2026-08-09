

(function initExpansionPack1() {
    
    // 0. PHYSICAL OVERRIDE FOR THE BROKEN IMAGE ICON
    // Scans the page and instantly swaps the dead Unsplash URL for a working one
    const fixBrokenImages = () => {
        const dead = '1459749411177';
        const live = 'https://images.unsplash.com/photo-1470229722913-7c092dbbfa26?auto=format&fit=crop&w=800&q=80';
        document.querySelectorAll('img').forEach(img => {
            if (img.src.includes(dead)) img.src = live;
        });
    };
    
    // 1. DATA FIX: Aura text shifted safely away from the edges
    const modernTemplates = [
        {
            c: "Magazines", n: "Aura Style Cover", w: 816, h: 1056, bg: "#f8f9fa",
            els: [
                {html: `<div style="background: #f8f9fa; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Times New Roman', Times, serif; font-size: 160px; font-weight: bold; color: #111; text-align: center; letter-spacing: -5px; line-height: 1; z-index: 2;">AURA</div>`, t: 50, l: 50, w: 716, h: 150},
                {html: `<div style="background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); border-radius: 10px; z-index: 3;"></div>`, t: 220, l: 50, w: 716, h: 550},
                // FIXED: Top (t) is now 320, Left (l) is now 60. This physical shift prevents the CSS rotation from clipping!
                {html: `<div style="font-family: Arial, sans-serif; font-size: 40px; font-weight: 900; color: #fff; text-shadow: 2px 2px 10px rgba(0,0,0,0.3); transform: rotate(-5deg); line-height: 1.1; z-index: 4;">THE<br>SPRING<br>ISSUE</div>`, t: 320, l: 60, w: 400, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #111; z-index: 5;"><b>EXCLUSIVE INTERVIEW</b><br>Inside the minds of tomorrow's top designers.</div>`, t: 820, l: 50, w: 300, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #111; text-align: right; z-index: 6;"><b>FASHION WEEK</b><br>10 trends you absolutely cannot miss this season.</div>`, t: 820, l: 466, w: 300, h: 100}
            ]
        },
        {
            c: "Menus", n: "L'Avenir Luxury Menu", w: 816, h: 1056, bg: "#1a1a1a",
            els: [
                {html: `<div style="background: #1a1a1a; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border: 2px solid #d4af37; z-index: 2;"></div>`, t: 30, l: 30, w: 756, h: 996},
                {html: `<div style="font-family: Georgia, serif; font-size: 64px; color: #d4af37; text-align: center; letter-spacing: 15px; z-index: 3;">L'AVENIR</div>`, t: 100, l: 100, w: 616, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #fff; text-align: center; letter-spacing: 5px; z-index: 4;">EST. 2026 | FINE DINING</div>`, t: 180, l: 100, w: 616, h: 30},
                {html: `<div style="font-family: Georgia, serif; font-size: 24px; color: #d4af37; border-bottom: 1px dashed #555; padding-bottom: 10px; z-index: 5;">STARTERS</div>`, t: 300, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #ccc; line-height: 1.8; z-index: 6;"><b>Truffle Arancini</b> ........................................ $18<br><span style="font-size:12px; color:#888;">Wild mushroom, parmesan, black truffle aioli</span></div>`, t: 360, l: 100, w: 616, h: 80},
                {html: `<div style="font-family: Georgia, serif; font-size: 24px; color: #d4af37; border-bottom: 1px dashed #555; padding-bottom: 10px; z-index: 7;">MAINS</div>`, t: 460, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #ccc; line-height: 1.8; z-index: 8;"><b>Wagyu Filet Mignon</b> ........................................ $65<br><span style="font-size:12px; color:#888;">Pomme purée, roasted asparagus, red wine jus</span></div>`, t: 520, l: 100, w: 616, h: 80}
            ]
        },
        {
            c: "Brochures", n: "Nova Tech Handout", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #0055ff; z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 350},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 80px; color: #fff; letter-spacing: -2px; z-index: 3;">NOVA.TECH</div>`, t: 100, l: 50, w: 716, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; color: #80aaff; letter-spacing: 2px; z-index: 4;">ENTERPRISE CLOUD SOLUTIONS</div>`, t: 200, l: 50, w: 716, h: 50},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 32px; font-weight: bold; color: #111; line-height: 1.2; z-index: 5;">Scaling your infrastructure shouldn't be a nightmare.</div>`, t: 450, l: 50, w: 300, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #555; line-height: 1.6; z-index: 6;">Our state-of-the-art serverless platform automatically provisions resources based on real-time traffic spikes, ensuring zero downtime and maximizing cost-efficiency.<br><br><b>• 99.99% Uptime Guarantee<br>• Automated Threat Detection<br>• Instant Scaling</b></div>`, t: 450, l: 400, w: 366, h: 400}
            ]
        }
    ];

    function injectModernPack() {
        const grid = document.getElementById('template-grid');
        const activeBtn = document.querySelector('.cat-btn.active');
        if (!grid || !activeBtn) return;
        const activeCat = activeBtn.innerText.trim();
        const existing = grid.querySelectorAll('.modern-pack-1');
        existing.forEach(el => el.remove());
        
        modernTemplates.filter(t => t.c === activeCat).forEach((t) => {
            const div = document.createElement('div');
            div.className = 'tp-item modern-pack-1';
            const scale = 100 / (t.w || 794); 
            let previewHTML = '';
            t.els.forEach(el => {
                let styleFix = (el.html.includes('z-index: 1') || el.h > 1000) ? "width: 100%; height: 100%;" : "";
                previewHTML += `<div style="position:absolute; top:${el.t}px; left:${el.l}px; width:${el.w}px; height:${el.h}px; z-index:1; ${styleFix}">${el.html}</div>`;
            });
            div.innerHTML = `<div class="template-preview" style="position:relative;"><div style="width: ${t.w}px; height: ${t.h}px; background: ${t.bg}; transform: scale(${scale}); transform-origin: 0 0; overflow: hidden; position: absolute; top: 0; left: 0; pointer-events: none;">${previewHTML}</div></div><div style="font-size:12px; margin-top:5px;">${t.n}</div>`;
            div.onclick = () => window.loadTemplate(t); 
            grid.appendChild(div);
        });
        fixBrokenImages(); 
    }

    if (typeof window.showTemplateModal !== 'undefined') {
        const originalModal = window.showTemplateModal;
        window.showTemplateModal = function() { originalModal(); setTimeout(injectModernPack, 150); };
    }
    document.addEventListener('click', (e) => {
        if(e.target && e.target.classList && e.target.classList.contains('cat-btn')) setTimeout(injectModernPack, 150); 
    });
    
    // Automatically check for the broken image every second
    setInterval(fixBrokenImages, 1000);
})();


(function initExpansionPack2() {

    // 0. THE BADGE REMOVER
    // This safely hides the old pink "NEW" tags from V11 without touching the core code!
    const style = document.createElement('style');
    style.innerHTML = '.template-preview span { display: none !important; }';
    document.head.appendChild(style);
    
    // 1. THE 10 PREMIUM TEMPLATES
    const modernTemplates2 = [
        // 1. Indie Film Poster
        {
            c: "Posters", n: "Indie Film Poster", w: 816, h: 1056, bg: "#111827",
            els: [
                {html: `<div style="background: #111827; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border: 1px solid #374151; z-index: 2;"></div>`, t: 40, l: 40, w: 736, h: 976},
                {html: `<div style="font-family: 'Georgia', serif; font-size: 100px; color: #f9fafb; text-align: center; letter-spacing: 8px; z-index: 3;">ECLIPSE</div>`, t: 150, l: 50, w: 716, h: 120},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #9ca3af; text-align: center; letter-spacing: 12px; z-index: 4;">A SHORT FILM BY J. DIRECTOR</div>`, t: 300, l: 50, w: 716, h: 40},
                {html: `<div style="background: #3b82f6; z-index: 5;"></div>`, t: 450, l: 358, w: 100, h: 4},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #6b7280; text-align: center; line-height: 2; z-index: 6;">WINNER<br>BEST PICTURE<br>FESTIVAL 2026</div>`, t: 550, l: 200, w: 416, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; color: #f3f4f6; text-align: center; letter-spacing: 4px; z-index: 7;">IN THEATERS OCTOBER</div>`, t: 850, l: 50, w: 716, h: 50}
            ]
        },
        // 2. Startup Brief
        {
            c: "Newsletters", n: "Startup Brief", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #0f172a; z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 200},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 64px; color: #ffffff; letter-spacing: -2px; z-index: 3;">THE WEEKLY ROOT</div>`, t: 50, l: 50, w: 716, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; z-index: 4;">Tech • Design • Culture | Issue 42</div>`, t: 140, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 36px; font-weight: bold; color: #0f172a; z-index: 5;">The Future of Remote Teams</div>`, t: 250, l: 50, w: 716, h: 50},
                {html: `<div style="background: #e2e8f0; z-index: 6;"></div>`, t: 320, l: 50, w: 716, h: 2},
                {html: `<div style="font-family: Georgia, serif; font-size: 16px; color: #334155; line-height: 1.8; column-count: 2; column-gap: 40px; z-index: 7;">As companies continue to adapt to hybrid models, the tools we use are evolving faster than ever. This week, we explore the top 5 software suites transforming how distributed teams collaborate across time zones. <br><br>From asynchronous video updates to AI-driven project management, the landscape of work has fundamentally shifted.</div>`, t: 350, l: 50, w: 716, h: 300},
                {html: `<div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 20px; z-index: 8;"></div>`, t: 700, l: 50, w: 716, h: 200},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #0f172a; z-index: 9;">Upcoming Events</div>`, t: 730, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #475569; line-height: 1.6; z-index: 10;">• <b>Webinar:</b> Designing for Accessibility (Nov 12)<br>• <b>Workshop:</b> Advanced CSS Grid (Nov 15)</div>`, t: 780, l: 80, w: 656, h: 100}
            ]
        },
        // 3. Creative Minimalist Resume
        {
            c: "Resumes", n: "Creative Minimalist", w: 816, h: 1056, bg: "#f4f4f5",
            els: [
                {html: `<div style="background: #f4f4f5; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #18181b; z-index: 2;"></div>`, t: 0, l: 0, w: 250, h: 1056},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 48px; font-weight: 900; color: #18181b; letter-spacing: -1px; z-index: 3;">MORGAN<br>HAYES</div>`, t: 100, l: 300, w: 466, h: 120},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 18px; color: #10b981; font-weight: bold; letter-spacing: 2px; z-index: 4;">UX / UI DESIGNER</div>`, t: 240, l: 300, w: 466, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #a1a1aa; line-height: 2; z-index: 5;">morgan.hayes@email.com<br>portfolio.design</div>`, t: 100, l: 40, w: 170, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #fafafa; border-bottom: 1px solid #3f3f46; padding-bottom: 10px; z-index: 6;">SKILLS</div>`, t: 300, l: 40, w: 170, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 13px; color: #d4d4d8; line-height: 2; z-index: 7;">Figma<br>Prototyping<br>User Research</div>`, t: 360, l: 40, w: 170, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #18181b; border-bottom: 2px solid #e4e4e7; padding-bottom: 10px; z-index: 8;">EXPERIENCE</div>`, t: 320, l: 300, w: 466, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #18181b; z-index: 9;">Senior Product Designer</div>`, t: 390, l: 300, w: 466, h: 25},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 13px; color: #71717a; font-style: italic; z-index: 10;">TechFlow Inc. | 2021 - Present</div>`, t: 420, l: 300, w: 466, h: 25},
                {html: `<div style="font-family: Georgia, serif; font-size: 14px; color: #52525b; line-height: 1.6; z-index: 11;">Lead the redesign of the core SaaS platform, improving user retention by 35%. Mentored a team of 4 junior designers.</div>`, t: 455, l: 300, w: 466, h: 100}
            ]
        },
        // 4. Real Estate Flyer
        {
            c: "Flyers", n: "Luxury Real Estate", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #0f766e; z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 150},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 50px; font-weight: bold; color: #ffffff; letter-spacing: 5px; text-align: center; z-index: 3;">OPEN HOUSE</div>`, t: 45, l: 50, w: 716, h: 80},
                {html: `<div style="font-family: Georgia, serif; font-size: 40px; color: #0f766e; text-align: center; z-index: 4;">123 Meadow Lane, Suburbia</div>`, t: 200, l: 50, w: 716, h: 50},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 60px; font-weight: 900; color: #111827; text-align: center; z-index: 5;">$850,000</div>`, t: 280, l: 50, w: 716, h: 80},
                {html: `<div style="background: #f3f4f6; border-radius: 8px; z-index: 6;"></div>`, t: 400, l: 100, w: 616, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #374151; text-align: center; z-index: 7;">4 BEDS &nbsp; | &nbsp; 3 BATHS &nbsp; | &nbsp; 2,500 SQ FT</div>`, t: 435, l: 100, w: 616, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #4b5563; line-height: 1.8; text-align: center; z-index: 8;">Fully renovated chef's kitchen, vaulted ceilings, and a sprawling backyard perfect for entertaining. Join us this Saturday from 10 AM to 2 PM.</div>`, t: 550, l: 150, w: 516, h: 150}
            ]
        },
        // 5. Cafe Noir Menu
        {
            c: "Menus", n: "Cafe Noir Coffee", w: 816, h: 1056, bg: "#1c1917",
            els: [
                {html: `<div style="background: #1c1917; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border: 1px solid #a8a29e; z-index: 2;"></div>`, t: 40, l: 40, w: 736, h: 976},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 64px; font-weight: 900; color: #d6d3d1; text-align: center; letter-spacing: 10px; z-index: 3;">CAFÉ NOIR</div>`, t: 120, l: 50, w: 716, h: 80},
                {html: `<div style="font-family: Georgia, serif; font-size: 16px; color: #78716c; text-align: center; font-style: italic; z-index: 4;">Locally Roasted. Carefully Crafted.</div>`, t: 210, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 24px; color: #d6d3d1; letter-spacing: 3px; border-bottom: 1px solid #57534e; padding-bottom: 5px; z-index: 5;">COFFEE</div>`, t: 320, l: 150, w: 516, h: 40},
                {html: `<div style="font-family: Courier, monospace; font-size: 18px; color: #a8a29e; line-height: 2.5; z-index: 6;">Espresso ............................ 3.00<br>Americano ........................... 3.50<br>Cappuccino .......................... 4.50<br>Vanilla Latte ....................... 5.00<br>Pour Over ........................... 5.50</div>`, t: 390, l: 150, w: 516, h: 200},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 24px; color: #d6d3d1; letter-spacing: 3px; border-bottom: 1px solid #57534e; padding-bottom: 5px; z-index: 7;">TEA & MORE</div>`, t: 650, l: 150, w: 516, h: 40},
                {html: `<div style="font-family: Courier, monospace; font-size: 18px; color: #a8a29e; line-height: 2.5; z-index: 8;">Matcha Latte ........................ 5.50<br>Chai Tea ............................ 4.00<br>Hot Chocolate ....................... 4.50</div>`, t: 720, l: 150, w: 516, h: 150}
            ]
        },
        // 6. Developer Dark Resume
        {
            c: "Resumes", n: "Dark Mode Developer", w: 816, h: 1056, bg: "#0d1117",
            els: [
                {html: `<div style="background: #0d1117; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Courier New', Courier, monospace; font-size: 60px; font-weight: bold; color: #c9d1d9; z-index: 2;">JANE DOE</div>`, t: 80, l: 80, w: 656, h: 70},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #58a6ff; z-index: 3;">FULL-STACK ENGINEER</div>`, t: 160, l: 80, w: 656, h: 30},
                {html: `<div style="background: #30363d; z-index: 4;"></div>`, t: 210, l: 80, w: 656, h: 2},
                {html: `<div style="font-family: 'Courier New', Courier, monospace; font-size: 14px; color: #8b949e; z-index: 5;">github.com/janedoe | jane@dev.io | New York, NY</div>`, t: 230, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #c9d1d9; z-index: 6;">TECH STACK</div>`, t: 300, l: 80, w: 200, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #8b949e; line-height: 1.8; z-index: 7;">JavaScript (ES6+)<br>React & Next.js<br>Node.js & Express<br>PostgreSQL<br>AWS & Docker</div>`, t: 340, l: 80, w: 200, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #c9d1d9; z-index: 8;">EXPERIENCE</div>`, t: 300, l: 320, w: 416, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #58a6ff; z-index: 9;">Software Engineer II @ CloudBase</div>`, t: 340, l: 320, w: 416, h: 25},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #c9d1d9; line-height: 1.6; z-index: 10;">• Architected and deployed microservices handling 2M+ requests daily.<br>• Reduced database query latency by 40% via Redis caching.</div>`, t: 375, l: 320, w: 416, h: 100}
            ]
        },
        // 7. Gallery Poster
        {
            c: "Posters", n: "Gallery Exhibition", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: linear-gradient(45deg, #ff7e5f, #feb47b); z-index: 2;"></div>`, t: 80, l: 80, w: 656, h: 600},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 90px; font-weight: 900; color: #111; line-height: 0.9; z-index: 3;">MODERN<br>ART.</div>`, t: 550, l: 40, w: 500, h: 200},
                {html: `<div style="font-family: Georgia, serif; font-size: 24px; color: #555; z-index: 4;">A retrospective on abstract minimalism.</div>`, t: 780, l: 45, w: 716, h: 30},
                {html: `<div style="background: #111; z-index: 5;"></div>`, t: 840, l: 45, w: 50, h: 4},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #111; z-index: 6;">OPENS JULY 15</div>`, t: 870, l: 45, w: 300, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #777; z-index: 7;">The Downtown Gallery<br>450 Arts District Blvd.</div>`, t: 900, l: 45, w: 300, h: 50}
            ]
        },
        // 8. Travel Brochure
        {
            c: "Brochures", n: "Travel Agency", w: 816, h: 1056, bg: "#f0f9ff",
            els: [
                {html: `<div style="background: #f0f9ff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 64px; font-weight: 900; color: #0369a1; text-align: center; letter-spacing: 2px; z-index: 2;">ESCAPE TO THE ALPS</div>`, t: 100, l: 50, w: 716, h: 150},
                {html: `<div style="font-family: Georgia, serif; font-size: 20px; color: #0c4a6e; text-align: center; font-style: italic; z-index: 3;">Experience the ultimate winter getaway.</div>`, t: 250, l: 50, w: 716, h: 40},
                {html: `<div style="background: #0284c7; border-radius: 10px; z-index: 4;"></div>`, t: 350, l: 60, w: 200, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #fff; text-align: center; z-index: 5;">SKI PASSES</div>`, t: 380, l: 60, w: 200, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #e0f2fe; text-align: center; padding: 10px; z-index: 6;">Access to over 150 premium trails across 3 mountain peaks.</div>`, t: 440, l: 60, w: 200, h: 200},
                {html: `<div style="background: #0284c7; border-radius: 10px; z-index: 7;"></div>`, t: 350, l: 308, w: 200, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #fff; text-align: center; z-index: 8;">CABINS</div>`, t: 380, l: 308, w: 200, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #e0f2fe; text-align: center; padding: 10px; z-index: 9;">Luxury heated chalets with panoramic views of the valley.</div>`, t: 440, l: 308, w: 200, h: 200},
                {html: `<div style="background: #0284c7; border-radius: 10px; z-index: 10;"></div>`, t: 350, l: 556, w: 200, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #fff; text-align: center; z-index: 11;">TOURS</div>`, t: 380, l: 556, w: 200, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #e0f2fe; text-align: center; padding: 10px; z-index: 12;">Guided snowshoe and snowmobile tours available daily.</div>`, t: 440, l: 556, w: 200, h: 200}
            ]
        },
        // 9. Corporate Seminar
        {
            c: "Flyers", n: "Corporate Seminar", w: 816, h: 1056, bg: "#1e1b4b",
            els: [
                {html: `<div style="background: #1e1b4b; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 80px; font-weight: 900; color: #c7d2fe; letter-spacing: -2px; z-index: 2;">INNOVATE 2026</div>`, t: 100, l: 80, w: 656, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; color: #818cf8; z-index: 3;">A SUMMIT FOR TECH LEADERS</div>`, t: 200, l: 80, w: 656, h: 40},
                {html: `<div style="background: #4f46e5; z-index: 4;"></div>`, t: 260, l: 80, w: 150, h: 5},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #e0e7ff; line-height: 1.6; z-index: 5;">Join 500+ executives to discuss the integration of AI into modern enterprise workflows.</div>`, t: 300, l: 80, w: 500, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #c7d2fe; z-index: 6;">KEYNOTE SPEAKERS:</div>`, t: 450, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #a5b4fc; line-height: 2; z-index: 7;">Dr. Sarah Jenkins - CEO, DataCorp<br>Mark Robinson - VP of Engineering, CloudNet<br>Elena Rostova - Head of AI, FutureSystems</div>`, t: 500, l: 80, w: 656, h: 100},
                {html: `<div style="background: #312e81; padding: 20px; text-align: center; color: #fff; font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; z-index: 8;">REGISTER AT INNOVATE-SUMMIT.COM</div>`, t: 850, l: 80, w: 656, h: 65}
            ]
        },
        // 10. Boutique Sale
        {
            c: "Posters", n: "Boutique Sale", w: 816, h: 1056, bg: "#fff1f2",
            els: [
                {html: `<div style="background: #fff1f2; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border: 2px solid #be123c; z-index: 2;"></div>`, t: 50, l: 50, w: 716, h: 956},
                {html: `<div style="font-family: Georgia, serif; font-size: 30px; color: #be123c; text-align: center; letter-spacing: 5px; z-index: 3;">THE BOUTIQUE</div>`, t: 150, l: 100, w: 616, h: 50},
                {html: `<div style="font-family: Georgia, serif; font-size: 100px; color: #881337; text-align: center; z-index: 4;">SUMMER<br>SALE</div>`, t: 300, l: 100, w: 616, h: 250},
                {html: `<div style="background: #be123c; z-index: 5;"></div>`, t: 580, l: 308, w: 200, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 36px; font-weight: bold; color: #e11d48; text-align: center; z-index: 6;">UP TO 60% OFF</div>`, t: 620, l: 100, w: 616, h: 50},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #9f1239; text-align: center; letter-spacing: 3px; z-index: 7;">FRIDAY TO SUNDAY ONLY</div>`, t: 700, l: 100, w: 616, h: 30}
            ]
        }
    ];

    // 2. INJECTION SYSTEM
    function injectModernPack2() {
        const grid = document.getElementById('template-grid');
        const activeBtn = document.querySelector('.cat-btn.active');
        if (!grid || !activeBtn) return;
        const activeCat = activeBtn.innerText.trim();
        
        const existing = grid.querySelectorAll('.modern-pack-2');
        existing.forEach(el => el.remove());
        
        modernTemplates2.filter(t => t.c === activeCat).forEach((t) => {
            const div = document.createElement('div');
            div.className = 'tp-item modern-pack-2';
            const scale = 100 / (t.w || 794); 
            let previewHTML = '';
            t.els.forEach(el => {
                let styleFix = (el.html.includes('z-index: 1') || el.h > 1000) ? "width: 100%; height: 100%;" : "";
                previewHTML += `<div style="position:absolute; top:${el.t}px; left:${el.l}px; width:${el.w}px; height:${el.h}px; z-index:1; ${styleFix}">${el.html}</div>`;
            });
            // Standard layout with NO extra badges!
            div.innerHTML = `<div class="template-preview" style="position:relative;"><div style="width: ${t.w}px; height: ${t.h}px; background: ${t.bg}; transform: scale(${scale}); transform-origin: 0 0; overflow: hidden; position: absolute; top: 0; left: 0; pointer-events: none;">${previewHTML}</div></div><div style="font-size:12px; margin-top:5px;">${t.n}</div>`;
            div.onclick = () => window.loadTemplate(t); 
            grid.appendChild(div);
        });
    }

    // 3. EVENT LISTENERS
    if (typeof window.showTemplateModal !== 'undefined') {
        const originalModal = window.showTemplateModal;
        window.showTemplateModal = function() { originalModal(); setTimeout(injectModernPack2, 150); };
    }
    document.addEventListener('click', (e) => {
        if(e.target && e.target.classList && e.target.classList.contains('cat-btn')) setTimeout(injectModernPack2, 150); 
    });

})();


(function initExpansionPack3Batch1() {

    const pack3Templates = [
        // --- INVITATIONS (3) ---
        {
            c: "Invitations", n: "Elegant Wedding", w: 816, h: 1056, bg: "#fffdf0",
            els: [
                {html: `<div style="background: #fffdf0; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border: 2px solid #d4af37; z-index: 2;"></div>`, t: 50, l: 50, w: 716, h: 956},
                {html: `<div style="font-family: Georgia, serif; font-size: 24px; color: #555; text-align: center; letter-spacing: 4px; z-index: 3;">TOGETHER WITH THEIR FAMILIES</div>`, t: 150, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 72px; color: #d4af37; text-align: center; font-style: italic; z-index: 4;">Eleanor & James</div>`, t: 250, l: 100, w: 616, h: 100},
                {html: `<div style="font-family: Georgia, serif; font-size: 18px; color: #555; text-align: center; line-height: 2; z-index: 5;">INVITE YOU TO CELEBRATE THEIR MARRIAGE<br>SATURDAY, THE FOURTEENTH OF AUGUST<br>TWO THOUSAND TWENTY-SIX<br>AT FOUR O'CLOCK IN THE AFTERNOON</div>`, t: 400, l: 100, w: 616, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #888; text-align: center; letter-spacing: 2px; z-index: 6;">THE GRAND ESTATE<br>123 MANOR ROAD, COUNTRYSIDE</div>`, t: 650, l: 100, w: 616, h: 60},
                {html: `<div style="font-family: Georgia, serif; font-size: 18px; color: #d4af37; text-align: center; font-style: italic; z-index: 7;">Reception to follow</div>`, t: 800, l: 100, w: 616, h: 40}
            ]
        },
        {
            c: "Invitations", n: "Kids Birthday", w: 816, h: 1056, bg: "#fef08a",
            els: [
                {html: `<div style="background: #fef08a; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #ef4444; border-radius: 50%; z-index: 2;"></div>`, t: -100, l: -100, w: 300, h: 300},
                {html: `<div style="background: #3b82f6; border-radius: 50%; z-index: 3;"></div>`, t: 800, l: 600, w: 400, h: 400},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 80px; color: #1f2937; text-align: center; line-height: 1.1; transform: rotate(-3deg); z-index: 4;">YOU'RE<br>INVITED!</div>`, t: 200, l: 50, w: 716, h: 200},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 30px; font-weight: bold; color: #ef4444; text-align: center; z-index: 5;">TO LEO'S 7TH BIRTHDAY PARTY</div>`, t: 450, l: 50, w: 716, h: 50},
                {html: `<div style="background: #ffffff; border: 4px dashed #3b82f6; border-radius: 20px; z-index: 6;"></div>`, t: 550, l: 150, w: 516, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; color: #1f2937; text-align: center; line-height: 2; font-weight: bold; z-index: 7;">WHEN: Saturday, Oct 10th @ 2 PM<br>WHERE: The Jump Zone Park<br>RSVP: To Mom by Oct 1st</div>`, t: 600, l: 150, w: 516, h: 150}
            ]
        },
        {
            c: "Invitations", n: "Corporate Gala", w: 816, h: 1056, bg: "#0f172a",
            els: [
                {html: `<div style="background: #0f172a; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border-left: 2px solid #38bdf8; border-right: 2px solid #38bdf8; z-index: 2;"></div>`, t: 0, l: 100, w: 616, h: 1056},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; color: #94a3b8; text-align: center; letter-spacing: 10px; z-index: 3;">A N N U A L</div>`, t: 200, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 90px; color: #ffffff; text-align: center; z-index: 4;">GALA</div>`, t: 250, l: 100, w: 616, h: 100},
                {html: `<div style="background: #38bdf8; z-index: 5;"></div>`, t: 380, l: 358, w: 100, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #cbd5e1; text-align: center; line-height: 2; z-index: 6;">Join us for an evening of innovation, networking,<br>and recognizing industry excellence.</div>`, t: 450, l: 100, w: 616, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #ffffff; text-align: center; z-index: 7;">DECEMBER 12 | THE METROPOLITAN</div>`, t: 650, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #38bdf8; text-align: center; z-index: 8;">BLACK TIE ATTIRE</div>`, t: 700, l: 100, w: 616, h: 30}
            ]
        },

        // --- MAGAZINES (4) ---
        {
            c: "Magazines", n: "Tech Innovator", w: 816, h: 1056, bg: "#000000",
            els: [
                {html: `<div style="background: #000000; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 120px; color: #ffffff; text-align: center; letter-spacing: -4px; z-index: 2;">WIRED</div>`, t: 50, l: 0, w: 816, h: 150},
                {html: `<div style="background: linear-gradient(180deg, #10b981 0%, #047857 100%); z-index: 3;"></div>`, t: 250, l: 50, w: 716, h: 500},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 60px; font-weight: 900; color: #000000; background: #10b981; padding: 10px; display: inline-block; z-index: 4;">THE AI</div>`, t: 450, l: 20, w: 300, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 60px; font-weight: 900; color: #000000; background: #10b981; padding: 10px; display: inline-block; z-index: 5;">TAKEOVER</div>`, t: 540, l: 20, w: 400, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #ffffff; z-index: 6;">SILICON VALLEY's NEXT BIG BET</div>`, t: 800, l: 50, w: 500, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #9ca3af; z-index: 7;">How quantum computing is quietly reshaping the global economy.</div>`, t: 850, l: 50, w: 400, h: 60}
            ]
        },
        {
            c: "Magazines", n: "Food & Living", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: Georgia, serif; font-size: 100px; color: #1c1917; text-align: center; z-index: 2;">Savor</div>`, t: 40, l: 0, w: 816, h: 120},
                {html: `<div style="background: #fca5a5; border-radius: 400px 400px 0 0; z-index: 3;"></div>`, t: 180, l: 108, w: 600, h: 600},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 70px; font-style: italic; color: #7f1d1d; text-align: center; z-index: 4;">Summer<br>Harvest</div>`, t: 650, l: 108, w: 600, h: 160},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #444; z-index: 5;">50 QUICK DINNERS</div>`, t: 850, l: 80, w: 200, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #777; z-index: 6;">Meals under 30 mins.</div>`, t: 880, l: 80, w: 200, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #444; text-align: right; z-index: 7;">THE PERFECT PIE</div>`, t: 850, l: 536, w: 200, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #777; text-align: right; z-index: 8;">Secrets from a master baker.</div>`, t: 880, l: 536, w: 200, h: 30}
            ]
        },
        {
            c: "Magazines", n: "Travel Escapes", w: 816, h: 1056, bg: "#e0f2fe",
            els: [
                {html: `<div style="background: #e0f2fe; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #0284c7; z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 700},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 130px; font-weight: 900; color: rgba(255,255,255,0.2); letter-spacing: 10px; z-index: 3;">VOYAGE</div>`, t: 20, l: 40, w: 750, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 130px; font-weight: 900; color: #ffffff; letter-spacing: 10px; z-index: 4;">VOYAGE</div>`, t: 40, l: 40, w: 750, h: 150},
                {html: `<div style="font-family: Georgia, serif; font-size: 50px; color: #0284c7; z-index: 5;">The Amalfi Coast</div>`, t: 750, l: 50, w: 500, h: 60},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #0c4a6e; line-height: 1.6; z-index: 6;">Hidden beaches, cliffside villas, and the best pasta in Italy. A complete local's guide to avoiding the tourist traps.</div>`, t: 830, l: 50, w: 400, h: 100},
                {html: `<div style="background: #0369a1; padding: 15px; color: #fff; font-family: Arial, sans-serif; font-weight: bold; text-align: center; z-index: 7;">TOP 10 RESORTS</div>`, t: 750, l: 550, w: 200, h: 50}
            ]
        },
        {
            c: "Magazines", n: "Health & Fitness", w: 816, h: 1056, bg: "#f1f5f9",
            els: [
                {html: `<div style="background: #f1f5f9; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 150px; color: #dc2626; text-align: center; letter-spacing: -8px; z-index: 2;">PULSE</div>`, t: 20, l: 0, w: 816, h: 180},
                {html: `<div style="border: 10px solid #1e293b; z-index: 3;"></div>`, t: 200, l: 50, w: 716, h: 600},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 70px; color: #1e293b; line-height: 0.9; text-transform: uppercase; z-index: 4;">Build<br>Real<br>Strength</div>`, t: 400, l: 80, w: 400, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #dc2626; z-index: 5;">THE 30-DAY KETTLEBELL CHALLENGE</div>`, t: 840, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #475569; column-count: 2; z-index: 6;">Plus: Expert nutrition guides for recovery, the truth about protein supplements, and how sleep impacts muscle growth.</div>`, t: 880, l: 50, w: 716, h: 80}
            ]
        },

        // --- BROCHURES (3) ---
        {
            c: "Brochures", n: "Medical Clinic", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #0d9488; z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 60px; font-weight: bold; color: #ffffff; z-index: 3;">Apex Medical</div>`, t: 80, l: 50, w: 716, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; color: #ccfbf1; z-index: 4;">COMPREHENSIVE FAMILY CARE</div>`, t: 160, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #115e59; z-index: 5;">Our Services</div>`, t: 320, l: 50, w: 300, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #4b5563; line-height: 2; z-index: 6;">• General Practice<br>• Pediatrics<br>• Preventative Care<br>• Immunizations<br>• Physical Therapy</div>`, t: 380, l: 50, w: 300, h: 200},
                {html: `<div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 20px; z-index: 7;"></div>`, t: 320, l: 400, w: 366, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #115e59; z-index: 8;">Patient Portal</div>`, t: 350, l: 430, w: 300, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #4b5563; line-height: 1.6; z-index: 9;">Access your medical records, schedule appointments, and message your doctor securely online 24/7.</div>`, t: 400, l: 430, w: 300, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #0d9488; text-align: center; z-index: 10;">1-800-APEX-MED | apexmedical.org</div>`, t: 900, l: 50, w: 716, h: 40}
            ]
        },
        {
            c: "Brochures", n: "University Prospectus", w: 816, h: 1056, bg: "#f8fafc",
            els: [
                {html: `<div style="background: #f8fafc; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #1e3a8a; border-radius: 0 0 400px 0; z-index: 2;"></div>`, t: 0, l: 0, w: 600, h: 400},
                {html: `<div style="font-family: Georgia, serif; font-size: 60px; color: #ffffff; z-index: 3;">Kingsbridge</div>`, t: 100, l: 50, w: 500, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; color: #bfdbfe; letter-spacing: 3px; z-index: 4;">UNIVERSITY</div>`, t: 180, l: 50, w: 500, h: 30},
                {html: `<div style="font-family: Georgia, serif; font-size: 32px; color: #1e3a8a; z-index: 5;">Shape Your Future.</div>`, t: 450, l: 50, w: 716, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #475569; line-height: 1.8; z-index: 6;">Join a community of scholars dedicated to excellence. With over 150 undergraduate programs and a world-class faculty, Kingsbridge offers an unparalleled educational experience in the heart of the city.</div>`, t: 510, l: 50, w: 400, h: 200},
                {html: `<div style="background: #bfdbfe; z-index: 7;"></div>`, t: 450, l: 500, w: 266, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #1e3a8a; padding: 20px; z-index: 8;">KEY DATES:<br><br>Fall Admissions:<br>Nov 1st<br><br>Financial Aid:<br>Jan 15th<br><br>Campus Tours:<br>Every Friday</div>`, t: 480, l: 520, w: 226, h: 300}
            ]
        },
        {
            c: "Brochures", n: "Eco Foundation", w: 816, h: 1056, bg: "#f0fdf4",
            els: [
                {html: `<div style="background: #f0fdf4; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #166534; z-index: 2;"></div>`, t: 0, l: 600, w: 216, h: 1056},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 80px; font-weight: 900; color: #15803d; line-height: 1; z-index: 3;">PROTECT<br>OUR<br>PLANET.</div>`, t: 150, l: 50, w: 500, h: 300},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #166534; z-index: 4;">Our Mission</div>`, t: 500, l: 50, w: 500, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #1f2937; line-height: 1.8; z-index: 5;">We are dedicated to preserving global biodiversity through community-led conservation projects, sustainable agriculture initiatives, and aggressive climate advocacy.</div>`, t: 550, l: 50, w: 450, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #dcfce7; transform: rotate(90deg); transform-origin: left top; white-space: nowrap; z-index: 6;">THE GLOBAL EARTH INITIATIVE</div>`, t: 100, l: 680, w: 900, h: 40},
                {html: `<div style="background: #15803d; padding: 15px; color: #fff; font-family: Arial, sans-serif; font-weight: bold; text-align: center; border-radius: 5px; z-index: 7;">DONATE TODAY</div>`, t: 800, l: 50, w: 250, h: 50}
            ]
        }
    ];

    function injectPack3Batch1() {
        const grid = document.getElementById('template-grid');
        const activeBtn = document.querySelector('.cat-btn.active');
        if (!grid || !activeBtn) return;
        const activeCat = activeBtn.innerText.trim();
        
        const existing = grid.querySelectorAll('.pack-3-batch-1');
        existing.forEach(el => el.remove());
        
        pack3Templates.filter(t => t.c === activeCat).forEach((t) => {
            const div = document.createElement('div');
            div.className = 'tp-item pack-3-batch-1';
            const scale = 100 / (t.w || 794); 
            let previewHTML = '';
            t.els.forEach(el => {
                let styleFix = (el.html.includes('z-index: 1') || el.h > 1000) ? "width: 100%; height: 100%;" : "";
                previewHTML += `<div style="position:absolute; top:${el.t}px; left:${el.l}px; width:${el.w}px; height:${el.h}px; z-index:1; ${styleFix}">${el.html}</div>`;
            });
            div.innerHTML = `<div class="template-preview" style="position:relative;"><div style="width: ${t.w}px; height: ${t.h}px; background: ${t.bg}; transform: scale(${scale}); transform-origin: 0 0; overflow: hidden; position: absolute; top: 0; left: 0; pointer-events: none;">${previewHTML}</div></div><div style="font-size:12px; margin-top:5px;">${t.n}</div>`;
            div.onclick = () => window.loadTemplate(t); 
            grid.appendChild(div);
        });
    }

    if (typeof window.showTemplateModal !== 'undefined') {
        const originalModal = window.showTemplateModal;
        window.showTemplateModal = function() { originalModal(); setTimeout(injectPack3Batch1, 150); };
    }
    document.addEventListener('click', (e) => {
        if(e.target && e.target.classList && e.target.classList.contains('cat-btn')) setTimeout(injectPack3Batch1, 150); 
    });

})();


(function initExpansionPack3Batch2() {

    const pack3Templates2 = [
        // --- CERTIFICATES (5) - Natively Landscape! ---
        {
            c: "Certificates", n: "Academic Excellence", w: 1056, h: 816, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 1056, h: 816},
                {html: `<div style="border: 15px solid #1e3a8a; z-index: 2;"></div>`, t: 30, l: 30, w: 996, h: 756},
                {html: `<div style="border: 2px solid #d4af37; z-index: 3;"></div>`, t: 50, l: 50, w: 956, h: 716},
                {html: `<div style="font-family: Georgia, serif; font-size: 50px; color: #1e3a8a; text-align: center; letter-spacing: 5px; z-index: 4;">CERTIFICATE OF EXCELLENCE</div>`, t: 150, l: 100, w: 856, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #555; text-align: center; font-style: italic; z-index: 5;">This is proudly presented to</div>`, t: 280, l: 100, w: 856, h: 30},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 80px; color: #111; text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 10px; z-index: 6;">Sarah Jenkins</div>`, t: 350, l: 200, w: 656, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #555; text-align: center; line-height: 1.8; z-index: 7;">In recognition of outstanding academic performance,<br>dedication, and leadership during the 2026 academic year.</div>`, t: 500, l: 200, w: 656, h: 80},
                {html: `<div style="background: #111; z-index: 8;"></div>`, t: 650, l: 200, w: 200, h: 2},
                {html: `<div style="background: #111; z-index: 9;"></div>`, t: 650, l: 656, w: 200, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; text-align: center; z-index: 10;">DATE</div>`, t: 660, l: 200, w: 200, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; text-align: center; z-index: 11;">SIGNATURE</div>`, t: 660, l: 656, w: 200, h: 30}
            ]
        },
        {
            c: "Certificates", n: "Modern Corporate", w: 1056, h: 816, bg: "#f8fafc",
            els: [
                {html: `<div style="background: #f8fafc; z-index: 1;"></div>`, t: 0, l: 0, w: 1056, h: 816},
                {html: `<div style="background: #0f172a; z-index: 2;"></div>`, t: 0, l: 0, w: 300, h: 816},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 70px; color: #e2e8f0; transform: rotate(-90deg); transform-origin: top left; white-space: nowrap; z-index: 3;">AWARD 2026</div>`, t: 800, l: 50, w: 800, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 60px; font-weight: 900; color: #0f172a; letter-spacing: -2px; z-index: 4;">CERTIFICATE</div>`, t: 150, l: 380, w: 600, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; color: #3b82f6; letter-spacing: 5px; z-index: 5;">OF APPRECIATION</div>`, t: 230, l: 380, w: 600, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #64748b; z-index: 6;">PROUDLY AWARDED TO:</div>`, t: 350, l: 380, w: 600, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 50px; font-weight: bold; color: #1e293b; z-index: 7;">Marcus Vance</div>`, t: 400, l: 380, w: 600, h: 70},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #475569; line-height: 1.6; z-index: 8;">For innovative contributions to the Q3 technology rollout and demonstrating exceptional leadership under pressure.</div>`, t: 500, l: 380, w: 550, h: 80},
                {html: `<div style="background: #cbd5e1; z-index: 9;"></div>`, t: 680, l: 380, w: 250, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #0f172a; z-index: 10;">DIRECTOR OF OPERATIONS</div>`, t: 690, l: 380, w: 250, h: 30}
            ]
        },
        {
            c: "Certificates", n: "Employee of the Month", w: 1056, h: 816, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 1056, h: 816},
                {html: `<div style="border: 5px solid #ca8a04; z-index: 2;"></div>`, t: 40, l: 40, w: 976, h: 736},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 40px; color: #ca8a04; text-align: center; letter-spacing: 10px; z-index: 3;">EMPLOYEE OF THE MONTH</div>`, t: 150, l: 100, w: 856, h: 60},
                {html: `<div style="background: #ca8a04; z-index: 4;"></div>`, t: 230, l: 428, w: 200, h: 4},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 60px; font-weight: bold; color: #111; text-align: center; z-index: 5;">Elena Rodriguez</div>`, t: 320, l: 100, w: 856, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #555; text-align: center; line-height: 1.8; z-index: 6;">Thank you for your tireless dedication, positive attitude,<br>and setting an incredible standard for the entire team in August 2026.</div>`, t: 450, l: 200, w: 656, h: 80},
                {html: `<div style="background: #ca8a04; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 7;"><div style="color: white; font-family: Arial; font-weight: bold; text-align: center; font-size: 24px;">#1</div></div>`, t: 600, l: 478, w: 100, h: 100}
            ]
        },
        {
            c: "Certificates", n: "Graduation Diploma", w: 1056, h: 816, bg: "#fdfbf7",
            els: [
                {html: `<div style="background: #fdfbf7; z-index: 1;"></div>`, t: 0, l: 0, w: 1056, h: 816},
                {html: `<div style="border: 1px solid #78716c; z-index: 2;"></div>`, t: 60, l: 60, w: 936, h: 696},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 24px; color: #444; text-align: center; letter-spacing: 5px; text-transform: uppercase; z-index: 3;">The Board of Trustees of</div>`, t: 160, l: 100, w: 856, h: 40},
                {html: `<div style="font-family: Georgia, serif; font-size: 40px; color: #1c1917; text-align: center; z-index: 4;">HARRISON UNIVERSITY</div>`, t: 210, l: 100, w: 856, h: 50},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 18px; color: #444; text-align: center; font-style: italic; z-index: 5;">hereby confers upon</div>`, t: 300, l: 100, w: 856, h: 30},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 60px; color: #111; text-align: center; z-index: 6;">Thomas Arlington</div>`, t: 360, l: 100, w: 856, h: 80},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 18px; color: #444; text-align: center; line-height: 1.8; z-index: 7;">the degree of Bachelor of Arts in Graphic Design<br>with all the rights, honors, and privileges thereunto appertaining.</div>`, t: 480, l: 150, w: 756, h: 80},
                {html: `<div style="background: #111; z-index: 8;"></div>`, t: 680, l: 400, w: 256, h: 1},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; text-align: center; z-index: 9;">PRESIDENT OF THE UNIVERSITY</div>`, t: 690, l: 400, w: 256, h: 30}
            ]
        },
        {
            c: "Certificates", n: "Kids Superstar Award", w: 1056, h: 816, bg: "#ffedd5",
            els: [
                {html: `<div style="background: #ffedd5; z-index: 1;"></div>`, t: 0, l: 0, w: 1056, h: 816},
                {html: `<div style="border: 8px dashed #f97316; z-index: 2;"></div>`, t: 30, l: 30, w: 996, h: 756},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 70px; color: #ea580c; text-align: center; text-shadow: 4px 4px 0px #fde047; z-index: 3;">SUPERSTAR AWARD!</div>`, t: 120, l: 100, w: 856, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #431407; text-align: center; z-index: 4;">THIS GOES TO:</div>`, t: 280, l: 100, w: 856, h: 40},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 60px; color: #3b82f6; text-align: center; border-bottom: 5px solid #3b82f6; padding-bottom: 10px; z-index: 5;">CHLOE SMITH</div>`, t: 350, l: 250, w: 556, h: 90},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #431407; text-align: center; line-height: 1.6; z-index: 6;">For being an awesome listener, helping others,<br>and bringing a big smile to class every day!</div>`, t: 500, l: 150, w: 756, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #ea580c; text-align: center; z-index: 7;">Great Job! - Mr. Davis</div>`, t: 650, l: 150, w: 756, h: 40}
            ]
        },

        // --- MENUS (3) ---
        {
            c: "Menus", n: "Rustic Italian", w: 816, h: 1056, bg: "#fffbeb",
            els: [
                {html: `<div style="background: #fffbeb; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border-top: 4px solid #78350f; border-bottom: 4px solid #78350f; z-index: 2;"></div>`, t: 80, l: 80, w: 656, h: 150},
                {html: `<div style="font-family: Georgia, serif; font-size: 60px; color: #78350f; text-align: center; z-index: 3;">Trattoria Roma</div>`, t: 100, l: 80, w: 656, h: 70},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #b45309; text-align: center; letter-spacing: 4px; z-index: 4;">AUTHENTIC FAMILY RECIPES</div>`, t: 180, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Georgia, serif; font-size: 28px; color: #78350f; text-align: center; border-bottom: 1px solid #d44400; padding-bottom: 10px; z-index: 5;">ANTIPASTI</div>`, t: 300, l: 150, w: 516, h: 50},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #451a03; z-index: 6;">Bruschetta Classico <span style="float: right;">$12</span></div>`, t: 380, l: 150, w: 516, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #78350f; font-style: italic; z-index: 7;">Toasted artisan bread, vine tomatoes, fresh basil, garlic.</div>`, t: 410, l: 150, w: 516, h: 30},
                {html: `<div style="font-family: Georgia, serif; font-size: 28px; color: #78350f; text-align: center; border-bottom: 1px solid #d44400; padding-bottom: 10px; z-index: 8;">SECONDI</div>`, t: 500, l: 150, w: 516, h: 50},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #451a03; z-index: 9;">Linguine alle Vongole <span style="float: right;">$24</span></div>`, t: 580, l: 150, w: 516, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #78350f; font-style: italic; z-index: 10;">Fresh clams, white wine sauce, parsley, chili flakes.</div>`, t: 610, l: 150, w: 516, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #451a03; z-index: 11;">Vitello Tonnato <span style="float: right;">$28</span></div>`, t: 670, l: 150, w: 516, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #78350f; font-style: italic; z-index: 12;">Veal scaloppine, lemon caper sauce, roasted potatoes.</div>`, t: 700, l: 150, w: 516, h: 30}
            ]
        },
        {
            c: "Menus", n: "Cocktail Lounge", w: 816, h: 1056, bg: "#020617",
            els: [
                {html: `<div style="background: #020617; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 70px; font-weight: 900; color: #ffffff; text-align: center; letter-spacing: 15px; text-shadow: 0 0 20px #e11d48; z-index: 2;">NEON</div>`, t: 100, l: 50, w: 716, h: 90},
                {html: `<div style="font-family: 'Arial', sans-serif; font-size: 20px; color: #fb7185; text-align: center; letter-spacing: 5px; z-index: 3;">COCKTAILS & SPIRITS</div>`, t: 200, l: 50, w: 716, h: 30},
                {html: `<div style="background: #e11d48; z-index: 4;"></div>`, t: 260, l: 358, w: 100, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 2px; z-index: 5;">SIGNATURES</div>`, t: 350, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #94a3b8; line-height: 2; z-index: 6;"><b>MIDNIGHT RIDER</b> ............................... $16<br>Bourbon, Amaro, Bitters, Smoked Orange<br><br><b>VELVET CRUSH</b> .................................. $15<br>Gin, Blackberry, Lemon, Egg White<br><br><b>ELECTRIC DAISY</b> ................................ $14<br>Tequila, Jalapeno, Lime, Agave</div>`, t: 420, l: 100, w: 616, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 2px; z-index: 7;">CLASSICS</div>`, t: 700, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #94a3b8; line-height: 2; z-index: 8;"><b>OLD FASHIONED</b> ............................... $14<br><b>NEGRONI</b> ....................................... $14<br><b>MARTINI</b> ....................................... $15</div>`, t: 770, l: 100, w: 616, h: 100}
            ]
        },
        {
            c: "Menus", n: "Burger Joint", w: 816, h: 1056, bg: "#fee2e2",
            els: [
                {html: `<div style="background: #fee2e2; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #ef4444; transform: rotate(-2deg); z-index: 2;"></div>`, t: 50, l: 50, w: 716, h: 150},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 70px; color: #ffffff; text-align: center; transform: rotate(-2deg); text-shadow: 3px 3px 0px #991b1b; z-index: 3;">SMASH CITY</div>`, t: 75, l: 50, w: 716, h: 90},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 30px; color: #1f2937; background: #fde047; padding: 10px; display: inline-block; transform: rotate(1deg); z-index: 4;">THE BURGERS</div>`, t: 280, l: 80, w: 300, h: 60},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #ef4444; z-index: 5;">THE CLASSIC SMASH ........... $8</div>`, t: 380, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #4b5563; z-index: 6;">Double patty, American cheese, house sauce, pickles.</div>`, t: 410, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #ef4444; z-index: 7;">SPICY JALAPENO ............. $9</div>`, t: 470, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #4b5563; z-index: 8;">Double patty, pepper jack, crispy jalapenos, spicy mayo.</div>`, t: 500, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 30px; color: #1f2937; background: #fde047; padding: 10px; display: inline-block; transform: rotate(-1deg); z-index: 9;">THE SIDES</div>`, t: 600, l: 80, w: 250, h: 60},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #1f2937; line-height: 2; z-index: 10;">FRENCH FRIES ................. $4<br>ONION RINGS .................. $5<br>CHEESE CURDS ................. $6</div>`, t: 700, l: 80, w: 656, h: 150}
            ]
        }
    ];

    function injectPack3Batch2() {
        const grid = document.getElementById('template-grid');
        const activeBtn = document.querySelector('.cat-btn.active');
        if (!grid || !activeBtn) return;
        const activeCat = activeBtn.innerText.trim();
        
        const existing = grid.querySelectorAll('.pack-3-batch-2');
        existing.forEach(el => el.remove());
        
        pack3Templates2.filter(t => t.c === activeCat).forEach((t) => {
            const div = document.createElement('div');
            div.className = 'tp-item pack-3-batch-2';
            
            // Adjust scale for landscape thumbnails (Certificates)
            const scale = 100 / (t.w || 794); 
            
            let previewHTML = '';
            t.els.forEach(el => {
                let styleFix = (el.html.includes('z-index: 1') || el.h > 1000 || el.w > 1000) ? "width: 100%; height: 100%;" : "";
                previewHTML += `<div style="position:absolute; top:${el.t}px; left:${el.l}px; width:${el.w}px; height:${el.h}px; z-index:1; ${styleFix}">${el.html}</div>`;
            });
            
            div.innerHTML = `<div class="template-preview" style="position:relative; width: 100px; height: 141px; display: flex; align-items: center; justify-content: center; overflow: hidden;"><div style="width: ${t.w}px; height: ${t.h}px; background: ${t.bg}; transform: scale(${scale}); transform-origin: center center; position: absolute; pointer-events: none;">${previewHTML}</div></div><div style="font-size:12px; margin-top:5px;">${t.n}</div>`;
            div.onclick = () => window.loadTemplate(t); 
            grid.appendChild(div);
        });
    }

    if (typeof window.showTemplateModal !== 'undefined') {
        const originalModal = window.showTemplateModal;
        window.showTemplateModal = function() { originalModal(); setTimeout(injectPack3Batch2, 150); };
    }
    document.addEventListener('click', (e) => {
        if(e.target && e.target.classList && e.target.classList.contains('cat-btn')) setTimeout(injectPack3Batch2, 150); 
    });

})();


(function initExpansionPack3Batch3() {

    const pack3Templates3 = [
        // --- CALENDARS (6) ---
        {
            c: "Calendars", n: "Minimalist Wall", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 120px; color: #111; letter-spacing: -5px; z-index: 2;">OCTOBER</div>`, t: 80, l: 50, w: 716, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 40px; font-weight: bold; color: #ef4444; z-index: 3;">2026</div>`, t: 210, l: 60, w: 200, h: 50},
                {html: `<div style="border-top: 4px solid #111; z-index: 4;"></div>`, t: 300, l: 50, w: 716, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #888; letter-spacing: 20px; z-index: 5;">SUN MON TUE WED THU FRI SAT</div>`, t: 320, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; color: #111; line-height: 3; word-spacing: 50px; z-index: 6;">. 1 2 3 4 5 6<br>7 8 9 10 11 12 13<br>14 15 16 17 18 19 20<br>21 22 23 24 25 26 27<br>28 29 30 31 . . .</div>`, t: 380, l: 50, w: 716, h: 500},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #555; z-index: 7;"><b>NOTES:</b><br>10/12 - Project Deadline<br>10/31 - Halloween</div>`, t: 850, l: 50, w: 716, h: 100}
            ]
        },
        {
            c: "Calendars", n: "Corporate Desk", w: 816, h: 1056, bg: "#f8fafc",
            els: [
                {html: `<div style="background: #f8fafc; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #0f172a; border-radius: 0 0 20px 20px; z-index: 2;"></div>`, t: 0, l: 50, w: 716, h: 200},
                {html: `<div style="font-family: Georgia, serif; font-size: 80px; color: #ffffff; text-align: center; z-index: 3;">JANUARY</div>`, t: 50, l: 50, w: 716, h: 100},
                {html: `<div style="background: #38bdf8; z-index: 4;"></div>`, t: 150, l: 308, w: 200, h: 4},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #64748b; letter-spacing: 15px; text-align: center; z-index: 5;">S M T W T F S</div>`, t: 250, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #0f172a; line-height: 2.5; word-spacing: 40px; text-align: center; z-index: 6;">- - 1 2 3 4 5<br>6 7 8 9 10 11 12<br>13 14 15 16 17 18 19<br>20 21 22 23 24 25 26<br>27 28 29 30 31 - -</div>`, t: 300, l: 50, w: 716, h: 400},
                {html: `<div style="border: 2px dashed #cbd5e1; padding: 20px; z-index: 7;"></div>`, t: 750, l: 100, w: 616, h: 200},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #0f172a; z-index: 8;">MONTHLY GOALS</div>`, t: 770, l: 120, w: 576, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #475569; line-height: 2; z-index: 9;">[ ] Finalize Q1 Budget<br>[ ] Client Onboarding<br>[ ] Marketing Review</div>`, t: 820, l: 120, w: 576, h: 100}
            ]
        },
        {
            c: "Calendars", n: "Botanical Planner", w: 816, h: 1056, bg: "#f0fdf4",
            els: [
                {html: `<div style="background: #f0fdf4; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #bbf7d0; border-radius: 400px; z-index: 2;"></div>`, t: -100, l: 500, w: 400, h: 400},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 90px; color: #166534; font-style: italic; z-index: 3;">March</div>`, t: 100, l: 80, w: 400, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; color: #4ade80; letter-spacing: 5px; z-index: 4;">SPRING BLOOMS</div>`, t: 200, l: 80, w: 400, h: 30},
                {html: `<div style="border-top: 1px solid #166534; z-index: 5;"></div>`, t: 300, l: 80, w: 656, h: 2},
                {html: `<table style="width: 100%; height: 100%; text-align: center; font-family: Georgia, serif; font-size: 22px; color: #166534; table-layout: fixed; border-collapse: collapse; z-index: 6;">
                    <tr style="font-weight: bold; color: #14532d; font-size: 18px;"><td>S</td><td>M</td><td>T</td><td>W</td><td>T</td><td>F</td><td>S</td></tr>
                    <tr><td></td><td></td><td></td><td>1</td><td>2</td><td>3</td><td>4</td></tr>
                    <tr><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td></tr>
                    <tr><td>12</td><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td></tr>
                    <tr><td>19</td><td>20</td><td>21</td><td>22</td><td>23</td><td>24</td><td>25</td></tr>
                    <tr><td>26</td><td>27</td><td>28</td><td>29</td><td>30</td><td>31</td><td></td></tr>
                </table>`, t: 330, l: 80, w: 656, h: 450},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 24px; color: #166534; font-style: italic; text-align: center; z-index: 8;">"To plant a garden is to believe in tomorrow."</div>`, t: 880, l: 80, w: 656, h: 50}
            ]
        },
        {
            c: "Calendars", n: "Fitness Tracker", w: 816, h: 1056, bg: "#18181b",
            els: [
                {html: `<div style="background: #18181b; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border: 4px solid #e11d48; z-index: 2;"></div>`, t: 30, l: 30, w: 756, h: 996},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 70px; color: #ffffff; text-align: center; letter-spacing: 5px; z-index: 3;">NOVEMBER</div>`, t: 80, l: 50, w: 716, h: 80},
                {html: `<div style="background: #e11d48; color: #fff; font-family: Arial, sans-serif; font-weight: bold; font-size: 20px; text-align: center; padding: 10px; z-index: 4;">TRAINING BLOCK 04</div>`, t: 180, l: 258, w: 300, h: 45},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #a1a1aa; word-spacing: 50px; text-align: center; z-index: 5;">MON TUE WED THU FRI SAT SUN</div>`, t: 280, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 20px; color: #f4f4f5; line-height: 3; word-spacing: 65px; text-align: center; z-index: 6;">1 2 3 4 5 6 7<br>8 9 10 11 12 13 14<br>15 16 17 18 19 20 21<br>22 23 24 25 26 27 28<br>29 30 - - - - -</div>`, t: 330, l: 50, w: 716, h: 400},
                {html: `<div style="border-top: 2px dashed #3f3f46; z-index: 7;"></div>`, t: 750, l: 50, w: 716, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #e11d48; z-index: 8;">HABIT TRACKER</div>`, t: 780, l: 80, w: 300, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #a1a1aa; line-height: 2; z-index: 9;">[ ] Gallon of Water<br>[ ] 10k Steps<br>[ ] Protein Goal<br>[ ] 8 Hours Sleep</div>`, t: 820, l: 80, w: 300, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #e11d48; z-index: 10;">PERSONAL RECORDS</div>`, t: 780, l: 450, w: 300, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #a1a1aa; line-height: 2; z-index: 11;">Squat: _______<br>Bench: _______<br>Deadlift: _____</div>`, t: 820, l: 450, w: 300, h: 100}
            ]
        },
        {
            c: "Calendars", n: "Family Organizer", w: 816, h: 1056, bg: "#fef08a",
            els: [
                {html: `<div style="background: #fef08a; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #fff; border-radius: 20px; box-shadow: 5px 5px 0px #f59e0b; z-index: 2;"></div>`, t: 40, l: 40, w: 736, h: 976},
                {html: `<div style="font-family: 'Comic Sans MS', 'Arial Black', sans-serif; font-size: 60px; color: #d97706; text-align: center; z-index: 3;">DECEMBER</div>`, t: 80, l: 50, w: 716, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #fff; background: #3b82f6; border-radius: 10px; padding: 10px; text-align: center; z-index: 4;">MOM</div>`, t: 200, l: 80, w: 180, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #fff; background: #ef4444; border-radius: 10px; padding: 10px; text-align: center; z-index: 5;">DAD</div>`, t: 200, l: 318, w: 180, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #fff; background: #10b981; border-radius: 10px; padding: 10px; text-align: center; z-index: 6;">KIDS</div>`, t: 200, l: 556, w: 180, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #444; line-height: 2.5; z-index: 7;">1st - Yoga<br>5th - Book Club<br>12th - Dentist<br>24th - Bake Sale</div>`, t: 260, l: 80, w: 180, h: 200},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #444; line-height: 2.5; z-index: 8;">3rd - Golf<br>10th - Oil Change<br>15th - PTA Meeting</div>`, t: 260, l: 318, w: 180, h: 200},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #444; line-height: 2.5; z-index: 9;">4th - Soccer<br>8th - Field Trip<br>20th - Half Day<br>25th - CHRISTMAS!</div>`, t: 260, l: 556, w: 180, h: 200},
                {html: `<div style="border-top: 4px dashed #fcd34d; z-index: 10;"></div>`, t: 550, l: 80, w: 656, h: 2},
                {html: `<div style="font-family: 'Comic Sans MS', sans-serif; font-size: 30px; color: #d97706; text-align: center; z-index: 11;">CHORE CHART</div>`, t: 580, l: 50, w: 716, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #444; line-height: 2; text-align: center; z-index: 12;">[ ] Take out Trash &nbsp;&nbsp;&nbsp; [ ] Feed Dog &nbsp;&nbsp;&nbsp; [ ] Wash Dishes<br>[ ] Clean Rooms &nbsp;&nbsp;&nbsp; [ ] Vacuum &nbsp;&nbsp;&nbsp; [ ] Water Plants</div>`, t: 650, l: 50, w: 716, h: 80}
            ]
        },
        {
            c: "Calendars", n: "Year-at-a-Glance", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: Georgia, serif; font-size: 60px; color: #111; text-align: center; letter-spacing: 5px; z-index: 2;">2026</div>`, t: 60, l: 50, w: 716, h: 80},
                {html: `<div style="background: #111; z-index: 3;"></div>`, t: 150, l: 308, w: 200, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #333; column-count: 3; column-gap: 50px; line-height: 1.8; z-index: 4;">JANUARY<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>FEBRUARY<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>MARCH<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>APRIL<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>MAY<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>JUNE<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span></div>`, t: 200, l: 80, w: 656, h: 350},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #333; column-count: 3; column-gap: 50px; line-height: 1.8; z-index: 5;">JULY<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>AUGUST<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>SEPTEMBER<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>OCTOBER<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>NOVEMBER<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span><br><br>DECEMBER<br><span style="font-weight:normal; font-size:12px; color:#777;">S M T W T F S<br>  1 2 3 4 5 6<br>7 8 9 ...</span></div>`, t: 580, l: 80, w: 656, h: 350}
            ]
        },

        // --- LETTERHEADS (5) ---
        {
            c: "Letterheads", n: "Executive Corporate", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #1e3a8a; z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 80},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 30px; color: #ffffff; z-index: 3;">NEXUS HOLDINGS</div>`, t: 20, l: 50, w: 400, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #bfdbfe; text-align: right; z-index: 4;">1-800-555-0199<br>contact@nexus.com</div>`, t: 20, l: 566, w: 200, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #333; z-index: 5;">DATE: [Insert Date]</div>`, t: 150, l: 80, w: 300, h: 20},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; z-index: 6;">TO:<br>[Recipient Name]<br>[Title/Company]<br>[Address]</div>`, t: 200, l: 80, w: 300, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #444; line-height: 1.8; z-index: 7;">Dear [Name],<br><br>Begin typing your formal letter here. This template is designed for official corporate communications, proposals, and memorandums.<br><br>Sincerely,<br><br><br><b>[Your Name]</b><br>[Your Title]</div>`, t: 350, l: 80, w: 656, h: 400},
                {html: `<div style="background: #e2e8f0; z-index: 8;"></div>`, t: 950, l: 80, w: 656, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 12px; color: #94a3b8; text-align: center; z-index: 9;">100 Business Parkway, Suite 500, Metropolis, NY 10001 | nexus-holdings.com</div>`, t: 970, l: 80, w: 656, h: 20}
            ]
        },
        {
            c: "Letterheads", n: "Creative Agency", w: 816, h: 1056, bg: "#fafafa",
            els: [
                {html: `<div style="background: #fafafa; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #facc15; border-radius: 0 0 100px 0; z-index: 2;"></div>`, t: 0, l: 0, w: 150, h: 150},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 40px; color: #111; z-index: 3;">STUDIO.</div>`, t: 50, l: 180, w: 400, h: 50},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #111; z-index: 4;">DATE: </div>`, t: 150, l: 180, w: 300, h: 20},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.8; z-index: 5;">Hello there,<br><br>Start your creative brief, pitch, or welcome letter here. Use this layout to show off your brand's modern, energetic personality.</div>`, t: 250, l: 180, w: 556, h: 400},
                {html: `<div style="background: #111; border-radius: 100px 0 0 0; z-index: 6;"></div>`, t: 906, l: 666, w: 150, h: 150},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color: #777; z-index: 7;">HELLO@STUDIO.COM<br>+1 800 123 4567<br>12 ARTS DISTRICT, LA</div>`, t: 950, l: 180, w: 300, h: 60}
            ]
        },
        {
            c: "Letterheads", n: "Medical Clinic", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="border-left: 10px solid #0d9488; z-index: 2;"></div>`, t: 50, l: 50, w: 10, h: 956},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 36px; font-weight: bold; color: #0d9488; z-index: 3;">Apex Medical Care</div>`, t: 80, l: 80, w: 500, h: 50},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #64748b; z-index: 4;">500 Health Way, Wellness City, ST 12345<br>Phone: (555) 123-4567 | Fax: (555) 123-4568</div>`, t: 130, l: 80, w: 500, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; z-index: 5;"><b>Date:</b><br><b>Patient Name:</b><br><b>DOB:</b></div>`, t: 220, l: 80, w: 300, h: 80},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.8; z-index: 6;">To Whom It May Concern,<br><br>Type medical notes, referrals, or official clinic documentation here.</div>`, t: 350, l: 80, w: 656, h: 400},
                {html: `<div style="border-top: 1px solid #cbd5e1; z-index: 7;"></div>`, t: 850, l: 80, w: 300, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #0f172a; font-weight: bold; z-index: 8;">Dr. Jane Smith, MD<br>Chief Medical Officer</div>`, t: 860, l: 80, w: 300, h: 40}
            ]
        },
        {
            c: "Letterheads", n: "Law Firm", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 40px; color: #1e293b; text-align: center; z-index: 2;">HARRINGTON & VANCE</div>`, t: 80, l: 50, w: 716, h: 50},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 12px; color: #ca8a04; letter-spacing: 3px; text-align: center; z-index: 3;">ATTORNEYS AT LAW</div>`, t: 130, l: 50, w: 716, h: 20},
                {html: `<div style="background: #1e293b; z-index: 4;"></div>`, t: 170, l: 150, w: 516, h: 1},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 16px; color: #111; line-height: 2; z-index: 5;">[Date]<br><br><b>VIA CERTIFIED MAIL</b><br><br>[Recipient Name]<br>[Address]<br><br><b>RE: [Case/Subject Matter]</b><br><br>Dear [Name],<br><br>Begin legal correspondence here.</div>`, t: 220, l: 100, w: 616, h: 400},
                {html: `<div style="background: #1e293b; z-index: 6;"></div>`, t: 920, l: 150, w: 516, h: 1},
                {html: `<div style="font-family: 'Times New Roman', serif; font-size: 12px; color: #475569; text-align: center; z-index: 7;">400 Legal Plaza, Suite 200, Justice City, ST 99999<br>Ph: (555) 987-6543 | Fax: (555) 987-6544 | www.harringtonvance.law</div>`, t: 940, l: 100, w: 616, h: 40}
            ]
        },
        {
            c: "Letterheads", n: "Tech Startup", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: linear-gradient(90deg, #8b5cf6, #ec4899); z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 10},
                {html: `<div style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #111; z-index: 3;">{'dev_corp'}</div>`, t: 60, l: 60, w: 300, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.8; z-index: 4;">Date: [Date]<br><br>Hi [Name],<br><br>Type your proposal, offer letter, or internal memo here. Clean, crisp, and code-ready.</div>`, t: 200, l: 60, w: 696, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #a1a1aa; text-align: right; z-index: 5;">hello@devcorp.io<br>www.devcorp.io<br>@devcorp</div>`, t: 60, l: 556, w: 200, h: 60}
            ]
        }
    ];

    function injectPack3Batch3() {
        const grid = document.getElementById('template-grid');
        const activeBtn = document.querySelector('.cat-btn.active');
        if (!grid || !activeBtn) return;
        const activeCat = activeBtn.innerText.trim();
        
        const existing = grid.querySelectorAll('.pack-3-batch-3');
        existing.forEach(el => el.remove());
        
        pack3Templates3.filter(t => t.c === activeCat).forEach((t) => {
            const div = document.createElement('div');
            div.className = 'tp-item pack-3-batch-3';
            
            const scale = 100 / (t.w || 794); 
            
            let previewHTML = '';
            t.els.forEach(el => {
                let styleFix = (el.html.includes('z-index: 1') || el.h > 1000) ? "width: 100%; height: 100%;" : "";
                previewHTML += `<div style="position:absolute; top:${el.t}px; left:${el.l}px; width:${el.w}px; height:${el.h}px; z-index:1; ${styleFix}">${el.html}</div>`;
            });
            
            div.innerHTML = `<div class="template-preview" style="position:relative;"><div style="width: ${t.w}px; height: ${t.h}px; background: ${t.bg}; transform: scale(${scale}); transform-origin: 0 0; overflow: hidden; position: absolute; top: 0; left: 0; pointer-events: none;">${previewHTML}</div></div><div style="font-size:12px; margin-top:5px;">${t.n}</div>`;
            div.onclick = () => window.loadTemplate(t); 
            grid.appendChild(div);
        });
    }

    if (typeof window.showTemplateModal !== 'undefined') {
        const originalModal = window.showTemplateModal;
        window.showTemplateModal = function() { originalModal(); setTimeout(injectPack3Batch3, 150); };
    }
    document.addEventListener('click', (e) => {
        if(e.target && e.target.classList && e.target.classList.contains('cat-btn')) setTimeout(injectPack3Batch3, 150); 
    });

})();


(function initExpansionPack3Batch4() {

    const pack3Templates4 = [
        // --- NEWSLETTERS (4) ---
        {
            c: "Newsletters", n: "Tech Update", w: 816, h: 1056, bg: "#0f172a",
            els: [
                {html: `<div style="background: #0f172a; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Courier New', monospace; font-size: 60px; font-weight: bold; color: #38bdf8; z-index: 2;">DEV.WEEKLY</div>`, t: 60, l: 50, w: 716, h: 80},
                {html: `<div style="background: #38bdf8; z-index: 3;"></div>`, t: 150, l: 50, w: 716, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #94a3b8; text-transform: uppercase; z-index: 4;">Issue #128 | October 2026 | Read Time: 5 Min</div>`, t: 160, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 32px; font-weight: bold; color: #f8fafc; z-index: 5;">The Rise of Edge Computing</div>`, t: 230, l: 50, w: 716, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #cbd5e1; line-height: 1.8; column-count: 2; column-gap: 40px; z-index: 6;">Cloud computing is shifting. Developers are moving logic closer to the user to reduce latency and save costs. This week, we look at the top frameworks making edge deployment seamless.<br><br>Also in this issue: new CSS features dropping in modern browsers, and how to optimize your React bundles for 2027.</div>`, t: 290, l: 50, w: 716, h: 250},
                {html: `<div style="background: #1e293b; border-radius: 8px; padding: 20px; z-index: 7;"></div>`, t: 560, l: 50, w: 716, h: 320},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #38bdf8; z-index: 8;">Top Links</div>`, t: 590, l: 80, w: 656, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #f8fafc; line-height: 2.5; z-index: 9;">🔗 10 Tips for Better APIs<br>🔗 The State of JavaScript 2026<br>🔗 Understanding WebAssembly<br>🔗 Postgres Scaling Guide</div>`, t: 640, l: 80, w: 656, h: 200},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #64748b; text-align: center; z-index: 10;">Unsubscribe | View in Browser</div>`, t: 950, l: 50, w: 716, h: 30}
            ]
        },
        {
            c: "Newsletters", n: "Real Estate Market", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="background: #0c4a6e; z-index: 2;"></div>`, t: 0, l: 0, w: 816, h: 150},
                {html: `<div style="font-family: Georgia, serif; font-size: 50px; color: #ffffff; text-align: center; z-index: 3;">THE MARKET REPORT</div>`, t: 40, l: 50, w: 716, h: 60},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #bae6fd; text-align: center; letter-spacing: 2px; z-index: 4;">MONTHLY REAL ESTATE INSIGHTS</div>`, t: 100, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; color: #0f172a; text-align: center; z-index: 5;">Interest Rates Drop: What It Means For You</div>`, t: 200, l: 50, w: 716, h: 40},
                {html: `<div style="font-family: Georgia, serif; font-size: 16px; color: #475569; line-height: 1.8; text-align: center; z-index: 6;">For the first time in 14 months, the central bank has lowered rates, creating a unique window of opportunity for both buyers and sellers in the suburban market.</div>`, t: 260, l: 100, w: 616, h: 100},
                {html: `<div style="background: #f1f5f9; border: 1px solid #cbd5e1; z-index: 7;"></div>`, t: 400, l: 50, w: 340, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #0c4a6e; text-align: center; z-index: 8;">Current Avg Price</div>`, t: 430, l: 70, w: 300, h: 30},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 50px; color: #10b981; text-align: center; z-index: 9;">$450K</div>`, t: 500, l: 70, w: 300, h: 80},
                {html: `<div style="background: #f1f5f9; border: 1px solid #cbd5e1; z-index: 10;"></div>`, t: 400, l: 426, w: 340, h: 400},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #0c4a6e; text-align: center; z-index: 11;">Featured Listing</div>`, t: 430, l: 446, w: 300, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #475569; text-align: center; line-height: 1.6; z-index: 12;"><b>123 Maple Street</b><br>4 Bed | 3 Bath | 2,500 sqft<br><br>A gorgeous newly renovated property in the heart of downtown.</div>`, t: 500, l: 446, w: 300, h: 150}
            ]
        },
        {
            c: "Newsletters", n: "Community Update", w: 816, h: 1056, bg: "#fff7ed",
            els: [
                {html: `<div style="background: #fff7ed; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: 'Comic Sans MS', sans-serif; font-size: 60px; color: #ea580c; text-align: center; z-index: 2;">Valley News</div>`, t: 60, l: 50, w: 716, h: 80},
                {html: `<div style="border-top: 3px dashed #fdba74; z-index: 3;"></div>`, t: 150, l: 100, w: 616, h: 2},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #9a3412; z-index: 4;">Spring Festival Success!</div>`, t: 180, l: 100, w: 616, h: 40},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #431407; line-height: 1.8; z-index: 5;">Thank you to everyone who came out to the Valley Spring Festival this weekend. We raised over $5,000 for the local animal shelter and had record attendance at the pie-baking contest.</div>`, t: 230, l: 100, w: 616, h: 100},
                {html: `<div style="background: #ffedd5; padding: 20px; border-radius: 10px; z-index: 6;"></div>`, t: 360, l: 100, w: 616, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #ea580c; z-index: 7;">Upcoming Town Events</div>`, t: 390, l: 130, w: 556, h: 30},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #7c2d12; line-height: 2; z-index: 8;">• <b>May 10:</b> City Council Meeting (7 PM)<br>• <b>May 15:</b> Farmer's Market Opens<br>• <b>May 22:</b> Neighborhood Watch Training</div>`, t: 440, l: 130, w: 556, h: 120}
            ]
        },
        {
            c: "Newsletters", n: "Modern Minimal", w: 816, h: 1056, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 816, h: 1056},
                {html: `<div style="font-family: Helvetica, sans-serif; font-size: 80px; font-weight: 900; color: #111; letter-spacing: -3px; z-index: 2;">FOCUS.</div>`, t: 50, l: 50, w: 716, h: 90},
                {html: `<div style="background: #111; z-index: 3;"></div>`, t: 150, l: 50, w: 716, h: 10},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #777; display: flex; justify-content: space-between; z-index: 4;"><span>VOL. 04</span><span>THE DESIGN ISSUE</span></div>`, t: 180, l: 50, w: 716, h: 30},
                {html: `<div style="font-family: Georgia, serif; font-size: 40px; color: #111; line-height: 1.2; z-index: 5;">Why less is almost always better than more.</div>`, t: 250, l: 50, w: 500, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #555; line-height: 1.8; column-count: 2; column-gap: 40px; z-index: 6;">In a world cluttered with notifications, pop-ups, and infinite scrolling, the most valuable commodity is human attention. <br><br>Minimalism isn't just an aesthetic choice anymore; it is a functional requirement for building products that people actually want to use. We strip away the unnecessary so the essential can speak.</div>`, t: 380, l: 50, w: 716, h: 250},
                {html: `<div style="border: 1px solid #111; padding: 30px; text-align: center; z-index: 7;"></div>`, t: 700, l: 200, w: 416, h: 150},
                {html: `<div style="font-family: Georgia, serif; font-size: 20px; font-style: italic; color: #111; z-index: 8;">"Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away."</div>`, t: 740, l: 230, w: 356, h: 80}
            ]
        },

        // --- BUSINESS CARDS (5) ---
        // Generates 10 cards per page (Avery style 10-up layout)
        {
            c: "Business Cards", n: "Clean Corporate", w: 816, h: 1056, bg: "#ffffff",
            els: Array.from({length: 5}, (_, i) => [
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 25px; background: #ffffff; box-sizing: border-box;"><b style="font-size: 20px; color: #0f172a; font-family: Arial, sans-serif;">Alex Chen</b><br><span style="font-size: 12px; color: #0284c7; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase;">Operations Director</span><div style="margin-top: 45px; font-size: 12px; color: #475569; font-family: Arial, sans-serif; line-height: 1.6;">P: (555) 987-6543<br>E: alex@nexus.com<br>W: www.nexus.com</div></div>`, t: 40 + (i*195), l: 60, w: 330, h: 185},
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 25px; background: #ffffff; box-sizing: border-box;"><b style="font-size: 20px; color: #0f172a; font-family: Arial, sans-serif;">Alex Chen</b><br><span style="font-size: 12px; color: #0284c7; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase;">Operations Director</span><div style="margin-top: 45px; font-size: 12px; color: #475569; font-family: Arial, sans-serif; line-height: 1.6;">P: (555) 987-6543<br>E: alex@nexus.com<br>W: www.nexus.com</div></div>`, t: 40 + (i*195), l: 426, w: 330, h: 185}
            ]).flat()
        },
        {
            c: "Business Cards", n: "Dark Executive", w: 816, h: 1056, bg: "#ffffff",
            els: Array.from({length: 5}, (_, i) => [
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 25px; background: #111827; box-sizing: border-box;"><b style="font-size: 20px; color: #d4af37; font-family: Georgia, serif;">ELEANOR VANCE</b><br><span style="font-size: 11px; color: #9ca3af; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 2px;">Managing Partner</span><div style="margin-top: 45px; font-size: 11px; color: #d1d5db; font-family: Arial, sans-serif; line-height: 1.8;">123 Executive Plaza, NY 10001<br>T: 555-0199 | E: evance@firm.com</div></div>`, t: 40 + (i*195), l: 60, w: 330, h: 185},
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 25px; background: #111827; box-sizing: border-box;"><b style="font-size: 20px; color: #d4af37; font-family: Georgia, serif;">ELEANOR VANCE</b><br><span style="font-size: 11px; color: #9ca3af; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 2px;">Managing Partner</span><div style="margin-top: 45px; font-size: 11px; color: #d1d5db; font-family: Arial, sans-serif; line-height: 1.8;">123 Executive Plaza, NY 10001<br>T: 555-0199 | E: evance@firm.com</div></div>`, t: 40 + (i*195), l: 426, w: 330, h: 185}
            ]).flat()
        },
        {
            c: "Business Cards", n: "Creative Gradient", w: 816, h: 1056, bg: "#ffffff",
            els: Array.from({length: 5}, (_, i) => [
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 25px; background: linear-gradient(135deg, #8b5cf6, #ec4899); box-sizing: border-box;"><b style="font-size: 24px; font-weight: 900; color: #ffffff; font-family: Arial, sans-serif;">Sam Riley.</b><br><span style="font-size: 14px; color: #fdf2f8; font-family: Arial, sans-serif; font-weight: bold;">UI / UX Designer</span><div style="margin-top: 40px; font-size: 12px; font-weight: bold; color: #ffffff; font-family: Arial, sans-serif; line-height: 1.6;">@samdesigns<br>samriley.portfolio</div></div>`, t: 40 + (i*195), l: 60, w: 330, h: 185},
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 25px; background: linear-gradient(135deg, #8b5cf6, #ec4899); box-sizing: border-box;"><b style="font-size: 24px; font-weight: 900; color: #ffffff; font-family: Arial, sans-serif;">Sam Riley.</b><br><span style="font-size: 14px; color: #fdf2f8; font-family: Arial, sans-serif; font-weight: bold;">UI / UX Designer</span><div style="margin-top: 40px; font-size: 12px; font-weight: bold; color: #ffffff; font-family: Arial, sans-serif; line-height: 1.6;">@samdesigns<br>samriley.portfolio</div></div>`, t: 40 + (i*195), l: 426, w: 330, h: 185}
            ]).flat()
        },
        {
            c: "Business Cards", n: "Bakery / Cafe", w: 816, h: 1056, bg: "#ffffff",
            els: Array.from({length: 5}, (_, i) => [
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 20px; background: #fffbeb; box-sizing: border-box;"><div style="text-align: center;"><b style="font-size: 24px; color: #b45309; font-family: 'Comic Sans MS', cursive;">Sweet Treats</b><br><span style="font-size: 12px; color: #d97706; font-family: Arial, sans-serif;">BAKERY & CAFE</span><div style="margin-top: 25px; font-size: 12px; color: #78350f; font-family: Arial, sans-serif; line-height: 1.6;">123 Sugar Lane<br>Order: (555) CAKE-NOW<br>@sweettreatscafe</div></div></div>`, t: 40 + (i*195), l: 60, w: 330, h: 185},
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; padding: 20px; background: #fffbeb; box-sizing: border-box;"><div style="text-align: center;"><b style="font-size: 24px; color: #b45309; font-family: 'Comic Sans MS', cursive;">Sweet Treats</b><br><span style="font-size: 12px; color: #d97706; font-family: Arial, sans-serif;">BAKERY & CAFE</span><div style="margin-top: 25px; font-size: 12px; color: #78350f; font-family: Arial, sans-serif; line-height: 1.6;">123 Sugar Lane<br>Order: (555) CAKE-NOW<br>@sweettreatscafe</div></div></div>`, t: 40 + (i*195), l: 426, w: 330, h: 185}
            ]).flat()
        },
        {
            c: "Business Cards", n: "Photography Half-Photo", w: 816, h: 1056, bg: "#ffffff",
            els: Array.from({length: 5}, (_, i) => [
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; overflow: hidden; background: #ffffff; box-sizing: border-box;"><div style="width: 40%; height: 100%; background: #333; float: left; display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px;">[Insert Photo]</div><div style="float: left; width: 60%; padding: 20px; box-sizing: border-box;"><b style="font-size: 16px; color: #111; font-family: Arial, sans-serif;">David Lens</b><br><span style="font-size: 10px; color: #777; font-family: Arial, sans-serif; text-transform: uppercase;">Photographer</span><div style="margin-top: 30px; font-size: 10px; color: #444; font-family: Arial, sans-serif; line-height: 1.6;">555-CAPTURE<br>davidlens.photo</div></div></div>`, t: 40 + (i*195), l: 60, w: 330, h: 185},
                {html: `<div style="border: 1px dashed #ccc; width: 100%; height: 100%; overflow: hidden; background: #ffffff; box-sizing: border-box;"><div style="width: 40%; height: 100%; background: #333; float: left; display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px;">[Insert Photo]</div><div style="float: left; width: 60%; padding: 20px; box-sizing: border-box;"><b style="font-size: 16px; color: #111; font-family: Arial, sans-serif;">David Lens</b><br><span style="font-size: 10px; color: #777; font-family: Arial, sans-serif; text-transform: uppercase;">Photographer</span><div style="margin-top: 30px; font-size: 10px; color: #444; font-family: Arial, sans-serif; line-height: 1.6;">555-CAPTURE<br>davidlens.photo</div></div></div>`, t: 40 + (i*195), l: 426, w: 330, h: 185}
            ]).flat()
        },

        // --- SOCIAL MEDIA (4) - 800x800 Squares ---
        {
            c: "Social Media", n: "Sale Announcement", w: 800, h: 800, bg: "#ef4444",
            els: [
                {html: `<div style="background: #ef4444; z-index: 1;"></div>`, t: 0, l: 0, w: 800, h: 800},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 180px; color: #fef08a; text-align: center; line-height: 0.9; text-shadow: 8px 8px 0px #b91c1c; z-index: 2;">FLASH<br>SALE</div>`, t: 150, l: 50, w: 700, h: 400},
                {html: `<div style="background: #111827; color: #ffffff; font-family: Arial, sans-serif; font-size: 30px; font-weight: bold; text-align: center; padding: 20px; border-radius: 100px; z-index: 3;">UP TO 70% OFF</div>`, t: 580, l: 200, w: 400, h: 80}
            ]
        },
        {
            c: "Social Media", n: "Inspirational Quote", w: 800, h: 800, bg: "#fdf2f8",
            els: [
                {html: `<div style="background: #fdf2f8; z-index: 1;"></div>`, t: 0, l: 0, w: 800, h: 800},
                {html: `<div style="font-family: Georgia, serif; font-size: 150px; color: #fbcfe8; text-align: center; z-index: 2;">"</div>`, t: 100, l: 300, w: 200, h: 150},
                {html: `<div style="font-family: Georgia, serif; font-size: 40px; color: #831843; text-align: center; line-height: 1.6; font-style: italic; z-index: 3;">Success is not final, failure is not fatal: it is the courage to continue that counts.</div>`, t: 280, l: 100, w: 600, h: 200},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #be185d; text-align: center; z-index: 4;">— Winston Churchill</div>`, t: 550, l: 100, w: 600, h: 50}
            ]
        },
        {
            c: "Social Media", n: "Podcast Promo", w: 800, h: 800, bg: "#0f172a",
            els: [
                {html: `<div style="background: #0f172a; z-index: 1;"></div>`, t: 0, l: 0, w: 800, h: 800},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; color: #38bdf8; text-align: center; letter-spacing: 5px; z-index: 2;">NEW EPISODE OUT NOW</div>`, t: 150, l: 100, w: 600, h: 40},
                {html: `<div style="font-family: 'Arial Black', sans-serif; font-size: 80px; color: #f8fafc; text-align: center; line-height: 1; z-index: 3;">THE FUTURE<br>OF DESIGN</div>`, t: 250, l: 50, w: 700, h: 200},
                {html: `<div style="background: #38bdf8; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 4;"><div style="width: 0; height: 0; border-top: 20px solid transparent; border-bottom: 20px solid transparent; border-left: 35px solid white; margin-left: 10px;"></div></div>`, t: 500, l: 350, w: 100, h: 100},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 18px; color: #94a3b8; text-align: center; z-index: 5;">Available on Spotify & Apple Podcasts</div>`, t: 650, l: 100, w: 600, h: 30}
            ]
        },
        {
            c: "Social Media", n: "Product Drop", w: 800, h: 800, bg: "#ffffff",
            els: [
                {html: `<div style="background: #ffffff; z-index: 1;"></div>`, t: 0, l: 0, w: 800, h: 800},
                {html: `<div style="background: #f1f5f9; border-radius: 400px; z-index: 2;"></div>`, t: 100, l: 100, w: 600, h: 600},
                {html: `<div style="font-family: 'Helvetica', sans-serif; font-size: 100px; font-weight: 900; color: #111; text-align: center; letter-spacing: -3px; z-index: 3;">JUST<br>DROPPED.</div>`, t: 250, l: 100, w: 600, h: 250},
                {html: `<div style="font-family: Arial, sans-serif; font-size: 24px; color: #475569; text-align: center; z-index: 4;">The Summer Collection is finally here.</div>`, t: 550, l: 100, w: 600, h: 40},
                {html: `<div style="border-bottom: 2px solid #111; font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: #111; text-align: center; padding-bottom: 5px; display: inline-block; z-index: 5;">SHOP NOW</div>`, t: 650, l: 320, w: 160, h: 40}
            ]
        }
    ];

    function injectPack3Batch4() {
        const grid = document.getElementById('template-grid');
        const activeBtn = document.querySelector('.cat-btn.active');
        if (!grid || !activeBtn) return;
        const activeCat = activeBtn.innerText.trim();
        
        const existing = grid.querySelectorAll('.pack-3-batch-4');
        existing.forEach(el => el.remove());
        
        pack3Templates4.filter(t => t.c === activeCat).forEach((t) => {
            const div = document.createElement('div');
            div.className = 'tp-item pack-3-batch-4';
            
            // Adjust scale to handle 800x800 squares
            const scale = 100 / (t.w || 794); 
            
            let previewHTML = '';
            t.els.forEach(el => {
                let styleFix = (el.html.includes('z-index: 1') || el.h > 1000 || el.w > 1000) ? "width: 100%; height: 100%;" : "";
                previewHTML += `<div style="position:absolute; top:${el.t}px; left:${el.l}px; width:${el.w}px; height:${el.h}px; z-index:1; ${styleFix}">${el.html}</div>`;
            });
            
            div.innerHTML = `<div class="template-preview" style="position:relative; width: 100px; height: 141px; display: flex; align-items: center; justify-content: center; overflow: hidden;"><div style="width: ${t.w}px; height: ${t.h}px; background: ${t.bg}; transform: scale(${scale}); transform-origin: center center; position: absolute; pointer-events: none;">${previewHTML}</div></div><div style="font-size:12px; margin-top:5px;">${t.n}</div>`;
            div.onclick = () => window.loadTemplate(t); 
            grid.appendChild(div);
        });
    }

    if (typeof window.showTemplateModal !== 'undefined') {
        const originalModal = window.showTemplateModal;
        window.showTemplateModal = function() { originalModal(); setTimeout(injectPack3Batch4, 150); };
    }
    document.addEventListener('click', (e) => {
        if(e.target && e.target.classList && e.target.classList.contains('cat-btn')) setTimeout(injectPack3Batch4, 150); 
    });

})();
