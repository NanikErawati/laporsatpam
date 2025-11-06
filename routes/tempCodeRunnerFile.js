const express = require("express");
const router = express.Router();
const DaftarHadirController = require("../controllers/DaftarHadirController");

// POST daftar hadir
router.post("/", DaftarHadirController.create);

// GET semua daftar hadir
router.get("/", DaftarHadirController.findAll);

module.exports = router;
