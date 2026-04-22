import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal, TextInput } from 'react-native';
import { colors } from '../../theme/colors';
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

  const SettingItem = ({ icon, title, value, type = 'link' }: any) => (
    <TouchableOpacity style={styles.settingItem} activeOpacity={type === 'link' ? 0.7 : 1} onPress={() => {
      if (type === 'link') {
        if (title === 'Privacy Policy') navigation.navigate('PrivacyPolicy');
      }
    }}>
      <View style={styles.settingLeft}>
        <View style={styles.iconBox}>{icon}</View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {type === 'link' && <ChevronRight color={colors.text.light} size={20} />}
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={title === 'Notifications' ? setNotifications : setBiometrics}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="white"
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
            <User color={colors.primary} size={40} />
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
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleNotification(!notifications)}
            >
              <SettingItem
                icon={<Bell color={colors.primary} size={20} />}
                title="Notifications"
                type="switch"
                value={notifications}
              />
            </TouchableOpacity>
            <SettingItem
              icon={<Lock color={colors.secondary} size={20} />}
              title="App Lock"
              type="switch"
              value={biometrics}
            />
            <SettingItem
              icon={<Shield color={colors.accent} size={20} />}
              title="Privacy Policy"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cycle Metrics</Text>
          <View style={styles.settingsGroup}>
            <View style={styles.metricItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#FCE4EC' }]}>
                  <Heart color="#F06292" size={20} />
                </View>
                <Text style={styles.settingTitle}>Avg Cycle Length</Text>
              </View>
              <Text style={styles.metricValue}>{avgCycleLength} Days</Text>
            </View>
            <View style={styles.metricItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#F3E5F5' }]}>
                  <Calendar color="#BA68C8" size={20} />
                </View>
                <Text style={styles.settingTitle}>Avg Period Duration</Text>
              </View>
              <Text style={styles.metricValue}>{avgPeriodDuration} Days</Text>
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
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Enter your email"
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

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color={colors.error} size={20} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.versionText}>FlowTrack v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ for you</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'white',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: 'white',
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
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  userName: {
    ...typography.h3,
    color: colors.text.primary,
  },
  userEmail: {
    ...typography.body,
    color: colors.text.secondary,
    opacity: 0.7,
    marginBottom: spacing.md,
  },
  editButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editButtonText: {
    ...typography.label,
    color: colors.primary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.text.light,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  settingsGroup: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metricValue: {
    ...typography.body,
    color: colors.primary,
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
    backgroundColor: 'white',
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
    color: colors.text.primary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    height: 50,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.surface,
  },
  saveButton: {
    marginLeft: spacing.sm,
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: '#FFF0F0',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  logoutText: {
    ...typography.label,
    color: colors.error,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  versionText: {
    ...typography.caption,
    color: colors.text.light,
  },
  footerText: {
    ...typography.caption,
    color: colors.text.light,
    marginTop: 4,
  },
});
