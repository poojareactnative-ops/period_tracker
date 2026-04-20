import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, borderRadius, typography } from '../theme/spacing';
import { Lightbulb } from 'lucide-react-native';

interface Props {
  day?: number;
}

export const TipCard: React.FC<Props> = ({ day = 1 }) => {
  const getTip = (d: number) => {
    if (d >= 1 && d <= 5) return {
      title: "Flow Phase",
      text: "Iron-rich foods like spinach and lentils can help replenish your energy today."
    };
    if (d >= 6 && d <= 13) return {
      title: "Follicular Phase",
      text: "Your energy levels are rising! It's a great week for high-intensity workouts."
    };
    if (d >= 14 && d <= 17) return {
      title: "Ovulation Phase",
      text: "You might feel more social and confident. Perfect time for a meeting or social outing!"
    };
    return {
      title: "Luteal Phase",
      text: "Magnesium-rich foods like dark chocolate or bananas can help with pre-period relaxation."
    };
  };

  const tip = getTip(day);

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Lightbulb color={colors.primary} size={20} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{tip.title} Tip</Text>
        <Text style={styles.text}>{tip.text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF8F9',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: '#F8BBD033',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  text: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
