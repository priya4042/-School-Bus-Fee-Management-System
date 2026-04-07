/**
 * Premium 3D app icon — realistic front-facing school bus
 * Clean, centered, beautiful proportions like a real bus
 */

import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'play-store-assets', 'app-icon');

function generateIcon() {
  const S = 512;

  return `<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Background -->
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="35%" stop-color="#2563eb"/>
        <stop offset="70%" stop-color="#1d4ed8"/>
        <stop offset="100%" stop-color="#1e3a8a"/>
      </linearGradient>
      <radialGradient id="bgGlow" cx="50%" cy="35%" r="55%">
        <stop offset="0%" stop-color="rgba(96,165,250,0.25)"/>
        <stop offset="100%" stop-color="rgba(30,64,175,0)"/>
      </radialGradient>

      <!-- Bus body yellow -->
      <linearGradient id="busMain" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef3c7"/>
        <stop offset="8%" stop-color="#fde68a"/>
        <stop offset="35%" stop-color="#fcd34d"/>
        <stop offset="70%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
      <!-- Left side darker shading -->
      <linearGradient id="busLeft" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(0,0,0,0.1)"/>
        <stop offset="30%" stop-color="rgba(0,0,0,0)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
      </linearGradient>
      <!-- Right side shading -->
      <linearGradient id="busRight" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
        <stop offset="70%" stop-color="rgba(0,0,0,0)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.06)"/>
      </linearGradient>

      <!-- Windshield -->
      <linearGradient id="windshield" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#60a5fa"/>
        <stop offset="25%" stop-color="#93c5fd"/>
        <stop offset="60%" stop-color="#bfdbfe"/>
        <stop offset="85%" stop-color="#dbeafe"/>
        <stop offset="100%" stop-color="#eff6ff"/>
      </linearGradient>
      <!-- Windshield reflection -->
      <linearGradient id="wsReflect" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
        <stop offset="40%" stop-color="rgba(255,255,255,0.4)"/>
        <stop offset="50%" stop-color="rgba(255,255,255,0.5)"/>
        <stop offset="60%" stop-color="rgba(255,255,255,0.3)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>

      <!-- Chrome/metallic -->
      <linearGradient id="chrome" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#e5e7eb"/>
        <stop offset="30%" stop-color="#f9fafb"/>
        <stop offset="50%" stop-color="#d1d5db"/>
        <stop offset="70%" stop-color="#f3f4f6"/>
        <stop offset="100%" stop-color="#9ca3af"/>
      </linearGradient>

      <!-- Headlight -->
      <radialGradient id="headlight" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="40%" stop-color="#fef9c3"/>
        <stop offset="100%" stop-color="#fde68a"/>
      </radialGradient>
      <radialGradient id="headGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(254,249,195,0.6)"/>
        <stop offset="100%" stop-color="rgba(254,249,195,0)"/>
      </radialGradient>

      <!-- Turn signal -->
      <radialGradient id="turnSignal" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#fdba74"/>
        <stop offset="100%" stop-color="#f97316"/>
      </radialGradient>

      <!-- Grille dark -->
      <linearGradient id="grille" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1f2937"/>
        <stop offset="50%" stop-color="#111827"/>
        <stop offset="100%" stop-color="#1f2937"/>
      </linearGradient>

      <!-- Bumper -->
      <linearGradient id="bumper" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#374151"/>
        <stop offset="40%" stop-color="#4b5563"/>
        <stop offset="60%" stop-color="#374151"/>
        <stop offset="100%" stop-color="#1f2937"/>
      </linearGradient>

      <!-- Tire -->
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

      <!-- Badge -->
      <linearGradient id="greenBadge" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4ade80"/>
        <stop offset="50%" stop-color="#22c55e"/>
        <stop offset="100%" stop-color="#16a34a"/>
      </linearGradient>
      <linearGradient id="redPin" x1="30%" y1="0%" x2="70%" y2="100%">
        <stop offset="0%" stop-color="#fca5a5"/>
        <stop offset="30%" stop-color="#f87171"/>
        <stop offset="100%" stop-color="#dc2626"/>
      </linearGradient>

      <!-- Filters -->
      <filter id="busShadow" x="-8%" y="-5%" width="116%" height="125%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.5"/>
      </filter>
      <filter id="badgeShadow" x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#052e16" flood-opacity="0.45"/>
      </filter>
      <filter id="pinShadow" x="-25%" y="-10%" width="150%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#7f1d1d" flood-opacity="0.35"/>
      </filter>
      <filter id="glowFilter" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="6" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>

      <clipPath id="mask"><rect width="${S}" height="${S}" rx="112"/></clipPath>
    </defs>

    <g clip-path="url(#mask)">
      <!-- Background -->
      <rect width="${S}" height="${S}" fill="url(#bg)"/>
      <rect width="${S}" height="${S}" fill="url(#bgGlow)"/>

      <!-- Subtle background decoration -->
      <circle cx="100" cy="80" r="200" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="40"/>
      <circle cx="420" cy="440" r="150" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="30"/>

      <!-- Ground -->
      <ellipse cx="256" cy="410" rx="210" ry="14" fill="rgba(0,0,0,0.15)"/>
      <rect x="0" y="395" width="${S}" height="120" fill="rgba(0,0,0,0.12)"/>

      <!-- ========================================== -->
      <!-- FRONT-FACING REALISTIC SCHOOL BUS          -->
      <!-- ========================================== -->
      <g filter="url(#busShadow)" transform="translate(256,235)">
        <!-- All coords centered at (0,0), bus roughly -160..+160 wide, -155..+165 tall -->

        <!-- === MAIN BODY === -->
        <!-- Body shell -->
        <rect x="-152" y="-145" width="304" height="290" rx="22" ry="22" fill="url(#busMain)"/>
        <!-- Left shading -->
        <rect x="-152" y="-145" width="304" height="290" rx="22" ry="22" fill="url(#busLeft)"/>
        <!-- Right shading -->
        <rect x="-152" y="-145" width="304" height="290" rx="22" ry="22" fill="url(#busRight)"/>
        <!-- Top highlight -->
        <rect x="-148" y="-143" width="296" height="8" rx="4" fill="rgba(255,255,255,0.3)"/>

        <!-- === ROOF VISOR === -->
        <rect x="-160" y="-155" width="320" height="20" rx="8" ry="8" fill="#475569"/>
        <!-- Visor highlight -->
        <rect x="-158" y="-153" width="316" height="4" rx="2" fill="rgba(255,255,255,0.12)"/>

        <!-- === SCHOOL BUS SIGN === -->
        <rect x="-80" y="-174" width="160" height="26" rx="6" ry="6" fill="#d97706"/>
        <!-- Sign bevel -->
        <rect x="-78" y="-172" width="156" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
        <text x="0" y="-155" font-family="Arial Black, Arial, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">SCHOOL BUS</text>

        <!-- === WINDSHIELD (large, split) === -->
        <!-- Left windshield -->
        <rect x="-130" y="-120" width="124" height="105" rx="12" ry="12" fill="url(#windshield)"/>
        <!-- Left reflection streak -->
        <rect x="-125" y="-116" width="16" height="95" rx="6" fill="url(#wsReflect)" opacity="0.6"/>
        <rect x="-100" y="-116" width="6" height="85" rx="3" fill="rgba(255,255,255,0.2)"/>

        <!-- Right windshield -->
        <rect x="6" y="-120" width="124" height="105" rx="12" ry="12" fill="url(#windshield)"/>
        <!-- Right reflection streak -->
        <rect x="11" y="-116" width="16" height="95" rx="6" fill="url(#wsReflect)" opacity="0.6"/>
        <rect x="36" y="-116" width="6" height="85" rx="3" fill="rgba(255,255,255,0.2)"/>

        <!-- Center divider bar -->
        <rect x="-8" y="-125" width="16" height="115" rx="3" fill="#475569"/>
        <rect x="-6" y="-123" width="4" height="110" rx="2" fill="rgba(255,255,255,0.08)"/>

        <!-- Windshield wipers (subtle) -->
        <line x1="-60" y1="-12" x2="-120" y2="-100" stroke="rgba(0,0,0,0.08)" stroke-width="2" stroke-linecap="round"/>
        <line x1="60" y1="-12" x2="120" y2="-100" stroke="rgba(0,0,0,0.08)" stroke-width="2" stroke-linecap="round"/>

        <!-- === DESTINATION SIGN AREA === -->
        <rect x="-90" y="-8" width="180" height="28" rx="5" fill="rgba(0,0,0,0.15)"/>
        <rect x="-86" y="-4" width="172" height="20" rx="3" fill="#111827"/>
        <text x="0" y="12" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#22c55e" text-anchor="middle" letter-spacing="1">BusWay Pro</text>

        <!-- === HEADLIGHTS === -->
        <!-- Left headlight housing -->
        <rect x="-148" y="30" width="42" height="42" rx="10" fill="#e5e7eb"/>
        <rect x="-146" y="32" width="38" height="38" rx="8" fill="url(#headlight)"/>
        <!-- Headlight inner ring -->
        <circle cx="-127" cy="51" r="13" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
        <circle cx="-127" cy="51" r="6" fill="rgba(255,255,255,0.8)"/>
        <!-- Left headlight glow -->
        <circle cx="-127" cy="51" r="28" fill="url(#headGlow)" opacity="0.5"/>

        <!-- Right headlight housing -->
        <rect x="106" y="30" width="42" height="42" rx="10" fill="#e5e7eb"/>
        <rect x="108" y="32" width="38" height="38" rx="8" fill="url(#headlight)"/>
        <circle cx="127" cy="51" r="13" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
        <circle cx="127" cy="51" r="6" fill="rgba(255,255,255,0.8)"/>
        <circle cx="127" cy="51" r="28" fill="url(#headGlow)" opacity="0.5"/>

        <!-- === TURN SIGNALS === -->
        <rect x="-148" y="80" width="28" height="18" rx="6" fill="url(#turnSignal)"/>
        <rect x="-146" y="82" width="8" height="14" rx="3" fill="rgba(255,255,255,0.3)"/>
        <rect x="120" y="80" width="28" height="18" rx="6" fill="url(#turnSignal)"/>
        <rect x="138" y="82" width="8" height="14" rx="3" fill="rgba(255,255,255,0.3)"/>

        <!-- === GRILLE === -->
        <rect x="-100" y="32" width="200" height="50" rx="8" fill="url(#grille)"/>
        <!-- Grille horizontal bars -->
        <rect x="-94" y="38" width="188" height="4" rx="2" fill="#374151"/>
        <rect x="-94" y="38" width="188" height="1.5" rx="1" fill="rgba(255,255,255,0.06)"/>
        <rect x="-94" y="48" width="188" height="4" rx="2" fill="#374151"/>
        <rect x="-94" y="48" width="188" height="1.5" rx="1" fill="rgba(255,255,255,0.06)"/>
        <rect x="-94" y="58" width="188" height="4" rx="2" fill="#374151"/>
        <rect x="-94" y="58" width="188" height="1.5" rx="1" fill="rgba(255,255,255,0.06)"/>
        <rect x="-94" y="68" width="188" height="4" rx="2" fill="#374151"/>
        <rect x="-94" y="68" width="188" height="1.5" rx="1" fill="rgba(255,255,255,0.06)"/>

        <!-- Chrome grille surround -->
        <rect x="-102" y="30" width="204" height="54" rx="9" fill="none" stroke="url(#chrome)" stroke-width="3"/>

        <!-- === BUMPER === -->
        <rect x="-158" y="104" width="316" height="30" rx="8" fill="url(#bumper)"/>
        <!-- Bumper highlight -->
        <rect x="-155" y="106" width="310" height="4" rx="2" fill="rgba(255,255,255,0.08)"/>
        <!-- License plate area -->
        <rect x="-45" y="108" width="90" height="20" rx="4" fill="#e5e7eb"/>
        <rect x="-43" y="110" width="86" height="16" rx="3" fill="#f3f4f6"/>
        <text x="0" y="122" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#374151" text-anchor="middle" letter-spacing="1.5">KA 01 AB</text>

        <!-- Bumper fog lights -->
        <circle cx="-120" cy="119" r="8" fill="#374151"/>
        <circle cx="-120" cy="119" r="5" fill="#fef9c3" opacity="0.5"/>
        <circle cx="120" cy="119" r="8" fill="#374151"/>
        <circle cx="120" cy="119" r="5" fill="#fef9c3" opacity="0.5"/>

        <!-- === WHEELS === -->
        <!-- Left wheel -->
        <circle cx="-110" cy="150" r="30" fill="url(#tire)"/>
        <circle cx="-110" cy="150" r="22" fill="none" stroke="#374151" stroke-width="3"/>
        <circle cx="-110" cy="150" r="15" fill="url(#hubcap)"/>
        <circle cx="-110" cy="150" r="4" fill="#9ca3af"/>
        <!-- Lug nuts -->
        <circle cx="-110" cy="140" r="2" fill="#6b7280"/>
        <circle cx="-100" cy="147" r="2" fill="#6b7280"/>
        <circle cx="-100" cy="155" r="2" fill="#6b7280"/>
        <circle cx="-110" cy="160" r="2" fill="#6b7280"/>
        <circle cx="-120" cy="155" r="2" fill="#6b7280"/>
        <circle cx="-120" cy="147" r="2" fill="#6b7280"/>
        <!-- Tire tread texture -->
        <circle cx="-110" cy="150" r="27" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="2" stroke-dasharray="4,3"/>

        <!-- Right wheel -->
        <circle cx="110" cy="150" r="30" fill="url(#tire)"/>
        <circle cx="110" cy="150" r="22" fill="none" stroke="#374151" stroke-width="3"/>
        <circle cx="110" cy="150" r="15" fill="url(#hubcap)"/>
        <circle cx="110" cy="150" r="4" fill="#9ca3af"/>
        <circle cx="110" cy="140" r="2" fill="#6b7280"/>
        <circle cx="120" cy="147" r="2" fill="#6b7280"/>
        <circle cx="120" cy="155" r="2" fill="#6b7280"/>
        <circle cx="110" cy="160" r="2" fill="#6b7280"/>
        <circle cx="100" cy="155" r="2" fill="#6b7280"/>
        <circle cx="100" cy="147" r="2" fill="#6b7280"/>
        <circle cx="110" cy="150" r="27" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="2" stroke-dasharray="4,3"/>

        <!-- Fender area above wheels -->
        <path d="M-148,130 Q-148,115 -130,115 L-90,115 Q-72,115 -72,130" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="2"/>
        <path d="M72,130 Q72,115 90,115 L130,115 Q148,115 148,130" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="2"/>

        <!-- === SIDE MARKERS / DETAILS === -->
        <!-- Left side marker -->
        <rect x="-155" y="-5" width="8" height="18" rx="3" fill="#ef4444" opacity="0.7"/>
        <!-- Right side marker -->
        <rect x="147" y="-5" width="8" height="18" rx="3" fill="#ef4444" opacity="0.7"/>

        <!-- Body highlight strip -->
        <rect x="-148" y="20" width="296" height="3" rx="1.5" fill="rgba(0,0,0,0.08)"/>

        <!-- Stop arm housing (left side) -->
        <rect x="-158" y="-50" width="14" height="30" rx="4" fill="#ef4444" opacity="0.8"/>
        <text x="-151" y="-30" font-family="Arial" font-size="7" font-weight="bold" fill="#fff" text-anchor="middle">S</text>
      </g>

      <!-- ========================================== -->
      <!-- FLOATING BADGES                            -->
      <!-- ========================================== -->

      <!-- LOCATION PIN -->
      <g filter="url(#pinShadow)" transform="translate(400, 28)">
        <path d="M24,0 C37,0 48,11 48,24 C48,42 24,62 24,62 C24,62 0,42 0,24 C0,11 11,0 24,0 Z" fill="url(#redPin)"/>
        <ellipse cx="20" cy="14" rx="11" ry="7" fill="rgba(255,255,255,0.22)"/>
        <circle cx="24" cy="24" r="10" fill="#fff"/>
        <circle cx="24" cy="24" r="4.5" fill="#ef4444"/>
        <circle cx="22" cy="21" r="2" fill="rgba(255,255,255,0.5)"/>
      </g>

      <!-- RUPEE COIN -->
      <g filter="url(#badgeShadow)">
        <!-- 3D edge -->
        <ellipse cx="425" cy="447" rx="42" ry="40" fill="#15803d"/>
        <!-- Face -->
        <ellipse cx="425" cy="443" rx="42" ry="40" fill="url(#greenBadge)"/>
        <ellipse cx="425" cy="443" rx="34" ry="32" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2.5"/>
        <ellipse cx="417" cy="432" rx="16" ry="10" fill="rgba(255,255,255,0.12)"/>
        <text x="425" y="457" font-family="Arial Black, Arial, sans-serif" font-size="38" font-weight="900" fill="#fff" text-anchor="middle">₹</text>
      </g>

      <!-- WIFI SIGNAL -->
      <g transform="translate(32, 42)" opacity="0.5">
        <path d="M0,28 Q14,13 28,28" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="3" stroke-linecap="round"/>
        <path d="M4,21 Q14,7 24,21" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M8,14 Q14,4 20,14" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-linecap="round"/>
        <circle cx="14" cy="31" r="3.5" fill="rgba(255,255,255,0.55)"/>
      </g>

      <!-- Sparkles -->
      <g opacity="0.35">
        <path d="M72,155 L74,150 L76,155 L81,157 L76,159 L74,164 L72,159 L67,157 Z" fill="#fff"/>
        <path d="M448,130 L449.5,127 L451,130 L454,131.5 L451,133 L449.5,136 L448,133 L445,131.5 Z" fill="#fff" opacity="0.5"/>
        <path d="M56,310 L57,308 L58,310 L60,311 L58,312 L57,314 L56,312 L54,311 Z" fill="#fff" opacity="0.4"/>
        <path d="M460,220 L461,218 L462,220 L464,221 L462,222 L461,224 L460,222 L458,221 Z" fill="#fff" opacity="0.3"/>
      </g>
    </g>
  </svg>`;
}

async function main() {
  console.log('\n🎨 Generating premium 3D icon\n');
  const buf = Buffer.from(generateIcon());

  await sharp(buf).resize(512, 512).png({ quality: 100, compressionLevel: 6 })
    .toFile(join(OUT, 'app_icon_512x512.png'));
  console.log('  ✓ app_icon_512x512.png');

  await sharp(buf).resize(1024, 1024).png({ quality: 100, compressionLevel: 6 })
    .toFile(join(OUT, 'app_icon_1024x1024.png'));
  console.log('  ✓ app_icon_1024x1024.png');

  console.log('\n✅ Done!\n');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
