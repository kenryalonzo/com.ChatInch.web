import { create } from "zustand";
import { THEMES } from "../constants"; 

type Theme = typeof THEMES[number]; 

interface ThemeStoreState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const isValidTheme = (theme: string): theme is Theme => {
  return THEMES.includes(theme as Theme);
};

const getDefaultTheme = (): Theme => {
  const savedTheme = localStorage.getItem("chat-theme");
  return savedTheme && isValidTheme(savedTheme) ? savedTheme : "coffee";
};

export const useThemeStore = create<ThemeStoreState>((set) => ({
  theme: getDefaultTheme(),
  setTheme: (theme: Theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));