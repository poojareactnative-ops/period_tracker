import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays, parseISO, isValid, differenceInDays } from 'date-fns';

export const MISSED_PERIOD_REMINDER_DAYS = [21, 28];

// 🔹 Notification Handler - MUST be configured
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 🔹 Request Permissions
export const requestPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus: Notifications.PermissionStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // ✅ Android channel configuration
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('period-reminder', {
        name: 'Period Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
      });
      
      // Optional: Add a second channel for test notifications
      await Notifications.setNotificationChannelAsync('test-notifications', {
        name: 'Test Notifications',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

const getMissedPeriodReminderBody = (daysSinceLastPeriod: number): string => {
  if (daysSinceLastPeriod === 21) {
    return "It's been 21 days since your last period started. If it hasn't started yet, log an update.";
  }

  if (daysSinceLastPeriod === 28) {
    return "It's been 28 days since your last period started. Your period may be missed.";
  }

  return `It's been ${daysSinceLastPeriod} days since your last period started.`;
};

export const getMissedPeriodReminderDates = (
  lastPeriodStartDate: string,
  reminderDays: number[] = MISSED_PERIOD_REMINDER_DAYS
): Date[] => {
  const parsedDate = parseISO(lastPeriodStartDate);
  if (!isValid(parsedDate)) return [];

  return reminderDays
    .map((daysSinceLastPeriod) => addDays(parsedDate, daysSinceLastPeriod))
    .filter((triggerDate) => isValid(triggerDate));
};

// 🔹 Schedule missed period reminders after 21 and 28 days
export const scheduleMissedPeriodReminders = async (
  lastPeriodStartDate: string,
  reminderDays: number[] = MISSED_PERIOD_REMINDER_DAYS
): Promise<string[]> => {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('⚠️ Permission not granted');
      return [];
    }

    const parsedDate: Date = parseISO(lastPeriodStartDate);

    if (!isValid(parsedDate)) {
      console.log('❌ Invalid date format:', lastPeriodStartDate);
      return [];
    }

    const existing = await getAllScheduledNotifications();
    const reminderTypes = new Set(['missed_period_reminder', 'period_reminder']);
    const existingReminders = existing.filter((notif) => reminderTypes.has(String(notif.content.data?.type)));

    for (const reminder of existingReminders) {
      await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
    }

    const now: Date = new Date();
    const scheduledIds: string[] = [];

    for (const daysSinceLastPeriod of reminderDays) {
      const triggerDate = addDays(parsedDate, daysSinceLastPeriod);

      if (triggerDate <= now) {
        console.log('⚠️ Skipping past reminder date:', triggerDate);
        continue;
      }

      const daysUntilReminder = differenceInDays(triggerDate, now);
      console.log(`🔔 Missed period reminder in ${daysUntilReminder} days on:`, triggerDate);

      const id: string = await Notifications.scheduleNotificationAsync({
        content: {
          title: daysSinceLastPeriod === 28 ? '🌸 Period Missed' : '🌸 Period Check-in',
          body: getMissedPeriodReminderBody(daysSinceLastPeriod),
          sound: true,
          data: {
            type: 'missed_period_reminder',
            daysSinceLastPeriod,
            lastPeriodStartDate: parsedDate.toISOString(),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: 'period-reminder',
        },
      });

      console.log('✅ Missed period notification scheduled with ID:', id);
      console.log('📅 Scheduled for:', triggerDate.toLocaleString());
      scheduledIds.push(id);
    }

    return scheduledIds;
  } catch (error) {
    console.error('❌ Notification scheduling error:', error);
    return [];
  }
};

// 🔹 Legacy wrapper for backward compatibility
export const schedulePeriodReminder = async (
  lastPeriodStartDate: string,
  _cycleLength: number = 28,
  _advanceDays: number = 1
): Promise<string | undefined> => {
  const scheduledIds = await scheduleMissedPeriodReminders(lastPeriodStartDate);
  return scheduledIds[0];
};

// 🔹 Schedule multiple missed-period reminders
export const scheduleMultipleReminders = async (
  lastPeriodStartDate: string,
  _cycleLength: number = 28,
  reminderDays: number[] = MISSED_PERIOD_REMINDER_DAYS
): Promise<string[]> => {
  const scheduledIds = await scheduleMissedPeriodReminders(lastPeriodStartDate, reminderDays);
  console.log(`✅ Scheduled ${scheduledIds.length} missed period reminders`);
  return scheduledIds;
};

// 🔹 Schedule a custom reminder
export const scheduleCustomReminder = async (
  title: string,
  body: string,
  triggerDate: Date,
  data?: any
): Promise<string | undefined> => {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('⚠️ Permission not granted');
      return;
    }

    const now = new Date();
    if (triggerDate <= now) {
      console.log('⚠️ Trigger date is in the past');
      return;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: data || {},
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: 'period-reminder',
      },
    });

    console.log('✅ Custom notification scheduled:', id);
    return id;
  } catch (error) {
    console.error('❌ Custom notification error:', error);
    return;
  }
};

// 🔹 Cancel specific reminder by ID
export const cancelReminder = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('✅ Cancelled notification:', notificationId);
  } catch (error) {
    console.error('❌ Error cancelling notification:', error);
  }
};

// 🔹 Cancel all reminders
export const cancelAllReminders = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ All notifications cancelled');
  } catch (error) {
    console.error('❌ Error cancelling all notifications:', error);
  }
};

// 🔹 Get all scheduled notifications
export const getAllScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📅 Found ${scheduled.length} scheduled notifications`);
    return scheduled;
  } catch (error) {
    console.error('❌ Error getting scheduled notifications:', error);
    return [];
  }
};

// 🔹 Send immediate test notification
export const sendImmediateNotification = async (
  title: string = 'Test Notification',
  body: string = 'This is a test notification from FlowTrack!'
): Promise<void> => {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('⚠️ Cannot send test: Permission not granted');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { type: 'test' },
      },
      trigger: null, // Show immediately
    });
    
    console.log('✅ Test notification sent');
  } catch (error) {
    console.error('❌ Test notification error:', error);
  }
};

// 🔹 Send immediate period reminder (for testing)
export const sendImmediatePeriodReminder = async (): Promise<void> => {
  await sendImmediateNotification(
    '🌸 Period Reminder Test',
    'This is what your period reminder will look like!'
  );
};

// 🔹 Check if notifications are enabled
export const areNotificationsEnabled = async (): Promise<boolean> => {
  const settings = await Notifications.getPermissionsAsync();
  return settings.status === 'granted';
};

// 🔹 Get notification settings
export const getNotificationSettings = async (): Promise<Notifications.NotificationPermissionsStatus> => {
  return await Notifications.getPermissionsAsync();
};

// 🔹 Open app settings (for Android/iOS)
export const openAppSettings = async (): Promise<void> => {
  if (Platform.OS === 'ios') {
    await Notifications.getPermissionsAsync();
    // iOS users need to manually go to settings
    console.log('Please go to Settings → Notifications → FlowTrack');
  } else {
    // Android can sometimes open settings
    await Notifications.getPermissionsAsync();
    console.log('Please check app settings for notification permissions');
  }
};

// 🔹 Schedule a daily reminder (for symptoms or mood tracking)
export const scheduleDailyReminder = async (
  hour: number,
  minute: number,
  title: string = 'Daily Check-in',
  body: string = "Don't forget to log your symptoms and mood today!"
): Promise<string | undefined> => {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // Calculate next trigger time
    const now = new Date();
    const triggerDate = new Date(now);
    triggerDate.setHours(hour, minute, 0, 0);
    
    if (triggerDate <= now) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { type: 'daily_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'period-reminder',
      },
    });

    console.log(`✅ Daily reminder scheduled for ${hour}:${minute}`);
    return id;
  } catch (error) {
    console.error('❌ Daily reminder error:', error);
    return;
  }
};

// 🔹 Cancel daily reminder
export const cancelDailyReminder = async (notificationId: string): Promise<void> => {
  await cancelReminder(notificationId);
};

// 🔹 Add notification listener for foreground
export const addNotificationListener = (
  onNotification: (notification: Notifications.Notification) => void,
  onResponse: (response: Notifications.NotificationResponse) => void
) => {
  const notificationListener = Notifications.addNotificationReceivedListener(onNotification);
  const responseListener = Notifications.addNotificationResponseReceivedListener(onResponse);
  
  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
};

// 🔹 Legacy function for backward compatibility
export const cancelReminders = cancelAllReminders;

// 🔹 Debug function - log all scheduled notifications
export const debugScheduledNotifications = async (): Promise<void> => {
  const scheduled = await getAllScheduledNotifications();
  console.log('=== SCHEDULED NOTIFICATIONS ===');
  scheduled.forEach((notif, index) => {
    console.log(`${index + 1}. ID: ${notif.identifier}`);
    console.log(`   Title: ${notif.content.title}`);
    console.log(`   Body: ${notif.content.body}`);
    console.log(`   Trigger: ${JSON.stringify(notif.trigger)}`);
  });
  console.log(`Total: ${scheduled.length} notifications`);
  console.log('================================');
};
