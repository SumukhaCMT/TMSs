import fs from "fs";
import path from "path";

const namesPath = path.join(__dirname, "../names.json");
const names = JSON.parse(fs.readFileSync(namesPath, "utf8"));

// ✅ Leap Year
const isLeapYear = (year: number) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

// ✅ Adhika Masa (approx logic)
const isAdhikaMasa = (year: number, month: number) => {
  const totalMonths = year * 12 + month;
  return totalMonths % 33 === 0;
};

export const getPanchanga = (date: Date, lat: number, lng: number) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const weekday = date.getDay();

  const leapYear = isLeapYear(year);
  const adhikaMasa = isAdhikaMasa(year, month);

  // Panchanga calculations (approx)
  const tithiIndex = (day % 30) || 30;
  const nakIndex = (day % 27) || 27;
  const masaIndex = (month % 12) || 12;
  const samvatsIndex = ((year + 57) % 60) || 60;
  const yogaIndex = (day % 27) || 27;
  const karanaIndex = (day % 11) || 11;

  const pakshaKey = day <= 15 ? "shukla" : "krishna";
  const shakaYear = year - 78;

  let masaName = names.masas[masaIndex];
  if (adhikaMasa) masaName = "Adhika " + masaName;

  return {
    date,
    location: { lat, lng },

    // Panchanga core
    tithi: names.tithis[tithiIndex -1],
    nakshatra: names.nakshatras[nakIndex -1],
    masa: masaName,
    paksha: names.pakshas[pakshaKey],
    vara: names.varas[weekday],
    yoga: names.yogas[yogaIndex -1],
    karana: names.karanas[karanaIndex -1],
    samvatsara: names.samvats[samvatsIndex -1],

    // Calendar
    hindu_shaka_year: shakaYear,
    leap_year: leapYear,
    adhika_masa: adhikaMasa,
  };
};