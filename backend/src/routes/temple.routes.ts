import { Router } from "express"
import {
  createTemple,
  getAllTemples,
  getTempleById,
  updateTemple,
  deleteTemple,
} from "../controllers/temple.controller"
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { uploadTemple } from "../middleware/uploadTemple";
const router = Router()
router.use(authenticate);
router.post("/", createTemple)
router.get("/",requirePermission('manage_temples', 1), getAllTemples)
router.get("/:id",requirePermission('manage_temples', 1), getTempleById)
router.put("/:id",requirePermission('manage_temples', 1),
uploadTemple.single("img_name"),
updateTemple)
router.delete("/:id",requirePermission('manage_temples', 1), deleteTemple)

export default router