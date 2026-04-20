import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, typography } from '../../theme/spacing';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.text.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>Last Updated: April 17, 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Data Security</Text>
          <Text style={styles.text}>
            Your health data is sensitive and private. FlowTrack encrypts all personal information and cycle data stored on your device and in our secure Firebase database. We do not sell your personal health information to third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.text}>
            We collect information you provide directly, such as your name, email address, and cycle details (dates, symptoms, moods). This data is used solely to provide accurate predictions and insights into your cycle.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. How We Use Data</Text>
          <Text style={styles.text}>
            - To calculate and predict your future cycles.
            - To provide personalized health insights and guidance.
            - To send notification reminders for your upcoming cycle.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Your Rights</Text>
          <Text style={styles.text}>
            You have the right to access, update, or delete your data at any time through the app settings. Deleting your account will permanently remove all associated cycle history and personal profiles.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For any questions or concerns regarding your privacy, please contact us at privacy@flowtrack.com.
          </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'white',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  lastUpdated: {
    ...typography.caption,
    color: colors.text.light,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    fontWeight: '700',
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  text: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  footer: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 40,
  },
  footerText: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.text.light,
    fontStyle: 'italic',
  },
});
