// src/routes/organization.routes.ts
import { Router } from 'express';
import {
    registerOrganization, getRegisterOrganization,


    getOrganizationById,
    updateOrganization,
    deleteOrganization,
} from '../controllers/organization.controller';
import { getTemplesByOrg } from '../controllers/hundi.controller';
import { authenticate } from "../middleware/auth.middleware";
import { uploadOrganization } from "../middleware/uploadOrganization";

const router = Router();
router.post('/register', registerOrganization);

router.use(authenticate);
// GET → list organizations
router.get('/register', getRegisterOrganization);
router.get("/register/:id",

    getOrganizationById);

router.put(
    "/register/:id",
    uploadOrganization.single("image"),
    updateOrganization
);
router.delete("/register/:id", deleteOrganization);
router.get('/:orgId/temples', getTemplesByOrg);
export default router;




