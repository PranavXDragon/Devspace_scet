import axios from "axios";
import { setError, setSuccess } from "@/context/messageSlice";
import { setLogout } from "@/context/authSlice";

let store;
export const injectStore = (_store) => {
  store = _store;
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
axiosInstance.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method)) {
      const successMessage = response.data?.message;
      if (successMessage && successMessage !== "Success" && store) {
        store.dispatch(setSuccess(successMessage));
      }
    }
    return response.data;
  },
  (error) => {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred.";

    if (store) {
      store.dispatch(setError(errorMessage));

      if (error.response?.status === 401) {
        if (
          typeof window !== "undefined" && window.location.pathname.startsWith("/admin") &&
          window.location.pathname !== "/admin/login"
        ) {
          store.dispatch(setLogout());
        }
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosInstance;

