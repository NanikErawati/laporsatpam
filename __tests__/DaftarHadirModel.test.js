import DaftarHadirModel from '../Models/DaftarHadirModel.js';
import bcrypt from 'bcrypt';
import { jest } from '@jest/globals';

import pool from '../db.js';

const mockQuery = jest.spyOn(pool, 'query');

describe('DaftarHadirModel', () => {
  beforeEach(() => {
    mockQuery.mockClear();
  });

  afterAll(() => {
    mockQuery.mockRestore();
  });

  test('should create new attendance record', async () => {
    const mockResult = {
      rows: [{
        id: 1,
        tanggal: '2025-10-01',
        shift: 'A',
        nama: 'Jhon Doe',
        lokasi: 'Main Office',
        status: 'present',
        password_hash: 'hashed_password',
        created_at: new Date()
      }]
    };
    mockQuery.mockResolvedValueOnce(mockResult);

    const result = await DaftarHadirModel.create({
      tanggal: '2025-10-01',
      shift: 'A',
      nama: 'Jhon Doe',
      lokasi: 'Main Office',
      status: 'present'
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('present', 10);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO daftar_hadir'),
      expect.arrayContaining([
        '2025-10-01',
        'A',
        'Jhon Doe',
        'Main Office',
        'present',
        expect.any(String)
      ])
    );
    expect(result).toEqual(mockResult.rows[0]);
  });

  test('should find all attendance records', async () => {
    const mockRecords = [
      {
        id: 1,
        tanggal: '2025-10-01',
        shift: 'A',
        nama: 'Jhon Doe',
        lokasi: 'Main Office',
        status: 'present'
      },
      {
        id: 2,
        tanggal: '2025-10-01',
        shift: 'B',
        nama: 'Jane Smith',
        lokasi: 'Remote Office',
        status: 'absent'
      }
    ];
    mockQuery.mockResolvedValueOnce({ rows: mockRecords });

    const records = await DaftarHadirModel.findAll();

    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT * FROM daftar_hadir ORDER BY created_at DESC"
    );
    expect(records).toEqual(mockRecords);
    expect(records).toHaveLength(2);
    expect(records[0].nama).toBe('Jhon Doe');
  });

  test('should find attendance record by id', async () => {
    const mockRecord = {
      id: 1,
      tanggal: '2025-10-01',
      shift: 'A',
      nama: 'Jhon Doe',
      lokasi: 'Main Office',
      status: 'present'
    };
    mockQuery.mockResolvedValueOnce({ rows: [mockRecord] });

    const record = await DaftarHadirModel.findById(1);

    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT * FROM daftar_hadir WHERE id = $1",
      [1]
    );
    expect(record).toEqual(mockRecord);
  });

  test('should return null if attendance record not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const record = await DaftarHadirModel.findById(999);

    expect(record).toBeNull();
  });
});