window.showWebClipartModal = function() {
    if (typeof webClipartLibrary === 'undefined' || typeof webClipartBaseUrl === 'undefined') {
        DialogSystem.show('Error', '<p>Clipart library not loaded.</p>', null, true);
        return;
    }
    
    const uiHTML = `
        <style>
            #custom-dialog-header { display: none !important; }
            .custom-dialog-footer { display: none !important; }
            .custom-dialog-body { padding: 0 !important; background: #f3f4f6 !important; border-radius: 8px; overflow: hidden; }
            
            .wa-modal-header {
                background: var(--ui-theme-dark);
                padding: 16px 25px;
                display: flex;
                align-items: center;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
                cursor: grab;
                position: relative;
            }
            .wa-modal-header:active { cursor: grabbing; }
            .wa-modal-title {
                color: white;
                font-family: 'Segoe UI', sans-serif;
                font-size: 20px;
                font-weight: 600;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 20px;
                flex-grow: 1;
                padding-right: 30px; /* Space for the close button */
            }
            .wa-close-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                right: 20px;
                color: rgba(255, 255, 255, 0.7);
                font-size: 20px;
                cursor: pointer;
                z-index: 2;
            }
            .wa-close-btn:hover { color: white; }
            
            .clipart-grid-container {
                height: 500px;
                overflow-y: auto;
                padding: 20px;
                background: white;
            }
            
            .clipart-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                gap: 15px;
            }
            
            .clipart-card {
                aspect-ratio: 1;
                border: 2px solid transparent;
                border-radius: 8px;
                padding: 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.1s, border-color 0.2s, box-shadow 0.2s;
            }
            
            .clipart-card:hover {
                transform: scale(1.05);
                border-color: var(--ui-theme-color);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .clipart-card.selected {
                border-color: var(--ui-theme-color);
                background-color: rgba(0, 118, 112, 0.1);
                box-shadow: 0 4px 12px rgba(0, 118, 112, 0.2);
            }
        </style>
        <div class="wa-modal-header" id="clipart-modal-header">
            <div class="wa-modal-title">
                <span>Clipart Gallery</span>
                <div id="clipart-search-wrapper" style="position: relative; flex-grow: 1; max-width: 400px; font-weight: normal; font-size: 14px;">
                    <i class="fas fa-search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #888; pointer-events: none;"></i>
                    <input type="text" id="clipart-search-input" placeholder="Search for clipart (e.g., 'tree', 'computer', 'apple')..." style="width: 100%; padding: 10px 15px 10px 40px; border-radius: 20px; border: 1px solid #ddd; outline: none; box-sizing: border-box; background: rgba(255,255,255,0.95); user-select: text; -webkit-user-select: text; font-family: 'Segoe UI', sans-serif;">
                </div>
            </div>
            <div class="custom-dialog-close" id="clipart-close-x" style="position: absolute; top: 8px; right: 8px; z-index: 10;"><i class="fas fa-times"></i></div>
        </div>
        <div class="clipart-grid-container" id="clipart-grid-container" style="height: 50vh;">
            <!-- Grid goes here -->
        </div>
        <div class="wa-modal-footer" style="padding: 15px; text-align: right; border-top: 1px solid #eee; background: #fafafa; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            <button id="clipart-btn-cancel" class="btn-secondary" style="margin-right: 10px;">Cancel</button>
            <button id="clipart-btn-ok" class="btn-primary" disabled>OK</button>
        </div>
    `;

    DialogSystem.show('', uiHTML, null, true);
    
    // Style the dialog box exactly like beta wordart
    setTimeout(() => {
        const dialogBox = document.getElementById('custom-dialog-box');
        if(dialogBox) {
            dialogBox.style.width = '850px';
            dialogBox.style.maxWidth = '95vw';
            dialogBox.style.padding = '0';
            dialogBox.style.backgroundColor = 'transparent';
            dialogBox.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';

            const header = document.getElementById('clipart-modal-header');
            if (header) {
                let isDragging = false;
                header.addEventListener('mousedown', function(e) {
                    if (e.target.closest('#clipart-search-wrapper') || e.target.closest('#clipart-close-x')) return;
                    isDragging = true;
                    const rect = dialogBox.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    const offsetY = e.clientY - rect.top;

                    dialogBox.style.position = 'fixed';
                    dialogBox.style.transform = 'none';
                    dialogBox.style.margin = '0';
                    dialogBox.style.bottom = 'auto';
                    dialogBox.style.right = 'auto';
                    dialogBox.style.left = (e.clientX - offsetX) + 'px';
                    dialogBox.style.top = (e.clientY - offsetY) + 'px';

                    const onMouseMove = (me) => {
                        if (!isDragging) return;
                        dialogBox.style.left = (me.clientX - offsetX) + 'px';
                        dialogBox.style.top = (me.clientY - offsetY) + 'px';
                    };

                    const onMouseUp = () => {
                        isDragging = false;
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });
            }
            
            const closeBtn = document.getElementById('clipart-close-x');
            if (closeBtn) closeBtn.onclick = () => DialogSystem.close();
        }

        // Render using IntersectionObserver to prevent UI locking
        const container = document.getElementById('clipart-grid-container');
        if (!container) return;
        
        const grid = document.createElement('div');
        grid.className = 'clipart-grid';
        container.appendChild(grid);

        const thumbBaseUrl = "https://wsrv.nl/?url=acr.floydcraft.co.uk/clipart-thumbs/";
        const highResBaseUrl = "https://wsrv.nl/?url=acr.floydcraft.co.uk/clipart/";
        
        let activeLoads = 0;
        const maxConcurrent = 5;
        const loadQueue = [];
        
        const processQueue = () => {
            // Priority sort: currently visible items jump to the front of the queue
            loadQueue.sort((a, b) => (b.isIntersecting ? 1 : 0) - (a.isIntersecting ? 1 : 0));

            while (activeLoads < maxConcurrent && loadQueue.length > 0) {
                const card = loadQueue.shift();
                const filename = card.dataset.filename;
                activeLoads++;
                
                const img = new Image();
                img.onload = () => {
                    card.innerHTML = '';
                    card.appendChild(img);
                    card.loaded = true;
                    observer.unobserve(card); // Unobserve only when fully loaded
                    activeLoads--;
                    processQueue();
                };
                img.onerror = () => {
                    setTimeout(() => {
                        activeLoads--;
                        card.retries = (card.retries || 0) + 1;
                        loadQueue.push(card); // Retry by pushing back into queue
                        processQueue();
                    }, 1500);
                };
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                img.style.objectFit = 'contain';
                img.style.pointerEvents = 'none';
                img.style.animation = 'fadeIn 0.3s';
                
                // Fallback to high-res version if the thumbnail fails to load after 2 attempts
                if (card.retries >= 2) {
                    img.src = `${highResBaseUrl}${filename}`;
                } else {
                    img.src = `${thumbBaseUrl}${filename}`;
                }
            }
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const card = entry.target;
                card.isIntersecting = entry.isIntersecting; // Continuously track visibility status

                if (entry.isIntersecting) {
                    if (!card.loaded && !card.queued) {
                        card.queued = true;
                        card.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: var(--ui-theme-color); font-size: 24px; opacity: 0.5;"></i>';
                        loadQueue.push(card);
                        processQueue();
                    }
                }
            });
        }, { root: container, rootMargin: '300px' });

        let selectedFilename = null;
        let selectedElement = null;
        
        const closeBtn = document.getElementById('clipart-close-x');
        if (closeBtn) closeBtn.onclick = () => DialogSystem.close();

        const btnOk = document.getElementById('clipart-btn-ok');
        const btnCancel = document.getElementById('clipart-btn-cancel');

        if (btnCancel) btnCancel.onclick = () => DialogSystem.close();
        if (btnOk) {
            btnOk.onclick = () => {
                if (selectedFilename) {
                    DialogSystem.close();
                    if(window.insertSmartImage) {
                        window.insertSmartImage(highResBaseUrl + selectedFilename, thumbBaseUrl + selectedFilename);
                    } else {
                        DialogSystem.alert('Error', 'Image insertion function not found.');
                    }
                }
            };
        }

        // We can create the empty divs in one go, 3400 divs is fast enough (~10ms)
        const fragment = document.createDocumentFragment();
        const allCards = [];
        
        // Create a shuffled copy of the library so it's different every time
        const shuffledLibrary = [...webClipartLibrary];
        for (let i = shuffledLibrary.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledLibrary[i], shuffledLibrary[j]] = [shuffledLibrary[j], shuffledLibrary[i]];
        }
        
        for (let i = 0; i < shuffledLibrary.length; i++) {
            const filename = shuffledLibrary[i];
            
            // Clean up the filename to create a human-readable custom name for tags
            let customName = filename.replace(/\.png$/i, '');
            customName = customName.replace(/-\d+$/, ''); // Remove trailing ID numbers
            customName = customName.replace(/_PNG_Clip_Art|_PNG_Clipart|_PNG_Image|_Clip_Art_PNG_Image|_Clip_Art|_Clipart|_PNG/gi, '');
            customName = customName.replace(/_/g, ' ');
            customName = customName.trim();

            const card = document.createElement('div');
            card.className = 'clipart-card';
            card.dataset.filename = filename;
            card.dataset.customName = customName.toLowerCase();
            card.title = customName; // Use custom name as hover tooltip
            
            card.onclick = () => {
                if (selectedElement) selectedElement.classList.remove('selected');
                card.classList.add('selected');
                selectedElement = card;
                selectedFilename = filename;
                if (btnOk) btnOk.disabled = false;
            };

            card.ondblclick = () => {
                DialogSystem.close();
                if(window.insertSmartImage) {
                    window.insertSmartImage(highResBaseUrl + filename, thumbBaseUrl + filename);
                } else {
                    DialogSystem.alert('Error', 'Image insertion function not found.');
                }
            };
            
            observer.observe(card);
            fragment.appendChild(card);
            allCards.push(card);
        }
        grid.appendChild(fragment);

        // Search Bar Logic
        const searchInput = document.getElementById('clipart-search-input');
        if (searchInput) {
            searchInput.oninput = (e) => {
                const query = e.target.value.toLowerCase().trim();
                const terms = query.split(' ').filter(t => t.length > 0);
                
                allCards.forEach(card => {
                    if (terms.length === 0) {
                        card.style.display = 'flex';
                        return;
                    }
                    const name = card.dataset.customName;
                    const matches = terms.every(term => name.includes(term));
                    card.style.display = matches ? 'flex' : 'none';
                });
            };
        }
    }, 10);
};
