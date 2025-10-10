import { useContext } from 'react';

import { ChangelogContext } from '@/contexts/ChangelogContext.context';

export function useChangelogContext() {
  const context = useContext(ChangelogContext);
  if (!context) {
    throw new Error('useChangelogContext must be used within ChangelogProvider');
  }
  return context;
}
