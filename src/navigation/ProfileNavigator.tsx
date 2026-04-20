import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { PrivacyPolicyScreen } from '../screens/Profile/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator();

export const ProfileNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
};
