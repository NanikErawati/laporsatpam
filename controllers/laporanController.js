import Laporan from "../Models/laporanModel.js";
import { findAll as findAllDaftarHadir } from "../Models/DaftarHadirModel.js";
import pool from "../db.js";

const LaporanController = {
  async get(req, res) {
    try {
      const { tanggal, shift } = req.query;
      console.log("Tanggal:", tanggal);
      console.log("Shift:", shift);
      if (!tanggal && !shift) {
        return res.json({ kegiatan: [], attendance: [] });  // No filter applied, return empty structure
      }
      const result = await Laporan.findAll({ tanggal, shift });
      res.json(result || { kegiatan: [], attendance: [] });
    } catch (err) {
      console.error("Error ambil laporan:", err);
      res.status(500).json({ message: "❌ Gagal ambil laporan", error: err.message });
    }
  },

  async getDashboardData(req, res) {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Get total satpam count
      const satpamQuery = "SELECT COUNT(DISTINCT nama) as total FROM daftar_hadir";
      const satpamResult = await pool.query(satpamQuery);
      const totalSatpam = parseInt(satpamResult.rows[0].total) || 0;

      // Get reports count for current month
      const reportsQuery = `
        SELECT COUNT(*) as total
        FROM input_kegiatan
        WHERE EXTRACT(MONTH FROM tanggal) = $1 AND EXTRACT(YEAR FROM tanggal) = $2
      `;
      const reportsResult = await pool.query(reportsQuery, [currentMonth, currentYear]);
      const laporanBulanIni = parseInt(reportsResult.rows[0].total) || 0;

      // Get attendance stats for current month
      const attendanceQuery = `
        SELECT status, COUNT(*) as count
        FROM daftar_hadir
        WHERE EXTRACT(MONTH FROM tanggal) = $1 AND EXTRACT(YEAR FROM tanggal) = $2
        GROUP BY status
      `;
      const attendanceResult = await pool.query(attendanceQuery, [currentMonth, currentYear]);

      let hadir = 0;
      let izin = 0;
      let sakit = 0;
      let alpha = 0;
      attendanceResult.rows.forEach(row => {
        const count = parseInt(row.count);
        if (row.status === 'Hadir') {
          hadir += count;
        } else if (row.status === 'Izin') {
          izin += count;
        } else if (row.status === 'Sakit') {
          sakit += count;
        } else if (row.status === 'Alpha') {
          alpha += count;
        }
      });

      // Get daily reports data (simplified - just counts per day)
      const dailyQuery = `
        SELECT
          EXTRACT(DAY FROM tanggal) as day,
          shift,
          COUNT(*) as count
        FROM input_kegiatan
        WHERE EXTRACT(MONTH FROM tanggal) = $1 AND EXTRACT(YEAR FROM tanggal) = $2
        GROUP BY EXTRACT(DAY FROM tanggal), shift
        ORDER BY day, shift
      `;
      const dailyResult = await pool.query(dailyQuery, [currentMonth, currentYear]);

      // Process daily data
      const dailyReports = [];
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dayData = dailyResult.rows.filter(row => parseInt(row.day) === day);
        const pagi = dayData.find(d => d.shift === 'Pagi')?.count || 0;
        const malam = dayData.find(d => d.shift === 'Malam')?.count || 0;
        dailyReports.push({ day, pagi: parseInt(pagi), malam: parseInt(malam) });
      }

      // Get attendance data per satpam
      const satpamAttendanceQuery = `
        SELECT
          nama,
          status,
          COUNT(*) as count
        FROM daftar_hadir
        WHERE EXTRACT(MONTH FROM tanggal) = $1 AND EXTRACT(YEAR FROM tanggal) = $2
        GROUP BY nama, status
        ORDER BY nama
      `;
      const satpamAttendanceResult = await pool.query(satpamAttendanceQuery, [currentMonth, currentYear]);

      // Process satpam attendance data
      const satpamMap = new Map();
      satpamAttendanceResult.rows.forEach(row => {
        if (!satpamMap.has(row.nama)) {
          satpamMap.set(row.nama, { nama: row.nama, hadir: 0, izin: 0, sakit: 0, alpha: 0 });
        }
        const satpam = satpamMap.get(row.nama);
        if (row.status === 'Hadir') satpam.hadir += parseInt(row.count);
        else if (row.status === 'Izin') satpam.izin += parseInt(row.count);
        else if (row.status === 'Sakit') satpam.sakit += parseInt(row.count);
        else if (row.status === 'Alpha') satpam.alpha += parseInt(row.count);
      });

      const attendanceData = Array.from(satpamMap.values());

      // Get monthly recap with shift breakdown
      const monthlyRecapQuery = `
        SELECT
          nama,
          status,
          shift,
          COUNT(*) as count
        FROM daftar_hadir
        WHERE EXTRACT(MONTH FROM tanggal) = $1 AND EXTRACT(YEAR FROM tanggal) = $2
        GROUP BY nama, status, shift
        ORDER BY nama
      `;
      const monthlyRecapResult = await pool.query(monthlyRecapQuery, [currentMonth, currentYear]);

      // Process monthly recap data
      const recapMap = new Map();
      monthlyRecapResult.rows.forEach(row => {
        if (!recapMap.has(row.nama)) {
          recapMap.set(row.nama, {
            nama: row.nama,
            hadir: 0,
            izin: 0,
            sakit: 0,
            alpha: 0,
            shiftPagi: 0,
            shiftMalam: 0
          });
        }
        const satpam = recapMap.get(row.nama);

        // Count by status
        if (row.status === 'Hadir') satpam.hadir += parseInt(row.count);
        else if (row.status === 'Izin') satpam.izin += parseInt(row.count);
        else if (row.status === 'Sakit') satpam.sakit += parseInt(row.count);
        else if (row.status === 'Alpha') satpam.alpha += parseInt(row.count);

        // Count by shift
        if (row.shift === 'Pagi') satpam.shiftPagi += parseInt(row.count);
        else if (row.shift === 'Malam') satpam.shiftMalam += parseInt(row.count);
      });

      const monthlyRecap = Array.from(recapMap.values());

      res.json({
        stats: {
          totalSatpam,
          hadir,
          izin,
          sakit,
          alpha
        },
        dailyReports,
        attendanceData,
        monthlyRecap
      });

    } catch (err) {
      console.error("Error getting dashboard data:", err);
      res.status(500).json({ message: "❌ Gagal ambil data dashboard", error: err.message });
    }
  },
};

export default LaporanController;
