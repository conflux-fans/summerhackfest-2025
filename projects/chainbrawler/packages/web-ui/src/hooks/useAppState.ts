import { useEffect, useState } from "react";

interface AppState {
  isLoading: boolean;
  hasSeenWelcome: boolean;
  theme: "light" | "dark" | "auto";
  language: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

const defaultState: AppState = {
  isLoading: true,
  hasSeenWelcome: false,
  theme: "dark",
  language: "en",
  soundEnabled: true,
  musicEnabled: true,
};

export function useAppState() {
  const [state, setState] = useState<AppState>(defaultState);

  // Load state from localStorage on mount
  useEffect(() => {
    // Add a small delay to ensure page is ready
    const timer = setTimeout(() => {
      try {
        const savedState = localStorage.getItem("chainbrawler-app-state");
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            setState((prev) => ({ ...prev, ...parsed, isLoading: false }));
          } catch (error) {
            console.error("Failed to parse saved app state:", error);
            // Clear corrupted data
            localStorage.removeItem("chainbrawler-app-state");
            setState((prev) => ({ ...prev, isLoading: false }));
          }
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("localStorage access error:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }, 100); // Small delay to ensure stability

    return () => clearTimeout(timer);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      try {
        const stateToSave = {
          hasSeenWelcome: state.hasSeenWelcome,
          theme: state.theme,
          language: state.language,
          soundEnabled: state.soundEnabled,
          musicEnabled: state.musicEnabled,
        };
        localStorage.setItem("chainbrawler-app-state", JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Failed to save app state to localStorage:", error);
      }
    }
  }, [state]);

  const setHasSeenWelcome = (value: boolean) => {
    setState((prev) => ({ ...prev, hasSeenWelcome: value }));
  };

  const setTheme = (theme: "light" | "dark" | "auto") => {
    setState((prev) => ({ ...prev, theme }));
  };

  const setLanguage = (language: string) => {
    setState((prev) => ({ ...prev, language }));
  };

  const setSoundEnabled = (enabled: boolean) => {
    setState((prev) => ({ ...prev, soundEnabled: enabled }));
  };

  const setMusicEnabled = (enabled: boolean) => {
    setState((prev) => ({ ...prev, musicEnabled: enabled }));
  };

  const resetApp = () => {
    localStorage.removeItem("chainbrawler-app-state");
    setState(defaultState);
  };

  return {
    ...state,
    setHasSeenWelcome,
    setTheme,
    setLanguage,
    setSoundEnabled,
    setMusicEnabled,
    resetApp,
  };
}
