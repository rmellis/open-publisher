window.flowTextBoxes = function(headBox) {
    if (!headBox) return;
    
    // 1. Gather ALL text in the chain
    let fullTextStr = '';
    let current = headBox;
    let boxes = [];
    while(current) {
        const content = current.querySelector('.text-content') || current.querySelector('div[contenteditable]');
        if (content) {
            let text = content.innerText;
            if (fullTextStr.length > 0 && !/\s$/.test(fullTextStr) && !/^\s/.test(text)) {
                fullTextStr += ' ';
            }
            fullTextStr += text;
            boxes.push({box: current, content: content});
        }
        const nextId = current.getAttribute('data-next-box');
        current = nextId ? document.getElementById(nextId) : null;
    }

    if (boxes.length < 2) return;

    // 2. Remember caret position globally across the chain
    const sel = window.getSelection();
    let globalCaretOffset = -1;
    if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        let offsetAccumulator = 0;
        for (let i = 0; i < boxes.length; i++) {
            if (boxes[i].content.contains(range.commonAncestorContainer)) {
                const preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(boxes[i].content);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                globalCaretOffset = offsetAccumulator + preCaretRange.toString().length;
                break;
            }
            let textLen = boxes[i].content.innerText.length;
            if (i > 0 && !/\s$/.test(boxes[i-1].content.innerText) && !/^\s/.test(boxes[i].content.innerText)) {
                textLen += 1; 
            }
            offsetAccumulator += textLen;
        }
    }

    // 3. Flow text through the boxes (Binary Search with Off-Screen Clone)
    const tokens = fullTextStr.split(/(\s+)/);
    let tokenIndex = 0;
    let targetCaretBox = null;
    let localCaretOffset = 0;
    let charAccumulator = 0;

    const measureContainer = document.createElement('div');
    measureContainer.style.position = 'absolute';
    measureContainer.style.visibility = 'hidden';
    measureContainer.style.pointerEvents = 'none';
    measureContainer.style.left = '-9999px';
    measureContainer.style.top = '-9999px';
    document.body.appendChild(measureContainer);

    for (let i = 0; i < boxes.length; i++) {
        const boxObj = boxes[i];
        
        if (i === boxes.length - 1) {
            // Last box gets all remaining text
            const remaining = tokens.slice(tokenIndex).join('');
            boxObj.content.innerText = remaining;
            
            const boxLength = remaining.length;
            if (globalCaretOffset >= charAccumulator && globalCaretOffset <= charAccumulator + boxLength) {
                targetCaretBox = boxObj.content;
                localCaretOffset = globalCaretOffset - charAccumulator;
            }
            break;
        }
        
        // Clone for invisible measurement
        const clone = boxObj.content.cloneNode(false);
        const computed = window.getComputedStyle(boxObj.content);
        clone.style.width = computed.width;
        clone.style.height = computed.height;
        clone.style.boxSizing = computed.boxSizing;
        clone.style.padding = computed.padding;
        clone.style.font = computed.font;
        clone.style.lineHeight = computed.lineHeight;
        clone.style.wordWrap = computed.wordWrap;
        clone.style.whiteSpace = computed.whiteSpace;
        measureContainer.appendChild(clone);

        const remainingTokens = tokens.slice(tokenIndex);
        let low = 0;
        let high = remainingTokens.length;
        let bestFit = 0;

        clone.innerText = remainingTokens.join('');
        if (clone.scrollHeight <= clone.clientHeight) {
            bestFit = remainingTokens.length;
        } else {
            while (low <= high) {
                let mid = Math.floor((low + high) / 2);
                clone.innerText = remainingTokens.slice(0, mid).join('');
                if (clone.scrollHeight <= clone.clientHeight) {
                    bestFit = mid;
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            }
        }
        
        if (bestFit === 0 && remainingTokens.length > 0) bestFit = 1;
        
        const fittedTokens = remainingTokens.slice(0, bestFit);
        const currentText = fittedTokens.join('');
        boxObj.content.innerText = currentText;
        
        const boxLength = currentText.length;
        if (globalCaretOffset >= charAccumulator && globalCaretOffset <= charAccumulator + boxLength) {
            targetCaretBox = boxObj.content;
            localCaretOffset = globalCaretOffset - charAccumulator;
        }
        
        charAccumulator += boxLength;
        tokenIndex += bestFit;
        measureContainer.innerHTML = ''; // clear for next loop
    }
    
    document.body.removeChild(measureContainer);

    // 4. Restore caret
    if (targetCaretBox && globalCaretOffset !== -1) {
        const walker = document.createTreeWalker(targetCaretBox, NodeFilter.SHOW_TEXT, null, false);
        let node;
        let currentOffset = 0;
        let set = false;
        while ((node = walker.nextNode())) {
            const len = node.nodeValue.length;
            if (currentOffset + len >= localCaretOffset) {
                const newRange = document.createRange();
                let nodeOffset = localCaretOffset - currentOffset;
                if (nodeOffset > node.nodeValue.length) nodeOffset = node.nodeValue.length;
                if (nodeOffset < 0) nodeOffset = 0;
                
                newRange.setStart(node, nodeOffset);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
                set = true;
                break;
            }
            currentOffset += len;
        }
        if (!set && targetCaretBox.childNodes.length > 0) {
            const newRange = document.createRange();
            newRange.selectNodeContents(targetCaretBox);
            newRange.collapse(false);
            sel.removeAllRanges();
            sel.addRange(newRange);
        }
        targetCaretBox.focus();
    }
};


// --- MIGRATED TEXT FLOW LISTENER ---
window._flowTimeout = null;
window.addEventListener('input', function(e) {
    if (e.target && e.target.isContentEditable) {
        const box = e.target.closest('.pub-element');
        if (box && (box.getAttribute('data-next-box') || box.getAttribute('data-prev-box'))) {
            let headBox = box;
            while(headBox.getAttribute('data-prev-box')) {
                const prev = document.getElementById(headBox.getAttribute('data-prev-box'));
                if (prev) headBox = prev;
                else break;
            }
            clearTimeout(window._flowTimeout);
            window._flowTimeout = setTimeout(() => {
                flowTextBoxes(headBox);
            }, 50);
        }
    }
});

