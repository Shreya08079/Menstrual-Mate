export interface CycleData {
  nextPeriodDate: Date;
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  currentCycleDay: number;
  daysUntilPeriod: number;
}

export function calculateCyclePredictions(
  lastPeriodStart: Date,
  averageCycleLength: number = 28
): CycleData {
  const today = new Date();
  const timeDiff = today.getTime() - lastPeriodStart.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  
  const currentCycleDay = (daysDiff % averageCycleLength) + 1;
  
  // Calculate next period date
  const nextPeriodDate = new Date(lastPeriodStart);
  nextPeriodDate.setDate(lastPeriodStart.getDate() + averageCycleLength);
  
  // If current cycle has passed the average length, add another cycle
  if (daysDiff >= averageCycleLength) {
    const cyclesPassed = Math.floor(daysDiff / averageCycleLength);
    nextPeriodDate.setDate(lastPeriodStart.getDate() + ((cyclesPassed + 1) * averageCycleLength));
  }
  
  const daysUntilPeriod = Math.ceil((nextPeriodDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  // Calculate ovulation (typically 14 days before next period)
  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(nextPeriodDate.getDate() - 14);
  
  // Calculate fertile window (5 days before ovulation to 1 day after)
  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setDate(ovulationDate.getDate() - 5);
  
  const fertileWindowEnd = new Date(ovulationDate);
  fertileWindowEnd.setDate(ovulationDate.getDate() + 1);
  
  return {
    nextPeriodDate,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    currentCycleDay,
    daysUntilPeriod,
  };
}

export function getDayType(date: Date, cycleData: CycleData, periodDates: Date[]): string {
  const dateStr = date.toDateString();
  
  // Check if it's a period day
  if (periodDates.some(periodDate => periodDate.toDateString() === dateStr)) {
    return "period";
  }
  
  // Check if it's in fertile window
  if (date >= cycleData.fertileWindowStart && date <= cycleData.fertileWindowEnd) {
    return "fertile";
  }
  
  // Check if it's predicted period
  const nextPeriodStr = cycleData.nextPeriodDate.toDateString();
  const predictedEnd = new Date(cycleData.nextPeriodDate);
  predictedEnd.setDate(predictedEnd.getDate() + 5); // Assume 5-day period
  
  if (date >= cycleData.nextPeriodDate && date <= predictedEnd) {
    return "predicted";
  }
  
  return "normal";
}
