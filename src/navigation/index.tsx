import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { SplashScreen } from '../screens/Splash/SplashScreen';
import { useUserStore } from '../store/useUserStore';
import { useCycleStore } from '../store/useCycleStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchCyclesForUser, fetchLogsForUser, upsertCycleSummaryForUser } from '../services/firebase';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../theme/ThemeContext';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { theme, isDark } = useTheme();
  const { user, isLoading, setUser, setLoading } = useUserStore();
  const setCycles = useCycleStore((state) => state.setCycles);
  const setLogs = useCycleStore((state) => state.setLogs);
  const incrementNotificationBadgeCount = useNotificationStore(
    (state) => state.incrementNotificationBadgeCount
  );
  const clearNotificationBadgeCount = useNotificationStore(
    (state) => state.clearNotificationBadgeCount
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let mounted = true;

    const syncBadgeCount = async () => {
      try {
        const badgeCount = await Notifications.getBadgeCountAsync();
        if (mounted) {
          await clearNotificationBadgeCount();
          if (badgeCount > 0) {
            await useNotificationStore.getState().setNotificationBadgeCount(badgeCount);
          }
        }
      } catch (error) {
        console.log('Failed to sync notification badge count:', error);
      }
    };

    const notificationSubscription = Notifications.addNotificationReceivedListener(async () => {
      await incrementNotificationBadgeCount();
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(async () => {
      await clearNotificationBadgeCount();
    });

    syncBadgeCount();

    return () => {
      mounted = false;
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, [clearNotificationBadgeCount, incrementNotificationBadgeCount]);

  useEffect(() => {
    let mounted = true;

    const loadCycles = async () => {
      if (!user?.uid) {
        if (mounted) {
          setCycles([]);
          setLogs([]);
        }
        return;
      }

      try {
        const [cycles, logs] = await Promise.all([
          fetchCyclesForUser(user.uid),
          fetchLogsForUser(user.uid),
        ]);
        if (mounted) {
          setCycles(cycles);
          setLogs(logs);
        }
        await upsertCycleSummaryForUser(user.uid, cycles);
      } catch (error) {
        console.log('Failed to load cycles:', error);
      }
    };

    loadCycles();

    return () => {
      mounted = false;
    };
  }, [setCycles, setLogs, user?.uid]);

  if (isLoading) {
    return <SplashScreen />;
  }

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text.primary,
      border: theme.border,
      notification: theme.accent,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
