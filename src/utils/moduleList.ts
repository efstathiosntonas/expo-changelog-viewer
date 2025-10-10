export interface ExpoModule {
  name: string;
  category: string;
}

export const EXPO_MODULES: ExpoModule[] = [
  /* Media & Audio */
  { name: 'expo-audio', category: 'Media & Audio' },
  { name: 'expo-av', category: 'Media & Audio' },
  { name: 'expo-camera', category: 'Media & Audio' },
  { name: 'expo-image', category: 'Media & Audio' },
  { name: 'expo-image-loader', category: 'Media & Audio' },
  { name: 'expo-image-manipulator', category: 'Media & Audio' },
  { name: 'expo-image-picker', category: 'Media & Audio' },
  { name: 'expo-live-photo', category: 'Media & Audio' },
  { name: 'expo-media-library', category: 'Media & Audio' },

  /* Device & Sensors */
  { name: 'expo-battery', category: 'Device & Sensors' },
  { name: 'expo-brightness', category: 'Device & Sensors' },
  { name: 'expo-device', category: 'Device & Sensors' },
  { name: 'expo-haptics', category: 'Device & Sensors' },

  /* Location & Maps */
  { name: 'expo-location', category: 'Location & Maps' },
  { name: 'expo-maps', category: 'Location & Maps' },

  /* Authentication & Security */
  { name: 'expo-app-integrity', category: 'Authentication & Security' },
  { name: 'expo-apple-authentication', category: 'Authentication & Security' },
  { name: 'expo-auth-session', category: 'Authentication & Security' },
  { name: 'expo-crypto', category: 'Authentication & Security' },
  { name: 'expo-local-authentication', category: 'Authentication & Security' },

  /* File System & Storage */
  { name: 'expo-asset', category: 'File System & Storage' },
  { name: 'expo-document-picker', category: 'File System & Storage' },
  { name: 'expo-file-system', category: 'File System & Storage' },

  /* Communication */
  { name: 'expo-contacts', category: 'Communication' },
  { name: 'expo-mail-composer', category: 'Communication' },

  /* Navigation & Routing */
  { name: 'expo-linking', category: 'Navigation & Routing' },

  /* Background Tasks */
  { name: 'expo-background-fetch', category: 'Background Tasks' },
  { name: 'expo-background-task', category: 'Background Tasks' },

  /* Notifications & Updates */
  { name: 'expo-notifications', category: 'Notifications & Updates' },

  /* UI Components */
  { name: 'expo-blur', category: 'UI Components' },
  { name: 'expo-checkbox', category: 'UI Components' },
  { name: 'expo-glass-effect', category: 'UI Components' },
  { name: 'expo-linear-gradient', category: 'UI Components' },
  { name: 'expo-mesh-gradient', category: 'UI Components' },
  { name: 'expo-navigation-bar', category: 'UI Components' },

  /* Graphics & GL */
  { name: 'expo-gl', category: 'Graphics & GL' },
  { name: 'expo-processing', category: 'Graphics & GL' },

  /* System & Configuration */
  { name: 'expo-application', category: 'System & Configuration' },
  { name: 'expo-build-properties', category: 'System & Configuration' },
  { name: 'expo-calendar', category: 'System & Configuration' },
  { name: 'expo-cellular', category: 'System & Configuration' },
  { name: 'expo-clipboard', category: 'System & Configuration' },
  { name: 'expo-constants', category: 'System & Configuration' },
  { name: 'expo-doctor', category: 'System & Configuration' },
  { name: 'expo-env-info', category: 'System & Configuration' },
  { name: 'expo-font', category: 'System & Configuration' },
  { name: 'expo-insights', category: 'System & Configuration' },
  { name: 'expo-intent-launcher', category: 'System & Configuration' },
  { name: 'expo-json-utils', category: 'System & Configuration' },
  { name: 'expo-keep-awake', category: 'System & Configuration' },
  { name: 'expo-localization', category: 'System & Configuration' },
  { name: 'expo-manifests', category: 'System & Configuration' },
  { name: 'expo-network', category: 'System & Configuration' },
  { name: 'expo-network-addons', category: 'System & Configuration' },
  { name: 'expo-print', category: 'System & Configuration' },

  /* Development & Core */
  { name: 'expo-blob', category: 'Development & Core' },
  { name: 'expo-dev-client', category: 'Development & Core' },
  { name: 'expo-dev-client-components', category: 'Development & Core' },
  { name: 'expo-dev-launcher', category: 'Development & Core' },
  { name: 'expo-dev-menu', category: 'Development & Core' },
  { name: 'expo-dev-menu-interface', category: 'Development & Core' },
  { name: 'expo-eas-client', category: 'Development & Core' },
  { name: 'expo-modules-autolinking', category: 'Development & Core' },
  { name: 'expo-modules-core', category: 'Development & Core' },
];

export const CATEGORIES = Array.from(new Set(EXPO_MODULES.map((m) => m.category))).sort();

export const SDK_VERSIONS = [
  { value: 'main', label: '🔥 Next (unversioned)' },
  { value: 'sdk-54', label: 'SDK 54 (latest)' },
  { value: 'sdk-53', label: 'SDK 53' },
  { value: 'sdk-52', label: 'SDK 52' },
  { value: 'sdk-51', label: 'SDK 51' },
  { value: 'sdk-50', label: 'SDK 50' },
  { value: 'sdk-49', label: 'SDK 49' },
  { value: 'sdk-48', label: 'SDK 48' },
  { value: 'sdk-47', label: 'SDK 47' },
  { value: 'sdk-46', label: 'SDK 46' },
  { value: 'sdk-45', label: 'SDK 45' },
  { value: 'sdk-44', label: 'SDK 44' },
  { value: 'sdk-43', label: 'SDK 43' },
  { value: 'sdk-42', label: 'SDK 42' },
  { value: 'sdk-41', label: 'SDK 41' },
  { value: 'sdk-40', label: 'SDK 40' },
];
