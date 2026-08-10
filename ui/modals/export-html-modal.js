function showExportHTMLModal() {
    const html = `
        <style>
            .html-export-row {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                cursor: pointer;
                padding: 10px;
                border: 1px solid transparent;
                border-radius: 6px;
                margin-bottom: 6px;
                transition: all 0.2s;
            }
            .html-export-row:has(input:checked) {
                background-color: #e0f2f1;
                border-color: #b2dfdb;
            }
            .html-export-row:not(:has(input:checked)) {
                background-color: transparent;
                border-color: transparent;
            }
            .html-export-row:hover:not(:has(input:checked)) {
                background-color: rgba(0,0,0,0.02);
            }
            .html-export-row input[type="checkbox"] {
                appearance: none;
                -webkit-appearance: none;
                min-width: 20px;
                width: 20px;
                height: 20px;
                border: 2px solid var(--ui-theme-color);
                border-radius: 4px;
                outline: none;
                cursor: pointer;
                position: relative;
                margin-top: 2px;
                background: white;
                transition: all 0.2s;
            }
            .html-export-row input[type="checkbox"]:checked {
                background-color: var(--ui-theme-color);
            }
            .html-export-row input[type="checkbox"]:checked::after {
                content: '';
                position: absolute;
                left: 6px;
                top: 2px;
                width: 4px;
                height: 9px;
                border: solid white;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
            }
            .html-export-title {
                font-size: 16px;
                font-weight: bold;
                color: var(--ui-theme-color);
                margin-bottom: 6px;
                margin-top: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
        </style>
        <div style="margin: -20px; padding: 10px 20px 0 20px; max-height: 85vh; overflow-y: auto; overflow-x: hidden;">
            <p style="margin-bottom: 0px; font-size: 14px; color: #555;">Advanced export options for generating self-contained, highly compatible HTML files.</p>
            
            <h4 class="html-export-title"><i class="fas fa-columns" style="width: 20px; text-align: center;"></i> Layout & Compatibility</h4>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-seamless" checked>
                <div><strong style="display: block; font-size: 14px; color: #111;">Seamless Newsletter Layout</strong><span style="font-size: 12px; color: #444; display: block;">Removes gaps, shadows, and margins between pages for continuous scrolling.</span></div>
            </label>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-email">
                <div><strong style="display: block; font-size: 14px; color: #111;">Optimize for Email Clients (Image Fallback)</strong><span style="font-size: 12px; color: #444; display: block;">Renders the entire document as a single image wrapped in a legacy table structure. Perfect for Mailchimp, Gmail, and Outlook. Disables text copying.</span></div>
            </label>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-base64" checked>
                <div><strong style="display: block; font-size: 14px; color: #111;">Embed External Images (Single-File Export)</strong><span style="font-size: 12px; color: #444; display: block;">Attempts to convert external Clipart URLs into Base64 Data URIs so the HTML file works completely offline.</span></div>
            </label>

            <h4 class="html-export-title"><i class="fas fa-desktop" style="width: 20px; text-align: center;"></i> Responsiveness & Viewing Experience</h4>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-autoscale" checked>
                <div><strong style="display: block; font-size: 14px; color: #111;">Auto-Scale to Fit Screen (Mobile Friendly)</strong><span style="font-size: 12px; color: #444; display: block;">Injects a viewport meta tag and CSS scale to make the fixed-width flyer shrink to fit mobile screens.</span></div>
            </label>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-selectable" checked>
                <div><strong style="display: block; font-size: 14px; color: #111;">Enable Text Selection / Copying</strong><span style="font-size: 12px; color: #444; display: block;">Allows viewers to highlight and copy text. (Ignored if Email Optimization is checked).</span></div>
            </label>

            <h4 class="html-export-title"><i class="fas fa-tags" style="width: 20px; text-align: center;"></i> SEO & Metadata</h4>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-seo" checked>
                <div><strong style="display: block; font-size: 14px; color: #111;">Inject SEO & Social Meta Tags</strong><span style="font-size: 12px; color: #444; display: block;">Uses the Analysis Suite to extract keywords and summary text for Twitter/Facebook preview cards.</span></div>
            </label>

            <h4 class="html-export-title"><i class="fas fa-code" style="width: 20px; text-align: center;"></i> Code Output & Polish</h4>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-minify">
                <div><strong style="display: block; font-size: 14px; color: #111;">Minify Output</strong><span style="font-size: 12px; color: #444; display: block;">Strips unnecessary whitespace and line breaks to minimize file size.</span></div>
            </label>
            
            <label class="html-export-row">
                <input type="checkbox" id="html-opt-fonts" checked>
                <div><strong style="display: block; font-size: 14px; color: #111;">Include Web Fonts</strong><span style="font-size: 12px; color: #444; display: block;">Injects Google Fonts links to ensure typography renders accurately.</span></div>
            </label>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px; position: sticky; bottom: 0; background: white; padding: 15px 20px 20px 20px; margin-left: -20px; margin-right: -20px; border-top: 1px solid #eee; z-index: 10;">
                <button class="op-btn op-btn-cancel" onclick="DialogSystem.close()">Cancel</button>
                <button class="op-btn" style="background: var(--ui-theme-color); color: white;" onclick="
                    const opts = {
                        seamless: document.getElementById('html-opt-seamless').checked,
                        email: document.getElementById('html-opt-email').checked,
                        base64: document.getElementById('html-opt-base64').checked,
                        autoscale: document.getElementById('html-opt-autoscale').checked,
                        selectable: document.getElementById('html-opt-selectable').checked,
                        seo: document.getElementById('html-opt-seo').checked,
                        minify: document.getElementById('html-opt-minify').checked,
                        fonts: document.getElementById('html-opt-fonts').checked
                    };
                    DialogSystem.close();
                    if(typeof exportAsHTML === 'function') exportAsHTML(opts);
                ">
                    <i class="fas fa-file-code" style="margin-right: 8px;"></i> Generate HTML File
                </button>
            </div>
        </div>
    `;
    
    if (typeof DialogSystem !== 'undefined') {
        DialogSystem.show('Advanced HTML Export', html, null, true);
        setTimeout(() => {
            const confirmBtn = document.getElementById('custom-dialog-confirm');
            if (confirmBtn && confirmBtn.parentElement) {
                confirmBtn.parentElement.style.display = 'none';
            }
        }, 10);
    }
}
