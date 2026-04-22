



import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const uploadDir = path.join(__dirname, "../public/deities");

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file, cb) => {
    const orgId = req.user?.organization_id;
    const templeId = req.user?.temple_id;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const fileName = `org_${orgId}_tem_${templeId}_${timestamp}${ext}`;
    cb(null, fileName);
  },
});

export const uploadDeity = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});