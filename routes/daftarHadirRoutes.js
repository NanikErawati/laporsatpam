import express from "express";
import { createDaftarHadir, getAllDaftarHadir } from "../controllers/DaftarHadirController.js";

const router = express.Router();

// POST create daftar hadir
router.post("/create", createDaftarHadir);

// GET all daftar hadir with optional filter
router.get("/", getAllDaftarHadir);


export default router;
