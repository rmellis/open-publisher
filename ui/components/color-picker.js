window.CustomColorPicker = class CustomColorPicker {
    static init() {
        this.el = document.getElementById('custom-color-picker');
        this.themeGrid = document.getElementById('ccp-theme-colors');
        this.standardGrid = document.getElementById('ccp-standard-colors');
        this.recentGrid = document.getElementById('ccp-recent-colors');
        this.hexInput = document.getElementById('custom-color-hex');
        this.rgbInputs = {
            r: document.getElementById('custom-color-r'),
            g: document.getElementById('custom-color-g'),
            b: document.getElementById('custom-color-b')
        };
        this.previewSwatch = document.getElementById('ccp-preview-swatch');
        this.eyedropperBtn = document.getElementById('ccp-eyedropper');
        
        // Tab elements
        this.tabs = document.querySelectorAll('.ccp-tab');
        this.tabContents = document.querySelectorAll('.ccp-tab-content');
        
        // Canvas elements
        this.svCanvas = document.getElementById('ccp-sv-canvas');
        this.hueCanvas = document.getElementById('ccp-hue-canvas');
        this.svCursor = document.getElementById('ccp-sv-cursor');
        this.hueCursor = document.getElementById('ccp-hue-cursor');
        
        if (!this.el) return;
        
        // Colors arrays
        this.themeColors = [
            '#ffffff', '#000000', '#f4f5f7', 'var(--ui-theme-color)', '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#34495e',
            '#f2f2f2', '#333333', '#e0e3e8', '#00a89d', '#f1948a', '#85c1e9', '#82e0aa', '#f7dc6f', '#c39bd3', '#85929e',
            '#cccccc', '#222222', '#b0b5be', '#004a46', '#b03a2e', '#21618c', '#1e8449', '#b7950b', '#6c3483', '#212f3c'
        ];
        this.standardColors = [
            '#ff0000', '#ff5733', '#ffc300', '#daf7a6', '#28b463', '#1abc9c', '#3498db', '#2980b9', '#8e44ad', '#839192',
            '#c0392b', '#d35400', '#f39c12', '#aed6f1', '#2ecc71', '#16a085', '#2e86c1', '#2471a3', '#9b59b6', '#7f8c8d',
            '#922b21', '#ba4a00', '#d68910', '#5dade2', '#27ae60', '#117864', '#2874a6', '#1f618d', '#76448a', '#707b7c',
            '#7b241c', '#a04000', '#b9770e', '#3498db', '#229954', '#0e6655', '#21618c', '#1a5276', '#633974', '#616a6b',
            '#641e16', '#873600', '#9c640c', '#2e86c1', '#1d8348', '#0b5345', '#1b4f72', '#154360', '#512e5f', '#515a5a'
        ];
        this.recentColors = ['var(--ui-theme-color)', '#ffffff', '#000000', '#e74c3c', '#3498db', '#f1c40f'];
        
        this.renderSwatches(this.themeGrid, this.themeColors);
        this.renderSwatches(this.standardGrid, this.standardColors);
        this.renderSwatches(this.recentGrid, this.recentColors);
        
        // Hide eyedropper if not supported
        if (!window.EyeDropper && this.eyedropperBtn) {
            this.eyedropperBtn.style.display = 'none';
        }
        
        // State
        this.isOpen = false;
        this.callback = null;
        this.anchor = null;
        this.currentColor = '#000000';
        this.hsv = { h: 0, s: 0, v: 0 };
        
        this.bindEvents();
        this.initCanvases();
    }
    
    static bindEvents() {
        // Prevent clicking inside the color picker from bubbling up and closing parent dropdowns
        this.el.addEventListener('mousedown', (e) => e.stopPropagation());

        // Hex input
        this.hexInput.addEventListener('change', (e) => this.setFromHex(e.target.value, true));
        this.hexInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.setFromHex(e.target.value, true);
                this.selectColor(this.currentColor);
            }
        });

        // RGB inputs
        const updateFromRgb = () => {
            let r = parseInt(this.rgbInputs.r.value) || 0;
            let g = parseInt(this.rgbInputs.g.value) || 0;
            let b = parseInt(this.rgbInputs.b.value) || 0;
            r = Math.max(0, Math.min(255, r));
            g = Math.max(0, Math.min(255, g));
            b = Math.max(0, Math.min(255, b));
            const hex = '#' + [r, g, b].map(x => {
                const h = x.toString(16);
                return h.length === 1 ? '0' + h : h;
            }).join('');
            this.setFromHex(hex, true);
        };
        ['r', 'g', 'b'].forEach(ch => {
            if (this.rgbInputs[ch]) {
                this.rgbInputs[ch].addEventListener('change', updateFromRgb);
                this.rgbInputs[ch].addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        updateFromRgb();
                        this.selectColor(this.currentColor);
                    }
                });
            }
        });
        
        // Eyedropper API
        if (this.eyedropperBtn) {
            this.eyedropperBtn.addEventListener('click', async () => {
                if (window.EyeDropper) {
                    const eyeDropper = new EyeDropper();
                    try {
                        const result = await eyeDropper.open();
                        this.setFromHex(result.sRGBHex, true);
                        this.selectColor(result.sRGBHex);
                    } catch (e) {
                        // user canceled
                    }
                }
            });
        }
        
        // Tabs
        this.tabs.forEach(tab => {
            tab.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.tabs.forEach(t => t.classList.remove('active'));
                this.tabContents.forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('ccp-tab-' + tab.dataset.tab).classList.add('active');
            });
        });
        
        // Dragging state
        let isDraggingSV = false;
        let isDraggingHue = false;
        
        const updateSV = (e) => {
            if (!isDraggingSV) return;
            const rect = this.svCanvas.getBoundingClientRect();
            let x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            let y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
            this.hsv.s = x / rect.width;
            this.hsv.v = 1 - (y / rect.height);
            this.updateFromHSV();
        };
        
        const updateHue = (e) => {
            if (!isDraggingHue) return;
            const rect = this.hueCanvas.getBoundingClientRect();
            let y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
            this.hsv.h = 360 - ((y / rect.height) * 360);
            if (this.hsv.h === 360) this.hsv.h = 0;
            this.updateFromHSV();
        };
        
        this.svCanvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDraggingSV = true;
            updateSV(e);
        });
        this.hueCanvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDraggingHue = true;
            updateHue(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDraggingSV) updateSV(e);
            if (isDraggingHue) updateHue(e);
        });
        
        document.addEventListener('mouseup', () => {
            isDraggingSV = false;
            isDraggingHue = false;
        });
        
        // Click outside to close
        document.addEventListener('mousedown', (e) => {
            if (this.isOpen && !this.el.contains(e.target) && this.anchor && !this.anchor.contains(e.target)) {
                this.close();
            }
        });
    }
    
    static initCanvases() {
        // Draw Hue Canvas (static)
        const ctx = this.hueCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, this.hueCanvas.height);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(1/6, '#ff00ff');
        gradient.addColorStop(2/6, '#0000ff');
        gradient.addColorStop(3/6, '#00ffff');
        gradient.addColorStop(4/6, '#00ff00');
        gradient.addColorStop(5/6, '#ffff00');
        gradient.addColorStop(1, '#ff0000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.hueCanvas.width, this.hueCanvas.height);
    }
    
    static renderSVCanvas() {
        const ctx = this.svCanvas.getContext('2d');
        const w = this.svCanvas.width;
        const h = this.svCanvas.height;
        
        // Base hue color
        ctx.fillStyle = `hsl(${this.hsv.h}, 100%, 50%)`;
        ctx.fillRect(0, 0, w, h);
        
        // White gradient
        const whiteGrad = ctx.createLinearGradient(0, 0, w, 0);
        whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
        whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = whiteGrad;
        ctx.fillRect(0, 0, w, h);
        
        // Black gradient
        const blackGrad = ctx.createLinearGradient(0, 0, 0, h);
        blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
        blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = blackGrad;
        ctx.fillRect(0, 0, w, h);
    }
    
    static updateFromHSV() {
        this.renderSVCanvas();
        this.currentColor = this.hsvToHex(this.hsv.h, this.hsv.s, this.hsv.v);
        this.hexInput.value = this.currentColor;
        this.updateRgbInputs(this.currentColor);
        this.previewSwatch.style.backgroundColor = this.currentColor;
        this.updateCursors();
        
        if (this.callback) this.callback(this.currentColor);
    }
    
    static setFromHex(hex, updateCursors = true) {
        if (!/^#[0-9A-Fa-f]{6}$/i.test(hex)) return;
        this.currentColor = hex.toLowerCase();
        this.previewSwatch.style.backgroundColor = this.currentColor;
        this.hexInput.value = this.currentColor;
        this.updateRgbInputs(this.currentColor);
        
        if (updateCursors) {
            this.hsv = this.hexToHsv(this.currentColor);
            this.renderSVCanvas();
            this.updateCursors();
        }
    }

    static updateRgbInputs(hex) {
        if (!this.rgbInputs || !this.rgbInputs.r) return;
        this.rgbInputs.r.value = parseInt(hex.substring(1,3), 16);
        this.rgbInputs.g.value = parseInt(hex.substring(3,5), 16);
        this.rgbInputs.b.value = parseInt(hex.substring(5,7), 16);
    }
    
    static updateCursors() {
        const svX = this.hsv.s * this.svCanvas.width;
        const svY = (1 - this.hsv.v) * this.svCanvas.height;
        this.svCursor.style.left = svX + 'px';
        this.svCursor.style.top = svY + 'px';
        
        const hueY = (1 - (this.hsv.h / 360)) * this.hueCanvas.height;
        this.hueCursor.style.top = hueY + 'px';
    }
    
    static hsvToHex(h, s, v) {
        let r, g, b;
        let i = Math.floor(h / 60);
        let f = h / 60 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        const toHex = x => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    
    static hexToHsv(hex) {
        let r = parseInt(hex.substring(1,3), 16) / 255;
        let g = parseInt(hex.substring(3,5), 16) / 255;
        let b = parseInt(hex.substring(5,7), 16) / 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;
        let d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s, v: v };
    }
    
    static renderSwatches(container, colors) {
        container.innerHTML = '';
        colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.title = color;
            swatch.onmousedown = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.setFromHex(color);
                this.selectColor(color);
            };
            container.appendChild(swatch);
        });
    }
    
    static open(anchorElement, initialColor, callback) {
        this.anchor = anchorElement;
        this.callback = callback;
        
        let validInitial = initialColor && /^#[0-9A-Fa-f]{6}$/i.test(initialColor) ? initialColor : '#000000';
        this.setFromHex(validInitial, true);
        
        this.el.style.display = 'block';
        this.isOpen = true;
        
        const rect = anchorElement.getBoundingClientRect();
        let top = rect.bottom + window.scrollY + 5;
        let left = rect.left + window.scrollX;
        
        if (left + this.el.offsetWidth > window.innerWidth) {
            left = window.innerWidth - this.el.offsetWidth - 10;
        }
        if (top + this.el.offsetHeight > window.innerHeight) {
            top = rect.top + window.scrollY - this.el.offsetHeight - 5;
        }
        
        this.el.style.top = top + 'px';
        this.el.style.left = left + 'px';
    }
    
    static close() {
        this.el.style.display = 'none';
        this.isOpen = false;
        this.anchor = null;
        this.callback = null;
    }
    
    static selectColor(color) {
        // Update recent colors array
        const lowercaseColor = color.toLowerCase();
        const index = this.recentColors.indexOf(lowercaseColor);
        if (index > -1) {
            this.recentColors.splice(index, 1);
        }
        this.recentColors.unshift(lowercaseColor);
        if (this.recentColors.length > 10) {
            this.recentColors.pop();
        }
        this.renderSwatches(this.recentGrid, this.recentColors);

        if (this.callback) {
            this.callback(color);
        }
        this.close();
    }
};


window.toggleColorModel = function(model) {
    const paper = document.getElementById('paper');
    if (model === 'CMYK') {
        paper.classList.add('cmyk-mode');
    } else {
        paper.classList.remove('cmyk-mode');
    }
};

