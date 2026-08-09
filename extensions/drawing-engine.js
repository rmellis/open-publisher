(function installDrawingEngine() {
    let currentTool = null;
    let currentColor = '#000000';
    let isDrawingMode = false;
    let drawingCanvas = null;
    let drawingCtx = null;
    let isMouseDown = false;
    let lastX = 0;
    let lastY = 0;
    let editingElement = null;
    let currentBrushSize = 2;
    let undoStack = [];

    window.isDrawingModeActive = function() { return isDrawingMode; };

    window.startDrawing = function(tool) {
        currentTool = tool;
        if (!isDrawingMode) {
            enterDrawingMode();
        }
        
        // Update UI
        document.querySelectorAll('.drawing-tool-btn').forEach(btn => {
            if (btn.dataset.tool === tool) {
                btn.style.backgroundColor = '#e0f2f1';
                btn.style.borderColor = 'var(--ui-theme-color)';
                btn.style.borderRadius = '4px';
            } else {
                btn.style.backgroundColor = '';
                btn.style.borderColor = 'transparent';
                btn.style.borderRadius = '';
            }
        });
        document.querySelectorAll('.finish-drawing-btn').forEach(btn => btn.style.display = 'flex');
        
        // Set cursor
        if (drawingCanvas) {
            if (tool === 'pencil' || tool === 'brush') {
                drawingCanvas.style.cursor = 'crosshair';
            } else if (tool === 'eraser') {
                drawingCanvas.style.cursor = 'cell';
            } else if (tool === 'spray') {
                drawingCanvas.style.cursor = 'alias';
            }
        }
    };

    window.updateDrawingColor = function(color) {
        currentColor = color;
        document.querySelectorAll('.drawing-color-picker').forEach(picker => picker.value = color);
    };

    window.updateDrawingSize = function(size) {
        currentBrushSize = parseInt(size, 10);
        const percent = ((size - 1) / 49) * 100;
        document.querySelectorAll('.drawing-size-slider').forEach(slider => {
            slider.value = size;
            slider.style.background = `linear-gradient(to right, var(--ui-theme-dark) ${percent}%, #f3f2f1 ${percent}%)`;
        });
    };

    window.undoDrawing = function() {
        if (!isDrawingMode || undoStack.length === 0) return;
        const lastState = undoStack.pop();
        const img = new Image();
        img.onload = function() {
            drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            drawingCtx.drawImage(img, 0, 0);
        };
        img.src = lastState;
    };

    function enterDrawingMode(existingLayerData = null, el = null) {
        isDrawingMode = true;
        undoStack = [];
        editingElement = el;
        const paper = document.getElementById('paper');
        
        drawingCanvas = document.createElement('canvas');
        drawingCanvas.id = 'drawing-overlay-canvas';
        drawingCanvas.width = paper.offsetWidth;
        drawingCanvas.height = paper.offsetHeight;
        drawingCanvas.style.position = 'absolute';
        drawingCanvas.style.top = '0';
        drawingCanvas.style.left = '0';
        drawingCanvas.style.zIndex = '999999';
        drawingCanvas.style.cursor = 'crosshair';
        
        drawingCtx = drawingCanvas.getContext('2d');
        
        if (existingLayerData) {
            const img = new Image();
            img.onload = () => {
                drawingCtx.drawImage(img, 0, 0);
            };
            img.src = existingLayerData;
        }

        paper.appendChild(drawingCanvas);
        
        // Events
        drawingCanvas.addEventListener('mousedown', onMouseDown);
        drawingCanvas.addEventListener('mousemove', onMouseMove);
        drawingCanvas.addEventListener('mouseup', onMouseUp);
        drawingCanvas.addEventListener('mouseleave', onMouseUp);
        
        // Prevent default touch dragging
        drawingCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); onMouseDown(e.touches[0]); }, {passive: false});
        drawingCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); onMouseMove(e.touches[0]); }, {passive: false});
        drawingCanvas.addEventListener('touchend', onMouseUp);
    }

    function getScale() {
        return (typeof state !== 'undefined' && state.zoom) ? state.zoom : 1; 
    }

    function onMouseDown(e) {
        isMouseDown = true;
        
        if (drawingCanvas) {
            undoStack.push(drawingCanvas.toDataURL());
            if (undoStack.length > 20) undoStack.shift();
        }
        
        const rect = drawingCanvas.getBoundingClientRect();
        lastX = (e.clientX - rect.left) / getScale();
        lastY = (e.clientY - rect.top) / getScale();
        draw(e);
    }
    
    function onMouseMove(e) {
        if (!isMouseDown) return;
        draw(e);
    }
    
    function onMouseUp() {
        isMouseDown = false;
        drawingCtx.beginPath();
    }

    function draw(e) {
        const rect = drawingCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / getScale();
        const y = (e.clientY - rect.top) / getScale();

        if (currentTool === 'pencil') {
            drawingCtx.lineCap = 'square';
            drawingCtx.lineJoin = 'miter';
        } else {
            drawingCtx.lineCap = 'round';
            drawingCtx.lineJoin = 'round';
        }
        
        if (currentTool === 'eraser') {
            drawingCtx.globalCompositeOperation = 'destination-out';
            drawingCtx.lineWidth = currentBrushSize * 10;
            drawingCtx.beginPath();
            drawingCtx.moveTo(lastX, lastY);
            drawingCtx.lineTo(x, y);
            drawingCtx.stroke();
            drawingCtx.globalCompositeOperation = 'source-over';
        } else if (currentTool === 'spray') {
            drawingCtx.fillStyle = currentColor;
            const density = currentBrushSize * 10;
            const radius = currentBrushSize * 7.5;
            for (let i = 0; i < density; i++) {
                const offsetX = (Math.random() * radius * 2) - radius;
                const offsetY = (Math.random() * radius * 2) - radius;
                if (offsetX*offsetX + offsetY*offsetY <= radius*radius) {
                    drawingCtx.fillRect(x + offsetX, y + offsetY, 1, 1);
                }
            }
        } else {
            // Pencil or Brush
            drawingCtx.globalCompositeOperation = 'source-over';
            drawingCtx.strokeStyle = currentColor;
            drawingCtx.lineWidth = currentTool === 'brush' ? currentBrushSize * 4 : currentBrushSize;
            drawingCtx.beginPath();
            drawingCtx.moveTo(lastX, lastY);
            drawingCtx.lineTo(x, y);
            drawingCtx.stroke();
        }

        lastX = x;
        lastY = y;
    }

    window.finishDrawing = function() {
        if (!isDrawingMode) return;
        
        // 1. Get raw layer data for state preservation
        const rawLayerData = drawingCanvas.toDataURL('image/png');
        
        // 2. Crop to bounding box
        const width = drawingCanvas.width;
        const height = drawingCanvas.height;
        const imgData = drawingCtx.getImageData(0, 0, width, height);
        const data = imgData.data;
        
        let minX = width, minY = height, maxX = 0, maxY = 0;
        let hasPixels = false;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alpha = data[(y * width + x) * 4 + 3];
                if (alpha > 0) {
                    hasPixels = true;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        
        // Cleanup UI
        drawingCanvas.remove();
        drawingCanvas = null;
        isDrawingMode = false;
        currentTool = null;
        document.querySelectorAll('.finish-drawing-btn').forEach(btn => btn.style.display = 'none');
        document.querySelectorAll('.drawing-tool-btn').forEach(btn => {
            btn.style.backgroundColor = '';
            btn.style.borderColor = 'transparent';
        });

        if (!hasPixels) {
            if (editingElement) {
                editingElement.remove(); // they erased everything
                if (typeof pushHistory === 'function') pushHistory();
            }
            return;
        }
        
        // Add padding to crop
        minX = Math.max(0, minX - 5);
        minY = Math.max(0, minY - 5);
        maxX = Math.min(width, maxX + 5);
        maxY = Math.min(height, maxY + 5);
        
        const cropW = maxX - minX;
        const cropH = maxY - minY;
        
        const offscreen = document.createElement('canvas');
        offscreen.width = cropW;
        offscreen.height = cropH;
        const offCtx = offscreen.getContext('2d');
        offCtx.putImageData(drawingCtx.getImageData(minX, minY, cropW, cropH), 0, 0);
        
        const finalDataUrl = offscreen.toDataURL('image/png');
        
        if (editingElement) {
            const img = editingElement.querySelector('img');
            img.src = finalDataUrl;
            editingElement.style.left = minX + 'px';
            editingElement.style.top = minY + 'px';
            editingElement.style.width = cropW + 'px';
            editingElement.style.height = cropH + 'px';
            editingElement.dataset.drawingLayer = rawLayerData;
            editingElement.style.display = 'block';
            if (typeof selectElement === 'function') selectElement(editingElement);
        } else {
            const el = document.createElement('div');
            el.className = 'pub-element';
            el.dataset.type = 'drawing';
            el.dataset.drawingLayer = rawLayerData;
            el.style.left = minX + 'px';
            el.style.top = minY + 'px';
            el.style.width = cropW + 'px';
            el.style.height = cropH + 'px';
            el.style.zIndex = 10;
            el.setAttribute('data-scaleX', "1");
            el.setAttribute('data-scaleY', "1");
            
            el.innerHTML = `
                <div class="element-content">
                    <img src="${finalDataUrl}" draggable="false" style="width: 100%; height: 100%; object-fit: fill; display: block; position: absolute; top: 0; left: 0;">
                </div>
                <div class="resize-handle rh-nw" data-dir="nw"></div>
                <div class="resize-handle rh-n" data-dir="n"></div>
                <div class="resize-handle rh-ne" data-dir="ne"></div>
                <div class="resize-handle rh-e" data-dir="e"></div>
                <div class="resize-handle rh-se" data-dir="se"></div>
                <div class="resize-handle rh-s" data-dir="s"></div>
                <div class="resize-handle rh-sw" data-dir="sw"></div>
                <div class="resize-handle rh-w" data-dir="w"></div>
                <div class="rotate-stick"></div>
                <div class="rotate-handle"></div>
            `;
            
            const paper = document.getElementById('paper');
            if (paper) paper.appendChild(el);
            if (typeof selectElement === 'function') selectElement(el);
        }
        
        if (typeof pushHistory === 'function') pushHistory();
    };

    // Global Double-click listener to re-edit drawings
    document.addEventListener('dblclick', function(e) {
        const el = e.target.closest('.pub-element');
        if (el && el.dataset.drawingLayer) {
            if (typeof switchTab === 'function') switchTab('insert');
            el.style.display = 'none'; // hide while editing
            enterDrawingMode(el.dataset.drawingLayer, el);
            startDrawing('pencil');
        }
    });


    // Auto-exit Drawing Mode when clicking away (e.g., other ribbon tools or tabs)
    document.addEventListener('mousedown', function(e) {
        if (!isDrawingMode) return;
        if (e.target === drawingCanvas) return;
        
        const drawingGroup = e.target.closest('.drawing-tools-group');
        // If the user clicked inside any drawing tools group (color picker, brushes, etc), don't exit
        if (drawingGroup) return;
        
        // They clicked outside the canvas and outside the drawing tools. Auto-finish!
        finishDrawing();
    });
    
    // Global Ctrl+Z listener for Undo Drawing
    document.addEventListener('keydown', function(e) {
        if (isDrawingMode && (e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
            e.preventDefault();
            if (typeof undoDrawing === 'function') undoDrawing();
        }
    });

})();
