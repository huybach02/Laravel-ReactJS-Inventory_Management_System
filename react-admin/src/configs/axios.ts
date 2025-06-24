/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { NavigateFunction } from "react-router-dom";
import { URL_CONSTANTS } from "./api-route-config";
import { store } from "../redux/store";
import { setAuthLogout } from "../redux/slices/auth.slice";

let isRefreshing = false;
let failedQueue: any[] = [];
let isRedirecting = false;
let navigateRef: NavigateFunction | null = null;

export const setNavigate = (navigate: NavigateFunction) => {
    navigateRef = navigate;
};

const processQueue = (error: any) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};

// Thêm token vào mọi request
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refresh_token");
        const deviceId = localStorage.getItem("device_id");

        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        if (refreshToken) {
            config.headers["Refresh-Token"] = refreshToken;
        }

        if (deviceId) {
            config.headers["Device-Id"] = deviceId;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => {
        return response.data ? response.data : response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response.status === 401 &&
            error.response.data.error_code === "TOKEN_EXPIRED"
            // && !originalRequest._retry
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return axios(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            // originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Gọi API để làm mới token
                const response = await axios.get("/auth/refresh");

                // Lưu token mới vào localStorage
                if (response && response.data && (response as any).success) {
                    localStorage.setItem("token", response.data.access_token);
                    if (response.data.refresh_token) {
                        localStorage.setItem(
                            "refresh_token",
                            response.data.refresh_token
                        );
                    }
                }

                processQueue(null);
                return axios(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (
            error.response.status === 401 &&
            error.response.data.error_code !== "TOKEN_EXPIRED" &&
            !isRedirecting
        ) {
            isRedirecting = true;
            if (window.location.pathname !== URL_CONSTANTS.LOGIN) {
                store.dispatch(setAuthLogout());
                if (navigateRef) {
                    navigateRef(URL_CONSTANTS.LOGIN);
                } else {
                    window.location.href = URL_CONSTANTS.LOGIN;
                }
                localStorage.removeItem("token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("device_id");
            }
        }
        return Promise.reject(error);
    }
);

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";
// axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

export default axios;
