import { create } from "zustand";

interface AppStore {
  user: { id: string; username: string } | null;
  theme: "dark" | "light";
  setUser: (user: AppStore["user"]) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  theme: "dark",
  setUser: (user) => set({ user }),
  toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
}));
