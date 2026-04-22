import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, borderRadius, typography } from '../theme/spacing';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'pink' | 'lavender' | 'soft';
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const CycleCard: React.FC<Props> = ({ 
  title, 
  value, 
  subtitle, 
  variant = 'pink', 
  style,
  icon 
}) => {
  const { theme } = useTheme();

  const getGradientColors = () => {
    switch (variant) {
      case 'pink':
        return theme.gradients.pink;
      case 'lavender':
        return theme.gradients.lavender;
      case 'soft':
        return theme.gradients.soft;
      default:
        return theme.gradients.pink;
    }
  };

  const gradientColors = getGradientColors();

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]] || [theme.primary, theme.secondary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.title, { color: theme.text.white }]}>
          {title}
        </Text>
        <Text style={[styles.value, { color: theme.text.white }]}>
          {value}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.text.white }]}>
            {subtitle}
          </Text>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    padding: spacing.lg,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.label,
    opacity: 0.9,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    ...typography.h1,
    fontSize: 40,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
    fontWeight: '600',
    opacity: 0.9,
  },
});