import React, { useState, useEffect } from "react";
import api from "../API/axios";

const NotificationDialog = ({ isOpen, onClose, onConfirm, onCancel, message, title = "Pemberitahuan", confirmText = "OK", cancelText = "Batal", showConfirm = true, showCancel = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          {showCancel && (
            <button
              onClick={onCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              {cancelText}
            </button>
          )}
          {showConfirm && (
            <button
              onClick={onConfirm}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {confirmText}
            </button>
          )}
          {!showConfirm && !showCancel && (
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

// Helper untuk bikin range jam
const generateJamRange = (start, end) => {
  const jamList = [];
  let i = start;

  while (true) {
    const next = (i + 1) % 24; // biar looping ke jam 0 lagi
    jamList.push(`${i.toString().padStart(2, "0")}:00 – ${next.toString().padStart(2, "0")}:00`);
    i = next;
    if (i === end) break;
  }

  return jamList;
};

const InputKegiatan = () => {
  const [shift, setShift] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [jamList, setJamList] = useState([]);
  const [availableJams, setAvailableJams] = useState([]);
  const [formData, setFormData] = useState({
    jam: "",
    kegiatan: "",
  });
  const [kegiatanList, setKegiatanList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectKey, setSelectKey] = useState(0); // To force select reset
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("Pemberitahuan");
  const [dialogConfirmText, setDialogConfirmText] = useState("OK");
  const [dialogCancelText, setDialogCancelText] = useState("Batal");
  const [showConfirmButton, setShowConfirmButton] = useState(true);
  const [showCancelButton, setShowCancelButton] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // Load shift dan tanggal dari localStorage (dari DaftarHadir) dan fetch kegiatan dari backend
  useEffect(() => {
    const savedShift = localStorage.getItem("shift");
    const savedTanggal = localStorage.getItem("tanggal");
    if (savedShift && savedTanggal) {
      setShift(savedShift);
      setTanggal(savedTanggal);
      loadJamList(savedShift);
      fetchKegiatan(savedShift, savedTanggal);
    }
  }, []);

  const loadJamList = (currentShift) => {
    if (currentShift?.toLowerCase() === "pagi") {
      setJamList(generateJamRange(7, 19)); // 07:00 → 19:00
    } else if (currentShift?.toLowerCase() === "malam") {
      setJamList(generateJamRange(19, 7)); // 19:00 → 07:00
    }
  };

  const fetchKegiatan = async (currentShift, currentTanggal) => {
    try {
      setLoading(true);
      const response = await api.get("/input-kegiatan", { params: { shift: currentShift, tanggal: currentTanggal } });
      setKegiatanList(response.data || []);
    } catch (error) {
      console.error("Error fetching kegiatan:", error);
      setKegiatanList([]);
    } finally {
      setLoading(false);
    }
  };

  // Update available jams berdasarkan kegiatanList (exclude used jams, except during edit)
  useEffect(() => {
    if (jamList.length > 0) {
      let usedJams = kegiatanList.map(item => item.jam);
      if (editId) {
        // During edit, don't exclude the current editing jam
        const editingItem = kegiatanList.find(item => item.id === editId);
        if (editingItem) {
          usedJams = usedJams.filter(jam => jam !== editingItem.jam);
        }
      }
      const newAvailable = jamList.filter(jam => !usedJams.includes(jam));
      setAvailableJams(newAvailable);
    }
  }, [kegiatanList, jamList, editId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.jam || !formData.kegiatan || !shift || !tanggal) {
      alert("Semua field wajib diisi! Pastikan shift dan tanggal sudah dipilih di Daftar Hadir.");
      return;
    }

    try {
      setLoading(true);
      let response;
      if (editId) {
        // Update kegiatan
        response = await api.put(`/input-kegiatan/${editId}`, { tanggal, jam: formData.jam, kegiatan: formData.kegiatan });
        // Update local list
        setKegiatanList(kegiatanList.map(item => item.id === editId ? response.data : item));
        setEditId(null);
      } else {
        // Tambah kegiatan baru
        response = await api.post("/input-kegiatan", { shift, tanggal, jam: formData.jam, kegiatan: formData.kegiatan });
        // Add to local list
        setKegiatanList([...kegiatanList, response.data]);
      }

      // Reset form - force clear jam select
      setFormData({ jam: "", kegiatan: "" });
      setSelectKey(prev => prev + 1); // Force re-render select
    } catch (error) {
      console.error("Error saving kegiatan:", error);
      alert("Gagal menyimpan kegiatan: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setPendingDeleteId(id);
    setDialogTitle("Konfirmasi");
    setDialogMessage("Yakin hapus kegiatan ini?");
    setDialogConfirmText("Ya");
    setDialogCancelText("Batal");
    setShowConfirmButton(true);
    setShowCancelButton(true);
    setShowDialog(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId) {
      try {
        await api.delete(`/input-kegiatan/${pendingDeleteId}`);
        setKegiatanList(kegiatanList.filter(item => item.id !== pendingDeleteId));
        if (editId === pendingDeleteId) {
          setFormData({ jam: "", kegiatan: "" });
          setEditId(null);
          setSelectKey(prev => prev + 1);
        }
        setShowDialog(false);
        setPendingDeleteId(null);
      } catch (error) {
        console.error("Error deleting kegiatan:", error);
        setDialogTitle("Error");
        setDialogMessage("Gagal menghapus kegiatan");
        setShowConfirmButton(false);
        setShowCancelButton(false);
      }
    }
  };

  const cancelDelete = () => {
    setShowDialog(false);
    setPendingDeleteId(null);
  };

  const handleEdit = (item) => {
    setFormData({ jam: item.jam, kegiatan: item.kegiatan });
    setEditId(item.id);
    setSelectKey(prev => prev + 1); // Force re-render to show current jam in edit
  };

  const handleSaveReport = async () => {
    if (kegiatanList.length === 0) {
      alert("Tidak ada data untuk disimpan!");
      return;
    }

    try {
      const response = await api.post("/input-kegiatan/save-report", { shift, tanggal, kegiatanList });

      // Show success dialog
      setDialogTitle("Berhasil");
      setDialogMessage("Laporan berhasil disimpan: " + response.data.message);
      setDialogConfirmText("OK");
      setShowConfirmButton(true);
      setShowDialog(true);

      // Reset to default state
      setKegiatanList([]);
      setFormData({ jam: "", kegiatan: "" });
      setEditId(null);
      localStorage.removeItem("shift");
      localStorage.removeItem("tanggal");
      setShift("");
      setTanggal("");
    } catch (error) {
      console.error("Error saving report:", error);

      // Show error dialog
      setDialogTitle("Error");
      setDialogMessage("Gagal menyimpan laporan: " + (error.response?.data?.message || error.message));
      setShowConfirmButton(false);
      setShowDialog(true);
    }
  };

  if (loading && kegiatanList.length === 0) {
    return <div className="max-w-xl mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-100">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">Input Kegiatan</h2>

      {/* Shift and Tanggal Display (read-only from DaftarHadir) */}
      {shift && tanggal ? (
        <div className="mb-4 p-3 bg-blue-100 rounded-lg">
          <label className="block mb-1 font-medium text-sm sm:text-base">Shift Saat Ini</label>
          <p className="text-base sm:text-lg font-semibold text-blue-800">{shift}</p>
          <p className="text-sm text-gray-600">Tanggal: {new Date(tanggal).toLocaleDateString("id-ID")}</p>
          <p className="text-sm text-gray-600">Jam disesuaikan: {shift.toLowerCase() === "pagi" ? "07:00 - 19:00" : "19:00 - 07:00"}</p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-yellow-100 rounded-lg">
          <p className="text-sm sm:text-base text-yellow-800">Silakan pilih shift dan tanggal terlebih dahulu di <a href="/" className="underline">Daftar Hadir</a> untuk memulai input kegiatan.</p>
        </div>
      )}

      {/* Form Input - disabled if no shift or tanggal */}
      {!(shift && tanggal) ? null : (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {/* Jam - dynamic available options */}
          <div>
            <label className="block mb-1 font-medium text-sm sm:text-base">Jam</label>
            <select
              key={selectKey}
              name="jam"
              value={formData.jam}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 text-sm sm:text-base"
              disabled={!shift || loading}
            >
              <option value="">-- Pilih Jam --</option>
              {availableJams.map((jam, index) => (
                <option key={index} value={jam}>
                  {jam}
                </option>
              ))}
            </select>
            {availableJams.length === 0 && (
              <p className="text-sm text-red-600 mt-1">Semua jam sudah terisi! Hapus salah satu untuk menambah baru.</p>
            )}
          </div>

          {/* Deskripsi Kegiatan */}
          <div>
            <label className="block mb-1 font-medium text-sm sm:text-base">Deskripsi Kegiatan</label>
            <input
              type="text"
              name="kegiatan"
              value={formData.kegiatan}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 text-sm sm:text-base"
              placeholder="Masukkan kegiatan..."
              disabled={!shift || loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !(shift && tanggal) || availableJams.length === 0}
            className={`
              w-full sm:w-auto ${editId ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"}
              text-white px-4 py-2 rounded-lg disabled:opacity-50 text-sm sm:text-base
            `}
          >
            {loading ? "Menyimpan..." : (editId ? "Update" : "Simpan")}
          </button>
        </form>
      )}

      {/* List Kegiatan */}
      {kegiatanList.length > 0 && shift && (
        <div className="mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Kegiatan Hari Ini ({shift})</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden min-w-[400px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left text-sm sm:text-base">Jam</th>
                  <th className="border p-2 text-left text-sm sm:text-base">Deskripsi Kegiatan</th>
                  <th className="border p-2 text-center text-sm sm:text-base">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {kegiatanList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border p-2 text-sm sm:text-base">{item.jam}</td>
                    <td className="border p-2 text-sm sm:text-base max-w-xs truncate">{item.kegiatan}</td>
                    <td className="border p-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-500 hover:underline text-sm"
                        disabled={loading}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:underline text-sm"
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSaveReport}
            className="mt-4 w-full sm:w-auto bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50 text-sm sm:text-base"
            disabled={loading || kegiatanList.length === 0 || !tanggal}
          >
            Simpan Laporan
          </button>
        </div>
      )}
      {loading && kegiatanList.length > 0 && <p className="mt-4 text-center text-sm sm:text-base">Updating...</p>}

      <NotificationDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={pendingDeleteId ? confirmDelete : () => setShowDialog(false)}
        onCancel={cancelDelete}
        message={dialogMessage}
        title={dialogTitle}
        confirmText={dialogConfirmText}
        cancelText={dialogCancelText}
        showConfirm={showConfirmButton}
        showCancel={showCancelButton}
      />
    </div>
  );
};

export default InputKegiatan;
