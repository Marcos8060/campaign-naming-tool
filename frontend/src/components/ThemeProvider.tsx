'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { setDarkMode, getPersistedDarkMode } from '@/lib/store/slices/uiSlice';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    const persisted = getPersistedDarkMode();
    dispatch(setDarkMode(persisted));
  }, [dispatch]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  return <>{children}</>;
}
