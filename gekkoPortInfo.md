# OpenPublisher Gecko Port: Technical Architecture, Progress & Milestones

## 📌 Executive Overview
The **Gecko Port of OpenPublisher** is an active development initiative aimed at delivering a lightweight, native, and high-performance desktop runtime environment for OpenPublisher on Windows, powered by the Mozilla Gecko rendering engine. 

Spanning over a month of focused engineering (including two weeks of intensive Argon sessions and a week of Flash sessions alongside ongoing web app maintenance), the project transitions OpenPublisher from legacy multi-process desktop shells toward a dedicated, self-contained Gecko-embedded runtime. This document details the architectural milestones, core bridge implementations, and stability fixes accomplished to date.

---

## 🏗️ 1. Frameless Native Window Architecture & Startup Stability

### Single-Instance Window Management & Launch Race Elimination
- **Problem**: Opening OpenPublisher via file associations (`.opub`, `.json`) or clicking shortcuts in quick succession triggered multi-instance launch races, opening multiple separate Firefox browser windows and redundant chrome instances.
- **Solution**: Implemented single-instance window assignment and launch argument coordination directly within `firefox.cfg`. 
- **Result**: Command-line arguments and file associations are routed cleanly to the active runtime instance without spawning duplicate frames or unstyled browser chrome.

### Portable Architecture & Zero Hardcoded Paths
- **Implementation**: Fully recompiled `OpenPublisher.exe` from `OpenPublisher.cs` utilizing dynamic runtime path resolution.
- **Scope**: Replaced all machine-specific and static paths across:
  - `OpenPublisher.cs` (native launcher and process lifecycle manager)
  - `firefox.cfg` (privileged Gecko configuration and bootstrapping logic)
  - `gecko_nw_shim.js` (NW.js / Electron compatibility bridge)
  - User profile preferences and local storage caches
- **Result**: The application is fully portable and can execute from any directory, portable drive, or installation path without registry or path dependencies.

### Native Win32 Non-Client Caption Dragging
- **Implementation**: Integrated direct Win32 API calls (`ReleaseCapture` and `SendMessageW(hwnd, WM_NCLBUTTONDOWN, HTCAPTION, 0)`) via `user32.dll` through Gecko `ctypes`.
- **Functionality**: Binds native OS caption drag mechanics across the entire custom top bar, header controls, and unoccupied title bar surfaces.
- **Result**: Completely eliminates JavaScript `mousemove`/`screenX` lag, stutter, and window detachment during high-speed mouse dragging.

### Top-Bar Control Realignment & Coordinate Display
- **Layout Restoration**: Aligned top-bar window control buttons (Minimize, Maximize/Restore, Close) to match native desktop expectations (NW.js / Electron layout parity).
- **Coordinate Display**: Repositioned the live canvas coordinate readout (`#coord-display`) to prevent visual overlap with window controls, menus, or ribbon tabs.

### Child Window & Frameless Dialog Management
- **Implementation**: Configured privileged child window interceptors for dialog templates (`windows/*.html`).
- **Functionality**: Child dialogs dynamically inherit precise pixel dimensions, center-screen positioning, modal barriers, and always-on-top flags without exposing default Firefox browser toolbars, tabs, or address bars.

---

## 💾 2. Native File Dialogs & Privileged File System Bridge

### Concurrency-Suppressed File Picker Dialogs
- **Problem**: Asynchronous export and save invocations could queue multiple simultaneous file picker prompts, leading to repeated modal dialog popups.
- **Solution**: Added concurrency suppression and token locking to `Gecko:PickFile` using `Ci.nsIFilePicker`.
- **Result**: Clean single-invocation save, open, and export dialog flows across the application lifecycle.

### Real Disk File System Operations Bridge (`Gecko:FsOp`)
- **Implementation**: Established a high-performance privileged file system bridge in Gecko scope (`Gecko:FsOp`) interfacing directly with Windows disk I/O.
- **Supported Operations**:
  - `readFile` / `readFileSync`: Full binary and UTF-8 document ingestion.
  - `writeFile` / `writeFileSync`: Atomic write operations ensuring zero file corruption on system interruptions.
  - `appendFile`: High-throughput diagnostics and operation logging.
  - `readdir`: Local directory scanning for templates, fonts, and assets.
  - `stat`: File metadata, timestamp, and size inspections.
  - `unlink` & `rmdir`: Asset and temporary export cleanup.
  - `copyFile` & `rename`: Safe document backup and asset cloning.
  - `mkdir`: Recursive directory creation for project workspaces and cache trees.
- **Result**: Complete native support for opening, auto-saving, and packaging `.opub` and `.json` documents directly to physical storage.

---

## 🖨️ 3. Printing Engine & High-Resolution Vector/Raster Pipeline

### Resolution of Print Engine Initialization Error
- **Problem**: Triggering print output on pages containing Scrapbook images, Web Clipart, or uploaded framed images immediately crashed with an alert: `"Print Error - Failed to generate print file."`
- **Root Cause**: Identified an undefined variable error (`ReferenceError: activeEl is not defined`) inside `print-engine.js` caused by missing environment globals in the Gecko guest scope.
- **Solution**:
  - Initialized `window.activeEl = null` within the guest compatibility bridge.
  - Implemented `normalizeSvgDataUriForGecko` ensuring that all SVG data URIs passed to the rasterizer declare explicit pixel `width`, `height`, and `viewBox` attributes for Gecko `<canvas>` drawing contexts.
- **Result**: Flawless print document generation without crashes or missing graphical elements.

### High-Resolution Legacy WordArt Rendering & WebFont Synchronization
- **Problem**: Modern Beta WordArt printed reliably, but Legacy WordArt styles frequently rendered as blank, transparent rectangles (the "Flash of Invisible Text" issue).
- **Root Cause**: Gecko's isolated SVG `<foreignObject>` parser initialized and exported to raster surfaces before asynchronous Google WebFonts had fully decoded and applied to the DOM.
- **Solution**:
  - Implemented `captureFramePNG` utilizing privileged `ctx.drawWindow` at 4.0x scale with strict alpha-channel integrity verification.
  - Integrated `geckoBakeLegacyWordArt` into `firefox.cfg`, explicitly awaiting font readiness via `document.fonts.load()` and `document.fonts.ready` alongside image element decodes before passing nodes to the print pipeline.
- **Verification**: Verified end-to-end rendering on complex multi-layered documents combining Scrapbook items, transparent SVG cliparts, and both Legacy and Beta WordArt typography styles.

---

## 🌐 4. Knowledge Base & UI Isolation

### Knowledge Base Theme Scope Isolation
- **Problem**: Global desktop CSS theming (such as the default OpenPublisher green theme) bled into the embedded Knowledge Base modal (`kb.openpublisher.app`), causing color inversions, illegible text, and corrupted UI controls.
- **Solution**: Scoped application-level color styles and background theming to exclude the Knowledge Base frame hierarchy.
- **Result**: Preserves the native visual presentation, layout, and readability of the Knowledge Base while maintaining the chosen desktop theme for the main publisher workspace.

---

## 🔗 5. External Link Handling in OS Default Browser

### Native Win32 Shell Protocol Redirection
- **Problem**: Clicking hyperlinks in documentation, modals, or dialogs opened standard Firefox browser sessions inside the frameless Gecko wrapper, trapping the user in unnavigable browser frames that required `Alt+F4` to close.
- **Solution**:
  - Implemented `openExternalUrl` leveraging `shell32.dll`'s `ShellExecuteW` (`SW_SHOWNORMAL`) and `nsIExternalProtocolService`.
  - Added click and navigation interception hooks across:
    - Main editor workspace
    - NW.js / Gecko guest wrapper
    - Child dialogs (`windows/*.html`)
    - About dialog links (Facebook, GitHub, Patreon, PayPal)
    - External documentation and Knowledge Base links
    - Calls routed through `nw.Shell.openExternal`
- **Result**: All external web destinations launch instantly in the user's configured Windows default web browser (Chrome, Edge, Firefox, Brave, etc.), keeping the OpenPublisher desktop application clean, focused, and secure.

---

## 📊 Summary of Technical Components

| Component / Layer | Technology | Primary Role |
| :--- | :--- | :--- |
| **`OpenPublisher.exe`** | C# / .NET Win32 | Native portable launcher, process watchdog, path resolution |
| **`firefox.cfg`** | Gecko JavaScript (Privileged) | Engine configuration, single-instance lock, font baking, shell hooks |
| **`gecko_nw_shim.js`** | JavaScript Bridge | NW.js and Electron API compatibility translation layer |
| **`Gecko:FsOp`** | XPCOM / Privileged JS | Real physical disk read/write/stat operations |
| **`Gecko:PickFile`** | XPCOM (`nsIFilePicker`) | Native Windows file open and save dialogs with concurrency guard |
| **`user32.dll` (ctypes)** | Win32 API via Gecko ctypes | Native window dragging (`HTCAPTION`), window management |
| **`shell32.dll` (ctypes)**| Win32 API via Gecko ctypes | OS-level URL redirection via `ShellExecuteW` |
| **`print-engine.js`** | Gecko Rasterization | High-DPI canvas capture, SVG normalization, print spooling |

---

## 🎯 Next Steps & Milestones
- [ ] Memory footprint optimization during high-DPI export batching.
- [ ] Accelerated hardware canvas rendering profiling across varied GPU configurations.
- [ ] Automated installer and portable package generation for testing builds.
- [ ] Extended unit test suite covering native file operations under restricted Windows permissions.
