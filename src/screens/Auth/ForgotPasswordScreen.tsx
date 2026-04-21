import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { GradientBackground } from '../../components/GradientBackground';
import { CustomButton } from '../../components/CustomButton';
import { auth } from '../../services/firebase';
import { spacing, borderRadius, typography } from '../../theme/spacing';
import { useGlobalTheme } from '../../theme/themeProvider';

export const ForgotPasswordScreen: React.FC = () => {
  const { colors } = useGlobalTheme();

  const styles = createStyles(colors);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<any>();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Enter a valid email');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      Alert.alert('Email Sent', 'Password reset instructions were sent to your email.', [
        {
          text: 'Back to Login',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error: any) {
      let message = 'Could not send password reset email.';

      if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Check your internet.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many requests. Try again later.';
      } else if (error.code === 'auth/invalid-api-key') {
        message = 'Firebase API key is invalid. Please verify firebase configuration.';
      }

      Alert.alert('Reset Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground variant="soft">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.text.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Mail color={colors.primary} size={28} />
          </View>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>Enter your email and we will send a reset link.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="hello@flowtrack.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <CustomButton title="Send Reset Link" onPress={handleResetPassword} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const createStyles = (colors:any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  backText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  header: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 40,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: 'white',
    height: 56,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
