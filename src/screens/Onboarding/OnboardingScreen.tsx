import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { GradientBackground } from '../../components/GradientBackground';
import { CustomButton } from '../../components/CustomButton';
import { typography, spacing } from '../../theme/spacing';
import { useNavigation } from '@react-navigation/native';
import { Calendar, Brain, Bell } from 'lucide-react-native';
import { useGlobalTheme } from '../../theme/themeProvider';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Track your cycle',
    description: 'Easily log your period, symptoms, and moods to understand your rhythm.',
    icon: (color: string) => <Calendar color={color} size={80} />,
  },
  {
    title: 'Understand your body',
    description: 'Get deep insights into your health and receive personalized health tips.',
    icon: (color: string) => <Brain color={color} size={80} />,
  },
  {
    title: 'Stay prepared',
    description: 'Receive timely notifications for your next period and ovulation window.',
    icon: (color: string) => <Bell color={color} size={80} />,
  },
];

export const OnboardingScreen: React.FC = () => {
  const { colors } = useGlobalTheme();
  const styles = createStyles(colors);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigation = useNavigation<any>();

  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      navigation.navigate('Login');
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  return (
    <GradientBackground variant="pink">
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {slides[currentSlide].icon(colors.text.white)}
          </View>
          <Text style={styles.title}>{slides[currentSlide].title}</Text>
          <Text style={styles.description}>{slides[currentSlide].description}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {slides.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.dot, 
                  index === currentSlide && styles.activeDot
                ]} 
              />
            ))}
          </View>
          
          <CustomButton 
            title={isLastSlide ? "Get Started" : "Next"} 
            onPress={handleNext}
            style={styles.button}
            textStyle={{color:'#000'}}
          />

          {!isLastSlide && (
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </GradientBackground>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.xl,
      justifyContent: 'space-between',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconContainer: {
      marginBottom: spacing.xxl,
    },
    title: {
      ...typography.h1,
      color: colors.text.white,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    description: {
      ...typography.body,
      color: colors.text.white,
      textAlign: 'center',
      opacity: 0.9,
      paddingHorizontal: spacing.xl,
    },
    footer: {
      alignItems: 'center',
    },
    pagination: {
      flexDirection: 'row',
      marginBottom: spacing.xxl,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.4)',
      marginHorizontal: 4,
    },
    activeDot: {
      backgroundColor: colors.text.white,
      width: 20,
    },
    button: {
      width: '100%',
      backgroundColor: colors.text.white,
      marginBottom: spacing.md,
    },
    skipText: {
      ...typography.label,
      color: colors.text.white,
      opacity: 0.8,
    },
  });