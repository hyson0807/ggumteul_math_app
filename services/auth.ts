import axios from "axios";
import api, { API_BASE_URL } from "./api";
import { tokenService } from "./token";

export interface User {
  id: string;
  email: string;
  name: string | null;
  grade: number | null;
  level: number;
  coins: number;
  stars: number;
  tutorType: "cat" | "rabbit" | null;
  wormStage: number;
  wormProgress: number;
  equippedHatId: string | null;
  equippedBodyId: string | null;
  equippedAccessoryId: string | null;
  createdAt: string;
  diagnosticCompletedAt: string | null;
  diagnosticScore: number | null;
  diagnosticGrade: number | null;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

const saveTokens = async (data: AuthResponse) => {
  tokenService.setAccessToken(data.accessToken);
  await tokenService.setRefreshToken(data.refreshToken);
};

export const authApi = {
  register: async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      email,
      password,
    });
    await saveTokens(data);
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    await saveTokens(data);
    return data;
  },

  googleSignIn: async (idToken: string) => {
    const { data } = await api.post<AuthResponse>("/auth/google", { idToken });
    await saveTokens(data);
    return data;
  },

  appleSignIn: async (params: {
    identityToken: string;
    fullName?: string;
    email?: string;
  }) => {
    const { data } = await api.post<AuthResponse>("/auth/apple", params);
    await saveTokens(data);
    return data;
  },

  refresh: async (refreshToken: string) => {
    // 인터셉터를 우회하여 이중 refresh 방지
    const { data } = await axios.post<AuthResponse>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { timeout: 10_000 },
    );
    await saveTokens(data);
    return data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      await tokenService.clearAll();
    }
  },

  getMe: async () => {
    const { data } = await api.get<User>("/users/me");
    return data;
  },

  updateProfile: async (body: {
    name?: string;
    tutorType?: string;
    grade?: number;
  }) => {
    const { data } = await api.patch<User>("/users/me", body);
    return data;
  },

  deleteAccount: async () => {
    await api.delete("/users/me");
    await tokenService.clearAll();
  },
};
