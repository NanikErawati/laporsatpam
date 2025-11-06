const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Satpam = require("../Models/satpamModel");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await Satpam.findByUsername(username);
    if (!user) return res.status(401).json({ message: "User tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Password salah" });

    const token = jwt.sign(
      { id_satpam: user.id_satpam, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, user: { id: user.id_satpam, nama: user.nama_satpam, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
