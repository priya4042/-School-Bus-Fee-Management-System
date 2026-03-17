import { MONTHS } from '../constants';
import { PaymentStatus, MonthlyDue } from '../types';

export interface PaymentBundleItem {
  dueId: string;
  month: number;
  year: number;
  label: string;
  dueDate: string;
  lastDate?: string;
  baseAmount: number;
  lateFee: number;
  total: number;
  isOverdue: boolean;
  reason: string;
}

export interface PaymentBundle {
  dueIds: string[];
  amount: number;
  monthsCount: number;
  items: PaymentBundleItem[];
  totalBaseAmount: number;
  totalLateFee: number;
  hasArrears: boolean;
  firstMonthLabel: string;
  targetMonthLabel: string;
  explanation: string;
}

const toPeriod = (due: MonthlyDue) => Number(due.year || 0) * 12 + Number(due.month || 0);

const getMonthLabel = (due: MonthlyDue) => `${MONTHS[Math.max(0, Number(due.month || 1) - 1)] || 'Month'} ${due.year}`;

/**
 * Enterprise Business Rule: 
 * 1. Before Due Date: Total = Base Fee
 * 2. After Due Date but before Last Date: Total = Base Fee + (Daily Penalty * Days)
 * 3. After Last Date: Total = Base Fee + Fixed Fine Amount
 */
export const calculateCurrentLedger = (due: MonthlyDue, referenceDate: Date = new Date()): { lateFee: number, total: number, isFineApplied: boolean } => {
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

  if (referenceDate > dueDate) {
    const diffTime = Math.abs(referenceDate.getTime() - dueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const chargeableDays = Math.max(0, diffDays - fineAfterDays);
    lateFee = chargeableDays * finePerDay;
    isFineApplied = lateFee > 0;

    if (lastDate && referenceDate > lastDate && finePerDay > 0) {
      isFineApplied = true;
    }
  }

  return {
    lateFee,
    total: Math.max(0, baseFee + lateFee - discount),
    isFineApplied
  };
};

export const buildPaymentBundle = (
  targetDue: MonthlyDue,
  allDues: MonthlyDue[],
  referenceDate: Date = new Date()
): PaymentBundle => {
  const studentDueRows = allDues
    .filter((due) => String(due.student_id) === String(targetDue.student_id))
    .sort((left, right) => toPeriod(left) - toPeriod(right));

  const targetPeriod = toPeriod(targetDue);
  const unpaidRows = studentDueRows.filter((due) => due.status !== PaymentStatus.PAID);
  const firstRelevantDue = unpaidRows.find((due) => toPeriod(due) <= targetPeriod) || targetDue;

  const bundleRows = studentDueRows.filter((due) => {
    if (due.status === PaymentStatus.PAID) return false;
    const period = toPeriod(due);
    return period >= toPeriod(firstRelevantDue) && period <= targetPeriod;
  });

  const finalRows = bundleRows.length > 0 ? bundleRows : [targetDue];
  const items = finalRows.map((due) => {
    const ledger = calculateCurrentLedger(due, referenceDate);
    const period = toPeriod(due);
    const isTargetMonth = period === targetPeriod;
    const isOverdue = due.status !== PaymentStatus.PAID && referenceDate > new Date(due.due_date);

    let reason = isTargetMonth ? 'Selected payment month.' : 'Included because earlier unpaid months must be cleared first.';
    if (ledger.lateFee > 0) {
      reason = `${reason} Late fee is added because this month is overdue.`;
    }

    return {
      dueId: String(due.id),
      month: Number(due.month || 0),
      year: Number(due.year || 0),
      label: getMonthLabel(due),
      dueDate: due.due_date,
      lastDate: due.last_date,
      baseAmount: Math.max(0, Number(due.amount ?? due.base_fee ?? 0) - Number(due.discount ?? 0)),
      lateFee: ledger.lateFee,
      total: ledger.total,
      isOverdue,
      reason,
    };
  });

  const totalBaseAmount = items.reduce((sum, item) => sum + item.baseAmount, 0);
  const totalLateFee = items.reduce((sum, item) => sum + item.lateFee, 0);
  const hasArrears = items.length > 1;
  const firstMonthLabel = items[0]?.label || getMonthLabel(targetDue);
  const targetMonthLabel = getMonthLabel(targetDue);

  let explanation = `Paying ${targetMonthLabel} settles ${items.length} month${items.length > 1 ? 's' : ''} from ${firstMonthLabel} to ${targetMonthLabel}.`;
  if (hasArrears && totalLateFee > 0) {
    explanation += ' The amount is higher because previous unpaid months and overdue late fees are included together.';
  } else if (hasArrears) {
    explanation += ' The amount is higher because previous unpaid months are included together.';
  } else if (totalLateFee > 0) {
    explanation += ' The amount is higher because late fee is applied for overdue days.';
  }

  return {
    dueIds: items.map((item) => item.dueId),
    amount: items.reduce((sum, item) => sum + item.total, 0),
    monthsCount: items.length,
    items,
    totalBaseAmount,
    totalLateFee,
    hasArrears,
    firstMonthLabel,
    targetMonthLabel,
    explanation,
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