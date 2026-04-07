import { create } from "zustand";
import { authApi, User } from "@/services/auth";
import { tokenService } from "@/services/token";
import { getApiErrorMessage } from "@/services/api";

interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  googleSignIn: (idToken: string) => Promise<void>;
  appleSignIn: (params: {
    identityToken: string;
    fullName?: string;
    email?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    tutorType?: string;
    grade?: number;
  }) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,
  user: null,

  initialize: async () => {
    try {
      const refreshToken = await tokenService.getRefreshToken();
      if (!refreshToken) {
        set({ isInitialized: true });
        return;
      }

      const { user } = await authApi.refresh(refreshToken);
      set({ isAuthenticated: true, user, isInitialized: true });
    } catch {
      await tokenService.clearAll();
      set({ isAuthenticated: false, user: null, isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.login(email, password);
      set({ isAuthenticated: true, user, isLoading: false });
    } catch (e: unknown) {
      set({ isLoading: false, error: getApiErrorMessage(e, "로그인에 실패했습니다.") });
      throw e;
    }
  },

  googleSignIn: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.googleSignIn(idToken);
      set({ isAuthenticated: true, user, isLoading: false });
    } catch (e: unknown) {
      set({
        isLoading: false,
        error: getApiErrorMessage(e, "Google 로그인에 실패했습니다."),
      });
      throw e;
    }
  },

  appleSignIn: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.appleSignIn(params);
      set({ isAuthenticated: true, user, isLoading: false });
    } catch (e: unknown) {
      set({
        isLoading: false,
        error: getApiErrorMessage(e, "Apple 로그인에 실패했습니다."),
      });
      throw e;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.register(email, password);
      set({ isAuthenticated: true, user, isLoading: false });
    } catch (e: unknown) {
      set({ isLoading: false, error: getApiErrorMessage(e, "회원가입에 실패했습니다.") });
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
    try {
      await authApi.deleteAccount();
      set({ isAuthenticated: false, user: null, error: null });
    } catch (e: unknown) {
      set({ error: getApiErrorMessage(e, "계정 삭제에 실패했습니다.") });
      throw e;
    }
  },

  updateProfile: async (data) => {
    const user = await authApi.updateProfile(data);
    set({ user });
  },

  clearError: () => set({ error: null }),
}));
