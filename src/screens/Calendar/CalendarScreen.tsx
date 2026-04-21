import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { spacing, borderRadius, typography } from '../../theme/spacing';
import { useCycleStore } from '../../store/useCycleStore';
import { format, parseISO } from 'date-fns';
import { GradientBackground } from '../../components/GradientBackground';
import { Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { calculateSmartPredictions } from '../../utils/smartCycleEngin';
import { useGlobalTheme } from '../../theme/themeProvider';

export const CalendarScreen: React.FC = () => {
  const { colors } = useGlobalTheme();

  const styles = createStyles(colors);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { cycles, logs } = useCycleStore();
  const navigation = useNavigation<any>();

  const logsForSelectedDate = useMemo(
    () => logs.filter((log) => log.date === selectedDate),
    [logs, selectedDate]
  );

  const predictions = calculateSmartPredictions(cycles);
  const markedDates = useMemo(() => {
    const marks: any = {};

    const today = format(new Date(), 'yyyy-MM-dd');
    marks[today] = {
      ...(marks[today] || {}),
      marked: true,
      dotColor: colors.primary,
    };

    cycles.forEach((cycle) => {
      if (!cycle.startDate) return;
      const startDate = new Date(`${cycle.startDate}T00:00:00`);
      const endDate = cycle.endDate ? new Date(`${cycle.endDate}T00:00:00`) : startDate;

      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return;

      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        const dateKey = format(cursor, 'yyyy-MM-dd');
        marks[dateKey] = {
          ...(marks[dateKey] || {}),
          selected: true,
          selectedColor: colors.period,
          selectedTextColor: 'white',
        };
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    logs.forEach((log) => {
      if (!log.date) return;
      marks[log.date] = {
        ...(marks[log.date] || {}),
        marked: true,
        dotColor: colors.primary,
      };
    });

    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: marks[selectedDate]?.selectedColor || colors.primary,
      selectedTextColor: 'white',
    };

    return marks;
  }, [cycles, logs, selectedDate]);

  const periodPredictions: any = useMemo(() => {
    if (!selectedDate) return null;

    const base = parseISO(selectedDate);

    const addDays = (days: number) => {
      const d = new Date(base);
      d.setDate(d.getDate() + days);
      return format(d, 'yyyy-MM-dd');
    };

    return {
      next21: addDays(21),
      next28: addDays(28),
    };
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌸 When’s My Next Period?</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: 'white',
              calendarBackground: 'white',
              textSectionTitleColor: colors.text.light,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: colors.primary,
              dayTextColor: colors.text.primary,
              textDisabledColor: '#d9e1e8',
              dotColor: colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: colors.primary,
              monthTextColor: colors.text.primary,
              indicatorColor: colors.primary,
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 20,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>
        <View style={styles.calculatorContainer}>
          <Text style={styles.sectionTitle}>Period Calculator</Text>

          <View style={styles.calculatorCard}>
            <Text style={styles.calcLabel}>
              Based on: {format(parseISO(selectedDate), 'MMM d, yyyy')}
            </Text>

            <View style={styles.calcRow}>
              <View style={styles.calcBox}>
                <Text style={styles.calcTitle}>21 Day Cycle</Text>
                <Text style={styles.calcDate}>
                  {format(parseISO(periodPredictions.next21), 'MMM d')}
                </Text>
              </View>

              <View style={styles.calcBox}>
                <Text style={styles.calcTitle}>28 Day Cycle</Text>
                <Text style={styles.calcDate}>
                  {format(parseISO(periodPredictions.next28), 'MMM d')}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.legendContainer}>
          <Text style={styles.sectionTitle}>Legend</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: colors.period }]} />
              <Text style={styles.legendText}>Period</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: colors.ovulation }]} />
              <Text style={styles.legendText}>Ovulation</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: colors.primary, opacity: 0.3 }]} />
              <Text style={styles.legendText}>Fertile</Text>
            </View>
          </View>
        </View>
        <View style={styles.smartCard}>
          <Text style={styles.sectionTitle}>Smart Prediction</Text>

          {predictions ? (
            <>
              <Text style={styles.smartText}>
                Next Period: {format(predictions.nextPeriodDate, 'MMM d')}
              </Text>

              <Text style={styles.smartText}>
                Ovulation: {format(predictions.ovulationDate, 'MMM d')}
              </Text>

              <Text style={styles.smartText}>
                Fertile: {format(predictions.fertileWindow.start, 'MMM d')} -{' '}
                {format(predictions.fertileWindow.end, 'MMM d')}
              </Text>

              <Text style={styles.confidence}>
                Accuracy: {predictions.confidence}%
              </Text>
            </>
          ) : (
            <Text>Add more cycle data for predictions</Text>
          )}
        </View>
        <View style={styles.logSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Details for {format(parseISO(selectedDate), 'MMMM d')}</Text>
          </View>

          <GradientBackground variant="soft" style={styles.logCard}>
            {logsForSelectedDate.length === 0 ? (
              <Text style={styles.logPlaceholder}>No logs for this day yet.</Text>
            ) : (
              <View style={styles.logsList}>
                {logsForSelectedDate.map((log) => (
                  <View key={log.id} style={styles.logItem}>
                    <Text style={styles.logMood}>Mood: {log.mood}</Text>
                    <Text style={styles.logSymptoms}>
                      Symptoms: {log.symptoms.length > 0 ? log.symptoms.join(', ') : 'None'}
                    </Text>
                    {log.notes ? <Text style={styles.logNotes}>Notes: {log.notes}</Text> : null}
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity style={styles.addLogButton} onPress={() => navigation.navigate('Log')}>
              <Plus color={colors.primary} size={20} />
              <Text style={styles.addLogText}>Add Log</Text>
            </TouchableOpacity>
          </GradientBackground>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'white',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
    marginBottom: spacing.xl,
  },
  legendContainer: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  logSection: {
    marginBottom: 40,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  logCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  logPlaceholder: {
    ...typography.body,
    color: colors.text.light,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  logsList: {
    width: '100%',
    marginBottom: spacing.md,
  },
  logItem: {
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  logMood: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  logSymptoms: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  logNotes: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  addLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addLogText: {
    ...typography.label,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  calculatorContainer: {
    marginBottom: spacing.xl,
  },

  calculatorCard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  calcLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  calcBox: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: 4,
    alignItems: 'center',
  },

  calcTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 4,
  },

  calcDate: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  smartCard: {
    backgroundColor: 'white',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },

  smartText: {
    fontSize: 16,
    marginBottom: 6,
    color: colors.text.primary,
  },

  confidence: {
    marginTop: 10,
    color: colors.primary,
    fontWeight: '700',
  },
});
