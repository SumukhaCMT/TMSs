// routes/tokens.routes.ts
import express from "express";
import {
  getTokens,
  getTokenById,
  createToken,
  updateToken,
  deleteToken,
  issueToken
} from "../controllers/tokens.controller";

import { authenticate, requirePermission } from "../middleware/auth.middleware";

const router = express.Router();

// All routes require auth
router.use(authenticate);

// Level 1: View
router.get("/", requirePermission("manage_tokens", 1), getTokens);
router.get("/:id", requirePermission("manage_tokens", 1), getTokenById);

// Level 2: Create
router.post("/", requirePermission("manage_tokens", 2), createToken);

// Level 3: Update
router.put("/:id", requirePermission("manage_tokens", 3), updateToken);

// Level 4: Delete
router.delete("/:id", requirePermission("manage_tokens", 4), deleteToken);
// Level 4 update 
router.post(
  "/token-issues",
  requirePermission("manage_tokens", 2),
  issueToken
);

export default router;