import express from "express";
import cors from "cors";
import axios from "axios";
const app = express();
import authRoutes from './routes/auth.routes';
import sevasRoutes from './routes/sevas.routes';
import organizationRoutes from './routes/organization.routes';

import devoteesRoutes from './routes/devotees.routes';
import deitiesRoutes from './routes/deities.routes';
import paymentMethodRoutes from './routes/paymentmethod.routes';
import sevabookingRoutes from "./routes/sevabooking.routes";

import trusteesRoutes from './routes/trustees.routes';
import hundiRoutes from './routes/hundi.routes';
import templeRoutes from "./routes/temple.routes"
import tokensRoutes from "./routes/tokens.routes"
import path from "path";
import fs from "fs"

// load panchanga names
const namesPath = path.join(__dirname, "names.json");
const names = JSON.parse(fs.readFileSync(namesPath, "utf8"));

// ✅ UPDATED CORS CONFIGURATION
app.use(cors({
  origin: [
    "https://tmscmt.netlify.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ... (rest of your panchanga endpoint code remains the same) ...

app.get("/panchanga", (req, res) => {
  const { date } = req.query
  if (!date) {
    return res.json({ error: "Date required" })
  }
  const d = new Date(date as string)
  const day = d.getDate()
  const month = d.getMonth() + 1
  const year = d.getFullYear()
  const weekday = d.getDay()
  const tithiIndex = (day % 30) || 30
  const nakIndex = (day % 27) || 27
  const masaIndex = (month % 12) || 12
  const yogaIndex = (day % 27) || 27
  const karanaIndex = (day % 60) || 60
  const samvatsIndex = ((d.getFullYear() + 57) % 60) || 60
  const pakshaKey = day <= 15 ? "shukla" : "krishna"
  const shakaYear = year - 78

  res.json({
    tithi: names.tithis[tithiIndex],
    nakshatra: names.nakshatras[nakIndex],
    masa: names.masas[masaIndex],
    samvatsara: names.samvats[samvatsIndex],
    yoga: names.yogas[yogaIndex],
    karana: names.karanas[karanaIndex],
    vara: names.varas[weekday],
    paksha: names.pakshas[pakshaKey],
    hindu_shaka_year: shakaYear
  })
})

app.use('/api/auth', authRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/temple/sevas', sevasRoutes);
app.use('/api/v1/temple/devotees', devoteesRoutes);
app.use('/api/v1/temple/deities', deitiesRoutes);
app.use('/api/v1/temple/payment-methods', paymentMethodRoutes);
app.use("/api/v1/temple/seva-bookings", sevabookingRoutes);
app.use('/api/v1/temple/trustees', trusteesRoutes);
app.use('/api/v1/hundi', hundiRoutes);
app.use("/api/v1/temple/temples", templeRoutes);
app.use("/api/v1/temple/tokens", tokensRoutes);
app.use('/public', express.static(path.join(__dirname, 'public')));

export default app;