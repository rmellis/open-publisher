// Open Publisher Options Modal (v5.7.5)

// Escape helper for safe innerHTML injection
function _optEscapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function _optEscapeJs(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Global Desktop Environment Detector (Windows, macOS, Linux, FreeBSD native apps)
window.isDesktopApp = function() {
    // 1. Root and body class tagging
    if (typeof document !== 'undefined') {
        if (document.documentElement && document.documentElement.classList.contains('is-desktop-app')) return true;
        if (document.body && (document.body.classList.contains('is-desktop-app') || document.body.classList.contains('mac-theme'))) return true;
    }

    // 2. Desktop IPC bridges & window flags
    if (typeof window !== 'undefined') {
        if (window._desktopBridgeActive || (window.desktopIPC && window.desktopIPC.isDesktop) || window._opBridgeActive || window._isDesktopClient) {
            return true;
        }
    }

    // 3. Wrapper-injected styles check (#coord-display altered by wrapper.html webview.insertCSS)
    if (typeof document !== 'undefined') {
        const coord = document.getElementById('coord-display');
        if (coord) {
            const cs = window.getComputedStyle(coord);
            if (cs && (cs.zIndex === '999999' || (cs.transform && cs.transform.includes('-15')))) {
                return true;
            }
        }
    }

    // 4. NW.js environment detection across all platforms
    if (typeof nw !== 'undefined' && nw !== null) return true;
    if (typeof window !== 'undefined' && typeof window.nw !== 'undefined' && window.nw !== null) return true;
    if (typeof globalThis !== 'undefined' && typeof globalThis.nw !== 'undefined' && globalThis.nw !== null) return true;
    if (typeof global !== 'undefined' && typeof global.nw !== 'undefined' && global.nw !== null) return true;

    // 5. NW.js Node process versions
    if (typeof process !== 'undefined' && process && process.versions && !!(process.versions.nw || process.versions['node-webkit'] || process.versions['nw-flavor'])) return true;
    if (typeof window !== 'undefined' && window.process && window.process.versions && !!(window.process.versions.nw || window.process.versions['node-webkit'] || window.process.versions['nw-flavor'])) return true;
    if (typeof global !== 'undefined' && global.process && global.process.versions && !!(global.process.versions.nw || global.process.versions['node-webkit'])) return true;

    // 6. Electron runtime & FreeBSD standalone package
    if (typeof process !== 'undefined' && process && process.versions && !!process.versions.electron) return true;
    if (typeof window !== 'undefined' && window.process && (window.process.type || (window.process.versions && window.process.versions.electron))) return true;

    // 7. User Agent inspection (case-insensitive for OpenPublisher, nwjs, nw.js, node-webkit, Electron)
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
        if (/OpenPublisher|nwjs|nw\.js|node-webkit|Electron/i.test(navigator.userAgent)) {
            return true;
        }
    }

    // 8. NW.js application protocol
    if (typeof location !== 'undefined' && location.protocol === 'chrome-extension:') {
        if (typeof chrome !== 'undefined' && (chrome.app || chrome.runtime)) return true;
    }

    // 9. NW.js GUI module
    try {
        if (typeof require === 'function' && require('nw.gui')) return true;
    } catch(e) {}

    return false;
};

// Background AutoRecover scheduler (Browser web mode only)
window.scheduleAutoRecover = function() {
    if (window._autoRecoverTimer) {
        clearInterval(window._autoRecoverTimer);
        window._autoRecoverTimer = null;
    }

    // In installable desktop apps (Windows, MacOS, Linux, FreeBSD), auto-recovery
    // and periodic disk backups are handled natively by the desktop shell.
    // Defer completely to the native engine to avoid duplicate background timers and double saves.
    if (typeof window.isDesktopApp === 'function' && window.isDesktopApp()) {
        console.log('Open Publisher: Running in desktop app; native auto-recovery and backup manager active.');
        return;
    }

    const enabled = localStorage.getItem('opub_autorecover_enabled') !== 'false';
    if (!enabled) return;

    const mins = parseInt(localStorage.getItem('opub_autorecover_interval') || '10', 10);
    const ms = Math.max(1, isNaN(mins) ? 10 : mins) * 60 * 1000;

    window._autoRecoverTimer = setInterval(() => {
        try {
            if (typeof state !== 'undefined' && state.pages && state.pages.length > 0) {
                const firstPage = state.pages[0] || {};
                const docTitle = document.getElementById('doc-title') ? document.getElementById('doc-title').innerText.replace(/ \*$/, '') : 'Publication';
                const snap = {
                    title: docTitle,
                    pages: state.pages,
                    format: state.format || 'A4',
                    dpi: state.dpi || 96
                };
                localStorage.setItem('opub_autorecover_doc', JSON.stringify(snap));
                localStorage.setItem('opub_autorecover_timestamp', Date.now().toString());
            }
        } catch(e) {
            console.warn('AutoRecover capture warning:', e);
        }
    }, ms);
};

// Exit confirmation handler with Desktop App bypass to prevent double exit modals
if (!window._exitConfirmAttached) {
    window._exitConfirmAttached = true;
    window.addEventListener('beforeunload', function(e) {
        // In installable desktop apps (Windows, MacOS, Linux, FreeBSD), exit confirmation
        // and dirty-state handling are managed natively by the desktop shell's Smart Exit Modal.
        // We MUST return immediately without prompting so that Chromium never produces a double exit dialog!
        if (typeof window.isDesktopApp === 'function' && window.isDesktopApp()) {
            return;
        }

        if (localStorage.getItem('opub_confirm_exit') === 'false') return;
        if (typeof state !== 'undefined' && state.pages && state.pages.length > 0) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });
}

// Ribbon Tab Visibility & Layout Manager
window.applyRibbonTabVisibility = function() {
    try {
        const hiddenRaw = localStorage.getItem('opub_hidden_ribbon_tabs');
        const hidden = hiddenRaw ? JSON.parse(hiddenRaw) : [];
        const customizableTabs = ['insert', 'design', 'review', 'view'];

        customizableTabs.forEach(tabKey => {
            const tabEl = document.querySelector(`.ribbon-tabs .tab[onclick*="'${tabKey}'"]`) ||
                          document.querySelector(`.ribbon-tabs .tab[onclick*='"${tabKey}"']`);
            if (tabEl) {
                if (hidden.includes(tabKey)) {
                    tabEl.style.display = 'none';
                    const ribbon = document.getElementById('ribbon-' + tabKey);
                    if (ribbon && ribbon.classList.contains('active')) {
                        if (typeof switchTab === 'function') switchTab('home');
                    }
                } else {
                    tabEl.style.display = '';
                }
            }
        });
    } catch(e) {
        console.warn('Ribbon visibility sync error:', e);
    }
};

// Record factory default group order on first run
window._defaultRibbonGroupsOrder = window._defaultRibbonGroupsOrder || {};
window._initDefaultRibbonOrder = function() {
    ['home', 'insert', 'design', 'review', 'view'].forEach(tabKey => {
        const toolbar = document.getElementById('ribbon-' + tabKey);
        if (toolbar && !window._defaultRibbonGroupsOrder[tabKey]) {
            const groups = Array.from(toolbar.querySelectorAll(':scope > .group'));
            window._defaultRibbonGroupsOrder[tabKey] = groups.map(g => {
                const lbl = g.querySelector('.group-label');
                return {
                    label: lbl ? lbl.innerText.trim() : '',
                    element: g
                };
            });
        }
    });
};

// Ribbon custom order state
window._selectedRibbonItem = {
    tabKey: 'home',
    type: 'group',
    groupIndex: 0,
    toolIndex: -1
};

// Get items for a ribbon tab
window.getRibbonTabItems = function(tabKey) {
    const toolbar = document.getElementById('ribbon-' + tabKey);
    if (!toolbar) return [];
    const groups = Array.from(toolbar.querySelectorAll(':scope > .group'));
    return groups.map((g, idx) => {
        const lbl = g.querySelector('.group-label');
        const label = lbl ? lbl.innerText.trim() : ('Group ' + (idx + 1));
        const toolBtns = Array.from(g.querySelectorAll('.tool-btn, .mini-btn, .modern-select, .font-picker-container'));
        const tools = toolBtns.map(tb => {
            let name = '';
            if (tb.classList.contains('font-picker-container') || tb.id === 'ribbon-font-btn') {
                name = 'Font Family & Format';
            } else if (tb.title) {
                name = tb.title;
            } else {
                name = tb.innerText.trim().replace(/\s+/g, ' ');
            }
            if (!name) name = 'Tool';
            return {
                name: name,
                element: tb
            };
        });
        return {
            id: 'group-' + tabKey + '-' + idx,
            label: label,
            element: g,
            tools: tools
        };
    });
};

// Render the interactive list in Customize Ribbon modal
window.renderRibbonCustomizeList = function(tabKey) {
    window._initDefaultRibbonOrder();
    if (!tabKey) tabKey = (window._selectedRibbonItem && window._selectedRibbonItem.tabKey) ? window._selectedRibbonItem.tabKey : 'home';
    window._selectedRibbonItem.tabKey = tabKey;
    
    const sel = document.getElementById('opt-ribbon-tab-select');
    if (sel && sel.value !== tabKey) sel.value = tabKey;

    const container = document.getElementById('opt-ribbon-items-container');
    if (!container) return;

    const groups = window.getRibbonTabItems(tabKey);
    if (!groups || groups.length === 0) {
        container.innerHTML = '<div style="padding: 10px; font-size: 12px; opacity: 0.6;">No items found on this tab.</div>';
        return;
    }

    if (window._selectedRibbonItem.groupIndex >= groups.length) {
        window._selectedRibbonItem.groupIndex = Math.max(0, groups.length - 1);
    }

    const isDark = document.body.classList.contains('dark-mode');
    let html = '';

    groups.forEach((g, gIdx) => {
        const isGroupSelected = (window._selectedRibbonItem.type === 'group' && window._selectedRibbonItem.groupIndex === gIdx);
        const groupBg = isGroupSelected 
            ? 'background: color-mix(in srgb, var(--ui-theme-color, #007670) 18%, ' + (isDark ? '#2a3744' : '#e6f4f2') + '); border: 1.5px solid var(--ui-theme-color, #007670);'
            : 'background: ' + (isDark ? '#262626' : '#f8fafc') + '; border: 1px solid var(--ui-border, #e2e8f0);';

        const toolsCount = g.tools ? g.tools.length : 0;
        const toolNamesSummary = g.tools ? g.tools.slice(0, 3).map(t => t.name).join(', ') + (g.tools.length > 3 ? '...' : '') : '';

        html += `
            <div style="margin-bottom: 5px; border-radius: 4px; overflow: hidden; ${groupBg}; transition: background 0.15s, border-color 0.15s;">
                <div onclick="window.selectRibbonCustomizeItem('group', ${gIdx}, -1)" 
                     style="padding: 6px 10px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-grip-vertical" style="font-size: 11px; opacity: 0.5;"></i>
                        <i class="fas fa-layer-group" style="font-size: 11px; color: var(--ui-theme-color, #007670);"></i>
                        <span style="font-size: 12px; font-weight: 600; color: var(--ui-text, #222);">${_optEscapeHtml(g.label)}</span>
                        <span style="font-size: 10px; opacity: 0.65;">(${toolsCount} tools)</span>
                    </div>
                    <span style="font-size: 10px; opacity: 0.55; max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${_optEscapeHtml(toolNamesSummary)}
                    </span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};

// Select item in customize list
window.selectRibbonCustomizeItem = function(type, groupIndex, toolIndex) {
    window._selectedRibbonItem.type = type;
    window._selectedRibbonItem.groupIndex = groupIndex;
    window._selectedRibbonItem.toolIndex = toolIndex;
    window.renderRibbonCustomizeList(window._selectedRibbonItem.tabKey);
};

// Move selected item (direction: -1 for left/up, +1 for right/down)
window.moveSelectedRibbonItem = function(direction) {
    const sel = window._selectedRibbonItem;
    const tabKey = sel.tabKey;
    const toolbar = document.getElementById('ribbon-' + tabKey);
    if (!toolbar) return;

    window._initDefaultRibbonOrder();
    const groups = Array.from(toolbar.querySelectorAll(':scope > .group'));
    const curIdx = sel.groupIndex;
    const targetIdx = curIdx + direction;
    if (targetIdx < 0 || targetIdx >= groups.length) return;

    const curEl = groups[curIdx];
    const targetEl = groups[targetIdx];

    if (direction < 0) {
        toolbar.insertBefore(curEl, targetEl);
    } else {
        toolbar.insertBefore(curEl, targetEl.nextSibling);
    }

    sel.groupIndex = targetIdx;
    window.saveRibbonCustomOrder();
    window.renderRibbonCustomizeList(tabKey);
};

// Save custom ribbon order to localStorage
window.saveRibbonCustomOrder = function() {
    try {
        const orderData = {};
        ['home', 'insert', 'design', 'review', 'view'].forEach(tabKey => {
            const toolbar = document.getElementById('ribbon-' + tabKey);
            if (!toolbar) return;
            const groups = Array.from(toolbar.querySelectorAll(':scope > .group'));
            orderData[tabKey] = groups.map(g => {
                const lbl = g.querySelector('.group-label');
                return lbl ? lbl.innerText.trim() : '';
            });
        });
        localStorage.setItem('opub_ribbon_custom_order', JSON.stringify(orderData));
    } catch(e) {
        console.warn('Failed to save ribbon order:', e);
    }
};

// Apply custom order from localStorage
window.applyRibbonCustomOrder = function() {
    try {
        window._initDefaultRibbonOrder();
        const raw = localStorage.getItem('opub_ribbon_custom_order');
        if (!raw) return;
        const orderData = JSON.parse(raw);

        Object.keys(orderData).forEach(tabKey => {
            const toolbar = document.getElementById('ribbon-' + tabKey);
            if (!toolbar) return;
            const savedLabels = orderData[tabKey];
            if (!Array.isArray(savedLabels) || savedLabels.length === 0) return;

            const currentGroups = Array.from(toolbar.querySelectorAll(':scope > .group'));
            const groupMap = new Map();
            currentGroups.forEach(g => {
                const lbl = g.querySelector('.group-label');
                const text = lbl ? lbl.innerText.trim() : '';
                if (text) groupMap.set(text, g);
            });

            savedLabels.forEach(label => {
                const g = groupMap.get(label);
                if (g) {
                    toolbar.appendChild(g);
                }
            });
        });
    } catch(e) {
        console.warn('Failed to apply custom ribbon order:', e);
    }
};

// Reset current tab ribbon order
window.resetCurrentTabRibbonOrder = function() {
    const tabKey = window._selectedRibbonItem.tabKey;
    const toolbar = document.getElementById('ribbon-' + tabKey);
    if (!toolbar) return;

    window._initDefaultRibbonOrder();
    if (window._defaultRibbonGroupsOrder && window._defaultRibbonGroupsOrder[tabKey]) {
        window._defaultRibbonGroupsOrder[tabKey].forEach(item => {
            if (item.element && item.element.parentNode === toolbar) {
                toolbar.appendChild(item.element);
            }
        });
    }

    window.saveRibbonCustomOrder();
    window.renderRibbonCustomizeList(tabKey);
};

// Reset entire ribbon to defaults
window.resetRibbonToDefaults = function() {
    localStorage.removeItem('opub_ribbon_custom_order');
    localStorage.removeItem('opub_hidden_ribbon_tabs');

    ['home', 'insert', 'design', 'review', 'view'].forEach(tabKey => {
        const toolbar = document.getElementById('ribbon-' + tabKey);
        if (toolbar && window._defaultRibbonGroupsOrder && window._defaultRibbonGroupsOrder[tabKey]) {
            window._defaultRibbonGroupsOrder[tabKey].forEach(item => {
                if (item.element) toolbar.appendChild(item.element);
            });
        }
        const cb = document.getElementById('opt-ribbon-' + tabKey);
        if (cb) cb.checked = true;
    });

    window.applyRibbonTabVisibility();
    window.renderRibbonCustomizeList(window._selectedRibbonItem.tabKey);

    const notice = document.getElementById('opt-ribbon-reset-notice');
    if (notice) {
        notice.style.display = 'inline';
        setTimeout(() => { if (notice) notice.style.display = 'none'; }, 2500);
    }
};

window.resetRibbonTabs = window.resetRibbonToDefaults;

// Switch between Options Modal tabs
window.switchOptionsTab = function(activeId) {
    const isDark = document.body.classList.contains('dark-mode');
    document.querySelectorAll('.opt-tab').forEach(el => {
        el.classList.remove('active');
        el.style.background = 'transparent';
        el.style.borderLeftColor = 'transparent';
        el.style.fontWeight = 'normal';
        el.style.color = isDark ? 'var(--ui-text, #ccc)' : '#444';
    });
    document.querySelectorAll('.opt-content').forEach(el => el.style.display = 'none');
    
    const activeTab = document.getElementById('opt-tab-' + activeId);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : '#f0f0f0';
        activeTab.style.borderLeftColor = 'var(--ui-theme-color)';
        activeTab.style.fontWeight = 'bold';
        activeTab.style.color = isDark ? 'var(--ui-text, #fff)' : '#111';
    }
    const activeContent = document.getElementById('opt-content-' + activeId);
    if (activeContent) {
        activeContent.style.display = 'block';
    }
    if (activeId === 'customize-ribbon') {
        setTimeout(() => {
            if (typeof window.renderRibbonCustomizeList === 'function') {
                window.renderRibbonCustomizeList();
            }
        }, 10);
    }
};

// Sub-views for Proofing Tab (AutoCorrect & Custom Dictionary)
window.showProofingMainView = function() {
    const mainView = document.getElementById('opt-proofing-main');
    const acView = document.getElementById('opt-proofing-autocorrect');
    const dictView = document.getElementById('opt-proofing-dict');
    if (mainView) mainView.style.display = 'block';
    if (acView) acView.style.display = 'none';
    if (dictView) dictView.style.display = 'none';
};

window.showAutoCorrectView = function() {
    const mainView = document.getElementById('opt-proofing-main');
    const acView = document.getElementById('opt-proofing-autocorrect');
    const dictView = document.getElementById('opt-proofing-dict');
    if (mainView) mainView.style.display = 'none';
    if (dictView) dictView.style.display = 'none';
    if (acView) {
        acView.style.display = 'block';
        window.renderAutoCorrectTable();
    }
};

window.renderAutoCorrectTable = function() {
    const container = document.getElementById('opt-ac-list');
    if (!container) return;
    const isDark = document.body.classList.contains('dark-mode');
    const borderCol = isDark ? 'var(--ui-border, #444)' : '#e2e8f0';
    const acMap = (window.SpellCheckEngine && window.SpellCheckEngine.getAutoCorrectMap)
        ? window.SpellCheckEngine.getAutoCorrectMap()
        : {};

    const keys = Object.keys(acMap).sort();
    if (keys.length === 0) {
        container.innerHTML = '<div style="padding:15px; text-align:center; opacity:0.6; font-size:12px;">No AutoCorrect rules active.</div>';
        return;
    }

    let rows = '';
    keys.forEach(k => {
        rows += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 12px; border-bottom:1px solid ${borderCol}; font-size:12px;">
                <span style="font-family:monospace; font-weight:600; width:90px;">${_optEscapeHtml(k)}</span>
                <span style="font-size:14px; flex-grow:1; text-align:center;">${_optEscapeHtml(acMap[k])}</span>
                <button type="button" class="btn-secondary" onclick="window.removeAutoCorrectItem('${_optEscapeJs(k)}')" style="padding:2px 7px; font-size:11px; color:#e74c3c; cursor:pointer;" title="Delete replacement"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
    });
    container.innerHTML = rows;
};

window.addAutoCorrectItem = function() {
    const shortcutInput = document.getElementById('opt-ac-new-key');
    const replInput = document.getElementById('opt-ac-new-val');
    if (!shortcutInput || !replInput) return;
    const shortcut = shortcutInput.value.trim();
    const repl = replInput.value.trim();
    if (!shortcut || !repl) return;

    if (window.SpellCheckEngine && window.SpellCheckEngine.addAutoCorrectRule) {
        window.SpellCheckEngine.addAutoCorrectRule(shortcut, repl);
    }
    shortcutInput.value = '';
    replInput.value = '';
    window.renderAutoCorrectTable();
};

window.removeAutoCorrectItem = function(shortcut) {
    if (window.SpellCheckEngine && window.SpellCheckEngine.removeAutoCorrectRule) {
        window.SpellCheckEngine.removeAutoCorrectRule(shortcut);
    }
    window.renderAutoCorrectTable();
};

window.resetAutoCorrectItems = function() {
    if (window.SpellCheckEngine && window.SpellCheckEngine.resetAutoCorrect) {
        window.SpellCheckEngine.resetAutoCorrect();
    }
    window.renderAutoCorrectTable();
};

window.showCustomDictView = function() {
    const mainView = document.getElementById('opt-proofing-main');
    const acView = document.getElementById('opt-proofing-autocorrect');
    const dictView = document.getElementById('opt-proofing-dict');
    if (mainView) mainView.style.display = 'none';
    if (acView) acView.style.display = 'none';
    if (dictView) {
        dictView.style.display = 'block';
        window.renderCustomDictList();
    }
};

window.renderCustomDictList = function() {
    const container = document.getElementById('opt-dict-list');
    if (!container) return;
    const isDark = document.body.classList.contains('dark-mode');
    const borderCol = isDark ? 'var(--ui-border, #444)' : '#e2e8f0';
    const words = (window.SpellCheckEngine && window.SpellCheckEngine.getCustomDictionary)
        ? window.SpellCheckEngine.getCustomDictionary()
        : [];

    if (words.length === 0) {
        container.innerHTML = '<div style="padding:15px; text-align:center; opacity:0.6; font-size:12px;">No custom words in your dictionary yet. Words you add from right-click proofing menus will show here.</div>';
        return;
    }

    let rows = '';
    words.forEach(w => {
        rows += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 12px; border-bottom:1px solid ${borderCol}; font-size:12px;">
                <span>${_optEscapeHtml(w)}</span>
                <button type="button" class="btn-secondary" onclick="window.removeCustomDictWord('${_optEscapeJs(w)}')" style="padding:2px 7px; font-size:11px; color:#e74c3c; cursor:pointer;" title="Remove from dictionary"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
    });
    container.innerHTML = rows;
};

window.addCustomDictWord = function() {
    const input = document.getElementById('opt-dict-new-word');
    if (!input) return;
    const word = input.value.trim();
    if (!word) return;

    if (window.SpellCheckEngine && window.SpellCheckEngine.addToDictionary) {
        window.SpellCheckEngine.addToDictionary(word);
    }
    input.value = '';
    window.renderCustomDictList();
};

window.removeCustomDictWord = function(word) {
    if (window.SpellCheckEngine && window.SpellCheckEngine.removeFromDictionary) {
        window.SpellCheckEngine.removeFromDictionary(word);
    }
    window.renderCustomDictList();
};

window.resetIgnoredRulesAction = function() {
    if (window.SpellCheckEngine && window.SpellCheckEngine.resetIgnoredRules) {
        window.SpellCheckEngine.resetIgnoredRules();
    }
    const notice = document.getElementById('opt-rules-reset-notice');
    if (notice) {
        notice.style.display = 'inline';
        setTimeout(() => { if (notice) notice.style.display = 'none'; }, 2500);
    }
};

// Global options saving logic
window.saveGlobalOptions = function(closeDialog = true) {
    // 1. General Tab Settings
    const cbStart = document.getElementById('opt-start-screen');
    if (cbStart) {
        localStorage.setItem('opub_show_start_screen', cbStart.checked ? 'true' : 'false');
    }

    const cbDarkMode = document.getElementById('opt-dark-mode');
    if (cbDarkMode) {
        const shouldBeDark = cbDarkMode.checked;
        if (shouldBeDark !== document.body.classList.contains('dark-mode')) {
            if (typeof toggleDarkMode === 'function') {
                toggleDarkMode();
            } else {
                document.body.classList.toggle('dark-mode', shouldBeDark);
                localStorage.setItem('opub_dark_mode', shouldBeDark ? 'true' : 'false');
            }
        }
    }

    const cbSnapGrid = document.getElementById('opt-snap-grid');
    if (cbSnapGrid) {
        localStorage.setItem('opub_snap_to_grid', cbSnapGrid.checked ? 'true' : 'false');
        if (typeof state !== 'undefined') state.snapToGrid = cbSnapGrid.checked;
    }

    const cbSnapGuides = document.getElementById('opt-snap-guides');
    if (cbSnapGuides) {
        localStorage.setItem('opub_snap_to_guides', cbSnapGuides.checked ? 'true' : 'false');
        if (typeof state !== 'undefined') state.snapToGuides = cbSnapGuides.checked;
    }

    const txtUser = document.getElementById('opt-username');
    if (txtUser) {
        localStorage.setItem('opub_username', txtUser.value.trim());
    }

    // 2. Proofing Tab Settings
    const cbSpell = document.getElementById('opt-spellcheck');
    if (cbSpell) {
        const isSpell = cbSpell.checked;
        localStorage.setItem('opub_spellcheck', isSpell ? 'true' : 'false');
        if (typeof state !== 'undefined') {
            state.spellCheck = isSpell;
            document.body.setAttribute('spellcheck', isSpell ? 'true' : 'false');
            const proofLang = localStorage.getItem('opub_proofing_lang') || navigator.language || 'en';
            document.querySelectorAll('.pub-element [contenteditable="true"], [contenteditable="true"]').forEach(el => {
                if (!el.classList.contains('wa-text')) {
                    el.setAttribute('spellcheck', isSpell ? 'true' : 'false');
                    if (isSpell) el.setAttribute('lang', proofLang);
                }
            });
        }
    }

    const cbGrammar = document.getElementById('opt-grammarcheck');
    if (cbGrammar) {
        const isGrammar = cbGrammar.checked;
        localStorage.setItem('opub_grammarcheck', isGrammar ? 'true' : 'false');
        if (typeof state !== 'undefined') {
            state.grammarCheck = isGrammar;
        }
        if (window.SpellCheckEngine && typeof window.SpellCheckEngine.setGrammarEnabled === 'function') {
            window.SpellCheckEngine.setGrammarEnabled(isGrammar);
        }
    }

    const cbUpper = document.getElementById('opt-ignore-uppercase');
    if (cbUpper) {
        localStorage.setItem('opub_ignore_uppercase', cbUpper.checked ? 'true' : 'false');
    }

    const cbNums = document.getElementById('opt-ignore-numbers');
    if (cbNums) {
        localStorage.setItem('opub_ignore_numbers', cbNums.checked ? 'true' : 'false');
    }

    if (window.SpellCheckEngine && typeof window.SpellCheckEngine.run === 'function') {
        window.SpellCheckEngine.run();
    }

    // 3. Save Tab Settings
    const cbAutoRecover = document.getElementById('opt-autorecover');
    if (cbAutoRecover) {
        localStorage.setItem('opub_autorecover_enabled', cbAutoRecover.checked ? 'true' : 'false');
    }
    const txtInterval = document.getElementById('opt-autorecover-interval');
    if (txtInterval) {
        const val = parseInt(txtInterval.value, 10);
        localStorage.setItem('opub_autorecover_interval', (!isNaN(val) && val > 0) ? String(val) : '10');
    }
    window.scheduleAutoRecover();

    const cbExitConfirm = document.getElementById('opt-confirm-exit');
    if (cbExitConfirm) {
        localStorage.setItem('opub_confirm_exit', cbExitConfirm.checked ? 'true' : 'false');
    }

    const cbSaveToast = document.getElementById('opt-save-toast');
    if (cbSaveToast) {
        localStorage.setItem('opub_save_toast', cbSaveToast.checked ? 'true' : 'false');
    }

    const txtFolder = document.getElementById('opt-save-folder');
    if (txtFolder) {
        localStorage.setItem('opub_save_folder', txtFolder.value.trim());
    }

    // 4. Language Tab Settings
    const selProofLang = document.getElementById('opt-proofing-lang');
    if (selProofLang) {
        const langVal = selProofLang.value;
        localStorage.setItem('opub_proofing_lang', langVal);
        document.querySelectorAll('.pub-element [contenteditable="true"], [contenteditable="true"]').forEach(el => {
            if (!el.classList.contains('wa-text')) {
                el.setAttribute('lang', langVal);
            }
        });
        if (window.SpellCheckEngine && typeof window.SpellCheckEngine.run === 'function') {
            window.SpellCheckEngine.run();
        }
    }

    // 5. Advanced Tab Settings
    const cbHyphen = document.getElementById('opt-autohyphenate');
    if (cbHyphen) {
        localStorage.setItem('opub_autoHyphenate', cbHyphen.checked ? 'true' : 'false');
    }

    const selUnit = document.getElementById('opt-ruler-unit');
    if (selUnit) {
        const unitVal = selUnit.value;
        localStorage.setItem('opub_ruler_unit', unitVal);
        if (typeof window.setRulerUnit === 'function') {
            window.setRulerUnit(unitVal);
        } else if (typeof state !== 'undefined') {
            state.rulerUnit = unitVal;
            state._userExplicitRulerUnit = true;
            if (typeof window.syncRulers === 'function') window.syncRulers();
        }
    }

    const cbRulers = document.getElementById('opt-show-rulers');
    if (cbRulers) {
        const c = document.getElementById('canvas-area');
        if (c) {
            const currentlyShown = c.style.gridTemplateColumns !== '0px 1fr';
            if (cbRulers.checked !== currentlyShown && typeof toggleRulers === 'function') {
                toggleRulers();
            }
        }
    }

    const cbBounds = document.getElementById('opt-show-bounds');
    if (cbBounds) {
        const paperEl = document.getElementById('paper');
        if (paperEl) {
            paperEl.classList.toggle('show-boundaries', cbBounds.checked);
        }
    }

    const cbScratch = document.getElementById('opt-show-scratchpad');
    if (cbScratch) {
        const isHidden = !cbScratch.checked;
        document.body.classList.toggle('hide-scratch-area', isHidden);
        const btn = document.getElementById('scratch-area-toggle-btn');
        if (btn) {
            if (isHidden) {
                btn.classList.remove('active-tool');
                btn.innerHTML = '<i class="far fa-square"></i>Scratch Area';
            } else {
                btn.classList.add('active-tool');
                btn.innerHTML = '<i class="fas fa-check-square"></i>Scratch Area';
            }
        }
    }

    // 6. Customize Ribbon Tab Settings
    const hiddenTabs = [];
    ['insert', 'design', 'review', 'view'].forEach(tabKey => {
        const cb = document.getElementById('opt-ribbon-' + tabKey);
        if (cb && !cb.checked) {
            hiddenTabs.push(tabKey);
        }
    });
    localStorage.setItem('opub_hidden_ribbon_tabs', JSON.stringify(hiddenTabs));
    window.applyRibbonTabVisibility();

    // 7. Trust Center Tab Settings
    const cbOnlineProof = document.getElementById('opt-online-proofing');
    if (cbOnlineProof) {
        localStorage.setItem('opub_online_proofing_enabled', cbOnlineProof.checked ? 'true' : 'false');
    }

    const cbCrashDumps = document.getElementById('opt-crash-dumps');
    if (cbCrashDumps) {
        localStorage.setItem('opub_crash_dumps_enabled', cbCrashDumps.checked ? 'true' : 'false');
    }

    // Dialog close or Apply feedback
    if (closeDialog) {
        if (typeof DialogSystem !== 'undefined') DialogSystem.close();
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

// Render and show the Options Modal
window.showOptionsModal = function() {
    const isDark = document.body.classList.contains('dark-mode');
    const autoHyphenate = localStorage.getItem('opub_autoHyphenate') === 'true';
    const username = localStorage.getItem('opub_username') || 'Publisher User';
    const spellcheck = localStorage.getItem('opub_spellcheck') !== 'false';
    const grammarcheck = (typeof state !== 'undefined' && state.grammarCheck !== undefined)
        ? !!state.grammarCheck
        : (localStorage.getItem('opub_grammarcheck') !== 'false');
    const ignoreUppercase = localStorage.getItem('opub_ignore_uppercase') !== 'false';
    const ignoreNumbers = localStorage.getItem('opub_ignore_numbers') !== 'false';
    const showStartScreen = localStorage.getItem('opub_show_start_screen') !== 'false';
    const snapToGrid = localStorage.getItem('opub_snap_to_grid') === 'true' || (typeof state !== 'undefined' && state.snapToGrid);
    const snapToGuides = localStorage.getItem('opub_snap_to_guides') !== 'false';
    const autorecoverEnabled = localStorage.getItem('opub_autorecover_enabled') !== 'false';
    const autorecoverInterval = localStorage.getItem('opub_autorecover_interval') || '10';
    const confirmExit = localStorage.getItem('opub_confirm_exit') !== 'false';
    const saveToast = localStorage.getItem('opub_save_toast') !== 'false';
    const saveFolder = localStorage.getItem('opub_save_folder') || 'Documents\\OpenPublisher';
    const currentUnit = (typeof state !== 'undefined' && state.rulerUnit) || localStorage.getItem('opub_ruler_unit') || 'cm';
    const proofingLang = localStorage.getItem('opub_proofing_lang') || 'en-US';
    const onlineProofing = localStorage.getItem('opub_online_proofing_enabled') !== 'false';
    const crashDumps = localStorage.getItem('opub_crash_dumps_enabled') !== 'false';

    const canvasArea = document.getElementById('canvas-area');
    const rulersShown = canvasArea ? (canvasArea.style.gridTemplateColumns !== '0px 1fr') : true;
    const paperEl = document.getElementById('paper');
    const boundsShown = paperEl ? paperEl.classList.contains('show-boundaries') : false;
    const scratchShown = !document.body.classList.contains('hide-scratch-area');

    let hiddenRibbonTabs = [];
    try {
        const rawHidden = localStorage.getItem('opub_hidden_ribbon_tabs');
        if (rawHidden) hiddenRibbonTabs = JSON.parse(rawHidden);
    } catch(e) {}

    const tabs = ['General', 'Proofing', 'Save', 'Language', 'Advanced', 'Customize Ribbon', 'Trust Center'];

    let tabsHtml = '';
    let contentsHtml = '';

    const labelStyle = "display: flex; align-items: center; margin-top: 10px; cursor: pointer; user-select: none;";
    const checkboxStyle = "accent-color: var(--ui-theme-color, #007670); margin-right: 10px; cursor: pointer;";
    const subtextStyle = "font-size: 11px; opacity: 0.75; margin-left: 23px; margin-top: 3px; line-height: 1.3;";
    const sectionHeadingStyle = "display: block; font-weight: 600; margin-bottom: 8px; font-size: 13px;";
    const dividerStyle = "border: 0; border-top: 1px solid var(--ui-border, #eee); margin: 18px 0;";

    tabs.forEach((tab) => {
        const id = tab.toLowerCase().replace(' ', '-');
        const isActive = tab === 'General';

        tabsHtml += `
            <div id="opt-tab-${id}" class="opt-tab ${isActive ? 'active' : ''}" onclick="switchOptionsTab('${id}')" 
                 onmouseover="if(!this.classList.contains('active')) this.style.background = document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.05)' : '#f9f9f9'" 
                 onmouseout="if(!this.classList.contains('active')) this.style.background = 'transparent'"
                 style="padding: 10px 15px; cursor: pointer; border-left: 3px solid ${isActive ? 'var(--ui-theme-color)' : 'transparent'}; 
                 color: ${isActive ? (isDark ? 'var(--ui-text, #fff)' : '#111') : (isDark ? 'var(--ui-text, #ccc)' : '#444')}; 
                 background: ${isActive ? (isDark ? 'rgba(255, 255, 255, 0.08)' : '#f0f0f0') : 'transparent'}; 
                 font-weight: ${isActive ? 'bold' : 'normal'}; transition: background 0.15s, border-color 0.15s;">
                ${tab}
            </div>
        `;

        let tabContent = '';
        if (tab === 'General') {
            tabContent = `
                <strong style="${sectionHeadingStyle}">User Interface options</strong>
                <label style="${labelStyle}">
                    <input type="checkbox" id="opt-start-screen" ${showStartScreen ? 'checked' : ''} style="${checkboxStyle}">
                    Show the Start screen when this application starts
                </label>
                <p style="${subtextStyle}">When enabled, Open Publisher presents the Dashboard and template chooser upon launch.</p>

                <label style="${labelStyle}">
                    <input type="checkbox" id="opt-dark-mode" ${isDark ? 'checked' : ''} style="${checkboxStyle}">
                    Enable Dark Mode appearance
                </label>
                <p style="${subtextStyle}">Switches between classic office light theme and sleek high-contrast dark theme.</p>

                <hr style="${dividerStyle}">
                <strong style="${sectionHeadingStyle}">Snapping and Guides</strong>
                <label style="${labelStyle}">
                    <input type="checkbox" id="opt-snap-grid" ${snapToGrid ? 'checked' : ''} style="${checkboxStyle}">
                    Snap objects to grid by default
                </label>
                <label style="${labelStyle}">
                    <input type="checkbox" id="opt-snap-guides" ${snapToGuides ? 'checked' : ''} style="${checkboxStyle}">
                    Snap objects to guidelines and neighbor elements
                </label>

                <hr style="${dividerStyle}">
                <strong style="${sectionHeadingStyle}">Personalize your copy of Publisher</strong>
                <div style="margin-top: 10px; display: flex; align-items: center;">
                    <span style="margin-right: 15px; width: 100px;">User name:</span>
                    <input type="text" id="opt-username" value="${_optEscapeHtml(username)}" style="padding: 5px 8px; border: 1px solid var(--ui-border, #ccc); border-radius: 4px; width: 220px; background: var(--ui-panel-bg, #fff); color: var(--ui-text, #222);">
                </div>
                <div style="margin-top: 12px; display: flex; align-items: center;">
                    <span style="margin-right: 15px; width: 100px;">UI Theme:</span>
                    <div class="modern-select" onclick="toggleThemeDropdown(this); event.stopPropagation();" style="width: 220px; height: 26px;">
                        <span id="opt-theme">${_optEscapeHtml(localStorage.getItem('opub_ui_theme') || 'Publisher / Classic (Teal)')}</span>
                        <div class="arrow-box"><i class="fas fa-chevron-down" style="font-size:10px;"></i></div>
                    </div>
                </div>
            `;
        } else if (tab === 'Proofing') {
            tabContent = `
                <div id="opt-proofing-main">
                    <strong style="${sectionHeadingStyle}">When correcting spelling and grammar in Publisher</strong>
                    <label style="${labelStyle}">
                        <input type="checkbox" id="opt-spellcheck" ${spellcheck ? 'checked' : ''} style="${checkboxStyle}">
                        Check spelling as you type
                    </label>
                    <p style="${subtextStyle}">Flags unrecognized vocabulary with red squiggly underlines.</p>

                    <label style="${labelStyle}">
                        <input type="checkbox" id="opt-grammarcheck" ${grammarcheck ? 'checked' : ''} style="${checkboxStyle}">
                        Mark grammar errors as you type
                    </label>
                    <p style="${subtextStyle}">Highlights grammatical, phrasing, and style errors with wavy green underlines.</p>

                    <label style="${labelStyle}">
                        <input type="checkbox" id="opt-ignore-uppercase" ${ignoreUppercase ? 'checked' : ''} style="${checkboxStyle}">
                        Ignore words in UPPERCASE (acronyms like PDF, PNG, SVG)
                    </label>

                    <label style="${labelStyle}">
                        <input type="checkbox" id="opt-ignore-numbers" ${ignoreNumbers ? 'checked' : ''} style="${checkboxStyle}">
                        Ignore words that contain numbers (like Model4, A4)
                    </label>

                    <hr style="${dividerStyle}">
                    <strong style="${sectionHeadingStyle}">AutoCorrect and Custom Dictionaries</strong>
                    <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
                        <button type="button" class="btn-secondary" onclick="window.showAutoCorrectView()" style="padding: 6px 12px; font-size: 12px; cursor: pointer;">
                            <i class="fas fa-magic" style="margin-right: 6px; color: var(--ui-theme-color);"></i>AutoCorrect Options...
                        </button>
                        <button type="button" class="btn-secondary" onclick="window.showCustomDictView()" style="padding: 6px 12px; font-size: 12px; cursor: pointer;">
                            <i class="fas fa-book" style="margin-right: 6px; color: var(--ui-theme-color);"></i>Custom Dictionary...
                        </button>
                        <button type="button" class="btn-secondary" onclick="window.resetIgnoredRulesAction()" style="padding: 6px 12px; font-size: 12px; cursor: pointer;">
                            <i class="fas fa-redo" style="margin-right: 6px;"></i>Reset Ignored Rules
                        </button>
                    </div>
                    <span id="opt-rules-reset-notice" style="display: none; color: #27ae60; font-size: 12px; margin-top: 8px; font-weight: 500;">
                        <i class="fas fa-check-circle"></i> Ignored rules and skipped words cleared!
                    </span>
                </div>

                <div id="opt-proofing-autocorrect" style="display: none;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <strong style="font-size: 14px;">AutoCorrect Substitutions</strong>
                        <button type="button" class="btn-secondary" onclick="window.showProofingMainView()" style="padding: 3px 8px; font-size: 11px;">
                            <i class="fas fa-arrow-left" style="margin-right: 5px;"></i>Back to Proofing
                        </button>
                    </div>
                    <p style="font-size: 11px; opacity: 0.75; margin-top: 0; margin-bottom: 10px;">Automatically replaces symbol sequences and punctuation as you type (e.g. typing (c) produces ©).</p>
                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px; background: var(--ui-panel-bg, #f5f5f5); padding: 8px; border-radius: 4px; border: 1px solid var(--ui-border, #ddd);">
                        <span style="font-size: 12px;">Replace:</span>
                        <input type="text" id="opt-ac-new-key" placeholder="(c)" style="width: 70px; padding: 4px; font-size: 12px; border: 1px solid var(--ui-border, #ccc); border-radius: 3px; background: var(--ui-bg, #fff); color: var(--ui-text, #222);">
                        <span style="font-size: 12px;">With:</span>
                        <input type="text" id="opt-ac-new-val" placeholder="©" style="width: 70px; padding: 4px; font-size: 12px; border: 1px solid var(--ui-border, #ccc); border-radius: 3px; background: var(--ui-bg, #fff); color: var(--ui-text, #222);">
                        <button type="button" class="btn-primary" onclick="window.addAutoCorrectItem()" style="padding: 4px 10px; font-size: 12px;">Add</button>
                    </div>
                    <div id="opt-ac-list" style="max-height: 160px; overflow-y: auto; border: 1px solid var(--ui-border, #ccc); border-radius: 4px; background: var(--ui-bg, #fff);"></div>
                    <div style="margin-top: 8px; text-align: right;">
                        <button type="button" class="btn-secondary" onclick="window.resetAutoCorrectItems()" style="padding: 3px 8px; font-size: 11px;">Reset to Defaults</button>
                    </div>
                </div>

                <div id="opt-proofing-dict" style="display: none;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <strong style="font-size: 14px;">Custom Dictionary Words</strong>
                        <button type="button" class="btn-secondary" onclick="window.showProofingMainView()" style="padding: 3px 8px; font-size: 11px;">
                            <i class="fas fa-arrow-left" style="margin-right: 5px;"></i>Back to Proofing
                        </button>
                    </div>
                    <p style="font-size: 11px; opacity: 0.75; margin-top: 0; margin-bottom: 10px;">Words stored in your personal dictionary are never flagged as spelling errors.</p>
                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px; background: var(--ui-panel-bg, #f5f5f5); padding: 8px; border-radius: 4px; border: 1px solid var(--ui-border, #ddd);">
                        <input type="text" id="opt-dict-new-word" placeholder="Add custom word..." style="flex-grow: 1; padding: 4px 8px; font-size: 12px; border: 1px solid var(--ui-border, #ccc); border-radius: 3px; background: var(--ui-bg, #fff); color: var(--ui-text, #222);">
                        <button type="button" class="btn-primary" onclick="window.addCustomDictWord()" style="padding: 4px 12px; font-size: 12px;">Add Word</button>
                    </div>
                    <div id="opt-dict-list" style="max-height: 160px; overflow-y: auto; border: 1px solid var(--ui-border, #ccc); border-radius: 4px; background: var(--ui-bg, #fff);"></div>
                </div>
            `;
        } else if (tab === 'Save') {
            const isDesktop = (typeof window.isDesktopApp === 'function' && window.isDesktopApp());
            if (isDesktop) {
                tabContent = `
                    <div style="display: flex; align-items: flex-start; gap: 12px; background: rgba(0, 118, 112, 0.08); border: 1px solid var(--ui-theme-color); border-radius: 6px; padding: 12px 14px; margin-bottom: 16px;">
                        <i class="fas fa-desktop" style="color: var(--ui-theme-color); font-size: 20px; margin-top: 2px;"></i>
                        <div>
                            <strong style="display: block; font-size: 13px; margin-bottom: 3px;">Desktop Application Mode (Installed App)</strong>
                            <p style="font-size: 11px; opacity: 0.85; margin: 0; line-height: 1.4;">
                                You are running Open Publisher as an installed native application. Automatic background recovery, disk backups, exit confirmation, and save notifications are managed natively by the desktop shell to prevent duplicate prompts and double notifications.
                            </p>
                        </div>
                    </div>

                    <strong style="${sectionHeadingStyle}">Desktop File Management</strong>
                    <label style="${labelStyle}; opacity: 0.85; cursor: default;">
                        <input type="checkbox" checked disabled style="margin-right: 10px;">
                        Native Auto-Recovery and Disk Backups (Managed by Desktop Shell)
                    </label>
                    <p style="${subtextStyle}">Automated background snapshots and previous versions are saved to your local user storage.</p>

                    <label style="${labelStyle}; opacity: 0.85; cursor: default;">
                        <input type="checkbox" checked disabled style="margin-right: 10px;">
                        Smart Exit Confirmation Dialog (Managed by Desktop Shell)
                    </label>
                    <p style="${subtextStyle}">The native window close handler prompts before quitting if changes are unsaved, preventing duplicate browser alerts.</p>

                    <label style="${labelStyle}; opacity: 0.85; cursor: default;">
                        <input type="checkbox" checked disabled style="margin-right: 10px;">
                        Desktop Toast Notifications (Managed by Desktop Shell)
                    </label>
                    <p style="${subtextStyle}">Native system notifications confirm successful saves without duplicate web banners.</p>
                `;
            } else {
                tabContent = `
                    <strong style="${sectionHeadingStyle}">Save documents</strong>
                    <label style="${labelStyle}">
                        <input type="checkbox" id="opt-autorecover" ${autorecoverEnabled ? 'checked' : ''} style="${checkboxStyle}">
                        Save AutoRecover information every 
                        <input type="number" id="opt-autorecover-interval" min="1" max="120" value="${_optEscapeHtml(autorecoverInterval)}" style="width: 45px; margin: 0 6px; padding: 2px 4px; border: 1px solid var(--ui-border, #ccc); border-radius: 3px; background: var(--ui-bg, #fff); color: var(--ui-text, #222); text-align: center;"> 
                        minutes
                    </label>
                    <p style="${subtextStyle}">Automatically saves background publication snapshots to localStorage for disaster recovery.</p>

                    <label style="${labelStyle}">
                        <input type="checkbox" id="opt-confirm-exit" ${confirmExit ? 'checked' : ''} style="${checkboxStyle}">
                        Prompt before closing application if publication has unsaved changes
                    </label>

                    <label style="${labelStyle}">
                        <input type="checkbox" id="opt-save-toast" ${saveToast ? 'checked' : ''} style="${checkboxStyle}">
                        Show notification banner when document is saved successfully
                    </label>

                    <hr style="${dividerStyle}">
                    <strong style="${sectionHeadingStyle}">Default file locations</strong>
                    <div style="margin-top: 10px;">
                        <span style="display: block; margin-bottom: 5px; font-size: 12px;">Default local publication directory:</span>
                        <input type="text" id="opt-save-folder" value="${_optEscapeHtml(saveFolder)}" style="padding: 5px 8px; border: 1px solid var(--ui-border, #ccc); border-radius: 4px; width: 100%; max-width: 340px; background: var(--ui-panel-bg, #fff); color: var(--ui-text, #222);">
                    </div>
                `;
            }
        } else if (tab === 'Language') {
            tabContent = `
                <strong style="${sectionHeadingStyle}">Office proofing and display language</strong>
                <p style="font-size: 12px; opacity: 0.75; margin-top: 0; margin-bottom: 12px;">Set the proofing dictionary language used for spell check and grammar verification.</p>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 12px; width: 120px;">Proofing language:</span>
                    <select id="opt-proofing-lang" style="padding: 6px 10px; border: 1px solid var(--ui-border, #ccc); border-radius: 4px; width: 240px; background: var(--ui-panel-bg, #fff); color: var(--ui-text, #222); cursor: pointer;">
                        <option value="en-US" ${proofingLang === 'en-US' ? 'selected' : ''}>English (United States)</option>
                        <option value="en-GB" ${proofingLang === 'en-GB' ? 'selected' : ''}>English (United Kingdom)</option>
                        <option value="es" ${proofingLang === 'es' ? 'selected' : ''}>Español (Spanish)</option>
                        <option value="fr" ${proofingLang === 'fr' ? 'selected' : ''}>Français (French)</option>
                        <option value="de" ${proofingLang === 'de' ? 'selected' : ''}>Deutsch (German)</option>
                        <option value="pt" ${proofingLang === 'pt' ? 'selected' : ''}>Português (Portuguese)</option>
                        <option value="it" ${proofingLang === 'it' ? 'selected' : ''}>Italiano (Italian)</option>
                    </select>
                </div>
                <p style="${subtextStyle}; margin-left: 0; margin-top: 15px;">Proofing suggestions and grammar rules will automatically calibrate to the selected dialect.</p>
            `;
        } else if (tab === 'Advanced') {
            tabContent = `
                <strong style="${sectionHeadingStyle}">Text Formatting</strong>
                <label style="${labelStyle}">
                    <input type="checkbox" id="opt-autohyphenate" ${autoHyphenate ? 'checked' : ''} style="${checkboxStyle}">
                    Automatically hyphenate in new text boxes
                </label>
                <p style="${subtextStyle}">Applies automated word hyphenation across newsletter columns and layout blocks.</p>

                <hr style="${dividerStyle}">
                <strong style="${sectionHeadingStyle}">Display and Measurement Units</strong>
                <div style="margin-top: 10px; display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 12px;">Show measurements in units of:</span>
                    <select id="opt-ruler-unit" style="padding: 5px 8px; border: 1px solid var(--ui-border, #ccc); border-radius: 4px; background: var(--ui-panel-bg, #fff); color: var(--ui-text, #222); cursor: pointer;">
                        <option value="cm" ${currentUnit === 'cm' ? 'selected' : ''}>Centimeters (cm)</option>
                        <option value="in" ${currentUnit === 'in' ? 'selected' : ''}>Inches (in)</option>
                        <option value="mm" ${currentUnit === 'mm' ? 'selected' : ''}>Millimeters (mm)</option>
                        <option value="px" ${currentUnit === 'px' ? 'selected' : ''}>Pixels (px)</option>
                    </select>
                </div>

                <label style="${labelStyle}">
                    <input type="checkbox" id="opt-show-rulers" ${rulersShown ? 'checked' : ''} style="${checkboxStyle}">
                    Show horizontal and vertical canvas rulers
                </label>

                <label style="${labelStyle}">
                    <input type="checkbox" id="opt-show-bounds" ${boundsShown ? 'checked' : ''} style="${checkboxStyle}">
                    Show margin boundary guide lines on canvas pages
                </label>

                <label style="${labelStyle}">
                    <input type="checkbox" id="opt-show-scratchpad" ${scratchShown ? 'checked' : ''} style="${checkboxStyle}">
                    Show scratchpad work area surrounding canvas pages
                </label>
            `;
        } else if (tab === 'Customize Ribbon') {
            const isInsertVisible = !hiddenRibbonTabs.includes('insert');
            const isDesignVisible = !hiddenRibbonTabs.includes('design');
            const isReviewVisible = !hiddenRibbonTabs.includes('review');
            const isViewVisible = !hiddenRibbonTabs.includes('view');

            tabContent = `
                <strong style="${sectionHeadingStyle}">Customize Ribbon</strong>
                <p style="font-size: 12px; opacity: 0.75; margin-top: 0; margin-bottom: 12px;">Re-arrange where button groups and tools are positioned on each ribbon tab.</p>

                <!-- Tab Selector and Tab Reset -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 12px; font-weight: 600;">Tab to Customize:</span>
                        <select id="opt-ribbon-tab-select" onchange="window.renderRibbonCustomizeList(this.value)" style="padding: 4px 8px; border: 1px solid var(--ui-border, #ccc); border-radius: 4px; background: var(--ui-panel-bg, #fff); color: var(--ui-text, #222); font-weight: 500; cursor: pointer;">
                            <option value="home">Home</option>
                            <option value="insert">Insert</option>
                            <option value="design">Page Design</option>
                            <option value="review">Review</option>
                            <option value="view">View</option>
                        </select>
                    </div>
                    <button type="button" class="btn-secondary" onclick="window.resetCurrentTabRibbonOrder()" style="padding: 3px 9px; font-size: 11px; cursor: pointer;">
                        <i class="fas fa-undo" style="margin-right: 4px;"></i>Reset Tab Order
                    </button>
                </div>

                <!-- Reorder List and Move Up / Down Buttons (Teal Green Theme!) -->
                <div style="display: flex; gap: 10px; align-items: stretch; margin-bottom: 8px;">
                    <div id="opt-ribbon-items-container" style="flex: 1; height: 125px; border: 1px solid var(--ui-border, #ccc); border-radius: 4px; background: var(--ui-panel-bg, #fff); overflow-y: auto; padding: 5px; box-sizing: border-box;">
                        <!-- Populated dynamically by window.renderRibbonCustomizeList -->
                    </div>
                    
                    <div style="display: flex; flex-direction: column; justify-content: center; gap: 6px; width: 115px; flex-shrink: 0;">
                        <button type="button" id="opt-ribbon-btn-up" onclick="window.moveSelectedRibbonItem(-1)" style="padding: 6px 10px; background: var(--ui-theme-color, #007670); color: #ffffff; border: none; border-radius: 4px; font-size: 11.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: 0.15s;">
                            <i class="fas fa-arrow-up" style="color: #ffffff;"></i> Move Up
                        </button>
                        <button type="button" id="opt-ribbon-btn-down" onclick="window.moveSelectedRibbonItem(1)" style="padding: 6px 10px; background: var(--ui-theme-color, #007670); color: #ffffff; border: none; border-radius: 4px; font-size: 11.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: 0.15s;">
                            <i class="fas fa-arrow-down" style="color: #ffffff;"></i> Move Down
                        </button>
                        <div style="font-size: 9.5px; opacity: 0.7; text-align: center; line-height: 1.25; margin-top: 1px;">
                            Move Up = Left<br>Move Down = Right
                        </div>
                    </div>
                </div>

                <!-- Tab Visibility Checkboxes (Teal Green Theme!) -->
                <hr style="${dividerStyle}; margin: 8px 0;">
                <strong style="${sectionHeadingStyle}; margin-bottom: 5px; font-size: 11.5px;">Ribbon Tab Display (Show / Hide Tabs):</strong>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; background: var(--ui-panel-bg, #fafafa); border: 1px solid var(--ui-border, #ddd); border-radius: 4px; padding: 6px 10px;">
                    <label style="display: flex; align-items: center; font-size: 12px; opacity: 0.6; cursor: not-allowed; user-select: none;">
                        <input type="checkbox" checked disabled style="${checkboxStyle}; margin-right: 6px; cursor: not-allowed;">
                        Home (Essential)
                    </label>
                    <label style="display: flex; align-items: center; font-size: 12px; cursor: pointer; user-select: none;">
                        <input type="checkbox" id="opt-ribbon-insert" ${isInsertVisible ? 'checked' : ''} style="${checkboxStyle}; margin-right: 6px;">
                        Insert
                    </label>
                    <label style="display: flex; align-items: center; font-size: 12px; cursor: pointer; user-select: none;">
                        <input type="checkbox" id="opt-ribbon-design" ${isDesignVisible ? 'checked' : ''} style="${checkboxStyle}; margin-right: 6px;">
                        Page Design
                    </label>
                    <label style="display: flex; align-items: center; font-size: 12px; cursor: pointer; user-select: none;">
                        <input type="checkbox" id="opt-ribbon-review" ${isReviewVisible ? 'checked' : ''} style="${checkboxStyle}; margin-right: 6px;">
                        Review
                    </label>
                    <label style="display: flex; align-items: center; font-size: 12px; cursor: pointer; user-select: none;">
                        <input type="checkbox" id="opt-ribbon-view" ${isViewVisible ? 'checked' : ''} style="${checkboxStyle}; margin-right: 6px;">
                        View
                    </label>
                </div>

                <div style="margin-top: 10px; display: flex; align-items: center; gap: 12px;">
                    <button type="button" class="btn-secondary" onclick="window.resetRibbonToDefaults()" style="padding: 5px 12px; font-size: 12px; cursor: pointer;">
                        Reset Entire Ribbon to Factory Defaults
                    </button>
                    <span id="opt-ribbon-reset-notice" style="display: none; color: #27ae60; font-size: 12px; font-weight: 500;">
                        <i class="fas fa-check-circle"></i> Ribbon reset to defaults!
                    </span>
                </div>
            `;
        } else if (tab === 'Trust Center') {
            tabContent = `
                <strong style="${sectionHeadingStyle}">Protecting your privacy and document security</strong>
                <p style="font-size: 12px; opacity: 0.75; margin-top: 0; margin-bottom: 15px;">Trust Center provides settings to keep your publications and data safe and confidential.</p>

                <strong style="${sectionHeadingStyle}">Publication Encryption</strong>
                <p style="font-size: 12px; opacity: 0.75; margin-top: 0; margin-bottom: 10px;">Lock and decrypt this publication using military-grade AES-GCM 256-bit encryption.</p>
                <button type="button" class="btn-secondary" onclick="if(window.showProtectDocumentModal) window.showProtectDocumentModal();" style="padding: 6px 14px; font-size: 12px; cursor: pointer; margin-bottom: 15px;">
                    <i class="fas fa-lock" style="margin-right: 6px; color: var(--ui-theme-color);"></i>Document Password & Protection...
                </button>

                <hr style="${dividerStyle}">
                <strong style="${sectionHeadingStyle}">Privacy and Cloud Services</strong>
                <label style="${labelStyle}">
                    <input type="checkbox" id="opt-online-proofing" ${onlineProofing ? 'checked' : ''} style="${checkboxStyle}">
                    Enable LanguageTool cloud proofing for advanced grammar & style suggestions
                </label>
                <p style="${subtextStyle}">When unchecked, Open Publisher operates strictly offline, evaluating spelling exclusively through local dictionaries.</p>

                <label style="${labelStyle}">
                    <input type="checkbox" id="opt-crash-dumps" ${crashDumps ? 'checked' : ''} style="${checkboxStyle}">
                    Generate local diagnostic error dumps during unexpected issues
                </label>
                <p style="${subtextStyle}">Helps diagnose layout errors and recover content if a crash occurs.</p>
            `;
        }

        contentsHtml += `
            <div id="opt-content-${id}" class="opt-content" style="display: ${isActive ? 'block' : 'none'};">
                <h3 style="margin-top: 0; margin-bottom: 20px; font-size: 18px; font-weight: 600;">${tab}</h3>
                ${tabContent}
            </div>
        `;
    });

    const html = `
    <div style="font-family: 'Inter', system-ui, sans-serif; display: flex; height: 420px; width: 680px; box-sizing: border-box;">
        <div style="width: 175px; border-right: 1px solid var(--ui-border, #ddd); padding: 12px 0; overflow-y: auto; flex-shrink: 0;">
            ${tabsHtml}
        </div>
        <div id="opt-main-panel" style="flex-grow: 1; padding: 18px 24px; overflow-y: auto;">
            ${contentsHtml}
        </div>
    </div>
    `;

    DialogSystem.show('Options', html, () => {
        saveGlobalOptions(true);
    }, false, 'OK', () => {
        saveGlobalOptions(false);
    });

    setTimeout(() => {
        if (typeof window.renderRibbonCustomizeList === 'function') {
            window.renderRibbonCustomizeList('home');
        }
    }, 50);
};
