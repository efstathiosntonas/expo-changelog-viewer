import { Menu } from 'lucide-react';

import { useMobileNav } from '@/contexts/MobileNavContext';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';

import { SidebarContent } from './SidebarContent';

export function MobileNav() {
  const { isOpen, setIsOpen } = useMobileNav();

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button onClick={() => setIsOpen(true)} size="icon" variant="ghost">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <h1 className="text-lg font-semibold">Expo Changelogs Viewer</h1>
      </div>

      <Sheet onOpenChange={setIsOpen} open={isOpen}>
        <SheetContent
          className="w-[85vw] sm:w-[385px] p-0 bg-[hsl(var(--background))] flex flex-col"
          side="left"
        >
          <div className="overflow-y-auto flex-1">
            <SidebarContent isMobile />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
