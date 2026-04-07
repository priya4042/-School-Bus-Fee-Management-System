/**
 * Generate Play Store Feature Graphic — exactly 1024x500 PNG
 *
 * Strategy: Create SVG at 4x resolution (4096x2000), render natively,
 * then downscale to 1024x500 for crisp, dense pixels.
 */

import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'play-store-assets', 'feature-graphic');

// Scale factor — SVG is authored at 4x, then downscaled
const S = 4;

function px(v) { return v * S; }

function generate() {
  const W = px(1024), H = px(500);

  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="30%" stop-color="#2563eb"/>
        <stop offset="65%" stop-color="#1d4ed8"/>
        <stop offset="100%" stop-color="#1e3a8a"/>
      </linearGradient>
      <radialGradient id="bgGlow" cx="25%" cy="40%" r="55%">
        <stop offset="0%" stop-color="rgba(96,165,250,0.2)"/>
        <stop offset="100%" stop-color="rgba(30,64,175,0)"/>
      </radialGradient>
      <radialGradient id="bgGlow2" cx="80%" cy="60%" r="40%">
        <stop offset="0%" stop-color="rgba(59,130,246,0.12)"/>
        <stop offset="100%" stop-color="rgba(30,64,175,0)"/>
      </radialGradient>

      <linearGradient id="busMain" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef3c7"/>
        <stop offset="8%" stop-color="#fde68a"/>
        <stop offset="35%" stop-color="#fcd34d"/>
        <stop offset="70%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
      <linearGradient id="busLeft" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(0,0,0,0.1)"/>
        <stop offset="30%" stop-color="rgba(0,0,0,0)"/>
      </linearGradient>

      <linearGradient id="windshield" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#60a5fa"/>
        <stop offset="25%" stop-color="#93c5fd"/>
        <stop offset="60%" stop-color="#bfdbfe"/>
        <stop offset="100%" stop-color="#eff6ff"/>
      </linearGradient>
      <linearGradient id="wsReflect" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
        <stop offset="40%" stop-color="rgba(255,255,255,0.4)"/>
        <stop offset="50%" stop-color="rgba(255,255,255,0.5)"/>
        <stop offset="60%" stop-color="rgba(255,255,255,0.3)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>

      <linearGradient id="chrome" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#e5e7eb"/>
        <stop offset="30%" stop-color="#f9fafb"/>
        <stop offset="50%" stop-color="#d1d5db"/>
        <stop offset="70%" stop-color="#f3f4f6"/>
        <stop offset="100%" stop-color="#9ca3af"/>
      </linearGradient>

      <radialGradient id="headlight" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="40%" stop-color="#fef9c3"/>
        <stop offset="100%" stop-color="#fde68a"/>
      </radialGradient>
      <radialGradient id="headGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(254,249,195,0.6)"/>
        <stop offset="100%" stop-color="rgba(254,249,195,0)"/>
      </radialGradient>
      <radialGradient id="turnSignal" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#fdba74"/>
        <stop offset="100%" stop-color="#f97316"/>
      </radialGradient>

      <linearGradient id="grille" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1f2937"/>
        <stop offset="50%" stop-color="#111827"/>
        <stop offset="100%" stop-color="#1f2937"/>
      </linearGradient>

      <linearGradient id="bumper" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#374151"/>
        <stop offset="40%" stop-color="#4b5563"/>
        <stop offset="60%" stop-color="#374151"/>
        <stop offset="100%" stop-color="#1f2937"/>
      </linearGradient>

      <radialGradient id="tire" cx="50%" cy="45%" r="52%">
        <stop offset="0%" stop-color="#4b5563"/>
        <stop offset="40%" stop-color="#374151"/>
        <stop offset="75%" stop-color="#1f2937"/>
        <stop offset="100%" stop-color="#111827"/>
      </radialGradient>
      <radialGradient id="hubcap" cx="40%" cy="35%" r="55%">
        <stop offset="0%" stop-color="#f3f4f6"/>
        <stop offset="35%" stop-color="#e5e7eb"/>
        <stop offset="65%" stop-color="#9ca3af"/>
        <stop offset="100%" stop-color="#6b7280"/>
      </radialGradient>

      <linearGradient id="iconBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.15)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0.05)"/>
      </linearGradient>

      <filter id="busShadow" x="-10%" y="-8%" width="120%" height="130%">
        <feDropShadow dx="0" dy="${px(6)}" stdDeviation="${px(10)}" flood-color="#0f172a" flood-opacity="0.45"/>
      </filter>
      <filter id="glowFilter" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="${px(5)}" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="textShadow" x="-5%" y="-5%" width="110%" height="130%">
        <feDropShadow dx="0" dy="${px(2)}" stdDeviation="${px(3)}" flood-color="#0f172a" flood-opacity="0.3"/>
      </filter>
      <filter id="iconShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="${px(2)}" stdDeviation="${px(3)}" flood-color="#0f172a" flood-opacity="0.25"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#bgGlow)"/>
    <rect width="${W}" height="${H}" fill="url(#bgGlow2)"/>

    <!-- Decorations -->
    <circle cx="${px(160)}" cy="${px(50)}" r="${px(250)}" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="${px(40)}"/>
    <circle cx="${px(160)}" cy="${px(50)}" r="${px(340)}" fill="none" stroke="rgba(255,255,255,0.015)" stroke-width="${px(30)}"/>
    <circle cx="${px(850)}" cy="${px(420)}" r="${px(200)}" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="${px(25)}"/>

    <!-- Ground -->
    <ellipse cx="${px(210)}" cy="${px(428)}" rx="${px(170)}" ry="${px(12)}" fill="rgba(0,0,0,0.12)"/>

    <!-- ===== BUS ===== -->
    <g filter="url(#busShadow)" transform="translate(${px(210)}, ${px(230)})">
      <!-- Body -->
      <rect x="${px(-148)}" y="${px(-148)}" width="${px(296)}" height="${px(280)}" rx="${px(20)}" fill="url(#busMain)"/>
      <rect x="${px(-148)}" y="${px(-148)}" width="${px(296)}" height="${px(280)}" rx="${px(20)}" fill="url(#busLeft)"/>
      <rect x="${px(-144)}" y="${px(-146)}" width="${px(288)}" height="${px(7)}" rx="${px(3)}" fill="rgba(255,255,255,0.3)"/>

      <!-- Roof visor -->
      <rect x="${px(-155)}" y="${px(-157)}" width="${px(310)}" height="${px(18)}" rx="${px(7)}" fill="#475569"/>
      <rect x="${px(-153)}" y="${px(-155)}" width="${px(306)}" height="${px(3)}" rx="${px(2)}" fill="rgba(255,255,255,0.1)"/>

      <!-- School Bus sign -->
      <rect x="${px(-75)}" y="${px(-176)}" width="${px(150)}" height="${px(24)}" rx="${px(5)}" fill="#d97706"/>
      <rect x="${px(-73)}" y="${px(-174)}" width="${px(146)}" height="${px(3)}" rx="${px(2)}" fill="rgba(255,255,255,0.2)"/>
      <text x="0" y="${px(-158)}" font-family="Arial Black, Arial, sans-serif" font-size="${px(13)}" font-weight="900" fill="#fff" text-anchor="middle" letter-spacing="${px(2.5)}">SCHOOL BUS</text>

      <!-- Left windshield -->
      <rect x="${px(-126)}" y="${px(-124)}" width="${px(118)}" height="${px(100)}" rx="${px(11)}" fill="url(#windshield)"/>
      <rect x="${px(-122)}" y="${px(-120)}" width="${px(15)}" height="${px(90)}" rx="${px(5)}" fill="url(#wsReflect)" opacity="0.6"/>
      <rect x="${px(-98)}" y="${px(-120)}" width="${px(5)}" height="${px(80)}" rx="${px(2.5)}" fill="rgba(255,255,255,0.2)"/>

      <!-- Right windshield -->
      <rect x="${px(6)}" y="${px(-124)}" width="${px(118)}" height="${px(100)}" rx="${px(11)}" fill="url(#windshield)"/>
      <rect x="${px(11)}" y="${px(-120)}" width="${px(15)}" height="${px(90)}" rx="${px(5)}" fill="url(#wsReflect)" opacity="0.6"/>
      <rect x="${px(36)}" y="${px(-120)}" width="${px(5)}" height="${px(80)}" rx="${px(2.5)}" fill="rgba(255,255,255,0.2)"/>

      <!-- Center divider -->
      <rect x="${px(-8)}" y="${px(-128)}" width="${px(16)}" height="${px(108)}" rx="${px(3)}" fill="#475569"/>

      <!-- Wipers -->
      <line x1="${px(-55)}" y1="${px(-18)}" x2="${px(-115)}" y2="${px(-105)}" stroke="rgba(0,0,0,0.07)" stroke-width="${px(1.5)}" stroke-linecap="round"/>
      <line x1="${px(55)}" y1="${px(-18)}" x2="${px(115)}" y2="${px(-105)}" stroke="rgba(0,0,0,0.07)" stroke-width="${px(1.5)}" stroke-linecap="round"/>

      <!-- Destination display -->
      <rect x="${px(-85)}" y="${px(-14)}" width="${px(170)}" height="${px(26)}" rx="${px(5)}" fill="rgba(0,0,0,0.15)"/>
      <rect x="${px(-81)}" y="${px(-10)}" width="${px(162)}" height="${px(18)}" rx="${px(3)}" fill="#111827"/>
      <text x="0" y="${px(4)}" font-family="Arial, sans-serif" font-size="${px(12)}" font-weight="bold" fill="#22c55e" text-anchor="middle" letter-spacing="${px(1)}">BusWay Pro</text>

      <!-- Headlights -->
      <rect x="${px(-143)}" y="${px(22)}" width="${px(40)}" height="${px(40)}" rx="${px(9)}" fill="#e5e7eb"/>
      <rect x="${px(-141)}" y="${px(24)}" width="${px(36)}" height="${px(36)}" rx="${px(7)}" fill="url(#headlight)"/>
      <circle cx="${px(-123)}" cy="${px(42)}" r="${px(12)}" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="${px(1.5)}"/>
      <circle cx="${px(-123)}" cy="${px(42)}" r="${px(5)}" fill="rgba(255,255,255,0.8)"/>
      <circle cx="${px(-123)}" cy="${px(42)}" r="${px(26)}" fill="url(#headGlow)" opacity="0.4"/>

      <rect x="${px(103)}" y="${px(22)}" width="${px(40)}" height="${px(40)}" rx="${px(9)}" fill="#e5e7eb"/>
      <rect x="${px(105)}" y="${px(24)}" width="${px(36)}" height="${px(36)}" rx="${px(7)}" fill="url(#headlight)"/>
      <circle cx="${px(123)}" cy="${px(42)}" r="${px(12)}" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="${px(1.5)}"/>
      <circle cx="${px(123)}" cy="${px(42)}" r="${px(5)}" fill="rgba(255,255,255,0.8)"/>
      <circle cx="${px(123)}" cy="${px(42)}" r="${px(26)}" fill="url(#headGlow)" opacity="0.4"/>

      <!-- Turn signals -->
      <rect x="${px(-143)}" y="${px(70)}" width="${px(26)}" height="${px(16)}" rx="${px(5)}" fill="url(#turnSignal)"/>
      <rect x="${px(117)}" y="${px(70)}" width="${px(26)}" height="${px(16)}" rx="${px(5)}" fill="url(#turnSignal)"/>

      <!-- Grille -->
      <rect x="${px(-95)}" y="${px(24)}" width="${px(190)}" height="${px(48)}" rx="${px(7)}" fill="url(#grille)"/>
      <rect x="${px(-89)}" y="${px(30)}" width="${px(178)}" height="${px(3.5)}" rx="${px(1.5)}" fill="#374151"/>
      <rect x="${px(-89)}" y="${px(39)}" width="${px(178)}" height="${px(3.5)}" rx="${px(1.5)}" fill="#374151"/>
      <rect x="${px(-89)}" y="${px(48)}" width="${px(178)}" height="${px(3.5)}" rx="${px(1.5)}" fill="#374151"/>
      <rect x="${px(-89)}" y="${px(57)}" width="${px(178)}" height="${px(3.5)}" rx="${px(1.5)}" fill="#374151"/>
      <rect x="${px(-97)}" y="${px(22)}" width="${px(194)}" height="${px(52)}" rx="${px(8)}" fill="none" stroke="url(#chrome)" stroke-width="${px(2.5)}"/>

      <!-- Bumper -->
      <rect x="${px(-152)}" y="${px(94)}" width="${px(304)}" height="${px(28)}" rx="${px(7)}" fill="url(#bumper)"/>
      <rect x="${px(-149)}" y="${px(96)}" width="${px(298)}" height="${px(3.5)}" rx="${px(2)}" fill="rgba(255,255,255,0.08)"/>
      <rect x="${px(-42)}" y="${px(98)}" width="${px(84)}" height="${px(18)}" rx="${px(3)}" fill="#e5e7eb"/>
      <rect x="${px(-40)}" y="${px(100)}" width="${px(80)}" height="${px(14)}" rx="${px(2.5)}" fill="#f3f4f6"/>
      <text x="0" y="${px(111)}" font-family="Arial, sans-serif" font-size="${px(9)}" font-weight="bold" fill="#374151" text-anchor="middle" letter-spacing="${px(1.5)}">KA 01 AB</text>
      <circle cx="${px(-115)}" cy="${px(108)}" r="${px(7)}" fill="#374151"/>
      <circle cx="${px(-115)}" cy="${px(108)}" r="${px(4.5)}" fill="#fef9c3" opacity="0.5"/>
      <circle cx="${px(115)}" cy="${px(108)}" r="${px(7)}" fill="#374151"/>
      <circle cx="${px(115)}" cy="${px(108)}" r="${px(4.5)}" fill="#fef9c3" opacity="0.5"/>

      <!-- Wheels -->
      <circle cx="${px(-105)}" cy="${px(138)}" r="${px(28)}" fill="url(#tire)"/>
      <circle cx="${px(-105)}" cy="${px(138)}" r="${px(20)}" fill="none" stroke="#374151" stroke-width="${px(2.5)}"/>
      <circle cx="${px(-105)}" cy="${px(138)}" r="${px(13)}" fill="url(#hubcap)"/>
      <circle cx="${px(-105)}" cy="${px(138)}" r="${px(3.5)}" fill="#9ca3af"/>

      <circle cx="${px(105)}" cy="${px(138)}" r="${px(28)}" fill="url(#tire)"/>
      <circle cx="${px(105)}" cy="${px(138)}" r="${px(20)}" fill="none" stroke="#374151" stroke-width="${px(2.5)}"/>
      <circle cx="${px(105)}" cy="${px(138)}" r="${px(13)}" fill="url(#hubcap)"/>
      <circle cx="${px(105)}" cy="${px(138)}" r="${px(3.5)}" fill="#9ca3af"/>

      <!-- Side markers -->
      <rect x="${px(-155)}" y="${px(-5)}" width="${px(7)}" height="${px(16)}" rx="${px(3)}" fill="#ef4444" opacity="0.7"/>
      <rect x="${px(148)}" y="${px(-5)}" width="${px(7)}" height="${px(16)}" rx="${px(3)}" fill="#ef4444" opacity="0.7"/>

      <!-- Stop arm -->
      <rect x="${px(-158)}" y="${px(-55)}" width="${px(14)}" height="${px(28)}" rx="${px(4)}" fill="#ef4444" opacity="0.8"/>
    </g>

    <!-- ===== TEXT & FEATURES (right side) ===== -->
    <g filter="url(#textShadow)">
      <text x="${px(540)}" y="${px(108)}" font-family="Arial Black, Arial, sans-serif" font-size="${px(48)}" font-weight="900" fill="#ffffff" letter-spacing="${px(1)}">School BusWay</text>
      <text x="${px(540)}" y="${px(158)}" font-family="Arial Black, Arial, sans-serif" font-size="${px(48)}" font-weight="900" fill="#fbbf24" letter-spacing="${px(1)}">Pro</text>
    </g>
    <text x="${px(540)}" y="${px(195)}" font-family="Arial, sans-serif" font-size="${px(20)}" fill="rgba(255,255,255,0.7)" letter-spacing="${px(0.5)}">Smart School Bus Fee Management</text>
    <rect x="${px(540)}" y="${px(215)}" width="${px(420)}" height="${px(1.5)}" rx="${px(1)}" fill="rgba(255,255,255,0.12)"/>

    <!-- Feature 1 -->
    <g filter="url(#iconShadow)" transform="translate(${px(540)}, ${px(240)})">
      <rect width="${px(44)}" height="${px(44)}" rx="${px(12)}" fill="url(#iconBg)"/>
      <rect width="${px(44)}" height="${px(44)}" rx="${px(12)}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="${px(1)}"/>
      <path d="M${px(22)},${px(8)} C${px(28)},${px(8)} ${px(33)},${px(13)} ${px(33)},${px(19)} C${px(33)},${px(28)} ${px(22)},${px(36)} ${px(22)},${px(36)} C${px(22)},${px(36)} ${px(11)},${px(28)} ${px(11)},${px(19)} C${px(11)},${px(13)} ${px(16)},${px(8)} ${px(22)},${px(8)} Z" fill="#ef4444" opacity="0.9"/>
      <circle cx="${px(22)}" cy="${px(19)}" r="${px(4.5)}" fill="#fff"/>
    </g>
    <text x="${px(596)}" y="${px(258)}" font-family="Arial, sans-serif" font-size="${px(20)}" font-weight="bold" fill="#fff">Real-time Bus Tracking</text>
    <text x="${px(596)}" y="${px(278)}" font-family="Arial, sans-serif" font-size="${px(14)}" fill="rgba(255,255,255,0.55)">Live GPS location with ETA</text>

    <!-- Feature 2 -->
    <g filter="url(#iconShadow)" transform="translate(${px(540)}, ${px(298)})">
      <rect width="${px(44)}" height="${px(44)}" rx="${px(12)}" fill="url(#iconBg)"/>
      <rect width="${px(44)}" height="${px(44)}" rx="${px(12)}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="${px(1)}"/>
      <circle cx="${px(22)}" cy="${px(22)}" r="${px(14)}" fill="#22c55e" opacity="0.9"/>
      <text x="${px(22)}" y="${px(28)}" font-family="Arial, sans-serif" font-size="${px(18)}" font-weight="bold" fill="#fff" text-anchor="middle">₹</text>
    </g>
    <text x="${px(596)}" y="${px(316)}" font-family="Arial, sans-serif" font-size="${px(20)}" font-weight="bold" fill="#fff">Secure Online Payments</text>
    <text x="${px(596)}" y="${px(336)}" font-family="Arial, sans-serif" font-size="${px(14)}" fill="rgba(255,255,255,0.55)">Razorpay, UPI, Cards &amp; Net Banking</text>

    <!-- Feature 3 -->
    <g filter="url(#iconShadow)" transform="translate(${px(540)}, ${px(356)})">
      <rect width="${px(44)}" height="${px(44)}" rx="${px(12)}" fill="url(#iconBg)"/>
      <rect width="${px(44)}" height="${px(44)}" rx="${px(12)}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="${px(1)}"/>
      <circle cx="${px(22)}" cy="${px(22)}" r="${px(14)}" fill="#8b5cf6" opacity="0.9"/>
      <path d="M${px(14)},${px(22)} L${px(20)},${px(28)} L${px(30)},${px(16)}" fill="none" stroke="#fff" stroke-width="${px(2.5)}" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="${px(596)}" y="${px(374)}" font-family="Arial, sans-serif" font-size="${px(20)}" font-weight="bold" fill="#fff">Attendance Monitoring</text>
    <text x="${px(596)}" y="${px(394)}" font-family="Arial, sans-serif" font-size="${px(14)}" fill="rgba(255,255,255,0.55)">Daily pickup &amp; drop records</text>

    <!-- Feature 4 -->
    <g filter="url(#iconShadow)" transform="translate(${px(540)}, ${px(414)})">
      <rect width="${px(44)}" height="${px(44)}" rx="${px(12)}" fill="url(#iconBg)"/>
      <rect width="${px(44)}" height="${px(44)}" rx="${px(12)}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="${px(1)}"/>
      <circle cx="${px(22)}" cy="${px(22)}" r="${px(14)}" fill="#f59e0b" opacity="0.9"/>
      <path d="M${px(22)},${px(12)} C${px(18)},${px(12)} ${px(15)},${px(15)} ${px(15)},${px(19)} L${px(15)},${px(24)} L${px(13)},${px(27)} L${px(31)},${px(27)} L${px(29)},${px(24)} L${px(29)},${px(19)} C${px(29)},${px(15)} ${px(26)},${px(12)} ${px(22)},${px(12)} Z" fill="#fff"/>
      <circle cx="${px(22)}" cy="${px(30)}" r="${px(2.5)}" fill="#fff"/>
    </g>
    <text x="${px(596)}" y="${px(432)}" font-family="Arial, sans-serif" font-size="${px(20)}" font-weight="bold" fill="#fff">Instant Notifications</text>
    <text x="${px(596)}" y="${px(452)}" font-family="Arial, sans-serif" font-size="${px(14)}" fill="rgba(255,255,255,0.55)">Fee reminders, bus alerts &amp; more</text>

    <!-- Sparkles -->
    <g opacity="0.25">
      <path d="M${px(490)},${px(80)} L${px(492)},${px(75)} L${px(494)},${px(80)} L${px(499)},${px(82)} L${px(494)},${px(84)} L${px(492)},${px(89)} L${px(490)},${px(84)} L${px(485)},${px(82)} Z" fill="#fff"/>
      <path d="M${px(980)},${px(100)} L${px(982)},${px(97)} L${px(984)},${px(100)} L${px(987)},${px(102)} L${px(984)},${px(104)} L${px(982)},${px(107)} L${px(980)},${px(104)} L${px(977)},${px(102)} Z" fill="#fff"/>
    </g>
  </svg>`;
}

async function main() {
  console.log('\n🎨 Generating feature graphic (4x native render)\n');
  const svgBuf = Buffer.from(generate());

  // sharp renders the SVG at its native width/height (4096x2000)
  // Then we downscale to exactly 1024x500 — real dense pixels, no upscaling
  const rendered = await sharp(svgBuf).png().toBuffer();
  const meta = await sharp(rendered).metadata();
  console.log(`  SVG rendered at: ${meta.width}x${meta.height}`);

  // Extract raw pixels then rebuild — guarantees clean file
  const { data, info } = await sharp(rendered)
    .resize(1024, 500, { kernel: 'lanczos3' })
    .flatten({ background: { r: 37, g: 99, b: 235 } })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log(`  Raw pixels: ${info.width}x${info.height}, ${info.channels}ch`);

  // PNG
  await sharp(data, { raw: { width: 1024, height: 500, channels: 3 } })
    .png({ compressionLevel: 6 })
    .toFile(join(OUT, 'feature_graphic_1024x500.png'));

  // JPEG
  await sharp(data, { raw: { width: 1024, height: 500, channels: 3 } })
    .jpeg({ quality: 100 })
    .toFile(join(OUT, 'feature_graphic_1024x500.jpg'));

  // Verify
  for (const ext of ['png', 'jpg']) {
    const p = join(OUT, `feature_graphic_1024x500.${ext}`);
    const m = await sharp(p).metadata();
    const { statSync } = await import('fs');
    const sz = statSync(p).size;
    console.log(`  ✓ ${ext.toUpperCase()}: ${m.width}x${m.height}, DPI:${m.density || 'none'}, alpha:${m.hasAlpha}, ${(sz/1024).toFixed(0)}KB`);
  }

  console.log('\n✅ Done!\n');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
