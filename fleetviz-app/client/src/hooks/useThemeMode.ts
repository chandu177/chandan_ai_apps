import { useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

function resolveThemeMode(): ThemeMode {
  const root = document.documentElement;
  if (root.classList.contains('dark')) return 'dark';
  if (root.classList.contains('light')) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useThemeMode(): ThemeMode {
  const [mode, setMode] = useState<ThemeMode>(() =>
    typeof document !== 'undefined' ? resolveThemeMode() : 'light',
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onMedia = () => setMode(resolveThemeMode());
    media.addEventListener('change', onMedia);

    const observer = new MutationObserver(() => setMode(resolveThemeMode()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      media.removeEventListener('change', onMedia);
      observer.disconnect();
    };
  }, []);

  return mode;
}
