import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// Halaman
import Dashboard from "./pages/Dashboard";
import DaftarHadir from "./pages/DaftarHadir";
import InputKegiatan from "./pages/InputKegiatan";
import Laporan from "./pages/Laporan";

function App() {
  return (
    <Router>
      <div>
        {/* Navbar selalu tampil */}
        <Navbar />

        {/* Konten halaman */}
        <div className="pt-20 md:pt-24 px-4 sm:px-6">  {/* Standard padding top for normalized navbar */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/daftar-hadir" element={<DaftarHadir />} />
            <Route path="/input-kegiatan" element={<InputKegiatan />} />
            <Route path="/laporan" element={<Laporan />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
