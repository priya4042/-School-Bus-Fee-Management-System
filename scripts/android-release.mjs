import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = process.cwd();
const androidDir = path.join(projectRoot, 'android');
const mode = process.argv[2] === 'apk' ? 'apk' : 'bundle';

const getJavaMajorFromHome = (javaHome) => {
  const javaExe = path.join(javaHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
  if (!fs.existsSync(javaExe)) return 0;

  const result = spawnSync(javaExe, ['-version'], {
    encoding: 'utf8',
  });

  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  const match = output.match(/version\s+"(\d+)(?:\.(\d+))?/i);
  if (!match) return 0;

  const major = Number(match[1] || 0);
  if (major === 1) {
    return Number(match[2] || 0);
  }
  return major;
};

const hasJavaInPath = () => {
  const result = spawnSync('java', ['-version'], {
    stdio: 'ignore',
    shell: true,
  });
  return result.status === 0;
};

const findWindowsJavaHome = () => {
  const candidates = [
    'C:\\Program Files\\Microsoft',
    'C:\\Program Files\\Java',
    'C:\\Program Files (x86)\\Java',
  ];

  let bestHome = '';
  let bestMajor = 0;

  for (const base of candidates) {
    if (!fs.existsSync(base)) continue;

    try {
      const dirs = fs
        .readdirSync(base, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) => /^jdk-?|^jre-?/i.test(name));

      for (const dir of dirs) {
        const home = path.join(base, dir);
        const major = getJavaMajorFromHome(home);
        if (major > bestMajor) {
          bestMajor = major;
          bestHome = home;
        }
      }
    } catch {
      // Continue fallback search.
    }
  }

  return bestHome;
};

const resolveJavaHome = () => {
  const fromEnv = String(process.env.JAVA_HOME || '').trim();
  if (fromEnv) {
    const major = getJavaMajorFromHome(fromEnv);
    if (major >= 21) return fromEnv;
  }

  if (process.platform === 'win32') {
    return findWindowsJavaHome();
  }

  return '';
};

const runStep = (label, command, args, cwd, env) => {
  console.log(`\n[Android Release] ${label}`);
  const result = spawnSync(command, args, {
    cwd,
    env,
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
};

if (!fs.existsSync(androidDir)) {
  console.error('[Android Release] android/ project is missing. Run npx cap add android first.');
  process.exit(1);
}

const env = { ...process.env };
const javaHome = resolveJavaHome();

if (javaHome) {
  env.JAVA_HOME = javaHome;
  const javaBin = path.join(javaHome, 'bin');
  env.Path = `${javaBin};${env.Path || ''}`;
  env.PATH = env.Path;
  console.log(`[Android Release] Using JAVA_HOME=${javaHome}`);
} else if (!hasJavaInPath()) {
  console.error('[Android Release] Java 21 was not detected. Install Java 21 and configure JAVA_HOME.');
  process.exit(1);
}

runStep('Release precheck', 'npm', ['run', 'release:check'], projectRoot, env);
runStep('Web production build', 'npm', ['run', 'build'], projectRoot, env);
runStep('Capacitor Android sync', 'npx', ['cap', 'sync', 'android'], projectRoot, env);

if (mode === 'apk') {
  runStep('Gradle assembleRelease', 'gradlew.bat', ['assembleRelease'], androidDir, env);
} else {
  runStep('Gradle bundleRelease', 'gradlew.bat', ['bundleRelease'], androidDir, env);
}
