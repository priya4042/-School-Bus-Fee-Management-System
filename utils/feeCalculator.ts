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
  /** Total discount applied to this bundle (sibling + annual prepay combined). */
  totalDiscount: number;
  /** Sub-total before discount. */
  subtotal: number;
  /** True if sibling discount was applied (child is 2nd, 3rd...). */
  isSiblingDiscount: boolean;
  /** True if annual pre-pay discount was applied (≥ 8 months bundled). */
  isAnnualPrepayDiscount: boolean;
  hasArrears: boolean;
  firstMonthLabel: string;
  targetMonthLabel: string;
  explanation: string;
}

/**
 * Discount inputs sourced from payment_settings + the parent's child order.
 */
export interface DiscountConfig {
  /** Set when this child is NOT the parent's first child (oldest by created_at).
   *  Sibling discount % from payment_settings is then applied to this bundle. */
  siblingDiscountPercent?: number;
  /** Annual pre-pay discount %. Triggered when bundle covers ≥ 8 months. */
  annualPrepayDiscountPercent?: number;
}

const ANNUAL_PREPAY_MIN_MONTHS = 8;

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
  referenceDate: Date = new Date(),
  discountConfig: DiscountConfig = {},
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
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const hasArrears = items.length > 1;
  const firstMonthLabel = items[0]?.label || getMonthLabel(targetDue);
  const targetMonthLabel = getMonthLabel(targetDue);

  // Apply discounts on top of the calculated subtotal.
  // Sibling discount fires for any non-first child of the parent.
  // Annual pre-pay fires when bundle includes >= ANNUAL_PREPAY_MIN_MONTHS months.
  const siblingPct = Math.max(0, Number(discountConfig.siblingDiscountPercent || 0));
  const annualPct = Math.max(0, Number(discountConfig.annualPrepayDiscountPercent || 0));
  const isSiblingDiscount = siblingPct > 0;
  const isAnnualPrepayDiscount = annualPct > 0 && items.length >= ANNUAL_PREPAY_MIN_MONTHS;

  let totalDiscount = 0;
  if (isSiblingDiscount) totalDiscount += Math.round((subtotal * siblingPct) / 100);
  if (isAnnualPrepayDiscount) {
    // Annual pre-pay applies on the post-sibling-discount amount
    const afterSibling = Math.max(0, subtotal - totalDiscount);
    totalDiscount += Math.round((afterSibling * annualPct) / 100);
  }
  const finalAmount = Math.max(0, subtotal - totalDiscount);

  let explanation = `Paying ${targetMonthLabel} settles ${items.length} month${items.length > 1 ? 's' : ''} from ${firstMonthLabel} to ${targetMonthLabel}.`;
  if (hasArrears && totalLateFee > 0) {
    explanation += ' The amount is higher because previous unpaid months and overdue late fees are included together.';
  } else if (hasArrears) {
    explanation += ' The amount is higher because previous unpaid months are included together.';
  } else if (totalLateFee > 0) {
    explanation += ' The amount is higher because late fee is applied for overdue days.';
  }
  if (isSiblingDiscount && isAnnualPrepayDiscount) {
    explanation += ` Sibling discount ${siblingPct}% and annual pre-pay discount ${annualPct}% applied — you save ₹${totalDiscount.toLocaleString('en-IN')}.`;
  } else if (isSiblingDiscount) {
    explanation += ` Sibling discount ${siblingPct}% applied — you save ₹${totalDiscount.toLocaleString('en-IN')}.`;
  } else if (isAnnualPrepayDiscount) {
    explanation += ` Annual pre-pay discount ${annualPct}% applied — you save ₹${totalDiscount.toLocaleString('en-IN')}.`;
  }

  return {
    dueIds: items.map((item) => item.dueId),
    amount: finalAmount,
    monthsCount: items.length,
    items,
    totalBaseAmount,
    totalLateFee,
    subtotal,
    totalDiscount,
    isSiblingDiscount,
    isAnnualPrepayDiscount,
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