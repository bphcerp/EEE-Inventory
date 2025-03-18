import axios, { AxiosError } from "axios";
import { toast } from "sonner";

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL! + '/api',
  withCredentials: true, // Ensures credentials (cookies, etc.) are sent
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response, // If response is OK, return it
  (error: AxiosError) => {
    if (error.response?.status === 440) {
      toast.warning("Session Expired. Redirecting...");
      window.location.href = "/login";
      return new Promise(() => {}); // Prevent further execution
    }

    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      toast.error("Not authorized. Redirecting...");
      window.location.href = "/login";
      return new Promise(() => {}); // Prevent further execution
    }

    return Promise.reject(error); // Continue rejecting other errors
  }
);

export default api;