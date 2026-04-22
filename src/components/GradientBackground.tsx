import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

interface Props extends ViewProps {
  children?: React.ReactNode;
  variant?: 'pink' | 'lavender' | 'soft';
}

export const GradientBackground: React.FC<Props> = ({ children, variant = 'pink', style }) => {
  const { theme } = useTheme();
  const gradientColors = theme.gradients[variant] || theme.gradients.pink;

  return (
    <LinearGradient
      colors={gradientColors as [string, string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
