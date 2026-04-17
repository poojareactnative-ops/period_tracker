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
    const intervals = [];
    for (let i = 0; i < Math.min(sortedCycles.length - 1, 3); i++) {
      const current = parseISO(sortedCycles[i].startDate);
      const previous = parseISO(sortedCycles[i+1].startDate);
      intervals.push(differenceInDays(current, previous));
    }
    avgLength = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
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

export const getStatusMessage = (predictions: any) => {
  if (!predictions) return "Log your first period to see predictions";
  
  const today = new Date();
  if (isSameDay(today, predictions.nextPeriodDate)) return "Period starts today";
  if (isBefore(today, predictions.nextPeriodDate)) {
    const daysLeft = differenceInDays(predictions.nextPeriodDate, today);
    return `Period in ${daysLeft} days`;
  }
  return "Period is late";
};
