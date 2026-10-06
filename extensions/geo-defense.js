// Open Publisher Geographic Access Control & Defense Engine (v5.4.3)
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

    const IR_TIMEZONES = [
        'Asia/Tehran', 'Iran'
    ];

    function getCountryConfig(country) {
        if (country === 'IR') {
            return {
                countryCode: 'IR',
                sessionKey: 'op_ir_blocked',
                docTitle: '🚫 Access Restricted | Woman, Life, Freedom 🕊️',
                borderTop: '#239f40',
                borderBottom: '#da0000',
                flagHTML: `
                    <div class="flag-box">
                        <div style="height: 33.33%; background: #239f40;"></div>
                        <div style="height: 33.34%; background: #ffffff;"></div>
                        <div style="height: 33.33%; background: #da0000;"></div>
                    </div>
                `,
                badge: 'جمهوری اسلامی ایران (IR) : دسترسی مسدود است',
                heading: 'دسترسی مسدود است',
                subHeading: 'ACCESS RESTRICTED',
                messageEn: 'Access to Open Publisher has been completely restricted for connections originating from Iran in strict compliance with international sanctions, trade embargoes, and export compliance regulations.',
                highlight: 'This platform strictly prohibits access by entities and jurisdictions subject to international sanctions, and stands in unwavering support of universal human rights, civil liberties, and the freedom of expression.',
                localMessageHTML: `
                    دسترسی به اوپن پابلیشر (Open Publisher) برای اتصالات با مبدا ایران در راستای پایبندی به تحریم‌های بین‌المللی و مقررات کنترل صادرات نرم‌افزار به صورت کامل مسدود شده است.<br><br>
                    این پلتفرم هرگونه استفاده توسط نهادهای مشمول تحریم‌ها را اکیداً ممنوع دانسته و در کنار حقوق اساسی بشر، آزادی زنان، برابری مدنی و گردش آزاد اطلاعات می‌ایستد.
                `,
                isRtl: true,
                solidarity: '<span>🕊️</span> زن، زندگی، آزادی / Woman, Life, Freedom',
                solidarityColor: '#34d399'
            };
        }

        // Default: RU
        return {
            countryCode: 'RU',
            sessionKey: 'op_ru_blocked',
            docTitle: '🚫 Access Restricted | Stand with Ukraine 🇺🇦',
            borderTop: '#0057B7',
            borderBottom: '#FFD700',
            flagHTML: `
                <div class="flag-box">
                    <div class="flag-top"></div>
                    <div class="flag-bottom"></div>
                </div>
            `,
            badge: 'Российская Федерация (RU) : ДОСТУП ОГРАНИЧЕН',
            heading: 'ДОСТУП ЗАБЛОКИРОВАН',
            subHeading: 'ACCESS RESTRICTED',
            messageEn: 'Access to Open Publisher has been completely restricted for connections originating from the Russian Federation due to repeated service misuse.',
            highlight: 'This service will remain blocked until Russian military forces completely withdraw from all sovereign territory of Ukraine.',
            localMessageHTML: `
                Доступ к Open Publisher полностью заблокирован для пользователей из Российской Федерации в связи со систематическим злоупотреблением сервисом.<br><br>
                Работа сервиса будет возобновлена только после полного вывода российских войск со всей суверенной территории Украины.
            `,
            isRtl: false,
            solidarity: '<span>🇺🇦</span> Stand with Ukraine / Разом до перемоги',
            solidarityColor: '#facc15'
        };
    }

    function renderBlockScreen(country) {
        const c = (country || 'RU').toUpperCase();
        const cfg = getCountryConfig(c);

        try {
            sessionStorage.setItem(cfg.sessionKey, '1');
            localStorage.setItem(cfg.sessionKey, '1');
            sessionStorage.setItem('op_geo_blocked_country', c);
            localStorage.setItem('op_geo_blocked_country', c);
        } catch(e) {}

        // Clear any running timers or deferred initializations
        try {
            const maxId = setTimeout(function(){}, 0);
            for (let i = 0; i <= maxId; i++) {
                clearTimeout(i);
                clearInterval(i);
            }
        } catch(e) {}

        // Remove any lingering splash screens, modals, or workspace elements
        try {
            document.querySelectorAll('#splash-screen, .dashboard-container, #canvas-container, .pub-context-menu, #op-format-indicator').forEach(el => el.remove());
        } catch(e) {}

        document.title = cfg.docTitle;

        const blockHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cfg.docTitle}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
            background: #0b0f19 !important;
            color: #f8fafc !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, Tahoma, sans-serif !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            overflow: hidden !important;
        }
        #op-geo-block-overlay {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: #0b0f19 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 2147483647 !important;
            padding: 24px !important;
            box-sizing: border-box !important;
            overflow-y: auto !important;
            text-align: center !important;
        }
        body > *:not(#op-geo-block-overlay) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        #splash-screen, .dashboard-container, #canvas-container, .pub-context-menu, #op-format-indicator {
            display: none !important;
        }
        .block-card {
            background: #151d30;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-top: 4px solid ${cfg.borderTop};
            border-bottom: 4px solid ${cfg.borderBottom};
            border-radius: 18px;
            max-width: 580px;
            width: 100%;
            margin: auto;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
            animation: fadeIn 0.4s ease-out;
            position: relative;
            z-index: 2147483647;
            padding: 32px 28px;
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
            display: flex;
            flex-direction: column;
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
        .message-local {
            font-size: 0.88rem;
            line-height: 1.6;
            color: #94a3b8;
            ${cfg.isRtl ? 'direction: rtl; text-align: center;' : ''}
        }
        .solidarity {
            margin-top: 24px;
            font-size: 1rem;
            font-weight: 700;
            color: ${cfg.solidarityColor};
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
    </style>
</head>
<body>
    <div id="op-geo-block-overlay">
        <div class="block-card">
            ${cfg.flagHTML}

            <div class="badge">${cfg.badge}</div>

            <h1>${cfg.heading}</h1>
            <div class="sub-heading">${cfg.subHeading}</div>

            <p class="message-en">
                ${cfg.messageEn}
            </p>
            <p class="highlight">
                ${cfg.highlight}
            </p>

            <div class="divider"></div>

            <p class="message-local">
                ${cfg.localMessageHTML}
            </p>

            <div class="solidarity">
                ${cfg.solidarity}
            </div>
        </div>
    </div>
</body>
</html>
        `;

        document.documentElement.innerHTML = blockHTML;
    }

    // Expose simulation helpers for automated testing and verification
    window._simulateRussiaGeoBlock = function() {
        renderBlockScreen('RU');
    };
    window._simulateIranGeoBlock = function() {
        renderBlockScreen('IR');
    };
    window._simulateGeoBlock = function(country) {
        renderBlockScreen((country || 'IR').toUpperCase());
    };
    window._resetGeoBlock = function() {
        try {
            sessionStorage.removeItem('op_ru_blocked');
            localStorage.removeItem('op_ru_blocked');
            sessionStorage.removeItem('op_ir_blocked');
            localStorage.removeItem('op_ir_blocked');
            sessionStorage.removeItem('op_geo_blocked_country');
            localStorage.removeItem('op_geo_blocked_country');
            location.reload();
        } catch(e) {}
    };

    // 1. Immediate cache check
    try {
        if (sessionStorage.getItem('op_ir_blocked') === '1' || localStorage.getItem('op_ir_blocked') === '1' ||
            sessionStorage.getItem('op_geo_blocked_country') === 'IR' || localStorage.getItem('op_geo_blocked_country') === 'IR') {
            renderBlockScreen('IR');
            return;
        }
        if (sessionStorage.getItem('op_ru_blocked') === '1' || localStorage.getItem('op_ru_blocked') === '1' ||
            sessionStorage.getItem('op_geo_blocked_country') === 'RU' || localStorage.getItem('op_geo_blocked_country') === 'RU') {
            renderBlockScreen('RU');
            return;
        }
    } catch(e) {}

    // 2. Client-side Timezone & Locale Heuristic Check
    try {
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const userLang = (navigator.language || '').toLowerCase();
        const userLanguages = (navigator.languages || []).map(l => l.toLowerCase());
        const hasRussianLang = userLang.startsWith('ru') || userLanguages.some(l => l.startsWith('ru'));
        const hasPersianLang = userLang.startsWith('fa') || userLanguages.some(l => l.startsWith('fa')) ||
                               userLang.startsWith('pes') || userLanguages.some(l => l.startsWith('pes'));

        // Russia heuristic: Russian timezone + Russian language preference
        if (RU_TIMEZONES.includes(userTz) && hasRussianLang) {
            renderBlockScreen('RU');
            return;
        }

        // Iran heuristic: Tehran timezone OR Persian language with Iran timezone
        if (IR_TIMEZONES.includes(userTz) || (hasPersianLang && (userTz.includes('Tehran') || userTz.includes('Iran')))) {
            renderBlockScreen('IR');
            return;
        }
    } catch(e) {}

    // 3. Network Cloudflare Trace & IP Geolocation Check
    async function checkNetworkGeo() {
        let blockedCountry = null;

        // Vector A: Cloudflare /cdn-cgi/trace
        try {
            const cfTraceUrl = (location.hostname && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1')
                ? '/cdn-cgi/trace'
                : 'https://www.cloudflare.com/cdn-cgi/trace';

            const cfResp = await fetch(cfTraceUrl, { cache: 'no-store' });
            if (cfResp.ok) {
                const text = await cfResp.text();
                const match = text.match(/loc=([A-Z]{2})/i);
                if (match) {
                    const loc = match[1].toUpperCase();
                    if (loc === 'RU') blockedCountry = 'RU';
                    else if (loc === 'IR') blockedCountry = 'IR';
                }
            }
        } catch(e) {}

        if (blockedCountry) {
            renderBlockScreen(blockedCountry);
            return;
        }

        // Vector B: Public IP Geolocation Fallback
        try {
            const geoResp = await fetch('https://api.country.is/', { cache: 'no-store' });
            if (geoResp.ok) {
                const geoData = await geoResp.json();
                if (geoData && geoData.country) {
                    const c = geoData.country.toUpperCase();
                    if (c === 'RU') blockedCountry = 'RU';
                    else if (c === 'IR') blockedCountry = 'IR';
                }
            }
        } catch(e) {}

        if (blockedCountry) {
            renderBlockScreen(blockedCountry);
        }
    }

    checkNetworkGeo();
})();
