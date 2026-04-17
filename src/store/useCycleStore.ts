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
}

export const useCycleStore = create<CycleState>((set) => ({
  cycles: [],
  logs: [],
  avgCycleLength: 28, // default
  avgPeriodDuration: 5, // default
  setCycles: (cycles) => set({ cycles, avgCycleLength: calculateAvgLength(cycles) }),
  setLogs: (logs) => set({ logs }),
  addCycle: (cycle) => set((state) => {
    const newCycles = [...state.cycles, cycle];
    return { cycles: newCycles, avgCycleLength: calculateAvgLength(newCycles) };
  }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
}));

function calculateAvgLength(cycles: Cycle[]): number {
  if (cycles.length < 2) return 28;
  // Simplified calculation for demo
  return 28; 
}
