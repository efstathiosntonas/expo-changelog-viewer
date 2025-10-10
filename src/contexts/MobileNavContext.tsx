import { createContext, useContext, ReactNode, useState } from 'react';

interface MobileNavContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  closeMobileNav: () => void;
}

const MobileNavContext = createContext<MobileNavContextType | null>(null);

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMobileNav = () => setIsOpen(false);

  return (
    <MobileNavContext.Provider value={{ isOpen, setIsOpen, closeMobileNav }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  const context = useContext(MobileNavContext);
  if (!context) {
    throw new Error('useMobileNav must be used within MobileNavProvider');
  }
  return context;
}
