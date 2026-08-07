import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { AuthProvider } from '@/features/auth/auth-provider';
import { I18nProvider } from '@/i18n/i18n-provider';
import { queryClient } from '@/lib/query-client';
import { ThemeProvider } from '@/theme/theme-provider';
import { router } from '@/router';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root is missing from index.html.');
}

createRoot(container).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        {/* AuthProvider sits inside QueryClientProvider — it is built on queries. */}
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
);
