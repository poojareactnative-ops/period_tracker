import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NotificationSettingsScreen } from '../screens/Home/NotificationSettingsScreen';
import { HomeScreen } from '../screens/Home/HomeScreen';

const Stack = createNativeStackNavigator();

export const HomeNavigator = () => {
  return (
    <Stack.Navigator  screenOptions={{ headerShown: false }} initialRouteName='Home' >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    </Stack.Navigator>
  );
};
