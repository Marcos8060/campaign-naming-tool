import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const getPersistedDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

interface UIState {
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  darkMode: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  mobileNavOpen: false,
  darkMode: false, // initialised client-side in ThemeProvider
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => { state.sidebarOpen = action.payload; },
    setMobileNavOpen: (state, action: PayloadAction<boolean>) => { state.mobileNavOpen = action.payload; },
    toggleDarkMode: (state) => { state.darkMode = !state.darkMode; },
    setDarkMode: (state, action: PayloadAction<boolean>) => { state.darkMode = action.payload; },
  },
});

export const { toggleSidebar, setSidebarOpen, setMobileNavOpen, toggleDarkMode, setDarkMode } = uiSlice.actions;
export { getPersistedDarkMode };
export default uiSlice.reducer;
