// ==========================================
// MULTI-PAGE & MASTER PAGE TEMPLATE REGISTRY & LOADER
// ==========================================

(function(window) {
    'use strict';

    const BATCH_1_REGISTRY = [
        {
            name: 'Community & Club Newsletter',
            file: 'newsletters_community_club_multipage.opub',
            category: 'Newsletters',
            pages: 4,
            hasMasterPage: true,
            fontSchemeId: 'newsletter-editorial',
            width: 794,
            height: 1123,
            format: 'A4'
        },
        {
            name: 'Annual Business & Impact Report',
            file: 'reports_annual_business_impact_multipage.opub',
            category: 'Reports',
            pages: 4,
            hasMasterPage: true,
            fontSchemeId: 'modern-business',
            width: 794,
            height: 1123,
            format: 'A4'
        },
        {
            name: 'School Magazine & Yearbook Digest',
            file: 'magazines_school_yearbook_digest_multipage.opub',
            category: 'Magazines',
            pages: 4,
            hasMasterPage: true,
            fontSchemeId: 'friendly-community',
            width: 794,
            height: 1123,
            format: 'A4'
        }
    ];

    const BATCH_2_REGISTRY = [
        {
            name: 'Product Catalog & Price Guide',
            file: 'brochures_product_catalog_price_guide_multipage.opub',
            category: 'Brochures',
            pages: 4,
            hasMasterPage: true,
            fontSchemeId: 'magazine-bold',
            width: 1123,
            height: 794,
            format: 'A4',
            orientation: 'landscape'
        },
        {
            name: 'Conference & Event Program Booklet',
            file: 'brochures_conference_event_program_multipage.opub',
            category: 'Brochures',
            pages: 4,
            hasMasterPage: true,
            fontSchemeId: 'executive-slate',
            width: 794,
            height: 1123,
            format: 'A4',
            orientation: 'portrait'
        },
        {
            name: 'Client Project Proposal & Pitch Deck',
            file: 'reports_client_project_proposal_deck_multipage.opub',
            category: 'Reports',
            pages: 4,
            hasMasterPage: true,
            fontSchemeId: 'tech-crisp',
            width: 1123,
            height: 794,
            format: 'A4',
            orientation: 'landscape'
        }
    ];

    const BATCH_3_REGISTRY = [
        {
            name: 'Charity Fundraising & Impact Packet',
            file: 'flyers_charity_fundraising_impact_multipage.opub',
            category: 'Flyers',
            pages: 3,
            hasMasterPage: true,
            fontSchemeId: 'classic-serif',
            width: 794,
            height: 1123,
            format: 'A4',
            orientation: 'portrait'
        },
        {
            name: 'Seasonal Restaurant Menu & Wine List',
            file: 'menus_seasonal_restaurant_wine_multipage.opub',
            category: 'Menus',
            pages: 3,
            hasMasterPage: true,
            fontSchemeId: 'formal-academic',
            width: 794,
            height: 1123,
            format: 'A4',
            orientation: 'portrait'
        },
        {
            name: 'Employee Onboarding Handbook',
            file: 'reports_employee_onboarding_handbook_multipage.opub',
            category: 'Reports',
            pages: 4,
            hasMasterPage: true,
            fontSchemeId: 'clean-sans',
            width: 794,
            height: 1123,
            format: 'A4',
            orientation: 'portrait'
        },
        {
            name: 'Property Portfolio & Open House Lookbook',
            file: 'brochures_property_portfolio_lookbook_multipage.opub',
            category: 'Brochures',
            pages: 3,
            hasMasterPage: true,
            fontSchemeId: 'classic-office',
            width: 1123,
            height: 794,
            format: 'A4',
            orientation: 'landscape'
        }
    ];

    const ALL_MULTIPAGE_REGISTRY = BATCH_1_REGISTRY.concat(BATCH_2_REGISTRY, BATCH_3_REGISTRY);

    function getPreviewPage(opubData) {
        if (!opubData || !Array.isArray(opubData.pages) || opubData.pages.length === 0) {
            return null;
        }
        if (opubData.hasMasterPage && opubData.pages.length > 1) {
            return opubData.pages[1];
        }
        return opubData.pages[0];
    }

    function getDocumentPageCount(opubData, indexEntry) {
        if (opubData && Array.isArray(opubData.pages) && opubData.pages.length > 0) {
            return opubData.hasMasterPage
                ? Math.max(1, opubData.pages.length - 1)
                : opubData.pages.length;
        }
        if (indexEntry && typeof indexEntry.pages === 'number' && indexEntry.pages > 1) {
            return indexEntry.pages;
        }
        return 1;
    }

    function applyMultiPageTemplateToState(opubData) {
        if (!opubData || !Array.isArray(opubData.pages) || opubData.pages.length === 0 || typeof state === 'undefined') {
            return false;
        }

        state.pages = [];
        if (typeof window.resetDocumentWatermark === 'function') {
            window.resetDocumentWatermark();
        } else {
            delete state.watermark;
        }

        state.history = [];
        state.historyIndex = -1;
        state.dpi = opubData.dpi || (opubData.pages[0] && opubData.pages[0].dpi) || 96;
        state.format = opubData.format || (opubData.pages[0] && opubData.pages[0].format) || null;
        state.isSpreadMode = !!opubData.isSpreadMode;

        const spreadBtn = document.getElementById('spread-mode-btn');
        if (spreadBtn) spreadBtn.classList.toggle('active', state.isSpreadMode);

        const firstP = opubData.pages[0];
        const isCardTmpl = opubData.format === 'BusinessCard' || (firstP && (firstP.format === 'BusinessCard' || (parseFloat(firstP.width) <= 360 && parseFloat(firstP.height) <= 260)));
        const defaultMarginInches = isCardTmpl ? 0.125 : 0.5;
        state.margins = opubData.margins ? JSON.parse(JSON.stringify(opubData.margins)) : {
            top: Math.round(defaultMarginInches * state.dpi),
            right: Math.round(defaultMarginInches * state.dpi),
            bottom: Math.round(defaultMarginInches * state.dpi),
            left: Math.round(defaultMarginInches * state.dpi)
        };
        state.marginsDpi = opubData.marginsDpi || state.dpi;

        state.pages = JSON.parse(JSON.stringify(opubData.pages));
        state.hasMasterPage = !!opubData.hasMasterPage;
        state.headersVisible = (typeof opubData.headersVisible === 'boolean')
            ? opubData.headersVisible
            : !!state.hasMasterPage;

        if (!window._orientedPagesRegistry) window._orientedPagesRegistry = new Set();
        const seed = Date.now();
        state.pages.forEach((p, idx) => {
            if (state.hasMasterPage && idx === 0) {
                p.id = 'master-page-' + seed + '-' + Math.floor(Math.random() * 1000);
            } else {
                p.id = seed + idx + Math.random();
            }
            p.dpi = state.dpi;
            if (state.format) p.format = state.format;
            if (!p.orientation && opubData.orientation) {
                p.orientation = opubData.orientation;
            }
            if (p.orientation) {
                const curW = parseFloat(p.width) || 794;
                const curH = parseFloat(p.height) || 1123;
                if (p.orientation === 'landscape' && curW < curH) {
                    p.width = Math.max(curW, curH) + 'px';
                    p.height = Math.min(curW, curH) + 'px';
                } else if (p.orientation === 'portrait' && curW > curH) {
                    p.width = Math.min(curW, curH) + 'px';
                    p.height = Math.max(curW, curH) + 'px';
                }
            } else {
                p.orientation = (parseFloat(p.width) >= parseFloat(p.height || '1123')) ? 'landscape' : 'portrait';
            }
            window._orientedPagesRegistry.add(p.id);
        });

        const initialIdx = (state.hasMasterPage && state.pages.length > 1) ? 1 : 0;
        state.currentPageIndex = initialIdx;

        if (opubData.isTemplate) {
            const titleEl = document.getElementById('doc-title');
            if (titleEl) titleEl.innerText = 'Untitled Publication';
            if (typeof window.notifyDesktopNewDocument === 'function') {
                window.notifyDesktopNewDocument(true);
            }
        }

        if (window.MasterHeaderFooterEngine && typeof window.MasterHeaderFooterEngine.migrateLoadedDocument === 'function') {
            window.MasterHeaderFooterEngine.migrateLoadedDocument(opubData);
        } else {
            state.showHeaderFooterOnFirstPage = (typeof opubData.showHeaderFooterOnFirstPage === 'boolean')
                ? opubData.showHeaderFooterOnFirstPage
                : true;
            state.pageNumberFormat = opubData.pageNumberFormat || 'page-n-of-total';
            state.fontScheme = (opubData.fontScheme && opubData.fontScheme.bodyFont)
                ? JSON.parse(JSON.stringify(opubData.fontScheme))
                : null;
        }

        if (typeof window.renderPage === 'function') {
            window.renderPage(state.pages[initialIdx]);
        }
        if (window.MasterHeaderFooterEngine && typeof window.MasterHeaderFooterEngine.syncMasterPageVisualMode === 'function') {
            window.MasterHeaderFooterEngine.syncMasterPageVisualMode(false);
        }
        if (typeof window.updateDpiDisplay === 'function') window.updateDpiDisplay(state.dpi);
        if (state.format && typeof window.setPageFormatIcon === 'function') window.setPageFormatIcon(state.format);
        if (typeof window.focusPage === 'function') {
            window.focusPage(initialIdx);
        }
        if (typeof window.syncMarginGuideOverlay === 'function') window.syncMarginGuideOverlay();
        if (typeof window.updateSidebar === 'function') window.updateSidebar();

        const tmplModal = document.getElementById('template-modal');
        if (tmplModal) tmplModal.style.display = 'none';
        if (typeof DialogSystem !== 'undefined') DialogSystem.close();
        if (typeof window.pushHistory === 'function') window.pushHistory();
        if (typeof window.generateAllThumbnails === 'function') {
            setTimeout(() => window.generateAllThumbnails(), 60);
        }
        return true;
    }

    window.OpenPublisherMultiPageTemplates = {
        BATCH_1_REGISTRY,
        BATCH_2_REGISTRY,
        BATCH_3_REGISTRY,
        ALL_MULTIPAGE_REGISTRY,
        getPreviewPage,
        getDocumentPageCount,
        applyMultiPageTemplateToState
    };
})(window);
