import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, borderRadius, typography } from '../theme/spacing';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'pink' | 'lavender';
  style?: ViewStyle;
}

export const CycleCard: React.FC<Props> = ({ title, value, subtitle, variant = 'pink', style }) => {
  const isPink = variant === 'pink';

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={isPink ? colors.gradients.pink : colors.gradients.lavender}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
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
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  gradient: {
    padding: spacing.lg,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.label,
    color: colors.text.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.h1,
    fontSize: 40,
    color: colors.text.white,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.white,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
});
