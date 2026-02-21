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
  const lastDate = new Date(due.last_date);
  
  if (due.status === PaymentStatus.PAID) {
    return { lateFee: due.late_fee, total: due.total_due, isFineApplied: due.late_fee >= due.fine_amount };
  }

  let lateFee = 0;
  let isFineApplied = false;

  if (today > lastDate) {
    // Hard deadline passed - Fixed Fine is applied
    lateFee = due.fine_amount || 500;
    isFineApplied = true;
  } else if (today > dueDate) {
    // Soft deadline passed - Daily penalty applies
    const diffTime = Math.abs(today.getTime() - dueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const dailyRate = 50; // Standard school policy
    lateFee = Math.min(diffDays * dailyRate, due.fine_amount || 500);
    isFineApplied = lateFee >= (due.fine_amount || 500);
  }

  return {
    lateFee,
    total: due.base_fee + lateFee - due.discount,
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