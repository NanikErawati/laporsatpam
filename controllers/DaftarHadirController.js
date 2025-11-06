import { create, findAll } from "../Models/DaftarHadirModel.js";

export const createDaftarHadir = async (req, res) => {
  try {
    const { tanggal, shift, nama, status } = req.body;
    console.log("Data yang diterima dari klien:", { tanggal, shift, nama, status });

    if (!tanggal) {
      return res.status(400).json({ message: "Tanggal wajib diisi!" });
    }
    if (!shift) {
      return res.status(400).json({ message: "Shift wajib diisi!" });
    }
    if (!nama) {
      return res.status(400).json({ message: "Nama wajib diisi!" });
    }
    if (!status) {
      return res.status(400).json({ message: "Status wajib diisi!" });
    }

    // Check if the user has already filled out the attendance list for the same date and shift
    const existingData = await findAll({ tanggal, shift, nama });
    console.log("Data yang ditemukan di database:", existingData);
    const sudahAbsen = existingData.length > 0;

    if (sudahAbsen) {
      return res.status(400).json({ message: "Anda sudah mengisi daftar hadir untuk shift ini!" });
    }

    const newData = await create({ tanggal, shift, nama, status });
    console.log("Data berhasil disimpan ke database:", newData);
    res.status(201).json(newData);
  } catch (error) {
    console.error("Kesalahan saat menyimpan data:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllDaftarHadir = async (req, res) => {
  try {
    const { tanggal, shift } = req.query;
    const data = await findAll({ tanggal, shift });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

