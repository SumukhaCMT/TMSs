


import express from "express";

import {

  getDevotees,
  createDevotee,
  updateDevotee,
  deleteDevotee,
  getDevoteeById,
searchDevotees, // 
} from "../controllers/devotees.controller";



import { authenticate, requirePermission } from "../middleware/auth.middleware";



const router = express.Router();


router.use(authenticate);



//  SEARCH ROUTE (MUST BE BEFORE /:id)
router.get(
  "/search",
  requirePermission("manage_devotees", 1),
  searchDevotees
);

router.get("/", requirePermission('manage_devotees', 1),getDevotees);

router.get("/:id", requirePermission('manage_devotees', 1), getDevoteeById);

router.post("/", requirePermission('manage_devotees', 2), createDevotee);

router.put("/:id", requirePermission('manage_devotees', 3), updateDevotee);

router.delete("/:id", requirePermission('manage_devotees', 4), deleteDevotee);

export default router;