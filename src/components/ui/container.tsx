import type { ElementType, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  width?: 'default' | 'narrow';
}

/** The single source of horizontal rhythm — page sections never set their own max-width. */
export function Container({
  as: Component = 'div',
  width = 'default',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto w-full px-5 sm:px-8',
        width === 'narrow' ? 'max-w-3xl' : 'max-w-6xl',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
