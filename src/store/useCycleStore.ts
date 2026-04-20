import { create } from 'zustand';

export interface Cycle {
  id: string;
  startDate: string; // ISO string
  endDate?: string;  // ISO string
  length?: number;   // days
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
  setCycles: (cycles: Cycle[]) => void;
  setLogs: (logs: DailyLog[]) => void;
  addCycle: (cycle: Cycle) => void;
  addLog: (log: DailyLog) => void;
  startPeriod: (date: string) => void;
  endPeriod: (date: string) => void;
}

export const useCycleStore = create<CycleState>((set) => ({
  cycles: [],
  logs: [],
  avgCycleLength: 28,
  avgPeriodDuration: 5,
  setCycles: (cycles) => set({ cycles, avgCycleLength: calculateAvgLength(cycles) }),
  setLogs: (logs) => set({ logs }),
  addCycle: (cycle) => set((state) => {
    const newCycles = [...state.cycles, cycle];
    return { cycles: newCycles, avgCycleLength: calculateAvgLength(newCycles) };
  }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  
  startPeriod: (date) => set((state) => {
    const existingCycle = state.cycles.find(c => !c.endDate);
    if (existingCycle) return state; // Already has an active cycle

    const newCycle: Cycle = {
      id: Date.now().toString(),
      startDate: date,
    };
    const newCycles = [...state.cycles, newCycle];
    return { 
      cycles: newCycles, 
      avgCycleLength: calculateAvgLength(newCycles) 
    };
  }),

  endPeriod: (date) => set((state) => {
    const cycles = [...state.cycles];
    const activeIndex = cycles.findIndex(c => !c.endDate);
    if (activeIndex === -1) return state;

    cycles[activeIndex] = {
      ...cycles[activeIndex],
      endDate: date,
      length: calculateCycleLength(cycles[activeIndex].startDate, date)
    };

    return { 
      cycles, 
      avgPeriodDuration: calculateAvgDuration(cycles) 
    };
  }),
}));

function calculateCycleLength(start: string, end: string): number {
  const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function calculateAvgLength(cycles: Cycle[]): number {
  const completedCycles = cycles.filter(c => c.length);
  if (completedCycles.length === 0) return 28;
  
  const sum = completedCycles.reduce((acc, c) => acc + (c.length || 28), 0);
  return Math.round(sum / completedCycles.length);
}

function calculateAvgDuration(cycles: Cycle[]): number {
  const completedCycles = cycles.filter(c => c.endDate);
  if (completedCycles.length === 0) return 5;
  
  const durations = completedCycles.map(c => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate!);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  });

  const sum = durations.reduce((acc, d) => acc + d, 0);
  return Math.round(sum / durations.length);
}
