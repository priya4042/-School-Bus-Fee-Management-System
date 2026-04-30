import { supabase } from '../lib/supabase';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ============================================================================
// 1. Mark child absent today
// ============================================================================

export interface MarkAbsentInput {
  studentId: string;
  parentId: string;
  reason: 'sick' | 'leave' | 'family' | 'other';
  notes?: string;
  date?: string; // YYYY-MM-DD, defaults to today
}

export interface MarkAbsentResult {
  ok: boolean;
  error?: string;
}

const REASON_LABELS: Record<string, string> = {
  sick: 'Sick',
  leave: 'On Leave',
  family: 'Family commitment',
  other: 'Other',
};

export const markChildAbsent = async (input: MarkAbsentInput): Promise<MarkAbsentResult> => {
  try {
    const date = input.date || new Date().toISOString().split('T')[0];

    // Look up student details for notification body
    const { data: student } = await supabase
      .from('students')
      .select('full_name, route_id')
      .eq('id', input.studentId)
      .maybeSingle();

    const studentName = (student as any)?.full_name || 'Student';

    // Upsert PICKUP and DROP attendance rows for today as absent
    const rows = [
      {
        student_id: input.studentId,
        type: 'PICKUP' as const,
        status: false,
        date,
        marked_by: input.parentId,
      },
      {
        student_id: input.studentId,
        type: 'DROP' as const,
        status: false,
        date,
        marked_by: input.parentId,
      },
    ];

    const { error: attErr } = await supabase
      .from('attendance')
      .upsert(rows, { onConflict: 'student_id,type,date' });

    if (attErr) return { ok: false, error: attErr.message };

    // Notify all admins so the driver can be informed
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['ADMIN', 'SUPER_ADMIN']);

    const adminIds = (admins || []).map((a: any) => a.id).filter(Boolean);
    if (adminIds.length > 0) {
      const reasonText = REASON_LABELS[input.reason] || 'Other';
      const niceDate = new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      await supabase.from('notifications').insert(
        adminIds.map((adminId: string) => ({
          user_id: adminId,
          title: `Absence reported — ${studentName}`,
          message: `[STUDENT_ABSENT][STUDENT_ID:${input.studentId}][DATE:${date}] ${studentName} will NOT take the bus on ${niceDate}. Reason: ${reasonText}.${input.notes ? ` Note: ${input.notes}` : ''}`,
          type: 'WARNING',
          is_read: false,
        }))
      );
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to mark absent' };
  }
};

// ============================================================================
// 2. Bus status banner — admin pushes status, parents on that bus see it
// ============================================================================

export type BusStatusKey = 'on_route' | 'at_school' | 'dropped' | 'delayed' | 'cancelled';

export const BUS_STATUS_OPTIONS: Array<{ key: BusStatusKey; label: string; emoji: string; color: string }> = [
  { key: 'on_route', label: 'On the way',     emoji: '🚌', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'at_school', label: 'Arrived at school', emoji: '🏫', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'dropped',  label: 'Dropped off',     emoji: '✅', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'delayed',  label: 'Delayed',         emoji: '⚠️', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'cancelled',label: 'Service cancelled today', emoji: '🛑', color: 'bg-red-50 text-red-700 border-red-200' },
];

export interface PushBusStatusInput {
  busId: string;
  routeId?: string | null;
  status: BusStatusKey;
  customMessage?: string;
  adminUserId: string;
}

export interface PushBusStatusResult {
  ok: boolean;
  parentsNotified?: number;
  error?: string;
}

/**
 * Admin pushes a status update for a bus. Fans out a [BUS_STATUS] notification
 * to every parent whose child rides that bus. Parent dashboard reads the latest
 * [BUS_STATUS] for their child's bus and shows it as a coloured banner.
 */
export const pushBusStatus = async (input: PushBusStatusInput): Promise<PushBusStatusResult> => {
  try {
    const option = BUS_STATUS_OPTIONS.find((o) => o.key === input.status);
    if (!option) return { ok: false, error: 'Invalid status' };

    const { data: students } = await supabase
      .from('students')
      .select('parent_id')
      .eq('bus_id', input.busId);

    const parentIds = Array.from(new Set((students || []).map((s: any) => s.parent_id).filter(Boolean)));
    if (parentIds.length === 0) return { ok: true, parentsNotified: 0 };

    const baseLabel = option.label;
    const customSuffix = input.customMessage ? ` — ${input.customMessage}` : '';
    const messageText = `${option.emoji} ${baseLabel}${customSuffix}`;

    await supabase.from('notifications').insert(
      parentIds.map((pid) => ({
        user_id: pid,
        title: 'Bus status update',
        message: `[BUS_STATUS][BUS_ID:${input.busId}][STATUS:${input.status}][TS:${Date.now()}] ${messageText}`,
        type: input.status === 'cancelled' || input.status === 'delayed' ? 'WARNING' : 'INFO',
        is_read: false,
      }))
    );

    return { ok: true, parentsNotified: parentIds.length };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to push bus status' };
  }
};

export interface ParsedBusStatus {
  isBusStatus: boolean;
  busId?: string;
  status?: BusStatusKey;
  ts?: number;
  cleanMessage?: string;
}

export const parseBusStatusTag = (message: string | null | undefined): ParsedBusStatus => {
  const text = String(message || '');
  if (!text.includes('[BUS_STATUS]')) return { isBusStatus: false };
  const busId = text.match(/\[BUS_ID:([^\]]+)\]/)?.[1];
  const status = text.match(/\[STATUS:([^\]]+)\]/)?.[1] as BusStatusKey | undefined;
  const tsRaw = text.match(/\[TS:([0-9]+)\]/)?.[1];
  const cleanMessage = text.replace(/\[BUS_STATUS\]\s*/g, '').replace(/\[(BUS_ID|STATUS|TS):[^\]]+\]\s*/g, '').trim();
  return {
    isBusStatus: true,
    busId,
    status,
    ts: tsRaw ? Number(tsRaw) : undefined,
    cleanMessage,
  };
};

/**
 * Find the latest BUS_STATUS notification for the given parent + bus.
 * Used by the parent dashboard banner.
 */
export const getLatestBusStatusForParent = async (parentId: string, busId: string): Promise<ParsedBusStatus | null> => {
  if (!parentId || !busId) return null;
  // Only look at notifications from today so stale messages don't linger forever
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { data } = await supabase
    .from('notifications')
    .select('id, title, message, created_at')
    .eq('user_id', parentId)
    .like('message', `%[BUS_STATUS]%[BUS_ID:${busId}]%`)
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return null;
  return parseBusStatusTag(data[0].message);
};

// ============================================================================
// 3. Emergency / panic alert — parent taps a red button, all admins get
//    a DANGER notification with student + parent + optional location.
// ============================================================================

export interface EmergencyAlertInput {
  studentId: string;
  parentId: string;
  parentName?: string;
  parentPhone?: string;
  category: 'safety' | 'late_drop' | 'lost_stop' | 'medical' | 'other';
  notes?: string;
  /** Optional GPS coordinates if the parent allowed location. */
  lat?: number;
  lng?: number;
}

export interface EmergencyAlertResult {
  ok: boolean;
  error?: string;
  notifiedAdmins?: number;
}

const EMERGENCY_LABELS: Record<string, string> = {
  safety:    'Child safety concern',
  late_drop: 'Bus is very late / not arrived',
  lost_stop: 'Child got off wrong stop',
  medical:   'Medical emergency',
  other:     'Other emergency',
};

export const sendEmergencyAlert = async (input: EmergencyAlertInput): Promise<EmergencyAlertResult> => {
  try {
    const { data: student } = await supabase
      .from('students')
      .select('full_name, route_id, buses(bus_number, plate, driver_name, driver_phone)')
      .eq('id', input.studentId)
      .maybeSingle();
    const studentName = (student as any)?.full_name || 'Student';
    const bus: any = Array.isArray((student as any)?.buses) ? (student as any).buses[0] : (student as any)?.buses;

    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['ADMIN', 'SUPER_ADMIN']);

    const adminIds = (admins || []).map((a: any) => a.id).filter(Boolean);
    if (adminIds.length === 0) return { ok: false, error: 'No admin available to receive alert' };

    const categoryLabel = EMERGENCY_LABELS[input.category] || 'Emergency';
    const locationStr = input.lat != null && input.lng != null
      ? ` Location: ${input.lat.toFixed(5)},${input.lng.toFixed(5)} (https://maps.google.com/?q=${input.lat},${input.lng})`
      : '';
    const busStr = bus?.bus_number ? ` Bus: ${bus.bus_number}.` : '';
    const driverStr = bus?.driver_phone ? ` Driver: ${bus.driver_name || ''} ${bus.driver_phone}.` : '';
    const parentStr = input.parentPhone ? ` Parent: ${input.parentName || ''} ${input.parentPhone}.` : '';

    const message = `[EMERGENCY][STUDENT_ID:${input.studentId}][CATEGORY:${input.category}] ${studentName} — ${categoryLabel}.${busStr}${driverStr}${parentStr}${input.notes ? ` Note: ${input.notes}.` : ''}${locationStr}`;

    await supabase.from('notifications').insert(
      adminIds.map((adminId: string) => ({
        user_id: adminId,
        title: `🚨 EMERGENCY — ${studentName}`,
        message,
        type: 'DANGER',
        is_read: false,
      }))
    );

    // Confirmation for the parent so they know it landed
    await supabase.from('notifications').insert({
      user_id: input.parentId,
      title: 'Emergency alert sent',
      message: `Your emergency alert about ${studentName} (${categoryLabel}) has been sent to admin. They will contact you immediately.`,
      type: 'WARNING',
      is_read: false,
    });

    return { ok: true, notifiedAdmins: adminIds.length };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to send emergency alert' };
  }
};

// ============================================================================
// 4. Pickup location swap request
// ============================================================================

export interface PickupSwapInput {
  studentId: string;
  parentId: string;
  forDate: string; // YYYY-MM-DD
  newLocation: string;
  notes?: string;
}

export interface PickupSwapResult {
  ok: boolean;
  error?: string;
}

export const submitPickupSwapRequest = async (input: PickupSwapInput): Promise<PickupSwapResult> => {
  try {
    if (!input.newLocation.trim()) return { ok: false, error: 'New pickup location required' };

    // Fetch student name for nicer notification body
    const { data: student } = await supabase
      .from('students')
      .select('full_name, boarding_point')
      .eq('id', input.studentId)
      .maybeSingle();
    const studentName = (student as any)?.full_name || 'Student';
    const currentStop = (student as any)?.boarding_point || 'current stop';

    // Notify all admins
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['ADMIN', 'SUPER_ADMIN']);

    const adminIds = (admins || []).map((a: any) => a.id).filter(Boolean);
    if (adminIds.length === 0) return { ok: false, error: 'No admin available to receive request' };

    const niceDate = new Date(input.forDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const message = `[PICKUP_SWAP_REQUEST][STUDENT_ID:${input.studentId}][DATE:${input.forDate}][NEW_STOP:${input.newLocation}] ${studentName} requests pickup at "${input.newLocation}" on ${niceDate} (instead of "${currentStop}").${input.notes ? ` Note: ${input.notes}` : ''}`;

    await supabase.from('notifications').insert(
      adminIds.map((adminId: string) => ({
        user_id: adminId,
        title: `Pickup change request — ${studentName}`,
        message,
        type: 'INFO',
        is_read: false,
      }))
    );

    // Confirmation notification for the parent themselves
    await supabase.from('notifications').insert({
      user_id: input.parentId,
      title: 'Pickup change request submitted',
      message: `Your request to pick up ${studentName} at "${input.newLocation}" on ${niceDate} has been sent to admin. You'll be notified once it's confirmed.`,
      type: 'INFO',
      is_read: false,
    });

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to submit request' };
  }
};
