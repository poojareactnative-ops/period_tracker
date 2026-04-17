import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, typography } from '../../theme/spacing';
import { GradientBackground } from '../../components/GradientBackground';
import { BarChart2, TrendingUp, Calendar } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CYCLE_DATA = [
  { month: 'Jan', length: 28 },
  { month: 'Feb', length: 30 },
  { month: 'Mar', length: 27 },
  { month: 'Apr', length: 28 },
];

export const InsightsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <TrendingUp color={colors.primary} size={24} />
            <Text style={styles.statValue}>28 Days</Text>
            <Text style={styles.statLabel}>Avg Cycle</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar color={colors.secondary} size={24} />
            <Text style={styles.statValue}>5 Days</Text>
            <Text style={styles.statLabel}>Avg Period</Text>
          </View>
        </View>

        {/* Cycle Length Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cycle Length Trend</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chart}>
              {CYCLE_DATA.map((data, index) => (
                <View key={index} style={styles.barContainer}>
                  <View style={[styles.bar, { height: data.length * 4 }]}>
                    <GradientBackground variant="pink" style={styles.barGradient} />
                  </View>
                  <Text style={styles.barLabel}>{data.month}</Text>
                </View>
              ))}
            </View>
            <View style={styles.chartYAxis}>
              <Text style={styles.axisLabel}>35</Text>
              <Text style={styles.axisLabel}>28</Text>
              <Text style={styles.axisLabel}>21</Text>
              <Text style={styles.axisLabel}>0</Text>
            </View>
          </View>
        </View>

        {/* Prediction Accuracy Card */}
        <GradientBackground variant="lavender" style={styles.accuracyCard}>
          <View style={styles.accuracyContent}>
            <View>
              <Text style={styles.accuracyTitle}>Prediction Accuracy</Text>
              <Text style={styles.accuracySubtitle}>Based on your recent data</Text>
            </View>
            <Text style={styles.accuracyPercentage}>92%</Text>
          </View>
          <View style={styles.accuracyBarBg}>
            <View style={[styles.accuracyBarFill, { width: '92%' }]} />
          </View>
        </GradientBackground>

        {/* Health Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Insights</Text>
          <View style={styles.insightItem}>
            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
              <Text style={{ fontSize: 20 }}>💧</Text>
            </View>
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Hydration Matters</Text>
              <Text style={styles.insightDesc}>Drinking more water can help reduce bloating during your period.</Text>
            </View>
          </View>
          
          <View style={styles.insightItem}>
            <View style={[styles.iconBox, { backgroundColor: '#F3E5F5' }]}>
              <Text style={{ fontSize: 20 }}>🧘</Text>
            </View>
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Gentle Movement</Text>
              <Text style={styles.insightDesc}>Yoga can help alleviate cramps and improve your mood today.</Text>
            </View>
          </View>
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
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  chartContainer: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    height: 250,
  },
  chart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  barContainer: {
    alignItems: 'center',
    width: 40,
  },
  bar: {
    width: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  barGradient: {
    flex: 1,
  },
  barLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 8,
    position: 'absolute',
    bottom: -20,
  },
  chartYAxis: {
    justifyContent: 'space-between',
    paddingBottom: 20,
    marginLeft: 10,
  },
  axisLabel: {
    ...typography.caption,
    color: colors.text.light,
    fontSize: 10,
  },
  accuracyCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
  },
  accuracyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  accuracyTitle: {
    ...typography.label,
    color: 'white',
    fontWeight: '700',
  },
  accuracySubtitle: {
    ...typography.caption,
    color: 'white',
    opacity: 0.8,
  },
  accuracyPercentage: {
    ...typography.h1,
    color: 'white',
  },
  accuracyBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  accuracyBarFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    ...typography.label,
    color: colors.text.primary,
    fontWeight: '700',
  },
  insightDesc: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
