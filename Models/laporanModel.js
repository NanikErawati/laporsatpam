// Models/laporanModel.js
import dbPromise from "../db.js";
import { findAll as findAllHadir } from "./DaftarHadirModel.js";

const LaporanModel = {
  async findAll({ tanggal, shift }) {
    const pool = dbPromise;
    let query = "SELECT * FROM input_kegiatan WHERE 1=1";
    const values = [];
    let paramIndex = 1;

    if (tanggal) {
      values.push(tanggal);
      query += ` AND tanggal = $${paramIndex}`;
      paramIndex++;
    }
    if (shift) {
      values.push(shift);
      query += ` AND shift = $${paramIndex}`;
      paramIndex++;
    }

    // Custom ORDER BY based on shift for proper chronological order
    if (shift && shift.toLowerCase() === 'pagi') {
      query += ` ORDER BY (SUBSTRING(jam FROM '^[0-9]{2}:[0-9]{2}'))::time ASC`;
    } else if (shift && shift.toLowerCase() === 'malam') {
      // For malam shift: sort starting from 19:00, wrapping around to 07:00
      query += ` ORDER BY CASE
        WHEN (SUBSTRING(jam FROM '^[0-9]{2}:[0-9]{2}'))::time >= '19:00'::time
        THEN (SUBSTRING(jam FROM '^[0-9]{2}:[0-9]{2}'))::time
        ELSE (SUBSTRING(jam FROM '^[0-9]{2}:[0-9]{2}'))::time + INTERVAL '24 hours'
      END ASC`;
    } else {
      query += " ORDER BY (SUBSTRING(jam FROM '^[0-9]{2}:[0-9]{2}'))::time ASC";
    }

    const { rows: kegiatanRows } = await pool.query(query, values);

    let hadirData = [];
    if (tanggal && shift) {
      hadirData = await findAllHadir({ tanggal, shift });
    }

    return {
      kegiatan: kegiatanRows,
      attendance: hadirData
    };
  },
};

export default LaporanModel;
