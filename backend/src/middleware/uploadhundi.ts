import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, "../public/hundi");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate name: hundi_witness_170999999.webp
        const prefix = file.fieldname === 'witness_img' ? 'witness' : 'signature';
        const uniqueName = `hundi_${prefix}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

export const uploadHundiImages = multer({ storage });