window.GraphicsManager = {
    toggleSidebar: function() {
        const sidebar = document.getElementById('op-graphics-sidebar');
        if (sidebar) {
            if (sidebar.classList.contains('visible')) {
                sidebar.classList.remove('visible');
            } else {
                // hide others
                document.getElementById('op-table-sidebar')?.classList.remove('visible');
                document.getElementById('op-image-sidebar')?.classList.remove('visible');
                document.getElementById('op-wordart-sidebar')?.classList.remove('visible');
                document.getElementById('op-a11y-sidebar')?.classList.remove('visible');
                sidebar.classList.add('visible');
                this.scanImages();
            }
        }
    },

    scanImages: function() {
        if (typeof serializeCurrentPage === 'function') {
            state.pages[state.currentPageIndex] = serializeCurrentPage();
        }

        let imagesList = [];

        for (let i = 0; i < state.pages.length; i++) {
            let p = state.pages[i];
            if (!p || !p.elements) continue;

            p.elements.forEach((el, index) => {
                if (el.imgSrc || el.type === 'image' || (el.type === 'shape' && el.imgSrc)) {
                    imagesList.push({
                        pageIndex: i,
                        elementIndex: index,
                        src: el.imgSrc,
                        element: el
                    });
                }
            });
        }
        this.renderList(imagesList);
    },

    formatBytes: function(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    },

    updateLinkedImage: function(pageIndex, elementIndex) {
        if (!state.pages[pageIndex] || !state.pages[pageIndex].elements[elementIndex]) return;
        const elData = state.pages[pageIndex].elements[elementIndex];
        
        const isEmbedded = elData.imgSrc && elData.imgSrc.startsWith('data:');
        
        if (!isEmbedded) {
            let url = elData.imgSrc;
            const qIdx = url.indexOf('?');
            if (qIdx !== -1) {
                // Strip old timestamp but keep other query params if needed? 
                // It's safer to just strip everything and append our own for cache busting
                url = url.substring(0, qIdx);
            }
            
            const newUrl = url + '?t=' + Date.now();
            elData.imgSrc = newUrl;
            
            if (state.currentPageIndex === pageIndex) {
                const paper = document.getElementById('paper');
                if (paper) {
                    const els = paper.querySelectorAll('.element');
                    if (els[elementIndex]) {
                        const img = els[elementIndex].querySelector('img');
                        if (img) img.src = newUrl;
                    }
                }
            }
            
            if (typeof pushHistory === 'function') pushHistory();
            this.scanImages();
            return;
        }

        // It's a Data URI (Embedded), we must prompt the user to select the updated file
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const newUrl = evt.target.result;
                    elData.imgSrc = newUrl;
                    
                    if (state.currentPageIndex === pageIndex) {
                        const paper = document.getElementById('paper');
                        if (paper) {
                            const els = paper.querySelectorAll('.element');
                            if (els[elementIndex]) {
                                const img = els[elementIndex].querySelector('img');
                                if (img) img.src = newUrl;
                            }
                        }
                    }
                    if (typeof pushHistory === 'function') pushHistory();
                    this.scanImages();
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        };
        input.click();
    },

    renderList: function(imagesList) {
        const container = document.getElementById('graphics-manager-results');
        if (!container) return;

        if (imagesList.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--ui-text-muted, #666);"><i class="fas fa-image fa-3x" style="color:var(--ui-border, #ddd); margin-bottom:15px;"></i><br>No graphics found in this document.</div>';
            return;
        }

        container.innerHTML = `<div style="font-size:12px; color:var(--ui-text-muted, #666); margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;"><span>Total Graphics: <strong style="color:var(--ui-text)">${imagesList.length}</strong></span><button onclick="window.GraphicsManager.scanImages()" style="background:none; border:none; color:var(--ui-theme-color); cursor:pointer;"><i class="fas fa-sync-alt"></i> Refresh</button></div>`;

        const listDiv = document.createElement('div');
        listDiv.className = 'graphics-manager-list';
        listDiv.style.display = 'flex';
        listDiv.style.flexDirection = 'column';
        listDiv.style.gap = '10px';

        imagesList.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'graphics-card';
            card.style.background = 'var(--ui-panel-bg, #fff)';
            card.style.border = '1px solid var(--ui-border, #ddd)';
            card.style.borderRadius = '6px';
            card.style.padding = '10px';
            card.style.display = 'flex';
            card.style.color = 'var(--ui-text)';
            card.style.gap = '15px';
            card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            card.style.transition = 'box-shadow 0.2s';
            card.style.cursor = 'pointer';
            card.onmouseover = () => card.style.boxShadow = '0 3px 6px rgba(0,0,0,0.1)';
            card.onmouseout = () => card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            
            card.onclick = () => this.goToFileManagerImage(item.pageIndex, item.elementIndex);

            const thumbContainer = document.createElement('div');
            thumbContainer.style.width = '60px';
            thumbContainer.style.height = '60px';
            thumbContainer.style.flexShrink = '0';
            thumbContainer.style.backgroundColor = 'var(--ui-hover-bg, #eee)';
            thumbContainer.style.borderRadius = '4px';
            thumbContainer.style.display = 'flex';
            thumbContainer.style.alignItems = 'center';
            thumbContainer.style.justifyContent = 'center';
            thumbContainer.style.overflow = 'hidden';

            const img = document.createElement('img');
            img.src = item.src;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.objectFit = 'contain';
            thumbContainer.appendChild(img);

            const details = document.createElement('div');
            details.style.flexGrow = '1';
            details.style.fontSize = '12px';
            details.style.lineHeight = '1.4';
            details.style.color = '#333';

            const isEmbedded = item.src.startsWith('data:');
            const typeBadge = isEmbedded ? 
                `<span style="background:#e8f5e9; color:#2e7d32; padding:2px 6px; border-radius:10px; font-size:10px; font-weight:bold;"><i class="fas fa-file-archive"></i> Embedded</span>` : 
                `<span style="background:#e3f2fd; color:#1565c0; padding:2px 6px; border-radius:10px; font-size:10px; font-weight:bold;"><i class="fas fa-link"></i> Linked</span>`;

            const updateBtnHtml = `<div style="margin-top:8px;"><button onclick="event.stopPropagation(); window.GraphicsManager.updateLinkedImage(${item.pageIndex}, ${item.elementIndex})" style="background:var(--ui-theme-color); color:#fff; border:none; padding:4px 10px; border-radius:4px; font-size:11px; cursor:pointer;"><i class="fas fa-sync-alt"></i> Update Image</button></div>`;

            details.innerHTML = `
                <div style="font-weight:bold; font-size:13px; margin-bottom:4px;">Page ${item.pageIndex + 1}</div>
                <div style="margin-bottom:4px;">${typeBadge}</div>
                <div id="res-${idx}" style="color:#666;"><i class="fas fa-spinner fa-spin"></i> Resizing...</div>
                <div id="size-${idx}" style="color:#666;"><i class="fas fa-spinner fa-spin"></i> Calculating...</div>
                ${updateBtnHtml}
            `;

            card.appendChild(thumbContainer);
            card.appendChild(details);
            listDiv.appendChild(card);

            // Async resolve resolution
            const tempImg = new Image();
            tempImg.onload = function() {
                const resEl = document.getElementById(`res-${idx}`);
                if (resEl) resEl.innerHTML = `<i class="fas fa-crop-alt"></i> ${this.width} x ${this.height} px`;
            };
            tempImg.onerror = function() {
                const resEl = document.getElementById(`res-${idx}`);
                if (resEl) resEl.innerHTML = `<i class="fas fa-exclamation-triangle" style="color:#c00"></i> Error`;
            };
            tempImg.src = item.src;

            // Async resolve size
            if (isEmbedded) {
                // Estimate base64 size: 
                let base64str = item.src.split(',')[1];
                if (base64str) {
                    let sizeBytes = Math.floor(base64str.length * 0.75);
                    setTimeout(() => {
                        const sizeEl = document.getElementById(`size-${idx}`);
                        if (sizeEl) sizeEl.innerHTML = `<i class="fas fa-hdd"></i> ${window.GraphicsManager.formatBytes(sizeBytes)}`;
                    }, 50);
                } else {
                    const sizeEl = document.getElementById(`size-${idx}`);
                    if (sizeEl) sizeEl.innerHTML = `<i class="fas fa-hdd"></i> Unknown`;
                }
            } else {
                // Try to fetch HEAD for linked file size
                fetch(item.src, { method: 'HEAD', mode: 'cors' })
                    .then(response => {
                        const size = response.headers.get('content-length');
                        const sizeEl = document.getElementById(`size-${idx}`);
                        if (size) {
                            if (sizeEl) sizeEl.innerHTML = `<i class="fas fa-hdd"></i> ${window.GraphicsManager.formatBytes(size)}`;
                        } else {
                            if (sizeEl) sizeEl.innerHTML = `<i class="fas fa-hdd"></i> Unknown`;
                        }
                    })
                    .catch(e => {
                        const sizeEl = document.getElementById(`size-${idx}`);
                        if (sizeEl) sizeEl.innerHTML = `<i class="fas fa-hdd"></i> Blocked (CORS/Network)`;
                    });
            }
        });

        container.appendChild(listDiv);
    },

    goToFileManagerImage: function(pageIndex, elementIndex) {
        if (state.currentPageIndex !== pageIndex) {
            switchPage(pageIndex);
        }
        
        setTimeout(() => {
            const paper = document.getElementById('paper');
            if (paper) {
                const el = paper.children[elementIndex];
                if (el && typeof selectElement === 'function') {
                    selectElement(el, new Event('click'));
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 300);
    }
};
