import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius, typography } from '../../theme/spacing';
import { useCycleStore } from '../../store/useCycleStore';
import {
  cancelReminders,
  getAllScheduledNotifications,
  getMissedPeriodReminderDates,
  requestPermissions,
  scheduleMissedPeriodReminders,
} from '../../services/notificationService';

export const NotificationSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { cycles } = useCycleStore();

  const [isEnabled, setIsEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [nextReminderDate, setNextReminderDate] = useState<Date | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([21, 28]);
  const [isLoading, setIsLoading] = useState(false);

  const getLastPeriodStart = () => {
    const validCycles = [...cycles]
      .filter((cycle) => Boolean(cycle.startDate))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    if (validCycles.length === 0) return null;

    const lastCycle = validCycles[validCycles.length - 1];
    return new Date(lastCycle.startDate);
  };

  const loadNotificationStatus = async () => {
    const permission = await requestPermissions();
    setHasPermission(permission);

    const scheduled = await getAllScheduledNotifications();
    const reminderDates = scheduled
      .filter(
        (notif) =>
          notif.content.data?.type === 'missed_period_reminder' ||
          notif.content.data?.type === 'period_reminder'
      )
      .map((notif) => new Date((notif.trigger as any)?.date))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    setIsEnabled(reminderDates.length > 0);
    setNextReminderDate(reminderDates[0] ?? null);
  };

  useEffect(() => {
    loadNotificationStatus();
  }, []);

  const scheduleNextReminder = async () => {
    setIsLoading(true);

    try {
      const lastPeriod = getLastPeriodStart();
      if (!lastPeriod) {
        Alert.alert(
          'No Cycle Data',
          'Please log at least one complete cycle before setting reminders.'
        );
        setIsEnabled(false);
        return;
      }

      const reminderDays = selectedDays.length > 0 ? selectedDays : [21, 28];
      const reminderDates = getMissedPeriodReminderDates(lastPeriod.toISOString(), reminderDays)
        .filter((date) => date.getTime() > Date.now())
        .sort((a, b) => a.getTime() - b.getTime());

      const scheduledIds = await scheduleMissedPeriodReminders(
        lastPeriod.toISOString(),
        reminderDays
      );

      if (reminderDates.length > 0 && scheduledIds.length > 0) {
        setNextReminderDate(reminderDates[0]);
        const formattedDates = reminderDates.map((date) => format(date, 'MMMM d, yyyy')).join(' and ');

        Alert.alert('Reminder Set', `You'll be notified on ${formattedDates}`);
        return;
      }

      setIsEnabled(false);
      setNextReminderDate(null);
      Alert.alert(
        'No Upcoming Reminder',
        'The selected reminder days are already in the past for this cycle.'
      );
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      Alert.alert('Error', 'Failed to set reminder. Please try again.');
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleReminders = async (value: boolean) => {
    if (value && !hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please allow notifications to receive missed period reminders.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Allow',
            onPress: async () => {
              const granted = await requestPermissions();
              if (granted) {
                setHasPermission(true);
                setIsEnabled(true);
                await scheduleNextReminder();
              } else {
                Alert.alert('Permission Denied', 'You need to allow notifications in settings.');
              }
            },
          },
        ]
      );
      return;
    }

    setIsEnabled(value);

    if (value) {
      await scheduleNextReminder();
      return;
    }

    await cancelReminders();
    setNextReminderDate(null);
  };

  const getReminderPreview = () => {
    const lastPeriod = getLastPeriodStart();
    if (!lastPeriod) return 'Log a cycle to see preview';

    const reminderDays = selectedDays.length > 0 ? selectedDays : [21, 28];
    const reminderDates = getMissedPeriodReminderDates(lastPeriod.toISOString(), reminderDays)
      .filter((date) => date.getTime() > Date.now())
      .sort((a, b) => a.getTime() - b.getTime());

    if (reminderDates.length === 0) return 'No upcoming reminder dates for this cycle';
    if (reminderDates.length === 1) return `Next reminder on ${format(reminderDates[0], 'MMMM d, yyyy')}`;

    return `Reminders on ${format(reminderDates[0], 'MMM d')} and ${format(reminderDates[1], 'MMM d')}`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.md,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      ...typography.h2,
      color: theme.text.primary,
    },
    placeholder: {
      width: 40,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    section: {
      marginBottom: spacing.xl,
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: theme.border,
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    toggleInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    toggleLabel: {
      ...typography.h3,
      color: theme.text.primary,
    },
    toggleDescription: {
      ...typography.body,
      color: theme.text.secondary,
      marginTop: spacing.xs,
    },
    sectionTitle: {
      ...typography.h3,
      color: theme.text.primary,
      marginBottom: spacing.xs,
    },
    sectionDescription: {
      ...typography.caption,
      color: theme.text.secondary,
      marginBottom: spacing.md,
    },
    cycleLengthContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    cycleLengthButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cycleLengthButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    cycleLengthText: {
      ...typography.body,
      color: theme.text.secondary,
    },
    cycleLengthTextActive: {
      color: theme.text.white,
      fontWeight: '600',
    },
    previewBox: {
      marginTop: spacing.sm,
    },
    previewNotification: {
      flexDirection: 'row',
      backgroundColor: theme.background,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      gap: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
    },
    previewIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewContent: {
      flex: 1,
    },
    previewTitle: {
      ...typography.label,
      color: theme.text.primary,
      fontWeight: '600',
    },
    previewBody: {
      ...typography.caption,
      color: theme.text.secondary,
      marginTop: 2,
    },
    previewCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: theme.primary + '20',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.lg,
    },
    previewText: {
      ...typography.body,
      color: theme.text.primary,
      fontWeight: '500',
    },
    dangerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: theme.error + '10',
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: theme.error + '30',
    },
    dangerButtonText: {
      ...typography.label,
      color: theme.error,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="notifications" size={24} color={theme.primary} />
              <Text style={styles.toggleLabel}>Missed Period Reminders</Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={handleToggleReminders}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.text.white}
              disabled={isLoading}
            />
          </View>
          <Text style={styles.toggleDescription}>
            Get notified if your period is still missing after 21 days and 28 days
          </Text>
        </View>

        {isEnabled && nextReminderDate && (
          <View style={styles.previewCard}>
            <Ionicons name="calendar" size={20} color={theme.text.white} />
            <Text style={styles.previewText}>
              Next reminder: {format(nextReminderDate, 'MMMM d, yyyy')}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Missed Cycle Settings</Text>
          <Text style={styles.sectionDescription}>
            We'll notify you if your period is still missing after 21 days and 28 days
          </Text>

          <View style={styles.cycleLengthContainer}>
            {[21, 28].map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.cycleLengthButton,
                  selectedDays.includes(days) && styles.cycleLengthButtonActive,
                ]}
                onPress={() =>
                  setSelectedDays((current) => {
                    if (current.includes(days)) {
                      const next = current.filter((value) => value !== days);
                      return next.length > 0 ? next : [21, 28];
                    }

                    return [...current, days].sort((a, b) => a - b);
                  })
                }
              >
                <Text
                  style={[
                    styles.cycleLengthText,
                    selectedDays.includes(days) && styles.cycleLengthTextActive,
                  ]}
                >
                  {days} days
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.previewBox}>
            <View style={styles.previewNotification}>
              <View style={styles.previewIcon}>
                <Ionicons name="notifications" size={24} color={theme.primary} />
              </View>
              <View style={styles.previewContent}>
                <Text style={styles.previewTitle}>FlowTrack Reminder</Text>
                <Text style={styles.previewBody}>{getReminderPreview()}</Text>
              </View>
            </View>
          </View>
        </View>

        {isEnabled && (
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => {
              Alert.alert(
                'Disable Reminders',
                'Are you sure you want to turn off all period reminders?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Disable',
                    style: 'destructive',
                    onPress: async () => {
                      await cancelReminders();
                      setIsEnabled(false);
                      setNextReminderDate(null);
                      Alert.alert('Reminders Disabled', 'All notifications have been cancelled.');
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="trash" size={20} color={theme.error} />
            <Text style={styles.dangerButtonText}>Disable All Reminders</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};
