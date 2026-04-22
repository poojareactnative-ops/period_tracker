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
import { useTheme } from '../theme/ThemeContext';
import { spacing, borderRadius, typography } from '../theme/spacing';

interface Props extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
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
  const { theme } = useTheme();
  
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const containerStyle = [
    styles.button,
    isPrimary && { backgroundColor: theme.primary },
    isSecondary && { backgroundColor: theme.secondary },
    isOutline && { 
      backgroundColor: 'transparent', 
      borderWidth: 2, 
      borderColor: theme.primary 
    },
    isGhost && { 
      backgroundColor: 'transparent',
      shadowOpacity: 0,
      elevation: 0,
    },
    disabled && { 
      backgroundColor: theme.border,
      shadowOpacity: 0,
      elevation: 0,
    },
    style,
  ];

  const titleStyle = [
    styles.text,
    isPrimary && { color: theme.text.white },
    isSecondary && { color: theme.text.white },
    isOutline && { color: theme.primary },
    isGhost && { color: theme.primary },
    disabled && { color: theme.text.light },
    textStyle,
  ];

  const getActivityIndicatorColor = () => {
    if (disabled) return theme.text.light;
    if (isOutline || isGhost) return theme.primary;
    return theme.text.white;
  };

  return (
    <TouchableOpacity 
      style={containerStyle} 
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getActivityIndicatorColor()} />
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    ...typography.label,
    fontSize: 16,
    fontWeight: '600',
  },
});