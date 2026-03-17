import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = process.cwd();

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, 'utf8');
  const result = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    result[key] = value;
  }

  return result;
};

const parsePropertiesFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, 'utf8');
  const result = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    result[key] = value;
  }

  return result;
};

const envFilePath = path.join(projectRoot, '.env.production');
const envValues = parseEnvFile(envFilePath);
const issues = [];
const warnings = [];

const requiredKeys = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_APP_URL',
  'VITE_AUTH_REDIRECT_URL',
  'VITE_RAZORPAY_KEY_ID',
  'VITE_GOOGLE_MAPS_API_KEY',
];

const placeholderPatterns = [
  'your_',
  'your-project',
  'example.com',
  'localhost',
  'replace-me',
  'changeme',
];

for (const key of requiredKeys) {
  const value = String(envValues[key] || '').trim();
  if (!value) {
    issues.push(`Missing required release variable: ${key}`);
    continue;
  }

  const normalized = value.toLowerCase();
  if (placeholderPatterns.some((pattern) => normalized.includes(pattern))) {
    issues.push(`Release variable still looks like a placeholder: ${key}=${value}`);
  }
}

const keystorePropertiesPath = path.join(projectRoot, 'android', 'keystore.properties');
const keystoreProps = parsePropertiesFile(keystorePropertiesPath);
if (!fs.existsSync(keystorePropertiesPath)) {
  issues.push('android/keystore.properties is missing. Signed Play Store bundle cannot be created yet.');
} else {
  const requiredSigningKeys = ['storeFile', 'storePassword', 'keyAlias', 'keyPassword'];
  for (const key of requiredSigningKeys) {
    const value = String(keystoreProps[key] || '').trim();
    if (!value) {
      issues.push(`android/keystore.properties is missing: ${key}`);
      continue;
    }
    if (value.toLowerCase().includes('change_me')) {
      issues.push(`android/keystore.properties still contains placeholder for ${key}`);
    }
  }

  const storeFileRaw = String(keystoreProps.storeFile || '').trim();
  if (storeFileRaw) {
    // Keep this aligned with android/app/build.gradle: file(...) resolves from android/app module.
    const resolvedStoreFile = path.resolve(projectRoot, 'android', 'app', storeFileRaw);
    if (!fs.existsSync(resolvedStoreFile)) {
      issues.push(`Keystore file does not exist at configured path: ${storeFileRaw}`);
    }
  }
}

const javaHome = String(process.env.JAVA_HOME || '').trim();
const javaCheck = spawnSync('java', ['-version'], { encoding: 'utf8', shell: true });
if (!javaHome && javaCheck.status !== 0) {
  issues.push('Java is not available. Install Java 17 and set JAVA_HOME before release build.');
}

const androidDir = path.join(projectRoot, 'android');
if (!fs.existsSync(androidDir)) {
  issues.push('android/ project is missing. Run npx cap add android first.');
}

const localPropertiesPath = path.join(projectRoot, 'android', 'local.properties');
const localProperties = parsePropertiesFile(localPropertiesPath);
const sdkDirFromEnv = String(process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || '').trim();
const sdkDirFromLocal = String(localProperties['sdk.dir'] || '').replace(/\\\\/g, '\\').trim();
const resolvedSdkDir = sdkDirFromEnv || sdkDirFromLocal;

if (!resolvedSdkDir) {
  issues.push('Android SDK path not configured. Set ANDROID_HOME or android/local.properties (sdk.dir=...).');
} else if (!fs.existsSync(resolvedSdkDir)) {
  issues.push(`Android SDK path is invalid: ${resolvedSdkDir}`);
}

const printList = (title, list) => {
  if (list.length === 0) return;
  console.log(`\n${title}`);
  for (const item of list) {
    console.log(`- ${item}`);
  }
};

printList('Release blockers', issues);
printList('Release warnings', warnings);

if (issues.length > 0) {
  console.error('\nRelease precheck failed. Resolve blockers before building a release bundle.');
  process.exit(1);
}

console.log('\nRelease precheck passed.');
if (warnings.length > 0) {
  console.log('Warnings remain, but they do not block the web build step.');
}