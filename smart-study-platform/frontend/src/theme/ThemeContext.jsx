import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('smart_study_theme');
    return saved ? saved : 'light';
  });

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('smart_study_theme', next);
      return next;
    });
  };

  const theme = useMemo(() => {
    const isDark = mode === 'dark';
    return createTheme({
      palette: {
        mode,
        primary: {
          main: '#6366f1', // Indigo moderne
          light: '#818cf8',
          dark: '#4f46e5',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#ec4899', // Rose fuchsia
          light: '#f472b6',
          dark: '#db2777',
        },
        background: {
          default: isDark ? '#0b0f19' : '#f8fafc',
          paper: isDark ? '#111827' : '#ffffff',
        },
        text: {
          primary: isDark ? '#f3f4f6' : '#1e293b',
          secondary: isDark ? '#9ca3af' : '#64748b',
        },
        divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      },
      typography: {
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 500 },
        button: { textTransform: 'none', fontWeight: 600 },
      },
      shape: {
        borderRadius: 14,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              padding: '8px 18px',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              backgroundImage: 'none',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
              boxShadow: isDark
                ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                : '0 4px 20px rgba(100, 116, 139, 0.06)',
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, isDark: mode === 'dark' }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
