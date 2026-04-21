import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { GradientBackground } from '../../components/GradientBackground';
import { typography } from '../../theme/spacing';
import { useUserStore } from '../../store/useUserStore';
import { Heart } from 'lucide-react-native';
import { useGlobalTheme } from '../../theme/themeProvider';


export const SplashScreen: React.FC = () => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const setLoading = useUserStore(state => state.setLoading);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const { colors } = useGlobalTheme();
  const styles = createStyles(colors);
  return (
    <GradientBackground variant="pink">
      <View style={styles.container}>
        <Animated.View style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}>
          <View style={styles.iconCircle}>
            <Heart color={colors.primary} size={48} fill={colors.primary} />
          </View>
          <Text style={styles.appName}>FlowTrack</Text>
          <Text style={styles.tagline}>Your Body, Your Rhythm</Text>
        </Animated.View>
      </View>
    </GradientBackground>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  appName: {
    ...typography.h1,
    color: colors.text.white,
    letterSpacing: 2,
    fontWeight: '800',
  },
  tagline: {
    ...typography.body,
    color: colors.text.white,
    opacity: 0.9,
    marginTop: 8,
  },
});
