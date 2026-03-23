const fs = require('fs');
const path = require('path');

// Color Palette
const colors = {
  primaryBlue: '#1e40af',
  darkBlue: '#1e3a8a',
  yellow: '#fbbf24',
  white: '#ffffff',
  darkGray: '#1f2937',
  lightGray: '#f3f4f6'
};

// Create SVG-based images and convert to PNG
function createAppIcon() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="512" height="512" fill="${colors.primaryBlue}"/>
  
  <!-- Rounded corners effect with circles -->
  <circle cx="50" cy="50" r="50" fill="${colors.primaryBlue}"/>
  <circle cx="462" cy="50" r="50" fill="${colors.primaryBlue}"/>
  <circle cx="50" cy="462" r="50" fill="${colors.primaryBlue}"/>
  <circle cx="462" cy="462" r="50" fill="${colors.primaryBlue}"/>
  
  <!-- Bus icon (simplified) -->
  <g transform="translate(100, 120)">
    <!-- Bus body -->
    <rect x="0" y="60" width="312" height="180" rx="20" fill="${colors.yellow}"/>
    <!-- Bus front -->
    <rect x="0" y="20" width="312" height="50" rx="10" fill="${colors.darkGray}"/>
    <!-- Windows -->
    <rect x="30" y="35" width="50" height="35" fill="${colors.lightGray}"/>
    <rect x="110" y="35" width="50" height="35" fill="${colors.lightGray}"/>
    <rect x="190" y="35" width="50" height="35" fill="${colors.lightGray}"/>
    <rect x="270" y="35" width="30" height="35" fill="${colors.lightGray}"/>
    
    <!-- Passenger windows -->
    <rect x="30" y="75" width="40" height="40" fill="${colors.lightGray}"/>
    <rect x="90" y="75" width="40" height="40" fill="${colors.lightGray}"/>
    <rect x="150" y="75" width="40" height="40" fill="${colors.lightGray}"/>
    <rect x="210" y="75" width="40" height="40" fill="${colors.lightGray}"/>
    <rect x="270" y="75" width="40" height="40" fill="${colors.lightGray}"/>
    
    <!-- Wheels -->
    <circle cx="60" cy="250" r="25" fill="${colors.darkGray}"/>
    <circle cx="260" cy="250" r="25" fill="${colors.darkGray}"/>
  </g>
  
  <!-- App Name -->
  <text x="256" y="480" font-size="48" font-weight="bold" fill="${colors.yellow}" text-anchor="middle" font-family="Arial">
    BusWay Pro
  </text>
</svg>`;
  
  return svg;
}

function createFeatureGraphic() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient simulation -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.darkBlue};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.primaryBlue};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="1024" height="500" fill="url(#bgGradient)"/>
  
  <!-- Main content area -->
  <rect x="50" y="50" width="450" height="400" rx="20" fill="${colors.yellow}" opacity="0.95"/>
  
  <!-- Bus illustration (left side) -->
  <g transform="translate(80, 120)">
    <rect x="0" y="50" width="220" height="130" rx="15" fill="${colors.primaryBlue}"/>
    <rect x="0" y="0" width="220" height="40" rx="8" fill="${colors.darkGray}"/>
    
    <!-- Windows -->
    <rect x="20" y="8" width="35" height="25" fill="${colors.lightGray}"/>
    <rect x="80" y="8" width="35" height="25" fill="${colors.lightGray}"/>
    <rect x="140" y="8" width="35" height="25" fill="${colors.lightGray}"/>
    
    <rect x="20" y="60" width="30" height="30" fill="${colors.lightGray}"/>
    <rect x="70" y="60" width="30" height="30" fill="${colors.lightGray}"/>
    <rect x="120" y="60" width="30" height="30" fill="${colors.lightGray}"/>
    <rect x="170" y="60" width="30" height="30" fill="${colors.lightGray}"/>
    
    <!-- Wheels -->
    <circle cx="40" cy="190" r="18" fill="${colors.darkGray}"/>
    <circle cx="190" cy="190" r="18" fill="${colors.darkGray}"/>
  </g>
  
  <!-- Text on right side -->
  <text x="600" y="100" font-size="56" font-weight="bold" fill="${colors.white}" font-family="Arial">
    Smart School Bus
  </text>
  <text x="600" y="160" font-size="42" font-weight="bold" fill="${colors.yellow}" font-family="Arial">
    Fee Management
  </text>
  <text x="600" y="220" font-size="28" fill="${colors.lightGray}" font-family="Arial">
    Real-time tracking
  </text>
  <text x="600" y="260" font-size="28" fill="${colors.lightGray}" font-family="Arial">
    Easy payments
  </text>
  <text x="600" y="300" font-size="28" fill="${colors.lightGray}" font-family="Arial">
    Attendance management
  </text>
</svg>`;
  
  return svg;
}

function createScreenshot(number, title, content) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1242" height="2208" viewBox="0 0 1242 2208" xmlns="http://www.w3.org/2000/svg">
  <!-- Status bar -->
  <rect width="1242" height="60" fill="${colors.darkBlue}"/>
  <text x="100" y="40" font-size="24" fill="${colors.white}" font-family="Arial">9:41</text>
  
  <!-- Header -->
  <rect y="60" width="1242" height="120" fill="${colors.primaryBlue}"/>
  <text x="621" y="130" font-size="56" font-weight="bold" fill="${colors.yellow}" text-anchor="middle" font-family="Arial">${title}</text>
  
  <!-- Content area -->
  <rect y="180" width="1242" height="1928" fill="${colors.lightGray}"/>
  
  <!-- Placeholder content boxes -->
  <rect x="60" y="240" width="1122" height="180" rx="15" fill="${colors.white}"/>
  <text x="621" y="350" font-size="32" fill="${colors.darkGray}" text-anchor="middle" font-family="Arial">${content}</text>
  
  <rect x="60" y="460" width="1122" height="180" rx="15" fill="${colors.white}"/>
  <text x="621" y="570" font-size="28" fill="${colors.darkGray}" text-anchor="middle" font-family="Arial">Feature information</text>
  
  <rect x="60" y="680" width="1122" height="180" rx="15" fill="${colors.white}"/>
  <text x="621" y="790" font-size="28" fill="${colors.darkGray}" text-anchor="middle" font-family="Arial">Quick access</text>
  
  <rect x="60" y="900" width="1122" height="180" rx="15" fill="${colors.white}"/>
  <text x="621" y="1010" font-size="28" fill="${colors.darkGray}" text-anchor="middle" font-family="Arial">System info</text>
  
  <rect x="60" y="1120" width="1122" height="180" rx="15" fill="${colors.white}"/>
  <text x="621" y="1230" font-size="28" fill="${colors.darkGray}" text-anchor="middle" font-family="Arial">More details</text>
  
  <!-- Bottom navigation -->
  <rect y="1980" width="1242" height="228" fill="${colors.white}"/>
  <rect x="60" y="2020" width="240" height="140" rx="10" fill="${colors.lightGray}"/>
  <text x="180" y="2105" font-size="24" fill="${colors.darkGray}" text-anchor="middle" font-family="Arial">Home</text>
  
  <rect x="340" y="2020" width="240" height="140" rx="10" fill="${colors.lightGray}"/>
  <text x="460" y="2105" font-size="24" fill="${colors.darkGray}" text-anchor="middle" font-family="Arial">Fees</text>
  
  <rect x="620" y="2020" width="240" height="140" rx="10" fill="${colors.lightGray}"/>
  <text x="740" y="2105" font-size="24" fill="${colors.darkGray}" text-anchor="middle" font-family="Arial">Tracking</text>
  
  <rect x="900" y="2020" width="240" height="140" rx="10" fill="${colors.lightGray}"/>
  <text x="1020" y="2105" font-size="24" fill="${colors.darkGray}" text-anchor="middle" font-family="Arial">More</text>
</svg>`;
  
  return svg;
}

// Create directories if they don't exist
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

// Generate SVG files (will be converted)
console.log('🎨 Generating Play Store images...\n');

// App Icon
const appIconSvg = createAppIcon();
fs.writeFileSync('play-store-assets/app-icon/app_icon_512x512.svg', appIconSvg);
console.log('✅ App Icon SVG created');

// Feature Graphic
const featureGraphicSvg = createFeatureGraphic();
fs.writeFileSync('play-store-assets/feature-graphic/feature_graphic_1024x500.svg', featureGraphicSvg);
console.log('✅ Feature Graphic SVG created');

// Screenshots
const screenshots = [
  { num: 1, title: 'Dashboard', content: 'Real-time Bus Tracking' },
  { num: 2, title: 'Payments', content: 'Easy Fee Management' },
  { num: 3, title: 'Tracking', content: 'Live Location Updates' },
  { num: 4, title: 'Attendance', content: 'Daily Attendance' },
  { num: 5, title: 'Settings', content: 'Manage Your Account' }
];

screenshots.forEach(shot => {
  const svg = createScreenshot(shot.num, shot.title, shot.content);
  fs.writeFileSync(`play-store-assets/screenshots/screenshot_${shot.num}_${shot.title.toLowerCase()}.svg`, svg);
  console.log(`✅ Screenshot ${shot.num} (${shot.title}) SVG created`);
});

console.log('\n📁 SVG files created in play-store-assets/');
console.log('📝 Note: Google Play accepts PNG/JPG. The SVGs are placeholders.');
console.log('\n🔄 To convert SVGs to PNG, you can:');
console.log('  1. Use online converter: https://cloudconvert.com/svg-to-png');
console.log('  2. Use Figma: Open SVG and export as PNG');
console.log('  3. Install ImageMagick and run: convert filename.svg filename.png\n');

console.log('✨ Images ready in play-store-assets/ folders!');
