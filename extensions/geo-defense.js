// Open Publisher Geographic Access Control & Defense Engine (v5.1.13)
(function() {
    'use strict';

    const RU_TIMEZONES = [
        'Europe/Moscow', 'Europe/Kaliningrad', 'Europe/Samara', 'Europe/Volgograd',
        'Europe/Kirov', 'Europe/Astrakhan', 'Europe/Ulyanovsk', 'Europe/Saratov',
        'Asia/Yekaterinburg', 'Asia/Omsk', 'Asia/Novosibirsk', 'Asia/Barnaul',
        'Asia/Tomsk', 'Asia/Novokuznetsk', 'Asia/Krasnoyarsk', 'Asia/Irkutsk',
        'Asia/Chita', 'Asia/Yakutsk', 'Asia/Khandyga', 'Asia/Vladivostok',
        'Asia/Ust-Nera', 'Asia/Magadan', 'Asia/Sakhalin', 'Asia/Srednekolymsk',
        'Asia/Kamchatka', 'Asia/Anadyr'
    ];

    function renderBlockScreen() {
        try {
            sessionStorage.setItem('op_ru_blocked', '1');
            localStorage.setItem('op_ru_blocked', '1');
        } catch(e) {}


        document.title = '🚫 Access Restricted | Stand with Ukraine 🇺🇦';

        const blockHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚫 Access Restricted | Stand with Ukraine 🇺🇦</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background: #0b0f19;
            color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
            text-align: center;
        }
        .block-card {
            background: #151d30;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-top: 4px solid #0057B7;
            border-bottom: 4px solid #FFD700;
            border-radius: 18px;
            max-width: 580px;
            width: 100%;
            padding: 36px 28px;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
            animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .flag-box {
            width: 120px;
            height: 76px;
            border-radius: 8px;
            overflow: hidden;
            margin: 0 auto 20px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .flag-top {
            height: 50%;
            background: #0057B7;
        }
        .flag-bottom {
            height: 50%;
            background: #FFD700;
        }
        .badge {
            display: inline-block;
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.35);
            padding: 5px 14px;
            border-radius: 20px;
            font-size: 0.82rem;
            font-weight: 600;
            margin-bottom: 16px;
            letter-spacing: 0.5px;
        }
        h1 {
            font-size: 1.5rem;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
        }
        .sub-heading {
            font-size: 1.05rem;
            font-weight: 700;
            color: #94a3b8;
            margin-bottom: 20px;
        }
        .message-en {
            font-size: 0.95rem;
            line-height: 1.6;
            color: #e2e8f0;
            margin-bottom: 14px;
        }
        .highlight {
            color: #38bdf8;
            font-weight: 600;
            margin-bottom: 22px;
            font-size: 0.98rem;
            line-height: 1.5;
        }
        .divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.1);
            margin: 22px 0;
        }
        .message-ru {
            font-size: 0.88rem;
            line-height: 1.6;
            color: #94a3b8;
        }
        .solidarity {
            margin-top: 24px;
            font-size: 1rem;
            font-weight: 700;
            color: #facc15;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
    </style>
</head>
<body>
    <div class="block-card">
        <div class="flag-box">
            <div class="flag-top"></div>
            <div class="flag-bottom"></div>
        </div>

        <div class="badge">Российская Федерация (RU) : ДОСТУП ОГРАНИЧЕН</div>

        <h1>ДОСТУП ЗАБЛОКИРОВАН</h1>
        <div class="sub-heading">ACCESS RESTRICTED</div>

        <p class="message-en">
            Access to Open Publisher has been completely restricted for connections originating from the Russian Federation due to repeated service misuse.
        </p>
        <p class="highlight">
            This service will remain blocked until Russian military forces completely withdraw from all sovereign territory of Ukraine.
        </p>

        <div class="divider"></div>

        <p class="message-ru">
            Доступ к Open Publisher полностью заблокирован для пользователей из Российской Федерации в связи со систематическим злоупотреблением сервисом.<br><br>
            Работа сервиса будет возобновлена только после полного вывода российских войск со всей суверенной территории Украины.
        </p>

        <div class="solidarity">
            <span>🇺🇦</span> Stand with Ukraine / Разом до перемоги
        </div>
    </div>
</body>
</html>
        `;

        document.documentElement.innerHTML = blockHTML;
    }

    // Expose simulation helper for automated testing and verification
    window._simulateRussiaGeoBlock = function() {
        renderBlockScreen();
    };

    // 1. Immediate cache check
    try {
        if (sessionStorage.getItem('op_ru_blocked') === '1' || localStorage.getItem('op_ru_blocked') === '1') {
            renderBlockScreen();
            return;
        }
    } catch(e) {}

    // 2. Client-side Timezone & Russian Locale Heuristic Check
    try {
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const userLang = (navigator.language || '').toLowerCase();
        const userLanguages = (navigator.languages || []).map(l => l.toLowerCase());
        const hasRussianLang = userLang.startsWith('ru') || userLanguages.some(l => l.startsWith('ru'));

        if (RU_TIMEZONES.includes(userTz) && hasRussianLang) {
            renderBlockScreen();
            return;
        }
    } catch(e) {}

    // 3. Network Cloudflare Trace & IP Geolocation Check
    async function checkNetworkGeo() {
        let isRussianIP = false;

        // Vector A: Cloudflare /cdn-cgi/trace
        try {
            const cfTraceUrl = (location.hostname && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1')
                ? '/cdn-cgi/trace'
                : 'https://www.cloudflare.com/cdn-cgi/trace';

            const cfResp = await fetch(cfTraceUrl, { cache: 'no-store' });
            if (cfResp.ok) {
                const text = await cfResp.text();
                const match = text.match(/loc=([A-Z]{2})/i);
                if (match && match[1].toUpperCase() === 'RU') {
                    isRussianIP = true;
                }
            }
        } catch(e) {}

        if (isRussianIP) {
            renderBlockScreen();
            return;
        }

        // Vector B: Public IP Geolocation Fallback
        try {
            const geoResp = await fetch('https://api.country.is/', { cache: 'no-store' });
            if (geoResp.ok) {
                const geoData = await geoResp.json();
                if (geoData && geoData.country === 'RU') {
                    isRussianIP = true;
                }
            }
        } catch(e) {}

        if (isRussianIP) {
            renderBlockScreen();
        }
    }

    checkNetworkGeo();
})();
