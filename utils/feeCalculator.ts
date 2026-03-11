import { PaymentStatus, MonthlyDue } from '../types';

/**
 * Enterprise Business Rule: 
 * 1. Before Due Date: Total = Base Fee
 * 2. After Due Date but before Last Date: Total = Base Fee + (Daily Penalty * Days)
 * 3. After Last Date: Total = Base Fee + Fixed Fine Amount
 */
export const calculateCurrentLedger = (due: MonthlyDue): { lateFee: number, total: number, isFineApplied: boolean } => {
  const today = new Date();
  const dueDate = new Date(due.due_date);
  const lastDate = due.last_date ? new Date(due.last_date) : null;
  const baseFee = Number(due.amount ?? due.base_fee ?? 0);
  const discount = Number(due.discount ?? 0);
  const fineAfterDays = Math.max(0, Number(due.fine_after_days ?? 0));
  const finePerDay = Math.max(0, Number(due.fine_per_day ?? 0));
  
  if (due.status === PaymentStatus.PAID) {
    return {
      lateFee: Number(due.late_fee || 0),
      total: Number(due.total_due || baseFee),
      isFineApplied: Number(due.late_fee || 0) > 0,
    };
  }

  let lateFee = 0;
  let isFineApplied = false;

  if (today > dueDate) {
    const diffTime = Math.abs(today.getTime() - dueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const chargeableDays = Math.max(0, diffDays - fineAfterDays);
    lateFee = chargeableDays * finePerDay;
    isFineApplied = lateFee > 0;

    if (lastDate && today > lastDate && finePerDay > 0) {
      isFineApplied = true;
    }
  }

  return {
    lateFee,
    total: Math.max(0, baseFee + lateFee - discount),
    isFineApplied
  };
};

/**
 * Sequential Constraint Rule:
 * Returns true if there are NO unpaid months chronologically before the target month.
 */
export const isMonthPayable = (
  targetDue: MonthlyDue, 
  allDues: MonthlyDue[]
): boolean => {
  const previousUnpaid = allDues.find(d => {
    // Check if d is chronologically earlier than targetDue
    const isEarlier = d.year < targetDue.year || (d.year === targetDue.year && d.month < targetDue.month);
    return isEarlier && d.status !== PaymentStatus.PAID;
  });

  return !previousUnpaid;
};