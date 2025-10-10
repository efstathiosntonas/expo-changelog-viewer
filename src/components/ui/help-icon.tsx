import { ReactNode } from 'react';

import { HelpCircle } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HelpIconProps {
  children: ReactNode;
  className?: string;
}

/**
 * Help icon that shows tooltip on desktop (hover) and popover on mobile (tap)
 */
export function HelpIcon({ children, className = 'h-3.5 w-3.5' }: HelpIconProps) {
  return (
    <>
      {/* Desktop: Tooltip (hover) */}
      <div className="hidden md:block">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors" type="button">
              <HelpCircle className={className} />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{children}</TooltipContent>
        </Tooltip>
      </div>

      {/* Mobile: Popover (tap) */}
      <div className="md:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors" type="button">
              <HelpCircle className={className} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="text-base">{children}</PopoverContent>
        </Popover>
      </div>
    </>
  );
}
