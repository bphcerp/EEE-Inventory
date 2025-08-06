import axios, { AxiosError } from "axios";
import { toast } from "sonner";

// Code integrated to EEE-IMS ERP, this repo is no longer maintained, this is to ensure the user knows about the migration
// and to redirect them to the EEE-IMS portal for any modifications.
type MigrateErrorResponse = {
  message?: string;
  isMigratingToIMS?: boolean;
};

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL! + '/api',
  withCredentials: true, // Ensures credentials (cookies, etc.) are sent
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response, // If response is OK, return it
  async (error: AxiosError) => {
    if (error.status === 440) {
      toast.warning("Session Expired. Redirecting...");
      window.location.href = "/login";
      return new Promise(() => {}); // Prevent further execution
    }

    if (error.status === 401 && window.location.pathname !== '/login') {
      toast.error("Not authorized. Redirecting...");
      window.location.href = "/login";
      return new Promise(() => {}); // Prevent further execution
    }

    if (error.response?.status === 410) {
      toast.error((error.response?.data as MigrateErrorResponse).message ?? (JSON.parse(await (error.response?.data as Blob).text()) as MigrateErrorResponse).message);
      return new Promise(() => {});
    }

    return Promise.reject(error); // Continue rejecting other errors
  }
);

export default api;