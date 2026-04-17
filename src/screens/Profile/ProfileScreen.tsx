import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, typography } from '../../theme/spacing';
import { useUserStore } from '../../store/useUserStore';
import { 
  User, 
  Settings, 
  Bell, 
  Lock, 
  Shield, 
  LogOut, 
  ChevronRight,
  Heart
} from 'lucide-react-native';

export const ProfileScreen: React.FC = () => {
  const { user, setUser } = useUserStore();
  const [notifications, setNotifications] = React.useState(true);
  const [biometrics, setBiometrics] = React.useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => setUser(null)
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, value, type = 'link' }: any) => (
    <TouchableOpacity style={styles.settingItem}>
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
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Group */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingsGroup}>
            <SettingItem 
              icon={<Bell color={colors.primary} size={20} />} 
              title="Notifications" 
              type="switch" 
              value={notifications}
            />
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
          <Text style={styles.sectionTitle}>Cycle Settings</Text>
          <View style={styles.settingsGroup}>
            <SettingItem 
              icon={<Heart color="#F06292" size={20} />} 
              title="Cycle Length" 
            />
            <SettingItem 
              icon={<Calendar color="#BA68C8" size={20} />} 
              title="Period Duration" 
            />
          </View>
        </View>

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
