// --- CLIPART SYSTEM (TWEMOJI) - v5.11.6 ---
function initClipart() {
    const modal = document.getElementById('clipart-modal');
    if (modal) modal.setAttribute('data-html2canvas-ignore', 'true');
    const grid = document.getElementById('clipart-grid');
    if (!grid) return;

    const searchInput = document.getElementById('emoji-search-input');
    const searchClear = document.getElementById('emoji-search-clear');

    if (searchInput && !searchInput._boundEmojiSearch) {
        searchInput._boundEmojiSearch = true;
        searchInput.addEventListener('input', (e) => {
            if (typeof window.filterEmojis === 'function') {
                window.filterEmojis(e.target.value);
            }
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (searchInput.value) {
                    searchInput.value = '';
                    if (typeof window.filterEmojis === 'function') {
                        window.filterEmojis('');
                    }
                } else if (modal) {
                    modal.style.display = 'none';
                }
            }
        });
    }

    if (searchClear && !searchClear._boundEmojiClear) {
        searchClear._boundEmojiClear = true;
        searchClear.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                if (typeof window.filterEmojis === 'function') {
                    window.filterEmojis('');
                }
                searchInput.focus();
            }
        });
    }

    // Massive list of high-quality vector emojis
    // Grouped by Category with unique, intact sequences
    const categories = window.CLIPART_CATEGORIES || {
        "People & Fantasy": [
            // Base Smileys
            "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","☺️","😙","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","😎","🤓","🧐","😕","😟","🙁","☹️","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖","😺","😸","😹","😻","😼","😽","🙀","😿","😾",
            // Gestures
            "👋","🤚","🖐","✋","🖖","👌","🤏","✌️","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪",
            // People (Base)
            "👶","👧","🧒","👦","👩","🧑","👨","👩‍🦱","🧑‍🦱","👨‍🦱","👩","🧑‍🦰","👨‍🦰","👱‍♀️","👱","👱‍♂️","👩‍🦳","🧑‍🦳","👨‍🦳","👩‍🦲","🧑‍🦲","👨‍🦲","🧔","👵","🧓","👴","👲","👳‍♀️","👳","👳‍♂️","🧕",
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
            "🏳️","🏴","🏁","🚩","🏳️‍🌈","🏳️‍⚧️","🏴‍☠️","🇦🇫","🇦🇽","🇦🇱","🇩🇿","🇦🇸","🇦🇩","🇦🇴","🇦🇮","🇦🇶","🇦🇬","🇦🇷","🇦🇲","🇦🇼","🇦🇺","🇦🇹","🇦🇿","🇧🇸","🇧🇭","🇧🇩","🇧🇧","🇧🇾","🇧🇪","🇧🇿","🇧🇯","🇧🇲","🇧🇹","🇧🇴","🇧🇦","🇧🇼","🇧🇷","🇮🇴","🇻🇬","🇧🇳","🇧🇬","🇧🇫","🇧🇮","🇰🇭","🇨🇲","🇨🇦","🇮🇨","🇨🇻","🇧🇧","🇰🇾","🇨🇫","🇹🇩","🇨🇱","🇨🇳","🇨🇽","🇨🇨","🇨🇴","🇰🇲","🇨🇬","🇨🇩","🇨🇰","🇨🇷","🇨🇮","🇭🇷","🇨🇺","🇨🇼","🇨🇾","🇨🇿","🇩🇰","🇩🇯","🇩🇲","🇩🇴","🇪🇨","🇪🇬","🇸🇻","🇬🇶","🇪🇷","🇪🇪","🇪🇹","🇪🇺","🇫🇰","🇫🇴","🇫🇯","🇫🇮","🇫🇷","🇬🇫","🇵🇫","🇹🇫","🇬🇦","🇬🇲","🇬🇪","🇩🇪","🇬🇭","🇬🇮","🇬🇷","🇬🇱","🇬🇩","🇬🇵","🇬🇺","🇬🇹","🇬🇬","🇬🇳","🇬🇼","🇬🇾","🇭🇹","🇭🇳","🇭🇰","🇭🇺","🇮🇸","🇮🇳","🇮🇩","🇮🇷","🇮🇶","🇮🇪","🇮🇲","🇮🇱","🇮🇹","🇯🇲","🇯🇵","🎌","🇯🇪","🇯🇴","🇰🇿","🇰🇪","🇰🇮","🇽🇰","🇰🇼","🇰🇬","🇱🇦","🇱🇻","🇱🇧","🇱🇸","🇱🇷","🇱🇾","🇱🇮","🇱🇹","🇱🇺","🇲🇴","🇲🇰","🇲🇬","🇲🇼","🇲🇾","🇲🇻","🇲🇱","🇲🇹","🇲🇭","🇲🇶","🇲🇷","🇲🇺","🇾🇹","🇲🇽","🇫🇲","🇲🇩","🇲🇨","🇲🇳","🇲🇪","🇲🇸","🇲🇦","🇲🇿","🇲🇲","🇳🇦","🇳🇷","🇳🇵","🇳🇱","🇳🇨","🇳🇿","🇳🇮","🇳🇪","🇳🇬","🇳🇺","🇳🇫","🇰🇵","🇲🇵","🇳🇴","🇴🇲","🇵🇰","🇵🇼","🇵🇸","🇵🇦","🇵🇬","🇵🇾","🇵🇪","🇵🇭","🇵🇳","🇵🇱","🇵🇹","🇵🇷","🇶🇦","🇷🇪","🇷🇴","🇷🇺","🇷🇼","🇼🇸","🇸🇲","🇸🇦","🇸🇳","🇷🇸","🇸🇨","🇸🇱","🇸🇬","🇸🇽","🇸🇰","🇸🇮","🇬🇸","🇸🇧","🇸🇴","🇿🇦","🇰🇷","🇸🇸","🇪🇸","🇱🇰","🇧🇱","🇸🇭","🇰🇳","🇱🇨","🇵🇲","🇻🇨","🇸🇩","🇸🇷","🇸🇿","🇸🇪","🇨🇭","🇸🇾","🇹🇼","🇹🇯","🇹🇿","🇹🇭","🇹🇱","🇹🇬","🇹🇰","🇹🇴","🇹🇹","🇹🇳","🇹🇷","🇹🇲","🇹🇨","🇹🇻","🇺🇬","🇺🇦","🇦🇪","🇬🇧","🏴󠁧󠁢󠁥󠁮󠁧󠁿","🏴󠁧󠁢󠁳󠁣󠁴󠁿","🏴󠁧󠁢󠁷󠁬󠁳󠁿","🇺🇸","🇺🇾","🇺🇿","🇻🇺","🇻🇦","🇻🇪","🇻🇳","🇼🇫","🇪🇭","🇾🇪","🇿🇲","🇿🇼"
        ]
    };

    const hexHelper = (str) => {
        // Official Twemoji grabTheRightIcon rule:
        // If no ZWJ (\u200D), strip \uFE0F
        let clean = str;
        if (!clean.includes('\u200d')) {
            clean = clean.replace(/\ufe0f/g, '');
        }
        // Strip dangling ZWJ if any
        clean = clean.replace(/\u200d+$/, '');
        const codepoints = Array.from(clean).map(c => c.codePointAt(0).toString(16).toLowerCase());
        return codepoints.join('-');
    };

    grid.innerHTML = '';
    Object.keys(categories).forEach(cat => {
        // Add header
        const header = document.createElement('div');
        header.className = 'emoji-category-header';
        header.setAttribute('data-category', cat);
        header.style.gridColumn = "1 / -1";
        header.style.padding = "5px 8px";
        header.style.background = "#eee";
        header.style.fontWeight = "bold";
        header.style.fontSize = "12px";
        header.style.marginTop = "10px";
        header.style.borderRadius = "3px";
        header.innerText = cat;
        grid.appendChild(header);

        categories[cat].forEach(char => {
            const hex = hexHelper(char);
            const url = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${hex}.svg`;

            const div = document.createElement('div');
            div.className = 'gallery-item emoji-item';
            div.setAttribute('data-category', cat);
            div.setAttribute('data-char', char);
            div.setAttribute('data-hex', hex);
            
            const kw = (window.EMOJI_KEYWORDS && window.EMOJI_KEYWORDS[char]) || cat.toLowerCase();
            div.setAttribute('data-keywords', `${char} ${kw} ${cat.toLowerCase()}`);
            div.title = kw ? `${char} (${kw.split(' ').slice(0, 3).join(', ')})` : "Insert Emoji";
            
            const img = document.createElement('img');
            img.src = url;
            img.alt = char;
            img.style.width = "100%";
            img.style.height = "100%";
            img.loading = "lazy";
            
            // Fallback: If SVG image fails to load, render the native Unicode character
            img.onerror = () => {
                img.style.display = 'none';
                if (!div.querySelector('.emoji-fallback-char')) {
                    const span = document.createElement('span');
                    span.className = 'emoji-fallback-char';
                    span.textContent = char;
                    span.style.cssText = 'font-size: 34px; line-height: 1; user-select: none; pointer-events: none; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif;';
                    div.appendChild(span);
                }
            };

            div.appendChild(img);
            div.onclick = () => {
                 document.getElementById('clipart-modal').style.display = 'none';
                 insertEmojiFromUrl(url, char);
            };
            grid.appendChild(div);
        });
    });
}

window.filterEmojis = function(query) {
    const q = (query || '').toLowerCase().trim();
    const grid = document.getElementById('clipart-grid');
    const clearBtn = document.querySelector('#custom-dialog-box #emoji-search-clear') || document.getElementById('emoji-search-clear');
    if (!grid) return;

    if (clearBtn) {
        clearBtn.style.display = q ? 'block' : 'none';
    }

    const items = grid.querySelectorAll('.emoji-item');
    const headers = grid.querySelectorAll('.emoji-category-header');
    let noResultsEl = document.getElementById('emoji-no-results');

    if (!q) {
        items.forEach(it => { it.style.removeProperty('display'); });
        headers.forEach(h => { h.style.removeProperty('display'); });
        if (noResultsEl) noResultsEl.remove();
        return;
    }

    const tokens = q.split(/\s+/).filter(Boolean);
    let totalVisible = 0;
    const catCounts = {};

    items.forEach(it => {
        const text = (it.getAttribute('data-keywords') || '') + ' ' + (it.getAttribute('data-char') || '');
        const matches = tokens.every(tok => text.includes(tok));
        const cat = it.getAttribute('data-category');
        if (matches) {
            it.style.setProperty('display', 'flex', 'important');
            catCounts[cat] = (catCounts[cat] || 0) + 1;
            totalVisible++;
        } else {
            it.style.setProperty('display', 'none', 'important');
        }
    });

    headers.forEach(h => {
        const cat = h.getAttribute('data-category');
        if (catCounts[cat] > 0) {
            h.style.removeProperty('display');
        } else {
            h.style.setProperty('display', 'none', 'important');
        }
    });

    if (totalVisible === 0) {
        if (!noResultsEl) {
            noResultsEl = document.createElement('div');
            noResultsEl.id = 'emoji-no-results';
            noResultsEl.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--ui-text-muted, #888); font-size: 14px;';
            grid.appendChild(noResultsEl);
        }
        noResultsEl.innerHTML = `<i class="fas fa-search" style="font-size: 26px; margin-bottom: 12px; display: block; opacity: 0.45;"></i>No emojis found matching "<strong>${query.replace(/</g, '&lt;')}</strong>"`;
    } else if (noResultsEl) {
        noResultsEl.remove();
    }
};
// --- ELEMENTS & MANIPULATION ---
function prepareTwemojiSvgMarkup(svgText) {
    if (!svgText || !svgText.includes('<svg')) return svgText;
    let svg = svgText.trim();
    svg = svg.replace(/\bpreserveAspectRatio\s*=\s*["'][^"']*["']/gi, '');
    svg = svg.replace(/\bwidth\s*=\s*["'][^"']*["']/gi, '');
    svg = svg.replace(/\bheight\s*=\s*["'][^"']*["']/gi, '');
    if (!svg.includes('xmlns=')) {
        svg = svg.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
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
        img.style.display = 'block';
    });
}

function hexToEmojiChar(hex) {
    if (!hex) return '';
    try {
        const codepoints = hex.split('-').map(h => parseInt(h, 16)).filter(n => !isNaN(n));
        return String.fromCodePoint(...codepoints);
    } catch (e) {
        return '';
    }
}
window.hexToEmojiChar = hexToEmojiChar;

function createEmojiSvgFromChar(char) {
    const clean = char || '😀';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none"><text x="50%" y="54%" font-size="75" text-anchor="middle" dominant-baseline="central" font-family="'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif">${clean}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
window.createEmojiSvgFromChar = createEmojiSvgFromChar;

async function insertEmojiFromUrl(url, fallbackChar = '') {
    let markup;
    const hexMatch = (url || '').match(/\/([0-9a-fA-F-]+)\.svg/);
    const hex = hexMatch ? hexMatch[1].toLowerCase() : '';
    const baseHex = window.getBaseHexFromEmoji ? window.getBaseHexFromEmoji(hex) : hex;
    const supportsSkinTone = window.emojiSupportsSkinTone ? window.emojiSupportsSkinTone(baseHex) : false;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('Emoji fetch failed');
        const rawSvg = await res.text();
        const svgMarkup = prepareTwemojiSvgMarkup(rawSvg);
        const dataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgMarkup)))}`;
        markup = `<img src="${dataUri}" draggable="false" style="width:100%;height:100%;object-fit:fill;position:absolute;top:0;left:0;display:block;">`;
    } catch (e) {
        // Unicode character fallback if CDN SVG fails
        const char = fallbackChar || hexToEmojiChar(hex) || '😀';
        const dataUri = createEmojiSvgFromChar(char);
        markup = `<img src="${dataUri}" draggable="false" style="width:100%;height:100%;object-fit:fill;position:absolute;top:0;left:0;display:block;">`;
    }
    const el = createWrapper(markup);
    el.setAttribute('data-type', 'emoji');
    if (baseHex) el.setAttribute('data-base-hex', baseHex);
    if (hex) el.setAttribute('data-current-hex', hex);
    if (supportsSkinTone) {
        el.setAttribute('data-supports-skin-tone', 'true');
        const toneMatch = hex.match(/1f3f[b-f]/);
        const initialTone = toneMatch ? ((window.SKIN_TONES || []).find(t => t.hex === toneMatch[0])?.id || 'default') : 'default';
        el.setAttribute('data-skin-tone', initialTone);
    }
    el.style.width = '100px';
    el.style.height = '100px';
    applyEmojiStretch(el.querySelector('.element-content'));
    if (typeof selectElement === 'function') selectElement(el); // Re-trigger UI now that type is set
    return el;
}

window.ensureEmojiAttributes = function(el) {
    if (!el || el.getAttribute('data-type') !== 'emoji') return;
    if (el.getAttribute('data-supports-skin-tone')) return;
    const img = el.querySelector('img');
    if (!img) return;
    let hex = el.getAttribute('data-current-hex') || el.getAttribute('data-base-hex') || '';
    if (!hex && img.src && img.src.includes('twemoji/')) {
        const m = img.src.match(/\/([0-9a-fA-F-]+)\.svg/);
        if (m) hex = m[1].toLowerCase();
    }
    if (hex) {
        const baseHex = window.getBaseHexFromEmoji ? window.getBaseHexFromEmoji(hex) : hex;
        const supports = window.emojiSupportsSkinTone ? window.emojiSupportsSkinTone(baseHex) : false;
        el.setAttribute('data-base-hex', baseHex);
        el.setAttribute('data-current-hex', hex);
        if (supports) {
            el.setAttribute('data-supports-skin-tone', 'true');
            const toneMatch = hex.match(/1f3f[b-f]/);
            const initialTone = toneMatch ? ((window.SKIN_TONES || []).find(t => t.hex === toneMatch[0])?.id || 'default') : 'default';
            el.setAttribute('data-skin-tone', initialTone);
        }
    }
};

window.setEmojiSkinTone = async function(el, toneId) {
    if (!el) return;
    if (typeof window.ensureEmojiAttributes === 'function') {
        window.ensureEmojiAttributes(el);
    }
    const baseHex = el.getAttribute('data-base-hex');
    if (!baseHex) return;
    const tones = window.SKIN_TONES || [];
    const tone = tones.find(t => t.id === toneId) || tones[0];
    const newHex = window.getEmojiHexForSkinTone ? window.getEmojiHexForSkinTone(baseHex, tone.hex) : (tone.hex ? `${baseHex}-${tone.hex}` : baseHex);
    const url = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${newHex}.svg`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('Fetch failed');
        const rawSvg = await res.text();
        const svgMarkup = prepareTwemojiSvgMarkup(rawSvg);
        const dataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgMarkup)))}`;
        const img = el.querySelector('img');
        if (img) {
            img.src = dataUri;
        } else {
            const content = el.querySelector('.element-content') || el;
            content.innerHTML = `<img src="${dataUri}" draggable="false" style="width:100%;height:100%;object-fit:fill;position:absolute;top:0;left:0;display:block;">`;
        }
    } catch (e) {
        const char = hexToEmojiChar(newHex) || '😀';
        const dataUri = createEmojiSvgFromChar(char);
        const img = el.querySelector('img');
        if (img) img.src = dataUri;
    }

    el.setAttribute('data-skin-tone', tone.id);
    el.setAttribute('data-current-hex', newHex);

    // Update active swatch state in floating toolbar if present
    const toolbar = document.querySelector('.emoji-skin-tone-actions');
    if (toolbar) {
        toolbar.querySelectorAll('.skin-tone-swatch').forEach(btn => {
            const isMatch = btn.getAttribute('data-tone') === tone.id;
            btn.classList.toggle('active', isMatch);
            btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
        });
    }

    if (typeof saveState === 'function') {
        saveState();
    }
};

let emojiMigrateTimer = null;
function scheduleEmojiMigrate() {
    clearTimeout(emojiMigrateTimer);
    emojiMigrateTimer = setTimeout(async () => {
        let migrated = false;
        // 1. Convert any legacy inline SVG emojis into SVG data URI <img> tags
        const svgs = Array.from(document.querySelectorAll('.pub-element[data-type="emoji"] svg'));
        for (const svg of svgs) {
            const content = svg.closest('.element-content');
            const el = svg.closest('.pub-element');
            if (!content || !el) continue;
            try {
                const svgMarkup = prepareTwemojiSvgMarkup(svg.outerHTML);
                const dataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgMarkup)))}`;
                content.innerHTML = `<img src="${dataUri}" draggable="false" style="width:100%;height:100%;object-fit:fill;position:absolute;top:0;left:0;display:block;">`;
                applyEmojiStretch(content);
                migrated = true;
            } catch (e) {}
        }
        // 2. Convert any external twemoji <img> tags into SVG data URIs with preserveAspectRatio="none"
        const imgs = Array.from(document.querySelectorAll('.pub-element[data-type="emoji"] img:not([src^="data:"])'));
        for (const img of imgs) {
            const content = img.closest('.element-content');
            if (!content) continue;
            try {
                const res = await fetch(img.src);
                if (!res.ok) continue;
                const svgMarkup = prepareTwemojiSvgMarkup(await res.text());
                img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgMarkup)))}`;
                img.style.objectFit = 'fill';
                img.style.width = '100%';
                img.style.height = '100%';
                migrated = true;
            } catch (e) {}
        }
        if (migrated && typeof state !== 'undefined' && typeof serializeCurrentPage === 'function') {
            state.pages[state.currentPageIndex] = serializeCurrentPage();
        }
    }, 80);
}
function showClipartModal() {
    const modal = document.getElementById('clipart-modal');
    if (modal) modal.style.display = 'flex';
    const input = document.getElementById('emoji-search-input');
    if (input) {
        input.value = '';
        if (typeof window.filterEmojis === 'function') {
            window.filterEmojis('');
        }
        setTimeout(() => input.focus(), 60);
    }
}
// --- INSERT SYMBOL MODAL ---
window._symbolRecentlyUsed = JSON.parse(localStorage.getItem('op-recent-symbols') || '[]');

const SYMBOL_CATEGORIES = {
    'Common': [
        { char: '©', name: 'Copyright' },
        { char: '®', name: 'Registered' },
        { char: '™', name: 'Trademark' },
        { char: '°', name: 'Degree' },
        { char: '§', name: 'Section' },
        { char: '¶', name: 'Pilcrow' },
        { char: '†', name: 'Dagger' },
        { char: '‡', name: 'Double Dagger' },
        { char: '…', name: 'Ellipsis' },
        { char: '•', name: 'Bullet' },
        { char: '◦', name: 'White Bullet' },
        { char: '‣', name: 'Triangle Bullet' },
        { char: '⁃', name: 'Hyphen Bullet' },
        { char: '№', name: 'Numero' },
        { char: '℃', name: 'Celsius' },
        { char: '℉', name: 'Fahrenheit' },
        { char: '‰', name: 'Per Mille' },
        { char: '∞', name: 'Infinity' },
        { char: '✓', name: 'Check Mark' },
        { char: '✗', name: 'Ballot X' },
    ],
    'Dashes & Quotes': [
        { char: '–', name: 'En Dash' },
        { char: '—', name: 'Em Dash' },
        { char: '―', name: 'Horizontal Bar' },
        { char: '\u00AD', name: 'Soft Hyphen' },
        { char: '‐', name: 'Hyphen' },
        { char: '\u2009', name: 'Thin Space' },
        { char: '\u2003', name: 'Em Space' },
        { char: '\u2002', name: 'En Space' },
        { char: '\u00A0', name: 'Non-Breaking Space' },
        { char: '\u200B', name: 'Zero-Width Space' },
        { char: '\u2018', name: 'Left Single Quote' },
        { char: '\u2019', name: 'Right Single Quote' },
        { char: '\u201C', name: 'Left Double Quote' },
        { char: '\u201D', name: 'Right Double Quote' },
        { char: '«', name: 'Left Guillemet' },
        { char: '»', name: 'Right Guillemet' },
        { char: '‹', name: 'Left Single Guillemet' },
        { char: '›', name: 'Right Single Guillemet' },
    ],
    'Currency': [
        { char: '£', name: 'Pound' },
        { char: '€', name: 'Euro' },
        { char: '¥', name: 'Yen' },
        { char: '¢', name: 'Cent' },
        { char: '₹', name: 'Indian Rupee' },
        { char: '₩', name: 'Won' },
        { char: '₿', name: 'Bitcoin' },
        { char: '₽', name: 'Ruble' },
        { char: '₺', name: 'Turkish Lira' },
        { char: '₱', name: 'Peso' },
        { char: '₫', name: 'Dong' },
        { char: '₴', name: 'Hryvnia' },
        { char: '₸', name: 'Tenge' },
        { char: '฿', name: 'Baht' },
        { char: '₵', name: 'Cedi' },
        { char: '₦', name: 'Naira' },
    ],
    'Math & Science': [
        { char: '±', name: 'Plus-Minus' },
        { char: '×', name: 'Multiply' },
        { char: '÷', name: 'Divide' },
        { char: '≠', name: 'Not Equal' },
        { char: '≈', name: 'Approx Equal' },
        { char: '≤', name: 'Less or Equal' },
        { char: '≥', name: 'Greater or Equal' },
        { char: '∑', name: 'Summation' },
        { char: '∏', name: 'Product' },
        { char: '√', name: 'Square Root' },
        { char: '∫', name: 'Integral' },
        { char: 'π', name: 'Pi' },
        { char: 'Ω', name: 'Omega' },
        { char: 'Δ', name: 'Delta' },
        { char: 'µ', name: 'Micro' },
        { char: '∂', name: 'Partial Diff' },
        { char: '∅', name: 'Empty Set' },
        { char: '∈', name: 'Element Of' },
        { char: '∉', name: 'Not Element Of' },
        { char: '∩', name: 'Intersection' },
        { char: '∪', name: 'Union' },
        { char: '⊂', name: 'Subset' },
        { char: '⊃', name: 'Superset' },
        { char: '∀', name: 'For All' },
        { char: '∃', name: 'There Exists' },
        { char: '∇', name: 'Nabla' },
        { char: '∴', name: 'Therefore' },
        { char: '∵', name: 'Because' },
        { char: '¹', name: 'Superscript 1' },
        { char: '²', name: 'Superscript 2' },
        { char: '³', name: 'Superscript 3' },
        { char: '¼', name: 'One Quarter' },
        { char: '½', name: 'One Half' },
        { char: '¾', name: 'Three Quarters' },
    ],
    'Arrows': [
        { char: '←', name: 'Left Arrow' },
        { char: '→', name: 'Right Arrow' },
        { char: '↑', name: 'Up Arrow' },
        { char: '↓', name: 'Down Arrow' },
        { char: '↔', name: 'Left-Right Arrow' },
        { char: '↕', name: 'Up-Down Arrow' },
        { char: '⇐', name: 'Double Left Arrow' },
        { char: '⇒', name: 'Double Right Arrow' },
        { char: '⇑', name: 'Double Up Arrow' },
        { char: '⇓', name: 'Double Down Arrow' },
        { char: '⇔', name: 'Double Left-Right' },
        { char: '↗', name: 'NE Arrow' },
        { char: '↘', name: 'SE Arrow' },
        { char: '↙', name: 'SW Arrow' },
        { char: '↖', name: 'NW Arrow' },
        { char: '↩', name: 'Return Arrow' },
        { char: '↪', name: 'Curve Right Arrow' },
        { char: '⟵', name: 'Long Left Arrow' },
        { char: '⟶', name: 'Long Right Arrow' },
        { char: '▶', name: 'Play' },
    ],
    'Shapes & Stars': [
        { char: '■', name: 'Black Square' },
        { char: '□', name: 'White Square' },
        { char: '▪', name: 'Small Black Square' },
        { char: '▫', name: 'Small White Square' },
        { char: '▲', name: 'Black Triangle Up' },
        { char: '△', name: 'White Triangle Up' },
        { char: '▼', name: 'Black Triangle Down' },
        { char: '▽', name: 'White Triangle Down' },
        { char: '◆', name: 'Black Diamond' },
        { char: '◇', name: 'White Diamond' },
        { char: '●', name: 'Black Circle' },
        { char: '○', name: 'White Circle' },
        { char: '◉', name: 'Fisheye' },
        { char: '◎', name: 'Bullseye' },
        { char: '★', name: 'Black Star' },
        { char: '☆', name: 'White Star' },
        { char: '✦', name: 'Four-Point Star' },
        { char: '✶', name: 'Six-Point Star' },
        { char: '♠', name: 'Spade' },
        { char: '♣', name: 'Club' },
        { char: '♥', name: 'Heart' },
        { char: '♦', name: 'Diamond Suit' },
        { char: '♩', name: 'Quarter Note' },
        { char: '♪', name: 'Eighth Note' },
        { char: '♫', name: 'Beamed Notes' },
        { char: '☀', name: 'Sun' },
        { char: '☁', name: 'Cloud' },
        { char: '☂', name: 'Umbrella' },
        { char: '☎', name: 'Telephone' },
        { char: '✉', name: 'Envelope' },
        { char: '✂', name: 'Scissors' },
        { char: '✎', name: 'Pencil' },
        { char: '✌', name: 'Peace Sign' },
        { char: '☮', name: 'Peace Symbol' },
    ],
    'Accented Letters': [
        { char: 'À', name: 'A Grave' }, { char: 'Á', name: 'A Acute' },
        { char: 'Â', name: 'A Circumflex' }, { char: 'Ã', name: 'A Tilde' },
        { char: 'Ä', name: 'A Umlaut' }, { char: 'Å', name: 'A Ring' },
        { char: 'Æ', name: 'AE' }, { char: 'Ç', name: 'C Cedilla' },
        { char: 'È', name: 'E Grave' }, { char: 'É', name: 'E Acute' },
        { char: 'Ê', name: 'E Circumflex' }, { char: 'Ë', name: 'E Umlaut' },
        { char: 'Ì', name: 'I Grave' }, { char: 'Í', name: 'I Acute' },
        { char: 'Î', name: 'I Circumflex' }, { char: 'Ï', name: 'I Umlaut' },
        { char: 'Ð', name: 'Eth' }, { char: 'Ñ', name: 'N Tilde' },
        { char: 'Ò', name: 'O Grave' }, { char: 'Ó', name: 'O Acute' },
        { char: 'Ô', name: 'O Circumflex' }, { char: 'Õ', name: 'O Tilde' },
        { char: 'Ö', name: 'O Umlaut' }, { char: 'Ø', name: 'O Slash' },
        { char: 'Ù', name: 'U Grave' }, { char: 'Ú', name: 'U Acute' },
        { char: 'Û', name: 'U Circumflex' }, { char: 'Ü', name: 'U Umlaut' },
        { char: 'Ý', name: 'Y Acute' }, { char: 'Þ', name: 'Thorn' },
        { char: 'ß', name: 'Sharp S' }, { char: 'à', name: 'a Grave' },
        { char: 'á', name: 'a Acute' }, { char: 'â', name: 'a Circumflex' },
        { char: 'ã', name: 'a Tilde' }, { char: 'ä', name: 'a Umlaut' },
        { char: 'å', name: 'a Ring' }, { char: 'æ', name: 'ae' },
        { char: 'ç', name: 'c Cedilla' }, { char: 'è', name: 'e Grave' },
        { char: 'é', name: 'e Acute' }, { char: 'ê', name: 'e Circumflex' },
        { char: 'ë', name: 'e Umlaut' }, { char: 'ì', name: 'i Grave' },
        { char: 'í', name: 'i Acute' }, { char: 'î', name: 'i Circumflex' },
        { char: 'ï', name: 'i Umlaut' }, { char: 'ñ', name: 'n Tilde' },
        { char: 'ò', name: 'o Grave' }, { char: 'ó', name: 'o Acute' },
        { char: 'ô', name: 'o Circumflex' }, { char: 'õ', name: 'o Tilde' },
        { char: 'ö', name: 'o Umlaut' }, { char: 'ø', name: 'o Slash' },
        { char: 'ù', name: 'u Grave' }, { char: 'ú', name: 'u Acute' },
        { char: 'û', name: 'u Circumflex' }, { char: 'ü', name: 'u Umlaut' },
        { char: 'ý', name: 'y Acute' }, { char: 'ÿ', name: 'y Umlaut' },
    ],
};;

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
        const vis = (ch === '\u00AD' || ch === '\u200B' || ch === '\u00A0' || ch === '\u2009' || ch === '\u2002' || ch === '\u2003') ? '\u2337' : ch;
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
        const vis = (s.char === '\u00AD' || s.char === '\u200B' || s.char === '\u00A0' || s.char === '\u2009' || s.char === '\u2002' || s.char === '\u2003') ? '\u2337' : s.char;
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
                <span id="symbol-preview-char" style="font-size:36px; line-height:1; width:44px; text-align:center;">©</span>
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
        const vis = (s.char === '\u00AD' || s.char === '\u200B' || s.char === '\u00A0' || s.char === '\u2009' || s.char === '\u2002' || s.char === '\u2003') ? '\u2337' : s.char;
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
            const vis = (s.char === '\u00AD' || s.char === '\u200B' || s.char === '\u00A0' || s.char === '\u2009' || s.char === '\u2002' || s.char === '\u2003') ? '\u2337' : s.char;
            return `<div class="symbol-cell" onclick="insertSymbolChar('${s.char.replace(/'/g, "\\'")}')" title="${s.name}\nU+${s.char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}"
                onmouseenter="symbolHover('${s.char.replace(/'/g, "\\'")}', '${s.name}')">${vis}</div>`;
        }).join('');
    }
}

function symbolHover(char, name) {
    const preview = document.getElementById('symbol-preview-char');
    const previewName = document.getElementById('symbol-preview-name');
    const previewCode = document.getElementById('symbol-preview-code');
    if (preview) preview.textContent = (char === '\u00AD' || char === '\u200B' || char === '\u00A0' || char === '\u2009' || char === '\u2002' || char === '\u2003') ? '\u2337' : char;
    if (previewName) previewName.textContent = name;
    if (previewCode) previewCode.textContent = 'U+' + char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
}
