import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { GradientBackground } from '../../components/GradientBackground';
import { CycleCard } from '../../components/CycleCard';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius, typography } from '../../theme/spacing';
import { useCycleStore } from '../../store/useCycleStore';
import { useUserStore } from '../../store/useUserStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { calculatePredictions, getStatusMessage, calculateLateEarly, analyzeCyclePatterns, getHealthGuidance } from '../../utils/cycleLogic';
import { Bell, Settings, Plus, Smile, Frown, Meh } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { HealthInsightCard } from '../../components/HealthInsightCard';
import { TipCard } from '../../components/TipCard';

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { cycles } = useCycleStore();
  const { user } = useUserStore();
  const badgeCount = useNotificationStore((state) => state.notificationBadgeCount);
  const clearNotificationBadgeCount = useNotificationStore(
    (state) => state.clearNotificationBadgeCount
  );
  const navigation = useNavigation<any>();

  const predictions = calculatePredictions(cycles);
  const lateEarly = calculateLateEarly(predictions, cycles);
  const statusMessage = getStatusMessage(predictions, lateEarly);

  const patterns = analyzeCyclePatterns(cycles);
  const healthGuidance = getHealthGuidance(patterns);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
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
      color: theme.text.primary,
    },
    date: {
      ...typography.body,
      color: theme.text.secondary,
    },
    headerIcons: {
      flexDirection: 'row',
    },
    iconButton: {
      marginLeft: spacing.md,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      borderRadius: 9,
      backgroundColor: theme.error,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      color: theme.text.white,
      fontSize: 10,
      fontWeight: '700',
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
      color: theme.text.white,
      opacity: 0.9,
      marginBottom: spacing.sm,
    },
    mainCycleDay: {
      ...typography.h1,
      fontSize: 48,
      color: theme.text.white,
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
      color: theme.text.white,
      opacity: 0.8,
    },
    predictionValue: {
      ...typography.label,
      color: theme.text.white,
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
      color: theme.text.primary,
      marginBottom: spacing.md,
    },
    seeAll: {
      ...typography.label,
      color: theme.primary,
    },
    moodRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.surface,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
    },
    moodItem: {
      alignItems: 'center',
    },
    moodLabel: {
      ...typography.caption,
      marginTop: spacing.xs,
      color: theme.text.secondary,
    },
    calendarPlaceholder: {
      height: 120,
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.md,
    },
    placeholderText: {
      ...typography.caption,
      color: theme.text.light,
      textAlign: 'center',
    },
    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    remainingContainer: {
      alignItems: 'flex-end',
    },
    remainingLabel: {
      ...typography.caption,
      color: theme.text.white,
      opacity: 0.8,
    },
    remainingValue: {
      ...typography.body,
      color: theme.text.white,
      fontWeight: '600',
      marginTop: 2,
    },
  });

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
            <TouchableOpacity
              style={styles.iconButton}
              onPress={async () => {
                await clearNotificationBadgeCount();
                navigation.navigate('NotificationSettings');
              }}
            >
              <Bell color={theme.text.primary} size={24} />
              {badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Profile')}>
              <Settings color={theme.text.primary} size={24} />
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
            value={"28"}
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
              <Smile color={theme.primary} size={32} />
              <Text style={styles.moodLabel}>Happy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moodItem}>
              <Meh color={theme.secondary} size={32} />
              <Text style={styles.moodLabel}>Calm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moodItem}>
              <Frown color={theme.text.light} size={32} />
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
            <Text style={styles.placeholderText}>Full monthly view available in Calendar tab</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Log')}
      >
        <Plus color={theme.text.white} size={32} />
      </TouchableOpacity>
    </View>
  );
};
