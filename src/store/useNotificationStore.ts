import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useCycleStore } from './useCycleStore';
import {
  requestPermissions,
  cancelAllReminders,
  getAllScheduledNotifications,
  sendImmediateNotification,
  areNotificationsEnabled,
  debugScheduledNotifications,
  scheduleMissedPeriodReminders,
  getMissedPeriodReminderDates,
  MISSED_PERIOD_REMINDER_DAYS,
} from '../services/notificationService';

export interface ScheduledReminder {
  id: string;
  type: 'period' | 'missed_period' | 'daily' | 'custom';
  title: string;
  body: string;
  triggerDate: Date;
  cycleLength?: number;
  advanceDays?: number;
}

export interface NotificationSettings {
  enabled: boolean;
  periodReminders: boolean;
  dailyReminders: boolean;
  cycleLength: number;
  advanceDays: number;
  reminderDays: number[];
  dailyReminderTime: {
    hour: number;
    minute: number;
  };
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface NotificationState {
  // State
  hasPermission: boolean;
  isEnabled: boolean;
  settings: NotificationSettings;
  scheduledReminders: ScheduledReminder[];
  nextPeriodReminderDate: Date | null;
  notificationBadgeCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  togglePeriodReminders: (enabled: boolean) => Promise<void>;
  toggleDailyReminders: (enabled: boolean) => Promise<void>;
  updateCycleLength: (length: number) => Promise<void>;
  updateAdvanceDays: (days: number) => Promise<void>;
  updateReminderDays: (days: number[]) => Promise<void>;
  updateDailyReminderTime: (hour: number, minute: number) => Promise<void>;
  schedulePeriodReminder: () => Promise<string | undefined>;
  scheduleDailyReminder: () => Promise<string | undefined>;
  cancelAllReminders: () => Promise<void>;
  cancelReminderById: (id: string) => Promise<void>;
  refreshScheduledReminders: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  resetSettings: () => void;
  getNextPeriodDate: () => Date | null;
  getDaysUntilNextPeriod: () => number | null;
  getLastPeriodStart: () => string | null;
  setNotificationBadgeCount: (count: number) => Promise<void>;
  incrementNotificationBadgeCount: () => Promise<void>;
  clearNotificationBadgeCount: () => Promise<void>;
}

const { persist, createJSONStorage } = require('zustand/middleware') as typeof import('zustand/middleware');

const defaultSettings: NotificationSettings = {
  enabled: true,
  periodReminders: true,
  dailyReminders: false,
  cycleLength: 28,
  advanceDays: 1,
  reminderDays: [21, 28],
  dailyReminderTime: {
    hour: 19,
    minute: 0,
  },
  soundEnabled: true,
  vibrationEnabled: true,
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      hasPermission: false,
      isEnabled: false,
      settings: defaultSettings,
      scheduledReminders: [],
      nextPeriodReminderDate: null,
      notificationBadgeCount: 0,
      isLoading: false,
      error: null,

      // Initialize store
      initialize: async () => {
        set({ isLoading: true, error: null });
        try {
          const hasPermission = await areNotificationsEnabled();
          const scheduled = await getAllScheduledNotifications();
          const badgeCount = typeof Notifications.getBadgeCountAsync === 'function'
            ? await Notifications.getBadgeCountAsync()
            : 0;
          
          set({
            hasPermission,
            isEnabled: hasPermission,
            notificationBadgeCount: badgeCount,
            scheduledReminders: scheduled.map(notif => ({
              id: notif.identifier,
              type: (() => {
                const rawType = typeof notif.content.data?.type === 'string' ? notif.content.data.type : '';
                if (rawType === 'missed_period_reminder') return 'missed_period';
                if (rawType === 'daily_reminder') return 'daily';
                if (rawType === 'period_reminder') return 'period';
                return 'custom';
              })() as ScheduledReminder['type'],
              title: notif.content.title || '',
              body: notif.content.body || '',
              triggerDate: new Date((notif.trigger as any)?.date || Date.now()),
              cycleLength: typeof notif.content.data?.cycleLength === 'number'
                ? notif.content.data.cycleLength
                : undefined,
              advanceDays: typeof notif.content.data?.advanceDays === 'number'
                ? notif.content.data.advanceDays
                : undefined,
            })),
            isLoading: false,
          });
        } catch (error) {
          console.error('Initialize error:', error);
          set({ error: 'Failed to initialize notifications', isLoading: false });
        }
      },

      // Request permission
      requestPermission: async () => {
        set({ isLoading: true });
        try {
          const granted = await requestPermissions();
          set({ hasPermission: granted, isEnabled: granted, isLoading: false });
          return granted;
        } catch (error) {
          console.error('Permission error:', error);
          set({ error: 'Failed to request permission', isLoading: false });
          return false;
        }
      },

      // Toggle period reminders
      togglePeriodReminders: async (enabled: boolean) => {
        const { settings, schedulePeriodReminder } = get();
        
        set({
          settings: { ...settings, periodReminders: enabled },
          isLoading: true,
        });

        try {
          if (enabled) {
            await schedulePeriodReminder();
          } else {
            const allReminders = await getAllScheduledNotifications();
            const periodReminders = allReminders.filter(
              r => r.content.data?.type === 'missed_period_reminder' || r.content.data?.type === 'period_reminder'
            );
            for (const reminder of periodReminders) {
              await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
            }
          }
          await get().refreshScheduledReminders();
        } catch (error) {
          console.error('Toggle period reminders error:', error);
          set({ error: 'Failed to toggle period reminders' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Toggle daily reminders
      toggleDailyReminders: async (enabled: boolean) => {
        const { settings, scheduleDailyReminder, cancelAllReminders } = get();
        
        set({
          settings: { ...settings, dailyReminders: enabled },
          isLoading: true,
        });

        try {
          if (enabled) {
            await scheduleDailyReminder();
          } else {
            const allReminders = await getAllScheduledNotifications();
            const dailyReminders = allReminders.filter(
              r => r.content.data?.type === 'daily_reminder'
            );
            for (const reminder of dailyReminders) {
              await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
            }
          }
          await get().refreshScheduledReminders();
        } catch (error) {
          console.error('Toggle daily reminders error:', error);
          set({ error: 'Failed to toggle daily reminders' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Update cycle length
      updateCycleLength: async (length: number) => {
        const { settings, schedulePeriodReminder } = get();
        
        set({
          settings: { ...settings, cycleLength: length },
          isLoading: true,
        });

        try {
          if (settings.periodReminders) {
            await schedulePeriodReminder();
          }
        } catch (error) {
          console.error('Update cycle length error:', error);
          set({ error: 'Failed to update cycle length' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Update advance days
      updateAdvanceDays: async (days: number) => {
        const { settings, schedulePeriodReminder } = get();
        
        set({
          settings: { ...settings, advanceDays: days },
          isLoading: true,
        });

        try {
          if (settings.periodReminders) {
            await schedulePeriodReminder();
          }
        } catch (error) {
          console.error('Update advance days error:', error);
          set({ error: 'Failed to update advance days' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Update reminder days (for multiple reminders)
      updateReminderDays: async (days: number[]) => {
        const { settings, schedulePeriodReminder } = get();
        set({
          settings: { ...settings, reminderDays: days },
        });

        if (settings.periodReminders) {
          await schedulePeriodReminder();
        }
      },

      // Update daily reminder time
      updateDailyReminderTime: async (hour: number, minute: number) => {
        const { settings, scheduleDailyReminder } = get();
        
        set({
          settings: {
            ...settings,
            dailyReminderTime: { hour, minute },
          },
          isLoading: true,
        });

        try {
          if (settings.dailyReminders) {
            await scheduleDailyReminder();
          }
        } catch (error) {
          console.error('Update daily time error:', error);
          set({ error: 'Failed to update daily reminder time' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Schedule period reminder
      schedulePeriodReminder: async () => {
        const { settings, getLastPeriodStart } = get();
        
        const lastPeriod = getLastPeriodStart();
        if (!lastPeriod) {
          console.log('No cycle data available');
          return;
        }

        try {
          const reminderDays = settings.reminderDays.length > 0 ? settings.reminderDays : MISSED_PERIOD_REMINDER_DAYS;
          const scheduledIds = await scheduleMissedPeriodReminders(lastPeriod, reminderDays);
          
          if (scheduledIds.length > 0) {
            await get().refreshScheduledReminders();
            
            const reminderDates = getMissedPeriodReminderDates(lastPeriod, reminderDays)
              .filter((date) => date.getTime() > Date.now())
              .sort((a, b) => a.getTime() - b.getTime());

            set({ nextPeriodReminderDate: reminderDates[0] ?? null });
          }
          
          return scheduledIds[0];
        } catch (error) {
          console.error('Schedule period reminder error:', error);
          set({ error: 'Failed to schedule period reminder' });
        }
      },

      // Schedule daily reminder
      scheduleDailyReminder: async () => {
        const { settings } = get();
        
        try {
          const { hour, minute } = settings.dailyReminderTime;
          
          // Cancel existing daily reminders first
          const allReminders = await getAllScheduledNotifications();
          const dailyReminders = allReminders.filter(
            r => r.content.data?.type === 'daily_reminder'
          );
          for (const reminder of dailyReminders) {
            await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
          }
          
          // Schedule new daily reminder
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Daily Check-in',
              body: "Don't forget to log your symptoms and mood today!",
              sound: settings.soundEnabled,
              data: { type: 'daily_reminder' },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour,
              minute,
              channelId: 'period-reminder',
            },
          });
          
          console.log('Daily reminder scheduled:', id);
          await get().refreshScheduledReminders();
          return id;
        } catch (error) {
          console.error('Schedule daily reminder error:', error);
          set({ error: 'Failed to schedule daily reminder' });
        }
      },

      // Cancel all reminders
      cancelAllReminders: async () => {
        set({ isLoading: true });
        try {
          await cancelAllReminders();
          set({ scheduledReminders: [], nextPeriodReminderDate: null });
        } catch (error) {
          console.error('Cancel all reminders error:', error);
          set({ error: 'Failed to cancel reminders' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Cancel reminder by ID
      cancelReminderById: async (id: string) => {
        try {
          await Notifications.cancelScheduledNotificationAsync(id);
          await get().refreshScheduledReminders();
        } catch (error) {
          console.error('Cancel reminder error:', error);
          set({ error: 'Failed to cancel reminder' });
        }
      },

      // Refresh scheduled reminders list
      refreshScheduledReminders: async () => {
        try {
          const scheduled = await getAllScheduledNotifications();
          set({
            scheduledReminders: scheduled.map(notif => ({
              id: notif.identifier,
              type: (() => {
                const rawType = typeof notif.content.data?.type === 'string' ? notif.content.data.type : '';
                if (rawType === 'missed_period_reminder') return 'missed_period';
                if (rawType === 'daily_reminder') return 'daily';
                if (rawType === 'period_reminder') return 'period';
                return 'custom';
              })() as ScheduledReminder['type'],
              title: notif.content.title || '',
              body: notif.content.body || '',
              triggerDate: new Date((notif.trigger as any)?.date || Date.now()),
              cycleLength: typeof notif.content.data?.cycleLength === 'number'
                ? notif.content.data.cycleLength
                : undefined,
              advanceDays: typeof notif.content.data?.advanceDays === 'number'
                ? notif.content.data.advanceDays
                : undefined,
            })),
          });
        } catch (error) {
          console.error('Refresh reminders error:', error);
        }
      },

      // Send test notification
      sendTestNotification: async () => {
        try {
          await sendImmediateNotification(
            '🌸 Test Notification',
            'Your notifications are working!'
          );
        } catch (error) {
          console.error('Test notification error:', error);
          set({ error: 'Failed to send test notification' });
        }
      },

      // Update settings
      updateSettings: async (newSettings: Partial<NotificationSettings>) => {
        const { settings } = get();
        const updated = { ...settings, ...newSettings };
        
        set({ settings: updated, isLoading: true });
        
        try {
          if (updated.periodReminders) {
            await get().schedulePeriodReminder();
          }
          if (updated.dailyReminders) {
            await get().scheduleDailyReminder();
          }
        } catch (error) {
          console.error('Update settings error:', error);
          set({ error: 'Failed to update settings' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Reset settings to default
      resetSettings: () => {
        set({ settings: defaultSettings });
        get().schedulePeriodReminder();
      },

      // Helper: Get last period start date from cycle store
      getLastPeriodStart: () => {
        const cycles = useCycleStore.getState().cycles;
        const validCycles = [...cycles]
          .filter((cycle) => Boolean(cycle.startDate))
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        if (validCycles.length === 0) return null;

        return validCycles[validCycles.length - 1].startDate || null;
      },

      // Get next period date
      getNextPeriodDate: () => {
        return get().nextPeriodReminderDate;
      },

      // Get days until next period
      getDaysUntilNextPeriod: () => {
        const nextDate = get().nextPeriodReminderDate;
        if (!nextDate) return null;
        
        const today = new Date();
        const diffTime = nextDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
      },

      setNotificationBadgeCount: async (count: number) => {
        const safeCount = Math.max(0, Math.floor(count));
        set({ notificationBadgeCount: safeCount });

        try {
          await Notifications.setBadgeCountAsync(safeCount);
        } catch (error) {
          console.error('Set badge count error:', error);
        }
      },

      incrementNotificationBadgeCount: async () => {
        const currentCount = get().notificationBadgeCount;
        await get().setNotificationBadgeCount(currentCount + 1);
      },

      clearNotificationBadgeCount: async () => {
        await get().setNotificationBadgeCount(0);
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        hasPermission: state.hasPermission,
        isEnabled: state.isEnabled,
        notificationBadgeCount: state.notificationBadgeCount,
      }),
    }
  )
);

// Helper hook to use notification store with cycle store integration
export const useNotificationWithCycle = () => {
  const store = useNotificationStore();
  const { cycles } = useCycleStore(); // Import your cycle store
  
  // Override getLastPeriodStart to use actual cycle data
  const getLastPeriodStart = () => {
    const completedCycles = cycles.filter(c => c.endDate);
    if (completedCycles.length === 0) return null;
    const lastCycle = completedCycles[completedCycles.length - 1];
    return lastCycle.startDate || null;
  };
  
  return {
    ...store,
    getLastPeriodStart,
  };
};
