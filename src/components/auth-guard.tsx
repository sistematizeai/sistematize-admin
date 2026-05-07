'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGuard({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !allowedRoles.includes(user.role))) {
      router.push('/login');
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  if (!user || !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
