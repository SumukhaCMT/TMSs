import express from "express";
import {
    getDeities,
    createDeity,
    updateDeity,
    deleteDeity,
} from "../controllers/deities.controller";
import { uploadDeity } from "../middleware/uploadDeity";
// 1. Import the security middleware
import { authenticate, requirePermission } from "../middleware/auth.middleware"; 

const router = express.Router();

// 2. Require Login for ALL routes
router.use(authenticate);

// 3. Level 1 (View) - Needed for Tables & Dropdowns
// Note: Your Hundi user must have 'manage_deities' (Level 1) to see names in the Hundi table.
router.get("/", requirePermission('manage_deities', 1), getDeities);

// 4. Level 2 (Create/Edit) - For adding new deities
router.post(
    "/",
    requirePermission('manage_deities', 2), 
    uploadDeity.single("img_name"),
    createDeity
);

router.put(
    "/:id",
    requirePermission('manage_deities', 2), 
    uploadDeity.single("img_name"),
    updateDeity
);

// 5. Level 4 (Delete) - For removing records
router.delete(
    "/:id",
    requirePermission('manage_deities', 4), 
    deleteDeity
);

export default router;