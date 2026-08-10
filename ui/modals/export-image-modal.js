window.showExportImageModal = function() {
    window.exportImageResolutionSetting = 96; // default

    const html = `
        <div style="padding: 10px 20px 0 20px;">
            <p style="margin-bottom: 15px; font-size: 14px; color: var(--ui-text, #555);">Export the current page as a JPEG image.</p>
            
            <div style="display:flex; align-items:center; justify-content:space-between; background:var(--ui-panel-bg, #f8f9fa); padding:15px; border-radius:8px; border:1px solid var(--ui-border, #e0e0e0); margin-bottom:20px;">
                <div>
                    <div style="font-weight:bold; color:var(--ui-theme-dark); margin-bottom:4px;">Export Resolution</div>
                    <div id="img-res-display" style="font-size:13px; color:var(--ui-text-muted, #555);">Web (96 dpi)</div>
                </div>
                <button class="op-btn" style="padding:6px 12px; font-size:13px; background:transparent; color:var(--ui-theme-color); border:1px solid var(--ui-theme-color); border-radius:4px; cursor:pointer;" onclick="window.toggleImageResolution(this)">Change</button>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                <button class="op-btn op-btn-cancel" style="padding:8px 16px; font-size:14px; font-weight:bold; border-radius:4px; cursor:pointer; background:transparent; color:var(--ui-text); border:1px solid var(--ui-border);" onclick="DialogSystem.close()">Cancel</button>
                <button class="op-btn" style="padding:8px 16px; font-size:14px; font-weight:bold; border-radius:4px; cursor:pointer; background: var(--ui-theme-color); color: var(--ui-theme-text, white); border:none;" onclick="
                    DialogSystem.close();
                    if(typeof exportAsImage === 'function') exportAsImage(window.exportImageResolutionSetting);
                ">
                    <i class="fas fa-file-image" style="margin-right: 8px;"></i> Save Image
                </button>
            </div>
        </div>
    `;
    
    if (typeof DialogSystem !== 'undefined') {
        DialogSystem.show('Export as Image', html, null, true);
        setTimeout(() => {
            const confirmBtn = document.getElementById('custom-dialog-confirm');
            if (confirmBtn && confirmBtn.parentElement) {
                confirmBtn.parentElement.style.display = 'none';
            }
        }, 10);
    }
};


window.toggleImageResolution = function(btn) {
    if (window.exportImageResolutionSetting === 96) {
        window.exportImageResolutionSetting = 300;
        document.getElementById('img-res-display').innerText = 'High Quality (300 dpi)';
    } else {
        window.exportImageResolutionSetting = 96;
        document.getElementById('img-res-display').innerText = 'Web (96 dpi)';
    }
};
