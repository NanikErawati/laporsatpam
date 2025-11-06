// Models/inputKegiatanModel.js
import dbPromise from "../db.js";

export const getAllKegiatan = async ({ tanggal, shift }) => {
  const pool = await dbPromise;
  let query = "SELECT * FROM input_kegiatan WHERE 1=1";
  const values = [];
  let paramIndex = 1;

  if (tanggal) {
    query += ` AND tanggal = $${paramIndex}`;
    values.push(tanggal);
    paramIndex++;
  }
  if (shift) {
    query += ` AND shift = $${paramIndex}`;
    values.push(shift);
    paramIndex++;
  }

  query += " ORDER BY created_at DESC";
  const records = await pool.query(query, values);
  return records.rows;
};

export const createKegiatan = async ({ tanggal, shift, jam, kegiatan }) => {
  const pool = await dbPromise;
  const result = await pool.query(
    "INSERT INTO input_kegiatan (tanggal, shift, jam, kegiatan) VALUES ($1, $2, $3, $4) RETURNING *",
    [tanggal, shift, jam, kegiatan]
  );
  return result.rows[0];
};

export const updateKegiatan = async (id, { tanggal, jam, kegiatan }) => {
  const pool = await dbPromise;
  const result = await pool.query(
    "UPDATE input_kegiatan SET tanggal = $1, jam = $2, kegiatan = $3 WHERE id = $4 RETURNING *",
    [tanggal, jam, kegiatan, id]
  );
  return result.rows[0];
};

export const deleteKegiatan = async (id) => {
  const pool = await dbPromise;
  await pool.query("DELETE FROM input_kegiatan WHERE id = $1", [id]);
  return { message: "Kegiatan deleted successfully" };
};

export const saveReport = async ({ tanggal, shift, kegiatanList }) => {
  // For now, just return the list; in future, save as separate report table
  return { tanggal, shift, kegiatanList, message: "Report saved" };
};
