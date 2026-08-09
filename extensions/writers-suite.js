(function installWritersSuite() {
    console.log("🛠️ Writer's Suite Script initializing...");

    // --- 1. CSS INJECTION ---
    const style = document.createElement('style');
    // CSS extracted to style.css
    document.head.appendChild(style);

    // --- 2. UI INJECTION ---
    const reviewRibbon = document.getElementById('ribbon-review');
    
    if (reviewRibbon) {
        const analysisGroup = document.createElement('div');
        analysisGroup.className = 'group';
        
        // 11 Buttons in a clean horizontal flow
        analysisGroup.innerHTML = `<div class="tool-btn" style="min-width:55px;" onclick="window.WritersSuite.analyzeText('readability')"><i class="fas fa-glasses" style="color:var(--ui-theme-color)"></i>Grade</div>
            <div class="tool-btn" style="min-width:55px;" onclick="window.WritersSuite.analyzeText('tone')"><i class="fas fa-theater-masks" style="color:var(--ui-theme-color)"></i>Tone</div>
            <div class="tool-btn" style="min-width:55px;" onclick="window.WritersSuite.analyzeText('concise')"><i class="fas fa-compress-alt" style="color:var(--ui-theme-color)"></i>Concise</div>
            <div class="tool-btn" style="min-width:55px;" onclick="window.WritersSuite.analyzeText('passive')"><i class="fas fa-search-location" style="color:var(--ui-theme-color)"></i>Passive</div>
            <div class="tool-btn" style="min-width:55px;" onclick="window.WritersSuite.analyzeText('repetition')"><i class="fas fa-clone" style="color:var(--ui-theme-color)"></i>Echoes</div>
            <div class="tool-btn" style="min-width:55px;" onclick="window.WritersSuite.analyzeText('stats')"><i class="fas fa-calculator" style="color:var(--ui-theme-color)"></i>Stats</div>
            <div class="tool-btn" style="min-width:55px;" onclick="window.WritersSuite.analyzeText('readTime')"><i class="fas fa-clock" style="color:var(--ui-theme-color)"></i>Time</div>
            
            <!-- NEW 4 FEATURES -->
            <div class="tool-btn" style="min-width:55px;" onclick="window.WritersSuite.analyzeText('sentiment')"><i class="fas fa-smile-beam" style="color:var(--ui-theme-color)"></i>Sentiment</div>
            <div class="tool-btn" style="min-width:55px;" onclick="window.WritersSuite.analyzeText('seo')"><i class="fas fa-search" style="color:var(--ui-theme-color)"></i>Keywords</div>
            <div class="tool-btn" style="min-width:55px;" onclick="window.WritersSuite.analyzeText('jargon')"><i class="fas fa-graduation-cap" style="color:var(--ui-theme-color)"></i>Jargon</div>
            <div class="tool-btn" style="min-width:55px;" onclick="window.WritersSuite.analyzeText('cadence')"><i class="fas fa-wave-square" style="color:var(--ui-theme-color)"></i>Cadence</div>
            
            <div class="group-label">Analysis Suite</div>`;
        
        const focusGroup = document.createElement('div');
        focusGroup.className = 'group';
        focusGroup.innerHTML = `<div class="tool-btn" id="focus-mode-btn" onclick="window.WritersSuite.toggleFocusMode()"><i class="fas fa-eye"></i>Focus Mode</div>
            <div class="group-label">Environment</div>`;

        reviewRibbon.appendChild(analysisGroup);
        reviewRibbon.appendChild(focusGroup);
    }

    // --- 3. LOGIC ENGINE ---
    window.WritersSuite = {
        isFocusMode: false,

        toggleFocusMode: function() {
            this.isFocusMode = !this.isFocusMode;
            const btn = document.getElementById('focus-mode-btn');
            
            if (this.isFocusMode) {
                document.body.classList.add('focus-mode');
                if (btn) btn.classList.add('active-tool');
                DialogSystem.alert('Focus Mode Active', 'Click anywhere outside the paper to exit Focus Mode.');
            } else {
                document.body.classList.remove('focus-mode');
                if (btn) btn.classList.remove('active-tool');
            }
        },

        getSelectedText: function() {
            if (!state.selectedEl) return null;
            const content = state.selectedEl.querySelector('.element-content') || state.selectedEl;
            const text = content.innerText || content.textContent;
            return text.trim() ? text.trim() : null;
        },

        analyzeText: function(type) {
            const text = this.getSelectedText();

            if (!text) {
                DialogSystem.alert('Analysis Failed', 'Please select a text box containing text to run an analysis.');
                return;
            }

            let html = '';
            let title = '';

            if (type === 'readability') { html = this.runReadability(text); title = 'Readability Score'; } 
            else if (type === 'tone') { html = this.runToneAnalysis(text); title = 'Tone Analyzer'; } 
            else if (type === 'concise') { html = this.runConciseness(text); title = 'Conciseness Suggestions'; }
            else if (type === 'stats') { html = this.runStats(text); title = 'Text Statistics'; }
            else if (type === 'readTime') { html = this.runReadTime(text); title = 'Estimated Reading Time'; }
            else if (type === 'passive') { html = this.runPassiveVoice(text); title = 'Passive Voice Detector'; }
            else if (type === 'repetition') { html = this.runRepetition(text); title = 'Word Echoes'; }
            else if (type === 'sentiment') { html = this.runSentiment(text); title = 'Sentiment Analysis'; }
            else if (type === 'seo') { html = this.runSEO(text); title = 'Keyword Density'; }
            else if (type === 'jargon') { html = this.runJargon(text); title = 'Complexity & Jargon'; }
            else if (type === 'cadence') { html = this.runCadence(text); title = 'Sentence Cadence'; }

            DialogSystem.show(title, html, null, true);
        },

        // --- Helper Functions ---
        countSyllables: function(word) {
            word = word.toLowerCase();
            if(word.length <= 3) return 1;
            word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
            word = word.replace(/^y/, '');
            const syllables = word.match(/[aeiouy]{1,2}/g);
            return syllables ? syllables.length : 1;
        },

        // --- Existing 7 Tools ---
        runReadability: function(text) {
            const words = text.split(/\s+/).length;
            const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
            const syllables = text.split(/\s+/).reduce((acc, word) => acc + this.countSyllables(word), 0);
            let grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
            grade = Math.max(0, Math.round(grade * 10) / 10); 
            let interpretation = "Easily understood by an average 11-year-old student.";
            let color = "#15803d"; 
            if (grade > 8 && grade <= 12) { interpretation = "Understood by most high school students."; color = "#d97706"; } 
            else if (grade > 12) { interpretation = "College-level reading. May be difficult for a general audience."; color = "#b91c1c"; }

            return `<div class="analysis-card"><div class="analysis-title">Flesch-Kincaid Grade Level</div><div class="analysis-value" style="color: ${color}">${grade}</div><div class="analysis-desc">${interpretation}</div></div>`;
        },

        runToneAnalysis: function(text) {
            const lowerText = text.toLowerCase();
            const tones = {
                Urgent: ['now', 'hurry', 'alert', 'important', 'immediately', 'urgent', 'deadline', 'asap', 'quick'],
                Enthusiastic: ['great', 'amazing', 'excited', 'fantastic', 'awesome', 'love', 'thrilled', 'wonderful', 'perfect'],
                Professional: ['sincerely', 'regarding', 'ensure', 'facilitate', 'furthermore', 'accordingly', 'therefore', 'analysis'],
                Casual: ['hey', 'cool', 'stuff', 'totally', 'yeah', 'okay', 'like', 'super']
            };
            let scores = { Urgent: 0, Enthusiastic: 0, Professional: 0, Casual: 0 };
            const words = lowerText.split(/\s+/);
            words.forEach(word => {
                const cleanWord = word.replace(/[^a-z]/g, '');
                for (const [tone, keywords] of Object.entries(tones)) { if (keywords.includes(cleanWord)) scores[tone]++; }
            });
            let dominantTone = 'Neutral / Objective'; let maxScore = 0;
            for (const [tone, score] of Object.entries(scores)) { if (score > maxScore) { maxScore = score; dominantTone = tone; } }
            
            let breakdownHtml = '<div style="margin-top: 15px; font-size: 12px; color: #666;"><b>Detected Markers:</b><br>';
            if (maxScore === 0) breakdownHtml += 'No strong emotional or formal markers detected.';
            else for (const [tone, score] of Object.entries(scores)) { if (score > 0) breakdownHtml += `• ${tone}: ${score} hits<br>`; }
            breakdownHtml += '</div>';

            return `<div class="analysis-card"><div class="analysis-title">Dominant Tone</div><div class="analysis-value">${dominantTone}</div><div class="analysis-desc">Based on keyword frequency and phrasing analysis.</div></div>${breakdownHtml}`;
        },

        runConciseness: function(text) {
            const lowerText = text.toLowerCase();
            const suggestions = [];
            const rules = [
                { bad: "in order to", good: "to" }, { bad: "due to the fact that", good: "because" },
                { bad: "at this point in time", good: "now" }, { bad: "a large number of", good: "many" },
                { bad: "make a decision", good: "decide" }, { bad: "for the purpose of", good: "for" },
                { bad: "in the event that", good: "if" }, { bad: "utilize", good: "use" }, { bad: "absolutely essential", good: "essential" }
            ];
            rules.forEach(rule => { if (lowerText.includes(rule.bad)) suggestions.push(`<li>Replace <b>"${rule.bad}"</b> with <span>"${rule.good}"</span></li>`); });

            if (suggestions.length === 0) return `<div class="analysis-card" style="border-left: 4px solid #15803d;"><div class="analysis-title">Excellent!</div><div class="analysis-desc" style="color:#15803d; font-weight:600;">No filler phrases detected. Your text is concise and direct.</div></div>`;
            return `<div class="analysis-card" style="border-left: 4px solid #d97706;"><div class="analysis-title">Suggestions Found (${suggestions.length})</div><div class="analysis-desc">Consider making these changes to make your writing punchier:</div><ul class="suggestion-list">${suggestions.join('')}</ul></div>`;
        },

        runStats: function(text) {
            const words = text.split(/\s+/).filter(Boolean).length;
            const charsAll = text.length;
            const charsNoSpace = text.replace(/\s+/g, '').length;
            const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
            const paragraphs = text.split(/\n+/).filter(Boolean).length || 1;

            return `
                <div class="analysis-card" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: center;">
                    <div><div class="analysis-desc">Words</div><div class="analysis-value" style="font-size:20px; color:#333;">${words}</div></div>
                    <div><div class="analysis-desc">Sentences</div><div class="analysis-value" style="font-size:20px; color:#333;">${sentences}</div></div>
                    <div><div class="analysis-desc">Chars (No Spaces)</div><div class="analysis-value" style="font-size:20px; color:#333;">${charsNoSpace}</div></div>
                    <div><div class="analysis-desc">Paragraphs</div><div class="analysis-value" style="font-size:20px; color:#333;">${paragraphs}</div></div>
                </div>
            `;
        },

        runReadTime: function(text) {
            const words = text.split(/\s+/).filter(Boolean).length;
            const wpm = 238;
            const timeInMinutes = words / wpm;
            const minutes = Math.floor(timeInMinutes);
            const seconds = Math.round((timeInMinutes - minutes) * 60);

            let timeStr = '';
            if (minutes === 0 && seconds < 10) timeStr = "Less than 10 seconds";
            else if (minutes === 0) timeStr = `${seconds} seconds`;
            else timeStr = `${minutes} min ${seconds} sec`;

            return `<div class="analysis-card"><div class="analysis-title">Reading Time</div><div class="analysis-value">${timeStr}</div><div class="analysis-desc">Based on an average adult reading speed of 238 words per minute.</div></div>`;
        },

        runPassiveVoice: function(text) {
            const passiveRegex = /\b(am|are|is|was|were|be|been|being)\s+([a-z]+(ed|en|wn|t))\b/gi;
            let matches = []; let match;
            while ((match = passiveRegex.exec(text)) !== null) { matches.push(match[0].toLowerCase()); }

            if (matches.length === 0) return `<div class="analysis-card" style="border-left: 4px solid #15803d;"><div class="analysis-title">Active & Strong!</div><div class="analysis-desc" style="color:#15803d; font-weight:600;">No passive voice detected. Your writing is active and direct.</div></div>`;
            const uniqueMatches = [...new Set(matches)];
            const listHtml = uniqueMatches.map(m => `<li><b>"${m}"</b></li>`).join('');

            return `<div class="analysis-card" style="border-left: 4px solid #b91c1c;"><div class="analysis-title">Passive Voice Detected (${matches.length} instances)</div><div class="analysis-desc">Consider changing these phrases to active voice (e.g., "She threw the ball" instead of "The ball was thrown"):</div><ul class="suggestion-list">${listHtml}</ul></div>`;
        },

        runRepetition: function(text) {
            const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
            const frequency = {};
            words.forEach(word => { if (word.length > 4) frequency[word] = (frequency[word] || 0) + 1; });
            const sortedWords = Object.keys(frequency).filter(w => frequency[w] > 1).sort((a, b) => frequency[b] - frequency[a]);

            if (sortedWords.length === 0) return `<div class="analysis-card"><div class="analysis-title">Great Vocabulary!</div><div class="analysis-desc">No significant word repetition detected in your text.</div></div>`;
            const tagsHtml = sortedWords.slice(0, 8).map(w => `<span class="word-tag">${w} (${frequency[w]})</span>`).join('');
            return `<div class="analysis-card"><div class="analysis-title">Most Repeated Words</div><div class="analysis-desc" style="margin-bottom:10px;">You've used these words multiple times. Consider using a thesaurus to diversify:</div><div>${tagsHtml}</div></div>`;
        },

        // --- NEW: THE 4 ADDITIONAL TOOLS ---
        
        runSentiment: function(text) {
            const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
            
            const posWords = ['good', 'great', 'awesome', 'excellent', 'happy', 'positive', 'success', 'benefit', 'love', 'best', 'win', 'amazing', 'perfect', 'beautiful', 'glad', 'joy', 'smile'];
            const negWords = ['bad', 'terrible', 'awful', 'negative', 'fail', 'loss', 'sad', 'hate', 'worst', 'problem', 'error', 'wrong', 'angry', 'upset', 'poor', 'issue'];
            
            let posCount = 0, negCount = 0;
            words.forEach(w => {
                if (posWords.includes(w)) posCount++;
                if (negWords.includes(w)) negCount++;
            });

            let sentiment = "Neutral";
            let color = "#64748b";
            if (posCount > negCount + 1) { sentiment = "Positive 😊"; color = "#15803d"; }
            else if (negCount > posCount + 1) { sentiment = "Negative 😞"; color = "#b91c1c"; }

            return `
                <div class="analysis-card">
                    <div class="analysis-title">Emotional Sentiment</div>
                    <div class="analysis-value" style="color: ${color}">${sentiment}</div>
                    <div class="analysis-desc">We found <b>${posCount}</b> positive and <b>${negCount}</b> negative keywords.</div>
                </div>
            `;
        },

        runSEO: function(text) {
            const stopWords = ['the', 'is', 'at', 'which', 'and', 'on', 'a', 'an', 'in', 'of', 'to', 'for', 'with', 'it', 'as', 'be', 'are', 'that', 'this', 'from', 'by', 'or', 'you', 'your', 'we', 'our', 'will', 'can'];
            const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
            
            const frequency = {};
            words.forEach(w => {
                if (w.length > 2 && !stopWords.includes(w)) {
                    frequency[w] = (frequency[w] || 0) + 1;
                }
            });

            const sortedKeys = Object.keys(frequency).sort((a, b) => frequency[b] - frequency[a]).slice(0, 5);
            
            if (sortedKeys.length === 0) {
                return `<div class="analysis-card"><div class="analysis-title">Keyword Density</div><div class="analysis-desc">Not enough text to determine prominent keywords.</div></div>`;
            }

            const tagsHtml = sortedKeys.map(w => `<span class="word-tag">${w} (${frequency[w]}x)</span>`).join('');

            return `
                <div class="analysis-card">
                    <div class="analysis-title">Top 5 Keywords</div>
                    <div class="analysis-desc" style="margin-bottom:10px;">If this is for a flyer or SEO, these are the core subjects of your text:</div>
                    <div>${tagsHtml}</div>
                </div>
            `;
        },

        runJargon: function(text) {
            const words = text.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean);
            const complexWords = [];

            words.forEach(w => {
                // If a word has 4 or more syllables, flag it as complex/jargon
                if (this.countSyllables(w) >= 4) {
                    complexWords.push(w);
                }
            });

            if (complexWords.length === 0) {
                return `<div class="analysis-card" style="border-left: 4px solid #15803d;"><div class="analysis-title">Accessible Vocabulary</div><div class="analysis-desc" style="color:#15803d; font-weight:600;">No overly complex words detected.</div></div>`;
            }

            const uniqueComplex = [...new Set(complexWords)];
            const tagsHtml = uniqueComplex.map(w => `<span class="word-tag warning">${w}</span>`).join('');

            return `
                <div class="analysis-card" style="border-left: 4px solid #d97706;">
                    <div class="analysis-title">Complexity & Jargon</div>
                    <div class="analysis-desc" style="margin-bottom:10px;">These words have 4 or more syllables. Consider swapping them for simpler alternatives to increase readability:</div>
                    <div>${tagsHtml}</div>
                </div>
            `;
        },

        runCadence: function(text) {
            const sentences = text.split(/[.!?]+/).filter(Boolean);
            if (sentences.length === 0) return `<div class="analysis-card"><div class="analysis-desc">Please write at least one full sentence to analyze cadence.</div></div>`;

            let totalWords = 0;
            const runOns = [];

            sentences.forEach(s => {
                const wordCount = s.split(/\s+/).filter(Boolean).length;
                totalWords += wordCount;
                if (wordCount > 25) {
                    // Grab just the first 50 chars of the sentence for the preview
                    runOns.push(s.trim().substring(0, 50) + "..."); 
                }
            });

            const avgLength = Math.round(totalWords / sentences.length);
            
            let html = `
                <div class="analysis-card">
                    <div class="analysis-title">Sentence Cadence</div>
                    <div class="analysis-value" style="font-size:20px; color:#333;">${avgLength} <span style="font-size:12px; color:#666;">words/sentence average</span></div>
                    <div class="analysis-desc">Varying sentence length keeps readers engaged. 15-20 words per sentence is ideal for business copy.</div>
                </div>
            `;

            if (runOns.length > 0) {
                const listHtml = runOns.map(r => `<li>"${r}"</li>`).join('');
                html += `
                    <div class="analysis-card" style="border-left: 4px solid #b91c1c;">
                        <div class="analysis-title">Run-on Sentences Detected</div>
                        <div class="analysis-desc">These sentences are over 25 words long. Consider breaking them up:</div>
                        <ul class="suggestion-list">
                            ${listHtml}
                        </ul>
                    </div>
                `;
            }

            return html;
        }
    };

    // --- 4. FOCUS MODE EXIT LISTENER ---
    document.getElementById('viewport').addEventListener('mousedown', (e) => {
        if (window.WritersSuite.isFocusMode) {
            if (e.target.id === 'viewport' || e.target.classList.contains('viewport')) {
                window.WritersSuite.toggleFocusMode();
            }
        }
    });

    console.log("✅ Writer's Suite (11 Tools) added successfully.");
})();


(function installThesaurusSidebar() {
    document.getElementById('op-thesaurus-sidebar')?.remove();

    const panel = document.createElement('div');
    panel.id = 'op-thesaurus-sidebar';
    panel.className = 'sidebar-panel op-sidebar';
    panel.innerHTML = `<div class="op-sidebar-header">
            <span class="op-sidebar-title">Thesaurus</span>
            <div class="op-sidebar-top-btns">
                <button class="custom-dialog-close" onclick="document.getElementById('op-thesaurus-sidebar').classList.remove('visible')"><i class="fas fa-times"></i></button>
            </div>
        </div>
        <div style="padding: 15px; display: flex; gap: 8px;">
            <input type="text" id="thesaurus-search-input" placeholder="Search a word..." style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px;">
            <button onclick="window.ThesaurusTool.search()" class="btn-primary" style="padding:8px 12px;"><i class="fas fa-search"></i></button>
        </div>
        <div id="thesaurus-results" style="padding: 0 15px 15px 15px; overflow-y:auto; height:calc(100% - 100px); background:#f9f9f9;">
            <p style="color:#666; font-size:13px; text-align:center; margin-top:20px;">Search for a word to find synonyms.</p>
        </div>
    `;
    let workspace = document.querySelector('.workspace');
    if (workspace) workspace.appendChild(panel);
    else document.body.appendChild(panel);

    // Setup enter key listener
    setTimeout(() => {
        document.getElementById('thesaurus-search-input')?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                window.ThesaurusTool.search();
            }
        });
    }, 500);
})();
