import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, typography } from '../../theme/spacing';
import { CustomButton } from '../../components/CustomButton';
import { useCycleStore } from '../../store/useCycleStore';
import { useNavigation } from '@react-navigation/native';
import { Smile, Meh, Frown, X, Check } from 'lucide-react-native';

const MOODS = [
  { id: 'happy', icon: <Smile size={32} />, label: 'Happy' },
  { id: 'calm', icon: <Meh size={32} />, label: 'Calm' },
  { id: 'sad', icon: <Frown size={32} />, label: 'Sad' },
  { id: 'irritated', icon: <Frown size={32} />, label: 'Irritated' },
];

const SYMPTOMS = [
  'Cramps', 'Headache', 'Bloating', 'Acne', 'Backache', 'Tiredness', 'Cravings'
];

export const LogEntryScreen: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState('happy');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const addLog = useCycleStore(state => state.addLog);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom) 
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      addLog({
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        mood: selectedMood,
        symptoms: selectedSymptoms,
        notes,
      });
      
      Alert.alert('Success', 'Log saved successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <X color={colors.text.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Log</Text>
        <TouchableOpacity onPress={handleSave}>
          <Check color={colors.primary} size={28} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Mood Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How's your mood?</Text>
            <View style={styles.moodGrid}>
              {MOODS.map(mood => (
                <TouchableOpacity 
                  key={mood.id}
                  style={[
                    styles.moodItem,
                    selectedMood === mood.id && styles.activeMoodItem
                  ]}
                  onPress={() => setSelectedMood(mood.id)}
                >
                  {React.cloneElement(mood.icon, { 
                    color: selectedMood === mood.id ? colors.primary : colors.text.light 
                  })}
                  <Text style={[
                    styles.moodLabel,
                    selectedMood === mood.id && styles.activeMoodLabel
                  ]}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Symptoms Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Any symptoms?</Text>
            <View style={styles.chipContainer}>
              {SYMPTOMS.map(symptom => (
                <TouchableOpacity 
                  key={symptom}
                  style={[
                    styles.chip,
                    selectedSymptoms.includes(symptom) && styles.activeChip
                  ]}
                  onPress={() => toggleSymptom(symptom)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedSymptoms.includes(symptom) && styles.activeChipText
                  ]}>{symptom}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="How was your day? Any specific observations?"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <CustomButton 
            title="Save Log" 
            onPress={handleSave} 
            loading={loading}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodItem: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeMoodItem: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  moodLabel: {
    ...typography.caption,
    marginTop: 4,
    color: colors.text.light,
  },
  activeMoodLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.label,
    color: colors.text.secondary,
  },
  activeChipText: {
    color: 'white',
  },
  notesInput: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
    fontSize: 16,
    color: colors.text.primary,
  },
  saveButton: {
    marginTop: spacing.md,
    marginBottom: 40,
  },
});
