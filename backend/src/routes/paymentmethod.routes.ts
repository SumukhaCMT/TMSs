



import express from "express";

import {

getPaymentMethods,
getPaymentMethodById,
createPaymentMethod,
updatePaymentMethod,
deletePaymentMethod

} from "../controllers/paymentmethod.controller";

import { authenticate ,requirePermission} from "../middleware/auth.middleware";

const router = express.Router();

router.use(authenticate);


router.get("/", requirePermission('manage_payment_methods', 1),getPaymentMethods);

router.get("/:id",requirePermission('manage_payment_methods', 1), getPaymentMethodById);

router.post("/",requirePermission('manage_payment_methods', 2), createPaymentMethod);

router.put("/:id", requirePermission('manage_payment_methods', 3), updatePaymentMethod);

router.delete("/:id", requirePermission('manage_payment_methods', 4), deletePaymentMethod);


export default router;