// services/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // change from 15000 to 60000
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.multiRemove(["token", "user", "userType"]);
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  registerUser: (data) => api.post("/auth/user/register", data),
  loginUser: (data) => api.post("/auth/user/login", data),
  registerPandit: (data) => api.post("/auth/pandit/register", data),
  loginPandit: (data) => api.post("/auth/pandit/login", data),
  getMe: () => api.get("/auth/me"),
  updateMe: (data) => api.patch("/auth/me", data),
  savePushToken: (pushToken) => api.patch("/auth/push-token", { pushToken }),
};

// ── Pandit Onboarding ─────────────────────────────────────
export const onboardingAPI = {
  saveCredentials: (data) => api.post("/onboarding/credentials", data),
  saveServices: (data) => api.post("/onboarding/services", data),
  saveAvailability: (data) => api.post("/onboarding/availability", data),
  uploadDocument: (formData) =>
    api.post("/onboarding/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000,
    }),
  complete: () => api.post("/onboarding/complete"),
};

// ── Catalog ───────────────────────────────────────────────
export const catalogAPI = {
  getPoojas: (params) => api.get("/catalog/poojas", { params }),
  getPoojaById: (id) => api.get(`/catalog/poojas/${id}`),
  getSamagriKit: (poojaTypeId) =>
    api.get(`/catalog/samagri/kit/${poojaTypeId}`),
  getSamagri: (params) => api.get("/catalog/samagri", { params }),
};

// ── Pandits ───────────────────────────────────────────────
export const panditAPI = {
  search: (params) => api.get("/pandits", { params }),
  nearby: (params) => api.get("/pandits/nearby", { params }),
  getById: (id) => api.get(`/pandits/${id}`),
  getSlots: (id, params) => api.get(`/pandits/${id}/slots`, { params }),
};

// ── Bookings ──────────────────────────────────────────────
export const bookingAPI = {
  create: (data) => api.post("/bookings", data),
  getMyBookings: (params) => api.get("/bookings", { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id, data) => api.patch(`/bookings/${id}/cancel`, data),
  submitReview: (id, data) => api.post(`/bookings/${id}/review`, data),
  // Pandit
  getIncoming: () => api.get("/bookings/pandit/incoming"),
  getPanditAll: (params) => api.get("/bookings/pandit/all", { params }),
  accept: (id) => api.patch(`/bookings/${id}/accept`),
  decline: (id, data) => api.patch(`/bookings/${id}/decline`, data),
  start: (id) => api.patch(`/bookings/${id}/start`),
  complete: (id) => api.patch(`/bookings/${id}/complete`),
};

// ── Payments ──────────────────────────────────────────────
export const paymentAPI = {
  createOrder: (data) => api.post("/payments/order", data),
  verify: (data) => api.post("/payments/verify", data),
};

// ── Pandit Dashboard ──────────────────────────────────────
export const panditDashAPI = {
  getDashboard: () => api.get("/pandit/dashboard"),
  getEarnings: (params) => api.get("/pandit/earnings", { params }),
  updateAvailability: (data) => api.patch("/pandit/availability", data),
  blockDate: (data) => api.patch("/pandit/availability/block", data),
  toggleAvailability: (data) => api.patch("/pandit/toggle-availability", data),
  saveBankDetails: (data) => api.patch("/pandit/bank-details", data),
};

export default api;
