import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays, parseISO, isValid } from 'date-fns';

// 🔹 Notification Handler
// Notifications.setNotificationHandler({
//   handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// 🔹 Request Permissions
export const requestPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus: Notifications.PermissionStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // ✅ Android channel (required)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('period-reminder', {
      name: 'Period Reminder',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  return finalStatus === 'granted';
};

// 🔹 Schedule Reminder
export const schedulePeriodReminder = async (
  lastPeriodStartDate: string
): Promise<string | undefined> => {
  try {
    // ✅ Ensure permission
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('Permission not granted');
      return;
    }

    const parsedDate: Date = parseISO(lastPeriodStartDate);

    // ❌ Invalid date check
    if (!isValid(parsedDate)) {
      console.log('Invalid date format');
      return;
    }

    const triggerDate: Date = addDays(parsedDate, 28);
    const now: Date = new Date();

    if (triggerDate <= now) {
      console.log('Trigger date is in the past');
      return;
    }

    // ⚠️ Optional: remove old reminders
    await Notifications.cancelAllScheduledNotificationsAsync();

    const id: string = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'FlowTrack Reminder',
        body: 'Your next cycle is predicted to start soon. Stay prepared!',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: 'period-reminder', // ✅ Android fix
      },
    });

    console.log('Notification ID:', id);
    console.log('Scheduled for:', triggerDate);

    return id;
  } catch (error) {
    console.log('Notification error:', error);
  }
};

// 🔹 Cancel Reminder
export const cancelReminders = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const sendImmediateNotification = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null,
  });
};