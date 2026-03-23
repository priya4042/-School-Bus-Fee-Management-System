#!/usr/bin/env node

/**
 * Google Play Store Assets Generator
 * Creates all required images in PNG format
 * Using Sharp for SVG to PNG conversion
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Check if Sharp is installed
try {
  import('sharp');
} catch (e) {
  console.log('📦 Installing required package "sharp"...\n');
  try {
    execSync('npm install sharp --save-dev', { stdio: 'inherit' });
  } catch (installError) {
    console.log('\n⚠️  Could not auto-install sharp');
    console.log('Manual install: npm install sharp --save-dev\n');
    process.exit(1);
  }
}

const sharp = (await import('sharp')).default;

// Color Palette
const colors = {
  primaryBlue: '#1e40af',
  darkBlue: '#1e3a8a',
  yellow: '#fbbf24',
  white: '#ffffff',
  darkGray: '#1f2937',
  lightGray: '#f3f4f6'
};

// Create SVG strings for each image
function createAppIconSVG() {
  return `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.primaryBlue};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors.darkBlue};stop-opacity:1" />
      </linearGradient>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
      </filter>
    </defs>
    
    <rect width="512" height="512" fill="url(#bgGrad)"/>
    
    <!-- Bus Icon -->
    <g transform="translate(90, 100)" filter="url(#shadow)">
      <!-- Bus body -->
      <rect x="20" y="80" width="252" height="160" rx="15" fill="${colors.yellow}"/>
      <!-- Bus front section -->
      <rect x="20" y="30" width="252" height="60" rx="10" fill="${colors.darkGray}"/>
      
      <!-- Front windows -->
      <rect x="40" y="45" width="45" height="30" rx="5" fill="${colors.lightGray}"/>
      <rect x="110" y="45" width="45" height="30" rx="5" fill="${colors.lightGray}"/>
      <rect x="180" y="45" width="45" height="30" rx="5" fill="${colors.lightGray}"/>
      <rect x="230" y="45" width="30" height="30" rx="5" fill="${colors.lightGray}"/>
      
      <!-- Side windows -->
      <rect x="40" y="105" width="35" height="35" rx="5" fill="${colors.lightGray}"/>
      <rect x="90" y="105" width="35" height="35" rx="5" fill="${colors.lightGray}"/>
      <rect x="140" y="105" width="35" height="35" rx="5" fill="${colors.lightGray}"/>
      <rect x="190" y="105" width="35" height="35" rx="5" fill="${colors.lightGray}"/>
      <rect x="240" y="105" width="32" height="35" rx="5" fill="${colors.lightGray}"/>
      
      <!-- Wheels -->
      <circle cx="55" cy="245" r="22" fill="${colors.darkGray}"/>
      <circle cx="245" cy="245" r="22" fill="${colors.darkGray}"/>
    </g>
    
    <!-- Brand text -->
    <text x="256" y="460" font-size="52" font-weight="bold" fill="${colors.yellow}" text-anchor="middle" font-family="Arial, sans-serif">
      BusWay Pro
    </text>
  </svg>`;
}

function createFeatureGraphicSVG() {
  return `<svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.darkBlue};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors.primaryBlue};stop-opacity:1" />
      </linearGradient>
    </defs>
    
    <rect width="1024" height="500" fill="url(#fgGrad)"/>
    
    <!-- Highlight card -->
    <rect x="40" y="40" width="440" height="420" rx="20" fill="${colors.yellow}" opacity="0.95"/>
    
    <!-- Bus illustration -->
    <g transform="translate(80, 110)">
      <rect x="0" y="50" width="200" height="120" rx="12" fill="${colors.primaryBlue}"/>
      <rect x="0" y="0" width="200" height="45" rx="8" fill="${colors.darkGray}"/>
      <rect x="15" y="10" width="32" height="25" rx="4" fill="${colors.lightGray}"/>
      <rect x="70" y="10" width="32" height="25" rx="4" fill="${colors.lightGray}"/>
      <rect x="125" y="10" width="32" height="25" rx="4" fill="${colors.lightGray}"/>
      <rect x="15" y="65" width="28" height="28" rx="4" fill="${colors.lightGray}"/>
      <rect x="60" y="65" width="28" height="28" rx="4" fill="${colors.lightGray}"/>
      <rect x="105" y="65" width="28" height="28" rx="4" fill="${colors.lightGray}"/>
      <rect x="150" y="65" width="28" height="28" rx="4" fill="${colors.lightGray}"/>
      <circle cx="35" cy="170" r="16" fill="${colors.darkGray}"/>
      <circle cx="165" cy="170" r="16" fill="${colors.darkGray}"/>
    </g>
    
    <!-- Text on right -->
    <text x="580" y="120" font-size="54" font-weight="bold" fill="${colors.white}" font-family="Arial, sans-serif">
      Smart School Bus
    </text>
    <text x="580" y="190" font-size="44" font-weight="bold" fill="${colors.yellow}" font-family="Arial, sans-serif">
      Fee Management
    </text>
    <text x="580" y="260" font-size="26" fill="${colors.lightGray}" font-family="Arial, sans-serif">
      ✓ Real-time tracking
    </text>
    <text x="580" y="305" font-size="26" fill="${colors.lightGray}" font-family="Arial, sans-serif">
      ✓ Easy payments
    </text>
    <text x="580" y="350" font-size="26" fill="${colors.lightGray}" font-family="Arial, sans-serif">
      ✓ Attendance tracking
    </text>
    <text x="580" y="395" font-size="26" fill="${colors.lightGray}" font-family="Arial, sans-serif">
      ✓ Parent notifications
    </text>
  </svg>`;
}

function createScreenshotSVG(number, title, color1, color2) {
  const descriptions = [
    'Monitor real-time bus location, speed, and estimated arrival',
    'Pay fees securely with multiple payment options',
    'Track your child throughout their journey',
    'View daily attendance records and reports',
    'Manage account settings and preferences'
  ];
  
  return `<svg width="1242" height="2208" xmlns="http://www.w3.org/2000/svg">
    <!-- Status bar -->
    <rect width="1242" height="60" fill="${colors.darkBlue}"/>
    <text x="100" y="40" font-size="24" fill="${colors.white}" font-family="Arial">9:41</text>
    <text x="1142" y="40" font-size="20" fill="${colors.white}" font-family="Arial" text-anchor="end">⚫⚫⚫</text>
    
    <!-- Header -->
    <defs>
      <linearGradient id="headerGrad\${number}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:\${color1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:\${color2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect y="60" width="1242" height="140" fill="url(#headerGrad\${number})"/>
    <text x="621" y="155" font-size="60" font-weight="bold" fill="${colors.yellow}" text-anchor="middle" font-family="Arial">
      ${title}
    </text>
    
    <!-- Main content -->
    <rect y="200" width="1242" height="1908" fill="${colors.lightGray}"/>
    
    <!-- Content cards -->
    <rect x="60" y="260" width="1122" height="200" rx="15" fill="${colors.white}"/>
    <text x="621" y="320" font-size="32" font-weight="bold" fill="${colors.darkBlue}" text-anchor="middle" font-family="Arial">
      ${title}
    </text>
    <text x="621" y="375" font-size="24" fill="${colors.darkGray}" text-anchor="middle" font-family="Arial">
      ${descriptions[number - 1]}
    </text>
    
    <rect x="60" y="510" width="1122" height="180" rx="15" fill="${colors.white}"/>
    <circle cx="150" cy="600" r="35" fill="${color1}"/>
    <text x="250" y="615" font-size="28" fill="${colors.darkGray}" font-family="Arial">
      Key Feature
    </text>
    
    <rect x="60" y="750" width="1122" height="180" rx="15" fill="${colors.white}"/>
    <circle cx="150" cy="840" r="35" fill="${color2}"/>
    <text x="250" y="855" font-size="28" fill="${colors.darkGray}" font-family="Arial">
      Advanced Tool
    </text>
    
    <rect x="60" y="990" width="1122" height="180" rx="15" fill="${colors.white}"/>
    <circle cx="150" cy="1080" r="35" fill="${colors.yellow}"/>
    <text x="250" y="1095" font-size="28" fill="${colors.darkGray}" font-family="Arial">
      Smart System
    </text>
    
    <rect x="60" y="1230" width="1122" height="180" rx="15" fill="${colors.white}"/>
    <circle cx="150" cy="1320" r="35" fill="${colors.primaryBlue}"/>
    <text x="250" y="1335" font-size="28" fill="${colors.darkGray}" font-family="Arial">
      Quick Access
    </text>
    
    <!-- Bottom Navigation -->
    <rect y="1960" width="1242" height="248" fill="${colors.white}"/>
    <g transform="translate(60, 2000)">
      <rect width="240" height="150" rx="12" fill="${colors.lightGray}"/>
      <text x="120" y="95" font-size="26" fill="${colors.darkGray}" text-anchor="middle" font-family="Arial">Home</text>
    </g>
    <g transform="translate(340, 2000)">
      <rect width="240" height="150" rx="12" fill="${colors.lightGray}"/>
      <text x="120" y="95" font-size="26" fill="${colors.darkGray}" text-anchor="middle" font-family="Arial">Fees</text>
    </g>
    <g transform="translate(620, 2000)">
      <rect width="240" height="150" rx="12" fill="${colors.lightGray}"/>
      <text x="120" y="95" font-size="26" fill="${colors.darkGray}" text-anchor="middle" font-family="Arial">Tracking</text>
    </g>
    <g transform="translate(900, 2000)">
      <rect width="240" height="150" rx="12" fill="${colors.lightGray}"/>
      <text x="120" y="95" font-size="26" fill="${colors.darkGray}" text-anchor="middle" font-family="Arial">More</text>
    </g>
  </svg>`;
}

// Create directories
const dirs = [
  'play-store-assets/app-icon',
  'play-store-assets/feature-graphic',
  'play-store-assets/screenshots'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function generateImages() {
  try {
    console.log('🎨 Generating Play Store images...\n');
    
    // App Icon
    console.log('📱 Creating app icon (512×512)...');
    const appIconSVG = createAppIconSVG();
    await sharp(Buffer.from(appIconSVG))
      .png()
      .toFile('play-store-assets/app-icon/app_icon_512x512.png');
    console.log('✅ app_icon_512x512.png\n');
    
    // Feature Graphic
    console.log('🖼️  Creating feature graphic (1024×500)...');
    const featureGraphicSVG = createFeatureGraphicSVG();
    await sharp(Buffer.from(featureGraphicSVG))
      .png()
      .toFile('play-store-assets/feature-graphic/feature_graphic_1024x500.png');
    console.log('✅ feature_graphic_1024x500.png\n');
    
    // Screenshots
    const screenshotConfigs = [
      { num: 1, title: 'Dashboard', color1: colors.primaryBlue, color2: colors.darkBlue },
      { num: 2, title: 'Payments', color1: colors.yellow, color2: colors.primaryBlue },
      { num: 3, title: 'Tracking', color1: colors.primaryBlue, color2: colors.yellow },
      { num: 4, title: 'Attendance', color1: colors.darkGray, color2: colors.primaryBlue },
      { num: 5, title: 'Settings', color1: colors.primaryBlue, color2: colors.darkBlue }
    ];
    
    console.log('📸 Creating 5 screenshots (1242×2208 each)...');
    for (const config of screenshotConfigs) {
      const svg = createScreenshotSVG(config.num, config.title, config.color1, config.color2);
      const filename = `play-store-assets/screenshots/screenshot_${config.num}_${config.title.toLowerCase()}.png`;
      await sharp(Buffer.from(svg))
        .png()
        .toFile(filename);
      console.log(`✅ screenshot_${config.num}_${config.title.toLowerCase()}.png`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ SUCCESS! All images created!\n');
    console.log('📁 Files Ready:');
    console.log('   ├─ play-store-assets/app-icon/app_icon_512x512.png');
    console.log('   ├─ play-store-assets/feature-graphic/feature_graphic_1024x500.png');
    console.log('   └─ play-store-assets/screenshots/');
    console.log('       ├─ screenshot_1_dashboard.png');
    console.log('       ├─ screenshot_2_payments.png');
    console.log('       ├─ screenshot_3_tracking.png');
    console.log('       ├─ screenshot_4_attendance.png');
    console.log('       └─ screenshot_5_settings.png\n');
    console.log('🚀 Next Step: Go to https://play.google.com/console');
    console.log('   and upload these images to your app!\n');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error generating images:', error.message);
    process.exit(1);
  }
}

generateImages();
