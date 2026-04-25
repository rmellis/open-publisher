const express = require('express');
const multer = require('multer');
const { execSync } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({ dest: 'uploads/' });

app.post('/api/convert-pub', upload.single('pubFile'), (req, res) => {
    const uploadedFilePath = req.file.path;
    const originalFileName = req.file.originalname;
    const outDir = path.join(__dirname, `uploads/out_${Date.now()}`);
    
    try {
        console.log(`\nConverting to PDF: ${originalFileName}...`);
        fs.mkdirSync(outDir);
        
        const libreOfficePath = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`;
        
        // 1. Export as a flawless PDF
        execSync(`${libreOfficePath} --headless --convert-to pdf --outdir "${outDir}" "${uploadedFilePath}"`);
        
        // 2. Find the generated PDF
        const convertedFileName = fs.readdirSync(outDir).find(f => f.endsWith('.pdf'));
        const pdfFilePath = path.join(outDir, convertedFileName);

        // 3. Read the PDF as a Base64 string so we can send it securely over JSON
        const pdfBase64 = fs.readFileSync(pdfFilePath, { encoding: 'base64' });

        // 4. Send it back to the browser
        res.json({
            title: originalFileName.replace(/\.[^/.]+$/, ""),
            pdfData: pdfBase64
        });

        console.log("Success! PDF sent to frontend.");

    } catch (error) {
        console.error("Conversion Error:", error);
        res.status(500).json({ error: 'Conversion failed.' });
    } finally {
        if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
        if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
    }
});
/* =========================================================================
   WORD DOCUMENT CONVERSION ENDPOINT (.doc / .docx) (BULLETPROOF V2)
   ========================================================================= */
// We are loading the missing 'exec' tool right here so you don't have to scroll!
const { exec } = require('child_process');

app.post('/api/convert-doc', upload.single('docFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No document file uploaded.' });
    }

    const inputPath = req.file.path;
    // Create a unique output folder so files don't overwrite each other
    const outputDir = path.join(__dirname, 'uploads', `doc_out_${Date.now()}`);
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // LibreOffice command to convert Word files to PDF
    const command = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf:writer_pdf_Export --outdir "${outputDir}" "${inputPath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`LibreOffice Error: ${error.message}`);
            return res.status(500).json({ error: 'Failed to convert document.' });
        }

        // BULLETPROOF FIX: Just look inside the unique folder and grab the PDF!
        try {
            const filesInDir = fs.readdirSync(outputDir);
            const pdfFileName = filesInDir.find(f => f.endsWith('.pdf'));

            if (pdfFileName) {
                const pdfPath = path.join(outputDir, pdfFileName);
                const pdfBuffer = fs.readFileSync(pdfPath);
                const base64Pdf = pdfBuffer.toString('base64');
                
                // Get the original name to send back to the frontend for the title bar
                const originalTitle = path.parse(req.file.originalname).name;

                res.json({
                    title: originalTitle,
                    pdfData: base64Pdf
                });

                // Cleanup: Delete the temporary files to save server space
                fs.unlinkSync(inputPath);
                fs.unlinkSync(pdfPath);
                fs.rmdirSync(outputDir);
            } else {
                res.status(500).json({ error: 'LibreOffice ran, but no PDF was found.' });
            }
        } catch (err) {
            console.error("Cleanup/Read Error:", err);
            res.status(500).json({ error: 'Server failed to read the generated PDF.' });
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Pub PDF Server running on port ${PORT}`));