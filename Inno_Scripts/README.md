# Open Publisher Windows Installer Source (`Inno_Scripts`)

This folder contains the **Inno Setup 6** script source files, `botva2.dll` custom UI helper library, and wizard artwork used to build the Windows installers (`OP_Setup.exe`) for Open Publisher.

## Contents Overview

- **`setup_gekko.iss`**: Active **OpenPublisher Gecko Edition** (Gecko 115.21.0 ESR) Windows installer script.
  - Builds a frameless `900x494` rounded wizard window (`CreateRoundRectRgn`) skinned with `botva2.dll` across 5 background slides (`1.png` - `5.png`).
  - Sets `DisableDirPage=no` so the Customize page (`wpSelectDir`) and shortcut / `.opub` association checkboxes remain accessible during over-the-top upgrades as well as fresh installs.
  - Runs pre-install `taskkill.exe` cleanup (`CurStepChanged(ssInstall)`) for `op_tray.exe` and `OpenPublisher.exe` so locked binaries replace cleanly.
  - Uses locked pixel font heights (`Font.Height`) for High-DPI compatibility, a right-aligned live percentage counter, an 8-stage `SetTimer` (`40ms`) installation status readout, and GitHub / Patreon / Facebook buttons on the finish slide.
- **`setup.iss`**: Legacy **NW.js Edition** Windows installer script.
  - Uses the same `900x494` `botva2.dll` 5-slide rounded wizard layout with NW.js runtime file entries and GitHub / Patreon / YWA finish buttons.
- **`botva2.dll`**: Bundled Inno Setup GDI+ UI helper DLL (`dontcopy` / `ExtractTemporaryFile`) used for background slide rendering and multi-state PNG buttons.
- **`installerSlides/`** (`151` image files):
  - Background slides: `1.png` - `5.png` (plus JPEG drafts `1.jpeg` - `4.jpeg`, `example.png`, and legacy button concepts).
  - `buttons/`: Multi-state sprite sheets (`btn_next.png`, `btn_finish.png`, `btn_back_secondary.png`, `btn_cancel_secondary.png`, `btn_install.png`, `btn_close.png`, `btn_change_secondary.png`, `btn_github.png`, `btn_patreon.png`, `btn_fb.png`, `btn_ywa.png`, plus glow, shadow, and `150x216` variants).
  - `buttons/extracted/`: `72` individual button state image slices organized across `9` subdirectories (`back`, `cancel`, `change`, `finish`, `github`, `install`, `next`, `patreon`, `ywa`).

## Path Placeholders to Configure Before Building

Developer-specific local paths have been replaced with `#PATH-TO-...` placeholders at the top of `setup_gekko.iss` and `setup.iss`:

| Placeholder | Script(s) | Purpose | Notes / Suggested Local Value |
| :--- | :--- | :--- | :--- |
| `#PATH-TO-GECKO-APP-FOLDER` | `setup_gekko.iss` | Root of unpacked Gecko desktop build | Folder containing `OpenPublisher.exe` and Gecko runtime files |
| `#PATH-TO-NWJS-APP-FOLDER` | `setup.iss` | Root of unpacked NW.js desktop build | Folder containing legacy NW.js `OpenPublisher.exe` and DLLs |
| `#PATH-TO-INSTALLER-SLIDES` | `setup_gekko.iss`, `setup.iss` | Path to wizard slide & button PNGs | Can point directly to `.\installerSlides` |
| `#PATH-TO-BOTVA2-FOLDER` | `setup_gekko.iss`, `setup.iss` | Folder containing `botva2.dll` | Can point directly to `.` (this `Inno_Scripts` folder) |
| `#PATH-TO-OUTPUT-FOLDER` | `setup_gekko.iss`, `setup.iss` | Output directory for compiled `OP_Setup.exe` | Any writable local build folder (e.g. `.\out`) |

## Excluded Desktop Runtime Files (How to Assemble Locally)

Compiled desktop binaries and runtime subdirectories are not checked into this repository to keep the source tree lightweight. You can piece together the expected application folder from an existing Open Publisher desktop installation (or portable archive) combined with the client update files in `../appupdates/windows/gekko/`:

- **Expected layout for `setup_gekko.iss` (`#PATH-TO-GECKO-APP-FOLDER`)**:
  - Root files: `OpenPublisher.exe`, `gecko_nw_shim.js`, `inject.js`, `manifest.json`, `op_menu_hook.dll`, `op_native_menu.exe`, `op_tray.exe`, `reset_firstrun.flag`, `wrapper.html`
  - Subdirectories & icon: `assets\branding\OpenPublisherV5.ico`, `assets\`, `dictionaries\`, `firefox\`, `firstrun_assets\`, `fonts\`, `node_modules\`, `profile\chrome\`, `windows\`
- **Expected layout for `setup.iss` (`#PATH-TO-NWJS-APP-FOLDER`)**:
  - Root files: `OpenPublisher.exe`, `d3dcompiler_47.dll`, `dxcompiler.dll`, `dxil.dll`, `ffmpeg.dll`, `firstrunSIM.bat`, `icudtl.dat`, `inject.js`, `libEGL.dll`, `libGLESv2.dll`, `node.dll`, `notification_helper.exe`, `nw.dll`, `nw.exe.original`, `nw_100_percent.pak`, `nw_200_percent.pak`, `nw_elf.dll`, `op_menu_hook.dll`, `op_native_menu.exe`, `package.json`, `recoverdSIM.bat`, `reset_firstrun.flag`, `resources.pak`, `v8_context_snapshot.bin`, `vk_swiftshader.dll`, `vk_swiftshader_icd.json`, `vulkan-1.dll`, `wrapper.html`
  - Subdirectories & icon: `icons\installer.ico`, `assets\`, `dictionaries\`, `firstrun_assets\`, `fonts\`, `icons\`, `locales\`, `node_modules\`, `swiftshader\`, `update_logs\`, `windows\`

## Quick Build Steps

1. Install **Inno Setup 6**.
2. Open `setup_gekko.iss` (or `setup.iss`) in the Inno Setup Compiler IDE.
3. Update the `#PATH-TO-...` defines and `OutputDir` at the top of the script to match your local directories (using `.\installerSlides` and `.` for UI assets and `botva2.dll`).
4. Compile (`Ctrl+F9`) to generate `OP_Setup.exe` in your chosen output directory.
