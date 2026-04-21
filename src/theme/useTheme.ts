// theme/useTheme.ts

import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from './colors';

export const useTheme = () => {
  const scheme = useColorScheme();

  const isDark = scheme === 'dark';

  console.log("is dark : ", isDark)
  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
  };
};