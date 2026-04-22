import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius, typography } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { requestPermissions, schedulePeriodReminder, cancelReminders } from '../../services/notificationService';
import { useCycleStore } from '../../store/useCycleStore';
import { format } from 'date-fns';

export const NotificationSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { cycles } = useCycleStore();
  
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [nextReminderDate, setNextReminderDate] = useState<Date | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([28]);
  const [selectedAdvanceDays, setSelectedAdvanceDays] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Get last period start date
  const getLastPeriodStart = () => {
    const completedCycles = cycles.filter(c => c.endDate);
    if (completedCycles.length === 0) return null;
    const lastCycle = completedCycles[completedCycles.length - 1];
    return lastCycle.startDate ? new Date(lastCycle.startDate) : null;
  };

  // Load notification status on mount
  useEffect(() => {
    loadNotificationStatus();
  }, []);

  const loadNotificationStatus = async () => {
    const permission = await requestPermissions();
    setHasPermission(permission);
    
    // Check if there are any scheduled notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    setIsEnabled(scheduled.length > 0);
    
    if (scheduled.length > 0 && scheduled[0].trigger) {
      // @ts-ignore
      const triggerDate = scheduled[0].trigger?.date;
      if (triggerDate) {
        setNextReminderDate(new Date(triggerDate));
      }
    }
  };

  const handleToggleReminders = async (value: boolean) => {
    if (value && !hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please allow notifications to receive period reminders.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Allow', 
            onPress: async () => {
              const granted = await requestPermissions();
              if (granted) {
                setIsEnabled(true);
                await scheduleNextReminder();
              } else {
                Alert.alert('Permission Denied', 'You need to allow notifications in settings.');
              }
            }
          }
        ]
      );
      return;
    }

    setIsEnabled(value);
    
    if (value) {
      await scheduleNextReminder();
    } else {
      await cancelReminders();
      setNextReminderDate(null);
    }
  };

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

      const id = await schedulePeriodReminder(lastPeriod.toISOString());
      if (id) {
        // Calculate next reminder date
        const nextDate = new Date(lastPeriod);
        nextDate.setDate(nextDate.getDate() + selectedDays[0]);
        setNextReminderDate(nextDate);
        
        Alert.alert(
          'Reminder Set',
          `You'll be notified on ${format(nextDate, 'MMMM d, yyyy')}`
        );
      }
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      Alert.alert('Error', 'Failed to set reminder. Please try again.');
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please enable notifications first.');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test notification from FlowTrack!',
        sound: true,
      },
      trigger: null, // Show immediately
    });
    
    Alert.alert('Test Sent', 'Check your notifications!');
  };

  const getReminderPreview = () => {
    const lastPeriod = getLastPeriodStart();
    if (!lastPeriod) return 'Log a cycle to see preview';
    
    const nextDate = new Date(lastPeriod);
    nextDate.setDate(nextDate.getDate() + selectedDays[0]);
    const today = new Date();
    const daysLeft = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysLeft < 0) return 'Your next period may have started';
    if (daysLeft === 0) return 'Your period should start today!';
    return `${daysLeft} days until your predicted period`;
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
    advanceContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    advanceButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    advanceButtonActive: {
      backgroundColor: theme.secondary,
      borderColor: theme.secondary,
    },
    advanceText: {
      ...typography.caption,
      color: theme.text.secondary,
    },
    advanceTextActive: {
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
    testButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: theme.surface,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: theme.border,
    },
    testButtonText: {
      ...typography.label,
      color: theme.primary,
      fontWeight: '600',
    },
    infoSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: theme.surface,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.lg,
    },
    infoText: {
      ...typography.caption,
      color: theme.text.light,
      flex: 1,
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Main Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="notifications" size={24} color={theme.primary} />
              <Text style={styles.toggleLabel}>Period Reminders</Text>
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
            Get notified when your next period is approaching
          </Text>
        </View>

        {/* Reminder Preview */}
        {isEnabled && nextReminderDate && (
          <View style={styles.previewCard}>
            <Ionicons name="calendar" size={20} color={theme.text.white} />
            <Text style={styles.previewText}>
              Next reminder: {format(nextReminderDate, 'MMMM d, yyyy')}
            </Text>
          </View>
        )}

        {/* Cycle Length Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cycle Settings</Text>
          <Text style={styles.sectionDescription}>
            Your average cycle length helps us predict accurately
          </Text>
          
          <View style={styles.cycleLengthContainer}>
            {[26, 28, 30, 32, 35].map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.cycleLengthButton,
                  selectedDays.includes(days) && styles.cycleLengthButtonActive,
                ]}
                onPress={() => setSelectedDays([days])}
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

        {/* Advance Notice */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Remind Me</Text>
          <View style={styles.advanceContainer}>
            {[0, 1, 2, 3, 5].map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.advanceButton,
                  selectedAdvanceDays === days && styles.advanceButtonActive,
                ]}
                onPress={() => setSelectedAdvanceDays(days)}
              >
                <Text
                  style={[
                    styles.advanceText,
                    selectedAdvanceDays === days && styles.advanceTextActive,
                  ]}
                >
                  {days === 0 ? 'Same day' : `${days} day${days > 1 ? 's' : ''} before`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview Section */}
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

        {/* Test Button */}
        <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
          <Ionicons name="notifications-outline" size={20} color={theme.primary} />
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={20} color={theme.text.light} />
          <Text style={styles.infoText}>
            Notifications are stored locally on your device. 
            We never share your cycle data with any servers.
          </Text>
        </View>

        {/* Danger Zone */}
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
                    }
                  }
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