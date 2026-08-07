import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/components/layout/root-layout';
import { RequireAuth, RequireGuest } from '@/features/auth/components/route-guards';
import { RouteErrorPage } from '@/pages/route-error-page';

/**
 * Page components are loaded per route.
 *
 * React Router's own `lazy` is used rather than `React.lazy` + Suspense: it
 * resolves the chunk *before* swapping the view, so navigation never flashes a
 * skeleton in place of content the user is already reading. `<RouteProgress>`
 * in the layout reports the wait.
 *
 * `RootLayout` and `RouteErrorPage` stay eager on purpose — the layout is on
 * every route, and the error page is what has to render when a chunk fails to
 * load, so it cannot itself be a chunk.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/pages/home-page')).HomePage }),
      },
      {
        path: 'browse',
        lazy: async () => ({
          Component: (await import('@/features/browse/pages/browse-page')).BrowsePage,
        }),
      },
      {
        // Signed-in users have no business on these screens.
        element: <RequireGuest />,
        children: [
          {
            path: 'signin',
            lazy: async () => ({
              Component: (await import('@/features/auth/pages/sign-in-page')).SignInPage,
            }),
          },
          {
            path: 'signup',
            lazy: async () => ({
              Component: (await import('@/features/auth/pages/sign-up-page')).SignUpPage,
            }),
          },
        ],
      },
      {
        // The editor is the only authenticated surface so far.
        element: <RequireAuth />,
        children: [
          {
            path: 'me',
            lazy: async () => ({
              Component: (await import('@/features/profiles/pages/profile-editor-page')).ProfileEditorPage,
            }),
          },
          {
            path: 'messages',
            lazy: async () => ({
              Component: (await import('@/features/chat/pages/messages-page')).MessagesPage,
            }),
          },
          {
            // Same component; the thread id just selects which conversation is open.
            path: 'messages/:threadId',
            lazy: async () => ({
              Component: (await import('@/features/chat/pages/messages-page')).MessagesPage,
            }),
          },
        ],
      },
      {
        // React Router requires a dynamic segment to span a whole path segment,
        // so `/@handle` cannot be expressed as `/@:handle`. This matches any
        // single root segment and the page renders its not-found state for
        // anything that does not begin with `@`. Static routes above still win,
        // because React Router ranks static segments over dynamic ones.
        path: ':handle',
        lazy: async () => ({
          Component: (await import('@/features/profiles/pages/public-profile-page')).PublicProfilePage,
        }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/pages/not-found-page')).NotFoundPage }),
      },
    ],
  },
]);
