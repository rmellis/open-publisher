// Open Publisher Dedicated Theme Studio Engine (v5.4.8)
// Autonomous modern theme design suite with 700 curated themes, 6-slider dual-column adjustment suite, and Canvas 2D print pre-baking.

;(function installPerfectedThemeStudio() {
    console.log("🛠️ Theme Studio initializing (v5.4.8 Modernized Background Controls & 700 Themes)...");

    // ==========================================
    // 1. CLEANUP & PREPARATION
    // ==========================================
    const oldThemeGroup = document.getElementById('theme-group');
    if (oldThemeGroup) oldThemeGroup.style.display = 'none';
    
    const oldModernGroup = document.getElementById('modern-theme-group');
    if (oldModernGroup) oldModernGroup.style.display = 'none';
    
    const rogueStudio = document.getElementById('advanced-theme-studio');
    if (rogueStudio) rogueStudio.remove();

    const existingPopover = document.getElementById('ts-gallery-popover');
    if (existingPopover) existingPopover.remove();

    // ==========================================
    // 2. INJECT CSS
    // ==========================================
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // ==========================================
    // 3. THEME DEFINITIONS (700 Authentic Curated Themes)
    // ==========================================
    const THEME_CATEGORIES = [
        { id: 'texture', name: 'Fine Papers, Fabrics & Materials', icon: 'fa-scroll', count: 280 },
        { id: 'gradient', name: 'Modern & Vibrant Gradients', icon: 'fa-rainbow', count: 105 },
        { id: 'corporate', name: 'Corporate, Legal & Editorial', icon: 'fa-briefcase', count: 105 },
        { id: 'dark', name: 'Dark Mode & Luxury', icon: 'fa-moon', count: 105 },
        { id: 'pastel', name: 'Soft Pastels & Earthy Naturals', icon: 'fa-leaf', count: 105 }
    ];

    const ALL_THEMES = [
        {
                "id": "white-wall",
                "name": "White Wall Texture",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/white-wall.png",
                "icon": "fa-border-all"
        },
        {
                "id": "brushed-aluminum",
                "name": "Brushed Aluminum",
                "cat": "texture",
                "type": "texture",
                "c1": "#cbd5e1",
                "url": "https://www.transparenttextures.com/patterns/brushed-alum.png",
                "icon": "fa-align-justify"
        },
        {
                "id": "concrete-wall",
                "name": "Concrete Wall",
                "cat": "texture",
                "type": "texture",
                "c1": "#94a3b8",
                "url": "https://www.transparenttextures.com/patterns/concrete-wall.png",
                "icon": "fa-circle-half-stroke"
        },
        {
                "id": "cream-paper",
                "name": "Cream Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#fde047",
                "url": "https://www.transparenttextures.com/patterns/cream-paper.png",
                "icon": "fa-scroll"
        },
        {
                "id": "denim-fabric",
                "name": "Denim Fabric",
                "cat": "texture",
                "type": "texture",
                "c1": "#3b82f6",
                "url": "https://www.transparenttextures.com/patterns/denim.png",
                "icon": "fa-layer-group"
        },
        {
                "id": "black-leather",
                "name": "Black Leather",
                "cat": "texture",
                "type": "texture",
                "c1": "#1e293b",
                "url": "https://www.transparenttextures.com/patterns/leather.png",
                "icon": "fa-grip"
        },
        {
                "id": "wood-pattern",
                "name": "Wood Pattern",
                "cat": "texture",
                "type": "texture",
                "c1": "#8b5cf6",
                "url": "https://www.transparenttextures.com/patterns/wood-pattern.png",
                "icon": "fa-tree"
        },
        {
                "id": "cubes-pattern",
                "name": "Cubes Pattern",
                "cat": "texture",
                "type": "texture",
                "c1": "#10b981",
                "url": "https://www.transparenttextures.com/patterns/cubes.png",
                "icon": "fa-cubes"
        },
        {
                "id": "asphalt-road",
                "name": "Asphalt Road",
                "cat": "texture",
                "type": "texture",
                "c1": "#64748b",
                "url": "https://www.transparenttextures.com/patterns/asphalt-pattern.png",
                "icon": "fa-road"
        },
        {
                "id": "carbon-fibre",
                "name": "Carbon Fibre",
                "cat": "texture",
                "type": "texture",
                "c1": "#334155",
                "url": "https://www.transparenttextures.com/patterns/carbon-fibre.png",
                "icon": "fa-chess-board"
        },
        {
                "id": "notebook-paper",
                "name": "Notebook Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef08a",
                "url": "https://www.transparenttextures.com/patterns/notebook.png",
                "icon": "fa-book"
        },
        {
                "id": "brick-wall",
                "name": "Brick Wall",
                "cat": "texture",
                "type": "texture",
                "c1": "#ef4444",
                "url": "https://www.transparenttextures.com/patterns/brick-wall.png",
                "icon": "fa-th-large"
        },
        {
                "id": "subtle-dots",
                "name": "Subtle Dots",
                "cat": "texture",
                "type": "texture",
                "c1": "#f1f5f9",
                "url": "https://www.transparenttextures.com/patterns/subtle-dots.png",
                "icon": "fa-ellipsis"
        },
        {
                "id": "clean-grid",
                "name": "Blueprint Grid",
                "cat": "texture",
                "type": "texture",
                "c1": "#ffffff",
                "url": "https://www.transparenttextures.com/patterns/gridme.png",
                "icon": "fa-table-cells"
        },
        {
                "id": "linen-cloth",
                "name": "Linen Texture",
                "cat": "texture",
                "type": "texture",
                "c1": "#fafaf9",
                "url": "https://www.transparenttextures.com/patterns/retina-wood.png",
                "icon": "fa-shirt"
        },
        {
                "id": "handmade-vellum",
                "name": "Handmade Vellum",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef9c3",
                "url": "https://www.transparenttextures.com/patterns/subtle-grunge.png",
                "icon": "fa-file-lines"
        },
        {
                "id": "graph-paper",
                "name": "Graph Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/graphy.png",
                "icon": "fa-square-check"
        },
        {
                "id": "chalkboard",
                "name": "Chalkboard Slate",
                "cat": "texture",
                "type": "texture",
                "c1": "#2c3e50",
                "url": "https://www.transparenttextures.com/patterns/chalkboard.png",
                "icon": "fa-chalkboard"
        },
        {
                "id": "diagonal-mesh",
                "name": "Diagonal Mesh",
                "cat": "texture",
                "type": "texture",
                "c1": "#e2e8f0",
                "url": "https://www.transparenttextures.com/patterns/diagonal-noise.png",
                "icon": "fa-lines-leaning"
        },
        {
                "id": "terrazzo-stone",
                "name": "Ruffled Vellum",
                "cat": "texture",
                "type": "texture",
                "c1": "#f4f4f5",
                "url": "https://www.transparenttextures.com/patterns/crisp-paper-ruffles.png",
                "icon": "fa-mountain"
        },
        {
                "id": "aged-parchment-tex",
                "name": "Aged Parchment",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef3c7",
                "url": "https://www.transparenttextures.com/patterns/aged-paper.png",
                "icon": "fa-scroll"
        },
        {
                "id": "canvas-weave",
                "name": "Canvas Weave",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f5f4",
                "url": "https://www.transparenttextures.com/patterns/canvas.png",
                "icon": "fa-palette"
        },
        {
                "id": "diag-stripes-light",
                "name": "Diagonal Stripes",
                "cat": "texture",
                "type": "texture",
                "c1": "#f1f5f9",
                "url": "https://www.transparenttextures.com/patterns/diagonal-striped-brick.png",
                "icon": "fa-bars"
        },
        {
                "id": "cork-board",
                "name": "Natural Cork",
                "cat": "texture",
                "type": "texture",
                "c1": "#e7d7b5",
                "url": "https://www.transparenttextures.com/patterns/cork-board.png",
                "icon": "fa-thumbtack"
        },
        {
                "id": "white-diamond",
                "name": "Diamond Mesh",
                "cat": "texture",
                "type": "texture",
                "c1": "#fafafa",
                "url": "https://www.transparenttextures.com/patterns/white-diamond.png",
                "icon": "fa-diamond"
        },
        {
                "id": "honeycomb-grid",
                "name": "Honeycomb Grid",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/hexellence.png",
                "icon": "fa-shapes"
        },
        {
                "id": "paper-fibers",
                "name": "Paper Fibers",
                "cat": "texture",
                "type": "texture",
                "c1": "#fdfcf7",
                "url": "https://www.transparenttextures.com/patterns/paper-fibres.png",
                "icon": "fa-newspaper"
        },
        {
                "id": "woven-fabric",
                "name": "Woven Fabric",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/fabric-plaid.png",
                "icon": "fa-rug"
        },
        {
                "id": "leather-grain",
                "name": "Saddle Leather",
                "cat": "texture",
                "type": "texture",
                "c1": "#d2b48c",
                "url": "https://www.transparenttextures.com/patterns/soft-wallpaper.png",
                "icon": "fa-scroll"
        },
        {
                "id": "carbon-weave",
                "name": "Carbon Weave",
                "cat": "texture",
                "type": "texture",
                "c1": "#1e293b",
                "url": "https://www.transparenttextures.com/patterns/dark-geometric.png",
                "icon": "fa-shield-halved"
        },
        {
                "id": "handmade-paper",
                "name": "Handmade Craft Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#faf8f0",
                "url": "https://www.transparenttextures.com/patterns/handmade-paper.png",
                "icon": "fa-leaf"
        },
        {
                "id": "rough-cloth",
                "name": "Rough Burlap",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5ede1",
                "url": "https://www.transparenttextures.com/patterns/rough-cloth.png",
                "icon": "fa-bag-shopping"
        },
        {
                "id": "cross-stitch",
                "name": "Cross Stitch",
                "cat": "texture",
                "type": "texture",
                "c1": "#f1f5f9",
                "url": "https://www.transparenttextures.com/patterns/cross-stripes.png",
                "icon": "fa-xmark"
        },
        {
                "id": "vintage-speckle",
                "name": "Vintage Speckle",
                "cat": "texture",
                "type": "texture",
                "c1": "#fcfbf7",
                "url": "https://www.transparenttextures.com/patterns/subtle-freckles.png",
                "icon": "fa-certificate"
        },
        {
                "id": "herringbone-tex",
                "name": "Herringbone Weave",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f5f4",
                "url": "https://www.transparenttextures.com/patterns/herringbone.png",
                "icon": "fa-bars-staggered"
        },
        {
                "id": "crinkled-paper",
                "name": "Crinkled Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#fefce8",
                "url": "https://www.transparenttextures.com/patterns/crinkled-paper-texture.png",
                "icon": "fa-file"
        },
        {
                "id": "felt-surface",
                "name": "Wool Felt",
                "cat": "texture",
                "type": "texture",
                "c1": "#e2e8f0",
                "url": "https://www.transparenttextures.com/patterns/felt.png",
                "icon": "fa-mitten"
        },
        {
                "id": "light-wool",
                "name": "Light Wool Weave",
                "cat": "texture",
                "type": "texture",
                "c1": "#fafaf9",
                "url": "https://www.transparenttextures.com/patterns/knitted-netting.png",
                "icon": "fa-socks"
        },
        {
                "id": "micro-perforated",
                "name": "Micro Perforated",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/perforated-white.png",
                "icon": "fa-braille"
        },
        {
                "id": "subtle-stripes",
                "name": "Fine Pinstripe",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/pinstripe-light.png",
                "icon": "fa-align-left"
        },
        {
                "id": "subtle-zebra",
                "name": "Subtle Zebra Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/subtle-zebra-3d.png",
                "icon": "fa-bars"
        },
        {
                "id": "criss-cross",
                "name": "Criss Cross Linen",
                "cat": "texture",
                "type": "texture",
                "c1": "#fafaf9",
                "url": "https://www.transparenttextures.com/patterns/crissxcross.png",
                "icon": "fa-xmark"
        },
        {
                "id": "graph-coders",
                "name": "Engineer Grid",
                "cat": "texture",
                "type": "texture",
                "c1": "#f1f5f9",
                "url": "https://www.transparenttextures.com/patterns/graph-paper.png",
                "icon": "fa-table-cells"
        },
        {
                "id": "woven-basket",
                "name": "Woven Basket",
                "cat": "texture",
                "type": "texture",
                "c1": "#fbf7ee",
                "url": "https://www.transparenttextures.com/patterns/woven.png",
                "icon": "fa-basket-shopping"
        },
        {
                "id": "french-stucco",
                "name": "French Stucco",
                "cat": "texture",
                "type": "texture",
                "c1": "#f7f6f0",
                "url": "https://www.transparenttextures.com/patterns/french-stucco.png",
                "icon": "fa-paint-roller"
        },
        {
                "id": "grey-sand",
                "name": "Grey Sand Texture",
                "cat": "texture",
                "type": "texture",
                "c1": "#e2e8f0",
                "url": "https://www.transparenttextures.com/patterns/grey-sandbag.png",
                "icon": "fa-water"
        },
        {
                "id": "white-tiles",
                "name": "Mosaic Tiles",
                "cat": "texture",
                "type": "texture",
                "c1": "#ffffff",
                "url": "https://www.transparenttextures.com/patterns/white-tiles.png",
                "icon": "fa-border-all"
        },
        {
                "id": "rice-paper",
                "name": "Japanese Rice Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#fcfbf4",
                "url": "https://www.transparenttextures.com/patterns/rice-paper-2.png",
                "icon": "fa-scroll"
        },
        {
                "id": "clean-linen",
                "name": "Pressed White Linen",
                "cat": "texture",
                "type": "texture",
                "c1": "#fefefe",
                "url": "https://www.transparenttextures.com/patterns/white-linen.png",
                "icon": "fa-shirt"
        },
        {
                "id": "wave-cut",
                "name": "Wave Cut Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#f0fdfa",
                "url": "https://www.transparenttextures.com/patterns/wave-cut.png",
                "icon": "fa-water"
        },
        {
                "id": "cardboard-grain",
                "name": "Kraft Cardboard",
                "cat": "texture",
                "type": "texture",
                "c1": "#e8d8b8",
                "url": "https://www.transparenttextures.com/patterns/cardboard-flat.png",
                "icon": "fa-box"
        },
        {
                "id": "light-honeycomb",
                "name": "Honeycomb Mesh",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/white-diamond-dark.png",
                "icon": "fa-shapes"
        },
        {
                "id": "sandpaper-tex",
                "name": "Fine Sandpaper",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f0e6",
                "url": "https://www.transparenttextures.com/patterns/sandpaper.png",
                "icon": "fa-brush"
        },
        {
                "id": "twill-weave",
                "name": "Heavy Cotton Twill",
                "cat": "texture",
                "type": "texture",
                "c1": "#f1f5f9",
                "url": "https://www.transparenttextures.com/patterns/twill.png",
                "icon": "fa-layer-group"
        },
        {
                "id": "padded-leather",
                "name": "Padded White Leather",
                "cat": "texture",
                "type": "texture",
                "c1": "#fafafa",
                "url": "https://www.transparenttextures.com/patterns/padded-light.png",
                "icon": "fa-couch"
        },
        {
                "id": "brushed-steel-tex",
                "name": "Brushed Steel",
                "cat": "texture",
                "type": "texture",
                "c1": "#cbd5e1",
                "url": "https://www.transparenttextures.com/patterns/brushed-alum-dark.png",
                "icon": "fa-shield"
        },
        {
                "id": "subtle-net",
                "name": "Subtle Netting",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/subtle-net.png",
                "icon": "fa-table-cells-large"
        },
        {
                "id": "groove-paper",
                "name": "Grooved Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#faf9f5",
                "url": "https://www.transparenttextures.com/patterns/groovepaper.png",
                "icon": "fa-file"
        },
        {
                "id": "chalk-dust",
                "name": "Light Chalk Texture",
                "cat": "texture",
                "type": "texture",
                "c1": "#f4f4f5",
                "url": "https://www.transparenttextures.com/patterns/chalkdust.png",
                "icon": "fa-pen-nib"
        },
        {
                "id": "vintage-wallpaper",
                "name": "Victorian Damask Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#fcfbf6",
                "url": "https://www.transparenttextures.com/patterns/vintage-speckles.png",
                "icon": "fa-crown"
        },
        {
                "id": "vellum-parchment-gold",
                "name": "Gold Leaf Vellum",
                "cat": "texture",
                "type": "texture",
                "c1": "#fcf8e3",
                "url": "https://www.transparenttextures.com/patterns/exclusive-paper.png",
                "icon": "fa-scroll"
        },
        {
                "id": "linen-emboss-cream",
                "name": "Embossed Cream Linen",
                "cat": "texture",
                "type": "texture",
                "c1": "#fefcf0",
                "url": "https://www.transparenttextures.com/patterns/embossed-paper.png",
                "icon": "fa-feather"
        },
        {
                "id": "japanese-washi-pure",
                "name": "Pure Japanese Washi",
                "cat": "texture",
                "type": "texture",
                "c1": "#fdfbf7",
                "url": "https://www.transparenttextures.com/patterns/washi.png",
                "icon": "fa-scroll"
        },
        {
                "id": "cotton-cardstock-ivory",
                "name": "Ivory Cotton Cardstock",
                "cat": "texture",
                "type": "texture",
                "c1": "#faf8f2",
                "url": "https://www.transparenttextures.com/patterns/clean-gray-paper.png",
                "icon": "fa-envelope-open"
        },
        {
                "id": "water-paper-rough",
                "name": "Rough Watercolor Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#f9f6ee",
                "url": "https://www.transparenttextures.com/patterns/textured-paper.png",
                "icon": "fa-paintbrush"
        },
        {
                "id": "recycled-kraft-fiber",
                "name": "Fibrous Recycled Kraft",
                "cat": "texture",
                "type": "texture",
                "c1": "#e8dcbe",
                "url": "https://www.transparenttextures.com/patterns/cardboard.png",
                "icon": "fa-box"
        },
        {
                "id": "manila-parchment",
                "name": "Manila Archival Folder",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5ebce",
                "url": "https://www.transparenttextures.com/patterns/paper-1.png",
                "icon": "fa-folder"
        },
        {
                "id": "calligraphy-rag-paper",
                "name": "Calligraphy Cotton Rag",
                "cat": "texture",
                "type": "texture",
                "c1": "#f7f4ea",
                "url": "https://www.transparenttextures.com/patterns/paper-2.png",
                "icon": "fa-pen-nib"
        },
        {
                "id": "french-cold-press",
                "name": "French Cold Press Board",
                "cat": "texture",
                "type": "texture",
                "c1": "#faf6eb",
                "url": "https://www.transparenttextures.com/patterns/paper-3.png",
                "icon": "fa-palette"
        },
        {
                "id": "parchment-diploma",
                "name": "Chancellor Diploma Vellum",
                "cat": "texture",
                "type": "texture",
                "c1": "#fbf5df",
                "url": "https://www.transparenttextures.com/patterns/natural-paper.png",
                "icon": "fa-certificate"
        },
        {
                "id": "grid-notebook-math",
                "name": "Cartesian Math Grid",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/old-mathematics.png",
                "icon": "fa-calculator"
        },
        {
                "id": "ruled-legal-pad",
                "name": "Canary Legal Pad",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef9c3",
                "url": "https://www.transparenttextures.com/patterns/lined-paper.png",
                "icon": "fa-file-lines"
        },
        {
                "id": "vintage-cartography",
                "name": "Antique Cartography Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#f2ebd9",
                "url": "https://www.transparenttextures.com/patterns/old-map.png",
                "icon": "fa-map"
        },
        {
                "id": "corrugated-fiberboard",
                "name": "Fluted Corrugation Board",
                "cat": "texture",
                "type": "texture",
                "c1": "#deb887",
                "url": "https://www.transparenttextures.com/patterns/corrugation.png",
                "icon": "fa-boxes-stacked"
        },
        {
                "id": "white-bristol-board",
                "name": "Smooth Bristol Board",
                "cat": "texture",
                "type": "texture",
                "c1": "#fcfcfc",
                "url": "https://www.transparenttextures.com/patterns/white-paperboard.png",
                "icon": "fa-sheet-plastic"
        },
        {
                "id": "aged-library-vellum",
                "name": "Oxford Antiquarian Vellum",
                "cat": "texture",
                "type": "texture",
                "c1": "#f3ecd8",
                "url": "https://www.transparenttextures.com/patterns/old-wall.png",
                "icon": "fa-book-atlas"
        },
        {
                "id": "pressed-botanical-fiber",
                "name": "Pressed Botanical Pulp",
                "cat": "texture",
                "type": "texture",
                "c1": "#f4f0e4",
                "url": "https://www.transparenttextures.com/patterns/light-paper-fibers.png",
                "icon": "fa-seedling"
        },
        {
                "id": "micro-perforated-ledger",
                "name": "Double-Entry Ledger Sheet",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8f9fa",
                "url": "https://www.transparenttextures.com/patterns/tiny-grid.png",
                "icon": "fa-table"
        },
        {
                "id": "vellum-translucent-frost",
                "name": "Frost Translucent Vellum",
                "cat": "texture",
                "type": "texture",
                "c1": "#f1f5f9",
                "url": "https://www.transparenttextures.com/patterns/exclusive-paper.png",
                "icon": "fa-snowflake"
        },
        {
                "id": "silver-gelatin-matte",
                "name": "Silver Gelatin Fiber Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#e2e8f0",
                "url": "https://www.transparenttextures.com/patterns/dust.png",
                "icon": "fa-camera-retro"
        },
        {
                "id": "hand-pressed-mulberry",
                "name": "Hand-Pressed Kozo Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#faf5eb",
                "url": "https://www.transparenttextures.com/patterns/rice-paper.png",
                "icon": "fa-leaf"
        },
        {
                "id": "monastery-scriptorium",
                "name": "Scriptorium Calfskin Parchment",
                "cat": "texture",
                "type": "texture",
                "c1": "#efe8d3",
                "url": "https://www.transparenttextures.com/patterns/paper-1.png",
                "icon": "fa-feather-pointed"
        },
        {
                "id": "deckle-edge-stationery",
                "name": "Deckle Edge Note Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#faf7f0",
                "url": "https://www.transparenttextures.com/patterns/paper-2.png",
                "icon": "fa-envelope"
        },
        {
                "id": "heavyweight-passepartout",
                "name": "Museum Rag Matboard",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f5f4",
                "url": "https://www.transparenttextures.com/patterns/clean-gray-paper.png",
                "icon": "fa-image"
        },
        {
                "id": "carbonless-manifold",
                "name": "Manifold Carbonless Copy",
                "cat": "texture",
                "type": "texture",
                "c1": "#fefce8",
                "url": "https://www.transparenttextures.com/patterns/lined-paper.png",
                "icon": "fa-copy"
        },
        {
                "id": "oxford-cloth-white",
                "name": "Oxford White Shirting",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/clean-textile.png",
                "icon": "fa-shirt"
        },
        {
                "id": "sateen-weave-silk",
                "name": "Lustrous Silk Sateen",
                "cat": "texture",
                "type": "texture",
                "c1": "#fdf4ff",
                "url": "https://www.transparenttextures.com/patterns/satin-weave.png",
                "icon": "fa-ribbon"
        },
        {
                "id": "belgian-flax-linen",
                "name": "Raw Belgian Flax Linen",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f0e6",
                "url": "https://www.transparenttextures.com/patterns/fabric-1.png",
                "icon": "fa-rug"
        },
        {
                "id": "heirloom-quilt-stitch",
                "name": "Heirloom Quilted Stitch",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef2f2",
                "url": "https://www.transparenttextures.com/patterns/quilt.png",
                "icon": "fa-bed"
        },
        {
                "id": "indigo-raw-selvedge",
                "name": "Raw Selvedge Denim",
                "cat": "texture",
                "type": "texture",
                "c1": "#1e3a8a",
                "url": "https://www.transparenttextures.com/patterns/dark-denim.png",
                "icon": "fa-vest-patches"
        },
        {
                "id": "chambray-cotton-blue",
                "name": "Washed Blue Chambray",
                "cat": "texture",
                "type": "texture",
                "c1": "#e0f2fe",
                "url": "https://www.transparenttextures.com/patterns/fabric-1.png",
                "icon": "fa-tshirt"
        },
        {
                "id": "scottish-argyle-tartan",
                "name": "Highland Argyle Knit",
                "cat": "texture",
                "type": "texture",
                "c1": "#334155",
                "url": "https://www.transparenttextures.com/patterns/argyle.png",
                "icon": "fa-vest"
        },
        {
                "id": "black-twill-gabardine",
                "name": "Midnight Gabardine Twill",
                "cat": "texture",
                "type": "texture",
                "c1": "#0f172a",
                "url": "https://www.transparenttextures.com/patterns/black-twill.png",
                "icon": "fa-user-tie"
        },
        {
                "id": "cashmere-wool-blend",
                "name": "Pebble Cashmere Knit",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f5f4",
                "url": "https://www.transparenttextures.com/patterns/fabric-1.png",
                "icon": "fa-mitten"
        },
        {
                "id": "tweed-herringbone-donegal",
                "name": "Donegal Flecked Tweed",
                "cat": "texture",
                "type": "texture",
                "c1": "#475569",
                "url": "https://www.transparenttextures.com/patterns/fabric-plaid.png",
                "icon": "fa-snowflake"
        },
        {
                "id": "canvas-sailcloth-heavy",
                "name": "Nautical Duck Canvas",
                "cat": "texture",
                "type": "texture",
                "c1": "#f7f6f0",
                "url": "https://www.transparenttextures.com/patterns/clean-textile.png",
                "icon": "fa-ship"
        },
        {
                "id": "damask-jacquard-brocade",
                "name": "Imperial Brocade Damask",
                "cat": "texture",
                "type": "texture",
                "c1": "#fdf2f8",
                "url": "https://www.transparenttextures.com/patterns/fancy-deboss.png",
                "icon": "fa-crown"
        },
        {
                "id": "gingham-picnic-check",
                "name": "Provence Woven Check",
                "cat": "texture",
                "type": "texture",
                "c1": "#eff6ff",
                "url": "https://www.transparenttextures.com/patterns/checkered-pattern.png",
                "icon": "fa-table-cells"
        },
        {
                "id": "hopsack-blazer-wool",
                "name": "Navy Hopsack Weave",
                "cat": "texture",
                "type": "texture",
                "c1": "#1e293b",
                "url": "https://www.transparenttextures.com/patterns/fabric-1.png",
                "icon": "fa-user-tie"
        },
        {
                "id": "poplin-dress-cotton",
                "name": "Egyptian Cotton Poplin",
                "cat": "texture",
                "type": "texture",
                "c1": "#ffffff",
                "url": "https://www.transparenttextures.com/patterns/clean-textile.png",
                "icon": "fa-shirt"
        },
        {
                "id": "corduroy-fine-wale",
                "name": "Camel Fine Wale Corduroy",
                "cat": "texture",
                "type": "texture",
                "c1": "#d97706",
                "url": "https://www.transparenttextures.com/patterns/noise-lines.png",
                "icon": "fa-bars"
        },
        {
                "id": "flannel-brushed-heather",
                "name": "Heather Grey Flannel",
                "cat": "texture",
                "type": "texture",
                "c1": "#e2e8f0",
                "url": "https://www.transparenttextures.com/patterns/fabric-1.png",
                "icon": "fa-cloud"
        },
        {
                "id": "madras-summer-plaid",
                "name": "Breeze Madras Weave",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef3c7",
                "url": "https://www.transparenttextures.com/patterns/fabric-plaid.png",
                "icon": "fa-sun"
        },
        {
                "id": "linen-scrim-drapery",
                "name": "Sunlight Sheer Scrim",
                "cat": "texture",
                "type": "texture",
                "c1": "#fffbeb",
                "url": "https://www.transparenttextures.com/patterns/clean-textile.png",
                "icon": "fa-window-maximize"
        },
        {
                "id": "boucle-yarn-texture",
                "name": "Oatmeal Boucle Knit",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f0eb",
                "url": "https://www.transparenttextures.com/patterns/fabric-1.png",
                "icon": "fa-circle-dot"
        },
        {
                "id": "raw-silk-dupioni",
                "name": "Dupioni Raw Silk",
                "cat": "texture",
                "type": "texture",
                "c1": "#fff7ed",
                "url": "https://www.transparenttextures.com/patterns/satin-weave.png",
                "icon": "fa-gem"
        },
        {
                "id": "basketweave-upholstery",
                "name": "Nordic Basketweave Wool",
                "cat": "texture",
                "type": "texture",
                "c1": "#f1f5f9",
                "url": "https://www.transparenttextures.com/patterns/checkered-light-emboss.png",
                "icon": "fa-couch"
        },
        {
                "id": "ripstop-nylon-ballistic",
                "name": "Tactical Ripstop Grid",
                "cat": "texture",
                "type": "texture",
                "c1": "#334155",
                "url": "https://www.transparenttextures.com/patterns/grid.png",
                "icon": "fa-shield-halved"
        },
        {
                "id": "batiste-handkerchief",
                "name": "Heirloom Batiste Lawn",
                "cat": "texture",
                "type": "texture",
                "c1": "#fcfcfc",
                "url": "https://www.transparenttextures.com/patterns/clean-textile.png",
                "icon": "fa-handkerchief"
        },
        {
                "id": "houndstooth-couture",
                "name": "Monochrome Houndstooth",
                "cat": "texture",
                "type": "texture",
                "c1": "#0f172a",
                "url": "https://www.transparenttextures.com/patterns/checkered-pattern.png",
                "icon": "fa-chess-board"
        },
        {
                "id": "velveteen-dusk-black",
                "name": "Black Orchid Velveteen",
                "cat": "texture",
                "type": "texture",
                "c1": "#0a0a0c",
                "url": "https://www.transparenttextures.com/patterns/black-orchid.png",
                "icon": "fa-moon"
        },
        {
                "id": "binding-buckram-cloth",
                "name": "Library Buckram Binding",
                "cat": "texture",
                "type": "texture",
                "c1": "#78350f",
                "url": "https://www.transparenttextures.com/patterns/binding-dark.png",
                "icon": "fa-book"
        },
        {
                "id": "ivory-binding-vellum",
                "name": "Archival Spine Binding",
                "cat": "texture",
                "type": "texture",
                "c1": "#faf5eb",
                "url": "https://www.transparenttextures.com/patterns/binding-light.png",
                "icon": "fa-book-open"
        },
        {
                "id": "bed-linen-percale",
                "name": "Crisp Hotel Bed Linen",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/white-bed-sheet.png",
                "icon": "fa-bed"
        },
        {
                "id": "interlocking-stitch-knit",
                "name": "Cable Knit Interlock",
                "cat": "texture",
                "type": "texture",
                "c1": "#f1f5f9",
                "url": "https://www.transparenttextures.com/patterns/diagmonds.png",
                "icon": "fa-braid"
        },
        {
                "id": "venetian-plaster-polished",
                "name": "Polished Venetian Plaster",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/stucco.png",
                "icon": "fa-monument"
        },
        {
                "id": "carrara-marble-dust",
                "name": "Carrara Marble Dust",
                "cat": "texture",
                "type": "texture",
                "c1": "#fafafa",
                "url": "https://www.transparenttextures.com/patterns/white-sand.png",
                "icon": "fa-gem"
        },
        {
                "id": "weathered-lime-mortar",
                "name": "Weathered Lime Mortar",
                "cat": "texture",
                "type": "texture",
                "c1": "#f4f4f5",
                "url": "https://www.transparenttextures.com/patterns/grunge-wall.png",
                "icon": "fa-trowel"
        },
        {
                "id": "travertine-sandstone-honed",
                "name": "Honed Roman Travertine",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef3c7",
                "url": "https://www.transparenttextures.com/patterns/white-sand.png",
                "icon": "fa-landmark"
        },
        {
                "id": "whitewashed-brickwork",
                "name": "Whitewashed Loft Brick",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/white-brick-wall.png",
                "icon": "fa-cubes"
        },
        {
                "id": "dark-clinker-masonry",
                "name": "Industrial Clinker Brick",
                "cat": "texture",
                "type": "texture",
                "c1": "#450a0a",
                "url": "https://www.transparenttextures.com/patterns/dark-brick-wall.png",
                "icon": "fa-building"
        },
        {
                "id": "terracotta-tile-tuscany",
                "name": "Tuscan Sun Terracotta",
                "cat": "texture",
                "type": "texture",
                "c1": "#ea580c",
                "url": "https://www.transparenttextures.com/patterns/checkered-pattern.png",
                "icon": "fa-sun"
        },
        {
                "id": "cast-concrete-aggregate",
                "name": "Architectural Aggregate Slab",
                "cat": "texture",
                "type": "texture",
                "c1": "#cbd5e1",
                "url": "https://www.transparenttextures.com/patterns/asfalt-dark.png",
                "icon": "fa-road"
        },
        {
                "id": "french-limestone-pierre",
                "name": "Burgundy Pierre Limestone",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f5f4",
                "url": "https://www.transparenttextures.com/patterns/old-wall.png",
                "icon": "fa-mountain"
        },
        {
                "id": "subway-tile-gloss-white",
                "name": "Gloss Metro Tilework",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/white-tiles.png",
                "icon": "fa-square"
        },
        {
                "id": "granite-speckled-salt",
                "name": "Salt & Pepper Granite",
                "cat": "texture",
                "type": "texture",
                "c1": "#e2e8f0",
                "url": "https://www.transparenttextures.com/patterns/dust.png",
                "icon": "fa-dice-d6"
        },
        {
                "id": "basalt-paving-stone",
                "name": "Cobblestone Basalt Pave",
                "cat": "texture",
                "type": "texture",
                "c1": "#1e293b",
                "url": "https://www.transparenttextures.com/patterns/asfalt-dark.png",
                "icon": "fa-city"
        },
        {
                "id": "sandstone-cliff-sediment",
                "name": "Canyon Sediment Sandstone",
                "cat": "texture",
                "type": "texture",
                "c1": "#fed7aa",
                "url": "https://www.transparenttextures.com/patterns/white-sand.png",
                "icon": "fa-hill-rockslide"
        },
        {
                "id": "slate-shingle-roofing",
                "name": "Welsh Blue Slate Tile",
                "cat": "texture",
                "type": "texture",
                "c1": "#334155",
                "url": "https://www.transparenttextures.com/patterns/diagmonds.png",
                "icon": "fa-house"
        },
        {
                "id": "polished-terrazzo-fleck",
                "name": "Venetian Fleck Terrazzo",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f3ff",
                "url": "https://www.transparenttextures.com/patterns/dust.png",
                "icon": "fa-shapes"
        },
        {
                "id": "glazed-ceramic-zellige",
                "name": "Moroccan Zellige Tile",
                "cat": "texture",
                "type": "texture",
                "c1": "#0284c7",
                "url": "https://www.transparenttextures.com/patterns/arabesque.png",
                "icon": "fa-mosque"
        },
        {
                "id": "alabaster-carved-stone",
                "name": "Translucent Alabaster",
                "cat": "texture",
                "type": "texture",
                "c1": "#fdfbf7",
                "url": "https://www.transparenttextures.com/patterns/white-wall-2.png",
                "icon": "fa-monument"
        },
        {
                "id": "coastal-sand-dune",
                "name": "Baltic Windblown Sand",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef9c3",
                "url": "https://www.transparenttextures.com/patterns/white-sand.png",
                "icon": "fa-umbrella-beach"
        },
        {
                "id": "florentine-fresco-wall",
                "name": "Renaissance Fresco Wall",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef2f2",
                "url": "https://www.transparenttextures.com/patterns/grunge-wall.png",
                "icon": "fa-paintbrush"
        },
        {
                "id": "andalusian-plaster",
                "name": "Moorish Carved Stucco",
                "cat": "texture",
                "type": "texture",
                "c1": "#fafaf9",
                "url": "https://www.transparenttextures.com/patterns/arabesque.png",
                "icon": "fa-archway"
        },
        {
                "id": "pumice-stone-drift",
                "name": "Aegean Pumice Drift",
                "cat": "texture",
                "type": "texture",
                "c1": "#e4e4e7",
                "url": "https://www.transparenttextures.com/patterns/white-wall-3.png",
                "icon": "fa-volcano"
        },
        {
                "id": "smooth-calcimine-wash",
                "name": "Historic Calcimine Wash",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f5f4",
                "url": "https://www.transparenttextures.com/patterns/white-wall-2.png",
                "icon": "fa-paint-roller"
        },
        {
                "id": "charcoal-stucco-exterior",
                "name": "Modern Charcoal Facade",
                "cat": "texture",
                "type": "texture",
                "c1": "#18181b",
                "url": "https://www.transparenttextures.com/patterns/asfalt-dark.png",
                "icon": "fa-building-columns"
        },
        {
                "id": "quarried-slate-hearth",
                "name": "Hearthside Slate Slab",
                "cat": "texture",
                "type": "texture",
                "c1": "#3f3f46",
                "url": "https://www.transparenttextures.com/patterns/dark-stripes.png",
                "icon": "fa-fire"
        },
        {
                "id": "chalk-cliff-dover",
                "name": "Dover White Chalk Cliff",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/white-wall-3.png",
                "icon": "fa-mountain-sun"
        },
        {
                "id": "havana-cigar-leather",
                "name": "Aged Havana Leather",
                "cat": "texture",
                "type": "texture",
                "c1": "#451a03",
                "url": "https://www.transparenttextures.com/patterns/binding-dark.png",
                "icon": "fa-suitcase"
        },
        {
                "id": "cordovan-shell-burgundy",
                "name": "Shell Cordovan Polish",
                "cat": "texture",
                "type": "texture",
                "c1": "#701a75",
                "url": "https://www.transparenttextures.com/patterns/binding-dark.png",
                "icon": "fa-shoe-prints"
        },
        {
                "id": "cuoio-tuscan-tan",
                "name": "Tuscan Cuoio Saddle",
                "cat": "texture",
                "type": "texture",
                "c1": "#b45309",
                "url": "https://www.transparenttextures.com/patterns/binding-dark.png",
                "icon": "fa-horse"
        },
        {
                "id": "ebony-macassar-grain",
                "name": "Macassar Ebony Veneer",
                "cat": "texture",
                "type": "texture",
                "c1": "#1c1917",
                "url": "https://www.transparenttextures.com/patterns/dark-wood.png",
                "icon": "fa-tree"
        },
        {
                "id": "quarter-sawn-white-oak",
                "name": "Quarter-Sawn White Oak",
                "cat": "texture",
                "type": "texture",
                "c1": "#d97706",
                "url": "https://www.transparenttextures.com/patterns/dark-wood.png",
                "icon": "fa-table"
        },
        {
                "id": "scandinavian-ash-plank",
                "name": "Bleached Nordic Ash",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f5f4",
                "url": "https://www.transparenttextures.com/patterns/white-wall-2.png",
                "icon": "fa-tree"
        },
        {
                "id": "american-black-walnut",
                "name": "Crown Black Walnut",
                "cat": "texture",
                "type": "texture",
                "c1": "#3b1e08",
                "url": "https://www.transparenttextures.com/patterns/dark-wood.png",
                "icon": "fa-couch"
        },
        {
                "id": "antique-cork-stopper",
                "name": "Champagne Cellar Cork",
                "cat": "texture",
                "type": "texture",
                "c1": "#d4a373",
                "url": "https://www.transparenttextures.com/patterns/cardboard.png",
                "icon": "fa-wine-bottle"
        },
        {
                "id": "tooled-morocco-leather",
                "name": "Gilded Morocco Leather",
                "cat": "texture",
                "type": "texture",
                "c1": "#831843",
                "url": "https://www.transparenttextures.com/patterns/fancy-deboss.png",
                "icon": "fa-book-bookmark"
        },
        {
                "id": "shagreen-stingray-hide",
                "name": "Galuchat Shagreen Hide",
                "cat": "texture",
                "type": "texture",
                "c1": "#0f766e",
                "url": "https://www.transparenttextures.com/patterns/dark-dot.png",
                "icon": "fa-water"
        },
        {
                "id": "burl-elm-dashboard",
                "name": "English Burl Elm",
                "cat": "texture",
                "type": "texture",
                "c1": "#78350f",
                "url": "https://www.transparenttextures.com/patterns/dark-wood.png",
                "icon": "fa-car"
        },
        {
                "id": "black-python-leather",
                "name": "Black Mamba Scales",
                "cat": "texture",
                "type": "texture",
                "c1": "#0a0a0a",
                "url": "https://www.transparenttextures.com/patterns/black-mamba.png",
                "icon": "fa-dragon"
        },
        {
                "id": "embossed-alligator-croc",
                "name": "Deep River Crocodile",
                "cat": "texture",
                "type": "texture",
                "c1": "#14532d",
                "url": "https://www.transparenttextures.com/patterns/dark-fish-skin.png",
                "icon": "fa-shield-cat"
        },
        {
                "id": "bleached-teak-decking",
                "name": "Yacht Bleached Teak",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef3c7",
                "url": "https://www.transparenttextures.com/patterns/noise-lines.png",
                "icon": "fa-anchor"
        },
        {
                "id": "aged-driftwood-patina",
                "name": "Stormy Coast Driftwood",
                "cat": "texture",
                "type": "texture",
                "c1": "#a1a1aa",
                "url": "https://www.transparenttextures.com/patterns/dark-wood.png",
                "icon": "fa-water"
        },
        {
                "id": "cherry-blossom-birch",
                "name": "Sakura Grain Birch",
                "cat": "texture",
                "type": "texture",
                "c1": "#fdf2f8",
                "url": "https://www.transparenttextures.com/patterns/sakura.png",
                "icon": "fa-tree"
        },
        {
                "id": "smoked-larch-timber",
                "name": "Alpine Smoked Larch",
                "cat": "texture",
                "type": "texture",
                "c1": "#292524",
                "url": "https://www.transparenttextures.com/patterns/dark-wood.png",
                "icon": "fa-mountain"
        },
        {
                "id": "cast-iron-stove-surface",
                "name": "Wrought Cast Iron Pan",
                "cat": "texture",
                "type": "texture",
                "c1": "#18181b",
                "url": "https://www.transparenttextures.com/patterns/gun-metal.png",
                "icon": "fa-fire-burner"
        },
        {
                "id": "damascene-forged-steel",
                "name": "Folded Damascus Steel",
                "cat": "texture",
                "type": "texture",
                "c1": "#475569",
                "url": "https://www.transparenttextures.com/patterns/diagonal-waves.png",
                "icon": "fa-hand-back-fist"
        },
        {
                "id": "patinated-pewter-sheet",
                "name": "Antique Pewter Flagon",
                "cat": "texture",
                "type": "texture",
                "c1": "#94a3b8",
                "url": "https://www.transparenttextures.com/patterns/light-aluminum.png",
                "icon": "fa-coins"
        },
        {
                "id": "carbon-honeycomb-aero",
                "name": "Aerospace Hex Carbon",
                "cat": "texture",
                "type": "texture",
                "c1": "#0f172a",
                "url": "https://www.transparenttextures.com/patterns/carbon-fibre-big.png",
                "icon": "fa-jet-fighter"
        },
        {
                "id": "twill-carbon-chassis",
                "name": "Formula Chassis Carbon",
                "cat": "texture",
                "type": "texture",
                "c1": "#1e293b",
                "url": "https://www.transparenttextures.com/patterns/carbon-fibre-v2.png",
                "icon": "fa-car-side"
        },
        {
                "id": "diamond-tread-plate",
                "name": "Industrial Tread Plate",
                "cat": "texture",
                "type": "texture",
                "c1": "#64748b",
                "url": "https://www.transparenttextures.com/patterns/diagmonds.png",
                "icon": "fa-industry"
        },
        {
                "id": "knurled-titanium-grip",
                "name": "Tactical Knurled Grip",
                "cat": "texture",
                "type": "texture",
                "c1": "#334155",
                "url": "https://www.transparenttextures.com/patterns/iron-grip.png",
                "icon": "fa-screwdriver-wrench"
        },
        {
                "id": "acoustic-studio-foam",
                "name": "Anachoic Studio Wedge",
                "cat": "texture",
                "type": "texture",
                "c1": "#1e1e24",
                "url": "https://www.transparenttextures.com/patterns/dimension.png",
                "icon": "fa-microphone-lines"
        },
        {
                "id": "woven-wire-mesh",
                "name": "Architectural Wire Screen",
                "cat": "texture",
                "type": "texture",
                "c1": "#cbd5e1",
                "url": "https://www.transparenttextures.com/patterns/grid.png",
                "icon": "fa-border-all"
        },
        {
                "id": "micro-perforated-chassis",
                "name": "Bespoke Audio Speaker Grille",
                "cat": "texture",
                "type": "texture",
                "c1": "#0f172a",
                "url": "https://www.transparenttextures.com/patterns/dark-dot.png",
                "icon": "fa-volume-high"
        },
        {
                "id": "expanded-metal-grate",
                "name": "Galvanized Walkway Grille",
                "cat": "texture",
                "type": "texture",
                "c1": "#64748b",
                "url": "https://www.transparenttextures.com/patterns/diagmonds-light.png",
                "icon": "fa-person-walking"
        },
        {
                "id": "isometric-cube-matrix",
                "name": "Isometric Cube Relief",
                "cat": "texture",
                "type": "texture",
                "c1": "#f1f5f9",
                "url": "https://www.transparenttextures.com/patterns/cutcube.png",
                "icon": "fa-cubes-stacked"
        },
        {
                "id": "parabolic-radar-dish",
                "name": "Parabolic Radar Mesh",
                "cat": "texture",
                "type": "texture",
                "c1": "#1e293b",
                "url": "https://www.transparenttextures.com/patterns/triangles-3d.png",
                "icon": "fa-satellite-dish"
        },
        {
                "id": "ballistic-kevlar-weave",
                "name": "Golden Kevlar Armor",
                "cat": "texture",
                "type": "texture",
                "c1": "#ca8a04",
                "url": "https://www.transparenttextures.com/patterns/clean-textile.png",
                "icon": "fa-shield"
        },
        {
                "id": "anodized-gold-mesh",
                "name": "Gilded Architectural Grate",
                "cat": "texture",
                "type": "texture",
                "c1": "#eab308",
                "url": "https://www.transparenttextures.com/patterns/gold-scale.png",
                "icon": "fa-award"
        },
        {
                "id": "solar-photovoltaic-cell",
                "name": "Monocrystalline Solar Cell",
                "cat": "texture",
                "type": "texture",
                "c1": "#0c4a6e",
                "url": "https://www.transparenttextures.com/patterns/grid.png",
                "icon": "fa-solar-panel"
        },
        {
                "id": "circuit-subsilicon-wafer",
                "name": "Silicon Die Interconnect",
                "cat": "texture",
                "type": "texture",
                "c1": "#064e3b",
                "url": "https://www.transparenttextures.com/patterns/interlocking-stitch-knit.png",
                "icon": "fa-microchip"
        },
        {
                "id": "laser-etched-polycarbonate",
                "name": "Frosted Prism Polycarbonate",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/bright-squares.png",
                "icon": "fa-cube"
        },
        {
                "id": "brushed-brass-millwork",
                "name": "Milled Architectural Brass",
                "cat": "texture",
                "type": "texture",
                "c1": "#b45309",
                "url": "https://www.transparenttextures.com/patterns/light-aluminum.png",
                "icon": "fa-compass-drafting"
        },
        {
                "id": "champagne-anodized-alu",
                "name": "Champagne Anodized Shell",
                "cat": "texture",
                "type": "texture",
                "c1": "#e2e8f0",
                "url": "https://www.transparenttextures.com/patterns/light-aluminum.png",
                "icon": "fa-laptop"
        },
        {
                "id": "micro-dot-matrix-paper",
                "name": "Continuous Tractor Feed",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/subtle-dots.png",
                "icon": "fa-print"
        },
        {
                "id": "radar-cross-section",
                "name": "Stealth Low-Observability Facet",
                "cat": "texture",
                "type": "texture",
                "c1": "#18181b",
                "url": "https://www.transparenttextures.com/patterns/triangles.png",
                "icon": "fa-plane"
        },
        {
                "id": "carbon-nanotube-forest",
                "name": "Vantablack Nanotube Foil",
                "cat": "texture",
                "type": "texture",
                "c1": "#050505",
                "url": "https://www.transparenttextures.com/patterns/black-mamba.png",
                "icon": "fa-atom"
        },
        {
                "id": "kyoto-mulberry-vellum",
                "name": "Kyoto Mulberry Bark",
                "cat": "texture",
                "type": "texture",
                "c1": "#faf7ef",
                "url": "https://www.transparenttextures.com/patterns/txture.png",
                "icon": "fa-scroll"
        },
        {
                "id": "himalayan-lokta-parchment",
                "name": "Himalayan Lokta Sheet",
                "cat": "texture",
                "type": "texture",
                "c1": "#f4ecdc",
                "url": "https://www.transparenttextures.com/patterns/paper-fibers.png",
                "icon": "fa-mountain"
        },
        {
                "id": "chiyogami-block-print",
                "name": "Chiyogami Block Print",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef3c7",
                "url": "https://www.transparenttextures.com/patterns/gray-floral.png",
                "icon": "fa-fan"
        },
        {
                "id": "pressed-flower-deckle",
                "name": "Pressed Meadow Flora",
                "cat": "texture",
                "type": "texture",
                "c1": "#fefce8",
                "url": "https://www.transparenttextures.com/patterns/wild-flowers.png",
                "icon": "fa-seedling"
        },
        {
                "id": "olive-grove-stationery",
                "name": "Olive Leaf Laid Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#f7fee7",
                "url": "https://www.transparenttextures.com/patterns/wild-oliva.png",
                "icon": "fa-leaf"
        },
        {
                "id": "silver-birch-calligraphy",
                "name": "Silver Birch Bark",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/white-wave.png",
                "icon": "fa-pen-nib"
        },
        {
                "id": "featherweight-manifold",
                "name": "Featherweight Airmail Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/subtle-white-feathers.png",
                "icon": "fa-paper-plane"
        },
        {
                "id": "retina-vellum-monochrome",
                "name": "Retina Monochrome Vellum",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f5f4",
                "url": "https://www.transparenttextures.com/patterns/retina-dust.png",
                "icon": "fa-sheet-plastic"
        },
        {
                "id": "typographic-watermark",
                "name": "Gutenberg Letterpress Proof",
                "cat": "texture",
                "type": "texture",
                "c1": "#faf7f2",
                "url": "https://www.transparenttextures.com/patterns/type.png",
                "icon": "fa-font"
        },
        {
                "id": "bookbinder-endpaper",
                "name": "Marbled Bookbinder Endpaper",
                "cat": "texture",
                "type": "texture",
                "c1": "#faf5ff",
                "url": "https://www.transparenttextures.com/patterns/swirl.png",
                "icon": "fa-book"
        },
        {
                "id": "drafting-vellum-translucent",
                "name": "Architectural Film Vellum",
                "cat": "texture",
                "type": "texture",
                "c1": "#f0fdfa",
                "url": "https://www.transparenttextures.com/patterns/elegant-grid.png",
                "icon": "fa-compass-drafting"
        },
        {
                "id": "blizzard-snow-deckle",
                "name": "Glacial White Deckle",
                "cat": "texture",
                "type": "texture",
                "c1": "#ffffff",
                "url": "https://www.transparenttextures.com/patterns/blizzard.png",
                "icon": "fa-snowflake"
        },
        {
                "id": "winter-frost-stationery",
                "name": "Powder Frost Stationery",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/fresh-snow.png",
                "icon": "fa-icicles"
        },
        {
                "id": "crossword-puzzle-sheet",
                "name": "Sunday Crossword Ledger",
                "cat": "texture",
                "type": "texture",
                "c1": "#fefce8",
                "url": "https://www.transparenttextures.com/patterns/crossword.png",
                "icon": "fa-puzzle-piece"
        },
        {
                "id": "coordinate-double-grid",
                "name": "Geodetic Double Grid",
                "cat": "texture",
                "type": "texture",
                "c1": "#f1f5f9",
                "url": "https://www.transparenttextures.com/patterns/double-lined.png",
                "icon": "fa-map-location-dot"
        },
        {
                "id": "geometric-rhombus-paper",
                "name": "Tessellated Rhombus Laid",
                "cat": "texture",
                "type": "texture",
                "c1": "#fafaf9",
                "url": "https://www.transparenttextures.com/patterns/geometry.png",
                "icon": "fa-shapes"
        },
        {
                "id": "tactile-noise-felted",
                "name": "Tactile Felted Rag Paper",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f5f4",
                "url": "https://www.transparenttextures.com/patterns/tactile-noise.png",
                "icon": "fa-hand-dots"
        },
        {
                "id": "minimalist-silver-laid",
                "name": "Minimalist Silver Laid",
                "cat": "texture",
                "type": "texture",
                "c1": "#f1f5f9",
                "url": "https://www.transparenttextures.com/patterns/silver-scales.png",
                "icon": "fa-award"
        },
        {
                "id": "fine-dashed-ledger",
                "name": "Perforated Voucher Sheet",
                "cat": "texture",
                "type": "texture",
                "c1": "#fafaf9",
                "url": "https://www.transparenttextures.com/patterns/simple-dashed.png",
                "icon": "fa-receipt"
        },
        {
                "id": "horizontal-laid-vellum",
                "name": "Watermarked Laid Wire",
                "cat": "texture",
                "type": "texture",
                "c1": "#fdfcf7",
                "url": "https://www.transparenttextures.com/patterns/simple-horizontal-light.png",
                "icon": "fa-file-lines"
        },
        {
                "id": "savile-row-pinstripe-suit",
                "name": "Savile Row Pinstripe Wool",
                "cat": "texture",
                "type": "texture",
                "c1": "#0f172a",
                "url": "https://www.transparenttextures.com/patterns/pinstriped-suit.png",
                "icon": "fa-user-tie"
        },
        {
                "id": "chalk-stripe-flannel",
                "name": "Banker Chalk Stripe",
                "cat": "texture",
                "type": "texture",
                "c1": "#1e293b",
                "url": "https://www.transparenttextures.com/patterns/pinstripe.png",
                "icon": "fa-bars-staggered"
        },
        {
                "id": "provence-vichy-cotton",
                "name": "French Vichy Picnic Cotton",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef2f2",
                "url": "https://www.transparenttextures.com/patterns/vichy.png",
                "icon": "fa-table-cells"
        },
        {
                "id": "harris-tweed-heather",
                "name": "Outer Hebrides Tweed",
                "cat": "texture",
                "type": "texture",
                "c1": "#3f3f46",
                "url": "https://www.transparenttextures.com/patterns/tweed.png",
                "icon": "fa-vest"
        },
        {
                "id": "flemish-gobelin-tapestry",
                "name": "Flemish Gobelin Weave",
                "cat": "texture",
                "type": "texture",
                "c1": "#451a03",
                "url": "https://www.transparenttextures.com/patterns/tapestry.png",
                "icon": "fa-rug"
        },
        {
                "id": "black-linen-cambric",
                "name": "Midnight Cambric Linen",
                "cat": "texture",
                "type": "texture",
                "c1": "#0a0a0c",
                "url": "https://www.transparenttextures.com/patterns/black-linen.png",
                "icon": "fa-shirt"
        },
        {
                "id": "fine-skeletal-gauze",
                "name": "Skeletal Open-Weave Gauze",
                "cat": "texture",
                "type": "texture",
                "c1": "#fafaf9",
                "url": "https://www.transparenttextures.com/patterns/skeletal-weave.png",
                "icon": "fa-circle-notch"
        },
        {
                "id": "washed-indigo-denim",
                "name": "Enzyme Washed Denim",
                "cat": "texture",
                "type": "texture",
                "c1": "#1d4ed8",
                "url": "https://www.transparenttextures.com/patterns/kinda-jean.png",
                "icon": "fa-vest-patches"
        },
        {
                "id": "light-mesh-jersey",
                "name": "Athletic Aerated Jersey",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/light-mesh.png",
                "icon": "fa-volleyball"
        },
        {
                "id": "merino-wool-worsted",
                "name": "Merino Worsted Suiting",
                "cat": "texture",
                "type": "texture",
                "c1": "#e2e8f0",
                "url": "https://www.transparenttextures.com/patterns/light-wool.png",
                "icon": "fa-mitten"
        },
        {
                "id": "low-contrast-hemp-linen",
                "name": "Organic Raw Hemp Weave",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f0e6",
                "url": "https://www.transparenttextures.com/patterns/low-contrast-linen.png",
                "icon": "fa-wheat-awn"
        },
        {
                "id": "dark-nasty-gabardine",
                "name": "Industrial Workwear Canvas",
                "cat": "texture",
                "type": "texture",
                "c1": "#18181b",
                "url": "https://www.transparenttextures.com/patterns/nasty-fabric.png",
                "icon": "fa-hammer"
        },
        {
                "id": "admiral-navy-twill",
                "name": "Royal Fleet Serge Wool",
                "cat": "texture",
                "type": "texture",
                "c1": "#0c1e3d",
                "url": "https://www.transparenttextures.com/patterns/navy.png",
                "icon": "fa-anchor"
        },
        {
                "id": "quilted-parka-down",
                "name": "Bespoke Padded Shell",
                "cat": "texture",
                "type": "texture",
                "c1": "#334155",
                "url": "https://www.transparenttextures.com/patterns/padded.png",
                "icon": "fa-cloud"
        },
        {
                "id": "aerospace-polyester-lite",
                "name": "Ripstop Parachute Silk",
                "cat": "texture",
                "type": "texture",
                "c1": "#e0f2fe",
                "url": "https://www.transparenttextures.com/patterns/polyester-lite.png",
                "icon": "fa-parachute-box"
        },
        {
                "id": "jacquard-scale-damask",
                "name": "Art Deco Scallop Weave",
                "cat": "texture",
                "type": "texture",
                "c1": "#fdf4ff",
                "url": "https://www.transparenttextures.com/patterns/soft-circle-scales.png",
                "icon": "fa-feather"
        },
        {
                "id": "matelasse-relief-bedding",
                "name": "Provencal Matelass\u00e9 Pique",
                "cat": "texture",
                "type": "texture",
                "c1": "#fafaf9",
                "url": "https://www.transparenttextures.com/patterns/soft-pad.png",
                "icon": "fa-bed"
        },
        {
                "id": "woven-cane-wicker",
                "name": "Colonial Woven Rattan",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef3c7",
                "url": "https://www.transparenttextures.com/patterns/weave.png",
                "icon": "fa-basket-shopping"
        },
        {
                "id": "nordic-ribbed-knit",
                "name": "Scandinavian Fisher Knit",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/woven-light.png",
                "icon": "fa-mitten"
        },
        {
                "id": "zigzag-chevron-drapery",
                "name": "Bespoke Chevron Jacquard",
                "cat": "texture",
                "type": "texture",
                "c1": "#f1f5f9",
                "url": "https://www.transparenttextures.com/patterns/zig-zag.png",
                "icon": "fa-arrow-trend-up"
        },
        {
                "id": "corsetry-whalebone-twill",
                "name": "Heirloom Corset Brocade",
                "cat": "texture",
                "type": "texture",
                "c1": "#fefce8",
                "url": "https://www.transparenttextures.com/patterns/batthern.png",
                "icon": "fa-ribbon"
        },
        {
                "id": "cross-stitched-needlework",
                "name": "Artisan Tapestry Needlepoint",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f3ff",
                "url": "https://www.transparenttextures.com/patterns/little-pluses.png",
                "icon": "fa-plus"
        },
        {
                "id": "stacked-coin-chainmail",
                "name": "Medieval Ring Mail",
                "cat": "texture",
                "type": "texture",
                "c1": "#64748b",
                "url": "https://www.transparenttextures.com/patterns/stacked-circles.png",
                "icon": "fa-shield-halved"
        },
        {
                "id": "honeycomb-concentric-mesh",
                "name": "Concentric Spun Mesh",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/circles.png",
                "icon": "fa-circle-nodes"
        },
        {
                "id": "cellular-elastoplast-gauze",
                "name": "Woven Cellular Medical Band",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef9c3",
                "url": "https://www.transparenttextures.com/patterns/elastoplast.png",
                "icon": "fa-bandage"
        },
        {
                "id": "appalachian-curly-maple",
                "name": "Appalachian Fiddleback Maple",
                "cat": "texture",
                "type": "texture",
                "c1": "#d97706",
                "url": "https://www.transparenttextures.com/patterns/purty-wood.png",
                "icon": "fa-tree"
        },
        {
                "id": "quarter-sawn-timber",
                "name": "Cabinetmaker Quarter-Sawn Plank",
                "cat": "texture",
                "type": "texture",
                "c1": "#92400e",
                "url": "https://www.transparenttextures.com/patterns/wood.png",
                "icon": "fa-table"
        },
        {
                "id": "tongue-groove-pine",
                "name": "Tongue & Groove Ship-lap",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef3c7",
                "url": "https://www.transparenttextures.com/patterns/tileable-wood.png",
                "icon": "fa-border-none"
        },
        {
                "id": "portuguese-reserve-cork",
                "name": "Douro Reserve Bottle Cork",
                "cat": "texture",
                "type": "texture",
                "c1": "#d4a373",
                "url": "https://www.transparenttextures.com/patterns/wine-cork.png",
                "icon": "fa-wine-bottle"
        },
        {
                "id": "organic-green-tea-fibers",
                "name": "Matcha Pressed Botanical Fiber",
                "cat": "texture",
                "type": "texture",
                "c1": "#f0fdf4",
                "url": "https://www.transparenttextures.com/patterns/green-fibers.png",
                "icon": "fa-leaf"
        },
        {
                "id": "roasted-espresso-burl",
                "name": "Dark Espresso Roasted Burl",
                "cat": "texture",
                "type": "texture",
                "c1": "#29180d",
                "url": "https://www.transparenttextures.com/patterns/mocha-grunge.png",
                "icon": "fa-mug-hot"
        },
        {
                "id": "sculpted-skin-morocco",
                "name": "Pebble Grain Book Calf",
                "cat": "texture",
                "type": "texture",
                "c1": "#78350f",
                "url": "https://www.transparenttextures.com/patterns/skin-side-up.png",
                "icon": "fa-scroll"
        },
        {
                "id": "aged-barnwood-patina",
                "name": "Heritage Reclaimed Barnwood",
                "cat": "texture",
                "type": "texture",
                "c1": "#71717a",
                "url": "https://www.transparenttextures.com/patterns/wood.png",
                "icon": "fa-house-chimney"
        },
        {
                "id": "honduras-rosewood-grain",
                "name": "Concert Acoustic Rosewood",
                "cat": "texture",
                "type": "texture",
                "c1": "#451a03",
                "url": "https://www.transparenttextures.com/patterns/purty-wood.png",
                "icon": "fa-guitar"
        },
        {
                "id": "bleached-sycamore-veneer",
                "name": "Loom Bleached Sycamore",
                "cat": "texture",
                "type": "texture",
                "c1": "#faf5eb",
                "url": "https://www.transparenttextures.com/patterns/tileable-wood.png",
                "icon": "fa-leaf"
        },
        {
                "id": "roasted-chestnut-timber",
                "name": "Fireplace Roasted Chestnut",
                "cat": "texture",
                "type": "texture",
                "c1": "#581c87",
                "url": "https://www.transparenttextures.com/patterns/wood.png",
                "icon": "fa-fire"
        },
        {
                "id": "rustic-cedar-shake",
                "name": "Pacific Cedar Shake Siding",
                "cat": "texture",
                "type": "texture",
                "c1": "#b45309",
                "url": "https://www.transparenttextures.com/patterns/purty-wood.png",
                "icon": "fa-tree"
        },
        {
                "id": "bamboo-shoot-pulp",
                "name": "Eco Moso Bamboo Parchment",
                "cat": "texture",
                "type": "texture",
                "c1": "#fefce8",
                "url": "https://www.transparenttextures.com/patterns/paper-fibers.png",
                "icon": "fa-seedling"
        },
        {
                "id": "carved-pyramid-wood",
                "name": "Acoustic Quadratic Diffuser",
                "cat": "texture",
                "type": "texture",
                "c1": "#d97706",
                "url": "https://www.transparenttextures.com/patterns/pyramid.png",
                "icon": "fa-cubes"
        },
        {
                "id": "pineapple-fiber-pina",
                "name": "Philippine Pi\u00f1a Cloth",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef9c3",
                "url": "https://www.transparenttextures.com/patterns/pineapple-cut.png",
                "icon": "fa-shirt"
        },
        {
                "id": "artisan-olivewood-slab",
                "name": "Mediterranean Gnarled Olive",
                "cat": "texture",
                "type": "texture",
                "c1": "#ca8a04",
                "url": "https://www.transparenttextures.com/patterns/wild-oliva.png",
                "icon": "fa-bowl-rice"
        },
        {
                "id": "antique-ship-salvage",
                "name": "Galleon Salt-Water Oak",
                "cat": "texture",
                "type": "texture",
                "c1": "#52525b",
                "url": "https://www.transparenttextures.com/patterns/wood.png",
                "icon": "fa-ship"
        },
        {
                "id": "golden-teak-ribbon",
                "name": "Burma Golden Ribbon Teak",
                "cat": "texture",
                "type": "texture",
                "c1": "#b45309",
                "url": "https://www.transparenttextures.com/patterns/purty-wood.png",
                "icon": "fa-sun"
        },
        {
                "id": "carbonized-bamboo-plank",
                "name": "Carbonized Smoked Bamboo",
                "cat": "texture",
                "type": "texture",
                "c1": "#44403c",
                "url": "https://www.transparenttextures.com/patterns/tileable-wood.png",
                "icon": "fa-tree"
        },
        {
                "id": "reclaimed-stave-cask",
                "name": "Bordeaux Wine Cask Stave",
                "cat": "texture",
                "type": "texture",
                "c1": "#3b0764",
                "url": "https://www.transparenttextures.com/patterns/wood.png",
                "icon": "fa-wine-glass"
        },
        {
                "id": "dolomite-alpine-crag",
                "name": "Dolomite Mountain Cliff",
                "cat": "texture",
                "type": "texture",
                "c1": "#e4e4e7",
                "url": "https://www.transparenttextures.com/patterns/rocky-wall.png",
                "icon": "fa-mountain"
        },
        {
                "id": "mediterranean-stucco-lime",
                "name": "Cycladic Stucco Limewash",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/wall-4-light.png",
                "icon": "fa-landmark"
        },
        {
                "id": "mosaic-terrazzo-micro",
                "name": "Micro Tesserae Roman Floor",
                "cat": "texture",
                "type": "texture",
                "c1": "#f5f5f4",
                "url": "https://www.transparenttextures.com/patterns/3px-tile.png",
                "icon": "fa-border-all"
        },
        {
                "id": "monolithic-basalt-cube",
                "name": "Hexagonal Columnar Basalt",
                "cat": "texture",
                "type": "texture",
                "c1": "#0f172a",
                "url": "https://www.transparenttextures.com/patterns/ag-square.png",
                "icon": "fa-cubes-stacked"
        },
        {
                "id": "parisian-haussmann-limestone",
                "name": "Haussmann Ashlar Limestone",
                "cat": "texture",
                "type": "texture",
                "c1": "#fdfbf7",
                "url": "https://www.transparenttextures.com/patterns/arches.png",
                "icon": "fa-archway"
        },
        {
                "id": "gothic-tracery-arcade",
                "name": "Cathedral Tracery Arcade",
                "cat": "texture",
                "type": "texture",
                "c1": "#f4f4f5",
                "url": "https://www.transparenttextures.com/patterns/arches.png",
                "icon": "fa-church"
        },
        {
                "id": "florentine-pietra-serena",
                "name": "Renaissance Pietra Serena",
                "cat": "texture",
                "type": "texture",
                "c1": "#94a3b8",
                "url": "https://www.transparenttextures.com/patterns/always-grey.png",
                "icon": "fa-monument"
        },
        {
                "id": "ancient-carthage-pave",
                "name": "Roman Decumanus Paving",
                "cat": "texture",
                "type": "texture",
                "c1": "#cbd5e1",
                "url": "https://www.transparenttextures.com/patterns/paven.png",
                "icon": "fa-road"
        },
        {
                "id": "shattered-quartzite-slab",
                "name": "Shattered Vein Quartzite",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/shattered.png",
                "icon": "fa-gem"
        },
        {
                "id": "obsidian-shattered-dark",
                "name": "Black Volcanic Glass Breccia",
                "cat": "texture",
                "type": "texture",
                "c1": "#09090b",
                "url": "https://www.transparenttextures.com/patterns/shattered-dark.png",
                "icon": "fa-volcano"
        },
        {
                "id": "rough-sandstone-quarry",
                "name": "Nubian Sandstone Quarry",
                "cat": "texture",
                "type": "texture",
                "c1": "#fed7aa",
                "url": "https://www.transparenttextures.com/patterns/inflicted.png",
                "icon": "fa-hill-rockslide"
        },
        {
                "id": "cork-parquetry-tile",
                "name": "Herringbone Compressed Cork",
                "cat": "texture",
                "type": "texture",
                "c1": "#d97706",
                "url": "https://www.transparenttextures.com/patterns/wine-cork.png",
                "icon": "fa-layer-group"
        },
        {
                "id": "weathered-harbor-pier",
                "name": "Granite Harbor Breakwater",
                "cat": "texture",
                "type": "texture",
                "c1": "#64748b",
                "url": "https://www.transparenttextures.com/patterns/rocky-wall.png",
                "icon": "fa-anchor"
        },
        {
                "id": "creamy-travertine-slab",
                "name": "Tivoli Vein-Cut Travertine",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef3c7",
                "url": "https://www.transparenttextures.com/patterns/az-subtle.png",
                "icon": "fa-building-columns"
        },
        {
                "id": "polished-porcelain-slip",
                "name": "Celadon Glazed Porcelain",
                "cat": "texture",
                "type": "texture",
                "c1": "#f0fdfa",
                "url": "https://www.transparenttextures.com/patterns/shine-caro.png",
                "icon": "fa-droplet"
        },
        {
                "id": "volcanic-tuff-facade",
                "name": "Roman Pozzolana Tuff",
                "cat": "texture",
                "type": "texture",
                "c1": "#fed7aa",
                "url": "https://www.transparenttextures.com/patterns/wall-4-light.png",
                "icon": "fa-building"
        },
        {
                "id": "carved-alabaster-screen",
                "name": "Mughal Jali Alabaster Screen",
                "cat": "texture",
                "type": "texture",
                "c1": "#fafaf9",
                "url": "https://www.transparenttextures.com/patterns/arches.png",
                "icon": "fa-mosque"
        },
        {
                "id": "cast-stucco-relief",
                "name": "Neoclassical Plaster Cornice",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/wall-4-light.png",
                "icon": "fa-landmark-dome"
        },
        {
                "id": "coastal-slate-escarpment",
                "name": "Cornish Coastal Slate Escarpment",
                "cat": "texture",
                "type": "texture",
                "c1": "#334155",
                "url": "https://www.transparenttextures.com/patterns/rocky-wall.png",
                "icon": "fa-water"
        },
        {
                "id": "chalkstone-quarry-face",
                "name": "Cotswold Oolite Limestone",
                "cat": "texture",
                "type": "texture",
                "c1": "#fef9c3",
                "url": "https://www.transparenttextures.com/patterns/always-grey.png",
                "icon": "fa-gem"
        },
        {
                "id": "aero-spec-white-carbon",
                "name": "Aerospace White Carbon Sheet",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/white-carbon.png",
                "icon": "fa-jet-fighter"
        },
        {
                "id": "toray-high-modulus-carbon",
                "name": "High-Modulus Pitch Carbon",
                "cat": "texture",
                "type": "texture",
                "c1": "#090d16",
                "url": "https://www.transparenttextures.com/patterns/white-carbonfiber.png",
                "icon": "fa-car-burst"
        },
        {
                "id": "hexagonal-carbon-matrix",
                "name": "Graphene Honeycomb Lattice",
                "cat": "texture",
                "type": "texture",
                "c1": "#0f172a",
                "url": "https://www.transparenttextures.com/patterns/subtle-carbon.png",
                "icon": "fa-atom"
        },
        {
                "id": "deep-radar-absorber",
                "name": "Stealth Dielectric Matrix",
                "cat": "texture",
                "type": "texture",
                "c1": "#050508",
                "url": "https://www.transparenttextures.com/patterns/black-paper.png",
                "icon": "fa-plane"
        },
        {
                "id": "retro-mirrored-grid",
                "name": "Prismatic Retro-Reflector",
                "cat": "texture",
                "type": "texture",
                "c1": "#f1f5f9",
                "url": "https://www.transparenttextures.com/patterns/mirrored-squares.png",
                "icon": "fa-clone"
        },
        {
                "id": "subatomic-bubble-chamber",
                "name": "Quantum Particle Track Foil",
                "cat": "texture",
                "type": "texture",
                "c1": "#020617",
                "url": "https://www.transparenttextures.com/patterns/stardust.png",
                "icon": "fa-satellite"
        },
        {
                "id": "constellation-stellar-foil",
                "name": "Interplanetary Radiator Foil",
                "cat": "texture",
                "type": "texture",
                "c1": "#050515",
                "url": "https://www.transparenttextures.com/patterns/starring.png",
                "icon": "fa-star"
        },
        {
                "id": "laser-hologram-shimmer",
                "name": "Diffractive Hologram Film",
                "cat": "texture",
                "type": "texture",
                "c1": "#fdf4ff",
                "url": "https://www.transparenttextures.com/patterns/twinkle-twinkle.png",
                "icon": "fa-wand-magic"
        },
        {
                "id": "woven-carbon-chassis-dark",
                "name": "Formula Unidirectional Carbon",
                "cat": "texture",
                "type": "texture",
                "c1": "#030712",
                "url": "https://www.transparenttextures.com/patterns/carbon-fibre-v2.png",
                "icon": "fa-gauge-high"
        },
        {
                "id": "tactile-checker-substrate",
                "name": "Micro-Tessellated Silicon",
                "cat": "texture",
                "type": "texture",
                "c1": "#1e293b",
                "url": "https://www.transparenttextures.com/patterns/squares.png",
                "icon": "fa-microchip"
        },
        {
                "id": "cryogenic-dewar-shield",
                "name": "Aluminized Mylar Thermal Blanket",
                "cat": "texture",
                "type": "texture",
                "c1": "#e2e8f0",
                "url": "https://www.transparenttextures.com/patterns/silver-scales.png",
                "icon": "fa-satellite-dish"
        },
        {
                "id": "high-density-fpga-substrate",
                "name": "Ball Grid Array Silicon",
                "cat": "texture",
                "type": "texture",
                "c1": "#0f172a",
                "url": "https://www.transparenttextures.com/patterns/noisy-grid.png",
                "icon": "fa-memory"
        },
        {
                "id": "interlocking-buckyball-net",
                "name": "Fullerene Carbon Nanosphere",
                "cat": "texture",
                "type": "texture",
                "c1": "#0a0a0a",
                "url": "https://www.transparenttextures.com/patterns/noisy-net.png",
                "icon": "fa-circle-nodes"
        },
        {
                "id": "tactical-stealth-skin",
                "name": "Anechoic Marine Rubber Tile",
                "cat": "texture",
                "type": "texture",
                "c1": "#18181b",
                "url": "https://www.transparenttextures.com/patterns/soft-kill.png",
                "icon": "fa-water"
        },
        {
                "id": "optical-diffuser-film",
                "name": "Micro-Lens Diffuser Film",
                "cat": "texture",
                "type": "texture",
                "c1": "#f8fafc",
                "url": "https://www.transparenttextures.com/patterns/wave-grid.png",
                "icon": "fa-eye"
        },
        {
                "id": "aurora-sky",
                "name": "Aurora Sky",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#4facfe",
                "c2": "#00f2fe",
                "icon": "fa-sun"
        },
        {
                "id": "sunset-horizon",
                "name": "Sunset Horizon",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#fa709a",
                "c2": "#fee140",
                "icon": "fa-cloud-sun"
        },
        {
                "id": "cosmic-violet",
                "name": "Cosmic Violet",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#667eea",
                "c2": "#764ba2",
                "icon": "fa-moon"
        },
        {
                "id": "crimson-ember",
                "name": "Crimson Ember",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ff0844",
                "c2": "#ffb199",
                "icon": "fa-fire"
        },
        {
                "id": "solar-flare",
                "name": "Solar Flare",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f83600",
                "c2": "#f9d423",
                "icon": "fa-bolt"
        },
        {
                "id": "neon-cyberpunk",
                "name": "Neon Cyberpunk",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#b224ef",
                "c2": "#7579ff",
                "icon": "fa-star"
        },
        {
                "id": "azure-tide",
                "name": "Azure Tide",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#89f7fe",
                "c2": "#66a6ff",
                "icon": "fa-water"
        },
        {
                "id": "emerald-biosphere",
                "name": "Emerald Biosphere",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#0ba360",
                "c2": "#3cba92",
                "icon": "fa-leaf"
        },
        {
                "id": "twilight-glow",
                "name": "Twilight Glow",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ff7e5f",
                "c2": "#feb47b",
                "icon": "fa-sunset"
        },
        {
                "id": "mystic-lavender",
                "name": "Mystic Lavender",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#a18cd1",
                "c2": "#fbc2eb",
                "icon": "fa-magic"
        },
        {
                "id": "deep-celestial",
                "name": "Deep Celestial",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#2b5876",
                "c2": "#4e4376",
                "icon": "fa-meteor"
        },
        {
                "id": "citrus-burst",
                "name": "Citrus Burst",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f6d365",
                "c2": "#fda085",
                "icon": "fa-lemon"
        },
        {
                "id": "arctic-glacier",
                "name": "Arctic Glacier",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#cfd9df",
                "c2": "#e2ebf0",
                "icon": "fa-snowflake"
        },
        {
                "id": "neon-mint",
                "name": "Neon Mint",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#43e97b",
                "c2": "#38f9d7",
                "icon": "fa-seedling"
        },
        {
                "id": "royal-amethyst",
                "name": "Royal Amethyst",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#5f72bd",
                "c2": "#9b23ea",
                "icon": "fa-gem"
        },
        {
                "id": "ocean-trench",
                "name": "Ocean Trench",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#09203f",
                "c2": "#537895",
                "icon": "fa-compass"
        },
        {
                "id": "rose-quartz",
                "name": "Rose Quartz",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ff9a9e",
                "c2": "#fad0c4",
                "icon": "fa-heart"
        },
        {
                "id": "electric-indigo",
                "name": "Electric Indigo",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#30cfd0",
                "c2": "#330867",
                "icon": "fa-bolt-lightning"
        },
        {
                "id": "amber-blaze",
                "name": "Amber Blaze",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ff9900",
                "c2": "#ff5500",
                "icon": "fa-fire-flame-curved"
        },
        {
                "id": "bora-bora",
                "name": "Bora Bora Blue",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#00c6ff",
                "c2": "#0072ff",
                "icon": "fa-umbrella-beach"
        },
        {
                "id": "mauve-velvet",
                "name": "Mauve Velvet",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#8e2de2",
                "c2": "#4a00e0",
                "icon": "fa-sparkles"
        },
        {
                "id": "golden-hour",
                "name": "Golden Hour",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f12711",
                "c2": "#f5af19",
                "icon": "fa-sun"
        },
        {
                "id": "northern-lights",
                "name": "Northern Lights",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#43cea2",
                "c2": "#185a9d",
                "icon": "fa-mountain-sun"
        },
        {
                "id": "cherry-blossom",
                "name": "Cherry Blossom",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f857a6",
                "c2": "#ff5858",
                "icon": "fa-spa"
        },
        {
                "id": "tropic-lagoon",
                "name": "Tropic Lagoon",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#00c9ff",
                "c2": "#92fe9d",
                "icon": "fa-water"
        },
        {
                "id": "flamingo-glow",
                "name": "Flamingo Glow",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f85032",
                "c2": "#e73827",
                "icon": "fa-dove"
        },
        {
                "id": "magenta-haze",
                "name": "Magenta Haze",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#d946ef",
                "c2": "#8b5cf6",
                "icon": "fa-wand-magic-sparkles"
        },
        {
                "id": "hyper-orange",
                "name": "Hyper Orange",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ff4e50",
                "c2": "#f9d423",
                "icon": "fa-fire"
        },
        {
                "id": "sapphire-stream",
                "name": "Sapphire Stream",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#1e3c72",
                "c2": "#2a5298",
                "icon": "fa-water"
        },
        {
                "id": "matcha-lemonade",
                "name": "Matcha Lemonade",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#84fab0",
                "c2": "#8fd3f4",
                "icon": "fa-glass-water"
        },
        {
                "id": "peach-schnapps",
                "name": "Peach Schnapps",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ffd1ff",
                "c2": "#fae1dd",
                "icon": "fa-heart"
        },
        {
                "id": "cyber-lime",
                "name": "Cyber Lime",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#a8ff78",
                "c2": "#78ffd6",
                "icon": "fa-bolt"
        },
        {
                "id": "velvet-sun",
                "name": "Velvet Sun",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#e1eec3",
                "c2": "#f05053",
                "icon": "fa-sun"
        },
        {
                "id": "plum-nebula",
                "name": "Plum Nebula",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#3f2b96",
                "c2": "#a8c0ff",
                "icon": "fa-meteor"
        },
        {
                "id": "electric-magenta",
                "name": "Electric Magenta",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f72585",
                "c2": "#7209b7",
                "icon": "fa-star"
        },
        {
                "id": "aqua-marine",
                "name": "Aqua Marine",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#13547a",
                "c2": "#80d0c7",
                "icon": "fa-fish"
        },
        {
                "id": "summer-solstice",
                "name": "Summer Solstice",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ffb347",
                "c2": "#ffcc33",
                "icon": "fa-sun-plant-wilt"
        },
        {
                "id": "blazing-orchid",
                "name": "Blazing Orchid",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ec008c",
                "c2": "#fc6767",
                "icon": "fa-gem"
        },
        {
                "id": "deep-abyss",
                "name": "Deep Abyss",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#0f2027",
                "c2": "#2c5364",
                "icon": "fa-cloud-rain"
        },
        {
                "id": "cosmic-fusion",
                "name": "Cosmic Fusion",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ff007f",
                "c2": "#7928ca",
                "icon": "fa-atom"
        },
        {
                "id": "neon-sunburst",
                "name": "Neon Sunburst",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ff416c",
                "c2": "#ff4b2b",
                "icon": "fa-sun"
        },
        {
                "id": "malibu-sunset",
                "name": "Malibu Sunset",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ff6b6b",
                "c2": "#ffe66d",
                "icon": "fa-umbrella-beach"
        },
        {
                "id": "deep-sapphire-glow",
                "name": "Sapphire Glow",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#0052d4",
                "c2": "#4364f7",
                "icon": "fa-gem"
        },
        {
                "id": "electric-violet",
                "name": "Electric Violet",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#7f00ff",
                "c2": "#e100ff",
                "icon": "fa-bolt"
        },
        {
                "id": "caribbean-turquoise",
                "name": "Caribbean Turquoise",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#00b4db",
                "c2": "#0083b0",
                "icon": "fa-water"
        },
        {
                "id": "ember-glow",
                "name": "Ember Glow",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#e65c00",
                "c2": "#f9d423",
                "icon": "fa-fire"
        },
        {
                "id": "amethyst-haze",
                "name": "Amethyst Haze",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#9d50bb",
                "c2": "#6e48aa",
                "icon": "fa-wand-magic-sparkles"
        },
        {
                "id": "acid-lime",
                "name": "Acid Lime",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#11998e",
                "c2": "#38ef7d",
                "icon": "fa-seedling"
        },
        {
                "id": "crimson-tide",
                "name": "Crimson Tide",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#642b73",
                "c2": "#c6426e",
                "icon": "fa-wave-square"
        },
        {
                "id": "solar-wind",
                "name": "Solar Wind",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#fe8c00",
                "c2": "#f83600",
                "icon": "fa-wind"
        },
        {
                "id": "plasma-blue",
                "name": "Plasma Blue",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#0575e6",
                "c2": "#00f260",
                "icon": "fa-atom"
        },
        {
                "id": "bubblegum-pop",
                "name": "Bubblegum Pop",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ff9a8b",
                "c2": "#ff6a88",
                "icon": "fa-candy-cane"
        },
        {
                "id": "ultramarine-flow",
                "name": "Ultramarine Flow",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#1fa2ff",
                "c2": "#12d8fa",
                "icon": "fa-water"
        },
        {
                "id": "magma-core",
                "name": "Magma Core",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#cb2d3e",
                "c2": "#ef473a",
                "icon": "fa-volcano"
        },
        {
                "id": "neon-cyan-surge",
                "name": "Neon Cyan Surge",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#00f0ff",
                "c2": "#5200ff",
                "icon": "fa-bolt-lightning"
        },
        {
                "id": "velvet-ruby",
                "name": "Velvet Ruby",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#870000",
                "c2": "#190a05",
                "icon": "fa-ring"
        },
        {
                "id": "tropical-hibiscus",
                "name": "Tropical Hibiscus",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#fd746c",
                "c2": "#ff9068",
                "icon": "fa-spa"
        },
        {
                "id": "arctic-aurora",
                "name": "Arctic Aurora",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#02aab0",
                "c2": "#00cdac",
                "icon": "fa-icicles"
        },
        {
                "id": "cosmic-flare",
                "name": "Cosmic Flare",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ff00cc",
                "c2": "#333399",
                "icon": "fa-meteor"
        },
        {
                "id": "golden-amber",
                "name": "Golden Amber",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f7971e",
                "c2": "#ffd200",
                "icon": "fa-coins"
        },
        {
                "id": "aurora-borealis-nordic",
                "name": "Nordic Aurora Borealis",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#00c6ff",
                "c2": "#0072ff",
                "icon": "fa-star"
        },
        {
                "id": "electric-indigo-surge",
                "name": "Electric Indigo Surge",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#4776e6",
                "c2": "#8e54e9",
                "icon": "fa-bolt"
        },
        {
                "id": "hyperion-amber-glow",
                "name": "Hyperion Solar Ember",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f857a6",
                "c2": "#ff5858",
                "icon": "fa-sun"
        },
        {
                "id": "emerald-bioluminescence",
                "name": "Ocean Bioluminescence",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#0ba360",
                "c2": "#3cba92",
                "icon": "fa-water"
        },
        {
                "id": "ultraviolet-nebula",
                "name": "Deep Cosmos Nebula",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#7f00ff",
                "c2": "#e100ff",
                "icon": "fa-moon"
        },
        {
                "id": "tropical-dragonfruit",
                "name": "Dragonfruit Punch",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f72585",
                "c2": "#7209b7",
                "icon": "fa-apple-whole"
        },
        {
                "id": "monaco-grand-prix",
                "name": "Monaco Circuit Red",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ed213a",
                "c2": "#93291e",
                "icon": "fa-flag-checkered"
        },
        {
                "id": "santorini-caldera-blue",
                "name": "Santorini Caldera",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#2193b0",
                "c2": "#6dd5ed",
                "icon": "fa-water"
        },
        {
                "id": "fuji-cherry-blossom",
                "name": "Fuji Dawn Petal",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ff9a9e",
                "c2": "#fecfef",
                "icon": "fa-flower"
        },
        {
                "id": "machu-picchu-mist",
                "name": "Andean Cloud Forest",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#134e5e",
                "c2": "#71b280",
                "icon": "fa-mountain"
        },
        {
                "id": "kyoto-golden-pavilion",
                "name": "Golden Pavilion Kinkaku",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f7971e",
                "c2": "#ffd200",
                "icon": "fa-crown"
        },
        {
                "id": "sahara-dune-sunset",
                "name": "Sahara Mirage Sunset",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f12711",
                "c2": "#f5af19",
                "icon": "fa-sun-plant-wilt"
        },
        {
                "id": "reykjavik-thermal-pool",
                "name": "Blue Lagoon Thermal",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#00b4db",
                "c2": "#0083b0",
                "icon": "fa-hot-tub-person"
        },
        {
                "id": "capri-azure-grotto",
                "name": "Capri Blue Grotto",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#0052d4",
                "c2": "#4364f7",
                "icon": "fa-water"
        },
        {
                "id": "singapore-super-tree",
                "name": "Gardens Supertree Neon",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#b92b27",
                "c2": "#1565c0",
                "icon": "fa-tree"
        },
        {
                "id": "amalfi-lemon-grove",
                "name": "Amalfi Coastal Citrus",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ffe000",
                "c2": "#799f0c",
                "icon": "fa-lemon"
        },
        {
                "id": "patagonia-iceberg",
                "name": "Perito Moreno Glacial",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#e0eafc",
                "c2": "#cfdef3",
                "icon": "fa-icicles"
        },
        {
                "id": "bordeaux-grand-cru",
                "name": "Grand Cru Cabernet",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#800020",
                "c2": "#2c001e",
                "icon": "fa-wine-glass"
        },
        {
                "id": "shibuya-cyber-cross",
                "name": "Shibuya Cyber Crossing",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ec008c",
                "c2": "#fc6767",
                "icon": "fa-traffic-light"
        },
        {
                "id": "valparaiso-bohemian",
                "name": "Bohemian Valparaiso",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ff4e50",
                "c2": "#f9d423",
                "icon": "fa-paintbrush"
        },
        {
                "id": "crimson-horizon-surge",
                "name": "Crimson Horizon Surge",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#e52d27",
                "c2": "#b31217",
                "icon": "fa-sun"
        },
        {
                "id": "california-poppy-glow",
                "name": "California Poppy Glow",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ff512f",
                "c2": "#f09819",
                "icon": "fa-sun-plant-wilt"
        },
        {
                "id": "emerald-rainforest-canopy",
                "name": "Amazonian Canopy",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#11998e",
                "c2": "#38ef7d",
                "icon": "fa-tree"
        },
        {
                "id": "bora-bora-lagoon",
                "name": "Bora Bora Lagoon",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#00c6ff",
                "c2": "#0072ff",
                "icon": "fa-water"
        },
        {
                "id": "electric-magenta-pulse",
                "name": "Electric Magenta Pulse",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f857a6",
                "c2": "#ff5858",
                "icon": "fa-bolt"
        },
        {
                "id": "sunset-over-malibu",
                "name": "Malibu Sunset Pier",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f77737",
                "c2": "#fccc63",
                "icon": "fa-umbrella-beach"
        },
        {
                "id": "ultramarine-abyss-flow",
                "name": "Deep Trench Ultramarine",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#0575e6",
                "c2": "#021b79",
                "icon": "fa-water"
        },
        {
                "id": "golden-hour-provence",
                "name": "Provence Golden Hour",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f6d365",
                "c2": "#fda085",
                "icon": "fa-cloud-sun"
        },
        {
                "id": "tokyo-neon-rain",
                "name": "Tokyo Neon Shinjuku",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#7b4397",
                "c2": "#dc2430",
                "icon": "fa-city"
        },
        {
                "id": "nordic-fjord-mist",
                "name": "Geiranger Fjord Mist",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#89f7fe",
                "c2": "#66a6ff",
                "icon": "fa-mountain"
        },
        {
                "id": "copper-canyon-dusk",
                "name": "Copper Canyon Dusk",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#d38312",
                "c2": "#a83279",
                "icon": "fa-volcano"
        },
        {
                "id": "singapore-orchid-glow",
                "name": "Vanda Orchid Magenta",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#cc2b5e",
                "c2": "#753a88",
                "icon": "fa-spa"
        },
        {
                "id": "havana-rum-amber",
                "name": "Aged Cuban Amber",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ee9ca7",
                "c2": "#ffdde1",
                "icon": "fa-wine-bottle"
        },
        {
                "id": "caribbean-coral-reef",
                "name": "Great Barrier Reef",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#43e97b",
                "c2": "#38f9d7",
                "icon": "fa-fish"
        },
        {
                "id": "berlin-techno-club",
                "name": "Kreuzberg Cyber Pulse",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#12c2e9",
                "c2": "#c471ed",
                "icon": "fa-headphones"
        },
        {
                "id": "monterey-kelp-forest",
                "name": "Pacific Kelp Forest",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#134e5e",
                "c2": "#71b280",
                "icon": "fa-leaf"
        },
        {
                "id": "icelandic-geysir-steam",
                "name": "Strokkur Geysir Steam",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#4facfe",
                "c2": "#00f2fe",
                "icon": "fa-hot-tub-person"
        },
        {
                "id": "andalusian-flamenco",
                "name": "Seville Flamenco Ember",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f12711",
                "c2": "#f5af19",
                "icon": "fa-fire"
        },
        {
                "id": "maui-plumeria-bloom",
                "name": "Hana Highway Plumeria",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ff9a9e",
                "c2": "#fecfef",
                "icon": "fa-flower"
        },
        {
                "id": "zanzibar-spice-sunset",
                "name": "Stone Town Spice Glow",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#ff758c",
                "c2": "#ff7eb3",
                "icon": "fa-sun"
        },
        {
                "id": "mont-blanc-alpenglow",
                "name": "Chamonix Alpenglow",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#fbc2eb",
                "c2": "#a6c1ee",
                "icon": "fa-mountain-sun"
        },
        {
                "id": "seattle-emerald-mist",
                "name": "Puget Sound Pine Mist",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#0ba360",
                "c2": "#3cba92",
                "icon": "fa-tree"
        },
        {
                "id": "sahara-starlight-sky",
                "name": "Erg Chebbi Starlight",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#2b5876",
                "c2": "#4e4376",
                "icon": "fa-star"
        },
        {
                "id": "marrakesh-bazaar-saffron",
                "name": "Souk Saffron Dust",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#f85032",
                "c2": "#e73827",
                "icon": "fa-bowl-food"
        },
        {
                "id": "cyclades-blue-dome",
                "name": "Oia Sunlit Caldera",
                "cat": "gradient",
                "type": "gradient",
                "c1": "#2193b0",
                "c2": "#6dd5ed",
                "icon": "fa-church"
        },
        {
                "id": "executive-slate",
                "name": "Executive Slate",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f8fafc",
                "c2": "#e2e8f0",
                "icon": "fa-briefcase"
        },
        {
                "id": "oxford-blue-wash",
                "name": "Oxford Blue Wash",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f0f4f8",
                "c2": "#d9e2ec",
                "icon": "fa-graduation-cap"
        },
        {
                "id": "legal-ivory",
                "name": "Legal Ivory",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fefcf3",
                "c2": "#fdf6e2",
                "icon": "fa-scale-balanced"
        },
        {
                "id": "warm-parchment",
                "name": "Warm Parchment",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fbf8f1",
                "c2": "#f4ede4",
                "icon": "fa-scroll"
        },
        {
                "id": "minimalist-chalk",
                "name": "Minimalist Chalk",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f5f5f7",
                "c2": "#e5e5ea",
                "icon": "fa-square"
        },
        {
                "id": "financial-cool-grey",
                "name": "Financial Cool Grey",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f1f5f9",
                "c2": "#cbd5e1",
                "icon": "fa-chart-line"
        },
        {
                "id": "editorial-bone",
                "name": "Editorial Bone",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#faf8f5",
                "c2": "#ede8e1",
                "icon": "fa-newspaper"
        },
        {
                "id": "corporate-sterling",
                "name": "Corporate Sterling",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#e2e8f0",
                "c2": "#f8fafc",
                "icon": "fa-building-columns"
        },
        {
                "id": "harvard-crimson-wash",
                "name": "Harvard Crimson Wash",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fdf2f2",
                "c2": "#fde8e8",
                "icon": "fa-landmark"
        },
        {
                "id": "tech-cyan-tint",
                "name": "Tech Cyan Tint",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f0fdfa",
                "c2": "#ccfbf1",
                "icon": "fa-microchip"
        },
        {
                "id": "monochrome-silk",
                "name": "Monochrome Silk",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f4f4f6",
                "c2": "#e4e4e7",
                "icon": "fa-feather"
        },
        {
                "id": "cambridge-amber",
                "name": "Cambridge Amber",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fffbeb",
                "c2": "#fef3c7",
                "icon": "fa-book-open"
        },
        {
                "id": "banker-subtle-blue",
                "name": "Banker Subtle Blue",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#eff6ff",
                "c2": "#dbeafe",
                "icon": "fa-vault"
        },
        {
                "id": "editorial-newsprint",
                "name": "Editorial Newsprint",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f6f5f0",
                "c2": "#eae7df",
                "icon": "fa-feather-pointed"
        },
        {
                "id": "architectural-concrete",
                "name": "Architectural Grey",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#e4e4e7",
                "c2": "#d4d4d8",
                "icon": "fa-compass-drafting"
        },
        {
                "id": "classic-stationery",
                "name": "Classic Stationery",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fafaf9",
                "c2": "#f5f5f4",
                "icon": "fa-signature"
        },
        {
                "id": "manhattan-granite",
                "name": "Manhattan Granite",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f3f4f6",
                "c2": "#e5e7eb",
                "icon": "fa-city"
        },
        {
                "id": "legal-manuscript",
                "name": "Legal Manuscript",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fdfbf7",
                "c2": "#f7f3e9",
                "icon": "fa-file-contract"
        },
        {
                "id": "nordic-frost",
                "name": "Nordic Frost",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f8fafc",
                "c2": "#ecfeff",
                "icon": "fa-icicles"
        },
        {
                "id": "consortium-blue",
                "name": "Consortium Blue",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f0f7ff",
                "c2": "#e0f2fe",
                "icon": "fa-handshake"
        },
        {
                "id": "berlin-sand",
                "name": "Berlin Sandstone",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fbf9f5",
                "c2": "#f3ede2",
                "icon": "fa-monument"
        },
        {
                "id": "vienna-porcelain",
                "name": "Vienna Porcelain",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fafaf9",
                "c2": "#f4f4f5",
                "icon": "fa-chess-rook"
        },
        {
                "id": "zurich-clean",
                "name": "Zurich Minimal",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f8f9fa",
                "c2": "#e9ecef",
                "icon": "fa-building-columns"
        },
        {
                "id": "tokyo-monochrome",
                "name": "Tokyo Monochrome",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f1f3f5",
                "c2": "#dee2e6",
                "icon": "fa-torii-gate"
        },
        {
                "id": "london-fog-wash",
                "name": "London Fog Wash",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f4f6f8",
                "c2": "#e1e7eb",
                "icon": "fa-cloud"
        },
        {
                "id": "wall-street-navy",
                "name": "Wall Street Tint",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f0f4f9",
                "c2": "#dce5ef",
                "icon": "fa-money-bill-wave"
        },
        {
                "id": "scandi-birch",
                "name": "Scandinavian Birch",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fcfbfa",
                "c2": "#f3ede2",
                "icon": "fa-tree"
        },
        {
                "id": "parliament-vellum",
                "name": "Parliament Vellum",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fbf9f2",
                "c2": "#f4eedb",
                "icon": "fa-scale-unbalanced"
        },
        {
                "id": "florence-marble",
                "name": "Florence Marble",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#faf9f6",
                "c2": "#ede9e3",
                "icon": "fa-monument"
        },
        {
                "id": "geneva-diplomat",
                "name": "Geneva Diplomat",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f2f5f9",
                "c2": "#e2e8f1",
                "icon": "fa-landmark-flag"
        },
        {
                "id": "silicon-slate",
                "name": "Silicon Slate",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f3f4f6",
                "c2": "#d1d5db",
                "icon": "fa-microchip"
        },
        {
                "id": "boston-brahmin",
                "name": "Boston Crimson Tint",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fff5f5",
                "c2": "#fed7d7",
                "icon": "fa-graduation-cap"
        },
        {
                "id": "frankfurt-steel",
                "name": "Frankfurt Steel",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#eff2f5",
                "c2": "#dbe1e8",
                "icon": "fa-coins"
        },
        {
                "id": "sorbonne-cream",
                "name": "Sorbonne Cream",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fefcf6",
                "c2": "#faf1da",
                "icon": "fa-book"
        },
        {
                "id": "amsterdam-wash",
                "name": "Amsterdam Wash",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f0f9ff",
                "c2": "#e0f2fe",
                "icon": "fa-bridge-water"
        },
        {
                "id": "chicago-limestone",
                "name": "Chicago Limestone",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f7f7f5",
                "c2": "#eae8e1",
                "icon": "fa-building"
        },
        {
                "id": "chartered-slate",
                "name": "Chartered Slate",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f1f5f9",
                "c2": "#cbd5e1",
                "icon": "fa-file-invoice"
        },
        {
                "id": "notary-parchment",
                "name": "Notary Parchment",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fdfbee",
                "c2": "#f9f2d5",
                "icon": "fa-stamp"
        },
        {
                "id": "press-gallery",
                "name": "Press Gallery Tint",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f8fafc",
                "c2": "#eceff1",
                "icon": "fa-bullhorn"
        },
        {
                "id": "kyoto-washi",
                "name": "Kyoto Washi Wash",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fbfaf7",
                "c2": "#f5f0e6",
                "icon": "fa-scroll"
        },
        {
                "id": "delaware-chancery",
                "name": "Delaware Chancery",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fcfcf9",
                "c2": "#f5f4ed",
                "icon": "fa-scale-balanced"
        },
        {
                "id": "singapore-finance",
                "name": "Singapore Financial",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f0fdf4",
                "c2": "#e2f7ea",
                "icon": "fa-landmark"
        },
        {
                "id": "canary-wharf",
                "name": "Canary Wharf Slate",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#eff6ff",
                "c2": "#dbeafe",
                "icon": "fa-building-columns"
        },
        {
                "id": "edinburgh-parchment",
                "name": "Edinburgh Parchment",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fdfbee",
                "c2": "#f5edd6",
                "icon": "fa-scroll"
        },
        {
                "id": "mit-cyber-tint",
                "name": "MIT Slate Tint",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f4f6f9",
                "c2": "#e5eaf2",
                "icon": "fa-microchip"
        },
        {
                "id": "cambridge-don",
                "name": "Cambridge Don Ivory",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fcfaf2",
                "c2": "#f7f1df",
                "icon": "fa-feather"
        },
        {
                "id": "oxford-press",
                "name": "Oxford Press Tint",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f7f7f9",
                "c2": "#eaebf0",
                "icon": "fa-book"
        },
        {
                "id": "barrister-silk",
                "name": "Barrister Silk",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fbfbfb",
                "c2": "#f0f0f2",
                "icon": "fa-user-tie"
        },
        {
                "id": "rotterdam-modern",
                "name": "Rotterdam Modern",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f1f5f9",
                "c2": "#e1e7ef",
                "icon": "fa-city"
        },
        {
                "id": "stockholm-clean",
                "name": "Stockholm Clean",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f9fafb",
                "c2": "#eceef1",
                "icon": "fa-square"
        },
        {
                "id": "milan-editorial",
                "name": "Milan Editorial",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#faf8f5",
                "c2": "#f2ede4",
                "icon": "fa-newspaper"
        },
        {
                "id": "monaco-prestige",
                "name": "Monaco Prestige",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fcfaf4",
                "c2": "#f6eee0",
                "icon": "fa-crown"
        },
        {
                "id": "hague-tribunal",
                "name": "The Hague Tribunal",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f3f6fa",
                "c2": "#e3eaf3",
                "icon": "fa-gavel"
        },
        {
                "id": "seoul-minimal",
                "name": "Seoul Minimal",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f8f9fa",
                "c2": "#e5e7eb",
                "icon": "fa-archway"
        },
        {
                "id": "dublin-parliament",
                "name": "Dublin Parliament",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f8faf5",
                "c2": "#e8f0df",
                "icon": "fa-clover"
        },
        {
                "id": "helsinki-frost",
                "name": "Helsinki Frost",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f6f9fb",
                "c2": "#e4edf3",
                "icon": "fa-snowflake"
        },
        {
                "id": "madrid-manuscript",
                "name": "Madrid Manuscript",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#faf7f0",
                "c2": "#f2ecd8",
                "icon": "fa-signature"
        },
        {
                "id": "toronto-sterling",
                "name": "Toronto Sterling",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f3f4f6",
                "c2": "#e1e3e8",
                "icon": "fa-tower-observation"
        },
        {
                "id": "geneva-treaty",
                "name": "Geneva Treaty Paper",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fdfbf7",
                "c2": "#f7f2e7",
                "icon": "fa-file-contract"
        },
        {
                "id": "brussels-chancery",
                "name": "Brussels Chancery",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f2f5f9",
                "c2": "#e4ebf4",
                "icon": "fa-shield-halved"
        },
        {
                "id": "fleet-street-broadsheet",
                "name": "Fleet Street Broadsheet",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fdfcf8",
                "c2": "#f4f1ea",
                "icon": "fa-newspaper"
        },
        {
                "id": "chancery-lane-silk",
                "name": "Chancery Lane Robe",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f5f6f8",
                "c2": "#e5e7eb",
                "icon": "fa-scale-balanced"
        },
        {
                "id": "belgravia-townhouse",
                "name": "Belgravia Stucco White",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fafaf9",
                "c2": "#f0ece1",
                "icon": "fa-building-columns"
        },
        {
                "id": "mayfair-private-bank",
                "name": "Mayfair Private Client",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f0f4f8",
                "c2": "#d9e2ec",
                "icon": "fa-vault"
        },
        {
                "id": "whitehall-parliamentary",
                "name": "Whitehall Parliamentary Vellum",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fcfbf7",
                "c2": "#f3eee3",
                "icon": "fa-landmark"
        },
        {
                "id": "inner-temple-barrister",
                "name": "Inner Temple Barrister Ivory",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fcf9f2",
                "c2": "#ebe4d5",
                "icon": "fa-gavel"
        },
        {
                "id": "broadway-playbill-tint",
                "name": "Playbill Historic Newsprint",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fdfaf0",
                "c2": "#f5eccd",
                "icon": "fa-masks-theater"
        },
        {
                "id": "financial-times-salmon",
                "name": "FT Salmon Editorial Pink",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fff2e8",
                "c2": "#ffe3d1",
                "icon": "fa-chart-line"
        },
        {
                "id": "le-figaro-cream",
                "name": "Boulevard Saint-Germain Cream",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fefef9",
                "c2": "#f5f3e9",
                "icon": "fa-book-open"
        },
        {
                "id": "frankfurter-zeitung",
                "name": "Frankfurt B\u00f6rsenplatz Grey",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f3f4f6",
                "c2": "#e5e7eb",
                "icon": "fa-building"
        },
        {
                "id": "swiss-canton-vellum",
                "name": "Helvetia Cantonal Archive",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#faf8f5",
                "c2": "#ede8df",
                "icon": "fa-flag"
        },
        {
                "id": "tokyo-marunouchi-slate",
                "name": "Marunouchi Corporate Slate",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f1f5f9",
                "c2": "#e2e8f0",
                "icon": "fa-briefcase"
        },
        {
                "id": "canary-wharf-glass",
                "name": "One Canada Square Reflection",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f0f9ff",
                "c2": "#e0f2fe",
                "icon": "fa-tower-observation"
        },
        {
                "id": "manhattan-firm-stationery",
                "name": "Midtown Law Executive Laid",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fbfbfa",
                "c2": "#f0ede6",
                "icon": "fa-envelope"
        },
        {
                "id": "vienna-ringstrasse-ivory",
                "name": "Ringstra\u00dfe Hofburg Ivory",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fdfcf7",
                "c2": "#f4efe4",
                "icon": "fa-landmark-dome"
        },
        {
                "id": "stockholm-nobel-archive",
                "name": "Nobel Laureate Vellum",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fefdfa",
                "c2": "#f6f1e3",
                "icon": "fa-award"
        },
        {
                "id": "sorbonne-doctoral-thesis",
                "name": "Sorbonne Doctoral Manuscript",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fbf9f4",
                "c2": "#eee8db",
                "icon": "fa-graduation-cap"
        },
        {
                "id": "edinburgh-advocate-library",
                "name": "Edinburgh Advocate Library",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f8f6f0",
                "c2": "#e9e3d3",
                "icon": "fa-book"
        },
        {
                "id": "oxford-bodleian-vellum",
                "name": "Bodleian Rare Manuscript",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fcf8ee",
                "c2": "#ece4d0",
                "icon": "fa-scroll"
        },
        {
                "id": "cambridge-press-monograph",
                "name": "Cambridge Academic Monograph",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fafaf7",
                "c2": "#eeebe2",
                "icon": "fa-pen-clip"
        },
        {
                "id": "kensington-palace-laid",
                "name": "Kensington Court Stationery",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#faf9f6",
                "c2": "#edebe6",
                "icon": "fa-crown"
        },
        {
                "id": "gray-inn-barrister",
                "name": "Gray's Inn Chambers Laid",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fbf9f4",
                "c2": "#ebe6dc",
                "icon": "fa-gavel"
        },
        {
                "id": "lincolns-inn-fields",
                "name": "Lincoln's Inn Chancery Vellum",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fcfbfa",
                "c2": "#f0ede6",
                "icon": "fa-scale-balanced"
        },
        {
                "id": "bank-of-england-note",
                "name": "Threadneedle Banknote Paper",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f5f7f5",
                "c2": "#e4ebe4",
                "icon": "fa-building-columns"
        },
        {
                "id": "bourse-de-paris-tint",
                "name": "Palais Brongniart Bourse",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f4f6f8",
                "c2": "#e6eaf0",
                "icon": "fa-landmark"
        },
        {
                "id": "wall-street-bullion",
                "name": "Federal Reserve Laid Bond",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#faf9f3",
                "c2": "#eeebe0",
                "icon": "fa-vault"
        },
        {
                "id": "tokyo-ginza-prestige",
                "name": "Ginza Financial Laid",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f8f9fa",
                "c2": "#e8ecef",
                "icon": "fa-briefcase"
        },
        {
                "id": "bund-shanghai-sterling",
                "name": "The Bund Executive Slate",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f1f5f9",
                "c2": "#e2e8f0",
                "icon": "fa-city"
        },
        {
                "id": "zurich-bahnhof-clean",
                "name": "Bahnhofstrasse Private Laid",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fafafa",
                "c2": "#ececec",
                "icon": "fa-landmark-dome"
        },
        {
                "id": "stockholm-gamla-stan",
                "name": "Riksdag Parliamentary Ivory",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fdfbf7",
                "c2": "#f4eee1",
                "icon": "fa-landmark"
        },
        {
                "id": "copenhagen-slotsholmen",
                "name": "Slotsholmen Government Bond",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f8fafc",
                "c2": "#e7edf4",
                "icon": "fa-flag"
        },
        {
                "id": "oslo-storting-vellum",
                "name": "Storting Royal Laid Paper",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fafbfc",
                "c2": "#e9eff5",
                "icon": "fa-shield"
        },
        {
                "id": "amsterdam-herengracht",
                "name": "Herengracht Patrician Vellum",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#faf7f0",
                "c2": "#ece5d8",
                "icon": "fa-house"
        },
        {
                "id": "brussels-parlement",
                "name": "European Quarter Editorial",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f3f5f8",
                "c2": "#e5e9f0",
                "icon": "fa-globe"
        },
        {
                "id": "dublin-four-courts",
                "name": "Four Courts Legal Ivory",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fafaf7",
                "c2": "#ebebe3",
                "icon": "fa-book"
        },
        {
                "id": "edinburgh-st-andrews",
                "name": "St Andrew Square Executive",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#f5f7fa",
                "c2": "#e6ecf3",
                "icon": "fa-building"
        },
        {
                "id": "harvard-law-review",
                "name": "Harvard Law Centennial Laid",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fdfcf9",
                "c2": "#f5f1e8",
                "icon": "fa-graduation-cap"
        },
        {
                "id": "yale-daily-newsprint",
                "name": "Old Campus Editorial Rag",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#faf9f5",
                "c2": "#ede9de",
                "icon": "fa-newspaper"
        },
        {
                "id": "oxford-union-manuscript",
                "name": "Oxford Union Debate Laid",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fbf8ee",
                "c2": "#eee7d4",
                "icon": "fa-comments"
        },
        {
                "id": "cambridge-tripos-vellum",
                "name": "Cambridge Senate House Bond",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fdfaf2",
                "c2": "#f0e9d6",
                "icon": "fa-award"
        },
        {
                "id": "heidelberg-academica",
                "name": "Heidelberg University Folio",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fdfcf7",
                "c2": "#f3ece0",
                "icon": "fa-school"
        },
        {
                "id": "leiden-juridica-cream",
                "name": "Leiden Law Faculty Vellum",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fcf9f2",
                "c2": "#eee5d5",
                "icon": "fa-scale-unbalanced"
        },
        {
                "id": "bologna-juris-canonici",
                "name": "Bologna Archiginnasio Laid",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#faf6ee",
                "c2": "#eae0ce",
                "icon": "fa-book-atlas"
        },
        {
                "id": "coimbra-bibliotheca",
                "name": "Joanina Baroque Manuscript",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#fbf7ec",
                "c2": "#eee3cb",
                "icon": "fa-feather"
        },
        {
                "id": "uppsala-carolina-folio",
                "name": "Carolina Rediviva Archive",
                "cat": "corporate",
                "type": "gradient",
                "c1": "#faf8f4",
                "c2": "#ebe3d8",
                "icon": "fa-file-signature"
        },
        {
                "id": "matte-noir",
                "name": "Matte Noir",
                "cat": "dark",
                "type": "gradient",
                "c1": "#121214",
                "c2": "#18181b",
                "icon": "fa-circle"
        },
        {
                "id": "obsidian-gold",
                "name": "Obsidian Gold",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1c1917",
                "c2": "#292524",
                "icon": "fa-crown"
        },
        {
                "id": "midnight-navy",
                "name": "Midnight Navy",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0f172a",
                "c2": "#1e293b",
                "icon": "fa-moon"
        },
        {
                "id": "smoked-titanium",
                "name": "Smoked Titanium",
                "cat": "dark",
                "type": "gradient",
                "c1": "#232526",
                "c2": "#414345",
                "icon": "fa-shield"
        },
        {
                "id": "royal-burgundy",
                "name": "Royal Burgundy",
                "cat": "dark",
                "type": "gradient",
                "c1": "#2c0b0e",
                "c2": "#451217",
                "icon": "fa-wine-glass"
        },
        {
                "id": "emerald-velvet",
                "name": "Emerald Velvet",
                "cat": "dark",
                "type": "gradient",
                "c1": "#062319",
                "c2": "#0d3a2a",
                "icon": "fa-ring"
        },
        {
                "id": "deep-space",
                "name": "Deep Space",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0a0f1d",
                "c2": "#162035",
                "icon": "fa-shuttle-space"
        },
        {
                "id": "gunmetal-slate",
                "name": "Gunmetal Slate",
                "cat": "dark",
                "type": "gradient",
                "c1": "#27272a",
                "c2": "#3f3f46",
                "icon": "fa-layer-group"
        },
        {
                "id": "espresso-roast",
                "name": "Espresso Roast",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1c140e",
                "c2": "#2e2118",
                "icon": "fa-mug-hot"
        },
        {
                "id": "deep-teal-noir",
                "name": "Deep Teal Noir",
                "cat": "dark",
                "type": "gradient",
                "c1": "#041d1e",
                "c2": "#0a2e30",
                "icon": "fa-water"
        },
        {
                "id": "eclipse-dark",
                "name": "Eclipse Gradient",
                "cat": "dark",
                "type": "gradient",
                "c1": "#090a0f",
                "c2": "#1e2029",
                "icon": "fa-circle-half-stroke"
        },
        {
                "id": "black-onyx",
                "name": "Black Onyx",
                "cat": "dark",
                "type": "gradient",
                "c1": "#050505",
                "c2": "#1a1a1a",
                "icon": "fa-gem"
        },
        {
                "id": "violet-night",
                "name": "Violet Night",
                "cat": "dark",
                "type": "gradient",
                "c1": "#180e29",
                "c2": "#2d184a",
                "icon": "fa-wand-magic-sparkles"
        },
        {
                "id": "dark-damask",
                "name": "Dark Damask",
                "cat": "dark",
                "type": "gradient",
                "c1": "#141416",
                "c2": "#222228",
                "icon": "fa-chess-king"
        },
        {
                "id": "cyber-matrix-dark",
                "name": "Cyber Matrix Dark",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0d1912",
                "c2": "#122b1e",
                "icon": "fa-terminal"
        },
        {
                "id": "charcoal-minimal",
                "name": "Charcoal Minimal",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1e1e1e",
                "c2": "#2d2d2d",
                "icon": "fa-square-full"
        },
        {
                "id": "steel-shadow",
                "name": "Steel Shadow",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1a202c",
                "c2": "#2d3748",
                "icon": "fa-cube"
        },
        {
                "id": "bronze-noir",
                "name": "Bronze Noir",
                "cat": "dark",
                "type": "gradient",
                "c1": "#261e14",
                "c2": "#3d2f1f",
                "icon": "fa-medal"
        },
        {
                "id": "midnight-amethyst",
                "name": "Midnight Amethyst",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1e0826",
                "c2": "#2e1040",
                "icon": "fa-gem"
        },
        {
                "id": "carbon-graphite",
                "name": "Carbon Graphite",
                "cat": "dark",
                "type": "gradient",
                "c1": "#18181b",
                "c2": "#27272a",
                "icon": "fa-atom"
        },
        {
                "id": "dark-cognac",
                "name": "Dark Cognac",
                "cat": "dark",
                "type": "gradient",
                "c1": "#2a170c",
                "c2": "#3d2314",
                "icon": "fa-whiskey-glass"
        },
        {
                "id": "deep-sapphire",
                "name": "Deep Sapphire",
                "cat": "dark",
                "type": "gradient",
                "c1": "#071527",
                "c2": "#0f2744",
                "icon": "fa-compass"
        },
        {
                "id": "imperial-jade",
                "name": "Imperial Jade",
                "cat": "dark",
                "type": "gradient",
                "c1": "#061d15",
                "c2": "#0d3225",
                "icon": "fa-shield-halved"
        },
        {
                "id": "phantom-grey",
                "name": "Phantom Grey",
                "cat": "dark",
                "type": "gradient",
                "c1": "#111827",
                "c2": "#1f2937",
                "icon": "fa-ghost"
        },
        {
                "id": "vampire-garnet",
                "name": "Vampire Garnet",
                "cat": "dark",
                "type": "gradient",
                "c1": "#210408",
                "c2": "#380710",
                "icon": "fa-droplet"
        },
        {
                "id": "midnight-pine",
                "name": "Midnight Pine",
                "cat": "dark",
                "type": "gradient",
                "c1": "#03170e",
                "c2": "#072e1d",
                "icon": "fa-tree"
        },
        {
                "id": "caviar-black",
                "name": "Caviar Black",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0d0d0f",
                "c2": "#17181c",
                "icon": "fa-circle"
        },
        {
                "id": "black-diamond-dark",
                "name": "Black Diamond Dark",
                "cat": "dark",
                "type": "gradient",
                "c1": "#111116",
                "c2": "#21212c",
                "icon": "fa-gem"
        },
        {
                "id": "dark-nebula",
                "name": "Dark Nebula",
                "cat": "dark",
                "type": "gradient",
                "c1": "#14052b",
                "c2": "#280a54",
                "icon": "fa-star"
        },
        {
                "id": "basalt-lava",
                "name": "Basalt Lava",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1c1917",
                "c2": "#322521",
                "icon": "fa-volcano"
        },
        {
                "id": "space-cadet",
                "name": "Space Cadet Navy",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0b132b",
                "c2": "#1c2541",
                "icon": "fa-shuttle-space"
        },
        {
                "id": "truffle-dark",
                "name": "Truffle Roast",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1b1612",
                "c2": "#2b231c",
                "icon": "fa-cookie-bite"
        },
        {
                "id": "black-tuxedo",
                "name": "Black Tuxedo",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0a0a0c",
                "c2": "#1a1a22",
                "icon": "fa-user-tie"
        },
        {
                "id": "dark-petroleum",
                "name": "Dark Petroleum",
                "cat": "dark",
                "type": "gradient",
                "c1": "#02161a",
                "c2": "#052c35",
                "icon": "fa-oil-well"
        },
        {
                "id": "cyber-void",
                "name": "Cyber Void",
                "cat": "dark",
                "type": "gradient",
                "c1": "#090d16",
                "c2": "#131c31",
                "icon": "fa-terminal"
        },
        {
                "id": "gothic-plum",
                "name": "Gothic Plum",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1b0e1e",
                "c2": "#301736",
                "icon": "fa-cross"
        },
        {
                "id": "abyssal-indigo",
                "name": "Abyssal Indigo",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0c0d21",
                "c2": "#161842",
                "icon": "fa-compass"
        },
        {
                "id": "bronze-patina",
                "name": "Bronze Patina",
                "cat": "dark",
                "type": "gradient",
                "c1": "#161b17",
                "c2": "#242c26",
                "icon": "fa-shield"
        },
        {
                "id": "noir-carbonite",
                "name": "Noir Carbonite",
                "cat": "dark",
                "type": "gradient",
                "c1": "#141414",
                "c2": "#242424",
                "icon": "fa-cube"
        },
        {
                "id": "midnight-chambray",
                "name": "Midnight Chambray",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0c1926",
                "c2": "#14283d",
                "icon": "fa-vest"
        },
        {
                "id": "royal-velvet-dark",
                "name": "Royal Velvet Dark",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1f0036",
                "c2": "#35005c",
                "icon": "fa-crown"
        },
        {
                "id": "dark-mahogany",
                "name": "Dark Mahogany",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1a0d0a",
                "c2": "#2e1610",
                "icon": "fa-tree"
        },
        {
                "id": "deep-merlot",
                "name": "Deep Merlot",
                "cat": "dark",
                "type": "gradient",
                "c1": "#260611",
                "c2": "#3f0d1f",
                "icon": "fa-wine-glass"
        },
        {
                "id": "obsidian-shale",
                "name": "Obsidian Shale",
                "cat": "dark",
                "type": "gradient",
                "c1": "#121316",
                "c2": "#1e2025",
                "icon": "fa-gem"
        },
        {
                "id": "astral-navy",
                "name": "Astral Navy",
                "cat": "dark",
                "type": "gradient",
                "c1": "#081226",
                "c2": "#102142",
                "icon": "fa-meteor"
        },
        {
                "id": "midnight-forest",
                "name": "Midnight Forest",
                "cat": "dark",
                "type": "gradient",
                "c1": "#041910",
                "c2": "#092e1f",
                "icon": "fa-leaf"
        },
        {
                "id": "black-pearl",
                "name": "Black Pearl",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0e1118",
                "c2": "#1b212f",
                "icon": "fa-circle"
        },
        {
                "id": "carbon-matrix",
                "name": "Carbon Matrix",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0f1412",
                "c2": "#1c2622",
                "icon": "fa-terminal"
        },
        {
                "id": "dark-amethyst-noir",
                "name": "Amethyst Noir",
                "cat": "dark",
                "type": "gradient",
                "c1": "#170a24",
                "c2": "#28143d",
                "icon": "fa-gem"
        },
        {
                "id": "smoked-obsidian",
                "name": "Smoked Obsidian",
                "cat": "dark",
                "type": "gradient",
                "c1": "#161616",
                "c2": "#262626",
                "icon": "fa-cloud"
        },
        {
                "id": "abyssal-trench",
                "name": "Abyssal Trench",
                "cat": "dark",
                "type": "gradient",
                "c1": "#030e1c",
                "c2": "#091e38",
                "icon": "fa-water"
        },
        {
                "id": "dark-espresso-crema",
                "name": "Dark Crema",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1f150e",
                "c2": "#332317",
                "icon": "fa-mug-hot"
        },
        {
                "id": "steel-monolith",
                "name": "Steel Monolith",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1a1d24",
                "c2": "#282d37",
                "icon": "fa-monument"
        },
        {
                "id": "gothic-crypt",
                "name": "Gothic Crypt",
                "cat": "dark",
                "type": "gradient",
                "c1": "#130f1c",
                "c2": "#221b30",
                "icon": "fa-cross"
        },
        {
                "id": "dark-cast-iron",
                "name": "Dark Cast Iron",
                "cat": "dark",
                "type": "gradient",
                "c1": "#17181c",
                "c2": "#23252b",
                "icon": "fa-shield"
        },
        {
                "id": "velvet-noir",
                "name": "Velvet Noir",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0f0d14",
                "c2": "#1e1929",
                "icon": "fa-feather"
        },
        {
                "id": "black-amber",
                "name": "Black Amber",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1f1305",
                "c2": "#33200a",
                "icon": "fa-sun"
        },
        {
                "id": "cyber-graphite",
                "name": "Cyber Graphite",
                "cat": "dark",
                "type": "gradient",
                "c1": "#111418",
                "c2": "#1e232a",
                "icon": "fa-microchip"
        },
        {
                "id": "midnight-indigo",
                "name": "Midnight Indigo",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0b0c26",
                "c2": "#141640",
                "icon": "fa-compass"
        },
        {
                "id": "dark-hematite",
                "name": "Dark Hematite",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1b1c1e",
                "c2": "#2b2d30",
                "icon": "fa-atom"
        },
        {
                "id": "monaco-casino-noir",
                "name": "Monte Carlo Royale Noir",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0a0a0f",
                "c2": "#141424",
                "icon": "fa-dice"
        },
        {
                "id": "savile-row-tuxedo",
                "name": "Savile Row Midnight Wool",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0b0c10",
                "c2": "#1f2833",
                "icon": "fa-user-tie"
        },
        {
                "id": "mayfair-club-leather",
                "name": "St James Club Cigar Room",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1a0f0a",
                "c2": "#2b1810",
                "icon": "fa-chair"
        },
        {
                "id": "orient-express-lacquer",
                "name": "Venice-Simplon Lacquer",
                "cat": "dark",
                "type": "gradient",
                "c1": "#16071e",
                "c2": "#2c103b",
                "icon": "fa-train"
        },
        {
                "id": "basalt-monolith-black",
                "name": "Nordic Basalt Monolith",
                "cat": "dark",
                "type": "gradient",
                "c1": "#121214",
                "c2": "#202024",
                "icon": "fa-mountain"
        },
        {
                "id": "deep-atlantic-abyss",
                "name": "Mariana Trench Abyssal",
                "cat": "dark",
                "type": "gradient",
                "c1": "#030b14",
                "c2": "#0a192f",
                "icon": "fa-water"
        },
        {
                "id": "carbon-forged-hypercar",
                "name": "Forged Carbon Hypercar",
                "cat": "dark",
                "type": "gradient",
                "c1": "#111215",
                "c2": "#1c1d22",
                "icon": "fa-gauge-high"
        },
        {
                "id": "black-truffle-roast",
                "name": "Piedmont Black Truffle",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1c1410",
                "c2": "#2d211b",
                "icon": "fa-utensils"
        },
        {
                "id": "imperial-amethyst-velvet",
                "name": "Romanov Imperial Amethyst",
                "cat": "dark",
                "type": "gradient",
                "c1": "#150524",
                "c2": "#270c3e",
                "icon": "fa-crown"
        },
        {
                "id": "smoked-quartz-crystal",
                "name": "Alpine Smoked Quartz",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1b1918",
                "c2": "#2c2826",
                "icon": "fa-gem"
        },
        {
                "id": "midnight-espresso-crema",
                "name": "Ristretto Dark Crema",
                "cat": "dark",
                "type": "gradient",
                "c1": "#170f0b",
                "c2": "#291b14",
                "icon": "fa-mug-hot"
        },
        {
                "id": "titanium-gunmetal-stealth",
                "name": "Blackhawk Stealth Titanium",
                "cat": "dark",
                "type": "gradient",
                "c1": "#16181d",
                "c2": "#252830",
                "icon": "fa-jet-fighter"
        },
        {
                "id": "bordeaux-cellar-noir",
                "name": "Premier Cru Reserve Noir",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1e050f",
                "c2": "#330a1b",
                "icon": "fa-wine-bottle"
        },
        {
                "id": "deep-conifer-forest",
                "name": "Black Forest Midnight Spruce",
                "cat": "dark",
                "type": "gradient",
                "c1": "#05160e",
                "c2": "#0c281b",
                "icon": "fa-tree"
        },
        {
                "id": "carbon-aerogel-matte",
                "name": "Supercritical Aerogel Void",
                "cat": "dark",
                "type": "gradient",
                "c1": "#080808",
                "c2": "#141414",
                "icon": "fa-cube"
        },
        {
                "id": "black-mother-of-pearl",
                "name": "Tahitian Black Pearl Nacre",
                "cat": "dark",
                "type": "gradient",
                "c1": "#111418",
                "c2": "#1c2128",
                "icon": "fa-circle-dot"
        },
        {
                "id": "obsidian-scalpel-edge",
                "name": "Polished Obsidian Knife",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0d0f12",
                "c2": "#1a1e24",
                "icon": "fa-wand-magic-sparkles"
        },
        {
                "id": "vulcan-volcanic-cinder",
                "name": "Stromboli Volcanic Cinder",
                "cat": "dark",
                "type": "gradient",
                "c1": "#140e10",
                "c2": "#24181c",
                "icon": "fa-volcano"
        },
        {
                "id": "deep-space-exoplanet",
                "name": "Interstellar Vacuum Noir",
                "cat": "dark",
                "type": "gradient",
                "c1": "#04040c",
                "c2": "#0a0c1a",
                "icon": "fa-satellite"
        },
        {
                "id": "gothic-cathedral-shadow",
                "name": "Notre Dame Gargoyle Shadow",
                "cat": "dark",
                "type": "gradient",
                "c1": "#131318",
                "c2": "#22222a",
                "icon": "fa-church"
        },
        {
                "id": "cartier-panthere-noir",
                "name": "Place Vend\u00f4me Panth\u00e8re",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0a0a0c",
                "c2": "#17171d",
                "icon": "fa-gem"
        },
        {
                "id": "bourbon-cask-reserve",
                "name": "Kentucky Bourbon Char",
                "cat": "dark",
                "type": "gradient",
                "c1": "#1c110a",
                "c2": "#301d12",
                "icon": "fa-whiskey-glass"
        },
        {
                "id": "midnight-matterhorn",
                "name": "Alpine Matterhorn Starlight",
                "cat": "dark",
                "type": "gradient",
                "c1": "#070b14",
                "c2": "#0e1628",
                "icon": "fa-mountain"
        },
        {
                "id": "deep-sea-anglerfish",
                "name": "Bioluminescent Bathypelagic",
                "cat": "dark",
                "type": "gradient",
                "c1": "#020712",
                "c2": "#051329",
                "icon": "fa-water"
        },
        {
                "id": "carbon-ferrari-corsa",
                "name": "Maranello Corsa Carbon",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0d0d0f",
                "c2": "#19191e",
                "icon": "fa-gauge-high"
        },
        {
                "id": "caviar-ossetra-noir",
                "name": "Caspian Imperial Ossetra",
                "cat": "dark",
                "type": "gradient",
                "c1": "#111417",
                "c2": "#1d232a",
                "icon": "fa-fish"
        },
        {
                "id": "gothic-notre-dame",
                "name": "Nocturnal Cloister Shadow",
                "cat": "dark",
                "type": "gradient",
                "c1": "#100d14",
                "c2": "#1e1826",
                "icon": "fa-cross"
        },
        {
                "id": "black-opal-lightning",
                "name": "Lightning Ridge Black Opal",
                "cat": "dark",
                "type": "gradient",
                "c1": "#08111e",
                "c2": "#0f233d",
                "icon": "fa-wand-magic-sparkles"
        },
        {
                "id": "obsidian-mirror-aztec",
                "name": "Teotihuacan Obsidian Mirror",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0a0a0a",
                "c2": "#161616",
                "icon": "fa-circle"
        },
        {
                "id": "dubai-skyline-dusk",
                "name": "Burj Nocturne Platinum",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0d1117",
                "c2": "#161b22",
                "icon": "fa-city"
        },
        {
                "id": "vatican-archivum-secretum",
                "name": "Apostolic Archive Vellum",
                "cat": "dark",
                "type": "gradient",
                "c1": "#140e0b",
                "c2": "#261a15",
                "icon": "fa-key"
        },
        {
                "id": "black-angus-steakhouse",
                "name": "Charcoal Grill Smoke Noir",
                "cat": "dark",
                "type": "gradient",
                "c1": "#14100e",
                "c2": "#241c19",
                "icon": "fa-fire-burner"
        },
        {
                "id": "kyoto-urushi-lacquer",
                "name": "Wajima Black Gold Urushi",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0f0806",
                "c2": "#21120d",
                "icon": "fa-bowl-rice"
        },
        {
                "id": "vienna-philharmonic-tux",
                "name": "Musikverein Tuxedo Serge",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0c0d12",
                "c2": "#181a24",
                "icon": "fa-music"
        },
        {
                "id": "deep-mercury-thermometer",
                "name": "Quicksilver Subzero Shadow",
                "cat": "dark",
                "type": "gradient",
                "c1": "#13161a",
                "c2": "#21272e",
                "icon": "fa-temperature-quarter"
        },
        {
                "id": "siberian-taiga-midnight",
                "name": "Taiga Boreal Midnight",
                "cat": "dark",
                "type": "gradient",
                "c1": "#03140e",
                "c2": "#07241a",
                "icon": "fa-tree"
        },
        {
                "id": "dark-cognac-xo-noir",
                "name": "Grande Champagne XO Reserve",
                "cat": "dark",
                "type": "gradient",
                "c1": "#210d05",
                "c2": "#381709",
                "icon": "fa-wine-bottle"
        },
        {
                "id": "quantum-telemetry-noir",
                "name": "Cryostat Superconductor",
                "cat": "dark",
                "type": "gradient",
                "c1": "#060a12",
                "c2": "#0c1524",
                "icon": "fa-satellite"
        },
        {
                "id": "andalusian-horses-black",
                "name": "Royal Andalusian Stallion",
                "cat": "dark",
                "type": "gradient",
                "c1": "#08080a",
                "c2": "#141418",
                "icon": "fa-horse"
        },
        {
                "id": "dark-petroleum-crude",
                "name": "North Sea Brent Petroleum",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0b1114",
                "c2": "#152026",
                "icon": "fa-oil-well"
        },
        {
                "id": "antarctic-polar-night",
                "name": "Vostok Polar Nightfall",
                "cat": "dark",
                "type": "gradient",
                "c1": "#030814",
                "c2": "#081329",
                "icon": "fa-snowflake"
        },
        {
                "id": "matte-titanium-bezel",
                "name": "Chronograph Matte Titanium",
                "cat": "dark",
                "type": "gradient",
                "c1": "#18191d",
                "c2": "#282a30",
                "icon": "fa-stopwatch"
        },
        {
                "id": "basalt-columns-faj\u00e3",
                "name": "Azores Volcanic Faj\u00e3",
                "cat": "dark",
                "type": "gradient",
                "c1": "#0d0f12",
                "c2": "#191d24",
                "icon": "fa-volcano"
        },
        {
                "id": "midnight-monorail-tokyo",
                "name": "Yurikamome Waterfront Bay",
                "cat": "dark",
                "type": "gradient",
                "c1": "#080d19",
                "c2": "#111c33",
                "icon": "fa-train-subway"
        },
        {
                "id": "gothic-black-velvet",
                "name": "Opera Garnier Dark Velvet",
                "cat": "dark",
                "type": "gradient",
                "c1": "#110b14",
                "c2": "#221629",
                "icon": "fa-mask"
        },
        {
                "id": "sage-matcha",
                "name": "Sage Matcha",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#e8f5e9",
                "c2": "#c8e6c9",
                "icon": "fa-seedling"
        },
        {
                "id": "blush-rose",
                "name": "Blush Rose",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fce4ec",
                "c2": "#f8bbd0",
                "icon": "fa-spa"
        },
        {
                "id": "lavender-mist",
                "name": "Lavender Mist",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f3e5f5",
                "c2": "#e1bee7",
                "icon": "fa-flower"
        },
        {
                "id": "terracotta-clay",
                "name": "Terracotta Clay",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fbe9e7",
                "c2": "#ffccbc",
                "icon": "fa-shapes"
        },
        {
                "id": "desert-sandstone",
                "name": "Desert Sandstone",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff8e1",
                "c2": "#ffecb3",
                "icon": "fa-sun"
        },
        {
                "id": "mint-breeze",
                "name": "Mint Breeze",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#e0f2f1",
                "c2": "#b2dfdb",
                "icon": "fa-wind"
        },
        {
                "id": "soft-peach",
                "name": "Soft Peach",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff3e0",
                "c2": "#ffe0b2",
                "icon": "fa-circle-dot"
        },
        {
                "id": "morning-sky",
                "name": "Morning Sky",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#e1f5fe",
                "c2": "#b3e5fc",
                "icon": "fa-cloud"
        },
        {
                "id": "lilac-dream",
                "name": "Lilac Dream",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#ede7f6",
                "c2": "#d1c4e9",
                "icon": "fa-moon"
        },
        {
                "id": "buttercream",
                "name": "Buttercream",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefde8",
                "c2": "#fef08a",
                "icon": "fa-ice-cream"
        },
        {
                "id": "eucalyptus",
                "name": "Eucalyptus Green",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#ecfdf5",
                "c2": "#a7f3d0",
                "icon": "fa-leaf"
        },
        {
                "id": "coral-whisper",
                "name": "Coral Whisper",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff1f2",
                "c2": "#fecdd3",
                "icon": "fa-heart"
        },
        {
                "id": "warm-oat",
                "name": "Warm Oat",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fafaf9",
                "c2": "#e7e5e4",
                "icon": "fa-wheat-awn"
        },
        {
                "id": "dusty-mauve",
                "name": "Dusty Mauve",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fae8ff",
                "c2": "#f0abfc",
                "icon": "fa-gem"
        },
        {
                "id": "glacier-mist",
                "name": "Glacier Mist",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f0fdfa",
                "c2": "#99f6e4",
                "icon": "fa-droplet"
        },
        {
                "id": "chamomile",
                "name": "Chamomile Cream",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fffbeb",
                "c2": "#fde68a",
                "icon": "fa-sun-plant-wilt"
        },
        {
                "id": "apricot-sorbet",
                "name": "Apricot Sorbet",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff7ed",
                "c2": "#fed7aa",
                "icon": "fa-apple-whole"
        },
        {
                "id": "celadon-green",
                "name": "Celadon Green",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f0fdf4",
                "c2": "#bbf7d0",
                "icon": "fa-clover"
        },
        {
                "id": "powder-periwinkle",
                "name": "Powder Periwinkle",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#eef2ff",
                "c2": "#c7d2fe",
                "icon": "fa-cloud-meatball"
        },
        {
                "id": "warm-alabaster",
                "name": "Warm Alabaster",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefce8",
                "c2": "#fef08a",
                "icon": "fa-cookie"
        },
        {
                "id": "rose-clay",
                "name": "Rose Clay",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff1f2",
                "c2": "#fecdd3",
                "icon": "fa-feather"
        },
        {
                "id": "coastal-fog",
                "name": "Coastal Fog",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f8fafc",
                "c2": "#e2e8f0",
                "icon": "fa-water"
        },
        {
                "id": "pistachio-cream",
                "name": "Pistachio Cream",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f7fee7",
                "c2": "#d9f99d",
                "icon": "fa-seedling"
        },
        {
                "id": "vanilla-latte",
                "name": "Vanilla Latte",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fffbeb",
                "c2": "#f5ebe0",
                "icon": "fa-mug-saucer"
        },
        {
                "id": "honey-dew",
                "name": "Honeydew Melon",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f0fdf4",
                "c2": "#dcfce7",
                "icon": "fa-apple-whole"
        },
        {
                "id": "seafoam-glow",
                "name": "Seafoam Glow",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#e6fffa",
                "c2": "#b2f5ea",
                "icon": "fa-water"
        },
        {
                "id": "pale-papaya",
                "name": "Pale Papaya",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff7ed",
                "c2": "#fed7aa",
                "icon": "fa-lemon"
        },
        {
                "id": "cloud-dancer",
                "name": "Cloud Dancer",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f8fafc",
                "c2": "#f1f5f9",
                "icon": "fa-cloud"
        },
        {
                "id": "rosewater",
                "name": "Rosewater Tint",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff1f2",
                "c2": "#ffe4e6",
                "icon": "fa-spa"
        },
        {
                "id": "creamy-macaron",
                "name": "Creamy Macaron",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fdf4ff",
                "c2": "#fae8ff",
                "icon": "fa-cookie"
        },
        {
                "id": "almond-milk",
                "name": "Almond Milk",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fdfbf7",
                "c2": "#f7f1e5",
                "icon": "fa-mug-hot"
        },
        {
                "id": "foggy-fjord",
                "name": "Foggy Fjord",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f0fdfa",
                "c2": "#ccfbf1",
                "icon": "fa-mountain"
        },
        {
                "id": "soft-thistle",
                "name": "Soft Thistle",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#faf5ff",
                "c2": "#f3e8ff",
                "icon": "fa-plant-wilt"
        },
        {
                "id": "chamomile-tea",
                "name": "Chamomile Tea",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefce8",
                "c2": "#fef9c3",
                "icon": "fa-mug-saucer"
        },
        {
                "id": "linen-whisper",
                "name": "Linen Whisper",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fbfaf8",
                "c2": "#f4efe6",
                "icon": "fa-feather"
        },
        {
                "id": "pale-sagebrush",
                "name": "Pale Sagebrush",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f2f7f4",
                "c2": "#dcece1",
                "icon": "fa-seedling"
        },
        {
                "id": "blush-prosecco",
                "name": "Blush Prosecco",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff5f5",
                "c2": "#fed7d7",
                "icon": "fa-champagne-glasses"
        },
        {
                "id": "arctic-morning",
                "name": "Arctic Morning",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f0f9ff",
                "c2": "#bae6fd",
                "icon": "fa-snowflake"
        },
        {
                "id": "warm-shortbread",
                "name": "Warm Shortbread",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fffbeb",
                "c2": "#fde68a",
                "icon": "fa-bread-slice"
        },
        {
                "id": "silver-willow",
                "name": "Silver Willow",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f8fafc",
                "c2": "#e2e8f0",
                "icon": "fa-tree"
        },
        {
                "id": "elderflower-cream",
                "name": "Elderflower Cream",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefce8",
                "c2": "#fef08a",
                "icon": "fa-seedling"
        },
        {
                "id": "lavender-ice",
                "name": "Lavender Ice",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f5f3ff",
                "c2": "#ede9fe",
                "icon": "fa-snowflake"
        },
        {
                "id": "soft-cashmere",
                "name": "Soft Cashmere",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#faf7f2",
                "c2": "#ede4d6",
                "icon": "fa-mitten"
        },
        {
                "id": "ocean-foam",
                "name": "Ocean Foam",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#ecfdf5",
                "c2": "#d1fae5",
                "icon": "fa-water"
        },
        {
                "id": "blush-peony",
                "name": "Blush Peony",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff1f2",
                "c2": "#ffe4e6",
                "icon": "fa-spa"
        },
        {
                "id": "sweet-cantaloupe",
                "name": "Sweet Cantaloupe",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff7ed",
                "c2": "#fed7aa",
                "icon": "fa-lemon"
        },
        {
                "id": "willow-green",
                "name": "Willow Green",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f0fdf4",
                "c2": "#dcfce7",
                "icon": "fa-leaf"
        },
        {
                "id": "powder-hydrangea",
                "name": "Powder Hydrangea",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#eff6ff",
                "c2": "#dbeafe",
                "icon": "fa-seedling"
        },
        {
                "id": "soft-chamois",
                "name": "Soft Chamois",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fdfbf7",
                "c2": "#f5edd8",
                "icon": "fa-scroll"
        },
        {
                "id": "pebble-grey",
                "name": "Pebble Grey",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f8fafc",
                "c2": "#e2e8f0",
                "icon": "fa-gem"
        },
        {
                "id": "pale-terracotta",
                "name": "Pale Terracotta",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff1ee",
                "c2": "#fed7cd",
                "icon": "fa-shapes"
        },
        {
                "id": "creamy-vanilla",
                "name": "Creamy Vanilla",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefdf0",
                "c2": "#fef7cd",
                "icon": "fa-ice-cream"
        },
        {
                "id": "mint-eucalyptus",
                "name": "Mint Eucalyptus",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f0fdf9",
                "c2": "#ccfbf1",
                "icon": "fa-wind"
        },
        {
                "id": "soft-primrose",
                "name": "Soft Primrose",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fffbeb",
                "c2": "#fef3c7",
                "icon": "fa-sun"
        },
        {
                "id": "misty-heath",
                "name": "Misty Heath",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#faf5ff",
                "c2": "#f3e8ff",
                "icon": "fa-cloud"
        },
        {
                "id": "warm-biscuit",
                "name": "Warm Biscuit",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#faf6f0",
                "c2": "#ece2d0",
                "icon": "fa-cookie"
        },
        {
                "id": "blush-quartz",
                "name": "Blush Quartz",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fdf2f4",
                "c2": "#fce2e6",
                "icon": "fa-heart"
        },
        {
                "id": "pale-aquamarine",
                "name": "Pale Aquamarine",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f0fdfa",
                "c2": "#bbf7d0",
                "icon": "fa-water"
        },
        {
                "id": "soft-flaxen",
                "name": "Soft Flaxen",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefce8",
                "c2": "#fbf3b9",
                "icon": "fa-wheat-awn"
        },
        {
                "id": "nordic-birch-pastel",
                "name": "Nordic Birch Pastel",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fafaf8",
                "c2": "#ede8db",
                "icon": "fa-tree"
        },
        {
                "id": "matcha-ceremonial-foam",
                "name": "Ceremonial Uji Matcha Foam",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f0f7ee",
                "c2": "#d8ecd5",
                "icon": "fa-leaf"
        },
        {
                "id": "french-macaron-pistache",
                "name": "Ladur\u00e9e Pistachio Macaron",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#eef7ee",
                "c2": "#d9edd9",
                "icon": "fa-cookie-bite"
        },
        {
                "id": "oat-milk-cortado",
                "name": "Oat Milk Cortado Foam",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fdfbf7",
                "c2": "#f3eee5",
                "icon": "fa-mug-saucer"
        },
        {
                "id": "cloudberry-subarctic",
                "name": "Lappland Cloudberry Jam",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff7ed",
                "c2": "#fed7aa",
                "icon": "fa-apple-whole"
        },
        {
                "id": "provence-lavender-field",
                "name": "Valensole Lavender Bud",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#faf5ff",
                "c2": "#e9d5ff",
                "icon": "fa-plant-wilt"
        },
        {
                "id": "sicilian-almond-granita",
                "name": "Noto Sweet Almond Milk",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fffdfa",
                "c2": "#fef3c7",
                "icon": "fa-ice-cream"
        },
        {
                "id": "coastal-eucalyptus-breeze",
                "name": "Blue Mountains Eucalyptus",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#ecfdf5",
                "c2": "#a7f3d0",
                "icon": "fa-wind"
        },
        {
                "id": "kyoto-cherry-blossom-haze",
                "name": "Maruyama Hanami Haze",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff1f2",
                "c2": "#fecdd3",
                "icon": "fa-fan"
        },
        {
                "id": "nordic-lichen-tundra",
                "name": "Lapland Reindeer Lichen",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f4f7f4",
                "c2": "#dae3d9",
                "icon": "fa-mountain-sun"
        },
        {
                "id": "cappuccino-dry-froth",
                "name": "Vienna Melange Milk Foam",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fdfcf9",
                "c2": "#f5ede0",
                "icon": "fa-coffee"
        },
        {
                "id": "dune-coastal-reed",
                "name": "Sylt Coastal Marram Reed",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefce8",
                "c2": "#fef08a",
                "icon": "fa-wheat-awn"
        },
        {
                "id": "andalusian-apricot-sorbet",
                "name": "Seville Sun Apricot Sorbet",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff7ed",
                "c2": "#ffedd5",
                "icon": "fa-bowl-food"
        },
        {
                "id": "glacier-meltwater-aqua",
                "name": "J\u00f6kuls\u00e1rl\u00f3n Glacial Pool",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f0fdfa",
                "c2": "#ccfbf1",
                "icon": "fa-water"
        },
        {
                "id": "chamomile-blossom-infusion",
                "name": "German Chamomile Tisane",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefce8",
                "c2": "#fef9c3",
                "icon": "fa-mug-hot"
        },
        {
                "id": "dusty-sage-herbarium",
                "name": "Old Botanical Herbarium Sage",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f1f6f2",
                "c2": "#dce8dd",
                "icon": "fa-book-bookmark"
        },
        {
                "id": "warm-alabaster-statue",
                "name": "Greek Alabaster Gallery",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fafaf8",
                "c2": "#edebe6",
                "icon": "fa-monument"
        },
        {
                "id": "soft-terracotta-blush",
                "name": "Chianti Baked Clay Pot",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff1ee",
                "c2": "#fed7cc",
                "icon": "fa-shapes"
        },
        {
                "id": "morning-mountain-mist",
                "name": "Dolomite Dawn Reflection",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f0fdf4",
                "c2": "#dcfce7",
                "icon": "fa-cloud-sun"
        },
        {
                "id": "buttercup-meadow-tint",
                "name": "Cotswold Buttercup Field",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefce8",
                "c2": "#fef08a",
                "icon": "fa-sun"
        },
        {
                "id": "cashmere-pashmina-shawl",
                "name": "Himalayan Handspun Pashmina",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#faf8f5",
                "c2": "#ede6dc",
                "icon": "fa-mitten"
        },
        {
                "id": "matcha-latte-foam",
                "name": "Shizuoka Matcha Latte",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#eff8f0",
                "c2": "#d4ebd6",
                "icon": "fa-leaf"
        },
        {
                "id": "earl-grey-cream",
                "name": "Bergamot Earl Grey Cream",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f9f8f4",
                "c2": "#ebe6d8",
                "icon": "fa-mug-hot"
        },
        {
                "id": "cloud-dancer-ivory",
                "name": "Cloud Dancer Silk",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fafaf7",
                "c2": "#ecebe4",
                "icon": "fa-cloud"
        },
        {
                "id": "almond-flour-biscuit",
                "name": "Sardinian Almond Biscotti",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefbf3",
                "c2": "#f5eee0",
                "icon": "fa-cookie"
        },
        {
                "id": "nordic-lichen-moss",
                "name": "Scandi Reindeer Moss",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f2f7f2",
                "c2": "#d9e8da",
                "icon": "fa-tree"
        },
        {
                "id": "blush-camellia-petal",
                "name": "Camellia Japonica Petal",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff1f3",
                "c2": "#fed5dc",
                "icon": "fa-flower"
        },
        {
                "id": "champagne-coupe-fizz",
                "name": "Reims Champagne Mousse",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefcf2",
                "c2": "#f9f1d8",
                "icon": "fa-champagne-glasses"
        },
        {
                "id": "provence-shea-butter",
                "name": "Artisan Shea Butter Balm",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fffdf5",
                "c2": "#f9f3da",
                "icon": "fa-spa"
        },
        {
                "id": "coastal-dune-grass",
                "name": "Cape Cod Salt Hay Grass",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefce8",
                "c2": "#f4f1be",
                "icon": "fa-wheat-awn"
        },
        {
                "id": "sicilian-lemon-curd",
                "name": "Sorrento Lemon Curd",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefde8",
                "c2": "#fef5aa",
                "icon": "fa-lemon"
        },
        {
                "id": "fuji-morning-mist",
                "name": "Lake Kawaguchi Morning",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f0f9ff",
                "c2": "#d5efff",
                "icon": "fa-mountain-sun"
        },
        {
                "id": "apricot-macaron-shell",
                "name": "Pierre Herm\u00e9 Apricot Shell",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff7ed",
                "c2": "#fedec7",
                "icon": "fa-cookie-bite"
        },
        {
                "id": "warm-linen-towel",
                "name": "Turkish Organic Linen Towel",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#faf7f2",
                "c2": "#ece4d8",
                "icon": "fa-bath"
        },
        {
                "id": "cappuccino-dry-foam",
                "name": "Roman Bar Cappuccino Foam",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fdfbf7",
                "c2": "#f2eae0",
                "icon": "fa-coffee"
        },
        {
                "id": "powder-periwinkle-sky",
                "name": "Alpine Periwinkle Horizon",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f0f4ff",
                "c2": "#d9e2ff",
                "icon": "fa-cloud-sun"
        },
        {
                "id": "sage-smudge-herb",
                "name": "Mojave Desert White Sage",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f1f7f3",
                "c2": "#d6e8dc",
                "icon": "fa-plant-wilt"
        },
        {
                "id": "tahitian-vanilla-pod",
                "name": "Bora Bora Sweet Vanilla",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefaf0",
                "c2": "#f4ecd4",
                "icon": "fa-ice-cream"
        },
        {
                "id": "blush-quince-puree",
                "name": "Autumn Quince Preserve",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff1f2",
                "c2": "#fed6dc",
                "icon": "fa-apple-whole"
        },
        {
                "id": "icelandic-geothermal-clay",
                "name": "Blue Lagoon Silica Mud",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f1fdfb",
                "c2": "#c7f7f0",
                "icon": "fa-hand-holding-droplet"
        },
        {
                "id": "warm-terracotta-sun",
                "name": "Siena Sunbaked Floor Tile",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fff1ee",
                "c2": "#fed0c5",
                "icon": "fa-sun"
        },
        {
                "id": "misty-scottish-glen",
                "name": "Glen Coe Highland Mist",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#f3f6f3",
                "c2": "#dae3db",
                "icon": "fa-cloud-rain"
        },
        {
                "id": "andalusian-almond-milk",
                "name": "Horchata de Chufa Foam",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fdfcf9",
                "c2": "#f5eee2",
                "icon": "fa-glass-water"
        },
        {
                "id": "danish-butter-cookie",
                "name": "Royal Dansk Butter Biscuit",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefcf0",
                "c2": "#f9f1ce",
                "icon": "fa-cake-candles"
        },
        {
                "id": "spring-meadow-buttercup",
                "name": "Wiltshire Meadow Buttercup",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#fefee8",
                "c2": "#fef8a3",
                "icon": "fa-seedling"
        },
        {
                "id": "cashmere-wool-cloud",
                "name": "Mongolian White Cashmere",
                "cat": "pastel",
                "type": "gradient",
                "c1": "#faf8f4",
                "c2": "#eae5dc",
                "icon": "fa-mitten"
        }
];

    const getThemeBackgroundCss = (t) => {
        if (t.type === 'gradient') {
            return `linear-gradient(135deg, ${t.c1}, ${t.c2})`;
        } else {
            return `${t.c1} url('${t.url}')`;
        }
    };

    const createSwatchEl = (t, extraClass = '') => {
        const div = document.createElement('div');
        div.className = `ts-swatch ${extraClass}`.trim();
        div.setAttribute('data-theme-id', t.id);
        div.setAttribute('data-theme-name', t.name);
        div.setAttribute('data-type', t.type);
        div.setAttribute('data-c1', t.c1);
        if (t.c2) div.setAttribute('data-c2', t.c2);
        if (t.url) div.setAttribute('data-url', t.url);
        div.title = t.name;
        div.style.background = getThemeBackgroundCss(t);
        return div;
    };

    // ==========================================
    // 4. BUILD THE UI DOM
    // ==========================================
    const studioContainer = document.createElement('div');
    studioContainer.id = 'advanced-theme-studio';
    studioContainer.className = 'group';

    // 4a. Compact Ribbon Gallery Container
    const galleryContainer = document.createElement('div');
    galleryContainer.className = 'ts-gallery-container';
    galleryContainer.id = 'ts-gallery-container';

    const galleryViewport = document.createElement('div');
    galleryViewport.className = 'ts-gallery-viewport';
    galleryViewport.id = 'ts-gallery-viewport';

    const galleryStrip = document.createElement('div');
    galleryStrip.className = 'ts-gallery-strip';
    galleryStrip.id = 'ts-gallery-strip';

    // Populate gallery strip with all 88 themes
    ALL_THEMES.forEach(t => {
        galleryStrip.appendChild(createSwatchEl(t));
    });
    galleryViewport.appendChild(galleryStrip);

    // Vertical Gallery Controls (▲, ▼, ⌄)
    const galleryControls = document.createElement('div');
    galleryControls.className = 'ts-gallery-controls';
    galleryControls.innerHTML = `
        <button type="button" class="ts-gallery-btn" id="ts-gallery-up" title="Previous Themes (Up)">
            <svg viewBox="0 0 16 16" width="9" height="9" fill="currentColor"><path d="M8 4.5l5 5.5H3z"/></svg>
        </button>
        <button type="button" class="ts-gallery-btn" id="ts-gallery-down" title="Next Themes (Down)">
            <svg viewBox="0 0 16 16" width="9" height="9" fill="currentColor"><path d="M8 11.5l-5-5.5h10z"/></svg>
        </button>
        <button type="button" class="ts-gallery-btn" id="ts-gallery-more" title="More Themes (700 Catalog)">
            <svg viewBox="0 0 16 16" width="9" height="9" fill="currentColor"><path d="M2 3h12v1.8H2zm1.5 4.2h9L8 13z"/></svg>
        </button>
    `;

    galleryContainer.appendChild(galleryViewport);
    galleryContainer.appendChild(galleryControls);

    // Build ribbon layout
    studioContainer.innerHTML = `<div class="ts-ribbon-container">
            <div id="ts-clear-theme-btn" title="Remove Theme">
                <i class="fas fa-eraser"></i>
                <span style="line-height: 1.2;">Remove<br>Theme</span>
            </div>
            
            <div id="no-bg-btn" onclick="toggleIgnoreTheme()" title="Ignore Theme (Blank Page)">
                <i class="fas fa-ban"></i>
                <span style="line-height: 1.2;">Ignore<br>Theme</span>
            </div>
            
            <div class="ts-divider"></div>
            <!-- galleryContainer inserted here -->
            <div class="ts-divider"></div>
            
            <div class="ts-sliders-container" id="ts-sliders-container">
                <div class="ts-sliders-col" id="ts-col-1">
                    <div class="ts-slider-row" id="ts-row-sat">
                        <div class="ts-slider-label-wrap">
                            <span class="ts-slider-label">Saturation</span>
                            <span class="ts-badge-pill" id="ts-sat-badge" title="Click to reset Saturation to 100%">100%</span>
                        </div>
                        <input type="range" id="ts-sat-slider" class="ts-slider" min="0" max="200" value="100" aria-label="Saturation">
                    </div>
                    <div class="ts-slider-row" id="ts-row-bri">
                        <div class="ts-slider-label-wrap">
                            <span class="ts-slider-label">Brightness</span>
                            <span class="ts-badge-pill" id="ts-bri-badge" title="Click to reset Brightness to 100%">100%</span>
                        </div>
                        <input type="range" id="ts-bri-slider" class="ts-slider" min="50" max="150" value="100" aria-label="Brightness">
                    </div>
                    <div class="ts-slider-row" id="ts-row-con">
                        <div class="ts-slider-label-wrap">
                            <span class="ts-slider-label">Contrast</span>
                            <span class="ts-badge-pill" id="ts-con-badge" title="Click to reset Contrast to 100%">100%</span>
                        </div>
                        <input type="range" id="ts-con-slider" class="ts-slider" min="50" max="150" value="100" aria-label="Contrast">
                    </div>
                </div>
                
                <div class="ts-divider"></div>

                <div class="ts-sliders-col" id="ts-col-2">
                    <div class="ts-slider-row" id="ts-row-hue">
                        <div class="ts-slider-label-wrap">
                            <span class="ts-slider-label">Hue Shift</span>
                            <span class="ts-badge-pill" id="ts-hue-badge" title="Click to reset Hue Shift to 0°">0°</span>
                        </div>
                        <input type="range" id="ts-hue-slider" class="ts-slider" min="0" max="360" value="0" aria-label="Hue Shift">
                    </div>
                    <div class="ts-slider-row" id="ts-row-tex">
                        <div class="ts-slider-label-wrap">
                            <span class="ts-slider-label">Texture</span>
                            <span class="ts-badge-pill" id="ts-tex-badge" title="Click to reset Texture to 100%">100%</span>
                        </div>
                        <input type="range" id="ts-tex-slider" class="ts-slider" min="0" max="100" value="100" aria-label="Texture Opacity">
                    </div>
                    <div class="ts-slider-row" id="ts-row-size">
                        <div class="ts-slider-label-wrap">
                            <span class="ts-slider-label">Zoom</span>
                            <span class="ts-badge-pill" id="ts-size-badge" title="Click to reset Pattern Zoom to 100%">100%</span>
                        </div>
                        <input type="range" id="ts-size-slider" class="ts-slider" min="25" max="300" step="5" value="100" aria-label="Pattern Zoom">
                    </div>
                </div>
            </div>
        </div>
        <div class="group-label">Theme Studio</div>`;

    const dividers = studioContainer.querySelectorAll('.ts-divider');
    dividers[0].parentNode.insertBefore(galleryContainer, dividers[1]);

    // Inject studio container into the ribbon
    if (oldThemeGroup && oldThemeGroup.parentNode) {
        oldThemeGroup.parentNode.insertBefore(studioContainer, oldThemeGroup.nextSibling);
    } else {
        document.body.appendChild(studioContainer);
    }

    // 4b. Create Categorized Dropdown Popover
    const popover = document.createElement('div');
    popover.id = 'ts-gallery-popover';
    popover.style.display = 'none';

    let popoverBodyHTML = '';
    THEME_CATEGORIES.forEach(cat => {
        const catThemes = ALL_THEMES.filter(t => t.cat === cat.id);
        popoverBodyHTML += `
            <div class="ts-cat-section" data-cat="${cat.id}">
                <div class="ts-cat-header">
                    <span class="ts-cat-title"><i class="fas ${cat.icon}"></i> ${cat.name}</span>
                    <span class="ts-cat-badge">${catThemes.length}</span>
                </div>
                <div class="ts-cat-grid">
        `;
        catThemes.forEach(t => {
            const bg = getThemeBackgroundCss(t);
            const c2Attr = t.c2 ? `data-c2="${t.c2}"` : '';
            const urlAttr = t.url ? `data-url="${t.url}"` : '';
            popoverBodyHTML += `<div class="ts-swatch" data-theme-id="${t.id}" data-theme-name="${t.name}" data-type="${t.type}" data-c1="${t.c1}" ${c2Attr} ${urlAttr} title="${t.name}" style="background: ${bg};"></div>`;
        });
        popoverBodyHTML += `
                </div>
            </div>
        `;
    });

    popover.innerHTML = `
        <div class="ts-popover-header">
            <div class="ts-popover-title-row">
                <span class="ts-popover-title"><i class="fas fa-palette"></i> Theme Studio Catalog <span class="ts-badge-count">700</span></span>
                <button type="button" class="ts-popover-close" id="ts-popover-close" title="Close"><i class="fas fa-times"></i></button>
            </div>
            <div class="ts-popover-search-wrap">
                <i class="fas fa-search ts-search-icon"></i>
                <input type="text" id="ts-popover-search" placeholder="Search themes (e.g. Slate, Gold, Linen, Lavender)..." autocomplete="off">
                <button type="button" id="ts-popover-clear-search" style="display:none;" title="Clear Search"><i class="fas fa-times-circle"></i></button>
            </div>
        </div>
        <div class="ts-popover-body" id="ts-popover-body">
            ${popoverBodyHTML}
            <div id="ts-popover-empty" class="ts-popover-empty" style="display:none;">
                <i class="fas fa-search" style="font-size:24px; opacity:0.4;"></i>
                <span>No matching themes found</span>
            </div>
        </div>
        <div class="ts-popover-footer">
            <button type="button" class="ts-popover-action-btn" id="ts-pop-clear-btn">
                <i class="fas fa-eraser"></i> Remove Theme
            </button>
            <button type="button" class="ts-popover-action-btn" id="ts-pop-ignore-btn">
                <i class="fas fa-ban"></i> Toggle Ignore Theme
            </button>
        </div>
    `;
    document.body.appendChild(popover);

    if (typeof window.updateIgnoreThemeButtonUI === 'function') {
        window.updateIgnoreThemeButtonUI();
    }

    // ==========================================
    // 5. GALLERY STRIP NAVIGATION & POPOVER LOGIC
    // ==========================================
    let currentGalleryRow = 0;
    const swatchesPerRow = 8;
    const totalRows = Math.ceil(ALL_THEMES.length / swatchesPerRow);
    const maxGalleryRow = Math.max(0, totalRows - 2); // 2 rows visible in viewport
    const rowStepHeight = 28; // 24px swatch + 4px gap

    const updateGalleryStripPosition = () => {
        galleryStrip.style.transform = `translateY(-${currentGalleryRow * rowStepHeight}px)`;
        const upBtn = document.getElementById('ts-gallery-up');
        const downBtn = document.getElementById('ts-gallery-down');
        if (upBtn) {
            upBtn.classList.toggle('disabled', currentGalleryRow <= 0);
            upBtn.disabled = currentGalleryRow <= 0;
        }
        if (downBtn) {
            downBtn.classList.toggle('disabled', currentGalleryRow >= maxGalleryRow);
            downBtn.disabled = currentGalleryRow >= maxGalleryRow;
        }
    };
    updateGalleryStripPosition();

    document.getElementById('ts-gallery-up').addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentGalleryRow > 0) {
            currentGalleryRow--;
            updateGalleryStripPosition();
        }
    });

    document.getElementById('ts-gallery-down').addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentGalleryRow < maxGalleryRow) {
            currentGalleryRow++;
            updateGalleryStripPosition();
        }
    });

    galleryViewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY > 0 && currentGalleryRow < maxGalleryRow) {
            currentGalleryRow++;
            updateGalleryStripPosition();
        } else if (e.deltaY < 0 && currentGalleryRow > 0) {
            currentGalleryRow--;
            updateGalleryStripPosition();
        }
    }, { passive: false });

    const moreBtn = document.getElementById('ts-gallery-more');
    const closeBtn = document.getElementById('ts-popover-close');
    const searchInput = document.getElementById('ts-popover-search');
    const clearSearchBtn = document.getElementById('ts-popover-clear-search');
    const popEmpty = document.getElementById('ts-popover-empty');

    const openThemePopover = () => {
        popover.style.display = 'flex';
        moreBtn.classList.add('active');

        const rect = galleryContainer.getBoundingClientRect();
        const popWidth = 520;
        let left = rect.left;
        if (left + popWidth > window.innerWidth - 10) {
            left = window.innerWidth - popWidth - 10;
        }
        if (left < 10) left = 10;
        popover.style.top = (rect.bottom + 4) + 'px';
        popover.style.left = left + 'px';

        if (searchInput) {
            searchInput.value = '';
            filterPopoverThemes('');
            setTimeout(() => searchInput.focus(), 50);
        }
    };

    const closeThemePopover = () => {
        popover.style.display = 'none';
        moreBtn.classList.remove('active');
    };

    const toggleThemePopover = (e) => {
        if (e) e.stopPropagation();
        if (popover.style.display === 'none' || !popover.style.display) {
            openThemePopover();
        } else {
            closeThemePopover();
        }
    };

    moreBtn.addEventListener('click', toggleThemePopover);
    if (closeBtn) closeBtn.addEventListener('click', closeThemePopover);

    const filterPopoverThemes = (query) => {
        const q = (query || '').trim().toLowerCase();
        let totalMatches = 0;
        const sections = popover.querySelectorAll('.ts-cat-section');

        sections.forEach(sec => {
            let catMatches = 0;
            sec.querySelectorAll('.ts-swatch').forEach(sw => {
                const name = (sw.getAttribute('data-theme-name') || '').toLowerCase();
                const match = !q || name.includes(q);
                sw.style.display = match ? '' : 'none';
                if (match) catMatches++;
            });
            sec.style.display = catMatches > 0 ? '' : 'none';
            const badge = sec.querySelector('.ts-cat-badge');
            if (badge) badge.textContent = catMatches;
            totalMatches += catMatches;
        });

        if (popEmpty) popEmpty.style.display = totalMatches === 0 ? 'flex' : 'none';
        if (clearSearchBtn) clearSearchBtn.style.display = q ? 'block' : 'none';
    };

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterPopoverThemes(e.target.value);
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (searchInput.value) {
                    searchInput.value = '';
                    filterPopoverThemes('');
                } else {
                    closeThemePopover();
                }
            }
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            filterPopoverThemes('');
            searchInput.focus();
        });
    }

    document.addEventListener('click', (e) => {
        if (popover.style.display !== 'none' && popover.style.display) {
            if (!popover.contains(e.target) && !moreBtn.contains(e.target)) {
                closeThemePopover();
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popover.style.display !== 'none' && popover.style.display) {
            closeThemePopover();
        }
    });

    document.getElementById('ts-pop-clear-btn').addEventListener('click', () => {
        document.getElementById('ts-clear-theme-btn').click();
        closeThemePopover();
    });
    document.getElementById('ts-pop-ignore-btn').addEventListener('click', () => {
        if (typeof toggleIgnoreTheme === 'function') toggleIgnoreTheme();
        closeThemePopover();
    });

    const highlightActiveSwatch = (themeId, c1) => {
        const allSwatches = document.querySelectorAll('.ts-swatch');
        allSwatches.forEach(s => {
            const matches = (themeId && s.getAttribute('data-theme-id') === themeId) ||
                            (!themeId && s.getAttribute('data-c1') === c1);
            s.classList.toggle('active', !!matches);
        });

        if (themeId) {
            const stripSwatches = Array.from(galleryStrip.querySelectorAll('.ts-swatch'));
            const idx = stripSwatches.findIndex(s => s.getAttribute('data-theme-id') === themeId);
            if (idx >= 0) {
                const targetRow = Math.floor(idx / swatchesPerRow);
                if (targetRow < currentGalleryRow || targetRow > currentGalleryRow + 1) {
                    currentGalleryRow = Math.min(targetRow, maxGalleryRow);
                    updateGalleryStripPosition();
                }
            }
        }
    };

    // ==========================================
    // 6. THEME INJECTION & SAVE BACKUP
    // ==========================================
    const applyThemeToCanvas = (swatch) => {
        const paper = document.getElementById('paper');
        if (!paper) return;

        // When applying a theme, ensure ignoreBackground is turned off on current page
        if (state.pages && state.pages[state.currentPageIndex]) {
            state.pages[state.currentPageIndex].ignoreBackground = false;
        }
        if (typeof window.updateIgnoreThemeButtonUI === 'function') {
            window.updateIgnoreThemeButtonUI();
        }

        // Save active tab to prevent jump
        const activeTabEl = document.querySelector('.tab.active');
        let activeTabId = 'design';
        if (activeTabEl) {
            const m = activeTabEl.getAttribute('onclick')?.match(/switchTab\(['"]([^'"]+)['"]\)/);
            if (m && m[1]) activeTabId = m[1];
            else if (activeTabEl.id) activeTabId = activeTabEl.id.replace('tab-', '');
        }

        // Clear existing
        const existingTheme = paper.querySelector('[data-is-theme="true"]');
        if (existingTheme) existingTheme.remove();

        const id = swatch.getAttribute('data-theme-id') || '';
        const name = swatch.getAttribute('data-theme-name') || '';
        const type = swatch.getAttribute('data-type');
        const c1 = swatch.getAttribute('data-c1');
        const c2 = swatch.getAttribute('data-c2') || '';
        const url = swatch.getAttribute('data-url') || '';

        // Anchor configuration to root document
        paper.setAttribute('data-theme-saved', 'true');
        paper.setAttribute('data-theme-id', id);
        paper.setAttribute('data-theme-name', name);
        paper.setAttribute('data-theme-type', type);
        paper.setAttribute('data-theme-c1', c1);
        paper.setAttribute('data-theme-c2', c2);
        paper.setAttribute('data-theme-url', url);

        // Reset Hue Shift back to 0 so new theme matches its swatch preview in the gallery/popover
        const hueSliderEl = document.getElementById('ts-hue-slider');
        if (hueSliderEl) {
            hueSliderEl.value = 0;
        }
        const hueBadgeEl = document.getElementById('ts-hue-badge');
        if (hueBadgeEl) {
            hueBadgeEl.textContent = '0°';
        }
        paper.setAttribute('data-theme-hue', '0');

        // Synchronize active highlights across strip & popover
        highlightActiveSwatch(id, c1);

        // Mute app's tab switching temporarily
        const originalSwitchTab = window.switchTab;
        window.switchTab = function() {}; 

        if (typeof createWrapper === 'function') {
            const wrapper = createWrapper(`<div class="op-theme-container" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;"></div>`);
            
            wrapper.setAttribute('data-is-theme', 'true');
            wrapper.setAttribute('data-type', 'box');
            wrapper.style.cssText += 'left: 0px !important; top: 0px !important; width: 100% !important; height: 100% !important; z-index: 0 !important;';

            const container = wrapper.querySelector('.op-theme-container');
            
            // Build visual layers
            const bgDiv = document.createElement('div');
            bgDiv.className = 'op-theme-bg';
            bgDiv.style.cssText = 'position:absolute; inset:0; width:100%; height:100%;';
            
            if (type === 'gradient') {
                bgDiv.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
            } else {
                bgDiv.style.backgroundColor = c1;
            }
            container.appendChild(bgDiv);

            if (type === 'texture') {
                const texDiv = document.createElement('div');
                texDiv.className = 'op-theme-tex';
                texDiv.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; background-repeat:repeat; opacity:1;';
                texDiv.style.backgroundImage = `url('${url}')`;
                const preloadImg = new Image();
                preloadImg.onload = () => {
                    if (preloadImg.naturalWidth > 0) {
                        texDiv.setAttribute('data-base-w', preloadImg.naturalWidth);
                        texDiv.setAttribute('data-base-h', preloadImg.naturalHeight);
                        updateLiveFilters();
                    }
                };
                preloadImg.src = url;
                container.appendChild(texDiv);
            }
            
            if (typeof deselect === 'function') deselect();
        }

        // Restore tab behavior
        window.switchTab = originalSwitchTab;
        if (activeTabId && typeof window.switchTab === 'function') {
            window.switchTab(activeTabId);
        }

        updateLiveFilters();
        if (typeof pushHistory === 'function') pushHistory();
    };

    const updateSliderTrackFill = (slider, min, max, val) => {
        if (!slider) return;
        const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
        const isDark = document.body.classList.contains('dark-mode');
        const bgEmpty = isDark ? '#334155' : '#e2e8f0';
        slider.style.background = `linear-gradient(to right, var(--ui-theme-color, #007670) 0%, var(--ui-theme-color, #007670) ${pct}%, ${bgEmpty} ${pct}%, ${bgEmpty} 100%)`;
    };

    const updateLiveFilters = () => {
        const paper = document.getElementById('paper');
        if (!paper) return;

        const satSlider = document.getElementById('ts-sat-slider');
        const briSlider = document.getElementById('ts-bri-slider');
        const conSlider = document.getElementById('ts-con-slider');
        const hueSlider = document.getElementById('ts-hue-slider');
        const texSlider = document.getElementById('ts-tex-slider');
        const sizeSlider = document.getElementById('ts-size-slider');
        const satBadge = document.getElementById('ts-sat-badge');
        const briBadge = document.getElementById('ts-bri-badge');
        const conBadge = document.getElementById('ts-con-badge');
        const hueBadge = document.getElementById('ts-hue-badge');
        const texBadge = document.getElementById('ts-tex-badge');
        const sizeBadge = document.getElementById('ts-size-badge');

        const sat = satSlider ? parseInt(satSlider.value, 10) : 100;
        const bri = briSlider ? parseInt(briSlider.value, 10) : 100;
        const con = conSlider ? parseInt(conSlider.value, 10) : 100;
        const hue = hueSlider ? parseInt(hueSlider.value, 10) : 0;
        const texVal = texSlider ? parseInt(texSlider.value, 10) : 100;
        const sizeVal = sizeSlider ? parseInt(sizeSlider.value, 10) : 100;
        const texStr = (texVal / 100).toString();

        // Backup slider states for saving & printing
        paper.setAttribute('data-theme-sat', sat);
        paper.setAttribute('data-theme-bri', bri);
        paper.setAttribute('data-theme-con', con);
        paper.setAttribute('data-theme-hue', hue);
        paper.setAttribute('data-theme-tex', texVal);
        paper.setAttribute('data-theme-size', sizeVal);

        // Also save to active page model so switching pages retains adjustments
        if (state.pages && state.pages[state.currentPageIndex]) {
            if (paper.getAttribute('data-theme-saved') === 'true') {
                state.pages[state.currentPageIndex].themeSettings = {
                    saved: true,
                    id: paper.getAttribute('data-theme-id') || '',
                    name: paper.getAttribute('data-theme-name') || '',
                    type: paper.getAttribute('data-theme-type') || '',
                    c1: paper.getAttribute('data-theme-c1') || '',
                    c2: paper.getAttribute('data-theme-c2') || '',
                    url: paper.getAttribute('data-theme-url') || '',
                    sat: String(sat),
                    bri: String(bri),
                    con: String(con),
                    hue: String(hue),
                    tex: String(texVal),
                    size: String(sizeVal)
                };
            }
        }

        // Update numeric badges
        if (satBadge) satBadge.textContent = `${sat}%`;
        if (briBadge) briBadge.textContent = `${bri}%`;
        if (conBadge) conBadge.textContent = `${con}%`;
        if (hueBadge) hueBadge.textContent = `${hue}°`;

        // Update slider tracks
        if (satSlider) updateSliderTrackFill(satSlider, 0, 200, sat);
        if (briSlider) updateSliderTrackFill(briSlider, 50, 150, bri);
        if (conSlider) updateSliderTrackFill(conSlider, 50, 150, con);
        if (hueSlider) updateSliderTrackFill(hueSlider, 0, 360, hue);
        if (texSlider) updateSliderTrackFill(texSlider, 0, 100, texVal);
        if (sizeSlider) updateSliderTrackFill(sizeSlider, 25, 300, sizeVal);

        const themeLayer = paper.querySelector('[data-is-theme="true"]');
        const themeType = paper.getAttribute('data-theme-type') || '';
        const hasTextureLayer = themeLayer && !!themeLayer.querySelector('.op-theme-tex');
        const isTextureTheme = themeType === 'texture' || hasTextureLayer;

        const texRow = document.getElementById('ts-row-tex');
        const sizeRow = document.getElementById('ts-row-size');
        if (texSlider && texBadge) {
            if (isTextureTheme) {
                texSlider.disabled = false;
                texBadge.textContent = `${texVal}%`;
                texBadge.title = 'Click to reset Texture Opacity to 100%';
                texBadge.classList.remove('ts-badge-disabled');
                if (texRow) texRow.classList.remove('disabled');
            } else {
                texSlider.disabled = true;
                texBadge.textContent = 'None';
                texBadge.title = 'Texture opacity applies to textured themes';
                texBadge.classList.add('ts-badge-disabled');
                if (texRow) texRow.classList.add('disabled');
            }
        }
        if (sizeSlider && sizeBadge) {
            if (isTextureTheme) {
                sizeSlider.disabled = false;
                sizeBadge.textContent = `${sizeVal}%`;
                sizeBadge.title = 'Click to reset Pattern Zoom to 100%';
                sizeBadge.classList.remove('ts-badge-disabled');
                if (sizeRow) sizeRow.classList.remove('disabled');
            } else {
                sizeSlider.disabled = true;
                sizeBadge.textContent = 'None';
                sizeBadge.title = 'Pattern zoom applies to textured themes';
                sizeBadge.classList.add('ts-badge-disabled');
                if (sizeRow) sizeRow.classList.add('disabled');
            }
        }

        // Apply live filter adjustments strictly to active canvas #paper
        paper.querySelectorAll('.op-theme-container').forEach(container => {
            container.style.filter = `saturate(${sat}%) brightness(${bri}%) contrast(${con}%) hue-rotate(${hue}deg)`;
            container.style.webkitFilter = `saturate(${sat}%) brightness(${bri}%) contrast(${con}%) hue-rotate(${hue}deg)`;
        });
        paper.querySelectorAll('.op-theme-tex').forEach(texLayer => {
            texLayer.style.opacity = texStr;
            const baseW = parseFloat(texLayer.getAttribute('data-base-w')) || 100;
            if (sizeVal === 100) {
                texLayer.style.backgroundSize = 'auto auto';
            } else {
                const scaledW = Math.round(baseW * (sizeVal / 100));
                texLayer.style.backgroundSize = `${scaledW}px auto`;
            }
        });

        // Live-update strictly the active page thumbnail (never touching other pages' thumbnails)
        if (typeof state !== 'undefined' && typeof state.currentPageIndex === 'number') {
            const activeThumb = document.getElementById('thumb-' + state.currentPageIndex);
            if (activeThumb) {
                activeThumb.querySelectorAll('.op-theme-container').forEach(container => {
                    container.style.filter = `saturate(${sat}%) brightness(${bri}%) contrast(${con}%) hue-rotate(${hue}deg)`;
                    container.style.webkitFilter = `saturate(${sat}%) brightness(${bri}%) contrast(${con}%) hue-rotate(${hue}deg)`;
                });
                activeThumb.querySelectorAll('.op-theme-tex').forEach(texLayer => {
                    texLayer.style.opacity = texStr;
                });
            }
        }
    };

    // Wire up adjustment listeners
    const satSlider = document.getElementById('ts-sat-slider');
    const briSlider = document.getElementById('ts-bri-slider');
    const conSlider = document.getElementById('ts-con-slider');
    const hueSlider = document.getElementById('ts-hue-slider');
    const texSlider = document.getElementById('ts-tex-slider');
    const sizeSlider = document.getElementById('ts-size-slider');
    const satBadge = document.getElementById('ts-sat-badge');
    const briBadge = document.getElementById('ts-bri-badge');
    const conBadge = document.getElementById('ts-con-badge');
    const hueBadge = document.getElementById('ts-hue-badge');
    const texBadge = document.getElementById('ts-tex-badge');
    const sizeBadge = document.getElementById('ts-size-badge');

    if (satSlider) {
        satSlider.addEventListener('input', () => updateLiveFilters());
        satSlider.addEventListener('change', () => { if (typeof pushHistory === 'function') pushHistory(); });
    }
    if (briSlider) {
        briSlider.addEventListener('input', () => updateLiveFilters());
        briSlider.addEventListener('change', () => { if (typeof pushHistory === 'function') pushHistory(); });
    }
    if (conSlider) {
        conSlider.addEventListener('input', () => updateLiveFilters());
        conSlider.addEventListener('change', () => { if (typeof pushHistory === 'function') pushHistory(); });
    }
    if (hueSlider) {
        hueSlider.addEventListener('input', () => updateLiveFilters());
        hueSlider.addEventListener('change', () => { if (typeof pushHistory === 'function') pushHistory(); });
    }
    if (texSlider) {
        texSlider.addEventListener('input', () => updateLiveFilters());
        texSlider.addEventListener('change', () => { if (typeof pushHistory === 'function') pushHistory(); });
    }
    if (sizeSlider) {
        sizeSlider.addEventListener('input', () => updateLiveFilters());
        sizeSlider.addEventListener('change', () => { if (typeof pushHistory === 'function') pushHistory(); });
    }

    if (satBadge) {
        satBadge.addEventListener('click', () => {
            if (satSlider) {
                satSlider.value = 100;
                updateLiveFilters();
                if (typeof pushHistory === 'function') pushHistory();
            }
        });
    }
    if (briBadge) {
        briBadge.addEventListener('click', () => {
            if (briSlider) {
                briSlider.value = 100;
                updateLiveFilters();
                if (typeof pushHistory === 'function') pushHistory();
            }
        });
    }
    if (conBadge) {
        conBadge.addEventListener('click', () => {
            if (conSlider) {
                conSlider.value = 100;
                updateLiveFilters();
                if (typeof pushHistory === 'function') pushHistory();
            }
        });
    }
    if (hueBadge) {
        hueBadge.addEventListener('click', () => {
            if (hueSlider) {
                hueSlider.value = 0;
                updateLiveFilters();
                if (typeof pushHistory === 'function') pushHistory();
            }
        });
    }
    if (texBadge) {
        texBadge.addEventListener('click', () => {
            if (texSlider && !texSlider.disabled) {
                texSlider.value = 100;
                updateLiveFilters();
                if (typeof pushHistory === 'function') pushHistory();
            }
        });
    }
    if (sizeBadge) {
        sizeBadge.addEventListener('click', () => {
            if (sizeSlider && !sizeSlider.disabled) {
                sizeSlider.value = 100;
                updateLiveFilters();
                if (typeof pushHistory === 'function') pushHistory();
            }
        });
    }

    // Initial sync of track fill and badges
    updateLiveFilters();

    // ==========================================
    // 7. CLEAR THEME LOGIC
    // ==========================================
    document.getElementById('ts-clear-theme-btn').addEventListener('click', () => {
        const paper = document.getElementById('paper');
        if (paper) {
            const existingTheme = paper.querySelector('[data-is-theme="true"]');
            if (existingTheme) existingTheme.remove();
            paper.style.background = '#ffffff';
            
            // Wipe save backup
            paper.removeAttribute('data-theme-saved');
            ['id', 'name', 'type', 'c1', 'c2', 'url', 'sat', 'bri', 'con', 'hue', 'tex', 'size'].forEach(attr => {
                paper.removeAttribute(`data-theme-${attr}`);
            });
            if (state.pages && state.pages[state.currentPageIndex]) {
                delete state.pages[state.currentPageIndex].themeSettings;
            }
        }
        
        document.querySelectorAll('.ts-swatch').forEach(s => s.classList.remove('active'));
        if (document.getElementById('ts-sat-slider')) document.getElementById('ts-sat-slider').value = 100;
        if (document.getElementById('ts-bri-slider')) document.getElementById('ts-bri-slider').value = 100;
        if (document.getElementById('ts-con-slider')) document.getElementById('ts-con-slider').value = 100;
        if (document.getElementById('ts-hue-slider')) document.getElementById('ts-hue-slider').value = 0;
        if (document.getElementById('ts-tex-slider')) document.getElementById('ts-tex-slider').value = 100;
        if (document.getElementById('ts-size-slider')) document.getElementById('ts-size-slider').value = 100;
        updateLiveFilters();

        if (typeof pushHistory === 'function') pushHistory();
    });

    // ==========================================
    // 8. PRINT RESCUE HOOK
    // ==========================================
    window.addEventListener('beforeprint', () => {
        setTimeout(() => {
            const spooler = document.getElementById('op-print-spooler');
            if (!spooler) return;
            
            const scalers = spooler.querySelectorAll('.op-print-scaler');
            scalers.forEach(scaler => {
                const children = Array.from(scaler.children);
                children.forEach(child => {
                    if (child.innerHTML.includes('op-theme-container')) {
                        const pageWrapper = scaler.parentElement;
                        pageWrapper.insertBefore(child, scaler);
                        child.style.left = '0px';
                        child.style.top = '0px';
                        child.style.width = '100%';
                        child.style.height = '100%';
                        child.style.transform = 'none';
                        const content = child.querySelector('.element-content');
                        if (content) content.style.transform = 'none';

                        // Ensure background filter and texture opacity are explicitly preserved in print spooler
                        const container = child.querySelector('.op-theme-container');
                        if (container) {
                            const paper = document.getElementById('paper');
                            const sat = paper ? (paper.getAttribute('data-theme-sat') || '100') : '100';
                            const bri = paper ? (paper.getAttribute('data-theme-bri') || '100') : '100';
                            const con = paper ? (paper.getAttribute('data-theme-con') || '100') : '100';
                            const hue = paper ? (paper.getAttribute('data-theme-hue') || '0') : '0';
                            const tex = paper ? (paper.getAttribute('data-theme-tex') || '100') : '100';
                            const size = paper ? (paper.getAttribute('data-theme-size') || '100') : '100';

                            container.style.filter = `saturate(${sat}%) brightness(${bri}%) contrast(${con}%) hue-rotate(${hue}deg)`;
                            container.style.webkitFilter = `saturate(${sat}%) brightness(${bri}%) contrast(${con}%) hue-rotate(${hue}deg)`;
                            const texLayer = container.querySelector('.op-theme-tex');
                            if (texLayer) {
                                texLayer.style.opacity = (parseFloat(tex) / 100).toString();
                                const baseW = parseFloat(texLayer.getAttribute('data-base-w')) || 100;
                                if (size !== '100') {
                                    texLayer.style.backgroundSize = `${Math.round(baseW * (parseFloat(size) / 100))}px auto`;
                                }
                            }

                            if (typeof window.bakeThemeBackgroundForPrint === 'function') {
                                const tSettings = {
                                    saved: true,
                                    id: paper ? (paper.getAttribute('data-theme-id') || '') : '',
                                    type: paper ? (paper.getAttribute('data-theme-type') || 'color') : 'color',
                                    c1: paper ? (paper.getAttribute('data-theme-c1') || '#ffffff') : '#ffffff',
                                    c2: paper ? (paper.getAttribute('data-theme-c2') || '') : '',
                                    url: paper ? (paper.getAttribute('data-theme-url') || '') : '',
                                    sat: sat,
                                    bri: bri,
                                    con: con,
                                    hue: hue,
                                    tex: tex,
                                    size: size
                                };
                                const pw = pageWrapper.offsetWidth || 794;
                                const ph = pageWrapper.offsetHeight || 1123;
                                window.bakeThemeBackgroundForPrint(tSettings, pw, ph).then(bakedUrl => {
                                    if (bakedUrl) {
                                        container.innerHTML = `<img class="op-theme-baked-bg" src="${bakedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:fill; display:block; border:none; outline:none; margin:0; padding:0; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;">`;
                                        container.style.filter = 'none';
                                        container.style.webkitFilter = 'none';
                                    }
                                }).catch(() => {});
                            }
                        }
                    }
                });
            });
        }, 5);
    });

    // ==========================================
    // 9. THE SELF-HEALING ENGINE & Z-INDEX
    // ==========================================
    window.resetThemeStudioUI = function() {
        const satSlider = document.getElementById('ts-sat-slider');
        const briSlider = document.getElementById('ts-bri-slider');
        const conSlider = document.getElementById('ts-con-slider');
        const hueSlider = document.getElementById('ts-hue-slider');
        const texSlider = document.getElementById('ts-tex-slider');
        const sizeSlider = document.getElementById('ts-size-slider');
        const satBadge = document.getElementById('ts-sat-badge');
        const briBadge = document.getElementById('ts-bri-badge');
        const conBadge = document.getElementById('ts-con-badge');
        const hueBadge = document.getElementById('ts-hue-badge');
        const texBadge = document.getElementById('ts-tex-badge');
        const sizeBadge = document.getElementById('ts-size-badge');

        if (satSlider) satSlider.value = 100;
        if (briSlider) briSlider.value = 100;
        if (conSlider) conSlider.value = 100;
        if (hueSlider) hueSlider.value = 0;
        if (texSlider) texSlider.value = 100;
        if (sizeSlider) sizeSlider.value = 100;

        if (satBadge) satBadge.textContent = '100%';
        if (briBadge) briBadge.textContent = '100%';
        if (conBadge) conBadge.textContent = '100%';
        if (hueBadge) hueBadge.textContent = '0°';
        if (texBadge) { texBadge.textContent = 'None'; texBadge.classList.add('ts-badge-disabled'); }
        if (sizeBadge) { sizeBadge.textContent = 'None'; sizeBadge.classList.add('ts-badge-disabled'); }

        if (satSlider) updateSliderTrackFill(satSlider, 0, 200, 100);
        if (briSlider) updateSliderTrackFill(briSlider, 50, 150, 100);
        if (conSlider) updateSliderTrackFill(conSlider, 50, 150, 100);
        if (hueSlider) updateSliderTrackFill(hueSlider, 0, 360, 0);
        if (texSlider) updateSliderTrackFill(texSlider, 0, 100, 100);
        if (sizeSlider) updateSliderTrackFill(sizeSlider, 25, 300, 100);

        document.querySelectorAll('.ts-swatch').forEach(s => s.classList.remove('active'));
    };

    window.restoreThemeFromSave = function() {
        const paper = document.getElementById('paper');
        if (!paper) return;

        // If current page has themeSettings saved on page model, synchronize to paper attributes
        if (state.pages && state.pages[state.currentPageIndex] && state.pages[state.currentPageIndex].themeSettings) {
            const ts = state.pages[state.currentPageIndex].themeSettings;
            if (ts.saved) {
                paper.setAttribute('data-theme-saved', 'true');
                if (ts.id) paper.setAttribute('data-theme-id', ts.id);
                if (ts.name) paper.setAttribute('data-theme-name', ts.name);
                if (ts.type) paper.setAttribute('data-theme-type', ts.type);
                if (ts.c1) paper.setAttribute('data-theme-c1', ts.c1);
                if (ts.c2) paper.setAttribute('data-theme-c2', ts.c2);
                if (ts.url) paper.setAttribute('data-theme-url', ts.url);
                if (ts.sat !== undefined) paper.setAttribute('data-theme-sat', ts.sat);
                if (ts.bri !== undefined) paper.setAttribute('data-theme-bri', ts.bri);
                if (ts.con !== undefined) paper.setAttribute('data-theme-con', ts.con);
                if (ts.hue !== undefined) paper.setAttribute('data-theme-hue', ts.hue);
                if (ts.tex !== undefined) paper.setAttribute('data-theme-tex', ts.tex);
                if (ts.size !== undefined) paper.setAttribute('data-theme-size', ts.size);
            }
        }

        if (paper.getAttribute('data-theme-saved') !== 'true') return;

        // If current page ignores theme, do not restore
        if (state.pages && state.pages[state.currentPageIndex] && state.pages[state.currentPageIndex].ignoreBackground) {
            return;
        }

        let theme = paper.querySelector('[data-is-theme="true"]');
        if (!theme) {
            const existingContainer = paper.querySelector('.op-theme-container');
            if (existingContainer) {
                theme = existingContainer.closest('.pub-element') || existingContainer;
                theme.setAttribute('data-is-theme', 'true');
            }
        }

        // Deduplicate any redundant theme layers
        const allThemes = paper.querySelectorAll('[data-is-theme="true"], .op-theme-container');
        if (allThemes.length > 1) {
            for (let i = 1; i < allThemes.length; i++) {
                const el = allThemes[i].closest('.pub-element') || allThemes[i];
                if (el !== theme && el.parentNode) el.remove();
            }
        }

        // Heal Scenario 1: Document loaded, theme was enabled, but wrapper was wiped out
        if (!theme) {
            console.log("🛠️ Theme Studio: Reconstructing deleted theme wrapper from save file...");
            const activeTabEl = document.querySelector('.tab.active');
            let activeTabId = 'design';
            if (activeTabEl) {
                const m = activeTabEl.getAttribute('onclick')?.match(/switchTab\(['"]([^'"]+)['"]\)/);
                if (m && m[1]) activeTabId = m[1];
                else if (activeTabEl.id) activeTabId = activeTabEl.id.replace('tab-', '');
            }

            const originalSwitchTab = window.switchTab;
            window.switchTab = function() {};

            if (typeof createWrapper === 'function') {
                theme = createWrapper(`<div class="op-theme-container"></div>`);
                theme.setAttribute('data-is-theme', 'true');
                theme.setAttribute('data-type', 'box');
                theme.style.cssText += 'left: 0px !important; top: 0px !important; width: 100% !important; height: 100% !important; z-index: 0 !important;';
                if (typeof deselect === 'function') deselect();
            }

            window.switchTab = originalSwitchTab;
            if (activeTabId && typeof window.switchTab === 'function') {
                window.switchTab(activeTabId);
            }
        }

        // Heal Scenario 2: Wrapper exists, but inner visuals were stripped during Save/Load/Page Switch
        if (theme && !theme.querySelector('.op-theme-bg')) {
            console.log("🛠️ Theme Studio: Restoring background visuals from save state...");
            
            const type = paper.getAttribute('data-theme-type');
            const c1 = paper.getAttribute('data-theme-c1');
            const c2 = paper.getAttribute('data-theme-c2');
            const url = paper.getAttribute('data-theme-url');

            if (type && c1) {
                theme.innerHTML = '';
                
                const container = document.createElement('div');
                container.className = 'op-theme-container';
                container.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; pointer-events:none; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important;';
                
                const bgDiv = document.createElement('div');
                bgDiv.className = 'op-theme-bg';
                bgDiv.style.cssText = 'position:absolute; inset:0; width:100%; height:100%;';
                if (type === 'gradient') {
                    bgDiv.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
                } else {
                    bgDiv.style.backgroundColor = c1;
                }
                container.appendChild(bgDiv);

                if (type === 'texture') {
                    const texDiv = document.createElement('div');
                    texDiv.className = 'op-theme-tex';
                    texDiv.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; background-repeat:repeat; opacity:1;';
                    texDiv.style.backgroundImage = `url('${url}')`;
                    container.appendChild(texDiv);
                }
                theme.appendChild(container);

                // Restore UI Sliders
                const sat = paper.getAttribute('data-theme-sat') || '100';
                const bri = paper.getAttribute('data-theme-bri') || '100';
                const con = paper.getAttribute('data-theme-con') || '100';
                const hue = paper.getAttribute('data-theme-hue') || '0';
                const tex = paper.getAttribute('data-theme-tex') || '100';
                const size = paper.getAttribute('data-theme-size') || '100';
                
                if (document.getElementById('ts-sat-slider')) document.getElementById('ts-sat-slider').value = sat;
                if (document.getElementById('ts-bri-slider')) document.getElementById('ts-bri-slider').value = bri;
                if (document.getElementById('ts-con-slider')) document.getElementById('ts-con-slider').value = con;
                if (document.getElementById('ts-hue-slider')) document.getElementById('ts-hue-slider').value = hue;
                if (document.getElementById('ts-tex-slider')) document.getElementById('ts-tex-slider').value = tex;
                if (document.getElementById('ts-size-slider')) document.getElementById('ts-size-slider').value = size;

                // Restore UI Swatch highlight
                const savedId = paper.getAttribute('data-theme-id');
                highlightActiveSwatch(savedId, c1);

                // Synchronize live filters and badges immediately onto new container
                updateLiveFilters();

            }
        } else if (theme && theme.querySelector('.op-theme-bg')) {
            const sat = paper.getAttribute('data-theme-sat') || '100';
            const bri = paper.getAttribute('data-theme-bri') || '100';
            const con = paper.getAttribute('data-theme-con') || '100';
            const hue = paper.getAttribute('data-theme-hue') || '0';
            const tex = paper.getAttribute('data-theme-tex') || '100';
            const size = paper.getAttribute('data-theme-size') || '100';
            const satEl = document.getElementById('ts-sat-slider');
            const briEl = document.getElementById('ts-bri-slider');
            const conEl = document.getElementById('ts-con-slider');
            const hueEl = document.getElementById('ts-hue-slider');
            const texEl = document.getElementById('ts-tex-slider');
            const sizeEl = document.getElementById('ts-size-slider');
            let needsUpdate = false;
            if (satEl && satEl.value !== sat) { satEl.value = sat; needsUpdate = true; }
            if (briEl && briEl.value !== bri) { briEl.value = bri; needsUpdate = true; }
            if (conEl && conEl.value !== con) { conEl.value = con; needsUpdate = true; }
            if (hueEl && hueEl.value !== hue) { hueEl.value = hue; needsUpdate = true; }
            if (texEl && texEl.value !== tex) { texEl.value = tex; needsUpdate = true; }
            if (sizeEl && sizeEl.value !== size) { sizeEl.value = size; needsUpdate = true; }

            const container = theme.querySelector('.op-theme-container');
            const expectedFilter = `saturate(${sat}%) brightness(${bri}%) contrast(${con}%) hue-rotate(${hue}deg)`;
            if (container && (!container.style.filter || container.style.filter !== expectedFilter)) {
                needsUpdate = true;
            }
            if (needsUpdate) updateLiveFilters();

            const savedId = paper.getAttribute('data-theme-id');
            const c1 = paper.getAttribute('data-theme-c1');
            highlightActiveSwatch(savedId, c1);
        }

        // Maintain Stacking Order
        if (theme && theme.style.zIndex !== '0') {
            theme.style.zIndex = '0';
        }
    };

    setInterval(() => {
        const paper = document.getElementById('paper');
        if (!paper) return;

        let theme = document.querySelector('[data-is-theme="true"]');

        // Ignore Background Override
        if (state.pages[state.currentPageIndex] && state.pages[state.currentPageIndex].ignoreBackground) {
            if (theme) theme.remove();
            return;
        }

        if (typeof window.restoreThemeFromSave === 'function') {
            window.restoreThemeFromSave();
        }
        const border = document.getElementById('native-blueprint-border');
        if (border && border.style.zIndex !== '2') {
            border.style.zIndex = '2';
        }
    }, 500);

    // ==========================================
    // 10. THE DELAYED MOUSE-STEALTH DEFENSE
    // ==========================================
    let stealthTimer = null;
    
    const stealthTheme = () => {
        clearTimeout(stealthTimer);
        const theme = document.querySelector('[data-is-theme="true"]');
        if (theme) {
            theme.classList.remove('pub-element', 'selected', 'active-element');
        }
    };
    
    const unstealthTheme = () => {
        const theme = document.querySelector('[data-is-theme="true"]');
        if (theme) {
            if (!theme.classList.contains('pub-element')) {
                theme.classList.add('pub-element');
            }
            theme.classList.remove('selected', 'active-element');
        }
    };

    window.addEventListener('mousedown', stealthTheme, true);
    
    window.addEventListener('mousemove', (e) => {
        if (e.buttons > 0) stealthTheme();
    }, true);

    window.addEventListener('mouseup', () => {
        stealthTimer = setTimeout(unstealthTheme, 150);
    }, true);

    document.addEventListener('mouseleave', () => {
        stealthTimer = setTimeout(unstealthTheme, 150);
    }, true);

    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'a') {
            stealthTheme();
            stealthTimer = setTimeout(unstealthTheme, 150); 
        }
    }, true);

    window.addEventListener('beforeprint', unstealthTheme, true);

    // ==========================================
    // 11. BIND SWATCH & SLIDER EVENT LISTENERS
    // ==========================================
    galleryStrip.querySelectorAll('.ts-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            applyThemeToCanvas(swatch);
        });
    });

    popover.querySelectorAll('.ts-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            applyThemeToCanvas(swatch);
            // Popover remains open so user can preview and audition multiple themes against canvas without menu closing
        });
    });

    const sliders = studioContainer.querySelectorAll('.ts-slider');
    sliders.forEach(slider => {
        slider.addEventListener('input', updateLiveFilters);
        slider.addEventListener('change', () => {
            if (typeof pushHistory === 'function') pushHistory();
        });
    });

})();
