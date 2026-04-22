import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal, TextInput } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius, typography } from '../../theme/spacing';
import { useUserStore } from '../../store/useUserStore';
import { useCycleStore } from '../../store/useCycleStore';
import * as NotificationService from '../../services/notificationService';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../services/firebase';
import {
  User,
  Settings,
  Bell,
  Lock,
  Shield,
  LogOut,
  ChevronRight,
  Heart,
  Calendar
} from 'lucide-react-native';

export const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, updateUser, setUser } = useUserStore();
  const { avgCycleLength, avgPeriodDuration, cycles } = useCycleStore();
  const navigation = useNavigation<any>();

  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const [editName, setEditName] = useState(user?.displayName || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => auth.signOut()
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    if (!editName || !editEmail) {
      Alert.alert('Error', 'Name and Email cannot be empty');
      return;
    }
    updateUser({ displayName: editName, email: editEmail });
    setIsEditModalVisible(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const toggleNotification = async (value: boolean) => {
    setNotifications(value);
    if (value) {
      const granted = await NotificationService.requestPermissions();
      if (granted && cycles.length > 0) {
        const lastCycle = cycles[cycles.length - 1];
        await NotificationService.schedulePeriodReminder(lastCycle.startDate);
        Alert.alert('Notifications Enabled', 'We will remind you 28 days after your last period start date.');
      } else if (!granted) {
        setNotifications(false);
        Alert.alert('Permission Denied', 'Please enable notifications in your device settings.');
      }
    } else {
      await NotificationService.cancelReminders();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      backgroundColor: theme.surface,
    },
    headerTitle: {
      ...typography.h2,
      color: theme.text.primary,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: 40,
    },
    profileCard: {
      backgroundColor: theme.surface,
      padding: spacing.xl,
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      marginBottom: spacing.xxl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 15,
      elevation: 4,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
      borderWidth: 2,
      borderColor: theme.primary,
    },
    userName: {
      ...typography.h3,
      color: theme.text.primary,
    },
    userEmail: {
      ...typography.body,
      color: theme.text.secondary,
      opacity: 0.7,
      marginBottom: spacing.md,
    },
    editButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    editButtonText: {
      ...typography.label,
      color: theme.primary,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      ...typography.label,
      color: theme.text.light,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.sm,
    },
    settingsGroup: {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    settingTitle: {
      ...typography.body,
      color: theme.text.primary,
      fontWeight: '500',
    },
    metricItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    metricValue: {
      ...typography.body,
      color: theme.primary,
      fontWeight: '700',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    modalContent: {
      width: '100%',
      backgroundColor: theme.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 8,
    },
    modalTitle: {
      ...typography.h3,
      color: theme.text.primary,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: spacing.lg,
    },
    inputLabel: {
      ...typography.caption,
      color: theme.text.secondary,
      marginBottom: spacing.xs,
      fontWeight: '600',
    },
    input: {
      backgroundColor: theme.background,
      height: 50,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.border,
      color: theme.text.primary,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.md,
    },
    modalButton: {
      flex: 1,
      height: 50,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButton: {
      marginRight: spacing.sm,
      backgroundColor: theme.background,
    },
    saveButton: {
      marginLeft: spacing.sm,
      backgroundColor: theme.primary,
    },
    cancelButtonText: {
      color: theme.text.secondary,
      fontWeight: '600',
    },
    saveButtonText: {
      color: theme.text.white,
      fontWeight: '700',
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
      backgroundColor: theme.error + '20',
      borderRadius: borderRadius.lg,
      marginBottom: spacing.xl,
    },
    logoutText: {
      ...typography.label,
      color: theme.error,
      fontWeight: '700',
      marginLeft: spacing.sm,
    },
    footer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    versionText: {
      ...typography.caption,
      color: theme.text.light,
    },
    footerText: {
      ...typography.caption,
      color: theme.text.light,
      marginTop: 4,
    },
  });

  const SettingItem = ({ icon, title, value, type = 'link' }: any) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      activeOpacity={type === 'link' ? 0.7 : 1} 
      onPress={() => {
        if (type === 'link' && title === 'Privacy Policy') {
          navigation.navigate('PrivacyPolicy');
        } else if (type === 'switch' && title === 'Notifications') {
          toggleNotification(!notifications);
        } else if (type === 'switch' && title === 'App Lock') {
          setBiometrics(!biometrics);
        }
      }}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconBox}>{icon}</View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {type === 'link' && <ChevronRight color={theme.text.light} size={20} />}
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={(val) => {
            if (title === 'Notifications') toggleNotification(val);
            if (title === 'App Lock') setBiometrics(val);
          }}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={theme.text.white}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User color={theme.primary} size={40} />
          </View>
          <Text style={styles.userName}>{user?.displayName || 'Jane Doe'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'jane.doe@example.com'}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditModalVisible(true)}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Group */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon={<Bell color={theme.primary} size={20} />}
              title="Notifications"
              type="switch"
              value={notifications}
            />
            <SettingItem
              icon={<Lock color={theme.secondary} size={20} />}
              title="App Lock"
              type="switch"
              value={biometrics}
            />
            <SettingItem
              icon={<Shield color={theme.accent} size={20} />}
              title="Privacy Policy"
              type="link"
            />
          </View>
        </View>

        {/* Cycle Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cycle Metrics</Text>
          <View style={styles.settingsGroup}>
            <View style={styles.metricItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.primary + '20' }]}>
                  <Heart color={theme.period} size={20} />
                </View>
                <Text style={styles.settingTitle}>Avg Cycle Length</Text>
              </View>
              <Text style={styles.metricValue}>{avgCycleLength || 28} Days</Text>
            </View>
            <View style={styles.metricItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.secondary + '20' }]}>
                  <Calendar color={theme.ovulation} size={20} />
                </View>
                <Text style={styles.settingTitle}>Avg Period Duration</Text>
              </View>
              <Text style={styles.metricValue}>{avgPeriodDuration || 5} Days</Text>
            </View>
          </View>
        </View>

        {/* Edit Profile Modal */}
        <Modal
          visible={isEditModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.text.light}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.text.light}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsEditModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color={theme.error} size={20} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>FlowTrack v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ for you</Text>
        </View>
      </ScrollView>
    </View>
  );
};