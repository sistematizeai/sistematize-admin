'use client';

import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', roles: ['master_admin', 'sub_admin'] },
  { label: 'Empresas', path: '/dashboard/businesses', roles: ['master_admin', 'sub_admin'] },
  { label: 'Planos', path: '/dashboard/plans', roles: ['master_admin', 'sub_admin'] },
  { label: 'Assinaturas', path: '/dashboard/subscriptions', roles: ['master_admin', 'sub_admin'] },
  { label: 'Modulos', path: '/dashboard/modules', roles: ['master_admin', 'sub_admin'] },
  { label: 'Usuarios', path: '/dashboard/users', roles: ['master_admin', 'sub_admin'] },
  { label: 'Auditoria', path: '/dashboard/audit', roles: ['master_admin'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const userRole = user?.role || 'sub_admin';
  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <AuthGuard allowedRoles={['master_admin', 'sub_admin']}>
      <div className="min-h-screen bg-[var(--color-bg-deep)]">
        {/* TOPBAR */}
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white grid grid-cols-[auto_1fr_auto] items-center px-7">
          <div className="flex items-center gap-3">
            <img
              src="/logo-sistematize.png"
              alt="Sistematize"
              style={{ height: '30px', width: 'auto' }}
              draggable={false}
            />
            <span className="text-[11px] font-bold text-[var(--color-accent)] bg-[var(--color-accent-soft)] px-2 py-0.5 rounded-md uppercase tracking-wider">
              Admin
            </span>
          </div>

          <nav className="flex items-center justify-center gap-1">
            {visibleNav.map(item => {
              const isActive = item.path === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`px-4 py-2.5 rounded-xl text-[15px] font-medium cursor-pointer transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-[var(--color-accent)] bg-[var(--color-accent-soft)] font-semibold'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/[0.03]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleLogout}
              title="Sair"
              className="w-[38px] h-[38px] rounded-full flex items-center justify-center cursor-pointer transition-all bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-rose)] hover:bg-[var(--color-rose-soft)]"
            >
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-text-secondary)"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        {/* MAIN */}
        <main className="pt-16 min-h-screen">
          <div className="p-6 px-7">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
