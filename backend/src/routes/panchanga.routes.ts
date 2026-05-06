import express from "express";
import { getPanchanga } from "../services/panchanga.service";

const router = express.Router();

router.get("/", (req, res) => {
  const { date, lat, lng } = req.query;

  if (!date || !lat || !lng) {
    return res.json({ error: "date, lat, lng required" });
  }

  const result = getPanchanga(
    new Date(date as string),
    Number(lat),
    Number(lng)
  );

  res.json(result);
});

export default router;