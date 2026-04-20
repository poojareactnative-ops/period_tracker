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
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Heart } from 'lucide-react-native';
import { GradientBackground } from '../../components/GradientBackground';
import { CustomButton } from '../../components/CustomButton';
import { auth } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, typography } from '../../theme/spacing';

export const RegisterScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<any>();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Enter a valid email');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      await updateProfile(userCredential.user, {
        displayName: normalizedName,
      });
      // AppNavigator swaps to main app when auth state updates.
    } catch (error: any) {
      let message = 'An error occurred during registration.';

      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Check your internet.';
      } else if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/configuration-not-found') {
        message = 'Email/Password sign-up is not enabled in Firebase Console.';
      } else if (error.code === 'auth/invalid-api-key') {
        message = 'Firebase API key is invalid. Please verify firebase configuration.';
      }

      Alert.alert('Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground variant="soft">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Heart color={colors.primary} size={32} fill={colors.primary} />
            </View>
            <Text style={styles.title}>Join FlowTrack</Text>
            <Text style={styles.subtitle}>Start tracking your wellness today</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Jane Doe"
                value={name}
                onChangeText={setName}
                autoCorrect={false}
              />
            </View>

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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="********"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.privacyContainer}>
              <Text style={styles.privacyText}>
                By signing up, you agree to our <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>.
              </Text>
            </View>

            <CustomButton
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
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
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.lg,
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
  privacyContainer: {
    marginBottom: spacing.xl,
  },
  privacyText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  button: {
    marginBottom: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  footerText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  linkText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
});
