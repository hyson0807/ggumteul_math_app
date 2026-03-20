import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  tutorType: "cat" | "rabbit" | null;
  tutorName: string;
  userEmail: string;
  userGrade: number;

  login: (email: string, password: string) => void;
  register: (email: string, password: string, grade: number) => void;
  logout: () => void;
  selectTutor: (type: "cat" | "rabbit") => void;
  setTutorName: (name: string) => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isOnboarded: false,
  tutorType: null,
  tutorName: "",
  userEmail: "",
  userGrade: 1,

  login: (_email: string, _password: string) => {
    set({ isAuthenticated: true, userEmail: _email });
  },

  register: (email: string, _password: string, grade: number) => {
    set({ isAuthenticated: true, userEmail: email, userGrade: grade });
  },

  logout: () => {
    set({
      isAuthenticated: false,
      isOnboarded: false,
      tutorType: null,
      tutorName: "",
      userEmail: "",
    });
  },

  selectTutor: (type) => {
    set({ tutorType: type });
  },

  setTutorName: (name) => {
    set({ tutorName: name });
  },

  completeOnboarding: () => {
    set({ isOnboarded: true });
  },
}));
