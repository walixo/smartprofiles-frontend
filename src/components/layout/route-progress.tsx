import { useEffect, useState } from 'react';
import { useNavigation } from 'react-router';

/** Below this, a navigation is imperceptible and a flashing bar is worse than nothing. */
const SHOW_AFTER_MS = 150;

/**
 * Slim progress bar for route transitions.
 *
 * Route chunks resolve before the view swaps, so without this a slow chunk
 * looks like a dead click. It creeps toward 90% rather than completing, since
 * the real duration is unknown, then snaps to 100% on arrival.
 */
export function RouteProgress() {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== 'idle';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isNavigating) {
      setIsVisible(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setIsVisible(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [isNavigating]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
      // Announced by the route's own heading on arrival; a live region here
      // would just talk over it.
    >
      <div
        className="h-full bg-brand-500 transition-[width,opacity] duration-300 ease-out"
        style={{
          width: isVisible ? '90%' : isNavigating ? '0%' : '100%',
          opacity: isVisible || isNavigating ? 1 : 0,
        }}
      />
    </div>
  );
}
