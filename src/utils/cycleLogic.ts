import { addDays, differenceInDays, parseISO, isAfter, isBefore, isSameDay } from 'date-fns';
import { Cycle } from '../store/useCycleStore';

export const calculatePredictions = (cycles: Cycle[]) => {
  const sortedCycles = [...cycles]
    .filter((cycle) => isValidDate(cycle.startDate))
    .sort((a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime());

  if (sortedCycles.length === 0) return null;

  const lastCycle = sortedCycles[0];
  const lastStartDate = parseISO(lastCycle.startDate);

  const avgLength = calculateAverageCycleLength(sortedCycles);

  const nextPeriodDate = addDays(lastStartDate, avgLength);
  const ovulationDate = addDays(nextPeriodDate, -14);
  const fertileStart = addDays(nextPeriodDate, -16);
  const fertileEnd = addDays(nextPeriodDate, -12);
  const rawCurrentDay = differenceInDays(new Date(), lastStartDate) + 1;
  const currentDay = Number.isFinite(rawCurrentDay) && rawCurrentDay > 0 ? rawCurrentDay : 1;

  return {
    nextPeriodDate,
    ovulationDate,
    fertileWindow: {
      start: fertileStart,
      end: fertileEnd
    },
    avgLength,
    currentDay
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
  if (!cycles || cycles.length === 0) {
    return {
      isIrregular: false,
      avgCycleLength: 28,
    };
  }

  const completedCycles = cycles
    .map((cycle) => cycle.cycleLength ?? cycle.length)
    .filter((length): length is number => typeof length === 'number' && length > 0);
  if (completedCycles.length < 2) return null;

  const avg = completedCycles.reduce((a, b) => a + b, 0) / completedCycles.length;

  const variance = completedCycles.reduce((acc, length) => acc + Math.abs(length - avg), 0) / completedCycles.length;

  return {
    isIrregular: variance > 7,
    isShort: avg < 21,
    isLong: avg > 35,
    avgLength: Math.round(avg),
    variance: Math.round(variance),
    avgCycleLength: 28,
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

const calculateAverageCycleLength = (sortedCycles: Cycle[]): number => {
  const explicitLengths = sortedCycles
    .map((cycle) => cycle.cycleLength ?? cycle.length)
    .filter((length): length is number => typeof length === 'number' && length > 0)
    .slice(0, 3);

  if (explicitLengths.length >= 2) {
    return Math.max(1, Math.round(explicitLengths.reduce((sum, value) => sum + value, 0) / explicitLengths.length));
  }

  const intervals: number[] = [];
  for (let index = 0; index < Math.min(sortedCycles.length - 1, 3); index += 1) {
    const current = parseISO(sortedCycles[index].startDate);
    const previous = parseISO(sortedCycles[index + 1].startDate);
    const diff = differenceInDays(current, previous);
    if (diff > 0) intervals.push(diff);
  }

  if (intervals.length === 0) return 28;
  return Math.max(1, Math.round(intervals.reduce((sum, value) => sum + value, 0) / intervals.length));
};

const isValidDate = (dateString: string): boolean => {
  const parsed = parseISO(dateString);
  return !Number.isNaN(parsed.getTime());
};
