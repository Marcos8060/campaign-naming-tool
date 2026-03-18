'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/lib/store';
import { useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      })
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
