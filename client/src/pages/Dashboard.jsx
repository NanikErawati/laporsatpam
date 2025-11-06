import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../API/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import bpsLogo from "../assets/logo BPS.png";
import swaLogo from "../assets/OIP.png";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSatpam: 0,
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpha: 0
  });
  const [dailyReports, setDailyReports] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [monthlyRecap, setMonthlyRecap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Fetching dashboard data...");
      const response = await api.get("/laporan/dashboard");
      console.log("Dashboard response:", response.data);
      const data = response.data;

      // Update stats with proper defaults
      setStats({
        totalSatpam: data.stats?.totalSatpam || 0,
        hadir: data.stats?.hadir || 0,
        izin: data.stats?.izin || 0,
        sakit: data.stats?.sakit || 0,
        alpha: data.stats?.alpha || 0
      });

      setDailyReports(data.dailyReports || []);
      setAttendanceData(data.attendanceData || []);
      setMonthlyRecap(data.monthlyRecap || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set default empty values on error
      setStats({
        totalSatpam: 0,
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpha: 0
      });
      setDailyReports([]);
      setAttendanceData([]);
      setMonthlyRecap([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // Add logos to header
    const logoWidth = 20;
    const logoHeight = 15;
    const logoY = 20;

    doc.addImage(bpsLogo, 'PNG', 20, logoY, logoWidth, logoHeight);
    doc.addImage(swaLogo, 'PNG', 170, logoY, logoWidth, logoHeight);

    // Header title - centered
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const titleWidth = doc.getTextWidth("Rekap Bulanan Kehadiran Satpam");
    doc.text("Rekap Bulanan Kehadiran Satpam", (210 - titleWidth) / 2, logoY + logoHeight + 5);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const subtitleWidth = doc.getTextWidth("BPS Kabupaten Tuban");
    doc.text("BPS Kabupaten Tuban", (210 - subtitleWidth) / 2, logoY + logoHeight + 15);

    // Garis pemisah header
    doc.setLineWidth(0.5);
    doc.line(20, logoY + logoHeight + 25, 190, logoY + logoHeight + 25);

    // Month and year
    const currentDate = new Date();
    const monthYear = currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const monthWidth = doc.getTextWidth(`Bulan: ${monthYear}`);
    doc.text(`Bulan: ${monthYear}`, (210 - monthWidth) / 2, logoY + logoHeight + 35);

    // Table
    const columns = [
      { header: "Nama Satpam", dataKey: "nama" },
      { header: "Hadir", dataKey: "hadir" },
      { header: "Izin", dataKey: "izin" },
      { header: "Alpha", dataKey: "alpha" },
      { header: "Shift Pagi", dataKey: "shiftPagi" },
      { header: "Shift Malam", dataKey: "shiftMalam" }
    ];

    const tableData = monthlyRecap.map(item => ({
      nama: item.nama,
      hadir: item.hadir,
      izin: item.izin,
      alpha: item.alpha,
      shiftPagi: item.shiftPagi,
      shiftMalam: item.shiftMalam
    }));

    autoTable(doc, {
      startY: logoY + logoHeight + 45,
      columns: columns,
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 4, halign: "center" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      margin: { left: 20, right: 20 },
    });

    // Add signature section at bottom right
    const signatureY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Mengetahui,", 140, signatureY);
    doc.text("Ketua Subbagian Umum", 140, signatureY + 10);
    doc.text("", 140, signatureY + 30); // Space for signature
    doc.setFont("helvetica", "bold");
    doc.text("Lulus Haryono, SST.", 140, signatureY + 50);

    const fileName = `rekap_bulanan_${currentDate.getFullYear()}_${String(currentDate.getMonth() + 1).padStart(2, '0')}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="p-4 sm:p-6 flex-1 bg-gray-50">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">Dashboard</h2>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h3 className="text-2xl font-bold text-blue-600">{stats.totalSatpam}</h3>
            <p className="text-sm text-gray-600">Total Satpam</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h3 className="text-2xl font-bold text-green-600">{stats.hadir}</h3>
            <p className="text-sm text-gray-600">Hadir</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h3 className="text-2xl font-bold text-yellow-600">{stats.izin}</h3>
            <p className="text-sm text-gray-600">Izin</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h3 className="text-2xl font-bold text-orange-600">{stats.sakit}</h3>
            <p className="text-sm text-gray-600">Sakit</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h3 className="text-2xl font-bold text-red-600">{stats.alpha}</h3>
            <p className="text-sm text-gray-600">Alpha</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Reports Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Grafik Laporan Harian</h3>
            <div className="h-64 sm:h-80">
              <Line
                data={{
                  labels: dailyReports.map(item => `${item.day}`),
                  datasets: [
                    {
                      label: 'Shift Pagi',
                      data: dailyReports.map(item => item.pagi),
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.5)',
                      tension: 0.1,
                    },
                    {
                      label: 'Shift Malam',
                      data: dailyReports.map(item => item.malam),
                      borderColor: 'rgb(147, 51, 234)',
                      backgroundColor: 'rgba(147, 51, 234, 0.5)',
                      tension: 0.1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                    x: {
                      ticks: {
                        maxTicksLimit: 15,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Attendance Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Grafik Kehadiran Satpam</h3>
            <div className="h-64 sm:h-80">
              <Bar
                data={{
                  labels: attendanceData.map(item => item.nama.split(' ')[0]), // Show only first name for mobile
                  datasets: [
                    {
                      label: 'Hadir',
                      data: attendanceData.map(item => item.hadir),
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    },
                    {
                      label: 'Izin',
                      data: attendanceData.map(item => item.izin),
                      backgroundColor: 'rgba(234, 179, 8, 0.8)',
                    },
                    {
                      label: 'Sakit',
                      data: attendanceData.map(item => item.sakit),
                      backgroundColor: 'rgba(249, 115, 22, 0.8)',
                    },
                    {
                      label: 'Alpha',
                      data: attendanceData.map(item => item.alpha),
                      backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Monthly Recap Table */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Rekap Bulanan</h3>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 min-w-[600px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left text-sm sm:text-base">Nama Satpam</th>
                  <th className="border p-2 text-center text-sm sm:text-base">Hadir</th>
                  <th className="border p-2 text-center text-sm sm:text-base">Izin</th>
                  <th className="border p-2 text-center text-sm sm:text-base">Sakit</th>
                  <th className="border p-2 text-center text-sm sm:text-base">Alpha</th>
                  <th className="border p-2 text-center text-sm sm:text-base">Shift Pagi</th>
                  <th className="border p-2 text-center text-sm sm:text-base">Shift Malam</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRecap.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-4 text-gray-500 text-sm sm:text-base">Tidak ada data</td>
                  </tr>
                ) : (
                  monthlyRecap.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border p-2 text-sm sm:text-base">{item.nama}</td>
                      <td className="border p-2 text-center text-sm sm:text-base">{item.hadir}</td>
                      <td className="border p-2 text-center text-sm sm:text-base">{item.izin}</td>
                      <td className="border p-2 text-center text-sm sm:text-base">{item.sakit || 0}</td>
                      <td className="border p-2 text-center text-sm sm:text-base">{item.alpha}</td>
                      <td className="border p-2 text-center text-sm sm:text-base">{item.shiftPagi}</td>
                      <td className="border p-2 text-center text-sm sm:text-base">{item.shiftMalam}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={generateMonthlyPDF}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm sm:text-base flex items-center mx-auto"
            >
              🖨️ Cetak Rekap Bulanan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
