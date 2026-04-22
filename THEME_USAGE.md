// THEME USAGE EXAMPLE
// Import the useTheme hook in any component

import { StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Example Component
export const ExampleComponent = () => {
  const { theme, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 16,
    },
    text: {
      color: theme.text.primary,
      fontSize: 16,
    },
    card: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
    },
  });

  return (
    // Your component JSX using the theme
  );
};

// Alternative: Use theme in StatusBar for dynamic styling
import { StatusBar } from 'expo-status-bar';

export const App = () => {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {/* Rest of app */}
    </>
  );
};

// The app now automatically respects device settings:
// - Light mode: Uses lightTheme
// - Dark mode: Uses darkTheme
// - Changes dynamically when user switches system theme
