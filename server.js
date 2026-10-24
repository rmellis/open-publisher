const express = require('express');
const multer = require('multer');
const { execSync, exec } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

let AdmZip = null;
let DOMParser = null;
try {
    AdmZip = require('adm-zip');
    DOMParser = require('@xmldom/xmldom').DOMParser;
} catch (e) {
    console.warn('Optional XML/ZIP parsers not loaded:', e.message);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: 'uploads/' });

/**
 * Resolve LibreOffice executable across Windows, macOS, and Linux
 */
function resolveLibreOfficePath() {
    if (process.env.LIBREOFFICE_PATH) return `"${process.env.LIBREOFFICE_PATH}"`;
    const candidates = [
        'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
        'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
        '/Applications/LibreOffice.app/Contents/MacOS/soffice',
        '/usr/bin/libreoffice',
        '/usr/bin/soffice'
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return `"${c}"`;
    }
    return 'soffice';
}

/**
 * Translate Private Use Area (PUA) and Symbol/Wingdings/Webdings characters
 * into standard Unicode glyphs (such as the Windows key symbol).
 */
const PUA_SYMBOL_MAP = {
    '\uF0FF': '⊞', '\uE000': '⊞', '\uE782': '⊞', '\uF8FF': '⊞',
    '\uF021': '✁', '\uF022': '“', '\uF028': '☎', '\uF029': '✆',
    '\uF02A': '✉', '\uF03C': '💾', '\uF04A': '☺', '\uF04B': '😐',
    '\uF04C': '☹', '\uF050': '✈', '\uF052': '☀', '\uF054': '❄',
    '\uF06C': '●', '\uF06D': '❍', '\uF06E': '■', '\uF06F': '□',
    '\uF071': '❑', '\uF072': '❒', '\uF073': '⧫', '\uF074': '◆',
    '\uF075': '❖', '\uF076': '➢', '\uF077': '♦', '\uF091': '‘',
    '\uF092': '’', '\uF093': '“', '\uF094': '”', '\uF096': '-',
    '\uF097': '-', '\uF09F': '•', '\uF0A7': '▪', '\uF0A8': '▫',
    '\uF0B7': '•', '\uF0D8': '➢', '\uF0DC': '➔', '\uF0E0': '➡',
    '\uF0E8': '➔', '\uF0F0': '⇨', '\uF0FC': '✔', '\uF0FD': '☒',
    '\uF0FE': '☑'
};

function sanitizePublisherText(str, fontName = '') {
    if (!str) return '';
    let out = String(str);
    // Replace known PUA codes
    out = out.replace(/[\uE000-\uF8FF]/g, (ch) => {
        if (PUA_SYMBOL_MAP[ch]) return PUA_SYMBOL_MAP[ch];
        const code = ch.charCodeAt(0);
        // Wingdings / Symbol ASCII mapped into 0xF020..0xF07E
        if (code >= 0xF020 && code <= 0xF07E) {
            const lowerFont = (fontName || '').toLowerCase();
            if (!lowerFont.includes('wingding') && !lowerFont.includes('webding') && !lowerFont.includes('symbol')) {
                return String.fromCharCode(code - 0xF000);
            }
        }
        return '⊞';
    });
    // Repair corrupted replacement character quotes around words (e.g. \uFFFDDuplicate\uFFFD -> “Duplicate”)
    out = out.replace(/\uFFFD([^\uFFFD]+)\uFFFD/g, '“$1”');
    out = out.replace(/^\uFFFD/, '“').replace(/\uFFFD$/, '”');
    return out;
}

/**
 * Convert measurement strings (e.g. "2.54cm", "1.5in", "72pt", "100px") to 96-DPI CSS pixels
 */
function parseMeasureToPx(val) {
    if (val === undefined || val === null) return 0;
    const s = String(val).trim();
    const num = parseFloat(s);
    if (isNaN(num)) return 0;
    if (s.endsWith('cm')) return num * (96 / 2.54);
    if (s.endsWith('mm')) return num * (96 / 25.4);
    if (s.endsWith('in')) return num * 96;
    if (s.endsWith('pt')) return num * (96 / 72);
    if (s.endsWith('pc')) return num * 16;
    return num;
}

/**
 * Deduplicate cloned/offset shadow text frames emitted by libmspub / SVG / ODG.
 * Converts the underlying offset shadow node into native CSS text-shadow properties
 * on the primary editable text node.
 */
function deduplicateShadowFrames(frames) {
    if (!Array.isArray(frames) || frames.length < 2) return frames || [];
    const consumed = new Set();
    const result = [];

    const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();

    for (let i = 0; i < frames.length; i++) {
        if (consumed.has(i)) continue;
        const a = { ...frames[i] };
        const textA = norm(a.text);
        if (!textA) {
            result.push(a);
            continue;
        }

        for (let j = i + 1; j < frames.length; j++) {
            if (consumed.has(j)) continue;
            const b = frames[j];
            const textB = norm(b.text);
            if (!textB || textA !== textB) continue;

            const fontSize = a.fontSize || b.fontSize || 16;
            const dx = (b.left || 0) - (a.left || 0);
            const dy = (b.top || 0) - (a.top || 0);
            const dist = Math.hypot(dx, dy);

            if (dist >= 0.2 && dist <= Math.max(12, fontSize * 0.6)) {
                consumed.add(j);
                if (dist < 0.45) {
                    // Ultra-small offset is synthetic faux-bold
                    a.isBold = true;
                } else {
                    // In painter's order, the first node (a) is typically the shadow behind (b),
                    // unless (b) is shifted down-right and lighter/greyer.
                    const aIsShadow = (dx <= 0.5 && dy <= 0.5) || (a.color && b.color && a.color !== b.color);
                    const primary = aIsShadow ? b : a;
                    const shadow = aIsShadow ? a : b;
                    const offX = (shadow.left - primary.left);
                    const offY = (shadow.top - primary.top);
                    const sColor = shadow.color || 'rgba(0,0,0,0.35)';

                    a.left = primary.left;
                    a.top = primary.top;
                    a.width = Math.max(primary.width || 0, shadow.width || 0);
                    a.height = Math.max(primary.height || 0, shadow.height || 0);
                    a.color = primary.color || a.color;
                    a.isBold = Boolean(primary.isBold || shadow.isBold);
                    a.isItalic = Boolean(primary.isItalic || shadow.isItalic);
                    a.shadow = {
                        offsetX: Number(offX.toFixed(1)),
                        offsetY: Number(offY.toFixed(1)),
                        blurRadius: 2,
                        color: sColor,
                        opacity: 0.65
                    };
                    a.textShadow = `${offX.toFixed(1)}px ${offY.toFixed(1)}px 2px ${sColor}`;
                }
            }
        }
        result.push(a);
    }
    return result;
}

/**
 * Extract structured text frames, styles, and clean standalone images from an ODG archive
 * produced by LibreOffice (libmspub).
 */
function extractOdgStructure(odgPath) {
    if (!AdmZip || !DOMParser || !fs.existsSync(odgPath)) return null;
    try {
        const zip = new AdmZip(odgPath);
        const contentEntry = zip.getEntry('content.xml');
        if (!contentEntry) return null;

        const contentXml = contentEntry.getData().toString('utf8');
        const doc = new DOMParser().parseFromString(contentXml, 'text/xml');

        // 1. Parse automatic styles from content.xml
        const styleMap = {};
        const styleNodes = doc.getElementsByTagName('style:style');
        for (let i = 0; i < styleNodes.length; i++) {
            const sNode = styleNodes[i];
            const sName = sNode.getAttribute('style:name');
            if (!sName) continue;
            const info = {};

            const pProps = sNode.getElementsByTagName('style:paragraph-properties')[0];
            if (pProps) {
                const align = pProps.getAttribute('fo:text-align');
                if (align) info.textAlign = align === 'end' ? 'right' : (align === 'start' ? 'left' : align);
                const lh = pProps.getAttribute('fo:line-height');
                if (lh) info.lineHeight = lh;
            }

            const tProps = sNode.getElementsByTagName('style:text-properties')[0];
            if (tProps) {
                const fn = tProps.getAttribute('style:font-name') || tProps.getAttribute('fo:font-family');
                if (fn) info.fontFamily = fn.replace(/['"]/g, '');
                const fsVal = tProps.getAttribute('fo:font-size');
                if (fsVal) info.fontSize = parseMeasureToPx(fsVal);
                const fw = tProps.getAttribute('fo:font-weight');
                if (fw === 'bold' || Number(fw) >= 600) info.isBold = true;
                const fst = tProps.getAttribute('fo:font-style');
                if (fst === 'italic' || fst === 'oblique') info.isItalic = true;
                const col = tProps.getAttribute('fo:color');
                if (col) info.color = col;
                const tShadow = tProps.getAttribute('fo:text-shadow');
                if (tShadow && tShadow !== 'none') info.textShadow = tShadow;
            }

            const gProps = sNode.getElementsByTagName('style:graphic-properties')[0];
            if (gProps) {
                const drawShadow = gProps.getAttribute('draw:shadow');
                if (drawShadow === 'visible') {
                    const sx = parseMeasureToPx(gProps.getAttribute('draw:shadow-offset-x') || '2pt');
                    const sy = parseMeasureToPx(gProps.getAttribute('draw:shadow-offset-y') || '2pt');
                    const sc = gProps.getAttribute('draw:shadow-color') || '#808080';
                    info.boxShadow = `${sx.toFixed(1)}px ${sy.toFixed(1)}px 3px ${sc}`;
                }
                const fill = gProps.getAttribute('draw:fill');
                const fillColor = gProps.getAttribute('draw:fill-color');
                if (fill === 'solid' && fillColor) info.backgroundColor = fillColor;
            }

            styleMap[sName] = info;
        }

        // 2. Parse pages and frames
        const pageNodes = doc.getElementsByTagName('draw:page');
        const structuredPages = [];
        const extractedImages = [];

        for (let pIdx = 0; pIdx < pageNodes.length; pIdx++) {
            const pageNode = pageNodes[pIdx];
            const frames = [];
            const images = [];

            const frameNodes = pageNode.getElementsByTagName('draw:frame');
            for (let fIdx = 0; fIdx < frameNodes.length; fIdx++) {
                const fNode = frameNodes[fIdx];
                const left = parseMeasureToPx(fNode.getAttribute('svg:x'));
                const top = parseMeasureToPx(fNode.getAttribute('svg:y'));
                const width = parseMeasureToPx(fNode.getAttribute('svg:width'));
                const height = parseMeasureToPx(fNode.getAttribute('svg:height'));
                const frameStyle = styleMap[fNode.getAttribute('draw:style-name')] || {};

                // Check for embedded image
                const imgNode = fNode.getElementsByTagName('draw:image')[0];
                if (imgNode) {
                    const href = imgNode.getAttribute('xlink:href');
                    if (href) {
                        const imgEntry = zip.getEntry(href);
                        if (imgEntry) {
                            const ext = path.extname(href).toLowerCase();
                            const mime = ext === '.png' ? 'image/png'
                                : (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg'
                                : ext === '.svg' ? 'image/svg+xml'
                                : ext === '.gif' ? 'image/gif'
                                : 'image/png';
                            const b64 = imgEntry.getData().toString('base64');
                            const imgObj = {
                                pageIndex: pIdx,
                                left: Number(left.toFixed(1)),
                                top: Number(top.toFixed(1)),
                                width: Number(width.toFixed(1)),
                                height: Number(height.toFixed(1)),
                                dataUrl: `data:${mime};base64,${b64}`,
                                ext
                            };
                            images.push(imgObj);
                            extractedImages.push(imgObj);
                        }
                    }
                }

                // Check for text box
                const tbNode = fNode.getElementsByTagName('draw:text-box')[0];
                if (tbNode) {
                    const pNodes = tbNode.getElementsByTagName('text:p');
                    const paragraphs = [];
                    let fullText = '';

                    for (let pi = 0; pi < pNodes.length; pi++) {
                        const pNode = pNodes[pi];
                        const pStyle = styleMap[pNode.getAttribute('text:style-name')] || {};
                        const spans = [];

                        for (let ci = 0; ci < pNode.childNodes.length; ci++) {
                            const child = pNode.childNodes[ci];
                            if (child.nodeType === 3) {
                                const txt = sanitizePublisherText(child.nodeValue, pStyle.fontFamily || frameStyle.fontFamily);
                                if (txt) {
                                    spans.push({ text: txt, ...pStyle });
                                    fullText += txt;
                                }
                            } else if (child.nodeName === 'text:span') {
                                const sStyle = { ...pStyle, ...(styleMap[child.getAttribute('text:style-name')] || {}) };
                                const txt = sanitizePublisherText(child.textContent, sStyle.fontFamily);
                                if (txt) {
                                    spans.push({ text: txt, ...sStyle });
                                    fullText += txt;
                                }
                            } else if (child.nodeName === 'text:s') {
                                const count = parseInt(child.getAttribute('text:c') || '1', 10);
                                const sp = ' '.repeat(Math.max(1, count));
                                spans.push({ text: sp, ...pStyle });
                                fullText += sp;
                            }
                        }

                        if (spans.length > 0) {
                            paragraphs.push({
                                textAlign: pStyle.textAlign || frameStyle.textAlign || 'left',
                                spans
                            });
                            if (pi < pNodes.length - 1) fullText += '\n';
                        }
                    }

                    if (fullText.trim()) {
                        const firstSpan = (paragraphs[0] && paragraphs[0].spans[0]) || {};
                        frames.push({
                            left: Number(left.toFixed(1)),
                            top: Number(top.toFixed(1)),
                            width: Number(width.toFixed(1)),
                            height: Number(height.toFixed(1)),
                            text: fullText,
                            paragraphs,
                            textAlign: (paragraphs[0] && paragraphs[0].textAlign) || frameStyle.textAlign || 'left',
                            fontFamily: firstSpan.fontFamily || frameStyle.fontFamily || 'Calibri',
                            fontSize: firstSpan.fontSize || frameStyle.fontSize || 16,
                            isBold: Boolean(firstSpan.isBold || frameStyle.isBold),
                            isItalic: Boolean(firstSpan.isItalic || frameStyle.isItalic),
                            color: firstSpan.color || frameStyle.color || '#000000',
                            textShadow: firstSpan.textShadow || frameStyle.textShadow || frameStyle.boxShadow || ''
                        });
                    }
                }
            }

            // Detect complex custom shapes / vector groups for per-element fallback
            const customShapes = [];
            const shapeNodes = pageNode.getElementsByTagName('draw:custom-shape');
            for (let sIdx = 0; sIdx < shapeNodes.length; sIdx++) {
                const sNode = shapeNodes[sIdx];
                const sx = parseMeasureToPx(sNode.getAttribute('svg:x'));
                const sy = parseMeasureToPx(sNode.getAttribute('svg:y'));
                const sw = parseMeasureToPx(sNode.getAttribute('svg:width'));
                const sh = parseMeasureToPx(sNode.getAttribute('svg:height'));
                if (sw > 4 && sh > 4) {
                    customShapes.push({
                        left: Number(sx.toFixed(1)),
                        top: Number(sy.toFixed(1)),
                        width: Number(sw.toFixed(1)),
                        height: Number(sh.toFixed(1)),
                        isComplexVector: true
                    });
                }
            }

            structuredPages.push({
                pageIndex: pIdx,
                frames: deduplicateShadowFrames(frames),
                images,
                customShapes
            });
        }

        return { structuredPages, extractedImages };
    } catch (err) {
        console.warn('ODG structured extraction warning:', err.message);
        return null;
    }
}

app.post('/api/convert-pub', upload.single('pubFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No Publisher file uploaded.' });
    }
    const uploadedFilePath = req.file.path;
    const originalFileName = req.file.originalname || 'Document.pub';
    const outDir = path.join(__dirname, `uploads/out_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);

    try {
        console.log(`\nConverting Publisher file: ${originalFileName}...`);
        fs.mkdirSync(outDir, { recursive: true });

        const libreOfficePath = resolveLibreOfficePath();

        // 1. Export as high-fidelity PDF
        execSync(`${libreOfficePath} --headless --convert-to pdf --outdir "${outDir}" "${uploadedFilePath}"`);

        const convertedFileName = fs.readdirSync(outDir).find(f => f.toLowerCase().endsWith('.pdf'));
        if (!convertedFileName) {
            throw new Error('LibreOffice did not produce a PDF file.');
        }
        const pdfFilePath = path.join(outDir, convertedFileName);
        const pdfBase64 = fs.readFileSync(pdfFilePath, { encoding: 'base64' });

        // 2. Also attempt ODG extraction for clean embedded images & structured text frames (only if optional ZIP/XML parsers are installed)
        let odgData = null;
        if (AdmZip && DOMParser) {
            try {
                execSync(`${libreOfficePath} --headless --convert-to odg --outdir "${outDir}" "${uploadedFilePath}"`);
                const odgFileName = fs.readdirSync(outDir).find(f => f.toLowerCase().endsWith('.odg'));
                if (odgFileName) {
                    odgData = extractOdgStructure(path.join(outDir, odgFileName));
                }
            } catch (odgErr) {
                console.warn('Optional ODG extraction skipped:', odgErr.message);
            }
        }

        res.json({
            title: originalFileName.replace(/\.[^/.]+$/, ''),
            pdfData: pdfBase64,
            structuredPages: odgData ? odgData.structuredPages : null,
            extractedImages: odgData ? odgData.extractedImages : null
        });

        console.log('Success! Converted Publisher payload sent to frontend.');
    } catch (error) {
        console.error('Conversion Error:', error);
        res.status(500).json({ error: 'Conversion failed.' });
    } finally {
        if (fs.existsSync(uploadedFilePath)) {
            try { fs.unlinkSync(uploadedFilePath); } catch (e) {}
        }
        if (fs.existsSync(outDir)) {
            try { fs.rmSync(outDir, { recursive: true, force: true }); } catch (e) {}
        }
    }
});

/* =========================================================================
   WORD DOCUMENT CONVERSION ENDPOINT (.doc / .docx) (BULLETPROOF V2)
   ========================================================================= */
app.post('/api/convert-doc', upload.single('docFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No document file uploaded.' });
    }

    const inputPath = req.file.path;
    const outputDir = path.join(__dirname, 'uploads', `doc_out_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const libreOfficePath = resolveLibreOfficePath();
    const command = `${libreOfficePath} --headless --convert-to pdf:writer_pdf_Export --outdir "${outputDir}" "${inputPath}"`;

    exec(command, (error) => {
        if (error) {
            console.error(`LibreOffice Error: ${error.message}`);
            if (fs.existsSync(inputPath)) try { fs.unlinkSync(inputPath); } catch (e) {}
            if (fs.existsSync(outputDir)) try { fs.rmSync(outputDir, { recursive: true, force: true }); } catch (e) {}
            return res.status(500).json({ error: 'Failed to convert document.' });
        }

        try {
            const filesInDir = fs.readdirSync(outputDir);
            const pdfFileName = filesInDir.find(f => f.toLowerCase().endsWith('.pdf'));

            if (pdfFileName) {
                const pdfPath = path.join(outputDir, pdfFileName);
                const pdfBuffer = fs.readFileSync(pdfPath);
                const base64Pdf = pdfBuffer.toString('base64');
                const originalTitle = path.parse(req.file.originalname).name;

                res.json({
                    title: originalTitle,
                    pdfData: base64Pdf
                });
            } else {
                res.status(500).json({ error: 'LibreOffice ran, but no PDF was found.' });
            }
        } catch (err) {
            console.error('Cleanup/Read Error:', err);
            res.status(500).json({ error: 'Server failed to read the generated PDF.' });
        } finally {
            if (fs.existsSync(inputPath)) try { fs.unlinkSync(inputPath); } catch (e) {}
            if (fs.existsSync(outputDir)) try { fs.rmSync(outputDir, { recursive: true, force: true }); } catch (e) {}
        }
    });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Pub PDF Server running on port ${PORT}`));
}

module.exports = {
    app,
    sanitizePublisherText,
    parseMeasureToPx,
    deduplicateShadowFrames,
    extractOdgStructure
};