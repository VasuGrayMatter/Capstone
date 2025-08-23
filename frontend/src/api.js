import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export function attachToken(getToken, logout) {
  api.interceptors.request.use((config) => {
    const token = getToken?.();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || err?.message || "Error";
      if (status === 401 || status === 403) {
        toast.error(`${status}: ${msg}`);
        logout?.();
      } else {
        // Surface server-side validation details if available
        const detail = err?.response?.data?.errors?.[0]?.msg;
        toast.error(detail ? `${msg}: ${detail}` : msg);
      }
      return Promise.reject(err);
    }
  );
}

// --- Auth ---
export const loginApi = (email, password) =>
  api.post("/auth/login", { email, password });

// Admin only
export const registerApi = (payload) => api.post("/auth/register", payload);

// --- Flights ---
export const listFlights = () => api.get("/flights");
export const createFlight = (payload) => api.post("/flights", payload);
export const updateFlight = (id, payload) => api.patch(`/flights/${id}`, payload);
export const deleteFlight = (id) => api.delete(`/flights/${id}`);

// --- Baggage ---
export const listBaggage = () => api.get("/baggage");
export const getBaggageById = (id) => api.get(`/baggage/id/${id}`);
export const getBaggageByTag = (tagId) => api.get(`/baggage/tag/${tagId}`);
export const createBaggage = (payload) => api.post("/baggage", payload);
export const updateBaggage = (idOrTag, payload) => api.patch(`/baggage/${idOrTag}`, payload);
export const deleteBaggage = (id) => api.delete(`/baggage/${id}`);

// --- Dashboard ---
export const getOverview = () => api.get("/dashboard/overview");
export const getActiveFlights = () => api.get("/dashboard/active-flights");
export const getNotifications = (limit=10) => api.get(`/dashboard/notifications?limit=${limit}`);
export const getFlightStats = () => api.get("/dashboard/flight-stats");
export const getBaggageOverview = () => api.get("/dashboard/baggage-overview");
export const getSystemHealth = () => api.get("/dashboard/system-health");

// --- Ops ---
export const delayFlight = (id, payload) => api.post(`/ops/flights/${id}/delay`, payload);
export const getAnalytics = () => api.get("/ops/analytics");

// --- User (passenger) ---
export const getProfile = () => api.get("/user/me");
export const getUserFlights = () => api.get("/user/flights");
export const getUserFlightBaggage = (flightId) => api.get(`/user/flights/${flightId}/baggage`);