import api from "../API/axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NotificationDialog = ({ isOpen, onClose, onConfirm, message, title = "Pemberitahuan", confirmText = "OK", showConfirm = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          {showConfirm && (
            <button
              onClick={onConfirm}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {confirmText}
            </button>
          )}
          {!showConfirm && (
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const DaftarHadir = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tanggal: "",
    shift: "",
    nama: "",
    status: "",
  });

  const [loadingLokasi, setLoadingLokasi] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("Pemberitahuan");
  const [dialogConfirmText, setDialogConfirmText] = useState("OK");
  const [showConfirmButton, setShowConfirmButton] = useState(true);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/daftar-hadir/create", formData);
      console.log("Response server:", res.data);

      // Show success dialog
      setDialogTitle("Berhasil");
      setDialogMessage("Daftar hadir berhasil disimpan");
      setDialogConfirmText("OK");
      setShowConfirmButton(true);
      setShowDialog(true);

      // simpan shift dan tanggal ke localStorage (biar bisa dipakai di InputKegiatan)
      localStorage.setItem("shift", formData.shift);
      localStorage.setItem("tanggal", formData.tanggal);

      // reset form
      setFormData({
        tanggal: "",
        shift: "",
        nama: "",
        status: "",
      });

    } catch (err) {
      console.error("❌ Gagal simpan:", err);

      // Check if the error is due to duplicate attendance
      if (err.response?.status === 400 && err.response?.data?.message?.includes("sudah mengisi daftar hadir")) {
        setDialogTitle("Pemberitahuan");
        setDialogMessage("Anda sudah melakukan presensi untuk tanggal dan shift ini. Silahkan lakukan input kegiatan.");
        setDialogConfirmText("OK");
        setShowConfirmButton(true);
        setShowDialog(true);
      } else {
        setDialogTitle("Error");
        setDialogMessage("Terjadi kesalahan saat menyimpan ke server");
        setShowConfirmButton(false);
        setShowDialog(true);
      }
    }
  };

  const handleDialogConfirm = () => {
    setShowDialog(false);

    // If it's a duplicate attendance message, redirect to input kegiatan
    if (dialogMessage.includes("sudah melakukan presensi")) {
      // simpan shift dan tanggal ke localStorage (biar bisa dipakai di InputKegiatan)
      localStorage.setItem("shift", formData.shift);
      localStorage.setItem("tanggal", formData.tanggal);
      // Redirect to Input Kegiatan
      navigate("/input-kegiatan");
    } else if (dialogMessage === "Daftar hadir berhasil disimpan") {
      // For success message, auto redirect after a short delay
      setTimeout(() => {
        navigate("/input-kegiatan");
      }, 500);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 pb-20 sm:pb-6 overflow-y-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 text-center">
        Form Daftar Hadir
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-md sm:max-w-2xl mx-auto"
      >
        {/* Tanggal */}
        <div className="mb-4">
          <label className="block font-medium mb-2 text-sm sm:text-base">Tanggal</label>
          <input
            type="date"
            name="tanggal"
            value={formData.tanggal}
            onChange={handleChange}
            className="w-full border rounded p-2 text-sm sm:text-base"
            required
          />
        </div>

        {/* Shift */}
        <div className="mb-4">
          <label className="block font-medium mb-2 text-sm sm:text-base">Shift</label>
          <select
            name="shift"
            value={formData.shift}
            onChange={handleChange}
            className="w-full border rounded p-2 text-sm sm:text-base"
            required
          >
            <option value="">-- Pilih Shift --</option>
            <option value="Pagi">Pagi</option>
            <option value="Malam">Malam</option>
          </select>
        </div>

        {/* Nama Satpam */}
        <div className="mb-4">
          <label className="block font-medium mb-2 text-sm sm:text-base">Nama Satpam</label>
          <select
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            className="w-full border rounded p-2 text-sm sm:text-base"
            required
          >
            <option value="">-- Pilih Satpam --</option>
            <option value="Johan Ardianto">Johan Ardianto</option>
            <option value="M. Ali Imron">M. Ali Imron</option>
            <option value="Zacky Mubarok">Zacky Mubarok</option>
            <option value="Susik Susanto">Susik Susanto</option>
          </select>
        </div>


        {/* Status */}
        <div className="mb-4">
          <label className="block font-medium mb-2 text-sm sm:text-base">Status Hadir</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded p-2 text-sm sm:text-base"
            required
          >
            <option value="">-- Pilih Status --</option>
            <option value="Hadir">Hadir</option>
            <option value="Izin">Izin</option>
            <option value="Sakit">Sakit</option>
            <option value="Alpha">Alpha</option>
          </select>
        </div>

        {/* Tombol Simpan */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded text-sm sm:text-base hover:bg-blue-700"
        >
          Simpan
        </button>
      </form>

      <NotificationDialog
        isOpen={showDialog}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
        message={dialogMessage}
        title={dialogTitle}
        confirmText={dialogConfirmText}
        showConfirm={showConfirmButton}
      />
    </div>
  );
};

export default DaftarHadir;
