import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';

export interface AuthLayoutProps {
  title: string;
  subtitle: string;
  illustration: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

/**
 * Split layout shared by sign-in and sign-up.
 *
 * The illustration panel is hidden below `lg` rather than shrunk — a squeezed
 * illustration above a form just pushes the fields off a phone screen.
 */
export function AuthLayout({ title, subtitle, illustration, children, footer }: AuthLayoutProps) {
  return (
    <Container className="py-12 sm:py-16">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="animate-fade-in order-last hidden lg:block">
          <div className="relative rounded-5xl bg-sand-100 p-10 dark:bg-ink-900/50">{illustration}</div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="animate-fade-up">
            <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-sand-50">
              {title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-600 dark:text-ink-300">{subtitle}</p>
          </div>

          <div className="animate-fade-up mt-8" style={{ animationDelay: '90ms' }}>
            {children}
          </div>

          <div
            className="animate-fade-up mt-8 text-center text-sm text-ink-600 dark:text-ink-300"
            style={{ animationDelay: '160ms' }}
          >
            {footer}
          </div>
        </div>
      </div>
    </Container>
  );
}
