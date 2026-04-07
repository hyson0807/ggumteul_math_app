import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
}

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  message: "",
  type: "info",
  visible: false,
  show: (message, type = "info") => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ message, type, visible: true });
    hideTimer = setTimeout(() => {
      set({ visible: false });
      hideTimer = null;
    }, 1800);
  },
  hide: () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    set({ visible: false });
  },
}));
