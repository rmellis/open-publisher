// --- 4. WORDART SWAP & SPELLCHECK FIX (v5.11.11) ---
const brokenWordArts = [];

// Cache of WordArt CSS rules parsed from stylesheets
const LEGACY_WORDART_CSS_MAP = {
  "1": ".wa-style-1 { color: transparent; -webkit-text-stroke: 2px #333; }",
  "2": ".wa-style-2 { background: linear-gradient(to bottom, #f00, #ff0); -webkit-background-clip: text; color: transparent; -webkit-text-stroke: 1px #000; transform: skewX(-10deg);; -webkit-text-fill-color: transparent; }",
  "3": ".wa-style-3 { color: #fff; text-shadow: 2px 2px 0 #000, 4px 4px 0 #555; }",
  "4": ".wa-style-4 { background: linear-gradient(45deg, #00f, #0ff); -webkit-background-clip: text; color: transparent; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));; -webkit-text-fill-color: transparent; }",
  "5": ".wa-style-5 { color: navy; text-shadow: 0 0 5px white, 0 0 10px cyan; letter-spacing: 2px; }",
  "6": ".wa-style-6 { transform: perspective(200px) rotateX(20deg); color: #800000; text-shadow: 0 10px 5px rgba(0,0,0,0.3); }",
  "7": ".wa-style-7 { background: radial-gradient(circle, #ffd700, #b8860b); -webkit-background-clip: text; color: transparent; font-weight: 900;; -webkit-text-fill-color: transparent; }",
  "8": ".wa-style-8 { font-family: 'Lobster', cursive; color: #ff00de; text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00de, 0 0 30px #ff00de; }",
  "9": ".wa-style-9 { font-family: 'Pacifico', cursive; color: #fff; text-shadow: 3px 3px 0px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; }",
  "10": ".wa-style-10 { font-family: 'Oswald', sans-serif; background: repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px); -webkit-background-clip: text; color: transparent; -webkit-text-stroke: 1px #333;; -webkit-text-fill-color: transparent; }",
  "11": ".wa-style-11 { transform: rotate(-5deg); color: #ffd700; text-shadow: 1px 1px 0 #cda434, 2px 2px 0 #cda434, 3px 3px 0 #cda434, 4px 4px 0 #cda434; }",
  "12": ".wa-style-12 { font-family: 'Anton', sans-serif; letter-spacing: 5px; color: #fff; background: #000; padding: 0 10px; }",
  "13": ".wa-style-13 { background: linear-gradient(to right, #30CFD0 0%, #330867 100%); -webkit-background-clip: text; color: transparent; font-style: italic;; -webkit-text-fill-color: transparent; }",
  "14": ".wa-style-14 { color: #fff; -webkit-text-stroke: 2px red; text-shadow: 4px 4px 0px rgba(0,0,0,0.2); }",
  "15": ".wa-style-15 { font-family: 'Press Start 2P', cursive; color: lime; text-shadow: 2px 2px 0px #000; background: #222; padding: 5px; font-size: 20px; }",
  "16": ".wa-style-16 { font-family: 'Cinzel', serif; color: #d4af37; text-shadow: 0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15); }",
  "17": ".wa-style-17 { font-family: 'Righteous', cursive; color: transparent; -webkit-text-stroke: 2px #fff; filter: drop-shadow(0 0 2px #ff00de) drop-shadow(0 0 5px #00eaff); }",
  "18": ".wa-style-18 { font-family: 'Abril Fatface', cursive; background: linear-gradient(45deg, #ff007f, #7928ca, #4338ca, #00d4ff, #ff007f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.3)); }",
  "19": ".wa-style-19 { font-family: 'Shadows Into Light', cursive; color: #333; transform: rotate(-2deg); font-weight: bold; background: #ffeb3b; padding: 0 10px; box-shadow: 4px 4px 0 rgba(0,0,0,0.2); }",
  "20": ".wa-style-20 { font-family: 'Acme', sans-serif; color: #fff; text-shadow: 0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 15px #ff0000, 0 0 20px #ff0000; }",
  "21": ".wa-style-21 { font-family: 'Bangers', cursive; color: #FF5722; letter-spacing: 2px; transform: scaleY(1.5); }",
  "22": ".wa-style-22 { font-family: 'Indie Flower', cursive; color: #673AB7; border-bottom: 3px dashed #673AB7; }",
  "23": ".wa-style-23 { font-family: 'Orbitron', sans-serif; color: #00ff00; text-shadow: 0 0 10px #00ff00; background: #000; padding: 2px; }",
  "24": ".wa-style-24 { font-family: 'Lobster', cursive; color: #2196F3; -webkit-text-stroke: 1px white; filter: drop-shadow(2px 2px 0px #0D47A1); }",
  "25": ".wa-style-25 { font-family: 'Impact', sans-serif; background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red); -webkit-background-clip: text; color: transparent;; -webkit-text-fill-color: transparent; }",
  "26": ".wa-style-26 { font-family: 'Comic Neue', cursive; color: #FF9800; font-weight: 900; transform: skewY(-5deg); }",
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
  "37": ".wa-style-37 { transform: rotate(-10deg) skewX(20deg); color: #e91e63; }",
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
  "53": ".wa-style-53 { transform: scale(1, 2); color: #3f51b5; }",
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

/**
 * High-resolution Legacy WordArt serialization engine for print and export (v5.11.11).
 * Rasterizes complex CSS properties (-webkit-background-clip: text, multi-shadow, 3D transforms,
 * text-stroke, gradients) into high-DPI non-tainting PNG images.
 */
window.bakeLegacyWordArtForPrint = async function(targetEl, scaleMultiplier = 4.0) {
    if (!targetEl) return null;
    if (targetEl.tagName && targetEl.tagName.toLowerCase() === 'img' && targetEl.classList.contains('wa-baked-img')) {
        return targetEl;
    }
    if (targetEl.querySelector) {
        const existingImg = targetEl.querySelector('img.wa-baked-img');
        if (existingImg) return existingImg;
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

    // Determine whether this style requires rasterization.
    // Styles with -webkit-background-clip: text or CSS gradients (linear, conic, radial) CANNOT be clipped to text by html2canvas,
    // so they must be baked into high-DPI raster images.
    // Pure CSS text styles (like Lobster Glow 8, Pacifico 9, Bangers, etc. using real Google/system fonts, text-shadow, glows, strokes)
    // are natively rendered with full typographic fidelity by html2canvas and browser print when kept as live DOM.
    const needsBake = specificRule.includes('background-clip') || 
                      specificRule.includes('gradient') || 
                      (waText.style && (waText.style.backgroundClip || waText.style.webkitBackgroundClip));

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

    if (!needsBake) {
        // Retain live DOM with loaded document web fonts and smooth multi-layer glow bleed
        if (pubEl) pubEl.setAttribute('data-wa-print-baked', 'true');
        return null;
    }

    const rawText = (waText.innerText || waText.textContent || '').replace(/\u205F/g, ' ').trim();
    if (!rawText) return null;

    const safeText = rawText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

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
            fontFamily = comp.fontFamily || fontFamily;
            fontSize = comp.fontSize || fontSize;
            fontWeight = comp.fontWeight || fontWeight;
            fontStyle = comp.fontStyle || fontStyle;
            letterSpacing = comp.letterSpacing || letterSpacing;
            textTransform = comp.textTransform || textTransform;
            if (comp.transform && comp.transform !== 'none') {
                transform = comp.transform;
            }
        }
    } catch (e) {}

    if (waText.style && waText.style.transform && waText.style.transform !== 'none') {
        transform = waText.style.transform;
    }

    // Calculate true visual width and height including scaling & overflows
    let scaleX = 1;
    let scaleY = 1;
    if (transform) {
        const sm = transform.match(/scale\(\s*([0-9.]+)\s*(?:,\s*([0-9.]+))?\s*\)/);
        if (sm) {
            scaleX = parseFloat(sm[1]) || 1;
            scaleY = parseFloat(sm[2] || sm[1]) || 1;
        }
    }

    const naturalW = waText.scrollWidth || waText.offsetWidth || 0;
    const naturalH = waText.scrollHeight || waText.offsetHeight || 0;
    const visualW = Math.max(dispW, naturalW * scaleX, naturalW);
    const visualH = Math.max(dispH, naturalH * scaleY, naturalH);

    const extraLeft = Math.max(0, (visualW - dispW) / 2);
    const extraTop = Math.max(0, (visualH - dispH) / 2);

    // Generous glow, shadow and stroke bleed buffer (100px horizontal, 60px vertical)
    const padX = Math.ceil(extraLeft + 100);
    const padY = Math.ceil(extraTop + 60);

    const totalW = dispW + padX * 2;
    const totalH = dispH + padY * 2;

    const scale = Math.max(1.0, Math.min(6.0, parseFloat(scaleMultiplier) || 4.0));
    const canvasW = Math.round(totalW * scale);
    const canvasH = Math.round(totalH * scale);

    const svgXml = `
<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="-${padX} -${padY} ${totalW} ${totalH}">
    <foreignObject x="-${padX}" y="-${padY}" width="${totalW}" height="${totalH}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${totalW}px; height:${totalH}px; margin:0; padding:0; display:flex; align-items:center; justify-content:center; overflow:visible; background:transparent;">
            <style>
                * { box-sizing: border-box; }
                .wa-wrapper { width: ${dispW}px; height: ${dispH}px; display: flex; align-items: center; justify-content: center; overflow: visible; background: transparent; margin: 0; padding: 0; }
                .wa-text { white-space: nowrap; font-family: ${fontFamily}; font-size: ${fontSize}; font-weight: ${fontWeight}; font-style: ${fontStyle}; letter-spacing: ${letterSpacing}; text-transform: ${textTransform}; line-height: 1; text-align: center; overflow: visible; display: inline-block; margin: 0; padding: 0; outline: none; border: none; ${transform ? `transform: ${transform}; transform-origin: center center;` : ''} }
                ${specificRule}
            </style>
            <div class="wa-wrapper">
                <div class="wa-text wa-style-${styleId}">${safeText}</div>
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
        console.warn('[WordArt Bake] Image load timed out for style', styleId);
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
        console.error('[WordArt Bake] Canvas tainted error:', taintErr);
        return null;
    }

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
    // 3. WORDART MODAL OVERRIDE
    window.showWordArtModal = function() {
        if(window.rescueGrids) window.rescueGrids(); 
        let grid = document.getElementById('dialog-wordart-grid');
        
        // If grid doesn't exist at all, build it!
        if (!grid) {
            grid = document.createElement('div');
            grid.id = 'dialog-wordart-grid';
            grid.className = 'gallery-grid';
            grid.style.cssText = 'grid-template-columns: repeat(5, 1fr); gap: 10px; padding: 10px; background: #fafafa;';
            
            let gridHtml = '';
            for(let i=1; i<=214; i++) {
                if (brokenWordArts.includes(i)) continue;
                let demoText = 'Aa';
                if ((i >= 81 && i <= 90) || (i >= 141 && i <= 150) || (i >= 191 && i <= 200)) demoText = 'AaBb'; 
                else if (i === 112 || i === 113 || i === 145) demoText = 'TXT';
                
                gridHtml += `<div class="gallery-item" style="height:40px;" onclick="handleWordArtClick(${i})">
                            <div class="wa-text wa-style-${i}" style="font-size:24px; font-family: Impact, sans-serif;">${demoText}</div>
                         </div>`;
            }
            grid.innerHTML = gridHtml;
            // Place it in safe zone initially so it exists in DOM
            const safeZone = document.getElementById('modal-safe-zone');
            if (safeZone) safeZone.appendChild(grid);
        }

        const htmlStr = `<div id="dialog-wordart-container"></div>`;
        DialogSystem.show('WordArt Gallery', htmlStr, null, true);
        
        const dialogBox = document.getElementById('custom-dialog-box');
        if(dialogBox) {
            dialogBox.style.width = '650px';
            dialogBox.style.maxWidth = '95vw';
            const body = dialogBox.querySelector('.custom-dialog-body');
            if (body) { body.style.maxHeight = '65vh'; body.style.overflowY = 'auto'; }
        }
        
        // Retrieve grid from safe zone and append to the newly rendered modal container
        const container = document.getElementById('dialog-wordart-container');
        if (container && grid) {
            container.appendChild(grid);
            grid.style.display = 'grid'; // ensure it's visible
        }
    };

    if (window.ContextRibbonActions) {
        window.ContextRibbonActions.openWordArtModal = window.showWordArtModal;
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
