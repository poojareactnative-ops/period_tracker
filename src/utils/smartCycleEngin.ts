type Cycle = {
  startDate: string;
  endDate?: string;
  cycleLength?: number;
};

export const calculateSmartPredictions = (cycles: Cycle[]) => {
  if (!cycles || cycles.length === 0) return null;

  // ✅ Step 1: Get valid cycle lengths
  const validCycles = cycles.filter(c => c.cycleLength && c.cycleLength > 0);

  if (validCycles.length === 0) return null;

  // ✅ Step 2: Weighted average (recent cycles matter more)
  let totalWeight = 0;
  let weightedSum = 0;

  validCycles.forEach((cycle, index) => {
    const weight = index + 1; // recent cycle = higher weight
    weightedSum += (cycle.cycleLength || 28) * weight;
    totalWeight += weight;
  });

  const avgCycleLength = Math.round(weightedSum / totalWeight);

  // ✅ Step 3: Last period start
  const lastCycle = cycles[cycles.length - 1];
  const lastStart = new Date(lastCycle.startDate);

  // ✅ Step 4: Predict next period
  const nextPeriod = new Date(lastStart);
  nextPeriod.setDate(nextPeriod.getDate() + avgCycleLength);

  // ✅ Step 5: Ovulation (~14 days before next period)
  const ovulation = new Date(nextPeriod);
  ovulation.setDate(ovulation.getDate() - 14);

  // ✅ Step 6: Fertile window (5 days before ovulation)
  const fertileStart = new Date(ovulation);
  fertileStart.setDate(fertileStart.getDate() - 5);

  // ✅ Step 7: Confidence score
  const confidence = Math.min(100, validCycles.length * 20);

  return {
    avgCycleLength,
    nextPeriodDate: nextPeriod,
    ovulationDate: ovulation,
    fertileWindow: {
      start: fertileStart,
      end: ovulation,
    },
    confidence,
  };
};