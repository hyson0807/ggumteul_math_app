import axios from "axios";
import { tokenService } from "./token";

// TODO: 배포 시 실제 서버 URL로 변경
const API_BASE_URL = "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request: access token 자동 첨부
api.interceptors.request.use((config) => {
  const token = tokenService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: 401 시 refresh 자동 시도
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await tokenService.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        { timeout: 10000 },
      );

      tokenService.setAccessToken(data.accessToken);
      await tokenService.setRefreshToken(data.refreshToken);

      processQueue(null, data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await tokenService.clearAll();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
