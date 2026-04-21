import { create } from 'zustand';

export interface Cycle {
  id: string;
  startDate: string; // ISO string
  endDate?: string;  // ISO string
  length?: number;   // legacy alias for cycleLength (days)
  cycleLength?: number; // days between previous cycle start and this cycle start
  periodLength?: number; // days between current cycle start and end
  createdAt?: string;
}

export interface DailyLog {
  id: string;
  date: string; // ISO string (YYYY-MM-DD)
  mood: string;
  symptoms: string[];
  notes: string;
}

interface CycleState {
  cycles: Cycle[];
  logs: DailyLog[];
  avgCycleLength: number;
  avgPeriodDuration: number;
  previousPeriodStartDate: string | null;
  previousPeriodEndDate: string | null;
  currentPeriodStartDate: string | null;
  currentPeriodEndDate: string | null;
  setCycles: (cycles: Cycle[]) => void;
  setLogs: (logs: DailyLog[]) => void;
  addCycle: (cycle: Cycle) => void;
  addLog: (log: DailyLog) => void;
  startPeriod: (date: string) => Cycle | null;
  endPeriod: (date: string) => Cycle | null;
}

export const useCycleStore = create<CycleState>((set) => ({
  cycles: [],
  logs: [],
  avgCycleLength: 28,
  avgPeriodDuration: 5,
  previousPeriodStartDate: null,
  previousPeriodEndDate: null,
  currentPeriodStartDate: null,
  currentPeriodEndDate: null,
  setCycles: (cycles) => {
    const normalizedCycles = cycles.map(normalizeCycle);
    const periodMarkers = derivePeriodMarkers(normalizedCycles);

    set({
      cycles: normalizedCycles,
      avgCycleLength: calculateAvgCycleLength(normalizedCycles),
      avgPeriodDuration: calculateAvgDuration(normalizedCycles),
      ...periodMarkers,
    });
  },
  setLogs: (logs) => set({ logs }),
  addCycle: (cycle) => set((state) => {
    const normalizedCycle = normalizeCycle(cycle);
    const newCycles = [...state.cycles, normalizedCycle];
    const periodMarkers = derivePeriodMarkers(newCycles);

    return {
      cycles: newCycles,
      avgCycleLength: calculateAvgCycleLength(newCycles),
      avgPeriodDuration: calculateAvgDuration(newCycles),
      ...periodMarkers,
    };
  }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  
  startPeriod: (date) => {
    let createdCycle: Cycle | null = null;

    set((state) => {
      if (!isValidDateString(date)) return state;

      const existingCycle = state.cycles.find((cycle) => !cycle.endDate);
      if (existingCycle) return state; // Already has an active cycle

      const previousCycle = getMostRecentCycle(state.cycles);
      const cycleLength = previousCycle
        ? calculateCycleLengthBetweenStarts(previousCycle.startDate, date)
        : undefined;

      const safeCycleLength =
        typeof cycleLength === 'number' && cycleLength > 0 ? cycleLength : undefined;

      createdCycle = normalizeCycle({
        id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        startDate: date,
        cycleLength: safeCycleLength,
        length: safeCycleLength,
        createdAt: new Date().toISOString(),
      });

      const newCycles = [...state.cycles, createdCycle];
      const periodMarkers = derivePeriodMarkers(newCycles);

      return {
        cycles: newCycles,
        avgCycleLength: calculateAvgCycleLength(newCycles),
        ...periodMarkers,
      };
    });

    return createdCycle;
  },

  endPeriod: (date) => {
    let updatedCycle: Cycle | null = null;

    set((state) => {
      if (!isValidDateString(date)) return state;

      const cycles = [...state.cycles];
      const activeIndex = cycles.findIndex((cycle) => !cycle.endDate);
      if (activeIndex === -1) return state;

      const activeCycle = cycles[activeIndex];
      const periodLength = calculatePeriodLengthInclusive(activeCycle.startDate, date);

      if (!periodLength || periodLength <= 0) return state;

      updatedCycle = normalizeCycle({
        ...activeCycle,
        endDate: date,
        periodLength,
      });

      cycles[activeIndex] = updatedCycle;
      const periodMarkers = derivePeriodMarkers(cycles);

      return {
        cycles,
        avgPeriodDuration: calculateAvgDuration(cycles),
        ...periodMarkers,
      };
    });

    return updatedCycle;
  },
}));

function normalizeCycle(cycle: Cycle): Cycle {
  const cycleLength = cycle.cycleLength ?? cycle.length;
  return {
    ...cycle,
    cycleLength,
    length: cycleLength,
  };
}

function derivePeriodMarkers(cycles: Cycle[]) {
  if (cycles.length === 0) {
    return {
      previousPeriodStartDate: null,
      previousPeriodEndDate: null,
      currentPeriodStartDate: null,
      currentPeriodEndDate: null,
    };
  }

  const sorted = [...cycles].sort(
    (a, b) => toDate(a.startDate).getTime() - toDate(b.startDate).getTime()
  );

  const current = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  return {
    previousPeriodStartDate: previous?.startDate ?? null,
    previousPeriodEndDate: previous?.endDate ?? null,
    currentPeriodStartDate: current?.startDate ?? null,
    currentPeriodEndDate: current?.endDate ?? null,
  };
}

function calculateAvgCycleLength(cycles: Cycle[]): number {
  const cycleLengths = cycles
    .map((cycle) => cycle.cycleLength ?? cycle.length)
    .filter((length): length is number => typeof length === 'number' && length > 0);

  if (cycleLengths.length > 0) {
    const sum = cycleLengths.reduce((acc, value) => acc + value, 0);
    return Math.round(sum / cycleLengths.length);
  }

  if (cycles.length < 2) return 28;

  const sorted = [...cycles].sort(
    (a, b) => toDate(a.startDate).getTime() - toDate(b.startDate).getTime()
  );
  const intervals: number[] = [];

  for (let index = 1; index < sorted.length; index += 1) {
    const diff = calculateCycleLengthBetweenStarts(sorted[index - 1].startDate, sorted[index].startDate);
    if (diff && diff > 0) intervals.push(diff);
  }

  if (intervals.length === 0) return 28;
  const sum = intervals.reduce((acc, value) => acc + value, 0);
  return Math.round(sum / intervals.length);
}

function calculateAvgDuration(cycles: Cycle[]): number {
  const completedCycles = cycles.filter((cycle) => Boolean(cycle.endDate));
  if (completedCycles.length === 0) return 5;

  const durations = completedCycles
    .map((cycle) =>
      cycle.periodLength ??
      (cycle.endDate ? calculatePeriodLengthInclusive(cycle.startDate, cycle.endDate) : undefined)
    )
    .filter((duration): duration is number => typeof duration === 'number' && duration > 0);

  if (durations.length === 0) return 5;

  const sum = durations.reduce((acc, d) => acc + d, 0);
  return Math.round(sum / durations.length);
}

function calculateCycleLengthBetweenStarts(start: string, end: string): number | undefined {
  if (!isValidDateString(start) || !isValidDateString(end)) return undefined;

  const startDate = toDate(start);
  const endDate = toDate(end);

  if (endDate < startDate) return undefined;

  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : undefined;
}

function calculatePeriodLengthInclusive(start: string, end: string): number | undefined {
  if (!isValidDateString(start) || !isValidDateString(end)) return undefined;

  const startDate = toDate(start);
  const endDate = toDate(end);

  if (endDate < startDate) return undefined;

  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function isValidDateString(value: string): boolean {
  if (!value) return false;
  const date = toDate(value);
  return !Number.isNaN(date.getTime());
}

function toDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function getMostRecentCycle(cycles: Cycle[]): Cycle | null {
  if (cycles.length === 0) return null;
  const sorted = [...cycles].sort(
    (a, b) => toDate(a.startDate).getTime() - toDate(b.startDate).getTime()
  );
  return sorted[sorted.length - 1];
}
