import { SDK_VERSIONS } from '@/utils/moduleList.ts';

export interface SDKVersion {
  value: string;
  label: string;
}

/**
 * Simple hook that returns static SDK versions
 * No API calls, no rate limiting issues
 */
export function useSDKBranches() {
  const defaultBranch = SDK_VERSIONS[0]?.value ?? 'main';

  return {
    sdkVersions: SDK_VERSIONS,
    defaultBranch,
    loading: false,
    error: null,
  };
}
