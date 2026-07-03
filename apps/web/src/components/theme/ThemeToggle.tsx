'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import styles from './ThemeToggle.module.css';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'pairprep-theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  // Load theme on mount
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme;
    const initialTheme: Theme = stored || (document.documentElement.dataset.theme as Theme) || 'light';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
  };

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      {theme === 'light' ? (
        <Moon className={styles.icon} aria-hidden="true" size={18} strokeWidth={1.8} />
      ) : (
        <Sun className={styles.icon} aria-hidden="true" size={18} strokeWidth={1.8} />
      )}
    </button>
  );
}
