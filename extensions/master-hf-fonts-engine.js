// Open Publisher Master Page, Header & Footer, Dynamic Page Numbers,
// Document Font Schemes & Global Default Font Engine
(function(window) {
    'use strict';

    const DEFAULT_GLOBAL_FONT = 'Segoe UI';
    const DEFAULT_GLOBAL_SIZE = 12;

    const PAGE_NUMBER_FORMATS = [
        { id: 'number', label: '1', sample: '1' },
        { id: 'page-n', label: 'Page 1', sample: 'Page 1' },
        { id: 'page-n-of-total', label: 'Page 1 of N', sample: 'Page 1 of 3' },
        { id: 'n-slash-total', label: '1 / N', sample: '1 / 3' }
    ];

    const FONT_SCHEMES = [
        { id: 'classic-serif', name: 'Classic Serif', headingFont: 'Georgia', bodyFont: 'Georgia', desc: 'Timeless book and formal newsletter pairing' },
        { id: 'clean-sans', name: 'Clean Sans', headingFont: 'Segoe UI', bodyFont: 'Segoe UI', desc: 'Crisp, legible everyday business typography' },
        { id: 'newsletter-editorial', name: 'Newsletter Editorial', headingFont: 'Playfair Display', bodyFont: 'Merriweather', desc: 'High-contrast editorial display with warm serif body' },
        { id: 'modern-business', name: 'Modern Business', headingFont: 'Montserrat', bodyFont: 'Open Sans', desc: 'Geometric headings with neutral humanist body copy' },
        { id: 'formal-academic', name: 'Formal Academic', headingFont: 'EB Garamond', bodyFont: 'Crimson Text', desc: 'Traditional scholarly headings and readable body' },
        { id: 'executive-slate', name: 'Executive Report', headingFont: 'Oswald', bodyFont: 'Lato', desc: 'Condensed bold headlines with clean corporate body' },
        { id: 'friendly-community', name: 'Community Flyer', headingFont: 'Poppins', bodyFont: 'Nunito', desc: 'Warm rounded headlines for schools and local bulletins' },
        { id: 'tech-crisp', name: 'Modern Minimal', headingFont: 'Space Grotesk', bodyFont: 'Inter', desc: 'Sharp contemporary sans pair for manuals and sheets' },
        { id: 'magazine-bold', name: 'Magazine Bold', headingFont: 'Archivo Black', bodyFont: 'Source Sans Pro', desc: 'Punchy magazine titles with balanced column body' },
        { id: 'classic-office', name: 'Classic Office', headingFont: 'Trebuchet MS', bodyFont: 'Arial', desc: 'Universal system-safe office heading and body pair' }
    ];

    const LEGACY_PLACEHOLDERS = new Set([
        'header (type here)',
        'footer (type here)',
        'header',
        'footer'
    ]);

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function isLegacyPlaceholderText(html) {
        const plain = String(html || '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
        return !plain || LEGACY_PLACEHOLDERS.has(plain);
    }

    // -------------------------------------------------------------------------
    // 1. GLOBAL DEFAULT FONT & DOCUMENT FONT SCHEMES
    // -------------------------------------------------------------------------

    function getGlobalDefaultFont() {
        let family = DEFAULT_GLOBAL_FONT;
        let size = DEFAULT_GLOBAL_SIZE;
        try {
            const savedFam = localStorage.getItem('opub_default_font_family');
            if (savedFam && savedFam.trim()) family = savedFam.trim();
            const savedSize = parseInt(localStorage.getItem('opub_default_font_size'), 10);
            if (!isNaN(savedSize) && savedSize >= 6 && savedSize <= 144) size = savedSize;
        } catch (e) {}
        return { family, size };
    }

    function setGlobalDefaultFont(family, size) {
        const cleanFam = (family && String(family).trim()) || DEFAULT_GLOBAL_FONT;
        const cleanSize = Math.max(6, Math.min(144, parseInt(size, 10) || DEFAULT_GLOBAL_SIZE));
        try {
            localStorage.setItem('opub_default_font_family', cleanFam);
            localStorage.setItem('opub_default_font_size', String(cleanSize));
        } catch (e) {}
        ensureFontLoaded(cleanFam);
        syncFontSchemeRibbonUI();
        syncDefaultToolbarLabels();
        return { family: cleanFam, size: cleanSize };
    }

    function ensureFontLoaded(fontName) {
        if (!fontName) return;
        try {
            if (window.VariableFontsEngine && typeof window.VariableFontsEngine.isVariableFont === 'function' && window.VariableFontsEngine.isVariableFont(fontName)) {
                window.VariableFontsEngine.ensureFontLoaded(fontName);
                return;
            }
            const systemFonts = new Set(['Arial', 'Segoe UI', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Helvetica', 'Tahoma']);
            if (!systemFonts.has(fontName)) {
                const linkId = 'op-gfont-' + fontName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                if (!document.getElementById(linkId)) {
                    const link = document.createElement('link');
                    link.id = linkId;
                    link.rel = 'stylesheet';
                    link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fontName).replace(/%20/g, '+') + ':ital,wght@0,400;0,700;1,400;1,700&display=swap';
                    document.head.appendChild(link);
                }
            }
            if (document.fonts && typeof document.fonts.load === 'function') {
                document.fonts.load(`16px "${fontName}"`).catch(() => {});
            }
        } catch (e) {}
    }

    function getEffectiveDocumentTypography() {
        const globalDef = getGlobalDefaultFont();
        if (typeof state !== 'undefined' && state && state.fontScheme && state.fontScheme.bodyFont) {
            return {
                headingFont: state.fontScheme.headingFont || state.fontScheme.bodyFont,
                bodyFont: state.fontScheme.bodyFont,
                fontSize: globalDef.size,
                source: 'scheme',
                scheme: state.fontScheme
            };
        }
        return {
            headingFont: globalDef.family,
            bodyFont: globalDef.family,
            fontSize: globalDef.size,
            source: 'global',
            scheme: null
        };
    }

    function buildFontStack(primaryFont) {
        const fam = (primaryFont || DEFAULT_GLOBAL_FONT).replace(/['"]/g, '').trim();
        const serifHints = ['Georgia', 'Times New Roman', 'Playfair Display', 'Merriweather', 'EB Garamond', 'Crimson Text', 'Lora', 'Libre Baskerville', 'PT Serif', 'Bitter', 'Arvo', 'Vollkorn', 'Bodoni Moda', 'Old Standard TT', 'Cinzel'];
        const monoHints = ['Courier New', 'Roboto Mono', 'Source Code Pro', 'Space Mono', 'Inconsolata'];
        if (fam === 'Segoe UI') return "'Segoe UI', Tahoma, Arial, sans-serif";
        if (fam === 'Georgia') return "'Georgia', serif";
        const fallback = monoHints.includes(fam) ? 'monospace' : (serifHints.includes(fam) ? 'Georgia, serif' : "'Segoe UI', Tahoma, Arial, sans-serif");
        return `'${fam}', ${fallback}`;
    }

    function syncDefaultToolbarLabels() {
        if (typeof state !== 'undefined' && state.selectedEl) return;
        const typo = getEffectiveDocumentTypography();
        const rLbl = document.getElementById('ribbon-font-label');
        const fLbl = document.getElementById('float-font-label');
        const fsInp = document.getElementById('font-size');
        if (rLbl) rLbl.innerText = typo.bodyFont;
        if (fLbl) fLbl.innerText = typo.bodyFont;
        if (fsInp) fsInp.value = typo.fontSize;
    }

    function syncFontSchemeRibbonUI() {
        const lbl = document.getElementById('ribbon-font-scheme-label');
        const sub = document.getElementById('ribbon-font-scheme-sub');
        const btn = document.getElementById('ribbon-font-scheme-btn');
        const scheme = (typeof state !== 'undefined' && state && state.fontScheme) ? state.fontScheme : null;
        if (lbl) lbl.textContent = scheme ? scheme.name : 'Font Schemes';
        if (sub) {
            if (scheme) {
                sub.textContent = scheme.headingFont === scheme.bodyFont
                    ? scheme.headingFont
                    : `${scheme.headingFont} / ${scheme.bodyFont}`;
            } else {
                const g = getGlobalDefaultFont();
                sub.textContent = `Default: ${g.family}`;
            }
        }
        if (btn) btn.classList.toggle('active-tool', !!scheme);
    }

    function applyFontToElementDom(el, headingFont, bodyFont) {
        if (!el || el.classList.contains('master-page-element')) return;
        const dtype = el.getAttribute('data-type') || '';
        if (['image', 'shape', 'smart-arrow', 'emoji', 'chart', 'progress-bar', 'beta-wordart', 'wordart'].includes(dtype)) return;
        const isHeadingBox = el.hasAttribute('data-heading-level') && parseInt(el.getAttribute('data-heading-level'), 10) > 0;
        const content = el.querySelector('[contenteditable="true"]') || el.querySelector('.element-content > div') || el.querySelector('.element-content');
        if (!content) return;

        const targetStack = buildFontStack(isHeadingBox ? headingFont : bodyFont);
        content.style.fontFamily = targetStack;

        content.querySelectorAll('h1, h2, h3, h4, [data-heading-level]').forEach(h => {
            const lvl = parseInt(h.getAttribute('data-heading-level') || (h.tagName && h.tagName.startsWith('H') ? h.tagName.slice(1) : '0'), 10);
            h.style.fontFamily = buildFontStack(lvl > 0 ? headingFont : bodyFont);
        });

        content.querySelectorAll('[style*="font-family"], font[face]').forEach(node => {
            if (node.closest && node.closest('h1, h2, h3, h4, [data-heading-level]')) {
                node.style.fontFamily = buildFontStack(headingFont);
            } else {
                node.style.fontFamily = targetStack;
            }
            if (node.hasAttribute('face')) node.removeAttribute('face');
        });
    }

    function applyFontToSerializedHtml(html, fontStack, headingStack) {
        if (!html || typeof html !== 'string') return html;
        try {
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            const firstDiv = tmp.firstElementChild;
            if (firstDiv && firstDiv.style) {
                firstDiv.style.fontFamily = fontStack;
            }
            tmp.querySelectorAll('h1, h2, h3, h4, [data-heading-level]').forEach(h => {
                h.style.fontFamily = headingStack;
            });
            tmp.querySelectorAll('.op-hf-editable, .op-hf-zone').forEach(z => {
                z.style.fontFamily = fontStack;
            });
            tmp.querySelectorAll('[style*="font-family"], font[face]').forEach(node => {
                if (node.closest && node.closest('h1, h2, h3, h4, [data-heading-level]')) {
                    node.style.fontFamily = headingStack;
                } else {
                    node.style.fontFamily = fontStack;
                }
                if (node.hasAttribute('face')) node.removeAttribute('face');
            });
            return tmp.innerHTML;
        } catch (e) {
            return html;
        }
    }

    function applyFontSchemeToExistingBoxes(schemeObj) {
        if (!schemeObj) return 0;
        const hFont = schemeObj.headingFont || schemeObj.bodyFont || DEFAULT_GLOBAL_FONT;
        const bFont = schemeObj.bodyFont || hFont;
        const hStack = buildFontStack(hFont);
        const bStack = buildFontStack(bFont);
        let count = 0;

        const paperEl = document.getElementById('paper');
        if (paperEl) {
            paperEl.querySelectorAll('.pub-element:not(.master-page-element)').forEach(el => {
                const dtype = el.getAttribute('data-type') || '';
                const hasText = dtype === 'text' || dtype === 'page-number' || el.querySelector('[contenteditable="true"]') !== null;
                if (hasText && !el.querySelector('table, .wa-text, .beta-wa-img, svg')) {
                    applyFontToElementDom(el, hFont, bFont);
                    count++;
                }
            });
            paperEl.querySelectorAll('.op-hf-box .op-hf-editable, .op-hf-box .op-hf-zone').forEach(z => {
                z.style.fontFamily = bStack;
                z.querySelectorAll('[style*="font-family"], font[face]').forEach(n => {
                    n.style.fontFamily = bStack;
                    if (n.hasAttribute('face')) n.removeAttribute('face');
                });
            });
            syncMasterHeaderFooterToState();
        }

        if (typeof state !== 'undefined' && Array.isArray(state.pages)) {
            state.pages.forEach((pg, idx) => {
                if (!pg || idx === state.currentPageIndex) return;
                if (Array.isArray(pg.elements)) {
                    pg.elements.forEach(item => {
                        if (!item || ['image', 'shape', 'smart-arrow', 'emoji', 'chart', 'progress-bar', 'beta-wordart', 'wordart'].includes(item.type)) return;
                        if (item.innerHTML && !item.imgSrc && !item.innerHTML.includes('<table') && !item.innerHTML.includes('wa-text')) {
                            const isHeading = item.filterAttributes && parseInt(item.filterAttributes['data-heading-level'], 10) > 0;
                            item.innerHTML = applyFontToSerializedHtml(item.innerHTML, isHeading ? hStack : bStack, hStack);
                            count++;
                        }
                    });
                }
                if (pg.header) pg.header = applyFontToSerializedHtml(pg.header, bStack, hStack);
                if (pg.footer) pg.footer = applyFontToSerializedHtml(pg.footer, bStack, hStack);
            });
        }

        if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
        if (typeof window.updateDocumentFontsSection === 'function') window.updateDocumentFontsSection(true);
        return count;
    }

    function applyFontScheme(schemeObj, applyToExisting = false, skipHistory = false) {
        if (typeof state === 'undefined') return;
        if (!schemeObj) {
            state.fontScheme = null;
            syncFontSchemeRibbonUI();
            syncDefaultToolbarLabels();
            if (!skipHistory && typeof window.pushHistory === 'function') window.pushHistory(true);
            if (typeof window.showToast === 'function') window.showToast('Document Font Scheme cleared (using Global Default Font).');
            return;
        }

        const clean = {
            id: schemeObj.id || ('custom-' + Date.now().toString(36)),
            name: schemeObj.name || 'Custom Scheme',
            headingFont: schemeObj.headingFont || DEFAULT_GLOBAL_FONT,
            bodyFont: schemeObj.bodyFont || schemeObj.headingFont || DEFAULT_GLOBAL_FONT
        };
        state.fontScheme = clean;
        ensureFontLoaded(clean.headingFont);
        ensureFontLoaded(clean.bodyFont);
        syncFontSchemeRibbonUI();
        syncDefaultToolbarLabels();

        if (applyToExisting) {
            applyFontSchemeToExistingBoxes(clean);
        }

        if (!skipHistory && typeof window.pushHistory === 'function') window.pushHistory(true);
        if (typeof window.showToast === 'function') {
            const extra = applyToExisting ? ' and applied to existing text boxes' : ' (new text boxes will inherit this pair)';
            window.showToast(`Font Scheme "${clean.name}" active${extra}.`);
        }
    }

    function getAvailableFontsList() {
        const list = (typeof window.fontList !== 'undefined' && Array.isArray(window.fontList) && window.fontList.length > 0)
            ? window.fontList.slice()
            : ['Segoe UI', 'Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Trebuchet MS', 'Courier New', 'Montserrat', 'Open Sans', 'Playfair Display', 'Merriweather', 'Lato', 'Inter', 'Poppins', 'Roboto'];
        return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
    }

    function toggleFontSchemesMenu(triggerEl) {
        let menu = document.getElementById('font-scheme-dropdown');
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'font-scheme-dropdown';
            menu.className = 'dropdown-menu op-font-scheme-menu';
            document.body.appendChild(menu);
        }

        const wasOpen = menu.style.display === 'block';
        document.querySelectorAll('.dropdown-menu').forEach(d => { d.style.display = 'none'; });
        if (wasOpen) return;

        const activeId = (typeof state !== 'undefined' && state.fontScheme) ? state.fontScheme.id : '';
        const applyExistingChecked = window._opApplyFontSchemeExisting === true;

        let itemsHtml = `
            <div class="op-fs-header">
                <span>Document Font Schemes</span>
                <label class="op-fs-existing-toggle" onclick="event.stopPropagation();" title="Also update existing text boxes in the publication when picking a scheme">
                    <input type="checkbox" id="op-fs-apply-existing-cb" ${applyExistingChecked ? 'checked' : ''} onchange="window._opApplyFontSchemeExisting = this.checked;">
                    <span>Apply to existing text</span>
                </label>
            </div>
            <div class="op-fs-list">
        `;

        FONT_SCHEMES.forEach(s => {
            ensureFontLoaded(s.headingFont);
            ensureFontLoaded(s.bodyFont);
            const isActive = activeId === s.id;
            itemsHtml += `
                <div class="op-fs-item ${isActive ? 'active' : ''}" data-fs-id="${escapeHtml(s.id)}">
                    <div class="op-fs-badge" style="font-family:${buildFontStack(s.headingFont)};">Aa</div>
                    <div class="op-fs-info">
                        <div class="op-fs-name">${escapeHtml(s.name)}</div>
                        <div class="op-fs-pair">
                            <span style="font-family:${buildFontStack(s.headingFont)}; font-weight:700;">${escapeHtml(s.headingFont)}</span>
                            <span style="opacity:0.55; margin:0 4px;">/</span>
                            <span style="font-family:${buildFontStack(s.bodyFont)};">${escapeHtml(s.bodyFont)}</span>
                        </div>
                    </div>
                    ${isActive ? '<i class="fas fa-check op-fs-check"></i>' : ''}
                </div>
            `;
        });

        const globalDef = getGlobalDefaultFont();
        itemsHtml += `
            </div>
            <div class="op-fs-footer">
                <div class="op-fs-action" id="op-fs-custom-btn">
                    <i class="fas fa-sliders-h"></i> Custom Font Scheme...
                </div>
                <div class="op-fs-action" id="op-fs-apply-now-btn">
                    <i class="fas fa-sync-alt"></i> Apply Active Scheme to All Text Boxes
                </div>
                <div class="op-fs-action" id="op-fs-clear-btn">
                    <i class="fas fa-undo"></i> Use Global Default (${escapeHtml(globalDef.family)})
                </div>
            </div>
        `;

        menu.innerHTML = itemsHtml;

        menu.querySelectorAll('.op-fs-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = item.getAttribute('data-fs-id');
                const found = FONT_SCHEMES.find(s => s.id === id);
                const applyEx = !!document.getElementById('op-fs-apply-existing-cb')?.checked;
                window._opApplyFontSchemeExisting = applyEx;
                if (found) applyFontScheme(found, applyEx);
                menu.style.display = 'none';
            });
        });

        const customBtn = menu.querySelector('#op-fs-custom-btn');
        if (customBtn) {
            customBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.style.display = 'none';
                showCustomFontSchemeModal();
            });
        }

        const applyNowBtn = menu.querySelector('#op-fs-apply-now-btn');
        if (applyNowBtn) {
            applyNowBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const typo = getEffectiveDocumentTypography();
                applyFontSchemeToExistingBoxes({ headingFont: typo.headingFont, bodyFont: typo.bodyFont });
                if (typeof window.pushHistory === 'function') window.pushHistory(true);
                if (typeof window.showToast === 'function') window.showToast('Applied active fonts to existing text boxes.');
                menu.style.display = 'none';
            });
        }

        const clearBtn = menu.querySelector('#op-fs-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                applyFontScheme(null, false);
                menu.style.display = 'none';
            });
        }

        menu.style.display = 'block';
        menu.style.position = 'fixed';
        menu.style.zIndex = '10050';

        if (triggerEl && typeof triggerEl.getBoundingClientRect === 'function') {
            const rect = triggerEl.getBoundingClientRect();
            const vw = window.innerWidth || 1280;
            const mw = 320;
            menu.style.width = mw + 'px';
            menu.style.left = Math.max(8, Math.min(rect.left, vw - mw - 8)) + 'px';
            menu.style.top = (rect.bottom + 2) + 'px';
        }
    }

    function showCustomFontSchemeModal() {
        const fsMenu = document.getElementById('font-scheme-dropdown');
        if (fsMenu) fsMenu.style.display = 'none';
        if (typeof DialogSystem === 'undefined') return;
        const fonts = getAvailableFontsList();
        const cur = getEffectiveDocumentTypography();
        const curName = (state.fontScheme && state.fontScheme.name) ? state.fontScheme.name : 'Custom Font Scheme';

        const buildOpts = (selected) => fonts.map(f =>
            `<option value="${escapeHtml(f)}" ${f.toLowerCase() === String(selected || '').toLowerCase() ? 'selected' : ''}>${escapeHtml(f)}</option>`
        ).join('');

        const html = `
            <div class="op-custom-fs-modal" style="width: 440px; max-width: 90vw; font-family: inherit;">
                <p style="margin:0 0 12px 0; font-size:12.5px; opacity:0.82; line-height:1.45;">
                    Pick a custom Heading and Body font pair for this publication. New text boxes inherit the Body font, and Heading levels (H1, H2, H3) inherit the Heading font.
                </p>
                <div style="margin-bottom:10px;">
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Scheme Name:</label>
                    <input type="text" id="cfs-name-input" value="${escapeHtml(curName)}" style="width:100%; box-sizing:border-box; padding:6px 8px; border:1px solid var(--ui-border, #cbd5e1); border-radius:4px; background:var(--ui-panel-bg, #fff); color:var(--ui-text, #1e293b);">
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Heading Font:</label>
                        <select id="cfs-heading-font" class="no-custom-select" style="width:100%; padding:6px 8px; border:1px solid var(--ui-border, #cbd5e1); border-radius:4px; background:var(--ui-panel-bg, #fff); color:var(--ui-text, #1e293b);">${buildOpts(cur.headingFont)}</select>
                    </div>
                    <div>
                        <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Body Font:</label>
                        <select id="cfs-body-font" class="no-custom-select" style="width:100%; padding:6px 8px; border:1px solid var(--ui-border, #cbd5e1); border-radius:4px; background:var(--ui-panel-bg, #fff); color:var(--ui-text, #1e293b);">${buildOpts(cur.bodyFont)}</select>
                    </div>
                </div>
                <div id="cfs-preview-card" style="padding:12px 14px; border:1px dashed var(--ui-border, #cbd5e1); border-radius:6px; background:var(--ui-surface-bg, #f8fafc); margin-bottom:12px;">
                    <div id="cfs-preview-heading" style="font-size:18px; font-weight:700; margin-bottom:4px; font-family:${buildFontStack(cur.headingFont)};">Community Newsletter Headline</div>
                    <div id="cfs-preview-body" style="font-size:12.5px; line-height:1.45; opacity:0.88; font-family:${buildFontStack(cur.bodyFont)};">Body text uses your selected reading font for crisp paragraphs, captions, and article columns.</div>
                </div>
                <label style="display:flex; align-items:center; gap:8px; font-size:12.5px; cursor:pointer; user-select:none;">
                    <input type="checkbox" id="cfs-apply-existing" style="accent-color:var(--ui-theme-color, #007670);">
                    <span>Also apply this font scheme to existing text boxes in this document</span>
                </label>
            </div>
        `;

        DialogSystem.show('Custom Font Scheme', html, () => {
            const nameVal = (document.getElementById('cfs-name-input')?.value || '').trim() || 'Custom Font Scheme';
            const hFont = document.getElementById('cfs-heading-font')?.value || cur.headingFont;
            const bFont = document.getElementById('cfs-body-font')?.value || cur.bodyFont;
            const applyEx = !!document.getElementById('cfs-apply-existing')?.checked;
            applyFontScheme({
                id: 'custom-' + nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                name: nameVal,
                headingFont: hFont,
                bodyFont: bFont
            }, applyEx);
        }, false, 'Apply Scheme');

        setTimeout(() => {
            const hSel = document.getElementById('cfs-heading-font');
            const bSel = document.getElementById('cfs-body-font');
            const hPrev = document.getElementById('cfs-preview-heading');
            const bPrev = document.getElementById('cfs-preview-body');
            const syncPrev = () => {
                if (hSel && hPrev) {
                    ensureFontLoaded(hSel.value);
                    hPrev.style.fontFamily = buildFontStack(hSel.value);
                }
                if (bSel && bPrev) {
                    ensureFontLoaded(bSel.value);
                    bPrev.style.fontFamily = buildFontStack(bSel.value);
                }
            };
            if (hSel) hSel.addEventListener('change', syncPrev);
            if (bSel) bSel.addEventListener('change', syncPrev);
        }, 20);
    }

    // -------------------------------------------------------------------------
    // 2. DOCUMENT PAGE METRICS & DYNAMIC PAGE NUMBER TOKENS
    // -------------------------------------------------------------------------

    function isEditingMasterPage() {
        return !!(typeof state !== 'undefined' && state && state.hasMasterPage && state.currentPageIndex === 0);
    }

    function spreadHasRightHalf(spreadPage, spreadIndex, totalSpreads) {
        if (!spreadPage) return false;
        const singleW = (parseFloat(spreadPage.width) || 1588) / 2;
        const hasRightEls = Array.isArray(spreadPage.elements) && spreadPage.elements.some(el => {
            if (el && el.innerHTML && el.innerHTML.includes('spread-fold-line')) return false;
            return (parseFloat(el && el.left) || 0) >= singleW;
        });
        if (hasRightEls) return true;
        if (spreadPage._spreadRightPageMeta !== undefined) {
            return spreadPage._spreadRightPageMeta !== null;
        }
        return true;
    }

    function getSpreadHalfMetrics(pageIndex, pagesArr, hasMasterOverride) {
        const pages = Array.isArray(pagesArr) ? pagesArr : ((typeof state !== 'undefined' && Array.isArray(state.pages)) ? state.pages : []);
        const hasMaster = (typeof hasMasterOverride === 'boolean')
            ? hasMasterOverride
            : !!(typeof state !== 'undefined' && state && state.hasMasterPage);
        const startIdx = hasMaster ? 1 : 0;
        let totalSinglePages = 0;
        for (let i = startIdx; i < pages.length; i++) {
            totalSinglePages += spreadHasRightHalf(pages[i], i, pages.length) ? 2 : 1;
        }
        totalSinglePages = Math.max(1, totalSinglePages);
        const idx = (typeof pageIndex === 'number') ? pageIndex : ((typeof state !== 'undefined' && typeof state.currentPageIndex === 'number') ? state.currentPageIndex : 0);
        if (hasMaster && idx === 0) {
            return { isMaster: true, leftDocPageNum: 1, rightDocPageNum: Math.min(2, totalSinglePages), totalSinglePages, hasRightPage: true };
        }
        const cIdx = Math.max(0, hasMaster ? (idx - 1) : idx);
        const leftDocPageNum = cIdx * 2 + 1;
        const hasRightPage = spreadHasRightHalf(pages[idx], idx, pages.length);
        const rightDocPageNum = leftDocPageNum + 1;
        return { isMaster: false, leftDocPageNum, rightDocPageNum, totalSinglePages, hasRightPage };
    }

    function getDocumentPageMetrics(pageIndex, pagesArr, hasMasterOverride) {
        const pages = Array.isArray(pagesArr) ? pagesArr : ((typeof state !== 'undefined' && Array.isArray(state.pages)) ? state.pages : []);
        const hasMaster = (typeof hasMasterOverride === 'boolean')
            ? hasMasterOverride
            : !!(typeof state !== 'undefined' && state && state.hasMasterPage);
        const idx = (typeof pageIndex === 'number') ? pageIndex : ((typeof state !== 'undefined' && typeof state.currentPageIndex === 'number') ? state.currentPageIndex : 0);

        if (typeof state !== 'undefined' && state && state.isSpreadMode) {
            const sm = getSpreadHalfMetrics(idx, pages, hasMaster);
            return { isMaster: sm.isMaster, docPageNum: sm.leftDocPageNum, totalDocPages: sm.totalSinglePages, pageIndex: idx };
        }

        if (hasMaster) {
            const totalDocPages = Math.max(1, pages.length - 1);
            const isMaster = idx === 0;
            const docPageNum = isMaster ? 1 : Math.max(1, idx);
            return { isMaster, docPageNum, totalDocPages, pageIndex: idx };
        }
        const totalDocPages = Math.max(1, pages.length);
        const docPageNum = Math.max(1, idx + 1);
        return { isMaster: false, docPageNum, totalDocPages, pageIndex: idx };
    }

    function formatPageNumberText(pageNum, totalPages, format) {
        const p = Math.max(1, parseInt(pageNum, 10) || 1);
        const t = Math.max(p, parseInt(totalPages, 10) || 1);
        const fmt = format || (typeof state !== 'undefined' && state.pageNumberFormat) || 'page-n-of-total';
        switch (fmt) {
            case 'number':
            case '1':
                return `${p}`;
            case 'page-n':
            case 'Page 1':
                return `Page ${p}`;
            case 'n-slash-total':
            case '1 / N':
                return `${p} / ${t}`;
            case 'page-n-of-total':
            case 'Page 1 of N':
            default:
                return `Page ${p} of ${t}`;
        }
    }

    function resolvePageNumberTokensInContainer(rootEl, docPageNum, totalDocPages) {
        if (!rootEl || typeof rootEl.querySelectorAll !== 'function') return;
        const defaultFmt = (typeof state !== 'undefined' && state.pageNumberFormat) || 'page-n-of-total';

        // 1. Inline dynamic page number tokens (inside headers, footers, or any text box)
        rootEl.querySelectorAll('.op-page-num-token').forEach(tok => {
            if (tok.getAttribute('data-op-pn-locked') === 'true') return;
            const fmt = tok.getAttribute('data-pn-format') || defaultFmt;
            tok.textContent = formatPageNumberText(docPageNum, totalDocPages, fmt);
        });

        // 2. Standalone draggable page number boxes
        rootEl.querySelectorAll('.pub-element[data-type="page-number"], .pub-thumb-element[data-type="page-number"]').forEach(el => {
            const fmt = el.getAttribute('data-pn-format');
            const content = el.querySelector('.element-content') || el;
            const innerDiv = content.querySelector('div') || content;
            const curSpan = content.querySelector('.pn-current');
            const totSpan = content.querySelector('.pn-total');
            if (fmt && innerDiv) {
                const tok = innerDiv.querySelector('.op-page-num-token');
                if (tok) {
                    if (tok.getAttribute('data-op-pn-locked') === 'true') return;
                    tok.setAttribute('data-pn-format', fmt);
                    tok.textContent = formatPageNumberText(docPageNum, totalDocPages, fmt);
                } else {
                    innerDiv.innerHTML = `<span class="op-page-num-token" contenteditable="false" data-pn-format="${escapeHtml(fmt)}">${escapeHtml(formatPageNumberText(docPageNum, totalDocPages, fmt))}</span>`;
                }
            } else {
                if (curSpan) curSpan.textContent = docPageNum;
                if (totSpan) totSpan.textContent = totalDocPages;
            }
        });
    }

    function updateAllPageNumbers() {
        const paperEl = document.getElementById('paper');
        if (!paperEl || typeof state === 'undefined') return;
        if (state.isSpreadMode) {
            const sm = getSpreadHalfMetrics(state.currentPageIndex);
            paperEl.querySelectorAll('.op-hf-box, .pub-element[data-type="page-number"]').forEach(node => {
                resolvePageNumberTokensInContainer(node, sm.leftDocPageNum, sm.totalSinglePages);
            });
            paperEl.querySelectorAll('.op-hf-spread-mirror').forEach(node => {
                resolvePageNumberTokensInContainer(node, sm.rightDocPageNum, sm.totalSinglePages);
            });
        } else {
            const metrics = getDocumentPageMetrics(state.currentPageIndex);
            resolvePageNumberTokensInContainer(paperEl, metrics.docPageNum, metrics.totalDocPages);
        }

        const metrics = getDocumentPageMetrics(state.currentPageIndex);
        const statusEl = document.getElementById('page-count-status');
        if (statusEl) {
            if (metrics.isMaster) {
                statusEl.innerText = `Master Page (${metrics.totalDocPages} ${metrics.totalDocPages === 1 ? 'page' : 'pages'})`;
            } else if (state.isSpreadMode) {
                const sm = getSpreadHalfMetrics(state.currentPageIndex);
                statusEl.innerText = sm.hasRightPage
                    ? `Pages ${sm.leftDocPageNum}-${sm.rightDocPageNum} of ${sm.totalSinglePages}`
                    : `Page ${sm.leftDocPageNum} of ${sm.totalSinglePages}`;
            } else {
                statusEl.innerText = `Page ${metrics.docPageNum} of ${metrics.totalDocPages}`;
            }
        }
    }

    // -------------------------------------------------------------------------
    // 3. LOCKED-DOWN MASTER PAGE HEADER & FOOTER TEXT BOXES
    // -------------------------------------------------------------------------

    function migrateLegacyHeaderFooterHtml(rawHtml, role) {
        const str = String(rawHtml == null ? '' : rawHtml).trim();
        if (!str || isLegacyPlaceholderText(str)) {
            return `<div class="op-hf-editable" data-hf-mode="single" contenteditable="true" spellcheck="false" style="text-align:left;"></div>`;
        }
        if (str.includes('op-hf-editable') || str.includes('op-hf-zones')) {
            return str;
        }
        return `<div class="op-hf-editable" data-hf-mode="single" contenteditable="true" spellcheck="false" style="text-align:left;">${str}</div>`;
    }

    function computeHeaderFooterGeometry(pageW, pageH, marginsObj) {
        const w = Math.max(240, parseFloat(pageW) || 794);
        const h = Math.max(240, parseFloat(pageH) || 1123);
        const m = marginsObj || (typeof state !== 'undefined' && state.margins) || { top: 48, right: 48, bottom: 48, left: 48 };
        const mL = Math.max(12, Math.round(parseFloat(m.left) || 48));
        const mR = Math.max(12, Math.round(parseFloat(m.right) || 48));
        const mT = Math.max(28, Math.round(parseFloat(m.top) || 48));
        const mB = Math.max(28, Math.round(parseFloat(m.bottom) || 48));

        const boxW = Math.max(120, w - mL - mR);
        const headerTop = Math.max(6, Math.round(Math.min(14, mT * 0.2)));
        const headerH = Math.max(26, Math.min(84, mT - headerTop - 4));
        const footerBottom = Math.max(6, Math.round(Math.min(14, mB * 0.2)));
        const footerH = Math.max(26, Math.min(84, mB - footerBottom - 4));
        const footerTop = Math.max(headerTop + headerH + 20, h - footerBottom - footerH);

        return { left: mL, right: mR, width: boxW, headerTop, headerH, footerTop, footerBottom, footerH };
    }

    function ensureHeaderFooterStructure(paperEl) {
        const targetPaper = paperEl || document.getElementById('paper');
        if (!targetPaper) return { header: null, footer: null };

        const setupBox = (role) => {
            const cls = role === 'header' ? 'page-header' : 'page-footer';
            let box = targetPaper.querySelector('.' + cls);
            if (!box) {
                box = document.createElement('div');
                box.className = cls;
                targetPaper.appendChild(box);
            }
            box.classList.add('op-hf-box');
            box.setAttribute('data-hf-role', role);
            box.setAttribute('data-hf-locked', 'true');
            box.setAttribute('data-locked', 'true');
            box.setAttribute('data-type', 'text');
            box.removeAttribute('contenteditable');

            let content = box.querySelector(':scope > .element-content.op-hf-content');
            if (!content) {
                const oldHtml = box.innerHTML;
                box.innerHTML = '';
                content = document.createElement('div');
                content.className = 'element-content op-hf-content';
                content.innerHTML = migrateLegacyHeaderFooterHtml(oldHtml, role);
                box.appendChild(content);
            }
            bindHeaderFooterBoxEvents(box);
            return box;
        };

        const header = setupBox('header');
        const footer = setupBox('footer');
        syncHeaderFooterGeometry(targetPaper);
        return { header, footer };
    }

    function syncHeaderFooterGeometry(paperEl) {
        const targetPaper = paperEl || document.getElementById('paper');
        if (!targetPaper) return;
        const pageW = parseFloat(targetPaper.style.width) || targetPaper.offsetWidth || 794;
        const pageH = parseFloat(targetPaper.style.height) || targetPaper.offsetHeight || 1123;
        const isSpread = !!(typeof state !== 'undefined' && state && state.isSpreadMode);
        const slotW = isSpread ? (pageW / 2) : pageW;
        const geom = computeHeaderFooterGeometry(slotW, pageH, typeof state !== 'undefined' ? state.margins : null);

        const hdr = targetPaper.querySelector('.page-header');
        const ftr = targetPaper.querySelector('.page-footer');
        if (hdr) {
            hdr.style.left = geom.left + 'px';
            hdr.style.right = 'auto';
            hdr.style.width = geom.width + 'px';
            hdr.style.top = geom.headerTop + 'px';
            hdr.style.bottom = 'auto';
            hdr.style.minHeight = geom.headerH + 'px';
            hdr.style.height = 'auto';
        }
        if (ftr) {
            ftr.style.left = geom.left + 'px';
            ftr.style.right = 'auto';
            ftr.style.width = geom.width + 'px';
            ftr.style.top = 'auto';
            ftr.style.bottom = geom.footerBottom + 'px';
            ftr.style.minHeight = geom.footerH + 'px';
            ftr.style.height = 'auto';
        }
        const mirrorHdr = targetPaper.querySelector('.op-hf-spread-header-mirror');
        const mirrorFtr = targetPaper.querySelector('.op-hf-spread-footer-mirror');
        if (mirrorHdr) {
            mirrorHdr.style.left = (slotW + geom.left) + 'px';
            mirrorHdr.style.right = 'auto';
            mirrorHdr.style.width = geom.width + 'px';
            mirrorHdr.style.top = geom.headerTop + 'px';
            mirrorHdr.style.bottom = 'auto';
            mirrorHdr.style.minHeight = geom.headerH + 'px';
            mirrorHdr.style.height = 'auto';
        }
        if (mirrorFtr) {
            mirrorFtr.style.left = (slotW + geom.left) + 'px';
            mirrorFtr.style.right = 'auto';
            mirrorFtr.style.width = geom.width + 'px';
            mirrorFtr.style.top = 'auto';
            mirrorFtr.style.bottom = geom.footerBottom + 'px';
            mirrorFtr.style.minHeight = geom.footerH + 'px';
            mirrorFtr.style.height = 'auto';
        }
    }

    function getActiveHfEditable(boxEl) {
        const box = (boxEl && boxEl.classList && boxEl.classList.contains('op-hf-box'))
            ? boxEl
            : getActiveHfBox();
        if (!box) return null;

        const active = document.activeElement;
        if (active && box.contains(active) && active.isContentEditable) {
            return active;
        }
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && sel.anchorNode) {
            const anchorEl = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
            if (anchorEl && box.contains(anchorEl)) {
                const ed = anchorEl.closest('[contenteditable="true"]');
                if (ed && box.contains(ed)) return ed;
            }
        }
        if (typeof state !== 'undefined' && state.lastRange && state.lastRange.startContainer && state.lastRange.startContainer.isConnected) {
            const sc = state.lastRange.startContainer;
            const scEl = sc.nodeType === 1 ? sc : sc.parentElement;
            if (scEl && box.contains(scEl)) {
                const ed = scEl.closest('[contenteditable="true"]');
                if (ed && box.contains(ed)) return ed;
            }
        }
        if (box._lastActiveEditable && box.contains(box._lastActiveEditable) && box._lastActiveEditable.getAttribute('contenteditable') === 'true') {
            return box._lastActiveEditable;
        }
        return box.querySelector('.op-hf-zone[contenteditable="true"], .op-hf-editable[contenteditable="true"], [contenteditable="true"]');
    }

    function getActiveHfBox() {
        const paperEl = document.getElementById('paper');
        if (!paperEl) return null;
        if (typeof state !== 'undefined' && state.selectedEl && state.selectedEl.classList && state.selectedEl.classList.contains('op-hf-box')) {
            return state.selectedEl;
        }
        const active = document.activeElement;
        if (active && active.closest) {
            const b = active.closest('.op-hf-box');
            if (b && paperEl.contains(b)) return b;
        }
        if (window._lastActiveHfRole) {
            const b = paperEl.querySelector(`.op-hf-box[data-hf-role="${window._lastActiveHfRole}"]`);
            if (b) return b;
        }
        return paperEl.querySelector('.page-header.op-hf-box');
    }

    function selectHeaderFooterBox(box, focusEditable) {
        if (!box) return;
        const role = box.getAttribute('data-hf-role') || 'header';
        window._lastActiveHfRole = role;

        if (typeof state !== 'undefined' && state.selectedEl !== box) {
            if (typeof window.selectElement === 'function') {
                window.selectElement(box);
            } else {
                state.selectedEl = box;
                box.classList.add('selected');
            }
        }
        if (focusEditable && focusEditable.getAttribute('contenteditable') === 'true') {
            box._lastActiveEditable = focusEditable;
        }
        syncHeaderFooterRibbonState();
        if (typeof window.updateFloatToolbarValues === 'function') {
            setTimeout(() => window.updateFloatToolbarValues(), 0);
        }
    }

    function bindHeaderFooterBoxEvents(box) {
        if (!box || box._hfEventsBound) return;
        box._hfEventsBound = true;

        box.addEventListener('mousedown', (e) => {
            if (!isEditingMasterPage()) {
                return;
            }
            e.stopPropagation();
            const zone = e.target.closest('.op-hf-zone, .op-hf-editable');
            const targetEd = zone || getActiveHfEditable(box);
            selectHeaderFooterBox(box, targetEd);
            if (!zone && targetEd && document.activeElement !== targetEd) {
                setTimeout(() => focusEditableAtEnd(targetEd), 0);
            }
        });

        box.addEventListener('focusin', (e) => {
            if (!isEditingMasterPage()) return;
            const ed = e.target.closest('[contenteditable="true"]');
            if (ed && box.contains(ed)) {
                box._lastActiveEditable = ed;
                selectHeaderFooterBox(box, ed);
            }
        });

        box.addEventListener('keydown', (e) => {
            if (!isEditingMasterPage()) return;
            const ed = e.target.closest('[contenteditable="true"]');
            if (!ed) return;

            if (e.key === 'Tab') {
                e.preventDefault();
                e.stopPropagation();
                const content = box.querySelector(':scope > .op-hf-content');
                if (!content) return;
                let zones = content.querySelector('.op-hf-zones');
                if (!zones) {
                    setHeaderFooterLayoutMode(box, '3zone', true);
                    zones = content.querySelector('.op-hf-zones');
                    const centerZone = zones && zones.querySelector('[data-hf-zone="center"]');
                    if (centerZone) {
                        box._lastActiveEditable = centerZone;
                        focusEditableAtEnd(centerZone);
                        syncHeaderFooterRibbonState();
                    }
                    return;
                }
                const list = Array.from(zones.querySelectorAll('.op-hf-zone'));
                const idx = list.indexOf(ed);
                const nextIdx = e.shiftKey ? Math.max(0, idx - 1) : Math.min(list.length - 1, idx + 1);
                if (list[nextIdx]) {
                    box._lastActiveEditable = list[nextIdx];
                    focusEditableAtEnd(list[nextIdx]);
                    syncHeaderFooterRibbonState();
                }
            }
        });

        box.addEventListener('input', () => {
            if (!isEditingMasterPage()) return;
            syncMasterHeaderFooterToState();
            if (typeof window.pushHistory === 'function') window.pushHistory();
        });

        box.addEventListener('keyup', () => {
            if (!isEditingMasterPage()) return;
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0 && box.contains(sel.anchorNode)) {
                state.lastRange = sel.getRangeAt(0).cloneRange();
            }
            syncHeaderFooterRibbonState();
            if (typeof window.updateFloatToolbarValues === 'function') window.updateFloatToolbarValues();
        });

        box.addEventListener('mouseup', () => {
            if (!isEditingMasterPage()) return;
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0 && box.contains(sel.anchorNode)) {
                state.lastRange = sel.getRangeAt(0).cloneRange();
            }
            syncHeaderFooterRibbonState();
            if (typeof window.updateFloatToolbarValues === 'function') window.updateFloatToolbarValues();
        });
    }

    function focusEditableAtEnd(el) {
        if (!el) return;
        el.focus();
        try {
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            if (typeof state !== 'undefined') state.lastRange = range.cloneRange();
        } catch (e) {}
    }

    function buildSpreadMirrorElement(role, innerMarkup, docPageNum, totalDocPages) {
        const cls = role === 'header' ? 'op-hf-spread-header-mirror' : 'op-hf-spread-footer-mirror';
        const el = document.createElement('div');
        el.className = `op-hf-spread-mirror ${cls}`;
        el.setAttribute('data-hf-mirror', role);
        const content = document.createElement('div');
        content.className = 'element-content op-hf-content';
        content.innerHTML = innerMarkup || '';
        content.querySelectorAll('[contenteditable="true"]').forEach(n => n.setAttribute('contenteditable', 'false'));
        content.querySelectorAll('[data-placeholder]').forEach(n => n.removeAttribute('data-placeholder'));
        el.appendChild(content);
        resolvePageNumberTokensInContainer(content, docPageNum, totalDocPages);
        return el;
    }

    function syncMasterHeaderFooterToState() {
        if (typeof state === 'undefined' || !state.pages || !state.pages[state.currentPageIndex]) return;
        const paperEl = document.getElementById('paper');
        if (!paperEl) return;
        const hdrContent = paperEl.querySelector('.page-header > .op-hf-content');
        const ftrContent = paperEl.querySelector('.page-footer > .op-hf-content');
        if (isEditingMasterPage() && state.pages[0]) {
            if (hdrContent) state.pages[0].header = hdrContent.innerHTML;
            if (ftrContent) state.pages[0].footer = ftrContent.innerHTML;
            if (state.isSpreadMode) {
                const sm = getSpreadHalfMetrics(0);
                const mHdrContent = paperEl.querySelector('.op-hf-spread-header-mirror > .op-hf-content');
                const mFtrContent = paperEl.querySelector('.op-hf-spread-footer-mirror > .op-hf-content');
                if (mHdrContent && hdrContent) {
                    mHdrContent.innerHTML = hdrContent.innerHTML;
                    mHdrContent.querySelectorAll('[contenteditable="true"]').forEach(n => n.setAttribute('contenteditable', 'false'));
                    mHdrContent.querySelectorAll('[data-placeholder]').forEach(n => n.removeAttribute('data-placeholder'));
                    resolvePageNumberTokensInContainer(mHdrContent, sm.rightDocPageNum, sm.totalSinglePages);
                }
                if (mFtrContent && ftrContent) {
                    mFtrContent.innerHTML = ftrContent.innerHTML;
                    mFtrContent.querySelectorAll('[contenteditable="true"]').forEach(n => n.setAttribute('contenteditable', 'false'));
                    mFtrContent.querySelectorAll('[data-placeholder]').forEach(n => n.removeAttribute('data-placeholder'));
                    resolvePageNumberTokensInContainer(mFtrContent, sm.rightDocPageNum, sm.totalSinglePages);
                }
            }
        }
    }

    function shouldSuppressHeaderFooterOnPage(pageData, pageIndex, overrideDocPageNum) {
        if (typeof state === 'undefined' || !state.headersVisible) return true;
        const metrics = getDocumentPageMetrics(pageIndex);
        if (metrics.isMaster) return false;
        if (pageData && pageData.ignoreMasterPage) return true;
        const docPageNum = (typeof overrideDocPageNum === 'number') ? overrideDocPageNum : metrics.docPageNum;
        if (state.showHeaderFooterOnFirstPage === false && docPageNum === 1) {
            return true;
        }
        return false;
    }

    function renderHeaderFooterOnPaper(paperEl, pageData, pageIndex) {
        const targetPaper = paperEl || document.getElementById('paper');
        if (!targetPaper) return;
        targetPaper.querySelectorAll('.op-hf-spread-mirror').forEach(n => n.remove());
        const { header, footer } = ensureHeaderFooterStructure(targetPaper);
        if (!header || !footer) return;

        const isSpread = !!(typeof state !== 'undefined' && state && state.isSpreadMode);
        const spreadMetrics = isSpread ? getSpreadHalfMetrics(pageIndex) : null;
        const metrics = getDocumentPageMetrics(pageIndex);
        const onMaster = metrics.isMaster;
        const useMasterSource = !!(typeof state !== 'undefined' && state.hasMasterPage && !onMaster && state.pages[0] && !(pageData && pageData.ignoreMasterPage));
        const sourcePage = useMasterSource ? state.pages[0] : (pageData || {});

        const rawHeader = sourcePage.header != null ? sourcePage.header : '';
        const rawFooter = sourcePage.footer != null ? sourcePage.footer : '';

        const headerContent = header.querySelector(':scope > .op-hf-content');
        const footerContent = footer.querySelector(':scope > .op-hf-content');

        const migratedH = migrateLegacyHeaderFooterHtml(rawHeader, 'header');
        const migratedF = migrateLegacyHeaderFooterHtml(rawFooter, 'footer');

        headerContent.innerHTML = migratedH;
        footerContent.innerHTML = migratedF;

        const typo = getEffectiveDocumentTypography();
        const defaultStack = buildFontStack(typo.bodyFont);
        [headerContent, footerContent].forEach(cnt => {
            cnt.querySelectorAll('.op-hf-editable, .op-hf-zone').forEach(ed => {
                if (!ed.style.fontFamily) ed.style.fontFamily = defaultStack;
                ed.setAttribute('contenteditable', onMaster ? 'true' : 'false');
                ed.setAttribute('spellcheck', 'false');
                if (onMaster && state.spellCheck) {
                    ed.setAttribute('lang', navigator.language || 'en');
                }
            });
        });

        const leftDocNum = isSpread ? spreadMetrics.leftDocPageNum : metrics.docPageNum;
        const leftTotal = isSpread ? spreadMetrics.totalSinglePages : metrics.totalDocPages;
        resolvePageNumberTokensInContainer(headerContent, leftDocNum, leftTotal);
        resolvePageNumberTokensInContainer(footerContent, leftDocNum, leftTotal);

        const leftSuppress = isSpread
            ? (onMaster ? !state.headersVisible : (!!(pageData && pageData.ignoreMasterPage) || !state.headersVisible || (state.showHeaderFooterOnFirstPage === false && leftDocNum === 1)))
            : shouldSuppressHeaderFooterOnPage(pageData, pageIndex);
        const showLeftBoxes = onMaster || (!leftSuppress && !!(typeof state !== 'undefined' && state.headersVisible));

        const headerHasContent = onMaster || hasMeaningfulHfContent(headerContent);
        const footerHasContent = onMaster || hasMeaningfulHfContent(footerContent);

        header.classList.toggle('visible', showLeftBoxes && headerHasContent);
        footer.classList.toggle('visible', showLeftBoxes && footerHasContent);
        header.classList.toggle('hf-readonly', !onMaster);
        footer.classList.toggle('hf-readonly', !onMaster);

        if (isSpread && spreadMetrics && spreadMetrics.hasRightPage) {
            const rightSuppress = !onMaster && (!!(pageData && pageData.ignoreMasterPage) || !state.headersVisible || (state.showHeaderFooterOnFirstPage === false && spreadMetrics.rightDocPageNum === 1));
            const showRightBoxes = onMaster ? !!(typeof state !== 'undefined' && state.headersVisible) : (!rightSuppress && !!(typeof state !== 'undefined' && state.headersVisible));
            const rightDocNum = spreadMetrics.rightDocPageNum;
            const rightTotal = spreadMetrics.totalSinglePages;

            const mHdr = buildSpreadMirrorElement('header', headerContent.innerHTML, rightDocNum, rightTotal);
            const mFtr = buildSpreadMirrorElement('footer', footerContent.innerHTML, rightDocNum, rightTotal);
            mHdr.classList.toggle('visible', showRightBoxes && headerHasContent);
            mFtr.classList.toggle('visible', showRightBoxes && footerHasContent);
            targetPaper.appendChild(mHdr);
            targetPaper.appendChild(mFtr);
        }

        syncHeaderFooterGeometry(targetPaper);
        syncMasterPageVisualMode();
    }

    function hasMeaningfulHfContent(containerEl) {
        if (!containerEl) return false;
        if (containerEl.querySelector('.op-page-num-token, img, svg')) return true;
        const txt = (containerEl.textContent || '').replace(/\u00a0/g, ' ').trim();
        return txt.length > 0 && !LEGACY_PLACEHOLDERS.has(txt.toLowerCase());
    }

    function serializeHeaderFooterFromPaper(paperEl, existingPage) {
        const targetPaper = paperEl || document.getElementById('paper');
        const isMaster = isEditingMasterPage();
        if (!isMaster && typeof state !== 'undefined' && state.hasMasterPage) {
            return {
                header: (existingPage && existingPage.header) || '',
                footer: (existingPage && existingPage.footer) || ''
            };
        }
        const hContent = targetPaper ? targetPaper.querySelector('.page-header > .op-hf-content') : null;
        const fContent = targetPaper ? targetPaper.querySelector('.page-footer > .op-hf-content') : null;
        return {
            header: hContent ? hContent.innerHTML : ((existingPage && existingPage.header) || ''),
            footer: fContent ? fContent.innerHTML : ((existingPage && existingPage.footer) || '')
        };
    }

    function setHeaderFooterLayoutMode(boxEl, mode, skipHistory = false) {
        const box = boxEl || getActiveHfBox();
        if (!box) return;
        const content = box.querySelector(':scope > .op-hf-content');
        if (!content) return;
        const typo = getEffectiveDocumentTypography();
        const fontStack = buildFontStack(typo.bodyFont);
        const editableFlag = isEditingMasterPage() ? 'true' : 'false';

        if (mode === '3zone') {
            if (content.querySelector('.op-hf-zones')) {
                syncHeaderFooterRibbonState();
                return;
            }
            const existingSingle = content.querySelector('.op-hf-editable');
            const existingHtml = existingSingle ? existingSingle.innerHTML : content.innerHTML;
            const align = existingSingle ? (existingSingle.style.textAlign || 'left') : 'left';
            const leftHtml = (align === 'left' || !align) ? existingHtml : '';
            const centerHtml = align === 'center' ? existingHtml : '';
            const rightHtml = align === 'right' ? existingHtml : '';
            const extraFont = (existingSingle && existingSingle.style.fontFamily) ? existingSingle.style.fontFamily : fontStack;
            const extraSize = (existingSingle && existingSingle.style.fontSize) ? existingSingle.style.fontSize : '';
            const extraColor = (existingSingle && existingSingle.style.color) ? existingSingle.style.color : '';
            const sharedInline = `font-family:${extraFont};${extraSize ? ' font-size:' + extraSize + ';' : ''}${extraColor ? ' color:' + extraColor + ';' : ''}`;

            content.innerHTML = `
                <div class="op-hf-zones" data-hf-mode="3zone">
                    <div class="op-hf-zone op-hf-zone-left" data-hf-zone="left" contenteditable="${editableFlag}" spellcheck="false" data-placeholder="Left" style="text-align:left; ${sharedInline}">${leftHtml}</div>
                    <div class="op-hf-zone op-hf-zone-center" data-hf-zone="center" contenteditable="${editableFlag}" spellcheck="false" data-placeholder="Center" style="text-align:center; ${sharedInline}">${centerHtml}</div>
                    <div class="op-hf-zone op-hf-zone-right" data-hf-zone="right" contenteditable="${editableFlag}" spellcheck="false" data-placeholder="Right" style="text-align:right; ${sharedInline}">${rightHtml}</div>
                </div>
            `;
            const targetZone = content.querySelector(`[data-hf-zone="${align === 'center' || align === 'right' ? align : 'left'}"]`);
            if (targetZone) {
                box._lastActiveEditable = targetZone;
                if (isEditingMasterPage()) focusEditableAtEnd(targetZone);
            }
        } else {
            const targetAlign = ['left', 'center', 'right'].includes(mode) ? mode : 'left';
            const zonesWrap = content.querySelector('.op-hf-zones');
            if (zonesWrap) {
                const parts = Array.from(zonesWrap.querySelectorAll('.op-hf-zone'))
                    .map(z => z.innerHTML.trim())
                    .filter(h => h && h !== '<br>');
                const merged = parts.join(' &nbsp; ');
                const firstZone = zonesWrap.querySelector('.op-hf-zone');
                const zFont = (firstZone && firstZone.style.fontFamily) || fontStack;
                const zSize = (firstZone && firstZone.style.fontSize) || '';
                const zColor = (firstZone && firstZone.style.color) || '';
                content.innerHTML = `<div class="op-hf-editable" data-hf-mode="single" contenteditable="${editableFlag}" spellcheck="false" style="text-align:${targetAlign}; font-family:${zFont};${zSize ? ' font-size:' + zSize + ';' : ''}${zColor ? ' color:' + zColor + ';' : ''}">${merged}</div>`;
                const ed = content.querySelector('.op-hf-editable');
                if (ed) {
                    box._lastActiveEditable = ed;
                    if (isEditingMasterPage()) focusEditableAtEnd(ed);
                }
            } else {
                let ed = content.querySelector('.op-hf-editable');
                if (!ed) {
                    content.innerHTML = `<div class="op-hf-editable" data-hf-mode="single" contenteditable="${editableFlag}" spellcheck="false" style="text-align:${targetAlign}; font-family:${fontStack};">${content.innerHTML}</div>`;
                    ed = content.querySelector('.op-hf-editable');
                } else {
                    ed.style.textAlign = targetAlign;
                    ed.querySelectorAll('div, p').forEach(block => {
                        block.style.textAlign = targetAlign;
                    });
                }
                if (ed) box._lastActiveEditable = ed;
            }
        }

        syncMasterHeaderFooterToState();
        syncHeaderFooterRibbonState();
        if (!skipHistory && typeof window.pushHistory === 'function') window.pushHistory(true);
    }

    function applyAlignmentToHeaderFooter(align) {
        const box = getActiveHfBox();
        if (!box) return false;
        const content = box.querySelector(':scope > .op-hf-content');
        if (!content) return false;
        const targetAlign = ['left', 'center', 'right'].includes(align) ? align : 'left';
        const zonesWrap = content.querySelector('.op-hf-zones');

        if (zonesWrap) {
            const activeZone = getActiveHfEditable(box);
            if (activeZone && zonesWrap.contains(activeZone)) {
                activeZone.style.textAlign = targetAlign;
                activeZone.querySelectorAll('div, p').forEach(b => { b.style.textAlign = targetAlign; });
            }
        } else {
            setHeaderFooterLayoutMode(box, targetAlign, true);
        }

        syncMasterHeaderFooterToState();
        syncHeaderFooterRibbonState();
        if (typeof window.updateFloatToolbarValues === 'function') window.updateFloatToolbarValues();
        if (typeof window.pushHistory === 'function') window.pushHistory(true);
        return true;
    }

    function applyExecCommandToHeaderFooter(cmd, val) {
        const box = getActiveHfBox();
        if (!box) return false;
        const editable = getActiveHfEditable(box);
        if (!editable) return false;

        if (cmd === 'justifyLeft') return applyAlignmentToHeaderFooter('left');
        if (cmd === 'justifyCenter') return applyAlignmentToHeaderFooter('center');
        if (cmd === 'justifyRight') return applyAlignmentToHeaderFooter('right');

        const sel = window.getSelection();
        let activeRange = null;
        if (sel && sel.rangeCount > 0 && editable.contains(sel.getRangeAt(0).commonAncestorContainer)) {
            activeRange = sel.getRangeAt(0);
        } else if (typeof state !== 'undefined' && state.lastRange && state.lastRange.commonAncestorContainer && state.lastRange.commonAncestorContainer.isConnected && editable.contains(state.lastRange.commonAncestorContainer)) {
            activeRange = state.lastRange;
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(activeRange);
            }
        }
        const hasHighlight = !!(activeRange && !activeRange.collapsed);

        if (cmd === 'fontName') {
            const stack = buildFontStack(val);
            if (hasHighlight) {
                try { document.execCommand('styleWithCSS', false, true); } catch (e) {}
                document.execCommand('fontName', false, val);
                editable.querySelectorAll('font[face]').forEach(f => {
                    f.style.fontFamily = stack;
                    f.removeAttribute('face');
                });
            } else {
                editable.style.fontFamily = stack;
                editable.querySelectorAll('[style*="font-family"], font[face]').forEach(c => {
                    c.style.fontFamily = stack;
                    if (c.hasAttribute('face')) c.removeAttribute('face');
                });
            }
        } else if (cmd === 'foreColor') {
            if (hasHighlight) {
                try { document.execCommand('styleWithCSS', false, true); } catch (e) {}
                document.execCommand('foreColor', false, val);
                editable.querySelectorAll('font[color]').forEach(f => {
                    f.style.color = f.getAttribute('color');
                    f.removeAttribute('color');
                });
            } else {
                editable.style.color = val;
                editable.querySelectorAll('[style*="color"], font[color]').forEach(c => {
                    c.style.color = val;
                    if (c.hasAttribute('color')) c.removeAttribute('color');
                });
            }
        } else if (hasHighlight) {
            try { document.execCommand('styleWithCSS', false, true); } catch (e) {}
            document.execCommand(cmd, false, val);
        } else {
            if (cmd === 'bold') {
                const cur = window.getComputedStyle(editable).fontWeight;
                const isB = cur === 'bold' || parseInt(cur, 10) >= 600;
                editable.style.fontWeight = isB ? 'normal' : 'bold';
            } else if (cmd === 'italic') {
                const cur = window.getComputedStyle(editable).fontStyle;
                editable.style.fontStyle = cur === 'italic' ? 'normal' : 'italic';
            } else if (cmd === 'underline') {
                const cur = window.getComputedStyle(editable).textDecorationLine || '';
                editable.style.textDecoration = cur.includes('underline') ? 'none' : 'underline';
            } else if (cmd === 'strikeThrough') {
                const cur = window.getComputedStyle(editable).textDecorationLine || '';
                editable.style.textDecoration = cur.includes('line-through') ? 'none' : 'line-through';
            } else {
                document.execCommand(cmd, false, val);
            }
        }

        try { document.execCommand('styleWithCSS', false, false); } catch (e) {}
        editable.focus();
        box._lastActiveEditable = editable;
        if (sel && sel.rangeCount > 0 && editable.contains(sel.getRangeAt(0).commonAncestorContainer)) {
            state.lastRange = sel.getRangeAt(0).cloneRange();
        }
        syncMasterHeaderFooterToState();
        syncHeaderFooterRibbonState();
        if (typeof window.syncFormatButtonHighlights === 'function') window.syncFormatButtonHighlights(editable);
        if (typeof window.updateFloatToolbarValues === 'function') window.updateFloatToolbarValues();
        if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
        if (typeof window.pushHistory === 'function') window.pushHistory(true);
        return true;
    }

    function insertNodeAtHeaderFooterCursor(node) {
        const box = getActiveHfBox();
        if (!box) return false;
        const editable = getActiveHfEditable(box);
        if (!editable || editable.getAttribute('contenteditable') !== 'true') return false;

        editable.focus();
        const sel = window.getSelection();
        let range = null;

        if (sel && sel.rangeCount > 0 && editable.contains(sel.getRangeAt(0).commonAncestorContainer)) {
            range = sel.getRangeAt(0);
        } else if (typeof state !== 'undefined' && state.lastRange && state.lastRange.startContainer && state.lastRange.startContainer.isConnected && editable.contains(state.lastRange.startContainer)) {
            range = state.lastRange.cloneRange();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else {
            range = document.createRange();
            range.selectNodeContents(editable);
            range.collapse(false);
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }

        if (!range.collapsed) {
            range.deleteContents();
        }
        range.insertNode(node);

        const afterRange = document.createRange();
        afterRange.setStartAfter(node);
        afterRange.collapse(true);
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(afterRange);
        }
        if (typeof state !== 'undefined') state.lastRange = afterRange.cloneRange();
        box._lastActiveEditable = editable;

        syncMasterHeaderFooterToState();
        if (typeof window.pushHistory === 'function') window.pushHistory(true);
        if (typeof window.updateThumbnails === 'function') window.updateThumbnails();
        return true;
    }

    function insertDynamicPageNumberInHeaderFooter(formatOverride) {
        if (!isEditingMasterPage()) {
            enterMasterPageMode('footer');
        }
        const fmtSel = document.getElementById('hf-page-num-format');
        const fmt = formatOverride || (fmtSel && fmtSel.value) || (typeof state !== 'undefined' && state.pageNumberFormat) || 'page-n-of-total';
        if (typeof state !== 'undefined') state.pageNumberFormat = fmt;

        const metrics = getDocumentPageMetrics(state.currentPageIndex);
        const span = document.createElement('span');
        span.className = 'op-page-num-token';
        span.setAttribute('contenteditable', 'false');
        span.setAttribute('data-pn-format', fmt);
        span.textContent = formatPageNumberText(metrics.docPageNum, metrics.totalDocPages, fmt);

        const ok = insertNodeAtHeaderFooterCursor(span);
        if (ok) {
            updateAllPageNumbers();
            if (typeof window.showToast === 'function') {
                const labelObj = PAGE_NUMBER_FORMATS.find(f => f.id === fmt);
                window.showToast(`Inserted dynamic Page Number (${labelObj ? labelObj.label : fmt}).`);
            }
        }
        return ok;
    }

    function formatDateTimeValue(formatKey) {
        const now = new Date();
        switch (formatKey) {
            case 'short':
                return now.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
            case 'medium':
                return now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            case 'datetime':
                return now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' +
                    now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
            case 'long':
            default:
                return now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        }
    }

    function insertDateTimeInHeaderFooter(formatKey) {
        if (!isEditingMasterPage()) {
            enterMasterPageMode('header');
        }
        const text = formatDateTimeValue(formatKey || 'long');
        const node = document.createTextNode(text);
        const ok = insertNodeAtHeaderFooterCursor(node);
        if (ok && typeof window.showToast === 'function') {
            window.showToast(`Inserted date: ${text}`);
        }
        return ok;
    }

    function setShowHeaderFooterOnFirstPage(show) {
        if (typeof state === 'undefined') return;
        state.showHeaderFooterOnFirstPage = !!show;
        syncHeaderFooterRibbonState();
        const paperEl = document.getElementById('paper');
        if (paperEl && state.pages && state.pages[state.currentPageIndex]) {
            renderHeaderFooterOnPaper(paperEl, state.pages[state.currentPageIndex], state.currentPageIndex);
        }
        if (typeof window.updateSidebar === 'function') window.updateSidebar();
        if (typeof window.pushHistory === 'function') window.pushHistory(true);
    }

    // -------------------------------------------------------------------------
    // 4. MASTER PAGE VISUAL EDIT MODE, TOP WORKSPACE BAR & CONTEXTUAL RIBBON
    // -------------------------------------------------------------------------

    function ensureMasterPageEditBar() {
        let bar = document.getElementById('master-page-edit-bar');
        if (bar) return bar;
        const workspace = document.querySelector('.workspace');
        if (!workspace || !workspace.parentNode) return null;

        bar = document.createElement('div');
        bar.id = 'master-page-edit-bar';
        bar.className = 'op-master-edit-bar no-print';
        bar.innerHTML = `
            <div class="op-master-bar-left">
                <span class="op-master-bar-badge"><i class="fas fa-layer-group"></i> Editing Master Page</span>
                <span class="op-master-bar-hint">Headers, footers, page numbers, and shared elements placed here repeat across document pages. Press Tab inside a header or footer for 3-Zone alignment.</span>
            </div>
            <div class="op-master-bar-actions">
                <button type="button" class="op-master-bar-help-btn" id="btn-bar-master-help" title="Master Page, Header & Footer Help">
                    <i class="fas fa-question"></i>
                </button>
                <button type="button" class="op-master-close-btn" id="btn-bar-close-master-page">
                    <i class="fas fa-times-circle"></i> Close Master Page
                </button>
            </div>
        `;
        workspace.parentNode.insertBefore(bar, workspace);

        bar.querySelector('#btn-bar-close-master-page').addEventListener('click', () => {
            exitMasterPageMode();
        });
        bar.querySelector('#btn-bar-master-help').addEventListener('click', () => {
            if (window.OpenPublisherHelp && typeof window.OpenPublisherHelp.open === 'function') {
                window.OpenPublisherHelp.open('master-header-footer');
            }
        });
        return bar;
    }

    function ensureHeaderFooterContextualTab() {
        const tabsC = document.querySelector('.ribbon-tabs');
        const ribC = document.querySelector('.ribbon-container');
        if (!tabsC || !ribC) return;

        if (!document.getElementById('tab-header-footer')) {
            tabsC.insertAdjacentHTML('beforeend',
                `<div class="tab contextual-tab tab-header-footer" onclick="switchTab('header-footer')" id="tab-header-footer">Header &amp; Footer Tools</div>`
            );
        }

        if (!document.getElementById('ribbon-header-footer')) {
            const curFmt = (typeof state !== 'undefined' && state.pageNumberFormat) || 'page-n-of-total';
            const curFmtObj = PAGE_NUMBER_FORMATS.find(f => f.id === curFmt) || PAGE_NUMBER_FORMATS[2];

            ribC.insertAdjacentHTML('beforeend', `
                <div class="ribbon-toolbar contextual-toolbar" id="ribbon-header-footer">
                    <div class="group">
                        <div style="display:flex; align-items:center; gap:6px; height:100%; padding:0 4px;">
                            <div class="tool-btn" id="btn-hf-insert-pagenum" onmousedown="event.preventDefault()" onclick="window.MasterHeaderFooterEngine.insertDynamicPageNumber()" title="Insert Dynamic Page Number at Cursor">
                                <i class="fas fa-hashtag" style="color:var(--ui-theme-color);"></i>Insert Page<br>Number
                            </div>
                            <div style="display:flex; flex-direction:column; justify-content:center; gap:3px;">
                                <label style="font-size:10px; font-weight:700; opacity:0.8;">Format:</label>
                                <input type="hidden" id="hf-page-num-format" value="${escapeHtml(curFmtObj.id)}">
                                <div class="modern-select" id="hf-pn-format-btn" style="width:126px; height:24px;" onmousedown="event.preventDefault()" onclick="if(window.MasterHeaderFooterEngine) window.MasterHeaderFooterEngine.togglePageNumberFormatDropdown(this); event.stopPropagation();" title="Dynamic Page Number Format">
                                    <span id="hf-pn-format-label">${escapeHtml(curFmtObj.label)}</span>
                                    <div class="arrow-box"><i class="fas fa-chevron-down" style="font-size:10px;"></i></div>
                                </div>
                            </div>
                            <div class="tool-btn" id="btn-hf-insert-datetime" onmousedown="event.preventDefault()" onclick="window.MasterHeaderFooterEngine.insertDateTime('long')" title="Insert Current Date at Cursor">
                                <i class="far fa-calendar-alt" style="color:var(--ui-theme-color);"></i>Date /<br>Time
                            </div>
                        </div>
                        <div class="group-label">Insert</div>
                    </div>

                    <div class="group">
                        <div class="tool-btn" id="btn-hf-align-left" onmousedown="event.preventDefault()" onclick="window.MasterHeaderFooterEngine.setAlignment('left')" title="Align Left (Full Width)">
                            <i class="fas fa-align-left" style="color:var(--ui-theme-color);"></i>Left
                        </div>
                        <div class="tool-btn" id="btn-hf-align-center" onmousedown="event.preventDefault()" onclick="window.MasterHeaderFooterEngine.setAlignment('center')" title="Align Center (Full Width)">
                            <i class="fas fa-align-center" style="color:var(--ui-theme-color);"></i>Center
                        </div>
                        <div class="tool-btn" id="btn-hf-align-right" onmousedown="event.preventDefault()" onclick="window.MasterHeaderFooterEngine.setAlignment('right')" title="Align Right (Full Width)">
                            <i class="fas fa-align-right" style="color:var(--ui-theme-color);"></i>Right
                        </div>
                        <div class="tool-btn" id="btn-hf-align-3zone" onmousedown="event.preventDefault()" onclick="window.MasterHeaderFooterEngine.toggleThreeZone()" title="3-Zone Newsletter Layout (Left, Center, and Right on the same line)">
                            <i class="fas fa-columns" style="color:var(--ui-theme-color);"></i>3-Zone
                        </div>
                        <div class="group-label">Header &amp; Footer Layout</div>
                    </div>

                    <div class="group">
                        <div class="tool-btn" id="btn-hf-goto-header" onmousedown="event.preventDefault()" onclick="window.MasterHeaderFooterEngine.focusZone('header')" title="Jump to Master Page Header">
                            <i class="fas fa-arrow-up" style="color:var(--ui-theme-color);"></i>Go to<br>Header
                        </div>
                        <div class="tool-btn" id="btn-hf-goto-footer" onmousedown="event.preventDefault()" onclick="window.MasterHeaderFooterEngine.focusZone('footer')" title="Jump to Master Page Footer">
                            <i class="fas fa-arrow-down" style="color:var(--ui-theme-color);"></i>Go to<br>Footer
                        </div>
                        <div style="display:flex; align-items:center; padding:0 8px; height:100%;">
                            <label class="op-hf-firstpage-label" title="Uncheck to hide Header, Footer, and Page Numbers on Page 1 covers">
                                <input type="checkbox" id="hf-show-first-page" checked onchange="window.MasterHeaderFooterEngine.setShowHeaderFooterOnFirstPage(this.checked)">
                                <span>Show Header &amp; Footer<br>on First Page</span>
                            </label>
                        </div>
                        <div class="group-label">Navigation &amp; Options</div>
                    </div>

                    <div class="group">
                        <div class="tool-btn op-hf-close-ribbon-btn" id="btn-ribbon-close-master-page" onclick="window.MasterHeaderFooterEngine.exitMasterPageMode()" title="Exit Master Page and return to normal document pages">
                            <i class="fas fa-times-circle"></i>Close Master<br>Page
                        </div>
                        <div class="tool-btn" id="btn-hf-ribbon-help" onclick="if(window.OpenPublisherHelp) window.OpenPublisherHelp.open('master-header-footer')" title="Master Page & Header/Footer Help">
                            <i class="fas fa-question-circle" style="color:var(--ui-theme-color);"></i>Help
                        </div>
                        <div class="group-label">Master Page</div>
                    </div>
                </div>
            `);

            if (typeof window.initRibbonResponsiveness === 'function') {
                window.initRibbonResponsiveness();
            }
        }
    }

    function setPageNumberFormat(fmtId) {
        const fmtObj = PAGE_NUMBER_FORMATS.find(f => f.id === fmtId) || PAGE_NUMBER_FORMATS[2];
        if (typeof state !== 'undefined') state.pageNumberFormat = fmtObj.id;
        const hiddenInp = document.getElementById('hf-page-num-format');
        if (hiddenInp) hiddenInp.value = fmtObj.id;
        const lbl = document.getElementById('hf-pn-format-label');
        if (lbl) lbl.textContent = fmtObj.label;

        if (typeof state !== 'undefined' && state.selectedEl && state.selectedEl.getAttribute && state.selectedEl.getAttribute('data-type') === 'page-number') {
            state.selectedEl.setAttribute('data-pn-format', fmtObj.id);
            updateAllPageNumbers();
            if (typeof window.pushHistory === 'function') window.pushHistory(true);
        }
        syncHeaderFooterRibbonState();
    }

    function togglePageNumberFormatDropdown(triggerEl) {
        let menu = document.getElementById('hf-pn-format-dropdown');
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'hf-pn-format-dropdown';
            menu.className = 'custom-dropdown op-hf-pn-dropdown';
            document.body.appendChild(menu);
        }

        const wasOpen = menu.style.display === 'block';
        document.querySelectorAll('.custom-dropdown, .dropdown-menu').forEach(d => { d.style.display = 'none'; });
        if (wasOpen) return;

        const hiddenInp = document.getElementById('hf-page-num-format');
        const curFmt = (hiddenInp && hiddenInp.value) || (typeof state !== 'undefined' && state.pageNumberFormat) || 'page-n-of-total';

        menu.innerHTML = PAGE_NUMBER_FORMATS.map(f => {
            const hl = f.id === curFmt ? ' highlighted' : '';
            return `<div class="font-item op-hf-pn-item${hl}" data-pn-fmt-id="${escapeHtml(f.id)}" onmousedown="event.preventDefault()"><span>${escapeHtml(f.label)}</span><span class="op-hf-pn-sample">${escapeHtml(f.sample)}</span></div>`;
        }).join('');

        menu.querySelectorAll('.op-hf-pn-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = item.getAttribute('data-pn-fmt-id');
                setPageNumberFormat(id);
                menu.style.display = 'none';
            });
        });

        const anchor = triggerEl || document.getElementById('hf-pn-format-btn');
        menu.style.display = 'block';
        menu.style.position = 'fixed';
        menu.style.zIndex = '999999';
        menu.style.width = '196px';
        menu.style.right = 'auto';
        if (anchor && typeof anchor.getBoundingClientRect === 'function') {
            const rect = anchor.getBoundingClientRect();
            const vw = window.innerWidth || 1280;
            menu.style.left = Math.max(8, Math.min(rect.left, vw - 204)) + 'px';
            menu.style.top = (rect.bottom + 2) + 'px';
        }
    }

    function syncHeaderFooterRibbonState() {
        const showFirstCb = document.getElementById('hf-show-first-page');
        if (showFirstCb && typeof state !== 'undefined') {
            showFirstCb.checked = state.showHeaderFooterOnFirstPage !== false;
        }
        const curFmt = (typeof state !== 'undefined' && state.pageNumberFormat) || 'page-n-of-total';
        const fmtObj = PAGE_NUMBER_FORMATS.find(f => f.id === curFmt) || PAGE_NUMBER_FORMATS[2];
        const fmtSel = document.getElementById('hf-page-num-format');
        if (fmtSel) {
            fmtSel.value = fmtObj.id;
        }
        const fmtLbl = document.getElementById('hf-pn-format-label');
        if (fmtLbl) {
            fmtLbl.textContent = fmtObj.label;
        }
        const openPnMenu = document.getElementById('hf-pn-format-dropdown');
        if (openPnMenu && openPnMenu.style.display === 'block') {
            openPnMenu.querySelectorAll('.op-hf-pn-item').forEach(item => {
                item.classList.toggle('highlighted', item.getAttribute('data-pn-fmt-id') === fmtObj.id);
            });
        }

        const box = getActiveHfBox();
        const is3Zone = !!(box && box.querySelector('.op-hf-zones'));
        let activeAlign = 'left';
        if (box) {
            const ed = getActiveHfEditable(box);
            if (ed) {
                const ta = (ed.style.textAlign || window.getComputedStyle(ed).textAlign || 'left').toLowerCase();
                if (ta.includes('center')) activeAlign = 'center';
                else if (ta.includes('right')) activeAlign = 'right';
                else activeAlign = 'left';
            }
        }

        const bL = document.getElementById('btn-hf-align-left');
        const bC = document.getElementById('btn-hf-align-center');
        const bR = document.getElementById('btn-hf-align-right');
        const b3 = document.getElementById('btn-hf-align-3zone');
        if (bL) bL.classList.toggle('active-tool', !is3Zone && activeAlign === 'left');
        if (bC) bC.classList.toggle('active-tool', !is3Zone && activeAlign === 'center');
        if (bR) bR.classList.toggle('active-tool', !is3Zone && activeAlign === 'right');
        if (b3) b3.classList.toggle('active-tool', is3Zone);

        if (box && typeof state !== 'undefined' && state.selectedEl === box) {
            const hL = document.getElementById('btn-align-left');
            const hC = document.getElementById('btn-align-center');
            const hR = document.getElementById('btn-align-right');
            if (hL) hL.classList.toggle('active-tool', activeAlign === 'left');
            if (hC) hC.classList.toggle('active-tool', activeAlign === 'center');
            if (hR) hR.classList.toggle('active-tool', activeAlign === 'right');
        }
    }

    function syncMasterPageVisualMode(autoSwitchToHfTab) {
        ensureMasterPageEditBar();
        ensureHeaderFooterContextualTab();

        const onMaster = isEditingMasterPage();
        const paperEl = document.getElementById('paper');
        const bar = document.getElementById('master-page-edit-bar');
        const hfTab = document.getElementById('tab-header-footer');

        if (paperEl) paperEl.classList.toggle('master-page-editing', onMaster);
        if (document.body) document.body.classList.toggle('editing-master-page', onMaster);
        if (bar) bar.style.display = onMaster ? 'flex' : 'none';

        if (hfTab) {
            hfTab.style.display = onMaster ? 'inline-block' : 'none';
        }

        document.querySelectorAll('.hf-toggle-btn, #ribbon-design-hf-btn, #ribbon-insert-hf-btn').forEach(btn => {
            btn.classList.toggle('active', onMaster);
        });

        const hoverPill = document.getElementById('op-hf-hover-pill');
        if (hoverPill) hoverPill.remove();

        if (onMaster) {
            syncHeaderFooterRibbonState();
            if (autoSwitchToHfTab) {
                window._isAutoRibbonSwitch = true;
                try {
                    if (typeof window.switchTab === 'function') window.switchTab('header-footer');
                } finally {
                    window._isAutoRibbonSwitch = false;
                }
            }
        } else {
            const activeTab = document.querySelector('.tab.active');
            if (activeTab && activeTab.id === 'tab-header-footer') {
                window._isAutoRibbonSwitch = true;
                try {
                    if (typeof window.switchTab === 'function') window.switchTab(window.lastStandardTab || 'home');
                } finally {
                    window._isAutoRibbonSwitch = false;
                }
            }
        }
    }

    function focusHeaderFooterZone(role) {
        const paperEl = document.getElementById('paper');
        if (!paperEl) return;
        const box = paperEl.querySelector(`.op-hf-box[data-hf-role="${role === 'footer' ? 'footer' : 'header'}"]`);
        if (!box) return;
        const ed = getActiveHfEditable(box);
        selectHeaderFooterBox(box, ed);
        if (ed) focusEditableAtEnd(ed);
    }

    function enterMasterPageMode(targetRole) {
        if (typeof state === 'undefined') return;
        const role = targetRole === 'footer' ? 'footer' : 'header';
        window._lastActiveHfRole = role;

        if (!state.hasMasterPage) {
            state._lastNonMasterPageIndex = (state.currentPageIndex || 0) + 1;
            const curPage = state.pages[state.currentPageIndex];
            const carryHeader = (curPage && curPage.header && !isLegacyPlaceholderText(curPage.header)) ? curPage.header : '';
            const carryFooter = (curPage && curPage.footer && !isLegacyPlaceholderText(curPage.footer)) ? curPage.footer : '';
            if (typeof window.addMasterPage === 'function') {
                window.addMasterPage();
            }
            if (state.pages[0]) {
                if (carryHeader) state.pages[0].header = migrateLegacyHeaderFooterHtml(carryHeader, 'header');
                if (carryFooter) state.pages[0].footer = migrateLegacyHeaderFooterHtml(carryFooter, 'footer');
            }
        } else if (state.currentPageIndex !== 0) {
            state._lastNonMasterPageIndex = state.currentPageIndex;
            if (typeof window.switchPage === 'function') {
                window.switchPage(0);
            }
        }

        if (!state.headersVisible && typeof window.toggleHeaderFooter === 'function') {
            window.toggleHeaderFooter(true, true);
        }

        const paperEl = document.getElementById('paper');
        if (paperEl && state.pages[0]) {
            renderHeaderFooterOnPaper(paperEl, state.pages[0], 0);
        }

        syncMasterPageVisualMode(true);

        setTimeout(() => {
            focusHeaderFooterZone(role);
            syncHeaderFooterRibbonState();
        }, 30);
    }

    function exitMasterPageMode() {
        if (typeof state === 'undefined') return;
        syncMasterHeaderFooterToState();
        if (typeof window.deselect === 'function') window.deselect();

        if (!state.hasMasterPage || state.currentPageIndex !== 0) {
            syncMasterPageVisualMode(false);
            return;
        }

        let targetIdx = (typeof state._lastNonMasterPageIndex === 'number' && state._lastNonMasterPageIndex >= 1 && state._lastNonMasterPageIndex < state.pages.length)
            ? state._lastNonMasterPageIndex
            : 1;

        if (state.pages.length <= 1) {
            if (typeof window.addNewPage === 'function') {
                window.addNewPage();
                syncMasterPageVisualMode(false);
                return;
            }
            targetIdx = 0;
        }

        if (typeof window.switchPage === 'function') {
            window.switchPage(targetIdx);
        }
        syncMasterPageVisualMode(false);
        if (typeof window.updateSidebar === 'function') window.updateSidebar();
    }

    // -------------------------------------------------------------------------
    // 5. SUBTLE NON-BLOCKING HOVER PILL ON NORMAL PAGES
    // -------------------------------------------------------------------------

    function initHeaderFooterHoverPill() {
        const stale = document.getElementById('op-hf-hover-pill');
        if (stale) stale.remove();
    }

    // -------------------------------------------------------------------------
    // 6. EXPORT / PRINT HEADER & FOOTER BUILDER (ZERO YELLOW TINT / ZERO OUTLINES)
    // -------------------------------------------------------------------------

    function buildExportHeaderFooterHtml(page, pageIndex, docPageNum, totalDocPages) {
        if (typeof state === 'undefined' || !state.headersVisible) return '';

        const pW = parseFloat(page && page.width) || 794;
        const pH = parseFloat(page && page.height) || 1123;
        const typo = getEffectiveDocumentTypography();
        const fontStack = buildFontStack(typo.bodyFont);
        const masterPage = (state.hasMasterPage && state.pages && state.pages[0]) ? state.pages[0] : null;

        const renderSingleSlotHtml = (srcPage, slotW, offsetX, slotDocPageNum, slotTotalPages, suppressThisSlot) => {
            if (suppressThisSlot || !srcPage) return '';
            const geom = computeHeaderFooterGeometry(slotW, pH, state.margins);

            const buildOne = (role, rawHtml) => {
                if (!rawHtml || isLegacyPlaceholderText(rawHtml)) return '';
                const temp = document.createElement('div');
                temp.innerHTML = migrateLegacyHeaderFooterHtml(rawHtml, role);
                if (!hasMeaningfulHfContent(temp)) return '';

                resolvePageNumberTokensInContainer(temp, slotDocPageNum, slotTotalPages);
                temp.querySelectorAll('.op-page-num-token').forEach(tok => {
                    tok.setAttribute('data-op-pn-locked', 'true');
                });

                temp.querySelectorAll('[contenteditable]').forEach(n => n.removeAttribute('contenteditable'));
                temp.querySelectorAll('[data-placeholder]').forEach(n => n.removeAttribute('data-placeholder'));
                temp.querySelectorAll('.op-hf-zones').forEach(z => {
                    z.style.display = 'flex';
                    z.style.alignItems = 'center';
                    z.style.justifyContent = 'space-between';
                    z.style.gap = '8px';
                    z.style.width = '100%';
                });
                temp.querySelectorAll('.op-hf-zone').forEach(z => {
                    z.style.flex = '1 1 0';
                    z.style.minWidth = '0';
                    z.style.border = 'none';
                    z.style.outline = 'none';
                    z.style.background = 'transparent';
                    z.style.padding = '4px 6px';
                    z.style.boxSizing = 'border-box';
                    if (!z.style.fontFamily) z.style.fontFamily = fontStack;
                    if (!z.style.fontSize) z.style.fontSize = '12px';
                    if (!z.style.color) z.style.color = '#333333';
                });
                temp.querySelectorAll('.op-hf-editable').forEach(ed => {
                    ed.style.width = '100%';
                    ed.style.border = 'none';
                    ed.style.outline = 'none';
                    ed.style.background = 'transparent';
                    ed.style.padding = '4px 6px';
                    ed.style.boxSizing = 'border-box';
                    if (!ed.style.fontFamily) ed.style.fontFamily = fontStack;
                    if (!ed.style.fontSize) ed.style.fontSize = '12px';
                    if (!ed.style.color) ed.style.color = '#333333';
                });

                const posCss = role === 'header'
                    ? `top:${geom.headerTop}px; min-height:${geom.headerH}px;`
                    : `bottom:${geom.footerBottom}px; min-height:${geom.footerH}px;`;

                return `<div class="op-export-hf op-export-${role}" style="position:absolute; left:${offsetX + geom.left}px; width:${geom.width}px; ${posCss} z-index:2000; pointer-events:none; box-sizing:border-box; border:none; outline:none; background:transparent; font-family:${fontStack}; font-size:12px; color:#333333; line-height:1.35;">${temp.innerHTML}</div>`;
            };

            return buildOne('header', srcPage.header) + buildOne('footer', srcPage.footer);
        };

        // Case 1: Booklet imposed sheet with independent left/right half metadata
        if (page && page._bookletHalves) {
            const halves = page._bookletHalves;
            const slotW = parseFloat(halves.singleW) || (pW / 2);
            const total = halves.totalDocPages || totalDocPages;
            const leftHalf = halves.left || {};
            const rightHalf = halves.right || {};
            const leftSrc = masterPage || leftHalf;
            const rightSrc = masterPage || rightHalf;
            const leftSuppress = !!leftHalf.ignoreMasterPage || (leftHalf.docPageNum == null) || (state.showHeaderFooterOnFirstPage === false && leftHalf.docPageNum === 1);
            const rightSuppress = !!rightHalf.ignoreMasterPage || (rightHalf.docPageNum == null) || (state.showHeaderFooterOnFirstPage === false && rightHalf.docPageNum === 1);
            return (
                renderSingleSlotHtml(leftSrc, slotW, 0, leftHalf.docPageNum || 1, total, leftSuppress) +
                renderSingleSlotHtml(rightSrc, slotW, slotW, rightHalf.docPageNum || 1, total, rightSuppress)
            );
        }

        // Case 2: Spread mode page (print/export/sidebar thumbnail)
        if (state.isSpreadMode && !window._isMultiUpPrinting) {
            const slotW = pW / 2;
            const isMasterThumb = !!(state.hasMasterPage && pageIndex === 0);
            const srcPage = (masterPage && pageIndex !== 0) ? masterPage : (page || {});
            const ignorePage = !!(page && page.ignoreMasterPage);
            if (isMasterThumb) {
                const sm = getSpreadHalfMetrics(0);
                return (
                    renderSingleSlotHtml(srcPage, slotW, 0, sm.leftDocPageNum, sm.totalSinglePages, ignorePage) +
                    renderSingleSlotHtml(srcPage, slotW, slotW, sm.rightDocPageNum, sm.totalSinglePages, ignorePage)
                );
            }
            const sm = (typeof pageIndex === 'number' && pageIndex >= 0)
                ? getSpreadHalfMetrics(pageIndex)
                : { leftDocPageNum: docPageNum, rightDocPageNum: docPageNum + 1, totalSinglePages: totalDocPages, hasRightPage: true };
            const leftSuppress = ignorePage || (state.showHeaderFooterOnFirstPage === false && sm.leftDocPageNum === 1);
            const rightSuppress = !sm.hasRightPage || ignorePage || (state.showHeaderFooterOnFirstPage === false && sm.rightDocPageNum === 1);
            return (
                renderSingleSlotHtml(srcPage, slotW, 0, sm.leftDocPageNum, sm.totalSinglePages, leftSuppress) +
                renderSingleSlotHtml(srcPage, slotW, slotW, sm.rightDocPageNum, sm.totalSinglePages, rightSuppress)
            );
        }

        // Case 3: Single-page mode
        if (page && page.ignoreMasterPage) return '';
        const isMasterSingle = !!(state.hasMasterPage && pageIndex === 0);
        if (!isMasterSingle && state.showHeaderFooterOnFirstPage === false && docPageNum === 1) return '';
        const useMaster = !!(masterPage && pageIndex !== 0);
        const srcPage = useMaster ? masterPage : (page || {});
        return renderSingleSlotHtml(srcPage, pW, 0, docPageNum, totalDocPages, false);
    }

    // -------------------------------------------------------------------------
    // 7. LEGACY .OPUB MIGRATION ON LOAD
    // -------------------------------------------------------------------------

    function migrateLoadedDocument(data) {
        if (!data || typeof state === 'undefined') return;
        state.showHeaderFooterOnFirstPage = (typeof data.showHeaderFooterOnFirstPage === 'boolean')
            ? data.showHeaderFooterOnFirstPage
            : true;
        state.pageNumberFormat = data.pageNumberFormat || 'page-n-of-total';
        state.fontScheme = (data.fontScheme && data.fontScheme.bodyFont) ? JSON.parse(JSON.stringify(data.fontScheme)) : null;

        if (state.fontScheme) {
            ensureFontLoaded(state.fontScheme.headingFont);
            ensureFontLoaded(state.fontScheme.bodyFont);
        }

        if (Array.isArray(state.pages)) {
            state.pages.forEach(pg => {
                if (!pg) return;
                if (pg.header) pg.header = migrateLegacyHeaderFooterHtml(pg.header, 'header');
                if (pg.footer) pg.footer = migrateLegacyHeaderFooterHtml(pg.footer, 'footer');
            });
        }

        syncFontSchemeRibbonUI();
        syncHeaderFooterRibbonState();
        syncDefaultToolbarLabels();
    }

    // -------------------------------------------------------------------------
    // 8. INITIALIZATION & GLOBAL EXPORTS
    // -------------------------------------------------------------------------

    function init() {
        ensureMasterPageEditBar();
        ensureHeaderFooterContextualTab();
        ensureHeaderFooterStructure(document.getElementById('paper'));
        const staleHoverPill = document.getElementById('op-hf-hover-pill');
        if (staleHoverPill) staleHoverPill.remove();
        syncFontSchemeRibbonUI();
        syncDefaultToolbarLabels();
        syncMasterPageVisualMode(false);

        if (typeof window.syncMarginGuideOverlay === 'function' && !window.syncMarginGuideOverlay._hfWrapped) {
            const origSyncMargins = window.syncMarginGuideOverlay;
            window.syncMarginGuideOverlay = function() {
                const res = origSyncMargins.apply(this, arguments);
                syncHeaderFooterGeometry(document.getElementById('paper'));
                return res;
            };
            window.syncMarginGuideOverlay._hfWrapped = true;
        }
        ['changeSize', 'setMarginPreset', 'setMarginPresetInches'].forEach(fnName => {
            if (typeof window[fnName] === 'function' && !window[fnName]._hfWrapped) {
                const origFn = window[fnName];
                window[fnName] = function() {
                    const res = origFn.apply(this, arguments);
                    syncHeaderFooterGeometry(document.getElementById('paper'));
                    return res;
                };
                window[fnName]._hfWrapped = true;
            }
        });

        if (!window._opHfPnDismissBound) {
            window._opHfPnDismissBound = true;
            document.addEventListener('click', (e) => {
                const pnMenu = document.getElementById('hf-pn-format-dropdown');
                if (pnMenu && pnMenu.style.display === 'block') {
                    if (!e.target.closest('#hf-pn-format-btn') && !e.target.closest('#hf-pn-format-dropdown')) {
                        pnMenu.style.display = 'none';
                    }
                }
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const pnMenu = document.getElementById('hf-pn-format-dropdown');
                    if (pnMenu && pnMenu.style.display === 'block') {
                        pnMenu.style.display = 'none';
                    }
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 60));
    } else {
        setTimeout(init, 60);
    }

    window.MasterHeaderFooterEngine = {
        FONT_SCHEMES,
        PAGE_NUMBER_FORMATS,
        setPageNumberFormat,
        togglePageNumberFormatDropdown,
        getGlobalDefaultFont,
        setGlobalDefaultFont,
        getEffectiveDocumentTypography,
        buildFontStack,
        ensureFontLoaded,
        applyFontScheme,
        applyFontSchemeToExistingBoxes,
        toggleFontSchemesMenu,
        showCustomFontSchemeModal,
        syncFontSchemeRibbonUI,
        syncDefaultToolbarLabels,
        isEditingMasterPage,
        getDocumentPageMetrics,
        getSpreadHalfMetrics,
        formatPageNumberText,
        resolvePageNumberTokensInContainer,
        updateAllPageNumbers,
        migrateLegacyHeaderFooterHtml,
        computeHeaderFooterGeometry,
        ensureHeaderFooterStructure,
        syncHeaderFooterGeometry,
        getActiveHfBox,
        getActiveHfEditable,
        selectHeaderFooterBox,
        syncMasterHeaderFooterToState,
        renderHeaderFooterOnPaper,
        serializeHeaderFooterFromPaper,
        setHeaderFooterLayoutMode,
        setAlignment: applyAlignmentToHeaderFooter,
        applyExecCommandToHeaderFooter,
        toggleThreeZone: function() {
            const box = getActiveHfBox();
            if (!box) return;
            const is3 = !!box.querySelector('.op-hf-zones');
            setHeaderFooterLayoutMode(box, is3 ? 'left' : '3zone');
        },
        focusZone: focusHeaderFooterZone,
        insertDynamicPageNumber: insertDynamicPageNumberInHeaderFooter,
        insertDateTime: insertDateTimeInHeaderFooter,
        setShowHeaderFooterOnFirstPage,
        syncHeaderFooterRibbonState,
        syncMasterPageVisualMode,
        enterMasterPageMode,
        exitMasterPageMode,
        buildExportHeaderFooterHtml,
        migrateLoadedDocument,
        init
    };

    window.toggleFontSchemesMenu = toggleFontSchemesMenu;
    window.showCustomFontSchemeModal = showCustomFontSchemeModal;
    window.enterMasterPageMode = enterMasterPageMode;
    window.exitMasterPageMode = exitMasterPageMode;
})(window);
