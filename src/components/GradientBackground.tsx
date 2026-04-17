import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

interface Props extends ViewProps {
  children: React.ReactNode;
  variant?: 'pink' | 'lavender' | 'soft';
}

export const GradientBackground: React.FC<Props> = ({ children, variant = 'pink', style }) => {
  const gradientColors = colors.gradients[variant] || colors.gradients.pink;

  return (
    <LinearGradient
      colors={gradientColors}
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
