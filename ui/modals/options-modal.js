window.switchOptionsTab = function(activeId) {
    document.querySelectorAll('.opt-tab').forEach(el => {
        el.style.background = 'transparent';
        el.style.borderLeftColor = 'transparent';
        el.style.fontWeight = 'normal';
    });
    document.querySelectorAll('.opt-content').forEach(el => el.style.display = 'none');
    
    const activeTab = document.getElementById('opt-tab-' + activeId);
    if (activeTab) {
        activeTab.style.background = '#f0f0f0';
        activeTab.style.borderLeftColor = 'var(--ui-theme-color)';
        activeTab.style.fontWeight = 'bold';
    }
    const activeContent = document.getElementById('opt-content-' + activeId);
    if (activeContent) activeContent.style.display = 'block';
};

window.saveGlobalOptions = function(closeDialog = true) {
    const cbHyphen = document.getElementById('opt-autohyphenate');
    if (cbHyphen) {
        localStorage.setItem('opub_autoHyphenate', cbHyphen.checked ? 'true' : 'false');
    }
    
    const cbSpell = document.getElementById('opt-spellcheck');
    if (cbSpell) {
        localStorage.setItem('opub_spellcheck', cbSpell.checked ? 'true' : 'false');
    }
    
    const txtUser = document.getElementById('opt-username');
    if (txtUser) {
        localStorage.setItem('opub_username', txtUser.value);
    }
    
    if (closeDialog) {
        if(typeof DialogSystem !== 'undefined') DialogSystem.close();
    } else {
        const applyBtn = document.getElementById('custom-dialog-apply');
        if (applyBtn) {
            const originalText = applyBtn.innerText;
            applyBtn.innerText = 'Applied!';
            setTimeout(() => {
                if (applyBtn) applyBtn.innerText = originalText;
            }, 1000);
        }
    }
};

window.showOptionsModal = function() {
    const autoHyphenate = localStorage.getItem('opub_autoHyphenate') === 'true';
    const username = localStorage.getItem('opub_username') || 'Publisher User';
    const spellcheck = localStorage.getItem('opub_spellcheck') !== 'false';
    
    const tabs = ['General', 'Proofing', 'Save', 'Language', 'Advanced', 'Customize Ribbon', 'Trust Center'];
    
    let tabsHtml = '';
    let contentsHtml = '';
    
    tabs.forEach((tab) => {
        const id = tab.toLowerCase().replace(' ', '-');
        const isActive = tab === 'General'; // Start with General tab open
        
        tabsHtml += `
            <div id="opt-tab-${id}" class="opt-tab" onclick="switchOptionsTab('${id}')" 
                 onmouseover="if(this.style.background !== 'rgb(240, 240, 240)' && this.style.background !== '#f0f0f0') this.style.background='#f9f9f9'" 
                 onmouseout="if(this.style.fontWeight !== 'bold') this.style.background='transparent'"
                 style="padding: 10px 15px; cursor: pointer; border-left: 3px solid ${isActive ? 'var(--ui-theme-color)' : 'transparent'}; 
                 color: #444; background: ${isActive ? '#f0f0f0' : 'transparent'}; font-weight: ${isActive ? 'bold' : 'normal'}; transition: background 0.2s;">
                ${tab}
            </div>
        `;
        
        let tabContent = '';
        if (tab === 'General') {
            tabContent = `
                <strong style="display: block; margin-bottom: 8px;">User Interface options</strong>
                <label style="display: flex; align-items: center; margin-top: 10px; opacity: 0.6; cursor: not-allowed;">
                    <input type="checkbox" disabled style="margin-right: 10px;">
                    Show the Start screen when this application starts <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span>
                </label>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <strong style="display: block; margin-bottom: 8px;">Personalize your copy of Publisher</strong>
                <div style="margin-top: 10px; display: flex; align-items: center;">
                    <span style="margin-right: 15px; width: 100px;">User name:</span>
                    <input type="text" id="opt-username" value="${username}" style="padding: 5px; border: 1px solid #ccc; border-radius: 3px; width: 200px;">
                </div>
                <div style="margin-top: 15px; display: flex; align-items: center;">
                    <span style="margin-right: 15px; width: 100px;">UI Theme:</span>
                    <div class="modern-select" onclick="toggleThemeDropdown(this); event.stopPropagation();" style="width: 200px; height: 26px;">
                        <span id="opt-theme">${localStorage.getItem('opub_ui_theme') || 'Publisher / Classic (Teal)'}</span>
                        <div class="arrow-box"><i class="fas fa-chevron-down" style="font-size:10px;"></i></div>
                    </div>
                </div>
            `;
        } else if (tab === 'Proofing') {
            tabContent = `
                <strong style="display: block; margin-bottom: 8px;">AutoCorrect options</strong>
                <button class="btn-secondary" disabled style="opacity: 0.6; cursor: not-allowed;">AutoCorrect Options... <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span></button>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <strong style="display: block; margin-bottom: 8px;">When correcting spelling in Publisher</strong>
                <label style="display: flex; align-items: center; margin-top: 10px; cursor: pointer;">
                    <input type="checkbox" id="opt-spellcheck" ${spellcheck ? 'checked' : ''} style="margin-right: 10px;">
                    Check spelling as you type
                </label>
                <label style="display: flex; align-items: center; margin-top: 10px; opacity: 0.6; cursor: not-allowed;">
                    <input type="checkbox" disabled style="margin-right: 10px;">
                    Mark grammar errors as you type <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span>
                </label>
            `;
        } else if (tab === 'Save') {
            tabContent = `
                <strong style="display: block; margin-bottom: 8px;">Save documents</strong>
                <label style="display: flex; align-items: center; margin-top: 10px; opacity: 0.6; cursor: not-allowed;">
                    <input type="checkbox" checked disabled style="margin-right: 10px;">
                    Save AutoRecover information every <input type="number" value="10" disabled style="width: 40px; margin: 0 5px; border: 1px solid #ccc; border-radius: 3px;"> minutes <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span>
                </label>
                <div style="margin-top: 15px; opacity: 0.6;">
                    <span style="margin-right: 15px; display: block; margin-bottom: 5px;">Default local file location:</span>
                    <input type="text" value="C:\\Users\\Publisher\\Documents" disabled style="padding: 5px; border: 1px solid #ccc; border-radius: 3px; width: 100%; max-width: 300px; cursor: not-allowed;">
                    <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span>
                </div>
            `;
        } else if (tab === 'Language') {
            tabContent = `
                <strong style="display: block; margin-bottom: 8px;">Office display language</strong>
                <p style="font-size: 12px; color: #666; margin-top: 0;">Set the language priority order for the buttons, tabs and help.</p>
                <select disabled style="padding: 5px; border: 1px solid #ccc; border-radius: 3px; width: 100%; max-width: 300px; margin-top: 10px; opacity: 0.6; cursor: not-allowed;">
                    <option>English (United States) &lt;default&gt;</option>
                </select>
                <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span>
            `;
        } else if (tab === 'Advanced') {
            tabContent = `
                <strong style="display: block; margin-bottom: 8px;">Text Formatting</strong>
                <label style="display: flex; align-items: center; margin-top: 10px; cursor: pointer;">
                    <input type="checkbox" id="opt-autohyphenate" ${autoHyphenate ? 'checked' : ''} style="margin-right: 10px;">
                    Automatically hyphenate in new text boxes
                </label>
                <p style="font-size: 11px; color: #666; margin-left: 23px; margin-top: 4px;">Applies to any newly created text box or newsletter block.</p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <strong style="display: block; margin-bottom: 8px;">Display</strong>
                <div style="margin-top: 10px; opacity: 0.6; display: flex; align-items: center;">
                    <span style="margin-right: 15px;">Show measurements in units of:</span>
                    <select disabled style="padding: 5px; border: 1px solid #ccc; border-radius: 3px; cursor: not-allowed;">
                        <option>Inches</option>
                        <option>Centimeters</option>
                        <option>Pixels</option>
                    </select>
                    <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span>
                </div>
            `;
        } else if (tab === 'Customize Ribbon') {
            tabContent = `
                <strong style="display: block; margin-bottom: 8px;">Customize the Ribbon</strong>
                <div style="display: flex; gap: 20px; margin-top: 10px; opacity: 0.6;">
                    <div style="flex: 1; border: 1px solid #ccc; height: 150px; border-radius: 3px; background: #fafafa; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #888;">
                        List of Commands
                    </div>
                    <div style="flex: 1; border: 1px solid #ccc; height: 150px; border-radius: 3px; background: #fafafa; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #888;">
                        Ribbon Tabs
                    </div>
                </div>
                <p style="color: #d9534f; font-size: 11px; font-weight: bold; text-align: center; margin-top: 10px;">(Drag & Drop Customization Coming Soon)</p>
            `;
        } else if (tab === 'Trust Center') {
            tabContent = `
                <strong style="display: block; margin-bottom: 8px;">Protecting your privacy</strong>
                <p style="font-size: 12px; color: #666; margin-top: 0;">Trust Center contains security and privacy settings. These settings help keep your computer secure.</p>
                <button class="btn-secondary" disabled style="opacity: 0.6; cursor: not-allowed; margin-top: 10px;">Trust Center Settings... <span style="margin-left: 8px; color: #d9534f; font-size: 11px; font-weight: bold;">(Coming Soon)</span></button>
            `;
        }
        
        contentsHtml += `
            <div id="opt-content-${id}" class="opt-content" style="display: ${isActive ? 'block' : 'none'};">
                <h3 style="margin-top: 0; margin-bottom: 25px;">${tab}</h3>
                ${tabContent}
            </div>
        `;
    });
    
    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; display: flex; height: 380px; width: 650px;">
        <div style="width: 170px; border-right: 1px solid #ddd; padding: 15px 0; overflow-y: auto;">
            ${tabsHtml}
        </div>
        <div style="flex-grow: 1; padding: 20px; overflow-y: auto;">
            ${contentsHtml}
        </div>
    </div>
    `;
    DialogSystem.show('Options', html, () => {
        saveGlobalOptions(true);
    }, false, 'OK', () => {
        saveGlobalOptions(false);
    });
};
