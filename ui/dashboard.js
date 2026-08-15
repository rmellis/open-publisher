// ==========================================
// DASHBOARD (START SCREEN) SYSTEM
// ==========================================

window.DashboardSystem = {
    initialized: false,
    templateData: null,
    
    init: function() {
        if (this.initialized) return;
        this.initialized = true;
        
        // Tab switching logic
        document.querySelectorAll('.dashboard-nav-item[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                if (tab.classList.contains('disabled')) return;
                
                // Remove active from all tabs
                document.querySelectorAll('.dashboard-nav-item').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Hide all panes
                document.querySelectorAll('.dashboard-tab-pane').forEach(p => p.classList.remove('active'));
                
                // Show target pane
                const targetId = tab.getAttribute('data-tab');
                document.getElementById(targetId).classList.add('active');
                
                // Handle category specific view if triggered from nav
                if (tab.hasAttribute('data-category')) {
                    this.renderCategoryGrid(tab.getAttribute('data-category'));
                }
            });
        });
        
        // Search Logic
        const searchInput = document.getElementById('dashboard-search-input');
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            this.handleSearch(query);
        });
        
        // Setup dragging for the dashboard modal
        const dashboardOverlay = document.getElementById('dashboard-overlay');
        const dashboardHeader = dashboardOverlay.querySelector('.dashboard-header');
        
        if (dashboardHeader) {
            let isDraggingDashboard = false;
            let dragStartX, dragStartY, initialLeft, initialTop;
            
            dashboardHeader.style.cursor = 'grab';
            
            dashboardHeader.addEventListener('mousedown', (e) => {
                if (e.target.closest('button, input, .dashboard-search')) return;
                isDraggingDashboard = true;
                dashboardHeader.style.cursor = 'grabbing';
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                
                const rect = dashboardOverlay.getBoundingClientRect();
                initialLeft = rect.left;
                initialTop = rect.top;
                
                dashboardOverlay.style.transition = 'none';
                dashboardOverlay.style.margin = '0'; // clear potential auto margins
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDraggingDashboard) return;
                e.preventDefault();
                const dx = e.clientX - dragStartX;
                const dy = e.clientY - dragStartY;
                dashboardOverlay.style.left = (initialLeft + dx) + 'px';
                dashboardOverlay.style.top = (initialTop + dy) + 'px';
            });

            document.addEventListener('mouseup', () => {
                if (isDraggingDashboard) {
                    isDraggingDashboard = false;
                    dashboardHeader.style.cursor = 'grab';
                    dashboardOverlay.style.transition = 'opacity 0.3s ease';
                }
            });
        }
        
        this.loadTemplates();
        this.loadRecentFiles();
        
        // Setup initial scroll grids (Blank and Featured)
        document.querySelectorAll('.dashboard-grid-container').forEach(container => {
            this.setupGridScroll(container);
        });
    },
    
    show: function() {
        const overlay = document.getElementById('dashboard-overlay');
        overlay.style.display = 'flex';
        // Small delay to allow display:flex to apply before setting opacity for transition
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
        
        if (!this.initialized) this.init();
    },
    
    hide: function() {
        const overlay = document.getElementById('dashboard-overlay');
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    },
    
    close: function() {
        if (typeof state !== 'undefined' && (!state.pages || state.pages.length === 0)) {
            this.startBlank('A4');
        } else {
            this.hide();
        }
    },
    
    startBlank: function(size) {
        this.hide();
        
        // Clear state
        state.pages = [];
        state.history = [];
        state.historyIndex = -1;
        
        if (size === 'Custom') {
            changeSize(); // Native function
        } else if (size === 'Square') {
            // No direct string for Square in setPageSize natively, 
            // setPageSize only does strings or if we just manually set width/height
            // Let's just create a custom square page
            state.pages = [];
            let newPage = {
                id: Date.now(),
                width: '794px',
                height: '794px',
                background: '#ffffff',
                header: 'Header',
                footer: 'Footer',
                borderStyle: 'none',
                elements: []
            };
            state.pages.push(newPage);
            state.currentPageIndex = 0;
            renderPage(newPage);
            if(window.minimapSystem) minimapSystem.updateMinimap();
            updateTitleBar();
        } else {
            setPageSize(size);
        }
        
        if (size !== 'Square' && size !== 'Custom') {
            addNewPage();
        }
    },
    
    loadTemplates: function() {
        fetch('elements/templates/template-index.json?v=4.17.8')
            .then(res => res.json())
            .then(data => {
                this.templateData = data;
                this.renderFeatured();
                this.renderCategoriesRows();
                this.populateCategoriesNav();
            })
            .catch(err => console.error("Dashboard failed to load templates:", err));
    },
    
    createTemplateCard: function(t, isExpanded = false) {
        const div = document.createElement('div');
        div.className = 'dashboard-template-card';
        div.innerHTML = `<div class="dashboard-template-preview" style="display:flex;align-items:center;justify-content:center;color:#999;font-size:0.8rem;">Loading...</div><div class="dashboard-template-title">${t.name}</div>`;
        
        // Fetch opub to get thumbnail HTML
        fetch(`elements/templates/files/${t.file}?v=4.17.8`)
            .then(res => res.json())
            .then(opubData => {
                const page = opubData.pages[0];
                let previewHTML = '';
                page.elements.forEach(el => {
                    previewHTML += `<div style="position:absolute; top:${el.top}; left:${el.left}; width:${el.width}; height:${el.height}; z-index:${el.zIndex};">${el.innerHTML}</div>`;
                });
                
                const w = parseInt(page.width) || 794;
                const h = parseInt(page.height) || 1123;
                const scale = 200 / w; // scale for dashboard card (200px width)
                
                let sizeLabel = '';
                if (typeof window.getPageSizeLabel === 'function') {
                    sizeLabel = window.getPageSizeLabel(w, h);
                } else {
                    sizeLabel = `${w}x${h}`;
                }
                
                const content = `
                    <div style="
                        width: ${page.width}; 
                        height: ${page.height}; 
                        background: ${page.background}; 
                        transform: scale(${scale}); 
                        transform-origin: 0 0; 
                        overflow: hidden; 
                        position: absolute; 
                        top: 0; left: 0;
                        pointer-events: none;
                    ">
                        ${previewHTML}
                    </div>
                `;
                const sizeBadge = `<div class="dashboard-template-badge">${sizeLabel}</div>`;
                
                // Set the container height based on aspect ratio
                const cardHeight = h * scale;
                
                div.innerHTML = `
                    <div class="dashboard-template-preview" style="height:${cardHeight}px; background:#eee; position:relative;">
                        ${content}${sizeBadge}
                    </div>
                    <div class="dashboard-template-title">${t.name}</div>
                `;
                
                div.onclick = () => {
                    this.hide();
                    loadTemplate(opubData);
                };
            })
            .catch(err => {
                div.innerHTML = `<div class="dashboard-template-preview" style="display:flex;align-items:center;justify-content:center;color:#cc0000;font-size:0.8rem;">Error</div><div class="dashboard-template-title">${t.name}</div>`;
            });
            
        return div;
    },

    setupGridScroll: function(gridWrapper) {
        if (gridWrapper.dataset.scrollSetup) return;
        gridWrapper.dataset.scrollSetup = "true";
        
        const grid = gridWrapper.querySelector('.dashboard-template-grid, .dashboard-blank-grid');
        const leftBtn = gridWrapper.querySelector('.dashboard-scroll-left');
        const rightBtn = gridWrapper.querySelector('.dashboard-scroll-right');
        if (!grid || !leftBtn || !rightBtn) return;
        
        const updateButtons = () => {
            if (grid.scrollLeft > 0) {
                leftBtn.classList.add('visible');
            } else {
                leftBtn.classList.remove('visible');
            }
            if (grid.scrollLeft + grid.clientWidth < grid.scrollWidth - 1) {
                rightBtn.classList.add('visible');
            } else {
                rightBtn.classList.remove('visible');
            }
        };
        
        grid.addEventListener('scroll', updateButtons);
        // Timeout to allow layout to settle before checking scrollWidth
        setTimeout(updateButtons, 100);
        window.addEventListener('resize', updateButtons);
        
        leftBtn.addEventListener('click', () => {
            grid.scrollBy({ left: -300, behavior: 'smooth' });
        });
        rightBtn.addEventListener('click', () => {
            grid.scrollBy({ left: 300, behavior: 'smooth' });
        });
        
        // Touch / Drag to scroll
        let isDown = false;
        let startX;
        let scrollLeft;
        
        grid.addEventListener('mousedown', (e) => {
            // Prevent drag if clicking on a card or button that should handle its own event
            isDown = true;
            grid.style.cursor = 'grabbing';
            startX = e.pageX - grid.offsetLeft;
            scrollLeft = grid.scrollLeft;
        });
        grid.addEventListener('mouseleave', () => {
            isDown = false;
            grid.style.cursor = 'default';
        });
        grid.addEventListener('mouseup', () => {
            isDown = false;
            grid.style.cursor = 'default';
        });
        grid.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - grid.offsetLeft;
            const walk = (x - startX) * 2; // Scroll fast multiplier
            grid.scrollLeft = scrollLeft - walk;
        });
    },
    
    renderFeatured: function() {
        const featuredContainer = document.getElementById('dashboard-featured-grid');
        if (!featuredContainer || !this.templateData) return;
        featuredContainer.innerHTML = '';

        // Curated hand-picked featured templates — the best of the premium collection
        const featured = [
            { name: 'Executive Summary',       file: 'reports_executive_summary.opub',         category: 'Reports' },
            { name: 'Luxury Wedding',           file: 'invitations_luxury_wedding.opub',         category: 'Invitations' },
            { name: 'Michelin Fine Dining',     file: 'menus_michelin_fine_dining.opub',         category: 'Menus' },
            { name: 'Black Tie Gala',           file: 'invitations_black_tie_gala.opub',         category: 'Invitations' },
            { name: 'Film Festival',            file: 'posters_film_festival.opub',              category: 'Posters' },
            { name: 'Nightclub Event',          file: 'flyers_nightclub_event.opub',             category: 'Flyers' },
            { name: 'Creative Director',        file: 'resumes_creative_director.opub',          category: 'Resumes' },
            { name: 'Gaming Magazine',          file: 'magazines_gaming_cover.opub',             category: 'Magazines' },
            { name: 'Luxury Brand Post',        file: 'social_media_luxury_brand.opub',          category: 'Social Media' },
            { name: 'Gold Excellence Award',    file: 'certificates_excellence_gold.opub',       category: 'Certificates' },
            { name: 'Vintage Concert',          file: 'posters_vintage_concert.opub',            category: 'Posters' },
            { name: 'Yacht Charter',            file: 'brochures_yacht_charter.opub',            category: 'Brochures' },
        ];

        featured.forEach(item => {
            // Find full template object from loaded data so card renders correctly
            const catTemplates = this.templateData[item.category];
            const template = catTemplates
                ? catTemplates.find(t => t.file === item.file)
                : null;
            const t = template || { name: item.name, file: item.file };
            featuredContainer.appendChild(this.createTemplateCard(t));
        });
    },

    
    renderCategoriesRows: function() {
        const container = document.getElementById('dashboard-categories-container');
        if (!container || !this.templateData) return;
        container.innerHTML = '';
        
        const cats = Object.keys(this.templateData);
        cats.forEach(cat => {
            const templates = this.templateData[cat];
            if (!templates || templates.length === 0) return;
            
            const section = document.createElement('div');
            section.className = 'dashboard-section';
            
            const header = document.createElement('div');
            header.className = 'dashboard-section-title';
            header.innerHTML = `<span>${cat}</span> <a onclick="DashboardSystem.openCategory('${cat}')">See all &rarr;</a>`;
            
            const gridContainer = document.createElement('div');
            gridContainer.className = 'dashboard-grid-container';
            
            const leftBtn = document.createElement('div');
            leftBtn.className = 'dashboard-scroll-btn dashboard-scroll-left';
            leftBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            
            const rightBtn = document.createElement('div');
            rightBtn.className = 'dashboard-scroll-btn dashboard-scroll-right';
            rightBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            
            const grid = document.createElement('div');
            grid.className = 'dashboard-template-grid';
            
            // Show up to 10 in the row for better scrolling demo
            const max = Math.min(templates.length, 10);
            for(let i=0; i<max; i++) {
                grid.appendChild(this.createTemplateCard(templates[i]));
            }
            
            gridContainer.appendChild(leftBtn);
            gridContainer.appendChild(grid);
            gridContainer.appendChild(rightBtn);
            
            section.appendChild(header);
            section.appendChild(gridContainer);
            container.appendChild(section);
            
            // Setup scrolling functionality
            DashboardSystem.setupGridScroll(gridContainer);
        });
    },
    
    populateCategoriesNav: function() {
        const navContainer = document.getElementById('dashboard-nav-categories');
        if (!navContainer || !this.templateData) return;
        navContainer.innerHTML = '';
        
        const cats = Object.keys(this.templateData);
        cats.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'dashboard-nav-item';
            item.setAttribute('data-tab', 'dashboard-tab-category');
            item.setAttribute('data-category', cat);
            // We use standard icon for all, but could map if needed
            item.innerHTML = `<i class="far fa-file-alt"></i> ${cat}`;
            
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.dashboard-nav-item').forEach(t => t.classList.remove('active'));
                item.classList.add('active');
                
                document.querySelectorAll('.dashboard-tab-pane').forEach(p => p.classList.remove('active'));
                document.getElementById('dashboard-tab-category').classList.add('active');
                
                this.renderCategoryGrid(cat);
            });
            
            navContainer.appendChild(item);
        });
    },
    
    openCategory: function(catName) {
        // Find the nav item and click it
        const navItem = document.querySelector(`.dashboard-nav-item[data-category="${catName}"]`);
        if (navItem) {
            navItem.click();
        } else {
            // Fallback
            document.querySelectorAll('.dashboard-tab-pane').forEach(p => p.classList.remove('active'));
            document.getElementById('dashboard-tab-category').classList.add('active');
            this.renderCategoryGrid(catName);
        }
    },
    
    renderCategoryGrid: function(catName) {
        const titleEl = document.getElementById('dashboard-category-title');
        const gridEl = document.getElementById('dashboard-category-grid');
        
        if (!titleEl || !gridEl || !this.templateData) return;
        
        titleEl.textContent = catName;
        gridEl.innerHTML = '';
        
        const templates = this.templateData[catName] || [];
        templates.forEach(t => {
            gridEl.appendChild(this.createTemplateCard(t, true));
        });
    },
    
    handleSearch: function(query) {
        // If query is empty, go back to New tab
        if (!query.trim()) {
            document.getElementById('nav-tab-new').click();
            return;
        }
        
        if (!this.templateData) return;
        
        // Deselect all tabs
        document.querySelectorAll('.dashboard-nav-item').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.dashboard-tab-pane').forEach(p => p.classList.remove('active'));
        
        // Show Search pane
        const searchPane = document.getElementById('dashboard-tab-search');
        searchPane.classList.add('active');
        
        const titleEl = document.getElementById('dashboard-search-title');
        const gridEl = document.getElementById('dashboard-search-grid');
        
        titleEl.textContent = `Search Results for "${query}"`;
        gridEl.innerHTML = '';
        
        let found = 0;
        Object.keys(this.templateData).forEach(cat => {
            this.templateData[cat].forEach(t => {
                if (t.name.toLowerCase().includes(query) || cat.toLowerCase().includes(query)) {
                    gridEl.appendChild(this.createTemplateCard(t, true));
                    found++;
                }
            });
        });
        
        if (found === 0) {
            gridEl.innerHTML = `<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--ui-text-muted);">No templates found matching "${query}"</div>`;
        }
    },
    
    loadRecentFiles: function() {
        const recentContainer = document.getElementById('dashboard-recent-grid');
        if (!recentContainer) return;
        
        let recentFiles = [];
        try {
            const stored = localStorage.getItem('op_recent_files');
            if (stored) recentFiles = JSON.parse(stored);
        } catch (e) {
            console.warn("Failed to load recent files", e);
        }
        
        if (recentFiles.length === 0) {
            recentContainer.innerHTML = `
                <div class="dashboard-recent-empty" style="grid-column: 1/-1;">
                    <i class="far fa-folder-open"></i>
                    <div>No recent files yet.</div>
                    <div style="font-size: 0.9rem; margin-top: 5px;">Create a new document or open an existing one to see it here.</div>
                </div>
            `;
            return;
        }
        
        recentContainer.innerHTML = '';
        
        recentFiles.forEach(file => {
            const date = new Date(file.lastModified);
            const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const card = document.createElement('div');
            card.className = 'dashboard-template-card';
            
            const badge = file.pageSize ? `<div class="dashboard-template-badge">${file.pageSize}</div>` : '';
            const thumbSrc = file.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4='; // Fallback grey rect
            
            card.innerHTML = `
                <div class="dashboard-template-preview" style="background-image: url('${thumbSrc}'); background-size: cover;">
                    ${badge}
                </div>
                <div class="dashboard-template-title">${file.name}</div>
                <div style="font-size: 0.75rem; color: var(--ui-text-muted); margin-top: 2px;">${dateStr}</div>
            `;
            
            card.onclick = () => {
                this.hide();
                
                // Load from data
                state.pages = [];
                state.history = [];
                state.historyIndex = -1;
                
                state.pages = file.data.pages; // Need to ensure it's unreferenced/deep copied if reused, but here we just assign
                state.currentPageIndex = 0;
                
                document.getElementById('doc-title').innerText = file.name.replace('.opub', '');
                
                renderPage(state.pages[state.currentPageIndex]);
                if(window.minimapSystem) minimapSystem.updateMinimap();
                updateTitleBar();
            };
            
            recentContainer.appendChild(card);
        });
    },
    
    // Call this whenever a file is saved or opened to update the recent list
    addToRecent: function(name, opubData, thumbDataUrl, pageSizeLabel) {
        try {
            let recentFiles = [];
            const stored = localStorage.getItem('op_recent_files');
            if (stored) recentFiles = JSON.parse(stored);
            
            // Remove if already exists (to bump to top)
            recentFiles = recentFiles.filter(f => f.name !== name);
            
            recentFiles.unshift({
                name: name,
                thumbnail: thumbDataUrl,
                lastModified: new Date().toISOString(),
                pageSize: pageSizeLabel || 'Custom',
                data: opubData
            });
            
            // Keep only last 12
            if (recentFiles.length > 12) recentFiles = recentFiles.slice(0, 12);
            
            localStorage.setItem('op_recent_files', JSON.stringify(recentFiles));
            this.loadRecentFiles(); // Refresh UI
        } catch (e) {
            console.warn("Failed to save to recent files (possibly too large for localStorage)", e);
        }
    }
};
