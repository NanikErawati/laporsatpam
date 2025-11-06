import LaporanController from '../controllers/laporanController.js';
import request from 'supertest';
import app from '../app.js'; // Assuming this is your Express app
import pool from '../db.js';

// Setup mock database before tests
beforeEach(() => {
  return pool.query('TRUNCATE laporan CASCADE');
});

describe('LaporanController', () => {
  test('should get reports by date and shift', async () => {
    // Setup test data
    await pool.query('INSERT INTO laporan (tanggal, shift, present, absent, total) VALUES ($1, $2, $3, $4, $5)', [
      '2025-10-01', 'A', 20, 5, 25
    ]);
    await pool.query('INSERT INTO laporan (tanggal, shift, present, absent, total) VALUES ($1, $2, $3, $4, $5)', [
      '2025-10-01', 'B', 25, 0, 25
    ]);

    // Make request
    const response = await request(app)
      .get('/api/laporan')
      .query({ tanggal: '2025-10-01', shift: 'A' });

    // Test response
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].shift).toBe('A');
    expect(response.body[0].total).toBe(20);
  });
});