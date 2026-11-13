/* ============================================================================
   OpenPublisher AI Layout & Command Assistant (v5.20.4)
   - 7-Node Cloudflare Worker Load-Balanced Client with Instant 503 Rollover
   - Dedicated FLUX.1 AI Image Worker (openpub-img-1) & Vector (SVG) Engine
   - Persistent Device UUID (opub_device_id) & 20-Second Local Cooldown
   - Compact Dynamic System Prompt Builder (buildAISystemPrompt)
   - Full Native OpenPublisher Command, PageConfig & 23-Element Executor
   - Atomic Single-Step Undo/Redo Integration & Scoped Custom HTML/CSS Hatch
   ============================================================================ */
(function (global) {
    'use strict';

    const AI_WORKER_NODES = [
        'https://openpub-ai-1.openpublisher.workers.dev',
        'https://openpub-ai-2.openpublisher.workers.dev',
        'https://openpub-ai-3.openpublisher.workers.dev',
        'https://openpub-ai-4.openpublisher.workers.dev',
        'https://openpub-ai-5.openpublisher.workers.dev',
        'https://openpub-ai-6.openpublisher.workers.dev',
        'https://openpub-ai-7.openpublisher.workers.dev'
    ];

    const AI_IMAGE_WORKER_NODES = [
        'https://openpub-img-1.openpublisher.workers.dev'
        // Additional team Cloudflare Workers AI nodes (e.g. openpub-img-2) can be added here
    ];

    const DEVICE_ID_STORAGE_KEY = 'opub_device_id';
    const COOLDOWN_STORAGE_KEY = 'opub_ai_last_gen_ts';
    const COOLDOWN_MS = 20000;
    const MIN_PROMPT_LENGTH = 8;

    let _cooldownTicker = null;
    let _templateIndexCache = null;
    let _currentActiveTab = 'layout';
    let _selectedImgPreset = '';
    let _selectedVecPreset = '';

    /* ------------------------------------------------------------------------
       1. DEVICE UUID, VALIDATION, COOLDOWN & WORKER ROLLOVER CLIENT
       ------------------------------------------------------------------------ */

    function generateUUIDv4() {
        if (global.crypto && typeof global.crypto.randomUUID === 'function') {
            return global.crypto.randomUUID();
        }
        if (global.crypto && typeof global.crypto.getRandomValues === 'function') {
            const bytes = new Uint8Array(16);
            global.crypto.getRandomValues(bytes);
            bytes[6] = (bytes[6] & 0x0f) | 0x40;
            bytes[8] = (bytes[8] & 0x3f) | 0x80;
            const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
            return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function getDeviceId() {
        try {
            let id = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
            if (!id || typeof id !== 'string' || id.trim().length < 16) {
                id = generateUUIDv4();
                localStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
            }
            return id;
        } catch (e) {
            return generateUUIDv4();
        }
    }

    function validatePrompt(promptText) {
        const trimmed = (typeof promptText === 'string' ? promptText : '').trim();
        if (trimmed.length < MIN_PROMPT_LENGTH) {
            return {
                valid: false,
                reason: `Prompt is too short. Please enter at least ${MIN_PROMPT_LENGTH} characters describing what to create or change.`
            };
        }
        if (!/\s/.test(trimmed)) {
            return {
                valid: false,
                reason: 'Please enter a descriptive phrase with at least two words separated by spaces.'
            };
        }
        const words = trimmed.split(/\s+/).filter(Boolean);
        if (words.length < 2) {
            return {
                valid: false,
                reason: 'Please include at least two words describing your layout or command.'
            };
        }
        const alphaMatches = trimmed.match(/[A-Za-z\u00C0-\u024F\u0400-\uFFFF0-9]/g);
        if (!alphaMatches || alphaMatches.length < 4 || /(.)\1{7,}/.test(trimmed)) {
            return {
                valid: false,
                reason: 'Please enter a valid instruction rather than repeated characters or symbols.'
            };
        }
        return { valid: true, prompt: trimmed };
    }

    function getCooldownRemainingMs() {
        try {
            const raw = localStorage.getItem(COOLDOWN_STORAGE_KEY);
            if (!raw) return 0;
            const lastTs = parseInt(raw, 10);
            if (isNaN(lastTs) || lastTs <= 0) return 0;
            const elapsed = Date.now() - lastTs;
            if (elapsed < 0 || elapsed >= COOLDOWN_MS) return 0;
            return COOLDOWN_MS - elapsed;
        } catch (e) {
            return 0;
        }
    }

    function markGenerationTimestamp() {
        try {
            localStorage.setItem(COOLDOWN_STORAGE_KEY, String(Date.now()));
        } catch (e) { /* ignore storage quota errors */ }
    }

    function shuffleNodes(urls) {
        const arr = urls.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    function extractAIJsonPayload(raw) {
        if (!raw) throw new Error('Empty response received from AI worker.');
        let candidate = raw;

        if (typeof candidate === 'object' && candidate !== null) {
            if (candidate.summary !== undefined || candidate.appCommands !== undefined ||
                candidate.pageConfig !== undefined || candidate.elements !== undefined) {
                return candidate;
            }
            if (typeof candidate.response === 'string' || typeof candidate.response === 'object') {
                candidate = candidate.response;
            } else if (typeof candidate.result === 'string' || typeof candidate.result === 'object') {
                candidate = candidate.result;
            } else if (typeof candidate.data === 'string' || typeof candidate.data === 'object') {
                candidate = candidate.data;
            } else if (Array.isArray(candidate.choices) && candidate.choices[0]?.message?.content) {
                candidate = candidate.choices[0].message.content;
            }
        }

        if (typeof candidate === 'string') {
            let cleaned = candidate.trim();
            cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
            const firstBrace = cleaned.indexOf('{');
            const lastBrace = cleaned.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
                cleaned = cleaned.slice(firstBrace, lastBrace + 1);
            }
            candidate = JSON.parse(cleaned);
        }

        if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
            throw new Error('AI worker did not return a valid JSON layout object.');
        }
        return candidate;
    }

    async function sendAIWorkerRequest(systemPrompt, userPrompt, onStatus) {
        const deviceId = getDeviceId();
        const nodes = shuffleNodes(AI_WORKER_NODES);
        const body = JSON.stringify({ systemPrompt, userPrompt });
        let lastRolloverError = null;

        for (let i = 0; i < nodes.length; i++) {
            const url = nodes[i];
            if (typeof onStatus === 'function') {
                onStatus({ phase: 'requesting', nodeIndex: i + 1, totalNodes: nodes.length, url });
            }

            let res;
            try {
                res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Device-ID': deviceId
                    },
                    body
                });
            } catch (networkErr) {
                lastRolloverError = networkErr;
                if (typeof onStatus === 'function') {
                    onStatus({ phase: 'rollover', reason: 'network', nodeIndex: i + 1, totalNodes: nodes.length, url });
                }
                continue;
            }

            if (res.status === 429) {
                let serverMsg = 'Rate limit reached (HTTP 429). Please wait a moment before sending another AI request.';
                try {
                    const errBody = await res.json();
                    if (errBody && (errBody.message || errBody.error)) {
                        serverMsg = errBody.message || errBody.error;
                    }
                } catch (_) {
                    try {
                        const txt = await res.text();
                        if (txt && txt.trim()) serverMsg = txt.trim();
                    } catch (__) { /* ignore */ }
                }
                const rateErr = new Error(serverMsg);
                rateErr.code = 'RATE_LIMIT';
                rateErr.status = 429;
                throw rateErr;
            }

            if (res.status === 503) {
                lastRolloverError = new Error(`Worker node returned HTTP 503 (${url})`);
                if (typeof onStatus === 'function') {
                    onStatus({ phase: 'rollover', status: 503, nodeIndex: i + 1, totalNodes: nodes.length, url });
                }
                continue;
            }

            if (!res.ok) {
                let msg = `Worker error (${res.status})`;
                try {
                    const errData = await res.json();
                    if (errData && (errData.message || errData.error)) {
                        msg = errData.message || errData.error;
                    }
                } catch (_) { /* ignore */ }
                const httpErr = new Error(msg);
                httpErr.code = 'HTTP_ERROR';
                httpErr.status = res.status;
                throw httpErr;
            }

            const raw = await res.json();
            const parsed = extractAIJsonPayload(raw);
            markGenerationTimestamp();
            return { plan: parsed, nodeUrl: url, attempts: i + 1 };
        }

        const exhaustedErr = new Error(
            lastRolloverError
                ? `All ${nodes.length} AI worker nodes were unavailable (503/network). Please try again shortly.`
                : `All ${nodes.length} AI worker nodes failed to respond.`
        );
        exhaustedErr.code = 'ALL_NODES_FAILED';
        throw exhaustedErr;
    }

    /* ------------------------------------------------------------------------
       1B. AI IMAGE (FLUX.1) & AI VECTOR (SVG) ENGINES
       ------------------------------------------------------------------------ */

    function buildAIVectorSVGSystemPrompt(stylePreset) {
        return [
            'You are OpenPublisher\'s specialized AI Vector & SVG Graphic Generator.',
            'Given a user request, generate a rich, beautiful, self-contained SVG illustration for publication layouts.',
            '',
            'CRITICAL RULES:',
            '1. Return ONLY a single valid JSON object with EXACTLY this structure:',
            '{',
            '  "summary": "Short 1-sentence description of what was drawn",',
            '  "svg": "<svg viewBox=\\"0 0 512 512\\" xmlns=\\"http://www.w3.org/2000/svg\\">...</svg>"',
            '}',
            '2. The SVG MUST have viewBox="0 0 512 512" and xmlns="http://www.w3.org/2000/svg".',
            '3. Use rich, layered vector elements: <path>, <circle>, <rect>, <polygon>, <polyline>, <ellipse>, <defs>, <linearGradient>, <radialGradient>, <g>.',
            '4. Give shapes clean fill and stroke colors with appealing color harmony. Transparent background by default so it can overlay any page background.',
            '5. NEVER include <script> tags, foreignObject, or external <image> links.',
            '6. The graphic must look professional, balanced, centered within the 512x512 canvas, and highly detailed.',
            stylePreset ? `7. Target style preset: "${stylePreset}".` : '7. Support standard presets: Flat Illustration, Logo / Emblem, Line Art / Stencil, Isometric Icon, Sticker / Badge.',
            '',
            'Output ONLY valid, parseable JSON. Do not include markdown code fences or conversational prose.'
        ].filter(Boolean).join('\n');
    }

    function sanitizeSvgMarkup(rawSvg) {
        let svg = String(rawSvg || '').trim();
        svg = svg.replace(/^```(?:svg|xml|html)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const firstSvg = svg.indexOf('<svg');
        const lastSvg = svg.lastIndexOf('</svg>');
        if (firstSvg !== -1 && lastSvg !== -1) {
            svg = svg.slice(firstSvg, lastSvg + 6);
        }
        // Strip scripts and dangerous inline event handlers
        svg = svg.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        svg = svg.replace(/\bon\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '');
        svg = svg.replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '');
        svg = svg.replace(/<image\b[^>]*>/gi, '');
        if (!/viewBox\s*=/i.test(svg)) {
            svg = svg.replace(/<svg\b/i, '<svg viewBox="0 0 512 512"');
        }
        if (!/xmlns\s*=/i.test(svg)) {
            svg = svg.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        return svg;
    }

    async function generateAIVectorSVG(prompt, stylePreset, onStatus) {
        const check = validatePrompt(prompt);
        if (!check.valid) throw new Error(check.reason);

        const remMs = getCooldownRemainingMs();
        if (remMs > 0) {
            const secs = Math.ceil(remMs / 1000);
            throw new Error(`Please wait ${secs}s before generating again (20s cooldown).`);
        }

        const fullPrompt = stylePreset ? `${check.prompt} (Style: ${stylePreset})` : check.prompt;
        const sysPrompt = buildAIVectorSVGSystemPrompt(stylePreset);

        const res = await sendAIWorkerRequest(sysPrompt, fullPrompt, onStatus);
        const plan = res.plan || {};
        let svgMarkup = plan.svg;
        if (!svgMarkup && typeof plan.markup === 'string') svgMarkup = plan.markup;
        if (!svgMarkup && typeof plan.content === 'string') svgMarkup = plan.content;

        if (!svgMarkup || typeof svgMarkup !== 'string' || !svgMarkup.includes('<svg')) {
            throw new Error('AI worker did not return valid SVG vector markup.');
        }

        const cleanSvg = sanitizeSvgMarkup(svgMarkup);
        return {
            status: 'ok',
            svg: cleanSvg,
            summary: plan.summary || 'Vector Graphic',
            nodeUrl: res.nodeUrl
        };
    }

    async function generateAIImage(prompt, stylePreset, options) {
        options = options || {};
        const check = validatePrompt(prompt);
        if (!check.valid) throw new Error(check.reason);

        const remMs = getCooldownRemainingMs();
        if (remMs > 0) {
            const secs = Math.ceil(remMs / 1000);
            throw new Error(`Please wait ${secs}s before generating again (20s cooldown).`);
        }

        const deviceId = getDeviceId();
        let finalPrompt = check.prompt;
        if (stylePreset) {
            finalPrompt += `, ${stylePreset}`;
        }

        const nodes = shuffleNodes(AI_IMAGE_WORKER_NODES);
        let lastError = null;
        let all503 = true;

        for (let i = 0; i < nodes.length; i++) {
            const nodeUrl = nodes[i];
            if (typeof options.onStatus === 'function') {
                options.onStatus({ phase: 'requesting', url: nodeUrl, attempt: i + 1, total: nodes.length });
            }

            let res;
            try {
                res = await fetch(nodeUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Device-ID': deviceId
                    },
                    body: JSON.stringify({ prompt: finalPrompt })
                });
            } catch (netErr) {
                all503 = false;
                lastError = new Error(`Network error connecting to AI image worker: ${netErr?.message || netErr}`);
                continue;
            }

            if (res.status === 429) {
                let msg = 'Rate limit reached (HTTP 429). Please wait a moment before sending another AI image request.';
                try {
                    const errData = await res.json();
                    if (errData && (errData.message || errData.error)) msg = errData.message || errData.error;
                } catch (_) {}
                const rateErr = new Error(msg);
                rateErr.code = 'RATE_LIMIT';
                rateErr.status = 429;
                throw rateErr;
            }

            if (res.status === 503) {
                lastError = new Error('FLUX.1 GPU quota exceeded (503).');
                continue;
            }

            all503 = false;
            if (!res.ok) {
                let msg = `Image worker error (${res.status})`;
                try {
                    const errData = await res.json();
                    if (errData && (errData.message || errData.error)) msg = errData.message || errData.error;
                } catch (_) {}
                const httpErr = new Error(msg);
                httpErr.code = 'HTTP_ERROR';
                httpErr.status = res.status;
                lastError = httpErr;
                continue;
            }

            const data = await res.json();
            const dataUrl = data.dataUrl || data.image || data.url;
            if (!dataUrl) {
                lastError = new Error('Image worker did not return a valid image data URL.');
                continue;
            }

            markGenerationTimestamp();
            return {
                status: 'ok',
                fallbackToSvg: false,
                dataUrl,
                prompt: finalPrompt,
                nodeUrl
            };
        }

        if (all503) {
            // Daily GPU quota reached across all image nodes - automatically fall back to vector SVG illustration
            if (typeof options.onStatus === 'function') {
                options.onStatus({ phase: 'fallback', reason: 'gpu_quota_503' });
            }
            const svgRes = await generateAIVectorSVG(prompt, stylePreset, options.onStatus);
            return {
                status: 'ok',
                fallbackToSvg: true,
                svg: svgRes.svg,
                summary: svgRes.summary,
                message: 'FLUX.1 GPU quota exceeded (503). Automatically fell back to generating a scalable vector SVG graphic!'
            };
        }

        throw lastError || new Error('All AI image worker nodes failed.');
    }

    function ensureBaselineHistory() {
        if (typeof global.deselect === 'function') global.deselect();
        if (global.state) {
            const hasSnap = Array.isArray(global.state.history) && global.state.history.length > 0 && global.state.historyIndex >= 0;
            if (!hasSnap) {
                if (typeof global.originalPushHistory === 'function') {
                    global.originalPushHistory();
                    if (typeof global.syncLastSavedHistory === 'function') global.syncLastSavedHistory();
                } else if (typeof global.pushHistory === 'function') {
                    global.pushHistory(true);
                }
            }
        }
    }

    function insertAIImageToCanvas(dataUrl, options) {
        options = options || {};
        const paper = document.getElementById('paper');
        if (!paper) return null;

        ensureBaselineHistory();

        if (options.asBackground) {
            paper.style.background = `url("${dataUrl}") center center / cover no-repeat`;
            if (typeof global.updateThumbnails === 'function') global.updateThumbnails();
            if (typeof global.originalPushHistory === 'function') {
                global.originalPushHistory();
                if (typeof global.syncLastSavedHistory === 'function') global.syncLastSavedHistory();
            } else if (typeof global.pushHistory === 'function') {
                global.pushHistory(true);
            }
            return null;
        }

        const imgHtml = `<img src="${dataUrl}" alt="AI Generated Image" style="width:100%; height:100%; object-fit:cover; display:block;">`;
        const el = global.createWrapper(imgHtml);
        if (el) {
            el.setAttribute('data-type', 'image');
            const paperW = parseFloat(paper.style.width) || 794;
            const paperH = parseFloat(paper.style.height) || 1123;
            const w = Math.round(Math.min(360, paperW * 0.7));
            const h = Math.round(Math.min(270, paperH * 0.45));
            el.style.width = w + 'px';
            el.style.height = h + 'px';
            el.style.left = Math.max(20, Math.round((paperW - w) / 2)) + 'px';
            el.style.top = Math.max(20, Math.round((paperH - h) / 3)) + 'px';
            if (typeof global.selectElement === 'function') global.selectElement(el);
            if (typeof global.updateThumbnails === 'function') global.updateThumbnails();
        }
        return el;
    }

    function insertAIVectorToCanvas(cleanSvg, options) {
        options = options || {};
        const paper = document.getElementById('paper');
        if (!paper) return null;

        ensureBaselineHistory();

        const innerHtml = `<div class="ai-vector-container" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; overflow:hidden;">${cleanSvg}</div>`;
        const el = global.createWrapper(innerHtml);
        if (el) {
            el.setAttribute('data-type', 'shape');
            const svgInside = el.querySelector('svg');
            if (svgInside) {
                svgInside.style.width = '100%';
                svgInside.style.height = '100%';
                svgInside.style.display = 'block';
            }
            const paperW = parseFloat(paper.style.width) || 794;
            const paperH = parseFloat(paper.style.height) || 1123;
            const size = Math.round(Math.min(280, Math.min(paperW * 0.5, paperH * 0.5)));
            el.style.width = size + 'px';
            el.style.height = size + 'px';
            el.style.left = Math.max(20, Math.round((paperW - size) / 2)) + 'px';
            el.style.top = Math.max(20, Math.round((paperH - size) / 3)) + 'px';
            if (typeof global.selectElement === 'function') global.selectElement(el);
            if (typeof global.updateThumbnails === 'function') global.updateThumbnails();
        }
        return el;
    }

    /* ------------------------------------------------------------------------
       2. LIVE PAGE CONTEXT & COMPACT SYSTEM PROMPT GENERATOR
       ------------------------------------------------------------------------ */

    function getUnitService() {
        return global.UnitConversionService || {
            toPixels: (val, unit = 'mm', dpi = 96) => {
                const n = parseFloat(val) || 0;
                if (unit === 'px') return n;
                if (unit === 'in') return n * dpi;
                if (unit === 'cm') return (n / 2.54) * dpi;
                return (n / 25.4) * dpi;
            },
            fromPixels: (px, unit = 'mm', dpi = 96) => {
                const n = parseFloat(px) || 0;
                if (unit === 'px') return n;
                if (unit === 'in') return n / dpi;
                if (unit === 'cm') return (n / dpi) * 2.54;
                return (n / dpi) * 25.4;
            },
            detectFormat: () => 'A4'
        };
    }

    function mmToPx(mm, dpi) {
        const d = dpi || (global.state && global.state.dpi) || 96;
        return Math.round(getUnitService().toPixels(Number(mm) || 0, 'mm', d));
    }

    function pxToMm(px, dpi) {
        const d = dpi || (global.state && global.state.dpi) || 96;
        return Math.round(getUnitService().fromPixels(Number(px) || 0, 'mm', d) * 10) / 10;
    }

    function getCurrentPageContext() {
        const st = global.state || {};
        const paperEl = document.getElementById('paper');
        const dpi = st.dpi || 96;
        const activeUnit = st.unit || 'cm';
        const wPx = paperEl ? (parseFloat(paperEl.style.width) || 794) : 794;
        const hPx = paperEl ? (parseFloat(paperEl.style.height) || 1123) : 1123;
        const wMm = pxToMm(wPx, dpi);
        const hMm = pxToMm(hPx, dpi);
        const orientation = wPx >= hPx ? 'landscape' : 'portrait';
        const ucs = getUnitService();
        const wActive = Math.round(ucs.fromPixels(wPx, activeUnit, dpi) * 100) / 100;
        const hActive = Math.round(ucs.fromPixels(hPx, activeUnit, dpi) * 100) / 100;
        const format = st.format || (ucs.detectFormat ? ucs.detectFormat(wPx, hPx, dpi) : 'A4');
        const schemeName = st.currentScheme || 'Classic';
        const schemePalette = (global.colorSchemes && global.colorSchemes[schemeName]) || [];
        const marginsPx = st.margins || { top: 48, right: 48, bottom: 48, left: 48 };
        const marginsMm = {
            top: pxToMm(marginsPx.top, dpi),
            right: pxToMm(marginsPx.right, dpi),
            bottom: pxToMm(marginsPx.bottom, dpi),
            left: pxToMm(marginsPx.left, dpi)
        };

        return {
            width_mm: wMm,
            height_mm: hMm,
            width_active: wActive,
            height_active: hActive,
            activeUnit,
            format,
            orientation,
            colorScheme: schemeName,
            schemeColors: schemePalette,
            margins_mm: marginsMm,
            isDarkMode: document.body.classList.contains('dark-mode'),
            elementCount: paperEl ? paperEl.querySelectorAll('.pub-element:not(.master-page-element):not([data-is-theme="true"])').length : 0
        };
    }

    function buildAISystemPrompt(currentPageContext) {
        const ctx = Object.assign({}, getCurrentPageContext(), currentPageContext || {});
        const schemePaletteStr = Array.isArray(ctx.schemeColors) && ctx.schemeColors.length
            ? ctx.schemeColors.join(', ')
            : '#004d40, #00796b, #26a69a, #b2dfdb, #007670';

        const schemesList = global.colorSchemes ? Object.keys(global.colorSchemes).join(', ') : 'Classic, Oceanic, Sunset, Forest, Berry, Monochrome, Pastel, Neon, Corporate, Earth, Cyberpunk, Vintage, Minimal, Autumn, Spring';

        return [
            'You are OpenPublisher AI, a layout and command assistant for OpenPublisher (openpublisher.app).',
            'Return ONLY valid JSON matching the exact schema below. Do not include markdown fences or extra commentary.',
            '',
            `ACTIVE DOCUMENT CONTEXT: Format=${ctx.format}, Size=${ctx.width_mm}x${ctx.height_mm}mm (${ctx.width_active}x${ctx.height_active}${ctx.activeUnit}), Orientation=${ctx.orientation}, ActiveUnits=${ctx.activeUnit}, Margins_mm=${JSON.stringify(ctx.margins_mm)}, ColorScheme="${ctx.colorScheme}" [${schemePaletteStr}], DarkMode=${!!ctx.isDarkMode}, ExistingElements=${ctx.elementCount}.`,
            'COORDINATES: Always use millimeters (x_mm, y_mm, width_mm, height_mm) relative to top-left (0,0). Keep elements cleanly inside page dimensions with good typography, visual hierarchy, and no unintended overlap.',
            '- SPACING RULE: Leave at least 10mm of vertical gap between stacked elements so headings, badges, and boxes never overlap. When borderArt is used, keep all elements at least 20mm away from the page edges (x_mm >= 20, y_mm >= 20).',
            '- APP COMMANDS RULE: Leave "appCommands" empty ({}) UNLESS the user explicitly asks to change the app UI theme, dark/light mode, guides, grid, baselines, bounds, spreads, proofing, or tools. Colorful or themed layouts MUST use pageConfig.colorScheme or pageConfig.pageTheme, NEVER appCommands.uiTheme.',
            '- CONTRAST RULE: Dark backgrounds (page or element fill) require light text (#ffffff or #f8fafc); light backgrounds require dark text (#0f172a or #1e293b). Light cards placed on dark pages must use dark text. Never place similar-toned text on a background.',
            '',
            'REQUIRED 3-PART JSON SCHEMA:',
            '{',
            '  "summary": "Brief friendly message explaining what was created or changed",',
            '  "appCommands": {',
            '    "uiTheme": "optional dark|light or UI theme name (e.g. Publisher / Classic (Teal), OneDrive / Ocean (Blue), Midnight Dark, Forest Green, Sunset (Orange), Word (Blue), Excel (Green), Discord (Blurple))",',
            '    "toggleGuides": "optional boolean",',
            '    "toggleGrid": "optional boolean",',
            '    "toggleBaselines": "optional boolean",',
            '    "toggleBounds": "optional boolean",',
            '    "toggleSpreads": "optional boolean",',
            '    "colorProofing": "optional none|protanopia|deuteranopia|tritanopia|achromatopsia",',
            '    "recolorMode": "optional none|grayscale|sepia|invert|warm|cool",',
            '    "activateDrawingTool": "optional pencil|brush|spray|eraser",',
            '    "openModalOrSuite": "optional analysis_suite|writers_grade|writers_tone|writers_concise|writers_passive|writers_sentiment|writers_stats|accessibility|design_checker|compress_image|document_inspector"',
            '  },',
            '  "pageConfig": {',
            '    "clearCurrentPage": "optional boolean",',
            '    "format": "optional A4|A3|A5|Letter|Legal|Tabloid|BusinessCard|Square",',
            '    "width_mm": "optional number (only for custom size)",',
            '    "height_mm": "optional number (only for custom size)",',
            '    "orientation": "optional portrait|landscape",',
            '    "margins_mm": { "top": 12.7, "right": 12.7, "bottom": 12.7, "left": 12.7 },',
            `    "colorScheme": "optional one of: ${schemesList}",`,
            '    "pageTheme": "optional Theme Studio ID (white-wall, cream-paper, linen-cloth, aged-parchment-tex, aurora-sky, sunset-horizon, cosmic-violet, azure-tide, executive-slate, oxford-blue-wash, legal-ivory, warm-parchment, minimalist-chalk, matte-noir, obsidian-gold, midnight-navy, sage-matcha, blush-rose, lavender-mist, soft-peach) OR {type:\"gradient\"|\"solid\",c1:\"#hex\",c2:\"#hex\"}",',
            '    "backgroundColor": "optional hex/css color",',
            '    "backgroundImage": "optional HTTPS image URL",',
            '    "border": "optional none|solid|double|dashed|fancy-deco|fancy-cert|fancy-double|fancy-antique|fancy-modern|fancy-floral",',
            '    "borderArt": { "styleId": "santas|bells|christmas_trees|stars|balloons|gifts|cakes|diamonds|hearts|roses|sunflowers|flowers|autumn_leaves|butterflies|palm_trees|seashells|soccer_balls|pencils|clocks", "size": 32, "margin": 15 },',
            '    "watermark": { "presetId": "draft|confidential|sample|donotcopy|urgent|paid|copy|proof|security_tile", "text": "optional override", "color": "#64748b", "opacity": 0.16, "mode": "diagonal|horizontal|tile" },',
            '    "headerFooter": { "visible": true, "headerHTML": "optional string", "footerHTML": "optional string" },',
            '    "createMasterPage": "optional boolean",',
            '    "loadTemplateId": "optional template keyword/filename"',
            '  },',
            '  "elements": [',
            '    {',
            '      "type": "text_box|styled_text_box|wordart_beta|wordart_legacy|clipart|table|styled_table|chart|ad_badge|page_part|emoji|symbol|shape|smart_arrow|border|progress_bar|coupon|qr_code|business_info|drawing_path|custom_html|ai_vector",',
            '      "x_mm": 20, "y_mm": 20, "width_mm": 100, "height_mm": 40, "rotation": 0, "zIndex": 10,',
            '      "props": {}',
            '    }',
            '  ]',
            '}',
            '',
            'ELEMENT PROPS GUIDE:',
            '- ai_vector: { svg?: "inline SVG markup", stylePreset?: "Flat Illustration|Logo / Emblem|Line Art|Sticker Badge|Detailed Scene" }',
            '- text_box: { text, html, fontFamily, fontSizePx (10-120), color, backgroundColor, bold, italic, underline, align ("left|center|right|justify"), lineHeight, paddingPx, border, borderRadius }',
            '- styled_text_box: { styleId ("quote-teal|quote-gold|callout-soft|callout-tip|card-dark|card-elevated|card-frosted|card-header|stat-highlight|pill-vibrant|pill-dark|ticket-coupon|frame-classic|accent-top|solid-theme|quote-modern|callout-warning|callout-success|card-sunset|card-ocean|card-neon-cyber|pill-gold|stat-glass|ticket-retro|frame-certificate|accent-left-bold|quote-crimson|quote-emerald|quote-navy-academic|callout-danger|callout-info|callout-note"), text, html, fontSizePx, align, color }',
            '- wordart_beta: { text, styleId (1-200: 1=Gold/Blue, 2=Chrome, 3=Rainbow, 4=Pink/Black, 30=GoldArch, 31=CyanGlow, 33=Fire, 34=Ice, 41=CircleGold, 43=PurpleNeon, 47=TealPink) }',
            '- wordart_legacy: { text, styleId (1-214), fontFamily, color }',
            '- clipart: { query (search keywords like "rocket", "coffee", "flower", "trophy", "laptop"), filename (optional exact PNG), opacity }',
            '- table: { rows, cols, headers: ["Col1",...], data: [["r1c1",...]], headerBg, cellBg, borderColor, textColor }',
            '- styled_table: { design ("grid|banded|lined|columns|firstcol|checker|clean|soft|accentbar|matrix|round|roundgrid|pill|roundsoft|float|tiles|cards|bold|heavy|paper|ledger|dotted"), palette ("teal|ocean|cobalt|navy|indigo|violet|purple|rose|crimson|tangerine|amber|gold|emerald|forest|mint|cyan|slate|graphite|midnight|noirgold"), rows, cols, header: true, banded: true, content ("blank|schedule|invoice|pricing|compare|roster|financial|project|menu|sample"), headers: [...], data: [[...]] }',
            '- chart: { type ("pie|donut|column|bar|line|area|half-donut|stacked-column|radar"), title, showLegend: true, showValues: true, data: [{ "label": "A", "value": 40, "color": "#0d9488" }] }',
            '- ad_badge: { presetId ("burst_classic_ruby|burst_crimson_gold|burst_publisher_teal|burst_sunburst_orange|discount_50_circle|discount_70_slash|discount_bogo_token|discount_save_big|ribbon_3d_ruby|ribbon_3d_teal|ribbon_3d_gold|ribbon_award_rosette|seal_guarantee_100|seal_certified_stamp|seal_top_pick"), primaryText, subtext, paletteId ("publisher-teal|ruby-crimson|electric-cobalt|sunset-tangerine|emerald-deal|royal-purple|luxury-gold|neon-cyber|dark-titanium"), font }',
            '- page_part: { partId ("sidebar|pullquote|heading|callout|contact|step|step-right|tear-off|bio|checklist|menu-item|photo-block|review|event-date|stat|signature|pros-cons|qa-block|takeaway|warning"), title, subtitle, body }',
            '- emoji: { char (e.g. "🚀", "⭐", "🎉") }',
            '- symbol: { char (e.g. "©", "★", "✓", "♥", "→", "§", "•", "™"), color, fontSizePx }',
            '- shape: { shapeName ("Rectangle|Rounded Rect|Circle|Oval|Right Triangle|Diamond|5-Point Star|8-Point Burst|Heart|Lightning|Sun|Moon|Cloud|Shield|Plaque|Frame|Checkmark|Rect Callout|Rounded Callout|Up Ribbon|Down Ribbon"), fillColor, strokeColor, strokeWidth, opacity, text, textColor }',
            '- smart_arrow: { styleId ("block-right|block-left|block-up|block-down|block-left-right|block-up-down|quad-arrow|chevron-right|stealth-right|curved-down-right|curved-up-right|u-turn-down|dovetail-right|tapered-right|slender-right|needle-right|hairline-arrow"), fillColor, strokeColor, strokeWidth }',
            '- border: { borderStyle ("solid|dashed|dotted|double"), borderColor, borderWidthPx, borderRadiusPx, backgroundColor, borderArtId, borderArtSize, borderArtInset }',
            '- progress_bar: { styleId ("capsule-green|capsule-teal|inside-counter|forest-sage|obsidian-gold|modern-sapphire|corporate-navy|sunset-gradient|cyber-cyan|violet-dream|chunky-skills-banner|grand-competency-slab"), percentage (0-100), fillColor, trackColor, showLabel ("none|right|inside|floating"), labelColor }',
            '- coupon: { type ("standard|tearaway|bogo|giftcard|loyalty|vip|drink|promo|ticket|credit|raffle"), headline, subtext, code, footer }',
            '- qr_code: { data (URL or text), color ("#000000"), bgcolor ("#ffffff"), style ("square|rounded|circle") }',
            '- business_info: { bulk ("letterhead|signature|business-card") OR field ("name|title|organization|address|contact|tagline|logo"), organization, name, title, address, contact, tagline }',
            '- drawing_path: { tool ("pencil|brush|spray"), d (SVG path data in 0..100 viewBox OR pixel viewBox), strokes: [{ d, stroke, strokeWidth, fill, opacity }], viewBoxWidth, viewBoxHeight }',
            '- custom_html: { html (complete HTML fragment for cards, itineraries, calendars, dividers, pricing, bespoke layouts), css (scoped CSS classes used inside html), editable: true }'
        ].join('\n');
    }

    /* ------------------------------------------------------------------------
       3. ATOMIC UNDO WRAPPER & ELEMENT CONSTRUCTION HELPERS
       ------------------------------------------------------------------------ */

    function escapeHtml(str) {
        return String(str === undefined || str === null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function sanitizeHtmlFragment(html) {
        if (!html || typeof html !== 'string') return '';
        let safe = html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<\/?(?:iframe|object|embed|applet|base|meta|link|form)\b[^>]*>/gi, '')
            .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
            .replace(/(href|src|xlink:href)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1=$2#$2');
        return safe;
    }

    function scopeCssRules(cssText, scopeClass) {
        if (!cssText || typeof cssText !== 'string') return '';
        const cleaned = cssText.replace(/<\/?style[^>]*>/gi, '').replace(/@import[^;]+;/gi, '');
        const scope = `.${scopeClass}`;

        function prefixSelectors(selectorPart) {
            return selectorPart
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .map(s => {
                    if (/^(html|body|:root)\b/i.test(s)) {
                        return s.replace(/^(html|body|:root)/i, scope);
                    }
                    if (s.startsWith(scope)) return s;
                    return `${scope} ${s}`;
                })
                .join(', ');
        }

        let result = '';
        let i = 0;
        const len = cleaned.length;
        while (i < len) {
            const openBrace = cleaned.indexOf('{', i);
            if (openBrace === -1) break;
            const header = cleaned.slice(i, openBrace).trim();
            let depth = 1;
            let pos = openBrace + 1;
            while (pos < len && depth > 0) {
                if (cleaned[pos] === '{') depth++;
                else if (cleaned[pos] === '}') depth--;
                pos++;
            }
            const body = cleaned.slice(openBrace + 1, Math.max(openBrace + 1, pos - 1));
            if (header.startsWith('@keyframes') || header.startsWith('@-webkit-keyframes') || header.startsWith('@font-face')) {
                result += `${header} { ${body} }\n`;
            } else if (header.startsWith('@')) {
                result += `${header} {\n${scopeCssRules(body, scopeClass)}}\n`;
            } else if (header) {
                result += `${prefixSelectors(header)} { ${body} }\n`;
            }
            i = pos;
        }
        return result;
    }

    function parsePngDimensionsFromDataUrl(dataUrl) {
        try {
            if (!dataUrl || typeof dataUrl !== 'string') return null;
            const commaIdx = dataUrl.indexOf(',');
            if (commaIdx === -1) return null;
            const b64 = dataUrl.slice(commaIdx + 1);
            const bin = atob(b64.slice(0, 64));
            if (bin.length < 24 || bin.charCodeAt(0) !== 0x89 || bin.charCodeAt(1) !== 0x50) return null;
            const w = (bin.charCodeAt(16) << 24) | (bin.charCodeAt(17) << 16) | (bin.charCodeAt(18) << 8) | bin.charCodeAt(19);
            const h = (bin.charCodeAt(20) << 24) | (bin.charCodeAt(21) << 16) | (bin.charCodeAt(22) << 8) | bin.charCodeAt(23);
            if (w > 0 && h > 0) return { width: w, height: h };
        } catch (e) { /* ignore */ }
        return null;
    }

    function applyPlacement(el, item, dpi, defaultWpx, defaultHpx) {
        if (!el) return el;
        if (item.x_mm !== undefined && item.x_mm !== null) {
            el.style.left = mmToPx(item.x_mm, dpi) + 'px';
        }
        if (item.y_mm !== undefined && item.y_mm !== null) {
            el.style.top = mmToPx(item.y_mm, dpi) + 'px';
        }
        if (item.width_mm !== undefined && item.width_mm !== null) {
            el.style.width = Math.max(8, mmToPx(item.width_mm, dpi)) + 'px';
        } else if (defaultWpx && (!el.style.width || el.style.width === '200px')) {
            el.style.width = Math.max(8, Math.round(defaultWpx)) + 'px';
        }
        if (item.height_mm !== undefined && item.height_mm !== null) {
            el.style.height = Math.max(8, mmToPx(item.height_mm, dpi)) + 'px';
        } else if (defaultHpx && (!el.style.height || el.style.height === '100px')) {
            el.style.height = Math.max(8, Math.round(defaultHpx)) + 'px';
        }
        if (item.zIndex !== undefined && item.zIndex !== null) {
            el.style.zIndex = String(item.zIndex);
        }
        if (item.rotation !== undefined && item.rotation !== null && Number(item.rotation) !== 0) {
            const deg = parseFloat(item.rotation) || 0;
            const existing = (el.style.transform || '').replace(/rotate\([^)]+\)/gi, '').trim();
            el.style.transform = existing ? `${existing} rotate(${deg}deg)` : `rotate(${deg}deg)`;
        }
        return el;
    }

    /* ------------------------------------------------------------------------
       Command gating, WCAG contrast guard & real clipart lookup
       ------------------------------------------------------------------------ */

    const UI_THEME_INTENT_RE = /\b(ui\s*theme|dark\s*mode|light\s*mode|app\s*theme|interface)\b/i;
    const GUIDES_INTENT_RE = /\b(guide|guides|margin\s*guides)\b/i;
    const VIEW_AID_INTENT_RE = /\b(grid|baseline|baselines|bound|bounds|boundaries|spread|spreads)\b/i;
    const CONTRAST_MIN = 4.2;
    const CONTRAST_CHECKED_TYPES = new Set(['text_box', 'styled_text_box', 'table', 'styled_table', 'coupon', 'page_part', 'custom_html', 'business_info', 'symbol']);

    /** Drops app-level UI/view commands the user did not explicitly ask for. */
    function gateAppCommands(cmds, userPrompt) {
        if (!cmds || typeof cmds !== 'object') return null;
        const text = String(userPrompt || '');
        const gated = Object.assign({}, cmds);
        if (!UI_THEME_INTENT_RE.test(text)) delete gated.uiTheme;
        if (!GUIDES_INTENT_RE.test(text)) delete gated.toggleGuides;
        if (!VIEW_AID_INTENT_RE.test(text)) {
            delete gated.toggleGrid;
            delete gated.toggleBaselines;
            delete gated.toggleBounds;
            delete gated.toggleSpreads;
        }
        return gated;
    }

    function parseColor(str) {
        if (typeof str !== 'string') return null;
        let s = str.trim();
        const vm = s.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)$/);
        if (vm) {
            const resolved = getComputedStyle(document.documentElement).getPropertyValue(vm[1]).trim();
            s = resolved || (vm[2] ? vm[2].trim() : '');
        }
        s = s.toLowerCase();
        if (!s) return null;
        if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
        if (s === 'white') return { r: 255, g: 255, b: 255, a: 1 };
        if (s === 'black') return { r: 0, g: 0, b: 0, a: 1 };
        let m = s.match(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b/);
        if (m) {
            let h = m[1];
            if (h.length === 3) h = h.split('').map(c => c + c).join('');
            return {
                r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16),
                a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
            };
        }
        m = s.match(/rgba?\(([^)]+)\)/);
        if (m) {
            const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
            if (p.length >= 3 && p.slice(0, 3).every(n => !isNaN(n))) {
                let a = p.length > 3 && !isNaN(p[3]) ? p[3] : 1;
                if (a > 1) a = a / 100;
                return { r: p[0], g: p[1], b: p[2], a };
            }
        }
        return null;
    }

    function averageGradientColor(str) {
        if (typeof str !== 'string' || !str.includes('gradient')) return null;
        const found = str.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g);
        if (!found) return null;
        const cols = found.map(parseColor).filter(c => c && c.a > 0);
        if (!cols.length) return null;
        const n = cols.length;
        return {
            r: cols.reduce((s, c) => s + c.r, 0) / n,
            g: cols.reduce((s, c) => s + c.g, 0) / n,
            b: cols.reduce((s, c) => s + c.b, 0) / n,
            a: Math.min(1, cols.reduce((s, c) => s + c.a, 0) / n)
        };
    }

    function relLuminance(c) {
        const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
        return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    }

    function contrastRatio(a, b) {
        const l1 = relLuminance(a), l2 = relLuminance(b);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }

    function compositeOver(top, base) {
        const a = top.a === undefined ? 1 : top.a;
        return { r: top.r * a + base.r * (1 - a), g: top.g * a + base.g * (1 - a), b: top.b * a + base.b * (1 - a), a: 1 };
    }

    function rgbToCss(c) {
        return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
    }

    function getPageBackgroundRgb() {
        const white = { r: 255, g: 255, b: 255, a: 1 };
        const paper = document.getElementById('paper');
        if (!paper) return white;
        if (paper.getAttribute('data-theme-saved') === 'true') {
            const c1 = parseColor(paper.getAttribute('data-theme-c1') || '');
            const c2 = parseColor(paper.getAttribute('data-theme-c2') || '');
            if (c1) {
                if (c2 && paper.getAttribute('data-theme-type') === 'gradient') {
                    return { r: (c1.r + c2.r) / 2, g: (c1.g + c2.g) / 2, b: (c1.b + c2.b) / 2, a: 1 };
                }
                return compositeOver(c1, white);
            }
        }
        const cs = getComputedStyle(paper);
        const grad = averageGradientColor(cs.backgroundImage);
        if (grad) return compositeOver(grad, white);
        const c = parseColor(cs.backgroundColor);
        return c && c.a > 0 ? compositeOver(c, white) : white;
    }

    /**
     * WCAG-based guard: returns fgHex unchanged when it already reads well on bgHex (null bg = page background),
     * otherwise returns white (dark background) or near-black (light background).
     */
    function ensureReadableContrast(fgHex, bgHex) {
        const fg = parseColor(String(fgHex || ''));
        if (!fg) return fgHex;
        let bg = parseColor(String(bgHex || ''));
        const page = getPageBackgroundRgb();
        bg = bg ? (bg.a < 0.99 ? compositeOver(bg, page) : bg) : page;
        const fgSolid = fg.a < 1 ? compositeOver(fg, bg) : fg;
        if (contrastRatio(fgSolid, bg) >= CONTRAST_MIN) return fgHex;
        return relLuminance(bg) < 0.42 ? '#ffffff' : '#0f172a';
    }

    function getEffectiveBackgroundRgb(node, paper, pageRgb) {
        const layers = [];
        let cur = node;
        while (cur && cur !== paper && cur.nodeType === 1) {
            const cs = getComputedStyle(cur);
            let layer = averageGradientColor(cs.backgroundImage);
            if (!layer) {
                const c = parseColor(cs.backgroundColor);
                if (c && c.a > 0) layer = c;
            }
            if (layer) {
                layers.push(layer);
                if (layer.a >= 0.99) break;
            }
            cur = cur.parentElement;
        }
        let result = pageRgb;
        for (let i = layers.length - 1; i >= 0; i--) result = compositeOver(layers[i], result);
        return result;
    }

    /** Walks every text-bearing node in a created element and fixes unreadable text/background combinations. */
    function fixElementContrast(root) {
        const paper = document.getElementById('paper');
        if (!root || !paper) return 0;
        const pageRgb = getPageBackgroundRgb();
        const nodes = [root].concat(Array.from(root.querySelectorAll('*'))).slice(0, 600);
        let fixed = 0;
        nodes.forEach(n => {
            if (n.namespaceURI && n.namespaceURI.indexOf('svg') !== -1) return;
            if (n.classList && (n.classList.contains('resize-handle') || n.classList.contains('rotate-handle') || n.classList.contains('rotate-stick'))) return;
            if (!Array.from(n.childNodes).some(t => t.nodeType === 3 && t.textContent.trim())) return;
            const curColor = getComputedStyle(n).color;
            const fg = parseColor(curColor);
            if (!fg || fg.a < 0.1) return;
            const bg = getEffectiveBackgroundRgb(n, paper, pageRgb);
            const out = ensureReadableContrast(curColor, rgbToCss(bg));
            if (out !== curColor) {
                n.style.setProperty('color', out, 'important');
                fixed++;
            }
        });
        return fixed;
    }

    /* ---- Clipart: local library fuzzy match -> built-in illustrations -> Iconify -> generic (never text) ---- */

    const CLIPART_STOPWORDS = new Set(['a', 'an', 'the', 'of', 'and', 'for', 'with', 'icon', 'icons', 'picture', 'image', 'images', 'clipart', 'clip', 'art', 'illustration', 'png', 'small', 'big', 'large', 'simple', 'cute', 'little']);
    let _clipartIndex = null;
    let _clipartIndexSize = -1;

    function stemWord(w) {
        w = String(w).toLowerCase().replace(/[^a-z0-9]/g, '');
        if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
        if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
        if (w.length > 4 && /(ches|shes|sses|xes)$/.test(w)) return w.slice(0, -2);
        if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
        return w;
    }

    function tokenizeWords(text) {
        return String(text || '').toLowerCase().split(/[^a-z0-9]+/).filter(t => t && !CLIPART_STOPWORDS.has(t) && !/^\d+$/.test(t)).map(stemWord).filter(t => t.length > 1);
    }

    function getClipartLibrary() {
        let lib = null;
        try { if (typeof webClipartLibrary !== 'undefined' && Array.isArray(webClipartLibrary)) lib = webClipartLibrary; } catch (e) { /* not loaded */ }
        if (!lib && Array.isArray(global.CLIPART_DATA)) lib = global.CLIPART_DATA;
        return (lib || []).map(i => (typeof i === 'string' ? i : (i && (i.file || i.filename)) || '')).filter(Boolean);
    }

    function getClipartBaseUrl() {
        try { if (typeof webClipartBaseUrl === 'string') return webClipartBaseUrl; } catch (e) { /* not loaded */ }
        return 'https://wsrv.nl/?url=acr.floydcraft.co.uk/clipart/';
    }

    function buildClipartIndex(lib) {
        if (_clipartIndex && _clipartIndexSize === lib.length) return _clipartIndex;
        _clipartIndex = lib.map(file => {
            const name = file.replace(/\.png$/i, '').replace(/-\d+$/, '')
                .replace(/_PNG_Clip_Art|_PNG_Clipart|_PNG_Image|_Clip_Art_PNG_Image|_Clip_Art|_Clipart|_PNG/gi, '').replace(/_/g, ' ');
            return { file, tokens: tokenizeWords(name) };
        });
        _clipartIndexSize = lib.length;
        return _clipartIndex;
    }

    function findLocalClipart(query, explicitFilename) {
        const lib = getClipartLibrary();
        if (!lib.length) return null;
        if (explicitFilename && lib.includes(explicitFilename)) return explicitFilename;
        const qStems = tokenizeWords(query);
        if (!qStems.length) return null;
        const need = Math.max(1, Math.ceil(qStems.length / 2));
        let best = null;
        let bestScore = -Infinity;
        buildClipartIndex(lib).forEach(entry => {
            let matched = 0;
            let score = 0;
            qStems.forEach(q => {
                if (entry.tokens.includes(q)) { matched++; score += 4; }
                else if (q.length >= 4 && entry.tokens.some(t => t.startsWith(q))) { matched++; score += 2; }
            });
            if (matched < need) return;
            score = score * 10 - entry.tokens.length + (matched === qStems.length ? 100 : 0);
            if (score > bestScore) { bestScore = score; best = entry.file; }
        });
        return best;
    }

    function svgToDataUri(svg) {
        return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    const SVG_OPEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">';
    const BUILTIN_CLIPART = {
        tree: SVG_OPEN + '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#047857"/></linearGradient></defs><rect x="44" y="78" width="12" height="16" rx="2" fill="#92400e"/><polygon points="50,6 74,38 62,38 82,62 66,62 90,84 10,84 34,62 18,62 38,38 26,38" fill="url(#g)" stroke="#065f46" stroke-width="2" stroke-linejoin="round"/><circle cx="42" cy="58" r="3" fill="#fde047"/><circle cx="60" cy="72" r="3" fill="#f87171"/><circle cx="52" cy="40" r="3" fill="#60a5fa"/></svg>',
        star: SVG_OPEN + '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde047"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><polygon points="50,6 61,38 95,38 67,58 78,92 50,71 22,92 33,58 5,38 39,38" fill="url(#g)" stroke="#d97706" stroke-width="3" stroke-linejoin="round"/></svg>',
        gift: SVG_OPEN + '<rect x="14" y="44" width="72" height="46" rx="4" fill="#ef4444"/><rect x="10" y="32" width="80" height="16" rx="4" fill="#dc2626"/><rect x="44" y="32" width="12" height="58" fill="#fde047"/><path d="M50 32C38 10 20 16 28 28C34 34 46 32 50 32Z" fill="#fde047" stroke="#eab308" stroke-width="2"/><path d="M50 32C62 10 80 16 72 28C66 34 54 32 50 32Z" fill="#facc15" stroke="#eab308" stroke-width="2"/></svg>',
        heart: SVG_OPEN + '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fb7185"/><stop offset="1" stop-color="#be123c"/></linearGradient></defs><path d="M50 90C10 60 6 30 26 20C38 14 47 22 50 30C53 22 62 14 74 20C94 30 90 60 50 90Z" fill="url(#g)"/><ellipse cx="33" cy="32" rx="7" ry="4" fill="#fff" opacity="0.35" transform="rotate(-30 33 32)"/></svg>',
        trophy: SVG_OPEN + '<path d="M30 20H16c0 16 8 24 18 26M70 20h14c0 16-8 24-18 26" fill="none" stroke="#eab308" stroke-width="5" stroke-linecap="round"/><path d="M30 12h40v30c0 14-9 24-20 24s-20-10-20-24Z" fill="#facc15" stroke="#ca8a04" stroke-width="3"/><rect x="45" y="66" width="10" height="12" fill="#ca8a04"/><rect x="32" y="78" width="36" height="10" rx="3" fill="#a16207"/><polygon points="50,24 54,34 65,34 56,40 59,50 50,44 41,50 44,40 35,34 46,34" fill="#fff7ae"/></svg>',
        rocket: SVG_OPEN + '<path d="M34 58L16 78L36 72Z" fill="#ef4444"/><path d="M66 58L84 78L64 72Z" fill="#ef4444"/><path d="M42 72C44 84 50 96 50 96C50 96 56 84 58 72Z" fill="#f59e0b"/><path d="M50 4C68 20 72 48 66 72H34C28 48 32 20 50 4Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="3"/><circle cx="50" cy="38" r="9" fill="#38bdf8" stroke="#0369a1" stroke-width="3"/></svg>',
        sun: SVG_OPEN + '<g stroke="#f59e0b" stroke-width="6" stroke-linecap="round"><path d="M50 6v12M50 82v12M6 50h12M82 50h12M19 19l9 9M72 72l9 9M81 19l-9 9M28 72l-9 9"/></g><circle cx="50" cy="50" r="22" fill="#fbbf24" stroke="#f59e0b" stroke-width="3"/></svg>',
        flower: SVG_OPEN + '<path d="M50 60V94" stroke="#16a34a" stroke-width="5" stroke-linecap="round"/><path d="M50 82C62 74 72 78 76 70C64 68 56 74 50 82Z" fill="#22c55e"/><g fill="#f472b6" stroke="#db2777" stroke-width="2"><circle cx="50" cy="24" r="14"/><circle cx="72" cy="40" r="14"/><circle cx="64" cy="64" r="14"/><circle cx="36" cy="64" r="14"/><circle cx="28" cy="40" r="14"/></g><circle cx="50" cy="48" r="11" fill="#fde047" stroke="#eab308" stroke-width="2"/></svg>',
        balloon: SVG_OPEN + '<path d="M50 78q-8 8 0 12t0 8" fill="none" stroke="#64748b" stroke-width="2"/><ellipse cx="50" cy="38" rx="26" ry="32" fill="#ef4444" stroke="#b91c1c" stroke-width="3"/><polygon points="45,70 55,70 50,77" fill="#b91c1c"/><ellipse cx="40" cy="24" rx="6" ry="10" fill="#fff" opacity="0.35" transform="rotate(25 40 24)"/></svg>',
        lightbulb: SVG_OPEN + '<path d="M50 8C32 8 20 21 20 37c0 12 6 18 11 24 3 4 4 7 4 11h30c0-4 1-7 4-11 5-6 11-12 11-24C80 21 68 8 50 8Z" fill="#fde047" stroke="#eab308" stroke-width="3"/><rect x="36" y="76" width="28" height="7" rx="3" fill="#94a3b8"/><rect x="40" y="85" width="20" height="6" rx="3" fill="#64748b"/></svg>'
    };
    const BUILTIN_CLIPART_ALIASES = {
        xmas: 'tree', pine: 'tree', fir: 'tree', oak: 'tree', forest: 'tree', plant: 'tree',
        stars: 'star', favourite: 'star', favorite: 'star', rating: 'star',
        present: 'gift', gifts: 'gift', birthday: 'balloon', party: 'balloon', celebration: 'balloon',
        love: 'heart', romance: 'heart', valentine: 'heart',
        award: 'trophy', winner: 'trophy', champion: 'trophy', prize: 'trophy', cup: 'trophy',
        launch: 'rocket', space: 'rocket', startup: 'rocket', spaceship: 'rocket',
        sunshine: 'sun', summer: 'sun', blossom: 'flower', rose: 'flower', daisy: 'flower', floral: 'flower',
        idea: 'lightbulb', bulb: 'lightbulb', light: 'lightbulb'
    };

    function findBuiltinClipart(query) {
        const stems = tokenizeWords(query);
        for (let i = 0; i < stems.length; i++) {
            const key = BUILTIN_CLIPART[stems[i]] ? stems[i] : BUILTIN_CLIPART_ALIASES[stems[i]];
            if (key && BUILTIN_CLIPART[key]) return svgToDataUri(BUILTIN_CLIPART[key]);
        }
        return null;
    }

    const GENERIC_CLIPART_SVG = SVG_OPEN + '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2dd4bf"/><stop offset="1" stop-color="#0f766e"/></linearGradient></defs><path d="M50 6L60 38L94 50L60 62L50 94L40 62L6 50L40 38Z" fill="url(#g)" stroke="#0f766e" stroke-width="2" stroke-linejoin="round"/></svg>';

    async function fetchIconifyDataUri(query) {
        const q = encodeURIComponent(String(query || '').trim());
        if (!q) return null;
        const scheme = global.colorSchemes && global.state && global.colorSchemes[global.state.currentScheme];
        const tint = (scheme && /^#[0-9a-f]{3,8}$/i.test(scheme[3] || '')) ? scheme[3] : '#0f766e';
        const searches = [
            `https://api.iconify.design/search?query=${q}&limit=1&prefixes=noto,twemoji,fluent-emoji-flat,openmoji`,
            `https://api.iconify.design/search?query=${q}&limit=1`
        ];
        for (let s = 0; s < searches.length; s++) {
            try {
                const sr = await fetch(searches[s]);
                if (!sr.ok) continue;
                const data = await sr.json();
                const icon = data && Array.isArray(data.icons) ? data.icons[0] : null;
                if (!icon || icon.indexOf(':') < 0) continue;
                const parts = icon.split(':');
                const svgRes = await fetch(`https://api.iconify.design/${parts[0]}/${parts[1]}.svg`);
                if (!svgRes.ok) continue;
                let svg = await svgRes.text();
                if (!/<svg[\s>]/i.test(svg)) continue;
                svg = svg.replace(/currentColor/g, tint);
                if (!/\sxmlns=/.test(svg)) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
                return svgToDataUri(svg);
            } catch (e) { /* try next source */ }
        }
        return null;
    }

    async function resolveClipartSource(item) {
        const props = (item && item.props) || {};
        const query = props.query || props.name || props.keyword || '';
        const file = findLocalClipart(query, props.filename);
        if (file) return { src: getClipartBaseUrl() + encodeURIComponent(file), kind: 'library', file };
        const builtin = findBuiltinClipart(query);
        if (builtin) return { src: builtin, kind: 'builtin' };
        const iconify = await fetchIconifyDataUri(query);
        if (iconify) return { src: iconify, kind: 'iconify' };
        return { src: svgToDataUri(GENERIC_CLIPART_SVG), kind: 'generic' };
    }

    async function resolveClipartSources(elements) {
        await Promise.all(elements.map(async item => {
            if (item && String(item.type).toLowerCase().trim() === 'clipart') {
                item._resolvedClipart = await resolveClipartSource(item);
            }
        }));
    }

    function buildShapeFallbackSvg(shapeName) {
        const key = String(shapeName || 'rectangle').toLowerCase().trim();
        const starPts = (pts, ir) => {
            const out = [];
            for (let i = 0; i < pts * 2; i++) {
                const r = i % 2 === 0 ? 45 : ir;
                const a = (i * Math.PI / pts) - Math.PI / 2;
                out.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`);
            }
            return `<polygon points="${out.join(' ')}" />`;
        };
        if (key.includes('rounded') && key.includes('callout')) return `<path d="M15,5 H85 A10,10 0 0,1 95,15 V55 A10,10 0 0,1 85,65 H60 L40,95 L40,65 H15 A10,10 0 0,1 5,55 V15 A10,10 0 0,1 15,5 Z" />`;
        if (key.includes('callout')) return `<path d="M5,5 H95 V65 H60 L40,95 L40,65 H5 Z" />`;
        if (key.includes('rounded')) return `<rect x="5" y="5" width="90" height="90" rx="15" ry="15" />`;
        if (key.includes('circle')) return `<circle cx="50" cy="50" r="45" />`;
        if (key.includes('oval') || key.includes('ellipse')) return `<ellipse cx="50" cy="50" rx="45" ry="45" />`;
        if (key.includes('diamond')) return `<polygon points="50,5 95,50 50,95 5,50" />`;
        if (key.includes('triangle')) return `<polygon points="50,5 95,95 5,95" />`;
        if (key.includes('burst')) return starPts(16, 38);
        if (key.includes('star')) return starPts(5, 20);
        if (key.includes('heart')) return `<path d="M50,90 C5,60 5,20 25,20 C35,20 45,30 50,40 C55,30 65,20 75,20 C95,20 95,60 50,90 Z" />`;
        if (key.includes('lightning') || key.includes('bolt')) return `<polygon points="60,5 15,55 45,55 40,95 85,45 55,45" />`;
        if (key.includes('cloud')) return `<path d="M30,45 A20,20 0 0,1 70,45 A25,25 0 0,1 90,70 A15,15 0 0,1 75,90 H25 A15,15 0 0,1 15,65 A20,20 0 0,1 30,45 Z" />`;
        if (key.includes('shield')) return `<path d="M10,10 H90 V40 C90,70 50,95 50,95 C50,95 10,70 10,40 Z" />`;
        if (key.includes('moon')) return `<path d="M50,5 A45,45 0 1,0 95,50 A35,35 0 1,1 50,5 Z" />`;
        if (key.includes('sun')) return `<path d="M50,25 A25,25 0 1,0 50,75 A25,25 0 1,0 50,25 Z M50,5 L55,15 H45 Z M50,95 L45,85 H55 Z M5,50 L15,45 V55 Z M95,50 L85,55 V45 Z" />`;
        if (key.includes('checkmark') || key.includes('check')) return `<path d="M10,50 L40,80 L90,10" fill="none" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
        if (key.includes('ribbon')) return `<path d="M5,30 L25,30 L25,10 Q50,30 75,10 L75,30 L95,30 L85,55 L95,80 L5,80 L15,55 Z" />`;
        if (key.includes('plaque')) return `<polygon points="15,5 85,5 95,15 95,85 85,95 15,95 5,85 5,15" />`;
        if (key.includes('hexagon')) return `<polygon points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" />`;
        return `<rect x="5" y="5" width="90" height="90" />`;
    }

    function resolveShapeInnerMarkup(shapeName) {
        const target = String(shapeName || 'Rectangle').toLowerCase().trim();
        const dropdown = document.getElementById('shape-dropdown');
        if (dropdown) {
            const items = Array.from(dropdown.querySelectorAll('.shape-dropdown-item'));
            let exact = items.find(it => (it.title || '').toLowerCase() === target);
            if (!exact) {
                exact = items.find(it => (it.title || '').toLowerCase().includes(target));
            }
            if (exact) {
                const g = exact.querySelector('svg g');
                if (g && g.innerHTML) return g.innerHTML;
            }
        }
        return buildShapeFallbackSvg(shapeName);
    }

    function matchCaseInsensitiveKey(obj, target) {
        if (!obj || !target) return null;
        if (obj[target] !== undefined) return target;
        const lower = String(target).toLowerCase().trim();
        const keys = Object.keys(obj);
        const exact = keys.find(k => k.toLowerCase() === lower);
        if (exact) return exact;
        return keys.find(k => k.toLowerCase().includes(lower)) || null;
    }

    /* ------------------------------------------------------------------------
       4. APP COMMANDS & PAGE CONFIG EXECUTORS
       ------------------------------------------------------------------------ */

    function executeAppCommands(cmd, stats) {
        if (!cmd || typeof cmd !== 'object') return;
        const paper = document.getElementById('paper');

        if (typeof cmd.uiTheme === 'string' && cmd.uiTheme.trim()) {
            const t = cmd.uiTheme.trim().toLowerCase();
            if (t === 'dark' || t === 'dark-mode' || t === 'darkmode') {
                if (typeof global.toggleDarkMode === 'function') global.toggleDarkMode(true);
                stats.commands.push('dark-mode-on');
            } else if (t === 'light' || t === 'light-mode' || t === 'lightmode') {
                if (typeof global.toggleDarkMode === 'function') global.toggleDarkMode(false);
                stats.commands.push('dark-mode-off');
            } else if (typeof global.applyTheme === 'function') {
                global.applyTheme(cmd.uiTheme.trim());
                stats.commands.push(`uiTheme:${cmd.uiTheme.trim()}`);
            }
        }

        if (typeof cmd.toggleGuides === 'boolean') {
            const mg = document.getElementById('margin-guides');
            if (mg) mg.style.display = cmd.toggleGuides ? 'block' : 'none';
            if (typeof global.syncMarginGuideOverlay === 'function') global.syncMarginGuideOverlay();
            stats.commands.push(`guides:${cmd.toggleGuides}`);
        }

        if (typeof cmd.toggleGrid === 'boolean' && paper) {
            paper.classList.toggle('theme-grid', cmd.toggleGrid);
            stats.commands.push(`grid:${cmd.toggleGrid}`);
        }

        if (typeof cmd.toggleBaselines === 'boolean' && paper) {
            paper.classList.toggle('theme-baselines', cmd.toggleBaselines);
            stats.commands.push(`baselines:${cmd.toggleBaselines}`);
        }

        if (typeof cmd.toggleBounds === 'boolean' && paper) {
            paper.classList.toggle('show-boundaries', cmd.toggleBounds);
            stats.commands.push(`bounds:${cmd.toggleBounds}`);
        }

        if (typeof cmd.toggleSpreads === 'boolean' && global.state &&
            !!cmd.toggleSpreads !== !!global.state.isSpreadMode &&
            typeof global.toggleSpreadMode === 'function') {
            global.toggleSpreadMode();
            stats.commands.push(`spreads:${cmd.toggleSpreads}`);
        }

        if (typeof cmd.colorProofing === 'string' && typeof global.setProofMode === 'function') {
            const p = cmd.colorProofing.trim().toLowerCase();
            const filterMap = {
                'none': 'none',
                'off': 'none',
                'normal': 'none',
                'protanopia': 'url(#protanopia)',
                'deuteranopia': 'url(#deuteranopia)',
                'tritanopia': 'url(#tritanopia)',
                'achromatopsia': 'url(#achromatopsia)'
            };
            const filterVal = filterMap[p] || (cmd.colorProofing.startsWith('url(') ? cmd.colorProofing : 'none');
            global.setProofMode(filterVal);
            stats.commands.push(`colorProofing:${p}`);
        }

        if (typeof cmd.recolorMode === 'string' && global.state?.selectedEl && typeof global.applyImgFilter === 'function') {
            const r = cmd.recolorMode.trim().toLowerCase();
            const map = {
                'none': 'none',
                'grayscale': 'grayscale(100%)',
                'sepia': 'sepia(100%)',
                'invert': 'invert(100%)',
                'warm': 'sepia(1) hue-rotate(-20deg) saturate(1.8)',
                'cool': 'sepia(1) hue-rotate(160deg) saturate(1.5)'
            };
            const selImg = global.state.selectedEl.querySelector('img') ||
                (global.state.selectedEl.getAttribute('data-type') === 'emoji' ? global.state.selectedEl.querySelector('svg') : null);
            if (selImg) {
                global.applyImgFilter(map[r] || cmd.recolorMode);
                stats.commands.push(`recolor:${r}`);
            }
        }

        if (cmd.activateDrawingTool) {
            const toolCfg = typeof cmd.activateDrawingTool === 'string'
                ? { tool: cmd.activateDrawingTool }
                : cmd.activateDrawingTool;
            if (toolCfg && toolCfg.tool && typeof global.startDrawing === 'function') {
                global.startDrawing(toolCfg.tool);
                if (toolCfg.color && typeof global.updateDrawingColor === 'function') {
                    global.updateDrawingColor(toolCfg.color);
                }
                if (toolCfg.size && typeof global.updateDrawingSize === 'function') {
                    global.updateDrawingSize(toolCfg.size);
                }
                stats.commands.push(`drawingTool:${toolCfg.tool}`);
            }
        }

        if (typeof cmd.openModalOrSuite === 'string' && cmd.openModalOrSuite.trim()) {
            const m = cmd.openModalOrSuite.trim().toLowerCase();
            if (m === 'accessibility' && global.AccessibilityScanner?.toggleSidebar) {
                global.AccessibilityScanner.toggleSidebar();
            } else if (m === 'design_checker' && typeof global.runDesignChecker === 'function') {
                global.runDesignChecker();
            } else if (m === 'compress_image' && typeof global.compressSelectedPicture === 'function') {
                if (global.state?.selectedEl?.getAttribute('data-type') === 'image') {
                    global.compressSelectedPicture();
                }
            } else if (m === 'document_inspector' && typeof global.showInfoModal === 'function') {
                global.showInfoModal();
            } else if (global.WritersSuite?.analyzeText) {
                const suiteMap = {
                    'analysis_suite': 'readability',
                    'writers_grade': 'readability',
                    'writers_tone': 'tone',
                    'writers_concise': 'concise',
                    'writers_passive': 'passive',
                    'writers_sentiment': 'sentiment',
                    'writers_stats': 'stats'
                };
                if (suiteMap[m]) global.WritersSuite.analyzeText(suiteMap[m]);
            }
            stats.commands.push(`suite:${m}`);
        }
    }

    async function loadTemplateByQuery(query) {
        if (!query || typeof global.loadTemplate !== 'function') return false;
        const getAssetUrl = typeof global.getTemplateAssetUrl === 'function'
            ? global.getTemplateAssetUrl
            : (p => p);

        if (!_templateIndexCache) {
            const res = await fetch(getAssetUrl('elements/templates/template-index.json'));
            if (!res.ok) return false;
            _templateIndexCache = await res.json();
        }
        const q = String(query).toLowerCase().trim();
        const flat = Array.isArray(_templateIndexCache)
            ? _templateIndexCache
            : Object.values(_templateIndexCache).flat();
        const match = flat.find(t =>
            t && (
                (t.id && String(t.id).toLowerCase() === q) ||
                (t.file && String(t.file).toLowerCase() === q) ||
                (t.name && String(t.name).toLowerCase().includes(q)) ||
                (t.category && String(t.category).toLowerCase().includes(q))
            )
        );
        if (!match || !match.file) return false;

        const tplRes = await fetch(getAssetUrl(`elements/templates/files/${match.file}`));
        if (!tplRes.ok) return false;
        const opubData = await tplRes.json();
        global.loadTemplate(opubData);
        return true;
    }

    async function executePageConfig(cfg, stats) {
        if (!cfg || typeof cfg !== 'object') return;
        const st = global.state || {};
        const paper = document.getElementById('paper');
        const dpi = st.dpi || 96;

        if (cfg.loadTemplateId) {
            const loaded = await loadTemplateByQuery(cfg.loadTemplateId);
            if (loaded) stats.pageChanges.push(`template:${cfg.loadTemplateId}`);
        }

        if (cfg.clearCurrentPage && paper) {
            if (typeof global.deselect === 'function') global.deselect();
            paper.querySelectorAll('.pub-element:not(.master-page-element)').forEach(el => el.remove());
            const bArt = document.getElementById('native-border-art-border');
            if (bArt) bArt.remove();
            if (typeof global.setPageBorder === 'function') global.setPageBorder('none', false);
            paper.style.background = '#ffffff';
            paper.style.backgroundImage = '';
            paper.removeAttribute('data-theme-saved');
            ['id', 'name', 'type', 'c1', 'c2', 'url', 'sat', 'bri', 'con', 'hue', 'tex', 'size'].forEach(a => {
                paper.removeAttribute(`data-theme-${a}`);
            });
            // Reset any previous watermark unless this plan explicitly supplies a new one
            if (!cfg.watermark) {
                if (global.WatermarkEngine && typeof global.WatermarkEngine.remove === 'function') global.WatermarkEngine.remove(true);
                if (global.state) delete global.state.watermark;
            }
            stats.pageChanges.push('cleared');
        }

        if (cfg.createMasterPage && !st.hasMasterPage && typeof global.addMasterPage === 'function') {
            global.addMasterPage();
            stats.pageChanges.push('masterPage');
        }

        if (cfg.format && typeof global.setPageSize === 'function') {
            const presets = getUnitService().PRESETS || {
                A4: 1, Letter: 1, A3: 1, A5: 1, Legal: 1, Tabloid: 1, BusinessCard: 1, Square: 1
            };
            const matchedFmt = matchCaseInsensitiveKey(presets, cfg.format);
            if (matchedFmt) {
                global.setPageSize(matchedFmt);
                stats.pageChanges.push(`format:${matchedFmt}`);
            }
        }

        if (paper && cfg.width_mm > 0 && cfg.height_mm > 0 && !cfg.format) {
            const wPx = mmToPx(cfg.width_mm, dpi) + 'px';
            const hPx = mmToPx(cfg.height_mm, dpi) + 'px';
            paper.style.width = wPx;
            paper.style.height = hPx;
            if (st.pages && st.pages[st.currentPageIndex]) {
                st.pages[st.currentPageIndex].width = wPx;
                st.pages[st.currentPageIndex].height = hPx;
                st.pages[st.currentPageIndex].orientation = parseFloat(wPx) >= parseFloat(hPx) ? 'landscape' : 'portrait';
            }
            const detected = getUnitService().detectFormat ? getUnitService().detectFormat(parseFloat(wPx), parseFloat(hPx), dpi) : 'Custom';
            st.format = detected;
            if (typeof global.setPageFormatIcon === 'function') global.setPageFormatIcon(detected);
            if (typeof global.syncRulers === 'function') global.syncRulers();
            stats.pageChanges.push(`size:${cfg.width_mm}x${cfg.height_mm}mm`);
        }

        if (paper && (cfg.orientation === 'portrait' || cfg.orientation === 'landscape') &&
            typeof global.toggleOrientation === 'function') {
            const curIsLand = parseFloat(paper.style.width || 794) >= parseFloat(paper.style.height || 1123);
            const wantLand = cfg.orientation === 'landscape';
            if (curIsLand !== wantLand) {
                global.toggleOrientation();
                stats.pageChanges.push(`orientation:${cfg.orientation}`);
            }
        }

        if (cfg.margins_mm && typeof cfg.margins_mm === 'object') {
            const mTop = cfg.margins_mm.top !== undefined ? mmToPx(cfg.margins_mm.top, dpi) : (st.margins?.top ?? 48);
            const mRight = cfg.margins_mm.right !== undefined ? mmToPx(cfg.margins_mm.right, dpi) : (st.margins?.right ?? 48);
            const mBottom = cfg.margins_mm.bottom !== undefined ? mmToPx(cfg.margins_mm.bottom, dpi) : (st.margins?.bottom ?? 48);
            const mLeft = cfg.margins_mm.left !== undefined ? mmToPx(cfg.margins_mm.left, dpi) : (st.margins?.left ?? 48);
            st.margins = { top: mTop, right: mRight, bottom: mBottom, left: mLeft };
            st.marginsDpi = dpi;
            if (paper) {
                const mg = paper.querySelector('.margin-guides');
                if (mg) {
                    mg.style.inset = 'auto';
                    mg.style.top = mTop + 'px';
                    mg.style.right = mRight + 'px';
                    mg.style.bottom = mBottom + 'px';
                    mg.style.left = mLeft + 'px';
                }
            }
            if (typeof global.syncMarginGuideOverlay === 'function') global.syncMarginGuideOverlay();
            stats.pageChanges.push('margins');
        }

        if (cfg.colorScheme && global.colorSchemes && typeof global.applyColorScheme === 'function') {
            const schemeKey = matchCaseInsensitiveKey(global.colorSchemes, cfg.colorScheme);
            if (schemeKey) {
                global.applyColorScheme(schemeKey);
                stats.pageChanges.push(`scheme:${schemeKey}`);
            }
        }

        if (cfg.pageTheme && paper) {
            if (typeof cfg.pageTheme === 'string') {
                const themeQuery = cfg.pageTheme.trim().toLowerCase();
                if (themeQuery === 'none' || themeQuery === 'clear') {
                    const ex = paper.querySelector('[data-is-theme="true"]');
                    if (ex) ex.remove();
                    paper.removeAttribute('data-theme-saved');
                } else {
                    const allSwatches = Array.from(document.querySelectorAll('#ts-gallery-popover .ts-swatch, #advanced-theme-studio .ts-swatch, .ts-swatch'));
                    const matchSwatch = allSwatches.find(s => (s.getAttribute('data-theme-id') || '').toLowerCase() === themeQuery) ||
                        allSwatches.find(s => (s.getAttribute('data-theme-name') || '').toLowerCase().includes(themeQuery));
                    if (matchSwatch) {
                        matchSwatch.click();
                        stats.pageChanges.push(`pageTheme:${matchSwatch.getAttribute('data-theme-id')}`);
                    }
                }
            } else if (typeof cfg.pageTheme === 'object' && typeof global.createWrapper === 'function') {
                const ex = paper.querySelector('[data-is-theme="true"]');
                if (ex) ex.remove();
                const type = cfg.pageTheme.type === 'gradient' ? 'gradient' : 'solid';
                const c1 = cfg.pageTheme.c1 || '#ffffff';
                const c2 = cfg.pageTheme.c2 || c1;
                paper.setAttribute('data-theme-saved', 'true');
                paper.setAttribute('data-theme-id', cfg.pageTheme.id || 'ai-custom-theme');
                paper.setAttribute('data-theme-name', cfg.pageTheme.name || 'AI Custom Theme');
                paper.setAttribute('data-theme-type', type);
                paper.setAttribute('data-theme-c1', c1);
                paper.setAttribute('data-theme-c2', c2);
                const wrapper = global.createWrapper('<div class="op-theme-container" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;"></div>');
                wrapper.setAttribute('data-is-theme', 'true');
                wrapper.setAttribute('data-type', 'box');
                wrapper.style.cssText += 'left:0px !important; top:0px !important; width:100% !important; height:100% !important; z-index:0 !important;';
                const bgDiv = document.createElement('div');
                bgDiv.className = 'op-theme-bg';
                bgDiv.style.cssText = 'position:absolute; inset:0; width:100%; height:100%;';
                bgDiv.style.background = type === 'gradient' ? `linear-gradient(135deg, ${c1}, ${c2})` : c1;
                wrapper.querySelector('.op-theme-container').appendChild(bgDiv);
                stats.pageChanges.push('pageTheme:custom');
            }
        }

        if (typeof cfg.backgroundColor === 'string' && cfg.backgroundColor.trim() && paper) {
            if (!cfg.pageTheme) {
                const ex = paper.querySelector('[data-is-theme="true"]');
                if (ex) ex.remove();
                paper.removeAttribute('data-theme-saved');
            }
            paper.style.background = cfg.backgroundColor.trim();
            if (st.pages && st.pages[st.currentPageIndex]) {
                st.pages[st.currentPageIndex].background = paper.style.background;
            }
            stats.pageChanges.push(`bg:${cfg.backgroundColor.trim()}`);
        }

        if (typeof cfg.backgroundImage === 'string' && cfg.backgroundImage.trim() && paper) {
            const safeUrl = cfg.backgroundImage.trim().replace(/"/g, '%22');
            paper.style.backgroundImage = `url("${safeUrl}")`;
            paper.style.backgroundSize = 'cover';
            paper.style.backgroundPosition = 'center';
            paper.style.backgroundRepeat = 'no-repeat';
            if (st.pages && st.pages[st.currentPageIndex]) {
                st.pages[st.currentPageIndex].background = paper.style.background;
            }
            stats.pageChanges.push('bgImage');
        }

        if (typeof cfg.border === 'string' && typeof global.setPageBorder === 'function') {
            global.setPageBorder(cfg.border, false);
            stats.pageChanges.push(`border:${cfg.border}`);
        }

        if (cfg.borderArt && global.BorderArtEngine && typeof global.BorderArtEngine.applyToPage === 'function') {
            const bCfg = typeof cfg.borderArt === 'string' ? { styleId: cfg.borderArt } : cfg.borderArt;
            if (bCfg.styleId) {
                global.BorderArtEngine.applyToPage(bCfg.styleId, bCfg.size || 32, bCfg.margin !== undefined ? bCfg.margin : 15);
                stats.pageChanges.push(`borderArt:${bCfg.styleId}`);
            }
        }

        if (cfg.watermark !== undefined && cfg.watermark !== null && global.WatermarkEngine) {
            if (cfg.watermark === 'none' || cfg.watermark === false || cfg.watermark?.presetId === 'none') {
                global.WatermarkEngine.remove();
                stats.pageChanges.push('watermark:removed');
            } else {
                const wmInput = typeof cfg.watermark === 'string' ? { presetId: cfg.watermark } : cfg.watermark;
                const presetBase = (global.WatermarkEngine.PRESETS && wmInput.presetId && global.WatermarkEngine.PRESETS[wmInput.presetId])
                    || (global.WatermarkEngine.PRESETS && global.WatermarkEngine.PRESETS.draft)
                    || { type: 'text', fontFamily: 'Segoe UI, sans-serif', fontWeight: '800', mode: 'diagonal', style: 'solid', color: '#64748b', opacity: 0.16, fontSize: 'auto', scale: 100, scope: 'all', layer: 'behind' };
                const merged = Object.assign({}, presetBase, wmInput);
                if (wmInput.text) merged.text = wmInput.text;
                global.WatermarkEngine.apply(merged);
                stats.pageChanges.push(`watermark:${merged.text || wmInput.presetId}`);
            }
        }

        if (cfg.headerFooter && typeof cfg.headerFooter === 'object') {
            const hf = cfg.headerFooter;
            const visible = hf.visible !== false;
            if (typeof global.toggleHeaderFooter === 'function') {
                global.toggleHeaderFooter(visible, true);
            }
            if (paper) {
                if (hf.headerHTML !== undefined) {
                    const hdr = paper.querySelector('.page-header');
                    if (hdr) hdr.innerHTML = sanitizeHtmlFragment(String(hf.headerHTML));
                }
                if (hf.footerHTML !== undefined) {
                    const ftr = paper.querySelector('.page-footer');
                    if (ftr) ftr.innerHTML = sanitizeHtmlFragment(String(hf.footerHTML));
                }
            }
            stats.pageChanges.push(`headerFooter:${visible}`);
        }
    }

    /* ------------------------------------------------------------------------
       5. NATIVE 21-TYPE ELEMENT BUILDERS
       ------------------------------------------------------------------------ */

    function createAIElement(item, dpi) {
        if (!item || !item.type || typeof global.createWrapper !== 'function') return null;
        const props = item.props || {};
        const type = String(item.type).toLowerCase().trim();
        let el = null;

        switch (type) {
            case 'text_box': {
                const textStr = props.text !== undefined ? String(props.text) : '';
                const rawHtml = props.html !== undefined ? sanitizeHtmlFragment(String(props.html)) : escapeHtml(textStr).replace(/\n/g, '<br>');
                const fs = props.fontSizePx || (parseInt(props.fontSize, 10) || 16);
                const ff = props.fontFamily || "'Segoe UI', sans-serif";
                const clr = props.color || '#111827';
                const align = props.align || props.textAlign || 'left';
                const bg = props.backgroundColor ? `background:${props.backgroundColor};` : '';
                const br = props.borderRadiusPx ? `border-radius:${props.borderRadiusPx}px;` : '';
                const bdr = props.border ? `border:${props.border};` : '';
                const pad = props.paddingPx !== undefined ? `${props.paddingPx}px` : '10px';
                const lh = props.lineHeight || '1.4';
                const fw = props.bold ? 'font-weight:700;' : '';
                const fst = props.italic ? 'font-style:italic;' : '';
                const dec = props.underline ? 'text-decoration:underline;' : '';
                const styleAttr = `padding:${pad}; height:100%; box-sizing:border-box; word-wrap:break-word; outline:none; font-family:${ff}; font-size:${fs}px; color:${clr}; text-align:${align}; line-height:${lh}; ${fw}${fst}${dec}${bg}${bdr}${br}`;
                el = global.createWrapper(`<div style="${styleAttr}" contenteditable="true" spellcheck="false">${rawHtml || 'Click to edit text'}</div>`);
                el.setAttribute('data-type', 'text');
                return applyPlacement(el, item, dpi, 240, 80);
            }

            case 'styled_text_box': {
                const sys = global.TextBoxStylesSystem;
                const preset = (sys && typeof sys.getPreset === 'function' ? sys.getPreset(props.styleId || 'quote-teal') : null)
                    || (sys && Array.isArray(sys.presets) ? sys.presets[0] : null);
                const pad = (preset?.containerStyle?.padding) || '14px 18px';
                const ts = preset?.textStyle || {};
                const rawHtml = props.html !== undefined
                    ? sanitizeHtmlFragment(String(props.html))
                    : escapeHtml(props.text !== undefined ? String(props.text) : (preset?.starterHTML || 'Styled Text')).replace(/\n/g, '<br>');
                const fs = props.fontSizePx ? `${props.fontSizePx}px` : (ts.fontSize || '15px');
                const clr = props.color || ts.color || '#1e293b';
                const ff = props.fontFamily || ts.fontFamily || "'Segoe UI', sans-serif";
                const align = props.align || ts.textAlign || 'left';
                const textStyle = `padding:${pad}; height:100%; box-sizing:border-box; word-wrap:break-word; outline:none; color:${clr}; font-family:${ff}; font-size:${fs}; text-align:${align}; line-height:${ts.lineHeight || '1.4'}; ${ts.fontStyle ? `font-style:${ts.fontStyle};` : ''} ${ts.fontWeight ? `font-weight:${ts.fontWeight};` : ''}`;
                el = global.createWrapper(`<div style="${textStyle}" contenteditable="true" spellcheck="false">${rawHtml}</div>`);
                const content = el.querySelector('.element-content');
                if (content && preset?.containerStyle) {
                    const s = preset.containerStyle;
                    ['background', 'border', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom',
                     'borderRadius', 'boxShadow', 'outline', 'outlineOffset'].forEach(k => {
                        if (s[k]) content.style[k] = s[k];
                    });
                    if (s.backdropFilter) {
                        content.style.backdropFilter = s.backdropFilter;
                        content.style.webkitBackdropFilter = s.backdropFilter;
                    }
                    content.style.boxSizing = 'border-box';
                }
                if (preset) el.setAttribute('data-textbox-style', preset.id);
                return applyPlacement(el, item, dpi, preset?.defaultWidth || 280, preset?.defaultHeight || 100);
            }

            case 'wordart_beta': {
                const textStr = (props.text !== undefined ? String(props.text) : 'WordArt').trim() || 'WordArt';
                const styleId = Math.max(1, parseInt(props.styleId, 10) || 1);
                if (typeof global.renderWordArtCanvasSync !== 'function') {
                    // Graceful fallback to legacy WordArt if Beta engine absent
                    return createAIElement(Object.assign({}, item, { type: 'wordart_legacy' }), dpi);
                }
                const baseDataUrl = global.renderWordArtCanvasSync(textStr, styleId, false, 1.0, 1.0);
                const dims = parsePngDimensionsFromDataUrl(baseDataUrl) || { width: 400, height: 120 };
                const editorScale = Math.max(1.0, Math.min(2.5, Math.round(((global.state?.zoom) || 0.8) * 20) / 10));
                const hiResUrl = global.renderWordArtCanvasSync(textStr, styleId, false, editorScale, editorScale);
                const safeAttr = escapeHtml(textStr);
                const paper = document.getElementById('paper');
                el = document.createElement('div');
                el.className = 'pub-element';
                el.setAttribute('data-type', 'beta-wordart');
                el.setAttribute('data-scaleX', '1');
                el.setAttribute('data-scaleY', '1');
                el.setAttribute('data-beta-wa-basew', String(dims.width));
                el.setAttribute('data-beta-wa-baseh', String(dims.height));
                el.style.zIndex = '10';
                el.innerHTML = `
                    <div class="element-content">
                        <img class="beta-wa-img" data-beta-wa-text="${safeAttr}" data-beta-wa-style="${styleId}" src="${hiResUrl}" draggable="false" style="width:100%; height:100%; object-fit:fill; position:absolute; top:0; left:0; image-rendering:auto; image-rendering:smooth;">
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
                if (paper) paper.appendChild(el);
                applyPlacement(el, item, dpi, dims.width, dims.height);
                if (typeof global.refreshBetaWordArt === 'function') global.refreshBetaWordArt(el);
                return el;
            }

            case 'wordart_legacy': {
                const textStr = (props.text !== undefined ? String(props.text) : 'Word Art').trim() || 'Word Art';
                const styleNum = Math.max(1, parseInt(props.styleId, 10) || 1);
                const extraStyle = [
                    props.fontFamily ? `font-family:${props.fontFamily};` : '',
                    props.color ? `color:${props.color};` : ''
                ].join('');
                el = global.createWrapper(
                    `<div class="wa-wrapper"><div class="wa-text wa-style-${styleNum}" data-wa-style="${styleNum}" spellcheck="false" style="${extraStyle}">${escapeHtml(textStr).replace(/\n/g, '<br>')}</div></div>`
                );
                applyPlacement(el, item, dpi, 280, 90);
                if (typeof global.syncWordArt === 'function') global.syncWordArt(el);
                return el;
            }

            case 'clipart': {
                const res = item._resolvedClipart || { src: svgToDataUri(GENERIC_CLIPART_SVG), kind: 'generic' };
                const genericUri = svgToDataUri(GENERIC_CLIPART_SVG);
                const altText = escapeHtml(props.query || 'Clipart');
                const corsAttr = res.kind === 'library' ? ' crossorigin="anonymous"' : '';
                el = global.createWrapper(
                    `<div style="width:100%; height:100%; position:relative;"><img src="${res.src}" alt="${altText}" data-clipart-kind="${res.kind}" data-clipart-file="${escapeHtml(res.file || '')}"${corsAttr} draggable="false" onerror="this.onerror=null;this.src='${genericUri}';" style="width:100%; height:100%; object-fit:contain; display:block; ${props.opacity !== undefined ? `opacity:${props.opacity};` : ''}"></div>`
                );
                el.setAttribute('data-type', 'image');
                return applyPlacement(el, item, dpi, 160, 160);
            }

            case 'table': {
                const rows = Math.max(1, Math.min(30, parseInt(props.rows, 10) || (Array.isArray(props.data) ? props.data.length + (props.headers ? 1 : 0) : 3)));
                const cols = Math.max(1, Math.min(16, parseInt(props.cols, 10) || (Array.isArray(props.headers) ? props.headers.length : (Array.isArray(props.data?.[0]) ? props.data[0].length : 3))));
                const headerBg = props.headerBg || '#0f766e';
                const headerClr = props.headerColor || '#ffffff';
                const cellBg = props.cellBg || '#ffffff';
                const textClr = props.textColor || '#1e293b';
                const borderClr = props.borderColor || '#cbd5e1';
                const headers = Array.isArray(props.headers) ? props.headers : null;
                const dataRows = Array.isArray(props.data) ? props.data : [];

                let html = `<table style="width:100%; height:100%; border-spacing:0; table-layout:fixed; border-collapse:separate; border-top:1px solid ${borderClr}; border-left:1px solid ${borderClr};">`;
                for (let r = 0; r < rows; r++) {
                    html += '<tr>';
                    const isHead = r === 0 && headers;
                    const tag = isHead ? 'th' : 'td';
                    const dataIdx = headers ? r - 1 : r;
                    for (let c = 0; c < cols; c++) {
                        let val = '';
                        if (isHead) val = headers[c] !== undefined ? String(headers[c]) : `Header ${c + 1}`;
                        else if (dataRows[dataIdx] && dataRows[dataIdx][c] !== undefined) val = String(dataRows[dataIdx][c]);
                        const bg = isHead ? headerBg : cellBg;
                        const clr = isHead ? headerClr : textClr;
                        html += `<${tag} style="border-right:1px solid ${borderClr}; border-bottom:1px solid ${borderClr}; border-top:none; border-left:none; min-width:20px; padding:6px 8px; background:${bg}; color:${clr}; outline:none; font-size:13px;" contenteditable="true">${val === '' ? '&nbsp;' : escapeHtml(val)}</${tag}>`;
                    }
                    html += '</tr>';
                }
                html += '</table>';
                el = global.createWrapper(html);
                el.setAttribute('data-type', 'table');
                return applyPlacement(el, item, dpi, Math.max(240, cols * 100), Math.max(100, rows * 36));
            }

            case 'styled_table': {
                const sys = global.OpTableStyles;
                const headers = Array.isArray(props.headers) ? props.headers : null;
                const dataRows = Array.isArray(props.data) ? props.data : [];
                const headerOn = props.header !== false;
                const rows = Math.max(1, Math.min(40, parseInt(props.rows, 10) || ((headers ? 1 : 0) + (dataRows.length || 4))));
                const cols = Math.max(1, Math.min(16, parseInt(props.cols, 10) || (headers?.length || dataRows[0]?.length || 3)));
                if (!sys || typeof sys.build !== 'function') {
                    return createAIElement(Object.assign({}, item, { type: 'table' }), dpi);
                }
                const tableHtml = sys.build({
                    cols,
                    rows,
                    design: props.design || 'round',
                    palette: props.palette || 'teal',
                    banded: props.banded !== false,
                    header: headerOn,
                    content: props.content || 'blank'
                });
                el = global.createWrapper(tableHtml);
                el.setAttribute('data-type', 'table');
                const tbl = el.querySelector('table');
                if (tbl && (headers || dataRows.length > 0)) {
                    const trList = Array.from(tbl.rows);
                    if (headerOn && headers && trList[0]) {
                        Array.from(trList[0].cells).forEach((cell, c) => {
                            if (headers[c] !== undefined) cell.textContent = String(headers[c]);
                        });
                    }
                    const startRow = headerOn ? 1 : 0;
                    for (let r = 0; r < dataRows.length && (startRow + r) < trList.length; r++) {
                        const rowData = Array.isArray(dataRows[r]) ? dataRows[r] : [];
                        Array.from(trList[startRow + r].cells).forEach((cell, c) => {
                            if (rowData[c] !== undefined) cell.textContent = String(rowData[c]);
                        });
                    }
                }
                return applyPlacement(el, item, dpi, Math.max(300, cols * 110), Math.max(110, rows * 38));
            }

            case 'chart': {
                const wPx = item.width_mm ? mmToPx(item.width_mm, dpi) : 380;
                const hPx = item.height_mm ? mmToPx(item.height_mm, dpi) : 280;
                const chartCfg = {
                    type: props.type || 'column',
                    title: props.title !== undefined ? String(props.title) : 'Chart',
                    showLegend: props.showLegend !== false,
                    showValues: props.showValues !== false,
                    data: Array.isArray(props.data) && props.data.length > 0 ? props.data : [
                        { label: 'Series A', value: 42, color: '#0d9488' },
                        { label: 'Series B', value: 28, color: '#3b82f6' },
                        { label: 'Series C', value: 30, color: '#f59e0b' }
                    ]
                };
                if (typeof global.applyChartToCanvas === 'function') {
                    el = global.applyChartToCanvas(chartCfg);
                    if (el) {
                        applyPlacement(el, item, dpi, wPx, hPx);
                        global.applyChartToCanvas(chartCfg, el);
                    }
                    return el;
                }
                el = global.createWrapper(`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;border:1px solid #cbd5e1;">${escapeHtml(chartCfg.title)}</div>`);
                el.setAttribute('data-type', 'chart');
                return applyPlacement(el, item, dpi, wPx, hPx);
            }

            case 'ad_badge': {
                if (global.AdvertisementEngine && typeof global.AdvertisementEngine.insertAdvertisement === 'function') {
                    el = global.AdvertisementEngine.insertAdvertisement(
                        props.presetId || 'burst_classic_ruby',
                        props.primaryText || 'SALE',
                        props.subtext !== undefined ? props.subtext : 'LIMITED OFFER',
                        props.paletteId || 'publisher-teal',
                        props.font || 'Montserrat',
                        null
                    );
                    return applyPlacement(el, item, dpi, 180, 180);
                }
                return createAIElement(Object.assign({}, item, { type: 'shape', props: { shapeName: '16-Point Burst', text: props.primaryText || 'SALE' } }), dpi);
            }

            case 'page_part': {
                if (typeof global.insertPagePart === 'function') {
                    global.insertPagePart(props.partId || 'callout');
                    el = global.state?.selectedEl || null;
                    if (el) {
                        if (props.title !== undefined) {
                            const hNode = el.querySelector('h1, h2, h3, strong');
                            if (hNode) hNode.textContent = String(props.title);
                        }
                        if (props.subtitle !== undefined) {
                            const pNode = el.querySelector('p');
                            if (pNode) pNode.textContent = String(props.subtitle);
                        }
                        if (props.body !== undefined) {
                            const pNodes = el.querySelectorAll('p');
                            const targetP = props.subtitle !== undefined && pNodes.length > 1 ? pNodes[1] : pNodes[0];
                            if (targetP) targetP.textContent = String(props.body);
                        }
                        applyPlacement(el, item, dpi);
                    }
                    return el;
                }
                return null;
            }

            case 'emoji': {
                const ch = props.char ? String(props.char) : '⭐';
                const dataUri = typeof global.createEmojiSvgFromChar === 'function'
                    ? global.createEmojiSvgFromChar(ch)
                    : `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50%" y="54%" font-size="75" text-anchor="middle" dominant-baseline="central">${ch}</text></svg>`)}`;
                el = global.createWrapper(`<img src="${dataUri}" data-emoji-char="${escapeHtml(ch)}" draggable="false" style="width:100%;height:100%;object-fit:fill;position:absolute;top:0;left:0;display:block;">`);
                el.setAttribute('data-type', 'emoji');
                return applyPlacement(el, item, dpi, 90, 90);
            }

            case 'symbol': {
                const ch = props.char ? String(props.char) : '★';
                const clr = props.color || '#1e293b';
                const fs = props.fontSizePx || 48;
                el = global.createWrapper(
                    `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:${fs}px; color:${clr}; font-family:'Segoe UI Symbol','Segoe UI',sans-serif; outline:none;" contenteditable="true">${escapeHtml(ch)}</div>`
                );
                el.setAttribute('data-type', 'text');
                return applyPlacement(el, item, dpi, 70, 70);
            }

            case 'shape': {
                const schemeArr = (global.colorSchemes && global.state && global.colorSchemes[global.state.currentScheme]) || null;
                const fill = props.fillColor || (schemeArr ? schemeArr[3] : 'var(--ui-theme-color, #007670)');
                const stroke = props.strokeColor || (schemeArr ? schemeArr[0] : 'var(--ui-theme-dark, #005a55)');
                const sw = props.strokeWidth !== undefined ? props.strokeWidth : 2;
                const opacity = props.opacity !== undefined ? `opacity:${props.opacity};` : '';
                const innerMarkup = resolveShapeInnerMarkup(props.shapeName || 'Rectangle');
                const svgHtml = `<svg preserveAspectRatio="none" viewBox="0 0 100 100" style="width:100%; height:100%; overflow:visible; position:absolute; top:0; left:0; ${opacity}"><g class="shape-path" vector-effect="non-scaling-stroke" fill="${fill}" stroke="${stroke}" stroke-width="${sw}">${innerMarkup}</g></svg>`;
                const labelOverlay = props.text
                    ? `<div style="position:relative; z-index:2; width:100%; height:100%; display:flex; align-items:center; justify-content:center; text-align:center; padding:8px; box-sizing:border-box; color:${ensureReadableContrast(props.textColor || '#ffffff', fill)}; font-weight:600; font-size:${props.fontSizePx || 16}px; outline:none;" contenteditable="true">${escapeHtml(props.text).replace(/\n/g, '<br>')}</div>`
                    : '';
                el = global.createWrapper(`${svgHtml}${labelOverlay}`);
                el.setAttribute('data-type', 'shape');
                if (!props.fillColor) el.setAttribute('data-scheme-fill', '3');
                if (!props.strokeColor) el.setAttribute('data-scheme-stroke', '0');
                return applyPlacement(el, item, dpi, 140, 140);
            }

            case 'smart_arrow': {
                if (typeof global.insertSmartArrow === 'function') {
                    el = global.insertSmartArrow(props.styleId || 'block-right');
                    if (el) {
                        applyPlacement(el, item, dpi);
                        const g = el.querySelector('svg .shape-path') || el.querySelector('svg g');
                        const pathEl = el.querySelector('svg path');
                        if (props.fillColor) {
                            if (g) g.setAttribute('fill', props.fillColor);
                            if (pathEl && pathEl.getAttribute('fill') !== 'none') pathEl.setAttribute('fill', props.fillColor);
                        }
                        if (props.strokeColor) {
                            if (g) g.setAttribute('stroke', props.strokeColor);
                            if (pathEl) pathEl.setAttribute('stroke', props.strokeColor);
                        }
                        if (props.strokeWidth !== undefined) {
                            el.setAttribute('data-arrow-stroke-width', String(props.strokeWidth));
                        }
                        if (typeof global.refreshSmartArrow === 'function') {
                            global.refreshSmartArrow(el);
                        }
                    }
                    return el;
                }
                return null;
            }

            case 'border': {
                const bStyle = props.borderStyle || 'solid';
                const bColor = props.borderColor || '#0f766e';
                const bWidth = props.borderWidthPx || 3;
                const bRadius = props.borderRadiusPx || 0;
                const bg = props.backgroundColor || 'transparent';
                el = global.createWrapper(
                    `<div style="width:100%; height:100%; box-sizing:border-box; border:${bWidth}px ${bStyle} ${bColor}; border-radius:${bRadius}px; background:${bg}; pointer-events:none;"></div>`
                );
                el.setAttribute('data-type', 'box');
                applyPlacement(el, item, dpi, 300, 200);
                if (props.borderArtId && global.BorderArtEngine && typeof global.BorderArtEngine.renderElementBorder === 'function') {
                    global.BorderArtEngine.renderElementBorder(
                        el,
                        props.borderArtId,
                        props.borderArtSize || 24,
                        props.borderArtInset !== undefined ? props.borderArtInset : 8
                    );
                }
                return el;
            }

            case 'progress_bar': {
                if (global.ProgressBarEngine && typeof global.ProgressBarEngine.insertProgressBar === 'function') {
                    const opts = {
                        percentage: props.percentage !== undefined ? Number(props.percentage) : 75,
                        fillColor: props.fillColor,
                        trackColor: props.trackColor,
                        radius: props.radius,
                        height: props.height,
                        showLabel: props.showLabel,
                        labelColor: props.labelColor
                    };
                    if (item.width_mm) opts.width = mmToPx(item.width_mm, dpi);
                    el = global.ProgressBarEngine.insertProgressBar(props.styleId || 'capsule-green', opts);
                    if (el) {
                        applyPlacement(el, item, dpi);
                        if (typeof global.ProgressBarEngine.refreshElement === 'function') {
                            global.ProgressBarEngine.refreshElement(el);
                        }
                    }
                    return el;
                }
                return null;
            }

            case 'coupon': {
                if (typeof global.insertCoupon === 'function' && !props.headline && !props.code && !props.subtext) {
                    global.insertCoupon(props.type || 'standard');
                    el = global.state?.selectedEl || null;
                    return applyPlacement(el, item, dpi);
                }
                const cType = props.type || 'standard';
                const headline = escapeHtml(props.headline || (cType === 'vip' ? 'VIP PASS' : (cType === 'bogo' ? 'BUY 1 GET 1' : '50% OFF')));
                const subtext = escapeHtml(props.subtext || 'Special Discount Offer');
                const code = escapeHtml(props.code || 'SAVE20');
                const footer = escapeHtml(props.footer || 'Valid for limited time. Terms apply.');
                const accent = props.accentColor || '#0f766e';
                const bg = cType === 'vip' ? '#111827' : '#ffffff';
                const fg = cType === 'vip' ? '#f8fafc' : '#0f172a';
                const couponHtml = `
                    <div style="width:100%; height:100%; box-sizing:border-box; border:3px dashed ${accent}; border-radius:10px; padding:14px; background:${bg}; color:${fg}; display:flex; flex-direction:column; justify-content:space-between; align-items:center; text-align:center; font-family:'Segoe UI',sans-serif; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;" contenteditable="true">
                        <div style="font-size:24px; font-weight:800; color:${accent}; line-height:1.1;">${headline}</div>
                        <div style="font-size:13px; font-weight:600;">${subtext}</div>
                        <div style="padding:4px 14px; border:1px dashed ${accent}; border-radius:4px; font-family:monospace; font-weight:700; font-size:14px; letter-spacing:1.5px;">${code}</div>
                        <div style="font-size:10px; opacity:0.75;">${footer}</div>
                    </div>`;
                el = global.createWrapper(couponHtml);
                return applyPlacement(el, item, dpi, 300, 160);
            }

            case 'qr_code': {
                const qrData = String(props.data || 'https://openpublisher.app');
                const qrClr = String(props.color || '#000000').replace('#', '');
                const qrBg = String(props.bgcolor || '#ffffff').replace('#', '');
                const qrStyle = props.style || 'square';
                const margin = qrStyle === 'circle' ? 20 : (qrStyle === 'rounded' ? 10 : 0);
                const radiusStyle = qrStyle === 'circle' ? 'border-radius:50%;' : (qrStyle === 'rounded' ? 'border-radius:12px;' : '');
                const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}&color=${qrClr}&bgcolor=${qrBg}&margin=${margin}`;
                const fallbackSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#${qrBg}"/><rect x="10" y="10" width="26" height="26" fill="none" stroke="#${qrClr}" stroke-width="6"/><rect x="19" y="19" width="8" height="8" fill="#${qrClr}"/><rect x="64" y="10" width="26" height="26" fill="none" stroke="#${qrClr}" stroke-width="6"/><rect x="73" y="19" width="8" height="8" fill="#${qrClr}"/><rect x="10" y="64" width="26" height="26" fill="none" stroke="#${qrClr}" stroke-width="6"/><rect x="19" y="73" width="8" height="8" fill="#${qrClr}"/><rect x="46" y="18" width="8" height="8" fill="#${qrClr}"/><rect x="46" y="46" width="10" height="10" fill="#${qrClr}"/><rect x="64" y="50" width="12" height="12" fill="#${qrClr}"/><rect x="48" y="72" width="16" height="8" fill="#${qrClr}"/><rect x="74" y="74" width="16" height="16" fill="#${qrClr}"/></svg>`)}`;
                el = global.createWrapper(
                    `<div style="width:100%; height:100%; overflow:hidden; ${radiusStyle}"><img src="${apiUrl}" data-qr-data="${escapeHtml(qrData)}" crossorigin="anonymous" draggable="false" onerror="this.onerror=null;this.src='${fallbackSvg}';" style="width:100%; height:100%; object-fit:contain; display:block;"></div>`
                );
                el.setAttribute('data-type', 'image');
                return applyPlacement(el, item, dpi, 140, 140);
            }

            case 'business_info': {
                let saved = {};
                if (typeof global.getBusinessInfo === 'function') {
                    try { saved = global.getBusinessInfo() || {}; } catch (_) {}
                }
                const org = escapeHtml(props.organization || saved.organization || 'OpenPublisher Studio');
                const name = escapeHtml(props.name || saved.name || 'AlexMorgan');
                const title = escapeHtml(props.title || saved.title || 'Creative Director');
                const addr = escapeHtml(props.address || saved.address || '123 Design Avenue, Suite 400').replace(/\n/g, '<br>');
                const contact = escapeHtml(props.contact || saved.contact || 'hello@openpublisher.app | (555) 014-8920').replace(/\n/g, ' | ');
                const tagline = escapeHtml(props.tagline || saved.tagline || 'Crafting Clear Visual Communication');
                const accent = props.color || 'var(--ui-theme-color, #007670)';

                if (props.field && !props.bulk) {
                    const fieldMap = { org, organization: org, name, title, address: addr, contact, tagline };
                    const val = props.value || fieldMap[props.field] || org;
                    el = global.createWrapper(`<div style="padding:8px; height:100%; box-sizing:border-box; font-family:'Segoe UI',sans-serif; font-size:14px; color:#1e293b;" contenteditable="true">${val}</div>`);
                    return applyPlacement(el, item, dpi, 240, 60);
                }

                const html = props.bulk === 'signature'
                    ? `<div style="padding:12px; height:100%; box-sizing:border-box; border-left:4px solid ${accent}; font-family:'Segoe UI',sans-serif;" contenteditable="true"><div style="font-size:15px; font-weight:700; color:#0f172a;">${name}</div><div style="font-size:12px; color:${accent}; margin-bottom:6px;">${title} | ${org}</div><div style="font-size:11px; color:#475569;">${contact}</div></div>`
                    : `<div style="width:100%; height:100%; padding:14px; box-sizing:border-box; border-bottom:2px solid ${accent}; font-family:'Segoe UI',sans-serif; display:flex; justify-content:space-between; align-items:center;" contenteditable="true"><div><div style="font-size:20px; font-weight:800; color:${accent};">${org}</div><div style="font-size:12px; color:#475569;">${tagline}</div></div><div style="text-align:right; font-size:11px; color:#334155; line-height:1.4;"><strong>${name}</strong> (${title})<br>${addr}<br>${contact}</div></div>`;
                el = global.createWrapper(html);
                return applyPlacement(el, item, dpi, 520, 95);
            }

            case 'drawing_path': {
                const strokes = Array.isArray(props.strokes) && props.strokes.length > 0
                    ? props.strokes
                    : [{
                        d: props.d || 'M 10,50 Q 50,10 90,50',
                        stroke: props.color || props.stroke || '#0f766e',
                        strokeWidth: props.strokeWidth || (props.tool === 'brush' ? 6 : 3),
                        fill: props.fill || 'none',
                        opacity: props.opacity !== undefined ? props.opacity : 1
                    }];
                const vbW = props.viewBoxWidth || 100;
                const vbH = props.viewBoxHeight || 100;
                const isSpray = props.tool === 'spray';
                const pathsMarkup = strokes.map(s => {
                    const sw = s.strokeWidth || 3;
                    const dash = isSpray ? ` stroke-dasharray="1 ${Math.max(2, sw)}"` : '';
                    return `<path d="${escapeHtml(s.d || '')}" stroke="${escapeHtml(s.stroke || '#0f766e')}" stroke-width="${sw}" fill="${escapeHtml(s.fill || 'none')}" stroke-linecap="round" stroke-linejoin="round" opacity="${s.opacity !== undefined ? s.opacity : 1}"${dash} vector-effect="non-scaling-stroke" />`;
                }).join('');
                el = global.createWrapper(
                    `<svg viewBox="0 0 ${vbW} ${vbH}" preserveAspectRatio="none" style="width:100%; height:100%; display:block; overflow:visible;">${pathsMarkup}</svg>`
                );
                el.setAttribute('data-type', 'drawing');
                return applyPlacement(el, item, dpi, 180, 120);
            }

            case 'custom_html': {
                const scopeClass = 'op-ai-scope-' + Math.random().toString(36).slice(2, 9);
                const safeHtml = sanitizeHtmlFragment(String(props.html || '<div>Custom Block</div>'));
                const scopedCss = props.css ? scopeCssRules(String(props.css), scopeClass) : '';
                const styleTag = scopedCss ? `<style>${scopedCss}</style>` : '';
                const editableAttr = props.editable !== false ? 'contenteditable="true" spellcheck="false"' : '';
                const wrapped = `${styleTag}<div class="${scopeClass}" style="width:100%; height:100%; box-sizing:border-box; overflow:hidden; position:relative; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;" ${editableAttr}>${safeHtml}</div>`;
                el = global.createWrapper(wrapped);
                el.setAttribute('data-type', 'box');
                el.setAttribute('data-ai-custom-html', 'true');
                return applyPlacement(el, item, dpi, 300, 160);
            }

            case 'ai_image': {
                const dataUrl = item._resolvedDataUrl || props.dataUrl || props.src;
                if (dataUrl) {
                    const br = props.borderRadiusPx ? `border-radius:${props.borderRadiusPx}px;` : '';
                    const op = props.opacity !== undefined ? `opacity:${props.opacity};` : '';
                    el = global.createWrapper(`<img src="${dataUrl}" alt="AI Generated Image" style="width:100%; height:100%; object-fit:cover; display:block; ${br}${op}">`);
                    el.setAttribute('data-type', 'image');
                    return applyPlacement(el, item, dpi, 240, 180);
                }
                if (item._resolvedSvg) {
                    return createAIElement(Object.assign({}, item, {
                        type: 'ai_vector',
                        props: { svg: item._resolvedSvg }
                    }), dpi);
                }
                return null;
            }

            case 'ai_vector': {
                const svgCode = item._resolvedSvg || props.svg;
                if (svgCode) {
                    const cleanSvg = sanitizeSvgMarkup(svgCode);
                    el = global.createWrapper(`<div class="ai-vector-container" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; overflow:hidden;">${cleanSvg}</div>`);
                    el.setAttribute('data-type', 'shape');
                    const svgInside = el.querySelector('svg');
                    if (svgInside) {
                        svgInside.style.width = '100%';
                        svgInside.style.height = '100%';
                        svgInside.style.display = 'block';
                    }
                    return applyPlacement(el, item, dpi, 200, 200);
                }
                return null;
            }

            default:
                return null;
        }
    }

    async function applyAILayoutResponse(plan, userPrompt, options) {
        if (userPrompt && typeof userPrompt === 'object') {
            options = userPrompt;
            userPrompt = '';
        }
        options = options || {};
        if (!plan || typeof plan !== 'object') {
            throw new Error('Invalid AI layout payload.');
        }

        // 1. Guarantee a single exact baseline snapshot BEFORE AI mutates anything
        if (typeof global.deselect === 'function') global.deselect();
        if (global.state) {
            const hasSnap = Array.isArray(global.state.history) && global.state.history.length > 0 && global.state.historyIndex >= 0;
            if (!hasSnap) {
                if (typeof global.originalPushHistory === 'function') global.originalPushHistory();
                else if (typeof global.pushHistory === 'function') global.pushHistory(true);
            } else {
                const activeSnap = global.state.history[global.state.historyIndex];
                const curPage = typeof global.serializeCurrentPage === 'function' ? JSON.stringify(global.serializeCurrentPage()) : null;
                const snapPage = activeSnap?.pages?.[activeSnap.idx] ? JSON.stringify(activeSnap.pages[activeSnap.idx]) : null;
                if (curPage && curPage !== snapPage && typeof global.originalPushHistory === 'function') {
                    global.originalPushHistory();
                }
            }
            if (typeof global.syncLastSavedHistory === 'function') global.syncLastSavedHistory();
        }

        // 2. Temporarily suppress incremental history calls inside legacy creators
        const prevGlobalPush = global.pushHistory;
        const noopHistory = function () {};
        global.pushHistory = noopHistory;
        try { global.eval && void 0; } catch (_) {}

        const stats = { commands: [], pageChanges: [], elementsCreated: 0, skippedElements: 0 };
        const dpi = (global.state && global.state.dpi) || 96;

        try {
            const gatedCommands = gateAppCommands(plan.appCommands, userPrompt);
            if (gatedCommands) {
                executeAppCommands(gatedCommands, stats);
            }

            const pageCfg = Object.assign({}, plan.pageConfig || {});
            if (options.forceClear && pageCfg.clearCurrentPage === undefined) {
                pageCfg.clearCurrentPage = true;
            }
            if (Object.keys(pageCfg).length > 0 || options.forceClear) {
                await executePageConfig(pageCfg, stats);
            }

            if (Array.isArray(plan.elements)) {
                await resolveClipartSources(plan.elements);

                // Pre-resolve any ai_image elements before synchronous DOM placement so Ctrl+Z remains atomic
                for (let i = 0; i < plan.elements.length; i++) {
                    const item = plan.elements[i];
                    if (item && item.type === 'ai_image' && item.props && item.props.prompt) {
                        try {
                            const imgRes = await generateAIImage(item.props.prompt, item.props.stylePreset || '');
                            if (imgRes && imgRes.dataUrl) {
                                item._resolvedDataUrl = imgRes.dataUrl;
                            } else if (imgRes && imgRes.fallbackToSvg && imgRes.svg) {
                                item._resolvedSvg = imgRes.svg;
                            }
                        } catch (imgErr) {
                            console.warn('[AI Assistant] Pre-resolving ai_image failed:', imgErr);
                        }
                    }
                }

                let lastCreatedEl = null;
                for (let i = 0; i < plan.elements.length; i++) {
                    try {
                        const created = createAIElement(plan.elements[i], dpi);
                        if (created) {
                            if (CONTRAST_CHECKED_TYPES.has(String(plan.elements[i].type).toLowerCase().trim())) {
                                fixElementContrast(created);
                            }
                            lastCreatedEl = created;
                            stats.elementsCreated++;
                        } else {
                            stats.skippedElements++;
                        }
                    } catch (elErr) {
                        console.warn('[AI Assistant] Failed creating element #' + i, elErr);
                        stats.skippedElements++;
                    }
                }
                if (lastCreatedEl && typeof global.selectElement === 'function') {
                    global.selectElement(lastCreatedEl);
                } else if (typeof global.deselect === 'function') {
                    global.deselect();
                }
            }
        } finally {
            // 3. Restore pushHistory & commit ONCE synchronously so Ctrl+Z undoes the whole generation in 1 step
            global.pushHistory = prevGlobalPush;

            if (typeof global.syncRulers === 'function') global.syncRulers();
            if (typeof global.syncMarginGuideOverlay === 'function') global.syncMarginGuideOverlay();
            if (typeof global.renderSelectionOverlays === 'function') global.renderSelectionOverlays();
            if (typeof global.updateSidebar === 'function') global.updateSidebar();
            if (typeof global.updateThumbnails === 'function') global.updateThumbnails();

            if (typeof global.originalPushHistory === 'function') {
                global.originalPushHistory();
                if (typeof global.syncLastSavedHistory === 'function') global.syncLastSavedHistory();
            } else if (typeof prevGlobalPush === 'function') {
                prevGlobalPush(true);
            }
        }

        return stats;
    }

    /* ------------------------------------------------------------------------
       6. OPENPUBLISHER-STYLED DRAGGABLE 3-TAB MODAL UI
       ------------------------------------------------------------------------ */

    const SAMPLE_PROMPTS = [
        { label: 'Event Flyer', text: 'Create a colorful summer music festival flyer on A4 with Headline WordArt, event details box, ad badge, and QR code' },
        { label: 'Business Card', text: 'Design a sleek minimalist Business Card with dark navy theme, company business info, accent shape, and QR code' },
        { label: 'Data Report', text: 'Add a styled financial summary table, column chart comparing Q1 to Q4 revenue, and progress bar KPI indicator' },
        { label: 'Certificate', text: 'Create an Achievement Certificate layout with ornate certificate border, floral border art, gold WordArt title, and signature block' },
        { label: 'Dark & Grid', text: 'Switch UI to Dark Mode and turn on Grid and Baselines' }
    ];

    const IMAGE_PRESETS = ['Photorealistic', 'Watercolor', '3D Render', 'Digital Painting', 'Cinematic', 'Page Texture'];

    const IMAGE_SAMPLES = [
        { label: 'Mountain Cabin', text: 'Snowy mountain cabin at sunrise with glowing windows, photorealistic, warm lighting' },
        { label: 'Watercolor Flowers', text: 'Vibrant watercolor floral bouquet with gentle pastel washes and delicate leaves' },
        { label: '3D Gold Trophy', text: 'Glossy 3D gold champion trophy with sparkling studio reflection and dramatic shadow' },
        { label: 'Silk Waves', text: 'Elegant abstract silk ribbons undulating in rich teal and golden waves' },
        { label: 'Parchment Texture', text: 'Antique textured parchment paper with subtle tea-stain edges and fine grain' }
    ];

    const VECTOR_PRESETS = ['Flat Illustration', 'Logo / Emblem', 'Line Art / Stencil', 'Sticker / Badge', 'Detailed Scene'];

    const VECTOR_SAMPLES = [
        { label: 'Rocket Launch', text: 'Retro space rocket launching into stars with fiery flame trail, vibrant flat illustration' },
        { label: 'Coffee Emblem', text: 'Modern minimalist coffee shop emblem with steaming cup, coffee beans, and circular ribbon' },
        { label: 'Origami Swan', text: 'Geometric origami swan floating on subtle geometric water ripple, clean vector' },
        { label: 'Security Shield', text: 'Cybersecurity shield badge with padlock, metallic gradient, and safety stars' },
        { label: 'Tree of Life', text: 'Spreading tree of life with swirling roots and leaves, stencil line art graphic' }
    ];

    function ensureModalMarkup() {
        let overlay = document.getElementById('op-ai-modal-overlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = 'op-ai-modal-overlay';
        overlay.className = 'custom-dialog-overlay op-ai-overlay';
        overlay.style.display = 'none';

        const layoutChipsHtml = SAMPLE_PROMPTS.map((sp, idx) =>
            `<button type="button" class="op-ai-chip" data-sample-idx="${idx}" title="${escapeHtml(sp.text)}">${escapeHtml(sp.label)}</button>`
        ).join('');

        const imgPresetsHtml = IMAGE_PRESETS.map(p =>
            `<button type="button" class="op-ai-chip op-ai-preset-chip" data-type="img" data-preset="${escapeHtml(p)}">${escapeHtml(p)}</button>`
        ).join('');

        const imgSamplesHtml = IMAGE_SAMPLES.map(s =>
            `<button type="button" class="op-ai-chip op-ai-sample-chip" data-target="img" data-text="${escapeHtml(s.text)}" title="${escapeHtml(s.text)}">${escapeHtml(s.label)}</button>`
        ).join('');

        const vecPresetsHtml = VECTOR_PRESETS.map(p =>
            `<button type="button" class="op-ai-chip op-ai-preset-chip" data-type="vec" data-preset="${escapeHtml(p)}">${escapeHtml(p)}</button>`
        ).join('');

        const vecSamplesHtml = VECTOR_SAMPLES.map(s =>
            `<button type="button" class="op-ai-chip op-ai-sample-chip" data-target="vec" data-text="${escapeHtml(s.text)}" title="${escapeHtml(s.text)}">${escapeHtml(s.label)}</button>`
        ).join('');

        overlay.innerHTML = `
            <div class="custom-dialog op-ai-dialog" id="op-ai-dialog" style="transform: translate(0px, 0px);">
                <div class="custom-dialog-header" id="op-ai-dialog-header">
                    <span><i class="fas fa-wand-magic-sparkles" style="margin-right:8px;"></i>OpenPublisher AI Studio</span>
                    <span class="custom-dialog-close" id="op-ai-close-btn" title="Close (Esc)"><i class="fas fa-times"></i></span>
                </div>
                <div class="custom-dialog-body op-ai-body">
                    <!-- Tab Strip -->
                    <div class="op-ai-tab-strip" role="tablist">
                        <button type="button" class="op-ai-tab active" data-tab="layout" role="tab" aria-selected="true"><i class="fas fa-layer-group"></i>Page Layout</button>
                        <button type="button" class="op-ai-tab" data-tab="image" role="tab" aria-selected="false"><i class="fas fa-image"></i>AI Image (Photo & Art)</button>
                        <button type="button" class="op-ai-tab" data-tab="vector" role="tab" aria-selected="false"><i class="fas fa-bezier-curve"></i>AI Vector (Crisp SVG)</button>
                    </div>

                    <!-- TAB 1: Page Layout -->
                    <div class="op-ai-tab-panel" id="op-ai-tab-layout">
                        <div class="op-ai-context-bar" id="op-ai-context-bar">Loading page context...</div>

                        <div class="op-ai-field-wrap">
                            <div class="op-ai-label-row">
                                <label for="op-ai-prompt" class="op-ai-label">Describe a layout, element, or app command:</label>
                                <span class="op-ai-char-hint" id="op-ai-char-hint">Min 8 chars, multi-word</span>
                            </div>
                            <textarea id="op-ai-prompt" class="op-ai-textarea" rows="3" placeholder="e.g., Create an autumn farmer's market flyer with a ribbon ad badge, orange gradient background, styled callout box, and QR code..."></textarea>
                        </div>

                        <div class="op-ai-chips-row">
                            <span class="op-ai-chips-title">Quick ideas:</span>
                            <div class="op-ai-chips-list">${layoutChipsHtml}</div>
                        </div>

                        <label class="op-ai-checkbox-row">
                            <input type="checkbox" id="op-ai-clear-checkbox">
                            <span>Clear current page elements before generating layout</span>
                        </label>
                    </div>

                    <!-- TAB 2: AI Image (Photo & Art) -->
                    <div class="op-ai-tab-panel hidden" id="op-ai-tab-image">
                        <div class="op-ai-info-badge op-ai-info-image">
                            <i class="fas fa-camera" style="font-size:16px; margin-top:2px; flex-shrink:0;"></i>
                            <div><strong>🖼️ AI Image (Pixel Artwork & Photos):</strong> Generates rich, detailed raster images (JPEG) such as photographs, watercolors, 3D renders, and textured backgrounds. Best for realistic scenes and posters. Need a crisp logo, icon, or illustration that scales to any print size without blurring? Switch to <strong>AI Vector (SVG)</strong>.</div>
                        </div>

                        <div class="op-ai-field-wrap">
                            <div class="op-ai-label-row">
                                <label for="op-ai-img-prompt" class="op-ai-label">Describe the image to generate:</label>
                                <span class="op-ai-char-hint" id="op-ai-img-char-hint">Min 8 chars, multi-word</span>
                            </div>
                            <textarea id="op-ai-img-prompt" class="op-ai-textarea" rows="3" placeholder="e.g., A cozy wooden cabin in the snowy mountains at sunrise with warm glowing windows..."></textarea>
                        </div>

                        <div class="op-ai-chips-row">
                            <span class="op-ai-chips-title">Style preset:</span>
                            <div class="op-ai-chips-list" id="op-ai-img-presets">${imgPresetsHtml}</div>
                        </div>

                        <div class="op-ai-field-wrap">
                            <span class="op-ai-chips-title" style="margin-bottom:2px;">Placement:</span>
                            <div class="op-ai-radio-group">
                                <label class="op-ai-radio-option">
                                    <input type="radio" name="op-ai-img-placement" value="canvas" checked>
                                    <span>Insert as Canvas Picture</span>
                                </label>
                                <label class="op-ai-radio-option">
                                    <input type="radio" name="op-ai-img-placement" value="background">
                                    <span>Set as Page Background</span>
                                </label>
                            </div>
                        </div>

                        <div class="op-ai-chips-row">
                            <span class="op-ai-chips-title">Quick ideas:</span>
                            <div class="op-ai-chips-list">${imgSamplesHtml}</div>
                        </div>
                    </div>

                    <!-- TAB 3: AI Vector (Crisp SVG) -->
                    <div class="op-ai-tab-panel hidden" id="op-ai-tab-vector">
                        <div class="op-ai-info-badge op-ai-info-vector">
                            <i class="fas fa-bezier-curve" style="font-size:16px; margin-top:2px; flex-shrink:0;"></i>
                            <div><strong>✒️ What is an AI Vector (SVG)?</strong> Unlike standard pixel images that can get blurry when stretched, <strong>SVG (Scalable Vector Graphics)</strong> are drawn using mathematical shapes, curves, and gradients. They stay <strong>100% razor-sharp at any print size</strong> (from a business card to a giant poster), have transparent backgrounds, and let you recolor individual shapes using OpenPublisher's <strong>CSS Colors & Style</strong> tool! Best for logos, clipart, icons, badges, and flat illustrations.</div>
                        </div>

                        <div class="op-ai-field-wrap">
                            <div class="op-ai-label-row">
                                <label for="op-ai-vec-prompt" class="op-ai-label">Describe the vector graphic or illustration:</label>
                                <span class="op-ai-char-hint" id="op-ai-vec-char-hint">Min 8 chars, multi-word</span>
                            </div>
                            <textarea id="op-ai-vec-prompt" class="op-ai-textarea" rows="3" placeholder="e.g., A modern coffee shop logo with a steaming mug, coffee beans, and circular ribbon banner..."></textarea>
                        </div>

                        <div class="op-ai-chips-row">
                            <span class="op-ai-chips-title">Vector style:</span>
                            <div class="op-ai-chips-list" id="op-ai-vec-presets">${vecPresetsHtml}</div>
                        </div>

                        <div class="op-ai-chips-row">
                            <span class="op-ai-chips-title">Quick ideas:</span>
                            <div class="op-ai-chips-list">${vecSamplesHtml}</div>
                        </div>
                    </div>

                    <!-- Shared Status Box -->
                    <div class="op-ai-status" id="op-ai-status" style="display:none;"></div>
                </div>
                <div class="custom-dialog-footer op-ai-footer">
                    <button type="button" class="btn-secondary op-ai-undo-btn" id="op-ai-undo-btn" style="display:none; margin-right:auto;" title="Undo last AI generation in one step (Ctrl+Z)"><i class="fas fa-undo" style="margin-right:5px;"></i>Undo AI Action</button>
                    <button type="button" class="btn-secondary" id="op-ai-cancel-btn">Close</button>
                    <button type="button" class="btn-primary op-ai-submit-btn" id="op-ai-submit-btn"><i class="fas fa-wand-magic-sparkles" style="margin-right:6px;"></i>Generate Layout</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const dlg = document.getElementById('op-ai-dialog');
        const hdr = document.getElementById('op-ai-dialog-header');
        if (global.DialogSystem && typeof global.DialogSystem.makeDraggable === 'function') {
            global.DialogSystem.makeDraggable(dlg, hdr);
        }

        document.getElementById('op-ai-close-btn').onclick = closeModal;
        document.getElementById('op-ai-cancel-btn').onclick = closeModal;
        document.getElementById('op-ai-submit-btn').onclick = handleSubmit;

        // Tab switching
        overlay.querySelectorAll('.op-ai-tab').forEach(tabBtn => {
            tabBtn.onclick = () => {
                const target = tabBtn.getAttribute('data-tab');
                switchTab(target);
            };
        });

        // Preset chip toggles
        overlay.querySelectorAll('.op-ai-preset-chip').forEach(btn => {
            btn.onclick = () => {
                const type = btn.getAttribute('data-type');
                const preset = btn.getAttribute('data-preset') || '';
                const container = btn.parentElement;
                const wasActive = btn.classList.contains('active-preset');

                if (container) {
                    container.querySelectorAll('.op-ai-preset-chip').forEach(b => b.classList.remove('active-preset'));
                }

                if (!wasActive) {
                    btn.classList.add('active-preset');
                    if (type === 'img') _selectedImgPreset = preset;
                    else _selectedVecPreset = preset;
                } else {
                    if (type === 'img') _selectedImgPreset = '';
                    else _selectedVecPreset = '';
                }
            };
        });

        // Sample prompt chips
        overlay.querySelectorAll('.op-ai-sample-chip').forEach(btn => {
            btn.onclick = () => {
                const target = btn.getAttribute('data-target');
                const txt = btn.getAttribute('data-text') || '';
                if (target === 'img') {
                    const inp = document.getElementById('op-ai-img-prompt');
                    if (inp) {
                        inp.value = txt;
                        updateValidationHint('image');
                        inp.focus();
                    }
                } else if (target === 'vec') {
                    const inp = document.getElementById('op-ai-vec-prompt');
                    if (inp) {
                        inp.value = txt;
                        updateValidationHint('vector');
                        inp.focus();
                    }
                }
            };
        });

        const undoBtn = document.getElementById('op-ai-undo-btn');
        undoBtn.onclick = () => {
            if (typeof global.undo === 'function') {
                global.undo();
                showStatus('success', 'Reverted last AI action cleanly.');
                undoBtn.style.display = 'none';
            }
        };

        // Textarea keydown and input listeners
        const layoutInput = document.getElementById('op-ai-prompt');
        layoutInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
            }
        });
        layoutInput.addEventListener('input', () => updateValidationHint('layout'));

        const imgInput = document.getElementById('op-ai-img-prompt');
        imgInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
            }
        });
        imgInput.addEventListener('input', () => updateValidationHint('image'));

        const vecInput = document.getElementById('op-ai-vec-prompt');
        vecInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
            }
        });
        vecInput.addEventListener('input', () => updateValidationHint('vector'));

        overlay.addEventListener('focusout', (e) => {
            e.stopPropagation();
        });

        // Tab 1 layout samples
        overlay.querySelectorAll('#op-ai-tab-layout .op-ai-chip[data-sample-idx]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-sample-idx'), 10);
                if (SAMPLE_PROMPTS[idx]) {
                    layoutInput.value = SAMPLE_PROMPTS[idx].text;
                    updateValidationHint('layout');
                    layoutInput.focus();
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.style.display !== 'none') {
                closeModal();
            }
        });

        return overlay;
    }

    function switchTab(tabId) {
        const valid = ['layout', 'image', 'vector'];
        const activeTab = valid.includes(tabId) ? tabId : 'layout';
        _currentActiveTab = activeTab;

        const overlay = document.getElementById('op-ai-modal-overlay');
        if (!overlay) return;

        overlay.querySelectorAll('.op-ai-tab').forEach(tb => {
            const isTarget = tb.getAttribute('data-tab') === activeTab;
            tb.classList.toggle('active', isTarget);
            tb.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        });

        const panels = {
            layout: document.getElementById('op-ai-tab-layout'),
            image: document.getElementById('op-ai-tab-image'),
            vector: document.getElementById('op-ai-tab-vector')
        };
        Object.keys(panels).forEach(k => {
            if (panels[k]) {
                panels[k].classList.toggle('hidden', k !== activeTab);
            }
        });

        refreshCooldownUI();

        setTimeout(() => {
            if (activeTab === 'layout') {
                const p = document.getElementById('op-ai-prompt');
                if (p) p.focus();
                updateValidationHint('layout');
            } else if (activeTab === 'image') {
                const p = document.getElementById('op-ai-img-prompt');
                if (p) p.focus();
                updateValidationHint('image');
            } else if (activeTab === 'vector') {
                const p = document.getElementById('op-ai-vec-prompt');
                if (p) p.focus();
                updateValidationHint('vector');
            }
        }, 50);
    }

    function updateContextBar() {
        const bar = document.getElementById('op-ai-context-bar');
        if (!bar) return;
        const ctx = getCurrentPageContext();
        bar.innerHTML = `<i class="fas fa-file-alt" style="margin-right:6px; color:var(--ui-theme-color);"></i><strong>${escapeHtml(ctx.format)}</strong> &bull; ${ctx.width_mm} &times; ${ctx.height_mm} mm (${ctx.orientation}) &bull; Units: ${escapeHtml(ctx.activeUnit)} &bull; Scheme: <strong>${escapeHtml(ctx.colorScheme)}</strong>`;
    }

    function updateValidationHint(tabId = _currentActiveTab) {
        const inputs = {
            layout: { input: document.getElementById('op-ai-prompt'), hint: document.getElementById('op-ai-char-hint') },
            image: { input: document.getElementById('op-ai-img-prompt'), hint: document.getElementById('op-ai-img-char-hint') },
            vector: { input: document.getElementById('op-ai-vec-prompt'), hint: document.getElementById('op-ai-vec-char-hint') }
        };
        const target = inputs[tabId] || inputs.layout;
        if (!target.input || !target.hint) return;
        const val = target.input.value.trim();
        if (!val) {
            target.hint.textContent = 'Min 8 chars, multi-word';
            target.hint.className = 'op-ai-char-hint';
            return;
        }
        const check = validatePrompt(val);
        if (check.valid) {
            target.hint.textContent = `${val.length} chars (ready)`;
            target.hint.className = 'op-ai-char-hint ok';
        } else {
            target.hint.textContent = `${val.length} chars`;
            target.hint.className = 'op-ai-char-hint warn';
        }
    }

    function showStatus(kind, messageHtml) {
        const box = document.getElementById('op-ai-status');
        if (!box) return;
        box.style.display = 'flex';
        box.className = `op-ai-status op-ai-status-${kind}`;
        const iconMap = {
            info: 'fa-circle-notch fa-spin',
            error: 'fa-exclamation-circle',
            success: 'fa-check-circle'
        };
        box.innerHTML = `<i class="fas ${iconMap[kind] || 'fa-info-circle'}"></i><span>${messageHtml}</span>`;
    }

    function refreshCooldownUI() {
        const btn = document.getElementById('op-ai-submit-btn');
        if (!btn || btn.dataset.busy === 'true') return;
        const remMs = getCooldownRemainingMs();

        const labels = {
            layout: '<i class="fas fa-wand-magic-sparkles" style="margin-right:6px;"></i>Generate Layout',
            image: '<i class="fas fa-image" style="margin-right:6px;"></i>Generate Image',
            vector: '<i class="fas fa-bezier-curve" style="margin-right:6px;"></i>Generate Vector (SVG)'
        };
        const defaultLabel = labels[_currentActiveTab] || labels.layout;

        if (remMs > 0) {
            const secs = Math.ceil(remMs / 1000);
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-hourglass-half" style="margin-right:6px;"></i>Wait ${secs}s`;
        } else {
            btn.disabled = false;
            btn.innerHTML = defaultLabel;
        }
    }

    function startCooldownTicker() {
        stopCooldownTicker();
        refreshCooldownUI();
        _cooldownTicker = setInterval(() => {
            refreshCooldownUI();
            if (getCooldownRemainingMs() <= 0) {
                stopCooldownTicker();
            }
        }, 500);
    }

    function stopCooldownTicker() {
        if (_cooldownTicker) {
            clearInterval(_cooldownTicker);
            _cooldownTicker = null;
        }
    }

    async function handleSubmit() {
        if (_currentActiveTab === 'image') {
            return handleSubmitImage();
        }
        if (_currentActiveTab === 'vector') {
            return handleSubmitVector();
        }
        return handleSubmitLayout();
    }

    async function handleSubmitLayout() {
        const input = document.getElementById('op-ai-prompt');
        const submitBtn = document.getElementById('op-ai-submit-btn');
        const clearCheckbox = document.getElementById('op-ai-clear-checkbox');
        const undoBtn = document.getElementById('op-ai-undo-btn');
        if (!input || !submitBtn) return;

        const check = validatePrompt(input.value);
        if (!check.valid) {
            showStatus('error', escapeHtml(check.reason));
            return;
        }

        const remMs = getCooldownRemainingMs();
        if (remMs > 0) {
            const secs = Math.ceil(remMs / 1000);
            showStatus('error', `Please wait ${secs} second${secs === 1 ? '' : 's'} before generating again (20s cooldown).`);
            startCooldownTicker();
            return;
        }

        submitBtn.dataset.busy = 'true';
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin" style="margin-right:6px;"></i>Generating Layout...';

        const clearPage = !!(clearCheckbox && clearCheckbox.checked);
        const userPrompt = clearPage
            ? `${check.prompt}

(Note: clearCurrentPage is requested so start from a clean page.)`
            : check.prompt;
        const systemPrompt = buildAISystemPrompt(getCurrentPageContext());

        try {
            const result = await sendAIWorkerRequest(systemPrompt, userPrompt, (st) => {
                if (st.phase === 'rollover') {
                    showStatus('info', `Worker node ${st.nodeIndex}/${st.totalNodes} busy (503) - rolling over to next node...`);
                } else {
                    showStatus('info', `Connecting to AI worker (${st.nodeIndex}/${st.totalNodes})...`);
                }
            });

            const stats = await applyAILayoutResponse(result.plan, check.prompt, { forceClear: clearPage });
            updateContextBar();

            const summaryText = result.plan.summary
                ? escapeHtml(String(result.plan.summary))
                : `Applied ${stats.elementsCreated} element(s), ${stats.pageChanges.length} page change(s), ${stats.commands.length} command(s).`;

            showStatus('success', `<strong>Done:</strong> ${summaryText}`);
            if (undoBtn) undoBtn.style.display = 'inline-flex';
            startCooldownTicker();
        } catch (err) {
            showStatus('error', escapeHtml(err?.message || 'Unable to generate AI layout.'));
        } finally {
            delete submitBtn.dataset.busy;
            refreshCooldownUI();
        }
    }

    async function handleSubmitImage() {
        const input = document.getElementById('op-ai-img-prompt');
        const submitBtn = document.getElementById('op-ai-submit-btn');
        const undoBtn = document.getElementById('op-ai-undo-btn');
        if (!input || !submitBtn) return;

        const check = validatePrompt(input.value);
        if (!check.valid) {
            showStatus('error', escapeHtml(check.reason));
            return;
        }

        const remMs = getCooldownRemainingMs();
        if (remMs > 0) {
            const secs = Math.ceil(remMs / 1000);
            showStatus('error', `Please wait ${secs} second${secs === 1 ? '' : 's'} before generating again (20s cooldown).`);
            startCooldownTicker();
            return;
        }

        submitBtn.dataset.busy = 'true';
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin" style="margin-right:6px;"></i>Generating Image...';

        const placementRadio = document.querySelector('input[name="op-ai-img-placement"]:checked');
        const asBackground = placementRadio && placementRadio.value === 'background';

        try {
            showStatus('info', 'Connecting to FLUX.1 AI Image Worker (openpub-img-1)...');
            const result = await generateAIImage(check.prompt, _selectedImgPreset, {
                onStatus: (st) => {
                    if (st.phase === 'fallback') {
                        showStatus('info', 'GPU quota reached (503) - falling back to SVG vector graphic...');
                    }
                }
            });

            if (result.fallbackToSvg) {
                insertAIVectorToCanvas(result.svg);
                showStatus('info', `<strong>FLUX.1 Notice:</strong> Daily GPU quota reached (503). Automatically fell back to generating a scalable vector SVG graphic!`);
            } else {
                insertAIImageToCanvas(result.dataUrl, { asBackground });
                const locMsg = asBackground ? 'set as page background' : 'added to canvas';
                showStatus('success', `<strong>Done:</strong> AI Image generated and ${locMsg}.`);
            }

            if (undoBtn) undoBtn.style.display = 'inline-flex';
            startCooldownTicker();
        } catch (err) {
            showStatus('error', escapeHtml(err?.message || 'Unable to generate AI image.'));
        } finally {
            delete submitBtn.dataset.busy;
            refreshCooldownUI();
        }
    }

    async function handleSubmitVector() {
        const input = document.getElementById('op-ai-vec-prompt');
        const submitBtn = document.getElementById('op-ai-submit-btn');
        const undoBtn = document.getElementById('op-ai-undo-btn');
        if (!input || !submitBtn) return;

        const check = validatePrompt(input.value);
        if (!check.valid) {
            showStatus('error', escapeHtml(check.reason));
            return;
        }

        const remMs = getCooldownRemainingMs();
        if (remMs > 0) {
            const secs = Math.ceil(remMs / 1000);
            showStatus('error', `Please wait ${secs} second${secs === 1 ? '' : 's'} before generating again (20s cooldown).`);
            startCooldownTicker();
            return;
        }

        submitBtn.dataset.busy = 'true';
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin" style="margin-right:6px;"></i>Generating Vector...';

        try {
            showStatus('info', 'Generating scalable vector artwork across AI cluster...');
            const result = await generateAIVectorSVG(check.prompt, _selectedVecPreset, (st) => {
                if (st.phase === 'rollover') {
                    showStatus('info', `Worker node ${st.nodeIndex}/${st.totalNodes} busy (503) - rolling over...`);
                }
            });

            insertAIVectorToCanvas(result.svg);
            showStatus('success', `<strong>Done:</strong> ${escapeHtml(result.summary || 'Scalable Vector SVG added to canvas.')}`);

            if (undoBtn) undoBtn.style.display = 'inline-flex';
            startCooldownTicker();
        } catch (err) {
            showStatus('error', escapeHtml(err?.message || 'Unable to generate AI vector.'));
        } finally {
            delete submitBtn.dataset.busy;
            refreshCooldownUI();
        }
    }

    function showModal(initialTab = 'layout') {
        const overlay = ensureModalMarkup();
        updateContextBar();
        switchTab(initialTab || 'layout');
        overlay.style.display = 'flex';
        startCooldownTicker();
    }

    function closeModal() {
        const overlay = document.getElementById('op-ai-modal-overlay');
        if (overlay) overlay.style.display = 'none';
        stopCooldownTicker();
    }

    /* ------------------------------------------------------------------------
       7. PUBLIC EXPORTS
       ------------------------------------------------------------------------ */

    global.buildAISystemPrompt = buildAISystemPrompt;
    global.buildAIVectorSVGSystemPrompt = buildAIVectorSVGSystemPrompt;
    global.applyAILayoutResponse = applyAILayoutResponse;
    global.generateAIImage = generateAIImage;
    global.generateAIVectorSVG = generateAIVectorSVG;
    global.AIAssistant = {
        VERSION: '5.20.4',
        WORKER_NODES: AI_WORKER_NODES.slice(),
        IMAGE_WORKER_NODES: AI_IMAGE_WORKER_NODES.slice(),
        COOLDOWN_MS,
        MIN_PROMPT_LENGTH,
        getDeviceId,
        validatePrompt,
        getCooldownRemainingMs,
        shuffleNodes,
        getCurrentPageContext,
        buildAISystemPrompt,
        buildAIVectorSVGSystemPrompt,
        sanitizeSvgMarkup,
        requestLayout: sendAIWorkerRequest,
        generateAIImage,
        generateAIVectorSVG,
        insertAIImageToCanvas,
        insertAIVectorToCanvas,
        applyLayout: applyAILayoutResponse,
        ensureReadableContrast,
        gateAppCommands,
        showModal,
        closeModal,
        switchTab
    };

})(window);
