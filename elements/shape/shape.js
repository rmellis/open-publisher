window.exitShapeEditMode = function() {
    if(!state.shapeEditMode) return;
    state.shapeEditMode = false;
    
    let elToFlatten = null;
    
    if(window._shapeEditContext) {
        const el = window._shapeEditContext.el;
        el.classList.remove('editing-shape');
        el.querySelectorAll('.shape-edit-handle').forEach(h => h.remove());
        elToFlatten = el;
        window._shapeEditContext = null;
    }
    document.getElementById('status-msg').innerText = "Element Selected";
    
    if (elToFlatten && window.ContextMenuActions && window.ContextMenuActions.flattenToImage) {
        const previouslySelected = state.selectedEl;
        state.selectedEl = elToFlatten;
        window.ContextMenuActions.flattenToImage();
        state.selectedEl = previouslySelected;
    }
};

function toggleShapeMenu(btn, e) {
    const m = document.getElementById('shape-dropdown');
    if (btn) {
        const r = btn.getBoundingClientRect();
        m.style.left = r.left + 'px'; m.style.top = (r.bottom+5) + 'px';
    } else if (e) {
        m.style.left = e.clientX + 'px'; m.style.top = e.clientY + 'px';
    }
    m.style.display = 'block';
}
/* =========================================================================
   FEATURE: Advanced Vector Shapes Engine (Hollow Variants Added)
   ========================================================================= */
window.initShapes = function() {
    console.log("🛠️ Advanced Vector Shapes Library (Hollow Variants) initializing...");

    const dropdown = document.getElementById('shape-dropdown');
    if (!dropdown) return;

    dropdown.innerHTML = '';
    dropdown.style.width = '380px';
    dropdown.style.maxHeight = '450px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.padding = '0';
    dropdown.style.scrollbarWidth = 'thin';

    // --- MATHEMATICAL GENERATORS ---
    const poly = (sides) => {
        let pts = [];
        for(let i=0; i<sides; i++) {
            let a = (i * 2 * Math.PI / sides) - Math.PI/2;
            pts.push(`${(50 + 45*Math.cos(a)).toFixed(1)},${(50 + 45*Math.sin(a)).toFixed(1)}`);
        }
        return `<polygon points="${pts.join(' ')}" />`;
    };

    const star = (pts, ir) => {
        let points = [];
        for(let i=0; i<pts*2; i++) {
            let r = i%2===0 ? 45 : ir;
            let a = (i * Math.PI / pts) - Math.PI/2;
            points.push(`${(50 + r*Math.cos(a)).toFixed(1)},${(50 + r*Math.sin(a)).toFixed(1)}`);
        }
        return `<polygon points="${points.join(' ')}" />`;
    };

    const gear = (teeth) => {
        let points = [];
        const pts = teeth * 2;
        for(let i=0; i<pts; i++) {
            let rOuter = 45; let rInner = 35;
            let a1 = (i * Math.PI / teeth) - Math.PI/2;
            let a2 = ((i + 0.5) * Math.PI / teeth) - Math.PI/2;
            let r = i%2===0 ? rOuter : rInner;
            points.push(`${(50 + r*Math.cos(a1)).toFixed(1)},${(50 + r*Math.sin(a1)).toFixed(1)}`);
            points.push(`${(50 + r*Math.cos(a2)).toFixed(1)},${(50 + r*Math.sin(a2)).toFixed(1)}`);
        }
        return `<path d="M ${points[0]} L ${points.slice(1).join(' L ')} Z M 50,35 A 15,15 0 1,0 50,65 A 15,15 0 1,0 50,35 Z" fill-rule="evenodd" />`;
    };

    // Helper to instantly generate hollow/outline versions of any array of shapes
    const makeHollow = (arr) => arr.map(shape => ({
        name: `Hollow ${shape.name}`,
        // Overrides the parent fill with transparent, and thickens the stroke
        markup: `<g fill="transparent" stroke-width="6">${shape.markup}</g>`
    }));

    // --- GENERATE DYNAMIC ARRAYS ---
    const polygons = [];
    for(let i=3; i<=24; i++) polygons.push({ name: `${i}-Sided Polygon`, markup: poly(i) });

    const stars = [];
    [3,4,5,6,7,8,9,10,12,14,16,18,20,24,32,48].forEach(pts => {
        stars.push({ name: `${pts}-Point Star`, markup: star(pts, pts > 10 ? 35 : 20) });
    });

    const bursts = [];
    [8,12,16,24,32,40,48].forEach(pts => {
        bursts.push({ name: `${pts}-Point Burst`, markup: star(pts, 40) });
    });

    const gears = [];
    [6,8,10,12,14,16,20,24].forEach(teeth => {
        gears.push({ name: `${teeth}-Tooth Gear`, markup: gear(teeth) });
    });

    const basicShapes = [
        { name: 'Rectangle', markup: `<rect x="5" y="5" width="90" height="90" />` },
        { name: 'Rounded Rect', markup: `<rect x="5" y="5" width="90" height="90" rx="15" ry="15" />` },
        { name: 'Snip Corner Rect', markup: `<polygon points="20,5 95,5 95,95 5,95 5,20" />` },
        { name: 'Snip Same Side', markup: `<polygon points="20,5 80,5 95,20 95,95 5,95 5,20" />` },
        { name: 'Snip Diagonal', markup: `<polygon points="20,5 95,5 95,80 80,95 5,95 5,20" />` },
        { name: 'Oval', markup: `<ellipse cx="50" cy="50" rx="45" ry="45" />` },
        { name: 'Circle', markup: `<circle cx="50" cy="50" r="45" />` },
        { name: 'Right Triangle', markup: `<polygon points="5,5 95,95 5,95" />` },
        { name: 'Parallelogram', markup: `<polygon points="20,5 95,5 80,95 5,95" />` },
        { name: 'Trapezoid', markup: `<polygon points="25,5 75,5 95,95 5,95" />` },
        { name: 'Diamond', markup: `<polygon points="50,5 95,50 50,95 5,50" />` },
        { name: 'Cross', markup: `<polygon points="35,5 65,5 65,35 95,35 95,65 65,65 65,95 35,95 35,65 5,65 5,35 35,35" />` },
        { name: 'Frame', markup: `<path d="M5,5 H95 V95 H5 Z M20,20 V80 H80 V20 Z" fill-rule="evenodd" />` },
        { name: 'Ring (Donut)', markup: `<path d="M50,5 A45,45 0 1,0 50,95 A45,45 0 1,0 50,5 Z M50,25 A25,25 0 1,1 50,75 A25,25 0 1,1 50,25 Z" fill-rule="evenodd" />` },
        { name: 'Half Frame', markup: `<path d="M5,5 H95 V25 H25 V95 H5 Z" />` },
        { name: 'L-Shape', markup: `<polygon points="5,5 35,5 35,65 95,65 95,95 5,95" />` },
        { name: 'Diagonal Stripe', markup: `<polygon points="5,80 20,95 95,20 80,5" />` },
        { name: 'Heart', markup: `<path d="M50,90 C5,60 5,20 25,20 C35,20 45,30 50,40 C55,30 65,20 75,20 C95,20 95,60 50,90 Z" />` },
        { name: 'Lightning', markup: `<polygon points="60,5 15,55 45,55 40,95 85,45 55,45" />` },
        { name: 'Smiley', markup: `<path d="M50,5 A45,45 0 1,0 50,95 A45,45 0 1,0 50,5 Z M35,30 A7,7 0 1,1 35,44 A7,7 0 1,1 35,30 Z M65,30 A7,7 0 1,1 65,44 A7,7 0 1,1 65,30 Z M25,60 Q50,85 75,60 Q50,75 25,60 Z" fill-rule="evenodd" />` },
        { name: 'Sun', markup: `<path d="M50,25 A25,25 0 1,0 50,75 A25,25 0 1,0 50,25 Z M50,5 L55,15 H45 Z M50,95 L45,85 H55 Z M5,50 L15,45 V55 Z M95,50 L85,55 V45 Z M18,18 L28,22 L22,28 Z M82,82 L72,78 L78,72 Z M18,82 L22,72 L28,78 Z M82,18 L78,28 L72,22 Z" />` },
        { name: 'Moon', markup: `<path d="M50,5 A45,45 0 1,0 95,50 A35,35 0 1,1 50,5 Z" />` },
        { name: 'Cloud', markup: `<path d="M30,45 A20,20 0 0,1 70,45 A25,25 0 0,1 90,70 A15,15 0 0,1 75,90 H25 A15,15 0 0,1 15,65 A20,20 0 0,1 30,45 Z" />` },
        { name: 'Teardrop', markup: `<path d="M50,5 C50,5 15,45 15,65 A35,35 0 0,0 85,65 C85,45 50,5 50,5 Z" />` },
        { name: 'Cylinder', markup: `<path d="M15,20 A35,10 0 0,0 85,20 V80 A35,10 0 0,1 15,80 Z M15,20 A35,10 0 0,1 85,20 A35,10 0 0,1 15,20 Z" fill-rule="evenodd" />` },
        { name: 'Cube', markup: `<path d="M5,35 L35,5 H95 L65,35 Z M5,35 V95 H65 V35 Z M95,5 V65 L65,95 M65,35 V95" fill="none" stroke-width="4" stroke-linejoin="round" />` },
        { name: 'Plaque', markup: `<polygon points="15,5 85,5 95,15 95,85 85,95 15,95 5,85 5,15" />` },
        { name: 'Shield', markup: `<path d="M10,10 H90 V40 C90,70 50,95 50,95 C50,95 10,70 10,40 Z" />` },
        { name: 'Folded Corner', markup: `<path d="M15,5 H65 L85,25 V95 H15 Z M65,5 V25 H85" fill-rule="evenodd" />` },
        { name: 'Bevel', markup: `<polygon points="15,15 85,15 95,25 95,95 5,95 5,25" />` },
        { name: 'Pie', markup: `<path d="M50,50 L50,5 A45,45 0 1,1 5,50 Z" />` },
        { name: 'Chord', markup: `<path d="M50,5 A45,45 0 1,1 18.1,81.8 Z" />` },
        { name: 'No Symbol', markup: `<path d="M50,5 A45,45 0 1,0 50,95 A45,45 0 1,0 50,5 Z M20,20 L80,80" fill="none" stroke-width="8" />` }
    ];

    const blockArrows = [
        { name: 'Right Arrow', markup: `<polygon points="5,35 55,35 55,15 95,50 55,85 55,65 5,65" />` },
        { name: 'Left Arrow', markup: `<polygon points="95,35 45,35 45,15 5,50 45,85 45,65 95,65" />` },
        { name: 'Up Arrow', markup: `<polygon points="35,95 35,45 15,45 50,5 85,45 65,45 65,95" />` },
        { name: 'Down Arrow', markup: `<polygon points="35,5 35,55 15,55 50,95 85,55 65,55 65,5" />` },
        { name: 'Left-Right Arrow', markup: `<polygon points="25,40 45,40 45,30 55,30 55,40 75,40 75,60 55,60 55,70 45,70 45,60 25,60" />` }, 
        { name: 'Up-Down Arrow', markup: `<polygon points="40,25 30,25 50,5 70,25 60,25 60,75 70,75 50,95 30,75 40,75" />` },
        { name: 'Quad Arrow', markup: `<polygon points="40,40 40,25 30,25 50,5 70,25 60,25 60,40 75,40 75,30 95,50 75,70 75,60 60,60 60,75 70,75 50,95 30,75 40,75 40,60 25,60 25,70 5,50 25,30 25,40" />` },
        { name: 'Chevron', markup: `<polygon points="10,10 60,10 90,50 60,90 10,90 40,50" />` },
        { name: 'Pentagon Arrow', markup: `<polygon points="5,15 65,15 95,50 65,85 5,85" />` },
        { name: 'Notched Right', markup: `<polygon points="5,15 65,15 95,50 65,85 5,85 30,50" />` },
        { name: 'Striped Right', markup: `<path d="M25,15 H65 L95,50 L65,85 H25 L55,50 Z M5,15 H15 L45,50 L15,85 H5 L35,50 Z" />` },
        { name: 'U-Turn', markup: `<path d="M40,95 V65 H70 A20,20 0 0,0 70,25 H30 V10 L5,35 L30,60 V45 H70 A5,5 0 0,1 70,55 H40 Z" />` },
        { name: 'Circular Arrow', markup: `<path d="M50,15 A35,35 0 1,1 15,50 H5 L20,25 L35,50 H25 A25,25 0 1,0 50,25 Z" />` },
        { name: 'Curved Right', markup: `<path d="M5,80 Q5,40 50,40 V20 L95,50 L50,80 V60 Q20,60 5,80 Z" />` },
        { name: 'Curved Left', markup: `<path d="M95,80 Q95,40 50,40 V20 L5,50 L50,80 V60 Q80,60 95,80 Z" />` },
        { name: 'Curved Up', markup: `<path d="M20,95 Q20,50 40,50 H20 L50,5 L80,50 H60 Q60,80 20,95 Z" />` },
        { name: 'Right Callout', markup: `<polygon points="5,25 65,25 65,10 95,50 65,90 65,75 5,75" />` },
        { name: 'Left Callout', markup: `<polygon points="95,25 35,25 35,10 5,50 35,90 35,75 95,75" />` },
        { name: 'Up Callout', markup: `<polygon points="25,95 25,35 10,35 50,5 90,35 75,35 75,95" />` },
        { name: 'Down Callout', markup: `<polygon points="25,5 25,65 10,65 50,95 90,65 75,65 75,5" />` }
    ];

    // --- THE MASTER SVG COORDINATE LIBRARY ---
    const shapeLibrary = {
        "Basic Shapes": basicShapes,
        "Hollow Basic Shapes": makeHollow(basicShapes),
        "Symbols & Icons": [
            { name: 'Checkmark', markup: `<path d="M10,50 L40,80 L90,10" fill="none" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>` },
            { name: 'X Mark', markup: `<path d="M15,15 L85,85 M85,15 L15,85" fill="none" stroke-width="12" stroke-linecap="round"/>` },
            { name: 'Home', markup: `<path d="M50,5 L5,45 V95 H35 V60 H65 V95 H95 V45 Z" />` },
            { name: 'User', markup: `<circle cx="50" cy="30" r="20" /><path d="M20,95 C20,70 30,60 50,60 C70,60 80,70 80,95 Z" />` },
            { name: 'Magnifying Glass', markup: `<circle cx="40" cy="40" r="25" fill="none" stroke-width="10"/><line x1="60" y1="60" x2="90" y2="90" stroke-width="12" stroke-linecap="round"/>` },
            { name: 'Star Icon', markup: star(5, 20) },
            { name: 'Bell', markup: `<path d="M20,75 C20,60 30,50 30,35 A20,20 0 0,1 70,35 C70,50 80,60 80,75 H20 Z M40,85 A10,10 0 0,0 60,85 Z" />` },
            { name: 'Lock', markup: `<rect x="25" y="45" width="50" height="40" rx="5" /><path d="M35,45 V30 A15,15 0 0,1 65,30 V45" fill="none" stroke-width="8" />` },
            { name: 'Unlock', markup: `<rect x="25" y="45" width="50" height="40" rx="5" /><path d="M35,45 V30 A15,15 0 0,1 65,30" fill="none" stroke-width="8" />` },
            { name: 'Mail', markup: `<rect x="10" y="20" width="80" height="60" rx="5" /><path d="M10,25 L50,55 L90,25" fill="none" stroke-width="6" />` },
            { name: 'Play', markup: `<polygon points="30,20 80,50 30,80" />` },
            { name: 'Pause', markup: `<rect x="25" y="20" width="15" height="60" /><rect x="60" y="20" width="15" height="60" />` },
            { name: 'Stop', markup: `<rect x="20" y="20" width="60" height="60" />` },
            { name: 'Record', markup: `<circle cx="50" cy="50" r="30" />` }
        ],
        "Block Arrows": blockArrows,
        "Hollow Arrows": [
            { name: 'Standard Hollow Point', markup: `<line x1="10" y1="50" x2="75" y2="50" fill="none" /><polygon points="75,30 95,50 75,70" fill="transparent" />` },
            { name: 'Standard Hollow Double', markup: `<line x1="25" y1="50" x2="75" y2="50" fill="none" /><polygon points="25,30 5,50 25,70" fill="transparent" /><polygon points="75,30 95,50 75,70" fill="transparent" />` },
            { name: 'Standard Hollow Curved', markup: `<path d="M 10,50 Q 50,10 75,50" fill="transparent" /><polygon points="65,35 85,60 85,35" fill="transparent" />` },
            { name: 'Flat Stop', markup: `<line x1="10" y1="50" x2="85" y2="50" fill="none" /><line x1="85" y1="20" x2="85" y2="80" fill="none" />` },
            { name: 'Flat Stop Double', markup: `<line x1="15" y1="50" x2="85" y2="50" fill="none" /><line x1="15" y1="20" x2="15" y2="80" fill="none" /><line x1="85" y1="20" x2="85" y2="80" fill="none" />` },
            { name: 'Flat Stop Curved', markup: `<path d="M 10,50 Q 50,10 85,50" fill="transparent" /><line x1="75" y1="60" x2="95" y2="40" fill="none" />` },
            { name: 'Diamond Hollow', markup: `<line x1="10" y1="50" x2="70" y2="50" fill="none" /><polygon points="70,50 82,38 94,50 82,62" fill="transparent" />` },
            { name: 'Diamond Hollow Double', markup: `<line x1="30" y1="50" x2="70" y2="50" fill="none" /><polygon points="30,50 18,38 6,50 18,62" fill="transparent" /><polygon points="70,50 82,38 94,50 82,62" fill="transparent" />` },
            { name: 'Diamond Hollow Curved', markup: `<path d="M 10,50 Q 50,10 70,50" fill="transparent" /><polygon points="70,50 82,38 94,50 82,62" fill="transparent" />` },
            ...makeHollow(blockArrows)
        ],
        "Polygons": polygons,
        "Hollow Polygons": makeHollow(polygons.slice(0, 10)), // Limit to first 10 so it's not overwhelming
        "Stars": stars,
        "Hollow Stars": makeHollow(stars.slice(0, 8)), // Limit to standard stars
        "Sunbursts & Badges": bursts,
        "Gears": gears,
        "Equation Shapes": [
            { name: 'Plus', markup: `<polygon points="40,10 60,10 60,40 90,40 90,60 60,60 60,90 40,90 40,60 10,60 10,40 40,40" />` },
            { name: 'Minus', markup: `<rect x="10" y="40" width="80" height="20" />` },
            { name: 'Multiply', markup: `<polygon points="20,10 50,40 80,10 90,20 60,50 90,80 80,90 50,60 20,90 10,80 40,50 10,20" />` },
            { name: 'Divide', markup: `<rect x="10" y="45" width="80" height="10" /><circle cx="50" cy="25" r="8" /><circle cx="50" cy="75" r="8" />` },
            { name: 'Equal', markup: `<rect x="10" y="25" width="80" height="15" /><rect x="10" y="60" width="80" height="15" />` },
            { name: 'Not Equal', markup: `<path d="M10,35 H90 V45 H10 Z M10,65 H90 V75 H10 Z M30,95 L40,95 L70,5 L60,5 Z" />` },
            { name: 'Greater Than', markup: `<polygon points="15,15 85,50 15,85 15,65 60,50 15,35" />` },
            { name: 'Less Than', markup: `<polygon points="85,15 15,50 85,85 85,65 40,50 85,35" />` },
            { name: 'Left Bracket', markup: `<path d="M60,5 H40 A20,20 0 0,0 20,25 V75 A20,20 0 0,0 40,95 H60 V85 H40 A10,10 0 0,1 30,75 V25 A10,10 0 0,1 40,15 H60 Z" />` },
            { name: 'Right Bracket', markup: `<path d="M40,5 H60 A20,20 0 0,1 80,25 V75 A20,20 0 0,1 60,95 H40 V85 H60 A10,10 0 0,0 70,75 V25 A10,10 0 0,0 60,15 H40 Z" />` },
            { name: 'Left Brace', markup: `<path d="M70,5 C40,5 40,40 10,50 C40,60 40,95 70,95 V85 C50,85 50,60 30,50 C50,40 50,15 70,15 Z" />` },
            { name: 'Right Brace', markup: `<path d="M30,5 C60,5 60,40 90,50 C60,60 60,95 30,95 V85 C50,85 50,60 70,50 C50,40 50,15 30,15 Z" />` }
        ],
        "Flowchart": [
            { name: 'Process', markup: `<rect x="5" y="15" width="90" height="70" />` },
            { name: 'Alternate Process', markup: `<rect x="5" y="15" width="90" height="70" rx="15" ry="15" />` },
            { name: 'Decision', markup: `<polygon points="50,5 95,50 50,95 5,50" />` },
            { name: 'Data', markup: `<polygon points="20,15 95,15 80,85 5,85" />` },
            { name: 'Predefined Process', markup: `<path d="M5,15 H95 V85 H5 Z M15,15 V85 M85,15 V85" fill-rule="evenodd" />` },
            { name: 'Internal Storage', markup: `<path d="M5,15 H95 V85 H5 Z M5,25 H95 M15,15 V85" fill-rule="evenodd" />` },
            { name: 'Document', markup: `<path d="M5,10 H95 V80 Q75,100 50,80 T5,80 Z" />` },
            { name: 'Multidocument', markup: `<path d="M15,5 H95 V65 Q80,85 60,65 T15,65 Z M10,10 V70 Q30,90 50,70 L65,70 V75 Q45,95 25,75 T5,75 V15 Z M5,15 V80 Q25,100 45,80 L55,80 V85 Q35,105 15,85 T5,80 V15 Z" fill-rule="evenodd" />` },
            { name: 'Terminator', markup: `<rect x="5" y="20" width="90" height="60" rx="30" ry="30" />` },
            { name: 'Preparation', markup: `<polygon points="25,15 75,15 95,50 75,85 25,85 5,50" />` },
            { name: 'Manual Input', markup: `<polygon points="5,30 95,15 95,85 5,85" />` },
            { name: 'Manual Operation', markup: `<polygon points="20,15 80,15 95,85 5,85" />` },
            { name: 'Connector', markup: `<circle cx="50" cy="50" r="30" />` },
            { name: 'Off-page Connector', markup: `<polygon points="20,15 80,15 80,65 50,95 20,65" />` },
            { name: 'Card', markup: `<polygon points="25,15 95,15 95,85 5,85 5,35" />` },
            { name: 'Punched Tape', markup: `<path d="M5,15 Q25,5 50,15 T95,15 V85 Q75,95 50,85 T5,85 Z" />` },
            { name: 'Summing Junction', markup: `<circle cx="50" cy="50" r="40" /><path d="M22,22 L78,78 M22,78 L78,22" stroke-width="2" />` },
            { name: 'Or', markup: `<circle cx="50" cy="50" r="40" /><path d="M50,10 V90 M10,50 H90" stroke-width="2" />` },
            { name: 'Collate', markup: `<polygon points="5,15 95,15 50,50 95,85 5,85 50,50" fill-rule="evenodd" />` },
            { name: 'Sort', markup: `<polygon points="50,5 95,50 5,50 Z M50,95 95,50 5,50 Z" fill-rule="evenodd" />` },
            { name: 'Merge', markup: `<polygon points="5,15 95,15 50,85" />` },
            { name: 'Delay', markup: `<path d="M5,15 H50 A35,35 0 0,1 50,85 H5 Z" />` }
        ],
        "Banners & Ribbons": [
            { name: 'Up Ribbon', markup: `<path d="M5,30 L25,30 L25,10 Q50,30 75,10 L75,30 L95,30 L85,55 L95,80 L5,80 L15,55 Z" />` },
            { name: 'Down Ribbon', markup: `<path d="M5,20 L95,20 L85,45 L95,70 L75,70 L75,90 Q50,70 25,90 L25,70 L5,70 L15,45 Z" />` },
            { name: 'Curved Ribbon', markup: `<path d="M5,40 Q25,20 50,40 T95,40 V80 Q75,60 50,80 T5,80 Z" />` },
            { name: 'Scroll Vertical', markup: `<path d="M20,10 Q50,0 80,10 V90 Q50,100 20,90 Z M20,10 A10,10 0 1,1 20,30 M80,90 A10,10 0 1,0 80,70" fill="none" stroke-width="4" />` },
            { name: 'Scroll Horizontal', markup: `<path d="M10,20 Q0,50 10,80 H90 Q100,50 90,20 Z M10,20 A10,10 0 1,0 30,20 M90,80 A10,10 0 1,1 70,80" fill="none" stroke-width="4" />` }
        ],
        "Callouts": [
            { name: 'Rect Callout', markup: `<path d="M5,5 H95 V65 H60 L40,95 L40,65 H5 Z" />` },
            { name: 'Rounded Callout', markup: `<path d="M15,5 H85 A10,10 0 0,1 95,15 V55 A10,10 0 0,1 85,65 H60 L40,95 L40,65 H15 A10,10 0 0,1 5,55 V15 A10,10 0 0,1 15,5 Z" />` },
            { name: 'Oval Callout', markup: `<path d="M50,5 A45,30 0 1,1 5,35 C5,50 20,60 30,65 L15,95 L45,70 A45,30 0 0,1 50,5 Z" />` },
            { name: 'Cloud Callout', markup: `<path d="M 30,40 C 20,40 20,60 30,60 C 30,70 50,75 55,65 L 75,90 L 70,60 C 85,60 85,40 75,35 C 90,20 70,10 60,20 C 50,10 35,15 30,30 Z" />` },
            { name: 'Line Callout 1', markup: `<path d="M10,10 H90 V40 H10 Z M50,40 L30,90" fill="none" stroke-width="4" />` },
            { name: 'Line Callout 2', markup: `<path d="M10,10 H90 V40 H10 Z M50,40 L30,60 H10" fill="none" stroke-width="4" />` }
        ]
    };

    // --- RENDER THE UI ---
    Object.keys(shapeLibrary).forEach(category => {
        const header = document.createElement('div');
        header.className = "dropdown-category-header";
        dropdown.appendChild(header);
        header.innerText = category;

        const grid = document.createElement('div');
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "repeat(8, 1fr)";
        grid.style.gap = "4px";
        grid.style.padding = "8px";
        dropdown.appendChild(grid);

        shapeLibrary[category].forEach(shape => {
            const item = document.createElement('div');
            item.title = shape.name;
            item.className = "shape-dropdown-item";
            
            item.innerHTML = `<svg class="shape-preview-vector" viewBox="0 0 100 100" style="width:100%; height:100%; overflow:visible;"><g fill="var(--ui-theme-color)" stroke="var(--ui-theme-dark)" stroke-width="2">${shape.markup}</g></svg>`;
            
            item.onclick = () => {
                const insFill = (colorSchemes && colorSchemes[state.currentScheme]) ? colorSchemes[state.currentScheme][3] : 'var(--ui-theme-color)';
                const insStroke = (colorSchemes && colorSchemes[state.currentScheme]) ? colorSchemes[state.currentScheme][0] : 'var(--ui-theme-dark)';
                const svgString = `<svg preserveAspectRatio="none" viewBox="0 0 100 100" style="width:100%; height:100%; overflow:visible; position:absolute; top:0; left:0;"><g class="shape-path" vector-effect="non-scaling-stroke" fill="${insFill}" stroke="${insStroke}" stroke-width="2">${shape.markup}</g></svg>`;
                
                if (typeof createWrapper === 'function') {
                    const el = createWrapper(svgString);
                    el.setAttribute('data-type', 'shape');
                    el.setAttribute('data-scheme-fill', '3');
                    el.setAttribute('data-scheme-stroke', '0');
                    el.style.width = '100px'; 
                    el.style.height = '100px';
                    if (typeof applySingleElementScheme === 'function') applySingleElementScheme(el, state.currentScheme);
                }
                dropdown.style.display = 'none';
            };
            
            grid.appendChild(item);
        });
    });

    console.log(`✅ Loaded ${Object.values(shapeLibrary).reduce((acc, cat) => acc + cat.length, 0)} Vector Shapes successfully.`);
};
/* =========================================================================
   BUG FIX: Shape Color Inheritance & Contextual Ribbon Routing
   ========================================================================= */
(function installShapeFixes() {
    
    // 1. FIX BUG 2: Ensure contextual ribbons instantly recognize new SVG shapes
    // We proxy the createWrapper function to inject the data-type attribute *before* the ribbon checks it.
    if (!window._patchedCreateWrapperForShapes) {
        const originalCreateWrapper = window.createWrapper;
        window.createWrapper = function(htmlContent) {
            const el = originalCreateWrapper.apply(this, arguments);
            
            // If the content generated is one of our new SVG shapes...
            if (htmlContent.includes('<svg') && htmlContent.includes('shape-path')) {
                el.setAttribute('data-type', 'shape');
                
                // Immediately correct the contextual ribbon tab
                if (typeof window.ContextRibbonSystem !== 'undefined') {
                    window.ContextRibbonSystem.updateTabs(el);
                }
            }
            return el;
        };
        window._patchedCreateWrapperForShapes = true;
    }

    // 2. FIX BUG 1: Format Text Box router (handles SVG fills + Hollow stripping)
    // We rewrite the format tool to understand the difference between text boxes and vector shapes
    if (typeof ContextMenuActions !== 'undefined') {
        ContextMenuActions.formatTextBox = function() {
            if (!state.selectedEl) return;
            
            let currentBg = "#ffffff";
            let currentBc = "#000000";
            let currentBt = 0;
            let currentFillType = 'solid';
            
            let currentGradPreset = 'custom';
            let currentGradC1 = '#ff0000';
            let currentGradC2 = '#0000ff';
            let currentGradStyle = 'linear_90';
            
            let currentPatStyle = 'dots';
            let currentPatFg = '#ff0000';
            let currentPatBg = '#0000ff';
            let currentPatScale = 1.0;
            let currentOpacity = 1.0;
            
            const isShape = state.selectedEl.getAttribute('data-type') === 'shape';
            const svgOuter = state.selectedEl.querySelector('svg .shape-path') || state.selectedEl.querySelector('svg g');
            const content = state.selectedEl.querySelector('.element-content');
            
            if (isShape && svgOuter) {
                const fillAttr = svgOuter.getAttribute('fill');
                if (fillAttr === 'transparent' || fillAttr === 'none') currentFillType = 'none';
            }
            if (content) {
                if (content.style.opacity) currentOpacity = parseFloat(content.style.opacity);
                const configAttr = content.getAttribute('data-format-config');
                if (configAttr) {
                    try {
                        const config = JSON.parse(decodeURIComponent(configAttr));
                        if (config.gradPreset) currentGradPreset = config.gradPreset;
                        if (config.gradC1) currentGradC1 = config.gradC1;
                        if (config.gradC2) currentGradC2 = config.gradC2;
                        if (config.gradStyle) currentGradStyle = config.gradStyle;
                        if (config.patStyle) currentPatStyle = config.patStyle;
                        if (config.patFg) currentPatFg = config.patFg;
                        if (config.patBg) currentPatBg = config.patBg;
                        if (config.patScale) currentPatScale = parseFloat(config.patScale);
                        if (config.opacity !== undefined) currentOpacity = parseFloat(config.opacity);
                    } catch(e) {}
                }
            }

            // Populate the dialog with the existing colors
            if (isShape && svgOuter) {
                const fill = svgOuter.getAttribute('fill');
                if (fill === 'none' || fill === 'transparent') currentFillType = 'none';
                else if (fill) {
                    if (fill.startsWith('#')) currentBg = fill;
                    else if (fill.startsWith('url(#grad-')) currentFillType = 'gradient';
                    else if (fill.startsWith('url(#pat-')) currentFillType = 'pattern';
                }
                const stroke = svgOuter.getAttribute('stroke');
                if (stroke && stroke.startsWith('#')) currentBc = stroke;
                
                const strokeWidth = svgOuter.getAttribute('stroke-width');
                if (strokeWidth) currentBt = parseInt(strokeWidth);
            } else if (content) {
                const bg = content.style.background;
                if (bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
                    currentFillType = 'none';
                } else if (bg && bg.includes('gradient')) {
                    if (bg.includes('repeating') || bg.includes('conic')) currentFillType = 'pattern';
                    else currentFillType = 'gradient';
                }
                else if (bg) currentBg = bg;
            }
            
            let current3dRx = 0; let current3dRy = 0; let current3dRz = 0; let current3dP = 800;
            
            // Live Preview Capture State
            let originalSvgDefs = '';
            let originalSvgFill = '';
            let originalSvgStroke = '';
            let originalSvgStrokeWidth = '';
            let originalCssBackground = '';
            let originalCssBackgroundImage = '';
            let originalCssBackgroundColor = '';
            let originalCssBackgroundSize = '';
            let originalCssBorder = '';
            let originalCssTransform = '';
            let originalCssOpacity = '';
            let originalDataSchemeFill = '';
            let originalDataSchemeStroke = '';

            // Universal 3D Capture (Now applied to content for all elements)
            if (content) {
                current3dRx = content.getAttribute('data-3d-rx') || 0;
                current3dRy = content.getAttribute('data-3d-ry') || 0;
                current3dRz = content.getAttribute('data-3d-rz') || 0;
                current3dP = content.getAttribute('data-3d-p') || 800;
                originalCssTransform = content.style.transform || '';
                content.style.transformStyle = 'preserve-3d';
            }

            if (isShape && svgOuter) {
                const defs = svgOuter.closest('svg').querySelector('defs');
                if (defs) originalSvgDefs = defs.outerHTML;
                originalSvgFill = svgOuter.getAttribute('fill') || '';
                originalSvgStroke = svgOuter.getAttribute('stroke') || '';
                originalSvgStrokeWidth = svgOuter.getAttribute('stroke-width') || '';
            } else if (content) {
                originalCssBackground = content.style.background || '';
                originalCssBackgroundImage = content.style.backgroundImage || '';
                originalCssBackgroundColor = content.style.backgroundColor || '';
                originalCssBackgroundSize = content.style.backgroundSize || '';
                originalCssBorder = content.style.border || '';
                originalCssOpacity = content.style.opacity || '';
            }
            originalDataSchemeFill = state.selectedEl.getAttribute('data-scheme-fill') || '';
            originalDataSchemeStroke = state.selectedEl.getAttribute('data-scheme-stroke') || '';
            
            window._dialogCancelHook = () => {
                if (content) {
                    content.style.transform = originalCssTransform;
                    content.setAttribute('data-3d-rx', current3dRx);
                    content.setAttribute('data-3d-ry', current3dRy);
                    content.setAttribute('data-3d-rz', current3dRz);
                    content.setAttribute('data-3d-p', current3dP);
                }
                
                if (isShape && svgOuter) {
                    const svgRoot = svgOuter.closest('svg');
                    const defs = svgRoot.querySelector('defs');
                    if (defs) defs.remove();
                    if (originalSvgDefs) svgRoot.insertAdjacentHTML('afterbegin', originalSvgDefs);
                    
                    if (originalSvgFill) svgOuter.setAttribute('fill', originalSvgFill); else svgOuter.removeAttribute('fill');
                    if (originalSvgStroke) svgOuter.setAttribute('stroke', originalSvgStroke); else svgOuter.removeAttribute('stroke');
                    if (originalSvgStrokeWidth) svgOuter.setAttribute('stroke-width', originalSvgStrokeWidth); else svgOuter.removeAttribute('stroke-width');
                    
                    // Cleanup legacy transform on svg if user had an old save
                    svgOuter.style.transform = '';
                } else if (content) {
                    content.style.background = originalCssBackground;
                    content.style.backgroundImage = originalCssBackgroundImage;
                    content.style.backgroundColor = originalCssBackgroundColor;
                    content.style.backgroundSize = originalCssBackgroundSize;
                    content.style.border = originalCssBorder;
                    content.style.opacity = originalCssOpacity;
                }
                
                if (originalDataSchemeFill) state.selectedEl.setAttribute('data-scheme-fill', originalDataSchemeFill);
                else state.selectedEl.removeAttribute('data-scheme-fill');
                
                if (originalDataSchemeStroke) state.selectedEl.setAttribute('data-scheme-stroke', originalDataSchemeStroke);
                else state.selectedEl.removeAttribute('data-scheme-stroke');
            };

            const form = `
                <div class="input-group" style="margin-bottom:10px;">
                    <label>Fill Type:</label>
                    <select id="ctx-box-fill-type" onchange="
                        document.getElementById('ctx-box-solid-panel').style.display = this.value==='solid' ? 'block' : 'none';
                        document.getElementById('ctx-box-gradient-panel').style.display = this.value==='gradient' ? 'block' : 'none';
                        document.getElementById('ctx-box-pattern-panel').style.display = this.value==='pattern' ? 'block' : 'none';
                        window._applyFormatPreview();
                    ">
                        <option value="none" ${currentFillType==='none'?'selected':''}>No Fill (Transparent)</option>
                        <option value="solid" ${currentFillType==='solid'?'selected':''}>Solid Color</option>
                        <option value="gradient" ${currentFillType==='gradient'?'selected':''}>Gradient Fill</option>
                        <option value="pattern" ${currentFillType==='pattern'?'selected':''}>Pattern Fill</option>
                    </select>
                </div>
                
                <div id="ctx-box-solid-panel" style="display:${currentFillType==='solid'?'block':'none'};">
                    <div class="input-group" style="margin-bottom:10px;">
                        <label>Fill Color:</label>
                        <div>
                            <input type="hidden" id="ctx-box-bg" value="${currentBg.startsWith('#') ? currentBg : '#ffffff'}">
                            <div style="background-color:${currentBg.startsWith('#') ? currentBg : '#ffffff'}; width:100%; height:30px; border:1px solid #ccc; border-radius:4px; cursor:pointer;" onclick="CustomColorPicker.open(this, document.getElementById('ctx-box-bg').value, (c) => { document.getElementById('ctx-box-bg').value = c; document.getElementById('ctx-box-bg').removeAttribute('data-scheme-index'); this.style.backgroundColor = c; window._applyFormatPreview(); })"></div>
                            <div style="display:flex; gap:3px; margin-top:5px;" title="Scheme Colors">
                                ${colorSchemes[state.currentScheme].map((c, i) => `<div style="width:16px;height:16px;background:${c};border:1px solid #aaa;cursor:pointer;" onclick="document.getElementById('ctx-box-bg').value='${c}'; document.getElementById('ctx-box-bg').setAttribute('data-scheme-index', '${i}'); window._applyFormatPreview();"></div>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div id="ctx-box-gradient-panel" style="display:${currentFillType==='gradient'?'block':'none'}; padding:10px; background:#f9f9f9; border:1px solid #ddd; margin-bottom:10px; border-radius:4px;">
                    <div class="input-group" style="margin-bottom:10px;">
                        <label>Gradient Preset:</label>
                        <select id="ctx-box-grad-preset" onchange="document.getElementById('ctx-custom-grad').style.display = this.value==='custom' ? 'block' : 'none';">
                            <option value="custom" ${currentGradPreset==='custom'?'selected':''}>Custom 2-Color</option>
                            <option value="gold" ${currentGradPreset==='gold'?'selected':''}>Metallic Gold</option>
                            <option value="silver" ${currentGradPreset==='silver'?'selected':''}>Metallic Silver</option>
                            <option value="chrome" ${currentGradPreset==='chrome'?'selected':''}>Metallic Chrome</option>
                            <option value="bronze" ${currentGradPreset==='bronze'?'selected':''}>Metallic Bronze</option>
                            <option value="sunset" ${currentGradPreset==='sunset'?'selected':''}>Sunset Glow</option>
                            <option value="ocean" ${currentGradPreset==='ocean'?'selected':''}>Ocean Blue</option>
                        </select>
                    </div>
                    
                    <div id="ctx-custom-grad" style="display:block; margin-bottom:10px;">
                        <label style="display:block; font-size:12px; margin-bottom:4px;">Custom Colors:</label>
                        <div style="display:flex; gap:10px;">
                            <input type="hidden" id="ctx-box-grad-1" value="${currentGradC1}">
                            <div style="background-color:${currentGradC1}; width:40px; height:24px; border:1px solid #ccc; border-radius:4px; cursor:pointer;" onclick="CustomColorPicker.open(this, document.getElementById('ctx-box-grad-1').value, (c) => { document.getElementById('ctx-box-grad-1').value = c; this.style.backgroundColor = c; })"></div>
                            
                            <input type="hidden" id="ctx-box-grad-2" value="${currentGradC2}">
                            <div style="background-color:${currentGradC2}; width:40px; height:24px; border:1px solid #ccc; border-radius:4px; cursor:pointer; margin-left:10px;" onclick="CustomColorPicker.open(this, document.getElementById('ctx-box-grad-2').value, (c) => { document.getElementById('ctx-box-grad-2').value = c; this.style.backgroundColor = c; })"></div>
                        </div>
                    </div>

                    <div class="input-group">
                        <label>Gradient Style:</label>
                        <select id="ctx-box-grad-style">
                            <option value="linear_90" ${currentGradStyle==='linear_90'?'selected':''}>Linear (Left to Right)</option>
                            <option value="linear_180" ${currentGradStyle==='linear_180'?'selected':''}>Linear (Top to Bottom)</option>
                            <option value="linear_45" ${currentGradStyle==='linear_45'?'selected':''}>Linear (Diagonal)</option>
                            <option value="radial" ${currentGradStyle==='radial'?'selected':''}>Radial (Center Out)</option>
                        </select>
                    </div>
                </div>
                
                <div id="ctx-box-pattern-panel" style="display:${currentFillType==='pattern'?'block':'none'}; padding:10px; background:#f9f9f9; border:1px solid #ddd; margin-bottom:10px; border-radius:4px;">
                    <div class="input-group" style="margin-bottom:10px;">
                        <label>Pattern Style:</label>
                        <select id="ctx-box-pat-style">
                            <option value="dots" ${currentPatStyle==='dots'?'selected':''}>Tiny Dots</option>
                            <option value="lines_diag" ${currentPatStyle==='lines_diag'?'selected':''}>Diagonal Lines</option>
                            <option value="crosshatch" ${currentPatStyle==='crosshatch'?'selected':''}>Crosshatch</option>
                            <option value="checker" ${currentPatStyle==='checker'?'selected':''}>Checkerboard</option>
                            <option value="lines_v" ${currentPatStyle==='lines_v'?'selected':''}>Vertical Lines</option>
                            <option value="lines_h" ${currentPatStyle==='lines_h'?'selected':''}>Horizontal Lines</option>
                            <option value="grid" ${currentPatStyle==='grid'?'selected':''}>Square Grid</option>
                            <option value="polka" ${currentPatStyle==='polka'?'selected':''}>Polka Dots</option>
                        </select>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <div style="display:flex; flex-direction:column; align-items:center;">
                            <label style="font-size:12px;">Pattern</label>
                            <input type="hidden" id="ctx-box-pat-fg" value="${currentPatFg}">
                            <div style="background-color:${currentPatFg}; width:100%; height:24px; border:1px solid #ccc; border-radius:4px; cursor:pointer;" onclick="CustomColorPicker.open(this, document.getElementById('ctx-box-pat-fg').value, (c) => { document.getElementById('ctx-box-pat-fg').value = c; this.style.backgroundColor = c; })"></div>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center;">
                            <label style="font-size:12px;">Background</label>
                            <input type="hidden" id="ctx-box-pat-bg" value="${currentPatBg}">
                            <div style="background-color:${currentPatBg}; width:100%; height:24px; border:1px solid #ccc; border-radius:4px; cursor:pointer;" onclick="CustomColorPicker.open(this, document.getElementById('ctx-box-pat-bg').value, (c) => { document.getElementById('ctx-box-pat-bg').value = c; this.style.backgroundColor = c; })"></div>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Pattern Scale:</label>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <input type="range" id="ctx-box-pat-scale" min="0.2" max="3" step="0.1" value="${currentPatScale}" oninput="document.getElementById('ctx-box-pat-scale-val').innerText = this.value + 'x'">
                            <span id="ctx-box-pat-scale-val" style="font-size:12px; width:30px;">${currentPatScale}x</span>
                        </div>
                    </div>
                </div>

                <div class="input-group" style="margin-bottom:15px; margin-top:10px;">
                    <label>Object Opacity:</label>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="range" id="ctx-box-opacity" min="0" max="100" step="1" value="${Math.round(currentOpacity * 100)}" oninput="document.getElementById('ctx-box-opacity-val').innerText = this.value + '%'">
                        <span id="ctx-box-opacity-val" style="font-size:12px; width:40px;">${Math.round(currentOpacity * 100)}%</span>
                    </div>
                </div>

                <div class="input-group" style="margin-bottom:10px;">
                    <label>Border / Stroke Color:</label>
                    <div>
                        <input type="hidden" id="ctx-box-bc" value="${currentBc}">
                        <div style="background-color:${currentBc}; width:100%; height:30px; border:1px solid #ccc; border-radius:4px; cursor:pointer;" onclick="CustomColorPicker.open(this, document.getElementById('ctx-box-bc').value, (c) => { document.getElementById('ctx-box-bc').value = c; document.getElementById('ctx-box-bc').removeAttribute('data-scheme-index'); this.style.backgroundColor = c; window._applyFormatPreview(); })"></div>
                        <div style="display:flex; gap:3px; margin-top:5px;" title="Scheme Colors">
                            ${colorSchemes[state.currentScheme].map((c, i) => `<div style="width:16px;height:16px;background:${c};border:1px solid #aaa;cursor:pointer;" onclick="document.getElementById('ctx-box-bc').value='${c}'; document.getElementById('ctx-box-bc').setAttribute('data-scheme-index', '${i}'); window._applyFormatPreview();"></div>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="input-group">
                    <label>Border Thickness (px):</label>
                    <div class="modern-spinner">
                        <input type="text" id="ctx-box-bt" value="${currentBt}" onchange="this.value = Math.max(0, Math.min(20, parseInt(this.value)||0))">
                        <div class="spin-btns">
                            <div onclick="document.getElementById('ctx-box-bt').value=Math.min(20, parseInt(document.getElementById('ctx-box-bt').value||0)+1); window._applyFormatPreview && window._applyFormatPreview();"><i class="fas fa-chevron-up"></i></div>
                            <div onclick="document.getElementById('ctx-box-bt').value=Math.max(0, parseInt(document.getElementById('ctx-box-bt').value||0)-1); window._applyFormatPreview && window._applyFormatPreview();"><i class="fas fa-chevron-down"></i></div>
                        </div>
                    </div>
                </div>
                <div style="font-size:10px; color:#666; margin-top:10px; font-style:italic;">
                    Tip: Set thickness to 0 to remove the border.
                </div>
                
                <hr style="margin:15px 0; border:none; border-top:1px solid #ddd;">
                <div style="font-weight:bold; margin-bottom:10px;">3D Rotation & Depth</div>
                
                <div class="input-group">
                    <label>Perspective (Depth):</label>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="range" id="ctx-box-3d-p" min="100" max="2000" step="50" value="${current3dP}" oninput="document.getElementById('ctx-val-3d-p').innerText = this.value + 'px'">
                        <span id="ctx-val-3d-p" style="font-size:12px; width:40px;">${current3dP}px</span>
                    </div>
                </div>
                <div class="input-group">
                    <label>X Rotation (Pitch):</label>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="range" id="ctx-box-3d-rx" min="-180" max="180" step="1" value="${current3dRx}" oninput="document.getElementById('ctx-val-3d-rx').innerText = this.value + '°'">
                        <span id="ctx-val-3d-rx" style="font-size:12px; width:30px;">${current3dRx}°</span>
                    </div>
                </div>
                <div class="input-group">
                    <label>Y Rotation (Yaw):</label>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="range" id="ctx-box-3d-ry" min="-180" max="180" step="1" value="${current3dRy}" oninput="document.getElementById('ctx-val-3d-ry').innerText = this.value + '°'">
                        <span id="ctx-val-3d-ry" style="font-size:12px; width:30px;">${current3dRy}°</span>
                    </div>
                </div>
                <div class="input-group">
                    <label>Z Rotation (Roll):</label>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="range" id="ctx-box-3d-rz" min="-180" max="180" step="1" value="${current3dRz}" oninput="document.getElementById('ctx-val-3d-rz').innerText = this.value + '°'">
                        <span id="ctx-val-3d-rz" style="font-size:12px; width:30px;">${current3dRz}°</span>
                    </div>
                </div>
            `;

            window._applyFormatPreview = () => {
                if (!document.getElementById('ctx-box-fill-type')) return;
                const fillType = document.getElementById('ctx-box-fill-type').value;
                const bgInput = document.getElementById('ctx-box-bg');
                const bcInput = document.getElementById('ctx-box-bc');
                const bg = bgInput.value;
                const bc = bcInput.value;
                const bt = document.getElementById('ctx-box-bt').value;
                
                const schemeFill = bgInput.getAttribute('data-scheme-index');
                if (schemeFill !== null && fillType === 'solid') state.selectedEl.setAttribute('data-scheme-fill', schemeFill);
                else state.selectedEl.removeAttribute('data-scheme-fill');
                
                const schemeStroke = bcInput.getAttribute('data-scheme-index');
                if (schemeStroke !== null) state.selectedEl.setAttribute('data-scheme-stroke', schemeStroke);
                else state.selectedEl.removeAttribute('data-scheme-stroke');
                
                const gradPreset = document.getElementById('ctx-box-grad-preset') ? document.getElementById('ctx-box-grad-preset').value : 'custom';
                const gradC1 = document.getElementById('ctx-box-grad-1') ? document.getElementById('ctx-box-grad-1').value : '#ff0000';
                const gradC2 = document.getElementById('ctx-box-grad-2') ? document.getElementById('ctx-box-grad-2').value : '#0000ff';
                const gradStyle = document.getElementById('ctx-box-grad-style') ? document.getElementById('ctx-box-grad-style').value : 'linear_90';
                
                const patStyle = document.getElementById('ctx-box-pat-style') ? document.getElementById('ctx-box-pat-style').value : 'dots';
                const patFg = document.getElementById('ctx-box-pat-fg') ? document.getElementById('ctx-box-pat-fg').value : '#ff0000';
                const patBg = document.getElementById('ctx-box-pat-bg') ? document.getElementById('ctx-box-pat-bg').value : '#0000ff';
                const patScale = document.getElementById('ctx-box-pat-scale') ? parseFloat(document.getElementById('ctx-box-pat-scale').value) : 1.0;
                
                const val3dRx = document.getElementById('ctx-box-3d-rx') ? document.getElementById('ctx-box-3d-rx').value : 0;
                const val3dRy = document.getElementById('ctx-box-3d-ry') ? document.getElementById('ctx-box-3d-ry').value : 0;
                const val3dRz = document.getElementById('ctx-box-3d-rz') ? document.getElementById('ctx-box-3d-rz').value : 0;
                const val3dP = document.getElementById('ctx-box-3d-p') ? document.getElementById('ctx-box-3d-p').value : 800;
                
                const opacityVal = document.getElementById('ctx-box-opacity') ? parseFloat(document.getElementById('ctx-box-opacity').value) / 100 : 1.0;
                
                const transform3DStr = `perspective(${val3dP}px) rotateX(${val3dRx}deg) rotateY(${val3dRy}deg) rotateZ(${val3dRz}deg)`;
                
                // Define Presets
                const presets = {
                    gold: [{o:0, c:"#bf953f"}, {o:25, c:"#fcf6ba"}, {o:50, c:"#b38728"}, {o:75, c:"#fbf5b7"}, {o:100, c:"#aa771c"}],
                    silver: [{o:0, c:"#e0e0e0"}, {o:25, c:"#f8f8f8"}, {o:50, c:"#b0b0b0"}, {o:75, c:"#f0f0f0"}, {o:100, c:"#909090"}],
                    chrome: [{o:0, c:"#d1d5da"}, {o:48, c:"#ffffff"}, {o:50, c:"#8b939c"}, {o:100, c:"#d1d5da"}],
                    bronze: [{o:0, c:"#cd7f32"}, {o:50, c:"#e6b080"}, {o:100, c:"#b3621b"}],
                    sunset: [{o:0, c:"#ff5e62"}, {o:100, c:"#ff9966"}],
                    ocean: [{o:0, c:"#2E3192"}, {o:100, c:"#1BFFFF"}],
                    custom: [{o:0, c:gradC1}, {o:100, c:gradC2}]
                };
                
                const stops = presets[gradPreset] || presets.custom;

                if (isShape && svgOuter) {
                    const isHollow = svgOuter.querySelector('g[fill="transparent"]') !== null;
                    const svgRoot = svgOuter.closest('svg');
                    
                    // Cleanup old gradients
                    const oldDefs = svgRoot.querySelector('defs');
                    if (oldDefs) oldDefs.remove();

                    const cleanChildren = (attr) => {
                        svgOuter.querySelectorAll('*').forEach(el => {
                            if (el.getAttribute(attr) !== 'none') el.removeAttribute(attr);
                        });
                    };

                    if (fillType === 'none') {
                        svgOuter.setAttribute('fill', 'transparent');
                        cleanChildren('fill');
                    } else if (fillType === 'solid') {
                        if (isHollow && bg === "#ffffff") {
                            svgOuter.setAttribute('fill', 'transparent');
                            cleanChildren('fill');
                        } else {
                            svgOuter.setAttribute('fill', bg);
                            cleanChildren('fill');
                            svgOuter.querySelectorAll('[fill="transparent"]').forEach(el => el.removeAttribute('fill'));
                        }
                    } else if (fillType === 'gradient') {
                        const gradId = 'grad-' + Math.random().toString(36).substr(2, 9);
                        let defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                        
                        const isRadial = gradStyle === 'radial';
                        let gradEl = document.createElementNS('http://www.w3.org/2000/svg', isRadial ? 'radialGradient' : 'linearGradient');
                        gradEl.setAttribute('id', gradId);
                        
                        if (!isRadial) {
                            if (gradStyle === 'linear_90') { gradEl.setAttribute('x1', '0%'); gradEl.setAttribute('y1', '0%'); gradEl.setAttribute('x2', '100%'); gradEl.setAttribute('y2', '0%'); }
                            else if (gradStyle === 'linear_180') { gradEl.setAttribute('x1', '0%'); gradEl.setAttribute('y1', '0%'); gradEl.setAttribute('x2', '0%'); gradEl.setAttribute('y2', '100%'); }
                            else if (gradStyle === 'linear_45') { gradEl.setAttribute('x1', '0%'); gradEl.setAttribute('y1', '0%'); gradEl.setAttribute('x2', '100%'); gradEl.setAttribute('y2', '100%'); }
                        }
                        
                        stops.forEach(s => {
                            let stopEl = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                            stopEl.setAttribute('offset', s.o + '%');
                            stopEl.setAttribute('stop-color', s.c);
                            gradEl.appendChild(stopEl);
                        });
                        
                        defs.appendChild(gradEl);
                        svgRoot.insertBefore(defs, svgRoot.firstChild);
                        
                        svgOuter.setAttribute('fill', `url(#${gradId})`);
                        cleanChildren('fill');
                        svgOuter.querySelectorAll('[fill="transparent"]').forEach(el => el.removeAttribute('fill'));
                    } else if (fillType === 'pattern') {
                        const patId = 'pat-' + Math.random().toString(36).substr(2, 9);
                        let defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                        let patEl = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
                        patEl.setAttribute('id', patId);
                        patEl.setAttribute('patternUnits', 'userSpaceOnUse');
                        patEl.setAttribute('patternTransform', `scale(${patScale})`);
                        
                        let bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        bgRect.setAttribute('width', '100%');
                        bgRect.setAttribute('height', '100%');
                        bgRect.setAttribute('fill', patBg);
                        patEl.appendChild(bgRect);

                        if (patStyle === 'dots') {
                            patEl.setAttribute('width', '10');
                            patEl.setAttribute('height', '10');
                            let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                            circle.setAttribute('cx', '5'); circle.setAttribute('cy', '5');
                            circle.setAttribute('r', '2'); circle.setAttribute('fill', patFg);
                            patEl.appendChild(circle);
                        } else if (patStyle === 'lines_diag') {
                            patEl.setAttribute('width', '10');
                            patEl.setAttribute('height', '10');
                            let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            path.setAttribute('d', 'M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2');
                            path.setAttribute('stroke', patFg); path.setAttribute('stroke-width', '2');
                            patEl.appendChild(path);
                        } else if (patStyle === 'crosshatch') {
                            patEl.setAttribute('width', '10');
                            patEl.setAttribute('height', '10');
                            let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            path.setAttribute('d', 'M0,0 l10,10 M10,0 l-10,10');
                            path.setAttribute('stroke', patFg); path.setAttribute('stroke-width', '1');
                            patEl.appendChild(path);
                        } else if (patStyle === 'checker') {
                            patEl.setAttribute('width', '20');
                            patEl.setAttribute('height', '20');
                            let r1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                            r1.setAttribute('width', '10'); r1.setAttribute('height', '10'); r1.setAttribute('fill', patFg);
                            let r2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                            r2.setAttribute('x', '10'); r2.setAttribute('y', '10');
                            r2.setAttribute('width', '10'); r2.setAttribute('height', '10'); r2.setAttribute('fill', patFg);
                            patEl.appendChild(r1); patEl.appendChild(r2);
                        } else if (patStyle === 'lines_v') {
                            patEl.setAttribute('width', '10');
                            patEl.setAttribute('height', '10');
                            let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            path.setAttribute('d', 'M5,0 l0,10');
                            path.setAttribute('stroke', patFg); path.setAttribute('stroke-width', '2');
                            patEl.appendChild(path);
                        } else if (patStyle === 'lines_h') {
                            patEl.setAttribute('width', '10');
                            patEl.setAttribute('height', '10');
                            let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            path.setAttribute('d', 'M0,5 l10,0');
                            path.setAttribute('stroke', patFg); path.setAttribute('stroke-width', '2');
                            patEl.appendChild(path);
                        } else if (patStyle === 'grid') {
                            patEl.setAttribute('width', '20');
                            patEl.setAttribute('height', '20');
                            let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                            path.setAttribute('d', 'M20,0 l0,20 l-20,0');
                            path.setAttribute('fill', 'none');
                            path.setAttribute('stroke', patFg); path.setAttribute('stroke-width', '1');
                            patEl.appendChild(path);
                        } else if (patStyle === 'polka') {
                            patEl.setAttribute('width', '20');
                            patEl.setAttribute('height', '20');
                            let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                            circle.setAttribute('cx', '10'); circle.setAttribute('cy', '10');
                            circle.setAttribute('r', '6'); circle.setAttribute('fill', patFg);
                            patEl.appendChild(circle);
                        }

                        defs.appendChild(patEl);
                        svgRoot.insertBefore(defs, svgRoot.firstChild);
                        
                        svgOuter.setAttribute('fill', `url(#${patId})`);
                        cleanChildren('fill');
                        svgOuter.querySelectorAll('[fill="transparent"]').forEach(el => el.removeAttribute('fill'));
                    }
                    
                    svgOuter.setAttribute('stroke', bc);
                    svgOuter.setAttribute('stroke-width', bt);
                    cleanChildren('stroke');
                    
                    svgOuter.style.transform = ''; // Clear legacy transform from SVG
                    
                    svgOuter.querySelectorAll('[stroke-width]').forEach(el => {
                        if (el !== svgOuter) el.removeAttribute('stroke-width');
                    });

                    if (content) {
                        content.style.background = 'transparent';
                        content.style.border = 'none';
                    }
                } else if (content) {
                    // Standard HTML Text Box Formatting
                    if (fillType === 'none') {
                        content.style.background = 'transparent';
                    } else if (fillType === 'solid') {
                        content.style.background = bg;
                    } else if (fillType === 'gradient') {
                        const cssStops = stops.map(s => `${s.c} ${s.o}%`).join(', ');
                        if (gradStyle === 'radial') {
                            content.style.background = `radial-gradient(circle, ${cssStops})`;
                        } else {
                            let angle = '90deg';
                            if (gradStyle === 'linear_180') angle = '180deg';
                            if (gradStyle === 'linear_45') angle = '135deg';
                            content.style.background = `linear-gradient(${angle}, ${cssStops})`;
                        }
                    } else if (fillType === 'pattern') {
                        content.style.backgroundColor = patBg;
                        if (patStyle === 'dots') {
                            content.style.backgroundImage = `radial-gradient(${patFg} 20%, transparent 20%)`;
                            content.style.backgroundSize = `${10 * patScale}px ${10 * patScale}px`;
                        } else if (patStyle === 'lines_diag') {
                            content.style.backgroundImage = `repeating-linear-gradient(45deg, ${patFg} 0, ${patFg} ${2 * patScale}px, transparent ${2 * patScale}px, transparent ${10 * patScale}px)`;
                            content.style.backgroundSize = 'auto';
                        } else if (patStyle === 'crosshatch') {
                            content.style.backgroundImage = `repeating-linear-gradient(45deg, ${patFg} 0, ${patFg} ${1 * patScale}px, transparent ${1 * patScale}px, transparent ${10 * patScale}px), repeating-linear-gradient(-45deg, ${patFg} 0, ${patFg} ${1 * patScale}px, transparent ${1 * patScale}px, transparent ${10 * patScale}px)`;
                            content.style.backgroundSize = 'auto';
                        } else if (patStyle === 'checker') {
                            content.style.backgroundImage = `conic-gradient(${patFg} 90deg, transparent 90deg 180deg, ${patFg} 180deg 270deg, transparent 270deg)`;
                            content.style.backgroundSize = `${20 * patScale}px ${20 * patScale}px`;
                        } else if (patStyle === 'lines_v') {
                            content.style.backgroundImage = `repeating-linear-gradient(90deg, ${patFg} 0, ${patFg} ${2 * patScale}px, transparent ${2 * patScale}px, transparent ${10 * patScale}px)`;
                            content.style.backgroundSize = 'auto';
                        } else if (patStyle === 'lines_h') {
                            content.style.backgroundImage = `repeating-linear-gradient(0deg, ${patFg} 0, ${patFg} ${2 * patScale}px, transparent ${2 * patScale}px, transparent ${10 * patScale}px)`;
                            content.style.backgroundSize = 'auto';
                        } else if (patStyle === 'grid') {
                            content.style.backgroundImage = `repeating-linear-gradient(0deg, ${patFg} 0, ${patFg} ${1 * patScale}px, transparent ${1 * patScale}px, transparent ${20 * patScale}px), repeating-linear-gradient(90deg, ${patFg} 0, ${patFg} ${1 * patScale}px, transparent ${1 * patScale}px, transparent ${20 * patScale}px)`;
                            content.style.backgroundSize = 'auto';
                        } else if (patStyle === 'polka') {
                            content.style.backgroundImage = `radial-gradient(${patFg} 30%, transparent 30%)`;
                            content.style.backgroundSize = `${20 * patScale}px ${20 * patScale}px`;
                        }
                    }
                    content.style.border = bt > 0 ? `${bt}px solid ${bc}` : 'none';
                }
                
                // Universal 3D Formatting
                if (content) {
                    content.setAttribute('data-3d-rx', val3dRx);
                    content.setAttribute('data-3d-ry', val3dRy);
                    content.setAttribute('data-3d-rz', val3dRz);
                    content.setAttribute('data-3d-p', val3dP);
                    content.style.transform = transform3DStr;
                    content.style.transformOrigin = 'center';
                    // Fix blurriness on SVG rendering during 3D transform
                    content.style.transformStyle = 'preserve-3d';
                    content.style.backfaceVisibility = 'hidden'; 
                    content.style.opacity = opacityVal;
                    
                    // Save formatting state for next open
                    const formatConfig = {
                        gradPreset, gradC1, gradC2, gradStyle,
                        patStyle, patFg, patBg, patScale,
                        opacity: opacityVal
                    };
                    content.setAttribute('data-format-config', encodeURIComponent(JSON.stringify(formatConfig)));
                }
            };
            
            DialogSystem.show('Format Properties', form, () => {
                window._applyFormatPreview();
                
                const rx = parseFloat(content.getAttribute('data-3d-rx')) || 0;
                const ry = parseFloat(content.getAttribute('data-3d-ry')) || 0;
                const rz = parseFloat(content.getAttribute('data-3d-rz')) || 0;
                const has3D = (rx !== 0 || ry !== 0 || rz !== 0);
                
                window._dialogCancelHook = null;
                
                if (has3D && typeof ContextMenuActions !== 'undefined' && ContextMenuActions.flattenToImage) {
                    setTimeout(() => {
                        ContextMenuActions.flattenToImage();
                    }, 50);
                } else {
                    if (typeof pushHistory === 'function') pushHistory();
                }
            });
            
            // Attach live preview listeners
            setTimeout(() => {
                const dlg = document.getElementById('custom-dialog-box');
                if (!dlg) return;
                dlg.querySelectorAll('select, input').forEach(el => {
                    el.addEventListener('input', window._applyFormatPreview);
                    el.addEventListener('change', window._applyFormatPreview);
                });
            }, 50);
        };
    }
    
    console.log("✅ Smart Formatting Router & Ribbon Fix loaded successfully.");
})();


// --- MIGRATED SHAPE EDIT POINTS LOGIC ---
window.toggleShapeEditPoints = function(el) {
    el = el || state.selectedEl;
    if(!el) return;
    if(state.shapeEditMode) {
        window.exitShapeEditMode();
        return;
    }
    
    // Check if it's a shape
    const dataType = el.getAttribute('data-type');
    let type = null;
    let contentDiv = el.querySelector('.element-content > div:not(.shape-text)') || el.querySelector('.element-content');
    let svgPolygon = el.querySelector('svg polygon');
    let points = [];
    
    if(dataType === 'shape' && contentDiv && contentDiv.style.clipPath && contentDiv.style.clipPath.includes('polygon')) {
        type = 'clip-path';
        // Parse clip-path polygon(x% y%, x% y%, ...)
        const match = contentDiv.style.clipPath.match(/polygon\(([^)]+)\)/);
        if(match) {
            const pts = match[1].split(',').map(s => s.trim());
            pts.forEach(p => {
                const parts = p.split(' ');
                if(parts.length >= 2) {
                    points.push({
                        x: parseFloat(parts[0]),
                        y: parseFloat(parts[1])
                    });
                }
            });
        }
    } else if(dataType === 'shape' && contentDiv && (!contentDiv.style.clipPath || contentDiv.style.clipPath.includes('inset'))) {
        type = 'clip-path';
        contentDiv.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
        points = [
            {x: 0, y: 0},
            {x: 100, y: 0},
            {x: 100, y: 100},
            {x: 0, y: 100}
        ];
    } else if(svgPolygon) {
        type = 'svg-polygon';
        // Parse points="x,y x,y"
        const ptsAttr = svgPolygon.getAttribute('points');
        if(ptsAttr) {
            const pts = ptsAttr.trim().split(/[\s,]+/);
            for(let i=0; i<pts.length; i+=2) {
                if(i+1 < pts.length) {
                    points.push({
                        x: parseFloat(pts[i]),
                        y: parseFloat(pts[i+1])
                    });
                }
            }
        }
    } else {
        return; // Not a supported shape
    }
    
    if(points.length === 0) return;
    
    state.shapeEditMode = true;
    el.classList.add('editing-shape');
    document.getElementById('status-msg').innerText = "Shape Edit Mode: Drag points to modify shape.";
    
    window._shapeEditContext = { el, type, points, contentDiv, svgPolygon };
    window.renderShapeEditHandles();
}

window.renderShapeEditHandles = function() {
    if(!state.shapeEditMode || !window._shapeEditContext) return;
    const { el, points, type } = window._shapeEditContext;
    
    // Remove existing handles
    el.querySelectorAll('.shape-edit-handle').forEach(h => h.remove());
    
    points.forEach((pt, index) => {
        const handle = document.createElement('div');
        handle.className = 'shape-edit-handle';
        handle.dataset.index = index;
        
        if(type === 'clip-path') {
            handle.style.left = pt.x + '%';
            handle.style.top = pt.y + '%';
        } else if(type === 'svg-polygon') {
            handle.style.left = pt.x + '%';
            handle.style.top = pt.y + '%';
        }
        el.appendChild(handle);
    });
}
