window.showPagePartsModal = function() {
    const html = `
    <style>
    .pp-card { cursor: pointer; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 8px; text-align: center; background: #ffffff; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .pp-card:hover { transform: translateY(-2px); border-color: var(--ui-theme-color); box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
    .pp-card-title { display: block; color: #1e293b; font-size: 12px; font-weight: 600; margin-bottom: 2px; }
    .pp-card-desc { font-size: 10px; color: #64748b; line-height: 1.2; display: block; }
    .pp-preview-container { height: 45px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
    .pp-scroll::-webkit-scrollbar { width: 6px; }
    .pp-scroll::-webkit-scrollbar-track { background: transparent; }
    .pp-scroll::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.2); border-radius: 10px; }
    </style>
    <div style="padding: 0px; font-family: 'Inter', system-ui, sans-serif;">
        <div style="background: linear-gradient(135deg, var(--ui-theme-color), var(--ui-theme-dark)); border-radius: 0 0 12px 12px; padding: 15px; color: white; text-align: center; margin: -20px -20px 15px -20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 2px 0; font-size: 18px; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">Page Parts Library</h2>
            <p style="margin: 0; font-size: 12px; opacity: 0.9;">Click to drop pre-designed structural elements into your publication.</p>
        </div>
        <div class="pp-scroll" style="max-height: 50vh; overflow-y: auto; overflow-x: hidden; padding-right: 5px; margin-right: -5px;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
            <!-- Sidebar -->
            <div class="pp-card" onclick="insertPagePart('sidebar')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.65); transform-origin: center;">
                        <div style="width: 40px; height: 90px; background:var(--ui-theme-color); border-radius:4px; opacity:0.8;"></div>
                    </div>
                </div>
                <span class="pp-card-title">Sidebar</span>
                <span class="pp-card-desc">Colored side-content block.</span>
            </div>
            
            <!-- Pull Quote -->
            <div class="pp-card" onclick="insertPagePart('pullquote')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width: 80px; height: 40px; border-top:3px solid var(--ui-theme-color); border-bottom:3px solid var(--ui-theme-color); display:flex; align-items:center; justify-content:center;">
                            <span style="font-family:'Playfair Display',serif; font-style:italic; color:var(--ui-theme-color); font-size:12px;">"Quote"</span>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Pull Quote</span>
                <span class="pp-card-desc">Bordered text highlighting.</span>
            </div>
            
            <!-- Heading -->
            <div class="pp-card" onclick="insertPagePart('heading')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width: 90px; height: 30px; border-bottom:3px solid var(--ui-theme-color); text-align:left; display:flex; flex-direction:column; justify-content:flex-end; gap:4px;">
                            <div style="width:70%; height:8px; background:var(--ui-theme-dark);"></div>
                            <div style="width:40%; height:4px; background:#999; margin-bottom:4px;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Heading</span>
                <span class="pp-card-desc">Pre-styled section header.</span>
            </div>
            
            <!-- Callout -->
            <div class="pp-card" onclick="insertPagePart('callout')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width: 80px; height: 50px; border-left:4px solid var(--ui-theme-color); background:#f0f0f0;"></div>
                    </div>
                </div>
                <span class="pp-card-title">Info Callout</span>
                <span class="pp-card-desc">Boxed highlight for notes.</span>
            </div>
            
            <!-- Contact -->
            <div class="pp-card" onclick="insertPagePart('contact')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width: 100px; height: 20px; border-top:2px solid #ccc; display:flex; justify-content:space-between; padding-top:5px;">
                            <div style="width:20%; height:4px; background:#999;"></div><div style="width:20%; height:4px; background:#999;"></div><div style="width:20%; height:4px; background:#999;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Contact Block</span>
                <span class="pp-card-desc">Footer with phone slots.</span>
            </div>

            <!-- Step -->
            <div class="pp-card" onclick="insertPagePart('step')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
                            <div style="width:20px; height:20px; border-radius:50%; background:var(--ui-theme-color);"></div>
                            <div style="width:50px; height:4px; background:#999;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Step (Left)</span>
                <span class="pp-card-desc">List item with left number.</span>
            </div>
            
            <!-- Step Right -->
            <div class="pp-card" onclick="insertPagePart('step-right')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
                            <div style="width:50px; height:4px; background:#999;"></div>
                            <div style="width:20px; height:20px; border-radius:50%; background:var(--ui-theme-color);"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Step (Right)</span>
                <span class="pp-card-desc">List item with right number.</span>
            </div>

            <!-- Tear-off Coupon -->
            <div class="pp-card" onclick="insertPagePart('tear-off')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width: 80px; height: 40px; border:2px dashed var(--ui-theme-color); display:flex; align-items:center; justify-content:center;">
                            <div style="width:40%; height:4px; background:var(--ui-theme-dark);"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Coupon</span>
                <span class="pp-card-desc">Dashed box for offers.</span>
            </div>

            <!-- Author Bio -->
            <div class="pp-card" onclick="insertPagePart('bio')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
                            <div style="width:30px; height:30px; border-radius:50%; background:#e0e0e0;"></div>
                            <div style="width:40px;">
                                <div style="height:4px; background:var(--ui-theme-dark); margin-bottom:4px;"></div>
                                <div style="height:3px; background:#999;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Author Bio</span>
                <span class="pp-card-desc">Avatar and credentials.</span>
            </div>

            <!-- Checklist -->
            <div class="pp-card" onclick="insertPagePart('checklist')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
                            <div style="width:16px; height:16px; border-radius:50%; background:#4CAF50; color:#fff; display:flex; align-items:center; justify-content:center; font-size:10px;">✓</div>
                            <div style="width:60px; height:4px; background:#999;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Checklist Item</span>
                <span class="pp-card-desc">Green checkmark line.</span>
            </div>

            <!-- Menu Item -->
            <div class="pp-card" onclick="insertPagePart('menu-item')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px;">
                            <div style="display:flex; align-items:flex-end; gap:5px; width:80px;">
                                <div style="width:30px; height:4px; background:var(--ui-theme-dark);"></div>
                                <div style="flex-grow:1; border-bottom:2px dotted #ccc;"></div>
                                <div style="width:15px; height:4px; background:var(--ui-theme-color);"></div>
                            </div>
                            <div style="width:80px; height:3px; background:#ccc; opacity:0.5;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Menu Item</span>
                <span class="pp-card-desc">Title, dotted line, price.</span>
            </div>

            <!-- Photo Block -->
            <div class="pp-card" onclick="insertPagePart('photo-block')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width: 70px; height: 60px; border:1px solid #ddd; background:#f9f9f9; padding:5px; box-sizing:border-box;">
                            <div style="width:100%; height:35px; background:#e0e0e0; margin-bottom:5px;"></div>
                            <div style="width:80%; height:3px; background:#ccc; margin:0 auto;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Photo Block</span>
                <span class="pp-card-desc">Placeholder and caption.</span>
            </div>
            
            <!-- Review -->
            <div class="pp-card" onclick="insertPagePart('review')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="color:#FFD700; font-size:16px; letter-spacing:1px; margin-bottom:5px; text-align:center;">★★★★★</div>
                        <div style="width:60px; height:4px; background:#ccc; margin:0 auto 4px auto;"></div>
                        <div style="width:40px; height:3px; background:#eee; margin:0 auto;"></div>
                    </div>
                </div>
                <span class="pp-card-title">Review Quote</span>
                <span class="pp-card-desc">5-star rating layout.</span>
            </div>
            
            <!-- Event Date -->
            <div class="pp-card" onclick="insertPagePart('event-date')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div style="width:30px; height:30px; border:2px solid var(--ui-theme-color); border-radius:4px; display:flex; flex-direction:column; overflow:hidden;">
                                <div style="height:10px; background:var(--ui-theme-color);"></div>
                                <div style="flex-grow:1; background:#fff;"></div>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:3px;">
                                <div style="width:40px; height:4px; background:var(--ui-theme-dark);"></div>
                                <div style="width:60px; height:3px; background:#ccc;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Event Date</span>
                <span class="pp-card-desc">Calendar badge block.</span>
            </div>
            
            <!-- Stat Block -->
            <div class="pp-card" onclick="insertPagePart('stat')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                            <div style="font-size:24px; font-weight:bold; color:var(--ui-theme-color); line-height:1;">99%</div>
                            <div style="width:20px; height:2px; background:var(--ui-theme-dark);"></div>
                            <div style="width:40px; height:3px; background:#ccc;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Stat Callout</span>
                <span class="pp-card-desc">Large highlighted number.</span>
            </div>
            
            <!-- Signature -->
            <div class="pp-card" onclick="insertPagePart('signature')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; flex-direction:column; align-items:center; gap:4px; width:80px;">
                            <div style="display:flex; align-items:flex-end; width:100%; gap:4px;">
                                <span style="font-size:12px; font-weight:bold; color:var(--ui-theme-dark);">X</span>
                                <div style="flex-grow:1; border-bottom:1px solid #333; margin-bottom:2px;"></div>
                            </div>
                            <div style="width:60px; height:3px; background:#ccc;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Signature Line</span>
                <span class="pp-card-desc">Sign-here dotted line.</span>
            </div>
            
            <!-- Pros/Cons -->
            <div class="pp-card" onclick="insertPagePart('pros-cons')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.6); transform-origin: center;">
                        <div style="display:flex; gap:10px;">
                            <div style="border:2px solid #4CAF50; width:30px; height:40px; border-radius:4px; padding:4px; display:flex; flex-direction:column; gap:4px;">
                                <div style="width:10px; height:3px; background:#4CAF50;"></div>
                                <div style="width:20px; height:2px; background:#ccc;"></div>
                                <div style="width:20px; height:2px; background:#ccc;"></div>
                            </div>
                            <div style="border:2px solid #F44336; width:30px; height:40px; border-radius:4px; padding:4px; display:flex; flex-direction:column; gap:4px;">
                                <div style="width:10px; height:3px; background:#F44336;"></div>
                                <div style="width:20px; height:2px; background:#ccc;"></div>
                                <div style="width:20px; height:2px; background:#ccc;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Pros & Cons</span>
                <span class="pp-card-desc">Two-column list layout.</span>
            </div>
            
            <!-- Q&A Block -->
            <div class="pp-card" onclick="insertPagePart('qa-block')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <div style="display:flex; align-items:flex-start; gap:4px;">
                                <span style="font-weight:bold; color:var(--ui-theme-color); font-size:12px;">Q</span>
                                <div style="width:50px; height:3px; background:var(--ui-theme-dark); margin-top:4px;"></div>
                            </div>
                            <div style="display:flex; align-items:flex-start; gap:4px;">
                                <span style="font-weight:bold; color:#888; font-size:12px;">A</span>
                                <div style="width:60px; height:3px; background:#ccc; margin-top:4px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Q&A Block</span>
                <span class="pp-card-desc">Question and Answer list.</span>
            </div>
            
            <!-- Key Takeaway -->
            <div class="pp-card" onclick="insertPagePart('takeaway')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width:70px; height:40px; background:#f5f5f5; border-left:4px solid var(--ui-theme-color); border-radius:4px; padding:6px; box-sizing:border-box;">
                            <div style="width:30px; height:3px; background:var(--ui-theme-color); margin-bottom:6px;"></div>
                            <div style="width:50px; height:3px; background:#999; margin-bottom:4px;"></div>
                            <div style="width:40px; height:3px; background:#999;"></div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Key Takeaway</span>
                <span class="pp-card-desc">Tinted summary box.</span>
            </div>
            
            <!-- Warning Alert -->
            <div class="pp-card" onclick="insertPagePart('warning')">
                <div class="pp-preview-container">
                    <div style="transform: scale(0.7); transform-origin: center;">
                        <div style="width:80px; height:35px; border:1px solid #FF9800; background:#FFF3E0; border-radius:4px; display:flex; align-items:center; padding:4px; gap:6px; box-sizing:border-box;">
                            <div style="color:#FF9800; font-size:14px; font-weight:bold;">⚠</div>
                            <div style="display:flex; flex-direction:column; gap:3px;">
                                <div style="width:20px; height:3px; background:#E65100;"></div>
                                <div style="width:30px; height:2px; background:#FFB74D;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="pp-card-title">Warning Alert</span>
                <span class="pp-card-desc">Orange caution banner.</span>
            </div>
            </div>
        </div>
    </div>
    `;
    if (typeof DialogSystem !== 'undefined') {
        DialogSystem.show('Insert Page Part', html, null, true);
    }
};


window.insertPagePart = function(type) {
    if (typeof DialogSystem !== 'undefined') DialogSystem.close();
    
    let htmlContent = '';
    let w = 200, h = 200;
    
    if (type === 'sidebar') {
        w = 250; h = 600;
        htmlContent = `<div style="padding:20px; height:100%; box-sizing:border-box; background:var(--pub-color); color:#fff; overflow:hidden;" contenteditable="true">
            <h2 style="margin-top:0; border-bottom: 2px solid rgba(255,255,255,0.5); padding-bottom:10px; font-family:inherit; font-weight:bold;">Sidebar Title</h2>
            <p style="font-size:14px; line-height:1.6; font-family:inherit;">Use this space to highlight key information, related links, or a brief summary. This sidebar is designed to snap to the edge of your page and draw the reader's eye to important secondary details.</p>
        </div>`;
    } else if (type === 'pullquote') {
        w = 350; h = 180;
        htmlContent = `<div style="height:100%; box-sizing:border-box; border-top: 3px solid var(--pub-color); border-bottom: 3px solid var(--pub-color); display:flex; align-items:center; justify-content:center; padding: 10px;">
            <div style="width:100%; text-align:center; font-family: 'Playfair Display', Georgia, serif; font-style:italic; font-size: 24px; color:var(--pub-color); line-height: 1.4;" contenteditable="true">
                "This is an impactful pull quote that draws the reader's attention to a critical point in your publication."
            </div>
        </div>`;
    } else if (type === 'heading') {
        w = 500; h = 100;
        htmlContent = `<div style="padding:10px; height:100%; box-sizing:border-box; border-bottom: 4px solid var(--pub-color);" contenteditable="true">
            <h1 style="margin:0; font-size:36px; color:var(--ui-theme-dark); font-family: inherit; font-weight:bold;">Main Heading Title</h1>
            <p style="margin:5px 0 0 0; font-size:16px; color:#555; font-family:inherit; font-style:italic;">A brief subtitle goes here to provide context for the section below.</p>
        </div>`;
    } else if (type === 'callout') {
        w = 300; h = 150;
        htmlContent = `<div style="height:100%; box-sizing:border-box; border-left: 6px solid var(--pub-color); background: rgba(0,0,0,0.04); padding: 20px 15px;" contenteditable="true">
            <h3 style="margin:0 0 5px 0; color:var(--pub-color); font-family:inherit; font-size:18px;">Important Note</h3>
            <p style="margin:0; font-size:14px; color:#444; font-family:inherit; line-height: 1.5;">This callout box is perfect for highlighting tips, warnings, or secondary information that shouldn't be missed.</p>
        </div>`;
    } else if (type === 'contact') {
        w = 400; h = 80;
        htmlContent = `<div style="height:100%; box-sizing:border-box; border-top: 2px solid #ccc; padding-top: 15px; display:flex; justify-content:space-between; font-size:14px; font-family:inherit; color:#555;" contenteditable="true">
            <div><strong>Phone:</strong> (555) 123-4567</div>
            <div><strong>Email:</strong> hello@example.com</div>
            <div><strong>Web:</strong> www.example.com</div>
        </div>`;
    } else if (type === 'step') {
        w = 300; h = 120;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; align-items:flex-start; gap: 15px;">
            <div style="width:40px; height:40px; background:var(--pub-color); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:bold; flex-shrink:0;">1</div>
            <div style="padding-top:2px;" contenteditable="true">
                <h3 style="margin:0 0 5px 0; color:var(--ui-theme-dark); font-family:inherit; font-size:18px;">Step One</h3>
                <p style="margin:0; font-size:14px; color:#444; font-family:inherit; line-height:1.5;">Describe the first step of your process here. Keep it concise and clear.</p>
            </div>
        </div>`;
    } else if (type === 'step-right') {
        w = 300; h = 120;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; align-items:flex-start; gap: 15px; text-align:right;">
            <div style="padding-top:2px;" contenteditable="true">
                <h3 style="margin:0 0 5px 0; color:var(--ui-theme-dark); font-family:inherit; font-size:18px;">Step Two</h3>
                <p style="margin:0; font-size:14px; color:#444; font-family:inherit; line-height:1.5;">Describe the next step of your process here. Keep it concise and clear.</p>
            </div>
            <div style="width:40px; height:40px; background:var(--pub-color); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:bold; flex-shrink:0;">2</div>
        </div>`;
    } else if (type === 'tear-off') {
        w = 300; h = 150;
        htmlContent = `<div style="height:100%; box-sizing:border-box; border: 3px dashed var(--pub-color); padding: 20px; text-align:center; background:#fff;" contenteditable="true">
            <h2 style="margin:0 0 10px 0; color:var(--ui-theme-dark); font-family:inherit; text-transform:uppercase; font-weight:bold; font-size:24px;">20% OFF</h2>
            <p style="margin:0; font-size:14px; color:#555; font-family:inherit; line-height:1.4;">Present this coupon at checkout to receive your discount. Valid until the end of the month.</p>
        </div>`;
    } else if (type === 'bio') {
        w = 350; h = 120;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; align-items:center; gap: 20px; border-top:1px solid #ddd; border-bottom:1px solid #ddd; padding: 15px 0;">
            <div style="width:70px; height:70px; background:#e0e0e0; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:#999; font-size:24px; font-family:inherit;">User</div>
            <div contenteditable="true">
                <h3 style="margin:0 0 5px 0; color:var(--ui-theme-dark); font-family:inherit; font-size:18px;">Author Name</h3>
                <p style="margin:0; font-size:13px; color:#555; font-family:inherit; line-height:1.4;">Author bio goes here. A short description of the writer's background and expertise.</p>
            </div>
        </div>`;
    } else if (type === 'checklist') {
        w = 300; h = 60;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; align-items:center; gap: 15px;">
            <div style="width:24px; height:24px; background:#4CAF50; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0;">✓</div>
            <div contenteditable="true" style="font-size:16px; color:#333; font-family:inherit;">Checklist item goes right here</div>
        </div>`;
    } else if (type === 'menu-item') {
        w = 350; h = 60;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; flex-direction:column; justify-content:center;" contenteditable="true">
            <div style="display:flex; align-items:center; gap: 10px; margin-bottom:5px;">
                <h3 style="margin:0; font-size:18px; color:var(--ui-theme-dark); font-family:inherit; white-space:nowrap;">Menu Item Name</h3>
                <div style="flex-grow:1; height:0; border-top:3px dotted #ccc; margin-top:10px;"></div>
                <strong style="font-size:18px; color:var(--pub-color); font-family:inherit; white-space:nowrap;">$12</strong>
            </div>
            <p style="margin:0; font-size:13px; color:#666; font-family:inherit; font-style:italic;">A brief description of the menu item ingredients.</p>
        </div>`;
    } else if (type === 'photo-block') {
        w = 300; h = 250;
        htmlContent = `<div style="height:100%; box-sizing:border-box; padding:10px; background:#f9f9f9; border:1px solid #ddd;">
            <div style="width:100%; height:180px; background:#e0e0e0; display:flex; align-items:center; justify-content:center; color:#999; margin-bottom:10px; font-family:inherit;">[ Photo Placeholder ]</div>
            <div contenteditable="true" style="text-align:center; font-size:13px; color:#555; font-style:italic; font-family:inherit;">Type your photo caption here</div>
        </div>`;
    } else if (type === 'review') {
        w = 300; h = 100;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;" contenteditable="true">
            <div style="color:#FFD700; font-size:24px; letter-spacing:2px; margin-bottom:5px; pointer-events:none; user-select:none;">★★★★★</div>
            <h4 style="margin:0 0 5px 0; color:var(--ui-theme-dark); font-family:inherit; font-size:16px; font-style:italic;">"Absolutely fantastic service!"</h4>
            <span style="font-size:12px; color:#666; font-family:inherit; text-transform:uppercase;">- Jane Doe, Customer</span>
        </div>`;
    } else if (type === 'event-date') {
        w = 350; h = 100;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; align-items:center; gap:20px; padding:15px; border:1px solid #eee; background:#fff;">
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; border:2px solid var(--pub-color); border-radius:8px; width:70px; height:70px; flex-shrink:0; overflow:hidden;">
                <div style="background:var(--pub-color); color:white; width:100%; text-align:center; font-size:12px; font-weight:bold; padding:4px 0; text-transform:uppercase;">OCT</div>
                <div style="font-size:28px; font-weight:bold; color:var(--ui-theme-dark); margin-top:2px;">24</div>
            </div>
            <div contenteditable="true">
                <h3 style="margin:0 0 5px 0; color:var(--ui-theme-dark); font-family:inherit; font-size:18px;">Annual Gala Dinner</h3>
                <p style="margin:0; font-size:13px; color:#555; font-family:inherit;">Join us at 7:00 PM for an evening of celebration and networking.</p>
            </div>
        </div>`;
    } else if (type === 'stat') {
        w = 200; h = 150;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:10px;" contenteditable="true">
            <div style="font-size:48px; font-weight:bold; color:var(--pub-color); font-family:inherit; line-height:1;">99<span style="font-size:24px;">%</span></div>
            <div style="width:40px; height:3px; background:var(--ui-theme-dark); margin:10px auto;"></div>
            <p style="margin:0; font-size:14px; color:#444; font-family:inherit;">Customer satisfaction rate over the last year.</p>
        </div>`;
    } else if (type === 'signature') {
        w = 300; h = 80;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; flex-direction:column; justify-content:flex-end; padding-bottom:10px;">
            <div style="display:flex; align-items:flex-end;">
                <span style="font-size:16px; font-family:inherit; color:var(--ui-theme-dark); margin-right:5px; font-weight:bold;">X</span>
                <div style="flex-grow:1; border-bottom:2px solid #333; height:0; margin-bottom:4px;"></div>
            </div>
            <div style="text-align:center; font-size:12px; color:#666; font-family:inherit; margin-top:5px; text-transform:uppercase; letter-spacing:1px;" contenteditable="true">Authorized Signature</div>
        </div>`;
    } else if (type === 'pros-cons') {
        w = 400; h = 150;
        htmlContent = `<div style="height:100%; box-sizing:border-box; display:flex; gap:20px; font-family:inherit;">
            <div style="flex:1; border:1px solid #4CAF50; border-radius:8px; padding:15px; background:rgba(76, 175, 80, 0.05);" contenteditable="true">
                <h3 style="margin:0 0 10px 0; color:#4CAF50; font-size:16px;">Pros</h3>
                <ul style="margin:0; padding-left:20px; font-size:13px; color:#333;">
                    <li style="margin-bottom:5px;">Advantage one</li>
                    <li>Advantage two</li>
                </ul>
            </div>
            <div style="flex:1; border:1px solid #F44336; border-radius:8px; padding:15px; background:rgba(244, 67, 54, 0.05);" contenteditable="true">
                <h3 style="margin:0 0 10px 0; color:#F44336; font-size:16px;">Cons</h3>
                <ul style="margin:0; padding-left:20px; font-size:13px; color:#333;">
                    <li style="margin-bottom:5px;">Disadvantage one</li>
                    <li>Disadvantage two</li>
                </ul>
            </div>
        </div>`;
    } else if (type === 'qa-block') {
        w = 350; h = 120;
        htmlContent = `<div style="height:100%; box-sizing:border-box; font-family:inherit; padding:10px;" contenteditable="true">
            <div style="display:flex; align-items:flex-start; gap:10px; margin-bottom:10px;">
                <strong style="color:var(--pub-color); font-size:18px;">Q.</strong>
                <strong style="font-size:16px; color:var(--ui-theme-dark); padding-top:2px;">What is the most frequently asked question?</strong>
            </div>
            <div style="display:flex; align-items:flex-start; gap:10px;">
                <strong style="color:#888; font-size:18px;">A.</strong>
                <p style="margin:0; font-size:14px; color:#444; padding-top:2px; line-height:1.4;">The answer goes here. Keep it concise, helpful, and directly to the point.</p>
            </div>
        </div>`;
    } else if (type === 'takeaway') {
        w = 350; h = 100;
        htmlContent = `<div style="height:100%; box-sizing:border-box; border-radius:8px; background:linear-gradient(to right, rgba(0,0,0,0.05), rgba(0,0,0,0.02)); padding:15px 20px; border-left:4px solid var(--pub-color); font-family:inherit; display:flex; flex-direction:column; justify-content:center;" contenteditable="true">
            <div style="font-size:12px; font-weight:bold; color:var(--pub-color); text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">Key Takeaway</div>
            <div style="font-size:15px; color:#333; font-style:italic; line-height:1.4;">Summarize the most critical point or actionable advice for the reader right here.</div>
        </div>`;
    } else if (type === 'warning') {
        w = 350; h = 100;
        htmlContent = `<div style="height:100%; box-sizing:border-box; border:1px solid #FF9800; background:#FFF3E0; border-radius:8px; padding:15px; display:flex; align-items:center; gap:15px; font-family:inherit;" contenteditable="true">
            <div style="color:#FF9800; font-size:24px; font-weight:bold; flex-shrink:0;">⚠</div>
            <div>
                <h4 style="margin:0 0 4px 0; color:#E65100; font-size:16px;">Warning</h4>
                <p style="margin:0; font-size:13px; color:#555; line-height:1.4;">Please read carefully before proceeding with the next steps.</p>
            </div>
        </div>`;
    }
    
    const el = createWrapper(htmlContent);
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    
    // Center it
    const paperW = parseFloat(paper.style.width) || 794;
    const paperH = parseFloat(paper.style.height) || 1123;
    el.style.left = ((paperW / 2) - (w / 2)) + 'px';
    el.style.top = ((paperH / 2) - (h / 2)) + 'px';
    
    if (typeof selectElement === 'function') selectElement(el);
};
