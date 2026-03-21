import api from "./api";
import { tokenService } from "./token";

export interface User {
  id: string;
  email: string;
  name: string | null;
  grade: number;
  level: number;
  coins: number;
  stars: number;
  tutorType: "cat" | "rabbit" | null;
  createdAt: string;
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
  register: async (email: string, password: string, grade: number) => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      email,
      password,
      grade,
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

  refresh: async (refreshToken: string) => {
    const { data } = await api.post<AuthResponse>("/auth/refresh", {
      refreshToken,
    });
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

  updateProfile: async (body: { name?: string; tutorType?: string }) => {
    const { data } = await api.patch<User>("/users/me", body);
    return data;
  },

  deleteAccount: async () => {
    await api.delete("/users/me");
    await tokenService.clearAll();
  },
};
