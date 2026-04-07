/**
 * Generate Play Store listing assets for BusWay Pro
 *
 * Generates:
 * - App icon (512x512) — already exists, skip if present
 * - Feature graphic (1024x500)
 * - Phone screenshots (1080x1920) x 5
 * - 7-inch tablet screenshots (1080x1920) x 2
 * - 10-inch tablet screenshots (1200x1920) x 2
 */

import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'play-store-assets');

// Brand colors
const BLUE = '#1e40af';
const DARK_BLUE = '#1e3a8a';
const YELLOW = '#fbbf24';
const WHITE = '#ffffff';
const LIGHT_GRAY = '#f1f5f9';
const SLATE = '#64748b';
const GREEN = '#10b981';
const RED = '#ef4444';
const AMBER = '#f59e0b';

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// Helper to create SVG text
function svgText(text, x, y, size, color = WHITE, anchor = 'middle', weight = 'bold') {
  // Escape XML special characters
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${escaped}</text>`;
}

function svgRect(x, y, w, h, fill, rx = 0) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}"/>`;
}

function svgCircle(cx, cy, r, fill) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
}

// ─── PHONE SCREENSHOTS (1080x1920) ───

function phoneStatusBar(width = 1080) {
  return `
    ${svgRect(0, 0, width, 44, DARK_BLUE)}
    ${svgText('9:41', 50, 32, 24, WHITE, 'start', 'normal')}
    ${svgCircle(width - 120, 22, 6, WHITE)}
    ${svgCircle(width - 96, 22, 6, WHITE)}
    ${svgCircle(width - 72, 22, 6, WHITE)}
  `;
}

function phoneHeader(title, width = 1080) {
  return `
    ${svgRect(0, 44, width, 96, BLUE)}
    ${svgText(title, width / 2, 104, 38, YELLOW)}
  `;
}

function phoneBottomNav(width = 1080, active = 0) {
  const tabs = ['Home', 'Fees', 'Tracking', 'More'];
  const icons = ['⌂', '₹', '◎', '≡'];
  const tabW = width / tabs.length;
  let svg = svgRect(0, 1840, width, 80, WHITE);
  svg += `<line x1="0" y1="1840" x2="${width}" y2="1840" stroke="#e2e8f0" stroke-width="1"/>`;
  tabs.forEach((tab, i) => {
    const cx = tabW * i + tabW / 2;
    const color = i === active ? BLUE : SLATE;
    svg += svgText(icons[i], cx, 1870, 28, color, 'middle', 'normal');
    svg += svgText(tab, cx, 1908, 20, color, 'middle', 'normal');
  });
  return svg;
}

function card(x, y, w, h, content, rx = 16) {
  return `
    <g>
      ${svgRect(x, y, w, h, WHITE, rx)}
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#e2e8f0" stroke-width="1" rx="${rx}"/>
      ${content}
    </g>
  `;
}

// Screenshot 1: Parent Dashboard
function screenshot1_dashboard() {
  const W = 1080, H = 1920;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgRect(0, 0, W, H, LIGHT_GRAY)}
    ${phoneStatusBar(W)}
    ${phoneHeader('Dashboard', W)}

    <!-- Welcome card -->
    ${card(40, 170, W - 80, 160, `
      ${svgRect(40, 170, W - 80, 160, BLUE, 16)}
      ${svgText('Welcome back, Parent!', 80, 220, 30, WHITE, 'start')}
      ${svgText('2 Students enrolled', 80, 260, 22, YELLOW, 'start', 'normal')}
      ${svgText('All fees up to date', 80, 296, 20, '#93c5fd', 'start', 'normal')}
    `)}

    <!-- Quick stats row -->
    ${card(40, 360, 310, 140, `
      ${svgCircle(100, 420, 30, '#dbeafe')}
      ${svgText('₹', 100, 428, 24, BLUE)}
      ${svgText('Total Due', 100, 470, 18, SLATE, 'middle', 'normal')}
      ${svgText('₹2,500', 100, 496, 26, DARK_BLUE)}
    `)}
    ${card(380, 360, 310, 140, `
      ${svgCircle(440, 420, 30, '#d1fae5')}
      ${svgText('✓', 440, 428, 24, GREEN)}
      ${svgText('Paid', 440, 470, 18, SLATE, 'middle', 'normal')}
      ${svgText('₹18,000', 440, 496, 26, GREEN)}
    `)}
    ${card(720, 360, 320, 140, `
      ${svgCircle(780, 420, 30, '#fef3c7')}
      ${svgText('!', 780, 428, 24, AMBER)}
      ${svgText('Pending', 780, 470, 18, SLATE, 'middle', 'normal')}
      ${svgText('1 Month', 780, 496, 26, AMBER)}
    `)}

    <!-- Student cards -->
    ${card(40, 540, W - 80, 220, `
      ${svgText('Student Details', 80, 580, 24, DARK_BLUE, 'start')}
      <line x1="60" y1="596" x2="${W - 60}" y2="596" stroke="#e2e8f0" stroke-width="1"/>
      ${svgCircle(100, 650, 35, '#dbeafe')}
      ${svgText('A', 100, 658, 28, BLUE)}
      ${svgText('Aarav Sharma', 160, 638, 24, DARK_BLUE, 'start')}
      ${svgText('Class 5A  •  Bus #12  •  Route R-001', 160, 668, 18, SLATE, 'start', 'normal')}
      ${svgRect(160, 688, 90, 30, '#d1fae5', 8)}
      ${svgText('Active', 205, 708, 16, GREEN)}
      ${svgText('Next pickup: 7:30 AM', 700, 708, 18, SLATE, 'start', 'normal')}
    `)}

    ${card(40, 790, W - 80, 220, `
      ${svgText('Fee Summary - March 2026', 80, 830, 24, DARK_BLUE, 'start')}
      <line x1="60" y1="846" x2="${W - 60}" y2="846" stroke="#e2e8f0" stroke-width="1"/>
      ${svgText('Base Fee', 80, 886, 20, SLATE, 'start', 'normal')}
      ${svgText('₹2,000', W - 80, 886, 20, DARK_BLUE, 'end', 'normal')}
      ${svgText('Transport Charge', 80, 920, 20, SLATE, 'start', 'normal')}
      ${svgText('₹500', W - 80, 920, 20, DARK_BLUE, 'end', 'normal')}
      <line x1="60" y1="940" x2="${W - 60}" y2="940" stroke="#e2e8f0" stroke-width="1"/>
      ${svgText('Total Due', 80, 974, 22, DARK_BLUE, 'start')}
      ${svgText('₹2,500', W - 80, 974, 22, BLUE, 'end')}
    `)}

    <!-- Recent activity -->
    ${card(40, 1040, W - 80, 320, `
      ${svgText('Recent Activity', 80, 1080, 24, DARK_BLUE, 'start')}
      <line x1="60" y1="1096" x2="${W - 60}" y2="1096" stroke="#e2e8f0" stroke-width="1"/>

      ${svgCircle(90, 1140, 20, '#d1fae5')}
      ${svgText('✓', 90, 1148, 18, GREEN)}
      ${svgText('Payment received - Feb 2026', 130, 1134, 20, DARK_BLUE, 'start', 'normal')}
      ${svgText('₹2,500 via Razorpay', 130, 1162, 16, SLATE, 'start', 'normal')}

      ${svgCircle(90, 1210, 20, '#dbeafe')}
      ${svgText('🚌', 90, 1218, 16, BLUE)}
      ${svgText('Bus arrived at school', 130, 1204, 20, DARK_BLUE, 'start', 'normal')}
      ${svgText('Today at 8:15 AM', 130, 1232, 16, SLATE, 'start', 'normal')}

      ${svgCircle(90, 1280, 20, '#fef3c7')}
      ${svgText('⚡', 90, 1288, 16, AMBER)}
      ${svgText('March fee generated', 130, 1274, 20, DARK_BLUE, 'start', 'normal')}
      ${svgText('Due by March 31, 2026', 130, 1302, 16, SLATE, 'start', 'normal')}
    `)}

    <!-- Pay Now button -->
    ${svgRect(40, 1400, W - 80, 70, BLUE, 16)}
    ${svgText('Pay Now  →', W / 2, 1444, 26, WHITE)}

    <!-- Notification banner -->
    ${card(40, 1510, W - 80, 90, `
      ${svgRect(40, 1510, 6, 90, AMBER, 0)}
      ${svgCircle(90, 1555, 18, '#fef3c7')}
      ${svgText('🔔', 90, 1562, 16, AMBER)}
      ${svgText('Fee reminder: March dues pending', 126, 1548, 20, DARK_BLUE, 'start', 'normal')}
      ${svgText('Pay before March 31 to avoid late fees', 126, 1576, 16, SLATE, 'start', 'normal')}
    `)}

    <!-- Bus location mini card -->
    ${card(40, 1630, W - 80, 180, `
      ${svgText('Live Bus Location', 80, 1670, 24, DARK_BLUE, 'start')}
      ${svgRect(60, 1690, W - 120, 100, '#e0f2fe', 12)}
      ${svgText('🗺️  Bus #12 is 2.3 km away  •  ETA: 5 min', W / 2, 1748, 20, BLUE)}
    `)}

    ${phoneBottomNav(W, 0)}
  </svg>`;
}

// Screenshot 2: Fee Payment
function screenshot2_payments() {
  const W = 1080, H = 1920;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgRect(0, 0, W, H, LIGHT_GRAY)}
    ${phoneStatusBar(W)}
    ${phoneHeader('Fee Payments', W)}

    <!-- Filter tabs -->
    ${svgRect(40, 170, 200, 50, BLUE, 12)}
    ${svgText('All Dues', 140, 202, 20, WHITE)}
    ${svgRect(260, 170, 200, 50, WHITE, 12)}
    ${svgText('Pending', 360, 202, 20, SLATE)}
    ${svgRect(480, 170, 200, 50, WHITE, 12)}
    ${svgText('Paid', 580, 202, 20, SLATE)}
    ${svgRect(700, 170, 200, 50, WHITE, 12)}
    ${svgText('Overdue', 800, 202, 20, SLATE)}

    <!-- Summary card -->
    ${card(40, 250, W - 80, 120, `
      ${svgRect(40, 250, W - 80, 120, BLUE, 16)}
      ${svgText('Outstanding Balance', 80, 296, 22, '#93c5fd', 'start', 'normal')}
      ${svgText('₹5,000', 80, 340, 40, WHITE, 'start')}
      ${svgText('2 months pending', W - 80, 340, 20, YELLOW, 'end', 'normal')}
    `)}

    <!-- March fee card -->
    ${card(40, 400, W - 80, 260, `
      ${svgRect(40, 400, W - 80, 56, '#fef3c7', 16)}
      ${svgRect(40, 440, W - 80, 4, '#fef3c7', 0)}
      ${svgText('March 2026', 80, 436, 22, '#92400e', 'start')}
      ${svgRect(W - 200, 414, 120, 32, '#fef3c7', 8)}
      ${svgText('PENDING', W - 140, 436, 16, '#92400e')}

      ${svgText('Student', 80, 496, 18, SLATE, 'start', 'normal')}
      ${svgText('Aarav Sharma', 300, 496, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Base Fee', 80, 530, 18, SLATE, 'start', 'normal')}
      ${svgText('₹2,000', 300, 530, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Transport', 80, 564, 18, SLATE, 'start', 'normal')}
      ${svgText('₹500', 300, 564, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Late Fee', 80, 598, 18, SLATE, 'start', 'normal')}
      ${svgText('₹0', 300, 598, 18, GREEN, 'start', 'normal')}
      <line x1="60" y1="614" x2="${W - 60}" y2="614" stroke="#e2e8f0" stroke-width="1"/>
      ${svgText('Total', 80, 642, 22, DARK_BLUE, 'start')}
      ${svgText('₹2,500', W - 80, 642, 22, BLUE, 'end')}
    `)}

    <!-- Feb fee card (Overdue) -->
    ${card(40, 690, W - 80, 260, `
      ${svgRect(40, 690, W - 80, 56, '#fee2e2', 16)}
      ${svgRect(40, 730, W - 80, 4, '#fee2e2', 0)}
      ${svgText('February 2026', 80, 726, 22, '#991b1b', 'start')}
      ${svgRect(W - 210, 704, 130, 32, '#fee2e2', 8)}
      ${svgText('OVERDUE', W - 145, 726, 16, RED)}

      ${svgText('Student', 80, 786, 18, SLATE, 'start', 'normal')}
      ${svgText('Aarav Sharma', 300, 786, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Base Fee', 80, 820, 18, SLATE, 'start', 'normal')}
      ${svgText('₹2,000', 300, 820, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Transport', 80, 854, 18, SLATE, 'start', 'normal')}
      ${svgText('₹500', 300, 854, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Late Fee', 80, 888, 18, SLATE, 'start', 'normal')}
      ${svgText('₹150', 300, 888, 18, RED, 'start')}
      <line x1="60" y1="904" x2="${W - 60}" y2="904" stroke="#e2e8f0" stroke-width="1"/>
      ${svgText('Total', 80, 932, 22, DARK_BLUE, 'start')}
      ${svgText('₹2,650', W - 80, 932, 22, RED, 'end')}
    `)}

    <!-- Jan fee card (Paid) -->
    ${card(40, 980, W - 80, 220, `
      ${svgRect(40, 980, W - 80, 56, '#d1fae5', 16)}
      ${svgRect(40, 1020, W - 80, 4, '#d1fae5', 0)}
      ${svgText('January 2026', 80, 1016, 22, '#065f46', 'start')}
      ${svgRect(W - 170, 994, 90, 32, '#d1fae5', 8)}
      ${svgText('PAID', W - 125, 1016, 16, GREEN)}

      ${svgText('Student', 80, 1076, 18, SLATE, 'start', 'normal')}
      ${svgText('Aarav Sharma', 300, 1076, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Amount Paid', 80, 1110, 18, SLATE, 'start', 'normal')}
      ${svgText('₹2,500', 300, 1110, 18, GREEN, 'start')}
      ${svgText('Paid On', 80, 1144, 18, SLATE, 'start', 'normal')}
      ${svgText('Jan 15, 2026', 300, 1144, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Txn: RZP_abc123xyz', 80, 1178, 16, SLATE, 'start', 'normal')}
      ${svgRect(W - 230, 1160, 150, 32, '#dbeafe', 8)}
      ${svgText('Download Receipt', W - 155, 1182, 14, BLUE)}
    `)}

    <!-- Pay All button -->
    ${svgRect(40, 1260, W - 80, 70, BLUE, 16)}
    ${svgText('Pay All Dues  •  ₹5,150', W / 2, 1304, 26, WHITE)}

    <!-- Request Waiver link -->
    ${svgText('Request Fee Waiver', W / 2, 1370, 20, BLUE, 'middle', 'normal')}
    <line x1="430" y1="1376" x2="650" y2="1376" stroke="${BLUE}" stroke-width="1"/>

    <!-- Payment methods -->
    ${card(40, 1410, W - 80, 180, `
      ${svgText('Payment Methods', 80, 1450, 22, DARK_BLUE, 'start')}
      <line x1="60" y1="1466" x2="${W - 60}" y2="1466" stroke="#e2e8f0" stroke-width="1"/>
      ${svgRect(60, 1484, 200, 44, '#dbeafe', 10)}
      ${svgText('Razorpay', 160, 1512, 18, BLUE)}
      ${svgRect(280, 1484, 200, 44, WHITE, 10)}
      <rect x="280" y="1484" width="200" height="44" fill="none" stroke="#e2e8f0" stroke-width="1" rx="10"/>
      ${svgText('UPI', 380, 1512, 18, SLATE)}
      ${svgRect(500, 1484, 200, 44, WHITE, 10)}
      <rect x="500" y="1484" width="200" height="44" fill="none" stroke="#e2e8f0" stroke-width="1" rx="10"/>
      ${svgText('Card', 600, 1512, 18, SLATE)}
      ${svgText('Powered by Razorpay  •  Secure Payment', W / 2, 1574, 16, SLATE, 'middle', 'normal')}
    `)}

    ${phoneBottomNav(W, 1)}
  </svg>`;
}

// Screenshot 3: Live Bus Tracking
function screenshot3_tracking() {
  const W = 1080, H = 1920;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgRect(0, 0, W, H, LIGHT_GRAY)}
    ${phoneStatusBar(W)}
    ${phoneHeader('Live Tracking', W)}

    <!-- Map area -->
    ${svgRect(0, 140, W, 900, '#e0f2fe')}
    <!-- Map grid lines -->
    <line x1="0" y1="300" x2="${W}" y2="300" stroke="#bfdbfe" stroke-width="0.5"/>
    <line x1="0" y1="460" x2="${W}" y2="460" stroke="#bfdbfe" stroke-width="0.5"/>
    <line x1="0" y1="620" x2="${W}" y2="620" stroke="#bfdbfe" stroke-width="0.5"/>
    <line x1="0" y1="780" x2="${W}" y2="780" stroke="#bfdbfe" stroke-width="0.5"/>
    <line x1="200" y1="140" x2="200" y2="1040" stroke="#bfdbfe" stroke-width="0.5"/>
    <line x1="400" y1="140" x2="400" y2="1040" stroke="#bfdbfe" stroke-width="0.5"/>
    <line x1="600" y1="140" x2="600" y2="1040" stroke="#bfdbfe" stroke-width="0.5"/>
    <line x1="800" y1="140" x2="800" y2="1040" stroke="#bfdbfe" stroke-width="0.5"/>

    <!-- Roads -->
    <line x1="100" y1="200" x2="900" y2="800" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"/>
    <line x1="300" y1="900" x2="800" y2="300" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
    <line x1="50" y1="600" x2="1000" y2="550" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>

    <!-- Route path -->
    <path d="M200,800 Q400,500 500,450 Q650,380 750,350 Q850,300 900,250" stroke="${BLUE}" stroke-width="5" fill="none" stroke-dasharray="12,8"/>

    <!-- Bus icon -->
    ${svgRect(470, 410, 70, 50, YELLOW, 8)}
    ${svgRect(480, 400, 50, 16, DARK_BLUE, 4)}
    ${svgText('🚌', 505, 446, 28, DARK_BLUE)}
    ${svgCircle(488, 464, 8, '#333')}
    ${svgCircle(530, 464, 8, '#333')}

    <!-- School marker -->
    ${svgCircle(880, 260, 20, RED)}
    ${svgText('🏫', 880, 268, 18, WHITE)}
    ${svgRect(830, 218, 100, 30, WHITE, 8)}
    ${svgText('School', 880, 238, 16, DARK_BLUE)}

    <!-- Stop markers -->
    ${svgCircle(250, 760, 14, GREEN)}
    ${svgText('1', 250, 766, 16, WHITE)}
    ${svgCircle(400, 540, 14, BLUE)}
    ${svgText('2', 400, 546, 16, WHITE)}
    ${svgCircle(650, 400, 14, BLUE)}
    ${svgText('3', 650, 406, 16, WHITE)}

    <!-- Home marker -->
    ${svgCircle(200, 800, 20, GREEN)}
    ${svgText('🏠', 200, 808, 18)}
    ${svgRect(150, 758, 100, 30, WHITE, 8)}
    ${svgText('Home', 200, 778, 16, GREEN)}

    <!-- Info overlay on map -->
    ${svgRect(40, 920, W - 80, 80, 'rgba(255,255,255,0.95)', 12)}
    <rect x="40" y="920" width="${W - 80}" height="80" fill="none" stroke="#e2e8f0" stroke-width="1" rx="12"/>
    ${svgText('Bus #12  •  Route R-001', 80, 954, 22, DARK_BLUE, 'start')}
    ${svgText('Speed: 35 km/h  •  Last updated: Just now', 80, 984, 18, SLATE, 'start', 'normal')}
    ${svgRect(W - 200, 940, 120, 40, GREEN, 10)}
    ${svgText('On Time', W - 140, 966, 18, WHITE)}

    <!-- Bus details card -->
    ${card(40, 1060, W - 80, 230, `
      ${svgText('Trip Details', 80, 1100, 24, DARK_BLUE, 'start')}
      <line x1="60" y1="1116" x2="${W - 60}" y2="1116" stroke="#e2e8f0" stroke-width="1"/>

      ${svgText('Driver', 80, 1156, 18, SLATE, 'start', 'normal')}
      ${svgText('Ramesh Kumar', 350, 1156, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Vehicle', 80, 1190, 18, SLATE, 'start', 'normal')}
      ${svgText('KA-01-AB-1234', 350, 1190, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Distance', 80, 1224, 18, SLATE, 'start', 'normal')}
      ${svgText('2.3 km remaining', 350, 1224, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('ETA', 80, 1258, 18, SLATE, 'start', 'normal')}
      ${svgText('5 minutes', 350, 1258, 18, GREEN, 'start')}
    `)}

    <!-- Stops timeline -->
    ${card(40, 1320, W - 80, 340, `
      ${svgText('Route Stops', 80, 1360, 24, DARK_BLUE, 'start')}
      <line x1="60" y1="1376" x2="${W - 60}" y2="1376" stroke="#e2e8f0" stroke-width="1"/>

      <!-- Timeline line -->
      <line x1="110" y1="1410" x2="110" y2="1620" stroke="#e2e8f0" stroke-width="3"/>

      ${svgCircle(110, 1420, 12, GREEN)}
      ${svgText('✓', 110, 1426, 14, WHITE)}
      ${svgText('MG Road Stop', 150, 1418, 20, DARK_BLUE, 'start', 'normal')}
      ${svgText('7:15 AM - Completed', 150, 1444, 16, GREEN, 'start', 'normal')}

      ${svgCircle(110, 1490, 12, GREEN)}
      ${svgText('✓', 110, 1496, 14, WHITE)}
      ${svgText('Brigade Road', 150, 1488, 20, DARK_BLUE, 'start', 'normal')}
      ${svgText('7:25 AM - Completed', 150, 1514, 16, GREEN, 'start', 'normal')}

      ${svgCircle(110, 1560, 14, YELLOW)}
      ${svgText('→', 110, 1566, 14, DARK_BLUE)}
      ${svgText('Koramangala (Your Stop)', 150, 1558, 20, BLUE, 'start')}
      ${svgText('7:35 AM - Arriving in 5 min', 150, 1584, 16, AMBER, 'start', 'normal')}

      ${svgCircle(110, 1630, 12, '#e2e8f0')}
      ${svgText('DPS School', 150, 1628, 20, SLATE, 'start', 'normal')}
      ${svgText('7:50 AM - Upcoming', 150, 1654, 16, SLATE, 'start', 'normal')}
    `)}

    ${phoneBottomNav(W, 2)}
  </svg>`;
}

// Screenshot 4: Attendance
function screenshot4_attendance() {
  const W = 1080, H = 1920;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = ['17', '18', '19', '20', '21', '22'];

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgRect(0, 0, W, H, LIGHT_GRAY)}
    ${phoneStatusBar(W)}
    ${phoneHeader('Attendance', W)}

    <!-- Month selector -->
    ${card(40, 170, W - 80, 70, `
      ${svgText('◀', 100, 214, 28, BLUE, 'middle', 'normal')}
      ${svgText('March 2026', W / 2, 214, 26, DARK_BLUE)}
      ${svgText('▶', W - 100, 214, 28, BLUE, 'middle', 'normal')}
    `)}

    <!-- Student selector -->
    ${card(40, 270, W - 80, 80, `
      ${svgCircle(100, 310, 25, '#dbeafe')}
      ${svgText('A', 100, 318, 22, BLUE)}
      ${svgText('Aarav Sharma  •  Class 5A', 150, 314, 22, DARK_BLUE, 'start', 'normal')}
      ${svgText('▼', W - 80, 314, 22, SLATE, 'end', 'normal')}
    `)}

    <!-- Stats summary -->
    ${card(40, 380, 320, 130, `
      ${svgText('Present', 200, 425, 20, SLATE)}
      ${svgText('18', 200, 470, 48, GREEN)}
      ${svgText('days', 200, 494, 16, SLATE, 'middle', 'normal')}
    `)}
    ${card(380, 380, 340, 130, `
      ${svgText('Absent', 550, 425, 20, SLATE)}
      ${svgText('2', 550, 470, 48, RED)}
      ${svgText('days', 550, 494, 16, SLATE, 'middle', 'normal')}
    `)}
    ${card(740, 380, 300, 130, `
      ${svgText('Rate', 890, 425, 20, SLATE)}
      ${svgText('90%', 890, 470, 48, BLUE)}
      ${svgText('attendance', 890, 494, 16, SLATE, 'middle', 'normal')}
    `)}

    <!-- Calendar header -->
    ${card(40, 540, W - 80, 660, `
      ${svgText('Weekly View', 80, 580, 24, DARK_BLUE, 'start')}
      <line x1="60" y1="596" x2="${W - 60}" y2="596" stroke="#e2e8f0" stroke-width="1"/>

      ${days.map((d, i) => svgText(d, 110 + i * 160, 630, 18, SLATE)).join('')}
      ${dates.map((d, i) => {
        const x = 110 + i * 160;
        const present = d !== '20';
        return `
          ${svgCircle(x, 680, 28, present ? '#d1fae5' : '#fee2e2')}
          ${svgText(d, x, 688, 20, present ? GREEN : RED)}
        `;
      }).join('')}

      <!-- Pickup/Drop detail rows -->
      ${svgText('Pickup', 80, 740, 18, SLATE, 'start', 'normal')}
      ${['7:30', '7:32', '7:28', '—', '7:31', '—'].map((t, i) =>
        svgText(t, 110 + i * 160, 740, 16, t === '—' ? RED : DARK_BLUE, 'middle', 'normal')
      ).join('')}

      ${svgText('Drop', 80, 780, 18, SLATE, 'start', 'normal')}
      ${['3:45', '3:42', '3:48', '—', '3:44', '—'].map((t, i) =>
        svgText(t, 110 + i * 160, 780, 16, t === '—' ? RED : DARK_BLUE, 'middle', 'normal')
      ).join('')}

      <line x1="60" y1="810" x2="${W - 60}" y2="810" stroke="#e2e8f0" stroke-width="1"/>

      <!-- Previous week -->
      ${svgText('Previous Week (Mar 10 - 15)', 80, 850, 20, DARK_BLUE, 'start')}
      ${['10', '11', '12', '13', '14', '15'].map((d, i) => {
        const x = 110 + i * 160;
        return `
          ${svgCircle(x, 900, 28, '#d1fae5')}
          ${svgText(d, x, 908, 20, GREEN)}
        `;
      }).join('')}

      ${svgText('Pickup', 80, 960, 18, SLATE, 'start', 'normal')}
      ${['7:29', '7:33', '7:30', '7:28', '7:31', '—'].map((t, i) =>
        svgText(t, 110 + i * 160, 960, 16, t === '—' ? SLATE : DARK_BLUE, 'middle', 'normal')
      ).join('')}

      ${svgText('Drop', 80, 1000, 18, SLATE, 'start', 'normal')}
      ${['3:46', '3:41', '3:45', '3:43', '3:47', '—'].map((t, i) =>
        svgText(t, 110 + i * 160, 1000, 16, t === '—' ? SLATE : DARK_BLUE, 'middle', 'normal')
      ).join('')}

      <!-- Legend -->
      <line x1="60" y1="1040" x2="${W - 60}" y2="1040" stroke="#e2e8f0" stroke-width="1"/>
      ${svgCircle(100, 1080, 12, '#d1fae5')}
      ${svgText('Present', 130, 1086, 16, SLATE, 'start', 'normal')}
      ${svgCircle(260, 1080, 12, '#fee2e2')}
      ${svgText('Absent', 290, 1086, 16, SLATE, 'start', 'normal')}
      ${svgCircle(410, 1080, 12, '#e2e8f0')}
      ${svgText('Holiday', 440, 1086, 16, SLATE, 'start', 'normal')}
    `)}

    <!-- Notifications card -->
    ${card(40, 1230, W - 80, 200, `
      ${svgText('Attendance Alerts', 80, 1270, 24, DARK_BLUE, 'start')}
      <line x1="60" y1="1286" x2="${W - 60}" y2="1286" stroke="#e2e8f0" stroke-width="1"/>

      ${svgCircle(90, 1326, 18, '#fee2e2')}
      ${svgText('!', 90, 1332, 16, RED)}
      ${svgText('Aarav was absent on Thu, Mar 20', 130, 1320, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('No pickup or drop recorded', 130, 1346, 16, SLATE, 'start', 'normal')}

      ${svgCircle(90, 1396, 18, '#d1fae5')}
      ${svgText('✓', 90, 1402, 16, GREEN)}
      ${svgText('Bus picked up Aarav at 7:31 AM today', 130, 1390, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Boarding point: Koramangala', 130, 1416, 16, SLATE, 'start', 'normal')}
    `)}

    <!-- Download report -->
    ${svgRect(40, 1470, W - 80, 60, WHITE, 12)}
    <rect x="40" y="1470" width="${W - 80}" height="60" fill="none" stroke="${BLUE}" stroke-width="2" rx="12"/>
    ${svgText('Download Monthly Report', W / 2, 1508, 22, BLUE)}

    ${phoneBottomNav(W, 3)}
  </svg>`;
}

// Screenshot 5: Notifications & Settings
function screenshot5_notifications() {
  const W = 1080, H = 1920;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgRect(0, 0, W, H, LIGHT_GRAY)}
    ${phoneStatusBar(W)}
    ${phoneHeader('Notifications', W)}

    <!-- Filter row -->
    ${svgRect(40, 170, 160, 44, BLUE, 10)}
    ${svgText('All', 120, 198, 18, WHITE)}
    ${svgRect(220, 170, 160, 44, WHITE, 10)}
    ${svgText('Fees', 300, 198, 18, SLATE)}
    ${svgRect(400, 170, 160, 44, WHITE, 10)}
    ${svgText('Bus', 480, 198, 18, SLATE)}
    ${svgRect(580, 170, 190, 44, WHITE, 10)}
    ${svgText('Updates', 675, 198, 18, SLATE)}

    <!-- Unread badge -->
    ${svgText('3 unread', W - 80, 198, 18, BLUE, 'end', 'normal')}

    <!-- Today section -->
    ${svgText('Today', 80, 260, 20, SLATE, 'start')}

    <!-- Notification 1 - Fee -->
    ${card(40, 280, W - 80, 130, `
      ${svgRect(40, 280, 6, 130, AMBER, 0)}
      ${svgCircle(90, 320, 24, '#fef3c7')}
      ${svgText('₹', 90, 328, 22, AMBER)}
      ${svgText('Fee Reminder', 140, 314, 22, DARK_BLUE, 'start')}
      ${svgText('2 hours ago', W - 80, 314, 16, SLATE, 'end', 'normal')}
      ${svgText('March 2026 fee of ₹2,500 is due. Pay before', 140, 348, 18, SLATE, 'start', 'normal')}
      ${svgText('March 31 to avoid late fees.', 140, 374, 18, SLATE, 'start', 'normal')}
      ${svgCircle(W - 80, 370, 6, BLUE)}
    `)}

    <!-- Notification 2 - Bus -->
    ${card(40, 430, W - 80, 130, `
      ${svgRect(40, 430, 6, 130, GREEN, 0)}
      ${svgCircle(90, 470, 24, '#d1fae5')}
      ${svgText('🚌', 90, 478, 18)}
      ${svgText('Bus Update', 140, 464, 22, DARK_BLUE, 'start')}
      ${svgText('3 hours ago', W - 80, 464, 16, SLATE, 'end', 'normal')}
      ${svgText('Aarav was picked up at 7:31 AM from', 140, 498, 18, SLATE, 'start', 'normal')}
      ${svgText('Koramangala boarding point.', 140, 524, 18, SLATE, 'start', 'normal')}
      ${svgCircle(W - 80, 520, 6, BLUE)}
    `)}

    <!-- Notification 3 - Payment -->
    ${card(40, 580, W - 80, 130, `
      ${svgRect(40, 580, 6, 130, GREEN, 0)}
      ${svgCircle(90, 620, 24, '#d1fae5')}
      ${svgText('✓', 90, 628, 22, GREEN)}
      ${svgText('Payment Successful', 140, 614, 22, DARK_BLUE, 'start')}
      ${svgText('5 hours ago', W - 80, 614, 16, SLATE, 'end', 'normal')}
      ${svgText('₹2,500 payment for February 2026 received.', 140, 648, 18, SLATE, 'start', 'normal')}
      ${svgText('Receipt #RCP-2026-0215 generated.', 140, 674, 18, SLATE, 'start', 'normal')}
      ${svgCircle(W - 80, 670, 6, BLUE)}
    `)}

    <!-- Yesterday section -->
    ${svgText('Yesterday', 80, 754, 20, SLATE, 'start')}

    ${card(40, 774, W - 80, 110, `
      ${svgCircle(90, 814, 24, '#dbeafe')}
      ${svgText('ℹ', 90, 822, 22, BLUE)}
      ${svgText('Route Update', 140, 808, 22, DARK_BLUE, 'start')}
      ${svgText('Yesterday', W - 80, 808, 16, SLATE, 'end', 'normal')}
      ${svgText('Route R-001 timing adjusted. New pickup: 7:30 AM.', 140, 842, 18, SLATE, 'start', 'normal')}
    `)}

    ${card(40, 904, W - 80, 110, `
      ${svgCircle(90, 944, 24, '#fef3c7')}
      ${svgText('⚡', 90, 952, 18)}
      ${svgText('Attendance Alert', 140, 938, 22, DARK_BLUE, 'start')}
      ${svgText('Yesterday', W - 80, 938, 16, SLATE, 'end', 'normal')}
      ${svgText('Aarav marked absent for Thursday, March 20.', 140, 972, 18, SLATE, 'start', 'normal')}
    `)}

    <!-- Earlier section -->
    ${svgText('Earlier this week', 80, 1060, 20, SLATE, 'start')}

    ${card(40, 1080, W - 80, 110, `
      ${svgCircle(90, 1120, 24, '#d1fae5')}
      ${svgText('🎉', 90, 1128, 18)}
      ${svgText('Waiver Approved', 140, 1114, 22, DARK_BLUE, 'start')}
      ${svgText('Mar 18', W - 80, 1114, 16, SLATE, 'end', 'normal')}
      ${svgText('Your fee waiver request for Dec 2025 has been approved.', 140, 1148, 18, SLATE, 'start', 'normal')}
    `)}

    ${card(40, 1210, W - 80, 110, `
      ${svgCircle(90, 1250, 24, '#dbeafe')}
      ${svgText('📋', 90, 1258, 18)}
      ${svgText('New Fee Generated', 140, 1244, 22, DARK_BLUE, 'start')}
      ${svgText('Mar 1', W - 80, 1244, 16, SLATE, 'end', 'normal')}
      ${svgText('March 2026 fee of ₹2,500 has been generated.', 140, 1278, 18, SLATE, 'start', 'normal')}
    `)}

    <!-- Mark all read -->
    ${svgRect(40, 1380, W - 80, 56, WHITE, 12)}
    <rect x="40" y="1380" width="${W - 80}" height="56" fill="none" stroke="${BLUE}" stroke-width="1.5" rx="12"/>
    ${svgText('Mark All as Read', W / 2, 1416, 20, BLUE)}

    <!-- Notification preferences -->
    ${card(40, 1470, W - 80, 200, `
      ${svgText('Notification Preferences', 80, 1510, 22, DARK_BLUE, 'start')}
      <line x1="60" y1="1526" x2="${W - 60}" y2="1526" stroke="#e2e8f0" stroke-width="1"/>

      ${svgText('Push Notifications', 80, 1566, 20, DARK_BLUE, 'start', 'normal')}
      ${svgRect(W - 140, 1548, 60, 32, GREEN, 16)}
      ${svgCircle(W - 96, 1564, 12, WHITE)}

      ${svgText('SMS Alerts', 80, 1610, 20, DARK_BLUE, 'start', 'normal')}
      ${svgRect(W - 140, 1592, 60, 32, GREEN, 16)}
      ${svgCircle(W - 96, 1608, 12, WHITE)}

      ${svgText('Email Notifications', 80, 1654, 20, DARK_BLUE, 'start', 'normal')}
      ${svgRect(W - 140, 1636, 60, 32, '#e2e8f0', 16)}
      ${svgCircle(W - 164, 1652, 12, WHITE)}
    `)}

    ${phoneBottomNav(W, 3)}
  </svg>`;
}

// ─── FEATURE GRAPHIC (1024x500) ───

function featureGraphic() {
  const W = 1024, H = 500;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${DARK_BLUE}"/>
        <stop offset="100%" style="stop-color:${BLUE}"/>
      </linearGradient>
    </defs>
    ${svgRect(0, 0, W, H, 'url(#bg)')}

    <!-- Decorative circles -->
    ${svgCircle(-50, -50, 200, 'rgba(255,255,255,0.03)')}
    ${svgCircle(W + 50, H + 50, 250, 'rgba(255,255,255,0.03)')}
    ${svgCircle(W - 100, 80, 120, 'rgba(255,255,255,0.04)')}

    <!-- Bus icon area -->
    ${svgRect(60, 80, 300, 300, YELLOW, 30)}
    <!-- Bus body -->
    ${svgRect(110, 180, 200, 110, DARK_BLUE, 14)}
    <!-- Windows top -->
    ${svgRect(130, 150, 50, 40, WHITE, 6)}
    ${svgRect(195, 150, 50, 40, WHITE, 6)}
    ${svgRect(260, 150, 50, 40, WHITE, 6)}
    <!-- Windows bottom -->
    ${svgRect(130, 200, 40, 36, WHITE, 4)}
    ${svgRect(185, 200, 40, 36, WHITE, 4)}
    ${svgRect(240, 200, 40, 36, WHITE, 4)}
    <!-- Yellow body -->
    ${svgRect(110, 250, 200, 60, YELLOW, 0)}
    <!-- Wheels -->
    ${svgCircle(155, 320, 22, '#333')}
    ${svgCircle(155, 320, 10, '#666')}
    ${svgCircle(265, 320, 22, '#333')}
    ${svgCircle(265, 320, 10, '#666')}

    <!-- Text -->
    ${svgText('School BusWay Pro', 680, 150, 52, WHITE)}
    ${svgText('Smart Fee Management', 680, 210, 34, YELLOW)}

    <line x1="460" y1="240" x2="900" y2="240" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>

    ${svgText('✓  Real-time bus tracking', 490, 290, 26, '#93c5fd', 'start', 'normal')}
    ${svgText('✓  Secure online payments', 490, 330, 26, '#93c5fd', 'start', 'normal')}
    ${svgText('✓  Attendance monitoring', 490, 370, 26, '#93c5fd', 'start', 'normal')}
    ${svgText('✓  Instant notifications', 490, 410, 26, '#93c5fd', 'start', 'normal')}
  </svg>`;
}

// ─── TABLET SCREENSHOTS ───

function tablet7_screenshot1() {
  // 7-inch: 1080x1920 (same as phone but with slightly different layout)
  const W = 1080, H = 1920;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgRect(0, 0, W, H, LIGHT_GRAY)}
    ${phoneStatusBar(W)}
    ${phoneHeader('Admin Dashboard', W)}

    <!-- Stats row -->
    ${card(40, 170, 490, 160, `
      ${svgText('Total Students', 285, 220, 20, SLATE)}
      ${svgText('245', 285, 270, 52, BLUE)}
      ${svgText('+12 this month', 285, 306, 16, GREEN, 'middle', 'normal')}
    `)}
    ${card(550, 170, 490, 160, `
      ${svgText('Active Buses', 795, 220, 20, SLATE)}
      ${svgText('18', 795, 270, 52, GREEN)}
      ${svgText('2 in maintenance', 795, 306, 16, AMBER, 'middle', 'normal')}
    `)}

    ${card(40, 360, 490, 160, `
      ${svgText('Revenue (March)', 285, 410, 20, SLATE)}
      ${svgText('₹4.8L', 285, 460, 52, DARK_BLUE)}
      ${svgText('78% collected', 285, 496, 16, GREEN, 'middle', 'normal')}
    `)}
    ${card(550, 360, 490, 160, `
      ${svgText('Attendance Rate', 795, 410, 20, SLATE)}
      ${svgText('94%', 795, 460, 52, GREEN)}
      ${svgText('This week', 795, 496, 16, SLATE, 'middle', 'normal')}
    `)}

    <!-- Chart area -->
    ${card(40, 550, W - 80, 400, `
      ${svgText('Fee Collection Trend', 80, 590, 24, DARK_BLUE, 'start')}
      <line x1="60" y1="606" x2="${W - 60}" y2="606" stroke="#e2e8f0" stroke-width="1"/>

      <!-- Y axis -->
      ${svgText('₹5L', 100, 660, 14, SLATE, 'end', 'normal')}
      ${svgText('₹4L', 100, 720, 14, SLATE, 'end', 'normal')}
      ${svgText('₹3L', 100, 780, 14, SLATE, 'end', 'normal')}
      ${svgText('₹2L', 100, 840, 14, SLATE, 'end', 'normal')}
      ${svgText('₹1L', 100, 900, 14, SLATE, 'end', 'normal')}

      <!-- Grid lines -->
      <line x1="120" y1="654" x2="${W - 80}" y2="654" stroke="#f1f5f9" stroke-width="1"/>
      <line x1="120" y1="714" x2="${W - 80}" y2="714" stroke="#f1f5f9" stroke-width="1"/>
      <line x1="120" y1="774" x2="${W - 80}" y2="774" stroke="#f1f5f9" stroke-width="1"/>
      <line x1="120" y1="834" x2="${W - 80}" y2="834" stroke="#f1f5f9" stroke-width="1"/>
      <line x1="120" y1="894" x2="${W - 80}" y2="894" stroke="#f1f5f9" stroke-width="1"/>

      <!-- Bar chart -->
      ${['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m, i) => {
        const heights = [180, 200, 160, 220, 210, 140];
        const x = 180 + i * 140;
        const h = heights[i];
        const y = 894 - h;
        return `
          ${svgRect(x, y, 80, h, i === 5 ? '#93c5fd' : BLUE, 6)}
          ${svgText(m, x + 40, 920, 14, SLATE, 'middle', 'normal')}
        `;
      }).join('')}
    `)}

    <!-- Recent payments -->
    ${card(40, 980, W - 80, 480, `
      ${svgText('Recent Payments', 80, 1020, 24, DARK_BLUE, 'start')}
      ${svgText('View All →', W - 80, 1020, 18, BLUE, 'end', 'normal')}
      <line x1="60" y1="1036" x2="${W - 60}" y2="1036" stroke="#e2e8f0" stroke-width="1"/>

      <!-- Table header -->
      ${svgText('Student', 80, 1070, 16, SLATE, 'start')}
      ${svgText('Amount', 500, 1070, 16, SLATE, 'start')}
      ${svgText('Status', 700, 1070, 16, SLATE, 'start')}
      ${svgText('Date', 900, 1070, 16, SLATE, 'start')}

      <!-- Row 1 -->
      ${svgText('Aarav Sharma', 80, 1110, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('₹2,500', 500, 1110, 18, DARK_BLUE, 'start', 'normal')}
      ${svgRect(680, 1094, 80, 26, '#d1fae5', 6)}
      ${svgText('Paid', 720, 1112, 14, GREEN)}
      ${svgText('Mar 15', 900, 1110, 18, SLATE, 'start', 'normal')}

      <!-- Row 2 -->
      ${svgText('Priya Patel', 80, 1158, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('₹3,000', 500, 1158, 18, DARK_BLUE, 'start', 'normal')}
      ${svgRect(680, 1142, 100, 26, '#d1fae5', 6)}
      ${svgText('Paid', 730, 1160, 14, GREEN)}
      ${svgText('Mar 14', 900, 1158, 18, SLATE, 'start', 'normal')}

      <!-- Row 3 -->
      ${svgText('Rahul Singh', 80, 1206, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('₹2,500', 500, 1206, 18, DARK_BLUE, 'start', 'normal')}
      ${svgRect(680, 1190, 100, 26, '#fef3c7', 6)}
      ${svgText('Pending', 730, 1208, 14, AMBER)}
      ${svgText('Mar 10', 900, 1206, 18, SLATE, 'start', 'normal')}

      <!-- Row 4 -->
      ${svgText('Meera Gupta', 80, 1254, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('₹2,800', 500, 1254, 18, DARK_BLUE, 'start', 'normal')}
      ${svgRect(680, 1238, 100, 26, '#fee2e2', 6)}
      ${svgText('Overdue', 730, 1256, 14, RED)}
      ${svgText('Feb 28', 900, 1254, 18, SLATE, 'start', 'normal')}

      <!-- Row 5 -->
      ${svgText('Karan Das', 80, 1302, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('₹2,500', 500, 1302, 18, DARK_BLUE, 'start', 'normal')}
      ${svgRect(680, 1286, 80, 26, '#d1fae5', 6)}
      ${svgText('Paid', 720, 1304, 14, GREEN)}
      ${svgText('Mar 12', 900, 1302, 18, SLATE, 'start', 'normal')}

      <!-- Row 6 -->
      ${svgText('Anita Verma', 80, 1350, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('₹3,200', 500, 1350, 18, DARK_BLUE, 'start', 'normal')}
      ${svgRect(680, 1334, 80, 26, '#d1fae5', 6)}
      ${svgText('Paid', 720, 1352, 14, GREEN)}
      ${svgText('Mar 11', 900, 1350, 18, SLATE, 'start', 'normal')}

      <!-- Row 7 -->
      ${svgText('Neha Reddy', 80, 1398, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('₹2,500', 500, 1398, 18, DARK_BLUE, 'start', 'normal')}
      ${svgRect(680, 1382, 100, 26, '#fef3c7', 6)}
      ${svgText('Pending', 730, 1400, 14, AMBER)}
      ${svgText('Mar 8', 900, 1398, 18, SLATE, 'start', 'normal')}
    `)}

    <!-- Defaulters alert -->
    ${card(40, 1490, W - 80, 160, `
      ${svgRect(40, 1490, W - 80, 160, '#fef2f2', 16)}
      ${svgText('⚠  Fee Defaulters', 80, 1530, 22, RED, 'start')}
      <line x1="60" y1="1546" x2="${W - 60}" y2="1546" stroke="#fecaca" stroke-width="1"/>
      ${svgText('12 students have overdue payments totaling ₹38,400', 80, 1580, 18, '#991b1b', 'start', 'normal')}
      ${svgRect(80, 1600, 180, 36, RED, 8)}
      ${svgText('View Details', 170, 1624, 16, WHITE)}
      ${svgText('Send Reminders', 360, 1624, 16, RED, 'start', 'normal')}
    `)}

    ${phoneBottomNav(W, 0)}
  </svg>`;
}

function tablet7_screenshot2() {
  const W = 1080, H = 1920;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgRect(0, 0, W, H, LIGHT_GRAY)}
    ${phoneStatusBar(W)}
    ${phoneHeader('Bus Management', W)}

    <!-- Search bar -->
    ${card(40, 170, W - 80, 60, `
      ${svgText('🔍  Search buses, routes, drivers...', 80, 208, 20, '#94a3b8', 'start', 'normal')}
    `)}

    <!-- Bus cards -->
    ${card(40, 260, W - 80, 200, `
      ${svgRect(40, 260, W - 80, 60, '#d1fae5', 16)}
      ${svgRect(40, 304, W - 80, 4, '#d1fae5', 0)}
      ${svgText('Bus #12', 80, 298, 24, '#065f46', 'start')}
      ${svgRect(W - 200, 276, 100, 32, '#10b981', 8)}
      ${svgText('Active', W - 150, 298, 16, WHITE)}

      ${svgText('Route', 80, 356, 18, SLATE, 'start', 'normal')}
      ${svgText('R-001 (Koramangala - DPS)', 300, 356, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Driver', 80, 390, 18, SLATE, 'start', 'normal')}
      ${svgText('Ramesh Kumar', 300, 390, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Capacity', 80, 424, 18, SLATE, 'start', 'normal')}
      ${svgText('32/40 students', 300, 424, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Plate', 600, 424, 18, SLATE, 'start', 'normal')}
      ${svgText('KA-01-AB-1234', 700, 424, 18, DARK_BLUE, 'start', 'normal')}
    `)}

    ${card(40, 490, W - 80, 200, `
      ${svgRect(40, 490, W - 80, 60, '#d1fae5', 16)}
      ${svgRect(40, 534, W - 80, 4, '#d1fae5', 0)}
      ${svgText('Bus #15', 80, 528, 24, '#065f46', 'start')}
      ${svgRect(W - 200, 506, 100, 32, '#10b981', 8)}
      ${svgText('Active', W - 150, 528, 16, WHITE)}

      ${svgText('Route', 80, 586, 18, SLATE, 'start', 'normal')}
      ${svgText('R-003 (HSR Layout - DPS)', 300, 586, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Driver', 80, 620, 18, SLATE, 'start', 'normal')}
      ${svgText('Suresh Yadav', 300, 620, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Capacity', 80, 654, 18, SLATE, 'start', 'normal')}
      ${svgText('28/40 students', 300, 654, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Plate', 600, 654, 18, SLATE, 'start', 'normal')}
      ${svgText('KA-01-CD-5678', 700, 654, 18, DARK_BLUE, 'start', 'normal')}
    `)}

    ${card(40, 720, W - 80, 200, `
      ${svgRect(40, 720, W - 80, 60, '#fef3c7', 16)}
      ${svgRect(40, 764, W - 80, 4, '#fef3c7', 0)}
      ${svgText('Bus #08', 80, 758, 24, '#92400e', 'start')}
      ${svgRect(W - 250, 736, 150, 32, AMBER, 8)}
      ${svgText('Maintenance', W - 175, 758, 16, WHITE)}

      ${svgText('Route', 80, 816, 18, SLATE, 'start', 'normal')}
      ${svgText('R-005 (Whitefield - DPS)', 300, 816, 18, DARK_BLUE, 'start', 'normal')}
      ${svgText('Driver', 80, 850, 18, SLATE, 'start', 'normal')}
      ${svgText('Unassigned', 300, 850, 18, AMBER, 'start', 'normal')}
      ${svgText('Capacity', 80, 884, 18, SLATE, 'start', 'normal')}
      ${svgText('0/36 students', 300, 884, 18, SLATE, 'start', 'normal')}
      ${svgText('Due', 600, 884, 18, SLATE, 'start', 'normal')}
      ${svgText('Mar 28', 700, 884, 18, RED, 'start', 'normal')}
    `)}

    <!-- Quick actions -->
    ${svgRect(40, 960, 490, 60, BLUE, 12)}
    ${svgText('+ Add New Bus', 285, 998, 22, WHITE)}
    ${svgRect(550, 960, 490, 60, WHITE, 12)}
    <rect x="550" y="960" width="490" height="60" fill="none" stroke="${BLUE}" stroke-width="2" rx="12"/>
    ${svgText('Manage Routes', 795, 998, 22, BLUE)}

    <!-- Fleet summary -->
    ${card(40, 1060, W - 80, 300, `
      ${svgText('Fleet Summary', 80, 1100, 24, DARK_BLUE, 'start')}
      <line x1="60" y1="1116" x2="${W - 60}" y2="1116" stroke="#e2e8f0" stroke-width="1"/>

      ${svgText('Total Buses', 80, 1160, 20, SLATE, 'start', 'normal')}
      ${svgText('20', W - 80, 1160, 20, DARK_BLUE, 'end')}
      ${svgText('Active', 80, 1200, 20, SLATE, 'start', 'normal')}
      ${svgText('18', W - 80, 1200, 20, GREEN, 'end')}
      ${svgText('In Maintenance', 80, 1240, 20, SLATE, 'start', 'normal')}
      ${svgText('2', W - 80, 1240, 20, AMBER, 'end')}
      ${svgText('Total Routes', 80, 1280, 20, SLATE, 'start', 'normal')}
      ${svgText('15', W - 80, 1280, 20, DARK_BLUE, 'end')}
      ${svgText('Avg. Occupancy', 80, 1320, 20, SLATE, 'start', 'normal')}
      ${svgText('78%', W - 80, 1320, 20, BLUE, 'end')}
    `)}

    ${phoneBottomNav(W, 3)}
  </svg>`;
}

// 10-inch tablet screenshots (1200x1920)
function tablet10_screenshot1() {
  const W = 1200, H = 1920;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgRect(0, 0, W, H, LIGHT_GRAY)}
    ${svgRect(0, 0, W, 44, DARK_BLUE)}
    ${svgText('9:41', 50, 32, 24, WHITE, 'start', 'normal')}
    ${svgRect(0, 44, W, 96, BLUE)}
    ${svgText('Student Management', W / 2, 104, 38, YELLOW)}

    <!-- Search + filter -->
    ${card(40, 170, W - 260, 60, `
      ${svgText('🔍  Search students by name, class, or admission...', 80, 208, 20, '#94a3b8', 'start', 'normal')}
    `)}
    ${svgRect(W - 200, 170, 160, 60, BLUE, 12)}
    ${svgText('+ Add Student', W - 120, 208, 20, WHITE)}

    <!-- Student table -->
    ${card(40, 260, W - 80, 1400, `
      ${svgText('All Students (245)', 80, 300, 24, DARK_BLUE, 'start')}
      ${svgText('Export CSV', W - 100, 300, 18, BLUE, 'end', 'normal')}
      <line x1="60" y1="316" x2="${W - 60}" y2="316" stroke="#e2e8f0" stroke-width="1"/>

      <!-- Header -->
      ${svgText('#', 80, 350, 16, SLATE, 'start')}
      ${svgText('Name', 140, 350, 16, SLATE, 'start')}
      ${svgText('Class', 380, 350, 16, SLATE, 'start')}
      ${svgText('Admission', 500, 350, 16, SLATE, 'start')}
      ${svgText('Bus', 650, 350, 16, SLATE, 'start')}
      ${svgText('Route', 750, 350, 16, SLATE, 'start')}
      ${svgText('Fee Status', 920, 350, 16, SLATE, 'start')}
      ${svgText('Actions', W - 120, 350, 16, SLATE, 'start')}
      <line x1="60" y1="366" x2="${W - 60}" y2="366" stroke="#e2e8f0" stroke-width="1"/>

      ${[
        ['1', 'Aarav Sharma', '5A', 'ADM-2024-001', '#12', 'R-001', 'Paid', GREEN],
        ['2', 'Priya Patel', '4B', 'ADM-2024-015', '#15', 'R-003', 'Paid', GREEN],
        ['3', 'Rahul Singh', '6A', 'ADM-2023-042', '#12', 'R-001', 'Pending', AMBER],
        ['4', 'Meera Gupta', '3C', 'ADM-2024-067', '#08', 'R-005', 'Overdue', RED],
        ['5', 'Karan Das', '5A', 'ADM-2024-003', '#15', 'R-003', 'Paid', GREEN],
        ['6', 'Anita Verma', '7B', 'ADM-2022-089', '#12', 'R-001', 'Paid', GREEN],
        ['7', 'Neha Reddy', '4A', 'ADM-2024-023', '#18', 'R-007', 'Pending', AMBER],
        ['8', 'Vikram Joshi', '6B', 'ADM-2023-055', '#15', 'R-003', 'Paid', GREEN],
        ['9', 'Sanya Iyer', '3A', 'ADM-2024-078', '#08', 'R-005', 'Paid', GREEN],
        ['10', 'Arjun Nair', '5B', 'ADM-2024-012', '#12', 'R-001', 'Overdue', RED],
        ['11', 'Diya Kapoor', '4C', 'ADM-2024-034', '#18', 'R-007', 'Paid', GREEN],
        ['12', 'Rishi Malhotra', '7A', 'ADM-2022-091', '#15', 'R-003', 'Pending', AMBER],
        ['13', 'Pooja Rao', '3B', 'ADM-2024-056', '#12', 'R-001', 'Paid', GREEN],
        ['14', 'Aditya Kumar', '6A', 'ADM-2023-044', '#18', 'R-007', 'Paid', GREEN],
        ['15', 'Kavya Menon', '5A', 'ADM-2024-009', '#08', 'R-005', 'Pending', AMBER],
        ['16', 'Ishaan Bhat', '4A', 'ADM-2024-028', '#15', 'R-003', 'Paid', GREEN],
        ['17', 'Tara Chopra', '7B', 'ADM-2022-095', '#12', 'R-001', 'Paid', GREEN],
        ['18', 'Rohan Pillai', '3C', 'ADM-2024-071', '#18', 'R-007', 'Overdue', RED],
        ['19', 'Simran Kaur', '6B', 'ADM-2023-060', '#15', 'R-003', 'Paid', GREEN],
        ['20', 'Dev Agarwal', '5B', 'ADM-2024-017', '#12', 'R-001', 'Paid', GREEN],
      ].map(([num, name, cls, adm, bus, route, status, color], i) => {
        const y = 400 + i * 48;
        const bgColor = i % 2 === 0 ? '#f8fafc' : WHITE;
        const statusBg = color === GREEN ? '#d1fae5' : color === AMBER ? '#fef3c7' : '#fee2e2';
        return `
          ${svgRect(60, y - 20, W - 120, 48, bgColor, 0)}
          ${svgText(num, 80, y + 6, 16, SLATE, 'start', 'normal')}
          ${svgText(name, 140, y + 6, 16, DARK_BLUE, 'start', 'normal')}
          ${svgText(cls, 380, y + 6, 16, DARK_BLUE, 'start', 'normal')}
          ${svgText(adm, 500, y + 6, 14, SLATE, 'start', 'normal')}
          ${svgText(bus, 650, y + 6, 16, DARK_BLUE, 'start', 'normal')}
          ${svgText(route, 750, y + 6, 16, DARK_BLUE, 'start', 'normal')}
          ${svgRect(900, y - 10, 90, 28, statusBg, 6)}
          ${svgText(status, 945, y + 8, 14, color)}
          ${svgText('Edit', W - 140, y + 6, 16, BLUE, 'start', 'normal')}
          ${svgText('View', W - 80, y + 6, 16, SLATE, 'start', 'normal')}
        `;
      }).join('')}

      <!-- Pagination -->
      <line x1="60" y1="1370" x2="${W - 60}" y2="1370" stroke="#e2e8f0" stroke-width="1"/>
      ${svgText('Showing 1-20 of 245 students', 80, 1400, 16, SLATE, 'start', 'normal')}
      ${svgRect(W - 400, 1382, 40, 32, '#dbeafe', 6)}
      ${svgText('1', W - 380, 1404, 16, BLUE)}
      ${svgRect(W - 350, 1382, 40, 32, WHITE, 6)}
      ${svgText('2', W - 330, 1404, 16, SLATE)}
      ${svgRect(W - 300, 1382, 40, 32, WHITE, 6)}
      ${svgText('3', W - 280, 1404, 16, SLATE)}
      ${svgText('...', W - 230, 1404, 16, SLATE)}
      ${svgRect(W - 200, 1382, 40, 32, WHITE, 6)}
      ${svgText('13', W - 180, 1404, 16, SLATE)}
      ${svgText('Next →', W - 120, 1404, 16, BLUE, 'start', 'normal')}
    `)}
  </svg>`;
}

function tablet10_screenshot2() {
  const W = 1200, H = 1920;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${svgRect(0, 0, W, H, LIGHT_GRAY)}
    ${svgRect(0, 0, W, 44, DARK_BLUE)}
    ${svgText('9:41', 50, 32, 24, WHITE, 'start', 'normal')}
    ${svgRect(0, 44, W, 96, BLUE)}
    ${svgText('Payment Reports', W / 2, 104, 38, YELLOW)}

    <!-- Date range + export -->
    ${card(40, 170, 500, 60, `
      ${svgText('📅  Mar 1, 2026 - Mar 25, 2026', 80, 208, 20, DARK_BLUE, 'start', 'normal')}
    `)}
    ${svgRect(560, 170, 200, 60, BLUE, 12)}
    ${svgText('Export Report', 660, 208, 20, WHITE)}
    ${svgRect(780, 170, 200, 60, WHITE, 12)}
    <rect x="780" y="170" width="200" height="60" fill="none" stroke="${BLUE}" stroke-width="2" rx="12"/>
    ${svgText('Send Reminders', 880, 208, 18, BLUE)}

    <!-- Revenue overview -->
    ${card(40, 260, 370, 180, `
      ${svgText('Total Billed', 225, 310, 18, SLATE)}
      ${svgText('₹6,12,500', 225, 360, 40, DARK_BLUE)}
      ${svgText('245 students', 225, 396, 16, SLATE, 'middle', 'normal')}
    `)}
    ${card(430, 260, 370, 180, `
      ${svgText('Collected', 615, 310, 18, SLATE)}
      ${svgText('₹4,78,100', 615, 360, 40, GREEN)}
      ${svgText('78% collection rate', 615, 396, 16, GREEN, 'middle', 'normal')}
    `)}
    ${card(820, 260, 340, 180, `
      ${svgText('Outstanding', 990, 310, 18, SLATE)}
      ${svgText('₹1,34,400', 990, 360, 40, RED)}
      ${svgText('54 students pending', 990, 396, 16, RED, 'middle', 'normal')}
    `)}

    <!-- Detailed breakdown chart -->
    ${card(40, 470, W - 80, 400, `
      ${svgText('Collection by Route', 80, 510, 24, DARK_BLUE, 'start')}
      <line x1="60" y1="526" x2="${W - 60}" y2="526" stroke="#e2e8f0" stroke-width="1"/>

      ${['R-001', 'R-003', 'R-005', 'R-007', 'R-009', 'R-011'].map((route, i) => {
        const y = 570 + i * 50;
        const pcts = [92, 85, 72, 88, 78, 95];
        const collected = [92400, 76500, 43200, 70400, 62400, 57000];
        const pct = pcts[i];
        const barW = (pct / 100) * 600;
        return `
          ${svgText(route, 80, y + 6, 18, DARK_BLUE, 'start', 'normal')}
          ${svgRect(200, y - 10, 600, 24, '#e2e8f0', 6)}
          ${svgRect(200, y - 10, barW, 24, pct >= 90 ? GREEN : pct >= 80 ? BLUE : AMBER, 6)}
          ${svgText(`${pct}%`, 820, y + 6, 16, SLATE, 'start', 'normal')}
          ${svgText(`₹${(collected[i] / 1000).toFixed(1)}K`, W - 100, y + 6, 16, DARK_BLUE, 'end', 'normal')}
        `;
      }).join('')}
    `)}

    <!-- Defaulters list -->
    ${card(40, 900, W - 80, 600, `
      ${svgRect(40, 900, W - 80, 50, '#fef2f2', 16)}
      ${svgRect(40, 934, W - 80, 4, '#fef2f2', 0)}
      ${svgText('⚠  Defaulters List (12 students)', 80, 932, 22, RED, 'start')}

      <!-- Header -->
      ${svgText('Student', 80, 980, 16, SLATE, 'start')}
      ${svgText('Parent', 350, 980, 16, SLATE, 'start')}
      ${svgText('Months Due', 580, 980, 16, SLATE, 'start')}
      ${svgText('Amount', 750, 980, 16, SLATE, 'start')}
      ${svgText('Late Fee', 900, 980, 16, SLATE, 'start')}
      ${svgText('Action', W - 120, 980, 16, SLATE, 'start')}
      <line x1="60" y1="996" x2="${W - 60}" y2="996" stroke="#fecaca" stroke-width="1"/>

      ${[
        ['Meera Gupta', 'Sanjay Gupta', '3', '₹8,400', '₹450'],
        ['Arjun Nair', 'Deepa Nair', '2', '₹5,300', '₹300'],
        ['Rohan Pillai', 'Ajay Pillai', '3', '₹7,800', '₹420'],
        ['Tanvi Bhatt', 'Raj Bhatt', '1', '₹2,800', '₹0'],
        ['Sahil Khan', 'Imran Khan', '2', '₹5,000', '₹200'],
        ['Riya Mehta', 'Vikash Mehta', '1', '₹2,500', '₹0'],
        ['Aman Tiwari', 'Sunil Tiwari', '2', '₹5,600', '₹280'],
        ['Divya Saxena', 'Pankaj Saxena', '1', '₹3,000', '₹0'],
      ].map(([student, parent, months, amt, late], i) => {
        const y = 1030 + i * 48;
        const bg = i % 2 === 0 ? '#fef2f2' : WHITE;
        return `
          ${svgRect(60, y - 16, W - 120, 48, bg, 0)}
          ${svgText(student, 80, y + 8, 16, DARK_BLUE, 'start', 'normal')}
          ${svgText(parent, 350, y + 8, 16, SLATE, 'start', 'normal')}
          ${svgText(months, 620, y + 8, 16, RED, 'start')}
          ${svgText(amt, 750, y + 8, 16, DARK_BLUE, 'start', 'normal')}
          ${svgText(late, 920, y + 8, 16, late === '₹0' ? SLATE : RED, 'start', 'normal')}
          ${svgRect(W - 160, y - 6, 80, 28, '#dbeafe', 6)}
          ${svgText('Notify', W - 120, y + 12, 14, BLUE)}
        `;
      }).join('')}
    `)}

    <!-- Summary footer -->
    ${card(40, 1530, W - 80, 100, `
      ${svgText('Total Outstanding: ₹1,34,400', 80, 1580, 22, RED, 'start')}
      ${svgText('Total Late Fees: ₹1,650', 80, 1610, 18, SLATE, 'start', 'normal')}
      ${svgRect(W - 300, 1560, 220, 50, RED, 12)}
      ${svgText('Send All Reminders', W - 190, 1592, 18, WHITE)}
    `)}
  </svg>`;
}

// ─── MAIN GENERATOR ───

async function generatePNG(svgString, outputPath, width, height) {
  const buffer = Buffer.from(svgString);
  await sharp(buffer)
    .resize(width, height)
    .png({ quality: 95, compressionLevel: 6 })
    .toFile(outputPath);
  console.log(`  ✓ ${outputPath.split(/[/\\]/).pop()} (${width}x${height})`);
}

async function main() {
  console.log('\n🎨 Generating Play Store Assets for BusWay Pro\n');

  // Phone screenshots (1080x1920)
  const phoneDir = join(OUT, 'screenshots');
  ensureDir(phoneDir);
  console.log('📱 Phone screenshots (1080x1920):');
  await generatePNG(screenshot1_dashboard(), join(phoneDir, 'screenshot_1_dashboard.png'), 1080, 1920);
  await generatePNG(screenshot2_payments(), join(phoneDir, 'screenshot_2_payments.png'), 1080, 1920);
  await generatePNG(screenshot3_tracking(), join(phoneDir, 'screenshot_3_tracking.png'), 1080, 1920);
  await generatePNG(screenshot4_attendance(), join(phoneDir, 'screenshot_4_attendance.png'), 1080, 1920);
  await generatePNG(screenshot5_notifications(), join(phoneDir, 'screenshot_5_notifications.png'), 1080, 1920);

  // Feature graphic (1024x500)
  const fgDir = join(OUT, 'feature-graphic');
  ensureDir(fgDir);
  console.log('\n🖼️  Feature graphic (1024x500):');
  await generatePNG(featureGraphic(), join(fgDir, 'feature_graphic_1024x500.png'), 1024, 500);

  // 7-inch tablet screenshots (1080x1920)
  const tab7Dir = join(OUT, 'tablet-7inch');
  ensureDir(tab7Dir);
  console.log('\n📱 7-inch tablet screenshots (1080x1920):');
  await generatePNG(tablet7_screenshot1(), join(tab7Dir, 'tablet7_1_admin_dashboard.png'), 1080, 1920);
  await generatePNG(tablet7_screenshot2(), join(tab7Dir, 'tablet7_2_bus_management.png'), 1080, 1920);

  // 10-inch tablet screenshots (1200x1920)
  const tab10Dir = join(OUT, 'tablet-10inch');
  ensureDir(tab10Dir);
  console.log('\n💻 10-inch tablet screenshots (1200x1920):');
  await generatePNG(tablet10_screenshot1(), join(tab10Dir, 'tablet10_1_student_management.png'), 1200, 1920);
  await generatePNG(tablet10_screenshot2(), join(tab10Dir, 'tablet10_2_payment_reports.png'), 1200, 1920);

  console.log('\n✅ All assets generated successfully!\n');
  console.log('📁 Output directory: play-store-assets/');
  console.log('   ├── screenshots/          (5 phone screenshots)');
  console.log('   ├── feature-graphic/       (1 feature graphic)');
  console.log('   ├── tablet-7inch/          (2 tablet screenshots)');
  console.log('   ├── tablet-10inch/         (2 tablet screenshots)');
  console.log('   └── app-icon/              (existing icon retained)\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
