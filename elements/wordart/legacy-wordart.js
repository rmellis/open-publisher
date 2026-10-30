// --- 4. WORDART SWAP & SPELLCHECK FIX (v5.13.1) ---
const brokenWordArts = [];

// Cache of WordArt CSS rules parsed from stylesheets
const LEGACY_WORDART_CSS_MAP = {
  "1": ".wa-style-1 { color: transparent; -webkit-text-stroke: 2px #333; }",
  "2": ".wa-style-2 { background: linear-gradient(to bottom, #f00, #ff0); -webkit-background-clip: text; color: transparent; -webkit-text-stroke: 1px #000; -webkit-text-fill-color: transparent; font-style: italic; }",
  "3": ".wa-style-3 { color: #fff; text-shadow: 2px 2px 0 #000, 4px 4px 0 #555; }",
  "4": ".wa-style-4 { background: linear-gradient(45deg, #00f, #0ff); -webkit-background-clip: text; color: transparent; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));; -webkit-text-fill-color: transparent; }",
  "5": ".wa-style-5 { color: navy; text-shadow: 0 0 5px white, 0 0 10px cyan; letter-spacing: 2px; }",
  "6": ".wa-style-6 { color: #800000; text-shadow: 2px 2px 0 #4a0000, 3px 3px 0 #330000, 4px 6px 6px rgba(0,0,0,0.4); }",
  "7": ".wa-style-7 { background: radial-gradient(circle, #ffd700, #b8860b); -webkit-background-clip: text; color: transparent; font-weight: 900;; -webkit-text-fill-color: transparent; }",
  "8": ".wa-style-8 { font-family: 'Lobster', cursive; color: #ff00de; text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00de, 0 0 30px #ff00de; }",
  "9": ".wa-style-9 { font-family: 'Pacifico', cursive; color: #fff; text-shadow: 3px 3px 0px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; }",
  "10": ".wa-style-10 { font-family: 'Oswald', sans-serif; background: repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px); -webkit-background-clip: text; color: transparent; -webkit-text-stroke: 1px #333;; -webkit-text-fill-color: transparent; }",
  "11": ".wa-style-11 { font-style: italic; color: #ffd700; text-shadow: 1px 1px 0 #cda434, 2px 2px 0 #cda434, 3px 3px 0 #cda434, 4px 4px 0 #cda434; }",
  "12": ".wa-style-12 { font-family: 'Anton', sans-serif; letter-spacing: 5px; color: #fff; background: #000; padding: 0 10px; }",
  "13": ".wa-style-13 { background: linear-gradient(to right, #30CFD0 0%, #330867 100%); -webkit-background-clip: text; color: transparent; font-style: italic;; -webkit-text-fill-color: transparent; }",
  "14": ".wa-style-14 { color: #fff; -webkit-text-stroke: 2px red; text-shadow: 4px 4px 0px rgba(0,0,0,0.2); }",
  "15": ".wa-style-15 { font-family: 'Press Start 2P', cursive; color: lime; text-shadow: 2px 2px 0px #000; background: #222; padding: 5px; font-size: 20px; }",
  "16": ".wa-style-16 { font-family: 'Cinzel', serif; color: #d4af37; text-shadow: 0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15); }",
  "17": ".wa-style-17 { font-family: 'Righteous', cursive; color: transparent; -webkit-text-stroke: 2px #fff; filter: drop-shadow(0 0 2px #ff00de) drop-shadow(0 0 5px #00eaff); }",
  "18": ".wa-style-18 { font-family: 'Abril Fatface', cursive; background: linear-gradient(45deg, #ff007f, #7928ca, #4338ca, #00d4ff, #ff007f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.3)); }",
  "19": ".wa-style-19 { font-family: 'Shadows Into Light', cursive; color: #333; font-weight: bold; background: #ffeb3b; padding: 0 10px; box-shadow: 4px 4px 0 rgba(0,0,0,0.2); }",
  "20": ".wa-style-20 { font-family: 'Acme', sans-serif; color: #fff; text-shadow: 0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 15px #ff0000, 0 0 20px #ff0000; }",
  "21": ".wa-style-21 { font-family: 'Bangers', cursive; color: #FF5722; letter-spacing: 2px; }",
  "22": ".wa-style-22 { font-family: 'Indie Flower', cursive; color: #673AB7; border-bottom: 3px dashed #673AB7; }",
  "23": ".wa-style-23 { font-family: 'Orbitron', sans-serif; color: #00ff00; text-shadow: 0 0 10px #00ff00; background: #000; padding: 2px; }",
  "24": ".wa-style-24 { font-family: 'Lobster', cursive; color: #2196F3; -webkit-text-stroke: 1px white; filter: drop-shadow(2px 2px 0px #0D47A1); }",
  "25": ".wa-style-25 { font-family: 'Impact', sans-serif; background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red); -webkit-background-clip: text; color: transparent;; -webkit-text-fill-color: transparent; }",
  "26": ".wa-style-26 { font-family: 'Comic Neue', cursive; color: #FF9800; font-weight: 900; font-style: italic; }",
  "27": ".wa-style-27 { font-family: 'Anton', sans-serif; color: #fff; background: #333; border-radius: 10px; padding: 5px 15px; }",
  "28": ".wa-style-28 { font-family: 'Playfair Display', serif; font-style: italic; color: #795548; text-decoration: underline wavy #795548; }",
  "29": ".wa-style-29 { font-family: 'Montserrat', sans-serif; font-weight: 900; color: #fff; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 3px 3px 0 #ccc; }",
  "30": ".wa-style-30 { font-family: 'Segoe UI', sans-serif; font-weight: 300; letter-spacing: 10px; color: #000; text-transform: uppercase; border: 1px solid #000; padding: 5px; }",
  "31": ".wa-style-31 { color: #fff; text-shadow: 0 0 2px #000, 0 0 10px #00f, 0 0 20px #00f; }",
  "32": ".wa-style-32 { background: linear-gradient(180deg, #333 50%, #eee 50%); -webkit-background-clip: text; color: transparent;; -webkit-text-fill-color: transparent; }",
  "33": ".wa-style-33 { color: gold; text-shadow: 1px 1px 0 #000; font-style: italic; font-weight: bold; }",
  "34": ".wa-style-34 { -webkit-text-stroke: 1px #000; color: white; filter: drop-shadow(4px 4px 0 red); }",
  "35": ".wa-style-35 { background: radial-gradient(circle, #f00, #000); -webkit-background-clip: text; color: transparent;; -webkit-text-fill-color: transparent; }",
  "36": ".wa-style-36 { color: #555; text-shadow: 2px 2px 2px #ccc; letter-spacing: 4px; }",
  "37": ".wa-style-37 { color: #e91e63; font-weight: 900; font-style: italic; }",
  "38": ".wa-style-38 { border: 2px solid #000; padding: 2px; color: #000; background: #fff; box-shadow: 5px 5px 0 #000; }",
  "39": ".wa-style-39 { font-family: monospace; color: #0f0; background: #000; padding: 2px; }",
  "40": ".wa-style-40 { color: transparent; -webkit-text-stroke: 1px blue; background: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\"><circle cx=\"5\" cy=\"5\" r=\"2\" fill=\"blue\"/></svg>'); -webkit-background-clip: text;; -webkit-text-fill-color: transparent; }",
  "41": ".wa-style-41 { color: #888; text-shadow: 0px 1px 1px #fff; background: #eee; padding: 0 5px; }",
  "42": ".wa-style-42 { background: linear-gradient(to right, orange, purple); -webkit-background-clip: text; color: transparent; font-weight: 900;; -webkit-text-fill-color: transparent; }",
  "43": ".wa-style-43 { color: white; -webkit-text-stroke: 2px black; font-family: 'Impact'; }",
  "44": ".wa-style-44 { color: #d4af37; font-family: 'Cinzel'; border-top: 1px solid #d4af37; border-bottom: 1px solid #d4af37; }",
  "45": ".wa-style-45 { color: #ff0066; text-shadow: 2px 2px 0px #00ffff; }",
  "46": ".wa-style-46 { color: #fff; background: #000; box-shadow: 0 0 10px #000; padding: 5px; }",
  "47": ".wa-style-47 { font-variant: small-caps; color: darkgreen; font-weight: bold; text-decoration: underline; }",
  "48": ".wa-style-48 { color: transparent; -webkit-text-stroke: 1px #000; filter: blur(0.5px); }",
  "49": ".wa-style-49 { background: linear-gradient(to bottom, #fff 0%, #ccc 50%, #000 51%, #333 100%); -webkit-background-clip: text; color: transparent;; -webkit-text-fill-color: transparent; }",
  "50": ".wa-style-50 { color: #607d8b; letter-spacing: -2px; font-weight: 900; }",
  "51": ".wa-style-51 { color: #fff; text-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff; font-family: 'Orbitron'; }",
  "52": ".wa-style-52 { color: #795548; border: 2px dashed #795548; padding: 0 10px; border-radius: 10px; }",
  "53": ".wa-style-53 { font-family: 'Anton', Impact, sans-serif; color: #3f51b5; }",
  "54": ".wa-style-54 { color: red; text-decoration: line-through; }",
  "55": ".wa-style-55 { background: repeating-linear-gradient(90deg, #f00, #f00 5px, #fff 5px, #fff 10px); -webkit-background-clip: text; color: transparent; -webkit-text-stroke: 1px #000;; -webkit-text-fill-color: transparent; }",
  "56": ".wa-style-56 { font-style: italic; color: #9c27b0; text-shadow: 3px 3px 5px rgba(0,0,0,0.3); }",
  "57": ".wa-style-57 { color: #fff; background: #ff5722; border-radius: 50%; padding: 10px; width: 1.5em; height: 1.5em; line-height: 1.5em; text-align: center; }",
  "58": ".wa-style-58 { color: #00bcd4; border-bottom: 5px solid #00bcd4; }",
  "59": ".wa-style-59 { font-family: 'Press Start 2P'; font-size: 20px; color: #333; }",
  "60": ".wa-style-60 { color: transparent; -webkit-text-stroke: 2px #ffeb3b; filter: drop-shadow(0 0 2px #000); }",
  "61": ".wa-style-61 { background: linear-gradient(to bottom, #fcf6ba, #bf953f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #8a6327; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.2)); }",
  "62": ".wa-style-62 { background: linear-gradient(to bottom, #e0e0e0, #9e9e9e, #3e3e3e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #666; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.2)); }",
  "63": ".wa-style-63 { background: linear-gradient(to right, #b76e79, #e0bfb8, #b76e79); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #91515b; }",
  "64": ".wa-style-64 { background: linear-gradient(to bottom, #cd7f32, #f3d0a9, #8c4b14); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #5e310a; }",
  "65": ".wa-style-65 { background: linear-gradient(135deg, #24c6dc, #514a9d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #1a1548; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.2)); }",
  "66": ".wa-style-66 { background: linear-gradient(135deg, #ff0844, #ffb199); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #8a0020; }",
  "67": ".wa-style-67 { background: linear-gradient(135deg, #11998e, #38ef7d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #0b665e; }",
  "68": ".wa-style-68 { background: linear-gradient(135deg, #8e2de2, #4a00e0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #2a0080; }",
  "69": ".wa-style-69 { color: #fff; -webkit-text-stroke: 1px #ff00de; text-shadow: 0 0 6px #ff00de, 0 0 2px #ff00de; }",
  "70": ".wa-style-70 { color: #fff; -webkit-text-stroke: 1px #00e5ff; text-shadow: 0 0 6px #00e5ff, 0 0 2px #00e5ff; }",
  "71": ".wa-style-71 { color: #fff; -webkit-text-stroke: 1px #39ff14; text-shadow: 0 0 6px #39ff14, 0 0 2px #39ff14; }",
  "72": ".wa-style-72 { color: #fff; -webkit-text-stroke: 1px #ffea00; text-shadow: 0 0 6px #ffea00, 0 0 2px #ffea00; }",
  "73": ".wa-style-73 { color: #fff; -webkit-text-stroke: 1px #ff0000; text-shadow: 0 0 6px #ff0000, 0 0 2px #ff0000; }",
  "74": ".wa-style-74 { color: #f1c40f; -webkit-text-stroke: 1px #e67e22; text-shadow: 1px 1px 0 #e67e22, 2px 2px 0 #e67e22, 3px 3px 0 #e67e22, 4px 4px 0 #d35400, 5px 5px 0 #d35400; }",
  "75": ".wa-style-75 { color: #3498db; -webkit-text-stroke: 1px #2980b9; text-shadow: 1px 1px 0 #2980b9, 2px 2px 0 #2980b9, 3px 3px 0 #2980b9, 4px 4px 0 #2c3e50, 5px 5px 0 #2c3e50; }",
  "76": ".wa-style-76 { color: #2ecc71; -webkit-text-stroke: 1px #27ae60; text-shadow: 1px 1px 0 #27ae60, 2px 2px 0 #27ae60, 3px 3px 0 #27ae60, 4px 4px 0 #16a085, 5px 5px 0 #16a085; }",
  "77": ".wa-style-77 { color: #e74c3c; -webkit-text-stroke: 1px #c0392b; text-shadow: 1px 1px 0 #c0392b, 2px 2px 0 #c0392b, 3px 3px 0 #c0392b, 4px 4px 0 #922b21, 5px 5px 0 #922b21; }",
  "78": ".wa-style-78 { color: #fff; text-shadow: -2px 0 0 #ff00de, 2px 0 0 #00e5ff; -webkit-text-stroke: 1px #000; }",
  "79": ".wa-style-79 { color: #ff00a0; -webkit-text-stroke: 2px #fff; text-shadow: 3px 3px 0px #00e5ff; }",
  "80": ".wa-style-80 { background: linear-gradient(to bottom, #ff00a0, #ff8c00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #fff; filter: drop-shadow(3px 3px 0px #222); }",
  "81": ".wa-style-81 { background: linear-gradient(to right, #ff9966, #ff5e62); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.15)); }",
  "82": ".wa-style-82 { background: linear-gradient(to right, #00c6ff, #0072ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.15)); }",
  "83": ".wa-style-83 { background: linear-gradient(to right, #f79d00, #64f38c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.15)); }",
  "84": ".wa-style-84 { background: linear-gradient(to right, #f953c6, #b91d73); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.15)); }",
  "85": ".wa-style-85 { background: linear-gradient(to right, #12c2e9, #c471ed, #f64f59); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.15)); }",
  "86": ".wa-style-86 { background: linear-gradient(to right, #83a4d4, #b6fbff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.15)); }",
  "87": ".wa-style-87 { background: linear-gradient(to right, #f12711, #f5af19); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.15)); }",
  "88": ".wa-style-88 { background: linear-gradient(to right, #654ea3, #eaafc8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.15)); }",
  "89": ".wa-style-89 { background: linear-gradient(to right, #11998e, #38ef7d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.15)); }",
  "90": ".wa-style-90 { background: repeating-linear-gradient(45deg, #000 0px, #000 10px, #ffeb3b 10px, #ffeb3b 20px); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.4)); }",
  "91": ".wa-style-91 { color: #fff; -webkit-text-stroke: 2px #000; text-shadow: 4px 4px 0px #000; }",
  "92": ".wa-style-92 { color: #fff; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 4px 0px #000; }",
  "93": ".wa-style-93 { color: #eef; -webkit-text-stroke: 1px #0055ff; text-shadow: 3px 3px 0px #0022aa; }",
  "94": ".wa-style-94 { color: #e74c3c; -webkit-text-stroke: 2px #fff; text-shadow: 0px 0px 0px #fff, 3px 3px 0px #000; }",
  "95": ".wa-style-95 { color: #3498db; -webkit-text-stroke: 2px #fff; text-shadow: 0px 0px 0px #fff, 3px 3px 0px #000; }",
  "96": ".wa-style-96 { color: transparent; -webkit-text-stroke: 1px #777; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }",
  "97": ".wa-style-97 { color: #111; -webkit-text-stroke: 1px #ff0000; text-shadow: 3px 3px 0px #4a0000; }",
  "98": ".wa-style-98 { background: radial-gradient(circle, #ddd 20%, #444 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; filter: drop-shadow(2px 2px 0px #000); }",
  "99": ".wa-style-99 { color: #f4f4f4; -webkit-text-stroke: 1px #ddd; text-shadow: -1px -1px 1px #fff, 2px 2px 2px #bbb; }",
  "100": ".wa-style-100 { color: #00ff00; -webkit-text-stroke: 1px #003300; text-shadow: 2px 2px 0px #002200; }",
  "101": ".wa-style-101 { color: #fff; text-shadow: 3px 3px 0 #ff0055, -3px -3px 0 #00ffcc; -webkit-text-stroke: 1px #000; }",
  "102": ".wa-style-102 { background: repeating-linear-gradient(0deg, #ff0000 0%, #ffff00 25%, #00ff00 50%, #0000ff 75%, #ff00ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; filter: drop-shadow(2px 2px 0px #000); }",
  "103": ".wa-style-103 { color: #2c3e50; -webkit-text-stroke: 2px #fff; filter: drop-shadow(2px 4px 0px rgba(0,0,0,0.2)); }",
  "104": ".wa-style-104 { color: #f39c12; text-shadow: 2px 2px 0 #c0392b, 4px 4px 0 #8e44ad; -webkit-text-stroke: 1px #000; }",
  "105": ".wa-style-105 { color: #fff; -webkit-text-stroke: 1px #aaa; text-shadow: 1px 1px 0px #ccc, 2px 2px 0px #bbb, 3px 3px 0px #aaa, 4px 4px 0px #999, 5px 5px 0px #888, 6px 6px 0px rgba(0,0,0,0.3); }",
  "106": ".wa-style-106 { background: linear-gradient(to right, #8a2387, #e94057, #f27121); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #551222; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.2)); }",
  "107": ".wa-style-107 { background: linear-gradient(to right, #222, #555); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.4)); }",
  "108": ".wa-style-108 { color: #fff; -webkit-text-stroke: 2px #8e44ad; text-shadow: 3px 3px 0px #f1c40f, 4px 4px 0px #000; }",
  "109": ".wa-style-109 { background: repeating-linear-gradient(45deg, #e74c3c 0px, #e74c3c 10px, #fff 10px, #fff 20px); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #801d12; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.3)); }",
  "110": ".wa-style-110 { background: linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 2px #000; filter: drop-shadow(2px 2px 0px #000); }",
  "111": ".wa-style-111 { color: #0ff; -webkit-text-stroke: 1px #005555; text-shadow: 2px 0 0 #f0f, -2px 0 0 #00f; }",
  "112": ".wa-style-112 { background: repeating-linear-gradient(180deg, #0f0 0px, #0f0 2px, transparent 2px, transparent 4px); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 3px #0f0); }",
  "113": ".wa-style-113 { background: repeating-linear-gradient(180deg, #0ff 0px, #0ff 2px, transparent 2px, transparent 4px); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 3px #0ff); }",
  "114": ".wa-style-114 { color: #fff; -webkit-text-stroke: 2px #0ff; text-shadow: 0 0 8px #0ff; }",
  "115": ".wa-style-115 { color: #000; -webkit-text-stroke: 1px #0f0; text-shadow: 4px 4px 0 #050; }",
  "116": ".wa-style-116 { background: linear-gradient(180deg, #fff 50%, #0ff 50%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; }",
  "117": ".wa-style-117 { background: linear-gradient(180deg, #f0f 50%, #0ff 50%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #fff; filter: drop-shadow(2px 2px 0 #000); }",
  "118": ".wa-style-118 { color: transparent; -webkit-text-stroke: 2px #f00; filter: drop-shadow(0 0 4px #f00); }",
  "119": ".wa-style-119 { color: #222; text-shadow: -1px -1px 0 #555, 1px 1px 0 #000; -webkit-text-stroke: 1px #111; }",
  "120": ".wa-style-120 { background: radial-gradient(circle, #fff, #0ff, #00f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #00aaff; }",
  "121": ".wa-style-121 { background: linear-gradient(to bottom, #ff4e50, #f9d423); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #a82424; }",
  "122": ".wa-style-122 { background: linear-gradient(to bottom, #ff9a9e, #fecfef); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #c75a80; }",
  "123": ".wa-style-123 { background: linear-gradient(to bottom, #56ab2f, #a8e063); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #2d6b14; }",
  "124": ".wa-style-124 { background: linear-gradient(to bottom, #ff0844, #ffb199); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #8a0020; text-shadow: 2px 2px 0px #000; }",
  "125": ".wa-style-125 { background: linear-gradient(to bottom, #f12711, #f5af19); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #fff; filter: drop-shadow(2px 2px 0 #000); }",
  "126": ".wa-style-126 { background: linear-gradient(180deg, #ff4b2b 40%, #fff 50%, #4776e6 60%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; }",
  "127": ".wa-style-127 { background: linear-gradient(to right, #ffb347, #ffcc33); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #cc6600; }",
  "128": ".wa-style-128 { background: repeating-linear-gradient(45deg, #ffb6c1 0px, #ffb6c1 10px, #fff 10px, #fff 20px); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #ff69b4; }",
  "129": ".wa-style-129 { background: linear-gradient(to bottom, #8e2de2, #4a00e0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #fff; filter: drop-shadow(2px 2px 0px #2a0080); }",
  "130": ".wa-style-130 { background: linear-gradient(to bottom, #ff5f6d, #ffc371); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #c73844; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.2)); }",
  "131": ".wa-style-131 { background: linear-gradient(to bottom, #11998e, #38ef7d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #074741; filter: drop-shadow(2px 2px 0px #000); }",
  "132": ".wa-style-132 { background: linear-gradient(to bottom, #2980b9, #6dd5fa, #ffffff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #14496b; }",
  "133": ".wa-style-133 { background: linear-gradient(to bottom, #8e9eab, #eef2f3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #5a6670; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.5)); }",
  "134": ".wa-style-134 { background: linear-gradient(to bottom, #ba8b02, #181818); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; }",
  "135": ".wa-style-135 { background: linear-gradient(to right, #ed4264, #ffedbc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #91162d; }",
  "136": ".wa-style-136 { background: linear-gradient(to bottom, #4b1248, #f0c27b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #2b0829; }",
  "137": ".wa-style-137 { background: linear-gradient(to bottom, #403a3e, #be5869); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #1a1719; }",
  "138": ".wa-style-138 { background: linear-gradient(to bottom, #000000, #0f9b0f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; filter: drop-shadow(0 0 5px #0f9b0f); }",
  "139": ".wa-style-139 { background: linear-gradient(to bottom, #e0eafc, #cfdef3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #8a9bb3; }",
  "140": ".wa-style-140 { background: linear-gradient(to bottom, #870000, #190a05); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; text-shadow: 2px 2px 0px #000; }",
  "141": ".wa-style-141 { background: repeating-linear-gradient(90deg, #000 0px, #000 5px, #fff 5px, #fff 10px); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; }",
  "142": ".wa-style-142 { background: repeating-radial-gradient(circle, #000 0px, #000 4px, #ffcc00 4px, #ffcc00 8px); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; }",
  "143": ".wa-style-143 { background: repeating-linear-gradient(45deg, #000 0px, #000 8px, #ff0000 8px, #ff0000 16px); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #fff; filter: drop-shadow(2px 2px 0px #000); }",
  "144": ".wa-style-144 { background: repeating-linear-gradient(135deg, #333 0px, #333 10px, #555 10px, #555 20px); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; filter: drop-shadow(2px 2px 0px #000); }",
  "145": ".wa-style-145 { background: repeating-linear-gradient(0deg, #111 0px, #111 2px, #fff 2px, #fff 4px); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; }",
  "146": ".wa-style-146 { background: repeating-radial-gradient(circle, #ff00a0 0px, #ff00a0 5px, #00e5ff 5px, #00e5ff 10px); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #fff; }",
  "147": ".wa-style-147 { background: repeating-linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3); background-size: 200% 100%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; }",
  "148": ".wa-style-148 { background: repeating-linear-gradient(45deg, #fff 0px, #fff 5px, #000 5px, #000 6px); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; }",
  "149": ".wa-style-149 { background: repeating-linear-gradient(90deg, #444 0px, #444 15px, #222 15px, #222 30px); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; filter: drop-shadow(2px 2px 0px #ffea00); }",
  "150": ".wa-style-150 { background: repeating-radial-gradient(ellipse, #000 0%, #000 10%, transparent 10%, transparent 20%), #fff; -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; }",
  "151": ".wa-style-151 { color: transparent; -webkit-text-stroke: 1px #bbb; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3)); }",
  "152": ".wa-style-152 { color: #f0f0f0; text-shadow: -1px -1px 2px rgba(0,0,0,0.5); -webkit-text-stroke: 1px #ccc; filter: drop-shadow(1px 1px 0px #fff); }",
  "153": ".wa-style-153 { color: #222; text-shadow: 0px 1px 1px #fff; -webkit-text-stroke: 1px #111; }",
  "154": ".wa-style-154 { background: linear-gradient(to right, #d4af37, #ffdf00, #d4af37); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; filter: drop-shadow(1px 1px 4px rgba(212, 175, 55, 0.4)); }",
  "155": ".wa-style-155 { color: transparent; -webkit-text-stroke: 1px #333; text-shadow: 1px 1px 0 #fff, 2px 2px 0 #333; }",
  "156": ".wa-style-156 { color: #111; -webkit-text-stroke: 1px #eee; text-shadow: 0px 0px 8px #888, 0px 5px 5px rgba(0,0,0,0.5); }",
  "157": ".wa-style-157 { color: #fff; -webkit-text-stroke: 2px #bdc3c7; text-shadow: 3px 3px 0 #95a5a6; }",
  "158": ".wa-style-158 { background: linear-gradient(to right, #111, #444, #111); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.3)); }",
  "159": ".wa-style-159 { color: #fdfbfb; -webkit-text-stroke: 1px #ebedee; filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.15)); }",
  "160": ".wa-style-160 { color: transparent; -webkit-text-stroke: 2px #ff00de; filter: drop-shadow(2px 2px 0px #111); }",
  "161": ".wa-style-161 { background: linear-gradient(to top, #ff9a9e 0%, #fecfef 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #d67a80; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.1)); }",
  "162": ".wa-style-162 { background: linear-gradient(120deg, #f6d365 0%, #fda085 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #c77b5d; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.1)); }",
  "163": ".wa-style-163 { background: linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #7761a3; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.1)); }",
  "164": ".wa-style-164 { background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #5fae86; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.1)); }",
  "165": ".wa-style-165 { background: linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #98a1a6; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.15)); }",
  "166": ".wa-style-166 { background: linear-gradient(to top, #ffecd2 0%, #fcb69f 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #c48b77; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.1)); }",
  "167": ".wa-style-167 { background: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #6f9bd1; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.1)); }",
  "168": ".wa-style-168 { background: linear-gradient(to top, #fddb92 0%, #d1fdff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #a4c9cb; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.1)); }",
  "169": ".wa-style-169 { background: linear-gradient(to right, #ffecd2 0%, #fcb69f 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(2px 2px 0px #ff9a9e); }",
  "170": ".wa-style-170 { background: linear-gradient(to bottom, #fff1eb 0%, #ace0f9 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #7ba9be; filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.1)); }",
  "171": ".wa-style-171 { color: #fff; -webkit-text-stroke: 2px #000; text-shadow: 3px 3px 0 #f00, 6px 6px 0 #0f0, 9px 9px 0 #00f; }",
  "172": ".wa-style-172 { color: #ffeb3b; -webkit-text-stroke: 1px #000; text-shadow: -2px 2px 0 #000, -4px 4px 0 #000, -6px 6px 0 #000, -8px 8px 0 #000; }",
  "173": ".wa-style-173 { color: #fff; -webkit-text-stroke: 2px #000; text-shadow: 0px 4px 0px #000, 0px 8px 0px #000, 0px 12px 0px #000; }",
  "174": ".wa-style-174 { color: #00e5ff; -webkit-text-stroke: 1px #000; text-shadow: 1px -1px 0 #000, 2px -2px 0 #000, 3px -3px 0 #000, 4px -4px 0 #000, 5px -5px 0 #000; }",
  "175": ".wa-style-175 { color: transparent; -webkit-text-stroke: 2px #000; text-shadow: 6px 6px 0px #ccc; }",
  "176": ".wa-style-176 { color: #ff0055; -webkit-text-stroke: 1px #000; text-shadow: 4px 0 0 #00ffcc, 8px 0 0 #000; }",
  "177": ".wa-style-177 { color: #fff; text-shadow: 0 0 0 #000, 0 0 0 #000; -webkit-text-stroke: 1px #000; filter: drop-shadow(5px 5px 0px rgba(0,0,0,0.5)); }",
  "178": ".wa-style-178 { color: #fff; -webkit-text-stroke: 1px #000; filter: drop-shadow(8px 8px 5px rgba(0,0,0,0.6)); }",
  "179": ".wa-style-179 { color: #f1c40f; -webkit-text-stroke: 1px #000; text-shadow: 1px 1px 0 #000, 2px 2px 0 #000, 3px 3px 0 #000, 4px 4px 0 #000, 5px 5px 0 #000, 6px 6px 0 #000, 7px 7px 0 #000; }",
  "180": ".wa-style-180 { color: #fff; -webkit-text-stroke: 1px #333; text-shadow: 1px 1px 0 #ccc, 2px 2px 0 #bbb, 3px 3px 0 #aaa, 4px 4px 0 #999, 5px 5px 0 #888, 6px 6px 0 #777, 7px 7px 0 #666; }",
  "181": ".wa-style-181 { background: radial-gradient(circle, #555 20%, #000 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(2px 2px 0px #ff0000); }",
  "182": ".wa-style-182 { color: #8b0000; -webkit-text-stroke: 1px #300000; filter: drop-shadow(0px 3px 3px rgba(139,0,0,0.6)); }",
  "183": ".wa-style-183 { color: #a52a2a; -webkit-text-stroke: 1px #5c1616; text-shadow: 1px 1px 0px #ff7f50, 2px 2px 0px #000; }",
  "184": ".wa-style-184 { background: repeating-linear-gradient(45deg, #222 0px, #222 5px, #000 5px, #000 10px); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #ffea00; }",
  "185": ".wa-style-185 { color: #00ff00; -webkit-text-stroke: 1px #005500; filter: drop-shadow(0px 0px 6px #00ff00); }",
  "186": ".wa-style-186 { background: linear-gradient(to bottom, #3e5151, #decba4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #222c2c; }",
  "187": ".wa-style-187 { color: transparent; -webkit-text-stroke: 2px #444; filter: drop-shadow(0 0 3px #000); }",
  "188": ".wa-style-188 { color: #1a1a1a; -webkit-text-stroke: 1px #000; text-shadow: -1px -1px 0px #444, 1px 1px 0px #000; }",
  "189": ".wa-style-189 { background: repeating-radial-gradient(circle, #333 0%, #333 10%, #111 10%, #111 20%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; }",
  "190": ".wa-style-190 { background: linear-gradient(to bottom, #870000, #190a05); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #f00; filter: drop-shadow(0 0 3px #f00); }",
  "191": ".wa-style-191 { background: linear-gradient(90deg, #ff9a9e, #fecfef, #f6d365, #fda085); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; }",
  "192": ".wa-style-192 { background: linear-gradient(90deg, #00c6ff, #0072ff, #12c2e9, #c471ed); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #fff; filter: drop-shadow(2px 2px 0px #000); }",
  "193": ".wa-style-193 { background: linear-gradient(90deg, #f12711, #f5af19, #f79d00, #64f38c); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; }",
  "194": ".wa-style-194 { background: repeating-linear-gradient(90deg, #ff00de 0px, #ff00de 10px, #00e5ff 10px, #00e5ff 20px, #ffea00 20px, #ffea00 30px); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; }",
  "195": ".wa-style-195 { background: linear-gradient(to bottom, #fff 0%, #fff 49%, #ff00a0 50%, #ff00a0 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #000; filter: drop-shadow(2px 2px 0px #00e5ff); }",
  "196": ".wa-style-196 { color: #fff; -webkit-text-stroke: 2px #ff00de; text-shadow: 3px 3px 0px #00e5ff, 6px 6px 0px #ffea00; }",
  "197": ".wa-style-197 { background: linear-gradient(135deg, #d4af37, #ffdf00, #fff, #d4af37); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #8a6327; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.3)); }",
  "198": ".wa-style-198 { background: radial-gradient(circle, #fff, #bbb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 2px #000; filter: drop-shadow(4px 4px 0px #000); }",
  "199": ".wa-style-199 { background: linear-gradient(to bottom, #111, #434343); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #fff; filter: drop-shadow(0px 0px 5px rgba(255,255,255,0.8)); }",
  "200": ".wa-style-200 { background: linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 2px #000; text-shadow: 2px 2px 0px #fff, 4px 4px 0px #000; }",
  "201": ".wa-style-201 { background: linear-gradient(to bottom, #ffffff 0%, #4facfe 50%, #00f2fe 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #0284c7; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.3)); }",
  "202": ".wa-style-202 { background: linear-gradient(135deg, #0ba360 0%, #3cba92 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #044327; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.25)); }",
  "203": ".wa-style-203 { background: linear-gradient(180deg, #ff0844 0%, #ffb199 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 2px 2px 0 #3a0007; -webkit-text-stroke: 1px #800018; }",
  "204": ".wa-style-204 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #301b52; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.3)); }",
  "205": ".wa-style-205 { color: #ff6b6b; text-shadow: 3px 3px 0 #1dd1a1; -webkit-text-stroke: 1px #222; }",
  "206": ".wa-style-206 { background: linear-gradient(to bottom, #1fa2ff, #12d8fa, #a6ffcb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #0a3d62; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.2)); }",
  "207": ".wa-style-207 { background: linear-gradient(to bottom, #ffe259, #ffa751); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 2px 2px 0 #795548; -webkit-text-stroke: 1px #b45309; }",
  "208": ".wa-style-208 { color: #e0f7fa; text-shadow: 0 0 5px #00e5ff, 0 0 15px #00e5ff; -webkit-text-stroke: 1px #005b64; }",
  "209": ".wa-style-209 { color: #ffffff; -webkit-text-stroke: 1px #ff1744; text-shadow: 0 0 8px #d50000; }",
  "210": ".wa-style-210 { background: linear-gradient(to right, #f857a6, #ff5858); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #ffffff; filter: drop-shadow(2px 2px 0px #000); }",
  "211": ".wa-style-211 { background: linear-gradient(180deg, #e6e9f0 0%, #eef1f5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #333333; text-shadow: 2px 2px 0 #888888; }",
  "212": ".wa-style-212 { background: linear-gradient(135deg, #f72585, #7209b7, #3a0ca3, #4361ee, #4cc9f0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #ffffff; filter: drop-shadow(2px 2px 0px #000); }",
  "213": ".wa-style-213 { color: #f72585; text-shadow: -2px -2px 0 #4cc9f0, 2px 2px 0 #7209b7; -webkit-text-stroke: 1px #222; }",
  "214": ".wa-style-214 { background: linear-gradient(to bottom, #f9d423 0%, #ff4e50 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1px #800000; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5)); }"
};
let _waRulesCache = null;

function getWaRulesMap() {
    if (_waRulesCache && Object.keys(_waRulesCache).length > 0) return _waRulesCache;
    _waRulesCache = Object.assign({}, LEGACY_WORDART_CSS_MAP);
    try {
        for (let sheet of document.styleSheets) {
            try {
                const rules = sheet.cssRules || sheet.rules;
                if (!rules) continue;
                for (let rule of rules) {
                    if (rule.selectorText && rule.selectorText.includes('.wa-style-')) {
                        const matches = rule.selectorText.match(/\.wa-style-(\d+)/g);
                        if (matches) {
                            matches.forEach(m => {
                                const id = m.replace('.wa-style-', '');
                                if (!_waRulesCache[id]) _waRulesCache[id] = '';
                                _waRulesCache[id] += rule.cssText + '\n';
                            });
                        }
                    }
                }
            } catch (e) {}
        }
    } catch (e) {}
    return _waRulesCache;
}


// --- CSS Text-Shadow & Drop-Shadow Parsers (v5.11.16) ---
function parseTextShadows(shadowStr) {
    if (!shadowStr || shadowStr === 'none') return [];
    const rawParts = shadowStr.split(/,(?![^(]*\))/g).map(s => s.trim()).filter(Boolean);
    const shadows = [];
    rawParts.forEach(part => {
        let color = '';
        let rest = part;
        const rgbaMatch = part.match(/rgba?\([^)]+\)|hsla?\([^)]+\)/i);
        if (rgbaMatch) {
            color = rgbaMatch[0];
            rest = part.replace(color, '').trim();
        } else {
            const hexMatch = part.match(/#[0-9a-fA-F]{3,8}/);
            if (hexMatch) {
                color = hexMatch[0];
                rest = part.replace(color, '').trim();
            } else {
                const tokens = part.split(/\s+/);
                const nonNumTokens = tokens.filter(t => isNaN(parseFloat(t)));
                if (nonNumTokens.length > 0) {
                    color = nonNumTokens[0];
                    rest = tokens.filter(t => !isNaN(parseFloat(t))).join(' ');
                }
            }
        }
        const nums = rest.trim().split(/\s+/).map(n => parseFloat(n) || 0);
        const offsetX = nums[0] !== undefined ? nums[0] : 0;
        const offsetY = nums[1] !== undefined ? nums[1] : 0;
        const blur = nums[2] !== undefined ? nums[2] : 0;
        shadows.push({ offsetX, offsetY, blur, color: color || '#000000' });
    });
    return shadows;
}

function parseDropShadowFilters(filterStr) {
    if (!filterStr || !filterStr.includes('drop-shadow')) return [];
    const shadows = [];
    const matches = filterStr.matchAll(/drop-shadow\(\s*([^)]+)\s*\)/g);
    for (const m of matches) {
        const parsed = parseTextShadows(m[1].trim());
        if (parsed.length > 0) shadows.push(...parsed);
    }
    return shadows;
}

/**
 * High-resolution Legacy WordArt serialization engine for print and export (v5.11.16).
 * Implements a Dual-Engine Precision Architecture:
 * - Path 1 (SVG foreignObject Engine): Renders complex CSS gradients, repeating stripes,
 *   -webkit-background-clip: text fills, box backgrounds, and 3D perspective transforms at 4.0x scale.
 * - Path 2 (Canvas 2D Precision Engine): Renders authentic typography styles with Google Fonts,
 *   multi-tier ambient neon glows, 3D text extrusion shadows, and outline strokes with zero font fallback.
 */
function resolveWordArtTargets(targetEl) {
    if (!targetEl) return null;
    if (targetEl.tagName && targetEl.tagName.toLowerCase() === 'img' && targetEl.classList.contains('wa-baked-img')) {
        return { isAlreadyBaked: true, bakedImg: targetEl };
    }
    if (targetEl.querySelector) {
        const existingImg = targetEl.querySelector('img.wa-baked-img');
        if (existingImg) return { isAlreadyBaked: true, bakedImg: existingImg };
    }

    let waText = null;
    let waWrapper = null;
    let pubEl = null;

    if (targetEl.classList && targetEl.classList.contains('wa-text')) {
        waText = targetEl;
        waWrapper = waText.closest('.wa-wrapper') || waText.parentElement;
        pubEl = waText.closest('.pub-element') || (waWrapper ? waWrapper.closest('.pub-element') : null) || waWrapper;
    } else if (targetEl.classList && targetEl.classList.contains('wa-wrapper')) {
        waWrapper = targetEl;
        waText = waWrapper.querySelector('.wa-text');
        pubEl = waWrapper.closest('.pub-element') || waWrapper;
    } else {
        pubEl = targetEl.closest ? (targetEl.closest('.pub-element') || targetEl) : targetEl;
        waText = pubEl.querySelector ? pubEl.querySelector('.wa-text') : null;
        waWrapper = pubEl.querySelector ? pubEl.querySelector('.wa-wrapper') : null;
    }

    if (!waText) return null;

    let styleId = '';
    if (waText.classList) {
        Array.from(waText.classList).forEach(c => {
            if (c.startsWith('wa-style-')) styleId = c.replace('wa-style-', '');
        });
    }
    if (!styleId && waText.getAttribute('data-wa-style')) {
        styleId = waText.getAttribute('data-wa-style');
    }

    const rulesMap = getWaRulesMap();
    let specificRule = (styleId && rulesMap[styleId]) ? rulesMap[styleId] : '';
    if (specificRule && !specificRule.includes('.wa-style-')) {
        specificRule = `.wa-style-${styleId} { ${specificRule} }`;
    }

    // Ensure all containers allow natural overflow and shadow bleed
    if (pubEl) {
        pubEl.style.setProperty('overflow', 'visible', 'important');
        pubEl.style.setProperty('contain', 'none', 'important');
        const c = pubEl.querySelector ? pubEl.querySelector('.element-content') : null;
        if (c) {
            c.style.setProperty('overflow', 'visible', 'important');
            c.style.setProperty('contain', 'none', 'important');
        }
    }
    if (waWrapper) {
        waWrapper.style.setProperty('overflow', 'visible', 'important');
        waWrapper.style.setProperty('contain', 'none', 'important');
    }
    waText.style.setProperty('overflow', 'visible', 'important');

    const rawText = (waText.innerText || waText.textContent || '').replace(/\u205F/g, ' ').trim();
    if (!rawText) return null;

    const safeText = rawText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const LEGACY_GOOGLE_FONTS = [
        'lobster', 'pacifico', 'oswald', 'cinzel', 'orbitron', 
        'press start', 'bangers', 'indie flower', 'comic neue', 
        'playfair', 'montserrat', 'righteous', 'abril', 
        'shadows into light', 'acme', 'anton'
    ];
    let compFontFamily = '';
    try {
        const c = window.getComputedStyle(waText);
        if (c && c.fontFamily) compFontFamily = c.fontFamily;
    } catch (e) {}

    const combinedRule = `${compFontFamily} ${specificRule}`.toLowerCase();
    const hasWebFont = LEGACY_GOOGLE_FONTS.some(f => combinedRule.includes(f));
    const hasComplexCss = specificRule.includes('background-clip') || 
                          specificRule.includes('gradient') || 
                          specificRule.includes('background:') ||
                          specificRule.includes('border:') ||
                          specificRule.includes('border-') ||
                          specificRule.includes('perspective') ||
                          specificRule.includes('rotateX') ||
                          specificRule.includes('rotateY') ||
                          (waText.style && (waText.style.backgroundClip || waText.style.webkitBackgroundClip));

    // SVG foreignObject is the primary high-fidelity engine for all system-font styles (Impact, Arial, etc.),
    // all gradient styles, all 3D extrusions, and all box/border styles.
    // Canvas 2D is reserved for pure-typography Google Fonts styles that don't use gradients.
    const isGradientOrBoxStyle = !hasWebFont || hasComplexCss;

    return {
        isAlreadyBaked: false,
        pubEl,
        waWrapper,
        waText,
        styleId,
        specificRule,
        rawText,
        safeText,
        isGradientOrBoxStyle
    };
}

function parseTransformScale(transformStr) {
    let sx = 1, sy = 1, hasScale = false;
    if (!transformStr || transformStr === 'none') return { sx: 1, sy: 1, hasScale: false };

    // Match scale(x, y) or scale(x)
    const sm = transformStr.match(/scale\(\s*([+-]?[0-9.]+)(?:[\s,]+([+-]?[0-9.]+))?\s*\)/i);
    if (sm) {
        sx = parseFloat(sm[1]) || 1;
        sy = parseFloat(sm[2] !== undefined ? sm[2] : sm[1]) || 1;
        hasScale = true;
        return { sx, sy, hasScale };
    }

    // Match scaleX and scaleY
    let found = false;
    const sxm = transformStr.match(/scaleX\(\s*([+-]?[0-9.]+)\s*\)/i);
    if (sxm) { sx = parseFloat(sxm[1]) || 1; found = true; }
    const sym = transformStr.match(/scaleY\(\s*([+-]?[0-9.]+)\s*\)/i);
    if (sym) { sy = parseFloat(sym[1]) || 1; found = true; }
    if (found) return { sx, sy, hasScale: true };

    // Match matrix(a, b, c, d, e, f)
    const mm = transformStr.match(/matrix\(\s*([+-]?[0-9.]+)\s*,\s*([+-]?[0-9.]+)\s*,\s*([+-]?[0-9.]+)\s*,\s*([+-]?[0-9.]+)\s*,\s*([+-]?[0-9.]+)\s*,\s*([+-]?[0-9.]+)\s*\)/i);
    if (mm) {
        const a = parseFloat(mm[1]) || 1;
        const b = parseFloat(mm[2]) || 0;
        const c = parseFloat(mm[3]) || 0;
        const d = parseFloat(mm[4]) || 1;
        sx = Math.sqrt(a * a + b * b) || 1;
        sy = Math.sqrt(c * c + d * d) || 1;
        hasScale = true;
        return { sx, sy, hasScale };
    }

    return { sx: 1, sy: 1, hasScale: false };
}

function renderCanvas2DWordArt(waText, pubEl, waWrapper, styleId, specificRule, rawText, scaleMultiplier) {
    let dispW = parseFloat(pubEl && pubEl.style ? pubEl.style.width : 0);
    if (!dispW || isNaN(dispW) || dispW <= 0) {
        dispW = (pubEl ? pubEl.offsetWidth : 0) || (waWrapper ? waWrapper.offsetWidth : 0) || (waText ? waText.offsetWidth : 0) || 300;
    }
    let dispH = parseFloat(pubEl && pubEl.style ? pubEl.style.height : 0);
    if (!dispH || isNaN(dispH) || dispH <= 0) {
        dispH = (pubEl ? pubEl.offsetHeight : 0) || (waWrapper ? waWrapper.offsetHeight : 0) || (waText ? waText.offsetHeight : 0) || 100;
    }
    dispW = Math.max(30, Math.ceil(dispW));
    dispH = Math.max(20, Math.ceil(dispH));

    let fontFamily = 'Impact, sans-serif';
    let fontSize = '40px';
    let fontWeight = '900';
    let fontStyle = 'normal';
    let letterSpacing = 'normal';
    let textTransform = 'none';
    let transform = '';
    let comp = null;

    try {
        comp = window.getComputedStyle(waText);
        if (comp) {
            if (comp.fontFamily && !comp.fontFamily.includes('Times New Roman')) fontFamily = comp.fontFamily;
            if (comp.fontSize) fontSize = comp.fontSize;
            if (comp.fontWeight) fontWeight = comp.fontWeight;
            if (comp.fontStyle) fontStyle = comp.fontStyle;
            if (comp.letterSpacing) letterSpacing = comp.letterSpacing;
            if (comp.textTransform) textTransform = comp.textTransform;
            if (comp.transform && comp.transform !== 'none') {
                transform = comp.transform;
            }
        }
    } catch (e) {}

    // Parse definitive typography declarations from specificRule
    if (specificRule) {
        const ffm = specificRule.match(/font-family:\s*([^;]+)/i);
        if (ffm && (!waText.style || !waText.style.fontFamily)) {
            const rf = ffm[1].trim();
            if (rf) fontFamily = rf;
        }
        const fwm = specificRule.match(/font-weight:\s*([^;]+)/i);
        if (fwm && (!waText.style || !waText.style.fontWeight)) {
            fontWeight = fwm[1].trim();
        } else if (!fwm && (!comp || !comp.fontWeight || comp.fontWeight === '400') && fontFamily.toLowerCase().includes('lobster')) {
            fontWeight = 'normal';
        }
        const fsm = specificRule.match(/font-style:\s*([^;]+)/i);
        if (fsm && (!waText.style || !waText.style.fontStyle)) {
            fontStyle = fsm[1].trim();
        }
        const lsm = specificRule.match(/letter-spacing:\s*([^;]+)/i);
        if (lsm && (!waText.style || !waText.style.letterSpacing)) {
            letterSpacing = lsm[1].trim();
        }
        const ttm = specificRule.match(/text-transform:\s*([^;]+)/i);
        if (ttm && (!waText.style || !waText.style.textTransform)) {
            textTransform = ttm[1].trim();
        }
        const fzm = specificRule.match(/font-size:\s*([^;]+)/i);
        if (fzm && (!waText.style || !waText.style.fontSize)) {
            fontSize = fzm[1].trim();
        }
    }

    if (waText.style && waText.style.transform && waText.style.transform !== 'none') {
        transform = waText.style.transform;
    }

    let renderText = rawText;
    if (textTransform === 'uppercase') renderText = renderText.toUpperCase();
    else if (textTransform === 'lowercase') renderText = renderText.toLowerCase();

    // Parse transform scale
    const scaleInfo = parseTransformScale(transform);
    let scaleX = scaleInfo.sx;
    let scaleY = scaleInfo.sy;

    // Natural text dimensions
    let naturalW = waText.scrollWidth || waText.offsetWidth || 0;
    let naturalH = waText.scrollHeight || waText.offsetHeight || 0;
    if (!naturalW || !naturalH) {
        const testCanvas = document.createElement('canvas');
        const testCtx = testCanvas.getContext('2d');
        testCtx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
        naturalW = Math.ceil(testCtx.measureText(renderText).width) || 180;
        naturalH = Math.ceil(parseFloat(fontSize)) || 40;
    }

    // Auto-fit if scale was not explicitly provided but element was resized larger
    if (!scaleInfo.hasScale && naturalW > 0 && naturalH > 0) {
        const cw = dispW - 8;
        const ch = dispH - 8;
        if (cw > naturalW * 1.05 || ch > naturalH * 1.05) {
            scaleX = cw / naturalW;
            scaleY = ch / naturalH;
        }
    }

    const avgScale = (Math.abs(scaleX) + Math.abs(scaleY)) / 2;
    const visualW = naturalW * Math.abs(scaleX);
    const visualH = naturalH * Math.abs(scaleY);

    let strokeWidth = 0;
    let strokeColor = '';
    const sm = (comp && comp.webkitTextStroke ? comp.webkitTextStroke.match(/(\d+(?:\.\d+)?px)\s*(.+)/) : null) || 
               specificRule.match(/-webkit-text-stroke:\s*(\d+(?:\.\d+)?px)\s*([^;]+)/);
    if (sm) {
        strokeWidth = parseFloat(sm[1]) || 0;
        strokeColor = sm[2].trim();
    }

    let textColor = '';
    if (waText.style && waText.style.color) {
        textColor = waText.style.color;
    } else if (comp && comp.color && comp.color !== 'rgb(0, 0, 0)' && comp.color !== '#000000') {
        textColor = comp.color;
    }
    if (specificRule) {
        const cm = specificRule.match(/(?:^|[^-\w])color:\s*([^;]+)/i);
        if (cm) {
            const ruleColor = cm[1].trim();
            if (ruleColor === 'transparent') {
                textColor = 'transparent';
            } else if (!textColor || textColor === 'rgb(0, 0, 0)' || textColor === '#000000') {
                textColor = ruleColor;
            }
        }
    }
    if (!textColor) {
        textColor = (comp ? comp.color : '') || '#000000';
    }
    if (specificRule.includes('color: transparent') || specificRule.includes('color:transparent') || textColor === 'transparent' || textColor === 'rgba(0, 0, 0, 0)') {
        textColor = 'transparent';
    }

    let textShadowStr = (comp ? comp.textShadow : '') || '';
    if (!textShadowStr || textShadowStr === 'none') {
        const tsm = specificRule.match(/text-shadow:\s*([^;]+)/);
        if (tsm) textShadowStr = tsm[1].trim();
    }
    let filterStr = (comp ? comp.filter : '') || '';
    if (!filterStr || filterStr === 'none') {
        const fm = specificRule.match(/filter:\s*([^;]+)/);
        if (fm) filterStr = fm[1].trim();
    }

    const shadows = [
        ...parseTextShadows(textShadowStr),
        ...parseDropShadowFilters(filterStr)
    ];

    let maxScaledBlur = 0, maxScaledOffX = 0, maxScaledOffY = 0;
    shadows.forEach(sh => {
        maxScaledBlur = Math.max(maxScaledBlur, (sh.blur || 0) * avgScale);
        maxScaledOffX = Math.max(maxScaledOffX, Math.abs(sh.offsetX || 0) * Math.abs(scaleX));
        maxScaledOffY = Math.max(maxScaledOffY, Math.abs(sh.offsetY || 0) * Math.abs(scaleY));
    });

    const extraLeft = Math.max(0, (visualW - dispW) / 2);
    const extraTop = Math.max(0, (visualH - dispH) / 2);

    // Provide generous padding so neon glow and drop shadow never clip
    const padX = Math.ceil(extraLeft + Math.max(160, maxScaledBlur * 2.4 + maxScaledOffX + 50));
    const padY = Math.ceil(extraTop + Math.max(120, maxScaledBlur * 2.4 + maxScaledOffY + 50));
    const totalW = dispW + padX * 2;
    const totalH = dispH + padY * 2;

    const scale = Math.max(1.0, Math.min(6.0, parseFloat(scaleMultiplier) || 4.0));
    const canvasW = Math.round(totalW * scale);
    const canvasH = Math.round(totalH * scale);

    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const cx = totalW / 2;
    const cy = totalH / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-cx, -cy);

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (letterSpacing && letterSpacing !== 'normal') {
        try { ctx.letterSpacing = letterSpacing; } catch (e) {}
    }

    // Draw shadows in reverse order (bottom/ambient diffusion layer first, up to crisp drop shadow)
    shadows.slice().reverse().forEach(s => {
        ctx.save();
        ctx.shadowColor = s.color;
        // In Canvas 2D, shadowBlur is in raw canvas device units and does not scale with CTM.
        // Multiplying by avgScale * scale accurately replicates the huge ambient CSS glow spread.
        ctx.shadowBlur = (s.blur || 0) * avgScale * scale;
        ctx.shadowOffsetX = (s.offsetX || 0) * scaleX * scale;
        ctx.shadowOffsetY = (s.offsetY || 0) * scaleY * scale;
        if (strokeWidth > 0 && (!textColor || textColor === 'transparent')) {
            ctx.lineWidth = strokeWidth * 2;
            ctx.strokeStyle = s.color;
            ctx.lineJoin = 'round';
            ctx.strokeText(renderText, cx, cy);
        } else {
            ctx.fillStyle = s.color;
            ctx.fillText(renderText, cx, cy);
            if (strokeWidth > 0) {
                ctx.lineWidth = strokeWidth * 2;
                ctx.strokeStyle = s.color;
                ctx.lineJoin = 'round';
                ctx.strokeText(renderText, cx, cy);
            }
        }
        ctx.restore();
    });

    // Draw main stroke if present
    if (strokeWidth > 0 && strokeColor) {
        ctx.save();
        ctx.lineWidth = strokeWidth * 2;
        ctx.strokeStyle = strokeColor;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(renderText, cx, cy);
        ctx.restore();
    }

    // Draw main text fill
    if (textColor && textColor !== 'transparent') {
        ctx.save();
        ctx.fillStyle = textColor;
        ctx.fillText(renderText, cx, cy);
        ctx.restore();
    }

    ctx.restore(); // restore translate & scale transform

    let pngUrl = '';
    try {
        pngUrl = canvas.toDataURL('image/png');
    } catch (taintErr) {
        console.error('[WordArt 2D Bake] Canvas tainted error:', taintErr);
        return null;
    }

    return { pngUrl, padX, padY, totalW, totalH };
}

const WORDART_STATIC_FONT_URLS = {
    "abril fatface": "https://fonts.gstatic.com/s/abrilfatface/v25/zOL64pLDlL1D99S8g8PtiKchq-dmjQ.woff2",
    "acme": "https://fonts.gstatic.com/s/acme/v29/RrQfboBx-C5_XxrBbg.woff2",
    "anton": "https://fonts.gstatic.com/s/anton/v27/1Ptgg87LROyAm3Kz-C8.woff2",
    "architects daughter": "https://fonts.gstatic.com/s/architectsdaughter/v20/KtkxAKiDZI_td1Lkx62xHZHDtgO_Y-bvTYlg4w.woff2",
    "archivo black": "https://fonts.gstatic.com/s/archivoblack/v23/HTxqL289NzCGg4MzN6KJ7eW6CYyF_g.woff2",
    "arvo": "https://fonts.gstatic.com/s/arvo/v23/tDbD2oWUg0MKqScQ7Q.woff2",
    "bangers": "https://fonts.gstatic.com/s/bangers/v25/FeVQS0BTqb0h60ACH55Q2A.woff2",
    "barlow": "https://fonts.gstatic.com/s/barlow/v13/7cHpv4kjgoGqM7E_DMs5.woff2",
    "bebas neue": "https://fonts.gstatic.com/s/bebasneue/v16/JTUSjIg69CK48gW7PXoo9Wlhyw.woff2",
    "bitter": "https://fonts.gstatic.com/s/bitter/v42/raxhHiqOu8IVPmnRc6SY1KXhnF_Y8fbfOLjOXQ.woff2",
    "bree serif": "https://fonts.gstatic.com/s/breeserif/v18/4UaHrEJCrhhnVA3DgluA96rp5w.woff2",
    "cabin": "https://fonts.gstatic.com/s/cabin/v35/u-4X0qWljRw-PfU81xCKCpdpbgZJl6XFpfEd7eA9BIxxkV2EH7alxw.woff2",
    "cairo": "https://fonts.gstatic.com/s/cairo/v31/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-a1PiLA.woff2",
    "caveat": "https://fonts.gstatic.com/s/caveat/v23/WnznHAc5bAfYB2QRah7pcpNvOx-pjfJ9eIWpYQ.woff2",
    "cinzel": "https://fonts.gstatic.com/s/cinzel/v26/8vIU7ww63mVu7gtR-kwKxNvkNOjw-tbnfY3lDQ.woff2",
    "comfortaa": "https://fonts.gstatic.com/s/comfortaa/v47/1Pt_g8LJRfWJmhDAuUsSQamb1W0lwk4S4WjMDrMfIA.woff2",
    "comic neue": "https://fonts.gstatic.com/s/comicneue/v9/4UaHrEJDsxBrF37olUeD96rp5w.woff2",
    "concert one": "https://fonts.gstatic.com/s/concertone/v24/VEM1Ro9xs5PjtzCu-srDqSTijP4.woff2",
    "cookie": "https://fonts.gstatic.com/s/cookie/v23/syky-y18lb0tSbf9kgqS.woff2",
    "courgette": "https://fonts.gstatic.com/s/courgette/v19/wEO_EBrAnc9BLjLQAUk1VvoK.woff2",
    "creepster": "https://fonts.gstatic.com/s/creepster/v13/AlZy_zVUqJz4yMrniH4Rcn35.woff2",
    "crimson text": "https://fonts.gstatic.com/s/crimsontext/v19/wlp2gwHKFkZgtmSR3NB0oRJfbwhT.woff2",
    "dancing script": "https://fonts.gstatic.com/s/dancingscript/v29/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7BMSo3Sup8.woff2",
    "dm sans": "https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxRSW32.woff2",
    "dosis": "https://fonts.gstatic.com/s/dosis/v34/HhyJU5sn9vOmLxNkIwRSjTVNWLEJN7Ml2xME.woff2",
    "eb garamond": "https://fonts.gstatic.com/s/ebgaramond/v33/SlGDmQSNjdsmc35JDF1K5E55YMjF_7DPuGi-6_RkBI9_.woff2",
    "exo 2": "https://fonts.gstatic.com/s/exo2/v26/7cH1v4okm5zmbvwkAx_sfcEuiD8jvvKsOdC_.woff2",
    "fira sans": "https://fonts.gstatic.com/s/firasans/v18/va9E4kDNxMZdWfMOD5Vvl4jL.woff2",
    "fjalla one": "https://fonts.gstatic.com/s/fjallaone/v16/Yq6R-LCAWCX3-6Ky7FAFrOF6kg.woff2",
    "fredoka one": "https://fonts.gstatic.com/s/fredokaone/v15/k3kUo8kEI-tA1RRcTZGmTlHGCac.woff2",
    "gloria hallelujah": "https://fonts.gstatic.com/s/gloriahallelujah/v24/LYjYdHv3kUk9BMV96EIswT9DIbW-MIS11zM.woff2",
    "great vibes": "https://fonts.gstatic.com/s/greatvibes/v21/RWmMoKWR9v4ksMfaWd_JN9XFiaQ.woff2",
    "heebo": "https://fonts.gstatic.com/s/heebo/v28/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EiSysdUmm.woff2",
    "hind": "https://fonts.gstatic.com/s/hind/v18/5aU69_a8oxmIdGl4BA.woff2",
    "ibm plex sans": "https://fonts.gstatic.com/s/ibmplexsans/v23/zYXGKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1swZSAXcomDVmadSD6llDB6g4.woff2",
    "inconsolata": "https://fonts.gstatic.com/s/inconsolata/v37/QldgNThLqRwH-OJ1UHjlKENVzkWGVkL3GZQmAwLYxYWI2qfdm7Lpp4U8WR32lw.woff2",
    "indie flower": "https://fonts.gstatic.com/s/indieflower/v24/m8JVjfNVeKWVnh3QMuKkFcZVaUuH.woff2",
    "josefin sans": "https://fonts.gstatic.com/s/josefinsans/v34/Qw3PZQNVED7rKGKxtqIqX5E-AVSJrOCfjY46_DjQbMZhLw.woff2",
    "kanit": "https://fonts.gstatic.com/s/kanit/v17/nKKZ-Go6G5tXcraVGwA.woff2",
    "karla": "https://fonts.gstatic.com/s/karla/v33/qkBIXvYC6trAT55ZBi1ueQVIjQTD-JqaE0lK.woff2",
    "lato": "https://fonts.gstatic.com/s/lato/v25/S6uyw4BMUTPHjx4wXg.woff2",
    "libre baskerville": "https://fonts.gstatic.com/s/librebaskerville/v24/kmKUZrc3Hgbbcjq75U4uslyuy4kn0olVQ-LglH6T17uj8Q4iDgNP.woff2",
    "lobster": "https://fonts.gstatic.com/s/lobster/v32/neILzCirqoswsqX9zoKmMw.woff2",
    "lora": "https://fonts.gstatic.com/s/lora/v37/0QI6MX1D_JOuGQbT0gvTJPa787weuxJBkq0.woff2",
    "manrope": "https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FN_C-bk.woff2",
    "maven pro": "https://fonts.gstatic.com/s/mavenpro/v40/7Auup_AqnyWWAxW2Wk3swUz56MS91Eww8SX21nejog.woff2",
    "merriweather": "https://fonts.gstatic.com/s/merriweather/v33/u-4D0qyriQwlOrhSvowK_l5UcA6zuSYEqOzpPe3HOZJ5eX1WtLaQwmYiScCmDxhtNOKl8yDr3icaFF31.woff2",
    "monoton": "https://fonts.gstatic.com/s/monoton/v22/5h1aiZUrOngCibe4TkHLQg.woff2",
    "montserrat": "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXo.woff2",
    "mukta": "https://fonts.gstatic.com/s/mukta/v17/iJWKBXyXfDDVXbnBrXw.woff2",
    "nanum gothic": "https://fonts.gstatic.com/s/nanumgothic/v26/PN_3Rfi-oW3hYwmKDpxS7F_D-dje.woff2",
    "noto sans": "https://fonts.gstatic.com/s/notosans/v42/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A-9a6VI.woff2",
    "nunito": "https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDLshdTQ3jw.woff2",
    "old standard tt": "https://fonts.gstatic.com/s/oldstandardtt/v22/MwQubh3o1vLImiwAVvYawgcf2eVeqlq4.woff2",
    "open sans": "https://fonts.gstatic.com/s/opensans/v44/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVI.woff2",
    "orbitron": "https://fonts.gstatic.com/s/orbitron/v35/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgz.woff2",
    "oswald": "https://fonts.gstatic.com/s/oswald/v57/TK3_WkUHHAIjg75cFRf3bXL8LICs1_FvsUZiZQ.woff2",
    "oxygen": "https://fonts.gstatic.com/s/oxygen/v16/2sDfZG1Wl4LcnbuKjk0m.woff2",
    "pacifico": "https://fonts.gstatic.com/s/pacifico/v23/FwZY7-Qmy14u9lezJ-6H6Mk.woff2",
    "passion one": "https://fonts.gstatic.com/s/passionone/v20/PbynFmL8HhTPqbjUzux3JEuR9ls.woff2",
    "patrick hand": "https://fonts.gstatic.com/s/patrickhand/v25/LDI1apSQOAYtSuYWp8ZhfYe8XsLL.woff2",
    "permanent marker": "https://fonts.gstatic.com/s/permanentmarker/v16/Fh4uPib9Iyv2ucM6pGQMWimMp004La2Cfw.woff2",
    "playfair display": "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff2",
    "poppins": "https://fonts.gstatic.com/s/poppins/v24/pxiEyp8kv8JHgFVrJJfecg.woff2",
    "press start 2p": "https://fonts.gstatic.com/s/pressstart2p/v16/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2",
    "prompt": "https://fonts.gstatic.com/s/prompt/v12/-W__XJnvUD7dzB2KYNod.woff2",
    "pt sans": "https://fonts.gstatic.com/s/ptsans/v18/jizaRExUiTo99u79D0KExQ.woff2",
    "pt serif": "https://fonts.gstatic.com/s/ptserif/v19/EJRVQgYoZZY2vCFuvAFWzr8.woff2",
    "quicksand": "https://fonts.gstatic.com/s/quicksand/v37/6xK-dSZaM9iE8KbpRA_LJ3z8mH9BOJvgkP8o58a-wg.woff2",
    "rajdhani": "https://fonts.gstatic.com/s/rajdhani/v17/LDIxapCSOBg7S-QT7p4HM-Y.woff2",
    "raleway": "https://fonts.gstatic.com/s/raleway/v37/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVvaorCIPrE.woff2",
    "righteous": "https://fonts.gstatic.com/s/righteous/v18/1cXxaUPXBpj2rGoU7C9WiHGF.woff2",
    "roboto": "https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmUiAo.woff2",
    "roboto condensed": "https://fonts.gstatic.com/s/robotocondensed/v31/ieVo2ZhZI2eCN5jzbjEETS9weq8-_d6T_POl0fRJeyWyosBO5Xw.woff2",
    "roboto mono": "https://fonts.gstatic.com/s/robotomono/v31/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_ROW4.woff2",
    "roboto slab": "https://fonts.gstatic.com/s/robotoslab/v36/BngbUXZYTXPIvIBgJJSb6s3BzlRRfKOFbvjojISmb2Rj.woff2",
    "rubik": "https://fonts.gstatic.com/s/rubik/v31/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFV0U1.woff2",
    "sacramento": "https://fonts.gstatic.com/s/sacramento/v17/buEzpo6gcdjy0EiZMBUG4C0f_Q.woff2",
    "satisfy": "https://fonts.gstatic.com/s/satisfy/v22/rP2Hp2yn6lkG50LoCZOIHQ.woff2",
    "shadows into light": "https://fonts.gstatic.com/s/shadowsintolight/v22/UqyNK9UOIntux_czAvDQx_ZcHqZXBNQzdcD5.woff2",
    "signika": "https://fonts.gstatic.com/s/signika/v29/vEF72_JTCgwQ5ejvMV0Ox_Kg1UwJ0tKfX4zNpD8E4ASzH1r9gTuoyjkm.woff2",
    "slabo 27px": "https://fonts.gstatic.com/s/slabo27px/v16/mFT0WbgBwKPR_Z4hGN2qgx8D1Q.woff2",
    "source code pro": "https://fonts.gstatic.com/s/sourcecodepro/v32/HI_diYsKILxRpg3hIP6sJ7fM7PqPMcMnZFqUwX28DMyQtMlrTA.woff2",
    "source sans pro": "https://fonts.gstatic.com/s/sourcesanspro/v24/6xK3dSBYKcSV-LCoeQqfX1RYOo3qOK7l.woff2",
    "space mono": "https://fonts.gstatic.com/s/spacemono/v17/i7dPIFZifjKcF5UAWdDRYEF8RQ.woff2",
    "teko": "https://fonts.gstatic.com/s/teko/v23/LYjYdG7kmE0gV69VVPPdFl06VN8XG4S11zM.woff2",
    "titillium web": "https://fonts.gstatic.com/s/titilliumweb/v19/NaPecZTIAOhVxoMyOr9n_E7fdMPmDQ.woff2",
    "ubuntu": "https://fonts.gstatic.com/s/ubuntu/v21/4iCs6KVjbNBYlgoKfw72.woff2",
    "varela round": "https://fonts.gstatic.com/s/varelaround/v21/w8gdH283Tvk__Lua32TysjIfp8uP.woff2",
    "vollkorn": "https://fonts.gstatic.com/s/vollkorn/v30/0ybgGDoxxrvAnPhYGzMlQLzuMasz6Df2MHGeHmmc.woff2",
    "work sans": "https://fonts.gstatic.com/s/worksans/v24/QGY_z_wNahGAdqQ43RhVcIgYT2Xz5u32K0nXBi8Jpg.woff2",
    "yanone kaffeesatz": "https://fonts.gstatic.com/s/yanonekaffeesatz/v34/3y9I6aknfjLm_3lMKjiMgmUUYBs04aUXNxt9gW2LIfto9tWZd2GK.woff2",
    "zilla slab": "https://fonts.gstatic.com/s/zillaslab/v12/dFa6ZfeM_74wlPZtksIFajo6_Q.woff2",
};

window._wordArtFontCache = window._wordArtFontCache || {};

/**
 * Downloads and converts Google Fonts into self-contained base64 @font-face data URIs.
 * This enables SVG <foreignObject> to render Google Fonts with 100% fidelity without being blocked
 * by Chromium's SVG cross-origin security sandbox.
 */
async function getEmbeddedFontCss(fontFamily, fontWeight = '') {
    if (!fontFamily) return '';
    const cleanName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
    if (!cleanName) return '';
    const sysFonts = [
        'impact', 'arial', 'helvetica', 'times new roman', 'times', 'courier new', 
        'courier', 'georgia', 'palatino', 'garamond', 'bookman', 'comic sans ms', 
        'trebuchet ms', 'arial black', 'segoe ui', 'tahoma', 'verdana', 'sans-serif', 
        'serif', 'monospace', 'cursive', 'fantasy'
    ];
    if (sysFonts.includes(cleanName.toLowerCase())) return '';

    const lowerName = cleanName.toLowerCase();
    const cacheKey = `${lowerName}_${fontWeight || 'default'}`;
    if (window._wordArtFontCache[cacheKey] !== undefined) {
        return window._wordArtFontCache[cacheKey];
    }
    if (window._wordArtFontCache[lowerName] !== undefined && (!fontWeight || fontWeight === 'normal' || fontWeight === '400')) {
        return window._wordArtFontCache[lowerName];
    }

    try {
        let fontFileUrl = WORDART_STATIC_FONT_URLS[lowerName] || null;

        if (!fontFileUrl) {
            let css = '';
            const weightNum = parseInt(fontWeight, 10);
            if (weightNum && weightNum >= 600) {
                try {
                    const wUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName.replace(/\s+/g, '+'))}:wght@${weightNum}&display=swap`;
                    const wResp = await fetch(wUrl);
                    if (wResp.ok) css = await wResp.text();
                } catch (e) {}
            }
            if (!css) {
                const gFontsUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName.replace(/\s+/g, '+'))}&display=swap`;
                const resp = await fetch(gFontsUrl);
                if (resp.ok) css = await resp.text();
            }
            if (css) {
                const m = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
                if (m) fontFileUrl = m[1];
            }
        }

        if (!fontFileUrl) {
            window._wordArtFontCache[cacheKey] = '';
            return '';
        }

        const fResp = await fetch(fontFileUrl);
        if (!fResp.ok) {
            window._wordArtFontCache[cacheKey] = '';
            return '';
        }
        const blob = await fResp.blob();
        const base64DataUri = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(blob);
        });

        if (!base64DataUri) {
            window._wordArtFontCache[cacheKey] = '';
            return '';
        }

        const embeddedCss = `
            @font-face {
                font-family: '${cleanName}';
                font-weight: 100 900;
                font-style: normal;
                src: url('${base64DataUri}') format('woff2');
            }
        `;
        window._wordArtFontCache[cacheKey] = embeddedCss;
        window._wordArtFontCache[lowerName] = embeddedCss;
        return embeddedCss;
    } catch(err) {
        console.warn('[WordArt Font Embed] Could not embed font:', cleanName, err);
        window._wordArtFontCache[cacheKey] = '';
        return '';
    }
}

async function renderSvgWordArt(waText, pubEl, waWrapper, styleId, specificRule, safeText, rawText, scaleMultiplier) {
    let dispW = parseFloat(pubEl && pubEl.style ? pubEl.style.width : 0);
    if (!dispW || isNaN(dispW) || dispW <= 0) {
        dispW = (pubEl ? pubEl.offsetWidth : 0) || (waWrapper ? waWrapper.offsetWidth : 0) || (waText ? waText.offsetWidth : 0) || 300;
    }
    let dispH = parseFloat(pubEl && pubEl.style ? pubEl.style.height : 0);
    if (!dispH || isNaN(dispH) || dispH <= 0) {
        dispH = (pubEl ? pubEl.offsetHeight : 0) || (waWrapper ? waWrapper.offsetHeight : 0) || (waText ? waText.offsetHeight : 0) || 100;
    }
    dispW = Math.max(30, Math.ceil(dispW));
    dispH = Math.max(20, Math.ceil(dispH));

    let fontFamily = 'Impact, sans-serif';
    let fontSize = '40px';
    let fontWeight = '900';
    let fontStyle = 'normal';
    let letterSpacing = 'normal';
    let textTransform = 'none';
    let transform = '';

    try {
        const comp = window.getComputedStyle(waText);
        if (comp) {
            if (comp.fontFamily && !comp.fontFamily.includes('Times New Roman')) fontFamily = comp.fontFamily;
            if (comp.fontSize) fontSize = comp.fontSize;
            if (comp.fontWeight) fontWeight = comp.fontWeight;
            if (comp.fontStyle) fontStyle = comp.fontStyle;
            if (comp.letterSpacing) letterSpacing = comp.letterSpacing;
            if (comp.textTransform) textTransform = comp.textTransform;
            if (comp.transform && comp.transform !== 'none') {
                transform = comp.transform;
            }
        }
    } catch (e) {}

    if (specificRule) {
        const ffm = specificRule.match(/font-family:\s*([^;]+)/i);
        if (ffm && (!waText.style || !waText.style.fontFamily)) {
            const rf = ffm[1].trim();
            if (rf) fontFamily = rf;
        }
        const fwm = specificRule.match(/font-weight:\s*([^;]+)/i);
        if (fwm && (!waText.style || !waText.style.fontWeight)) fontWeight = fwm[1].trim();
        const fsm = specificRule.match(/font-style:\s*([^;]+)/i);
        if (fsm && (!waText.style || !waText.style.fontStyle)) fontStyle = fsm[1].trim();
        const lsm = specificRule.match(/letter-spacing:\s*([^;]+)/i);
        if (lsm && (!waText.style || !waText.style.letterSpacing)) letterSpacing = lsm[1].trim();
        const ttm = specificRule.match(/text-transform:\s*([^;]+)/i);
        if (ttm && (!waText.style || !waText.style.textTransform)) textTransform = ttm[1].trim();
        const fzm = specificRule.match(/font-size:\s*([^;]+)/i);
        if (fzm && (!waText.style || !waText.style.fontSize)) fontSize = fzm[1].trim();
    }

    if (waText.style && waText.style.transform && waText.style.transform !== 'none') {
        transform = waText.style.transform;
    }

    const scaleInfo = parseTransformScale(transform);
    let scaleX = scaleInfo.sx;
    let scaleY = scaleInfo.sy;

    let naturalW = waText.scrollWidth || waText.offsetWidth || 0;
    let naturalH = waText.scrollHeight || waText.offsetHeight || 0;
    if (!naturalW || !naturalH) {
        const testCanvas = document.createElement('canvas');
        const testCtx = testCanvas.getContext('2d');
        testCtx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
        naturalW = Math.ceil(testCtx.measureText(rawText).width) || 180;
        naturalH = Math.ceil(parseFloat(fontSize)) || 40;
    }

    if (!scaleInfo.hasScale && naturalW > 0 && naturalH > 0) {
        const cw = dispW - 8;
        const ch = dispH - 8;
        if (cw > naturalW * 1.05 || ch > naturalH * 1.05) {
            scaleX = cw / naturalW;
            scaleY = ch / naturalH;
            transform = `scale(${scaleX}, ${scaleY})`;
        }
    } else if (scaleInfo.hasScale && (!transform || !transform.includes('scale'))) {
        transform = `scale(${scaleX}, ${scaleY})`;
    }

    const avgScale = (Math.abs(scaleX) + Math.abs(scaleY)) / 2;
    const visualW = naturalW * Math.abs(scaleX);
    const visualH = naturalH * Math.abs(scaleY);

    const extraLeft = Math.max(0, (visualW - dispW) / 2);
    const extraTop = Math.max(0, (visualH - dispH) / 2);

    const scale = Math.max(1.0, Math.min(6.0, parseFloat(scaleMultiplier) || 4.0));

    let textShadowRuleStr = '';
    if (specificRule) {
        const tsm = specificRule.match(/text-shadow:\s*([^;]+)/i);
        if (tsm) textShadowRuleStr = tsm[1].trim();
    }
    const textShadowMatches = parseTextShadows(textShadowRuleStr);
    const filterMatches = parseDropShadowFilters(specificRule);
    const allShadows = [...textShadowMatches, ...filterMatches];
    let svgMaxBlur = 0, svgMaxOffX = 0, svgMaxOffY = 0;
    allShadows.forEach(f => {
        svgMaxBlur = Math.max(svgMaxBlur, (f.blur || 0) * avgScale);
        svgMaxOffX = Math.max(svgMaxOffX, Math.abs(f.offsetX || 0) * Math.abs(scaleX));
        svgMaxOffY = Math.max(svgMaxOffY, Math.abs(f.offsetY || 0) * Math.abs(scaleY));
    });

    const padX = Math.ceil(extraLeft + Math.max(160, svgMaxBlur * 2.4 + svgMaxOffX + 60));
    const padY = Math.ceil(extraTop + Math.max(120, svgMaxBlur * 2.4 + svgMaxOffY + 60));
    const totalW = dispW + padX * 2;
    const totalH = dispH + padY * 2;

    const canvasW = Math.round(totalW * scale);
    const canvasH = Math.round(totalH * scale);

    let effectiveRule = specificRule;
    if (transform && transform !== 'none') {
        effectiveRule = effectiveRule.replace(/transform\s*:\s*[^;]+;?/gi, '');
    }

    if (waText.style && waText.style.fontFamily) {
        fontFamily = waText.style.fontFamily.replace(/['"]/g, '').split(',')[0].trim();
    }

    let inlineExtraStyles = '';
    if (transform && transform !== 'none') {
        inlineExtraStyles += `transform: ${transform} !important; transform-origin: center center; `;
    }
    if (waText.style) {
        if (waText.style.fontFamily) inlineExtraStyles += `font-family: ${waText.style.fontFamily.replace(/"/g, "'")} !important; `;
        if (waText.style.color) inlineExtraStyles += `color: ${waText.style.color} !important; `;
        if (waText.style.fontSize) inlineExtraStyles += `font-size: ${waText.style.fontSize} !important; `;
        if (waText.style.fontWeight) inlineExtraStyles += `font-weight: ${waText.style.fontWeight} !important; `;
        if (waText.style.fontStyle) inlineExtraStyles += `font-style: ${waText.style.fontStyle} !important; `;
        if (waText.style.letterSpacing) inlineExtraStyles += `letter-spacing: ${waText.style.letterSpacing} !important; `;
    }

    const embeddedFontCss = await getEmbeddedFontCss(fontFamily, fontWeight);

    const svgXml = `
<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="-${padX} -${padY} ${totalW} ${totalH}">
    <foreignObject x="-${padX}" y="-${padY}" width="${totalW}" height="${totalH}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${totalW}px; height:${totalH}px; margin:0; padding:0; display:flex; align-items:center; justify-content:center; overflow:visible; background:transparent;">
            <style>
                ${embeddedFontCss}
                * { box-sizing: border-box; }
                .wa-wrapper { width: ${dispW}px; height: ${dispH}px; display: flex; align-items: center; justify-content: center; overflow: visible; background: transparent; margin: 0; padding: 0; }
                .wa-text { white-space: nowrap; font-family: ${fontFamily}; font-size: ${fontSize}; font-weight: ${fontWeight}; font-style: ${fontStyle}; letter-spacing: ${letterSpacing}; text-transform: ${textTransform}; line-height: 1; text-align: center; overflow: visible; display: inline-block; margin: 0; padding: 0; outline: none; border: none; }
                ${effectiveRule}
            </style>
            <div class="wa-wrapper">
                <div class="wa-text wa-style-${styleId}" style="${inlineExtraStyles}">${safeText}</div>
            </div>
        </div>
    </foreignObject>
</svg>`.trim();

    const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgXml);
    const img = new Image();
    const loaded = await new Promise(resolve => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        setTimeout(() => resolve(false), 3000);
        img.src = dataUrl;
    });

    if (!loaded) {
        console.warn('[WordArt SVG Bake] Image load timed out for style', styleId);
        return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    let pngUrl = '';
    try {
        pngUrl = canvas.toDataURL('image/png');
    } catch (taintErr) {
        console.error('[WordArt SVG Bake] Canvas tainted error:', taintErr);
        return null;
    }

    return { pngUrl, padX, padY, totalW, totalH };
}

function attachBakedWordArtImage(pubEl, waWrapper, waText, styleId, rawText, pngUrl, padX, padY, totalW, totalH) {
    if (!pngUrl) return null;

    const bakedImg = document.createElement('img');
    bakedImg.className = 'wa-baked-img';
    bakedImg.src = pngUrl;
    bakedImg.alt = rawText;
    bakedImg.setAttribute('data-wa-style', styleId);
    bakedImg.setAttribute('data-wa-print-baked', 'true');
    bakedImg.style.cssText = `position: absolute !important; top: -${padY}px !important; left: -${padX}px !important; width: ${totalW}px !important; height: ${totalH}px !important; max-width: none !important; max-height: none !important; object-fit: fill !important; display: block !important; pointer-events: none !important; filter: none !important; border: none !important; outline: none !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;`;

    if (waWrapper) {
        waWrapper.innerHTML = '';
        waWrapper.style.position = 'relative';
        waWrapper.style.overflow = 'visible';
        waWrapper.style.contain = 'none';
        waWrapper.style.background = 'transparent';
        waWrapper.style.display = 'block';
        waWrapper.appendChild(bakedImg);
    } else if (waText.parentNode) {
        waText.parentNode.replaceChild(bakedImg, waText);
    }

    if (pubEl) {
        pubEl.setAttribute('data-wa-print-baked', 'true');
        pubEl.style.overflow = 'visible';
        pubEl.style.contain = 'none';
        const c = pubEl.querySelector ? pubEl.querySelector('.element-content') : null;
        if (c) {
            c.style.overflow = 'visible';
            c.style.contain = 'none';
        }
    }

    return bakedImg;
}

/**
 * Synchronous Legacy WordArt print baking for Canvas 2D Precision styles (v5.11.16).
 * Fast-path for immediate synchronous rasterization without waiting on microtasks.
 */
window.bakeLegacyWordArtForPrintSync = function(targetEl, scaleMultiplier = 4.0) {
    const info = resolveWordArtTargets(targetEl);
    if (!info) return null;
    if (info.isAlreadyBaked) return info.bakedImg;
    if (info.isGradientOrBoxStyle) return null; // Path 1 requires async SVG image load

    const res = renderCanvas2DWordArt(info.waText, info.pubEl, info.waWrapper, info.styleId, info.specificRule, info.rawText, scaleMultiplier);
    if (!res) return null;
    return attachBakedWordArtImage(info.pubEl, info.waWrapper, info.waText, info.styleId, info.rawText, res.pngUrl, res.padX, res.padY, res.totalW, res.totalH);
};

/**
 * High-resolution Legacy WordArt serialization engine for print and export (v5.11.16).
 * Implements a Dual-Engine Precision Architecture:
 * - Path 1 (SVG foreignObject Engine): Renders complex CSS gradients, repeating stripes,
 *   -webkit-background-clip: text fills, box backgrounds, and 3D perspective transforms at 4.0x scale.
 * - Path 2 (Canvas 2D Precision Engine): Renders authentic typography styles with Google Fonts,
 *   multi-tier ambient neon glows, 3D text extrusion shadows, and outline strokes with zero font fallback.
 */
window.bakeLegacyWordArtForPrint = async function(targetEl, scaleMultiplier = 4.0) {
    const info = resolveWordArtTargets(targetEl);
    if (!info) return null;
    if (info.isAlreadyBaked) return info.bakedImg;

    // ✨ PATH 1 (PRIMARY): SVG FOREIGNOBJECT ENGINE (With Base64 Embedded Web Fonts) ✨
    // High-fidelity vector layout: preserves 3D extrusions, chromatic planes, ambient glows, gradients, boxes, and Google Fonts
    try {
        const res = await renderSvgWordArt(info.waText, info.pubEl, info.waWrapper, info.styleId, info.specificRule, info.safeText, info.rawText, scaleMultiplier);
        if (res && res.pngUrl) {
            return attachBakedWordArtImage(info.pubEl, info.waWrapper, info.waText, info.styleId, info.rawText, res.pngUrl, res.padX, res.padY, res.totalW, res.totalH);
        }
    } catch (svgErr) {
        console.warn('[WordArt Bake] SVG foreignObject render error, falling back to Canvas 2D:', svgErr);
    }

    // ✨ PATH 2 (FALLBACK): CANVAS 2D PRECISION ENGINE ✨
    try {
        const comp = window.getComputedStyle(info.waText);
        let fontStyle = (comp && comp.fontStyle) || 'normal';
        let fontWeight = (comp && comp.fontWeight) || '900';
        let fontSize = (comp && comp.fontSize) || '40px';
        let fontFamily = (comp && comp.fontFamily && !comp.fontFamily.includes('Times New Roman')) ? comp.fontFamily : 'Impact, sans-serif';
        if (info.specificRule) {
            const ffm = info.specificRule.match(/font-family:\s*([^;]+)/i);
            if (ffm) fontFamily = ffm[1].trim();
            const fwm = info.specificRule.match(/font-weight:\s*([^;]+)/i);
            if (fwm) fontWeight = fwm[1].trim();
            else if (fontFamily.toLowerCase().includes('lobster')) fontWeight = 'normal';
            const fsm = info.specificRule.match(/font-style:\s*([^;]+)/i);
            if (fsm) fontStyle = fsm[1].trim();
            const fzm = info.specificRule.match(/font-size:\s*([^;]+)/i);
            if (fzm) fontSize = fzm[1].trim();
        }
        if (document.fonts && document.fonts.load) {
            await document.fonts.load(`${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`);
            await document.fonts.ready;
        }
    } catch (e) {}

    const res = renderCanvas2DWordArt(info.waText, info.pubEl, info.waWrapper, info.styleId, info.specificRule, info.rawText, scaleMultiplier);
    if (!res) return null;
    return attachBakedWordArtImage(info.pubEl, info.waWrapper, info.waText, info.styleId, info.rawText, res.pngUrl, res.padX, res.padY, res.totalW, res.totalH);
};

window.handleWordArtClick = function(i) {
    if (state.selectedEl && state.selectedEl.querySelector('.wa-text')) {
        const waText = state.selectedEl.querySelector('.wa-text');
        const classes = Array.from(waText.classList);
        classes.forEach(c => { if(c.startsWith('wa-style-')) waText.classList.remove(c); });
        waText.classList.add(`wa-style-${i}`);
        waText.setAttribute('spellcheck', 'false'); 
        if (typeof DialogSystem !== 'undefined') DialogSystem.close(); 
        const oldModal = document.getElementById('wordart-modal');
        if (oldModal) oldModal.style.display = 'none';
        if(typeof syncWordArt === 'function') syncWordArt(state.selectedEl);
        if(typeof pushHistory === 'function') pushHistory();
    } else {
        try {
            const el = createWrapper(`<div class="wa-wrapper"><div class="wa-text wa-style-${i}" spellcheck="false">Word Art</div></div>`);
            setTimeout(() => { if(typeof syncWordArt === 'function') syncWordArt(el); }, 10);
        } catch(e) { console.error(e); }
        if (typeof DialogSystem !== 'undefined') DialogSystem.close(); 
        const oldModal = document.getElementById('wordart-modal');
        if (oldModal) oldModal.style.display = 'none';
    }
};

window.initWordArt = function() {
    const grid = document.getElementById('wordart-grid'); if (!grid) return; 
    if (grid.children.length > 0) return;
    
    let html = '';
    for(let i=1; i<=214; i++) {
        if (brokenWordArts.includes(i)) continue;
        let demoText = 'Aa';
        if ((i >= 81 && i <= 90) || (i >= 141 && i <= 150) || (i >= 191 && i <= 200)) demoText = 'AaBb'; 
        else if (i === 112 || i === 113 || i === 145) demoText = 'TXT';
        
        html += `<div class="gallery-item" style="height:40px;" onclick="handleWordArtClick(${i})">
                    <div class="wa-text wa-style-${i}" style="font-size:24px; font-family: Impact, sans-serif;">${demoText}</div>
                 </div>`;
    }
    grid.innerHTML = html;
};
    // 3. WORDART MODAL OVERRIDE (v5.11.16 Modern Redesign: Big Rounded Corners, Single-Click Select, Double-Click Insert)
    window.showWordArtModal = function(explicitTarget = null) {
        if (typeof rescueGrids === 'function') rescueGrids(); 
        
        // Only edit existing element if explicitTarget was passed AND is a valid WordArt element
        const editTarget = (explicitTarget && explicitTarget.querySelector && explicitTarget.querySelector('.wa-text')) ? explicitTarget : null;
        let initialText = '';
        let initialStyleId = 1;
        if (editTarget) {
            const waText = editTarget.querySelector('.wa-text');
            if (waText) {
                initialText = waText.innerText.trim() || '';
                const match = Array.from(waText.classList).find(c => c.startsWith('wa-style-'));
                if (match) initialStyleId = parseInt(match.replace('wa-style-', ''), 10) || 1;
            }
        }

        const uiHTML = `
            <style>
                /* Overwrite default dialog styles to achieve the edge-to-edge banner */
                #custom-dialog-header { display: none !important; }
                .custom-dialog-footer { display: none !important; }
                .custom-dialog-body { padding: 0 !important; background: #f3f4f6 !important; border-radius: 8px; overflow: hidden; }
                
                /* Modal Spring Entrance Animation */
                @keyframes waModalFadeIn {
                    from { opacity: 0; transform: scale(0.95) translateY(12px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                #custom-dialog-box:has(#dialog-wordart-container) {
                    animation: waModalFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
                }

                /* The Green Header Banner */
                .wa-modal-header {
                    background: var(--ui-theme-dark);
                    padding: 15px 25px;
                    text-align: center;
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                    cursor: grab;
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
                    pointer-events: none;
                }
                
                /* The Giant White Input Box */
                .wa-modal-input {
                    width: 100%;
                    padding: 12px 15px;
                    font-size: 24px;
                    font-family: 'Arial Black', Impact, sans-serif;
                    text-align: center;
                    color: #111;
                    border: none;
                    border-radius: 6px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    outline: none;
                    transition: box-shadow 0.2s;
                    box-sizing: border-box;
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
                #dialog-wordart-grid {
                    display: grid !important;
                    grid-template-columns: repeat(5, 1fr) !important;
                    gap: 10px !important;
                }
                
                /* The Selectable Cards (Modern Beta WordArt Style with 12px Rounded Corners & Animations) */
                .legacy-wa-card {
                    background: white;
                    border: 3px solid transparent;
                    border-radius: 12px;
                    height: 74px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px 12px;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
                    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
                    box-sizing: border-box;
                    overflow: hidden;
                    position: relative;
                    user-select: none;
                }
                .legacy-wa-card:hover {
                    box-shadow: 0 8px 18px rgba(0,0,0,0.1);
                    transform: translateY(-3px) scale(1.02);
                    border-color: rgba(0, 118, 112, 0.35);
                    z-index: 2;
                }
                .legacy-wa-card.selected {
                    border-color: var(--ui-theme-color);
                    background: #f0fdf4; 
                    box-shadow: 0 8px 22px rgba(0, 118, 112, 0.25);
                    transform: translateY(-2px) scale(1.08);
                    z-index: 10;
                }
                @keyframes waCardSelectPop {
                    0% { transform: scale(0.96); }
                    50% { transform: scale(1.11); }
                    100% { transform: translateY(-2px) scale(1.08); }
                }
                .legacy-wa-card.anim-pop {
                    animation: waCardSelectPop 0.26s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .legacy-wa-card .wa-text {
                    pointer-events: none;
                    max-width: 100%;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    transition: font-size 0.15s ease;
                    display: inline-block;
                }

                /* Animated Checkmark Badge on Selected Card */
                .legacy-wa-badge {
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    width: 18px;
                    height: 18px;
                    background: var(--ui-theme-color);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    opacity: 0;
                    transform: scale(0.3) rotate(-45deg);
                    transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
                    pointer-events: none;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.25);
                    z-index: 5;
                }
                .legacy-wa-card.selected .legacy-wa-badge {
                    opacity: 1;
                    transform: scale(1) rotate(0deg);
                }

                /* Discreet Style ID Number in Bottom Left */
                .legacy-wa-id {
                    position: absolute;
                    bottom: 4px;
                    left: 7px;
                    font-size: 10px;
                    font-weight: 700;
                    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
                    color: #94a3b8;
                    opacity: 0;
                    transition: opacity 0.15s ease;
                    pointer-events: none;
                    user-select: none;
                    z-index: 5;
                }
                .legacy-wa-card:hover .legacy-wa-id,
                .legacy-wa-card.selected .legacy-wa-id {
                    opacity: 0.85;
                }

                /* Custom Footer with Info Tip and Action Buttons */
                .wa-modal-footer {
                    padding: 12px 20px;
                    background: #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom-left-radius: 8px;
                    border-bottom-right-radius: 8px;
                    border-top: 1px solid #e2e8f0;
                }
                .wa-modal-tip {
                    font-size: 12px;
                    color: #64748b;
                    font-family: 'Segoe UI', sans-serif;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    user-select: none;
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

                /* Dark Mode Overrides */
                body.dark-mode .custom-dialog-body { background: #1e293b !important; }
                body.dark-mode .wa-modal-grid-container { background: #0f172a !important; }
                body.dark-mode .wa-modal-footer { background: #0f172a !important; border-top-color: #334155 !important; }
                body.dark-mode .legacy-wa-card { background: #1e293b !important; box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important; }
                body.dark-mode .legacy-wa-card.selected { border-color: var(--ui-theme-color) !important; background: #064e3b !important; }
                body.dark-mode .legacy-wa-badge { background: var(--ui-theme-color) !important; color: white !important; }
                body.dark-mode .legacy-wa-id { color: #64748b !important; }
                body.dark-mode .wa-modal-tip { color: #94a3b8 !important; }
                body.dark-mode .wa-btn-cancel { background: #1e293b !important; color: #e2e8f0 !important; border-color: #475569 !important; }
                body.dark-mode .wa-btn-cancel:hover { background: #334155 !important; }
                body.dark-mode .wa-modal-input { background: #1e293b !important; color: #f8fafc !important; }
            </style>
            
            <div class="wa-modal-header" id="legacy-wa-modal-header">
                <div class="custom-dialog-close" id="legacy-wa-close-x" title="Close" style="position: absolute; top: 8px; right: 8px; z-index: 10;"><i class="fas fa-times"></i></div>
                <div class="wa-modal-title">WordArt Gallery (Legacy)</div>
                <input type="text" id="legacy-wa-text" class="wa-modal-input" placeholder="Enter Your Text Here..." value="${initialText ? initialText.replace(/"/g, '&quot;') : ''}">
            </div>
            
            <div class="wa-modal-grid-container" id="dialog-wordart-container"></div>
            
            <div class="wa-modal-footer">
                <div class="wa-modal-tip"><i class="fas fa-mouse-pointer" style="margin-right:7px; color:var(--ui-theme-color);"></i> Click to select &bull; Double-click to insert</div>
                <div style="display:flex; gap:10px;">
                    <button class="wa-btn wa-btn-ok" id="legacy-wa-btn-ok">OK</button>
                    <button class="wa-btn wa-btn-cancel" id="legacy-wa-btn-cancel">Cancel</button>
                </div>
            </div>
        `;

        let grid = document.getElementById('dialog-wordart-grid');
        
        const resetGridToDefault = () => {
            if (!grid) return;
            grid.querySelectorAll('.legacy-wa-card').forEach(card => {
                const i = parseInt(card.dataset.styleId, 10);
                const waText = card.querySelector('.wa-text');
                if (!waText) return;
                let demoText = 'Aa';
                if ((i >= 81 && i <= 90) || (i >= 141 && i <= 150) || (i >= 191 && i <= 200)) demoText = 'AaBb'; 
                else if (i === 112 || i === 113 || i === 145) demoText = 'TXT';
                waText.textContent = demoText;
                waText.style.fontSize = (demoText.length > 3) ? '30px' : '36px';
            });
        };

        // If grid doesn't exist at all, build it!
        if (!grid) {
            grid = document.createElement('div');
            grid.id = 'dialog-wordart-grid';
            grid.className = 'gallery-grid';
            grid.dataset.selectedId = String(initialStyleId);
            
            for(let i=1; i<=214; i++) {
                if (brokenWordArts.includes(i)) continue;
                let demoText = 'Aa';
                if ((i >= 81 && i <= 90) || (i >= 141 && i <= 150) || (i >= 191 && i <= 200)) demoText = 'AaBb'; 
                else if (i === 112 || i === 113 || i === 145) demoText = 'TXT';
                
                const card = document.createElement('div');
                card.className = 'legacy-wa-card' + (i === initialStyleId ? ' selected' : '');
                card.dataset.styleId = i;
                card.title = `WordArt Style ${i} (Click to select, double-click to insert)`;

                const textFontSize = (demoText.length > 3) ? '30px' : '36px';
                card.innerHTML = `
                    <span class="legacy-wa-id">#${i}</span>
                    <div class="legacy-wa-badge"><i class="fas fa-check"></i></div>
                    <div class="wa-text wa-style-${i}" style="font-size:${textFontSize}; font-family: Impact, sans-serif;">${demoText}</div>
                `;

                card.onclick = () => {
                    grid.querySelectorAll('.legacy-wa-card').forEach(c => {
                        c.classList.remove('selected');
                        c.classList.remove('anim-pop');
                    });
                    card.classList.add('selected');
                    card.classList.add('anim-pop');
                    grid.dataset.selectedId = i;
                };

                card.ondblclick = () => {
                    grid.dataset.selectedId = i;
                    card.style.transform = 'scale(0.94)';
                    card.style.boxShadow = '0 0 0 4px var(--ui-theme-color)';
                    setTimeout(() => {
                        const okBtn = document.getElementById('legacy-wa-btn-ok');
                        if (okBtn) okBtn.click();
                    }, 80);
                };

                grid.appendChild(card);
            }
            
            // Place it in safe zone initially so it exists in DOM
            const safeZone = document.getElementById('modal-safe-zone');
            if (safeZone) safeZone.appendChild(grid);
        } else {
            // If grid was cached, reset cards to default whenever not editing an existing element
            if (!editTarget) {
                resetGridToDefault();
            }
            grid.dataset.selectedId = String(initialStyleId);
            grid.querySelectorAll('.legacy-wa-card').forEach(c => {
                const isSelected = (parseInt(c.dataset.styleId, 10) === initialStyleId);
                c.classList.toggle('selected', isSelected);
                c.classList.remove('anim-pop');
                if (!c.querySelector('.legacy-wa-badge')) {
                    const badge = document.createElement('div');
                    badge.className = 'legacy-wa-badge';
                    badge.innerHTML = '<i class="fas fa-check"></i>';
                    c.appendChild(badge);
                }
                if (!c.querySelector('.legacy-wa-id')) {
                    const idSpan = document.createElement('span');
                    idSpan.className = 'legacy-wa-id';
                    idSpan.textContent = `#${c.dataset.styleId}`;
                    c.appendChild(idSpan);
                }
            });
        }

        DialogSystem.show('', uiHTML, null, true);
        
        const dialogBox = document.getElementById('custom-dialog-box');
        if(dialogBox) {
            dialogBox.style.width = '850px';
            dialogBox.style.maxWidth = '95vw';
            dialogBox.style.padding = '0';
            dialogBox.style.backgroundColor = 'transparent';
            dialogBox.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';

            const header = document.getElementById('legacy-wa-modal-header');
            if (header) {
                let isDragging = false;
                let offsetX = 0;
                let offsetY = 0;

                header.addEventListener('mousedown', function(e) {
                    if (e.target.tagName.toLowerCase() === 'input' || e.target.id === 'legacy-wa-close-x' || e.target.closest('#legacy-wa-close-x')) return;
                    isDragging = true;
                    const rect = dialogBox.getBoundingClientRect();
                    offsetX = e.clientX - rect.left;
                    offsetY = e.clientY - rect.top;

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
        
        // Retrieve grid from safe zone and append to the newly rendered modal container
        const container = document.getElementById('dialog-wordart-container');
        if (container && grid) {
            container.appendChild(grid);
            grid.style.display = 'grid'; // ensure it's visible
        }

        const executeInsertion = () => {
            const selectedStyleId = grid.dataset.selectedId ? parseInt(grid.dataset.selectedId, 10) : 1;
            const textInput = document.getElementById('legacy-wa-text');
            const customText = textInput ? textInput.value.trim() : '';
            const finalText = customText || 'Word Art';

            if (editTarget && editTarget.querySelector('.wa-text')) {
                const waText = editTarget.querySelector('.wa-text');
                const classes = Array.from(waText.classList);
                classes.forEach(c => { if (c.startsWith('wa-style-')) waText.classList.remove(c); });
                waText.classList.add(`wa-style-${selectedStyleId}`);
                waText.setAttribute('spellcheck', 'false');
                if (customText) {
                    waText.innerText = customText;
                }
                DialogSystem.close();
                const oldModal = document.getElementById('wordart-modal');
                if (oldModal) oldModal.style.display = 'none';
                if (typeof syncWordArt === 'function') syncWordArt(editTarget);
                if (typeof pushHistory === 'function') pushHistory();
            } else {
                try {
                    const safeText = finalText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    const el = createWrapper(`<div class="wa-wrapper"><div class="wa-text wa-style-${selectedStyleId}" spellcheck="false">${safeText}</div></div>`);
                    setTimeout(() => { if (typeof syncWordArt === 'function') syncWordArt(el); }, 10);
                    if (typeof pushHistory === 'function') pushHistory();
                } catch(e) { console.error(e); }
                DialogSystem.close();
                const oldModal = document.getElementById('wordart-modal');
                if (oldModal) oldModal.style.display = 'none';
            }
        };

        const updateCardPreviews = () => {
            const textInput = document.getElementById('legacy-wa-text');
            const rawVal = textInput ? textInput.value : '';
            const trimmed = rawVal.trim();
            const useDefault = !trimmed;

            if (useDefault) {
                resetGridToDefault();
                return;
            }

            grid.querySelectorAll('.legacy-wa-card').forEach(card => {
                const waText = card.querySelector('.wa-text');
                if (!waText) return;

                let fontSize;
                if (trimmed.length <= 2) fontSize = '36px';
                else if (trimmed.length <= 4) fontSize = '32px';
                else if (trimmed.length <= 6) fontSize = '28px';
                else if (trimmed.length <= 9) fontSize = '23px';
                else if (trimmed.length <= 13) fontSize = '19px';
                else fontSize = '16px';

                waText.textContent = trimmed;
                waText.style.fontSize = fontSize;
            });
        };

        const okBtn = document.getElementById('legacy-wa-btn-ok');
        if (okBtn) okBtn.onclick = executeInsertion;

        const cancelBtn = document.getElementById('legacy-wa-btn-cancel');
        if (cancelBtn) cancelBtn.onclick = () => DialogSystem.close();

        const closeX = document.getElementById('legacy-wa-close-x');
        if (closeX) closeX.onclick = () => DialogSystem.close();

        const textInput = document.getElementById('legacy-wa-text');
        if (textInput) {
            textInput.addEventListener('input', updateCardPreviews);
            if (editTarget && initialText) {
                updateCardPreviews();
            } else {
                resetGridToDefault();
            }
            textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    executeInsertion();
                }
            });
            setTimeout(() => { textInput.focus(); textInput.select(); }, 120);
        }

        setTimeout(() => {
            const selectedBtn = grid.querySelector(`.legacy-wa-card[data-style-id="${initialStyleId}"]`);
            if (selectedBtn) {
                selectedBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 60);
    };

    if (window.ContextRibbonActions) {
        window.ContextRibbonActions.openWordArtModal = function() {
            window.showWordArtModal(state.selectedEl);
        };
    }


// --- MIGRATED WA TOOLBAR DRAG ---
let waToolbarDrag = { active: false, startX: 0, startY: 0, initLeft: 0, initTop: 0 };
function startDragWaToolbar(e) {
    e.preventDefault();
    e.stopPropagation();
    const tb = document.getElementById('wa-float-toolbar');
    waToolbarDrag.active = true;
    waToolbarDrag.startX = e.clientX;
    waToolbarDrag.startY = e.clientY;
    waToolbarDrag.initLeft = parseInt(tb.style.left || 0, 10);
    waToolbarDrag.initTop = parseInt(tb.style.top || 0, 10);
    
    document.addEventListener('mousemove', doDragWaToolbar);
    document.addEventListener('mouseup', stopDragWaToolbar);
}
function doDragWaToolbar(e) {
    if(!waToolbarDrag.active) return;
    const dx = e.clientX - waToolbarDrag.startX;
    const dy = e.clientY - waToolbarDrag.startY;
    const tb = document.getElementById('wa-float-toolbar');
    tb.style.left = (waToolbarDrag.initLeft + dx) + 'px';
    tb.style.top = (waToolbarDrag.initTop + dy) + 'px';
}
function stopDragWaToolbar() {
    waToolbarDrag.active = false;
    document.removeEventListener('mousemove', doDragWaToolbar);
    document.removeEventListener('mouseup', stopDragWaToolbar);
}
