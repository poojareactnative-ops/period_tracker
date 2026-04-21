import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { Cycle, DailyLog } from '../store/useCycleStore';
import { calculatePredictions } from '../utils/cycleLogic';

const firebaseConfig = {
  apiKey: 'AIzaSyBpw8laS02ksvFak_hR7bIFGlhm97ZlYA4',
  authDomain: 'periodtracker-39e63.firebaseapp.com',
  projectId: 'periodtracker-39e63',
  storageBucket: 'periodtracker-39e63.appspot.com',
  messagingSenderId: '1054162026875',
  appId: '1:1054162026875:android:51729f06abac127f0abdde',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const createCycleForUser = async (userId: string, cycle: Cycle): Promise<void> => {
  if (!userId || !cycle.id || !cycle.startDate) return;

  await setDoc(doc(db, 'users', userId, 'cycles', cycle.id), {
    startDate: cycle.startDate,
    endDate: cycle.endDate ?? '',
    cycleLength: toSafeNumber(cycle.cycleLength ?? cycle.length),
    periodLength: toSafeNumber(cycle.periodLength),
    createdAt: serverTimestamp(),
  });
};

export const updateCycleForUser = async (
  userId: string,
  cycleId: string,
  updates: Partial<Pick<Cycle, 'endDate' | 'cycleLength' | 'periodLength'>>
): Promise<void> => {
  if (!userId || !cycleId) return;

  const payload: Record<string, string | number> = {};

  if (typeof updates.endDate === 'string') {
    payload.endDate = updates.endDate;
  }

  if (typeof updates.cycleLength === 'number' && updates.cycleLength > 0) {
    payload.cycleLength = updates.cycleLength;
  }

  if (typeof updates.periodLength === 'number' && updates.periodLength > 0) {
    payload.periodLength = updates.periodLength;
  }

  if (Object.keys(payload).length === 0) return;

  await setDoc(doc(db, 'users', userId, 'cycles', cycleId), payload, { merge: true });
};

export const fetchCyclesForUser = async (userId: string): Promise<Cycle[]> => {
  if (!userId) return [];

  const cyclesRef = collection(db, 'users', userId, 'cycles');
  const snapshot = await getDocs(query(cyclesRef, orderBy('startDate', 'asc')));
  const cycles: Cycle[] = [];

  snapshot.docs.forEach((docSnapshot) => {
    const data = docSnapshot.data() as {
      startDate?: string;
      endDate?: string;
      cycleLength?: number;
      periodLength?: number;
      createdAt?: { toDate?: () => Date };
    };

    if (!data.startDate) return;

    const cycleLength = toOptionalPositiveNumber(data.cycleLength);
    const periodLength = toOptionalPositiveNumber(data.periodLength);

    cycles.push({
      id: docSnapshot.id,
      startDate: data.startDate,
      endDate: data.endDate || undefined,
      cycleLength,
      length: cycleLength,
      periodLength,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined,
    });
  });

  return cycles;
};

export const createLogForUser = async (
  userId: string,
  log: Omit<DailyLog, 'id'>
): Promise<void> => {
  if (!userId || !log.date) return;

  await addDoc(collection(db, 'users', userId, 'logs'), {
    date: log.date,
    mood: log.mood,
    symptoms: Array.isArray(log.symptoms) ? log.symptoms : [],
    notes: log.notes ?? '',
    createdAt: serverTimestamp(),
  });
};

export const fetchLogsForUser = async (userId: string): Promise<DailyLog[]> => {
  if (!userId) return [];

  const logsRef = collection(db, 'users', userId, 'logs');
  const snapshot = await getDocs(query(logsRef, orderBy('date', 'desc')));
  const logs: DailyLog[] = [];

  snapshot.docs.forEach((docSnapshot) => {
    const data = docSnapshot.data() as {
      date?: string;
      mood?: string;
      symptoms?: string[];
      notes?: string;
    };

    if (!data.date) return;

    logs.push({
      id: docSnapshot.id,
      date: data.date,
      mood: data.mood ?? 'calm',
      symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
      notes: data.notes ?? '',
    });
  });

  return logs;
};

export const upsertCycleSummaryForUser = async (userId: string, cycles: Cycle[]): Promise<void> => {
  if (!userId) return;

  const sortedCycles = [...cycles]
    .filter((cycle) => Boolean(cycle.startDate))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const currentCycle = sortedCycles.length > 0 ? sortedCycles[sortedCycles.length - 1] : null;
  const previousCycle = sortedCycles.length > 1 ? sortedCycles[sortedCycles.length - 2] : null;
  const predictions = calculatePredictions(sortedCycles);

  await setDoc(
    doc(db, 'users', userId),
    {
      cycleSummary: {
        previousPeriodStartDate: previousCycle?.startDate ?? '',
        previousPeriodEndDate: previousCycle?.endDate ?? '',
        currentPeriodStartDate: currentCycle?.startDate ?? '',
        currentPeriodEndDate: currentCycle?.endDate ?? '',
        lastPeriodDate: currentCycle?.startDate ?? previousCycle?.startDate ?? '',
        nextPredictedPeriod: predictions ? formatDate(predictions.nextPeriodDate) : '',
        fertileStart: predictions ? formatDate(predictions.fertileWindow.start) : '',
        fertileEnd: predictions ? formatDate(predictions.fertileWindow.end) : '',
        avgCycleLength: predictions?.avgLength ?? 28,
        updatedAt: serverTimestamp(),
      },
    },
    { merge: true }
  );
};

function toSafeNumber(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) return 0;
  return Math.round(value);
}

function toOptionalPositiveNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) return undefined;
  return Math.round(value);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default app;
