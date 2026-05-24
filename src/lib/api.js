const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("aa_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(BASE + path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// Auth
export const login = (email, password) =>
  request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const getMe = () => request("/api/auth/me");

export const changePassword = (currentPassword, newPassword) =>
  request("/api/auth/change-password", { method: "PATCH", body: JSON.stringify({ currentPassword, newPassword }) });

export const getUsers = () => request("/api/auth/users");

export const createUser = (data) =>
  request("/api/auth/register", { method: "POST", body: JSON.stringify(data) });

export const deleteUser = (id) =>
  request("/api/auth/users/" + id, { method: "DELETE" });

// Bookings
export const getBookings = () => request("/api/admin/bookings");

export const getBooking = (id) => request("/api/admin/bookings/" + id);

export const createBooking = (data) =>
  request("/api/admin/bookings", { method: "POST", body: JSON.stringify(data) });

export const updateBooking = (id, data) =>
  request("/api/admin/bookings/" + id, { method: "PUT", body: JSON.stringify(data) });

export const deleteBooking = (id) =>
  request("/api/admin/bookings/" + id, { method: "DELETE" });
