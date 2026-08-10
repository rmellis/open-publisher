window.showInfoModal = function() {
    const isCMYK = document.getElementById('paper').classList.contains('cmyk-mode');
    
    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 20px; max-width: 650px; margin: 0 auto;">
        <!-- Commercial Print Settings -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; display: flex; gap: 15px; align-items: flex-start;">
            <div style="background: #f1f5f9; color: var(--ui-theme-color); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
                <i class="fas fa-palette"></i>
            </div>
            <div style="flex-grow: 1;">
                <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #1e293b;">Commercial Print Settings</h3>
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; line-height: 1.4;">
                    If you are sending this document to a professional printing service, they may require the CMYK color model. Switching to CMYK will apply a soft-proof filter that simulates how your document will look when printed with physical ink (which has a narrower color gamut than a screen).
                </p>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <label style="font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="colorModel" value="RGB" ${!isCMYK ? 'checked' : ''} onchange="toggleColorModel('RGB')" style="accent-color: var(--ui-theme-color);"> 
                        RGB (Digital Display)
                    </label>
                    <label style="font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                        <input type="radio" name="colorModel" value="CMYK" ${isCMYK ? 'checked' : ''} onchange="toggleColorModel('CMYK')" style="accent-color: var(--ui-theme-color);"> 
                        CMYK (Commercial Print)
                    </label>
                </div>
            </div>
        </div>

        <!-- Design Checker -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; display: flex; gap: 15px; align-items: flex-start;">
            <div style="background: #fdf2f8; color: #db2777; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
                <i class="fas fa-stethoscope"></i>
            </div>
            <div style="flex-grow: 1;">
                <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #1e293b;">Design Checker</h3>
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; line-height: 1.4;">
                    Run a diagnostic scan on your document to find potential issues before printing or exporting. This will automatically catch text overflow, low-resolution images, or objects that have been accidentally dragged off the page canvas.
                </p>
                <button onclick="runDesignChecker()" style="background: var(--ui-theme-color); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 13px;">
                    <i class="fas fa-search" style="margin-right: 5px;"></i> Run Design Checker
                </button>
                <div id="design-checker-results" style="margin-top: 15px; display: none;"></div>
            </div>
        </div>
        <!-- Inspect Document -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; display: flex; gap: 15px; align-items: flex-start;">
            <div style="background: #ccfbf1; color: var(--ui-theme-color); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
                <i class="fas fa-search-plus"></i>
            </div>
            <div style="flex-grow: 1;">
                <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #1e293b;">Inspect Document</h3>
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; line-height: 1.4;">
                    Check the document for hidden properties or personal information before sharing it with others. The inspector will find and help you remove document metadata, off-canvas elements, and empty text boxes.
                </p>
                <button onclick="showDocumentInspectorModal()" style="background: var(--ui-theme-color); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 13px;">
                    Inspect Document
                </button>
            </div>
        </div>
    </div>
    `;

    if (typeof DialogSystem !== 'undefined') {
        DialogSystem.show('Document Info', html, null, true);
    }
};
