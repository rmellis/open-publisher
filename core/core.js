// OpenPublisher - A free desktop publishing tool
/* --- GLOBAL STATE --- */
window.ribbonScrollInterval = null;
window.startRibbonScroll = (id, amount) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.ribbonScrollInterval = setInterval(() => {
        el.scrollLeft += amount;
    }, 20);
};
window.stopRibbonScroll = () => {
    clearInterval(window.ribbonScrollInterval);
};

let state = {
    pages: [], 
    hasMasterPage: false,
    currentPageIndex: 0,
    isSpreadMode: false,
    zoom: 1.0,
    copiedData: null,
    selectedEl: null,
    dragMode: null,
    dragData: {},
    headersVisible: false,
    spellCheck: true,
    history: [],
    historyIndex: -1,
    documentPassword: null,
    cropMode: false,
    lastRange: null, 
    isProgrammaticUpdate: false,
    snap: { grid: false, guides: true, objects: true },
    isGuidesLocked: false,
    currentScheme: 'Classic',
    documentProperties: { author: '', company: '', subject: '', keywords: '' }
};

const colorSchemes = {
    "Classic": ["#2C3E50", "#E74C3C", "#ECF0F1", "#3498DB", "#F1C40F"],
    "Oceanic": ["#0B3C5D", "#328CC1", "#1D2731", "#D9B310", "#F5F5F5"],
    "Sunset": ["#FF5E62", "#FF9966", "#FFD275", "#2C3E50", "#FFFFFF"],
    "Forest": ["#2E4600", "#486B00", "#A2C523", "#7D4427", "#F0F3BD"],
    "Berry": ["#4A154B", "#611F69", "#E01E5A", "#2BAC76", "#FFFFFF"],
    "Monochrome": ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"],
    "Pastel": ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF"],
    "Neon": ["#FF00FF", "#00FFFF", "#00FF00", "#FFFF00", "#111111"],
    "Corporate": ["#003366", "#006699", "#3399CC", "#66B2FF", "#E6F2FF"],
    "Earth": ["#5C4033", "#8B5A2B", "#CD853F", "#DEB887", "#F5DEB3"],
    "Cyberpunk": ["#FCEE09", "#00FFF5", "#FF003C", "#711C91", "#133E7C"],
    "Vintage": ["#3B2F2F", "#A67C00", "#FCF6BA", "#B38728", "#FBF5B7"],
    "Minimal": ["#222831", "#393E46", "#00ADB5", "#EEEEEE", "#FFFFFF"],
    "Autumn": ["#C0392B", "#D35400", "#F39C12", "#F1C40F", "#2C3E50"],
    "Spring": ["#27AE60", "#2ECC71", "#F1C40F", "#E67E22", "#E74C3C"]
};

const paper = document.getElementById('paper');
const floatToolbar = document.getElementById('float-toolbar');
