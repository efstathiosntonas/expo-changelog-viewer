import { useEffect, useRef } from 'react';

import { Menu } from 'lucide-react';

import { useMobileNav } from '@/contexts/MobileNavContext';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';

import { SidebarContent } from './SidebarContent';

export function MobileNav() {
  const { isOpen, setIsOpen } = useMobileNav();
  const triggerRef = useRef<HTMLButtonElement>(null);

  /* Focus management: restore focus to trigger when sheet closes */
  useEffect(() => {
    if (!isOpen && triggerRef.current && document.activeElement === document.body) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="banner"
      >
        <Button
          aria-controls="mobile-navigation"
          aria-expanded={isOpen}
          aria-label="Open navigation menu"
          onClick={() => setIsOpen(true)}
          ref={triggerRef}
          size="icon"
          variant="ghost"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <h1 className="text-lg font-semibold">Expo Changelogs Viewer</h1>
      </header>

      <Sheet onOpenChange={setIsOpen} open={isOpen}>
        <SheetContent
          aria-label="Navigation menu"
          className="w-[85vw] sm:w-[385px] p-0 bg-[hsl(var(--background))] flex flex-col"
          id="mobile-navigation"
          role="dialog"
          side="left"
        >
          <div aria-label="Module selection" className="overflow-y-auto flex-1" role="navigation">
            <SidebarContent isMobile />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
