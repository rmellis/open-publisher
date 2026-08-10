window.showDocumentPropertiesModal = function() {
    const props = state.documentProperties || { author: '', company: '', subject: '', keywords: '' };
    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; display: flex; flex-direction: column; gap: 15px; max-width: 450px; margin: 0 auto;">
        <p style="margin: 0; font-size: 13px; color: #64748b;">Edit the properties of this document. This metadata is saved within the file.</p>
        <div style="display: flex; flex-direction: column; gap: 5px;">
            <label style="font-size: 12px; font-weight: 600; color: #1e293b;">Author</label>
            <input type="text" id="prop-author" value="${props.author}" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: inherit; font-size: 13px;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px;">
            <label style="font-size: 12px; font-weight: 600; color: #1e293b;">Company</label>
            <input type="text" id="prop-company" value="${props.company}" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: inherit; font-size: 13px;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px;">
            <label style="font-size: 12px; font-weight: 600; color: #1e293b;">Subject</label>
            <input type="text" id="prop-subject" value="${props.subject}" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: inherit; font-size: 13px;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 5px;">
            <label style="font-size: 12px; font-weight: 600; color: #1e293b;">Keywords</label>
            <input type="text" id="prop-keywords" value="${props.keywords}" style="padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-family: inherit; font-size: 13px;">
        </div>
    </div>
    `;
    if (typeof DialogSystem !== 'undefined') {
        DialogSystem.show('Document Properties', html, () => {
            state.documentProperties = {
                author: document.getElementById('prop-author').value,
                company: document.getElementById('prop-company').value,
                subject: document.getElementById('prop-subject').value,
                keywords: document.getElementById('prop-keywords').value
            };
        }, false);
    }
};
