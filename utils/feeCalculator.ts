
import { PaymentStatus } from '../types';

/**
 * Business Rule: Calculate late fee based on current date vs due date
 * Rule: ₹50 per day after a 2-day grace period, max ₹500
 */
export const calculateLateFee = (dueDateStr: string, baseFee: number): number => {
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  
  if (today <= dueDate) return 0;
  
  const diffTime = Math.abs(today.getTime() - dueDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const gracePeriod = 2;
  if (diffDays <= gracePeriod) return 0;
  
  const lateFeePerDay = 50;
  const maxLateFee = 500;
  
  const calculatedFee = (diffDays - gracePeriod) * lateFeePerDay;
  return Math.min(calculatedFee, maxLateFee);
};

/**
 * Business Rule: Check if a specific month is payable based on no-skipping rule
 */
export const isMonthPayable = (
  monthIndex: number, 
  allDues: { month: number, status: PaymentStatus }[]
): boolean => {
  const sortedDues = [...allDues].sort((a, b) => a.month - b.month);
  
  for (let i = 0; i < monthIndex; i++) {
    if (sortedDues[i] && sortedDues[i].status !== PaymentStatus.PAID) {
      return false;
    }
  }
  
  return true;
};
