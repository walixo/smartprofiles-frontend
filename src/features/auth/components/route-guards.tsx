import { Navigate, Outlet, useLocation } from 'react-router';
import { SpinnerIcon } from '@/components/ui/icons';
import { useI18n } from '@/i18n/i18n-provider';
import { NotFoundPage } from '@/pages/not-found-page';
import type { Role } from '@/shared/vocabulary';
import { useAuth } from '../auth-provider';

/** Blocks a route until a session resolves; sends anonymous visitors to sign in. */
export function RequireAuth() {
  const { isAuthenticated, isResolving } = useAuth();
  const location = useLocation();

  if (isResolving) return <SessionPending />;

  if (!isAuthenticated) {
    // Remember where they were headed so sign-in can return them there.
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

/**
 * Restricts a route to specific roles.
 *
 * A signed-in user without the role gets the 404 page, not a "forbidden"
 * screen — confirming that `/admin` exists to someone who cannot use it is
 * information they do not need.
 */
export function RequireRole({ roles }: { roles: Role[] }) {
  const { user, isAuthenticated, isResolving } = useAuth();
  const location = useLocation();

  if (isResolving) return <SessionPending />;

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (!user || !roles.includes(user.role)) {
    // Rendered in place rather than redirected: a redirect to a "not found"
    // path both invents a route and, mid session-resolution, can bounce
    // through the guest guard back to the home page. This keeps the URL and
    // simply refuses to reveal that the route exists.
    return <NotFoundPage />;
  }

  return <Outlet />;
}

/** Keeps signed-in users off the sign-in and sign-up screens. */
export function RequireGuest() {
  const { isAuthenticated, isResolving } = useAuth();

  if (isResolving) return <SessionPending />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
}

function SessionPending() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="flex items-center gap-3 text-sm font-medium text-ink-500 dark:text-ink-400">
        <SpinnerIcon size={18} className="animate-spin" />
        {t('common.loading')}
      </span>
    </div>
  );
}
