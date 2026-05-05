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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Heart, Eye, EyeOff } from 'lucide-react-native';
import { GradientBackground } from '../../components/GradientBackground';
import { CustomButton } from '../../components/CustomButton';
import { auth } from '../../services/firebase';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius, typography } from '../../theme/spacing';

export const LoginScreen: React.FC = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation<any>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.xl
    },
    header: {
      alignItems: 'center',
      marginTop: 60,
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
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    title: {
      ...typography.h2,
      color: theme.text.primary,
    },
    subtitle: {
      ...typography.body,
      color: theme.text.secondary,
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
      color: theme.text.primary,
      marginBottom: spacing.sm,
    },
    passwordContainer: {
      position: 'relative',
    },
    input: {
      backgroundColor: 'white',
      height: 56,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    passwordInput: {
      paddingRight: 48,
    },
    eyeIcon: {
      position: 'absolute',
      right: 12,
      top: 16,
      padding: 4,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: spacing.xl,
    },
    forgotText: {
      ...typography.label,
      color: theme.primary,
      fontWeight: '600',
    },
    button: {
      marginBottom: spacing.xl,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 'auto',
      marginBottom: 20,
    },
    footerText: {
      ...typography.body,
      color: theme.text.secondary,
    },
    linkText: {
      ...typography.body,
      color: theme.primary,
      fontWeight: '700',
    },
  });

  const handleLogin = async () => {
    if (!email || !password) {
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

    const normalizedEmail = email.trim().toLowerCase();

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
      // AppNavigator switches to the authenticated flow via onAuthStateChanged.
    } catch (error: any) {
      console.log('login error:', error);

      let message = 'An error occurred during sign in.';

      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Check your internet.';
      } else if (error.code === 'auth/invalid-credential') {
        message = 'Invalid credentials. Please check your email and password.';
      } else if (error.code === 'auth/user-disabled') {
        message = 'This account has been disabled.';
      } else if (error.code === 'auth/invalid-api-key') {
        message = 'Firebase API key is invalid. Please verify firebase configuration.';
      } else if (error.code === 'auth/configuration-not-found') {
        message = 'Email/Password sign-in is not enabled in Firebase Console.';
      }

      Alert.alert('Login Failed', message);
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
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Heart color={theme.primary} size={32} fill={theme.primary} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="********"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff color={theme.text.secondary} size={24} />
                ) : (
                  <Eye color={theme.text.secondary} size={24} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <CustomButton title="Sign In" onPress={handleLogin} loading={loading} style={styles.button} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};