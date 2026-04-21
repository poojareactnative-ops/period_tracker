// utils/advancedInsights.ts

// utils/types.ts

export type CyclePatterns = {
  isIrregular: boolean;
  avgCycleLength: number;
};

type Insight = {
  id: string;
  icon: 'alert' | 'zap' | 'moon' | 'droplet' | 'activity';
  title: string;
  description: string;
  tip: string;
  color: string;
};
export const generateAdvancedInsights = (patterns: CyclePatterns | null): Insight[] => {
  const insights: Insight[] = [];

  if (!patterns) {
    return [
      {
        id: 'no-data',
        icon: 'activity',
        title: 'Start Tracking Your Cycle',
        description: 'Log a few cycles to unlock personalized insights.',
        tip: 'Add your period dates regularly.',
        color: '#E3F2FD',
      },
    ];
  }

  const avg = patterns.avgCycleLength ?? 28;

  if (patterns.isIrregular) {
    insights.push({
      id: 'cycle-irregular',
      icon: 'alert',
      title: 'Irregular Cycle Detected',
      description:
        'Your cycle length varies significantly. This can be due to stress or lifestyle changes.',
      tip: 'Maintain consistent sleep and track stress levels.',
      color: '#FFF3E0',
    });
  }

  if (avg < 24) {
    insights.push({
      id: 'short-cycle',
      icon: 'zap',
      title: 'Short Cycle Pattern',
      description: 'Your cycle is shorter than average.',
      tip: 'Track ovulation closely.',
      color: '#E3F2FD',
    });
  }

  if (avg > 32) {
    insights.push({
      id: 'long-cycle',
      icon: 'moon',
      title: 'Long Cycle Pattern',
      description: 'Your cycle is longer than average.',
      tip: 'Monitor cycle consistency.',
      color: '#F3E5F5',
    });
  }

  // always show
  insights.push(
    {
      id: 'hydration',
      icon: 'droplet',
      title: 'Stay Hydrated',
      description: 'Proper hydration helps reduce cramps.',
      tip: 'Drink 2–3L water daily.',
      color: '#E1F5FE',
    },
    {
      id: 'exercise',
      icon: 'activity',
      title: 'Light Exercise Helps',
      description: 'Movement improves mood and reduces discomfort.',
      tip: 'Try yoga or walking.',
      color: '#E8F5E9',
    }
  );

  return insights;
};