import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, borderRadius, typography } from '../theme/spacing';

interface Props extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const CustomButton: React.FC<Props> = ({ 
  title, 
  loading, 
  variant = 'primary', 
  style, 
  textStyle,
  disabled,
  ...props 
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  const containerStyle = [
    styles.button,
    isPrimary && styles.primaryButton,
    isSecondary && styles.secondaryButton,
    isOutline && styles.outlineButton,
    disabled && styles.disabledButton,
    style,
  ];

  const titleStyle = [
    styles.text,
    isPrimary && styles.primaryText,
    isSecondary && styles.secondaryText,
    isOutline && styles.outlineText,
    textStyle,
  ];

  return (
    <TouchableOpacity 
      style={containerStyle} 
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : colors.text.white} />
      ) : (
        <Text style={titleStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  disabledButton: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    ...typography.label,
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.text.white,
  },
  secondaryText: {
    color: colors.text.secondary,
  },
  outlineText: {
    color: colors.primary,
  },
});
