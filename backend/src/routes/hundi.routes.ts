import { Router } from 'express';
import {
    createHundi,
    getAllHundis,
    getHundiById,
    updateHundi,
    deleteHundi,
    getItemUnits,
    getWitnessSuggestions,
    getTemplesByOrg,
    getOrgRoles,
    finalizeHundi,
    deleteItemUnit,
    getMasterHundis,
    createMasterHundi,
    deleteMasterHundi
} from '../controllers/hundi.controller';
import { authenticate, requirePermission } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/roles', getOrgRoles);
router.get('/item-units', getItemUnits);
router.post('/item-units/delete', requirePermission('hundi_module', 4), deleteItemUnit);
router.get('/witness-suggestions/:templeId', getWitnessSuggestions);
router.get('/master', requirePermission('hundi_module', 1), getMasterHundis);
router.post('/master', requirePermission('hundi_module', 2), createMasterHundi);
router.delete('/master/:id', requirePermission('hundi_module', 4), deleteMasterHundi);
router.get('/', requirePermission('hundi_module', 1), getAllHundis);
router.get('/:id', requirePermission('hundi_module', 1), getHundiById);
router.post('/', requirePermission('hundi_module', 2), createHundi);
router.put('/:id', requirePermission('hundi_module', 3), updateHundi);
router.delete('/:id', requirePermission('hundi_module', 4), deleteHundi);
// Add this line where you define routes
router.put('/:id/finalize', requirePermission('hundi_module', 2), finalizeHundi);

export default router;