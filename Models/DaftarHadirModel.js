import dbPromise from "../db.js";

export const create = async ({ tanggal, shift, nama, status }) => {
  const pool = dbPromise;
  const { rows } = await pool.query(
    `INSERT INTO daftar_hadir (tanggal, shift, nama, status)
    VALUES ($1, $2, $3, $4) RETURNING *`,
    [tanggal, shift, nama, status]
  );
  return rows[0];
};
export const findAll = async ({ tanggal, shift, nama }) => {
  const pool = dbPromise;
  let query = "SELECT * FROM daftar_hadir WHERE 1=1";
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
  if (nama) {
    query += ` AND nama = $${paramIndex}`;
    values.push(nama);
    paramIndex++;
  }

  query += " ORDER BY tanggal ASC, shift ASC";

  const { rows } = await pool.query(query, values);
  return rows;
};
