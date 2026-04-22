
// src/config/db.ts

import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  // connectionLimit: 10
});

export default db;
