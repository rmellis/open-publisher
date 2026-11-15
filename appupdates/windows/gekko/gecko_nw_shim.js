/**
 * OpenPublisher Gecko NW.js & Node.js Translation Shim
 * Bridges NW.js desktop APIs and Node.js built-ins to Firefox Gecko Engine
 */
(function() {
    'use strict';

    const locHref = (window.location && window.location.href) ? window.location.href : '';
    const isChildDialogWindow = locHref.replace(/\\/g, '/').indexOf('/windows/') !== -1;
    window.isMainWindow = !isChildDialogWindow;

    // Dynamically derive file & directory paths from current location URL (portable across any machine/folder)
    function fileUriToWindowsPath(uriStr) {
        try {
            if (!uriStr || !uriStr.startsWith('file:')) return '';
            const u = new URL(uriStr);
            let p = decodeURIComponent(u.pathname || '');
            if (/^\/[A-Za-z]:/.test(p)) {
                p = p.substring(1);
            }
            return p.replace(/\//g, '\\');
        } catch(e) {
            return '';
        }
    }

    const derivedFilePath = fileUriToWindowsPath(locHref) || 'wrapper.html';
    const lastSepIdx = derivedFilePath.lastIndexOf('\\');
    const derivedDirPath = lastSepIdx > 0 ? derivedFilePath.substring(0, lastSepIdx) : '.';
    const derivedAppDir = (isChildDialogWindow && /\\windows$/i.test(derivedDirPath))
        ? derivedDirPath.replace(/\\windows$/i, '')
        : derivedDirPath;

    let cachedSysPaths = null;
    function getSysPaths() {
        if (cachedSysPaths && cachedSysPaths.appDir) return cachedSysPaths;
        try {
            if (window.GeckoNative && typeof window.GeckoNative.getSystemPathsJSON === 'function') {
                const parsed = JSON.parse(window.GeckoNative.getSystemPathsJSON() || '{}');
                if (parsed && parsed.appDir) {
                    cachedSysPaths = parsed;
                    return cachedSysPaths;
                }
            }
        } catch(e) {}
        return cachedSysPaths || {
            appDir: derivedAppDir,
            homeDir: derivedAppDir,
            tempDir: derivedAppDir + '\\profile\\Temp',
            desktopDir: derivedAppDir,
            dataDir: derivedAppDir + '\\profile\\UserData',
            launchFile: ''
        };
    }

    function getAppDir() {
        return getSysPaths().appDir || derivedAppDir;
    }

    // Detect launch file passed via ?open=... query param or OP_LAUNCH_FILE environment variable
    let initialArgv = [];
    try {
        const params = new URLSearchParams(window.location ? window.location.search : '');
        const openParam = params.get('open');
        if (openParam) {
            initialArgv.push(openParam);
        } else {
            const sp = getSysPaths();
            if (sp.launchFile) initialArgv.push(sp.launchFile);
        }
        const spInit = getSysPaths();
        if (spInit && spInit.firstRun) {
            initialArgv.push('--firstrun');
        }
    } catch(e) {}

    // Track async guest eval callbacks for webview.executeScript(details, cb)
    let evalReqCounter = 0;
    const pendingEvalCallbacks = new Map();

    // 0. Immediate Prototype Polyfills for HTMLIFrameElement & HTMLInputElement
    if (typeof HTMLIFrameElement !== 'undefined') {
        HTMLIFrameElement.prototype.executeScript = function(details, cb) {
            const code = (details && details.code) ? details.code : details;
            if (typeof cb === 'function') {
                const reqId = ++evalReqCounter;
                const timer = setTimeout(function() {
                    if (pendingEvalCallbacks.has(reqId)) {
                        pendingEvalCallbacks.delete(reqId);
                        try { cb([]); } catch(e) {}
                    }
                }, 500);
                pendingEvalCallbacks.set(reqId, function(val) {
                    clearTimeout(timer);
                    try { cb([val]); } catch(e) {}
                });
                try {
                    if (window.GeckoNative && typeof window.GeckoNative.executeInGuest === 'function') {
                        window.GeckoNative.executeInGuest(code, reqId);
                        return;
                    }
                } catch(e) {}
                pendingEvalCallbacks.delete(reqId);
                clearTimeout(timer);
                setTimeout(function() { try { cb([]); } catch(e) {} }, 0);
                return;
            }
            try {
                if (window.GeckoNative && typeof window.GeckoNative.executeInGuest === 'function') {
                    window.GeckoNative.executeInGuest(code, 0);
                } else if (this.contentWindow) {
                    this.contentWindow.postMessage({ type: 'EVAL_CODE', code: code }, '*');
                }
            } catch(e) {}
        };

        HTMLIFrameElement.prototype.insertCSS = function(details, cb) {
            const code = (details && details.code) ? details.code : details;
            try {
                if (window.GeckoNative && typeof window.GeckoNative.insertGuestCSS === 'function') {
                    window.GeckoNative.insertGuestCSS(code);
                }
            } catch(e) {}
            if (cb) setTimeout(function() { cb(); }, 0);
        };

        HTMLIFrameElement.prototype.reload = function() {
            try { this.src = this.src; } catch(e) {}
        };

        HTMLIFrameElement.prototype.showDevTools = function() {
            console.log('[Gecko] DevTools requested');
        };
    }

    // Intercept <input type="file" nwsaveas="..."> and <input type="file" nwdirectory> to open native Windows Save As / Folder dialogs
    let isShimPickerBusy = false;
    if (typeof HTMLInputElement !== 'undefined' && HTMLInputElement.prototype.click) {
        const origInputClick = HTMLInputElement.prototype.click;
        HTMLInputElement.prototype.click = function() {
            if (this && this.type === 'file' && (this.hasAttribute('nwsaveas') || this.hasAttribute('nwdirectory'))) {
                if (isShimPickerBusy) return;
                if (window.GeckoNative && typeof window.GeckoNative.pickFile === 'function') {
                    isShimPickerBusy = true;
                    const inputEl = this;
                    try {
                        const isDir = inputEl.hasAttribute('nwdirectory');
                        const defaultName = inputEl.getAttribute('nwsaveas') || '';
                        const workingDir = inputEl.getAttribute('nwworkingdir') || '';
                        const chosenPath = window.GeckoNative.pickFile(JSON.stringify({
                            mode: isDir ? 'folder' : 'save',
                            defaultName: defaultName,
                            accept: inputEl.accept || '',
                            workingDir: workingDir
                        }));
                        if (chosenPath) {
                            const baseName = chosenPath.split(/[\\/]/).pop() || chosenPath;
                            try {
                                Object.defineProperty(inputEl, 'value', {
                                    value: chosenPath,
                                    configurable: true,
                                    writable: true
                                });
                            } catch(ve) {}
                            try {
                                Object.defineProperty(inputEl, 'files', {
                                    value: [{ path: chosenPath, name: baseName }],
                                    configurable: true
                                });
                            } catch(fe) {}
                            inputEl.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    } finally {
                        setTimeout(function() { isShimPickerBusy = false; }, 150);
                    }
                    return;
                }
            }
            return origInputClick.apply(this, arguments);
        };
    }

    // Hook console to forward important messages to GeckoNative.log
    const origConsoleLog = console.log;
    const origConsoleWarn = console.warn;
    const origConsoleError = console.error;

    console.log = function() {
        origConsoleLog.apply(console, arguments);
        try {
            if (window.GeckoNative && typeof window.GeckoNative.log === 'function') {
                const msg = Array.prototype.slice.call(arguments).map(String).join(' ');
                if (!msg.includes('[Wrapper -> IPC]') && !msg.includes('[IPC -> Wrapper]')) {
                    window.GeckoNative.log("[Console.log] " + msg);
                }
            }
        } catch(e) {}
    };

    console.warn = function() {
        origConsoleWarn.apply(console, arguments);
        try {
            if (window.GeckoNative && typeof window.GeckoNative.log === 'function') {
                window.GeckoNative.log("[Console.warn] " + Array.prototype.slice.call(arguments).map(String).join(' '));
            }
        } catch(e) {}
    };

    console.error = function() {
        origConsoleError.apply(console, arguments);
        try {
            if (window.GeckoNative && typeof window.GeckoNative.log === 'function') {
                window.GeckoNative.log("[Console.error] " + Array.prototype.slice.call(arguments).map(String).join(' '));
            }
        } catch(e) {}
    };

    window.addEventListener('error', function(e) {
        try {
            if (window.GeckoNative && typeof window.GeckoNative.log === 'function') {
                window.GeckoNative.log("[Window Error] " + e.message + " in " + e.filename + ":" + e.lineno);
            }
        } catch(err) {}
    });

    window.addEventListener('unhandledrejection', function(e) {
        try {
            if (window.GeckoNative && typeof window.GeckoNative.log === 'function') {
                window.GeckoNative.log("[Window UnhandledRejection] " + e.reason);
            }
        } catch(err) {}
    });

    try {
        if (!localStorage.getItem('openpublisher_firstrun_completed')) {
            localStorage.setItem('openpublisher_firstrun_completed', 'true');
        }
    } catch(e) {}

    window.global = window;
    window.__dirname = derivedDirPath;
    window.__filename = derivedFilePath;

    // Buffer Polyfill
    if (typeof window.Buffer === 'undefined') {
        function BufferPolyfill(arg, encoding) {
            let uint8;
            if (typeof arg === 'number') {
                uint8 = new Uint8Array(arg);
            } else if (typeof arg === 'string') {
                if (encoding === 'base64') {
                    const binStr = atob(arg.replace(/\s+/g, ''));
                    uint8 = new Uint8Array(binStr.length);
                    for (let i = 0; i < binStr.length; i++) {
                        uint8[i] = binStr.charCodeAt(i);
                    }
                } else if (encoding === 'hex') {
                    uint8 = new Uint8Array(arg.length / 2);
                    for (let i = 0; i < arg.length; i += 2) {
                        uint8[i / 2] = parseInt(arg.substr(i, 2), 16);
                    }
                } else {
                    uint8 = new TextEncoder().encode(arg);
                }
            } else if (arg instanceof Uint8Array || Array.isArray(arg)) {
                uint8 = new Uint8Array(arg);
            } else {
                uint8 = new Uint8Array(0);
            }

            uint8.readUInt32BE = function(offset) {
                return ((this[offset] << 24) | (this[offset + 1] << 16) | (this[offset + 2] << 8) | this[offset + 3]) >>> 0;
            };
            uint8.readUInt16BE = function(offset) {
                return (this[offset] << 8) | this[offset + 1];
            };
            uint8.readUInt32LE = function(offset) {
                return (this[offset] | (this[offset + 1] << 8) | (this[offset + 2] << 16) | (this[offset + 3] << 24)) >>> 0;
            };
            uint8.readUInt16LE = function(offset) {
                return this[offset] | (this[offset + 1] << 8);
            };
            uint8.toString = function(enc) {
                if (enc === 'base64') {
                    let chunks = [];
                    const chunkSize = 0x8000;
                    for (let i = 0; i < this.length; i += chunkSize) {
                        chunks.push(String.fromCharCode.apply(null, this.subarray(i, i + chunkSize)));
                    }
                    return btoa(chunks.join(''));
                } else if (enc === 'hex') {
                    let hex = '';
                    for (let i = 0; i < this.length; i++) hex += this[i].toString(16).padStart(2, '0');
                    return hex;
                }
                return new TextDecoder().decode(this);
            };
            return uint8;
        }

        BufferPolyfill.from = function(data, enc) { return BufferPolyfill(data, enc); };
        BufferPolyfill.alloc = function(size) { return BufferPolyfill(size); };
        BufferPolyfill.isBuffer = function(obj) { return obj instanceof Uint8Array; };
        BufferPolyfill.byteLength = function(str, enc) { return BufferPolyfill(str, enc).length; };

        window.Buffer = BufferPolyfill;
    }

    // 1. Process Environment Polyfill (100% dynamic paths)
    if (typeof window.process === 'undefined') {
        window.process = {
            platform: 'win32',
            arch: 'x64',
            argv: ['OpenPublisher.exe'].concat(initialArgv),
            get execPath() {
                return getAppDir() + '\\OpenPublisher.exe';
            },
            cwd: function() {
                return getAppDir();
            },
            pid: 4096,
            versions: {
                node: '20.10.0',
                nw: '0.80.0',
                gecko: '115.21.0'
            },
            memoryUsage: function() {
                return {
                    rss: 128 * 1024 * 1024,
                    heapTotal: 96 * 1024 * 1024,
                    heapUsed: 54 * 1024 * 1024,
                    external: 12 * 1024 * 1024
                };
            },
            uptime: function() {
                return performance.now() / 1000;
            },
            on: function(event, handler) {
                if (event === 'uncaughtException') {
                    window.addEventListener('error', function(e) {
                        handler(e.error || e);
                    });
                }
            },
            kill: function(pid) {},
            spawn: function() { return null; }
        };
    }

    function syncMaximizedUI(isMax) {
        nwWindowInstance.isMaximized = Boolean(isMax);
        if (document.body) {
            document.body.classList.toggle('maximized', Boolean(isMax));
        }
        const winMaxBtn = document.getElementById('win-max');
        if (winMaxBtn) {
            if (isMax) {
                winMaxBtn.title = 'Restore';
                winMaxBtn.innerHTML = '<svg viewBox="0 0 12 12"><rect x="3.5" y="1.5" width="7" height="7"></rect><path d="M1.5 3.5h7v7h-7z" fill="var(--bg-color, #146F6E)" stroke="var(--accent-color, #ffffff)"></path></svg>';
            } else {
                winMaxBtn.title = 'Maximize';
                winMaxBtn.innerHTML = '<svg viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8"></rect></svg>';
            }
        }
    }

    // 2. NW.js (window.nw) API Polyfill
    let isSelfClosing = false;
    const nwWindowInstance = {
        minimize: function() {
            if (window.GeckoNative && typeof window.GeckoNative.minimize === 'function') {
                window.GeckoNative.minimize();
            } else {
                window.blur();
            }
        },
        maximize: function() {
            if (window.GeckoNative && typeof window.GeckoNative.maximize === 'function') {
                window.GeckoNative.maximize();
            } else {
                window.moveTo(0, 0);
                window.resizeTo(screen.availWidth, screen.availHeight);
            }
            syncMaximizedUI(true);
            this._emit('maximize');
        },
        unmaximize: function() {
            if (window.GeckoNative && typeof window.GeckoNative.restore === 'function') {
                window.GeckoNative.restore();
            } else {
                window.resizeTo(1320, 760);
            }
            syncMaximizedUI(false);
            this._emit('restore');
        },
        restore: function() {
            this.unmaximize();
        },
        close: function(force) {
            if (!force && this._events['close'] && this._events['close'].length > 0 && !isSelfClosing) {
                isSelfClosing = true;
                try {
                    this._emit('close');
                } finally {
                    isSelfClosing = false;
                }
                return;
            }
            if (window.GeckoNative && typeof window.GeckoNative.close === 'function') {
                window.GeckoNative.close();
            } else {
                window.close();
            }
        },
        setAlwaysOnTop: function(bool) {
            if (window.GeckoNative && typeof window.GeckoNative.setAlwaysOnTop === 'function') {
                window.GeckoNative.setAlwaysOnTop(Boolean(bool));
            }
        },
        show: function() { window.focus(); },
        hide: function() { window.blur(); },
        focus: function() { window.focus(); },
        blur: function() { window.blur(); },
        resizeTo: function(w, h) {
            if (window.GeckoNative && typeof window.GeckoNative.resizeTo === 'function') {
                window.GeckoNative.resizeTo(w, h);
            } else {
                window.resizeTo(w, h);
            }
        },
        moveTo: function(x, y) {
            if (window.GeckoNative && typeof window.GeckoNative.moveTo === 'function') {
                window.GeckoNative.moveTo(x, y);
            } else {
                window.moveTo(x, y);
            }
        },
        moveBy: function(dx, dy) {
            window.moveBy(dx, dy);
        },
        enterFullscreen: function() {
            if (document.documentElement && document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        },
        leaveFullscreen: function() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        },
        requestAttention: function(bool) {},
        setShadow: function(bool) {},
        showDevTools: function() {},
        window: window,
        menu: null,
        capturePage: function(cb) { if (cb) cb(''); },
        print: function() { window.print(); },
        setProgressBar: function(p) {},
        setIgnoreMouseEvents: function(b) {},
        isMaximized: false,
        get x() { return typeof window.screenX === 'number' ? window.screenX : 100; },
        set x(v) {},
        get y() { return typeof window.screenY === 'number' ? window.screenY : 100; },
        set y(v) {},
        get width() { return window.outerWidth || window.innerWidth || 1320; },
        set width(v) {},
        get height() { return window.outerHeight || window.innerHeight || 760; },
        set height(v) {},
        _events: {},
        on: function(event, handler) {
            if (typeof handler !== 'function') return this;
            if (!this._events[event]) this._events[event] = [];
            this._events[event].push(handler);
            return this;
        },
        once: function(event, handler) {
            if (typeof handler !== 'function') return this;
            const self = this;
            function wrapped() {
                self.removeListener(event, wrapped);
                handler.apply(self, arguments);
            }
            return this.on(event, wrapped);
        },
        removeListener: function(event, handler) {
            if (!this._events[event]) return this;
            this._events[event] = this._events[event].filter(function(h) { return h !== handler; });
            return this;
        },
        removeAllListeners: function(event) {
            if (event) {
                delete this._events[event];
            } else {
                this._events = {};
            }
            return this;
        },
        _emit: function(event, data) {
            if (this._events[event]) {
                const list = this._events[event].slice();
                for (let i = 0; i < list.length; i++) {
                    try { list[i].call(this, data); } catch(e) {}
                }
            }
        }
    };

    const openChildWindows = [];
    let childWinSeq = 0;

    function createChildWindowStub(w, h, left, top) {
        const handlers = {};
        return {
            window: null,
            on: function(ev, fn) { if (typeof fn === 'function') { (handlers[ev] = handlers[ev] || []).push(fn); } return this; },
            once: function(ev, fn) { return this; },
            removeListener: function(ev, fn) { return this; },
            removeAllListeners: function(ev) { if (ev) delete handlers[ev]; else { for (let k in handlers) delete handlers[k]; } return this; },
            _emit: function() {},
            show: function() {},
            hide: function() {},
            focus: function() {},
            blur: function() {},
            close: function() {},
            resizeTo: function(nw, nh) { this.width = nw; this.height = nh; },
            moveTo: function(nx, ny) { this.x = nx; this.y = ny; },
            moveBy: function() {},
            setAlwaysOnTop: function() {},
            setIgnoreMouseEvents: function() {},
            enterFullscreen: function() {},
            leaveFullscreen: function() {},
            maximize: function() {},
            unmaximize: function() {},
            minimize: function() {},
            restore: function() {},
            isMaximized: false,
            x: left,
            y: top,
            width: w,
            height: h
        };
    }

    const _nativeWindowOpen = window.open.bind(window);
    window.open = function(url, target, features) {
        const u = String(url || '').trim();
        if (u && (u.indexOf('http://') === 0 || u.indexOf('https://') === 0 || u.indexOf('mailto:') === 0)) {
            if (window.GeckoNative && typeof window.GeckoNative.openExternal === 'function') {
                window.GeckoNative.openExternal(u);
                return { closed: false, focus: function() {}, blur: function() {}, close: function() {} };
            }
        }
        return _nativeWindowOpen(url, target, features);
    };

    window.nw = {
        Window: {
            get: function() {
                return nwWindowInstance;
            },
            getAll: function(cb) {
                const list = [nwWindowInstance];
                if (window.opener && !window.opener.closed && window.opener.nw && window.opener.nw.Window) {
                    try { list.unshift(window.opener.nw.Window.get()); } catch(e) {}
                }
                for (let i = openChildWindows.length - 1; i >= 0; i--) {
                    const cw = openChildWindows[i];
                    if (cw && cw.window && !cw.window.closed) list.push(cw);
                    else openChildWindows.splice(i, 1);
                }
                if (cb) cb(list);
                return list;
            },
            open: function(url, options, cb) {
                options = options || {};
                const w = options.width || 840;
                const h = options.height || 640;
                const left = options.x !== undefined ? Math.round(options.x) : Math.max(0, Math.round((screen.availWidth - w) / 2));
                const top = options.y !== undefined ? Math.round(options.y) : Math.max(0, Math.round((screen.availHeight - h) / 2));

                if (options.show === false) {
                    const stub = createChildWindowStub(w, h, left, top);
                    if (cb) {
                        setTimeout(function() {
                            try { cb(stub); } catch(e) {}
                        }, 10);
                    }
                    return stub;
                }

                let targetUrl = String(url || '');
                if (targetUrl &&
                    !targetUrl.startsWith('http://') &&
                    !targetUrl.startsWith('https://') &&
                    !targetUrl.startsWith('file://') &&
                    !targetUrl.startsWith('data:') &&
                    !targetUrl.startsWith('blob:') &&
                    !targetUrl.startsWith('about:') &&
                    !targetUrl.startsWith('chrome:')) {
                    let base = window.location.href.split('?')[0].split('#')[0];
                    let baseDir = base.substring(0, base.lastIndexOf('/') + 1);
                    targetUrl = baseDir + targetUrl.replace(/^[\/\\]+/, '');
                }

                const feats = 'width=' + w + ',height=' + h + ',left=' + left + ',top=' + top + ',resizable=' + (options.resizable === false ? 'no' : 'yes') + ',scrollbars=yes';
                const winName = 'op_child_' + (++childWinSeq);

                try {
                    if (window.GeckoNative && typeof window.GeckoNative.queueChildWindow === 'function') {
                        window.GeckoNative.queueChildWindow(targetUrl, w, h, left, top, Boolean(options.always_on_top));
                    }
                } catch(qErr) {}

                let rawWin = null;
                try {
                    rawWin = _nativeWindowOpen(targetUrl, winName, feats);
                } catch(e) {
                    console.error('nw.Window.open error:', e);
                }

                const handlers = {};
                let isClosed = false;
                let isEmittingClose = false;

                const childInst = {
                    window: rawWin,
                    on: function(event, handler) {
                        if (typeof handler !== 'function') return this;
                        if (!handlers[event]) handlers[event] = [];
                        handlers[event].push(handler);
                        if (event === 'loaded' && rawWin && rawWin.document && (rawWin.document.readyState === 'complete' || rawWin.document.readyState === 'interactive') && rawWin.location && rawWin.location.href !== 'about:blank') {
                            setTimeout(function() { try { handler.call(childInst); } catch(e) {} }, 30);
                        }
                        return this;
                    },
                    once: function(event, handler) {
                        if (typeof handler !== 'function') return this;
                        const self = this;
                        function wrapped() {
                            self.removeListener(event, wrapped);
                            handler.apply(self, arguments);
                        }
                        return this.on(event, wrapped);
                    },
                    removeListener: function(event, handler) {
                        if (!handlers[event]) return this;
                        handlers[event] = handlers[event].filter(function(h) { return h !== handler; });
                        return this;
                    },
                    removeAllListeners: function(event) {
                        if (event) {
                            delete handlers[event];
                        } else {
                            for (let k in handlers) delete handlers[k];
                        }
                        return this;
                    },
                    _emit: function(event, data) {
                        if (handlers[event]) {
                            const list = handlers[event].slice();
                            for (let i = 0; i < list.length; i++) {
                                try { list[i].call(childInst, data); } catch(e) {}
                            }
                        }
                    },
                    show: function() {
                        try { if (rawWin && !rawWin.closed) rawWin.focus(); } catch(e) {}
                    },
                    hide: function() {
                        try { if (rawWin && !rawWin.closed) rawWin.blur(); } catch(e) {}
                    },
                    focus: function() {
                        try { if (rawWin && !rawWin.closed) rawWin.focus(); } catch(e) {}
                    },
                    blur: function() {
                        try { if (rawWin && !rawWin.closed) rawWin.blur(); } catch(e) {}
                    },
                    close: function(force) {
                        if (isClosed) return;
                        if (!force && handlers['close'] && handlers['close'].length > 0 && !isEmittingClose) {
                            isEmittingClose = true;
                            try {
                                this._emit('close');
                            } finally {
                                isEmittingClose = false;
                            }
                            return;
                        }
                        isClosed = true;
                        try {
                            if (rawWin && !rawWin.closed) {
                                if (rawWin.GeckoNative && typeof rawWin.GeckoNative.close === 'function') {
                                    rawWin.GeckoNative.close();
                                } else {
                                    rawWin.close();
                                }
                            }
                        } catch(e) {}
                    },
                    resizeTo: function(nw, nh) {
                        this.width = nw;
                        this.height = nh;
                        try { if (rawWin && !rawWin.closed) rawWin.resizeTo(nw, nh); } catch(e) {}
                    },
                    moveTo: function(nx, ny) {
                        this.x = nx;
                        this.y = ny;
                        try { if (rawWin && !rawWin.closed) rawWin.moveTo(nx, ny); } catch(e) {}
                    },
                    moveBy: function(dx, dy) {
                        try { if (rawWin && !rawWin.closed) rawWin.moveBy(dx, dy); } catch(e) {}
                    },
                    setAlwaysOnTop: function(bool) {
                        try {
                            if (rawWin && !rawWin.closed && rawWin.GeckoNative && typeof rawWin.GeckoNative.setAlwaysOnTop === 'function') {
                                rawWin.GeckoNative.setAlwaysOnTop(Boolean(bool));
                            }
                        } catch(e) {}
                    },
                    setIgnoreMouseEvents: function() {},
                    enterFullscreen: function() {
                        try { if (rawWin && rawWin.document.documentElement.requestFullscreen) rawWin.document.documentElement.requestFullscreen(); } catch(e) {}
                    },
                    leaveFullscreen: function() {
                        try { if (rawWin && rawWin.document.exitFullscreen) rawWin.document.exitFullscreen(); } catch(e) {}
                    },
                    maximize: function() {
                        try {
                            if (rawWin && !rawWin.closed) {
                                if (rawWin.GeckoNative && rawWin.GeckoNative.maximize) rawWin.GeckoNative.maximize();
                                else { rawWin.moveTo(0, 0); rawWin.resizeTo(screen.availWidth, screen.availHeight); }
                            }
                        } catch(e) {}
                    },
                    unmaximize: function() {
                        try {
                            if (rawWin && !rawWin.closed) {
                                if (rawWin.GeckoNative && rawWin.GeckoNative.restore) rawWin.GeckoNative.restore();
                                else rawWin.resizeTo(w, h);
                            }
                        } catch(e) {}
                    },
                    minimize: function() {
                        try { if (rawWin && !rawWin.closed && rawWin.GeckoNative && rawWin.GeckoNative.minimize) rawWin.GeckoNative.minimize(); } catch(e) {}
                    },
                    restore: function() { this.unmaximize(); },
                    isMaximized: false,
                    get x() { try { return (rawWin && !rawWin.closed) ? rawWin.screenX : left; } catch(e) { return left; } },
                    set x(v) {},
                    get y() { try { return (rawWin && !rawWin.closed) ? rawWin.screenY : top; } catch(e) { return top; } },
                    set y(v) {},
                    get width() { try { return (rawWin && !rawWin.closed) ? (rawWin.outerWidth || w) : w; } catch(e) { return w; } },
                    set width(v) {},
                    get height() { try { return (rawWin && !rawWin.closed) ? (rawWin.outerHeight || h) : h; } catch(e) { return h; } },
                    set height(v) {}
                };

                if (rawWin) {
                    openChildWindows.push(childInst);
                    try {
                        rawWin.mainWin = window;
                        let loadedFired = false;

                        const ensureChildNavigation = function() {
                            try {
                                if (!rawWin || rawWin.closed || loadedFired) return;
                                const curHref = rawWin.location ? String(rawWin.location.href || '') : '';
                                if (!curHref || curHref === 'about:blank') {
                                    rawWin.location.replace(targetUrl);
                                }
                            } catch(e) {}
                        };
                        setTimeout(ensureChildNavigation, 280);
                        setTimeout(ensureChildNavigation, 600);
                        setTimeout(ensureChildNavigation, 1000);

                        const emitChildCloseOnce = function() {
                            if (!isClosed && !isEmittingClose) {
                                isEmittingClose = true;
                                try { childInst._emit('close'); } finally { isEmittingClose = false; }
                                isClosed = true;
                            }
                        };

                        const onChildReady = function() {
                            if (loadedFired) return;
                            try {
                                if (!rawWin || rawWin.closed) return;
                                const curHref = rawWin.location ? String(rawWin.location.href || '') : '';
                                if (!curHref || curHref === 'about:blank') return;
                                if (!rawWin.document || (rawWin.document.readyState !== 'interactive' && rawWin.document.readyState !== 'complete')) return;
                            } catch(e) {
                                return;
                            }
                            loadedFired = true;
                            try {
                                rawWin.mainWin = window;
                                rawWin.resizeTo(w, h);
                                rawWin.moveTo(left, top);
                                if (options.always_on_top && rawWin.GeckoNative && typeof rawWin.GeckoNative.setAlwaysOnTop === 'function') {
                                    rawWin.GeckoNative.setAlwaysOnTop(true);
                                }
                                rawWin.addEventListener('unload', function() {
                                    try {
                                        if (rawWin.location && rawWin.location.href === 'about:blank') return;
                                    } catch(e) {}
                                    emitChildCloseOnce();
                                });
                            } catch(e) {}
                            childInst._emit('loaded');
                        };

                        let readyChecks = 0;
                        const readyTimer = setInterval(function() {
                            readyChecks++;
                            if (!rawWin || rawWin.closed) {
                                clearInterval(readyTimer);
                                emitChildCloseOnce();
                                return;
                            }
                            onChildReady();
                            if (loadedFired || readyChecks > 120) {
                                clearInterval(readyTimer);
                            }
                        }, 50);

                        const closedWatchTimer = setInterval(function() {
                            if (isClosed) {
                                clearInterval(closedWatchTimer);
                                return;
                            }
                            try {
                                if (!rawWin || rawWin.closed) {
                                    clearInterval(closedWatchTimer);
                                    emitChildCloseOnce();
                                }
                            } catch(e) {}
                        }, 250);
                    } catch(e) {}
                }

                if (cb) {
                    setTimeout(function() {
                        try { cb(childInst); } catch(cbErr) { console.error('nw.Window.open callback error:', cbErr); }
                    }, 20);
                }
                return childInst;
            }
        },
        App: {
            get dataPath() {
                return getSysPaths().dataDir || (getAppDir() + '\\profile\\UserData');
            },
            argv: initialArgv.slice(),
            fullArgv: initialArgv.slice(),
            quit: function() {
                if (window.GeckoNative && typeof window.GeckoNative.quit === 'function') {
                    window.GeckoNative.quit();
                } else if (window.GeckoNative && typeof window.GeckoNative.close === 'function') {
                    window.GeckoNative.close();
                } else {
                    window.close();
                }
            },
            clearCache: function() {},
            _events: {},
            on: function(event, handler) {
                if (!this._events[event]) this._events[event] = [];
                this._events[event].push(handler);
            },
            _emit: function(event, data) {
                if (this._events[event]) {
                    for (let i = 0; i < this._events[event].length; i++) {
                        try { this._events[event][i](data); } catch(e) {}
                    }
                }
            },
            registerGlobalHotKey: function(shortcut) {},
            unregisterGlobalHotKey: function(shortcut) {}
        },
        Shell: {
            openExternal: function(url) {
                if (window.GeckoNative && typeof window.GeckoNative.openExternal === 'function') {
                    window.GeckoNative.openExternal(String(url || ''));
                }
            },
            openItem: function(filePath) {
                if (window.GeckoNative && typeof window.GeckoNative.showItemInFolder === 'function') {
                    window.GeckoNative.showItemInFolder(filePath);
                }
            },
            showItemInFolder: function(filePath) {
                if (window.GeckoNative && typeof window.GeckoNative.showItemInFolder === 'function') {
                    window.GeckoNative.showItemInFolder(filePath);
                }
            }
        },
        Clipboard: {
            get: function() {
                return {
                    get: function(type) {
                        if (type === 'png' || type === 'jpeg' || type === 'image/png' || type === 'image/jpeg') {
                            if (window.GeckoNative && typeof window.GeckoNative.getClipboardImage === 'function') {
                                return window.GeckoNative.getClipboardImage(type) || '';
                            }
                            return '';
                        }
                        if (window.GeckoNative && typeof window.GeckoNative.getClipboardText === 'function') {
                            let txt = window.GeckoNative.getClipboardText();
                            if (txt) return txt;
                        }
                        return window._opCachedClipboardText || '';
                    },
                    set: function(text, type) {
                        window._opCachedClipboardText = text;
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(text).catch(function() {});
                        }
                    }
                };
            }
        },
        Screen: {
            Init: function() {},
            screens: [
                {
                    bounds: {
                        x: 0,
                        y: 0,
                        width: window.screen.availWidth || 1920,
                        height: window.screen.availHeight || 1080
                    },
                    work_area: {
                        x: 0,
                        y: 0,
                        width: window.screen.availWidth || 1920,
                        height: window.screen.availHeight || 1080
                    }
                }
            ]
        },
        Shortcut: function(opts) {
            this.key = opts.key;
            this.active = opts.active;
            this.failed = opts.failed;
        },
        MenuItem: function(opts) {
            Object.assign(this, opts);
        },
        Menu: function() {
            this.items = [];
            this.append = function(item) { this.items.push(item); };
            this.insert = function(item, idx) { this.items.splice(idx, 0, item); };
            this.remove = function(item) {
                const i = this.items.indexOf(item);
                if (i > -1) this.items.splice(i, 1);
            };
            this.popup = function(x, y) {};
        },
        Tray: function(opts) {
            this.title = opts && opts.title;
            this.menu = null;
            this.on = function(ev, fn) {};
            this.remove = function() {};
        }
    };

    // 3. Node.js built-ins (100% dynamic paths + real disk fs via GeckoNative.fsOp)
    const pathShim = {
        sep: '\\',
        delimiter: ';',
        join: function() {
            const parts = [];
            for (let i = 0; i < arguments.length; i++) {
                if (arguments[i]) parts.push(String(arguments[i]));
            }
            return parts.join('\\').replace(/[\/\\]+/g, '\\');
        },
        resolve: function() {
            const joined = this.join.apply(this, arguments);
            if (/^[A-Za-z]:\\/.test(joined) || joined.startsWith('\\\\')) return joined;
            return this.join(getAppDir(), joined);
        },
        normalize: function(p) { return String(p || '').replace(/[\/\\]+/g, '\\'); },
        basename: function(p, ext) {
            const parts = String(p || '').split(/[\/\\]/);
            let base = parts.pop() || '';
            if (ext && base.toLowerCase().endsWith(String(ext).toLowerCase())) {
                base = base.substring(0, base.length - ext.length);
            }
            return base;
        },
        dirname: function(p) {
            const parts = String(p || '').split(/[\/\\]/);
            parts.pop();
            return parts.join('\\') || '.';
        },
        extname: function(p) {
            const base = this.basename(p);
            const idx = base.lastIndexOf('.');
            return idx > 0 ? base.substring(idx) : '';
        }
    };

    const osShim = {
        platform: function() { return 'win32'; },
        type: function() { return 'Windows_NT'; },
        arch: function() { return 'x64'; },
        hostname: function() { return getSysPaths().hostname || 'localhost'; },
        homedir: function() { return getSysPaths().homeDir || getAppDir(); },
        tmpdir: function() { return getSysPaths().tempDir || (getAppDir() + '\\profile\\Temp'); },
        totalmem: function() { return 16 * 1024 * 1024 * 1024; },
        freemem: function() { return 8 * 1024 * 1024 * 1024; },
        release: function() { return '10.0.19045'; },
        cpus: function() {
            return [
                { model: 'Intel(R) Core(TM) Processor', speed: 3000, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } },
                { model: 'Intel(R) Core(TM) Processor', speed: 3000, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } }
            ];
        },
        constants: {
            priority: { PRIORITY_LOW: 19, PRIORITY_BELOW_NORMAL: 10, PRIORITY_NORMAL: 0, PRIORITY_ABOVE_NORMAL: -10, PRIORITY_HIGH: -19, PRIORITY_HIGHEST: -20 }
        },
        networkInterfaces: function() {
            const ip = getSysPaths().localIp || '127.0.0.1';
            const result = {
                'Loopback': [{ address: '127.0.0.1', family: 'IPv4', internal: true }]
            };
            if (ip && ip !== '127.0.0.1') {
                result['Ethernet'] = [{ address: ip, family: 'IPv4', internal: false }];
            }
            return result;
        }
    };

    const cryptoShim = {
        randomBytes: function(n) {
            const arr = new Uint8Array(n);
            window.crypto.getRandomValues(arr);
            return arr;
        },
        createHash: function(algo) {
            let buffer = '';
            return {
                update: function(data) { buffer += data; return this; },
                digest: function(enc) {
                    let h = 0;
                    for (let i = 0; i < buffer.length; i++) {
                        h = ((h << 5) - h) + buffer.charCodeAt(i);
                        h |= 0;
                    }
                    return Math.abs(h).toString(16).padStart(32, '0');
                }
            };
        }
    };

    // Resolve paths to full Windows filesystem paths for GeckoNative.fsOp
    function resolveDiskPath(rawPath) {
        let p = pathShim.normalize(rawPath);
        if (!p) return '';
        if (/^[A-Za-z]:\\/.test(p) || p.startsWith('\\\\')) return p;
        if (/^[A-Za-z]:$/.test(p)) return p + '\\';
        if (p === '.' || p === '.\\') return getAppDir();
        if (p.startsWith('.\\')) p = p.substring(2);
        return pathShim.join(getAppDir(), p);
    }

    function callNativeFs(reqObj) {
        if (window.GeckoNative && typeof window.GeckoNative.fsOp === 'function') {
            try {
                const raw = window.GeckoNative.fsOp(JSON.stringify(reqObj));
                return JSON.parse(raw || '{"ok":false}');
            } catch(e) {
                return { ok: false, err: String(e) };
            }
        }
        return null;
    }

    const memFsFallback = new Map();
    const B64_PREFIX = '__op_b64__:';

    function fsGetRaw(filePath) {
        const key = 'op_fs_' + filePath;
        if (memFsFallback.has(key)) return memFsFallback.get(key);
        try { return localStorage.getItem(key); } catch(e) { return null; }
    }

    function fsSetRaw(filePath, strVal) {
        const key = 'op_fs_' + filePath;
        try {
            localStorage.setItem(key, strVal);
            memFsFallback.delete(key);
        } catch(e) {
            memFsFallback.set(key, strVal);
        }
    }

    function fsDelRaw(filePath) {
        const key = 'op_fs_' + filePath;
        memFsFallback.delete(key);
        try { localStorage.removeItem(key); } catch(e) {}
    }

    const fsShim = {
        existsSync: function(filePath) {
            const full = resolveDiskPath(filePath);
            const res = callNativeFs({ op: 'exists', path: full });
            if (res && res.ok) return Boolean(res.exists);
            return fsGetRaw(filePath) !== null;
        },
        readFileSync: function(filePath, enc) {
            const full = resolveDiskPath(filePath);
            const res = callNativeFs({ op: 'readFile', path: full });
            if (res && res.ok && typeof res.b64 === 'string') {
                const buf = window.Buffer.from(res.b64, 'base64');
                const encStr = (typeof enc === 'object' && enc && enc.encoding) ? enc.encoding : enc;
                return encStr ? buf.toString(encStr === 'utf-8' ? 'utf8' : encStr) : buf;
            }
            const data = fsGetRaw(filePath);
            if (data === null) throw new Error('ENOENT: no such file or directory, open \'' + filePath + '\'');
            if (typeof data === 'string' && data.startsWith(B64_PREFIX)) {
                const b64 = data.substring(B64_PREFIX.length);
                const buf = window.Buffer.from(b64, 'base64');
                return enc ? buf.toString(enc === 'utf-8' ? 'utf8' : enc) : buf;
            }
            return enc ? data : window.Buffer.from(data);
        },
        writeFileSync: function(filePath, data, enc) {
            const full = resolveDiskPath(filePath);
            let buf;
            if (data instanceof Uint8Array) {
                buf = window.Buffer.from(data);
            } else if (typeof data === 'string') {
                const encStr = (typeof enc === 'object' && enc && enc.encoding) ? enc.encoding : enc;
                buf = window.Buffer.from(data, (encStr === 'base64' || encStr === 'hex') ? encStr : 'utf8');
            } else {
                buf = window.Buffer.from(JSON.stringify(data), 'utf8');
            }
            const res = callNativeFs({ op: 'writeFile', path: full, b64: buf.toString('base64') });
            if (res && res.ok) return;
            if (data instanceof Uint8Array) {
                fsSetRaw(filePath, B64_PREFIX + buf.toString('base64'));
            } else {
                fsSetRaw(filePath, typeof data === 'string' ? data : JSON.stringify(data));
            }
        },
        appendFileSync: function(filePath, data, enc) {
            const full = resolveDiskPath(filePath);
            const buf = (data instanceof Uint8Array) ? window.Buffer.from(data) : window.Buffer.from(String(data), 'utf8');
            const res = callNativeFs({ op: 'appendFile', path: full, b64: buf.toString('base64') });
            if (res && res.ok) return;
            const existing = this.existsSync(filePath) ? this.readFileSync(filePath, 'utf8') : '';
            this.writeFileSync(filePath, existing + data, enc);
        },
        mkdirSync: function(dirPath, opts) {
            const full = resolveDiskPath(dirPath);
            callNativeFs({ op: 'mkdir', path: full });
        },
        readdirSync: function(dirPath) {
            const full = resolveDiskPath(dirPath);
            const res = callNativeFs({ op: 'readdir', path: full });
            if (res && res.ok && Array.isArray(res.entries)) return res.entries;
            const prefix = 'op_fs_' + pathShim.normalize(dirPath).replace(/\\+$/, '') + '\\';
            const results = new Set();
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith(prefix)) {
                        const rest = k.substring(prefix.length).split('\\')[0];
                        if (rest) results.add(rest);
                    }
                }
            } catch(e) {}
            memFsFallback.forEach(function(_, k) {
                if (k.startsWith(prefix)) {
                    const rest = k.substring(prefix.length).split('\\')[0];
                    if (rest) results.add(rest);
                }
            });
            return Array.from(results);
        },
        statSync: function(filePath) {
            const full = resolveDiskPath(filePath);
            const res = callNativeFs({ op: 'stat', path: full });
            if (res && res.ok) {
                const mtimeMs = Number(res.mtimeMs) || Date.now();
                const isF = Boolean(res.isFile);
                const isD = Boolean(res.isDirectory);
                const sz = Number(res.size) || 0;
                return {
                    isFile: function() { return isF; },
                    isDirectory: function() { return isD; },
                    size: sz,
                    mtime: new Date(mtimeMs),
                    mtimeMs: mtimeMs
                };
            }
            const raw = fsGetRaw(filePath);
            if (raw === null) throw new Error('ENOENT: no such file or directory, stat \'' + filePath + '\'');
            const size = raw.length;
            return { isFile: function() { return true; }, isDirectory: function() { return false; }, size: size, mtime: new Date(), mtimeMs: Date.now() };
        },
        unlinkSync: function(filePath) {
            const full = resolveDiskPath(filePath);
            callNativeFs({ op: 'unlink', path: full });
            fsDelRaw(filePath);
        },
        copyFileSync: function(src, dst) {
            const fullSrc = resolveDiskPath(src);
            const fullDst = resolveDiskPath(dst);
            const res = callNativeFs({ op: 'copyFile', path: fullSrc, path2: fullDst });
            if (res && res.ok) return;
            const raw = fsGetRaw(src);
            if (raw !== null) fsSetRaw(dst, raw);
        },
        renameSync: function(oldP, newP) {
            const fullOld = resolveDiskPath(oldP);
            const fullNew = resolveDiskPath(newP);
            const res = callNativeFs({ op: 'rename', path: fullOld, path2: fullNew });
            if (res && res.ok) return;
            this.copyFileSync(oldP, newP);
            this.unlinkSync(oldP);
        },
        createReadStream: function(filePath) {
            const self = this;
            return {
                pipe: function(dest) {
                    try {
                        const buf = self.readFileSync(filePath);
                        if (dest && typeof dest.end === 'function') dest.end(buf);
                    } catch(e) {
                        if (dest && typeof dest.end === 'function') dest.end();
                    }
                    return dest;
                }
            };
        },
        watch: function(filePath, opts, cb) { return { close: function() {} }; }
    };

    const childProcessShim = {
        exec: function(cmd, cb) {
            if (typeof cb === 'function') {
                if (cmd.includes('System.Drawing.FontFamily') || cmd.includes('Fonts')) {
                    cb(null, 'Arial\r\nCalibri\r\nComic Sans MS\r\nCourier New\r\nGeorgia\r\nImpact\r\nLucida Console\r\nSegoe UI\r\nTahoma\r\nTimes New Roman\r\nTrebuchet MS\r\nVerdana\r\n', '');
                } else {
                    cb(null, '', '');
                }
            }
        },
        spawn: function(exe, args, opts) {
            return { stdout: { on: function() {} }, stderr: { on: function() {} }, on: function() {}, kill: function() {} };
        }
    };

    // Real HTTP Server Bridge for Broadcast to Classroom + CommonJS node_modules loader
    let httpServerCounter = 0;
    const activeHttpServers = new Map();
    const cjsModuleCache = new Map();

    window.addEventListener('message', function(e) {
        if (!e.data) return;
        if (e.data.type === 'http_request' && e.data.serverId) {
            const srv = activeHttpServers.get(e.data.serverId);
            if (srv && typeof srv._handleRequest === 'function') {
                srv._handleRequest(e.data);
            }
        } else if (e.data.type === 'http_close' && e.data.reqId) {
            for (const srv of activeHttpServers.values()) {
                if (srv._closeHandlers && srv._closeHandlers.has(e.data.reqId)) {
                    const fns = srv._closeHandlers.get(e.data.reqId);
                    srv._closeHandlers.delete(e.data.reqId);
                    fns.forEach(function(fn) { try { fn(); } catch(err) {} });
                }
            }
        }
    });

    function loadCommonJsModule(modPath, baseDir) {
        let resolvedPath = '';
        if (modPath.startsWith('./') || modPath.startsWith('../')) {
            resolvedPath = pathShim.join(baseDir, modPath);
        } else {
            resolvedPath = pathShim.join(getAppDir(), 'node_modules', modPath);
        }
        const candidates = [
            resolvedPath,
            resolvedPath + '.js',
            resolvedPath + '.json',
            pathShim.join(resolvedPath, 'index.js')
        ];
        let actualFile = null;
        for (let i = 0; i < candidates.length; i++) {
            const st = fsOp('stat', { path: candidates[i] });
            if (st && st.exists && !st.isDirectory) {
                actualFile = candidates[i];
                break;
            }
        }
        if (!actualFile) return {};
        if (cjsModuleCache.has(actualFile)) {
            return cjsModuleCache.get(actualFile).exports;
        }
        const code = fsShim.readFileSync(actualFile, 'utf8');
        if (actualFile.endsWith('.json')) {
            try {
                const parsed = JSON.parse(code);
                cjsModuleCache.set(actualFile, { exports: parsed });
                return parsed;
            } catch(e) {
                return {};
            }
        }
        const moduleObj = { exports: {} };
        cjsModuleCache.set(actualFile, moduleObj);
        const dirOfFile = pathShim.dirname(actualFile);
        const localRequire = function(subMod) {
            if (subMod.startsWith('./') || subMod.startsWith('../')) {
                return loadCommonJsModule(subMod, dirOfFile);
            }
            return window.require(subMod);
        };
        try {
            const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', code);
            fn(moduleObj.exports, localRequire, moduleObj, actualFile, dirOfFile);
        } catch(e) {
            console.warn('CommonJS load error for ' + actualFile + ':', e);
        }
        return moduleObj.exports;
    }

    const httpShim = {
        get: function(url, cb) {
            fetch(url).then(function(r) { return r.text(); }).then(function(t) {
                if (cb) cb({ on: function(ev, fn) { if (ev === 'data') fn(t); if (ev === 'end') fn(); } });
            }).catch(function() {});
        },
        createServer: function(requestListener) {
            const serverId = ++httpServerCounter;
            const listeners = {};
            const closeHandlers = new Map();
            const srv = {
                _closeHandlers: closeHandlers,
                on: function(ev, fn) {
                    if (!listeners[ev]) listeners[ev] = [];
                    listeners[ev].push(fn);
                    return this;
                },
                once: function(ev, fn) {
                    const self = this;
                    function wrapped() {
                        self.removeListener(ev, wrapped);
                        fn.apply(self, arguments);
                    }
                    return this.on(ev, wrapped);
                },
                removeListener: function(ev, fn) {
                    if (listeners[ev]) {
                        listeners[ev] = listeners[ev].filter(function(f) { return f !== fn; });
                    }
                    return this;
                },
                _emit: function(ev, arg) {
                    if (listeners[ev]) {
                        listeners[ev].slice().forEach(function(fn) {
                            try { fn(arg); } catch(e) {}
                        });
                    }
                },
                listen: function(port, hostOrCb, maybeCb) {
                    const cb = typeof hostOrCb === 'function' ? hostOrCb : (typeof maybeCb === 'function' ? maybeCb : null);
                    activeHttpServers.set(serverId, srv);
                    try {
                        if (window.GeckoNative && typeof window.GeckoNative.httpListen === 'function') {
                            const res = window.GeckoNative.httpListen(serverId, port);
                            if (res && res.ok) {
                                if (cb) setTimeout(function() { try { cb(); } catch(e) {} }, 0);
                            } else {
                                const err = new Error((res && res.error) || 'EADDRINUSE');
                                err.code = 'EADDRINUSE';
                                setTimeout(function() { srv._emit('error', err); }, 0);
                            }
                            return this;
                        }
                    } catch(e) {}
                    if (cb) setTimeout(function() { try { cb(); } catch(e) {} }, 0);
                    return this;
                },
                close: function(cb) {
                    activeHttpServers.delete(serverId);
                    try {
                        if (window.GeckoNative && typeof window.GeckoNative.httpClose === 'function') {
                            window.GeckoNative.httpClose(serverId);
                        }
                    } catch(e) {}
                    if (cb) setTimeout(function() { try { cb(); } catch(e) {} }, 0);
                    return this;
                },
                _handleRequest: function(data) {
                    if (typeof requestListener !== 'function') return;
                    const reqId = data.reqId;
                    const req = {
                        method: data.method || 'GET',
                        url: data.url || '/',
                        headers: data.headers || {},
                        on: function(ev, fn) {
                            if (ev === 'close') {
                                if (!closeHandlers.has(reqId)) closeHandlers.set(reqId, []);
                                closeHandlers.get(reqId).push(fn);
                            }
                            return this;
                        }
                    };
                    let headSent = false;
                    let statusCode = 200;
                    let resHeaders = {};
                    const statusTextMap = { 200: 'OK', 404: 'Not Found', 500: 'Internal Server Error' };
                    function buildRawHeader(code, hdrs, isSse, contentByteLen) {
                        const hCopy = Object.assign({}, hdrs);
                        if (!isSse && typeof contentByteLen === 'number' && !hCopy['Content-Length'] && !hCopy['content-length']) {
                            hCopy['Content-Length'] = String(contentByteLen);
                        }
                        if (!isSse && !hCopy['Connection'] && !hCopy['connection']) {
                            hCopy['Connection'] = 'close';
                        }
                        let raw = 'HTTP/1.1 ' + code + ' ' + (statusTextMap[code] || 'OK') + '\r\n';
                        for (const k in hCopy) {
                            raw += k + ': ' + hCopy[k] + '\r\n';
                        }
                        raw += '\r\n';
                        return raw;
                    }
                    const res = {
                        writeHead: function(code, hdrs) {
                            statusCode = code || 200;
                            if (hdrs) Object.assign(resHeaders, hdrs);
                            return this;
                        },
                        write: function(chunk) {
                            const str = String(chunk == null ? '' : chunk);
                            const ct = String(resHeaders['Content-Type'] || resHeaders['content-type'] || '');
                            const isSse = ct.indexOf('text/event-stream') !== -1;
                            let payload = str;
                            if (!headSent) {
                                headSent = true;
                                payload = buildRawHeader(statusCode, resHeaders, isSse, null) + str;
                            }
                            try {
                                if (window.GeckoNative && typeof window.GeckoNative.httpWrite === 'function') {
                                    const r = window.GeckoNative.httpWrite(reqId, payload, false);
                                    if (!r || !r.ok) {
                                        if (closeHandlers.has(reqId)) {
                                            const fns = closeHandlers.get(reqId);
                                            closeHandlers.delete(reqId);
                                            fns.forEach(function(fn) { try { fn(); } catch(e) {} });
                                        }
                                    }
                                }
                            } catch(e) {}
                            return true;
                        },
                        end: function(chunk) {
                            const str = chunk != null ? String(chunk) : '';
                            let payload = str;
                            if (!headSent) {
                                headSent = true;
                                let byteLen = str.length;
                                try { byteLen = new TextEncoder().encode(str).length; } catch(e) {}
                                payload = buildRawHeader(statusCode, resHeaders, false, byteLen) + str;
                            }
                            try {
                                if (window.GeckoNative && typeof window.GeckoNative.httpWrite === 'function') {
                                    window.GeckoNative.httpWrite(reqId, payload, true);
                                }
                            } catch(e) {}
                            return this;
                        }
                    };
                    try {
                        requestListener(req, res);
                    } catch(e) {
                        console.error('HTTP requestListener error:', e);
                    }
                }
            };
            return srv;
        }
    };

    window.require = function(mod) {
        switch (mod) {
            case 'path': return pathShim;
            case 'os': return osShim;
            case 'fs': return fsShim;
            case 'crypto': return cryptoShim;
            case 'child_process': return childProcessShim;
            case 'http':
            case 'https':
                return httpShim;
            default:
                return loadCommonJsModule(String(mod || ''), getAppDir());
        }
    };

    // 4. Child Tear-Away Window Setup (windows/*.html)
    function setupChildDialogWindow() {
        try {
            const style = document.createElement('style');
            style.textContent =
                'html, body { background: #0f172a !important; } ' +
                '#backup-mgr-window, #prev-versions-window { background: #ffffff !important; border-radius: 0 !important; box-shadow: none !important; } ' +
                '#preview-window, #dev-mode-overlay, #sniffer-window, #queue-window, #palette-window { border-radius: 0 !important; box-shadow: none !important; } ' +
                '#custom-backup-mgr-header, #preview-header, #dev-mode-header, #sniffer-header, #queue-header, #custom-prev-versions-header, #palette-header { border-top-left-radius: 0 !important; border-top-right-radius: 0 !important; }';
            (document.head || document.documentElement).appendChild(style);
        } catch(e) {}

        // Intercept header dragging in capture phase and hand off to Win32 native caption drag
        window.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            const header = e.target && e.target.closest ? e.target.closest('#custom-backup-mgr-header, #preview-header, #queue-header, #dev-mode-header, #sniffer-header, #custom-prev-versions-header, #palette-header, .window-drag-region') : null;
            if (!header) return;
            if (e.target.closest('.header-actions, .dev-header-actions, .header-btn, #dev-mode-popout, button, input, select, textarea, a')) return;
            if (window.GeckoNative && typeof window.GeckoNative.startWindowDrag === 'function') {
                e.stopImmediatePropagation();
                e.preventDefault();
                window.GeckoNative.startWindowDrag();
            }
        }, true);
    }

    // 5. Main Wrapper Window Setup (wrapper.html)
    function setupMainWrapperBridge() {
        const webview = document.getElementById('app-view');
        if (!webview) {
            setTimeout(setupMainWrapperBridge, 50);
            return;
        }

        // Prevent duplicate OP_IPC consolemessage listener accumulation on webview across contentload cycles
        let activeOpIpcConsoleListener = null;
        const origWebviewAddListener = webview.addEventListener.bind(webview);
        const origWebviewRemoveListener = webview.removeEventListener.bind(webview);
        webview.addEventListener = function(type, listener, options) {
            if (type === 'consolemessage' && typeof listener === 'function') {
                const src = Function.prototype.toString.call(listener);
                if (src.indexOf('OP_IPC:') !== -1 && src.indexOf('OP_SAVE_DATA') !== -1) {
                    if (activeOpIpcConsoleListener) {
                        origWebviewRemoveListener('consolemessage', activeOpIpcConsoleListener);
                    }
                    activeOpIpcConsoleListener = listener;
                }
            }
            return origWebviewAddListener(type, listener, options);
        };

        // Deduplicate contentload per navigation cycle so iframe.onload + Gecko:GuestLoaded never double-fire
        let lastContentLoadTime = 0;
        function dispatchSingleContentLoad() {
            const now = Date.now();
            if (now - lastContentLoadTime < 2500) return;
            lastContentLoadTime = now;
            try {
                webview.dispatchEvent(new CustomEvent('contentload'));
            } catch(e) {}
        }

        webview.addEventListener('load', dispatchSingleContentLoad);

        window.addEventListener('message', function(e) {
            if (!e.data) return;
            if (e.data.type === 'consolemessage' && e.data.message) {
                const evt = new CustomEvent('consolemessage');
                evt.message = e.data.message;
                webview.dispatchEvent(evt);
            } else if (e.data.type === 'contentload') {
                dispatchSingleContentLoad();
            } else if (e.data.type === 'evalresult' && e.data.reqId) {
                const cb = pendingEvalCallbacks.get(e.data.reqId);
                if (cb) {
                    pendingEvalCallbacks.delete(e.data.reqId);
                    cb(e.data.result);
                }
            } else if (e.data.type === 'sizemodechange') {
                const isMax = Boolean(e.data.isMaximized);
                if (nwWindowInstance.isMaximized !== isMax) {
                    syncMaximizedUI(isMax);
                    nwWindowInstance._emit(isMax ? 'maximize' : 'restore');
                }
            }
        });

        function isWrapperDragTarget(target) {
            if (!target || !target.closest) return false;
            if (!target.closest('#drag-zone-right, #drag-zone-left, #drag-zone-left2, #brand-mac-right, .window-drag-region')) return false;
            // #brand-mac-right sits inside #controls-wrapper, so exclude it from the #controls-wrapper blocklist.
            if (target.closest('#controls-wrapper') && !target.closest('#brand-mac-right')) return false;
            if (target.closest('button, .win-btn, .mac-btn, input, select, textarea, a, #recent-files-dropdown, #controls-wrapper-left, #controls-mac-left')) return false;
            return true;
        }

        // Smooth native OS window dragging via Win32 WM_NCLBUTTONDOWN + HTCAPTION
        // Also allows dragging anywhere on the loading screen (#splash-screen) during startup
        document.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            if (!e.target || !e.target.closest) return;
            const splash = e.target.closest('#splash-screen');
            const isSplashActive = splash && !splash.classList.contains('dismissing') && splash.style.display !== 'none' && splash.style.visibility !== 'hidden';
            if (isSplashActive) {
                if (e.target.closest('button, .firstrun-theme-btn, .firstrun-mode-tab, .firstrun-pill, a, input, select, textarea')) return;
                if (window.GeckoNative && typeof window.GeckoNative.startWindowDrag === 'function') {
                    e.preventDefault();
                    window.GeckoNative.startWindowDrag();
                }
                return;
            }
            if (!isWrapperDragTarget(e.target)) return;

            if (window.GeckoNative && typeof window.GeckoNative.startWindowDrag === 'function') {
                e.preventDefault();
                window.GeckoNative.startWindowDrag();
            }
        }, false);

        // Double-click drag zone to toggle maximize/restore
        document.addEventListener('dblclick', function(e) {
            if (!isWrapperDragTarget(e.target)) return;
            if (window.GeckoNative && typeof window.GeckoNative.toggleMaximize === 'function') {
                window.GeckoNative.toggleMaximize();
            } else if (nwWindowInstance.isMaximized || (document.body && document.body.classList.contains('maximized'))) {
                nwWindowInstance.unmaximize();
            } else {
                nwWindowInstance.maximize();
            }
        }, false);

        // Safety fallback watchdog: if guest readiness signals arrive slowly, trigger markBootComplete()
        // so the splash log always finishes streaming and shows its final green line before dismissing.
        setTimeout(function() {
            try {
                if (typeof window.markBootComplete === 'function') window.markBootComplete();
            } catch(e) {}
        }, 6500);
    }

    if (isChildDialogWindow) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupChildDialogWindow);
        } else {
            setupChildDialogWindow();
        }
    } else {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupMainWrapperBridge);
        } else {
            setupMainWrapperBridge();
        }
    }

    console.log('[GeckoNWShim] NW.js compatibility layer initialized (isMainWindow=' + window.isMainWindow + ', dir=' + window.__dirname + ').');
})();
