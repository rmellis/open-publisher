/**
 * OpenPublisher Export Template Package Modal (v5.18.1)
 * Recreates the modern template package exporter dialog with metadata,
 * live high-DPI thumbnail preview, package options, and ZIP packaging.
 */

(function(window) {
    'use strict';

    /**
     * Estimates the exported template file size dynamically.
     */
    function calculateEstimatedSize(options) {
        let rawBytes = 0;
        try {
            const dataStr = JSON.stringify(state.pages || []);
            rawBytes = dataStr.length;
        } catch(e) {
            rawBytes = 50000;
        }

        // Add estimated image weights
        if (state.pages && Array.isArray(state.pages)) {
            state.pages.forEach(p => {
                if (p.elements && Array.isArray(p.elements)) {
                    p.elements.forEach(el => {
                        if (el.imgSrc && el.imgSrc.startsWith('data:')) {
                            rawBytes += el.imgSrc.length;
                        } else if (el.imgSrc || el.type === 'image') {
                            rawBytes += 450000; // Average ~450KB per linked image
                        }
                    });
                }
            });
        }

        // Thumbnail size
        if (options.highDpiThumb) {
            rawBytes += 1200000; // ~1.2MB high-DPI WebP/PNG
        } else {
            rawBytes += 150000;
        }

        // Fonts
        if (options.embedFonts) {
            rawBytes += 250000; // Font manifests & style sheets
        }

        // Base64 serialization overhead (~33%)
        if (options.serializeBase64) {
            rawBytes = Math.round(rawBytes * 1.33);
        }

        // ZIP compression reduction (~55% of raw)
        if (options.compressZip) {
            rawBytes = Math.round(rawBytes * 0.58);
        }

        if (rawBytes >= 1048576) {
            return `~${(rawBytes / 1048576).toFixed(1)} MB`;
        } else {
            return `~${Math.round(rawBytes / 1024)} KB`;
        }
    }

    /**
     * Extracts all unique Google fonts and font families used across document elements.
     */
    function extractDocumentFonts() {
        const families = new Set();
        if (state.pages && Array.isArray(state.pages)) {
            state.pages.forEach(p => {
                if (p.elements && Array.isArray(p.elements)) {
                    p.elements.forEach(el => {
                        const fontMatch = (el.innerHTML || '').match(/font-family:\s*['"]?([^'";,]+)['"]?/gi);
                        if (fontMatch) {
                            fontMatch.forEach(fm => {
                                const clean = fm.replace(/font-family:\s*['"]?/i, '').replace(/['"]?$/i, '').trim();
                                if (clean) families.add(clean);
                            });
                        }
                        if (el.fontFamily) families.add(el.fontFamily);
                    });
                }
            });
        }
        return Array.from(families);
    }

    /**
     * Converts external or blob image URLs to base64 data URLs.
     */
    async function convertUrlToBase64(url) {
        if (!url || typeof url !== 'string') return url;
        if (url.startsWith('data:')) return url;
        try {
            const resp = await fetch(url);
            const blob = await resp.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = () => resolve(url);
                reader.readAsDataURL(blob);
            });
        } catch(e) {
            return url;
        }
    }

    /**
     * Primary entry point: Displays the Export Template Package modal dialog.
     */
    window.showExportTemplateModal = async function() {
        // Serialize current canvas state before opening
        if (typeof serializeCurrentPage === 'function' && state.pages && state.pages[state.currentPageIndex]) {
            try { state.pages[state.currentPageIndex] = serializeCurrentPage(); } catch(e) {}
        }

        const titleEl = document.getElementById('doc-title');
        let currentTitle = titleEl ? titleEl.innerText.replace(/ \*$/, '').trim() : 'Weekly Newsletter';
        if (!currentTitle || currentTitle === 'Untitled Publication' || currentTitle === 'Publication1') {
            currentTitle = 'Weekly Newsletter';
        }

        const defaultAuthor = (state.documentProperties && state.documentProperties.author) || 'Creative Team';
        const defaultCategory = (state.documentProperties && state.documentProperties.category) || 'Newsletters';
        const defaultDesc = (state.documentProperties && state.documentProperties.subject) || 
            'A colorful, modern weekly newsletter template designed for creative teams and studios.';
        
        // Initial package options state
        const pkgOptions = {
            embedFonts: true,
            includeLinkedImages: true,
            compressZip: false,
            serializeBase64: false,
            highDpiThumb: true
        };

        const categories = [
            'Newsletters',
            'Flyers',
            'Posters',
            'Brochures',
            'Resumes',
            'Magazines',
            'Reports',
            'Menus',
            'Certificates',
            'Business Cards',
            'Invitations',
            'Social Media',
            'Labels',
            'Calendars',
            'Letterheads',
            'Other'
        ];

        const defaultSavePath = (typeof window.isDesktopApp === 'function' && window.isDesktopApp())
            ? `C:\\CreativeTeam\\Templates`
            : `${currentTitle.replace(/\s+/g, '_')}_Template`;

        const modalHtml = `
            <div class="op-tmpl-modal-container">
                <style>
                    .op-tmpl-modal-container {
                        width: 610px;
                        max-width: 100%;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        color: #1e293b;
                        padding: 0 4px;
                        box-sizing: border-box;
                        user-select: none;
                    }
                    .op-tmpl-top-grid {
                        display: grid;
                        grid-template-columns: 1fr 190px;
                        gap: 14px;
                        margin-bottom: 8px;
                    }
                    .op-tmpl-label {
                        font-size: 14px;
                        font-weight: 700;
                        color: #0f172a;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    .op-tmpl-input-box {
                        display: flex;
                        align-items: center;
                        background: #ffffff;
                        border: 1px solid var(--ui-theme-color, #007670);
                        border-radius: 4px;
                        padding: 0 8px;
                        height: 32px;
                        box-sizing: border-box;
                        transition: border-color 0.15s, box-shadow 0.15s;
                    }
                    .op-tmpl-input-box:focus-within {
                        border-color: var(--ui-theme-dark, #005a54);
                        box-shadow: 0 0 0 2px rgba(0, 118, 112, 0.2);
                    }
                    .op-tmpl-icon-start {
                        color: var(--ui-theme-color, #007670);
                        font-size: 13.5px;
                        margin-right: 8px;
                        margin-left: 2px;
                        flex-shrink: 0;
                    }
                    .op-tmpl-input-box input {
                        border: none !important;
                        outline: none !important;
                        background: transparent !important;
                        box-shadow: none !important;
                        width: 100%;
                        font-size: 13px;
                        color: #0f172a;
                        font-weight: 500;
                        font-family: inherit;
                        padding: 0;
                        margin: 0;
                    }
                    .op-tmpl-select-box {
                        position: relative;
                        display: flex;
                        align-items: center;
                        background: #ffffff;
                        border: 1px solid var(--ui-theme-color, #007670);
                        border-radius: 4px;
                        height: 32px;
                        box-sizing: border-box;
                        cursor: pointer;
                        user-select: none;
                        outline: none;
                        transition: border-color 0.15s, box-shadow 0.15s;
                    }
                    .op-tmpl-select-box:hover,
                    .op-tmpl-select-box:focus,
                    .op-tmpl-select-box.open {
                        border-color: var(--ui-theme-dark, #005a54);
                        box-shadow: 0 0 0 2px rgba(0, 118, 112, 0.2);
                    }
                    .op-tmpl-category-display {
                        flex: 1;
                        font-size: 13px;
                        font-weight: 500;
                        color: #0f172a;
                        padding-right: 32px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        line-height: 30px;
                    }
                    .op-tmpl-dropdown-arrow-box {
                        position: absolute;
                        right: 0;
                        top: 0;
                        bottom: 0;
                        width: 26px;
                        background: var(--ui-theme-color, #007670);
                        color: #ffffff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        pointer-events: none;
                        z-index: 2;
                        border-radius: 0 3px 3px 0;
                        transition: background 0.15s ease;
                    }
                    .op-tmpl-select-box:hover .op-tmpl-dropdown-arrow-box,
                    .op-tmpl-select-box.open .op-tmpl-dropdown-arrow-box {
                        background: var(--ui-theme-dark, #005a54);
                    }
                    .op-tmpl-dropdown-arrow-box i {
                        font-size: 10px;
                        color: #ffffff;
                        transition: transform 0.2s ease;
                    }
                    .op-tmpl-select-box.open .op-tmpl-dropdown-arrow-box i {
                        transform: rotate(180deg);
                    }
                    .op-tmpl-custom-dropdown-list {
                        position: absolute;
                        top: calc(100% + 4px);
                        left: -1px;
                        right: -1px;
                        background: #ffffff;
                        border: 2px solid var(--ui-theme-dark, #005a54);
                        border-radius: 8px;
                        box-shadow: 0 8px 24px color-mix(in srgb, var(--ui-theme-dark, #005a54) 18%, transparent), 0 2px 8px rgba(0, 0, 0, 0.08);
                        padding: 4px;
                        max-height: 200px;
                        overflow-y: auto;
                        overflow-x: hidden;
                        z-index: 999999;
                        box-sizing: border-box;
                        scrollbar-width: thin;
                        scrollbar-color: var(--ui-theme-color, #007670) #f1f5f9;
                    }
                    .op-tmpl-custom-dropdown-list::-webkit-scrollbar {
                        width: 6px;
                    }
                    .op-tmpl-custom-dropdown-list::-webkit-scrollbar-track {
                        background: #f8fafc;
                        border-radius: 3px;
                    }
                    .op-tmpl-custom-dropdown-list::-webkit-scrollbar-thumb {
                        background: color-mix(in srgb, var(--ui-theme-dark, #005a54) 40%, transparent);
                        border-radius: 3px;
                    }
                    .op-tmpl-custom-dropdown-list::-webkit-scrollbar-thumb:hover {
                        background: var(--ui-theme-color, #007670);
                    }
                    .op-tmpl-dropdown-item {
                        color: var(--ui-theme-dark, #005a54);
                        border-radius: 4px;
                        padding: 6px 10px;
                        font-size: 13px;
                        font-weight: 500;
                        cursor: pointer;
                        margin-bottom: 2px;
                        transition: background 0.1s ease, color 0.1s ease;
                        display: flex;
                        align-items: center;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        user-select: none;
                    }
                    .op-tmpl-dropdown-item:last-child {
                        margin-bottom: 0;
                    }
                    .op-tmpl-dropdown-item:hover {
                        background: color-mix(in srgb, var(--ui-theme-dark, #005a54) 10%, transparent);
                    }
                    .op-tmpl-dropdown-item.selected {
                        background: var(--ui-theme-color, #007670) !important;
                        color: #ffffff !important;
                        font-weight: 600;
                    }
                    .op-tmpl-desc-box {
                        display: flex;
                        align-items: flex-start;
                        background: #ffffff;
                        border: 1px solid var(--ui-theme-color, #007670);
                        border-radius: 4px;
                        padding: 6px 8px;
                        box-sizing: border-box;
                        transition: border-color 0.15s, box-shadow 0.15s;
                    }
                    .op-tmpl-desc-box:focus-within {
                        border-color: var(--ui-theme-dark, #005a54);
                        box-shadow: 0 0 0 2px rgba(0, 118, 112, 0.2);
                    }
                    .op-tmpl-textarea {
                        border: none !important;
                        outline: none !important;
                        background: transparent !important;
                        box-shadow: none !important;
                        flex: 1;
                        height: 52px;
                        font-size: 12.5px;
                        line-height: 1.4;
                        color: #0f172a;
                        resize: none;
                        font-family: inherit;
                        padding: 0;
                        margin: 0;
                        box-sizing: border-box;
                    }
                    .op-tmpl-preview-card {
                        background: #ffffff;
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
                        padding: 8px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        box-sizing: border-box;
                        height: 185px;
                        overflow: hidden;
                        position: relative;
                    }
                    .op-tmpl-preview-frame {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                        border-radius: 6px;
                        background: #f8fafc;
                        position: relative;
                    }
                    .op-tmpl-paper-sheet {
                        position: relative;
                        width: 126px;
                        height: 168px;
                        background: #ffffff;
                        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
                        border-radius: 3px;
                        border: 1px solid #e2e8f0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                    }
                    .op-tmpl-sheet-mock-lines {
                        position: absolute;
                        top: 12px;
                        left: 10px;
                        right: 10px;
                        bottom: 12px;
                        display: flex;
                        flex-direction: column;
                        opacity: 0.55;
                    }
                    .op-tmpl-rendering-badge {
                        position: absolute;
                        background: var(--ui-theme-color, #007670);
                        color: #ffffff;
                        padding: 4px 9px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
                        white-space: nowrap;
                        z-index: 10;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                    }
                    .op-tmpl-check-label {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        font-size: 13px;
                        font-weight: 600;
                        color: #1e293b;
                        cursor: pointer;
                        user-select: none;
                    }
                    .op-tmpl-check-label input[type="checkbox"] {
                        appearance: none;
                        -webkit-appearance: none;
                        width: 17px;
                        height: 17px;
                        border: 2px solid var(--ui-theme-color, #007670);
                        border-radius: 4px;
                        outline: none;
                        background: #ffffff;
                        cursor: pointer;
                        display: grid;
                        place-content: center;
                        transition: background-color 0.18s, border-color 0.18s;
                        margin: 0;
                        flex-shrink: 0;
                    }
                    .op-tmpl-check-label input[type="checkbox"]:checked {
                        background-color: var(--ui-theme-color, #007670);
                    }
                    .op-tmpl-check-label input[type="checkbox"]:checked::after {
                        content: "\\f00c";
                        font-family: "Font Awesome 6 Free", "Font Awesome 5 Free";
                        font-weight: 900;
                        color: #ffffff;
                        font-size: 10px;
                    }
                    .op-tmpl-save-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 10px;
                        margin-bottom: 8px;
                    }
                    .op-tmpl-save-left {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        flex: 1;
                    }
                    .op-tmpl-save-input-pill {
                        display: flex;
                        align-items: center;
                        background: #ffffff;
                        border: 1.5px solid #cbd5e1;
                        border-radius: 20px;
                        padding: 4px 12px;
                        flex: 1;
                        box-sizing: border-box;
                    }
                    .op-tmpl-save-input-pill i {
                        color: #64748b;
                        margin-right: 6px;
                        font-size: 13.5px;
                    }
                    .op-tmpl-save-input-pill input {
                        border: none !important;
                        outline: none !important;
                        background: transparent !important;
                        box-shadow: none !important;
                        width: 100%;
                        font-size: 13.5px;
                        color: #0f172a;
                        font-weight: 500;
                        font-family: inherit;
                        padding: 0;
                        margin: 0;
                    }
                    #custom-dialog-box button.op-tmpl-browse-btn,
                    .custom-dialog button.op-tmpl-browse-btn,
                    .op-tmpl-browse-btn {
                        background: #f0fdf4 !important;
                        border: 1px solid var(--ui-theme-color, #007670) !important;
                        color: var(--ui-theme-dark, #005a54) !important;
                        padding: 0 14px !important;
                        border-radius: 4px !important;
                        font-size: 13px !important;
                        font-weight: 600 !important;
                        cursor: pointer !important;
                        box-sizing: border-box !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        transition: all 0.2s ease !important;
                        white-space: nowrap !important;
                        line-height: normal !important;
                        height: 32px !important;
                        flex-shrink: 0 !important;
                    }
                    #custom-dialog-box button.op-tmpl-browse-btn:hover,
                    .custom-dialog button.op-tmpl-browse-btn:hover,
                    .op-tmpl-browse-btn:hover {
                        background: var(--ui-theme-color, #007670) !important;
                        color: #ffffff !important;
                    }
                    .op-tmpl-size-display {
                        font-size: 13px;
                        font-weight: 600;
                        color: #475569;
                        white-space: nowrap;
                    }
                    .op-tmpl-options-section {
                        margin-bottom: 10px;
                        font-size: 13px;
                    }
                    .op-tmpl-options-header {
                        font-size: 14px;
                        font-weight: 700;
                        color: #0f172a;
                        margin-bottom: 6px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        flex-wrap: wrap;
                    }
                    .op-tmpl-options-subrow {
                        margin-top: 5px;
                    }
                    .op-tmpl-footer-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 10px;
                        margin-top: 4px;
                    }
                    .op-tmpl-share-note {
                        display: flex;
                        align-items: flex-start;
                        gap: 8px;
                        font-size: 11.5px;
                        line-height: 1.35;
                        color: #64748b;
                        max-width: 360px;
                    }
                    .op-tmpl-share-note i {
                        font-size: 15px;
                        color: #475569;
                        margin-top: 1px;
                        flex-shrink: 0;
                    }
                    .op-tmpl-share-note a {
                        color: var(--ui-theme-color, #007670);
                        text-decoration: underline;
                        font-weight: 600;
                    }
                    .op-tmpl-btns {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        flex-shrink: 0;
                    }
                    #custom-dialog-box .op-tmpl-btn-cancel,
                    .custom-dialog button.op-tmpl-btn-cancel,
                    .op-tmpl-btn-cancel {
                        background: #e2e8f0 !important;
                        color: #334155 !important;
                        border: none !important;
                        border-radius: 24px !important;
                        padding: 8px 18px !important;
                        font-size: 13.5px !important;
                        font-weight: 600 !important;
                        cursor: pointer !important;
                        transition: background-color 0.2s !important;
                        white-space: nowrap !important;
                        flex-shrink: 0 !important;
                    }
                    #custom-dialog-box .op-tmpl-btn-cancel:hover,
                    .op-tmpl-btn-cancel:hover {
                        background: #cbd5e1 !important;
                    }
                    #custom-dialog-box .op-tmpl-btn-export,
                    .custom-dialog button.op-tmpl-btn-export,
                    .op-tmpl-btn-export {
                        background: var(--ui-theme-color, #007670) !important;
                        color: #ffffff !important;
                        border: none !important;
                        border-radius: 24px !important;
                        padding: 8px 20px !important;
                        font-size: 14px !important;
                        font-weight: 700 !important;
                        cursor: pointer !important;
                        box-shadow: 0 4px 12px rgba(0, 118, 112, 0.25) !important;
                        transition: background-color 0.2s, transform 0.1s !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 8px !important;
                        white-space: nowrap !important;
                        flex-shrink: 0 !important;
                    }
                    #custom-dialog-box .op-tmpl-btn-export:hover,
                    .op-tmpl-btn-export:hover {
                        background: var(--ui-theme-dark, #005a55) !important;
                    }
                    #custom-dialog-box .op-tmpl-btn-export:active,
                    .op-tmpl-btn-export:active {
                        transform: scale(0.98) !important;
                    }

                    /* Dark Mode */
                    body.dark-mode .op-tmpl-modal-container {
                        color: #e2e8f0;
                    }
                    body.dark-mode .op-tmpl-label,
                    body.dark-mode .op-tmpl-options-header {
                        color: #f8fafc;
                    }
                    body.dark-mode .op-tmpl-input-box,
                    body.dark-mode .op-tmpl-select-box,
                    body.dark-mode .op-tmpl-desc-box {
                        background: #1e293b;
                        border-color: var(--ui-theme-color, #007670);
                        color: #f8fafc;
                    }
                    body.dark-mode .op-tmpl-input-box input,
                    body.dark-mode .op-tmpl-category-display,
                    body.dark-mode .op-tmpl-desc-box textarea {
                        color: #f8fafc !important;
                    }
                    body.dark-mode .op-tmpl-custom-dropdown-list {
                        background: #1e293b;
                        border-color: var(--ui-theme-color, #007670);
                        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
                        scrollbar-color: var(--ui-theme-color, #007670) #0f172a;
                    }
                    body.dark-mode .op-tmpl-custom-dropdown-list::-webkit-scrollbar-track {
                        background: #0f172a;
                    }
                    body.dark-mode .op-tmpl-custom-dropdown-list::-webkit-scrollbar-thumb {
                        background: var(--ui-theme-color, #007670);
                    }
                    body.dark-mode .op-tmpl-dropdown-item {
                        color: #e2e8f0;
                    }
                    body.dark-mode .op-tmpl-dropdown-item:hover {
                        background: color-mix(in srgb, var(--ui-theme-color, #007670) 25%, transparent);
                        color: #ffffff;
                    }
                    body.dark-mode .op-tmpl-dropdown-item.selected {
                        background: var(--ui-theme-color, #007670) !important;
                        color: #ffffff !important;
                    }
                    body.dark-mode .op-tmpl-browse-btn {
                        background: rgba(0, 118, 112, 0.18) !important;
                        border-color: var(--ui-theme-color, #007670) !important;
                        color: #e2e8f0 !important;
                    }
                    body.dark-mode .op-tmpl-preview-card {
                        background: #1e293b;
                        border-color: #334155;
                    }
                    body.dark-mode .op-tmpl-preview-frame {
                        background: #0f172a;
                    }
                    body.dark-mode .op-tmpl-placeholder-page {
                        background: #1e293b;
                        border-color: #334155;
                    }
                    body.dark-mode .op-tmpl-placeholder-bar {
                        background: #334155;
                    }
                    body.dark-mode .op-tmpl-placeholder-img {
                        background: #0f172a;
                        border-color: #334155;
                        color: #475569;
                    }
                    body.dark-mode .op-tmpl-rendering-overlay {
                        background: rgba(15, 23, 42, 0.75);
                    }
                    body.dark-mode .op-tmpl-check-label {
                        color: #e2e8f0;
                    }
                    body.dark-mode .op-tmpl-check-label input[type="checkbox"] {
                        background: #1e293b;
                    }
                    body.dark-mode .op-tmpl-size-display {
                        color: #94a3b8;
                    }
                    body.dark-mode .op-tmpl-footer-row {
                        border-color: #334155;
                    }
                    body.dark-mode .op-tmpl-btn-cancel {
                        background: #334155 !important;
                        color: #e2e8f0 !important;
                    }
                    body.dark-mode .op-tmpl-btn-cancel:hover {
                        background: #475569 !important;
                    }
                </style>

                <div class="op-tmpl-top-grid">
                    <!-- Left: Metadata inputs -->
                    <div>
                        <!-- Template Title -->
                        <div style="margin-bottom: 6px;">
                            <div class="op-tmpl-label" style="margin-bottom: 3px;">Template Title:</div>
                            <div class="op-tmpl-input-box">
                                <i class="far fa-file-alt op-tmpl-icon-start"></i>
                                <input type="text" id="op-tmpl-title-input" value="${currentTitle}">
                            </div>
                        </div>

                        <!-- Creator -->
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <div class="op-tmpl-label" style="min-width: 72px; margin: 0;">Creator:</div>
                            <div class="op-tmpl-input-box" style="flex: 1;">
                                <i class="far fa-user op-tmpl-icon-start"></i>
                                <input type="text" id="op-tmpl-creator-input" value="${defaultAuthor}">
                            </div>
                        </div>

                        <!-- Category -->
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; position: relative;">
                            <div class="op-tmpl-label" style="min-width: 72px; margin: 0;">Category:</div>
                            <div class="op-tmpl-select-box" id="op-tmpl-category-box" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="listbox" style="flex: 1;">
                                <i class="fas fa-tag op-tmpl-icon-start"></i>
                                <span id="op-tmpl-category-display" class="op-tmpl-category-display">${defaultCategory}</span>
                                <input type="hidden" id="op-tmpl-category-input" value="${defaultCategory}">
                                <div class="op-tmpl-dropdown-arrow-box" id="op-tmpl-category-arrow-btn">
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="op-tmpl-custom-dropdown-list" id="op-tmpl-category-list" role="listbox" style="display: none;">
                                    ${categories.map(cat => `
                                        <div class="op-tmpl-dropdown-item ${cat.toLowerCase() === defaultCategory.toLowerCase() ? 'selected' : ''}" role="option" data-value="${cat}" aria-selected="${cat.toLowerCase() === defaultCategory.toLowerCase()}">
                                            ${cat}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Description -->
                        <div style="margin-bottom: 4px;">
                            <div class="op-tmpl-label" style="margin-bottom: 3px;">Description:</div>
                            <div class="op-tmpl-desc-box">
                                <i class="far fa-edit op-tmpl-icon-start" style="margin-top: 2px;"></i>
                                <textarea class="op-tmpl-textarea" id="op-tmpl-desc-input">${defaultDesc}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Live Thumbnail Preview & High-DPI checkbox -->
                    <div>
                        <div class="op-tmpl-preview-card">
                            <div class="op-tmpl-preview-frame" id="op-tmpl-thumb-container">
                                <div class="op-tmpl-paper-sheet" id="op-tmpl-paper-sheet">
                                    <div class="op-tmpl-sheet-mock-lines">
                                        <div style="width: 80%; height: 8px; background: #cbd5e1; border-radius: 2px; margin-bottom: 6px;"></div>
                                        <div style="width: 50%; height: 6px; background: #e2e8f0; border-radius: 2px; margin-bottom: 8px;"></div>
                                        <div style="width: 90%; height: 42px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 3px; display: flex; align-items: center; justify-content: center; color: #cbd5e1;">
                                            <i class="far fa-image" style="font-size: 18px;"></i>
                                        </div>
                                    </div>
                                    <div class="op-tmpl-rendering-badge" id="op-tmpl-rendering-badge">
                                        <i class="fas fa-circle-notch fa-spin"></i>
                                        <span>Rendering...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top: 6px; display: flex; justify-content: center;">
                            <label class="op-tmpl-check-label" style="font-size: 12.5px;">
                                <input type="checkbox" id="op-tmpl-highdpi-check" checked>
                                <span>Generate high-DPI thumbnail</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Save To & Estimated Size Row -->
                <div class="op-tmpl-save-row">
                    <div class="op-tmpl-save-left">
                        <span class="op-tmpl-label" style="margin:0; white-space:nowrap;">Save To:</span>
                        <div class="op-tmpl-input-box" style="flex: 1;">
                            <i class="far fa-folder op-tmpl-icon-start"></i>
                            <input type="text" id="op-tmpl-saveto-input" value="${defaultSavePath}">
                        </div>
                        <button class="op-tmpl-browse-btn" id="op-tmpl-browse-btn" type="button">Browse...</button>
                    </div>
                    <div class="op-tmpl-size-display" id="op-tmpl-size-display">
                        Estimated Size: ${calculateEstimatedSize(pkgOptions)}
                    </div>
                </div>

                <!-- Package Options -->
                <div class="op-tmpl-options-section">
                    <div class="op-tmpl-options-header">
                        <span class="op-tmpl-label" style="margin:0;">Package Options:</span>
                        <label class="op-tmpl-check-label">
                            <input type="checkbox" id="op-tmpl-fonts-check" checked>
                            <span>Embed Custom Fonts</span>
                        </label>
                        <label class="op-tmpl-check-label">
                            <input type="checkbox" id="op-tmpl-linked-images-check" checked>
                            <span>Include Linked Images</span>
                        </label>
                        <label class="op-tmpl-check-label">
                            <input type="checkbox" id="op-tmpl-zip-check">
                            <span>Compress (ZIP)</span>
                        </label>
                    </div>
                    <div class="op-tmpl-options-subrow">
                        <label class="op-tmpl-check-label">
                            <input type="checkbox" id="op-tmpl-base64-check">
                            <span>Serialize images as base64 (include images in the document as code rather than image files)</span>
                        </label>
                    </div>
                </div>

                <!-- Footer with Community Share Link & Actions -->
                <div class="op-tmpl-footer-row">
                    <div class="op-tmpl-share-note">
                        <i class="fas fa-globe"></i>
                        <span>
                            Want to share your work? If you want to have your template appear on openpublisher.app for everyone, you can 
                            <a href="https://github.com/rmellis/open-publisher" target="_blank" rel="noopener noreferrer">submit it on GitHub</a> 
                            or <a href="mailto:info@openpublisher.app?subject=Template%20Submission">email it to info@openpublisher.app</a>.
                        </span>
                    </div>
                    <div class="op-tmpl-btns">
                        <button class="op-tmpl-btn-cancel" id="op-tmpl-cancel-btn" type="button">Cancel</button>
                        <button class="op-tmpl-btn-export" id="op-tmpl-export-btn" type="button">
                            <span>Export Package</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        if (typeof DialogSystem !== 'undefined') {
            DialogSystem.show('Export Template Package', modalHtml, null, true);

            // Hide standard OK/Cancel dialog footer since the mockup features custom integrated buttons
            setTimeout(() => {
                const confirmBtn = document.getElementById('custom-dialog-confirm');
                if (confirmBtn && confirmBtn.parentElement) {
                    confirmBtn.parentElement.style.display = 'none';
                }
                const dialogBox = document.getElementById('custom-dialog-box');
                if (dialogBox) {
                    dialogBox.style.width = '640px';
                    dialogBox.style.maxWidth = '95vw';
                }
            }, 10);
        }

        // Live render thumbnail into preview frame
        let currentThumbnailDataUrl = null;
        setTimeout(async () => {
            const container = document.getElementById('op-tmpl-thumb-container');
            if (!container) return;
            try {
                const paperEl = document.getElementById('paper');
                if (window.html2canvas && paperEl) {
                    const canvas = await html2canvas(paperEl, {
                        scale: 0.65,
                        useCORS: true,
                        logging: false,
                        backgroundColor: (state.pages && state.pages[0] && state.pages[0].background) || '#ffffff'
                    });
                    currentThumbnailDataUrl = canvas.toDataURL('image/webp', 0.88);
                    container.innerHTML = `<img src="${currentThumbnailDataUrl}" alt="Template Preview" style="max-width:100%; max-height:100%; object-fit:contain; box-shadow:0 2px 8px rgba(0,0,0,0.12); border-radius:4px;">`;
                } else if (typeof renderThumbnailHTML === 'function' && state.pages && state.pages[0]) {
                    const thumbNode = renderThumbnailHTML(state.pages[0], 0);
                    container.innerHTML = '';
                    container.appendChild(thumbNode);
                }
            } catch(e) {
                if (typeof renderThumbnailHTML === 'function' && state.pages && state.pages[0]) {
                    container.innerHTML = '';
                    container.appendChild(renderThumbnailHTML(state.pages[0], 0));
                }
            }
        }, 50);

        // Bind dynamic size updates
        const updateEstimatedSizeUI = () => {
            const sizeEl = document.getElementById('op-tmpl-size-display');
            if (!sizeEl) return;
            const currentOpts = {
                embedFonts: document.getElementById('op-tmpl-fonts-check')?.checked,
                includeLinkedImages: document.getElementById('op-tmpl-linked-images-check')?.checked,
                compressZip: document.getElementById('op-tmpl-zip-check')?.checked,
                serializeBase64: document.getElementById('op-tmpl-base64-check')?.checked,
                highDpiThumb: document.getElementById('op-tmpl-highdpi-check')?.checked
            };
            sizeEl.textContent = `Estimated Size: ${calculateEstimatedSize(currentOpts)}`;
        };

        ['op-tmpl-fonts-check', 'op-tmpl-linked-images-check', 'op-tmpl-zip-check', 'op-tmpl-base64-check', 'op-tmpl-highdpi-check'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', updateEstimatedSizeUI);
        });

        // Browse button
        const browseBtn = document.getElementById('op-tmpl-browse-btn');
        if (browseBtn) {
            browseBtn.onclick = async () => {
                const saveInput = document.getElementById('op-tmpl-saveto-input');
                if (window.showDirectoryPicker) {
                    try {
                        const dirHandle = await window.showDirectoryPicker();
                        if (saveInput && dirHandle && dirHandle.name) {
                            saveInput.value = dirHandle.name;
                        }
                    } catch(e) {}
                } else {
                    const titleVal = (document.getElementById('op-tmpl-title-input')?.value || 'Template').replace(/\s+/g, '_');
                    const custom = prompt('Enter destination directory or package name:', saveInput ? saveInput.value : titleVal);
                    if (custom && saveInput) saveInput.value = custom;
                }
            };
        }

        // Category custom dropdown controller
        const categoryBox = document.getElementById('op-tmpl-category-box');
        const categoryList = document.getElementById('op-tmpl-category-list');
        const categoryDisplay = document.getElementById('op-tmpl-category-display');
        const categoryInput = document.getElementById('op-tmpl-category-input');

        let cleanupCategoryListeners = () => {};

        if (categoryBox && categoryList) {
            const toggleCategoryDropdown = (forceOpen) => {
                const currentlyOpen = categoryList.style.display === 'block';
                const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !currentlyOpen;

                if (shouldOpen) {
                    categoryList.style.display = 'block';
                    categoryBox.classList.add('open');
                    categoryBox.setAttribute('aria-expanded', 'true');
                    const selectedItem = categoryList.querySelector('.op-tmpl-dropdown-item.selected');
                    if (selectedItem) {
                        selectedItem.scrollIntoView({ block: 'nearest' });
                    }
                } else {
                    categoryList.style.display = 'none';
                    categoryBox.classList.remove('open');
                    categoryBox.setAttribute('aria-expanded', 'false');
                }
            };

            categoryBox.addEventListener('click', (e) => {
                const item = e.target.closest('.op-tmpl-dropdown-item');
                if (item) {
                    e.stopPropagation();
                    const val = item.getAttribute('data-value');
                    if (categoryInput) categoryInput.value = val;
                    if (categoryDisplay) categoryDisplay.textContent = val;
                    categoryList.querySelectorAll('.op-tmpl-dropdown-item').forEach(el => el.classList.remove('selected'));
                    item.classList.add('selected');
                    toggleCategoryDropdown(false);
                    return;
                }
                toggleCategoryDropdown();
            });

            // Keyboard accessibility
            categoryBox.addEventListener('keydown', (e) => {
                const isOpen = categoryList.style.display === 'block';
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCategoryDropdown();
                } else if (e.key === 'Escape') {
                    if (isOpen) {
                        e.stopPropagation();
                        toggleCategoryDropdown(false);
                    }
                } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (!isOpen) {
                        toggleCategoryDropdown(true);
                    } else {
                        const items = Array.from(categoryList.querySelectorAll('.op-tmpl-dropdown-item'));
                        const currentIndex = items.findIndex(el => el.classList.contains('selected'));
                        let nextIndex = currentIndex;
                        if (e.key === 'ArrowDown') {
                            nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                        } else {
                            nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                        }
                        if (items[nextIndex]) {
                            const nextItem = items[nextIndex];
                            const val = nextItem.getAttribute('data-value');
                            if (categoryInput) categoryInput.value = val;
                            if (categoryDisplay) categoryDisplay.textContent = val;
                            items.forEach(el => el.classList.remove('selected'));
                            nextItem.classList.add('selected');
                            nextItem.scrollIntoView({ block: 'nearest' });
                        }
                    }
                }
            });

            // Close when clicking outside
            const handleOutsideClick = (e) => {
                if (!categoryBox.contains(e.target)) {
                    toggleCategoryDropdown(false);
                }
            };
            document.addEventListener('click', handleOutsideClick);

            cleanupCategoryListeners = () => {
                document.removeEventListener('click', handleOutsideClick);
            };

            const closeX = document.querySelector('.custom-dialog-close');
            if (closeX) {
                closeX.addEventListener('click', cleanupCategoryListeners, { once: true });
            }
        }

        // Cancel button
        const cancelBtn = document.getElementById('op-tmpl-cancel-btn');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                cleanupCategoryListeners();
                if (typeof DialogSystem !== 'undefined') DialogSystem.close();
            };
        }

        // Export Package action
        const exportBtn = document.getElementById('op-tmpl-export-btn');
        if (exportBtn) {
            exportBtn.onclick = async () => {
                cleanupCategoryListeners();
                exportBtn.disabled = true;
                exportBtn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> <span>Packaging...</span>`;

                const templateTitle = document.getElementById('op-tmpl-title-input')?.value?.trim() || currentTitle;
                const creator = document.getElementById('op-tmpl-creator-input')?.value?.trim() || defaultAuthor;
                const category = document.getElementById('op-tmpl-category-input')?.value || defaultCategory;
                const description = document.getElementById('op-tmpl-desc-input')?.value?.trim() || defaultDesc;
                const isHighDpiThumb = !!document.getElementById('op-tmpl-highdpi-check')?.checked;
                const isEmbedFonts = !!document.getElementById('op-tmpl-fonts-check')?.checked;
                const isIncludeImages = !!document.getElementById('op-tmpl-linked-images-check')?.checked;
                const isCompressZip = !!document.getElementById('op-tmpl-zip-check')?.checked;
                const isSerializeBase64 = !!document.getElementById('op-tmpl-base64-check')?.checked;

                try {
                    // 1. Generate High-DPI Thumbnail if requested
                    let highDpiThumbDataUrl = currentThumbnailDataUrl;
                    const paperEl = document.getElementById('paper');
                    if (isHighDpiThumb && window.html2canvas && paperEl) {
                        try {
                            const hdCanvas = await html2canvas(paperEl, {
                                scale: 2.0,
                                useCORS: true,
                                logging: false,
                                backgroundColor: (state.pages && state.pages[0] && state.pages[0].background) || '#ffffff'
                            });
                            highDpiThumbDataUrl = hdCanvas.toDataURL('image/webp', 0.92);
                        } catch(e) {}
                    }

                    // 2. Clone pages and serialize base64 images if requested
                    const clonedPages = JSON.parse(JSON.stringify(state.pages || []));
                    if (isSerializeBase64) {
                        for (const p of clonedPages) {
                            if (p.elements && Array.isArray(p.elements)) {
                                for (const el of p.elements) {
                                    if (el.imgSrc && !el.imgSrc.startsWith('data:')) {
                                        el.imgSrc = await convertUrlToBase64(el.imgSrc);
                                    }
                                    // Process any img tags in innerHTML
                                    if (el.innerHTML && el.innerHTML.includes('<img')) {
                                        const tempDiv = document.createElement('div');
                                        tempDiv.innerHTML = el.innerHTML;
                                        const imgTags = tempDiv.querySelectorAll('img');
                                        for (const img of imgTags) {
                                            const src = img.getAttribute('src');
                                            if (src && !src.startsWith('data:')) {
                                                const b64 = await convertUrlToBase64(src);
                                                img.setAttribute('src', b64);
                                            }
                                        }
                                        el.innerHTML = tempDiv.innerHTML;
                                    }
                                }
                            }
                        }
                    }

                    // 3. Assemble document properties and package metadata
                    const docProps = Object.assign({}, state.documentProperties || {}, {
                        author: creator,
                        subject: description,
                        category: category,
                        company: creator
                    });
                    state.documentProperties = docProps;

                    const templateMetadata = {
                        title: templateTitle,
                        creator: creator,
                        category: category,
                        description: description,
                        exportDate: new Date().toISOString(),
                        version: '5.18.1',
                        format: state.format || 'A4',
                        dpi: state.dpi || 96,
                        pageCount: clonedPages.length,
                        hasHighDpiThumbnail: isHighDpiThumb,
                        fontsEmbedded: isEmbedFonts,
                        imagesSerialized: isSerializeBase64
                    };

                    const firstPage = clonedPages[0] || {};
                    const curDpi = state.dpi || (firstPage && firstPage.dpi) || 96;

                    const templateDocData = {
                        title: templateTitle,
                        isTemplate: true,
                        creator: creator,
                        category: category,
                        description: description,
                        format: state.format || 'A4',
                        dpi: curDpi,
                        unit: state.unit || 'cm',
                        rulerUnit: state.rulerUnit || 'cm',
                        rulerUnitExplicit: !!state._userExplicitRulerUnit,
                        pages: clonedPages,
                        hasMasterPage: state.hasMasterPage || false,
                        isSpreadMode: state.isSpreadMode || false,
                        rulerOriginX: state.rulerOriginX || 0,
                        rulerOriginY: state.rulerOriginY || 0,
                        margins: state.margins || {top: 48, right: 48, bottom: 48, left: 48},
                        marginsDpi: state.marginsDpi || curDpi,
                        documentProperties: docProps,
                        templateMetadata: templateMetadata,
                        thumbnail: highDpiThumbDataUrl || undefined,
                        embeddedFonts: isEmbedFonts ? extractDocumentFonts() : undefined
                    };

                    const cleanFileName = templateTitle.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'Template';

                    // 4. Save as ZIP package or direct .opub
                    if (isCompressZip && typeof JSZip !== 'undefined') {
                        const zip = new JSZip();
                        
                        // Add main .opub file
                        zip.file(`${cleanFileName}.opub`, JSON.stringify(templateDocData, null, 2));

                        // Add thumbnail
                        if (highDpiThumbDataUrl && highDpiThumbDataUrl.includes(',')) {
                            const b64Data = highDpiThumbDataUrl.split(',')[1];
                            zip.file(`${cleanFileName}_thumbnail.webp`, b64Data, { base64: true });
                        }

                        // Add manifest.json for ecosystem mapping
                        zip.file('manifest.json', JSON.stringify(templateMetadata, null, 2));

                        // Add README
                        const readmeContent = `Template: ${templateTitle}\nCreator: ${creator}\nCategory: ${category}\nDescription: ${description}\nExported with Open Publisher v5.18.1\nWebsite: https://openpublisher.app\nGitHub: https://github.com/rmellis/open-publisher`;
                        zip.file('README.txt', readmeContent);

                        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });

                        // Trigger download
                        const downloadUrl = URL.createObjectURL(zipBlob);
                        const a = document.createElement('a');
                        a.href = downloadUrl;
                        a.download = `${cleanFileName}_Template_Package.zip`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(downloadUrl);

                    } else {
                        // Standard .opub template save
                        const opubBlob = new Blob([JSON.stringify(templateDocData, null, 2)], { type: 'application/json' });

                        if (window.showSaveFilePicker) {
                            try {
                                const handle = await window.showSaveFilePicker({
                                    suggestedName: `${cleanFileName}.opub`,
                                    types: [{
                                        description: 'Open Publisher Template (*.opub)',
                                        accept: { 'application/json': ['.opub'] }
                                    }]
                                });
                                const writable = await handle.createWritable();
                                await writable.write(opubBlob);
                                await writable.close();
                            } catch(pickerErr) {
                                if (pickerErr.name !== 'AbortError') {
                                    // Fallback to direct anchor download
                                    const a = document.createElement('a');
                                    a.href = URL.createObjectURL(opubBlob);
                                    a.download = `${cleanFileName}.opub`;
                                    a.click();
                                }
                            }
                        } else {
                            const a = document.createElement('a');
                            a.href = URL.createObjectURL(opubBlob);
                            a.download = `${cleanFileName}.opub`;
                            a.click();
                        }
                    }

                    // Close modal and show confirmation
                    if (typeof DialogSystem !== 'undefined') {
                        DialogSystem.close();
                        setTimeout(() => {
                            DialogSystem.alert('Template Package Exported', `Template "${templateTitle}" was successfully packaged with metadata.`);
                        }, 150);
                    }

                } catch(err) {
                    console.error('Template export error:', err);
                    alert('Export failed: ' + err.message);
                } finally {
                    exportBtn.disabled = false;
                    exportBtn.innerHTML = `<span>Export Package</span>`;
                }
            };
        }
    };

    // Global alias
    window.exportTemplatePackage = window.showExportTemplateModal;

})(window);
