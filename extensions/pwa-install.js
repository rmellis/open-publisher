// Open Publisher PWA & Mobile Installation Engine (v5.4.5)
(function() {
    'use strict';

    function isDesktopApp() {
        return !!(window.desktopIPC && window.desktopIPC.isDesktop) || 
               !!window._opBridgeActive || 
               (typeof navigator !== 'undefined' && (
                   navigator.userAgent.includes('OpenPublisher') || 
                   navigator.userAgent.includes('nwjs') || 
                   navigator.userAgent.includes('Electron')
               ));
    }

    function isStandaloneMode() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true || 
               document.referrer.includes('android-app://');
    }

    function isIOSDevice() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    function isMobileBrowser() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    const PwaInstallSystem = {
        deferredPrompt: null,
        isIOS: false,
        isMobile: false,
        init: function() {
            if (isDesktopApp() || isStandaloneMode()) {
                return;
            }

            this.isIOS = isIOSDevice();
            this.isMobile = isMobileBrowser();

            // 1. Register Service Worker for PWA installability criteria
            if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('sw.js?v=5.4.5').catch(err => {
                        console.log('OpenPublisher PWA: Service worker registration note:', err);
                    });
                });
            }

            // 2. Listen for Chromium beforeinstallprompt event
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                this.deferredPrompt = e;
                this.showInstallButtons();
                if (this.isMobile) {
                    this.showMobileBanner();
                }
            });

            // 3. Listen for appinstalled event
            window.addEventListener('appinstalled', () => {
                this.deferredPrompt = null;
                this.hideInstallButtons();
                this.removeMobileBanner();
                if (typeof DialogSystem !== 'undefined') {
                    DialogSystem.alert('App Installed', 'Open Publisher has been installed successfully!');
                }
            });

            // 4. On iOS Safari, beforeinstallprompt never fires; make install accessible immediately
            if (this.isIOS) {
                this.showInstallButtons();
                // Check if user recently dismissed the banner
                const dismissed = localStorage.getItem('op_pwa_ios_dismissed');
                const lastDismissed = dismissed ? parseInt(dismissed, 10) : 0;
                const oneWeek = 7 * 24 * 60 * 60 * 1000;
                if (!dismissed || (Date.now() - lastDismissed > oneWeek)) {
                    // Slight delay after load to avoid jarring animation
                    setTimeout(() => {
                        this.showMobileBanner();
                    }, 2500);
                }
            }
        },

        showInstallButtons: function() {
            const titleBtn = document.getElementById('pwa-install-btn');
            if (titleBtn) {
                titleBtn.style.display = 'inline-flex';
            }
            const ribbonBtn = document.getElementById('pwa-install-ribbon-btn');
            if (ribbonBtn) {
                ribbonBtn.style.display = 'inline-flex';
            }
        },

        hideInstallButtons: function() {
            const titleBtn = document.getElementById('pwa-install-btn');
            if (titleBtn) titleBtn.style.display = 'none';
            const ribbonBtn = document.getElementById('pwa-install-ribbon-btn');
            if (ribbonBtn) ribbonBtn.style.display = 'none';
        },

        promptInstall: function() {
            if (this.deferredPrompt) {
                // Chromium native prompt
                this.deferredPrompt.prompt();
                this.deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        this.hideInstallButtons();
                        this.removeMobileBanner();
                    }
                    this.deferredPrompt = null;
                });
            } else if (this.isIOS) {
                this.showIOSModal();
            } else {
                this.showGenericInstallModal();
            }
        },

        showIOSModal: function() {
            const html = `
                <div style="text-align: center; padding: 10px 5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <img src="apple-touch-icon.png" alt="Open Publisher Icon" style="width: 76px; height: 76px; border-radius: 18px; box-shadow: 0 4px 14px rgba(0,0,0,0.18); margin-bottom: 12px; display: inline-block;">
                    <h3 style="margin: 0 0 6px 0; color: var(--ui-theme-color, #007670); font-size: 1.15rem; font-weight: bold;">Install Open Publisher</h3>
                    <p style="margin: 0 0 16px 0; font-size: 0.85rem; color: #555; line-height: 1.45;">
                        Install this web app to your iPad or iPhone Home Screen to enjoy full-screen editing without browser toolbars.
                    </p>
                    <div style="text-align: left; background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 12px; padding: 14px 18px; font-size: 0.88rem; color: #24292e; line-height: 1.9;">
                        <div><strong>1.</strong> Tap the <strong>Share</strong> button <i class="fas fa-share-square" style="color:#007670; font-size: 1.05rem; vertical-align: middle;"></i> in Safari's toolbar.</div>
                        <div><strong>2.</strong> Scroll down and tap <strong>Add to Home Screen</strong> <i class="fas fa-plus-square" style="color:#007670; font-size: 1.05rem; vertical-align: middle;"></i>.</div>
                        <div><strong>3.</strong> Tap <strong>Add</strong> in the top-right corner to finish.</div>
                    </div>
                </div>
            `;
            if (typeof DialogSystem !== 'undefined') {
                DialogSystem.show('Install on iOS', html, null, true);
            }
        },

        showGenericInstallModal: function() {
            const html = `
                <div style="text-align: center; padding: 10px 5px; font-family: sans-serif;">
                    <img src="apple-touch-icon.png" alt="Open Publisher Icon" style="width: 72px; height: 72px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-bottom: 12px; display: inline-block;">
                    <h3 style="margin: 0 0 8px 0; color: var(--ui-theme-color, #007670);">Install Open Publisher</h3>
                    <p style="margin: 0 0 16px 0; font-size: 0.88rem; color: #555; line-height: 1.5;">
                        To install Open Publisher as a desktop or mobile application:
                    </p>
                    <div style="text-align: left; background: #f4f6f8; border-radius: 10px; padding: 12px 16px; font-size: 0.85rem; color: #333; line-height: 1.8;">
                        <div>• In <strong>Chrome / Edge</strong>: Click the <strong>Install</strong> icon in the address bar (or Menu &gt; Install Open Publisher).</div>
                        <div>• In <strong>Safari (Mac)</strong>: File &gt; <strong>Add to Dock...</strong></div>
                        <div>• In <strong>Mobile Browsers</strong>: Open the browser menu and select <strong>Add to Home screen</strong>.</div>
                    </div>
                </div>
            `;
            if (typeof DialogSystem !== 'undefined') {
                DialogSystem.show('Install Web App', html, null, true);
            }
        },

        showMobileBanner: function() {
            if (document.getElementById('op-pwa-mobile-banner')) return;

            const banner = document.createElement('div');
            banner.id = 'op-pwa-mobile-banner';
            banner.style.cssText = `
                position: fixed;
                bottom: 16px;
                left: 50%;
                transform: translateX(-50%);
                width: calc(100% - 32px);
                max-width: 440px;
                background: #ffffff;
                color: #222222;
                border: 1px solid rgba(0,0,0,0.1);
                border-left: 5px solid var(--ui-theme-color, #007670);
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.22);
                padding: 12px 14px;
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 99999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                animation: opPwaSlideUp 0.35s ease-out;
            `;

            banner.innerHTML = `
                <style>
                    @keyframes opPwaSlideUp {
                        from { opacity: 0; transform: translate(-50%, 20px); }
                        to { opacity: 1; transform: translate(-50%, 0); }
                    }
                </style>
                <img src="apple-touch-icon.png" style="width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;" alt="Open Publisher">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 0.88rem; color: #111;">Open Publisher</div>
                    <div style="font-size: 0.76rem; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Install as app on your Home Screen</div>
                </div>
                <button id="op-pwa-banner-install-btn" style="background: var(--ui-theme-color, #007670); color: #fff; border: none; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 0.8rem; cursor: pointer; flex-shrink: 0;">Install</button>
                <button id="op-pwa-banner-close-btn" style="background: none; border: none; color: #888; font-size: 1.1rem; cursor: pointer; padding: 4px; line-height: 1; flex-shrink: 0;" title="Dismiss">&times;</button>
            `;

            document.body.appendChild(banner);

            const installBtn = banner.querySelector('#op-pwa-banner-install-btn');
            if (installBtn) {
                installBtn.addEventListener('click', () => {
                    this.promptInstall();
                });
            }

            const closeBtn = banner.querySelector('#op-pwa-banner-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.removeMobileBanner();
                    if (this.isIOS) {
                        localStorage.setItem('op_pwa_ios_dismissed', Date.now().toString());
                    }
                });
            }
        },

        removeMobileBanner: function() {
            const banner = document.getElementById('op-pwa-mobile-banner');
            if (banner) {
                banner.remove();
            }
        }
    };

    window.PwaInstallSystem = PwaInstallSystem;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PwaInstallSystem.init());
    } else {
        PwaInstallSystem.init();
    }
})();
