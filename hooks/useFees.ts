
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PaymentTelemetry } from '../lib/telemetry';
import { MonthlyDue, Defaulter, PaymentStatus } from '../types';
import { MONTHS } from '../constants';

const DAY_MS = 24 * 60 * 60 * 1000;

const getDayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const calculateDueLedger = (due: any) => {
  const today = getDayStart(new Date());
  const dueDate = due?.due_date ? getDayStart(new Date(due.due_date)) : null;

  const baseAmount = Number(due?.amount ?? due?.base_fee ?? 0);
  const graceDays = Math.max(0, Number(due?.fine_after_days ?? 0));
  const dailyFine = Math.max(0, Number(due?.fine_per_day ?? 0));

  if (due?.status === PaymentStatus.PAID) {
    const paidLateFee = Number(due?.late_fee || 0);
    return {
      late_fee: paidLateFee,
      total_due: baseAmount + paidLateFee,
      status: PaymentStatus.PAID,
      isOverdue: false,
      daysLate: 0,
    };
  }

  if (!dueDate || today <= dueDate) {
    return {
      late_fee: 0,
      total_due: baseAmount,
      status: PaymentStatus.PENDING,
      isOverdue: false,
      daysLate: 0,
    };
  }

  const totalLateDays = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / DAY_MS));
  const chargeableDays = Math.max(0, totalLateDays - graceDays);
  const lateFee = chargeableDays * dailyFine;

  return {
    late_fee: lateFee,
    total_due: baseAmount + lateFee,
    status: PaymentStatus.OVERDUE,
    isOverdue: true,
    daysLate: totalLateDays,
  };
};

export const useFees = () => {
  const [dues, setDues] = useState<MonthlyDue[]>([]);
  const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDues = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('monthly_dues')
        .select('*, students(full_name, admission_number, grade, section)')
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      if (error) throw error;

      const sourceDues = data || [];
      const normalizedDues = sourceDues.map((due: any) => {
        const ledger = calculateDueLedger(due);
        return {
          ...due,
          late_fee: ledger.late_fee,
          total_due: ledger.total_due,
          status: ledger.status,
        };
      });

      const updates = normalizedDues
        .filter((due: any) => {
          const original = sourceDues.find((item: any) => item.id === due.id);
          if (!original) return false;
          return Number(original.late_fee || 0) !== Number(due.late_fee || 0)
            || String(original.status || '') !== String(due.status || '')
            || Number(original.total_due || 0) !== Number(due.total_due || 0);
        })
        .map(async (due: any) => {
          const primaryPayload: any = {
            late_fee: due.late_fee,
            status: due.status,
            total_due: due.total_due,
          };

          const { error: updateError } = await supabase
            .from('monthly_dues')
            .update(primaryPayload)
            .eq('id', due.id);

          if (updateError) {
            await supabase
              .from('monthly_dues')
              .update({ late_fee: due.late_fee, status: due.status } as any)
              .eq('id', due.id);
          }
        });

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      setDues(normalizedDues as any);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dues');
    } finally {
      setLoading(false);
    }
  };

  const recordManualPayment = async (dueId: string | number, amount: number, studentName: string, _monthYear: string, method: string, reference?: string) => {
    try {
      const txnId = reference || (method === 'Cash' ? 'CASH-' : 'TXN-') + Math.random().toString(36).substring(2, 11).toUpperCase();
      const { error } = await supabase
        .from('monthly_dues')
        .update({
          status: PaymentStatus.PAID,
          transaction_id: txnId,
          paid_at: new Date().toISOString(),
          payment_method: method,
        })
        .eq('id', String(dueId));
      if (error) throw error;
      PaymentTelemetry.notifyPayment(studentName, amount, txnId);
      await fetchDues();
      return true;
    } catch (err) {
      console.error('Manual payment recording failed', err);
      return false;
    }
  };

  const fetchDefaulters = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const { data, error } = await supabase
        .from('monthly_dues')
        .select('*, students(full_name, admission_number, grade, section)')
        .eq('status', 'PENDING')
        .or(`year.lt.${currentYear},and(year.eq.${currentYear},month.lt.${currentMonth})`)
        .order('year', { ascending: true })
        .order('month', { ascending: true });
      if (error) throw error;
      setDefaulters(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch defaulters');
    } finally {
      setLoading(false);
    }
  };

  const createFee = async (feeData: Partial<MonthlyDue>) => {
    try {
      const amount = Number(feeData.amount || 0);
      
      // Build payload with only valid database fields
      const payload: any = {
        student_id: feeData.student_id,
        month: Number(feeData.month || new Date().getMonth() + 1),
        year: Number(feeData.year || new Date().getFullYear()),
        amount,
        late_fee: Number(feeData.late_fee || 0),
        due_date: feeData.due_date || new Date().toISOString().split('T')[0],
        last_date: feeData.last_date || new Date().toISOString().split('T')[0],
        fine_after_days: Number(feeData.fine_after_days ?? 5),
        fine_per_day: Number(feeData.fine_per_day ?? 50),
        status: 'PENDING',
      };
      
      // Validate required fields
      if (!payload.student_id) throw new Error('Student ID is required');
      if (!payload.due_date) throw new Error('Due date is required');
      if (payload.amount <= 0) throw new Error('Amount must be greater than 0');
      
      const { error } = await supabase.from('monthly_dues').insert(payload);
      if (error) {
        if (error.message?.includes('duplicate') || error.message?.includes('UNIQUE')) {
          throw new Error(`Fee already exists for this student in ${MONTHS[payload.month - 1]} ${payload.year}. Edit existing fee instead.`);
        }
        console.error('[Fee Creation Error]', error);
        throw error;
      }
      await fetchDues();
      return true;
    } catch (err: any) {
      console.error('[createFee] Error:', err.message || err);
      return false;
    }
  };

  const updateFee = async (id: string, feeData: Partial<MonthlyDue>) => {
    try {
      const amount = Number(feeData.amount || 0);
      
      // Build payload with only valid database fields for updating
      const payload: any = {
        amount,
        due_date: feeData.due_date,
        last_date: feeData.last_date,
        fine_after_days: Number(feeData.fine_after_days ?? 5),
        fine_per_day: Number(feeData.fine_per_day ?? 50),
      };

      if (feeData.status && feeData.status !== PaymentStatus.PAID) {
        payload.status = feeData.status;
        payload.late_fee = 0;
      }

      const { error } = await supabase.from('monthly_dues').update(payload).eq('id', id);
      if (error) {
        console.error('[Fee Update Error]', error);
        throw error;
      }
      await fetchDues();
      return true;
    } catch (err: any) {
      console.error('[updateFee] Error:', err.message || err);
      return false;
    }
  };

  const deleteFee = async (id: string) => {
    try {
      const { error } = await supabase.from('monthly_dues').delete().eq('id', id);
      if (error) throw error;
      await fetchDues();
      return true;
    } catch (err) {
      return false;
    }
  };

  const generateMonthlyBills = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const { data: students, error: sErr } = await supabase
        .from('students')
        .select('id, monthly_fee, base_fee')
        .eq('status', 'active');
      if (sErr) throw sErr;

      const { data: existing } = await supabase
        .from('monthly_dues')
        .select('student_id')
        .eq('month', month)
        .eq('year', year);
      const existingIds = new Set((existing || []).map((d: any) => d.student_id));

      const newDues = (students || [])
        .filter(s => !existingIds.has(s.id))
        .map(s => {
          const base = s.monthly_fee || s.base_fee || 0;
          return { student_id: s.id, month, year, amount: base, total_due: base, status: 'PENDING', late_fee: 0 };
        });

      if (newDues.length > 0) {
        const { error } = await supabase.from('monthly_dues').insert(newDues);
        if (error) throw error;
      }

      await fetchDues();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to generate bills');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const waiveLateFee = async (dueId: string | number) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const adminUserId = authData?.user?.id || null;

      const { data: due } = await supabase
        .from('monthly_dues')
        .select('id, month, year, amount, late_fee, student_id, students(parent_id, full_name)')
        .eq('id', String(dueId))
        .single();

      if (!due) {
        throw new Error('Due record not found');
      }

      const studentInfo = Array.isArray((due as any).students)
        ? (due as any).students[0]
        : (due as any).students;

      const waivedAmount = Number(due.late_fee || 0);
      const waivedAt = new Date().toISOString();

      const { error } = await supabase
        .from('monthly_dues')
        .update({ late_fee: 0, total_due: due?.amount || 0 })
        .eq('id', String(dueId));
      if (error) throw error;

      if (studentInfo?.parent_id && waivedAmount > 0) {
        await supabase
          .from('notifications')
          .insert({
            user_id: studentInfo.parent_id,
            title: 'Late Fee Waiver Approved',
            message: `Admin approved your waiver request for ${studentInfo?.full_name || 'student'} (${due?.month}/${due?.year}). Late fee of ₹${waivedAmount.toLocaleString('en-IN')} has been removed.`,
            type: 'SUCCESS',
            is_read: false,
          } as any);
      }

      const auditNote = `LATE_FEE_WAIVED by ${adminUserId || 'unknown_admin'} at ${waivedAt}; waived_amount=${waivedAmount}`;

      const { error: waiverLogError } = await supabase
        .from('waiver_requests')
        .insert({
          due_id: String(dueId),
          parent_id: studentInfo?.parent_id || null,
          reason: 'ADMIN_MANUAL_LATE_FEE_WAIVER',
          status: 'APPROVED',
          admin_notes: auditNote,
        } as any);

      if (waiverLogError) {
        if (adminUserId) {
          await supabase
            .from('notifications')
            .insert({
              user_id: adminUserId,
              title: 'Waiver Audit',
              message: `Waiver fallback log for due ${String(dueId)} (${studentInfo?.full_name || 'Student'}). ${auditNote}`,
              type: 'INFO',
              is_read: false,
            } as any);
        }
      }

      await fetchDues();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to waive fee');
      return false;
    }
  };

  const recordPayment = async (dueId: string | number, paymentData: { amount: number, studentName: string, monthYear: string, method: string }) => {
    try {
      const txnId = (paymentData.method === 'Cash' ? 'CASH-' : 'TXN-') + Math.random().toString(36).substring(2, 11).toUpperCase();
      const { error } = await supabase
        .from('monthly_dues')
        .update({ status: 'PAID', transaction_id: txnId, paid_at: new Date().toISOString(), payment_method: paymentData.method })
        .eq('id', String(dueId));
      if (error) throw error;
      await fetchDues();
      return txnId;
    } catch (err) {
      console.error('Failed to record payment', err);
      return null;
    }
  };

  const markAsPaid = async (id: string) => {
    try {
      const txnId = 'CASH-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      const { error } = await supabase
        .from('monthly_dues')
        .update({ status: 'PAID', paid_at: new Date().toISOString(), transaction_id: txnId })
        .eq('id', id);
      if (error) throw error;
      await fetchDues();
      return true;
    } catch (err) {
      return false;
    }
  };

  const sendNotification = async (id: string) => {
    try {
      const { data: due } = await supabase
        .from('monthly_dues')
        .select('*, students(full_name, parent_id)')
        .eq('id', id)
        .single();
      if (due?.students?.parent_id) {
        await supabase.from('notifications').insert({
          user_id: due.students.parent_id,
          title: 'Fee Reminder',
          message: `Your bus fee of ₹${due.total_due} for ${due.students.full_name} is due. Please pay before the due date to avoid late charges.`,
          type: 'WARNING',
          is_read: false,
        });
      }
      return true;
    } catch (err) {
      return false;
    }
  };

  const createFeesForYear = async (feeData: {
    student_id: string;
    amount: number;
    due_date_day: number;
    last_date_day: number;
    fine_after_days: number;
    fine_per_day: number;
    year?: number;
    startMonth?: number;
    endMonth?: number;
    startYear?: number;
    endYear?: number;
    startPeriod?: string;
    endPeriod?: string;
  }) => {
    try {
      const parsePeriod = (value?: string) => {
        if (!value) return null;
        const [yearStr, monthStr] = value.split('-');
        const year = Number(yearStr);
        const month = Number(monthStr);
        if (!year || !month || month < 1 || month > 12) return null;
        return { year, month };
      };

      const periodStart = parsePeriod(feeData.startPeriod);
      const periodEnd = parsePeriod(feeData.endPeriod);

      const startYear = Number(periodStart?.year ?? feeData.startYear ?? feeData.year ?? new Date().getFullYear());
      const endYear = Number(periodEnd?.year ?? feeData.endYear ?? feeData.year ?? new Date().getFullYear());
      const startMonth = Number(periodStart?.month ?? feeData.startMonth ?? 1);
      const endMonth = Number(periodEnd?.month ?? feeData.endMonth ?? 12);

      const startIndex = startYear * 12 + (startMonth - 1);
      const endIndex = endYear * 12 + (endMonth - 1);

      if (!feeData.student_id) throw new Error('Student ID is required');
      if (feeData.amount <= 0) throw new Error('Amount must be greater than 0');
      if (startMonth < 1 || startMonth > 12 || endMonth < 1 || endMonth > 12 || endIndex < startIndex) {
        throw new Error('Invalid month range');
      }

      // Get existing fees for this student to avoid duplicates across financial-year ranges.
      const { data: existingFees, error: existingError } = await supabase
        .from('monthly_dues')
        .select('month, year')
        .eq('student_id', feeData.student_id);

      if (existingError) throw existingError;

      const existingMonths = new Set((existingFees || []).map(f => `${f.year}-${f.month}`));
      const feesToCreate = [];

      for (let index = startIndex; index <= endIndex; index++) {
        const year = Math.floor(index / 12);
        const month = (index % 12) + 1;
        const monthKey = `${year}-${month}`;

        if (existingMonths.has(monthKey)) {
          console.warn(`[Bulk Fee Creation] Fee already exists for student ${feeData.student_id} in month ${month}/${year}, skipping...`);
          continue;
        }

        const maxDayForMonth = new Date(year, month, 0).getDate();
        const dueDay = Math.min(Math.max(1, Number(feeData.due_date_day)), maxDayForMonth);
        const lastDay = Math.min(Math.max(1, Number(feeData.last_date_day)), maxDayForMonth);
        const dueDate = new Date(year, month - 1, dueDay);
        const lastDate = new Date(year, month - 1, lastDay);

        feesToCreate.push({
          student_id: feeData.student_id,
          month,
          year,
          amount: feeData.amount,
          late_fee: 0,
          due_date: toISODate(dueDate),
          last_date: toISODate(lastDate),
          fine_after_days: Number(feeData.fine_after_days ?? 5),
          fine_per_day: Number(feeData.fine_per_day ?? 50),
          status: 'PENDING',
        });
      }

      if (feesToCreate.length === 0) {
        console.warn('[Bulk Fee Creation] All months already have fees, nothing to create');
        return {
          success: true,
          created: 0,
          skipped: endIndex - startIndex + 1,
          message: 'All months already have fees, no new fees created.'
        };
      }

      const { error } = await supabase.from('monthly_dues').insert(feesToCreate);

      if (error) {
        console.error('[Bulk Fee Creation Error]', error);
        throw error;
      }

      await fetchDues();
      
      const startLabel = `${MONTHS[startMonth - 1]} ${startYear}`;
      const endLabel = `${MONTHS[endMonth - 1]} ${endYear}`;

      return {
        success: true,
        created: feesToCreate.length,
        skipped: (endIndex - startIndex + 1) - feesToCreate.length,
        message: `Successfully created ${feesToCreate.length} fee(s) for ${startLabel} - ${endLabel}`
      };
    } catch (err: any) {
      console.error('[createFeesForYear] Error:', err.message || err);
      return {
        success: false,
        created: 0,
        skipped: 0,
        message: err.message || 'Failed to create bulk fees'
      };
    }
  };

  const toISODate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchDues();
  }, []);

  return {
    dues,
    defaulters,
    loading,
    error,
    fetchDues,
    fetchDefaulters,
    generateMonthlyBills,
    waiveLateFee,
    createFee,
    createFeesForYear,
    updateFee,
    deleteFee,
    recordManualPayment,
    markAsPaid,
    sendNotification,
    recordPayment,
  };
};
