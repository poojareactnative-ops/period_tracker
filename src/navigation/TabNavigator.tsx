import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Calendar as CalendarIcon, FilePlus, BarChart2, User } from 'lucide-react-native';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { CalendarScreen } from '../screens/Calendar/CalendarScreen';
import { LogEntryScreen } from '../screens/Log/LogEntryScreen';
import { InsightsScreen } from '../screens/Insights/InsightsScreen';
import { ProfileNavigator } from './ProfileNavigator';
import { useTheme } from '../theme/ThemeContext';
import { HomeNavigator } from './HomeNavigator';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text.light,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: Platform.OS === 'ios' ? 70 + insets.bottom : 70,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 15,
          paddingTop: 10,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeNavigator} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <CalendarIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Log" 
        component={LogEntryScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <FilePlus color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Insights" 
        component={InsightsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileNavigator} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};