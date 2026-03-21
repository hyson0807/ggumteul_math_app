import { create } from "zustand";
import { authApi, User } from "@/services/auth";
import { tokenService } from "@/services/token";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, grade: number) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (data: { name?: string; tutorType?: string }) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  error: null,
  user: null,

  initialize: async () => {
    try {
      const refreshToken = await tokenService.getRefreshToken();
      if (!refreshToken) {
        set({ isLoading: false });
        return;
      }

      const { user } = await authApi.refresh(refreshToken);
      set({ isAuthenticated: true, user, isLoading: false });
    } catch {
      await tokenService.clearAll();
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.login(email, password);
      set({ isAuthenticated: true, user, isLoading: false });
    } catch (e: any) {
      const message =
        e.response?.data?.message || "로그인에 실패했습니다.";
      set({ isLoading: false, error: message });
      throw e;
    }
  },

  register: async (email, password, grade) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.register(email, password, grade);
      set({ isAuthenticated: true, user, isLoading: false });
    } catch (e: any) {
      const message =
        e.response?.data?.message || "회원가입에 실패했습니다.";
      set({ isLoading: false, error: message });
      throw e;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ isAuthenticated: false, user: null, error: null });
    }
  },

  deleteAccount: async () => {
    await authApi.deleteAccount();
    set({ isAuthenticated: false, user: null, error: null });
  },

  updateProfile: async (data) => {
    const user = await authApi.updateProfile(data);
    set({ user });
  },

  clearError: () => set({ error: null }),
}));
