'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { ToastProvider } from '@/components/ui/Toast';

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient();
  return (browserQueryClient ??= makeQueryClient());
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const pathname = usePathname();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (
      pathname === '/' ||
      pathname === '/login' ||
      pathname === '/register' ||
      pathname === '/manifesto' ||
      pathname === '/privacy'
    ) {
      setUser(null);
      return;
    }

    checkAuth();
  }, [checkAuth, pathname, setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
}
