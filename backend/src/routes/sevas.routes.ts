import express from "express";
import {
    getSevas,
    getSevaById,
    createSeva,
    updateSeva,
    deleteSeva,
    searchSevas
} from "../controllers/sevas.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";

const router = express.Router();

// All seva routes require a valid token
router.use(authenticate);

router.get("/search", requirePermission('manage_sevas', 1), searchSevas);
// Level 1: View permission
router.get("/", requirePermission('manage_sevas', 1), getSevas);
router.get("/:id", requirePermission('manage_sevas', 1), getSevaById);

// Level 2: Add/Create permission
router.post("/", requirePermission('manage_sevas', 2), createSeva);

// Level 3: Update/Edit permission
router.put("/:id", requirePermission('manage_sevas', 3), updateSeva);

// Level 4: Delete permission
router.delete("/:id", requirePermission('manage_sevas', 4), deleteSeva);

export default router;