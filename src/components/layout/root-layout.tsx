import { Outlet } from 'react-router';
import { SkipLink } from '@/components/ui/skip-link';
import { RouteProgress } from './route-progress';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

const MAIN_ID = 'main-content';

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <RouteProgress />
      <SkipLink targetId={MAIN_ID} />
      <SiteHeader />
      <main id={MAIN_ID} tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
