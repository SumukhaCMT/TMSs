
import express from "express";

import {
  getSevaBookings,
  getSevaBookingById,
  createSevaBooking,
  updateSevaBooking,
  deleteSevaBooking,
  cancelSevaBooking
} from "../controllers/sevabooking.controller";


import { authenticate ,requirePermission} from "../middleware/auth.middleware";

const router = express.Router();

// protect all routes
router.use(authenticate);
// GET all bookings
router.get("/", requirePermission('manage_sevabooking', 1),getSevaBookings);

// GET single booking
router.get("/:id",requirePermission('manage_sevabooking', 1), getSevaBookingById);

// CREATE booking
router.post("/",requirePermission('manage_sevabooking', 2), createSevaBooking);

// UPDATE booking
router.put("/:id", requirePermission('manage_sevabooking', 3),updateSevaBooking);

// DELETE booking
router.delete("/:id",requirePermission('manage_sevabooking', 4), deleteSevaBooking);

router.put("/:id/cancel", requirePermission('manage_sevabooking', 3), cancelSevaBooking)

export default router;