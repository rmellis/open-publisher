// --- CLIPART SYSTEM (TWEMOJI) ---
function initClipart() {
    const grid = document.getElementById('clipart-grid');

    // Massive list of high-quality vector emojis
    // Grouped by Category with unique, intact sequences
    const categories = window.CLIPART_CATEGORIES || {
        "People & Fantasy": [
            // Base Smileys
            "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","☺️","😙","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","😎","🤓","🧐","😕","😟","🙁","☹️","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖","😺","😸","😹","😻","😼","😽","🙀","😿","😾",
            // Gestures
            "👋","🤚","🖐","✋","🖖","👌","🤏","✌️","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪",
            // People (Base)
            "👶","👧","🧒","👦","👩","🧑","👨","👩‍🦱","🧑‍🦱","👨‍🦱","👩‍","🧑‍🦰","👨‍🦰","👱‍♀️","👱","👱‍♂️","👩‍🦳","🧑‍🦳","👨‍🦳","👩‍🦲","🧑‍🦲","👨‍🦲","🧔","👵","🧓","👴","👲","👳‍♀️","👳","👳‍♂️","🧕",
            // Professions (ZWJ Sequences)
            "👮‍♀️","👮","👮‍♂️","👷‍♀️","👷","👷‍♂️","💂‍♀️","💂","💂‍♂️","🕵️‍♀️","🕵️","🕵️‍♂️","👩‍⚕️","🧑‍⚕️","👨‍⚕️","👩‍🌾","🧑‍🌾","👨‍🌾","👩‍🍳","🧑‍🍳","👨‍🍳","👩‍🎓","🧑‍🎓","👨‍🎓","👩‍🎤","🧑‍🎤","👨‍🎤","👩‍🏫","🧑‍🏫","👨‍🏫","👩‍🏭","🧑‍🏭","👨‍🏭","👩‍💻","🧑‍💻","👨‍💻","👩‍💼","🧑‍💼","👨‍💼","👩‍🔧","🧑‍🔧","👨‍🔧","👩‍🔬","🧑‍🔬","👨‍🔬","👩‍🎨","🧑‍🎨","👨‍🎨","👩‍🚒","🧑‍🚒","👨‍🚒","👩‍✈️","🧑‍✈️","👨‍✈️","👩‍🚀","🧑‍🚀","👨‍🚀","👩‍⚖️","🧑‍⚖️","👨‍⚖️",
            // Fantasy & Roles
            "👰","🤵","👸","🤴","🦸‍♀️","🦸","🦸‍♂️","🦹‍♀️","🦹","🦹‍♂️","🤶","🎅","🧙‍♀️","🧙","🧙‍♂️","🧝‍♀️","🧝","🧝‍♂️","🧛‍♀️","🧛","🧛‍♂️","🧟‍♀️","🧟","🧟‍♂️","🧞‍♀️","🧞","🧞‍♂️","🧜‍♀️","🧜","🧜‍♂️","🧚‍♀️","🧚","🧚‍♂️","👼"
        ],
        "Animals & Nature": [
            "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐽","🐸","🐵","🐵","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🕷","🕸","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🐊","🐅","🐆","🦓","🦍","🦧","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐕‍🦺","🐈","🐓","🦃","🦚","🦜","🦢","🦩","🕊","🐇","🦝","🦨","🦡","🦦","🦥","🐁","🐀","🐿","🦔",
            "🐾","🐉","🐲","🌵","🎄","🌲","🌳","🌴","🌱","🌿","☘️","🍀","🎍","🎋","🍃","🍂","🍁","🍄","🐚","🌾","💐","🌷","🌹","🥀","🌺","🌸","🌼","🌻","🌞","🌝","🌛","🌜","🌚","🌕","🌖","🌗","🌘","🌘","🌑","🌒","🌓","🌔","🌙","🌎","🌍","🌏","🪐","💫","⭐️","🌟","✨","⚡️","☄️","💥","🔥","🌪","🌈","☀️","🌤","⛅️","🌥","☁️","🌦","🌧","⛈","🌩","🌨","❄️","☃️","⛄️","🌬","💨","💧","💦","☔️","☂️","🌊","🌫"
        ],
        "Food & Drink": [
            "🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶","🌽","🥕","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🦴","🌭","🍔","🍟","🍕","🥪","🥙","🧆","🌮","🌯","🥗","🥘","🥫","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥠","🍢","🍡","🍧","🍨","🍦","🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🥮","☕️","🍵","🥣","🍼","🥤","🧃","🧉","🥛","🍺","🍻","🍷","🥂","🥃","🍸","🍹","🍾","🥄","🍴","🍽","🥣","🥡","🥢","🧂"
        ],
        "Activity & Sports": [
            "⚽️","🏀","🏈","⚾️","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🏑","🥍","🏏","🥅","⛳️","🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛷","⛸","🥌","🎿","⛷","🏂","🪂","🏋️‍♀️","🏋️","🏋️‍♂️","🤼‍♀️","🤼","🤼‍♂️","🤸‍♀️","🤸","🤸‍♂️","⛹️‍♀️","⛹️","⛹️‍♂️","🤺","🤾‍♀️","🤾","🤾‍♂️","🏌️‍♀️","🏌️","🏌️‍♂️","🏇","🧘‍♀️","🧘","🧘‍♂️","🏄‍♀️","🏄","🏄‍♂️","🏊‍♀️","🏊","🏊‍♂️","🤽‍♀️","🤽","🤽‍♂️","🚣‍♀️","🚣","🚣‍♂️","🧗‍♀️","🧗","🧗‍♂️","🚵‍♀️","🚵","🚵‍♂️","🚴‍♀️","🚴","🚴‍♂️","🏆","🥇","🥈","🥉","🏅","🎖","🏵","🎗","🎫","🎟","🎪","🤹","🤹‍♂️","🤹‍♀️","🎭","🩰","🎨","🎬","🎤","🎧","🎼","🎹","🥁","🎷","🎺","🎸","🪕","🎻","🎲","♟","🎯","🎳","🎮","🎰","🧩"
        ],
        "Travel & Places": [
            "🚗","🚕","🚙","🚌","🚎","🏎","🚓","🚑","🚒","🚐","🚚","🚛","🚜","🦯","🦽","🦼","🛴","🚲","🛵","🏍","🛺","🚨","🚔","🚍","🚘","🚖","🚡","🚠","🚟","🚃","🚋","🚞","🚝","🚄","🚅","🚈","🚂","🚆","🚇","🚊","🚉","✈️","🛫","🛬","🛩","💺","🛰","🚀","🛸","🚁","🛶","⛵️","🚤","🛥","🛳","⛴","🚢","⚓️","⛽️","🚧","🚦","🚥","🚏","🗺","🗿","🗽","🗼","🏰","🏯","🏟","🎡","🎢","🎠","⛲️","⛱","🏖","🏝","🏜","🌋","⛰","🏔","🗻","⛺️","🏠","🏡","🏘","🏚","🏗","🏭","🏢","🏬","🏣","🏤","🏥","🏦","🏨","🏪","🏫","🏩","💒","🏛","⛪️","🕌","🕍","🛕","🕋","⛩","🛤","🛣","🗾","🎑","🏞","🌅","🌄","🌠","🎇","🎆","🌇","🌆","🏙","🌃","🌌","🌉","🌁"
        ],
        "Objects & Tech": [
            "⌚️","📱","📲","💻","⌨️","🖥","🖨","🖱","🖲","🕹","🗜","💽","💾","💿","📀","📼","📷","📸","📹","🎥","📽","🎞","📞","☎️","📟","📠","📺","📻","🎙","🎚","🎛","🧭","⏱","⏲","⏰","🕰","⌛️","⏳","📡","🔋","🔌","💡","🔦","🕯","🪔","🧯","🛢","💸","💵","💴","💶","💷","💰","💳","💎","⚖️","🧰","🔧","🔨","⚒","🛠","⛏","🪓","🔩","⚙️","🧱","⛓","🧲","🔫","💣","🧨","🔪","🗡","⚔️","🛡","🚬","⚰️","⚱️","🏺","🔮","📿","🧿","💈","⚗️","🔭","🔬","🕳","🩹","🩺","💊","💉","🩸","🧬","🦠","🧫","🧪","🌡","🧹","🧺","🧻","🚽","🚰","🚿","🛁","🛀","🧼","🪒","🧽","🧴","🛎","🔑","🗝","🚪","🪑","🛋","🛏","🛌","🧸","🖼","🛍","🛒","🎁","🎈","🎏","🎀","🎊","🎉","🎎","🏮","🎐","🧧","✉️","📩","📨","📧","💌","📥","📤","📦","🏷","📪","📫","📬","📭","📮","📯","📜","📃","📄","📑","🧾","📊","📈","📉","🗒","🗓","📆","📅","🗑","📇","🗃","🗳","🗄","📋","📁","📂","🗂","🗞","📰","📓","📔","📒","📕","📗","📘","📙","📚","📖","🔖","🧷","🔗","📎","🖇","📐","📏","🧮","📌","📍","✂️","🖊","🖋","✒️","🖌","🖍","📝","✏️","🔍","🔎","🔏","🔐","🔒","🔓"
        ],
        "Symbols": [
            "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉","☸️","✡️","🔯","🕎","☯️","☦️","🛐","⛎","♈️","♉️","♊️","♋️","♌️","♍️","♎️","♏️","♐️","♑️","♒️","♓️","🆔","⚛️","🉑","☢️","☣️","📴","📳","🈶","🈚️","🈸","🈺","🈷️","✴️","🆚","💮","🉐","㊙️","㊗️","🈴","🈵","🈹","🈲","🅰️","🅱️","🆎","🆑","🅾️","🆘","❌","⭕️","🛑","⛔️","📛","🚫","💯","💢","♨️","🚷","🚯","🚳","🚱","🔞","📵","🚭","❗️","❕","❓","❔","‼️","⁉️","🔅","🔆","〽️","⚠️","🚸","🔱","⚜️","🔰","♻️","✅","🈯️","💹","❇️","✳️","❎","🌐","💠","Ⓜ️","🌀","💤","🏧","🚾","♿️","🅿️","🈳","🈂️","🛂","🛃","🛄","🛅","🚹","🚺","🚼","🚻","🚮","🎦","📶","🈁","🔣","ℹ️","🔤","🔡","🔠","🆖","🆗","🆙","🆒","🆕","🆓","0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟","🔢","#️⃣","*️⃣","⏏️","▶️","⏸","⏯","⏹","⏺","⏭","⏮","⏩","⏪","⏫","⏬","◀️","🔼","🔽","➡️","⬅️","⬆️","⬇️","↗️","↘️","↙️","↖️","↕️","↔️","↪️","↩️","⤴️","⤵️","🔀","🔁","🔂","🔄","🔃","🎵","🎶","➕","➖","➗","✖️","♾","💲","💱","™️","©️","®️","👁‍🗨","🔚","🔙","🔛","🔝","🔜","〰️","➰","➿","✔️","☑️","🔘","🔴","🟠","🟡","🟢","🔵","🟣","⚫️","⚪️","🟤","🔺","🔻","🔸","🔹","🔶","🔷","🔳","🔲","▪️","▫️","◾️","◽️","◼️","◻️","🟥","🟧","🟨","🟩","🟦","🟪","⬛️","⬜️","🔈","🔇","🔉","🔊","🔔","🔕","📣","📢","💬","💭","🗯","♠️","♣️","♥️","♦️","🃏","🎴","🀄️","🕐","🕑","🕒","🕓","🕔","🕕","🕖","🕗","🕘","🕙","🕚","🕛","🕜","🕝","🕞","🕟","🕠","🕡","🕢","🕣","🕤","🕥","🕦","🕧"
        ],
        "Flags": [
            "🏳️","🏴","🏁","🚩","🏳️‍🌈","🏳️‍⚧️","🏴‍☠️","🇦🇫","🇦🇽","🇦🇱","🇩🇿","🇦🇸","🇦🇩","🇦🇴","🇦🇮","🇦🇶","🇦🇬","🇦🇷","🇦🇲","🇦🇼","🇦🇺","🇦🇹","🇦🇿","🇧🇸","🇧🇭","🇧🇩","🇧🇧","🇧🇾","🇧🇪","🇧🇿","🇧🇯","🇧🇲","🇧🇹","🇧🇴","🇧🇦","🇧🇼","🇧🇷","🇮🇴","🇻🇬","🇧🇳","🇧🇬","🇧🇫","🇧🇮","🇰🇭","🇨🇲","🇨🇦","🇮🇨","🇨🇻","🇧bq","🇰🇾","🇨🇫","🇹🇩","🇨🇱","🇨🇳","🇨🇽","🇨🇨","🇨🇴","🇰🇲","🇨🇬","🇨🇩","🇨🇰","🇨🇷","🇨🇮","🇭🇷","🇨🇺","🇨🇼","🇨🇾","🇨🇿","🇩🇰","🇩🇯","🇩🇲","🇩🇴","🇪🇨","🇪🇬","🇸🇻","🇬🇶","🇪🇷","🇪🇪","🇪🇹","🇪🇺","🇫🇰","🇫🇴","🇫🇯","🇫🇮","🇫🇷","🇬🇫","🇵🇫","🇹🇫","🇬🇦","🇬🇲","🇬🇪","🇩🇪","🇬🇭","🇬🇮","🇬🇷","🇬🇱","🇬🇩","🇬🇵","🇬🇺","🇬🇹","🇬🇬","🇬🇳","🇬🇼","🇬🇾","🇭🇹","🇭🇳","🇭🇰","🇭🇺","🇮🇸","🇮🇳","🇮🇩","🇮🇷","🇮🇶","🇮🇪","🇮🇲","🇮🇱","🇮🇹","🇯🇲","🇯🇵","🎌","🇯🇪","🇯🇴","🇰🇿","🇰🇪","🇰🇮","🇽🇰","🇰🇼","🇰🇬","🇱🇦","🇱🇻","🇱🇧","🇱🇸","🇱🇷","🇱🇾","🇱🇮","🇱🇹","🇱🇺","🇲🇴","🇲🇰","🇲🇬","🇲🇼","🇲🇾","🇲🇻","🇲🇱","🇲🇹","🇲🇭","🇲🇶","🇲🇷","🇲🇺","YT","🇲🇽","🇫🇲","🇲🇩","🇲🇨","🇲🇳","🇲🇪","🇲🇸","🇲🇦","🇲🇿","🇲🇲","🇳🇦","🇳🇷","🇳🇵","🇳🇱","🇳🇨","🇳🇿","🇳🇮","🇳🇪","🇳🇬","🇳🇺","🇳🇫","🇰🇵","🇲🇵","🇳🇴","🇴🇲","🇵🇰","🇵🇼","🇵🇸","🇵🇦","🇵🇬","🇵🇾","🇵🇪","🇵🇭","🇵🇳","🇵🇱","🇵🇹","🇵🇷","🇶🇦","🇷🇪","🇷🇴","🇷🇺","🇷🇼","🇼🇸","🇸🇲","🇸🇦","🇸🇳","🇷🇸","🇸🇨","🇸🇱","🇸🇬","🇸🇽","🇸🇰","🇸🇮","🇬🇸","🇸🇧","🇸🇴","🇿🇦","🇰🇷","🇸🇸","🇪🇸","🇱🇰","🇧🇱","🇸🇭","🇰🇳","🇱🇨","🇵🇲","🇻🇨","🇸🇩","🇸🇷","🇸🇿","🇸🇪","🇨🇭","🇸🇾","🇹🇼","🇹🇯","🇹🇿","🇹🇭","🇹🇱","🇹🇬","🇹🇰","🇹🇴","🇹🇹","🇹🇳","🇹🇷","🇹🇲","🇹🇨","🇹🇻","🇺🇬","🇺🇦","🇦🇪","🇬🇧","🏴󠁧󠁢󠁥󠁮󠁧󠁿","🏴󠁧󠁢󠁳󠁣󠁴󠁿","🏴󠁧󠁢󠁷󠁬󠁳󠁿","🇺🇸","🇺🇾","🇺🇿","🇻🇺","🇻🇦","🇻🇪","🇻🇳","🇼🇫","🇪🇭","🇾🇪","🇿🇲","🇿🇼"
        ]
    };

    const hexHelper = (str) => {
        // Correctly handles ZWJ sequences like ðŸ‘¨â€âœˆï¸ by processing codepoints not chars
        return Array.from(str).map(c => c.codePointAt(0).toString(16)).join('-');
    };

    Object.keys(categories).forEach(cat => {
        // Add header
        const header = document.createElement('div');
        header.style.gridColumn = "1 / -1";
        header.style.padding = "5px";
        header.style.background = "#eee";
        header.style.fontWeight = "bold";
        header.style.fontSize = "12px";
        header.style.marginTop = "10px";
        header.innerText = cat;
        grid.appendChild(header);

        categories[cat].forEach(char => {
            const hex = hexHelper(char);
            const url = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${hex}.svg`;

            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.title = "Insert Clipart";
            
            const img = document.createElement('img');
            img.src = url;
            img.style.width = "100%";
            img.style.height = "100%";
            img.loading = "lazy";
            
            // Add simple error handler to hide broken ones
            img.onerror = () => { div.style.display = 'none'; };

            div.appendChild(img);
            div.onclick = () => {
                 document.getElementById('clipart-modal').style.display = 'none';
                 insertEmojiFromUrl(url);
            };
            grid.appendChild(div);
        });
    });
}
// --- ELEMENTS & MANIPULATION ---
function prepareTwemojiSvgMarkup(svgText) {
    if (!svgText || !svgText.includes('<svg')) return svgText;
    let svg = svgText.trim();
    svg = svg.replace(/\bpreserveAspectRatio\s*=\s*["'][^"']*["']/gi, '');
    svg = svg.replace(/\bwidth\s*=\s*["'][^"']*["']/gi, '');
    svg = svg.replace(/\bheight\s*=\s*["'][^"']*["']/gi, '');
    const stretchStyle = 'width:100%;height:100%;display:block;position:absolute;top:0;left:0;overflow:visible;';
    if (/<svg[^>]*style\s*=/i.test(svg)) {
        svg = svg.replace(/<svg([^>]*?)style\s*=\s*["']([^"']*)["']/i, `<svg$1preserveAspectRatio="none" style="${stretchStyle}$2"`);
    } else {
        svg = svg.replace(/<svg/i, `<svg preserveAspectRatio="none" style="${stretchStyle}"`);
    }
    return svg;
}

function applyEmojiStretch(root) {
    if (!root) return;
    root.querySelectorAll('svg').forEach(svg => {
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.display = 'block';
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.overflow = 'visible';
    });
    root.querySelectorAll('img').forEach(img => {
        const fit = img.style.objectFit;
        if (fit && fit !== 'fill' && fit !== 'stretch') return;
        img.style.objectFit = 'fill';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.maxWidth = 'none';
        img.style.maxHeight = 'none';
    });
}

async function insertEmojiFromUrl(url) {
    let markup;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Emoji fetch failed');
        markup = prepareTwemojiSvgMarkup(await res.text());
    } catch (e) {
        markup = `<img src="${url}" draggable="false" style="width:100%;height:100%;object-fit:fill;position:absolute;top:0;left:0;">`;
    }
    const el = createWrapper(markup);
    el.setAttribute('data-type', 'emoji');
    el.style.width = '100px';
    el.style.height = '100px';
    applyEmojiStretch(el.querySelector('.element-content'));
    if (typeof selectElement === 'function') selectElement(el); // Re-trigger UI now that type is set
    return el;
}

let emojiMigrateTimer = null;
function scheduleEmojiMigrate() {
    clearTimeout(emojiMigrateTimer);
    emojiMigrateTimer = setTimeout(async () => {
        const imgs = Array.from(document.querySelectorAll('.pub-element img[src*="twemoji"]'));
        let migrated = false;
        for (const img of imgs) {
            const content = img.closest('.element-content');
            const el = img.closest('.pub-element');
            if (!content || !el) continue;
            try {
                const res = await fetch(img.src);
                if (!res.ok) continue;
                content.innerHTML = prepareTwemojiSvgMarkup(await res.text());
                el.setAttribute('data-type', 'emoji');
                applyEmojiStretch(content);
                migrated = true;
            } catch (e) { /* keep img fallback */ }
        }
        if (migrated && typeof state !== 'undefined' && typeof serializeCurrentPage === 'function') {
            state.pages[state.currentPageIndex] = serializeCurrentPage();
        }
    }, 80);
}
function showClipartModal() { document.getElementById('clipart-modal').style.display = 'flex'; }
// --- INSERT SYMBOL MODAL ---
window._symbolRecentlyUsed = JSON.parse(localStorage.getItem('op-recent-symbols') || '[]');

const SYMBOL_CATEGORIES = {
    'Common': [
        { char: 'Â©', name: 'Copyright' },
        { char: 'Â®', name: 'Registered' },
        { char: 'â„¢', name: 'Trademark' },
        { char: 'Â°', name: 'Degree' },
        { char: 'Â§', name: 'Section' },
        { char: 'Â¶', name: 'Pilcrow' },
        { char: 'â€ ', name: 'Dagger' },
        { char: 'â€¡', name: 'Double Dagger' },
        { char: 'â€¦', name: 'Ellipsis' },
        { char: 'â€¢', name: 'Bullet' },
        { char: 'â—¦', name: 'White Bullet' },
        { char: 'â€£', name: 'Triangle Bullet' },
        { char: 'âƒ', name: 'Hyphen Bullet' },
        { char: 'â„–', name: 'Numero' },
        { char: 'â„ƒ', name: 'Celsius' },
        { char: 'â„‰', name: 'Fahrenheit' },
        { char: 'â€°', name: 'Per Mille' },
        { char: 'âˆž', name: 'Infinity' },
        { char: 'âœ“', name: 'Check Mark' },
        { char: 'âœ—', name: 'Ballot X' },
    ],
    'Dashes & Quotes': [
        { char: 'â€“', name: 'En Dash' },
        { char: 'â€”', name: 'Em Dash' },
        { char: 'â€•', name: 'Horizontal Bar' },
        { char: '\u00AD', name: 'Soft Hyphen' },
        { char: 'â€', name: 'Hyphen' },
        { char: '\u2009', name: 'Thin Space' },
        { char: '\u2003', name: 'Em Space' },
        { char: '\u2002', name: 'En Space' },
        { char: '\u00A0', name: 'Non-Breaking Space' },
        { char: '\u200B', name: 'Zero-Width Space' },
        { char: '\u2018', name: 'Left Single Quote' },
        { char: '\u2019', name: 'Right Single Quote' },
        { char: '\u201C', name: 'Left Double Quote' },
        { char: '\u201D', name: 'Right Double Quote' },
        { char: 'Â«', name: 'Left Guillemet' },
        { char: 'Â»', name: 'Right Guillemet' },
        { char: 'â€¹', name: 'Left Single Guillemet' },
        { char: 'â€º', name: 'Right Single Guillemet' },
    ],
    'Currency': [
        { char: 'Â£', name: 'Pound' },
        { char: 'â‚¬', name: 'Euro' },
        { char: 'Â¥', name: 'Yen' },
        { char: 'Â¢', name: 'Cent' },
        { char: 'â‚¹', name: 'Indian Rupee' },
        { char: 'â‚©', name: 'Won' },
        { char: 'â‚¿', name: 'Bitcoin' },
        { char: 'â‚½', name: 'Ruble' },
        { char: 'â‚º', name: 'Turkish Lira' },
        { char: 'â‚±', name: 'Peso' },
        { char: 'â‚«', name: 'Dong' },
        { char: 'â‚´', name: 'Hryvnia' },
        { char: 'â‚¸', name: 'Tenge' },
        { char: 'à¸¿', name: 'Baht' },
        { char: 'â‚µ', name: 'Cedi' },
        { char: 'â‚¦', name: 'Naira' },
    ],
    'Math & Science': [
        { char: 'Â±', name: 'Plus-Minus' },
        { char: 'Ã—', name: 'Multiply' },
        { char: 'Ã·', name: 'Divide' },
        { char: 'â‰ ', name: 'Not Equal' },
        { char: 'â‰ˆ', name: 'Approx Equal' },
        { char: 'â‰¤', name: 'Less or Equal' },
        { char: 'â‰¥', name: 'Greater or Equal' },
        { char: 'âˆ‘', name: 'Summation' },
        { char: 'âˆ', name: 'Product' },
        { char: 'âˆš', name: 'Square Root' },
        { char: 'âˆ«', name: 'Integral' },
        { char: 'Ï€', name: 'Pi' },
        { char: 'Î©', name: 'Omega' },
        { char: 'Î”', name: 'Delta' },
        { char: 'Âµ', name: 'Micro' },
        { char: 'âˆ‚', name: 'Partial Diff' },
        { char: 'âˆ…', name: 'Empty Set' },
        { char: 'âˆˆ', name: 'Element Of' },
        { char: 'âˆ‰', name: 'Not Element Of' },
        { char: 'âˆ©', name: 'Intersection' },
        { char: 'âˆª', name: 'Union' },
        { char: 'âŠ‚', name: 'Subset' },
        { char: 'âŠƒ', name: 'Superset' },
        { char: 'âˆ€', name: 'For All' },
        { char: 'âˆƒ', name: 'There Exists' },
        { char: 'âˆ‡', name: 'Nabla' },
        { char: 'âˆ´', name: 'Therefore' },
        { char: 'âˆµ', name: 'Because' },
        { char: 'Â¹', name: 'Superscript 1' },
        { char: 'Â²', name: 'Superscript 2' },
        { char: 'Â³', name: 'Superscript 3' },
        { char: 'Â¼', name: 'One Quarter' },
        { char: 'Â½', name: 'One Half' },
        { char: 'Â¾', name: 'Three Quarters' },
    ],
    'Arrows': [
        { char: 'â†', name: 'Left Arrow' },
        { char: 'â†’', name: 'Right Arrow' },
        { char: 'â†‘', name: 'Up Arrow' },
        { char: 'â†“', name: 'Down Arrow' },
        { char: 'â†”', name: 'Left-Right Arrow' },
        { char: 'â†•', name: 'Up-Down Arrow' },
        { char: 'â‡', name: 'Double Left Arrow' },
        { char: 'â‡’', name: 'Double Right Arrow' },
        { char: 'â‡‘', name: 'Double Up Arrow' },
        { char: 'â‡“', name: 'Double Down Arrow' },
        { char: 'â‡”', name: 'Double Left-Right' },
        { char: 'â†—', name: 'NE Arrow' },
        { char: 'â†˜', name: 'SE Arrow' },
        { char: 'â†™', name: 'SW Arrow' },
        { char: 'â†–', name: 'NW Arrow' },
        { char: 'â†©', name: 'Return Arrow' },
        { char: 'â†ª', name: 'Curve Right Arrow' },
        { char: 'âŸµ', name: 'Long Left Arrow' },
        { char: 'âŸ¶', name: 'Long Right Arrow' },
        { char: 'â–¶', name: 'Play' },
    ],
    'Shapes & Stars': [
        { char: 'â– ', name: 'Black Square' },
        { char: 'â–¡', name: 'White Square' },
        { char: 'â–ª', name: 'Small Black Square' },
        { char: 'â–«', name: 'Small White Square' },
        { char: 'â–²', name: 'Black Triangle Up' },
        { char: 'â–³', name: 'White Triangle Up' },
        { char: 'â–¼', name: 'Black Triangle Down' },
        { char: 'â–½', name: 'White Triangle Down' },
        { char: 'â—†', name: 'Black Diamond' },
        { char: 'â—‡', name: 'White Diamond' },
        { char: 'â—', name: 'Black Circle' },
        { char: 'â—‹', name: 'White Circle' },
        { char: 'â—‰', name: 'Fisheye' },
        { char: 'â—Ž', name: 'Bullseye' },
        { char: 'â˜…', name: 'Black Star' },
        { char: 'â˜†', name: 'White Star' },
        { char: 'âœ¦', name: 'Four-Point Star' },
        { char: 'âœ¶', name: 'Six-Point Star' },
        { char: 'â™ ', name: 'Spade' },
        { char: 'â™£', name: 'Club' },
        { char: 'â™¥', name: 'Heart' },
        { char: 'â™¦', name: 'Diamond Suit' },
        { char: 'â™©', name: 'Quarter Note' },
        { char: 'â™ª', name: 'Eighth Note' },
        { char: 'â™«', name: 'Beamed Notes' },
        { char: 'â˜€', name: 'Sun' },
        { char: 'â˜', name: 'Cloud' },
        { char: 'â˜‚', name: 'Umbrella' },
        { char: 'â˜Ž', name: 'Telephone' },
        { char: 'âœ‰', name: 'Envelope' },
        { char: 'âœ‚', name: 'Scissors' },
        { char: 'âœŽ', name: 'Pencil' },
        { char: 'âœŒ', name: 'Peace Sign' },
        { char: 'â˜®', name: 'Peace Symbol' },
    ],
    'Accented Letters': [
        { char: 'Ã€', name: 'A Grave' }, { char: 'Ã', name: 'A Acute' },
        { char: 'Ã‚', name: 'A Circumflex' }, { char: 'Ãƒ', name: 'A Tilde' },
        { char: 'Ã„', name: 'A Umlaut' }, { char: 'Ã…', name: 'A Ring' },
        { char: 'Ã†', name: 'AE' }, { char: 'Ã‡', name: 'C Cedilla' },
        { char: 'Ãˆ', name: 'E Grave' }, { char: 'Ã‰', name: 'E Acute' },
        { char: 'ÃŠ', name: 'E Circumflex' }, { char: 'Ã‹', name: 'E Umlaut' },
        { char: 'ÃŒ', name: 'I Grave' }, { char: 'Ã', name: 'I Acute' },
        { char: 'ÃŽ', name: 'I Circumflex' }, { char: 'Ã', name: 'I Umlaut' },
        { char: 'Ã', name: 'Eth' }, { char: 'Ã‘', name: 'N Tilde' },
        { char: 'Ã’', name: 'O Grave' }, { char: 'Ã“', name: 'O Acute' },
        { char: 'Ã”', name: 'O Circumflex' }, { char: 'Ã•', name: 'O Tilde' },
        { char: 'Ã–', name: 'O Umlaut' }, { char: 'Ã˜', name: 'O Slash' },
        { char: 'Ã™', name: 'U Grave' }, { char: 'Ãš', name: 'U Acute' },
        { char: 'Ã›', name: 'U Circumflex' }, { char: 'Ãœ', name: 'U Umlaut' },
        { char: 'Ã', name: 'Y Acute' }, { char: 'Ãž', name: 'Thorn' },
        { char: 'ÃŸ', name: 'Sharp S' }, { char: 'Ã ', name: 'a Grave' },
        { char: 'Ã¡', name: 'a Acute' }, { char: 'Ã¢', name: 'a Circumflex' },
        { char: 'Ã£', name: 'a Tilde' }, { char: 'Ã¤', name: 'a Umlaut' },
        { char: 'Ã¥', name: 'a Ring' }, { char: 'Ã¦', name: 'ae' },
        { char: 'Ã§', name: 'c Cedilla' }, { char: 'Ã¨', name: 'e Grave' },
        { char: 'Ã©', name: 'e Acute' }, { char: 'Ãª', name: 'e Circumflex' },
        { char: 'Ã«', name: 'e Umlaut' }, { char: 'Ã¬', name: 'i Grave' },
        { char: 'Ã­', name: 'i Acute' }, { char: 'Ã®', name: 'i Circumflex' },
        { char: 'Ã¯', name: 'i Umlaut' }, { char: 'Ã±', name: 'n Tilde' },
        { char: 'Ã²', name: 'o Grave' }, { char: 'Ã³', name: 'o Acute' },
        { char: 'Ã´', name: 'o Circumflex' }, { char: 'Ãµ', name: 'o Tilde' },
        { char: 'Ã¶', name: 'o Umlaut' }, { char: 'Ã¸', name: 'o Slash' },
        { char: 'Ã¹', name: 'u Grave' }, { char: 'Ãº', name: 'u Acute' },
        { char: 'Ã»', name: 'u Circumflex' }, { char: 'Ã¼', name: 'u Umlaut' },
        { char: 'Ã½', name: 'y Acute' }, { char: 'Ã¿', name: 'y Umlaut' },
    ],
};

function insertSymbolChar(char) {
    // Save to recently used
    const recent = window._symbolRecentlyUsed;
    const idx = recent.indexOf(char);
    if (idx > -1) recent.splice(idx, 1);
    recent.unshift(char);
    if (recent.length > 20) recent.length = 20;
    localStorage.setItem('op-recent-symbols', JSON.stringify(recent));
    
    // Restore the cursor position and insert
    if (state.lastRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(state.lastRange);
    }
    document.execCommand('insertText', false, char);
    
    // Save new cursor position
    const sel2 = window.getSelection();
    if (sel2.rangeCount > 0) state.lastRange = sel2.getRangeAt(0).cloneRange();
    
    pushHistory();
    
    // Update the preview in the dialog
    const preview = document.getElementById('symbol-preview-char');
    const previewName = document.getElementById('symbol-preview-name');
    const previewCode = document.getElementById('symbol-preview-code');
    if (preview) preview.textContent = char;
    if (previewName) {
        // Find the name
        let foundName = '';
        for (const cat in SYMBOL_CATEGORIES) {
            const found = SYMBOL_CATEGORIES[cat].find(s => s.char === char);
            if (found) { foundName = found.name; break; }
        }
        previewName.textContent = foundName || 'Custom';
    }
    if (previewCode) previewCode.textContent = 'U+' + char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    
    // Update recently used row in modal
    _renderRecentSymbols();
}

function _renderRecentSymbols() {
    const container = document.getElementById('symbol-recent-grid');
    if (!container) return;
    const recent = window._symbolRecentlyUsed;
    if (recent.length === 0) {
        container.innerHTML = '<span style="color:#999; font-size:12px; grid-column: 1/-1;">No recently used symbols yet.</span>';
        return;
    }
    container.innerHTML = recent.map(ch => {
        const vis = (ch === '\u00AD' || ch === '\u200B' || ch === '\u00A0' || ch === '\u2009' || ch === '\u2002' || ch === '\u2003') ? 'âŒ·' : ch;
        return `<div class="symbol-cell" onclick="insertSymbolChar('${ch.replace(/'/g, "\\'")}')" title="U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}">${vis}</div>`;
    }).join('');
}

function showSymbolModal() {
    // Save cursor before opening modal
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) state.lastRange = sel.getRangeAt(0).cloneRange();

    const categoryTabs = Object.keys(SYMBOL_CATEGORIES).map((cat, i) =>
        `<div class="symbol-cat-tab${i === 0 ? ' active' : ''}" onclick="switchSymbolCategory('${cat}', this)">${cat}</div>`
    ).join('');

    const firstCat = Object.keys(SYMBOL_CATEGORIES)[0];
    const firstGrid = SYMBOL_CATEGORIES[firstCat].map(s => {
        const vis = (s.char === '\u00AD' || s.char === '\u200B' || s.char === '\u00A0' || s.char === '\u2009' || s.char === '\u2002' || s.char === '\u2003') ? 'âŒ·' : s.char;
        return `<div class="symbol-cell" onclick="insertSymbolChar('${s.char.replace(/'/g, "\\'")}')" title="${s.name}\nU+${s.char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}"
            onmouseenter="symbolHover('${s.char.replace(/'/g, "\\'")}', '${s.name}')">${vis}</div>`;
    }).join('');

    const html = `
        <div style="width:520px; display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; gap:8px; align-items:center;">
                <i class="fas fa-search" style="color:#999;"></i>
                <input type="text" id="symbol-search-input" placeholder="Search symbols... (e.g. copyright, arrow, euro)"
                    style="flex:1; padding:7px 10px; border:1px solid #ccc; border-radius:4px; font-size:13px; outline:none;"
                    oninput="filterSymbols(this.value)">
            </div>
            <div id="symbol-category-tabs" style="display:flex; flex-wrap:wrap; gap:4px;">
                ${categoryTabs}
            </div>
            <div id="symbol-recent-section" style="display:${window._symbolRecentlyUsed.length > 0 ? 'block' : 'none'};">
                <div style="font-size:11px; font-weight:600; color:#666; text-transform:uppercase; margin-bottom:4px;">Recently Used</div>
                <div id="symbol-recent-grid" class="symbol-grid" style="margin-bottom:6px;"></div>
            </div>
            <div id="symbol-grid-container" class="symbol-grid" style="max-height:240px; overflow-y:auto;">
                ${firstGrid}
            </div>
            <div style="display:flex; align-items:center; gap:12px; padding:8px 12px; background:#f5f5f5; border-radius:6px; border:1px solid #e8e8e8;">
                <span id="symbol-preview-char" style="font-size:36px; line-height:1; width:44px; text-align:center;">Â©</span>
                <div style="flex:1;">
                    <div id="symbol-preview-name" style="font-weight:600; font-size:13px; color:#333;">Copyright</div>
                    <div id="symbol-preview-code" style="font-size:11px; color:#888; font-family:monospace;">U+00A9</div>
                </div>
                <div style="font-size:11px; color:#999;">Click any symbol to insert it at the cursor position.</div>
            </div>
        </div>
    `;

    DialogSystem.show('Insert Symbol', html, null, true);
    
    // Render recently used
    _renderRecentSymbols();
    if (window._symbolRecentlyUsed.length > 0) {
        document.getElementById('symbol-recent-section').style.display = 'block';
    }
}

function switchSymbolCategory(catName, tabEl) {
    // Update active tab
    document.querySelectorAll('.symbol-cat-tab').forEach(t => t.classList.remove('active'));
    if (tabEl) tabEl.classList.add('active');

    const symbols = SYMBOL_CATEGORIES[catName];
    if (!symbols) return;

    const grid = document.getElementById('symbol-grid-container');
    grid.innerHTML = symbols.map(s => {
        const vis = (s.char === '\u00AD' || s.char === '\u200B' || s.char === '\u00A0' || s.char === '\u2009' || s.char === '\u2002' || s.char === '\u2003') ? 'âŒ·' : s.char;
        return `<div class="symbol-cell" onclick="insertSymbolChar('${s.char.replace(/'/g, "\\'")}')" title="${s.name}\nU+${s.char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}"
            onmouseenter="symbolHover('${s.char.replace(/'/g, "\\'")}', '${s.name}')">${vis}</div>`;
    }).join('');
    
    // Clear search
    const search = document.getElementById('symbol-search-input');
    if (search) search.value = '';
}

function filterSymbols(query) {
    const q = query.toLowerCase().trim();
    const grid = document.getElementById('symbol-grid-container');
    
    // Remove active from category tabs
    document.querySelectorAll('.symbol-cat-tab').forEach(t => t.classList.remove('active'));
    
    if (!q) {
        // Show first category
        const firstCat = Object.keys(SYMBOL_CATEGORIES)[0];
        const firstTab = document.querySelector('.symbol-cat-tab');
        if (firstTab) firstTab.classList.add('active');
        switchSymbolCategory(firstCat, firstTab);
        return;
    }

    // Search across all categories
    const results = [];
    for (const cat in SYMBOL_CATEGORIES) {
        SYMBOL_CATEGORIES[cat].forEach(s => {
            if (s.name.toLowerCase().includes(q) || s.char === q || 
                ('U+' + s.char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).toLowerCase().includes(q)) {
                results.push(s);
            }
        });
    }

    if (results.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#999; padding:20px; font-size:13px;"><i class="fas fa-search" style="margin-right:6px;"></i>No symbols found matching "' + query.replace(/</g, '&lt;') + '"</div>';
    } else {
        grid.innerHTML = results.map(s => {
            const vis = (s.char === '\u00AD' || s.char === '\u200B' || s.char === '\u00A0' || s.char === '\u2009' || s.char === '\u2002' || s.char === '\u2003') ? 'âŒ·' : s.char;
            return `<div class="symbol-cell" onclick="insertSymbolChar('${s.char.replace(/'/g, "\\'")}')" title="${s.name}\nU+${s.char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}"
                onmouseenter="symbolHover('${s.char.replace(/'/g, "\\'")}', '${s.name}')">${vis}</div>`;
        }).join('');
    }
}

function symbolHover(char, name) {
    const preview = document.getElementById('symbol-preview-char');
    const previewName = document.getElementById('symbol-preview-name');
    const previewCode = document.getElementById('symbol-preview-code');
    if (preview) preview.textContent = (char === '\u00AD' || char === '\u200B' || char === '\u00A0' || char === '\u2009' || char === '\u2002' || char === '\u2003') ? 'âŒ·' : char;
    if (previewName) previewName.textContent = name;
    if (previewCode) previewCode.textContent = 'U+' + char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
}
