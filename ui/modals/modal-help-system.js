// =========================================================================
// OPEN PUBLISHER — UNIVERSAL MODAL ATTENTION PULSE & XP-STYLE [?] HELP SYSTEM
// =========================================================================
(function (global) {
    'use strict';

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function stripHtml(html) {
        return String(html == null ? '' : html)
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // =========================================================================
    // 1. UNIVERSAL TEAL-GREEN MODAL ATTENTION PULSE (WINDOWS XP STYLE FLASH)
    // =========================================================================
    function triggerModalPulse(winEl) {
        if (!winEl) return;
        winEl.classList.remove('op-vf-pulse', 'op-modal-pulse');
        void winEl.offsetWidth;
        winEl.classList.add('op-modal-pulse');
    }

    function injectUniversalModalStyles() {
        if (document.getElementById('op-universal-modal-help-styles')) return;
        const style = document.createElement('style');
        style.id = 'op-universal-modal-help-styles';
        style.textContent = `
            @keyframes opUniversalModalPulse {
                0%, 100% {
                    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.34);
                }
                50% {
                    box-shadow: 0 0 0 3px var(--ui-theme-color, #007670), 0 24px 60px rgba(0, 0, 0, 0.44) !important;
                }
            }
            .op-modal-pulse {
                animation: opUniversalModalPulse 0.25s ease !important;
            }
            .op-dialog-header-actions {
                display: flex;
                align-items: center;
                gap: 6px;
                flex-shrink: 0;
                margin-left: 10px;
            }
            .custom-dialog-close.op-modal-help-btn,
            .custom-dialog.format-properties-modal .custom-dialog-close.op-modal-help-btn {
                font-size: 18px !important;
            }
            .custom-dialog-close.op-modal-help-btn:hover,
            body.dark-mode .custom-dialog-close.op-modal-help-btn:hover,
            .custom-dialog.format-properties-modal .custom-dialog-close.op-modal-help-btn:hover,
            body.dark-mode .custom-dialog.format-properties-modal .custom-dialog-close.op-modal-help-btn:hover {
                background: rgba(255, 255, 255, 0.25) !important;
                color: #ffffff !important;
            }
            body.bright-theme .custom-dialog-header .custom-dialog-close.op-modal-help-btn:hover {
                background: rgba(0, 0, 0, 0.18) !important;
                color: #111111 !important;
            }

            /* Universal XP-Style Help Modal */
            #op-universal-help-overlay {
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, 0.28);
                z-index: 1000060;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                box-sizing: border-box;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .op-uh-box {
                width: 660px;
                max-width: 94vw;
                height: 470px;
                max-height: 86vh;
                background: var(--ui-panel-bg, #ffffff);
                color: var(--ui-text, #1e293b);
                border: 1px solid var(--ui-border, #94a3b8);
                border-radius: 10px;
                box-shadow: 0 18px 46px rgba(0, 0, 0, 0.34);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            body.dark-mode .op-uh-box {
                background: #1e293b;
                color: #f8fafc;
                border-color: #334155;
            }
            .op-uh-header {
                padding: 6px 8px 6px 16px;
                background: linear-gradient(135deg, var(--ui-theme-color, #007670), var(--ui-theme-dark, #004d49));
                color: #ffffff;
                display: flex;
                align-items: center;
                justify-content: space-between;
                user-select: none;
                font-weight: 700;
                font-size: 14px;
                cursor: grab;
            }
            .op-uh-header:active {
                cursor: grabbing;
            }
            .op-uh-header .custom-dialog-close {
                width: 32px;
                height: 32px;
                font-size: 17px;
                border-radius: 8px;
                flex-shrink: 0;
            }
            .op-uh-toolbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                padding: 6px 12px;
                background: var(--ui-surface-bg, #f1f5f9);
                border-bottom: 1px solid var(--ui-border, #cbd5e1);
                font-size: 12px;
            }
            body.dark-mode .op-uh-toolbar {
                background: #0f172a;
                border-color: #334155;
            }
            .op-uh-nav-btns {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .op-uh-tool-btn {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 4px 10px;
                font-size: 11.5px;
                font-weight: 600;
                background: var(--ui-panel-bg, #ffffff);
                color: var(--ui-theme-dark, #004a46);
                border: 1px solid var(--ui-border, #cbd5e1);
                border-radius: 4px;
                cursor: pointer;
            }
            body.dark-mode .op-uh-tool-btn {
                background: #1e293b;
                color: #e2e8f0;
                border-color: #475569;
            }
            .op-uh-tool-btn:hover:not(:disabled) {
                border-color: var(--ui-theme-color, #007670);
                background: rgba(0, 118, 112, 0.08);
            }
            .op-uh-tool-btn:disabled {
                opacity: 0.45;
                cursor: default;
            }
            .op-uh-split {
                flex: 1;
                display: grid;
                grid-template-columns: 210px 1fr;
                min-height: 0;
            }
            .op-uh-toc {
                background: var(--ui-surface-bg, #f8fafc);
                border-right: 1px solid var(--ui-border, #cbd5e1);
                padding: 10px 8px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 3px;
            }
            body.dark-mode .op-uh-toc {
                background: #0f172a;
                border-right-color: #334155;
            }
            .op-uh-toc-head {
                font-size: 10.5px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: var(--ui-theme-color, #007670);
                padding: 2px 6px 6px;
            }
            body.dark-mode .op-uh-toc-head {
                color: #5eead4;
            }
            .op-uh-topic-btn {
                width: 100%;
                text-align: left;
                border: 1px solid transparent;
                background: transparent;
                color: var(--ui-text, #1e293b);
                padding: 7px 9px;
                border-radius: 5px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 7px;
            }
            body.dark-mode .op-uh-topic-btn {
                color: #e2e8f0;
            }
            .op-uh-topic-btn i {
                color: var(--ui-theme-color, #007670);
                font-size: 11px;
                flex-shrink: 0;
            }
            body.dark-mode .op-uh-topic-btn i {
                color: #5eead4;
            }
            .op-uh-topic-btn:hover {
                background: rgba(0, 118, 112, 0.08);
            }
            .op-uh-topic-btn.active {
                background: var(--ui-theme-color, #007670);
                color: #ffffff;
                font-weight: 700;
            }
            .op-uh-topic-btn.active i {
                color: #ffffff;
            }
            body.bright-theme .op-uh-header,
            body.bright-theme .op-uh-header .custom-dialog-close,
            body.bright-theme .op-uh-topic-btn.active,
            body.bright-theme .op-uh-topic-btn.active i {
                color: #111111;
            }
            body.bright-theme .op-uh-header .custom-dialog-close:hover {
                background: rgba(0, 0, 0, 0.12);
                color: #000000;
            }
            .op-uh-pane {
                padding: 16px 20px;
                overflow-y: auto;
                font-size: 13px;
                line-height: 1.55;
            }
            .op-uh-pane h4 {
                margin: 0 0 10px;
                font-size: 16px;
                color: var(--ui-theme-color, #007670);
                border-bottom: 1px solid var(--ui-border, #e2e8f0);
                padding-bottom: 6px;
            }
            body.dark-mode .op-uh-pane h4 {
                color: #5eead4;
                border-bottom-color: #334155;
            }
            .op-uh-pane p {
                margin: 0 0 10px;
            }
            .op-uh-pane ul {
                margin: 8px 0 0;
                padding-left: 18px;
            }
            .op-uh-pane li {
                margin-bottom: 7px;
            }
            .op-uh-pane code {
                padding: 1px 5px;
                border-radius: 3px;
                font-size: 11.5px;
                background: rgba(0, 118, 112, 0.1);
                color: var(--ui-theme-dark, #004a46);
            }
            body.dark-mode .op-uh-pane code {
                background: rgba(45, 212, 191, 0.15);
                color: #5eead4;
            }
            .op-uh-footer {
                padding: 9px 14px;
                border-top: 1px solid var(--ui-border, #cbd5e1);
                background: var(--ui-surface-bg, #f8fafc);
                display: flex;
                justify-content: flex-end;
            }
            body.dark-mode .op-uh-footer {
                background: #0f172a;
                border-top-color: #334155;
            }
            .op-uh-ok-btn {
                padding: 6px 18px;
                border-radius: 6px;
                border: none;
                font-weight: 700;
                font-size: 12.5px;
                background: var(--ui-theme-color, #007670);
                color: #ffffff;
                cursor: pointer;
            }
            .op-uh-ok-btn:hover {
                background: var(--ui-theme-dark, #004a46);
            }
            body.bright-theme .op-uh-ok-btn {
                color: #111111;
            }
        `;
        document.head.appendChild(style);
    }

    // Global capture-phase backdrop mousedown handler so clicking outside ANY open modal flashes its window
    function initGlobalBackdropPulseListener() {
        if (global._opUniversalBackdropPulseBound) return;
        global._opUniversalBackdropPulseBound = true;

        document.addEventListener('mousedown', function (e) {
            const t = e.target;
            if (!t || !t.classList) return;

            // 1. Standard DialogSystem overlay & dynamic .custom-dialog-overlay modals (including AI Studio)
            if (t.id === 'custom-dialog-overlay' || t.classList.contains('custom-dialog-overlay')) {
                const dlg = t.querySelector('#op-ai-dialog, #custom-dialog-box, .custom-dialog');
                if (dlg) {
                    e.stopPropagation();
                    triggerModalPulse(dlg);
                }
                return;
            }

            // 2. Universal Help Modal overlay
            if (t.id === 'op-universal-help-overlay') {
                const box = document.getElementById('op-universal-help-box');
                if (box) {
                    e.stopPropagation();
                    triggerModalPulse(box);
                }
                return;
            }

            // 3. References Engine modals (TOC, Footnotes/Endnotes, References Help, Notice)
            if (t.classList.contains('op-ref-modal-backdrop') || t.id === 'op-toc-modal-backdrop' || t.id === 'op-note-modal-backdrop') {
                const root = document.getElementById('op-references-modal-root');
                const win = root ? root.querySelector('.op-ref-modal-window') : document.querySelector('.op-ref-modal-window');
                if (win) {
                    e.stopPropagation();
                    triggerModalPulse(win);
                }
                return;
            }
            if (t.id === 'op-ref-notice-backdrop' || t.id === 'op-ref-notice-overlay') {
                const win = document.getElementById('op-ref-notice-window');
                if (win) {
                    e.stopPropagation();
                    triggerModalPulse(win);
                }
                return;
            }
            if (t.id === 'op-ref-help-overlay') {
                const box = document.getElementById('op-ref-help-box');
                if (box) {
                    e.stopPropagation();
                    triggerModalPulse(box);
                }
                return;
            }

            // 4. Variable Fonts Help & Notice overlays
            if (t.id === 'op-vf-help-overlay') {
                const box = document.getElementById('op-vf-help-box');
                if (box) {
                    e.stopPropagation();
                    triggerModalPulse(box);
                }
                return;
            }
            if (t.id === 'op-vf-notice-overlay') {
                const box = t.querySelector('.op-vf-notice-box');
                if (box) {
                    e.stopPropagation();
                    triggerModalPulse(box);
                }
                return;
            }

            // 5. Size & Position Help overlay
            if (t.id === 'sp-help-overlay') {
                const box = document.getElementById('sp-help-box');
                if (box) {
                    e.stopPropagation();
                    triggerModalPulse(box);
                }
                return;
            }

            // 6. Legacy static .modal-overlay containers (#clipart-modal, #wordart-modal, #ad-modal, #template-modal)
            if (t.classList.contains('modal-overlay')) {
                const innerModal = t.querySelector('.modal');
                if (innerModal) {
                    e.stopPropagation();
                    triggerModalPulse(innerModal);
                }
                return;
            }
        }, true);
    }

    // =========================================================================
    // 2. COMPREHENSIVE FEATURE HELP CATALOG (ALL INSERT RIBBON + APP MODALS)
    // =========================================================================
    const HELP_CATALOG = {
        'page-parts': {
            title: 'Page Parts Library Help',
            buttonTitle: 'Page Parts Library Help',
            topics: [
                {
                    id: 'overview',
                    title: 'Overview & 16 Building Blocks',
                    body: '<p>The <strong>Page Parts Library</strong> provides 16 pre-designed, modular layout building blocks that you can drop onto any page to assemble newsletters, brochures, flyers, menus, and reports in seconds:</p><ul><li><strong>Editorial &amp; Structural Blocks:</strong> <em>Sidebar</em>, <em>Pull Quote</em>, <em>Heading</em>, <em>Info Callout</em>, <em>Author Bio</em>, and <em>Review Quote</em>.</li><li><strong>Lists, Steps &amp; Retail Blocks:</strong> <em>Step (Left)</em>, <em>Step (Right)</em>, <em>Checklist Item</em>, <em>Menu Item</em>, <em>Coupon</em>, <em>Event Date</em>, and <em>Stat Callout</em>.</li><li><strong>Forms &amp; Media Blocks:</strong> <em>Contact Block</em>, <em>Photo Block</em>, and <em>Signature Line</em>.</li></ul>'
                },
                {
                    id: 'editing',
                    title: 'Editing Text & Elements',
                    body: '<p>Every Page Part is constructed from native Open Publisher elements rather than static flattened images:</p><ul><li><strong>Live Text Editing:</strong> Click inside any headline, subheading, or body frame to replace the placeholder copy with your own text and typography.</li><li><strong>Independent Moving &amp; Resizing:</strong> Drag or resize individual frames, accent bars, or containers to fit your grid and margin guides.</li></ul>'
                },
                {
                    id: 'colors',
                    title: 'Theme Colors & Styling',
                    body: '<p>Customize Page Parts to match your publication brand palette:</p><ul><li><strong>Color Schemes:</strong> Apply a global palette in <em>Page Design -&gt; Color Schemes</em> or recolor individual elements using <strong>Format Text Box</strong> and <strong>CSS Colors &amp; Style</strong>.</li><li><strong>Styled Text Boxes:</strong> Combine Page Parts with <em>Insert -&gt; Styled Text Box</em> for matching callout borders and glassmorphic panels.</li></ul>'
                },
                {
                    id: 'tips',
                    title: 'Layout & Alignment Tips',
                    body: '<p>Position Page Parts with precision across multi-page documents:</p><ul><li><strong>Snap Guides:</strong> Enable <em>Snap To -&gt; Guides &amp; Objects</em> to align Page Parts cleanly against margin guides and existing columns.</li><li><strong>Master Pages:</strong> Place recurring page headers or structural banners on the <em>Master Page</em> so they repeat automatically across your publication.</li></ul>'
                }
            ]
        },

        'templates': {
            title: 'Publication Templates Help',
            buttonTitle: 'Publication Templates Help',
            topics: [
                {
                    id: 'browsing',
                    title: 'Browsing & Filtering Templates',
                    body: '<p>Open Publisher includes a curated library of ready-to-edit <strong>Publication Templates</strong> for print and digital desktop publishing:</p><ul><li><strong>Categories:</strong> Browse templates across <em>Flyers</em>, <em>Brochures</em>, <em>Newsletters</em>, <em>Business Cards</em>, <em>Greeting Cards</em>, <em>Resumes / CVs</em>, <em>Menus</em>, <em>Certificates</em>, and <em>Posters</em>.</li><li><strong>Orientation &amp; Size Badges:</strong> Each card displays its page dimensions and orientation (Portrait or Landscape) so you know the exact print format before loading.</li></ul>'
                },
                {
                    id: 'insert-modes',
                    title: 'Start New vs. Insert into Page',
                    body: '<p>You can load a template as a fresh publication or merge template pages into an existing project:</p><ul><li><strong>Replace Current Document:</strong> Opening a template from <em>File -&gt; Templates</em> or the Start Dashboard configures the document paper size and loads all template pages.</li><li><strong>Insert Template into Page:</strong> Clicking <em>Insert -&gt; Template</em> (or right-clicking the page minimap) lets you overwrite the current page or append specific template pages without losing your other pages.</li></ul>'
                },
                {
                    id: 'customizing',
                    title: 'Editing Template Elements & Colors',
                    body: '<p>All template artwork, text frames, tables, and vector decorations are unlocked and editable:</p><ul><li><strong>CSS Color Studio:</strong> Select any template decoration or SVG element and open <strong>CSS Colors &amp; Style</strong> to recolor individual palette slots or gradients.</li><li><strong>Picture Replacement:</strong> Select any template image or picture placeholder to swap in your own photos while keeping the frame position and crop.</li></ul>'
                },
                {
                    id: 'saving-templates',
                    title: 'Saving Your Own Templates',
                    body: '<p>Turn any custom design into a reusable template:</p><ul><li><strong>Save Template Package:</strong> Use <em>File -&gt; Save Template</em> to export your layout with custom title, category metadata, and an automatic live thumbnail preview.</li><li><strong>Community Sharing:</strong> Submit exported template packages directly to the Open Publisher template gallery or store them locally for team reuse.</li></ul>'
                }
            ]
        },

        'clipart-gallery': {
            title: 'Clipart Gallery Help',
            buttonTitle: 'Clipart Gallery Help',
            topics: [
                {
                    id: 'searching',
                    title: 'Searching the Clipart Library',
                    body: '<p>The <strong>Clipart Gallery</strong> provides thousands of categorized illustrations and classic desktop-publishing graphics:</p><ul><li><strong>Instant Keyword Search:</strong> Type any keyword in the search bar (such as <code>tree</code>, <code>computer</code>, <code>school</code>, <code>award</code>, or <code>holiday</code>) to filter matching clipart immediately.</li><li><strong>Smart Lazy Loading:</strong> Thumbnails stream smoothly as you scroll so browsing large collections remains fast and responsive.</li></ul>'
                },
                {
                    id: 'inserting',
                    title: 'Selecting & Inserting Clipart',
                    body: '<p>Add clipart illustrations directly onto your active page:</p><ul><li><strong>Select &amp; Insert:</strong> Click any clipart card to highlight it and click <strong>OK</strong>, or <strong>double-click</strong> any card to insert it immediately onto the canvas.</li><li><strong>High-Resolution Delivery:</strong> Open Publisher automatically fetches the full-resolution illustration when placing it on your page.</li></ul>'
                },
                {
                    id: 'formatting',
                    title: 'Recoloring, Framing & Effects',
                    body: '<p>Once inserted, select your clipart to unlock the contextual <strong>Picture</strong> tools:</p><ul><li><strong>Recolor &amp; Filters:</strong> Apply color tints, brightness/contrast adjustments, sepia, or grayscale filters from the <em>Picture</em> tab or <em>Format Picture</em> sidebar.</li><li><strong>Picture Frames &amp; Crop to Shape:</strong> Add a decorative gallery frame or mask the clipart into a circle, star, shield, or heart silhouette.</li></ul>'
                },
                {
                    id: 'wrapping',
                    title: 'Text Wrapping & Layering',
                    body: '<p>Combine clipart illustrations smoothly with surrounding body text:</p><ul><li><strong>Text Wrap:</strong> Right-click the clipart and enable <strong>Wrap Text Around Object</strong> so nearby text boxes flow around the illustration bounds.</li><li><strong>Layer Order:</strong> Use <em>Front</em>, <em>Forward</em>, <em>Backward</em>, and <em>Back</em> (or the <strong>Selection Pane</strong>) to stack clipart behind or above headings.</li></ul>'
                }
            ]
        },

        'emojis': {
            title: 'Emojis & Vector Icons Help',
            buttonTitle: 'Emojis & Vector Icons Help',
            topics: [
                {
                    id: 'overview',
                    title: 'Browsing & Searching Emojis',
                    body: '<p>The <strong>Emojis</strong> gallery lets you insert crisp vector emoji graphics anywhere on your publication canvas:</p><ul><li><strong>Keyword Search:</strong> Search by name, emotion, object, or category (e.g. <code>smile</code>, <code>heart</code>, <code>star</code>, <code>party</code>, <code>food</code>, <code>flag</code>).</li><li><strong>Categorized Sections:</strong> Scroll through organized sections including Smileys &amp; People, Animals &amp; Nature, Food &amp; Drink, Activities, Travel, Objects, and Symbols.</li></ul>'
                },
                {
                    id: 'inserting',
                    title: 'Inserting & Scaling on Canvas',
                    body: '<p>Emojis are placed as dedicated movable canvas elements:</p><ul><li><strong>Quick Insert:</strong> Click any emoji card and press <strong>OK</strong> (or double-click the card) to place it on the current page.</li><li><strong>Crisp Vector Rendering:</strong> Inserted emojis use high-resolution vector artwork so they stay sharp even when scaled up for poster headlines or badges.</li></ul>'
                },
                {
                    id: 'styling',
                    title: 'Rotation, Effects & Layering',
                    body: '<p>Treat emoji graphics like any illustration object on your page:</p><ul><li><strong>Free Rotation:</strong> Drag the top rotation handle (or open <em>Size &amp; Position</em>) to tilt emojis at playful angles around titles and callouts.</li><li><strong>Drop Shadows &amp; Filters:</strong> Use the <em>Format Picture</em> and <em>Drop Shadow</em> sidebars to add depth or color shifts.</li></ul>'
                }
            ]
        },

        'wordart-legacy': {
            title: 'WordArt Gallery (Legacy) Help',
            buttonTitle: 'WordArt Gallery (Legacy) Help',
            topics: [
                {
                    id: 'overview',
                    title: '200 Classic CSS & Vector Styles',
                    body: '<p><strong>WordArt Gallery (Legacy)</strong> offers 200 live CSS and vector typography styles inspired by classic desktop publishing suites:</p><ul><li><strong>Live Preview Grid:</strong> Type your headline in the top input box to preview your custom text across all 200 styles simultaneously.</li><li><strong>Quick Insertion:</strong> Click a style card and press <strong>OK</strong>, or <strong>double-click</strong> any card to drop it onto the page immediately.</li></ul>'
                },
                {
                    id: 'editing',
                    title: 'In-Place Text Editing & Fonts',
                    body: '<p>Legacy WordArt remains live editable text on the canvas:</p><ul><li><strong>Double-Click to Edit:</strong> Double-click any Legacy WordArt element on the page to edit its wording directly or highlight text to change its font family.</li><li><strong>Variable Font Support:</strong> Apply any Variable Font (`VF`) to Legacy WordArt and fine-tune weight, width, or optical size sliders.</li></ul>'
                },
                {
                    id: 'shaping',
                    title: 'Text Shapes, Shadows & Effects',
                    body: '<p>Open the <strong>Format WordArt</strong> sidebar or contextual ribbon tab to customize your headline:</p><ul><li><strong>Text Shapes:</strong> Curve your headline along an <em>Arch Up</em>, <em>Arch Down</em>, <em>Circle</em>, or <em>Wave</em> path.</li><li><strong>Color &amp; Drop Shadows:</strong> Adjust Hue Shift, Saturation, Transparency, Letter Spacing, and 3D Shadow X/Y offsets.</li></ul>'
                }
            ]
        },

        'wordart-beta': {
            title: 'Create WordArt (Beta) Help',
            buttonTitle: 'Create WordArt Help',
            topics: [
                {
                    id: 'overview',
                    title: '500 High-Resolution WordArt Styles',
                    body: '<p><strong>Create WordArt (Beta)</strong> renders your text into 500 rich 3D, metallic, neon, chrome, bevel, and textured display styles:</p><ul><li><strong>Live Style Rendering:</strong> Enter your text in the header input box to watch the gallery cards render your custom headline live.</li><li><strong>Insert to Canvas:</strong> Select your favorite style card and click <strong>OK</strong> (or double-click the card) to generate a high-resolution transparent WordArt graphic.</li></ul>'
                },
                {
                    id: 're-editing',
                    title: 'Editing Text & Changing Styles Later',
                    body: '<p>You can update your Beta WordArt wording or switch styles at any time after insertion:</p><ul><li><strong>Floating WordArt Toolbar:</strong> Click an existing Beta WordArt element on the page to reveal its floating action bar with <strong>Edit Text</strong> and <strong>Change Style</strong> buttons.</li><li><strong>Double-Click Re-Entry:</strong> Double-clicking the WordArt reopens the studio with your current text pre-filled.</li></ul>'
                },
                {
                    id: 'effects',
                    title: 'Scaling, Color Shifts & Print Quality',
                    body: '<p>Beta WordArt graphics are rendered on a high-DPI transparent canvas:</p><ul><li><strong>Color &amp; Shadow Tuning:</strong> Open <em>Format WordArt</em> to apply Hue Shift, Saturation, Brightness, and custom drop shadows.</li><li><strong>Print &amp; PDF Ready:</strong> High-resolution rasterization ensures crisp metallic and 3D bevel edges when printing or exporting to PDF.</li></ul>'
                }
            ]
        },

        'progress-bar': {
            title: 'Progress Bar Designer Help',
            buttonTitle: 'Progress Bar Designer Help',
            topics: [
                {
                    id: 'overview',
                    title: '71 Preset Styles & Categories',
                    body: '<p>The <strong>Progress Bar Designer</strong> creates crisp vector skill bars, completion meters, and infographic gauges for resumes, CVs, dashboards, and reports:</p><ul><li><strong>71 Built-In Styles:</strong> Filter presets across <em>Modern</em>, <em>Gradient</em>, <em>Striped</em>, <em>Segmented</em>, <em>Glass &amp; Neon</em>, <em>Minimal</em>, and <em>Corporate</em> categories.</li><li><strong>Live Preview Banner:</strong> Every adjustment updates the top preview bar in real time before you insert or apply changes.</li></ul>'
                },
                {
                    id: 'percentage',
                    title: 'Setting Percentage & Interactive Adjustment',
                    body: '<p>Adjust the completion percentage inside the modal or directly on the canvas:</p><ul><li><strong>Modal Slider:</strong> Drag the <strong>Percentage (0% - 100%)</strong> slider to set the initial fill level.</li><li><strong>On-Canvas Scroll &amp; Drag:</strong> After inserting a progress bar, hover over it and scroll your mouse wheel (or drag its fill handle) to adjust the percentage live on the page.</li><li><strong>Double-Click to Re-Edit:</strong> Double-click any progress bar on the canvas to reopen the full Progress Bar Designer.</li></ul>'
                },
                {
                    id: 'customization',
                    title: 'Colors, Height, Corner Radius & Labels',
                    body: '<p>Tailor every visual detail of your progress bar:</p><ul><li><strong>Fill, Track &amp; Label Colors:</strong> Pick quick color swatches or click the rainbow custom color button to open the full <em>Custom Color Picker</em>.</li><li><strong>Bar Height &amp; Shape:</strong> Choose bar thickness (<code>12px</code> to <code>44px</code>) and corner style (<em>Pill / Rounded</em>, <em>Soft</em>, or <em>Sharp Square</em>).</li><li><strong>Percentage Label Placement:</strong> Display the percentage <em>Inside Fill</em>, <em>Right End</em>, <em>Centered</em>, or <em>Hidden</em>.</li></ul>'
                }
            ]
        },

        'charts': {
            title: 'Charts & Graphs Studio Help',
            buttonTitle: 'Charts & Graphs Studio Help',
            topics: [
                {
                    id: 'types',
                    title: '9 Vector Chart & Graph Types',
                    body: '<p>The <strong>Charts &amp; Graphs Studio</strong> generates pure vector SVG data visualizations directly on your publication page:</p><ul><li><strong>9 Chart Formats:</strong> Switch instantly between <strong>Pie Chart</strong>, <strong>Donut Chart</strong>, <strong>Vertical Column</strong>, <strong>Horizontal Bar</strong>, <strong>Line Graph</strong>, <strong>Area Chart</strong>, <strong>Semi-Circle Gauge</strong>, <strong>Stacked Column</strong>, and <strong>Radar / Spider</strong> charts.</li><li><strong>Double-Click Re-Editing:</strong> Every chart stores its underlying dataset inside the element so you can double-click any chart on the canvas to edit values or switch chart types later.</li></ul>'
                },
                {
                    id: 'data',
                    title: 'Managing Data Rows & Paste CSV / TSV',
                    body: '<p>Build your dataset manually or import spreadsheet rows:</p><ul><li><strong>Add &amp; Remove Rows:</strong> Click <strong>+ Add Row</strong> to append new data points, edit the <em>Label</em> and numeric <em>Value</em>, or click the red trash icon to remove a row.</li><li><strong>Paste CSV / TSV:</strong> Click <strong>Paste CSV / TSV</strong> in the bottom-left corner to paste two-column comma- or tab-separated spreadsheet data directly into the chart.</li><li><strong>Per-Row Color Swatches:</strong> Click any row color swatch to assign a custom brand color to that series or slice.</li></ul>'
                },
                {
                    id: 'display',
                    title: 'Chart Title, Legend & Data Labels',
                    body: '<p>Configure how readers interpret your chart:</p><ul><li><strong>Chart Title:</strong> Enter a descriptive heading in the <strong>Chart Title</strong> input at the top of the studio.</li><li><strong>Show Legend &amp; Show Data Labels:</strong> Toggle the color key legend and on-chart percentage/value labels using the checkboxes above the data table.</li></ul>'
                }
            ]
        },

        'watermark': {
            title: 'Document Watermark Studio Help',
            buttonTitle: 'Document Watermark Studio Help',
            topics: [
                {
                    id: 'modes',
                    title: 'Presets, Custom Text & Image Logo Modes',
                    body: '<p>The <strong>Document Watermark Studio</strong> stamps non-intrusive background or foreground watermarks across your publication:</p><ul><li><strong>Presets Tab:</strong> Choose one-click standard stamps including <code>DRAFT</code>, <code>CONFIDENTIAL</code>, <code>SAMPLE</code>, <code>DO NOT COPY</code>, <code>URGENT</code>, <code>PAID STAMP</code>, <code>COPY</code>, <code>PROOF</code>, and repeating <code>SECURITY TILE</code>.</li><li><strong>Custom Text Tab:</strong> Type your own watermark wording and customize its font family, color, and stamp border.</li><li><strong>Image Logo Tab:</strong> Upload a company logo, crest, or emblem image to display as a translucent page watermark.</li></ul>'
                },
                {
                    id: 'layout',
                    title: 'Opacity / Density & Watermark Scale',
                    body: '<p>Fine-tune watermark visibility in the <strong>Live Page Preview</strong>:</p><ul><li><strong>Opacity / Density:</strong> Drag the opacity slider to keep background stamps subtle (e.g. <code>10% - 20%</code>) so body text above remains effortless to read.</li><li><strong>Watermark Scale:</strong> Scale the stamp from a compact badge (<code>50%</code>) up to full-page span (<code>150%+</code>).</li></ul>'
                },
                {
                    id: 'scope',
                    title: 'Pages to Apply & Layer Placement',
                    body: '<p>Control which pages receive the watermark and how it stacks with page content:</p><ul><li><strong>Pages to Apply:</strong> Apply to <strong>All Pages</strong>, <strong>Except Cover</strong> (skips Page 1), <strong>First Only</strong> (Page 1 only), or <strong>Current</strong> (active page only).</li><li><strong>Layer Placement:</strong> Choose <strong>Behind Content</strong> (classic background watermark) or <strong>Over Content</strong> (protective foreground stamp).</li></ul>'
                }
            ]
        },

        'advertisements': {
            title: 'Advertisement & Badge Studio Help',
            buttonTitle: 'Advertisement Badge Studio Help',
            topics: [
                {
                    id: 'presets',
                    title: '50 Vector Promotional Badges & Banners',
                    body: '<p>The <strong>Advertisement &amp; Promotional Badge Studio</strong> provides 50 pure-SVG retail bursts, seals, ribbons, price tags, and promotional banners:</p><ul><li><strong>Category Filters &amp; Search:</strong> Filter by <em>Starbursts</em>, <em>Ribbons</em>, <em>Seals &amp; Stamps</em>, <em>Tags &amp; Labels</em>, and <em>Banners</em>, or search by keyword.</li><li><strong>Double-Click Re-Editing:</strong> Double-click any inserted advertisement badge on the canvas to reopen the studio with all text, colors, and offsets preserved.</li></ul>'
                },
                {
                    id: 'text-typography',
                    title: 'Headline, Subtext & Color Palettes',
                    body: '<p>Customize your promotional message with live SVG previewing:</p><ul><li><strong>Primary Headline &amp; Subtext:</strong> Type your main offer (e.g. <code>50% OFF</code>, <code>GRAND OPENING</code>) and secondary subtext, and choose from bold display font families.</li><li><strong>Curated Palettes &amp; Custom Colors:</strong> Click any two-tone palette chip or use the <strong>Custom Solid</strong> picker to match your flyer color scheme.</li></ul>'
                },
                {
                    id: 'positioning',
                    title: 'Interactive Drag Positioning & Text Condensing',
                    body: '<p>Fit long headlines neatly inside angled ribbons, starbursts, or circular seals:</p><ul><li><strong>Drag inside Live Preview:</strong> Click and drag the text directly inside the Live Preview box to nudge its X/Y position, or click <strong>Reset Position</strong> to re-center.</li><li><strong>Line Gap &amp; Text Width:</strong> Use the <strong>Line Gap</strong> slider to tighten vertical spacing between headline and subtext, and the <strong>Text Width (50% - 140%)</strong> slider to condense wide headlines horizontally so they stay inside the badge border.</li></ul>'
                }
            ]
        },

        'coupons': {
            title: 'Coupons & Tear-Offs Help',
            buttonTitle: 'Coupons & Tear-Offs Help',
            topics: [
                {
                    id: 'templates',
                    title: '12 Ready-to-Print Coupon & Ticket Templates',
                    body: '<p>The <strong>Insert Coupon / Tear-off</strong> gallery includes 12 structured promotional vouchers and event tickets:</p><ul><li><strong>Included Designs:</strong> Choose from <em>Classic Scissors Cut-Out</em>, <em>Pull-Tab Tear-Off Flyer Strip</em>, <em>Buy One Get One (BOGO)</em>, <em>Gift Certificate</em>, <em>Flash Sale Code</em>, <em>Punch Loyalty Card</em>, <em>VIP Event Pass</em>, and <em>Numbered Raffle Ticket</em>.</li><li><strong>One-Click Placement:</strong> Click any template card to insert the complete dashed-border coupon onto your page.</li></ul>'
                },
                {
                    id: 'customizing',
                    title: 'Editing Offers, Expiration Dates & Barcodes',
                    body: '<p>Every inserted coupon is fully customizable on the canvas:</p><ul><li><strong>Edit Text In-Place:</strong> Click inside the coupon to update discount amounts, promo codes, terms &amp; conditions, and expiration dates.</li><li><strong>Add QR Codes or Logos:</strong> Pair your coupon with <em>Insert -&gt; QR Code</em> or <em>Business Info</em> to embed a scannable redemption link and store address.</li></ul>'
                },
                {
                    id: 'printing',
                    title: 'Multi-Up Sheet Printing',
                    body: '<p>Print multiple coupons, vouchers, or tickets on a single sheet of paper:</p><ul><li><strong>Card Sheet Multi-Up Print:</strong> When designing standalone coupons or tickets, use <em>File -&gt; Card Sheet</em> (or <em>Print Multiple Copies per Sheet</em>) to tile 8, 10, or 12 copies per page with optional trim crop marks.</li></ul>'
                }
            ]
        },

        'qr-code': {
            title: 'QR Code Generator Help',
            buttonTitle: 'QR Code Generator Help',
            topics: [
                {
                    id: 'encoding',
                    title: 'Encoding URLs, Text & Contact Links',
                    body: '<p>The <strong>Generate QR Code</strong> tool creates high-resolution scannable QR codes directly on your page:</p><ul><li><strong>Supported Content:</strong> Enter any website URL (<code>https://...</code>), plain text message, email link (<code>mailto:...</code>), phone number (<code>tel:...</code>), or Wi-Fi/event string.</li><li><strong>Crisp Print Output:</strong> QR modules are rendered at high resolution so smartphone cameras can scan them reliably from printed flyers, posters, and business cards.</li></ul>'
                },
                {
                    id: 'styling',
                    title: 'Custom Foreground/Background Colors & Shapes',
                    body: '<p>Style your QR code to complement your publication design:</p><ul><li><strong>Foreground &amp; Background Swatches:</strong> Pick custom dark foreground and light background colors using the integrated <em>Custom Color Picker</em>.</li><li><strong>Frame Shapes:</strong> Choose between <strong>Standard Square</strong>, <strong>Rounded Corners</strong>, or a <strong>Circular Badge</strong> container.</li><li><strong>Scanning Tip:</strong> Always maintain strong contrast (a dark foreground color against a light background color) to ensure fast camera recognition.</li></ul>'
                }
            ]
        },

        'tables': {
            title: 'Tables & Table Styles Help',
            buttonTitle: 'Tables & Table Styles Help',
            topics: [
                {
                    id: 'creating',
                    title: 'Inserting Custom & Styled Tables',
                    body: '<p>Open Publisher provides flexible tools for creating data tables, schedules, price lists, and calendars:</p><ul><li><strong>Insert Custom Table:</strong> Specify exact <em>Rows</em> and <em>Columns</em> (up to 50x20) to drop a clean grid onto your canvas.</li><li><strong>Styled Tables Gallery:</strong> Open <strong>Styled Tables</strong> to browse pre-designed table templates with coordinated header fills, alternating row banding, and typography.</li></ul>'
                },
                {
                    id: 'editing',
                    title: 'Rows, Columns, Merging & Cell Alignment',
                    body: '<p>Click inside any table cell to reveal the contextual <strong>Table Tools (Design &amp; Layout)</strong> tabs and right-click menu:</p><ul><li><strong>Row &amp; Column Management:</strong> Insert rows above/below, insert columns left/right, delete rows/columns, or distribute row heights and column widths evenly.</li><li><strong>Merge &amp; Split Cells:</strong> Highlight multiple cells and right-click to merge them into a spanning header banner, or split an existing cell.</li><li><strong>9-Point Cell Alignment &amp; Padding:</strong> Align cell text Top/Middle/Bottom and Left/Center/Right, and adjust cell padding margins.</li></ul>'
                },
                {
                    id: 'borders-conversion',
                    title: 'Table Borders & Convert Table to Text',
                    body: '<p>Fine-tune gridlines or convert tabular data into paragraphs:</p><ul><li><strong>Table Borders:</strong> Customize border thickness (<code>px</code>), line style (Solid, Dashed, Dotted, Double), and color across the entire table or selected cells.</li><li><strong>Convert Table to Text:</strong> Turn table rows into clean plain-text lines separated by <em>Tabs</em>, <em>Commas</em>, <em>Paragraphs</em>, or a custom delimiter.</li></ul>'
                }
            ]
        },

        'business-info': {
            title: 'Business Information Manager Help',
            buttonTitle: 'Business Information Help',
            topics: [
                {
                    id: 'profile',
                    title: 'Storing Reusable Business Profile Fields',
                    body: '<p>The <strong>Edit Business Information</strong> dialog stores your organization or personal contact profile in local storage so you can drop consistent branding into any publication:</p><ul><li><strong>Saved Fields:</strong> Store your <em>Individual Name</em>, <em>Job Title / Position</em>, <em>Organization Name</em>, <em>Street Address</em>, <em>Phone / Fax / Email</em>, <em>Tagline / Motto</em>, and <em>Company Logo</em>.</li><li><strong>Persistent Across Projects:</strong> Once saved, your business details remain available across all new documents and templates.</li></ul>'
                },
                {
                    id: 'inserting',
                    title: 'Inserting Individual Fields vs. Composite Blocks',
                    body: '<p>Click <strong>Insert -&gt; Business Info</strong> on the ribbon to insert your saved information:</p><ul><li><strong>Single Fields:</strong> Drop just your Organization Name, Phone/Email, Address, Tagline, or Logo as a standalone element.</li><li><strong>Composite Layouts:</strong> Insert a complete pre-arranged <strong>Letterhead Header</strong>, <strong>Signature Block</strong>, or <strong>Business Card Layout</strong> with one click.</li></ul>'
                }
            ]
        },

        'symbols': {
            title: 'Symbols & Special Characters Help',
            buttonTitle: 'Insert Symbol Help',
            topics: [
                {
                    id: 'browsing',
                    title: 'Typography, Currency, Math & Accented Symbols',
                    body: '<p>The <strong>Insert Symbol</strong> dialog provides one-click access to special typographic characters that are not directly visible on a standard keyboard:</p><ul><li><strong>Symbol Categories:</strong> Includes typographic punctuation (<code>&copy;</code>, <code>&reg;</code>, <code>&trade;</code>, <code>&sect;</code>, <code>&para;</code>, <code>&bull;</code>, <code>&hellip;</code>), international currency symbols (<code>&euro;</code>, <code>&pound;</code>, <code>&yen;</code>, <code>&cent;</code>), mathematical operators (<code>&plusmn;</code>, <code>&times;</code>, <code>&divide;</code>, <code>&infin;</code>, <code>&ne;</code>), fractions, and arrows.</li></ul>'
                },
                {
                    id: 'inserting',
                    title: 'Inserting at Cursor vs. New Text Box',
                    body: '<p>Click any character tile in the symbol grid to insert it immediately:</p><ul><li><strong>Active Text Cursor:</strong> If you were editing a text box or table cell before opening the dialog, the symbol is inserted directly at your caret position.</li><li><strong>Standalone Insertion:</strong> If no text box is active, Open Publisher automatically creates a new text box containing the selected symbol.</li></ul>'
                }
            ]
        },

        'ai-studio': {
            title: 'OpenPublisher AI Studio Help',
            buttonTitle: 'OpenPublisher AI Studio Help',
            topics: [
                {
                    id: 'layout-tab',
                    title: 'Tab 1: Page Layout & Command Assistant',
                    body: '<p>The <strong>Page Layout</strong> tab turns natural-language descriptions into complete multi-element desktop publishing layouts or executes app commands:</p><ul><li><strong>Full Page Generation:</strong> Describe a flyer, poster, menu, certificate, or newsletter (or click a <em>Quick ideas</em> chip) to generate coordinated headings, styled text boxes, badges, tables, and backgrounds.</li><li><strong>Clear vs. Append:</strong> Enable <em>Clear current page elements before generating layout</em> to start fresh, or leave it unchecked to add elements to your current page.</li></ul>'
                },
                {
                    id: 'image-tab',
                    title: 'Tab 2: AI Image Generator (FLUX.1 Photos & Art)',
                    body: '<p>The <strong>AI Image (Photo &amp; Art)</strong> tab generates high-resolution photographic and artistic raster visuals:</p><ul><li><strong>Style Presets:</strong> Enhance your prompt with one-click style chips such as <em>Photorealistic</em>, <em>Watercolor</em>, <em>3D Render</em>, <em>Vintage Poster</em>, or <em>Cinematic</em>.</li><li><strong>Placement &amp; Auto-Cutout:</strong> Choose <strong>Insert as Canvas Picture</strong> (with optional <strong>Transparent background</strong> auto-cutout for stickers and isolated subjects) or <strong>Set as Page Background</strong>.</li></ul>'
                },
                {
                    id: 'vector-tab',
                    title: 'Tab 3: AI Vector (Razor-Sharp Editable SVG)',
                    body: '<p>The <strong>AI Vector (Crisp SVG)</strong> tab generates scalable mathematical vector graphics with transparent backgrounds:</p><ul><li><strong>Infinite Print Sharpness:</strong> SVG graphics never pixelate at any zoom level or print size, making them ideal for logos, icons, clipart, emblems, and flat illustrations.</li><li><strong>Recolorable Paths:</strong> After inserting an AI Vector, select it and open <strong>CSS Colors &amp; Style</strong> to recolor individual vector shapes and gradients.</li></ul>'
                },
                {
                    id: 'shortcuts-undo',
                    title: 'Prompt Tips, Keyboard Shortcuts & 1-Click Undo',
                    body: '<p>Work faster inside OpenPublisher AI Studio:</p><ul><li><strong>Keyboard Shortcut:</strong> Press <code>Ctrl + Enter</code> (or <code>Cmd + Enter</code> on Mac) inside any prompt box to start generation immediately.</li><li><strong>1-Click Undo AI Action:</strong> After any generation, click the <strong>Undo AI Action</strong> button in the bottom-left corner of the studio (or press <code>Ctrl + Z</code>) to revert the entire AI step cleanly.</li></ul>'
                }
            ]
        },

        'picture-frame': {
            title: 'Picture Frame & Borders Studio Help',
            buttonTitle: 'Picture Frame & Borders Help',
            topics: [
                {
                    id: 'styles',
                    title: 'Gallery, Wood, Gold & Artistic Frame Presets',
                    body: '<p>The <strong>Picture Frame &amp; Borders</strong> studio surrounds any selected photo or clipart illustration with realistic framing:</p><ul><li><strong>Preset Materials:</strong> Choose from <em>Classic Dark Wood</em>, <em>Ornate Gold Leaf</em>, <em>Brushed Silver</em>, <em>Modern Matte Black</em>, <em>White Gallery</em>, <em>Vintage Bronze</em>, <em>Polaroid Instant</em>, and <em>Postage Stamp</em> frames.</li><li><strong>Live Thumbnail Preview:</strong> Preview your actual selected photo inside the frame as you adjust sliders.</li></ul>'
                },
                {
                    id: 'controls',
                    title: 'Frame Width, Passe-Partout Mat & 3D Shadow',
                    body: '<p>Customize frame proportions and museum mounting:</p><ul><li><strong>Frame Rail Width:</strong> Drag the thickness slider to scale the outer molding from a slim border to a deep gallery frame.</li><li><strong>Inner Mat (Passe-Partout):</strong> Add an inner bevel matboard around your picture and pick a custom mat color (ivory, white, charcoal, or brand accent).</li><li><strong>3D Wall Drop Shadow &amp; Fit Mode:</strong> Toggle realistic wall depth shadow and choose whether the frame expands <em>Outside</em> or insets <em>Inside</em> the picture bounds.</li></ul>'
                }
            ]
        },

        'format-object': {
            title: 'Format Text Box & Shape Properties Help',
            buttonTitle: 'Format Object Properties Help',
            topics: [
                {
                    id: 'fills',
                    title: 'Solid, Gradient, Pattern & Picture Fills',
                    body: '<p>The <strong>Format Text Box / Format Properties</strong> dialog controls the interior background and opacity of any selected text box or shape:</p><ul><li><strong>Fill Types:</strong> Choose <strong>No Fill (Transparent)</strong>, <strong>Solid Color</strong>, <strong>Two-Color Gradient</strong> (Linear or Radial), <strong>Geometric Pattern</strong>, or <strong>Picture Texture Fill</strong>.</li><li><strong>Fill &amp; Element Opacity:</strong> Adjust background fill transparency independently so underlying page artwork shows through while keeping text 100% crisp.</li></ul>'
                },
                {
                    id: 'borders',
                    title: 'Border Style, Thickness, Radius & Effects',
                    body: '<p>Customize the outline and container geometry:</p><ul><li><strong>Border Line:</strong> Pick border color, line style (<code>Solid</code>, <code>Dashed</code>, <code>Dotted</code>, <code>Double</code>, <code>Groove</code>), and stroke width in pixels.</li><li><strong>Rounded Corners &amp; Padding:</strong> Set corner radius (<code>px</code>) for rounded cards and adjust internal text padding margins.</li><li><strong>Apply Button:</strong> Click <strong>Apply</strong> to preview your changes live on the canvas without closing the dialog.</li></ul>'
                }
            ]
        },

        'format-background': {
            title: 'Format Page Background Help',
            buttonTitle: 'Format Background Help',
            topics: [
                {
                    id: 'background-types',
                    title: 'Solid Color & Gradient Page Backgrounds',
                    body: '<p>The <strong>Format Background</strong> dialog customizes the paper background of your active page:</p><ul><li><strong>Solid Color:</strong> Click the color swatch to pick any exact hex/RGB paper tint using the <em>Custom Color Picker</em>.</li><li><strong>Two-Stop Gradient:</strong> Blend between <em>Color 1</em> and <em>Color 2</em> across <strong>Top to Bottom</strong>, <strong>Left to Right</strong>, <strong>Diagonal (135 deg)</strong>, or <strong>Radial</strong> directions.</li></ul>'
                },
                {
                    id: 'theme-studio',
                    title: 'Advanced Textures & Theme Studio',
                    body: '<p>For patterned paper textures, parchment, geometric backdrops, or multi-page background themes:</p><ul><li><strong>Page Design -&gt; Page Background:</strong> Open the <em>Page Design</em> ribbon tab to browse rich textured backgrounds and adjust Saturation, Brightness, Contrast, Hue Shift, and Pattern Zoom in the <strong>Theme Studio</strong>.</li></ul>'
                }
            ]
        },

        'css-color-studio': {
            title: 'CSS Color, Gradient & Theme Studio Help',
            buttonTitle: 'CSS Color & Gradient Studio Help',
            topics: [
                {
                    id: 'detected-colors',
                    title: 'Recoloring Detected Element & SVG Colors',
                    body: '<p>The <strong>CSS Color, Gradient &amp; Theme Studio</strong> inspects the selected canvas element (including complex multi-layer SVGs, Page Parts, and template blocks) and lists every distinct color slot found:</p><ul><li><strong>1-to-1 Color Mapping:</strong> Click any detected color swatch to replace that specific color across all matching fills, strokes, borders, and text inside the selected element.</li></ul>'
                },
                {
                    id: 'gradients-themes',
                    title: 'Custom Gradients & Preset Color Harmonies',
                    body: '<p>Apply multi-stop gradients or coordinated color harmonies:</p><ul><li><strong>Gradient Builder:</strong> Construct custom linear or radial gradients with adjustable angle and color stops.</li><li><strong>Quick Theme Palettes:</strong> Click a curated theme palette chip to re-map all colors in the selected element simultaneously while preserving contrast ratios.</li></ul>'
                }
            ]
        },

        'line-spacing': {
            title: 'Line Spacing & Paragraph Options Help',
            buttonTitle: 'Line Spacing Options Help',
            topics: [
                {
                    id: 'line-height',
                    title: 'Line Height & Paragraph Spacing',
                    body: '<p>The <strong>Line Spacing Options</strong> dialog gives you typographic control over vertical rhythm inside text boxes:</p><ul><li><strong>Line Spacing (Multiplier):</strong> Choose standard presets (<code>1.0 Single</code>, <code>1.15</code>, <code>1.5</code>, <code>2.0 Double</code>) or dial in a custom decimal multiplier.</li><li><strong>Space Before &amp; After Paragraphs:</strong> Add clean vertical padding (in points/pixels) above or below paragraphs without inserting extra blank lines.</li></ul>'
                },
                {
                    id: 'letter-spacing',
                    title: 'Character Tracking & Letter Spacing',
                    body: '<p>Adjust horizontal character density:</p><ul><li><strong>Letter Spacing:</strong> Tighten tracking slightly for large display headlines or expand letter spacing for uppercase subheadings and captions.</li></ul>'
                }
            ]
        },

        'tabs': {
            title: 'Tab Stops & Leaders Help',
            buttonTitle: 'Tabs & Tab Leaders Help',
            topics: [
                {
                    id: 'tab-stops',
                    title: 'Setting Custom Tab Stop Positions & Alignment',
                    body: '<p>The <strong>Tabs</strong> dialog configures horizontal tab stops for menus, price lists, programs, and structured columns inside text boxes:</p><ul><li><strong>Tab Stop Position:</strong> Enter a measurement along the horizontal ruler and choose <strong>Left</strong>, <strong>Center</strong>, <strong>Right</strong>, or <strong>Decimal</strong> alignment.</li></ul>'
                },
                {
                    id: 'leaders',
                    title: 'Dot, Dash & Underline Tab Leaders',
                    body: '<p>Connect left-aligned labels to right-aligned prices or page numbers automatically:</p><ul><li><strong>Leader Styles:</strong> Select <strong>None</strong>, <strong>Dots ( . . . . . )</strong>, <strong>Dashes ( - - - - - )</strong>, or <strong>Solid Underline ( _____ )</strong> to fill the horizontal tab span cleanly.</li></ul>'
                }
            ]
        },

        'text-columns': {
            title: 'Text Columns & Linked Text Flow Help',
            buttonTitle: 'Text Columns & Flow Help',
            topics: [
                {
                    id: 'columns',
                    title: 'Multi-Column Text Boxes (1 to 5 Columns)',
                    body: '<p>The <strong>Text Columns</strong> dialog divides a single text frame into newspaper-style balanced vertical columns:</p><ul><li><strong>Column Count:</strong> Set between <code>1</code> and <code>5</code> columns. Text flows automatically from the bottom of column 1 to the top of column 2 inside the same frame.</li></ul>'
                },
                {
                    id: 'linked-flow',
                    title: 'Linked Text Boxes & Story Overflow',
                    body: '<p>Chain multiple text boxes across the same page or across different pages:</p><ul><li><strong>Create Text Link:</strong> When a text box overflows, click its bottom-right overflow indicator (or use <em>Text Box Tools -&gt; Create Link</em>) and click another text box to pour overflowing text into it automatically.</li><li><strong>Deleting Linked Boxes:</strong> When deleting a linked box, Open Publisher lets you preserve its text inside the remaining story chain.</li></ul>'
                }
            ]
        },

        'crop-rotation': {
            title: 'Crop to Shape & Exact Rotation Help',
            buttonTitle: 'Crop & Rotation Help',
            topics: [
                {
                    id: 'crop-shape',
                    title: 'Masking Pictures with Crop to Shape',
                    body: '<p><strong>Crop to Shape</strong> clips any selected photograph or illustration into a clean geometric vector silhouette:</p><ul><li><strong>Available Silhouettes:</strong> Mask images into a <em>Circle / Oval</em>, <em>Rounded Rectangle</em>, <em>Diamond</em>, <em>Triangle</em>, <em>Hexagon</em>, <em>Octagon</em>, <em>Star</em>, <em>Heart</em>, or <em>Arrow</em>, or choose <em>Reset (Rectangle)</em> to restore the full unclipped frame.</li></ul>'
                },
                {
                    id: 'rotation',
                    title: 'Numerical Exact Rotation',
                    body: '<p>The <strong>Exact Rotation</strong> dialog rotates the selected element to a precise angle in degrees (<code>-360 deg</code> to <code>360 deg</code>):</p><ul><li><strong>Precision Layout:</strong> Ideal for matching angled banners, diagonal text labels, or resetting an element back to exactly <code>0 deg</code>. For full X/Y coordinates and W/H dimensions, use <strong>Size &amp; Position</strong>.</li></ul>'
                }
            ]
        },

        'page-setup': {
            title: 'Page Setup & Document Dimensions Help',
            buttonTitle: 'Page Setup & Resize Help',
            topics: [
                {
                    id: 'paper-sizes',
                    title: 'Standard Paper Formats & Presets',
                    body: '<p>The <strong>New Document / Resize Document</strong> dialog configures your publication canvas size and orientation:</p><ul><li><strong>Standard Print Presets:</strong> Choose from <em>A3</em>, <em>A4</em>, <em>A5</em>, <em>US Letter</em>, <em>US Legal</em>, <em>Tabloid (11x17")</em>, <em>Business Card (3.5x2")</em>, <em>Postcard (6x4")</em>, <em>Greeting Card</em>, and social/web formats.</li><li><strong>Orientation:</strong> Toggle between <strong>Portrait</strong> and <strong>Landscape</strong> at any time.</li></ul>'
                },
                {
                    id: 'custom-dpi',
                    title: 'Custom Dimensions, Units & Print DPI',
                    body: '<p>Define exact custom paper measurements:</p><ul><li><strong>Measurement Units:</strong> Enter dimensions in <em>Millimeters (mm)</em>, <em>Centimeters (cm)</em>, <em>Inches (in)</em>, or <em>Pixels (px)</em>.</li><li><strong>Resolution (DPI):</strong> Configure canvas scaling and print export quality across <code>96 DPI</code> (Screen), <code>150 DPI</code> (Draft Print), or <code>300 DPI</code> (Commercial High-Res Print).</li></ul>'
                }
            ]
        },

        'margins-guides': {
            title: 'Margins, Grid & Baseline Guides Help',
            buttonTitle: 'Margins & Guides Help',
            topics: [
                {
                    id: 'margins',
                    title: 'Custom Page Margins (Top, Bottom, Left, Right)',
                    body: '<p>The <strong>Custom Margins</strong> dialog defines the printable safe area inside your page edges:</p><ul><li><strong>Independent Sides:</strong> Set exact Top, Bottom, Left, and Right margin distances in your active ruler unit.</li><li><strong>Visual Margin Guides:</strong> Margin boundaries appear on screen as non-printing guide lines and work seamlessly with <em>Snap To -&gt; Guides</em>.</li></ul>'
                },
                {
                    id: 'grid-baselines',
                    title: 'Grid Intervals & Typography Baseline Guides',
                    body: '<p>The <strong>Grid and Baseline Guides</strong> dialog configures underlying layout grids:</p><ul><li><strong>Grid Spacing:</strong> Set horizontal and vertical grid intervals for modular column and card alignment.</li><li><strong>Baseline Guides:</strong> Configure horizontal baseline intervals and offsets so multi-column body text aligns across adjacent frames.</li></ul>'
                }
            ]
        },

        'card-sheet': {
            title: 'Multi-Up Card Sheet Printing Help',
            buttonTitle: 'Card Sheet Printing Help',
            topics: [
                {
                    id: 'multi-up',
                    title: 'Tiling Business Cards, Tickets & Labels per Sheet',
                    body: '<p>The <strong>Print Multiple Copies per Sheet</strong> (Card Sheet) studio tiles small-format publications (such as Business Cards, Coupons, Name Tags, or Tickets) onto a full sheet of paper:</p><ul><li><strong>Sheet Presets:</strong> Choose <strong>10-Up (2 x 5 Standard Business Card)</strong>, <strong>12-Up (2 x 6 or 3 x 4)</strong>, <strong>8-Up (2 x 4)</strong>, or define a <strong>Custom Columns x Rows</strong> grid.</li><li><strong>Target Paper Size:</strong> Output onto standard <strong>A4</strong> or <strong>US Letter</strong> sheets.</li></ul>'
                },
                {
                    id: 'crop-duplex',
                    title: 'Crop Trim Marks & Front/Back Duplex Alignment',
                    body: '<p>Prepare sheets for accurate guillotine or craft-knife trimming:</p><ul><li><strong>Print Cut / Crop Marks:</strong> Adds corner trim ticks around the outer perimeter of the tiled grid without drawing lines across the card artwork.</li><li><strong>Duplex (2-Sided) Support:</strong> Automatically mirrors back-side column placement on 2-page card designs so front and back register accurately when printed double-sided.</li></ul>'
                }
            ]
        },

        'export-template': {
            title: 'Export Template Package Help',
            buttonTitle: 'Export Template Package Help',
            topics: [
                {
                    id: 'metadata',
                    title: 'Template Title, Category & Author Metadata',
                    body: '<p>The <strong>Export Template Package</strong> studio packages your current publication as a reusable template with rich gallery metadata:</p><ul><li><strong>Template Details:</strong> Specify the <em>Template Name</em>, target <em>Category</em> (Flyer, Brochure, Newsletter, Business Card, Resume, etc.), and optional description or author credit.</li></ul>'
                },
                {
                    id: 'thumbnail',
                    title: 'Live Page Thumbnail & Package Export',
                    body: '<p>Open Publisher automatically captures a high-resolution preview thumbnail of your active page:</p><ul><li><strong>Export Package:</strong> Click <strong>Export Package</strong> to download the template bundle ready for local reuse or submission to the Open Publisher template repository.</li></ul>'
                }
            ]
        },

        'export-html-image': {
            title: 'Export as HTML, Image & Save As Help',
            buttonTitle: 'Export & Save Options Help',
            topics: [
                {
                    id: 'html-export',
                    title: 'Advanced HTML & Web Export',
                    body: '<p><strong>Advanced HTML Export</strong> converts your publication into a self-contained web document:</p><ul><li><strong>Standalone vs. Offline Assets:</strong> Choose whether to link Google Fonts and web assets or embed fonts and images inline for 100% offline viewing in any browser.</li><li><strong>Responsive &amp; Print Styles:</strong> Preserves exact page dimensions, variable font axes, and vector SVG graphics.</li></ul>'
                },
                {
                    id: 'image-export',
                    title: 'High-Resolution Image Export (PNG, JPEG, WebP)',
                    body: '<p><strong>Export as Image</strong> rasterizes your active page or all pages into crisp image files:</p><ul><li><strong>Formats &amp; Quality:</strong> Choose lossless <strong>PNG</strong>, high-efficiency <strong>WebP</strong>, or <strong>JPEG</strong> with customizable resolution scaling (1x, 2x, or 300 DPI print quality).</li></ul>'
                },
                {
                    id: 'save-as',
                    title: 'Saving .opub Project Files',
                    body: '<p><strong>Save As</strong> downloads your complete editable project as an <code>.opub</code> file:</p><ul><li><strong>100% Editable State:</strong> Preserves all pages, master pages, custom uploaded variable fonts, puzzle configurations, table styles, and metadata.</li></ul>'
                }
            ]
        },

        'protect-document': {
            title: 'Protect Document (Encryption) Help',
            buttonTitle: 'Protect Document Help',
            topics: [
                {
                    id: 'encryption',
                    title: 'Password-Protecting .opub Publications',
                    body: '<p>The <strong>Protect Document</strong> dialog secures your saved <code>.opub</code> publication files with strong browser-native encryption:</p><ul><li><strong>Set or Update Password:</strong> Enter a password and confirm it. The next time you save your project, its contents are encrypted so a password is required to open the file.</li><li><strong>Remove Protection:</strong> Leave the password fields blank (or click remove protection) and re-save to return the document to an unencrypted file.</li></ul>'
                },
                {
                    id: 'decryption',
                    title: 'Opening a Protected Document',
                    body: '<p>When opening an encrypted <code>.opub</code> file, the <strong>Protected Document</strong> prompt asks for your password:</p><ul><li><strong>Zero Server Uploads:</strong> All encryption and decryption happen 100% locally on your device inside your browser.</li></ul>'
                }
            ]
        },

        'document-info': {
            title: 'Document Info, Properties & Inspector Help',
            buttonTitle: 'Document Info & Inspector Help',
            topics: [
                {
                    id: 'info-checker',
                    title: 'Document Info & Integrated Design Checker',
                    body: '<p>The <strong>Document Info</strong> modal summarizes your publication specifications and runs the <strong>Design Checker</strong>:</p><ul><li><strong>Publication Summary:</strong> Displays page count, paper format, orientation, element count, and security status.</li><li><strong>Design Checker Diagnostics:</strong> Automatically scans all pages for <em>Text Overflow</em>, <em>Low-Resolution Stretched Pictures</em>, and <em>Off-Page Objects</em>, with one-click <strong>Locate Element</strong> buttons.</li></ul>'
                },
                {
                    id: 'properties-inspector',
                    title: 'Document Properties & Privacy Inspector',
                    body: '<p>Manage publication metadata and inspect hidden data before sharing:</p><ul><li><strong>Document Properties:</strong> Edit the publication <em>Title</em>, <em>Author</em>, <em>Subject</em>, <em>Keywords / Tags</em>, and <em>Comments</em> embedded inside saved files and PDF exports.</li><li><strong>Document Inspector:</strong> Scans for and optionally scrubs hidden metadata, page notes, off-canvas scratch elements, and author properties before publishing.</li></ul>'
                }
            ]
        },

        'writers-suite': {
            title: "Writer's Suite & Word Count Help",
            buttonTitle: "Writer's Suite & Proofing Help",
            topics: [
                {
                    id: 'word-count',
                    title: 'Word Count & Document Statistics',
                    body: '<p><strong>Word Count</strong> and <strong>Text Statistics</strong> analyze text across your selected text box or entire publication:</p><ul><li><strong>Detailed Counts:</strong> Reports total <em>Words</em>, <em>Characters (with and without spaces)</em>, <em>Sentences</em>, <em>Paragraphs</em>, and <em>Estimated Reading / Speaking Time</em>.</li></ul>'
                },
                {
                    id: 'readability-style',
                    title: 'Readability, Tone, Passive Voice & Conciseness',
                    body: '<p>The <strong>Review -&gt; Analysis Suite</strong> provides 11 editorial diagnostics for copywriters and students:</p><ul><li><strong>Readability &amp; Jargon:</strong> Calculates Flesch-Kincaid reading grade level and flags overly complex multi-syllable jargon.</li><li><strong>Passive Voice, Conciseness &amp; Echoes:</strong> Highlights passive verb constructions, wordy phrases, and repeated words in close proximity.</li><li><strong>Tone, Sentiment, Keywords &amp; Cadence:</strong> Evaluates emotional polarity, top SEO keyword density, and sentence length rhythm.</li></ul>'
                }
            ]
        },

        'options': {
            title: 'Open Publisher Options Help',
            buttonTitle: 'Application Options Help',
            topics: [
                {
                    id: 'general-display',
                    title: 'General, Display & Classic Publisher Cursors',
                    body: '<p>The <strong>Options</strong> dialog configures global workspace preferences across Open Publisher:</p><ul><li><strong>Units &amp; Rulers:</strong> Choose default measurement units (Millimeters, Centimeters, Inches, or Pixels) and ruler subdivisions.</li><li><strong>Classic Drag Cursors:</strong> Toggle classic desktop-publishing move-truck and crosshair cursors, scratch area visibility, and UI theme accents.</li></ul>'
                },
                {
                    id: 'save-proofing-ribbon',
                    title: 'Save/Recovery, Proofing & Customize Ribbon',
                    body: '<p>Tailor auto-save behavior, spellcheck, and ribbon layout:</p><ul><li><strong>Auto-Save &amp; Local Recovery:</strong> Configure automatic browser local-storage snapshots so work is recoverable after an accidental tab close or power cut.</li><li><strong>Proofing &amp; Customize Ribbon:</strong> Toggle live spellcheck underlines and show or hide individual ribbon tabs and command groups.</li></ul>'
                }
            ]
        },

        'import-documents': {
            title: 'Document & Batch Image Import Help',
            buttonTitle: 'Document Import Help',
            topics: [
                {
                    id: 'doc-pub-pdf',
                    title: 'Importing Publisher (.pub), Word (.docx) & PDF Files',
                    body: '<p>Open Publisher can import existing desktop publishing and office documents via <em>File -&gt; Open</em>:</p><ul><li><strong>Editable Layout Mode:</strong> Reconstructs text boxes, headings, images, and page dimensions as editable canvas elements.</li><li><strong>Exact Visual Fidelity Mode:</strong> Renders each page at high resolution so complex legacy layouts look identical to the original print document.</li></ul>'
                },
                {
                    id: 'spreadsheet-batch-images',
                    title: 'Importing Spreadsheets & Multiple Images',
                    body: '<p>Bring structured data tables and photo collections into your publication:</p><ul><li><strong>Import Spreadsheet:</strong> Converts CSV/Excel tabular data directly into a formatted Open Publisher table.</li><li><strong>Import Multiple Images:</strong> When selecting several image files at once, choose whether to arrange them in an automatic <strong>Contact Sheet Grid</strong> on the current page or place <strong>One Image per New Page</strong>.</li></ul>'
                }
            ]
        },

        'hyperlink-alt-notes': {
            title: 'Hyperlinks, Alt Text & Page Notes Help',
            buttonTitle: 'Dialog Help',
            topics: [
                {
                    id: 'hyperlinks',
                    title: 'Adding Web & Email Hyperlinks',
                    body: '<p>The <strong>Add Hyperlink</strong> dialog attaches a clickable web URL (<code>https://...</code>) or email address (<code>mailto:...</code>) to highlighted text or a selected object:</p><ul><li><strong>Export Support:</strong> Links remain clickable when exported to <strong>HTML</strong> and <strong>PDF</strong>.</li></ul>'
                },
                {
                    id: 'alt-text-notes',
                    title: 'Accessibility Alt Text & Page Notes',
                    body: '<p>Enhance accessibility and editorial collaboration:</p><ul><li><strong>Alt Text:</strong> Assign descriptive alternative text to pictures, charts, and shapes so screen readers and the <em>Accessibility Checker</em> can describe visuals accurately.</li><li><strong>Page Notes &amp; Master Headers:</strong> Attach non-printing editorial reminders to any page via the page minimap, or jump to the <strong>Master Page</strong> to edit repeating headers and footers.</li></ul>'
                }
            ]
        },

        'desktop-app': {
            title: 'Desktop App & Offline Use Help',
            buttonTitle: 'Desktop App Help',
            topics: [
                {
                    id: 'packages',
                    title: 'Windows, macOS & Linux Desktop Packages',
                    body: '<p>The <strong>Download Open Publisher Desktop App</strong> modal lets you install Open Publisher as a dedicated desktop application:</p><ul><li><strong>Native Installers &amp; PWA:</strong> Download standalone packages for Windows (<code>.exe</code> / <code>.msi</code>), Linux (<code>.AppImage</code> / <code>.deb</code>), or install directly via your browser PWA prompt.</li></ul>'
                },
                {
                    id: 'privacy',
                    title: 'Local Processing & Offline Architecture',
                    body: '<p>How Open Publisher handles your files:</p><ul><li><strong>100% Local File Processing:</strong> Your <code>.opub</code> projects, PDF exports, and encrypted documents are processed locally on your device with no server uploads.</li></ul>'
                }
            ]
        }
    };

    // Map normalized dialog titles (stripped of HTML tags) to catalog keys
    const TITLE_TO_KEY_MAP = {
        'insert page part': 'page-parts',
        'page parts': 'page-parts',
        'publication templates': 'templates',
        'insert template into page': 'templates',
        'use template': 'templates',
        'clipart gallery': 'clipart-gallery',
        'emojis': 'emojis',
        'wordart gallery (legacy)': 'wordart-legacy',
        'wordart gallery': 'wordart-legacy',
        'create wordart': 'wordart-beta',
        'insert progress bar': 'progress-bar',
        'edit progress bar': 'progress-bar',
        'insert pie chart or graph': 'charts',
        'edit chart & graph': 'charts',
        'document watermark': 'watermark',
        'advertisement & promotional badge studio': 'advertisements',
        'edit advertisement badge': 'advertisements',
        'advertisement templates': 'advertisements',
        'edit ad text': 'advertisements',
        'insert coupon / tear-off': 'coupons',
        'generate qr code': 'qr-code',
        'insert custom table': 'tables',
        'styled tables': 'tables',
        'table borders': 'tables',
        'convert table to text': 'tables',
        'edit business information': 'business-info',
        'insert symbol': 'symbols',
        'openpublisher ai studio': 'ai-studio',
        'picture frame & borders': 'picture-frame',
        'format text box': 'format-object',
        'format properties': 'format-object',
        'format background': 'format-background',
        'css color, gradient & theme studio': 'css-color-studio',
        'line spacing options': 'line-spacing',
        'tabs': 'tabs',
        'text columns': 'text-columns',
        'delete linked text box': 'text-columns',
        'crop to shape': 'crop-rotation',
        'exact rotation': 'crop-rotation',
        'resize document': 'page-setup',
        'new document': 'page-setup',
        'spreads recommended': 'page-setup',
        'custom margins': 'margins-guides',
        'grid and baseline guides': 'margins-guides',
        'print multiple copies per sheet': 'card-sheet',
        'print card options': 'card-sheet',
        'card sheet printing': 'card-sheet',
        'export template package': 'export-template',
        'advanced html export': 'export-html-image',
        'export as image': 'export-html-image',
        'save as': 'export-html-image',
        'protect document': 'protect-document',
        'protected document': 'protect-document',
        'document info': 'document-info',
        'document properties': 'document-info',
        'document inspector': 'document-info',
        'word count': 'writers-suite',
        'readability score': 'writers-suite',
        'tone analyzer': 'writers-suite',
        'conciseness suggestions': 'writers-suite',
        'text statistics': 'writers-suite',
        'estimated reading time': 'writers-suite',
        'passive voice detector': 'writers-suite',
        'word echoes': 'writers-suite',
        'sentiment analysis': 'writers-suite',
        'keyword density': 'writers-suite',
        'complexity & jargon': 'writers-suite',
        'sentence cadence': 'writers-suite',
        'options': 'options',
        'import options': 'import-documents',
        'import publisher file': 'import-documents',
        'import pdf document': 'import-documents',
        'import spreadsheet': 'import-documents',
        'import multiple images': 'import-documents',
        'add hyperlink': 'hyperlink-alt-notes',
        'alt text': 'hyperlink-alt-notes',
        'add page note': 'hyperlink-alt-notes',
        'edit header/footer': 'hyperlink-alt-notes',
        'download open publisher desktop app': 'desktop-app',
        'download & install': 'desktop-app',
        'install on ios': 'desktop-app'
    };

    function resolveHelpKey(titleHtml, contentHtml) {
        const cleanTitle = stripHtml(titleHtml).toLowerCase();
        if (cleanTitle && TITLE_TO_KEY_MAP[cleanTitle]) {
            return TITLE_TO_KEY_MAP[cleanTitle];
        }
        // Fallback detection for custom-header modals that pass title === ''
        if (!cleanTitle && contentHtml) {
            const c = String(contentHtml);
            if (c.indexOf('id="clipart-modal-header"') !== -1) return 'clipart-gallery';
            if (c.indexOf('id="emoji-modal-header"') !== -1) return 'emojis';
            if (c.indexOf('id="legacy-wa-modal-header"') !== -1) return 'wordart-legacy';
            if (c.indexOf('id="wa-modal-header"') !== -1) return 'wordart-beta';
        }
        return null;
    }

    function getEntry(helpKey) {
        return HELP_CATALOG[helpKey] || null;
    }

    function makeHelpDraggable(boxEl, handleEl) {
        if (!boxEl || !handleEl) return;
        let dragging = false;
        let startX = 0, startY = 0;
        let origLeft = 0, origTop = 0;

        handleEl.addEventListener('mousedown', function (e) {
            if (e.button !== 0) return;
            if (e.target.closest('button, .custom-dialog-close, input, select, a')) return;
            e.preventDefault();
            const rect = boxEl.getBoundingClientRect();
            boxEl.style.position = 'fixed';
            boxEl.style.margin = '0';
            boxEl.style.transform = 'none';
            boxEl.style.left = rect.left + 'px';
            boxEl.style.top = rect.top + 'px';
            startX = e.clientX;
            startY = e.clientY;
            origLeft = rect.left;
            origTop = rect.top;
            dragging = true;

            const onMove = function (ev) {
                if (!dragging) return;
                const nx = Math.max(8 - rect.width * 0.5, Math.min(window.innerWidth - 48, origLeft + (ev.clientX - startX)));
                const ny = Math.max(8, Math.min(window.innerHeight - 48, origTop + (ev.clientY - startY)));
                boxEl.style.left = nx + 'px';
                boxEl.style.top = ny + 'px';
            };
            const onUp = function () {
                dragging = false;
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        });
    }

    function openHelpModal(helpKeyOrTitle, contentHtml) {
        injectUniversalModalStyles();

        let key = helpKeyOrTitle;
        if (!HELP_CATALOG[key]) {
            key = resolveHelpKey(helpKeyOrTitle, contentHtml);
        }
        const entry = HELP_CATALOG[key];
        if (!entry || !Array.isArray(entry.topics) || entry.topics.length === 0) return;

        const existing = document.getElementById('op-universal-help-overlay');
        if (existing) existing.remove();

        const topics = entry.topics;
        const overlay = document.createElement('div');
        overlay.id = 'op-universal-help-overlay';
        overlay.innerHTML = `
            <div class="op-uh-box" id="op-universal-help-box" role="dialog" aria-modal="true" aria-label="${escapeHtml(entry.title)}">
                <div class="op-uh-header" id="op-universal-help-header" title="Drag to move">
                    <span style="display:flex;align-items:center;gap:8px;font-weight:700;font-size:13.5px;">
                        <i class="fas fa-book-open"></i> ${escapeHtml(entry.title)}
                    </span>
                    <button type="button" class="custom-dialog-close" id="op-universal-help-close-x" title="Close Help" aria-label="Close Help"><i class="fas fa-times"></i></button>
                </div>
                <div class="op-uh-toolbar">
                    <div class="op-uh-nav-btns">
                        <button type="button" class="op-uh-tool-btn" id="op-uh-back-btn" disabled><i class="fas fa-arrow-left"></i> Back</button>
                        <button type="button" class="op-uh-tool-btn" id="op-uh-fwd-btn" disabled>Forward <i class="fas fa-arrow-right"></i></button>
                    </div>
                    <span id="op-uh-breadcrumb" style="font-weight:600;opacity:0.85;">${escapeHtml(topics[0].title)}</span>
                </div>
                <div class="op-uh-split">
                    <div class="op-uh-toc">
                        <div class="op-uh-toc-head">Contents</div>
                        ${topics.map((t, i) => `
                            <button type="button" class="op-uh-topic-btn${i === 0 ? ' active' : ''}" data-uh-topic="${escapeHtml(t.id)}">
                                <i class="fas fa-file-alt"></i>
                                <span>${escapeHtml(t.title)}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div class="op-uh-pane" id="op-uh-content-pane"></div>
                </div>
                <div class="op-uh-footer">
                    <button type="button" class="op-uh-ok-btn" id="op-uh-ok-btn">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const helpBox = document.getElementById('op-universal-help-box');
        const helpHeader = document.getElementById('op-universal-help-header');
        const backBtn = document.getElementById('op-uh-back-btn');
        const fwdBtn = document.getElementById('op-uh-fwd-btn');
        const crumb = document.getElementById('op-uh-breadcrumb');
        const pane = document.getElementById('op-uh-content-pane');

        makeHelpDraggable(helpBox, helpHeader);

        const hist = [topics[0].id];
        let histIdx = 0;

        function renderTopic(topicId, pushHist) {
            const topic = topics.find(t => t.id === topicId) || topics[0];
            if (pushHist && hist[histIdx] !== topic.id) {
                hist.splice(histIdx + 1);
                hist.push(topic.id);
                histIdx = hist.length - 1;
            }
            overlay.querySelectorAll('.op-uh-topic-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-uh-topic') === topic.id);
            });
            crumb.textContent = topic.title;
            pane.innerHTML = `<h4>${escapeHtml(topic.title)}</h4>${topic.body}`;
            pane.scrollTop = 0;
            backBtn.disabled = histIdx <= 0;
            fwdBtn.disabled = histIdx >= hist.length - 1;
        }

        renderTopic(topics[0].id, false);

        overlay.querySelectorAll('.op-uh-topic-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                renderTopic(btn.getAttribute('data-uh-topic'), true);
            });
        });

        backBtn.addEventListener('click', function () {
            if (histIdx > 0) {
                histIdx--;
                renderTopic(hist[histIdx], false);
            }
        });

        fwdBtn.addEventListener('click', function () {
            if (histIdx < hist.length - 1) {
                histIdx++;
                renderTopic(hist[histIdx], false);
            }
        });

        const closeHelp = function () {
            document.removeEventListener('keydown', onEscKey, true);
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        };

        const onEscKey = function (ev) {
            if (ev.key === 'Escape') {
                ev.preventDefault();
                ev.stopPropagation();
                closeHelp();
            }
        };
        document.addEventListener('keydown', onEscKey, true);

        document.getElementById('op-universal-help-close-x').addEventListener('click', closeHelp);
        document.getElementById('op-uh-ok-btn').addEventListener('click', closeHelp);
    }

    // Build header actions HTML for DialogSystem.show(title, contentHtml, ...)
    function getDialogHeaderActionsHtml(titleHtml, contentHtml) {
        const key = resolveHelpKey(titleHtml, contentHtml);
        const entry = key ? getEntry(key) : null;
        if (entry) {
            const btnTitle = escapeHtml(entry.buttonTitle || entry.title || 'Help');
            return `
                <div class="op-dialog-header-actions">
                    <span role="button" tabindex="0" class="custom-dialog-close op-modal-help-btn" id="custom-dialog-help-btn" title="${btnTitle}" aria-label="${btnTitle}" onclick="event.stopPropagation(); if(window.OpenPublisherHelp) window.OpenPublisherHelp.open('${escapeHtml(key)}');"><i class="fas fa-question"></i></span>
                    <span role="button" tabindex="0" class="custom-dialog-close" id="custom-dialog-close-btn" title="Close" aria-label="Close" onclick="DialogSystem.close()"><i class="fas fa-times"></i></span>
                </div>
            `;
        }
        return `<span role="button" tabindex="0" class="custom-dialog-close" id="custom-dialog-close-btn" title="Close" aria-label="Close" onclick="DialogSystem.close()"><i class="fas fa-times"></i></span>`;
    }

    injectUniversalModalStyles();
    initGlobalBackdropPulseListener();

    global.triggerModalPulse = triggerModalPulse;
    global.OpenPublisherHelp = {
        CATALOG: HELP_CATALOG,
        resolveHelpKey: resolveHelpKey,
        getEntry: getEntry,
        open: openHelpModal,
        getDialogHeaderActionsHtml: getDialogHeaderActionsHtml,
        triggerModalPulse: triggerModalPulse
    };
})(window);
