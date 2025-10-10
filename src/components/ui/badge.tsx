import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils.ts';
import { badgeVariants } from './badge.variants';
import { HTMLAttributes } from 'react';

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
