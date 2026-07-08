# 📘 Open Publisher – User Guide (v4)

Welcome to **Open Publisher**! This is a lightweight desktop publishing tool that allows you to create documents, flyers, brochures, and fun designs. Originally built for the web, version 4.0.0 brings Open Publisher directly to your desktop as a native application for Windows, macOS, and Linux. We are constantly tweaking and improving the app based on your feedback to make the workflow as smooth as possible.

## 📑 Table of Contents
1. [The Native Desktop Experience (New)](#1-the-native-desktop-experience-new)
2. [The Interface Overview](#2-the-interface-overview)
3. [File Management & Importing](#3-file-management--importing)
4. [Core Editing & Workflows](#4-core-editing--workflows)
5. [Working with Text](#5-working-with-text)
6. [Working with Images & Graphics](#6-working-with-images--graphics)
7. [Page Design & Layout](#7-page-design--layout)
8. [Multi-Page Documents & Printing](#8-multi-page-documents--printing)
9. [Templates](#9-templates)
10. [Ribbon Reference (Detailed Tab Breakdown)](#10-ribbon-reference-detailed-tab-breakdown)
11. [Keyboard Shortcuts](#11-keyboard-shortcuts)

---

## 1. The Native Desktop Experience (New)


With version 4, we focused on making Open Publisher feel at home on your computer, no matter what operating system you use. 
<img width="1327" height="729" alt="Screenshot of the app running as a desktop window on Windows/Mac/Linux" src="https://github.com/user-attachments/assets/2feeb211-3047-417d-b8cc-0f02af03664c" />
<table>
  <tr>
    <td width="20%">
      <img src="https://github.com/user-attachments/assets/05794797-4857-4235-9eff-4f679b320f17" alt="Screenshot of the Windows Installer or Windows Start Menu icon" width="100%" />
    </td>
    <td width="80%">
      <ul>
        <li><strong>Windows:</strong> Available as a standard <code>.exe</code> installer that handles Start Menu shortcuts and file associations, or as a portable <code>.zip</code> that runs completely isolated without needing administrator privileges.</li>
      </ul>
    </td>
  </tr>
</table>

* **macOS:** Enjoy a true Mac experience with tools mapped directly to the native macOS menu bar at the top of your screen. It includes a custom splash screen and safe exit warnings so you don't lose unsaved changes.
<img width="1767" height="461" alt="Screenshot of the native macOS Menu Bar showing Insert tab" src="https://github.com/user-attachments/assets/4e37e84b-db0c-4be2-aa77-cd581bb4fdc4" />

* **Linux:** Deep system integration available via `.deb`, `.rpm`, and standalone `AppImage`. File associations and taskbar icons work right out of the box.

---

## 2. The Interface Overview

If you’ve spent any time on a computer over the past 20 years, this layout will feel instantly familiar—it’s inspired by Microsoft's Office, back when it looked its best.

<img alt="Open Publisher's Main Window" src="https://github.com/user-attachments/assets/125fbb24-5c75-425d-9eb8-12afe8a55d0a" />

* **Title Bar:** Displays the document name (click to rename), Undo/Redo controls, and mouse coordinates.
* **Ribbon Menu:** The tabbed area at the top containing all tools. *Note: Contextual tabs will automatically appear here when you select specific items like images or tables.*
* **Sidebar (Left):** Shows thumbnails of your pages. Use this to add, delete, or switch pages.
* **Canvas & Rulers (Center):** Your workspace. The rulers are hardware-accelerated, measure in true Centimeters/Millimeters (matching MS Publisher), and dynamically track your page's exact physical dimensions.
* **Zoom Controls (Bottom Right):** Quick toggles for zooming (60% - 150%). The ruler and canvas will gracefully scale without blurring or losing lines.

---

## 3. File Management & Importing

Everything related to opening, saving, and exporting your work is located in the **File Tab**. If you are using the desktop version, clicking Save or Open will safely bring up your operating system's native file dialogs.

<img alt="File Tab" src="https://github.com/user-attachments/assets/155dd626-7e75-4436-837e-7ea29baebef0" />

### Saving Your Work
* **Save Document:** Click Save to save your project as an `.opub` file (our new native format). **This is your "Master File."** Keep this to edit your text or move objects later.
* **Save as PDF:** Renders your pages as a high-quality PDF document.

### Opening & Importing Documents
You can click **Open** or simply **Drag and Drop** files directly onto the canvas. On Windows, macOS, and Linux, you can also just **double-click an `.opub` file** to launch the app and open your document instantly. We currently support:
* **Open Publisher Saves (`.opub`, `.json`):** Restores your previous working sessions.
* **Images (`.png`, `.jpg`, etc.):** Drops the image directly onto your page.
* **Publisher Files (`.pub`, `.pubx`):** Experimental import for legacy Publisher files.
* **Word Documents (`.doc`, `.docx`):** Because Word layouts can be tricky, dropping a Word file opens an import menu with two choices:
  1. **Editable Text Mode:** The engine will extract the text, fonts, and colors, turning them into editable boxes. 
  2. **Flattened Image Mode (Safe Mode):** Best for strict forms or highly complex medical tables. It renders the document as a high-res, uneditable background image to guarantee 100% layout accuracy.

---

## 4. Core Editing & Workflows
<img alt="Home Tab" src="https://github.com/user-attachments/assets/f0b3003f-6ae2-4c37-9173-162e034035ba" />

* **Selection & Marquee:** Click once on any object to select it. Click and drag on the blank paper to draw a **Marquee Selection Box** and select multiple items at once.
* **Grouping:** Once multiple items are selected, right-click and choose **Group** to lock them together.
* **Movement & Resize:** Drag an object to move it, or drag the white square handles to resize. Dragging a handle past the opposite edge will "flip" (mirror) the object.
* **Contextual Ribbons:** When you select an image, shape, or table, keep an eye on the top ribbon. A special highlighted tab (e.g., "Picture Tools") will appear with specific tools for that object.
* **Right-Click Context Menu:** Right-click anywhere on the canvas or on an object to quickly access layer arrangements, background formatting, cropping, grouping, and more.

---

## 5. Working with Text

### Inserting & Formatting
Go to the **Insert Tab** and click **Text Box**. You can format text using the Ribbon, or by using the **Floating Toolbar** that appears next to your selection. 

<img alt="insert tab" src="https://github.com/user-attachments/assets/bf325747-25fc-460a-a0c0-edfc8df3e696" />
<img alt="text box" src="https://github.com/user-attachments/assets/56bc2b2f-8757-4c61-849b-eca83796879a" />

* **Text Fit:** Right-click a text box and select **Text Fit: Best Fit** to automatically scale your font to perfectly fill the box.
* **Drop Cap:** Right-click and select **Drop Cap** to stylize the first letter of a paragraph.

### WordArt
For headlines, go to **Insert > WordArt** to access a gallery of 200 pre-styled graphical text effects. You can stretch, resize, and swap WordArt styles on the fly without breaking the layout.
<img alt="WordArt Gallery" src="https://github.com/user-attachments/assets/2304554f-852c-410c-88c1-618c79139287" />

---

## 6. Working with Images & Graphics

Go to the **Insert Tab** to upload pictures or utilize our built-in vector Clipart, Shapes, and Ad Stickers.

When an image is selected, the **Picture Tools** tab appears:
<img width="678" height="477" alt="picture tools" src="https://github.com/user-attachments/assets/2a66cd21-0c7e-49a8-ae2d-ff9cac537f07" />

* **Crop & Shape Crop:** Click Crop to trim the image, or right-click the image and select **Crop to Shape** to instantly cut your photo into a circle, star, or triangle.
* **Recolor & Filters:** Apply grayscale, sepia, color tints, or drop-shadows.

---

## 7. Page Design & Layout

Use the **Page Design Tab** to change the look of the paper itself.
<img alt="Page Design tab" src="https://github.com/user-attachments/assets/acda488d-cd65-470e-871a-d6de0b849725" />

* **Size & Orientation:** Switch between A4/Letter and Portrait/Landscape.
* **Page Borders:** Apply standard lines or **Fancy Borders** (Art Deco, Floral, Certificate) to the page edge.
* **Themes & Backgrounds:** Click a color swatch in the ribbon, or right-click the blank paper and select **Format Background** to pick a custom hex color.

---

## 8. Multi-Page Documents & Printing

### Managing Pages:
<table border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td width="300" valign="middle" style="border:none;">
      <img alt="Sidebar" src="https://github.com/user-attachments/assets/f15996ab-d8a9-4b74-98eb-369738c2eebf" width="100%" />
    </td>
    <td valign="middle" style="border:none;">
      <ul>
        <li><b>Sidebar Navigation:</b> Click a thumbnail to switch pages.</li>
        <li><b>Add Page:</b> Click <b>+ Add Page</b> to create a blank sheet.</li>
        <li><b>Delete Page:</b> Hover over a thumbnail and click the <b>Red X</b>.</li>
        <li><b>Headers & Footers:</b> Every page has a dedicated Header and Footer area. Text typed here is specific to that page.
          <ul>
             <li><i>Toggle visibility via Page Design &gt; H/F Toggle.</i></li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

### Perfect Printing
We have completely overhauled the print spooler to ensure a seamless physical printing experience. 
* Click **Print** in the File tab.
* **Zero Spillage:** We use a special mathematical "zoom box" to ensure your document never triggers an extra blank page at the end.
* **Color Accuracy:** Background colors, forms, and text-halos are forced to render exactly as they appear on screen.

---

## 9. Templates

Need inspiration? Go to **File > Templates**. Browse categories like Resumes, Flyers, Menus, and Certificates.
<img width="850" height="774" alt="Templates Gallery" src="https://github.com/user-attachments/assets/530c5a1e-11e1-47aa-8545-5a8191ccc789" />

> 📝 **Note:** Loading a template will replace the content of your **currently selected** page.

---

## 10. Ribbon Reference (Detailed Tab Breakdown)

### 🏠 Home Tab
* **Common:** Shortcuts for PDF Export and Saving.
* **Clipboard:** Paste, Copy, Cut.
* **Font:** Font Family, Size, Bold, Italic, Underline, and Color Picker.
* **Editing:** Select All.
* **Arrange:** Bring to Front, Send to Back, Delete.

### ➕ Insert Tab
* **Illustrations:** Text Box, Picture (Upload), Clipart (Gallery).
* **Graphics:** Shapes (Solid & Outlines), WordArt.
* **Marketing:** Ad templates and stickers.
* **Tables:** Grid picker to insert editable tables.

### 🎨 Page Design Tab
* **Page Setup:** Margins Toggle, Orientation, Size.
* **Layout:** Borders (Basic & Fancy), Header/Footer Toggle.
* **Themes:** Background color/pattern selector.

### 👁️ View Tab
* **Zoom:** Presets (60%, 75%, 100%, 150%).
* **Show:**
    * **Margins:** Visual print guides.
    * **Rulers:** Hardware-accelerated measurement rulers (CM/MM).
    * **Grid:** Graph paper overlay.
    * **Baselines:** Notebook line overlay.

### 🔎 Review Tab
* **Proofing:**
    * **Spelling:** Turn on the red squiggly lines for spellcheck.
    * **Thesaurus:** Opens external reference.

---

## 11. Keyboard Shortcuts

| Shortcut | Function |
| :--- | :--- |
| **Ctrl + Z** | Undo |
| **Ctrl + Y** | Redo |
| **Ctrl + C** | Copy |
| **Ctrl + V** | Paste |
| **Ctrl + Shift + V** | Paste Without Formatting (Plain Text) |
| **Delete** | Delete selected element(s) |
| **Ctrl + Wheel** | Zoom In / Out |
| **Esc** | Deselect all |
| **Ctrl + A** | Select All |
| **Ctrl + 0** | Reset Zoom |
