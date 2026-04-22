import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this function
const completeOnboarding = async () => {
  try {
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
  } catch (error) {
    console.error('Error saving onboarding status:', error);
  }
};

