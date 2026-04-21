import React, { createContext, useContext } from 'react';
import { useTheme } from './useTheme';

const ThemeContext = createContext<any>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();

  console.log("THEME:", theme);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useGlobalTheme = () => useContext(ThemeContext);