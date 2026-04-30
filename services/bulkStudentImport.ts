import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

export interface ImportRow {
  rowNumber: number;
  full_name: string;
  admission_number: string;
  grade: string;
  section: string;
  monthly_fee: number;
  parent_name: string;
  parent_phone: string;
  route_name?: string;
  bus_number?: string;
  boarding_point?: string;
  status: string;
  // Validation
  errors: string[];
  warnings: string[];
}

export interface ImportPreviewResult {
  rows: ImportRow[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  /** Recommended columns that the uploaded file did not include. */
  missingRecommended: string[];
  /** Headers that did not match any known field — shown as info to the admin. */
  unknownHeaders: string[];
}

// Columns the student form needs. REQUIRED must be present in the uploaded
// file; the parser refuses to proceed without them. RECOMMENDED produce a
// structured warning the UI can surface so the admin knows what's missing.
const REQUIRED_COLUMNS = ['full_name', 'admission_number'] as const;
const RECOMMENDED_COLUMNS = ['grade', 'section', 'monthly_fee', 'parent_name', 'parent_phone'] as const;

const COLUMN_ALIASES: Record<string, string[]> = {
  full_name: ['full_name', 'name', 'student_name', 'student name', 'full name'],
  admission_number: ['admission_number', 'admission no', 'admission', 'adm no', 'roll no', 'admno', 'admission_no'],
  grade: ['grade', 'class'],
  section: ['section', 'div', 'division'],
  monthly_fee: ['monthly_fee', 'fee', 'amount', 'monthly fee', 'base_fee'],
  parent_name: ['parent_name', 'parent', 'parent name', 'father_name', 'mother_name', 'guardian'],
  parent_phone: ['parent_phone', 'phone', 'mobile', 'contact', 'parent mobile', 'parent phone'],
  route_name: ['route_name', 'route', 'route name'],
  bus_number: ['bus_number', 'bus', 'bus no', 'bus number', 'plate'],
  boarding_point: ['boarding_point', 'boarding', 'pickup', 'stop', 'pickup point'],
  status: ['status', 'active', 'is_active'],
};

const COLUMN_DESCRIPTIONS: Record<string, string> = {
  full_name: "Student's full name",
  admission_number: 'Unique admission / roll number',
  grade: 'Class or grade (e.g. 5)',
  section: 'Section letter (e.g. A, B)',
  monthly_fee: 'Monthly bus fee in INR (used to auto-generate dues)',
  parent_name: "Parent / guardian's full name",
  parent_phone: "Parent's 10-digit mobile number",
  route_name: 'Bus route name or code (e.g. Kangra Main, R-101)',
  bus_number: 'Bus number or vehicle plate',
  boarding_point: 'Pickup stop where the child boards',
  status: 'active or inactive (default: active)',
};

// Custom error thrown when the file is missing required columns. UI surfaces
// the message via showAlert.
export class StudentImportColumnError extends Error {
  missingRequired: string[];
  missingRecommended: string[];
  detectedHeaders: string[];
  constructor(missingRequired: string[], missingRecommended: string[], detectedHeaders: string[]) {
    const lines = [
      missingRequired.length > 0
        ? `Required columns missing: ${missingRequired.map((c) => `"${c}"`).join(', ')}`
        : '',
      ...missingRequired.map((c) => `  • ${c} — ${COLUMN_DESCRIPTIONS[c] || c}`),
      missingRequired.length > 0 && missingRecommended.length > 0 ? '' : '',
      missingRecommended.length > 0
        ? `Recommended columns missing: ${missingRecommended.map((c) => `"${c}"`).join(', ')}`
        : '',
      ...missingRecommended.map((c) => `  • ${c} — ${COLUMN_DESCRIPTIONS[c] || c}`),
    ].filter(Boolean);
    super(lines.join('\n'));
    this.name = 'StudentImportColumnError';
    this.missingRequired = missingRequired;
    this.missingRecommended = missingRecommended;
    this.detectedHeaders = detectedHeaders;
  }
}

const normalizeKey = (key: string) => String(key || '').toLowerCase().trim().replace(/\s+/g, '_');

const findKey = (row: Record<string, any>, target: string): any => {
  const aliases = COLUMN_ALIASES[target] || [target];
  for (const alias of aliases) {
    const lc = alias.toLowerCase();
    for (const k of Object.keys(row)) {
      if (normalizeKey(k) === normalizeKey(lc)) return row[k];
    }
  }
  return undefined;
};

// Returns the canonical field name (e.g. 'full_name') for a column header
// found in the file, or null if the header doesn't match any known field.
const matchHeaderToField = (header: string): string | null => {
  const norm = normalizeKey(header);
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.some((a) => normalizeKey(a) === norm)) return field;
  }
  return null;
};

/**
 * Parse a CSV / XLSX / XLS file from the browser File API into an ImportPreviewResult.
 * Validates the column set first (throws StudentImportColumnError if required
 * columns are missing), then validates each row but does NOT insert anything yet.
 */
export const parseStudentImportFile = async (file: File): Promise<ImportPreviewResult> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Pull the header row first (raw, before object conversion) so we can
  // tell the admin exactly which columns are missing or unknown.
  const headerRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
  const headerRow: string[] = (headerRows[0] || []).map((h: any) => String(h || '').trim()).filter(Boolean);

  if (headerRow.length === 0) {
    throw new StudentImportColumnError(
      [...REQUIRED_COLUMNS],
      [...RECOMMENDED_COLUMNS],
      [],
    );
  }

  const detectedFields = new Set<string>();
  for (const h of headerRow) {
    const field = matchHeaderToField(h);
    if (field) detectedFields.add(field);
  }

  const missingRequired = REQUIRED_COLUMNS.filter((c) => !detectedFields.has(c));
  const missingRecommended = RECOMMENDED_COLUMNS.filter((c) => !detectedFields.has(c));

  if (missingRequired.length > 0) {
    throw new StudentImportColumnError(missingRequired, missingRecommended, headerRow);
  }

  const raw = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

  // Pre-fetch existing admission numbers to flag duplicates
  const { data: existing } = await supabase.from('students').select('admission_number');
  const existingAdmissions = new Set(
    (existing || []).map((s: any) => String(s.admission_number || '').trim().toLowerCase()).filter(Boolean)
  );

  const seenInBatch = new Set<string>();
  const rows: ImportRow[] = raw.map((rec, idx) => {
    const rowNumber = idx + 2; // header is row 1, first data row is row 2
    const errors: string[] = [];
    const warnings: string[] = [];

    const full_name = String(findKey(rec, 'full_name') || '').trim();
    const admission_number = String(findKey(rec, 'admission_number') || '').trim();
    const grade = String(findKey(rec, 'grade') || '').trim();
    const section = String(findKey(rec, 'section') || '').trim().toUpperCase();
    const feeRaw = findKey(rec, 'monthly_fee');
    const monthly_fee = Number(String(feeRaw || '').replace(/[^0-9.]/g, '')) || 0;
    const parent_name = String(findKey(rec, 'parent_name') || '').trim();
    const parent_phone = String(findKey(rec, 'parent_phone') || '').replace(/\D/g, '').slice(-10);
    const route_name = String(findKey(rec, 'route_name') || '').trim();
    const bus_number = String(findKey(rec, 'bus_number') || '').trim();
    const boarding_point = String(findKey(rec, 'boarding_point') || '').trim();
    const status = (() => {
      const raw = String(findKey(rec, 'status') || 'active').toLowerCase();
      if (raw === 'inactive' || raw === 'no' || raw === 'false') return 'inactive';
      return 'active';
    })();

    if (!full_name) errors.push('Missing full_name');
    if (!admission_number) errors.push('Missing admission_number');
    if (admission_number && existingAdmissions.has(admission_number.toLowerCase())) {
      errors.push('Admission number already exists in DB');
    }
    if (admission_number && seenInBatch.has(admission_number.toLowerCase())) {
      errors.push('Duplicate admission number in this file');
    } else if (admission_number) {
      seenInBatch.add(admission_number.toLowerCase());
    }
    if (parent_phone && parent_phone.length !== 10) {
      warnings.push(`Phone "${parent_phone}" should be 10 digits`);
    }
    if (monthly_fee <= 0) warnings.push('Monthly fee is 0 — no dues will be auto-generated');

    return {
      rowNumber,
      full_name,
      admission_number,
      grade,
      section,
      monthly_fee,
      parent_name,
      parent_phone,
      route_name,
      bus_number,
      boarding_point,
      status,
      errors,
      warnings,
    };
  });

  // Headers in the file that didn't match any known canonical field
  const unknownHeaders = headerRow.filter((h) => !matchHeaderToField(h));

  return {
    rows,
    totalRows: rows.length,
    validRows: rows.filter((r) => r.errors.length === 0).length,
    invalidRows: rows.filter((r) => r.errors.length > 0).length,
    missingRecommended,
    unknownHeaders,
  };
};

export interface ImportRunResult {
  successCount: number;
  failedCount: number;
  failedRows: Array<{ rowNumber: number; admission_number: string; error: string }>;
  duesGenerated: number;
}

/**
 * Insert the valid rows into students. Resolves route_id and bus_id by name
 * lookup, generates 12 monthly dues per student (April -> March of current
 * Indian academic year), and notifies the existing parent profile (if any).
 */
export const runStudentImport = async (rows: ImportRow[]): Promise<ImportRunResult> => {
  const validRows = rows.filter((r) => r.errors.length === 0);

  // Resolve route & bus lookup tables once
  const { data: routes } = await supabase.from('routes').select('id, route_name, code');
  const { data: buses } = await supabase.from('buses').select('id, bus_number, plate');
  const routeMap = new Map<string, string>();
  (routes || []).forEach((r: any) => {
    if (r.route_name) routeMap.set(String(r.route_name).toLowerCase(), r.id);
    if (r.code) routeMap.set(String(r.code).toLowerCase(), r.id);
  });
  const busMap = new Map<string, string>();
  (buses || []).forEach((b: any) => {
    if (b.bus_number) busMap.set(String(b.bus_number).toLowerCase(), b.id);
    if (b.plate) busMap.set(String(b.plate).toLowerCase(), b.id);
  });

  const result: ImportRunResult = { successCount: 0, failedCount: 0, failedRows: [], duesGenerated: 0 };

  // Date helpers for due generation
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const fyStart = currentMonth >= 4 ? currentYear : currentYear - 1;

  const cycles: Array<{ month: number; year: number }> = [];
  let m = currentMonth;
  let y = currentYear;
  while (true) {
    cycles.push({ month: m, year: y });
    if (y === fyStart + 1 && m === 3) break;
    m += 1;
    if (m > 12) { m = 1; y += 1; }
    if (cycles.length > 18) break;
  }

  for (const row of validRows) {
    try {
      // Resolve parent_id via phone lookup (best-effort)
      let parent_id: string | null = null;
      if (row.parent_phone) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .or(`phone_number.eq.${row.parent_phone},phone_number.eq.+91${row.parent_phone}`)
          .eq('role', 'PARENT')
          .maybeSingle();
        if (profile) parent_id = profile.id;
      }

      const route_id = row.route_name ? routeMap.get(row.route_name.toLowerCase()) || null : null;
      const bus_id = row.bus_number ? busMap.get(row.bus_number.toLowerCase()) || null : null;

      const { data: inserted, error: studentErr } = await supabase
        .from('students')
        .insert({
          full_name: row.full_name,
          admission_number: row.admission_number,
          grade: row.grade || null,
          section: row.section || null,
          route_id,
          bus_id,
          boarding_point: row.boarding_point || null,
          monthly_fee: row.monthly_fee || 0,
          status: row.status,
          parent_name: row.parent_name || null,
          parent_phone: row.parent_phone || null,
          parent_id,
        })
        .select('id')
        .single();

      if (studentErr || !inserted?.id) {
        result.failedCount += 1;
        result.failedRows.push({
          rowNumber: row.rowNumber,
          admission_number: row.admission_number,
          error: studentErr?.message || 'Insert returned no id',
        });
        continue;
      }

      // Auto-generate dues
      if (row.monthly_fee > 0) {
        const duesRows = cycles.map((c) => ({
          student_id: inserted.id,
          month: c.month,
          year: c.year,
          amount: row.monthly_fee,
          total_due: row.monthly_fee,
          base_fee: row.monthly_fee,
          due_date: new Date(Date.UTC(c.year, c.month - 1, 10)).toISOString().slice(0, 10),
          last_date: new Date(Date.UTC(c.year, c.month - 1, 20)).toISOString().slice(0, 10),
          status: 'PENDING',
        }));
        const { error: duesErr } = await supabase.from('monthly_dues').insert(duesRows);
        if (!duesErr) result.duesGenerated += duesRows.length;
      }

      result.successCount += 1;
    } catch (err: any) {
      result.failedCount += 1;
      result.failedRows.push({
        rowNumber: row.rowNumber,
        admission_number: row.admission_number,
        error: err?.message || 'Unknown error',
      });
    }
  }

  return result;
};

/** Build a downloadable CSV template the admin can fill in. */
export const downloadStudentImportTemplate = () => {
  const headers = [
    'full_name',
    'admission_number',
    'grade',
    'section',
    'monthly_fee',
    'parent_name',
    'parent_phone',
    'route_name',
    'bus_number',
    'boarding_point',
    'status',
  ];
  const sample = [
    'Aarav Sharma',
    'ADM2026001',
    '5',
    'A',
    '1500',
    'Rakesh Sharma',
    '9876543210',
    'Kangra Main',
    'BUS-101',
    'Kangra Bus Stand',
    'active',
  ];
  const csv = `${headers.join(',')}\n${sample.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')}\n`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'student_import_template.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};
