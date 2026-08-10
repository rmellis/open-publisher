

(function initExpansionPack1() {
    
    // 0. PHYSICAL OVERRIDE FOR THE BROKEN IMAGE ICON
    // Scans the page and instantly swaps the dead Unsplash URL for a working one
    const fixBrokenImages = () => {
        const dead = '1459749411177';
        const live = 'https://images.unsplash.com/photo-1470229722913-7c092dbbfa26?auto=format&fit=crop&w=800&q=80';
        document.querySelectorAll('img').forEach(img => {
            if (img.src.includes(dead)) img.src = live;
        });
    };
    
    
})();
