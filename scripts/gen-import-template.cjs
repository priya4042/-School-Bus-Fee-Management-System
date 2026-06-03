// One-off script: generate the student bulk-import Excel template on the Desktop.
// Columns match services/bulkStudentImport.ts exactly. Each column maps 1:1 to
// a field on the Admin "Register New Student" form (including the Initial Fee
// Setup section), so what you fill in here is exactly what would be typed
// manually.

const XLSX = require('xlsx');
const path = require('path');

const desktop = path.join(process.env.USERPROFILE || process.env.HOME, 'Desktop');
const out = path.join(desktop, 'BusWayPro-Student-Import-Template-v2.xlsx');

// First row = canonical headers the importer expects.
const headers = [
  // Academic Profile
  'full_name',
  'admission_number',
  'grade',
  'section',
  'monthly_fee',
  // Fleet Mapping
  'parent_name',
  'parent_phone',
  'route_name',
  'bus_number',
  'boarding_point',
  'status',
  // Initial Fee Setup (all optional — defaults applied when blank)
  'bill_start_period',
  'bill_end_period',
  'due_date_day',
  'last_date_day',
  'fine_after_days',
  'fine_per_day',
];

// Sample rows — replace with your real students, keep the header row intact.
const samples = [
  ['Aarav Sharma', 'ADM2026001', '5', 'A', 1500, 'Rakesh Sharma',  '9876543210', 'Kangra Main',   'BUS-101', 'Kangra Bus Stand',  'active', '2026-04', '2027-03', 10, 20, 5, 10],
  ['Diya Verma',   'ADM2026002', '6', 'B', 1500, 'Sunil Verma',    '9876501234', 'Kangra Main',   'BUS-101', 'Dharamshala Chowk', 'active', '2026-04', '2027-03', 10, 20, 5, 10],
  ['Kabir Patel',  'ADM2026003', '7', 'A', 1800, 'Anjali Patel',   '9988776655', 'Palampur Road', 'BUS-102', 'Palampur Bypass',   'active', '2026-04', '2027-03', 10, 20, 5, 10],
  ['Ishaan Gupta', 'ADM2026004', '4', 'C', 1500, 'Vikram Gupta',   '8877665544', 'Kangra Main',   'BUS-101', 'Gaggal Crossing',   'active', '',        '',        '', '', '', ''],
  ['Saanvi Kumar', 'ADM2026005', '8', 'A', 1800, 'Pooja Kumar',    '7766554433', 'Palampur Road', 'BUS-102', 'Maranda Stop',      'active', '',        '',        '', '', '', ''],
];

const wb = XLSX.utils.book_new();

// === Sheet 1: Students ===
const ws1 = XLSX.utils.aoa_to_sheet([headers, ...samples]);
ws1['!cols'] = [
  { wch: 22 }, // full_name
  { wch: 18 }, // admission_number
  { wch: 8  }, // grade
  { wch: 10 }, // section
  { wch: 14 }, // monthly_fee
  { wch: 22 }, // parent_name
  { wch: 16 }, // parent_phone
  { wch: 18 }, // route_name
  { wch: 12 }, // bus_number
  { wch: 24 }, // boarding_point
  { wch: 10 }, // status
  { wch: 16 }, // bill_start_period
  { wch: 16 }, // bill_end_period
  { wch: 14 }, // due_date_day
  { wch: 14 }, // last_date_day
  { wch: 16 }, // fine_after_days
  { wch: 14 }, // fine_per_day
];
ws1['!freeze'] = { xSplit: 0, ySplit: 1 };
XLSX.utils.book_append_sheet(wb, ws1, 'Students');

// === Sheet 2: Field Mapping (Admin form ↔ Excel column) ===
const mapping = [
  ['Admin form field',           'Excel column',     'Required?',   'Notes'],
  ['— Academic Profile —',       '',                 '',            ''],
  ['Student Legal Name',         'full_name',        'YES',         "Student's full name"],
  ['Admission Number',           'admission_number', 'YES',         'Unique admission / roll number — must not match an existing student'],
  ['Grade',                      'grade',            'YES on form', 'Class or grade (e.g. 5)'],
  ['Section',                    'section',          'YES on form', 'Section letter (e.g. A, B)'],
  ['Monthly Fee (₹)',            'monthly_fee',      'YES on form', 'Bus fee in INR — also drives the auto-generated monthly dues'],
  ['— Fleet Mapping —',          '',                 '',            ''],
  ['Parent Name',                'parent_name',      'Optional',    "Guardian's full name"],
  ['Parent Phone',               'parent_phone',     'Optional',    "10-digit mobile (with or without +91 — only last 10 digits kept)"],
  ['Assigned Route (dropdown)',  'route_name',       'Optional',    'Must match a route already created in the app (the route name OR the auto code like R-101)'],
  ['Assigned Bus (dropdown)',    'bus_number',       'Optional',    'Must match a bus already created in the app (the bus number or plate)'],
  ['Boarding Point',             'boarding_point',   'Optional',    'Pickup stop name (e.g. Main Gate, Sector 4)'],
  ['(not on form — default)',    'status',           'Optional',    '"active" or "inactive" — defaults to active if left blank'],
  ['— Initial Fee Setup —',      '',                 '',            'All optional. If blank for a row, sensible defaults are used.'],
  ['Start Month',                'bill_start_period','Optional',    'First month dues are generated for. Format: YYYY-MM (e.g. 2026-04). Default: current month.'],
  ['End Month',                  'bill_end_period',  'Optional',    'Last month dues are generated for. Format: YYYY-MM (e.g. 2027-03). Default: March of fiscal year.'],
  ['Due Date Day',               'due_date_day',     'Optional',    'Day of month the fee is due (1–31). Default: 10.'],
  ['Last Date Day',              'last_date_day',    'Optional',    'Day of month after which a fine applies (1–31). Default: 20.'],
  ['Fine After Days',            'fine_after_days',  'Optional',    'Grace days past last_date_day before fine starts. Default: 0.'],
  ['Fine Per Day (₹)',           'fine_per_day',     'Optional',    'Fine in INR per day after the grace period. Default: 0.'],
  ['',                           '',                 '',            ''],
  ['Auto-handled (do not add columns for these):', '', '', ''],
  ['',                           'parent_id',        '—',           "Looked up automatically — if a parent profile with this phone exists, the student is linked"],
  ['',                           'route_id',         '—',           'Resolved from route_name above'],
  ['',                           'bus_id',           '—',           'Resolved from bus_number above'],
  ['',                           'id / created_at',  '—',           'Filled automatically by the database'],
];
const ws2 = XLSX.utils.aoa_to_sheet(mapping);
ws2['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 14 }, { wch: 90 }];
ws2['!freeze'] = { xSplit: 0, ySplit: 1 };
XLSX.utils.book_append_sheet(wb, ws2, 'Field Mapping');

// === Sheet 3: Tips ===
const tips = [
  ['Tip'],
  ['Headers are case-insensitive — "Full Name", "FULL_NAME", "Name" all work.'],
  ['Common aliases: "name"→full_name, "phone"→parent_phone, "class"→grade, "div"→section, "fee"→monthly_fee, "bus"→bus_number.'],
  ['Fee-setup aliases: "start_month"→bill_start_period, "end_month"→bill_end_period, "due_day"→due_date_day, "fine"→fine_per_day.'],
  ['Phone numbers: only the last 10 digits are kept. +91, spaces, and dashes are stripped automatically.'],
  ['Monthly fee can include ₹ or commas — non-digits are stripped before parsing.'],
  ['Period format YYYY-MM is the canonical form. "April 2026", "Apr-2026", "04-2026" also work.'],
  ['Empty rows are skipped automatically.'],
  ['Duplicate admission numbers (inside this file OR vs existing DB) are flagged before any insert happens.'],
  ['monthly_fee > 0 is required to auto-generate dues. If fee is 0 or blank, the student is created but no dues are generated.'],
  ['If a parent profile with the same phone number already exists, the student is automatically linked to that parent account.'],
  ['Routes and buses are matched case-insensitively against name OR code (e.g. "R-101" matches a route whose code is R-101).'],
  ['Leave the Initial Fee Setup columns blank to use defaults (Apr→Mar fiscal year, 10th/20th due/last days, no fine).'],
];
const ws3 = XLSX.utils.aoa_to_sheet(tips);
ws3['!cols'] = [{ wch: 120 }];
ws3['!freeze'] = { xSplit: 0, ySplit: 1 };
XLSX.utils.book_append_sheet(wb, ws3, 'Tips');

XLSX.writeFile(wb, out);
console.log('Wrote:', out);
