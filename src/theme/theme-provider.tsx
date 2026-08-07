import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'smart-theme';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readAppliedTheme);

  const applyTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.style.colorScheme = next;
    setThemeState(next);
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      applyTheme(next);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* Preference is not persisted, but the session still switches. */
      }
    },
    [applyTheme],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Follow the OS only while the user has made no explicit choice.
  useEffect(() => {
    if (hasStoredPreference()) return undefined;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      applyTheme(event.matches ? 'dark' : 'light');
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [applyTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside a <ThemeProvider>.');
  }
  return context;
}

/**
 * Reads what the pre-paint script in index.html already applied, rather than
 * recomputing it — that guarantees React's first render agrees with the DOM.
 */
function readAppliedTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function hasStoredPreference(): boolean {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark';
  } catch {
    return false;
  }
}
