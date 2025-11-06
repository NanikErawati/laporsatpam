const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

export const getLaporan = async (token) => {
  const res = await fetch(`${API_URL}/laporan`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  return res.json();
};
