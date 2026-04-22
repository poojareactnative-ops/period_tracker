import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, borderRadius, typography } from '../theme/spacing';
import { ShieldCheck, AlertCircle, Info, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  data: {
    title: string;
    guidance: string;
    action: string;
    isHealthy?: boolean;
  } | null;
  onPress?: () => void;
}

export const HealthInsightCard: React.FC<Props> = ({ data, onPress }) => {
  const { theme } = useTheme();
  
  if (!data) return null;

  const isHealthy = data.title === "Healthy Rhythm";

  const styles = StyleSheet.create({
    container: {
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    iconBox: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    title: {
      ...typography.label,
      fontWeight: '700',
      fontSize: 16,
    },
    guidance: {
      ...typography.body,
      color: theme.text.primary,
      lineHeight: 22,
      marginBottom: spacing.md,
    },
    actionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.5)',
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.md,
    },
    actionText: {
      ...typography.caption,
      fontWeight: '600',
      marginLeft: 6,
      color: theme.text.secondary,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.05)',
      paddingTop: spacing.sm,
    },
    learnMore: {
      ...typography.caption,
      color: theme.text.light,
      fontWeight: '600',
    },
  });

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <LinearGradient
        colors={isHealthy ? ['#E8F5E9', '#C8E6C9'] : ['#FFF3E0', '#FFE0B2']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: isHealthy ? '#4CAF50' : '#FF9800' }]}>
            {isHealthy ? <ShieldCheck color="white" size={20} /> : <AlertCircle color="white" size={20} />}
          </View>
          <Text style={[styles.title, { color: isHealthy ? '#2E7D32' : '#E65100' }]}>{data.title}</Text>
        </View>

        <Text style={styles.guidance}>{data.guidance}</Text>
        
        <View style={styles.actionContainer}>
          <Info size={14} color={isHealthy ? '#4CAF50' : '#FF9800'} />
          <Text style={styles.actionText}>{data.action}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.learnMore}>Learn more about your patterns</Text>
          <ChevronRight size={16} color={theme.text.light} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};
