import { addDays, differenceInDays, parseISO, format, isAfter, isBefore, isSameDay } from 'date-fns';
import { Cycle } from '../store/useCycleStore';

export const calculatePredictions = (cycles: Cycle[]) => {
  if (cycles.length === 0) return null;

  // Sort cycles by date descending
  const sortedCycles = [...cycles].sort((a, b) => 
    parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime()
  );

  const lastCycle = sortedCycles[0];
  const lastStartDate = parseISO(lastCycle.startDate);

  // Calculate average length from last 3 cycles
  let avgLength = 28;
  if (sortedCycles.length >= 2) {
    const completedCycles = sortedCycles.filter(c => c.length);
    if (completedCycles.length >= 1) {
      const intervals = [];
      for (let i = 0; i < Math.min(sortedCycles.length - 1, 3); i++) {
        const current = parseISO(sortedCycles[i].startDate);
        const previous = parseISO(sortedCycles[i+1].startDate);
        intervals.push(differenceInDays(current, previous));
      }
      avgLength = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
    }
  }

  const nextPeriodDate = addDays(lastStartDate, avgLength);
  const ovulationDate = addDays(nextPeriodDate, -14);
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = addDays(ovulationDate, 1);

  return {
    nextPeriodDate,
    ovulationDate,
    fertileWindow: {
      start: fertileStart,
      end: fertileEnd
    },
    avgLength,
    currentDay: differenceInDays(new Date(), lastStartDate) + 1
  };
};

export const getStatusMessage = (predictions: any, lateEarly?: any) => {
  if (!predictions) return "Log your first period to see predictions";
  
  if (lateEarly) {
    if (lateEarly.type === 'late') return `Period is ${lateEarly.days} days late`;
    if (lateEarly.type === 'early') return `Period started ${lateEarly.days} days early`;
    if (lateEarly.type === 'on-time') return `Period started on time`;
  }

  const today = new Date();
  if (isSameDay(today, predictions.nextPeriodDate)) return "Period starts today";
  if (isBefore(today, predictions.nextPeriodDate)) {
    const daysLeft = differenceInDays(predictions.nextPeriodDate, today);
    return `Period in ${daysLeft} days`;
  }
  return "Period is late";
};

export const analyzeCyclePatterns = (cycles: Cycle[]) => {
  const completedCycles = cycles.filter(c => c.length);
  if (completedCycles.length < 2) return null;

  const lengths = completedCycles.map(c => c.length!);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  
  const variance = lengths.reduce((acc, l) => acc + Math.abs(l - avg), 0) / lengths.length;

  return {
    isIrregular: variance > 7,
    isShort: avg < 21,
    isLong: avg > 35,
    avgLength: Math.round(avg),
    variance: Math.round(variance)
  };
};

export const getHealthGuidance = (patterns: any) => {
  if (!patterns) return null;

  if (patterns.isIrregular) {
    return {
      title: "Irregular Cycle Detected",
      guidance: "Your cycle length varies significantly. This can be caused by stress, dietary changes, or conditions like PCOS.",
      action: "Track your sleep and consult a healthcare provider if this persists."
    };
  }

  if (patterns.isShort) {
    return {
      title: "Short Cycle Pattern",
      guidance: "Cycles shorter than 21 days may indicate early ovulation or a shorter luteal phase.",
      action: "Ensure you are getting enough iron and vitamin B."
    };
  }

  if (patterns.isLong) {
    return {
      title: "Long Cycle Pattern",
      guidance: "Cycles longer than 35 days can be related to hormonal imbalances or delayed ovulation.",
      action: "A check-up with a gynecologist is recommended if this is your regular pattern."
    };
  }

  return {
    title: "Healthy Rhythm",
    guidance: "Your cycles are consistent and within the typical range. Great job!",
    action: "Continue logging your daily symptoms for more precise predictions."
  };
};

export const calculateLateEarly = (prediction: any, cycles: Cycle[]) => {
  if (!prediction) return null;
  
  const today = new Date();
  const activeCycle = cycles.find(c => !c.endDate);
  
  if (activeCycle) {
    const actualStart = parseISO(activeCycle.startDate);
    const diff = differenceInDays(actualStart, prediction.nextPeriodDate);
    
    if (diff > 0) return { type: 'late', days: diff };
    if (diff < 0) return { type: 'early', days: Math.abs(diff) };
    return { type: 'on-time', days: 0 };
  }

  if (isAfter(today, prediction.nextPeriodDate)) {
    const diff = differenceInDays(today, prediction.nextPeriodDate);
    return { type: 'late', days: diff };
  }

  return null;
};
