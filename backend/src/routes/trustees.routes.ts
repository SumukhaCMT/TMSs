import express from 'express';
import {
  getTrustees,
  createTrustee,
  updateTrustee,
  deleteTrustee,
  getTrusteeById,
} from '../controllers/trustees.controller';
import { authenticate, requirePermission } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);
router.get('/',requirePermission('trustees', 1), getTrustees);
router.get("/:id", requirePermission("trustees", 1), getTrusteeById);
router.post('/',requirePermission('trustees', 2), createTrustee);
router.put('/:id',requirePermission('trustees', 3), updateTrustee);
router.delete('/:id', requirePermission('trustees', 4),deleteTrustee);

export default router;
