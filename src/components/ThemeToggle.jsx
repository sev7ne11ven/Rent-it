import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // initialize from localStorage or system preference
    try {
      const stored = localStorage.getItem('theme');
      if (stored) {
        const dark = stored === 'dark';
        setIsDark(dark);
        document.documentElement.classList.toggle('dark', dark);
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(prefersDark);
        document.documentElement.classList.toggle('dark', prefersDark);
      }
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch (e) {}
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={isDark}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="btn btn-outline-dark m-2 theme-toggle"
      style={{ minWidth: '44px' }}
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;
