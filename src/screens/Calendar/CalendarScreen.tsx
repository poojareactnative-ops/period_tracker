import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, typography } from '../../theme/spacing';
import { useCycleStore } from '../../store/useCycleStore';
import { format, parseISO, addDays } from 'date-fns';
import { GradientBackground } from '../../components/GradientBackground';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';

export const CalendarScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { cycles } = useCycleStore();

  // Mock marked dates for demonstration
  const markedDates = useMemo(() => {
    const marks: any = {};
    
    // Highlight today
    marks[format(new Date(), 'yyyy-MM-dd')] = {
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: 'white',
    };

    // Mock period days
    ['2026-04-12', '2026-04-13', '2026-04-14', '2026-04-15', '2026-04-16'].forEach(date => {
      marks[date] = {
        selected: true,
        selectedColor: colors.period,
        selectedTextColor: 'white',
      };
    });

    // Mock ovulation
    marks['2026-04-26'] = {
      selected: true,
      selectedColor: colors.ovulation,
      selectedTextColor: 'white',
      marked: true,
      dotColor: 'white',
    };

    return marks;
  }, [cycles]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cycle Tracker</Text>
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

        <View style={styles.logSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Details for {format(parseISO(selectedDate), 'MMMM d')}</Text>
          </View>
          
          <GradientBackground variant="soft" style={styles.logCard}>
            <Text style={styles.logPlaceholder}>No logs for this day yet.</Text>
            <TouchableOpacity style={styles.addLogButton}>
              <Plus color={colors.primary} size={20} />
              <Text style={styles.addLogText}>Add Log</Text>
            </TouchableOpacity>
          </GradientBackground>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
