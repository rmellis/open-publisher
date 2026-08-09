
function getBusinessInfo() {
    try {
        return JSON.parse(localStorage.getItem('op_business_info')) || {};
    } catch(err) {
        return {};
    }
}

function saveBusinessInfo(data) {
    localStorage.setItem('op_business_info', JSON.stringify(data));
}

function showBusinessInfoModal() {
    document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
    const info = getBusinessInfo();
    const html = `
        <div style="padding: 10px;">
            <p style="margin-bottom: 15px; font-size: 13px;">Save your business details here to easily insert them into any document.</p>
            <div style="margin-bottom: 10px;">
                <label style="display:block; font-size: 12px; margin-bottom: 4px; font-weight: bold;">Individual Name</label>
                <input type="text" id="bi-name" style="width: 100%; padding: 6px; box-sizing: border-box; border: 1px solid #ccc;" value="${info.name || ''}" placeholder="e.g. John Smith">
            </div>
            <div style="margin-bottom: 10px;">
                <label style="display:block; font-size: 12px; margin-bottom: 4px; font-weight: bold;">Job Title</label>
                <input type="text" id="bi-title" style="width: 100%; padding: 6px; box-sizing: border-box; border: 1px solid #ccc;" value="${info.title || ''}" placeholder="e.g. Manager">
            </div>
            <div style="margin-bottom: 10px;">
                <label style="display:block; font-size: 12px; margin-bottom: 4px; font-weight: bold;">Organization Name</label>
                <input type="text" id="bi-organization" style="width: 100%; padding: 6px; box-sizing: border-box; border: 1px solid #ccc;" value="${info.organization || ''}" placeholder="e.g. Acme Corp">
            </div>
            <div style="margin-bottom: 10px;">
                <label style="display:block; font-size: 12px; margin-bottom: 4px; font-weight: bold;">Address</label>
                <textarea id="bi-address" style="width: 100%; height: 50px; padding: 6px; box-sizing: border-box; border: 1px solid #ccc; font-family: inherit; resize: vertical;" placeholder="123 Main St.">${info.address || ''}</textarea>
            </div>
            <div style="margin-bottom: 10px;">
                <label style="display:block; font-size: 12px; margin-bottom: 4px; font-weight: bold;">Contact Details (Phone/Fax/E-mail)</label>
                <textarea id="bi-contact" style="width: 100%; height: 50px; padding: 6px; box-sizing: border-box; border: 1px solid #ccc; font-family: inherit; resize: vertical;" placeholder="Phone: 555-1234">${info.contact || ''}</textarea>
            </div>
            <div style="margin-bottom: 10px;">
                <label style="display:block; font-size: 12px; margin-bottom: 4px; font-weight: bold;">Tagline or Motto</label>
                <input type="text" id="bi-tagline" style="width: 100%; padding: 6px; box-sizing: border-box; border: 1px solid #ccc;" value="${info.tagline || ''}" placeholder="e.g. Quality First">
            </div>
            <div style="margin-bottom: 10px;">
                <label style="display:block; font-size: 12px; margin-bottom: 4px; font-weight: bold;">Logo (Base64 string or URL)</label>
                <input type="text" id="bi-logo" style="width: 100%; padding: 6px; box-sizing: border-box; border: 1px solid #ccc;" value="${info.logo || ''}" placeholder="Paste image URL here">
                <input type="file" id="bi-logo-file" accept="image/*" style="display:none;" onchange="
                    const file = this.files[0];
                    if(file) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            document.getElementById('bi-logo').value = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                ">
                <button type="button" style="margin-top:5px; padding: 4px 8px; font-size: 12px; cursor: pointer; border: 1px solid #ccc; background: #eee;" onclick="document.getElementById('bi-logo-file').click()">Select Local Image</button>
            </div>
        </div>
    `;

    DialogSystem.show("Edit Business Information", html, function() {
        const data = {
            name: document.getElementById('bi-name').value,
            title: document.getElementById('bi-title').value,
            organization: document.getElementById('bi-organization').value,
            address: document.getElementById('bi-address').value,
            contact: document.getElementById('bi-contact').value,
            tagline: document.getElementById('bi-tagline').value,
            logo: document.getElementById('bi-logo').value
        };
        saveBusinessInfo(data);
    });
}

function insertBusinessInfoField(fieldName) {
    document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
    const info = getBusinessInfo();
    const val = info[fieldName];
    if (!val || val.trim() === '') {
        showBusinessInfoModal();
        return;
    }
    
    if (fieldName === 'logo') {
        const wrapper = createWrapper(`<img src="${val}" draggable="false" style="width:100%; height:100%; object-fit:contain; display:block;">`);
        wrapper.style.width = '150px';
        wrapper.style.height = '150px';
    } else {
        const textHTML = val.replace(/\n/g, '<br>');
        createWrapper(`<div style="padding:10px; height:100%; word-wrap:break-word;" contenteditable="true">${textHTML}</div>`);
    }
}

function insertBusinessBulk(type) {
    document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
    const info = getBusinessInfo();
    
    if (!info.name && !info.organization) {
        showBusinessInfoModal();
        return;
    }
    
    let html = '';
    
    if (type === 'letterhead') {
        html = `
        <div style="width:100%; height:100%; border-bottom: 2px solid var(--ui-theme-color); font-family: sans-serif; padding-bottom: 10px; box-sizing: border-box; min-height: 100px;">
            <div style="width: 100%;">
                <div style="float: left; max-width: 50%;">
                    ${info.logo ? `<img src="${info.logo}" style="max-height:80px; max-width:150px; object-fit:contain; position:static !important; width:auto !important; height:auto !important; display:inline-block !important;">` : `<h1 style="color:var(--ui-theme-color); margin:0; padding:0; font-size: 24px;">${info.organization || info.name}</h1>`}
                </div>
                <div style="float: right; text-align:right; font-size:12px; color:#555; line-height: 1.4; max-width:50%;">
                    ${info.organization && info.logo ? `<strong style="font-size:14px; color:#000;">${info.organization}</strong><br>` : ''}
                    ${info.name ? `<strong>${info.name}</strong>${info.title ? ` - ${info.title}` : ''}<br>` : ''}
                    ${info.address ? `${info.address.replace(/\n/g, '<br>')}<br>` : ''}
                    ${info.contact ? `${info.contact.replace(/\n/g, ' | ')}` : ''}
                </div>
                <div style="clear: both;"></div>
            </div>
        </div>
        `;
    } else if (type === 'signature') {
        html = `
        <div style="padding-top: 20px; width:100%; height:100%; font-family: sans-serif; min-height: 100px;">
            <div style="border-top: 1px solid #ccc; width: 200px; margin-bottom: 10px;"></div>
            <strong style="font-size:16px; color:#000;">${info.name || 'Your Name'}</strong><br>
            ${info.title ? `<span style="font-style:italic; color:#666; font-size:14px;">${info.title}</span><br>` : ''}
            ${info.organization ? `<strong style="font-size:14px; color:#000;">${info.organization}</strong><br>` : ''}
            ${info.contact ? `<span style="font-size:12px; color:#555; line-height: 1.4;">${info.contact.replace(/\n/g, '<br>')}</span>` : ''}
        </div>
        `;
    } else if (type === 'business-card') {
        html = `
        <div style="width:100%; height:100%; border: 1px solid #e1e1e1; padding: 20px; box-sizing: border-box; background: #fff; border-radius: 4px; font-family: sans-serif; min-height: 180px;">
            <div style="width: 100%;">
                <div style="float: left; max-width: 60%;">
                    <h2 style="margin:0; color:var(--ui-theme-color); font-size:18px; line-height:1.2;">${info.name || 'Name'}</h2>
                    ${info.title ? `<span style="color:#666; font-size:12px;">${info.title}</span>` : ''}
                </div>
                <div style="float: right; max-width: 35%; text-align:right;">
                    ${info.logo ? `<img src="${info.logo}" style="max-width:100px; max-height:50px; object-fit:contain; position:static !important; width:auto !important; height:auto !important; display:inline-block !important;">` : ''}
                </div>
                <div style="clear: both;"></div>
            </div>
            <div style="line-height: 1.3; width: 100%; margin-top: 15px;">
                ${info.organization ? `<strong style="font-size:14px; color:#000;">${info.organization}</strong><br>` : ''}
                ${info.address ? `<span style="font-size:10px; color:#555;">${info.address.replace(/\n/g, ', ')}</span><br>` : ''}
                ${info.contact ? `<span style="font-size:10px; color:#555;">${info.contact.replace(/\n/g, ' | ')}</span>` : ''}
                ${info.tagline ? `<div style="margin-top:5px; font-style:italic; font-size:10px; color:var(--ui-theme-color);">${info.tagline}</div>` : ''}
            </div>
        </div>
        `;
    }
    
    if (html) {
        const wrapper = createWrapper(`<div style="width:100%; height:100%;" contenteditable="true">${html}</div>`);
        if (type === 'letterhead') {
            wrapper.style.width = '600px';
            wrapper.style.height = '120px';
        } else if (type === 'signature') {
            wrapper.style.width = '300px';
            wrapper.style.height = '150px';
        } else if (type === 'business-card') {
            wrapper.style.width = '350px';
            wrapper.style.height = '200px';
        }
    }
}



function toggleBusinessInfoMenu(btn, e) {
    const m = document.getElementById('business-info-dropdown');
    const isBlock = m.style.display === 'block';
    document.querySelectorAll('.dropdown-menu').forEach(d => { if(d!==m) d.style.display = 'none'; });
    if (!isBlock) {
        m.style.display = 'block';
        if (btn) {
            const r = btn.getBoundingClientRect();
            if (r.left + m.offsetWidth > window.innerWidth) m.style.left = (r.right - m.offsetWidth) + 'px';
            else m.style.left = r.left + 'px';
            m.style.top = (r.bottom+5) + 'px';
        } else if (e) {
            if (e.clientX + m.offsetWidth > window.innerWidth) m.style.left = (window.innerWidth - m.offsetWidth - 10) + 'px';
            else m.style.left = e.clientX + 'px';
            m.style.top = e.clientY + 'px';
        }
    } else {
        m.style.display = 'none';
    }
}







function showCouponModal() {
    const optionStyle = "padding:20px 10px; border:1px solid #ccc; border-radius:4px; cursor:pointer; text-align:center; background:#f9f9f9; box-sizing:border-box;";
    const html = `
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; width: 450px;">
            <div class="template-option" onclick="insertCoupon('standard')" style="${optionStyle}">
                <i class="fas fa-ticket-alt" style="font-size:32px; color:var(--ui-theme-dark); margin-bottom:10px;"></i><br>Standard Coupon
            </div>
            <div class="template-option" onclick="insertCoupon('tearaway')" style="${optionStyle}">
                <i class="fas fa-list" style="font-size:32px; color:var(--ui-theme-dark); margin-bottom:10px;"></i><br>Tear-away Tabs
            </div>
            <div class="template-option" onclick="insertCoupon('bogo')" style="${optionStyle}">
                <i class="fas fa-tags" style="font-size:32px; color:var(--ui-theme-dark); margin-bottom:10px;"></i><br>Buy 1 Get 1 Free
            </div>
            <div class="template-option" onclick="insertCoupon('voucher')" style="${optionStyle}">
                <i class="fas fa-gift" style="font-size:32px; color:var(--ui-theme-dark); margin-bottom:10px;"></i><br>Gift Voucher
            </div>
            <div class="template-option" onclick="insertCoupon('flash')" style="${optionStyle}">
                <i class="fas fa-bolt" style="font-size:32px; color:var(--ui-theme-dark); margin-bottom:10px;"></i><br>Flash Sale
            </div>
            <div class="template-option" onclick="insertCoupon('loyalty')" style="${optionStyle}">
                <i class="fas fa-star" style="font-size:32px; color:var(--ui-theme-dark); margin-bottom:10px;"></i><br>Loyalty Card
            </div>
            <div class="template-option" onclick="insertCoupon('vip')" style="${optionStyle}">
                <i class="fas fa-crown" style="font-size:32px; color:var(--ui-theme-dark); margin-bottom:10px;"></i><br>VIP Pass
            </div>
            <div class="template-option" onclick="insertCoupon('drink')" style="${optionStyle}">
                <i class="fas fa-coffee" style="font-size:32px; color:var(--ui-theme-dark); margin-bottom:10px;"></i><br>Free Drink
            </div>
            <div class="template-option" onclick="insertCoupon('promo')" style="${optionStyle}">
                <i class="fas fa-hashtag" style="font-size:32px; color:var(--ui-theme-dark); margin-bottom:10px;"></i><br>Promo Code
            </div>
            <div class="template-option" onclick="insertCoupon('ticket')" style="${optionStyle}">
                <i class="fas fa-ticket-alt" style="font-size:32px; color:var(--ui-theme-dark); margin-bottom:10px;"></i><br>Event Ticket
            </div>
            <div class="template-option" onclick="insertCoupon('credit')" style="${optionStyle}">
                <i class="fas fa-wallet" style="font-size:32px; color:var(--ui-theme-dark); margin-bottom:10px;"></i><br>Store Credit
            </div>
            <div class="template-option" onclick="insertCoupon('raffle')" style="${optionStyle}">
                <i class="fas fa-receipt" style="font-size:32px; color:var(--ui-theme-dark); margin-bottom:10px;"></i><br>Raffle Ticket
            </div>
        </div>
    `;
    DialogSystem.show('Insert Coupon / Tear-off', html, null, true);
}

function generateCouponPNG() {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 10]);
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    
    ctx.setLineDash([]);
    ctx.fillStyle = '#000';
    // More dense, realistic barcode pattern
    const bars = [1,2,1,1,3,2,1,4,1,1,2,3,1,1,1,2,4,1,2,1,1,1,3,2,1,1,2,2,1,3,1,1,4,1,2,1,1,1,2,3,1,2,1,1,4,1,1,2,2,1,1,3,1,2,1,3,1,2,1,1,1,4,1];
    const totalW = bars.reduce((a,b)=>a+b, 0) * 3;
    let x = (canvas.width - totalW) / 2;
    const y = 140; // Moved up so it doesn't overlap text
    const barHeight = 80;
    for (let i = 0; i < bars.length; i++) {
        let w = bars[i] * 3;
        if (i % 2 === 0) {
            ctx.fillRect(x, y, w, barHeight);
        }
        x += w;
    }
    
    return canvas.toDataURL("image/png");
}

function insertCoupon(type) {
    DialogSystem.close();
    if (type === 'standard') {
        const pngData = generateCouponPNG();
        const couponHTML = `
        <div style="background-image: url('${pngData}'); background-size: 100% 100%; width: 100%; height: 100%; padding: 15px; box-sizing: border-box; text-align: center; font-family: Arial, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;" contenteditable="true">
            <div style="color: #d97706; font-size: 28px; font-weight: bold; line-height: 1.1; margin-bottom: 5px;">50% OFF</div>
            <div style="font-size: 14px; font-weight: bold; color: #000; line-height: 1.1;">ANY SINGLE ITEM</div>
            <div style="margin-top: 65px; font-size: 10px; color: #666;">Valid until 12/31. Terms and conditions apply.</div>
        </div>`;
        createWrapper(couponHTML);
        if (state.selectedEl) {
            state.selectedEl.style.width = '300px';
            state.selectedEl.style.height = '160px';
        }
    } else if (type === 'tearaway') {
        const tearawayHTML = `<div style="display: flex; width: 100%; height: 100%; border-top: 1px dashed #000; background: #fff; box-sizing: border-box;">
            ${Array(8).fill(0).map(() => `<div style="flex: 1; border-right: 1px dashed #ccc; position: relative; overflow: hidden;"><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-90deg); white-space: nowrap; font-family: Arial, sans-serif; font-size: 12px; color: #000;">Call: 555-0198</div></div>`).join('')}
        </div>`;
        createWrapper(tearawayHTML);
        if (state.selectedEl) {
            state.selectedEl.style.width = '600px';
            state.selectedEl.style.height = '120px';
        }
    } else if (type === 'bogo') {
        const pngData = generateCouponPNG();
        const couponHTML = `
        <div style="background-image: url('${pngData}'); background-size: 100% 100%; width: 100%; height: 100%; padding: 15px; box-sizing: border-box; text-align: center; font-family: Arial, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;" contenteditable="true">
            <div style="color: #d32f2f; font-size: 28px; font-weight: bold; line-height: 1.1; margin-bottom: 5px;">BOGO</div>
            <div style="font-size: 14px; font-weight: bold; color: #000; line-height: 1.1;">BUY ONE GET ONE FREE</div>
            <div style="margin-top: 65px; font-size: 10px; color: #666;">Valid on equal or lesser value items. Terms apply.</div>
        </div>`;
        createWrapper(couponHTML);
        if (state.selectedEl) {
            state.selectedEl.style.width = '300px';
            state.selectedEl.style.height = '160px';
        }
    } else if (type === 'voucher') {
        const couponHTML = `
        <div style="border: 4px double #d4af37; padding: 15px; width: 100%; height: 100%; box-sizing: border-box; background: #fffdf0; text-align: center; font-family: 'Times New Roman', serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;" contenteditable="true">
            <div style="color: #d4af37; font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Gift Voucher</div>
            <div style="font-size: 18px; color: #333; margin-top: 15px;">Value: <span style="border-bottom: 1px solid #000; padding: 0 20px;">$50.00</span></div>
            <div style="font-size: 14px; color: #333; margin-top: 15px;">To: <span style="border-bottom: 1px solid #000; padding: 0 40px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
            <div style="font-size: 12px; color: #777; margin-top: 25px;">Non-transferable. Valid at all locations.</div>
        </div>`;
        createWrapper(couponHTML);
        if (state.selectedEl) {
            state.selectedEl.style.width = '350px';
            state.selectedEl.style.height = '180px';
        }
    } else if (type === 'flash') {
        const couponHTML = `
        <div style="border: 3px solid #ff0000; padding: 15px; width: 100%; height: 100%; box-sizing: border-box; background: #fff0f0; text-align: center; font-family: 'Arial Black', sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;" contenteditable="true">
            <div style="color: #ff0000; font-size: 36px; text-transform: uppercase; margin-bottom: 5px; text-shadow: 2px 2px 0px #fff, 3px 3px 0px #ff0000;">Flash Sale</div>
            <div style="font-size: 20px; color: #000; background: #ffcc00; display: inline-block; padding: 5px 15px; transform: rotate(-3deg); margin-top: 5px; margin-bottom: 5px;">24 HOURS ONLY</div>
            <div style="font-size: 14px; font-weight: bold; color: #333; margin-top: 15px;">Use code: HURRY20</div>
            <div style="font-size: 10px; color: #777; margin-top: 20px;">Cannot be combined with other offers.</div>
        </div>`;
        createWrapper(couponHTML);
        if (state.selectedEl) {
            state.selectedEl.style.width = '300px';
            state.selectedEl.style.height = '180px';
        }
    } else if (type === 'loyalty') {
        const couponHTML = `
        <div style="border: 2px solid var(--ui-theme-dark); border-radius: 10px; padding: 15px; width: 100%; height: 100%; box-sizing: border-box; background: #e0f2f1; text-align: center; font-family: Arial, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;" contenteditable="true">
            <div style="color: #004d40; font-size: 24px; font-weight: bold; margin-bottom: 10px;">Loyalty Card</div>
            <div style="display: flex; justify-content: space-around; margin: 15px 0;">
                <div style="width: 30px; height: 30px; border-radius: 50%; border: 2px dashed var(--ui-theme-dark); background: #fff;"></div>
                <div style="width: 30px; height: 30px; border-radius: 50%; border: 2px dashed var(--ui-theme-dark); background: #fff;"></div>
                <div style="width: 30px; height: 30px; border-radius: 50%; border: 2px dashed var(--ui-theme-dark); background: #fff;"></div>
                <div style="width: 30px; height: 30px; border-radius: 50%; border: 2px dashed var(--ui-theme-dark); background: #fff;"></div>
                <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--ui-theme-dark); color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">FREE</div>
            </div>
            <div style="font-size: 12px; color: #004d40;">Buy 4 coffees, get the 5th FREE!</div>
        </div>`;
        createWrapper(couponHTML);
        if (state.selectedEl) {
            state.selectedEl.style.width = '320px';
            state.selectedEl.style.height = '150px';
        }
    } else if (type === 'vip') {
        const couponHTML = `
        <div style="border: 2px solid #d4af37; padding: 15px; width: 100%; height: 100%; box-sizing: border-box; background: #111; text-align: center; font-family: 'Times New Roman', serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;" contenteditable="true">
            <div style="color: #d4af37; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 10px; border-bottom: 1px solid #d4af37; display: inline-block; padding-bottom: 5px;">VIP PASS</div>
            <div style="color: #fff; font-size: 16px; margin-top: 15px; font-style: italic;">Admit One</div>
            <div style="color: #aaa; font-size: 12px; margin-top: 25px;">Present this card at the entrance.</div>
        </div>`;
        createWrapper(couponHTML);
        if (state.selectedEl) {
            state.selectedEl.style.width = '250px';
            state.selectedEl.style.height = '350px';
        }
    } else if (type === 'drink') {
        const couponHTML = `
        <div style="border: 4px solid #795548; border-radius: 20px; padding: 15px; width: 100%; height: 100%; box-sizing: border-box; background: #efebe9; text-align: center; font-family: 'Courier New', monospace; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;" contenteditable="true">
            <div style="color: #3e2723; font-size: 32px; font-weight: bold; margin-bottom: 5px;">FREE DRINK</div>
            <div style="color: #5d4037; font-size: 14px;">Valid for any size coffee or tea</div>
            <div style="margin-top: 25px; border-top: 1px dashed #795548; padding-top: 10px; font-size: 10px; color: #8d6e63;">One per customer. Valid today only.</div>
        </div>`;
        createWrapper(couponHTML);
        if (state.selectedEl) {
            state.selectedEl.style.width = '300px';
            state.selectedEl.style.height = '150px';
        }
    } else if (type === 'promo') {
        const couponHTML = `
        <div style="border: 1px dashed #2196f3; padding: 15px; width: 100%; height: 100%; box-sizing: border-box; background: #e3f2fd; text-align: center; font-family: Arial, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;" contenteditable="true">
            <div style="color: #0d47a1; font-size: 16px; font-weight: bold; margin-bottom: 10px;">ONLINE PROMO</div>
            <div style="color: #1976d2; font-size: 28px; font-weight: bold; border: 2px solid #1976d2; background: #fff; display: inline-block; padding: 10px 20px; letter-spacing: 2px;">SAVE25</div>
            <div style="font-size: 12px; color: #555; margin-top: 15px;">Enter code at checkout for 25% off</div>
        </div>`;
        createWrapper(couponHTML);
        if (state.selectedEl) {
            state.selectedEl.style.width = '300px';
            state.selectedEl.style.height = '160px';
        }
    } else if (type === 'ticket') {
        const couponHTML = `
        <table style="width: 100%; height: 100%; border: 2px solid #000; background: #fff; border-collapse: collapse; box-sizing: border-box; font-family: 'Arial Black', sans-serif; margin: 0; padding: 0;" contenteditable="true">
            <tr>
                <td style="padding: 15px; border-right: 2px dashed #000; vertical-align: middle;">
                    <div style="font-size: 24px; color: #000; text-transform: uppercase;">Admit One</div>
                    <div style="font-size: 14px; color: #555; font-family: Arial, sans-serif;">General Admission</div>
                    <div style="font-size: 12px; color: #000; margin-top: 15px; font-family: Arial, sans-serif;">Date: Oct 31, 2025</div>
                </td>
                <td style="padding: 15px; background: #f0f0f0; vertical-align: middle; width: 60px; text-align: center; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
                    <div style="font-size: 20px; color: #000; margin: 0 auto; line-height: 1.1; font-weight: bold; font-family: 'Arial Black', sans-serif;">T<br>I<br>C<br>K<br>E<br>T</div>
                </td>
            </tr>
        </table>`;
        createWrapper(couponHTML);
        if (state.selectedEl) {
            state.selectedEl.style.width = '400px';
            state.selectedEl.style.height = '150px';
        }
    } else if (type === 'credit') {
        const couponHTML = `
        <div style="border: 2px solid #2e7d32; padding: 15px; width: 100%; height: 100%; box-sizing: border-box; background: #e8f5e9; text-align: center; font-family: 'Courier New', monospace; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;" contenteditable="true">
            <div style="color: #1b5e20; font-size: 20px; font-weight: bold; border-bottom: 2px dashed #2e7d32; padding-bottom: 5px; margin-bottom: 15px;">STORE CREDIT</div>
            <div style="color: #000; font-size: 36px; font-weight: bold; letter-spacing: 2px;">$25.00</div>
            <div style="font-size: 10px; color: #4caf50; margin-top: 15px;">Valid toward any in-store purchase.</div>
        </div>`;
        createWrapper(couponHTML);
        if (state.selectedEl) {
            state.selectedEl.style.width = '280px';
            state.selectedEl.style.height = '150px';
        }
    } else if (type === 'raffle') {
        const couponHTML = `
        <table style="width: 100%; height: 100%; border: 2px solid #000; background: #fff; border-collapse: collapse; box-sizing: border-box; font-family: Arial, sans-serif; margin: 0; padding: 0;" contenteditable="true">
            <tr>
                <td style="padding: 15px; border-right: 2px dashed #000; vertical-align: middle; text-align: center;">
                    <div style="font-size: 20px; color: #000; font-weight: bold; text-transform: uppercase;">Raffle Ticket</div>
                    <div style="font-size: 14px; color: #555; margin-top: 10px;">Keep this half</div>
                    <div style="font-size: 24px; color: #d32f2f; margin-top: 15px; font-family: 'Courier New', monospace; font-weight: bold;">No. 0001</div>
                </td>
                <td style="padding: 15px; vertical-align: middle; width: 100px; text-align: center; background: #f9f9f9; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;">
                    <div style="font-size: 14px; color: #000; font-weight: bold;">Drop this half</div>
                    <div style="font-size: 18px; color: #d32f2f; margin-top: 25px; font-family: 'Courier New', monospace; font-weight: bold;">No. 0001</div>
                </td>
            </tr>
        </table>`;
        createWrapper(couponHTML);
        if (state.selectedEl) {
            state.selectedEl.style.width = '450px';
            state.selectedEl.style.height = '160px';
        }
    }
}

function showQRCodeModal() {
    const html = `
        <div class="input-group">
            <label>URL or Text to encode:</label>
            <input type="text" id="qr-code-data" placeholder="https://example.com" value="https://example.com" style="width:100%; padding:8px; margin-top:5px; box-sizing:border-box;">
        </div>
        <div style="display:flex; gap:10px; margin-top:10px;">
            <div class="input-group" style="flex:1;">
                <label>QR Color:</label>
                <input type="hidden" id="qr-color" value="#000000">
                <div style="background-color:#000000; width:100%; height:24px; border:1px solid #ccc; border-radius:4px; cursor:pointer;" onclick="CustomColorPicker.open(this, document.getElementById('qr-color').value, (c) => { document.getElementById('qr-color').value = c; this.style.backgroundColor = c; })"></div>
            </div>
            <div class="input-group" style="flex:1;">
                <label>Background:</label>
                <input type="hidden" id="qr-bgcolor" value="#ffffff">
                <div style="background-color:#ffffff; width:100%; height:24px; border:1px solid #ccc; border-radius:4px; cursor:pointer;" onclick="CustomColorPicker.open(this, document.getElementById('qr-bgcolor').value, (c) => { document.getElementById('qr-bgcolor').value = c; this.style.backgroundColor = c; })"></div>
            </div>
        </div>
        <div class="input-group" style="margin-top:10px;">
            <label>Shape Style:</label>
            <select id="qr-style" style="width:100%; padding:8px; margin-top:5px; box-sizing:border-box;">
                <option value="square">Standard Square</option>
                <option value="rounded">Rounded Corners</option>
                <option value="circle">Circular Badge</option>
            </select>
        </div>
    `;
    DialogSystem.show('Generate QR Code', html, () => {
        const data = document.getElementById('qr-code-data').value || 'https://example.com';
        const color = document.getElementById('qr-color').value.substring(1);
        const bgcolor = document.getElementById('qr-bgcolor').value.substring(1);
        const style = document.getElementById('qr-style').value;
        
        const margin = (style === 'circle') ? 20 : (style === 'rounded' ? 10 : 0);
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}&color=${color}&bgcolor=${bgcolor}&margin=${margin}`;
        
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            
            if (style === 'circle') {
                ctx.beginPath();
                ctx.arc(100, 100, 100, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
            } else if (style === 'rounded') {
                ctx.beginPath();
                ctx.moveTo(15, 0); ctx.lineTo(185, 0); ctx.quadraticCurveTo(200, 0, 200, 15);
                ctx.lineTo(200, 185); ctx.quadraticCurveTo(200, 200, 185, 200);
                ctx.lineTo(15, 200); ctx.quadraticCurveTo(0, 200, 0, 185);
                ctx.lineTo(0, 15); ctx.quadraticCurveTo(0, 0, 15, 0);
                ctx.closePath();
                ctx.clip();
            }
            
            ctx.drawImage(img, 0, 0);
            
            if (style !== 'square') {
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 4; // Because clip is applied, half of stroke (2px) is drawn inside
                ctx.stroke();
            }
            
            const finalDataUrl = canvas.toDataURL("image/png");
            
            const imgHtml = `
            <div style="width:100%; height:100%; pointer-events:none;">
                <img src="${finalDataUrl}" style="width:100%; height:100%; object-fit:contain; pointer-events:none;" crossorigin="anonymous">
            </div>`;
            
            createWrapper(imgHtml);
            if (state.selectedEl) {
                state.selectedEl.style.width = '150px';
                state.selectedEl.style.height = '150px';
            }
        };
        img.onerror = () => {
            if (typeof DialogSystem !== 'undefined') DialogSystem.alert('Error', 'Failed to generate QR code.');
        };
        img.src = url;
    });
}


function insertPageNumber() {
    const pageNum = state.currentPageIndex + 1;
    const totalPages = state.pages.length;
    const el = createWrapper(`<div style="padding:5px 15px; height:100%; display:flex; align-items:center; justify-content:center; font-family:inherit; font-size:14px; color:#333; white-space:nowrap; user-select:none; pointer-events:none;" contenteditable="false"><span class="pn-current">${pageNum}</span>&nbsp;/&nbsp;<span class="pn-total">${totalPages}</span></div>`);
    el.setAttribute('data-type', 'page-number');
    el.style.width = '80px';
    el.style.height = '35px';
    // Position at bottom center of the page
    const paperW = parseFloat(paper.style.width) || 794;
    const paperH = parseFloat(paper.style.height) || 1123;
    el.style.left = ((paperW / 2) - 40) + 'px';
    el.style.top = (paperH - 60) + 'px';
}

function updatePageNumbers() {
    // Update all page number elements on the current page
    const totalPages = state.pages.length;
    const currentPageNum = state.currentPageIndex + 1;
    
    paper.querySelectorAll('.pub-element[data-type="page-number"]').forEach(el => {
        const content = el.querySelector('.element-content');
        if (content) {
            const curSpan = content.querySelector('.pn-current');
            const totSpan = content.querySelector('.pn-total');
            if (curSpan) curSpan.textContent = currentPageNum;
            if (totSpan) totSpan.textContent = totalPages;
        }
    });
}


function addPicturePlaceholder() {
    // Passes the placeholder's link through a CDN to automatically apply print-safe CORS headers.
    const placeholderUrl = "https://wsrv.nl/?url=saw.floydcraft.co.uk/ImagePlaceholder.png";
    
    // crossorigin="anonymous" is REQUIRED by html2canvas for printing.
    const el = createWrapper(`<img src="${placeholderUrl}" crossorigin="anonymous" style="width:100%; height:100%; object-fit:fill; pointer-events:none;">`);
    
    el.style.width = '400px';
    el.style.height = '400px';
    
    // REQUIRED so OpenPublisher's custom print engine loop actually processes it
    el.setAttribute('data-type', 'image');
    el.setAttribute('data-is-placeholder', 'true'); 
    
    el.ondblclick = function(e) {
        e.stopPropagation();
        
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.onchange = function(evt) {
            if (evt.target.files && evt.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(readerEvt) {
                    const img = el.querySelector('.element-content img');
                    if (img) {
                        img.src = readerEvt.target.result;
                        img.removeAttribute('crossorigin'); // Remove security tag for local files
                        img.style.objectFit = 'fill'; 
                        el.removeAttribute('data-is-placeholder');
                        if (typeof pushHistory === 'function') pushHistory();
                    }
                };
                reader.readAsDataURL(evt.target.files[0]);
            }
        };
        
        fileInput.click();
    };
}