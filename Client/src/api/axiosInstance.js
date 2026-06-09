import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
    baseURL: import.meta.env.VITE_STAT == 'PRODUCTION' ? import.meta.env.VITE_PROD_API_URL : import.meta.env.VITE_DEV_API_URL,
    timeout: 10000,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    return config;
});

let isRefreshing = false;
let failedQueue = [];


const processQueue = (error) => {
    failedQueue.forEach(({ resolve, reject }) =>
        error ? reject(error) : resolve()
    );
    failedQueue = [];
};

const clearAuthAndRedirect = () => {
    setTimeout(() => {
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        window.location.href = "/";
    }, 3000);
};

api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const original = error.config;
        const data = error.response?.data;
        const statusCode = data?.statusCode ?? error.response?.status ?? 500;

        if (statusCode === 401 && !original._retry && !original.url?.includes("/users/refresh") && !original.url?.includes("/auth/login")) {
            original._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(original)).catch((err) => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                const refreshRes = await api.post("/api/v1/users/refresh");
                console.log("refreshRes",refreshRes)

                if (!refreshRes.success) {
                    throw new Error("Refresh failed");
                }

                processQueue(null);
                return api(original);
            } catch (refreshError) {
                console.log("refresh failed, clearing auth...");
                processQueue(refreshError);
                clearAuthAndRedirect();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject({
            success:    false,
            statusCode: data?.statusCode  ?? error.response?.status ?? 500,
            message:    data?.message     ?? "Something went wrong.",
            errors:     data?.errors      ?? null,
            timestamp:  data?.timestamp   ?? new Date().toISOString(),
        });
    }
);

export default api;