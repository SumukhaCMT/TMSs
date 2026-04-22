import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(
  __dirname,
  "../public/organizations"
);

// create folder if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, uploadDir);

  },

  filename: (req, file, cb) => {

    const uniqueName =
      // "org_" +
      // Date.now() +
      // "_" +
      // Math.round(Math.random() * 1e9) +
      // path.extname(file.originalname);
       `org_${req.body.organization_id}_${Date.now()}${path.extname(file.originalname)}`;

    cb(null, uniqueName);

  }

});

export const uploadOrganization =
  multer({ storage });
