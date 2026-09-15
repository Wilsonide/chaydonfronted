import { create } from "zustand";
import { User } from "@/app/types/auth";
import AuthService from "@/app/services/auth.service";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  hydrated: boolean;
  isLoading: boolean;
  setHydrated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<void>;
  loadUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  hydrated: true,
  isLoading: true,

  setHydrated: (value) => set({ hydrated: value }),
  setLoading: (value) => set({ isLoading: value }),
  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),

  login: async (username, password) => {
    set({ isLoading: true });

    try {
      const response = await AuthService.login({ username, password });

      set({
        accessToken: response.data.access_token,
      });

      await get().loadUser();
    } finally {
      set({ isLoading: false });
    }
  },

  loadUser: async () => {
    try {
      const response = await AuthService.me();

      set({
        user: response.data,
      });
    } catch {
      set({
        accessToken: null,
        user: null,
      });
      throw new Error("Unable to load user");
    }
  },

  logout: async () => {
    try {
      await AuthService.logout();
    } finally {
      set({
        accessToken: null,
        user: null,
      });
    }
  },
}));
