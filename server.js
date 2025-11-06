
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import daftarHadirRoutes from "./routes/daftarHadirRoutes.js";
import inputKegiatanRoutes from "./routes/inputKegiatanRoutes.js";
import laporanRoutes from "./routes/laporanRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/daftar-hadir", daftarHadirRoutes);
app.use("/input-kegiatan", inputKegiatanRoutes);
app.use("/laporan", laporanRoutes);

// Add a temporary endpoint to save test data
app.post("/api/test-attendance", (req, res) => {
  console.log("Received test data", req.body);

  const { tanggal, shift, nama, lokasi, status } = req.body;
  
  // Assume successful writing for testing
  // TODO: Implement correct database insertion
  res.status(200).json({ message: "Test attendance saved: Success", data: { tanggal, shift, nama, lokasi, status } });
});

app.get("/", (req, res) => res.send("API Satpam aktif 🚀"));

app.listen(process.env.PORT || 3000, () => 
  console.log(`Test endpoint running on http://localhost:3000`)
);
