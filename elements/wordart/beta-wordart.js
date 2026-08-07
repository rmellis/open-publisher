/* =========================================================================
   ADD-ON: WORDART ENGINE v6.0 (Screenshot UI Match, 200 Styles, Select Logic)
   Bakes complex text effects into pure PNG images. Matches the native UI 
   banner design, makes modal smoothly draggable, and fixes the Arch-Down bug.
   ========================================================================= */
(function installBetaWordArtV6() {
    console.log("🛠️ WordArt Engine v6.0 (Native UI & 200 Styles) initializing...");

    // 1. (Native Ribbon UI defined in index.html)

    // 2. The Core Canvas Rendering Engine
    const generateWordArtPNG = async (text, styleId) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const baseFont = '900 130px "Arial Black", Impact, sans-serif';
            ctx.font = baseFont;
            
            const totalWidth = ctx.measureText(text).width;
            
            // Defines which styles render on a curve (Arch Up / Arch Down) or Circle
            const archUpStyles = [5, 19, 30, 37, 45, 51, 62, 73, 87, 97, 105, 112, 125, 137, 145, 158, 163, 172, 188, 199];
            const archDownStyles = [6, 20, 38, 50, 61, 74, 89, 98, 108, 115, 128, 140, 150, 160, 175, 185, 195, 200];
            const circleStyles = [41, 138, 170, 203, 214]; // New circular styles
            const wavyStyles = [8, 25, 26, 39, 44, 63, 68, 77, 82, 88, 91, 117, 127, 131, 132, 161, 187, 191];
            const zigzagStyles = [112, 120, 124, 134, 140, 152, 162];
            const triangleStyles = [166, 174, 178, 180, 184, 192, 198];
            const isArchUp = archUpStyles.includes(styleId);
            const isArchDown = archDownStyles.includes(styleId);
            const isCircle = circleStyles.includes(styleId);
            const isWavy = wavyStyles.includes(styleId);
            const isZigZag = zigzagStyles.includes(styleId);
            const isTriangle = triangleStyles.includes(styleId);
            const isCurved = (isArchUp || isArchDown) && !isWavy && !isCircle && !isZigZag && !isTriangle;
            
            let cWidth = totalWidth + 260;
            let cHeight = 360; 
            let actualRadius = 0;
            let angleSpan = 0;
            let arcCenterY = 0;

            if (isCircle) {
                actualRadius = Math.max(150, totalWidth / (Math.PI * 1.5));
                angleSpan = Math.PI * 2;
                cWidth = (actualRadius * 2) + 300;
                cHeight = (actualRadius * 2) + 300;
                canvas.width = cWidth;
                canvas.height = cHeight;
                arcCenterY = cHeight / 2;
            } else if (isWavy) {
                cWidth = totalWidth + 280;
                cHeight = 400;
                canvas.width = cWidth;
                canvas.height = cHeight;
                arcCenterY = cHeight / 2;
            } else if (isZigZag || isTriangle) {
                cWidth = totalWidth + 280;
                cHeight = 480;
                canvas.width = cWidth;
                canvas.height = cHeight;
                arcCenterY = cHeight / 2;
            } else if (isCurved) {
                actualRadius = Math.max(250, totalWidth / (Math.PI * 0.7)); 
                angleSpan = totalWidth / actualRadius;
                
                const sagitta = actualRadius * (1 - Math.cos(angleSpan / 2));
                
                cWidth = (2 * actualRadius * Math.sin(angleSpan / 2)) + 280;
                cHeight = sagitta + 360; 
                
                canvas.width = cWidth;
                canvas.height = cHeight;
                
                const cy = cHeight / 2;
                const midpointOffset = (actualRadius + actualRadius * Math.cos(angleSpan / 2)) / 2;
                arcCenterY = isArchUp ? (cy + midpointOffset) : (cy - midpointOffset);
            } else {
                canvas.width = cWidth;
                canvas.height = cHeight;
            }
            
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.lineJoin = 'round';
            ctx.miterLimit = 2;

            const drawLayers = (layers, yOffset = 0) => {
                layers.forEach(layer => {
                    ctx.font = layer.font || baseFont;
                    
                    if (layer.shadow) {
                        ctx.shadowColor = layer.shadow.color; ctx.shadowBlur = layer.shadow.blur;
                        ctx.shadowOffsetX = layer.shadow.x; ctx.shadowOffsetY = layer.shadow.y;
                    } else { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }

                    if (layer.stroke) {
                        ctx.strokeStyle = layer.stroke.color; ctx.lineWidth = layer.stroke.width;
                        ctx.strokeText(text, cx + (layer.ox||0), cy + yOffset + (layer.oy||0));
                    }
                    
                    if (layer.fill) {
                        let fillStyle = layer.fill;
                        if (layer.gradient) {
                            const grad = ctx.createLinearGradient(0, cy - 80, 0, cy + 80);
                            layer.gradient.forEach(stop => grad.addColorStop(stop.pos, stop.color));
                            fillStyle = grad;
                        }
                        ctx.fillStyle = fillStyle;
                        ctx.fillText(text, cx + (layer.ox||0), cy + yOffset + (layer.oy||0));
                    }
                });
            };

            const drawCurved = (layers) => {
                layers.forEach(layer => {
                    ctx.save();
                    ctx.font = layer.font || baseFont;
                    
                    if (layer.shadow) {
                        ctx.shadowColor = layer.shadow.color; ctx.shadowBlur = layer.shadow.blur;
                        ctx.shadowOffsetX = layer.shadow.x; ctx.shadowOffsetY = layer.shadow.y;
                    } else { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }
                    
                    let fillStyle = layer.fill;
                    if (layer.gradient) {
                        const grad = ctx.createLinearGradient(0, -100, 0, 100);
                        layer.gradient.forEach(stop => grad.addColorStop(stop.pos, stop.color));
                        fillStyle = grad;
                    }

                    let currentPos = 0;
                    for (let i = 0; i < text.length; i++) {
                        const char = text[i];
                        const charWidth = ctx.measureText(char).width;
                        const progress = (currentPos + (charWidth / 2)) / totalWidth;
                        
                        ctx.save();
                        ctx.translate(cx, arcCenterY);
                        
                        const angle = isArchUp 
                            ? (-angleSpan / 2) + (progress * angleSpan) 
                            : (angleSpan / 2) - (progress * angleSpan);
                            
                        ctx.rotate(angle);
                        ctx.translate(0, isArchUp ? -actualRadius : actualRadius);
                        
                        if (layer.stroke) {
                            ctx.strokeStyle = layer.stroke.color; ctx.lineWidth = layer.stroke.width;
                            ctx.strokeText(char, 0, 0); 
                        }
                        if (layer.fill) {
                            ctx.fillStyle = fillStyle;
                            ctx.fillText(char, 0, 0);
                        }
                        ctx.restore();
                        currentPos += charWidth;
                    }
                    ctx.restore();
                });
            };

            const drawWavy = (layers) => {
                const waveFrequency = 0.012;
                const waveAmplitude = 45;
                layers.forEach(layer => {
                    ctx.save();
                    ctx.font = layer.font || baseFont;
                    
                    if (layer.shadow) {
                        ctx.shadowColor = layer.shadow.color; ctx.shadowBlur = layer.shadow.blur;
                        ctx.shadowOffsetX = layer.shadow.x; ctx.shadowOffsetY = layer.shadow.y;
                    } else { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }
                    
                    let fillStyle = layer.fill;
                    if (layer.gradient) {
                        const grad = ctx.createLinearGradient(0, -waveAmplitude, 0, waveAmplitude);
                        layer.gradient.forEach(stop => grad.addColorStop(stop.pos, stop.color));
                        fillStyle = grad;
                    }

                    let currentPos = 0;
                    for (let i = 0; i < text.length; i++) {
                        const char = text[i];
                        const charWidth = ctx.measureText(char).width;
                        const progressX = currentPos + (charWidth / 2);
                        
                        ctx.save();
                        const startX = (cWidth - totalWidth) / 2;
                        const x = startX + progressX;
                        const y = arcCenterY + Math.sin(progressX * waveFrequency) * waveAmplitude;
                        
                        ctx.translate(x, y);
                        const angle = Math.cos(progressX * waveFrequency) * waveAmplitude * waveFrequency;
                        ctx.rotate(angle);
                        
                        if (layer.stroke) {
                            ctx.strokeStyle = layer.stroke.color; ctx.lineWidth = layer.stroke.width;
                            ctx.strokeText(char, 0, 0); 
                        }
                        if (layer.fill) {
                            ctx.fillStyle = fillStyle;
                            ctx.fillText(char, 0, 0);
                        }
                        ctx.restore();
                        currentPos += charWidth;
                    }
                    ctx.restore();
                });
            };

            const drawZigZag = (layers) => {
                const waveFrequency = 0.02;
                const waveAmplitude = 40;
                layers.forEach(layer => {
                    ctx.save();
                    ctx.font = layer.font || baseFont;
                    if (layer.shadow) {
                        ctx.shadowColor = layer.shadow.color; ctx.shadowBlur = layer.shadow.blur;
                        ctx.shadowOffsetX = layer.shadow.x; ctx.shadowOffsetY = layer.shadow.y;
                    }
                    let fillStyle = layer.fill;
                    if (layer.gradient) {
                        const grad = ctx.createLinearGradient(0, -waveAmplitude, 0, waveAmplitude);
                        layer.gradient.forEach(stop => grad.addColorStop(stop.pos, stop.color));
                        fillStyle = grad;
                    }
                    let currentPos = 0;
                    for (let i = 0; i < text.length; i++) {
                        const char = text[i];
                        const charWidth = ctx.measureText(char).width;
                        const progressX = currentPos + (charWidth / 2);
                        
                        const period = Math.PI * 2 / waveFrequency;
                        const phase = (progressX % period) / period;
                        let y = 0;
                        let slope = 1;
                        if (phase < 0.25) { y = phase * 4 * waveAmplitude; slope = 1; }
                        else if (phase < 0.75) { y = (0.5 - (phase - 0.25) * 4) * waveAmplitude; slope = -1; }
                        else { y = (phase - 0.75) * 4 * waveAmplitude - waveAmplitude; slope = 1; }
                        
                        ctx.save();
                        const x = ((cWidth - totalWidth) / 2) + progressX;
                        ctx.translate(x, arcCenterY + y);
                        const angle = Math.atan(slope * 4 * waveAmplitude / period);
                        ctx.rotate(angle * 0.5);
                        
                        if (layer.stroke) {
                            ctx.strokeStyle = layer.stroke.color; ctx.lineWidth = layer.stroke.width;
                            ctx.strokeText(char, 0, 0); 
                        }
                        if (layer.fill) {
                            ctx.fillStyle = fillStyle;
                            ctx.fillText(char, 0, 0);
                        }
                        ctx.restore();
                        currentPos += charWidth;
                    }
                    ctx.restore();
                });
            };

            const drawTriangle = (layers) => {
                const amplitude = 100;
                layers.forEach(layer => {
                    ctx.save();
                    ctx.font = layer.font || baseFont;
                    if (layer.shadow) {
                        ctx.shadowColor = layer.shadow.color; ctx.shadowBlur = layer.shadow.blur;
                        ctx.shadowOffsetX = layer.shadow.x; ctx.shadowOffsetY = layer.shadow.y;
                    }
                    let fillStyle = layer.fill;
                    let currentPos = 0;
                    for (let i = 0; i < text.length; i++) {
                        const char = text[i];
                        const charWidth = ctx.measureText(char).width;
                        const progressX = currentPos + (charWidth / 2);
                        const progress = progressX / totalWidth;
                        
                        let y = 0;
                        let slope = 1;
                        if (progress < 0.5) {
                            y = -progress * 2 * amplitude;
                            slope = -1;
                        } else {
                            y = -(1 - (progress - 0.5) * 2) * amplitude;
                            slope = 1;
                        }
                        
                        ctx.save();
                        const x = ((cWidth - totalWidth) / 2) + progressX;
                        ctx.translate(x, arcCenterY + y + (amplitude / 2));
                        const angle = Math.atan(slope * 2 * amplitude / totalWidth);
                        ctx.rotate(angle);
                        
                        if (layer.stroke) {
                            ctx.strokeStyle = layer.stroke.color; ctx.lineWidth = layer.stroke.width;
                            ctx.strokeText(char, 0, 0); 
                        }
                        if (layer.fill) {
                            ctx.fillStyle = fillStyle;
                            ctx.fillText(char, 0, 0);
                        }
                        ctx.restore();
                        currentPos += charWidth;
                    }
                    ctx.restore();
                });
            };

            const drawCircle = (layers) => {
                layers.forEach(layer => {
                    ctx.save();
                    ctx.font = layer.font || baseFont;
                    
                    if (layer.shadow) {
                        ctx.shadowColor = layer.shadow.color; ctx.shadowBlur = layer.shadow.blur;
                        ctx.shadowOffsetX = layer.shadow.x; ctx.shadowOffsetY = layer.shadow.y;
                    } else { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }
                    
                    let fillStyle = layer.fill;
                    if (layer.gradient) {
                        const grad = ctx.createLinearGradient(0, -actualRadius, 0, actualRadius);
                        layer.gradient.forEach(stop => grad.addColorStop(stop.pos, stop.color));
                        fillStyle = grad;
                    }

                    let currentPos = 0;
                    for (let i = 0; i < text.length; i++) {
                        const char = text[i];
                        const charWidth = ctx.measureText(char).width;
                        const progress = (currentPos + (charWidth / 2)) / totalWidth;
                        
                        ctx.save();
                        ctx.translate(cx, arcCenterY);
                        
                        // Rotate 360 degrees along the circle boundary starting from the top
                        const angle = -Math.PI + (progress * Math.PI * 2);
                        ctx.rotate(angle);
                        ctx.translate(0, -actualRadius);
                        
                        if (layer.stroke) {
                            ctx.strokeStyle = layer.stroke.color; ctx.lineWidth = layer.stroke.width;
                            ctx.strokeText(char, 0, 0); 
                        }
                        if (layer.fill) {
                            ctx.fillStyle = fillStyle;
                            ctx.fillText(char, 0, 0);
                        }
                        ctx.restore();
                        currentPos += charWidth;
                    }
                    ctx.restore();
                });
            };

            // Shared Gradients
            const gradChrome = [{pos:0, color:'#ffffff'}, {pos:0.45, color:'#60a5fa'}, {pos:0.5, color:'#1e3a8a'}, {pos:0.55, color:'#111827'}, {pos:1, color:'#e2e8f0'}];
            const gradRainbow = [{pos:0, color:'#ef4444'}, {pos:0.16, color:'#f97316'}, {pos:0.33, color:'#eab308'}, {pos:0.5, color:'#22c55e'}, {pos:0.66, color:'#3b82f6'}, {pos:0.83, color:'#8b5cf6'}, {pos:1, color:'#ec4899'}];
            const gradGold = [{pos:0, color:'#fef08a'}, {pos:0.33, color:'#d4af37'}, {pos:0.66, color:'#b45309'}, {pos:1, color:'#fde047'}];

            // --- 500 MASTER STYLES ---
            switch(styleId) {
                // (1-40: Original Set)
                case 1: drawLayers([{ stroke: {color: '#1e3a8a', width: 22}, fill: '#1e3a8a', ox: 6, oy: 6 }, { gradient: [{pos:0, color:'#fef08a'}, {pos:1, color:'#d97706'}], stroke: {color: '#0ea5e9', width: 5}, fill: 'grad' }]); break;
                case 2: drawLayers([{ gradient: [{pos:0, color:'#ffffff'}, {pos:0.45, color:'#9ca3af'}, {pos:0.5, color:'#4b5563'}, {pos:1, color:'#e2e8f0'}], stroke: {color: '#1f2937', width: 6}, fill: 'grad', shadow: {color: 'rgba(0,0,0,0.5)', blur: 10, x: 5, y: 8} }]); break;
                case 3: const grad3 = ctx.createLinearGradient(cx - (totalWidth/2), 0, cx + (totalWidth/2), 0); grad3.addColorStop(0, '#ef4444'); grad3.addColorStop(0.25, '#f59e0b'); grad3.addColorStop(0.5, '#10b981'); grad3.addColorStop(0.75, '#3b82f6'); grad3.addColorStop(1, '#8b5cf6'); drawLayers([{ fill: '#000000', ox: 10, oy: 10 }, { stroke: {color: '#ffffff', width: 6}, fill: grad3 }]); break;
                case 4: drawLayers([{ stroke: {color: '#000000', width: 40}, fill: 'transparent' }, { stroke: {color: '#ffffff', width: 12}, fill: 'transparent' }, { fill: '#ec4899' }]); break;
                case 5: drawCurved([{ stroke: {color: '#1e3a8a', width: 8}, fill: '#1e3a8a', shadow: {color: 'rgba(0,0,0,0.4)', blur: 8, x: 0, y: 6} }, { fill: '#3b82f6' }]); break;
                case 6: drawCurved([{ stroke: {color: '#064e3b', width: 8}, fill: '#064e3b', shadow: {color: 'rgba(0,0,0,0.4)', blur: 8, x: 0, y: 6} }, { fill: '#10b981' }]); break;
                case 7: drawLayers([{ stroke: {color: '#0ea5e9', width: 25}, fill: 'transparent', shadow: {color: '#0ea5e9', blur: 30, x: 0, y: 0}, font: '900 130px "Courier New", monospace' }, { stroke: {color: '#0ea5e9', width: 8}, fill: 'transparent', shadow: {color: '#0ea5e9', blur: 15, x: 0, y: 0}, font: '900 130px "Courier New", monospace' }, { fill: '#ffffff', font: '900 130px "Courier New", monospace' }]); break;
                case 8: drawWavy([{ stroke: {color: '#ec4899', width: 25}, fill: 'transparent', shadow: {color: '#ec4899', blur: 30, x: 0, y: 0} }, { fill: '#fff', stroke: {color: '#06b6d4', width: 4} }]); break;
                case 9: drawLayers([{ stroke: {color: '#854d0e', width: 14}, fill: '#713f12', ox: 6, oy: 6, shadow: {color: 'rgba(0,0,0,0.4)', blur: 8, x: 4, y: 4} }, { gradient: [{pos:0, color:'#fef08a'}, {pos:0.4, color:'#d4af37'}, {pos:0.6, color:'#b45309'}, {pos:1, color:'#fde047'}], stroke: {color: '#451a03', width: 4}, fill: 'grad' }]); break;
                case 10: drawLayers([{ stroke: {color: '#0f172a', width: 25}, fill: '#0f172a', shadow: {color: '#000', blur: 15, x: 10, y: 15} }, { gradient: gradChrome, fill: 'grad', stroke: {color: '#e2e8f0', width: 2} }]); break;
                case 11: drawLayers([{ stroke: {color: '#22c55e', width: 15}, fill: 'transparent', shadow: {color: '#22c55e', blur: 20, x: 0, y: 0}, font: '900 130px "Courier New", monospace' }, { fill: '#000000', font: '900 130px "Courier New", monospace' }, { fill: '#4ade80', font: '900 130px "Courier New", monospace' }]); break;
                case 12: drawLayers([{ stroke: {color: '#db2777', width: 30}, fill: 'transparent', shadow: {color: 'rgba(0,0,0,0.2)', blur: 10, x: 5, y: 5} }, { stroke: {color: '#ffffff', width: 12}, fill: 'transparent' }, { gradient: [{pos:0, color:'#fbcfe8'}, {pos:1, color:'#f472b6'}], fill: 'grad' }]); break;
                case 13: drawLayers([{ stroke: {color: '#581c87', width: 12}, fill: '#581c87', shadow: {color: 'rgba(0,0,0,0.4)', blur: 10, x: 0, y: 10} }, { gradient: [{pos:0, color:'#f43f5e'}, {pos:0.5, color:'#f97316'}, {pos:1, color:'#fef08a'}], stroke: {color: '#ffe4e6', width: 4}, fill: 'grad' }]); break;
                case 14: drawLayers([{ stroke: {color: '#064e3b', width: 25}, fill: '#064e3b' }, { stroke: {color: '#a7f3d0', width: 8}, fill: '#a7f3d0' }, { fill: '#10b981' }]); break;
                case 15: drawLayers([{ stroke: {color: '#1e3a8a', width: 15}, fill: '#1e3a8a', shadow: {color: 'rgba(0,0,0,0.5)', blur: 15, x: 5, y: 5} }, { gradient: [{pos:0, color:'#38bdf8'}, {pos:1, color:'#0369a1'}], fill: 'grad' }]); break;
                case 16: drawLayers([{ stroke: {color: '#d4af37', width: 10}, fill: '#4c1d95', shadow: {color: '#d4af37', blur: 15, x: 0, y: 0} }, { fill: '#4c1d95' }]); break;
                case 17: drawLayers([{ stroke: {color: '#be185d', width: 20}, fill: 'transparent', shadow: {color: '#f472b6', blur: 30, x: 0, y: 0} }, { fill: '#fdf2f8', stroke: {color: '#f472b6', width: 4} }]); break;
                case 18: drawLayers([{ stroke: {color: '#7f1d1d', width: 20}, fill: '#7f1d1d' }, { gradient: [{pos:0, color:'#fef08a'}, {pos:0.4, color:'#f97316'}, {pos:1, color:'#dc2626'}], fill: 'grad' }]); break;
                case 19: drawCurved([{ stroke: {color: '#7f1d1d', width: 10}, fill: '#7f1d1d', shadow: {color: 'rgba(0,0,0,0.5)', blur: 10, x: 5, y: 5} }, { fill: '#ef4444', stroke: {color: '#fca5a5', width: 3} }]); break;
                case 20: drawCurved([{ stroke: {color: '#7c2d12', width: 10}, fill: '#7c2d12', shadow: {color: 'rgba(0,0,0,0.5)', blur: 10, x: 5, y: 5} }, { fill: '#f97316', stroke: {color: '#fdba74', width: 3} }]); break;
                case 21: drawLayers([{ stroke: {color: '#1e3a8a', width: 20}, fill: '#1e3a8a' }, { fill: 'transparent', stroke: {color: '#93c5fd', width: 4} }]); break;
                case 22: drawLayers([{ stroke: {color: '#0ea5e9', width: 4}, fill: 'transparent', ox: 10, oy: 10 }, { fill: '#0f172a', stroke: {color: '#ffffff', width: 4} }]); break;
                case 23: drawLayers([{ stroke: {color: '#3f2723', width: 25}, fill: '#3f2723' }, { stroke: {color: '#ffffff', width: 10}, fill: '#ffffff' }, { fill: '#10b981' }]); break;
                case 24: drawLayers([{ stroke: {color: '#ffffff', width: 6}, fill: '#ffffff', shadow: {color: '#ffffff', blur: 15, x: 0, y: 0} }, { gradient: [{pos:0, color:'#1e1b4b'}, {pos:1, color:'#312e81'}], fill: 'grad' }]); break;
                case 25: drawWavy([{ stroke: {color: '#000', width: 12}, fill: '#000', shadow: {color: '#000', blur: 15, x: 10, y: 15} }, { gradient: [{pos:0, color:'#2dd4bf'}, {pos:1, color:'#f472b6'}], fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 26: drawWavy([{ stroke: {color: '#020617', width: 20}, fill: '#020617' }, { gradient: [{pos:0, color:'#38bdf8'}, {pos:1, color:'#c026d3'}], fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 27: drawLayers([{ stroke: {color: '#064e3b', width: 15}, fill: '#064e3b', shadow: {color: '#4ade80', blur: 20, x: 0, y: 0} }, { fill: '#84cc16' }]); break;
                case 28: drawLayers([{ stroke: {color: '#450a0a', width: 10}, fill: '#450a0a', ox: 5, oy: 5 }, { gradient: [{pos:0, color:'#b91c1c'}, {pos:1, color:'#f59e0b'}], stroke: {color: '#fef08a', width: 3}, fill: 'grad' }]); break;
                case 29: drawLayers([{ stroke: {color: '#db2777', width: 5}, fill: 'transparent', ox: -8, oy: -8 }, { stroke: {color: '#111827', width: 5}, fill: 'transparent' }]); break;
                case 30: drawCurved([{ stroke: {color: '#451a03', width: 14}, fill: '#713f12', shadow: {color: 'rgba(0,0,0,0.5)', blur: 10, x: 0, y: 5} }, { gradient: [{pos:0, color:'#fef08a'}, {pos:0.5, color:'#d4af37'}, {pos:1, color:'#b45309'}], fill: 'grad', stroke: {color: '#fef08a', width: 3} }]); break;
                case 31: drawLayers([{ stroke: {color: '#0284c7', width: 20}, fill: 'transparent', shadow: {color: '#38bdf8', blur: 30, x: 0, y: 0} }, { fill: '#fff', stroke: {color: '#bae6fd', width: 4} }]); break;
                case 32: drawLayers([{ fill: '#000', shadow: {color: '#10b981', blur: 30, x: -10, y: 0} }, { fill: '#111827', stroke: {color: '#34d399', width: 3} }]); break;
                case 33: drawLayers([{ stroke: {color: '#450a0a', width: 12}, fill: '#450a0a', shadow: {color: '#ef4444', blur: 15, x: 0, y: 0} }, { gradient: [{pos:0, color:'#fef08a'}, {pos:0.5, color:'#f97316'}, {pos:1, color:'#dc2626'}], fill: 'grad', stroke: {color: '#7f1d1d', width: 3} }]); break;
                case 34: drawLayers([{ stroke: {color: '#082f49', width: 12}, fill: '#082f49', shadow: {color: '#38bdf8', blur: 15, x: 0, y: 0} }, { gradient: [{pos:0, color:'#ffffff'}, {pos:0.5, color:'#bae6fd'}, {pos:1, color:'#0284c7'}], fill: 'grad', stroke: {color: '#e0f2fe', width: 3} }]); break;
                case 35: drawLayers([{ stroke: {color: '#1e3a8a', width: 25}, fill: '#1e3a8a', ox: 10, oy: 10 }, { stroke: {color: '#ffffff', width: 15}, fill: '#ffffff' }, { fill: '#facc15', stroke: {color: '#000000', width: 4} }]); break;
                case 36: drawLayers([{ stroke: {color: '#064e3b', width: 20}, fill: '#064e3b', ox: 5, oy: 5 }, { gradient: [{pos:0, color:'#a3e635'}, {pos:1, color:'#16a34a'}], fill: 'grad', stroke: {color: '#d9f99d', width: 2} }]); break;
                case 37: drawCurved([{ stroke: {color: '#451a03', width: 10}, fill: '#713f12', shadow: {color: 'rgba(0,0,0,0.5)', blur: 10, x: 0, y: 8} }, { gradient: [{pos:0, color:'#fef08a'}, {pos:0.5, color:'#d4af37'}, {pos:1, color:'#b45309'}], fill: 'grad', stroke: {color: '#451a03', width: 2} }]); break;
                case 38: drawCurved([{ stroke: {color: '#082f49', width: 10}, fill: '#082f49', shadow: {color: 'rgba(0,0,0,0.5)', blur: 10, x: 0, y: 8} }, { gradient: [{pos:0, color:'#7dd3fc'}, {pos:0.5, color:'#0284c7'}, {pos:1, color:'#0369a1'}], fill: 'grad', stroke: {color: '#e0f2fe', width: 2} }]); break;
                case 39: drawWavy([{ stroke: {color: '#1e1b4b', width: 15}, fill: '#1e1b4b', shadow: {color: '#a855f7', blur: 30, x: 0, y: 0} }, { fill: '#fdf4ff', stroke: {color: '#d946ef', width: 5} }]); break;
                case 40: const grad40 = ctx.createLinearGradient(0, cy - 60, 0, cy + 60); grad40.addColorStop(0, '#0284c7'); grad40.addColorStop(0.48, '#38bdf8'); grad40.addColorStop(0.5, '#ffffff'); grad40.addColorStop(0.52, '#f97316'); grad40.addColorStop(1, '#db2777'); drawLayers([{ stroke: {color: '#ffffff', width: 8}, fill: '#ffffff', shadow: {color: '#db2777', blur: 15, x: 0, y: 0} }, { fill: grad40, stroke: {color: '#000000', width: 2} }]); break;

                // (41-100: Unique Styles 1)
                case 41: drawCircle([{ stroke: {color: '#b45309', width: 25}, fill: '#b45309', shadow: {color: 'rgba(0,0,0,0.5)', blur: 15, x: 5, y: 5} }, { gradient: gradGold, fill: 'grad', stroke: {color: '#fef08a', width: 4} }]); break;
                case 42: drawLayers([{ stroke: {color: '#000', width: 12}, fill: 'transparent', shadow: {color: '#000', blur: 15, x: 0, y: 15} }, { gradient: gradChrome, fill: 'grad', stroke: {color: '#fff', width: 2} }]); break;
                case 43: drawLayers([{ stroke: {color: '#a855f7', width: 15}, fill: 'transparent', shadow: {color: '#a855f7', blur: 30, x: 0, y: 0} }, { fill: '#fff', stroke: {color: '#d8b4fe', width: 4} }]); break;
                case 44: drawWavy([{ fill: '#000', ox: 10, oy: 10 }, { gradient: [{pos:0, color:'#ef4444'}, {pos:0.5, color:'#eab308'}, {pos:1, color:'#3b82f6'}], fill: 'grad', stroke: {color: '#000', width: 4} }]); break;
                case 45: drawCurved([{ fill: '#9ca3af', ox: 6, oy: 6, font: '900 130px "Times New Roman", serif' }, { fill: '#111827', font: '900 130px "Times New Roman", serif' }]); break;
                case 46: drawLayers([{ stroke: {color: '#000', width: 16}, fill: '#000', shadow: {color: '#000', blur: 10, x: 5, y: 5} }, { stroke: {color: '#fff', width: 8}, fill: 'transparent' }, { gradient: gradGold, fill: 'grad' }]); break;
                case 47: drawLayers([{ stroke: {color: '#1e1b4b', width: 10}, fill: '#1e1b4b', shadow: {color: '#000', blur: 20, x: 10, y: 10} }, { gradient: [{pos:0, color:'#2dd4bf'}, {pos:1, color:'#f472b6'}], fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 48: drawLayers([{ stroke: {color: '#22c55e', width: 10}, fill: '#052e16', font: '900 130px "Courier New", monospace', shadow: {color: '#4ade80', blur: 25, x: 0, y: 0} }, { fill: '#86efac', font: '900 130px "Courier New", monospace' }]); break;
                case 49: drawLayers([{ stroke: {color: '#000', width: 25}, fill: '#000', shadow: {color: '#000', blur: 10, x: 6, y: 6} }, { stroke: {color: '#fff', width: 15}, fill: '#fff' }, { fill: '#f472b6', stroke: {color: '#be185d', width: 4} }]); break;
                case 50: drawCurved([{ stroke: {color: '#1e3a8a', width: 25}, fill: '#1e3a8a', shadow: {color: 'rgba(0,0,0,0.5)', blur: 10, x: 0, y: 10} }, { fill: '#fff', stroke: {color: '#60a5fa', width: 4} }]); break;
                case 51: drawCurved([{ stroke: {color: '#4a044e', width: 10}, fill: '#4a044e', shadow: {color: '#000', blur: 15, x: 0, y: 15} }, { gradient: [{pos:0, color:'#f97316'}, {pos:0.5, color:'#ec4899'}, {pos:1, color:'#86198f'}], fill: 'grad', stroke: {color: '#fdf2f8', width: 2} }]); break;
                case 52: drawLayers([{ stroke: {color: '#3b82f6', width: 12}, fill: 'transparent', font: '900 130px "Courier New", monospace', shadow: {color: '#1d4ed8', blur: 20, x: 0, y: 0} }, { stroke: {color: '#93c5fd', width: 4}, fill: 'transparent', font: '900 130px "Courier New", monospace' }]); break;
                case 53: drawLayers([{ stroke: {color: '#7f1d1d', width: 20}, fill: '#7f1d1d', shadow: {color: '#ea580c', blur: 30, x: 0, y: 0} }, { fill: '#000', stroke: {color: '#ef4444', width: 6} }]); break;
                case 54: drawLayers([{ stroke: {color: '#1e3a8a', width: 10}, fill: '#1e3a8a', ox: 15, oy: 15, shadow: {color: 'rgba(0,0,0,0.3)', blur: 10, x: 5, y: 5} }, { gradient: [{pos:0, color:'#fff'}, {pos:1, color:'#7dd3fc'}], fill: 'grad', stroke: {color: '#0ea5e9', width: 3} }]); break;
                case 55: drawLayers([{ stroke: {color: '#1e3a8a', width: 30}, fill: '#1e3a8a', font: 'italic 900 130px "Arial Black", sans-serif' }, { stroke: {color: '#fff', width: 15}, fill: '#fff', font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#dc2626', font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 56: drawLayers([{ fill: '#000', ox: 25, oy: 0, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#eab308', stroke: {color: '#ca8a04', width: 4}, font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 57: drawLayers([{ stroke: {color: '#4c0519', width: 35}, fill: '#4c0519', shadow: {color: '#e11d48', blur: 40, x: 0, y: 0} }, { fill: '#fff', stroke: {color: '#fbcfe8', width: 5} }]); break;
                case 58: drawLayers([{ stroke: {color: '#000', width: 8}, fill: 'transparent', shadow: {color: '#000', blur: 30, x: 0, y: 0} }, { fill: '#fff' }]); break;
                case 59: drawLayers([{ stroke: {color: '#020617', width: 15}, fill: '#020617', shadow: {color: '#000', blur: 20, x: 10, y: 10} }, { fill: '#1e1b4b', stroke: {color: '#3730a3', width: 4} }]); break;
                case 60: drawLayers([{ stroke: {color: '#064e3b', width: 12}, fill: '#064e3b', ox: 6, oy: 6 }, { fill: '#4ade80', stroke: {color: '#14532d', width: 3} }]); break;
                case 61: drawCurved([{ stroke: {color: '#000', width: 20}, fill: '#000', ox: 10, oy: 10 }, { fill: '#eab308', stroke: {color: '#000', width: 6} }]); break;
                case 62: drawCurved([{ stroke: {color: '#0891b2', width: 15}, fill: 'transparent', shadow: {color: '#06b6d4', blur: 25, x: 0, y: 0} }, { fill: '#ecfeff', stroke: {color: '#22d3ee', width: 3} }]); break;
                case 63: drawWavy([{ stroke: {color: '#2e1065', width: 18}, fill: '#2e1065', shadow: {color: '#c026d3', blur: 25, x: 0, y: 0} }, { fill: '#fae8ff', stroke: {color: '#e879f9', width: 3} }]); break;
                case 64: drawLayers([{ stroke: {color: '#22c55e', width: 20}, fill: '#000', font: '900 130px "Courier New", monospace' }, { fill: '#4ade80', font: '900 130px "Courier New", monospace' }]); break;
                case 65: drawLayers([{ stroke: {color: '#b91c1c', width: 10}, fill: '#b91c1c', shadow: {color: '#ef4444', blur: 20, x: 0, y: 0} }, { gradient: [{pos:0, color:'#fef08a'}, {pos:1, color:'#ea580c'}], fill: 'grad', stroke: {color: '#fff', width: 2} }]); break;
                case 66: drawLayers([{ fill: '#be185d', ox: -10, oy: 10 }, { gradient: gradChrome, fill: 'grad', stroke: {color: '#94a3b8', width: 3} }]); break;
                case 67: drawLayers([{ stroke: {color: '#cbd5e1', width: 4}, fill: 'transparent', shadow: {color: '#64748b', blur: 20, x: 0, y: 15} }, { fill: '#ffffff' }]); break;
                case 68: drawWavy([{ stroke: {color: '#000', width: 20}, fill: '#000', shadow: {color: '#000', blur: 20, x: 5, y: 20} }, { gradient: gradGold, fill: 'grad', stroke: {color: '#fff', width: 2} }]); break;
                case 69: drawLayers([{ stroke: {color: '#000', width: 15}, fill: '#000', shadow: {color: '#84cc16', blur: 30, x: 0, y: 0} }, { gradient: [{pos:0, color:'#bef264'}, {pos:1, color:'#4d7c0f'}], fill: 'grad', stroke: {color: '#000', width: 2} }]); break;
                case 70: drawLayers([{ stroke: {color: '#000', width: 15}, fill: '#000', shadow: {color: '#000', blur: 15, x: 10, y: 10}, font: 'italic 900 130px "Arial Black", sans-serif' }, { gradient: gradChrome, fill: 'grad', font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 71: drawLayers([{ stroke: {color: '#ec4899', width: 25}, fill: 'transparent', shadow: {color: '#ec4899', blur: 30, x: 0, y: 0} }, { stroke: {color: '#06b6d4', width: 10}, fill: '#06b6d4', shadow: {color: '#06b6d4', blur: 20, x: 0, y: 0} }, { fill: '#fff' }]); break;
                case 72: drawLayers([{ stroke: {color: '#000', width: 15}, fill: '#000', shadow: {color: '#000', blur: 10, x: 5, y: 5} }, { gradient: gradRainbow, fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 73: drawCurved([{ stroke: {color: '#000', width: 10}, fill: '#000', shadow: {color: 'rgba(0,0,0,0.3)', blur: 10, x: 0, y: 10} }, { gradient: gradRainbow, fill: 'grad', stroke: {color: '#fff', width: 2} }]); break;
                case 74: drawCurved([{ stroke: {color: '#1e3a8a', width: 10}, fill: '#1e3a8a', shadow: {color: '#000', blur: 15, x: 0, y: 5} }, { gradient: gradChrome, fill: 'grad', stroke: {color: '#000', width: 2} }]); break;
                case 75: drawLayers([{ stroke: {color: '#ea580c', width: 15}, fill: 'transparent', shadow: {color: '#f97316', blur: 25, x: 0, y: 0} }, { fill: '#fff', stroke: {color: '#ffedd5', width: 3} }]); break;
                case 76: drawLayers([{ fill: 'transparent', shadow: {color: '#93c5fd', blur: 30, x: 0, y: 0} }, { gradient: [{pos:0, color:'#e0e7ff'}, {pos:1, color:'#fbcfe8'}], fill: 'grad' }]); break;
                case 77: drawWavy([{ fill: '#000', shadow: {color: '#000', blur: 20, x: 5, y: 15} }, { gradient: [{pos:0, color:'#bef264'}, {pos:1, color:'#16a34a'}], fill: 'grad', stroke: {color: '#000', width: 3} }]); break;
                case 78: drawLayers([{ fill: '#3b0764', ox: 8, oy: 8, shadow: {color: '#000', blur: 10, x: 4, y: 4} }, { gradient: gradGold, fill: 'grad', stroke: {color: '#111827', width: 2} }]); break;
                case 79: drawLayers([{ stroke: {color: '#0284c7', width: 16}, fill: '#0284c7' }, { fill: '#fff', stroke: {color: '#7dd3fc', width: 6} }]); break;
                case 80: drawLayers([{ stroke: {color: '#0284c7', width: 12}, fill: '#0284c7', ox: 10, oy: 10 }, { gradient: [{pos:0, color:'#fef08a'}, {pos:0.5, color:'#f97316'}, {pos:1, color:'#dc2626'}], fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 81: drawLayers([{ stroke: {color: '#16a34a', width: 24}, fill: '#16a34a' }, { stroke: {color: '#fff', width: 10}, fill: '#fff' }, { fill: '#f43f5e' }]); break;
                case 82: drawWavy([{ fill: '#000', ox: -10, oy: 10, shadow: {color: '#ef4444', blur: 10, x: 5, y: -5} }, { fill: '#fff', stroke: {color: '#06b6d4', width: 4} }]); break;
                case 83: drawLayers([{ stroke: {color: '#65a30d', width: 10}, fill: '#65a30d', ox: 5, oy: 5 }, { fill: '#fef08a', stroke: {color: '#111827', width: 2} }]); break;
                case 84: drawLayers([{ fill: '#4c1d95', ox: 12, oy: 12 }, { gradient: [{pos:0, color:'#f472b6'}, {pos:1, color:'#e11d48'}], fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 85: drawLayers([{ stroke: {color: '#1e3a8a', width: 6}, fill: 'transparent', font: '900 130px "Courier New", monospace', ox: 5, oy: 5 }, { stroke: {color: '#60a5fa', width: 4}, fill: '#eff6ff', font: '900 130px "Courier New", monospace' }]); break;
                case 86: drawLayers([{ stroke: {color: '#000', width: 8}, fill: 'transparent', font: '900 130px "Times New Roman", serif', shadow: {color: 'rgba(0,0,0,0.5)', blur: 10, x: 0, y: 10} }, { gradient: gradGold, fill: 'grad', font: '900 130px "Times New Roman", serif' }]); break;
                case 87: drawCurved([{ stroke: {color: '#be185d', width: 15}, fill: 'transparent', shadow: {color: '#f472b6', blur: 25, x: 0, y: 0} }, { fill: '#fdf2f8', stroke: {color: '#fbcfe8', width: 3} }]); break;
                case 88: drawWavy([{ stroke: {color: '#000', width: 20}, fill: '#000' }, { gradient: gradChrome, fill: 'grad', stroke: {color: '#64748b', width: 4} }]); break;
                case 89: drawCurved([{ fill: '#0ff', ox: -6, oy: 0 }, { fill: '#f00', ox: 6, oy: 0 }, { fill: '#fff' }]); break;
                case 90: drawLayers([{ fill: '#111827', shadow: {color: '#ef4444', blur: 30, x: 0, y: 0} }, { fill: '#374151' }]); break;
                case 91: drawWavy([{ stroke: {color: '#78350f', width: 25}, fill: '#78350f', shadow: {color: '#f59e0b', blur: 30, x: 0, y: 0} }, { fill: '#fff', stroke: {color: '#fbbf24', width: 4} }]); break;
                case 92: drawLayers([{ stroke: {color: '#3b82f6', width: 20}, fill: '#3b82f6', shadow: {color: '#60a5fa', blur: 30, x: 0, y: 0} }, { fill: '#a855f7', stroke: {color: '#fff', width: 4} }]); break;
                case 93: drawLayers([{ fill: '#1d4ed8', ox: 10, oy: 10 }, { fill: '#ef4444', stroke: {color: '#facc15', width: 8} }]); break;
                case 94: drawLayers([{ fill: '#111827', ox: 5, oy: 5, font: '900 130px "Courier New", monospace' }, { fill: '#dc2626', font: '900 130px "Courier New", monospace' }]); break;
                case 95: drawLayers([{ fill: 'transparent', shadow: {color: '#9d174d', blur: 15, x: 0, y: 15} }, { gradient: [{pos:0, color:'#fdf2f8'}, {pos:0.5, color:'#f472b6'}, {pos:1, color:'#fda4af'}], fill: 'grad', stroke: {color: '#831843', width: 2} }]); break;
                case 96: drawLayers([{ stroke: {color: '#facc15', width: 12}, fill: '#facc15', shadow: {color: '#fef08a', blur: 25, x: 0, y: 0} }, { fill: '#000', stroke: {color: '#fef08a', width: 3} }]); break;
                case 97: drawCurved([{fill:'#064e3b', ox:15, oy:15}, {fill:'#059669', ox:10, oy:10}, {fill:'#10b981', ox:5, oy:5}, {fill:'#a7f3d0', stroke:{color:'#064e3b', width:3}}]); break;
                case 98: drawCurved([{ stroke: {color: '#7f1d1d', width: 15}, fill: '#7f1d1d', shadow: {color: '#ef4444', blur: 20, x: 0, y: 0} }, { gradient: [{pos:0, color:'#fef08a'}, {pos:0.5, color:'#f97316'}, {pos:1, color:'#dc2626'}], fill: 'grad' }]); break;
                case 99: drawLayers([{ fill: '#1e3a8a', ox: 20, oy: 10, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#3b82f6', ox: 10, oy: 5, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#fff', stroke: {color: '#111827', width: 4}, font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 100: drawLayers([{ stroke: {color: '#000', width: 35}, fill: '#000', shadow: {color: '#c026d3', blur: 30, x: 0, y: 0} }, { stroke: {color: '#fff', width: 15}, fill: 'transparent' }, { gradient: [{pos:0, color:'#38bdf8'}, {pos:0.4, color:'#818cf8'}, {pos:0.6, color:'#c026d3'}, {pos:1, color:'#e879f9'}], fill: 'grad' }]); break;

                // --- NEW UNIQUE STYLES (101-200) ---
                case 101: drawLayers([{ stroke: {color: '#0f172a', width: 15}, fill: '#0f172a', shadow: {color: '#f472b6', blur: 20, x: -5, y: 5} }, { fill: '#22d3ee', stroke: {color: '#e879f9', width: 4} }]); break;
                case 102: drawLayers([{ fill: '#000', ox: 15, oy: 15 }, { gradient: gradRainbow, fill: 'grad', stroke: {color: '#000', width: 4} }]); break;
                case 103: drawLayers([{fill:'#1e3a8a', ox:20, oy:20}, {fill:'#2563eb', ox:10, oy:10}, {fill:'#60a5fa', stroke:{color:'#1e3a8a', width:4}}]); break;
                case 104: drawLayers([{ stroke: {color: '#4c1d95', width: 25}, fill: '#4c1d95', shadow: {color: '#000', blur: 0, x: 8, y: 8} }, { fill: '#fdf4ff', stroke: {color: '#d946ef', width: 4} }]); break;
                case 105: drawCurved([{ stroke: {color: '#000', width: 18}, fill: '#000', shadow: {color: '#2dd4bf', blur: 20, x: 0, y: 0} }, { gradient: gradGold, fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 106: drawLayers([{ fill: '#000', ox: 10, oy: 10 }, { gradient: gradChrome, fill: 'grad', stroke: {color: '#000', width: 5} }]); break;
                case 107: drawLayers([{ stroke: {color: '#164e63', width: 15}, fill: 'transparent', ox: -8, oy: -8 }, { fill: '#67e8f9', stroke: {color: '#083344', width: 5} }]); break;
                case 108: drawCurved([{ fill: '#000', ox: 0, oy: 15 }, { fill: '#fff', stroke: {color: '#000', width: 8} }]); break;
                case 109: drawLayers([{ stroke: {color: '#9f1239', width: 20}, fill: '#9f1239', shadow: {color: '#fb7185', blur: 30, x: 0, y: 0} }, { fill: '#ffe4e6', stroke: {color: '#e11d48', width: 2} }]); break;
                case 110: drawLayers([{ fill: '#2e1065', ox: 15, oy: 0 }, { fill: '#5b21b6', ox: 10, oy: 0 }, { fill: '#8b5cf6', stroke: {color: '#ddd6fe', width: 3} }]); break;
                
                case 111: drawLayers([{ stroke: {color: '#1e3a8a', width: 15}, fill: '#1e3a8a', shadow: {color: '#2563eb', blur: 20, x: -5, y: 5} }, { gradient: [{pos:0, color:'#93c5fd'}, {pos:1, color:'#1e3a8a'}], fill: 'grad', stroke: {color: '#fff', width: 2} }]); break;
                case 112: drawZigZag([{ stroke: {color: '#b91c1c', width: 20}, fill: '#b91c1c', shadow: {color: '#000', blur: 10, x: 5, y: 5} }, { gradient: gradGold, fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 113: drawLayers([{ fill: '#14532d', ox: 10, oy: 10, shadow: {color: '#000', blur: 15, x: 5, y: 5} }, { gradient: [{pos:0, color:'#86efac'}, {pos:0.5, color:'#22c55e'}, {pos:1, color:'#166534'}], fill: 'grad', stroke: {color: '#dcfce7', width: 3} }]); break;
                case 114: drawLayers([{ fill: 'transparent', shadow: {color: '#eab308', blur: 25, x: 0, y: 0} }, { fill: '#fef9c3', stroke: {color: '#facc15', width: 5} }]); break;
                case 115: drawCurved([{ fill: '#312e81', ox: 5, oy: 5 }, { fill: '#4f46e5', ox: -5, oy: -5 }, { fill: '#e0e7ff', stroke: {color: '#818cf8', width: 3} }]); break;
                case 116: drawLayers([{ stroke: {color: '#000', width: 12}, fill: '#000', shadow: {color: '#000', blur: 10, x: 0, y: 15} }, { gradient: gradChrome, fill: 'grad', stroke: {color: '#64748b', width: 2} }]); break;
                case 117: drawWavy([{ fill: '#000', ox: -10, oy: 10 }, { fill: '#ef4444', stroke: {color: '#fff', width: 4} }]); break;
                case 118: drawLayers([{ stroke: {color: '#86198f', width: 20}, fill: '#86198f', shadow: {color: '#d946ef', blur: 20, x: 0, y: 0} }, { fill: '#fae8ff', stroke: {color: '#f0abfc', width: 4} }]); break;
                case 119: drawLayers([{fill:'#831843', ox:15, oy:-15}, {gradient: [{pos:0, color:'#fbcfe8'}, {pos:1, color:'#db2777'}], fill: 'grad', stroke: {color: '#000', width: 3}}]); break;
                case 120: drawZigZag([{ fill: '#000', ox: 10, oy: 10 }, { fill: '#34d399', stroke: {color: '#064e3b', width: 4} }]); break;
                
                case 121: drawLayers([{ fill: '#000', ox: 20, oy: -20 }, { gradient: gradGold, fill: 'grad', stroke: {color: '#000', width: 4} }]); break;
                case 122: drawLayers([{fill:'#064e3b', ox:-20, oy:20}, {fill:'#10b981', stroke:{color:'#047857', width:3}}]); break;
                case 123: drawLayers([{ stroke: {color: '#111827', width: 18}, fill: '#111827', shadow: {color: '#facc15', blur: 20, x: -5, y: -5} }, { fill: '#fef08a' }]); break;
                case 124: drawZigZag([{ stroke: {color: '#1e3a8a', width: 15}, fill: '#1e3a8a', shadow: {color: '#3b82f6', blur: 30, x: 0, y: 0} }, { fill: '#fff', stroke: {color: '#93c5fd', width: 3} }]); break;
                case 125: drawCurved([{ fill: '#065f46', ox: 8, oy: 8, shadow: {color: '#000', blur: 10, x: 4, y: 4} }, { fill: '#34d399', stroke: {color: '#059669', width: 3} }]); break;
                case 126: drawLayers([{ stroke: {color: '#450a0a', width: 15}, fill: '#450a0a', ox: -6, oy: -6 }, { gradient: [{pos:0, color:'#fca5a5'}, {pos:1, color:'#b91c1c'}], fill: 'grad', stroke: {color: '#fecaca', width: 2} }]); break;
                case 127: drawWavy([{ stroke: {color: '#1e3a8a', width: 25}, fill: '#1e3a8a' }, { fill: '#bfdbfe', stroke: {color: '#3b82f6', width: 4} }]); break;
                case 128: drawCurved([{ stroke: {color: '#0f172a', width: 12}, fill: '#0f172a', shadow: {color: '#94a3b8', blur: 25, x: 0, y: 0} }, { fill: '#f1f5f9', stroke: {color: '#cbd5e1', width: 4} }]); break;
                case 129: drawLayers([{fill:'#7c2d12', ox:12, oy:12}, {fill:'#ea580c', ox:6, oy:6}, {fill:'#ffedd5', stroke:{color:'#451a03', width:3}}]); break;
                case 130: drawLayers([{ stroke: {color: '#000', width: 20}, fill: '#000', shadow: {color: '#000', blur: 15, x: 10, y: 10} }, { fill: '#fff' }]); break;

                case 131: drawWavy([{ stroke: {color: '#000', width: 12}, fill: '#000', shadow: {color: '#f97316', blur: 35, x: 0, y: 0} }, { fill: '#ffedd5', stroke: {color: '#ea580c', width: 3} }]); break;
                case 132: drawWavy([{ fill: '#1e1b4b', ox: 15, oy: 15 }, { fill: '#818cf8', stroke: {color: '#fff', width: 3} }]); break;
                case 133: drawLayers([{ stroke: {color: '#000', width: 10}, fill: '#000', ox: 15, oy: 15, shadow: {color: '#000', blur: 5, x: 5, y: 5} }, { gradient: gradRainbow, fill: 'grad', stroke: {color: '#000', width: 4} }]); break;
                case 134: drawZigZag([{ fill: '#000', shadow: {color: '#ef4444', blur: 20, x: 0, y: 15} }, { gradient: [{pos:0, color:'#fef2f2'}, {pos:1, color:'#ef4444'}], fill: 'grad', stroke: {color: '#000', width: 4} }]); break;
                case 135: drawLayers([{ stroke: {color: '#b91c1c', width: 15}, fill: '#b91c1c', shadow: {color: '#ef4444', blur: 25, x: 0, y: 0} }, { fill: '#fef2f2', stroke: {color: '#fca5a5', width: 3} }]); break;
                case 136: drawLayers([{fill:'#1e1b4b', ox:25, oy:0}, {fill:'#4f46e5', stroke:{color:'#fff', width:3}}]); break;
                case 137: drawCurved([{ stroke: {color: '#0f766e', width: 18}, fill: '#0f766e', shadow: {color: '#2dd4bf', blur: 20, x: -5, y: -5} }, { fill: '#f0fdfa' }]); break;
                case 138: drawCircle([{ stroke: {color: '#000', width: 15}, fill: '#000', shadow: {color: '#fff', blur: 10, x: 0, y: 0} }, { gradient: gradRainbow, fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 139: drawLayers([{ stroke: {color: '#831843', width: 12}, fill: '#831843' }, { gradient: [{pos:0, color:'#fce7f3'}, {pos:0.5, color:'#f472b6'}, {pos:1, color:'#9d174d'}], fill: 'grad' }]); break;
                case 140: drawZigZag([{ fill: '#4c1d95', ox: 15, oy: 15 }, { fill: '#d8b4fe', stroke: {color: '#a855f7', width: 5} }]); break;

                case 141: drawLayers([{ stroke: {color: '#000', width: 25}, fill: '#000', font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#facc15', font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 142: drawLayers([{ fill: '#dc2626', ox: 15, oy: 0, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#fff', stroke: {color: '#000', width: 5}, font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 143: drawLayers([{ stroke: {color: '#1e3a8a', width: 15}, fill: '#1e3a8a', shadow: {color: '#3b82f6', blur: 20, x: 10, y: 0}, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#bfdbfe', font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 144: drawLayers([{ stroke: {color: '#000', width: 30}, fill: '#000', shadow: {color: '#000', blur: 25, x: 10, y: 10}, font: 'italic 900 130px "Arial Black", sans-serif' }, { gradient: gradChrome, fill: 'grad', stroke: {color: '#fff', width: 4}, font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 145: drawCurved([{ fill: '#064e3b', ox: 10, oy: 10, font: 'italic 900 130px "Arial Black", sans-serif' }, { gradient: [{pos:0, color:'#a3e635'}, {pos:1, color:'#16a34a'}], fill: 'grad', stroke: {color: '#000', width: 3}, font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                
                case 146: drawLayers([{ stroke: {color: '#c026d3', width: 10}, fill: 'transparent', ox: -4, oy: -4 }, { stroke: {color: '#06b6d4', width: 10}, fill: 'transparent', ox: 4, oy: 4 }, { fill: '#fff' }]); break;
                case 147: drawLayers([{ stroke: {color: '#1e1b4b', width: 15}, fill: '#1e1b4b', shadow: {color: '#818cf8', blur: 30, x: 0, y: 0} }, { gradient: [{pos:0, color:'#e0e7ff'}, {pos:1, color:'#a5b4fc'}], fill: 'grad', stroke: {color: '#fff', width: 2} }]); break;
                case 148: drawLayers([{fill:'#000', ox:0, oy:20}, {fill:'#fff', stroke:{color:'#000', width:5}}]); break;
                case 149: drawLayers([{ stroke: {color: '#111827', width: 22}, fill: '#111827', shadow: {color: '#000', blur: 15, x: 5, y: 5} }, { gradient: gradRainbow, fill: 'grad', stroke: {color: '#fff', width: 2} }]); break;
                case 150: drawCurved([{ stroke: {color: '#000', width: 12}, fill: '#000', shadow: {color: '#fbbf24', blur: 25, x: 0, y: 0} }, { fill: '#fef08a', stroke: {color: '#ca8a04', width: 3} }]); break;
                
                case 151: drawLayers([{ stroke: {color: '#1e3a8a', width: 10}, fill: '#1e3a8a', ox: 8, oy: 8, font: '900 130px "Courier New", monospace' }, { fill: '#eff6ff', stroke: {color: '#3b82f6', width: 4}, font: '900 130px "Courier New", monospace' }]); break;
                case 152: drawZigZag([{ stroke: {color: '#000', width: 25}, fill: '#000' }, { gradient: gradChrome, fill: 'grad', stroke: {color: '#fff', width: 4} }]); break;
                case 153: drawLayers([{ stroke: {color: '#000', width: 15}, fill: '#000', shadow: {color: '#22c55e', blur: 20, x: 0, y: 0}, font: '900 130px "Courier New", monospace' }, { fill: '#000', stroke: {color: '#4ade80', width: 3}, font: '900 130px "Courier New", monospace' }]); break;
                case 154: drawLayers([{ fill: '#7f1d1d', ox: -8, oy: -8, font: '900 130px "Courier New", monospace' }, { fill: '#fecaca', stroke: {color: '#ef4444', width: 4}, font: '900 130px "Courier New", monospace' }]); break;
                case 155: drawLayers([{ stroke: {color: '#581c87', width: 12}, fill: 'transparent', shadow: {color: '#a855f7', blur: 25, x: 0, y: 0}, font: '900 130px "Courier New", monospace' }, { fill: '#f3e8ff', font: '900 130px "Courier New", monospace' }]); break;

                case 156: drawLayers([{ stroke: {color: '#000', width: 10}, fill: 'transparent', shadow: {color: '#000', blur: 15, x: 5, y: 10}, font: '900 130px "Times New Roman", serif' }, { gradient: gradGold, fill: 'grad', font: '900 130px "Times New Roman", serif' }]); break;
                case 157: drawLayers([{ fill: '#4c0519', ox: 10, oy: 10, font: '900 130px "Times New Roman", serif' }, { fill: '#ffe4e6', stroke: {color: '#e11d48', width: 3}, font: '900 130px "Times New Roman", serif' }]); break;
                case 158: drawCurved([{ stroke: {color: '#0f172a', width: 20}, fill: '#0f172a', shadow: {color: '#000', blur: 10, x: 0, y: 5}, font: '900 130px "Times New Roman", serif' }, { gradient: gradChrome, fill: 'grad', font: '900 130px "Times New Roman", serif' }]); break;
                case 159: drawLayers([{ fill: '#064e3b', ox: -10, oy: 10, font: '900 130px "Times New Roman", serif' }, { fill: '#d1fae5', stroke: {color: '#047857', width: 4}, font: '900 130px "Times New Roman", serif' }]); break;
                case 160: drawCurved([{ stroke: {color: '#000', width: 8}, fill: 'transparent', shadow: {color: '#000', blur: 20, x: 0, y: 0}, font: '900 130px "Times New Roman", serif' }, { fill: '#fff', font: '900 130px "Times New Roman", serif' }]); break;

                case 161: drawWavy([{ stroke: {color: '#083344', width: 18}, fill: '#083344', shadow: {color: '#22d3ee', blur: 25, x: 0, y: 0} }, { gradient: [{pos:0, color:'#cffafe'}, {pos:1, color:'#06b6d4'}], fill: 'grad', stroke: {color: '#164e63', width: 2} }]); break;
                case 162: drawZigZag([{ stroke: {color: '#451a03', width: 18}, fill: '#451a03', shadow: {color: '#f59e0b', blur: 30, x: 0, y: 0} }, { fill: '#fef3c7', stroke: {color: '#d97706', width: 3} }]); break;
                case 163: drawCurved([{ stroke: {color: '#b45309', width: 15}, fill: '#b45309', shadow: {color: '#f59e0b', blur: 30, x: 0, y: 0} }, { fill: '#fff', stroke: {color: '#fef3c7', width: 3} }]); break;
                case 164: drawLayers([{ fill: '#1e3a8a', ox: 15, oy: 15 }, { fill: '#db2777', ox: 7, oy: 7 }, { fill: '#fdf2f8', stroke: {color: '#000', width: 4} }]); break;
                case 165: drawLayers([{ fill: '#3b0764', shadow: {color: '#a855f7', blur: 30, x: 0, y: 0} }, { fill: '#f3e8ff', stroke: {color: '#c026d3', width: 5} }]); break;
                case 166: drawTriangle([{ stroke: {color: '#065f46', width: 20}, fill: '#065f46' }, { fill: '#6ee7b7', stroke: {color: '#000', width: 4} }]); break;
                case 167: drawLayers([{ stroke: {color: '#000', width: 12}, fill: '#000', shadow: {color: '#a855f7', blur: 40, x: 0, y: 0} }, { fill: '#f3e8ff', stroke: {color: '#c026d3', width: 3} }]); break;
                case 168: drawLayers([{fill:'#450a0a', ox:-15, oy:-15}, {fill:'#dc2626', stroke:{color:'#fecaca', width:4}}]); break;
                case 169: drawLayers([{ stroke: {color: '#1e1b4b', width: 20}, fill: '#1e1b4b', shadow: {color: '#000', blur: 15, x: 5, y: 5} }, { gradient: [{pos:0, color:'#c7d2fe'}, {pos:1, color:'#6366f1'}], fill: 'grad' }]); break;
                case 170: drawCircle([{ stroke: {color: '#1e3a8a', width: 30}, fill: '#1e3a8a' }, { stroke: {color: '#fff', width: 15}, fill: '#fff' }, { fill: '#ef4444' }]); break;

                case 171: drawLayers([{ stroke: {color: '#7f1d1d', width: 18}, fill: '#7f1d1d', shadow: {color: '#dc2626', blur: 20, x: 0, y: -10} }, { gradient: [{pos:0, color:'#fef08a'}, {pos:0.5, color:'#f97316'}, {pos:1, color:'#ef4444'}], fill: 'grad' }]); break;
                case 172: drawCurved([{ stroke: {color: '#082f49', width: 15}, fill: '#082f49', shadow: {color: '#38bdf8', blur: 25, x: 0, y: 0} }, { gradient: [{pos:0, color:'#fff'}, {pos:1, color:'#bae6fd'}], fill: 'grad', stroke: {color: '#0ea5e9', width: 2} }]); break;
                case 173: drawLayers([{ stroke: {color: '#000', width: 25}, fill: '#000', ox: 15, oy: 15 }, { fill: '#fff', stroke: {color: '#000', width: 4} }]); break;
                case 174: drawTriangle([{ fill: '#000', ox: 12, oy: 12 }, { gradient: [{pos:0, color:'#f472b6'}, {pos:1, color:'#e11d48'}], fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 175: drawCurved([{ stroke: {color: '#000', width: 15}, fill: '#000', shadow: {color: '#a3e635', blur: 30, x: 0, y: 0} }, { fill: '#d9f99d', stroke: {color: '#4d7c0f', width: 3} }]); break;
                
                case 176: drawLayers([{fill:'#022c22', ox:18, oy:18}, {gradient: gradChrome, fill: 'grad', stroke:{color:'#059669', width:3}}]); break;
                case 177: drawLayers([{ stroke: {color: '#831843', width: 20}, fill: '#831843', shadow: {color: '#f472b6', blur: 25, x: 0, y: 0} }, { gradient: [{pos:0, color:'#fdf2f8'}, {pos:1, color:'#db2777'}], fill: 'grad' }]); break;
                case 178: drawTriangle([{ stroke: {color: '#1e1b4b', width: 15}, fill: '#1e1b4b', shadow: {color: '#818cf8', blur: 40, x: 0, y: 0} }, { fill: '#c7d2fe', stroke: {color: '#4f46e5', width: 4} }]); break;
                case 179: drawLayers([{fill:'#4a044e', ox:20, oy:-10}, {fill:'#d946ef', stroke:{color:'#fff', width:3}}]); break;
                case 180: drawTriangle([{ fill: '#7c2d12', ox: -10, oy: 15 }, { gradient: gradGold, fill: 'grad', stroke: {color: '#451a03', width: 3} }]); break;

                case 181: drawLayers([{ stroke: {color: '#000', width: 6}, fill: 'transparent', shadow: {color: '#000', blur: 20, x: 0, y: 20} }, { fill: '#fff' }]); break;
                case 182: drawLayers([{fill:'#000', ox:-15, oy:0}, {fill:'#eab308', stroke:{color:'#000', width:6}}]); break;
                case 183: drawLayers([{ stroke: {color: '#f97316', width: 35}, fill: '#f97316', shadow: {color: '#ea580c', blur: 40, x: 0, y: 0} }, { stroke: {color: '#fef08a', width: 15}, fill: '#fef08a' }, { fill: '#fff' }]); break;
                case 184: drawTriangle([{ stroke: {color: '#000', width: 25}, fill: '#000', shadow: {color: '#000', blur: 20, x: 10, y: 10} }, { gradient: gradRainbow, fill: 'grad', stroke: {color: '#fff', width: 2} }]); break;
                case 185: drawCurved([{ fill: '#1e3a8a', ox: 12, oy: 12 }, { fill: '#eff6ff', stroke: {color: '#2563eb', width: 4} }]); break;
                
                case 186: drawLayers([{ stroke: {color: '#000', width: 25}, fill: '#000', shadow: {color: '#000', blur: 15, x: 0, y: 10} }, { gradient: [{pos:0, color:'#1e1b4b'}, {pos:1, color:'#312e81'}], fill: 'grad', stroke: {color: '#fff', width: 2} }]); break;
                case 187: drawWavy([{ fill: '#000', ox: 10, oy: -10 }, { fill: '#10b981', stroke: {color: '#fff', width: 4} }]); break;
                case 188: drawCurved([{ stroke: {color: '#4c0519', width: 18}, fill: '#4c0519', shadow: {color: '#e11d48', blur: 25, x: 0, y: 0} }, { fill: '#fff', stroke: {color: '#fda4af', width: 3} }]); break;
                case 189: drawLayers([{ fill: '#000', ox: 20, oy: 20 }, { stroke: {color: '#000', width: 15}, fill: 'transparent' }, { fill: '#fef08a' }]); break;
                case 190: drawLayers([{ stroke: {color: '#0f172a', width: 12}, fill: '#0f172a', shadow: {color: '#64748b', blur: 20, x: 5, y: 5} }, { gradient: [{pos:0, color:'#f8fafc'}, {pos:1, color:'#94a3b8'}], fill: 'grad', stroke: {color: '#1e293b', width: 2} }]); break;

                case 191: drawWavy([{ stroke: {color: '#450a0a', width: 20}, fill: '#450a0a' }, { gradient: [{pos:0, color:'#fef08a'}, {pos:1, color:'#ef4444'}], fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 192: drawTriangle([{ fill: '#0f766e', ox: 10, oy: 10 }, { fill: '#5eead4', stroke: {color: '#134e4a', width: 5} }]); break;
                case 193: drawLayers([{ fill: '#000', ox: -10, oy: 10, shadow: {color: '#000', blur: 10, x: -5, y: 5} }, { fill: '#22c55e', stroke: {color: '#000', width: 5} }]); break;
                case 194: drawLayers([{ stroke: {color: '#4c1d95', width: 16}, fill: '#4c1d95', shadow: {color: '#c026d3', blur: 30, x: 0, y: 0} }, { gradient: [{pos:0, color:'#fdf4ff'}, {pos:1, color:'#f0abfc'}], fill: 'grad' }]); break;
                case 195: drawCurved([{ fill: '#854d0e', ox: 10, oy: 10 }, { fill: '#fef3c7', stroke: {color: '#d97706', width: 4} }]); break;
                case 196: drawLayers([{ stroke: {color: '#0f172a', width: 35}, fill: 'transparent' }, { stroke: {color: '#cbd5e1', width: 18}, fill: 'transparent' }, { fill: '#0f172a' }]); break;
                case 197: drawLayers([{ fill: '#be185d', ox: 15, oy: -15, shadow: {color: '#000', blur: 15, x: 5, y: 5} }, { fill: '#fbcfe8', stroke: {color: '#831843', width: 4} }]); break;
                case 198: drawTriangle([{ stroke: {color: '#831843', width: 18}, fill: '#831843', shadow: {color: '#f472b6', blur: 25, x: 0, y: 0} }, { gradient: gradChrome, fill: 'grad', stroke: {color: '#000', width: 3} }]); break;
                case 199: drawCurved([{ stroke: {color: '#000', width: 25}, fill: '#000', shadow: {color: '#000', blur: 10, x: 10, y: 10} }, { gradient: gradRainbow, fill: 'grad', stroke: {color: '#fff', width: 4} }]); break;
                case 200: drawCurved([{ stroke: {color: '#1e3a8a', width: 40}, fill: '#1e3a8a', shadow: {color: '#fff', blur: 20, x: 0, y: 0} }, { stroke: {color: '#fff', width: 15}, fill: 'transparent' }, { gradient: [{pos:0, color:'#38bdf8'}, {pos:0.5, color:'#fef08a'}, {pos:1, color:'#f472b6'}], fill: 'grad' }]); break;
                case 201: drawLayers([{ stroke: {color: '#020617', width: 14}, fill: '#020617', ox: 8, oy: 8 }, { fill: '#38bdf8', stroke: {color: '#e0f2fe', width: 3} }]); break;
                case 202: drawLayers([{ stroke: {color: '#4c1d95', width: 20}, fill: '#4c1d95', shadow: {color: '#a855f7', blur: 15, x: 0, y: 0} }, { fill: '#f3e8ff' }]); break;
                case 203: drawCircle([{ stroke: {color: '#8b5cf6', width: 18}, fill: 'transparent', shadow: {color: '#a855f7', blur: 30, x: 0, y: 0} }, { fill: '#e0e7ff', stroke: {color: '#fff', width: 3} }]); break;
                case 204: drawLayers([{ fill: '#b91c1c', ox: 15, oy: 0 }, { fill: '#fef2f2', stroke: {color: '#ef4444', width: 4} }]); break;
                case 205: drawLayers([{ stroke: {color: '#164e63', width: 25}, fill: 'transparent' }, { stroke: {color: '#67e8f9', width: 10}, fill: 'transparent' }, { fill: '#083344' }]); break;
                case 206: drawLayers([{ fill: '#eab308', shadow: {color: '#ca8a04', blur: 20, x: 0, y: 10} }, { fill: '#fef9c3', stroke: {color: '#000', width: 2} }]); break;
                case 207: drawLayers([{ fill: '#3b82f6', ox: 6, oy: 6 }, { fill: '#ec4899', ox: -6, oy: -6 }, { fill: '#fff', stroke: {color: '#000', width: 3} }]); break;
                case 208: drawLayers([{ stroke: {color: '#000', width: 18}, fill: '#000', shadow: {color: '#22c55e', blur: 30, x: 0, y: 0} }, { fill: '#dcfce7', stroke: {color: '#16a34a', width: 3} }]); break;
                case 209: drawLayers([{ fill: '#7c2d12', ox: 12, oy: 12 }, { gradient: [{pos:0, color:'#fdba74'}, {pos:1, color:'#ea580c'}], fill: 'grad', stroke: {color: '#fff', width: 2} }]); break;
                case 210: drawLayers([{ stroke: {color: '#fff', width: 25}, fill: '#fff' }, { stroke: {color: '#000', width: 15}, fill: '#000' }, { fill: '#f43f5e' }]); break;
                case 211: drawLayers([{ fill: '#1e1b4b', ox: 20, oy: 20 }, { stroke: {color: '#1e1b4b', width: 8}, fill: '#a5b4fc' }]); break;
                case 212: drawLayers([{ stroke: {color: '#831843', width: 12}, fill: 'transparent', ox: -5, oy: -5 }, { fill: '#fbcfe8', stroke: {color: '#be185d', width: 4} }]); break;
                case 213: drawLayers([{ fill: '#0f766e', ox: 10, oy: 10 }, { fill: '#14b8a6', ox: 5, oy: 5 }, { fill: '#ccfbf1' }]); break;
                case 214: drawCircle([{ stroke: {color: '#000', width: 15}, fill: '#000', shadow: {color: '#000', blur: 20, x: 5, y: 5} }, { gradient: gradChrome, fill: 'grad', stroke: {color: '#64748b', width: 3} }]); break;
                case 215: drawLayers([{ stroke: {color: '#1e293b', width: 25}, fill: '#1e293b', shadow: {color: '#000', blur: 15, x: 0, y: 10} }, { gradient: gradChrome, fill: 'grad', stroke: {color: '#fff', width: 2} }]); break;
                case 216: drawLayers([{ stroke: {color: '#111827', width: 30}, fill: '#111827' }, { stroke: {color: '#eab308', width: 12}, fill: '#eab308' }, { fill: '#fff' }]); break;
                case 217: drawLayers([{ stroke: {color: '#4c1d95', width: 16}, fill: '#4c1d95', shadow: {color: '#a855f7', blur: 25, x: 0, y: 0} }, { fill: '#000', stroke: {color: '#d8b4fe', width: 3} }]); break;
                case 218: drawLayers([{ fill: '#14532d', ox: 18, oy: -18 }, { fill: '#166534', ox: 9, oy: -9 }, { fill: '#dcfce7', stroke: {color: '#15803d', width: 3} }]); break;
                case 219: drawLayers([{ stroke: {color: '#7f1d1d', width: 22}, fill: '#7f1d1d' }, { gradient: [{pos:0, color:'#fef08a'}, {pos:1, color:'#ea580c'}], fill: 'grad' }]); break;
                case 220: drawLayers([{ stroke: {color: '#8b5cf6', width: 20}, fill: '#8b5cf6', ox: 15, oy: 15 }, { fill: '#f472b6', ox: 7, oy: 7 }, { gradient: [{pos:0, color:'#2dd4bf'}, {pos:1, color:'#38bdf8'}], fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 221: drawLayers([{ stroke: {color: '#be185d', width: 15}, fill: 'transparent', ox: 6, oy: 6 }, { fill: '#fdf2f8', stroke: {color: '#db2777', width: 5} }]); break;
                case 222: drawLayers([{ stroke: {color: '#020617', width: 24}, fill: '#020617', shadow: {color: '#64748b', blur: 20, x: 0, y: 0} }, { fill: '#f8fafc' }]); break;
                case 223: drawLayers([{ fill: '#000', ox: -12, oy: 0 }, { fill: '#000', ox: 12, oy: 0 }, { fill: '#fff', stroke: {color: '#000', width: 4} }]); break;
                case 224: drawLayers([{ stroke: {color: '#4c0519', width: 20}, fill: '#4c0519', shadow: {color: '#e11d48', blur: 30, x: 0, y: 0} }, { fill: '#ffe4e6', stroke: {color: '#f43f5e', width: 3} }]); break;
                case 225: drawLayers([{ fill: '#0c4a6e', ox: 12, oy: 12 }, { fill: '#0284c7', ox: 6, oy: 6 }, { fill: '#bae6fd' }]); break;
                case 226: drawLayers([{ stroke: {color: '#3f6212', width: 18}, fill: '#3f6212', shadow: {color: '#d9f99d', blur: 25, x: -5, y: -5} }, { fill: '#84cc16' }]); break;
                case 227: drawLayers([{ stroke: {color: '#000', width: 10}, fill: '#000', ox: 10, oy: 10 }, { gradient: [{pos:0, color:'#fbcfe8'}, {pos:1, color:'#c026d3'}], fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 228: drawLayers([{ fill: '#1e3a8a', ox: 15, oy: -15 }, { fill: '#93c5fd', stroke: {color: '#1e40af', width: 4} }]); break;
                case 229: drawLayers([{ stroke: {color: '#831843', width: 26}, fill: 'transparent' }, { stroke: {color: '#f9a8d4', width: 12}, fill: 'transparent' }, { fill: '#db2777' }]); break;
                case 230: drawLayers([{ stroke: {color: '#111827', width: 14}, fill: '#111827', shadow: {color: '#ef4444', blur: 30, x: 0, y: 0} }, { fill: '#fee2e2', stroke: {color: '#dc2626', width: 3} }]); break;
                case 231: drawLayers([{ fill: '#451a03', ox: 20, oy: 20 }, { stroke: {color: '#451a03', width: 8}, fill: '#fef3c7' }]); break;
                case 232: drawLayers([{ stroke: {color: '#0f766e', width: 15}, fill: 'transparent', ox: -6, oy: -6 }, { fill: '#ccfbf1', stroke: {color: '#0d9488', width: 5} }]); break;
                case 233: drawLayers([{ fill: '#581c87', ox: 10, oy: 10 }, { fill: '#a855f7', ox: 5, oy: 5 }, { fill: '#f3e8ff' }]); break;
                case 234: drawLayers([{ stroke: {color: '#000', width: 20}, fill: '#000', shadow: {color: '#000', blur: 15, x: 10, y: 10} }, { fill: '#facc15' }]); break;
                case 235: drawLayers([{ fill: '#7f1d1d', ox: -10, oy: 10 }, { gradient: [{pos:0, color:'#fef2f2'}, {pos:1, color:'#f87171'}], fill: 'grad', stroke: {color: '#dc2626', width: 3} }]); break;
                case 236: drawLayers([{ stroke: {color: '#0f172a', width: 32}, fill: '#0f172a' }, { stroke: {color: '#94a3b8', width: 16}, fill: '#94a3b8' }, { fill: '#f8fafc' }]); break;
                case 237: drawLayers([{ stroke: {color: '#1d4ed8', width: 16}, fill: '#1d4ed8', shadow: {color: '#60a5fa', blur: 25, x: 0, y: 0} }, { fill: '#eff6ff', stroke: {color: '#2563eb', width: 3} }]); break;
                case 238: drawLayers([{ fill: '#14532d', ox: 16, oy: -16 }, { fill: '#22c55e', ox: 8, oy: -8 }, { fill: '#f0fdf4', stroke: {color: '#166534', width: 3} }]); break;
                case 239: drawLayers([{ stroke: {color: '#4a044e', width: 22}, fill: '#4a044e' }, { gradient: [{pos:0, color:'#fae8ff'}, {pos:1, color:'#d946ef'}], fill: 'grad' }]); break;
                case 240: drawLayers([{ fill: '#000', ox: 12, oy: 12 }, { fill: '#ef4444', ox: 6, oy: 6 }, { fill: '#fff', stroke: {color: '#000', width: 4} }]); break;
                case 241: drawLayers([{ stroke: {color: '#b45309', width: 15}, fill: 'transparent', ox: 8, oy: 8 }, { fill: '#fef3c7', stroke: {color: '#d97706', width: 4} }]); break;
                case 242: drawLayers([{ stroke: {color: '#020617', width: 25}, fill: '#020617', shadow: {color: '#cbd5e1', blur: 20, x: 0, y: 0} }, { fill: '#64748b' }]); break;
                case 243: drawLayers([{ fill: '#be185d', ox: -15, oy: 0 }, { fill: '#f472b6', ox: -7, oy: 0 }, { fill: '#fff', stroke: {color: '#831843', width: 4} }]); break;
                case 244: drawLayers([{ stroke: {color: '#0c4a6e', width: 20}, fill: '#0c4a6e', shadow: {color: '#38bdf8', blur: 30, x: 0, y: 0} }, { fill: '#e0f2fe', stroke: {color: '#0284c7', width: 3} }]); break;
                case 245: drawLayers([{ fill: '#3f6212', ox: 14, oy: 14 }, { fill: '#84cc16', ox: 7, oy: 7 }, { fill: '#ecfccb' }]); break;
                case 246: drawLayers([{ stroke: {color: '#000', width: 12}, fill: '#000', ox: -10, oy: -10 }, { gradient: [{pos:0, color:'#e0e7ff'}, {pos:1, color:'#6366f1'}], fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 247: drawLayers([{ fill: '#7c2d12', ox: 18, oy: -18 }, { fill: '#ffedd5', stroke: {color: '#ea580c', width: 4} }]); break;
                case 248: drawLayers([{ stroke: {color: '#1e3a8a', width: 28}, fill: 'transparent' }, { stroke: {color: '#93c5fd', width: 14}, fill: 'transparent' }, { fill: '#1d4ed8' }]); break;
                case 249: drawLayers([{ stroke: {color: '#111827', width: 16}, fill: '#111827', shadow: {color: '#a3e635', blur: 30, x: 0, y: 0} }, { fill: '#000', stroke: {color: '#84cc16', width: 3} }]); break;
                case 250: drawLayers([{ fill: '#4c0519', ox: 20, oy: 20 }, { stroke: {color: '#4c0519', width: 8}, fill: '#ffe4e6' }]); break;
                case 251: drawLayers([{ stroke: {color: '#064e3b', width: 15}, fill: 'transparent', ox: -8, oy: -8 }, { fill: '#d1fae5', stroke: {color: '#10b981', width: 5} }]); break;
                case 252: drawLayers([{ fill: '#4c1d95', ox: 12, oy: 12 }, { fill: '#8b5cf6', ox: 6, oy: 6 }, { fill: '#f5f3ff' }]); break;
                case 253: drawLayers([{ stroke: {color: '#000', width: 22}, fill: '#000', shadow: {color: '#000', blur: 15, x: -10, y: 10} }, { fill: '#38bdf8' }]); break;
                case 254: drawLayers([{ fill: '#831843', ox: -12, oy: 12 }, { gradient: [{pos:0, color:'#fdf2f8'}, {pos:1, color:'#f472b6'}], fill: 'grad', stroke: {color: '#be185d', width: 3} }]); break;
                case 255: drawLayers([{ stroke: {color: '#0f172a', width: 34}, fill: '#0f172a' }, { stroke: {color: '#cbd5e1', width: 18}, fill: '#cbd5e1' }, { fill: '#fff' }]); break;
                case 256: drawLayers([{ stroke: {color: '#166534', width: 18}, fill: '#166534', shadow: {color: '#4ade80', blur: 25, x: 0, y: 0} }, { fill: '#f0fdf4', stroke: {color: '#22c55e', width: 3} }]); break;
                case 257: drawLayers([{ fill: '#b91c1c', ox: 15, oy: -15 }, { fill: '#ef4444', ox: 7, oy: -7 }, { fill: '#fef2f2', stroke: {color: '#7f1d1d', width: 3} }]); break;
                case 258: drawLayers([{ stroke: {color: '#3b0764', width: 24}, fill: '#3b0764' }, { gradient: [{pos:0, color:'#f3e8ff'}, {pos:1, color:'#c026d3'}], fill: 'grad' }]); break;
                case 259: drawLayers([{ fill: '#000', ox: 10, oy: 10 }, { fill: '#facc15', ox: 5, oy: 5 }, { fill: '#fff', stroke: {color: '#000', width: 4} }]); break;
                case 260: drawLayers([{ stroke: {color: '#ea580c', width: 15}, fill: 'transparent', ox: 10, oy: 10 }, { fill: '#fff7ed', stroke: {color: '#c2410c', width: 4} }]); break;
                case 261: drawLayers([{ stroke: {color: '#1e3a8a', width: 25}, fill: '#1e3a8a', font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#60a5fa', font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 262: drawLayers([{ fill: '#000', ox: 15, oy: 0, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#ef4444', stroke: {color: '#000', width: 5}, font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 263: drawLayers([{ stroke: {color: '#0f766e', width: 15}, fill: '#0f766e', shadow: {color: '#2dd4bf', blur: 20, x: 10, y: 0}, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#ccfbf1', font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 264: drawLayers([{ stroke: {color: '#4c1d95', width: 35}, fill: 'transparent', font: 'italic 900 130px "Arial Black", sans-serif' }, { stroke: {color: '#a855f7', width: 15}, fill: 'transparent', font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#fff', font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 265: drawLayers([{ fill: '#000', ox: 10, oy: 10, font: 'italic 900 130px "Arial Black", sans-serif' }, { gradient: [{pos:0, color:'#fef08a'}, {pos:1, color:'#eab308'}], fill: 'grad', stroke: {color: '#000', width: 3}, font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 266: drawLayers([{ stroke: {color: '#be185d', width: 20}, fill: '#be185d', shadow: {color: '#fbcfe8', blur: 20, x: 0, y: 0}, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#fff', font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 267: drawLayers([{ fill: '#111827', ox: -12, oy: 12, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#f8fafc', stroke: {color: '#38bdf8', width: 5}, font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 268: drawLayers([{ stroke: {color: '#0f172a', width: 18}, fill: '#0f172a', font: 'italic 900 130px "Arial Black", sans-serif' }, { gradient: [{pos:0, color:'#e2e8f0'}, {pos:1, color:'#64748b'}], fill: 'grad', font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 269: drawLayers([{ fill: '#b45309', ox: 15, oy: 15, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#f59e0b', ox: 7, oy: 7, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#fff', font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 270: drawLayers([{ stroke: {color: '#000', width: 12}, fill: 'transparent', shadow: {color: '#000', blur: 15, x: 10, y: 10}, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#22c55e', font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 271: drawLayers([{ fill: '#000', ox: 20, oy: 0, font: 'italic 900 130px "Arial Black", sans-serif' }, { stroke: {color: '#000', width: 8}, fill: '#facc15', font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 272: drawLayers([{ stroke: {color: '#4c0519', width: 15}, fill: 'transparent', ox: -8, oy: -8, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#ffe4e6', stroke: {color: '#e11d48', width: 5}, font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 273: drawLayers([{ fill: '#1e40af', ox: 10, oy: 10, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#60a5fa', ox: 5, oy: 5, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#eff6ff', font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 274: drawLayers([{ stroke: {color: '#000', width: 22}, fill: '#000', shadow: {color: '#ef4444', blur: 25, x: 0, y: 0}, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#000', stroke: {color: '#ef4444', width: 3}, font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 275: drawLayers([{ fill: '#14532d', ox: -10, oy: 10, font: 'italic 900 130px "Arial Black", sans-serif' }, { gradient: [{pos:0, color:'#f0fdf4'}, {pos:1, color:'#4ade80'}], fill: 'grad', stroke: {color: '#166534', width: 3}, font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 276: drawLayers([{ stroke: {color: '#3b0764', width: 32}, fill: '#3b0764', font: 'italic 900 130px "Arial Black", sans-serif' }, { stroke: {color: '#d8b4fe', width: 16}, fill: '#d8b4fe', font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#fff', font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 277: drawLayers([{ stroke: {color: '#ea580c', width: 16}, fill: '#ea580c', shadow: {color: '#fbd38d', blur: 25, x: 0, y: 0}, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#fff7ed', stroke: {color: '#c2410c', width: 3}, font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 278: drawLayers([{ fill: '#0f172a', ox: 16, oy: -16, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#64748b', ox: 8, oy: -8, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#f8fafc', stroke: {color: '#334155', width: 3}, font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 279: drawLayers([{ stroke: {color: '#000', width: 20}, fill: '#000', font: 'italic 900 130px "Arial Black", sans-serif' }, { gradient: [{pos:0, color:'#fbcfe8'}, {pos:1, color:'#be185d'}], fill: 'grad', font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 280: drawLayers([{ fill: '#000', ox: 12, oy: 12, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#22d3ee', ox: 6, oy: 6, font: 'italic 900 130px "Arial Black", sans-serif' }, { fill: '#fff', stroke: {color: '#000', width: 4}, font: 'italic 900 130px "Arial Black", sans-serif' }]); break;
                case 281: drawLayers([{ stroke: {color: '#1e3a8a', width: 15}, fill: '#1e3a8a', font: '900 130px "Courier New", monospace' }, { fill: '#93c5fd', font: '900 130px "Courier New", monospace' }]); break;
                case 282: drawLayers([{ fill: '#000', ox: 10, oy: 10, font: '900 130px "Courier New", monospace' }, { fill: '#4ade80', stroke: {color: '#000', width: 4}, font: '900 130px "Courier New", monospace' }]); break;
                case 283: drawLayers([{ stroke: {color: '#0f766e', width: 12}, fill: '#0f766e', shadow: {color: '#5eead4', blur: 20, x: 0, y: 0}, font: '900 130px "Courier New", monospace' }, { fill: '#ccfbf1', font: '900 130px "Courier New", monospace' }]); break;
                case 284: drawLayers([{ stroke: {color: '#4c1d95', width: 25}, fill: 'transparent', font: '900 130px "Courier New", monospace' }, { stroke: {color: '#c4b5fd', width: 10}, fill: 'transparent', font: '900 130px "Courier New", monospace' }, { fill: '#fff', font: '900 130px "Courier New", monospace' }]); break;
                case 285: drawLayers([{ fill: '#000', ox: 8, oy: 8, font: '900 130px "Courier New", monospace' }, { gradient: [{pos:0, color:'#fca5a5'}, {pos:1, color:'#b91c1c'}], fill: 'grad', stroke: {color: '#000', width: 3}, font: '900 130px "Courier New", monospace' }]); break;
                case 286: drawLayers([{ stroke: {color: '#000', width: 16}, fill: '#000', shadow: {color: '#fff', blur: 15, x: 0, y: 0}, font: '900 130px "Courier New", monospace' }, { fill: '#111827', font: '900 130px "Courier New", monospace' }]); break;
                case 287: drawLayers([{ fill: '#1e1b4b', ox: -10, oy: 10, font: '900 130px "Courier New", monospace' }, { fill: '#e0e7ff', stroke: {color: '#6366f1', width: 4}, font: '900 130px "Courier New", monospace' }]); break;
                case 288: drawLayers([{ stroke: {color: '#451a03', width: 14}, fill: '#451a03', font: '900 130px "Courier New", monospace' }, { gradient: [{pos:0, color:'#fef3c7'}, {pos:1, color:'#d97706'}], fill: 'grad', font: '900 130px "Courier New", monospace' }]); break;
                case 289: drawLayers([{ fill: '#be185d', ox: 12, oy: 12, font: '900 130px "Courier New", monospace' }, { fill: '#f472b6', ox: 6, oy: 6, font: '900 130px "Courier New", monospace' }, { fill: '#fff', font: '900 130px "Courier New", monospace' }]); break;
                case 290: drawLayers([{ stroke: {color: '#000', width: 10}, fill: 'transparent', shadow: {color: '#000', blur: 15, x: 10, y: 10}, font: '900 130px "Courier New", monospace' }, { fill: '#eab308', font: '900 130px "Courier New", monospace' }]); break;
                case 291: drawLayers([{ fill: '#000', ox: 15, oy: 0, font: '900 130px "Courier New", monospace' }, { stroke: {color: '#000', width: 6}, fill: '#38bdf8', font: '900 130px "Courier New", monospace' }]); break;
                case 292: drawLayers([{ stroke: {color: '#14532d', width: 12}, fill: 'transparent', ox: -6, oy: -6, font: '900 130px "Courier New", monospace' }, { fill: '#dcfce7', stroke: {color: '#16a34a', width: 4}, font: '900 130px "Courier New", monospace' }]); break;
                case 293: drawLayers([{ fill: '#7f1d1d', ox: 10, oy: 10, font: '900 130px "Courier New", monospace' }, { fill: '#ef4444', ox: 5, oy: 5, font: '900 130px "Courier New", monospace' }, { fill: '#fef2f2', font: '900 130px "Courier New", monospace' }]); break;
                case 294: drawLayers([{ stroke: {color: '#000', width: 18}, fill: '#000', shadow: {color: '#a855f7', blur: 25, x: 0, y: 0}, font: '900 130px "Courier New", monospace' }, { fill: '#000', stroke: {color: '#d8b4fe', width: 3}, font: '900 130px "Courier New", monospace' }]); break;
                case 295: drawLayers([{ fill: '#0f172a', ox: -10, oy: 10, font: '900 130px "Courier New", monospace' }, { gradient: [{pos:0, color:'#f1f5f9'}, {pos:1, color:'#94a3b8'}], fill: 'grad', stroke: {color: '#334155', width: 3}, font: '900 130px "Courier New", monospace' }]); break;
                case 296: drawLayers([{ stroke: {color: '#7c2d12', width: 28}, fill: '#7c2d12', font: '900 130px "Courier New", monospace' }, { stroke: {color: '#fdba74', width: 14}, fill: '#fdba74', font: '900 130px "Courier New", monospace' }, { fill: '#fff', font: '900 130px "Courier New", monospace' }]); break;
                case 297: drawLayers([{ stroke: {color: '#831843', width: 14}, fill: '#831843', shadow: {color: '#f9a8d4', blur: 25, x: 0, y: 0}, font: '900 130px "Courier New", monospace' }, { fill: '#fdf2f8', stroke: {color: '#db2777', width: 3}, font: '900 130px "Courier New", monospace' }]); break;
                case 298: drawLayers([{ fill: '#064e3b', ox: 14, oy: -14, font: '900 130px "Courier New", monospace' }, { fill: '#34d399', ox: 7, oy: -7, font: '900 130px "Courier New", monospace' }, { fill: '#ecfdf5', stroke: {color: '#059669', width: 3}, font: '900 130px "Courier New", monospace' }]); break;
                case 299: drawLayers([{ stroke: {color: '#000', width: 18}, fill: '#000', font: '900 130px "Courier New", monospace' }, { gradient: [{pos:0, color:'#e0f2fe'}, {pos:1, color:'#0ea5e9'}], fill: 'grad', font: '900 130px "Courier New", monospace' }]); break;
                case 300: drawLayers([{ fill: '#000', ox: 10, oy: 10, font: '900 130px "Courier New", monospace' }, { fill: '#facc15', ox: 5, oy: 5, font: '900 130px "Courier New", monospace' }, { fill: '#fff', stroke: {color: '#000', width: 4}, font: '900 130px "Courier New", monospace' }]); break;
                case 301: drawLayers([{ stroke: {color: '#1e3a8a', width: 12}, fill: '#1e3a8a', font: '900 130px "Times New Roman", serif' }, { fill: '#bfdbfe', font: '900 130px "Times New Roman", serif' }]); break;
                case 302: drawLayers([{ fill: '#000', ox: 8, oy: 8, font: '900 130px "Times New Roman", serif' }, { fill: '#eab308', stroke: {color: '#000', width: 3}, font: '900 130px "Times New Roman", serif' }]); break;
                case 303: drawLayers([{ stroke: {color: '#0f766e', width: 10}, fill: '#0f766e', shadow: {color: '#5eead4', blur: 15, x: 0, y: 0}, font: '900 130px "Times New Roman", serif' }, { fill: '#ccfbf1', font: '900 130px "Times New Roman", serif' }]); break;
                case 304: drawLayers([{ stroke: {color: '#4c1d95', width: 22}, fill: 'transparent', font: '900 130px "Times New Roman", serif' }, { stroke: {color: '#c4b5fd', width: 8}, fill: 'transparent', font: '900 130px "Times New Roman", serif' }, { fill: '#fff', font: '900 130px "Times New Roman", serif' }]); break;
                case 305: drawLayers([{ fill: '#000', ox: 6, oy: 6, font: '900 130px "Times New Roman", serif' }, { gradient: [{pos:0, color:'#fca5a5'}, {pos:1, color:'#b91c1c'}], fill: 'grad', stroke: {color: '#000', width: 2}, font: '900 130px "Times New Roman", serif' }]); break;
                case 306: drawLayers([{ stroke: {color: '#000', width: 14}, fill: '#000', shadow: {color: '#fff', blur: 12, x: 0, y: 0}, font: '900 130px "Times New Roman", serif' }, { fill: '#111827', font: '900 130px "Times New Roman", serif' }]); break;
                case 307: drawLayers([{ fill: '#1e1b4b', ox: -8, oy: 8, font: '900 130px "Times New Roman", serif' }, { fill: '#e0e7ff', stroke: {color: '#6366f1', width: 3}, font: '900 130px "Times New Roman", serif' }]); break;
                case 308: drawLayers([{ stroke: {color: '#451a03', width: 12}, fill: '#451a03', font: '900 130px "Times New Roman", serif' }, { gradient: [{pos:0, color:'#fef3c7'}, {pos:1, color:'#d97706'}], fill: 'grad', font: '900 130px "Times New Roman", serif' }]); break;
                case 309: drawLayers([{ fill: '#be185d', ox: 10, oy: 10, font: '900 130px "Times New Roman", serif' }, { fill: '#f472b6', ox: 5, oy: 5, font: '900 130px "Times New Roman", serif' }, { fill: '#fff', font: '900 130px "Times New Roman", serif' }]); break;
                case 310: drawLayers([{ stroke: {color: '#000', width: 8}, fill: 'transparent', shadow: {color: '#000', blur: 12, x: 8, y: 8}, font: '900 130px "Times New Roman", serif' }, { fill: '#34d399', font: '900 130px "Times New Roman", serif' }]); break;
                case 311: drawLayers([{ fill: '#000', ox: 12, oy: 0, font: '900 130px "Times New Roman", serif' }, { stroke: {color: '#000', width: 5}, fill: '#fbbf24', font: '900 130px "Times New Roman", serif' }]); break;
                case 312: drawLayers([{ stroke: {color: '#14532d', width: 10}, fill: 'transparent', ox: -5, oy: -5, font: '900 130px "Times New Roman", serif' }, { fill: '#dcfce7', stroke: {color: '#16a34a', width: 3}, font: '900 130px "Times New Roman", serif' }]); break;
                case 313: drawLayers([{ fill: '#7f1d1d', ox: 8, oy: 8, font: '900 130px "Times New Roman", serif' }, { fill: '#ef4444', ox: 4, oy: 4, font: '900 130px "Times New Roman", serif' }, { fill: '#fef2f2', font: '900 130px "Times New Roman", serif' }]); break;
                case 314: drawLayers([{ stroke: {color: '#000', width: 16}, fill: '#000', shadow: {color: '#a855f7', blur: 20, x: 0, y: 0}, font: '900 130px "Times New Roman", serif' }, { fill: '#000', stroke: {color: '#d8b4fe', width: 2}, font: '900 130px "Times New Roman", serif' }]); break;
                case 315: drawLayers([{ fill: '#0f172a', ox: -8, oy: 8, font: '900 130px "Times New Roman", serif' }, { gradient: [{pos:0, color:'#f1f5f9'}, {pos:1, color:'#94a3b8'}], fill: 'grad', stroke: {color: '#334155', width: 2}, font: '900 130px "Times New Roman", serif' }]); break;
                case 316: drawLayers([{ stroke: {color: '#7c2d12', width: 24}, fill: '#7c2d12', font: '900 130px "Times New Roman", serif' }, { stroke: {color: '#fdba74', width: 12}, fill: '#fdba74', font: '900 130px "Times New Roman", serif' }, { fill: '#fff', font: '900 130px "Times New Roman", serif' }]); break;
                case 317: drawLayers([{ stroke: {color: '#831843', width: 12}, fill: '#831843', shadow: {color: '#f9a8d4', blur: 20, x: 0, y: 0}, font: '900 130px "Times New Roman", serif' }, { fill: '#fdf2f8', stroke: {color: '#db2777', width: 2}, font: '900 130px "Times New Roman", serif' }]); break;
                case 318: drawLayers([{ fill: '#064e3b', ox: 12, oy: -12, font: '900 130px "Times New Roman", serif' }, { fill: '#34d399', ox: 6, oy: -6, font: '900 130px "Times New Roman", serif' }, { fill: '#ecfdf5', stroke: {color: '#059669', width: 2}, font: '900 130px "Times New Roman", serif' }]); break;
                case 319: drawLayers([{ stroke: {color: '#000', width: 16}, fill: '#000', font: '900 130px "Times New Roman", serif' }, { gradient: [{pos:0, color:'#e0f2fe'}, {pos:1, color:'#0ea5e9'}], fill: 'grad', font: '900 130px "Times New Roman", serif' }]); break;
                case 320: drawLayers([{ fill: '#000', ox: 8, oy: 8, font: '900 130px "Times New Roman", serif' }, { fill: '#facc15', ox: 4, oy: 4, font: '900 130px "Times New Roman", serif' }, { fill: '#fff', stroke: {color: '#000', width: 3}, font: '900 130px "Times New Roman", serif' }]); break;
                case 321: drawLayers([{ stroke: {color: '#1e3a8a', width: 20}, fill: '#1e3a8a', ox: 5, oy: 5 }, { fill: '#60a5fa', stroke: {color: '#fff', width: 4} }]); break;
                case 322: drawLayers([{ stroke: {color: '#4c1d95', width: 22}, fill: '#4c1d95', shadow: {color: '#a855f7', blur: 15, x: -5, y: 5} }, { fill: '#f3e8ff' }]); break;
                case 323: drawLayers([{ fill: '#000', ox: -12, oy: -12 }, { fill: '#fff', stroke: {color: '#000', width: 6} }]); break;
                case 324: drawLayers([{ fill: '#b91c1c', ox: 18, oy: 0 }, { fill: '#fef2f2', stroke: {color: '#ef4444', width: 5} }]); break;
                case 325: drawLayers([{ stroke: {color: '#164e63', width: 28}, fill: 'transparent' }, { stroke: {color: '#67e8f9', width: 12}, fill: 'transparent' }, { fill: '#083344' }]); break;
                case 326: drawLayers([{ fill: '#eab308', shadow: {color: '#ca8a04', blur: 25, x: 0, y: 12} }, { fill: '#fef9c3', stroke: {color: '#000', width: 3} }]); break;
                case 327: drawLayers([{ fill: '#3b82f6', ox: 8, oy: 8 }, { fill: '#ec4899', ox: -8, oy: -8 }, { fill: '#fff', stroke: {color: '#000', width: 4} }]); break;
                case 328: drawLayers([{ stroke: {color: '#000', width: 20}, fill: '#000', shadow: {color: '#22c55e', blur: 35, x: 0, y: 0} }, { fill: '#dcfce7', stroke: {color: '#16a34a', width: 4} }]); break;
                case 329: drawLayers([{ fill: '#7c2d12', ox: 14, oy: 14 }, { gradient: [{pos:0, color:'#fdba74'}, {pos:1, color:'#ea580c'}], fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 330: drawLayers([{ stroke: {color: '#fff', width: 28}, fill: '#fff' }, { stroke: {color: '#000', width: 16}, fill: '#000' }, { fill: '#f43f5e' }]); break;
                case 331: drawLayers([{ fill: '#1e1b4b', ox: 22, oy: 22 }, { stroke: {color: '#1e1b4b', width: 10}, fill: '#a5b4fc' }]); break;
                case 332: drawLayers([{ stroke: {color: '#831843', width: 14}, fill: 'transparent', ox: -6, oy: -6 }, { fill: '#fbcfe8', stroke: {color: '#be185d', width: 5} }]); break;
                case 333: drawLayers([{ fill: '#0f766e', ox: 12, oy: 12 }, { fill: '#14b8a6', ox: 6, oy: 6 }, { fill: '#ccfbf1' }]); break;
                case 334: drawLayers([{ stroke: {color: '#000', width: 10}, fill: 'transparent', shadow: {color: '#000', blur: 18, x: 0, y: 18} }, { fill: '#fff' }]); break;
                case 335: drawLayers([{ fill: '#450a0a', ox: -10, oy: 10 }, { gradient: [{pos:0, color:'#fef2f2'}, {pos:1, color:'#fca5a5'}], fill: 'grad', stroke: {color: '#dc2626', width: 5} }]); break;
                case 336: drawLayers([{ stroke: {color: '#111827', width: 32}, fill: '#111827' }, { stroke: {color: '#eab308', width: 14}, fill: '#eab308' }, { fill: '#fff' }]); break;
                case 337: drawLayers([{ stroke: {color: '#4c1d95', width: 18}, fill: '#4c1d95', shadow: {color: '#a855f7', blur: 28, x: 0, y: 0} }, { fill: '#000', stroke: {color: '#d8b4fe', width: 4} }]); break;
                case 338: drawLayers([{ fill: '#14532d', ox: 20, oy: -20 }, { fill: '#166534', ox: 10, oy: -10 }, { fill: '#dcfce7', stroke: {color: '#15803d', width: 4} }]); break;
                case 339: drawLayers([{ stroke: {color: '#7f1d1d', width: 24}, fill: '#7f1d1d' }, { gradient: [{pos:0, color:'#fef08a'}, {pos:1, color:'#ea580c'}], fill: 'grad' }]); break;
                case 340: drawLayers([{ fill: '#000', ox: 18, oy: 18 }, { fill: '#3b82f6', ox: 12, oy: 12 }, { fill: '#fff', stroke: {color: '#000', width: 5} }]); break;
                case 341: drawLayers([{ stroke: {color: '#be185d', width: 16}, fill: 'transparent', ox: 8, oy: 8 }, { fill: '#fdf2f8', stroke: {color: '#db2777', width: 6} }]); break;
                case 342: drawLayers([{ stroke: {color: '#020617', width: 26}, fill: '#020617', shadow: {color: '#64748b', blur: 22, x: 0, y: 0} }, { fill: '#f8fafc' }]); break;
                case 343: drawLayers([{ fill: '#000', ox: -14, oy: 0 }, { fill: '#000', ox: 14, oy: 0 }, { fill: '#fff', stroke: {color: '#000', width: 5} }]); break;
                case 344: drawLayers([{ stroke: {color: '#4c0519', width: 22}, fill: '#4c0519', shadow: {color: '#e11d48', blur: 32, x: 0, y: 0} }, { fill: '#ffe4e6', stroke: {color: '#f43f5e', width: 4} }]); break;
                case 345: drawLayers([{ fill: '#0c4a6e', ox: 14, oy: 14 }, { fill: '#0284c7', ox: 7, oy: 7 }, { fill: '#bae6fd' }]); break;
                case 346: drawLayers([{ stroke: {color: '#3f6212', width: 20}, fill: '#3f6212', shadow: {color: '#d9f99d', blur: 28, x: -6, y: -6} }, { fill: '#84cc16' }]); break;
                case 347: drawLayers([{ stroke: {color: '#000', width: 12}, fill: '#000', ox: 12, oy: 12 }, { gradient: [{pos:0, color:'#fbcfe8'}, {pos:1, color:'#c026d3'}], fill: 'grad', stroke: {color: '#fff', width: 4} }]); break;
                case 348: drawLayers([{ fill: '#1e3a8a', ox: 18, oy: -18 }, { fill: '#93c5fd', stroke: {color: '#1e40af', width: 5} }]); break;
                case 349: drawLayers([{ stroke: {color: '#831843', width: 28}, fill: 'transparent' }, { stroke: {color: '#f9a8d4', width: 14}, fill: 'transparent' }, { fill: '#db2777' }]); break;
                case 350: drawLayers([{ stroke: {color: '#111827', width: 16}, fill: '#111827', shadow: {color: '#ef4444', blur: 32, x: 0, y: 0} }, { fill: '#fee2e2', stroke: {color: '#dc2626', width: 4} }]); break;
                case 351: drawLayers([{ fill: '#451a03', ox: 22, oy: 22 }, { stroke: {color: '#451a03', width: 10}, fill: '#fef3c7' }]); break;
                case 352: drawLayers([{ stroke: {color: '#0f766e', width: 16}, fill: 'transparent', ox: -8, oy: -8 }, { fill: '#ccfbf1', stroke: {color: '#0d9488', width: 6} }]); break;
                case 353: drawLayers([{ fill: '#581c87', ox: 12, oy: 12 }, { fill: '#a855f7', ox: 6, oy: 6 }, { fill: '#f3e8ff' }]); break;
                case 354: drawLayers([{ stroke: {color: '#000', width: 22}, fill: '#000', shadow: {color: '#000', blur: 18, x: 12, y: 12} }, { fill: '#facc15' }]); break;
                case 355: drawLayers([{ fill: '#7f1d1d', ox: -12, oy: 12 }, { gradient: [{pos:0, color:'#fef2f2'}, {pos:1, color:'#f87171'}], fill: 'grad', stroke: {color: '#dc2626', width: 4} }]); break;
                case 356: drawLayers([{ stroke: {color: '#0f172a', width: 34}, fill: '#0f172a' }, { stroke: {color: '#94a3b8', width: 18}, fill: '#94a3b8' }, { fill: '#f8fafc' }]); break;
                case 357: drawLayers([{ stroke: {color: '#1d4ed8', width: 18}, fill: '#1d4ed8', shadow: {color: '#60a5fa', blur: 28, x: 0, y: 0} }, { fill: '#eff6ff', stroke: {color: '#2563eb', width: 4} }]); break;
                case 358: drawLayers([{ fill: '#14532d', ox: 18, oy: -18 }, { fill: '#22c55e', ox: 9, oy: -9 }, { fill: '#f0fdf4', stroke: {color: '#166534', width: 4} }]); break;
                case 359: drawLayers([{ stroke: {color: '#4a044e', width: 24}, fill: '#4a044e' }, { gradient: [{pos:0, color:'#fae8ff'}, {pos:1, color:'#d946ef'}], fill: 'grad' }]); break;
                case 360: drawLayers([{ fill: '#000', ox: 14, oy: 14 }, { fill: '#ef4444', ox: 7, oy: 7 }, { fill: '#fff', stroke: {color: '#000', width: 5} }]); break;
                case 361: drawLayers([{ stroke: {color: '#b45309', width: 16}, fill: 'transparent', ox: 10, oy: 10 }, { fill: '#fef3c7', stroke: {color: '#d97706', width: 5} }]); break;
                case 362: drawLayers([{ stroke: {color: '#020617', width: 26}, fill: '#020617', shadow: {color: '#cbd5e1', blur: 22, x: 0, y: 0} }, { fill: '#64748b' }]); break;
                case 363: drawLayers([{ fill: '#be185d', ox: -18, oy: 0 }, { fill: '#f472b6', ox: -9, oy: 0 }, { fill: '#fff', stroke: {color: '#831843', width: 5} }]); break;
                case 364: drawLayers([{ stroke: {color: '#0c4a6e', width: 22}, fill: '#0c4a6e', shadow: {color: '#38bdf8', blur: 32, x: 0, y: 0} }, { fill: '#e0f2fe', stroke: {color: '#0284c7', width: 4} }]); break;
                case 365: drawLayers([{ fill: '#3f6212', ox: 16, oy: 16 }, { fill: '#84cc16', ox: 8, oy: 8 }, { fill: '#ecfccb' }]); break;
                case 366: drawLayers([{ stroke: {color: '#000', width: 14}, fill: '#000', ox: -12, oy: -12 }, { gradient: [{pos:0, color:'#e0e7ff'}, {pos:1, color:'#6366f1'}], fill: 'grad', stroke: {color: '#fff', width: 4} }]); break;
                case 367: drawLayers([{ fill: '#7c2d12', ox: 20, oy: -20 }, { fill: '#ffedd5', stroke: {color: '#ea580c', width: 5} }]); break;
                case 368: drawLayers([{ stroke: {color: '#1e3a8a', width: 30}, fill: 'transparent' }, { stroke: {color: '#93c5fd', width: 16}, fill: 'transparent' }, { fill: '#1d4ed8' }]); break;
                case 369: drawLayers([{ stroke: {color: '#111827', width: 18}, fill: '#111827', shadow: {color: '#a3e635', blur: 32, x: 0, y: 0} }, { fill: '#000', stroke: {color: '#84cc16', width: 4} }]); break;
                case 370: drawLayers([{ fill: '#4c0519', ox: 22, oy: 22 }, { stroke: {color: '#4c0519', width: 10}, fill: '#ffe4e6' }]); break;
                case 371: drawLayers([{ stroke: {color: '#064e3b', width: 16}, fill: 'transparent', ox: -10, oy: -10 }, { fill: '#d1fae5', stroke: {color: '#10b981', width: 6} }]); break;
                case 372: drawLayers([{ fill: '#4c1d95', ox: 14, oy: 14 }, { fill: '#8b5cf6', ox: 7, oy: 7 }, { fill: '#f5f3ff' }]); break;
                case 373: drawLayers([{ stroke: {color: '#000', width: 24}, fill: '#000', shadow: {color: '#000', blur: 18, x: -12, y: 12} }, { fill: '#38bdf8' }]); break;
                case 374: drawLayers([{ fill: '#831843', ox: -14, oy: 14 }, { gradient: [{pos:0, color:'#fdf2f8'}, {pos:1, color:'#f472b6'}], fill: 'grad', stroke: {color: '#be185d', width: 4} }]); break;
                case 375: drawLayers([{ stroke: {color: '#0f172a', width: 36}, fill: '#0f172a' }, { stroke: {color: '#cbd5e1', width: 20}, fill: '#cbd5e1' }, { fill: '#fff' }]); break;
                case 376: drawLayers([{ stroke: {color: '#166534', width: 20}, fill: '#166534', shadow: {color: '#4ade80', blur: 28, x: 0, y: 0} }, { fill: '#f0fdf4', stroke: {color: '#22c55e', width: 4} }]); break;
                case 377: drawLayers([{ fill: '#b91c1c', ox: 18, oy: -18 }, { fill: '#ef4444', ox: 9, oy: -9 }, { fill: '#fef2f2', stroke: {color: '#7f1d1d', width: 4} }]); break;
                case 378: drawLayers([{ stroke: {color: '#3b0764', width: 26}, fill: '#3b0764' }, { gradient: [{pos:0, color:'#f3e8ff'}, {pos:1, color:'#c026d3'}], fill: 'grad' }]); break;
                case 379: drawLayers([{ fill: '#000', ox: 12, oy: 12 }, { fill: '#facc15', ox: 6, oy: 6 }, { fill: '#fff', stroke: {color: '#000', width: 5} }]); break;
                case 380: drawLayers([{ stroke: {color: '#ea580c', width: 16}, fill: 'transparent', ox: 12, oy: 12 }, { fill: '#fff7ed', stroke: {color: '#c2410c', width: 5} }]); break;
                case 381: drawLayers([{ fill: '#020617', ox: 10, oy: 10 }, { fill: '#3b82f6', ox: -5, oy: -5 }, { fill: '#fff', stroke: {color: '#000', width: 3} }]); break;
                case 382: drawLayers([{ stroke: {color: '#4c1d95', width: 18}, fill: '#4c1d95', shadow: {color: '#a855f7', blur: 20, x: 5, y: -5} }, { fill: '#f3e8ff' }]); break;
                case 383: drawLayers([{ fill: '#000', ox: -15, oy: -15 }, { fill: '#fff', stroke: {color: '#000', width: 4} }]); break;
                case 384: drawLayers([{ fill: '#b91c1c', ox: 0, oy: 15 }, { fill: '#fef2f2', stroke: {color: '#ef4444', width: 3} }]); break;
                case 385: drawLayers([{ stroke: {color: '#164e63', width: 22}, fill: 'transparent' }, { stroke: {color: '#67e8f9', width: 8}, fill: 'transparent' }, { fill: '#083344' }]); break;
                case 386: drawLayers([{ fill: '#eab308', shadow: {color: '#ca8a04', blur: 15, x: 0, y: -10} }, { fill: '#fef9c3', stroke: {color: '#000', width: 3} }]); break;
                case 387: drawLayers([{ fill: '#3b82f6', ox: 10, oy: 0 }, { fill: '#ec4899', ox: -10, oy: 0 }, { fill: '#fff', stroke: {color: '#000', width: 2} }]); break;
                case 388: drawLayers([{ stroke: {color: '#000', width: 15}, fill: '#000', shadow: {color: '#22c55e', blur: 20, x: 0, y: 0} }, { fill: '#dcfce7', stroke: {color: '#16a34a', width: 2} }]); break;
                case 389: drawLayers([{ fill: '#7c2d12', ox: 8, oy: 8 }, { gradient: [{pos:0, color:'#fdba74'}, {pos:1, color:'#ea580c'}], fill: 'grad', stroke: {color: '#fff', width: 3} }]); break;
                case 390: drawLayers([{ stroke: {color: '#fff', width: 20}, fill: '#fff' }, { stroke: {color: '#000', width: 10}, fill: '#000' }, { fill: '#f43f5e' }]); break;
                case 391: drawLayers([{ fill: '#1e1b4b', ox: 15, oy: 15 }, { stroke: {color: '#1e1b4b', width: 6}, fill: '#a5b4fc' }]); break;
                case 392: drawLayers([{ stroke: {color: '#831843', width: 10}, fill: 'transparent', ox: -8, oy: 8 }, { fill: '#fbcfe8', stroke: {color: '#be185d', width: 3} }]); break;
                case 393: drawLayers([{ fill: '#0f766e', ox: 8, oy: 8 }, { fill: '#14b8a6', ox: 4, oy: 4 }, { fill: '#ccfbf1' }]); break;
                case 394: drawLayers([{ stroke: {color: '#000', width: 6}, fill: 'transparent', shadow: {color: '#000', blur: 10, x: 0, y: -15} }, { fill: '#fff' }]); break;
                case 395: drawLayers([{ fill: '#450a0a', ox: -5, oy: -5 }, { gradient: [{pos:0, color:'#fef2f2'}, {pos:1, color:'#fca5a5'}], fill: 'grad', stroke: {color: '#dc2626', width: 2} }]); break;
                case 396: drawLayers([{ stroke: {color: '#111827', width: 25}, fill: '#111827' }, { stroke: {color: '#eab308', width: 10}, fill: '#eab308' }, { fill: '#fff' }]); break;
                case 397: drawLayers([{ stroke: {color: '#4c1d95', width: 14}, fill: '#4c1d95', shadow: {color: '#a855f7', blur: 20, x: 0, y: 0} }, { fill: '#000', stroke: {color: '#d8b4fe', width: 2} }]); break;
                case 398: drawLayers([{ fill: '#14532d', ox: 15, oy: 0 }, { fill: '#166534', ox: 7, oy: 0 }, { fill: '#dcfce7', stroke: {color: '#15803d', width: 2} }]); break;
                case 399: drawLayers([{ stroke: {color: '#7f1d1d', width: 18}, fill: '#7f1d1d' }, { gradient: [{pos:0, color:'#fef08a'}, {pos:1, color:'#ea580c'}], fill: 'grad' }]); break;
                case 400: drawLayers([{ fill: '#000', ox: 10, oy: -10 }, { fill: '#3b82f6', ox: 5, oy: -5 }, { fill: '#fff', stroke: {color: '#000', width: 3} }]); break;
                case 401: drawLayers([{ fill: '#020617', ox: 12, oy: 12 }, { fill: '#3b82f6', ox: -6, oy: -6 }, { fill: '#fff', stroke: {color: '#000', width: 4} }]); break;
                case 402: drawLayers([{ stroke: {color: '#4c1d95', width: 22}, fill: '#4c1d95', shadow: {color: '#a855f7', blur: 25, x: 5, y: -5} }, { fill: '#f3e8ff' }]); break;
                case 403: drawLayers([{ fill: '#000', ox: -18, oy: -18 }, { fill: '#fff', stroke: {color: '#000', width: 5} }]); break;
                case 404: drawLayers([{ fill: '#b91c1c', ox: 0, oy: 18 }, { fill: '#fef2f2', stroke: {color: '#ef4444', width: 4} }]); break;
                case 405: drawLayers([{ stroke: {color: '#164e63', width: 26}, fill: 'transparent' }, { stroke: {color: '#67e8f9', width: 10}, fill: 'transparent' }, { fill: '#083344' }]); break;
                case 406: drawLayers([{ fill: '#eab308', shadow: {color: '#ca8a04', blur: 18, x: 0, y: -12} }, { fill: '#fef9c3', stroke: {color: '#000', width: 4} }]); break;
                case 407: drawLayers([{ fill: '#3b82f6', ox: 12, oy: 0 }, { fill: '#ec4899', ox: -12, oy: 0 }, { fill: '#fff', stroke: {color: '#000', width: 3} }]); break;
                case 408: drawLayers([{ stroke: {color: '#000', width: 18}, fill: '#000', shadow: {color: '#22c55e', blur: 24, x: 0, y: 0} }, { fill: '#dcfce7', stroke: {color: '#16a34a', width: 3} }]); break;
                case 409: drawLayers([{ fill: '#7c2d12', ox: 10, oy: 10 }, { gradient: [{pos:0, color:'#fdba74'}, {pos:1, color:'#ea580c'}], fill: 'grad', stroke: {color: '#fff', width: 4} }]); break;
                case 410: drawLayers([{ stroke: {color: '#fff', width: 24}, fill: '#fff' }, { stroke: {color: '#000', width: 12}, fill: '#000' }, { fill: '#f43f5e' }]); break;
                case 411: drawLayers([{ fill: '#1e1b4b', ox: 18, oy: 18 }, { stroke: {color: '#1e1b4b', width: 7}, fill: '#a5b4fc' }]); break;
                case 412: drawLayers([{ stroke: {color: '#831843', width: 12}, fill: 'transparent', ox: -10, oy: 10 }, { fill: '#fbcfe8', stroke: {color: '#be185d', width: 4} }]); break;
                case 413: drawLayers([{ fill: '#0f766e', ox: 10, oy: 10 }, { fill: '#14b8a6', ox: 5, oy: 5 }, { fill: '#ccfbf1' }]); break;
                case 414: drawLayers([{ stroke: {color: '#000', width: 7}, fill: 'transparent', shadow: {color: '#000', blur: 12, x: 0, y: -18} }, { fill: '#fff' }]); break;
                case 415: drawLayers([{ fill: '#450a0a', ox: -6, oy: -6 }, { gradient: [{pos:0, color:'#fef2f2'}, {pos:1, color:'#fca5a5'}], fill: 'grad', stroke: {color: '#dc2626', width: 3} }]); break;
                case 416: drawLayers([{ stroke: {color: '#111827', width: 30}, fill: '#111827' }, { stroke: {color: '#eab308', width: 12}, fill: '#eab308' }, { fill: '#fff' }]); break;
                case 417: drawLayers([{ stroke: {color: '#4c1d95', width: 16}, fill: '#4c1d95', shadow: {color: '#a855f7', blur: 24, x: 0, y: 0} }, { fill: '#000', stroke: {color: '#d8b4fe', width: 3} }]); break;
                case 418: drawLayers([{ fill: '#14532d', ox: 18, oy: 0 }, { fill: '#166534', ox: 9, oy: 0 }, { fill: '#dcfce7', stroke: {color: '#15803d', width: 3} }]); break;
                case 419: drawLayers([{ stroke: {color: '#7f1d1d', width: 22}, fill: '#7f1d1d' }, { gradient: [{pos:0, color:'#fef08a'}, {pos:1, color:'#ea580c'}], fill: 'grad' }]); break;
                case 420: drawLayers([{ fill: '#000', ox: 12, oy: -12 }, { fill: '#3b82f6', ox: 6, oy: -6 }, { fill: '#fff', stroke: {color: '#000', width: 4} }]); break;
                case 421: drawLayers([{ fill: '#020617', ox: 14, oy: 14 }, { fill: '#3b82f6', ox: -7, oy: -7 }, { fill: '#fff', stroke: {color: '#000', width: 5} }]); break;
                case 422: drawLayers([{ stroke: {color: '#4c1d95', width: 26}, fill: '#4c1d95', shadow: {color: '#a855f7', blur: 30, x: 5, y: -5} }, { fill: '#f3e8ff' }]); break;
                case 423: drawLayers([{ fill: '#000', ox: -22, oy: -22 }, { fill: '#fff', stroke: {color: '#000', width: 6} }]); break;
                case 424: drawLayers([{ fill: '#b91c1c', ox: 0, oy: 22 }, { fill: '#fef2f2', stroke: {color: '#ef4444', width: 5} }]); break;
                case 425: drawLayers([{ stroke: {color: '#164e63', width: 30}, fill: 'transparent' }, { stroke: {color: '#67e8f9', width: 12}, fill: 'transparent' }, { fill: '#083344' }]); break;
                case 426: drawLayers([{ fill: '#eab308', shadow: {color: '#ca8a04', blur: 22, x: 0, y: -15} }, { fill: '#fef9c3', stroke: {color: '#000', width: 5} }]); break;
                case 427: drawLayers([{ fill: '#3b82f6', ox: 14, oy: 0 }, { fill: '#ec4899', ox: -14, oy: 0 }, { fill: '#fff', stroke: {color: '#000', width: 4} }]); break;
                case 428: drawLayers([{ stroke: {color: '#000', width: 22}, fill: '#000', shadow: {color: '#22c55e', blur: 28, x: 0, y: 0} }, { fill: '#dcfce7', stroke: {color: '#16a34a', width: 4} }]); break;
                case 429: drawLayers([{ fill: '#7c2d12', ox: 12, oy: 12 }, { gradient: [{pos:0, color:'#fdba74'}, {pos:1, color:'#ea580c'}], fill: 'grad', stroke: {color: '#fff', width: 5} }]); break;
                case 430: drawLayers([{ stroke: {color: '#fff', width: 28}, fill: '#fff' }, { stroke: {color: '#000', width: 14}, fill: '#000' }, { fill: '#f43f5e' }]); break;
                case 431: drawLayers([{ fill: '#1e1b4b', ox: 22, oy: 22 }, { stroke: {color: '#1e1b4b', width: 8}, fill: '#a5b4fc' }]); break;
                case 432: drawLayers([{ stroke: {color: '#831843', width: 14}, fill: 'transparent', ox: -12, oy: 12 }, { fill: '#fbcfe8', stroke: {color: '#be185d', width: 5} }]); break;
                case 433: drawLayers([{ fill: '#0f766e', ox: 12, oy: 12 }, { fill: '#14b8a6', ox: 6, oy: 6 }, { fill: '#ccfbf1' }]); break;
                case 434: drawLayers([{ stroke: {color: '#000', width: 8}, fill: 'transparent', shadow: {color: '#000', blur: 14, x: 0, y: -22} }, { fill: '#fff' }]); break;
                case 435: drawLayers([{ fill: '#450a0a', ox: -7, oy: -7 }, { gradient: [{pos:0, color:'#fef2f2'}, {pos:1, color:'#fca5a5'}], fill: 'grad', stroke: {color: '#dc2626', width: 4} }]); break;
                case 436: drawLayers([{ stroke: {color: '#111827', width: 35}, fill: '#111827' }, { stroke: {color: '#eab308', width: 14}, fill: '#eab308' }, { fill: '#fff' }]); break;
                case 437: drawLayers([{ stroke: {color: '#4c1d95', width: 18}, fill: '#4c1d95', shadow: {color: '#a855f7', blur: 28, x: 0, y: 0} }, { fill: '#000', stroke: {color: '#d8b4fe', width: 4} }]); break;
                case 438: drawLayers([{ fill: '#14532d', ox: 22, oy: 0 }, { fill: '#166534', ox: 11, oy: 0 }, { fill: '#dcfce7', stroke: {color: '#15803d', width: 4} }]); break;
                case 439: drawLayers([{ stroke: {color: '#7f1d1d', width: 26}, fill: '#7f1d1d' }, { gradient: [{pos:0, color:'#fef08a'}, {pos:1, color:'#ea580c'}], fill: 'grad' }]); break;
                case 440: drawLayers([{ fill: '#000', ox: 14, oy: -14 }, { fill: '#3b82f6', ox: 7, oy: -7 }, { fill: '#fff', stroke: {color: '#000', width: 5} }]); break;
                case 441: drawLayers([{ stroke: {color: '#1e3a8a', width: 20}, fill: '#1e3a8a', font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#bfdbfe', font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 442: drawLayers([{ fill: '#000', ox: 10, oy: 10, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#eab308', stroke: {color: '#000', width: 4}, font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 443: drawLayers([{ stroke: {color: '#0f766e', width: 15}, fill: '#0f766e', shadow: {color: '#5eead4', blur: 20, x: 0, y: 0}, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#ccfbf1', font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 444: drawLayers([{ stroke: {color: '#4c1d95', width: 30}, fill: 'transparent', font: 'italic 900 130px "Times New Roman", serif' }, { stroke: {color: '#c4b5fd', width: 12}, fill: 'transparent', font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#fff', font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 445: drawLayers([{ fill: '#000', ox: 8, oy: 8, font: 'italic 900 130px "Times New Roman", serif' }, { gradient: [{pos:0, color:'#fca5a5'}, {pos:1, color:'#b91c1c'}], fill: 'grad', stroke: {color: '#000', width: 3}, font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 446: drawLayers([{ stroke: {color: '#000', width: 18}, fill: '#000', shadow: {color: '#fff', blur: 15, x: 0, y: 0}, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#111827', font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 447: drawLayers([{ fill: '#1e1b4b', ox: -12, oy: 12, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#e0e7ff', stroke: {color: '#6366f1', width: 4}, font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 448: drawLayers([{ stroke: {color: '#451a03', width: 16}, fill: '#451a03', font: 'italic 900 130px "Times New Roman", serif' }, { gradient: [{pos:0, color:'#fef3c7'}, {pos:1, color:'#d97706'}], fill: 'grad', font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 449: drawLayers([{ fill: '#be185d', ox: 14, oy: 14, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#f472b6', ox: 7, oy: 7, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#fff', font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 450: drawLayers([{ stroke: {color: '#000', width: 12}, fill: 'transparent', shadow: {color: '#000', blur: 18, x: 12, y: 12}, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#34d399', font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 451: drawLayers([{ fill: '#000', ox: 15, oy: 0, font: 'italic 900 130px "Times New Roman", serif' }, { stroke: {color: '#000', width: 6}, fill: '#fbbf24', font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 452: drawLayers([{ stroke: {color: '#14532d', width: 14}, fill: 'transparent', ox: -8, oy: -8, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#dcfce7', stroke: {color: '#16a34a', width: 4}, font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 453: drawLayers([{ fill: '#7f1d1d', ox: 12, oy: 12, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#ef4444', ox: 6, oy: 6, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#fef2f2', font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 454: drawLayers([{ stroke: {color: '#000', width: 22}, fill: '#000', shadow: {color: '#a855f7', blur: 25, x: 0, y: 0}, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#000', stroke: {color: '#d8b4fe', width: 3}, font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 455: drawLayers([{ fill: '#0f172a', ox: -12, oy: 12, font: 'italic 900 130px "Times New Roman", serif' }, { gradient: [{pos:0, color:'#f1f5f9'}, {pos:1, color:'#94a3b8'}], fill: 'grad', stroke: {color: '#334155', width: 3}, font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 456: drawLayers([{ stroke: {color: '#7c2d12', width: 30}, fill: '#7c2d12', font: 'italic 900 130px "Times New Roman", serif' }, { stroke: {color: '#fdba74', width: 15}, fill: '#fdba74', font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#fff', font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 457: drawLayers([{ stroke: {color: '#831843', width: 16}, fill: '#831843', shadow: {color: '#f9a8d4', blur: 25, x: 0, y: 0}, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#fdf2f8', stroke: {color: '#db2777', width: 3}, font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 458: drawLayers([{ fill: '#064e3b', ox: 16, oy: -16, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#34d399', ox: 8, oy: -8, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#ecfdf5', stroke: {color: '#059669', width: 3}, font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 459: drawLayers([{ stroke: {color: '#000', width: 22}, fill: '#000', font: 'italic 900 130px "Times New Roman", serif' }, { gradient: [{pos:0, color:'#e0f2fe'}, {pos:1, color:'#0ea5e9'}], fill: 'grad', font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 460: drawLayers([{ fill: '#000', ox: 12, oy: 12, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#facc15', ox: 6, oy: 6, font: 'italic 900 130px "Times New Roman", serif' }, { fill: '#fff', stroke: {color: '#000', width: 4}, font: 'italic 900 130px "Times New Roman", serif' }]); break;
                case 461: drawLayers([{ stroke: {color: '#1e3a8a', width: 25}, fill: '#1e3a8a', ox: 10, oy: 10 }, { fill: '#60a5fa', stroke: {color: '#fff', width: 5} }]); break;
                case 462: drawLayers([{ stroke: {color: '#4c1d95', width: 28}, fill: '#4c1d95', shadow: {color: '#a855f7', blur: 20, x: -8, y: 8} }, { fill: '#f3e8ff' }]); break;
                case 463: drawLayers([{ fill: '#000', ox: -16, oy: -16 }, { fill: '#fff', stroke: {color: '#000', width: 8} }]); break;
                case 464: drawLayers([{ fill: '#b91c1c', ox: 24, oy: 0 }, { fill: '#fef2f2', stroke: {color: '#ef4444', width: 6} }]); break;
                case 465: drawLayers([{ stroke: {color: '#164e63', width: 35}, fill: 'transparent' }, { stroke: {color: '#67e8f9', width: 16}, fill: 'transparent' }, { fill: '#083344' }]); break;
                case 466: drawLayers([{ fill: '#eab308', shadow: {color: '#ca8a04', blur: 30, x: 0, y: 16} }, { fill: '#fef9c3', stroke: {color: '#000', width: 4} }]); break;
                case 467: drawLayers([{ fill: '#3b82f6', ox: 12, oy: 12 }, { fill: '#ec4899', ox: -12, oy: -12 }, { fill: '#fff', stroke: {color: '#000', width: 5} }]); break;
                case 468: drawLayers([{ stroke: {color: '#000', width: 28}, fill: '#000', shadow: {color: '#22c55e', blur: 40, x: 0, y: 0} }, { fill: '#dcfce7', stroke: {color: '#16a34a', width: 5} }]); break;
                case 469: drawLayers([{ fill: '#7c2d12', ox: 18, oy: 18 }, { gradient: [{pos:0, color:'#fdba74'}, {pos:1, color:'#ea580c'}], fill: 'grad', stroke: {color: '#fff', width: 4} }]); break;
                case 470: drawLayers([{ stroke: {color: '#fff', width: 35}, fill: '#fff' }, { stroke: {color: '#000', width: 20}, fill: '#000' }, { fill: '#f43f5e' }]); break;
                case 471: drawLayers([{ fill: '#1e1b4b', ox: 28, oy: 28 }, { stroke: {color: '#1e1b4b', width: 12}, fill: '#a5b4fc' }]); break;
                case 472: drawLayers([{ stroke: {color: '#831843', width: 18}, fill: 'transparent', ox: -10, oy: -10 }, { fill: '#fbcfe8', stroke: {color: '#be185d', width: 6} }]); break;
                case 473: drawLayers([{ fill: '#0f766e', ox: 16, oy: 16 }, { fill: '#14b8a6', ox: 8, oy: 8 }, { fill: '#ccfbf1' }]); break;
                case 474: drawLayers([{ stroke: {color: '#000', width: 14}, fill: 'transparent', shadow: {color: '#000', blur: 25, x: 0, y: 25} }, { fill: '#fff' }]); break;
                case 475: drawLayers([{ fill: '#450a0a', ox: -14, oy: 14 }, { gradient: [{pos:0, color:'#fef2f2'}, {pos:1, color:'#fca5a5'}], fill: 'grad', stroke: {color: '#dc2626', width: 6} }]); break;
                case 476: drawLayers([{ stroke: {color: '#111827', width: 40}, fill: '#111827' }, { stroke: {color: '#eab308', width: 18}, fill: '#eab308' }, { fill: '#fff' }]); break;
                case 477: drawLayers([{ stroke: {color: '#4c1d95', width: 24}, fill: '#4c1d95', shadow: {color: '#a855f7', blur: 35, x: 0, y: 0} }, { fill: '#000', stroke: {color: '#d8b4fe', width: 5} }]); break;
                case 478: drawLayers([{ fill: '#14532d', ox: 28, oy: -28 }, { fill: '#166534', ox: 14, oy: -14 }, { fill: '#dcfce7', stroke: {color: '#15803d', width: 5} }]); break;
                case 479: drawLayers([{ stroke: {color: '#7f1d1d', width: 32}, fill: '#7f1d1d' }, { gradient: [{pos:0, color:'#fef08a'}, {pos:1, color:'#ea580c'}], fill: 'grad' }]); break;
                case 480: drawLayers([{ fill: '#000', ox: 24, oy: 24 }, { fill: '#3b82f6', ox: 16, oy: 16 }, { fill: '#fff', stroke: {color: '#000', width: 6} }]); break;
                case 481: drawLayers([{ stroke: {color: '#be185d', width: 22}, fill: 'transparent', ox: 10, oy: 10 }, { fill: '#fdf2f8', stroke: {color: '#db2777', width: 8} }]); break;
                case 482: drawLayers([{ stroke: {color: '#020617', width: 32}, fill: '#020617', shadow: {color: '#64748b', blur: 28, x: 0, y: 0} }, { fill: '#f8fafc' }]); break;
                case 483: drawLayers([{ fill: '#000', ox: -18, oy: 0 }, { fill: '#000', ox: 18, oy: 0 }, { fill: '#fff', stroke: {color: '#000', width: 6} }]); break;
                case 484: drawLayers([{ stroke: {color: '#4c0519', width: 28}, fill: '#4c0519', shadow: {color: '#e11d48', blur: 40, x: 0, y: 0} }, { fill: '#ffe4e6', stroke: {color: '#f43f5e', width: 5} }]); break;
                case 485: drawLayers([{ fill: '#0c4a6e', ox: 18, oy: 18 }, { fill: '#0284c7', ox: 9, oy: 9 }, { fill: '#bae6fd' }]); break;
                case 486: drawLayers([{ stroke: {color: '#3f6212', width: 26}, fill: '#3f6212', shadow: {color: '#d9f99d', blur: 35, x: -8, y: -8} }, { fill: '#84cc16' }]); break;
                case 487: drawLayers([{ stroke: {color: '#000', width: 16}, fill: '#000', ox: 16, oy: 16 }, { gradient: [{pos:0, color:'#fbcfe8'}, {pos:1, color:'#c026d3'}], fill: 'grad', stroke: {color: '#fff', width: 5} }]); break;
                case 488: drawLayers([{ fill: '#1e3a8a', ox: 22, oy: -22 }, { fill: '#93c5fd', stroke: {color: '#1e40af', width: 6} }]); break;
                case 489: drawLayers([{ stroke: {color: '#831843', width: 36}, fill: 'transparent' }, { stroke: {color: '#f9a8d4', width: 18}, fill: 'transparent' }, { fill: '#db2777' }]); break;
                case 490: drawLayers([{ stroke: {color: '#111827', width: 20}, fill: '#111827', shadow: {color: '#ef4444', blur: 40, x: 0, y: 0} }, { fill: '#fee2e2', stroke: {color: '#dc2626', width: 5} }]); break;
                case 491: drawLayers([{ fill: '#451a03', ox: 28, oy: 28 }, { stroke: {color: '#451a03', width: 12}, fill: '#fef3c7' }]); break;
                case 492: drawLayers([{ stroke: {color: '#0f766e', width: 20}, fill: 'transparent', ox: -12, oy: -12 }, { fill: '#ccfbf1', stroke: {color: '#0d9488', width: 8} }]); break;
                case 493: drawLayers([{ fill: '#581c87', ox: 16, oy: 16 }, { fill: '#a855f7', ox: 8, oy: 8 }, { fill: '#f3e8ff' }]); break;
                case 494: drawLayers([{ stroke: {color: '#000', width: 28}, fill: '#000', shadow: {color: '#000', blur: 25, x: 15, y: 15} }, { fill: '#facc15' }]); break;
                case 495: drawLayers([{ fill: '#7f1d1d', ox: -16, oy: 16 }, { gradient: [{pos:0, color:'#fef2f2'}, {pos:1, color:'#f87171'}], fill: 'grad', stroke: {color: '#dc2626', width: 5} }]); break;
                case 496: drawLayers([{ stroke: {color: '#0f172a', width: 45}, fill: '#0f172a' }, { stroke: {color: '#94a3b8', width: 24}, fill: '#94a3b8' }, { fill: '#f8fafc' }]); break;
                case 497: drawLayers([{ stroke: {color: '#1d4ed8', width: 24}, fill: '#1d4ed8', shadow: {color: '#60a5fa', blur: 35, x: 0, y: 0} }, { fill: '#eff6ff', stroke: {color: '#2563eb', width: 5} }]); break;
                case 498: drawLayers([{ fill: '#14532d', ox: 24, oy: -24 }, { fill: '#22c55e', ox: 12, oy: -12 }, { fill: '#f0fdf4', stroke: {color: '#166534', width: 5} }]); break;
                case 499: drawLayers([{ stroke: {color: '#4a044e', width: 30}, fill: '#4a044e' }, { gradient: [{pos:0, color:'#fae8ff'}, {pos:1, color:'#d946ef'}], fill: 'grad' }]); break;
                case 500: drawLayers([{ fill: '#000', ox: 20, oy: 20 }, { fill: '#ef4444', ox: 10, oy: 10 }, { fill: '#fff', stroke: {color: '#000', width: 6} }]); break;
            }
            const trimCanvas = (c) => {
                const ctx = c.getContext('2d', { willReadFrequently: true });
                const width = c.width;
                const height = c.height;
                const imgData = ctx.getImageData(0, 0, width, height);
                const data = imgData.data;
                
                let top = 0, bottom = height, left = 0, right = width;
                
                let found = false;
                for(let y = 0; y < height; y++) {
                    for(let x = 0; x < width; x++) {
                        if (data[(y * width + x) * 4 + 3] > 0) { top = y; found = true; break; }
                    }
                    if (found) break;
                }
                if (!found) return c; // Empty canvas
                
                found = false;
                for(let y = height - 1; y >= top; y--) {
                    for(let x = 0; x < width; x++) {
                        if (data[(y * width + x) * 4 + 3] > 0) { bottom = y + 1; found = true; break; }
                    }
                    if (found) break;
                }
                
                found = false;
                for(let x = 0; x < width; x++) {
                    for(let y = top; y < bottom; y++) {
                        if (data[(y * width + x) * 4 + 3] > 0) { left = x; found = true; break; }
                    }
                    if (found) break;
                }
                
                found = false;
                for(let x = width - 1; x >= left; x--) {
                    for(let y = top; y < bottom; y++) {
                        if (data[(y * width + x) * 4 + 3] > 0) { right = x + 1; found = true; break; }
                    }
                    if (found) break;
                }
                
                // Add 10px safe padding
                const pad = 10;
                top = Math.max(0, top - pad);
                bottom = Math.min(height, bottom + pad);
                left = Math.max(0, left - pad);
                right = Math.min(width, right + pad);
                
                const trimW = right - left;
                const trimH = bottom - top;
                
                const tc = document.createElement('canvas');
                tc.width = trimW;
                tc.height = trimH;
                tc.getContext('2d').putImageData(ctx.getImageData(left, top, trimW, trimH), 0, 0);
                return tc;
            };

            const finalCanvas = trimCanvas(canvas);
            resolve(finalCanvas.toDataURL('image/png'));
        });
    };

    // 3. Render the Polished UI Modal (Exact Screenshot Match)
    window.showBetaWordArtModal = function(editTarget = null) {
        const uiHTML = `
            <style>
                /* Overwrite default dialog styles to achieve the edge-to-edge banner */
                #custom-dialog-header { display: none !important; }
                .custom-dialog-footer { display: none !important; }
                .custom-dialog-body { padding: 0 !important; background: #f3f4f6 !important; border-radius: 8px; overflow: hidden; }
                
                /* The Green Header Banner */
                .wa-modal-header {
                    background: var(--ui-theme-dark);
                    padding: 15px 25px;
                    text-align: center;
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                    cursor: grab; /* Shows it's draggable */
                    position: relative;
                }
                .wa-modal-header:active {
                    cursor: grabbing;
                }
                .wa-modal-title {
                    color: white;
                    font-family: 'Segoe UI', sans-serif;
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    pointer-events: none; /* Let drag pass through */
                }
                /* Replaced .wa-close-btn with global .custom-dialog-close */
                
                /* The Giant White Input Box */
                .wa-modal-input {
                    width: 100%;
                    padding: 12px 15px;
                    font-size: 24px;
                    font-family: 'Arial Black', Impact, sans-serif;
                    text-align: center;
                    color: #111;
                    border: none;
                    border-radius: 4px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    outline: none;
                    transition: box-shadow 0.2s;
                }
                .wa-modal-input:focus {
                    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.4);
                }

                /* Grid Area */
                .wa-modal-grid-container {
                    padding: 15px 20px;
                    background: #f1f5f9;
                    max-height: 55vh;
                    overflow-y: auto;
                }
                #beta-wa-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 10px;
                }
                
                /* The Selectable Cards */
                .beta-wa-card {
                    background: white;
                    border: 3px solid transparent;
                    border-radius: 12px;
                    height: 65px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
                    transition: all 0.15s ease-in-out;
                    box-sizing: border-box;
                }
                .beta-wa-card:hover {
                    box-shadow: 0 6px 12px rgba(0,0,0,0.08);
                    transform: translateY(-2px);
                }
                .beta-wa-card.selected {
                    border-color: var(--ui-theme-color);
                    background: #f0fdf4; 
                    box-shadow: 0 4px 8px rgba(0, 118, 112, 0.15);
                }

                /* Custom Footer */
                .wa-modal-footer {
                    padding: 10px 20px;
                    background: #f1f5f9;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    border-bottom-left-radius: 8px;
                    border-bottom-right-radius: 8px;
                }
                .wa-btn {
                    padding: 8px 24px;
                    font-size: 14px;
                    font-weight: 700;
                    border-radius: 20px;
                    cursor: pointer;
                    font-family: 'Segoe UI', sans-serif;
                    border: none;
                    transition: all 0.2s;
                }
                .wa-btn-ok {
                    background: var(--ui-theme-dark);
                    color: white;
                }
                .wa-btn-ok:hover {
                    background: var(--ui-theme-color);
                }
                .wa-btn-cancel {
                    background: white;
                    color: var(--ui-theme-dark);
                    border: 2px solid #cbd5e1;
                }
                .wa-btn-cancel:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                }
                
                /* Custom Scrollbar */
                .wa-modal-grid-container::-webkit-scrollbar { width: 8px; }
                .wa-modal-grid-container::-webkit-scrollbar-track { background: transparent; }
                .wa-modal-grid-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .wa-modal-grid-container::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            </style>
            
            <div class="wa-modal-header" id="wa-modal-header">
                <div class="custom-dialog-close" id="wa-close-x" title="Close" style="position: absolute; top: 8px; right: 8px; z-index: 10;"><i class="fas fa-times"></i></div>
                <div class="wa-modal-title">Create WordArt</div>
                <input type="text" id="beta-wa-text" class="wa-modal-input" placeholder="Enter Your Text Here..." value="">
            </div>
            
            <div class="wa-modal-grid-container" id="beta-wa-grid-container"></div>
            
            <div class="wa-modal-footer">
                <button class="wa-btn wa-btn-ok" id="wa-btn-ok">OK</button>
                <button class="wa-btn wa-btn-cancel" id="wa-btn-cancel">Cancel</button>
            </div>
        `;

        if (typeof rescueGrids === 'function') rescueGrids();

        let grid = document.getElementById('beta-wa-grid');
        if (!grid) {
            grid = document.createElement('div');
            grid.id = 'beta-wa-grid';
            // Put it in safe zone immediately
            const safeZone = document.getElementById('modal-safe-zone');
            if (safeZone) safeZone.appendChild(grid);
            
            // Build previews ONLY ONCE!
            const renderPreviews = async () => {
                for(let i = 1; i <= 500; i++) {
                    const btn = document.createElement('div');
                    btn.className = 'beta-wa-card' + (i === 1 ? ' selected' : '');
                    
                    // Generate canvases without blocking the main thread!
                    generateWordArtPNG("WordArt", i).then(previewData => {
                        btn.innerHTML = `<img src="${previewData}" style="max-width: 100%; max-height: 100%; object-fit: contain; pointer-events: none;">`;
                    });
                    
                    btn.onclick = () => {
                        grid.querySelectorAll('.beta-wa-card').forEach(c => c.classList.remove('selected'));
                        btn.classList.add('selected');
                        grid.dataset.selectedId = i;
                    };
                    
                    btn.ondblclick = () => {
                        grid.dataset.selectedId = i;
                        document.getElementById('wa-btn-ok').click();
                    };
                    
                    grid.appendChild(btn);
                    
                    // Yield control to the browser every 10 items to prevent UI freezing
                    if (i % 10 === 0) {
                        await new Promise(r => setTimeout(r, 0));
                    }
                }
            };
            renderPreviews();
        }

        DialogSystem.show('', uiHTML, null, true);
        
        const container = document.getElementById('beta-wa-grid-container');
        if (container && grid) container.appendChild(grid);

        // 🛠️ Updated Drag Logic
        setTimeout(() => {
            const dialogBox = document.getElementById('custom-dialog-box');
            if(dialogBox) {
                dialogBox.style.width = '850px';
                dialogBox.style.maxWidth = '95vw';
                dialogBox.style.padding = '0';
                dialogBox.style.backgroundColor = 'transparent';
                dialogBox.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';

                const header = document.getElementById('wa-modal-header');
                if (header) {
                    let isDragging = false;
                    header.addEventListener('mousedown', function(e) {
                        if (e.target.tagName.toLowerCase() === 'input' || e.target.id === 'wa-close-x') return;
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
            }
        }, 10);

        const textInput = document.getElementById('beta-wa-text');
        
        if (editTarget) {
            const img = editTarget.querySelector('.beta-wa-img');
            if (img) {
                textInput.value = img.getAttribute('data-beta-wa-text') || "WordArt";
                const sId = parseInt(img.getAttribute('data-beta-wa-style'));
                if (sId) {
                    grid.dataset.selectedId = sId;
                    grid.querySelectorAll('.beta-wa-card').forEach(c => c.classList.remove('selected'));
                    const selectedBtn = grid.children[sId - 1];
                    if (selectedBtn) {
                        selectedBtn.classList.add('selected');
                        // Scroll to the selected item slightly delayed to ensure DOM is ready
                        setTimeout(() => selectedBtn.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
                    }
                }
            }
        }

        const executeInsertion = async () => {
            const finalStr = textInput.value.trim() || "WordArt";
            const styleId = grid.dataset.selectedId ? parseInt(grid.dataset.selectedId) : 1;
            DialogSystem.close(); 
            
            const finalImgData = await generateWordArtPNG(finalStr, styleId);
            const safeStr = finalStr.replace(/"/g, '&quot;');
            
            if (editTarget) {
                const img = editTarget.querySelector('.beta-wa-img');
                if (img) {
                    img.src = finalImgData;
                    img.setAttribute('data-beta-wa-text', finalStr);
                    img.setAttribute('data-beta-wa-style', styleId);
                }
            } else {
                const img = new Image();
                img.onload = function() {
                    const el = document.createElement('div');
                    el.className = 'pub-element';
                    el.style.left = '50px';
                    el.style.top = '50px';
                    el.style.width = img.naturalWidth + 'px';
                    el.style.height = img.naturalHeight + 'px';
                    el.style.zIndex = 10;
                    el.setAttribute('data-scaleX', "1");
                    el.setAttribute('data-scaleY', "1");
                    
                    el.innerHTML = `
                        <div class="element-content">
                            <img class="beta-wa-img" data-beta-wa-text="${safeStr}" data-beta-wa-style="${styleId}" src="${finalImgData}" draggable="false" style="width:100%; height:100%; object-fit:contain; position:absolute; top:0; left:0;">
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
                    if (paper) {
                        paper.appendChild(el);
                        if (typeof selectElement === 'function') selectElement(el);
                        if (typeof updateThumbnails === 'function') updateThumbnails();
                        if (typeof pushHistory === 'function') pushHistory();
                    }
                };
                img.src = finalImgData;
            }
        };

        // Attach listeners
        document.getElementById('wa-btn-ok').onclick = executeInsertion;
        document.getElementById('wa-btn-cancel').onclick = () => DialogSystem.close();
        
        const closeX = document.getElementById('wa-close-x');
        if (closeX) closeX.onclick = () => DialogSystem.close();
        
        setTimeout(() => { textInput.focus(); }, 150);
    };

})();
