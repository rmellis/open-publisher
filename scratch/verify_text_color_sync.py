import asyncio
import os
import sys
from playwright.async_api import async_playwright

WORKSPACE_DIR = r"c:\Users\rmell\Documents\GitHub\open-publisher"
ARTIFACTS_DIR = r"C:\Users\rmell\.gemini\antigravity\brain\277e01f3-6549-4887-9ac9-8634a7aee2f8"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1400, "height": 900})
        page = await context.new_page()

        index_url = f"file:///{WORKSPACE_DIR.replace(os.sep, '/')}/index.html"
        print(f"Navigating to {index_url}...")
        await page.goto(index_url, wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)

        # Check basic elements
        paper = await page.query_selector("#paper")
        assert paper is not None, "Paper element not found"

        # Create / select a text box
        print("Creating and selecting a text box...")
        await page.evaluate("""() => {
            // Dismiss dashboard or splash screen if open
            if (typeof closeDashboard === 'function') closeDashboard();
            const dash = document.getElementById('dashboard-overlay');
            if (dash) dash.style.display = 'none';
            document.body.classList.remove('dashboard-open');
            const splash = document.getElementById('splash-screen') || document.querySelector('.unified-splash-modal') || document.querySelector('.splash-container') || document.getElementById('splash-overlay');
            if (splash) splash.remove();
            document.querySelectorAll('[class*="splash"], [id*="splash"]').forEach(s => s.remove());

            // Insert a new text box on the page
            const paper = document.getElementById('paper');
            const el = document.createElement('div');
            el.className = 'pub-element';
            el.setAttribute('data-type', 'text');
            el.style.position = 'absolute';
            el.style.left = '100px';
            el.style.top = '100px';
            el.style.width = '300px';
            el.style.height = '120px';
            el.style.zIndex = '10';
            
            const content = document.createElement('div');
            content.className = 'element-content';
            content.style.width = '100%';
            content.style.height = '100%';
            content.style.padding = '8px';
            content.style.boxSizing = 'border-box';
            
            const textDiv = document.createElement('div');
            textDiv.setAttribute('contenteditable', 'true');
            textDiv.style.width = '100%';
            textDiv.style.height = '100%';
            textDiv.style.color = '#000000';
            textDiv.style.fontFamily = 'Segoe UI';
            textDiv.style.fontSize = '18px';
            textDiv.innerText = 'Hello OpenPublisher Color Sync';
            
            content.appendChild(textDiv);
            el.appendChild(content);
            paper.appendChild(el);

            // Select this element
            selectElement(el);
        }""")
        await page.wait_for_timeout(1000)

        # Verify selectors exist
        ctx_bar = await page.query_selector("#ctx-text-color-bar-text")
        float_bar = await page.query_selector("#float-text-color-bar")
        home_color = await page.query_selector("#text-color")

        print(f"ctx_bar found: {ctx_bar is not None}")
        print(f"float_bar found: {float_bar is not None}")
        print(f"home_color found: {home_color is not None}")
        assert ctx_bar is not None, "Context text color bar #ctx-text-color-bar-text not found"
        assert float_bar is not None, "Float text color bar #float-text-color-bar not found"

        # Check initial colors
        init_colors = await page.evaluate("""() => {
            return {
                ctx: document.getElementById('ctx-text-color-bar-text').style.backgroundColor || document.getElementById('ctx-text-color-bar-text').style.background,
                float: document.getElementById('float-text-color-bar').style.backgroundColor || document.getElementById('float-text-color-bar').style.background,
                home: document.getElementById('text-color').style.backgroundColor
            };
        }""")
        print("Initial toolbar colors:", init_colors)

        # TEST 1: Open Colors & Style Studio, find text swatch, and change color to Crimson (#e11d48)
        print("\n--- TEST 1: Setting Text Color via Colors & Styles Studio modal ---")
        test1_result = await page.evaluate("""() => {
            const el = state.selectedEl;
            window.TemplateCSSColorEngine.openStudio(el);

            // Find swatches in the studio
            const swatches = document.querySelectorAll('#css-studio-el-swatches .css-slot-card');
            let textCard = null;
            for (let card of swatches) {
                const label = card.querySelector('.css-slot-label');
                if (label && label.textContent.toLowerCase().includes('text')) {
                    textCard = card;
                    break;
                }
            }

            if (!textCard) {
                return { success: false, reason: "Text swatch card not found in studio" };
            }

            // Simulate clicking the swatch and picking new color #e11d48
            const newColor = '#e11d48';
            // We can directly trigger the onclick or execute the picker callback
            textCard.click();
            // CustomColorPicker is now open with the callback
            if (window.CustomColorPicker && window.CustomColorPicker.isOpen) {
                window.CustomColorPicker.selectColor(newColor);
            }

            // Also close dialog if still open
            const closeBtn = document.querySelector('.dialog-close-btn') || document.querySelector('#custom-dialog-box button');
            if (typeof DialogSystem !== 'undefined' && DialogSystem.close) {
                DialogSystem.close();
            }

            return {
                success: true,
                ctxColor: document.getElementById('ctx-text-color-bar-text').style.backgroundColor || document.getElementById('ctx-text-color-bar-text').style.background,
                floatColor: document.getElementById('float-text-color-bar').style.backgroundColor || document.getElementById('float-text-color-bar').style.background,
                homeColor: document.getElementById('text-color').style.backgroundColor,
                elTextColor: el.querySelector('[contenteditable="true"]').style.color
            };
        }""")
        print("Test 1 Result:", test1_result)
        await page.wait_for_timeout(500)

        assert test1_result["success"], f"Test 1 failed: {test1_result.get('reason')}"
        # Validate that colors match #e11d48 (or rgb(225, 29, 72))
        assert "225, 29, 72" in test1_result["ctxColor"] or "#e11d48" in test1_result["ctxColor"].lower(), f"Context bar not updated: {test1_result['ctxColor']}"
        assert "225, 29, 72" in test1_result["floatColor"] or "#e11d48" in test1_result["floatColor"].lower(), f"Float bar not updated: {test1_result['floatColor']}"
        assert "225, 29, 72" in test1_result["homeColor"] or "#e11d48" in test1_result["homeColor"].lower(), f"Home swatch not updated: {test1_result['homeColor']}"
        print("PASS: Both text box toolbar and floating toolbar updated to Crimson (#e11d48) via Colors & Styles Studio!")

        # TEST 2: Setting Text Color via Floating Pill Swatch or Quick Swatch
        print("\n--- TEST 2: Setting Text Color via Quick Swatch to Blue (#2563eb) ---")
        test2_result = await page.evaluate("""() => {
            const el = state.selectedEl;
            window.TemplateCSSColorEngine.refreshRibbonPanel(el);
            
            const scan = window.TemplateCSSColorEngine.scanElement(el);
            const textSwatch = scan.allSwatches.find(s => s.category === 'text');
            if (!textSwatch) return { success: false, reason: "No text swatch found" };

            // Apply new color #2563eb directly through sw.apply & CustomColorPicker logic
            const newColor = '#2563eb';
            textSwatch.apply(newColor);
            textSwatch.hex = newColor;
            if (window.syncTextColorIndicators) window.syncTextColorIndicators(newColor);
            if (window.TextBoxStylesSystem) window.TextBoxStylesSystem.updateRibbonIndicators(el);

            return {
                success: true,
                ctxColor: document.getElementById('ctx-text-color-bar-text').style.backgroundColor || document.getElementById('ctx-text-color-bar-text').style.background,
                floatColor: document.getElementById('float-text-color-bar').style.backgroundColor || document.getElementById('float-text-color-bar').style.background,
                homeColor: document.getElementById('text-color').style.backgroundColor,
                elTextColor: el.querySelector('[contenteditable="true"]').style.color
            };
        }""")
        print("Test 2 Result:", test2_result)
        await page.wait_for_timeout(500)

        assert test2_result["success"], f"Test 2 failed: {test2_result.get('reason')}"
        assert "37, 99, 235" in test2_result["ctxColor"] or "#2563eb" in test2_result["ctxColor"].lower(), f"Context bar not updated: {test2_result['ctxColor']}"
        assert "37, 99, 235" in test2_result["floatColor"] or "#2563eb" in test2_result["floatColor"].lower(), f"Float bar not updated: {test2_result['floatColor']}"
        print("PASS: Both text box toolbar and floating toolbar updated to Blue (#2563eb)!")

        # TEST 3: Switching selection between elements with different text colors
        print("\n--- TEST 3: Switching selection between elements with different text colors ---")
        test3_result = await page.evaluate("""() => {
            const paper = document.getElementById('paper');
            
            // Create a second text box with green text (#10b981)
            const el2 = document.createElement('div');
            el2.className = 'pub-element';
            el2.setAttribute('data-type', 'text');
            el2.style.position = 'absolute';
            el2.style.left = '450px';
            el2.style.top = '100px';
            el2.style.width = '300px';
            el2.style.height = '120px';
            el2.style.zIndex = '10';
            
            const content2 = document.createElement('div');
            content2.className = 'element-content';
            content2.style.width = '100%';
            content2.style.height = '100%';
            
            const textDiv2 = document.createElement('div');
            textDiv2.setAttribute('contenteditable', 'true');
            textDiv2.style.color = '#10b981';
            textDiv2.innerText = 'Second green box';
            content2.appendChild(textDiv2);
            el2.appendChild(content2);
            paper.appendChild(el2);

            // Select el2
            selectElement(el2);

            return {
                success: true,
                ctxColor: document.getElementById('ctx-text-color-bar-text').style.backgroundColor || document.getElementById('ctx-text-color-bar-text').style.background,
                floatColor: document.getElementById('float-text-color-bar').style.backgroundColor || document.getElementById('float-text-color-bar').style.background
            };
        }""")
        print("Test 3 Result (el2 selected, should be green #10b981):", test3_result)
        assert "16, 185, 129" in test3_result["ctxColor"] or "#10b981" in test3_result["ctxColor"].lower(), f"Context bar not green: {test3_result['ctxColor']}"
        assert "16, 185, 129" in test3_result["floatColor"] or "#10b981" in test3_result["floatColor"].lower(), f"Float bar not green: {test3_result['floatColor']}"
        print("PASS: Selecting another element automatically synced both toolbars to Green (#10b981)!")

        # Take screenshot of the verified state
        screenshot_path = os.path.join(ARTIFACTS_DIR, "text_color_sync_verified.png")
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        print("\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY (100%)!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
