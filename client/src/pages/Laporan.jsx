import React, { useState, useEffect } from "react";
import api from "../API/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import bpsLogo from "../assets/logo BPS.png"; // BPS logo
import swaLogo from "../assets/OIP.png"; // SWA logo

const LihatLaporan = () => {
  const [laporan, setLaporan] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [filter, setFilter] = useState({ tanggal: "", shift: "" });
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!filter.tanggal || !filter.shift) {
        setLaporan([]);
        setLoading(false);
        return;
      }
      // Fetch enriched laporan data (includes attached attendance)
      const resKegiatan = await api.get("/laporan", { params: filter });
      const result = resKegiatan.data || { kegiatan: [], attendance: [] };
      setLaporan(result.kegiatan || []);
      setAttendance(result.attendance || []);
    } catch (err) {
      console.error("Gagal ambil data:", err);
      alert("Gagal memuat data: " + (err.response?.data?.message || err.message));
      setLaporan([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const openPreview = () => {
    if (!filter.tanggal || !filter.shift) {
      alert("Pilih tanggal dan shift terlebih dahulu!");
      return;
    }
    setShowPreview(true);
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");

      // Add logos to header
      const logoWidth = 20;
      const logoHeight = 15;
      const logoY = 20;

      // BPS logo on left
      doc.addImage(bpsLogo, 'PNG', 20, logoY, logoWidth, logoHeight);

      // SWA logo on right (placeholder BPS)
      doc.addImage(swaLogo, 'PNG', 170, logoY, logoWidth, logoHeight);

      // Header title - centered below logos
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      const titleWidth = doc.getTextWidth("Laporan Kegiatan Satpam");
      doc.text("Laporan Kegiatan Satpam", (210 - titleWidth) / 2, logoY + logoHeight + 5);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const subtitleWidth = doc.getTextWidth("BPS Kabupaten Tuban");
      doc.text("BPS Kabupaten Tuban", (210 - subtitleWidth) / 2, logoY + logoHeight + 15);

      // Garis pemisah header
      doc.setLineWidth(0.5);
      doc.line(20, logoY + logoHeight + 25, 190, logoY + logoHeight + 25);

      const fieldsEndY = logoY + logoHeight + 35;

      // Tanggal and Shift as header fields
      const tanggalText = filter.tanggal ? new Date(filter.tanggal).toLocaleDateString("id-ID") : "-";
      const shiftText = filter.shift || "-";

      // Tanggal and Shift as header fields
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Tanggal: ${tanggalText}`, 20, fieldsEndY);
      doc.text(`Shift: ${shiftText}`, 20, fieldsEndY + 10);

      let currentY = fieldsEndY + 30;

      // Daftar Hadir Table
      if (attendance.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Daftar Hadir", 20, currentY);
        currentY += 10;

      const hadirColumns = [
        { header: "Nama Satpam", dataKey: "nama" },
        { header: "Status Hadir", dataKey: "status" }
      ];
      const hadirData = attendance.map(item => ({
        nama: item.nama,
        status: item.status
      }));

      autoTable(doc, {
        startY: currentY,
        columns: hadirColumns,
        body: hadirData,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 4, halign: "left", lineWidth: 0.2 },
        headStyles: { fillColor: [200, 200, 200], fontStyle: "bold" },
        columnStyles: {
          nama: { cellWidth: 85 },
          status: { cellWidth: 85, halign: "center" }
        },
        margin: { left: 20, right: 20 },
      });

      currentY = doc.lastAutoTable.finalY + 10;
    }

    // Tabel Kegiatan - Neat with proper widths and justification
    const kegiatanColumns = [{ header: "Jam", dataKey: "jam" }, { header: "Deskripsi Kegiatan", dataKey: "kegiatan" }];
    const kegiatanData = laporan.map((item) => ({ jam: item.jam, kegiatan: item.kegiatan }));

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Kegiatan", 20, currentY);
    currentY += 10;

    autoTable(doc, {
      startY: currentY,
      columns: kegiatanColumns,
      body: kegiatanData,
      theme: "grid",
      styles: { fontSize: 11, cellPadding: 6, halign: "left", lineWidth: 0.3, lineColor: [0, 0, 0] },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold", lineWidth: 0.3 },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      columnStyles: {
        jam: { cellWidth: 40, halign: "center" },
        kegiatan: { cellWidth: 130, halign: "justify" }
      },
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

      const fileName = `laporan_${filter.tanggal || "semua"}_${filter.shift || "all"}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      setShowPreview(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal membuat PDF: " + error.message);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  // Use attendance array for preview display
  const previewAttendance = attendance;

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Lihat Laporan</h2>

      {/* Filter - auto apply on change, responsive flex */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
        <input
          type="date"
          value={filter.tanggal}
          onChange={(e) => setFilter({ ...filter, tanggal: e.target.value })}
          className="border rounded p-2 text-sm sm:text-base flex-1"
        />
        <select
          value={filter.shift}
          onChange={(e) => setFilter({ ...filter, shift: e.target.value })}
          className="border rounded p-2 text-sm sm:text-base flex-1 sm:w-auto"
        >
          <option value="">Pilih Shift</option>
          <option value="Pagi">Pagi</option>
          <option value="Malam">Malam</option>
        </select>
        <button
          onClick={openPreview}
          disabled={loading || !filter.tanggal || !filter.shift}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-green-700 text-sm sm:text-base w-full sm:w-auto"
        >
          Cetak Laporan
        </button>
      </div>

      {/* Web Table - Only Kegiatan, scrollable on mobile */}
      {loading ? (
        <p className="text-center text-sm sm:text-base">Memuat data...</p>
      ) : (
        <div>
          <p className="mb-2 text-sm text-gray-600">Hasil filter: {laporan.length} kegiatan, {attendance.length} daftar hadir</p>
          <div className="overflow-x-auto">
            <table className="w-full border min-w-[300px]">
              <thead>
                <tr className="bg-blue-200">
                  <th className="border p-2 text-left text-sm sm:text-base">Jam</th>
                  <th className="border p-2 text-left text-sm sm:text-base">Deskripsi Kegiatan</th>
                </tr>
              </thead>
              <tbody>
                {laporan.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="text-center p-2 text-sm sm:text-base">Tidak ada kegiatan</td>
                  </tr>
                ) : (
                  laporan.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50">
                      <td className="border p-2 text-sm sm:text-base">{item.jam}</td>
                      <td className="border p-2 text-sm sm:text-base max-w-xs truncate">{item.kegiatan}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Modal - Full screen on mobile */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white w-full h-full sm:max-w-4xl sm:max-h-[90vh] overflow-auto rounded-lg sm:rounded-lg relative shadow-lg flex flex-col">
            <button onClick={closePreview} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl z-10">&times;</button>
            <div className="p-4 sm:p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold mb-4">Preview Laporan PDF</h3>
              <div className="border border-gray-300 p-4 sm:p-6 bg-gray-50 flex-1 overflow-auto min-h-[400px] sm:min-h-[600px]">
                {/* Header with logos */}
                <div className="flex items-center justify-between mb-4 sm:mb-8 p-4 bg-white rounded">
                  <img src={bpsLogo} alt="BPS Logo" className="h-12 w-auto" />
                  <div className="text-center flex-1 px-4">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1">Laporan Kegiatan Satpam</h1>
                    <h2 className="text-lg sm:text-xl font-semibold">BPS Kabupaten Tuban</h2>
                  </div>
                  <img src={swaLogo} alt="SWA Logo" className="h-12 w-auto" />
                </div>

                {/* Header Fields: Tanggal and Shift */}
                <div className="mb-4 sm:mb-8 overflow-x-auto">
                  <table className="w-full border border-gray-400 min-w-[250px]">
                    <tbody>
                      <tr>
                        <td className="border p-2 font-bold w-1/4 text-sm sm:text-base">Tanggal:</td>
                        <td className="border p-2 w-3/4 text-sm sm:text-base">{filter.tanggal ? new Date(filter.tanggal).toLocaleDateString("id-ID") : "-"}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-bold w-1/4 text-sm sm:text-base">Shift:</td>
                        <td className="border p-2 w-3/4 text-sm sm:text-base">{filter.shift || "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Daftar Hadir Table */}
                {previewAttendance.length > 0 && (
                  <div className="mb-4 sm:mb-8 overflow-x-auto">
                    <h4 className="text-md font-bold mb-2">Daftar Hadir</h4>
                    <table className="w-full border border-gray-400 min-w-[300px]">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border p-2 text-left font-bold text-sm sm:text-base w-1/2">Nama Satpam</th>
                          <th className="border p-2 text-center font-bold text-sm sm:text-base w-1/2">Status Hadir</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewAttendance.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                            <td className="border p-2 text-sm sm:text-base">{item.nama || "-"}</td>
                            <td className="border p-2 text-center text-sm sm:text-base">{item.status || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Table Kegiatan, scrollable */}
                <div className="mb-4 sm:mb-8 flex-1 overflow-x-auto">
                  <h4 className="text-md font-bold mb-2">Kegiatan</h4>
                  <table className="w-full border border-gray-400 min-w-[250px]">
                    <thead>
                      <tr className="bg-blue-300">
                        <th className="border p-2 sm:p-4 text-left font-bold text-sm sm:text-base">Jam</th>
                        <th className="border p-2 sm:p-4 text-left font-bold text-sm sm:text-base">Deskripsi Kegiatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {laporan.length === 0 ? (
                        <tr>
                          <td colSpan="2" className="border p-4 text-center text-sm sm:text-base">Tidak ada kegiatan</td>
                        </tr>
                      ) : (
                        laporan.map((item, idx) => (
                          <tr key={item.id || idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                            <td className="border p-2 sm:p-4 w-1/4 text-center text-sm sm:text-base">{item.jam}</td>
                            <td className="border p-2 sm:p-4 w-3/4 text-justify break-words text-sm sm:text-base">{item.kegiatan}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Signature Section */}
                <div className="mt-8 flex justify-end">
                  <div className="text-center">
                    <p className="text-sm font-normal">Mengetahui,</p>
                    <p className="text-sm font-normal">Ketua Subbagian Umum</p>
                    <div className="h-12"></div> {/* Space for signature */}
                    <p className="text-sm font-bold">Lulus Haryono, SST.</p>
                  </div>
                </div>

                {/* Cetak Button */}
                <div className="text-center mt-4">
                  <button onClick={generatePDF} className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded font-bold hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto">
                    Cetak PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LihatLaporan;