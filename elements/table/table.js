function initTablePicker() {
    const grid = document.getElementById('table-picker-grid');
    const label = document.getElementById('table-grid-label');
    
    // Generate 10x10 Grid
    for(let r=1; r<=10; r++) {
        for(let c=1; c<=10; c++) {
            const cell = document.createElement('div');
            cell.style.width = '18px';
            cell.style.height = '18px';
            cell.style.border = '1px solid var(--ui-border)';
            cell.style.backgroundColor = 'var(--ui-bg)';
            cell.style.cursor = 'pointer';
            cell.dataset.r = r;
            cell.dataset.c = c;
            
            cell.onmouseover = () => {
                label.innerText = `${c} x ${r} Table`;
                Array.from(grid.children).forEach(child => {
                    const cr = parseInt(child.dataset.r);
                    const cc = parseInt(child.dataset.c);
                    if(cr <= r && cc <= c) {
                        child.style.backgroundColor = 'color-mix(in srgb, var(--ui-theme-color) 30%, transparent)';
                        child.style.borderColor = 'var(--ui-theme-color)';
                    } else {
                        child.style.backgroundColor = 'var(--ui-bg)';
                        child.style.borderColor = 'var(--ui-border)';
                    }
                });
            };
            
            cell.onclick = () => {
                insertTable(r, c);
                document.getElementById('table-dropdown').style.display = 'none';
            };
            
            grid.appendChild(cell);
        }
    }
}

function toggleTableMenu(btn, e) {
    const m = document.getElementById('table-dropdown');
    const isBlock = m.style.display === 'block';
    document.querySelectorAll('.dropdown-menu').forEach(d => { if(d!==m) d.style.display = 'none'; });
    if (!isBlock) {
        m.style.display = 'block';
        if (btn) {
            const r = btn.getBoundingClientRect();
            if (r.left + m.offsetWidth > window.innerWidth) m.style.left = (r.right - m.offsetWidth) + 'px';
            else m.style.left = r.left + 'px';
            m.style.top = (r.bottom+5) + 'px';
        } else if (e) {
            if (e.clientX + m.offsetWidth > window.innerWidth) m.style.left = (window.innerWidth - m.offsetWidth - 10) + 'px';
            else m.style.left = e.clientX + 'px';
            m.style.top = e.clientY + 'px';
        }
    } else {
        m.style.display = 'none';
    }
}

function promptCustomTable() {
    document.getElementById('table-dropdown').style.display = 'none';
    
    const formHtml = `
        <div class="input-group" style="margin-bottom:10px;">
            <label>Columns:</label>
            <input type="number" id="dialog-cols" value="5" min="1" max="20">
        </div>
        <div class="input-group">
            <label>Rows:</label>
            <input type="number" id="dialog-rows" value="5" min="1" max="50">
        </div>
    `;

    DialogSystem.show('Insert Custom Table', formHtml, () => {
        const cols = parseInt(document.getElementById('dialog-cols').value);
        const rows = parseInt(document.getElementById('dialog-rows').value);
        
        if(!isNaN(cols) && cols > 0 && !isNaN(rows) && rows > 0) {
            insertTable(rows, cols);
        }
    });
}

function insertTable(rows, cols) {
    let html = '<table style="width:100%; height:100%; border-spacing:0; table-layout:fixed; border-collapse:separate; border-top:1px solid #000; border-left:1px solid #000;">';
    for(let i=0; i<rows; i++) {
        html += '<tr>';
        for(let j=0; j<cols; j++) {
            html += '<td style="border-right:1px solid #000; border-bottom:1px solid #000; border-top:none; border-left:none; min-width:20px; height:20px; outline:none;" contenteditable="true">&nbsp;</td>';
        }
        html += '</tr>';
    }
    html += '</table>';
    const el = createWrapper(html);
    el.setAttribute('data-type', 'table');
    
    const tbl = el.querySelector('table');
    if (tbl) {
        const clone = tbl.cloneNode(true);
        clone.style.position = 'absolute'; clone.style.visibility = 'hidden';
        clone.style.width = 'max-content'; clone.style.height = 'max-content';
        clone.style.maxWidth = 'none'; clone.style.maxHeight = 'none';
        document.body.appendChild(clone);
        
        const minW = clone.offsetWidth;
        const minH = clone.offsetHeight;
        
        document.body.removeChild(clone);
        
        el.style.width = Math.max(200, minW + 10) + 'px';
        el.style.height = Math.max(100, minH + 10) + 'px';
    } else {
        el.style.width = Math.max(200, cols * 50) + 'px';
        el.style.height = Math.max(100, rows * 25) + 'px';
    }
    
    // Replace the default 200x100 history snapshot with our correctly-sized one
    if(typeof state !== 'undefined' && state.history && state.history.length > 0) {
        state.history.pop();
        state.historyIndex--;
        if(typeof pushHistory === 'function') pushHistory();
    }
}

function addTable() { 
    // Fallback if needed, but UI uses insertTable
    insertTable(3,3); 
}

    window.clearSelectedCellText = function() {
        let changed = false;
        if (window._tableSelectedCells && window._tableSelectedCells.length > 0) {
            window._tableSelectedCells.forEach(cell => {
                cell.innerHTML = '<br>';
                changed = true;
            });
        } else {
            const activeCell = ContextRibbonActions.getActiveCell();
            if (activeCell) {
                activeCell.innerHTML = '<br>';
                changed = true;
            }
        }
        
        if (changed) {
            pushHistory();
        }
    };

    window.openTableTemplatesModal = function() {
        let gridHtml = '<div class="tt-grid">';
        window.tableTemplatesData.forEach((tpl, index) => {
            // Group labels to separate Structural from Themes visually
            if(index === 0) gridHtml += `<div style="grid-column: 1 / -1; padding: 10px 5px 0px; font-size: 11px; font-weight: bold; color: #888; text-transform: uppercase;">Structural Layouts</div>`;
            if(index === 10) gridHtml += `<div style="grid-column: 1 / -1; padding: 10px 5px 0px; font-size: 11px; font-weight: bold; color: #888; text-transform: uppercase;">Color Themes & Styles</div>`;
            
            gridHtml += `
                <div class="tt-card" onclick="insertQuickTable(${index})">
                    ${tpl.previewHTML}
                    <div class="tt-name">${tpl.name}</div>
                </div>
            `;
        });
        gridHtml += '</div>';

        // Fire native draggable dialog
        DialogSystem.show('Insert Styled Table (100 Layouts)', gridHtml, null, true);

        // Expand the draggable modal width so the 3-column grid fits beautifully
        setTimeout(() => {
            const dialogBox = document.getElementById('custom-dialog-box');
            if(dialogBox) {
                dialogBox.style.width = '650px';
                dialogBox.style.maxWidth = '95vw';
            }
        }, 10);
    };

    window.insertQuickTable = function(index) {
        const tpl = window.tableTemplatesData[index];
        if(!tpl) return;

        if (typeof createWrapper === 'function') {
            const el = createWrapper(tpl.insertHTML);
            el.setAttribute('data-type', 'table');
            
            // Allow the browser to render the table naturally to measure it
            const tbl = el.querySelector('table');
            if (tbl) {
                const clone = tbl.cloneNode(true);
                clone.style.position = 'absolute'; clone.style.visibility = 'hidden';
                clone.style.width = 'max-content'; clone.style.height = 'max-content';
                clone.style.maxWidth = 'none'; clone.style.maxHeight = 'none';
                document.body.appendChild(clone);
                
                const minH = clone.offsetHeight;
                
                document.body.removeChild(clone);
                
                el.style.width = '500px';
                el.style.height = Math.max(150, minH + 10) + 'px';
            } else {
                el.style.width = '500px';
                el.style.height = '150px';
            }
            
            if(typeof state !== 'undefined' && state.history && state.history.length > 0) {
                state.history.pop();
                state.historyIndex--;
                if(typeof pushHistory === 'function') pushHistory();
            }
        } else {
            alert("Error: Core layout engine not found.");
        }
        
        DialogSystem.close();
    };

