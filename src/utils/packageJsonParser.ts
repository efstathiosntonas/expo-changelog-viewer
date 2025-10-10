import { EXPO_MODULES } from './moduleList';

export interface PackageJsonParseResult {
  matched: string[];
  unmatched: string[];
  total: number;
}

/**
 * Parse package.json and extract Expo modules
 */
export function parsePackageJson(content: string): PackageJsonParseResult {
  try {
    const pkg = JSON.parse(content);

    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    /* Extract all expo-* packages */
    const expoPackages = Object.keys(allDeps).filter((name) => name.startsWith('expo-'));

    /* Match against known modules */
    const moduleNames = EXPO_MODULES.map((m) => m.name);
    const matched: string[] = [];
    const unmatched: string[] = [];

    expoPackages.forEach((pkg) => {
      if (moduleNames.includes(pkg)) {
        matched.push(pkg);
      } else {
        unmatched.push(pkg);
      }
    });

    return {
      matched,
      unmatched,
      total: expoPackages.length,
    };
  } catch (error) {
    console.log(error);
    throw new Error('Invalid package.json file');
  }
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
