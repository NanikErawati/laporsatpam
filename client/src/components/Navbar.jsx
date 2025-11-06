import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoBPS from "../assets/logo BPS.png";
import logoSWA from "../assets/OIP.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/daftar-hadir", label: "Daftar Hadir" },
    { path: "/input-kegiatan", label: "Input Kegiatan" },
    { path: "/laporan", label: "Lihat Laporan" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#007B8A] shadow-md">
      {/* Bar utama - Clean: left BPS, center title/subtitle, right SWA + burger (mobile) */}
      <div className="px-4 sm:px-6 flex items-center justify-between h-16 sm:h-20 md:h-24">
        {/* Logo kiri (BPS only) */}
        <div className="flex items-center">
          <img
            src={logoBPS}
            alt="Logo BPS"
            className="h-14 sm:h-12 md:h-14 object-contain"
          />
        </div>

        {/* Judul tengah - responsive text size */}
        <div className="text-center text-white flex-1 px-2">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">SAMANTA-8</h1>
          <p className="text-xs sm:text-sm md:text-base">Satpam Manunggal Terintegrasi 8</p>
        </div>

        {/* Logo kanan (SWA) + burger menu (mobile, next to SWA on right) */}
        <div className="flex items-center space-x-2">
          <img
            src={logoSWA}
            alt="Logo SWA"
            className="h-14 sm:h-12 md:h-14 object-contain"
          />
          {/* Tombol burger (mobile only, on right) */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* Menu (desktop) */}
      <div className="hidden md:flex justify-center space-x-6 md:space-x-8 bg-gray-100 py-2 md:py-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`font-medium px-3 md:px-4 py-2 rounded text-sm md:text-base ${
              location.pathname === item.path
                ? "text-white bg-[#007B8A]"
                : "text-gray-700 hover:text-[#007B8A]"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Menu (mobile) - di bawah navbar, full width */}
      {isOpen && (
        <div className="md:hidden flex flex-col bg-gray-100 p-4 space-y-3 absolute w-full left-0 top-full z-40 shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`font-medium px-4 py-3 rounded text-left text-base ${
                location.pathname === item.path
                  ? "text-white bg-[#007B8A]"
                  : "text-gray-700 hover:text-[#007B8A] hover:bg-gray-200"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
