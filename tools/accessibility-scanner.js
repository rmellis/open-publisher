window.AccessibilityScanner = {
    issues: [],

    toggleSidebar: function() {
        const sidebar = document.getElementById('op-a11y-sidebar');
        if (sidebar) {
            if (sidebar.classList.contains('visible')) {
                sidebar.classList.remove('visible');
            } else {
                // hide others
                document.getElementById('op-table-sidebar')?.classList.remove('visible');
                document.getElementById('op-image-sidebar')?.classList.remove('visible');
                document.getElementById('op-wordart-sidebar')?.classList.remove('visible');
                sidebar.classList.add('visible');
                this.scanDocument();
            }
        }
    },

    luminance: function(r, g, b) {
        let a = [r, g, b].map(function (v) {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    },

    contrastRatio: function(rgb1, rgb2) {
        let lum1 = this.luminance(rgb1[0], rgb1[1], rgb1[2]);
        let lum2 = this.luminance(rgb2[0], rgb2[1], rgb2[2]);
        let brightest = Math.max(lum1, lum2);
        let darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    },

    parseColor: function(colorStr) {
        if (!colorStr) return null;
        if (colorStr === 'transparent' || colorStr === 'none') return [255, 255, 255]; // Treat transparent as white paper
        let c = document.createElement('canvas').getContext('2d');
        c.fillStyle = colorStr;
        let computed = c.fillStyle;
        if (computed.startsWith('#')) {
            let r = parseInt(computed.slice(1, 3), 16);
            let g = parseInt(computed.slice(3, 5), 16);
            let b = parseInt(computed.slice(5, 7), 16);
            return [r, g, b];
        } else if (computed.startsWith('rgb')) {
            let parts = computed.match(/\d+/g);
            if (parts && parts.length >= 3) {
                return [parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2])];
            }
        }
        return [255, 255, 255]; // fallback
    },

    scanDocument: function() {
        if (typeof serializeCurrentPage === 'function') {
            state.pages[state.currentPageIndex] = serializeCurrentPage();
        }

        this.issues = [];
        let issueIdCounter = 0;

        for (let i = 0; i < state.pages.length; i++) {
            let p = state.pages[i];
            if (!p || !p.elements) continue;

            let pageHasH1 = false;
            let highestHeading = 0;

            p.elements.forEach((el, index) => {
                // Rule 1: Missing Alt Text
                if (el.imgSrc || el.type === 'image') {
                    if (!el.altText || el.altText.trim() === '') {
                        this.issues.push({
                            id: issueIdCounter++,
                            type: 'altText',
                            pageIndex: i,
                            elIndex: index,
                            title: 'Missing Alt Text',
                            desc: 'An image on this page is missing alternative text.',
                            icon: 'fa-image',
                            severity: 'error'
                        });
                    }
                }

                // Rule 2 & 3
                if (el.innerHTML && el.type !== 'image' && el.type !== 'emoji') {
                    let tempDiv = document.createElement('div');
                    tempDiv.innerHTML = el.innerHTML;
                    
                    // Rule 2: Contrast Ratio
                    let fgColor = '#000000';
                    let bgColor = p.background || '#ffffff';
                    if (el.contentCssText) {
                        let styleMatch = el.contentCssText.match(/color:\s*([^;]+)/);
                        if (styleMatch) fgColor = styleMatch[1].trim();
                    }
                    if (el.bg) bgColor = el.bg;
                    
                    let fgRgb = this.parseColor(fgColor);
                    let bgRgb = this.parseColor(bgColor);
                    
                    if (fgRgb && bgRgb) {
                        let ratio = this.contrastRatio(fgRgb, bgRgb);
                        if (ratio < 4.5 && tempDiv.textContent.trim().length > 0) {
                             this.issues.push({
                                id: issueIdCounter++,
                                type: 'contrast',
                                pageIndex: i,
                                elIndex: index,
                                title: 'Low Color Contrast',
                                desc: `Text contrast ratio is ${ratio.toFixed(2)}:1 (minimum 4.5:1).`,
                                icon: 'fa-adjust',
                                severity: 'warning'
                            });
                        }
                    }

                    // Rule 3: Heading Structure
                    let headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
                    headings.forEach(h => {
                        let level = parseInt(h.tagName.substring(1));
                        if (level === 1) pageHasH1 = true;
                        
                        if (highestHeading !== 0 && level > highestHeading + 1) {
                            this.issues.push({
                                id: issueIdCounter++,
                                type: 'headingJump',
                                pageIndex: i,
                                elIndex: index,
                                title: 'Illogical Heading Structure',
                                desc: `Heading jumps from H${highestHeading} to H${level}.`,
                                icon: 'fa-heading',
                                severity: 'warning'
                            });
                        }
                        highestHeading = level;
                    });
                }
            });
            
            if (highestHeading > 0 && !pageHasH1) {
                this.issues.push({
                    id: issueIdCounter++,
                    type: 'missingH1',
                    pageIndex: i,
                    elIndex: -1,
                    title: 'Missing Page Title (H1)',
                    desc: 'This page has headings but no primary H1 heading.',
                    icon: 'fa-heading',
                    severity: 'error'
                });
            }
        }
        
        this.renderSidebar();
    },

    renderSidebar: function() {
        const container = document.getElementById('a11y-results-container');
        if (!container) return;
        
        if (this.issues.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 30px 10px; color:#555;">
                    <i class="fas fa-check-circle" style="font-size:40px; color:#2e7d32; margin-bottom:15px;"></i>
                    <h3 style="margin:0 0 10px 0; font-size:16px;">Accessibility Good!</h3>
                    <p style="font-size:12px; margin:0;">No major issues found on any pages.</p>
                </div>
            `;
            return;
        }

        let html = `<div style="margin-bottom:15px; font-weight:bold; color:var(--ui-danger, #d32f2f);"><i class="fas fa-exclamation-triangle" style="color:var(--ui-danger, #d32f2f);"></i> ${this.issues.length} Issues Found</div>`;
        
        this.issues.forEach(issue => {
            let severityColor = issue.severity === 'error' ? 'var(--ui-danger, #d32f2f)' : '#f57c00';
            html += `
                <div style="background:var(--ribbon-bg, #f9f9f9); border-left:4px solid ${severityColor}; padding:10px; margin-bottom:10px; border-radius:0 4px 4px 0; font-size:12px; position:relative;">
                    <div style="font-weight:bold; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:${severityColor}"><i class="fas ${issue.icon}" style="margin-right:5px; color:${severityColor}"></i> ${issue.title}</span>
                        <span style="color:var(--ui-text-muted, #888); font-size:10px; background:var(--ribbon-border, #e0e0e0); padding:2px 6px; border-radius:10px;">Page ${issue.pageIndex + 1}</span>
                    </div>
                    <div style="margin-bottom:10px; color:var(--ui-text, #555); line-height:1.4;">${issue.desc}</div>
                    <button onclick="window.AccessibilityScanner.fixIssue(${issue.id})" style="background:var(--ui-theme-color); color:#fff; border:none; padding:5px 12px; border-radius:4px; cursor:pointer; font-size:11px; font-weight:600; width:100%; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1"><i class="fas fa-wrench" style="margin-right:5px;"></i>Fix Issue</button>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },

    fixIssue: function(issueId) {
        let issue = this.issues.find(i => i.id === issueId);
        if (!issue) return;

        if (state.currentPageIndex !== issue.pageIndex) {
            loadPage(issue.pageIndex);
        }

        if (window.ContextMenuSystem) window.ContextMenuSystem.hide();
        document.querySelectorAll('.pub-element').forEach(el => el.classList.remove('selected'));
        state.selectedEl = null;

        if (issue.elIndex >= 0) {
            let elDivs = document.getElementById('paper').querySelectorAll('.pub-element');
            if (elDivs[issue.elIndex]) {
                elDivs[issue.elIndex].classList.add('selected');
                state.selectedEl = elDivs[issue.elIndex];
            }
        }

        if (issue.type === 'altText') {
            if (window.ContextMenuActions && ContextMenuActions.setAltText) {
                ContextMenuActions.setAltText();
            }
        } else if (issue.type === 'contrast') {
            if (state.selectedEl) {
                let content = state.selectedEl.querySelector('.element-content');
                if (content) {
                    content.style.color = '#000000';
                    let spans = content.querySelectorAll('span, p, h1, h2, h3, h4, h5, h6');
                    spans.forEach(s => s.style.color = '#000000');
                    if (window.pushHistory) pushHistory();
                    setTimeout(() => this.scanDocument(), 100);
                }
            }
        } else if (issue.type === 'headingJump') {
            DialogSystem.show('Heading Structure', '<div style="display:flex; align-items:center; gap:20px;"><i class="fas fa-info-circle fa-2x" style="color:var(--ui-theme-color);"></i><div style="line-height:1.4; font-size:14px;">Please manually adjust the heading levels using the Formatting Ribbon (e.g. change H3 to H2) to ensure a logical reading order.</div></div>', null, true);
        } else if (issue.type === 'missingH1') {
            DialogSystem.show('Auto-Fix Missing Title', '<div style="display:flex; align-items:center; gap:20px;"><i class="fas fa-magic fa-2x" style="color:var(--ui-theme-color);"></i><div style="line-height:1.4; font-size:14px;">This page is missing an H1 title. Would you like to automatically insert a new Page Title for screen readers?</div></div>', () => {
                let tb = addTextBox();
                let content = tb.querySelector('.element-content > div');
                if (content) {
                    content.innerHTML = '<h1 style="margin:0; font-family:var(--pub-font, Arial); color:var(--ui-theme-dark);">Page Title</h1>';
                }
                tb.style.width = '400px';
                tb.style.height = '60px';
                tb.style.left = '50px';
                tb.style.top = '50px';
                if (window.pushHistory) pushHistory();
                setTimeout(() => this.scanDocument(), 100);
            });
        }
    }
};
