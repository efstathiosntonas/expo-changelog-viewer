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
            <button
              aria-label="Show help information"
              className="text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              <HelpCircle aria-hidden="true" className={className} />
              <span className="sr-only">Help</span>
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs" role="tooltip">
            {children}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Mobile: Popover (tap) */}
      <div className="md:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <button
              aria-haspopup="dialog"
              aria-label="Show help information"
              className="text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              <HelpCircle aria-hidden="true" className={className} />
              <span className="sr-only">Help</span>
            </button>
          </PopoverTrigger>
          <PopoverContent aria-label="Help information" className="text-base" role="dialog">
            {children}
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
