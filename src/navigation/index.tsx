import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { SplashScreen } from '../screens/Splash/SplashScreen';
import { useUserStore } from '../store/useUserStore';
import { useCycleStore } from '../store/useCycleStore';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchCyclesForUser, fetchLogsForUser, upsertCycleSummaryForUser } from '../services/firebase';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { user, isLoading, setUser, setLoading } = useUserStore();
  const setCycles = useCycleStore((state) => state.setCycles);
  const setLogs = useCycleStore((state) => state.setLogs);

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

  return (
    <NavigationContainer>
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
