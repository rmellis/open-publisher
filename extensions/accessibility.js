(function installSidebarAccessibility() {
    document.getElementById('op-a11y-sidebar')?.remove();

    const panel = document.createElement('div');
    panel.id = 'op-a11y-sidebar';
    panel.className = 'sidebar-panel op-sidebar';
    panel.innerHTML = `<div class="op-sidebar-header">
            <span class="op-sidebar-title">Accessibility Checker</span>
            <div class="op-sidebar-top-btns">
                <button class="custom-dialog-close" onclick="document.getElementById('op-a11y-sidebar').classList.remove('visible')"><i class="fas fa-times"></i></button>
            </div>
        </div>
        <div id="a11y-results-container" style="padding: 15px; overflow-y:auto; height:calc(100% - 50px);"></div>
    `;
    let workspace = document.querySelector('.workspace');
    if (workspace) workspace.appendChild(panel);
    else document.body.appendChild(panel);
})();
