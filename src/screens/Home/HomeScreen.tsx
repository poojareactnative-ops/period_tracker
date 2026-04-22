import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { GradientBackground } from '../../components/GradientBackground';
import { CycleCard } from '../../components/CycleCard';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, typography } from '../../theme/spacing';
import { useCycleStore } from '../../store/useCycleStore';
import { useUserStore } from '../../store/useUserStore';
import { calculatePredictions, getStatusMessage, calculateLateEarly, analyzeCyclePatterns, getHealthGuidance } from '../../utils/cycleLogic';
import { Bell, Settings, Plus, Smile, Frown, Meh, AlertCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { HealthInsightCard } from '../../components/HealthInsightCard';
import { TipCard } from '../../components/TipCard';

export const HomeScreen: React.FC = () => {
  const { cycles } = useCycleStore();
  const { user } = useUserStore();
  const navigation = useNavigation<any>();

  const predictions = calculatePredictions(cycles);
  const lateEarly = calculateLateEarly(predictions, cycles);
  const statusMessage = getStatusMessage(predictions, lateEarly);

  const patterns = analyzeCyclePatterns(cycles);
  const healthGuidance = getHealthGuidance(patterns);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.displayName || 'Beautiful'}</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('NotificationSettings')}>
              <Bell color={colors.text.primary} size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Profile')}>
              <Settings color={colors.text.primary} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Insight Alert */}
        <HealthInsightCard
          data={healthGuidance}
          onPress={() => navigation.navigate('Insights')}
        />

        {/* Main Status Card */}
        <GradientBackground variant="pink" style={styles.mainCard}>
          <Text style={styles.mainCardTitle}>{statusMessage}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.mainCycleDay}>
              {lateEarly?.type === 'late'
                ? `+${lateEarly.days}`
                : lateEarly?.type === 'early'
                  ? `-${lateEarly.days}`
                  : lateEarly?.type === 'on-time'
                    ? '✓ On Time'
                    : predictions?.currentDay
                      ? `Day ${predictions.currentDay}`
                      : '--'}
            </Text>

            <View style={styles.remainingContainer}>
              <Text style={styles.remainingLabel}>
                Next cycle starts in
              </Text>
              <Text style={styles.remainingValue}>
                {lateEarly?.daysLeft} days
              </Text>
            </View>
          </View>

          <View style={styles.predictionRow}>
            <View style={styles.predictionItem}>
              <Text style={styles.predictionLabel}>
                {lateEarly?.type === 'late' ? 'Delay' : 'Status'}
              </Text>
              <Text style={styles.predictionValue}>
                {lateEarly?.type === 'late' ? 'Late' :
                  lateEarly?.type === 'early' ? 'Early' : 'On Track'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.predictionItem}>
              <Text style={styles.predictionLabel}>Next Period</Text>
              <Text style={styles.predictionValue}>
                {predictions?.nextPeriodDate ?
                  predictions.nextPeriodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Pending'}
              </Text>
            </View>
          </View>
        </GradientBackground>

        {/* Quick Insights Row */}
        <View style={styles.row}>
          <CycleCard
            title="Fertile Window"
            value="High"
            subtitle="Next 3 days"
            variant="pink"
            style={styles.halfCard}
          />
          <CycleCard
            title="Avg Cycle"
            value="28"
            subtitle="days"
            variant="lavender"
            style={styles.halfCard}
          />
        </View>

        {/* Daily Tip */}
        <TipCard day={predictions?.currentDay} />

        {/* Quick Log Mood */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <View style={styles.moodRow}>
            <TouchableOpacity style={styles.moodItem}>
              <Smile color={colors.primary} size={32} />
              <Text style={styles.moodLabel}>Happy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moodItem}>
              <Meh color={colors.secondary} size={32} />
              <Text style={styles.moodLabel}>Calm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moodItem}>
              <Frown color={colors.text.light} size={32} />
              <Text style={styles.moodLabel}>Tired</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Preview Placeholder */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cycle Calendar</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.calendarPlaceholder}>
            {/* We'll implement real calendar in Calendar Screen */}
            <Text style={styles.placeholderText}>Full monthly view available in Calendar tab</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Log')}
      >
        <Plus color="white" size={32} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.h2,
    color: colors.text.primary,
  },
  date: {
    ...typography.body,
    color: colors.text.secondary,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  mainCardTitle: {
    ...typography.label,
    color: colors.text.white,
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  mainCycleDay: {
    ...typography.h1,
    fontSize: 48,
    color: colors.text.white,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: spacing.md,
  },
  predictionItem: {
    alignItems: 'center',
  },
  predictionLabel: {
    ...typography.caption,
    color: colors.text.white,
    opacity: 0.8,
  },
  predictionValue: {
    ...typography.label,
    color: colors.text.white,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  halfCard: {
    width: '48%',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  seeAll: {
    ...typography.label,
    color: colors.primary,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  moodItem: {
    alignItems: 'center',
  },
  moodLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
    color: colors.text.secondary,
  },
  calendarPlaceholder: {
    height: 120,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  placeholderText: {
    ...typography.caption,
    color: colors.text.light,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  mainContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  daysLeftContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  daysLeftLabel: {
    ...typography.caption,
    color: colors.text.white,
    opacity: 0.8,
    fontSize: 12,
  },
  daysLeftValue: {
    ...typography.h2,
    color: colors.text.white,
    fontWeight: 'bold',
    fontSize: 24,
    marginTop: 2,
  },
  daysLeftSubtext: {
    ...typography.caption,
    color: colors.text.white,
    opacity: 0.7,
    fontSize: 10,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.md,
  },
  cycleDayContainer: {
    alignItems: 'center',
    flex: 1,
  },
  cycleDayLabel: {
    ...typography.caption,
    color: colors.text.white,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  remainingContainer: {
    alignItems: 'flex-end',
  },
  remainingLabel: {
    ...typography.caption,
    color: colors.text.white,
    opacity: 0.8,
  },
  remainingValue: {
    ...typography.body,
    color: colors.text.white,
    fontWeight: '600',
    marginTop: 2,
  },
});
