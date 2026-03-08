import { MonthlyDue, PaymentStatus } from '../types';

export const isMonthPayable = (due: MonthlyDue, allDues: MonthlyDue[]) => {
  if (due.status === PaymentStatus.PAID) return false;
  
  // Find all unpaid dues before this one
  const priorUnpaid = allDues.filter(d => 
    d.status !== PaymentStatus.PAID && 
    (d.year < due.year || (d.year === due.year && d.month < due.month))
  );
  
  return priorUnpaid.length === 0;
};
