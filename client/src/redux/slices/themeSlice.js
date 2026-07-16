import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  try {
    const cached = localStorage.getItem('theme');
    if (cached) return cached;
    // Default to dark mode for modern visual style
    return 'dark';
  } catch (error) {
    return 'dark';
  }
};

const initialState = {
  mode: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const nextMode = state.mode === 'light' ? 'dark' : 'light';
      state.mode = nextMode;
      localStorage.setItem('theme', nextMode);
      // Sync document class lists
      if (nextMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    initTheme: (state) => {
      if (state.mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
  },
});

export const { toggleTheme, initTheme } = themeSlice.actions;
export default themeSlice.reducer;
