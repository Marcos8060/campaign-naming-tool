import uiReducer, {
  toggleSidebar,
  setSidebarOpen,
  setMobileNavOpen,
  toggleDarkMode,
  setDarkMode,
} from '@/lib/store/slices/uiSlice';

const initialState = { sidebarOpen: true, mobileNavOpen: false, darkMode: false };

describe('uiSlice', () => {
  describe('toggleSidebar', () => {
    it('flips sidebarOpen from true to false', () => {
      const state = uiReducer(initialState, toggleSidebar());
      expect(state.sidebarOpen).toBe(false);
    });

    it('flips sidebarOpen from false to true', () => {
      const state = uiReducer({ ...initialState, sidebarOpen: false }, toggleSidebar());
      expect(state.sidebarOpen).toBe(true);
    });
  });

  describe('setSidebarOpen', () => {
    it('sets sidebarOpen to explicit value', () => {
      expect(uiReducer(initialState, setSidebarOpen(false)).sidebarOpen).toBe(false);
      expect(uiReducer(initialState, setSidebarOpen(true)).sidebarOpen).toBe(true);
    });
  });

  describe('setMobileNavOpen', () => {
    it('opens and closes mobile nav', () => {
      const open = uiReducer(initialState, setMobileNavOpen(true));
      expect(open.mobileNavOpen).toBe(true);

      const closed = uiReducer(open, setMobileNavOpen(false));
      expect(closed.mobileNavOpen).toBe(false);
    });
  });

  describe('toggleDarkMode', () => {
    it('flips darkMode', () => {
      const dark = uiReducer(initialState, toggleDarkMode());
      expect(dark.darkMode).toBe(true);

      const light = uiReducer(dark, toggleDarkMode());
      expect(light.darkMode).toBe(false);
    });
  });

  describe('setDarkMode', () => {
    it('sets darkMode to explicit value', () => {
      expect(uiReducer(initialState, setDarkMode(true)).darkMode).toBe(true);
      expect(uiReducer(initialState, setDarkMode(false)).darkMode).toBe(false);
    });
  });

  it('does not mutate unrelated state fields', () => {
    const state = uiReducer(initialState, toggleDarkMode());
    expect(state.sidebarOpen).toBe(initialState.sidebarOpen);
    expect(state.mobileNavOpen).toBe(initialState.mobileNavOpen);
  });
});
