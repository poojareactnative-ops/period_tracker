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
import { spacing, borderRadius, typography } from '../../theme/spacing';
import { useGlobalTheme } from '../../theme/themeProvider';

export const RegisterScreen: React.FC = () => {
  const { colors } = useGlobalTheme();

  const styles = createStyles(colors);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<any>();

  const handleRegister = async () => {
    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    // ✅ Validation
    if (!normalizedName || !normalizedEmail || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      Alert.alert('Error', 'Enter valid email');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        "pooja.reactnative@gmail.com",
        password
      );

      // ✅ Update user name
      await updateProfile(userCredential.user, {
        displayName: normalizedName,
      });

      Alert.alert('Success', 'Account created successfully');

    } catch (error: any) {
      console.log('Registration Error:', error);

      let message = 'Something went wrong';

      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Email already registered';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email format';
          break;
        case 'auth/weak-password':
          message = 'Password too weak';
          break;
        case 'auth/network-request-failed':
          message = 'Check your internet connection';
          break;
        case 'auth/operation-not-allowed':
          message = 'Enable Email/Password in Firebase Console';
          break;
        default:
          message = error.message;
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

const createStyles = (colors: any) => StyleSheet.create({
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
