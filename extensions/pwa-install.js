// Open Publisher PWA & Desktop Download Engine (v5.9.6)
(function() {
    'use strict';

    function isDesktopApp() {
        if (typeof window !== 'undefined' && typeof window.isDesktopApp === 'function' && window.isDesktopApp !== isDesktopApp) {
            try {
                if (window.isDesktopApp()) return true;
            } catch(e) {}
        }

        // 1. Root and body class tagging (applied by wrapper or markAsDesktopClient)
        if (typeof document !== 'undefined') {
            if (document.documentElement && document.documentElement.classList.contains('is-desktop-app')) return true;
            if (document.body && (document.body.classList.contains('is-desktop-app') || document.body.classList.contains('mac-theme'))) return true;
        }

        // 2. Desktop IPC bridges & window flags
        if (typeof window !== 'undefined') {
            if (window._desktopBridgeActive || (window.desktopIPC && window.desktopIPC.isDesktop) || window._opBridgeActive || window._isDesktopClient) {
                return true;
            }
        }

        // 3. Wrapper-injected styles check (#coord-display altered by wrapper.html webview.insertCSS)
        if (typeof document !== 'undefined') {
            const coord = document.getElementById('coord-display');
            if (coord) {
                const cs = window.getComputedStyle(coord);
                if (cs && (cs.zIndex === '999999' || (cs.transform && cs.transform.includes('-15')))) {
                    return true;
                }
            }
        }

        // 4. NW.js environment detection across all platforms (Windows, macOS, Linux, FreeBSD)
        if (typeof nw !== 'undefined' && nw !== null) return true;
        if (typeof window !== 'undefined' && typeof window.nw !== 'undefined' && window.nw !== null) return true;
        if (typeof globalThis !== 'undefined' && typeof globalThis.nw !== 'undefined' && globalThis.nw !== null) return true;
        if (typeof global !== 'undefined' && typeof global.nw !== 'undefined' && global.nw !== null) return true;

        // 5. NW.js Node process versions
        if (typeof process !== 'undefined' && process && process.versions && !!(process.versions.nw || process.versions['node-webkit'] || process.versions['nw-flavor'])) return true;
        if (typeof window !== 'undefined' && window.process && window.process.versions && !!(window.process.versions.nw || window.process.versions['node-webkit'] || window.process.versions['nw-flavor'])) return true;
        if (typeof global !== 'undefined' && global.process && global.process.versions && !!(global.process.versions.nw || global.process.versions['node-webkit'])) return true;

        // 6. Electron runtime & FreeBSD standalone package
        if (typeof process !== 'undefined' && process && process.versions && !!process.versions.electron) return true;
        if (typeof window !== 'undefined' && window.process && (window.process.type || (window.process.versions && window.process.versions.electron))) return true;

        // 7. User Agent inspection (case-insensitive for OpenPublisher, nwjs, nw.js, node-webkit, Electron)
        if (typeof navigator !== 'undefined' && navigator.userAgent) {
            if (/OpenPublisher|nwjs|nw\.js|node-webkit|Electron/i.test(navigator.userAgent)) {
                return true;
            }
        }

        // 8. NW.js application protocol
        if (typeof location !== 'undefined' && location.protocol === 'chrome-extension:') {
            if (typeof chrome !== 'undefined' && (chrome.app || chrome.runtime)) return true;
        }

        // 9. NW.js GUI module
        try {
            if (typeof require === 'function' && require('nw.gui')) return true;
        } catch(e) {}

        return false;
    }

    function isStandaloneMode() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true || 
               document.referrer.includes('android-app://');
    }

    function isIOSDevice() {
        return (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) ||
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    function isMobileOrTabletBrowser() {
        const ua = navigator.userAgent || '';
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Tablet|Silk/i.test(ua)) {
            return true;
        }
        if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
            return true;
        }
        return false;
    }

    function isDesktopComputer() {
        return !isMobileOrTabletBrowser();
    }

    const PwaInstallSystem = {
        deferredPrompt: null,
        isIOS: false,
        isMobileOrTablet: false,
        isDesktop: false,
        downloadUrl: 'https://download.openpublisher.app',
        _desktopShowTimer: null,

        init: function() {
            // If already running inside installed native desktop app or standalone PWA, hide install/download buttons
            if (isDesktopApp() || isStandaloneMode()) {
                this.hideInstallButtons();
                return;
            }

            this.isIOS = isIOSDevice();
            this.isMobileOrTablet = isMobileOrTabletBrowser();
            this.isDesktop = isDesktopComputer();

            // 1. Register Service Worker for PWA installability criteria
            if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('sw.js?v=5.8.5').catch(err => {
                        console.log('OpenPublisher PWA: Service worker registration note:', err);
                    });
                });
            }

            // Install active bridge monitoring heartbeat: continuously checks for host wrapper bridge attachment
            let bridgePollCount = 0;
            const bridgePollInterval = setInterval(() => {
                bridgePollCount++;
                if (isDesktopApp()) {
                    this.hideInstallButtons();
                    clearInterval(bridgePollInterval);
                } else if (bridgePollCount >= 30) { // Poll for ~7.5 seconds
                    clearInterval(bridgePollInterval);
                }
            }, 250);

            if (this.isDesktop) {
                // On desktop computers in web mode, delay showing download buttons briefly (800ms)
                // to allow the native desktop host wrapper shell time to complete its contentload & bridge handshake.
                if (this._desktopShowTimer) clearTimeout(this._desktopShowTimer);
                this._desktopShowTimer = setTimeout(() => {
                    if (!isDesktopApp() && !isStandaloneMode()) {
                        this.showInstallButtons();
                    }
                }, 800);

                // Prevent Chromium default mini-infobar on desktop since we redirect to native download
                window.addEventListener('beforeinstallprompt', (e) => {
                    e.preventDefault();
                    this.deferredPrompt = e;
                    if (!isDesktopApp() && !isStandaloneMode()) {
                        this.showInstallButtons();
                    }
                });
            } else {
                // On Mobile and Tablets:
                // 2. Listen for Chromium beforeinstallprompt event
                window.addEventListener('beforeinstallprompt', (e) => {
                    e.preventDefault();
                    this.deferredPrompt = e;
                    this.showInstallButtons();
                    this.showMobileBanner();
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
                    const dismissed = localStorage.getItem('op_pwa_ios_dismissed');
                    const lastDismissed = dismissed ? parseInt(dismissed, 10) : 0;
                    const oneWeek = 7 * 24 * 60 * 60 * 1000;
                    if (!dismissed || (Date.now() - lastDismissed > oneWeek)) {
                        setTimeout(() => {
                            this.showMobileBanner();
                        }, 2500);
                    }
                }
            }
        },

        showInstallButtons: function() {
            // Guard: Never display download or install buttons inside native desktop client apps (NW.js, Electron, etc.)
            if (isDesktopApp() || isStandaloneMode()) {
                this.hideInstallButtons();
                return;
            }

            const titleBtn = document.getElementById('pwa-install-btn');
            if (titleBtn) {
                titleBtn.style.display = 'inline-flex';
                if (this.isDesktop) {
                    titleBtn.setAttribute('title', 'Download Open Publisher Desktop App for Windows, macOS, Linux & FreeBSD (download.openpublisher.app)');
                    titleBtn.setAttribute('aria-label', 'Download Open Publisher Desktop App');
                } else {
                    titleBtn.setAttribute('title', 'Install Open Publisher Web App');
                    titleBtn.setAttribute('aria-label', 'Install Open Publisher Web App');
                }
            }
            const ribbonBtn = document.getElementById('pwa-install-ribbon-btn');
            if (ribbonBtn) {
                ribbonBtn.style.display = 'inline-flex';
                if (this.isDesktop) {
                    ribbonBtn.innerHTML = '<i class="fas fa-desktop"></i>Download App';
                    ribbonBtn.setAttribute('title', 'Download Open Publisher for Windows, macOS, Linux & FreeBSD (download.openpublisher.app)');
                } else {
                    ribbonBtn.innerHTML = '<i class="fas fa-mobile-alt"></i>Install App';
                    ribbonBtn.setAttribute('title', 'Install Open Publisher as a Web App on your Home Screen');
                }
            }
        },

        hideInstallButtons: function() {
            if (this._desktopShowTimer) {
                clearTimeout(this._desktopShowTimer);
                this._desktopShowTimer = null;
            }
            const titleBtn = document.getElementById('pwa-install-btn');
            if (titleBtn) {
                titleBtn.style.display = 'none';
                titleBtn.style.setProperty('display', 'none', 'important');
            }
            const ribbonBtn = document.getElementById('pwa-install-ribbon-btn');
            if (ribbonBtn) {
                ribbonBtn.style.display = 'none';
                ribbonBtn.style.setProperty('display', 'none', 'important');
            }
        },

        promptInstall: function() {
            if (this.isDesktop) {
                this.openDesktopDownload();
            } else if (this.deferredPrompt) {
                // Chromium native prompt for mobile/tablet
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

        openDesktopDownload: function() {
            this.showDesktopDownloadModal();
        },

        showDesktopDownloadModal: function() {
            const baseUrl = this.downloadUrl || 'https://download.openpublisher.app';
            const url = baseUrl.includes('?') ? `${baseUrl}&in_app=true` : `${baseUrl}?in_app=true`;
            const dlHtml = `<iframe src="${url}" style="width:100%; height:100%; min-height:500px; border:none; display:block;" title="Download Open Publisher Desktop App"></iframe>`;
            
            if (typeof DialogSystem !== 'undefined') {
                DialogSystem.show('Download Open Publisher Desktop App', dlHtml, null, true);
                
                const dialogBox = document.getElementById('custom-dialog-box');
                if (dialogBox) {
                    // Decouple from flex centering so CSS resize works naturally from the top-left anchor
                    const w = Math.min(1200, Math.floor(window.innerWidth * 0.92));
                    const h = Math.floor(window.innerHeight * 0.85);
                    const left = Math.max(0, (window.innerWidth - w) / 2);
                    const top = Math.max(0, (window.innerHeight - h) / 2);
                    
                    dialogBox.style.position = 'absolute';
                    dialogBox.style.left = left + 'px';
                    dialogBox.style.top = top + 'px';
                    
                    // Set dimensions and enable native resizing
                    dialogBox.style.width = w + 'px';
                    dialogBox.style.height = '85vh';
                    dialogBox.style.maxWidth = '95vw';
                    dialogBox.style.maxHeight = '95vh';
                    dialogBox.style.resize = 'both';
                    dialogBox.style.overflow = 'hidden'; // Required for CSS resize property to work
                    
                    const body = dialogBox.querySelector('.custom-dialog-body');
                    if (body) { 
                        body.style.padding = '0'; 
                        body.style.height = 'calc(100% - 40px)'; // Account for header
                        body.style.overflow = 'hidden'; 
                    }
                    
                    // Hide the OK/Cancel footer entirely
                    const footer = dialogBox.querySelector('.custom-dialog-footer');
                    if (footer) {
                        footer.style.display = 'none';
                    }
                }
            } else {
                // Fallback in case DialogSystem is not loaded
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => { if (link.parentNode) link.parentNode.removeChild(link); }, 100);
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
                    <h3 style="margin: 0 0 8px 0; color: var(--ui-theme-color, #007670);">Open Publisher Downloads & Apps</h3>
                    <p style="margin: 0 0 16px 0; font-size: 0.88rem; color: #555; line-height: 1.5;">
                        Native desktop applications are available for <strong>Windows</strong>, <strong>macOS</strong>, <strong>Linux</strong>, and <strong>FreeBSD</strong>:
                    </p>
                    <div style="margin-bottom: 16px;">
                        <button onclick="if(window.PwaInstallSystem) window.PwaInstallSystem.showDesktopDownloadModal();" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: var(--ui-theme-color, #007670); color: #fff; border: none; border-radius: 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer;">
                            <i class="fas fa-download"></i> Open Downloads Window
                        </button>
                    </div>
                    <div style="text-align: left; background: #f4f6f8; border-radius: 10px; padding: 12px 16px; font-size: 0.85rem; color: #333; line-height: 1.8;">
                        <div>• <strong>Desktop</strong>: Download standalone native packages from <strong>download.openpublisher.app</strong>.</div>
                        <div>• <strong>Mobile / Tablet</strong>: Open your browser menu and select <strong>Add to Home screen</strong>.</div>
                    </div>
                </div>
            `;
            if (typeof DialogSystem !== 'undefined') {
                DialogSystem.show('Download & Install', html, null, true);
            }
        },

        showMobileBanner: function() {
            if (this.isDesktop) return;
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
    window.showDownloadModal = function() {
        if (window.PwaInstallSystem) {
            window.PwaInstallSystem.showDesktopDownloadModal();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PwaInstallSystem.init());
    } else {
        PwaInstallSystem.init();
    }
})();
