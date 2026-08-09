window.tabDialog = {
    tabs: [],
    
    open: function() {
        if (!window._activeIndentBlock) {
            DialogSystem.alert('Notice', 'Please select a text box and click inside a paragraph first to set tabs for that paragraph.');
            return;
        }
        
        const rawTabs = window._activeIndentBlock.getAttribute('data-tabs');
        this.tabs = rawTabs ? JSON.parse(rawTabs) : [];
        
        const html = `
            <div style="width: 380px; font-size: 13px;">
                <p style="font-size: 12px; color: #555; margin-top: 0; margin-bottom: 15px; line-height: 1.4;">
                    <strong>What are Tabs?</strong> Tabs allow you to align text precisely across the page. Double-click the ruler to set a stop, choose an alignment, and optionally add a leader line (like dots or dashes).
                </p>
                <div style="display: flex; gap: 15px;">
                    <div style="flex: 1;">
                        <label style="font-weight: bold; margin-bottom: 5px; display: block;">Tab stop position:</label>
                        <input type="text" id="tab-position-input" value="100" style="width: 100%; box-sizing: border-box; margin-bottom: 8px; padding: 4px; border: 1px solid #999;">
                        <select id="tab-list" size="8" style="width: 100%; box-sizing: border-box; height: 120px; border: 1px solid #999;"></select>
                    </div>
                    <div style="flex: 1;">
                        <fieldset style="margin-bottom: 10px; border: 1px solid #ccc; padding: 5px 10px;">
                            <legend style="padding: 0 5px; color: #555;">Alignment</legend>
                            <label style="display: block; margin-bottom: 4px;"><input type="radio" name="tab-align" value="left" style="accent-color: var(--ui-theme-color);" checked> Left</label>
                            <label style="display: block; margin-bottom: 4px;"><input type="radio" name="tab-align" value="center" style="accent-color: var(--ui-theme-color);"> Center</label>
                            <label style="display: block; margin-bottom: 4px;"><input type="radio" name="tab-align" value="right" style="accent-color: var(--ui-theme-color);"> Right</label>
                            <label style="display: block;"><input type="radio" name="tab-align" value="decimal" style="accent-color: var(--ui-theme-color);"> Decimal</label>
                        </fieldset>
                        <fieldset style="border: 1px solid #ccc; padding: 5px 10px;">
                            <legend style="padding: 0 5px; color: #555;">Leader</legend>
                            <label style="display: block; margin-bottom: 4px;"><input type="radio" name="tab-leader" value="none" style="accent-color: var(--ui-theme-color);" checked> 1 None</label>
                            <label style="display: block; margin-bottom: 4px;"><input type="radio" name="tab-leader" value="dotted" style="accent-color: var(--ui-theme-color);"> 2 .......</label>
                            <label style="display: block; margin-bottom: 4px;"><input type="radio" name="tab-leader" value="dashed" style="accent-color: var(--ui-theme-color);"> 3 -------</label>
                            <label style="display: block;"><input type="radio" name="tab-leader" value="solid" style="accent-color: var(--ui-theme-color);"> 4 _______</label>
                        </fieldset>
                    </div>
                </div>
                <div style="margin-top: 15px; text-align: right;">
                    <button class="btn-secondary" onclick="window.tabDialog.setTab()" style="padding: 4px 10px;">Set</button>
                    <button class="btn-secondary" onclick="window.tabDialog.clearTab()" style="padding: 4px 10px;">Clear</button>
                    <button class="btn-secondary" onclick="window.tabDialog.clearAllTabs()" style="padding: 4px 10px;">Clear All</button>
                </div>
                <div style="margin-top: 10px; font-size: 11px; color: #666; font-style: italic;">
                    Note: After configuring, press the 'Tab' key inside the text box to jump to these stops.
                </div>
            </div>
        `;
        
        DialogSystem.show('Tabs', html, () => {
            this.applyAndClose();
        });
        
        // Wait for DOM injection
        setTimeout(() => {
            this.renderList();
            const input = document.getElementById('tab-position-input');
            if(input) input.focus();
        }, 10);
    },
    
    renderList: function() {
        const list = document.getElementById('tab-list');
        list.innerHTML = '';
        this.tabs.sort((a,b) => a.pos - b.pos);
        this.tabs.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.pos;
            let leaderText = t.leader === 'none' ? '' : ` (${t.leader})`;
            opt.textContent = `${t.pos}px - ${t.align}${leaderText}`;
            list.appendChild(opt);
        });
    },
    
    setTab: function() {
        const posInput = document.getElementById('tab-position-input').value;
        const pos = parseFloat(posInput);
        if (isNaN(pos) || pos <= 0) return;
        
        const align = document.querySelector('input[name="tab-align"]:checked').value;
        const leader = document.querySelector('input[name="tab-leader"]:checked').value;
        
        this.tabs = this.tabs.filter(t => Math.abs(t.pos - pos) > 1);
        this.tabs.push({ pos, align, leader });
        this.renderList();
        document.getElementById('tab-position-input').value = '';
    },
    
    clearTab: function() {
        const list = document.getElementById('tab-list');
        if (list.selectedIndex < 0) return;
        const pos = parseFloat(list.options[list.selectedIndex].value);
        this.tabs = this.tabs.filter(t => t.pos !== pos);
        this.renderList();
    },
    
    clearAllTabs: function() {
        this.tabs = [];
        this.renderList();
    },
    
    applyAndClose: function() {
        if (!window._activeIndentBlock) return;
        
        if (this.tabs.length === 0) {
            window._activeIndentBlock.removeAttribute('data-tabs');
        } else {
            this.tabs.sort((a,b) => a.pos - b.pos);
            window._activeIndentBlock.setAttribute('data-tabs', JSON.stringify(this.tabs));
        }
        
        pushHistory();
    }
};
