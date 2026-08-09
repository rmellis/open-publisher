// --- THEMES & STYLES ---
function initThemes() {
    const container = document.getElementById('theme-group');
    
window.clearPageBackground = function() {
    document.querySelectorAll('.theme-swatch-item').forEach(el => el.style.border = '1px solid #ccc');
    
    // Flag this specific page to ignore the master theme
    if (state.pages[state.currentPageIndex]) {
        state.pages[state.currentPageIndex].ignoreBackground = true;
        state.pages[state.currentPageIndex].background = '#ffffff';
    }
    
    // Manually destroy the theme wrapper on this page right now
    const paper = document.getElementById('paper');
    if (paper) {
        paper.style.background = '#ffffff';
        const theme = paper.querySelector('[data-is-theme="true"]');
        if (theme) theme.remove();
    }
    
    if (typeof pushHistory === 'function') pushHistory();
};

    const colors = [
        '#ffffff', '#fdf2f0', '#e8f6f3', '#fef9e7', '#f4ecf7', '#eaf2f8',
        '#ebf5fb', '#e8daef', '#d4e6f1', '#d1f2eb', '#fcf3cf', '#fadbd8',
        '#333333', '#2c3e50', '#5d6d7e', '#800000', '#1a5276', '#117864',
        'linear-gradient(to bottom right, #fff, #eee)',
        'repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #fff 10px, #fff 20px)',
        'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
        'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
        'linear-gradient(to top, #30cfd0 0%, #330867 100%)',
        'radial-gradient(circle, #fff, #ccc)',
        'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
        'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
        'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(to right, #fa709a 0%, #fee140 100%)',
        'linear-gradient(to top, #5f72bd 0%, #9b23ea 100%)',
        'linear-gradient(to top, #09203f 0%, #537895 100%)',
        'repeating-radial-gradient(circle, #fff, #fff 10px, #eee 10px, #eee 20px)'
    ];
    
    colors.forEach(c => {
        const swatch = document.createElement('div');
        swatch.style.width = '40px';
        swatch.style.height = '40px';
        swatch.style.background = c;
        swatch.style.display = 'inline-block';
        swatch.style.margin = '2px';
        swatch.style.border = '1px solid #ccc';
        swatch.style.cursor = 'pointer';
        swatch.style.verticalAlign = 'middle';
        swatch.style.borderRadius = '4px';
        swatch.title = "Apply Background";
        swatch.className = 'theme-swatch-item';
        swatch.onclick = () => { 
            document.querySelectorAll('.theme-swatch-item').forEach(el => el.style.border = '1px solid #ccc');
            swatch.style.border = '3px solid var(--ui-theme-color)';
            
            // Turn OFF ignoreBackground if they manually select a color
            if (state.pages[state.currentPageIndex]) {
                state.pages[state.currentPageIndex].ignoreBackground = false;
                state.pages[state.currentPageIndex].background = c;
            }
            
            const paper = document.getElementById('paper');
            if (paper) paper.style.background = c; 
            
            pushHistory(); 
        };
        container.appendChild(swatch);
    });
}

// --- COLOR SCHEMES ENGINE ---
function initColorSchemes() {
    const container = document.getElementById('scheme-group');
    if (!container) return;
    
    Object.keys(colorSchemes).forEach(schemeName => {
        const colors = colorSchemes[schemeName];
        
        const swatchContainer = document.createElement('div');
        swatchContainer.className = 'scheme-swatch-container';
        swatchContainer.setAttribute('data-scheme-id', schemeName);
        swatchContainer.style.display = 'inline-block';
        swatchContainer.style.margin = '2px 6px';
        swatchContainer.style.cursor = 'pointer';
        swatchContainer.style.verticalAlign = 'top';
        swatchContainer.style.padding = '4px';
        swatchContainer.style.border = '2px solid transparent';
        swatchContainer.style.borderRadius = '6px';
        swatchContainer.style.transition = '0.2s';
        if (state.currentScheme === schemeName) {
            swatchContainer.style.border = '2px solid var(--ui-theme-color)';
            swatchContainer.style.background = 'rgba(0, 118, 112, 0.1)';
        }
        swatchContainer.title = schemeName;
        swatchContainer.onclick = () => applyColorScheme(schemeName);
        
        const bar = document.createElement('div');
        bar.style.display = 'flex';
        bar.style.width = '60px';
        bar.style.height = '24px';
        bar.style.border = '1px solid #999';
        bar.style.borderRadius = '4px';
        bar.style.overflow = 'hidden';
        
        colors.forEach(c => {
            const block = document.createElement('div');
            block.style.flex = '1';
            block.style.background = c;
            bar.appendChild(block);
        });
        
        const label = document.createElement('div');
        label.innerText = schemeName;
        label.className = 'ribbon-mini-label';
        label.style.fontSize = '9px';
        label.style.textAlign = 'center';
        label.style.marginTop = '2px';
        
        swatchContainer.appendChild(bar);
        swatchContainer.appendChild(label);
        container.appendChild(swatchContainer);
    });
}

function applyColorScheme(schemeName) {
    if (!colorSchemes[schemeName]) return;
    state.currentScheme = schemeName;
    
    // UI Feedback
    document.querySelectorAll('.scheme-swatch-container').forEach(c => {
        if (c.getAttribute('data-scheme-id') === schemeName) {
            c.style.border = '2px solid var(--ui-theme-color)';
            c.style.background = 'rgba(0, 118, 112, 0.1)';
        } else {
            c.style.border = '2px solid transparent';
            c.style.background = 'transparent';
        }
    });
    
    // Update all elements dynamically
    document.querySelectorAll('.pub-element').forEach(el => {
        applySingleElementScheme(el, schemeName);
    });
    
    pushHistory();
}

function applySingleElementScheme(el, schemeName) {
    if (!colorSchemes[schemeName]) return;
    const colors = colorSchemes[schemeName];
    
    const isShape = el.getAttribute('data-type') === 'shape';
    const svgOuter = el.querySelector('svg .shape-path') || el.querySelector('svg g') || el.querySelector('svg');
    const content = el.querySelector('.element-content');
    const cssShape = content ? content.querySelector('div[style*="clip-path"]') : null;
    
    if (content) {
        const spans = content.querySelectorAll('span[data-scheme-text]');
        spans.forEach(span => {
            const idx = parseInt(span.getAttribute('data-scheme-text'));
            if (!isNaN(idx) && colors[idx]) span.style.color = colors[idx];
        });
        if (content.hasAttribute('data-scheme-text') || el.hasAttribute('data-scheme-text')) {
            const idx = parseInt(content.getAttribute('data-scheme-text') || el.getAttribute('data-scheme-text'));
            if (!isNaN(idx) && colors[idx]) content.style.color = colors[idx];
        }
    }
    
    if (el.hasAttribute('data-scheme-fill')) {
        const idx = parseInt(el.getAttribute('data-scheme-fill'));
        if (!isNaN(idx) && colors[idx]) {
            if (isShape && svgOuter && svgOuter.querySelector) {
                // If the shape has explicit paths
                const paths = svgOuter.querySelectorAll('*');
                if (paths.length) paths.forEach(p => p.setAttribute('fill', colors[idx]));
                else svgOuter.setAttribute('fill', colors[idx]);
            } else if (isShape && cssShape) {
                cssShape.style.background = colors[idx];
            } else if (content) {
                content.style.background = colors[idx];
            }
        }
    }
    
    if (el.hasAttribute('data-scheme-stroke')) {
        const idx = parseInt(el.getAttribute('data-scheme-stroke'));
        if (!isNaN(idx) && colors[idx]) {
            if (isShape && svgOuter && svgOuter.querySelector) {
                const paths = svgOuter.querySelectorAll('*');
                if (paths.length) paths.forEach(p => { if(p.getAttribute('stroke')!=='none') p.setAttribute('stroke', colors[idx]); });
                else svgOuter.setAttribute('stroke', colors[idx]);
            } else if (isShape && cssShape) {
                cssShape.style.border = `2px solid ${colors[idx]}`;
            } else if (content) {
                content.style.borderColor = colors[idx];
                if (!content.style.borderStyle || content.style.borderStyle === 'none') {
                    content.style.borderStyle = 'solid';
                    content.style.borderWidth = '1px';
                }
            }
        }
    }
}

// --- BORDERS ---
function setPageBorder(type, doPush = true) {
    if (!type) type = 'none';
    const div = document.getElementById('page-border');
    div.setAttribute('data-style', type);
    div.style.cssText = 'position: absolute; inset: 0; pointer-events: none; z-index: 2500; box-sizing: border-box;'; 
    div.innerHTML = ''; 

    if(type === 'none') { if(doPush) pushHistory(); return; }
    
    if (type.startsWith('fancy-')) {
        if (type === 'fancy-deco') { 
            div.style.border = "15px solid #333"; 
            div.style.outline = "2px dashed #333"; 
            div.style.outlineOffset = "-20px"; 
        }
        else if (type === 'fancy-cert') { 
            div.style.border = "20px solid #d4af37"; 
            div.style.borderImage = "linear-gradient(to bottom right, #b8860b, #ffd700, #b8860b) 1"; 
            const inner = document.createElement('div'); 
            inner.style.position = 'absolute'; inner.style.inset = '5px'; inner.style.border = '2px solid #b8860b'; 
            div.appendChild(inner); 
        }
        else if (type === 'fancy-double') { 
            div.style.border = "double 10px #000"; 
            div.style.outline = "double 4px #000"; 
            div.style.outlineOffset = "-15px"; 
        }
        else if (type === 'fancy-antique') {
            div.style.border = "10px double #5d4037";
            const c = document.createElement('div');
            c.style.cssText = "position:absolute; inset:5px; border: 2px solid #5d4037; border-radius: 10px;";
            div.appendChild(c);
        }
        else if (type === 'fancy-modern') {
            div.style.border = "20px solid #2c3e50";
            div.style.borderBottom = "40px solid #2c3e50";
        }
        else if (type === 'fancy-floral') {
            div.style.border = "5px solid green";
            const tl = document.createElement('div'); tl.innerText = "🌿"; tl.style.cssText = "position:absolute; top:-15px; left:-15px; font-size:40px;";
            const tr = document.createElement('div'); tr.innerText = "🌿"; tr.style.cssText = "position:absolute; top:-15px; right:-15px; font-size:40px; transform:scaleX(-1);";
            const bl = document.createElement('div'); bl.innerText = "🌿"; bl.style.cssText = "position:absolute; bottom:-15px; left:-15px; font-size:40px; transform:scaleY(-1);";
            const br = document.createElement('div'); br.innerText = "🌿"; br.style.cssText = "position:absolute; bottom:-15px; right:-15px; font-size:40px; transform:scale(-1);";
            div.appendChild(tl); div.appendChild(tr); div.appendChild(bl); div.appendChild(br);
        }
    } else {
        div.style.border = `5px ${type} #333`;
        div.style.inset = '0px'; 
    }
    document.getElementById('border-dropdown').style.display = 'none';
    if(doPush) pushHistory();
}


function initWordArt() {
    const grid = document.getElementById('wordart-grid');
    for(let i=1; i<=60; i++) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.style.height = '40px'; 
        item.innerHTML = `<div class="wa-text wa-style-${i}" style="font-size:24px;">Aa</div>`;
        item.onclick = () => {
            const el = createWrapper(`<div class="wa-wrapper"><div class="wa-text wa-style-${i}">Word Art</div></div>`);
            document.getElementById('wordart-modal').style.display = 'none';
            setTimeout(() => syncWordArt(el), 10); // NEW: Instantly format it!
        };
        grid.appendChild(item);
    }
}


const UI_THEMES = {
    'Publisher / Classic (Teal)': { primary: '#007670', dark: '#005a55', hue: '0deg', grayscale: '0%' },
    'OneDrive / Ocean (Blue)': { primary: '#0078d4', dark: '#005a9e', hue: '40deg', grayscale: '0%' },
    'Sunset (Orange)': { primary: '#ff6600', dark: '#cc5200', hue: '180deg', grayscale: '0%' },
    'Midnight Dark': { primary: '#2b2b2b', dark: '#1f1f1f', hue: '0deg', grayscale: '100%' },
    'Forest Green': { primary: '#2e7d32', dark: '#1b5e20', hue: '-45deg', grayscale: '0%' },
    'Word (Blue)': { primary: '#2b579a', dark: '#1e3f70', hue: '40deg', grayscale: '0%' },
    'Excel (Green)': { primary: '#217346', dark: '#175031', hue: '-35deg', grayscale: '0%' },
    'PowerPoint (Orange)': { primary: '#b7472a', dark: '#8f3721', hue: '195deg', grayscale: '0%' },
    'Outlook (Light Blue)': { primary: '#0072c6', dark: '#005494', hue: '30deg', grayscale: '0%' },
    'Outlook Classic (Orange)': { primary: '#e87722', dark: '#b35917', hue: '190deg', grayscale: '0%' },
    'OneNote (Purple)': { primary: '#7719aa', dark: '#521075', hue: '100deg', grayscale: '0%' },
    'Teams (Purple)': { primary: '#6264a7', dark: '#464775', hue: '65deg', grayscale: '0%' },
    'Access (Maroon)': { primary: '#a4373a', dark: '#7a292b', hue: '180deg', grayscale: '0%' },
    'SharePoint (Cyan)': { primary: '#038387', dark: '#025f61', hue: '5deg', grayscale: '0%' },
    'Visio / To Do (Navy Blue)': { primary: '#3955a3', dark: '#26396e', hue: '55deg', grayscale: '0%' },
    'Project (Dark Green)': { primary: '#31752f', dark: '#214f20', hue: '-60deg', grayscale: '0%' },
    'Forms / Sway (Teal)': { primary: '#008272', dark: '#005f53', hue: '5deg', grayscale: '0%' },
    'Planner (Green)': { primary: '#137859', dark: '#0d5740', hue: '-15deg', grayscale: '0%' },
    'Stream (Pink)': { primary: '#c5093b', dark: '#8f0529', hue: '170deg', grayscale: '0%' },
    'Loop (Purple-Blue)': { primary: '#5c40d1', dark: '#422c9c', hue: '75deg', grayscale: '0%' },
    'Twitch (Pink)': { primary: '#9146ff', dark: '#772ce8', hue: '90deg', grayscale: '0%' },
    'YouTube (Red)': { primary: '#ff0000', dark: '#cc0000', hue: '175deg', grayscale: '0%' },
    'Spotify (Green)': { primary: '#1db954', dark: '#1aa34a', hue: '-45deg', grayscale: '0%' },
    'Discord (Blurple)': { primary: '#5865f2', dark: '#4752c4', hue: '50deg', grayscale: '0%' },
    'Slack (Aubergine)': { primary: '#4a154b', dark: '#350d36', hue: '120deg', grayscale: '0%' },
    'Reddit (Orange)': { primary: '#FF4500', dark: '#CC3700', hue: '180deg', grayscale: '0%' },
    'LinkedIn (Blue)': { primary: '#0077b5', dark: '#005885', hue: '40deg', grayscale: '0%' },
    'Netflix (Red)': { primary: '#E50914', dark: '#B20710', hue: '170deg', grayscale: '0%' },
    'Dropbox (Blue)': { primary: '#0061FF', dark: '#0047BA', hue: '50deg', grayscale: '0%' },
    'GitHub (Dark)': { primary: '#24292e', dark: '#1b1f23', hue: '0deg', grayscale: '100%' },
    'WhatsApp (Green)': { primary: '#25D366', dark: '#1da851', hue: '-30deg', grayscale: '0%' },
    'Notion (Minimalist Black)': { primary: '#191919', dark: '#000000', hue: '0deg', grayscale: '100%' },
    'Stripe (Blurple)': { primary: '#635BFF', dark: '#4B45C6', hue: '60deg', grayscale: '0%' },
    'Canva (Cyan)': { primary: '#00C4CC', dark: '#00999E', hue: '10deg', grayscale: '0%' },
    'AWS (Orange)': { primary: '#FF9900', dark: '#CC7A00', hue: '190deg', grayscale: '0%' },
    'Jira (Blue)': { primary: '#0052CC', dark: '#003E99', hue: '45deg', grayscale: '0%' },
    'Asana (Coral)': { primary: '#FC636B', dark: '#D6454F', hue: '160deg', grayscale: '0%' },
    'HubSpot (Coral/Orange)': { primary: '#FF7A59', dark: '#C95D42', hue: '180deg', grayscale: '0%' },
    'Salesforce (Cloud Blue)': { primary: '#00A1E0', dark: '#00729E', hue: '40deg', grayscale: '0%' },
    'Trello (Board Blue)': { primary: '#0079BF', dark: '#005A8F', hue: '45deg', grayscale: '0%' },
    'Twilio (Red)': { primary: '#F22F46', dark: '#B32031', hue: '170deg', grayscale: '0%' },
    'Vimeo (Light Blue)': { primary: '#1AB7EA', dark: '#108BB3', hue: '35deg', grayscale: '0%' },
    'Steam (Dark Blue/Grey)': { primary: '#171A21', dark: '#0C0E12', hue: '0deg', grayscale: '100%' },
    'Android (Green)': { primary: '#3DDC84', dark: '#28A760', hue: '-45deg', grayscale: '0%' },
    'Apple Music (Pink)': { primary: '#FA243C', dark: '#C41A2D', hue: '160deg', grayscale: '0%' },
    'Behance (Blue)': { primary: '#1769FF', dark: '#1251C4', hue: '40deg', grayscale: '0%' },
    'Dribbble (Pink)': { primary: '#EA4C89', dark: '#B53969', hue: '150deg', grayscale: '0%' },
    'Evernote (Green)': { primary: '#00A82D', dark: '#007A20', hue: '-20deg', grayscale: '0%' },
    'Facebook (Blue)': { primary: '#1877F2', dark: '#115CBF', hue: '40deg', grayscale: '0%' },
    'Figma (Dark)': { primary: '#2C2D33', dark: '#1E1F24', hue: '0deg', grayscale: '100%' },
    'Firefox (Orange)': { primary: '#FF7139', dark: '#CC562A', hue: '185deg', grayscale: '0%' },
    'Flickr (Pink)': { primary: '#FF0084', dark: '#CC0069', hue: '150deg', grayscale: '0%' },
    'Foursquare (Pink)': { primary: '#F94877', dark: '#C2385C', hue: '150deg', grayscale: '0%' },
    'GitLab (Orange)': { primary: '#FC6D26', dark: '#C9551E', hue: '185deg', grayscale: '0%' },
    'Google (Blue)': { primary: '#4285F4', dark: '#3063B8', hue: '45deg', grayscale: '0%' },
    'Hulu (Green)': { primary: '#1CE783', dark: '#15AD62', hue: '-50deg', grayscale: '0%' },
    'IBM (Blue)': { primary: '#0530AD', dark: '#04227A', hue: '50deg', grayscale: '0%' },
    'Intel (Blue)': { primary: '#0071C5', dark: '#005494', hue: '40deg', grayscale: '0%' },
    'Intercom (Blue)': { primary: '#286EF1', dark: '#1E52B5', hue: '40deg', grayscale: '0%' },
    'Kickstarter (Green)': { primary: '#05CE78', dark: '#049E5C', hue: '-40deg', grayscale: '0%' },
    'Last.fm (Red)': { primary: '#D51007', dark: '#A30C05', hue: '170deg', grayscale: '0%' },
    'Lyft (Pink)': { primary: '#FF00BF', dark: '#CC0098', hue: '130deg', grayscale: '0%' },
    'Medium (Green)': { primary: '#02B875', dark: '#018A58', hue: '-20deg', grayscale: '0%' },
    'Messenger (Blue)': { primary: '#0084FF', dark: '#0064C2', hue: '35deg', grayscale: '0%' },
    'Oracle (Red)': { primary: '#F80000', dark: '#BD0000', hue: '170deg', grayscale: '0%' },
    'Patreon (Coral)': { primary: '#FF424D', dark: '#C7323A', hue: '170deg', grayscale: '0%' },
    'PayPal (Blue)': { primary: '#00457C', dark: '#00335C', hue: '40deg', grayscale: '0%' },
    'Pinterest (Red)': { primary: '#E60023', dark: '#B0001B', hue: '170deg', grayscale: '0%' },
    'Quora (Red)': { primary: '#B92B27', dark: '#8C201D', hue: '175deg', grayscale: '0%' },
    'Shopify (Green)': { primary: '#96BF48', dark: '#739437', hue: '-60deg', grayscale: '0%' },
    'Snapchat (Gold)': { primary: '#FFCC00', dark: '#CCA300', hue: '210deg', grayscale: '0%' },
    'SoundCloud (Orange)': { primary: '#FF5500', dark: '#CC4400', hue: '180deg', grayscale: '0%' },
    'Square (Gray)': { primary: '#3E4348', dark: '#2E3236', hue: '0deg', grayscale: '100%' },
    'Strava (Orange)': { primary: '#FC4C02', dark: '#C23A01', hue: '180deg', grayscale: '0%' },
    'Tesla (Red)': { primary: '#E31937', dark: '#AB1329', hue: '170deg', grayscale: '0%' },
    'TikTok (Magenta)': { primary: '#FE0050', dark: '#C2003D', hue: '160deg', grayscale: '0%' },
    'Tumblr (Dark Blue)': { primary: '#35465C', dark: '#253140', hue: '30deg', grayscale: '0%' },
    'Venmo (Blue)': { primary: '#008CFF', dark: '#006BCC', hue: '35deg', grayscale: '0%' },
    'Visa (Blue)': { primary: '#1A1F71', dark: '#12154F', hue: '50deg', grayscale: '0%' },
    'Windows 11 (Blue)': { primary: '#0078D4', dark: '#005A9E', hue: '35deg', grayscale: '0%' },
    'Xbox (Green)': { primary: '#107C10', dark: '#0C590C', hue: '-15deg', grayscale: '0%' },
    'Yahoo (Purple)': { primary: '#410093', dark: '#30006E', hue: '80deg', grayscale: '0%' },
    'Yelp (Red)': { primary: '#D32323', dark: '#9E1A1A', hue: '170deg', grayscale: '0%' },
    'Zillow (Blue)': { primary: '#006AFF', dark: '#0050C2', hue: '40deg', grayscale: '0%' },
    'Airbnb (Coral)': { primary: '#FF5A5F', dark: '#CC484C', hue: '170deg', grayscale: '0%' },
    'AMD (Red)': { primary: '#ED1C24', dark: '#BD161D', hue: '170deg', grayscale: '0%' },
    'Blogger (Orange)': { primary: '#F57D00', dark: '#C46400', hue: '185deg', grayscale: '0%' },
    'Buzzfeed (Red)': { primary: '#EE3322', dark: '#BE291B', hue: '175deg', grayscale: '0%' },
    'Cisco (Blue)': { primary: '#049FD9', dark: '#037FA6', hue: '35deg', grayscale: '0%' },
    'Dell (Blue)': { primary: '#0076CE', dark: '#005EA3', hue: '40deg', grayscale: '0%' },
    'Dominos (Blue)': { primary: '#006491', dark: '#004F73', hue: '40deg', grayscale: '0%' },
    'Duolingo (Green)': { primary: '#58CC02', dark: '#46A302', hue: '-45deg', grayscale: '0%' },
    'Etsy (Orange)': { primary: '#F1641E', dark: '#C25018', hue: '185deg', grayscale: '0%' },
    'Fitbit (Teal)': { primary: '#00B0B9', dark: '#008C94', hue: '10deg', grayscale: '0%' },
    'Garmin (Blue)': { primary: '#007CC3', dark: '#00639C', hue: '40deg', grayscale: '0%' },
    'HP (Blue)': { primary: '#0096D6', dark: '#0078AB', hue: '35deg', grayscale: '0%' },
    'IKEA (Blue)': { primary: '#0051BA', dark: '#004194', hue: '50deg', grayscale: '0%' },
    'MacOS (Aqua)': { primary: '#007AFF', dark: '#0062CC', hue: '45deg', grayscale: '0%' },
    'Nintendo (Red)': { primary: '#E60012', dark: '#B8000E', hue: '170deg', grayscale: '0%' },
    'Nokia (Blue)': { primary: '#124191', dark: '#0E3473', hue: '50deg', grayscale: '0%' },
    'PlayStation (Blue)': { primary: '#003791', dark: '#002C73', hue: '55deg', grayscale: '0%' },
    'Samsung (Blue)': { primary: '#1428A0', dark: '#102080', hue: '55deg', grayscale: '0%' },
    'Twitter (Blue)': { primary: '#1DA1F2', dark: '#1781C2', hue: '40deg', grayscale: '0%' },
    'Ubuntu (Orange)': { primary: '#E95420', dark: '#BA431A', hue: '185deg', grayscale: '0%' },
    'Zoom (Blue)': { primary: '#2D8CFF', dark: '#2470CC', hue: '45deg', grayscale: '0%' }
};

window.toggleDarkMode = function(forceState) {
    const isDark = forceState !== undefined ? forceState : !document.body.classList.contains('dark-mode');
    if (isDark) {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
        document.getElementById('dark-mode-switch').style.background = 'var(--ui-theme-color)';
        document.getElementById('dark-mode-knob').style.left = '13px';
        document.getElementById('dark-mode-icon').className = 'fas fa-moon';
        localStorage.setItem('openPublisherDarkMode', 'true');
    } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
        document.getElementById('dark-mode-switch').style.background = '#ccc';
        document.getElementById('dark-mode-knob').style.left = '1px';
        document.getElementById('dark-mode-icon').className = 'far fa-moon';
        localStorage.setItem('openPublisherDarkMode', 'false');
    }
    
    // Force rulers to immediately redraw with the new CSS theme colors
    if (typeof window.syncRulers === 'function') {
        setTimeout(window.syncRulers, 10);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const savedDarkMode = localStorage.getItem('openPublisherDarkMode');
    if (savedDarkMode === 'true') {
        setTimeout(() => window.toggleDarkMode(true), 100);
    }
});

window.applyTheme = function(themeName) {
    // Legacy theme mapping
    if (themeName === 'Classic Teal' || themeName === 'Publisher (Teal)') themeName = 'Publisher / Classic (Teal)';
    if (themeName === 'Ocean Blue' || themeName === 'OneDrive (Blue)') themeName = 'OneDrive / Ocean (Blue)';
    if (themeName === 'Sunset Orange') themeName = 'Sunset (Orange)';
    if (themeName === 'Visio (Navy)' || themeName === 'To Do (Blue)') themeName = 'Visio / To Do (Navy Blue)';
    if (themeName === 'Forms (Teal)' || themeName === 'Sway (Teal)') themeName = 'Forms / Sway (Teal)';
    if (themeName === 'Twitch (Purple)') themeName = 'Twitch (Pink)';
    if (themeName === 'Forms (Teal)' || themeName === 'Sway (Teal)') themeName = 'Forms / Sway (Teal)';

    if (!UI_THEMES[themeName]) return;
    const theme = UI_THEMES[themeName];
    document.documentElement.style.setProperty('--ui-theme-color', theme.primary);
    document.documentElement.style.setProperty('--ui-theme-dark', theme.dark);
    document.documentElement.style.setProperty('--ui-theme-hue-shift', theme.hue);
    document.documentElement.style.setProperty('--ui-theme-grayscale', theme.grayscale);

    const hex = theme.primary.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // W3C recommended threshold for switching text color is 128. We use 130 to catch moderately bright colors.
    if (yiq >= 130) {
        document.documentElement.classList.add('bright-theme');
        document.documentElement.classList.remove('dark-ui-theme');
        document.body.classList.add('bright-theme');
        document.body.classList.remove('dark-ui-theme');
    } else if (yiq < 60) {
        document.documentElement.classList.remove('bright-theme');
        document.documentElement.classList.add('dark-ui-theme');
        document.body.classList.remove('bright-theme');
        document.body.classList.add('dark-ui-theme');
    } else {
        document.documentElement.classList.remove('bright-theme');
        document.documentElement.classList.remove('dark-ui-theme');
        document.body.classList.remove('bright-theme');
        document.body.classList.remove('dark-ui-theme');
    }

    localStorage.setItem('opub_ui_theme', themeName);
    
    // Update theme selectors if they exist
    const lbl = document.getElementById('ribbon-theme-label');
    if (lbl) lbl.innerText = themeName;
    
    const optTheme = document.getElementById('opt-theme');
    if (optTheme) optTheme.innerText = themeName;
    
    // Re-render dropdown to update selected state UI
    if (typeof window.renderThemeDropdown === 'function') {
        window.renderThemeDropdown(themeName);
    }
};

window.renderThemeDropdown = function(activeTheme) {
    const themeDropdown = document.getElementById('ribbon-theme-dropdown');
    if (!themeDropdown) return;
    
    themeDropdown.innerHTML = Object.keys(UI_THEMES).map(t => {
        const isSelected = t === activeTheme;
        const circleStyle = isSelected 
            ? `width: 14px; height: 14px; border-radius: 50%; background: ${UI_THEMES[t].primary}; box-shadow: 0 0 0 1px white, 0 0 0 2px ${UI_THEMES[t].dark}; margin-right: 10px; flex-shrink: 0;`
            : `width: 14px; height: 14px; border-radius: 50%; background: ${UI_THEMES[t].primary}; margin-right: 10px; flex-shrink: 0;`;
        
        const bgStyle = isSelected ? 'background: #e6f0fa;' : '';
        const checkIcon = isSelected ? '<span style="color: #0078d4; font-size: 14px; margin-left: 10px; font-weight: bold;">&#10003;</span>' : '';

        return `
            <div class="dropdown-item" onclick="window.selectTheme('${t}')" style="${bgStyle}">
                <div style="${circleStyle}"></div>
                <span style="flex-grow: 1; color: var(--ui-text);">${t}</span>
                ${checkIcon}
            </div>
        `;
    }).join('');
};

// Apply saved theme on load
document.addEventListener('DOMContentLoaded', () => {

    const savedTheme = localStorage.getItem('opub_ui_theme');
    // Map legacy saved theme to new group name
    let activeTheme = savedTheme;
    if (activeTheme === 'Classic Teal' || activeTheme === 'Publisher (Teal)') activeTheme = 'Publisher / Classic (Teal)';
    if (activeTheme === 'Ocean Blue' || activeTheme === 'OneDrive (Blue)') activeTheme = 'OneDrive / Ocean (Blue)';
    if (activeTheme === 'Sunset Orange') activeTheme = 'Sunset (Orange)';
    if (activeTheme === 'Visio (Navy)' || activeTheme === 'To Do (Blue)') activeTheme = 'Visio / To Do (Navy Blue)';
    if (activeTheme === 'Forms (Teal)' || activeTheme === 'Sway (Teal)') activeTheme = 'Forms / Sway (Teal)';

    if (activeTheme && UI_THEMES[activeTheme]) {
        window.applyTheme(activeTheme);
    } else {
        window.applyTheme('Publisher / Classic (Teal)');
    }
});

window.toggleThemeDropdown = function(btn) {
    const m = document.getElementById('ribbon-theme-dropdown');
    const isBlock = m.style.display === 'block';
    document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
    if (!isBlock) {
        const r = btn.getBoundingClientRect();
        m.style.left = r.left + 'px'; m.style.top = (r.bottom+5) + 'px';
        m.style.display = 'block';
    }
};

window.selectTheme = function(themeName) {
    window.applyTheme(themeName);
    document.getElementById('ribbon-theme-dropdown').style.display = 'none';
};

