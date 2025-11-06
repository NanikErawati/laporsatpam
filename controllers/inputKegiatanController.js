import { getAllKegiatan, createKegiatan, updateKegiatan as updateModel, deleteKegiatan as deleteModel, saveReport as saveModelReport } from "../Models/inputKegiatanModel.js";

// GET semua kegiatan
export const getKegiatan = async (req, res) => {
  try {
    const { tanggal, shift } = req.query; // Optional filters by tanggal and shift
    const data = await getAllKegiatan({ tanggal, shift });
    res.json(data);
  } catch (error) {
    console.error("Error fetching kegiatan:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST tambah kegiatan
export const tambahKegiatan = async (req, res) => {
  try {
    const { tanggal, shift, jam, kegiatan } = req.body;

    if (!tanggal || !shift || !jam || !kegiatan) {
      return res.status(400).json({ message: "Semua field wajib diisi!" });
    }

    const newData = await createKegiatan({ tanggal, shift, jam, kegiatan });
    res.status(201).json(newData);
  } catch (error) {
    console.error("Error creating kegiatan:", error);
    res.status(500).json({ message: error.message });
  }
};

// PUT update kegiatan
export const updateKegiatan = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, jam, kegiatan } = req.body;

    if (!jam || !kegiatan) {
      return res.status(400).json({ message: "Jam dan kegiatan wajib diisi!" });
    }

    const updatedData = await updateModel(id, { tanggal, jam, kegiatan });
    if (!updatedData) {
      return res.status(404).json({ message: "Kegiatan tidak ditemukan" });
    }
    res.json(updatedData);
  } catch (error) {
    console.error("Error updating kegiatan:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE kegiatan
export const deleteKegiatan = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteModel(id);
    res.json(result);
  } catch (error) {
    console.error("Error deleting kegiatan:", error);
    res.status(500).json({ message: error.message });
  }
};

// POST save report
export const saveReport = async (req, res) => {
  try {
    const { tanggal, shift, kegiatanList } = req.body;
    const result = await saveModelReport({ tanggal, shift, kegiatanList });
    res.json(result);
  } catch (error) {
    console.error("Error saving report:", error);
    res.status(500).json({ message: error.message });
  }
};
