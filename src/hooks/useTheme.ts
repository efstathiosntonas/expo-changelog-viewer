import { useEffect } from 'react';

import { useLocalStorage } from './useLocalStorage';

export type Theme = 'light' | 'dark' | 'auto';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('expo-theme', 'auto');

  useEffect(() => {
    const root = document.documentElement;

    /* Remove dark class first */
    root.classList.remove('dark');

    if (theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      }
    } else if (theme === 'dark') {
      root.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'auto') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('auto');
    }
  };

  return { theme, setTheme, toggleTheme };
}
