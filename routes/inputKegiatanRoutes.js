// routes/inputKegiatanRoutes.js
import express from "express";
import { getKegiatan, tambahKegiatan, updateKegiatan, deleteKegiatan, saveReport } from "../controllers/inputKegiatanController.js";

const router = express.Router();

// GET semua kegiatan
router.get("/", getKegiatan);

// POST tambah kegiatan
router.post("/", tambahKegiatan);

// PUT update kegiatan
router.put("/:id", updateKegiatan);

// DELETE kegiatan
router.delete("/:id", deleteKegiatan);

// POST save report
router.post("/save-report", saveReport);

export default router;
