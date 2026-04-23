import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GradientBackground } from '../../components/GradientBackground';
import { useTheme } from '../../theme/ThemeContext';
import { WifiOff } from 'lucide-react-native';

interface Props {
  onRetry: () => void;
}

export const OfflineScreen: React.FC<Props> = ({ onRetry }) => {
  const { theme } = useTheme();

  return (
    <GradientBackground variant="pink">
      <View style={styles.container}>
        
        <View style={styles.iconCircle}>
          <WifiOff size={48} color={theme.primary} />
        </View>

        <Text style={[styles.title, { color: theme.text.white }]}>
          No Internet Connection
        </Text>

        <Text style={[styles.subtitle, { color: theme.text.white }]}>
          Please check your connection and try again
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: 'white' }]}
          onPress={onRetry}
        >
          <Text style={[styles.buttonText, { color: theme.primary }]}>
            Retry
          </Text>
        </TouchableOpacity>

      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});