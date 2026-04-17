import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar as CalendarIcon, FilePlus, BarChart2, User } from 'lucide-react-native';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { CalendarScreen } from '../screens/Calendar/CalendarScreen';
import { LogEntryScreen } from '../screens/Log/LogEntryScreen';
import { InsightsScreen } from '../screens/Insights/InsightsScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.light,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: 70,
          paddingBottom: 15,
          paddingTop: 10,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
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
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};
